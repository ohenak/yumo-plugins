# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 8
**Scope:** Delta re-review of v1.7 (`c48e0b2f..HEAD`), against v7's F-01 and F-02.
Product lens only.

## Method

Delta protocol. `git diff c48e0b2f..HEAD` on the document is **46 insertions / 14 deletions** in four
commits (`06b09fea`, `4fdc13e6`, `f06327af`, `d1862bd9`), touching five regions: the v1.7
changelog (`:16-30`), PROP-COR-09's AT-K3b trailer (`:458-466`), the Sources line's register
count (`:111-112`), PROP-TRC-01's pin and measurement (`:1639-1655`), §11's file table row
(`:1804`) and §12.4's preamble and AT-K row (`:1871-1885`). No property added, removed or
renumbered. I re-verified the two prior findings and read only the changed regions for new issues.

I grounded the revision's factual claims against the repository rather than against the changelog:

- **FSPEC `Version` reads `11.7`** (`FSPEC:13`) and **TSPEC's reads `2.7`** (`TSPEC:13`) — the
  re-pin in conjunct 1 matches HEAD.
- **The register measures 100.** Enumerating de-duplicated `AT-…` ids over `FSPEC:2116-2267` gives
  exactly **100**, and `AT-K3b` is in range — so the 99 → 100 re-measurement and the stated one-id
  delta are both true.
- **AT-K3b's row is what PROP-COR-09 says it is.** `FSPEC:2210` carries the all-unreadable Given and
  the four Then-conjuncts including *"no `CONSOLIDATION-PROPOSAL-*.md` for that `passId`"*.
- **Erratum 8 is genuinely unlanded.** `grep AT-K3b` over TSPEC and PLAN returns **nothing**, and
  `TSPEC:2929`'s credential row lists `AT-K1…AT-K7` only, while `TSPEC:2923`'s pass row records its
  unreadable-corpus case as claiming **no** register id. PROP-TRC-01's "short exactly one id"
  diagnosis is correct, not defensive hedging.
- **The seam facts behind the new conjunct.** TSPEC's call tree routes the consuming-repo write to
  **`_appendFile`** and the proposal file to **`_writeFile`** (`TSPEC:396-397`) — two different
  seams — and `_writeFile` fires on any marker-holding pass at step 16 (`TSPEC:2148`).

## Verification of v7's findings

**F-02 (Medium) fully resolved.** PROP-TRC-01 is re-pinned to `11.7` / `2.7`, the measurement of
record re-taken to 100 with the delta named, and the green-on-write claim correctly qualified as
conditional on erratum 8 (`:1639-1655`). The revision went past what I asked: it adds the
**pin-and-measurement contract** (*"both are re-taken whenever §12.4 re-measures, so the pin can
never certify a count it did not produce"*), which is the rule that stops this exact drift recurring
rather than just clearing this instance of it. §11's file table row (`:1804`) and §12.4's AT-K row
were updated in the same revision, so the three places a reader could learn T05's status now agree.

**F-01 (High) resolved as to placement — the conjunct now rests on AT-K3b's Given.** The delegation
sentence is deleted, and the fourth conjunct is asserted on PROP-COR-09's own all-unreadable fixture
(`:458-462`). The reasoning I asked for is on the page: PROP-RTE-06(b)'s Given is the
duplicate-suppressed pass (AC-1.4's *second* cause), so it cannot witness the obligation on the third
cause's Given. That is the right resolution and it is argued from the causes, not asserted.

The **form** the new conjunct takes, however, is a new defect in new text — F-01 below.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **AT-K3b's fourth conjunct is written as a bare absence over `_writeFile`, the one oracle form §7's O-1 exists to forbid, and no positive on that seam is named.** The new text (`:459-461`) reads: *"through the write double's recorded path set: the set of paths the double was asked to write **contains no** `docs/_decisions/CONSOLIDATION-PROPOSAL-*.md` bearing this pass's `passId`."* That is a containment-of-absence assertion, and the fixture's other conjuncts do not pair it: terminal `no-op` and `\|un-consolidated\| = 2` are the returned report, and the *"consumed pair appended empty"* conjunct rides **`_appendFile`** — a **different seam** from the proposal file's **`_writeFile`** (`TSPEC:396-397`). So nothing on the `_writeFile` path is positively observed, and a `_writeFile` double that records nothing at all — never wired, or wired to the wrong recorder — greens this conjunct on a fixture that looks busy. This is precisely the failure O-1 names at `:286-288` (*"satisfied vacuously by a pass that did nothing… Every such property here pairs the absence with a positive observed on the same run"*), and every one of O-1's five bullets names its positive; this one names none. The document already owns the fix pattern: PROP-MRK-04 is *"asserted positively"* (`:1018`) and O-1 records why — AT-M5's absence is stated as **set-equality of the observed pathspec set to the §5.4 write set, not as an absence** (`:292-293`). The same move is available here and is strictly stronger, because `_writeFile` **is** exercised on this pass: `takeMarker` writes it (§7.3) and step 16's `releaseMarker` is *"`_writeFile` only"* (`TSPEC:2148`). **Fix (T20, one sentence):** state the conjunct as set-equality of the `_writeFile` recorded path set to the expected write set for an all-unreadable pass — the marker take and release paths, and **nothing under `docs/_decisions/`** — so a dead recorder fails on the marker paths' absence before the proposal file's absence can green it. | AC-1.4 (third cause), AT-K3b (`FSPEC:2210`), O-1 (`:286-302`), O-2 (`:304`) |
| F-02 | Medium | Local | **O-1's enumeration of absence-paired oracles was not extended to PROP-COR-09, so the register that governs this defect class no longer lists all of its members.** §7 O-1 (`:290-302`) is a five-bullet roll of every absence assertion in the document and the positive each is paired with. Its AT-R7 bullet (`:294-296`) still reads *"AT-R7's 'no proposal file' negatives (a `promoted` pass, an all-suppressed `no-op` pass) sit in one case beside a positive control… — §7, PROP-RTE-06"*, naming **two** negatives and crediting PROP-RTE-06 as the sole carrier. As of v1.7 there is a **third** "no proposal file" negative, on a third cause, in a different file (`consolidationPass.test.js`), and the roll does not know about it. This is the same enumeration-rot the v1.6 revision was careful to avoid when it removed PROP-COR-09 from the `(no FSPEC AT)` roll in the same edit that added it elsewhere — an enumeration edited in one direction only. Not gating on its own: no AC loses a carrier, and the reader who reaches PROP-COR-09 directly gets the conjunct. But it is the list a future reviewer greps to audit this exact class, so it should carry the new member. **Fix:** add a bullet (or extend the AT-R7 one) naming PROP-COR-09's all-unreadable negative and, once F-01 lands, the set-equality it is paired with. | NFR-5, O-1 (`:290-302`) |
| F-03 | Low | Local | **PROP-RTE-06's sentence is presented as a verbatim quote but is not one.** `:464-465` quotes *"§5.3 decides on causes, not on terminal status"* in quotation marks with a `:1082` citation; the text at `:1082` actually reads *"§5.3 decides on causes **rather than** on terminal status"*. The citation line is right and the meaning is preserved exactly — this is a transcription slip, not a misreading. It matters only because this document's own convention is that a quoted upstream oracle is transcribed literally so a reader can diff it without opening the source; the same slip in an AC transcription would be a real defect. **Fix:** match the source wording, or drop the quote marks and paraphrase openly. | Local |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's fix needs the expected `_writeFile` write set for an all-unreadable pass. I read it as exactly the marker take and the marker release (`TSPEC:2148` step 16, §7.3), with no `docs/_decisions/` member and no consuming-repo member (that write is `_appendFile`). If a `refused`-adjacent path or the `no-op` branch skips the release — step 16 is guarded by `if (state.markerHeld)` — the expected set is conditional on the fixture holding the marker, which it should state. Confirm the set when writing the conjunct, so the equality is pinned to what this Given actually writes rather than to a general pass. |

## Positive Observations

- **The delegation was withdrawn on the argument, not just deleted.** The revision could have quietly
  moved the conjunct and left it there. Instead `:462-465` records *why* PROP-RTE-06(b) cannot carry
  it — its Given is AC-1.4's second cause — and cites PROP-RTE-06's own body against the
  shared-terminal-status bridge. A later reader who wonders whether the two `no-op`s could share a
  fixture finds the answer already reasoned, which is what stops this being re-proposed in six months.
- **The pin-and-measurement contract is the durable half of F-02's fix.** Re-pinning to 11.7 / 2.7
  cleared the instance; *"both are re-taken whenever §12.4 re-measures, so the pin can never certify a
  count it did not produce"* (`:1645-1647`) clears the class. That is a rule an implementer can
  follow without having read this review thread, and it is the kind of fix I would rather see than a
  corrected number.
- **T05's expected red is now diagnosable from three directions.** §11's file table (`:1804`), §12.4's
  AT-K row and PROP-TRC-01's body all say the same thing: short exactly `AT-K3b`, clears when erratum
  8 lands, *"the routed erratum, not a parser defect"*. An implementer hitting a red at T05 cannot
  reasonably conclude the parser is broken. The AT-K row also pre-empts the obvious objection by
  distinguishing this from the "permanently-red block" §12.3 forbids — it clears when the erratum does.
- **The one-id delta is still named rather than absorbed.** §12.4 re-based to 100 but kept the
  *"one id added since the 2026-08-06 measurement of 99"* framing (`:1871-1875`), so a reader
  re-measuring against a moved register still sees the known delta instead of an unexplained
  off-by-one. Both counts are correct against HEAD; I verified 100 independently.
- **Erratum discipline held.** Errata 8 and 9 route upstream unchanged and no new erratum was raised
  to paper over the AT-K3b registration gap — the document absorbed what was its own to fix and left
  the TSPEC/PLAN registration where it belongs.

## Recommendation

**Needs revision**

One High finding, and I want to be precise about what it is and is not. Both v7 findings are
genuinely closed: the AT-K3b conjunct now rests on AT-K3b's own Given with the causal argument
written down, and PROP-TRC-01's pin, measurement and green-on-write claim are re-based and correct
against HEAD. I re-verified every factual claim the revision makes — the version cells, the 100-id
count, AT-K3b's row text, and erratum 8's unlanded state — and they all hold.

The blocker is a defect the revision **introduced** in new text: in moving the fourth conjunct onto
the right fixture, it wrote it as a bare absence over `_writeFile` with no positive observed on that
seam. The fixture's visible positives ride the report and `_appendFile`, which are different paths,
so a `_writeFile` double that records nothing greens AT-K3b's fourth conjunct on the register row's
only carrier. §7's O-1 forbids exactly this shape, and the document already ships the remedy in
PROP-MRK-04.

To close:

1. Restate PROP-COR-09's proposal-file conjunct as **set-equality of the observed `_writeFile` path
   set** to that pass's expected write set (marker take and release; nothing under
   `docs/_decisions/`), per O-1's PROP-MRK-04 precedent — see Q-01 for the set.
2. Add PROP-COR-09's negative to O-1's roll at `:290-302`, so the absence-oracle register lists all
   its members (Medium; not gating).
3. Fix the `:464` quotation to match `:1082`'s wording (Low; not gating).

No new errata. Errata 8 and 9 remain correctly routed upstream and are not this document's to fix.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
