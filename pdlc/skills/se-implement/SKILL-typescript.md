---
name: se-implement-typescript
description: TypeScript supplement for se-implement. Encodes TS-specific conventions — vitest, pnpm, ESM, ajv, _spawnFn injection — to be loaded alongside the core SKILL.md when the assigned phase targets TypeScript.
---

# se-implement TypeScript Supplement

Load this file **in addition to** `SKILL.md` when the assigned phase targets TypeScript. This supplement overrides or extends any language-neutral guidance in the core with TypeScript-specific conventions.

---

## Language and Runtime

- **Language:** TypeScript (strict mode — `"strict": true` in `tsconfig.json`)
- **Module format:** ESM (`"module": "NodeNext"` or `"module": "ESNext"` per project config)
- **Package manager:** pnpm (workspace monorepo — use `pnpm` not npm for installs)
- **Type-check command:** `tsc --noEmit` (always run before committing)
- **Build command:** per project (e.g. `pnpm run build` via tsup)

---

## Testing — vitest

Use **vitest** for all unit and integration tests.

```typescript
// vitest test file — co-locate with source or place under tests/
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MyService', () => {
  it('returns null when the record is not found', async () => {
    const fakeStore = { findById: vi.fn().mockResolvedValue(null) };
    const svc = new MyService(fakeStore);
    const result = await svc.get('missing-id');
    expect(result).toBeNull();
  });
});
```

Key vitest conventions:
- `vi.fn()` for stub functions; `vi.spyOn()` to wrap real implementations
- `vi.useFakeTimers()` / `vi.useRealTimers()` to control time
- `vi.mock()` only for third-party modules you do not own — inject fakes for your own code
- `beforeEach(() => vi.clearAllMocks())` to reset stubs between tests

Run tests with:
```
pnpm test               # run all tests once
pnpm run test:watch     # watch mode
```

---

## Dependency Injection — TypeScript Pattern

Interfaces define service boundaries; constructors receive dependencies.

```typescript
// 1. Define the protocol
interface DataStore {
  insert(record: Record): Promise<void>;
  findById(id: string): Promise<Record | null>;
}

// 2. Implement the service with injected dependencies
class ContentService {
  constructor(
    private readonly store: DataStore,
    private readonly claude: ClaudeClient,
    private readonly logger: Logger,
  ) {}
}

// 3. Composition root — the only place for `new`
const store = new PostgresDataStore(pgClient);
const claude = new AnthropicClaudeClient(apiKey);
const service = new ContentService(store, claude, logger);
```

---

## `_spawnFn` Injection (Claude SDK Seam)

`@yumo/claude-sdk`'s `ClaudeClient` accepts an optional `_spawnFn` parameter that replaces the real child-process spawn. Inject a fake in tests to avoid launching the real `claude` binary:

```typescript
import type { SpawnFn } from '@yumo/claude-sdk';

const fakeSpawn: SpawnFn = (_cmd, _args, _opts) => ({
  stdout: readable('{"type":"result","result":"ok"}'),
  stderr: readable(''),
  exitCode: Promise.resolve(0),
});

const client = new ClaudeClient({ apiKey: 'test', _spawnFn: fakeSpawn });
```

Tests that use `_spawnFn` are fast (no subprocess) and deterministic.

---

## Schema Validation — ajv

Use **ajv** (strict mode, draft-07) for JSON Schema validation in TypeScript.

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ strict: true, allErrors: true });
addFormats(ajv);

const validate = ajv.compile(mySchema);
const valid = validate(data);
if (!valid) throw new Error(ajv.errorsText(validate.errors));
```

All schemas must pass `ajv` validation in tests. When authoring new JSON schemas, also verify they match the Python `jsonschema` validator (cross-language parity — see TSPEC for the parity fixture catalog).

---

## ESM Module Conventions

- Use `.js` extensions in import paths (ESM resolver requires explicit extensions even in TS source)
- No default exports — prefer named exports for tree-shaking and refactoring safety
- Barrel index files (`index.ts`) re-export only public API surface
- Avoid circular imports — structure packages so dependencies are one-directional

---

## Frontend (React) Pattern

```typescript
import { createContext, useContext } from 'react';

interface Services { api: ApiService; }
const ServicesContext = createContext<Services | null>(null);

// In tests — wrap the component under test
const mockServices = { api: { fetch: vi.fn().mockResolvedValue([]) } };
render(
  <ServicesContext.Provider value={mockServices}>
    <MyComponent />
  </ServicesContext.Provider>
);
```

- Query priority: Role > Label > Placeholder > Text > TestId
- Use `@testing-library/user-event` over `fireEvent`
- Use `waitFor` / `findBy*` for async updates
- Use `MemoryRouter` for routed components

---

## Type Safety Rules

- `"strict": true` — no implicit `any`, no implicit `this`, strict null checks
- Avoid explicit `any`; if unavoidable, add a `// reason: ...` comment
- Prefer `unknown` over `any` for external data; narrow with type guards before use
- Use `as const` for literal type narrowing on static data
- Export types alongside their values: `export type { MyType }` in index files

---

## Commit Conventions

Follow the project's conventional-commit format:

```
feat(scope): short present-tense summary
fix(scope): what the bug was and how it is fixed
test(scope): add / extend tests for X
refactor(scope): rename / restructure without behavior change
chore(scope): dependency bump, config change
```

One logical unit per commit. Tests and their implementation land in the same commit.
