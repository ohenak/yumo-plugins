# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md` (v1.2)
**Sources of truth:** `REQ-…` **v1.6**, `FSPEC-…` **v1.7** (FSPEC amended this round; §20 re-read)
**Baseline diffed:** `50c8717..HEAD` on `feat-pdlc-review-loop-hardening`
**Date:** 2026-07-30
**Iteration:** 3 (delta)
**Scope:** Delta only. My six v2 findings verified individually against the tree and the amended
documents, then the changed sections of the TSPEC, plus the full FSPEC v1.6→v1.7 diff, the one-line
REQ diff and the `QUEUE.md` amendment. Unchanged sections were not re-reviewed. Product lens:
fidelity to REQ acceptance criteria and FSPEC obligations, scope discipline in both directions,
observable operator behaviour, and altitude. Technical design and test mechanics remain out of scope;
where I cite an AT it is for the operator-facing contract it pins, not for its construction.

---

## Verification of my six v2 findings

| Prior | Status | Evidence |
|---|---|---|
| **F-01** (High) | **Fixed, and fixed at the right altitude** | §2.5 renames step 4a to **step G** and states **G-INV** normatively: "Step G is evaluated on **every** exit that leads to running the phase, and step 5 is reachable only through it. No path — forced, unforced-with-no-candidate, unforced-not-approving, `STALE`, `UNEVALUABLE`, or any exit added later — may reach `reviewLoop` without having passed step G." I traced all five exits in the source text, not the changelog: step 1 forced ⇒ "do step 2, SKIP steps 3–4, then step G"; §5.4 `candidate < 1` ⇒ step G; §5.4 `NOT APPROVING` ⇒ step G; §5.5 `STALE` ⇒ step G; §5.5 `UNEVALUABLE` ⇒ step G. §5.4's closing paragraph restates it from the callee side ("a `run the phase` arrow drawn from here straight to step 5 is the defect it exists to forbid"), §5.5's effect column routes both non-`FRESH` results to step G, §5.8 declares `checkPostmortem` a query with exactly two callers, and §6.2 row 13 is rescoped from "step 4a or step 1" to "any path reaching §2.5 step G … (G-INV)". Step 2's two exits cannot bypass it either: `dir_missing` falls through to step 3, the other `ListFailure`s halt. **See the dedicated section below for the third-direction check and for both worked examples.** |
| **F-02** (Medium) | **Fixed — and fixed better than I proposed. My literal proposal was wrong on its second half.** `isTerminal` now returns `{ terminal, structural, trailerReason }` (§3.7, §5.6.2); `dispatchAndVerify`'s return union carries `trailerReason` on **all three** exits — `ok:true`, `no_progress`, `dispatch_budget` (§3.8, and the loop pseudocode rebinds it every dispatch); §4.7 adds the fourth report **line**, "on any episode that did not reach terminal … `trailerReason` echoed verbatim as one of `declared_incomplete` / `absent` / `duplicated` / `unparseable`", omitted when `null`. AT-61's four echoed reasons therefore reach the report, FSPEC §2.2's "giving them a consumer" is satisfied, and TE F-06's discarded-rejects defect is not reintroduced. **On the deleted union member — the author is right and I was wrong.** See the ruling below. |
| **F-03** (Medium) | **Fixed** | `QUEUE.md` row is now `\| 9 \| blocked \| pdlc-authoring-contract \| … \|`. I diffed the table: the change is confined to that one row's `Order` cell and the prose beneath; **no existing row was touched**, and **row 0 still reads `halted`**. The 2026-07-29 banner is therefore no longer self-falsifying and the ~10 live "row 8" references still resolve uniquely to row 0. The prose states the durable rule — "`Order` values are allocated, never reused" — which is the part worth keeping. Every downstream reference is updated: `grep -n 'row 8\|Order 8'` over the TSPEC returns only §0's own account of the fix and §6.2's unrelated failure-table row 8; §10.2/§10.3 and §0.1 all say Order 9, as do FSPEC §20's two bound rows. |
| **F-04** (Low) | **Fixed by deletion, as asked** | The "at exactly **two** places, with **two** different powers" sentence is gone. §2.5 now says "The **one** call of `checkPostmortem` that is not step G is step 4's `FRESH` branch" — a statement about the exception rather than a count, so there is no number left to fall out of step with the table. R-5 applied. |
| **F-05** (Low) | **Fixed** | §4.7's field table: `postmortemPath` is now "§6.3, **and §5.8 whenever `postmortemStatus` is `"unresolved"`**", and the prose is inverted from "`haltPhase` and `postmortemPath` stay `null`" to "`postmortemPath` is populated with it, so the datum AC-2.5 wants structured is never available only inside prose. `haltPhase` stays `null` … that field alone is what distinguishes 'skipped, and by the way there is an open POSTMORTEM here' from 'refused because of it'." Exactly the shape I asked for, and the skipped/refused distinction survives on one field. |
| **F-06** (Low) | **Fixed in the FSPEC, which is where I said it belonged** | FSPEC → **v1.7**, §20 only. Q-05 and Q-09 move out of the open table into a **Closed at v1.7** table and are **bound to `docs/_queue/QUEUE.md` Order 9**; Q-06 is **declined and closed** — "Not deferred — the answer is no" — on C-5 grounds, with "Reopening it needs a new requirement, not a revision of this one." The changelog states the disposition and that "**No behavioural section changes**; §20 is the only section touched", which the diff bears out: 28 lines, all in the header block and §20. The altitude complaint is answered — the closure is now recorded in the document that owns the question, and the TSPEC's §10.2 no longer closes a product question unilaterally. A formatting slip is fixed in passing (Q-09's stranded row). |

All six closed. No prior finding is carried forward.

---

## The third-direction check on G-INV

The defect regressed twice in opposite directions, so the question this round is not "is the stated
rule right" but "does the rule hold in the direction nobody has broken yet" — i.e. **does step G now
refuse in some case where the REQ says the run proceeds?** It does not, and the reason is structural
rather than accidental:

- AC-2.3 conditions the refusal on "an unresolved POSTMORTEM for that phase and feature **and the
  phase would otherwise run**". AC-2.3b names exactly **one** state in which a skip-eligible phase
  does not run: AC-4.1's approved-and-`FRESH` skip. Every other outcome of steps 1–4 is "the phase
  runs".
- §2.5's flow has exactly one non-running exit downstream of the approval machinery — step 4's
  `FRESH` branch — and G-INV places the gate on the complement of that one exit. So the gate's
  precondition and AC-2.3's precondition are the *same set*, not two enumerations that have to be
  kept in agreement. That is the difference between this fix and its two predecessors, both of which
  were statements about which step numbers reach the gate.
- The `FRESH` branch is explicitly excluded and explicitly still *reports*: "the query is evaluated
  for **reporting only** and cannot change the outcome … That is the call an implementation drops
  silently." §6.2 row 13a records it as an intentional non-failure. So the invariant does not
  over-refuse on the one path where the REQ says the run continues.
- The forced path is the case where over-refusal would be easiest to introduce, and it is right:
  AC-4.6a says a forced phase "is still subject to AC-2.3 … Forcing overrides **recorded approval
  only**", and REQ AC-2.3b worked example B withdraws force as a bypass. §5.7's Precedence paragraph
  and §2.5 step 1 both match. Note this is now *weaker* than v1.1's "refuses unconditionally at step
  1" — under G-INV a forced phase with **no** POSTMORTEM, or a resolved one, proceeds. That is the
  correct reading of AC-4.6a: force is refused by AC-2.3, not by the mere fact of being forced.

**Both worked examples verified reachable by me, from the source text.**

- *Example A* (FSPEC §12.4, pre-harvest): approving pair present ⇒ `candidate = startIndex − 1 ≥ 1`
  ⇒ tier 1 approving with matching anchors ⇒ §5.5 `FRESH` ⇒ **step 4 skips, step G is not on that
  path**, §5.8's report-only caller fires and §4.7's notice appends `; unresolved POSTMORTEM at
  {postmortemPath}`. The run continues to Phase F. Reachable and reached.
- *Example B* (AC-2.3b, post-harvest): zero `CROSS-REVIEW-*` files ⇒ `present` empty ⇒
  `startIndex = 1` ⇒ `candidate = 0` ⇒ §5.4's `candidate < 1` exit ⇒ **step G** ⇒ `unresolved` ⇒
  refuse, halt, Recommendation excerpt reproduced (§6.2 row 13, §6.4). Reachable and reached, and
  the AC's closing sentence — "When approval is absent or stale (AC-4.4), the phase would run and
  AC-2.3 refuses" — now has a code path for **both** halves.

**AT-13a is a real oracle for the invariant, not a restatement of it.** §8.3's TSPEC-local table
gives it as: for each of the four exits that lead to running the phase — forced, `candidate < 1`,
`NOT APPROVING`, `STALE`/`UNEVALUABLE` — an unresolved POSTMORTEM refuses and the halt reproduces the
Recommendation; **and** the `FRESH` exit does *not* refuse but names the POSTMORTEM in its skip
notice. That is the invariant asserted in both directions, which is what kills a third regression:
a fix that reintroduces a bypass reds one of the four rows, and a fix that over-generalises the gate
reds the fifth. Driving FSPEC §12.4 A and AC-2.3b B **verbatim as fixtures** binds the test to the
REQ's own text rather than to the TSPEC's paraphrase of it, so a future edit to the worked examples
cannot silently diverge from the oracle. The ids are letter-suffixed (`AT-01a`, `AT-13a`, `AT-43a`)
and namespaced `RLH-AT-{N}`, so no collision with the FSPEC's catalogue — I checked: the FSPEC
contains none of the three.

One honest limit, stated rather than raised as a finding: AT-13a enumerates the **five exits that
exist today**. G-INV's wording binds "any exit added later", but no test does — a sixth exit added in
implementation would have to be caught by a reader of §2.5, not by a red. That is inherent in
testing an invariant over a control-flow graph, the prose does the right thing by naming it, and the
alternative (a derived enumeration of exits) is not available under C-2. It is the residual risk, and
it is smaller than either of the two shapes it replaces.

---

## Ruling on the F-02 deviation

**The author is right, and my proposal was right on the carrier and wrong on the union member. I
withdraw the second half of it.**

I asked for two things: (a) restore a carrier for the trailer reason, and (b) give §3.8's declared
`{ ok: false, reason: "trailer", detail }` a producer. (a) was the finding; (b) was me assuming the
declared union was the contract and the missing producer the defect. It is the other way round. A
producer for `reason: "trailer"` would be an episode **ending** because of a trailer failure, and
FSPEC AT-61 states all four trailer reasons as *non-terminal* while FSPEC-derived §4.3 disposes of
all four as "continue" (`declared_incomplete` is explicitly "the normal paced path, not an error").
Manufacturing that producer would have created exactly the class of defect I am here to catch — a
TSPEC narrowing an acceptance test — to satisfy a shape I proposed. Deleting the member is the
correct fix, it is the R-5 move (delete the ambiguous clause rather than reconcile it), and §5.6.2
states the reasoning at the point of the deletion where a later editor will see it: "an episode ends
only on terminal, `no_progress` or `dispatch_budget`."

The requirement I actually cited is met. AT-61's four reasons reach the report via `trailerReason` on
every `dispatchAndVerify` return plus §4.7's report line; §3.8's union is now exactly the set of
things that can end an episode. That is a better document than the one my finding would have
produced.

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **§2.6's no-cache justification became false this round and is the one place it matters.** The bullet still reads: "**No caching layer over `_listFiles`.** The read fan-out is already bounded (one `_listFiles` and at most two `_readFile` per phase entry, §5.4); a cache would add an invalidation problem in exchange for nothing measurable." S-INV's new `refreshReviewState` runs "at **every** wrapped episode entry", each doing "one `_listFiles` + ≤2 `_readFile`", which §5.6.1 correctly re-bounds at `(1 + MAX_REVIEW_ROUNDS) × (reviewers + 1)` listings per phase — up to 18 listings and ~36 reads, not one and two. The per-phase-entry claims elsewhere (§4.4, §5.4 step 3) remain true because they are about the approval search, which does still run once per phase entry; §2.6's is the aggregate claim, and it is the sentence a reviewer reads to check the cost of *not* caching. The decision itself is unaffected — §5.6.1 argues the cost on its own terms ("a listing of one directory is cheap next to an Opus dispatch") and the alternative it rejects is the memory-threading §5.6.3 rejects everywhere else — so this is a stale measured claim under DC-02, not a design defect. Per R-5, delete the parenthetical or point it at §5.6.1's measured bound rather than adding a reconciling sentence. | DC-02, §2.6, §5.6.1 |

No High and no Medium findings, old or new.

**Mechanical, not findings (lesson R-6):** FSPEC §20's new "Closed at v1.7" preamble says "The
**Owner** column below is the disposition, not a forwarding address", but the table's third column is
headed `Disposition`; the sentence refers to a column that no longer exists under that name — delete
it, the column header already says what it is. And §1.4's new v1.2 sentence cites
`orchestrate-dev.js:1283` as a bare `file:line`, which is the form §1.4's own convention paragraph
forbids two sentences earlier; the enclosing symbol is already named in the same clause, so only the
`:1283` needs dropping. Neither affects behaviour.

---

## Verification of the round's factual claims against the tree

Because two of this round's edits rest on a correction to a claim earlier reviews had repeated
wrongly, I checked it rather than accepting it. `grep -n '_now\s*=\|_sleep\s*=\|function checkPrCi'
pdlc/workflows/orchestrate-dev.js`: `checkPrCi(prUrl, { execFn } = {})` at `:874` — it takes
`execFn` and nothing else; `raisePrAndVerifyCi` at `:1283` declares `_now = () => Date.now()` and
`_sleep = sleep`. The author's correction is right and §8.5's E-2 row now states it right ("`checkPrCi`
takes only `{ execFn }` and never sees them"). Three earlier documents had the wrong callee; that a
size-discipline pass caught and fixed a claim nobody had challenged is the DC-02 behaviour working.

The size figures are also as stated: v1.1 measured 155,549 B at `50c8717`, v1.2 measures 164,456 B,
so `+8,907 B (+5.7%)` is exact.

---

## Judgement on the size miss

**The trade was correct, the miss is the right miss, and the ratio I flagged has measurably improved.
I am not raising it.**

I asked for net-neutral and got +5.7%. Two things make that acceptable rather than a repeat:

- **The compression happened, and it happened in the sections I named.** I diffed the four
  "size discipline" commits rather than trusting the summary. §5.2's rejects paragraph, §5.3's
  failed-append paragraphs (three collapsed into one), §7.2's bundle-size paragraph, §8.5's three
  explanatory paragraphs and §10.2/§10.3's dispositions are all shorter, and in every case **the rule
  survived and only the argument for it shrank** — the unequal/≥2 dispositions, the "never overwrite,
  delete or reconcile" prohibition, AC-1.4's citation, E-1/E-2/E-3's predicates, the anti-rot clauses
  and the "omitting an initialiser is not among them" conjunct are all still there. The v1.1
  changelog and the §0.1 annex are now finding→resolution rows, which is the right shape once both
  reviewers have verified those fixes. That is exactly the "3–8 lines of rule, 15–25 lines of
  rationale" inversion being corrected, in the places I said it had inverted.
- **The addition is the two Highs' fixes and nothing else.** §5.6.1's wiring subsection is the only
  place S-INV can live — the invariant is precisely a statement about a caller, so it cannot be
  stated without one. §2.5's step G and its reachability paragraph are load-bearing because this
  defect has now regressed twice from being stated as a step rather than an invariant. Three ATs, two
  restated §8.2 properties and §6.2 row 17 are the oracles for those two fixes. I looked for
  rationale-shaped growth in the added text and found the reachability paragraph, which is the one
  place I would have insisted on it anyway.

Going further would have meant deleting normative rules to hit a size target, which is the wrong
trade every time; the document says so and it is right. The one structural fact worth carrying into
PLAN is that this TSPEC is now 164 KB against a 266 KB FSPEC, and the next round's brief should be
"no growth without a deleted rule to pay for it" — but that is a note for the next author, not a
finding against this one. A stated, measured, reasoned miss is not the same failure as an unremarked
44.8%.

---

## Positive Observations

- **The fix was made at the right altitude for the first time in three rounds.** v1.0 stated the gate
  as a pre-step-1 step, v1.1 as a post-step-4 step; both were true of the paths their author was
  looking at and false of one path they were not. v1.2 states it as a property of the control-flow
  graph — "discharged by placing the gate at the single point all such exits converge on, never by
  enumerating which steps happen to reach it today" — and then pins that property with a test that
  asserts both directions. The clause "or any exit added later" is the part that makes it durable.
  Both this round's Highs were fixed by the same move (`G-INV`, `S-INV`), and the changelog names
  that as the shared root rather than reporting two coincidences.
- **The one deviation from a reviewer's literal proposal was the right call, and it is flagged as a
  deviation.** §0's "Nothing is declined" paragraph names PM F-02 as the place a proposed *shape* was
  not taken, states what was done instead, and states the requirement it still meets. Under DC-02
  that is the behaviour the constraint exists to produce; complying with my proposal would have put a
  FSPEC contradiction in the TSPEC.
- **A size-discipline pass found and corrected a factual error three documents had repeated.** The
  `checkPrCi` → `raisePrAndVerifyCi` correction was not asked for by any reviewer and could have been
  left; it was measured, fixed, and recorded in §1.4 with the overturn explicitly counted alongside
  the two v1.1 measurements that overturned reviewer premises.
- **F-03's fix carries the durable rule, not just the character change.** "`Order` values are
  allocated, never reused" in `QUEUE.md`'s own prose is what stops the next author re-creating the
  collision after this feature is harvested; the one-character change alone would not have.
- **Q-06 is closed with the word "declined", not "deferred", and the difference is spelled out.**
  "Not deferred — the answer is no … Reopening it needs a new requirement, not a revision of this
  one." A closed question that reads as an open one is the DC-08 failure mode; this is the antidote,
  and it is now recorded in the FSPEC where a reader of that document alone will see it.

---

## Recommendation

**Approved with minor changes**

Nothing blocks. One Low, non-blocking, to be picked up in PLAN or in passing:

1. **F-01 (Low)** — delete or re-point §2.6's "one `_listFiles` and at most two `_readFile` per phase
   entry" parenthetical; S-INV's per-episode refresh made it false and §5.6.1 already states the
   correct bound.

Non-blocking mechanical: drop the stale "Owner column" sentence from FSPEC §20's new preamble, and
the bare `:1283` from §1.4.

VERDICT: Approved
