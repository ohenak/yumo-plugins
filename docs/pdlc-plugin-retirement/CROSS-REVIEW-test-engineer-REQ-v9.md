# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.11, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 9
**Round type:** Delta re-review of the v0.11 erratum (`git diff 0eef4d31..68e72db2`, +20/-13 across the changelog, C-9, AC-4.3 and AC-5.2).

**Scope of this round.** Only the three changed passages plus the v8 findings they were raised
against. Every field name and count below was measured at HEAD in `pdlc/engine/lib/report.mjs`
and `pdlc/engine/bin/cli.mjs`; nothing was carried over from the v8 review on trust. Sections the
edit did not touch are not re-litigated.

## Disposition of v8 findings

| v8 finding | Landed? | Evidence at HEAD |
|---|---|---|
| **F-01 (High) — AC-5.2 allowed set incomplete, criterion reds on a correct sweep** | **Yes** | The set now names eight collections by field name: `authSources`, `startup`, `dispatches`, `retries`, `pauses`, `denials`, `loop`, `outcomes`. All eight exist verbatim on the block `buildEngineBlock()` returns (`pdlc/engine/lib/report.mjs:78`–`:94`). The six I cited as omitted in v8 are all present. The block's remaining fields — `startupAuth`, `transport`, `baseUrl`, `tunables`, `permissionMode` — are the ones now required to match exactly, and each is configuration- rather than run-derived, so the criterion no longer reds on a correct sweep. The High is closed. |
| **F-02 (Medium) — AC-4.3 silent on expected entries when cleanup refuses** | **Yes** | AC-4.3 now pins the whole post-refusal directory: "every expected entry the directory held before the run is still present and byte-identical after it". That is a positive assertion on the same path as the negative one, so the black-box test has a post-state to assert rather than a choice to make. |
| **F-03 (Low) — "those last three" miscounted the enumeration** | **Yes** | Replaced by "Each of those eight", and the eight are named individually rather than counted positionally. Re-counted against the text: eight, correct. |

The edit also resolved a contradiction I had not filed: C-9's old conservatism-toward-hand-edited-files
clause is gone, and C-9 and AC-4.3 now agree that hand-modification of an *expected* entry is
deliberately uncovered, with the mechanical reason (no artifact records the hashes) stated in C-9
rather than only in a changelog line.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **"Each of those eight varies between two correct runs" is false at HEAD for six of the eight, so the allowance is wider than the behaviour justifies.** `emitReport()` is the only caller of `buildEngineBlock()` in shipped code (`pdlc/engine/bin/cli.mjs:611`; the other grep hits are coverage temp files), and it passes only `pauses`, `loop`, `tunables`, `baseUrl` and the version/path scalars (`cli.mjs:611`–`:628`). `authSources`, `startup`, `dispatches`, `retries`, `denials` and `outcomes` are never supplied, so they take their defaults — `[]`, `[]`, `{bySkill:{},byPhase:{}}`, `[]`, `[]` and the all-zero outcome shape (`report.mjs:60`–`:71`, `:84`–`:91`) — and are *constant*, not run-variable, in every emitted report. Only `pauses` (adapter log) and `loop` genuinely vary. Consequence for the test author: AC-5.2 as written waives content comparison on six fields whose content is a fixed constant on both sides, so a post-sweep regression that started populating or mangling any of them passes the criterion. Not a false red — field-set equality still holds and the criterion still passes a correct sweep — but it is weaker than intended, and the exhaustive-set framing means TSPEC cannot narrow it back. **Fix (one clause):** compare content for the six that are constant at HEAD and keep presence-only for `pauses` and `loop`; or state the allowance as "compared for presence, not content, for any of the eight the engine populates at the baseline commit", which stays true if the engine later wires the unpassed ones. | §6.5 AC-5.2 |
| F-02 | Low | Local | **`baseUrl` falls outside the exhaustive set and is environment-derived, not run-derived.** `engine.baseUrl` is `process.env.ANTHROPIC_BASE_URL || null` (`pdlc/engine/bin/cli.mjs:616`). It is not "a path" in the sense the allowed set means, so under the new exhaustive framing it must match exactly. A baseline committed under BL-08 in one environment and a post-sweep run made behind a proxy (or vice versa) would red on a correct sweep. Arguably a real signal worth seeing, but the criterion should say which it intends rather than leave the test author to decide. One clause naming `baseUrl` as either in-set or deliberately match-exact settles it. | §6.5 AC-5.2, BL-08 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | `emitReport()` passes `apiKeySource:` to `buildEngineBlock()` (`pdlc/engine/bin/cli.mjs:615`), but the function destructures no such parameter (`pdlc/engine/lib/report.mjs:55`–`:73`) — the argument is silently dropped and the emitted block has no `apiKeySource` field. That is an engine defect, not a REQ defect, and it does not change any verdict here: AC-5.2 compares two reports produced by the same code, so both sides lack it equally. Flagging it so the TSPEC author knows the baseline they capture under BL-08 will not carry an auth-source value, in case a downstream criterion assumes one. |

## Positive Observations

- **F-01 was fixed by naming, not by hedging.** The prior round widened the enumeration and still fell short; this round names each collection by its literal field identifier, which is the form a test author can transcribe into an allow-list without re-deriving anything from the implementation. Every one of the eight matches a key on the returned block exactly — no invented names, no drift from `report.mjs`.
- **AC-4.3 now pins a whole post-state, not just the offending entry.** "Every expected entry ... still present and byte-identical" is the positive conjunct that makes the refusal falsifiable; the previous text could be satisfied by a partial delete. This is the shape the oracle-falsifiability bar asks for and it arrived without being asked twice.
- **The C-9 / AC-4.3 contradiction was decided rather than papered over.** C-9 states the exclusion *and* the mechanical reason for it, in the constraint itself. A future reader who wonders why hand-modification is unguarded finds the answer where the rule lives.
- **Blast radius held again.** +20/-13 across three passages; nothing the round-7 and round-8 approvals rested on moved underneath them.

## Recommendation

**Approved with minor changes**

The v8 High is closed on measured evidence: the allowed set is complete against the block HEAD
actually emits, and the criterion no longer fails on a correct sweep. Both remaining findings are
precision improvements to the same sentence — F-01 makes the allowance no wider than the behaviour
warrants, F-02 settles `baseUrl`'s side. Neither blocks TSPEC authoring; a test author can write
AC-5.2 today and the test will pass on a correct sweep. Neither needs another REQ round of its own
if the TSPEC author is told to carry them.

FINDING: Medium | delta | local | §6.5 AC-5.2 | Six of the eight named collections are never populated by the only caller (`pdlc/engine/bin/cli.mjs:611`), so they are constant, not run-variable; the presence-only waiver is wider than HEAD behaviour justifies.
FINDING: Low | inherited | nonlocal | §6.5 AC-5.2 | `engine.baseUrl` (`cli.mjs:616`) is environment-derived and outside the exhaustive set, so an environment change between baseline capture and post-sweep run reds a correct sweep.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
