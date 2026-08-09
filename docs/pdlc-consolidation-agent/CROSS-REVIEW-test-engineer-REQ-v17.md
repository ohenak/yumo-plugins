# Cross-Review: test-engineer — REQ (delta confirmation, erratum round)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.2)
**Date:** 2026-08-09
**Iteration:** 17
**Scope:** Local (per-finding tags below)
**Delta base:** `760ae1c6` (tree v16 reviewed) → HEAD `54a46433`; document last moved at `202441d0`

This is a **delta confirmation**, not a re-review. One question: do the two routed erratum items land
without breaking anything I previously approved? I read the erratum commit's diff, the two FSPEC
sections it cites, and the downstream oracles that consume both ACs. I did not re-read the other 670
lines, and nothing below re-litigates a settled decision.

## Delta

`202441d0` touched **one file, 12 insertions / 5 deletions**, in exactly three hunks: the version
row + erratum note (`:15-22`), AC-3.4 (`:271-274`), AC-6.3 (`:497-499`). No other clause moved, and
`git diff 202441d0..HEAD -- REQ-…md` is empty — the only later commit is the se peer's own v17
confirmation. So the bytes I judge here are the bytes the author wrote.

### Item 1 — AC-6.3's population (raised by me at te-author) — **resolved, and provably so**

The old wording ranged both conjuncts "across the consumed window". The new text ranges them over
"anywhere in `docs/_queue/ESCALATIONS.md`" and adds the explicit disclaimer: *"Both conjuncts range
over the **whole** file — no filter on `Feature`, none on date, no relation to the pass's consumed
set."* That is BR-37a's sentence (`FSPEC:2648`) transcribed, not paraphrased.

I checked this against the oracle rather than against the prose, because the oracle is what would
have gone red:

| Layer | Says | Agrees with v2.2? |
|---|---|---|
| FSPEC §9.5 table | "somewhere in `ESCALATIONS.md` … the population is the whole file, per §9.2" | yes |
| BR-37a (`:2648`) | "no filter on `Feature`, none on date, and no relation to the pass's consumed set" | yes, verbatim |
| AT-A6 (`:2223`) | one corpus run twice, `Feature` values **disjoint** vs **matching** the consumed set, verdict must be **identical** | yes |
| PROP-ADV-05 (`:866-874`) | same differential, cited to `AC-6.3, BR-37a · AT-A6` | yes |

AT-A6 is a differential test whose disjoint arm exists specifically to fail an implementation that
filters on the consumed set. Under v2.1 the REQ *described that filter*, so the disjoint arm reddened
a conforming implementation and the trace row `AC-6.3 → AT-A6` (`FSPEC:2387`) pointed at a test its
own AC forbade. That contradiction is gone: the four layers now state one population, and the REQ was
the last holdout. The fix also preserves the AC-6.1-row-3 non-empty-corpus guard and the
"proposed, never enacted" and PR-route conjuncts untouched, so PROP-ADV-05's three positive conjuncts
still transcribe out of the REQ unchanged.

### Item 2 — AC-3.4's second carrier (raised by me at te-author) — **resolved**

AC-3.4 now records the PR URL in `.consolidation-log.md` **only**, and says why: the proposal file is
written when and only when the pass has something it proposes but does not enact, and an opened PR is
enacted. FSPEC §5.3 is decisive on the premise — *"The file's existence is decided by the three rows
above and by nothing else"*, with the "only when" half pinned by AT-R7. The FSPEC's own trace row
maps `AC-3.4 → §10.2, §10.3 → AT-L1` (`:2370`) — the log record, never the proposal file — and
`§10.3`'s field table lists `pr:` under `AC-3.4, AC-7.2` (`:1858`). So the removed conjunct had no
downstream test asserting it, and nothing downstream loses an oracle by its removal.

This is the right resolution for the reason I raised it: the vacuous conjunct was the kind a fixture
author quietly satisfies by reading it charitably, which is how a green test stops meaning anything.
The remaining oracle is falsifiable and positive — the log's single terminal row carries a non-empty
`pr:` field, appended once (AC-7.2), never an in-place edit (AC-1.3).

## Findings

No High, no Medium. Nothing previously approved regressed. Three new Low observations, all created or
made visible by the delta, plus four Lows carried unchanged from v16.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-58 | Low | Local | **AC-3.4's justification clause is one degree more general than §5.3, and the over-reach is absence-shaped.** The operative sentence ("It is **not** also recorded in `CONSOLIDATION-PROPOSAL-{passId}.md`") is exactly right. The justification that follows — "on this path no proposal file exists to record into" — is not: §5.3 rows 2 and 3 (a consuming-repo retirement/revision, a consumer-config widening) can both coexist with a successfully opened PR, and AC-3.4's own parenthetical `(AC-3.5, AC-5.4, AC-6.3)` names all three causes as independent. So a pass can open a PR *and* write a proposal file. The risk is narrow but specific to my lens: a fixture author who reads that clause as an invariant writes `assert not exists(CONSOLIDATION-PROPOSAL-…)` on the AT-L1 path, which is both an absence-only oracle and red on a conforming pass that happens to carry a row-2 cause. Cheapest fix is one qualifier — "no proposal file exists **for this cause**" — or dropping the trailing clause and letting the parenthetical carry the reasoning. Not gating: FSPEC §5.3 answers it decisively today, so no downstream author is blocked. | AC-3.4 (`:271-274`), FSPEC §5.3 |
| F-59 | Low | Local | **AC-3.8b's proposal-file cause list is now one short of AC-3.4's.** AC-3.8b (`:315`) enumerates `CONSOLIDATION-PROPOSAL-{passId}.md (AC-3.5, AC-5.4)`; the new AC-3.4 enumerates `(AC-3.5, AC-5.4, AC-6.3)`, matching §5.3's three rows. Pre-existing text the delta did not touch, but the delta is what made the two lists visibly disagree in one document. Nothing turns on it — AC-3.8b's parenthetical governs *which artifacts get committed*, and the commit mechanics are identical whichever cause wrote the file. Adding `, AC-6.3` closes it. **Reconciled with se F-01 (v17), same severity and scope.** | AC-3.8b (`:313-315`), AC-3.4 |
| F-60 | Low | Process | **The erratum wave has no step that retires downstream cautions whose premise it falsifies.** TSPEC (`:1328`, `:2382`), PLAN (`:262`, `:616`) and PROPERTIES (`:831`, `:1861`) each carry a standing caution reading *"no AT-A fixture may be written against REQ AC-6.3's 'across the consumed window' wording"*. I verified PROPERTIES §13.1 directly: the **instruction** stays correct (write fixtures against FSPEC §9.5 / BR-37a), so nothing mis-implements if all six are left alone, but the **premise** is false as of v2.2. The durable signal is not about this REQ: an erratum that corrects an upstream document leaves behind downstream prose asserting the old text still says the old thing, and a later reader trusting that premise re-opens a settled question. **se filed the same observation as F-02/Local; I deliberately tag it `Process`** — the reusable lesson is that the erratum wave's downward propagation should sweep cautions that cite the corrected wording, not just consumers of the corrected behaviour. The six line edits themselves belong to the propagation step for TSPEC/PLAN/PROPERTIES, not to this REQ. | PROPERTIES §13.1 (`:831`, `:1861`), TSPEC §11.5, PLAN T18 |
| F-54 | Low | Cross-Feature | **Open — unchanged, re-measured.** `pdlc-advisory-corpus-baseline.md:7` still reads `Version | 1.0 · 2026-08-06` against a change-control clause that makes an unbumped content change a defect; the REQ still pins `1.0`. `git diff --stat 760ae1c6..HEAD -- docs/_constraints/` is empty, so the finding is in exactly the state v16 left it. | REQ `:226`, `:472`; `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` |
| F-55 | Low | Local | **Open — unchanged.** §4b's set-equality pin cites "Version 1.4" without naming `pdlc-consolidation-vocabularies.md` in the same sentence, while the two governed files carry different versions at HEAD. Naming the file in the classification sentence is the whole fix. | REQ §4b (`:589-593`) |
| F-56 | Low | Process | **Open — re-measured, worsened by the delta.** `wc -l -c` at HEAD: **681 lines / 65,144 bytes** against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — now **3,704 bytes over** the byte ceiling, up 747 from v16's 2,957. Lines still inside. Severity stays Low because enforcement is unchanged: the hook emits `additionalContext` and exits 0, so it cannot fail a build or halt the pipeline. Recorded so whoever lands F-54/F-55 knows the budget is spent; an erratum note is the cheapest thing in the file to retire once the wave closes. | Whole document; `check-req-size.sh:41-42` |
| F-57 | Low | Local | **Open — unchanged, untouched by this delta.** §4b's erratum still says "permissions or IO error" without saying whether an unreadable basename counts toward the volume test, which a PROPERTIES author needs to state a termination property. Excluding the basename from the *count* while keeping it in the *set* closes it. | REQ §4b (`:604-607`), REQ-CONS-01 step 2 |

## Questions

| ID | Question |
|----|---------|
| Q-03 | F-58's shape recurs: is there a general rule worth stating once — that an AC may not assert the *absence* of an artifact whose existence another AC decides on independent causes? AC-3.4 is the second place in this REQ where a "so X does not exist here" aside would license an absence-only fixture. A one-line convention in the REQ preamble would cost less than catching each instance in review. Non-blocking; PROPERTIES-layer at the earliest. |
| Q-02 | Carried from v15/v16, still non-blocking and still PROPERTIES-layer: should the hook's and the pass's enumerations be pinned by a generator-driven set-equality property over a synthetic docs tree (tracked, untracked, gitignored, staged-but-deleted, nested, `docs/discarded/`)? Set-equality rather than containment, because the failure mode is one enumeration dropping a basename the other keeps. Unchanged by this delta. |

## Positive Observations

- **The erratum fixed the document that was wrong, not the tests that were right.** The tempting cheap
  fix for item 1 was to soften AT-A6's disjoint arm or re-scope the fixture. Instead the REQ moved to
  meet BR-37a, and the differential oracle — the strongest thing in this feature's advisory suite —
  survives untouched. An erratum that preserves a falsifying test rather than trading it away for
  agreement is the outcome worth naming.
- **Both corrections were verified against the oracle, and both held.** I did not take the commit
  message's word for either claim: §9.5's table, BR-37a, AT-A6 and PROP-ADV-05 all read whole-file,
  and §5.3 plus the `AC-3.4 → AT-L1` trace row confirm the proposal file was never an AC-3.4 carrier.
  The commit message's account matches the tree in both cases.
- **The scope discipline is exact.** Twelve insertions, five deletions, three hunks, one file — and
  the author checked the one clause most likely to need a companion edit (AC-3.8b's attribution)
  before concluding nothing else moved. That check was right on the substance; F-59 is a cosmetic
  residue of it, not a miss.
- **AC-3.4's replacement text explains itself.** It states the rule, then the reason, then cites the
  three causes that *do* write the file. A later reader who wonders why the second carrier vanished
  gets the answer in the clause rather than in a commit message. F-58 is a qualifier on that
  reasoning, not an objection to including it.

## Recommendation

**Approved with minor changes** — 0 High, 0 Medium, 7 Low.

The delta-confirmation question was: do these two items resolve without breaking anything previously
approved? **Yes, on both halves.**

- **Both routed items are resolved at the oracle, not just in the prose.** AC-6.3 now matches BR-37a
  word for word and stops reddening AT-A6's disjoint arm; AC-3.4 drops a conjunct no test asserted
  and that FSPEC §5.3 could not satisfy on the happy path.
- **Nothing previously approved regressed.** The diff is confined to three hunks; the untouched
  remainder is byte-identical to the tree I approved at v16; `docs/_constraints/` has not moved, so my
  carried constraint findings are decidable without re-judgment.
- **Seven Low findings are open**, none gating. F-58 is the only one born of this delta's substance,
  and it is a one-qualifier edit. F-59 and F-60 are residues of the wave rather than defects in it.

Landing order, if a further edit happens: F-58 (one qualifier in AC-3.4) and F-59 (three characters in
AC-3.8b) together, since both are inside clauses this wave already touched; F-60's six downstream line
edits with the propagation step; F-54/F-55/F-57 whenever §4b next opens; F-56 by retiring a spent
erratum note once the wave closes.

**No upstream defects.** REQ is the root document; nothing upstream exists to be wrong. No ERRATUM
lines emitted.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 7}

APPROVAL-HASH: sha256:cac4eac81935b3218ac9389538b5fe4b99415bae3daeea5a325f7af9c0c00254
REVIEWED-COMMIT: 54a464331c8b0ef120d27bc0ef8627833e044071
