# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.9)
**Date:** 2026-08-19
**Iteration:** 8
**Scope:** Delta re-review of v7. Decision freeze. Changed sections only, plus verification of every changed claim against HEAD.

## Delta under review

Two commits touch the REQ since the v7 round: `680efb0c` (restores the five round-3 sites reverted by
the rebase — v7 F-01..F-05) and `e619b6d6` (§1 ledger citations and NFR-4 wording — v7 F-06, F-07).
Tree-to-tree `539efa2d..HEAD` on the REQ is **+41 / -11** lines. The edit is restoration plus two
wording corrections; it opens no new decision, and the v1.9 changelog says so explicitly (`:16`–`:26`).

## Verification of prior findings

| Prior | Status | Evidence at HEAD |
|---|---|---|
| F-01 (budget default reverted to `2`) | **Resolved** | C-2 now reads `` `1` `` (`REQ:237`) and the gloss names the `2` as superseded (`:239`). Consistent with R-3 (`:525`), Q-1 (`:575`), D-AWG-05 (`:597`) and the v1.3 changelog. Downstream still pins `1`: `PROPERTIES:163` (PROP-CFG-01 reads back default `1`), `:164` (invalid values fall back to `1`), `:165`/`TSPEC:54` (`{"enabled": false, "waveBudgetPerRun": 1}`). No site now disagrees. |
| F-02 (O-7 deleted, three referents dangling) | **Resolved** | O-7 restored verbatim at `REQ:558`–`:561` with owner `pdlc-engineering-loop` (queue row 6). All three referents now resolve: AC-1.2 prose (`:270`), Q-2 (`:576`), v1.3 changelog (`:72`). |
| F-03 (Upstream path off HEAD) | **Resolved** | Upstream row reads `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (`REQ:11`); the file exists at that path at HEAD. |
| F-04 (uncorrected M-WG-6 row) | **Resolved** | Row now reads "a re-invocation carries no phase-level skip …" (`REQ:109`), which is the true claim: the ledger mechanism does ship. Coherent with D-AWG-03b (`:615`), which frames the gap as reliability rather than design. |
| F-05 (2026-08-11 incident paragraph deleted, two referents dangling) | **Resolved** | Paragraph restored at `REQ:155`–`:166`. Both referents resolve: §6 (`:369`) and D-AWG-06 (`:618`). AC-2.2 class 2 `wave-internal-defect` recovers its live instance. |
| F-06 (§1 line anchors ~2 000 lines stale) | **Resolved, and the repair is the durable one.** | The paragraph now cites stable symbols rather than line numbers, and each resolves at HEAD: `WAVE_STATE_PATH` is exported at `orchestrate-dev.js:11322`, `parseWaveLedger` at `:11375`, and the quoted resume notice — "Notice: the wave ledger … was ignored" — is verbatim at `:14221`. Symbol citations will survive the next rebase; line numbers would not. |
| F-07 (NFR-4's "gate runs between attempts" false) | **Resolved** | NFR-4 (`REQ:503`–`:505`) now says the measured window closes at the attempt's verdict and the gate runs after that verdict. That matches HEAD: the measured span is the `Promise.race` of `dispatched` against `deadline` (`orchestrate-dev.js:3421`–`:3422`), which settles at the verdict, while `seamOps.verifyGate()` is invoked afterwards at `:3549`–`:3550`. The unchanged conclusion — no subtraction, no carve-out — is therefore correctly derived rather than merely asserted. |
| F-08 (approval anchor survived a rebase that reverted approved bytes) | **Instance resolved; process gap carried below as F-01.** | The reverted bytes are restored, so no stale anchor now vouches for absent content. The detection gap itself is not a REQ defect and cannot be closed inside this document. |

## Additional verification at HEAD

The `scriptGate` precondition sentence (`REQ:118`–`:120`) is now stated as "requiring both
`implementation.testCommand` and a `_runCommand` transport". HEAD defines it as exactly that
conjunction — `Boolean(implConfig.testCommand) && typeof runCommandFn === "function"`
(`orchestrate-dev.js:14147`–`:14148`) — and the fallback notice names whichever half is missing
(`:14151`–`:14157`). The claim that a self-report-gate run records nothing therefore holds: the
ledger write sits under `if (scriptGate)` (`:14364`).

REQ size is 624 lines / 50,316 bytes — inside the 700-line / 60 KB budget, with the restored
paragraphs included.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Process | Carried forward from v7 F-08, unchanged and not fixable in this document. A tier-1 approval anchor (`REVIEWED-COMMIT`) can outlive the tree it approved: a rebase silently reverted approved bytes while the anchor kept vouching for them, and only a hand re-diff caught it. The mechanical check is cheap — at phase entry, assert the recorded anchor commit is an ancestor of HEAD (`git merge-base --is-ancestor`) and re-open the round if it is not. Recorded for harvest, not gating this round. | v6/v7 anchors; pipeline phase entry |

## Questions

| ID | Question |
|----|----------|
| Q-09 | Q-08 from v7 is still unanswered for the sibling artifacts: the rebase reverted five REQ sites, and only TSPEC/PLAN/PROPERTIES `waveBudgetPerRun: 1` was spot-checked. Whether FSPEC/DECISIONS lost round-3 bytes the same way remains unverified. Out of scope for a REQ round; worth one `git diff` before the phase closes. |

## Positive Observations

- The repair is exactly what the freeze permits: restoration to approved wording plus two factual
  corrections, with no decision reopened. The changelog states the restoration framing rather than
  presenting the sites as new edits, which keeps the round auditable.
- F-06's fix went beyond the finding. Asking for correct line numbers would have bought one round of
  accuracy; the author replaced positional anchors with exported symbols and a verbatim runtime
  string, which is rebase-proof. That is the right generalisation of the defect.
- The document's redundancy is what made the silent revert visible in the first place — C-2, R-3,
  Q-1 and the v1.3 changelog each state the budget default independently, so a partial revert
  surfaced as a contradiction rather than a quietly wrong constant. Worth keeping.
- Every claim I could ground in code now grounds: ledger symbols, the resume notice string, the
  `scriptGate` conjunction, and NFR-4's window boundary all match HEAD.

DEFERRED: Q-06 from v6 (whether AC-4.1(iii)'s mutation fixture targets an injected gate source edit) stays open for TSPEC; no decision taken here.

## Recommendation

**Approved with minor changes**

All four v7 High findings are resolved, and both non-gating Mediums (F-06, F-07) were fixed in the
same pass and verified against HEAD. The delta introduced no defect and contradicts nothing in the
repository. The single remaining finding is a Low process signal for harvest and does not block.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8
APPROVAL-HASH-NORMALIZED: sha256:ce95cc7fe5ad87c1f49da0d1efde19a9038fcf10d8cd3c320aa976b3eb647a79
REVIEWED-COMMIT: e619b6d60118487b7c3d1cc6c3d2db79856b3ef7
