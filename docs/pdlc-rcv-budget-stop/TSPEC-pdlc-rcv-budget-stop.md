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

## 9. Test strategy

## 10. Traceability

## 11. Obligation disposition
