# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v1.md`. Diff base
`f54d4e6` (the commit at which v1 was written) → HEAD; five revision commits touched this
document (`7e9044b`, `ab84ce7`, `89e3aa3`, `c60b3d2`, `9b05e97`), +218/−43 lines. Testing lens
only: whether each v1 finding is closed, and whether the *changed* text introduced a new oracle
that cannot fail or a claim the code contradicts. Unchanged sections approved at v1 are not
re-litigated.

## Disposition of v1 findings

| v1 ID | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | High | **Partially resolved** — the clone half is closed, a second instance of the same defect is now visible in the replacement text. See F-01 below | §5 now partitions three domains and pins the clone positionally (`["clone","--depth","1","--single-branch",R,D]`, both trailing positions character-identical to the `remote get-url` and `_makeTempDir` replies). That answers Q-01 exactly. The *invoking-tree* domain's verb set is the new problem |
| F-02 | High | **Resolved** | §7 now states the `CORPUS_GLOBS` widening inside the Decision and asserts the divergence set "**only against the post-edit hook**". The HEAD measurement it quotes reproduces: `nudge-consolidation.sh:28` is still the single `glob.glob(os.path.join(proj,"docs","*","LEARNINGS-*.md"))`, and the replacement is exactly `TSPEC:787-788` (`CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")` + comprehension) |
| F-03 | Medium | **Resolved** | §7's alternatives bullet now states **three changes in one file** — env-gated `PDLC_PENDING:` write, `:28`'s glob → `CORPUS_GLOBS`, `:41`'s predicate scoped to two regions — and §11.1 row 6 states the same three and the same single owning task. The two sections agree; the pre-condition of DEC-CONS-05's cost comparison is now honest. Q-02 answered |
| F-04 | Medium | **Resolved** | The type claim is withdrawn in terms. `git ls-files 'pdlc/**/*.ts' 'pdlc/**/tsconfig.json'` returns **nothing** — the document's parenthetical is exactly right — and the replacement is a real runtime oracle (`typeof` every recorded `_envPresent` return is `"boolean"`) plus a source pin on the transported command text |
| F-05 | Medium | **Resolved** | §3 conjunct 3 and §11.2 bullet 1 both now say set-equality over AC-4.2's three values, "observed set **exactly** equal to the declared set". The cited enumeration resolves: `REQ:320-322` carries `present (redacted)` / `absent` / `local-gh` |
| F-06 | Medium | **Resolved** (one scoping wrinkle, filed Low as F-03 below) | §8's read-side half is now paired with two positives, one of which (the absolute-`${path}` resolution through `rtReadProbe`'s `if [ ! -f "${path}" ]`, `wc -c < "${path}"`, `shasum -a 256 "${path}"` forms) is anchored to text unique to that function and therefore dies if the function does. Line cites resolve: `rtReadProbe` at `runtime-adapter.js:369`, the forms at `:374-378` |
| F-07 | Medium | **Resolved** | §6 now says the trigger is "**operator-reported and un-instrumented** — no monitor exists and none is added by this feature", and states the forensic signature (two `.consolidation-log.md` records, distinct `passId`s, same `(failure-mode-id, action)` key) while explicitly saying nothing computes or asserts it. That is the right shape: a named observable *plus* an explicit disclaimer that it is not watched |
| F-08 | Low | **Resolved** | §9 and §11.2 now cite `docs/_constraints/pdlc-consolidation-vocabularies.md:38-43`. Verified: lines 38–43 are exactly `promoted`, `promoted-degraded`, `no-op`, `skipped-cadence`, `refused`, `failed`, all tagged `terminal status`, in a file whose own §1 says downstream completeness is checkable "by **set-equality against this table**" |
| F-09 | Low | **Resolved** | `ADVISORY_RUNG_SKILL = "se-review"` is at `pdlc/workflows/orchestrate-dev.js:1797` and "there is no second, private copy of this ladder anywhere" at `:1802`; both citations now read that way |

Seven of nine closed outright, one Low closed with a residue filed below, and one High
half-closed. The two commits I checked hardest (`89e3aa3`, `9b05e97`) do what their messages say.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
