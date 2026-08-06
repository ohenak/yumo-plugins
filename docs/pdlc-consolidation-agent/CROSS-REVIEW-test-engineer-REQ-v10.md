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

Two Lows, no Medium, no High. All four v9 Lows are resolved on their mechanism; one of the two below
is a v9 finding refiled with a sharper lesson, the other is a seam this round opened while closing
F-49. Every `file:line` in the changed text resolves to a real authority saying what is attributed to
it — I re-verified them individually rather than trusting the relocation (§Positive Observations).
Neither finding blocks a test author from writing a fixture today, which is why neither is filed
higher.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-52 | Low | Cross-Feature | **The ownership rule and the set-equality range both stop at §2, but this round moved two more blocks into §3 and §4 of the same file — so the sections that now carry an enumerated contract are owned by nobody and lie outside the symmetric defect rule the round just wrote.** F-49's fix is exact for what it covers: §4b's oracle ranges over "the rows this REQ owns — **§1 and §2 entire at Version 1.3**" (`:566-567`), the file agrees ("`REQ-pdlc-consolidation-agent` **owns every row of §1 and §2**", `pdlc-consolidation-vocabularies.md:19-20`), and §5 lists the deliverable as "`docs/_constraints/pdlc-consolidation-vocabularies.md` (**§4b's owned rows**)" (`:584-585`) — which is §1 and §2. But the same round authored §3 (the log's record grammar, `:99-151`) and §4 (pass identity, artifact naming, the PR trailer grammar, `:153-170`) out of this REQ, and cites both as binding: REQ-CONS-01 says the two freeze clauses "are stated once in … **§3** (at `Version` 1.3) and are binding here" (`:100-101`), REQ-CONS-03 the same for §4 (`:221-223`), and NFR-5 cites §3 inline (`:532`). §4 carries an enumerated contract of exactly the kind set-equality exists to protect — "The PR body carries **exactly three** trailers, and each promotion commit carries one" (`:161`), a four-row table. A PROPERTIES author writing the trailer oracle therefore has a pinned version but no stated obligation in either direction: deleting the `PDLC-CONSOLIDATION-SOURCES` row breaches no rule the REQ states, and adding a fourth PR trailer breaches none either. The gap is narrower than it looks — the file's own file-wide clause, "a row change that is not accompanied by a version bump is itself a defect" (`:25-26`), does cover §3 and §4, and the REQ pins 1.3 in all three citations, so undeclared drift is still caught — which is why this is Low and not a re-file of F-49. What is missing is the *symmetric* rule and the ownership statement over those two sections. Two edits close it, and both are one clause: widen the file's ownership sentence to "every row of §1–§4", and widen §4b's range (and §5's deliverable) to "§1–§4 entire at Version 1.3". Tagged Cross-Feature because it is a property of relocating in stages — the range statement was written for the sections that had moved at the time and not re-widened when two more followed in the same round; every feature that trims to budget over several rounds inherits it. | §4b (`:565-571`), §5 (`:584-585`); `docs/_constraints/pdlc-consolidation-vocabularies.md:19-26`, `:99-151`, `:153-170`, `:161`; REQ `:100-101`, `:221-223`, `:532` |
| F-53 | Low | Process | **A compliant relocate-first round moved two blocks out and the file still grew: the margin went from 387 bytes to 344. The trigger fires again at the start of round 11, and the cheap candidates are now gone.** The round did exactly what v9's F-50 asked. `pdlc/skills/pm-author/SKILL.md:118` requires relocation "**before** addressing that round's findings — never after", and `80bbc30` (legacy-region construction → vocabularies §3) is the oldest of the five REQ commits in this delta; a second relocation (PR-trailer grammar → §4) landed inside `209142a`. Together they took roughly 2,900 bytes of prose out of the REQ. At HEAD it is **636 lines / 61,096 bytes** (`wc -l -c`) against `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:42`) — 344 bytes of margin, **43 bytes worse than v9's 387**, and still past both soft thresholds (`SOFT_LINE_LIMIT=630`, `SOFT_BYTE_LIMIT=55296`, `:47-48`). So the round's answers cost about as much as its relocations recovered, and the two clauses F-52 asks for (~250 bytes if written inline) would consume most of what is left. The v9 lesson was "a relocation sized to clear the ceiling buys one round"; the sharper one is that **a relocation that runs concurrently with a finding round buys nothing at all** — the two must be sized against each other, not merely ordered. Concretely for round 11: F-52's fix is best written *in the constraints file*, where widening "§1 and §2" to "§1–§4" is a two-character edit and costs the REQ ~40 bytes for its half. The next relocation candidate is REQ-CONS-06's preamble (`:447-453`), which is now three sentences of summary over a baseline file that already states all of it at `Version` 1.0 — the REQ needs the citation and the two obligations, not the recapitulation. | Whole document; `pdlc/hooks/scripts/check-req-size.sh:42`, `:47-48`; `pdlc/skills/pm-author/SKILL.md:118`; commits `80bbc30`, `209142a` |

## Questions

No open questions. Neither finding is a request for information: each names the clause that closes it,
and F-52's is a two-character widening in a file this feature owns.

## Positive Observations

- **The generated-path predicate is now falsifiable, and I checked it against the builder rather than
  against its own example.** v9's F-51 asked for a predicate; the round gave one keyed on the
  **producer** ("never on a path glob", `:363`) and then supplied the counter-example that proves the
  glob reading wrong: `pdlc/workflows/__tests__/fixtures/` copies whose paths contain
  `pdlc/workflows/dist/` are authored and **do** mint an id (`:366-367`). That file genuinely exists
  and is tracked —
  `pdlc/workflows/__tests__/fixtures/covered-violations/pdlc/workflows/dist/distribution-manifest.json`
  — so a naive implementation keyed on the path substring is falsified by a fixture already in the
  repo. The count checks too: `git ls-files pdlc/workflows/dist/` returns exactly four rows, and
  `build-runtime.mjs:464-469` is the `pdlc-cli.mjs` entry, so "`:465` mints the fourth" is literally
  true. This is the shape I ask of a test and rarely get from a spec: a negative assertion paired with
  what happens instead, on the same path.
- **The relocation was checked for loss again, and again it survived.** §3 (`:99-151`) carries the
  legacy-region material the REQ shed, and it carries **more** than the REQ held: the Pass-1 shape
  ("a two-column table of **full paths** … no row status of any kind — 'Promoted' is only a section
  heading", `:129-132`), both freeze clauses verbatim including the empty-pair case and the single
  `refused`-row exemption, **and** the write-granularity rule ("every write is an append of one whole
  record at end of file … a whole-file read-modify-write of the log is **forbidden**", `:120-127`),
  which is the clause that explains why the log needs no lock. §4 (`:153-170`) likewise carries the
  `passId` grammar, both derived names and a four-row trailer table that adds the per-commit
  `PDLC-PROMOTION-ID` row. Nothing was dropped in either move; both gained.
- **The first-run corpus claim — the one datum a first-run test asserts against — is exactly right at
  HEAD, and it is right only because of a widening this REQ itself owns.** REQ-CONS-01 says "step 1's
  enumeration matches 5 files; `LEARNINGS-orchestrate-dev-workflow.md` and
  `LEARNINGS-pdlc-workflow-distribution.md` are named in the legacy region and consolidated; the other
  3 … are un-consolidated — below the default `volumeThreshold` of 5, so the first tick reaches the
  cadence test" (`:101-105`). I enumerated it: `docs/*/LEARNINGS-*.md` — the shipped glob at
  `nudge-consolidation.sh:28` — matches **2**; `docs/completed/*/LEARNINGS-*.md` matches **3**
  (`pdlc-merge-phase`, `pdlc-review-loop-hardening`, `pdlc-workflow-distribution`); 2 + 3 = 5, which
  holds only under the `docs/completed/*/` widening §5 puts in scope (`:577-578`). Grepping
  `docs/_decisions/.consolidation-log.md` for `LEARNINGS-*.md` returns exactly the two basenames the
  REQ names. So the fixture is 5 enumerated, 2 consolidated, 3 pending, 3 < 5 — every number in that
  sentence is a transcription, and the load-bearing dependency between the count and the glob widening
  is one the document itself states.
- **The predicate's own citation was corrected to distinguish the test from the read.** REQ-CONS-01
  now reads "a bare substring test over the whole of `docs/_decisions/.consolidation-log.md` (`:41`;
  the read is `:36-37`)" (`:77`). That is precise: `nudge-consolidation.sh:36-37` is the
  `with open(log …) as fh: logtext = fh.read()` pair and `:41` is
  `pending = [p for p in learnings if os.path.basename(p) not in logtext]`. The distinction matters to
  an implementer, because scoping the predicate to the consumed block is an edit at `:41`, not at the
  read.
- **F-49 was answered in both artifacts, and the file-wide clause was the one I had not asked for.**
  I asked for a version-pinned citation and a converse defect rule. The round put the symmetric rule
  in the REQ **and** in the constraints file, and added "Consumers cite this file **at its `Version`**;
  a row change that is not accompanied by a version bump is itself a defect"
  (`pdlc-consolidation-vocabularies.md:25-26`) — which is what actually makes the pin load-bearing,
  since a pinned citation with no bump obligation drifts silently. It also generalised the
  back-reference ban from "either table" to "**any** table" (`:15`) in the same round the file grew
  from two tables to four, which is the correct order of operations and is precisely the maintenance
  step F-52 observes was not applied to the ownership sentence.
- **The baseline citation was repointed to the section that exists.** REQ-CONS-06's honest-limit line
  now cites "baseline §4" (`:476`), and `pdlc-advisory-corpus-baseline.md:55` is
  `## 4. The honest limit`. v9's text cited §3, which is `## 3. The two-rung model ladder`. A stale
  section pointer in a relocated citation is the failure mode I flagged the whole relocation strategy
  for; this round found and fixed one unprompted.

## Recommendation

## Verdict
