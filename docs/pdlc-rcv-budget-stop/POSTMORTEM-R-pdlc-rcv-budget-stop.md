# POSTMORTEM — Phase R (REQ review loop) — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-rcv-budget-stop.md` (v1.6, `c74d1ed`) → **POSTMORTEM-R** |
| Downstream | `LEARNINGS-pdlc-rcv-budget-stop.md`, `docs/_queue/QUEUE.md` (row `Order 10`) |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..5}.md` — ten files, all on `feat-pdlc-rcv-budget-stop` |
| LEARNINGS | `docs/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md` |
| Author | pm-author (Claude) |
| Date | 2026-08-01 |
| Version | 1.0 |
| Scope | Non-convergence of the REQ cross-review loop for `pdlc-rcv-budget-stop`. Not a product-decision record; not a technical design record; not a re-review of the REQ. |

---

## Phase

**Phase R — REQ authoring and cross-review**, feature `pdlc-rcv-budget-stop`, branch
`feat-pdlc-rcv-budget-stop`, queue `Order 10`.

The phase ran the standard author → dual cross-review → address → re-review cycle five times and hit
the five-iteration ceiling (`MAX_REVIEW_ROUNDS = 5`) without a dual **Approved**. REQ **v1.6**
(`c74d1ed`, 486 lines / 61,101 bytes) exists on the branch, addresses all four round-5 blocking
findings, and **has never been reviewed**. FSPEC was never entered.

Two facts about this feature's provenance matter for reading the rest of this document.

1. **This REQ is one of five split out of a predecessor that failed the same way.**
   `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` (v1.8) was superseded on
   2026-08-01 by a split into `pdlc-rcv-budget-stop` (this REQ, `REQ-RCV-01`),
   `pdlc-rcv-fixed-point-stop` (`REQ-RCV-02`), `pdlc-rcv-panel-topology` (`REQ-RCV-03/04`) and
   `pdlc-rcv-finding-quality` (`REQ-RCV-05/06`). The split was itself a remediation: the predecessor
   was 581 lines / 83 KB and the split was made at the REQ-RCV-01 / REQ-RCV-02 seam, with the shared
   facts extracted into `docs/_constraints/pdlc-rcv-baseline.md` and
   `docs/_constraints/pdlc-rcv-catalogue.md`, precisely so that each successor would fit inside the
   700-line / 61,440-byte REQ size budget and be reviewable in fewer rounds. **The split reduced the
   document; it did not reduce the round count.**
2. **The mechanism that would have stopped this loop is queued behind it.** `pdlc-rcv-fixed-point-stop`
   (`Order 17`) — the fixed-point stopping rule — declares `depends-on: pdlc-rcv-budget-stop`, and
   both of its tests are stated over the window origin `W` this REQ defines. So the loop that could
   not stop is the one whose successor exists to stop it, and it cannot borrow the fix. This is the
   third consecutive feature in this family to hit five rounds in Phase R
   (`pdlc-workflow-distribution`, `pdlc-review-loop-hardening`, and now this one), and the second in
   which the REQ under review was itself about review-loop termination.

---

## Iterations (5 — limit reached)

| Loop iteration | REQ version reviewed | SE review | TE review | SE verdict | TE verdict | REQ revision produced |
|---|---|---|---|---|---|---|
| 1 | v1.1 (`624054c`) | `-v1` 2H/5M/2L | `-v1` 3H/5M/3L | Needs revision | Needs revision | v1.2 (`fa83925`) |
| 2 | v1.2 (`fa83925`) | `-v2` 0H/2M/4L | `-v2` 0H/1M/4L | Needs revision | Needs revision | v1.3 (`94e2137`) |
| 3 | v1.3 (`94e2137`) | `-v3` 1H/2M/2L | `-v3` 1H/1M/3L | Needs revision | Needs revision | v1.4 (`bdf893e`) |
| 4 | v1.4 (`bdf893e`) | `-v4` 1H/2M/2L | `-v4` 1H/2M/2L | Needs revision | Needs revision | v1.5 (`779cc35`) |
| 5 | v1.5 (`779cc35`) | `-v5` 2H/0M/2L | `-v5` 0H/1M/2L | Needs revision | Needs revision | v1.6 (`c74d1ed`) — **never reviewed; limit reached** |

Trajectory of blocking findings (High + Medium), summed across both reviewers:

| REQ version reviewed | v1.1 | v1.2 | v1.3 | v1.4 | v1.5 |
|---|---|---|---|---|---|
| H+M (SE+TE) | **15** | **3** | **5** | **6** | **3** |
| of which High | 5 | 0 | 2 | 2 | 2 |

The shape is **not** the monotonic blow-up recorded for `pdlc-review-loop-hardening`. Round 1's
fifteen blocking findings collapsed to three in one round — an 80 % reduction — and the loop then sat
on a **floor of three to six blocking findings and two Highs for four consecutive rounds**. It never
diverged and it never reached zero. Rounds 2→3→4 were non-decreasing (3 → 5 → 6), which is the
fixed-point signature the successor REQ `pdlc-rcv-fixed-point-stop` is written to detect; round 5
came back down to 3 but kept both Highs, and both of those Highs are on text that round 4's fixes
introduced.

Document size across the same window:

| REQ version | v1.1 | v1.2 | v1.3 | v1.4 | v1.5 | v1.6 |
|---|---|---|---|---|---|---|
| Lines | 410 | 497 | 508 | 509 | 502 | 486 |
| Bytes | 48,175 | 60,892 | 61,328 | 61,323 | 61,437 | 61,101 |
| Headroom to `BYTE_LIMIT=61440` | 13,265 | 548 | 112 | 117 | **3** | 339 |

This is the second distinguishing fact. Unlike the predecessor loop, this document **did not grow**:
after round 1 it was pinned to within 0.9 % of the ceiling and then held there, gaining
114 bytes across the whole of round 4→5 while landing four behavioural changes. Every round from 3
onward was funded by a compression pass — `af343ab`, `8ad8d85`, `b5728ef`, `f846e70`, `bdf893e`,
`779cc35`, `f0fe75e`, `d4a8b4d` are all compression commits — and by round 5 the reserve was 3 bytes.
The size budget (`pdlc/hooks/scripts/check-req-size.sh:41`) was filed as a Low **in every round from
2 onward** (SE F-06, SE F-05 ×2, SE F-04; TE F-21, F-26, F-28) and by round 5 it had stopped being a
style note: both reviewers state that the round's own fixes cannot be paid for by another compression
pass, and one compression pass had already deleted a *reason* rather than a restatement (SE-v5 F-03 /
TE-v5 F-29, the dangling *"depends on both"* in §3.1).

**Resolution rate was 100 % in every delta round.** Rounds 2–5 opened with a disposition table and
closed 6/6, 5/5, 5/5 and 5/5 of the prior round's findings respectively. The authoring side never
failed to answer a finding, and twice (round 5's F-22 and F-24) took the more expensive of the two
options offered. A 100 % resolution rate coexisting with a flat blocking count is the same signature
recorded for the predecessor feature: the loop is convergent on *the text it reviewed* and
non-convergent on *the document*.

---

## Reviewers

| Role | Skill | Lens | Findings filed across all 5 rounds |
|---|---|---|---|
| Software Engineer | `pdlc:se-review` | Technical feasibility, implementability, integration risk; every existing-code claim re-verified against `pdlc/workflows/orchestrate-dev.js` at HEAD, once per round | 6H / 11M / 12L |
| Test Engineer | `pdlc:te-review` | Testability of ACs, oracle falsifiability, edge-case completeness, threshold decidability; explicitly not product strategy, not architecture, not fixtures/seams/test levels (deferred to §8 and DC-09) | 5H / 10M / 14L |

Both reviewers worked in **delta mode** from round 2 onward. Each names its baseline sha and its diff
range in its own header (SE: *"the baseline reviewed at v4 was the REQ as of `68cfec7`; this review
covers `68cfec7..HEAD`"*; TE: *"Reviewed range: `bdf893e..fc3410e`"*), re-read only changed sections,
and did not re-litigate previously-approved material. TE persisted a machine-readable count trailer
(`{"high": n, "medium": n, "low": n}`) in all five of its files; SE's counts are readable from its
findings tables' severity column but were never emitted as a trailer — a small asymmetry that matters
for R-6 below.

Neither reviewer ever issued **Approved**. Neither ever disagreed with the other: across ten reviews
there is **no round in which the two reviewers reached opposite verdicts**, and at rounds 4 and 5 they
independently filed the *same* defect from different lenses (round 4: SE F-01 and TE F-22 both on
`postmortemStatus` being pinned to a value the shipped code does not produce; round 5: SE F-02 and TE
F-27 both on the byte-comparing confirmation's residue being consumed by the recovery act it
prescribes). Where they differed at round 5 it was on **severity, not on substance** — SE graded the
`:4928` unconditional-emit defect a second High that TE did not file at all, having scoped it out as
an oracle-wiring question owned by O-10.

Both reviewers spent a non-trivial fraction of every round **re-deriving the author's citations
against the shipped source rather than trusting them**, and said so explicitly (SE-v5: *"I counted the
catch block rather than trusting the citation, because the last three rounds each turned on one that
was wrong"*). That check found a materially wrong citation in three of the five rounds.

---

## Pattern of Disagreement

**1. There is no product disagreement, and there never was.** Across ten reviews, **not one blocking
finding contests user need, scope, priority, phasing, the choice of three rounds, the reset-region
design, or any externally observable behaviour.** TE-v5 says so in terms: *"Nothing in this review
contests user need, priority, phasing, the choice of three rounds, the reset-region design, or the
decision to confirm by byte comparison — which is the right call and closes a real fail-open."* Every
blocking finding in rounds 2–5 is about the internal mechanism of one clause: **AC-1.5(4)**, the
answering-line write and the refusal it can raise. The document converged as a *requirements*
artifact somewhere around round 2 and spent rounds 3, 4 and 5 failing to converge as something else.

**2. The fix generates the next defect, and every round-5 finding lands in text round 4 created.**
Both reviewers state this independently. SE-v5: *"Both are on text this revision added, and both are
the same shape as the finding it just closed."* TE-v5: *"Three, all in text added or rewritten since
v4 … F-27 is the residue of F-24's fix."* The same holds at rounds 3 and 4. Each round retires the
previous round's defects completely (100 % resolution) and manufactures a comparable number of new
ones inside the replacement clauses. Under delta review that is self-sustaining: the answer to a
finding is new text, and new text is unreviewed text.

**3. Two generator classes account for every blocking finding from round 2 onward. Both were open at
round 5.**

| Class | Chain across rounds | State at round 5 |
|---|---|---|
| **A — The answering-line write, its confirmation, and what the failure leaves behind** | SE-v1 F-01 + TE-v1 F-04 (the write consumes the one-shot clearance with no confirmation and no failure disposition — a fail-open in the property the REQ exists to establish) → v1.2 adds a confirmed write with a fail-closed disposition (`8490ed4`) → SE-v3 F-02/F-03 (the unconfirmable-append recovery text is neither pinned nor complete; *"safe both ways"* enumerates two outcomes in a paragraph that has just admitted a third) → SE-v4 F-02 + TE-v4 F-24 (the torn-write sentence offers two sanctioned repairs for one fault; of three torn-write outcomes, one silently spends the clearance on a window the operator never bought) → v1.5 replaces the presence check with a **byte comparison**, collapsing three outcomes to two → SE-v5 F-02 + TE-v5 F-27 (the byte comparison correctly *announces* the well-formed value-tear `WINDOW-START: 12` → `WINDOW-START: 1`, and then the recovery text the same criterion prescribes — *"reset the row, re-run the queue"* — lets the residue validate on the **next** entry, spend the clearance and produce the very *"unexplained budget halt later"* the mechanism exists to prevent) | **Open.** Five rounds on one question: what state does a failed write leave on disk, and who repairs it. Each answer was correct about the entry that fails and silent about the entry that follows. |
| **B — Which shipped string appears, with which value, under which guard** | SE-v1 F-03 (the refusal's operator-facing text is unspecified and the shipped recovery line actively misleads on this path) → v1.3 pins the strings and adds O-10 oracles → SE-v2 F-01 (the two new strings carry no PROPERTIES obligation, so the fix is unfalsifiable), SE-v2 F-02 + TE-v2 F-12 (§6 declares three rows the shared catalogue does not contain) → SE-v3 F-01 + TE-v3 F-17/F-18 (row B is defined twice with mutually exclusive `notice` cells; the `postmortemStatus` oracle asserts a value the shipped field cannot take; the catalogue must be amended first — done at `33bdf80`) → SE-v4 F-01/F-03 + TE-v4 F-22/F-23/F-25 (`postmortemStatus` pinned `none` where the shipped disposition returns `written`; the coupled `No POSTMORTEM was written.` emit; the recovery string quoted three ways, none of them the shipped bytes, with its citation off by two lines) → v1.5 pins the bytes, names the deciding branch (`orchestrate-dev.js:4890`–`:4901`) and cites the near-miss (`:1795`) → **SE-v5 F-01**: the newly pinned recovery string at `:4928` is emitted **unconditionally** on every halt class, so §6's *"Replaces the shipped generic … on this path only"* names a substitution the shipped code has no seam for, and O-10 asserts absent a line a faithful implementation always prints | **Open.** Four rounds of the same shape at increasing precision: pin a value → the value is wrong; pin the right value → the *guard* around the emit is wrong; pin the guard → the *next* emit has no guard at all. SE-v5's own summary is the cleanest statement of the class: *"pinning a shipped string's bytes is only half a pin — the other half is the guard around the site that emits them."* |

**4. Two further classes were real but never blocking.**

| Class | Chain | State |
|---|---|---|
| **C — Shared-artifact coupling** | SE-v1 F-04 (`deriveRoundWindow` is contractually seam-free, so the REQ never says how `W` reaches it), SE-v1 F-05 + TE-v1 F-08 (`forcePhases` is a documented operator entry point whose behaviour the REQ silently changes), TE-v1 F-05 (§7 mints ids in a shared namespace), SE-v2 F-02, SE-v3 F-01 + TE-v3 F-18 (row B versus the shared catalogue) | **Closed** by round 4, via a real amendment to `docs/_constraints/pdlc-rcv-catalogue.md` (`33bdf80`) rather than by re-wording the REQ. This class was handled correctly and is the loop's clearest success. |
| **D — Size budget** | SE-v2 F-06 (548 bytes) → SE-v3 F-05 + TE-v3 F-21 (112) → SE-v4 F-05 + TE-v4 F-26 (117) → SE-v5 F-04 + TE-v5 F-28 (**3**) | **Open and, at round 5, binding.** Filed as Low in every round from 2 onward and therefore never blocked a verdict, while quietly determining *how* every round could be fixed. By round 5 both reviewers state the fix cannot be appended and must be paid for by relocating content to the catalogue. One compression pass had already deleted a reason (SE-v5 F-03 / TE-v5 F-29). |

**5. The reviewers agree with the author about almost everything, and say so at length.** Every round
carries a Positive Observations section that grows rather than shrinks; round 5's two sections
between them approve the byte-comparing confirmation (*"the right mechanism, and it was found by
asking the right question"*), the `postmortemStatus` mechanism (*"names a mechanism I did not offer,
and it is better than both I did"*), the per-variant dispatch oracle, the parameterised torn-write
property, and the compression discipline. TE-v5 checked each of the round's deletions individually
and confirms *"no AC clause, no §5/§6 cell, no oracle leg and no citation was traded for room."* This
is not an adversarial deadlock. It is two reviewers correctly and repeatedly reporting that a
mechanism specified in prose, over shipped code the document does not control, is under-determined —
and one of them (SE) declining to approve while any such under-determination remains, which is the
correct application of the approval rule as written.

**6. The one substantive disagreement is about altitude, and it is implicit.** TE scoped fixtures,
seams, test levels and oracle wiring **out** of review (*"per §8 and DC-09"*) and consequently filed
no High at rounds 2 or 5. SE holds every claim the REQ makes about `orchestrate-dev.js` to
implementation-grade precision — line numbers re-counted, guards traced, near-miss strings
disambiguated — and consequently filed a High in three of five rounds, all in class B. Neither lens
is wrong. They are reviewing two different documents, and the REQ is trying to be both.

---

## Best-Guess Root Cause

**Root cause 1 (primary) — the REQ is specifying, at requirements altitude, the behaviour of shipped
code it does not own and cannot change from inside a requirements document.**

Both open classes are the same defect wearing different clothes. Class B pins the bytes, the value
and the guard of strings emitted by `pdlc/workflows/orchestrate-dev.js`'s halt catch. Class A
specifies what a partially-completed append leaves on disk and who repairs it. In both cases the
REQ's correctness is decided **not** by anything the REQ says, but by control flow in a file the REQ
is not permitted to restate and did not change: the `postmortemStatus` disposition chain
(`:4880`–`:4901`), the `none` guard at `:4922`, and the unguarded recovery emit at `:4928`. A
reviewer with the source open can falsify any prose claim about that chain by reading one line
further, and the author can only respond by pinning one more fact — which the next round falsifies
one line further still. The progression is exact and is visible in the disposition tables: v1.3 pins
a value; v1.4's review shows the value is wrong; v1.5 pins the right value *and* the branch that
decides it; v1.5's review shows the **next** emit has no branch at all.

That is not a requirements question. It is a two-hour code-reading task over one function — enumerate
every `emit` in the halt catch, record its guard, decide which ones this feature suppresses — and its
output belongs in a TSPEC or a measured constraints file, not in an AC. The REQ family already knows
this technique works: `docs/_constraints/pdlc-rcv-baseline.md` exists because measuring first is what
made this REQ's §1–§2, §4, §5, §7 and §9 converge and stay converged for four rounds without a single
finding. **The sections that did not converge are exactly the sections whose facts were asserted
rather than measured.**

**Root cause 2 — the size budget converted every round into a zero-sum trade, and the trade was
priced as a Low.**

From round 2 onward the document sat within 548 bytes of the 61,440-byte ceiling, and from round 3
within 120. Every subsequent fix therefore had to be funded by deleting existing text in the same
round: eight of the REQ's commits across rounds 3–5 are compression passes. This has three
consequences the loop never accounted for.

- **Compression is itself reviewable new text.** A compressed paragraph is a changed paragraph, so
  delta review reads it. Round 5's F-03/F-29 is precisely this: a compression pass deleted the clause
  naming the second member of a *"depends on both"*, creating a finding out of an edit made to pay
  for a different finding.
- **The constraint was never allowed to block.** Both reviewers filed it as **Low** in four
  consecutive rounds, which is defensible per-round and wrong cumulatively — a Low never blocks a
  verdict, so nothing in the loop ever forced the decision the constraint was demanding. By round 5
  the reserve was **3 bytes** and both reviewers had to spend a paragraph of their recommendation
  telling the author *where the bytes must come from*, which is architecture advice delivered through
  a severity channel that cannot compel it.
- **The correct answer was available from round 2 and was never taken as a decision.**
  `docs/_constraints/pdlc-rcv-catalogue.md` already owns row B's schema and its two-variant
  discriminator, and has an amendment protocol that was successfully exercised once (`33bdf80`).
  Moving §6's render rows there was proposed by SE at rounds 4 and 5 and by TE at round 5; it was
  partially done, per-round, as a byte-scavenging tactic rather than as a structural decision.

**Root cause 3 — the split that produced this REQ solved the size problem, not the altitude
problem.** The predecessor `pdlc-review-convergence` REQ was split into five because it was 83 KB.
The split worked on that axis — this REQ opened at 48 KB and never exceeded 61.4 KB. But `REQ-RCV-01`
retained the one clause whose correctness depends on shipped control flow, so it inherited the
predecessor's non-convergence at a quarter of the size. Splitting by *topic* does not separate the
requirements-altitude material from the implementation-altitude material when both live in the same
acceptance criterion. **AC-1.5(4) is the only clause that generated a blocking finding after round
2**, and it is the only clause in the document that is really a design.

**Root cause 4 (contributing) — the stopping rule that applies to this loop is queued behind this
loop.** Rounds 2→3→4 were 3 → 5 → 6 blocking findings: non-decreasing for two consecutive rounds,
which is the fixed-point condition `pdlc-rcv-fixed-point-stop` (`Order 17`) is written to detect and
halt on. That feature depends on this one and does not exist yet, so nothing observed the condition
and the loop ran to the hard ceiling, consuming rounds 4 and 5. Additionally, only TE emits the
machine-readable `{"high": n, …}` trailer; SE does not, so even a hand-run fixed-point test cannot be
computed from the artifacts without parsing SE's findings tables. **The counts needed to enforce the
rule are two-thirds present and one-third missing, and that has been true for three consecutive
features.**

---

## Recommendation

**R-1 — Escalate to the operator now. Do not run a sixth round, and do not leave the queue row
`pending`.**
Set `docs/_queue/QUEUE.md` row `Order 10` (`pdlc-rcv-budget-stop`) to `halted` and leave this
post-mortem as the named resolution artifact; the phase stays refused until a human writes
`RESOLVED: yes` into it. Leaving the row `pending` after a non-convergent Phase R is the act that
produced `pdlc-review-loop-hardening`'s second five-round run. A sixth round here would review v1.6,
whose changes are entirely inside AC-1.5(4), §6 and O-10 — the three surfaces that have generated
every blocking finding since round 2 — and would land where rounds 3–5 landed. Note that four
downstream queue rows (`Order 11`, `12`, `17`, and the panel work behind them) declare
`depends-on: pdlc-rcv-budget-stop`, so this halt blocks the family; that argues for resolving it this
week, not for running another round.

**R-2 — Resolve v1.6 by an operator-directed convergence pass, not by a sixth dual review.**
v1.6 (`c74d1ed`) exists, is unreviewed, and addresses all four round-5 blocking findings by the route
both reviewers recommended: the shipped generic recovery line at `orchestrate-dev.js:4928` is
**suppressed** rather than substituted (SE-v5 F-01 option (i)); the unconfirmable-append refusal now
names **two** recovery acts, the first deleting its own unconfirmed residue before the next entry can
spend it (SE-v5 F-02 option (i) / TE-v5 F-27 option (i), each reviewer's own first choice); O-10
gains the sequel leg and corrected negative controls; and the round was funded to **339 bytes** of
headroom rather than 3. The precedent is exact — `POSTMORTEM-R-pdlc-review-loop-hardening` §Resolution
records the same disposition on the same shape of loop. The pass must do three things and no more:

| Check | Against |
|---|---|
| Every round-5 finding closed, with its retraction recorded in place | `CROSS-REVIEW-{se,te}-REQ-v5.md`, findings F-01…F-04 and F-27…F-29 |
| Every line citation re-derived at HEAD, not trusted | `pdlc/workflows/orchestrate-dev.js` — specifically `:4862`, `:4870`–`:4871`, `:4880`–`:4901`, `:4922`, `:4925`–`:4929`, and `:1795` |
| No obligation traded for bytes | diff `779cc35..c74d1ed`; each deletion classified as restatement or reason |

Do **not** dispatch reviewers at v1.6. If the operator wants independent confidence, dispatch a
single reviewer against the third row only — the byte-for-byte deletion audit — which is mechanical
and cannot generate a class-A or class-B finding.

**R-3 — Take the altitude decision the loop kept deferring: move AC-1.5(4)'s render and repair
material into `docs/_constraints/pdlc-rcv-catalogue.md`, as a decision, not as a byte-scavenging
tactic.**
The catalogue already owns row B's schema and its two-variant discriminator and has a working
amendment protocol (`33bdf80`). The unconfirmable-append variant's full render — ❌ text, recovery
text, `postmortemStatus`, residue disposition — is catalogue material by that file's own definition;
SE proposed the move at rounds 4 and 5 and TE at round 5. Making it once, wholesale, with a citation
left behind, does three things simultaneously: it puts the shipped-string facts in the file whose
amendment protocol requires them to be verified against source, it restores real headroom to the REQ,
and it removes the surface that generated every class-B finding from the document under review.

**R-4 — Settle class B by measurement, not by prose, and record the measurement in the shared
baseline.**
One code-reading pass over `orchestrate-dev.js`'s halt catch settles every open class-B question and
several not yet asked: enumerate every `emit` in the catch, record each one's guard (or record that
it has none), and record which halt classes reach it. That table belongs in
`docs/_constraints/pdlc-rcv-baseline.md` as measured facts `M-*`, cited by id from this REQ and from
its four successors — all of which will otherwise re-derive the same chain independently. The REQ's
own §1–§2, §4, §5, §7 and §9 are the evidence that this works: they cite measured facts and drew zero
findings after round 1.

**R-5 — Make the size budget a blocking constraint at REQ-authoring time, not a Low at review
time.**
`check-req-size.sh` already warns on the PostToolUse hook, and the warning was heeded — the document
never breached the ceiling. What failed is that *proximity* to the ceiling was reported through a
severity channel that cannot compel a decision. Two cheap changes: have the hook warn at a **soft**
threshold (say 90 %, i.e. 55,296 bytes) with the message naming relocation to `docs/_constraints/`
as the remedy; and add to `pdlc:pm-author`'s quality checklist that a REQ inside 5 % of the budget at
the start of a review round must relocate content before addressing findings, never after. A
constraint that can only be satisfied by deleting reasons is a constraint that will eventually delete
one — and at round 5 it did.

**R-6 — Require the machine-readable count trailer from `se-review`, as `te-review` already
emits.**
TE persisted `{"high": n, "medium": n, "low": n}` in all five files; SE persisted none. The
fixed-point rule that `pdlc-rcv-fixed-point-stop` will implement needs both counts per round, and its
own predecessor post-mortem (`pdlc-review-loop-hardening`, R-4) already recorded that the
enforcement is "available and simply unbuilt". It is now two-thirds available on its third
consecutive feature. This is a one-line addition to `pdlc/skills/se-review/SKILL.md` and it is a
prerequisite for R-7, not a nicety.

**R-7 — Unblock the fixed-point stopping rule from its own dependency.**
`pdlc-rcv-fixed-point-stop` (`Order 17`) depends on this REQ because both its tests are stated over
the window origin `W`. That dependency is real for its *tests*, not for the **counting rule** — "two
consecutive rounds of non-decreasing blocking-finding count halts the phase" needs only the two
verdict trailers from R-6 and the existing round window. Splitting that rule out as its own small,
dependency-free queue row, ahead of `Order 10`, would have halted this loop at round 4 and would halt
the next one. Three consecutive features in this family have now run to the five-round ceiling while
the mechanism that stops them sat behind them in the queue.

**On the trajectory specifically.** This loop is a materially better outcome than its predecessor —
the document did not grow, the split held, product substance was settled by round 2, resolution rate
was 100 % every round, and the two reviewers never diverged. It failed on a single acceptance
criterion whose correctness is decided by shipped control flow. R-2 finishes the document; R-3 and
R-4 stop the next one from being decided the same way.
