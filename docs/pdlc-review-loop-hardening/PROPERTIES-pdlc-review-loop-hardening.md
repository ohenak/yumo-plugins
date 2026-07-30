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
property rides that row rather than proposing another.

**Measured outcome: every one of the ten rides an existing row.** Each new property shares a file, a
writing task and a greening task with an assertion §7.3 already carries, so its derived window is by
construction that row's window — `PROP-HASH-01` rides the digest row, `PROP-STALE-01` the
`RLH-AT-15/-16/-18` row, `PROP-TRAILER-01`, `PROP-LIST-01b` and `PROP-EPISODE-01` the
`RLH-AT-35 … -58` row, `PROP-RESOLVE-01` and `PROP-APPROVE-01` the `RLH-AT-08 … -57` row,
`PROP-LIST-01a` and `PROP-GINV-01` the `RLH-AT-21 … -34-orch` row, `PROP-WINDOW-01` the
`RLH-LOOP-01`/`-02` rows, and `PROP-AWAIT-01` the green-on-arrival `RLH-SCAN-01` row. **No new
ledger row is proposed by this document** — §7's matrix records the row each property rides, and
adding the property's name to that row's `Assertion(s)` cell is the whole of the mechanical PLAN
edit.

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

**What the shipped `"bytes"` arm actually buys — measured, and it is less than v1.0 claimed.**
`driftGenerators.js:453–457` at HEAD, with `const BYTES_FLOOR = 64;` at `:423`:

```js
case "bytes": {
  const bytes = caseValue.bytes;
  if (!bytes || bytes.length <= BYTES_FLOOR) return [];
  return [{ kind: "bytes", bytes: bytes.slice(0, BYTES_FLOOR) }];
}
```

It is **not a ladder**. It returns **at most one** candidate, and only when the case exceeds 64 bytes;
at or below 64 bytes it returns `[]`. The single rung is a raw byte truncation, so it splits multi-byte
UTF-8 sequences — the shapes `PROP-DIGEST-02`'s floors exist to force — and the truncated case usually
lands in a different domain and stops falsifying, at which point the walk reports the original. **This
document therefore claims one rung, never a ladder, and v1.0's "walk `shrink`'s existing ladder" is
withdrawn** (SE F-05, PM F-09, PM R-2).

Where that one rung is a **guaranteed no-op**, say so rather than imply a shrink path:

| Property | Shipped `"bytes"` rung | Why |
|---|---|---|
| `PROP-DIGEST-01`, `PROP-DIGEST-02` | useful above 64 bytes only | domain is `n ∈ 0…512`, so roughly an eighth of every corpus has no shrink step at all |
| `PROP-HASH-01`, `PROP-STALE-01` | **no-op** | the case turns on a 64-hex trailer/anchor at the document's end; truncating to the first 64 bytes removes exactly the thing being tested, so the rung never still-falsifies |
| everything else | not used | `shrink` returns `[]` for the kind |

**Each property's `Shrink.` line is the sole owner of its disposition.** v1.0 declared the disposition
"one of exactly two" and then gave three memberships across §2.3, §4 and §8.2 that disagreed; the
"Applies to" lists are deleted rather than reconciled (PM F-09, PM R-5). Two mechanisms exist and a
property may use both on different parts of one case:

| Mechanism | What it is |
|---|---|
| **Shipped `"bytes"` kind** | wrap the failing text as `{ kind: "bytes", bytes: Buffer.from(text, "utf8") }` and take the single 64-byte-prefix rung, above the floor, where that prefix can still falsify |
| **File-local ladder** | a short, ordered, **explicit** ladder of strictly simpler cases declared in the property's own file, unexported, walked once. Never a search |

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

exit 1, the single red being `documentOracles.test.js`'s intentional `AT-22 [red-until-L-06]`.

**The four counts reproduce exactly on every machine that has run them; the wall clock does not, and
v1.0 stated it as if it did.** Both round-1 reviewers re-ran the same HEAD and got the same
`1038 passed / 1 failed / 70 skipped / 1109 total` over 36 suites, with the same single red — and
**299.503 s** (SE F-10) and **331.163 s** under concurrent load (PM Q-01) against this document's
179.795 s. PLAN §4.1 itself recorded 179.2–185.4 s across five runs of one HEAD and marks the figure
**advisory, not a gate**, for this reason.

So: **the pass/fail/skip/suite baseline is the assertion; the wall clock is machine- and
load-dependent and is recorded, never asserted.** The conclusion is unchanged and is more robustly
right at 300 s than at 180 s — the suite is at or past the 180 s foreground watchdog on every machine
measured, so every suite run in this feature, including every property run, goes in the background
with a generous timeout. The per-property budget below is set from case counts and level, not from
any one machine's wall clock: all seventeen properties are L1/L2 with no spawn, no filesystem and no
`dist/` read, ≈1,700 cases in total, and the suite's critical path is the shell-spawning drift suites
(`guardMatrix`, `driftFault`, `driftSync`), which none of these properties joins.
That is a constraint on *how the properties are executed*, and it is why §4's per-property case counts
are stated as budgets rather than left to the implementer: seventeen properties drawing a thousand
cases each would put the gate past the point where anyone runs it.

**Per-property case budget: 100 generated cases by default**, stated per property where it differs,
and each property must complete within a few seconds at that budget. Exhaustive enumeration is used
wherever the space is small enough to enumerate (`PROP-LIST-01a`'s phase × failure product,
`PROP-FORCE-01`'s seven-token catalogue, `PROP-GINV-01`'s **five** gated exits × three POSTMORTEM
states) — exhaustive beats sampled whenever it is affordable, and the exhaustive cases are the ones
that cannot regress into "the generator stopped producing that shape". **Five, not six**: the exit
count is TSPEC §2.5's G-INV sentence and nothing else states it (§4.3, SE F-06); v1.0's "six" here was
a third, unowned count and is withdrawn.

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

Each entry states, in order: the **invariant**; the **generator** and its case budget; the
**non-vacuity** conjunct; the **owner** (PLAN §4 task that writes it / task that greens it); and what
it **covers that examples cannot**. The falsifying source mutation for every property is in §5, so
that the falsifiability ledger can be read end to end without navigating the bodies.

### 4.1 L1 — the seven the TSPEC names

These seven are TSPEC §8.2's table, cited not restated. Where the wording below differs from §8.2 it
is an elaboration of mechanism, never of the invariant; §8.2 governs.

---

**PROP-DIGEST-01 — `canonicaliseForDigest` is idempotent and lands in a normal form.**
*(Data Integrity · L1 · `approvalHash.test.js`)*

**Invariant.** For every generated text `t`: `f(f(t)) === f(t)`; `f(t)` ends in **exactly one** `\n`;
`f(t)` contains **no** `\r`; and `f(t)` differs from `t` only by those two normalisations — the
sequence of `\n`-separated non-empty-suffix content is preserved (positive-presence conjunct: every
line of `t`, with `\r` stripped, appears in `f(t)` in the same order).

**Generator.** D3. `rng.bytes(n).toString("utf8")` for `n` ∈ 0…512 — the U+FFFD replacement this
decode performs is *in* the domain and is exactly the byte soup the function must survive — with
`\r\n`, lone `\r` and 0…5 trailing `\n` injected at random positions. 100 cases.

**Non-vacuity.** The generated set must contain ≥10 cases with at least one `\r\n`, ≥10 with a lone
`\r`, ≥10 with two or more trailing newlines, and ≥5 with **zero** trailing newline — the last is the
only shape that falsifies an implementation whose N-2 rule strips rather than forces. Forced, not
sampled.

**Owner.** Written by **RLH-06** (batch 2); greened by **RLH-05(d)** (batch 3). Rides §7.3's
`RLH-AT-12,-13,-14,-17; both digest properties` row: green from batch 3, permitted red batch 2.

**Beyond the examples.** The known-answer vectors (§6.2) pin four points, and RLH-06's `RLH-AT-12`…
`-18` pin the wiring; this pins the *shape of the
output* over the whole input space, including the case §8.2 calls out — text whose only defect is a
`\r` in the middle of a line, which no vector carries.

**Shrink.** Shipped `"bytes"` kind, floor 64 bytes (§2.3).

---

**PROP-DIGEST-02 — `sha256Hex` is deterministic and total, and canonicalises internally.**
*(Data Integrity · L1 · `approvalHash.test.js`)*

**Invariant.** Three conjuncts. (i) **Totality of shape**: for every generated text `t`,
`sha256Hex(t)` matches `/^[0-9a-f]{64}$/` and never throws. (ii) **Determinism**: `sha256Hex(t)`
called twice returns the identical string, and two independently generated equal strings digest
equal. (iii) **Canonicalisation is inside**: for every `t`, `sha256Hex(t) === sha256Hex(f(t))` where
`f` is `canonicaliseForDigest` — i.e. no caller can produce a different digest by canonicalising
first, and any two texts differing only in line endings or trailing newlines digest **equal**.

**Generator.** D3, extended: ASCII, multi-byte UTF-8 (2-, 3- and 4-byte sequences composed from
`codePointAt`-valid code points), surrogate pairs (emoji), and **lone surrogates** (`"\uD800"` alone),
which is where a hand-rolled `utf8Bytes` is most likely to be wrong. 100 cases.

**Non-vacuity.** ≥15 cases must contain a code point above U+FFFF and ≥5 must contain a lone
surrogate; the property asserts those counts before asserting the digest. And conjunct (iii) is
asserted **only** over cases where `f(t) !== t` for at least 20 of them — otherwise it degenerates
into `sha256Hex(t) === sha256Hex(t)`, which is conjunct (ii).

**Owner.** Written by **RLH-06** (batch 2); greened by **RLH-05(d)** (batch 3); same §7.3 row as
`PROP-DIGEST-01`.

**Beyond the examples.** TSPEC §8.2 is explicit that the known-answer vectors remain the *correctness*
oracle and this is the *coverage* oracle: the vectors cannot tell you that the 837th multi-byte string
does not throw, and AT-13's "one digest function on both paths" is a wiring claim, not an input-space
claim. Conjunct (iii) is the generated form of AT-14 and is what makes AT-16's rebase invariance an
input-space fact rather than a single fixture.

**Shrink.** Shipped `"bytes"` kind.

**C-2 note (§2.4).** The oracle for correctness is the externally computed vectors in
`__tests__/fixtures/digest-vectors.js`, **never** a comparison against Node's `crypto`: a property
that compared against `crypto.createHash("sha256")` would stay green if the subject itself reached for
`crypto`, which C-2 forbids and which the bundle has no way to load.

---

**PROP-SCAN-01 — `scanLines` is total and partitions its input.**
*(Data Integrity · L1 · `scanLines.test.js`)*

**Invariant.** For every generated document `d` and every closed catalogue of markers, `scanLines(d)`
returns for each line exactly one classification — the classifications are pairwise disjoint and their
union is every line of `d` (**DC-01 totality**). Two further conjuncts: (i) **fence discipline** — no
line inside a fenced code block is classified as a marker, and a document with an unclosed fence
classifies every line after the opening fence as fenced, never as a marker; (ii) **conservation** —
`sum(|class_i|) === d.split("\n").length`, asserted as an arithmetic identity, so a
classifier that silently drops a line fails even if every line it *does* classify is right.

**Generator.** D1. Lines drawn from four pools — verbatim marker lines (from the normative literals,
cited per §6.4, never retyped), near-miss marker lines (marker text with a leading `>` quote, leading
whitespace, altered case, or embedded inside a sentence), fence delimiters (``` and `~~~`, 3–6
characters, with and without an info string), and arbitrary prose from D3 — shuffled with
`rng.shuffle` and joined. Document length 0…120 lines. 100 cases.

**Non-vacuity.** ≥20 cases must contain at least one true marker, ≥20 at least one near-miss, ≥15 at
least one *balanced* fence pair with a marker **inside** it, and ≥5 an **unclosed** fence. The
unclosed-fence floor is the one that matters: it is the only shape distinguishing a depth counter from
a boolean toggle, and it is the shape the `unclosed-fence.md` fixture (§6.3) pins by example.

**Owner.** Written by **RLH-03** (batch 2); greened by **RLH-05(c)**. §7.3 row `RLH-AT-65, -66;
scanLines property`: green from batch 3, permitted red batch 2.

**Beyond the examples.** RLH-03's two ATs — `RLH-AT-65` and `RLH-AT-66` (PLAN §4.2) — pin two named
near-misses; the generator composes them
— quoted marker *inside* a fence, marker on the line that closes a fence, two markers on adjacent
lines — combinations no AT enumerates and where an ordering bug in the scan lives.

**Shrink.** File-local ladder over the line array (§2.3, second disposition): delete-half, then
delete-one, then simplify each surviving line to its pool tag. The shipped `shrink` returns `[]` for
this case shape.

---

**PROP-NAME-01 — `parseReviewFilename` round-trips, and rejects every single-part mutation.**
*(Parsing · L1 · `roundDerivation.test.js`)*

**Invariant.** Two directions. **Round-trip**: for every generated `{role, docType, version}` drawn
from the valid domains, `parseReviewFilename(format(role, docType, version))` returns a parse whose
three fields equal the inputs — `format` being the composition the production code itself uses, not a
second implementation in the test (§6.4). **Rejection**: for every valid filename and every
single-part mutation of it (role replaced by a non-role token, docType by a non-docType token, the
`v{N}` segment by a non-numeric or negative or zero-padded form, the prefix or extension altered), the
parse returns the "not a review file" outcome — **not** a throw, and **not** a partial parse.

**Generator.** D2, product of the role catalogue × docType catalogue × version 1…99, plus one mutation
selected per case by `rng.pick` from the five mutation classes. 100 cases, with the
unversioned form (no `-v{N}`) included in the valid domain because TSPEC §3.9 makes version optional.

**Non-vacuity.** All five mutation classes must appear ≥10 times each, and the valid-domain half must
cover every role and every docType at least once — a floor asserted as set equality against the
catalogues, so adding a docType to the catalogue without extending the generator fails the property
rather than silently narrowing it.

**Owner.** Written by **RLH-11** (batch 2); greened by **RLH-05(e)**. §7.3 row `RLH-AT-01 … -06,
-63; round-derivation properties`: green from batch 3, permitted red batch 2.

**Beyond the examples.** RLH-11's suite pins `RLH-AT-01`…`-06` and `RLH-AT-63` — a fixed handful of
named filenames and branch states. The rejection direction is the half
examples cannot carry: it asserts a *negative over a space*, that nothing outside the catalogue parses,
which is what stops a loosened regex from silently admitting `CROSS-REVIEW-pm-REQ-v1.md.bak` — a
negative none of `RLH-AT-01`…`-06` states.

**Shrink.** File-local ladder: shorten the version number toward 1, then reduce the mutation to the
single altered character.

---

**PROP-ROUND-01 — `deriveRoundWindow` returns a fixed-width window and partitions the review files.**
*(State Machine · L1 · `roundDerivation.test.js`)*

**Invariant.** For every generated set of filenames on a branch: `endIndex === startIndex +
MAX_REVIEW_ROUNDS - 1` (the width identity, over all inputs including the empty set); `startIndex >=
1`; and the **three-way partition** TSPEC §8.2 states over `parseReviewFilename`'s split — every input
name is counted in exactly one of *in-window versioned review*, *out-of-window versioned review*, and
*not a review file* — with `startIndex` derived from the highest in-set version, never from a counter.
Conservation is asserted arithmetically: the three counts sum to the input size.

**Generator.** D2, as `PROP-NAME-01`, plus non-review filenames (`REQ-*.md`, `LEARNINGS-*.md`,
`.DS_Store`, directories) and versions drawn to straddle the window edge: `rng.int` over 1…`startIndex
+ MAX_REVIEW_ROUNDS + 3`. Set size 0…40. 100 cases.

**Non-vacuity.** ≥15 cases must place at least one file **above** `endIndex`, ≥15 at least one
**below** `startIndex`, ≥10 must be the empty set, and ≥20 must mix review and non-review names. The
above-`endIndex` floor is the one that catches a window computed per-round instead of once at the
phase gate.

**Owner.** Written by **RLH-11** (batch 2); greened by **RLH-05(e)**. Same §7.3 row as
`PROP-NAME-01`: green from batch 3, permitted red batch 2.

**Beyond the examples.** The width identity is the generated form of the H-1 fix: examples pin
`startIndex` for named branch states, the property asserts that the *sibling-field relationship*
holds for every branch state, which is precisely what a caller recomputing `endIndex` from a stale
`roundIndex` would break. It is also the only place the "derive, never count" rule is stated over the
whole input space rather than at the `RLH-AT-01`…`-06`/`-63` points that sample it (`RLH-AT-07`, the
call-site half, greens two batches later against `RLH-26`).

**Shrink.** File-local ladder: delete names, then reduce each surviving version toward `startIndex`.

---

**PROP-FORCE-01 — `parseForcePhases` is closed over its catalogue.**
*(Parsing · L1 · `forcePhases.test.js`)*

**Invariant.** Let `V = {R, F, T, P, D, PR}` and the accepted vocabulary be `V ∪ {all}`. For every
generated input: if every token is in the vocabulary, the result is `{ ok: true, phases }` with
`phases` a `Set` whose members are all in `V` (never `all` itself), `phases` equals the set of
non-`all` tokens unioned with `V` if `all` was present, and `|phases| === 6` exactly when `all`
appeared or all six were listed; if **any** token is outside the vocabulary the result is the failure
shape, and the failure names the offending token. Order-insensitivity and duplicate-idempotence are
conjuncts: `rng.shuffle` of the tokens, and any token repeated, yield an equal `Set`.

**Generator.** D5. Token lists of length 0…10 drawn from `V ∪ {all}` ∪ a pool of near-misses
(lowercase `r`, `pr ` with trailing space, `ALL`, `Rq`, empty string, `R,F` as a single token), joined
with the separator TSPEC §3.7 specifies. 100 cases.

**Non-vacuity.** ≥25 cases must be wholly valid, ≥25 must contain ≥1 near-miss, ≥10 must contain
`all`, ≥10 must contain a duplicate, and ≥5 must be the empty input. The valid-half floor is asserted
as *set coverage of `V`*, so a catalogue that grows without the generator growing fails here.

**Owner.** Written by **RLH-14** (batch 2); greened by **RLH-05(f)**. §7.3 row `RLH-AT-29;
parseForcePhases catalogue-closure`: green from batch 3, permitted red batch 2.

**Beyond the examples.** RLH-14's suite samples three inputs — `RLH-AT-28`, `RLH-AT-29` and
`RLH-AT-01a` (PLAN §4.2). Closure over the catalogue — that nothing
outside it is ever accepted and `all` always expands to exactly six — is a statement about the
*complement* of the catalogue, which no finite example set can make. It is also the property that
detects a seventh phase added to the runtime without being added to the vocabulary: `|phases|` stops
being 6 and the identity fails loudly rather than the phase being silently unforceable.

**Shrink.** File-local ladder: drop tokens one at a time, keeping the first that still fails.

---

**PROP-COMPLETE-01 — `isComplete` is exactly the required set, falsifiable in both directions.**
*(State Machine · L1 · `completeness.test.js`)*

**Invariant.** Let `R` be the required document set. For every generated present-set `P`:
`isComplete(P) === true` **iff** `R ⊆ P`. Both directions are asserted, which is what TSPEC §8.2 means
by "falsifiable both directions": a subject that always returns `true` fails on the `R ⊄ P` half, and a
subject that always returns `false` fails on the `R ⊆ P` half. Extra documents beyond `R` never make
`isComplete` false (superset tolerance), and the result is independent of the order in which `P` was
built (`rng.shuffle`).

**Generator.** D4. `P` built by taking `R`, removing a `rng.int(0, |R|)`-sized random subset, then
adding 0…4 documents from a non-required pool (`DECISIONS`, `LEARNINGS`, `POSTMORTEM-*`, an invented
`FOO`). 100 cases.

**Non-vacuity.** ≥25 cases must be complete (nothing removed) and ≥25 incomplete with exactly **one**
document missing — the single-missing shape is the one that distinguishes `R ⊆ P` from a
cardinality check `|P| >= |R|`, which the extras would otherwise satisfy. Each element of `R` must be
the sole missing element in ≥1 case; asserted as set equality against `R`, so a document added to the
required set without the generator knowing fails here rather than going untested.

**Owner.** Written by **RLH-12** (batch 4); greened by **RLH-16**. §7.3 row `RLH-AT-60, -62;
isComplete property`: green from batch 6, permitted red batches 4–5.

**Beyond the examples.** RLH-12's `RLH-AT-59`, `-60` and `-62` pin three present-sets. The property is what makes the
*required set itself* the thing under test: it is the only assertion in the suite that fails when a
document is quietly dropped from `R`, because it derives its expectation from `R` and its floors from
`R` simultaneously.

**Note — measured file ownership.** PLAN §4.2 assigns `isComplete`'s suite to
`__tests__/completeness.test.js` (RLH-12, a new file), **not** to the existing
`__tests__/documentOracles.test.js` — which is where the foreign intentional red
`AT-22 [red-until-L-06]` lives. This feature does not touch that file, so the foreign red stays red
(§2.5) and no property here depends on it.

**Shrink.** File-local ladder: re-add removed documents one at a time until the case passes; report the
last still-failing set.

### 4.2 L1 — beyond the floor

Four further pure-function invariants the TSPEC's table does not name but whose subjects TSPEC §8.1
places at L1. Each declares the §7.3 ledger window it *would* occupy (§1.3); adoption is a mechanical
PLAN edit owned by the writing task.

---

**PROP-HASH-01 — `parseApprovalHash` accepts only well-formed trailers, and never mid-document.**
*(Parsing · L1 · `approvalHash.test.js`)*

**Invariant.** For every generated document: a hash is returned **iff** a well-formed approval trailer
appears at a position the format permits; the returned hash always matches `/^[0-9a-f]{64}$/`; a
trailer that is quoted (`>`), fenced, or truncated to fewer than 64 hex characters yields **no** hash;
and a document containing two trailers resolves deterministically to the same one on every run
(whichever the format specifies — the property asserts *stability*, and §6.4 owns which).

**Generator.** D3 prose interleaved with trailer candidates drawn from: valid (64 lowercase hex),
uppercase hex, 63 and 65 characters, non-hex characters in the payload, correct payload with a
malformed label, and valid trailers placed inside a fence or behind a `>` quote. 100 cases.

**Non-vacuity.** ≥20 valid, ≥10 of each of the length-off-by-one shapes, ≥10 quoted-or-fenced, ≥5
double-trailer. The `quoted-hash.md` fixture (§6.3) pins the quoted case by example; the floor makes it
a space.

**Owner.** Written by **RLH-06** (batch 2); greened by **RLH-05(d)**. Would occupy the same §7.3 row
as the two digest properties: green from batch 3, permitted red batch 2.

**Beyond the examples.** The hex-shape conjunct is a total statement about the *return* value: no
input, however malformed, produces a "hash" that is not 64 hex characters. That is the guarantee the
comparison at the approval gate silently depends on, and no AT states it over the input space.

**Shrink.** Shipped `"bytes"` kind for the prose; file-local ladder for the trailer choice.

---

**PROP-TRAILER-01 — the trailer catalogue is closed and its recognisers are mutually exclusive.**
*(Parsing · L1 · `pacingWrapper.test.js`)*

**Invariant.** Over the closed catalogue `TRAILER_FAILURES` and the trailer recognisers
(`parseRevisionComplete`, `parseResolvedMarker`, `parseApprovalHash`): for every generated document,
**at most one** recogniser claims any given line — the recognisers are pairwise disjoint over the line
space — and every rejection carries a reason drawn from the catalogue, never an ad-hoc string.
Catalogue closure is the second conjunct: the set of reasons observed across the generated corpus is a
**subset** of `TRAILER_FAILURES`, and (with the floors below) equals it.

**Generator.** D1 line pools as `PROP-SCAN-01`, biased toward trailer-shaped lines: each of the three
recognisers' verbatim forms, each with one mutation from the catalogue's own failure taxonomy
(wrong case, trailing content, quoted, fenced, missing payload). 100 cases.

**Non-vacuity.** Every member of `TRAILER_FAILURES` must be observed ≥1 time — asserted as **set
equality** against the catalogue, which is what makes this a totality check (DC-01) and not a sampling
check: a failure mode added to the catalogue with no generator path fails the property.

**Owner.** Written by **RLH-21** (batch 3); greened by **RLH-23**. Would occupy §7.3's
`RLH-AT-35 … -54, -58, -43a, -61-loop` row: green from batch 7, permitted red batches 3–6.

**Beyond the examples.** Mutual exclusion is a *cross-recogniser* claim. Each AT exercises one
recogniser; nothing in the FSPEC asserts that a line the revision-complete recogniser accepts is not
also accepted by the resolved-marker recogniser, which is the failure mode that would let one round's
trailer satisfy another round's gate.

**Shrink.** File-local ladder over the line array; identical mechanism to `PROP-SCAN-01`.

---

**PROP-RESOLVE-01 — approval-anchor resolution is a function, and unanimity needs four facts.**
*(State Machine · L1 · `approvalSearch.test.js`)*

**Invariant.** For every generated review corpus: (i) resolution is **deterministic** — the same
corpus, however its file list was shuffled, resolves to the same verdict/anchor pair; (ii)
**unanimity requires all four facts simultaneously** — both roles' verdicts *and* both roles' anchors —
so for every generated corpus missing any one of the four, the result is *not unanimous*, and for
every corpus carrying all four with matching anchors it *is*; (iii) an anchor that does not match the
current digest never contributes to unanimity regardless of the verdict beside it.

**Generator.** D4 × D2. A corpus is a set of per-role records, each independently carrying or omitting
a verdict and carrying a matching / stale / absent anchor. The 4-fact presence vector is enumerated
exhaustively (16 combinations) and each combination is then dressed with random file ordering and
random extra non-review files. 100 cases ≥ 16 combinations × ≥6 dressings.

**Non-vacuity.** All 16 presence combinations must appear (set equality against the enumeration, not a
count) and ≥15 cases must carry a **stale** anchor alongside an approving verdict — the H-4 shape.

**Owner.** Written by **RLH-24** (batch 3, sole owner of `approvalSearch.test.js`); greened by
**RLH-26**. Would occupy §7.3's `RLH-AT-08 … -11, -56, -57` row: green from batch 8, permitted red
batches 3–7.

**Beyond the examples.** This is the enumeration the H-4 defect proves examples missed: the ATs sample
three of the sixteen presence vectors. Exhaustive enumeration of the vector, with randomised dressing,
is what turns "we tested unanimity" into "unanimity is exactly this conjunction".

**Shrink.** File-local ladder: drop dressing first (extra files, ordering), then reduce to the bare
presence vector — the shrunk counterexample is a 4-bit string, which is the report you want.

---

**PROP-STALE-01 — `isStale` is exactly digest inequality, and is stable under canonicalisation.**
*(Data Integrity · L1 · `approvalHash.test.js`)*

**Invariant.** For every generated (document, recorded-anchor) pair: `isStale` is `true` **iff** the
document's digest differs from the anchor. Two conjuncts follow from `PROP-DIGEST-02`(iii) and are
asserted here at the caller: a document edited only in line endings or trailing whitespace is **not**
stale; a document edited in any content byte **is**. Absence of an anchor is stale by definition, and
a malformed anchor is stale, never an error.

**Generator.** D3 document plus an anchor produced by one of: digesting the document (fresh),
digesting a one-byte-mutated copy (stale), digesting a line-ending-only-mutated copy (fresh —
the discriminating shape), a random 64-hex string, a malformed string, or absent. 100 cases.

**Non-vacuity.** ≥20 fresh, ≥20 content-stale, ≥15 line-ending-only, ≥5 malformed, ≥5 absent. The
line-ending-only floor is the whole point: it is the only shape that fails an implementation
comparing raw text instead of digests, and it is the AT-16 rebase scenario stated as a space.

**Owner.** Written by **RLH-06** (batch 2); greened by **RLH-16** (staleness conjunct) and
**RLH-26** (gate conjunct) — §7.3's `RLH-AT-15, -16, -18` row: green from batch 8, permitted red
batches 2–7.

**Beyond the examples.** `RLH-AT-15`, `-16` and `-18` sample three edits. The property covers the *edit space*: any
mutation whatsoever is stale unless it is a normalisation, which is the exact contract the approval
gate needs and the one a whitespace-tolerant comparison would violate silently.

**Shrink.** Shipped `"bytes"` kind for the document; the anchor kind is one of six tags, reported
verbatim.

### 4.3 L2 — orchestration invariants

These run against `orchestrate-dev.js`'s injected seams (`__tests__/helpers/seams.js`), synchronously
doubled, with **no filesystem**. Every injected call the subject makes is `await`ed in the subject
(C-2 consequence); the doubles are sync, so the properties assert on the *recorded call log* the
doubles accumulate, never on timing.

---

**PROP-LIST-01a — `ListFailure` disposition is total at the phase gate.**
*(Error Handling · L2 · `haltAndQueue.test.js`)*

**Invariant.** For every failure the enumeration seam can report, the phase gate reaches exactly one
disposition from TSPEC §4.2's table: `dir_missing` is **benign** (the phase proceeds with an empty
review set) and each of `not_a_directory`, `unreadable`, `bad_argument` **halts** with the message
`Cannot enumerate {dirPath}: {reason}` — the literal owned by §4.2 and cited, not retyped (§6.4).
Totality (DC-01) is asserted as **set equality** between the dispositions exercised and
`LIST_FAILURES`: every row reachable, no row unreachable, nothing outside the table observed.

**Generator.** D6 — phase-entry configurations: phase ∈ the six forceable phases × failure ∈
`LIST_FAILURES` ∪ `{ok}` × a randomised pre-existing review set × a randomised `dirPath` string
(including paths with spaces, unicode, and a trailing slash, to prove the message interpolates the
path it was given). Enumeration of phase × failure is exhaustive; the rest is sampled. 100 cases.

**Non-vacuity.** Every `(phase, failure)` pair must be observed — set equality against the product,
which is what makes "every row reachable" a measured claim rather than an aspiration. And ≥10 `ok`
cases must be present so the benign path is not the only non-halting outcome.

**Owner.** Written by **RLH-25** (batch 3); greened by **RLH-27** — §7.3's `RLH-AT-21 … -27, -13a,
-30-orch … -34-orch` row: green from batch 9, permitted red batches 3–8.

**Beyond the examples.** RLH-25's `RLH-AT-21`…`-27` name the dispositions one phase at a time, and
`RLH-AT-13a` enumerates G-INV's four gated exits. The product with the
phase axis is what no AT set carries: a disposition that is correct at Phase R and swallowed at Phase
D is exactly the H-2 terminal-exit shape, and only the product catches it.

**Shrink.** File-local ladder: fix the failure, minimise the phase to the earliest failing one, then
reduce `dirPath` to the shortest still-failing string.

---

**PROP-LIST-01b — the disposition is re-evaluated at every episode entry, not cached.**
*(Error Handling · L2 · `pacingWrapper.test.js`)*

**Invariant.** For every generated episode interleaving: `refreshReviewState()` is called at **every**
episode entry (call count equals episode count, asserted as an equality, not a floor); the disposition
each episode reaches is the one implied by *that episode's* seam answer, not a previous episode's; and
a seam that answers `ok` then `unreadable` halts at the second episode rather than proceeding on the
cached first answer. Conversely a seam answering `dir_missing` then `ok` proceeds with a **non**-empty
review set at the second episode.

**Generator.** D7 — episode interleavings: a sequence of 1…12 episodes, each carrying a phase, a round
index, and a seam answer drawn from `LIST_FAILURES ∪ {ok}`, subject to the constraint that a halting
answer terminates the sequence (halts are terminal, so nothing after one is generated). 100 cases.

**Non-vacuity.** ≥20 sequences must change seam answer between consecutive episodes (the caching
discriminator), ≥15 must be length ≥5, and ≥10 must end in a halt. A sequence whose answers never
change cannot falsify caching and is counted but not relied upon.

**Owner.** Written by **RLH-21** (batch 3); greened by **RLH-23** — green from batch 7, permitted
red batches 3–6.

**Beyond the examples.** This is `S-INV` — per-episode refresh — stated over interleavings. Examples
pin two-episode sequences; the property covers arbitrary ones, including the phase-change-mid-sequence
shapes where a cached state is most tempting and most wrong.

**Shrink.** File-local ladder: truncate the sequence from the front while it still fails, then
simplify each surviving episode's phase to the first in the catalogue.

---

**PROP-APPROVE-01 — the two-tier approval search finds an approval iff one exists in the window.**
*(State Machine · L2 · `approvalSearch.test.js`)*

**Invariant.** For every generated branch state: the search returns an approval **iff** the branch
carries a unanimous, digest-current approval for a review inside `[startIndex, endIndex]`. Three
conjuncts. (i) **Tier discipline** — the second tier is consulted **only** when the first yields
nothing, asserted on the recorded seam call log, so a search that always reads both tiers fails.
(ii) **Window respect** — an approval for a review *outside* the window is never returned, however
unanimous and however current. (iii) **Idempotence** — running the search twice against the same
branch state yields an equal result and issues an equal number of seam reads.

**Generator.** D2 × D4. Branch states composed from `PROP-ROUND-01`'s filename generator (so window
membership is generated, not assumed) crossed with `PROP-RESOLVE-01`'s 16-element presence vector, plus
tier placement (`tier1`, `tier2`, `both`, `neither`) chosen by `rng.pick`. 100 cases.

**Non-vacuity.** All four tier placements must appear; ≥15 cases must place a unanimous approval
**outside** the window; ≥15 must place a unanimous-but-stale approval inside it. Those two floors are
the property's discriminating power — everything else is dressing.

**Owner.** Written by **RLH-24** (batch 3); greened by **RLH-26** — green from batch 8, permitted
red batches 3–7.

**Beyond the examples.** The `iff` is the point. The ATs assert *finding* an approval that is there
(`RLH-AT-08`…`-11`, `-56`, `-57`); the property additionally asserts *not* finding one that is not, over a space that
includes the near-misses — out-of-window, stale, half-unanimous — that the H-4 defect shipped through.

**Shrink.** File-local ladder: collapse to tier placement + presence vector + one in/out-of-window
flag; the shrunk report is three tokens.

---

**PROP-GINV-01 — `G-INV`: no path reaches step 5 except through the POSTMORTEM gate.**
*(State Machine · L2 · `haltAndQueue.test.js`)*

**Invariant.** Stated over **paths, not steps**. For every generated traversal of the phase machine
that ends in the phase being run (step 5), the recorded step log contains step **G**, and G appears
**before** step 5 in every such path. Equivalently: step 5 is unreachable in the traversal graph with
G removed. Two conjuncts guard the framing. (i) **Every exit that leads to running the phase is
gated** — not merely the exits the current implementation happens to take, so the property enumerates
the exits from the *catalogue* of exits, not from an observed run. (ii) **G is evaluated, not merely
present** — the gate's decision must be a function of the generated state, asserted by requiring that
the corpus contains both G-passes and G-halts for the same downstream step.

**Generator.** D6 — phase-entry configurations crossed with the exit catalogue: for each exit, a state
that takes it, dressed with a randomised round index, a randomised prior-postmortem presence flag, and
a randomised review set. Exits enumerated exhaustively; dressing sampled. 100 cases.

**Non-vacuity.** Every exit in the catalogue must be traversed at least once — set equality against the
exit catalogue — and both outcomes of G (pass and halt) must be observed for ≥3 distinct exits. An
exit that no generated state can reach is a **failure**, not a skip: an unreachable exit means either
the catalogue or the machine is wrong, and DC-01 makes that a finding rather than silence.

**Owner.** Written by **RLH-25** (batch 3); greened by **RLH-26** (batch 8) and **RLH-27** (batch 9)
— green from batch 9, permitted red batches 3–8. The
property is not fully green until RLH-27's terminal-exit rework lands, because until then at least one
exit reaches step 5 without G. That is the H-2 defect, and this property is its executable statement.

**Beyond the examples.** An enumeration of steps is what the pre-fix suite had, and it passed while
H-2 was live: each step was individually correct and one *path* skipped the gate. Stating the invariant
over paths — and generating the paths rather than listing them — is the whole reason this property
exists and the reason it is worded as reachability rather than as a sequence assertion.

**Shrink.** File-local ladder: minimise the path by removing dressing, then by shortening the traversal
to the shortest prefix that still reaches step 5 without G. The shrunk counterexample is a path.

---

**PROP-EPISODE-01 — `EpisodeKey` is unpinned and the 36-dispatch bound holds over all interleavings.**
*(Concurrency/Bounds · L2 · `pacingWrapper.test.js`)*

**Invariant.** For every generated interleaving of phases and rounds: (i) **the bound** — total
authoring dispatches never exceed `(1 + MAX_REVIEW_ROUNDS) × MAX_AUTHORING_DISPATCHES` (TSPEC §4.5;
36 at the current constants, asserted against the constants, never against the literal 36); (ii)
**per-episode counting** — the dispatch counter is keyed by the full five-coordinate `EpisodeKey`, so
two episodes differing in *any single* coordinate never share a budget, asserted by generating pairs
that differ in exactly one coordinate and checking the counters are independent; (iii) **unpinned
`roundIndex`** — because `refreshReviewState()` runs at every episode entry, `roundIndex` is a
per-episode derivation, so an interleaving that revisits a phase at a *lower* round index than a
previous episode is legal and gets its own budget rather than a exhausted one.

**Generator.** D7 episode interleavings, extended to vary all five `EpisodeKey` coordinates
independently, including the pathological orderings (same phase twice non-consecutively, round index
decreasing, phase revisited after a different phase). Sequence length 1…12; per episode, 0…8 attempted
dispatches. 100 cases.

**Non-vacuity.** ≥15 interleavings must attempt **more** than the budget within one episode (so the
cap is exercised, not merely respected by luck); ≥15 must revisit a phase; ≥10 must decrease
`roundIndex` across episodes; and each of the five coordinates must be the *sole* differing coordinate
in ≥3 pairs — set equality against the coordinate list, so a coordinate dropped from `EpisodeKey`
fails here.

**Owner.** Written by **RLH-21** (batch 3); greened by **RLH-23** — green from batch 7, permitted
red batches 3–6.

**Beyond the examples.** The bound is arithmetic over a *space of interleavings*; the ATs sample three
of them. And the "unpinned" conjunct cannot be written as an example at all without asserting a
specific illegal-looking sequence is legal — which reads as a bug in an AT and as an invariant here.

**Shrink.** File-local ladder: shorten the interleaving, then reduce per-episode dispatch counts toward
the budget edge, then collapse coordinates to their first catalogue value.

---

**PROP-WINDOW-01 — the round window is computed once at the phase gate and read, never recomputed.**
*(State Machine · L2 · `reviewLoop.test.js`)*

**Invariant.** For every generated phase run: `deriveRoundWindow` is invoked **exactly once** per
phase entry (call-count equality on the seam log, not a floor); every subsequent consumer receives
`startIndex` and `endIndex` **positionally** from that single computation; and for the whole duration
of the phase the pair satisfies `endIndex === startIndex + MAX_REVIEW_ROUNDS - 1` even as rounds
advance — i.e. round advancement moves the *cursor*, never the window. `checkConverged` receives both
values on every call, and the values it receives are identical across all calls within one phase entry.

**Generator.** D6 × D7: a phase entry with a generated branch state (from `PROP-ROUND-01`'s generator)
followed by 1…`MAX_REVIEW_ROUNDS + 2` round advances, each with a generated verdict. 100 cases.

**Non-vacuity.** ≥20 runs must advance past `MAX_REVIEW_ROUNDS` rounds (the overflow shape), ≥15 must
start from a branch already carrying reviews (non-1 `startIndex`), and ≥10 must converge before the
window closes. The non-1 `startIndex` floor is what distinguishes derivation from a counter starting
at 1 — the H-1 defect.

**Owner.** Written by **RLH-22** (batch 3); greened by **RLH-27** — rides `RLH-LOOP-01`/`-02`'s
ledger rows: green from batch 9, permitted red batches 3–8.

**Beyond the examples.** "Computed once" is a claim about call *counts* across a run; no example
asserts absence of a second computation. This is the orchestration-level half of `PROP-ROUND-01`'s
pure arithmetic, and the pair together is what closes H-1: the arithmetic is right *and* nobody redoes
it with stale inputs.

**Shrink.** File-local ladder: reduce the round count to the first failing advance, then minimise the
branch state.

### 4.4 L3 — source-guard invariant

One property, at the level TSPEC §8.3 calls composition/source: it reads `pdlc/workflows/*.js` as
**text**, executes nothing, and never reads `dist/` (§2.4).

---

**PROP-AWAIT-01 — the await classification is total: every seam call site is classified or fails.**
*(Static Guard · L3 · `runtimeBundle.test.js`)*

**Invariant.** Let `S` be the set of call sites of the thirteen injected seam identifiers found by
PLAN §9.2 item 3's bracket-depth walk over the masked source. For every site `s ∈ S`, exactly one of
four things holds: `s` is `await`ed; or `s` is classified by TSPEC §8.5 ruling **1** (alias — the
one-hop alias resolution), **2** (returned promise, satisfying **both** the backward and the forward
half) or **3** (argument to an awaited combinator). A site matching **none** is *unclassified* and the
property **fails loudly** — it does not warn, does not skip, and is not permitted to be absent from
the report. A site matching **two** rulings is equally a failure: the classification is a partition,
not a cover (DC-01). The property is quantified over `S` as the walk computes it, never over a
hard-coded list of the sites present today.

**Generator.** D8 — source fragments, **never executed**. The generated object is not the production
source (that is walked whole and asserted directly) but the *classifier's input space*: synthetic
fragments composing seam calls with the constructs that break naive regex scanners — calls inside
template literals, inside string literals containing brackets, inside comments, split across lines,
nested inside another call's argument list, and inside a `Promise.all([...])` that is itself awaited.
Each fragment is generated together with its expected classification, so the property is a
round-trip: classify(fragment) === expected. 100 cases.

**Non-vacuity.** Each of the three rulings, plus "awaited" and plus "unclassified", must be the
expected outcome for ≥10 fragments — set equality against the five-element outcome catalogue. And
≥15 fragments must place a seam call inside a masked region (string, template, comment) where the
expected outcome is that **no site is found at all**, which is the walk's own correctness, not the
classifier's.

**Withdrawn rulings.** TSPEC v1.7 withdrew `Promise.race` and `Promise.any` from ruling 3. The
generator therefore emits `Promise.race`/`any` fragments with expected outcome **unclassified**, so
the withdrawal is asserted rather than merely documented — a re-added ruling reds this property.

**Owner.** Written by **RLH-31** (batch 2). §7.3's first row (`RLH-AT-19`, `RLH-AT-20`;
`RLH-SCAN-01`): **green on arrival, permitted red none ever**, greened by nobody. This property rides
that row for the same reason `RLH-SCAN-01` does — it is the scan mechanism's own self-test (PLAN §9.2
item 3), and a self-test that is allowed to be red is not a self-test.

**Beyond the examples.** `RLH-AT-19`/`-20` assert two anchored regexes match zero times, and the
advisory row enumerates the sites observed at HEAD. Enumeration is exactly what §8.5 forbids as the
statement of the rule, and enumeration is what rots: a fourteenth seam, or a fourth alias hop, is
invisible to a site list and visible to a quantifier. This is the property that makes "every
non-`await`ed site is classified" a checked sentence rather than a claim about a snapshot.

**Shrink.** File-local ladder over the fragment: strip surrounding context lines, then collapse the
masked region, then reduce to the bare call expression. The shrunk counterexample is a single line of
source, which is the only useful failure report for a static guard.

## 5. Oracles

### 5.1 The rule this section enforces

**An unfalsifiable property is worse than none**: it consumes a batch, occupies a ledger row, and
reports green whether or not the behaviour it names exists. So every property in §4 is paired below
with a **named mutation to a named source file** that turns it red, and with the conjunct that dies.
A property whose row cannot be filled is deleted, not weakened.

Two supporting rules, both from the te-author oracle checklist:

- **No oracle may be the subject's own code path.** `PROP-DIGEST-02` may not compare against
  `crypto` (§4.1); `PROP-NAME-01` may not compose the filename with a second regex written in the
  test; `PROP-AWAIT-01` may not re-implement the bracket walk it is testing. Where the property needs
  a constructor, it uses the production one and asserts the **round-trip**, which fails on a
  bidirectionally wrong implementation but is not satisfied by a tautology, because the generated
  input is compared field-by-field against the parse.
- **Absence-based claims carry three positive conjuncts.** Four properties assert that something is
  *not* there — `PROP-SCAN-01` (no marker inside a fence), `PROP-NAME-01` (mutations do not parse),
  `PROP-APPROVE-01` (out-of-window approvals are not found), `PROP-GINV-01` (step 5 unreachable
  without G). Each pairs the negative with three positives: the run happened (a positive call-count
  or step-log assertion), the input was well-formed (the non-vacuity floors), and the *complementary*
  positive holds (the in-fence marker is classified as fenced; the unmutated name parses; the
  in-window approval is found; the gated path reaches step 5). A negative asserted alone is
  indistinguishable from a subject that did nothing.

### 5.2 Falsifiability ledger — L1

| Property | Named mutation (file · construct) | Conjunct that dies |
|---|---|---|
| `PROP-DIGEST-01` | `orchestrate-dev.js` · in `canonicaliseForDigest`, change the trailing-newline rule from *force exactly one* to *strip all* | the "exactly one `\n`" conjunct, on the ≥5 zero-trailing-newline cases — and **only** on those, which is why that floor is forced |
| `PROP-DIGEST-01` (2nd) | same file · drop the `\r` removal, keep the newline rule | idempotence survives; the "no `\r`" conjunct dies on the ≥10 lone-`\r` cases |
| `PROP-DIGEST-02` | `orchestrate-dev.js` · in `utf8Bytes`, emit the raw code unit for code points above U+FFFF instead of the surrogate-pair encoding | the shape conjunct survives (still 64 hex); the **known-answer vectors** red, and the property's determinism half stays green — which is the point of keeping both oracles |
| `PROP-DIGEST-02` (2nd) | same file · call `sha256Hex` on the raw text at one call site instead of the canonical form | conjunct (iii): `sha256Hex(t) === sha256Hex(f(t))` fails on the ≥20 non-canonical cases |
| `PROP-SCAN-01` | `orchestrate-dev.js` · replace the fence **depth counter** in `scanLines` with a boolean toggle | fence discipline dies on the ≥5 unclosed-fence cases and on nested fences; conservation survives, so the failure names the right conjunct |
| `PROP-SCAN-01` (2nd) | same file · `continue` past a line that matches no pool instead of classifying it | conservation (`sum === lines.length`) dies immediately; totality is what catches the silent drop |
| `PROP-NAME-01` | `orchestrate-dev.js` · loosen `parseReviewFilename`'s anchor from `$` to a non-anchored match | the rejection direction dies on the extension-mutation class; the round-trip stays green, which is exactly how a loosened regex ships unnoticed today |
| `PROP-NAME-01` (2nd) | same file · accept a zero-padded version (`v01`) as version 1 | rejection dies on the version-mutation class |
| `PROP-ROUND-01` | `orchestrate-dev.js` · compute `endIndex` as `startIndex + MAX_REVIEW_ROUNDS` (off by one) | the width identity dies on **every** case, including the empty set — a total failure, which is the correct signature for an arithmetic identity |
| `PROP-ROUND-01` (2nd) | same file · derive `startIndex` from a counter initialised to 1 rather than from the highest observed version | the partition survives; `startIndex >= 1` survives; the **derivation** conjunct dies on the ≥15 cases whose branch already carries reviews. This is H-1, and this row is its executable statement |
| `PROP-FORCE-01` | `orchestrate-dev.js` · make `parseForcePhases` return `ok: true` with the unknown tokens dropped instead of `ok: false` | catalogue closure dies on the ≥25 near-miss cases; `all`-expansion survives |
| `PROP-FORCE-01` (2nd) | same file · expand `all` to five phases (omit `PR`) | `\|phases\| === 6` dies on the ≥10 `all` cases; the set-coverage floor names the missing member |
| `PROP-COMPLETE-01` | `orchestrate-dev.js` · replace the `R ⊆ P` test with `P.length >= R.length` | the `iff` dies on the ≥25 single-missing cases **that also carry extras** — the extras are generated precisely so a cardinality check cannot hide behind them |
| `PROP-COMPLETE-01` (2nd) | same file · remove one document from the required set `R` | the property greens on the subject **and reds on its own floor**: the set-equality non-vacuity assertion (every element of `R` sole-missing in ≥1 case) fails, because the generator derives its floors from `R`. A shrinking required set is a finding, not a silence |
| `PROP-HASH-01` | `orchestrate-dev.js` · accept 63-or-more hex characters (`{63,}` instead of `{64}`) | the `/^[0-9a-f]{64}$/` return-shape conjunct dies on the 63-character cases |
| `PROP-HASH-01` (2nd) | same file · scan the whole document for a trailer instead of the permitted positions | the quoted/fenced cases start returning hashes; the "never mid-document" conjunct dies |
| `PROP-TRAILER-01` | `orchestrate-dev.js` · widen `parseRevisionComplete` to match a line *containing* the trailer rather than *being* it | mutual exclusion dies where a resolved-marker line also contains the revision trailer text |
| `PROP-TRAILER-01` (2nd) | same file · return a literal string reason not in `TRAILER_FAILURES` | catalogue closure (subset) dies on that path; set-equality names which member went missing |
| `PROP-RESOLVE-01` | `orchestrate-dev.js` · treat a present verdict as approving without checking the anchor | unanimity's four-fact conjunction dies on the ≥15 stale-anchor cases. This is H-4 |
| `PROP-RESOLVE-01` (2nd) | same file · iterate the corpus in filesystem order and return the first approving record | determinism dies under `rng.shuffle` of the file list — the conjunct no fixed-order example can test |
| `PROP-STALE-01` | `orchestrate-dev.js` · compare the recorded anchor against the raw document text instead of its digest | the line-ending-only conjunct dies on ≥15 cases; content-staleness survives, so the failure is specific |
| `PROP-STALE-01` (2nd) | same file · treat a missing anchor as fresh | the absent-anchor conjunct dies on ≥5 cases |

### 5.3 Falsifiability ledger — L2 and L3

| Property | Named mutation (file · construct) | Conjunct that dies |
|---|---|---|
| `PROP-LIST-01a` | `orchestrate-dev.js` · treat `unreadable` as benign (fall through to an empty review set) alongside `dir_missing` | the halt disposition dies for that row at **every** phase; the set-equality assertion names `unreadable` specifically |
| `PROP-LIST-01a` (2nd) | same file · handle the failure at Phase R's gate only, leaving the other five phases to fall through | the phase × failure product reds at five phases and stays green at one — the exact H-2 signature, and invisible to any single-phase example |
| `PROP-LIST-01a` (3rd) | same file · interpolate a constant path into the halt message instead of `dirPath` | the message conjunct dies on the generated `dirPath`s (spaces, unicode, trailing slash), which is why the path is generated rather than fixed |
| `PROP-LIST-01b` | `orchestrate-dev.js` · hoist `refreshReviewState()` out of the episode loop to a single pre-loop call | the call-count **equality** dies on every sequence of length ≥2; the ≥20 answer-changing sequences additionally red on the disposition conjunct. This is `S-INV` |
| `PROP-LIST-01b` (2nd) | same file · memoise the seam answer per phase | equality survives, the disposition conjunct dies on answer-changing sequences within one phase |
| `PROP-APPROVE-01` | `orchestrate-dev.js` · drop the `<= endIndex` bound from the search predicate | window respect dies on the ≥15 out-of-window cases; the `iff`'s forward half survives |
| `PROP-APPROVE-01` (2nd) | same file · read tier 2 unconditionally and prefer its answer | tier discipline dies on the seam call log for every `tier1`-only case |
| `PROP-APPROVE-01` (3rd) | same file · cache the tier-1 result across invocations | idempotence's *call-count* half dies while the value half stays green — the split is what localises the fault |
| `PROP-GINV-01` | `orchestrate-dev.js` · restore the pre-fix terminal exit that reaches the phase run without passing step G | reachability dies on exactly the exits that skip G; the shrunk counterexample **is the offending path**. This is H-2 |
| `PROP-GINV-01` (2nd) | same file · make step G unconditional (always pass) | reachability survives — G is on every path — and the "G is evaluated" conjunct dies, because no generated state produces a G-halt. Without that second conjunct this property would green on a gate that gates nothing |
| `PROP-GINV-01` (3rd) | remove an exit from the exit catalogue while leaving the machine's exit in place | the set-equality traversal floor fails: an exit exists that no catalogue member names. The property fails on catalogue rot as well as on machine rot, which is what "invariant over paths, not an enumeration of steps" buys |
| `PROP-EPISODE-01` | `orchestrate-dev.js` · key the dispatch counter on `phase` alone instead of the five-coordinate `EpisodeKey` | per-episode counting dies on the pairs differing only in a non-`phase` coordinate; the set-equality coordinate floor names which coordinate was dropped |
| `PROP-EPISODE-01` (2nd) | same file · raise `MAX_AUTHORING_DISPATCHES` without changing the bound expression | nothing reds — **correctly**: the bound is asserted against the constants, not against the literal 36, so a deliberate constant change is not a false alarm. The falsifier is instead: **hard-code `36`** in the assertion, then change the constant; the property then reds while the subject is right, which is why §4.3 forbids the literal |
| `PROP-EPISODE-01` (3rd) | same file · pin `roundIndex` at the phase gate rather than deriving it per episode | the unpinned conjunct dies on the ≥10 decreasing-`roundIndex` interleavings |
| `PROP-WINDOW-01` | `orchestrate-dev.js` · recompute `startIndex + MAX_REVIEW_ROUNDS - 1` inside `reviewLoop` | the call-count equality dies immediately; `RLH-LOOP-03`'s grep oracle reds in the same batch, and the two together are the §11.5 `N-a` enforcement pair |
| `PROP-WINDOW-01` (2nd) | same file · swap the positional `startIndex` / `endIndex` arguments at one `checkConverged` call site | the "identical values across all calls" conjunct dies on the ≥15 non-1-`startIndex` cases — and **only** there, which is why that floor is forced; a swapped pair is invisible when both values are 1 |
| `PROP-AWAIT-01` | `orchestrate-dev.js` · remove an `await` from a seam call at a site matching no §8.5 ruling | the site is unclassified; the property fails loudly rather than warning. Detected in **batch 2**, before any of the code that would depend on it |
| `PROP-AWAIT-01` (2nd) | the classifier · re-admit `Promise.race` to ruling 3 | the withdrawn-ruling fragments (expected `unclassified`) now classify; the withdrawal is asserted, not merely documented |
| `PROP-AWAIT-01` (3rd) | the walk · stop masking template literals | the ≥15 masked-region fragments report phantom sites; the walk's own correctness is what those fragments test, separately from the classifier's |

### 5.4 Two rows that deserve their own sentence

**`PROP-COMPLETE-01` (2nd) and `PROP-GINV-01` (3rd) falsify against the *specification*, not the
subject.** Both mutations leave the production function correct and break a catalogue — the required
document set, the exit catalogue. Both properties red, because their non-vacuity floors are derived
from the catalogue by set equality rather than written out by hand. This is deliberate and it is the
main reason §3.3's floors are stated as set equality: a generator that samples a catalogue silently
narrows when the catalogue narrows, and a property that cannot notice its own domain shrinking is a
property that decays into a tautology one commit at a time.

**`PROP-EPISODE-01` (2nd) is a falsifier of the *test*, not of the subject.** It is recorded because
the obvious way to write the 36-dispatch assertion — asserting against `36` — produces a property
that reds on a legitimate constant change and greens on a broken bound expression. Recording the
anti-oracle is how that mistake is prevented at review rather than discovered at batch 10.

## 6. Fixtures

### 6.1 What exists today, measured

`pdlc/workflows/__tests__/fixtures/` currently holds **one** entry — `covered-violations/`, a
directory tree used by the guard suites — and `__tests__/helpers/` holds twelve modules, of which
`driftGenerators.js` is the one this document builds on (§3.1). **None** of the fixtures this feature
needs exists at HEAD; every one below is created by the task named beside it, and each is listed in
PLAN §4.2's file table.

`testPathIgnorePatterns` excludes `/__tests__/helpers/` and `/__tests__/fixtures/`, so a fixture
module is never collected as a suite — measured in `pdlc/workflows/package.json`. That is what makes
`digest-vectors.js` safe as a `.js` fixture rather than a `.json` one.

### 6.2 Digest known-answer vectors — `__tests__/fixtures/digest-vectors.js` (RLH-06, batch 2)

Four vectors per TSPEC §8.2: the empty string, an ASCII string, a multi-byte UTF-8 string, and a
surrogate-pair emoji string — each with its 64-hex digest **computed externally** and pasted in.

**Why externally.** These are the correctness oracle for `sha256Hex`, and `PROP-DIGEST-02` is only a
coverage oracle beside them (§4.1). A vector computed by Node's `crypto` inside the test would still
be a valid oracle for the *test process*, but it invites the failure mode §5.1 forbids: someone
"simplifies" the fixture into a live `crypto` call, and the comparison becomes the subject against
itself. The vectors are literals so there is nothing to simplify.

PLAN §4.2 is explicit that the last two vectors are the **only** falsifier of a wrong `utf8Bytes`;
`PROP-DIGEST-02`'s ≥15-cases-above-U+FFFF floor exists to keep that falsifier from depending on four
hand-picked strings.

### 6.3 Fenced-region fixtures — `__tests__/fixtures/cross-reviews/` (RLH-03, batch 2)

Three byte-exact files, per TSPEC §8.2 and PLAN §4.2:

| Fixture | Pins |
|---|---|
| `quoted-verdict.md` | the **nested four-in-three** form — a four-backtick fence containing a three-backtick fence. PLAN §4.2 records why: *a three-in-three fixture passes under the wrong implementation*, i.e. under a boolean toggle. It is the example twin of `PROP-SCAN-01`'s unclosed-fence floor |
| `quoted-hash.md` | an approval trailer behind a `>` quote — the example twin of `PROP-HASH-01`'s ≥10 quoted-or-fenced floor |
| `unclosed-fence.md` | a fence opened and never closed — the example twin of the ≥5 unclosed floor |

**Byte-exactness matters and is fragile.** These files carry significant trailing whitespace and
significant line endings; an editor that trims either changes what the fixture pins. They are
authored once, by RLH-03, and not reformatted afterwards.

### 6.4 Heading fixtures — `__tests__/fixtures/completeness/` (RLH-12, batch 4)

Copied **verbatim from the SKILL templates as they read at the end of batch 3** — hence RLH-12's
declared edges on RLH-08 and RLH-09. PLAN §10.2 and its risk row `H-j` state plainly what this does
and does not buy: the copy is a point-in-time snapshot and **detects no subsequent SKILL edit**, and
bolting a fixture-versus-SKILL comparison onto `completeness.test.js` is explicitly *not* this
feature's work.

`PROP-COMPLETE-01` does not change that. It quantifies over **present-sets**, not over heading text:
its domain is the required set `R`, and its §5.2 second row shows it reds when `R` shrinks. It says
nothing about whether `R`'s headings still match the SKILLs — that gap stays open, owned where PLAN
§10.2 leaves it, and §8.3 below records it rather than quietly implying a property covers it.

### 6.5 String ownership — cite, never retype

The rule the fixtures and the generators both obey, from PLAN §4.2's repeated instruction (*"copy it
from there, do not retype it from here"*) and §1.4 above:

- **Halt messages** (`Cannot enumerate {dirPath}: {reason}`, TSPEC §4.2 / §6.2) — the property
  imports or reads the production constant and interpolates its own generated `dirPath`. It never
  spells the sentence out. A retyped message greens against a subject that emits a *different*
  retyped message, and the two drift apart silently.
- **Catalogues** (`LIST_FAILURES`, `FILENAME_FAILURES`, `HASH_FAILURES`, `TRAILER_FAILURES`, the role
  and doc-type catalogues, the six forceable phases) — the generator enumerates the catalogue itself
  (§3.3), which is what makes the set-equality floors meaningful.
- **Constants** (`MAX_REVIEW_ROUNDS`, `MAX_AUTHORING_ATTEMPTS`, `MAX_AUTHORING_DISPATCHES`,
  `MAX_AUTHORING_WRITE_BYTES`) — TSPEC §4.8 makes these **module-level and not exported**. A property
  at L1/L2 therefore cannot import them; it obtains them the way the rest of the suite does (through
  the injected surface or, for `PROP-AWAIT-01`, from the source text) and asserts *relationships*
  between them, never their values. §4.3's 36-dispatch bound and §5.3's anti-oracle row are the worked
  example of this rule.
- **SKILL template headings** — copied by RLH-12 once, per §6.4, and never paraphrased.

## 7. Coverage matrix

### 7.1 Property → assertions generalised → owner → ledger row

AT ids are given in the PLAN's `RLH-`-namespaced form (PLAN §1.3), because that is the form the jest
names take. `Row` is the §7.3 ledger row the property rides (§1.3); `Green from` / `Permitted red`
are that row's, unchanged.

| Property | Level | File | Generalises | Written by | Row (§7.3) | Green from | Permitted red |
|---|---|---|---|---|---|---|---|
| `PROP-DIGEST-01` | L1 | `approvalHash.test.js` | `RLH-AT-12`…`-14`, `-17` | RLH-06 (2) | digest row | batch 3 | batch 2 |
| `PROP-DIGEST-02` | L1 | `approvalHash.test.js` | `RLH-AT-12`…`-14`, `-17` | RLH-06 (2) | digest row | batch 3 | batch 2 |
| `PROP-HASH-01` | L1 | `approvalHash.test.js` | — (new; §8.1's gap) | RLH-06 (2) | digest row | batch 3 | batch 2 |
| `PROP-STALE-01` | L1 | `approvalHash.test.js` | `RLH-AT-15`, `-16`, `-18` | RLH-06 (2) | `RLH-AT-15/-16/-18` | batch 8 | batches 2–7 |
| `PROP-SCAN-01` | L1 | `scanLines.test.js` | `RLH-AT-65`, `-66` | RLH-03 (2) | scanLines row | batch 3 | batch 2 |
| `PROP-NAME-01` | L1 | `roundDerivation.test.js` | `RLH-AT-01`…`-06`, `-63` | RLH-11 (2) | round-derivation row | batch 3 | batch 2 |
| `PROP-ROUND-01` | L1 | `roundDerivation.test.js` | `RLH-AT-01`…`-06`, `-63` | RLH-11 (2) | round-derivation row | batch 3 | batch 2 |
| `PROP-FORCE-01` | L1 | `forcePhases.test.js` | `RLH-AT-29` (and `-28`, `-01a`) | RLH-14 (2) | force-phases row | batch 3 | batch 2 |
| `PROP-COMPLETE-01` | L1 | `completeness.test.js` | `RLH-AT-60`, `-62` | RLH-12 (4) | `isComplete` row | batch 6 | batches 4–5 |
| `PROP-TRAILER-01` | L1 | `pacingWrapper.test.js` | `RLH-AT-61-loop` | RLH-21 (3) | pacing row | batch 7 | batches 3–6 |
| `PROP-RESOLVE-01` | L1 | `approvalSearch.test.js` | `RLH-AT-08`…`-11`, `-56`, `-57` | RLH-24 (3) | approval-search row | batch 8 | batches 3–7 |
| `PROP-LIST-01a` | L2 | `haltAndQueue.test.js` | `RLH-AT-21`…`-27` | RLH-25 (3) | halt-and-queue row | batch 9 | batches 3–8 |
| `PROP-LIST-01b` | L2 | `pacingWrapper.test.js` | `RLH-AT-43a` | RLH-21 (3) | pacing row | batch 7 | batches 3–6 |
| `PROP-APPROVE-01` | L2 | `approvalSearch.test.js` | `RLH-AT-08`…`-11`, `-56`, `-57` | RLH-24 (3) | approval-search row | batch 8 | batches 3–7 |
| `PROP-GINV-01` | L2 | `haltAndQueue.test.js` | `RLH-AT-13a` | RLH-25 (3) | halt-and-queue row | batch 9 | batches 3–8 |
| `PROP-EPISODE-01` | L2 | `pacingWrapper.test.js` | `RLH-AT-35`…`-54`, `-58` | RLH-21 (3) | pacing row | batch 7 | batches 3–6 |
| `PROP-WINDOW-01` | L2 | `reviewLoop.test.js` | `RLH-LOOP-01`, `-02` | RLH-22 (3) | `RLH-LOOP-01`/`-02` | batch 9 | batches 3–8 |
| `PROP-AWAIT-01` | L3 | `runtimeBundle.test.js` | `RLH-AT-19`, `-20`, `RLH-SCAN-01` | RLH-31 (2) | first row | **batch 2, on arrival** | **none, ever** |

Seventeen properties, eighteen ids (`PROP-LIST-01` splits into `-01a`/`-01b` across two files, one
owner each, per §1.3 and PLAN §7.4's `-module`/`-orch` precedent).

### 7.2 What each property covers that its examples cannot

| Property | The examples pin | The property adds |
|---|---|---|
| `PROP-DIGEST-01` | four canonicalisation outcomes | the **normal form** over arbitrary byte soup, incl. mid-line `\r` |
| `PROP-DIGEST-02` | four known-answer digests | totality of the 64-hex shape, and that canonicalisation is *inside* the digest |
| `PROP-HASH-01` | one quoted-trailer fixture | that **no** input yields a non-64-hex "hash" |
| `PROP-STALE-01` | three named edits | the whole edit space: every mutation is stale unless it is a normalisation |
| `PROP-SCAN-01` | two near-misses, three fixtures | *compositions* of near-misses, and conservation of line count |
| `PROP-NAME-01` | six named filenames | the **rejection** half — a negative over the complement of the catalogue |
| `PROP-ROUND-01` | six branch states | the width identity as a relationship, over every branch state incl. empty |
| `PROP-FORCE-01` | three inputs | catalogue closure, and that `all` expands to exactly six |
| `PROP-COMPLETE-01` | three present-sets | the `iff`, plus detection of `R` itself shrinking |
| `PROP-TRAILER-01` | four trailer shapes | **mutual exclusion** across recognisers — a cross-recogniser claim no AT makes |
| `PROP-RESOLVE-01` | three presence vectors | all sixteen, exhaustively, plus order-independence |
| `PROP-LIST-01a` | four dispositions at one phase | the phase × failure **product** — the H-2 shape |
| `PROP-LIST-01b` | one two-episode refresh | arbitrary interleavings, incl. phase changes mid-sequence |
| `PROP-APPROVE-01` | approvals that are found | approvals that must **not** be found: out-of-window, stale, half-unanimous |
| `PROP-GINV-01` | four enumerated exits | **reachability over paths** — the framing under which H-2 was visible and enumeration was not |
| `PROP-EPISODE-01` | three interleavings | the bound over all interleavings, and per-coordinate `EpisodeKey` independence |
| `PROP-WINDOW-01` | one threading assertion + a grep oracle | that the window is computed **once** and read identically by every consumer |
| `PROP-AWAIT-01` | two zero-match regexes + a site list | the classification as a **total partition** over the site set the walk computes |

### 7.3 Distribution against the test pyramid

Eleven L1, six L2, one L3 — measured against §7.1's `Level` column. That shape follows TSPEC §8.3's
own levelling rather than a target: the pure parsers and the digest path are where generated input
buys the most, the orchestration invariants need the seam doubles and so cost more per case, and
exactly one invariant (`PROP-AWAIT-01`) is about the source text rather than about behaviour.

**No property runs at L4.** Nothing here spawns a process, touches the filesystem, or reads `dist/`
(§2.4). The 100-case budget per property (§2.5) is set so that seventeen properties add a bounded
increment to a suite already measured at ~180 s wall time — the figure that already exceeds the 180 s
foreground watchdog and is why the baseline was run in the background.

## 8. Gaps, residuals, and measured inconsistencies

### 8.1 Measured inconsistency — TSPEC §8.1 and §8.2 do not agree on the property count

§8.1 states that *every parameterisable component in the L1 row carries at least one property*, and
names that row as `every parser, sha256Hex, scanLines, isStale, isComplete, deriveRoundWindow,
parseForcePhases, updateQueueStatus`. §8.2's table has **seven** rows. The difference is six
components: `parseApprovalHash`, `parseRevisionComplete`, `parseResolvedMarker`,
`extractRecommendation`, `isStale`, `updateQueueStatus`.

This document closes four of the six (`PROP-HASH-01`, `PROP-TRAILER-01` — which covers
`parseRevisionComplete` and `parseResolvedMarker` jointly through the mutual-exclusion conjunct — and
`PROP-STALE-01`). §8.2 remains the authority on the seven it owns; nothing here amends it. **The
finding itself is reported to the TSPEC's owner rather than silently absorbed**: a converged spec that
asserts a universal and enumerates a proper subset of it is the same shape as the defects this feature
exists to fix, and it should be corrected in a TSPEC revision — not by this document quietly making
the universal true.

### 8.2 Measured limitation — the shipped `shrink` cannot shrink this feature's cases

TSPEC §8.2 says `shrink` is used for the failure report. Measured at HEAD,
`__tests__/helpers/driftGenerators.js`'s `shrink(caseValue)` switches on `caseValue.kind` over exactly
four kinds — `"manifest"`, `"bytes"`, `"id"`, `"subRecipe"` — and its `default` branch returns `[]`.
**Every case shape this feature generates falls through to that default**: line arrays, filename sets,
presence vectors, episode interleavings, source fragments. Taken literally, the TSPEC sentence is
unimplementable for these properties as the helper stands.

Disposition (§2.3), and it is deliberately **not** a change to `driftGenerators.js`:

| Case shape | Approach |
|---|---|
| a single text/byte string (`PROP-DIGEST-01/-02`, `PROP-HASH-01`, `PROP-STALE-01`'s document) | wrap as `{ kind: "bytes" }` and use the shipped ladder unmodified |
| everything else (line arrays, filename sets, vectors, interleavings, fragments) | a **file-local** shrink ladder, declared per property in §4 |

This respects PLAN §7.2 exactly: generators — and now ladders — stay per-file, file-local and
unexported; no second primitive library is written; `driftGenerators.js` is reused unmodified. The
alternative, extending `shrink` with five new kinds, would touch a helper seven existing suites depend
on, in a feature whose whole subject is not breaking things quietly.

### 8.3 Deliberately without a property, and where each is owned

**DC-08 applies: each of these names a successor surface — a queue row, not a person or a promise.**

| Surface | Why no property here | Successor |
|---|---|---|
| `updateQueueStatus` | its input space is a two-state lifecycle write with an external effect (a commit); the interesting invariant is *transactional*, not generated, and PLAN §7.4 already splits its assertions into `-module`/`-orch` halves with owners. A generated property would restate `RLH-AT-30`…`-34` without adding a quantifier | none needed — covered by the AT split at both levels. Recorded here so §8.1's list is fully accounted for |
| `extractRecommendation` | it extracts a free-text field; there is no invariant over generated prose beyond "returns a string or nothing", which is an assertion, not a property. Writing one would be a green square with no falsifier — §5.1's definition of worse than none | none. Explicitly declined, not deferred |
| `MAX_AUTHORING_WRITE_BYTES` (TSPEC §4.8) | the constant governs **authoring agent behaviour**, not workflow code. Nothing in `orchestrate-dev.js` reads it in a way a property can quantify over; `skillFiles.test.js` asserts only that the figure is *stated* in the SKILLs (PLAN §9.1). There is no oracle for the behaviour it names | **queue row Order 9, `pdlc-authoring-contract`** (`docs/pdlc-authoring-contract/REQ-pdlc-authoring-contract.md`, status `blocked`, `Depends-On: pdlc-review-loop-hardening`) — the row that already owns the authoring contract, and the natural home for an executable byte-budget oracle |
| SKILL template ↔ `completeness.test.js` fixture drift | PLAN §10.2 / risk `H-j` state this is undetected and that bolting a comparison onto `completeness.test.js` is out of scope; §6.4 explains why `PROP-COMPLETE-01` does not close it | **queue row Order 9, `pdlc-authoring-contract`** — the same row PLAN §10.2 points at |
| per-worktree consumer state (`.claude/workflows/`) | not this feature's surface at all; noted only because `PROP-AWAIT-01` reads source and a reader may wonder which tree it reads (answer: `pdlc/workflows/*.js`, never `dist/`, never `.claude/`) | **D-DIST-07 / queue row Order 6, `pdlc-install-mechanism`** |

### 8.4 Residual risks this document carries

1. **The `PROP-` namespace is already occupied** (§2.1, measured: 431 matches across 28 files, 23
   domains, including a live `describe("PROP-GATE-01: …")` at `pipelineWiring.test.js:235`). The
   sixteen domains chosen here were each verified to return zero matches at HEAD, and `PROP-GATE-01`
   was renamed `PROP-GINV-01` for exactly this reason. **This verification is point-in-time**: a
   future feature can collide again. The durable fix is the `RLH-`-style namespacing PLAN §1.3 already
   mandates for ATs, extended to properties — which is a PLAN convention change, not this document's
   to make.
2. **Non-vacuity floors are asserted, but the floors themselves are hand-chosen.** Every floor in §4
   is stated as an assertion the property makes about its own corpus, so a generator that stops
   producing a shape fails loudly. What is *not* checked is whether a floor of ten is enough; that is
   a judgement, revisited if a defect escapes.
3. **Six of the seventeen properties depend on seam doubles behaving synchronously** while the
   production adapter is async (the C-2 consequence: every injected IO call must be `await`ed). A
   subject that forgets an `await` can pass an L2 property against sync doubles and fail in the
   runtime — which is precisely the hole `PROP-AWAIT-01` exists to cover at L3, and why it is
   green-on-arrival with **no permitted red, ever**.

### 8.5 What could not be written against the specs

One item, recorded rather than invented: **TSPEC §4.5's `EpisodeKey` is defined by its five
coordinates, but the specs do not name a canonical serialisation for it.** `PROP-EPISODE-01`
therefore asserts *independence* of counters across pairs differing in one coordinate — a
formulation that needs no serialisation — rather than the more direct "equal keys share a budget,
unequal keys do not", which would require the test to construct a key and so to fix a serialisation
the TSPEC does not own. If a serialisation is later pinned, the property can be strengthened; it is
correct, and weaker than it could be, as written. Everything else in §4 was derived from a spec
section that states the invariant outright.
