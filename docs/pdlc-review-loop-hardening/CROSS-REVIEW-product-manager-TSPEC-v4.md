# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md` (v1.3, 172,978 B)
**Sources of truth:** `REQ-…` **v1.6**, `FSPEC-…` **v1.8** (FSPEC amended this round; §20 re-read, full diff read)
**Baseline diffed:** `b614e1b..HEAD` on `feat-pdlc-review-loop-hardening` (HEAD `31a2764`)
**Date:** 2026-07-30
**Iteration:** 4 (delta)
**Scope:** Delta only. My one v3 Low verified; the four sections the round-3 revision touched
(§2.6, §3.7, §4.4, §5.6.1 rule 4, §5.6.2, §6.2 row 17, §8.3 AT-43a, §8.5 E-2) read in full at HEAD;
the FSPEC v1.7→v1.8 diff read in full. Sections I approved at v1.2 were **not** re-reviewed, and
nothing in this file re-opens them. Product lens: fidelity to the approved FSPEC's stated contracts,
operator-visible attributability, scope discipline in both directions. Test mechanics and technical
design are out of scope; where I cite an AT it is for the operator-facing behaviour it pins, not for
its construction. Per lesson R-6 no citation-drift finding is raised at any severity. The peer
`te-review`'s v4 file was not read or touched.

---

## Verification of my one v3 finding

| Prior | Status | Evidence |
|---|---|---|
| **F-01** (Low) — §2.6's no-cache justification and §4.4 cited a stale aggregate fan-out bound | **Closed, and closed the way I asked (R-5: re-point, don't reconcile)** | §2.6 now reads "bounded per **episode** entry, not per phase entry — one `_listFiles` and at most two `_readFile` each, up to `(1 + MAX_REVIEW_ROUNDS) × (reviewers + 1)` listings and twice that many reads for one phase (§5.6.1's measured bound: 18 and 36 at today's constants)", and the decision now rests on the invalidation reason — sharpened, not just retained: "the thing to invalidate is precisely the just-written review files S-INV exists to observe". That is a better argument than the one it replaces, and it is the argument that survives S-INV. §4.4 is re-scoped to "two `_readFile` **per search call**", which is what the claim is true of, and then states the aggregate explicitly rather than leaving the reader to reconcile the two figures. §5.4's third load-bearing property is untouched and stays true, correctly — it is a per-call claim. The no-cache decision is not reopened, which is right; my finding was about a false measured claim under DC-02, not about the decision. |

Closed. No prior finding is carried forward.

---

## The FSPEC v1.8 amendment — verified, no disposition changed

The diff is 12 lines and I read all of them. One sentence deleted from §20's `Closed at v1.7`
preamble ("The **Owner** column below is the disposition, not a forwarding address"), the version and
changelog rows updated, and the `Cross-Reviews` field extended to name the round-3 note. **The
disposition table itself is byte-identical**: Q-05 and Q-09 are still bound to `docs/_queue/QUEUE.md`
Order 9, Q-06 is still declined on C-5 grounds with "Reopening it needs a new requirement, not a
revision of this one." No behavioural section was touched, exactly as the changelog claims. Deleting
the sentence rather than renaming the column is the R-5 move, and the `Disposition` header already
carries the meaning the sentence was asserting.

---

## The TE N-01 fix — the product question I was asked, and where it leads

**The direction of the fix is right, and the `{}`-versus-`null` distinction is the right mechanism.**
An empty Map is a measurement; `null` is the absence of one, and making that intrinsic to the type
rather than a clause that special-cases it is what stops the defect relocating a third time. Rule 4
stated in the positive direction ("greenfield **only if** this episode's own refresh successfully
observed the branch and found no review round") is a statement whose complement is total, so a new
failure path is covered without an edit — the same generalisation that fixed G-INV. Selecting
revision more often is the correct trade and the document argues it correctly: the asymmetry paragraph
is right that mis-entering greenfield silently drops a whole review round while mis-entering revision
costs at most one continuation prompt terminated by the trailer. **This is not a new source of
unnecessary work at any scale that matters, and it is not a false halt** — it is bounded by one
episode's budget, paid only on an IO failure. §5.6.3 building the prompt from the files on disk is
what keeps the under-named round harmless.

**But the operator-visible half of the question does not check out, and it is not a small gap.** My
brief was to confirm that on a listing failure an operator can still tell "the branch is clean" from
"I could not read the branch". Internally, the fix achieves exactly that — `null` versus `{}`. Externally
it does not, and worse, the disposition it specifies is the opposite of the one this document and the
approved FSPEC state everywhere else for the same input. That is F-01 below.

To be clear about what I am and am not doing: v1.2's row 17 also said "kept and reported", and I
approved it without catching this — I own that miss. What makes it raisable in a delta round rather
than a re-litigation is that **v1.3 pins the behaviour with a new test on a named `ListFailure`
value**. AT-43a fixture (b) is new text in a changed section, and it converts a loosely-worded row
into a normative, testable requirement that an implementation *not* halt on `unreadable`. Before this
round an implementer reading §4.2 would have halted and no test would have stopped them. Now one
would.

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The mid-loop listing failure is a third, unmarked disposition of `ListFailure`, and it contradicts the approved FSPEC's "every caller halts" contract — which is also the only place the operator-facing attributability lives.** FSPEC **§3.3** is unambiguous and normative: `dir_missing` is "**Treated as an empty directory by every caller**", and `not_a_directory` / `unreadable` / `bad_argument` are "**Cannot judge.** The caller halts with an operator-facing error naming the path", with "**one halt, with one shape**" — `Cannot enumerate {dirPath}: {reason}` — and "**No caller invents its own wording**". This TSPEC restates that in three places: §2.5 step 2 (`ListFailure(other) ─► halt "cannot judge"`), §4.2's table (`unreadable` ⇒ "**cannot judge** ⇒ halt", "shared by both listing paths (DC-11)"), and §6.2 **row 2** (`unreadable` ⇒ "**halt**, `Cannot enumerate {dirPath}: {reason}`"). §6.2 **row 17** and §5.6.1 rule 4 now specify a **caller that does not halt** on precisely those values: `present: null`, keep, "report it", select revision, continue — and **AT-43a fixture (b)** pins it to the named value, "`_listFiles` returns a `ListFailure` (`unreadable`) at that episode only … revision is still selected, the trailer still required, and the failure reported". Row 17 distinguishes itself from row **1** only; it never mentions row 2, and nothing marks the exception. An implementer cannot satisfy both: obeying row 2 / §4.2 / FSPEC §3.3 reds AT-43a(b); obeying AT-43a(b) violates a contract three sites in this document assert. **The product cost is attributability, which is the reason the FSPEC's asymmetry exists** ("guessing either way is unsafe and the run stops instead"). Under the continue disposition there is no operator surface for the failure at all: §4.7's four new fields and four new report lines contain nothing for it, no halt shape carries it, and §6.6 states a **closed** enumeration — "**Two** signals in this design are reported and never halt" — which does not include it. So "report it" names no carrier, and the operator sees a run that proceeded, with a revision episode possibly sharing the previous round's `EpisodeKey`, and no record distinguishing that from a clean pass. Note the direction is *not* the fail-open the FSPEC's asymmetry guards (no skip is granted, no index resets to 1), which is why this is Medium and not High — but "erring toward more work" was not the FSPEC's ruling to make silently, and an unmarked deviation from an approved contract is a product decision taken in an engineering artifact. **R-5 fix — one of the two statements must be deleted, not reconciled.** Either (a) make the mid-loop failure halt like every other caller, and then delete rule 4's `present === null` bullet, §6.2 row 17 and AT-43a fixture (b) as unreachable — this is the smaller document and needs no FSPEC change; or (b) keep the continue, and then it must be a **stated, scoped exception**: name it in §4.2's table and beside §6.2 row 2, give it a carrier in §4.7 so an operator can attribute it, correct §6.6's "two signals" to three, and amend the **FSPEC**, since "every caller halts" is that document's contract and this TSPEC does not get to narrow it. Whichever is chosen, §9.3's DC-11 row ("shared across both listing paths") needs to stop asserting agreement that no longer holds. | FSPEC §3.3, O-1/DC-11; §2.5 step 2, §4.2, §6.2 rows 2/17, §5.6.1 rule 4, §4.7, §6.6, §8.3 AT-43a, §9.3 |
| F-02 | Low | Local | **`refreshReviewState`'s `kept` has no initialiser, so a failure on the *first* episode names no round.** New pseudocode in §5.6.1: the `ListFailure` branch returns `reviewFiles: kept.reviewFiles, startIndex: kept.startIndex`, but `kept` is assigned **only** on the success path (`kept ← { reviewFiles, startIndex: w.startIndex }`), and the seed the prose describes ("the phase-entry values … are the seed for the first episode only") is threaded as `reviewLoop`'s `present` / `reviewFiles` parameters — §3.9 carries no seed `startIndex` at all; the branch-derived value arrives as `iteration`. So if the first wrapped episode's refresh fails, `kept` is unset, rule 4's `max(1, startIndex − 1)` has no operand, and `roundIndex: sel.round ?? startIndex` gets a garbage coordinate — which is the pacing budget's key, so the report names a round that does not exist. Operator-visible, and cheap to close: state the initialiser (`kept ← { reviewFiles: <seed>, startIndex: iteration }`) at the point the helper is declared. Moot if F-01 is resolved by option (a). | §5.6.1, §3.9 |

No High findings. One Medium ⇒ Needs revision.

---

## Verification of the round's other three fixes

- **TE N-02 (alias hop) — sound, and I re-measured it rather than accepting it.** At HEAD `31a2764`:
  `main()` destructures `_raisePrAndVerifyCi: raisePrAndVerifyCiFn = raisePrAndVerifyCi` and declares
  `_now,` / `_sleep,` bare; its only forward is `await raisePrAndVerifyCiFn({ …, _now, _sleep })`; and
  `raisePrAndVerifyCi` declares `_now = () => Date.now()`, `_sleep = sleep`. Exactly one alias hop,
  resolving to a module-level function declaration — which is what §8.5 clause 2 now authorises and no
  more ("at most one alias, and the resolved target must itself be a module-level function
  declaration"). Ruling it as *the same* resolution the AT-19 table already carries, rather than as a
  second mechanism, is the right shape: one rule, two consumers. The Members cell naming
  `raisePrAndVerifyCiFn` is what makes it measured rather than implied. Product-lens: this is a test
  that would have failed on correct source, i.e. a false alarm an operator would have had to
  diagnose; closing it removes noise without weakening the seam-wiring guarantee.
- **TE N-03 (`structural` deleted) — nothing operator-facing was lost.** I checked the removal
  direction rather than the argument: `structural` appears in no §4.7 field, no §4.7 report line, no
  §6.2 row and no AT; §5.6.2 keeps it as the local its two readers are, and completeness stays
  observable through `isComplete` (AT-59/AT-60/AT-62). Deleting rather than inventing a report field
  no requirement asks for is right — a field added to satisfy a reviewer is scope creep, and the
  document names it as the AC-4.7a anti-pattern.
- **The `_now`/`_sleep` correction still holds** after this round's re-measurement, and §1.4 records
  the new v1.3 measurement alongside it.

---

## Judgement on the size miss, and on cumulative growth

**The stated miss is the right miss and I do not raise it as a finding.** I checked the itemisation
rather than accepting it. Rule 4's restatement genuinely must state both the derived cases *and* the
superseded wording — "reinstating that wording is the failure mode" is not rhetoric, it is the
observed history of this defect regressing twice; the alias-hop ruling is the difference between a
test that reds on the regression and one that reds on the shipped tree; AT-43a's second fixture is the
oracle for the fix. All three are normative, and the ~2.5 KB paid for by compressing the v1.2
changelog is a real payment. Trimming further would have meant deleting rules.

**On cumulative growth I am asked to say plainly, so: yes — 107 KB → 173 KB has made this document
measurably harder to implement from, and this round's Medium is the evidence rather than my
impression.** The listing-failure contract is now stated in **six** places — §2.5 step 2, §4.2's
table, §6.2 rows 1, 2 and 17, §8.3's AT-43a, and §9.3's DC-11 row — and a revision that changed one
of them left the other five asserting the opposite. That is not an authoring lapse; it is what a
document of this size does to any edit that touches a contract restated for the reader's convenience.
The same shape produced my v3 F-01 (one bound, three sites) and TE's N-04 (the same bound, the same
three sites). Three rounds running, the residual defects have been consistency failures across
duplicated statements of a single rule, never errors in the rule itself.

That is a real product cost and it lands on the implementer, so the brief for the next revision should
be **"state each contract once and cite it"** rather than another byte target — the byte target keeps
being missed for defensible reasons while the duplication that actually costs something keeps
growing. F-01's option (a) is a rare chance to pay that down and fix a defect in the same edit.

---

## Positive Observations

- **The N-01 fix is the third consecutive fix made by moving a rule into the type or the control-flow
  graph rather than into a clause.** `{}` versus `null` is the same move as G-INV and S-INV: the
  distinction becomes impossible to lose rather than remembered. "An *empty* Map is the measurement
  'there are no review files'; `null` is the *absence* of a measurement" is the sentence the next
  implementer needs, and it is stated where they will read it.
- **"Why the old wording is not reinstated" is the right paragraph to have written.** A defect that
  has now regressed twice earns an explicit statement of the wording that must not come back, with the
  trace that shows why. That is load-bearing text and I would not accept its deletion for a size
  target.
- **The alias hop was ruled once and reused, and explicitly bounded.** "At most one alias … 'forwarded
  to anything that eventually defaults it' would restore the TE-v2 N-02 hole" — the author fixed a
  false-alarm test without loosening it into uselessness, which is the failure mode that would have
  been easier.
- **Both Lows were fixed by deletion.** `structural` deleted rather than given a report field; the
  FSPEC's stale sentence deleted rather than reworded. R-5 applied in both directions without being
  cited as cover for dropping anything normative.
- **The two lenses' duplicate finding was fixed once and said so.** "TE N-04 ≡ PM F-01 … the same
  DC-02 slip found independently by both lenses" — reconciling rather than fixing twice is what keeps
  the two reviewers' records consistent for harvest.

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | Under F-01 option (b), is a mid-loop unreadable `docs/{feature}/` really a state the run should proceed through? The FSPEC's answer is no, and I can see the argument for continuing (the remedy — revision — is already correct, and halting mid-loop discards a partially-completed round). If that argument is the intended one, it is a **product** decision about operator experience and belongs in the FSPEC as an amendment, not in a TSPEC row that reads as an implementation detail. |

---

## Recommendation

**Needs revision**

What must change, in order:

1. **F-01 (Medium)** — resolve the mid-loop `ListFailure` disposition **one way**. Either delete the
   `present === null` path (rule 4's first bullet, §6.2 row 17, AT-43a fixture (b)) and let the
   existing halt stand, or keep it and mark it as a scoped exception in §4.2, §6.2 row 2, §6.6's
   count and §9.3's DC-11 row, give it a carrier in §4.7, and amend the FSPEC that owns the contract.
2. **F-02 (Low)** — give `refreshReviewState`'s `kept` an initialiser, or drop it with F-01 option (a).

Nothing else in the round-3 revision broke anything I approved at v1.2, and my v3 Low is closed.

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 1}
