# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.1)
**Date:** 2026-08-13
**Iteration:** 1
**Scope:** Testing lens — testability of §4's rules, §5's expected sets, §7's edge cases and §8's
acceptance tests. Every repo path and every "at HEAD" claim below was checked against the working
tree, not against the REQ's or the FSPEC's account of it.

## Grounding performed

| FSPEC claim | Checked against | Result |
|---|---|---|
| §5.1 authored/rendered check names (5 rows) | `.github/workflows/pr-tests.yml:28,78,112,138,196`; matrix `:40-41`, `:87` | **Correct, literally** — including `Generated artifacts **are** in sync`, which is the wording that actually ships. Rendered column consistent with `os: [ubuntu-latest]`, `node: ['20']` |
| §5.2 "the twelve `lib/*.mjs` files" | `pdlc/engine/lib/` | **Correct count** — adapter, auth, catalogue, guard-measurement, handshake, outcome, report, run, skills, startup, transport-cli, transport |
| §5.2 CLI entry `bin/pdlc.mjs`; no `files` field (M-ENG-11) | `pdlc/engine/package.json:6-8`, whole file | **Correct** — `bin: {pdlc: "bin/pdlc.mjs"}`, no `files` key |
| F-1 steps 2–5 "[shipped]" symbols | `handshake.mjs:93` `satisfiesRange`, `:45` `readPluginVersion`, `:131` `REMEDY`, `:144` `checkCompat`; `skills.mjs:54` `PLUGIN_ROOT_ENV`, `:204` `resolvePluginRoot`; `startup.mjs:384` | **Correct** — every named symbol exists at the cited name |
| F-2 step 1 "`pdlc/README.md`'s `## Install in another repo` section" | `pdlc/README.md:132` | **Correct** heading, and it documents the plugin install today (`:138-139`) |
| F-7 step 2 bootstrap pair | `pdlc/workflows/build-runtime.mjs`, `pdlc/hooks/scripts/sync-workflows.sh` | **Correct**, both exist |
| §5.2 "Workflow modules … presence is not optional" | `pdlc/engine/lib/run.mjs:53` — `new URL("../../workflows/orchestrate-dev.js", …)` | **Not true at HEAD**: the modules the engine executes live *outside* the package root. See F-01 |
| F-5 step 7 publish channel (DEC-DIST-05) | `pdlc/engine/package.json:2,4`; `docs/_decisions/DECISIONS-plugin-distribution.md:115-119` | Manifest is `"private": true` and unscoped `pdlc-engine`; the decision requires a **scoped public** package. See F-07 |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **§5.2 is not an enumeration, so its set-equality degenerates into the containment check BR-5.2.1 forbids — and AT-3.8 is not marked `[blocked]`.** Three of the five rows name no members: "Workflow modules — *in whatever arrangement O-10 chooses*", "Engine adapter — the adapter that re-expresses the runtime's capabilities", and "the **twelve** `lib/*.mjs` files" (a count seeded from HEAD, not a list of names). Two consequences, both fatal to AT-3.8 as written. (a) *Unwritable today*: at HEAD the engine reaches its workflow modules by relative URL **out of the package root** — `pdlc/engine/lib/run.mjs:53`, `new URL("../../workflows/orchestrate-dev.js", import.meta.url)` — so which files that class contains is precisely what O-10 has not decided; a test asserting "a removed workflow module fails" has nothing to remove. (b) *Implementation echo*: the only version of the lib row a test can execute today is `readdirSync("pdlc/engine/lib")`, i.e. the expectation derives its expected value from the code under test, and a deleted module would pass. §5.1 is the right model and it is right there in the same section: it transcribes five literal strings. **Fix:** enumerate the twelve `lib/*.mjs` filenames literally, the same way §5.1 enumerates check names; and either mark AT-3.8 `[blocked on O-10]` for the workflow-module and adapter classes, or split it into a writable half (manifest, `bin/pdlc.mjs`, the twelve named modules, the three exclusions) and a blocked half. | §5.2; BR-5.2.1; AT-3.8 |
| F-02 | High | Local | **BR-5.1.1's authored-alphabet oracle, as scoped, fails on day one and then fails again on this feature's own deliverable.** It says the oracle is "the authored `name:` strings of **the repo's workflow files**". Two defects. (a) `pr-tests.yml` carries ~16 *step*-level `name:` strings (`:46,53,66,70,92,99,103,126,132,152,160,163,181,184,205,218`) alongside the five job-level ones; set-equality over "the authored `name:` strings" of that file is red before anyone edits anything. BR-5.1.3 does say "a job `name:`", so the intent is clear — but the oracle sentence is the one an implementer transcribes, and it is the one that is wrong. (b) F-5 adds a **second workflow file** whose job names are authored `name:` strings in a repo workflow file. BR-5.1.1's "**any addition** fails … is literal", while BR-5.1.5 says the publish workflow is a separate additive trigger — i.e. the feature's own publish workflow is simultaneously required to be in the set and required not to be. **Fix:** scope the oracle to *job-level* `name:` keys of the **PR-gate** workflow file(s), name the file(s) the carrier reads, and state explicitly that the publish workflow's jobs are outside the set because they are not PR checks. | BR-5.1.1; BR-5.1.5; AT-3.4; E-20 |
| F-03 | High | Local | **The publish channel has no seam, so AT-3.1, AT-3.3 and AT-3.5 cannot be run — and AT-3.3 cannot be run even once.** F-4 step 6 sets the precedent explicitly ("the seam exists so that the pin assertion is testable without a network and NG-3's boundary is testable by stubbing"); F-5 has no equivalent obligation anywhere in §4 BR-3 or §5. AT-3.3 is the sharp case: it asks a verifier to re-run publish for an already-published version and hash the published bytes before and after. DEC-DIST-05's own deciding reason (`docs/_decisions/DECISIONS-plugin-distribution.md:125`) is that *the registry refuses re-publish* — so exercising this against the real channel burns a real version number irreversibly, and the "explicit no-op" branch of the disjunction can never be observed locally at all. AC-3.3 discharges C-7 (immutability), which makes an undischargeable AT a real coverage hole, not a convenience one. **Fix:** one obligation in F-5 that the publish action sits behind an injectable channel seam (so the tag/version, range/plugin and collision branches are decidable offline over a stub, as §5.1 and §5.2 already are), plus a named, dated one-time real-channel observation for the leg the seam genuinely cannot cover — the same shape BR-5.1.4 already uses for the rendered column. | F-5; BR-3.3; AT-3.1, AT-3.3, AT-3.5 |
| F-04 | Medium | Local | **The `[blocked]` labels disagree with each other three ways, and the writable/blocked split is what a PLAN schedules from.** The §8 AT-4 heading says "**[blocked on O-9 for AT-4.2 and AT-4.4]**"; the bodies mark **AT-4.2** and **AT-4.5**; §9 Q-1's *Blocks* line says "AT-4.2, AT-4.5, the load-root half of AT-6.2". AT-4.4 is the anti-echo change check and is writable today (it needs only two plugin versions and a revert — no new carrier); AT-4.5 depends squarely on O-9's authored-file enumeration. As it stands the one AT that most needs writing is labelled blocked and one that is blocked is labelled writable. **Fix:** make the heading read "[blocked on O-9 for AT-4.2 and AT-4.5]". | §8 AT-4 heading; AT-4.4; AT-4.5; Q-1 |
| F-05 | Medium | Local | **The whole AT-2 family names no execution environment, so five ATs sit between "automated" and "manual" without the document choosing.** AT-2.1, AT-2.3, AT-2.4, AT-2.5, AT-2.6 all require a *machine* — a clean one, a global install, `PATH` resolution, an install location, a Node below the floor, and two consumer repos. None is marked `[blocked]` (correctly — no obligation is missing), but none says how it is discharged either, and the §8 preamble's only label is `[blocked]`. The FSPEC has already shown it is willing to state this kind of thing (F-4 step 6's stub; AT-5.1's "asserted through the stub"). Without it, TSPEC has three defensible readings — container fixture, `npm pack` + temp-prefix install, or human checklist — and AC-2.1…AC-2.5 are at risk of being discharged by whichever is cheapest. **Fix:** per AT (or per family), one word: automated-with-fixture, or manual-with-recorded-evidence. | §8 AT-2; F-2; F-3 |
| F-06 | Medium | Local | **§5.3's set-equality has no carrier and its `Given` is an unnamed and fairly exotic fixture.** "Artifact *kinds*" are not decidable from a disk listing the way §5.1's `name:` keys and §5.2's tarball entries are, and AT-5.3's Given quietly requires a single dev-mode run that writes a report **and** a POSTMORTEM **and** rewrites a `QUEUE.md` row **and** commits — i.e. a halted, queue-driven run, which the FSPEC never says. Two sub-gaps follow: a run with no POSTMORTEM makes kind 2 vacuously true (the classic pass-by-absence), and "a newly added kind forces this enumeration to be revisited" has no failing test attached to it at all. **Fix:** state the decidable carrier — most naturally the run's own authored-file enumeration (Q-6/BR-5.3), partitioned into the four kinds, which also makes "a newly added kind" mechanically detectable — and name the fixture AT-5.3 needs. | §5.3; AT-5.3; Q-6 |
| F-07 | Medium | Local | **The manifest cannot be published at HEAD, and no rule, edge case or AT names that precondition.** `pdlc/engine/package.json:4` is `"private": true` and `:2` is the unscoped name `pdlc-engine`, while DEC-DIST-05 (`docs/_decisions/DECISIONS-plugin-distribution.md:115-119`) requires a **scoped public** package. `npm publish` refuses a private manifest outright. AT-3.1 asserts "published — with no human step" and would fail for a reason no finding, no §7 row and no BR names; §7 has rows for red checks (E-14), tag disagreement (E-15), range disagreement (E-16), collision (E-17) and credentials (E-18), but none for "the package manifest is not publishable". This is exactly the class of failure that should be red in the PR gate, not discovered at first tag push. **Fix:** a BR-3 rule plus an E-row obliging the publish preconditions on the manifest itself (publishable, scoped per DEC-DIST-05, name matching the pairing record), checked offline like §5.1 and §5.2. | F-5 step 7; §7 E-14…E-18; AT-3.1 |
| F-08 | Low | Local | **AT-3.4's mutation evidence and the existing arrangement test both pin the same live file, and neither says how.** AT-3.4 requires "mutations — rename, delete, add, matrix-axis edit — each fail", which cannot be executed against `.github/workflows/pr-tests.yml` in place; it needs fixture copies. Separately, `pdlc/engine/__tests__/ci-arrangement.test.js:44-60` already regex-asserts that same file's matrix (`os: [ubuntu-latest]`) and job set, so §5.1's carrier will be the second gate on one file. **Fix:** one clause that mutation evidence runs over fixture copies, and one sentence saying which of the two owns the matrix assertion — otherwise a matrix edit produces two failures with two different remedies. | AT-3.4; BR-5.1.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5.2's "Engine adapter" row: does it mean `pdlc/engine/lib/adapter.mjs` — in which case it is already inside the "twelve `lib/*.mjs` files" row and the two rows double-count one file — or `pdlc/workflows/runtime-adapter.js`, which `adapter.mjs:8-13` says is **deliberately not ported**? Member-for-member equality cannot be computed while one member may be counted twice or may name a file the engine explicitly does not carry. |
| Q-02 | AT-2.2 asserts "exactly one occurrence" of the install command in the tree. `pdlc/README.md:138-139` documents the plugin install and `:145` gives a local-marketplace variant of the *same* command — so the plugin install already exists twice by design. If the engine install gains an equivalent fallback variant, does AT-2.2 fail, or is "one occurrence" scoped to the canonical form only? A grep-shaped oracle needs the answer before it is written. |
| Q-03 | Q-7 defers M-ENG-10's closing sentence (`docs/_constraints/pdlc-engine-baseline.md:209`, still "a change means changing the fact first") to a later pass. That leaves two live sentences claiming change-control over one set for the duration of Phase 1 — the exact divergence round-4 F-01 raised. Is the deferral bounded by anything observable (e.g. "before the §5.1 carrier lands"), or does it rely on nobody editing the matrix in the interim? |
| Q-04 | F-7 step 3's conjunct (1) is "the run completed and emitted its own named output artifacts" — which an engine run also satisfies (round-4 F-02, now Q-2). §8's AT-6.2 is honest that it claims no more. Is the intended interim discharge of AC-6.2 therefore a *manual* observation with the install state recorded out of band? If so, saying so in AT-6.2 costs one clause and stops a later reader from mistaking it for an automated test that passes. |

## Positive Observations

- **§5.1 is a model expected set and it survives literal checking.** All five authored strings and
  both rendered names match `pr-tests.yml:28,78,112,138,196` byte for byte, including the easily
  paraphrased `Generated artifacts **are** in sync`. Transcribing rather than describing is what
  makes AT-3.4 writable without reading the workflow first, and it is the discipline F-01 asks the
  neighbouring §5.2 to adopt.
- **BR-5.1.4 answers round-3/round-4 F-03 exactly at the right level.** A dated, one-time,
  explicitly *non-gating* provenance seed is the correct resolution for a locally re-implemented
  expansion rule that would otherwise only ever be compared against itself — and saying "it never
  gates a build" in the rule itself forecloses the obvious mis-implementation.
- **AT-4.4 / BR-5.4 is a properly falsifiable anti-echo oracle.** "Change it, observe; revert it,
  observe again — a constant that matches once fails the second observation" is precisely the
  structure that kills a hardcoded provenance string, and it needs no new carrier to write.
- **The absence-only oracles are paired throughout.** F-3 step 6 spells out why the upgrade leg's
  positive must be a *change* rather than a match; AC-3.2/AT-3.2 assert on the run's **conclusion**
  rather than on the absence of a package; F-5 step 8 demands two positives on *either* branch of
  the re-run disjunction. This is the failure mode this repo's DC-07/oracle-falsifiability rules
  exist for, and the document handles it without being asked.
- **AT-6.2 states its own limit instead of dressing it up.** "The test asserts exactly this
  conjunction and claims no more" — with the reason and the owning question cited — is a better
  outcome than a fixture that distinguishes nothing while looking rigorous.
- **§5.2's exclusion note discharges round-4 Q-02 honestly**: it records that excluding
  `pdlc/engine/__tests__/` takes a *deliberate packaging decision* given `files` is absent
  (verified: `pdlc/engine/package.json` has no `files` key), rather than assuming the omission.

## Recommendation

**Needs revision**

Three High findings, all of the same family and all cheap to fix: two expected sets whose oracle
sentence does not yet describe a test that can fail (F-01's unenumerated packed set, F-02's
authored alphabet that includes step names and this feature's own publish workflow), and one AT
family with no seam to run against (F-03). None of these is a content gap — the behaviour the FSPEC
specifies is right, and §5.1 already demonstrates the exact discipline §5.2 needs. What is missing
is the last mile between "stated as a set-equality" and "a set-equality an implementer can
transcribe and watch go red".

Concretely, to clear the Highs: enumerate §5.2's members literally and mark AT-3.8's
workflow-module half `[blocked on O-10]`; scope BR-5.1.1 to job-level `name:` keys of the named
PR-gate workflow file and exclude the publish workflow explicitly; and add to F-5 the injectable
channel seam that F-4 step 6 already establishes as this document's own precedent. The Mediums
(label mismatch, AT-2 execution environment, §5.3's carrier, the unpublishable manifest) are each
one to three sentences.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 4, "low": 1}

