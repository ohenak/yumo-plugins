# CODE REVIEW — pdlc-decision-ledger (v4, narrow re-verification round 4)

| Field | Detail |
|---|---|
| Feature | pdlc-decision-ledger |
| Branch | `feat-pdlc-decision-ledger` |
| Round | 4 — **narrow** delta re-verify, operator-sanctioned beyond the standard 3-round budget |
| Scope of round | **Only** the two findings left open by `CODE_REVIEW-pdlc-decision-ledger-v3.md`: **F-7** and **F-8**. Rounds 1–2 findings (F-1…F-6) were verified closed in v2/v3 and are **not** re-litigated. |
| Date | 2026-09-01 |
| HEAD | `28bbeb20e` (merge-base with `origin/main`: `8f298525f99c`) |
| Remediation under review | `7ed1fb14b` (F-7 — stale builder-locus comment + `dist/` rebuild); `173142da4` (F-8 — PROPERTIES v1.2 → v1.3, PROP-WIRE-08 re-worded) |
| Verdict | **Pass** |
| Branch coverage (lowest module) | 87.61 % (`pdlc/workflows/lib/escalation-view.mjs`) — carried from v3; see §1 note (remediation diff contains **zero** executable lines) |
| Requirements traced | 42/42 (row 34 updated below; all others carried forward unchanged) |

**Scope:** Local

Round evidence (working tree clean at HEAD `28bbeb20e`):

- Full suite (`node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --forceExit` in `pdlc/workflows/`): **166/166 suites, 5263 passed, 70 skipped, 5333 total**, exit 0 — byte-for-byte the same counts as v3, i.e. no regression and no newly-green/newly-red suite.
- `node pdlc/workflows/build-runtime.mjs --check`: **in-sync** (`pdlc/workflows/dist/pdlc-cli.mjs`), exit 0.
- Diff `25e069982..HEAD` (v3 doc commit → HEAD): 5 files, +238/−4 — two round-7 PROPERTIES cross-reviews (+220, new docs), `PROPERTIES-*.md` (+16/−2), `orchestrate-dev.js` (−1/+1, comment only), `dist/pdlc-cli.mjs` (−1/+1, same comment).

---

## §1 Re-verification of open findings

| # | Finding (v3) | Status | Evidence |
|---|---|---|---|
| F-7 | Adjacent-surface falsification (criterion 6a): the comment at `orchestrate-dev.js:11923` still said TSPEC §4.5 and PROP-WIRE-08 "still name this builder as the locus and are routed as errata" — false after TSPEC v1.4 corrected §2.4/§4.5. | **Closed** | `7ed1fb14b` replaces the line with: `// TSPEC §2.4/§4.5 (v1.4) and PROP-WIRE-08 document the shipped threading: the ledger block rides dispatchAndVerify's trailing ledgerBlock option, not this builder.` (`orchestrate-dev.js:11923`). Every clause of that sentence is verified true against source: `dispatchAndVerify` declares the trailing `ledgerBlock = ""` parameter (`:11485`) and concatenates it **dead last** (`:11616`, `` `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}${learningsBlock}${ledgerBlock}` ``); the per-round block is computed at `:9995` and passed at `:10030` / `:10038` through `wrapped` (`:9759`) and `runWrapped` (`:9785`); `reviewerPrompt` (`:11906–11914`) still takes exactly **eight** parameters and no ledger argument, so the surrounding comment's "unreachable ninth argument, removed in the Phase CR round (TE F-02)" also remains true. The corrected sentence carries the TSPEC section numbers (§2.4/§4.5) and the version (v1.4) that TSPEC actually ships, and now points at PROP-WIRE-08 as *documenting* rather than *mis-naming* the locus — consistent with PROPERTIES v1.3 (see F-8). **`dist/` matches sources:** the identical line is present at `dist/pdlc-cli.mjs:11932`, the rebuild was staged in the **same** commit (`7ed1fb14b` touches both files), and `build-runtime.mjs --check` exits 0 / reports in-sync at HEAD. No behaviour change; no new invariant, therefore no falsifying test owed. |
| F-8 | Integration boundary (criterion 6a sibling omission + 6b): PROP-WIRE-08 still pinned two dead anchors (`orchestrate-dev.js:11483`, `:11506`) and named `reviewerPrompt` as the append site — a direct contradiction with TSPEC v1.4 in a test-derivation document; plus the routed item survived only in Phase-H-deletable cross-review files. | **Closed** | `173142da4` advances PROPERTIES to **v1.3** and re-words the PROP-WIRE-08 row (`PROPERTIES-pdlc-decision-ledger.md:358`). The new text describes the shipped mechanism truthfully and by **function name, not line number** (DEC-DOC-01): the block must be last **in the delivered prompt** — after the pacing-contract clause, the per-iteration `opener` and the learnings block that the dispatch wrapper appends — on both reviewers and every round, iteration-1 and iteration-≥2 alike; the mechanism is a **trailing option on the dispatch wrapper, not a prompt-builder parameter**; `reviewerPrompt` is explicitly stated to take **no** ledger argument and to return only the wrapper's `basePrompt` (with the reason: anything folded in there would sit *before* the suffix and so could not be last); the rendered block is threaded as `dispatchAndVerify`'s trailing `ledgerBlock` option, passed through `reviewLoop`'s `wrapped` / `runWrapped` closures, concatenated dead last inside `dispatchAndVerify`, cited to `TSPEC` v1.4 §2.4/§4.5. Spot-check against source: every one of those claims matches the loci listed under F-7 above. **Falsifier preserved** — the row still ends "Falsified by any *delivered* reviewer prompt in any round that does not end with the block", i.e. the property remains discharge-able by the existing `decisionLedgerLoop.test.js` / `decisionLedgerMain.test.js` (T-18 ×4) oracles, which stay green. **Criterion-6b concern is moot:** the v3 finding's unbound-routed-item half existed only because PROP-WIRE-08 *asserted* a routed erratum; v1.3 removes the contradiction at source, so there is no surviving routed binding to bind — the re-worded row contains no deferral, no "routed", no successor-owing language. Zero properties added, removed or renumbered; no count, fixture or digest acceptance moved (confirmed by the diff: 18 lines, all inside the revision-history block and the single PROP-WIRE-08 row). Reviewer confirmation: `CROSS-REVIEW-product-manager-PROPERTIES-v7.md` (VERDICT: approved with minor changes, "no High findings; Phase P is not gated", explicitly noting the re-wording is truthful to shipped code and TSPEC v1.4 and the falsifier preserved/marginally strengthened) and `CROSS-REVIEW-software-engineer-PROPERTIES-v7.md` (VERDICT: approved with minor changes, no High raised); approval anchors recorded in `28bbeb20e`. |

**Regression scan over the remediation diff (criteria 1–3, 6):** the executable surface of the diff is **one comment line** in `orchestrate-dev.js` plus its generated twin in `dist/pdlc-cli.mjs`; the remainder is documentation. No new `TODO`/`FIXME`/`HACK`/`XXX`, no `NotImplementedError`/`throw new Error("not implemented")`, no `placeholder`/`stub`/`dummy` identifiers, no mock or hardcoded sample data, no `Math.random()`/`uuid4()`, no new API-client instantiations or unwired DI seams, no new coverage-exemption pragmas. No adjacent surface is falsified *by* these two fixes: F-7's comment and F-8's PROPERTIES row are now the two documents that previously disagreed with TSPEC v1.4 and with each other, and they now agree with each other, with TSPEC v1.4 §2.4/§4.5, with PLAN v1.2, and with the code. `dist/` is in-sync, so the F-7 fix does not falsify the wave gate's rebuild contract.

**Criterion 4 on the remediation diff:** not re-measured, and deliberately so — `git diff 25e069982..HEAD -- pdlc/workflows/orchestrate-dev.js` changes exactly one **comment** line, so no branch, statement or function is added, removed or re-shaped and the v3 measurements (per-file ≥ 85 %, delta gate 0/0, lowest module `escalation-view.mjs` 87.61 %, `orchestrate-dev.js` 89.04 %) carry forward unchanged. The full suite re-run at HEAD returns the identical 5263/70/5333 tallies as v3, corroborating that no executed path moved.

---

## §2 Requirements Traceability (carried forward from v3; only the remediation-touched row updated)

Rows 1–33 and 35–42 carry forward from `CODE_REVIEW-pdlc-decision-ledger-v3.md` §2 unchanged (`Gap? No`). One row updated:

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 34 | PROPERTIES | PROP-WIRE-08 — ledger block appended last in the delivered reviewer prompt | `orchestrate-dev.js:9995–9998`, `:9759`, `:9785`, `:10030`, `:10038`, `:11485`, `:11616` | `decisionLedgerLoop.test.js`, `decisionLedgerMain.test.js` (T-18 ×4) | **No** | — | Local |

The v3 qualifier on this row ("substance implemented and pinned; only the property's stated *locus* is wrong") is now discharged: PROPERTIES v1.3 states the correct locus by function name, so implementation, test and property text agree. No row is `Gap? YES`.

---

## §3 Notes for the orchestrator

- Both v3 findings are closed with evidence in code, not in prose alone; no new finding was opened in this round, and none was sought outside the two-finding scope the operator sanctioned.
- Out of scope, recorded for visibility only (pre-existing, **not** introduced by these diffs and **not** a v4 finding): PROPERTIES v1.3's revision note states the absorption was targeted at TSPEC §2.4/§4.5 only, leaving the `UPSTREAM-STATE` cell's `TSPEC` v1.0 pin and the §Gaps routed PLAN/TSPEC census-partition divergence deliberately standing. That divergence is an upstream-vs-upstream spec item already routed through the erratum channel and already narrowed in v3 row 34's note; it is a spec-process item, not an implementation gap.
- Push state unchanged from v3: commits are local to `feat-pdlc-decision-ledger`; pushing/force-pushing is deliberately not done here.

---

DOD_STATUS: passed
