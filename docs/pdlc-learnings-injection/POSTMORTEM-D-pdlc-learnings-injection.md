# POSTMORTEM — Phase D — pdlc-learnings-injection

**Halt class:** ERRATUM-PROTOCOL
**Halt reason (verbatim):** Phase D halted: the delta confirmation of the FSPEC erratum round did not pass — non-approving: [se-review, te-review].
**Date:** 2026-08-19
**Branch:** `feat-pdlc-learnings-injection`

## Phase

Phase D (DECISIONS), FSPEC erratum delta-confirmation round. The erratum under confirmation is
commit `a6b42bae` (`FSPEC-pdlc-learnings-injection.md` v0.7 → v0.8, +10/−2 lines: version row,
upstream REQ pointer `v0.8` → `v0.9`, and one new erratum note). It carried a single routed item:

| Routed item | Substance |
|---|---|
| ERR-4 | `§I.2/§I.4/§OQ.2` still gate on `present && config.enabled && !sectionMalformed` with the shipping default left open; re-ground on REQ v0.9 AC-5.1a / FSPEC v0.7 BR-14 ("absent reads as §4.1 defaults, `enabled` stays `true`, no second gate key"); close OQ.2 |

Both confirmers found the item **resolved and correctly resolved**: the cited section ids are TSPEC
numbering, absent from this FSPEC (`grep` returns nothing), while FSPEC Step 0(2), D-1 and BR-14's
five-state table already say exactly what REQ v0.9 AC-5.1a says. The erratum recorded the routing
instead of inventing a behavioural change. Neither confirmer asked for one byte of the delta back.

The halt is again not about the edit's content. It is about the **channel** both confirmers answered
on — the same defect that halted Phase T two phases earlier, now on both channels at once.

## Iterations

- FSPEC cross-review v1–v6: ordinary review loop, both lenses.
- **v7 — the Phase T halt.** Erratum confirmation on `4857352e`; se-review non-approving with zero
  parseable `FINDING:` lines → fail-closed → R4. See `POSTMORTEM-T-pdlc-learnings-injection.md`.
- v8 — follow-up erratum (`fa229bde`, FSPEC v0.7). Both confirmers approved. se-review carried
  **zero** `FINDING:` lines and escaped the fail-closed rule only by approving; te-review carried one.
  A second near-miss on the same channel.
- **v9 — the halting round.** Erratum confirmation on `a6b42bae`, dispatched to both channels under
  DEC-ERR-03. Both non-approving, both with zero parseable `FINDING:` lines.
- Follow-up budget for this erratum: unspent at halt time (`attempt = 0`,
  `MAX_ERRATUM_FOLLOWUP_ROUNDS = 1`), so the halt reason carries no spent-budget clause.

Grammar conformance across this branch is **decaying, not stable**. Line-leading `FINDING:` counts:

| Round | se-review | te-review |
|---|---|---|
| REQ v5 / v6 / v7 | 3 / 1 / 4 | 4 / 2 / 5 |
| REQ v8 | 0 (approving — near-miss) | — |
| FSPEC v7 | 0 (**Phase T halt**) | 2 |
| FSPEC v8 | 0 (approving — near-miss) | 1 |
| REQ v10, v11 | 0, 0 (approving) | 0, 0 (approving) |
| **FSPEC v9** | **0 (halt)** | **0 (halt)** |

The last conforming file on either channel is `CROSS-REVIEW-test-engineer-FSPEC-v8.md`. Four
approving rounds since then carried zero lines and were ungated purely because they approved.

## Reviewers

| Channel | Verdict | Self-declared tags | Parseable `FINDING:` lines | Gate contribution |
|---|---|---|---|---|
| se-review (`CROSS-REVIEW-software-engineer-FSPEC-v9.md`) | Needs revision — `{"high":1,"medium":0,"low":2}` | F-01 `inherited` `nonlocal` High; F-02, F-03 `inherited` `nonlocal` Low | **0** | Synthetic `High \| delta \| nonlocal \| (untagged confirmation)` |
| te-review (`CROSS-REVIEW-test-engineer-FSPEC-v9.md`) | Needs revision — `{"high":2,"medium":0,"low":1}` | F-01, F-02 High, stated in prose as **inherited** and **nonlocal**; F-03 Low | **0** | Synthetic `High \| delta \| nonlocal \| (untagged confirmation)` |

Both reviewers wrote complete, tagged findings — as a markdown findings table whose `Scope` column
reads `Local`, with the real provenance/locality tags rendered as inline code *inside* the
finding-text cell (se-review: `` `inherited` `nonlocal` — BR-9, BR-10 and AT-20/21/22 still specify a
run-level locus… ``; te-review: a prose paragraph under the table, "Both High findings are
**inherited** and **nonlocal**"). That is semantically complete and mechanically invisible:
`parseConfirmationFindings` scans for line-leading `FINDING:` and splits on the first four pipes; it
does not read table cells, and neither reviewer's `Scope` column value (`Local`, `Process`) is even
one of the two axes the grammar wants.

## Pattern of Disagreement

**None on substance, on either axis.** Both confirmers independently reached the same disposition and
the same two defects, from opposite lenses:

| Question | se-review | te-review | Agreement |
|---|---|---|---|
| Did the routed ERR-4 item land? | Yes — TSPEC-scoped, FSPEC needed no behavioural change; verified Step 0(2), D-1, BR-14 against REQ v0.9 AC-5.1a | Yes — same, plus `grep`-verified that `§I.2/§I.4/§OQ.2` do not exist in this FSPEC and that `parseAdvisoryConfig`/`parseMergeConfig`/`parseImplementationConfig` all exist in `orchestrate-dev.js` | Identical |
| Did the delta break anything approved? | No — delta confined to header rows and the erratum note | No — same | Identical |
| BR-9 / corpus-level outcome locus | F-01 (High): "recorded once per run" contradicts REQ AC-3.2's per-authoring-dispatch locus and its "additive, is not the oracle" mirror | F-01 (High): same, plus AT-20 satisfiable by a single run-level field | Same defect, same severity |
| BR-10 / rule-input record | F-01 (folded): one run-level record with one completeness test vs REQ AC-3.3's two loci and two completeness tests | F-02 (High): same, and names AT-22 as a **false green** against a report that cannot reproduce a second dispatch's selection | Same defect, same severity |
| Header Cross-Reviews row three rounds stale | F-02 (Low) | F-03 (Low) | Identical |
| Provenance / locality of the Highs | `inherited`, `nonlocal` — "I missed it in earlier rounds rather than the ground moving underneath" | `inherited`, `nonlocal` — drift dates to REQ v0.7 (`c1180acb`) and v0.8 (`386e4f0c`) | Identical, with independent dating |

There is no reviewer-vs-reviewer disagreement to adjudicate. There are two other disagreements, and
both are with the machinery:

1. **Reviewer vs parser.** Both reviewers declared tags; neither declared them where the parser
   reads. The fail-closed rule then overwrote both declarations with their opposite (`inherited` →
   `delta`).
2. **Reviewer vs gate semantics.** te-review states "they are still gating: the rigour bar is any
   open High, old or new, anywhere in the document." The engine disagrees: `erratumGateDecision`
   filters `highDelta = severity High && provenance delta`, so an `inherited` High is **not** gating
   on the erratum channel — it routes to R2, which re-opens the owning phase's approval and lets the
   pipeline move forward. The reviewers reasoned about the outcome they wanted (a revision) and
   assumed the tags were annotation rather than parser input.

## Best-Guess Root Cause

The fail-closed rule fired exactly as specified. The defect is upstream of it, and it is a
**recurrence** — the second instance of the identical failure mode on this branch, two phases apart.

1. **Nothing was changed after the first occurrence.** `POSTMORTEM-T`'s systemic items 4–7 (engine
   restatement retry, skill-level mutual exclusion of the two shapes, prompt clause fix, mechanical
   guard) were all deferred to the harvest channel; only the substantive FSPEC edits landed. The
   engine, both review skills and `findingGrammarClause()` are byte-identical to what produced the
   Phase T halt. A repeat was the expected outcome, not a surprise.

2. **This time the formatting slip inverted the gate's cheapest branch into its most expensive one.**
   Both confirmers tagged their Highs `inherited`. Had those tags reached the parser,
   `highDelta.length === 0` → **R2**: no POSTMORTEM, no halt; FSPEC's recorded approval is re-opened,
   the owning phase runs again under its ordinary review budgets, and the pipeline moves forward
   carrying the findings. Instead the fail-closed synthesis wrote `delta` over `inherited` on both
   channels, producing two `High | delta | nonlocal` findings → `allLocal === false` → **R4** halt.
   The distance between "phase continues" and "phase halts, postmortem, operator recovery" was four
   lines of text.

3. **The prompt's leniency sentence is false in exactly this case.** `findingGrammarClause()` says an
   untagged finding "is read as {delta, nonlocal} — the strictest reading — so tagging can only ever
   widen the outcome, never narrow it." For an `inherited` finding, tagging *narrows* the reading
   from halting to non-halting; the sentence tells the reviewer the opposite. Both reviewers had
   already done the expensive part — dating the drift to `c1180acb` / `386e4f0c` to establish
   `inherited` — and then dropped that conclusion in the one place it was load-bearing, on advice
   that told them it could not matter.

4. **The findings table's schema collides with the grammar's schema.** The review template's table is
   `| ID | Severity | Scope | Finding | Section ref |` — **one** scope column where the grammar has
   **two** orthogonal axes (provenance, locality). se-review resolved the collision by writing
   `Local` in the column and `` `inherited` `nonlocal` `` in the prose of the same row — an internal
   contradiction visible in the artifact. te-review resolved it by writing `Local`/`Process` in the
   column and the real tags in a paragraph below the table. Neither shape is parseable, and the table
   actively invites the mistake.

5. **The `FINDING:` block has no slot in the document skeleton.** Under the Authoring Pacing
   Contract, a cross-review is written section by section from a skeleton of `##` headings. There is
   no heading whose body is the grammar lines, so they are the one obligation with nowhere to live;
   the conforming files (te-review FSPEC v7, v8) placed them ad-hoc near the verdict. An obligation
   with no skeleton slot is an obligation that decays — which is what the conformance table in
   **Iterations** shows happening, from 3–5 lines per round at REQ v5–v7 to zero on six consecutive
   rounds.

6. **The approving near-misses hid the decay.** Four rounds between the two halts (REQ v8, FSPEC v8
   se, REQ v10, REQ v11 both channels) carried zero lines and passed, because the fail-closed rule
   only inspects non-approving confirmations. The signal that the grammar had been abandoned was
   present four times and observable only at the halt.

## Recommendation

**Immediate (unblocks this phase; no substantive rework of the erratum):**

1. **Re-score the v9 round crediting the confirmers' own declared tags** — se-review F-01
   `High | inherited | nonlocal`, te-review F-01/F-02 `High | inherited | nonlocal`, the three Lows
   `inherited`. `highDelta` is then empty → **R2**. R2 is not an erratum failure: no POSTMORTEM is
   owed, FSPEC is **not** re-anchored, and its recorded approval is **re-opened** so the FSPEC phase
   runs again under ordinary review budgets carrying these findings. Phase D then re-dispatches on
   the corrected FSPEC.
2. **The re-opened FSPEC round carries exactly the findings both confirmers agree on** — all locus
   corrections, no new behaviour, no settled decision reopened:
   - **BR-9** — corpus-level outcomes and per-document reason rows recorded **per authoring
     dispatch** (REQ v0.9 AC-3.2); if a run-level mirror is carried, state in upstream's own words
     that it is additive, is not the oracle, and that nothing asserts on it.
   - **BR-10** — split into two loci: ordering key value per document **per authoring dispatch**,
     §4.1 thresholds **once per run**; **two** completeness tests, one per locus. Fix BR-8's closing
     cross-reference and Step 21's "once per run".
   - **AT-20 / AT-21 / AT-22** — name the locus in Given/Then; AT-21 scopes to the dispatch that
     carried the outcome; AT-22 splits into two set-equality assertions and gains the falsifying case
     (corpus changes between two dispatches, each reproducing its own selection), reusing AT-18's
     existing fixture.
   - **Header Cross-Reviews row** — extend the brace list through v9; **AC-6.2 traceability row** —
     land v8's unlanded F-01 (`§Acceptance Tests preamble` alone in column 2).
   - Answer se-review Q-01 / te-review Q-01, Q-02 in the text: whether the run-level singletons
     survive as REQ's explicitly-additive mirror or go away. Leaving it unstated is what produced the
     split; TSPEC's open question at `TSPEC:343-354` closes on the same edit.
3. **Do not reopen the ERR-4 disposition.** Both confirmers verified it independently: the gate
   correction is TSPEC's to land, and TSPEC's `§I.4` contrast ("an absent section is `present:false`,
   so the feature is still off") is the text that must change, not FSPEC's.

**Systemic — escalate `POSTMORTEM-T`'s items 4–7 out of the harvest channel and land them before the
next erratum round.** Deferring them is what produced this halt; the recurrence is the evidence that
harvest-channel deferral is the wrong disposition for a rule that halts phases. In priority order:

4. **Engine — bounded restatement retry before fail-closed** (T item 4). On a non-approving
   confirmation with zero parseable lines, issue one single-turn re-dispatch asking only for
   restatement of the existing findings in the grammar; synthesize `{High, delta, nonlocal}` only if
   the retry also returns nothing. This alone converts both halts into a one-turn cost.
5. **Skill — give the grammar a skeleton slot** (strengthens T item 5). Require a literal
   `## Delta-Confirmation Findings` heading immediately above `## Verdict` in every erratum-round
   cross-review, whose body is one `FINDING:` line per findings-table row. Written into the skeleton,
   it is emitted by the pacing contract like any other section rather than remembered at the end.
   `CROSS-REVIEW-test-engineer-FSPEC-v8.md` is the conforming exemplar.
6. **Skill — remove the schema collision.** On erratum rounds the findings table's `Scope` column
   splits into `Provenance` (`delta`/`inherited`) and `Locality` (`local`/`nonlocal`), with the
   allowed vocabulary stated. The `FINDING:` lines are then a mechanical transcription of the table,
   and a mismatch between the two is self-evident to the author.
7. **Prompt — fix the false leniency sentence** (T item 6, now demonstrably wrong, not merely
   understated). `findingGrammarClause()` must say: an untagged finding is read as `{delta,
   nonlocal}`, which is the **halting** reading for any High; tagging `inherited` is what keeps an
   inherited High non-gating (R2), and a non-approving confirmation with zero lines halts the phase.
8. **Mechanical guard on every round, not only non-approving ones** (widens T item 7). A PostToolUse
   hook or dispatcher-side lint on written `CROSS-REVIEW-*` files during an erratum round warns when
   the file contains zero line-leading `FINDING:` occurrences **regardless of verdict**, and when any
   findings-table row's declared tags do not appear in a `FINDING:` line. Both halts and all four
   near-misses on this branch are caught by that one check.

## Traceability

| Artifact | Reference |
|---|---|
| Erratum under confirmation | `a6b42bae` — FSPEC v0.7 → v0.8 |
| Upstream at HEAD | REQ v0.9 (`a2353445`), sha256 `ff605dd3…e84dd`, anchored `dc7e230d` — matches both dispatch hashes |
| Confirmations | `9af04875` (se-review v9), `1f140f13..9033fc63` (te-review v9) |
| Gate rule that fired | `erratumGateDecision` R4 via the fail-closed branch (`ERRATUM_FAIL_CLOSED_SECTION`), `pdlc/workflows/orchestrate-dev.js` |
| Rule that should have fired | R2 (inherited-only) — re-open upstream approval, no halt |
| Parser | `parseConfirmationFindings` — line-leading `FINDING:`, first four `\|` delimiters |
| Governing decision | DEC-ERR-03 (`docs/_decisions/DECISIONS-review-severity-bars.md`) |
| Prior occurrence | `POSTMORTEM-T-pdlc-learnings-injection.md` — same failure mode, one channel, FSPEC v7 |
| Prior near-misses | `CROSS-REVIEW-software-engineer-REQ-v8.md`, `…-FSPEC-v8.md`, `…-REQ-v10.md`, `…-REQ-v11.md`, `CROSS-REVIEW-test-engineer-REQ-v10.md`, `…-REQ-v11.md` — 0 `FINDING:` lines, approving, ungated |

**Provenance**
- Engine version: 0.2.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows

## Resolution

RESOLVED: no

Pending operator action on recommendation 1–2: re-score the v9 confirmation at R2, re-open the FSPEC
approval, land the BR-9/BR-10/Step 21/AT-20–AT-22 locus corrections plus the two header/traceability
Lows, and answer the three open questions; then re-dispatch Phase D. The halt itself is a formatting
artifact — both confirmers agree the routed ERR-4 item landed correctly and that nothing previously
approved moved.

**Provenance**
- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
