# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.11, 2026-08-14)
**Date:** 2026-08-14
**Iteration:** 6 (erratum delta-confirmation round)
**Scope:** Confirmation of the Phase F erratum items against `CROSS-REVIEW-software-engineer-REQ-v5.md`.
Diff base `c38feb61` (the commit v5 reviewed) → HEAD `01c27ee4`, two edited sites in the REQ.
Engineering lens only: feasibility, implementability, downstream-citation verification, integration risk.

## Erratum items — disposition

All five raised items landed, and the two edits are the *only* changes to the REQ on this diff
(`git diff c38feb61..HEAD` touches the version row, a new v0.11 changelog paragraph, one word-pair
inside the v0.10 changelog paragraph, and AC-1.3 — nothing else). Items 1, 2 and 4 are three
statements of one defect and are confirmed together; items 3 and 5 are two statements of a second.

| Item (raiser) | Status | Evidence at HEAD |
|---|---|---|
| AC-1.3's "expected set stated in FSPEC" contradicts the ownership FSPEC actually holds — counts in FSPEC, member names in TSPEC §5.4 (pm-author) | **Confirmed** | AC-1.3 (`REQ:264-273`) now reads "an expected set whose **classes and per-class member counts are stated in the FSPEC** and whose **member names are stated downstream in the TSPEC**". That is the split FSPEC §5.2 declares in its own words: "Members are enumerated literally downstream, in TSPEC §5.4's `PK-*` table; the classes and the count are §5.2's" (`FSPEC:496`), with the per-class arithmetic at `FSPEC:509-518` ("manifest 1, package README 1, CLI entry 2, engine modules 15, workflow modules 3, install script 1, licence 0 before / 1 after N-2 ⇒ **23 before N-2, 24 after**"). |
| AC-1.3's class list no longer matched FSPEC §5.2's classes-and-counts / TSPEC-names split (se-review) | **Confirmed** | The surviving class sentence ("That expected set contains the CLI entry, the workflow modules and the engine adapter, and contains no `skills/` directory, no `SKILL*.md` file and no test corpus") is now an *illustrative containment* claim under the set-equality, not the definition of the set — and every one of its members is a real FSPEC §5.2 row: CLI entry (`FSPEC:504`), workflow modules (`:507`), engine modules including `lib/adapter.mjs`, which §5.2 explicitly warns not to double-count (`:529-530`). The exclusion clause matches §5.2's "Excluded, checked by absence under the set-equality" block (`:520-527`) member for member. |
| AC-1.3 asked a verifier to read from FSPEC a literal list FSPEC deliberately does not carry (te-review) | **Confirmed, and the oracle is now writable** | The AC's expected side now resolves to TSPEC §5.4's `PK-*` table, which exists at HEAD (`TSPEC:292` ff., `PK-2`, `PK-3`, `PK-5…PK-19`, `PK-20…PK-22`, `PK-23`) and is what TSPEC PF-4 (`TSPEC:1234`) already asserts against a real `npm pack`. FSPEC BR-8.1 (`FSPEC:534-539`) independently states the same routing — "the literal member list is **TSPEC §5.4's `PK-*` table**, read with the classes and count above". Three documents, one ownership rule; before this edit the REQ was the only one dissenting. |
| `REQ:22`/`:29` cited "FSPEC F-3 step 5" for the run-side `engine.*` pin read; the flow is F-4 step 2 (se-review) | **Confirmed** | The v0.10 changelog now reads "(FSPEC F-4 step 2, BR-2.2, BR-4.7)" (`REQ:29`), and F-4 step 2 (`FSPEC:191-194`) is indeed where the pin read lives: "The pin is read from the `engine.*` namespace of the consumer-owned `.claude/pdlc.config.json` (O-2, grounded in DEC-HE-02) and never written by the engine." |
| v0.10 changelog attributed the pin read to F-3 step 5, which is the plugin-free handshake refusal; prose-only, no AC (pm-author) | **Confirmed, with one precision** | Corrected as above, and the v0.11 entry records the correction as prose-only. Precision worth stating so the next reader does not re-open it: F-3 step 5 is *not* silent on the pin — it says "**Install and upgrade neither read nor write consumer config**; the *run* reads the `engine.*` namespace (F-4 step 2)" (`FSPEC:170-172`). So the old citation pointed at a cross-reference rather than at a false statement; the correction moves it to the owning flow, which is the right target and makes the citation stable if F-3's cross-reference is ever trimmed. |

## Upstream re-grounding (DEC-ERR-03)

## Prior findings still open

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
