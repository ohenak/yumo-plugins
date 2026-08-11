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

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The delta added three intra-document line citations and its own +35 lines invalidated two of them; both now land on a different property than the one they name.** `PROP-MRK-04's precedent at `:1018`` (`:482`) points at **PROP-MRK-01** — PROP-MRK-04 is at `:1053`. The re-quoted PROP-RTE-06 wording *"decides on causes rather than on terminal status"* is cited `:1082` (`:500`), which is inside **PROP-RTE-04** — the quoted sentence is at `:1117`. Both were **correct at the pre-delta blob** (`d1862bd9`: MRK-04 at `:1018`, the quoted line at `:1082`), so this is not inherited drift: the same commits that inserted the 16-line changelog block and the 5-line O-1 bullet moved the targets and did not re-measure. Third site, same class: the O-1 bullet cites PROP-COR-09 as `:458-476` (`:316`), but the set-equality sentence the bullet exists to advertise runs `:481-496` — a reader who follows the range stops one paragraph short of the material. The fix is mechanical and is three numbers: `:1053`, `:1117`, `:459-505`. Worth doing rather than tolerating, because these are exactly the pointers a T20/T31 implementer follows to find the precedent they are told to copy | §7 O-1 (`:316`), §4.2 PROP-COR-09 (`:482`, `:500`); targets at `:1053`, `:1117` |
| F-02 | Medium | Local | **§10.4 hands PLAN T05's repair to the erratum channel, and §13.3 opens no row for it — so nothing routes it.** The new paragraph says the divergence *"is PLAN's to repair through the erratum channel, not this document's to fix"* (`:1686-1688`), which is the right call on ownership. But §13.3's list stops at errata 8 and 9, and the changelog states plainly *"no new erratum is raised"*. Erratum 9 does touch PLAN — T20's cell — and erratum 8 touches TSPEC, so the channel is live and the omission reads as an oversight rather than a decision. The consequence is concrete and lands in Phase I, not in review: T05 as PLAN writes it pins `11.5` / `2.0` and expects **99** over `:2089-2239`, all four superseded at HEAD (FSPEC 11.7, TSPEC 2.7, **100** over `:2116-2267` — I re-measured), and PLAN still closes *"the case is green the moment it is written"* (`PLAN:351`). An implementer who builds T05 from PLAN writes a case that reds on its first assertion against a conforming tree. §10.4 makes that legible after the fact; only an erratum row makes it repaired before dispatch. This document's part is one §13.3 item naming the four stale figures and their current values — the finding itself I route upstream as an `ERRATUM: PLAN` line, so the fix does not wait on this file | §10.4 (`:1683-1691`), §13.3 (`:1994`, items 8–9); `PLAN:351`, `PLAN:120-130` |

## 4. Oracle-quality checks

- **No implementation echoes.** Clean, and the delta strengthened this rather
  than weakening it. The expected write set is a **literal transcription** —
  `{docs/_decisions/.consolidation-lock}`, the path §10/PROP-SRC already pins in
  `.gitignore` — not a value read back from the pass under test. The delta
  explicitly refuses the two echo-shaped alternatives: it is not the double's
  **call count** (which would track the implementation's take/release call shape),
  and it is not *"nothing under `docs/_decisions/`"* (which would be derived from
  the corpus layout). §10.4's version pins (`11.7` / `2.7`) remain literals read
  from FSPEC/TSPEC front matter, and `PROP-TRC-01`'s *"the count is read, never
  hard-coded"* clause is untouched — the 100 stays a documentation assertion, not
  a test literal.
- **No absence-only oracles.** My v8 F-01 was the one violation and it is gone.
  The absence is now derived from an equality whose expected set is non-empty **by
  construction on that Given**, with the construction argued from the release
  table rather than asserted — the strongest available form, because it does not
  depend on the test author remembering to add a control fixture. §7's O-1 roll
  now lists the case, so the register of absence-paired oracles is complete rather
  than one member short (that was pm-review's F-02, and it is the right place for
  it: O-1 is the index an implementer scans, not a prose paragraph 170 lines down).
- **Completeness is set-equality, not containment.** Held throughout. The new
  conjunct is itself an equality, not a containment — a *surplus* recorded write
  (a stray proposal file, a spurious guard-set edit) reds it just as a missing one
  does, which is what `contains no CONSOLIDATION-PROPOSAL-*` would not have caught
  in the surplus direction for any other path. `PROP-TRC-01`'s two-way register
  equality is untouched and was not quietly relaxed to containment to make the
  AT-K3b shortfall go away; the shortfall is still written down and still routed
  as erratum 8. PROP-COR-09's conjunct (2) keeps its `renderConsumedPair` set
  equality, and PROP-MRK-04's pathspec equality — the shape precedent — is
  unchanged.

## 5. Questions

None. My v8 Q-01 asked which anchor the author intended for non-vacuity; the
delta answers it in the document body rather than in a reply — the anchor is the
marker path, the set is a path set, and take/release collapse to one member.
That is the answer an implementer reads, which is where it needed to be.

## 6. Positive Observations

- **The non-vacuity argument is constructive, not aspirational.** The cheap way
  to close my v8 F-01 was to bolt a positive control onto the fixture. The
  revision did something better: it showed that the expected set is *already*
  non-empty on the Given the register row dictates, by deriving it from the
  release table (`no-op` ⇒ taken **and** released). That costs the implementer no
  extra fixture and cannot be forgotten in the writing, because the equality
  fails if the take never happened.
- **The two deliberate non-choices are worth more than the choice.** Saying what
  the expected set is *not* — not *"nothing under `docs/_decisions/`"* (the marker
  lives there), not a call count (take and release are two writes to one path) —
  pre-empts the two ways an implementer would naturally get this wrong. The
  second is a genuine trap: a `toHaveBeenCalledTimes(1)` on the write double is
  the obvious first draft and it would red on correct code.
- **The ownership line is drawn correctly.** §10.4 records PLAN T05's staleness
  and refuses to fix it here. That is the erratum discipline working as designed —
  the defect is named at the site where it bites, and the repair is left to the
  document that owns the text. F-02 is only that the routing step was not taken;
  the judgment underneath it is right.
- **Nothing the revision touched broke.** 118 properties, no fixture added, no
  measurement re-taken — I verified all three independently rather than reading
  the changelog. The `:1082` wording repair (pm-review F-03) is a real fidelity
  fix: the old quote *"decides on causes, not on terminal status"* was a
  paraphrase of PROP-RTE-06's actual sentence, and quoting a sibling property
  loosely is how two properties drift into disagreeing.

## 7. Recommendation

**Approved with minor changes**

Both v8 findings are resolved, and the Medium one is resolved at the layer I
asked for — a set equality with a constructive non-vacuity argument, no new
fixture, no new double, no re-measurement. I re-measured every claim the delta
makes about FSPEC, TSPEC and PLAN against HEAD, including the one the delta did
not claim but the new conjunct depends on: that no other `_writeFile` call site
is reachable on an all-unreadable `no-op` pass. It holds, so the equality is
tight rather than merely plausible.

No High findings are open. F-01 is three stale line numbers the delta's own
insertions created — mechanical, but they mislead a reader toward the wrong
property, and two of them were correct before this round. F-02 is a routing gap:
§10.4 correctly declines to fix PLAN and correctly names the erratum channel, but
§13.3 opens no row, so nothing carries the repair. I route that item upstream as
an `ERRATUM: PLAN` line in this response, so the T05 pin can be repaired before
Phase I dispatches regardless of what this document does next. Neither finding
touches an oracle, and nothing the revision touched broke.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
