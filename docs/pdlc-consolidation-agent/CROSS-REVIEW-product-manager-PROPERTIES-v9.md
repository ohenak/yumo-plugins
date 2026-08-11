# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 9
**Scope:** Delta re-review of v1.8 (`d1862bd9..HEAD`), against v8's F-01, F-02 and F-03.
Product lens only.

## Method

Delta protocol. `git diff d1862bd9..HEAD` on the document is **46 insertions, 5 deletions** across
four commits (`f23ceb71`, `95ce4bc8`, `e7e91c8b`, `3c1d6853`), touching four regions: the v1.8
changelog (`:16-31`), §7's O-1 roll (`:313-317`), PROP-COR-09's AT-K3b conjunct (`:478-499`) and
PROP-TRC-01's §10.4 body (`:1683-1689`). No property added, removed or renumbered — the set stays
118. I re-verified my three prior findings, then scanned only the changed regions.

I grounded every factual claim the new text makes rather than reading it for plausibility:

- **The write-set equality's expected set is right, and it is complete.** `_writeFile` has exactly
  three call sites in the design — `takeMarker` (`TSPEC:381`), the proposal file (`TSPEC:397`,
  §7.9 `renderProposalFile`) and the in-clone write on the PR route (`TSPEC:1923`). On an
  all-unreadable `no-op` Given there is nothing to promote, so neither the proposal file nor the PR
  route is reached, and `{docs/_decisions/.consolidation-lock}` is the whole set. The log row and
  the consuming-repo write go through `_appendFile` (`TSPEC:396`), a different double.
- **Non-empty by construction holds.** `TSPEC:2853` carries FSPEC §4.3's six-member closed release
  enumeration, and `no-op` is one of the four statuses that take **and** release. Take is
  `_checkFile → _readFile → _writeFile` (`TSPEC:1329`), release is *"`_writeFile` only"*
  (`TSPEC:2148`). Both cited lines say what the document says they say.
- **The marker path literal is exact.** `docs/_decisions/.consolidation-lock` (`TSPEC:331`, `:339`).
- **AT-K3b's Then is transcribed, not paraphrased.** `FSPEC:2210` reads *"no
  `CONSOLIDATION-PROPOSAL-*.md` exists for that `passId`"* — the obligation the equality now
  discharges as a consequence.
- **The PLAN T05 divergence §10.4 records is real, all four parts.** `PLAN:351` pins FSPEC `11.5` /
  TSPEC `2.0`, measures over `FSPEC:2089-2239`, expects **99**, and closes *"the case is green the
  moment it is written"*. HEAD is FSPEC v11.7 (`FSPEC:13`) and TSPEC v2.7 (`TSPEC:13`), and
  enumerating `AT-…` over `FSPEC:2116-2267` de-duplicated gives **100** — I re-measured
  independently. `PLAN:123-128` restates the superseded 99.

**F-01 (High) is resolved, and resolved on the merits.** The conjunct is now a set equality over the
write double's recorded path set against `{marker path}` (`:478-484`), with the positive half made
load-bearing by an argument that a `no-op` takes and releases (`:487-493`). This is exactly the
PROP-MRK-04 shape O-1 sanctions, one channel over. A dead write recorder now reds on the equality
instead of greening an absence. Both reviewers' Q-01 is answered inside the body rather than in a
review thread — the anchor is the marker path, the oracle is over the **path** set so take and
release collapse to one member, and it is explicitly *not* "nothing under `docs/_decisions/`", where
the marker itself lives (`:494-497`).

**F-02 (Medium) is resolved.** O-1's roll gains a PROP-COR-09 bullet (`:313-317`), so the
absence-oracle register lists its members again.

**F-03 (Low) is resolved in substance.** The quotation at `:498-499` now reads *"decides on causes
rather than on terminal status"*, matching the source wording exactly.

The revision did not break any oracle. What it did break is its own locators, and it left one
upstream defect named but unrouted — F-01 and F-02 below.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **Both same-file locators in the new PROP-COR-09 text were correct before this revision and are stale after it — broken by the revision's own insertions, and neither was re-taken.** `:482` cites *"PROP-MRK-04's precedent at `:1018`"*; at `d1862bd9` line 1018 was exactly PROP-MRK-04's opening line, and at HEAD PROP-MRK-04 is at **`:1053`** while `:1018` lands mid-§7.1 in PROP-MRK-01's trailer. `:499` cites the causes-not-terminal-status sentence at `:1082`; at `d1862bd9` that was exact, and at HEAD the sentence is at **`:1117`** while `:1082` lands inside **PROP-RTE-04**'s colliding-subjects conjunct — an unrelated property, which is the actively misleading case, since a reader who follows it finds prose that parses and concludes the citation resolved. The cause is arithmetic, not carelessness: this revision inserted 16 changelog lines above both anchors and ~21 more in §7 and PROP-COR-09, and the two references shifted by exactly that. The same class touches the new O-1 bullet, whose `:458-476` range (`:316`) covers PROP-COR-09's opening but **stops two lines before** the set-equality text it is citing as the reference — that material runs `:478-499`. This matters here more than it would elsewhere: PROP-TRC-01 exists in this very document because stale pins are a known failure class on this feature, and the pin-and-measurement contract v1.7 added (`:1689-1691`) is the same discipline applied one layer up. **Fix:** re-take the three locators — `:1018` → `:1053`, `:1082` → `:1117`, `:458-476` → `:459-499` — and re-take same-file locators whenever a section above them grows, in the shape the pin-and-measurement contract already states for §12.4. | NFR-5, O-1 (`:305-322`), PROP-TRC-01 (`:1683-1691`) |
| F-02 | Medium | Process | **§10.4 names a four-part PLAN T05 defect, says the erratum channel is the remedy, and then does not use it; the changelog affirmatively closes the door.** The new text (`:1683-1689`) records that PLAN T05 still carries the superseded `11.5` / `2.0` pin, the `FSPEC:2089-2239` range, the **99** count and the unqualified *"the case is green the moment it is written"* — all four verified true at `PLAN:351` and restated at `PLAN:123-128` — and states *"That divergence is PLAN's to repair through the erratum channel, not this document's to fix"*. But §13.3's roll stops at erratum 9, and the v1.8 changelog says *"no new erratum is raised"* (`:31`). Erratum 8 does not cover this: it routes AT-K3b's **registration** into TSPEC §12.3/§12.4 and PLAN **T20** (`:1926`), a different row and a different defect. So the document has correctly diagnosed an upstream defect and correctly identified the channel, then routed it nowhere — the finding lives only in a §10.4 aside that PLAN's author has no reason to read. Naming the channel and not using it is weaker than either using it or staying silent, because it reads as routed. **Fix:** add the T05 divergence to §13.3 as erratum 10 (all four parts, with the HEAD measurements as evidence), and drop *"no new erratum is raised"* from the v1.8 changelog. I am also emitting it as an `ERRATUM: PLAN` line in this review's hand-off so the routing does not depend on the next revision. | AC-1.4, §13.3 (`:1994-1997`), PLAN T05 (`:351`) |
| F-03 | Low | Local | **The v1.8 changelog's *"no measurement re-taken"* is true of §12.4 but reads as global, and this revision did take one.** `:19` says *"no fixture added, and no measurement re-taken"*, while `:1683-1689` records a fresh comparison against `PLAN:351`'s four superseded values — a measurement of PLAN, not of the register. The intent is clear in context (§12.4's 100-id count is unchanged, which is correct) and nothing downstream is misled, but the changelog is the one section a reader consults to decide whether re-verification is owed, and *"no measurement re-taken"* is the sentence that tells them it is not. **Fix:** qualify it — *"no §12.4 measurement re-taken"* — so the PLAN comparison the same revision performed is not disclaimed by its own summary. | Local |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None blocking. One for the record, since it is the only way the new equality could later go wrong: the expected set is `{marker path}` **on this Given**, and it is complete only because an all-unreadable corpus reaches neither §7.9's proposal file (`TSPEC:397`) nor §9's in-clone write (`TSPEC:1923`). If a later erratum gives the all-unreadable branch any additional write — a report file, a degraded-route artifact — the expected set changes with it and the conjunct reds correctly but for the wrong reason. Worth a half-sentence in the property saying the set is closed *by the Given*, not by `_writeFile` having one call site. |

## Positive Observations

- **F-01 was closed by argument, not by restatement.** The fix does not merely swap "contains no" for
  "set-equal to"; it carries the reason the positive half is load-bearing — a `no-op` takes and
  releases, so the expected set is non-empty **by construction** and a never-exercised write seam
  reds. That is the difference between an oracle that satisfies O-1's letter and one that satisfies
  its purpose, and it is written where the next implementer will hit it.
- **Both reviewers' Q-01 was answered in the document rather than in the thread.** The path-vs-count
  distinction (take and release make two writes to one path, so the oracle is over the path set) and
  the explicit rejection of *"nothing under `docs/_decisions/`"* are precisely the two ways an
  implementer would have got this wrong, and both are now pre-empted in the body (`:494-497`). Review
  threads evaporate; this does not.
- **O-1's register is a register again.** The added bullet (`:313-317`) names PROP-COR-09, states the
  shape, and says what makes it non-vacuous. The class §7 governs now lists its members, so the next
  reviewer auditing absence-paired oracles greps one place and finds all of them.
- **The PLAN T05 divergence was diagnosed correctly and completely.** All four superseded values are
  right, the framing — *"written down only so an implementer who builds T05 from PLAN reds on the
  version pin and knows why"* — is exactly the right service to the implementer, and the refusal to
  fix PLAN from this layer is the correct instinct. My F-02 is about the last mile only; the
  diagnosis itself is the strongest work in this revision.
- **Erratum discipline otherwise held.** Errata 8 and 9 are unchanged and still route upstream, and
  nothing was folded downward to make this document look clean.

## Recommendation

**Approved with minor changes**

v8's blocking finding is closed. AT-K3b's fourth conjunct is now a set equality over the write
double's recorded path set whose expected value is a literal transcription from FSPEC and TSPEC,
never derived from the code under test; its positive half is non-empty by construction, so the
oracle cannot green vacuously; and the enumeration is an equality rather than containment, so a
deleted member reds. All three of the review bars for this phase are met on the changed text, and I
verified the design claims underneath it — `_writeFile`'s call sites, the six-member release table,
the marker path literal, AT-K3b's Then, and the 100-id register — against TSPEC, FSPEC and PLAN at
HEAD rather than taking the document's word.

Nothing here blocks. Three things to close in the next pass, none gating:

1. Re-take the three stale same-file locators this revision's own insertions shifted — `:1018` →
   `:1053`, `:1082` → `:1117`, `:458-476` → `:459-499` (F-01, Medium).
2. Route the PLAN T05 divergence as §13.3 erratum 10 rather than leaving it named-but-unrouted in a
   §10.4 aside, and drop the changelog's *"no new erratum is raised"* (F-02, Medium). I emit it as an
   `ERRATUM: PLAN` line below so the routing happens regardless.
3. Qualify the changelog's *"no measurement re-taken"* to *"no §12.4 measurement re-taken"* (F-03,
   Low).

One new erratum, raised here rather than folded into this document. Errata 8 and 9 remain routed
upstream and are not this document's to fix.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:b4ad69f2b45ca5f409f4dfe45d52913ae72eae01d137bcb0ac0a9ec1eeac1954
REVIEWED-COMMIT: 3c1d68538b9501afdf3ad754a0aa51f4d548c84d
