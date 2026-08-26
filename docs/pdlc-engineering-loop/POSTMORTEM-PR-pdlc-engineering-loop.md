# POSTMORTEM — Phase PR (TSPEC erratum, delta confirmation) — pdlc-engineering-loop

**Date:** 2026-08-24
**Phase:** PR (PROPERTIES phase; halt raised by the Phase PR **TSPEC erratum** channel)
**Failure mode:** ERRATUM-PROTOCOL — delta confirmation did not pass
**Document at halt:** `docs/pdlc-engineering-loop/TSPEC-pdlc-engineering-loop.md` v1.0 (`6f279c191`, `sha256:fb1908d8…`)
**Non-approving:** `pm-review`, `te-review` (both, untagged confirmation)
**Approving:** none

RESOLVED: yes

Resolution rationale: R-1/R-2 (the two blocking, orchestrator-owned items) are discharged by resuming: the routed item is landed at TSPEC v1.0 `6f279c191` (all four PLAN-named test files carry *Levels and homes* rows, TSPEC:1312–1327), no `-v13` artifact ever reached disk so the halt was a dispatch failure not a rejection, and the re-run re-dispatches the delta confirmation fresh without feeding the synthesised `(untagged confirmation)` findings to any author. R-3/R-4/R-5 are non-blocking, workflow-owned engine items. No TSPEC edit is owed.

## Phase

Phase PR (PROPERTIES) opened a **TSPEC erratum** channel against
`TSPEC-pdlc-engineering-loop.md`. The routed item was single and agreed by all three raisers
(PM, SE, TE): *Test Strategy* → **Levels and homes** had no row for four test files the PLAN
names as deliverables —

| PLAN-named deliverable | Occurrences in TSPEC at round open |
|---|---|
| `pdlc/workflows/__tests__/loopDecisionEntry.test.js` | 0 |
| `pdlc/workflows/__tests__/loopEntryVocabulary.test.js` | 0 |
| `pdlc/workflows/__tests__/loopBaselinePreflight.test.js` | 0 |
| `pdlc/engine/__tests__/loop-startup-remediation.test.js` | 0 |

— none of which matched the table's existing `loopSession*` / `escalationView*` globs (raised as
G-2). The author edit landed as TSPEC **v0.9 → v1.0** across five commits (`0bc084443`,
`84a0a043a`, `7b20f129e`, `251510d10`, `6f279c191`), adding one *Levels and homes* row per file
plus the round-11 changelog row. The routed item **is** materially applied at HEAD: all four
names now occur in the table, each carrying its AT anchor (`P0-00` for the baseline pre-flight
file, **AT-21**, **AT-25**, **AT-44**).

The halt therefore did not come from the item. It came from the **delta confirmation** that
follows the author edit: both confirmers returned non-approving, and neither confirmation carried
a parseable line-leading `FINDING:` line, so the engine's fail-closed reader synthesised one
`High | delta | nonlocal` finding per confirmer and halted the phase.

## Iterations

| # | Event | Artifact / evidence | Outcome |
|---|---|---|---|
| 1 | Erratum round 11 opened | routed item: *Levels and homes* missing four PLAN-named test files (G-2) | item accepted, author edit dispatched |
| 2 | Author edit, part 1 | `0bc084443` "add four PLAN-named test files to Levels and homes (erratum r11)" | four rows added |
| 3 | Author edit, parts 2–3 | `84a0a043a`, `7b20f129e` (round-11 TE F-01/F-02, PM F-02 carried in) | §7 D-6 derivation corrected to D-3 |
| 4 | Author edit, part 4 | `251510d10` "bump to v1.0 with the round-11 erratum changelog row" | **document body truncated: −1638 lines** |
| 5 | Author edit, part 5 | `6f279c191` "restore document body truncated by the v1.0 changelog edit" (+1638 lines), 31 s later | body restored; net content correct |
| 6 | Delta confirmation | dispatched against v1.0 | **both confirmers non-approving, untagged** → halt |

Two facts about iteration 6 are load-bearing for the diagnosis:

1. **No confirmation artifact reached disk.** The highest cross-review files on the branch are
   `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v12.md`, and both carry
   `REVIEWED-COMMIT: fe39d26526a3fd7d54ac6c4ee9f4ab5a726176d7` — that is TSPEC **v0.9**, the base
   of this round, not the v1.0 edit under confirmation. The confirmation of v1.0 (which would be
   `-v13`) exists nowhere in the working tree and nowhere in the commit graph.
2. **Both v12 files ended approving.** Each closes `VERDICT: Approved with minor changes` over
   three well-formed `FINDING:` lines (`Medium | inherited | nonlocal`, two `Low | inherited |
   nonlocal`). The confirmers demonstrably *can* emit the grammar; they did so 20 minutes earlier
   in this same channel.

So the halting round produced neither a document nor a parseable finding — an empty result, not a
disagreeing one.

## Reviewers

| Confirmer | Verdict read by the engine | Finding lines emitted | Fail-closed synthesis |
|---|---|---|---|
| `pm-review` | non-approving | none parseable | `FINDING: High \| delta \| nonlocal \| (untagged confirmation) \| non-approving confirmation carried no parseable FINDING: line — read as High/delta/nonlocal, fail-closed` |
| `te-review` | non-approving | none parseable | *(byte-identical to the above)* |

The two synthesised findings are **identical strings**, including the `(untagged confirmation)`
site placeholder. That is the signature of the engine's fail-closed default, not of two reviewers
independently reaching the same conclusion: nothing in either confirmation distinguished the PM
lens from the TE lens, because neither confirmation contributed any content at all.

For contrast, the round-11 confirmations from the same two agents (`-v12`, both at 16:01) are
lens-differentiated and grammatical:

- `pm-review` closed on a bare-line-anchor observation against `packaging.test.js` (PM F-02, Low)
  and a workflow-owned carry-over (PM F-01), verdict **Approved with minor changes**.
- `te-review` closed on D-6's derivation naming the wrong upstream constant (TE F-01, Medium) plus
  two Lows on carve-out classification and falsifying power, verdict **Approved with minor
  changes**.

Both anchored their approval with `APPROVAL-HASH-NORMALIZED: sha256:c77c699d…` and
`REVIEWED-COMMIT: fe39d265…`. Neither of those anchors covers v1.0, whose normalised content is
`sha256:fb1908d8…` at `6f279c191`.

## Pattern of Disagreement

**There is no disagreement to characterise — and that is the finding.**

The erratum channel's normal failure shape is substantive: a confirmer reads the edit, judges some
part of the routed item unlanded or newly broken, and says so in a `FINDING:` line whose
`delta`/`inherited` and `local`/`nonlocal` tags decide whether the round may close (R1–R3). This
round produced none of that. The pattern is instead:

1. **Unanimity without content.** Both confirmers non-approving, with byte-identical synthesised
   findings. Genuine PM/TE convergence in this feature has never been byte-identical — every prior
   round shows lens-specific sites (PM on scope and traceability wording, TE on falsifiers and
   oracle placement). Identical text means one generator, and that generator was the fail-closed
   reader.
2. **Non-approval contradicted by the artifact record.** The routed item is landed and verifiable
   at HEAD: four rows, four AT anchors, zero remaining zero-occurrence names. A confirmer reading
   v1.0 and applying the delta rule would have had to approve or name a *specific* residual defect;
   neither happened.
3. **Silence at the artifact layer.** No `-v13` cross-review file was written by either confirmer.
   In every previous round of this channel (v1 … v12) both confirmers produced a file. A round that
   writes no document and emits no finding did not reason and reject; it did not complete.
4. **Escalation by default, not by judgement.** `High | delta | nonlocal` is the most severe
   classification the channel has — it is the one combination that cannot be closed by R1, R2 or R3
   and must halt. The round was escalated to the maximum severity by a parser default while the
   underlying document was, on the evidence, correct.

The disagreement is therefore between the **engine's read of the confirmations** and the
**confirmations' actual (absent) content** — a protocol failure, not a technical one. The
fail-closed rule behaved exactly as designed; it is the input to that rule that was empty.

## Best-Guess Root Cause

**Primary (high confidence): the confirmer dispatches did not complete, and an empty response was
scored as a maximal-severity finding.**

The evidence is convergent: no `-v13` artifact on disk, no parseable verdict, no parseable
`FINDING:` line, and two byte-identical synthesised findings. Every one of those is consistent with
a dispatch that returned little or nothing — a stall-watchdog kill, a transport/overload error, or
a response truncated before its trailer — and none is consistent with a reviewer that read v1.0 and
judged it defective. The channel's own history rules out capability: the same two agents emitted
grammatical, lens-differentiated confirmations 20 minutes earlier, over a harder delta.

Two contributing conditions are worth recording, because both are cheap to remove:

- **C-1 — the round's commit sequence contained a truncate/restore pair.** `251510d10` (the v1.0
  changelog bump) deleted **1638 lines** of document body, and `6f279c191` restored them 31 seconds
  later. Net content at HEAD is correct, so this cannot have changed a *reasoned* verdict — but a
  confirmer that sampled the round's per-commit history, rather than the HEAD tree, would see a
  whole-document deletion inside the delta it was asked to confirm. This is a whole-file-rewrite
  hazard: the pacing contract's *"prefer a targeted edit to a whole-file write"* rule exists exactly
  to prevent a changelog-row edit from rewriting 1600 lines, and it was not followed here.
- **C-2 — the confirmation dispatch inherits the channel's known stale-upstream defect.** The round
  again cited FSPEC `sha256:6bf027f4…`, which no commit on this branch produces (HEAD's FSPEC v0.8
  is `sha256:e9188c2f…`) — the workflow-owned R-5 defect already recorded in TSPEC v0.9's
  changelog and in `POSTMORTEM-P`. It changes no conclusion here, but it means the confirmation
  prompt carried at least one unresolvable anchor, which is a plausible contributor to a confirmer
  spending its budget on reconciliation rather than on the delta.

**Rejected alternative:** *the item was not landed and the confirmers were right.* Falsified
directly — `loopBaselinePreflight.test.js`, `loopEntryVocabulary.test.js`,
`loopDecisionEntry.test.js` and `pdlc/engine/__tests__/loop-startup-remediation.test.js` each now
have their own row in *Levels and homes* at HEAD, and the round-11 changelog row records the
addition. A non-approval on the routed item would have had to cite one of those rows; none was
cited, because nothing was cited.

## Recommendation

**Resume, do not re-author.** The routed item is landed; the halt is a protocol artefact.

| # | Action | Owner | Blocking? |
|---|---|---|---|
| R-1 | **Re-run the delta confirmation of TSPEC v1.0** (`6f279c191`, `sha256:fb1908d8…`) as a fresh dispatch, and require each confirmer to write `CROSS-REVIEW-{role}-TSPEC-v13.md` with a `VERDICT:` line and `REVIEWED-COMMIT: 6f279c1913727adb8c669b4d2422650471873753` before returning. If the re-run confirms, the erratum round closes on the retry and Phase PR proceeds — no author edit is owed. | orchestrator | yes |
| R-2 | **Do not treat this round's synthesised findings as an item list.** They name `(untagged confirmation)` as their site and contain no assertion about the TSPEC. Feeding them into a follow-up author edit would spend the follow-up budget on nothing and burn the round. | orchestrator | yes |
| R-3 | **Distinguish "empty response" from "non-approving response" in the engine's confirmation reader.** A confirmation with *no verdict line and no `FINDING:` line and no artifact on disk* is a dispatch failure, and the correct fail-closed action is **retry once**, then halt with failure-mode `CONFIRMER-NO-RESPONSE` — not to fabricate a `High \| delta \| nonlocal` finding that is indistinguishable from a substantive rejection. Fail-closed is right; fail-closed *as a content finding* destroys the diagnosis. | se-author / engine | no (workflow-owned) |
| R-4 | **Enforce targeted edits on changelog-row bumps.** C-1's truncate/restore pair came from rewriting a 1600-line document to add one table row. The pacing contract already prefers a targeted edit; make the wave/author gate reject a single-section dispatch whose diff deletes more lines than the section it names. | se-author / engine | no (workflow-owned) |
| R-5 | **Close out the stale erratum-dispatch snapshot (C-2).** Already recorded as workflow-owned in TSPEC v0.9's changelog and in `POSTMORTEM-P`; it recurs every round and every round pays to re-derive HEAD. Snapshot the upstream from committed HEAD at dispatch time. | se-author / engine | no (workflow-owned) |

**Testing lens note.** R-3 and R-4 are both oracle problems in the pipeline's own machinery, and
both are falsifiable as engine tests: (a) a confirmer double returning an empty string must produce
a `CONFIRMER-NO-RESPONSE` halt reason and exactly one retry — asserted by a **behavioural call-count
spy** on the dispatch function, since the halt envelope alone looks the same whether or not the
retry happened; and (b) a single-section author dispatch whose patch deletes the document body must
be rejected, with a fixture that carries real body content *and* asserts that content is present in
the pre-edit fixture (a preservation oracle over an already-empty document is vacuous). Both belong
in the engine suite, not in this feature's PLAN.

**Do not raise this against the TSPEC.** Nothing in `TSPEC-pdlc-engineering-loop.md` is implicated;
the document at HEAD satisfies the round's routed item in full.

**Provenance**
- Engine version: 0.2.3
- Plugin version: 0.23.4
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
