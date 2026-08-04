# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** Testing lens — are the re-evaluation triggers observable, does any decision foreclose a testing approach PROPERTIES will need, and is the stated reversibility consistent with how the design is actually testable.

## Verification performed

I re-read every `file:line` this document cites rather than trusting the grounding pin. **All of them
verify.** This is unusually good and it is worth recording, because the findings below are about what
the document says *around* those citations, never about the citations themselves.

| Claim in DECISIONS | Verified how | Result |
|---|---|---|
| 5 dev halts (`dev:7635/7650/7673/7695/8498`), 1 queue halt (`queue:1012`), 2 queue blocks (`queue:794/847`) | `grep -n 'outcome: "halted"\|"blocked"'` over both modules | exact, no extras |
| Line counts 8,642 / 1,587 / 383 | `wc -l` | exact |
| `MODEL_DEFAULT` `dev:1578`, `MODEL_IMPLEMENTATION` `dev:1621`, `MODEL_QUEUE` `queue:69` | `grep -n` | exact |
| `parseMergeConfig:101`, `parseImplementationConfig:181`, `classifyPrState:380`, `effectiveGuardPaths:708`, `guardVerdict:731`, `decideMerge:835`, `phaseMerge:1361`, `gitWithLockRetry:6862`, `commitPaths:6905`, `buildFinalReport:8595` | `sed -n` at each line | exact |
| `DOD_MAX_ITERATIONS = 3` at `dev:25`, used `dev:6275` | `sed -n` | exact |
| Harvest `dev:8307` precedes Phase PUB `dev:8363` (DEC-ADV-07's load-bearing ordering fact) | `sed -n` on both banners | exact — the rejection of "re-verify DoD in PUB" stands |
| `commitPaths` / `gitWithLockRetry` are module-private | `grep -n 'export async function commitPaths'` ⇒ no match | **confirmed private** — DEC-ADV-03's erratum is real |
| `guardVerdict` semantics: `startsWith`, case-sensitive, position-0, `/`-delimited, no globbing, fail-closed on `ok !== true` | read `dev:706-740` | exact, all four properties present |
| `MERGE_GUARD_DEFAULTS` frozen at `dev:47-52`; `mergeMode: "off"` `dev:60`; skip at `dev:1407` | `sed -n` | exact |
| Both bundles inline `devModule` **and** `queueModule`; ordering-hazard comment at `build:285-287`; 3 rows from the `bundles` array | read `build:278-297` | exact |
| `AWAIT_SCAN_SOURCES` is a hand-written 2-element literal at `bundleTest:997`, driven at `:1011` | `grep -n` | exact |
| `advertisedVersionViolation` at `document-oracles.mjs:575`; plugin at `0.20.2` | `sed -n`, `grep -n` | exact |
| D-6 pin: `26c3f1c` ancestor of HEAD; `4d5e4dc` ancestor of `26c3f1c`; `raisePrAndVerifyCi` at `26c3f1c:6222` (4 hits); 8,527 lines at `26c3f1c` | `git merge-base --is-ancestor`, `git show`, `git grep -c` | all four exact |
| DC-01 / DC-03 / DC-04 / DC-08, DEC-DIST-01 / DEC-DIST-02 | read the cited headings in `docs/_constraints/DOMAIN-CONSTRAINTS.md` and `docs/_decisions/DECISIONS-plugin-distribution.md` | all exist and say what is claimed |

Two cost claims were re-derived rather than accepted:

- **The fourth-build-source cost (DEC-ADV-01).** Confirmed against the files it would touch:
  `build.mjs` would need one `readFileSync` (precedent `cliSource`, `build:256`), one `wrapModule`
  call, prelude additions to **both** existing calls (`build:87-95`, `build:96-103`), and two
  `contents`-array insertions (`build:281`, `build:288`). The document's "roughly a dozen lines, not
  two" is honest, and its refusal to inflate the cost ("Rejected on that balance, not on an inflated
  cost") is correct.
- **The manifest claim.** Confirmed the document is right and TSPEC §16.1 is wrong: rows are per
  artifact from the `bundles` array (`build:278-297`), so a fourth *source* adds no row. Routed as an
  erratum below.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
