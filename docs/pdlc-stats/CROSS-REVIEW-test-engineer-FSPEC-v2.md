# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2
**Previous review:** `CROSS-REVIEW-test-engineer-FSPEC-v1.md` (3 High, 6 Medium, 3 Low) — *Needs revision*
**Delta reviewed:** `git diff 7cc090a84..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` (220 insertions, 62 deletions)

## Prior Findings — Disposition

| Prior | Sev | Status | Evidence in the revision |
|---|---|---|---|
| F-01 — the six-type catalogue swallows the pipeline's own `REVIEW` cross-reviews; a first run over this repo reports four pipeline-authored artifacts as malformed with no rule saying so | High | **Resolved** | The disposition is now *stated* rather than left to be discovered. BR-06 gains an explicit paragraph naming `CROSS-REVIEW-{role}-REVIEW-v{N}.md` as in-catalogue-failing, EC-05 folds "a document type outside BR-09's six" into its grammar-failure list, D-7/D-8 record the decision and its cost, §7.3 raises it as a REQ erratum rather than repairing it downstream, and A-3 is narrowed so the role catalogue is inherited while the document-type catalogue is not. Crucially the test now pins it: AT-09 gains a real-path half over `docs/completed/pdlc-advisory-wave-gate/` with three literal conjuncts — all four basenames named as malformed, no row counting them, and the TSPEC row still `6`. Verified against the tree: exactly four `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` files, and the highest grammatical TSPEC index in that directory is `6` (`CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v6.md`). |
| F-02 — EC-10's unclassified entry had no slot in the two-key fleet JSON document; AT-19 named no JSON expectation | High | **Resolved** | BR-23 now specifies three top-level keys (`schemaVersion`, `features`, `unclassified`) and explains why `unclassified` is a sibling of `features` rather than an entry inside it. BR-18 gives the human-mode carrier (a marked row in the same list, in the same order, like a gap row). EC-10 names both carriers. AT-19 splits into a human half and a JSON half whose oracle is a set-equality on the literal key set ("exactly `schemaVersion`, `features`, `unclassified` — three, no more") plus `unclassified` set-equal to `["{that directory}"]` and `features` carrying no key of that name. That is transcribable and it fails on a deleted case. |
| F-03 — AT-13's expectation was an implementation echo ("the resolution the pipeline's own rule yields"), on the one AC covering the feature's load-bearing constraint | High | **Resolved** | AT-13 now transcribes the literal — `{phase: "PR", resolution: "resolved"}`, explicitly "the literal, not a re-derivation" — grounded in the fixture's line-leading marker, verified on disk at `docs/completed/pdlc-wave-resume/POSTMORTEM-PR-pdlc-wave-resume.md:3` (`RESOLVED: yes`; the only other occurrence, `:185`, is mid-line and so outside the line-leading rule). The falsifying companion I asked for is present: the same file with `RESOLVED: no` expecting `open`, with the reason stated — a constant-classifier implementation passes either half alone and fails the pair. The §6 preamble generalises the rule for all real-path tests ("a literal, never 'whatever the mechanism derives'"), which is the durable half of the fix. |
| F-04 — BR-22's universal "each metric's value is an object carrying `state`" was falsified by its own `halts` example | Medium | **Resolved** | BR-22 now scopes the object-with-`state` form to the three metrics that can hold a non-numeric state and states the `halts` exception with its reason (BR-13 makes emptiness expressible as `[]`). |
| F-05 — fleet human mode quietly narrowed the metric set REQ-STATS-07 requires, with no test scoped to fleet | Medium | **Resolved** | D-7 records the reduction as deliberate and bounds it at exactly two (malformed as a count; halts as `{n} ({r} resolved)`), BR-18 restates it with the malformed-count column added, and AT-06 gains a fleet half asserting the two permitted differences "and in no other way". |
| F-06 — seven edge cases had no AT and there was no EC→AT traceability table | Medium | **Resolved** | §6.10 adds AT-25 (EC-06), AT-26 (EC-03), AT-27 (EC-09, EC-11, EC-21) and AT-28 (EC-16, the deliberate asymmetry); AT-18 absorbs EC-17, EC-18 and EC-20; AT-15 absorbs EC-19. §6.11 adds an EC→AT table covering EC-01…EC-21 with no gaps, alongside the BR table now covering BR-01…BR-30. |
| F-07 — AT-15's fixture satisfied BR-14 by containment, so an omitted enumeration member stayed green | Medium | **Resolved** | AT-15 now requires all six spec documents and all three process families at distinct sizes, and adds the per-member removal probe ("removing any one of the nine changes its side's total by exactly that file's size") that converts containment into set-equality. |
| F-08 — AT-02's oracle was absence-shaped ("no metric equals the sum") | Medium | **Resolved** | Replaced with the byte-identity form, with the merged-read-deduplicates-by-basename reasoning stated inline. |
| F-09 — AT-10/AT-12 expected "the measured index" rather than a literal | Medium | **Resolved** | AT-10 reads exactly `13` (verified: `docs/completed/pdlc-headless-engine/` carries `CROSS-REVIEW-software-engineer-TSPEC-v13.md` as its only cross-review, alongside `LEARNINGS-pdlc-headless-engine.md`); AT-12 names `CODE_REVIEW-{feature}-v4.md` and reads exactly `4`. The §6 preamble adds the re-measurement licence for archive drift. |
| F-10 — BR-01's closed flag set silently diverged from the surface it cited | Low | **Resolved** | BR-01 now states the divergence in one clause: `stats` takes the mechanism, not the flag lists, so `pdlc stats foo --dev` is a usage error though `pdlc doctor --dev` is not. |
| F-11 — EC-19 did not decide `lstat` vs `stat` | Low | **Resolved** | EC-19 decides the link's own size, with the rationale (a link into a large document cannot inflate a side), and AT-15 carries a symbolic-link member as a fixture conjunct. |
| F-12 — §7.4 A-3 claimed inheritance BR-09 cannot deliver | Low | **Resolved** | A-3 is split: the role catalogue is inherited, the document-type catalogue is not, and D-8's `REVIEW` case is cited as the instance. |

All three blocking findings are resolved, and resolved at the level that matters for this lens — each
one landed a rule *and* the oracle that can fail on it.

## Claims Verified

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
