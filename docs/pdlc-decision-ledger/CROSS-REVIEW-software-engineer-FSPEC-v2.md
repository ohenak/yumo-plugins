# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.1)
**Date:** 2026-08-28
**Iteration:** 2

Delta re-review. Base for the diff is `21f19cb4b` (the commit closing my v1 cross-review); the
document moved over five commits, `4c8dd33f7`…`a81757947`. Scope below is my three v1 High
findings plus the sections those commits changed (§1 Precedent, §2, §3.1, §3.2 step 2, §3.3, BR-1,
BR-8, BR-10, §5 E-2/E-3/E-4/E-6/E-11, §6 AT-01/AT-03/AT-05/AT-07/AT-08/AT-09/AT-10/AT-11/AT-14/
AT-16/AT-18, §7 O-6/O-7/O-8/Q-1/Q-2/Q-3). Unchanged sections already approved are not re-litigated.

## Prior findings — disposition

| v1 id | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §3.3's legs are now stated over the surviving subset: Total = "nothing survives … whether because every source was unavailable or because every in-scope decision failed to render", Partial = "a **proper, non-empty** subset … fails to render, for any reason". The failing subset is now exactly one of {empty ⇒ path not entered, proper non-empty ⇒ Partial, whole ⇒ Total}, so the legs partition the space and §5's totality claim holds. E-2/E-3 were re-stated to match, and E-3 names the whole-source-among-survivors sub-case explicitly |
| F-02 | High | **Resolved, and resolved the honest way** | BR-8 now says in terms that it constrains "**construction, not dispatch bytes**", §3.3 states there is "**no dispatch-visible consequence** in either direction", and the discriminating observable is routed to the new O-7 as a TSPEC obligation. AT-10 was rewritten to assert the visible part positively (rendered line set *equals* AT-01's expected set for the surviving sources) and cites O-7 for the classification conjunct. This is what I asked for: the unfalsifiable half is named as unfalsifiable-here rather than asserted |
| F-03 | High | **Resolved** | AT-01 now pins two dispatches with determinate expected sets — `pdlc-advisory-wave-gate` and `pdlc-engineering-loop` — each `M-1d`'s 41 ids **union the single `M-2e` row for that dispatch's feature**. I checked both numbers at the Baseline: `M-2e` gives `pdlc-advisory-wave-gate` **4** and `pdlc-engineering-loop` **7** (`docs/_constraints/pdlc-decision-corpus-baseline.md:67`), so 45 and 48, both under `maxEntries` `70`, and `M-6b`'s 63 floor is no longer contradicted. The negative half ("a build rendering all 100 feature-level ids fails") is paired with the positive, and the two features are chosen for what each pins — `M-4d`'s mixed file is in fact `pdlc-advisory-wave-gate`'s (`:85`), and `M-3c`'s twice-opened block is `pdlc-engineering-loop`'s, with `DEC-LOOP-01`…`06` twice-opened and `-07` once, exactly as `M-3a` records (`:73`). Both claims check out |
| F-04 | Medium | Resolved | §1 now splits the precedent on two axes and says outright that `learningsInjection` "is the model for neither this spec's injection site nor BR-9's per-dispatch freshness, which it would contradict", naming `cascade.pinCheck`'s freeze clause and `review.derivativeStop`'s finding-grammar clause as the injection-site model instead. That matches HEAD (`pdlc/workflows/orchestrate-dev.js:11446-11453`) |
| F-05 | Medium | Resolved | BR-1 carries the third conjunct ("at least one rendered line survives the bounds of §3.2 step 5"), and now names E-6/E-7 as instances rather than exceptions |
| F-06 | Medium | Resolved | AT-14 now asserts byte-identity to AT-04's committed baseline, which pins the missing positive ("no rule text standing alone above a missing index") in one comparison, with an explicit failing build named |
| F-07 | Medium | Resolved | §3.1 now says config is "**resolved** for the dispatch … read once per run and threaded, as `learningsInjection` does; only the record corpus is re-read per dispatch (BR-9)" — the per-dispatch I/O obligation is gone |
| F-08 | Low | Resolved | AT-03 now mutates "a record **in the frozen fixture copy**", with "the live repository is never mutated" stated |

All three blocking findings are resolved. My v1 questions Q-01/Q-02 are answered in §3.2 step 2 and
§3.3, Q-03 in AT-16's new "not claimed exhaustive" paragraph, and Q-04 in Q-3, which is now settled
rather than open — correctly, since the example config discloses all three shipped gated blocks
(`.claude/pdlc.config.example.json`: `learningsInjection`, `cascade.pinCheck`,
`review.derivativeStop`).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **§3.1's new failure vocabulary excludes the one block-level case the shipped precedent actually has.** The round defines "**malformed** when it does not parse" and then claims the space is exact: "the per-key condition space is exactly {valid, wrong-typed, absent}, with malformation the one block-level condition." But a JSON file either parses or it does not — a *block* inside a parsing file cannot "fail to parse". The real case is `"decisionLedger": 5`: file parses, key present, value not an object. The shipped loader treats exactly this as a distinct condition and names it (`pdlc/workflows/orchestrate-dev.js:2270-2271`, `if (!isPlainObject(section)) return degraded(true);` — the `sectionMalformed` flag, separate from the unparseable-file path at `:2261-2266` and the absent-section path at `:2268`). Under the strict reading of the new sentence that case matches no row of the §3.1 table and an engineer invents the outcome; under a charitable reading of "block does not parse" it lands on the right outcome, which is why this is Medium and not F-01's v1 severity — every available reading defaults all three keys — but the paragraph's own exactness claim is false as written. Fix: define the block-level condition as "the file does not parse, **or** `decisionLedger` is present and is not an object", which is the shipped `sectionMalformed` condition and makes the claimed exactness true. | §3.1 (two failure words); BR-10 |
| F-02 | Medium | Local | **AT-05 now enumerates five conditions under the count word "four", and E-1 was not moved with it.** The round added "or malformed" to AT-05's *Given*, which now reads: `enabled` absent, `false`, wrong-typed, **and** the whole block absent **or** malformed — five configurations — while the *Then* still says "all four produce the AT-04 byte-identical stream". E-1 (`§5`, unchanged this round) still enumerates four and omits the block-malformed case entirely: "`enabled` absent, `false`, wrong-typed, or the whole block missing … All four spellings". So the AT and the edge case it cites now disagree on the enumeration, in a test whose whole content is an exhaustive collapse. A test author transcribing this cannot tell whether to build four fixtures or five. Fix: make E-1 and AT-05 carry the same list and the same count word, whichever F-01 settles the block-level condition to be. | AT-05; E-1 |
| F-03 | Low | Local | **AT-11's cross now includes `valid`, which is not a fallback case.** *Given* reads "each of C-3's three keys in turn, crossed with §3.1's per-key condition space {valid, wrong-typed, absent}, with the other two valid" — but with all three keys valid there is no fallback to assert, and the *Then* ("only the affected key takes its C-5 default") has no referent for that cell. Harmless to behavior; it makes 9 cells of which 3 are vacuous, and vacuous cells in a set-equality enumeration are where an author later "simplifies" the wrong one away. Fix: cross over {wrong-typed, absent} and state the all-valid configuration separately as the control. | AT-11 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-14's flag-on cases now assert byte-identity to AT-04's *committed baseline*, and so does AT-08's total leg. That makes one recorded artifact the oracle for three tests whose preconditions differ (flag off; flag on with an empty set; flag on with every source dead). Is that the intent — one pinned baseline, three arrival paths — so that O-4's "pinning that stops a re-capture silently satisfying AT-04" is understood to protect all three? If so it is worth a sentence in O-4, because a re-capture now silently satisfies three tests, not one. |
| Q-02 | O-7 makes AT-10's classification conjunct assertable only once TSPEC exposes a driver-internal observable. The shipped precedent already carries one of exactly this shape — `sectionMalformed` / `invalidKeys` on the config loader's return (`pdlc/workflows/orchestrate-dev.js:2254-2256`), which is diagnostic state returned alongside the resolved value and never reaches the prompt. Is O-7 expected to follow that precedent (a counted `failedSources` on the index-construction return), or is it left genuinely open? Naming the precedent in O-7 would cost one clause and would keep TSPEC from minting a second shape for the same job. |

## Positive Observations

- **F-02 was answered by narrowing the claim, not by inventing an observable.** The easy repair
  would have been to mint a prompt-visible marker so BR-8 could be asserted in bytes; that would
  have added dispatch surface for a test's convenience. Instead §3.3 says plainly that the
  classification has no dispatch-visible consequence, AT-10 asserts only the bytes, and the rest is
  routed to O-7 as a named TSPEC obligation. That is the harder and the correct answer, and it left
  the feature's observable surface exactly where it was.
- **AT-01's expected value is now transcribable by hand, and its two fixtures each pin a distinct
  hazard.** 41 ∪ 4 and 41 ∪ 7 are both checkable against `M-1d`/`M-2e` without running anything;
  the mixed-file and twice-opened cases ride on dispatches that had to exist anyway rather than on
  extra tests; and the paragraph forbidding capture from the renderer ("never captured from the
  renderer's output, which would derive the expectation from the code under test") states the
  implementation-echo rule in the one place it would otherwise have been violated.
- **O-8 is a finding the document raised against itself.** Nobody asked for it: the author noticed
  that BR-12/BR-13's bounds invariant is universally quantified while AT-13 exercises two examples,
  and routed the gap to PROPERTIES as a parameterised property rather than adding a third example.
  That is the right instinct and the right destination.
- **Q-3 was settled rather than carried.** "Three for three, and there is no reading under which a
  gated block ships undisclosed" is a decision with its evidence attached, and it converts an open
  question into a PLAN task count. I confirmed the three-for-three claim at HEAD.
- **Every code and Baseline claim I spot-checked this round holds**: `M-2e`'s per-feature counts,
  `M-3a`'s twice-opened enumeration, `M-4d`'s 4-records-plus-8-headings file and its owning feature,
  and the example config's three disclosed blocks.
