---
updated: 2026-02-09
---

# Monetary (Internal Money Library)

This repo uses the workspace package `monetary` for all money math.
Do not use floating-point arithmetic for currency amounts.

## Core Types
- `Monetary<TAmount>`: rich money object (arithmetic + formatting).
- `MonetarySnapshot<TAmount>`: plain JSON-serializable representation.
- `ScaledAmount<TAmount>`: `{ amount, scale }` for scaled integers (e.g. rates).

## Rules
- Prefer `Monetary` inside domain/server logic.
- When crossing a network or serialization boundary (server fn response, DB JSON, route
  loader return), prefer `MonetarySnapshot`.

Why: rich `Monetary` objects are not safe to JSON stringify across all environments.

## Common Helpers
- Create money: `monetary({ amount, currency, scale? })`.
- Convert for transport: `toSnapshot(money)`.
- Render: project helper `renderMoney` in `src/lib/monetary.ts`.

Related project code:
- Monetary utilities + schemas: `src/lib/monetary.ts`
- Display helpers: `src/lib/money.ts`

## DB Serialization
Drizzle custom type:
- `src/db/schema/monetary.ts` stores `Monetary` as `text` JSON of `MonetarySnapshot`.

Implications:
- DB columns using `monetaryType` round-trip as `Monetary<number>` in app code.
- Do not store raw decimals; store snapshots or use the custom type.

## Tax Rates (ScaledAmount)
Tax rates use a `ScaledAmount` backed by `numeric(5,3)`:
- Type: `taxRateType` in `src/db/schema/monetary.ts`
- Conversions:
  - `percentageToTaxRate(5.5) -> { amount: 55, scale: 3 }` (represents 0.055)
  - `taxRateToPercentage({ amount: 55, scale: 3 }) -> 5.5`

## When Adding New Money Fields
- Decide storage form: `Monetary` (custom type) vs `ScaledAmount` vs plain integer.
- Decide transport form: `MonetarySnapshot` for anything serialized.
- Add schemas at the boundary if the value comes from user input.

## Pitfalls
- Mixing currencies without explicit conversion.
- Returning `Monetary` objects from server functions (prefer snapshots).
- Using JS `number` for money math (only OK for display after snapshot conversion).
