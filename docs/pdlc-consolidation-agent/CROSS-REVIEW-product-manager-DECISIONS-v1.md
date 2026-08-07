# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 1
**Scope:** Local (per-finding tags in the table)

## Verification method

Every `file:line` citation in the document was re-checked against HEAD rather than read as given,
because six of the seven entries rest on a measurement of the shipped tree. All of the following
verified exactly as written:

- The adapter verb inventory in §1: `rtWriteFile` (`pdlc/workflows/runtime-adapter.js:802`),
  `rtAppendFile` (`:863`), `rtListFiles` (`:905`), `rtGit` (`:945`), `rtGhRun` (`:995`),
  `rtRunCommand` (`:1034`), `rtReadFile` (`:493`), `rtCheckFile` (`:817`), `rtHashFile` (`:613`),
  `rtMergeWorktree` (`:1060`), `rtDevInjections` (`:1086`). `grep -nc "unlink\|rm -f\|rmdir"` over
  that file returns **0**, as §1 and DEC-CONS-07 both claim.
- `grep -n "relative to the repository root" pdlc/workflows/runtime-adapter.js` returns **exactly
  one** line, `:805`, inside `rtWriteFile` — DEC-CONS-06's central measurement, and the thing that
  makes its "withdrawn on measurement, not taste" rejection of the symmetric edit real.
- `rtCheckFile:817-831` returns `{ok:true}` only for exists-and-non-empty and
  `{ok:false, reason:"file_empty"}` otherwise (`:829`), exactly as DEC-CONS-07 half 2 states.
- `rtListFiles` filters directories at `:915` (`ls -p -A … | grep -v '/$'`) and rejects any reply
  line containing `/` at `:929` — DEC-CONS-05's structural reason for choosing `git ls-files`.
- `MODEL_ADVISORY` (`orchestrate-dev.js:1652`), `MODEL_ADVISORY_FALLBACK` (`:1653`),
  `ADVISORY_RUNG_SKILL` (`:1796`), the "there is no second, private copy of this ladder anywhere"
  doc line (`:1800-1801`), the not-`async`/hop-count paragraph (`:1820-1826`),
  `resolveAdvisoryRung` (`:1833`), the `ADVISORY_MODEL_FALLBACK:` log (`:1858-1860`),
  `MERGE_GUARD_DEFAULTS` (`:48`), `parseAdvisoryConfig` (`:1682`), `mergeCommandFor` (`:319`) and
  its "SOLE place" doc comment (`:310-312`), and `build-runtime.mjs`'s `bundles` array (`:448`).
  `grep -rn resolveAdvisoryRung` confirms **one** shipped call site, `:3132`, as DEC-CONS-02 says.
- The four-artifact claim in DEC-CONS-02's Reversibility: `pdlc/workflows/dist/distribution-manifest.json`
  carries exactly three rows today — `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`.
- The hook citations in DEC-CONS-05: `nudge-consolidation.sh:22` (Python heredoc), `:25`
  (`THRESHOLD = 5`), `:28` (`glob.glob(.../docs/*/LEARNINGS-*.md)`), `:41` (bare substring against
  the whole log).
- **DEC-CONS-05's Reversibility measurement, reproduced command-for-command.**
  `git ls-files --cached --others --exclude-standard` with the two `:(glob)` pathspecs returns 5
  paths; dropping `--exclude-standard` returns the **same 5**; dropping `:(glob)` returns **7**,
  re-admitting `docs/discarded/pdlc-rcv-budget-stop/` and `docs/discarded/pdlc-review-convergence/`.
  That is the entry's claim exactly, including the direction of the asymmetry it draws from it.
- Upstream quotes: `REQ:115-116` ("keeping one enumeration as well as one predicate"), `REQ:155-156`
  ("in-place rewrites of a whole small file"), AC-3.8's forbidden-verb enumeration including "no
  fetch into its refs" (`REQ:278-279`), `FSPEC:415` ("Removed at step 16"), `FSPEC:442` (the
  "unparseable **or empty (truncated write)**" row), E-11 (`FSPEC:2594`) and AT-M3 (`FSPEC:2038`).
- §10's arithmetic: TSPEC §13.1 has 13 rows; 7 promoted (rows 1, 2, 4, 5, 6, 11, 13), 6 dispositioned.

I found **no** false or overstated citation in the document. The one place where a claim outruns the
code is F-01 below, and it is a claim about a *property*, not a line number.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
