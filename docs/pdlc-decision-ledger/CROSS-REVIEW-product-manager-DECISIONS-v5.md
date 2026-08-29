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

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Finding | Requirement ref |
|----|----------|-----------|----------|---------------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | `## Context` (`:19`, `:81`), D-10/-12 re-evaluation trigger (`:360`) | The document pins its TSPEC-derived claims to **"at HEAD (TSPEC v0.7 …)"** in three places. TSPEC is **v0.9** at HEAD (`TSPEC-pdlc-decision-ledger.md:18`). Every *substantive* claim behind that label still holds (table above), so this is a stale provenance label, not a false derivation — but "at HEAD" is a self-dating phrase, and the one-pass re-measurement trigger at `:360` is precisely the row a future reader consults to decide whether a re-measurement is owed. Re-stamp the three literals to v0.9 (and the `UPSTREAM-STATE` TSPEC hash to `sha256:eef45ef3…0623c8`), or re-word "at HEAD" to "as measured at TSPEC v0.7". No decision changes | REQ-DECLEDGER-07; REQ C-5 |
| F-02 | Medium | inherited | nonlocal | `## Decision` D-16 row; D-16's PROPERTIES row | Carried unresolved from v4 (F-01 there). D-16 states the prohibition over *"Every byte literal in TSPEC"*, while `POSTMORTEM-D:230-232` deliberately carves out prose that carries a derivation clearly labelled as an upper bound. TSPEC at HEAD relies on that carve-out and is conformant under it (`TSPEC:625` — *"deliberately not asserted as an equality"*), so the recorded rule is stricter than both its source and the spec it governs. Scope the prohibition to figures that are **asserted or pinned** (test-transcribable). Non-blocking, but the row nominates itself for promotion to `docs/_constraints/DOMAIN-CONSTRAINTS.md`, where the over-broad form would bind every future feature | REQ-DECLEDGER-07; REQ C-5 |

FINDING: Medium | inherited | nonlocal | `## Context` and D-10/-12 trigger — "at HEAD (TSPEC v0.7)" | TSPEC is v0.9 at HEAD; the three version literals and the UPSTREAM-STATE TSPEC hash are stale, though every substantive claim they carry re-verifies
FINDING: Medium | inherited | nonlocal | `## Decision` D-16 row and its PROPERTIES row | D-16's "every byte literal" prohibition is broader than POSTMORTEM-D's carve-out for prose-labelled upper bounds and than the TSPEC it governs; scope it to asserted/pinned figures

## Questions

| ID | Question |
|----|---------|
| Q-01 | v0.9 dropped `decisionLedger` from the census token set and made the report field's whole proof §7.2's live composition-root arm (`TSPEC:947-952`). No standing decision in this ledger names that field, so nothing here is contradicted — but is the "one arm is the field's sole evidence" fact worth a D-entry, or is it correctly TSPEC-local? Non-blocking, and explicitly **not** a request to open a decision in a frozen round. |
| Q-02 | Carried from v2/v3/v4, still open and still non-blocking: D-13's *"~154-byte mean line"* (`6,305 / 41 = 153.8`) against §3.6's reported project-level mean of **153**. Rounding only; no conclusion turns on it. |

## Positive Observations

- **The document held still while its upstream moved 237 lines, and lost nothing.** That is the
  strongest evidence yet that D-16's provenance discipline and the section-id citation convention
  (rather than line anchors) were the right calls: every one of the nine claims re-verified survived
  a rewrite of §5.4, §7, §7.2 and §7.3, and survived a +150-line shift in every anchor, without a
  single citation dangling.
- **§7.3 was rewritten for satisfiability and the passage this ledger quotes came through
  verbatim.** `TSPEC:1197-1200` still reads as D-03/-13 records it. The v0.9 author repaired the
  census "the general way rather than by another exception" and left the drop-loop rationale
  untouched — the ledger's quotation is not merely still true, it is still the same sentence.
- **The discharge list is doing the job it was kept for.** v0.9 touched §7.3, one of the six
  enumerated sites. Because the list exists, checking whether a re-measurement was owed took one
  pass over six named locations instead of a hunt — which is exactly the reusable shape v3's finding
  asked for, now exercised once for real.
- **v0.9 tensed its two new mentions of 8,000 on introduction** (`TSPEC:109`, `:123`). The retirement
  discipline this ledger recorded is being applied by a later author without being re-cited, which
  is what a durable decision looks like from the outside.

## Recommendation

**Approved with minor changes**

No High finding is open. The document is unchanged this round, and the frozen-round bar admits a
blocking finding only for a defect the revision introduced (there was no revision) or a load-bearing
claim falsified at HEAD (none — all nine re-verify against TSPEC v0.9). F-01 is a stale version
label caused by upstream motion under a stationary document; F-02 is v4's Medium carried forward.
Both are worth landing before consolidation, neither gates the phase.

DEFERRED: re-stamp `## Context` and the D-10/-12 trigger from TSPEC v0.7 to v0.9, and refresh the UPSTREAM-STATE TSPEC hash, in the next non-frozen touch.
DEFERRED: scope D-16's prohibition to asserted/pinned byte figures before the row is promoted to `docs/_constraints/DOMAIN-CONSTRAINTS.md`.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
