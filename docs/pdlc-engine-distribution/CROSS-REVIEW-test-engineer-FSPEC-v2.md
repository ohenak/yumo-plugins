# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.2)
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** delta re-review of `eb24c485..HEAD` against
`CROSS-REVIEW-test-engineer-FSPEC-v1.md`. Prior findings verified resolved or not;
changed sections scanned for new defects; unchanged sections not re-reviewed.

## Prior-finding disposition

| v1 ID | Severity | Disposition | Evidence in v0.2 |
|---|---|---|---|
| F-01 | High | **Resolved** | §5.2 now transcribes members literally: `package.json`, `bin/pdlc.mjs`, and the twelve `lib/*.mjs` names. Verified against HEAD — `pdlc/engine/lib/` holds exactly `adapter, auth, catalogue, guard-measurement, handshake, outcome, report, run, skills, startup, transport-cli, transport`, member-for-member with the table. BR-8.1 now names the echo it forbids ("an oracle that reads `pdlc/engine/lib/` for its expectation passes a deleted module and is a defect"). The unenumerable half is split off as AT-3.8b **[blocked on O-10]**, citing `run.mjs:53` — confirmed: `WORKFLOW_MODULE_URLS` reaches `../../workflows/*.js`, outside the package root |
| F-02 | High | **Resolved** | BR-7.1 scopes both set-equalities to **job-level** `name:` keys of the PR-gate file and names it (`.github/workflows/pr-tests.yml`). Verified: that file has exactly five job-level `name:` keys (`:28,78,112,138,196`) matching §5.1's five rows, and the step-level strings it excludes are real (`:46,53,66,70,92,…`). BR-7.5 puts the publish workflow's jobs outside the set explicitly, and E-29 makes the exclusion a falsifiable row rather than a note |
| F-03 | High | **Resolved** | BR-3.9 obliges an injectable channel seam, F-5 steps 8–10 route publish, re-run and secret-scan through it, and AT-3.1/AT-3.3/AT-3.5 are re-`Given` over the stub. AT-3.3 now names why (`DECISIONS-plugin-distribution.md:125`) and asserts *both* branches, one per stub configuration. The one leg a stub cannot cover is a named, dated, non-gating observation in BR-3.9 — the BR-7.4 shape, reused correctly |
| F-04 | Medium | **Resolved** | AT-4 heading reads "[blocked on O-9 for AT-4.2 and AT-4.5]", and AT-4.4 carries "**Writable today** — no carrier is missing" |
| F-05 | Medium | **Resolved** | §8 preamble defines `[auto]` / `[fixture]` / `[manual]`, declares an unlabelled family a defect, and every family heading carries a label. AT-2's per-test override names the fixture shape (clean container or `npm pack` into a temp prefix with scoped `PATH`), so no AT can be discharged on the maintainer's own machine by default |
| F-06 | Medium | **Resolved** | BR-9.1 names the carrier (the run's own authored-file enumeration, partitioned into the four kinds, plus the commit list), BR-9.2 states what equality means for kinds a run did not produce, and AT-5.3 names the exotic fixture explicitly — a halted, queue-driven run, the only shape producing all four kinds |
| F-07 | Medium | **Resolved** | BR-3.8 makes manifest publish-preconditions an offline gate, E-28 gives it a row, F-5 step 7 and §9 Q-8 own the three HEAD blockers. All three verified: `pdlc/engine/package.json:4` `"private": true`, `:2` unscoped `pdlc-engine`, `:11` `"UNLICENSED"` |
| F-08 | Low | **Resolved** | BR-7.6 sends mutations to fixture copies and assigns the overlapping assertions in `pdlc/engine/__tests__/ci-arrangement.test.js:44-60` to §5.1's carrier on landing — one failure, one remedy |
| Q-01 | — | **Answered** | §5.2 states there is no separate adapter row; the adapter *is* `lib/adapter.mjs`, and `pdlc/workflows/runtime-adapter.js` is not a member. Confirmed at `lib/adapter.mjs:8-13` ("deliberately does NOT port …") |
| Q-02 | — | **Answered** | BR-2.3 and AT-2.2 key uniqueness on the **engine's own** invocations and put `claude plugin install` outside the set. Citations verified: `README.md:115`, `pdlc/README.md:139,145` |
| Q-03 | — | **Answered** | Q-7's deferral is now bounded to an observable event ("expires when §5.1's carrier lands, in that same pass") |
| Q-04 | — | **Answered** | AT-6.2 is labelled `[manual]` with install state recorded out of band as its evidence |

## Grounding checks (changed passages only)

Every new code citation in the delta was checked against the working tree, not against the REQ's
or the FSPEC's account of it.

| New claim in v0.2 | Checked at | Result |
|---|---|---|
| F-1 step 2: `bin/pdlc.mjs:143` reads `pkg.pdlcPluginCompat`, passes it as `engineCompat` into `startup.mjs:302`; `satisfiesRange` is the comparison, not the resolution | `pdlc/engine/bin/pdlc.mjs:140-145` (`engineCompat: pkg.pdlcPluginCompat` inside the `runStartupChecks` call); `package.json:10` (`"pdlcPluginCompat": "^0.22.0"`) | **Correct**, and the round-1 SE correction it encodes is right |
| F-1 step 6 / BR-1.7: the diagnostic is `pdlc doctor`, shipped at `bin/pdlc.mjs:489` | `bin/pdlc.mjs:487-491` — `case "doctor": … cmdDoctor(rest)` | **Correct**; naming the command closes the "fixed by the TSPEC" hole without over-specifying |
| F-5 preamble: `.github/workflows/` holds exactly one file, so the publish pipeline is wholly new | `ls .github/workflows/` → `pr-tests.yml` only | **Correct** |
| F-5 step 7 / E-28 / Q-8: three manifest blockers at HEAD | `pdlc/engine/package.json:4,2,11` | **Correct**, all three, at the cited lines |
| §5.2: twelve named `lib/*.mjs` members | `ls pdlc/engine/lib/` | **Correct**, exact set equality with the table |
| §5.2 / AT-3.8b: workflow modules reached outside the package root | `pdlc/engine/lib/run.mjs:51-55` | **Correct** |
| §5.2 note: `runtime-adapter.js` deliberately not ported | `pdlc/engine/lib/adapter.mjs:8-13` | **Correct** |
| BR-7.1: five job-level names; step-level names at `:46,53,66,70,92` | `.github/workflows/pr-tests.yml:27,28,77,78,111,112,137,138,195,196` | **Correct** — job keys `unit-tests, engine-tests, artifact-freshness, fresh-clone-bootstrap, script-syntax`, names byte-identical to §5.1's authored column |
| F-7 step 2 / AT-6.1: plain sync exits non-zero on `local-edit`/`unverified`, `sync-workflows.sh:703-722` | `pdlc/hooks/scripts/sync-workflows.sh:713-722` — `exit 3` unknown, `exit 2` local-edit/unverified, `exit 1` stale/missing | **Correct** ("exits non-zero" is accurate; the code is finer-grained than the claim, which is the safe direction) |
| AT-6.1: CI establishes the fresh-clone precondition at `pr-tests.yml:138,152` | `.github/workflows/pr-tests.yml:137-158` — job `Fresh-clone bootstrap works`, step `No consumer copy exists yet` asserting `.claude/workflows` absent | **Correct**, and the precondition is genuinely *asserted* by that job, not merely assumed |
| AT-2.2: `claude plugin install` occurrences outside the engine set | `README.md:115`, `pdlc/README.md:139,145` | **Correct** — three occurrences, one of them the local-marketplace variant |

## Findings

All three v1 Highs are resolved and nothing in the delta broke a section I had approved. The
findings below are new, all in changed passages, none blocking.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AT-3.5's credential scan is absence-only and passes vacuously when the credential is never wired.** *Given* the artifact and a stub-run log "with a known sentinel credential value", *When* both are scanned, *Then* "no occurrence in either". Nothing on this path asserts the sentinel was **used**: a publish job that never reads the secret at all — the most likely wiring bug, and the state at HEAD, where no publish workflow exists — satisfies the test perfectly. No other AT supplies the positive: AT-3.1 asserts the stub recorded bytes but says nothing about credentials, and E-18 ("credential missing or expired ⇒ visible failure") has no AT at all, so the negative control is absent too. The root shape is the REQ's — AC-3.5 (`REQ:331-333`) is itself "*Then:* no credential … appears in either", with no conjunct that one was consumed — and is raised as an **erratum against the REQ** rather than charged here. But the FSPEC pairs its own negatives everywhere else it matters (F-5 step 9's two positives on either re-run branch; AT-3.2 asserting the run's *conclusion* rather than the package's absence; BR-9.2's explicit positive pairing), so it can pair this one locally without waiting on the REQ. **Fix:** one conjunct in AT-3.5 — the stub records receipt of the sentinel on the run whose artifact and log are then scanned — or an AT for E-18 (credential withheld ⇒ named failure, nothing published), which makes the credential path load-bearing and the scan falsifiable. | AT-3.5; F-5 step 10; BR-3.6; E-18 |
| F-02 | Medium | Local | **AT-3.8a and AT-3.8b do not compose: the tarball is one enumeration, but only half of it has an expected set, and no partition rule says so.** §5.2's oracle is "the contents of the packed tarball" and BR-8.1 makes equality member-for-member *in both directions* — an added file fails. AT-3.8a asserts the enumerated members equal the **writable** classes. Today those coincide, because the workflow modules live outside the package root (`run.mjs:53`), so the test is writable exactly as written. The moment O-10 lands they will not: the tarball gains members that AT-3.8a's expected side does not contain, and a literal reading goes red for the *right* reason at the *wrong* test. The predictable repair under time pressure is to loosen AT-3.8a to a subset check — precisely the failure BR-8.1 exists to forbid ("a vendored skills copy is exactly the failure this AC exists to catch, and a subset check would pass it"). This is not hypothetical scheduling: O-10 is owned by the **TSPEC** (§9 Q-5, "the TSPEC's/O-10's call"), i.e. the next phase, so both halves will be written after the decision. **Fix:** one sentence in §5.2 or BR-8.1 partitioning the enumeration — AT-3.8a's equality is over the tarball **minus the workflow-module partition**, AT-3.8b owns that partition, and the two together are the member-for-member equality; a member in neither partition fails **both**. | §5.2; BR-8.1; AT-3.8a; AT-3.8b |
| F-03 | Low | Local | **E-22 still claims a decidable check whose only carrier is blocked.** "Workflow modules absent from the packed tarball ⇒ equality fails at build time, offline" cites BR-8.1, but §5.2 marks that class "not enumerable yet" and AT-3.8b `[blocked on O-10]`. Every neighbouring blocked item in v0.2 says so at the point of use (the §5.2 row, AT-3.8b, AT-4's heading, AT-3.1's real-channel leg); this row is the one that does not, so a PROPERTIES author reading §7 alone would derive a property that cannot yet be written. **Fix:** mark E-22 `[blocked on O-10]` in the row, as §5.2 already does. | §7 E-22; §5.2; AT-3.8b |
| F-04 | Low | Local | **AT-2.2's grep key is a name O-8 has not yet fixed.** The uniqueness oracle keys on "the **engine's own** install invocation … keyed on the engine program name", which is the right shape. But the published package name is one of O-8's three open blockers — HEAD is unscoped `pdlc-engine` (`package.json:2`) and DEC-DIST-05 requires a scoped name — so the literal string the grep matches is undecided, while AT-2.2 is labelled `[auto]` and carries no dependency note (unlike AT-3.1, which does name its O-8 dependency). A too-loose key is worse than a blocked test here: grepping bare `pdlc` matches thousands of lines and the "exactly one occurrence" assertion becomes noise. **Fix:** state that the key is the **bin program name** `pdlc` in an install/upgrade *invocation* form, or note the dependency on O-8's final package name the way AT-3.1 does. | AT-2.2; BR-2.3; §9 Q-8 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-5.3b asserts "the two absent kinds are **not asserted vacuously**". That is a property of the *test*, not of the run, and I cannot see how a test suite falsifies it about itself. Is the intent a mutation-style check — a fixture that produces a POSTMORTEM *unmarked* must turn AT-5.3b red, proving the kind is really being examined and not skipped? If so, that is already the second clause of the same bullet, and the first clause can simply be dropped as unwritable prose. |
| Q-02 | BR-9.2 replaces literal four-kind equality with "every kind produced is marked and no kind outside this table is produced". The closure half — *no kind outside* — needs a decidable universe of kinds to quantify over. BR-9.1 says kinds are read off the run's own authored-file enumeration, which is O-9's deliverable and does not exist at HEAD; §5.3 is not marked `[blocked on O-9]` though AT-4.2/AT-4.5 are for the same carrier. Is §5.3's carrier a *different* enumeration that already exists, or does AT-5.3/AT-5.3b share AT-4's blocker? |
| Q-03 | AT-3.4 now runs mutations against fixture copies (BR-7.6) while the expected sets are transcribed from the live `pr-tests.yml`. What keeps a fixture copy from drifting from the live file — is the fixture generated from the live file at test time (in which case mutation is applied to a copy of the real bytes and drift is impossible), or checked in (in which case a live-file edit silently stops being exercised)? One clause in BR-7.6 settles it. |

## Positive Observations

- **The three Highs were fixed at the mechanism, not at the sentence.** Each repair changed what
  a test can *observe*, not how the document reads: a literal member list replacing a directory
  listing, a named alphabet and a named file replacing "the repo's workflow files", an injectable
  seam where there was no seam. That is the difference between an addressed finding and a
  paraphrased one.
- **The split of AT-3.8 into `a`/`b` is the right shape for a blocked half.** The writable half
  keeps full member-for-member equality with literal expected values *today*; only the genuinely
  undecidable half is deferred, and it says exactly what decision unblocks it. Compare the easy
  wrong move — marking the whole AT blocked — which would have lost coverage that exists.
- **BR-9.2 states the hard part of set-equality honestly.** "A green single-feature run writes no
  POSTMORTEM … so literal equality against all four would fail every such run" is the observation
  most specs skip, and the answer given (equality over kinds produced, each kind paired with a
  positive and an unmarked-fails fixture) keeps the check falsifiable instead of quietly relaxing
  it to containment.
- **BR-3.9 reuses BR-7.4's shape rather than inventing a second one.** A named, dated, one-time,
  explicitly non-gating observation for the leg a stub cannot reach — with the reason the stub is
  mandatory (`DECISIONS-plugin-distribution.md:125`) written down — is the same pattern already
  approved for rendered check names. One idiom, used twice, is much cheaper to review than two.
- **E-29 is a negative-space row done right.** "A step-level `name:`, or a publish-workflow job
  `name:`, is added or edited ⇒ the set-equality is **unaffected**" turns an exclusion that was
  prose into something a test can fail on. Most specs state exclusions and never test them.
- **The environment labels close the cheapest-reading loophole.** `[auto]` / `[fixture]` /
  `[manual]`, plus "an unlabelled family is a defect", plus AT-2's explicit "never the maintainer's
  own machine", makes it impossible to discharge AC-2.1…AC-2.5 by having run it once locally.

## Recommendation

**Approved with minor changes**

All three v1 High findings are resolved, verified against HEAD rather than against the document's
own account: §5.2 enumerates its twelve `lib/*.mjs` members literally and forbids the directory
listing that would have derived them; BR-7.1 scopes both set-equalities to the five job-level names
of a named PR-gate file and pushes step-level names and the publish workflow out of the set with a
testable row (E-29); BR-3.9 gives the publish channel an injectable seam, which makes AT-3.1,
AT-3.3 and AT-3.5 runnable offline and makes AT-3.3's no-op branch observable at all. The four
Medium/Low items of v1 are also addressed, and the delta broke nothing I had previously approved.

The four new findings are recorded, not gating. Two are worth folding into the next authoring pass
regardless of the verdict, because both cost one sentence and both get more expensive later:
AT-3.5's scan needs a positive that the credential path is live (F-01, whose root shape is an
erratum against the REQ's AC-3.5), and §5.2 needs a partition rule so AT-3.8a and AT-3.8b compose
into one member-for-member equality when O-10 lands in the TSPEC (F-02). E-22's missing
`[blocked on O-10]` mark (F-03) and AT-2.2's undecided grep key (F-04) are one-line edits.

## Verdict
