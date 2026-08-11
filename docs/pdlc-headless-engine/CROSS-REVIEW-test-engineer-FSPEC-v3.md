# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.2)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** delta re-review v1.1→v1.2 (`git diff cb3ab14e..HEAD`, 33 lines over three places:
the header/change note, §2's M-ENG-06 paragraph, §13.1's header and O-ENG-4 row). Verification of
the six v2 findings; new-issue scan restricted to the changed text and to the sections the changed
text now makes claims about (§4.4, §6.4, §10.3, §11.2, §14.1).

## v2 findings disposition

v1.2 is declared "upstream re-grounding, no new content", and that is what the diff is: no rule,
oracle or AT changed. Five of my six v2 findings were about content the revision did not touch, so
they are unchanged and carried forward below at their original severity. One is resolved upstream.

| v2 | Sev | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 rung-0 usage errors vs BR-REP-0's "always exactly one report line" | Medium | **Open, unchanged** | §12.1, §3.4 and §4.1 untouched by the diff; AT-ENG-05 still cannot say whether `pdlc dev` with no path leaves a JSON line last |
| F-02 BR-START-2's totality at rung 0 (`doctor` inherits the ambiguity) | Medium | **Open, unchanged** | §4.1/§4.6 untouched; AT-ENG-06 still stops at rungs 1–4 |
| F-03 BR-FAIL-1's forward direction is corpus-scoped where BR-MSG-1's is suite-scoped | Medium | **Open, unchanged** | §8.1 untouched; the delta's own §2 pointer to this gap mis-cites it (F-02 below) |
| F-04 EC-GUARD-4's message contract has no acceptance test | Medium | **Open, unchanged** | §9.3/§9.4 untouched; AT-ENG-43 still asserts posture, not the three strings |
| F-05 M-ENG-08's closing clause contradicted §5.1 row 5 (raised as erratum) | Medium | **Resolved upstream** | `docs/_constraints/pdlc-engine-baseline.md:152-159` now reads "with the key **absent** … `auth.unknown` (AC-2.1 row 6) … with the key **present** … refuses at row 5", matching FSPEC §5.1 row 5 and REQ AC-2.1. The fixture AT-ENG-13 builds (key present, scratch `HOME`, no `oauthAccount`) now has one predicted outcome, not two |
| F-06 AT-ENG-37 reads as equality against a jittered cell | Low | **Open, unchanged** | §8.2/§8.6 untouched |

**Upstream claims made by the delta, checked against HEAD.** Every citation the revision added is
correct: `__tests__/transport.test.js:170` is exactly the test `dispatch env spreads the provided
env rather than replacing it` (asserting `capturedEnv` carries `ANTHROPIC_BASE_URL` and `PATH`
from the parent), and M-ENG-06 does now declare itself total, does carry AC-2.3
(`pdlc-engine-baseline.md:97`) and AC-4.4 (`:98`) rows, and does define "partially green" as a
state that names its unasserted half (`:85-89`). I re-derived the totality claim mechanically:
every AC-1.1…AC-6.4 in the REQ appears in the table (AC-2.2/2.4 and AC-5.2 inside the shorthand
cells `AC-2.1/2.2/2.4`, `AC-5.1/5.2`), with AC-4.5 deliberately split across the green and red
rows — see Q-01.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **§13.1 declares O-ENG-1 resolved and "no row still open", but §4.4 and §6.4 still specify the weakened Direction B *and still say the erratum is open* — and AC-3.5's resolved form is stricter than what AT-ENG-10 pins.** REQ v0.8 did not accept "Direction B reports, does not refuse": it **rescoped the equality** — "the set of skill identifiers the modules can dispatch equals the set of prompt files the installed plugin holds **for those identifiers** — set-equality in both directions… a dispatchable identifier with no readable file, **and a prompt file for a dispatchable identifier that the engine cannot dispatch, both fail closed at startup**" (`REQ-pdlc-headless-engine.md:494-503`). Under that scoping the operator-invoked skills are simply outside the set (`:501-506`, 10 identifiers / 12 prompt files / 5 outside), so the "unsatisfiable on a correct install" objection is answered by *restricting the set*, not by demoting a direction. §4.4 is unchanged from v1.1: it still asserts "the two sets are not equal and **cannot be**", still calls the reverse direction "a defect in AC-3.5's oracle rather than a decision this FSPEC may make", and still routes the reader to "§13 O-ENG-1" — a row §13.1 now marks resolved and confirmed. §6.4 (line 559) repeats the pointer for AC-3.1's composition set. Two concrete test consequences: (i) AT-ENG-10's second clause, "Direction B reports **without refusing on an extra file**", is unscoped — a fixture whose extra file names an identifier inside the dispatchable naming space pins non-refusal where AC-3.5 v0.8 requires fail-closed, i.e. the sole test for AC-3.5 (§14.1) can green a build the AC rejects; (ii) the scoped reverse direction has no AT at all, so the equality AC-3.5 asks for is asserted only as containment. Fix: restate §4.4 as set-equality over the modules-derived dispatchable subset with **both** directions refusing, keep "extra operator-invoked file present ⇒ out of set, no refusal" as an explicitly *out-of-set* case, delete the "raised as an erratum / cannot be equal" rationale from §4.4 and §6.4, and split AT-ENG-10 into three fixtures (missing file for a dispatchable identifier ⇒ refuse and name it; file present for an identifier the modules cannot dispatch ⇒ refuse and name it; operator-invoked skill file present ⇒ pass, reported only). | §4.4, §6.4, §13.1, §14.1 (AC-3.5 row) |
| F-02 | Medium | Local | **The delta's new §2 pointer for AC-4.1's unasserted half cites §12.4, which is the hermeticity section; AC-4.1 lives in §8.1.** §2 now reads "AC-2.3 is one of them …, as is AC-4.4 (§8.4) and AC-4.1's set-equality half (§12.4)". The other two pointers are right (§8.4 is `auth-failure`; AC-4.4's row is `pdlc-engine-baseline.md:98`). But M-ENG-06's AC-4.1 row names "the set-equality over the closed six-member catalogue" (`:94`), and this document's home for that is BR-FAIL-1 in **§8.1** — §14.1 maps AC-4.1 → §8.1 → AT-ENG-33/34. §12.4 is BR-VER-1…3 (hermetic suite, fixture sets, live smoke), which is AC-6.1/6.2/6.3. Since §2 is explicitly the section a plan reads to schedule red work first, a scheduler following this pointer schedules the wrong section — and lands next to my still-open v2 F-03 about that very oracle. Fix: cite §8.1 (BR-FAIL-1). | §2, §8.1, §14.1 |
| F-03 | Medium | Local | **AC-2.1 gained a diagnostic-surface clause upstream with three named observables, and neither §14.1 nor O-ENG-5's row was re-grounded on it.** REQ v0.8 resolves O-ENG-5 by giving the surface upstream authority *inside AC-2.1*: "the same startup posture is readable without starting a run, through a diagnostic command that **dispatches nothing and bills nothing** — engine and plugin versions **as a pair** (C-10), the **effective base URL**, and the **auth catalogue id** this table names" (`REQ:422-426`). §14.1's AC-2.1 row still lists only AT-ENG-13 and AT-ENG-15 — both run-banner tests — so the diagnostic half of AC-2.1 traces to no test, even though the tests exist (AT-ENG-09 rung parity, AT-ENG-11 version pair, AT-ENG-24 attempted-dispatch-is-a-failure on the non-billing paths). Worse, O-ENG-5's own row still ends "§14.1 traces it to no AC, which is the gap", which the same table's header now declares closed. A reader deriving AC-2.1 coverage from §14.1 gets a false negative on the half that just became authoritative. Fix: add AT-ENG-09/11/24 to §14.1's AC-2.1 row, and rewrite O-ENG-5's right-hand cell to name AC-2.1 as the authority; while there, confirm §4.1's ladder report emits the three named fields under `doctor` as well as under a run (AT-ENG-09 asserts rung *equality*, which carries them only if rung 3's banner content is part of what `doctor` reports). | §14.1, §13.1, §4.1 |
| F-04 | Low | Local | **Four in-body cross-references still describe the errata as open, contradicting §13.1's "No row below is still open."** §1 line 67 ("§13 lists what is still open"), §10.3 line 981 ("that attribution is raised as an erratum, §13 O-ENG-2"), §11.2 line 1042 ("reconciliation is raised as an erratum, §13 O-ENG-3"), plus the §4.4/§6.4 pair carried in F-01. For O-ENG-2 and O-ENG-3 the *substance* now matches upstream verbatim — I diffed `REQ:353-367` against BR-READ-1 and they say the same thing about the dev/queue split — so these are wording residue rather than divergence, and they are Low for that reason. Fix: sweep the five pointers in one pass so the document has a single answer to "is this open?". | §1, §10.3, §11.2 |
| F-05 | Medium | Local | *(carried from v2 F-01, unchanged)* Rung 0's usage errors and BR-REP-0's "always exactly one report line, always last" still disagree on whether a startup refusal at rung 0 emits a report; AT-ENG-05 and AT-ENG-68 overlap on the undefined case, and HEAD prints usage and returns without a report (`pdlc/engine/bin/pdlc.mjs:236-237`). | §12.1, §3.4, §4.1 |
| F-06 | Medium | Local | *(carried from v2 F-02, unchanged)* BR-START-2's "skipped-with-reason" totality is not stated for rung 0, so EC-CLI-3 and EC-DISP-5 have two defensible expected outputs and `doctor` inherits the ambiguity. | §4.1, §4.6 |
| F-07 | Medium | Local | *(carried from v2 F-03, unchanged)* BR-FAIL-1's forward direction is asserted over a six-fixture corpus while BR-MSG-1 solves the identical problem with an emission seam plus suite-wide accumulation; the corpus form cannot catch a seventh value returned on a path the corpus never provokes. Reuse BR-MSG-1's device. | §8.1, §18.3 |
| F-08 | Medium | Local | *(carried from v2 F-04, unchanged)* EC-GUARD-4's three assertable message obligations (names missing capability, names fallback, states selection unavailable) have no acceptance test; AT-ENG-43/44 assert posture only. | §9.3, §9.4 |
| F-09 | Low | Local | *(carried from v2 F-06, unchanged)* AT-ENG-37 says delays "match BR-RETRY-3's table" while the table's cells carry "(+jitter)"; state the assertion as the interval `[d, d+1000]`. | §8.2, §8.6 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | M-ENG-06 now says "every criterion AC-1.1…AC-6.4 appears in **exactly one row** below" (`pdlc-engine-baseline.md:87`), but AC-4.5 deliberately appears in two — the green row carries it "**except its per-dispatch auth clause**" and the red row carries that clause. The split is legible and I think correct; the totality sentence is what is now false as literally written, and a coverage check written from it ("each AC appears in exactly one row") would fail on a healthy table. Raised as an erratum against the REQ rather than folded in here, since the fact is REQ-owned under pm-author §5e. Does this FSPEC want to restate the totality it leans on in §2 as "every criterion is covered, and a criterion may be split across rows when its halves differ in state"? |
| Q-02 | §2 now says the table "— not this section — is the authority", yet the same paragraph still states AC-2.3's red/green halves, and §13.1's O-ENG-4 row still describes §2 as the place the state is "stated directly". Is the intent that §2 is a readable restatement with M-ENG-06 as the tiebreaker (fine, and worth one clause saying so), or that §2 should now only *point*? A test author needs to know which text to transcribe when the two drift. |

## Positive Observations

- The re-grounding was done in the direction I would have asked for: rather than importing the
  REQ's new text, §2 hands authority to M-ENG-06 and names the *unasserted halves* as the thing
  this document schedules. "Partially green is a state in its own right, and the row names the
  unasserted half" is a better scheduling primitive than a binary red/green table, and it closes
  the old "AC-2.3 has no row" workaround at the source rather than papering over it.
- Every citation added in this delta is correct at HEAD — I checked both: the AC-2.3 evidence
  chain `transport.mjs:159`/`:168` → `__tests__/transport.test.js:170` really does terminate in an
  assertion (the test captures `options.env` and compares against the spread parent env), which is
  exactly the difference between "the code does it" and "a test would re-assert green".
- My v2 F-05 was an upstream contradiction I could only raise, not fix, and it came back fixed at
  the level it was broken: M-ENG-08's per-platform scope now decides the unreadable-evidence case
  by the key's presence, with both AC-2.1 rows named. The fixture AT-ENG-13 builds for row 5 now
  has one predicted outcome. That is the erratum channel working as designed.
- §13.1's rewrite kept the interim-behaviour column instead of deleting it. Keeping the record of
  what was assumed while the errata were open is what let me diff assumption against resolution and
  find F-01 at all — a table that had simply been marked "resolved" would have hidden it.

## Recommendation

**Needs revision**

One High. The revision's own thesis — "all five errata resolved upstream, no decision or rule
changed" — is right for four rows and wrong for one: O-ENG-1 was resolved by *rescoping* AC-3.5's
equality to the modules-derived dispatchable subset with both directions failing closed, not by
accepting §4.4's demotion of Direction B. So the document now asserts both that the erratum is
closed (§13.1) and that it is open (§4.4, §6.4), and its only AC-3.5 test, AT-ENG-10, pins
non-refusal on an unscoped "extra file" where the resolved AC requires fail-closed. That is a
contract-fidelity divergence with a false-green oracle attached, and it is squarely in scope for a
delta review: it was introduced by this round's re-grounding claim, not carried from v1.1.

Everything else holds. Nothing in the delta broke a section that was sound in v1.1, the added
citations are correct at HEAD, the AT set is untouched and still contiguous, and one v2 Medium
(F-05, the M-ENG-08 contradiction) is resolved upstream. The remaining eight findings are Medium
and Low and gate nothing: two new pointer defects the delta introduced (§2's §12.4 mis-cite,
§14.1's stale AC-2.1 coverage against the newly authoritative diagnostic clause), one wording
sweep, and the five v2 findings the revision deliberately did not touch.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 6, "low": 2}
