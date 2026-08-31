# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.3, erratum round 4)
**Date:** 2026-08-31
**Iteration:** 5 (delta confirmation)

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v4 (`Approved with minor
changes`, 0 High / 0 Medium / 1 Low) against the bytes at `11bb63b4e`. Erratum round 4 has since
landed as four commits (`80c484acc`, `1aa4c8477`, `c8345f050`, `e952268bd`) — 73 insertions, 26
deletions, touching §2.1, §6.4, §7.3, RK-1 and the changelog/version row. I read the diff, not the
document.

**Upstream is where the round says it is.** I re-derived both blob hashes at HEAD before reading the
delta:

| Upstream | Blob hash at HEAD | Version row |
|---|---|---|
| `REQ-pdlc-stats.md` | `377564fd…774b` | Draft, pm-author, **1.4** |
| `FSPEC-pdlc-stats.md` | `f507ca93…22fa` | Draft, pm-author, **1.4** |

I also confirmed mechanically that neither upstream moved during the round: `git log
11bb63b4e..HEAD -- REQ FSPEC` is empty. So v1.3's claim that "both [are] unchanged since v1.2's
grounding, so no upstream decision is absorbed this round" is true as written, and the DEC-ERR-03
faithfulness question is asked against the same REQ v1.4 / FSPEC v1.4 text I confirmed at v4.

**Answer to the question asked: yes.** Both routed items landed, and both landed in the stronger of
the two available forms — item (a) was routed as a *wording* fix ("say the sweep produced the
candidate set and name the filter") and the author instead made the derivation **re-runnable**, which
is what my finding was actually protecting. Nothing I previously approved is broken: no behavioural
claim, type, signature, code sketch, traceability row or acceptance-criterion reading changed. The
one finding below is a Low quote-fidelity nit that predates this round and does not gate it.

## Delta-Confirmation Findings

### Item (a) — §2.1 sweep-derivation claim (mine, v4 F-01): landed, and verified by re-running it

The claim is no longer an assertion I have to trust. §2.1 now states both halves — the sweep and the
filter — and I reproduced each:

| Half | What §2.1 claims | What I measured at HEAD |
|---|---|---|
| Sweep | `git grep -l` for `lib/loop-session.mjs`, repo-scoped, restricted to sources (excluding `docs/`) → **24** candidates | 44 tracked files total; 24 outside `docs/` — exact match |
| Filter | drop the **14** that merely consume a member: `bin/cli.mjs`, `orchestrate-dev.js`, `orchestrate-queue.js`, `dist/pdlc-cli.mjs`, and ten `loop*`/`loopSession*` test files | those 14 are exactly the sweep output minus the ten named sites; the ten test files are `loop-cli`, `loopCalibrationIsolation`, `loopEntryVocabulary`, `loopProperties`, `loopQueueDriver`, `loopSessionConfig`, `loopSessionDirective`, `loopSessionPreflight`, `loopSessionReport`, `loopSessionState` |
| Arithmetic | 24 − 14 = 10 | holds; the ten rows in §2.1's table are exactly the 24 minus those 14 |

That is the product point behind the finding: RK-1's residue argument and `DEC-STATS-03`'s
re-evaluation trigger both rest on the co-change set being *exhaustive*, and exhaustiveness is now
falsifiable by a reader with a shell rather than by trusting the paragraph. The stated filter
("enumerates the class, or pins its size or membership" vs. "merely consumes a member"), plus the
one-sentence justification for it ("a consumer needs no edit when a *new* member is added; an
enumerator does"), is a sound and checkable rule, not a restatement of the answer.

The set also **grew** under the re-derivation — `pdlc/README.md` joins as the tenth site. I checked
that this is a real site and not padding: `pdlc/README.md:231` carries the sentence quoted verbatim
in the new row, `MODULE_NAMES` is genuinely four members and the packed `WORKFLOW_MEMBERS` genuinely
five, so §2.1's insistence that these are *different* classes (4 → 5 vs. 5 → 6) and "must not be
synchronised to each other" is correct and is the kind of trap worth naming. Nine → ten is propagated
consistently: §6.4's vendoring row, §7.3's cost paragraph, RK-1 and the rejected-alternative
re-evaluation trigger all read ten. RK-1 now carries the new site as an explicitly **un-oracled,
task-owned** residue item rather than implying coverage it does not have — the honest form.

### Item (b) — §2.1 `coverageInstrumentation.test.js` row (te-review): landed

The row now names the title edit, and the quoted title is verbatim against the shipped test:
`coverageInstrumentation.test.js:264` reads `P9-02: the include set is exactly the six modules the
feature owns, no more and no fewer`. The row states that the title carries no assertion and is
corrected for parity with the `learningsPremises.test.js` row — matching the routed item exactly. No
assertion, expectation or oracle changed.

### What I re-checked for damage, and found intact

§6.4's classifier-purity split (round item (e), not routed to me) touches an oracle I approved at v3,
so I checked it for product-lens damage: it does **not** weaken `DEC-STATS-03`'s detector, it narrows
non-aliasing to the three object-returning classifiers where it is meaningful and substitutes A-B-A
for `deriveDodRoundIndex`, and §6.4's prose states plainly what A-B-A does *not* falsify (a correct
memo). Stating a residual blind spot rather than overclaiming coverage is the behaviour I would ask
for. No requirement loses its detector.

### Findings

| ID | Severity | Provenance | Locality | Section anchor | Finding |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | inherited | local | §2.1, `learningsPremises.test.js` row | The row attributes to P-1 the title `"exactly four workflow modules"`, in quotation marks; the shipped title (`learningsPremises.test.js:78`) is `MODULE_NAMES is exactly the four canonical workflow modules`. The referenced test is unambiguous and no assertion is affected, but this row is now the parity standard the `coverageInstrumentation.test.js` row was corrected *against*, and an implementer grepping the quoted phrase during the co-change finds nothing. Quote it verbatim or drop the quotation marks. |

FINDING: Low | inherited | local | §2.1, `learningsPremises.test.js` row's P-1 title quote | The row quotes P-1's title as "exactly four workflow modules"; the shipped title at `learningsPremises.test.js:78` is "MODULE_NAMES is exactly the four canonical workflow modules". No assertion is affected and the test referenced is unambiguous, but this row is the parity standard the `coverageInstrumentation.test.js` row was corrected against this round, and a grep for the quoted phrase during the co-change returns nothing — quote it verbatim or drop the quotation marks.

## Positive Observations

- **The fix went past the finding, in the right direction.** My v4 finding asked for a wording
  change; the author delivered a reproducible derivation (24 candidates, one stated filter, 14
  dropped, `24 − 14 = 10`) and, in doing so, found a site the nine-count had missed. A correction
  that makes the underlying claim re-runnable is worth more than one that makes it better-hedged.
- **The new site is carried honestly.** `pdlc/README.md` is added *and* named in RK-1 as pinned by no
  oracle, with an owning task and an explicit "a documentation-drift oracle over it is out of scope
  here and is named as accepted residue instead of implied coverage". Naming un-covered residue is
  precisely how RK-1 stays a truthful risk row.
- **The two count-classes are kept apart deliberately.** `MODULE_NAMES` (copied, 4 → 5) versus the
  packed class (5 → 6) is called out as "different numbers [that] must not be synchronised to each
  other" — I verified both against source. That is the exact mistake an implementer would otherwise
  make while working a ten-row checklist.
- **Scope discipline held.** Four commits, one section per commit, and nothing outside the routed
  items plus the two sibling corrections they forced. No requirement, acceptance criterion or
  behavioural claim moved.

## Open Questions

None blocking. One note for the implementation phase rather than for this document:

| ID | Question |
|----|---------|
| Q-01 | The ten-site co-change is now enumerated precisely, but two of the ten (`pdlc/README.md`'s prose and the sibling TSPEC's `PK-26` existence row) are un-oracled by design and are held together only by `DEC-STATS-01` `K-7`'s single-owning-task convention. That is acceptable here; the durable question is whether PLAN makes those two edits visible as checklist items in the *same* task body rather than leaving them to the task's prose — a PLAN-phase concern, not a TSPEC gap. |

## Recommendation

**Approved with minor changes.**

Both routed items landed and both were verified against the code they describe, not merely read. The
upstream (REQ v1.4 / FSPEC v1.4) is unchanged at HEAD and I re-derived its hashes; the TSPEC's own
statement of that is accurate. Nothing previously approved was narrowed, broadened or dropped, and no
acceptance criterion changed meaning. Document remains faithful to this REQ/FSPEC.

The single Low finding (F-01) is inherited, non-gating, and can be folded into whatever the next
versioned edit is — or left, at the author's discretion. It does not warrant a round of its own.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:ad630797fddc3597611c64179f7f5c8332652ac113f3bbc5b88a861ca38d0cc0
APPROVAL-HASH-NORMALIZED: sha256:0ad7079996aed37d80888aa63b9602d6d83ef43bdd9917cfa602c52cd218f4dd
REVIEWED-COMMIT: e952268bd0a4e367fa8c1642d3b84ec2ded6f736
UPSTREAM-STATE: REQ sha256:60a516fb2ede925b2428dca1bc8e4e61587c52827ea55b9e4965ea57b9a8f1c9
UPSTREAM-STATE: FSPEC sha256:0b8864d624cad46274ccb98a80e5da2672370bead258311446f6b482918017b0
