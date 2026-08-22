# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/` + the feature's full diff against `main`
**Date:** 2026-08-21
**Iteration:** 2

## Prior-Finding Disposition

Delta re-review of `ce01980e..HEAD` (12 commits; the base is the commit my v1 verdict landed on).
Only my own v1 findings and the sections those commits changed are in scope here.

| v1 ID | Sev (v1) | Status | Evidence |
|-------|----------|--------|----------|
| F-01 | High | **Resolved** | `edac08ed` rebuilt `pdlc/workflows/dist/pdlc-cli.mjs` (+56/−22). `node pdlc/workflows/build-runtime.mjs --check` now prints `in-sync pdlc/workflows/dist/pdlc-cli.mjs`, exit 0, and `consolidationBuild.test.js`'s T32 is green on the committed tree. The shipped artifact is again the artifact the docs describe. |
| F-02 | High | **Resolved** | `23ec96eb` rewrote LI-AT-29's `observe()` (`learningsDispatchSet.test.js:501-508`) off five keys `buildFinalReport` never emits and onto six it does — `phases`, `artifactPaths`, `notices`, `outcome`, `testSummary`, `harvestStatus` — and added four "the instrument fires" controls (`:517-524`), including that some phase row carries a numeric `iterations` and some `detail` matches `/Approved \(\d+ iterations?\)/`. The round-window/verdict arithmetic AC-4.3 protects is now actually inside the compared value. The same defect was found and fixed in LI-AT-35's twin `observe()` (`:1155-1162`), which I had not caught. |
| F-03 | High | **Resolved** | `16545fa6` added `learningsBaselineGuard.test.js:272-353`: the committed fixture bytes are read from disk (`baselineBytes()`) and asserted byte-equal to prompts composed by **branch code at HEAD**, for both capture cases, across all four non-injecting states PLAN §DoD item 4 names (DISABLED / EMPTY / UNLISTABLE / ADMITS-NOTHING). `expect(authoring[0]).toBe(baselineBytes("PHASE-F-AUTHORING-PROMPT", 0))` (`:341`) is the assertion that was missing. ADMITS-NOTHING is the arm that actually opens and parses a corpus document, so AC-6.2's named leak now has a path that can red. The commit message records the mutation proof (framing pair emitted on an empty selection reds EMPTY/UNLISTABLE/ADMITS-NOTHING and correctly leaves DISABLED green). |
| F-04 | Medium | **Resolved** | `23ec96eb` replaced the absence-only clause with a paired oracle (`learningsDispatchSet.test.js:569-596`): positive half asserts the source path IS named in BR-8's rows; negative half asserts it appears nowhere in the serialised report minus `learningsInjection` — all channels, not the one guessed key — plus a non-trivial-subject control. |
| F-05 | Medium | **Resolved** | `8fc59ce6` gave AC-5.2 a real boundary: reads logged at the seam on both arms, and the enabled-minus-disabled read difference asserted **set-equal** to the corpus set (`:1104-1108`), so BR-15's two directory clauses are now consequences of behaviour rather than of `isCorpusPath`'s own filter. Writes are recorded on both arms and compared with no exemption list. |
| F-06 | Medium | **Resolved (code); upstream item routed)** | `6b56cd3e` deleted the undocumented `propagateBytes` guard; overflow past the count window now carries `RSN-COUNT` unconditionally (`orchestrate-dev.js:2517-2519`), which is BR-5's stated rule. See F-03 (v2) below and the ERRATUM lines: the mixed case is still not stated upstream. |
| F-07 | Medium | **Resolved** | `82d18585` moved the composition site below `selectMode` and passes the episode's real mode: `_injectLearnings({ feature, docType, phaseId, mode: selection.mode })` (`orchestrate-dev.js:10348`). A production-path test drives `mainDev` and asserts `mode` is present on every record, set-equal to `{authoring, revision}`, and attributable per docType. |
| F-08 | Medium | **Resolved** | `55e6cf04` drives a real erratum round through `mainDev` and asserts every erratum-round authoring prompt carries the block, identified by source path (`learningsDispatchSet.test.js:385-393`). AC-1.1's third dispatch shape now has a runtime oracle. |
| F-09 | Medium | **Resolved** | `b3df48a7` + `6c11d5b0` execute `check-finding-grammar.sh` by bare path with the real PostToolUse envelope (`hookCompatibility.test.js:490+`), covering warn / no-warn / missing-tag cases with the nudge text and file name asserted. Shebang and executable bit are inside the subject. |
| F-10 | Medium | **Open (non-gating)** | No REQ/PLAN edit landed in `ce01980e..HEAD` (`git log --stat` shows doc changes only under `CROSS-REVIEW-test-engineer-REVIEW-v1.md`). Re-filed as F-01 (v2). |
| F-11 | Low | **Open (non-gating)** | `selectLearnings` still builds `orderKeys` from `ordered`, i.e. eligible documents only (`orchestrate-dev.js:2464-2465`); rejected documents get no entry. Re-filed as F-02 (v2). |

All three of my blocking findings are closed, and closed by the mechanism I asked for rather than by rewording the claim.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium → **Resolved at HEAD** | Process | **Closed by `558d0d96`, which landed after this file's body was drafted.** As drafted, this row carried v1 F-10 forward: the erratum restatement retry, the rewritten `findingGrammarClause()`, `check-finding-grammar.sh`, and the `## Delta-Confirmation Findings` sections in `pdlc/skills/{pm,se,te}-review/SKILL.md` were all shipping under this feature's REQ while tracing to POSTMORTEM-D remediations rather than to any acceptance criterion, and my accepted fix was *either* a REQ/FSPEC addendum *or* a PLAN §DoD note recording them as consciously carried. PLAN v1.0's **new DoD 14** is that second option, taken in full: it names all four remediations, names the test that owns each, and states plainly that **REQ G-5 holds for the injection region but not for this branch as a whole**, because (a) changes how many dispatches an erratum round may make. I verified each subject it names exists at HEAD rather than trusting the clause: `erratumProtocol.test.js:1383-1495` carries `RT-1g-a`…`RT-1g-e`, and `hookCompatibility.test.js:490` carries the `CR round 1 (PM F-09)` block. The clause also declines to widen the DoD — clauses 1–13 remain the injection region's bar — which is the right call: disclosure is not a substitute for scope. **Not counted in the verdict JSON below.** The REQ half remains routed as an erratum, since a PLAN can disclose scope but cannot authorise it. | REQ G-5, NG-7 |
| F-02 | Low | Local | **`orderKeys` still records eligible documents only, not "per corpus document"** (carried from v1 F-11). `selectLearnings` derives `orderKeys` from `ordered` (`orchestrate-dev.js:2464-2465`), which is built from `eligible` (`:2463`); documents rejected `RSN-SELF`, `RSN-UNREADABLE`, `RSN-UNPARSEABLE` or `RSN-NO-MATERIAL` never appear. TSPEC §D.2 words BR-10 locus 1 as "an ordering key per corpus document observed on THIS dispatch", and its own illustrative record shows an `{ path: "docs/x/LEARNINGS-x.md", orderKey: null }` entry — i.e. the document's example already contains the shape the code does not produce. Nothing an operator needs is lost (`rejected[]` carries the reason), so this stays Low, but the doc and the record disagree. Fix: record `orderKey: null` for rejected documents, or narrow §D.2's wording (upstream — routed as an ERRATUM line below). | REQ AC-3.3; TSPEC §D.2 |
| F-03 | Low | Local | **The overflow reason rule is now correct but still rests on an inference upstream has not confirmed.** `6b56cd3e` was the right call — the deleted `propagateBytes` guard produced an operator-unpredictable `RSN-COUNT`/`RSN-BYTES` split and appeared in no upstream document — and the new behaviour (`orchestrate-dev.js:2517-2519`, overflow always `RSN-COUNT`) follows BR-5's stated ordering. But FSPEC BR-5/BR-6 and REQ AC-3.2 still do not state the mixed case (count cut AND total-byte failure in the same selection) in so many words, so the shipped rule is derived rather than transcribed, and `LI-AT-13`'s expectations are the only place it is written down. This is exactly the class of thing the next reader has to reconstruct. Recorded as Low because the code now matches the one reading upstream supports; the durable fix is the FSPEC/REQ erratum routed below. | REQ AC-3.2; FSPEC BR-5, BR-6, AT-08 |

**Scope legend.** `Local` — addressed in the optimizer loop, discarded with this file. `Cross-Feature` — promoted to `docs/_constraints/` or a DECISIONS doc at harvest. `Process` — routed to process learnings at harvest.

**Not counted against this document.** `documentOracles.test.js` `AT-22` is red in a full-suite run (`coveredViolations(LIVE_ROOT)` returns 199 entries, every one under `.claude/worktrees/agent-*/`). This is the local-environment artifact `CLAUDE.md`'s debugging note describes — the oracle walks the whole tree under `root`, skipping only `.git/` and `node_modules/`, so untracked agent worktrees pollute it. Not a defect of this feature. Full `pdlc/workflows` suite otherwise: **3978 passed, 1 failed, 70 skipped**; the 14 learnings + hook + build suites are **153/153 green** (`npm test -- __tests__/learnings __tests__/hookCompatibility.test.js __tests__/consolidationBuild.test.js`). v1 measured 3 failures; two of them are gone.

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC §D.2's illustrative dispatch record spells the per-dispatch context as `mode: "creator"`, but `selectMode`'s codomain — the value now correctly wired at the one production call site (`orchestrate-dev.js:10348`) and asserted set-equal to `{authoring, revision}` by the new test — has no `creator` member (`selectMode`, `orchestrate-dev.js:7909`). The implementation follows §5.6.1, which I read as authoritative; §D.2's literal is the stale one. Routed as an `ERRATUM: TSPEC` line rather than a finding, since the defect is in the upstream document, not in front of me. Flagging it here so the answer is on the record: is `authoring`/`revision` what the operator-facing report should say, or did §D.2 intend a third, dispatch-shape-level vocabulary (creator / optimizer / erratum) that AC-1.1 also uses? Those are different vocabularies and the report can only carry one. |
| Q-02 | Q-03 from v1 is still open and is not a code deliverable: REQ O-1 obliges measuring realised authoring-prompt sizes on a live run before §4.1's three thresholds are treated as settled, and O-3 obliges recording whether authors used the injected material. Both die with this branch's cross-review files unless they are written somewhere durable. Should they land as queue rows, or in `pdlc/OPERATIONS.md`, before PUB? |

## Positive Observations

- **The baseline is now an oracle rather than an exhibit, and it was wired the hard way.** `learningsBaselineGuard.test.js:272-353` does not compare the fixture to itself and does not compare one branch run to another: it reproduces both capture scenarios against branch code at HEAD and asserts byte-equality with merge-base bytes read off disk, once per each of PLAN §DoD item 4's four non-injecting states. The reasoning for why four states and not one is written down at the point of use (each reaches "no block" by a different path; only ADMITS-NOTHING actually opens and parses a corpus document, which is the path AC-6.2's leak would take). That distinction was not in my finding — the revision found it while fixing it.
- **The AC-4.3 fix generalised beyond the finding.** I filed the vacuous `observe()` against LI-AT-29 only. The revision found and fixed the identical defect in LI-AT-35's twin (`learningsDispatchSet.test.js:1155-1162`), which I had missed. Fixing the class rather than the instance is the behaviour that keeps a review loop from converging on whack-a-mole.
- **Every fix this round came with its own "the instrument fires" control.** The four post-equality assertions at `learningsDispatchSet.test.js:517-524`, the `expect(prompts).toHaveLength(2)` / `toHaveLength(1)` controls in the baseline block, `expect(f.length).toBeGreaterThan(1000)`, the non-trivial-subject check on the F-04 negative, the difference-fires check on the F-05 read set. That is the standing recommendation from v1 applied without being asked per-site, and it is why I can read these greens as evidence rather than as absence of evidence.
- **F-06 was fixed by deleting the undocumented behaviour, not by documenting it after the fact.** The easy resolution was to write the `propagateBytes` guard into FSPEC and call it specified. Instead the guard was removed, the code was aligned to the rule BR-5 already states, `LI-AT-13`'s fixture comment was stripped of the byte count tuned to keep the failure off the window's last slot, and the residual ambiguity was routed upstream as an erratum. The comment at `orchestrate-dev.js:2496-2516` even names the one line to change if upstream lands the other reading. That is the disposition that leaves the next operator able to predict the report.
- **F-05's boundary is now an experiment, not a filter.** Asserting BR-15's two directory prefixes over a set built by `.filter(isCorpusPath)` was true by construction; asserting that the *enabled-minus-disabled read difference* is set-equal to the corpus set makes any extra open red, in any directory, without anyone having to guess which directory to name. Same reasoning as F-04's "subject is the whole report minus one key". Both replaced a guessed channel with an exhaustive one.
- **The hook now has behaviour coverage that runs the real script through the real envelope.** `hookCompatibility.test.js:490+` spawns `check-finding-grammar.sh` by bare path with a PostToolUse stdin envelope, so the shebang and the executable bit are part of the subject, and pairs the warn case with the no-warn case on the same document shape. POSTMORTEM-D item 8's two halted rounds now have a guard that can actually fail.

## Recommendation

**Approved with minor changes**

All three of my v1 High findings are closed, each by the mechanism the finding asked for:

1. **F-01** — the shipped runtime bundle is rebuilt and in sync; `build-runtime.mjs --check` exits 0 and T32 is green on the committed tree.
2. **F-02** — AC-4.3 has a live oracle over report keys that actually exist, with controls proving the compared value is non-empty and carries the round-window arithmetic.
3. **F-03** — the committed pre-feature fixture is read from disk and compared byte-for-byte with prompts composed by branch code, across all four non-injecting states, with a recorded mutation proof.

Four of the seven v1 Mediums (F-04, F-05, F-07, F-08) and F-09 are also closed, two of them by production changes rather than by test changes. No High finding is open, old or new, and nothing in the changed sections broke what I approved in v1: the sole full-suite red is `documentOracles.test.js` AT-22, a local worktree artifact documented in `CLAUDE.md`, and the feature's own 153 tests are green.

The three findings above are recorded, not gating. F-01 (v2) is a scope-ledger decision for the operator, not a code change. F-02 (v2) and F-03 (v2) both have their durable half routed upstream as errata; the code half of each is already in the state I would ask for.

**Closing pass (re-verified at HEAD = `558d0d96`).** Every claim in this file was re-checked against the committed tree, not against my working notes, and the pass changed two things that a silent edit would have hidden.

**1. F-01 closed after this file's body was drafted.** The body was committed at `489063df`; five commits landed after it (`4f2ece07` LI-13, `e010c2b2` LI-22, `137753ee`, `b3628218`, `661d51a5`, `558d0d96`). Two of them answer findings of mine, so the drafted text was stale in my own favour and against the author's. `558d0d96` adds **PLAN DoD 14**, which is exactly the second of the two fixes F-01 offered — the four POSTMORTEM-D remediations are named, each with the test that owns it, and REQ G-5 is explicitly narrowed to the injection region rather than claimed for the branch. I verified the clause's named subjects instead of accepting the clause: `RT-1g-a`…`RT-1g-e` exist at `erratumProtocol.test.js:1383-1495`, and the `CR round 1 (PM F-09)` block at `hookCompatibility.test.js:490`. F-01 is marked resolved above and **removed from the counts**, which fall from `{0,1,2}` to `{0,0,2}`. The verdict value is unchanged — Low-only still maps to *Approved with minor changes* — so this correction moves the counts, not the recommendation.

**2. The code anchors were stale a second time, from a cause worth naming.** My v1 closing pass repaired anchors that had drifted during authoring; LI-13 and LI-22 then landed *between* this file's body and this pass and moved them again — `selectMode` 7836 → **7909**, the `_injectLearnings` call site 10275 → **10348**, `orderKeys` 2450 → **2464-2465**, the overflow `RSN-COUNT` push 2503 → **2517-2519**, the `propagateBytes` epitaph 2483 → **2498**. All are corrected in place. In every case the cited *behaviour* was present and unchanged at HEAD — I re-read each site rather than re-deriving the line number — so no finding, severity or scope tag moved. Test-file anchors were re-checked and were already correct (`learningsDispatchSet.test.js:501-524` and its twin at `:1157-1164`, `learningsBaselineGuard.test.js:341`, `learningsDispatchSet.test.js:1104-1108`). That a re-review's anchors can rot twice inside one phase is itself the argument for DEC-DOC-01's preference for headings and spec ids over `file:line`; I am not filing it again, but it is why every anchor above is paired with a quoted symbol.

**Re-measured at HEAD, not carried forward.** `node pdlc/workflows/build-runtime.mjs --check` prints `in-sync pdlc/workflows/dist/pdlc-cli.mjs`, exit 0 — `661d51a5` rebuilt the bundle after LI-22's reflow re-staled it, so v1 F-01 is closed against the *current* tree and not merely against the tree that first closed it. The feature's own suites are **147/147 green across 14 suites** (`npm test -- __tests__/learnings __tests__/hookCompatibility.test.js __tests__/consolidationBuild.test.js`); the body's "153/153" was measured before LI-13/LI-22 changed the suite composition, and 147 is the number that is true now. The `documentOracles.test.js` AT-22 caveat recorded above stands unchanged and remains an untracked-worktree artifact of this machine, not a defect of this feature.

Nothing in the five post-draft commits broke anything I approved: LI-13 and LI-22 are the PLAN's own final tasks, the two review-file commits touch no code, and the two remaining commits each close a finding. My two open findings are Low, both with the code half already in the state I would ask for and the durable half routed upstream.

**Second closing pass (re-verified at HEAD = `2c3cd864`).** The pass above was measured at
`558d0d96`, which is **no longer reachable** — the branch history was rewritten after it, so every
hash that pass cites has been replaced. I re-ran the pass against the current tree rather than
re-labelling the old one, and it changed two things.

**1. F-03 (v2) is closed upstream; the FSPEC/REQ errata I routed have landed.** That finding said
the overflow rule was correct but *derived* — BR-5/BR-6 and AC-3.2 did not state the mixed case
(count cut and total-byte failure in the same selection), so `LI-AT-13` was the only place it was
written down. Both halves are now stated. FSPEC v0.14 carries a **"The mixed case, stated."**
paragraph under BR-6: "Documents past the window carry `RSN-COUNT` whatever the window's byte
outcome turns out to be; only documents the total bound dropped from inside the window carry
`RSN-BYTES`", and it records the rejected `propagateBytes` reading with the concrete operator
symptom that killed it (a failure at window index 2 labelling documents 6+ `RSN-BYTES` while the
same failure at index 4 labels them `RSN-COUNT`). REQ v0.10's **AC-2.4** carries the product half:
each dropped document is "**attributed to the bound that actually removed it**… The reason ids of
AC-3.2 name causes, not coincidences." I checked the code against the new text rather than assuming
they were written together — `selectLearnings`'s overflow loop still pushes `RSN-COUNT`
unconditionally, and the epitaph comment above it has been rewritten from "routed upstream" to
"Code and specification now agree; there is nothing left routed", which is now a true statement.
**F-03 is resolved and removed from the counts**, and the `ERRATUM: FSPEC` / `ERRATUM: REQ` lines
my draft carried are **withdrawn** — re-routing a landed erratum would send the author back to work
already done. Counts fall from `{0,0,2}` to `{0,0,1}`; the verdict value is unchanged.

**2. F-02 (v2) is still open, and I confirmed it rather than assuming it survived.** TSPEC §D.2's
BR-10 locus-1 comment still reads "ordering key **per corpus document**, as observed by THIS
dispatch", and the illustrative `runMirror` still shows an `{ path: "docs/x/LEARNINGS-x.md",
orderKey: null }` entry, while `selectLearnings` still derives `orderKeys` from `ordered` — the
eligible documents only — so a rejected document produces no entry and the document's own example
remains a shape the code does not emit. Still Low: `rejected[]` carries the reason, so nothing an
operator needs is lost. Its `ERRATUM: TSPEC` line stands, as does Q-01's (§D.2's `mode: "creator"`
literal, still present, still outside `selectMode`'s `{authoring, revision}` codomain).

**Re-measured, not carried forward.** `node pdlc/workflows/build-runtime.mjs --check` prints
`in-sync pdlc/workflows/dist/pdlc-cli.mjs`, exit 0 — the rewritten history re-staled and re-rebuilt
the bundle, and it is in sync at HEAD, so v1 F-01 stays closed against the tree that will actually
ship. The feature's suites are **235/235 green across 16 suites**; the pass above measured 147/147
across 14, and the difference is one new commit adding **419 lines of test** for eight PROPERTIES
properties that no AT-driven suite reached. I sampled it rather than counting lines: its
PROP-ORDER-01 case is the kind of test I would have asked for — it picks a path pair where UTF-16
code-unit order and UTF-8 byte order **disagree** (U+FFFF versus U+10000), asserts the fixture's two
orderings really do disagree *before* asserting on the comparator, and pins both documents to an
identical absent `Date Completed` so the path comparator alone decides. That is a fixture that can
fail for the reason it names. Nothing in the three post-pass commits touches behaviour I approved:
one is test-only, one is the dist rebuild, one is another reviewer's file. The
`documentOracles.test.js` AT-22 caveat recorded above stands unchanged — still an untracked-worktree
artifact of this machine, not a defect of this feature.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
