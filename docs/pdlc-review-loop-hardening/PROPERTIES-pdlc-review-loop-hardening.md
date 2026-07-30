---
feature: pdlc-review-loop-hardening
---

# PROPERTIES — pdlc-review-loop-hardening

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-review-loop-hardening.md` v1.6 → `FSPEC-pdlc-review-loop-hardening.md` v1.8 → `TSPEC-pdlc-review-loop-hardening.md` v1.7 → `PLAN-pdlc-review-loop-hardening.md` v1.4 → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/**`) |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,product-manager}-PROPERTIES-v{N}.md` (this branch, while active) |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` (Phase H) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 1.0 | 2026-07-30 |

> **Altitude.** The REQ states the observable behaviour, the FSPEC how it is produced and pins the
> sixty-six acceptance tests, the TSPEC how it is built and proved with *examples*, the PLAN when each
> assertion is allowed to be red. This document states what must hold over **generated** inputs: the
> domains, the invariants quantified over them, the shrink order, and — for every property — the
> concrete source mutation that would falsify it. It restates no FSPEC behaviour; behaviour is cited
> by section.

## 1. Overview

### 1.1 What this document decides

Seventeen properties, each one an invariant over a generated input space rather than over a hand-picked
example. Each carries five things, and a property missing any of them is not finished:

1. a **stable id** (`PROP-{DOMAIN}-{NN}`), unique in this document and namespaced away from both the
   FSPEC's `AT-{N}` range and the PLAN's fifteen `RLH-`-prefixed non-AT ids (PLAN §7.5);
2. the **invariant**, stated precisely enough that two engineers write the same assertion;
3. the **generator strategy**, built on the primitives `__tests__/helpers/driftGenerators.js` already
   ships (§3);
4. the **falsifying condition** — a named mutation to `pdlc/workflows/orchestrate-dev.js` (or its
   sibling) that turns the property red, recorded in §5;
5. the **owning task** from PLAN §4, or an explicit statement that the property is verification-only.

### 1.2 The floor of seven, and why this document carries more

TSPEC §8.2 names **seven** properties — one per component in a table it owns — and PLAN §7.2 restates
that table's two corrections. Those seven are the floor. They are reproduced here as
`PROP-DIGEST-01/-02`, `PROP-SCAN-01`, `PROP-NAME-01`, `PROP-ROUND-01`, `PROP-FORCE-01` and
`PROP-COMPLETE-01`, **citing** §8.2 rather than restating its wording, because §8.2 owns them.

The ten beyond the floor are derived, not invented, and each closes a gap this document had to
measure rather than assume:

- **TSPEC §8.1 and §8.2 do not agree on the count.** §8.1 says *"Every parameterisable component in
  the L1 row carries at least one property"*, and the L1 row is `every parser, sha256Hex, scanLines,
  isStale, isComplete, deriveRoundWindow, parseForcePhases, updateQueueStatus`. §8.2's table has seven
  rows and leaves **`parseApprovalHash`, `parseRevisionComplete`, `parseResolvedMarker`,
  `extractRecommendation`, `isStale` and `updateQueueStatus`** without one. `PROP-HASH-01`,
  `PROP-TRAILER-01`, `PROP-RESOLVE-01` and `PROP-STALE-01` close four of those six; §8 records the
  two that are deliberately left open and why.
- **Four invariants in the TSPEC are stated as invariants and proved only by enumeration.** `G-INV`
  (§2.5), the `ListFailure` disposition table (§4.2), `S-INV` with its 36-dispatch bound (§4.5,
  §5.6.1), and §8.5's await-classification rulings are each written as a **predicate over paths or
  positions, never as a list of the sites that satisfy it today** — and each is currently discharged
  by an AT that enumerates four exits, two call sites, one interleaving or three shipped lines
  respectively. A predicate stated over a space and checked at four points is exactly the shape a
  generated quantifier is for. `PROP-GINV-01`, `PROP-LIST-01a/-01b`, `PROP-EPISODE-01` and
  `PROP-AWAIT-01` are those four quantified.
- **Two more** — `PROP-APPROVE-01` (TSPEC §5.4's unanimity, a conjunction over a reviewer pair × two
  carriers) and `PROP-WINDOW-01` (§11.5's `N-a` threading over arbitrary start indices) — generalise
  assertions the PLAN already owns at a single point.

### 1.3 Relationship to PLAN §7.3, the permitted-red ledger

**PLAN §7.3 is the gate, and this document does not amend it.** §7.3 carries the seven floor
properties inside four of its rows (`scanLines property`, `both digest properties`, `both
round-derivation properties`, `parseForcePhases catalogue-closure`, `isComplete property`). The ten
new properties are named in no ledger row, because the PLAN converged before they existed.

Each new property therefore declares, in §7's coverage matrix, the `Green from` batch and
`Permitted red` window it **would** occupy, derived mechanically from the batch of its greening task
— the same derivation §7.3 uses. Adopting those rows into §7.3 is a mechanical PLAN edit owned by the
property's implementing task; it is not deferred work and it needs no new surface. Where a new
property's derived window is **identical** to an existing row's, this document says so and the
property rides that row rather than proposing another (this is true of `PROP-HASH-01`,
`PROP-TRAILER-01` and `PROP-AWAIT-01`).

Where a property lands in a file with a **sole** owning task (PLAN §5.3's single-writer rule), that
task is the owner. Where an invariant genuinely spans two files, it is split into two named halves
with distinct jest ids and one owner each — the same construction PLAN §7.4 uses for
`RLH-AT-30-module` / `-30-orch`. No property is owned twice.

### 1.4 What is out of scope here

- **Oracle *wording* for the example-based ATs.** FSPEC §19 owns AT-01…AT-66 and TSPEC §8.3 maps them
  to files. A property that merely re-ran one AT over generated inputs would be weak; §7's matrix
  states, per property, what it covers that the examples cannot.
- **Any change to the seven-name reviewer/doc-type catalogues, the halt strings, or the constants.**
  Those are TSPEC §4.1, §4.8 and §6.4 literals. Fixtures here **cite** them (§6.1) and never retype
  them.
- **A shared generator module.** PLAN §7.2 records the decision that domain generators stay per-file,
  file-local and unexported, and that a second *primitive* library is not written. That decision was
  reviewed and accepted twice; §3 builds on `driftGenerators.js` and proposes nothing beside it.

## 2. Conventions

### 2.1 Identifier scheme and classification

`PROP-{DOMAIN}-{NN}`, with `DOMAIN` ∈ `DIGEST`, `SCAN`, `NAME`, `ROUND`, `FORCE`, `COMPLETE`, `HASH`,
`TRAILER`, `RESOLVE`, `STALE`, `LIST`, `APPROVE`, `GINV`, `EPISODE`, `WINDOW`, `AWAIT`. A property
with two halves takes a letter suffix (`PROP-LIST-01a`, `-01b`), never a second number.

**The jest test name is `PROP-{DOMAIN}-{NN}`, unprefixed — and the domain set above was chosen by
measurement, not by taste.** PLAN §1.3 mandates the `RLH-` prefix for *acceptance tests* because
`AT-{N}` collides with the preceding feature's ids (measured: `documentOracles.test.js` carries
`AT-22 [red-until-L-06]` at HEAD). **The same hazard exists for `PROP-` ids, and this document hit
it.** Measured at HEAD, `grep -rn "PROP-" pdlc/workflows/__tests__/` returns **431 matches across 28
files**, in twenty-three domains already spoken for by the `pdlc-workflow-distribution` feature:
`PROP-PARSE`, `-BKP`, `-LOOP`, `-SEAM`, `-CLS`, `-BSL`, `-NEG`, `-SKILL`, `-MTM`, `-IMPL`, `-COMPAT`,
`-RSN`, `-ENTRY`, `-DET`, `-HARVEST`, `-PIPELINE`, `-SHIP`, `-ARTIFACTS`, `-OBS`, `-NFR`, `-GATE`,
`-MSG`, `-HERMETIC`.

One of those is a **live** `describe()` name, not prose: `pipelineWiring.test.js:235` declares
`describe("PROP-GATE-01: main() halts when Phase R reviewLoop returns converged: false", …)`. The
G-INV property drafted here was originally `PROP-GATE-01`; it is **`PROP-GINV-01`** for exactly that
reason, which also matches the TSPEC's own name for the invariant. Every one of the sixteen domains
listed above was checked individually against `__tests__/` at HEAD and returns **zero** matches
(`GINV` included). A future property in this feature must repeat that check before taking a domain —
the collision is cheap to avoid and expensive to diagnose, because two `describe`s of one name in one
run make a failure report ambiguous exactly when it matters.

Each property is classified with the te-author category table and a test level from TSPEC §8.1:

| Level | Meaning here |
|---|---|
| **L1 — pure** | string (or record) in, record out; no seam, no filesystem (TSPEC §8.4: *"L1 may not touch the filesystem"*) |
| **L2 — orchestration** | driven through `main()` or `reviewLoop` with **synchronous** doubles from `__tests__/helpers/seams.js` (RLH-02) |
| **L3 — composition/source** | reads the composition root or the module **source text**; injects nothing |

### 2.2 Seeds: literal, printed, and overridable

Every property file declares its **own literal seed constant** and passes it through
`resolveSeed(literalSeed)` from `__tests__/helpers/driftGenerators.js`. Measured at HEAD: that
function reads `process.env.PDLC_PROP_SEED`, returns the literal when the variable is unset or empty,
throws when it is set to a non-decimal string, and otherwise returns `Number.parseInt(raw, 10)`. It is
therefore both the reproducibility mechanism and the widening escape hatch, and no property file reads
`process.env` itself.

Three rules, inherited from the generator's own contract and from the preceding feature's PROPERTIES
§1.3:

1. **Reproduction is by replay, not by index.** `seeded(seed)` is a *stateful* xorshift32; case *n* is
   reproduced by replaying draws 1…*n*, never by seeking. A property that wants case 7 in isolation
   must re-run cases 1…6 first. Every property file **prints its resolved seed** in the failure
   message, so a red is reproducible from the CI log alone.
2. **The seed is a constant in the file, not a clock and not a counter.** A seed derived from
   `Date.now()` makes a red unreproducible, which is the failure mode that makes property tests get
   deleted.
3. **`PDLC_PROP_SEED` widens the drawn set; it never narrows the assertion.** A property that passes
   only under its literal seed is a defect in the property, not a licence to pin the seed.

### 2.3 Shrinking — and a measured limitation of the shipped `shrink`

TSPEC §8.2 says *"`shrink` is used for the failure report, not for the pass path."* That is the rule
this document follows. **But the shipped `shrink` does not know this feature's case shapes**, and the
implementer must not discover that at batch 2.

Measured at HEAD, `driftGenerators.js`'s `shrink(caseValue)` dispatches on `caseValue.kind` over
exactly four kinds — `"manifest"`, `"bytes"`, `"id"`, `"subRecipe"` — and its `default` branch
`return []`. Every domain this feature generates (review filenames, fenced markdown documents,
heading sets, force-phase token strings, listing shapes, episode interleavings, source fragments)
falls in the `default` branch and shrinks to **nothing**.

The disposition, per property, is one of exactly two — stated in each property's body and never left
implicit:

| Disposition | When it applies | What the property does |
|---|---|---|
| **Reuse a shipped kind** | the case is naturally a byte string | wrap the failing case as `{ kind: "bytes", bytes: Buffer.from(text, "utf8") }` and walk `shrink`'s existing ladder (floor 64 bytes). Applies to `PROP-DIGEST-01`, `PROP-DIGEST-02`, `PROP-SCAN-01` |
| **File-local ladder** | the case is structured | declare a short, ordered, **explicit** ladder of strictly simpler cases in the property's own file, unexported, and walk it. Never a search. Applies to the other thirteen |

A file-local ladder is **not** a second primitive library and does not contradict PLAN §7.2: §7.2
forbids re-implementing `int` / `pick` / `shuffle` / `bytes` / `resolveSeed` / `shrink` **as a shared
module**, and declares domain generators file-local by design. A ladder over a domain the shared
`shrink` returns `[]` for is that same decision applied to the same domain. Nothing here re-implements
`shrink`'s four kinds; the `"bytes"` kind is *called*, not copied.

**Every ladder is bounded and terminates**: each rung is strictly simpler by a stated measure (fewer
listing entries, fewer headings, fewer tokens, fewer rounds, shorter source fragment), and the walk
stops at the first rung that no longer falsifies — which is what gets reported.

### 2.4 Runtime constraints these properties must respect (C-2)

Properties in this document divide cleanly by what they touch, and only one class is constrained by
C-2 at all:

- **The test files are ordinary ESM under `pdlc/workflows/__tests__/`.** They may `import`, may read
  `process.env` (through `resolveSeed`), and may use `Buffer` and `crypto` — measured: seven suites
  already do exactly this. C-2 governs `pdlc/workflows/*.js` **workflow sources**, not their tests.
- **The subjects, however, are workflow source.** So no property may require the implementation to
  acquire a capability C-2 forbids. Three consequences are load-bearing and are re-stated in the
  properties that depend on them: `sha256Hex` is hand-rolled pure JS with **no `crypto`, no
  `TextEncoder`, no `BigInt`** (TSPEC §5.3), so `PROP-DIGEST-02`'s oracle is the externally computed
  known-answer vectors plus determinism — **not** a comparison against `require("crypto")` inside the
  property, which would silently make the property pass on a subject that imported `crypto` and so
  breached C-2; the constants of §4.8 are **module-level and unexported**, so `PROP-ROUND-01` and
  `PROP-EPISODE-01` observe `MAX_REVIEW_ROUNDS` and `MAX_AUTHORING_DISPATCHES` only through behaviour
  (a window width, a dispatch count), never by importing them; and **every injected IO call in the
  subject is `await`ed** (§8.5), which is exactly what `PROP-AWAIT-01` quantifies.
- **`PROP-AWAIT-01` reads source text, never `dist/`.** TSPEC §8.4 forbids an L2 test reading a
  generated artifact to make a claim about source behaviour, and §8.5 explicitly permits the await
  scan over `orchestrate-dev.js` / `orchestrate-queue.js` **source** at any level.

### 2.5 Where these tests run, and how long they take

The workflow suite is run **only** as `cd pdlc/workflows && npm test`, which is
`node --experimental-vm-modules node_modules/jest/bin/jest.js` — measured from
`pdlc/workflows/package.json` at HEAD. **A bare `npx jest <file>` cannot run these ESM suites at
all**: PLAN §4.1 records, re-measured 2026-07-30, that it reports `Tests: 0 total` and exits **1**
with `SyntaxError: Cannot use import statement outside a module`, while the same file under
`npm test -- <file>` reports 20 passed and exits 0. A property "verified" with the bare form has been
verified against a suite that never ran.

**Measured baseline, re-run for this document on 2026-07-30 at HEAD `556e56d`+branch:**

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        179.795 s
```

exit 1, the single red being `documentOracles.test.js`'s intentional `AT-22 [red-until-L-06]`. This
reproduces PLAN §2.1's figures exactly. The wall clock **sits on the 180 s foreground watchdog**
(179.795 s this run; PLAN §4.1 recorded 179.2–185.4 s across five runs of one HEAD), so every suite
run in this feature — including every property run — goes in the background with a generous timeout.
That is a constraint on *how the properties are executed*, and it is why §4's per-property case counts
are stated as budgets rather than left to the implementer: seventeen properties drawing a thousand
cases each would put the gate past the point where anyone runs it.

**Per-property case budget: 100 generated cases by default**, stated per property where it differs,
and each property must complete within a few seconds at that budget. Exhaustive enumeration is used
wherever the space is small enough to enumerate (`PROP-LIST-01`'s eight cells, `PROP-FORCE-01`'s
seven-token catalogue, `PROP-GINV-01`'s six exits × three POSTMORTEM states) — exhaustive beats
sampled whenever it is affordable, and the exhaustive cases are the ones that cannot regress into
"the generator stopped producing that shape".

## 3. Generators

### 3.1 The shipped primitives — measured, not assumed

`pdlc/workflows/__tests__/helpers/driftGenerators.js` is reused **unmodified**. Read at HEAD, it
exports eight symbols; the five this feature consumes, with their measured behaviour:

| Export | Measured signature and behaviour at HEAD | Used by |
|---|---|---|
| `seeded(seed)` | returns `{ seed, int(lo,hi), pick(arr), shuffle(arr), bytes(n) }`. Stateful xorshift32; `state = (seed >>> 0) \|\| 0x9e3779b9`, so **seed 0 silently becomes `0x9e3779b9`** — a property must not treat 0 as a distinct seed. `int` throws when `hi < lo`; `pick` throws on a non-array or empty array; `shuffle` copies (`arr.slice()`) and does not mutate its argument; `bytes(n)` returns a **`Buffer`**, not a string or `Uint8Array` | every property |
| `resolveSeed(literalSeed)` | `PDLC_PROP_SEED` override; unset or `""` ⇒ the literal; non-decimal ⇒ **throws**; otherwise `parseInt(raw, 10)` | every property file, once |
| `shrink(caseValue)` | dispatches on `caseValue.kind` over **exactly four** kinds — `"manifest"`, `"bytes"`, `"id"`, `"subRecipe"` — `default: return []` (§2.3) | `PROP-DIGEST-01/-02`, `PROP-SCAN-01` |
| `genId(rng, force)` | an `M6_ID_REGEX`-conforming id, 1–64 bytes, first byte alphanumeric, body `[A-Za-z0-9._-]` | **not used** — this feature's identifiers are role slugs and doc types from closed catalogues, not free ids |
| `genStamp(rng, opts)` | a 16-byte `YYYYMMDDTHHMMSSZ` stamp | **not used** — no property here has a timestamp domain |

`enumerateLeaves`, `enumerateEvidenceVectors` and `readFaultTokens` are the drift feature's domain
enumerations and are **not** used here; `readFaultTokens` shells out through `execFileSync`, which no
property in this document needs.

Two consumption rules follow from the measurements above and are binding:

- **`bytes(n)` is a `Buffer`.** A property drawing text from it must decode explicitly — and the
  decode is part of the domain, not an incidental detail. `Buffer.toString("utf8")` on arbitrary bytes
  **replaces invalid sequences with U+FFFD**, which is a *different* generator from "arbitrary
  well-formed UTF-8 text". `PROP-DIGEST-01`/`-02` state which one they want (§4.1) rather than letting
  the encoder decide.
- **`shuffle` is pure.** Listing-order properties (`PROP-ROUND-01`) rely on that: they shuffle the same
  basename multiset repeatedly and compare results, which a mutating shuffle would silently make
  vacuous.

Verified at HEAD: seven suites already consume this file — `driftBackups`, `driftBaseline`,
`driftFault`, `driftHook`, `driftOrdering`, `driftRepoRoot`, `queueDriftGate`. It is reused, **not
re-implemented**, and this document proposes no second primitive library (PLAN §7.2, TSPEC §1.5).

### 3.2 Domain generators: five, file-local, unexported

PLAN §7.2 decides this and it is not reopened. The five domains, each built **inside** the test file
that consumes it, over the primitives above:

| Domain | Owning file / task | Draws |
|---|---|---|
| **D1 — review basenames** | `roundDerivation.test.js` (RLH-11) | conforming `CROSS-REVIEW-{role}-{DOCTYPE}[-v{N}].md` for this doc type; conforming for *another* doc type; and one mutated part per `FILENAME_FAILURES` member |
| **D2 — fenced markdown** | `scanLines.test.js` (RLH-03) | line sequences over an alphabet of fence openers (3–6 backticks/tildes, optionally indented), closers, and content lines |
| **D3 — codepoint strings** | `approvalHash.test.js` (RLH-06) | ASCII, multi-byte UTF-8, surrogate pairs, and lone surrogates; plus `\r\n` / `\r` / 0–5 trailing-newline injection |
| **D4 — heading sets** | `completeness.test.js` (RLH-12) | subsets and supersets of §5.9's per-class required headings, each with a body drawn from {non-empty, empty, `TBD`, HTML comment, fenced-`TBD`} |
| **D5 — force-phase token strings** | `forcePhases.test.js` (RLH-14) | token multisets over the valid array, `all`, casing variants, junk, and the separator alphabet `[,\s]+` |

Three more domains are needed by the properties beyond the floor, and each is likewise file-local:

| Domain | Owning file / task | Draws |
|---|---|---|
| **D6 — phase-entry configurations** | `haltAndQueue.test.js` (RLH-25) | the cross product of {forced, unforced} × listing shape × per-role verdict × anchor agreement × document-mutation × POSTMORTEM state, for `PROP-GINV-01` and `PROP-APPROVE-01`'s gate half |
| **D7 — episode interleavings** | `pacingWrapper.test.js` (RLH-21) | per-round sequences of dispatch outcomes drawn from {progress-terminal, progress-nonterminal, no-progress, trailer-`yes`, trailer-`no`, trailer-absent, trailer-duplicated, trailer-unparseable}, over 1…`MAX_REVIEW_ROUNDS` rounds |
| **D8 — source fragments** | `runtimeBundle.test.js` (RLH-31) | synthetic JS text placing a scan-set call in one of the classified positions, plus masked positions (inside a string, template, regex, comment) and one shape matching no ruling |

**D8's fragments are never executed.** They are text handed to the bracket-depth walk (PLAN §9.2 item
3), which is the subject. Executing generated JS in a jest worker would add an evaluation channel this
feature has no use for, and a fragment that must parse is a *narrower* domain than one that must only
be scanned.

### 3.3 Non-vacuity: every generator must prove it produced the shape it claims

The failure mode this repo has paid for twice — PLAN §4.1's await-scan count, wrong in two successive
revisions, and TSPEC §8.2's two restated rows — is a generator that silently stops producing the
adversarial case while the property stays green. Every property in §4 therefore carries a
**non-vacuity conjunct** asserted over the *generated set*, not over one draw:

1. **Floors, forced rather than hoped for.** Where a property depends on a shape appearing (D1's
   other-doc-type basenames, D2's nested four-in-three fence, D5's `all` token, D7's trailer-absent
   outcome), the generator **forces** a stated minimum count deterministically — the same construction
   `genId(rng, force)` uses at HEAD for the drift feature's adversarial floors — and the property
   asserts the floor was met before asserting anything else.
2. **Set-level assertions.** Where a property is a partition or a totality claim, it asserts the
   observed class multiset covers every class, so a generator drawing only one class fails loudly
   instead of passing trivially.
3. **The seed is printed with the floor counts** in the failure message, so a red says both which case
   failed and whether the set was adversarial at all.

## 4. Properties

## 5. Oracles

## 6. Fixtures

## 7. Coverage matrix

## 8. Gaps, residuals, and measured inconsistencies
