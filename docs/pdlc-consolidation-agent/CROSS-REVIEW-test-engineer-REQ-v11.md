# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 11
**Scope:** Local (Scope tags per finding below)
**Delta base:** `e775262` (the tree v10 reviewed) → HEAD

Delta re-review. v10's findings F-52 and F-53 are dispositioned in §Prior findings; new findings are
numbered F-54 onward so ids never collide across rounds. Only the five commits that touched the REQ
since `e775262`, plus the two `docs/_constraints/` files they edited, were read for new issues;
unchanged sections approved in v1–v10 were not revisited.

## Prior findings

Both v10 findings are dispositioned below, each against the file the revision edited rather than
against its prose.

| v10 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-52 | Low/Cross-Feature | **Resolved — the ownership rule and the oracle range now cover the sections that had moved, and the round distinguished the two kinds of owned section rather than widening blindly** | I asked for two things: widen the file's ownership sentence past §1/§2, and widen §4b's range and §5's deliverable to match. Both landed, and a distinction I had not asked for landed with them. `pdlc-consolidation-vocabularies.md:18-27` now reads "`REQ-pdlc-consolidation-agent` **owns every section of this file — §1–§4 entire**", and then splits the owned set: "**§1, §2 and §4 are enumerations** — their tables are transcribed row-for-row downstream and are under the set-equality oracle below — while **§3 is owned normative prose**, binding but not enumerated, so it carries no row oracle." §4b mirrors it (`:557-566`) and states the range as "set-equality over every enumerated row this REQ owns — **§1, §2 and §4 entire at Version 1.4** (§4's four-row trailer table and its two derived names included)". §5's deliverable now names "§1–§4 entire, per §4b" for both files (`:585-586`). I checked the classification against the sections rather than accepting it: §4 (`:156-170`) is exactly a two-row derived-names table plus a four-row trailer table, so it is an enumeration and the oracle now reaches the `PDLC-CONSOLIDATION-SOURCES` row whose deletion v10 found unpunished; §3 (`:102-154`) is prose with one fenced block-grammar example and no transcribable table, so exempting it is correct rather than convenient. The version pin moved 1.3 → 1.4 in all six REQ citations (`:83`, `:99`, `:182`, `:222`, `:398`, `:557`) and the file's header row is `| Version | 1.4 · 2026-08-06 |` (`:7`), so no citation is stale. One seam this widening opened is refiled narrowly as F-55. |
| F-53 | Low/Process | **Complied with in the required order, and the outcome moved the wrong way again — refiled as F-56** | The round relocated first and relocated exactly where I pointed. `eef3b3c` ("REQ-CONS-06 preamble cites baseline §1/§2 instead of recapitulating them") is the candidate I named at v10 `:447-453`; `ef6eb17` ("stop restating vocabularies §3 — cite it") took two further restatements out of REQ-CONS-01 and AC-1.3's prose. I verified neither move lost anything a test needs — see §Positive Observations. What did not improve is the measurement: at HEAD the REQ is **637 lines / 61,109 bytes** (`wc -l -c`) against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`), a margin of **331 bytes** where v10 measured 344 and v9 measured 387. Two relocations in one round net-added 13 bytes and one line. The trend is now three rounds long, which is what makes it worth refiling a third time rather than dropping. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
