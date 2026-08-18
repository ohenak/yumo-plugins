# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.7, 2026-08-18)
**Date:** 2026-08-17
**Iteration:** 9
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-FSPEC-v8.md`. Delta scanned with
`git diff 9f2e5107..HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
(22 insertions, 16 deletions) across four commits (`24a4d59a`, `337f3bcf`, `b2bdd09a`,
`fe306b11`). Three hunks: version row (`0.6` → `0.7`), BR-SWEEP-6 (§4.4, :286–296), AT-1.3
(§6.1, :623–631), and §7.3 "Downstream errata — accepted" (:835–843). Sections untouched by the
delta were not re-litigated. This is a decision-freeze round: only delta-introduced defects and
factual contradictions with the repository at HEAD were treated as blocking.

## Resolution of round-8 findings

| Prev | Status | Evidence |
|---|---|---|
| F-01 (High) — repo-wide bare-`it.skip` clause falsified by surviving `guardMatrix.test.js` | **Resolved** | Both clauses now scope the prohibition to the **swept surface** — "M-8's deleted modules and the surviving modules that host R-8's re-homed assertions" (:287–288, :624–625) — and name the residue explicitly: "Pending markers outside the swept surface (`guardMatrix.test.js`'s rows are the measured instance) are pre-existing state this feature does not repair" (:292–294), matched by AT-1.3's "pending markers elsewhere in the suite are out of scope" (:628–629). Verified against HEAD: `guardMatrix.test.js:325` (`it.skip.each(NON_BESPOKE_BLOCK)`) and `:334` (`isLive(...) ? it : it.skip`) survive, and `guardMatrix.test.js` is **not** an M-8 member — the baseline's M-8 row (`docs/_constraints/pdlc-retirement-baseline.md:45`) enumerates `bootstrap`, `drift*` ×16, `queueDriftGate`, `runtimeBundle`, `worktreeInclude`, `hookCompatibility` and six helpers, none of them `guardMatrix`. The narrowed clause is now satisfiable post-sweep. |
| F-02 (High) — exemption keyed to `SKIP_INVENTORY` membership contradicts `skipSink.js`'s deliberate non-closure | **Resolved** | The exemption is re-keyed to sink records: "no `skip` or pending marker survives **that does not reach the run's skip sink as a registered record**" (:288–290) and AT-1.3's "**no skipped or pending test absent from the skip sink's records for that run**" (:625–626), with the rationale stated inline — "The boundary is sink membership at run time, not `SKIP_INVENTORY` membership — the inventory is deliberately not closed over registered skips, so keying the exemption to it would fail correct skips" (:291–293). This transcribes HEAD's own design note verbatim in substance: `pdlc/workflows/__tests__/helpers/skipSink.js:37–45` ("Closure … is deliberately NOT enforced … membership is enforced in the agreement direction (C2) rather than as closure"). The off-inventory registered skips I cited in v8 (`documentOracles.test.js:572`, `:340`) are no longer failures under the new wording, because they do reach the sink. |
| F-03 (Medium) — AT-5.2 clause 2 / E-21 compare eight exempt collections "for presence" while REQ AC-5.2 says presence, not content | **Not addressed; carried** | Delta touches neither §6.5 nor §5's E-21. Re-filed below as F-01, still non-gating. |
| F-04 (Low) — Cross-Reviews header field stops at v4 | **Not addressed; carried** | `:11` still enumerates SE v1/v3/v4 and TE v1–v4; TE v5–v8 and SE v5/v7/v8 exist on disk. Re-filed below as F-02, still non-gating. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **Carried unchanged from v7/v8 (outside the delta, non-gating in a frozen round):** AT-5.2 clause 2 and E-21 compare the report's eight run-variable collections "for presence", while REQ AC-5.2 words the same allowance as presence, not content. The looser of the two readings still admits a run whose collection is present but empty. A single word in the TSPEC's oracle ("non-empty, same key set") closes it; no FSPEC edit is needed if the TSPEC pins it. | §6.5 AT-5.2 clause 2; §5 E-21 |
| F-02 | Low | Process | **Carried unchanged from v7/v8:** the Cross-Reviews header field (`:11`) stops at v4 while TE FSPEC v5–v8 and SE FSPEC v5/v7/v8 sit under `docs/pdlc-plugin-retirement/`. Provenance trail is incomplete for a later reader. | Header table, `:11` |

DEFERRED: hand-rolled ternary capability gates — `(canRunDifferential ? test : test.skip)` at `consolidationHookParity.test.js:203`, `:227`, `:343` and `(hasBash ? test : test.skip)` at `:382` — do **not** route through `itOrSkip`/`describeOrSkip` and therefore never reach the sink (`skipSink.js:17–21`); if the TSPEC's O-E placement decision lands a re-homed assertion in such a module, AT-1.3 reds on a capability-limited runner for a legitimate declared gap. Not blocking: the hosts are undecided (§7 O-E routes placement to the TSPEC), this hazard predates the delta, and the TSPEC can discharge it by choosing hosts free of ternary gates or by converting those call sites to `itOrSkip`.

DEFERRED: §4.4's "`guardMatrix.test.js`'s rows are the measured instance" of out-of-surface pending markers is true at HEAD but is a measurement, not an invariant — it should be re-measured at sweep time with `grep -rn "^\s*\(describe\|it\|test\)\.skip\s*[(.]" pdlc/workflows/__tests__ --include "*.test.js"`, which returns `guardMatrix.test.js` alone today.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §7.3's SE-v8 F-04 row routes "whether the sink comparator additionally pins a join, and how" to TSPEC §5.5. Does that routing carry an obligation that the TSPEC answer it in this feature, or may it close as "no join, C2 agreement suffices"? Either answer is fine for the FSPEC; the question is only whether the TSPEC round is gated on it. |

## Positive Observations

- **Both High findings were fixed by rewording, not by relaxing the gate.** The prohibition still fails a bare `it.skip` and still fails an unregistered pending marker; only its domain and its exemption key changed, each to a boundary that HEAD can actually evaluate.
- **The exemption now names the mechanism it relies on and the reason it is not keyed elsewhere** (:291–293), so a reader who has not read `skipSink.js:37–45` cannot re-introduce the membership-keyed version by "simplification". That rationale-in-place is the durable half of the fix.
- **§7.3's two rows are honest about the disagreement they record.** The SE-v8 F-04 row states "Not folded in as written" with the HEAD evidence for why, rather than silently declining — the erratum ledger stays a usable audit trail.
- **Verified accurate against HEAD:** `guardMatrix.test.js:325`/`:334` (surviving, out of scope), `skipSink.js:17–21` and `:37–45` (comparator domain and non-closure), `driftCapabilities.js:23` (`appendSkipRecord` import — the registration path the exemption names), baseline `:45` (M-8 membership excludes `guardMatrix`). No live bare `describe.skip`/`it.skip`/`test.skip` statement exists anywhere under `pdlc/workflows/__tests__/*.test.js` except `guardMatrix.test.js`, so the delta's residue claim is measured, not asserted.

## Recommendation

**Approved with minor changes**

Both v8 High findings are resolved by the delta, each against the repository evidence that
falsified the previous wording, and the revision broke nothing I had previously approved — the
scoping change is strictly narrowing and leaves AT-1.3's other clauses (L-5 count, L-6 module
plus assertion titles, revert-reds) untouched. F-01 and F-02 are carried, unchanged, outside the
delta, and non-gating; two DEFERRED observations are recorded for the TSPEC round rather than
opened as decisions here.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
