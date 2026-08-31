# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, bytes unchanged)
**Base reviewed at v9:** `7adc9666196cca6357174fcbb513b6a6f597af2f`
**Upstream HEAD this round:** REQ `5f3e8051…` (v1.6) · FSPEC `c7d2c832…` (v1.7) · TSPEC `f2261510…` / blob `a06a6032…` (v1.7)
**TSPEC reviewed at v9:** `3742216…` (v1.6)
**Date:** 2026-08-31
**Iteration:** 10 (upstream-cascade confirmation — TSPEC erratum round 7)

## Context

**What moved: upstream only.** `git diff 7adc9666..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md`
is empty. This document has not been edited since I approved it at v8 and re-confirmed it at v9; its
bytes are still v1.6. What changed is **TSPEC**, from `3742216…` (v1.6) to `a06a6032…` (v1.7) across
three commits — `e1315dcdb`, `fd4b7b3ab`, `bf496d9aa`. So my v9 approval was taken against a TSPEC
revision that no longer exists, and the single question this round answers is whether DECISIONS is
still a faithful compression of TSPEC **as it now stands**.

**REQ and FSPEC did not move.** Both dispatch pins match HEAD exactly: REQ
`5f3e80519b982f29…` (v1.6) and FSPEC `c7d2c832dee586c8…` (v1.7) are the same revisions v9 measured.
The TSPEC pin in this dispatch (`f2261510…`) is the first dispatch pin in four rounds that I could
not reconcile against a blob on this branch — the file's own content hashes to `a06a6032…` — but
unlike the `512a9fcf…` pin carried through v7/v8, the dispatch's *stated version* (TSPEC after
erratum round 7) resolves unambiguously to HEAD, so re-grounding on HEAD per `DEC-ERR-03` is
uncontroversial here and I say so once rather than re-opening it.

**What the TSPEC edit actually did.** Read in full, `git diff 4943a8777..HEAD --
docs/pdlc-stats/TSPEC-pdlc-stats.md` is +23/−3 and does one substantive thing: it corrects §2.1's
`coverageInstrumentation.test.js` row. That row had described P9-02's title as moving *six → seven*.
It now states the measured direction — the feature moves the set **seven → eight** — and adds that
the test title's word `six` and the adjacent comment's "three entries" phrasing are **already stale
at HEAD**, independent of this feature. The v1.7 changelog attributes the correction to `pm-review`,
`se-author` and `te-review` jointly, and the stale `six → seven` restatement in the v1.3 changelog
has its number removed so it cannot be misread as a live claim. No `BR-`, `E-` or `AC-` row moved,
no vocabulary renamed, no site added to or removed from §2.1's ten.

**This is the erratum I have routed upstream since v6.** F-01 in my v6, v7, v8 and v9 rounds was
exactly this divergence: DECISIONS' K-3 carries *seven → eight*, TSPEC §2.1 carried *six → seven*,
the arithmetic here is right and the repair is owed upstream. TSPEC v1.7 discharges it. **The
cascade moved upstream toward this document, not away from it.**

**What I re-measured mechanically rather than inheriting.** DECISIONS' load-bearing arithmetic is
now asserted by both documents, so I re-ran it against the repository rather than trusting either:

| Claim | How checked | Result at HEAD |
|---|---|---|
| `c8.include` holds seven entries | read `pdlc/workflows/package.json` | seven `**/`-anchored entries |
| `REQUIRED_INCLUDES` holds four | read `coverageInstrumentation.test.js` | four (`orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`, `scripts/check-wave-resume-delta-coverage.mjs`) |
| literal `4 + 1 + 2` = seven | derived | seven; feature makes it **eight** |
| §2.1's ten co-change sites unchanged | diffed the site table | no row added or removed |

I did **not** re-open `DEC-STATS-01`'s chosen option, `DEC-STATS-02`, `DEC-STATS-03`, the option
table, K-1 through K-9 on their merits, or the *Standing costs accepted* bullets. None changed, and
all were approved across v5–v9.

## Options Considered

_pending_

## Decision

_pending_

## Consequences

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
