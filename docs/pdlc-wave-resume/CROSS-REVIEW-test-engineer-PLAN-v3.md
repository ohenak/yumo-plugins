# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`
**Date:** 2026-08-21
**Iteration:** 3
**Round type:** Upstream-cascade confirmation (PLAN bytes unchanged; upstream TSPEC edited after approval)

## Overview

**The one question.** PLAN was approved at round v2 (`CROSS-REVIEW-test-engineer-PLAN-v2.md`,
`Approved with minor changes`, anchors recorded at `88677711`). Its own bytes have not moved since:
the PLAN blob at that approval commit and at HEAD are both `4df3434e`. What moved is TSPEC, which
took a round-4 erratum edit. So the question is narrow and singular — **is PLAN still a faithful
compression of TSPEC as TSPEC now stands?** Not "is PLAN good", which round v2 already answered, and
not "did the routed items land", which is necessary but not sufficient (DEC-ERR-03).

**What the upstream edit did.** Three commits (`91f93b8e`, `6ac1df9f`, `5d5bbd75`), +9/−4 lines,
touching exactly three places in TSPEC: the version cell (1.2 → 1.3), a new revision-history row,
§5.8's coverage-floor assignment, and the RT-7 mitigation cell of §6.4. The substance in one
sentence: the 85% per-file branch floor is **re-assigned from "the last implementation wave's
`postWaveCommand`" to "the last implementation task (PLAN T-10, RK-2)"**, on the reasoning that
V-13 closes the config surface at four keys with a single *global* `postWaveCommand`, so a
per-wave-scoped setting is not expressible and a global one would run `test:coverage` after every
wave. Threshold, backstop and the floor itself are unchanged.

**The shape of the answer.** This erratum moved TSPEC *toward* PLAN, not away from it. PLAN had
already refused the `postWaveCommand` framing, assigned the floor to T-10, and raised the divergence
as an erratum in RK-2 and §3.4 — the erratum this very round landed. So every **obligation** PLAN
carries is now exactly what TSPEC asks for; the mechanism, the runner, the threshold and the
reporting requirement all agree. Nothing in the task table, the batch DAG, the ownership manifest,
the AT mapping, the oracle rules or the DoD is disturbed.

What *is* disturbed is narrower and entirely descriptive: PLAN's §3.4 and RK-2 still describe TSPEC
as asking for the `postWaveCommand` framing and still describe the erratum as one *this dispatch
raises*. Both sentences were true when written and are false against TSPEC v1.3. They are
rationale prose in a hand-off position, not gate text, and correcting them changes no test, no
oracle and no batch — so they are recorded at Medium, not High, per the demotion bar in
`docs/_decisions/DECISIONS-review-severity-bars.md` (DEC-ERR-01: a false statement about upstream
confined to a hand-off/rationale section is demoted, not gating).

**Scope of this round.** Delta-confirmation only. I re-read my own v2 cross-review, the full diff of
the upstream edit, TSPEC §5.8 and §6.4 at HEAD, and every PLAN section that leans on them (§3.4,
§4.4/RK-2, T-10's task row, §4.5/§4.5.1's DoD checkboxes). I did not re-litigate the three v2
findings F-11/F-12/F-13, which were non-gating Mediums and Lows left to the author's judgement, and
I did not re-derive conclusions that rest only on PLAN bytes that have not changed.

## Batches

The cascade question, asked task by task. PLAN's batch structure is untouched by this edit — I am
checking whether any **task's stated obligation** now diverges from what upstream asks for.

| Task | Batch | Does TSPEC v1.3 change what this task owes? | Verdict |
|---|---|---|---|
| T-01 | 1 | Pre-flight gate: baseline exports, tracked baseline doc, `package.json` carrying `test:coverage`/`c8`/`fast-check`, and the `implementation.testCommand` string-equality arm. TSPEC §5.8 v1.3 still presumes `npm run test:coverage` exists in `pdlc/workflows` — T-01's existence check is the thing that proves it before T-10 relies on it. Strengthened, not disturbed. | Holds |
| T-02 | 2 | `classifyWaveLedger` extraction. Untouched by the edit. | Holds |
| T-03 | 2 | `.gitignore` / `WAVE_STATE_PATH` / baseline-mechanism arms. Untouched. | Holds |
| T-04 | 2 | Untouched. | Holds |
| T-07 | 3 | Harness extensions, assertion updates, integration cases, announcement suffixes, report-row branch, four mutation runs. TSPEC's edit does not touch §2.4, §5.3 or §5.7. Untouched. | Holds |
| T-08 | 3 | Generative suite, `numRuns: 500`. RT-7's backstop sentence still names "the generative suite of §5.7" as the degradation path — unchanged in substance, and T-08 is what makes that backstop real. | Holds |
| T-10 | 4 | **The task the erratum lands on.** TSPEC v1.3 now asks that the floor be closed by "the last implementation task (PLAN T-10, RK-2), which runs it explicitly and reports the measured per-file branch number". T-10's row already says exactly that: run `npm run test:coverage` from `pdlc/workflows` (`--per-file --branches 85`), oracle (i) "exits 0, with the measured per-file branch number for `orchestrate-dev.js` reported". Word for word what upstream now asks. | Holds — and is now *ratified* rather than divergent |

**T-10 is the interesting row and it gets stronger, not weaker.** Before this edit, T-10's design was
a deliberate departure from TSPEC, defended in RK-2 and flagged as an erratum. After it, T-10's
design *is* the TSPEC. That is the best possible outcome for a cascade confirmation: the downstream
document did not need to move because upstream moved to meet it.

Two things I checked specifically, because "the item landed" is not the same as "the compression is
faithful":

1. **Does TSPEC now demand anything of T-10 that T-10 does not carry?** The new §5.8 adds one
   reporting obligation beyond the exit code — "reports the measured per-file branch number". T-10's
   oracle (i) carries it verbatim, and §4.5's DoD checkbox at line 412 repeats the `exits 0`
   conjunct. The per-file *number* is reported by T-10's own oracle text rather than being a
   separate DoD checkbox, which is sufficient: the DoD's line 412 checkbox and T-10's oracle are
   both binding, and neither is absence-shaped.
2. **Does TSPEC now forbid something PLAN still does?** §5.8 v1.3 says the floor is "deliberately
   **not** `implementation.postWaveCommand`". PLAN §3.4 sets `implementation.postWaveCommand` to
   `node pdlc/workflows/build-runtime.mjs` — a *different* purpose (RT-5, stale `dist/`), not the
   coverage floor. No conflict: the key is used, but not for the floor, which is precisely the
   distinction TSPEC v1.3 draws. PLAN's §3.4 already carries a separate `Coverage floor` row saying
   `**T-10**, not postWaveCommand`, so the two uses are held apart explicitly.

**Batch-DAG re-derivation is not re-run this round, by design.** The batch column is a pure function
of PLAN's declared dependency edges, and PLAN's bytes are byte-identical to the blob I parsed and
approved at v2 (`4df3434e` at both `88677711` and HEAD). A mechanical check whose inputs have not
changed cannot produce a different answer; re-running it would be theatre. The v2 result stands:
seven tasks, batches `1, 2, 2, 2, 3, 3, 4`, no desync, no cycle, no same-batch same-new-file
collision.

## Dependencies

This section is the DEC-ERR-03 sweep: **every upstream claim PLAN leans on, re-read at the upstream's
current version**, not just the routed items. PLAN's upstream surface is four documents, all of which
I hashed at HEAD and matched against the hashes in this dispatch — REQ `17e83bfc…`, FSPEC
`9a6be7b5…`, TSPEC `5ed76227…`, DECISIONS `37b3684d…`. All four match exactly, so the text I read is
the text the orchestrator pinned.

### Citation resolution (mechanical)

Every spec id PLAN cites resolves to a definition in the document that owns it:

| Id family | PLAN cites | Owner defines | Unresolved |
|---|---|---|---|
| `AT-01…AT-18` | all 18 | FSPEC defines `AT-01…AT-18` | none |
| `BR-04` | 1 | FSPEC defines `BR-01…BR-17` | none |
| `D-1…D-11` | all 11 | TSPEC defines `D-1…D-11` | none |
| `V-13` | 1 | TSPEC defines `V-1…V-19` | none |
| `RT-1, RT-2, RT-3, RT-5, RT-7` | 5 | TSPEC defines `RT-1…RT-7` | none |
| `DEC-WVR-04, -07, -08` | 3 | DECISIONS defines `DEC-WVR-01…08` | none |

No nonexistent-authority citation, which is the failure mode the REQ/FSPEC verification checks call
out as having shipped three times. This is unchanged from v2 but cheap to re-confirm, and the TSPEC
edit did add a version bump that could in principle have renumbered something — it did not.

### The claims that actually moved

The edit rewrote two passages of TSPEC. PLAN references both. Re-read side by side:

| TSPEC at HEAD (v1.3) | What PLAN says about it | Faithful? |
|---|---|---|
| §5.8: the floor is closed by "the **last implementation task** (PLAN T-10, RK-2), which runs it explicitly and reports the measured per-file branch number… deliberately **not** `implementation.postWaveCommand`" | **T-10's row** (§2.1): run `npm run test:coverage` from `pdlc/workflows`, oracle (i) exits 0 with the measured per-file branch number reported | **Yes** — this is now an exact match |
| §5.8 / RT-7 rationale: V-13's four-key surface makes a per-wave-scoped setting inexpressible; a global one reds on waves whose new branches are not yet covered | **§3.4 `Coverage floor` row**: same reasoning, same V-13 citation, same "red on every wave" consequence | **Yes on the reasoning** — but framed as PLAN's argument *against* TSPEC rather than as agreement with it (see F-01) |
| §5.8: no longer says "the last implementation wave's `postWaveCommand`" anywhere | **RK-2**: "TSPEC §5.8 asks for it as the last wave's `postWaveCommand`" | **No** — PLAN attributes to §5.8 a sentence §5.8 no longer contains (F-02) |
| §6.4 RT-7 mitigation: now names T-10 and PLAN's mechanism as the mitigation, with the backstop conditioned on "if T-10's run proves too slow" | **T-10's row** cites `(RT-7, TSPEC §5.8)` as its provenance | **Yes** — RT-7 and T-10 now point at each other consistently |

### The mutual-citation loop, checked in both directions

TSPEC v1.3's §5.8 now cites **PLAN T-10, RK-2 and PLAN §3.4** as where the obligation lives. That
makes the two documents mutually referential, so a stale sentence on either side is worse than
usual: a reader arriving from TSPEC §5.8 is sent to PLAN RK-2, and PLAN RK-2 tells them TSPEC §5.8
asks for something TSPEC §5.8 explicitly disclaims. The loop closes on a contradiction. This is why
F-02 is filed at all rather than waved through as harmless staleness — it is not merely out of date,
it actively mis-instructs a reader following upstream's own pointer. It remains Medium because the
contradiction is confined to rationale prose: no task, oracle, threshold or gate reads these
sentences.

### Everything else PLAN leans on

I re-read PLAN's other upstream-dependent sections against HEAD and found no further drift: §1.1's
eleven D-rows still map to TSPEC §1.2's eleven delta rows; §4.1's AT set-equality against FSPEC's
`AT-01…AT-18` is unchanged (FSPEC bytes did not move); §3.4's `implementation.startWave` rationale
still cites FSPEC BR-04, which FSPEC still defines; the `DEC-WVR-04/07/08` citations in §4.3 and
§4.4 still resolve against a DECISIONS whose hash matches its own just-completed erratum round. The
`V-13` four-key claim that both PLAN §3.4 and TSPEC's new §5.8 rest on is asserted identically in
both, so the shared premise is consistent.

## Verification

Every claim in this confirmation that could be checked by running something, was. Commands and
results:

| Check | Command | Result |
|---|---|---|
| PLAN bytes really are unchanged since my approval | `git rev-parse 88677711:…/PLAN-….md` vs `git rev-parse HEAD:…/PLAN-….md` | both `4df3434e30472fb286b432dcad58754bfbc3ff34` — **byte-identical**, so the round-type premise holds and no PLAN-internal re-review is owed |
| The upstream I read is the upstream that was pinned | `shasum -a 256` over all four upstream docs | REQ `17e83bfc…`, FSPEC `9a6be7b5…`, TSPEC `5ed76227…`, DECISIONS `37b3684d…` — **all four match the dispatch exactly** |
| The full extent of the upstream edit | `git diff b4a628b8..HEAD -- …/TSPEC-….md` | one file, **+9/−4**, three hunks: version cell, revision-history row, §5.8 paragraph, §6.4 RT-7 cell. Nothing else in TSPEC moved |
| The edit's commits | `git log --oneline -- …/TSPEC-….md` | `91f93b8e` (reassign §5.8 floor to last task), `6ac1df9f` (align RT-7), `5d5bbd75` (v1.3 revision-history row) — a clean, corrections-only erratum round |
| Does `postWaveCommand` still appear in TSPEC as the floor's owner? | read §5.8 and §6.4 at HEAD | No. Both now say the opposite — "deliberately **not** `implementation.postWaveCommand`" |
| Does PLAN still attribute that framing to TSPEC? | `grep -n 'postWaveCommand\|coverage floor' PLAN` → lines 283, 286, 377 | **Yes at lines 286 and 377** — the two stale passages. Line 283 is the unrelated `build-runtime.mjs` use and is correct |
| Does T-10 carry the obligation TSPEC now assigns it? | read PLAN §2.1 T-10 row (line 121) and §2.2 gate row (line 133) | Yes: `npm run test:coverage` from `pdlc/workflows`, `--per-file --branches 85`, exits 0, per-file number for `orchestrate-dev.js` reported, paired with §4.5.1's delta oracle |
| Does the DoD bind it? | PLAN §4.5 line 412 | `- [ ] npm run test:coverage … exits 0 (--per-file --branches 85)` — present and positively shaped |
| Every cited spec id resolves | `grep -oE` id families in PLAN, diffed against each owner's definitions | 18/18 ATs, BR-04, 11/11 D-rows, V-13, five RT-rows, three DEC-WVR rows — **zero unresolved** |
| Working tree is clean before I write | `git status --porcelain docs/pdlc-wave-resume/` | empty |

### Oracle quality of the thing being confirmed

Because the erratum lands on a *coverage* obligation, the oracle-falsifiability lens applies directly
and I re-applied it to T-10 as it now stands against TSPEC v1.3:

- **Not absence-only.** T-10's oracle (i) asserts `exits 0` *and* requires the measured per-file
  branch number to be reported — a positive value, not a `!= failure` shape. Oracle (ii) is
  set-equality against §4.5.1's transcribed mapping table, which is the strongest form available
  here: a deleted test case fails set-equality rather than nudging a percentage by 0.05.
- **The gate command is the right one.** The floor is a *branch* floor and the command carries
  `--per-file --branches 85`, not statement mode, and it is invoked explicitly from `pdlc/workflows`
  rather than resting on source-list membership. This is exactly the distinction DC-09 warns about
  and PLAN gets it right — the claim cites the gate command, not "already inside source".
- **The delta oracle survives the reassignment.** §4.5.1's five branch classes (8 classifier arms,
  7 renderers, 1 lazy-probe short-circuit, 5 announcement suffixes, 3 report-row branches) are
  reached from unit and integration respectively, with the integration-only rows explicitly routed
  through `waveExecution.test.js`. The reassignment from a wave-level command to a task changes
  *who runs it*, not *what it proves*, so this structure is undisturbed.
- **Nothing became vacuous.** The one way this erratum could have false-greened the floor is if the
  floor had moved to a runner that never executes. T-10 is a real task in batch 4 with real `Deps`
  edges (`T-07, T-08, T-03, T-04`) and its own gate row in §2.2; it executes or the wave reds.

### What I deliberately did not re-check

The batch-DAG re-derivation, the `parsePlanTasks` round-trip, the harness-reuse occurrence counts and
the `origin/main` line-anchor facts were all verified at v2 against a PLAN blob that has not changed
and an `origin/main` this edit did not touch. Re-running them could not return a different answer.
The three v2 findings (F-11 Medium, F-12 Medium, F-13 Low) were non-gating and are out of scope for
a cascade confirmation; they are not re-raised here and their disposition remains the author's.

## Delta-Confirmation Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Verdict

_(pending)_
