# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.3)
**Date:** 2026-08-19
**Iteration:** 2
**Scope:** Delta re-review — prior findings F-01 … F-06 (`CROSS-REVIEW-product-manager-TSPEC-v1.md`), plus new issues in sections changed between `5c62375b` and `627efd4f`.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in v0.3 |
|---|---|---|---|
| F-01 | High | **Resolved** | The `enabled`-default decision is no longer closed on TSPEC's own authority. The rejected-alternatives row now reads "**Not decided here — see OQ.2 and ERR-4**", OQ.2 states both readings, names this repository as the case they disagree about, and states exactly what changes under either resolution; ERR-4 routes the contradiction to REQ. That is the fix I asked for, and the disclosure that "on the shipping default, AC-1.1's *then* does not hold in this repository" is more honest than I expected. The underlying REQ contradiction (G-1 versus AC-5.1a) remains open upstream — correctly, since TSPEC has no authority over it. |
| F-02 | Medium | **Resolved** | §A.2 now states the coincidence as an invariant rather than assuming it, and gives it an oracle: `learningsDispatchSet.test.js` carries a set-equality assertion over the `docType`s that actually reach the injector against the hand-transcribed `LEARNINGS_TARGET_DOCTYPES` literal, so a seventh authoring phase reds the test. The revision also went further than the finding asked and found that `dispatchKind` alone is *wider* than C-1 (P-2b/P-2c) — verified: Phase CR calls `reviewLoop` with `docType: null` (`orchestrate-dev.js:14553-14556`), `roundDocType` stays `null` (`:7306`), and `wrapped` forwards it to `dispatchAndVerify` (`:7342-7358`). The `docType` conjunct is load-bearing, as claimed. |
| F-03 | Medium | **Resolved** | §T.6 now splits AC-5.2 into halves and gives the write half two seam-independent instruments (working-tree `git status --porcelain` delta, and a static scan of the new region for `fs.`/`writeFileSync`/`mkdirSync`/`appendFileSync`), explicitly scoping the seam call log to the read half. |
| F-04 | Medium | **Resolved** | New OQ.3 states that C-8's "less is injected" half is discharged by static caps alone, names that as a deliberate limitation ("bounded a priori, not … yields under pressure"), and states the consequence if REQ O-1 / T-O-3's measurement contradicts it — caps move (a REQ §4.1 change) or REQ decides displacement order. The obligation is named rather than left implicit. |
| F-05 | Low | **Resolved** | §D.4's comparator is now `Buffer.compare(Buffer.from(a.path, "utf8"), Buffer.from(b.path, "utf8"))`, with the code-unit-versus-byte divergence recorded and no ASCII restriction assumed. |
| F-06 | Low | **Resolved** | §Scope reads "seven questions". |

No prior finding is unresolved, and no prior finding was resolved by narrowing the claim rather than meeting it.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | `delta` `local` | **§D.2's record still carries `notices` inside the `learningsInjection` key, which is the one place AC-5.1b says it cannot be — and §I.2 says it was moved out.** This round added the right resolution to §I.2 (TSPEC:353-355): "`notices` is carried **outside** the `learningsInjection` key, on `buildFinalReport`'s existing run-level notice channel, and `learningsInjection` … is the conditionally-spread key", closing with "§D.2's record is amended accordingly." §D.2 was edited this round (per-dispatch `corpusOutcome`/`orderKeys`/`corpusDiverged` were added) but that amendment did not land: `notices: [ { id: "NTC-KEYTYPE", key: "maxDocuments" } ]` still sits inside the `learningsInjection` object literal at TSPEC:506, one line above its closing brace. The two statements cannot both be implemented, and the §D.2 reading is the one that fails an acceptance criterion: AC-5.1b requires that a present-but-not-an-object section produce *AC-5.1a's behaviour* (`learningsInjection` key absent) **and** a report carrying "a catalogued notice naming it, so a malformed section is distinguishable from a deliberate disable" (REQ:368-370). With `notices` nested inside the absent key, `NTC-MALFORMED` has nowhere to be reported and a malformed section becomes byte-indistinguishable from a deliberate disable — the exact confusion AC-5.1b exists to prevent. Fix: delete the `notices` member from §D.2's `learningsInjection` literal and show it on the run-level channel instead, so the record shape and §I.2's presence table agree; §I.2's own three-row table (absent / malformed / wrong-typed) is already correct and can stand as written. | AC-5.1b, AC-5.1a, AC-5.1c |
| F-02 | Medium | `delta` `local` | **§A.5 relocates AC-3.3's reproduction obligation from the run-level record to the per-dispatch row, without routing the move upstream.** AC-3.3 states the operator reproduces the selection from "the report's **run-level** record" (REQ:326-329); §A.5's new last-write-wins rule makes that record hold only the *last* authoring dispatch's `orderKeys`, and then states "AC-3.3's hand-reproduction is then performed against the per-dispatch row, with the run-level record as its summary." The product outcome AC-3.3 buys is preserved and arguably improved — every dispatch's inputs are still in the report, and `corpusDiverged` makes divergence visible without inventing an outcome id — so this is not a gap in capability. What is missing is the routing: AC-3.3's *Given* ("the same repository state") plausibly presupposes a stable corpus and simply does not contemplate a mid-run corpus change, which makes this an unaddressed REQ gap rather than a TSPEC decision to take. Fix: state in §A.5 that AC-3.3's run-level locus holds for a stable corpus and that the per-dispatch row extends it to the divergent case, and record the extension as a named open question or erratum against REQ AC-3.3 (raised below) rather than as a settled reinterpretation. The design itself needs no change. | AC-3.3, BR-10 |
| F-03 | Low | `delta` `local` | **Duplicated article in §D.4.** TSPEC:561 reads "prefix. The The `\b`-anchored prefix match makes an annotated cell…". Fix: drop one "The". | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §T.6's working-tree delta check is "asserted empty except for paths the fixture itself declares". What declares them, and is the declaration reviewable? A fixture free to declare an exempt path could exempt the very state file NG-4 forbids. The static seam scan covers the case in practice, so this is a question about how the exemption list is written down, not a claim that the pair is unsound. |
| Q-02 | §T.3's capture materialises `.baseline-worktree` at the repository root during capture. Is that path gitignored, so that a capture interrupted before the worktree is removed cannot leave an untracked directory that later reds the §T.6 porcelain assertion for an unrelated reason? |

## Positive Observations

- **Every new grounded claim I could check holds, including the ones that are inconvenient to the design.** P-2b's Phase CR path is real (`orchestrate-dev.js:14553-14556`, `:7306`, `:7342-7358`); `rtGit` is at `runtime-adapter.js:1003`; P-9's shared-budget retraction is exactly right — `rtCachePut` evicts oldest-inserted against a global `RT_READ_CACHE_MAX_BYTES` (`runtime-adapter.js:459-465`), so residency genuinely is not guaranteed to this corpus, and §A.4 now says so instead of claiming the corpus "fits with room to spare".
- **ERR-5 is correct, and correcting provenance rather than the rule is the right call.** I re-ran the corpus predicate: 9 documents, and all 9 carry a bare ISO `Date Completed` value (`2026-06-02` … `2026-08-18`). FSPEC E-13's "(measured: occurs at HEAD)" does not hold on this corpus. Keeping the `\b`-anchored tolerance while refusing to let a fixture claim it was sampled here is precisely the distinction a fixture author needs.
- **AT-29's vacuity fix is grounded in the real corpus, not a contrived hostile one.** The claim that six of the nine corpus documents carry literal gate grammar checks out exactly, including the specific count: `LEARNINGS-pdlc-review-loop-hardening.md` carries seven such lines. A fixture that quotes `VERDICT:`/`ERRATUM:` because the shipped corpus does — plus a scripted `_agent` that echoes the prompt's trailing bytes — turns BR-11's isolation claim from a tautology into a result, and the two named mutations make the test's power checkable.
- **§T.5's inventory is now mechanically checkable, and it checks out.** 2 + 9 + 3 + 3 + 6 + 12 = 35, and I verified the union is exactly AT-01 … AT-35 with no duplicate — the AT-11/AT-12 double-assignment is gone, and the `learningsSuiteMap` disjointness assertion keeps it honest as suites grow.
- **§T.7 retracts a claim that flattered the design.** "Every fail-open branch is load-bearing for the existing coverage gate" was false for a 300-line region inside a 15k-line file, and the replacement — a named per-branch AT inventory owned by this TSPEC — is a stronger obligation that does not depend on tooling that does not exist.
- **§T.3's baseline circularity is genuinely dissolved, not argued away.** The merge-base worktree separates subject from harness, and the hand-transcribed digest literal in the guard test is the right anchor: a re-capture that rewrites both the fixtures and the manifest still reds until a human edits a constant in a reviewable diff.
- **§I.3 gives `RSN-SELF` a producible path without weakening §D.6.** Carrying the self entry with `excluded: "RSN-SELF"`, `text: null`, and testing `excluded` before `readOk` keeps "decided before any read" true while making BR-9's totality claim satisfiable — and it stops a self document being mis-reported as `RSN-UNREADABLE`.

## Recommendation

**Needs revision** — one High finding (F-01), and it is a one-line edit.

Every blocking finding from v1 is resolved, and several are resolved more thoroughly than asked. The single blocker is not a design defect: §I.2 already reasons its way to the right answer for AC-5.1b, and §D.2 simply was not amended to match, so the document currently specifies two incompatible record shapes and the normative one breaks the acceptance criterion.

Exactly what to change:

1. **F-01 (High)** — Remove `notices` from §D.2's `learningsInjection` object literal (TSPEC:506) and show it on `buildFinalReport`'s run-level notice channel, matching §I.2:353-355 and its presence table.
2. **F-02 (Medium)** — In §A.5, scope AC-3.3's run-level locus to a stable corpus and record the divergent-run extension as an open question / REQ erratum rather than as a settled reinterpretation.
3. **F-03 (Low)** — "The The" → "The" at TSPEC:561.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
