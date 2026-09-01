# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.4)
**Previous review:** `docs/pdlc-stats/CROSS-REVIEW-product-manager-PLAN-v6.md`
**Date:** 2026-08-31
**Iteration:** 7
**Round type:** Delta confirmation (erratum round)

## Overview

**Round type and bar.** This is a delta confirmation on an erratum edit, not a re-read. I previously
approved this PLAN at v6. One item was routed to this round:

> T-10's premise "HEAD's `bin/cli.mjs` contains neither `statSync` nor `lstatSync` anywhere" is false
> at HEAD; the whole-file zero-match assertion now needs comment/string-masked source stated
> normatively, not raw source. (raised by te-author)

The single question I answer is whether the delta resolves that without breaking anything previously
approved — and, per `DEC-ERR-03`, whether the PLAN is still a faithful compression of its upstream
**at HEAD**, which is a duty independent of the item list.

**What moved.** `e6f18c5a1..HEAD`, two commits, a **9-line diff (7 insertions, 2 deletions)** over
exactly four sites: the version row `1.3` → `1.4`; a new v1.4 changelog paragraph; a new paragraph
under `## Batches`'s status key declaring the `Status` column unmaintained; and T-10's row, whose
seam-conjunct justification is re-grounded on post-T-17 HEAD. **No conjunct, task, batch, dependency
or acceptance-criterion mapping changed.** The scope of the edit is justification prose only.

**Method.** I measured every load-bearing claim rather than reading the changelog's account of it: I
ran the matcher itself over `pdlc/engine/bin/cli.mjs` at HEAD in Node, read `statsIo()` in source,
re-hashed all four upstream documents, and re-read the upstream clauses T-10 cites. Details are in
**Verification**; nothing below rests on the document's own testimony about the repository.

**Outcome.** The routed item is resolved, and resolved on a disposition I judge more faithful than
the one the item proposed — see **Batches**. Upstream at HEAD still says what the PLAN says it says.
One **Low** finding, non-gating, on a count word the new paragraph introduces.

## Batches

Two sites under `## Batches` changed. Neither adds, removes or re-scopes a task.

### T-10 — the seam-boundary conjunct, re-grounded (routed item)

**The premise was indeed false, and the PLAN now says so itself.** v1.3's row justified dropping any
"in the `stats` seam" qualifier by asserting the file "contains neither `statSync` nor `lstatSync`
anywhere", pinned to a raw `pdlc/engine/bin/cli.mjs:262` anchor. At HEAD both halves fail: T-17
(`41aa0edba`) landed `statsIo()`, so the file carries `nodeFs.lstatSync(absPath).size` and a bare
`statSync` in the doc comment above it — and the raw anchor was a `DEC-DOC-01` misuse besides. The
v1.4 row states the expiry plainly rather than quietly deleting the sentence, which is the honest
form: a reader of v1.3 who believed that premise is told it was true only of a pre-T-17 baseline.

**The disposition differs from what the item proposed, and I judge the difference correct.** The
routed item asked for the whole-file assertion to be stated normatively over *comment/string-masked*
source. v1.4 instead argues that masking is **not owed**, because the matcher's falsifiability rests
on its two anchors rather than on the file being free of the token:

- `(?<![A-Za-z])` rejects the call site — the token there is preceded by `l` in `lstatSync`;
- `\s*\(` rejects the comment occurrence — it is prose, not a call.

I did not take this on the document's word. I ran `/(?<![A-Za-z])statSync\s*\(/g` over
`pdlc/engine/bin/cli.mjs` at HEAD: **zero matches**, while `source.includes("statSync")` is `true`.
So the conjunct still reds only on a real regression to a dereferencing `statSync(` call, and the
naive-substring alternative the row warns against would still be unfalsifiable. Masking would add a
source-transformation step to the oracle without changing a single verdict it returns — declining it
keeps the test simpler and is the disposition I would have argued for. The item is satisfied: what it
asked for substantively was that the assertion stop resting on an expired baseline and start resting
on something normative, and it now rests on the two anchors, stated as such.

**Product-lens traceability is intact.** The conjunct still cites TSPEC §2.4/§3.1
(`lstat().size — never follows a link`), and both clauses are present at HEAD verbatim — §2.4 is
still titled "`lstat`, not `stat` — and why the choice is load-bearing", §3.1's interface comment is
unchanged, and the user-visible reason for the choice (FSPEC EC-19: a symlink contributes the size of
the link, so a link into a large document cannot inflate one side of the ratio) is unchanged. T-10
therefore still serves the same acceptance criterion, by the same mechanism, for the same reason.

**Citation hygiene improved.** The re-grounded row carries no raw `file:line` anchor at all: it
identifies its evidence by symbol (`statsIo()`, `fileSize`) and by verbatim quotation
(`nodeFs.lstatSync(absPath).size`). That is the `DEC-DOC-01` form, and it removes the off-by-five
anchor v1.3 shipped.

### `Status` column — declared a planning-time ledger

The second edit declares the `Status` column **not maintained during implementation**, names the
branch's `feat(pdlc-stats): T-NN` commits as the authoritative record, and states that a `⬚` is not a
claim that the task has not landed. This directly answers the Low finding I raised in v6 (the ledger
"reads unevenly" because substantial implementation had already landed) — and it answers it the
durable way rather than by a hand-sync that goes stale on the next commit.

I checked the substitute record is real and sufficient before accepting it: `main..HEAD` carries
**18** `feat(pdlc-stats): T-NN` commits, each naming its task id and its red/green marker
(`T-13 — 🟢 computeFeatureStats…`, `T-17 — 🟢 bin/cli.mjs edits…`). A DoD reviewer pointed at that log
gets strictly more than the column would have given them. No upstream document requires this PLAN to
maintain a status ledger, so nothing is dropped by the declaration.

## Dependencies

_pending_

## Verification

_pending_

## Delta-Confirmation Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
