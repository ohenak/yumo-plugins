# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (Version 1.0)
**Date:** 2026-08-28
**Iteration:** 1

Reviewed through the testing lens only: are the recorded decisions falsifiable, are their
re-evaluation triggers observable, and do the obligations this document creates for PROPERTIES and
PLAN describe assertions that can actually fail? Every claim about existing code below was executed
against HEAD on `feat-pdlc-decision-ledger`, not read from the document.

The design work here is strong and the anti-false-green instincts are the right ones (see
**Positive Observations**). The gating problem is not design: it is that this document was written
against a **superseded upstream**. REQ is at **v1.8** and Baseline at **v1.2**; this document pins
Baseline **v1.1** and reasons throughout at a `maxBytes` default of **8000** that REQ v1.8 has
already replaced with **12500**. That makes four recorded rationales and two re-evaluation triggers
unfalsifiable or already-fired.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **DEC-DECLEDGER-15's premise no longer exists upstream, and its re-evaluation trigger has already fired.** The decision rejects "positive-integer validators, *as REQ C-5's type label reads*" (L207) and records "*Rejected: edit the REQ to match.* The type label is REQ-owned; it is routed as an erratum instead" (L212). REQ is at v1.8 and C-5 now reads **non-negative** for both thresholds — `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md:172-173` ("non-negative integer" in both rows), with the v1.8 erratum note at REQ:22-24 stating the retype and its reason. The gap this decision claims to span is closed. Consequently the trigger "REQ C-5's type label is corrected upstream, closing the gap this decision currently spans" (L261) names a transition that has already happened: no test and no monitor can observe it, because there is no future edge to detect. A re-evaluation trigger that cannot fire is not a trigger. Restate DEC-DECLEDGER-15 as a *ratified* alignment with REQ v1.8 (citing REQ C-5's now-shipped non-negative type and FSPEC E-7 as agreeing), and either retire the L261 trigger row or replace it with one that can still fire | § Options `DEC-DECLEDGER-15` (L205–212); § Consequences → Re-evaluation triggers (L261) |
| F-02 | High | Local | **The Baseline version pin is stale, and the document's own "one site" guarantee is what failed.** The header pins `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.1** (L12); the file at HEAD is **v1.2 · 2026-08-28** (`docs/_constraints/pdlc-decision-corpus-baseline.md:7`), and REQ v1.8 pins **v1.2** (`REQ-pdlc-decision-ledger.md:15`). v1.2 is not a cosmetic bump: it adds the `M-7` block — `M-7a` (41 project-level records = **5,262** substance bytes), `M-7b` (worst standing case **9,296** over 63 records), `M-7c` (a **12,500** cap clears M-7b by 3,204; **8,000 sits below M-7b and drops lines on day one**) — which is now the measured authority every byte decision in this document depends on. `M-7` is cited **nowhere** here. This matters for testability specifically because L53–55 promises "Measurements are cited, never restated … so a re-measurement moves one site": a re-measurement *has* occurred (v1.1 → v1.2, commit `efbf3dad9`) and did **not** move this site. The mechanism the document offers as its protection against stale expected values is demonstrably not load-bearing. Re-pin to v1.2 and cite `M-7a`/`M-7b`/`M-7c` by id wherever byte reasoning occurs | Header table (L12); § Context (L53–55) |
| F-03 | High | Local | **Two byte-arithmetic rationales and one numeric re-evaluation trigger are computed at a default REQ no longer ships.** REQ C-5's `maxBytes` default is **`12500`** (`REQ-pdlc-decision-ledger.md:172`, "Measured, not analogised", derived from `M-7b`/`M-7c`; REQ:23-24 explicitly retires `8000` as "an unmeasured `learningsInjection` analogy, falsified by measurement"). This document reasons at `8000 − 1200 = 6,800` throughout: "§3.6's ~495 bytes of headroom shrink one-for-one with any raise" (L181–182), "6,305 bytes against a 6,800-byte allowance" (L192), "what admits the promoted set whole today is ~495 bytes of measured headroom — **about three** more promoted decisions" (L188–190). At the shipped 12,500 the line allowance is **11,300** and project-level headroom is **~4,995**, so the binding limit on project-level growth is no longer bytes at all but `maxEntries` (70 − 41 = **29** more records). The concrete consequence is the trigger at L256: "`docs/_decisions/` passes **~44** promoted records — at which point the measured headroom is spent". Built as written, a monitor watching for 44 fires roughly **26 records early**, on a condition that is not the one the design cares about. This is the DECISIONS-lens failure mode directly: the trigger is observable but observes the wrong quantity. Note the blast radius is bounded — see **Positive Observations** on DEC-DECLEDGER-13, whose oracle survives the change — so this is prose and triggers, not the mechanism | § Options `DEC-DECLEDGER-12` (L179–183), `DEC-DECLEDGER-13` (L187–194); § Re-evaluation triggers (L256) |
| F-04 | High | Local | **The open-errata enumeration fails a set-equality check against its own cited upstream.** L273–275 states "**Two errata are open** against upstream documents and are the TSPEC's to carry (`ERR-1`…`ERR-4`, §9.2); DEC-DECLEDGER-14 and DEC-DECLEDGER-15 are the design-side halves of two of them." TSPEC §9.2 holds exactly four errata — `ERR-1`, `ERR-2`, `ERR-3`, `ERR-4` (`TSPEC-pdlc-decision-ledger.md:1293,1302,1332,1341`) — so the enumeration `ERR-1…ERR-4` is the **whole** set, not the open subset, while the count word says two. Worse, the two that are closed are `ERR-1` (positive → non-negative) and `ERR-2` (`maxBytes` 8000 → 12500), both landed by REQ v1.8 (REQ:22-24); the genuinely open set is **{ERR-3, ERR-4}**, both FSPEC-owned. So the sentence pairs `DEC-DECLEDGER-15` with the **closed** `ERR-1` as a live "design-side half". A reader routing errata from this row routes two resolved items and misses neither of the open ones by luck rather than by construction. State the open set by explicit id (`ERR-3`, `ERR-4`), and record `ERR-1`/`ERR-2` as resolved-upstream with the resolution cited | § Consequences → Risks accepted (L273–277) |
| F-05 | Medium | Cross-Feature | **DEC-DECLEDGER-09's only falsifier is an oracle another feature owns, and no obligation row asks for a feature-owned one.** The decision's enforcement story is entirely PROP-DIS-06 — L230 ("reverting reddens PROP-DIS-06 immediately") and L142 (landing inside the sentinel region "would leave DEC-DECLEDGER-09's destructured-read discipline with no oracle behind it"). I confirmed the mechanism is real: `pdlc/workflows/__tests__/advisoryDisabled.test.js` slices the sentinel region and asserts the surviving `/\.enabled\b/` count `toHaveLength(3)`, and this feature's differently-named sentinels are indeed invisible to that slicer. But PROP-DIS-06 pins an **exact count owned by `pdlc-advisory-wave-gate`/`pdlc-learnings-injection`**. Any legitimate future change to *those* features re-baselines the literal `3`, and this feature's destructured-read discipline silently loses its falsifier with every test still green — the borrowed-oracle shape. The Consequences table makes the destructured read a **PLAN** task requirement (L246) but creates no **PROPERTIES** obligation for a feature-owned positive assertion (e.g. that the ledger gate's flag read is destructured and compared `=== true`, asserted over this feature's own source region). Add that obligation row; the borrowed count pin is a useful second line, not the primary one | § Options `DEC-DECLEDGER-09` (L145–154); § Decision row `DEC-DECLEDGER-09` (L230); § Consequences (L246) |
| F-06 | Low | Process | **A raw line-range anchor is off by one and is not covered by DEC-DOC-01's exemption.** L33 cites `sourceExcludingParser` as slicing "between the literals `// === LEARNINGS INJECTION REGION START ===` and `... END ===` (**lines 717–719**)". At HEAD those two literals are on **718–719**; 717 is the `function sourceExcludingParser(source) {` signature. DEC-DOC-01 permits a raw `file:line` anchor where the position itself is the claim under test — but nothing asserts these line numbers, so this is an ordinary citation that will drift on the next edit to that file. Cite the two sentinel literals by content (they are already quoted verbatim, which is sufficient) and drop the range | § Context, envelope constraint 3 (L33) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | With `maxBytes` at 12,500 and `maxEntries` at 70, over the 141-record frozen fixture the **entry** bound binds long before the byte bound (141 → 70). Is `maxEntries` now the mechanism DEC-DECLEDGER-03's order is actually exercised through at shipped defaults, and if so should §7.5's prefix conjunct be stated against the entry bound rather than (or as well as) the byte bound? The order is falsifiable either way; I want the recorded rationale to name the bound that fires. |
| Q-02 | DEC-DECLEDGER-12 fixes the framing budget at ≤1,200 bytes and DEC-DECLEDGER-07 charges framing to `maxBytes`. With ~4,995 bytes of project-level headroom at the shipped default, is 1,200 still the right budget, or was it sized against the 6,800-byte allowance? I am not arguing to raise it — a tight budget is a good forcing function — but L180's justification ("it is not free — §3.6's ~495 bytes of headroom shrink one-for-one") is the wrong reason for it now, and the drafting task at L245 inherits that reason as its acceptance rationale. |
| Q-03 | DEC-DECLEDGER-13's pin is stated "at the Baseline's commit". The Baseline's `Verified at` is HEAD `8c673a09f` on this branch, and the frozen fixture is captured separately. Which of the two is the pin's provenance, and is there an assertion that they agree? If the fixture is captured at a different commit than the Baseline's `Verified at`, the transcribed 41 ids / 6,305 bytes are pinned to one artifact and justified by another. |

## Positive Observations

- **The anti-echo discipline is stated where it binds, not as a slogan.** DEC-DECLEDGER-13's
  Consequences row (L248) requires 41 and 6,305 to be "transcribed as expected values, **never
  captured from the renderer**", and DEC-DECLEDGER-11's row (L249) requires the bounds property's
  model to use its **own** formatter because "deriving the model from the production renderer makes
  the no-truncation conjunct unfalsifiable". That is exactly the right instinct, applied to the two
  places it would actually have been violated.
- **DEC-DECLEDGER-13 correctly refuses a vacuous-green oracle, and the refusal survives the
  upstream change.** I checked whether raising `maxBytes` to 12,500 would hollow out the non-empty
  `omitted[]` conjunct, and it does not: TSPEC §7.3 builds the block over the **whole** 141-record
  fixture, so `maxEntries` 70 alone forces ≥71 omissions at any byte bound. The conjunct still does
  work and still reddens under a reversed drop order. F-03 is therefore about the headroom prose and
  the numeric trigger, **not** about this oracle — which is the part that mattered most.
- **DEC-DECLEDGER-02 demands the second conjunct that catches the precedence false green.** L78–80
  names cardinality-alone as "the textbook precedence false green" and L247 requires the positive
  `statement`/`sourcePath`/`origin` equality against the project-level record alongside it, over a
  constructed two-file fixture, because `M-5a` records no HEAD witness. Absence paired with a
  positive assertion on the same path — precisely the shape I would have demanded.
- **DEC-DECLEDGER-14 replaces a mutating test with a stronger falsifier rather than a weaker one.**
  Recognising that FSPEC AT-03's literal instruction contradicts AT-01's digest guard, and moving the
  variation to the scripted `_readFile` double, both resolves the contradiction and narrows what the
  test varies to exactly the bytes the injector reads. The upstream divergence is routed as an
  erratum instead of being left silent (L235).
- **Both enumerated contracts pass a set-equality check.** The 15 `### DEC-DECLEDGER-*` subsections
  are set-equal to the 15 rows of the Decision table, and the `D-` ids referenced (D-1…D-11) are
  set-equal to TSPEC §9.1's own D-1…D-11. Verified mechanically, not by eye.
- **The code citations that are load-bearing are accurate.** I executed every one: `MODULE_NAMES` at
  `pdlc/engine/scripts/prepack.mjs:20`, `parseLearningsConfig` (2252), `nonNegativeInt` (2283),
  `buildLearningsInjector` (2825), `findingGrammarPart` (11453), `pinCheckEnabled` destructured
  (15105) with its explanatory comment (9266), `_injectLearnings` (15186), `LEARNINGS_CORPUS_ARGV`
  (2230), and `scripts/capture-learnings-baseline.mjs`. All resolve. The `M-1a` re-execution claim
  (41 carriers, 41 distinct ids) matches the Baseline row verbatim. Nonexistent-authority citations
  have shipped on this feature family before; none here.

## Recommendation

**Needs revision**

Four High findings, all of one kind: the document is pinned to an upstream that has since moved
(REQ v1.8, Baseline v1.2), and the staleness has reached the parts of a DECISIONS document that are
supposed to outlive the feature — a rejected-alternative rationale whose premise is gone (F-01), two
re-evaluation triggers that either cannot fire or fire on the wrong number (F-01, F-03), and an
open-errata enumeration that routes resolved items (F-04). None of these are design defects; the
mechanism is sound and DEC-DECLEDGER-13's oracle survives the change intact. The revision is a
re-pin and a re-derivation, not a redesign:

1. Re-pin the header to Baseline **v1.2** and cite `M-7a`/`M-7b`/`M-7c` wherever byte reasoning
   occurs (F-02).
2. Re-derive the headroom prose in DEC-DECLEDGER-12 and DEC-DECLEDGER-13 at `maxBytes` **12,500**,
   and restate the L256 trigger against the bound that actually binds — `maxEntries`, not bytes
   (F-03, Q-01).
3. Restate DEC-DECLEDGER-15 as ratified alignment with REQ v1.8's shipped non-negative type, and
   retire or replace its already-fired trigger (F-01).
4. State the open erratum set as `{ERR-3, ERR-4}` by id, recording `ERR-1`/`ERR-2` as
   resolved upstream (F-04).
5. Add a PROPERTIES obligation row giving DEC-DECLEDGER-09 a feature-owned falsifier rather than a
   borrowed count pin (F-05).

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 1, "low": 1}
