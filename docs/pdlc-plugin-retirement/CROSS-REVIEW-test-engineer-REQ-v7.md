# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.9, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 7

**Scope:** Convergence round. The REQ's bytes are **unchanged** since v0.9 (`165fcf7d`), the
version reviewed and approved-with-minor-changes at v6. `git diff 165fcf7d..HEAD --
docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` is empty; the only commits since are
the two v6 cross-reviews themselves. There is therefore no delta to scan for new issues, and no
section is re-litigated.

What this round *can* do, and does, is re-run the REQ's own oracles against a HEAD that has
moved since they were pinned — which turns out to be the most informative thing available,
because the repository grew in exactly the dimension AC-1.2's closure property predicted.

## Re-measurement at HEAD

Every number below was produced by running the command myself at HEAD `2a782ec2`, not read off
the baseline or the REQ.

**The sweep totals moved, and moved by exactly the predicted mechanism.** The baseline's recipe
(`pdlc-retirement-baseline.md:157-158`, eight alternations) returns **138** tracked paths at
HEAD, against the **136** pinned at `b73fb4de`. AC-1.2's seven-term search
(`baseline:182-183`) returns **134**, against the pinned **132**. The delta between the two
commands is still exactly **4** — `postWavePathspecs`'s reach is unchanged — so the
documented-superset relation holds unaltered.

The two added paths are `CROSS-REVIEW-software-engineer-REQ-v6.md` and
`CROSS-REVIEW-test-engineer-REQ-v6.md`, this feature's own round-6 cross-reviews. `git diff
--name-status b73fb4de..HEAD` returns five paths and no others: those two additions plus edits
to the baseline, the POSTMORTEM and the REQ. Both additions sit under A-1's
`docs/pdlc-plugin-retirement/**` glob (`baseline:118`), so both are owned, and the unclassified
remainder stays **empty** without anyone re-deriving the partition by hand. 138 = 136 + 2, both
A-1 members; 134 = 132 + 2, likewise.

This is the first round in which the REQ's chosen invariant has been tested against actual
growth rather than asserted about hypothetical growth. Had the REQ pinned the **total** — as
earlier drafts did — AC-1.2 would now be red on two review documents that the sweep is supposed
to ignore, and a Phase-R approval would have shipped a criterion that fails on its own paperwork
one commit later. Pinning the empty remainder is what makes the criterion survive its own
review loop. The property is falsifiable in the right direction too: a path that reached the
sweep and matched no glob would have surfaced in `comm -23` regardless of the total.

**C-7's green start still reproduces, to the same three numbers.** `env -u NODE_TEST_CONTEXT npm
test` in `pdlc/engine` at HEAD: `# tests 842`, `# pass 840`, `# fail 0`, `# skipped 2`, exit 0.
Identical to the values BL-08 and C-7 cite, so the prerequisite has not decayed across four
rounds of document edits.

**AC-1.1's premise still holds at HEAD.** `pdlc/workflows/dist/` currently carries five entries
(`pdlc-cli.mjs`, three `*.bundle.js`, `distribution-manifest.json`); M-9 is the one AC-1.1
requires to survive, and the other four are named terms of AC-1.2. The criterion has real work
to do and is not vacuously satisfied today — the check that matters for a survivor-set AC.

## Round-6 disposition

Round 6 recorded no High. Its two Mediums and one Low were left open deliberately, as better
addressed downstream than by reopening Phase R. The REQ did not change, so all three persist
verbatim; I re-verified each still describes HEAD rather than carrying forward on trust.

| Round-6 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | Medium | **Open, unchanged** | `pdlc/workflows/dist/pdlc-cli.mjs:16-17` still reads `Built artifact: pdlc/workflows/dist/orchestrate-dev.bundle.js` and `Consumer runtime copy: installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh` — two AC-1.2 term hits (`\.bundle\.js`, `sync-workflows`) inside the one path AC-1.1 requires to survive, and not A-1-allow-listed. Clearance still depends on M-9 being regenerated after the M-11o banner rewrite, which no inventory row states. Carried to FSPEC/TSPEC. |
| F-02 | Medium | **Open, unchanged** | `pdlc/workflows/__tests__/pipelineWiring.test.js:543-548` still reads `build-runtime.mjs` source and throws `DEV_META anchor not found in build-runtime.mjs` when `const DEV_META = \`` is absent. `DEV_META` stamps the retired `orchestrate-dev.bundle.js`; M-7's reduction deletes it. The file returns zero hits on the seven-term search and appears in no M-11 row, so it remains a third dependent that no search term reaches — the class §1.2's lower-bound doctrine says needs an inventory row. Carried to PLAN sizing. |
| F-03 | Low | **Open, unchanged** | AC-1.2 (`REQ:289-292`) still enumerates "the three retired bundles" in prose while the pinned command at `baseline:182-183` carries the shape `\.bundle\.js`. Two faithful transcriptions can differ; the fix is one sentence naming the pinned command as *the* term set. Cosmetic against a set-equality that is otherwise correctly two-sided. |

No round-6 finding regressed, and none was resolved — the expected outcome for a round with an
empty document delta. None of the three is gating.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **Carried forward from round-6 F-01, unchanged.** M-9 (`dist/pdlc-cli.mjs:16-17`) is the only swept, surviving, non-allow-listed path carrying AC-1.2 terms, and its clearance is derived rather than stated: it depends on the artifact being regenerated after M-11o's banner rewrite. No M-row or M-11 row says so. One clause in the M-9 or M-11o inventory row closes it; better placed in FSPEC than in a Phase-R reopen. | AC-1.2, AC-1.1, G-5, `baseline` M-9/M-11o rows |
| F-02 | Medium | Local | **Carried forward from round-6 F-02, unchanged.** `pipelineWiring.test.js:543-548` is a third dependent that no AC-1.2 search term reaches and that no inventory row owns, and it fails *by throw* — not by assertion — when M-7's reduction removes `DEV_META`. §1.2 already commits the REQ to the rule that anything no search term reaches needs a row; this instance is the rule's own counterexample. Today it surfaces only as an AC-1.3 suite-green failure discovered mid-sweep, with no task sized for it. | §1.2, C-6, R-2, M-7, AC-1.3 |
| F-03 | Low | Local | **Carried forward from round-6 F-03, unchanged.** AC-1.2's prose enumeration ("the three retired bundles") and the pinned command's `\.bundle\.js` shape are two transcriptions that a faithful FSPEC author could render differently. Name the pinned command as the normative term set and let the prose enumerate it. | AC-1.2, `baseline` §recipe-vs-term-set |

No new finding. The document did not change, and the HEAD re-measurement surfaced no defect the
previous rounds had not already recorded — the sweep totals moved, but the invariant the REQ
actually pins held, which is a confirmation rather than a finding.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Round-6's Q-01 stays open and is now the sharpest remaining testability question, so I restate it for the TSPEC rather than re-file it as a finding: after the reduced build step lands, which acceptance criterion asserts that *running* `build-runtime.mjs` emits `{M-9}` and nothing else? AC-1.1 asserts the tree's `dist/` entry set, which is equivalent only if the build is actually run in the same state; at HEAD `dist/` holds five entries, so the two are demonstrably not the same assertion today. AC-1.3's suite green would catch it only if a surviving module rebuilds and compares — and the two modules that do (`runtimeBundle.test.js`, `runtimeProvenanceWiring.test.js`) are themselves deleted by M-8/M-11p. One sentence in TSPEC's O-3 resolution naming the surviving test that re-runs the reduced build closes it. |

## Positive Observations

- **The closure property was tested by events, not by argument, and it held.** Between the
  partition's pin and this round the repo grew by exactly the paths the REQ said it would grow
  by, the totals moved 136→138 and 132→134, and the remainder stayed empty because both new
  paths landed inside an existing glob. A criterion that survives its own review loop generating
  new inputs for it is a criterion an implementer can run in six months.
- **Choosing the invariant over the number was the right call, and it is now provably so.** Had
  the earlier total-pinning survived, AC-1.2 would be red at this very commit on two cross-review
  files. The review loop produced a criterion that the review loop itself cannot break.
- **The superset relation is stable under growth.** The recipe-minus-AC-1.2 delta is still
  exactly the four `postWavePathspecs` paths after the tree moved, so the asymmetry documented at
  `baseline:186-205` is structural rather than an artifact of one measurement.
- **The prerequisite did not decay.** 842/840/0/2 in `pdlc/engine` at HEAD, unchanged across four
  rounds — C-7's green start is a live fact, not a stale citation.
- **Three open items, all correctly sized.** Two Mediums and a Low, each with a named file, a
  named line range and a one-clause fix, each routed to the document that should carry it. Nothing
  is being deferred vaguely.

## Recommendation

**Approved with minor changes**

No High finding is open, old or new. The document did not change this round, so the question is
whether the version approved at v6 still describes HEAD — and it does, measured rather than
assumed: the partition still closes with an empty remainder after the tree grew by two paths,
the recipe/term-set delta is still exactly its four owned paths, the engine suite still starts
green at 842/840/0/2, and AC-1.1 still has real work to do against a five-entry `dist/`.

The three carried items are inventory and transcription clauses, not testability gaps in the
acceptance criteria themselves. F-01 and F-02 both want one sentence in an inventory row and
both belong to the FSPEC/TSPEC/PLAN pass that follows; F-03 is a wording preference against a
set-equality that is already two-sided and falsifiable. None of them would be better fixed by
holding Phase R open for an eighth round — the REQ has converged, and the remaining work is
downstream work.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
