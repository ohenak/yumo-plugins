# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/PROPERTIES-pdlc-plugin-retirement.md (v0.1)
**Date:** 2026-08-18
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | Five of PROP-COMMIT's six carrier cells name a `(task, file)` pair that does not appear together in PLAN §3's ownership manifest, violating this document's own Rule 6 ("the file named in a carrier cell must appear in PLAN §3's ownership manifest under that task"). Concretely: PLAN §3 (`docs/pdlc-plugin-retirement/PLAN-pdlc-plugin-retirement.md:253`) assigns T31 only `docs/pdlc-plugin-retirement/REPLAY-pdlc-plugin-retirement.md` (new) — T31 is explicitly `[manual]` (`PLAN-pdlc-plugin-retirement.md:161`, "AT-1.8 replay... Transcript committed under `docs/pdlc-plugin-retirement/`"), never touching `pdlc/engine/__tests__/preflight-baseline.test.js`. Yet PROP-COMMIT-2 (`PROPERTIES-pdlc-plugin-retirement.md:248`), PROP-COMMIT-3 (`:249`), and PROP-COMMIT-5 (`:251`) all carry `T31 → pdlc/engine/__tests__/preflight-baseline.test.js`, and all three are labeled Level=Unit even though the only file T31 actually owns is a manual-replay markdown doc. Symmetrically, PLAN §3 (`PLAN-pdlc-plugin-retirement.md:235`) assigns T13 only `pdlc/engine/__tests__/preflight-baseline.test.js` (matching T13's own row, `PLAN-pdlc-plugin-retirement.md:143`, an erratum-gate `[gate]` task) — yet PROP-COMMIT-4 (`:250`) carries `T11/T12/T13 → pdlc/workflows/__tests__/hookCompatibility.test.js` and PROP-COMMIT-6 (`:252`) carries `T13 → pdlc/workflows/__tests__/hookCompatibility.test.js`. T11 and T12 do own `hookCompatibility.test.js` (`PLAN-pdlc-plugin-retirement.md:233-234`), but T13 does not — its owned file is `preflight-baseline.test.js`. The pattern looks like the T13/T31 file assignments were swapped between the "erratum gate" properties (PROP-COMMIT-4, -6, which are *about* T13's own gate and plausibly belong on `preflight-baseline.test.js`) and the "every commit stays green" properties (PROP-COMMIT-2, -3, -5, whose semantics — "for every commit in the sweep's range" — actually match T31's replay task, but T31 writes to `REPLAY-*.md`, not a Jest file). Please re-derive each of these five carrier cells against PLAN §3's ownership manifest directly (not from memory) and correct the task number, the file, or both. | §2.12 PROP-COMMIT; PLAN §3 |
| F-02 | High | Local | §7's test-level count table (`PROPERTIES-pdlc-plugin-retirement.md:365-371`: Unit 31, Integration 34, Manual 10, summing to the document's 75 properties) does not match the actual `Level` column values in the property catalogue in §2. Counting the `Level` cell of all 75 catalogue rows directly gives Unit 50, Integration 16, Manual 8, plus one row (PROP-BUILD-5) whose Level cell literally reads "Manual + Unit" (see F-03) — nowhere close to 31/34/10 on any of the three axes (off by 19, 18, and 2 respectively). This is exactly the kind of internal-arithmetic claim this document repeatedly insists on getting right elsewhere (§1's "document-wide precision" rules, §4's AT set-equality, §5's AC coverage), so a summary table that is wrong by this margin undermines confidence in the rest of the document's self-reported statistics. No test oracle currently enforces §7 (it isn't cited as a carrier for any property), so this is a documentation-only defect, but it should be recomputed from the actual catalogue before this document is treated as authoritative for downstream test-level/cost planning. | §7 Test levels |
| F-03 | Medium | Local | PROP-BUILD-5's Level cell (`PROPERTIES-pdlc-plugin-retirement.md:175`) reads "Manual + Unit", violating this document's own Rule 5 ("Test level: one of Unit, Integration, or Manual"). The property does have a genuine split carrier (T17/T19 → `consolidationBuild.test.js` for the automated half, T33 [manual] → `OPERATOR-OBSERVATIONS-*.md` for the manual half), which is a legitimate situation the rest of the catalogue doesn't otherwise encounter — but the fix should be to either split PROP-BUILD-5 into two properties (one Unit, one Manual) each with a single-level carrier, or to explicitly extend Rule 5 to allow a documented multi-level exception rather than silently breaking it once. This row is also the specific source of the "+1 mixed row" noted in F-02. | §2.6 PROP-BUILD-5 |

## Questions

| ID | Question |
|----|----------|
| Q-01 | Was the T13/T31 carrier mix-up in PROP-COMMIT (F-01) caused by an earlier PLAN revision that moved the erratum-gate assertions from `hookCompatibility.test.js` into `preflight-baseline.test.js` (or vice versa) without a matching pass over PROPERTIES' carrier cells? If so, a quick search for other PLAN-vs-PROPERTIES carrier drift around T11-T13 and T30-T31 (not just the PROP-COMMIT domain) may be worthwhile before the next PROPERTIES revision. |

## Observations

- Everything else spot-checked came back clean: the 75 property-id count, the 26-AT set-equality between FSPEC §6 and PROPERTIES §4 (including the `AT-1.4b`/`AT-1.4c` letter-suffixed rows), the 26 REQ v0.16 §6 acceptance criteria, the 15-skill set (`pdlc/skills/*/SKILL.md`) cited by PROP-DEL-3, the `MERGE_GUARD_DEFAULTS` byte-identity claim in PROP-SWEEP-6 (constant is genuinely imported, not module-local, per `pdlc/workflows/orchestrate-dev.js:48` and `consolidate-learnings.js:29`), and the plugin-version handshake in PROP-VER-1 (`pdlc/.claude-plugin/plugin.json` is `0.23.1` today, PLAN T24 bumps it to `0.23.2`, and `pdlc/engine/package.json`'s `pdlcPluginCompat: "^0.23.0"` admits both under leftmost-non-zero caret semantics).
- The 97-vs-99 suite-count disagreement (PROP-SUITE-1 / PROP-COMMIT-4, DEC-07) is handled exactly as the anti-vacuity rules in §1 promise: neither property reconciles the two numbers, and the current top-level `*.test.js` count under `pdlc/workflows/__tests__/` is 119, consistent with FSPEC L-5's `119 − 22 = 97` derivation. No concern there beyond F-01's file/task mix-up on the properties that carry that erratum gate.
- `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` does not exist yet at HEAD, which is correct and expected — it's a new file planned in PLAN T30, and every PROP-CLEAN carrier citing it is consistent with that plan.

## Recommendation

**Needs revision**

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 0}
