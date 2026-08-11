# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.3)
**Date:** 2026-08-09
**Iteration:** 4
**Scope:** Delta re-review under the round-4 protocol. Diffed `d090ef08..HEAD` on the document
(80 insertions, 7 deletions), read my own v3 findings first, and judged only (a) whether the v3
blocking finding is resolved and (b) whether the revision broke anything. Unchanged sections were
not re-litigated. Every upstream citation the new text introduces was re-measured against HEAD
rather than trusted from the document.

## 1. Round-3 findings disposition

| v3 finding | Severity | Disposition | Evidence, re-measured at HEAD |
|---|---|---|---|
| F-01 — AT-P6 and AT-P10 claimed in a file the approved TSPEC/PLAN does not give them, and §12.4 asserted the single-file invariant unqualified | High | **Resolved, and resolved the way I asked** — §13.3 erratum 6 routes the re-registration upstream, and §12.4 names the pending erratum instead of over-claiming | §13.3 item 6 (`:1896-1912`) states both halves of the correction (TSPEC §12.3 moves the two ids to the `consolidationPass.test.js` row; PLAN T14's `T25` block drops them), exactly the shape erratum 5 uses. §12.4's AT-P cell (`:1775`) now says the two ids sit in a file the approved upstream does not give them and defers to erratum 6; the AT-C cell (`:1774`) narrowed its own claim from "each id" to "each **AT-C** id", so it no longer speaks for a family it cannot vouch for. PROP-COR-10 and PROP-COR-11 stayed at L2 — trailers still read `L2 · consolidationPass.test.js · T20 → T31` (`:397`, `:405`) — so no property moved and no L1 arm was invented for a conjunct a pure subject cannot observe |
| F-02 — false existing-code claim in erratum-3 prose ("a directory that does not exist at HEAD") | Medium | **Resolved** | §4.3 (`:446-449`) now says the directory **exists and is tracked at HEAD**, cites the measurement, and states that the new thing is the file while the missing thing is the manifest row. §13.3 item 3 (`:1877-1879`) carries the same correction. Re-measured: `git ls-files pdlc/workflows/__tests__/fixtures/` returns 36 tracked files at HEAD, and the remedy is unchanged — `PLAN:307` still names only `pdlc/workflows/__tests__/consolidationHookParity.test.js` |
| F-03 — PROP-PASS-11 lands in a file whose PLAN block text excludes it, with the exclusion explicit | Medium | **Resolved** | §13.3 erratum 7 (`:1913-1927`) routes the gap upstream, names the third unregistered obligation PLAN T20 should declare, and states the sharper fact I wanted on the record: no PLAN block declares AC-1.4's no-op case at all, before or after the v1.2 re-home. PROP-PASS-11's trailer carries a placement note (`:1367-1371`) marking the file as derived from the property's subject and the `T20 → T31` cell as this document's judgment pending the erratum |
| F-07 (v1) — hook facts pinned by name, not line index | Low | Still resolved | unchanged |

## 2. Independent re-measurement of the new claims

Every factual claim the revision added is a claim about a file other than this one, so each was
measured at HEAD before I accepted it. None was taken from the document's own prose.

| New claim | Verdict at HEAD |
|---|---|
| TSPEC §12.3 registers AT-P6 and AT-P10 on `consolidationPredicate.test.js` (`TSPEC:2499`) | **Exact.** `TSPEC:2499` is the L1 row `AT-P1 … AT-P2, AT-P3, AT-P4, AT-P5, AT-P6, AT-P8, AT-P9, AT-P10, AT-P11` |
| PLAN T14 enumerates them in block `T25 — corpus and predicate` (`PLAN:258`) | **Exact.** `PLAN:258` lists `… AT-P5, AT-P6, AT-P8, AT-P9, AT-P10, AT-P11` against `consolidationPredicate.test.js` **(new)** |
| AT-P6's *Then* is "the consumed pair is still appended, empty, before any other record" (`FSPEC:2119`) | **Exact**, verbatim |
| AT-P10's *Then* names the §10.4 report explicitly (`FSPEC:2123`) | **Exact**, and the FSPEC row itself says the report assertion "is the one this row exists for" — which strengthens the erratum rather than weakening it |
| `classifyCorpus` is declared pure and returns `basenameCollisions` without appending or rendering (`TSPEC:674`, `:750-770`) | **Exact.** `TSPEC:674` is `classifyCorpus(files, logText): Predicate // pure`; `:762` records collisions as a returned field. Neither *Then* is reachable at that subject, so keeping the two properties at L2 is the correct call and the register is what is wrong |
| The fixtures directory exists and is tracked at HEAD (§4.3) | **Exact.** 36 tracked files, including `completeness/`, `covered-violations/` and `digest-vectors.js`; not ignored |
| `PLAN:307` names only the parity test in T04's ownership row | **Exact** — the manifest half of erratum 3 stands |
| PLAN T20's `T31` block closes its unregistered list at (i) (`PLAN:264`); PLAN T23 declares two cases, no register id (`PLAN:267`) | **Exact** on both, so erratum 7's premise holds: no PLAN block declares AC-1.4's no-op pass |
| "The id set is unchanged at 118" (changelog `:25`) | **Exact.** Distinct `PROP-*` ids at HEAD = 118, and the symmetric difference against `d090ef08`'s blob is empty — nothing renamed, added or dropped while three sections were rewritten |
| §12.3's union rule: the only two task rows exceeding their file's §12.2 green list are `T24 → T26/T29/T31` (T26 from PROP-MRG-03) and `T15 → T26/T28/T31` (T28 from PROP-ID-03) | **Exact, and set-equal rather than merely containing.** I extracted both tables mechanically and differenced them: those two rows are the *only* two with a §12.3 green absent from the matching §12.2 row. PROP-MRG-03's trailer reads `T15/T24 → T26` with `consolidationIdentity.test.js` as its fold home (`:638-640`), and PROP-ID-03's reads `T15/T21 → T26/T28` across identity and route (`:590-591`) — both attributions are the right way round |
| "Every other row in this table is read from PLAN §4 directly" (§12.2 preamble) | **Holds on spot-check of the rows most likely to falsify it**: the `helpers/consolidationDoubles.js` row traces to PLAN T01 (`PLAN:246`, `:304`) and the `runtimeBundle.test.js` row to PLAN T13 (`PLAN:257`, `:316`) — the two rows that are not new RED suites are still PLAN-sourced |

## 3. Findings

None. No High, Medium or Low finding is open against this document.

The two defects that remain true of the tree are **upstream**, in TSPEC §12.3 / PLAN T14 and in
PLAN T20's block text, and this document handles them correctly for its own layer: it declines to
absorb them, routes each as a §13.3 erratum with both halves named, and marks the affected cells as
pending rather than asserting an invariant it cannot honour. That is the behaviour the erratum
mechanism exists for, so it is not a finding against PROPERTIES. Both are re-emitted as ERRATUM
lines in my response so the orchestrator routes them to the owning authors.

I also checked the revision against the three oracle-quality bars, since the new text touches
oracle-bearing tables:

- **No implementation echoes.** The new prose adds no expected value derived from code. §12.4's
  AT-P cell and errata 6/7 quote FSPEC *Then* text and TSPEC declarations as literals with
  file:line, which is transcription from spec, not derivation from the subject.
- **No absence-only oracles.** Erratum 7's disclosure does not weaken PROP-PASS-11: the property
  still pairs its negative arm (no PR, no proposal file) with the positive one (terminal `no-op`,
  consumed pair written, the `unmeasurable` streak advancing) on the same path (`:1360-1367`).
- **Completeness by set-equality.** §12.3's new union rule is itself stated as a set-equality claim
  ("a §12.3 green absent from the matching §12.2 row must be traceable to a named spanning
  property"), and it survives the mechanical difference of the two tables — exactly two exceptions,
  both named. A third undeclared exception would have falsified the sentence; there is none.

## 4. Questions

| ID | Question |
|----|---------|
| Q-01 | My v3 Q-02 stands unanswered and stays non-gating: PROP-PR-10(b)'s "still on remote" (`:1213`) is in an unchanged section, so the delta protocol keeps me out of it. If it is ever revisited, one clause naming the observable — the `_git` double's recorded verb pair, `push` issued and `delete-branch` not — would spare the implementer looking for a seam that cannot see remote state. Not owed in this round. |

## 5. Positive Observations

- **The fix chose disclosure over convenience, and the harder half was the right one.** The cheap
  way to close F-01 was to re-home PROP-COR-10/11 onto `consolidationPredicate.test.js` and make
  §12.4's sentence true again. That would have put two properties in a file whose subject cannot
  observe their *Then*s — green tables, dead oracles. Instead the document kept the properties where
  they are assertable, said plainly that the invariant does not yet hold for two ids, and routed the
  register correction upstream with both halves named. A spec that tells you which of its own claims
  is pending is worth more than one that is uniformly confident.
- **Erratum 7 sharpened the finding I filed rather than merely accepting it.** I reported that
  PROP-PASS-11 lands in a file PLAN's block text excludes. The document went further and checked
  whether the v1.2 re-home caused it: it did not — no PLAN block ever declared AC-1.4's no-op case,
  and the previous (wrong) home merely hid the gap. That distinction changes who owes the fix, and
  it is the kind of thing an author only finds by re-reading upstream instead of patching locally.
- **§12.3's union rule turns a table into a checkable oracle.** Before this revision, a §12.3 green
  that exceeded its §12.2 row was indistinguishable from re-derivation residue — a reviewer had to
  guess. The new paragraph states the rule, names both exceptions, and attributes each to a specific
  spanning property. I differenced the two tables mechanically and found exactly those two. A future
  round can now re-run that check in seconds instead of re-reading 120 trailers.
- **Three sections rewritten, 118 ids untouched.** The symmetric difference against the previous
  blob is empty. Revisions that rewrite summary tables usually renumber something by accident; this
  one has now survived a re-home (round 3) and a disclosure pass (round 4) without moving an id.

## 6. Recommendation

**Approved**

The single High from round 3 is closed, and closed by routing rather than by weakening the
document: AT-P6 and AT-P10 stay at L2 where their conjuncts are observable, §12.4 no longer claims
an invariant that two ids violate, and §13.3 erratum 6 carries both halves of the upstream
correction with citations I verified exactly at HEAD. Both Mediums are closed too — the false
fixtures-directory claim is replaced by the measured fact, and PROP-PASS-11's placement is disclosed
as judgment pending erratum 7. The new text introduced no new claim I could falsify: every
citation checked out, the id set is unchanged, and the §12.3 union rule holds by set-equality rather
than by containment.

Nothing is owed from this document. The two open defects belong to TSPEC §12.3 / PLAN T14 and
PLAN T20, and travel as errata 6 and 7; PROPERTIES has already recorded both, so approving here does
not bless the upstream text — it accepts a layer that named its own limits accurately.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:8c8a4024ae87d944e105e9dad771c7dc1469fa006fdbd922beb065921466e4ac
REVIEWED-COMMIT: c568c4c3e1404bc9425ca6ee3003bb8e92fc01b0
