# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 2
**Delta base:** `9bea4fe8` (the commit at which v1 was written) → `f10dbd43` (HEAD)

## Delta Scope

`git diff 9bea4fe8..HEAD` on the document is **+243 / −83** over eleven revision commits. The changed
regions are: the Overview (property count, premise-table framing, pyramid split), Group A
(PROP-DISPATCH-03 rescoped, PROP-DISPATCH-08 added), Group B (PROP-CORPUS-01 home/subject), Group D
(PROP-BOUND-01 trace, PROP-BOUND-05 heading names, PROP-BOUND-07 literals, PROP-BOUND-08 added),
Group F (PROP-RECORD-09 instrumented), Group I (PROP-ISOLATE-02, PROP-FOOTPRINT-04), Group J
(owning-suite names, PROP-META-06 added), §O.1, §O.2, §O.7, §F.1, §F.3, §F.4, §C.2, §C.3, §C.4,
§G.2 and §G.3. Unchanged sections I approved at v1 were not re-read.

Every claim below was re-measured at HEAD on `feat-pdlc-learnings-injection`, not read off a document.

| New or changed claim | Result |
|---|---|
| `dispatchAndVerify` has exactly two call sites | **Confirmed** — `orchestrate-dev.js` `wrapped` (inside `reviewLoop`) and `wrappedDispatch` (inside `main`); every other occurrence of the identifier is prose in a comment |
| The wave path calls `agentFn("se-implement", waveImplementPrompt(task, featureName), …)` directly | **Confirmed** — exactly one such call site, and `waveImplementPrompt` is a real function in the same module |
| All 9 corpus documents carry the five BR-6 headings in numbered form | **Confirmed** — a literal match on `## 1. Non-Convergences`, `## 2. Cross-Feature Patterns`, `## 3. Rejected Proposals (with rationale)`, `## 4. Process Learnings`, `## 5. Open Items for Consolidation` returns **5 of 5 in 9 of 9** documents; **0 of 9** carry a bare `## Rejected Proposals` or `## Open Items` |
| §F.3's quotation of FSPEC BR-6 is verbatim, including the F-O-1 delegation | **Confirmed** — FSPEC BR-6's priority table and its "Which heading forms count as which section is F-O-1's" sentence match word for word |
| TSPEC's F-O-1 discharge covers only the document-shape predicate | **Confirmed** — TSPEC §D.3 is `LEARNINGS_HEADING_RE` / `looksLikeLearningsDocument`; §D.5 never states the section matcher. The §G.3 erratum is well-founded |
| `LEARNINGS_TARGET_DOCTYPES` is defined inside LI-15's sentinel span | **Confirmed** — PLAN LI-15 places the three frozen catalogues and `LEARNINGS_TARGET_DOCTYPES` in the region LI-11's static scan is asserted over |
| §4.1's declared thresholds are `maxDocuments: 5`, `maxBytesPerDocument: 6000`, `maxTotalBytes: 20000` | **Confirmed** — REQ §4.1 rows |
| `BYTES-BINDING`'s stated split (3 contribute / 5 `RSN-BYTES` / 0 `RSN-COUNT`) is arithmetically right | **Confirmed** — 8 × 7,000 each bounded to 6,000; 3 × 6,000 = 18,000 ≤ 20,000, the 4th overruns, contributing count 3 < `maxDocuments` 5 |
| The pyramid split 16 / 3 / 16 = 35 matches TSPEC §T.5 | **Confirmed** — §T.5 gives `learningsDispatchSet` 12 (L3), `learningsConfig` 2 (L3), `learningsRecord` 6 with AT-20/AT-22 at L3, `learningsCorpus` 3 (L2), `learningsSelect` 9 + `learningsBlock` 3 (L1); the straddle is real and correctly described |
| PLAN's manifest carries fourteen new test rows over fourteen files | **Confirmed** — PLAN §File-ownership manifest's own arithmetic paragraph says "fourteen test rows over fourteen files", and §C.4's enumeration now names exactly those fourteen |
| `F-O-8` no longer appears anywhere | **Confirmed** — zero occurrences |
| Property count is 69 | **Confirmed** — 69 distinct bullet-leading `PROP-*` definitions across Groups A–J |
| Every one of the 69 appears in §C.3's red or green column, with no undefined id | **Confirmed** — mechanical set difference in both directions is empty |
| No AC in §C.2 lost its last property | **Confirmed** — all 25 AC rows are non-empty after the five strikes |

## Prior Findings — Disposition

| v1 | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §F.1's `BYTES-BINDING` row is now "8 documents of 7,000 injectable bytes each" with §4.1's values spelled out and the expected split stated as a literal (3 contribute / 5 `RSN-BYTES` / 0 `RSN-COUNT`), matching PROP-BOUND-02 and TSPEC §T.4. The arithmetic checks. The row also now names what the two-document shape could not falsify — back-fill needs a document ranked below the byte cut — which is the clause PROP-BOUND-04 depends on |
| F-02 | High | **Resolved** | PROP-FOOTPRINT-04 is restated as "no filesystem module reference is reachable from this span" rather than an enumerated token list, and carries both controls: positive (the region must contain `LEARNINGS_TARGET_DOCTYPES`, which PLAN LI-15 does place inside the sentinels) and negative (the same scanner must red on a planted `fs.writeFileSync`). It now has a row in §O.1, and §O.1 gained a paragraph naming the shared vacuity mode of the three static-scan absences. See F-03 below for one residual on the anchor's uniqueness |
| F-03 | High | **Resolved** | PROP-DISPATCH-03's operand is now stated — the `dispatchAndVerify` episodes whose `(dispatchKind, docType)` pair fails `injectHere`, observed on the `_recordDocType` probe — and the four unreachable families are moved into the new structural PROP-DISPATCH-08, which asserts the two-call-site set equality and that the four families call `agentFn` directly. Both halves of that claim re-measured true at HEAD. §O.2's pairing row is updated to say the rejected population is asserted **non-empty** rather than assumed, which is the conjunct that stops the byte-identity half going vacuous |
| F-04 | Medium | **Resolved** | Overview reads **69 properties**; §C.4 reads 69 with the three additions named; I counted 69 |
| F-05 | Medium | **Resolved** | All five prose-named suites now carry their owning file and task in the property text (`learningsPremises.test.js` LI-01, `learningsCaptureScript.test.js` LI-03/04/05, `learningsBaselineGuard.test.js` LI-06, `learningsSuiteMap.test.js` LI-14, `learningsPredicatePin.test.js` LI-13). §C.4's "Two named test files" lead-in is replaced by an enumeration of all fourteen manifest rows, and PROP-CORPUS-01 now distinguishes its **home** (`learningsPredicatePin.test.js`, new) from its **subject** (`consolidationPredicate.test.js`, existing, never edited) in the property's own parenthetical |
| F-06 | Medium | **Resolved** | `F-O-8` is gone; PROP-BOUND-01 cites `F-O-7` |
| F-07 | Medium | **Resolved** | PROP-BOUND-07's two conjuncts are restated as hand-computed literals transcribed at fixture-authoring time, with the identity-echo failure mode and M-5 named explicitly, and the framing cost stated as its own literal so the test proves the two numbers differ. PROP-BOUND-03's generated-inequality distinction is preserved in §O.9 |
| F-08 | Medium | **Resolved** | PROP-ISOLATE-02 now enumerates five named scored artefacts, asserts set equality member-for-member across the two arms **and** non-emptiness of each set on both arms, and replaces the prose SKILL.md clause with a SHA-256 digest equality over `git ls-files pdlc/skills/**` against a hand-transcribed manifest. It has a §O.1 row |
| F-09 | Low | **Resolved** | §F.4 cites `fakeFs`, `fakeGit` and the `advisoryDisabled.test.js` import by symbol and by verbatim quotation; no raw `file:line` anchors remain in it. It also gained the `learningsPredicatePin.test.js` exception, which is a genuine clarification I did not ask for |
| F-10 | Low | **Resolved** | §G.2 gap 4 now carries PROP-META-04's three-step human mutation proof, its LI-06 completion-note home, and its checkable standing counterpart |
| F-11 | Low | **Resolved** | §O.7 marks `87 of 89` as inherited from FSPEC BR-5 with its two-repository basis named and the TE re-derivation acknowledged, and states the locally checkable form (9 of 9 here, 19,340–50,695 bytes against a 6,000-byte bound) as the one the argument rests on |
| Q-01…Q-04 | — | **Answered** | Q-01 by §C.3's LI-16/LI-17 split rows; Q-03 by the Overview's new "capture-time measurement, not a standing invariant" paragraph naming both scheduled falsifications. Q-02 and Q-04 are not answered in the text and are not gating; Q-02 is re-asked below |

All three v1 High findings are resolved, and none of the five Mediums is left open.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §C.2's new bidirectionality rule is violated by three surviving rows, and PROP-ORDER-05's trace never gained the AC-6.1 id the revision note says it gained | §C.2 |
| F-02 | Medium | Local | §C.1's enumeration of AT-less properties was not extended for the three properties this revision added | §C.1 |
| F-03 | Medium | Local | PROP-META-06's and PROP-RECORD-09's set-equality operand is the walk's own output — a set compared against itself | PROP-META-06, PROP-RECORD-09, §O.1 |
| F-04 | Low | Local | PROP-FOOTPRINT-04's positive-control anchor is not unique to the sentinel span | PROP-FOOTPRINT-04 |
| F-05 | Low | Local | PROP-BOUND-08's expected section set is computed from the document under read, where a literal is available | PROP-BOUND-08 |

No High findings. All three v1 Highs are resolved and nothing in the delta broke a section I approved at v1.

---

### F-01 (Medium) — §C.2 states a bidirectionality rule it does not fully satisfy

The revision opens §C.2 with a rule I welcome:

> An AC may list a property only if that property's own trace line carries the AC id.

Applied mechanically across all 25 rows, three listings still fail it:

| AC row | Property listed | That property's trace line |
|---|---|---|
| AC-1.4 | PROP-BOUND-07 | `AC-2.3, AC-2.4, TSPEC §D.5` |
| AC-5.1a | PROP-CONFIG-04 | `AC-4.4, BR-14, E-24, E-25, AT-30` |
| AC-6.1 | PROP-ORDER-05 | `AC-2.5, AT-14` |

The AC-6.1 case is the one to fix first, because the revision's own note claims it was already fixed:

> **no AC lost its last property** in the process, and PROP-ORDER-05 gained the genuine row it was
> missing under AC-6.1

PROP-ORDER-05 gained the §C.2 *row*; its **trace line** did not gain `AC-6.1`. So the property that
§C.2 now names as the whole of AC-6.1's clause-2 discharge does not itself claim AC-6.1, and the next
reader applying the rule in the strike direction would strike it — removing the determinism half of
AC-6.1's coverage. This is the same class of bookkeeping drift the rule was written to end.

AC-1.4 and AC-5.1a are inherited rows this revision did not touch; they are cheap to settle the same
way. AC-6.1 additionally lists PROP-META-05, whose trace carries no AC id at all — that one is
explicitly framed as support ("PROP-META-05 supports both"), which I read as intentional, but it would
be worth one clause saying support listings are exempt from the rule, or the rule will read as broken
there too.

**Resolution:** add `AC-6.1` to PROP-ORDER-05's trace line, add `AC-1.4` to PROP-BOUND-07's and
`AC-5.1a` to PROP-CONFIG-04's (or strike those two rows — either direction closes it), and add the
one-clause exemption for support listings. No AC is uncovered today, which is why this is Medium and
not High.

---

### F-02 (Medium) — §C.1's AT-less enumeration is stale by exactly the three new properties

§C.1 closes with an enumeration that is written to be exhaustive:

> Properties carrying no AT id — PROP-DISPATCH-02, PROP-DISPATCH-04, PROP-DISPATCH-07,
> PROP-CORPUS-01/02/07/08/09, PROP-ORDER-04, PROP-BOUND-07, PROP-BLOCK-03, PROP-RECORD-08/09,
> PROP-CONFIG-06/08, PROP-FAILOPEN-01, PROP-FOOTPRINT-03/04, PROP-META-01…05 — are TSPEC-local or
> apparatus obligations … and each carrying **no** AT id by design, so §T.5's counts are unchanged.

All three properties this revision added carry no AT id, and none of them is in the list:
PROP-DISPATCH-08 (`AC-4.3, BR-11, NG-5`), PROP-BOUND-08 (`AC-2.3, BR-6, F-O-1, TSPEC §D.5`),
PROP-META-06 (`AC-6.1, TSPEC §T.5, DoD 1`). PROP-BOUND-08 and PROP-META-06 each say in their own body
that they carry no AT id and why — so the intent is clear and §T.5's 35-member partition is genuinely
unchanged; only this enumeration is stale. (`PROP-ORDER-06` is a pre-existing omission from the same
list, in a section this revision did not touch.)

**Resolution:** extend the list with `PROP-DISPATCH-08`, `PROP-BOUND-08`, `PROP-META-06` and
`PROP-ORDER-06`, and end it with the closure sentence the document uses everywhere else — that the
listed set is exactly the complement of §C.1's AT-bearing properties — so a future addition that
forgets the list is caught by the arithmetic rather than by a reader.

---

### F-03 (Medium) — the shared static walk's set equality compares a set with itself

PROP-META-06 asserts:

> Asserted as **set equality** over the enumerated suite files — every file accounted for, never
> containment — so a newly added suite that skips the double reds

and PROP-RECORD-09's positive control in §O.1 is:

> the walk's enumerated file set is non-empty and set-equal to PROP-META-05's operand

Both operands are produced by the same directory walk that supplies the subject. Set equality between
a walk's output and that same walk's output is an identity: it cannot fail. The real content of both
conjuncts is the **non-emptiness** clause, which does defeat the vacuity mode the §O.1 paragraph names
("a scan that located nothing") — but it does not defeat the mode one step over, a walk whose glob
silently *narrows*. A glob of `learningsS*.test.js` enumerates two files, both clean; both properties
go green having examined a sixth of the suite.

There is a partial cross-check and it is worth stating precisely, because it is why this is Medium and
not High: PROP-META-05 shares the walk and pins its output against the **35-member AT literal**, so a
narrowing that drops an AT-bearing suite reds there. The residual is the six suites carrying no AT id
— `learningsPremises`, `learningsCaptureScript`, `learningsBaselineGuard`, `learningsPredicatePin`,
`learningsArmInventory`, `learningsSuiteMap` — which the AT literal cannot see. Those are the
apparatus suites, the ones least likely to reach a live transport, so the exposure is narrow.

It is also a one-clause fix, and the literal already exists in this document: §C.4 now enumerates the
twelve suites by name with their owning tasks.

**Resolution:** state the operand as the **hand-transcribed twelve-suite literal of §C.4**, and assert
the walk's output set-equal to *that*. `learningsSuiteMap.test.js` then reds on a narrowing glob, on a
suite added without a manifest row, and on a manifest row landed without its file — three real
failures in place of an identity. §O.1's PROP-RECORD-09 row and the shared-instrument paragraph should
name the same literal.

---

### F-04 (Low) — PROP-FOOTPRINT-04's anchor is not unique to the span it is anchoring

The new positive control requires the extracted region to contain `LEARNINGS_TARGET_DOCTYPES`. PLAN
LI-15 does place that constant inside the sentinels, so the conjunct is well-founded, and the two
mislocation modes that matter most are caught: an empty region and a region elsewhere in the module
both fail it.

But `LEARNINGS_TARGET_DOCTYPES` is also referenced **outside** the span — PLAN LI-20 puts
`injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)` inside
`dispatchAndVerify`, which is not in the constants region. A regex that drifted onto that neighbourhood
would extract a non-empty region containing the anchor and containing no `fs.` reference, and the
property would pass without ever scanning the constants block. A region that drifted *wider* is
harmless — it can only add tokens, and a false red is safe here.

**Resolution:** anchor on something the sentinels themselves own — the sentinel comment text, or the
pair `LEARNINGS_DEFAULTS` **and** `readLearningsConfigSafely`, both of which LI-15 places in the region
and neither of which LI-20 reproduces. Cheaper still: assert the extracted region's start and end line
numbers coincide with the sentinel matches, which makes "is this the right span" a direct claim rather
than an inference from a token.

---

### F-05 (Low) — PROP-BOUND-08's expected value is computed, where a literal is available

PROP-BOUND-08 is the best addition in this revision — a real-corpus arm is exactly the right defeater
for the fixture-and-matcher-drift mutation, and the reasoning for why a synthetic fixture structurally
cannot falsify it is correct.

Its expected value, though, is stated as a computation:

> **must** return a section set **equal** to the intersection of BR-6's five names with the
> `## N. Title` headings that document actually carries

The intersection is computed from the input document at assertion time. That is not an implementation
echo — the operand is the input, not the code under test, and the positive-presence conjunct on the
document's own heading lines is a genuine control. But the document has just measured that **all five
headings are present in 9 of 9 corpus documents**, so the intersection is not a variable: it is the
five names. A transcribed literal is available and is strictly stronger, because the computed form
greens if a future edit deletes a section from the chosen document *and* the extractor stops finding
it — the two errors cancel.

**Resolution:** transcribe the expected set as the five BR-6 names, and keep the computed intersection
as a **precondition** on the fixture (assert the chosen document carries all five; if a future corpus
document does not, the precondition reds and a human picks the arm's subject deliberately). Worth one
sentence either way: naming the chosen document is currently "first path in UTF-8 byte order", which
silently re-points the arm at a different document the day a `docs/completed/a…` feature lands.

## Questions

## Positive Observations

## Recommendation

## Verdict
