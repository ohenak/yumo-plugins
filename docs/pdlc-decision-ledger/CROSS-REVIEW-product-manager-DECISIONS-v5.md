# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (v1.4)
**Date:** 2026-08-29
**Iteration:** 5
**Scope:** Local

## Round shape

This is a **cascade re-confirmation**, not a revision round. The document under review is
**byte-identical** to the v4 base: `git diff 25a19ff885..HEAD` over
`DECISIONS-pdlc-decision-ledger.md` is empty, and `25a19ff88` ("DECISIONS v1.4 — DEC-10/-12 trigger
records the discharged re-measurement") is still the last commit to touch the file. What moved is
**upstream**: `TSPEC-pdlc-decision-ledger.md` advanced **v0.7 → v0.9** (237 insertions, 16
deletions), so the file's hash is now `sha256:eef45ef3…0623c8` against the
`sha256:1f1d7752…f09bafc77` my v4 `UPSTREAM-STATE` pinned. REQ (`sha256:ce6b133f…3c7b7c`) and FSPEC
(`sha256:2bd5c3ef…5aed39`) are unmoved and match the v4 anchors exactly.

Because there is no delta in the document, there is nothing for the delta protocol's "scan only
changed sections" step to scan. The review that *is* owed is the one this round exists for: the
DECISIONS document derives roughly a dozen load-bearing claims from TSPEC, several of them quoting
TSPEC prose and citing TSPEC section ids, and TSPEC has since been rewritten in §5.4, §7, §7.2, §7.3
and its changelog. So I re-verified **every** TSPEC-derived claim in the document against TSPEC at
HEAD, rather than re-reading the document for new opinions. Findings below are consequently all
`inherited` — no edit introduced them, and one of them is caused by upstream motion under a
stationary document.
