# Cross-Review: product-manager — TSPEC (erratum delta-confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.6)
**Upstream read at this dispatch:** `REQ-pdlc-advisory-wave-gate.md` (sha256:a10396e8…), `FSPEC-pdlc-advisory-wave-gate.md` (sha256:82f74a2d…)
**Previous review:** `CROSS-REVIEW-product-manager-TSPEC-v6.md` (iteration 6, approved with minor changes)
**Date:** 2026-08-20
**Iteration:** 7
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## 1. Method

Delta protocol. Re-read v6, then `git diff 85463b70..HEAD -- <TSPEC>` (six erratum commits, +71/−9). Upstream hashes recorded in v6's approval anchor are byte-identical to the two named in this dispatch, so REQ v1.8 and FSPEC v1.4 have not moved under the document since I approved it; re-grounding therefore covers what TSPEC v1.6 newly *says about* FSPEC v1.4, not a changed upstream. Every code and test claim in the delta was checked against the shipped tree rather than against TSPEC's own prose.

## 2. Routed items — landing check

| # | Item | Landed | Evidence |
|---|---|---|---|
| 1 | §1.1 O-8 must state one further `commitPaths` call, not the widening option | yes | `TSPEC:157` now reads "**One further `commitPaths` call** after the per-task loop … Widening the existing per-task call is the rejected option A of … DEC-A6-02"; agrees with §3.6 (`:841-854`) and with `DECISIONS:138-155`, which raised the supersession |
| 2, 4 | §4.4's mirroring / example-config consequence claim is false | yes | §4.4 (`:974-996`) now states nothing mirrors the key into `pdlc/engine` today and that the feature **authors a new expectation**. I verified both premises: `grep -c advisory pdlc/engine/__tests__/ci-arrangement.test.js` → `0`; the tracked example carries exactly `dispatch` and `implementation`; the file's only read of the example is `configPath` at `ci-arrangement.test.js:39` used once at `:800` for `implementation.testCommand` |
| 3 | §5.1 file table must name the new expectation as authored, not adjusted | yes | §5.1 (`:1087-1097`) adds two rows — `.claude/pdlc.config.example.json` (edited) and `pdlc/engine/__tests__/ci-arrangement.test.js` (edited, "**new** expectation … Nothing in the file asserts on `advisory` today, so this row is authored, not adjusted") — with a sentence explaining why they sit outside §1.3's `pdlc/workflows` transcription inventory and must reach PLAN's ownership manifest |
| 5 | §5.2 needs a `waveBudgetPerRun: 0` behaviour arm, not only AT-07-2b's parse arm | yes | §5.2 (`:1195-1204`): tier enabled, budget `0`, first red gate ⇒ `escalated` / `budget-exhausted`, `_agent` records **zero** calls, snapshot still taken, and the advisory summary key **present** with zero counters — the conjunct that separates the affordance from `advisory.enabled: false` (AT-01-4), which is exactly REQ C-2 / FSPEC E-33's product promise |
| 6 | §4.5's one-ref-per-wave claim is unobservable on a single-wave fixture | yes | §4.5's Snapshot-ref row now says "asserted on §5.2's two-red-wave run — a single-wave fixture cannot see it", and §5.2 (`:1205-1211`) states the oracle as set-equality to `{refs/pdlc/a6-snapshot-1, refs/pdlc/a6-snapshot-2}`, naming why a fixed-name regression fails both conjuncts |

All six landed, and none is a cosmetic restatement: items 2/3/4 changed a claim about the world that I could falsify from the tree, and items 5/6 converted two unfalsifiable promises into named fixtures.

## 3. Re-grounding against upstream at HEAD

FSPEC v1.4 changed AT-04-1 and BR-11 after my v6 approval; v1.6 re-grounds on both, and the compression is faithful:

- **AT-04-1a/1b.** `FSPEC:391-396` splits AC-4.1's conjuncts into (i) green re-gate ⇒ resolved and (iii) no gate invocation ⇒ halts, not resolved, resolved-wave count `0`, calling the second unreachable on an ordinary run and pointing at TSPEC for construction. `TSPEC:1415-1416` carries both rows with the same conjunct labels and points 1b at §5.5's dropped-re-gate mutation — the construction FSPEC defers to TSPEC is in fact supplied here.
- **BR-11's per-attempt window.** `FSPEC:213` now scopes `seamBudgetMinutes` to a single **attempt**, worst case `attemptBudget ×` value, with the gate-command carve-out dropped as structurally unnecessary. `TSPEC:1403`'s AT-02-7 row says "per **attempt** since FSPEC v1.4's BR-11 (worst case `attemptBudget × seamBudgetMinutes` on one wave)" and keeps the positive-disposition companion `FSPEC:356-361` requires. No stale "cumulative" or carve-out language survives anywhere in TSPEC (`grep -n seamBudget` returns four sites, all consistent).
- **v6's F-01 (Medium) is resolved at the mechanism, not the wording.** §5.5 (`:1163-1176`) now drives the two-attempt red-then-green through an injected `_runCommand`, keeping the shipped `verifyGate` and `apply`, so the six-token ledger and `ledgerAnchor.value === 4` are *observed* rather than stipulated — and it names, in the same paragraph, why the `verifyGate`-double transcription would leave the ledger at `["post-wave", "test"]` and turn a correct implementation red. That is the round-4/round-5 failure class closed at its root.

Nothing in the delta narrows, broadens or drops an acceptance criterion, and nothing added is outside REQ §2's "In scope … tests". The engine-channel edit deserves a word because it crosses a distribution boundary: it is coverage for `advisory.waveBudgetPerRun`, a key REQ itself mints at `REQ:226` under C-2, and it lands beside an existing assertion in that file already marked "unrelated to §5.1", so it neither dilutes nor competes with the distribution feature's required-check oracle. I am satisfied it is in scope.

## 4. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | §3.2's carrier code comment still names a different creation site from §3.2's own prose two lines later: `TSPEC:585` says "created at step 4, beside `ledgerAtDispatch`", `:594-596` says the carrier's lifetime is `invocations`' lifetime, "both created per wave, in the wave loop's own scope". Carried over unaddressed from v6's F-02; the edit did not touch this block | REQ AC-4.1 |

### F-01 — one carrier, two stated creation sites (Low, inherited, nonlocal)

Unchanged from v6, restated only so it is not lost: the per-wave guarantee the document is defending holds under either reading, because A6 is entered at most once per wave, so nothing behavioural rides on it. The cost is one reconciliation for whoever transcribes this in Phase P — "beside `ledgerAtDispatch`" (inside the A6 region, step 4) and "beside `invocations`" (the wave loop's own scope) are different scopes, and a transcriber who picks the second may hoist the construction. Naming the step-4 site and then stating the guarantee that makes it safe ("created once per A6 dispatch; A6 runs at most once per wave; therefore no wave can hold another's anchor") keeps both true sentences without asking anyone to choose. Non-gating.

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | OQ-7 / AT-05-1's `.gitignore` boundary — whether BR-9's restoration oracle ranges over ignored generated outputs — remains upstream-pending in FSPEC for a sixth round (`TSPEC:1421`, `:1377`). TSPEC has again done everything available to it: both halves written, the pending choice flagged, and §3.3's `apply` row stated so that the answer changes no TSPEC text either way. Re-emitted only so the routing question stays visible; it is not a defect in this document. |

## 6. Positive Observations

- **The corrected §4.4 is better than a retraction.** It would have been enough to delete the false mirroring claim. Instead the section states the true fact (nothing asserts on this key today), draws the product consequence (the example is the operator's first and possibly only encounter with an affordance on a tier that ships off, so a broken example ships undiscoverable), and converts it into named work. That is the erratum protocol used the way it is meant to be used.
- **Both false claims were killed everywhere at once.** DECISIONS' DEC-A6-04 consequences (`DECISIONS:283-290`) carry the same corrected statement in the same vocabulary, so a reader entering through either door meets the same world. Sibling-document drift was the failure this round could easily have produced and did not.
- **Item 5 and item 6 both turned "documented" into "falsified".** The `0`-budget affordance and the one-ref-per-wave promise were each true-but-unasserted; the two new §5.2 bullets each name the regression that would otherwise pass (collapsing `0` into `enabled: false`; a fixed snapshot ref name). Findings that produce a fixture rather than a sentence are the ones that survive to implementation.
- **O-8's row now fails safe for the traceability reader.** The obligation table is the entry point for anyone walking back from code to REQ, and it previously handed that reader the rejected shape with no sight of the rejection. The row now carries the decision, its shape, and the pointer to DEC-A6-02 in one cell.

## 7. Recommendation

**Approved with minor changes** — no High findings. All six routed items landed and are faithful to REQ v1.8 and FSPEC v1.4 as they stand at this dispatch; v6's Medium is resolved at the mechanism. One Low item (F-01) carries over and is not gating. Q-01's FSPEC boundary remains an upstream routing matter, not a defect here.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
