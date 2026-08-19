# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.3)
**Date:** 2026-08-19
**Iteration:** 3

Delta re-review against `CROSS-REVIEW-software-engineer-FSPEC-v2.md`, over
`git diff 81df67cc..HEAD` on the FSPEC (62 insertions, 44 deletions, v0.2 → v0.3). Only changed
sections were re-read for new defects. Every measured claim touched this round was re-measured
against HEAD.

## Prior findings disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BR-14 now carries five states: wrong-typed declared key takes its default, the run stays **enabled**, and a notice names the key — matching the shipped per-key fallback plus `invalidKeys` notice (`pdlc/workflows/orchestrate-dev.js:1986-2031` builds `invalidKeys` from `boolField`/`positiveInt`/`positiveNumber`/`envelope` fallbacks and returns `sectionMalformed: false`). `sectionMalformed: true` remains reserved for the section-present-but-not-an-object guard (`:1982`), which is exactly what BR-14's malformed row now says. E-23 narrowed, E-34 added, AT-32 rewritten with a positive assertion for the wrong-typed case (run enabled, key at default, notice names it). No divergence from precedent left to justify. |
| F-02 | Medium | **Resolved** | BR-5 now states plainly that REQ AC-2.1's "count equals the threshold" is falsified under §4.1's declared values by the measurement, and declares `ERRATUM: REQ` (line 365). |
| F-03 | Medium | **Resolved** | BR-2's note now names the residual class — a document *directly* at `docs/discarded/LEARNINGS-x.md` matches the first glob, the case REQ C-3/AC-2.6 legislate against — and declares `ERRATUM: REQ` (line 270). "None exists at HEAD" checks out: `git ls-files 'docs/discarded/*'` returns only `README.md` and depth-2 feature directories, no `docs/discarded/LEARNINGS-*.md`. |
| F-04 | Low | **Resolved** | `### Group 4 — fail-open under corpus state` restored above AT-24 (line ~823). Branch-coverage line correspondingly re-stated for E-01 … E-34 less retired E-05, and D-5's exercise list corrected to AT-04/16 (AT-15 is a corpus-membership case, not a D-5 branch — the drop is right). |
