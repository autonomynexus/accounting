---
updated: 2026-02-11
---

# Effect.ts Patterns

## Service Pattern
```typescript
// 1. Interface (R = never - deps resolved in Layer)
export type InvoiceServiceInterface = {
  readonly createInvoice: (params) => Effect.Effect<Invoice, Error, never>;
};

// 2. Tag (MUST use Effect.Tag - pre-commit enforced)
// Use @app/ServiceName prefix for uniqueness
export class InvoiceService extends Effect.Tag("@app/InvoiceService")<
  InvoiceService,
  InvoiceServiceInterface
>() {}

// 3. Layer (NO global imports - use yield*)
// Naming: camelCase + Layer suffix (layer, testLayer, mockLayer)
// Use 'layer' for production, NOT 'liveLayer'
export const InvoiceServiceLayer = Layer.effect(
  InvoiceService,
  Effect.gen(function* () {
    const db = yield* Database;
    const revalidator = yield* RevalidationService;

    const createInvoice = (params) =>
      Effect.fn("createInvoice")(function* () {
        const data = yield* Effect.tryPromise({
          try: () => db.insert(invoice).values(params),
          catch: (e) => new DatabaseError({ operation: "create", details: e }),
        });
        yield* revalidator.revalidatePaths(["/invoices"]);
        return data;
      });

    return InvoiceService.of({ createInvoice });
  })
);

// Test layer
export const InvoiceServiceTestLayer = Layer.succeed(
  InvoiceService,
  InvoiceService.of({
    createInvoice: () => Effect.succeed(mockInvoice),
  })
);
```

**Service Design Pattern**: Start by sketching service tags (no implementations) to reason about boundaries and dependencies before writing production code. Services should have `R = never` (resolve deps in Layer, not interface), **except `R = Database`**: repositories require it for tx propagation, services inherit it from repo calls (services never do direct db calls).

## Effect.fn Pattern
```typescript
// Effect.fn for named, traced effects (tracing spans, stack traces)
const processInvoice = Effect.fn("processInvoice")(function* (invoiceId: InvoiceId) {
  const invoice = yield* getInvoice(invoiceId)
  return yield* processData(invoice)
})

// Effect.gen for simple inline Effects
const simpleEffect = Effect.gen(function* () {
  return yield* fetchData
})
```

## Tagged Errors

- **Expected errors** (Schema.TaggedError): Domain failures callers handle (validation, not found, permission)
- **Defects** (Schema.Defect): Unrecoverable (bugs, invariant violations, external crashes)

```typescript
export class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError", { message: Schema.String }
) {}

export class HttpError extends Schema.Defect {}  // Unrecoverable

// Recovery: catchAll, catchTag("HttpError", ...), catchTags({...})
```

## NotFoundError Pattern (Page Builder)
```typescript
// app/lib/errors.ts - Domain errors MUST extend this
export abstract class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  "NotFoundError", { message: Schema.String }
) {}

export class InvoiceNotFoundError extends NotFoundError {}  // Shares _tag
```

Page builder catches ANY `*NotFoundError` via `Predicate.isTagged("NotFoundError")` → `notFound()` → 404.

## Repository NotFoundError Pattern (CRITICAL)

Repository `find*`/`get*` MUST fail with NotFoundError. **Never return undefined/null.**

```typescript
// ✅ CORRECT: Fail with NotFoundError
findById: (id, userId) => Effect.gen(function* () {
  const db = yield* Database;
  const result = yield* Effect.tryPromise({...});
  if (!result) return yield* new InvoiceNotFoundError({ message: "not found" });
  return mapDbRowToDomain(result);
}),

// ❌ WRONG: filterOrFail is fragile (undefined !== null is TRUE!)
repo.findById(id, userId).pipe(Effect.filterOrFail((r) => r !== null, ...))
```

**Null check rule**: Use `!result` or `!= null`. **Never** `!== null`.

## Schemas (UI/Server Contract)

**Date handling**: `Schema.DateFromSelf` for native Dates. `Schema.Date` only for JSON deserialization.

**Branded Types**: Brand ALL primitives, not just IDs
```typescript
export class InvoiceId extends Schema.String.pipe(Schema.brand("InvoiceId")) {}
export class Email extends Schema.String.pipe(Schema.brand("Email")) {}

// Schema.Class for composite types (use .make() to instantiate)
export class CreateInvoiceInput extends Schema.Class<CreateInvoiceInput>("CreateInvoiceInput")({
  issuerId: Schema.String,
  status: Schema.Literal("draft", "final"),
}) {}

const input = CreateInvoiceInput.make({ issuerId: "123", status: "draft" })
```

Validate at boundary (actions), services use inferred types (no validation).

## Config Management

```typescript
class AppConfig extends Context.Tag("@app/AppConfig")<
  AppConfig, { apiUrl: string; apiKey: string }
>() {
  static readonly layer = Layer.effect(AppConfig, Effect.gen(function* () {
    const apiUrl = yield* Config.string("API_URL")
    const apiKey = yield* Config.redacted("API_KEY")  // Auto-hidden
    return { apiUrl, apiKey: Config.value(apiKey) }
  }))

  static readonly testLayer = Layer.succeed(AppConfig, { apiUrl: "http://localhost:3000", apiKey: "test" })
}

// Defaults: Config.orElse(() => Config.succeed(3000))
// Validation: Config.mapOrFail((p) => p > 0 ? Effect.succeed(p) : Effect.fail(...))
```

## HTTP Clients

```typescript
class ApiClient extends Context.Tag("@app/ApiClient")<ApiClient, HttpClient.HttpClient>() {
  static readonly layer = Layer.effect(ApiClient, Effect.gen(function* () {
    return HttpClient.make().pipe(
      HttpClient.mapRequest(HttpClientRequest.bearerToken(token)),
      HttpClient.mapRequest(HttpClientRequest.acceptJson)
    )
  }))
}

const getUser = (id: string) => Effect.gen(function* () {
  const client = yield* ApiClient
  return yield* client.get(`/users/${id}`).pipe(HttpClientResponse.schemaBodyJson(UserSchema))
})
```

## Validation

**Option types** (prefer over T | null):
```typescript
const getOrg = (id: number | null) => Option.fromNullable(id).pipe(
  Option.flatMap((id) => Option.fromNullable(orgs.find(o => o.id === id)))
);

// Usage: Option.match({ onNone: () => "—", onSome: (org) => <Link data={org} /> })
```

**NO `any` types. Use tagged errors, not throws.**

**Union Types**: `Schema.Literal` for enums, `Schema.TaggedClass + Schema.Union` for complex variants.
Pattern match with `Match.value(...).pipe(Match.tag("Draft", ...), Match.exhaustive)`.

## Testing

```typescript
import { it, layer } from "@effect/vitest"

layer(InvoiceServiceTestLayer)  // Memoize once per file

it.effect("creates invoice", () => Effect.gen(function* () {
  const service = yield* InvoiceService
  const invoice = yield* service.createInvoice(params)
  expect(invoice.status).toBe("draft")
}))

it.scoped("handles resources", () => Effect.gen(function* () {
  const resource = yield* acquireResource  // auto cleanup
}))
```

## Observability

```typescript
const OtelLayer = NodeSdk.layer(() => ({
  resource: { serviceName: "myapp", serviceVersion: "1.0.0" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: "..." }))
}))

// Named spans with Effect.fn + withSpan
const fetchUser = Effect.fn("fetchUser")(function* (userId: string) {
  return yield* Effect.tryPromise(...).pipe(Effect.withSpan("fetchUser", { attributes: { userId } }))
})
```
