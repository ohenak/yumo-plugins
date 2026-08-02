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

## 4. Types and data model

## 5. Protocols — the seams and their contracts

## 6. Algorithms

## 7. Error handling

## 8. O-13 — the budget-width blast radius

## 9. Test strategy

## 10. Traceability

## 11. Obligation disposition
