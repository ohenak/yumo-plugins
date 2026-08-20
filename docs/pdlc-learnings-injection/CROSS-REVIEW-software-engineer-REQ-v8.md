# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.8)
**Date:** 2026-08-19
**Iteration:** 8 (delta confirmation over commit `386e4f0c`)

## Scope of this round

Delta confirmation only. The erratum is 18 insertions / 11 deletions across the §1
changelog row, §1.2 claim 2, AC-1.2, AC-3.2 and AC-5.1b. I read the routed item list,
diffed the erratum commit, and re-verified every upstream fact the edited sentences now
lean on against HEAD source — not against the item list. Unchanged sections previously
approved were not re-litigated.

## Routed items — disposition

| Routed item | Landed? | Evidence |
|---|---|---|
| **High / delta / local** — AC-3.2 corpus-level outcomes still "once per run" while AC-3.3 moved to per-dispatch (SE F-01) | **Yes** | AC-3.2 now reads "recorded **per authoring dispatch**, alongside AC-3.1's rows for that dispatch", with the run-level record demoted to an optional additive mirror that is explicitly "not the oracle". The `DIVERGENT-CORPUS` failure I named — dispatch 1 sees an empty corpus, dispatch 3 sees one document — is now recordable, and the set-equality completeness obligation is stated per locus, matching AC-3.3's split. |
| **Medium / delta / local** — AC-3.2 per-document not-selected rows carried no locus (SE F-02) | **Yes** | AC-3.2's opening now names, "**per authoring dispatch**, the corpus documents **not** selected for that dispatch". The not-selected half and the corpus-outcome half now share AC-3.3's dispatch locus, so no row is left undefined under mid-run corpus movement. |
| **Medium / delta / local** — AC-5.1b cited sibling precedent for inertness, but the sibling defaults-and-notices (SE F-03) | **Yes** | AC-5.1b now states the run "stays **enabled** on §4.1's declared defaults" and characterises the sibling correctly as "keeps running on declared defaults and reports". Verified at HEAD: `parseAdvisoryConfig`'s `degraded()` returns `ADVISORY_DEFAULTS` plus `sectionMalformed` (`pdlc/workflows/orchestrate-dev.js:1964-1969`), i.e. defaults-plus-flag, never a refusal. The claim no longer imports the sibling's own `enabled: false` default (`:1945`) — it imports the mechanism, and §4.1 independently declares this feature's `enabled` default `true`, so "stays enabled" follows from this REQ's own table rather than from the sibling. Rationale is now decided in text (G-1, G-4, C-7) rather than inferred. |
| **Low / inherited / nonlocal** — §1.2 claim 2 depth off by one (SE F-04) | **Yes** | Claim 2 now reads "reaching one directory level under `docs/` and one under `docs/completed/`", matching `LS_FILES_ARGV`'s two literal pathspecs `:(glob)docs/*/LEARNINGS-*.md` and `:(glob)docs/completed/*/LEARNINGS-*.md` (`pdlc/workflows/consolidate-learnings.js:1338-1346`). |
| **Medium / delta / local** — AC-3.2 not-selected record left run-scoped under divergent corpus (TE F-26) | **Yes** | Same edit as SE F-01/F-02; the fixture TE described can now be written without asking whether AC-3.2 is per dispatch or per run. |
| **Medium** — AC-1.2's outside set omitted the authoring-tagged dispatch outside C-1 (TE F-27) | **Yes** | AC-1.2's parenthetical now names "any dispatch the pipeline tags authoring whose target is none of C-1's six document types — the code-review phase's optimizer at HEAD". Verified: Phase CR calls `reviewLoop` with `docType: null` (`orchestrate-dev.js:14553-14558`), `PHASE_DISPATCH.CR.optimizer` is `"se-author"` (`:3706-3713`), and the optimizer dispatch is wrapped with `dispatchKind` `"authoring"` (`:7659-7664`). C-1's conjunct rule excludes it on `docType`, and the byte-identity fixture now has to include the highest-risk dispatch. |
| **Low / inherited** — §1.2 claim 2 attributes the fail-open-on-unlistable outcome to DEC-CONS-05 (TE F-28) | **No** | Not touched by the erratum; see F-01 below. Re-verification this round found the claim is not merely miscited but contradicted by HEAD. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | §1.2 claim 2 says the shipped enumeration comes "with a fail-open outcome when the listing itself fails (DECISIONS-pdlc-consolidation-agent § DEC-CONS-05)". Both halves fail verification. (a) DEC-CONS-05 decides "Two corpus enumerations pinned literally on each side; only the **predicate** held equal" (`docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`, DEC-CONS-05 row) — it decides evidence form, and says nothing about listing failure. (b) The shipped code does not fail open: on `corpusReply.unlistable` the pass logs the pathspec and stderr, sets `state.status = "failed"` and returns through `finishPass` — the comment there pins "§10.3 row 1a — `failed`, NO reason code … Never `no-op`" (`pdlc/workflows/consolidate-learnings.js:588-594`). Only `enumerateCorpus` itself is total (it returns `{unlistable, detail}` instead of throwing, `:1348-1354`); the pass-level policy above it is fail-closed. This REQ's own choice is genuinely fail-open — AC-3.2 records `RSN-UNLISTABLE` as a corpus-level outcome and the run continues — so the AC set is unaffected, but the premise section justifies that choice with a precedent that points the other way. This is the same defect class as the AC-5.1b sibling-precedent error corrected this round, and it will mislead the TSPEC/PROPERTIES author who reaches for the sibling to pin the behaviour. Fix: drop the DEC-CONS-05 citation from the fail-open clause and state the divergence plainly — the shipped pass marks itself `failed` on an unlistable corpus, this feature deliberately does not, because a failed listing must not halt an authoring dispatch (G-6, C-3) — or move the fail-open decision to a DECISIONS entry of this feature's own. | §1.2 claim 2 (REQ:69-72); AC-3.2 (REQ:322-328) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-3.2 permits a run-level mirror of the corpus outcome as "additive, not the oracle". Under a divergent corpus, is the mirror's value expected to be well-defined (e.g. last-write-wins, as TSPEC §266-270 currently builds it), or is the REQ deliberately leaving it unconstrained because nothing may assert on it? Either answer is fine at REQ altitude; naming which one prevents a completeness test from growing an assertion over it later. |

## Positive Observations

- The corpus-locus fix is the whole fix, not half of it: AC-3.2's two halves (per-document not-selected rows, corpus-level outcomes) and AC-3.3's ordering key now sit at the same dispatch locus, and the "additive, not the oracle" qualifier on the run-level mirror pre-empts the obvious mis-implementation of asserting on a last-write-wins scalar.
- AC-5.1b now decides the question rather than deriving it from a misread sibling: "Fail-open is the decided response" plus the G-1/G-4/C-7 rationale is a claim a TSPEC author can implement without re-reading `orchestrate-dev.js`.
- AC-1.2's new parenthetical is the rare case of a spec naming its own hardest fixture. The CR optimizer is authoring-tagged with a null `docType`, which is exactly where a tag-only implementation would leak injection, and the byte-identity oracle now has to cover it.

## Recommendation

**Approved with minor changes**

The four routed SE items and both routed TE items landed, and each edited sentence's
upstream facts re-verify against HEAD. F-01 is a Medium mis-citation in a rationale
section that does not gate; it should be corrected before the TSPEC author cites the
sibling as precedent for fail-open behaviour.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
