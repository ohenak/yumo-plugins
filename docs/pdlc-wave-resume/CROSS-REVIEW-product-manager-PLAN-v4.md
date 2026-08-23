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

_(pending)_

## Verification

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
