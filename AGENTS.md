# AGENTS.md

`@autonomynexus/accounting` — French accounting logic library (PCG, FEC, VAT, financial statements, liasse fiscale). Built with Effect.ts; uses `monetary` as a peer dependency.

## Commands
- Install: `bun install`
- Test: `bun run test`
- Typecheck: `bunx tsc -p tsconfig.build.json`
- Build: `bun run build` (tsc emit)
- Lint: `bun run lint` (oxlint --fix)
- Format: `bun run format` (oxfmt)

## Repo Map
- Entry point: `src/index.ts`
- Models & schemas: `src/models/`, `src/models.ts`
- Chart of accounts (PCG): `src/pcg/`, `src/chart-of-accounts.ts`
- Journal entries: `src/journal/`
- Financial statements (bilan, compte de résultat): `src/financial-statements/`
- Liasse fiscale (BNC-2035 etc.): `src/liasse-fiscale/`, `src/bnc-2035/`
- FEC export: `src/fec/`
- VAT declarations: `src/vat/`
- Amortization: `src/amortization/`
- URSSAF: `src/urssaf/`
- Exercice (fiscal year): `src/exercice/`
- Engine (computation): `src/engine/`
- Regime: `src/regime/`
- Threshold logic: `src/threshold/`
- Bespoke helpers: `src/bespoke/`
- Ports (interfaces): `src/ports/`
- Solde helpers: `src/is-solde/`
- Tests: `test/`

## Conventions (Always Apply)
- Package manager: bun only; do not add npm/yarn/pnpm lockfiles.
- ESM: `.js` extensions required in all imports (tsc emit, not bundled).
- Effect errors: prefer `Schema.TaggedError`, `Effect.catchTag/catchTags`, `Cause.pretty`.
- Effect guards: use library guards (e.g. `Exit.isSuccess`) vs ad-hoc `_tag` checks.
- Monetary: all money values use `monetary` types — never raw `number` for currency amounts.
- Logging: prefer `Effect.log*` over `console.*` (oxlint enforces `no-console`).
- Linting: oxlint enforced (`no-console`, `no-explicit-any`, `no-barrel-file` except `src/index.ts`, `no-namespace`).
- No barrel files: only `src/index.ts` is allowed as a barrel (re-export) file.

---

## Retrievable Documentation

<!-- PROJECT-AGENTS-MD-START -->
Prefer retrieval-led reasoning over pre-training-led reasoning.

[Project Docs]|root: ./docs/agents|Retrievable docs for project patterns and conventions
|effect.md: Tag/Layer, runtime, Effect.gen, Schema.TaggedError, Cause/Exit, logging, error matching
|effect-patterns.md: Effect.ts service pattern, layers, error handling, dependency injection
|monetary.md: Monetary types, snapshots, arithmetic helpers, Drizzle serialization, tax rates
|logging.md: wide events, 1 log per request, spans, structured logging standards
|accounting-financial-statements.md: PCG income statement, balance sheet, journal aggregation, money rules
<!-- PROJECT-AGENTS-MD-END -->
