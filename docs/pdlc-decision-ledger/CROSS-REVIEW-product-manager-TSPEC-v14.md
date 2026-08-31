# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v1.3)
**Date:** 2026-08-31
**Iteration:** 14 (delta confirmation)
**Upstream at dispatch:** REQ v1.10 `sha256:9bc8bc32…05f10d`, FSPEC v1.4 `sha256:48691453…a11256`, Baseline v1.2

## Overview

I approved this TSPEC at v13 (`Approved with minor changes`, `REVIEWED-COMMIT: 3a17387d6`). The delta
I measured for this confirmation is `3a17387d6..HEAD`, two commits:

- `df2b10154` — TSPEC v1.3, re-grounding the header pin on REQ v1.10 / FSPEC v1.4 and adding the v1.3
  changelog entry.
- `757922341` — the round's targeted erratum: three citations rewritten from `FSPEC v1.3's E-7` /
  `FSPEC v1.3's cases` to `FSPEC E-7`, in §4.1, §6.1's F-13 row and §7.6's AT-14 row. Three
  insertions, three deletions, nothing else.

**The routed item does not land here, and it is stale.** The dispatch routes "PLAN v0.7 contradicts
TSPEC §7.3's census pin in all six routed places (fifteen-member owned list, production home for
`DECISION_LEDGER_CENSUS_TOKENS`)" to PLAN's phase, not to this document — so this TSPEC correctly
makes no edit for it, and its non-landing is not a `delta` fault of these bytes. But I re-measured
`PLAN-pdlc-decision-ledger.md` at HEAD, as I did at v13, and the premise is false: PLAN is at
**v0.9**, and all six sites are corrected. That falsity is now restated inside this document's own
v1.3 changelog, which is delta bytes, and that is F-01 below. It is the same defect I raised as v13
F-01 against PLAN v0.8; PLAN has since advanced again and the entry has not.

**Upstream fidelity re-check (DEC-ERR-03).** I did not take the item list as the scope. I re-measured
both upstream documents at HEAD and re-read the text this TSPEC now leans on:

- `shasum -a 256` on both files returns exactly the dispatch digests — REQ `9bc8bc32…05f10d`, FSPEC
  `48691453…a11256`. The header's pin row reads REQ **v1.10** / FSPEC **v1.4** / Baseline **v1.2**,
  and the status rows in those files read 1.10 and 1.4. The pin is true at HEAD, not merely re-typed.
- FSPEC **E-7** is unmoved and is faithfully compressed. The clause this document now cites by id
  reads, at FSPEC:342, "**Either** bound resolves to `0` … Treated as zero in-scope decisions —
  E-6's outcome, for both keys. **Not an error**, not a fallback to the default, not a halt", with
  the `maxBytes` axis also reachable by E-8 then E-6. §4.1's admits-nothing sentence and §6.1's F-13
  row restate that, both directions, without narrowing it.
- No acceptance criterion moved, no product decision was re-opened, and none of the four corpus
  literals (6,305 / 10,859 / 12,059 / 441) was touched.

**Bottom line.** The delta does what it says and breaks nothing I previously approved — decoupling a
citation from a version numeral is strictly an improvement in staleness resistance, and it is the
right lesson to apply. It does not resolve the routed item, correctly, because that item is PLAN's;
but the changelog paragraph that explains the non-landing asserts something false about PLAN at
HEAD. Four findings, no High: two Medium and two Low, of which one Medium and one Low are inherited
from v13 and untouched here.

## Architecture

**The citation-decoupling edit is the right shape, and I want to say so before the finding.** The
defect the round set out to fix is that a downstream citation naming an upstream *version numeral*
goes stale the moment upstream advances, even when the cited clause never moved. That is exactly
what happened: E-7's content is byte-unmoved between FSPEC v1.3 and v1.4, but three sentences in
this document said `FSPEC v1.3's E-7`, so a reader at HEAD could not tell whether the citation was
stale-and-wrong or stale-and-harmless without re-deriving it. Citing by spec id — `FSPEC E-7` —
makes the pointer version-independent, and leaves the header's pin row as the single place a version
is asserted. This is the same discipline PLAN adopted in its own v0.8 round ("in-body citations now
read `TSPEC §7.3` without a version label; the version pin lives in the header row alone"), so the
two documents now converge on one citation convention rather than two. Nothing about the change
touches a requirement.

**Scope of the edit is genuinely as declared.** The v1.3 entry says the sections touched are "the
header, §4.1, §6.1's F-13 row, §7.6's AT-14 row and this changelog, nothing else". I diffed against
that claim rather than trusting it: `757922341` touches exactly three lines, at §4.1, §6.1 F-13 and
§7.6 AT-14; `df2b10154` moves the header pin and adds the changelog entry. No AT row was added or
removed, no traceability row moved, no BR/E/AC mapping changed. The claim holds.

**But the id-decoupling narrowed one citation while widening the other two, and that is not
uniform.** §4.1 and §6.1's F-13 row both discuss the proposition "either bound resolves to `0`",
which is precisely and only E-7's antecedent — for those two sites, `FSPEC v1.3's E-7` → `FSPEC E-7`
drops a stale numeral and keeps the id set exactly right. §7.6's AT-14 row is different: it discusses
**three** cases, and the old text `FSPEC v1.3's cases` referred to them at document scope, without
committing to an id. Rewriting that to `FSPEC E-7's cases` did not just drop the numeral — it
asserted an id set, and asserted one that is too small. FSPEC's own AT-14 (FSPEC:484–491) enumerates
the three cases and cites `E-6, E-7`; the zero-decision-set case is E-6's, not E-7's. That is F-02
below: Low, because the behavioural assertion the row makes is unchanged and still faithful, and no
count, contract or acceptance criterion moves — only the pointer is short by one id.

**Nothing in the delta re-opens a decision or re-litigates scope.** The DECISION FREEZE I noted at
v13 remains respected: no rejected alternative is revived, no new product decision appears in the
engineering artifact, and the v1.3 entry correctly declines to fix another document's contract from
here. Declining is the right call; only its stated reason has gone stale.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
