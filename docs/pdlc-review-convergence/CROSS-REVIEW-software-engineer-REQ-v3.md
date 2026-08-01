# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 3
**Scope:** REQ-pdlc-review-convergence v1.1, delta re-review against the v1.1 tree reviewed at iteration 2 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

**The document under review is byte-identical to the one I reviewed at iteration 2.** This is the
finding that determines everything below, so it is stated first and with its evidence.

- The last commit touching `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` is
  `2e1ccec` (*"docs(pdlc-review-convergence): recover Phase R artifacts mis-committed to main"*),
  which is the same commit that carries `CROSS-REVIEW-software-engineer-REQ-v2.md`.
- `git diff 2e1ccec -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` is **empty**, and
  the working tree is clean. There is no v1.2 anywhere on the branch.
- The document's own version row still reads **`| pdlc | draft | Claude + operator | 1.1 | 2026-07-31 |`**,
  its revision note is still headed *"Revision note (v1.1)"*, and §10.6 still maps round-**1** findings
  only. No round-2 disposition exists in the document.
- Spot-checked the three surfaces my round-2 Highs named, all unchanged: AC-4.1 still names
  `appendApprovalAnchors` as the `DOC-BYTES:` writer (also §5 S-2's Emitter column and §6's
  `DOC-BYTES:` row); §5's *crashed* definition still turns on the `REVIEW-MODE: verification` marker;
  AC-3.4 still says only *"inside that same section, after the `VERDICT:` line"* with no adjacency rule.

Consequently the delta protocol's step 3 — *scan only the changed sections* — has an empty set of
changed sections. There is nothing new to review, and **every finding from v2 is open verbatim**. I
have not re-derived them; v2's evidence stands unamended and is cited by reference rather than
restated at length.

I re-ran no verification pass this round: the citation pass and the `orchestrate-dev.js` write-path
pass in v2 were run against `main` at `9486c81`, which is unchanged, over a document that is unchanged.
Re-running them would produce the same result at the cost of a round.

## Round-2 disposition

All seven round-2 findings are **open, unchanged, and unaddressed** — not contested, not answered,
not attempted. Recorded per finding so the operator can see the state without opening v2.

| v2 finding | Sev | Disposition | Evidence that it is still open |
|---|---|---|---|
| F-01 — `DOC-BYTES:` cannot be written by `appendApprovalAnchors` (runs only on the approving round; also the ordering is circular) | High | **open** | AC-4.1 (`REQ:768`), §5 S-2 Emitter (`REQ:381`) and §6's `DOC-BYTES:` row (`REQ:1060`) all still name `appendApprovalAnchors` (M-4a). The function still has one call site, inside `if (gatePass)` (`pdlc/workflows/orchestrate-dev.js:1844-1845`). |
| F-02 — a failed verifier round reads as *crashed*, so AC-2 cannot fire in the target regime | High | **open** | §5's *crashed* definition and AC-2.4 still turn on `REVIEW-MODE: verification`; AC-3.5's Given is still *"round N ≥ 2 dispatched a single verifier **which approved**"* (`REQ:~684`). The `verifier` slug discriminator is still unused by the comparability test. |
| F-03 — AC-3.2(2)'s "not counted" rule has no reader | High | **open** | AC-3.2(2) unchanged; §5's *blocking count* is still defined as the trailer read by `extractFileVerdict` → `parseVerdict`. No S-10, no choice recorded in R-5. |
| F-04 — the in-file trailer's placement is unspecified, and the anchor block makes a trailer-less file *malformed* not *unavailable* | Medium | **open** | AC-3.4 still reads *"inside that same section, after the `VERDICT:` line"* with no adjacency clause (`REQ:653-668`); AC-2.7's *unavailable* case is unamended. |
| F-05 — AC-1.5(3)'s operator reset has no durable observable | Medium | **open** | §5's durability table still gives AC-1.5 one row (the cross-review basenames); no POSTMORTEM-window row was added. |
| F-06 — §4.7 pins two "unmeasured at" claims to `d11dad5`, declared unreachable by the header | Low | **open** | §4.7 unchanged. |
| F-07 — `7bc559a` is called a merge commit; it is single-parent | Low | **open** | §3 unchanged. |

The four mechanical fixes (MF-1 … MF-4) are likewise unapplied. They do not block and are not
re-filed as findings.

**Blocking-finding count: 5 (3 High, 2 Medium), identical to round 2.** The count is non-decreasing
across two consecutive rounds. Under the document's own binding stopping rule this is a fixed point —
see the Recommendation.

## Findings

F-01 … F-05 are round-2's F-01 … F-05, carried forward **unchanged in text, severity and required
change**. I have deliberately not rewritten them: re-phrasing an open finding across rounds makes the
trajectory unreadable and invites the author to answer the phrasing rather than the defect. Read them
at `docs/pdlc-review-convergence/CROSS-REVIEW-software-engineer-REQ-v2.md` — the section headings there
are the authoritative statements, and the *Required change* paragraph of each is still exactly what
would close it.

F-08 is new, and is not about the document's content.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `DOC-BYTES:` cannot be written by the writer AC-4.1 names: `appendApprovalAnchors` runs only on the approving terminal round (`pdlc/workflows/orchestrate-dev.js:1844-1845`), so on every failed round — the only rounds AC-4 measures — growth is `no-anchor` and AC-4.5 escalates to the full panel, making §2's target regime unreachable by construction. The ordering is separately circular: the anchor is asked for when round N *opens*, before round N's files exist. **Carried from v2 F-01, unaddressed.** | AC-4.1, S-2, §6 `DOC-BYTES:` row, AC-4.2, AC-4.5, §2 |
| F-02 | High | Local | The *crashed* predicate mis-classifies every **failed** verifier round: `REVIEW-MODE: verification` is written only on an approving round (AC-3.5's Given), so a failed verifier round is "one file with no marker" = *crashed*, and AC-2.1 only ever compares failed rounds. AC-2 therefore cannot fire in the `dual, verifier, verifier` regime AC-2.6 row 2 says it fires in. **Carried from v2 F-02, unaddressed.** | §5 *crashed* / *panel shape*, AC-2.4, AC-2.6, AC-3.5(a)(e) |
| F-03 | High | Local | AC-3.2(2)'s "not counted" rule has no reader. §5 defines the blocking count as the JSON trailer read by `extractFileVerdict` → `parseVerdict`; nothing can subtract a findings-table row from a single integer. The document still reads three ways and the halt decision turns on it. **Carried from v2 F-03, unaddressed.** | AC-3.2(2), S-9, §5 *blocking count*, AC-2.1 |
| F-04 | Medium | Local | AC-3.4 fixes *that* the count trailer is in the file but not *where*; `parseVerdict` requires it to be the first non-empty line after `VERDICT:` (`pdlc/workflows/orchestrate-dev.js:440-451`), and the anchor block appended after it makes a trailer-less file parse *malformed*, never *unavailable* — inverting AC-2.7's operator-facing distinction. **Carried from v2 F-04, unaddressed.** | AC-3.4, AC-2.7, AC-2.3, S-5 |
| F-05 | Medium | Local | AC-1.5(3)'s operator reset has no durable observable: nothing on the branch records which rounds preceded the `RESOLVED: yes` marker, and §5's own bar says an AC stated over non-durable state is a defect in the document. **Carried from v2 F-05, unaddressed.** | AC-1.5(3), §5 durability table, AC-1.1 |
| F-06 | Low | Local | §4.7 still pins both "unmeasured at" claims to `d11dad5`, which the header declares unreachable from `main`. **Carried from v2 F-06, unaddressed.** | §4.7 |
| F-07 | Low | Local | §3 calls `7bc559a` a "merge commit"; it is single-parent. Wording defect only. **Carried from v2 F-07, unaddressed.** | §3 BL-01, §3 closing paragraph |
| F-08 | Low | Process | A review round was dispatched against a document that had not been revised since the previous round. The optimizer step between iterations 2 and 3 produced no commit — `git diff` on the REQ across the two review rounds is empty and the version row still reads 1.1 — so round 3 consumed one of five rounds of the phase's budget and can only reproduce round 2's output. The loop has no guard that a re-review's target changed since the reviewer last approved-or-blocked it; **this is the exact class of waste this REQ's AC-1 and AC-2 exist to bound**, observed on the REQ that specifies them. Recorded as Low/Process because the fix is to the pipeline, not to this document; it does not affect the recommendation, which F-01 … F-05 already determine. | n/a — orchestration |

### F-08 (Low, Process) — a re-review round was dispatched with no intervening revision

Stated in full because it is new and because it is the only thing this round can contribute.

Evidence: the REQ's last commit is `2e1ccec`, the same commit that carries my v2 cross-review;
`git diff 2e1ccec -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` is empty; the tree is
clean; the version row reads 1.1 and §10.6 maps round-1 findings only.

Two things follow that are worth recording for harvest rather than for this document's author:

1. **The round is not free.** `MAX_REVIEW_ROUNDS = 5`. Round 3 of 5 has now been spent producing a
   verdict that was already on disk. If rounds 4 and 5 go the same way the phase halts with a
   POSTMORTEM whose recorded cause would be "non-convergence", when the actual cause is that the
   author step did not run.
2. **A cheap structural guard exists.** The review loop already derives its round window from the
   basenames on disk (`deriveRoundWindow`, `pdlc/workflows/orchestrate-dev.js:2151`) and already
   computes a content hash of the reviewed document for the tier-1 approval anchors
   (`appendApprovalAnchors`, `pdlc/workflows/orchestrate-dev.js:1934`). A re-review whose target's
   hash equals the hash recorded by the previous round is provably a no-op and could be short-circuited
   to the previous verdict, or reported as an author-step failure, without any new mechanism. This is
   adjacent to — but not the same as — AC-2's fixed-point stop, which measures *findings*, not
   *document bytes*: AC-4's `DOC-BYTES:` would give growth `0`, which AC-2 does not currently read.

I am **not** filing this as a blocking finding against the REQ. It contests neither the user need nor
an AC, and under the document's own stopping rule it is not a REQ revision. It belongs in the run
report and, at harvest, in process learnings.

## Questions

Q-01 … Q-05 from v2 are all still open and are not restated here; they are the fastest route into
F-01 … F-05 and the author should answer them from
`docs/pdlc-review-convergence/CROSS-REVIEW-software-engineer-REQ-v2.md`. One new question, addressed to
the operator rather than to the author:

| ID | Question |
|----|---------|
| Q-06 | Did the authoring step between rounds 2 and 3 fail, or was it not dispatched? The REQ has no round-2 revision note, no version bump and no commit. Whichever it is, round 3 has consumed a round of a 5-round budget without a target to review, and rounds 4 and 5 will do the same unless the author step runs. |

## Positive Observations

Nothing changed, so nothing new can be observed. v2's six positive observations stand as written —
in particular that §5's durability table generalises the round-1 Highs into one property of the
document, that §5's closed catalogue is a complete DC-01 discharge, and that AC-2.6's
reachable-sequence table is a model of how to retract a claim. None of that is diminished by this
round; it is simply unrepeated.

One thing worth saying positively about the *state*: all five open findings remain closable without
new mechanism. F-01 needs a writer named that runs per round; F-02 needs the comparability test
stated over the on-disk role-slug set; F-03 needs one of two readings the document already contains to
be chosen; F-04 and F-05 are one clause each. That estimate is unchanged from round 2 and is not
degrading with time — the document is not drifting, it is stationary.

## Recommendation

**Needs revision** — three High and two Medium findings, all carried unchanged from round 2 because
the document was not revised between the rounds. One new Low, `Process`-scoped, about the empty round
itself.

### The stopping rule fires

The REQ's own preamble is binding on this phase:

> *"Two consecutive rounds of non-decreasing blocking-finding count is a fixed point: escalate to the
> operator, do not iterate."*

Blocking count: round 1 = 10, round 2 = 5, **round 3 = 5**. Rounds 2 and 3 are non-decreasing. The
condition is met on my side and I am reporting it as the preamble instructs rather than iterating.

The preamble anticipates a fixed point caused by genuine disagreement. This one is not that: the
count is unchanged because the *input* is unchanged, not because the author and I have converged on an
irreconcilable reading. So the escalation carries a specific and cheap remedy — **run the authoring
step against my v2 findings, then re-review** — rather than the operator adjudication the clause
usually implies. I would not want an operator reading a POSTMORTEM to conclude these five findings are
contested. They have not been answered.

### What must change to close this out

Unchanged from v2, restated in one line each so the author does not have to open the previous file:

1. **F-01** — name a writer for `DOC-BYTES:` that runs on **every** round, at a moment when the round's
   files exist ("after round N's reviewers return, before AC-2 is evaluated"), and state the growth
   formula over endpoints that are both in the past. Or withdraw AC-3's single-verifier path and §2's
   target regime as structurally unreachable.
2. **F-02** — state the comparability test over the on-disk role-slug set (`{verifier}` vs
   `{software-engineer, test-engineer}`, anything else *crashed*), which every round produces
   including failed ones; keep the marker for the approval path only, or widen AC-3.5's Given so the
   marker is written on every verifier round.
3. **F-03** — choose reading 1 (re-derive from the findings table; then add its grammar as S-10 and
   restate §5 and AC-2.1 over it) or reading 2 (the verifier's own trailer excludes it; then record in
   R-5 that this half of S-9 is directive, not enforced). Say which in AC-3.2(2).
4. **F-04** — in AC-3.4, require the trailer to be the **first non-empty line following** the
   `VERDICT:` line, with the anchor block after it; restate AC-2.7's *unavailable* case over what is
   then actually observable.
5. **F-05** — name the durable surface for AC-1.5(3)'s reset offset (the POSTMORTEM's recorded
   `rounds {first}..{last}` window is the natural one) and add the row to §5's durability table.

F-06, F-07 and MF-1 … MF-4 are mechanical and do not block.

### Explicit non-findings (carried)

Recorded again so a later round does not re-raise them: I do not contest any of the six decisions; I do
not file R-5's known unenforceability of AC-5 / AC-4.6; I do not file AC-3.5(c)/(d) or R-6's mixed-panel
integration risk, which §8's obligations correctly discharge downstream; I have no blocking finding
against REQ-RCV-05 or REQ-RCV-06, which are approvable as written. I raised no
`## Measurement Required` items.

## Verdict

**Needs revision.** The REQ is byte-identical to the v1.1 I reviewed at iteration 2
(`git diff 2e1ccec` on the file is empty; the version row still reads 1.1). All seven round-2 findings
are therefore open verbatim: three Highs — `DOC-BYTES:` and `REVIEW-MODE:` are assigned to
`appendApprovalAnchors`, which runs only on the approving round, so both anchors are absent on
precisely the failed rounds AC-2 and AC-4 read (F-01, F-02), and AC-3.2(2)'s "not counted" rule has no
reader that can execute it (F-03) — plus two Mediums (F-04 AC-3.4's missing placement rule, F-05
AC-1.5(3)'s missing reset observable) and two Lows. One new Low, `Process`-scoped: the round was
dispatched with no intervening revision (F-08). Blocking count 5, unchanged from round 2, so the
document's own two-round fixed-point rule fires — but because the input did not change, not because the
findings are contested. The remedy is to run the authoring step against v2's required changes and
re-review, not operator adjudication.

VERDICT: Needs revision
{"high": 3, "medium": 2, "low": 3}
