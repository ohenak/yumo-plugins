---
feature: pdlc-rcv-budget-stop
---

# TSPEC — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-rcv-budget-stop.md` v3.1 → `FSPEC-pdlc-rcv-budget-stop.md` v1.3 → **TSPEC** |
| Downstream | `PLAN-pdlc-rcv-budget-stop.md`, `PROPERTIES-pdlc-rcv-budget-stop.md`, implementation |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` while active |
| LEARNINGS | `docs/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md` |
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — measured facts `M-*`, thresholds §3/§3.1, durable homes §3.2 |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — vocabulary §1, closed catalogue `S-1 … S-17` §2, row schema §3, row-B render §4 |
| Shared split record | `docs/_constraints/pdlc-rcv-split.md` — paired edges §5, shared arguments §5.1–§5.8 |
| Sibling | `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` (**REQ-RCV-07**) — forward edge X-06; its **O-12** fixes the `validate` seam contract this TSPEC adopts |
| Target | `pdlc/workflows/orchestrate-dev.js`; `pdlc/workflows/lib/`; `pdlc/workflows/dist/` rebuilt in the same commit (O-11) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-02 |

## 1. Overview, altitude and what this document owes

### 1.1 What is being built

Three behavioural changes to one shipped module, `pdlc/workflows/orchestrate-dev.js`:

1. the review budget narrows from **5 to 3** and becomes **absolute per document** rather than
   per invocation — the window runs `BUDGET` rounds from an **origin `W`**, not from wherever the
   branch's highest existing round happens to sit;
2. every halt of a document-typed review phase **maintains a `## Reset Region`** in that phase's
   post-mortem — appending its own `HALT-REASON:` line, stripping the spent `RESOLVED:` marker,
   and rewriting the Iterations heading to a two-integer render — under two content confirmations
   that fail closed into a **phase refusal**;
3. a **clearance gate** reads that region before the window is computed, and, on an operator's
   one `RESOLVED: yes`, appends exactly one answering line that moves (or re-affirms) `W`.

Almost none of this is new control flow. The zero-round budget halt is the **shipped** halt branch
(`reviewLoop`'s `if (iteration > endIndex)`) entered on its first pass with `startIndex > endIndex`;
the phase refusal is the **shipped** step-G shape (`recordPhase(… "❌" …)` then `haltError`); the
clearance gate is a new block inside the **shipped** `phaseGate`. What is genuinely new is one
region parser, one region writer, one report-row carrier, and the seam that row 18 will wire.

### 1.2 Altitude

This document states **where each rule runs, which symbol owns it, what its signature is, what it
returns on every input, and which existing symbol it composes with**. It does not restate the
behaviour those rules produce — that is FSPEC's, cited by branch id (`B-*`) — nor the requirement,
cited by criterion id (`AC-1.x`). Fixture construction, generation axes, call-count oracle
construction and the falsification ledger's contents are **PROPERTIES'** (`REQ-RCV-01` O-10);
the per-artifact lifecycle line is **PLAN's** (O-15).

Shipped behaviour is cited by measured-fact id (`M-*`) as the family requires, **and additionally
by symbol and line at the citation baseline `9486c81`** where this document asserts a fact about
existing code that a reader must be able to check — `REQ-RCV-01` NB-4's `M-*`-only discipline is a
rule for the *REQ*, and §2.7 records why a TSPEC must cite the source it is going to edit.

### 1.3 What this TSPEC owes, by obligation

| Obligation | Owed here | Discharged in |
|---|---|---|
| **O-5** | how AC-1.4's region survives every halt — loop-owned state, the clause order, the one-update rule over clauses 1 and 2, both confirmations, the fail-closed refusal | §5.3, §6.4, §7 |
| **O-12** | how `W` is resolved before the round window is computed; how the *region validates* predicate is supplied to the gate; the interim's **0-consultation** observable. The seam's **contract** is `REQ-RCV-07` O-12's and is **adopted, not restated** | §5.4, §6.2, §6.3 |
| **O-13** | (a) how test code obtains the effective budget; (b) the closed, five-class enumeration of width sites and the machine that compares it against a repo scan | §8 |
| **O-14**'s implementation half | threading *rounds this entry ran* to the loop's post-write step; the Iterations anchor, placement and not-found insert; the empty reviewer-verdict list; the no-re-author path | §6.4, §6.5 |
| **O-9** | named where it attaches (the post-mortem prompt) — the clause's **text** is FSPEC §9's and is not re-authored here | §6.4 step 2 |
| **O-11** | the rebuild's placement in the change | §2.1, §9.5 |
| **O-10**, **O-15** | **not discharged** — named where they attach | §9.6, §11 |

### 1.4 What this TSPEC deliberately does not specify

| # | Not here | Owner |
|---|---|---|
| **T-N-1** | The *region validates* decision procedure, its `{reason}` selection, the torn-write residue analysis, the validation-failure refusal's strings | `REQ-RCV-07` AC-7.1–AC-7.5 (forward edge **X-06**) |
| **T-N-2** | The fixed-point and zero-delta tests, `blocking` and `panel-shape` cell population, S-3/S-11 emission | `pdlc-rcv-fixed-point-stop` |
| **T-N-3** | `growth-bytes` / `classification` cell population, `appendRoundAnchors`, `DOC-BYTES:` / `DOC-SHA256:` / `REVIEW-MODE:` | `pdlc-rcv-panel-topology` |
| **T-N-4** | Which verdict sequence produces convergence inside a granted window (FSPEC §11.4's clause fixes the *outcome*, not the fixture) | PROPERTIES |

## 2. Constraints the design is not free to violate

These are the facts that make several otherwise-reasonable designs illegal. Each is checkable at
the cited path; where the fact is a shipped-code fact it carries its symbol and its line at
`9486c81`.

### 2.1 The workflow runtime, and what that forbids

`CLAUDE.md`'s *Workflow scripts and the runtime build* fixes four constraints this design must
respect, all of them checked mechanically by `pdlc/workflows/__tests__/runtimeBundle.test.js`:

| # | Constraint | Consequence for this feature |
|---|---|---|
| **C-1** | The runtime cannot load `pdlc/workflows/*.js` directly; `build-runtime.mjs` inlines **exactly three** sources — `orchestrate-dev.js`, `orchestrate-queue.js`, `runtime-adapter.js` (`pdlc/workflows/build-runtime.mjs:83`–`:85`) | **Every symbol the pipeline executes at runtime must live in `orchestrate-dev.js`.** A new `pdlc/workflows/lib/*.mjs` module is *not* loadable by the runtime — `document-oracles.mjs` is the standing precedent and is explicitly not part of the bundle. So the region parser, the region writer and the gate are **module-scope functions in `orchestrate-dev.js`**, not a new library (§3.1 records the alternative and why it was rejected) |
| **C-2** | `import` / `import()` / `process` / `fs` / `fetch` do not exist in the runtime; `stripModuleSyntax` deletes every `^import …;` line (`build-runtime.mjs:48`) | The new code performs **no** IO of its own. Every read and write crosses an injected seam (§5), exactly as `checkPostmortem` and `refreshReviewState` already do |
| **C-3** | `stripModuleSyntax` rewrites `^export (const\|let\|var\|function\|async function\|class) ` to the bare declaration (`build-runtime.mjs:51`) | **`export const MAX_REVIEW_ROUNDS = 3;` is feasible**: the bundle sees `const MAX_REVIEW_ROUNDS = 3;`, byte-identical in effect to today's `orchestrate-dev.js:52`. This is what makes O-13(a)'s single-source requirement satisfiable at all (§8.1) |
| **C-4** | The adapter's IO implementations are **async**; the module's test doubles are sync | **Every injected IO call this feature adds is `await`ed**, without exception. An un-awaited `_writeFile` returns a Promise that the confirmation read would compare against nothing |

**O-11 is part of the change, not after it.** `pdlc/workflows/dist/` is rebuilt (`node
pdlc/workflows/build-runtime.mjs`) in the **same commit** as every edit to `orchestrate-dev.js`;
CI's *Generated artifacts are in sync* job is the enforcement, and §8's enumeration classifies the
regenerated occurrences rather than forbidding them.

### 2.2 The 180-second stall watchdog

`PACING_CONTRACT_CLAUSE` (`orchestrate-dev.js:2556`) exists because the runtime kills a dispatch
that makes no progress for 180 s. This bears on the design in one place: the halt path's writes
(§6.4) are **small, whole-file writes of a post-mortem**, well under `MAX_AUTHORING_WRITE_BYTES`,
performed by the **loop** and not by an agent, so no dispatch is in flight while they run.

### 2.3 The shipped halt branch is the zero-round halt

`reviewLoop`'s loop-top guard is `if (iteration > endIndex)` (`orchestrate-dev.js:1960`), and its
body writes the post-mortem, confirms it with `_checkFile`, builds `lastResults` from `result1` /
`result2` and returns `{converged: false, iterations: MAX_REVIEW_ROUNDS, …}`
(`:1960`–`:2016`). Entered with `iteration = startIndex > endIndex` **on the first pass**, that
branch already produces FSPEC's B-WIN-2 exactly: no reviewer dispatched, no cross-review file,
straight to the halt. Two things about it are wrong for this feature and are changed in place:
`result1`/`result2` are `undefined`, so `lastResults` would carry two fabricated *Needs revision*
rows (AC-1.3's fourth quantity, B-RPT-5), and the Iterations literal is `M-1c`'s single number.

### 2.4 The three budget read sites, and the one arithmetic site

`M-1a` … `M-1c`, re-verified at HEAD: the declaration is `orchestrate-dev.js:52`; the width
arithmetic is written **once**, in `windowEnd` (`:2492`–`:2494`), and
`pdlc/workflows/__tests__/reviewLoop.test.js:964` (`RLH-LOOP-03`) asserts the string
`MAX_REVIEW_ROUNDS - 1` occurs **exactly once** in the module. The three arithmetic-free reads are
`checkConverged`'s `recordPhase` argument (`:1799`), the post-mortem prompt's required-sections
literal (`:1965`) and the returned `iterations` field (`:2011`).

**This is a design asset, not an obstacle.** `windowEnd` is the single place the window's *width*
is expressed, so re-pointing it from *"start + width"* to *"origin + width"* changes the window's
meaning repo-wide in one line and keeps `RLH-LOOP-03` green.

### 2.5 `deriveRoundWindow` is synchronous, total and content-addressed

`deriveRoundWindow(basenames, docType)` (`orchestrate-dev.js:2428`) takes **one** directory
listing, consults no clock and no seam, and returns `{ok, startIndex, endIndex, present,
skipped}`. `refreshReviewState` (`:2656`) is the only caller that fetches the listing;
`roundDerivation.test.js:389` pins the returned key set exactly.

**The origin must therefore be a parameter, not an ambient read.** `deriveRoundWindow` may not
learn `W` by reading a post-mortem — that would give it a seam and destroy the property the test
suite pins. §6.1 passes the origin in.

### 2.6 The post-mortem gate, and where a refusal is shaped

`checkPostmortem` (`:2738`) maps an absent or blank file to `{status: "none"}` and a file whose
`RESOLVED:` marker is absent, `no`, unparseable or duplicated to `{status: "unresolved"}` — the
shipped fail-closed reading (M-7a). Step G in `phaseGate` (`:4493`–`:4506`) consumes it: on
`"unresolved"` it sets `gatePostmortem`, records
`Refused — unresolved POSTMORTEM at ${gate.path}` and throws a **field-free** `haltError`.

Two properties of that shape are load-bearing for this feature's refusals (§7.2):

- `recordPhase(…, "❌", …)` is called **before** the throw, so `main`'s catch finds the ❌ row;
- the thrown error carries **no** `postmortemStatus` field. `M-8g`: exactly one `haltError` site
  in the module passes a second argument (`checkConverged`, `:1799`–`:1803`), so any refusal built
  in step G's shape falls through to `main`'s branch 3 existence probe (`:4890`–`:4901`) and
  reports `postmortemStatus: "written"` — which is catalogue §4's mandated value for row B.

### 2.7 Why this TSPEC cites lines where the REQ may not

`REQ-RCV-01` NB-4 forbids the **REQ** from asserting anything about `orchestrate-dev.js`'s control
flow that is not a measured fact, because the predecessor's Phase R died litigating exactly such
claims at requirements altitude. A TSPEC is the document that *edits* that control flow: it cannot
state where a block goes without naming the block it goes beside. The discipline this document
adopts instead is **every line citation names its enclosing symbol and the commit** (`9486c81`),
so a drifted line number is a mechanical re-baseline rather than a finding — the rule
`docs/_constraints/pdlc-rcv-baseline.md` §2.8 already applies to its own `M-8*` rows.

## 3. Architecture — module map, placement and data flow

### 3.1 Where the new code lives, and the alternative that was rejected

**Everything the pipeline executes lives in `pdlc/workflows/orchestrate-dev.js`** (C-1). The new
symbols form three clusters, each a contiguous block with its own section banner in the module's
existing style:

| Cluster | New symbols | Placed | Character |
|---|---|---|---|
| **Region read model** | `RESET_REGION_HEADING`, `HALT_REASON_PREFIX`, `WINDOW_START_PREFIX`, `WINDOW_RESUMED_PREFIX`, `parseResetRegion`, `resolveOrigin` | immediately **above** `checkPostmortem` (`:2738`), beside the other post-mortem readers | **pure**, synchronous, total, no seam |
| **Region write model** | `renderIterationsHeading`, `applyIterationsSection`, `applyHaltUpdate`, `haltReasonValue` | immediately **below** the read model | **pure** string→string transforms; the IO is the caller's |
| **Composition** | `readRegionState`, `resolveClearance`, `maintainRegionOnHalt`, `phaseWindow` (extended), `reviewLoop` (extended), `checkConverged` (extended), `buildFinalReport` (extended) | at their existing sites | `async`, seam-taking |

**Rejected: a `pdlc/workflows/lib/reset-region.mjs` module.** It is the shape this repo already
uses for pure logic (`lib/document-oracles.mjs`), it would be unit-testable without touching the
1 800-line module, and it is what a reader coming from `document-oracles.mjs` will propose. It is
**not viable**: `build-runtime.mjs` inlines three named sources (`:83`–`:85`) and `import` does not
exist in the runtime (C-1, C-2), so a `lib/` module is invisible to the shipped pipeline — the
runtime would throw on the first call. Adding a fourth inlined source is a change to the
distribution mechanism, owned by the `pdlc-workflow-distribution` line of work, and would have to
carry its own manifest row, freshness gate and sync semantics. The pure/impure separation the
`lib/` split would have bought is instead bought **inside** the module by the read/write model
clusters above, which take no seam and are exported for direct test import.

**The one thing that does go to `lib/`:** §8's width-site enumeration oracle. It is a *repo
scanner*, never loaded by the runtime, and it is exactly the shape `document-oracles.mjs` already
serves — a pure function of a `root` path. It lands as `pdlc/workflows/lib/budget-sites.mjs`.

### 3.2 The dependency graph

```
                      ┌─────────────────────────────────────────┐
  seams (§5) ────────▶│ readRegionState   (async, composes)     │
                      │   ├─ _readFile ─▶ post-mortem text      │
                      │   └─ parseResetRegion  (pure)           │
                      └───────────────┬─────────────────────────┘
                                      │ RegionState {H, A, W, present}
                      ┌───────────────▼─────────────────────────┐
  deriveRoundWindow ─▶│ resolveClearance  (async, composes)     │
   (D, pure)          │   ├─ checkPostmortem status  (shipped)  │
                      │   ├─ validationConjunct  (§6.3, X-06)   │
                      │   └─ appendAnsweringLine ─▶ _writeFile  │
                      └───────────────┬─────────────────────────┘
                                      │ W (possibly moved)
                      ┌───────────────▼─────────────────────────┐
                      │ phaseWindow → {derivedStart, startIndex,│
                      │                endIndex, origin}        │
                      └───────────────┬─────────────────────────┘
                                      │
                      ┌───────────────▼─────────────────────────┐
                      │ reviewLoop  (shipped, extended)         │
                      │   iteration > endIndex ─▶ halt path     │
                      │        └─ maintainRegionOnHalt (§6.4)   │
                      └───────────────┬─────────────────────────┘
                                      │ LoopResult (+refusal fields)
                      ┌───────────────▼─────────────────────────┐
                      │ checkConverged ─▶ recordPhase / halt    │
                      │ buildFinalReport ─▶ reviewRows (§4.4)   │
                      └─────────────────────────────────────────┘
```

The arrow from `deriveRoundWindow` into `resolveClearance` is FSPEC §4.4's normative ordering
made structural: `D` is a **parameter** of the gate, and the gate's output `W` is a **parameter**
of the window arithmetic. There is no cycle because `deriveRoundWindow` is called once, with
`origin = 1`, purely to obtain `derivedStart`; the admission arithmetic is evaluated afterwards
from `(derivedStart, W)` without re-listing the directory (§6.1).

### 3.3 The two entry points, and what each owns

| Entry | Symbol | Owns |
|---|---|---|
| **Phase entry** | `phaseGate` (`:4403`) | steps 1–4 (shipped), step G (shipped), **then** the region read, the clearance gate and the window arithmetic (§6.1–§6.3) |
| **Halt** | `reviewLoop`'s `iteration > endIndex` branch (`:1960`) | the authoring decision, clause 3, the clause 1-and-2 update, the two confirmations, the refusal (§6.4) |

Nothing else in the pipeline reads or writes the region. `orchestrate-queue.js` is **untouched**:
the queue forwards no `forcePhases` and takes no window state, and the `halted` row it reads is
written by the shipped `_recordHalt` path, unchanged by this feature.

### 3.4 Data flow across one entry, end to end

FSPEC's Behavioral Flow, with the owning symbol against each step:

| Step | FSPEC | Symbol | Seams used |
|---|---|---|---|
| 0 | loop discrimination | `phaseGate`'s caller — a phase's `docType` argument; Phase CR passes `docType: null` (`:4985`, M-7f) | — |
| 1 | read the region | `readRegionState` | `_readFile` |
| 2 | clearance gate | `resolveClearance` | `_readFile` (marker, via `resolvePostmortem`), `_writeFile` |
| 3 | window arithmetic | `phaseWindow` → `deriveRoundWindow` + `windowEnd` | `_listFiles` (via `refreshReviewState`) |
| 4a/4b | dispatch or zero-round halt | `reviewLoop` | `_agent`, `_parallel` |
| 5 | halt-path maintenance | `maintainRegionOnHalt` | `_statFile`, `_readFile`, `_writeFile`, `_checkFile` |
| 6 | reporting | `checkConverged`, `buildFinalReport` | — |
| 7 | post-mortem authoring | `reviewLoop`'s halt branch | `_agent` |

**Where a step refuses, the following steps do not run** — structurally, because steps 2 and 5
refuse by `throw`ing a `haltError` after recording their ❌ row (§7.2), and every one of them sits
inside `main`'s single `try` (`:4373`, M-8a).

## 4. Types and data model

The module is JavaScript with JSDoc types (`orchestrate-dev.js` throughout); "interface" below
means a JSDoc `@typedef` plus the structural contract every producer and consumer honours. Every
type is **closed** — an ill-shaped value is not coerced, it takes the fail-closed branch §7 names.

### 4.1 `RegionState` — the read model

```js
/**
 * @typedef {object} RegionState
 * @property {boolean} present   - a `## Reset Region` heading exists outside fences
 * @property {number}  H         - count of `HALT-REASON:` lines in the region span
 * @property {number}  A         - count of `WINDOW-START:` PLUS `WINDOW-RESUMED:` lines
 * @property {number}  W         - the origin: the greatest well-formed `WINDOW-START:` value, else 1
 * @property {string|null} lastHaltReason - the last `HALT-REASON:` line's value, or null
 * @property {string[]} lines    - the region's S-13/S-14/S-15 lines, verbatim, in document order
 */
```

Invariants the producer guarantees on **every** input, including an unreadable file:

| # | Invariant | Why it is here |
|---|---|---|
| **RS-1** | `H ≥ 0`, `A ≥ 0`, both counted **by line prefix, whatever the value** | split §5.4's counting rule; B-REG-3. A malformed value still answers a halt |
| **RS-2** | `W` is a **decimal integer ≥ 1**, never `NaN`, never a string, never a non-numeric value | B-REG-4. `W` flows into `windowEnd` and `Math.max`; a `NaN` there silently produces a window that admits nothing and reports nothing |
| **RS-3** | `W === 1` when no well-formed `WINDOW-START:` value is present — total over the empty set, where a bare `Math.max` would yield `-Infinity` | split §5.4's property; baseline §3.2's fail-closed direction |
| **RS-4** | `present === false` ⇒ `H === A === 0`, `W === 1`, `lines` empty, `lastHaltReason === null` | B-REG-1, B-REG-2, B-REG-6 read identically |
| **RS-5** | `lines` contains only lines **inside the region span and outside fenced blocks** | B-REG-5, BR-8. The span is heading→next top-level heading→EOF |

`lines` is carried rather than derived on demand because AC-1.4 clause 1 requires every prior line
**preserved verbatim in document order**, and the writer (§4.3) rebuilds the region from it.

### 4.2 `WindowState` — what `phaseWindow` returns

`deriveRoundWindow`'s shipped return grows two fields and changes the meaning of one:

```js
/**
 * @typedef {object} WindowState
 * @property {true}   ok
 * @property {number} origin       - W, the window origin (1 when no reset is in effect)   [NEW]
 * @property {number} derivedStart - D: one past the highest existing round of this docType [NEW]
 * @property {number} startIndex   - S = max(derivedStart, origin)                    [MEANING CHANGED]
 * @property {number} endIndex     - E = windowEnd(origin) = origin + BUDGET - 1      [MEANING CHANGED]
 * @property {Map<string, number[]>} present
 * @property {Array<{basename: string, reason: string}>} skipped
 */
```

- `derivedStart` is exactly today's `startIndex` — `max(existing rounds) + 1`, or 1 when the doc
  type has no cross-review file. Named so the origin-wins rule (B-WIN-3) has two distinguishable
  quantities rather than one overwritten one.
- `startIndex` becomes `max(derivedStart, origin)` (BR-4). **`startIndex > endIndex` is a legal,
  expected value** — it is FSPEC's B-WIN-2, and `reviewLoop`'s shipped loop-top guard consumes it
  without a new branch (§2.3).
- `endIndex` is counted from the **origin**, never from the start (AC-1.1; B-WIN-4/B-WIN-5).

**Compatibility note for the PLAN:** `roundDerivation.test.js:389` asserts the returned key set is
exactly `["endIndex", "ok", "present", "skipped", "startIndex"]`. That assertion is **updated, not
deleted** — it is the oracle that a future field is added deliberately, and it grows to include
`derivedStart` and `origin`.

The `{ok: false, reason: "malformed_round_one_duplicate", role}` arm is **unchanged**: it is a
listing fault, decided before any origin is relevant, and it still halts (`refreshReviewState`,
`:2656`).

### 4.3 `HaltUpdate` — the write model's one-shot transform

Clause 1 and clause 2 are **one update of one file** (AC-1.4's ordering; split §5.8), so they are
one pure function producing one string:

```js
/**
 * @typedef {object} HaltUpdateResult
 * @property {string} text        - the post-mortem's full new text
 * @property {string} haltLine    - the exact `HALT-REASON: {value}` line appended
 * @property {number} strippedCount - how many unfenced `RESOLVED:` lines were removed
 */
```

`applyHaltUpdate(text, haltReasonValue) → HaltUpdateResult` is **total over every input string**,
including `""`:

| Input shape | Result |
|---|---|
| no `## Reset Region` outside fences | the region is **created** at the end of the file, carrying exactly one line — this halt's (B-HALT-1) |
| region present | every existing line preserved in document order, this halt's line **appended after the last of them**, nothing above or between (B-HALT-2, BR-7) |
| any unfenced `RESOLVED:` line, anywhere in the file, inside or outside the region span | removed (clause 2). A **fenced** `RESOLVED:` survives byte-identically (B-HALT-6) |

The two rules quantify over **disjoint** line sets — a `RESOLVED:` line is never a region line
(catalogue §1 reads three prefixes only) — so they compose without an ordering question, which is
what lets them be one transform rather than two ordered writes.

### 4.4 `ReviewRow` — the run report's per-round row

Catalogue §3's schema, carried on the final report as a **new field `reviewRows`**:

```js
/**
 * @typedef {object} ReviewRow
 * @property {number|""} round
 * @property {string} panelShape      - "" at this ship (pdlc-rcv-fixed-point-stop's)
 * @property {string} blocking        - "" at this ship (pdlc-rcv-fixed-point-stop's)
 * @property {string} growthBytes     - "" at this ship (pdlc-rcv-panel-topology's)
 * @property {string} classification  - "" at this ship (pdlc-rcv-panel-topology's)
 * @property {string} notice          - the `; `-joined notice list, "" when empty
 */
```

**Why a new field and not a phase-row `detail` string.** `notices` (`:4380`) already carries
report lines the operator reads, but existing oracles pin phase-row `detail` values verbatim
(`:4384`'s comment states exactly this), and catalogue §3 requires a **table with fixed columns**
that three REQs populate cell by cell. A string channel cannot carry a schema two later features
must extend without re-parsing prose. `reviewRows` is `[]` on every run that produces neither row
B nor row C, so no existing report shape changes.

**This feature populates exactly two row kinds** and no other:

| Row | Produced by | Cells |
|---|---|---|
| **row C** — zero-round budget halt | `reviewLoop`'s halt branch, when `roundsRun === 0` (B-RPT-4) | `round` = the resolved start `S`; four cells `""`; `notice` = **exactly** this halt's S-4 render, no separator |
| **row B** — refusing entry, *unconfirmable-append* variant | `resolveClearance` (B-CLR-7) and `maintainRegionOnHalt` (B-HALT-4, B-HALT-5) | `round` = the round the entry would have opened; four cells `""`; `notice` = **`""`** — an IO fault of the loop is not a state of the region, so no S-16 (BR-16) |

Row B's *validation-failure* variant, and every other row kind, are **not produced here**
(T-N-1, T-N-2, T-N-3). Rows B and C are mutually exclusive by construction: row C is written on
the path that **records** a halt, row B on the paths that record none (catalogue §3's *records*,
not *takes*), and no code path emits both.

### 4.5 `LoopResult` — the two fields `reviewLoop` gains

```js
 // existing: {converged, iterations, lastResults, postmortemWritten, postmortemPath, trailerReason}
 // existing: {converged, iterations, halted, haltDetail, trailerReason, …}
 /** @property {number} roundsRun  - rounds THIS entry dispatched; 0 on a zero-round halt (O-14) */
 /** @property {{which: string, path: string, round: number}|null} refusal - §7.2's phase refusal */
```

`roundsRun` is the `{k}` of §6's Iterations render. It counts rounds this **entry dispatched**,
whatever their outcome — FSPEC OQ-01's stated default — and is therefore incremented at the
dispatch site, not at a verdict site. It is deliberately **not** derivable from `iterations`,
which remains the **budget** (M-1c, AC-1.3, B-RPT-3).

`refusal.which` is one of the three catalogue §4 literals — `"answering line"`, `"halt line"`,
`"iterations section"` — and nothing else. It is a **closed set**, declared as a frozen array
(§5.5), because catalogue §4 fixes exactly three and BR-16 forbids a fourth.

## 5. Protocols — the seams and their contracts

Every service boundary is a **named injected parameter with a module-scope default**, the shape
this module already uses (`_readFile = defaultReadFile`, `_checkFile = checkFileNonEmpty`, …). Two
seams are reused unchanged, one is threaded further, one is new, and one is declared-but-unwired.

### 5.1 Reused unchanged

| Seam | Contract | Used by |
|---|---|---|
| `_readFile(path) → Promise<string\|null>` | the file's text, or `null` for absent **or unreadable** — the two are not distinguished, which is precisely why the presence probe is a separate seam (§5.2) | `readRegionState`, both confirmations |
| `_checkFile(path) → Promise<{ok:true}\|{ok:false, reason:"file_missing"\|"file_empty"}>` | `checkFileNonEmpty`'s shipped contract (`:361`); swallows every throw into `{ok:false}` | the shipped post-mortem write confirmation (`:1998`), unchanged |
| `_agent(skill, prompt, opts) → Promise<string>` | shipped | the post-mortem authoring dispatch, unchanged in kind |
| `_listFiles(dir)` | shipped | `refreshReviewState` → `deriveRoundWindow` |

### 5.2 New — `_statFile`, the presence probe

```js
/**
 * @callback StatFile
 * @param {string} path
 * @returns {Promise<{exists: true}|{exists: false}|{unevaluable: true}>}
 */
_statFile = defaultStatFile
```

**Why a new seam rather than `_checkFile` or `_readFile`.** FSPEC §7.2's discriminator between a
*creating* and an *existing* halt is **file presence**, and §7.4 fixes the safe rule: *when the
discriminator cannot be evaluated, the halt takes the **existing** path.* Neither shipped seam can
express that:

- `_readFile` returns `null` for absent **and** for unreadable, so an unreadable post-mortem would
  read as absent and be **re-authored over** — erasing a live region and the operator's
  `## Recommendation`. This is the harm §7.2 exists to prevent;
- `_checkFile` collapses an IO fault into `{ok:false, reason:"file_missing"}` (`:377`–`:379`),
  the same value it returns for a genuinely absent file — the same conflation by a different name.

`_statFile` is the seam whose failure mode is *unevaluable*-rather-than-*absent*, which FSPEC §7.2
routes to TSPEC by name (F-N-4). Its default:

```js
export function defaultStatFile(path, { fsMod = fs } = {}) {
  if (!path || String(path).trim() === "") return { exists: false };
  try {
    fsMod.statSync(path);
    return { exists: true };
  } catch (err) {
    if (err && err.code === "ENOENT") return { exists: false };
    return { unevaluable: true };            // EACCES, EIO, ELOOP, anything else
  }
}
```

`ENOENT` is the **only** errno that answers *absent*; every other outcome is `unevaluable`. The
runtime adapter's implementation follows `rtCheckFile`'s shape (`runtime-adapter.js:817`) with a
three-way command — `test -e` distinguishing `PRESENT` / `ABSENT`, and any unparseable reply
mapping to `{unevaluable: true}`, never to `{exists: false}`.

**Scope of the guarantee, stated because FSPEC §7.2 scopes it:** only the probe that *cannot be
evaluated* is handled here. A probe that **answers `absent` for a file that is present** would
take the creating path and cause the harm; that false-negative is **out of scope for this feature**
(FSPEC §7.2, F-N-1), and `defaultStatFile` bounds it as far as a syscall can — it answers `absent`
on exactly one errno.

### 5.3 Threaded further — `_writeFile`

`_writeFile(path, contents) → Promise<"ok"|…>` already exists on `main` (`:4318`,
`defaultWriteFile` at `:4219`; the adapter's `rtWriteFile` at `runtime-adapter.js:994`), but is
**not** in `wrapperSeams` (`:4516`–`:4526`), so `reviewLoop` cannot write today. It is added to
`wrapperSeams` and to `reviewLoop`'s parameter list.

**Its return value is never trusted.** Every write this feature performs is followed by a
**content read-back** (BR-11) — the adapter's `rtWriteFile` answers `"ok"` when it *believes* it
wrote, and the shipped comment at `:1994`–`:1996` records that this belief has been wrong. The
confirmation contracts are §6.4's, not this seam's.

**`_appendFile` is deliberately not used for region lines.** It exists (`:4235`) and is used by
`appendApprovalAnchors` (`:2252`), but an append cannot express clause 2's strip, and clauses 1 and
2 must be **one update of one file** (AC-1.4; split §5.8). A read-modify-whole-file-write is the
only shape in which "no reachable state has this halt's line present and an unfenced `RESOLVED:`
line surviving" is true by construction rather than by ordering luck.

### 5.4 Declared, unwired — `_validateRegion` (X-06)

```js
/**
 * The *region validates* predicate. Arity 2, per `REQ-RCV-07` O-12, which fixes
 * this contract in exactly one place; it is ADOPTED here and not restated.
 *
 * @callback ValidateRegion
 * @param {RegionState} region
 * @param {string[]} basenames        - the branch listing the range check reads
 * @returns {{valid: true}|{valid: false, reason: "invalid-window-start"
 *          |"invalid-window-resumed"|"counts-mismatch", line?: string}}
 */
_validateRegion = NO_VALIDATOR
```

`NO_VALIDATOR = null`, named rather than spelled `null` at the site, exactly as `NO_PROBE`
(`:2778`) is — so a composition-root oracle can resolve the default to a module-level non-function
value and tell *"needs no runtime wiring"* from *"someone forgot to wire it"*.

**The seam takes no report sink** (`REQ-RCV-07` O-12): the S-16 notice is emitted by the caller's
run-report builder, so row 18 wires the third conjunct without changing this contract.

**At this ship the seam is declared and never called.** §6.3 states the composition and the two
observables that make *"deliberately not consulted"* falsifiable rather than vacuous.

### 5.5 Closed value sets

Declared as frozen module-scope arrays beside the existing `POSTMORTEM_STATUSES` (`:2852`) and
`VALID_VERDICTS` (`:525`), so a value outside the set is a defect the suite names rather than a
string that flows on:

```js
/** Catalogue §4's `{which}` token — exactly three literals, closed (BR-16). */
const REFUSAL_WHICH = Object.freeze(["answering line", "halt line", "iterations section"]);

/** Catalogue §2's S-16 reasons. Declared, EMITTED BY NOTHING at this ship (X-06). */
const REGION_CORRUPT_REASONS =
  Object.freeze(["invalid-window-start", "invalid-window-resumed", "counts-mismatch"]);
```

`REGION_CORRUPT_REASONS` is declared now, with a comment naming X-06, so `REQ-RCV-07` wires an
existing closed set rather than minting one — and so §9.3's *no S-16 is emitted at this ship* leg
has a symbol to assert emptiness against.

### 5.6 The seam table, gathered

| Seam | Default | New? | Consumers |
|---|---|---|---|
| `_readFile` | `defaultReadFile` | no | `readRegionState`, both confirmations |
| `_writeFile` | `defaultWriteFile` | threaded into `reviewLoop` | `resolveClearance`, `maintainRegionOnHalt` |
| `_statFile` | `defaultStatFile` | **yes** | `maintainRegionOnHalt`'s creating/existing discriminator |
| `_checkFile` | `checkFileNonEmpty` | no | shipped post-mortem write confirmation |
| `_listFiles` | `defaultListFiles` | no | `refreshReviewState` |
| `_agent` | `agent` | no | post-mortem authoring |
| `_validateRegion` | `NO_VALIDATOR` (`null`) | **yes, unwired** | nothing at this ship (§6.3) |

Per C-4, **every one of these is `await`ed at every call site**, including `_statFile`, whose Node
default is synchronous — the adapter's is not, and the module may not depend on which it got.

## 6. Algorithms

Every algorithm below is stated as: signature, the ordered steps, and its behaviour on **every**
input class. Purity is stated explicitly because §3.1's read/write model clusters are the
compensation for not having a `lib/` module.

**Cite-and-reuse, stated once.** Three cross-cutting obligations here are already solved in this
module and are **reused, not reinvented**: fence-scoped line scanning is `scanLines` (`:569`,
M-7d) — the same helper `approvalAnchorPreCount` and `parseResolvedMarker` use, so a
`HALT-REASON:` quoted inside a fenced block is invisible for the same reason a quoted anchor is;
top-level section location is `topLevelSections` (`:1393`), which is itself built on `scanLines`,
so this feature adds **no second heading walker** (the module's own comment at `:2527` states why
a second one would be a second oracle); and the confirm-don't-trust write discipline is §6.3 step
2's shipped shape (`:1994`–`:2000`), generalised from existence to content.

### 6.1 `phaseWindow` — resolving `D`, then `W`, then the window

Extends the existing `phaseWindow(docType)` closure in `main` (`:4403`'s neighbourhood), which
today delegates to `refreshReviewState` → `deriveRoundWindow`.

```
phaseWindow(docType, phaseId) →
  1. state ← await refreshReviewState({feature, docType, _listFiles, _readFile})
        // unchanged; `state.startIndex` is D, renamed `derivedStart` downstream
        // `{ok:false}` still halts, unchanged (§2.5)
  2. D ← state.startIndex
  3. region ← await readRegionState({phase: phaseId, feature, _readFile})     (§6.2)
  4. W ← await resolveClearance({phase: phaseId, feature, region, D, …})      (§6.3)
  5. return { ok: true, origin: W, derivedStart: D,
              startIndex: Math.max(D, W), endIndex: windowEnd(W),
              present: state.present, skipped: state.skipped,
              reviewFiles: state.reviewFiles }
```

Four things are load-bearing about this ordering:

1. **`D` is resolved before the gate** (step 2 precedes step 4) because the gate *consumes* it —
   B-CLR-2/B-CLR-2a branch on `D ≤ E`, and the granting value is `N = max(D, W)` (FSPEC §4.4).
2. **The admission arithmetic is evaluated once, after the gate** (step 5), against the origin the
   gate left behind. There is no cycle and no re-listing: `deriveRoundWindow` is called exactly
   once per entry, as it is today.
3. **`windowEnd` is re-pointed at the origin, not the start.** Its body is unchanged —
   `return origin + MAX_REVIEW_ROUNDS - 1;` — only its parameter's *meaning* changes, so
   `RLH-LOOP-03`'s *"`MAX_REVIEW_ROUNDS - 1` occurs exactly once"* assertion stays green (§2.4).
   `deriveRoundWindow`'s internal `endIndex = windowEnd(startIndex)` becomes
   `windowEnd(origin)` with `origin` defaulting to `1`, which reproduces today's value on every
   caller that passes no origin.
4. **`startIndex > endIndex` is returned, not thrown.** It is the zero-round window (B-WIN-2), and
   `reviewLoop`'s shipped guard consumes it (§2.3).

**Phase CR and Phase DOD take none of this.** Phase CR calls `reviewLoop` with `docType: null`
(`:4985`, M-7f); its window is derived with `origin = 1` and no region is read or written — steps 3
and 4 are **skipped when `docType` is `null`**, which is the one discriminator (AC-1.1: *"the phase
names a document type"*, B-BUD-1/B-BUD-2). Phase DOD does not call `reviewLoop` at all and reads
`DOD_MAX_ITERATIONS` (`:25`), a separate declaration (B-BUD-3, §8.2).

### 6.2 `parseResetRegion` / `readRegionState` — the read model

**`parseResetRegion(text) → RegionState`** — pure, synchronous, **total over every string**,
including `""`, and over `null` / `undefined` (coerced to `""`).

```
1. sections ← topLevelSections(text)                      // fence-scoped, shipped (:1393)
2. region   ← the FIRST section whose title trims to exactly "Reset Region"
              (case-sensitive; catalogue S-12 fixes the heading exactly)
   if none  → return { present:false, H:0, A:0, W:1, lastHaltReason:null, lines:[] }   (RS-4)
3. spanLines ← region.body                                 // heading → next top-level heading | EOF
4. for each line of spanLines, IN DOCUMENT ORDER, considered only when scanLines
   admits it (outside fenced blocks):
     trimmed ← line.trim()
     if trimmed startsWith "HALT-REASON: "     → H++, lastHaltReason ← value, lines.push(line)
     if trimmed startsWith "WINDOW-START: "    → A++,          lines.push(line)
     if trimmed startsWith "WINDOW-RESUMED: "  → A++,          lines.push(line)
     otherwise                                 → ignored entirely
5. W ← the GREATEST value among `WINDOW-START:` lines whose value matches /^[0-9]+$/
       and parses to an integer ≥ 1;  1 when there is none                            (RS-2, RS-3)
6. return { present:true, H, A, W, lastHaltReason, lines }
```

| Input class | Result | Branch |
|---|---|---|
| no heading | `{present:false, H:0, A:0, W:1}` | B-REG-1 |
| heading, no lines | same values, `present:true` | B-REG-2 — **empty is valid, not corrupt**; no notice, no refusal |
| `WINDOW-START: abc` / `-2` / empty | counts toward `A`, contributes **no** origin | B-REG-4, split §5.4 leg 3 |
| a prefix line in prose, in `## Recommendation`, or inside a fence | not in the span, or not admitted by `scanLines` ⇒ counts for nothing | B-REG-5, BR-8 |
| a second `## Reset Region` heading | only the **first** is the region; the second's lines are outside the span and count for nothing | catalogue §1's *"the section headed"*, singular |

Two deliberate details. **Counting is by prefix, resolution is by grammar** (BR-9): step 4 counts
without parsing, step 5 parses without counting, so a malformed value answers a halt while
contributing no origin — the invariant split §5.4's counting rule fixes for both ends of the split.
And **`W` is the greatest, not the last**: the two coincide because AC-1.5(4) writes the *resolved*
start so values never descend (split §5.5), and *greatest* is the reading that stays fail-closed if
they ever did.

**`readRegionState({phase, feature, _readFile}) → Promise<RegionState>`** — the async wrapper:

```
path ← `docs/${feature}/POSTMORTEM-${phase}-${feature}.md`
text ← await _readFile(path)                    // null for absent OR unreadable
return parseResetRegion(text)                   // null ⇒ "" ⇒ the empty reading (RS-4)
```

That last line is B-REG-6 in one step: **a present-but-unreadable post-mortem reads as an empty
region** — `H = A = 0`, `W = 1`, nothing honoured at the gate, the narrowest window. The
*entry*'s continuation on that same file is §6.4's, and it is a different decision made by a
different seam (`_statFile`), which is exactly why the two are separate (§5.2).

### 6.3 `resolveClearance` — the gate, and the unwired conjunct

**`resolveClearance({phase, feature, region, D, _readFile, _writeFile, _probePostmortem, _validateRegion}) → Promise<number>`** — returns the origin `W` to use for this entry.

```
1. if region.H === 0 or region.A >= region.H         → return region.W        (B-CLR-4)
2. pm ← await resolvePostmortem({phase, feature, …}) // shipped, fail-closed (M-7a)
   if pm.status !== "resolved"                       → return region.W        (B-CLR-5*)
3. // THE THIRD CONJUNCT — X-06. See "the interim composition" below.
4. kind ← gateBranch(region.lastHaltReason, D, region.W)                      (§6.3.1)
5. line ← kind === "resume" ? `WINDOW-RESUMED: ${region.W}`
                            : `WINDOW-START: ${Math.max(D, region.W)}`
6. await appendAnsweringLine(path, region, line, {_readFile, _writeFile})
   // confirmed by CONTENT: re-read, re-parse, assert `line` is present in the
   // region span AND A increased by exactly 1.  On failure → refuse (§7.2,
   // which = "answering line").  NOTHING IS DISPATCHED BEFORE THIS RETURNS.
7. return kind === "resume" ? region.W : Math.max(D, region.W)
```

`*` Step 2 never *causes* B-CLR-5's refusal — that is step G's, which already ran and threw
(§2.6). Step 2 exists because `phaseGate` reaches this code only on `"none"` or `"resolved"`, and
`"none"` (no post-mortem at all) must grant nothing. It is written as an explicit conjunct rather
than assumed, so a future reordering of `phaseGate` cannot silently open the gate.

**Step 6's ordering is normative** (B-CLR-6, split §5.5): the answering line is durably present
**before any round of the entry is dispatched**. Structurally guaranteed here because
`resolveClearance` is called from `phaseGate`, which returns *before* `reviewLoop` is constructed.

#### 6.3.1 `gateBranch(lastHaltReason, D, W)` — pure, total, three-valued

| `lastHaltReason` begins | and | → | Line written |
|---|---|---|---|
| `no-revision:` | `max(D, W) ≤ windowEnd(W)` | `"resume"` | `WINDOW-RESUMED: {W}` (B-CLR-2) |
| `no-revision:` | `max(D, W) > windowEnd(W)` | `"grant"` | `WINDOW-START: {max(D,W)}` (B-CLR-2a) |
| `fixed-point:` or `budget-exhausted:` | — | `"grant"` | `WINDOW-START: {max(D,W)}` (B-CLR-1) |
| anything else, `null`, unparseable | — | `"grant"` | fail-closed (B-CLR-3) |

Reading the **leading** reason is exact: S-11 never co-occurs with S-3/S-4, so a `; `-joined value
never begins `no-revision:` (`pdlc-rcv-fixed-point-stop` AC-2.2). The `no-revision:` rows are
**unreachable at this ship** — no path emits S-11 — and are implemented anyway so the successor
inherits a decided rule (FSPEC §6.1).

#### 6.3.2 The interim composition, and the two observables that falsify it

Step 3 is, verbatim, one call to a **named total predicate**:

```js
/**
 * The third conjunct of AC-1.5(4)'s clearance gate.
 *
 * X-06: the *region validates* decision procedure is `REQ-RCV-07` AC-7.1's and
 * does not exist yet, so at this ship this conjunct is TRUE ON EVERY INPUT and
 * the `_validateRegion` seam is NEVER CALLED. Row 18 replaces this body with the
 * seam call and the S-16 emission; the seam's contract (§5.4) does not change.
 */
function validationConjunct(/* region, basenames, _validateRegion */) {
  return { valid: true };
}
```

Two observables make *"deliberately not consulted"* falsifiable rather than vacuous, which is the
whole of what O-12 owes at this ship (FSPEC §5.4, B-REG-7):

1. **The consultation-site enumeration is empty**, asserted **structurally over the source** —
   the count of call expressions on `_validateRegion` in `orchestrate-dev.js` is **0**. Decidable
   while no callable exists, and carried by the same `lib/` scanner §8 introduces (one scanner,
   two enumerations), not by a runtime call count.
2. **Same-branch equivalence, positively asserted** (FSPEC §5.4 conjunct 1). This is the conjunct
   that fails on an **ad-hoc inline** interim procedure, which observable 1 alone would not catch.
   Its fixtures and the equivalence relation are PROPERTIES' (O-10); what this TSPEC guarantees is
   that the code has **no** shape-inspecting branch between step 2 and step 4 — steps 1, 2 and 4
   read `H`, `A`, the marker status and one line prefix, and nothing else.

The **0-call contract leg** (split §5.4) is asserted against `_validateRegion` on leg 1's fixture:
the seam is injected as a counting double, and the count must be `0`. It is a **contract** leg —
row 18 replaces it, and it must not be deleted.

### 6.4 `maintainRegionOnHalt` — the halt path

Called from `reviewLoop`'s `iteration > endIndex` branch (`:1960`), replacing the block that today
dispatches the post-mortem agent and confirms with `_checkFile`. Scope is **document-typed phases
only**: `roundDocType === null` (Phase CR) skips the whole of §6.4 and keeps the shipped path
byte-for-byte, which is B-HALT-8 and N-7.

```
maintainRegionOnHalt({phase, feature, haltReasons, roundsRun, seams}) →
  path ← `docs/${feature}/POSTMORTEM-${phase}-${feature}.md`

  1. DISCRIMINATE — creating vs existing, by FILE PRESENCE ONLY (§5.2)
       stat ← await _statFile(path)
       creating ← stat.exists === false          // `unevaluable` ⇒ EXISTING (safe rule)

  2. AUTHOR (creating only)                                             (B-HALT-1, B-PMT-*)
       if creating: dispatch the shipped post-mortem prompt via _agent, then the
         shipped `_checkFile` confirmation, unchanged in kind (M-7e).
         The prompt gains O-9's clause (FSPEC §9's text, not re-authored here) and
         its Iterations item is dropped — clause 3 owns that heading now (B-PMT-3).
       if !creating: NO DISPATCH AT ALL                                       (B-HALT-2)

  3. CLAUSE 3 — the Iterations section                                        (§6.5)
       text ← await _readFile(path)
       if text == null:  → REFUSE, which = "iterations section", NO WRITE ATTEMPTED
                            (B-HALT-4a: heading-absent and file-unreadable are
                             different observations; only the first admits an
                             insert position, so the WHOLE FILE is byte-unchanged)
       next ← applyIterationsSection(text, renderIterationsHeading(BUDGET, roundsRun))
       await _writeFile(path, next)
       back ← await _readFile(path)
       CONFIRM: locateIterationsHeading(back).text === renderIterationsHeading(...)
                (an EQUALITY read-back, never the write's return code — BR-11)
       on failure → REFUSE, which = "iterations section"                      (B-HALT-4)

  4. CLAUSES 1 AND 2 — ONE update of ONE file                          (§4.3, split §5.8)
       text2 ← await _readFile(path)
       upd   ← applyHaltUpdate(text2, haltReasonValue(haltReasons))
       await _writeFile(path, upd.text)
       back2 ← await _readFile(path)
       CONFIRM, both conjuncts against back2:
         (a) parseResetRegion(back2).lines includes upd.haltLine, and H increased by 1
         (b) NO unfenced `RESOLVED:` line remains anywhere in back2
       on failure → REFUSE, which = "halt line"                               (B-HALT-5)

  5. return { regionRecorded: true, haltLine: upd.haltLine }
```

**The order is 3 → 1 → 2 and the write count is two, not three.** Clause 2 has no failure
disposition of its own because it is not a separate write: its confirmation is (b) above and its
failure is clause 1's failure. Why it must be one update — a separately losable strip leaves a
readable marker beside an incremented `H`, which §6.3's gate reads as an unconsumed clearance,
re-granting a window on every later halt while the fault lasts — is split §5.8's, not restated.

**Confirmation (a) is presence-in-the-region, not existence-of-file.** On a re-halt the file always
exists, so an existence-shaped check passes whether or not the line landed, and that is the path
that matters (AC-1.4 clause 1). This is also why `_checkFile` is *not* reused here: its contract
(`:361`) is exactly the existence check that would silently pass.

**Every refusal from step 3 or 4 leaves both counts unmoved and strips nothing** — step 3's
refusal ends the entry before clause 1 runs, so the region is byte-unchanged; step 4's refusal
means the single update did not land, so nothing was appended and nothing was stripped. `A ≤ H` is
preserved on both, and no `RESOLVED:` marker is ever stripped against a halt that left no line
(BR-12). The accepted two-clearance costs of a *creating* halt refusing at either write are
FSPEC E-14 and E-14b, and no code compensates for them.

### 6.5 The Iterations section — render, anchor, replacement, insertion

Three pure functions, all total.

**`renderIterationsHeading(budget, roundsRun) → string`** — the declared render, in one place:

```js
`## Iterations (budget ${budget}, rounds run ${roundsRun})`
```

Two decimal integers ≥ 0. `budget` is **always** the constant, never a literal (AC-1.3, B-RPT-3).
This is the **whole heading line** — not a heading plus a body line — so the oracle over it is an
equality with a single target (B-RPT-1).

**`locateIterationsHeading(text) → {index, text}|null`** — the **first** top-level heading whose
title begins `Iterations`, case-sensitively, outside any fenced block. Built on `topLevelSections`
(`:1393`), so it inherits the shipped fence-scoping and adds no second heading walker. A **second**
such heading is left byte-unchanged (FSPEC §12(e), accepted).

**`applyIterationsSection(text, rendered) → string`** — total in both directions:

| Input | Result | Branch |
|---|---|---|
| a located heading | its **whole line** is replaced by `rendered`; every other byte unchanged | B-RPT-2 |
| no located heading, `## Reset Region` present | `rendered` inserted as a new line **immediately above** the `## Reset Region` heading | B-HALT-3 |
| no located heading, no region | `rendered` appended at the **end of the file** | B-HALT-3 |

Region parsing is unaffected either way: the insert lands *above* the region heading, so the span
`heading → next top-level heading | EOF` is unchanged, and an end-of-file insert follows a region
that has already been closed by EOF.

**Threading `{k}` (O-14).** `roundsRun` is a counter local to `reviewLoop`, incremented once per
loop pass **at the reviewer dispatch site** (immediately after the `_parallel` call at `:2058`),
so it counts rounds this entry **dispatched**, whatever came back (OQ-01's stated default). It is
`0` on a zero-round halt on both the creating and the re-halt path, it is carried on `LoopResult`
(§4.5), and it is passed to `maintainRegionOnHalt`. It is **not** `iterations`, which stays the
budget (M-1c).

### 6.6 The three reporting changes in `reviewLoop` / `checkConverged` / `buildFinalReport`

1. **The empty verdict list.** `lastResults` (`:2004`–`:2007`) is built unconditionally from
   `result1`/`result2`, which are `undefined` on a zero-round entry, so `parseVerdict` fabricates
   two *Needs revision* rows for reviewers this entry never ran. It becomes
   `roundsRun === 0 ? [] : [ …as today… ]` (B-RPT-5, AC-1.3's fourth quantity). `checkConverged`
   already guards on `lastResults.length > 0` (`:1777`), so an empty list yields an empty
   `reviewerDetail` with no further change.

2. **The S-4 render and row C.** The halt branch composes
   `budget-exhausted: rounds ${origin}..${endIndex} of ${MAX_REVIEW_ROUNDS}` — catalogue S-2's
   grammar, **rendered from the window and the constant**, never the literal `rounds 1..3 of 3`
   (B-WIN-2). When `roundsRun === 0` it pushes **row C** (§4.4) onto `reviewRows`, with `round` =
   `startIndex` and the four middle cells `""`. The same string is the `HALT-REASON:` value
   (`haltReasonValue`), so the operator reads the identical bytes in both places (B-HALT-7).

3. **`reviewRows` on the report.** `buildFinalReport` (`:5281`) gains `reviewRows = []` beside
   `notices = []`, carried on **every** report — present as a readable value on success too, for
   the reason the shipped comment at `:5300`–`:5302` gives about the four halt-disposition fields:
   a conditionally-spread field cannot express *"no rows"*.

The **shipped Iterations literal** at `:1965` is removed from the post-mortem prompt in the same
edit as step 2 of §6.4: the loop owns that heading now, so leaving the item in the prompt would ask
an agent to write a string the loop immediately overwrites (B-PMT-3).

## 7. Error handling

Every failure scenario, its detection, and its exact disposition. **The direction is uniform:
toward the narrower window, never toward a free one** (BR-10).

### 7.1 The failure matrix

| # | Scenario | Detected by | Disposition | Branch |
|---|---|---|---|---|
| **F-1** | no post-mortem for the phase | `_readFile` → `null` | empty reading: `H=A=0`, `W=1`; window opens at 1 | B-REG-1 |
| **F-2** | post-mortem present, no `## Reset Region` | `parseResetRegion` step 2 | as F-1, `present:false` | B-REG-1 |
| **F-3** | region present, no lines | step 4 finds none | as F-1, `present:true`; **no notice, no refusal — empty is valid** | B-REG-2 |
| **F-4** | post-mortem present but **unreadable** | `_readFile` → `null` **at the gate**; `_statFile` → `{exists:true}` **at the entry** | gate: empty reading, nothing honoured. Entry: *existing* path, **no authoring dispatch**, clause 3 attempts **no write**, phase refusal, **whole file** byte-unchanged | B-REG-6, B-HALT-4a |
| **F-5** | `_statFile` cannot be evaluated (EACCES, EIO) | `{unevaluable:true}` | treated as **existing** — the safe rule (FSPEC §7.4). Costs at most one refused entry the operator re-runs; the opposite error erases a live region | B-HALT-2 |
| **F-6** | malformed `WINDOW-START:` value | step 5's grammar test fails | counts toward `A`, contributes no origin; `W` falls back to the greatest well-formed value, else **1**. **No `NaN` ever reaches `windowEnd` or `Math.max`** (RS-2) | B-REG-4 |
| **F-7** | last `HALT-REASON:` unparseable or absent-valued | `gateBranch`'s default arm | treated as a convergence halt — the clearance is **consumed**, a window the operator can re-grant. Never a free window | B-CLR-3 |
| **F-8** | answering-line write unconfirmed | §6.3 step 6's content read-back | **phase refusal**, `which = "answering line"`; no window, **zero dispatches**, both counts unmoved, `notice` empty | B-CLR-7 |
| **F-9** | clause-3 write unconfirmed | §6.4 step 3's equality read-back | **phase refusal**, `which = "iterations section"`; region byte-unchanged, no halt recorded, nothing stripped | B-HALT-4 |
| **F-10** | clause 1-and-2 update unconfirmed | §6.4 step 4's two conjuncts | **phase refusal**, `which = "halt line"`; nothing stripped, this entry's Iterations render present, counts unmoved | B-HALT-5 |
| **F-11** | `RESOLVED:` absent / `no` / unparseable / duplicated | `parseResolvedMarker` (shipped, M-7a) | the **shipped step-G refusal**, unchanged; **no row B of any variant** is emitted | B-CLR-5 |
| **F-12** | directory listing unreadable | `refreshReviewState`'s `{ok:false}` | the shipped halt, unchanged — decided before any origin is relevant | §2.5 |
| **F-13** | post-mortem **authoring agent** fails or writes nothing | shipped `postmortemFailed` / `_checkFile` (`:1985`–`:2000`) | shipped warning and `postmortemWritten:false`, unchanged. Clause 3 then finds no readable file and refuses (F-4's shape) | — |
| **F-14** | region **hand-edited** so the counts lie | nothing, at this ship | **accepted, time-boxed**: operator-caused, operator-visible, **no wider than HEAD's**, where the fail-open is unconditional. Closed at target state by the third conjunct | B-REG-7, E-13 |
| **F-15** | a **torn** (partially landed) region or answering line | not analysed here | `REQ-RCV-07` AC-7.5's (**T-N-1**). Correct and known by construction | — |
| **F-16** | queue-row commit refused (hook, identity, index lock) | shipped | the shipped `halted (uncommitted)` outcome, unchanged; the halt is never downgraded | E-11 |

### 7.2 The phase refusal, as one code shape

F-8, F-9 and F-10 produce the **same** shape, which is step G's (§2.6) with a different text:

```
recordPhase(phaseId, label, "❌", `Refused — ${which} unconfirmed at ${path}`);
reviewRows.push({ round, panelShape:"", blocking:"", growthBytes:"",
                  classification:"", notice: "" });          // row B, §4.4
throw haltError(`Phase ${phaseId} refused: ${which} unconfirmed at ${path}. …`);
       //  ^ NO second argument — the error carries NO `postmortemStatus` field
```

Four properties, each load-bearing and each falsifiable:

1. **The ❌ text is catalogue §4's, character for character**, with `{which}` one of §5.5's three
   literals and `{path}` the post-mortem's repo-root-relative path. The three texts are
   **pairwise distinct** and are the *only* discriminator between the three sources — the `notice`
   cell is empty on all three (B-RPT-6, AT-RPT-06).
2. **`notice` is empty, so no S-16 and no eighteenth catalogue id.** An IO fault of the loop is not
   a state of the region (BR-16). `REGION_CORRUPT_REASONS` (§5.5) is emitted by nothing here.
3. **`postmortemStatus` resolves to `"written"`**, not by assertion but by mechanism: the throw
   attaches no fields, so by `M-8g` the chain falls through to `main`'s branch 3 existence probe
   (`:4890`–`:4901`), which finds the file the refusal is *about* — it exists by the path's
   premise. Never `none` (which would print `No POSTMORTEM was written.` beside a ❌ row naming the
   post-mortem, M-8c), never `unresolved`.
4. **The invocation terminates on the shipped path** — the ❌ row is recorded *before* the throw,
   `main`'s single catch (`:4861`, M-8a) runs, and the feature's `docs/_queue/QUEUE.md` row is
   written `halted` (M-7b). *A refusal is not a halt*: the `RESOLVED:` marker is left in place,
   both counts are unmoved, and the rest of the entry does not run.

**Where the refusal is raised from.** F-8 is raised inside `phaseGate`, which already owns
`recordPhase` and step G's shape, so it throws directly. F-9 and F-10 are raised inside
`reviewLoop`, which has **no** `recordPhase`; `maintainRegionOnHalt` therefore returns
`{refusal: {which, path, round}}`, `reviewLoop` carries it on `LoopResult` (§4.5), and
`checkConverged` gains a branch — placed **above** its `halted === true` branch (`:1770`) and
shaped like it — that records the ❌ row and throws. This keeps `recordPhase` ownership exactly
where the module already puts it and adds no second reporting path.

**Suppression of the shipped generic queue-reset line is NOT this feature's.** `M-8d`'s unguarded
`emit` at `:4927` fires on every halt class reaching the catch, and the seam that suppresses it for
a refusal is `REQ-RCV-07` **O-6** (catalogue §4's Recovery-text row; the dangling *"budget-stop
O-6"* citation is corrected at split §6). This feature **leaves it firing** and states so, rather
than building a suppression seam one notch too wide — `REQ-RCV-07` R-14 records the regression that
would be.

### 7.3 What is deliberately not defended against

| # | Not defended | Why |
|---|---|---|
| **ND-1** | A `_statFile` that answers **`absent` for a present file** | out of scope per FSPEC §7.2. `defaultStatFile` answers `absent` on exactly one errno; a lying syscall is not a failure mode this feature can observe |
| **ND-2** | A **torn** write | `REQ-RCV-07` AC-7.5 (T-N-1) |
| **ND-3** | An agent that edits the region despite O-9's clause | the region is the **loop's** guarantee: clause 1 rebuilds it from `RegionState.lines` and clause 3 overwrites the heading, so every guarantee holds whether or not the agent complies. O-9 is belt-and-braces (B-PMT-*, FSPEC §9.1) |
| **ND-4** | A second `Iterations`-prefixed heading below the located one | left byte-unchanged; making the render unique would delete content this feature does not own (FSPEC §12(e)) |
| **ND-5** | The window surviving Phase H's post-mortem deletion | `NB-5` — a post-harvest re-entry reads the default of a document that never halted |

## 8. O-13 — the budget-width blast radius

AC-1.2 states the outcome — *exactly one hand-maintained declaration in executable code states the
budget's value, repo-wide, production and test alike* — and routes both halves of *how* to this
document. O-13(a) is §8.1, O-13(b) is §8.2, and the machine that makes the enumeration decidable
is §8.3.

### 8.1 (a) How test code obtains the effective budget

**The constant is exported.** `orchestrate-dev.js:52` becomes:

```js
export const MAX_REVIEW_ROUNDS = 3;
```

Feasible without any change to the distribution mechanism, for the reason C-3 records:
`stripModuleSyntax` (`build-runtime.mjs:51`) rewrites `^export const ` to `const `, so the bundle
sees exactly today's declaration. The bundle's `wrapModule` export list (`:87`–`:94`) is **not**
extended — the runtime never needs the value, only the tests do, and adding it would put a symbol
in the runtime's public surface for no consumer.

Test code then `import`s it from the ES module, as every other test in the suite already imports
`deriveRoundWindow`, `isComplete` and the rest. The two hand-maintained duplicates die:

| Site | Today | After |
|---|---|---|
| `__tests__/pacingWrapper.test.js:77` | `const MAX_REVIEW_ROUNDS = 5;` | removed; the import is used at `:1458` and `:1501` unchanged |
| `__tests__/roundDerivation.test.js:61` | `const EXPECTED_WINDOW_WIDTH = 5;` | `const EXPECTED_WINDOW_WIDTH = MAX_REVIEW_ROUNDS;` — the alias stays, so `:300`, `:316` and `:558` are untouched, but it now **reads** the declaration |

**Why not keep two and assert they agree.** A cross-check test is a third hand-maintained site
that can itself be forgotten, and the failure it guards against is silent in exactly the way AC-1.2
names: a duplicate not updated in the same commit leaves a **green** suite asserting the old width
while the pipeline runs the new one — the defect moved one line up, into the oracle.

**Why not `process.env` or a config file.** C-2: neither exists in the workflow runtime.

Two shipped assertions must be re-expressed rather than deleted, and both keep their ids:

- `roundDerivation.test.js:57`'s comment states *"the constant is deliberately **not** exported"*.
  That statement is now false and is replaced by one naming O-13(a) and the reason.
- `roundDerivation.test.js:389` pins the exact key set of `deriveRoundWindow`'s return; it grows
  by `derivedStart` and `origin` (§4.2).

### 8.2 (b) The closed enumeration of width-encoding sites

Every textual occurrence of the width, classified into AC-1.2's five classes. The list is
**checked in** as `pdlc/workflows/lib/budget-width-sites.json` and is the artifact §8.3 compares
against a repo scan. Enumerated at `9486c81`; a PLAN task re-runs the scan at implementation time
and reconciles any drift **before** the width changes.

| Class | Sites | Disposition |
|---|---|---|
| **the declaration** | `pdlc/workflows/orchestrate-dev.js:52` | becomes `export const MAX_REVIEW_ROUNDS = 3;` (§8.1). **Exactly one** |
| **read from it** | `orchestrate-dev.js:1799` (phase record), `:1965` (post-mortem prompt — this occurrence is **deleted**, §6.6), `:2011` (`iterations`), `:2493` (`windowEnd`); `pacingWrapper.test.js:1458`, `:1501`; `roundDerivation.test.js:61`, `:300`, `:316`, `:558` | already read the identifier, or are re-expressed over the import in §8.1. No literal |
| **generated copy** | every occurrence in `pdlc/workflows/dist/orchestrate-dev.bundle.js` and `dist/orchestrate-queue.bundle.js`; the untracked consumer copies under `.claude/workflows/` | rebuilt in the same commit (**O-11**); CI's *Generated artifacts are in sync* job makes it non-optional. Outside the count, **inside** the enumeration |
| **prose** | `CLAUDE.md:78`–`:84` (*Review loop mechanics*, `MAX_REVIEW_ROUNDS = 5`); `README.md:38`; `docs/_constraints/pdlc-rcv-baseline.md` §3's row (already states **3**) | updated **in the same commit** (split §5.7). Historical documents under `docs/completed/`, `docs/discarded/` and this family's own review files are **records of what was true then** and are deliberately **not** updated — they are enumerated under this class with `frozen: true` |
| **pinned non-budget literal** | `orchestrate-dev.js:25` — `const DOD_MAX_ITERATIONS = 3;`; the acceptance-test **titles** at `reviewLoop.test.js:139` and `:477` (*"all 5 iterations"*, *"exactly 5 iterations"*) and any fixture literal a re-expression would make circular | each **stays a literal and says so at its site**, in a one-line comment naming this class and the reason. `DOD_MAX_ITERATIONS` is the B-BUD-3 case: after this ship both values are `3`, so only the enumeration — never a round count — distinguishes *reads its own declaration* from *wrongly reads `BUDGET`* |

**B-BUD-3's second leg is a runtime one, and it needs the export.** AT-BUD-03b varies `BUDGET`
away from Phase DOD's value and asserts Phase DOD's admitted count is unchanged, then varies
`DOD_MAX_ITERATIONS` and asserts it moves. `runDodPhase` already takes `maxIterations` as a
parameter defaulting to `DOD_MAX_ITERATIONS` (`:3833`), so the second leg is injectable today; the
first needs the width reachable from test code, which §8.1 supplies.

### 8.3 The machine that compares the enumeration against a repo scan

A new pure module, `pdlc/workflows/lib/budget-sites.mjs`, in exactly the shape
`lib/document-oracles.mjs` established — **a pure function of a `root` directory path, no
`process.cwd()`, no ambient state**, so tests, the release checklist and any future CLI can probe
two roots in the same process.

```js
/**
 * @param {string} root
 * @returns {Array<{path: string, line: number, text: string, violation: string}>}
 */
export function budgetWidthViolations(root)
```

**What it scans.** Walking the tree under `root`, skipping `.git/` and `node_modules/` (the same
walk `coveredViolations` uses — and the same caveat applies: an untracked local file can fail this
oracle for reasons unrelated to the diff, which `CLAUDE.md` already warns about):

1. every occurrence of the identifier `MAX_REVIEW_ROUNDS` in any tracked file;
2. in `*.js` / `*.mjs` only, every **numeric literal initialiser of a module-scope `const` whose
   name matches** `/ROUND|WINDOW.?WIDTH|BUDGET|ITERATIONS?/i` — this is what catches a *second*
   hand-maintained declaration under a different name, which is the violation a grep for
   `MAX_REVIEW_ROUNDS` cannot see;
3. every occurrence of the **rendered** width in a prose file declared under the `prose` class
   whose `frozen` flag is false.

**What it reports as a violation.** Three, and only three:

| Violation | Meaning |
|---|---|
| `unenumerated-site` | a scan hit absent from `budget-width-sites.json` — **the case a human-read checklist structurally cannot detect** |
| `second-declaration` | a second scan hit classified as *the declaration*, or a rule-2 hit not classified as *pinned non-budget literal* |
| `stale-prose` | a non-frozen `prose` site whose file no longer states the effective width |

An enumerated site that has **moved** (same file, different line) is reconciled by the PLAN task,
not by the oracle — line numbers in the JSON are informational and the match is on `path` +
`text`, so ordinary edits above a site do not red the suite.

**Why in `lib/` and not in the module.** It is a repo scanner, never loaded by the runtime, and it
needs `fs` — which does not exist there (C-2). `document-oracles.mjs` is the standing precedent
and `__tests__/documentOracles.test.js` the standing test shape.

**One scanner, two enumerations.** §6.3.2's *consultation-site enumeration is empty* observable is
the same kind of question over the same tree, so `budget-sites.mjs` also exports
`validatorConsultationSites(root)` — the count of call expressions on `_validateRegion` in
`pdlc/workflows/orchestrate-dev.js`, asserted **0** at this ship and replaced (not deleted) when
row 18 wires the conjunct. A second scanner module for one predicate would be a second thing to
keep in sync.

**Not a CI job of its own.** It runs as an ordinary jest test (`__tests__/budgetSites.test.js`)
inside the existing *Unit tests* matrix, so it gates the PR on both platforms without adding a
sixth required check.

## 9. Test strategy

**PROPERTIES owns the properties, the fixtures, the generation axes and the falsification ledger**
(O-10). What this section owns is the *testability design*: which level each obligation is tested
at, which test doubles exist, and which seams make each assertion possible at all. A finding that
this section states no fixture is correct — §1.2.

### 9.1 The four levels

| Level | Subject | Doubles | New suite |
|---|---|---|---|
| **L1 — pure** | `parseResetRegion`, `resolveOrigin`, `gateBranch`, `applyHaltUpdate`, `applyIterationsSection`, `renderIterationsHeading`, `locateIterationsHeading` | **none** — string in, value out | `__tests__/resetRegion.test.js` |
| **L2 — window** | `deriveRoundWindow` with an origin, `windowEnd`, `phaseWindow`'s arithmetic | listing arrays | extends `__tests__/roundDerivation.test.js` |
| **L3 — composition** | `readRegionState`, `resolveClearance`, `maintainRegionOnHalt` | seam doubles (§9.2) | `__tests__/resetRegionIO.test.js` |
| **L4 — pipeline** | one whole entry: gate → window → dispatch-or-halt → report | the existing `main()` harness | extends `__tests__/pacingWrapper.test.js` / `haltAndQueue.test.js` |

L1 carries the great majority of the logic and needs no double at all, which is the compensation
§3.1 promised for not having a `lib/` module: the read and write models are pure by construction,
so *"the parser is untestable inside a 5 000-line module"* is false.

### 9.2 Test doubles

| Double | Stands in for | Shape |
|---|---|---|
| **in-memory file map** | `_readFile` / `_writeFile` / `_statFile` | `Map<path, string>`; `_statFile` answers from key presence. The **one** double all three IO seams share, so a write is observable by a subsequent read exactly as in production |
| **fault-injecting file map** | the same, with a per-path fault mode | `{mode: "unreadable"}` → `_readFile` returns `null`, `_statFile` returns `{exists:true}` (F-4); `{mode: "unevaluable"}` → `_statFile` returns `{unevaluable:true}` (F-5); `{mode: "write-noop"}` → `_writeFile` returns `"ok"` and changes nothing (F-8/F-9/F-10). **This is what makes the two confirmations falsifiable**: without a write that lies, an equality read-back always passes |
| **dispatch counter** | `_agent`, `_parallel` | counts reviewer dispatches and authoring dispatches **separately**, because *0 authoring dispatches* (B-HALT-2) and *0 reviewer dispatches* (B-WIN-2) are different assertions on the same entry |
| **validator counter** | `_validateRegion` | a function that increments and throws if called; the 0-call contract leg asserts the count is `0` (§6.3.2) |

**Every "no round ran" assertion carries a positive conjunct**, never absence alone: a dispatch
count of `0` **alongside** the absence of any new cross-review file, because a double that writes
no file satisfies the absence check either way. This is `REQ-RCV-07` O-10's rule and it applies
identically here.

### 9.3 What each obligation is tested by

| Obligation | Level | The assertion that makes it falsifiable |
|---|---|---|
| **O-5** | L1 + L3 | `applyHaltUpdate` byte-equality against a checked-in golden (FSPEC §12(f): the expected file is **authored**, never derived in-test by re-applying the transform, which would re-implement production in the oracle); plus the three fault modes above |
| **O-12** | L3 | the validator counter at `0`; `validatorConsultationSites(root) === 0`; the same-branch equivalence family (PROPERTIES') |
| **O-13** | L1 (`lib/`) | `budgetWidthViolations(root)` over a **fixture root** carrying a deliberately unenumerated site, asserted to report `unenumerated-site` — the oracle must be shown red before it is trusted, never asserted only on the clean repo (DC-03) |
| **O-14** | L1 + L4 | equality on the whole heading line, on all three fixtures (creating, re-halt with `k > 0`, no-heading); `roundsRun` threaded end to end at L4 |
| **AC-1.2 / AC-1.3** | all | every budget assertion is written **over the imported constant**, never the literal `3`. Where a test quotes a rendered string containing `3`, it composes the string from the constant |

### 9.4 The assertions that are load-bearing under DC-03

Each of these is the **only** signal of its defect, so each passes the falsification cycle —
mutation named in writing first, red ids recorded, revert re-verified green — and the record lands
in `FALSIFICATION-LEDGER.md` (whose lifecycle line is **O-15's**, PLAN's):

| # | Assertion | Named mutation that must red it |
|---|---|---|
| 1 | the validator 0-call count | wire `validationConjunct` to call `_validateRegion` |
| 2 | budget and `iterations` over the constant | change the declaration to 4 without touching a test |
| 3 | one clearance grants exactly one window | delete clause 2's strip from `applyHaltUpdate` |
| 4 | row C's zero-dispatch conjunct | admit `startIndex` unconditionally, ignoring `endIndex` |
| 5 | the Iterations equality | emit `## Iterations (budget 3)` — one integer |
| 6 | the re-halt byte comparison | re-author on the existing path |
| 7 | the two unconfirmed-write refusals | drop the read-back and trust `_writeFile`'s `"ok"` |
| 8 | the three ❌ texts pairwise distinct | collapse `{which}` to a single generic literal |
| 9 | O-11's freshness gate | mutate the built artifact and observe the check red — **not** by running it on an already-fresh tree |

### 9.5 Suite-level obligations of the change itself

- **`RLH-LOOP-03` stays green.** `MAX_REVIEW_ROUNDS - 1` must still occur exactly once in
  `orchestrate-dev.js` after `windowEnd` is re-pointed (§6.1).
- **`build-runtime.mjs --check` and `sync-workflows.sh --check`** are run in the same commit; the
  three artifacts under `pdlc/workflows/dist/` are rebuilt (O-11).
- **`runtimeBundle.test.js`** must still pass with the new `export const`: `stripModuleSyntax`
  removes the prefix (C-3), so the bundle gains no `export` statement.
- **The macOS/Linux matrix** is unaffected — no shell script changes.

### 9.6 Not discharged here

`REQ-RCV-01` **O-10** in full — the enumerated points, the four kept legs, the three added legs
and the property-based obligation over generated line sequences — is **PROPERTIES'**, stated at
split §5.4 and read from there rather than re-derived. **O-15**, the lifecycle disposition of
`FALSIFICATION-LEDGER.md` (harvest deletes `CROSS-REVIEW-*`, `CODE_REVIEW-*` and `POSTMORTEM-*`
but **not** this file), is **PLAN's** per DC-10.

## 10. Traceability

### 10.1 REQ criterion → FSPEC branch → component

| REQ criterion | FSPEC branches | Owning symbol(s) | §|
|---|---|---|---|
| **AC-1.1** — budget of three, per document, absolute; typed vs untyped scope | B-BUD-1…3, B-WIN-1, B-WIN-4, B-WIN-5 | `MAX_REVIEW_ROUNDS`, `windowEnd`, `phaseWindow`, `deriveRoundWindow` | §6.1, §8.1 |
| **AC-1.2** — one constant, one budget | B-BUD-4, B-BUD-5 | the exported declaration; `budgetWidthViolations` | §8 |
| **AC-1.3** — reported quantities named; empty verdict list | B-RPT-1, B-RPT-2, B-RPT-3, B-RPT-5, B-HALT-3 | `renderIterationsHeading`, `applyIterationsSection`, `locateIterationsHeading`, `LoopResult.roundsRun` | §6.5, §6.6 |
| **AC-1.4** — halt unchanged in kind; region maintained; no re-author; file-presence discriminator | B-HALT-1…9, B-HALT-4a, B-PMT-3 | `maintainRegionOnHalt`, `applyHaltUpdate`, `_statFile` | §5.2, §6.4 |
| **AC-1.5(1)** — window end; zero-round halt; row C; `forcePhases` | B-WIN-2, B-WIN-6, B-WIN-7, B-RPT-4 | `reviewLoop`'s `iteration > endIndex` branch; `reviewRows` | §2.3, §4.4, §6.6 |
| **AC-1.5(2)** — start unchanged; origin wins | B-WIN-3 | `phaseWindow`'s `Math.max(D, W)` | §6.1 |
| **AC-1.5(3)** — the one operator reset | B-CLR-4, B-CLR-5 | `resolveClearance` steps 1–2; shipped step G | §6.3 |
| **AC-1.5(4)** — anchored and consumed; counts; named predicate; ordering | B-REG-1…7, B-CLR-1, B-CLR-3, B-CLR-6, B-CLR-7 | `parseResetRegion`, `resolveClearance`, `validationConjunct`, `_validateRegion` | §6.2, §6.3 |
| **AC-1.5(5)** — which halt it was; S-11 resumes; row B | B-CLR-2, B-CLR-2a, B-HALT-7, B-RPT-6 | `gateBranch`, `haltReasonValue`, §7.2's refusal shape | §6.3.1, §6.6, §7.2 |

### 10.2 FSPEC acceptance test → the seam that makes it possible

Only the rows where a seam choice is what makes the test writable at all; the rest follow from
§9.1's levels.

| AT | Depends on |
|---|---|
| **AT-BUD-03b** | the exported constant (§8.1) — otherwise `BUDGET` cannot be varied from test code |
| **AT-BUD-05** | `budgetWidthViolations(root)` over a fixture root (§8.3) |
| **AT-REG-06** | `_statFile` answering `{exists:true}` while `_readFile` answers `null` (§9.2's fault map) — the pair that realises *present but unreadable* |
| **AT-CLR-06** | the answering line being written from `phaseGate`, before `reviewLoop` is constructed (§6.3) |
| **AT-CLR-07 / AT-HALT-04 / AT-HALT-05** | the `write-noop` fault mode (§9.2); without a write that lies, no confirmation can fail |
| **AT-HALT-02** | the separate authoring-dispatch counter (§9.2) plus a checked-in golden (§9.3) |
| **AT-RPT-04 / AT-RPT-06 / AT-RPT-07** | `reviewRows` on the final report (§4.4) — row B and row C need a schema'd carrier, and AT-RPT-07 asserts its **absence** |
| **AT-PMT-01/02** | the post-mortem prompt composed in `reviewLoop` (`:1962`–`:1967`), asserted as a string, as `skillFiles.test.js` already asserts prompt literals |

### 10.3 Files touched

| Path | Change | Kind |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | the declaration, the two model clusters, `phaseWindow`, `resolveClearance`, `maintainRegionOnHalt`, `reviewLoop`, `checkConverged`, `buildFinalReport`, `defaultStatFile` | modified |
| `pdlc/workflows/runtime-adapter.js` | `rtStatFile`, wired into the seam bundle beside `rtCheckFile` | modified |
| `pdlc/workflows/lib/budget-sites.mjs` | `budgetWidthViolations`, `validatorConsultationSites` | **new** |
| `pdlc/workflows/lib/budget-width-sites.json` | the classified enumeration (§8.2) | **new** |
| `pdlc/workflows/__tests__/resetRegion.test.js`, `resetRegionIO.test.js`, `budgetSites.test.js` | L1/L3 suites | **new** |
| `pdlc/workflows/__tests__/{roundDerivation,reviewLoop,pacingWrapper,haltAndQueue}.test.js` | width re-expression, key-set growth, new pipeline legs | modified |
| `pdlc/workflows/dist/*` | rebuilt (**O-11**) | **generated — never hand-edited** |
| `CLAUDE.md`, `README.md` | the prose width sites (§8.2) | modified, same commit |

`docs/_constraints/*` and every `pdlc/skills/*/SKILL.md` are **untouched**: O-9's clause lands in
the workflow's inline post-mortem prompt (`:1962`–`:1967`, M-7e), not in a SKILL file, because that
prompt is composed by the loop and has no SKILL of its own.

## 11. Obligation disposition, decisions and the stopping rule

### 11.1 Obligations

| Obligation | Owner | Disposition here |
|---|---|---|
| **O-5** | TSPEC | **Discharged.** §6.4's clause order, the one-update rule (§4.3, §5.3), both content confirmations, and §7's fail-closed refusals |
| **O-9** | FSPEC → implementation | **Attached, not authored.** The clause's text is FSPEC §9's; §6.4 step 2 fixes where it lands (`orchestrate-dev.js:1962`–`:1967`) and §7.3 ND-3 states why it is belt-and-braces |
| **O-10** | PROPERTIES | **Not discharged.** §9 fixes the levels, the doubles and the DC-03 routing; the legs, fixtures, generation axes and the ledger's contents are PROPERTIES', stated at split §5.4 |
| **O-11** | implementation | **Placed.** §2.1, §9.5 — the rebuild is in the same commit and its freshness gate is falsified by mutation (§9.4 row 9) |
| **O-12** | TSPEC | **Discharged, by adoption.** The seam's contract is `REQ-RCV-07` O-12's and is restated nowhere; §6.1 fixes how `W` reaches the window arithmetic, §5.4 the declared-unwired seam, §6.3.2 the interim's two observables |
| **O-13** | TSPEC | **Discharged.** §8.1 (the export), §8.2 (the five-class enumeration), §8.3 (the machine) |
| **O-14** | FSPEC → implementation | **Implementation half discharged.** §6.5's render, anchor, replacement and insertion; §6.5's `roundsRun` threading; §6.6's empty verdict list and no-re-author path |
| **O-15** | PLAN | **Not discharged.** Named in §9.6 so the lifecycle line is not invented downstream |

### 11.2 The decisions worth recording

Four load-bearing alternatives were weighed and rejected. Each is a decision a future agent will
otherwise confidently reconsider, so each belongs in `DECISIONS-pdlc-rcv-budget-stop.md`:

| # | Decision | Rejected alternative, and why |
|---|---|---|
| **D-1** | The region parser and writer live **inside `orchestrate-dev.js`** as pure module-scope functions | A `pdlc/workflows/lib/reset-region.mjs` module — the shape `document-oracles.mjs` established and the one a reader will propose. **Not viable**: `build-runtime.mjs` inlines three named sources and `import` does not exist in the runtime, so the pipeline would throw on first call (§3.1) |
| **D-2** | A **new `_statFile` seam** discriminates creating from existing | Reusing `_readFile` (conflates absent with unreadable ⇒ re-authors over a live region) or `_checkFile` (same conflation under `reason:"file_missing"`). The choice is forced by FSPEC §7.4's safe rule, which needs a third answer, `unevaluable` (§5.2) |
| **D-3** | Clauses 1 and 2 are **one read-modify-whole-file-write**, confirmed by two content conjuncts | Two ordered writes with `_appendFile` — cheaper, and the shape `appendApprovalAnchors` already uses. Rejected: a separately losable strip leaves a readable marker beside an incremented `H`, which the gate reads as an unconsumed clearance and re-grants on every later halt while the fault lasts (split §5.8) |
| **D-4** | The width is made reachable by **exporting the constant**; row-B/row-C rows ride on a **new `reviewRows` report field** | Keeping two hand-maintained copies with a cross-check test (a third site that can itself be forgotten; the failure is a green suite asserting the old width). And carrying rows in `notices` or a phase-row `detail` string — rejected because existing oracles pin `detail` verbatim and catalogue §3 needs a schema two later features extend (§4.4, §8.1) |

**Reversibility.** D-1 is **hard to reverse** — it is a consequence of the distribution mechanism,
and reversing it means adding a fourth inlined source with its own manifest row, freshness gate and
sync semantics. D-2, D-3 and D-4 are each **easy** — local to one function or one field.
**Re-evaluation trigger for D-1:** the day `build-runtime.mjs` gains a general module-inlining
step, at which point the pure clusters move to `lib/` unchanged.

### 11.3 Interfaces this TSPEC leaves open on purpose

| Left open | Closed by |
|---|---|
| `_validateRegion`'s **implementation** (never its contract) | `REQ-RCV-07` AC-7.1 / O-12 at queue row 18 |
| `panelShape`, `blocking` cell population | `pdlc-rcv-fixed-point-stop` |
| `growthBytes`, `classification` cell population | `pdlc-rcv-panel-topology` |
| Suppression of `M-8d`'s generic queue-reset line on a refusal | `REQ-RCV-07` **O-6** — deliberately **not** built here (§7.2), because a seam one notch too wide silences the recovery line on every halt class that reaches the catch |

None of these is a stub. Each is a **named successor surface** with a queue row behind it (DC-08),
and at this ship each behaves exactly as HEAD does.

### 11.4 The stopping rule for this document's own review loop

Inherited from `REQ-RCV-01` §9 and `FSPEC` §13.4, restated because this document is reviewed by
the loop it changes and this feature's Phase R has already exhausted one window:

- a round whose blocking findings are **all** oracle-design, fixture-construction or
  property-coverage defects — none contesting the module map, the seam contracts, the algorithms'
  behaviour on a named input, or the failure dispositions — means the TSPEC has met its bar:
  approve it and route the findings to §11.1's owners;
- a finding of the form *"this component has no property / no fixture / no generation axis"* is
  closable by **deferring** it to PROPERTIES or PLAN; §1.4 and §11.1 exist to receive it;
- a TSPEC does not specify fixture construction, coverage floors, property-generation axis tables
  or the falsification ledger's contents. A finding that it omits one is evidence it is at its
  layer, not of a gap;
- two consecutive rounds with a non-decreasing blocking count is a **fixed point**, not slow
  convergence — and a round in which the document grows while the count does not fall is stronger
  evidence of the same.
