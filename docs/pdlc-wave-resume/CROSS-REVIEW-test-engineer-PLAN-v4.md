# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`
**Date:** 2026-08-23
**Iteration:** 4 (upstream-cascade confirmation, round 5 erratum on TSPEC)

## Overview

This is not a re-review of the PLAN. The PLAN's own bytes are unchanged since my v3 approval
(`git diff 485d62fa -- docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` is empty). What changed is
the upstream I approved it against: TSPEC moved from v1.3 (`sha256:5ed76227…`, commit `03483136`)
to v1.4 (`sha256:4b5f7f5b…`) across nine commits in a round-5 erratum. The other three upstreams
are byte-identical to the versions recorded in my v3 `UPSTREAM-STATE` block — REQ
`sha256:17e83bfc…`, FSPEC `sha256:9a6be7b5…`, DECISIONS `sha256:37b3684d…` — so TSPEC is the whole
delta surface.

The one question: **does the PLAN still hold as a faithful compression of the TSPEC that now
stands?** Measured against the upstream text at HEAD, not against the routed-item list.

The erratum touched eight places. Seven of them the PLAN either already matched or never leaned on:

| TSPEC v1.4 change | Does the PLAN lean on it? |
|---|---|
| §5.7 generative run count pinned at `numRuns: 500` | **Already matched.** T-08 and §4.5's DoD line both carry `numRuns: 500` with the same `advisoryHelperProperties.test.js` precedent. TSPEC moved *toward* the PLAN here; the three documents now agree. |
| §3.1 / §6.1 DEC-WVR-06 interpolated-value count four → five | **Not carried.** The PLAN never states the count; it delegates the catalogue set-equality to T-02 by reference. No drift. |
| §2.4 exclusion column names the *first* conjunct as discriminating | **Not carried.** T-07 says only that the `is not a valid value` notice is left untouched and is "the one excluded notice, named in §2.4" — a pointer, not a restatement of the reasoning. Still true. |
| §5.2 H-1 restated as a reuse-and-consistency choice, not a harness limit | **Not carried as rationale.** T-07 and §3.1 describe H-1 mechanically (optional `events` array, additive, default-off). The PLAN never claimed the extension was forced. No drift. |
| §2.5 restated as ratification of FSPEC §3.4 | **Not carried.** The PLAN cites §3.4 only for the config literal and pathspecs, never for the write-site question. No drift. |
| §6.3 items 1–4 recorded as landed upstream | Bears on §3.4 / RK-2's "erratum this dispatch raises" wording — see F-03, inherited. |
| §5.4 AT-05 gains a write-side conjunct | **Carried by reference.** T-07 owns "every new integration case of TSPEC §5.4", AT-05 among them, and §4.1 maps AT-05 → T-07. The new conjunct arrives with the section. Good. |
| §5.5 three mutations → **five** | **Carried by enumeration, and now stale.** See F-01. |

That last row is the finding. The PLAN's §4.3 is not a pointer at TSPEC §5.5 — it is a
transcription of it into a task-ownership table, with a heading that states the count, a T-07 duty
line that states the range, and a DoD checkbox that states the count again. An enumeration is
exactly the kind of compression that breaks when the upstream grows, and this one broke.

One further drift comes from §5.8's disclosure of a fourth `c8.include` entry — see F-02.

## Batches

The batch DAG is untouched by this delta and I re-derived it once to be sure: T-01 in batch 1;
T-02/T-03/T-04 in batch 2 (`max(dep batch) + 1` over `T-01`); T-07 and T-08 in batch 3 (deps
`T-02`); T-10 in batch 4 (deps `T-07, T-08, T-03, T-04` ⇒ `max(3,3,2,2)+1 = 4`). Ids unique, graph
acyclic, every dependency resolves, and no two tasks in the same batch create or append the same
new file — T-10 re-opens `waveExecution.test.js` in batch 4 behind a real `T-10 → T-07` edge, which
is the serialisation rule 2 asks for, not a violation of it. Nothing in the TSPEC erratum touches
task decomposition, ownership or ordering, so the wave shape I approved in v3 stands.

What the delta does touch is what happens *inside* two of those tasks.

**T-07's mutation duty is now short by one.** TSPEC §5.5 at v1.3 opened "Three mutations this suite
is specifically designed to kill"; at v1.4 it opens "Five mutations…" and adds item 5,
*suppressing the record write while `explicitPointer` is true*, whose kill oracle is the write-side
conjunct AT-05 gained in the same round. TSPEC is explicit that nothing else kills it: "Without it
the mutation leaves AT-05, AT-07, AT-15 and AT-18 green." The PLAN, at three separate sites, still
says four:

- §4.3's heading — "Mutation resistance — four mutations, each with an owner who **runs** it" — and
  a four-row table whose rows are the ancestry guard, the transport-branch write move, the
  run-relative wave number and the eager probe.
- T-07's task cell — "**Mutation duty (§4.3 rows 1–4):** apply each, observe RED against the named
  oracle, revert, record."
- §4.5's DoD checkbox — "Each of §4.3's four mutations was applied, observed RED against its named
  oracle, reverted, and its failure output recorded in the owning task's report."

An implementer working the PLAN as written applies four mutations and stops. The fifth is the one
TSPEC says is otherwise invisible, and it guards the write that §2.5 exists to ratify — the record
an operator-pointed recovery run must leave behind so the *next* run can resume. Note this is not
the same mutation as the existing row 2 ("move the record write outside the transport branch",
killed by AT-09's empty `ledgerWrites`): row 2 relocates the write, mutation 5 suppresses it on one
provenance branch only, and AT-09 drives an automatic run, so row 2's oracle does not see it.

The AT-05 conjunct itself is fine — T-07 owns "every new integration case of TSPEC §5.4" and lists
AT-05 explicitly, so the new write-side conjunct arrives with the section it lives in. It is only
the mutation *observation* that has no owner. That asymmetry is precisely why the fix is small: add
one row to §4.3, extend T-07's range to `1–5`, and change two count words.

**T-10's floor oracle is now stricter than the upstream permits.** TSPEC §5.8 at v1.3 described the
gate as `--per-file --branches 85` with a three-entry `c8.include` covering only
`pdlc/workflows/` sources. At v1.4 it discloses a fourth entry,
`**/scripts/capture-learnings-baseline.mjs`, external to `pdlc/workflows/` (hence
`allow-external: true`), and states plainly: "It covers no code this feature touches, but
`--per-file` applies the floor to it independently, so a red there is not a red in this feature's
module." The PLAN's T-10 oracle (i), the batch-4 gate row and the §4.5 DoD line all bind
`npm run test:coverage` **exits 0**. Under a four-entry per-file include, that command can exit
non-zero for a file this feature never touches, and the PLAN gives the implementer no permitted
response — the checkbox is unconditional. See F-02.

## Dependencies

_(placeholder)_

## Verification

_(placeholder)_

## Findings

_(placeholder)_

## Delta-Confirmation Findings

_(placeholder)_

## Verdict

_(placeholder)_
