# CODE REVIEW — pdlc-decision-ledger (v3, re-verification of v2)

| Field | Detail |
|---|---|
| Feature | pdlc-decision-ledger |
| Branch | feat-pdlc-decision-ledger |
| Review version | 3 (delta re-verify of `CODE_REVIEW-pdlc-decision-ledger-v2.md`) |
| Date | 2026-09-01 |
| Remediation under review | `eb89e9dd2` (F-4 — drop the two unreachable `??` log fallbacks; align the loop-suite seam comment); `d494517d9` / `d91409aca` / `d822ec8db` (F-6 — TSPEC erratum v1.3 → v1.4); `e366596b8` (PLAN v1.2 cascade); `7f9b1e40e` / `6156a139a` (pin re-stamps) |
| Verdict | Findings |
| Branch coverage (lowest module) | 87.61 % (`pdlc/workflows/lib/escalation-view.mjs`); `orchestrate-dev.js` 89.04 %; all modules ≥ 85 |
| Requirements traced | 42/42 (no row opens or closes on implementation grounds this round; row 34's spec-side note narrows) |

Scope: Local (all findings), except where a row says otherwise.

Evidence base (this round, HEAD `6156a139a`, clean working tree, live merge-base with `origin/main` = `8f298525f99c`):

- Suite under c8 (`npx c8 node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --forceExit`): **166/166 suites, 5263 passed / 70 skipped / 5333 total**, jest exit 0.
- `c8 report --reporter=json` + `node scripts/check-wave-resume-delta-coverage.mjs`: **exit 0** — `per-file branch coverage: 89.05 %`, `uncovered lines in file: 890`, **`uncovered lines inside introduced ranges: 0 — OK`**.
- `c8 report --check-coverage --per-file --branches 85 --lines 0 --functions 0 --statements 0`: **exit 0**.
- `node pdlc/workflows/build-runtime.mjs --check`: **in-sync** (`pdlc/workflows/dist/pdlc-cli.mjs`).
- Diff scanned: `git diff a6644aeb0..6156a139a` — 13 files, +839/−39. Production code touched in exactly one place: `orchestrate-dev.js:15711–15712` (−2/+2), plus the generated `dist/pdlc-cli.mjs`.

---

## §1 Re-verification of v2 findings

| v2 # | Criterion | Status | Evidence |
|---|---|---|---|
| F-4 | Coverage gap — delta gate red on two never-taken `??` fallback arms (`orchestrate-dev.js:15711`, `:15712`) | **Closed** | `eb89e9dd2` took option (b) from v2's ordering suggestion: `${dispatchPhaseId ?? "-"}` → `${dispatchPhaseId}` and `(feature ${dispatchFeature ?? "-"})` → `(feature ${dispatchFeature})`, keeping the one live fallback `dispatchDocType ?? "-"` (Phase CR dispatches genuinely supply `docType: null`). Fresh gate run reports **0 uncovered lines inside the introduced ranges** across all 23 introduced ranges. `dist/pdlc-cli.mjs` was rebuilt in the same commit and `--check` is in-sync. No new invariant is introduced by a deletion, so no new falsifying test is owed; the pre-existing T-18 oracle (`decisionLedgerMain.test.js:587–597`, `logs.filter(l => l.startsWith("decision-ledger:"))`) is unaffected by the template change and still green. |
| F-6 | Integration boundary — TSPEC §4.4/§4.5/§7.4 declared a `{ feature }`-only `_injectDecisionLedger` while `e707bb119` ships four fields | **Closed at every locus v2 named; family sweep incomplete — see F-7/F-8** | TSPEC v1.4 (`d494517d9`, `d91409aca`, `d822ec8db`): §4.4's `buildDecisionLedgerInjector` return type now reads `{ feature: string; phaseId?: string \| null; docType?: string \| null; round?: number }` (`TSPEC:1038–1043`); §4.5's call-site snippet now reads `await _injectDecisionLedger({ feature, phaseId: phase, docType: roundDocType, round: iteration })` (`TSPEC:1089`); both §2.1 call-graph nodes now render `injectDecisionLedger({feature, phaseId, docType, round})` (`TSPEC:428`, `:432`). `decisionLedgerLoop.test.js:7` re-worded in `eb89e9dd2`. Verified against shipped code: `orchestrate-dev.js:9995–9998` (four-field call), `:11485` + `:11616` (`dispatchAndVerify`'s `ledgerBlock` param and its concatenation last), `:9759` / `:9785` (`wrapped` / `runWrapped` threading), `:11906–11914` (`reviewerPrompt` unchanged at eight parameters). PLAN v1.2 (`e366596b8`) inverted its three stale loci (reuse-surface row `PLAN:122`, T-18's `[green]` instruction `PLAN:174`, integration-points row). Residual `{ feature }`-only text in TSPEC (`:27–28`) and PLAN (`:19`) is changelog prose describing the corrected state historically — correctly framed, not a live declaration. |

### New findings in the remediation diff

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| F-7 (new) | Integration boundary — adjacent-surface falsification (criterion 6a) | low | `pdlc/workflows/orchestrate-dev.js:11923`; generated `pdlc/workflows/dist/pdlc-cli.mjs:11932` | The comment block on `reviewerPrompt` ends `// TSPEC §4.5 and PROP-WIRE-08 still name this builder as the locus and are routed as errata.` That sentence was true at `a6644aeb0`; **this round's own TSPEC v1.4 erratum makes its first half false** — §4.5 now correctly names `dispatchAndVerify`, and only PROP-WIRE-08 remains outstanding. This is the stale-disclosure family sweep the F-6 remediation ran across TSPEC and PLAN but did not extend to the production comment that cites those very sections. Nothing pins this prose, so the suite stays green while the code tells the next reader that a corrected spec is still wrong. | Re-word to name only the still-open item, e.g. `// PROP-WIRE-08 still names this builder as the locus and is routed as an erratum; TSPEC §4.5 was corrected in v1.4.` Then `node pdlc/workflows/build-runtime.mjs` and stage `dist/` in the same commit. No behaviour change. | Local |
| F-8 (new/carried) | Integration boundary — sibling omission in the swept disclosure family + unbound routed item (criterion 6a/6b) | medium | `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md:344` | PROP-WIRE-08 still reads: *"The block must be appended **last**, after `oraclePart` and `findingGrammarPart`, on **both** the iteration-1 and the iteration-≥2 return paths `reviewerPrompt` already has (`orchestrate-dev.js:11483` and `:11506`)."* Both anchors are dead — `:11483` and `:11506` are inside `dispatchAndVerify` (a comment line and a `roundFiles` initialiser); `reviewerPrompt` begins at `:11906` and appends nothing. Before this round this was a stale-but-unopposed statement; **TSPEC v1.4 turns it into a direct contradiction between two live documents** (§2.4/§4.5 now name `dispatchAndVerify`), and PROPERTIES is the test-derivation document, so the property as written cannot be discharged. The item is "routed as an erratum", but the route lives only in `CROSS-REVIEW-test-engineer-REVIEW-v2.md` (F-02/Q-01) and `CROSS-REVIEW-test-engineer-TSPEC-v15.md` (F-02) — files Phase H harvests and deletes — while PROPERTIES' own §Gaps *"Routed upstream (erratum channel)"* section lists **two** items, **both about PLAN**; PROP-WIRE-08 is not among them. So the deferral has no surviving binding. | Route a PROPERTIES erratum (v1.2 → v1.3) re-pointing PROP-WIRE-08's locus to `dispatchAndVerify`'s trailing `ledgerBlock` parameter (`orchestrate-dev.js:11485`) and its single concatenation site (`:11616`, `` `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}${learningsBlock}${ledgerBlock}` ``), stating the "last" obligation against the **delivered prompt** rather than a builder return value; re-stamp the TSPEC/PLAN pins. If the erratum cannot land in this feature, add the item to PROPERTIES' §Gaps *"Routed upstream"* list (a durable in-document binding) rather than leaving it only in harvestable cross-reviews. No production change. | Local |

Criteria 1–3 on the remediation diff: **clean**. The only production change is a two-line template simplification inside a live `_log` emitter. No `TODO`/`FIXME`/`HACK`/`XXX`, no `NotImplementedError`/`throw new Error("not implemented")`, no `placeholder`/`stub`/`dummy` identifiers, no hardcoded sample data, no `Math.random()`/`uuid4()` id sources, no new API clients or DI seams, no new coverage-exemption pragmas. No regression: 5263 tests green, both coverage gates exit 0, `build-runtime --check` in-sync.

Criterion 4 on the remediation diff: **clean**. Delta gate 0/0; per-file branch floor 85 % satisfied by every included module (lowest `escalation-view.mjs` 87.61 %, `orchestrate-dev.js` 89.04 %, `orchestrate-queue.js` 88.64 %, `loop-session.mjs` 92.57 %, `check-wave-resume-delta-coverage.mjs` 94.44 %, `capture-learnings-baseline.mjs` 89.47 %).

---

## §2 Requirements Traceability (carried forward from v2; only remediation-touched rows updated)

Rows 1–33 and 35–42 of `CODE_REVIEW-pdlc-decision-ledger-v2.md` §2 carry forward unchanged (`Gap? = No`), with this update:

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 34 | PROPERTIES PROP-WIRE (12) | Composition-root and loop wiring; block appended last | `orchestrate-dev.js:9995–9998`, `:9759`, `:9785`, `:11485`, `:11616`, `:15694–15735`, `:19016–19019` | `decisionLedgerLoop.test.js`, `decisionLedgerMain.test.js` (T-18 ×4) | **No** — the *substance* of PROP-WIRE-08 ("appended last in the delivered prompt") is implemented and pinned; only the property's stated *locus* remains wrong, now contradicting TSPEC v1.4. See F-8. | medium (doc) | Local |

No row moves to `Gap? = YES`: both open findings are spec/comment prose, not missing implementation and not missing tests.

---

## Notes for the remediator

- **Neither finding is a behaviour defect.** The shipped run is correct and is pinned by the T-18 oracles v2 mutation-verified. Both are prose-consistency gaps left by an incomplete disclosure-family sweep.
- **F-7 is a one-line edit** in `orchestrate-dev.js` — but it *must* be followed by `node pdlc/workflows/build-runtime.mjs` with `pdlc/workflows/dist/` staged in the same commit (`--check` is a required CI check).
- **F-8 is docs-only** and needs no code change, no rebuild, and no new test. If the erratum round is out of budget, the cheapest durable close is the §Gaps routed-item entry — the point of the finding is that a route recorded only in cross-review files disappears at Phase H.
- **Ordering:** F-8 first (it decides the exact wording F-7's comment should carry), then F-7 with the rebuild.
- **Push state:** this branch is well ahead of and behind `origin/feat-pdlc-decision-ledger`. This review is committed locally only; pushing would require a force-push and is deliberately not done here.

---

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 87.61, "req_gaps": 0, "boundary_gaps": 2}
