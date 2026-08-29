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

## Findings

All three v1 Highs are closed, and none of them re-opened elsewhere. **No High finding this round.**
The five below are all Medium or Low and none blocks TSPEC authoring; F-01 and F-02 are the two
worth closing before this document is used as a test-writing source, because both would send a
fixture author down a path that either cannot be built or cannot fail.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| **F-01** | Medium | Local | **AT-18's second conjunct is vacuously satisfiable.** The new AT asserts "**exactly one** line carries that id — never two, never zero — and every other line is unchanged from the same corpus without the duplicate." The cardinality conjunct is exactly right and is what I asked for. The differential conjunct is not: its expected value is the renderer's own output on a second corpus, so a renderer that emits *only* the duplicate id's line and drops everything else passes both conjuncts — one line carries the id, and "every other line" is empty in both runs, hence unchanged. That is the implementation-echo shape in miniature: the oracle cannot fail for a wrong line set because it never names one. The corpus is **synthetic and small** (O-5 constructs it), so the whole expected line set is transcribable the same way AT-01's is. Fix: assert set equality over the synthetic corpus's whole rendered lines, transcribed from the fixture, with the duplicate's **statement field alone** left unasserted — which preserves exactly the TSPEC routing AT-18 is careful to make. | §6 AT-18 |
| **F-02** | Medium | Local | **E-5 still carries the pre-round vocabulary that §3.1 abolished, and its lead case is now unconstructible.** §3.1 (`:97`–`:101`) now fixes the meanings: wrong-typedness is per key, malformation is **not** — "it is a property of the block, and resolves all three keys at once", so "the per-key condition space is exactly {valid, wrong-typed, absent}". BR-10 and AT-11 both adopt that. E-5 (`:292`) was left untouched and reads "One key **malformed**, the other two valid — for each of the three keys, and for each of {wrong type, malformed, absent}", and then "With `enabled` the malformed key, the fallback is `false`". Under §3.1 no such state exists: a malformed file resolves all three keys at once, so "one key malformed, the other two valid" is a fixture that cannot be built. AT-11 cites E-5 as its rule while enumerating a different space, and AT-11 demands **set equality** over that enumeration — so the two readings differ in cardinality (E-5's 3×3 = 9 vs AT-11's 3×3 + 1 = 10) and a PROPERTIES author has two enumerations to choose between for a set-equality oracle. AT-11's is the correct one. Fix: restate E-5 in §3.1's vocabulary and let the block-level case be its own row. | §5 E-5; §3.1; §6 AT-11 |
| **F-03** | Medium | Cross-Feature | **The Baseline's propagation row now names the FSPEC but its anchor list is inaccurate in both directions.** `docs/_constraints/pdlc-decision-corpus-baseline.md:6` lists "header, §1, §3.3, §4 BR-2/BR-8/BR-10, §5 E-4/E-9/E-10/E-11, §6 AT-01, §7 O-5". Grepping the FSPEC's actual `M-*` citation sites: **§6 AT-18** cites `M-5c` (`:374`), **§7 O-1** cites `M-1d`/`M-2e` (`:505`), and **§7 Assumptions** cites `M-6b`/`M-6c` (`:545`) — none listed; while **§4 BR-10** (`:249`–`:253`) cites no `M-*` id at all and is listed. The row's stated purpose is that a `Version` bump propagates to every dependent claim, so an under-listed anchor is precisely the version-skew failure I filed F-09 about: O-1's constraint ("a TSPEC choice rendering a set differing from `M-1d`/`M-2e` … fails REQ-DECLEDGER-01") and §7's `maxEntries` justification would not be re-checked on a re-measurement. One-line fix, same edit that minted the row. | Baseline `:6`; §6 AT-18, §7 O-1, §7 Assumptions |
| **F-04** | Medium | Local | **"A decision fails to render" is now load-bearing in three places, has no route into §3.3, and no owner.** The revision restates both legs over *what survives*: Total is "every in-scope decision failed to render", Partial is "a proper, non-empty subset … fails to render", and AT-08 gains a second corpus — "a readable corpus in which every in-scope decision fails to render". But §3.3's entry sentence is unchanged: "Entered from **step 3** when a source is missing, unreadable, or fails to parse." Rendering is **step 4**. So the flow states no route from a step-4 render failure into the legs that are now defined by it, and nowhere in the document does anything say what makes an individual decision unrenderable — a heading that is not a record simply is not in the set (E-9), which is not a failure. A fixture author owed AT-08's second corpus and AT-09's first (O-6) cannot construct either without inventing the mechanism. Note the document already solved the identical problem one paragraph earlier, and solved it well: BR-8's classification had no dispatch-visible consequence, so it was routed to TSPEC as **O-7** with the consequence stated ("Without it BR-8 is unfalsifiable"). The same treatment here — an O-7-style obligation naming what constitutes a render failure, plus one clause routing step 4 into §3.3 — makes E-2/E-3 constructible. The unspecified mechanism is inherited from v1's E-3; what is new is how much now rests on it. | §3.3 entry; §5 E-2, E-3; §6 AT-08, AT-09; §7 O-6 |
| **F-05** | Low | Local | **E-1's "four spellings" no longer spans what §3.1 and AT-05 test.** §3.1's fourth row is "the whole `decisionLedger` block **absent or malformed**" and AT-05's *Given* follows it ("the whole `decisionLedger` block absent or malformed"), but AT-05's title and *Then* still count **four** while enumerating five conditions, and E-1 (`:291`) omits *malformed* entirely ("absent, `false`, wrong-typed, or the whole block missing"). Since AT-05's *Then* is a set-equality-flavoured claim ("all four produce the AT-04 byte-identical stream"), the count word and the enumeration should agree. Cheapest fix: add malformed to E-1 and say five, or keep four and state that the block-level row has two spellings. | §5 E-1; §6 AT-05; §3.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-04: is a render failure meant to be possible at all under the recognition rule O-1 lands, or is the only real failure mode a source-level one — in which case Total/Partial reduce to "how many sources survived" and the "every in-scope decision failed to render" clause is describing an empty possibility? Either answer is fine and both are cheap to state; the current text asserts the case exists without saying how to reach it. |
| Q-02 | On F-01: is AT-18's "every other line is unchanged" conjunct intended as a differential check, or as shorthand for "the rest of the expected set still renders"? If the latter, transcribing the synthetic corpus's line set says it directly and removes the vacuity. |
| Q-03 | AT-01 constructs its two dispatches over documents of **completed** features (`docs/completed/pdlc-advisory-wave-gate/`, `docs/completed/pdlc-engineering-loop/`). §3.2 step 2 scopes the set by "the feature whose document is under review" without restricting to in-flight features, so I read this as valid; worth one word in TSPEC confirming a completed feature's directory is in scope the same way, since that is what the frozen fixture pins. |

## Positive Observations

- **All three Highs closed at the right altitude, none by weakening the claim.** The tempting fix
  for F-02 was to delete E-11's cardinality sentence and route the whole edge to TSPEC. Instead
  AT-18 asserts the one conjunct the spec owns and names what it deliberately does not assert, with
  the reason. That is the harder and better move.
- **AT-14 is now the model the rest of the document should be read against.** Byte-identity to a
  committed baseline replaces a three-clause absence oracle and pins strictly more, including a
  failure mode ("rule text without an index") that no absence clause could have caught. The doc
  even names its own falsifier.
- **AT-01 became a real oracle this round.** Two dispatches instead of one resolves the two-valued
  expected set; the arithmetic re-derives exactly (45 and 48); the two features are chosen *for what
  each pins* rather than arbitrarily, so E-9 and E-10 both get covered by the same set equality; and
  the provenance clause forecloses the implementation echo in the one place it would have been most
  natural to introduce ("never captured from the renderer's output").
- **AT-16's non-exhaustiveness is stated rather than papered over.** "The list is **not** claimed
  exhaustive of driver-side accounting, so a sixth mechanism is covered by extending it, not by a
  set equality" — the discipline of demanding set equality over *closed* enumerations only, and
  saying so when an enumeration is open, is exactly right and is rarer than it should be.
- **O-7 is the finding this document raised on itself.** Noticing that BR-8's empty-versus-failed
  classification has no dispatch-visible consequence, and therefore that BR-8 is unfalsifiable
  without a driver-internal observable TSPEC must expose, is a testability insight the review did
  not ask for. F-04 is only asking for the same treatment one paragraph over.
- **O-8 records the bounds invariant as a property, not as more examples**, and says so in the
  words that matter ("parameterised over set size × line sizes × both bounds, not as further
  examples"). That forecloses the example-only default before PROPERTIES starts.

## Recommendation

**Approved with minor changes**

Every High from v1 is closed, and I found no new High in the changed sections. The five findings
above are Medium or Low and none of them gates TSPEC authoring. Two are worth closing before this
document is handed to a fixture author, because both concern tests that would otherwise be written
wrong rather than late: **F-01** (AT-18's differential conjunct passes a renderer that drops every
other line — transcribe the synthetic corpus's line set instead) and **F-02** (E-5 contradicts
§3.1's new vocabulary and asks for an unconstructible fixture, while AT-11 demands set equality over
a different enumeration). **F-04** is the one to answer rather than fix: say whether a per-decision
render failure exists and, if so, route step 4 into §3.3 and give the mechanism an owner, exactly as
O-7 does for BR-8. **F-03** is one line in the Baseline's propagation row; **F-05** is one word.

**No erratum items this round.** Nothing I found traces to a defect in REQ v1.7: F-02 and F-05 are
internal to vocabulary this FSPEC introduced, F-01 and F-04 are its own test design, and F-03 is the
Baseline's citation row, which the FSPEC's own edit minted.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Medium | delta | local | AT-18's "every other line is unchanged" conjunct is vacuously satisfiable — a renderer emitting only the duplicate's line passes; transcribe the synthetic corpus's line set | §6 AT-18 |
| F-02 | Medium | delta | local | E-5 keeps the pre-round per-key "malformed" vocabulary §3.1 abolished; "one key malformed, the other two valid" is unconstructible and its 9-case space contradicts AT-11's 10 | §5 E-5 / §3.1 / §6 AT-11 |
| F-03 | Medium | delta | nonlocal | Baseline `:6` propagation row omits §6 AT-18, §7 O-1, §7 Assumptions and lists §4 BR-10, which cites no `M-*` id | Baseline Cited-by row |
| F-04 | Medium | delta | local | Both legs are now defined by "fails to render", but §3.3 is entered only from step 3 and no owner states what makes a decision unrenderable — AT-08/AT-09 fixtures unconstructible | §3.3 entry / E-2, E-3 / AT-08, AT-09 |
| F-05 | Low | delta | local | AT-05 counts "four" over five conditions and E-1 omits the block-malformed spelling §3.1 and AT-05 now carry | §5 E-1 / §6 AT-05 |

FINDING: Medium | delta | local | §6 AT-18 | The "every other line is unchanged from the same corpus without the duplicate" conjunct derives its expected value from the renderer's own output, so a build emitting only the duplicate id's line and dropping all others passes both conjuncts; transcribe O-5's synthetic corpus line set instead, leaving only the duplicate's statement field unasserted.
FINDING: Medium | delta | local | §5 E-5 (with §3.1, §6 AT-11) | E-5 still reads "one key malformed, the other two valid … {wrong type, malformed, absent}", a state §3.1's new block-level definition of malformation makes impossible, and its 9-case space contradicts AT-11's set-equality enumeration of 3×3 plus one block-level case.
FINDING: Medium | delta | nonlocal | docs/_constraints/pdlc-decision-corpus-baseline.md:6 | The newly minted FSPEC citation anchor list omits §6 AT-18, §7 O-1 and §7 Assumptions, and lists §4 BR-10 which cites no Baseline id, so a Version bump would not propagate to every dependent claim.
FINDING: Medium | delta | local | §3.3 entry sentence, E-2/E-3, AT-08/AT-09 | Both fail-open legs are now defined over decisions that "fail to render", but §3.3 is entered only from step 3 (source missing/unreadable/unparseable) while rendering is step 4, and no section states what makes a decision unrenderable or owns that mechanism, leaving AT-08's second corpus and AT-09's first unconstructible.
FINDING: Low | delta | local | §5 E-1 with §6 AT-05 | AT-05's title and Then still say "four" while its Given enumerates five conditions, and E-1 omits the block-malformed spelling that §3.1 and AT-05 both now carry.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 1}
