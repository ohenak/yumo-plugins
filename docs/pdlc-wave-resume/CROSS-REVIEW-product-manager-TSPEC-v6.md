# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.3)
**Date:** 2026-08-21
**Iteration:** 6 (delta confirmation, erratum round 4 — Phase P)
**Scope:** Delta confirmation. Previously approved at v5; re-confirming the erratum edit against upstream REQ v1.7 / FSPEC v1.2 at HEAD (DEC-ERR-03).

## Scope

This is a **delta confirmation**, not a fresh review. I approved this TSPEC at round v5. One
targeted erratum edit has since landed (`91f93b8e`, `6ac1df9f`, `5d5bbd75`, diffed against the
last bytes I approved at `b4a628b8`), addressing two routed items that say the same thing from
two lenses:

| Routed item | Raised by | Landed? |
|---|---|---|
| §5.8 assigns the 85% per-file branch floor to "the last implementation wave's `postWaveCommand`", which is not expressible — V-13 closes the config surface at four keys with a single *global* `postWaveCommand`. Re-specify as a last-**task** obligation, as PLAN RK-2 does. | pm-review (me) | **Yes** |
| §5.8 / RT-7 make the same assignment; the floor belongs to a task, as PLAN RK-2 / §3.4 assign it. | te-review | **Yes** |

The edit is nine insertions over four lines and touches exactly three places: the version cell
(1.2 → 1.3), a new revision-history row, the §5.8 sentence, and the RT-7 mitigation cell in §6.4.
Nothing else in the 944-line document moved (`git diff b4a628b8..HEAD --stat` → `9 +, 4 -`).

**Beyond the item list (DEC-ERR-03).** The items landing is necessary, not sufficient. I re-read
the upstream this TSPEC leans on at the versions named in this dispatch and confirmed both
hashes match the tree byte-for-byte:

- REQ v1.7 — `sha256:17e83bfc…8c79f` ✓ matches dispatch
- FSPEC v1.2 — `sha256:9a6be7b5…56f` ✓ matches dispatch

Both upstream documents have themselves taken erratum edits since this TSPEC's §6 was written
(`05901a9c`, `2290c121`, `8b818309`). Three of the TSPEC's own upstream-facing claims no longer
match what upstream says. Those are the findings below — all **inherited**, all **non-gating**.

## Design

**The re-assignment is correct and it is the assignment PLAN already carries.** The product
question I have to answer is not "is a task better than a config key" — that is an engineering
call — but "does the floor still bind, at the same threshold, at a point where the product is
protected?" It does, and more tightly than before:

| Property | v1.2 (as I approved it) | v1.3 (after the erratum) |
|---|---|---|
| Threshold | 85% per-file branch | 85% per-file branch — **unchanged** |
| Where it binds | "last implementation wave's `postWaveCommand`" | last implementation **task**, PLAN T-10 |
| Phase it closes in | Phase I | Phase I — **unchanged** |
| Backstop if too slow | §5.3 per-arm unit coverage + §5.7 generative suite; degrades to a PUB-time finding | identical wording, now conditioned on "T-10's run" |
| RT-7 risk statement | unchanged | unchanged |

The risk RT-7 exists to retire — "new branches green through Phase I, red at Phase PUB, after
Phase DOD" — is retired by the new wording exactly as it was by the old, because the closing
point is the same: inside Phase I, before DOD. No acceptance criterion moved, no threshold was
softened, and the backstop clause survives verbatim. This is a **fidelity correction, not a
scope change**, and the revision-history row says so in those words ("The floor itself, its
threshold and its backstop are unchanged").

**It now agrees with the downstream document that owns the obligation.** PLAN `§3.4` carries the
row `| Coverage floor | **T-10**, not `postWaveCommand` |`, and PLAN RK-2 records the same
reasoning and flags the divergence as the erratum this round is discharging. Before this edit,
TSPEC §5.8 and PLAN §3.4 disagreed about who owns the floor; a downstream implementer reading
both would have had to pick one. They now say the same thing, and TSPEC names T-10 and RK-2
explicitly so the trace is followable in one hop. That is the outcome I asked for.

**No product decision was taken in an engineering artifact.** The edit reassigns a mechanism, not
a requirement. Neither REQ v1.7 nor FSPEC v1.2 mentions coverage at all (`grep -c 'coverage'`
over both → 0), so the floor was never an upstream acceptance criterion this TSPEC could narrow
or drop — it is a project test-depth standard the TSPEC volunteers and PLAN executes. Nothing in
the delta touches a `REQ-WVR-*` outcome, a `BR-*`, an `EC-*`, or an `AT-*`.

## Interfaces

The delta's central factual claim is an interface claim, so I re-measured it rather than
accepting it:

| Claim in the delta | Where it is made | Verified |
|---|---|---|
| `implementation` config surface is exactly four keys | §5.8, RT-7, revision row (via V-13) | ✓ FSPEC `:341` asserts the same four-member set `{testCommand, postWaveCommand, postWavePathspecs, startWave}` as **set equality** |
| `postWaveCommand` is a single *global* key, not per-wave | §5.8, RT-7 | ✓ consistent with the four-key set-equality above and with PLAN §3.4/RK-2 |
| A global setting would run `test:coverage` after **every** wave | §5.8, RT-7 | ✓ follows from the above; PLAN RK-2 states it identically |

The consequence the delta draws from those facts — red on waves whose new branches are not yet
covered — is the correct product consequence, and it is the one that matters to a user of this
pipeline: a floor that reds on waves 1..N-1 would halt runs for a reason that is not a defect,
which is worse than the risk RT-7 names. Re-specifying to T-10 avoids inventing a fifth config
key, which would have been a real scope addition and would have contradicted FSPEC `:341`'s
set-equality assertion. The edit takes the option that costs no surface change. Good call.

**No interface in this TSPEC changed.** The record shape, the announcement catalogue, the
classifier arms and the config keys the feature reads are all untouched by this diff — I
re-checked that the four-key set, `RESUME_PROVENANCE` and the §2.4 announcement enumeration are
byte-identical to the version I approved. The delta is confined to prose about who runs a test
command.

## Data Model

Nothing in the wave-ledger record's shape is in the delta's blast radius, and I confirmed that
rather than assuming it. The record stays `{version: 1, feature, planHash, lastGreenWave, head?}`
(§4.1), which is what REQ OB-1's answered text describes at `formatWaveLedger` and what FSPEC
§3.4 reasons over. The delta adds no persisted state, no field, and no new file — it moves a test
command from one runner to another.

One state-shaped consequence is worth naming as a positive: because the floor now runs inside
T-10 rather than as a global `postWaveCommand`, no per-wave chore commit changes, so
`implementation.postWavePathspecs` (`pdlc/workflows/dist/`) keeps its current meaning and
`WAVE_STATE_PATH` still appears in no owned-path set — the invariant AT-14 and AT-17 assert, and
the one a stray coverage artifact could plausibly have disturbed. The delta leaves it intact.

## Verification

The floor's verifiability improved, which is the part of this delta I would most want kept.

- **Before:** "the last implementation wave's `postWaveCommand` runs `npm run test:coverage`" —
  an obligation with no expressible configuration, therefore no observable that could fail.
- **After:** T-10 "runs it explicitly and reports the measured per-file branch number" — an
  obligation with a named owner, a named command (`--per-file --branches 85`), and a reported
  number. PLAN §4.5's batch-4 gate and its checklist row assert exactly that, and §4.5.1's
  delta-scoped coverage map supplies the oracle the raw percentage cannot be.

That last pairing matters for product fidelity: a whole-repo 85% floor over a 700 KB module can
stay green while every branch this feature adds is uncovered. The delta preserves the reference
to the two-oracle structure (backstop clause: §5.3 per-arm coverage + §5.7 generative suite), so
the feature's *own* branches remain the thing under test, not a repo-wide average. No test
obligation was dropped or weakened by this edit.

## Verification

_pending_

## Risks

### The DEC-ERR-03 sweep: what upstream no longer says

This TSPEC's §2.5 and §6.3 make claims *about* the REQ and the FSPEC. Both upstream documents
took erratum edits after those claims were written. Three of them are now false against upstream
at HEAD. None changes a behavioural clause, and none is in the sections this delta touched — all
are **inherited, nonlocal**.

**1 — §2.5 says the FSPEC does not state what an operator-pointed run records. It now does.**
TSPEC §2.5: *"One interaction the FSPEC does not state… the behaviour is unspecified upstream…
raised as an erratum against the FSPEC so the clause exists."* FSPEC v1.2 §3.4 (`:186–192`) now
carries the clause under the heading **"An operator-pointed run records exactly as any other run
does"**, and it specifies precisely what this TSPEC ratifies: the run records completed waves in
the same high-water form counted from the plan's first wave, bounded by BR-10, with provenance
`operator-set` announced (BR-07). The *substance* is unchanged and the two documents agree — the
TSPEC's ratification is faithful. What is stale is the framing: the TSPEC tells a reader it is
ratifying an unspecified behaviour with nothing upstream to trace to, when the trace now exists
and points at FSPEC §3.4. Fix: keep the ratification, replace "the FSPEC does not state" /
"unspecified upstream" with the citation to FSPEC §3.4's clause and mark the erratum discharged.
This is a false statement in a hand-off framing rather than in a shipped assertion, so per
DEC-ERR-01's demotion bar it is **Medium**, not High.

**2 — §6.3's four errata are all landed upstream; the section reads as open.** §6.3 says "Raised,
not fixed here", and each item quotes upstream text that no longer exists:

| §6.3 item | What it claims upstream says | Upstream at HEAD |
|---|---|---|
| 1 | FSPEC "states it derives from REQ v1.5"; REQ at HEAD is v1.6 | FSPEC `:17` derives from **REQ v1.7**; REQ is **v1.7** |
| 2 | FSPEC OB-F1 says REQ §10 records BL-04 as "discharged at FSPEC authoring" | FSPEC OB-F1 (`:437`) now says the REQ "records BL-04 as **open and unmet** in §5 and §10 (v1.7)" — matching REQ `:558` |
| 3 | FSPEC has no clause for what an operator-pointer run writes | FSPEC §3.4 `:186` carries it (see item 1 above) |
| 4 | REQ OB-1's worktree conclusion rests on `.worktreeinclude` | REQ v1.7 does not mention `.worktreeinclude` at all (`grep -c` → 0) |

Fix: convert §6.3 from "raised, not fixed" to a discharged record naming the upstream versions
that closed each item (FSPEC v1.2, REQ v1.7), or delete the items that landed. Leaving them open
misroutes the next reader — and, at harvest, would preserve as durable signal a set of defects
that upstream has already repaired. **Medium**, record-section only.

**3 — §6.2's OB-F1 row says REQ §10 and FSPEC OB-F1 characterise BL-04 inconsistently. They now
agree.** Both say open and unmet. The row's underlying claim — BL-04 is unmet, the tree is behind
the default branch, the rebase is owed before implementation — remains true and remains correctly
owned by the orchestrator/operator; only the "characterise inconsistently" clause and the "REQ
v1.6" version cite are stale. **Low**.

### Residual risk in the delta itself

None found. The one thing worth watching is not a spec defect: T-10's `test:coverage` run is now
the single point where the floor is observed, so if T-10 is descoped or split during Phase I the
floor loses its owner. PLAN §4.5's batch-4 gate and DoD checkbox both restate it independently,
so the obligation is doubly recorded — adequate.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | §2.5 states the operator-pointer write is "unspecified upstream" and raises an erratum "so the clause exists"; FSPEC v1.2 §3.4 now carries that clause and agrees with the TSPEC's ratification. Replace the framing with the citation; keep the ratification. | §2.5 |
| F-02 | Medium | inherited | nonlocal | §6.3 presents four errata as "raised, not fixed"; all four are landed upstream (FSPEC v1.2, REQ v1.7) and each quotes upstream text that no longer exists. Convert to a discharged record naming the closing versions. | §6.3 |
| F-03 | Low | inherited | nonlocal | §6.2's OB-F1 row says REQ §10 and FSPEC OB-F1 characterise BL-04 inconsistently, and cites "REQ v1.6"; both now say open-and-unmet and the REQ is v1.7. The row's substantive claim (BL-04 unmet, rebase owed) stands. | §6.2 |

FINDING: Medium | inherited | nonlocal | §2.5 | Says the FSPEC "does not state" what an operator-pointed run records and that the behaviour is "unspecified upstream"; FSPEC v1.2 §3.4 (`:186-192`) now specifies it and agrees with this TSPEC's ratification — the trace exists, so the framing is stale (substance unaffected; DEC-ERR-01 demotion applies, hand-off framing not a shipped assertion)
FINDING: Medium | inherited | nonlocal | §6.3 | All four errata raised upstream have landed: item 1 (FSPEC now derives from REQ v1.7, REQ is v1.7 not v1.6), item 2 (FSPEC OB-F1 now records BL-04 as open and unmet, matching REQ §10), item 3 (FSPEC §3.4 clause exists), item 4 (REQ v1.7 no longer mentions `.worktreeinclude`) — the section still reads "raised, not fixed here"
FINDING: Low | inherited | nonlocal | §6.2 OB-F1 row | Claims REQ §10 and FSPEC OB-F1 characterise BL-04 inconsistently and cites REQ v1.6; both now say "open and unmet" and the REQ is v1.7 — the row's substantive claim that BL-04 is unmet and the rebase is owed before implementation remains correct

## Positive Observations

- **Both routed items landed, in one edit, with no collateral.** Nine insertions, four deletions,
  three touched locations. An erratum round that changes only what it was asked to change is the
  cheapest possible thing for the next reviewer to confirm — this one took minutes, not a
  re-read.
- **The correction states its own reasoning, not just its conclusion.** §5.8 now carries the
  "deliberately **not** `implementation.postWaveCommand`" clause with the V-13 four-key ground and
  the every-wave-red consequence. A future author tempted to "simplify" this back into a config
  key will read why that fails before they try it. That is the durable half of the fix.
- **RT-7 and §5.8 were corrected together.** A common erratum failure is fixing the body and
  leaving the risk table saying the old thing; both moved, and the backstop clause was preserved
  verbatim rather than rewritten in passing.
- **The revision-history row is honest about scope.** "Corrections only; no decision re-litigated
  and no scope change… The floor itself, its threshold and its backstop are unchanged" — it names
  what did *not* change, which is exactly the claim a confirmation round has to check.
- **TSPEC and PLAN now agree on who owns the floor.** The two documents disagreed before this
  edit; T-10 / RK-2 / PLAN §3.4 are cited by name, so the trace is one hop and mechanically
  checkable.

## Recommendation

**Approved with minor changes**

The delta resolves both routed items completely and breaks nothing I previously approved. The
coverage floor keeps its 85% per-file branch threshold, keeps closing inside Phase I before DOD,
keeps its backstop, and now names an owner that actually exists in the config surface — matching
PLAN RK-2 and §3.4, which is what both reviewers asked for. No acceptance criterion, no
requirement trace, and no interface moved.

Three findings come out of the DEC-ERR-03 sweep, not the delta: this TSPEC's §2.5, §6.2 and §6.3
describe upstream text that REQ v1.7 and FSPEC v1.2 no longer carry, because the upstream errata
those sections raised have since landed. All three are **inherited** and confined to hand-off and
record sections; the TSPEC's behavioural content remains a faithful compression of upstream, and
in the one case where it matters most (§2.5's operator-pointer ratification) the TSPEC and the
now-existing FSPEC clause say the same thing. Nothing here is gating.

Suggested wording changes, none blocking, all appropriate for the next ordinary revision of this
document rather than a further erratum round:

1. §2.5 — replace "the FSPEC does not state" / "unspecified upstream" with a citation to FSPEC
   §3.4's "An operator-pointed run records exactly as any other run does" clause; keep the
   ratification and its rationale as written.
2. §6.3 — retitle to a discharged record and mark items 1–4 closed against FSPEC v1.2 / REQ v1.7,
   or drop them.
3. §6.2 OB-F1 row — drop the "characterise inconsistently" clause and the v1.6 cite; keep the
   unmet-BL-04 claim and the rebase-before-implementation sequencing precondition unchanged.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
