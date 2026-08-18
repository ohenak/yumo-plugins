# Cross-Review: test-engineer — TSPEC (upstream-cascade re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (bytes unchanged since v10 approval / v11 confirmation — `git diff f1b8be66..HEAD` on this path is empty)
**Date:** 2026-08-18
**Iteration:** 12 (upstream-cascade re-review)

## Scope of this round

TSPEC's own bytes are byte-identical to the ones I dual-approved at iteration 11 (`REVIEWED-COMMIT: f1b8be6652e665d4558c39e17d15bb713a8a386a`). Since then the branch moved REQ v0.12 → v0.16 and FSPEC v0.9 → v0.10, plus a matching baseline erratum block, closing several items that TSPEC itself raised at §6.1. Per the cascade rule this is a full re-review of whether TSPEC still holds against the moved upstream, not a rubber-stamp of "no bytes touched."

Two upstream corrections land this round that bear directly on TSPEC:

- **REQ v0.13 / FSPEC class 10 (M-11h), erratum 5** — the wave-gate config values do **not** retire; class 10 is now a prose-and-assertion edit, not a value retirement.
- **REQ v0.14/v0.15 / FSPEC class 11 (M-11n), erratum 3** — `consolidate-learnings/SKILL.md`'s bundle reference is **deleted**, not rewritten (no surviving host loads the module), the row now **also** carries the skill's delegation-contract prose (`:8`–`:13`), and the capability question TSPEC raised as an open erratum is now settled upstream: REQ's new O-8 accepts the loss as an in-session, human-performed pass and binds a named successor (`pdlc-consolidation-rehost`, `docs/_queue/QUEUE.md` Order 24), raised before the first deletion commit.

Checked both against TSPEC's text.

**Erratum 5 (wave-gate) — already correctly anticipated.** TSPEC's own §6.1 item 5 already asked for exactly this correction ("If M-11h's per-file disposition assumed both values retire, it should be corrected to 'prose only'; class 10 (§2.9) is scoped accordingly"), and §2.9's class-10 row already reads "CLAUDE.md wave-gate prose and `consolidationPreflight.test.js:205`–`:208`; `.claude/pdlc.config.example.json`'s two values are **unchanged**". No TSPEC edit needed here; the upstream correction ratifies what TSPEC already scoped.

**Erratum 3 (`consolidate-learnings/SKILL.md`) — TSPEC's task-sizing row is now narrower than the corrected upstream obligation, and its erratum entry cites the pre-correction text as current.** See findings below.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §2.9's class-11 row and §6.1 item 3 still describe `consolidate-learnings/SKILL.md`'s edit as the single bundle-reference line (`:11`). The corrected upstream (REQ v0.14, FSPEC class 11 / §3.2 step 4, baseline M-11n's 2026-08-18 erratum) now states **two** obligations landing in the same commit: (a) the bundle reference at `:11`, deleted (not rewritten — no surviving host loads the module), and (b) the delegation-contract prose at `:8`–`:13` (which currently tells the operator that hand-running the pass bypasses `.consolidation-log.md`'s boundary, deterministic failure-mode-id derivation, duplicate suppression, the guard-set PR route and the in-progress marker), also edited, per REQ O-8, to say the pass is now human-performed in-session. TSPEC names only the `:11` line and no test/AT anywhere in the document (checked §2.9, §5.2, §5.5; no hit for "delegation contract", "hand-running", "consolidation-log", "duplicate suppression" or "in-progress marker") asserts anything about the skill's post-sweep content or the delegation-prose correction. A PLAN task sized off the class-11 row as it stands could land obligation (a) and leave (b)'s now-false claims (bypasses guarantees that, post-sweep, don't exist to bypass) in the shipped `SKILL.md`, with no oracle to catch it. This is a "write the test right now" failure: there is nothing in TSPEC an implementer could point a test at for the delegation-prose half of the obligation. | §2.9 (class 11 row), §6.1 item 3 |
| F-02 | Medium | Local | §6.1 item 3 quotes the pre-correction FSPEC/baseline instruction verbatim — "FSPEC §3.1 class 11 and M-11n instruct rewriting `consolidate-learnings/SKILL.md:11`'s bundle reference 'to name the surviving execution path'; post-sweep there is none" — and frames the gap as "a live capability the sweep would remove, which REQ NG-3 does not contemplate." Both premises are now stale: the "rewrite to name the surviving execution path" instruction no longer exists in FSPEC or the baseline (M-11n was corrected precisely because there is no surviving path to name), and REQ now *does* contemplate the loss explicitly — it is accepted and bound under O-8. §6.3's T-5 row ("Blocking: do not land class 7 or class 11 until erratum 3 has an upstream disposition — either a named surviving execution host … or an explicit REQ decision that the skill ships without one") describes exactly the disposition REQ O-8 now supplies, but TSPEC still presents T-5 as gating on a future event rather than noting it is satisfied at HEAD. §6.2's SUCC-2 likewise still describes the successor work generically ("squarely NG-5") rather than citing the now-named successor REQ and queue order. Item 9 in the same table received an explicit "RESOLVED UPSTREAM" annotation when its own erratum landed; item 3's resolution predates this review round by several commits and has had no equivalent update. This is a readability/staleness gap, not a missing-test gap (that is F-01), but it will mislead a PLAN author skimming §6.3's blocking-task table into treating T-5 as still open. | §6.1 item 3, §6.2 SUCC-2, §6.3 T-5 |

## Questions

None — both findings above have a concrete, statable fix (extend the class-11 row and add an AT/test-file line for the delegation-prose half; annotate item 3/T-5/SUCC-2 as resolved and cite the corrected obligation), not an open question for the author.

## Positive Observations

- Erratum 5's resolution required no TSPEC edit because TSPEC's own §6.1 item 5 had already asked for exactly the correction that landed upstream, and §2.9's class-10 row was already scoped to it. That is the review process working as intended: TSPEC's own erratum request anticipated the upstream fix precisely.
- AC-1.1's set-equality citation (§2.2, §4.1) and the C-9/hand-modified-entry scope-decision reasoning (§2.5, §4.3 area — REQ AC-4.3 v0.16's restated presence-not-provenance framing) both remain faithful to the moved REQ text; no drift found there.
- §5.5's swept-surface oracle table and TT-1b's `SKIP_INVENTORY` handling are unaffected by this round's cascade — none of the moved REQ/FSPEC material touches class 3/6 skip mechanics.

## Recommendation

**Needs revision** — F-01 is a High finding: the corrected upstream obligation for `consolidate-learnings/SKILL.md` now has two parts, and TSPEC's task-sizing row and test surface cover only one of them, with no oracle anywhere in the document for the delegation-prose half. F-02 should be folded in at the same time it's a small, mechanical annotation update (mirroring how item 9 was marked resolved) plus a citation update pointing SUCC-2 at the now-named successor REQ.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}

FINDING: High | delta | local | TSPEC §2.9 class-11 row / §6.1 item 3 | Corrected upstream M-11n (REQ v0.14, baseline erratum) splits the `consolidate-learnings/SKILL.md` edit into two obligations (bundle-reference deletion at `:11` and delegation-contract prose correction at `:8`–`:13`); TSPEC's class-11 row and erratum-3 entry still name only the single `:11` line, and no test/AT in the document covers the delegation-prose half.
FINDING: Medium | delta | local | TSPEC §6.1 item 3, §6.2 SUCC-2, §6.3 T-5 | Erratum 3's premises are now stale — REQ O-8 (v0.14/v0.15) supplies the "explicit REQ decision that the skill ships without one" T-5 was blocking on, and names a successor REQ SUCC-2 only describes generically — but the entries carry no "RESOLVED UPSTREAM" annotation the way item 9 received when its own erratum landed.
