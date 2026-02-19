# AN SAS — First Exercise Filing Scripts (Aug–Dec 2025)

## Deadlines

| Filing | Form | Deadline |
|--------|------|----------|
| IS Solde | 2572-SD | ~April 15, 2026 |
| Liasse Fiscale | 2065 + 2050-2059 | ~May 5, 2026 |
| CA12 (TVA annuelle) | 3517-S-SD | ~May 5, 2026 |
| FEC | — | Mandatory backup |

## Usage

1. Fill in `data.ts` with actual figures (expenses, bank balance)
2. Run each generator:

```bash
bun scripts/an-sas-2025/generate-2572.ts   # IS solde
bun scripts/an-sas-2025/generate-liasse.ts # Liasse fiscale (CERFA line values)
bun scripts/an-sas-2025/generate-ca12.ts   # TVA annual declaration
bun scripts/an-sas-2025/generate-fec.ts    # FEC file
```

3. Each script outputs CERFA line codes → values to enter on impots.gouv.fr
4. FEC script also generates the `.txt` file to archive

## First Exercise Context

- Zero revenue (setup period only)
- IS = €0, loss carries forward
- TVA: likely a credit (TVA deductible on setup expenses > TVA collected)
- Main entries: capital deposit (€5,000), setup expenses
