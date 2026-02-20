import { Effect, Layer, Schema } from "effect";
import { add, EUR, type Monetary, monetary, multiply, type ScaledAmount, subtract } from "@autonomynexus/monetary";
import type { AccountBalance } from "../models";
import {
  AccountingDataPort,
  AccountingDataError,
  UrssafRatesPort,
  RateNotFoundError,
} from "../ports";
import type {
  ComputeUrssafDeclarationInput,
  RevenueBreakdown,
  UrssafContributions,
  UrssafDeclarationResult,
} from "./models";
import { getAcreRateType } from "./rates";

// ============================================================================
// Tagged Errors
// ============================================================================

export class NoRevenueDataError extends Schema.TaggedError<NoRevenueDataError>()(
  "NoRevenueDataError",
  {
    period: Schema.Unknown,
  },
) {}

// ============================================================================
// Service Interface
// ============================================================================

export type UrssafServiceInterface = {
  readonly computeDeclaration: (
    input: ComputeUrssafDeclarationInput,
  ) => Effect.Effect<
    UrssafDeclarationResult,
    NoRevenueDataError | RateNotFoundError | AccountingDataError
  >;

  readonly computeDeclarationsBatch: (
    inputs: readonly ComputeUrssafDeclarationInput[],
  ) => Effect.Effect<
    readonly UrssafDeclarationResult[],
    NoRevenueDataError | RateNotFoundError | AccountingDataError
  >;

  readonly getRevenueBreakdown: (
    input: Pick<ComputeUrssafDeclarationInput, "userId" | "period">,
  ) => Effect.Effect<RevenueBreakdown, AccountingDataError>;
};

// ============================================================================
// Service Tag
// ============================================================================

export class UrssafService extends Effect.Tag("@accounting/UrssafService")<
  UrssafService,
  UrssafServiceInterface
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const UrssafServiceLayer = Layer.effect(
  UrssafService,
  Effect.gen(function* () {
    const dataPort = yield* AccountingDataPort;
    const ratesPort = yield* UrssafRatesPort;

    const zeroMonetary = (): Monetary<number> => monetary({ amount: 0, currency: EUR });

    const sumBalances = (balances: AccountBalance[], isRevenueClass: boolean): Monetary<number> => {
      let total = zeroMonetary();
      for (const b of balances) {
        const balance = isRevenueClass
          ? subtract(b.creditTotal, b.debitTotal)
          : subtract(b.debitTotal, b.creditTotal);
        total = add(total, balance);
      }
      return total;
    };

    const applyRate = (base: Monetary<number>, rate: ScaledAmount<number>): Monetary<number> =>
      multiply(base, rate);

    const getRevenueBreakdown: UrssafServiceInterface["getRevenueBreakdown"] = (input) =>
      Effect.gen(function* () {
        const { userId, period } = input;

        const [revenueBalances, expenseBalances] = yield* Effect.all([
          dataPort.getAccountBalancesByClass(userId, period, 7),
          dataPort.getAccountBalancesByClass(userId, period, 6),
        ]);

        return {
          revenueTotal: sumBalances(revenueBalances, true),
          expenseTotal: sumBalances(expenseBalances, false),
        };
      });

    const computeDeclaration: UrssafServiceInterface["computeDeclaration"] = (input) =>
      Effect.gen(function* () {
        const { userId, period, activityType, hasAcre, hasVersementLiberatoire, regimeCode } =
          input;

        const revenue = yield* getRevenueBreakdown({ userId, period });

        const declarationBase =
          regimeCode === "micro"
            ? revenue.revenueTotal
            : subtract(revenue.revenueTotal, revenue.expenseTotal);

        const rateDate = period.startDate;
        const contributionRateType = getAcreRateType(hasAcre);

        const [urssafRate, cfpRate, vlRate] = yield* Effect.all([
          ratesPort.getRate(activityType, contributionRateType, rateDate),
          ratesPort.getRate(activityType, "cfp", rateDate),
          hasVersementLiberatoire
            ? ratesPort.getRate(activityType, "versement_liberatoire", rateDate)
            : Effect.succeed(null as ScaledAmount<number> | null),
        ]);

        const baseContribution = applyRate(declarationBase, urssafRate);
        const cfpContribution = applyRate(declarationBase, cfpRate);
        const versementLiberatoire = vlRate ? applyRate(declarationBase, vlRate) : null;

        let totalContribution = add(baseContribution, cfpContribution);
        if (versementLiberatoire) {
          totalContribution = add(totalContribution, versementLiberatoire);
        }

        const contributions: UrssafContributions = {
          baseContribution,
          cfpContribution,
          versementLiberatoire,
          totalContribution,
        };

        return {
          period,
          activityType,
          hasAcre,
          regimeCode,
          revenue,
          contributions,
          declarationBase,
        };
      });

    const computeDeclarationsBatch: UrssafServiceInterface["computeDeclarationsBatch"] = (inputs) =>
      Effect.gen(function* () {
        if (inputs.length === 0) return [];

        const first = inputs[0];
        if (!first) return [];

        const earliestDate = inputs.reduce(
          (min, i) => (i.period.startDate < min ? i.period.startDate : min),
          first.period.startDate,
        );

        const needsBaseRate = inputs.some((i) => !i.hasAcre);
        const needsAcreRate = inputs.some((i) => i.hasAcre);

        const ratePromises: Effect.Effect<ScaledAmount<number>, RateNotFoundError>[] = [];
        const rateKeys: string[] = [];

        if (needsBaseRate) {
          ratePromises.push(ratesPort.getRate(first.activityType, "base", earliestDate));
          rateKeys.push("base");
        }
        if (needsAcreRate) {
          ratePromises.push(ratesPort.getRate(first.activityType, "acre_year1", earliestDate));
          rateKeys.push("acre_year1");
        }
        ratePromises.push(ratesPort.getRate(first.activityType, "cfp", earliestDate));
        rateKeys.push("cfp");

        if (inputs.some((i) => i.hasVersementLiberatoire)) {
          ratePromises.push(
            ratesPort.getRate(first.activityType, "versement_liberatoire", earliestDate),
          );
          rateKeys.push("versement_liberatoire");
        }

        const rateValues = yield* Effect.all(ratePromises);
        const rateMap = new Map<string, ScaledAmount<number>>();
        for (let i = 0; i < rateKeys.length; i++) {
          const key = rateKeys[i];
          const value = rateValues[i];
          if (key && value) {
            rateMap.set(key, value);
          }
        }

        const revenueBreakdowns = yield* Effect.all(
          inputs.map((input) =>
            getRevenueBreakdown({
              userId: input.userId,
              period: input.period,
            }),
          ),
          { concurrency: "unbounded" },
        );

        const results: UrssafDeclarationResult[] = inputs.map((input, i) => {
          const revenue = revenueBreakdowns[i];
          if (!revenue) {
            throw new NoRevenueDataError({ period: input.period });
          }

          const declarationBase =
            input.regimeCode === "micro"
              ? revenue.revenueTotal
              : subtract(revenue.revenueTotal, revenue.expenseTotal);

          const contributionRateType = getAcreRateType(input.hasAcre);
          const urssafRate = rateMap.get(contributionRateType);
          const cfpRate = rateMap.get("cfp");
          if (!(urssafRate && cfpRate)) {
            throw new AccountingDataError({
              operation: "getRate",
              details: "Rate not found in batch cache",
            });
          }
          const vlRate = input.hasVersementLiberatoire
            ? (rateMap.get("versement_liberatoire") ?? null)
            : null;

          const baseContribution = applyRate(declarationBase, urssafRate);
          const cfpContribution = applyRate(declarationBase, cfpRate);
          const versementLiberatoire = vlRate ? applyRate(declarationBase, vlRate) : null;

          let totalContribution = add(baseContribution, cfpContribution);
          if (versementLiberatoire) {
            totalContribution = add(totalContribution, versementLiberatoire);
          }

          return {
            period: input.period,
            activityType: input.activityType,
            hasAcre: input.hasAcre,
            regimeCode: input.regimeCode,
            revenue,
            contributions: {
              baseContribution,
              cfpContribution,
              versementLiberatoire,
              totalContribution,
            },
            declarationBase,
          };
        });

        return results;
      });

    return UrssafService.of({
      computeDeclaration,
      computeDeclarationsBatch,
      getRevenueBreakdown,
    });
  }),
);
