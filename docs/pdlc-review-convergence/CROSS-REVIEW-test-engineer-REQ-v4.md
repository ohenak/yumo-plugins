# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 4
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v3.md` (baseline `2e1ccec`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `4df1199`, clean.

## 1. Delta scan

This round is the opposite of round 3: the document really changed, and substantially.

```
git rev-parse 2e1ccec:docs/.../REQ-pdlc-review-convergence.md → ab4d55f…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → 5258bbb…
git diff --stat 2e1ccec HEAD -- …/REQ-…md → 354 insertions(+), 75 deletions(-)
bytes: 116,569 → 151,011   (+34,442)
```

The revision is v1.1 → v1.2 and it answers both panels' round-2/3 lists. Changed sections, and the
only ones scanned below: the header (Citation-baseline paragraph, Cross-Reviews row, revision note),
§3 BL-01, §4.3 M-3d, §4.7, §5 (*panel shape*, *crashed*, *round growth*, new *zero-delta*; the
durability table; the closed catalogue, now eleven strings with a two-writer table), AC-1.5(4),
AC-2.2, AC-2.4, AC-2.7, **new AC-2.8**, AC-3.2(2), AC-3.3, AC-3.4, AC-3.5(a)/(e), **AC-4.1**,
AC-4.7, AC-6.4, §6 (three rows changed, one added), N-3/N-7, O-4/O-10 and **new O-12**, R-5, **new
R-8**, §9.3, and new §10.7. Sections I approved earlier and that did not change — §1, §2, AC-1.1–1.4,
AC-2.1/2.3/2.5/2.6, AC-3.1/3.6/3.7, AC-4.2–4.6, AC-5, AC-6.1–6.3/6.5–6.8 — are not re-litigated,
except where a changed section is stated *over* one of them (AC-3.1 and AC-4.2 are read in §3 F-01
only as the receivers of AC-4.1's restated formula).

Growth into this round is +34,442 bytes — under this REQ's own AC-4.2 that is **new-mechanism**
(> 12,000), and AC-3.1 would therefore have escalated round 4 to the full panel. It did, which is
the right outcome for a revision that adds a new AC (AC-2.8), a new writer, two new catalogue strings
and a new clause to AC-1.5.

## 2. Disposition of round-3 findings

Seven were open (3 High, 2 Medium, 2 Low). **All seven are resolved**, and each was checked against
the document rather than against §10.7's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-4.1 names `appendRoundAnchors`, an unconditional per-round writer that runs *"after every round's reviewers return, whatever verdict they returned"*; `appendApprovalAnchors` keeps only `APPROVAL-HASH:`/`REVIEWED-COMMIT:`. §5 gains a normative two-writer table; §6's `DOC-BYTES:` and `REVIEW-MODE:` rows are re-assigned. The read instant (`t0`, round-open) is separated from the persist instant (after the round's files exist), which was the second half of the finding. A failing round now carries the anchor, so AC-3.1's single-verifier path is no longer structurally dead *on this axis* — but see F-01 below, which is about the **boundary the classification is taken across**, not about the writer. |
| F-02 | High | **Resolved** | AC-1.5(4) adds `WINDOW-START: {N}`, written by the loop to the resolved POSTMORTEM, with an explicit one-shot consumption rule and a fail-closed receive side (absent / non-integer / duplicated-unequal ⇒ no reset). §5's durability table gains both rows, with the fail-closed default *"treated as 1"*. The admitted-round set of a reset document is now derivable: `{N … N+2}` where `N` is the marker's value. The residual defect is the *file* the marker lives in — F-02 below. |
| F-03 | High | **Resolved** | AC-3.2(2) chooses reading 2 explicitly: the verifier excludes the finding from *its own* trailer, *"the loop performs no subtraction and parses no findings table"*, and `blocking(N)` is stated to have *"exactly one definition everywhere in this REQ"*. §5's S-9 receiver column, N-3 (*"the findings table is not a parsed data contract"*) and R-5 all agree. The expected `blocking(N)` of a verifier round is now derivable from the trailer alone. R-5 also states the failure *direction* (an ignored clause raises the count, so AC-2 can only halt earlier) — that is the right thing for a test author to know about an unenforceable clause. |
| F-04 | Medium | **Resolved** (with a new contradiction — F-03 below) | AC-4.7's `notice` column is now *"a possibly-empty, ordered list"* with a six-row precedence table, and O-10 names the crashed-round row as a required PROPERTIES case. The cell for a crashed round is derivable. |
| F-05 | Low | **Resolved** | AC-3.5(e) reads *"all six cases below"* over a six-row table; §5's S-1 row says *"all **six** rows"*. |
| F-06 | Low | **Resolved** | AC-6.4 adds two exempt regions: fenced blocks (adopting `scanLines`) and a catalogue row's own `Example` cell. I re-ran the extraction over the whole v1.2 file: the only backticked colon-digit token that is not C-1/C-2 is `` `:1574` `` at line 1215, inside the C-4 row — exempt. The document is no longer a counter-example to its own rule. |
| F-07 | Medium | **Resolved** | AC-2.8 makes a zero-delta round a halt with its own reason (S-11), on a byte-**and**-hash test (`DOC-SHA256:`, S-10), with a total, fail-**open** receive side and an explicit *"not counted against AC-1's budget"*. R-8 records the authoring-side residue and §9.3 binds it. This is a better answer than the one I asked for: the SHA endpoint removes the false-positive I did not raise (two revisions of equal length). Its composition with AC-1.4/AC-1.5 is where F-04 below lands. |

Mechanical fixes MF-01 (§4.7 restated at `9486c81`), MF-02 (*"four inputs, three reasons"* in S-2 and
AC-4.1) and MF-03 (the header now states the baseline is a fixed ancestor and that navigation at a
later commit is by symbol + literal) are all applied. I re-verified MF-03's premise rather than the
prose: at `9486c81`, `appendApprovalAnchors`'s call site **is** `pdlc/workflows/orchestrate-dev.js:1845`,
so v1.1's citations were correct at the stated baseline and the header's new paragraph is the right
fix. MR-03 is carried unchanged. Q-01 → N-7/AC-3.3, Q-02 → AC-2.2, Q-03 → AC-3.4/AC-2.7 row 4,
Q-04 → R-8: all four are now answered in the document.

I also verified the two new citations in AC-6.4's exemption 1 at the stated baseline: `scanLines` is
at `pdlc/workflows/orchestrate-dev.js:569` and the JSDoc carrying *"a quoted example anchor cannot
fabricate an ambiguity"* is at `pdlc/workflows/orchestrate-dev.js:1907-1910`. Both exact.

## 3. Findings

Every finding below is **new** and lies in a section this revision changed. All six ids are fresh;
none is a re-file of a round-2/3 finding.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-4.1's restated growth formula moves the classification one round into the past, so round 2's panel — the most common decision the mechanism makes — is not derivable, and under the formula as written it is *always* the full panel.** See §3.1. | AC-4.1, AC-4.2, AC-4.5, AC-4.7 `growth-bytes`, AC-3.1, AC-2.6 row 2, §5 *round growth* |
| F-02 | High | Local | **AC-1.5(4)'s `WINDOW-START:` anchor is written into `POSTMORTEM-{phase}-{feature}.md` — a fixed path that AC-1.4's halt path writes again on the next halt — and the REQ never says whether the second write overwrites or appends. Both branches are wrong, and one of them is an unrecoverable dead branch.** See §3.2. | AC-1.5(4), AC-1.4, AC-1.1, §5 durability table rows 3–4, AC-2.8 |
| F-03 | Medium | Local | **AC-2.2 and AC-4.7 give different `notice` cells for the same round.** AC-2.2's new co-occurring-halt paragraph states that on the last admitted round the fixed point and the budget can both be satisfied and *"the `notice` cell then carries S-3 and S-4 in that order"*. AC-4.7's precedence table, added in the same revision, puts S-3 and S-4 on one row and asserts *"at most one of the two can appear on a round"*. A test author deriving the exact cell — which AC-4.7 says must be derivable *"character for character, from this document alone"* — gets `fixed-point: …; budget-exhausted: …` from one AC and a single notice from the other. This is my round-2 F-04 defect shape reproduced by its own fix, one level down: the co-occurring case is now *named* but still not *derivable*. Fix: delete the "at most one of the two" clause and split S-3 and S-4 into two precedence rows, or state in AC-2.2 which one is suppressed. | AC-2.2, AC-4.7 precedence rows 1–2, §5 row-schema paragraph, O-10 |
| F-04 | Medium | Local | **AC-2.8's halt is not composed with AC-1.4's halt protocol or AC-1.5(4)'s one-shot reset, so the expected operator-visible sequence after a zero-delta halt is underivable — and on one reachable path the halt is self-inflicted.** See §3.3. | AC-2.8, AC-1.4, AC-1.5(3)(4), AC-2.1, §5 durability table |
| F-05 | Low | Local | **AC-1.5(1) hard-codes the budget halt string as `rounds 1..3 of 3`, which is wrong for every reset window.** After clause 4 writes `WINDOW-START: 4`, the admitted rounds are 4…6 and the halt on entering round 7 must render `rounds 4..6 of 3` — S-4's catalogue row (as amended in this revision) explicitly says the string has *"three integer slots"*, exactly so this can vary. Clause 1 was written before clause 4 existed and was not re-read against it. A PROPERTIES author asserting the halt string on a reset branch has two candidate literals. Fix: state clause 1's literal as `rounds {start}..{start+2} of 3` and give the round-1 window as the example. | AC-1.5(1), AC-1.5(4), §5 S-4 |
| F-06 | Low | Local | **The closed anchor set is enumerated twice, with different members.** AC-2.7's new observation table (row 4) lists five anchor keys — `APPROVAL-HASH:`, `REVIEWED-COMMIT:`, `REVIEW-MODE:`, `DOC-BYTES:`, `DOC-SHA256:` — as the lines the trailer reader must skip; AC-3.4's corresponding bullet, edited in the same revision, lists four and omits `DOC-SHA256:`, the key this revision added. AC-2.7 says the set *"is fixed by §5's catalogue"*, so §5 is the authority and AC-3.4 is simply stale — but the skip list is the receive-side rule that keeps *unavailable* reachable, and a TSPEC author implementing from AC-3.4 writes a reader that reports `malformed` on a trailer-less verifier round whose first anchor happens to be `DOC-SHA256:`. Fix: replace both enumerations with a reference to §5's catalogue, or add the fifth key to AC-3.4. | AC-3.4 bullet 2, AC-2.7 table row 4, §5 S-10 |

### 3.1 F-01 in full — the growth boundary is one round stale

AC-4.1 now states the formula as `growth = DOC-BYTES(round N) − DOC-BYTES(round N−1)` and justifies
it with *"Both endpoints are **in the past** when round N+1's panel is selected, so AC-4.2 reads only
anchors that already exist on the branch."* AC-4.2 agrees: *"Given: a measured round growth `g`.
When: it selects round N+1's panel."* §5's new *round growth into round N* entry says the same.

So the quantity that selects **round N+1's** panel is the growth **into round N** — the revision that
round N's reviewers have already read. The revision round N+1's verifier must actually read cold is
the one the optimizer produced *after* round N filed its findings, i.e. `DOC-BYTES(N+1) −
DOC-BYTES(N)`, and nothing classifies it. AC-4's stated purpose — *"AC-4 stops a genuinely large
revision from slipping past a verifier that is not equipped to read it cold"* (REQ-RCV-04 preamble) —
is not achieved by the formula as written: a 25 KB revision written in answer to round N's findings
is judged by the size of the *previous* revision.

Two consequences, and the finding stands under either reading of AC-3.1:

1. **Read literally (AC-4.1/AC-4.2/§5): round 2 is always the full panel.** Round 2's panel is
   selected from the growth into round 1. There is no round 0 and no `DOC-BYTES(0)`; AC-4.7's own
   column definition says `growth-bytes` is *"empty for round 1"*. Under AC-4.1's receive-side table
   that is *"No `DOC-BYTES:` line …"* at an endpoint ⇒ `no-anchor` ⇒ unmeasurable ⇒ **AC-4.5
   dispatches the full panel**. Every run therefore reads `dual, dual, …` at rounds 1–2. AC-3.1's
   *"every round N ≥ 2 dispatches a single verifier"* is contradicted for N = 2 in **every** run;
   AC-2.6's target-regime row `dual, verifier, verifier` becomes unreachable, and so does its
   `dual, verifier, dual` row; and §2's cost claim — the saving that motivates REQ-RCV-03 — is
   halved silently. This is the same class of defect as my round-2 F-01 (a mechanism that is
   structurally dead on the rounds it exists for), relocated from the *writer* to the *boundary*.
2. **Read as AC-3.1 intends** — *"unless AC-4 classified round N−1's revision as new-mechanism"*,
   where "round N−1's revision" is the revision produced *in answer to* round N−1, i.e. the delta
   into round N — then the later endpoint is the document **as it stands at round N's open**, which
   is not yet a durable anchor when the panel is chosen, and AC-4.1's *"both endpoints are in the
   past"* justification is false.

The two readings give opposite panels for round 2, and the document contains both. A test author
cannot write the panel-selection property at all: the single most-exercised expected value in the
whole REQ (`round 2 ⇒ {verifier}` or `round 2 ⇒ {software-engineer, test-engineer}`) is
underivable, and O-10's new *"a failed verifier round comparing as `{verifier}`"* case cannot be set
up without knowing which.

**The fix is already in the document, in AC-2.8.** AC-2.8 reads the reviewed document fresh *"before
it dispatches round N's reviewers"* and compares that fresh read against round N−1's **anchor**.
That is exactly the shape AC-4 needs and exactly what v1.2's own revision note promises — *"the
growth formula is restated so that only the **earlier** endpoint has to be durable"* — a promise the
body does not keep, because it made **both** endpoints durable by shifting the window back a round
instead. State AC-4.1 as: at round N's open the loop reads the document (one read, shared with
AC-2.8), computes `growth = bytes(now) − DOC-BYTES(N−1)`, classifies it, and selects **round N's own**
panel from it; the anchor it then persists into round N's files is that same `bytes(now)`. Round 1 is
then the only unclassified round, which is correct — it is dual by AC-3.1 regardless.

### 3.2 F-02 in full — the reset anchor lives in a file the halt path rewrites

AC-1.5(4) makes `WINDOW-START: {N}` the durable origin of the round window, and §5's durability table
now derives *"first round of the current window"* and *"reset consumed"* from it. Both rows read one
file: `POSTMORTEM-{phase}-{feature}.md`. AC-1.4 — unchanged, and explicitly reaffirmed by this
revision — says a halt *"halts the way it halts today — writing `POSTMORTEM-{phase}-{feature}.md`"*.
That is a fixed path, not versioned like `CROSS-REVIEW-…-v{N}` or `CODE_REVIEW-…-v{N}`.

The sequence is reachable and unexceptional: halt at round 3 → operator writes `RESOLVED: yes` →
loop appends `WINDOW-START: 4` → rounds 4, 5, 6 run → the loop halts again on entering round 7 and
**writes the same path**. The REQ says nothing about what that write does to the two lines already in
the file, and both possibilities are defects:

- **Overwrite** (the natural reading of "writing `POSTMORTEM-…`"): `RESOLVED: yes` *and*
  `WINDOW-START: 4` are destroyed. The next entry sees no marker, so §5's fail-closed default applies
  — *"treated as **1**"* — and AC-1.5(1) then reads a branch whose highest round is 6 as *"3 or more
  ⇒ admitted no rounds"*. The phase halts immediately, forever, with a budget message reporting a
  window (`rounds 1..3`) that has no relation to the rounds actually spent. The operator's remedy is
  another `RESOLVED: yes`, which grants another window, which is destroyed by the next halt — the
  cap is now unbounded in exactly the way AC-1.1 exists to prevent, and the reset's one-shot property
  (the load-bearing half of clause 4, and of my round-2 F-02) is silently undone.
- **Append**: the file accumulates a second `RESOLVED: yes` and, on the following reset, a second
  `WINDOW-START:` — which AC-1.5(4)'s own receive side calls *"two or more `WINDOW-START:` lines …
  fail-closed, no reset is honoured"*. The escape hatch is then permanently dead after its second
  use, with no stated repair, and the run report says only *"the file and the value found"*.

Both branches make the admitted-round set undecidable for any document that has halted twice, so the
property a test author must write for AC-1.1 — *given a branch and its POSTMORTEM, these rounds are
admitted* — has no expected value on that branch. Note that this is not a pre-existing defect I am
re-scoping: before v1.2 nothing durable lived in that file except a human-written marker whose
destruction was visible to the human who wrote it. v1.2 puts a machine-written, load-bearing datum
there, so the file's lifecycle under a second halt becomes REQ-altitude.

Fix, at REQ altitude, any one of: state that the halt path **appends a new section** and that the
*last* `WINDOW-START:` wins (with the duplicate rule scoped to duplicates *within one section*);
or version the post-mortem (`POSTMORTEM-{phase}-{feature}-v{N}.md`) as the cross-reviews are
versioned; or move the anchor out of the POSTMORTEM onto a surface the halt path never rewrites.
Whichever is chosen, §5's two new durability rows need the same "what survives a second halt" column
the rest of that table already earns its keep by having.

### 3.3 F-04 in full — the zero-delta halt is not composed with the halt it uses

AC-2.8 ends: the loop *"**halts on the existing post-mortem path** (AC-1.4)"* and round N is
*"**not** counted against AC-1's budget"*. Follow that through AC-1.4 and AC-1.5, both of which this
revision touches:

1. AC-1.4's halt *"refus[es] to re-run the phase until a human writes `RESOLVED: yes`"*. So the only
   way to clear a zero-delta halt is the operator marker.
2. AC-1.5(3)(4): that marker **is** the one-shot reset. Writing it consumes the single escape hatch
   and opens a fresh three-round window from `WINDOW-START: N`.

So AC-2.8's *"not counted against AC-1's budget"* is true of the round and false of the mechanism:
clearing the halt does not restore the budget, it **replaces** it — and it spends the operator's one
reset on what AC-2.8 itself calls an *authoring* failure whose stated remedy is *"re-run the
authoring step"*. Worse in the other direction: the same act re-grants three rounds, so a pipeline
that keeps failing to author converts every no-revision halt into a budget refresh, which is the
unbounded-review behaviour AC-1.1 was written to abolish. Neither AC says which of the two effects is
intended, so the expected post-halt state is underivable.

Two further compositions in the same neighbourhood are unstated, and each is a reachable test case:

- **The first round of a reset window can be zero-delta by construction.** An operator who judges the
  findings wrong resets *without* revising the document. Round N (post-reset) then compares against
  round N−1's anchors — AC-2.8 is scoped *"round N ≥ 2"*, with no window scoping — finds them
  identical, and halts on S-11 before dispatching anyone. The reset is already consumed (clause 4
  writes `WINDOW-START:` on entry), so the escape hatch is spent on a window that ran zero rounds.
- **AC-2.1's fixed-point comparison also crosses the reset boundary** — round N vs round N−1, the
  last round of the *previous* window, whose findings the operator has just declared discharged. If
  `blocking(N) ≥ blocking(N−1)` the fresh window halts on its first round.

Fix: scope AC-2.8 and AC-2.1 to *within the current window* (both are stated over `deriveRoundWindow`
state already, so the window start is in hand), and say explicitly what clearing an S-11 halt does to
the budget — the cleanest answer, given AC-2.8 calls it an authoring failure, is that an S-11 halt is
cleared *without* consuming the reset, i.e. clause 4 does not treat a `RESOLVED: yes` on a
no-revision post-mortem as a window reset at all.

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict
