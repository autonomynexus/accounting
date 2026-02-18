# @autonomynexus/accounting

The canonical French freelancer and small company accounting engine. Handles VAT declarations, URSSAF contributions, threshold monitoring, financial statements, and Plan Comptable Général (PCG) — with zero infrastructure dependencies.

## Why this exists

French accounting for freelancers (EI, micro-entreprise) and small companies (EURL, SASU, SAS) involves a maze of tax regimes, URSSAF rates, VAT thresholds, and filing obligations. This package encodes all of that as pure TypeScript — no database, no framework, no runtime dependencies beyond [Effect](https://effect.website) and [monetary](https://github.com/autonomynexus/monetary-lib).

**Use it to:**
- Generate CA3 and CA12 VAT declarations from journal entry data
- Compute URSSAF contributions with ACRE support
- Monitor micro-entreprise revenue thresholds
- Calculate VAT (HT↔TTC conversions, rate lookups)
- Build balance sheets and income statements
- Access the full PCG chart of accounts for freelancers

## Architecture

**Ports & Adapters.** Services define what data they need through ports (interfaces). You provide adapters — from a database, from static data, from an API, whatever.

```
┌─────────────────────────────────┐
│   @autonomynexus/accounting     │
│                                 │
│  Services ──→ Ports (interfaces)│
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
} from "@autonomynexus/accounting"
import { EUR, monetary } from "monetary"

// VAT calculations
const ht = calculateHTFromTTC(monetary({ amount: 12000, currency: EUR }), 20)
// → { amount: 10000, currency: EUR } (100.00€ HT from 120.00€ TTC)

const ttc = calculateTTCFromHT(monetary({ amount: 10000, currency: EUR }), 20)
// → { amount: 12000, currency: EUR }

// VAT rate info
const info = getVatInfo("TVA_20")
// → { code: "TVA_20", rate: 20, label: "TVA 20%", ... }

// Micro-entreprise thresholds
const threshold = MICRO_THRESHOLDS.BIC_GOODS // 188700€
const vatThreshold = MICRO_THRESHOLDS.BIC_GOODS // for VAT franchise

// Regime configuration
const microConfig = REGIME_CONFIG.MICRO_ENTREPRISE
// → { name, taxSystem, validActivityGroupCodes, thresholds, ... }

// Chart of accounts
const bankAccount = PCG_ACCOUNTS.find(a => a.code === "512")
// → { code: "512", name: "Banques", class: 5, typeId: "ASSET", ... }

// Format for French tax forms
const amount = monetary({ amount: 123456, currency: EUR })
formatVatAmount(amount) // → "1234,56"
```

### Services with Effect

```ts
import { Effect, Layer } from "effect"
import {
  ThresholdMonitoringService,
  ThresholdMonitoringServiceLayer,
  UrssafService,
  UrssafServiceLayer,
  VatService,
  VatServiceLayer,
  BespokeAccountingData,
  BespokeUrssafRates,
} from "@autonomynexus/accounting"

// Use bespoke (in-memory) data for quick calculations
const bespokeData = BespokeAccountingData.make({
  accountBalances: [
    { accountCode: "706", debitTotal: m(0), creditTotal: m(5000000), balance: m(-5000000) },
  ],
})
const bespokeRates = BespokeUrssafRates.make({
  rates: new Map([["social_contribution", scaledAmount(0.22)]]),
})

// Compose layers
const live = Layer.mergeAll(
  ThresholdMonitoringServiceLayer,
  UrssafServiceLayer,
  VatServiceLayer,
  Layer.succeed(AccountingDataPort, bespokeData),
  Layer.succeed(UrssafRatesPort, bespokeRates),
)

// Use services
const program = Effect.gen(function* () {
  const threshold = yield* ThresholdMonitoringService
  const status = yield* threshold.getThresholdStatus(userId, "BIC_GOODS", 2025, startDate)
  // → { microPercentage, vatPercentage, warnings, regimeAtRisk, ... }
})

Effect.runPromise(program.pipe(Effect.provide(live)))
```

### Wiring to a real database

```ts
import { AccountingDataPort } from "@autonomynexus/accounting"
import { Effect, Layer } from "effect"

// Implement the port with your data layer
const DrizzleAccountingData = Layer.effect(
  AccountingDataPort,
  Effect.gen(function* () {
    const db = yield* Database
    return {
      getAccountBalances: (userId, period, accountCodes) =>
        Effect.tryPromise(() =>
          db.query.journalLine.findMany({ where: /* your query */ })
        ),
      getAccountBalancesByClass: (userId, period, accountClass) =>
        Effect.tryPromise(() =>
          db.query.journalLine.findMany({ where: /* your query */ })
        ),
    }
  })
)
```

## API Surface

### Models & Types

| Module | Key exports |
|--------|-------------|
| `models` | `Period`, `AccountBalance`, `UserId`, `RegimeCode`, `TaxSystem`, `ActivityGroupCode`, `JournalEntryModel`, `JournalLineModel`, `CompleteJournalEntry` |
| `chart-of-accounts` | `PCG_ACCOUNTS`, `BANK_ACCOUNT`, `VAT_COLLECTED_ACCOUNT`, `VAT_DEDUCTIBLE_ABS`, `VAT_DEDUCTIBLE_IMMOS`, `getAccountDefinition()`, `getRevenueAccountCodes()`, `getVatDeductibleAccount()` |
| `regime/regime-details` | `REGIME_CONFIG`, `MICRO_THRESHOLDS`, `VAT_THRESHOLDS`, `REEL_SIMPLIFIE_THRESHOLDS` |

### VAT

| Module | Key exports |
|--------|-------------|
| `vat/models` | `Ca3Declaration` (all 32 lines), `Ca12Declaration`, `Ca3DeclarationFull`, `Ca3DeclarationSnapshot`, `Ca12DeclarationSnapshot`, `VatDeclarationResult`, `VatRegime`, `GenerateCa3Input`, `GenerateCa12Input` |
| `vat/calculations` | `calculateHTFromTTC()`, `calculateTTCFromHT()`, `FRENCH_VAT_RATES` |
| `vat/rules` | `getAutomaticVatRate()`, `isVatExemptCategory()`, `getTaxRateOptions()` |
| `vat/utils` | `VatCode`, `getVatInfo()`, `hasVat()`, `isValidVatCode()` |
| `vat/formatting` | `formatVatAmount()`, `isTvaLine()` |
| `vat/annexe-types` | `TAXE_ASSIMILEE_TYPES`, `ACCISE_TYPES`, `TIC_EXEMPTION_CODES`, snapshot types |
| `vat/annexe-a-models` | `ADeclaration`, `SimpleTaxLine` (3310-A taxes assimilées) |
| `vat/ter-models` | `TerDeclaration`, `VatSector` (3310-TER secteurs distincts) |
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
| `ThresholdMonitoringService` | Monitors micro-entreprise revenue vs thresholds, warns on approaching/exceeding |
| `UrssafService` | Computes URSSAF declaration amounts with ACRE, CFP, versement libératoire |
| `VatService` | Computes VAT declarations from journal entries |

### Ports (interfaces you implement)

| Port | Methods |
|------|---------|
| `AccountingDataPort` | `getAccountBalances()`, `getAccountBalancesByClass()` |
| `UrssafRatesPort` | `getRate()`, `getAllRatesForActivity()` |

### Bespoke (in-memory) implementations

For testing or standalone use without a database:

| Export | Purpose |
|--------|---------|
| `BespokeAccountingData` | In-memory `AccountingDataPort` from plain objects |
| `BespokeUrssafRates` | In-memory `UrssafRatesPort` from a Map |

## What it does NOT do

- **No database access.** You provide data through ports.
- **No HTTP/API calls.** Filing submission to impots.gouv.fr is your responsibility.
- **No PDF generation.** It gives you the data; you render it.
- **No authentication.** `UserId` is an opaque string.
- **No state management.** Pure computation — call it, get results.

## Legal references

- **PCG** — Plan Comptable Général (French chart of accounts)
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
- Biome for linting

## License

Private — Autonomy Nexus
