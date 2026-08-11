# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.7)
**Date:** 2026-08-10
**Iteration:** 8

**Scope:** Delta re-review. Re-read my own v7 cross-review first, then diffed
`7545fea1..HEAD` on the document (four commits: `06b09fea`, `4fdc13e6`,
`f06327af`, `d1862bd9`) and judged two things only — whether v7's F-01 and F-02
are resolved, and whether the revision broke anything it touched. Unchanged
sections are not re-litigated; the delta's own claims are re-measured
independently.

## 1. Prior-finding disposition

| v7 finding | Disposition at HEAD | Evidence |
|---|---|---|
| F-01 (Medium) — `PROP-TRC-01`'s version pin transcribed literals (`11.5` / `2.0`) that HEAD had already moved past | **Resolved, and resolved at the level the finding asked for.** The pin now reads `11.7` / `2.7`, and the ambiguity Q-01 raised is answered explicitly rather than left to the implementer: *"the pinned literals in conjunct 1 are the **recorded measurement's** versions, and the contract is that pin and measurement move together, so the pin can never certify a count it did not produce."* The measurement of record was actually re-taken, not just re-labelled — **100** ids over `FSPEC:2116-2267` | `PROPERTIES:1639-1648`; `FSPEC:12` reads `11.7`, `TSPEC:12` reads `2.7` |
| F-02 (Medium) — the one-id set-equality gap against `AT-K3b` was known but written nowhere the implementer would read it | **Resolved in all three places I named.** §10.4 now says the property is *"green on write only once §13.3 erratum 8 lands"* and that *"a red at T05 before erratum 8 is the routed erratum, not a parser defect"*; §12.4's AT-K cell carries the consequence in full, including why this is **not** the permanently-red block §12.3's closing rule forbids; §11's file table row is qualified rather than left reading a bare *"green on write"* | `PROPERTIES:1650-1655`, `:1885`, `:1804` |

Both closed. Neither closure weakens a claim elsewhere, and neither was closed
by deleting the obligation.

## 2. Independent re-measurement of the delta's claims

The delta makes seven checkable assertions about files. I re-measured each
against HEAD rather than reading the changelog's word for it:

| Claim in the delta | Verdict |
|---|---|
| FSPEC's `Version` cell reads `11.7`, TSPEC's reads `2.7` | **Exact** (`FSPEC:12`, `TSPEC:12`) |
| The register range is `FSPEC:2116-2267` | **Exact, and it is the whole of §13 with nothing else swept in.** `## 13. Acceptance tests` is at `:2116` and `## 14. Obligations and open questions` at `:2268`, so the range is closed on the section boundary — the old `:2089-2239` was the same section before v11.6/v11.7 shifted it |
| De-duplicated `AT-…` tokens over that range give **100** | **Exact.** My own enumeration returns 100 distinct ids |
| The delta from the 2026-08-06 measurement of 99 is **exactly `AT-K3b`** | **Exact, and stronger than "the count went up by one".** I diffed the id *sets*, not the counts: the register at FSPEC v11.6 (`48631bc6`) yields 99 ids, HEAD yields 100, and the symmetric difference is the single line `AT-K3b`. No id was silently swapped under a stable count |
| TSPEC §12.3 assigns `AT-K3b` to no file, and AT-K1…AT-K7 sit in `consolidationCredential.test.js` | **Exact.** The credential row (`TSPEC:2929`) enumerates AT-K1…AT-K7 and stops; the `consolidationPass.test.js` row (`:2923`) carries its all-unreadable fixture under **(no FSPEC AT)**. So the register→file direction really is short exactly one id, which is what §12.4's new cell claims |
| `PROP-RTE-06(b)`'s Given is a **duplicate-suppressed** pass, so it cannot witness AT-K3b's obligation | **Exact.** `(b)` is *"a `no-op` pass where everything was duplicate-suppressed"* (`PROPERTIES:1073-1075`) — AC-1.4's second cause, not the third |
| PROP-RTE-06's body rejects the shared-terminal-status bridge — *"§5.3 decides on causes, not on terminal status"* | **Verbatim**, with one locator nit: the sentence wraps, beginning at `:1081` and finishing at `:1082`, and the citation names only `:1082`. Not worth a finding — the quote is exact and the reader lands inside it |
| The property set is unchanged at **118** | **Exact, both ways.** Distinct `PROP-*` ids at HEAD: 118. Symmetric difference against the `7545fea1` blob: **empty**. Nothing added, removed, renumbered or re-homed, exactly as the changelog claims |

One further check the delta did not claim but which its new conjunct depends
on: *"the write double's recorded path set"* is not an oracle invented here.
TSPEC already states AT-R7's negative in exactly that vocabulary — *"asserted
through the write double's recorded path set"* (`TSPEC:2847`) — so the
mechanism is precedent-reuse rather than a new fixture idiom, and it costs the
implementer no new double (`TSPEC:2460` binds `_writeFile` to `fakeFs`).

## 3. Findings

## 4. Oracle-quality checks on what changed

## 5. Questions

## 6. Positive Observations

## 7. Recommendation

## Verdict
