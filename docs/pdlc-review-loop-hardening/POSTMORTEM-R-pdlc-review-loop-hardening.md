# POSTMORTEM — Phase R (REQ review loop) — pdlc-review-loop-hardening

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-review-loop-hardening.md` (v1.5, `432b3be`) → **POSTMORTEM-R** |
| Downstream | `LEARNINGS-pdlc-review-loop-hardening.md`, `docs/_queue/QUEUE.md` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..5}.md` — ten files, all on `feat-pdlc-review-loop-hardening` |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` |
| Author | pm-author (Claude) |
| Date | 2026-07-29 |
| Version | 1.0 |
| Scope | Non-convergence of the REQ cross-review loop for `pdlc-review-loop-hardening`. Not a product-decision record; not a technical design record; not a re-review of the REQ. |

---

## Phase

**Phase R — REQ authoring and cross-review**, feature `pdlc-review-loop-hardening`, branch
`feat-pdlc-review-loop-hardening`.

The phase ran the standard author → dual cross-review → address → re-review cycle five times and hit
the five-iteration ceiling without a dual **Approved**. REQ v1.5 (`432b3be`) exists on the branch and
has never been reviewed. FSPEC was never entered.

The feature under specification *is the review loop itself* — its upstream is
`POSTMORTEM-R-pdlc-workflow-distribution.md` (v2.1) findings R-3 and R-4, i.e. the two harness defects
that killed the previous feature's Phase R twice. The REQ anticipated this exact outcome as risk
**R-5** ("This REQ hitting the very loop it fixes") and mitigated it with a preamble stopping rule.
The mitigation did not hold. That is the single most important fact in this document and it is
addressed in Root Cause 2.

---

## Iterations (5 — limit reached)

| Loop iteration | REQ version reviewed | SE review (sha) | TE review (sha) | SE verdict | TE verdict | REQ revision produced |
|---|---|---|---|---|---|---|
| 1 | v1.0 (`2763eec`) | `-v1` 2H/5M/2L (`9220a20`) | `-v1` 2H/2M/2L (`f7de7f0`) | Needs revision | Needs revision | v1.1 (`66f6174`) |
| 2 | v1.1 | `-v2` 1H/2M/3L (`3663aa7`) | `-v2` 0H/3M/2L (`fc09030`) | Needs revision | Needs revision | v1.2 (`174ec18`) |
| 3 | v1.2 | `-v3` 0H/3M/2L (`d6de39c`) | `-v3` 1H/2M/2L (`85af810`) | Needs revision | Needs revision | v1.3 (`e4cf406`) |
| 4 | v1.3 | `-v4` 0H/3M/2L (`c12baf3`) | `-v4` 1H/3M/2L (`6c8e414`) | Needs revision | Needs revision | v1.4 (`2859c50`) |
| 5 | v1.4 | `-v5` 1H/3M/2L (`cda9161`) | `-v5` 2H/3M/2L (`2eb8464`) | Needs revision | Needs revision | v1.5 (`432b3be`) — **never reviewed; limit reached** |

Trajectory of blocking findings (High + Medium), summed across both reviewers:

| REQ version reviewed | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 |
|---|---|---|---|---|---|
| H+M (SE+TE) | **11** | **6** | **6** | **7** | **9** |
| of which High | 4 | 1 | 1 | 1 | 3 |

The count decayed once (11 → 6), then flattened, then **rose for three consecutive rounds** — and the
High count rose with it, from 1 to 3. Meanwhile the document grew monotonically:

| REQ version | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v1.5 |
|---|---|---|---|---|---|---|
| Lines | 330 | 524 | 695 | 886 | 1,100 | 1,398 |
| Bytes | 25.9 KB | 51.7 KB | 74.0 KB | 99.0 KB | 127.1 KB | 165.3 KB |

Five rounds took the REQ from 26 KB to 165 KB — **6.4×** — at an almost constant ~25 KB of new text
per round, while the blocking-finding count ended higher than it was at round 2. Monotonic growth plus
a non-decreasing blocking count is the same fixed-point signature recorded for
`pdlc-workflow-distribution`, reached in half the rounds.

**The stopping rule fired at round 3 and was not honoured.** The REQ's own preamble binds Phase R:
"Two consecutive rounds of non-decreasing blocking-finding count is a fixed point: escalate to the
operator, do not iterate." Rounds 2 and 3 were 6 and 6 — non-decreasing. Rounds 4 and 5 ran anyway,
consumed two full author-plus-two-reviewer cycles, added 66 KB, and ended with more blocking findings
than the round the rule fired on.

---

## Reviewers

| Role | Skill | Lens | Findings filed across all 5 rounds |
|---|---|---|---|
| Software Engineer | `pdlc:se-review` | Technical feasibility, implementability, integration risk; every existing-code claim re-verified against the working tree once per round | 4H / 16M / 11L |
| Test Engineer | `pdlc:te-review` | Testability of ACs, edge-case completeness, threshold decidability, negative cases; explicitly not product strategy, not architecture | 6H / 13M / 10L |

Both reviewers worked in **delta mode** from round 2 onward (each names its baseline sha and its diff
range in its header), re-read only changed sections, and did not re-litigate previously-approved
material. Both opened every review with a disposition table for the prior round's findings. Rounds 2–5
show a resolution rate of 5/5, 5/5, 6/6 and 5/5 respectively — i.e. **the authoring side resolved
every single finding it was given, every round.**

Neither reviewer ever issued **Approved**. Both persisted a machine-readable count trailer
(`{"high": n, "medium": n, "low": n}`) in 7 of the 10 files; the three TE files from rounds 1–3 carry
prose verdicts only.

---

## Pattern of Disagreement

**1. The fix generates the next defect, and every new finding lands in text the previous round
created.** This is stated explicitly by both reviewers at round 5. SE-v5: "All four blocking findings
land in text introduced at v1.4." TE-v5 lists sixteen v1.4 additions as approved and blocks on five
findings, of which every one is inside text added at v1.4. The same shape holds at rounds 3 and 4. The
loop is therefore convergent on *the text it reviewed* and non-convergent on *the document*: each
round retires the previous round's defects and manufactures a comparable number of new ones inside the
replacement clauses. Resolution rate ≈ 100% and blocking count flat-to-rising are not in tension —
they are the signature of this pattern.

**2. Four generator classes account for every blocking finding. Two of them never closed.**

| Class | Chain across rounds | State at round 5 |
|---|---|---|
| **A — Unobservable termination signal** (AC-3, the dispatch-and-verify wrapper) | SE-v1 F-02 + TE-v1 F-02 (script required to observe a retry signal the REQ itself declares unobtainable) → TE-v2 F-01/F-02 (progress predicate saturated by the mandated skeleton; no counting rule) → TE-v3 F-01 (predicate saturated in the opposite direction — every revision round halts) → TE-v4 F-01/F-05 + SE-v4 F-03 (mode re-selected per dispatch; progress-but-not-terminal re-dispatch) → SE-v5 F-01 (mode flips back at the invocation seam) + TE-v5 F-01/F-02 ("the dispatch returned normally" is undecidable per A-8; a fully converged round halts the phase) | **Open.** Five rounds on one question: which fact about a dispatch can the script observe. Every answer given was falsified by a reviewer-constructed scenario. The three surviving answers are risk acceptances — **R-9** (weak byte predicate), **R-10** (re-application risk), **R-12** (premature completion trailer) — not solutions. |
| **B — Provenance of the approval hash** (AC-4.2/AC-4.4, the phase skip) | SE-v3 F-01 (tier-2 record has no temporal anchor) → SE-v4 F-01 (harvest-time derivation launders a post-approval edit) → SE-v5 F-02 + TE-v5 F-04 (the clause names a read that does not hold the reviewed bytes; tier 2 becomes permanently inert), SE-v5 F-03 (no digest primitive exists in the runtime and C-2 forbids importing one), SE-v5 F-06 (three referents for "the bytes"), TE-v5 F-03 (a file required to carry the sha of its own commit) | **Open.** Each relocation of the capture point produced a fresh "which bytes, at what instant, written by whom" defect. Both reviewers independently filed the same wrong-read finding at round 5. |
| **C — Recovery and queue-state coupling** (AC-2) | SE-v1 F-04 (refuse-vs-skip precedence) → SE-v3 F-02 (the cited route forward is forbidden by a clause added in the same revision) → SE-v4 F-02 (the stated operator response is not the act that recovers) → SE-v5 F-04 (the cited authority AC-2.6a covers the opposite case; the offered bypass strands every other queue row) | **Open but small.** Four rounds of the same shape: a normative clause cites an authority that does not cover its case. Each instance was a one-to-two-clause correction. |
| **D — Citation precision** | SE-v1 F-05 (every line citation in the document had drifted, two materially wrong) → SE-v5 F-05 + TE-v5 F-07 (two A-10 line numbers off by two, at the sha the row itself names), TE-v5 F-06 (a function cited in call form that does not exist at HEAD) | **Recurring, never blocking.** The REQ added a dedicated `Citation baseline` header row and a symbol-plus-literal drift-proofing convention in response to round 1; the class still reappeared at round 5 inside the newest measured section. |

**3. There is no product disagreement at all.** Across ten reviews, **not one blocking finding
contests user need, scope, priority, phasing, or an externally observable behavior.** Every blocking
finding is about the internal mechanism of AC-3 or AC-4. The stopping rule was written to bar exactly
this traffic ("a finding of the form 'this AC has no oracle / no fixture / no seam' is answered by §8")
and it did not bite, because the findings were not of that form. SE-v5 says so in terms: "None is an
'AC has no oracle/fixture/seam' finding: F-01 is an invariant scoped one level too narrowly, F-02 is a
normative clause naming the wrong read, F-03 is an unmeasured platform capability under the document's
own DC-02 discipline, F-04 is a mis-citation whose consequence is a stranded queue. §8's stopping rule
answers none of them." Those characterisations are correct and each finding is legitimately blocking
under the rule as drafted. The rule bounded the wrong class.

**4. The two reviewers do not disagree with each other, and barely disagree with the author.** They
converge: at round 5 both independently found the AC-4.2d wrong-read defect (SE F-02 / TE F-04). Their
disposition tables agree on what was fixed. Both explicitly approve the large majority of each
revision — TE-v5 enumerates sixteen v1.4 additions as approved from a testing lens; SE-v5 marks 5 of 5
prior findings resolved and calls the population table "the strongest structural change in v1.4". The
unapproved surface **shrinks in area every round while never reaching zero**, because each round's
answer to the residue is new text and new text is unreviewed text. This is not an adversarial
deadlock; it is two reviewers repeatedly and correctly reporting that a mechanism specified in prose,
without a measurement, is under-determined.

**5. The document's own honesty accelerated the growth.** The retraction discipline both reviewers
praise — quoting the falsified sentence in place, recording the measurement that killed it, pricing the
residue as a numbered risk — is why the loop is auditable, and is also why the file grew 25 KB per
round. Every resolved finding left behind a retraction, a rationale, a risk row and one or more new
downstream obligations. Under delta review, that added text is precisely the surface the next round
reads.

---

## Best-Guess Root Cause

**Root cause 1 (primary) — the REQ is trying to settle, in prose, questions that only a measurement
against the real runtime can settle.**

AC-3 and AC-4 specify a control loop whose correctness is determined entirely by properties the
workflow runtime does not expose, and the REQ has already measured that absence: §4a A-1 (exactly
eleven host globals; no `fs`, no `process`, no `crypto`, no `import`), A-8 (how an exhausted retry
surfaces to the caller "is not measured … it may return a value, return nothing, or throw/reject"),
A-9 (no seam by which the script can judge whether a finding was addressed). Every candidate rule for
"is this dispatch finished", "is this progress", "are these the reviewed bytes" is therefore a guess
about unobservable behavior. A competent reviewer can always construct the falsifying scenario; the
author can only respond by choosing a different unobservable or by converting the defect into an
accepted risk. That process has no fixed point *below* the point where the underlying facts get
measured — and the accepted risks R-9, R-10 and R-12 are the honest admission of it: all three
resolve a review defect by naming the failure the design tolerates rather than by removing it.

Those three questions are answerable, cheaply, by experiment — a throwaway bundle run against the real
runtime. They are not answerable by a sixth round of prose. **The blocking residue is design work
mis-filed as requirements work**, and it was mis-filed precisely because the previous feature's
post-mortem lesson ("write at requirements altitude") was applied as a constraint on *wording* rather
than as a constraint on *which questions belong in this artifact*.

**Root cause 2 (why five rounds instead of three) — the escalation clause is advisory, so it did
nothing.**

The stopping rule is prose inside the document being reviewed. Nothing in `orchestrate-dev` reads it,
so the loop cannot honour it. Its fixed-point test was satisfied at round 3 (6 → 6) and the loop ran
to 5. This is a verbatim reproduction, on this REQ, of `POSTMORTEM-R-pdlc-workflow-distribution` (v2.1)
finding R-4 — non-terminal exit — which is one of the two upstream findings **this very REQ exists to
fix**. The prior feature's post-mortem recommended accepting a narrowed REQ and was not acted on,
producing a second five-round run; this feature's stopping rule was written to prevent the same thing
and could not, for the same reason: the halt is not enforced by anything. Both reviewers already
established that the two counts needed to evaluate the rule are machine-readable (the persisted verdict
field of AC-4.2, and the `{"high":…}` trailer both reviewers emit today), so the enforcement is
available and simply unbuilt.

**Root cause 3 (contributing) — an "address every finding in full" policy plus delta review makes the
finding rate self-sustaining.**

New text is unreviewed text. At ~25 KB of new text per round, the review surface never shrinks, so the
blocking-finding rate cannot fall below the rate at which the answers themselves generate reviewable
material. Nothing in the loop bounds the size of a revision, or distinguishes "this round tightened
1 KB" from "this round added a new 25 KB mechanism"; the iteration counter treats both as one round.
Sixty-six of the document's 165 KB were added in the two rounds that ran *after* its own fixed-point
test had fired.

---

## Recommendation

**R-1 — Escalate to the operator now. Do not run a sixth round, and do not leave the queue row
`pending`.**
Set `docs/_queue/QUEUE.md` row `pdlc-review-loop-hardening` to `halted` and leave this post-mortem as
the named resolution artifact. Leaving the row `pending` after a non-convergent Phase R is the exact
act that produced the previous feature's second five-round run (a full ten rounds, 384 KB, no
acceptance). A sixth round here would review v1.5, whose changelog is itself ~4 KB of new mechanism in
classes A and B, and would land where rounds 3–5 landed.

**R-2 — Accept REQ v1.5 with narrowed scope: ship AC-1, AC-2, AC-5 and AC-4.1/AC-4.2's persisted
verdict field.**
These are the parts that actually converged. No blocking finding has been filed against AC-1 since
round 1; AC-2's residue is class C, four one-clause corrections in five rounds, with SE-v5 F-04 the
last of them; AC-5 and the `Citation baseline` machinery are approved by both reviewers; the persisted
verdict field is approved and was praised as a genuine simplification. Together they resolve the
upstream POSTMORTEM-R R-3 (wrong iteration index, eleven consecutive rounds filed at the wrong index)
and R-4 (non-terminal exit) — the two defects that motivated this feature. Shipping them is a real,
verifiable win obtainable this week.

**R-3 — Descope AC-3 and AC-4.2b–d/AC-4.4 into successor queue rows with a spike-first deliverable.**
Every open blocking finding dissolves into one of three measurements against the real workflow runtime,
none of which requires a REQ:

| Measurement | Settles |
|---|---|
| What an exhausted-retry / stall-killed dispatch surfaces to the caller (return value, nothing, throw) | TE-v5 F-01/F-02, TE-v4 F-05, TE-v3 F-01, TE-v2 F-01/F-02, SE-v1 F-02, and the need for R-12's trailer at all |
| Whether a partial write is visible on disk before its commit, and at what granularity | TE-v5 F-05, AC-3.5c's "on disk" clause, R-9's weak predicate |
| Whether a pure-JS digest is admissible inside the bundle under the runtime's structural constraints, and whether it is byte-identical on the write and read paths | SE-v5 F-03, and with it F-02/F-06 and TE-v5 F-03/F-04 |

Bind these as successor rows in `QUEUE.md` (draft rows are acceptable, per the REQ's own
deferral-binding rule) with the spike as the first deliverable and the AC text written *after* the
measurement lands. Note the precedent: the REQ's §4a exists because measuring first is what made
AC-1/AC-2/AC-5 converge in one round. The sections that did not converge are exactly the sections
whose facts were never measured.

**R-4 — Make the stopping rule enforceable, and put it in the accepted scope of R-2.**
`orchestrate-dev` should compute the blocking-finding count per round from the reviewers' persisted
counts and halt Phase R itself on two consecutive non-decreasing rounds, writing the post-mortem and
the `halted` row without waiting for a human to notice. This is small, it is in the same family as the
AC-2 work R-2 already ships, and without it R-1 depends on an operator reading a trajectory table.
An advisory stopping rule has now failed twice on two consecutive features.

**R-5 — Bound the review loop by review surface, not only by iteration count.**
A revision that adds more than a stated fraction of new text to the reviewed document is not a
revision, and counting it as one round understates what the next reviewer is being asked to absorb.
Add this to the successor row from R-3: either cap per-round growth, or report growth alongside the
iteration index so the fixed-point test is evaluated against both.

**R-6 — Demote the class-D citation findings to a mechanical check.**
Line-number and symbol-existence accuracy (SE-v1 F-05, SE-v5 F-05, TE-v5 F-06/F-07) is verifiable by a
script and should never consume a review round again. It survived a dedicated header row, a
drift-proofing convention and four rounds of attention, which is sufficient evidence that prose
discipline does not fix it.

**On v1.5 specifically:** it is unreviewed and it addresses all nine round-5 blocking findings, adding
§4a A-11, a new terminal marker, and a single-referent rule for the approval bytes. Under R-1 do not
dispatch reviewers at it. If the operator wants confidence before accepting R-2, read v1.5's changelog
directly and confine any check to AC-1/AC-2/AC-5 — the sections R-2 proposes to ship.
