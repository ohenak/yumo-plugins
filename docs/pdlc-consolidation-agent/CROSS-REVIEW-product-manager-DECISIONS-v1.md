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

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | **High** | Cross-Feature | DEC-CONS-01 rejects "redact at the logging boundary" on the ground that "the module has no boundary to scrub", and concludes that NFR-2 non-disclosure is *structural*. The module does have such a boundary, and this feature renders through it: `rtGit` instructs the transport agent, on non-zero exit, to return "the LAST 300 characters of its **combined output**" (`runtime-adapter.js:951`), parsed into the `stderr` field at `:976-980`; `rtGhRun` reuses "rtGit's reply shape, verbatim" (`:991-995`). TSPEC then routes that field into rendered artifacts — `enumerateCorpus` returns `{unlistable: true, detail: stderr}` (`TSPEC:618`, `:684`) and §10.3 row 1a puts "pathspec `stderr` in report body" (`TSPEC:1832`); `openClone` returns `{failure, detail}` (`TSPEC:1522`) on the **credentialed** clone/push path. So the credential's *value* is kept out of the JS process on the way **out** (true, and well argued), but the failure-reply channel carries command output back **in** and thence into a report body, and no oracle in the entry's Testability line touches it — both its arms only drive `_envPresent`. Either state this residual explicitly, as DEC-CONS-04 admirably does for its unclosed race, or state the mechanism that closes it (e.g. that no credentialed argv element ever exists, so combined output cannot contain the value). As written the entry records a guarantee the shipped seam contract does not give, on the one NFR where a reader must not be reassured wrongly. | NFR-2, AC-4.2, AC-4.3 |
| F-02 | Low | Local | §2's decision index lists DEC-CONS-01 as load-bearing on "NFR-2, AC-4.2", but the entry's own **Constraints** paragraph names AC-4.3 as the criterion that forces the fail-closed reading ("an unparseable reply must degrade to `credential-unavailable` and the AC-3.5 proposal-file fallback"), and its Testability line tests three arms including that one. The index is the row a downstream reader traces from; add AC-4.3 (and, if you agree, AC-3.5) so the fail-closed obligation is traceable from the table rather than only from the prose. | AC-4.3, AC-3.5 |
| F-03 | Low | Local | DEC-CONS-07 says "the accepted cost is stated rather than absorbed" and then states exactly one cost — the unreachable empty arm of FSPEC §4.2. The TSPEC states **two**: the second is that "the zero-byte marker is permanent, one per consuming repo, from the first pass onward … the only surface on which it appears is a literal `ls docs/_decisions/`, where a zero-byte `.consolidation-lock` means *free*, not *stuck*" (`TSPEC:962-966`), carried into §13.3's residue list as "one permanent zero-byte `docs/_decisions/.consolidation-lock` per consuming repo" (`TSPEC:2522`). That is the residue an **operator** meets, and AC-1.3 tells the operator that deleting `.consolidation-lock` clears the lock — which invites exactly the presence-means-held reading this decision inverts. One sentence carrying `TSPEC:962-966` into the entry makes the DECISIONS document standalone-readable on the half a human touches. | AC-1.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-CONS-05 is **provisional** — §7 says so in terms ("not settled here… raised upstream as an erratum") — while §2 lists it as load-bearing on AC-1.1, AC-1.2 and NFR-5. That is the right disclosure and I am not asking to change it. The question is for the PLAN: if the REQ author answers "yes, an ignored LEARNINGS file is corpus", the entry says divergence class (i) closes at the price of one flag. Does the PLAN need a contingent task for that flag, or is the answer expected before Phase P? Nothing here blocks; I would rather the sequencing be stated than discovered. |
| Q-02 | §10 row 12 folds the shipped-hook `PDLC_PENDING:` stderr line into DEC-CONS-05 and says DEC-CONS-05 is *conditional* on it. REQ §5's in-scope list enumerates hook edits at `nudge-consolidation.sh:41` (predicate) and `:28` (corpus glob) but not a third, observation-only edit. I am **not** raising this as a finding: it was weighed and settled at the TSPEC layer (`TSPEC:117`, `§13.1` row 12), which I approved at v7, and REQ §5a puts re-opening a settled question out of order absent new `file:line` evidence — I have none. The question is only whether the REQ's in-scope sentence should pick the edit up during its next erratum pass, so the scope list and the shipped diff agree on paper. |
| Q-03 | DEC-CONS-04's Testability says the race "is deliberately **not** tested" and DEC-CONS-07's says the unreachable arm is not tested. Both are correct calls and both are argued. Should §11.2 carry a one-line "what is deliberately unasserted, and why" list, so the PROPERTIES author inherits the *absences* as explicitly as the three invariants it already inherits? A property author reading §11.2 alone would not know that two named behaviours are out of bounds by decision rather than by oversight. |

## Positive Observations

## Recommendation

## Verdict
