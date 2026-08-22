# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md (v1.1, bytes unchanged)
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** upstream-cascade confirmation — does DECISIONS still hold as approved against TSPEC v1.2 at HEAD? Not a re-review of DECISIONS.

## Context

My approval of DECISIONS v1.1 (`CROSS-REVIEW-test-engineer-DECISIONS-v2.md`, *Approved with minor
changes*, 0 High / 2 Medium / 2 Low) was recorded against `REVIEWED-COMMIT: 020b74a0` with
`UPSTREAM-STATE: TSPEC sha256:3cd713c0…`. TSPEC is now `sha256:458e9ec6…` (v1.2). REQ
(`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) are byte-identical to the versions my approval
was taken against, so this confirmation is entirely about the TSPEC delta.

**The delta, measured rather than described.** `git diff 0c70e900..b4a628b8 --
docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` is 26 insertions / 7 deletions across five hunks:

| TSPEC hunk | What changed | Relationship to my v2 review |
|---|---|---|
| §2.4 (new block after the announcement table) | The catalogue is closed **by rule** — *a notice carries a provenance token iff the resume decision emits it about a resolved start point* — with a one-row table naming the excluded notice (invalid `implementation.startWave`) and its exclusion reason, and the statement that the exclusion is what holds the changed-assertion count at three. | This is **erratum 1 of the two I routed in v2**, landed. |
| §3.1 ("Why codes and not strings") | "Four of the seven reasons interpolate" → "**Three** of the seven … `feature-mismatch`, `head-unreachable`, `over-count` … carrying four interpolated values between them". | **Erratum 2 of the two I routed in v2**, landed, and landed in the exact form DECISIONS O-8 already carried. |
| §6.1 DEC-WVR-06 row | Same off-by-one corrected in the rejected-alternative rationale ("three of the seven … four values in total, §3.1"). | Consequential to erratum 2. |
| §6.1 DEC-WVR-02 alternative (b) | "adds a `main()` parameter and a **runtime capability**" → "the probe already runs through the existing `_git` seam … so extraction would add a `main()` parameter and one more adapter binding, **not a host capability** … the cost is plumbing, not capability". | Routed by SE, not by me. Moves TSPEC onto the position DECISIONS O-3 already held. |
| §6.4 RT-1; §3.2 | `orchestrate-dev.js` restated as the largest tracked *source module* (734,711 B) and second-largest tracked file behind generated `dist/pdlc-cli.mjs` (738,924 B); one duplicated clause (`"on the decision on the decision"`) removed. | RT-1 is the correction of my v1 F-04 as it lands upstream; the §3.2 fix is cosmetic. |

**What I checked, beyond the item list (DEC-ERR-03).** The items landing is necessary, not
sufficient. I re-read every TSPEC passage DECISIONS leans on, at v1.2, and compared it to what
DECISIONS says about it: §2.4's announcement table and its three-changed-assertion subsection (cited
by DEC-WVR-03 and by O-5), §3.1's frozen catalogues (cited by O-8 and DEC-WVR-06), §3.4's seam table
and its "the diff adds no parameter to `main()`" discharge of REQ C-3 (cited twice — O-3 and
DEC-WVR-02), §6.1's decision ids (cited for the shared-id convention), §6.4 RT-1/RT-2/RT-6 (cited in
Risks), and OB-F1/OB-F4 (cited in the open table). Four of those six citations are now *more*
faithful than they were at my approval, because the erratum moved TSPEC onto DECISIONS' side of two
disputes. The two that regressed are the two places where DECISIONS quotes the **old** TSPEC text in
order to raise the erratum — those raises are now false statements about upstream, and they are this
confirmation's findings.

## Options Considered

Three dispositions were available for this confirmation, and the choice between them is what the
`FINDING:` tags encode. I record them because the second and third are live readings that a reader
of the findings table could reasonably expect.

### C-1 — Confirm unchanged: the routed items landed, so DECISIONS holds *(rejected as insufficient)*

Both items I routed landed, and both landed in the form DECISIONS already carried — the count is
three, and the exclusion is by rule. If the item list were the whole scope, this confirmation would
be a one-line approval. It is not: DEC-ERR-03 makes the question *is this document still a faithful
compression of upstream at HEAD*, and a document that **quotes** the pre-erratum upstream in order
to complain about it becomes unfaithful at exactly the moment the complaint is honoured. Rejected:
it would leave two false statements about upstream standing in an approved document.

### C-2 — Treat the two stale erratum raises as High, halting the round *(rejected)*

`docs/_decisions/DECISIONS-review-severity-bars.md` **DEC-ERR-01** is directly on point: routing a
question the upstream has already decided "is **not** a demoted finding: it is a false statement in
a hand-off section, and it is scored on **what it costs downstream** (High when a downstream task is
authored against the losing side)." The bar is a cost test, not a reflex, so I applied it rather
than cited it:

- **Which side did DECISIONS take?** The winning one, in both cases. O-8 states the count as three
  reasons carrying four values — which is now verbatim what TSPEC §3.1 says. O-5 and DEC-WVR-03
  state the exclusion criterion — *a notice carries a token iff the resume decision emits it about a
  resolved start point* — which is now **word-for-word** the rule TSPEC §2.4 adopted. There is no
  losing side for a PLAN or PROPERTIES task to be authored against; the two documents now agree on
  the substance and disagree only about whether the disagreement is over.
- **What can a downstream author get wrong?** Only the provenance of the agreement, not its content.
  A PROPERTIES author transcribing DEC-WVR-03's set-equality oracle reads "the announcing rows
  transcribed from TSPEC §2.4, and the excluded notices enumerated in the same assertion as
  literals". At v1.2 that instruction is executable as written — §2.4 carries six announcement rows
  and one named exclusion row, so the transcription produces the same assertion whether or not the
  author noticed O-5's stale parenthetical. **The oracle does not change.** That is the whole reason
  this is not High.

Rejected: scoring these High would halt Phase D over two sentences that cost no test its
falsifiability and no task its correctness.

### C-3 — Approve with the two stale raises filed as delta findings *(chosen)*

Chosen. It records the defect where the harvest and the next revision can both see it, keeps the
phase moving, and keeps the severity honest in both directions — the finding is real (an approved
document asserting something false about its own upstream is a defect, not a nit), and it is not
gating (nothing downstream is misdirected).

## Decision

**DECISIONS still holds as approved against TSPEC v1.2, with two stale upstream raises to correct in
its next touch.** No High finding, so this confirmation approves.

### Citation-by-citation fidelity against TSPEC v1.2

Each row is a claim DECISIONS makes *about* TSPEC, re-read at HEAD rather than trusted from my v2
pass. "Faithful" means the upstream text still says it, and still says it the same way.

| DECISIONS site | What it asserts about TSPEC | TSPEC v1.2 at HEAD | Verdict |
|---|---|---|---|
| O-3; DEC-WVR-02 "Constraints that forced this shape" | TSPEC §3.4's "the diff adds no parameter to `main()`" is a structural discharge of REQ C-3 | §3.4 verbatim: "**No new seam is introduced.** … the diff adds no parameter to `main()` and no capability to the runtime adapter." | **Faithful** — untouched by the erratum |
| O-3 | Extracting the probe is "a new *seam over an existing capability*, not a new host capability (the adapter's `rtGit` already answers `merge-base`)" | §6.1 DEC-WVR-02 (b) now reads "the probe already runs through the existing `_git` seam, which `runtime-adapter.js` binds as `rtGit` for both bundles … not a host capability. The cost is plumbing, not capability" | **Faithful, and newly so** — the erratum moved TSPEC onto this text rather than away from it |
| O-3 | The seam denominator: a 35th injected seam, a 37th parameter on a signature destructuring 36 | §3.4's seam table names six seams, all pre-existing; the denominator claim is DECISIONS' own re-derivation against `origin/main` `345ae358`, re-run in my v2 and unaffected by this delta | **Faithful** |
| O-5; DEC-WVR-03 | The exclusion criterion for "each announcing outcome" | §2.4's new block states the identical rule as a block quote | **Faithful on the rule** |
| O-5 closing parenthetical | "TSPEC §2.4's announcement table omits the invalid-pointer notice entirely rather than excluding it by rule; that is an upstream gap" | §2.4 now carries "**The catalogue is closed by rule, not by omission**" plus a named exclusion row | **Stale — F-01** |
| DEC-WVR-03; Risks | Exactly three shipped whole-string assertions change, each named with its replacement in TSPEC §2.4 | §2.4's subsection "The three shipped assertions that do change" is intact, and the new block's closing sentence reinforces it ("the shipped assertions that do change remain exactly three") | **Faithful, and better grounded than at approval** |
| DEC-WVR-03 Consequences | The set-equality oracle transcribes "the announcing rows … from TSPEC §2.4", excluded notices enumerated as literals (invalid-`startWave` notice, IG-6 silence) | §2.4 has six announcement rows (three token-carrying, one silent IG-6, two operator/record resume rows) plus the one excluded notice row | **Faithful and now executable** — at v1.1 the transcriber had to supply the exclusion themselves |
| O-8; DEC-WVR-06 | Three of the seven reasons interpolate, carrying four values, named as feature name / short sha / wave counts | §3.1: "**Three** of the seven … `feature-mismatch`, `head-unreachable` and `over-count` — carrying four interpolated values between them"; §6.1 DEC-WVR-06 agrees | **Faithful** — the count DECISIONS held is now upstream's |
| O-8 closing parenthetical | "TSPEC §3.1 says 'four of the seven reasons interpolate'" | §3.1 says three | **Stale — F-02** |
| Risks, rebase-churn bullet | Largest tracked source module 734,711 B; second overall behind generated `dist/pdlc-cli.mjs` at 738,924 B | §6.4 RT-1 now carries the identical two figures and the `git ls-tree` provenance | **Faithful** |
| Open table | TSPEC OB-F1 (rebase), OB-F4 (baseline promotion), RT-6 (advisory budget) | All three present and untouched by the delta | **Faithful** |

Nothing DECISIONS leans on has moved out from under it. Both stale rows are the same defect class:
a raise that outlived the thing it raised.

### Status of my v2 findings

DECISIONS' bytes have not changed since `020b74a0`, so all four v2 findings remain open exactly as
written. They were non-gating then and are non-gating now; I re-file them tagged `inherited` so the
round routes them back to Phase D's ordinary revision loop rather than losing them, not because this
delta touched them.

| v2 ID | Severity | Still open? | Effect of the TSPEC delta on it |
|---|---|---|---|
| F-01 | Medium | Yes | None. DEC-WVR-04's `head`-presence conditional is a claim about the shipped write site, not about TSPEC. |
| F-02 | Medium | Yes | None. DEC-WVR-05's contiguity trigger still has no Consequences row obliging an observer. |
| F-03 | Low | Yes | **Sharpened by the delta.** O-5 discriminates the past-the-end notice by code location ("emitted **inside** the resume decision"); §2.4's new rule discriminates by subject matter ("about a *resolved start point*") — the better discriminant, and now the upstream one. |
| F-04 | Low | Yes | None directly, but see F-01 of this round: the v1.1 revision-history row will need a v1.2 successor when the stale raises are corrected. |

## Consequences

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
