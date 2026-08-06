# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 10
**Scope:** Local (Scope tags per finding below)
**Delta base:** `a38a1e8` (the tree v9 reviewed) → HEAD (`e775262`)

Delta re-review. v9's findings F-48…F-51 are dispositioned in §Prior findings; new findings are
numbered F-52 onward so ids never collide across rounds. Only the five commits that touched the REQ
since `a38a1e8`, plus the two `docs/_constraints/` files they edited, were read for new issues;
unchanged sections approved in v1–v9 were not revisited.

## Prior findings

All four v9 findings are dispositioned below, each against the code or the measurement the revision
cites rather than against its prose.

| v9 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-48 | Low | **Resolved — the base case is now stated over the proposal, in the words the finding asked for** | AC-5.3 now reads "Terminal is stated over the **proposal**, since the pending case is the reachable one: once a `retire` proposal for an id is on a PR in state open or merged, that id's ladder has **ended** — a later `ineffective` tick proposes nothing, records `duplicate-suppressed` against that PR, and the AC-7.1 field names `retirement`. So the ladder cannot run out and the displacement clause never points back into a spent pair" (`:423-426`). That is the exact fixture I could not decide in v9: promote merged → `ineffective` → `revise` merged → streak 0 → two fresh `recurred` → `ineffective` → `retire` proposed → retirement PR left **open** across two more counted passes → `ineffective` fires again. Every one of the three observables a test asserts on that tick is now named — proposal count (zero), log status (`duplicate-suppressed` with `suppressed-by:` the pending PR), and the AC-7.1 field (`retirement`) — so the oracle is a transcription, not an inference. The displacement clause (`:421-423`) is unchanged and is now explicitly bounded by it. |
| F-49 | Low | **Resolved — both directions asked for, plus an ownership rule I had not filed** | §4b now cites the file **at its version** ("`docs/_constraints/pdlc-consolidation-vocabularies.md` §1 (cited at `Version` 1.3)", `:558-559`) and states the converse defect rule: "the defect rule is symmetric, a value used here with no row there **and** a row there naming a value this REQ never uses being equally defects. The symmetry is what makes a *deleted* row a breach; the version pin is what gives a downstream test a fixed expected value to transcribe" (`:568-571`). The rule landed in **both** places — the file's own change-control paragraph carries it too, in the same symmetric form, plus "a row change that is not accompanied by a version bump is itself a defect" (`pdlc-consolidation-vocabularies.md:19-26`), which is the file-wide clause I had not asked for and which is what actually makes the pin enforceable. The file is at `Version` 1.3 (`:7`), matching every citation. The round also answered the range question I did not ask cleanly: the oracle ranges over "the rows this REQ owns — §1 and §2 entire at Version 1.3" (`:566-567`), not over "the table". The one seam that range leaves open is refiled narrowly as F-52. |
| F-50 | Low/Process | **Complied with, and the margin is still thin — refiled as F-53 at Low/Process** | The round relocated **first**: `80bbc30` ("relocate REQ-CONS-01 legacy-region construction to vocabularies §3") is the oldest of the five REQ commits in this delta, ahead of the four that address findings — which is what `pdlc/skills/pm-author/SKILL.md:118` requires. It took the block I named (REQ-CONS-01's legacy-region construction) plus one I had not named (REQ-CONS-03's PR-trailer grammar, into §4), and I checked both for loss rather than for byte count — see §Positive Observations. What did not change is the outcome: at HEAD the REQ is **636 lines / 61,096 bytes** (`wc -l -c`) against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`), a margin of **344 bytes** where v9 measured 387. The relocation was real and the file still grew. Refiled as F-53 because the lesson is now sharper than it was in v9. |
| F-51 | Low | **Resolved — the predicate is keyed on the producer, and every clause of it checks out against the builder** | AC-5.1 now reads "*Generated* is a predicate, not an example, and is keyed on the **producer**, never on a path glob: a path a tracked build step of this repo writes — at HEAD exactly the four tracked outputs of `pdlc/workflows/build-runtime.mjs` (`:465` mints the fourth), all under `pdlc/workflows/dist/`" (`:362-366`), and adds the negative case with its positive counterpart: "An authored file whose path merely *contains* `dist/` — the `pdlc/workflows/__tests__/fixtures/` copies — is authored and **does** mint an id" (`:366-367`). I verified all three factual claims rather than the shape. `git ls-files pdlc/workflows/dist/` returns exactly four rows — `distribution-manifest.json`, `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `pdlc-cli.mjs`. `build-runtime.mjs:464-469` is the `{ file: "pdlc-cli.mjs", id: "pdlc-cli", … }` entry, i.e. `:465` does mint the fourth. And the fixture counter-example exists and would have false-negatived a glob: `pdlc/workflows/__tests__/fixtures/covered-violations/pdlc/workflows/dist/distribution-manifest.json` is a tracked, authored file whose path contains `pdlc/workflows/dist/`. The classifier is now decidable for every path in this repo, and the negative assertion is paired with what happens instead — which is the form I ask of a test oracle and did not expect to get in the spec. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
