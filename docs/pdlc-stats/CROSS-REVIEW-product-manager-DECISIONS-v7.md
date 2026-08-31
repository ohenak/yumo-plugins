# Cross-Review: product-manager — DECISIONS (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.5, erratum round 6)
**Upstream at HEAD:** REQ `60a516fb…` · FSPEC `25af3c47…` · TSPEC `cb351bb3…`
**Date:** 2026-08-31
**Iteration:** 7 (delta confirmation)

## Context

**Delta confirmation**, not a re-review. `DECISIONS-pdlc-stats.md` moved v1.4 → v1.5 across four
commits (`503717933`, `7accaddc9`, `51347279e`, `eb3c24e4a`), answering my v6 *Needs revision*
(2 High / 3 Medium / 1 Low) and this round's routed DEC-DOC-01 items from se-author.

**The routed items.** `K-3` and `K-9` cited `coverageInstrumentation.test.js:264`, `:261` and
`pdlc/README.md:231` as raw `file:line` anchors where position is not the claim under test —
forbidden by `DEC-DOC-01`. Both now cite by content:

| Was | Now | Verified at HEAD |
|---|---|---|
| `coverageInstrumentation.test.js:264` | test title, quoted: *"P9-02: the include set is exactly the six modules the feature owns, no more and no fewer"* | Yes — `:264`, verbatim |
| `coverageInstrumentation.test.js:261` | comment text, quoted: *"`REQUIRED_INCLUDES`' three entries, `CAPTURE_SCRIPT_INCLUDE`, and the two `lib/` modules"* | Yes — `:260-262`, verbatim |
| `pdlc/README.md:231` | *"`pdlc/README.md`'s `pdlc` CLI section sentence, not its line, per `DEC-DOC-01`"* + the quoted sentence | Yes — `:231`, verbatim |

The document also states the *reason* the anchors were wrong, and it is the right one: a line anchor
into a file this feature itself edits is invalidated by that edit. That is the durable form of the
rule, not a one-off compliance edit.

**Upstream re-grounding (DEC-ERR-03).** The dispatch pins TSPEC at `sha256:512a9fcf…`. That hash
matches **no revision of TSPEC on this branch** — I hashed all twenty revisions in the file's history;
HEAD is `cb351bb3…` and the nearest prior revisions are `8d15b9d7…` and `c7374ebf…`. The document
caught this itself and re-grounded against HEAD per DEC-ERR-03, recording the mismatch in its v1.5
changelog. I confirm that call: re-grounding against a hash that does not exist is not possible, and
HEAD is the only defensible reading. REQ (`60a516fb…`) and FSPEC (`25af3c47…`) match the dispatch;
FSPEC moved v1.4 → v1.5 since my v6 but its own changelog records **no behavioural change**, and I
re-read `BR-21`/`BR-23`/`BR-24`/`BR-30` — the four this document leans on — and all four stand
unchanged in substance.

**What I re-verified mechanically**, rather than trusting the document's arithmetic:

- `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` → **25 files**, `pdlc/README.md`
  among them. The sweep reproduces.
- `pdlc/workflows/package.json`'s `c8.include` holds **seven** entries at HEAD.
- `REQUIRED_INCLUDES` holds **four** entries (`orchestrate-dev.js`, `orchestrate-queue.js`,
  `build-runtime.mjs`, `scripts/check-wave-resume-delta-coverage.mjs`), so `4 + 1 + 2 = 7` and this
  feature makes **eight**. K-3's arithmetic is right; TSPEC §2.1's *"six → seven"* is still wrong.
- TSPEC §6.4 at HEAD (`:939`, `:998-1006`) carries the split purity conjunct exactly as this
  document now describes it.

## Options Considered

Three readings of "does this delta confirm" were open, and the choice decides the verdict, so I state
it rather than assume it.

**Reading 1 — the two DEC-DOC-01 items landed, so confirm.** Rejected. The dispatch is explicit that
the item list is necessary, not sufficient, and my own v6 raised two **High** findings that this same
erratum round had to clear. Confirming on the citation items alone would approve a document whose
central number I had said was in positive contradiction with its upstream. I checked both v6 Highs.

**Reading 2 — any residual inaccuracy anywhere re-opens the High.** Rejected as over-calibrated. My
v6 F-01 was High for a stated reason, and the reason was mechanical, not aesthetic: *"PLAN reads both
documents, and a co-change set that is nine in one and ten in the other partitions into K-rows that
do not cover it."* The gate is whether the **contract PLAN partitions** — the site table and the
K-rows — covers all ten sites. It now does: the site table carries ten rows, `pdlc/README.md`
included with *"pinned by no oracle"* in place of a falsifier; K-1's partition covers site 10; K-9
owns the edit; *Standing costs accepted* records the un-falsified site as a distinct kind of cost.
The obligation is owned and PLAN cannot drop it. A prose restatement whose sub-counts do not add up
is a real defect, but it is not that defect.

**Reading 3 — confirm the routed items and the v6 Highs against upstream at HEAD, then sweep the
changed sections for what the edit introduced or left behind.** Adopted. This is what DEC-ERR-03
asks for, and it is what separates F-01 below (which the edit introduced) from the two Lows (which
it did not touch).

**Scope discipline.** I did not re-open `DEC-STATS-01`'s chosen option, `DEC-STATS-02`,
`DEC-STATS-03`'s substance, K-2, K-4, K-5, K-6, K-7, the *What these decisions do not decide*
section, or the project-level decisions — none of those were touched by this round and I approved
their reasoning at v5. I read the changed sections (the v1.5 changelog, the option table, the site
table, the sweep paragraphs, K-1, K-3, K-8, K-9, *Reversibility*, *Standing costs accepted*,
`DEC-STATS-03`'s detector paragraphs) against TSPEC at HEAD, claim by claim.

**Disposition of my v6 findings**, each re-checked against the current bytes:

| v6 | Severity then | Status now |
|---|---|---|
| F-01 — nine sites, README argued out of the table | High | **Resolved.** Ten throughout; README is site 10 with a stated membership rule; the falsifiers-only rule is retired and the retirement is reasoned, not deferred |
| F-02 — purity detector stated in withdrawn terms | High | **Resolved.** Split on return type, A-B-A for `deriveDodRoundIndex`, *"what A-B-A does and does not falsify"* stated rather than overclaimed; *"Until it lands"* replaced with *"has landed"* |
| F-03 — K-8 headline "seven" vs TSPEC's eight | Medium | **Resolved.** Eight, with the `vendoredClassWord` ternary folded inside the total and the reason for folding it stated |
| F-04 — K-9's promoted rule carried a superseded query | Medium | **Resolved.** The rule now travels with its pathspec, and the 25-vs-24 divergence is reconciled as probe-variant routes to the same ten |
| F-05 — do not adopt TSPEC's *"six → seven"*; route back | Low | **Held correctly, still owed upstream.** See F-02 below |
| F-06 — option B priced at four sites | Medium (inherited) | **Resolved.** The option table prices B at four |

## Decision

**The delta resolves the routed items and both v6 High findings, and breaks nothing I previously
approved. Confirmed, with one Medium clean-up owed.**

**The routed DEC-DOC-01 items are properly landed.** All three anchors are gone from `K-3` and `K-9`,
replaced by verbatim quotes and a section reference that I checked against the source files and found
exact. This is the stronger form of the fix, not the minimum one: a test title and a comment are
citations the reader can resolve by grep, and they survive the very edit this feature makes to those
files, which was the reason the anchors were wrong.

**Both v6 Highs are cleared on their merits, not by assertion.** F-01's repair does not just change
the digit. It restates the site table's membership rule — *"it enumerates every site that transcribes
the class, and a row whose membership nothing pins says so in place of naming a falsifier"* — and
gives the reason the falsifiers-only rule had to go: *"a table of falsifiers silently drops exactly
the obligations most likely to be forgotten."* That is the right product answer, and it is a better
answer than the one I asked for. F-02's repair adopts TSPEC §6.4's split, names why deletion was not
the alternative (*"deleting the conjunct would have removed `DEC-STATS-03`'s only mechanical
detector"*), and states A-B-A's limits — a memo table is invisible to it — instead of overclaiming.
The *Residuals* row is narrowed rather than closed, which is the honest bookkeeping.

**The one thing the edit left behind (F-01 below, Medium).** The load-bearing number moved to ten
everywhere, but two prose breakdowns still decompose "ten" into **nine named items** — they were
updated in their count word and not in their list:

| Site | Text | Names |
|---|---|---|
| *What the sweep found* | *"are exactly the ten in the table above: the five enumeration holders — … — plus `loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js` and `learningsPremises.test.js`"* | 5 + 4 = **9** |
| *Reversibility: hard* | *"amending all ten sites — the five enumerations and the four test files that pin their membership or size"* | 5 + 4 = **9** |

`pdlc/README.md` is missing from both. The fix is one clause in each, and the document already
contains the correct form to copy — *Standing costs accepted* reads *"five enumerations, the four
test files …, and `pdlc/README.md`'s prose member list"*, which enumerates ten and names the tenth.

**Why this is Medium and not a repeat of v6's High.** The contract PLAN partitions is complete: ten
rows in the site table, K-1's partition covering site 10, K-9 owning the README edit, and the
un-falsified site called out twice more. A PLAN author cannot reach a nine-item task list from those.
The two sentences above are derivative restatements sitting beside the authoritative table, and the
surrounding arithmetic now makes the omission self-evident (25 files − 15 importers = 10). It is a
genuine accuracy defect in the exact register this document exists to police, and it should be closed
— but it does not leave an obligation unowned, and it does not gate.

**What is owed upstream rather than here.** TSPEC §2.1's `coverageInstrumentation.test.js` row still
says P9-02's title moves *"six → seven"*. I re-measured: `c8.include` holds seven entries at HEAD, so
the title is stale by one in the other direction and this feature takes it to eight. **This document
is the correct one**, and it now says so explicitly, recording the divergence as an erratum owed to
TSPEC rather than silently matching a number known to be wrong. That is exactly the right handling —
it must not be "corrected" into agreement with upstream. Carried below as F-02, `inherited`, Low, and
non-gating on this document.

**Recommendation: Approved with minor changes.** Fold F-01's two clauses, and F-03's changelog
anchors if convenient, into the next edit that touches this document. Neither blocks Phase D.

## Consequences

<!-- pending -->

## Positive Observations

<!-- pending -->

## Questions

<!-- pending -->

## Delta-Confirmation Findings

<!-- pending -->

## Verdict

<!-- pending -->
