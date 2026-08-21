# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 5 (delta re-review of the v0.3 revision answering my v4 findings)

**UPSTREAM-STATE at this review:** REQ `sha256:ff605dd373de…` · FSPEC `sha256:ae75fa6291f1…` (v0.13)
· TSPEC `sha256:22dee8ce1c9b…` (v0.9) · PLAN `sha256:4510f9c3f12b…` (v0.5) · DECISIONS
`sha256:56617f5ab31a…` · PROPERTIES under review `sha256:6d74d3eb5a23…` (**v0.3**), branch
`feat-pdlc-learnings-injection` at `1533cf38`.

## Overview

**Question answered.** My v4 recorded one High, one Medium and two Lows against PROPERTIES v0.2 and
recommended Needs revision on a single narrow item: the document had excluded `maxBytes = 0` from
`PROP-BOUND-03` and §O.9's generated domain, against TSPEC v0.9's T-O-6 instruction, and then
recorded the obligation as discharged anyway. This round the bytes moved to **v0.3** — seven commits
(`64a9940b` … `48fd5ba5`), **73 insertions / 38 deletions**
(`git diff 0fb3380e..HEAD -- …PROPERTIES-…md`). The question is whether all four findings are closed
and whether the revision broke anything.

**All four are closed, and the High is closed exactly as upstream asked rather than as I asked.**

1. **F-01 (High) → closed.** `PROP-BOUND-03` is now *"stated over every non-negative
   `maxBytesPerDocument`, zero included"*, and the carve-out is written as a **positive** four-field
   conjunct: at `maxBytes <= 0` the unit *"**must** return `{material: "", bounded: false, bytes: 0,
   sections: []}` for every `text`, including one carrying all five priority sections"*. That is a
   verbatim transcription of TSPEC §I.3's JSDoc contract (`TSPEC-…md:579-581`: *"`maxBytes <= 0`
   short-circuits BEFORE the cut and returns `{material: "", bounded: false, bytes: 0, sections: []}`
   for every `text`"*) and of T-O-6's instruction (`TSPEC-…md:1511`: *"**The bound domain includes
   `0`, and the property must state its carve-out**  … State the zero conjunct, keep `0` in the
   domain"*). §O.9's generator domain is restored to *"every non-negative `maxBytes`, `0` included"*.
   The grep that failed at v4 now passes: `grep -c 'bounded: false'` returns **2**, at
   `PROPERTIES-…md:241` (the property) and `:1118` (§G.1's T-O-6 row).
2. **F-02 (Medium) → closed, and closed better than the fix I proposed.** I predicted that with F-01
   applied, §G.3's *"Still open: nothing"* would simply become true. The author checked instead of
   assuming, and found the sentence was untrue for a *different* reason: an AT-15 bullet sat orphaned
   **below** it, stranded when the v0.2 revision struck the two items TSPEC v0.9 had answered. §G.3
   now reads *"**Still open — one item, re-routed this round**"*, names the bullet, and says plainly
   what happened: *"The v0.2 revision struck the two items TSPEC v0.9 answered and wrote 'Still open:
   nothing' above this bullet, which left it orphaned and the sentence untrue."* Finding a second,
   real defect while closing the first is the outcome I want from a revision round.
3. **F-03 (Low, Process) → no document edit required**, as stated; carried to harvest below.
4. **F-04 (Low) → closed.** §C.4 now separates the two subjects: *"Seven of the fourteen **files**
   have landed. The **tasks** committed so far are LI-01…LI-04, LI-07, LI-08, LI-09 and LI-13 — eight
   ids against seven rows, because LI-04 owns none of the fourteen: its artifact is the
   `/.baseline-worktree/` ignore rule."* Verified: `git ls-files pdlc/workflows/__tests__ | grep -i
   learn` returns exactly **7** files, and `.gitignore:13` carries `/.baseline-worktree/`.

**What the revision broke.** Nothing that gates. The delta touched six passages, and I re-derived each
against repository state: `PROP-BOUND-03`, `PROP-BOUND-05`'s oracle, §O.5's L3 table, §O.9, §C.4, and
§G.1/§G.2/§G.3. Two small things did not survive that check — a routing claim in §C.4 whose erratum
never reaches §G.3's routed list (F-01 below, Medium), and four citations that place T-O-6 in the
wrong TSPEC section (F-02, Low). Neither touches a property's content, an AC's coverage, the AT
partition or the PLAN task map.

**Answer in one line.** The one High is closed against upstream's own words rather than paraphrased,
the Medium turned up a defect I had missed, and what remains are two record-keeping items that cost a
sentence each — **Approved with minor changes**.

**Method.** Read my v4; took `git diff 0fb3380e..HEAD` on PROPERTIES (111 changed lines); verified every
changed claim against repository state rather than upstream prose alone — `TSPEC` §I.3 (`:570-590`),
T-O-6 (`:1511`), §T.5's suite table (`:1200-1218`) and AT-11 oracle table (`:1247-1262`); `FSPEC`
AT-11 (`:855-863`) and AT-15 (`:882-887`); `PLAN` LI-07 (`:146`), LI-08 (`:147`) and P-A-7 (`:558`);
`git ls-files pdlc/workflows/__tests__`; `wc -c` on the landed block suite. Unchanged sections I
approved at v1/v2/v4 are not re-litigated.

## Properties

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
