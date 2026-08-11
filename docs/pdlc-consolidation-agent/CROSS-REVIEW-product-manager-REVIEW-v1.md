# Cross-Review: product-manager — REVIEW (Phase CR, Final Codebase Review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/` — the feature's implementation on `feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 1
**Scope:** Product lens only — requirements traceability (REQ-CONS-01…07, AC-1.1…AC-7.2), scope compliance, acceptance-criteria fidelity. Technical design, test strategy and code quality belong to the SE and TE lenses.

## Method

This is Phase CR round 1 for the product lens. I did not review the specification documents again — they converged in their own phases. I reviewed the **shipped code against REQ**, and used the documents only to establish what each AC promised.

1. Read `REQ-pdlc-consolidation-agent.md` first, then the implementation, in that order.
2. Walked every AC that names an operator-visible behaviour (**AC → production caller → operator-visible artifact**), per the builder-not-wired sweep this role owes a final codebase review. For each exported helper that implements an AC, I grepped the module for a **production** caller and read the call site.
3. Read the two operator-facing renderers end to end — `renderTerminalRow` (the `.consolidation-log.md` row) and `renderReportBody` (what a `/loop` tick prints) — because AC-7.1 and AC-7.2 make those two the operator's only channel.
4. Every claim below is cited at `file:line` on HEAD (`5cb7efc2`), read at HEAD rather than copied from an earlier round's review.

Four acceptance criteria have code that computes the right answer and no production path that renders or reaches it. That pattern — a correct pure function with zero production callers — is the same class DOMAIN-CONSTRAINT DC-07 names, and it is what the findings below are mostly about.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **`deferred:` is a hardcoded `none` on both operator channels.** `state.deferred` is populated (`consolidate-learnings.js:853`) from every PR-route proposal that degraded and every `proposal-file` diversion, but the log row emits the literal `deferred: none` (`:2038`) and the report body emits the literal `8. deferred: none` (`:2094`). A `promoted-degraded` pass tells the operator it deferred nothing. | AC-7.1, AC-3.5, US-01, US-05 |
| F-02 | High | Local | **AC-6.2 and AC-6.3 cannot fire: `seamCandidates` has zero production callers.** `main()` parses `ESCALATIONS.md` and stores the counts (`:631-635`), then never consults them; `seamCandidates` (`:1787`) is called from tests only, and report item 7 is the literal `7. advisory: none` (`:2093`). No over-escalating seam is ever surfaced, no widening is ever proposed. | AC-6.2, AC-6.3, AC-7.1, US-04 |
| F-03 | High | Local | **AC-5.3/5.4/5.5 remediation is unreachable in production, twice over.** `remediationChoice` (`:1630`) has zero production callers and every row ships `remediation: null` (`:1584`); and `effectivenessTable` is called with a **single-element** pass array — this pass only (`:648-652`) — so `ineffectiveStreak >= 2` (`:1578`) and `unmeasurableStreak >= unmeasurablePasses` (3, `:1579`) can never be reached. No promotion is ever flagged `ineffective`, revised, or retired. | AC-5.3, AC-5.4, AC-5.5, US-05 |
| F-04 | High | Local | **AC-2.3's pattern bar is neither stated to the model nor enforced, and AC-3.2(iii)'s evidence is silently dropped.** The one prompt that produces proposals (`:606-609`) never states the recurs-across-≥2-unrelated-features / standing-invariant bar and never specifies the `evidence` shape; `deriveProposals` accepts any `evidence` including `null` (`:950`) and applies no bar; `renderPrBody` prints evidence only when it matches `{recurrence: []}` or `{standingInvariant: ""}` (`:2131-2134`), so PR bodies routinely ship without the citation AC-3.2 requires. | AC-2.3, AC-3.2, US-01 |
| F-05 | Medium | Local | **AC-3.2(i)'s per-promotion source citation is the whole consumed set.** `renderPrBody` emits `source: ${consumed.join(", ")}` inside **each** promotion section (`:2126`), so every promotion claims every consumed LEARNINGS as its source. The reviewer cannot tell which features evidence which edit. | AC-3.2, US-01 |
| F-06 | Medium | Process | **The CR gate has no AC→production-caller sweep, which is why F-01…F-04 reached final review green.** All four gaps are green under the suite because the acceptance tests exercise the pure builders (`seamCandidates`, `remediationChoice`, `effectivenessTable`, `renderPrBody`) with hand-built inputs rather than the report `main()` renders. The durable fix is a checklist row in the CR reviewer prompts: for each AC, name the production caller and the operator-visible artifact, or file a finding. | DC-07, AC-7.1 |
| F-07 | Low | Local | **The module docblock still calls the shipped implementation a skeleton.** `consolidate-learnings.js:21` reads "This file is currently a SKELETON (TSPEC §5, §6 — PLAN T02)" at the head of 2,373 lines of landed behaviour. A reader deciding whether the pass is safe to run starts from a false statement. | — |

### F-01 — `deferred:` never carries what was deferred

AC-7.1 ends with "and what it deferred for human judgment"; FSPEC §10.4 item 8 repeats it as its own item, and FSPEC:1861 gives `deferred:` its own row ("what the pass left for human judgment", AC-7.1). AC-3.5 turns on the same field: when the PR cannot be opened, the pass still writes the proposal file and still reports.

Production populates the data and discards it on the way out:

- `state.deferred = deferred` — `consolidate-learnings.js:853`, fed by `degradeAll` (`:745`) and the `proposal-file` diversion (`:727`).
- `renderTerminalRow` — `lines.push(\`deferred: none\`)` — `:2038`. Unconditional literal.
- `renderReportBody` — `lines.push(\`8. deferred: none\`)` — `:2094`. Unconditional literal.

The worst case is exactly the case this feature exists for: a pass whose promotions all failed to reach a PR writes `CONSOLIDATION-PROPOSAL-{passId}.md` (`:856-860`) and then reports `deferred: none`. The operator has no signal that the file is there or that anything needs judgment. FSPEC §10.4's receive-side totality rule (DC-01) is satisfied in form — the section is present — and violated in substance, because "none" is not an empty statement here, it is a wrong one.

Fix: render both fields from `state.deferred`, naming each item's `{failureModeId}:{action}` and its `reason`/`detail`, and keep `none` for the genuinely empty case.

### F-02 — the advisory input is read, counted, and thrown away

AC-6.1 makes `ESCALATIONS.md` the pass's machine-readable per-seam input and distinguishes three corpus states. AC-6.2 requires an over-escalating seam (≥2 distinct features, exceeding the others) to be **surfaced as a candidate**. AC-6.3 requires a never-escalating seam in a non-empty corpus to be proposable as an envelope widening — routed as a PR under AC-3.1, or reported as an operator action where it is a consumer-local config change. FSPEC §10.4 item 7 makes all of it report item 7: "the corpus state, any §9.4 / §9.5 candidate, and any operator action". TSPEC:222 places `seamCandidates` under `main()`'s call tree, and TSPEC:2422 traces CONS-08 through it.

Only the corpus **state** survives to the operator:

- `main()` parses and stores the counts — `:631-635` — and adds `no-advisory-corpus` / `advisory-corpus-empty` where they apply. That half is correct.
- `state.advisory` is then read by nothing. Grepping the module for `seamCandidates` outside its own definition (`:1787`) returns no production call site.
- Report item 7 is the literal `7. advisory: none` — `:2093`.

So on a repo with a real corpus and a seam escalating across four features, the pass prints `advisory: none`. AC-6.2's candidate and AC-6.3's widening are never proposed and never reported; US-04's promise that a pass tells the operator something about the previous passes' seams is unmet on this axis.

Fix: call `seamCandidates(state.advisory)` after `:635` and render item 7 from its `{over, tie, under}` — the corpus state, the candidate where one exists, and AC-6.3's operator action where the widening is consumer-local rather than PR-able.

### F-03 — nothing is ever retired, which is the failure the REQ was written against

REQ §1 states the problem in one line: "Nothing checks whether a promotion worked… no promotion is ever retired." US-05 asks to see promotions pruned. AC-5.3 requires a promotion whose verdict was `recurred` on two consecutive counted passes to be flagged `ineffective` and routed to revision or retirement; AC-5.4 routes the retirement; AC-5.5 flags `unmeasurable` after N `insufficient-evidence` passes. FSPEC §10.4 item 5 requires the effectiveness row to carry the `revision`/`retirement` field where a remediation was proposed.

Two independent blockers, either of which alone is sufficient:

1. **No remediation is ever chosen.** `remediationChoice` (`:1630`, TSPEC:1160, TSPEC:230) has zero production callers, and `effectivenessTable` hardcodes `remediation: null` on every row it builds (`:1584`). FSPEC §10.4 item 5's field can therefore never be populated.
2. **No streak can ever reach its threshold.** `effectivenessTable`'s streak logic is correct (`:1550-1580`) but `main()` hands it a pass array of length one — the current pass (`:648-652`). `ineffectiveStreak >= 2` (`:1578`) needs two counted passes in that array; `unmeasurableStreak >= 3` needs three. With one element, `state` is `null` on every row, forever, on every repo. AC-5.3's "two consecutive counted passes" is not implemented so much as made unreachable.

The pass will happily run for a year, accumulate promotions, and report `state: null` for all of them — which is REQ §1's "drifts toward ceremony" reproduced by the very feature meant to prevent it.

Fix: reconstruct the prior passes' consumed corpora from the log's `<!-- pdlc:consumed {passId} -->` blocks (already parsed — `classifyCorpus`, `:1105`) and pass them alongside the current one; then call `remediationChoice` for each row whose `state` is `ineffective` and carry its answer into the row and into report item 5.

### F-04 — the pattern bar is not in the prompt, and the evidence it produces is not in the PR

AC-2.3 is the bar that separates a pattern from a coincidence: "recurs across ≥2 unrelated features, or a single occurrence stating a standing invariant". AC-3.2 requires the PR body to cite the source LEARNINGS by feature name, the failure mode, and **the pattern evidence that cleared the bar**.

The bar exists nowhere in the production path:

- The clustering prompt (`:606-609`) asks for `{clusters: [{phase, artifact, kind, action, symptom, diff, evidence}]}` and says nothing about ≥2 unrelated features, nothing about standing invariants, and nothing about what `evidence` should look like.
- `deriveProposals` (`:925-956`) validates `phase` and `artifact` as strings, defaults `kind` and `action`, and takes `evidence` as-is including `null` (`:950`). No proposal is ever rejected for failing the bar.
- `renderPrBody` prints the evidence line only when `evidence.recurrence` is an array or `evidence.standingInvariant` is a string (`:2131-2134`) — a shape the prompt never asks for. Any other shape, and `null`, silently drops the line. The comment at `:2128` cites AC-3.2(iii) directly above the branch that discards it.

A single-occurrence coincidence therefore reaches a PR with no evidence line at all, and the operator reviewing that PR — the human control this whole feature rests on (US-02) — has nothing to judge it against.

Fix: state AC-2.3's bar in the clustering prompt, specify the `evidence` shape the renderer consumes, and drop (or divert to the proposal file) any cluster whose evidence does not clear the bar.

### F-05 — every promotion cites every LEARNINGS

`renderPrBody` emits `source: ${consumed.join(", ")}` inside each promotion's own section (`:2126`). With five consumed LEARNINGS and three promotions, all three sections name all five files. AC-3.2 asks the body to cite "the source LEARNINGS files by feature name" per promotion — the point being that the reviewer can see which features evidenced this edit. The `PDLC-CONSOLIDATION-SOURCES` trailer (`:2143`) correctly carries the pass-level set; the per-section line should carry the promotion's own sources, which is what `evidence.recurrence` would supply once F-04 is fixed.

### F-06 — process

Filed as `Process` rather than `Local` because the defect is in how this phase is reviewed, not in this feature's code. Four ACs shipped with correct builders and no production caller, and the suite is green, because the acceptance tests hand-build the builder's inputs instead of asserting on the report `main()` produces. This is DC-07's shape, and the final codebase review is the last place it can be caught. The pm-review and se-review CR prompts should carry an explicit sweep row: for each AC, name the production caller and the operator-visible artifact it reaches, or file a finding. Routing to harvest as a process learning.

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-03's streak reconstruction needs prior passes' consumed corpora. Is the intent to re-read the LEARNINGS bodies named by each prior `<!-- pdlc:consumed -->` block (which may have been archived or deleted since), or to persist a per-pass verdict in the log row so streaks are counted from records rather than re-derived? The second is cheaper and survives deletion; it is a product decision about what "counted pass" means, so it belongs in REQ/FSPEC rather than being settled in code. |
| Q-02 | For AC-6.3, when the widening is consumer-local (`.claude/pdlc.config.json`, untracked), REQ says it is reported as an operator action, never a PR. Should that operator action appear in report item 7 only, or should it also appear in the log row so a later pass can tell it was already recommended and not repeat it every pass? |

## Positive Observations

- **The propose-only guarantee is real, and it is the promise US-02 rests on.** `routeOf` derives the guard set from the imported `MERGE_GUARD_DEFAULTS` rather than a module-local copy (`:1659-1665`), `routeProposal` is its only caller (`:1677`), and the PR path pushes to `consolidation/{passId}` and opens a PR — `mergeCommandFor("consolidationCreate")` carries no `--auto` and no merge verb (`orchestrate-dev.js:375-379`). AC-3.6 and AC-3.7 hold by construction, not by convention.
- **AC-3.5's degradation is genuinely non-lossy.** Every PR failure class degrades through one `degradeAll` (`:742-748`) that both defers the proposal and appends its `degraded` record, and `renderProposalFile` writes the **full diff inline**, falling back to the `(unavailable)` literal rather than dropping the item (`:2183-2185`). A half-failed pass leaves an inspectable residue, which is what the AC asks for.
- **AC-1.3's refusal and AC-7.2's exactly-one-report contract are cleanly structured.** `finishPass` is the single exit (`:964`), the lifecycle guards are stated per status (`skipped-cadence` skips all three steps; `refused` skips the commit, `:998`), and the marker is released only when this pass holds it (`:1011`).
- **AC-3.8b's commit is pathspec-scoped from a `writeSet` the code maintains as it writes** (`:511`, `:736`, `:859`, `:1000`), never `-a`. On a repo where the consuming and plugin repositories are the same — REQ's primary case — that is the control that keeps a consolidation pass from sweeping up unrelated work.
- **The duplicate-suppression story is coherent end to end**: both carriers checked (`enactedByLog`, `enactedByPr`, `:678`/`:688`), the evidence kept distinct from `pr:` in the row (`:2035`), and `renderSuppressionEntry` giving each entry its named carrier — AC-7.2's "the two fields are never merged" holds as written.

## Recommendation

**Needs revision.**

Four High findings, all of the same shape: an acceptance criterion whose logic is implemented correctly in a pure function that no production path calls, or whose value is overwritten by a literal on the way to the operator. Concretely, to close this round:

1. **F-01** — render `deferred:` from `state.deferred` in both `renderTerminalRow` (`:2038`) and `renderReportBody` (`:2094`).
2. **F-02** — call `seamCandidates(state.advisory)` in `main()` and render report item 7 from its result, including AC-6.3's operator action.
3. **F-03** — pass prior passes' consumed corpora to `effectivenessTable` so AC-5.3's and AC-5.5's thresholds are reachable, and call `remediationChoice` for `ineffective` rows, carrying its answer into the row and item 5.
4. **F-04** — state AC-2.3's bar and the `evidence` shape in the clustering prompt, and stop dropping the AC-3.2(iii) evidence line silently.

F-05 and F-07 are worth taking in the same pass; F-06 is routed to harvest as a process learning and does not gate this feature.

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 2, "low": 1}
