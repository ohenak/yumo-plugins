# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 1

**Scope:** testing lens only — testability of the four recorded decisions, falsifiability of the
oracles each one names or leans on, and whether every claim the document makes about *existing*
repository behaviour survives a grep. Product framing, architecture choice and prose style are out
of scope.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | DEC-A6-01's capture sequence drops the commit message argument that upstream carries. `DECISIONS:94` reads `git commit-tree {tree} -p {head}`; TSPEC §2.5's block reads `git commit-tree {tree} -p {head} -m "…"` (`docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md:282`). This is not cosmetic and it is not test-caught: the oracle for this mechanism is an **argv-sequence** assertion on a `_git` double (`TSPEC:1109-1114` counts `commit-tree === 1` over recorded argv; `TSPEC:1146` asserts the `update-ref` argv), and a double answers any argv shape happily. A `-m`-less `commit-tree` against real git reads the message from stdin, and the injected transport (`pdlc/workflows/orchestrate-dev.js:11652`, `{ok, stdout, stderr}`, argv-only — no stdin channel) has no way to supply one. Every fixture stays green while the shipped capture blocks. Transcribe TSPEC's sequence including `-m` verbatim, and say which literal the message is | DEC-A6-01, "Decision" |
| F-02 | High | Local | The Consequences claim "**Two new git verbs enter this workflow**: `write-tree` and `commit-tree`, neither of which `orchestrate-dev.js` uses today. Every test double for `_git` A6 touches must answer them" (`DECISIONS:175-177`) is wrong as a set. `update-ref` (0 occurrences in `pdlc/workflows/orchestrate-dev.js`), `read-tree` (0 occurrences) and `clean` as a git verb (0 occurrences — `"clean"` appears only as a merge-status literal at `orchestrate-dev.js:9920`, `:9923`, `:10441`) are equally new; `rev-parse` and `reset` are the only two of the seven that are shipped precedent. Five new verbs, not two. The claim is load-bearing precisely because it states a fixture obligation, and completeness of an enumerated obligation is set-equality, not containment: a double built from this list stubs two verbs and defaults the other three, which is how a restore-path regression false-greens. TSPEC gets this right (`TSPEC:1111` names `read-tree`/`clean`/`reset` as transport-shared) — this document under-enumerates it | DEC-A6-01, "What follows from DEC-A6-01" |
| F-03 | High | Local | DEC-A6-04's consequence pins its own load-bearing distinction to an oracle that cannot falsify it: "Any future 'simplification' that collapses the two breaks AT-01-4 and AT-01-6 together" (`DECISIONS:226-228`). AT-01-6's premise is "tier **enabled, no wave red**" (`TSPEC:1336`) — it never reaches the budget gate, so it is silent on whether `waveBudgetPerRun: 0` dispatches on a red wave. AT-01-4 is the disabled-tier case (`TSPEC:1334`). AT-07-2b (`TSPEC:1372`) covers the parse only — `0` in, `0` back, absent from the invalid-key report. Nothing anywhere in the AT set exercises **`waveBudgetPerRun: 0` with a red wave** ⇒ escalate, zero `_agent` calls, sixth row reading zero, even though TSPEC's own coverage matrix lists "`waveBudgetPerRun: 0`" as covered (`TSPEC:1218`). The behaviour the whole decision exists to admit is untested. Either cite the AT that actually pins it or say plainly that it is upstream-pending; the gap itself is raised as an erratum on TSPEC | DEC-A6-04, "What follows from DEC-A6-04" |
| F-04 | Medium | Local | DEC-A6-04 states `0` means "keep the tier on, keep A6 off": "every red wave escalates with no dispatch" (`DECISIONS:159-161`). Per TSPEC §3.2 step 3, an over-budget wave **still captures**: it writes `write-tree`/`commit-tree` and `refs/pdlc/a6-snapshot-{waveNum}`, then escalates without dispatching, and the ordering is called deliberate (`TSPEC:505-514`, `:1143-1150`). With `waveBudgetPerRun: 0` that is *every* red wave, so a repo that configured A6 off still runs three git plumbing calls per red wave and accumulates one dangling ref per red wave — the accumulation DEC-A6-03's consequences describe (`DECISIONS:218-219`) now lands on the operator who asked for none of it. "A6 off" is a dispatch-level claim being read as a mechanism-level one. State the residue in the consequences, and let the fixture asked for in F-03 assert it positively (`commit-tree === 1` and the `update-ref` present, `_agent` count `0`) rather than leaving it to inference | DEC-A6-04, "Decision" |
| F-05 | Medium | Local | DEC-A6-03 rejects option A (the fixed name `refs/pdlc/a6-snapshot`) on the ground that a later wave's capture would overwrite an earlier resolved wave's record (`DECISIONS:77`), and TSPEC asserts the property "one ref per wave, never overwritten by a later wave" (`TSPEC:973`). No oracle holds it. The two fixtures that observe the ref (`TSPEC:514`, `:1146`) each assert a single `update-ref` on a single run; nothing runs **two A6 waves in one run and asserts two distinct refs**. A regression to the rejected fixed name passes both. This is the rejected option the document says a later reader should not have to reverse-engineer — one two-wave case with a set-equality assertion over observed `update-ref` targets (`{a6-snapshot-1, a6-snapshot-2}`) makes the rejection falsifiable | DEC-A6-03, "Options Considered" |
| F-06 | Medium | Cross-Feature | The two-channel claim is unverified against HEAD: "`.claude/pdlc.config.example.json` gains the key, and `pdlc/engine`'s `ci-arrangement` expectations move with it; the tracked example is an arrangement read by an engine test, so this is a two-channel edit, not a one-file one" (`DECISIONS:223-225`, mirroring `TSPEC:959`). The tracked example carries no `advisory` section at all today — only `dispatch` and `implementation` — and `pdlc/engine/__tests__/ci-arrangement.test.js` contains **zero** occurrences of `advisory`: it reads the file at `:39` and asserts `implementation.testCommand` at `:799`. Adding `advisory.waveBudgetPerRun` to the example therefore breaks no engine expectation and requires no engine edit as things stand. Either the engine test must *gain* an advisory expectation (say so, and name the AT that covers it — none of the nineteen does) or the claim should be dropped; as written a PLAN row will be sized for a coupling that does not exist and a reviewer will trust an engine gate that is not watching | DEC-A6-04, "What follows from DEC-A6-04" |
| F-07 | Low | Local | Quote fidelity: DEC-A6-02 renders FSPEC BR-8's licence as "that scope may widen under O-8's E-6 resolution" (`DECISIONS:63`); the source reads "scope may widen under O-8's E-6 resolution, as AT-04-5 asserts" (`docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md:406`). The dropped tail is the half that names the oracle, which is the half this document's own reversibility argument (`DECISIONS:131-132`) depends on. Quote it whole | DEC-A6-02, "Options Considered" |


## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-A6-01 restores with `read-tree --reset -u {tree}` then `clean -fd` then `reset --mixed {head}`. Files the repair *deleted* that capture held come back via `read-tree -u`, and files the repair *added* go via `clean -fd` — but only because the index still holds the snapshot tree when `clean` runs. Is that ordering asserted anywhere as an ordered argv sequence, or only as the content-hash map of AT-05-1? If only the latter, a reordering that puts `reset --mixed` before `clean` would drop repair-added files from the index's protection and delete snapshot content; worth one ordered-sequence assertion alongside the content oracle. |
| Q-02 | DEC-A6-01's reversibility rests on "two module-private functions … behind a call site that runs only under `advisory.enabled: true`". AT-01-4 asserts "no snapshot ref" on the disabled fixture (`TSPEC:1334`) — is that assertion over observed `_git` argv (no `update-ref` reached the transport) or over the created-file set? Only the former falsifies a capture that ran and failed silently. |
| Q-03 | DEC-A6-02 says the promotion commit's `message` is `chore({feature}): wave {N} advisory promotion ({taskId})` and that AT-04-5 identifies the commit "by the `message` literal and its pathspec" (`TSPEC:1358`). Is the literal transcribed once, in TSPEC §3.6, and read from there by the test — or will the test recompute it from `featureName`/`waveNum`/`taskId`? A recomputed expectation is an implementation echo and cannot fail on a template change. |

## Positive Observations

- Every rejection is stated against shipped code rather than intuition, and the four claims I could
  check mechanically hold: no `stash` call exists anywhere in `pdlc/workflows/orchestrate-dev.js`
  (`DECISIONS:54`); `_runCommand(command)` really does return `{ok, output}`
  (`orchestrate-dev.js:8510`); `commitPaths` really does require `message` and `what` and is not a
  two-argument call (`orchestrate-dev.js:11755-11763`); and the build-outputs commit really is
  shipped precedent for "a second commit past the same gate", guarded exactly as quoted by
  `postWaveRan && implConfig.postWavePathspecs.length > 0` (`orchestrate-dev.js:14416-14426`). That
  is the standard I wish more DECISIONS documents met.
- The fail-closed paragraph (`DECISIONS:179-182`) describes the shipped revert path correctly and
  resists the obvious mis-reading: `doRevert` tags `__isRevertFailure` (`orchestrate-dev.js:3289`)
  and the terminal catch **rethrows rather than mapping to an escalation**
  (`orchestrate-dev.js:3577`), which is what AT-05-5 asserts (`TSPEC:1363`). Getting this right
  matters, because a document that said "escalates" here would have seeded a wrong oracle.
- The `__preDispatch` exclusion argument (`DECISIONS:185-188`) is verified and non-obvious:
  `gatherEvidence` is indeed called inside the driver's `while (true)` attempt loop
  (`orchestrate-dev.js:3393-3395`) which a `consumesAttempt: true` gate re-enters
  (`orchestrate-dev.js:3554`), so hosting the capture there would re-capture on attempt 2. That is a
  real invariant defended with a real citation.
- DEC-A6-04's arithmetic checks out: `positiveInt` accepts only `Number.isInteger(v) && v >= 1` and
  otherwise pushes onto `invalidKeys` and returns the default (`orchestrate-dev.js:1991-1997`), the
  default for this key is `1` (`TSPEC:451`, `:959`), and `attemptBudget` really does depend on the
  shipped validator (`orchestrate-dev.js:2020`) — so "must not change" is earned, not asserted.
- The three set-equality surfaces named at `DECISIONS:235-236` are the right three:
  `ADVISORY_SEAMS` is five-member today (`orchestrate-dev.js:1947`), `ENVELOPE_DEFAULTS` four
  (`:1938`), `ADVISORY_DEFAULTS` gains a key (`:1940-1945`) — each with a transcribed counterpart
  under `pdlc/workflows/__tests__/`. Sequencing them into one PLAN task is the correct call.

## Recommendation

**Needs revision**

Three High findings, all of the same family: an oracle named in this document cannot fail for the
reason the document gives. F-01 and F-02 are transcription defects with test-double consequences —
fix by copying TSPEC §2.5's argv block verbatim (with `-m`) and by enumerating all five new verbs.
F-03 is the substantive one: `waveBudgetPerRun: 0` with a red wave is unpinned anywhere in the
nineteen ATs, so the affordance this decision exists to admit ships untested. Cite the covering AT
if I have missed it; otherwise the fixture belongs upstream, and it is raised as an erratum on
TSPEC. F-04 through F-06 are Medium and can travel with the same revision.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 3, "low": 1}
