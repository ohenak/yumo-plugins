# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-plugin-retirement/PLAN-pdlc-plugin-retirement.md (v0.1)
**Date:** 2026-08-18
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | `docs/pdlc-plugin-retirement/PLAN-pdlc-plugin-retirement.md:8` (Downstream row) points at PROPERTIES only and does not list `docs/pdlc-plugin-retirement/REPLAY-pdlc-plugin-retirement.md`, `POSTSWEEP-RUN-pdlc-plugin-retirement.md`, or `OPERATOR-OBSERVATIONS-pdlc-plugin-retirement.md`, even though §3's file-ownership table assigns T31/T32/T33 to exactly those three evidence artifacts and §7's DoD items 10–12 depend on them. A reader using the lineage table alone would miss that three new artifact files are created by this PLAN. Suggest adding them to the Downstream (or a new "Evidence artifacts") row so lineage and §3/§7 agree at a glance. | REQ AC-1.8, AC-5.1, AC-5.2 |
| F-02 | Low | Local | `docs/pdlc-plugin-retirement/PLAN-pdlc-plugin-retirement.md:15` gives the PLAN's own status as "Draft — Phase P cross-review" and author "se-author", which is correct, but the same row's version cell reads "v0.1" while the Changelog entry directly below it (`:19`-`:21`) is the only version row — fine for a first pass, but nothing in the document states which REQ/FSPEC/TSPEC/DECISIONS versions this v0.1 was authored against beyond the Artifact-lineage table at the top. Since REQ has moved fast (v0.10→v0.16 across many erratum rounds) and DECISIONS to v0.5, a one-line "authored against REQ v0.16 / FSPEC v0.10 / TSPEC v0.11 / DECISIONS v0.5, confirmed 2026-08-18" note in the changelog entry itself (not only the lineage table) would make future delta re-reviews faster to anchor without cross-referencing two tables. | Process |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §1.1's stream table and §2's task table both cite TSPEC §2.9 sub-numbers per stream (e.g. "§2.9 1", "§2.9 2"). Was §2.9's own per-class breakdown in TSPEC v0.11 spot-checked to confirm the sub-section numbers still match after TSPEC's own erratum rounds, or is this expected to be re-verified only at delta re-review if TSPEC moves again? |

## Positive Observations

- Traceability is exhaustive and exact where it matters most: PLAN §2.1's acceptance-test table set-equals FSPEC §6's 24 AT ids (AT-1.1…AT-5.3, cross-checked against `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`'s own AT- occurrences) — nothing invented, nothing dropped.
- The two judgment calls the author flags are both correctly grounded and load-bearing rather than cosmetic: (1) `queueDriftGate.test.js` deleted in class 3 (T08) rather than folded into class 6 is justified by C-7 (repo stays green every commit, not only at sweep end) — leaving that file's assertions alive past the point its subject (`distribution.checkEnabled`) is gated in T08 would leave a red module sitting in the class-3 commit; and (2) `consumerCleanup.test.js` is explicitly the *only* new `*.test.js` file the sweep is permitted to add, and PLAN's integration-point 2 ties this directly to TSPEC §4.4's arithmetic (119 − 21 + 1) rather than asserting a bare count.
- DECISIONS v0.5's two distinct dependency edges are both reproduced faithfully and not conflated: DEC-07's erratum-6 block on class 6 (implemented as T13's `[gate]` row ahead of T14, propagating transitively through the `Deps` spine to classes 7–12 exactly as FSPEC §3.1's held-classes note requires) is kept separate from DEC-10's same-commit ordering obligation on classes 7/11 (implemented as T19+T20 sharing batch 16 with disjoint file sets, satisfying Rule 2's single-writer-per-batch constraint even though the two land in one commit).
- Spot-checked a sample of load-bearing file claims against the tracked tree: `preflight-baseline.test.js` and `ci-arrangement.test.js` (T01/T02, marked as touching existing infrastructure) exist at HEAD; `queueDriftGate.test.js` and `pdlc/workflows/dist/consolidate-learnings.bundle.js` (both slated for deletion) exist at HEAD; `consumerCleanup.test.js`, `skipJoinFalsifier.js`/`skipJoinTeardown.js`, and `cleanup-consumer-workflows.sh` (all marked new) do not yet exist. No mismatch found in this sample.
- REQ NG-1/NG-5/NG-6 and O-8's queue-24 successor obligation are all honored as explicit "deliberately not built" items in §1.2 rather than silently absent — this is exactly the kind of scope discipline a product reviewer looks for on a deletion-heavy PLAN.

## Recommendation

**Approved with minor changes**

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:266eb457bbc2895b0b05122d7bab9564648d0258fb0f452332f958f14987a983
APPROVAL-HASH-NORMALIZED: sha256:c606814b9c041e1fe5bb4f1d203d33d7aa715fe1badbbbd0aeefdd6c5dbc1329
REVIEWED-COMMIT: f1b0dfe96089507a62d45c1a36b1ff3ff74aa550
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
UPSTREAM-STATE: FSPEC sha256:5cd899dac04a05b6d7b002a0f0056d7fd5508525cb1399d1dc1f069347e1de23
UPSTREAM-STATE: TSPEC sha256:1554c7d0349ef5d4337c4e5e705bc0c4b867bd3cb46b5191f315d560b87c23b8
UPSTREAM-STATE: DECISIONS sha256:579292fe88bbb0b3860ab609b228a9d5d3e7db20b8158b158e0b5de48a4a35bd
