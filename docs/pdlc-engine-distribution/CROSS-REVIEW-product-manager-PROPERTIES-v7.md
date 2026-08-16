# Cross-Review: product-manager — PROPERTIES (round-7 delta re-review, freeze)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.9)
**Date:** 2026-08-16
**Iteration:** 7

**Scope:** Product lens only. Delta reviewed is `3a5ca4b6..HEAD` (v0.8, approved with two Lows
in v6). Frozen round: only a delta-introduced defect, or a load-bearing claim false at HEAD,
can block.

## 1. What changed

`git diff 3a5ca4b6..HEAD -- …/PROPERTIES-…md` — 21 insertions, 3 deletions across three commits
(`24959eaa`, `37ef9401`, `81920109`). Three edits, all substantive:

| # | Site | Change |
|---|---|---|
| a | Upstream cell (`:5`) + version cell + changelog `0.9` (`:26`) | Re-pin to REQ v0.12, FSPEC v0.8, TSPEC v0.14, PLAN v0.18 (DECISIONS v0.3 unmoved), with the re-grounding recorded per DEC-ERR-01 |
| b | PROP-PUB-7 (`:157`) | Premise widened from `publish.yml` ↔ `pr-tests.yml` pairwise gate-command equality to **union over every PR-gate file**; trace cell gains `BR-7.7, C-6` |
| c | §5 (`:381-397`) | New **declared gap 4** — BR-7.1's per-PR-gate-file rendered-alphabet set-equality is carried in T17's test but has no named property row |

§4's 35 `AT-` rows, §5's requirement accounting, and §7's counts (89 / 95 / 74) are byte-unchanged,
consistent with the changelog's "no property added, removed, or re-scoped".

## 2. Prior findings

- **F-09 (v4/v5/v6, Low) — RESOLVED.** The Upstream cell no longer pins PLAN v0.8; it names
  REQ v0.12 / FSPEC v0.8 / TSPEC v0.14 / DECISIONS v0.3 / PLAN v0.18, each of which matches HEAD:
  `REQ:18` (0.12), `FSPEC:16` (0.8), `TSPEC:12` (0.14), `DECISIONS:12` (0.3), `PLAN:12` (0.18).
  The v0.9 changelog row records what the re-grounding absorbed rather than asserting a bare
  "re-checked", which is exactly the DEC-ERR-01 shape asked for.
- **F-10 (v6, Low) — still open, deliberately.** PROP-GATE-5's carrier cell (`:234`) still names
  `.github/workflows/fixture-machine.yml` rather than the test that carries the assertion
  (`pdlc/engine/__tests__/ci-arrangement.test.js`). §5's declared gap 4 (`:397`) now names this
  correction explicitly as work for when the Phase CR freeze lifts. Recording it beats fixing it
  under freeze; restated below so harvest sees one defect across two rounds.

## 3. Delta verification against HEAD

Each of the three edits makes a claim about repository or upstream state. All three check out.

**(a) Upstream re-pin is true and the absorption claim is honest.** The five pinned versions match
HEAD as listed above. The changelog does not claim the bump was a pure no-op — it names one
substantive absorption (b) and one recorded gap (c), which is the honest reading.

**(b) PROP-PUB-7's widening is true at HEAD and closes a real document-to-code gap.** FSPEC v0.8
carries `BR-7.7` — "The tag gate re-runs every PR-gate job's commands, not one file's" (`FSPEC:548`),
traced to C-6 (`REQ:239`, "Publishing is gated on the same evidence a PR is"). The shipped carrier
was already ahead of the old wording: `ci-arrangement.test.js` builds `expectedCommands` by
iterating **every** entry of `PR_GATE_FILES` and asserts `assertSetEqual` against `publish.yml`'s
gate block (`pdlc/engine/__tests__/ci-arrangement.test.js:684-700`), under the header comment
"publish.yml's gate job must set-equal EVERY PR-gate job's commands" (`:659`). So the edit narrows
the document toward the code, not the reverse — the property was under-stated, never untested. The
stated consequence is also correct: `fixture-machine.yml` carries AT-2.3…AT-2.6, so a pairwise-only
equality would let a tag pass on strictly weaker evidence than the PR had. Oracle quality holds —
set-equality over the full command enumeration (a deleted command fails), no absence-only oracle,
no expected value derived from code under test.

**(c) Declared gap 4 is accurately scoped.** The claim is that BR-7.1's trigger-derived,
per-PR-gate-file rendered-alphabet equality ships red-able but unnamed in §2. Both halves verify:
the assertion exists (`ci-arrangement.test.js:566-579`, "the rendered alphabet across all PR-gate
files equals §5.1 (BR-7.1)", set-equality over `PR_GATE_FILES`), and no §2 row claims it —
PROP-PUB-6 is deliberately `pr-tests.yml`-scoped (`:159`) so PROP-GATE-5 (`:234`) retains its
discriminating power over row 6. Calling this an *unnamed carrier, not an untested rule* is the
correct characterisation, and deferring the mint (which would move §4's rows and §7's counts) is
the right call under freeze.

**Nothing regressed.** PROP-PUB-6, PROP-REGR-2 and PROP-NEG-16's `pr-tests.yml`-scoped "five
rendered job names" were left alone and remain true. No property lost a carrier, changed level, or
changed trace: PROP-PUB-7 still sits on T17 → `ci-arrangement.test.js` (`PLAN:192`, `PLAN:328`),
and AT-3.4 still maps to T17, T49 (`PLAN:260`).

**Product criteria: nothing lost.** No P0/P1 requirement lost coverage. C-6's carrier is now
named where it was previously mis-stated, which strengthens the AC-3.4 trace rather than moving it.

## 4. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-10 | Low | Local | PROP-GATE-5's carrier cell (`PROPERTIES:234`) names `.github/workflows/fixture-machine.yml` — the artifact under test — where every sibling row names the test file. The assertion is genuinely carried at `pdlc/engine/__tests__/ci-arrangement.test.js:492-546` (T17). Non-gating; §5's declared gap 4 (`PROPERTIES:397`) already schedules the correction for when the freeze lifts. | DoD item 14, C-5, BR-7.5 |

No High and no Medium findings. The one Low is a carrier-cell naming nit on a property whose
substance verifies against the shipped test.

DEFERRED: mint `PROP-PUB-11` for BR-7.1's cross-PR-gate-file rendered-alphabet set-equality (carried at `ci-arrangement.test.js:566-579`) and correct PROP-GATE-5's carrier cell, both when the Phase CR freeze lifts — as §5's declared gap 4 already records.

## Questions

None. The round's one open question — whether widening PROP-PUB-7 to a union changes any
downstream count or trace — is answered mechanically in §3: §4, §5 and §7 are byte-unchanged and
the carrier was already union-shaped.

## Positive Observations

- **The widening moved the document toward the code, and said so.** The v0.9 changelog explicitly
  records that `ci-arrangement.test.js` already asserted the union and that the edit "closes a
  document-to-code gap, not a code gap". That distinction is what stops a future reader from
  re-opening a fixed defect looking for a missing test.
- **The re-grounding absorbed rather than rubber-stamped.** DEC-ERR-01's failure mode is a version
  bump that records "re-checked". This one enumerates the mechanical checks it ran (AT-id
  set-equality across three sides, AC/BR/task-id existence at the new versions) and names the one
  delta that was *not* a no-op. That is the difference between a pin and a re-grounding.
- **Declared gap 4 is the right instrument under freeze.** Naming an unnamed carrier costs nothing
  and loses nothing, where minting a property mid-freeze would have moved §4 and §7 and invalidated
  the counts every reviewer has been checking against. Recording it with the exact property id,
  task and traces to raise later makes the follow-up a mechanical edit.

## Recommendation

**Approved with minor changes.**

The revision broke nothing and every delta claim holds at HEAD: FSPEC v0.8 carries BR-7.7 traced
to C-6; the shipped carrier already asserts the union set-equality over `PR_GATE_FILES`; the
BR-7.1 cross-file alphabet equality is genuinely carried but genuinely unnamed in §2; the five
upstream pins match HEAD. No property, carrier, level, or trace moved, and §4/§5/§7 are
byte-unchanged as claimed.

F-09 is resolved. One Low (F-10) remains open by design, now scheduled by name in §5's declared
gap 4. No High findings, so nothing blocks in this frozen round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:f807d0684f79c65931da217c7f2258fd3310cf2576746bfa52ad2714e0c56759
APPROVAL-HASH-NORMALIZED: sha256:0a7fe32c2cffddce234f082eeb493c9c62e25ca05e7fabc1924027d09ea898ea
REVIEWED-COMMIT: 81920109a4e3b722f00bd8a3cbb0e50d4e4de6c9
UPSTREAM-STATE: REQ sha256:44d0e18836f534cb68444f6e5a0b26eebf3d2aafe7f7630ce1f38fed78b1d00f
UPSTREAM-STATE: FSPEC sha256:5ffc38a7f6ff1b19d31250a7d54dce32c3498941723cfb3f35102d2004027b06
UPSTREAM-STATE: TSPEC sha256:440711317830ec2cc111e58be51a5610ba174906eb1cd6c206e68e508b703833
UPSTREAM-STATE: DECISIONS sha256:05d305f8699fa494c368ddd9e383ab3b34f4fd02a139ae99914886d53c5c7f66
UPSTREAM-STATE: PLAN sha256:d2c3356a750662030b8a8d4a5bf2e767d115af6702bb781981b902c0eba16ae6
