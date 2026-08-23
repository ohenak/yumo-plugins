# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (Version 1.1, bytes unchanged since approval)
**Date:** 2026-08-23
**Iteration:** 4 (upstream-cascade confirmation, not a re-review)
**Scope:** Product lens only — does PLAN still hold as approved against TSPEC as it now stands?

## Overview

This is a cascade confirmation, not a review round. My v3 approval of PLAN v1.1 was recorded with
`REVIEWED-COMMIT: 485d62fa` and `APPROVAL-HASH: sha256:5f5b50db…`. PLAN's bytes today hash
`sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85` — identical. Nothing in
the document itself moved. What moved is TSPEC: my v3 approval carried
`UPSTREAM-STATE: TSPEC sha256:5ed76227…`, and TSPEC at HEAD is `sha256:4b5f7f5b…`. REQ, FSPEC and
DECISIONS re-hash to exactly the three anchors v3 recorded, so TSPEC is the only upstream that
cascaded.

The single question: is PLAN still a faithful compression of TSPEC as TSPEC now reads?

**The answer this round is different from last round's.** TSPEC's round-5 erratum is larger than
round 4's: 68 insertions / 37 deletions across eight locations, and — unlike round 4, which only
re-worded an obligation PLAN already discharged — **two of those locations add obligations that did
not exist when I approved PLAN**. §5.4 AT-05 gains a write-side conjunct, and §5.5 grows from four
mutations to **five**, the fifth existing precisely to give that conjunct teeth. PLAN's §4.3 is a
transcription of TSPEC §5.5 as a *closed set of four*, with an owning task per row, an execution
step in T-07, a risk-register commitment in RK-1 and a DoD checkbox in §4.5. The fifth mutation
lands in none of them.

That is not a stale citation of the kind v3 filed as Low. It is a unit of work that upstream now
requires and this PLAN does not schedule — and PLAN is the document whose entire job is to leave no
upstream obligation without an owner. It is a High finding, tagged `delta`, and it is why this
confirmation does not approve.

The rest of the edit is clean, and much of it is clean because PLAN was already *ahead* of it:
§5.7's newly pinned `numRuns: 500` is the figure PLAN T-08 has pinned since v1.1, and §5.8's
four-entry `c8.include` correction lands in a place PLAN never enumerated. Detail below.

## Batches

The TSPEC edit touches eight locations. For each, the PLAN material that leans on it and the
verdict for that pairing. Read against TSPEC at HEAD, not against memory of TSPEC at approval time.

| TSPEC location at HEAD | What changed | PLAN material leaning on it | Still faithful? |
|---|---|---|---|
| Metadata `Version` | `1.3` → `1.4` | PLAN pins no TSPEC version number anywhere | Yes — nothing to restate |
| Revision history, row `1.4` | New row recording the round-5 erratum; scope explicitly unchanged, no decision re-litigated | PLAN §1.1's delta enumeration D-1…D-11 | Yes — the row adds no delta; D-1…D-11 untouched |
| §5.7 generative depth | Run count **pinned at `numRuns: 500`** instead of fast-check's default, on the `advisoryHelperProperties.test.js` precedent, "matching PLAN T-08 and PROPERTIES" | T-08's oracle: `fc.assert(fc.property(…), { numRuns: 500 })`, same precedent, same `const runs = { numRuns: 500 }` citation, all four laws P-1…P-4 pinned | Yes — PLAN was already there; TSPEC moved **toward** PLAN. §4.5's `numRuns: 500` DoD line also matches |
| §5.8 coverage config | `c8.include` carries **four** entries not three; `**/scripts/capture-learnings-baseline.mjs` external, hence `allow-external`; `--per-file` keeps a red there off this feature's module | T-10 (§2.1), §3.4's `Coverage floor` row, §4.2's batch-4 gate, §4.5's DoD line, §2.1's pre-flight row in T-01 | Yes — PLAN cites the *command* (`npm run test:coverage` from `pdlc/workflows`, `--per-file --branches 85`) and the manifest keys (`test:coverage`, `c8`, `fast-check`), and **never enumerates the include array**. Nothing to correct; the obligation PLAN discharges (whole-file floor + per-file number for `orchestrate-dev.js`) is unchanged |
| §3.1 and §6.1 DEC-WVR-06 | Interpolated-value count `four` → **five** (the `feature-mismatch` renderer interpolates both the recorded feature and this run's) | §4.5.1's coverage map ("seven renderer closures"), T-02's `ReasonContext` transcription | Yes — PLAN cites the *seven codes* and the *seven renderer closures*, never the interpolated-value count. `grep -n "interpolat" PLAN` returns nothing |
| §2.5 / §6.3 items 1–4 | §2.5 restated as **ratification of FSPEC §3.4** (which now carries the clause) rather than "routed upstream"; §6.3's four items recorded as **landed** in REQ v1.7 / FSPEC v1.2, no `ERRATUM:` re-emitted; §6.2 OB-F1's re-raise struck | §4.5's `(REQ C-3, TSPEC §3.4/§3.5)` DoD row; §2.1 T-03's `M-WVR-1`/`M-WVR-2` promotion row (OB-F4, blocked on OB-F1); §4.4's RK-3 | Yes — PLAN never asserted these were open or routed. OB-F1's substance (BL-04 unmet, AT-14 red, wave sequencing precondition) is explicitly unchanged upstream, and that is the only part T-03 and RK-3 depend on |
| §5.2 H-1 | Restated as a **reuse-and-consistency choice**, not a harness expressiveness limit | §2.2's `[Fake first]` paragraph ("the two harness *extensions* H-1 and H-2 are the only double-shaped work, and they are additive, default-off"); T-07's H-1 description; §4.1's AT-04 row | Yes — PLAN's framing is already additive/reuse-shaped and never claimed the harness *could not* express it. The restatement removes a claim PLAN never made |
| §2.4 exclusion column | Names the **first** conjunct (the resume decision emits it) as the discriminating one; second conjunct explicitly does not discriminate | T-07's green half: five announcing rows, IG-6 silent, the `is not a valid value` notice untouched as "the one excluded notice, named in §2.4" | Yes — the row set, the count of announcing rows and the exclusion itself are unchanged; only the *reason* for the exclusion is now stated. TSPEC says so in the same breath ("the notice gains no suffix, no assertion pinning changes") |
| **§5.4 AT-05 + §5.5** | AT-05 gains a **write-side conjunct** (`ledgerWrites` non-empty; written `lastGreenWave` plan-absolute, not run-relative); §5.5 becomes "**Five** mutations", the fifth being a suppressed write while `explicitPointer` is true, "Killed only by AT-05's write-side conjunct" | AT-05 → T-07 (§4.1, §2.1); §4.3's four-row mutation table; T-07's "Mutation duty (§4.3 rows 1–4)"; RK-1's "§4.3's four mutations *executed*"; §4.5's DoD checkbox; §1.1's "§4.3's four mutations gain owning tasks" | **Split.** AT-05's conjunct: yes — PLAN cites AT-05 *by id* and delegates its oracle text to TSPEC §5.4, so the conjunct is carried by reference without a PLAN edit. §5.5's fifth mutation: **no** — see F-01 |

**Why the AT-05 half passes and the §5.5 half does not.** PLAN's task table names ATs by id and
leaves their oracle text upstream — that is a deliberate compression, and it is why an AT gaining a
conjunct does not force a PLAN edit. PLAN's §4.3 does the opposite: it **transcribes** TSPEC §5.5's
mutations into a table of its own, one row per mutation, each row naming the oracle that must red
and the task that must apply and observe it. That transcription is a set-equality claim against
upstream. Upstream now has five members; PLAN's table has four. A by-reference citation survives an
upstream addition; a transcription does not.

## Dependencies

PLAN cites TSPEC in nineteen places. Every one was re-read against TSPEC at HEAD. Grouped by
whether this round's edit reaches them.

| PLAN citation | TSPEC location at HEAD | Reached by the edit? |
|---|---|---|
| §1.1 "TSPEC §1.2 scopes the feature at eleven delta rows (D-1…D-11)" | §1.2, D-1…D-11 | No — the round-5 row adds no delta |
| §1.2 "REQ BL-04 / FSPEC OB-F1 / TSPEC §6.2" | §6.2 OB-F1 | Touched (re-raise struck), but OB-F1's substance unchanged — no PLAN consequence |
| §1.2 "TSPEC §5.4 AT-14, §6.2 OB-F1" | §5.4 AT-14 | No — AT-14 unchanged |
| §1.3 "(TSPEC RT-2)", "(TSPEC §1.3)" | §1.3, RT-2 | §1.3 repointed at REQ OB-1's current framing; PLAN leans only on the worktree conclusion, which upstream says still holds |
| §2.1 T-01 pre-flight: `test:coverage`, `c8`, `fast-check` in `package.json` | §5.8 | Touched, but the *manifest keys* PLAN asserts are unchanged — the correction is inside `c8.include`, which PLAN does not enumerate |
| §2.1 T-02, `RESUME_OUTCOMES` / `WAVE_IGNORE_REASONS` (seven codes) / `IMPLEMENTATION_DEFAULTS` (four keys) set-equality | §3.2, §3.1 | No — the code set stays seven, the key set stays four; only the interpolated-value count moved, which PLAN does not cite |
| §2.1 T-04 "AT-16 asserts exactly what DEC-WVR-07 scopes" | DECISIONS unchanged (`sha256:37b3684d…`), §5.4 AT-16 | No |
| §2.1 T-07 (b) "the **three** whole-string assertion updates TSPEC §2.4 enumerates" | §2.4 | Touched (exclusion column), but TSPEC states in the same edit that "no assertion pinning changes" — count still three |
| §2.1 T-07 green half, "five announcing rows of TSPEC §2.4" | §2.4 row set | No — six rows, five announcing, IG-6 silent, unchanged |
| §2.1 T-07 "**Mutation duty (§4.3 rows 1–4)**" | §5.5 | **Yes — F-01** |
| §2.1 T-08 "P-1…P-4, TSPEC §5.7 laws", `numRuns: 500` | §5.7 | **Yes, and PLAN already matches** — TSPEC moved to PLAN's figure |
| §2.1 T-10 "(RT-7, TSPEC §5.8)" | §5.8, §6.4 RT-7 | Touched; T-10's two oracles and its obligation are unchanged and still exactly what §5.8 assigns to the last implementation task |
| §2.2 `[Fake first]`, "harness extensions H-1 and H-2 … additive, default-off" | §5.2 | Touched (H-1 rationale restated); PLAN's framing already agrees |
| §3.1/§3.2 "TSPEC §5.3 design obligation", "the four new files TSPEC §5.3 names" | §5.3 | No |
| §3.4 `implementation.postWaveCommand` / RT-5 | §6.4 RT-5, V-13 | No |
| §3.4 `Coverage floor` row | §5.8 | Touched — **F-02** (inherited, unlanded from v3) |
| §4.2 batch-4 gate; §4.2 "TSPEC §5.5 records `toContainEqual` passes" | §5.5 | Touched; the `toContainEqual` observation (mutation 4) is unchanged. The batch-4 gate's own text is unaffected — the gap is in §4.3's table, not here |
| §4.3 mutation table (four rows) | §5.5 (five mutations) | **Yes — F-01** |
| §4.4 RK-1 "§4.3's four mutations executed"; RK-2; RK-3 "(TSPEC RT-1)"; RK-4 "(TSPEC RT-3's residual)" | §5.5; §5.8/RT-7; RT-1; RT-3 | RK-1 **yes — F-01**; RK-2 touched — **F-03** (inherited, unlanded from v3); RT-1/RT-3 unchanged |
| §4.5 DoD ("each of §4.3's four mutations"), delta map D-1…D-11, "(REQ C-3, TSPEC §3.4/§3.5)" | §5.5; §1.2; §3.4/§3.5 | DoD checkbox **yes — F-01**; the rest unchanged |
| §4.5.1 "`classifyWaveLedger` (TSPEC §3.2), 8 arms", seven renderer closures | §3.2, §3.1 | No — arm and renderer counts unchanged |

**REQ, FSPEC and DECISIONS are byte-identical to what I approved against.** All three re-hash to the
`UPSTREAM-STATE:` anchors recorded in v3: `REQ sha256:17e83bfc…`, `FSPEC sha256:9a6be7b5…`,
`DECISIONS sha256:37b3684d…`. The product-lens traceability I checked in v2 — REQ-WVR-01…-10 and
FSPEC-WVR-01…-07 each reaching an owning task — is therefore untouched, and no acceptance criterion
has been narrowed, broadened or re-triggered by this round. The one gap is a *technical-depth*
obligation upstream added and PLAN has not scheduled.

**On the two inherited findings.** v3's F-01 and F-02 asked for one-line corrections to §3.4's
`Coverage floor` row and §4.4's RK-2, both of which still describe a divergence from TSPEC that the
round-4 erratum already closed. PLAN's bytes have not changed since, so both are still open and both
are re-filed here as `inherited` — they were stale in the pre-round bytes and this round's edit did
not touch them. Their tags keep them non-gating; they should be landed in the same edit that closes
F-01.

## Verification

Every claim in this confirmation is a command I ran, not an impression.

| Claim | Verification | Result |
|---|---|---|
| PLAN's bytes are unchanged since approval | `shasum -a 256 …/PLAN-pdlc-wave-resume.md` vs. v3's `APPROVAL-HASH` | `5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85` — identical |
| TSPEC is the only upstream that moved | `shasum -a 256` on REQ / FSPEC / DECISIONS vs. v3's `UPSTREAM-STATE:` lines | `17e83bfc…` / `9a6be7b5…` / `37b3684d…` — all three exact |
| TSPEC at HEAD is the version this dispatch names | `shasum -a 256 …/TSPEC-pdlc-wave-resume.md` | `4b5f7f5b2097a344e1e8fafffaa1d7e12f0fd5f583e302f5bf798d22c13c48f5` — exact match to the dispatch |
| The edit's size and reach | `git diff 485d62fa HEAD -- …/TSPEC-…md` | `68 insertions(+), 37 deletions(-)`; eight locations, enumerated in §Batches |
| TSPEC §5.5 now enumerates **five** mutations | `grep -n "mutations" …/TSPEC-…md` | line 790: "**Five** mutations this suite is specifically designed to kill" |
| The fifth mutation is killed only by AT-05's new conjunct | TSPEC §5.5 item 5, read in full | "Suppressing the record write while `explicitPointer` is true … **Killed only by AT-05's write-side conjunct.** Without it the mutation leaves AT-05, AT-07, AT-15 and AT-18 green" |
| PLAN carries **four** mutations, in five places | `grep -n "mutation" …/PLAN-…md` | §1.1 "§4.3's four mutations gain owning tasks"; §4.3 heading "**Mutation resistance — four mutations**"; §4.3 table = 4 rows; T-07 "Mutation duty (§4.3 rows **1–4**)"; RK-1 "§4.3's four mutations *executed*"; §4.5 "Each of §4.3's four mutations applied, observed RED …" |
| No PLAN row owns the fifth mutation | §4.3 table read row by row | Rows: ancestry guard / write outside transport branch / run-relative wave number / eager ancestry probe. **No suppressed-write row** |
| PLAN T-08 already pins the run count TSPEC now specifies | `grep -n "numRuns" …/PLAN-…md` | T-08: `fc.assert(fc.property(…), { numRuns: 500 })`, same `advisoryHelperProperties.test.js` precedent, all four laws — and §4.5's DoD line "at `numRuns: 500`" |
| PLAN does not enumerate `c8.include` | `grep -n "c8\|include\|allow-external" …/PLAN-…md` | Only the *command* and the *manifest keys*; no entry list, no count, no `allow-external` |
| PLAN does not cite the interpolated-value count | `grep -n "interpolat" …/PLAN-…md` | No match |
| PLAN's H-1 framing does not contradict §5.2's restatement | `grep -n "H-1" …/PLAN-…md` | §2.2 "additive, default-off"; T-07 same; §4.1 AT-04 row — no expressiveness-limit claim anywhere |
| v3's two findings are still open | §3.4 `Coverage floor` row and §4.4 RK-2 read at HEAD | Both still say "the erratum this dispatch raises" / "the last wave's `postWaveCommand`" / "the difference from TSPEC's wording is raised as an erratum" |
| AT-05 is owned and its oracle delegated upstream | `grep -n "AT-05" …/PLAN-…md` | §4.1 "AT-05 operator override wins | T-07 | `waveExecution.test.js`"; T-07 lists AT-05 among integration cases by id only |

**What the checks decide.** Seven of the eight edited TSPEC locations leave PLAN faithful, two of
them because PLAN was already correct and upstream moved toward it. The eighth splits: AT-05's new
conjunct is carried by PLAN's by-id citation, but §5.5's fifth mutation has **no owning task, no
execution step, and no DoD checkbox** in a PLAN whose §4.3 exists specifically to guarantee that
every mutation upstream names is applied, observed RED against a named oracle, reverted and
recorded. A mutation absent from that table is a mutation nobody runs.

**Why that is High and not Medium.** Severity tracks user impact. The mutation TSPEC added is the
one that suppresses the ledger write on operator-pointed runs — and TSPEC says in the same sentence
that without it the suppression "stays green here and everywhere else", removing resume from the
very recovery path §2.5 ratifies the write for. That is this feature's core promise: an operator who
resumes at a wave still gets a record written, so the *next* resume works. PLAN would ship the
AT-05 assertion (it is carried by reference) but would never prove the assertion has teeth, because
the mechanism PLAN built for exactly that proof does not know the mutation exists. This is a
work-breakdown gap, not a description defect — which is the line v3's two Low findings sat on the
other side of, and I am holding that line rather than moving it.

**Why `delta` and not `inherited`.** PLAN's four-row table was a complete and accurate transcription
of TSPEC §5.5 at `485d62fa`; my v3 approval of it was correct on the bytes then in front of me. This
round's edit added the fifth member and thereby made the transcription incomplete. The incompleteness
was introduced by this erratum landing, not carried in before it. `inherited` would be the more
comfortable tag — it routes back to R2 instead of halting — but it would be false, and the tag is
the gate's input, not a comment.

**Why `local`.** PLAN's own bytes did not change, so locality is measured against the material the
upstream edit bears on: TSPEC §5.4 AT-05 and §5.5. PLAN's footprint for those is §4.3's table,
T-07's mutation duty, RK-1, §4.5's DoD checkbox and §1.1's count sentence — and the finding sits
inside that footprint. Nothing outside it is disturbed: the task table, `Deps` cells, §3.3's
ownership manifest, §4.1's AT map and §4.5.1's coverage map are all unreached.

**What must change to close F-01.** Add a fifth row to §4.3 (mutation: suppress the record write
while `explicitPointer` is true; oracle that must red: AT-05's write-side conjunct; applied and
observed by: T-07), and update the four count claims that follow from it — §4.3's heading, T-07's
"rows 1–4", RK-1 and §4.5's DoD checkbox. No task is added, no batch moves, no dependency edge
changes: T-07 already owns AT-05 and already carries the mutation-duty step. It is a small edit —
but it is an edit to the plan, which is why this is a revision and not a confirmation.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | TSPEC §5.5 at HEAD enumerates **five** mutations; PLAN §4.3 transcribes a closed set of **four**. The fifth — suppressing the record write while `explicitPointer` is true, which TSPEC says is "Killed only by AT-05's write-side conjunct" and whose escape removes resume from the recovery path §2.5 ratifies the write for — has no row in §4.3, no oracle pairing, no owning task, no execution step in T-07's "Mutation duty (§4.3 rows 1–4)", no RK-1 commitment and no §4.5 DoD checkbox. AT-05's new conjunct itself is fine (PLAN cites AT-05 by id and delegates the oracle text upstream), so the assertion would be written — but nothing in PLAN makes anyone prove it has teeth. Fix: add the fifth row to §4.3 (oracle: AT-05's write-side conjunct; applied and observed by: T-07) and update the four count claims — §4.3's heading, T-07's "rows 1–4", RK-1, §4.5's checkbox. No new task, no batch move, no `Deps` change. | §4.3 Mutation resistance; T-07 mutation duty (§2.1); RK-1 (§4.4); §4.5 DoD |
| F-02 | Low | inherited | local | §3.4's `Coverage floor` row still cites "the erratum this dispatch raises" and quotes upstream as asking for "the last implementation wave's `postWaveCommand`". TSPEC §5.8 has assigned the floor to the last implementation **task** (PLAN T-10, RK-2) since v1.3; the quoted divergence no longer exists. Raised as v3 F-01, not yet landed. Fix: keep the row's value (`T-10`, not `postWaveCommand`) and the V-13 four-key reasoning verbatim, replace the erratum citation with TSPEC §5.8 / RT-7 at v1.4, and state the assignment as agreed rather than raised. | §3.4 Configuration points — `Coverage floor` row |
| F-03 | Low | inherited | local | §4.4's RK-2 still reads "TSPEC §5.8 asks for it as the last wave's `postWaveCommand`" and closes with "the difference from TSPEC's wording is raised as an erratum". False against TSPEC v1.4, which assigns the floor to the last implementation task and cites PLAN T-10 / RK-2 by id. Raised as v3 F-02, not yet landed. Fix: keep the merge-gate risk (TSPEC RT-7) and the mitigation text unchanged; record that §5.8 now assigns the floor to T-10 rather than describing an open disagreement. | §4.4 Risk register — RK-2 |

**On the relationship between the three.** F-02 and F-03 are the same one-line corrections v3 filed
and the author has not yet landed; they are non-gating and stay that way. F-01 is what makes this
round different: it is not a description of upstream that has gone stale, it is a unit of work
upstream now requires that this plan does not schedule. All three should land in one edit.

FINDING: High | delta | local | §4.3 Mutation resistance / T-07 mutation duty / RK-1 / §4.5 DoD checkbox | TSPEC §5.5 at HEAD enumerates five mutations, PLAN §4.3 transcribes four — the fifth (suppress the record write while `explicitPointer` is true, killed only by AT-05's new write-side conjunct) has no owning task, no oracle pairing, no execution step and no DoD checkbox, so the mutation upstream added to protect the resume recovery path is one nobody runs; add the fifth §4.3 row owned by T-07 and update the four "four mutations" count claims
FINDING: Low | inherited | local | §3.4 Configuration points — `Coverage floor` row | Row cites "the erratum this dispatch raises" and quotes upstream as asking for the last implementation wave's `postWaveCommand`; TSPEC §5.8 has assigned the floor to the last implementation task (PLAN T-10, RK-2) since v1.3, so the quoted divergence no longer exists — re-point the row at TSPEC §5.8 / RT-7 at v1.4, keeping the T-10 assignment and V-13 reasoning unchanged (v3 F-01, unlanded)
FINDING: Low | inherited | local | §4.4 Risk register — RK-2 | RK-2 states "TSPEC §5.8 asks for it as the last wave's `postWaveCommand`" and that "the difference from TSPEC's wording is raised as an erratum"; both are false against TSPEC v1.4, which assigns the floor to the last implementation task and cites PLAN T-10 / RK-2 by id — record the agreement, leaving the merge-gate risk (TSPEC RT-7) and mitigation text unchanged (v3 F-02, unlanded)

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 2}
