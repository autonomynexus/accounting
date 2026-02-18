# @autonomynexus/accounting

The canonical French freelancer and small company accounting engine. Handles VAT declarations (CA3/CA12), URSSAF contributions, threshold monitoring, financial statements, and Plan Comptable Général (PCG) — with zero infrastructure dependencies.

## Why this exists

French accounting for freelancers (EI, micro-entreprise) and small companies (EURL, SASU, SAS) involves a maze of tax regimes, URSSAF rates, VAT thresholds, and filing obligations. This package encodes all of that as pure TypeScript — no database, no framework, no runtime dependencies beyond [Effect](https://effect.website) and [monetary](https://github.com/autonomynexus/monetary-lib).

**Use it to:**
- **Generate CA3 and CA12 VAT declarations** from journal entry data (monthly + annual simplified)
- **Generate VAT annexes**: 3310-A (taxes assimilées), 3310-TER (secteurs distincts), 3310-TIC (accises énergétiques)
- Compute URSSAF contributions with ACRE support
- Monitor micro-entreprise revenue thresholds
- Calculate VAT (HT↔TTC conversions, rate lookups, DOM-TOM support)
- Build balance sheets and income statements
- Access the full PCG chart of accounts for freelancers and small companies

## Architecture

**Ports & Adapters.** Services define what data they need through ports (interfaces). You provide adapters — from a database, from static data, from an API, whatever.

```
┌─────────────────────────────────┐
│   @autonomynexus/accounting     │
│                                 │
│  Generators ──→ JournalDataPort │
│  Services  ──→ AccountingDataPort
│  Models, Rules, Calculations    │
│  PCG, Rates, Thresholds         │
└─────────────┬───────────────────┘
              │ you provide
┌─────────────▼───────────────────┐
│  Your Adapters                  │
│  (Drizzle, Prisma, static, ..) │
└─────────────────────────────────┘
```

**Effect-based.** Services use [Effect](https://effect.website) for dependency injection and error handling. If you don't use Effect, the models, calculations, and reference data are all plain TypeScript — use those directly.

## Install

```bash
bun add @autonomynexus/accounting
# peer dependency
bun add monetary
```

## Quick Start

### Pure calculations (no Effect needed)

```ts
import {
  calculateHTFromTTC,
  calculateTTCFromHT,
  FRENCH_VAT_RATES,
  getVatInfo,
  PCG_ACCOUNTS,
  REGIME_CONFIG,
  MICRO_THRESHOLDS,
  formatVatAmount,
} from "@autonomynexus/accounting";
import { EUR, monetary } from "monetary";

// VAT calculations
const ht = calculateHTFromTTC(monetary({ amount: 12000, currency: EUR }), 20);
// → { amount: 10000, currency: EUR } (100.00€ HT from 120.00€ TTC)

// Chart of accounts (PCG — Plan Comptable Général)
const bankAccount = PCG_ACCOUNTS.find(a => a.code === "512");
// → { code: "512", name: "Banques", class: 5, typeId: "ASSET", ... }

// Micro-entreprise thresholds
const threshold = MICRO_THRESHOLDS.BIC_GOODS; // 188700€
```

### Generating a CA3 declaration (monthly VAT)

```ts
import { Effect, Layer } from "effect";
import {
  Ca3GeneratorService,
  Ca3GeneratorServiceLayer,
  JournalDataPort,
  BespokeJournalData,
} from "@autonomynexus/accounting";

// Provide journal data (from DB, API, or in-memory)
const journalData = BespokeJournalData.make({
  entries: [/* your JournalEntryModel[] */],
  lines: [/* your JournalLineModel[] */],
});

const layer = Ca3GeneratorServiceLayer.pipe(
  Layer.provide(Layer.succeed(JournalDataPort, journalData)),
);

const program = Effect.gen(function* () {
  const ca3 = yield* Ca3GeneratorService;
  return yield* ca3.generate({
    userId: "user-1",
    period: { startDate: new Date("2025-01-01"), endDate: new Date("2025-01-31") },
    previousCredit: undefined, // carry from last month
  });
});

const declaration = await Effect.runPromise(program.pipe(Effect.provide(layer)));
// → Ca3Declaration with all 32 official line numbers
```

### Generating a CA12 declaration (annual simplified VAT)

```ts
import {
  Ca12GeneratorService,
  Ca12GeneratorServiceLayer,
  JournalDataPort,
} from "@autonomynexus/accounting";

const layer = Ca12GeneratorServiceLayer.pipe(
  Layer.provide(Layer.succeed(JournalDataPort, yourJournalDataAdapter)),
);

const program = Effect.gen(function* () {
  const ca12 = yield* Ca12GeneratorService;
  return yield* ca12.generate({
    userId: "user-1",
    exercice: { startDate: new Date("2025-01-01"), endDate: new Date("2025-12-31") },
    previousCredit: undefined,
    acompteJuillet: undefined,
    acompteDécembre: undefined,
  });
});
```

### Wiring to a real database

```ts
import { JournalDataPort } from "@autonomynexus/accounting";
import { Effect, Layer } from "effect";

const DrizzleJournalData = Layer.effect(
  JournalDataPort,
  Effect.gen(function* () {
    const db = yield* Database;
    return {
      findEntriesByPeriod: (userId, period) =>
        Effect.tryPromise(() =>
          db.query.journalEntry.findMany({ where: /* your query */ })
        ),
      findLinesByEntryIds: (userId, entryIds) =>
        Effect.tryPromise(() =>
          db.query.journalLine.findMany({ where: /* your query */ })
        ),
    };
  })
);
```

## Module Structure

### Models & Types

| Module | Key exports |
|--------|-------------|
| `models` | `Period`, `AccountBalance`, `UserId`, `RegimeCode`, `TaxSystem`, `ActivityGroupCode`, `JournalEntryModel`, `JournalLineModel`, `CompleteJournalEntry` |
| `chart-of-accounts` | `PCG_ACCOUNTS`, `BANK_ACCOUNT`, `VAT_COLLECTED_ACCOUNT`, `VAT_DEDUCTIBLE_ABS`, `VAT_DEDUCTIBLE_IMMOS`, `OTHER_TAXES_ACCOUNT`, `getAccountDefinition()`, `getRevenueAccountCodes()`, `getVatDeductibleAccount()` |
| `regime/regime-details` | `REGIME_CONFIG`, `MICRO_THRESHOLDS`, `VAT_THRESHOLDS`, `REEL_SIMPLIFIE_THRESHOLDS` |

### VAT Declarations & Calculations

| Module | Key exports |
|--------|-------------|
| `vat/declarations` | `Ca3GeneratorService`, `Ca3GeneratorServiceLayer`, `Ca12GeneratorService`, `Ca12GeneratorServiceLayer` |
| `vat/models` | `Ca3Declaration` (all 32 lines), `Ca12Declaration`, `GenerateCa3Input`, `GenerateCa12Input`, `VatRegime` |
| `vat/calculations` | `calculateHTFromTTC()`, `calculateTTCFromHT()`, `FRENCH_VAT_RATES` |
| `vat/rules` | `getAutomaticVatRate()`, `isVatExemptCategory()`, `getTaxRateOptions()` |
| `vat/utils` | `VatCode`, `getVatInfo()`, `hasVat()`, `isValidVatCode()`, `isDomTomVatCode()` |
| `vat/formatting` | `formatVatAmount()`, `isTvaLine()` |
| `vat/annexe-types` | `TAXE_ASSIMILEE_TYPES`, `ACCISE_TYPES`, `TIC_EXEMPTION_CODES` |
| `vat/annexe-a-models` | `ADeclaration`, `SimpleTaxLine` (3310-A taxes assimilées) |
| `vat/ter-models` | `TerDeclaration`, `VatSector`, `VatSectorConfig` (3310-TER secteurs distincts) |
| `vat/tic-models` | `TicDeclaration`, `TicMeter` (3310-TIC accises énergétiques) |

### URSSAF

| Module | Key exports |
|--------|-------------|
| `urssaf/rates` | `ActivityType`, `RateType`, `ACRE` helpers, `isAcreActive()` |
| `urssaf/models` | `ComputeUrssafDeclarationInput`, `UrssafDeclarationResult` |

### Financial Statements

| Module | Key exports |
|--------|-------------|
| `financial-statements` | `BalanceSheet`, `IncomeStatement`, `FinancialStatements` |

### Services

| Service | What it does |
|---------|-------------|
| `Ca3GeneratorService` | Generates CA3 monthly VAT declarations + TER/A/TIC annexes |
| `Ca12GeneratorService` | Generates CA12 annual simplified VAT declarations |
| `ThresholdMonitoringService` | Monitors micro-entreprise revenue vs thresholds |
| `UrssafService` | Computes URSSAF declarations with ACRE, CFP, versement libératoire |
| `VatService` | Computes VAT from account balances |

### Ports (interfaces you implement)

| Port | Methods | Used by |
|------|---------|---------|
| `JournalDataPort` | `findEntriesByPeriod()`, `findLinesByEntryIds()` | CA3/CA12 generators |
| `AccountingDataPort` | `getAccountBalances()`, `getAccountBalancesByClass()` | VatService, ThresholdMonitoringService |
| `UrssafRatesPort` | `getRate()`, `getAllRatesForActivity()` | UrssafService |
| `VatSectorPort` | `getActiveSectors()` | CA3 TER annexe generator |

### Bespoke (in-memory) implementations

For testing or standalone use without a database:

| Export | Purpose |
|--------|---------|
| `BespokeJournalData` | In-memory `JournalDataPort` from arrays |
| `BespokeAccountingData` | In-memory `AccountingDataPort` from plain objects |
| `BespokeUrssafRates` | In-memory `UrssafRatesPort` from a Map |

## What it does NOT do

- **No database access.** You provide data through ports.
- **No HTTP/API calls.** Filing submission to impots.gouv.fr is your responsibility.
- **No PDF generation.** It gives you the data; you render it.
- **No authentication.** `UserId` is an opaque string.
- **No state management.** Pure computation — call it, get results.

## Roadmap

- [ ] Déclaration 2035 (BNC professions libérales — EI)
- [ ] Liasse fiscale (balance sheet + income statement filing format)
- [ ] CFE / CVAE declarations
- [ ] Full PCG with all 400+ accounts (currently ~50 most-used)
- [ ] Declaration validation rules (cross-field consistency checks)

## Legal references

- **PCG** — Plan Comptable Général (ANC regulation 2014-03)
- **CGI Art. 287** — VAT declaration obligations
- **CGI Art. 302 septies A** — Régime simplifié (CA12)
- **CERFA 10963** — Form 3310-CA3-SD (monthly/quarterly VAT)
- **CERFA 11417** — Form 3517-S-SD (annual simplified VAT)
- **3310-A** — Taxes assimilées annexe
- **3310-TER** — Secteurs distincts annexe
- **3310-TIC** — Accises produits énergétiques annexe

## Tech stack

- TypeScript, [Effect](https://effect.website), [monetary](https://github.com/autonomynexus/monetary-lib)
- Bun for runtime/testing
- oxfmt for formatting, oxlint for linting

## License

Private — Autonomy Nexus
