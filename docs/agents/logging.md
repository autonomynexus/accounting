---
updated: 2026-02-11
---

# Logging Standards

## Philosophy: Wide Events

**1 log per request max.** Services use spans for tracing, not logs.

Source: `docs/plans/wide-events-refactor.md`

## When to Log

| Level        | When to Use                              |
| ------------ | ---------------------------------------- |
| `logError`   | Sentry-worthy failures only              |
| `logWarning` | Anomalies worth investigating            |
| `logInfo`    | NEVER in services (action builder emits) |
| `logDebug`   | NEVER in committed code                  |

## Exception: Debugging

Quick console.log / Effect.logDebug while debugging is FINE.
Remove before committing.

## Critical: Cause as 2nd Arg

Effect's Logger receives cause ONLY when passed as 2nd positional arg.
Passing in data object shows `[object Object]`.

```typescript
// ✅ CORRECT
Effect.tapErrorCause((cause) =>
  Effect.logError("PDF generation failed", cause).pipe(
    Effect.annotateLogs({ documentId, documentType }),
  ),
);

// ❌ WRONG - logs [object Object]
Effect.tapErrorCause((cause) =>
  Effect.logError("PDF generation failed", {
    documentId,
    cause, // NOT formatted!
  }),
);
```

## Services: Spans, Not Logs

```typescript
// ✅ CORRECT
yield* addRequestContext({ entityType: "invoice", entityId: id });
const buffer = yield* generatePdf(...).pipe(Effect.withSpan("generate-pdf"));

// ❌ WRONG
yield* Effect.logDebug("Generating PDF", { documentId });
const buffer = yield* generatePdf(...);
```

## Context Enrichment

Use `addRequestContext()` to add business data to the wide event:

```typescript
yield *
  addRequestContext({
    entityType: "invoice",
    entityId: invoice.id,
    documentNumber: invoice.number,
  });
```

Action builder emits this context in `ActionCompleted`/`ActionFailed`.

---

## Logging Review Checklist

Review logging changes. ONLY report violations - do NOT list correct patterns.

### Check 1: Cause Handling (CRITICAL)

Look for `tapErrorCause` or `logError` with cause.

**Violation**: Cause in data object
```typescript
Effect.logError("message", { cause, ...data });
```

**Correct**: Cause as 2nd arg
```typescript
Effect.logError("message", cause).pipe(Effect.annotateLogs({ ...data }));
```

### Check 2: No Service Logs (HIGH)

Services (`*.service.ts`) should NOT contain:
- `Effect.logInfo`
- `Effect.logDebug`
- `Effect.log`

**Exception**: `Effect.logError` for Sentry-worthy failures is OK.
**Correct**: Use `Effect.withSpan` for tracing.

### Check 3: Debug Logs in Production (MEDIUM)

`Effect.logDebug` should not exist in committed service/repository code.
**Exception**: Actively being debugged (should be removed before merge).

### Severity Guide

- **Critical**: Cause formatting broken (will log `[object Object]`)
- **High**: Service logging (violates wide events)
- **Medium**: Debug logs in production code

### Output Format

Report ONLY violations:

| #   | Severity | Issue                | File:Line     |
| --- | -------- | -------------------- | ------------- |
| 1   | Critical | Cause in data object | service.ts:42 |

If no violations: "No logging violations found."
