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

## Questions

## Positive Observations

## Recommendation

