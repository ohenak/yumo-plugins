# Cross-Review: software-engineer — REQ (delta confirmation, decision freeze)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md
**Date:** 2026-08-18
**Iteration:** 12

## Scope of this round

Empty delta. `git diff 82b37092..HEAD -- docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`
returns nothing: the REQ's last content commit is `a5cb6322`, which predates my v11 review
commit `82b37092`. The only commits since are queue-state bookkeeping (`819c0fd8`,
`f7212de2`) recording that the engine run stopped mid-Phase-R round 11 and resumed. The
working tree is clean (`git status --porcelain` empty), so the bytes under review in
round 12 are byte-identical to the bytes I approved in round 11.

Under the delta protocol an empty delta cannot introduce a defect, so the only live
question is blocking condition (ii): has the repository moved under the document such that
a load-bearing claim is now false at HEAD? I re-verified the nine claims tabulated in v11
against HEAD rather than trusting the earlier round.

## Re-verification at HEAD

| Claim (from v11 table) | Checked at HEAD | Verdict |
|---|---|---|
| `postWaveCommand` / `postWavePathspecs` survive the sweep and are parsed | `pdlc/workflows/orchestrate-dev.js:165`–`:170` (`IMPLEMENTATION_DEFAULTS`, `Object.freeze([])`), `:218`–`:245` (parse/validate), returned in the config object at `:248`–`:255` | Still accurate |
| Reduced build still emits the M-9 files under `pdlc/workflows/dist/` | `pdlc/workflows/dist/` holds exactly the five measured artifacts, `pdlc-cli.mjs` included | Still accurate |
| Queue row 24 `pdlc-consolidation-rehost` exists, `pending`, binds O-8 | `docs/_queue/QUEUE.md:86` (row 24, depends-on `pdlc-plugin-retirement, pdlc-headless-engine`) plus the row-24 rationale paragraph beneath the table | Still accurate |
| Successor REQ exists and is vetoable | `docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md:3` (`ready: false`), `:8`–`:12` (DRAFT, UNREVIEWED; unblocks only on operator flip) | Still accurate |
| Sync manifest / backups live in the consumer tree the sweep never reaches | `pdlc/hooks/scripts/sync-workflows.sh:464` (`.pdlc-sync-manifest.json` path), `:505`, `:527`, `:139` (`consumerHash` write/read), `:612` (`.pdlc-backups`) | Still accurate (`.pdlc-backups` anchor drifted `:611`→`:612`; content unchanged) |

Nothing in the repository has moved against the document. No claim in the REQ is false at HEAD.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **Inherited, nonlocal, unchanged since v9.** C-9 (`REQ:286`–`:288`) still justifies omitting a hash-comparison step as though no post-sweep artifact records hashes. `.claude/workflows/.pdlc-sync-manifest.json` does carry per-row `consumerHash` (written `sync-workflows.sh:505`, `:527`; read `:139`), in a consumer tree the sweep never reaches. The scope decision is sound; only the stated reason is wrong — it is a deliberate choice, not an impossibility. | §5 C-9 |
| F-02 | Medium | Local | **Inherited, nonlocal, unchanged since v9.** AC-4.1 (`REQ:468`) names two artifacts as the observable removal, while the directory holds four after a sync (`.pdlc-sync-manifest.json` `sync-workflows.sh:464`, `.pdlc-backups/` `:612`); AC-4.3 (`REQ:473`) therefore turns an expected entry into a guaranteed refusal. Single-sentence fix whenever the document is next opened. | §6.4 AC-4.1 / AC-4.3 |
| F-03 | Low | Local | **Inherited.** Changelog row v0.15 (`REQ:20`) and O-8 restate the same binding at near-full length; the obligation is the single source and the changelog row could cite it. Cosmetic. | §Changelog |

No High findings. All three findings are inherited and nonlocal — they sit in sections the
(empty) delta did not touch, and none is falsified by HEAD.

DEFERRED: C-9's rationale sentence and AC-4.1/AC-4.3's artifact enumeration should be corrected the next time the REQ is opened for content.
DEFERRED: AC-5.2's eight run-variable collections still need a set-equality check downstream, not containment, so a deleted collection fails.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v8–v11, still non-gating: is AC-5.2's eight-collection enumeration set-equality-checked anywhere downstream, or containment-checked? A deleted collection should fail the check. |

## Positive Observations

- **The round-11 interruption was lossless for the document.** The engine stopped after the
  v11 review commit landed and before any further REQ edit; the resume produced no partial
  write, no stray working-tree change, and no conflicting re-edit. The REQ at HEAD is exactly
  the reviewed artifact, which is the cheapest possible state to re-enter Phase R from.
- **The O-8 binding is still machinery-backed at HEAD, not merely asserted.** Both halves —
  queue row 24 and the successor REQ — exist, and the `ready: false` flag on the successor REQ
  means the operator's veto is enforced by the pickup path rather than by convention.
- **No repository drift against the document across the interruption.** Every anchor I checked
  resolved to the same construct; the single one-line drift (`.pdlc-backups`) is positional, not
  behavioural.

## Recommendation

**Approved with minor changes**

Neither blocking condition is met. The delta is empty, so it introduced no defect; and every
load-bearing claim re-checked against HEAD holds, so there is no factual contradiction with the
repository. Under the decision freeze the two inherited Mediums and one Low are recorded, not
gating, and change no criterion's verdict.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
