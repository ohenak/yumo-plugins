# POSTMORTEM — Phase T (erratum protocol) — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC** → DECISIONS → PLAN` |
| Downstream | `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-product-manager-PLAN-v6.md`, `CROSS-REVIEW-test-engineer-PLAN-v6.md` (delta confirmation, erratum round 4) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

**Date:** 2026-08-19
**Halt class:** `ERRATUM-PROTOCOL`
**Halt text:** Phase T halted — the delta-confirmation round for the PLAN erratum round returned non-approving from both lenses: `[pm-review, te-review]`.
**Document at halt:** `PLAN-pdlc-advisory-wave-gate.md` v1.4 (`d912eea9`)

RESOLVED: no

---

## 1. Phase

Phase T authored and revised the TSPEC for the pdlc advisory wave gate; TSPEC converged at **v1.10** and was approved by both lenses in round 11 (`7f81a59d` PM approved-with-minor, `921128f1` TE approved). The halt did **not** occur on the TSPEC itself.

TSPEC §1.3/§6 routed one decision downstream into the already-approved PLAN: commit `e3b9d5a3` had landed the test-side A6 seam-cardinality transcription ahead of Phase I, leaving the advisory suites red at HEAD, and TSPEC left "revert vs. keep-and-re-derive" to PLAN. That opened **erratum round 4** on `PLAN-pdlc-advisory-wave-gate.md`, taking it v1.3 → **v1.4** (`a189cf59` … `d912eea9`).

Under the erratum protocol, a routed erratum closes only when its delta-confirmation round is approving from every lens that reviewed the host document. Round 6 was that confirmation round. Both lenses returned **Needs revision** (`8f16ec9f` PM, `dca04c99` TE), so the erratum did not close and Phase T halted with class `ERRATUM-PROTOCOL`.

Scope note: the PLAN's routed items were all judged **discharged** by both reviewers. The non-approving verdicts rest on collateral defects the erratum edit either introduced or failed to absorb from the upstream that moved underneath it (REQ v1.8 → v1.9, TSPEC v1.6 → v1.10 while PLAN sat at v1.3).

## 2. Iterations

Six PLAN cross-review rounds ran. Rounds 4 and 5 were already approving from both lenses; round 6 is the erratum delta confirmation that reopened the document.

| Round | PLAN rev | PM verdict | PM findings | TE verdict | TE findings |
|---|---|---|---|---|---|
| 1 | v1.0 | Needs revision | 6 (4H / 1M / 1L) | Needs revision | 8 (3H / 3M / 2L) |
| 2 | v1.1 | Needs revision | 9 (7H / 0M / 2L) | Needs revision | 12 (4H / 3M / 5L) |
| 3 | v1.2 | Approved w/ minor | 5 (2H / 0M / 3L) | Approved w/ minor | 6 (1H / 0M / 5L) |
| 4 | v1.3 | Approved w/ minor | 2 (0H / 1M / 1L) | Approved w/ minor | 3 (0H / 0M / 3L) |
| 5 | v1.3 rev | Approved w/ minor | 3 (0H / 2M / 1L) | Approved w/ minor | 1 (0H / 0M / 1L) |
| 6 | **v1.4 (erratum)** | **Needs revision** | 7 (2H / 2M / 3L) | **Needs revision** | 5 (1H / 2M / 2L) |

Two structural events sit inside this trajectory and explain its shape:

- **v1.3 was an operator restructure, not a review response.** The 14-batch red→green alternation could not pass the shipped wave gate (`implementation.testCommand` is a plain exit-code gate at every wave boundary, no expected-red channel), so wave 1 halted. Eleven tasks in seven waves replaced it, with every former RED task folded into its GREEN successor as named in-task steps.
- **v1.4 is an erratum round, not round 6 of ordinary refinement.** Its charter was narrow — resolve the revert-vs-keep fork TSPEC §6 routed — but it landed against upstream that had moved four TSPEC minor versions since the PLAN was last grounded.

High-severity counts had gone 4→7→2→0→0 (PM) and 3→4→1→0→0 (TE): a converged document. Round 6 put High back on the board (2 PM, 1 TE) on material that was **not** in the routed item list. The reopening is the signal, not the volume.

## 3. Reviewers

| Role | Rounds | Round-6 verdict | Residual at halt |
|---|---|---|---|
| product-manager | 1–6 | Needs revision | F-01 (High), F-02 (High), F-03/F-04 (Medium), F-05/F-06/F-07 (Low) |
| test-engineer | 1–6 | Needs revision | F-01 (High), F-02/F-03 (Medium), F-04/F-05 (Low) |

Both lenses stayed in lane and both opened round 6 by confirming the routed work landed:

- **PM** measured the erratum against upstream HEAD per DEC-ERR-03 rather than against the item list, and recorded all routed items discharged — the batch column re-derived and shown, not asserted; the revert-vs-keep fork answered once and unambiguously; two unrouted improvements (inherited-red gate rule, stale-test-name rename step) noted as genuine additions. Its findings are requirement-fidelity shaped: what E-33 / AC-1.4 and TSPEC §4.4/§5.1 now say versus what the PLAN compresses them into.
- **TE** independently checked one of the three measured reasons for the keep decision, confirmed the pre-flight gate green and the cardinality drift incapable of masking baseline rot, and praised the "observe red in-session" re-reading as a falsifiable precondition. Its findings are oracle-and-HEAD shaped: whether a claim about the tree can be checked, and whether the wave gate can actually go green where the document says it will.

**No reviewer-versus-reviewer contradiction exists.** The two lenses independently and separately raised the *same* stale-pin defect (PM F-03 as Medium/nonlocal, TE F-02 as Medium/local), differing only on severity and on whether it is inherited or delta. Nothing one reviewer signed off on was refuted by the other in this round, or in any of the six. The disagreement is author-versus-HEAD.

One process finding is worth routing out of this feature: PM F-07 (Low) records that for the **third consecutive round** the cross-review invocation supplied the PLAN's own top-level headings (`## Overview` / `## Batches` / `## Dependencies` / `## Verification`) as the completeness gate for a *cross-review* document, whose role-defined headings are `## Findings` / `## Questions` / `## Positive Observations` / `## Recommendation` / `## Verdict`. That is a dispatcher wiring defect, not an authoring defect, and it has now survived three harvests.

## 4. Pattern of Disagreement

There is no disagreement *between reviewers*. The round-6 findings fall into three clusters that share one shape: **the PLAN asserts facts about a substrate that moved, and the erratum round re-measured only the part it was routed to re-measure.**

| Cluster | Findings | What the PLAN says | What HEAD / upstream says |
|---|---|---|---|
| A — withdrawn upstream claim, re-asserted | PM F-01 (High, delta), PM F-02 (High, inherited) | A6-06 ships the example config's `advisory` section so an operator can see `enabled: true` with `waveBudgetPerRun: 0`, E-33's "tier on, A6 off" affordance; A6-04 justifies asserting both keys by that pairing | TSPEC v1.9 withdrew that claim in four places and v1.10 restates the withdrawal: §5.1's file-map row and §4.4 pin the literal `{"enabled": false, "waveBudgetPerRun": 1}` — shipped defaults, tier off, "no documentation carrier in scope". `.claude/pdlc.config.example.json` carries no `advisory` key at HEAD (verified) |
| B — pins upstream already re-anchored | PM F-03 (Medium), PM F-04 (Medium), TE F-02 (Medium) | Six `file:line` pins across the Overview, batch-1 gate wording, the DoD checklist and A6-18, plus a pre-drift `toHaveLength(5)` passage in the Overview | The same lines drifted in `e3b9d5a3`; TSPEC v1.10's changelog records re-anchoring them to stable content per DEC-DOC-01. The PLAN is now the only document in the set still carrying the drifted numerals — and carries them in a checklist an implementer ticks off |
| C — new claim, unmeasured | TE F-01 (High, delta), TE F-03 (Medium, Cross-Feature) | The Overview's HEAD-drift note states every HEAD failure is closed by A6-05's green step | `npm test` at HEAD shows 28 failures across 9 suites. At least two are outside A6-05's reach: `documentOracles` T15 (99 vs 100, coupled to another feature's sweep) and PROP-SWEEP-2(b) (14 tracked `.claude/workflows/.pdlc-backups/*.bak` files — verified tracked at HEAD). Separately, `consumerCleanup.test.js` AT-4.1 asserts a clean `git status --porcelain` inside the wave gate's own scope and is red on the hook-rewritten tracked `.pdlc-drift-state.json` (verified dirty at HEAD) |

Two secondary observations:

1. **The disagreement is not about the routed decision.** Both lenses accepted keep-and-re-derive on its measured merits and confirmed the `Batch` column re-derives unchanged. Had round 6 been scored on the erratum's charter alone, it would have been a clean confirmation.
2. **Cluster C is self-inflicted by exactly one sentence.** The remedy note needed to say "every *advisory-suite* failure is closed by A6-05's green step". Scoped that way it is true and TE says so; unscoped it makes the PLAN responsible for two failures no task owns, and it converts the batch-1 inherited-red rule from a checkable precondition into an instruction that will fire "escalate" on a hook artefact at every wave boundary, not just wave 1.

## 5. Best-Guess Root Cause

**Proximate cause: the erratum round re-grounded on upstream HEAD partially — it absorbed the section that routed the item (TSPEC §1.3/§6) and did not absorb the sections that had changed underneath the rest of the document (§4.4, §5.1, and the DEC-DOC-01 re-anchoring recorded in the v1.10 changelog).**

This is the anti-pattern DEC-ERR-01 names: an erratum dispatch must re-read its immediate upstream at HEAD and enumerate what was *decided* in the interval **before** touching the raised items. The v1.4 changelog shows the first half of that discipline performed and announced ("re-grounded on TSPEC v1.10 … re-read at HEAD before addressing raised items"). What was actually re-read was §1.3's drift narrative and §6's routed fork. The interval also contained a withdrawal (§4.4/§5.1's example-config claim, retracted in v1.9 and restated in v1.10) and a citation-form change (six pins re-anchored to stable content). Neither reached the PLAN. Worse, PM F-01's High is a **delta** finding: the round's own new edit to A6-04 (`04a09ca0`) re-asserted the withdrawn claim as its justification while fixing a different, correctly-raised item. Partial re-grounding is more dangerous than none, because the changelog's claim of re-grounding suppresses the reviewer's prior that the rest of the document is stale.

**Contributing cause: the PLAN compresses upstream prose into implementer-facing imperatives, and compression is where withdrawals get lost.** TSPEC §5.1 states a file-map row; A6-06 must state the bytes to write. When the upstream row changes from "teach the affordance" to "ship the defaults, no documentation carrier in scope", the TSPEC edit is one clause and the PLAN edit is a different sentence in a different voice — nothing textual links them, so no diff-driven sweep finds it. The observable damage is proportionate to the compression: a prose ambiguity in TSPEC becomes, in PLAN, a row that decides shipped bytes and would flip the advisory tier **on by default** for every repo copying the example config — a user-visible default-behaviour change no requirement asks for.

**Contributing cause: the document makes claims about a live, hook-mutated working tree without re-measuring at the moment of writing.** Cluster C's High and cluster B's stale pins are the same defect at two altitudes: a numeral or a scope-claim was true when written and is not true now. The substrate is unusually hostile here — a session hook rewrites a tracked `.pdlc-drift-state.json`, an out-of-feature sweep owns a coupled integer literal, and a pre-Phase-I commit (`e3b9d5a3`) landed test-side edits ahead of the plan that describes them. But the mitigation was already available and already used upstream: TSPEC re-anchored to symbol names and quoted assertions per DEC-DOC-01 precisely so that a drifting tree cannot invalidate a citation. The PLAN kept line numbers.

**Not the cause:** reviewer disagreement (none), severity inflation (every round-6 High is grounded in a citation this postmortem re-verified independently), scope creep (no reviewer asked for work outside the feature), the routed decision itself (accepted by both lenses), or the v1.3 operator restructure (no round-6 finding touches the wave map, and the `Batch` column survived re-derivation unchanged).

## 6. Recommendation

---

## Appendix A — prior Phase T halt (review-cap, resolved)

---

**Provenance**

- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
