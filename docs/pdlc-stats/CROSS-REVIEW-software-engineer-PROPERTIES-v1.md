# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Verification Performed

I did not take this document's word for anything mechanically checkable. Every claim below was
re-derived against the working tree at HEAD (`6f3be45e6`).

**Driver classifiers executed, not read.** I imported `pdlc/workflows/orchestrate-dev.js` and ran its
four exported classifiers over the archive directories the document names. Every real-path literal in
§Fixtures and §Oracles' kill map reproduces exactly:

| Document's claim | Executed result | Verdict |
|---|---|---|
| `deriveRoundWindow(…, "TSPEC").startIndex` over `docs/completed/pdlc-advisory-wave-gate/` is `7`, reported value `6` | `startIndex=7`, `−1 = 6` | ✅ |
| same over `docs/completed/pdlc-headless-engine/` is `14`, reported `13` | `startIndex=14`, `−1 = 13` | ✅ |
| `deriveDodRoundIndex(…, "pdlc-loop-economics")` is `3`, reported `2` | `3`, `−1 = 2` | ✅ |
| `parseResolvedMarker` over `POSTMORTEM-PR-pdlc-wave-resume.md` returns `{ok:true,resolved:true}` | exactly that | ✅ |
| `parseReviewFilename("CROSS-REVIEW-product-manager-REVIEW-v1.md")` → `bad_doc_type` | exactly that | ✅ |
| `parseReviewFilename("LEARNINGS-x.md")` → `not_cross_review` | exactly that | ✅ |
| PROP-RR-13's warning that a `se-review` probe returns `bad_role` before the doc-type test | `{ok:false,reason:"bad_role"}` — the warning is correct and load-bearing | ✅ |
| `RESOLVED: yes` is line-leading on the **third** line of `POSTMORTEM-PR-pdlc-wave-resume.md` | line 3, `cat -A` confirms no leading whitespace | ✅ |

**Shipped-code premises.** `pdlc/engine/bin/cli.mjs:141` `VALUE_FLAGS`; `:168` `FLAGS_BY_COMMAND`
carrying exactly four rows (`dev`, `queue`, `doctor`, `decide`), with `doctor:
["plugin-root","cwd","allow-api-key-billing","dev"]` verbatim as PROP-CLI-03 quotes it;
`pdlc/workflows/lib/stats.mjs` absent; `REVIEW_DOC_TYPES` a module-private
`const … Object.freeze([…])` at `orchestrate-dev.js:10105` (**not** `export const`, exactly as
PROP-RR-13 and G-2 state); `REVIEWER_ROLE_SLUGS` = `software-engineer` / `product-manager` /
`test-engineer` (`orchestrate-dev.js:10044`); `export const MODULE_NAMES` at
`pdlc/engine/scripts/prepack.mjs:20` with four members; `resolveWorkflowRoot` exported at
`pdlc/engine/lib/run.mjs:90`; `fast-check` `^4.9.0` in `pdlc/workflows/package.json`; `captureRun` at
`pdlc/engine/__tests__/loop-cli.test.js:386`; `mkdtempSync(path.join(SCRATCH_ROOT,
".tmp-capture-driver-"))` at `learningsCaptureScript.test.js:215` with `SCRATCH_ROOT =
path.resolve(__dirname, "..")` — i.e. genuinely under `pdlc/workflows/`, as PROP-RO-04 says. No
`statSync`/`lstatSync` exists in `bin/cli.mjs` at HEAD, so PROP-RATIO-05's structural conjunct is a
clean additive assertion. `emitReport` is the sole exit-code producer for report commands,
supporting PROP-CLI-06/PROP-NEG-08.

**PLAN task trace — complete.** PLAN §Batches declares `T-01…T-27` (27 rows); §PLAN tasks carries
27 rows, one per task. No task is untraced and no phantom task appears.

**Test-file status — every claim correct.** All fifteen files declared *new* are absent at HEAD
(`statsPreflight`, `statsDoubles`, `statsArgv`, `statsMetrics`, `statsDiscovery`, `statsRender`,
`statsOutcome`, `statsAntiDrift`, `stats-cli`, `stats-cli-structure`, `stats-read-only`,
`_stats-scratch-prefixes.mjs`, `statsRealPaths`, `statsProperties`, `stats-vendoring`). All five
amended test files plus `publish-preflight.mjs` and `fixture-machine.mjs` are present.

**Internal bookkeeping — exact.** I parsed the property tables and the §Test-level distribution
programmatically: 102 property IDs defined, 102 unique, zero duplicates; the distribution partitions
all 102 with declared counts (5/27/16/19/13/22) matching parsed membership row-for-row; and **every
property's `Level` cell agrees with the level it is filed under** — zero disagreements. §Coverage
Matrix cites all 30 FSPEC BRs, all 29 ATs, all 21 ECs and all 9 `REQ-STATS-*` criteria with nothing
in the upstream left uncited.

**PROP-DRIFT-05's "derived" clause — checked, and correct.** I initially read
"`tspecPackedCount`'s vendored class size … **derived** from `MODULE_NAMES` rather than transcribed"
as an implementation echo that would disarm the count oracle. It is not.
`loop-distribution.test.js:186` computes `vendoredClassSize = tspecPackedCount({licence:false}) −
(4 + 15 + 1)`, so the subject comes from `_tspec-packed-set.mjs`'s **transcribed** literal
(`4 + 15 + 5 + 1`, which PLAN T-22 moves to `4 + 15 + 6 + 1`) while the expectation comes from the
independent production enumeration `MODULE_NAMES`. `MODULE_NAMES.length + 1 = 5` equals today's
vendored class size, and both move to `6` together. That is a cross-enumeration tie between two
independently maintained lists, not a value derived from the code under test — the co-change signal
survives. DEC-STATS-01 K-2's note that the count is "deliberately derived from class sizes, not from
`tspecPackedSet().length`" is preserved rather than contradicted. **No finding.**

**Read-only feasibility.** PROP-RO-01/03/04 snapshot the repository root, which invites cross-suite
flake. I checked: no engine test writes repo-root-relative scratch, `pdlc/engine`'s suite is
`node __tests__/_run-suite.mjs` (serial), and CI runs the workflows and engine suites as separate
jobs. `.tmp-*` is the only in-tree scratch prefix, which is exactly what PROP-RO-04 declares. The
stance is feasible as specified. **No finding.**

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | `docs/` root feature-directory count is wrong at HEAD: the document says **twelve**, the tree has **thirteen** | §Fixtures → Real-path fixtures; §Oracles → Exclusion-set oracle |
| F-02 | Low | Local | §Coverage Matrix's REQ table is a containment, not the set-equality its own preamble claims: `A-3`, `O-1`, `O-2`, `O-4` have no row, and `O-2` is cited in PROP-NEG-07's Traces column with no matching row | §Coverage Matrix → REQ acceptance criteria, constraints, risks |
| F-03 | Low | Local | PROP-DISC-08 frames its claim on "a case-insensitive filesystem" but is levelled `integration-fake`, where no filesystem exists; on a real case-insensitive volume the fixture it describes cannot be constructed | §Properties → Discovery |

### F-01 (Medium) — the `docs/` root fixture count is stale by one

§Fixtures' real-path table opens with "Every literal below verified working tree HEAD" and dates the
measurement 2026-08-31. Its `docs/` root row reads *"twenty directories: eight excluded
(`_constraints`, `_decisions`, `_queue`, `completed`, `design`, `discarded`, `ideas`,
`requirements`) … twelve directories"*. §Oracles' Exclusion-set row repeats it: *"eight excluded
names exactly the non-feature directories present, twelve live feature directories satisfy the
witness."*

Measured at HEAD:

```
$ find docs -maxdepth 1 -mindepth 1 -type d | wc -l
21
```

The eight-name excluded half is **exactly right** — `NON_FEATURE_DIRS`'s transcribed literal
`["_queue","_constraints","_decisions","design","requirements","ideas","discarded","completed"]` is
set-equal to the non-feature directories actually present, so PROP-DISC-05's primary conjunct and
G-1's "goes red the moment a ninth directory appears" safety net both hold.

The feature half does not. There are **thirteen**: `orchestrate-dev-workflow`,
`pdlc-adapter-read-cache`, `pdlc-approval-record-tier2`, `pdlc-consolidation-rehost`,
`pdlc-decision-ledger`, `pdlc-halt-hardening`, `pdlc-init`, `pdlc-phase-g`, `pdlc-queue-autoresolve`,
`pdlc-review-tightenings`, `pdlc-size-tiers`, `pdlc-stats`, `pdlc-two-axis-dod`. The thirteenth is
`docs/pdlc-stats/` — this feature's own directory, tracked at HEAD (`git ls-files docs/pdlc-stats/`
returns 60+ files). 8 + 13 = 21, not 20.

Why this is worth fixing rather than shrugging off. The document is emphatic — correctly — that
real-path literals must be **hand-transcribed and never derived** (DC-14, restated in §Oracles'
"Real-path" row and in G-6). An implementer building PROP-DISC-05's witness conjunct is therefore
instructed to transcribe from this table, and transcribing `twelve` lands the test red on the
first run against a tree that is otherwise correct — the worst kind of red, because it looks like an
implementation bug and is a fixture-table typo.

Mitigating, and why this is Medium rather than High: the document already says, immediately below
the table, that the fleet properties are deliberately stated as *invariants, not counts* — "exactly
once", "never `completed`", "three loose files yield no row" — because a feature-count assertion is
falsified by routine archival and "buys nothing". Those three invariants I verified and they all
hold (`docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/completed/REQ-completed.md` and
`docs/completed/QUEUE-HISTORY-rows-0-1.md` are the three loose files;
`docs/pdlc-halt-hardening/` holds only `PLAN-pdlc-halt-hardening.md` and still satisfies the
`-{dirname}.md` artifact-naming witness). So no *property* asserts twelve, and nothing ships broken.

**What resolves it:** in both places, either correct `twenty`/`twelve` to `twenty-one`/`thirteen`,
or — better, and consistent with the paragraph that follows the table — drop the numbers and state
the witness qualitatively ("every non-excluded directory at the `docs/` root satisfies the
artifact-naming witness"), adding one clause saying the count is descriptive context and
deliberately not asserted. The second form is immune to the next archival sweep; the first will be
stale again the next time a feature completes.

### F-02 (Low) — the REQ coverage table claims set-equality and delivers containment

§Coverage Matrix opens: *"Every upstream clause maps to at least one property, and every property
maps to at least one clause. Gaps are named in §Gaps and Open Items rather than left for a reader to
discover."* The REQ table then carries rows for `C-1…C-5`, `R-1…R-6`, `A-1`, `A-2` and `O-3`.

The REQ actually declares `A-1…A-3` and `O-1…O-4`. Four ids — `A-3`, `O-1`, `O-2`, `O-4` — have no
row and are not named in §Gaps. The table includes some assumptions and one obligation while
silently omitting the rest, so a reader cannot tell whether an absent id was considered and
dismissed or overlooked.

`O-2` is the one that actually bites: PROP-NEG-07's Traces column reads `REQ C-5, REQ O-2`, so the
property side of the mapping exists and only the matrix row is missing. That is a straightforward
bookkeeping hole in the direction the document says it has closed.

The other three are defensibly untestable and I would not ask for properties for them — `A-3`
("Authored in an orchestrated, non-interactive dispatch") is a process assumption about this
document's own production; `O-1` routes field spellings to FSPEC/TSPEC; `O-4` is explicitly out of
scope — but "defensibly untestable" is a statement the document should make rather than one a
reviewer should have to infer.

This is the same standard the document holds its own oracles to: PROP-JSON-03 and PROP-JSON-07
demand set-equality over key sets *"never containment"*, precisely so a deleted case fails. The
coverage matrix is an enumerated contract too.

**What resolves it:** add an `O-2` row pointing at PROP-NEG-07 and PROP-DRIFT-01…04, and add one
line under the REQ table recording that `A-3`, `O-1` and `O-4` carry no property by design, with the
one-clause reason each. Alternatively record them as an eighth entry in §Gaps.

### F-03 (Low) — PROP-DISC-08's filesystem framing does not match its level

PROP-DISC-08 asserts feature matching is on exact directory names with no fuzzy, prefix or
case-insensitive matching, and reaches for a case-insensitive filesystem to make the point. Its
declared level is `integration-fake`.

Those two do not sit together. At `integration-fake` there is no filesystem — `fakeStatsIo.listDir`
returns whatever synthetic listing the fixture supplies, so it can return `["Foo","foo"]` freely and
the property is testable exactly as intended. But an implementer who takes the framing literally and
tries to build the fixture on a real volume will find that on macOS's default case-insensitive APFS
the second `mkdir` fails with `EEXIST` — the two directories the property needs cannot coexist. The
claim is sound; only its packaging misleads.

The substance is fully covered and I am not asking for a new property. This is a wording fix.

**What resolves it:** restate the claim as a property of the command rather than of the volume —
"`discoverFeatures` must not case-fold, prefix-match or fuzzy-match: a listing containing two names
differing only in case must yield two distinct rows" — and add the half-sentence that the listing is
supplied by `fakeStatsIo`, which is why the property is levelled `integration-fake` and does not
require a case-sensitive volume to run.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §PLAN tasks says "All fifteen new **test files** were confirmed absent at HEAD". The count of fifteen files is right, but two of them are not test files: `helpers/statsDoubles.js` is a double bundle and `_stats-scratch-prefixes.mjs` is a one-constant module. Worth saying "fifteen new files (thirteen test suites plus two helper modules)" so a reader counting suites against the jest run does not come up short? Not a finding — the artefact list itself is correct. |
| Q-02 | PROP-DRIFT-06 requires `lib/stats.mjs` in `c8.include` **and** in `coverageInstrumentation.test.js`'s P9-02 literal "at the same index". At HEAD that test is titled `"P9-02: exactly six modules …"` and its literal spreads `REQUIRED_INCLUDES` + `CAPTURE_SCRIPT_INCLUDE` + two `lib/` modules. PLAN T-24 does call out "correcting stale count words in P9-02's title comment", so this is covered — but PROP-DRIFT-06's own text mentions only the array. Should the property name the count-word co-change too, so the property and its task agree on the full edit? |
| Q-03 | G-7 records that `docs/completed/` children are unfiltered, so a future `docs/completed/_archive-notes/` would be reported as a feature. PROP-DISC-06 asserts every directory under `docs/completed/` appears as a row exactly once at `integration-fs` over the real archive. When that future directory lands, PROP-DISC-06 goes green (it *is* a row) while the report is wrong. Is G-7 the right home for that, or does it want a leading-underscore guard note so the eventual fix has a named landing site? |

## Positive Observations

- **The real-path literals are genuinely measured, not asserted.** I executed all four driver
  classifiers over the four named archive directories and every number reproduced exactly —
  `startIndex` 7 and 14, `deriveDodRoundIndex` 3, `parseResolvedMarker` `{ok:true,resolved:true}`,
  `bad_doc_type` for `…-REVIEW-v1.md`, `not_cross_review` for `LEARNINGS-x.md`. G-6's re-measurement
  narrative is accurate down to the return values. In a repo where nonexistent-authority citations
  have shipped three times, this is the first PROPERTIES document I have reviewed where the fixture
  table survived execution intact.
- **The mutation kill map does the hard part.** Both `− 1` mutants are killed by literals over *two
  independent corpora* (`pdlc-advisory-wave-gate` and `pdlc-headless-engine`), with the explicit
  reasoning that a single archival change cannot silently disarm the mutant. The two branch-order
  mutants each get a fixture that *defeats the earlier branch* — PROP-RATIO-09's harvested-and-
  zero-spec-bytes case and PROP-RR-11's collision-plus-`LEARNINGS` case are the only configurations
  on which the two orders disagree, and the document says so and builds exactly those.
- **Implementation echoes are hunted deliberately, not avoided by luck.** PROP-JSON-03 forbids
  `Object.keys` of the implementation's own output; PROP-JSON-09 asserts the literal `1` rather than
  the module's `SCHEMA_VERSION`; PROP-DISC-05 forbids reading the module's export; PROP-RR-08 names
  the reason — "transcription tautology cannot appear in the assertion". §Oracles' "Real-path" row
  states the general rule against derivation and cites DC-14.
- **Absence-only oracles are ruled out structurally.** §Oracles' first rule binds PROP-RR-07,
  PROP-DOD-03 and PROP-RATIO-08 to three positive conjuncts each and states plainly that
  `state !== "measured"` is never the assertion. PROP-RO-01's conjunct (a) — "a binary that prints
  nothing, or crashes, fails this property" — is the read-only stance's liveness pair, and it is
  repeated on the failure paths in PROP-RO-02. PROP-RATIO-03 pairs its no-change claim with a
  positive presence assertion on the fixture listing.
- **Set-equality where a deleted case must fail.** PROP-JSON-03/07/08, PROP-CLI-05, PROP-RO-05,
  PROP-RR-13 and PROP-DISC-05 all specify set-equality "in both directions", several with an
  explicit "never containment". PROP-DRIFT-03's construction-site *count* is the sharpest of these:
  an "at least one" check would leave PROP-DRIFT-01 pinning a function nobody calls, and the
  document says exactly that.
- **PROP-PBT-03 shows real property-based-testing literacy.** Stating order-independence over a
  generated *permutation* rather than two identical calls, with the reasoning that JS object keys
  and `Set` iteration are insertion-ordered so a repeat-call property is green for a
  filesystem-ordered implementation — plus the second conjunct pinning order to the constant so a
  stably wrong order also fails — is the difference between a property and a placeholder.
- **The pyramid is argued, not assumed.** 67 properties falsifiable with no filesystem and no
  process, 13 at `integration-fs` because `lstat` semantics and real basenames *are* the claim, 22
  at the CLI edge because flag closure and exit codes are not observable below it, and zero spawned
  E2E — with a sentence justifying each band. PROP-RATIO-04/05's split of the symlink claim into a
  behavioural conjunct on a real filesystem and a structural conjunct on the source, because "a
  behavioural test alone can be satisfied on a platform where the link and its target happen to
  agree", is exactly right.
- **The gaps are honest.** G-1 declines to assert a provisional predicate rather than writing a test
  it will have to rewrite; G-3 refuses a wall-clock assertion and calls it a flake generator; G-5
  admits that a promoted constraint "is a review instrument, not an oracle"; G-7 records an omission
  as a decision rather than letting it read as an oversight. All seven name an owner.
- **Internal bookkeeping is exact under machine check** — 102 unique property IDs, a clean partition
  across six levels with matching declared counts, and every property's `Level` cell agreeing with
  the band it is filed under. Zero discrepancies in either direction.

## Recommendation

**Approved with minor changes**

No High findings. This is the strongest PROPERTIES document I have reviewed in this repo: the
oracles are falsifiable, the fixture literals survive execution against HEAD, the coverage matrix is
complete over every REQ criterion, all 30 BRs, all 29 ATs and all 21 ECs, all 27 PLAN tasks are
traced, and every named test file's present/absent status is correct. Implementation can proceed on
this document as written.

The three findings are all documentation-accuracy items, none of which blocks a wave:

- **F-01 (Medium)** should be fixed before PLAN T-08 is implemented, because that task transcribes
  from the table the finding corrects. It is a one-line edit in two places.
- **F-02** and **F-03 (Low)** are bookkeeping and wording; they can ride along with F-01 or land in
  any later revision.

I found no defect in any upstream document. PROP-DRIFT-05's "derived from `MODULE_NAMES`" clause,
which I flagged for myself as a possible oracle-disarming echo, verified as a legitimate
cross-enumeration tie between two independently maintained lists and contradicts neither DC-14 nor
DEC-STATS-01 K-2. No erratum is raised.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
