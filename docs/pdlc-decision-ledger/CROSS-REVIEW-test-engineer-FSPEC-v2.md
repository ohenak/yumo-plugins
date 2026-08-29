# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.1, Draft)
**Upstream:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` v1.7 (approved)
**Previous round:** `CROSS-REVIEW-test-engineer-FSPEC-v1.md` (3 High, 6 Medium, 2 Low — Needs revision)
**Date:** 2026-08-28
**Iteration:** 2

## Scope of this round

Delta re-review. Baseline for the diff is `dce4666af` (the commit completing my v1 review); the
revision landed across five commits, `4c8dd33f7`…`a81757947`, +201/−144 lines. I verified my three
blocking findings closed, re-derived the new arithmetic against HEAD, and scanned only the changed
sections for new issues. Unchanged sections already reviewed are not re-litigated.

## Disposition of my v1 findings

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| **F-01** | High | **Closed** | E-9 now has an assertion. AT-01 (`:348`–`:350`) makes dispatch (a) `pdlc-advisory-wave-gate`, whose corpus holds `M-4d`'s mixed file, and asserts its **8** non-record headings contribute **no** line while its 4 real records render — carried by whole-line set equality, so an extra line fails. Also traced: §2's `-01` row now names E-9 (`:68`) |
| **F-02** | High | **Closed** | AT-18 added (`:369`–`:375`), over O-5's synthetic two-file corpus, asserting the cardinality conjunct positively — "**exactly one** line carries that id — never two, never zero" — and explicitly leaving the winner to TSPEC (O-1, `M-5c`), which is the split E-11 itself makes. See F-01 below for the one soft conjunct |
| **F-03** | High | **Closed, and closed well** | AT-14 (`:433`–`:439`) replaces the absence-only oracle with byte-identity to AT-04's committed baseline. One comparison now pins no index block, **no rule text standing alone above a missing index**, and no whitespace drift; the doc states the falsifier itself ("a build emitting the rule text without an index fails") |
| **F-04** | Medium | **Closed** | AT-01's expected set is now determinate and per-dispatch: `M-1d`'s 41 ∪ the single `M-2e` row for the reviewed feature — 4 for (a), 7 for (b) — with the negative stated ("a build rendering all 100 feature-level ids fails") |
| **F-05** | Medium | **Closed** | AT-01 `:354`–`:357` now pins provenance: statements and citations are "transcribed from the frozen fixture's own heading text and record location — data — never captured from the renderer's output, which would derive the expectation from the code under test". `M-3c`'s verbatim second opening is the pinned discriminating case |
| **F-06** | Medium | **Closed** | AT-16 `:481`–`:487` adds the anchor conjunct — the open-finding ledger transcribed from the recorded fixture — and says why ("invariance alone passes a driver broken identically in both runs"). The honest note that the five are **not** claimed exhaustive is the right call: an open mechanism list must not carry a set equality |
| **F-07** | Medium | **Closed** | §2 now rows E-9, E-10, E-11 under `-01`, N-1 under `-07`, N-2 under `-08`. §2's own set-equality claim ("nothing in §3–§6 exists without a row here") holds again |
| **F-08** | Medium | **Closed** | AT-07 `:398`–`:405` moves the *Who* to the driver and asserts a property of the emitted **text** — both exemplars named, each labelled with its side, reader directed to the cited record — with the falsifier stated. No human is left in the oracle |
| **F-09** | Medium (Cross-Feature) | **Closed, one gap** | The FSPEC is now on the Baseline's propagation path (`docs/_constraints/pdlc-decision-corpus-baseline.md:6`, commit `a81757947`). The anchor list itself is not accurate — F-03 below |
| **F-10** | Medium | **Mostly closed** | §3.1 `:96`–`:101` defines *wrong-typed* and *malformed* once and fixes the per-key condition space; BR-10 and AT-11 both adopt it. E-5 and E-1 did not — F-02 and F-05 below |
| **F-11** | Low | **Closed** | O-8 added (`:518`), naming the bounds invariant as a **property** obligation on PROPERTIES, parameterised over set size × line sizes × both bounds, explicitly not "further examples" |

## Claims re-derived against HEAD, not taken from the document

| Claim in the revision | Checked | Result |
|---|---|---|
| `M-1d` is 41 project-level ids | Baseline `:50`, `:53` | ✓ 41, enumerated |
| `pdlc-advisory-wave-gate` is 4; `pdlc-engineering-loop` is 7 | Baseline `M-2b` `:60`, `M-2e` `:63` | ✓ `DEC-A6-01…04`; `DEC-LOOP-01…07` |
| AT-01's 45 and 48, both inside `maxEntries` 70 | arithmetic over the above | ✓ 41+4=45, 41+7=48, both < 70 (`M-6c`) |
| (a)'s corpus holds `M-4d`'s mixed file, 4 records + 8 non-records | Baseline `:88` | ✓ `docs/completed/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md`, `:261,315,362,420` records; 8 non-records at `:208,217,231,251,443,493,509,526` — the file **is** in (a)'s feature directory |
| (b)'s corpus holds `M-3c`'s twice-opened block, `DEC-LOOP-01`…`06` | Baseline `M-3a` `:75`, `M-3c` `:77` | ✓ 13 records over 7 distinct ids; `01`…`06` open twice, `07` once; second opening is the deciding one |
| "No other feature's `M-2e` row is in scope" | Baseline `M-2e` `:63` sums 100 over twelve directories | ✓ the negative is the right one to state; it is what §3.2 step 2 scopes |
| `M-5a` records zero cross-file duplicates, so E-11/AT-18 need a synthetic corpus | Baseline `:83` | ✓ still zero at HEAD |
