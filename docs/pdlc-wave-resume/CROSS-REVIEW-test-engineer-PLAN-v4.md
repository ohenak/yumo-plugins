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

Upstream dependency state at this dispatch, verified by hashing the working tree:

| Upstream | Hash at HEAD | Hash in my v3 `UPSTREAM-STATE` | Moved? |
|---|---|---|---|
| REQ | `sha256:17e83bfc…` | `sha256:17e83bfc…` | No |
| FSPEC | `sha256:9a6be7b5…` | `sha256:9a6be7b5…` | No |
| TSPEC | `sha256:4b5f7f5b…` | `sha256:5ed76227…` | **Yes** (v1.3 → v1.4) |
| DECISIONS | `sha256:37b3684d…` | `sha256:37b3684d…` | No |

So every finding below is TSPEC-caused, and the REQ/FSPEC claims the PLAN carries — the eighteen
ATs, the three shipped-assertion budget, the five announcing rows, REQ C-3's no-fifth-key
constraint — re-verify unchanged. I re-checked the two most cascade-prone of those by hand:
FSPEC still carries eighteen ATs (§4.1's map is complete against it), and TSPEC §2.4 still
enumerates exactly three shipped whole-string assertion changes, which is what holds the PLAN's
D-11 row and DoD line at three.

One genuine improvement worth recording as a dependency, not a defect: TSPEC §5.7's pin at
`numRuns: 500` was previously a PLAN-only figure with TSPEC silent, which I had let pass in v3 as
the PLAN being stricter than its upstream. The erratum closes that gap in the right direction —
TSPEC, PLAN T-08 and PROPERTIES now state the same number, and the PLAN's DoD line "the four laws
P-1 … P-4 pass at `numRuns: 500`" is now a transcription rather than an invention. This is the
delta making the PLAN *more* faithful, and it needs no PLAN edit.

The §6.3 change is a subtler dependency. All four erratum items are now recorded as **landed
upstream**, and TSPEC states none is re-emitted as an `ERRATUM:` line. The PLAN twice describes
itself as raising an erratum about the coverage floor — §3.4's integration-points table ("the
erratum this dispatch raises") and RK-2's mitigation cell ("the difference from TSPEC's wording is
raised as an erratum"). I filed both as a Medium in v3 when TSPEC v1.3 landed the reassignment;
they remain uncorrected, and v1.4's "resolved ledger, none open" framing makes the PLAN's
self-description read further from the truth. It is still the same defect, still confined to
rationale prose, still Medium — inherited, not delta. See F-03.

## Verification

How I checked, so this is reproducible rather than assertive:

1. `git rev-parse --abbrev-ref HEAD` ⇒ `feat-pdlc-wave-resume`.
2. `git diff 485d62fa -- …/PLAN-…md` ⇒ empty. The PLAN's bytes are the ones I approved.
3. Hashed all four upstreams; located the TSPEC blob matching my v3 `UPSTREAM-STATE` hash by
   replaying `shasum` over every TSPEC commit — it is `03483136`. Diffed `03483136..HEAD` for the
   TSPEC and read every hunk.
4. For each hunk, grepped the PLAN for the claim it changes (`numRuns`, `500`, `interpolat`,
   `c8`, `include:`, `allow-external`, `per-file`, `85`, `mutation`, `H-1`, `AT-05`, `erratum`,
   `§2.5`, `3.4`, `write-side`, `ledgerWrites`) and read the surrounding PLAN prose in full rather
   than the grep line.
5. Re-derived the batch column from the `Deps` column for all seven tasks; checked file ownership
   for same-batch collisions on new files.
6. Re-read `CROSS-REVIEW-test-engineer-PLAN-v3.md` to separate inherited findings from delta ones.

**Why F-01 is High and not Medium.** In v3 I demoted two findings to Medium under DEC-ERR-01
because they were false statements confined to rationale prose that no gate, task, oracle or DoD
checkbox reads. F-01 is the opposite on every one of those axes. §4.3 is read by a task (T-07's
duty line cites it by row range), by a DoD checkbox (which counts it), and by an implementer
deciding how many mutations to run. The consequence is not a reader's inaccuracy — it is a
load-bearing oracle that ships unproven. TSPEC states in terms that mutation 5 leaves four ATs
green, so nothing else in the suite would catch it, and what goes unproven is the write that makes
resume work on the recovery path the whole feature exists to serve. A missing mutation observation
on an oracle the upstream names as otherwise-invisible is a real false-green risk, which is the
High bar, not the Medium one. It is also a two-line fix, which is why I expect one bounded
follow-up round rather than a phase re-run.

**Why F-02 is Medium and not High.** Its failure mode is a false *red*, not a false green: if the
external `capture-learnings-baseline.mjs` entry sits under 85% branch coverage, T-10's gate command
exits non-zero and the batch-4 gate blocks a feature that is in fact complete. False reds announce
themselves and cost time, not correctness — no shipped behaviour is left unverified. But it is not
Low either: the DoD checkbox is unconditional, so an implementer hitting it has no sanctioned way
forward and may be tempted to relax the gate command, which *would* be a correctness loss. Naming
the per-file scope (this feature's module, per TSPEC §5.8) resolves it.

**Why F-03 stays Medium and inherited.** Nothing about it changed except that its upstream got
further away. Same demotion rationale as v3: rationale-prose falsehood, no gate reads it, the
implementation is unaffected in every particular.

**Nothing else came loose.** I looked specifically for the failure mode where an erratum lands
half-applied and a downstream document keeps describing the old framing: §5.7's pin, §5.8's include
list, §3.1's count, §2.5's ratification and §6.3's ledger all moved together in TSPEC, with the
version cell bumped to 1.4 and a revision-history row describing each change. I found no
half-applied TSPEC edit. The two delta findings below are the PLAN failing to follow a *successful*
erratum, not evidence of a failed one.

## Findings

The ordinary-round findings table is not used in this round; the round's findings are in
`## Delta-Confirmation Findings` below, which is the only section carrying `FINDING:` lines. The
counts in the verdict are the counts of that table.


## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | TSPEC §5.5 now names **five** mutations, adding "suppressing the record write while `explicitPointer` is true", killed only by AT-05's new write-side conjunct. The PLAN still enumerates **four** in three binding places: §4.3's heading and four-row table, T-07's "Mutation duty (§4.3 rows 1–4)", and §4.5's DoD checkbox "Each of §4.3's four mutations". An implementer runs four and stops, leaving unproven the oracle TSPEC says nothing else catches ("leaves AT-05, AT-07, AT-15 and AT-18 green") — the write that makes an operator-pointed recovery run resumable. Not covered by existing row 2, which relocates the write and is killed by AT-09 on an automatic run. Fix: add the fifth row naming AT-05's write-side conjunct as its oracle and T-07 as owner, change `rows 1–4` to `rows 1–5`, and change both count words. | §4.3 (heading, table), T-07 mutation-duty cell, §4.5 DoD mutation checkbox |
| F-02 | Medium | delta | local | TSPEC §5.8 now discloses a **four-entry** `c8.include` whose fourth entry, `**/scripts/capture-learnings-baseline.mjs`, is external to `pdlc/workflows/`, and states that under `--per-file` "a red there is not a red in this feature's module". The PLAN binds `npm run test:coverage` **exits 0** unconditionally in three places — T-10 oracle (i), the batch-4 gate row, and the §4.5 DoD line — so a per-file red on a file this feature never touches blocks a complete feature with no sanctioned response, inviting an ad-hoc relaxation of the gate command. Fix: scope the exit-0 conjunct to this feature's module (the `orchestrate-dev.js` per-file branch number the same line already requires), and note the external entry so an unrelated per-file red is diagnosable rather than surprising. | T-10 oracle (i); §2.2 batch-4 gate row; §4.5 `test:coverage` DoD line |
| F-03 | Medium | inherited | local | Carried from v3 F-01/F-02 and still uncorrected: §3.4's integration-points table says the coverage-floor placement is "the erratum this dispatch raises" and RK-2 says TSPEC §5.8 "asks for it as the last wave's `postWaveCommand`". TSPEC v1.3 already reassigned the floor to the last task, so the PLAN agrees with its upstream while describing itself as diverging from it; v1.4's §6.3 now records all four errata as landed and none re-emitted, making the self-description further from the truth. Rationale prose only — no gate, task, oracle, batch derivation or DoD checkbox reads it, and the implementation is unaffected in every particular. Fix: two sentences, restating both cells as agreement with TSPEC §5.8 as it now stands. | §3.4 integration-points "Coverage floor" row; §4.4 RK-2 mitigation cell |

FINDING: High | delta | local | §4.3 mutation table, T-07 duty cell, §4.5 DoD checkbox | TSPEC §5.5 grew from three to five mutations; the PLAN's four-mutation enumeration leaves mutation 5 (record write suppressed while `explicitPointer` is true, killed only by AT-05's write-side conjunct) with no owner, no observation duty and no DoD coverage.
FINDING: Medium | delta | local | T-10 oracle (i), §2.2 batch-4 gate, §4.5 coverage DoD line | TSPEC §5.8's newly disclosed fourth, external `c8.include` entry can red `--per-file` outside this feature's module, but the PLAN binds `npm run test:coverage` exits 0 unconditionally.
FINDING: Medium | inherited | local | §3.4 "Coverage floor" row; §4.4 RK-2 mitigation | The PLAN still describes its coverage-floor placement as diverging from TSPEC §5.8 and as raising an erratum, though TSPEC landed that reassignment in v1.3 and v1.4 records all errata as closed; rationale prose only, per DEC-ERR-01.

## Questions

None. The delta is unambiguous and every claim I needed is stated in TSPEC v1.4's own text.

## Positive Observations

- The `numRuns: 500` pin closes in the PLAN's favour: TSPEC, PLAN T-08 and PROPERTIES now state one
  figure, so the DoD line "the four laws P-1 … P-4 pass at `numRuns: 500`" is a transcription
  rather than a PLAN-local invention.
- AT-05's new write-side conjunct reaches the implementer without a PLAN edit, because T-07 owns
  TSPEC §5.4 *by section* rather than by transcribed conjunct list. That is the compression style
  that survived this delta intact — and the contrast with §4.3's transcribed enumeration, which did
  not, is the useful lesson.
- Task decomposition, the batch DAG, file ownership and the AT→task map re-derive unchanged; the
  erratum touched no structural commitment the PLAN makes.

## Recommendation

**Needs revision** — one High finding (F-01). The revision is small and surgical: one new mutation
row, one range change, two count words, plus F-02's scoping clause and F-03's two sentences. No
decision is reopened and no task, batch or ownership boundary moves.

## Verdict

_(placeholder)_
