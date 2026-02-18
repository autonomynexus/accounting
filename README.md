# @autonomynexus/accounting

**Comprehensive French accounting engine**, fully PCG-compliant (Plan Comptable Général — Règlement ANC N° 2014-03). Handles double-entry bookkeeping, VAT declarations (CA3/CA12), URSSAF contributions, financial statements, liasse fiscale, IS computation, BNC 2035, amortization, FEC generation — with zero infrastructure dependencies.

## Why this exists

French accounting for freelancers (EI, micro-entreprise) and small companies (EURL, SASU, SAS) involves a maze of tax regimes, URSSAF rates, VAT thresholds, and filing obligations. This package encodes all of that as pure TypeScript — no database, no framework, no runtime dependencies beyond [Effect](https://effect.website) and [monetary](https://github.com/autonomynexus/monetary-lib).

## What's included

### Core Accounting Engine
- **Full PCG Chart of Accounts** — 380+ standard accounts, all classes 1-8, with hierarchy, metadata, and lookup functions
- **Double-entry bookkeeping** — journal types (HA/VE/BQ/OD/AN), écriture validation, debit=credit enforcement
- **Trial balance** (balance des comptes) — computed from journal entries
- **General ledger** (grand livre) — with running balances per account
- **Subsidiary ledger** (balance auxiliaire) — for clients (411) and suppliers (401)
- **Lettrage** (account matching) — client payments to invoices, supplier payments
- **Bank reconciliation** types (rapprochement bancaire)
- **Year-end closing** (clôture d'exercice) — generates closing entries, computes résultat
- **Opening entries** (à-nouveaux) — generates from prior year closing balance
- **Exercice management** — fiscal year lifecycle, multi-exercise support

### Financial Statements
- **SIG** (Soldes Intermédiaires de Gestion) — marge commerciale, VA, EBE, résultat d'exploitation, résultat courant, résultat net
- **Balance sheet** (bilan) — from trial balance
- **Income statement** (compte de résultat) — from P&L accounts

### Tax Declarations
- **CA3** — monthly/quarterly VAT declaration with all 32 official lines
- **CA12** — annual simplified VAT declaration
- **VAT annexes** — 3310-A (taxes assimilées), 3310-TER (secteurs distincts), 3310-TIC (accises)
- **2035 BNC** — declaration contrôlée for profession libérale (2035-A recettes/dépenses, 2035-B immobilisations)

### Liasse Fiscale (IS)
- **2050** — Bilan Actif (computed from trial balance)
- **2051** — Bilan Passif
- **2052** — Compte de Résultat (charges)
- **2053** — Compte de Résultat (produits)
- **2054-2056** — Immobilisations, amortissements, provisions (models)
- **2058-A** — Détermination du résultat fiscal (passage comptable → fiscal)

### IS Computation
- **2572-SD** — relevé de solde IS
- Taux réduit 15% (≤ €42,500 si CA < €10M) + taux normal 25%
- Contribution sociale (3.3% si IS > €763K)
- Acomptes trimestriels
- Report en avant des déficits (1M€ + 50% au-delà)

### FEC Generation
- Full Fichier des Écritures Comptables (Article A.47 A-1 LPF)
- Tab-separated export with French number formatting
- Validation (mandatory fields, debit=credit, sequential numbering)
- Filename convention: `{SIREN}FEC{YYYYMMDD}.txt`

### Amortization Engine
- **Linear** (amortissement linéaire)
- **Declining balance** (amortissement dégressif) with PCG coefficients
- Prorata temporis for partial-year acquisitions
- Asset disposal (cession) with plus/moins-value computation

### URSSAF
- Contribution computation with ACRE support
- Rate tables for all activity types
- Versement libératoire

### Threshold Monitoring
- Micro-entreprise revenue thresholds
- Regime transition warnings

## Architecture

**Ports & Adapters.** Services define what data they need through ports (interfaces). You provide adapters — from a database, from static data, from an API.

```
┌─────────────────────────────────┐
│   @autonomynexus/accounting     │
│                                 │
│  Pure Computations (no deps)    │
│  Effect Services ──→ Ports      │
│  PCG, Rates, Thresholds         │
└─────────────┬───────────────────┘
              │ you provide
┌─────────────▼───────────────────┐
│  Your Adapters                  │
│  (Drizzle, Prisma, static, ..) │
└─────────────────────────────────┘
```

## Install

```bash
bun add @autonomynexus/accounting
bun add monetary  # peer dependency
```

## Quick Start

### Pure computations (no Effect needed)

```ts
import {
  // PCG chart of accounts
  PCG_ACCOUNTS_FULL, getAccountByCode, getAccountsByClass,
  // Double-entry engine
  validateEcriture, computeTrialBalance, computeGrandLivre,
  computeClotureExercice, computeANouveau,
  // Financial statements
  computeSIG,
  // IS computation
  computeIS, computeAcomptes, applyDeficitReportEnAvant,
  // Amortization
  computeAmortissementLineaire, computeAmortissementDegressif,
  // FEC
  generateFecRecords, exportFecToString, validateFecRecords,
  // VAT
  calculateHTFromTTC, FRENCH_VAT_RATES,
  // Liasse fiscale
  computeForm2050, computeForm2051, computeForm2052, computeForm2053,
} from "@autonomynexus/accounting";
```

### IS computation example

```ts
import { computeIS } from "@autonomynexus/accounting";
import { EUR, monetary } from "monetary";

const m = (euros: number) => monetary({ amount: euros * 100, currency: EUR });

const result = computeIS({
  resultatFiscal: m(50000),
  chiffreAffairesHT: m(500000),
  acomptesVerses: m(0),
  creditsImpot: m(0),
  siren: "123456789",
  denomination: "Ma SAS",
  exerciceDateDebut: new Date(2024, 0, 1),
  exerciceDateFin: new Date(2024, 11, 31),
  dureeExerciceMois: 12,
});
// result.isBrut → IS dû
// result.eligibleTauxReduit → true (CA < 10M)
```

## Tech Stack

- TypeScript, [Effect](https://effect.website), [monetary](https://github.com/autonomynexus/monetary-lib)
- Bun for runtime/testing (vitest)
- 69 tests covering all computation modules

## Legal References

- **PCG** — Plan Comptable Général (Règlement ANC N° 2014-03)
- **CGI Art. 287** — VAT declaration obligations
- **CGI Art. 302 septies A** — Régime simplifié (CA12)
- **LPF Art. A.47 A-1** — FEC specification
- **CGI Art. 219** — IS rates and conditions
- **CGI Art. 209** — Deficit carry-forward rules

## License

Private — Autonomy Nexus
