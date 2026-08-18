# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-18
**Iteration:** 13 (delta confirmation)
**Scope:** confirm the `7b659a65` edit (TSPEC v0.11) resolves round-12's F-01 (High)
and F-02/F-03 (Low) without disturbing any previously-approved section. `git diff
7b659a65 -- docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` against HEAD
is empty — `7b659a65` is the tip commit for this file, so the round-13 delta is exactly
the diff `7b659a65` introduces over the v0.10 baseline v12 reviewed.

## Delta verification

| Round-12 finding | Disposition in v0.11 | Verified |
|---|---|---|
| F-01 (High) — row 11 (`TSPEC:313`, formerly `:304`) and AT-3.1 (`TSPEC:756`) only named the two delegator-SKILL.md files; `consolidate-learnings/SKILL.md`'s two-part obligation (bundle-reference deletion **and** delegation-contract prose restatement) had no task-level oracle | Row 11 now states the two-part obligation explicitly ("**two obligations landing in the same commit**"), and a new oracle `RLH-SKILL-10` is added directly beneath AT-3.1 (`TSPEC:757`), explicitly scoped as a *separate, black-box* oracle rather than a widening of AT-3.1's four-conjunct static-half ladder — matching FSPEC §3.3 step 4's stated shape for the class-11 two-part edit. §5.5's swept-surface table (`TSPEC:843`) is updated to list `RLH-SKILL-10` alongside `RLH-SKILL-08`/`RLH-SKILL-09` on the same `skillFiles.test.js` row. §6.1 item 3 (`TSPEC:1255`–`:1269`) is retitled "RESOLVED UPSTREAM" and its prose now states REQ's accepted correction and points to §6.2 SUCC-2 for the bound successor. §6.2 SUCC-2 (`TSPEC:1392`) names `pdlc-consolidation-rehost` and cites `docs/_queue/QUEUE.md` Order 24 and `docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md` — both confirmed present on disk (QUEUE.md row 24, `pending`; REQ file exists). All four sub-claims verified against REQ v0.14/v0.15/§A-1 and FSPEC v0.10/§3.1 class 11, which state the identical bundle-deleted / delegation-prose-restated / bound-successor facts. | Resolved |
| F-02 (Low) — §3.2's BR-CLN-3a text (`TSPEC:356`–`:360`) argued a content-based post-sweep predicate is "impossible," while REQ v0.16 restates C-9's hand-modified-entry exclusion as a scope decision ("presence, not provenance"), not an impossibility claim | §3.2 (`TSPEC:365`–`:374`) is reworded exactly along the suggested line: "a content-based predicate is not read post-sweep... This is the scope decision REQ C-9 states: the criterion judges **presence, not provenance**... correcting an earlier framing as an impossibility claim." Matches REQ v0.16 (`REQ:20`, `REQ:291`) verbatim in substance. No implementer obligation changed — contract table rows 1–5 are untouched, as v12 anticipated. | Resolved |
| F-03 (Low) — T-4/T-5 (`TSPEC:1375`–`:1376`) used pre-C-7-settlement vocabulary ("AC-1.2 red by construction," "Blocking") instead of REQ C-7's now-settled held-class terms | T-4 (`TSPEC:1394`) now reads "**Held class, not a C-7 red**" and restates the "incomplete feature on an unmerged branch, never a registered expected failure" language verbatim from REQ v0.12 (`REQ:28`). T-5 (`TSPEC:1396`) is restated as "Resolved upstream, ordering obligation remains," folds in the O-8 disposition and SUCC-2 successor reference, and closes with the same held-class phrasing REQ C-7 uses. Both rows now read consistently with §6.4/REQ C-7 elsewhere in the document. | Resolved |

No new finding was introduced by the round: the edit is additive/corrective in exactly
the three locations the round-12 findings named (row 11 + AT-3.1/§5.2/§5.5, §3.2, §6.1/§6.2/§6.3),
and a scan of the surrounding unchanged sections (§2.9 class 12/13, §5.4, the rest of §6.4)
turned up no collateral drift.

## Findings

None.

## Questions

None. Round-12's Q-01 (T-5's pending "explicit REQ decision") is answered by REQ O-8 (v0.14/v0.15)
and reflected in the restated T-5 row.

## Positive Observations

- The RLH-SKILL-10 fix took the more precise path v12 implicitly invited: rather than stretching
  AT-3.1's delegator-specific four-conjunct ladder to cover a file that "is not a delegator," the
  edit adds a distinct, explicitly-scoped oracle and says so in its own text — keeping AT-3.1's
  contract crisp for the files it actually governs.
- §6.1 item 3's RESOLVED UPSTREAM treatment is symmetric with item 9's existing pattern (both now
  read "raised... resolved upstream... retained for lineage, not for action"), so the erratum ledger
  stays internally consistent rather than accumulating one-off phrasings.
- Every factual claim in the round-11 edit (oracle names, REQ/FSPEC version citations, QUEUE.md
  Order 24, `pdlc-consolidation-rehost` REQ path) checked out against the actual files on disk —
  no drift between what the edit cites and what exists.

## Recommendation

**Approved**

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:1554c7d0349ef5d4337c4e5e705bc0c4b867bd3cb46b5191f315d560b87c23b8
APPROVAL-HASH-NORMALIZED: sha256:293be00709f2dd1453e01a4040cc78b99ecb6083b60b632bae7f6375be37bf32
REVIEWED-COMMIT: 7b659a650d5f78e97616a457cd4cfca616c1d8e1
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
UPSTREAM-STATE: FSPEC sha256:5cd899dac04a05b6d7b002a0f0056d7fd5508525cb1399d1dc1f069347e1de23
