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

**No dependency edge moved.** T-10's `Depends on` cell is still `T-01, T-02`, its batch is still `2`,
and its `Source File` is still `pdlc/engine/bin/cli.mjs`. The edit touched justification prose inside
the row's description cell only. Batch 2's composition, the serial chain through batches 3–7 and the
one-writer-per-batch rule that forces it are all untouched, so the phasing I approved at v6 stands.

**Upstream pins, re-measured at HEAD.** `DEC-ERR-03` makes this my duty regardless of the item list,
so I re-hashed all four upstream documents rather than trusting the changelog:

| Upstream | sha256 at HEAD | Matches dispatch pin? |
|---|---|---|
| REQ | `f75c348f…8862` | yes — identical to the dispatch's stated pin |
| FSPEC | `a493133f…7f5d` | yes |
| TSPEC | `f32d9cb5…7c02` | yes — v1.8, the value the v1.4 changelog claims |
| DECISIONS | `ca3f7219…b5cc` | yes |

The v1.4 changelog's account of the upstream move is therefore accurate: the dispatch had pinned an
older TSPEC (`7b119eb7…`), TSPEC is at `f32d9cb5…` (v1.8), and the other three match. I confirmed the
substance of that move too — TSPEC v1.8 absorbs the REQ-STATS-06-versus-BR-16 withdrawal that v1.3
had already re-grounded on. It introduces no new `BR-`, `E-` or `AC-` row and no vocabulary rename,
so no PLAN task inherits new work from it and no task's citation goes stale.

**Ordering against product priority is unchanged.** P0 work still precedes P2 work in the batch
graph, and no task was re-prioritised, deferred or dropped by this edit.

## Verification

Every claim I relied on was measured at HEAD. Recording the measurements so the next reviewer need
not repeat them.

| # | Claim under test | How measured | Result |
|---|---|---|---|
| 1 | The matcher yields zero matches over the whole source at HEAD | `/(?<![A-Za-z])statSync\s*\(/g` run over `pdlc/engine/bin/cli.mjs` in Node | **0 matches** — conjunct holds |
| 2 | The naive alternative would be unfalsifiable | `source.includes("statSync")` | **`true`** — so the row's warning is live, not theoretical |
| 3 | The token really does occur twice, as the row now says | line scan for `statSync` | exactly two occurrences: the doc-comment prose `` `lstatSync`, never `statSync` `` and the call `nodeFs.lstatSync(absPath).size` |
| 4 | `(?<![A-Za-z])` rejects the call site | inspection of the matched context | preceded by `l` — rejected, as stated |
| 5 | `\s*\(` rejects the comment | inspection of the comment | the token is followed by a backtick, not `(` — rejected, as stated |
| 6 | The v1.3 premise was genuinely false at HEAD | claims 3–5 | confirmed false; the erratum's own diagnosis is correct |
| 7 | T-17 has landed, as the changelog asserts | `git log main..HEAD` | `41aa0edba feat(pdlc-stats): T-17 — 🟢 bin/cli.mjs edits, all additive` |
| 8 | `statsIo()`'s shape still matches T-10's other conjuncts | read `statsIo()` in source | exactly `listDir`, `fileSize`, `readFile`, `exists` — no write capability, as the row requires |
| 9 | Upstream still says what T-10 cites | TSPEC §2.4, §3.1 interface comment, FSPEC EC-19 at HEAD | present and unchanged; `lstat().size — never follows a link` verbatim |
| 10 | The commit ledger substitutes for the `Status` column | `git log main..HEAD` | **18** `feat(pdlc-stats): T-NN` commits, each carrying its task id and marker |
| 11 | The new paragraph's "three `✅` ticks" count | tick census over the task tables | exactly three in task rows (T-01, T-08, T-16) — accurate today; see F-01 |

**No acceptance-criterion coverage changed.** The AC coverage table, the anti-drift table and the
Residual risks table are byte-identical to the version I approved at v6; the diff does not reach
them. Every P0 and P1 requirement that had a task before this edit still has the same task.

**Nothing previously approved is broken.** The delta is strictly additive prose plus the deletion of
one false sentence and one bad anchor. There is no site at which v1.4 says less than v1.3 about what
gets built.

## Delta-Confirmation Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
