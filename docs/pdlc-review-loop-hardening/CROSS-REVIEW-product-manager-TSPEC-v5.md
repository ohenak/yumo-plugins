# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md` (v1.4, 172,953 B — measured)
**Sources of truth:** `REQ-…` **v1.6**, `FSPEC-…` **v1.8** — **neither touched this round** (verified: `git diff afc4234^..HEAD` over both paths returns empty; the TSPEC is the only file in the range's diffstat, 123 insertions / 105 deletions)
**Baseline diffed:** `afc4234^..HEAD` on `feat-pdlc-review-loop-hardening` (HEAD `67a29de`)
**Date:** 2026-07-30
**Iteration:** 5 (delta — final iteration of the capped loop)
**Scope:** Delta only. My two v4 findings verified; the sections this round touched (§0 changelog, §1.1,
§2.6, §3.7, §3.9, §4.2, §5.6.1 incl. rule 4, §6.2 row 17, §8.3 AT-43a, §9.3) read in full at HEAD, plus
the four sections the `reviewLoop` signature reduction reaches into but did not edit (§2.5 step 5, §5.4,
§5.5, §5.7) — read specifically to answer "did a consumer lose a value it needed". Sections I approved at
v1.2 and re-confirmed at v1.4 were **not** re-reviewed. Product lens: fidelity to the approved FSPEC's
stated contracts, operator-visible attributability, scope discipline in both directions. Per lesson R-6 no
citation-drift finding is raised at any severity. Per lesson R-5 every fix I would ask for below is a
deletion. The peer `te-review`'s v5 file was not read or touched.

---

## Verification of my two v4 findings

| Prior | Status | Evidence |
|---|---|---|
| **F-01** (Medium) — the mid-loop `ListFailure` was a third, unmarked disposition contradicting FSPEC §3.3's "every caller halts", with no operator surface | **Closed, by my option (a), and closed completely** | Every site I named is resolved, in the direction that needed no FSPEC amendment. §4.2 gains the generalising sentence — "**These dispositions are properties of the value, not of the call site.** Every caller applies this table unchanged — the phase-entry derivation (§2.5 step 2) and §5.6.1's per-episode `refreshReviewState` alike … narrowed or excepted by neither" — quoting FSPEC §3.3's own "one halt, with one shape … no caller invents its own wording". §5.6.1's pseudocode now reads `otherwise ─► halt` with `dir_missing ─► r.files ← []` beside it, so the benign value is visibly untouched. §6.2 row 17 no longer states a disposition at all: "**exactly rows 1 and 2; no exception claimed.** This row exists only so the seam's second call site is enumerated." §9.3's DC-11 row follows ("shared across **every** listing call site, none excepted"). Rule 4's `present === null` bullet and §3.7's `Map \| null` union are deleted; `present` is an ordinary `Map` at every call of `selectMode`, and I grepped the tree for residue — the only surviving mentions of `null`/"not observed" are the changelog's historical record of the two superseded wordings and row 17's explanatory clause, both correctly retrospective. **The attributability half of my finding is answered, not worked around:** the operator surface is the halt itself, whose shape §4.2 fixes, which is why no §4.7 carrier and no third `§6.6` signal was needed. My Q-01 is answered with the FSPEC's own answer. |
| **F-02** (Low) — `refreshReviewState`'s `kept` had no initialiser | **Genuinely moot** | `kept` is deleted, not initialised, and it is gone from the pseudocode entirely — grep finds it only in the v1.4/v1.3 changelog rows describing its removal. The branch that dereferenced it is the branch that now halts, so there is nothing to initialise and no `NaN`/garbage round coordinate can be constructed. This is the R-5 resolution and it is strictly better than the initialiser I offered as the alternative. |

**TE's N-02 (my brief asked me to confirm it is moot, not silently dropped).** AT-43a fixture (b)'s
unspecified "the failure reported" conjunct is gone; the assertion is now the halt and its exact reason
string. I verified the two things that would have made "moot" false: **§4.7 is untouched** (no hunk in the
diff, no new field, no new report line), and **§6.6 still closes at "Two signals … are reported and never
halt"** — the commit-diff proxy and `UNEVALUABLE` — which is now *correct without amendment*, because a
mid-loop listing failure halts and therefore is not an advisory signal. At v1.3 that count was wrong; at
v1.4 it is right for the right reason. Moot confirmed on both counts.

---

## The `reviewLoop` signature reduction — the verification I was asked for

**Bottom line: no consumer lost a value it needed. The reduction is behaviourally sound.** I traced all
three deleted-or-retained values rather than accepting the changelog's claim:

- **`startIndex`** — never was a seed parameter; it arrives as `iteration` and all seven call sites pass
  the branch-derived value (§3.9, §9.2 H-1 row). Unaffected.
- **`present`** — §2.5 step 2's map *is* still consumed at phase entry, and by a real reader: §5.4 tier 1
  branches on `present.get(r) does not contain candidate → NOT APPROVING`. The author's claim holds for
  this value.
- **`reviewFiles`** — the claim holds only partially, and this is where the edit left residue. At phase
  entry §5.4 is `reviewFiles`' **producer**, not its consumer; its only consumer was `reviewLoop`. So the
  map §5.4 explicitly "carries out … whichever exit is taken" now has **no reader anywhere**. Nothing
  downstream is starved — §5.5 takes `recordedHash` from §5.4's `anchor ← parseApprovalHash(text)`, not
  from the map, and every episode rebuilds its own `reviewFiles` inside `refreshReviewState` — but the
  carry-out is now dead data whose stated justification names a deleted parameter. That is F-02 below.

**No fail-open was reintroduced.** I checked the one direction that would matter: for the refreshed
`reviewFiles` to be worse than the seed it would have to make an episode *greenfield* that should be
revision. Greenfield requires `present` to be empty, and on every path where the seed differed from the
refresh (`forced`, `candidate < 1`) `present` is either non-empty or empty for the same reason in both.
Mode is `revision` under either input. The reduction cannot regress TE-v2 N-01 or v1.2's fail-open.

**Was it safe to make a signature change outside the direction at iteration 5?** On the merits, yes — an
unread parameter is the `structural` anti-pattern this document deleted at v1.3 for exactly this reason,
and leaving two of them in a signature seven call sites must be updated to would have been the worse
outcome. But it is the edit that produced all three of this round's findings, which is itself the answer to
the question the brief asked: the reduction is right, and its restatements were not swept.

**AT-43a(b)'s repurposing was the better call than my "delete it as unreachable".** I accept the
correction. The fixture's red-claim checks out in all three directions it asserts: v1.2's implementation
reads the kept `{}` as an observation ⇒ greenfield ⇒ terminal on dispatch 1 (no halt ⇒ red); v1.3's
returns `present: null` and continues as a revision episode (no halt ⇒ red); and an implementation routing
a mid-loop `unreadable` into row 1's benign path continues with an empty listing (no halt ⇒ red). The two
fixtures' oracles now differ because their outcomes do — (a) asserts a dispatched episode's mode, round and
budget, (b) asserts the halt and the *absence* of a round-2 dispatch — which is what makes deleting (b) a
loss of coverage rather than a tidy-up. Deleting it would have left the path TE's original N-01 was about
with no oracle at all.

**The clean-branch reasoning holds, and it is the load-bearing claim of the round.** `docs/{feature}/`
exists on any branch this pipeline runs on because the REQ the pipeline was invoked with lives in it
(entry is `/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md`), so a cross-review-free branch produces
a **successful** listing that yields no conforming rounds — `startIndex = 1`, `present` empty, greenfield —
and never `dir_missing`. `dir_missing` is untouched and still benign in both §4.2 and §6.2 row 1, so even
the branch where the directory genuinely is absent does not halt. **This change cannot make a first run
halt.** (§8.3's and the changelog's phrasing "§6.2 **row 1**'s successful empty listing" points at the row
that *is* `dir_missing` while the sentence's own substance says the opposite in the same breath; the two
readings have identical dispositions, so per R-6 I raise nothing — noted only so the author knows it was
seen and judged harmless.)

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **Two sites still state the five-parameter signature the round deleted.** §2.5 step 5 reads `` 5. reviewLoop(…, iteration = startIndex, present, reviewFiles) `` and §5.6.1's S-INV preamble reads "`reviewLoop`'s signature gains `present`, `reviewFiles`, `docType`, `_listFiles` and `_readFile` (§3.9)" — both citing or depicting the v1.3 shape, and the second contradicted explicitly twenty lines below it ("the loop needs no seed maps: `reviewLoop` takes `docType` and the two seams and nothing else new (§3.9)") and by §3.9 itself ("**Three new parameters** … No seed `present` / `reviewFiles`: … a seed would be an unread parameter"). Low, deliberately, and I tested it against the bar rather than assuming: an implementer who follows the stale sites produces **two unread parameters and no behavioural difference** — no oracle reds on it (§8.5's E-classes govern `main()`'s `_`-prefixed injections, not `reviewLoop`'s data parameters, and no AT enumerates this signature), nothing fails open, and the fix is deleting two identifiers with no rework. It is not a contradiction an implementer *cannot* satisfy — both readings run — which is what keeps it out of Medium. **Fix (R-5): delete the two words from §2.5 step 5 and the two from §5.6.1's sentence; §3.9 already owns the signature.** | §2.5 step 5, §5.6.1, §3.9 |
| F-02 | Low | Local | **The phase-entry `reviewFiles` map now has no consumer, and §5.4's justification for building it names the deleted parameter.** §5.4 closes: "`reviewFiles` … is carried out of the search alongside the verdict, whichever exit is taken, **because §5.6.1 consumes it (§3.9)**. On the `candidate < 1` exit and on the forced path it is **empty, not absent**, and §5.6.1 rule 4 rules that case." After the reduction §5.6.1 consumes no such parameter, and I traced every other candidate reader — §5.5 takes `recordedHash` from §5.4's `anchor`, not from the map; §2.5 step 4 likewise; each episode builds its own inside `refreshReviewState`. So this is dead data by the same test the document applied to `isTerminal`'s `structural` at v1.3 ("no consumer, no report field and no AT … it is **deleted**"). No behaviour depends on it and building it is free (the tier-1 reads happen anyway for the verdict), which is why this is Low and not Medium. **Fix (R-5): delete the paragraph, or reduce it to the one claim that is still true — `present` is carried out because §5.4 branches on it.** | §5.4, §5.6.1, §3.9 |
| F-03 | Low | Local | **Rule 4's surviving bullet and §5.7's closing pair describe an input that can no longer reach `selectMode`.** Rule 4 keeps "…or the read was never performed — the forced path, where §2.5 step 3 is skipped and `reviewFiles` is empty", and §5.7 states "A forced phase's `reviewFiles` is **empty**, since step 3 is what populates it. That is a `selectMode` rule-4 input, not a greenfield one." But `refreshReviewState` performs the tier-1 reads **unconditionally at every episode entry**, force or not, so an empty-because-step-3-was-skipped `reviewFiles` is never what `selectMode` sees. (Strictly this was already true of v1.3's *pseudocode* — the seed was never read — so the reduction exposed the staleness rather than causing it; I raise it now because rule 4 was rewritten this round and the clause was carried forward into the rewrite.) **No behavioural risk, and I checked the one case that could have had some:** on a forced phase past an approving round, rule 2's "highest round … that does not carry same-round dual approval" now finds none, so `round` is `null` and the pseudocode's stated fallback `roundIndex: sel.round ?? startIndex` opens a new round as a revision episode — coherent, fail-closed, and the sensible operator semantics for "re-run this despite approval". It is simply not narrated. **Fix: delete the forced-path clause from rule 4's bullet (the unreadable-verdict case carries it), delete §5.7's two sentences, and — if one sentence is spent anywhere — state that a forced phase's first episode refreshes like any other and opens a new round.** | §5.6.1 rule 4, §5.7, §5.4 |

**No High findings. No Medium findings.** Three Lows, none of which must be resolved before code is
written, and all three of which are one-line deletions in the implementer's own path.

---

## On the deliberate deferral of the de-duplication pass — asked, and answered plainly

**Not undertaking it at iteration 5 was the right call, and I would have raised a finding if it had been
attempted.** A document-wide pass over a 173 KB spec is a large uncontrolled diff arriving at the exact
moment the loop has no iterations left to verify it; the class of defect it would introduce is the class
this loop has spent four rounds catching, and it would land unreviewed. Replacing restatements with
citations **only where an edit was already open** (§2.6 → §5.6.1's bound; §6.2 row 17 and §9.3's DC-11 row
→ §4.2) is the correct scope, and §4.2's new sentence is better than a citation would have been because it
makes the next edit to that contract *structurally* unable to leave five sites asserting the opposite —
the disposition is now stated once as a property of the value, and row 17 explicitly claims no exception
rather than restating one.

**It does leave a real, bounded cost for the implementer, and I will not pretend otherwise: all three of my
findings this round are that residue**, and they are the fourth consecutive round in which every residual
defect is a consistency failure across duplicated statements of one rule rather than an error in the rule.
This round it was a *signature* rather than a contract, restated in four places (§3.9, §2.5 step 5, §5.6.1,
§5.4) of which two were updated. Weighed against the cap, three non-behavioural Lows in the implementer's
immediate reading path is cheaper than an unreviewed 173 KB diff — so the trade was made correctly. What I
would ask of implementation rather than of this document: **treat §3.9 as authoritative for signatures and
§4.2 as authoritative for `ListFailure` dispositions when a restatement disagrees**, and fold my three Lows
into the first commit that touches `reviewLoop`. The document has no stated precedence rule between an
owning section and a restatement of it; adding one is a cheaper permanent fix than any de-duplication pass
and I flag it for Harvest rather than raising it here.

That the lesson is recorded in the changelog and flagged for Harvest is the right disposition, and it is
the one durable output of this phase that will outlive the feature.

---

## Positive Observations

- **The fix chosen is the one that shrank the document *and* needed no FSPEC amendment.** Halting is
  strictly more fail-closed than v1.3's continue, so it cannot reintroduce the fail-open it descends from;
  it excepts nothing; and it is the first revision in four rounds not to grow the file (−25 B, honestly
  measured and honestly caveated as "only just"). Option (b) would have reopened the FSPEC, excepted four
  further sites and invented a report carrier — the changelog's comparison of the two is fair and I would
  have argued the same way.
- **§4.2's new sentence is the correct generalisation, not a patch.** "These dispositions are properties of
  the value, not of the call site" is the fourth consecutive fix made by moving a rule into the type or the
  control-flow graph rather than into a clause — after G-INV, S-INV, and `{}`-versus-`null`. It is a
  statement whose scope covers call sites that do not exist yet, which is what stops this defect
  relocating a fifth time.
- **§6.2 row 17 rewritten to assert *nothing* is the strongest available form.** A row that says "exactly
  rows 1 and 2; no exception claimed … this site does not get its own" cannot drift from the contract,
  because it no longer restates it. That is the shape the other five sites should eventually take.
- **The two superseded wordings are recorded, and that is load-bearing text I would defend against a size
  target.** A defect that has now moved twice earns an explicit "not reinstated" record with the trace of
  why each was wrong — and paragraph (ii) is notably honest, naming v1.3's fix as fail-closed but wrong for
  a structural reason rather than reframing it as a mistake.
- **`kept`, the seed maps, the `null` arm and the union were all closed by deletion, and the one thing that
  looked deletable was kept.** R-5 applied in four places without once being used as cover for dropping
  something normative — and AT-43a(b), the one item I proposed deleting, was correctly retained because
  deleting it would have dropped an oracle. Deletion discipline that also knows when not to delete is the
  harder half.
- **Both reviewers' findings were reconciled as one cluster at two severities and dispositioned once.** "All
  five findings are one defect cluster … PM F-01 ≡ TE N-03, PM F-02 ≡ TE N-01" — and "moot, not fixed" is
  stated as such rather than dressed up as a fix, which is what let me verify it in two greps instead of
  taking it on trust.

---

## Questions

None. My v4 Q-01 is answered — the FSPEC's own answer was taken, and I agree with it: a run should not
proceed through an unreadable `docs/{feature}/`.

---

## Recommendation

**Approved with minor changes**

**Is this document ready to implement from? Yes.** Every contract an implementer must not get wrong is
stated once, in a section that owns it, and the two that were duplicated across six sites now resolve to
one statement plus citations. The listing-failure disposition is total and has no exceptions; `selectMode`'s
input domain has no third value; the halt is the operator surface; a clean branch and a missing directory
both run rather than halt; and the `reviewLoop` reduction starves no consumer. My three Lows are stale
restatements of a signature, not defects in behaviour — fold them into the first commit that touches
`reviewLoop` (delete, per R-5; do not reconcile), and carry the "owning section wins over a restatement"
precedence rule to Harvest.

VERDICT: Approved
