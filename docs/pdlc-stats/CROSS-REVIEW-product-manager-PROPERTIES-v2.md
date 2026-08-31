# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 2

## Delta scope

Re-review of v1.1 against my `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`. The diff reviewed is
`git diff 6f3be45e6..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` — 37 insertions, 19
deletions across six commits (`108bb7c8f`, `fcb192ea3`, `ce8fd619f`, `e302679d3`, `ea4eb301e`,
`aa7e06626`). Changed sections: revision history, §Properties preamble, PROP-CLI-03, PROP-DISC-04,
PROP-DISC-08, new PROP-DISC-10, new PROP-ERR-10, §Oracles (exclusion-set row, new
reason-catalogue row), §Fixtures (`F-EXCLUDED-ONLY`, real-path `docs/` row), §Coverage Matrix (REQ,
FSPEC AT/EC, PLAN task, test-level distribution tables), §Gaps G-4. Sections outside this set were
approved in v1 and were not re-read.

### Prior findings — disposition

| Prior | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | PROP-DISC-10 added, `integration-fake`, with the positive outcome spelled out (same header line as a populated run, empty feature list, `features` set-equal `{}`, `unclassified` set-equal `[]`, both keys present, exit `0`) and a named falsifier (an implementation taking EC-09's root-failure branch fails). `F-EXCLUDED-ONLY` added under §Fixtures' constructed table carrying all eight names; matrix rows `EC-20 \| PROP-DISC-10` and `AT-18 \| …, PROP-DISC-10` repointed. Faithful to FSPEC EC-20 (`FSPEC-pdlc-stats.md:568`: "An empty report — a header and no feature rows — and exit 0") and to the fleet JSON shape (`FSPEC-pdlc-stats.md:758-759`: three top-level keys, `features` keyed by feature name). |
| F-02 | Medium | **Resolved and independently re-verified** | §Fixtures and §Oracles now read twenty-one directories / thirteen feature directories. Re-measured at HEAD: `ls -d docs/*/` = 21; eight excluded names present; the remaining thirteen each satisfy the artifact-naming witness (`docs/pdlc-stats/` included, six matching basenames of 66 files; `orchestrate-dev-workflow` 7/7; the other eleven 1/1). The "verified green at HEAD" warranty is now arithmetically true. |
| F-03 | Medium | **Resolved** | PROP-CLI-03 gained a verbatim conjunct on the `USAGE` line. The mechanism is grounded: `checkFlags` (`pdlc/engine/bin/cli.mjs:1012-1019`) writes `USAGE` to stderr before exiting 1, and `USAGE` at HEAD (`pdlc/engine/bin/cli.mjs:59-69`) carries exactly the five command lines the property names — `dev`, `queue`, `decide`, `doctor`, `hello \| spike:sdk` — and no `stats` line, so the half is red until T-17, exactly as stated. G-4 narrowed to the prose in `OPERATIONS.md`/`README.md` only. |
| F-04 | Medium | **Resolved, with one residual claim to soften** (new F-01 below) | PROP-ERR-10 added: set-equality in both directions against a hand-transcribed literal, collected behaviourally, never by reading a module constant. §Oracles gained a reason-catalogue row. |
| F-05 | Low | **Resolved** | REQ table gained an `O-2` row (`PROP-DRIFT-01…04, PROP-RR-13, PROP-NEG-07`) whose label — "no divergence from the driver's classification" — is REQ O-2's own requirement clause (`REQ-pdlc-stats.md:261-263`), plus an explicit statement of why `A-3`, `O-1`, `O-4` carry none. The closing enumeration checks out: nine `REQ-STATS-*` ids exist in REQ, and `A-3` is indeed an assumption about this document's production (`REQ-pdlc-stats.md:281`). |
| F-06 | Low | **Resolved** | EC-17 repointed into PROP-DISC-04 as an explicit REQ-less-directory conjunct naming `docs/pdlc-halt-hardening/`, verified at HEAD to hold only `PLAN-pdlc-halt-hardening.md`. The property now states both halves and names a falsifier for each.  |

### Counts re-derived

The revision moves several totals; all of them check out against the document's own tables. Counting
`PROP-` ids in §Properties gives **104**, matching the preamble. Per-level counts: `unit-pure` 5,
`unit-seamed` 27, `unit-render` 16, `integration-fake` 21, `integration-fs` 13, `process` 22 — sum
104, and the §Test-level distribution table's Count column matches each one. `5+27+16+21 = 69`, the
new "69 properties falsifiable without a filesystem or a process". Both new properties are
`integration-fake`, which is exactly the one level whose count moved (19 → 21).

## Findings

All three are new in this round's bytes and sit inside sections the round edited. No prior finding
remains open; no High finding is open anywhere in the document.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **PROP-ERR-10's addition-detection claim is stronger than its oracle.** The property collects `error.reason` values "behaviourally by driving every refusal scenario of FSPEC §5's table through `runStats` under `--json`", then asserts set-equality with the literal `["not_found","no_docs_root","unreadable_feature"]`, and claims "A fourth reason released without an FSPEC edit fails". The subset direction is genuinely protected — deleting one of the three, or renaming one on an existing §5 scenario, reds the test, which is the drift REQ R-5 names and the substance of my v1 F-04. But the superset direction only sees reasons reachable from §5's own scenario set. A fourth reason emitted on a scenario *not* in that table — precisely the "released without an FSPEC edit" case the sentence describes — never enters the collected set, and the test stays green. This is not a coverage regression (the enum is pinned where it was unpinned before) but the warranty as written would let an implementer believe the enum is closed in both directions when it is closed in one. **Fix:** either restate the falsifier honestly — "a renamed or deleted reason fails; a reason added on a scenario outside FSPEC §5 is caught by PROP-JSON-03's key-set equality and by FSPEC review, not here" — or add a conjunct that also sweeps the `fakeStatsIo` `throwOn` seams PROP-ERR-09 already drives, so unexpected-failure paths contribute their reasons to the same collected set. | REQ R-5; FSPEC BR-30 |
| F-02 | Low | Local | **PROP-DISC-10's PLAN trace and the §PLAN tasks table disagree about T-06.** The property's Traces column reads `PLAN T-05/T-06/T-07`, but §Coverage Matrix' PLAN task table lists PROP-DISC-10 only under `T-05 discovery reds` ("discovery half") and `T-07 outcome reds`; the `T-06 render reds` row (`pdlc/workflows/__tests__/statsRender.test.js`) is unchanged and does not name it. Since one of the property's positive conjuncts is a *rendering* claim — "the human report must carry the same header line as a populated run and an empty feature list" — the omission matters to the implementer reading the task table forward to decide what T-06's red must assert. Coverage is not lost (T-07 exercises the rendered outcome through `runStats`), but the two tables are the document's bidirectional traceability and they should agree. **Fix:** either add PROP-DISC-10 (header half) to the T-06 row, or drop `T-06` from the property's Traces and let T-07 own the rendered assertion. | FSPEC EC-20, AT-18; PLAN T-05/T-06/T-07 |
| F-03 | Low | Local | **"as a real directory" reads as a filesystem instruction inside a fake-IO property.** PROP-DISC-10 is levelled `integration-fake` and its fixture `F-EXCLUDED-ONLY` sits under §Fixtures' heading "Constructed fixtures (over `fakeStatsIo`)", yet the property's last sentence requires the fixture to hold each of the eight names "as a real directory". The intent is plainly *as a directory entry rather than a file* — the distinction PROP-DISC-04 turns on, and the one an implementation that ignores `isDirectory` would fail — but "real" is the document's own word elsewhere for the real-path level (§Fixtures' "Real-path fixtures measured at HEAD"), so the sentence invites an implementer to build this leg on disk and re-level the property. Given PROP-DISC-08's revision in this very round added a careful paragraph about *why* a leg is fake rather than real, the same care is worth spending here. **Fix:** "as a directory entry (`isDirectory` true), not as a file". | FSPEC EC-20, AT-18 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-DISC-10 requires the fixture to hold "every one of `NON_FEATURE_DIRS`' eight names", and `F-EXCLUDED-ONLY` includes an empty `completed/`. That makes the fixture's exclusion list a second hand-transcription of the same eight names PROP-DISC-05 pins by set-equality against the real `docs/` root. If BR-25's eight ever change, both must move together. Is that duplication deliberate belt-and-braces, or would `F-EXCLUDED-ONLY` be better stated as "the eight names PROP-DISC-05 pins" so there is one transcription to maintain? Either answer is fine; I would just like it decided rather than inherited. |
| Q-02 | PROP-CLI-03 now carries two claims of quite different lifetimes: the flag-rejection claim (true today, must stay true) and the `USAGE` line claim (deliberately red until T-17 lands). When T-09's red is written, both halves fail together and the failure message will name the flag property. Is that acceptable to the implementer, or would a one-line note in the property — "the `USAGE` half is the last to go green" — save a wave's confusion? |

## Positive Observations

- **The High finding was closed at its root, not at its symptom.** F-01 asked for a property that
  could falsify EC-20. What landed is a property that spells out the *positive* outcome in four
  conjuncts — header line, empty feature list, `features` set-equal `{}` and `unclassified`
  set-equal `[]` with both keys **present** rather than omitted, exit `0` — and then names the wrong
  implementation it kills ("an implementation that treats 'nothing to report' as 'nothing to read'
  and takes EC-09's root-failure branch fails"). The "both keys present, not omitted" clause is the
  part I did not ask for and the part that matters most: it is the difference between an empty
  report and a malformed one, and a consumer of `--json` (REQ R-5's future
  `harvest-learnings` integration) would break on the second while a containment check passed.
- **The corrected measurement was corrected everywhere, including where it stung.** The `docs/` root
  numbers moved in both §Fixtures and §Oracles, and the revision explicitly names this feature's own
  `docs/pdlc-stats/` as the thirteenth — the directory that was easiest to overlook because it did
  not exist when the count was first taken. I re-ran the witness independently over all thirteen and
  every one passes. The surrounding sentence still says "invariants, not counts" for the *assertions*
  while the prose carries the measurement, which is the right split: the numbers are the reader's
  sanity check, not the test's oracle.
- **PROP-CLI-03's new conjunct is argued from the code rather than asserted.** It explains why the
  `USAGE` line is pinned there and not on PROP-CLI-05 — `USAGE` is module-private and reaches an
  observer only through `checkFlags`' stderr write — and then states what stderr carries at HEAD so
  the red is expected rather than alarming. I checked both claims: `pdlc/engine/bin/cli.mjs:59-69`
  lists exactly the five command lines named, and `checkFlags` at `:1012-1019` writes `USAGE` then
  the error then sets exit 1. This is the standard the document set for itself in v1 and it held
  under revision.
- **PROP-DISC-08's rewrite made the property honest about its own reach.** It was already correct;
  the revision restates it as a claim about the command rather than about the volume, and explains
  that a real-path fixture is impossible on case-insensitive APFS because the second `mkdir` fails
  `EEXIST`. That is a test-level justification I would have accepted without explanation, offered
  anyway. Same for PROP-DISC-04, which now states both halves — loose files yield no row, a
  REQ-less directory yields an ordinary row — and names the falsifying implementation for each.
- **The revision history is a real changelog.** Each entry names the property added or amended, the
  reviewer finding it answers, and the severity. That is what lets a delta re-review be a delta
  re-review rather than a re-read, and it is the reason this round cost a fraction of the last one.
- **Nothing was over-corrected.** Six findings, six targeted edits, 37 insertions. No section I
  approved in v1 was rewritten, no property was renumbered, no count was left stale — I re-derived
  all six level counts and the two totals and every one is consistent. Restraint in a revision is
  underrated and worth naming.

## Recommendation

**Approved with minor changes**

The High finding from v1 is closed, and closed well. All five Medium/Low findings are closed too,
and I re-verified the factual ones against HEAD rather than taking the revision's word for them: the
`docs/` root really does hold twenty-one directories and thirteen feature directories, all thirteen
really do satisfy the witness, `USAGE` really does carry five command lines and no `stats` line,
`checkFlags` really does write it to stderr, `docs/pdlc-halt-hardening/` really does hold only a
PLAN, and FSPEC EC-20 really does promise a header, no feature rows and exit 0. No High finding is
open anywhere in the document.

The three findings this round are all improvements to claims the document makes about itself, not
gaps in what it covers, and none blocks approval:

1. **F-01 (Medium)** — soften or strengthen PROP-ERR-10's "a fourth reason fails" warranty so it
   describes the direction the oracle actually closes.
2. **F-02 (Low)** — reconcile PROP-DISC-10's `T-06` trace with the §PLAN tasks table.
3. **F-03 (Low)** — say "directory entry (`isDirectory` true)" rather than "real directory" in
   PROP-DISC-10, so the fake-IO level is not read as a filesystem instruction.

All three are one-sentence edits and can land in the author's next pass without another review
round.

## Delta-Confirmation Findings

Not applicable — this is an ordinary iteration-2 delta re-review of a revised document, not an
erratum delta confirmation. The findings above carry the ordinary-round `Scope` legend
(`Local` / `Cross-Feature` / `Process`). The `FINDING:` lines emitted with this review carry the
provenance/locality tags the workflow's gate reads; all three are `delta` (introduced by this
round's bytes) and `local` (inside sections this round edited).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:7baf9b336f04c0e1848ff370878646f7c08f0ccccabf13eb8aaba312bbbecab6
APPROVAL-HASH-NORMALIZED: sha256:d90ae161c3bb302cc2f972362066d267fe92031d897504e59daa1b955b4edd72
REVIEWED-COMMIT: aa7e066266904ce9435a5183db9c052b61a3c094
UPSTREAM-STATE: REQ sha256:5f3e80519b982f29ab0b6dad30fa776b4be4b2d34085b235ad755890064ed9f8
UPSTREAM-STATE: FSPEC sha256:c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d
UPSTREAM-STATE: TSPEC sha256:f2261510e5b63be00a859776877eb3513e453da0728c10eaecca8b5bb04d244f
UPSTREAM-STATE: DECISIONS sha256:48522bf9e03f6a459ce4c38eb0aa4b8fcb00d6c2d3693c749167af7bc2a4c88e
UPSTREAM-STATE: PLAN sha256:7c2a888d79a92ee102fcc7c976661d7e371763e565df0261393e714c05f93f73
