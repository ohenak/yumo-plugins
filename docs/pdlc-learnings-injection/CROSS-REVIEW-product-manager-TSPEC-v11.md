# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.7)
**Date:** 2026-08-20
**Iteration:** 11 (delta confirmation)

## Overview

**Question answered:** does the erratum delta resolve the four routed items without breaking what
v10 approved, and is the TSPEC still a faithful compression of REQ v0.9 / FSPEC v0.12 **at HEAD**?

**Answer:** yes on both counts. All four routed items landed and each is true against the
repository and upstream at HEAD. Nothing v10 approved regressed. The only findings are Low,
inherited, and citation-hygiene in kind (DEC-DOC-01): the same stale-line-anchor drift the erratum
was raised to fix survives in sibling cells the item list did not name.

**Delta under review** (`git diff ccc739d1..HEAD` on the TSPEC, five commits: `4fe44ecb`,
`2c8b880c`, `cb4dae90`, `35dc817f`, `dfd8c1ff`, `bfe58851`) — +66/-37 lines, header bumped to v0.7
with a v0.7 erratum note, no behavioural claim changed.

| Routed item | Landed | Verified at HEAD |
|---|---|---|
| §D.1 domain-membership false for `corpusOutcome` (`null` healthy path) | Yes | §D.1 now scopes the domain test to **non-`null`** values and states the predicate as `v === null \|\| catalogue.includes(v)`; `LEARNINGS_CORPUS_OUTCOMES` stays the two-member set |
| Same item, re-raised as unrevised since `ccc739d1` | Yes | Landed in `2c8b880c`, inside the diff range; the pre-round contradiction is gone |
| §Ground-truth P-2a anchors stale (`:13515`, `:12821`, `:12915`) | Yes | P-2a restated by enclosing symbol and call shape; the four sites resolve at HEAD to `converge()`'s phase creator, `erratumRound()`'s author and land-proof-retry dispatches, and `reviewLoop()`'s positional `runWrapped(..., "authoring", ...)` |
| §Ground-truth P-10 anchor stale (`:15167`) | Yes | P-10 restated as "one of the trailing conditional spreads (`prUrl`, `ciStatus`, `haltReason`, `advisory`) in `buildFinalReport`'s returned object literal", cited by symbol |

Per DEC-ERR-03 my scope is the document against upstream at HEAD, not the item list; §Architecture
through §Open Questions below record that wider sweep.

## Architecture

The delta's largest change is §A.2's status flip: the `docType` conjunct stops being a **routed
divergence from BR-1** and becomes **BR-1 as written**. That is the product-significant edit, and it
is upstream-true at HEAD.

| TSPEC claim after the delta | Upstream at HEAD | Faithful |
|---|---|---|
| "This is FSPEC BR-1 as it now stands, not a divergence from it" — two-conjunct rule, authoring classification **and** target ∈ {REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES} | FSPEC §BR-1: "**both** hold: the pipeline classifies it as authoring, **and** its target document is one of REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES (REQ C-1)" | Yes, verbatim in substance |
| "naming the second conjunct load-bearing and Phase CR's optimizer round as the branch it excludes" | FSPEC BR-1: "The second conjunct is load-bearing, not defensive — an authoring-classified dispatch whose target is none of those six document types (the code-review phase's optimizer round at HEAD) is outside the rule" | Yes |
| "v0.12 carried the complement through BR-11, AT-03, AT-29 and D-2" | FSPEC AT-03 quantifies over "each dispatch **outside BR-1's rule**"; AC-4.3 → BR-11 → AT-03, AT-29; D-2 is stated as BR-1's two-conjunct question with all three branches | Yes |
| "AT-02 gained the fixture that reds when the second conjunct is reverted" | FSPEC AT-02: fixtures include "a run containing an authoring-classified dispatch whose target is none of the six C-1 document types — so reverting BR-1's second conjunct reds this test" | Yes |
| AC-4.3 restated as byte-identity for the dispatches **outside BR-1's rule** (was "non-authoring") | FSPEC v0.12's own re-quantification; REQ AC-4.3 unchanged | Yes — the narrower phrase is the correct one now |
| §A.2 "the coincidence is an invariant, and it is asserted, not assumed" — set-equality oracle over the `docType`s reaching the injector | REQ NG-5, C-1; unchanged by the delta | Yes — v10's approved reading preserved |

**Nothing v10 approved regressed here.** The paragraph's product argument is unchanged: the
conjunct still protects AC-1.2's set equality, AC-4.3's byte-identity, and R-4's "prior-feature
decisions must not reach code remediation". What changed is only its provenance — from "TSPEC adds
this, FSPEC forbids it" to "TSPEC implements what FSPEC now says". That is the outcome the erratum
route existed to produce, and §I.3's `docType ∈ LEARNINGS_TARGET_DOCTYPES` predicate is untouched.

One inherited citation defect sits in this section: the six per-phase `docType` anchors
(`orchestrate-dev.js:13766`, `:13774`, `:13807`, `:13874`, `:13893`, `:13996`) are stale at HEAD —
the `converge()` call sites now resolve at `:13908`, `:13916`, `:13949`, `:14016`, `:14035`,
`:14138`, a uniform +142 drift, the same drift that made P-2a's anchors stale. The claim survives
(the `docType` literals name themselves), so this is Low, not a contradiction — filed as F-02.

## Interfaces

The delta touched no interface, no signature and no seam. §I.3's predicate, §I.5's changed-signature
table (`dispatchAndVerify`'s `_injectLearnings`, `reviewLoop`'s forwarded param, `main`'s
`_learningsInjector`, `buildFinalReport`'s conditionally-spread `learningsInjection`) are
byte-unchanged in the diff. Nothing to re-approve.

What the delta did change is how the **ground-truth table** cites those seams, so I re-walked every
citation in §Ground-truth against the repository at HEAD:

| Row | Citation after the delta | Resolves at HEAD |
|---|---|---|
| P-2a | Four sites by symbol: `converge()` phase creator; `erratumRound()` author + land-proof retry; `reviewLoop()`'s positional `runWrapped(optimizer, optPrompt, doc, "authoring", …)` | **Yes** — three object-literal `dispatchKind: "authoring"` properties and one positional argument, exactly four, matching the "four code sites" count the row asserts |
| P-2b | Phase CR's `reviewLoop({ doc, phase: "CR", docType: null, … })`; `roundDocType = docType === undefined ? docTypeFromPath(doc) : docType`; `wrapped` forwarding to `dispatchAndVerify` | **Yes** — the quoted `roundDocType` line is verbatim at HEAD, and `wrapped` forwards `docType: roundDocType` |
| P-3 | `dispatchAndVerify({… dispatchKind, feature, _readFile, _listFiles, _git, _log})`, `:8862-8878`; prompt composition at `:8978` | Yes — anchors still land |
| P-4 | `LS_FILES_ARGV` / `enumerateCorpus`, `consolidate-learnings.js:1338-1346` / `:1349-1355` | Yes |
| P-7 | `defaultGit`, `orchestrate-dev.js:11658-11676`; `rtGit`, `runtime-adapter.js:1003` | **Anchor stale** — `defaultGit` is at `:11698`; `:11658` is `defaultWriteFile`. `rtGit` resolves. Claim itself true (F-01) |
| P-8 | `defaultReadFile`, `orchestrate-dev.js:11513-11519`; `rtReadFile`, `runtime-adapter.js:493-505` | **Anchor stale** — `defaultReadFile` is at `:11553`; `:11513` is a `log` helper. Claim true: it returns `null` on any error, and `rtReadFile` rethrows an exhausted probe (F-01) |
| P-9 | `runtime-adapter.js:494-522`, `:124`, `:459-465` | Yes — `RT_READ_CACHE_MAX_BYTES = 2097152` at `:124`, the eviction loop at `:459-465` |
| P-10 | Conditional spread by symbol in `buildFinalReport` | **Yes** — `...(advisory ? { advisory } : {})` is one of the trailing spreads at HEAD; the de-anchoring also fixed the previously-stale `:15167` |
| P-11 / P-12 | `parseAdvisoryConfig` at `:1980-1983` / `:1985-2010` | Yes — both quotes verbatim |
| §A.3 | `defaultListFiles`, `orchestrate-dev.js:11586-11605` | **Anchor stale** — `defaultListFiles` is at `:11626` (F-03) |
| §A.5 | `notices` sink shape, `orchestrate-dev.js:12110` | **Anchor stale** — the `main()` sink is at `:12150` (F-04) |
| §Test fixtures | `seams.js:245` / `:413` / `:425-441`, `consolidationDoubles.js:23` | Yes — all four resolve |

The pattern is worth naming for the record: `orchestrate-dev.js` moved under this branch
(`472e505c` most recently), shifting anchors by +40 in the seam region and +142 in the
phase/dispatch region. The erratum de-anchored the three cells the item list named and left the
sibling cells with the same drift — which is precisely the churn DEC-DOC-01 was recorded to end.

## Data Model

This is where the primary routed item landed, and it landed correctly.

**Before:** "one test per domain asserts that every value it ever carries is a member of that
field's catalogue" — false for `dispatches[i].corpusOutcome` and `runMirror.corpusOutcome`, whose
healthy value §D.2 fixes as `null`.

**After:** the assertion is scoped to every **non-`null`** value, with the reason stated rather than
hedged — `null` "means 'documents were known', not 'an outcome outside the catalogue'", so an
unscoped membership assertion "would red on every happy-path run". The domain test is spelled out as
`v === null || catalogue.includes(v)`, `null` is stated to be deliberately **not** a member of
`LEARNINGS_CORPUS_OUTCOMES`, and the two non-nullable domains (`rejected[].reason`, `notices[].id`)
are called out as vacuously scoped and unchanged.

Product-lens checks on that edit:

- **Consistent with §D.2 at HEAD.** Both `corpusOutcome` sites carry `null, // | "RSN-UNLISTABLE" |
  "RSN-EMPTY"`. The contradiction the item named is gone, in both loci, not just the dispatch row.
- **Consistent with FSPEC's semantics for `null`.** FSPEC E-06 decides exactly this: a corpus
  containing only `{f}`'s own LEARNINGS yields an `RSN-SELF` row and "**not** `RSN-EMPTY`, since a
  document *was* known". TSPEC's "`null` means documents were known" is that clause compressed, not
  a new product decision.
- **Catalogue unchanged and still upstream-true.** `LEARNINGS_CORPUS_OUTCOMES` remains exactly
  `["RSN-UNLISTABLE", "RSN-EMPTY"]`, matching FSPEC's corpus-outcome table (`RSN-UNLISTABLE` — the
  listing failed outright, BR-12; `RSN-EMPTY` — the listing succeeded and found nothing) and the
  set-equality completeness test FSPEC AT-26 asserts over those two ids. Adding `null` to the
  catalogue would have been the tempting wrong fix — it would have broken that set equality and
  blurred "known but nothing selected" against "outcome recorded". The delta explicitly refuses it.
- **The oracle locus is untouched.** §D.1 still says the mirror's domain test "is a membership test
  only … so it does not turn the mirror into an oracle", preserving REQ AC-3.2's per-dispatch locus
  and FSPEC BR-9/BR-10. The scoping narrows an assertion; it does not move the oracle.
- **No product decision was made in the TSPEC.** The edit is a test-scoping statement about a value
  upstream already decided. Nothing here belongs in REQ or FSPEC.

The four-domain count (TE F-04) and the disjointness-in-kind argument are unchanged and still
correct against BR-9.

## Test Strategy

Reviewed only for product fidelity — whether the delta's test statements still preserve the
acceptance criteria they trace to. They do.

- **AC-1.2 / AC-4.3 (BR-1, BR-11).** §A.2's byte-identity claim now reads "the dispatches **outside
  BR-1's rule**" instead of "non-authoring dispatches". Against FSPEC AT-03 at HEAD — which
  compares "the prompt of each dispatch **outside BR-1's rule** — including the authoring-classified
  dispatch with no C-1 target" — the new phrasing is the faithful one and the old one was the
  narrower, now-wrong one. This is a strengthening, not a loosening: the Phase CR optimizer round is
  now inside the byte-identity obligation.
- **AT-02's expected set.** With ERR-7 closed, the two contradictory readings the TSPEC previously
  flagged collapse to one. FSPEC AT-02 asserts set equality over the whole dispatch universe against
  "the subset BR-1's two-conjunct rule names", with the revert-reds fixture. §A.2's
  `learningsDispatchSet.test.js` set-equality assertion over the `docType`s that actually reach the
  injector is complementary, not contradictory — it guards NG-5's boundary against a seventh
  authoring phase, which no upstream AT covers.
- **AC-3.2 / AC-3.3 domain tests.** The non-`null` scoping keeps the happy path green without
  weakening what the tests prove: `RSN-UNLISTABLE` and `RSN-EMPTY` remain the only admissible
  non-`null` values, so a stray id still reds. No acceptance criterion loses coverage.
- **AC-5.2 (BR-15 / AT-33).** ERR-3's closure is verified: FSPEC BR-15 at HEAD now states "The
  corpus enumeration that lists candidate paths contributes **no** member: it opens no file under
  `docs/`, so this instrument does not see it", and compares "both sides … as **sets of paths**, not
  as counts". TSPEC's ERR-3 entry describes exactly that, and correctly notes nothing in the TSPEC
  changes as a result.
- **P-2a's count is oracle-relevant, and it survived de-anchoring.** "Four code sites" is the number
  AT-02's fixture matrix and §A.5's multi-dispatch fixture are sized against. The symbol citations
  still yield exactly four at HEAD, so the de-anchoring did not silently drop a site — the failure
  mode a symbol-for-line swap could have introduced.

No test-strategy claim in the delta narrows, broadens, or re-triggers an acceptance criterion. TE's
lens owns the depth question; from the product lens, traceability is intact.

## Open Questions

The delta rewrites §Open Questions substantially — two errata closed, one de-anchored. Each closure
was checked against upstream at HEAD rather than taken on the note's word.

| Erratum | State after delta | Verified |
|---|---|---|
| **ERR-3** (FSPEC BR-15) | CLOSED, "resolved by FSPEC v0.11" | **Correct.** BR-15 at HEAD states the enumeration "contributes **no** member" on exactly the ground TSPEC raised (it opens no file under `docs/`), and states the comparison as sets. AT-33 tracks it. Nothing in the TSPEC needed to change, as the entry says |
| **ERR-7** (FSPEC BR-1) | CLOSED, "resolved by FSPEC v0.11 and v0.12" | **Correct.** BR-1's two-conjunct rule, the load-bearing second conjunct, the named Phase CR exclusion, AT-02's revert-reds fixture, and the BR-11/AT-03/AT-29/D-2 complement are all present at HEAD. The entry's history is accurate, including that the divergence was real when raised |
| **ERR-2** (FSPEC E-30 / AT-02, land-proof retry) | Still OPEN, citation de-anchored | **Correctly still open.** The retry dispatch exists at HEAD inside `erratumRound()` with `dispatchKind: "authoring"`, and FSPEC E-30 still names "an erratum dispatch" in the singular with no AT-02 fixture for the second. The de-anchoring is well done: the citation now carries the enclosing symbol *and* the retry prompt's opening quote ("Your previous edit to this ${target} did not land the following expected token"), which is a stable identifier — I verified it matches the source verbatim |
| **ERR-4** (REQ G-1 / AC-1.1 vs AC-5.1a) | CLOSED (pre-existing) | Unchanged by this delta; REQ v0.9 still carries the G-1 resolution |

**Closing an erratum inside the TSPEC is the right locus here.** Each closure records what upstream
changed and asserts that nothing in this document moves as a consequence — which is the claim I can
check, and did. No closure quietly imported a product decision into the TSPEC.

**Header re-grounding is accurate.** The Upstream row now reads FSPEC v0.12 / REQ v0.9; at HEAD
FSPEC's version row is 0.12 (2026-08-20) and REQ's is 0.9 (2026-08-19). The v0.7 erratum note
describes the delta truthfully, including "No behavioural change" — which the diff bears out.

**One residual question, not a finding:** the Cross-Reviews row in the header still enumerates
rounds only through v6 for both reviewers, while this is round v11. FSPEC solved the same problem by
replacing the enumeration with "every round present on branch, not hand-enumerated". That is
bookkeeping the TSPEC could adopt at its next natural edit; it makes no claim false, so I am not
filing it.

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
