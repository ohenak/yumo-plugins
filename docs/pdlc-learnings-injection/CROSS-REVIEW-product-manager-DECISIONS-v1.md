# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.1)
**Upstream read:** REQ v0.9, FSPEC v0.7, TSPEC v0.5, `docs/_constraints/DOMAIN-CONSTRAINTS.md`, `docs/_decisions/`
**Date:** 2026-08-19
**Iteration:** 1

## Verification performed

Every code claim the document makes was re-run against this branch at HEAD, not read back out of the
document. What checked out, in the document's own order:

| Claim | Where the document states it | Verified |
|---|---|---|
| G-A: engine vendors exactly two workflow modules | §Context, DEC-LI-01, DEC-LI-04 | `const MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]`, `pdlc/engine/scripts/prepack.mjs` — **holds** |
| G-B: four `dispatchKind: "authoring"` sites, all funnelling through `dispatchAndVerify` | §Context, DEC-LI-03 | three object-literal sites (phase creator, erratum author, erratum land-proof retry) plus `reviewLoop`'s positional `"authoring"` to `runWrapped`; `wrapped` calls `dispatchAndVerify` — **holds** |
| G-C: Phase CR reaches `dispatchAndVerify` with `docType: null` | §Context, DEC-LI-03 | Phase CR passes `docType: null` explicitly; `roundDocType = docType === undefined ? docTypeFromPath(doc) : docType` therefore keeps `null` and `wrapped` forwards it — **holds, and it is the load-bearing one**: the single-conjunct gate really would admit `se-author` remediating shipped code |
| G-D / DEC-LI-04: `LS_FILES_ARGV` is the shipped corpus predicate | §Context, DEC-LI-04 | frozen argv in `consolidate-learnings.js`, consumed by `enumerateCorpus(_git)` — **holds** |
| Corpus yields 9 documents at HEAD | §Context | re-ran the predicate: **9** — holds |
| `defaultListFiles` is non-recursive and returns basenames | DEC-LI-04 | one `readdirSync`, `.filter(!isDirectory).map(entry.name)` — **holds**, and the "different predicate wearing C-3's name" reading is fair |
| Prompt composition is `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}` | DEC-LI-05 | verbatim in `dispatchAndVerify` — **holds**, so `prompt + block` really is identity when `block === ""` |
| Runtime read cache: shared, 2 MiB, oldest-inserted eviction | DEC-LI-06 | `RT_READ_CACHE_MAX_BYTES = 2097152` and the eviction loop in `runtime-adapter.js` — **holds**, including the "residency not guaranteed to this corpus" caveat |
| `ADVISORY_DEFAULTS.enabled === false`; `parseImplementationConfig` is the fail-open precedent | DEC-LI-07 | `ADVISORY_DEFAULTS` is `{enabled: false, …}`; `IMPLEMENTATION_DEFAULTS` + reader confirm the nearer precedent — **holds**, and the sibling-shape / sibling-default distinction is drawn correctly |
| `git check-ignore -v .baseline-worktree` exits non-zero; `WALK_SKIP_DIRS = new Set([".git", "node_modules"])` | DEC-LI-09 | both re-run/re-read at HEAD — **hold**; the leftover-worktree hazard is real and is this repo's known `coveredViolations` footgun |
| `orchestrate-dev.js` is the largest module | DEC-LI-01 | 15,169 lines vs 2,727 next — **holds** |

Configuration semantics were checked against **current** upstream, not against TSPEC: REQ v0.9
AC-5.1a ("there is no second gate beyond this key (G-1)", absent section reads as §4.1 defaults),
AC-5.1b, AC-5.1c and AC-4.4, and FSPEC v0.7 `BR-14`/`D-1`. DEC-LI-07's five-row table reproduces
those five states exactly, including `NTC-MALFORMED` / `NTC-KEYTYPE` and the "no injection key at
all" report shape. This is the single most important thing in the document and it is right.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
