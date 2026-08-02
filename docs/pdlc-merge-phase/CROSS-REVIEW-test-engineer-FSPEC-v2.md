# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-merge-phase/FSPEC-pdlc-merge-phase.md` (v1.1)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** Delta re-review of FSPEC v1.1 against my v1 findings, plus new-defect scan of the changed
sections (§2.2, §2.3, §3.2, §3.3, §6.2, §7.2–§7.4, §9.1, §9.4, §10.3, §11, §12). Testing lens only —
observable-outcome defects, never seam or fixture design (TSPEC/PROPERTIES territory).

## Disposition of round-1 findings

| ID | Sev (v1) | Disposition | Evidence in v1.1 |
|----|---------|-------------|------------------|
| F-01 | High | **Resolved** | §2.2 now observes `O1` **exactly once, at row 4**, and every later row re-uses that observation (§2.3 7a "re-used, not re-read"). An unparseable `state` resolves at row 4 → `refused`, **no escalation**, guard never reached; the prose paragraph states the consequence explicitly instead of leaving it inferable. §11 row 8 (`refused`, escalation **no**) is now the sole row for that input, and rows 4/5 are guard-only. The two-rows-one-run collision is gone. |
| F-02 | High | **Resolved** | §7.2 now defines both Evidence forms — `{shortSha} #{prNumber}` when an oid is known (this run, or `O1.mergeCommit.oid` on the already-merged path) and the literal `merged #{prNumber}` when it is absent/unparseable — plus the non-downgrade rule for an existing cell. AT-M2a covers the row-still-`awaiting-merge` mutating case with both Evidence arms, `mergeMethod: unknown`, and the §9.4 note suppressed. This is the AC-5.2 recovery path I asked for and it is now assertable end-to-end. |
| F-03 | Medium | **Resolved** | §11's header now splits rows 1–18 (terminal, mutually exclusive) from rows 19–22 (**composable post-merge annotations**, any subset, all reporting `merged`, notices accumulating in §9.3's order), with row 23 outside the phase. §9.3 restates the accumulation order. AT-M6 asserts a two-annotation run rather than leaving composability as prose. |
| F-04 | Medium | **Resolved** | §7.4's table now carries a `§11 row` and an `Escalates` column, and the disposition catalogue is migrated to `recorded` / `recorded (uncommitted)` / `none` / `error` (O-M1). All four members map: `none` → row 18, no escalation (AC-5.4); `error` → row 20, **escalates**; `recorded` → row 18; `recorded (uncommitted)` → row 21, plain note. The "why a git refusal does not escalate" paragraph makes the asymmetry a stated rule rather than an inference. **No catalogue member is left unmapped.** |
| F-05 | Medium | **Resolved** | AT-M3 is now a positive two-arm oracle: the control arm pins **row 18 / `mergeStatus: merged` / no `MERGE ESCALATION: ` notice**, the treatment arm pins **row 4 / `refused` / the verbatim escalation line**, and the three near-miss paths each reproduce the control arm exactly. Deleting the guard turns the treatment arm red; no arm is satisfied by an unrelated non-`refused` value. |
| F-06 | Medium | **Resolved** | §3.3 pins `1 + R` observations (default 4 observations / 3 re-reads / 3 waits) and fixes the reason line to `mergeability still UNKNOWN after {1+R} observations`, counting observations, with `R = 0` deliberately un-special-cased. §10.3 states the accepted domains: integers ≥ 0 honoured for both retry settings, `0` honoured rather than reset — so a delay-0 suite is testing its own value. |
| F-07 | Low | **Resolved** | §6.2: `shortSha` is the **first 7 characters** of the full oid, fixed-width, explicitly not `git`'s variable abbreviation. AT-M1 restates it. |
| F-08 | Low | **Resolved** | §11 row 23 added (`skipped`, queue no, escalation no, §9.4 note **not** emitted), cross-referenced from §9.1 as the one row whose pipeline outcome is `halted`. |
| F-09 | Low | **Resolved** | AT-M5 now states the drift-gate precondition (clean drift-state record **or** `distribution.checkEnabled: false`) and says why, so both halves of AC-6.3 are determinate. |
| Q-01 | — | **Answered** | §9.4 (`merged`, incl. row 5, emits no merge-deferred note) + §7.4 row 4 (byte-identical case emits nothing) + AT-M2a (mutating case). |
| Q-02 | — | **Answered** | §10.3: the unparseable-`merge`-section note is **suppressed when §2.2 row 1 resolves**; a `PHASE_MERGE_ENABLED: false` run emits nothing to the notices channel. |

I re-derived §2.2's eight-row sequence against every `Resolves at` cell in §11 (rows 1→r1, 2→r2,
3→r5, 6→r3, 7→7a, 8→r4, 12/13→7c/§3.3, 14→7d, 15→7e, 16/17→§6.1/§6.3, 18→§6.2) and against §2.1,
§2.3, §4.1 and §3.2's `unknown resolves to` column. The renumbering is internally consistent — no
stale row reference survives.

## New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-10 | Medium | Local | **An unparseable `O1.mergeable` or `O1.mergeStateStatus` hits zero terminal rows and two contradictory prescriptions.** §3.2 is emphatic that its rule is the only one — a value "not in that row's recognised set" yields `unknown`, and the `unknown resolves to` column says **`refused`** for both fields. But `O1` is consumed once at row 4, whose trigger is scoped to **`state`** alone, so a garbage `mergeable` survives to §2.3 7c, whose `Failure resolves to` column says flatly **`deferred`**. §11 then carries no row at all for it: row 12 is `CONFLICTING`/`DIRTY`/`BLOCKED`, row 13 is `UNKNOWN`-after-re-reads, and neither is a parse failure. So the input `mergeable: "MAYBE"` is `refused` by §3.2, `deferred` by §2.3, and unrepresented in the table §12 declares the primary parameterised suite — falsifying the new "exactly one of rows 1–18 applies to any run that reaches the phase". I cannot write the case without asking which value to assert. **Fix (one row and one clause, no new scope):** split 7c the way 7e is already split — `refused` on unretrievable/unparseable, `deferred` when the value is retrieved and simply not `MERGEABLE` — and add the matching §11 row ("PR mergeability/merge-state field unparseable or unrecognised → `refused`, queue no, escalation no"), a sibling of rows 11 and 15 which already give the retrieval-failure family its own rows for `O2` and `O4`. | §3.2, §2.3 7c, §11 rows 12/13, §11 header |
| F-11 | Low | Local | **§11 row 18's `Queue written: yes` is false for §2.5's don't-overwrite statuses.** §7.4's last situation (row present in `pending`/`blocked`/`halted`) maps to **row 18**, but its behaviour is "file unchanged; plain note naming the status found" — while row 18's column asserts the queue *was* written. The column can express the nuance (row 20 reads "attempted, not written"), so a test parameterised off §11 would assert a mutation that §7.4 forbids. Fix: give the don't-overwrite case its own annotation row (`merged`, queue "attempted, not overwritten", escalation no), or qualify row 18's cell. | §2.5, §7.4, §11 rows 18/20 |
| F-12 | Low | Local | **Rows 19 and 22 are declared composable over "row 18 (or row 3)", but §2.5 says the already-merged path "re-attempts **only** the queue write-back".** So for a row-3 run it is undecidable whether M2 (remote branch deletion, row 19) and M3 (tree moved to the default branch, row 22) run at all — §8.2 pins M1–M5 for a merged run and row 3 reports `merged`, which points the other way. Both readings are safe; only the assertion is at stake ("after an already-merged re-entry, is `HEAD` on the default branch?"). Fix: one clause in §2.5 naming which of M2/M3 apply on the row-3 path, or narrow the parenthetical to rows 20/21. | §2.5, §8.2, §11 header, rows 19/22 |
| F-13 | Low | Local | **`O1.number` is consumed but has no §3.2 row.** It is cross-checked against the `O3` derivation and appears verbatim in the Evidence cell and in three §9.3 escalation lines, yet §3.2's table gives recognised values for `state`, `mergeable` and `mergeStateStatus` only. An absent or non-numeric `number` therefore has no stated resolution, while `mergeCommit` at least gets §3.1's explicit "absence is not a parse failure" carve-out. One row closes it. | §3.1, §3.2, §7.2, §9.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On the §2.2 row-5 path, is the remote feature branch deleted (§6.4) when the merge was performed by a human in an earlier run? F-12 is the assertion; this is the behaviour behind it. |

## Positive Observations

- The **single-observation rule** ("`O1` is observed exactly once, at row 4, and every later row reuses
  that observation") is a stronger fix than the one F-01 asked for: it removes the class of defect,
  not the instance, and it makes the re-read count of §3.3 the only place `O1` is taken twice.
- §7.4's table now carries `§11 row` and `Escalates` as columns rather than prose. That shape is what
  makes the disposition catalogue mechanically checkable against §11 — I re-derived all four members
  from it in a single pass, which was not possible in v1.0.
- AT-M6 is the right instinct: composability was the claim F-03 asked for, and asserting a
  two-annotation run (rows 20 + 22, both lines, in order) proves the claim instead of restating it.
- §3.3's refusal to special-case `after 1 observations` — ungrammatical on purpose, because a format
  that changes shape at one value is a format tests get wrong — is exactly the trade a test engineer
  wants made in the spec rather than discovered in a fixture.
- §12 grew from five ATs to seven and every new one (M2a, M6) exists to close a named round-1 finding.
  The suite now covers what §11's columns structurally cannot express, and nothing else.

## Recommendation

**Needs revision**

All nine round-1 findings and both questions are genuinely resolved — the two Highs by structural
changes (one `O1` observation; both Evidence forms defined and asserted), not by wording. The single
blocker remaining is F-10: the newly asserted exclusivity of §11 rows 1–18 does not yet hold, because
an unparseable `mergeable` / `mergeStateStatus` matches no row and is prescribed two different values
by §3.2 and §2.3 7c. The fix is one split in §2.3 mirroring 7e and one §11 row mirroring rows 11 and
15 — no new scope, no new mechanism. F-11…F-13 are advisory precision cleanups and do not gate.

## Verdict

VERDICT: REVISE
{"high": 0, "medium": 1, "low": 3}
