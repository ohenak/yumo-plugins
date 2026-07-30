# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/REQ-pdlc-review-loop-hardening.md` (v1.0)
**Date:** 2026-07-29
**Iteration:** 1
**Scope:** testability of ACs, edge-case completeness, measurability of NFRs, presence of negative cases. Not product strategy, not architecture.

## Preliminaries

The §preamble stopping rule and DC-09 are honoured in this review. I did **not** file findings of the
form "AC-N has no oracle / no fixture / no seam" — every such observation I made maps onto an existing
§8 row (O-10…O-15) and is left there. The four blocking findings below are of a different class: each
names an AC whose **observable behavior cannot be determined from the document**, either because the
input it is defined over is not established to exist on the branch (F-01, F-02), because the
acceptance threshold is unquantified (F-03), or because two readings of the AC produce opposite
observable outcomes for the same branch state (F-04). None of them is disposed of by any §8 row — I
checked O-1…O-16 individually before filing.

Citations spot-checked against HEAD, not taken on trust: `orchestrate-dev.js:508` (dead
`docs/{feature}/POSTMORTEM-…{feature}` template — confirmed literal braces), `:510/:513` (bare `5`,
"POSTMORTEM written." asserted unconditionally — confirmed), `:537-538` (`iteration = 1` default,
no `readdirSync`/glob in the file — confirmed), `:562` (`iteration > 5`), `:586-588`
(`postmortemFailed` logs only; also **not** carried in the `:598` return object, so AC-2.2 needs a
return-shape change as well as a message change), `:24` (`DOD_MAX_ITERATIONS`), `:703-710`/`:733`
(literal `{DOC-TYPE}` reaching the prompt), `pm-author/SKILL.md:29` and `:88/:109/:121` (single
terminal write), `orchestrate-queue/SKILL.md:102-109` (`halted` as terminal leaf). All check out.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **AC-4.2 is defined over an input that does not exist on the branch.** AC-4.2 requires approval to be established "from artifacts on the branch — the reviewers' recorded verdicts". At HEAD the machine-readable verdict is the `VERDICT:`/JSON trailer, and every review SKILL places it in the **agent's response**, not in the cross-review file ("append … as the last content of your **response**", `se-review/SKILL.md` and `te-review/SKILL.md` VERDICT-trailer sections); the file template ends at a free-text `## Recommendation` heading with a bolded English phrase. `reviewLoop` correspondingly parses the verdict off the `_agent()` return value (`orchestrate-dev.js:623-643`), never off disk — the verdict is not persisted anywhere. So on any branch produced by today's harness, AC-4.2's stated input is absent, and AC-4.1/4.3/4.5 inherit the problem. Either the REQ must state that the verdict becomes a persisted, closed-catalogue field of the cross-review artifact (a change to the three review SKILLs' output contract, i.e. real scope this REQ does not currently claim in its `Targets` row), or AC-4.2 must be restated over an input that exists. As written the phase-skip is unbuildable and untestable for the reason DC-01 names on the receive side: no closed catalogue on the emit side. §8 has no row for this — O-2 covers the *filename* grammar only. | AC-4.2, AC-4.1, AC-4.3, AC-4.5, §8 O-2, DC-01 |
| F-02 | High | Local | **AC-3.5 requires the script to observe a fact C-1 says belongs to the runtime, and the REQ never establishes that it can.** AC-3.5 mandates a report naming "the attempt count" and the phrase "no progress across N attempts". Per H-3 and C-1 the 180,000 ms kill *and the six-attempt retry* are runtime-side, and H-3's own grep evidence is that no attempt-count constant exists under `pdlc/` or `.claude/`. Nothing in the document states how a workflow script learns that attempt *k* of *n* is running, or whether a stall-killed `agent()` call is even re-entered visibly from the script's side versus retried opaquely below it. Under DC-02 ("a stated platform or runtime fact must be measured, and the available primitive list stated in the REQ Assumptions") this is the load-bearing unmeasured predicate of AC-3: if the retry is opaque, AC-3.5 is unsatisfiable as written and no test can be written for it; if it is observable, the REQ must say by what primitive. Note also that AC-3.5 is the only AC in AC-3 that is *not* an authoring-side accommodation, so C-1 does not cover it. No §8 row defers it (O-13 covers the *fault-injection seam* for AC-3.2/3.3 resumption, not attempt-count observability). | AC-3.5, C-1, H-3, DC-02 |
| F-03 | Medium | Local | **AC-3.1 and AC-3.6 have no measurable acceptance threshold, and none is deferred.** AC-3.1's criterion is that the inter-tool-call interval "stays **well inside** the runtime's no-progress window" and that "no single write is **expected to** carry a whole document"; AC-3.6 extends the obligation to edits "of **comparable size**". None of the three phrases is decidable: a 400-line section write and a 40-line section write both satisfy every reading, yet only one of them survives — and H-3's evidence is that the *whole feature* turns on which. AC-3.1 is the primary fix for the defect that cost 71 minutes and 1.34 M tokens for zero bytes, so an unquantified bound leaves the fix's success condition undefined at the requirements layer, which is where a "how much authoring work per write" budget belongs (it is a user-visible pacing NFR, not a fixture detail). State a bound the author SKILLs can be held to and a review can check — e.g. a maximum artifact bytes/lines per single write, or a maximum number of sections per write, or a mandated write-then-commit granularity of one section. §8 has no row: O-6 covers the *retry-prompt contract*, O-7 the *structural-completeness criterion*; neither quantifies pacing. | AC-3.1, AC-3.6, H-3, R-3 |
| F-04 | Medium | Local | **"Dual reviewer approval" is not defined over rounds, so AC-4.1's skip/run outcome is ambiguous on a real branch state.** AC-4.1 skips a phase whose document "already carries dual reviewer approval on the branch", and AC-4.2 derives it from recorded verdicts. Consider the state this harness produces routinely: round *N* has SE = *Approved with minor changes*, TE = *Needs revision*; round *N+1* has TE = *Approved*, and SE's round-*N+1* file records a further finding. Two approving verdicts exist "on the branch", from different rounds — skip or run? The existing convergence gate requires both passes **in the same iteration** (`orchestrate-dev.js:644`, `isPass(verdict1) && isPass(verdict2)`), and AC-4.3 invokes that gate only to fix the set of *acceptable verdict strings*, not the same-round requirement. AC-4.1's "the round at which approval was reached" hints at same-round but does not state it, and AC-4.4's staleness rule is orthogonal (it compares against the document, not across reviewers). This is exactly R-1's laundering risk arriving through a door AC-4.4 does not cover, and a reviewer writing the first test for AC-4.1 must guess. State that dual approval means both reviewers approving in the **same** round index, or state the alternative. | AC-4.1, AC-4.2, AC-4.3, R-1 |
| F-05 | Low | Local | **AC-1.4 does not say which party enforces the no-overwrite rule, and the two readings have different failure modes.** The AC's first sentence instructs the *agent* ("An author or reviewer agent is instructed never to overwrite"); its second promises "a pipeline-level error surfaced to the operator". H-1's own diagnosis is that "the harness's correctness currently depends on agent disobedience", and C-5 says a deterministic file inspection must not cost a model call — both point to script-side detection, with the instruction as belt-and-braces. Say so, otherwise the AC is satisfiable by prompt text alone, which reproduces H-1's root cause one level down. | AC-1.4, C-5, H-1 |
| F-06 | Low | Local | **AC-1.6's budget arithmetic is stated but its interaction with the two artifacts that report it is not.** If a run starts at index 4, "the five-round budget is counted from the round the current invocation starts at" implies the terminal round is 8. Two consequences are unstated: (a) the POSTMORTEM's mandated `Iterations` section is generated as the literal "5 — limit reached" (`orchestrate-dev.js:566`), which would be wrong for a 4→8 invocation; (b) H-2 lists "a re-entered phase restarts at iteration 1 with a fresh five-round budget" as a *defect*, while AC-1.6 grants exactly that fresh budget under new numbering — the reconciliation (AC-2.3 refuses re-entry only when a POSTMORTEM exists, so a halt for any other cause still yields a fresh 5) is inferable but never written. One sentence closes both. | AC-1.6, AC-5.1, H-2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does AC-4's `Targets` set include the three **review** SKILLs? The row lists "the three author SKILLs" only, yet F-01's likely resolution (persisting a machine-readable verdict into the cross-review artifact) is a change to `se-review`/`te-review`/`pm-review`. If that is out of scope, AC-4 needs a different approval input. |
| Q-02 | For AC-2.3, is the refusal per (phase, feature) or per feature? A branch can hold `POSTMORTEM-R-*` and `POSTMORTEM-F-*` simultaneously; the AC says "for that phase and feature", so an unresolved R postmortem would not block Phase F — is that intended, given the R work is by definition upstream of F? |
| Q-03 | AC-3.2 requires partial progress to be "committed". Does that make the author agents' commit cadence itself part of the contract (one commit per section), and if so is that a `Targets` change to the author SKILLs' Git Workflow sections (`pm-author/SKILL.md:25-29`) as well as their numbered procedures? |

## Positive Observations

- The §preamble stopping rule is pasted into the artifact under review, which is precisely the part
  DC-09 says is easy to get wrong and made the difference; the fixed-point escalation clause is
  stated with a counting rule a reviewer can apply mechanically.
- §8 is the strongest part of the document from a testing standpoint. O-10's fixture matrix for
  AC-1.1 already enumerates the exact axes I would have demanded — none / un-suffixed v1 only /
  contiguous / **non-contiguous** / mixed doc-types / mixed roles / non-conforming name — and O-11's
  framing ("how 'would overwrite' is asserted without a real overwrite occurring in the test") shows
  the oracle hazard was anticipated rather than deferred vaguely. O-12 names the `postmortemFailed`
  path at `:586-588` specifically, which is the one arm a lazy implementation would leave dead.
- Negative cases are present where they matter and are named as such: C-4 (clean branch ⇒ behavior
  unchanged) is the falsifying direction for AC-1.1 and AC-2.3; AC-4.4 is the negative for AC-4.1 and
  O-14 explicitly calls it "the one that protects R-1"; AC-2.6 and AC-2.2 are both stated as
  error-surfacing rather than silent-no-op, which is the DC-01 receive-side shape.
- C-5 pre-empts the failure mode where an approval/index/postmortem decision is delegated to a model
  call, keeping all three detections deterministic and therefore unit-testable against injected seams.
- AC-5.1/AC-5.2 are mechanically checkable edits with line references, and O-16 requires their
  disposition to be spelled out so a reviewer need not re-derive them. AC-5.5 is a real, local gate
  (`build-runtime.mjs --check`, `npm test`) that runs without the pipeline — R-4's response is not
  aspirational.
- Deferrals are bound to named successor surfaces (D-RLH-01/02 → new queue rows, D-RLH-03 → runtime
  capability), satisfying DC-08 rather than leaving prose intent.

## Recommendation

**Needs revision**

Exactly what must change:

1. **F-01** — restate AC-4.2's input so it exists: either add the persisted, machine-readable verdict
   field to the cross-review artifact contract (and extend `Targets` to the review SKILLs), or define
   approval over an input the branch already carries. Do not defer this to FSPEC as an oracle
   question — it is a scope question about which artifacts this feature changes.
2. **F-02** — add an Assumptions statement, measured (DC-02), for how a workflow script observes a
   stall-kill/retry, or restate AC-3.5 in terms the script can observe (or defer it explicitly with a
   named successor per DC-08).
3. **F-03** — quantify AC-3.1's pacing bound and AC-3.6's "comparable size".
4. **F-04** — define dual approval with respect to round index.

F-05 and F-06 are one sentence each and need not gate a further round on their own.
