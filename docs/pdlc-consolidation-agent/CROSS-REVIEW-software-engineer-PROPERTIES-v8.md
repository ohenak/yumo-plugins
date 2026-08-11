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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The reclaimed proposal-file conjunct is stated as an absence with no positive control on the same observable, so it can green on a fixture whose write double recorded nothing at all.** The new sentence asserts *"the set of paths the double was asked to write contains no `docs/_decisions/CONSOLIDATION-PROPOSAL-*.md` bearing this pass's `passId`"* (`:459-461`). Taking the conjunct back from PROP-RTE-06(b) is the right call and the reasoning for it is sound — but the thing that made it safe **there** did not travel with it. PROP-RTE-06 pairs its two negatives with fixture **(c)**, *"the positive control … **exactly one** exists, named for that `passId`"* (`:1077-1079`), and TSPEC says why in as many words for the same oracle: the control is there *"so the negative cannot pass on a fixture that wrote nothing at all"* (`TSPEC:2847`). PROP-COR-09's two fixtures are the mixed corpus and the all-unreadable corpus; neither writes a proposal file, so nothing in this case distinguishes "the pass correctly declined to write one" from "the write double was never exercised". The property is scrupulous about exactly this hazard three sentences earlier — conjunct (2)'s readable control exists *"to stop the conjunct passing on an implementation that renders an empty pair"* — so the standard is the document's own, not one I am importing. **The cheap fix needs no new fixture:** on this very Given the pass takes and releases the marker (FSPEC §4.3 — `no-op` ⇒ taken **and** released at step 16; `TSPEC:1329` take is `_checkFile → _readFile → _writeFile`, `:1260` release is `_writeFile`), so the recorded path set provably contains `docs/_decisions/.consolidation-lock` and is non-empty by construction. One clause naming that — the recorded path set is non-empty and contains the marker path, and contains no proposal path for this `passId` — converts an absence-only assertion into a set claim that cannot pass vacuously | §4.2 `PROP-COR-09` (`:458-465`); cf. `:1077-1079`, `TSPEC:2847`, `TSPEC:1260`, `:1329` |
| F-02 | Low | Local | **§10.4 re-pinned itself but does not record that PLAN T05 still carries the superseded pin, count, range and an unqualified green-on-write claim.** PLAN T05 instructs the implementer to pin *"FSPEC's `Version` cell reads `11.5` and TSPEC's reads `2.0`"*, to measure over `:2089-2239`, records **99** ids, and closes *"the case is green the moment it is written"* (`PLAN:351`; the same figures are restated at `PLAN:123-128`). An implementer who builds T05 from PLAN — which is the document Phase I dispatches from — writes a version pin that reds on the first assertion against a conforming repo. The defect is PLAN's and I am routing it as an erratum rather than counting it here, so this finding is only about legibility: this document names its known divergences at the site where they bite (§12.4's AT-K cell, §11's file table row, `PROP-PASS-11`'s placement note), and the PLAN-side staleness of the very property §10.4 just re-pinned is the one divergence it leaves unsaid. One clause in §10.4's measurement paragraph — pin and measurement are re-taken here, PLAN T05's cell still carries the v11.5 figures and is routed as an erratum — keeps the convention whole | §10.4 (`:1639-1655`); `PLAN:351`, `PLAN:123-128` |

## 4. Oracle-quality checks on what changed

Three standing checks, run over the delta only:

- **No implementation echoes.** The new text transcribes `FSPEC:2210`'s
  Then-conjuncts and `TSPEC:2929`'s file assignment as literals; the re-pinned
  `11.7` / `2.7` are read off the FSPEC and TSPEC `Version` cells, which are the
  spec, not the code under test. The count remains **read at run time, never
  hard-coded** — `PROP-TRC-01`'s *"the count is read, never hard-coded"* clause
  is untouched, and the re-measured 100 is documentation of what the assertion
  should produce, not a literal the test asserts. That distinction is the one
  that matters here and the revision keeps it.
- **No absence-only oracles.** One violation, F-01: the reclaimed
  `no CONSOLIDATION-PROPOSAL-{passId}.md` conjunct has no positive assertion on
  the same channel. The delta's other negatives are clean — *"no reason code
  minted"* and *"the rendered pair's basename list is empty"* sit against
  `|un-consolidated|` is **2**, both basenames named in the report body, and
  terminal status exactly `no-op`, all on the same fixture.
- **Completeness is set-equality, not containment.** `PROP-TRC-01`'s two-way
  equality is intact and was not quietly relaxed to containment to make the
  AT-K3b shortfall go away — the revision did the opposite, keeping the equality
  and writing down that it reds until erratum 8 lands. §12.4's AT-K row is a
  per-id assignment, not an oracle, so it carries no equality obligation of its
  own.

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: is there a reason the marker path is *not* the non-vacuity anchor you want — e.g. do you read §7.3's take as reaching `_writeFile` before the corpus is classified, so an implementation that failed earlier would still record it? If so, say which write you would rather anchor on; any recorded write on this Given does the job, and I have no preference between them. |

## 6. Positive Observations

## 7. Recommendation

## Verdict
