# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 2

Delta re-review against `CROSS-REVIEW-software-engineer-FSPEC-v1.md`, over
`git diff ae9ba5af..HEAD` on the FSPEC (280 insertions, 176 deletions, v0.1 → v0.2). Only
changed sections were re-read for new defects; unchanged sections approved at v1 were not
re-litigated. Every code claim below was re-checked at HEAD.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BR-5 now reads "**at most** `maxDocuments`", states the count equals the threshold only where the eligible set is large enough *and* the total bound does not bind first, and carries the measured 89-document basis (mean 13,278 bytes, 87/89 over `maxBytesPerDocument`). AT-07 asserts the count under both regimes — total-bound-slack and total-bound-binding — so the assertion no longer rides on fixture smallness. |
| F-02 | High | **Resolved** | `RSN-NO-MATERIAL` added to BR-6, BR-9's per-document catalogue, Step 5.15 (dropped *before* the count bound, consumes no slot), D-12, E-33, AT-28 and AT-19's set-equality catalogue. A-3 corrected from "will continue to carry the six sections" to "most do, not all", citing the measured HEAD document. |
| F-03 | High | **Partly resolved — see F-01 (v2)** | BR-14 no longer asks the pipeline to detect a misspelt section name; the typo now reads as absent, and the unknown-top-level-key registry is explicitly decided against. The replacement definition of "malformed" over-reaches its cited precedent — new High below. |
| F-04 | High | **Resolved** | BR-4 keeps `(Date Completed, repository-relative path)` as a total composite key, states plainly that AC-2.2's rename-invariance property cannot hold for the 2/89 documents with no primary key, replaces it with the stronger achievable property (ordering is a pure function of key value and path), and routes the correction as an `ERRATUM: REQ`. AT-10 now also pins independence from git commit order, ctime order and wall-clock time. |
| F-05 | Medium | **Resolved** | `RSN-TRUNCATED` deleted; truncation folded into `RSN-UNPARSEABLE` with the reason stated (no byte-decidable predicate separates truncation from E-19's legitimately-short document). BR-3 down to three total outcomes, D-6 and AT-19's catalogue follow. |
| F-06 | Medium | **Resolved** | AT-29 is now two scripted runs differing only in the injected block, with set equality over the five gate inputs member for member — a mechanical comparison, not an inspection. |
| F-07 | Medium | **Resolved** | AT-34 runs on the same instrument and in the same test as AT-33, whose non-empty observed set supplies the control; the disabled run also asserts baseline byte-identity and completion, so the absence claim is paired. |
| F-08 | Medium | **Resolved** | BR-2 reframed: corpus membership is the enumeration, not a rule; `docs/discarded/{feature}/` falls out by glob depth, with the ordered exclusion table reduced to E-SELF alone. Matches `LS_FILES_ARGV` at `pdlc/workflows/consolidate-learnings.js:1338-1346` — two depth-2 globs, no discarded rule. Residual REQ divergence noted as F-03 (v2), which is upstream. |
| F-09 | Medium | **Resolved** | BR-1 carries the note that the two lists are read off the classification rather than maintained here, and names the POSTMORTEM and DoD document-finding dispatches as excluded by construction. AT-02 now asserts set equality over **every agent invocation the run makes**, not over the already-classified subset. |
| F-10 | Low | **Resolved** | BR-4 quotes `2026-06-09 (Phase H harvest; partial close-out)` verbatim. |
| F-11 | Low | **Resolved** | BR-6 says the names identify sections by conventional title, cites `pdlc/skills/harvest-learnings/SKILL.md`, and hands the heading-form pin to F-O-1. |
