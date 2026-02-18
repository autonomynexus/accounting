# Accounting Integration Plan

**Goal**: Unified accounting system where declarations (URSSAF, VAT) are computed outputs from double-entry books. Support EI (micro → réel) first, then EURL/SASU.

**End-to-end test target**: URSSAF and VAT declarations for EI (micro and réel).

---

## Core Concepts

### Journal Entry
A record of a business event with balanced debits/credits:
```
Jan 15: Client payment €1000
  Debit  512 (Bank)      €1000
  Credit 706 (Revenue)   €1000
```

### Account (PCG)
French chart of accounts organized by class:
- Class 4: Third parties (401 Suppliers, 411 Customers, 4456/4457 VAT)
- Class 5: Financial (512 Bank)
- Class 6: Expenses (606 Purchases, 613 Rent)
- Class 7: Revenue (706 Services, 707 Sales)

### Declarations from Accounts
- **VAT**: Balance(4457) - Balance(4456)
- **URSSAF micro**: Sum(Class 7) × rates
- **URSSAF réel**: (Sum(Class 7) - Sum(Class 6)) × rates

---

## Current State

### MyAutonomy Has
- Bank transaction import (Bridge API) with ML similarity tagging
- Category system with PCG account mapping (`category.pcg_account`)
- URSSAF/VAT declaration processing flow (incomplete)
- Tax calculator (micro-entreprise only, missing rates)
- Company model with regime, activity type, VAT settings

### Accounting Project Has (~4,600 LOC)
- Full PCG chart of accounts (50+ accounts)
- Double-entry bookkeeping engine with validation
- Transaction tagging adapter (bank → journal entries)
- VAT calculation (all 4 French rates)
- Entity-aware rules (ME, EI, SASU)
- Financial statement generators (framework)

### Gap Analysis

| Capability | MyAutonomy | Accounting | Action |
|------------|------------|------------|--------|
| Bank import | ✅ | ❌ | Keep |
| Category → PCG | ✅ partial | ✅ full | Merge |
| URSSAF rates | ❌ | ❌ | **Build** |
| Double-entry | ❌ | ✅ | Integrate |
| Journal entries | ❌ | ✅ | Integrate |
| Validation workflow | ❌ | ❌ | **Build** |
| Financial statements | ❌ | ✅ framework | Integrate |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI LAYER                                │
│  Transactions (validate) │ Declarations │ Financial Statements  │
└─────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                    ACCOUNTING DOMAIN                            │
│              (app/server/features/accounting/)                  │
│                              │                                  │
│  ┌───────────────────────────▼────────────────────────────────┐│
│  │                 AccountingService                          ││
│  │  - createJournalEntry(transaction, category)               ││
│  │  - validateEntry(entryId)                                  ││
│  │  - getAccountBalance(accountCode, period)                  ││
│  │  - closePeriod(periodId)                                   ││
│  └────────────────────────────────────────────────────────────┘│
│                              │                                  │
│  ┌───────────────────────────▼────────────────────────────────┐│
│  │                 DeclarationService                         ││
│  │  (computed from account balances)                          ││
│  │                                                            ││
│  │  - getUrssafDeclaration(period) → Sum(706,707) × rates     ││
│  │  - getVatDeclaration(period) → 4457 - 4456                 ││
│  │  - getIncomeStatement(period) → Class 7 - Class 6          ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                       DATA LAYER                                │
│                                                                 │
│  transaction (existing)                                         │
│    │ categoryId, taxRate                                        │
│    │                                                            │
│    ▼                                                            │
│  journal_entry (NEW)                                            │
│    │ id, date, description, source, status                      │
│    │ transactionId (FK) ─────────────────┐                      │
│    │                                     │                      │
│    ▼                                     │                      │
│  journal_line (NEW)                      │                      │
│    │ journalEntryId, accountCode         │                      │
│    │ debitAmount, creditAmount           │                      │
│    │                                     │                      │
│    ▼                                     │                      │
│  account (NEW)                           │                      │
│    │ code, name, class, type             │                      │
│    │                                     │                      │
│    └─────────────────────────────────────┘                      │
│                                                                 │
│  declaration (existing) ◄── computed from journal_line balances │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Workflow

```
1. Bank transactions sync (Bridge API)
   └── transaction table populated

2. User categorizes transactions
   ┌─────────────────────────────────────────────────────────┐
   │ 🔴 12 transactions to validate                          │
   ├─────────────────────────────────────────────────────────┤
   │ Jan 15  STRIPE         +€1,200   [Services ▾] [✓]      │
   │         Suggestion: 706          Invoice: INV-001       │
   │                                                         │
   │ Jan 14  AMAZON         -€49.99   [Fournitures ▾] [✓]   │
   │         Suggestion: 606          Receipt: [+]           │
   └─────────────────────────────────────────────────────────┘

3. On validate → journal_entry created
   - Double-entry lines generated from category.pcg_account
   - VAT lines if taxRate set (4456/4457)
   - Entry status = 'validated'

4. Declaration period
   - System queries account balances for period
   - URSSAF: Sum revenue accounts × rates
   - VAT: Balance(4457) - Balance(4456)

5. Period close (optional, for réel)
   - Entries become immutable
   - Financial statements generated
```

---

## Implementation Phases

### Phase 1: Foundation (This Session)
**Goal**: DB schema + basic accounting service

- [ ] Create DB tables: `account`, `journal_entry`, `journal_line`
- [ ] Create AccountingService (Effect.ts Tag/Layer)
- [ ] Create JournalEntryService (entry creation with validation)
- [ ] Seed PCG accounts (class 4,5,6,7 minimum)
- [ ] Unit tests for double-entry validation

**Files**:
```
app/db/schema/accounting.ts           # New tables
app/server/features/accounting/
  ├── accounting.models.ts            # Types
  ├── accounting.schemas.ts           # Effect schemas
  ├── accounting.service.ts           # Main service
  ├── accounting.repository.ts        # DB access
  ├── journal-entry.service.ts        # Entry creation
  └── chart-of-accounts.ts            # PCG definitions
```

### Phase 2: Transaction Integration
**Goal**: Connect bank transactions to journal entries

- [x] Add CANCELLED status to journal_entry_status seed
- [x] Create `vat/vat-utils.ts` - ScaledAmount → VatCode mapping
- [x] Extend JournalEntryService with `createFromTransaction`
- [x] Implement pre-validation checks (idempotency via journal_entry.transaction_id)
- [x] Handle VAT line generation using vat-utils
- [x] Add regime-dependent auto-validation (micro → VALIDATED)
- [x] Bulk validation with atomic DB transaction (validateBatch method)

**Files**:
```
scripts/db/seed.ts                    # Add CANCELLED status
app/server/features/accounting/
  ├── vat/
  │   └── vat-utils.ts                # ScaledAmount → VatCode
  └── journal-entry.service.ts        # createFromTransaction, validateBatch
```

### Phase 3: URSSAF Declarations
**Goal**: URSSAF declarations from accounting data

- [x] Add URSSAF contribution rates (2024)
  - Micro: BNC 23.2%, BIC services 21.8%, BIC goods 12.8%
  - ACRE: 50% reduction first year
  - Versement libératoire: 1%, 1.7%, 2.2%
  - CFP (Formation Professionnelle): 0.1%-0.3%
- [x] UrssafService reads from account balances (Class 6/7)
- [x] Support both micro (revenue-based) and réel (profit-based)
- [ ] Update declaration UI to use new service

**Files**:
```
app/server/features/accounting/
  ├── urssaf/
  │   ├── urssaf.service.ts           # Declaration computation
  │   ├── urssaf-rates.ts             # 2024 rates by regime (ScaledAmount)
  │   └── urssaf.models.ts            # Types
```

### Phase 4: VAT Declarations
**Goal**: VAT declarations from accounting data

- [x] VatService reads 4456/4457 balances
- [x] Support VAT regimes (franchise returns zeros, réel computes from lines)
- [x] Breakdown by VAT rate (TVA20, TVA10, TVA55, TVA21)
- [ ] CA3 (monthly) and CA12 (annual) form generation
- [ ] Update declaration UI

**Files**:
```
app/server/features/accounting/
  ├── vat/
  │   ├── vat-utils.ts                # ScaledAmount → VatCode (Phase 2)
  │   ├── vat.models.ts               # Types (VatDeclarationResult, Ca3, Ca12)
  │   └── vat.service.ts              # Declaration computation
```

### Phase 5: Period Management & Financial Statements
**Goal**: Proper accounting periods and statements

- [ ] Period closing workflow
- [ ] Balance sheet (Bilan) generation
- [ ] Income statement (Compte de résultat) generation
- [ ] Export to PDF

**Files**:
```
app/server/features/accounting/
  ├── period/
  │   └── period.service.ts           # Period closing
  └── statements/
      ├── balance-sheet.service.ts
      └── income-statement.service.ts
```

---

## Database Schema

### account
```sql
CREATE TABLE account (
  code VARCHAR(10) PRIMARY KEY,        -- PCG code: "512", "706", etc.
  name VARCHAR(255) NOT NULL,          -- "Banques", "Prestations de services"
  class INTEGER NOT NULL,              -- 1-8
  type VARCHAR(20) NOT NULL,           -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  is_debit_normal BOOLEAN NOT NULL,    -- Normal balance side
  parent_code VARCHAR(10),             -- Hierarchical
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### journal_entry
```sql
CREATE TABLE journal_entry (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.user(id),
  transaction_id BIGINT REFERENCES transaction(id),  -- Source bank tx (nullable for manual)
  date DATE NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,                      -- Invoice number, etc.
  source VARCHAR(20) NOT NULL,         -- BANK_IMPORT, MANUAL, PERIOD_CLOSING
  status VARCHAR(20) NOT NULL,         -- DRAFT, VALIDATED, CLOSED
  validated_at TIMESTAMP,
  period_id INTEGER,                   -- For period closing
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### journal_line
```sql
CREATE TABLE journal_line (
  id SERIAL PRIMARY KEY,
  journal_entry_id INTEGER NOT NULL REFERENCES journal_entry(id),
  account_code VARCHAR(10) NOT NULL REFERENCES account(code),
  debit_amount JSONB,                  -- Monetary type
  credit_amount JSONB,                 -- Monetary type
  description TEXT,
  vat_code VARCHAR(10),                -- TVA20, TVA10, etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX journal_entry_user_id_idx ON journal_entry(user_id);
CREATE INDEX journal_entry_date_idx ON journal_entry(user_id, date);
CREATE INDEX journal_entry_status_idx ON journal_entry(user_id, status);
CREATE INDEX journal_line_account_idx ON journal_line(account_code);
CREATE INDEX journal_line_entry_idx ON journal_line(journal_entry_id);
```

---

## URSSAF Rates 2024

```typescript
export const URSSAF_RATES_2024 = {
  micro: {
    BNC: {
      base: 0.232,           // 23.2%
      acre_year1: 0.116,     // 11.6% (50% reduction)
      acre_year2: 0.174,     // 17.4% (25% reduction in some cases)
    },
    BIC_SERVICES: {
      base: 0.218,           // 21.8%
      acre_year1: 0.109,
    },
    BIC_GOODS: {
      base: 0.128,           // 12.8%
      acre_year1: 0.064,
    },
  },
  versementLiberatoire: {
    BNC: 0.022,              // 2.2%
    BIC_SERVICES: 0.017,     // 1.7%
    BIC_GOODS: 0.01,         // 1%
  },
  // Réel: complex, based on income brackets - to be defined in Phase 3
};
```

---

## Migration from Current System

### What Changes
1. Declaration computation moves from raw transactions → account balances
2. Transaction validation creates journal entries
3. Categories become the bridge (category.pcg_account → journal lines)

### Backward Compatibility
- Existing transactions remain valid
- Bulk migration: create journal entries for all validated/categorized transactions
- New transactions: journal entry created on validation

### Migration Script
```typescript
// For each categorized transaction without journal_entry
// 1. Look up category.pcg_account
// 2. Create journal_entry with status='VALIDATED'
// 3. Create journal_lines (debit bank, credit revenue/expense)
// 4. Link transaction.journalEntryId
```

---

## Testing Strategy

### Unit Tests
- Double-entry validation (debits = credits)
- Account balance calculation
- URSSAF rate application
- VAT computation

### Integration Tests
- Transaction → Journal Entry flow
- Declaration computation from account balances
- Period closing

### E2E Test (Target)
```
Given: EI micro-entreprise with bank transactions
When: User categorizes and validates transactions
Then: URSSAF declaration shows correct amounts with proper rates
And: VAT declaration shows correct collected - deductible
```

---

## Open Questions (Resolved)

1. ~~Backfill journal entries?~~ → Yes, migration script for existing data
2. ~~Account granularity?~~ → Start with 3-digit (512, 706), extend as needed
3. ~~Auto-validate?~~ → Micro: auto-validate on categorization. Réel: require explicit validation
4. ~~Package vs merge?~~ → Merge into app/server/features/accounting/
5. ~~Service vs Adapter?~~ → Extend JournalEntryService with `createFromTransaction` (consensus)
6. ~~Transaction:Entry relationship?~~ → 1:1, corrections via separate reversing entries
7. ~~Bulk validation atomicity?~~ → Atomic (single DB transaction, all-or-nothing)
8. ~~Regime logic location?~~ → Service layer (security, testability)

---

## Phase 2 Consensus Decisions

### Architecture
- **Extend existing service** - add `createFromTransaction` to JournalEntryService (not new service)
- **1:1 relationship** - unidirectional FK (journal_entry.transaction_id), corrections via reversing entries
- **FK direction rationale** - journal_entry is derived FROM transaction (semantic ownership), avoids circular import
- **Atomic bulk** - Effect.all + DB transaction for bulk validation

### VAT Handling
- **ScaledAmount preservation** - VAT rates stay as `ScaledAmount<number>` (precision)
- **VAT code mapping** - derive from ScaledAmount: `{amount:20,scale:2}` → "TVA20"
- **VAT accounts** - 4457 (collectée/revenue), 4456 (déductible/expense)

### Type Conversion
- `category.pcg_account` is INTEGER (706), `pcgAccount.code` is TEXT ("706")
- Convert with `String(category.pcg_account)` in adapter logic

### Pre-validation Checks (7)
1. Transaction not already validated (journalEntryId is null)
2. Transaction has categoryId
3. Category exists and has pcg_account
4. PCG account exists in pcgAccount table
5. Amount is non-zero
6. VAT consistency (warn if company.declaresVat=false but taxRate set)
7. Idempotency check

### Status Management
- Add CANCELLED status for audit trail
- Micro-entreprise: auto-validate on creation
- Réel: keep as DRAFT, require explicit validation

### Files to Create/Modify
```
app/server/features/accounting/
  ├── vat/
  │   └── vat-utils.ts              # ScaledAmount → VatCode mapping
  └── journal-entry.service.ts      # Add createFromTransaction, validateBatch

app/db/schema/transaction.ts        # Add journalEntryId FK
scripts/db/seed.ts                  # Add CANCELLED status
```

---

## Reference: Accounting Project Location

Source: `~/dev/accounting` (~4,600 LOC)

Key files to adapt:
- `src/domain/account.ts` → accounting.models.ts
- `src/domain/transaction.ts` → journal entry types
- `src/services/transaction-engine.ts` → journal-entry.service.ts
- `src/services/chart-of-accounts.ts` → chart-of-accounts.ts

---

## Session Checkpoints

Use these to resume work across sessions:

- [x] **Checkpoint 1**: DB schema created, tables in DB, seed in seed.ts
- [x] **Checkpoint 2**: AccountingService + JournalEntryService working (tsc passes)
- [x] **Checkpoint 3**: Transaction → JournalEntry flow working (createFromTransaction)
- [x] **Checkpoint 4**: URSSAF declaration from account balances (UrssafService)
- [x] **Checkpoint 5**: VAT declaration from account balances (VatService)
- [x] **Checkpoint 6**: E2E test passing for EI micro (8 tests)
- [x] **Checkpoint 7**: E2E test passing for EI réel (6 tests)
