# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.2, erratum round 3)
**Date:** 2026-08-31
**Iteration:** 4 (delta confirmation)

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v3 (`Approved with minor
changes`, 0 High / 3 Medium / 1 Low) against the bytes at `66c4049ac`. Erratum round 3 has since
landed as six commits (`70c85c2fa` … `8750032f6`), touching §2.1, §4.3, §6.1, §6.4, §7, §7.3, §8.3,
§8.4 and RK-1 — 124 insertions, 60 deletions. I read the diff, not the document.

**Upstream is where the dispatch says it is.** I re-derived both hashes before reading anything:

| Upstream | Hash at HEAD | Dispatch hash | Match |
|---|---|---|---|
| `REQ-pdlc-stats.md` | `60a516fb…8f1c9` | `60a516fb…8f1c9` | yes |
| `FSPEC-pdlc-stats.md` | `0b8864d6…17b0` | `0b8864d6…17b0` | yes |

So the faithfulness question (DEC-ERR-03) is asked against exactly the REQ v1.4 / FSPEC v1.4 text the
orchestrator pinned, and I re-read the upstream clauses this document newly leans on rather than
trusting the round's own summary of them.

**Answer to the question asked: yes.** All seven routed items landed, and they landed *more*
completely than routed — items 3 and 4 were routed as "add `loop-distribution.test.js` as the sixth
site", and the author instead re-derived the whole set by sweep and found **nine**, which subsumes
the narrower correction rather than patching around it. Nothing I previously approved is broken: no
branch table, type, oracle, traceability row or specified behaviour changed. The four findings I
raised at v3 are all resolved (§4.3's BR-11 and BR-16 paragraphs re-grounded on FSPEC v1.4, §8.3's
three settled bullets deleted, AT-12/AT-17 cited as FSPEC-owned fixtures).

One **Low** finding, on a methodology claim introduced by this round. It is not gating and does not
need a round; it can ride the next edit this document takes for any reason.

### How I checked

Item-landing is necessary, not sufficient, so I verified the *substance* of each claim rather than
its presence:

- Re-read FSPEC BR-11, BR-16, BR-25, AT-12, AT-17 and §7.3, and REQ-STATS-04/06, at HEAD.
- Ran the sweep query §2.1 now specifies (`git grep -l "lib/loop-session.mjs"` over tracked
  non-`docs/` sources) and checked all nine named sites appear in its output.
- Opened each of the four newly-named test files and confirmed the symbol, the assertion form and
  the failure mode §2.1 attributes to it.
- Confirmed `DEC-STATS-01` `K-7` exists and owns the sibling-feature amendment, and that the sibling
  documents currently say the "five" the edit corrects to six.

## Architecture

§2.1 is where five of the seven routed items landed. It is now correct, and materially more honest
about cost than the version I approved.

**The count is right, and I checked it rather than counting the table.** The set is nine in-repo
sites plus two sibling-feature document edits. The internal breakdown the round introduces —
*five enumerations, holding six symbols across five files, plus four test files that pin those
enumerations* — reconciles exactly: `prepack.mjs`/`MODULE_NAMES`, `publish-preflight.mjs`/
`WORKFLOW_MEMBERS`, `fixture-machine.mjs`/`WORKFLOW_MODULE_NAMES`, `package.json`/`c8.include` are
one symbol each, `_tspec-packed-set.mjs` holds two (`WORKFLOW_MEMBERS` and `tspecPackedCount`) — 6
symbols, 5 files — and `loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`,
`learningsPremises.test.js` are the four pins. 5 + 4 = 9.

This retires the specific defect item 6 named: the old text held **two different sets of five** (§2.1
counted vendoring symbols, §7.3 counted co-change table rows including the non-vendoring
`c8.include`, and collapsed `_tspec-packed-set.mjs`'s two symbols into one). Both are now stated in
the same vocabulary, and I swept the document for stale counts — the only surviving "five"s are in
the changelog describing the correction and in §7's accurate breakdown. No stale count remains.

**Each of the four new test-file rows is accurate.** I opened all four; this is the part of a
co-change claim most likely to be aspirational, and it is not:

| Site | §2.1's claim | Verified |
|---|---|---|
| `loop-distribution.test.js` | `NEW_LIB_MEMBERS_BARE`, `NEW_LIB_MEMBERS_VENDORED`, three baselines, `assertAdditiveOnly` length equality | all present (lines 49–66); `assertAdditiveOnly` does assert length equality |
| `learningsPremises.test.js` | P-1's parsed `MODULE_NAMES` array-equality, "exactly four workflow modules" in the title | present; `toEqual` over the regex-parsed list, and the title does carry the stale-able word "four" |
| `run.test.js` | three `deepEqual` manifest-membership literals plus a process-entry `prepack` leg | present |
| `coverageInstrumentation.test.js` | P9-02 pins the `c8.include` literal; `toEqual`, so position matters | present |

**The sibling-feature rows are a scope decision, and they are properly owned.** Amending a
*completed, approved, frozen* feature's artifacts is exactly the kind of move that should not be
made inside an engineering document on its own authority — so I checked the authority. `DEC-STATS-01`
`K-7` exists and owns it, the TSPEC cites rather than restates it (correctly invoking
`pdlc-engineering-loop`'s verbatim-restatement lesson), and the pattern is precedented: the sibling
TSPEC's own 0.15 changelog row records `pdlc-engineering-loop` making the identical amendment and
frames it as "not a re-opening of this completed feature — a spec-first edit … that its own §5.4
obligates for any `PK-*` addition". The edit described is also factually right: the sibling TSPEC
§5.4 and FSPEC §5.2 both currently say **five**, so `5 → 6` plus `PK-26` is the correct delta. This
is a scope expansion made visible and traceable, which is the outcome I want — the previous version
hid two real document edits behind a five-row table.

**Option B's row (item 5) is fixed and is the sharper claim.** "`lib/` class grows 15 → 16" now
names that the class is held **twice**, the second copy being `publish-preflight.mjs`'s
production-side `LIB_MODULES_AT_HEAD` / `LIB_MODULES_FROM_THIS_FEATURE` pair (12 + 3). That matters
for the product decision the table exists to support: B was rejected partly on co-change cost, and
understating B's cost while overstating precision would have made the rejection look better-founded
than it was. Correcting it *against* the chosen option's interest is the right instinct.

## Interfaces

_pending_

## Data Model

_pending_

## Test Strategy

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
