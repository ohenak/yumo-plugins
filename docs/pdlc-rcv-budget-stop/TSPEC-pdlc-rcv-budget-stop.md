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
| pdlc | draft | Claude + operator | 1.1 | 2026-08-02 |

**Revision note (v1.1).** Addresses round-1 cross-review (SE F-01…F-11, TE F-01…F-10). The
substantive changes are five. (1) **The clearance gate moved.** It no longer lives inside
`phaseWindow`; `phaseWindow` now returns only the *derived* facts, and the region read, the gate and
the admission arithmetic run in `phaseGate` **after step G and after the skip-on-approval branch**,
so no clearance can be consumed by an entry that then returns `{skip: true}` (§3.3, §6.1, §6.3
— SE F-03). (2) **`origin` is a real parameter, threaded end to end** — `deriveRoundWindow`,
`reviewLoop`, `checkConverged` — and **one** render function, `renderWindow`, produces both the
phase-row window and the `HALT-REASON:` value, so B-HALT-7 holds by construction and the backwards
`rounds 7..5` render on the zero-round halt is gone (§4.2, §4.5, §6.1, §6.6 — SE F-01, F-05).
Its default is **`derivedStart`, not `1`** — v1.0's "reproduces today's value" claim was false at
`1` and is corrected (§6.1 note 3 — TE F-01). (3) **Every consumer of the re-pointed `startIndex`
is enumerated** (§4.2.1), including `tier1ApprovalRecord`'s `candidate = startIndex − 1`, which is
routed to `derivedStart` (SE F-02). (4) **`reviewRows` and `_statFile` have carriers**: `reviewRows`
rides on `LoopResult` and reaches `buildFinalReport` through `main`; `checkConverged` gains a row
sink; `_statFile` is threaded through `main` → `wrapperSeams` → `reviewLoop` (§4.5, §5.2, §5.6,
§6.6, §7.2 — TE F-03, F-04). (5) **The test-side dispositions are honest**: §9.5 gains a sub-table
of shipped assertions whose semantics invert or whose value moves, §9.2 gains a `lying-write`
transform-hook fault mode so each conjunct of a two-conjunct confirmation can fail alone, §8.2 gains
a sixth site class for identifier mentions in source comments, §8.3 gains a fourth scan rule and a
site-granularity `stale-prose` predicate, and §9.1/§9.3/§9.4 gain the missing `defaultStatFile`
level and four ledger rows (TE F-01, F-02, F-05, F-06, F-07, F-09; SE F-08). Every line citation is
re-baselined to **`8801109`** (§2.7 — SE F-09, F-10; TE F-10), and the remaining Minor findings
(SE F-04, F-11; TE F-08) are fixed in place. Nothing in the module map, the seam contracts, the
algorithms' behaviour on a named input or the failure dispositions is reopened.

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
by symbol and line at the citation baseline `8801109`** where this document asserts a fact about
existing code that a reader must be able to check — `REQ-RCV-01` NB-4's `M-*`-only discipline is a
rule for the *REQ*, and §2.7 records why a TSPEC must cite the source it is going to edit.

> **Baseline correction (v1.1, SE F-09).** v1.0 declared `9486c81`. That commit is docs-only and
> predates 691 lines of change to `orchestrate-dev.js`; only `:25` and `:52` resolved against it.
> Every citation in this document was in fact taken against the **working tree**, and the whole
> document is re-baselined to `8801109` — the tip of `feat-pdlc-rcv-budget-stop` at revision time,
> whose `pdlc/` tree is byte-identical to `38c87f1`'s (`git diff 38c87f1 HEAD -- pdlc/` is empty),
> the tree both round-1 reviewers verified against. The citations SE F-09 and F-10 and TE F-10
> found stale **even at HEAD** are corrected at their sites and listed together in §2.7.1.

### 1.3 What this TSPEC owes, by obligation

| Obligation | Owed here | Discharged in |
|---|---|---|
| **O-5** | how AC-1.4's region survives every halt — loop-owned state, the clause order, the one-update rule over clauses 1 and 2, both confirmations, the fail-closed refusal | §5.3, §6.4, §7 |
| **O-12** | how `W` is resolved before the round window is computed; how the *region validates* predicate is supplied to the gate; the interim's **0-consultation** observable. The seam's **contract** is `REQ-RCV-07` O-12's and is **adopted, not restated** | §5.4, §6.2, §6.3 |
| **O-13** | (a) how test code obtains the effective budget; (b) the closed, **six-class** enumeration of width sites (AC-1.2's five plus *documentation occurrence in source*, §8.2) and the machine that compares it against a repo scan | §8 |
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
`8801109` (§2.7.1).

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

`M-1a` … `M-1c`, re-verified at `8801109`: the declaration is `orchestrate-dev.js:52`; the width
arithmetic is written **once**, in `windowEnd` (`:2492`–`:2494`), and
`pdlc/workflows/__tests__/reviewLoop.test.js:964` (`RLH-LOOP-03`) asserts the string
`MAX_REVIEW_ROUNDS - 1` occurs **exactly once** in the module, and (`:979`, `RLH-LOOP-03b`) that
the occurrence lies **outside the source spans of `reviewLoop` and `checkConverged`**. The three
arithmetic-free reads are `checkConverged`'s `recordPhase` argument (`:1799`), the post-mortem
prompt's required-sections literal (`:1965`) and the returned `iterations` field (`:2011`).

**This is a design asset, not an obstacle.** `windowEnd` is the single place the window's *width*
is expressed, so re-pointing it from *"start + width"* to *"origin + width"* changes the window's
meaning repo-wide in one edit and keeps `RLH-LOOP-03` green.

**But `windowEnd` has three call sites, not one** (SE F-05). The re-point is one edit to the
*declaration*; it is **three** decided call sites, each stated here and each carried into §6.1
note 3 and §10.3:

| Site | Call at `8801109` | Argument's meaning after the re-point |
|---|---|---|
| `:2475` | `const endIndex = windowEnd(startIndex);` inside `deriveRoundWindow` | becomes `windowEnd(origin)`, `origin` defaulting to the derived start (§6.1 note 3) |
| `:1850` | `endIndex = windowEnd(startIndex)` — `reviewLoop`'s parameter default | becomes `windowEnd(origin)`, `origin` defaulting to `startIndex` (§4.5) |
| `:1792` | `endIndex === undefined ? windowEnd(first) : endIndex` — `checkConverged` | becomes `windowEnd(origin)`, `origin` defaulting to `startIndex` (§6.6(2)) |

The parameter is **renamed at the declaration** — `function windowEnd(origin)` — so the mismatch is
visible at every call site rather than inferred. All seven production `reviewLoop` and
`checkConverged` call sites pass `endIndex` explicitly (`:4652`, `:4690`, `:4733`, `:4786`, `:4827`,
`:4865`, `:4987` and `:4657`, `:4695`, `:4738`, `:4791`, `:4832`, `:4870`, `:4992`), so the two
default sites are unreached in production and reached only by the suite — which is exactly why
leaving them computing the *relative* window AC-1.1 abolishes would have produced a **green suite
asserting the pre-change semantics**, the same silent-green failure §8.1 rejects the
duplicate-constant design for.

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

- `recordPhase(…, "❌", …)` is called **before** the throw, so `main`'s catch (`:5118`) finds the
  ❌ row;
- the thrown error carries **no** `postmortemStatus` field. `M-8g`: exactly one `haltError` site
  in the module passes a second argument (`checkConverged`, `:1819`–`:1823`), so any refusal built
  in step G's shape falls through to `main`'s branch 3 existence probe (`:5147`–`:5159`) and
  reports `postmortemStatus: "written"` — which is catalogue §4's mandated value for row B.

### 2.7 Why this TSPEC cites lines where the REQ may not

`REQ-RCV-01` NB-4 forbids the **REQ** from asserting anything about `orchestrate-dev.js`'s control
flow that is not a measured fact, because the predecessor's Phase R died litigating exactly such
claims at requirements altitude. A TSPEC is the document that *edits* that control flow: it cannot
state where a block goes without naming the block it goes beside. The discipline this document
adopts instead is **every line citation names its enclosing symbol and the commit** (`8801109`),
so a drifted line number is a mechanical re-baseline rather than a finding — the rule
`docs/_constraints/pdlc-rcv-baseline.md` §2.8 already applies to its own `M-8*` rows.

#### 2.7.1 The v1.0 → v1.1 re-baseline, in full

Corrected at their sites; gathered here so a reader can audit the sweep in one place. Every row was
re-resolved against `8801109` while revising.

| Claim | v1.0 said | Correct at `8801109` |
|---|---|---|
| `main`'s single `try` (M-8a) | `:4373` | **`:4630`** (`:4373` is `_probeReviewState: probeReviewStateFn,` inside `phaseWindow`) |
| `main`'s single `catch` (M-8a) | `:4861` | **`:5118`** |
| branch-3 existence probe | `:4890`–`:4901` | **`:5147`–`:5159`** |
| `M-8d`'s unguarded recovery `emit` | `:4927` | **`:5184`** |
| the module's only two-argument `haltError` (M-8g) | `:1799`–`:1803` | **`:1819`–`:1823`**. The *claim* is correct — verified as the only two-argument site across every `haltError(` call in the module |
| the `detail`-pinned-verbatim comment | `:5300`–`:5302` | **`:5307`–`:5309`** in `buildFinalReport`; the sibling comment on `notices` is **`:4382`–`:4385`** |
| `wrapperSeams` | `:4516`–`:4526` | **`:4520`–`:4530`**. `_writeFile` **is** absent — §5.3's claim verified |
| Phase CR's `docType: null` (M-7f) | `:4985` | **`:4981`**; its `checkConverged` call is `:4992` |
| Phase DOD's injectable iteration cap | `runDodPhase` `:3833` | the symbol is **`dodVerifyLoop`** (`:3831`); `maxIterations = DOD_MAX_ITERATIONS` is its second destructured parameter at **`:3833`** (SE F-10) |
| `phaseGate` | `:4403` | **`:4406`**; `phaseWindow` is **`:4367`–`:4377`** |
| `scanLines` (M-7d) | `:569` | **`:721`** (`:569` is inside `parseVerdict`) |
| "a second heading walker would be a second oracle" | `:2527` | **`:2521`–`:2522`** |
| the confirm-don't-trust comment and its `_checkFile` | `:1994`–`:1996` / `:1998` / `:1994`–`:2000` | **`:1984`–`:1986`** (comment), **`:1989`** (`_checkFile`), **`:1984`–`:1991`** (the shape) |
| the reviewer dispatch site `roundsRun` increments after | `:2058` | the `_parallel` call is **`:2053`–`:2056`**; `:2058` is the response assignment |
| the post-mortem prompt (M-7e) | `:1962`–`:1967` | **`:1962`–`:1968`** |
| `rtWriteFile` | `runtime-adapter.js:994` | **`runtime-adapter.js:802`**; `rtCheckFile` is `:817`, as cited |
| `MAX_REVIEW_ROUNDS` in `CLAUDE.md` | `:78`–`:84` | **`:78` only** (TE F-10). `README.md:38` carries the width as the **prose phrase** *"max 5 iterations"*, not the identifier — which is the form §8.3 rule 3 must match at that site |
| `deriveRoundWindow`'s internal `endIndex` | `:2475` | **`:2475`**, as cited; `windowEnd` is `:2492`–`:2494` |

Citations not listed here were re-resolved and are correct as written, including `:25`, `:52`,
`:361`/`:377`–`:379`, `:525`, `:1385`–`:1393`, `:1756`/`:1765`/`:1770`/`:1777`/`:1791`–`:1793`/`:1799`,
`:1841`, `:1960`, `:1965`, `:2004`–`:2007`, `:2011`, `:2252`, `:2406`, `:2428`, `:2485`, `:2493`,
`:2556`, `:2656`, `:2738`, `:2778`, `:2837`, `:2852`, `:2948`, `:4219`, `:4235`, `:4297`, `:4318`,
`:4386`, `:4415`, `:4419`–`:4423`, `:4480`, `:4493`–`:4506`, `:5281`, and
`build-runtime.mjs:48`/`:51`/`:83`–`:85`/`:87`–`:94`.

## 3. Architecture — module map, placement and data flow

### 3.1 Where the new code lives, and the alternative that was rejected

**Everything the pipeline executes lives in `pdlc/workflows/orchestrate-dev.js`** (C-1). The new
symbols form three clusters, each a contiguous block with its own section banner in the module's
existing style:

| Cluster | New symbols | Placed | Character |
|---|---|---|---|
| **Region read model** | `RESET_REGION_HEADING`, `HALT_REASON_PREFIX`, `WINDOW_START_PREFIX`, `WINDOW_RESUMED_PREFIX`, `parseResetRegion`, `resolveOrigin` | immediately **above** `checkPostmortem` (`:2738`), beside the other post-mortem readers | **pure**, synchronous, total, no seam |
| **Region write model** | `renderIterationsHeading`, `applyIterationsSection`, `applyHaltUpdate`, `locateIterationsHeading` | immediately **below** the read model | **pure** string→string transforms; the IO is the caller's |
| **Window model** | `renderWindow`, `haltReasonValue`, `admitWindow` | beside `windowEnd` (`:2492`) | **pure**, synchronous, total, no seam |
| **Composition** | `readRegionState`, `resolveClearance`, `maintainRegionOnHalt`, `phaseWindow` (**narrowed**), `phaseGate` (extended — step W), `reviewLoop` (extended), `checkConverged` (extended), `buildFinalReport` (extended) | at their existing sites | `async`, seam-taking |

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
                      │ admitWindow (pure) → WindowState        │
                      │   {origin, derivedStart,                │
                      │    startIndex = max(D,W),               │
                      │    endIndex   = windowEnd(W)}           │
                      │   — evaluated in phaseGate step W       │
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
of the window arithmetic. There is no cycle because `deriveRoundWindow` is called once, **without
an origin**, purely to obtain `derivedStart`; the admission arithmetic is evaluated afterwards by
`admitWindow(D, W)` without re-listing the directory (§6.1).

### 3.3 The two entry points, and what each owns

| Entry | Symbol | Owns |
|---|---|---|
| **Phase entry** | `phaseGate` (`:4406`) | steps 1–4 (shipped), step G (shipped), **then** — as a new **step W**, between step G and the return (`:4508`) — the region read, the clearance gate and the admission arithmetic (§6.1–§6.3) |
| **Derived facts** | `phaseWindow` (`:4367`–`:4377`) | `derivedStart`, `present`, `skipped`, `reviewFiles`. **Nothing else** — it is called at step 2 (`:4415`) and owns no origin, no clearance and no window (§6.1) |
| **Halt** | `reviewLoop`'s `iteration > endIndex` branch (`:1960`) | the authoring decision, clause 3, the clause 1-and-2 update, the two confirmations, the refusal (§6.4) |

**Why the gate is in `phaseGate` and not in `phaseWindow` (SE F-03, v1.1).** v1.0's §3.3 and §6.1
described opposite orderings, and only one of them is admissible. Shipped `phaseGate` calls
`phaseWindow(docType)` as its **step 2** (`:4415`), *before* the approval search (steps 3–4,
`:4419`–`:4487`) and *before* step G (`:4493`). Putting the gate inside `phaseWindow` would
therefore have made it run **first**, with two consequences the document did not name:

1. an entry with a **FRESH** recorded approval would append `WINDOW-START: N`, move `W`, and then
   return `{skip: true}` (`:4480`) having dispatched nothing — the operator's one clearance spent
   on an entry that ran no round;
2. §6.3's footnote-`*` premise (*"step G … already ran and threw"*) would be **false**, so a future
   reader would delete the marker conjunct as redundant when it was in fact load-bearing.

Both are removed by **splitting the gate out of `phaseWindow`**. `phaseWindow` narrows to the
derived facts; `phaseGate` gains **step W** after step G, which reads the region, runs the clearance
gate and evaluates the admission arithmetic. This is the ordering §3.3 always claimed, it makes
step 3's `tier1ApprovalRecord` argument necessarily `window.derivedStart` (resolving SE F-02 for
free, §4.2.1), and it restores §6.3's footnote to a true statement. Its cost is one more moving part
in `phaseGate`, which is accepted and recorded as **D-5** (§11.2).

Nothing else in the pipeline reads or writes the region. `orchestrate-queue.js` is **untouched**:
the queue forwards no `forcePhases` and takes no window state, and the `halted` row it reads is
written by the shipped `_recordHalt` path, unchanged by this feature.

### 3.4 Data flow across one entry, end to end

FSPEC's Behavioral Flow, with the owning symbol against each step:

Ordered as `phaseGate` actually executes them at `8801109` (SE F-03):

| Step | FSPEC | Symbol | Seams used |
|---|---|---|---|
| 0 | loop discrimination | `phaseGate`'s caller — a phase's `docType` argument; Phase CR passes `docType: null` (`:4981`, M-7f) | — |
| 1 | derived facts (`phaseGate` step 2, `:4415`) | `phaseWindow` → `resolveReviewState` → `deriveRoundWindow` | `_listFiles`, `_readFile`, `_probeReviewState` |
| 2 | approval search and staleness (shipped steps 3–4, `:4419`–`:4487`) — **may return `{skip:true}`** | `tier1ApprovalRecord` / `tier2ApprovalRecord`, over `derivedStart` (§4.2.1) | `_readFile`, `_hashFile`, `_probeDoc`, `_probePostmortem` |
| 3 | the post-mortem gate (shipped step G, `:4493`) | `resolvePostmortem` | `_readFile`, `_probePostmortem` |
| 4 | read the region (**step W**, typed phases only) | `readRegionState` | `_readFile` |
| 5 | clearance gate (**step W**) | `resolveClearance` | `_readFile`, `_writeFile` |
| 6 | admission arithmetic (**step W**) | `admitWindow` → `windowEnd` | — (pure) |
| 7a/7b | dispatch or zero-round halt | `reviewLoop` | `_agent`, `_parallel` |
| 8 | halt-path maintenance | `maintainRegionOnHalt` | `_statFile`, `_readFile`, `_writeFile`, `_checkFile` |
| 9 | reporting | `checkConverged`, `buildFinalReport` | — |
| 10 | post-mortem authoring | `reviewLoop`'s halt branch | `_agent` |

**Steps 4–6 are reached only by an entry that will run.** Every skip and every refusal above them
has already returned or thrown, so a clearance is never consumed by an entry that dispatches
nothing (SE F-03 consequence 1; §7.1 F-17 records the state that no longer exists).

**Where a step refuses, the following steps do not run** — structurally, because steps 5 and 8
refuse by `throw`ing a `haltError` after recording their ❌ row (§7.2), and every one of them sits
inside `main`'s single `try` (`:4630`, M-8a), whose single `catch` is `:5118`.

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

### 4.2 `WindowState` — what `phaseGate` step W returns

`deriveRoundWindow`'s shipped return grows two fields and changes the meaning of one. **It is
`phaseGate` step W, not `phaseWindow`, that produces the value below** (§3.3): `phaseWindow` returns
`{ok, derivedStart, present, skipped, reviewFiles}` and no window at all.

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

### 4.2.1 Every shipped consumer of `startIndex`, and which quantity each one wants

`startIndex`'s meaning changes from `max(present) + 1` to `max(derivedStart, origin)`, so **every**
reader of the old quantity is a potential silent defect. This is the closed enumeration SE F-02
asked for; each row states the quantity that site actually wants and what it gets after the change.
The rule that makes most rows no-ops: **`deriveRoundWindow` called without an origin still returns
`startIndex === derivedStart`** (§6.1 note 3), so every consumer that reads a *derived* state — not
`phaseGate`'s admitted window — is correct by construction.

| # | Consumer | Site at `8801109` | Quantity it wants | Change |
|---|---|---|---|---|
| 1 | `refreshReviewState`'s tier-1 read set — `const candidate = window.startIndex - 1` | `:2688` | **`derivedStart`** — the highest existing round of this doc type | **none.** `window` here is `deriveRoundWindow`'s own origin-less return, so `startIndex === derivedStart` |
| 2 | `refreshReviewState`'s returned `startIndex` / `endIndex` | `:2710`–`:2711` | **`derivedStart`** and its relative end | **none**, same reason; `phaseWindow` renames the field to `derivedStart` at its own boundary |
| 3 | `rehydrateReviewState` (the `_probeReviewState` arm) | `:2820` | **`derivedStart`** | **none** — it mirrors row 2's shape, and §6.1 step 1 keeps the probe-aware call (SE F-06) |
| 4 | `selectMode` via `dispatchAndVerify` — the revision-round selector | `:3106`, `:3119` | **`derivedStart`** — the round the author is revising | **none**; it takes a *fresh* `resolveReviewState`, not `phaseGate`'s window |
| 5 | `phaseGate` step 3 → `tier1ApprovalRecord`'s `const candidate = startIndex - 1` | `:4421` → `:2948` | **`derivedStart`** | **the fix.** Under §3.3's step-W ordering the admitted window does not exist yet at step 3, so the argument is necessarily `window.derivedStart`. Had it stayed `window.startIndex`, an entry with `W > D` (`D = 4`, `W = 6`) would search round `5` — a round with no cross-review file by the definition of `D` — set `tier1Empty`, fall through to tier 2 (`:2980`+), and never consult the recorded tier-1 approval at round 3 |
| 6 | the seven `reviewLoop` `iteration` / `startIndex` arguments | `:4650`–`:4651`, `:4688`–`:4689`, `:4731`–`:4732`, `:4784`–`:4785`, `:4825`–`:4826`, `:4863`–`:4864`, `:4985`–`:4986` | **`startIndex` = `max(D, W)`** — where the loop opens | **none in form**; the value is the admitted one, which is the point |
| 7 | the seven `checkConverged` `startIndex` arguments | `:4657`, `:4695`, `:4738`, `:4791`, `:4832`, `:4870`, `:4992` | **`origin`** for the render, `startIndex` for nothing else | each call gains `{origin, reviewRows}` as an eighth argument (§6.6(2)); the render reads `origin`, never `startIndex` |
| 8 | `reviewLoop`'s loop-top guard `if (iteration > endIndex)` | `:1960` | **`startIndex`** vs **`endIndex`** | **none** — this is the shipped zero-round halt (§2.3) |
| 9 | `checkConverged`'s `const first = startIndex === undefined ? 1 : startIndex` | `:1791` | **`origin`** | **replaced** by the origin (SE F-01). Without this, the zero-round halt renders `rounds ${max(D,W)}..${W+B−1}` — a **backwards** range such as `rounds 7..5` — beside a `HALT-REASON:` reading `rounds 3..5`, and B-HALT-7's *identical bytes in both places* fails |
| 10 | `reviewLoop`'s `endIndex = windowEnd(startIndex)` default | `:1850` | **`origin`** | `windowEnd(origin)`, `origin = startIndex` (§2.4) |
| 11 | `deriveRoundWindow`'s `endIndex = windowEnd(startIndex)` | `:2475` | **`origin`** | `windowEnd(origin)`, `origin` defaulting to `derivedStart` (§6.1 note 3) |

Rows 1–4 are the sweep of `main` and the module that SE F-02 asked to be recorded: **no further
reader of the re-pointed quantity exists.** The enumeration was produced by
`grep -n '\.startIndex\|startIndex:' pdlc/workflows/orchestrate-dev.js` at `8801109` and every hit
is classified above; §10.3 carries rows 5, 7, 9, 10 and 11 as edits.

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

**The exclusivity rule on the one entry that reaches both branches** (TE Q-03). A *creating*
zero-round halt enters `maintainRegionOnHalt` and can refuse at clause 3 (F-9) or clause 4 (F-10)
— the same entry that would otherwise emit row C. The rule, stated so AT-RPT-07's absence assertion
is unambiguous: **row C is pushed only on the path that returns a `LoopResult` with
`refusal === null`.** Concretely, `reviewLoop` composes row C *after* `maintainRegionOnHalt`
returns, and returns early with `{refusal}` and `reviewRows: [] ` when it refuses; `checkConverged`
then pushes **row B** and throws. So such an entry emits **row B only**, which is what AT-REG-06
expects, and no entry ever carries two rows. The `roundsRun === 0` predicate is therefore necessary
but not sufficient for row C; the sufficient condition is `roundsRun === 0 && refusal === null`.

**Who owns the array** (TE F-03). `main` owns `const reviewRows = []` beside `const notices = []`
(`:4386`). `reviewLoop` accumulates its own rows on `LoopResult.reviewRows` (§4.5) and
`checkConverged` receives a **row sink** so both the loop's rows and its own row B reach `main`'s
array; `phaseGate` (a closure of `main`, `:4406`) pushes directly. `buildFinalReport` (`:5281`)
receives the array as a **defaulted** parameter `reviewRows = []` (SE Q-02), so every existing
caller and every existing report-shape oracle stays green while the field is present on **every**
report — which is what makes AT-RPT-07's *absence* assertion falsifiable rather than vacuously
true against a missing carrier.

### 4.5 `LoopResult` — the four fields `reviewLoop` gains, and the two parameters

```js
 // existing: {converged, iterations, lastResults, postmortemWritten, postmortemPath, trailerReason}
 // existing: {converged, iterations, halted, haltDetail, trailerReason, …}
 /** @property {number} roundsRun  - rounds THIS entry dispatched; 0 on a zero-round halt (O-14) */
 /** @property {{which: string, path: string, round: number}|null} refusal - §7.2's phase refusal */
 /** @property {number} origin     - W, echoed back so ONE render serves both sites (§6.6(2)) [NEW v1.1] */
 /** @property {ReviewRow[]} reviewRows - rows this entry produced; `[]` always present [NEW v1.1] */
```

**`reviewLoop`'s parameter list grows too** — v1.0 stated the fields and forgot the inputs
(SE F-01, TE F-03, TE F-04). At `:1841`–`:1865` it destructures `iteration`, `startIndex`,
`endIndex` and the seams; it gains, in the same destructuring:

| Parameter | Default | Why |
|---|---|---|
| `origin` | `startIndex` | the window's origin. The default reproduces today's value for Phase CR and for every existing suite that constructs `reviewLoop` from `iteration` alone (`reviewLoop.test.js`'s `baseParams`), and it re-points `:1850`'s `endIndex = windowEnd(origin)` (§2.4) |
| `_writeFile` | `defaultWriteFile` | §5.3 — the region writes |
| `_statFile` | `defaultStatFile` | §5.2 — the creating/existing discriminator. Threaded through `main` (`:4297`ff) and `wrapperSeams` (`:4520`) so **AT-REG-06 and AT-HALT-02 are writable at L4**, which is the level their FSPEC rows demand (TE F-04) |

**Deriving the origin inside `reviewLoop` is forbidden**, and this is not a stylistic preference:
`endIndex − MAX_REVIEW_ROUNDS + 1` re-expresses the width inside the loop, which is exactly the
recomputation `RLH-LOOP-03b` (`reviewLoop.test.js:979`) exists to red — that test asserts the single
occurrence of `MAX_REVIEW_ROUNDS - 1` lies *outside the source spans of `reviewLoop` and
`checkConverged`*. The origin is threaded, never re-derived.

**`converged` on the refusal path** (SE Q-03). `checkConverged` returns early on
`loopResult.converged !== false` (`:1765`), so a refusal that left `converged` unset would never
reach the new branch. `reviewLoop` therefore returns `{converged: false, refusal: {…}, roundsRun,
origin, reviewRows: []}` on a refusal, exactly as the shipped halt branch returns `converged:
false` (`:2010`). `halted` stays **unset** on that path, so the refusal branch — placed *above*
`:1770`'s `halted === true` branch — is the one that fires (§7.2).

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
| `_checkFile(path) → Promise<{ok:true}\|{ok:false, reason:"file_missing"\|"file_empty"}>` | `checkFileNonEmpty`'s shipped contract (`:361`); swallows every throw into `{ok:false}` | the shipped post-mortem write confirmation (`:1989`), unchanged |
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

**Threading, stated (TE F-04).** `_statFile` is added, symmetrically with `_writeFile` (§5.3), to
**three** parameter lists: `main`'s (`:4297`ff, as `_statFile: statFileFn = defaultStatFile`),
`wrapperSeams` (`:4520`–`:4530`), and `reviewLoop`'s destructuring (`:1841`–`:1865`). Without the
`main`-side thread there is no path from the `main()` harness to `maintainRegionOnHalt`, and
**AT-REG-06** (*"phase entered and run to its end — the row asserts the whole entry, not the read
alone"*) and **AT-HALT-02** could only be written at L3, a weaker proof than their FSPEC rows
demand. §10.3 carries the thread so the PLAN derives a task for it.

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
`defaultWriteFile` at `:4219`; the adapter's `rtWriteFile` at `runtime-adapter.js:802`), but is
**not** in `wrapperSeams` (`:4520`–`:4530`, verified — the list is `_agent`, `_readFile`,
`_hashFile`, `_listFiles`, `_appendFile`, `_probeDoc`, `_probeReviewState`, `_log`, `_git`), so
`reviewLoop` cannot write today. It is added to `wrapperSeams` and to `reviewLoop`'s parameter list.

**Its return value is never trusted.** Every write this feature performs is followed by a
**content read-back** (BR-11) — the adapter's `rtWriteFile` answers `"ok"` when it *believes* it
wrote, and the shipped comment at `:1984`–`:1986` records that this belief has been wrong. The
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

| Seam | Default | New? | Threaded through | Consumers |
|---|---|---|---|---|
| `_readFile` | `defaultReadFile` | no | already on `main`, `wrapperSeams`, `reviewLoop` | `readRegionState`, both confirmations |
| `_writeFile` | `defaultWriteFile` | threaded further | `main` `:4318` ✔ → **`wrapperSeams` (add)** → **`reviewLoop` (add)** | `resolveClearance`, `maintainRegionOnHalt` |
| `_statFile` | `defaultStatFile` | **yes** | **`main` (add)** → **`wrapperSeams` (add)** → **`reviewLoop` (add)** | `maintainRegionOnHalt`'s creating/existing discriminator |
| `_checkFile` | `checkFileNonEmpty` | no | already on `main` and passed per-call at `:4989`-shaped sites | shipped post-mortem write confirmation (`:1989`) |
| `_listFiles` | `defaultListFiles` | no | already | `refreshReviewState` |
| `_probeReviewState` | `NO_PROBE` (`null`) | no | already on `main` and `wrapperSeams` (`:4527`) | `resolveReviewState` (`:2837`) → `phaseWindow` (`:4373`). **§6.1 step 1 keeps this call, not `refreshReviewState`** (SE F-06) |
| `_probePostmortem` | `NO_PROBE` (`null`) | no | already on `main` (`probePostmortemFn`), in `phaseGate`'s closure | `resolvePostmortem` at step 4 (`:4472`) and at step G (`:4497`). **Step W consumes step G's already-resolved `gate.status` rather than re-probing** (§6.3 step 2) |
| `_agent` | `agent` | no | already | post-mortem authoring |
| `_validateRegion` | `NO_VALIDATOR` (`null`) | **yes, unwired** | not threaded — no consumer at this ship | nothing at this ship (§6.3) |

`_probePostmortem` was missing from v1.0's table (SE F-07). It matters twice over: it is what
`resolveClearance`'s step 2 reads *through* (as a threaded value, see §6.3), and it is the
`NO_PROBE` precedent (`:2778`) §5.4 cites for `NO_VALIDATOR` — leaving it off weakened the analogy
the section rests on. This table is what a PLAN reads to decide what `wrapperSeams` must carry and
what every test double must supply, so it is now complete: **nine** seams, three of them edited.

Per C-4, **every one of these is `await`ed at every call site**, including `_statFile`, whose Node
default is synchronous — the adapter's is not, and the module may not depend on which it got.

## 6. Algorithms

Every algorithm below is stated as: signature, the ordered steps, and its behaviour on **every**
input class. Purity is stated explicitly because §3.1's read/write model clusters are the
compensation for not having a `lib/` module.

**Cite-and-reuse, stated once.** Three cross-cutting obligations here are already solved in this
module and are **reused, not reinvented**: fence-scoped line scanning is `scanLines` (`:721`,
M-7d) — the same helper `approvalAnchorPreCount` and `parseResolvedMarker` use, so a
`HALT-REASON:` quoted inside a fenced block is invisible for the same reason a quoted anchor is;
top-level section location is `topLevelSections` (`:1393`), which is itself built on `scanLines`,
so this feature adds **no second heading walker** (the module's own comment at `:2521`–`:2522`
states why a second one would be a second oracle); and the confirm-don't-trust write discipline is
the shipped post-mortem shape at `:1984`–`:1991`, generalised from existence to content.

**How `scanLines` composes with a section body (SE F-11).** The two do not compose by accident and
the composition is worth stating, because an implementer reading §6.2 alone cannot derive it.
`topLevelSections` returns `body` as a **raw `string[]`**, fences included — deliberately, per its
own comment at `:1385`–`:1391` — whereas `scanLines(text, visit)` takes a whole text string and
tracks fence state from its first line. The region's lines are therefore scanned as
**`scanLines(spanLines.join("\n"), …)`**, and this is sound because `topLevelSections` locates
headings *through* `scanLines`: a heading inside an open fence is not a section at all, so fence
state is always **closed** at the first line of any section body, and re-scanning that body starts
from the same state production does. The obvious alternative — scanning the whole file and
filtering by index range — is a different and more fragile shape and is not used.

### 6.1 `phaseWindow` and `phaseGate` step W — resolving `D`, then `W`, then the window

Two symbols, in the order `phaseGate` executes them (§3.3). v1.0 collapsed both into `phaseWindow`
and contradicted §3.3; v1.1 splits them, which is what makes the gate provably run **after** step G
and **after** the skip-on-approval branch (SE F-03).

**(i) `phaseWindow(docType)` — narrowed to the derived facts.** Extends the shipped closure at
`:4367`–`:4377`, called from `phaseGate` step 2 (`:4415`) and directly by Phase CR (`:4977`).

```
phaseWindow(docType) →
  1. state ← await resolveReviewState({feature, docType,
                                       _listFiles, _readFile, _probeReviewState})
        // the SHIPPED call at :4368–:4374, unchanged. NOT `refreshReviewState`:
        // `resolveReviewState` (:2837) consults `_probeReviewState` first and falls
        // back to `refreshReviewState` (:2848) only when the probe does not answer,
        // so calling the latter directly would silently delete a shipped seam from
        // the phase-entry path (SE F-06).
        // `{ok:false}` still throws `haltError(state.message)` at :4375 (§2.5)
  2. return { ok: true, derivedStart: state.startIndex,
              present: state.present, skipped: state.skipped,
              reviewFiles: state.reviewFiles, message: state.message }
```

**On the narrowing (SE Q-01).** The field list *is* exhaustive and the return *is* narrowed:
`startIndex` and `endIndex` are deliberately **absent**, so a reader that still wants a window gets
a `TypeError`-shaped `undefined` at the arithmetic rather than a plausible wrong number. The
readers were swept (§4.2.1): the only ones are `phaseGate` step 3 — which now reads
`window.derivedStart` — and Phase CR (below). `message` is carried because `resolveReviewState`
returns it on the `{ok:false}` arm; `reviewFiles` because `phaseGate` step 3 reads it.

**(ii) `phaseGate` step W — inserted between step G (`:4493`–`:4506`) and the return (`:4508`).**

```
step W(phaseId, docType, window, gate) →
  D ← window.derivedStart
  if docType === null:                                            // Phase CR, B-BUD-2
      return admitWindow({ derivedStart: D, origin: D })           // the SHIPPED relative window
  region ← await readRegionState({phase: phaseId, feature, _readFile})        (§6.2)
  W      ← await resolveClearance({phase: phaseId, feature, region, D,
                                   postmortemStatus: gate.status, …})         (§6.3)
  return admitWindow({ derivedStart: D, origin: W })

admitWindow({derivedStart, origin = derivedStart}) →              // PURE, total, no seam
  { ok: true, origin, derivedStart,
    startIndex: Math.max(derivedStart, origin),
    endIndex:   windowEnd(origin) }
```

`phaseGate` then returns `{skip: false, window: {...phaseWindow's fields, ...step W's fields},
forced}`, so every downstream reader of `window.startIndex` / `window.endIndex` (§4.2.1 rows 6–7)
is unchanged in form.

Five things are load-bearing about this ordering:

1. **`D` is resolved before the gate** because the gate *consumes* it — B-CLR-2/B-CLR-2a branch on
   `D ≤ E`, and the granting value is `N = max(D, W)` (FSPEC §4.4).
2. **The gate runs after every skip and every refusal.** Steps 3–4 can return `{skip: true}`
   (`:4480`) and step G can throw (`:4502`); both happen **above** step W, so no clearance is ever
   consumed by an entry that dispatches nothing. This is the state SE F-03 asked to be either
   dispositioned or removed — it is **removed**, which is why §7.1 gains F-17 recording it as
   unreachable rather than accepted.
3. **The admission arithmetic is evaluated once, after the gate**, against the origin the gate left
   behind. There is no cycle and no re-listing: `deriveRoundWindow` is called exactly once per
   entry, as it is today.
4. **`windowEnd` is re-pointed at the origin, not the start**, and its parameter is **renamed**
   (`function windowEnd(origin)`) so the change is visible at all three call sites (§2.4). Its body
   is unchanged — `return origin + MAX_REVIEW_ROUNDS - 1;` — so `RLH-LOOP-03`'s *"occurs exactly
   once"* and `RLH-LOOP-03b`'s *"outside `reviewLoop` and `checkConverged`"* both stay green.

   **`deriveRoundWindow`'s origin defaults to `derivedStart`, not to `1`** (TE F-01, TE Q-01).
   v1.0 said *"`origin` defaulting to `1` … reproduces today's value on every caller that passes no
   origin"*, and that was **false**: it reproduces today's value only where `derivedStart === 1`;
   for every other listing `windowEnd(1) ≠ windowEnd(derivedStart)`. The corrected signature is

   ```js
   deriveRoundWindow(basenames, docType, { origin } = {})
   //   origin ??= derivedStart   →  endIndex = windowEnd(origin)
   //                                startIndex = Math.max(derivedStart, origin)
   ```

   so an **origin-less call remains a supported contract** and means, precisely, *"no reset is in
   effect for this listing"* — the shipped relative window. That is the reading three shipped
   consumers already depend on (§4.2.1 rows 1–4: `refreshReviewState`'s `candidate =
   window.startIndex - 1` at `:2688`, its passthrough at `:2710`–`:2711`, `rehydrateReviewState` at
   `:2820`, and `selectMode` at `:3106`), and defaulting to `1` would have silently broken all four.
   The residual risk — a *typed* caller that forgets the origin silently gets the relative window —
   is bounded by there being exactly one production caller (`phaseGate` step W, which always passes
   one) and is pinned by an L2 leg asserting the default equals `derivedStart` (§9.5).

5. **`startIndex > endIndex` is returned, not thrown.** It is the zero-round window (B-WIN-2), and
   `reviewLoop`'s shipped guard consumes it (§2.3).

**Phase CR and Phase DOD take none of the region machinery.** Phase CR calls `phaseWindow(null)`
(`:4977`) and `reviewLoop` with `docType: null` (`:4981`, M-7f). Its origin is **`derivedStart`**,
not `1` (TE Q-02): AC-1.1's budget is absolute only where *"the phase names a document type"*, and
B-BUD-2 requires *exactly `BUDGET` rounds run in the invocation* on the untyped path — which is the
shipped **relative** window, and which `origin = derivedStart` reproduces exactly. Were the origin
`1`, a Phase CR re-entry with existing `…-REVIEW-v{N}` files would zero-round-halt and contradict
AT-BUD-02. No region is read or written on that path: the region read and the clearance gate are
**skipped when `docType` is `null`**, which is the one discriminator (B-BUD-1/B-BUD-2). Phase DOD
does not call `reviewLoop` at all and reads `DOD_MAX_ITERATIONS` (`:25`), a separate declaration
(B-BUD-3, §8.2).

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
5. W ← resolveOrigin(lines)                                                     (RS-2, RS-3)
6. return { present:true, H, A, W, lastHaltReason, lines }
```

**`resolveOrigin(lines) → number`** — pure, synchronous, **total over every array**, including
`[]` and over `null` / `undefined` (coerced to `[]`). TE F-08 correctly observed that v1.0 named
this as an L1 test subject (§3.1, §9.1) while specifying it nowhere; it is step 5 extracted, and it
is kept as a named function rather than inlined because §9.4's RS-3 ledger row needs a symbol to
mutate:

| Input class | Result |
|---|---|
| no `WINDOW-START:` line at all | **`1`** — total over the empty set, where a bare `Math.max(...values)` would yield `-Infinity` (RS-3) |
| every `WINDOW-START:` value malformed (`abc`, `-2`, `""`, `3.5`, `007x`) | **`1`** — no well-formed value contributes an origin (RS-2, B-REG-4) |
| one or more well-formed values | the **greatest** of them; each value must match `/^[0-9]+$/` and parse to an integer `≥ 1` |

Its return is a **decimal integer ≥ 1**, never `NaN`, never a string — which is RS-2, and which is
what guarantees no `NaN` reaches `windowEnd` or `Math.max` (§7.1 F-6).

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

**`resolveClearance({phase, feature, region, D, postmortemStatus, _readFile, _writeFile, _validateRegion}) → Promise<number>`** — returns the origin `W` to use for this entry.

```
1. if region.H === 0 or region.A >= region.H         → return region.W        (B-CLR-4)
2. if postmortemStatus !== "resolved"                → return region.W        (B-CLR-5*)
3. // THE THIRD CONJUNCT — X-06. See "the interim composition" below.
4. kind ← gateBranch(region.lastHaltReason, D, region.W)                      (§6.3.1)
5. line ← kind === "resume" ? `WINDOW-RESUMED: ${region.W}`
                            : `WINDOW-START: ${Math.max(D, region.W)}`
6. await appendAnsweringLine(path, region, line, {_readFile, _writeFile})
   // confirmed by CONTENT: re-read, re-parse, and assert BOTH conjuncts
   //   (a) `line` is present in the region span of the re-read text
   //   (b) A increased by EXACTLY 1  (A_after === region.A + 1)
   // Each conjunct has a fault mode that fails it ALONE (§9.2): (a) alone under
   // `write-noop`; (b) alone under `lying-write` duplicating the appended line.
   // On failure → refuse (§7.2, which = "answering line").
   // NOTHING IS DISPATCHED BEFORE THIS RETURNS.
7. return kind === "resume" ? region.W : Math.max(D, region.W)
```

`*` **Step 2's premise, corrected (SE F-03).** v1.0's footnote said *"that is step G's, which
already ran and threw"* while §6.1 placed the gate **before** step G — the two could not both be
true. Under §3.3's step-W ordering the footnote is now **true as written**: step G (`:4493`–`:4506`)
has run, and an `"unresolved"` post-mortem has already refused the phase there, so
`resolveClearance` is reached only on `"none"` or `"resolved"`. Step 2 is therefore genuinely
**defensive** — `"none"` (no post-mortem at all) must grant nothing, and the conjunct is written
explicitly so a future reordering of `phaseGate` cannot silently open the gate. It must not be
deleted as redundant.

**And the marker is threaded, not re-probed.** v1.0 had `resolveClearance` call `resolvePostmortem`
itself, which under the corrected ordering would evaluate the same probe **twice per entry** (once
at step G, once here) for a value that cannot have changed in between. Step W passes step G's
already-resolved `gate.status` in as `postmortemStatus`, so there is **one** probe per entry and one
answer. This is why `_probePostmortem` is not in `resolveClearance`'s signature but **is** in §5.6's
table (SE F-07): its consumer is `resolvePostmortem`, called from `phaseGate` steps 4 and G.

**Step 6's ordering is normative** (B-CLR-6, split §5.5): the answering line is durably present
**before any round of the entry is dispatched**. Structurally guaranteed here because
`resolveClearance` is called from `phaseGate` step W, which returns *before* `reviewLoop` is
constructed — and, since step W sits below the skip branch, before any entry that will not
dispatch has been eliminated.

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
       rendered ← renderIterationsHeading(BUDGET, roundsRun)
       next ← applyIterationsSection(text, rendered)
       await _writeFile(path, next)
       back ← await _readFile(path)                 // null when the read-back itself fails
       loc  ← locateIterationsHeading(back)         // TOTAL: null for null, "" or heading-absent
       CONFIRM: loc !== null && loc.text === rendered
                (an EQUALITY read-back, never the write's return code — BR-11)
       on failure → REFUSE, which = "iterations section"                      (B-HALT-4)

  4. CLAUSES 1 AND 2 — ONE update of ONE file                          (§4.3, split §5.8)
       text2 ← await _readFile(path)
       upd   ← applyHaltUpdate(text2, haltReasonValue(haltReasons))
       await _writeFile(path, upd.text)
       back2 ← await _readFile(path)                // null-safe: parseResetRegion is total
       reg2  ← parseResetRegion(back2)              // null ⇒ the empty reading (RS-4)
       CONFIRM, THREE conjuncts against back2, each separately falsifiable (§9.2):
         (a) reg2.lines includes upd.haltLine
         (b) reg2.H === H_before + 1                          — EXACTLY one, not ≥ 1
         (c) NO unfenced `RESOLVED:` line remains anywhere in back2
       on failure → REFUSE, which = "halt line"                               (B-HALT-5)

  5. return { regionRecorded: true, haltLine: upd.haltLine }
```

**Step 3's confirmation is a total predicate, not a dereference (SE F-04).** v1.0 wrote
`locateIterationsHeading(back).text === …`, which throws a bare `TypeError` on precisely the input
F-9 exists to catch: under the `write-noop` fault mode `back` is the **pre-write** text, and if that
text has no `Iterations` heading — the *no located heading* branch of `applyIterationsSection`,
i.e. the creating-halt case and the B-HALT-3 case — `locateIterationsHeading` returns `null`. The
same happens when the read-back itself fails and `back` is `null`. A thrown `TypeError` is **not** a
`haltError`, so none of §7.2's four properties holds: no `recordPhase(…, "❌", …)` row is written
before it escapes, no row B is pushed, and the `{which}` discriminator never reaches the operator —
the disposition failing on its own named input. Binding `loc` first and testing `loc !== null &&
…` makes the predicate total over every value `_readFile` can return.

Step 4's conjunct (a) needs no such guard because `parseResetRegion` is already total over `null`
(§6.2, RS-4) — but it is stated here so an implementer does not add a redundant one, and so the
**`H_before`** the delta is measured against is named: it is the count from the `parseResetRegion`
of `text2`, read in the same step, never a value cached from step 1.

**Splitting v1.0's conjunct (a) into (a) and (b) is TE F-02's fix at this site.** v1.0 wrote
*"includes `upd.haltLine`, **and** `H` increased by 1"* as one conjunct, so no fault could fail the
delta alone. They are now separate, and §9.2's `lying-write` mode supplies a fault for each:
`write-noop` fails (a) first; a transform that lands the halt line **twice** satisfies (a) and fails
(b); a transform that appends the halt line but **preserves the marker** satisfies (a) and (b) and
fails (c). Conjunct (c) is the one D-3's whole argument rests on — *a separately losable strip
leaves a readable marker beside an incremented `H`, which the gate reads as an unconsumed
clearance* — and it is the state that had **no** double able to produce it.

**The order is 3 → 1 → 2 and the write count is two, not three.** Clause 2 has no failure
disposition of its own because it is not a separate write: its confirmation is **(c)** above and its
failure is clause 1's failure. Why it must be one update — a separately losable strip leaves a
readable marker beside an incremented `H`, which §6.3's gate reads as an unconsumed clearance,
re-granting a window on every later halt while the fault lasts — is split §5.8's, not restated.

**Confirmations (a) and (b) are presence-in-the-region, not existence-of-file.** On a re-halt the file always
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
loop pass **at the reviewer dispatch site** (immediately after the `_parallel` call at
`:2053`–`:2056`),
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

2. **One render function, two sites (SE F-01, B-HALT-7).** v1.0 required *"the identical bytes in
   both places"* and then left two independent renders in the code: `checkConverged`'s
   `rounds ${first}..${last}` at `:1791`–`:1793`, computed from `startIndex`, and the halt branch's
   `HALT-REASON:` value, computed from the origin. On the zero-round halt those differ **by
   construction** — the entry condition *is* `max(D, W) > W + BUDGET − 1`, so `first > last` and the
   phase row reads a **backwards** range like `Non-convergence across rounds 7..5` beside a
   `HALT-REASON: budget-exhausted: rounds 3..5`. Both defects are removed by one pure function:

   ```js
   /** The ONE window render. Both the phase row and HALT-REASON: read this. */
   function renderWindow(origin, endIndex) { return `rounds ${origin}..${endIndex}`; }

   /** Catalogue S-2/S-4's value. `kind` ∈ {"budget-exhausted", "fixed-point", "no-revision"}. */
   function haltReasonValue(kind, origin, endIndex) {
     return `${kind}: ${renderWindow(origin, endIndex)} of ${MAX_REVIEW_ROUNDS}`;
   }
   ```

   `checkConverged`'s `:1791`–`:1793` becomes `const window = renderWindow(origin, last)`, where
   `origin` is the eighth argument (below) and `last` is `endIndex === undefined ? windowEnd(origin)
   : endIndex`. Because `origin ≤ windowEnd(origin)` for every `origin ≥ 1` and every `BUDGET ≥ 1`,
   **the render can no longer be backwards on any input**. B-HALT-7 is then true because one
   function produced both strings, not because two sites happen to agree — which is what the
   §9.4 row-8-adjacent mutation (*render the phase row from `startIndex`*) must red.

   `checkConverged` keeps its shipped seven positional parameters and gains an **eighth, an options
   object** `{origin = startIndex, reviewRows} = {}`. An options object rather than two more
   positionals because nine positional arguments is where a call site starts transposing them; a
   defaulted eighth argument keeps all seven shipped call sites (`:4657`, `:4695`, `:4738`, `:4791`,
   `:4832`, `:4870`, `:4992`) compiling and keeps Phase CR's render byte-identical to today's when
   `origin` falls back to `startIndex`.

   **Row C.** When `roundsRun === 0 && refusal === null` the halt branch pushes **row C** (§4.4)
   onto its own `reviewRows`, with `round` = `startIndex` and the four middle cells `""`, and
   `notice` = `haltReasonValue("budget-exhausted", origin, endIndex)` — catalogue S-2's grammar,
   rendered from the window and the constant, never the literal `rounds 1..3 of 3` (B-WIN-2).

3. **`reviewRows` on the report, end to end (TE F-03).** The carrier is explicit at every hop, so
   AT-RPT-04/06/07 are writable and AT-RPT-07's *absence* assertion is made against a channel that
   demonstrably exists on every run:

   | Hop | Mechanism |
   |---|---|
   | `reviewLoop` → `LoopResult` | `reviewRows: ReviewRow[]`, default `[]` (§4.5) — the same shape `postmortemWritten` / `trailerReason` already use to cross the module-scope boundary |
   | `checkConverged` → `main` | the eighth argument's `reviewRows` **row sink**, stated beside the existing `recordPhase` injection and injected for the same reason: `checkConverged` is module-scope (`:1756`) and cannot see `main`'s closure. It concatenates `loopResult.reviewRows` and pushes its own row B |
   | `phaseGate` → `main` | direct push; `phaseGate` is a closure of `main` (`:4406`) and already owns `notices` (`:4386`) |
   | `main` → report | `main` owns `const reviewRows = []` beside `const notices = []`; `buildFinalReport` (`:5281`) gains `reviewRows = []` as a **defaulted** parameter beside `notices = []` |

   Carried on **every** report — present as a readable value on success too, for the reason the
   shipped comment at `:5307`–`:5309` gives about the four halt-disposition fields: a
   conditionally-spread field cannot express *"no rows"*.

The **shipped Iterations literal** at `:1965` is removed from the post-mortem prompt in the same
edit as step 2 of §6.4: the loop owns that heading now, so leaving the item in the prompt would ask
an agent to write a string the loop immediately overwrites (B-PMT-3).

**Where `haltReasonValue`'s `kind` comes from at this ship.** Only `"budget-exhausted"` is emitted
here: `"fixed-point"` is `pdlc-rcv-fixed-point-stop`'s and `"no-revision"` is S-11, which no path
emits (§6.3.1). The parameter exists so the successor adds a caller rather than a second render.

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
| **F-8a** | answering-line read-back returns `null` (the read itself failed) | §6.3 step 6, conjunct (a) over a `null` re-read — `parseResetRegion` is total, so the empty reading fails (a) | as F-8: **phase refusal**, `which = "answering line"`. Distinct *observation*, same disposition | B-CLR-7 |
| **F-9** | clause-3 write unconfirmed | §6.4 step 3's equality read-back, `loc !== null && loc.text === rendered` | **phase refusal**, `which = "iterations section"`; region byte-unchanged, no halt recorded, nothing stripped | B-HALT-4 |
| **F-9a** | clause-3 read-back returns `null`, **or** returns text with **no** `Iterations` heading | §6.4 step 3, `loc === null` — the total form (SE F-04). This is the *creating* and the B-HALT-3 input, i.e. the input F-9 exists to catch | as F-9. Explicitly **not** a thrown `TypeError`: the refusal must reach `recordPhase` and row B, or none of §7.2's four properties holds | B-HALT-4 |
| **F-10** | clause 1-and-2 update unconfirmed | §6.4 step 4's two conjuncts | **phase refusal**, `which = "halt line"`; nothing stripped, this entry's Iterations render present, counts unmoved | B-HALT-5 |
| **F-11** | `RESOLVED:` absent / `no` / unparseable / duplicated | `parseResolvedMarker` (shipped, M-7a) | the **shipped step-G refusal**, unchanged; **no row B of any variant** is emitted | B-CLR-5 |
| **F-12** | directory listing unreadable | `refreshReviewState`'s `{ok:false}` | the shipped halt, unchanged — decided before any origin is relevant | §2.5 |
| **F-13** | post-mortem **authoring agent** fails or writes nothing | shipped `postmortemFailed` / `_checkFile` (`:1970`–`:2001`) | shipped warning **and** `postmortemWritten:false`, unchanged — the refusal does **not** replace it (SE Q-04). Clause 3 then finds no readable file and refuses as F-9a. The refusal's `haltError` carries no fields (§7.2 property 3), so `main`'s branch-3 probe (`:5147`–`:5159`) decides `postmortemStatus`: `"none"` when the agent truly wrote nothing, `"written"` when a file exists but clause 3 could not confirm the heading. **`postmortemWritten:false` on `LoopResult` and `postmortemStatus` in the report are different quantities and are allowed to disagree** — the first records what the authoring dispatch did, the second what is on disk when the report is built | — |
| **F-14** | region **hand-edited** so the counts lie | nothing, at this ship | **accepted, time-boxed**: operator-caused, operator-visible, **no wider than HEAD's**, where the fail-open is unconditional. Closed at target state by the third conjunct | B-REG-7, E-13 |
| **F-15** | a **torn** (partially landed) region or answering line | not analysed here | `REQ-RCV-07` AC-7.5's (**T-N-1**). Correct and known by construction | — |
| **F-16** | queue-row commit refused (hook, identity, index lock) | shipped | the shipped `halted (uncommitted)` outcome, unchanged; the halt is never downgraded | E-11 |
| **F-17** | a clearance granted on an entry that then **skips** on a FRESH recorded approval | — | **unreachable by construction** (SE F-03). §3.3's step-W ordering puts the region read and the gate *below* steps 3–4, so an entry that returns `{skip:true}` at `:4480` never reaches them. Recorded as a row so a future reordering that reintroduces the state is a diff against a written statement, not a silent regression; FSPEC §6.3's *recoverable direction* would have made it acceptable, but it is better removed than accepted | — |
| **F-18** | a clearance granted on an entry that step G then **refuses** | — | **unreachable by construction**, same mechanism: step G (`:4493`) throws above step W | — |

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
   attaches no fields, so by `M-8g` — the module's only two-argument `haltError` is
   `checkConverged`'s at `:1819`–`:1823` — the chain falls through to `main`'s branch 3 existence
   probe (`:5147`–`:5159`), which finds the file the refusal is *about* — it exists by the path's
   premise. Never `none` (which would print `No POSTMORTEM was written.` beside a ❌ row naming the
   post-mortem, M-8c, `:5179`–`:5181`), never `unresolved`. The one exception is F-13's, stated in
   its §7.1 row: when the authoring dispatch wrote nothing at all there is no file to find, and
   `"none"` is then the *correct* answer.
4. **The invocation terminates on the shipped path** — the ❌ row is recorded *before* the throw,
   `main`'s single catch (`:5118`, M-8a) runs, and the feature's `docs/_queue/QUEUE.md` row is
   written `halted` (M-7b). *A refusal is not a halt*: the `RESOLVED:` marker is left in place,
   both counts are unmoved, and the rest of the entry does not run.

**Where the refusal is raised from, and how its row travels.** F-8 and F-8a are raised inside
`phaseGate` step W, which already owns `recordPhase`, `notices` and `main`'s `reviewRows`, so it
records, pushes and throws directly. F-9, F-9a and F-10 are raised inside `reviewLoop`, which has
**no** `recordPhase` and **no** row array: `maintainRegionOnHalt` returns
`{refusal: {which, path, round}}`, `reviewLoop` returns `{converged: false, refusal, roundsRun,
origin, reviewRows: []}` on `LoopResult` (§4.5), and `checkConverged` — which receives the
`reviewRows` sink as its eighth argument (§6.6(3)) — gains a branch, placed **above** its
`halted === true` branch (`:1770`) and shaped like it, that records the ❌ row, pushes row B onto
the sink, and throws. `recordPhase` is injected into `checkConverged` for exactly the reason the row
sink now is: the function is module-scope (`:1756`) and cannot reach `main`'s closure. This keeps
`recordPhase` ownership where the module already puts it and adds **no second reporting path**.

**Suppression of the shipped generic queue-reset line is NOT this feature's.** `M-8d`'s unguarded
`emit` at `:5184` fires on every halt class reaching the catch, and the seam that suppresses it for
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
| `__tests__/pacingWrapper.test.js:77` | `const MAX_REVIEW_ROUNDS = 5;` | removed in favour of the import. Its two readers are `:1458` (`LAST = HIGHEST_EXISTING + MAX_REVIEW_ROUNDS`) and `:1501`; **both are inside RLH-AT-54, whose premise this feature inverts** — see §9.5.1 row 3. The *form* of those two lines is unchanged; the *test around them* is rewritten |
| `__tests__/roundDerivation.test.js:61` | `const EXPECTED_WINDOW_WIDTH = 5;` | `const EXPECTED_WINDOW_WIDTH = MAX_REVIEW_ROUNDS;` — the alias stays and now **reads** the declaration. Its readers `:300`, `:316` and `:558` keep their **form**, but their **values move 5 → 3**, so none of them is "untouched" in the sense §9.5.1 cares about; each is dispositioned there |

**Why not keep two and assert they agree.** A cross-check test is a third hand-maintained site
that can itself be forgotten, and the failure it guards against is silent in exactly the way AC-1.2
names: a duplicate not updated in the same commit leaves a **green** suite asserting the old width
while the pipeline runs the new one — the defect moved one line up, into the oracle.

**Why not `process.env` or a config file.** C-2: neither exists in the workflow runtime.

Two shipped assertions must be re-expressed rather than deleted, and both keep their ids:

- `roundDerivation.test.js:57`'s comment states *"the constant is deliberately **not** exported"*.
  That statement is now false and is replaced by one naming O-13(a) and the reason.
- `roundDerivation.test.js:389` pins the exact key set of `deriveRoundWindow`'s return
  (`["endIndex", "ok", "present", "skipped", "startIndex"]`); it grows by `derivedStart` and
  `origin` (§4.2).

**And four more do not merely re-express — their semantics move or invert.** v1.0 called them
*untouched* / *unchanged*, which was wrong and would have told an implementer *"do not touch
these"*, whose only obedient reading is *"do not ship the feature"* (TE F-01). They are
enumerated with their replacement invariants in **§9.5.1**, and each appears in §8.2's *read from
it* class and in §10.3's modified-test row.

### 8.2 (b) The closed enumeration of width-encoding sites

Every textual occurrence of the width, classified into AC-1.2's five classes **plus a sixth this
revision adds** (SE F-08). The list is **checked in** as
`pdlc/workflows/lib/budget-width-sites.json` and is the artifact §8.3 compares against a repo scan.
Enumerated at `8801109`; a PLAN task re-runs the scan at implementation time and reconciles any
drift **before** the width changes.

**Ground truth, re-taken at `8801109`.** `grep -n MAX_REVIEW_ROUNDS pdlc/workflows/orchestrate-dev.js`
returns **seven** hits: `:52`, `:1799`, `:1965`, `:2011`, `:2406`, `:2485`, `:2493`. v1.0 enumerated
five and omitted `:2406` and `:2485`, both **JSDoc prose inside the module** — with two consequences.
First, `budgetWidthViolations(root)` as specified would have reported two `unenumerated-site`
violations against the **clean repo** on the day it landed, so `__tests__/budgetSites.test.js` would
be red before any mutation. Second, and this is the design point rather than the bookkeeping one,
v1.0's five classes had **no home** for a source-comment occurrence: it is not *the declaration*,
not *read from it* (it is never evaluated), not a *generated copy*, not *prose* (that class is
scoped to prose **files**), and not a *pinned non-budget literal* (it carries no literal). The
taxonomy did not close over the tree the scanner walks.

| Class | Sites | Disposition |
|---|---|---|
| **the declaration** | `pdlc/workflows/orchestrate-dev.js:52` | becomes `export const MAX_REVIEW_ROUNDS = 3;` (§8.1). **Exactly one** |
| **read from it** | `orchestrate-dev.js:1799` (phase record), `:1965` (post-mortem prompt — this occurrence is **deleted**, §6.6), `:2011` (`iterations`), `:2493` (`windowEnd`); `pacingWrapper.test.js:1458`, `:1501`; `roundDerivation.test.js:61`, `:300`, `:316`, `:558`; **and, newly re-expressed here, `reviewLoop.test.js:139`, `:140`, `:171`, `:214`, `:238`, `:477`, `:478`, `:510`, `:511`, `:512`** | already read the identifier, or are re-expressed over the import in §8.1. No literal. The `reviewLoop.test.js` sites move **out of** the *pinned non-budget literal* class — see the note below |
| **generated copy** | every occurrence in `pdlc/workflows/dist/orchestrate-dev.bundle.js` (`:1082`, `:1109`), `dist/orchestrate-queue.bundle.js` (`:1057`, `:1084`) and `dist/pdlc-cli.mjs` (`:35`, `:62`); the untracked consumer copies under `.claude/workflows/` | rebuilt in the same commit (**O-11**); CI's *Generated artifacts are in sync* job makes it non-optional. Outside the count, **inside** the enumeration |
| **prose** | `CLAUDE.md:78` **only** (*Review loop mechanics*, the phrase `` `MAX_REVIEW_ROUNDS = 5` `` — `:79`–`:84` are the *Documents are gated…* and *Authoring is incremental…* bullets and the `### Continuous integration` heading, and carry no width); `README.md:38`, which carries the width as the **prose phrase** *"max 5 iterations"*, **not** the identifier — the form §8.3 rule 3 must match at that site; `docs/_constraints/pdlc-rcv-baseline.md` §3's row (already states **3**) | updated **in the same commit** (split §5.7). Historical documents under `docs/completed/`, `docs/discarded/` and this family's own review files are **records of what was true then** and are deliberately **not** updated — they are enumerated under this class with `frozen: true` |
| **pinned non-budget literal** | `orchestrate-dev.js:25` — `const DOD_MAX_ITERATIONS = 3;`; `pacingWrapper.test.js:74`–`:76` (`MAX_AUTHORING_ATTEMPTS`, `MAX_AUTHORING_DISPATCHES`, `MAX_AUTHORING_WRITE_BYTES` — different budgets that happen to share a digit); and any fixture literal a re-expression would make circular | each **stays a literal and says so at its site**, in a one-line comment naming this class and the reason. `DOD_MAX_ITERATIONS` is the B-BUD-3 case: after this ship both values are `3`, so only the enumeration — never a round count — distinguishes *reads its own declaration* from *wrongly reads `BUDGET`* |
| **documentation occurrence in source** *(new, SE F-08)* | `orchestrate-dev.js:2406` (*"Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET…"*), `:2485` (*"…in terms of `MAX_REVIEW_ROUNDS`"*) | an identifier **mention inside a comment or JSDoc block** — never evaluated, so it encodes no value and needs no re-expression. Disposition: **no action on the value; the identifier is already the single source.** Both are nonetheless **reworded in the same commit**, because each asserts the *relative, per-invocation* window this feature abolishes and would otherwise become a false comment beside the code that falsifies it |

**Why `reviewLoop.test.js:139` / `:477` left the pinned class (TE F-01 row 4).** v1.0 called them
*acceptance-test **titles*** and dispositioned them *"stays a literal and says so at its site"*.
They are not titles: `:139` is `describe("PROP-LOOP-03: Both reviewers fail all 5 iterations …")`
and `:477` is `describe("PROP-LOOP-12: Cap fires after exactly 5 iterations …")`, but the **bodies**
assert the width — `expect(result).toMatchObject({ converged: false, iterations: 5 })` at `:171`,
`:238` and `:510`, and `expect(reviewerPairCount).toBe(5)` / `expect(optimizerCount).toBe(5)` at
`:173`–`:174` and `:511`–`:512`. Those are **behavioural dispatch counts**, they red at width 3, and
leaving them literal would be a green suite asserting the old budget — the exact failure §8.1
rejects the duplicate-constant design for. All ten sites (titles and bodies) are re-expressed over
the imported constant and move to *read from it*; the titles are composed as template literals so
the name and the assertion can never disagree.

**B-BUD-3's second leg is a runtime one, and it needs the export.** AT-BUD-03b varies `BUDGET`
away from Phase DOD's value and asserts Phase DOD's admitted count is unchanged, then varies
`DOD_MAX_ITERATIONS` and asserts it moves. The symbol is **`dodVerifyLoop`** (`:3831`) — SE F-10:
`runDodPhase` does not exist anywhere in `pdlc/` — and it already takes `maxIterations` as its
second destructured parameter defaulting to `DOD_MAX_ITERATIONS` (`:3833`), so the second leg is
injectable today; the first needs the width reachable from test code, which §8.1 supplies.

**The rule-2 hit set, reconciled here rather than left to the PLAN (SE Q-05).** §8.3 rule 2 matches
module-scope `const` names against `/ROUND|WINDOW.?WIDTH|BUDGET|ITERATIONS?/i`. Run over the tree at
`8801109` the hit set is exactly **four** non-generated sites — `orchestrate-dev.js:25`
(`DOD_MAX_ITERATIONS`), `:52` (`MAX_REVIEW_ROUNDS`), `pacingWrapper.test.js:77`
(`MAX_REVIEW_ROUNDS`), `roundDerivation.test.js:61` (`EXPECTED_WINDOW_WIDTH`) — plus the generated
copies below. `MAX_AUTHORING_ATTEMPTS`, `MAX_AUTHORING_DISPATCHES` and `MAX_AUTHORING_WRITE_BYTES`
do **not** match the regex, so they need no pinning comment for rule 2's sake; they are enumerated
under *pinned non-budget literal* only because they carry the digit `3` and a reader may mistake
them. All four hits are enumerated above, so **the hit set equals the enumeration at the baseline**
— the PLAN task re-runs the comparison rather than discovering it.

**One more generated artifact than v1.0 named.** The same scan finds `pdlc/workflows/dist/pdlc-cli.mjs`
(`:35`, `:62`) alongside the two bundles. It is produced by the same `build-runtime.mjs` run and is
covered by the same O-11 rebuild and the same CI *Generated artifacts are in sync* job, but it is
added to the *generated copy* class explicitly so the scanner's hits are all classified.

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
   whose `frozen` flag is false — matching **both** the identifier form
   (`` `MAX_REVIEW_ROUNDS = {n}` ``, `CLAUDE.md:78`) and the bare-phrase form (*"max {n}
   iterations"*, `README.md:38`), because the enumeration contains one of each;
4. **(new, TE F-05)** in `pdlc/workflows/__tests__/**` only, every **bare numeric literal equal to
   the effective width or to the prior width** — i.e. `3` or `5` at the baseline — appearing
   anywhere in a test file, reported as `unenumerated-site` unless the JSON carries that
   `path` + `text` with a `pinned` classification.

**Why rule 4 exists, and why its noise is the point.** §8.2's *pinned non-budget literal* class is
defined over **bare numeric literals inside test bodies**, and rules 1–3 are all structurally blind
to those: a bare `5` inside `expect(reviewerPairCount).toBe(5)` matches no identifier, is not a
module-scope `const` initialiser, and is not in a prose file. So the one class §8.2 enumerates by
hand was exactly the class the machine could not see, `unenumerated-site` — *"the case a human-read
checklist structurally cannot detect"* — could not be raised for it, and AC-1.2's *"repo-wide,
production and test alike"* was not achievable by the stated rules. Rule 4 is deliberately noisy;
the JSON absorbs the noise **once**, and thereafter the machine sees the class. The alternative
considered and rejected was to declare the class *hand-maintained by design* and name the residual
risk — rejected because it re-creates, one layer up, the very hand-maintenance §8.1 rejects.

**What it reports as a violation.** Three, and only three:

| Violation | Meaning |
|---|---|
| `unenumerated-site` | a scan hit (any rule) absent from `budget-width-sites.json` — **the case a human-read checklist structurally cannot detect** |
| `second-declaration` | a second scan hit classified as *the declaration*, or a rule-2 hit not classified as *pinned non-budget literal* |
| `stale-prose` | **an enumerated non-frozen `prose` site whose recorded `text` is absent from the file at its `path`** |

`stale-prose` is stated at **site** granularity, matching §8.3's own `path` + `text` match key
(TE F-05). v1.0 stated it at **file** granularity — *"a … site whose **file** no longer states the
effective width"* — which is close to unfalsifiable for a large file: `CLAUDE.md` contains the digit
`3` in `DOD_MAX_ITERATIONS = 3` and `MAX_AUTHORING_ATTEMPTS = 3`, so it would satisfy *"states the
effective width"* while still carrying `MAX_REVIEW_ROUNDS = 5`. The site-granular predicate reds
exactly when a prose site was missed, and only then.

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
| **L1 — pure** | `parseResetRegion`, `resolveOrigin` (§6.2), `gateBranch`, `applyHaltUpdate`, `applyIterationsSection`, `renderIterationsHeading`, `locateIterationsHeading`, `renderWindow`, `haltReasonValue`, `admitWindow`; **plus `defaultStatFile`, with `fsMod` as its double** | **none** — string in, value out — except `defaultStatFile`, whose `fsMod` parameter (`defaultStatFile(path, {fsMod = fs})`) is the injection point | `__tests__/resetRegion.test.js` |
| **L2 — window** | `deriveRoundWindow` with and without an origin, `windowEnd`, `admitWindow` | listing arrays | extends `__tests__/roundDerivation.test.js` |
| **L3 — composition** | `readRegionState`, `resolveClearance`, `maintainRegionOnHalt` | seam doubles (§9.2) | `__tests__/resetRegionIO.test.js` |
| **L4 — pipeline** | one whole entry: gate → window → dispatch-or-halt → report | the existing `main()` harness | extends `__tests__/pacingWrapper.test.js` / `haltAndQueue.test.js` |

L1 carries the great majority of the logic and needs no double at all, which is the compensation
§3.1 promised for not having a `lib/` module: the read and write models are pure by construction,
so *"the parser is untestable inside a 5 000-line module"* is false.

**`defaultStatFile` is added to L1 because v1.0 tested it at no level at all (TE F-06).** It is
where the whole `unevaluable` design lands — §5.2's *"`ENOENT` is the **only** errno that answers
absent"* is the sole mechanism behind F-5, ND-1 and D-2's justification — and v1.0's L1 row omitted
it, §9.2's in-memory map *replaces* it (answering from key presence) rather than exercising it, and
§9.3 had no row. So the one branch deciding whether a live region gets erased was covered nowhere.
It is trivially testable: the signature already takes `fsMod`, which reads as though it were written
for exactly this.

**L4 is reachable because `_statFile` is threaded** (§5.2, §5.6). Without the `main`-side thread,
AT-REG-06 and AT-HALT-02 — both explicitly whole-entry rows — could only be written at L3.

### 9.2 Test doubles

| Double | Stands in for | Shape |
|---|---|---|
| **in-memory file map** | `_readFile` / `_writeFile` / `_statFile` | `Map<path, string>`; `_statFile` answers from key presence. The **one** double all three IO seams share, so a write is observable by a subsequent read exactly as in production |
| **fault-injecting file map** | the same, with a per-path fault mode | `{mode: "unreadable"}` → `_readFile` returns `null`, `_statFile` returns `{exists:true}` (F-4); `{mode: "unevaluable"}` → `_statFile` returns `{unevaluable:true}` (F-5); `{mode: "write-noop"}` → `_writeFile` returns `"ok"` and changes nothing (F-8/F-9/F-10); `{mode: "read-back-null"}` → the write lands but the **next** `_readFile` returns `null` (F-8a/F-9a); **`{mode: "lying-write", transform}`** → a per-path **transform hook** applied to the bytes handed to `_writeFile` **before they land**, so what is stored is `transform(bytes)` while `_writeFile` still answers `"ok"` (below). **This is what makes the confirmations falsifiable**: without a write that lies, an equality read-back always passes |
| **dispatch counter** | `_agent`, `_parallel` | counts reviewer dispatches and authoring dispatches **separately**, because *0 authoring dispatches* (B-HALT-2) and *0 reviewer dispatches* (B-WIN-2) are different assertions on the same entry |
| **validator counter** | `_validateRegion` | a function that increments and throws if called; the 0-call contract leg asserts the count is `0` (§6.3.2) |

**The rule `lying-write` generalises, stated as a rule (TE F-02): every conjunct of a
multi-conjunct confirmation needs a fault that fails it *alone*.** v1.0's catalogue offered only
whole-write faults, and `write-noop` changes nothing — so it fails the **first** conjunct of both
content confirmations and the later conjuncts were branches no test in the stated design could red.
That mattered most for §6.4's marker-strip conjunct, which is *precisely* the state D-3's whole
argument rests on (*a separately losable strip leaves a readable marker beside an incremented `H`,
which the gate reads as an unconsumed clearance*) — the design named the state and then contained no
double able to produce it. §9.4's row 3 mutation (*delete clause 2's strip from `applyHaltUpdate`*)
does not close the gap: it reds the **L1 golden**, proving the pure transform, and says nothing
about whether the L3 confirmation would catch a **write-side** loss.

The three realisations that isolate the later conjuncts, each named at its site:

| Confirmation | Conjunct isolated | `transform` that fails it **alone** |
|---|---|---|
| §6.3 step 6 | (b) `A` increased by **exactly 1** | append the answering line **twice** — (a) passes, `A` moves by 2 |
| §6.4 step 4 | (b) `H === H_before + 1` | append the halt line **twice** — (a) passes, `H` moves by 2 |
| §6.4 step 4 | (c) no unfenced `RESOLVED:` remains | apply clause 1 (append the halt line) but **re-insert** the `RESOLVED:` line clause 2 removed — (a) and (b) both pass |

**Every "no round ran" assertion carries a positive conjunct**, never absence alone: a dispatch
count of `0` **alongside** the absence of any new cross-review file, because a double that writes
no file satisfies the absence check either way. This is `REQ-RCV-07` O-10's rule and it applies
identically here.

### 9.3 What each obligation is tested by

| Obligation | Level | The assertion that makes it falsifiable |
|---|---|---|
| **O-5** | L1 + L3 | `applyHaltUpdate` byte-equality against a checked-in golden (FSPEC §12(f): the expected file is **authored**, never derived in-test by re-applying the transform, which would re-implement production in the oracle); plus the three fault modes above |
| **O-12** | L3 | the validator counter at `0`; `validatorConsultationSites(root) === 0` **plus** the same function asserted `=== 1` against a fixture root carrying a synthetic `_validateRegion(` call site, so the scanner's **positive** direction is a recorded fact and not an inference (TE F-09); the same-branch equivalence family (PROPERTIES') |
| **O-13** | L1 (`lib/`) | `budgetWidthViolations(root)` over **one fixture root per violation kind** — an unenumerated site ⇒ `unenumerated-site`; a second module-scope `const NEW_ROUND_BUDGET = 3` ⇒ `second-declaration`; a `prose` site whose recorded `text` was removed from its file ⇒ `stale-prose` — each shown **red** before the oracle is trusted, never asserted only on the clean repo (DC-03, TE F-05). v1.0 covered only the first of the three |
| **D-2 / F-5** | L1 | `defaultStatFile` against a stubbed `fsMod` (TE F-06): one leg per outcome class — `statSync` succeeding ⇒ `{exists:true}`; `statSync` throwing `{code:"ENOENT"}` ⇒ `{exists:false}`; `statSync` throwing `{code:"EACCES"}` ⇒ `{unevaluable:true}`; `statSync` throwing an error with **no `code` at all** ⇒ `{unevaluable:true}`; `""` / whitespace / `null` path ⇒ `{exists:false}` without touching `fsMod`. The EACCES and no-`code` legs are the ones that make §5.2's *"`ENOENT` is the only errno that answers absent"* a tested claim rather than a comment |
| **O-14** | L1 + L4 | equality on the whole heading line, on all three fixtures (creating, re-halt with `k > 0`, no-heading); `roundsRun` threaded end to end at L4 |
| **AC-1.2 / AC-1.3** | all | every budget assertion is written **over the imported constant**, never the literal `3`. Where a test quotes a rendered string containing `3`, it composes the string from the constant |

### 9.4 The assertions that are load-bearing under DC-03

Each of these is the **only** signal of its defect, so each passes the falsification cycle —
mutation named in writing first, red ids recorded, revert re-verified green — and the record lands
in `FALSIFICATION-LEDGER.md` (whose lifecycle line is **O-15's**, PLAN's):

| # | Assertion | Named mutation that must red it |
|---|---|---|
| 1a | the validator 0-call count (runtime observable) | wire `validationConjunct` to call `_validateRegion` |
| 1b | `validatorConsultationSites(root) === 0` (static observable) | the **same** mutation must red **both** rows — and, separately, the scanner is asserted `=== 1` against a fixture root carrying a synthetic `_validateRegion(` call, so a regex that never matches (which would report `0` forever) is excluded (TE F-09) |
| 2 | budget and `iterations` over the constant | change the declaration to 4 without touching a test |
| 3 | one clearance grants exactly one window | delete clause 2's strip from `applyHaltUpdate` |
| 4 | row C's zero-dispatch conjunct | admit `startIndex` unconditionally, ignoring `endIndex` |
| 5 | the Iterations equality | emit `## Iterations (budget 3)` — one integer |
| 6 | the re-halt byte comparison | re-author on the existing path |
| 7 | the two unconfirmed-write refusals | drop the read-back and trust `_writeFile`'s `"ok"` |
| 8 | the three ❌ texts pairwise distinct | collapse `{which}` to a single generic literal |
| 9 | O-11's freshness gate | mutate the built artifact and observe the check red — **not** by running it on an already-fresh tree |
| 10 | **F-5's safe rule: `unevaluable ⇒ existing`** (TE F-07) | `creating ← stat.exists !== true` in §6.4 step 1 — i.e. treat `unevaluable` as absent. Every fixture whose file simply *exists* still passes, so **only** the `{mode:"unevaluable"}` fault-mode fixture reds it. This is D-2's entire justification and §7.3 ND-1's boundary |
| 11 | **RS-3: `resolveOrigin` returns `1` over the empty set** (TE F-07) | replace the fallback with a bare `Math.max(...values)`, which yields `-Infinity`. A `-Infinity` origin produces a window that silently admits nothing and reports nothing — the failure mode hardest to notice in a report — and §7.1 F-6 states it must never reach `windowEnd` or `Math.max` |
| 12 | **BR-9's split: counting is by prefix, resolution is by grammar** | make §6.2 step 4 count **only** well-formed values, so a malformed `WINDOW-START:` stops answering a halt. Currently pinned only by an L1 example, not by a ledger row |
| 13 | **B-HALT-7: one render serves both sites** (SE F-01) | render `checkConverged`'s phase-row window from `startIndex` instead of `origin`. Reds on the zero-round halt, where the two disagree and one is backwards |
| 14 | **§6.4 step 4 conjunct (c)** — the strip is confirmed on the **write** side (TE F-02) | drop conjunct (c) from step 4, then run the `lying-write` fixture that re-inserts the marker. Distinct from row 3, which reds the L1 golden and proves only the pure transform |
| 15 | **§6.3 step 6 conjunct (b)** — the `A` delta is **exactly** one | weaken `A_after === region.A + 1` to `>= 1`, then run the `lying-write` fixture that appends the answering line twice |

### 9.5 Suite-level obligations of the change itself

- **`RLH-LOOP-03` stays green.** `MAX_REVIEW_ROUNDS - 1` must still occur exactly once in
  `orchestrate-dev.js` after `windowEnd` is re-pointed (§6.1), and — `RLH-LOOP-03b`
  (`reviewLoop.test.js:979`) — that occurrence must still lie **outside** the source spans of
  `reviewLoop` and `checkConverged`, which is why `origin` is threaded rather than re-derived
  (§4.5).
- **`build-runtime.mjs --check` and `sync-workflows.sh --check`** are run in the same commit; the
  three artifacts under `pdlc/workflows/dist/` are rebuilt (O-11).
- **`runtimeBundle.test.js`** must still pass with the new `export const`: `stripModuleSyntax`
  removes the prefix (C-3), so the bundle gains no `export` statement.
- **The macOS/Linux matrix** is unaffected — no shell script changes.

### 9.5.1 Shipped assertions whose value moves or whose semantics invert

The section v1.0 lacked (TE F-01). v1.0's §8.1 and §6.1 dispositioned four shipped assertions as
*untouched* / *unchanged* that the design does not leave alone; an implementer reading them
literally would conclude the only test-side work is a width re-expression, and the only way to obey
that reading is not to ship the feature. Each row below names what the site asserts today, what the
design does to it, and its **replacement invariant**. Every id is kept; nothing here is deleted to
fit the change.

| # | Site (`8801109`) | Asserts today | What the design does | Replacement invariant |
|---|---|---|---|---|
| 1 | `roundDerivation.test.js:300` (RLH-AT-02) | `w.endIndex === 2 + EXPECTED_WINDOW_WIDTH - 1` for a listing whose highest round is 1 | **value moves 5 → 3** with the alias (§8.1); the *form* survives because §6.1 note 3 defaults `origin` to `derivedStart`, so `startIndex 2`, `endIndex windowEnd(2) = 4`. Had the default been `1` — v1.0's claim — `endIndex` would be `3` and this would be **red** | `endIndex === origin + BUDGET − 1` and `startIndex === max(derivedStart, origin)`, evaluated over the imported constant. Add a **third leg** asserting the origin-less default *is* `derivedStart`, so the property this row now depends on is pinned rather than assumed |
| 2 | `roundDerivation.test.js:558` | the window-width **property** over generated listings: `endIndex === startIndex + WIDTH - 1` | same as row 1: green under the corrected default, **red** under `origin = 1`. Its statement is nonetheless **too weak** after the change — it cannot distinguish the two defaults, which is how v1.0's error survived review | restate the property as the pair `endIndex === origin + BUDGET − 1` **and** `startIndex === max(derivedStart, origin)`, generated over listings **× origins** (including `origin > derivedStart`, the zero-round case) rather than over listings alone. The generation axis is PROPERTIES' (O-10); the invariant is here |
| 3 | `pacingWrapper.test.js:1455`–`:1501` (RLH-AT-54) | a branch whose highest FSPEC round is 3 ⇒ the gate admits **rounds 4..8** and the report matches `rounds 4..8` | **semantics invert.** `D = 4`, `W = 1` (no region), `E = windowEnd(1) = 3` ⇒ `startIndex 4 > endIndex 3` ⇒ the **zero-round halt**. The assertion pins the pre-feature *relative* window, which AC-1.1 abolishes for typed phases | rewrite the expectation to the zero-round halt: **0 reviewer dispatches**, no new cross-review file, phase row `Non-convergence across rounds 1..3`, `HALT-REASON: budget-exhausted: rounds 1..3 of 3` — the same bytes in both places (B-HALT-7). This is **AT-WIN-02 / AT-WIN-04** territory and the rewritten test cites them. Its sibling assertion — *no message claims `after N iterations` against an absolute index* (`:1501`) — is **kept verbatim**, since it is orthogonal to the window's origin |
| 4 | `reviewLoop.test.js:139`/`:171`/`:173`–`:174` (PROP-LOOP-03) and `:477`/`:510`–`:512` (PROP-LOOP-12) | behavioural counts: `iterations: 5`, five reviewer pairs, five optimizer calls | **value moves 5 → 3.** These are **bodies, not titles** — v1.0 mis-classified them as *pinned non-budget literal* (§8.2) | re-expressed over the imported constant: `iterations: MAX_REVIEW_ROUNDS`, `toBe(MAX_REVIEW_ROUNDS)`, and the `describe` titles composed as template literals so the name and the assertion cannot disagree. The **property** each pins — *the cap fires after exactly `BUDGET` reviewer pairs and `BUDGET` optimizer calls* — is unchanged and is the point of keeping them |

Rows 1 and 2 are green **because of** §6.1 note 3's corrected default, not in spite of it; they are
listed here rather than omitted precisely so the dependency is written down. Rows 3 and 4 are real
work and appear in §10.3's modified-test row.

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
| **AT-REG-06** | `_statFile` answering `{exists:true}` while `_readFile` answers `null` (§9.2's fault map) — the pair that realises *present but unreadable* — **and** `_statFile` threaded through `main` → `wrapperSeams` → `reviewLoop` (§5.2), without which the row can only be written at L3 |
| **AT-CLR-06** | the answering line being written from `phaseGate` **step W**, after step G and before `reviewLoop` is constructed (§3.3, §6.3) |
| **AT-CLR-07 / AT-HALT-04 / AT-HALT-05** | the `write-noop` fault mode (§9.2); without a write that lies, no confirmation can fail. Their **later-conjunct** legs additionally need `lying-write` (§9.2, TE F-02) |
| **AT-HALT-02** | the separate authoring-dispatch counter (§9.2), a checked-in golden (§9.3), **and** the `_statFile` thread to L4 (§5.2) |
| **AT-RPT-04 / AT-RPT-06 / AT-RPT-07** | `reviewRows` carried end to end — `LoopResult` → `checkConverged`'s row sink → `main` → `buildFinalReport`'s defaulted parameter (§4.4, §6.6(3)). AT-RPT-07 asserts row B's **absence**, which is only falsifiable because the carrier is present on every report; against a missing carrier it would pass vacuously |
| **AT-BUD-03b** *(second leg)* | `dodVerifyLoop`'s injectable `maxIterations` (`:3831`–`:3833`) — **not** `runDodPhase`, which does not exist (SE F-10) |
| **AT-PMT-01/02** | the post-mortem prompt composed in `reviewLoop` (`:1962`–`:1968`), asserted as a string, as `skillFiles.test.js` already asserts prompt literals |

### 10.3 Files touched

| Path | Change | Kind |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | see the per-symbol breakdown below | modified |
| `pdlc/workflows/runtime-adapter.js` | `rtStatFile`, wired into the seam bundle beside `rtCheckFile` (`:817`; `rtWriteFile` is `:802`) | modified |
| `pdlc/workflows/lib/budget-sites.mjs` | `budgetWidthViolations`, `validatorConsultationSites` | **new** |
| `pdlc/workflows/lib/budget-width-sites.json` | the classified enumeration (§8.2) | **new** |
| `pdlc/workflows/__tests__/resetRegion.test.js`, `resetRegionIO.test.js`, `budgetSites.test.js` | L1/L3 suites | **new** |
| `pdlc/workflows/__tests__/{roundDerivation,reviewLoop,pacingWrapper,haltAndQueue}.test.js` | width re-expression, key-set growth, new pipeline legs, **and §9.5.1's four semantics-moving sites**: `roundDerivation.test.js:57`/`:61`/`:300`/`:316`/`:389`/`:558`; `reviewLoop.test.js:139`/`:171`/`:173`–`:174`/`:477`/`:510`–`:512`; `pacingWrapper.test.js:77` (deleted, replaced by the import) and `:1455`–`:1501` (RLH-AT-54 rewritten to the zero-round halt) | modified |
| `pdlc/workflows/dist/*` | rebuilt (**O-11**) | **generated — never hand-edited** |
| `CLAUDE.md`, `README.md` | the prose width sites (§8.2) | modified, same commit |

**`orchestrate-dev.js`, per symbol** — the enumeration §10.3 owed and v1.0 gave as a list of names
(SE F-02, F-05; TE F-04). Every row is an edit an implementer can locate:

| Symbol / site | Edit |
|---|---|
| `:52` | `export const MAX_REVIEW_ROUNDS = 3;` (§8.1) |
| `:2406`, `:2485` | JSDoc reworded: both assert the *relative, per-invocation* window this feature abolishes (§8.2's sixth class) |
| `windowEnd` `:2492`–`:2494` | parameter **renamed** to `origin`; body unchanged |
| `deriveRoundWindow` `:2428`, `:2474`–`:2478` | third parameter `{origin}` defaulting to `derivedStart`; return grows `origin` and `derivedStart`; `endIndex = windowEnd(origin)`; `startIndex = Math.max(derivedStart, origin)` |
| **new** `admitWindow`, `renderWindow`, `haltReasonValue` | pure; §6.1, §6.6(2) |
| **new** region read model + write model clusters | above `checkPostmortem` (`:2738`); §3.1 |
| `phaseWindow` `:4367`–`:4377` | return **narrowed** to `{ok, derivedStart, present, skipped, reviewFiles, message}`; the `resolveReviewState` call at `:4368`–`:4374` is kept verbatim (SE F-06) |
| `phaseGate` step 3 `:4421` | `startIndex: window.startIndex` → `startIndex: window.derivedStart` (SE F-02) |
| `phaseGate` **step W**, inserted at `:4508` | region read, `resolveClearance` (taking step G's `gate.status`), `admitWindow`; skipped when `docType === null` |
| `wrapperSeams` `:4520`–`:4530` | add `_writeFile`, `_statFile` |
| `main` `:4297`ff | add `_statFile: statFileFn = defaultStatFile`; add `const reviewRows = []` beside `:4386`'s `notices`; pass `reviewRows` to `buildFinalReport` at all six call sites (`:4551`, `:4566`, `:4589`, `:4611`, `:5188`, `:5206`) |
| **new** `defaultStatFile` | beside `defaultWriteFile` (`:4219`) / `defaultAppendFile` (`:4235`); §5.2 |
| `reviewLoop` `:1841`–`:1865` | parameters gain `origin = startIndex`, `_writeFile`, `_statFile`; `:1850` becomes `endIndex = windowEnd(origin)` |
| `reviewLoop` halt branch `:1960`–`:2016` | `maintainRegionOnHalt` replaces the inline author-and-`_checkFile` block for typed phases; `:1965`'s Iterations item deleted; `:2004`–`:2007`'s `lastResults` becomes `roundsRun === 0 ? [] : […]`; return grows `roundsRun`, `refusal`, `origin`, `reviewRows` |
| `reviewLoop` `:2053`–`:2058` | `roundsRun += 1` immediately after the `_parallel` call |
| `checkConverged` `:1756`–`:1764` | eighth parameter `{origin = startIndex, reviewRows} = {}` |
| `checkConverged` `:1770` | a **refusal branch inserted above** the `halted === true` branch |
| `checkConverged` `:1791`–`:1793` | `first`/`last` replaced by `renderWindow(origin, last)` where `last = endIndex ?? windowEnd(origin)` |
| the seven `checkConverged` call sites `:4657`, `:4695`, `:4738`, `:4791`, `:4832`, `:4870`, `:4992` | gain the eighth argument |
| `buildFinalReport` `:5281`–`:5293` | `reviewRows = []` as a defaulted parameter, emitted unconditionally beside `notices` |

**Not touched, and verified so** (§4.2.1 rows 1–4): `refreshReviewState`'s `candidate =
window.startIndex - 1` (`:2688`) and its passthrough (`:2710`–`:2711`), `rehydrateReviewState`
(`:2820`), and `selectMode`'s call sites (`:3106`, `:3119`). All four read an **origin-less**
`deriveRoundWindow`, so `startIndex === derivedStart` there and the sites are correct unchanged.

`docs/_constraints/*` and every `pdlc/skills/*/SKILL.md` are **untouched**: O-9's clause lands in
the workflow's inline post-mortem prompt (`:1962`–`:1968`, M-7e), not in a SKILL file, because that
prompt is composed by the loop and has no SKILL of its own.

## 11. Obligation disposition, decisions and the stopping rule

### 11.1 Obligations

| Obligation | Owner | Disposition here |
|---|---|---|
| **O-5** | TSPEC | **Discharged.** §6.4's clause order, the one-update rule (§4.3, §5.3), both content confirmations, and §7's fail-closed refusals |
| **O-9** | FSPEC → implementation | **Attached, not authored.** The clause's text is FSPEC §9's; §6.4 step 2 fixes where it lands (`orchestrate-dev.js:1962`–`:1968`) and §7.3 ND-3 states why it is belt-and-braces |
| **O-10** | PROPERTIES | **Not discharged.** §9 fixes the levels, the doubles and the DC-03 routing; the legs, fixtures, generation axes and the ledger's contents are PROPERTIES', stated at split §5.4 |
| **O-11** | implementation | **Placed.** §2.1, §9.5 — the rebuild is in the same commit and its freshness gate is falsified by mutation (§9.4 row 9) |
| **O-12** | TSPEC | **Discharged, by adoption.** The seam's contract is `REQ-RCV-07` O-12's and is restated nowhere; §6.1 fixes how `W` reaches the window arithmetic, §5.4 the declared-unwired seam, §6.3.2 the interim's two observables |
| **O-13** | TSPEC | **Discharged.** §8.1 (the export), §8.2 (the six-class enumeration, re-taken at `8801109`), §8.3 (the machine, four scan rules) |
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
| **D-5** *(new, v1.1)* | The clearance gate lives in **`phaseGate` step W**, after step G; `phaseWindow` narrows to the derived facts | Leaving the gate inside `phaseWindow`, which shipped `phaseGate` calls at step 2 (`:4415`). Cheaper — one symbol instead of two — and it is what v1.0's §6.1 described. **Rejected**: it puts the gate *above* the approval search and step G, so an entry with a FRESH recorded approval spends the operator's one clearance and then returns `{skip:true}` (`:4480`) having dispatched nothing, and §6.3's marker conjunct loses the premise that makes it defensive. The cost of the split — one more moving part in `phaseGate` — buys F-17/F-18 becoming *unreachable* rather than *accepted*, and makes step 3's `derivedStart` argument structural rather than remembered (§3.3, §4.2.1 row 5) |
| **D-6** *(new, v1.1)* | `deriveRoundWindow`'s `origin` **defaults to `derivedStart`** | Defaulting to `1`, which v1.0 assumed. **Rejected**: it silently changes four shipped consumers that read an origin-less derivation as *"no reset in effect"* (§4.2.1 rows 1–4), reds `roundDerivation.test.js:300` and `:558` for no design reason, and would give Phase CR an absolute window that contradicts B-BUD-2 / AT-BUD-02 (§6.1, TE Q-01/Q-02) |

**Reversibility.** D-1 is **hard to reverse** — it is a consequence of the distribution mechanism,
and reversing it means adding a fourth inlined source with its own manifest row, freshness gate and
sync semantics. D-2, D-3, D-4 and D-6 are each **easy** — local to one function, one field or one
default. D-5 is **moderate**: reversing it moves a block between two symbols and re-opens F-17.
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

### 11.5 Round-1 finding disposition (v1.1)

Every finding of round 1 and where it landed. **No finding was closed by deferral**: both reviewers
correctly filed only findings inside §11.4's protected categories or its explicit carve-out, and all
twenty-one are fixed in this document.

| Finding | Severity | Landed in |
|---|---|---|
| SE F-01 — `origin` not threaded; two disagreeing renders | Blocking | §2.4, §4.2.1 rows 7/9/10, §4.5, §6.6(2), §9.4 row 13 |
| SE F-02 — `startIndex` meaning change redirects the approval search | Blocking | §4.2.1 (full enumeration), §3.3 (structural fix), §10.3 |
| SE F-03 — §3.3 / §6.1 ordering contradiction | Blocking | §3.3 (step W), §3.4, §6.1, §6.3 footnote `*`, §7.1 F-17/F-18, §11.2 D-5 |
| SE F-04 — step 3's confirmation faults on its own input | Major | §6.4 step 3, §7.1 F-9a |
| SE F-05 — `windowEnd`'s two unenumerated call sites | Major | §2.4's call-site table, §6.1 note 4, §10.3 |
| SE F-06 — wrong callee, dropped `_probeReviewState` | Major | §6.1 step 1, §5.6 |
| SE F-07 — `_probePostmortem` absent from the seam table | Major | §5.6, §6.3 step 2 |
| SE F-08 — §8.2's enumeration incomplete at its own baseline | Major | §8.2 ground truth + sixth class |
| SE F-09 — the declared baseline does not resolve | Minor | §1.2, §2.7.1 |
| SE F-10 — `runDodPhase` does not exist | Minor | §2.7.1, §8.2, §10.2 |
| SE F-11 — `scanLines`-over-a-body composition unstated | Minor | §6 preamble |
| SE Q-01…Q-05 | — | §6.1(i), §4.4, §4.5, §7.1 F-13, §8.2 |
| TE F-01 — four oracles mis-dispositioned; false compat claim | Blocking | §6.1 note 4, §8.1, §9.5.1, §11.2 D-6 |
| TE F-02 — no fault isolates the second conjunct | Blocking | §6.3 step 6, §6.4 step 4, §9.2, §9.4 rows 14–15 |
| TE F-03 — `reviewRows` has no carrier | Blocking | §4.4, §4.5, §6.6(3), §7.2, §10.2 |
| TE F-04 — `_statFile` not threaded to L4 | Major | §5.2, §5.6, §9.1, §10.3 |
| TE F-05 — the scan's blind class; two-granularity `stale-prose` | Major | §8.3 rules 3–4 and the violation table, §9.3 O-13 |
| TE F-06 — `defaultStatFile` tested at no level | Major | §9.1 L1, §9.3 D-2/F-5 row |
| TE F-07 — two missing mutation-ledger rows | Major | §9.4 rows 10, 11 (and 12) |
| TE F-08 — `resolveOrigin` has no contract | Minor | §6.2 |
| TE F-09 — §9.4 row 1 collapses two observables | Minor | §9.4 rows 1a/1b, §9.3 O-12 |
| TE F-10 — prose citations stale as authored | Minor | §2.7.1, §8.2 prose class |
| TE Q-01…Q-03 | — | §6.1 note 4, §6.1 closing, §4.4 |

**What is genuinely routed downstream, and to whom** — none of it as a substitute for a fix:

| Routed | Owner | Because |
|---|---|---|
| §9.5.1 row 2's **generation axis** (listings **× origins**, including `origin > derivedStart`) | PROPERTIES (O-10) | the restated *invariant* is here; the axis table and the shrinker are §1.4/§9.6's, per §11.4's third clause |
| §9.3's per-violation-kind **fixture roots** for `budgetWidthViolations`, and §9.2's `lying-write` **transform bodies** | PROPERTIES (O-10) | fixture construction, explicitly not a TSPEC concern; the *requirement* that one exist per kind and per conjunct is stated here |
| the `FALSIFICATION-LEDGER.md` **lifecycle line** for §9.4's fifteen rows | PLAN (O-15) | DC-10; §9.6 names it |
| `_validateRegion`'s **implementation** | `REQ-RCV-07` AC-7.1 / O-12, queue row 18 | §11.3, unchanged |
| suppression of `M-8d`'s generic recovery line (`:5184`) on a refusal | `REQ-RCV-07` **O-6** | §7.2, §11.3, unchanged — a seam one notch too wide silences it on every halt class |
