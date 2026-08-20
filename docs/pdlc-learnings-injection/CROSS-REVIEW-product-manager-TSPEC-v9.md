# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 9
**Round type:** upstream-cascade confirmation (FSPEC v0.9 → v0.10)

## Overview

**One question, one answer.** The TSPEC has not moved: `sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3`,
byte-identical to the `APPROVAL-HASH` recorded in `CROSS-REVIEW-product-manager-TSPEC-v8.md` and in
v7 before it; `git log ccc739d1..HEAD -- TSPEC-pdlc-learnings-injection.md` is empty. What moved is
FSPEC, from `sha256:764414d0…` (the `UPSTREAM-STATE` I recorded at v8) to `sha256:a4f775bd…` at
HEAD, via a single commit `9a4b7593` — "FSPEC v0.10 erratum — correct Cross-Reviews row through
v11". REQ is `sha256:ff605dd3…`, byte-identical to v7 and v8: unmoved.

**The delta, in full.** +8/−2 lines, all inside the FSPEC header block:

1. `| Cross-Reviews | …FSPEC-v{1,2,3,4,5,6,7,8,9}.md |` → `…v{1,2,3,4,5,6,7,8,9,10,11}.md`.
2. `| pdlc | Draft | Claude | 0.9 | 2026-08-19 |` → version `0.10`.
3. A new six-line `v0.10 erratum (header only)` revision-history blockquote recording (1) and
   stating "Upstream re-read at HEAD (REQ v0.9, unchanged); no upstream decision to absorb …
   Header correction only; no behavioural change."

No requirement, business rule (`BR-*`), edge case (`E-*`), acceptance test (`AT-*`), notice id
(`NTC-*`), config-state row, or AC→BR→AT traceability row was touched. I verified this by content
rather than by trusting the commit message: `git diff 523e2df9..HEAD -- FSPEC` restricted to lines
matching `BR-|AT-|E-[0-9]|AC-|NTC-` returns nothing.

**Answer: yes, the TSPEC still holds as approved.** This is the cheapest class of upstream cascade —
the upstream document corrected a statement *about its own review history*, not a statement about
the product. The TSPEC is a compression of FSPEC's behavioural content, and none of that content
changed. One consequence of the edit does reach the TSPEC, and it is a Low: the TSPEC's header
pins its upstream as `FSPEC … (v0.9)`, which is no longer the version at HEAD (F-01 below).

It is worth recording that this erratum is the direct discharge of **Q-02 in my v8 review**, where I
observed that FSPEC's Cross-Reviews row enumerated v{1…9} although v10/v11 existed for both
reviewers, and routed it as an ERRATUM rather than folding it into that verdict. The routing worked:
the item was raised as a question, landed as a header erratum, and cascaded back for confirmation
without ever touching behaviour.

## Architecture

**What the TSPEC leans on upstream, and whether upstream still says it.** I re-read the FSPEC
sections this TSPEC compresses, at `sha256:a4f775bd…`, and checked each against the TSPEC's
transcription — not against the item list, and not against my memory of v0.9.

| TSPEC claim | Upstream locus at HEAD | Still says it? |
|---|---|---|
| Feature ships **on**; an absent `learningsInjection` section is enabled-by-default, not disabled (§I.2 config table, `TSPEC:439`) | FSPEC BR-14 and the config-state table; REQ v0.9 §4.1, G-1, AC-1.1 | Yes — unchanged bytes |
| Explicit `enabled: false` removes the report key; `present` is the report-shape predicate (`TSPEC:441-448`, `:552`) | FSPEC E-21 → AT-32; REQ AC-5.1a | Yes |
| Malformed section fails open with `NTC-MALFORMED`; wrong-typed key fails open with `NTC-KEYTYPE` (§I.2) | FSPEC E-22 → AT-31, E-23/E-34 → AT-32; REQ AC-5.1b, AC-5.1c | Yes |
| Four config states own exactly two ATs — AT-31 and AT-32 (`TSPEC:464-469`) | FSPEC E-21…E-34 mapping rows | Yes — the row block is byte-identical across the delta |
| Ordering keys and corpus outcomes are **per dispatch**, at the two loci AC-3.3 names (§A.5, §D.1, §D.2) | FSPEC v0.9 BR-9/BR-10, AT-19…AT-22, AT-18's changing-corpus run | Yes |
| Two completeness tests, one per locus; AT-22 rides AT-18's changing-corpus fixture (`TSPEC:943`) | FSPEC AT-20/AT-22 text | Yes |

Every load-bearing compression survives. The one place the TSPEC now diverges from upstream-at-HEAD
is bibliographic: its Upstream row (`TSPEC:11`) pins `FSPEC-pdlc-learnings-injection.md (v0.9)`, and
the in-body citations at `TSPEC:326`, `:469`, `:943`, `:1275`, `:1295` read "FSPEC v0.9 BR-9/BR-10",
"FSPEC v0.9's E-21…E-34", "FSPEC v0.9 AT-18's changing-corpus …". The referents are all still
present and unchanged in FSPEC v0.10 — the version label is stale, the content pointer is not. That
is a Low, and it is genuinely `delta`: this round's edit is what made those labels stale.

I deliberately did **not** treat the version-label staleness as gating. A downstream document that
cites upstream by spec id survives an upstream header bump by design; that survival is the property
the citation discipline exists to buy, and it is the same property I praised at v8 when the +7/−4
line shift in FSPEC v0.9 broke nothing. Demanding a TSPEC rewrite for every upstream patch-version
bump would invert that: it would make the cheap edit expensive and punish the author for upstream's
housekeeping.

## Interfaces

**Product-facing surfaces, re-checked against upstream at HEAD.** The interfaces this feature
exposes to a user are: the `learningsInjection` config section, the advisory block injected into an
authoring dispatch, the run-report key, and the notice catalogue. The FSPEC delta touched none of
their definitions, so the TSPEC's transcription of each is unchanged in status:

- **Config section.** Absent → enabled (G-1, AC-1.1). Explicit `enabled: false` → key absent from
  the report (AC-5.1a). Malformed section → fail open + `NTC-MALFORMED` (AC-5.1b). Wrong-typed key
  → fail open + `NTC-KEYTYPE` (AC-5.1c). All four still stated identically in FSPEC v0.10.
- **Advisory block.** Eligibility, ordering, and bound are still FSPEC BR-9/BR-10's; the TSPEC still
  transcribes rather than re-decides them (`TSPEC:326` says so explicitly, and that self-description
  remains accurate).
- **Run report.** `present`-shaped, per dispatch, with the run-level mirror optional (§D.1/§D.2).
  Upstream still permits either shape — see Q-01, carried.
- **Notices.** `NTC-MALFORMED` / `NTC-KEYTYPE` ids unchanged in FSPEC's catalogue.

**Cross-Reviews row, the thing the erratum actually fixed.** FSPEC's row now runs through v11, and
both `CROSS-REVIEW-software-engineer-FSPEC-v10/v11.md` and `CROSS-REVIEW-test-engineer-FSPEC-v10/v11.md`
exist on this branch — so the row is now accurate. That closes my v8 Q-02 cleanly.

**A symmetric defect now exists downstream, and it is inherited, not new.** The TSPEC's own
Cross-Reviews row (`TSPEC:13`) enumerates product-manager and test-engineer TSPEC cross-reviews
v1…v6, while v7 and v8 exist on this branch for both reviewers (and this file will make v9). This is
exactly the defect FSPEC just corrected in itself, one document downstream. It was already present
in the bytes I approved at v7 and v8 — I raised its FSPEC twin at v8 but did not check the TSPEC's
own row, which is my miss, not the author's regression. It is non-behavioural, it does not affect a
single acceptance criterion, and it is `inherited`: Low, and explicitly non-gating (F-02 below).

That the same header row went stale in two documents in the same feature, and was caught by
different rounds weeks apart, is `Process`-scope signal rather than a product defect: the
Cross-Reviews row is hand-maintained and drifts every time a review round lands, which is precisely
the shape of thing a mechanical check should own instead of a reviewer's attention.

## Data Model

## Test Strategy

## Open Questions

## Findings

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
