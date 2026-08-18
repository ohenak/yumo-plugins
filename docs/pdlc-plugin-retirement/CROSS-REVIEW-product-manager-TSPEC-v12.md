# Cross-Review: product-manager — TSPEC (upstream-cascade delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-18
**Iteration:** 12 (upstream-cascade delta re-review)
**Scope:** TSPEC bytes are unchanged since the v11 approval (`REVIEWED-COMMIT: f1b8be6652e665d4558c39e17d15bb713a8a386a`; `git diff f1b8be66..HEAD -- TSPEC-pdlc-plugin-retirement.md` is empty). REQ moved
`sha256:41fb21e8…` (v0.12) → v0.13, v0.14, v0.15, v0.16; FSPEC moved v0.8 → v0.9 → v0.10. The
question this round answers is whether TSPEC remains a faithful compression of REQ now that
upstream has moved four versions, focusing on the two areas the task calls out: the wave-gate
config (class 10 / C-5 / AC-1.2 / M-11h) and the `consolidate-learnings/SKILL.md` obligation
(class 11 / C-9 / erratum 3 / O-8).

## What changed upstream since `f1b8be66`

| REQ/FSPEC version | Change |
|---|---|
| REQ v0.13 (erratum 5) | C-5's commit-class entry and AC-1.2's term-set rationale corrected: the wave-gate `postWaveCommand`/`postWavePathspecs` pair does **not** retire — the reduced build step still emits M-9 into `pdlc/workflows/dist/` under O-3. Baseline M-11h corrected to "prose-and-assertion edit," not a value retirement. |
| REQ v0.14 (erratum 3) | §A-1 corrected: `consolidate-learnings/SKILL.md`'s bundle reference is **deleted**, not rewritten — no surviving host loads the consolidation module — and the same is true of the skill's delegation prose. New **O-8** raised as an unbound operator deferral (blocking gap) for what the consolidation pass becomes. |
| REQ v0.15 | O-8 bound: option (a) (accepted in-session loss of the unattended pass) is now anchored to a named, `ready:false` successor REQ (`pdlc-consolidation-rehost`, queue Order 24), raised before the first deletion commit. |
| REQ v0.16 (SE REQ-v12 F-01/F-02) | C-9's exclusion of hand-modified expected entries restated as a **scope decision** ("the cleanup judges presence, not provenance") rather than an impossibility claim; AC-4.1's removal target restated as the whole `.claude/workflows/` directory in whatever state the sync left it. |
| FSPEC v0.9 / v0.10 | Applied all of the above. Class 11's `consolidate-learnings/SKILL.md` row is now explicitly **two obligations**: (a) delete the bundle reference at `:11`, (b) edit the delegation-contract prose at `:8`–`:13` (the text describing the log-boundary/duplicate-suppression/in-progress-marker guarantees the human-run path loses), both landing in the same commit. Class 10's wave-gate row is prose-only; the tightened set-equality pin is re-pointed to the tracked config example. |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **`consolidate-learnings/SKILL.md`'s delegation-contract prose (`:8`–`:13`) is an obligation REQ O-8/FSPEC M-11n(b) now name explicitly, but no TSPEC task row or oracle covers it.** TSPEC's row 11 (`TSPEC:304`) names only `consolidate-learnings/SKILL.md:11`'s bundle reference, and §6.1 erratum item 3 (`TSPEC:1243`–`:1252`) still describes the pre-resolution problem ("M-11n's rewrite has nothing to name... This is a live capability the sweep would remove") without the "RESOLVED UPSTREAM" treatment erratum 9 got (`TSPEC:1318`). More importantly, AT-3.1's static-half oracle — the only test TSPEC names for delegator SKILL.md source text — is scoped to `orchestrate-dev/SKILL.md` and `orchestrate-queue/SKILL.md` only (`TSPEC:744`: "static half's four conjuncts live in... `orchestrate-dev/SKILL.md` `orchestrate-queue/SKILL.md`"); `consolidate-learnings/SKILL.md` is not a member. Nothing in §5.2 or §5.5 asserts over the delegation-contract prose. Since PLAN has not yet been authored (no `PLAN-pdlc-plugin-retirement.md` exists on this branch), an implementer deriving tasks from TSPEC's row 11 as written would land the bundle-reference deletion but has no TSPEC-level instruction or test forcing the delegation-contract prose edit that O-8's accepted-loss disposition requires — and AC-1.2's literal-string sweep cannot be relied on to catch it, since the delegation prose (describing the log boundary, duplicate suppression, in-progress marker) need not contain any of the retired-name search terms. Suggested fix: split row 11 into the two obligations FSPEC M-11n(b) now states, close out §6.1 erratum item 3 with a "RESOLVED UPSTREAM" note pointing at REQ O-8/v0.14–v0.15, and name (or explicitly route to TE) an oracle for the delegation-contract prose edit. | REQ O-8, REQ §A-1 (v0.14), FSPEC M-11n(b) |
| F-02 | Low | Local | **§3.2's BR-CLN-3a rationale ("no content-based predicate is decidable post-sweep," `TSPEC:356`–`:358`) still reads as the impossibility framing REQ v0.16 moved away from.** REQ v0.16's changelog states C-9's exclusion is now "a scope decision (presence, not provenance) rather than an impossibility claim" (SE REQ-v12 F-01). TSPEC's contract table (rows 1–5, `TSPEC:342`–`:349`) already implements the correct behavior — a hand-modified file at an expected name is removed like any other expected entry — so no implementer obligation or oracle is affected; only the surrounding justification text now lags REQ's stated reasoning. Suggested fix: reword `TSPEC:356`–`:360` to "classification is by name only, as a scope decision — the cleanup judges presence, not provenance (REQ C-9)" rather than framing it as something no predicate could decide. | REQ C-9 (v0.16), BR-CLN-3a |
| F-03 | Low | Local | **Carried forward from v11 (unresolved, since TSPEC is byte-unchanged).** T-4 (`TSPEC:1375`) still calls the held-class interim state "AC-1.2 red construction" and T-5 (`TSPEC:1376`) still says "Blocking" without either using REQ C-7's now-settled vocabulary (a held class is "not a C-7 red," "incomplete feature on an unmerged branch," never "a registered expected failure"). The obligations are correct as written; only the label risks an implementer reading T-4 in isolation as describing a C-7 violation rather than a legitimate hold. No action forced this round (already Low at v11), but worth folding in alongside F-01's row-11 edit since both touch T-4/T-5's neighborhood. | REQ C-7 (v0.12), AC-1.1, AC-1.2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | T-5 (`TSPEC:1376`) still frames the class-11 block as pending "explicit REQ decision" on whether `consolidate-learnings` has "a named surviving execution host." REQ has now decided (O-8, v0.14–v0.15) that there is no surviving host and the pass becomes human-performed with a rewritten delegation contract, bound to a successor REQ. Once F-01 is folded in, should T-5's gate condition be rewritten to require *both* obligations landing together, or is the existing "class 11 removes the host reference... landing ships a skill that cannot hide the loss" language judged to already cover the second obligation implicitly? Routing question for the next revision, not a TSPEC defect on its own. |

## Positive Observations

- **The wave-gate area (class 10 / C-5 / M-11h) needed zero changes.** TSPEC §2.2 (`TSPEC:112`–`:127`) already states "Both values survive sweep unchanged, [a] decision, not [an] omission" and cites the exact mechanism (`dist/pdlc-cli.mjs` stays tracked, the builder survives reduced, the regeneration step stays load-bearing) that REQ v0.13's erratum 5 correction later formalized upstream. TSPEC anticipated the correct answer before REQ caught up to it — the cascade found no gap here.
- **REQ v0.16's C-9/AC-4.3 restatement changes no acceptance criterion TSPEC implements.** TSPEC's classification-by-name contract (rows 1–5, §3.2) was already correct under both the old ("impossibility") and new ("scope decision") REQ framing; only F-02's rationale prose needs a word-level update.
- **The erratum-3 gap (F-01) is exactly the kind of question TSPEC itself flagged upstream and asked for a ruling on** (`TSPEC:1251`: "This is a live capability the sweep would remove, which REQ NG-3 does not contemplate"). REQ answered it (O-8) faithfully to the spirit of that flag; the remaining work is mechanical — pulling the resolved answer back into TSPEC's task list and oracle plan before PLAN is authored from it.

## Recommendation

**Needs revision**

TSPEC's substance on the wave-gate area is already correct and needed no upstream-cascade edit. The
consolidate-learnings area is where the cascade exposed a real gap: REQ/FSPEC now state a two-part
obligation for `consolidate-learnings/SKILL.md` (delete the bundle reference, edit the
delegation-contract prose), backed by a bound successor REQ (O-8), but TSPEC's task row and its
only named delegator-SKILL.md oracle (AT-3.1's static half) still cover only the first part and
only two of the three SKILL.md files. Since PLAN has not yet been derived from TSPEC, this is the
right point to close the gap — folding the resolved erratum-3 answer back into row 11 and naming or
routing an oracle for the delegation-contract edit — before it becomes a silently under-scoped PLAN
task.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 2}
