# Cross-Review: software-engineer — REQ (delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md
**Date:** 2026-08-17
**Iteration:** 9

## Scope of this round

Delta only. Diff reviewed: `0eef4d31..HEAD` on the REQ (+20/-13, three hunks plus the
changelog row). Prior findings F-01/F-02/F-03 from
`CROSS-REVIEW-software-engineer-REQ-v8.md` re-checked against code; the changed sections
(§5 C-9, §6.4 AC-4.3, §6.5 AC-5.2) scanned for new issues. Nothing unchanged and already
approved is re-litigated.

## Prior-finding dispositions

| Prior | Severity | Landed edit | Disposition |
|---|---|---|---|
| F-01 | High | AC-5.2 (`REQ:466`–`:476`) replaces the four-member list with an exhaustive eight-member enumeration plus an explicit "the set is exhaustive — any field outside it must match exactly" clause | **Resolved, and verified complete against the producer.** `buildEngineBlock()` (`pdlc/engine/lib/report.mjs:76`–`:95`) returns eighteen keys. The eight now exempted — `authSources` (`:82`), `startup` (`:84`), `dispatches` (`:85`), `retries` (`:86`), `pauses` (`:87`), `denials` (`:88`), `loop` (`:91`), `outcomes` (`:92`) — are exactly the run-variable ones. Of the remainder, `startedAt`/`finishedAt` (`:93`–`:94`) fall under the pre-existing "timestamps" term and `pluginRoot` (`:79`) under "paths"; `startupAuth`, `transport`, `baseUrl`, `tunables`, `permissionMode` are fixed per installed pair and correctly left un-exempted, so the exhaustive clause binds them rather than waiving them. No sixth un-exempted run-variable field remains: the criterion now passes on a correct sweep and still fails on a degraded one. |
| F-02 | High | C-9 (`REQ:264`–`:267`) drops the hand-edited-file conservatism clause and states the exclusion explicitly, deciding in AC-4.3's favour rather than reconciling | **Resolved.** C-9 and AC-4.3 (`REQ:446`–`:453`) now give a TSPEC author one instruction, not two: refuse on an entry the expected set does not name, no obligation toward a hand-modified expected entry. The contradiction that made deletion-versus-refusal undecidable is gone, and AC-4.3's added post-refusal clause ("every expected entry the directory held before the run is still present and byte-identical after it") supplies the positive assertion the absence-only refusal check was missing. |
| F-03 | Low | AC-5.2's rationale now reads "Each of those eight" | **Resolved.** Referent and count agree with the list that precedes it; the provenance versions are no longer swept into the run-variable claim. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **C-9's new rationale states a falsifiable fact about shipped tooling, and the tooling falsifies it.** The added sentence says "no post-sweep artifact records the hashes that would let anything tell a modified copy from an original." Such an artifact does exist and is present in the consumer repo at the moment cleanup runs: `.claude/workflows/.pdlc-sync-manifest.json` carries a per-row `consumerHash` (written at `pdlc/hooks/scripts/sync-workflows.sh:505` and `:527`, read back at `:139`, and consumed by `pdlc/hooks/scripts/check-workflow-drift.sh:267`). The sweep retires the plugin-side tooling in *this* repo; it does not reach the consumer's untracked copy, so the manifest outlives it. The scope decision itself is sound and I am not asking to reopen it — a cleanup that reads a manifest it is about to delete buys little. What needs fixing is the stated reason: say the exclusion is a deliberate scope choice (the cleanup does not interpret the retired tooling's own state files), not an impossibility. As written, the first engineer who greps the manifest schema will read C-9 as inaccurate and reopen a settled question. | §5 C-9 (`REQ:264`–`:267`) |
| F-02 | Medium | Local | **AC-4.1's observable set names two things to remove; the directory holds at least four, and AC-4.3 turns every unnamed one into a guaranteed refusal.** AC-4.1 (`REQ:441`–`:445`) says a `.claude/workflows/` copy and a drift-state record are gone. Two further artifacts live in the same directory in any repo that ever ran a sync: `.pdlc-sync-manifest.json` (`sync-workflows.sh:464`) and the `.pdlc-backups/` directory (`:611`). If the cleanup's expected set does not name them, AC-4.3's refusal fires on the ordinary case rather than the exceptional one, and AC-4.1 and AC-4.2 (idempotence) can never both be observed in a real consumer repo. The set's membership is TSPEC material and I am not asking for it here; AC-4.1's *observable* clause is REQ material, and it should say the directory is gone rather than naming two of its contents, so the criteria cannot be satisfied by a cleanup that leaves the other two behind. | §6.4 AC-4.1 (`REQ:441`–`:445`) vs AC-4.3 (`REQ:446`–`:453`) |
| F-03 | Low | Process | **Downstream FSPEC text still narrates the superseded C-9 wording and will read as stale once this REQ is republished.** FSPEC §4.5 (`FSPEC:510`–`:512`) and E-16a (`FSPEC:575`) describe AC-4.3's "or hand-modified" clause and §7.2 carries the erratum that asked for its removal — accurate as history, misleading as current contract now that REQ v0.11 has landed the change. No REQ edit is owed; noting it so the FSPEC round picks it up rather than a TSPEC author discovering the mismatch. | §6.4 AC-4.3, downstream |

FINDING: Medium | delta | local | §5 C-9 | Rationale claims no artifact records hashes; `.pdlc-sync-manifest.json` records `consumerHash` per row and survives the sweep.
FINDING: Medium | inherited | nonlocal | §6.4 AC-4.1 | Observable removal set names two of at least four artifacts in the target directory; unnamed ones make AC-4.3's refusal the ordinary outcome.
FINDING: Low | inherited | nonlocal | FSPEC §4.5/§7.2 | Downstream narration of the superseded C-9 wording, for the FSPEC round.

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-5.2 compares the eight run-variable collections "for presence, not for content". Is presence of the key alone intended, or presence with a declared container shape (array versus object)? The latter is no more expensive to check and catches the case where deleted machinery leaves a field stranded at `null` — which is the degradation NG-3 exists to catch. Carried forward from v8 Q-01, unanswered; still non-gating. |

## Positive Observations

- **F-01's fix was made at the right altitude.** The previous list was replaced by an exhaustive enumeration *plus* a stated exhaustiveness rule, so the criterion now has a defined verdict for a field nobody anticipated — a future engine field that is genuinely run-variable will fail the check loudly instead of slipping through an open-ended term. That is the stronger of the two repairs available and the harder one to write.
- **The C-9/AC-4.3 contradiction was decided, not split.** The edit picked one side and deleted the other clause outright rather than adding qualifying prose to both. Documents converge when authors do this and stall when they do not.
- **AC-4.3's added post-refusal clause pairs the negative with a positive.** "Leaves that entry byte-identical" alone could be satisfied by a cleanup that deleted everything else; the whole-directory assertion closes that, unprompted.
- **Delta radius is clean.** Three hunks and a changelog row; re-reading found no collateral edit to AC-1.1/AC-1.2's set-equality terms, the BL-07/BL-08 baselines, or §6.1's deletion list.

## Recommendation

**Approved with minor changes**

Both prior High findings are resolved and verified against the producing code, not merely internally consistent. The two Mediums are single-sentence corrections that do not change any criterion's verdict: F-01 restates a reason, F-02 widens one observable clause from two named artifacts to the directory. Neither blocks TSPEC authoring, and both can ride in the next edit this document takes for any reason.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:1038b8166cc84cb48d069c3e364a2a8e9aa07daf612e2fc8d611c3100e584294
APPROVAL-HASH-NORMALIZED: sha256:d96e2b061dd351d439d9edb7a33f650b6d067be38b1d6297689795b4dc6b7e06
REVIEWED-COMMIT: 82431c7cf4b035b08a5bf4449b33aec7f738ac3c
