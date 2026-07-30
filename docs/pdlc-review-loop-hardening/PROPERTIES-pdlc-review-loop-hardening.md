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

**Beyond the examples.** The known-answer vectors (§6.2) pin four points; this pins the *shape of the
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

**Beyond the examples.** AT-05…AT-09 pin named near-misses one at a time; the generator composes them
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

**Beyond the examples.** AT-30…AT-33 are four named filenames. The rejection direction is the half
examples cannot carry: it asserts a *negative over a space*, that nothing outside the catalogue parses,
which is what stops a loosened regex from silently admitting `CROSS-REVIEW-pm-REQ-v1.md.bak`.

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
whole input space rather than at the three ATs (AT-34…AT-36) that sample it.

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

**Beyond the examples.** AT-52…AT-55 sample four inputs. Closure over the catalogue — that nothing
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

**Beyond the examples.** AT-40 and AT-41 pin two present-sets. The property is what makes the
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

**Beyond the examples.** AT-15…AT-17 sample three edits. The property covers the *edit space*: any
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

**Beyond the examples.** AT-24…AT-27 name four dispositions one phase at a time. The product with the
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
(AT-44…AT-47); the property additionally asserts *not* finding one that is not, over a space that
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

## 6. Fixtures

## 7. Coverage matrix

## 8. Gaps, residuals, and measured inconsistencies
