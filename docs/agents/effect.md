---
updated: 2026-02-15
---

# Effect.ts Patterns

Server-side code uses Effect for services, repositories, infrastructure, and runtime wiring.
The goal is: composable business logic, typed failure, structured logging, and testable layers.

## Project Structure
- Runtime wiring: `src/server/runtime.ts`.
- Feature services/repos: `src/server/features/**`.
- Shared infra: `src/server/shared/infrastructure/**`.
- Shared error formatting: `src/server/shared/errors.ts`.

## Tags + Layers
- Use `Effect.Tag` / `Context.Tag` for capabilities (services, repos, infra).
- Provide implementations with `Layer.*`.
- Compose layers into a `ManagedRuntime` once at startup.

Notes from `src/server/runtime.ts`:
- Infrastructure layers depend on config.
- Repository layers depend on `Database`.
- Service layers depend on repos + infra.
- `ConsolaLoggerLive` replaces the default Effect logger.

## Writing Services
- Prefer `Effect.gen(function* () { ... })` for readable orchestration.
- Keep DB access in repos; keep business rules in services.
- For cross-repo write flows, wrap the orchestrator with `withTransaction(...)`.

## Error Modeling
- Define domain errors with `Schema.TaggedError`.
- Always fail with typed/tagged errors for expected failures.
- Avoid silent fallbacks; either return a typed error or throw a deliberate redirect/notFound.

Matching and formatting:
- Catch typed failures with `Effect.catchTag` or `Effect.catchTags`.
- For diagnostics, use `Cause.pretty(cause)`.
- For user-friendly logs, prefer the formatter in `src/server/shared/errors.ts`.

## Guards / Type Checks
- Prefer Effect-provided guards (examples: `Exit.isSuccess`, `Option.isSome`, `Either.isRight`).
- Avoid ad-hoc `_tag` string checks when the library already provides a guard.

## Logging
- Prefer `Effect.logDebug/info/warn/error` over `console.*`.
- Add request correlation via `Effect.annotateLogs({ requestId, userId, ... })`.
- `src/server/shared/lib/consola-logger.ts` routes Effect logs to the app logger.

## Concurrency
- Use `Effect.all([...])` for parallelizable work (independent reads).
- Use sequential composition for dependent steps (write -> read, idempotency locks, etc.).

## Practical Patterns

Error shaping for server boundaries:
- Keep typed failures as typed RPC errors and let the boundary transport them.

Request-local annotation:
- Put `requestId` in annotations once and let the logger attach it to every message.
