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

<!-- pending -->

## Decision

<!-- pending -->

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
