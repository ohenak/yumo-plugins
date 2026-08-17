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

## Questions

## Positive Observations

## Recommendation

## Verdict
