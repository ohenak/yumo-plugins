# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.2)
**Date:** 2026-08-11
**Iteration:** 2

**Scope:** Delta re-review of the testing lens only. Round 1's eight findings are
re-checked against the diff `f81f2d75..HEAD`; changed sections are scanned for new
issues; unchanged sections already reviewed are not re-litigated. Every factual claim
below is grounded in HEAD source on `feat-pdlc-headless-engine` and cited `file:line`.

## Round-1 disposition

| Prior | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | High | **Mostly resolved** — the closed allow-list is gone and the guard is restated as containment, which *is* writable. One boundary is still unstated; carried forward as F-01 below at Medium | DEC-ENG-05, "The cost this decision accepts" |
| F-02 | High | **Resolved** | The rung number is no longer pinned. The entry now cites `FSPEC:292` (rung 5 = billing posture), `FSPEC:307-311` (BR-START-2 totality), `TSPEC:834`/`:840` (`rung: 0..5`, "always all six") and leaves the placement to an FSPEC erratum — rung 6, or rung 5 redefined with per-cause ids. All five citations verified verbatim. `FSPEC:392`'s dry-run non-fatality is explicitly *not* inherited by placement. The two-tests-disagree-on-one-fixture failure mode is gone |
| F-03 | Medium | **Resolved** | "Wrong in one direction, by over-listing" is exactly right: `pdlc/engine/lib/startup.mjs:18-37` freezes 17 entries whose own comment says "15 skills + 2 supplements", and the five over-listed names (`consolidate-learnings`, `orchestrate-dev`, `orchestrate-queue`, `tech-lead`, `tech-lead-python`) are precisely the operator-invoked-only set |
| F-04 | Medium | **Resolved, and the correction is accurate** | I re-derived the scanner's yield independently. Five names, and every cited site is real: `ship-pr` (`orchestrate-dev.js:8008`, `:8112`), `dod-verify` (`:8035`, multi-line under `_agent(` at `:8034`), `se-implement` (`:8064`, `:10028`, `:10068`, `:10142`, `:10251`), `se-author` (`:9964`, `orchestrate-queue.js:1216`), `harvest-learnings` (`:10542`, plus the non-call-site `skill:` field at `:10448`). The five missed identifiers (`pm-author`, `pm-review`, `se-review`, `te-author`, `te-review`) appear only in `PHASE_DISPATCH` rows and, for `se-review`, in `ADVISORY_RUNG_SKILL` (`:1797`) |
| F-05 | Medium | **Resolved** | The key is now `platform` + `transport`; `sdkVersion` and `date` are provenance. The caret pin is real (`pdlc/engine/package.json:16`, `^0.3.226`), the row grammar is real (`TSPEC:1336`), and red/green fixtures are now constructible from the text alone. The off-matrix consequence is stated as an intended product call routed to O-ENG-T5 rather than smuggled in |
| F-06 | Medium | **Resolved, well** | Step 4 is scoped to unfiltered runs and reports **skipped-with-reason**, which is the same shape BR-START-2 already demands of the rung ladder (`FSPEC:311`: "report as *skipped, with the reason* — never as passing"). One residual gap raised as F-02 below |
| F-07 | Medium | **Resolved** | The mis-built arm now asserts an explicit allow verdict *and* that the deletion completes (the `CROSS-REVIEW-*` file is gone). Both arms observe a verdict and a filesystem effect; the three false-pass routes I named — hook never invoked, command never matching the scope regex (`guard-harvest-before-delete.sh:35`, `:37`), error swallowed — are all closed |
| F-08 | Low | **Resolved** | The wave-set declaration is now set-equality in both directions with its maintenance rule and drift-toward-green failure mode stated. Consistent with HEAD: exactly three `MODEL_IMPLEMENTATION` sites (`orchestrate-dev.js:10030`, `:10143`, `:10253`) against `MODEL_DEFAULT` elsewhere (`:8971`, `:9245`) |

Nothing in the diff broke a section that was sound in round 1. The §7 and §8 rows were
re-synced with the corrected entries (five-name scanner, over-listing only, containment
test, filtered-run skip, positive mis-built arm, blocked-on-upstream probe), so the
collated tables no longer restate superseded measurements.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The containment guard is writable now, but its quantifier's boundary is unstated, and under the reading the entry's own text invites it is red at HEAD in two places.** The clause quantifies over "every string literal … that matches a skill-identifier *shape*", then defends green-at-HEAD by noting that role slugs (`software-engineer`, `product-manager`, `test-engineer` at `orchestrate-dev.js:6229-6231`) "do not match the shape" — which defines the shape by *skill identity*, not by hyphenation. Under that definition two literals match and are **not** members of the exported union: `name: "orchestrate-dev"` in the exported `meta` object (`orchestrate-dev.js:3316`) and `name: "orchestrate-queue"` (`orchestrate-queue.js:45`); both name real skills (`pdlc/skills/orchestrate-dev/`, `pdlc/skills/orchestrate-queue/`). Whether they are in scope turns entirely on the position list — a `name:` field inside a module-level `const` may or may not be "bound to a module-local constant" — and the entry's supporting measurement quietly proves the weaker statement instead ("every literal occurrence of the ten identifiers … is a member", which is true of any ten-member set of itself). One sentence fixes it: state that the position predicate is the four enumerated *dispatch-carrying* positions, that comments and the exported `meta.name` field are out of scope, and that the shape predicate is `pdlc/skills/*` directory names minus the operator-invoked-only five. As written, an implementer transcribing the clause literally gets a red suite and a spec that says it should be green. | DEC-ENG-05, "The cost this decision accepts" |
| F-02 | Medium | Local | **The filtered-run skip has no positive counterpart, so a false-positive detector is a permanently green suite.** Step 4 is now correctly scoped, but the only stated obligation is that a *filtered* run reports skipped-with-reason. If the detector ("any test-selection argument forwarded to `node --test`") over-matches — a flag added to the npm script, a CI wrapper passing `--test-reporter`, an argv-parsing slip — every run reports skipped-with-reason and the three set-equality assertions never execute again, which is the same vacuity in the third costume. Pair it: an **unfiltered** run must assert that step 4 actually *ran* (the summary carries a pass, not a skip), so the detector is falsifiable in both directions. Cheap, and it is the same both-directions discipline DEC-ENG-07 just adopted for the wave set. | DEC-ENG-10 |
| F-03 | Low | Local | **DEC-ENG-03's testable content is now conditional, and the sequencing that follows is not recorded.** Filing the precondition upstream is right, but it leaves the entry's only self-standing claim as "the probe's observation is reported at startup rather than discovered per dispatch" — the refusal, the message obligations and the rung id all arrive from FSPEC/REQ errata. The §8 row says "Blocked on upstream", which is honest, but no line says what that means for the test artifacts: the probe's PROPERTIES rows and its catalogue-emit obligation (DEC-ENG-13) cannot be written until the errata land, and writing them against the *current* text produces tests that must be rewritten. One clause in the §8 obligation — "no PROPERTIES row for the interpreter probe is authored before the FSPEC errata land" — turns a known dependency into a scheduling fact PLAN can act on. | DEC-ENG-03, §8 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-ENG-11 offers two mis-built configurations — matcher `"Write"` instead of `"Bash"`, or a hook path pointing at no script — and now requires both to return an explicit **allow** verdict. Do both actually produce `allow`? A matcher mismatch plausibly does (the hook is simply not selected), but a registered hook whose script does not exist may surface as an execution error rather than an allow, in which case that arm's positive assertion is unsatisfiable as written and the arm should be the matcher case alone. Worth settling before the clause becomes a PROPERTIES row. |
| Q-02 | DEC-ENG-04's red fixture is "no row whose `platform` and `transport` match the running pair". Is the *running* pair read from the process (`process.platform`, the resolved transport) or supplied by the fixture? The first makes the red fixture host-dependent — green on a maintainer's macOS, red in Linux CI, or the reverse — which is the one property a hermetic suite should not have; the second keeps it deterministic and leaves the host lookup to a single thin seam asserted once. |

## Positive Observations

- **Every corrected measurement in the diff is now accurate.** I re-derived the scanner
  yield, the `EXPECTED_SKILLS` arithmetic and the `MODEL_IMPLEMENTATION` site count
  independently rather than reading the citations back, and all three match HEAD — including
  the two multi-line call forms (`orchestrate-dev.js:8034-8036`, `:10250-10251`) that a
  single-line grep misses. Corrections that go *further* than the finding asked (the round-1
  review said "four names"; the entry found five, `se-author` at `:9964` and
  `orchestrate-queue.js:1216`) are the sign the author measured rather than patched.
- **The rung-5 retreat is the right shape of fix.** Round 1's objection was that two derivable
  tests would disagree on one fixture. The entry could have settled the disagreement by fiat;
  instead it names *why* the number is not DECISIONS-local (BR-START-2's totality contract owns
  the ladder's closure), enumerates the two acceptable upstream resolutions, and explicitly
  refuses to inherit `FSPEC:392`'s dry-run non-fatality by placement. That last sentence is the
  one a reviewer usually has to ask for twice.
- **DEC-ENG-10's skip vocabulary matches the ladder's, deliberately.** "Skipped-with-reason, not
  silence" is the same rule BR-START-2 already imposes on rungs (`FSPEC:311`), so the suite
  runner and the doctor report will read the same way to an operator. Consistency of a
  vacuity-refusing idiom across two unrelated mechanisms is worth more than either instance.
- **DEC-ENG-05 states its guard's own failure mode.** "The test is only as good as the
  identifier-shape predicate" is exactly the sentence most specs omit, and it is what let me
  locate F-01 in one pass instead of discovering it in review of the implementation.
- **The two additions nobody asked for are the honest ones.** DEC-ENG-01 now states plainly that
  `transport-cli.mjs` delivers no operator-visible benefit this feature, and DEC-ENG-14 now
  states that concurrent runs are not merely undetected but *undisclosed*. Neither improves the
  document's case; both make the standing-cost list something a later reader can trust.

## Recommendation

**Approved with minor changes**

Both round-1 High findings are resolved. F-02 (rung identity) is closed outright and correctly:
the number is upstream's, the two acceptable resolutions are named, and no derivable test now
disagrees with another on the same fixture. F-01 (the no-bare-literal guard) is closed in
substance — the unwritable closed allow-list is gone, and the containment form is green,
falsifiable and exemption-free under the strict positional reading. What remains is a boundary
sentence, not a design hole, so it is recorded at Medium rather than held as a blocker.

The three open findings are all one-sentence edits: name the containment quantifier's positions
and shape (F-01), pair the filtered-run skip with a positive "step 4 ran" assertion on unfiltered
runs (F-02), and record that the interpreter probe's PROPERTIES rows wait on the FSPEC errata
(F-03). None of them changes a decision, and none blocks PLAN from starting on the entries that
are settled.

No upstream erratum is filed this round. Round 1's TSPEC §6.4 item ("rung 5 neighbourhood") is
now handled inside the document — the hedge is read as load-bearing rather than hardened, and
the placement is routed to FSPEC — so re-filing it would duplicate an erratum already in flight.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
