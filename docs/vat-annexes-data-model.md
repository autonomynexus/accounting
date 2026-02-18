# Complete VAT Declaration Data Model - CA3/CA12 + Annexes

## Goal
Build enterprise-grade data model for complete French VAT declaration system including all annexes (TER, A, TIC) with full PCG account mapping and database persistence.

## Current State
- `Ca3Declaration` and `Ca12Declaration` exist with ~32 lines each
- Single `declaration` table with JSON snapshots (`ca3Snapshot`, `ca12Snapshot`)
- No annexe tables - ligne 29 references 3310-A but no granular storage
- PCG accounts: 4456x (deductible), 4457 (collected)
- Journal lines track vatCode (TVA20/10/55/21/0)

## Regulatory Context: TER Sectors

**French tax law (CGI Art. 271)**: "Secteurs distincts d'activité" are required when:
- Business has activities with different VAT deduction rights
- Mixed taxable + exempt activities
- Different deduction coefficients per activity

**Sector determination**:
- Defined at company level (not per establishment)
- Based on activity types (codes APE/NAF from INPI registration)
- Each sector has its own deduction percentage
- Most SMEs = 1 sector (100% deduction for taxable operations)
- Companies with mixed activities = multiple sectors

**Recommended approach**: User-configured sectors in company settings, applied per declaration.

## Files to Create/Modify

### Database Schema
- `app/db/schema/vat-annexes.ts` (NEW) - TER, A, TIC tables

### Type Definitions
- `app/server/features/accounting/vat/vat-ter.models.ts` (NEW)
- `app/server/features/accounting/vat/vat-a.models.ts` (NEW)
- `app/server/features/accounting/vat/vat-tic.models.ts` (NEW)
- `app/server/features/accounting/vat/vat.models.ts` (MODIFY)

### Journal Line Schema
- `app/db/schema/accounting.ts` (MODIFY) - Add sectorId, taxeAssimileeType, acciseType to journalLine

---

## Database Schema Design

### New Tables

#### `vatSector` - Company-level sector configuration
```sql
vatSector (
  id: integer PK
  userId: FK → user
  code: text (unique per user, e.g. "SECTOR_1")
  name: text (e.g. "Activité de conseil")
  deductionPercentage: integer (0-10000, scale 2 = 0-100.00%)
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp

  UNIQUE(userId, code)
)
```

#### `declarationTer` - 3310-TER annexe per declaration
```sql
declarationTer (
  id: integer PK
  declarationId: FK → declaration
  generalDeductionPercentage: integer (scale 2)
  mentionExpresse: boolean
  comments: text (JSON array of strings)
  snapshot: jsonb (full TerDeclarationSnapshot)
  createdAt: timestamp
  updatedAt: timestamp
)
```

#### `declarationTerSector` - TER sector details (per declaration)
```sql
declarationTerSector (
  id: integer PK
  declarationTerId: FK → declarationTer
  sectorId: FK → vatSector
  sectorNumber: integer (1-n, display order)

  -- TVA Brute (col 1-3)
  tvaBrute: monetary
  tvaAReverser: monetary
  totalBrute: monetary

  -- TVA Déductible Immobilisations (col 4-6)
  immoExclusive: monetary
  immoNonExclusive: monetary
  immoTotal: monetary

  -- TVA Déductible ABS (col 7-9)
  absExclusive: monetary
  absNonExclusive: monetary
  absTotal: monetary

  -- Résultat (col 10-13)
  complementTva: monetary
  totalDeductible: monetary
  tvaNette: monetary
  creditTva: monetary
)
```

#### `declarationA` - 3310-A annexe per declaration
```sql
declarationA (
  id: integer PK
  declarationId: FK → declaration
  ligne29Total: monetary
  snapshot: jsonb (full ADeclarationSnapshot)
  createdAt: timestamp
  updatedAt: timestamp
)
```

#### `declarationATax` - Individual tax lines for 3310-A
```sql
declarationATax (
  id: integer PK
  declarationAId: FK → declarationA
  taxType: enum (see TaxeAssimileeType)
  enabled: boolean
  baseImposable: monetary
  taxeDue: monetary
  details: jsonb (rate-specific fields, advances, etc.)
)
```

#### `declarationTic` - 3310-TIC annexe per declaration
```sql
declarationTic (
  id: integer PK
  declarationId: FK → declaration
  electricityEnabled: boolean
  gasEnabled: boolean
  coalEnabled: boolean
  otherEnabled: boolean
  netBalanceDue: monetary
  netCreditRefund: monetary
  snapshot: jsonb (full TicDeclarationSnapshot)
  createdAt: timestamp
  updatedAt: timestamp
)
```

#### `declarationTicMeter` - TIC meter/delivery point details
```sql
declarationTicMeter (
  id: integer PK
  declarationTicId: FK → declarationTic
  sectionType: enum (ELECTRICITY, GAS, COAL, OTHER)
  reference: text
  siret: text
  codeApe: text
  motifTarifReduit: enum (E08-E22)
  closingDate: date
  quantity: integer (with scale, NOT monetary)
  rate: monetary
  deductiblePortion: monetary
  carryover: monetary
  netDue: monetary
  details: jsonb (section-specific fields)
)
```

### PCG Account Strategy (100% Compliant)

**DO NOT create non-standard account codes.** Use existing PCG hierarchy with dimensions:

```typescript
// Existing accounts (no changes)
"447"   → AUTRES_IMPOTS_TAXES (parent for all assimilated taxes)
"4456"  → TVA_DEDUCTIBLE (existing)
"44562" → TVA_DEDUCTIBLE_IMMOS (existing)
"44566" → TVA_DEDUCTIBLE_ABS (existing)
"4457"  → TVA_COLLECTEE (existing)

// Tracking via journal line dimensions (NOT new accounts)
journalLine.taxeAssimileeType: TaxeAssimileeType | null  // for 447 entries
journalLine.acciseType: AcciseType | null                 // for 447 entries
journalLine.sectorId: FK → vatSector | null               // for TER tracking
```

---

## Data Model Design

### 3310-TER (Secteurs d'Activité Distincts)

```typescript
type TerSector = {
  readonly id: number;
  readonly description: string;
  readonly deductionPercentage: number; // 0-100, 2 decimals
};

type TerSectorVatBrute = {
  readonly sectorId: number;
  readonly tvaBrute: Monetary<number>;        // col 1
  readonly tvaAReverser: Monetary<number>;    // col 2
  readonly total: Monetary<number>;           // col 3 = 1+2
};

type TerSectorTvaDeductible = {
  readonly sectorId: number;
  readonly immoExclusive: Monetary<number>;    // col 4
  readonly immoNonExclusive: Monetary<number>; // col 5
  readonly immoTotal: Monetary<number>;        // col 6 = 4+5
  readonly absExclusive: Monetary<number>;     // col 7
  readonly absNonExclusive: Monetary<number>;  // col 8
  readonly absTotal: Monetary<number>;         // col 9 = 7+8
};

type TerSectorResult = {
  readonly sectorId: number;
  readonly complementTvaDeductible: Monetary<number>; // col 10
  readonly totalTvaDeductible: Monetary<number>;       // col 11
  readonly tvaNette: Monetary<number>;                 // col 12
  readonly creditTva: Monetary<number>;                // col 13
};

type TerDeclaration = {
  readonly generalDeductionPercentage: number;
  readonly sectors: readonly TerSector[];
  readonly vatBrute: readonly TerSectorVatBrute[];
  readonly vatDeductible: readonly TerSectorTvaDeductible[];
  readonly results: readonly TerSectorResult[];
  readonly totals: TerTotals;
  readonly mentionExpresse: boolean;
  readonly comments: readonly string[];
};
```

### 3310-A (Taxes Assimilées)

```typescript
type TaxeAssimileeType =
  | "TRANSPORT_INFRASTRUCTURE"
  | "METAUX_PRECIEUX"
  | "VIDEOGRAMMES"
  | "JEUX_PARIS"
  | "RENTE_ELECTRICITE"
  | "VEHICULES_LOURDS"
  | "PASSAGERS_CORSE"
  | "EMISSIONS_CO2"
  | "EOLIENNES_MARITIMES"
  | "EXPLORATION_HYDROCARBURES"
  | "TSN_NUMERIQUE"
  | "PUBLICITE"
  | "DROITS_SPORTIFS"
  | "PROVISIONS_ASSURANCE"
  | "REDEVANCE_SANITAIRE_PHYTOSANITAIRE"
  | "EAUX_MINERALES_NATURELLES"
  | "PRODUITS_PHYTOPHARMACEUTIQUES";

type ADeclaration = {
  readonly taxes: readonly SimpleTaxLine[];
  readonly transportInfrastructure: TransportInfrastructureTax;
  readonly videogram: VideogramTax;
  readonly electricityProduction: ElectricityProductionMargin;
  readonly ligne29Total: Monetary<number>;
};
```

### 3310-TIC (Accises Produits Énergétiques)

```typescript
type TicExemptionCode =
  | "E08" | "E09" | "E10" | "E11" | "E12" | "E13" | "E14"
  | "E15" | "E16" | "E17" | "E18" | "E19" | "E20" | "E21" | "E22";

type AcciseType = "TICFE" | "TICGN" | "TICC" | "TICPE";

type TicDeclaration = {
  readonly electricityEnabled: boolean;
  readonly gasEnabled: boolean;
  readonly coalEnabled: boolean;
  readonly otherEnabled: boolean;
  readonly electricity: TicElectricitySection;
  readonly gas: TicGasSection;
  readonly coal: TicCoalSection;
  readonly other: TicOtherSection;
  readonly netBalanceDue: Monetary<number>;
  readonly netCreditRefund: Monetary<number>;
};
```

### Extended CA3 Declaration

```typescript
type Ca3DeclarationFull = Ca3Declaration & {
  readonly hasTer: boolean;
  readonly hasAnnexeA: boolean;
  readonly hasTic: boolean;
  readonly ter: TerDeclaration | null;
  readonly annexeA: ADeclaration | null;
  readonly tic: TicDeclaration | null;
};
```

---

## Implementation Steps

### Phase 1: Database Schema (This PR)
1. Create `app/db/schema/vat-annexes.ts` with all new tables
2. Add `sectorId`, `taxeAssimileeType`, `acciseType` to `journalLine` in `accounting.ts`
3. Add relations to existing declaration table
4. Run `drizzle-kit generate` for migrations

### Phase 2: Type Definitions (This PR)
1. Create `vat-ter.models.ts` with TER types + snapshot conversion
2. Create `vat-a.models.ts` with A types + snapshot conversion
3. Create `vat-tic.models.ts` with TIC types + snapshot conversion
4. Extend `vat.models.ts` with `Ca3DeclarationFull` type
5. Add all snapshot converters (to/from)

### Phase 3: Sector Repository (This PR)
1. Create `vat-sector.repository.ts` for CRUD on vatSector table
2. Create `vat-sector.service.ts` Effect.ts service

### Phase 4: Onboarding + Settings (Future PR)
1. Add sector configuration step to onboarding flow
2. Create `/settings/company` page with sector management UI
3. Allow add/edit/deactivate sectors

### Phase 5: Annexe Generation (Future PR)
Extend existing `ca3-generator.service.ts` with annexe methods (no separate services):
- `generateTer()` - populate TER from multi-sector journal lines
- `generateAnnexeA()` - aggregate assimilated taxes from 447 entries
- `generateTic()` - aggregate accises from 447 entries

### Phase 6: Declaration Integration (Future PR)
- Update `declaration.service.ts` to handle annexe creation/storage
- Link annexe records to declaration via FKs
- Update preview components to display annexe data from DB

---

## Design Decisions

1. **Separate model files** - Keep TER/A/TIC in their own files
2. **Readonly types** - All fields readonly for immutability
3. **Monetary for amounts, integer for quantities** - Energy quantities use integer with scale
4. **Snapshot versioning** - Include version field for schema evolution
5. **Hybrid storage** - Normalized tables + JSON snapshot for full form state
6. **User-configured sectors** - Defined in company settings, applied per declaration
7. **100% PCG compliance** - NEVER deviate from official PCG
8. **Effect.ts pattern** - All services follow existing Tag/Layer pattern
9. **Sector tracking via dimension** - Add `sectorId` to journal lines

---

## Regulatory Edge Cases (Phase 7 - Dedicated PR)

These WILL be handled in a dedicated phase:

1. **Prorata temporis** - Mid-year sector changes need prorated calculations
2. **Régularisation annuelle** - End-of-year adjustment when actual vs provisional prorata differs
3. **Credit transfer constraints** - TER credits may not transfer between sectors
4. **DOM-TOM rates** - Different VAT rates for overseas territories
5. **TIC period alignment** - Energy accise periods may not match VAT periods
6. **Sector change history** - Track when sectors were added/modified for audit
7. **Multi-establishment** - Future support for company with multiple SIRET locations
