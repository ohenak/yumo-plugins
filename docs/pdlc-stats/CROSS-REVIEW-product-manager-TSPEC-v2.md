# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2
**Scope:** product lens — requirements traceability, scope compliance, acceptance-criteria fidelity
**Delta base:** `6bc0f0931` (the commit my v1 was written against) → `HEAD`; nine TSPEC commits,
+352/−37 lines, touching §3.3, §3.4, §4.1, §4.2.1 (new), §4.3, §4.4, §6.1, §6.2, §6.3, §6.4, §6.5,
§6.6, §7.1, §8.2, §8.3, §8.4. Sections unchanged by the delta — §1, §2, §3.1–§3.2, §3.5, §5, §7.2 —
were approved in v1 and are not re-litigated here.

## Prior findings — disposition

| v1 finding | Disposition | Evidence |
|---|---|---|
| F-01 High — `schemaVersion` absent from the design | **Resolved.** New §4.2.1 declares `const SCHEMA_VERSION = 1`, states it as a `renderJson` obligation rather than a `StatsReport` field (with the reason: keeping a JSON-only concern out of the value the human renderer also reads), hoists it identically into all three documents per BR-30, and §6.3 carries a `=== 1` conjunct. §7.1 gives BR-24 its own row. | §4.2.1, §6.3, §7.1 |
| F-02 High — JSON top-level key sets never stated | **Resolved, and correctly transcribed.** §4.2.1's `SingleDocument`/`FleetDocument`/`ErrorDocument` types and its four-row key-set table are byte-faithful to FSPEC BR-21 ("exactly five top-level keys: `schemaVersion`, `reviewRounds`, `dodRounds`, `halts`, `byteRatio`"), BR-23 and BR-30 ("`error` is an object with exactly `reason` and `message`"; `feature` `null` on a fleet-mode root failure). I checked all three against the FSPEC's own sentences rather than against the TSPEC's summary. The projection-not-serialisation framing is the right one: it names `FeatureStats.feature` and `.dir` as the two keys that must not reach the wire. | §4.2.1 vs FSPEC BR-21/BR-23/BR-30 |
| F-03 High — `NON_FEATURE_DIRS` never asserted set-equal | **Resolved.** §6.4 adds a fifth oracle with a superset half and a subset half, and maps AT-19's set-equality leg onto it explicitly. I ran the oracle by hand: all eight names are present as directories at `docs/`, and every other directory at that root (thirteen feature directories, `orchestrate-dev-workflow` through `pdlc-two-axis-dod`) satisfies the artifact-naming witness. The oracle is green today and would go red on a ninth. | §6.4 |
| F-04 High — catalogue oracle probed an invalid role slug | **Resolved, and over-delivered.** The probe now spells `CROSS-REVIEW-software-engineer-{T}-v1.md`; `parseReviewFilename` validates against `REVIEWER_ROLE_SLUGS = Object.freeze(Object.values(MAP))` (`pdlc/workflows/orchestrate-dev.js:10044`) and returns `bad_role` before the doc-type check (`:10143`), so the old probe would indeed have been red-for-the-wrong-reason. The oracle also became set-equality over a probed candidate set, which closes the seventh-accepted-type hole RK-3 names. | §6.4, `orchestrate-dev.js:10037-10044`, `:10142-10144` |
| F-05 Medium — BR-11 misquoted | **Resolved.** §4.3 now cites REQ-STATS-04 for the grammar-matching reading, states BR-11's looser wording, names the directory shapes on which the two disagree, and routes the divergence as an FSPEC erratum in §8.3. | §4.3, §8.3 |
| F-06 Medium — BR-16 reading taken silently | **Resolved.** §4.3 states the grammatical reading, grounds it on REQ C-4's "every file matching the documented … grammars", names `docs/completed/pdlc-advisory-wave-gate/`'s four out-of-catalogue files as the shape that discriminates, pins a fixture on the boundary, and routes the ambiguity as an FSPEC erratum. | §4.3, §8.3 |
| F-07 Medium — discovery predicate shipped as settled | **Resolved.** §4.4 marks the predicate provisional, separates it from the non-provisional `NON_FEATURE_DIRS`, and tabulates the observable each possible FSPEC answer implies with its blast radius. RK-5 is updated to match. | §4.4, §8.2 |
| F-08 Low — §7.1 collapsed BR-21…BR-24 | **Resolved.** BR-21, BR-22, BR-23, BR-24, BR-25, BR-26 and BR-30 each have their own row, each pointing at a named contract and a named oracle. | §7.1 |

No prior finding is open.
