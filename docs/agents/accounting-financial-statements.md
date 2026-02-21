---
updated: 2026-02-09
---

# Accounting: Financial Statements

This repo generates French accounting financial statements from validated journal entries,
following PCG (Plan Comptable General) conventions.

## Where
- Feature folder: `src/server/features/accounting/financial-statements/`
- Services include income statement and balance sheet.

## Income Statement (Compte de resultat)
The income statement is derived by aggregating balances by account code:
- Operating result: class 7 revenue - class 6 expenses
- Financial result: 76x revenue - 66x expenses
- Exceptional result: 77x/78x revenue - 67x/68x expenses
- Net result: operating + financial + exceptional - income tax (69x)

## Inputs
- Validated journal entries only.
- Multi-tenant boundaries are enforced (user-scoped).

## Output Shape
- Use `Monetary` types throughout; no floating-point.
- Support year-over-year comparison when previous-year data is provided.

## Implementation Notes
- Prefer business logic in services; keep queries in repositories.
- For multi-step compute + persistence flows, wrap with `withTransaction(...)`.

## Related Money Rules
- Use `monetary` helpers (see `docs/agents/monetary.md`).
- Avoid serializing rich `Monetary` objects; use snapshots for transport.
