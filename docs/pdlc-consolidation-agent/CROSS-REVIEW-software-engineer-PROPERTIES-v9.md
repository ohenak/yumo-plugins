# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.8)
**Date:** 2026-08-10
**Iteration:** 9

**Scope:** Delta re-review. Re-read my own v8 cross-review first, then diffed
`d1862bd9..HEAD` on the document (four commits: `f23ceb71`, `95ce4bc8`,
`e7e91c8b`, `3c1d6853`) and judged two things only — whether v8's F-01 and F-02
are resolved, and whether the revision broke anything it touched. Unchanged
sections are not re-litigated; every claim the delta makes about FSPEC, TSPEC and
PLAN was re-measured against HEAD rather than taken from the changelog.

## 1. Prior-finding disposition

| v8 finding | Disposition at HEAD | Evidence |
|---|---|---|
| F-01 (Medium) — the reclaimed proposal-file conjunct was stated as an absence over the write double with no positive control on the same channel, so it greens on a fixture where the double recorded nothing at all | **Resolved, and resolved at the layer I asked for.** The conjunct is now a **set equality** — the recorded path set is *set-equal to* `{docs/_decisions/.consolidation-lock}` — with the absence stated as a *consequence* of that equality, plus an explicit non-vacuity argument: a `no-op` pass takes **and** releases the marker, so the expected set is non-empty by construction and a never-exercised write seam reds. This is exactly the one-clause fix, with no new fixture, no new double and no re-measurement | `PROPERTIES:481-496`; the release table it leans on is real (`TSPEC:2853`, a six-member closed enumeration keyed on terminal status), take is `_checkFile → _readFile → _writeFile` (`TSPEC:1329`), step 16 is *"`_writeFile` only"* (`TSPEC:2148`) |
| F-02 (Low) — §10.4 re-pinned itself but did not record that PLAN T05 still carries the superseded pin, count, range and unqualified green-on-write claim | **Resolved, and all four divergences named individually.** §10.4 now states that *this section, not PLAN T05, is the current record*, enumerates the four stale items, and says why it is written down: so an implementer who builds T05 from PLAN reds on the version pin and knows why | `PROPERTIES:1683-1691`; PLAN's four stale items all confirmed present at `PLAN:351` (`11.5` / `2.0`, `:2089-2239`, **99**, *"green the moment it is written"*), restated at `PLAN:120-130` |

Both prior findings are closed. Neither fix moved a property, a fixture or a
measurement — the changelog's *"no property added, removed or renumbered (the set
stays 118), no fixture added, and no measurement re-taken"* is exact: my own
enumeration of distinct `PROP-*` ids at HEAD returns **118**.

## 2. Delta claim re-measurement

Every factual claim the v1.8 changelog and the new prose make, re-measured
independently at HEAD:

| Claim in the delta | Verdict |
|---|---|
| The property set stays **118**; nothing added, removed or renumbered | **Exact.** De-duplicated `PROP-*` enumeration returns 118 |
| A `no-op` pass takes **and** releases the marker, so the expected write set is non-empty by construction | **Exact, and the mechanism is precedent, not invention.** `TSPEC:2853` states the six-member release table with `no-op` ⇒ taken **and** released at step 16; `TSPEC:2148` shows step 16 gated on `state.markerHeld` and *"`_writeFile` only"* |
| The take records `IN-PROGRESS:` via `_writeFile`, the release records `RELEASED: {passId} {ISO-8601}` | **Exact.** `TSPEC:1329` pins the three-call take; `TSPEC:1260` pins release as one `_writeFile` of the `RELEASED:` sentinel, in place, no removal verb |
| The expected set is `{marker path}` and **nothing else** on this Given | **Exact, and I checked the negative myself rather than trusting it.** The only other `_writeFile` call sites a pass can reach are the proposal file (`TSPEC:397`, §7.9 `renderProposalFile`), the guard-set edit (`TSPEC:627`) and writes inside the PR clone (`TSPEC:1923`) — none reachable on an all-unreadable `no-op` with nothing to promote. The terminal log row is `_appendFile` (`TSPEC:2148` step 14) and the commit is `_git` (step 15), so neither pollutes the `_writeFile` set. The equality is therefore tight, not merely plausible |
| PROP-MRK-04 is the shape precedent, one channel over | **Exact in substance.** `PROPERTIES:1053-1058` asserts the observed **pathspec** set set-equal to the §5.4 write set and says in its own words why the absence-only reading fails. The analogy to a `_writeFile` path set is sound (see F-01 for the citation) |
| The `:1082` citation now matches PROP-RTE-06's actual wording, *"decides on causes rather than on terminal status"* | **Wording exact, locator now wrong** — see F-01. That sentence is at `PROPERTIES:1117` at HEAD |
| §7's O-1 roll gains a `PROP-COR-09` bullet | **Present** (`PROPERTIES:313-317`), with the range caveat in F-01 |
| PLAN T05 still carries `11.5` / `2.0`, `:2089-2239`, **99** and *"green the moment it is written"* | **Exact, all four.** `PLAN:351` verbatim; `PLAN:120-130` restates the pin, count and range |
| §10.4's own record — FSPEC **11.7** / TSPEC **2.7**, range `FSPEC:2116-2267`, **100** ids | **Exact.** `FSPEC:12` reads 11.7, `TSPEC:12` reads 2.7, `## 13. Acceptance tests` is `FSPEC:2116` and `## 14.` is `:2268`, and my own de-duplicated enumeration over that range returns **100** |
| Errata 8 and 9 unchanged, no new erratum raised | **True as stated** — and that is itself a finding (F-02), because §10.4's new paragraph hands a repair to a channel that carries no row for it |
