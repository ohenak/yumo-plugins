# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 1

## Verification basis

Every claim below was re-measured against the repository at HEAD
(`e2ccaa8`, `feat-pdlc-learnings-injection`), not read off a document.

**The document's own measured premises all hold.** I checked each row of its §Overview premise
table and found none overstated:

| Premise the document asserts | What I measured |
|---|---|
| `dispatchAndVerify` sees both conjuncts | `async function dispatchAndVerify({` at `pdlc/workflows/orchestrate-dev.js:8862`, with `dispatchKind` branched at `:8886` |
| Three object-literal `dispatchKind: "authoring"` sites plus one positional | `grep -c 'dispatchKind: "authoring"'` returns **3** (`:12861`, `:12955`, `:13657`); the fourth is the positional `"authoring"` argument to `runWrapped(optimizer, optPrompt, doc, …)` at `:7663`. The document's phrasing is exactly right, and it is right for the reason it gives |
| `consolidate-learnings.js` keeps `LS_FILES_ARGV` private and exports `enumerateCorpus(_git)` | `const LS_FILES_ARGV = Object.freeze([…])` (unexported) and `export async function enumerateCorpus(_git)` in `pdlc/workflows/consolidate-learnings.js` |
| The corpus at HEAD is 9 documents | The predicate's own argv globs (`:(glob)docs/*/LEARNINGS-*.md`, `:(glob)docs/completed/*/LEARNINGS-*.md`) return exactly 9 paths; the two `docs/discarded/{p}/…` documents fall outside both globs, which is the measured basis PROP-CORPUS-03 relies on |
| All 9 open with `# LEARNINGS — {feature}` and carry a bare ISO `Date Completed` | confirmed document by document: first non-blank line is `# LEARNINGS — {feature}` in all 9, and `Date Completed` is a bare ISO value (`2026-06-02` … `2026-08-18`) in all 9. §O.6's "the annotated-cell branch is synthetic" is therefore an honest declaration, not a hedge |
| `WALK_SKIP_DIRS = new Set([".git", "node_modules"])` | `pdlc/workflows/lib/document-oracles.mjs`, `WALK_SKIP_DIRS` definition |
| `export const MERGE_CONFIG_PATH = ".claude/pdlc.config.json"` | `pdlc/workflows/orchestrate-dev.js:48` |
| `.baseline-worktree` is unignored today | `git check-ignore -v .baseline-worktree` exits **1** |
| No test file of this feature exists yet; no root `scripts/` | `ls pdlc/workflows/__tests__ \| grep -i learnings` is empty; `scripts/` does not exist |
| §F.4's seam doubles exist | `helpers/seams.js` exports `fakeFs` and `fakeGit`; `helpers/consolidationDoubles.js` re-exports both; `advisoryDisabled.test.js` imports `mainDev` from `../orchestrate-dev.js` |

**PLAN and test-file coverage.** All 23 tasks `LI-01 … LI-23` in PLAN §Batches appear in §C.3 with a
red or a green owner, and PLAN's §File-ownership manifest lists exactly **fourteen** new test rows
over fourteen files, matching §Overview's "fourteen new test files". Every test file named anywhere
in this document is either one of those fourteen planned-new rows or an existing file
(`consolidationPredicate.test.js`, `helpers/seams.js`, `helpers/consolidationDoubles.js`,
`advisoryDisabled.test.js`), each of which I confirmed on disk. **No property names a test file the
PLAN does not create.**

**REQ acceptance-criteria coverage.** REQ carries 25 acceptance criteria (`AC-1.1 … AC-6.2`). §C.2
lists all 25, and no AC is left with zero properties — though two of the rows do not hold up under
inspection (F-02, F-04 below).

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | §F.3's five BR-6 section-heading literals are wrong on two of five names, and its "all 9 HEAD corpus documents were checked to carry them in this spelling" is falsified by measurement — no property pins the heading-recognition rule, so fixtures written to the wrong spelling green while the real corpus yields `RSN-NO-MATERIAL` on every document | AC-2.3, AC-4.1, BR-6 |
| F-02 | High | Local | AC-6.1's "no live model calls" clause is credited to PROP-META-01, which contains no such claim, and to a partition argument rather than an oracle; PROP-ORDER-05, which actually discharges AC-6.1's determinism clause, is not listed under it. The AC's coverage row is an attribution, not a property | AC-6.1 |
| F-03 | Medium | Local | §Overview says "47 properties"; §C.4's reconciliation says 66, and 66 is the count that is correct. The headline number of the document contradicts its own audit table | AC-6.1 (suite closure) |
| F-04 | Medium | Local | Five §C.2 rows attribute an AC to a property whose own trace line does not claim that AC, padding the coverage matrix that exists to prove AC coverage | AC-2.2, AC-2.5, AC-3.1, AC-3.2, AC-3.3, AC-4.1, AC-4.2, AC-4.4, AC-5.1a/b/c |
| F-05 | Medium | Local | PROP-RECORD-09 ("no test must assert on `runMirror`") is given a category, a level and red/green tasks but no instrument anywhere in §Oracles, contradicting §Oracles' own opening rule that a property without a stated oracle has not been shown to have one | AC-3.2, AC-3.3 |
| F-06 | Low | Local | §C.4 says "**Two** named test files this document depends on do not yet exist" and then lists ten | — |
| F-07 | Low | Local | §Overview's test-pyramid figure sums to 33, not 35, and its layer split diverges from TSPEC §T.5's | AC-6.1 |
| F-08 | Low | Process | §F.4 cites helper seams by raw `file:line` anchor in table-cell form (`` (`:245`) ``, `` (`:413`) ``, `` (`:35`) ``, `advisoryDisabled.test.js:70`), the exact shape DEC-DOC-01 names as the anti-pattern | DEC-DOC-01 |

### F-01 (High) — the BR-6 section names are transcribed wrong, and the transcription claim is falsified by measurement

**What FSPEC says.** BR-6's priority table names the five injected sections:

> | 1 | Cross-Feature Patterns | 2 | Non-Convergences | 3 | **Rejected Proposals (with rationale)** | 4 | Process Learnings | 5 | **Open Items for Consolidation** |

and adds: *"These names identify sections by the conventional titles the harvest skill writes, where
they carry numeric prefixes — `## 2. Cross-Feature Patterns`, `## 6. Approval Record`."*

**What §F.3 says.** *"The five BR-6 section headings — `Cross-Feature Patterns`, `Non-Convergences`,
`Rejected Proposals`, `Process Learnings`, `Open Items` — transcribed from the harvest-learnings
skill's 'LEARNINGS Format' section, the source the real corpus is written against. All 9 HEAD corpus
documents were checked to carry them in this spelling."*

**What I measured.** Over all 9 corpus documents the predicate actually enumerates, every one writes:

```
## 1. Non-Convergences
## 2. Cross-Feature Patterns
## 3. Rejected Proposals (with rationale)
## 4. Process Learnings
## 5. Open Items for Consolidation
```

So **0 of 9** carry `Open Items` as the heading text and **0 of 9** carry a bare `Rejected
Proposals`. The claim "all 9 were checked to carry them in this spelling" is not true of two of the
five names, and the numeric prefix — which FSPEC BR-6 explicitly calls out — is absent from §F.3's
transcription entirely. §Group D's own PROP-BOUND-05 uses the correct `Open Items for
Consolidation`, so the document disagrees with itself on the same literal.

**Why this is High and not a typo.** §F.3 is the section that makes the fixture literals normative,
and this document's whole discipline is that expected values are literal transcriptions of the spec.
A wrong-but-self-consistent transcription is the one failure mode that discipline cannot catch: the
fixtures in `helpers/learningsFixtures.js` get written to `## Open Items`, `extractInjectableMaterial`
gets written to match them, `learningsBlock.test.js` greens, and the feature ships extracting **zero
priority sections from every real LEARNINGS document** — `RSN-NO-MATERIAL` for the whole corpus,
which under PROP-DISPATCH-06 renders `""` and yields a character-for-character pre-feature prompt.
The product outcome is a feature that is green in CI and inert in production, and AC-4.1 makes that
outcome indistinguishable from a legitimately empty corpus. This is the failure the builder-not-wired
sweep exists to catch, arriving through the fixture rather than through the wiring.

**Compounding it: nothing pins the recognition rule.** FSPEC BR-6 delegates *"which heading forms
count as which section"* to F-O-1, but TSPEC's F-O-1 discharge (§D.3) covers only the *document*-shape
predicate (`LEARNINGS_HEADING_RE = /^#\s+LEARNINGS\b/`); `extractInjectableMaterial`'s section
matcher is specified nowhere. That upstream gap is routed as an erratum below, not counted against
this document — but this document's own consequence is countable: no property in Groups D or E states
what counts as a match for `## 3. Rejected Proposals (with rationale)`, so nothing reds when the
matcher and the fixture drift together.

**To resolve.**
1. Correct §F.3's list to FSPEC BR-6's five names verbatim, including `(with rationale)` and
   `for Consolidation`, and correct the measurement sentence to what the corpus actually shows —
   the `## N. Title` form with a numeric prefix.
2. Add a property in Group D (say PROP-BOUND-08, red LI-07 / green LI-16) whose oracle drives
   `extractInjectableMaterial` over **a real corpus document read from `git ls-files` output** — not a
   synthetic fixture — and asserts the returned `sections` set-equals the five BR-6 names that
   document carries. A real-corpus arm is what defeats the fixture-and-matcher-drift-together
   mutation; a synthetic fixture cannot.
3. Fix PROP-BOUND-05's `Rejected Proposals` to `Rejected Proposals (with rationale)`.

### F-02 (High) — AC-6.1's "no live model calls" clause is asserted by attribution, not by an oracle

**What REQ AC-6.1 requires.** *"Given the test suite, when it runs in CI, then selection, bounding,
ordering, AC-1.2's dispatch-set equality and non-authoring byte-identity, and every fail-open state in
Group 4 are exercised against fixture corpora with **no live model calls**, and determinism (AC-2.5)
is asserted by comparing two compositions rather than by inspection."* Two clauses, both falsifiable.

**What §C.2 records.** *"AC-6.1 | PROP-META-05 (suite-map closure), PROP-META-01 (no live-run
comparison), and every L1/L2 row above — AC-6.1 is a statement about the suite, discharged by the
partition rather than by a behaviour."*

**The gap.** PROP-META-01's stated text is about asserting premises P-1…P-10 structurally and about
set equality over the four authoring call sites. It says nothing about live runs or model calls; the
parenthetical "(no live-run comparison)" attributes to it a clause it does not contain. PROP-META-05
asserts the suite-map closure over `__tests__/learnings*.test.js` — which suites exist and which ATs
they declare — and is silent on what those suites do at run time. So the clause that a reviewer,
a DoD verifier or a future maintainer would most want mechanised — *no new suite reaches a live
agent* — has no instrument. Meanwhile AC-6.1's **second** clause *is* genuinely discharged, by
PROP-ORDER-05 ("two compositions ... in two separate process invocations"), and §C.2 does not list
PROP-ORDER-05 under AC-6.1 at all. The row is inverted: it credits what does not assert and omits
what does.

**Why High.** AC-6.1 is a normative acceptance criterion (this REQ carries no P0/P1 labels — every AC
is normative), and it is the criterion the whole L3 tier's honesty rests on: the pyramid puts sixteen
ATs behind a scripted `_agent`, and nothing reds if one of them is later handed a real transport.
It is also cheaply mechanisable — LI-01's premises suite is already a static scan of file text, and
PROP-META-05 already parses `learnings*.test.js` statically for `LI-AT-` titles, so the same walk can
assert the complementary condition.

**To resolve.** Add PROP-META-06, owned by LI-14 (the green-terminal suite-map task, which already
holds the directory walk): *static parse of every `__tests__/learnings*.test.js` shows each file
constructs its agent through the scripted double (`makeAgentDouble`/`_agent` injection) and no file
references a live transport symbol; asserted as set equality over the enumerated suite files, so a
newly added suite that skips the double reds rather than being missed.* Then correct §C.2's AC-6.1 row
to name PROP-META-06 for clause 1 and PROP-ORDER-05 for clause 2, and drop the PROP-META-01
attribution.

### F-03 (Medium) — the headline property count contradicts the reconciliation table

§Overview opens: *"the falsifiable proof system for pdlc-learnings-injection: **47 properties** over
the region PLAN §Batches builds."* §C.4's reconciliation says *"Properties in this document | **66** |
Groups A–J."* I counted the group bullets: A 7, B 9, C 6, D 7, E 3, F 11, G 4, H 8, I 6, J 5 = **66**,
and 66 distinct `PROP-` ids appear in the document. §C.4 is right; §Overview is a stale number from an
earlier draft.

This matters more than an arithmetic slip because §C.4 is the audit surface — the row "Properties with
**no** owning task | 0" is only checkable against a trustworthy total, and a reader who takes 47 as the
denominator cannot reconcile §C.3's task table. **To resolve:** change 47 to 66 in §Overview.

### F-04 (Medium) — five §C.2 rows credit an AC to a property that does not claim it

The AC → property matrix is the instrument that proves every requirement has a property. Five of its
rows attribute an AC to a property whose own trace line names different criteria:

| §C.2 row | Property credited | What that property's own trace line says |
|---|---|---|
| AC-2.2, AC-2.5 | PROP-CORPUS-08 | *"C-7, BR-12 last row, TSPEC §T.7"* — it is the never-throws property, and has nothing to do with ordering or determinism |
| AC-3.1, AC-3.2, AC-3.3 | PROP-BLOCK-03 | *"AC-3.4, BR-7, BR-13, TSPEC §OQ.1"* — AC-3.4 only |
| AC-2.1, AC-2.3, AC-2.4 | PROP-ORDER-05 | *"AC-2.5, AT-14"* — determinism only, not the bounds |
| AC-4.1, AC-4.2 | PROP-RECORD-11 | *"AC-3.4, C-6, BR-13, AT-23"* — the no-erratum property |
| AC-4.4, AC-5.1a, AC-5.1b, AC-5.1c | PROP-FAILOPEN-04 | *"E-06, E-08, AT-04, AT-26"* — no AC-4.x or AC-5.x id at all |

I checked whether any AC is left uncovered once these are struck, and none is: AC-2.2 keeps
PROP-ORDER-01, AC-3.1 keeps PROP-RECORD-01/02, AC-4.1 keeps PROP-DISPATCH-06, AC-4.2 keeps
PROP-CORPUS-06 and PROP-FAILOPEN-02, and the AC-5.1 family keeps PROP-CONFIG-01/02/03/05/06. So this
is padding, not a hole — which is exactly why it is Medium and not High. But padding in a coverage
matrix is a durable hazard: the next revision that legitimately retires a property will read this
matrix, see two entries under an AC, retire one, and leave the AC covered only by an entry that never
asserted it. **To resolve:** make §C.2 bidirectional — an AC may list a property only if that
property's own trace line carries the AC id — and add the missing genuine rows the exercise surfaces
(PROP-ORDER-05 under AC-6.1, per F-02).

### F-05 (Medium) — PROP-RECORD-09 is a property with no instrument

§Oracles opens with the document's own bar: *"A property whose mutation is not stated here has not
been shown to have an oracle."* PROP-RECORD-09 — *"**No** test **must** assert on `runMirror`'s
value"* — is given a category (Contract), a level (L1–L3) and owners (red LI-10, green LI-19), but
appears nowhere in §O.1–§O.9 and carries no mutation in the §O.8 ledger. Its subject is the test suite,
not the production code, so unlike an ordinary property it cannot be red by an implementation change:
LI-19 "greening" it means nothing observable happened.

I confirmed the underlying product judgement is sound — `runMirror` appears in neither REQ nor FSPEC,
so declining to pin it drops no requirement, and pinning it would indeed red a conforming
implementation. The defect is the form, not the decision. **To resolve:** either give it the same
static-scan treatment its Group J siblings get (PROP-META-01 and PROP-META-05 are both explicit static
parses — a scan of `learnings*.test.js` for `runMirror` is the same instrument, and would sit naturally
beside the PROP-META-06 of F-02), or demote it out of §Properties into a §G.2 authoring constraint,
where §G.2.3 already states the same thing in prose.

### F-06 (Low) — "two named test files" followed by ten

§C.4 reads: *"**Two** named test files this document depends on **do not yet exist** —
`learningsSelect.test.js`, `learningsBlock.test.js`, `learningsCorpus.test.js`,
`learningsRecord.test.js`, `learningsDispatchSet.test.js`, `learningsConfig.test.js`,
`learningsArmInventory.test.js`, `learningsCaptureScript.test.js`, `helpers/learningsFixtures.js` and
`fixtures/learnings-baseline/` are all planned new files."* Ten items follow the word "two". The
underlying claim is correct and I verified it — `ls pdlc/workflows/__tests__ | grep -i learnings`
returns nothing and all ten are PLAN manifest rows — so only the numeral is wrong. Note the PLAN
manifest carries **fourteen** new test rows, so if the intent was to enumerate the full set, four are
missing (`learningsPremises`, `learningsPredicatePin`, `learningsBaselineGuard`, `learningsSuiteMap`).
**To resolve:** state the count that matches the enumeration, or enumerate all fourteen.

### F-07 (Low) — the test-pyramid figure does not sum to 35 and diverges from TSPEC §T.5

§Overview's pyramid annotates L3 as "12 + 2 + 4 ATs", L2 as "3 ATs" and L1 as "12 ATs" — 18 + 3 + 12 =
**33**, against the 35 the same document asserts everywhere else. TSPEC §T.5's layer assignment gives
L3 = 12 (`learningsDispatchSet`) + 2 (`learningsConfig`) + 2 (AT-20 and AT-22 from `learningsRecord`)
= 16, with `learningsRecord`'s remaining four at L1/L2; the pyramid's "+ 4" appears to be counting
footprint and gate-isolation ATs (AT-29, AT-33, AT-34, AT-35) that are already inside
`learningsDispatchSet`'s twelve. Since §C.1's "2 + 9 + 3 + 3 + 6 + 12 = 35" is correct and is the
partition PROP-META-05 actually asserts, this is a presentational figure only — but it is the first
thing a reader sees. **To resolve:** relabel the pyramid to §T.5's split (L3 16 / L2 3 / L1 16, with the
L1/L2 straddle named) or drop the numerals and keep the shape.

### F-08 (Low, Process) — raw `file:line` anchors in §F.4

§F.4 cites `helpers/seams.js`'s `fakeFs` (`:245`) and `fakeGit` (`:413`),
`helpers/consolidationDoubles.js` (`:35`) and `advisoryDisabled.test.js:70`. DEC-DOC-01
(`docs/_decisions/DECISIONS-review-severity-bars.md`) names table-cell anchors of the form
`` (`:70-79`) `` as the pattern to avoid, because the line number is a property of the file's current
layout rather than of the claim being cited. The anchors are all accurate today — I verified
`seams.js:245` is `export function fakeFs`, `:413` is `export function fakeGit`,
`consolidationDoubles.js:35` is the re-export line and `advisoryDisabled.test.js:70` is
`import mainDev, * as dev from "../orchestrate-dev.js"` — and each is accompanied by the symbol name,
which is most of what the decision asks for. **To resolve:** drop the bare numerals and keep the
symbols; the symbol names alone already identify all four unambiguously. Filed `Process` because the
pull toward these anchors is a habit of the authoring skills, not of this feature.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §G.2.2 chooses TSPEC §D.5's byte-accounting reading (material only) over FSPEC BR-6's (identification line and delimiters charged to the document) and says so plainly. That is the right call procedurally — but FSPEC is the product-normative document, and if the erratum resolves in FSPEC's favour, PROP-BOUND-07, PROP-BLOCK-02, the `BYTES-BINDING` and `COUNT-BINDING` fixture arithmetic and LI-08's hand-computed AT-11/AT-12 counts all move together. Is there a reason to prefer TSPEC's reading beyond "PLAN already computed it that way", and should the fixtures be authored in a shape that survives either resolution (e.g. framing bytes held as a named constant the expected values are stated in terms of)? |
| Q-02 | PROP-CORPUS-03's positive control asserts `docs/discarded/LEARNINGS-x.md` — a *direct* child — is a corpus member and carries no exclusion reason. I confirmed against `LS_FILES_ARGV` that the glob `:(glob)docs/*/LEARNINGS-*.md` does match that path, so the property is faithful to the shipped predicate. Is it also what the product wants? A document a team deliberately moved to `docs/discarded/` reads to an operator as withdrawn, and injecting it into an author's prompt at the direct-child depth while excluding it one level down is a distinction no author would predict. If the answer is "faithfulness to the pin wins", the property is right as written — but the reasoning belongs in FSPEC BR-2 rather than being discoverable only from the glob. |
| Q-03 | §G.2.4 states the residual risk plainly: the §O.8 mutation ledger is a written obligation checked by a reviewer, not by CI, and the `--per-file --branches 85` gate cannot see a ~300-line region inside a 15,311-line module. PROP-FAILOPEN-01 is offered as the mechanical substitute. Does the DoD for this feature name a human step that walks the twelve M-rows, and who owns it — LI-22's refactor-and-close, or Phase DOD? |
| Q-04 | PROP-META-04 requires SHA-256 literals "copied by a human from the first capture". Once the baseline is committed, what distinguishes a legitimate re-capture (a new L3 matrix case) from an illegitimate one in review? §F.2 says a legitimate re-capture leaves every *retained* digest unchanged, which is checkable — is that rule written anywhere a reviewer of the re-capture PR will see it, or only here? |

## Positive Observations

- **The premises are measured, and the measurements are right.** I re-ran every row of §Overview's
  premise table against HEAD and found none overstated — including the two that are easiest to get
  wrong and most consequential: that `grep -c 'dispatchKind: "authoring"'` returns **3**, not 4, with
  the fourth site being a positional argument at `runWrapped(optimizer, optPrompt, doc, "authoring", …)`
  (`orchestrate-dev.js:7663`), and that the corpus at HEAD is exactly 9 documents once
  `LS_FILES_ARGV`'s two globs are applied. Writing "a literal grep returns 3, not 4" into the document
  is the kind of precision that stops a future reader from silently correcting it the wrong way.
- **PROP-DISPATCH-02's choice of operand is the strongest single idea in the document.** §O.4's
  argument — that a report-sourced set equality stays green through exactly the drift it was written to
  detect, because a rejected `docType` produces no `dispatches[]` row — identifies a real hole in the
  obvious oracle and closes it with the `_recordDocType` probe. The follow-on ("the predictable repair
  under time pressure is to relax equality to containment — which is the weakening that lets a seventh
  phase inherit injection silently") anticipates how the property will be attacked, not just how it
  will be tested. Keep this section verbatim through any revision.
- **Every negative claim is paired.** I checked §O.1's table against the properties it covers and the
  pairing holds throughout: `RSN-SELF` with a `_readFile`-log exclusion *and* `corpusOutcome === null`;
  `enabled: false` with both an absent report key *and* baseline-equal prompts; PROP-FOOTPRINT-02's
  zero-reads absence resting on PROP-FOOTPRINT-01's non-empty positive *on the same instrument in the
  same test file*. PROP-CORPUS-03 in particular states its two clauses as one property and says why —
  "the second is the positive control for the first" — which is exactly the right way to keep a reviewer
  from splitting them later.
- **The catalogues are set-equalities, and the document knows why.** `LEARNINGS_REJECT_REASONS`,
  `LEARNINGS_CORPUS_OUTCOMES` and `LEARNINGS_NOTICES` are all asserted by set equality over
  hand-transcribed literals (PROP-FAILOPEN-01, PROP-RECORD-03, PROP-CONFIG-07), M-11 in the ledger names
  "relax any catalogue test to containment" as a mutation that must red, and PROP-CONFIG-07 goes further
  by pinning the member *count* so a three-member test reds on day one.
- **PROP-RECORD-04's insistence on asserting the healthy `null` positively** — and the paragraph
  explaining why it cannot be folded into the arm-inventory suite without destroying that suite's
  literal-transcription property — is a subtle distinction correctly drawn.
- **The gaps are declared rather than papered over.** §G.2 names five, including two that cost the
  document coverage (`maxBytesPerDocument: 0`, mutation testing not mechanised) and one that is a
  deliberate refusal to assert (`runMirror`). "Inventing the answer here would freeze a guess into the
  suite" is the correct instinct, and routing to an erratum rather than editing upstream is the correct
  mechanism.
- **Traceability discipline holds where it counts.** All 23 PLAN tasks appear in §C.3 with a red or
  green owner; the two tasks owning no property (LI-02, LI-22) are named with reasons; the three
  split-ownership properties are explained rather than left as bookkeeping noise; and every test file
  named is either a PLAN manifest row or a file I confirmed exists.

## Recommendation

**Needs revision**

Two High findings, so the bar is not met — but both are close-range fixes, and neither touches the
document's architecture. The proof system itself is sound: 25 of 25 REQ acceptance criteria carry a
property, all 23 PLAN tasks own a red or a green, all 35 FSPEC acceptance tests are claimed, the
absence-only-oracle and set-equality disciplines hold throughout, and the premises are measured rather
than asserted. What must change:

1. **F-01** — correct §F.3's five BR-6 section names to FSPEC BR-6's verbatim spelling
   (`Rejected Proposals (with rationale)`, `Open Items for Consolidation`) and the numbered
   `## N. Title` form; correct the falsified measurement sentence; fix PROP-BOUND-05's third name; and
   add a property whose oracle drives `extractInjectableMaterial` over a **real** corpus document, so
   fixture-and-matcher drift reds instead of greening.
2. **F-02** — add a static-scan property (suggested PROP-META-06, owned by LI-14) that asserts every
   `learnings*.test.js` suite drives a scripted agent double and references no live transport, and
   correct §C.2's AC-6.1 row to name it and PROP-ORDER-05 instead of PROP-META-01.

Then, non-gating but worth taking in the same pass: the 47/66 count (F-03), the five padded §C.2 rows
(F-04), PROP-RECORD-09's missing instrument (F-05), and the three presentational items (F-06, F-07,
F-08).

Four upstream defects are routed as errata in this dispatch's final message and are **not** counted
against this document: FSPEC's BR-6-versus-TSPEC-§D.5 framing-byte conflict, FSPEC's undecided
`maxBytesPerDocument: 0`, FSPEC's F-O-1 scope (BR-6 delegates the section-heading form to an open
question that §Open Questions scopes to the document-shape predicate only) and the TSPEC consequences
of both, plus §T.5's AT-15 suite assignment. §G.3 already identifies four of these independently, which
is itself worth noting: the document found its own upstream defects before a reviewer did.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 3, "low": 3}
