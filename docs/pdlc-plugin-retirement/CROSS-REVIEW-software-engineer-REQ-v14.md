# Cross-Review: software-engineer — REQ (delta, decision freeze)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md
**Date:** 2026-08-18
**Iteration:** 14

## Scope of this round

Delta reviewed: `git diff 224bee64..HEAD -- docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`.

**The delta is empty.** No commit has touched the REQ since the v13 round. The only commit
between the last reviewed tree and HEAD (`b50c28f4`) adds
`CROSS-REVIEW-software-engineer-REQ-v13.md` — my own prior review file, +79 lines, no other
path. Working tree is clean; the REQ is byte-identical at 637 lines / 53,132 bytes, inside the
pdlc REQ budget (700 lines / 60 KB).

With no delta, the freeze bar admits only one blocking route: a load-bearing claim that has
become false against HEAD since v13. Code under `pdlc/` did not move in that range either, so
this round is a re-verification pass, not a re-read.

## Prior-finding disposition

| Prior | Status | Evidence |
|---|---|---|
| v13 F-01 (Low) — v0.15 changelog row still near full length where a citation of O-8 would do | **Open, unchanged** | `REQ:22` still carries the long-form row. Cosmetic, inherited, nonlocal; deferred below rather than re-filed as gating. |

Nothing was resolved this round because nothing was edited. No prior finding regressed.

## Load-bearing claims re-verified at HEAD

- **C-9's scope wording** (`REQ:288`–`:291`) still reads "Conservatism toward a *hand-modified
  expected* entry is deliberately outside scope by decision: cleanup judges presence, not
  provenance." That still matches the shipped design — the manifest does carry a per-row
  `consumerHash` (`pdlc/hooks/scripts/sync-workflows.sh:505`, `:527`), so provenance is
  *available* and the REQ correctly frames its exclusion as a choice, not an impossibility.
  Consistent with `DECISIONS-pdlc-plugin-retirement.md:165` (DEC-04, name-only, all-or-nothing).
- **AC-4.1's removal target** (`REQ:466`–`:471`) still names the whole `.claude/workflows/`
  directory "in whatever state the sync last left it — every entry the sync writes, bookkeeping
  and backups included, not two named artifacts". The three bookkeeping/backup writes it
  generalises over are unchanged at HEAD: `.pdlc-drift-state.json`
  (`pdlc/hooks/scripts/sync-workflows.sh:239`), `.pdlc-sync-manifest.json` (`:465`),
  `.pdlc-backups/` (`:612`).
- **AC-4.3's refusal contract** (`REQ:473`–`:482`) still pairs the negative assertion (nothing is
  deleted) with a positive one on the same path — every expected entry still present and
  byte-identical, path named on stderr, non-zero exit. No absence-only oracle.
- **O-8's successor binding** (`REQ:22`) cites `docs/_queue/QUEUE.md` row 24 and
  `docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md`. Both exist at HEAD:
  `docs/_queue/QUEUE.md:86` carries row 24 `pending` with that exact path and the
  `pdlc-plugin-retirement, pdlc-headless-engine` dependency pair, and the successor REQ file is
  present. Not a nonexistent-authority citation.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **Inherited, nonlocal, unchanged since v11.** The v0.15 changelog row (`REQ:22`) is still near full length where a citation of O-8 would do; the v0.16 row (`REQ:20`) is appropriately short. Single-row cosmetic leftover, no downstream reader depends on it. | §Changelog |

No High findings. No Medium findings. The one Low is inherited and nonlocal to a delta that does
not exist.

DEFERRED: trim the v0.15 changelog row to a citation of O-8 whenever the REQ is next opened for content.
DEFERRED: confirm downstream that AC-5.2's eight run-variable collections are checked by set-equality rather than containment, so a deleted collection fails.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried v8–v14, still non-gating: is AC-5.2's eight-collection enumeration set-equality-checked downstream, or containment-checked? |

## Positive Observations

- Two consecutive rounds now close without a Medium or High: v13 fixed C-9 and AC-4.1, and
  nothing has destabilised since.
- The REQ holds altitude throughout — AC-4.1/AC-4.3 state observable outcomes and leave the
  cleanup's mechanics to TSPEC/PLAN.
- Every repository claim I could reach resolves to a real file at HEAD; no stale path, no
  invented authority.

## Recommendation

**Approved with minor changes**

Neither blocking condition is met: the delta is empty, so it introduced no defect, and every
load-bearing claim re-checked against HEAD still holds. The single remaining Low is cosmetic and
inherited.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
