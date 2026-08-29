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

## Re-verification against TSPEC at HEAD (v0.9)

Every claim below is one the DECISIONS document asserts about TSPEC. Line anchors are HEAD's, and
have all shifted by roughly +150 lines from the v0.7 anchors my v4 cited — the citations themselves
are by **section id**, which is why they survived the shift.

| Claim in DECISIONS | Where | Status at TSPEC v0.9 |
|---|---|---|
| §7.3's corrected rationale records the drop loop's condition as a **single disjunction**; at 141 records both bounds are exceeded from the outset (141 lines vs `maxEntries` 70, bytes far above the 11,300 allowance); the **byte** bound sets the terminal survivor count | D-03/-13, `DECISIONS:131-135` | **Holds, verbatim.** `TSPEC:1197-1200`: *"There is one drop loop and its condition is a disjunction (§3.6) … at 141 records **both** bounds are exceeded from the outset — 141 lines against `maxEntries` 70, and the rendered bytes far above the 11,300-byte line allowance … It is the **byte** bound that sets the terminal survivor count"*. §7.3 was substantially rewritten in v0.9 (census satisfiability, TE F-01/F-02) and this passage came through untouched |
| `omitted[]` is non-empty by a wide margin, so §7.3's conjunct does not go vacuous under the raise | `DECISIONS:136` | **Holds.** `TSPEC:558` still frames §7.3's fixture as *"deliberately over-sized 141-record"* with both bounds exceeded |
| §3.6 reads `12500 − 1200 = 11,300`, ~4,995 bytes of project-level headroom, `M-6b`'s 441 | `DECISIONS:82-83`, D-10 trigger `:360` | **Holds.** `TSPEC:584-585` (`12500 − 1200 = 11,300`, 6,305 fits with ~4,995), `:594` (441 floor), `:620` (441 = 12,059 against 12,500) |
| §4.3's framing-budget argument reads against 12,500 | `DECISIONS:360` | **Holds.** `TSPEC:799` derives from §3.6's ~4,995 and the 441 |
| §9.2 marks `ERR-2` resolved | `DECISIONS:360` | **Holds.** `TSPEC:1669` reads **ERR-2 (RESOLVED upstream — REQ v1.8)** |
| Two of the four §9.2 errata are still open: `ERR-3` and `ERR-4` | `DECISIONS:374` | **Holds.** `TSPEC:1659` (ERR-1 resolved), `:1669` (ERR-2 resolved), `:1707` (ERR-3 open), `:1716` (ERR-4 open) — four errata, two open, same two |
| Every surviving mention of 8,000 in TSPEC is explicitly tensed as retired; no live 8,000-based arithmetic remains | `DECISIONS:83`, `:360` | **Holds across all eight surviving sites at HEAD** — `TSPEC:109`, `:123`, `:137`, `:139`, `:551-552` (*"both then current"*), `:582` (*"REQ v1.8 replaced the retired `8000`"*), `:638` (*"the retired `8000` admitted"*), `:1669-1673`. The two new sites v0.9 added (`:109`, `:123`) are tensed on introduction |
| `12,059` survives in TSPEC prose as a labelled upper bound and is *not* asserted as an equality | D-16, `DECISIONS:289-306` | **Holds, and v0.9 strengthened it.** `TSPEC:625`: *"The block total of 12,059 is deliberately *not* asserted as an equality"*; `:624` pins `10,859 ≤ 11,300` with the 441 difference as arithmetic. v0.9's changelog (`TSPEC:23`, `:99`) states the four corpus literals 6,305 / 10,859 / 12,059 / 441 are unchanged |
| The discharge list's six sites (§3.6 allowance/headroom, §4.3 framing budget, §7.3 shipped-default assertions, D-10, §9.2 erratum, §4.3 re-measurement) | D-10/-12 trigger, `DECISIONS:360` | **Holds.** §7.3's shipped-default conjuncts (2) and (6) survive v0.9's rewrite and still express the bound as `maxBytes − 1200` rather than a transcribed literal (`TSPEC:1703`) — which is exactly the property the discharge list was written to protect |

Nothing in the document was falsified by the upstream move. The one thing it now mis-states is the
version label it hangs those claims on, which is F-01 below.
