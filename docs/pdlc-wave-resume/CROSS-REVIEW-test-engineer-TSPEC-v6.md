# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.3)
**Date:** 2026-08-21
**Iteration:** 6 (round 4 erratum — delta confirmation)
**Scope:** Local
**Erratum edit under confirmation:** `b4a628b8..5d5bbd75`

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v1.2 (round 3); a
targeted erratum edit has since landed (`b4a628b8..5d5bbd75`, +9/-4 lines in the TSPEC). I read the
diff, re-derived the mechanical claims it makes against `origin/main`, checked the downstream
document it now cites, and re-read the upstream text the changed section leans on.

**Upstream integrity check first (DEC-ERR-03).** Both upstream hashes in the dispatch match the
bytes on this branch, and both are the *same* hashes I measured in round 3 — upstream is
byte-identical since my last confirmation, so no upstream sentence this TSPEC compresses has moved
under it:

| Upstream | Dispatch hash | Measured `shasum -a 256` | Match |
|---|---|---|---|
| `REQ-pdlc-wave-resume.md` | `17e83bfc…` | `17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f` | yes |
| `FSPEC-pdlc-wave-resume.md` | `9a6be7b5…` | `9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e` | yes |

The one upstream clause the edit newly leans on is FSPEC §341, which fixes the recognised
`implementation.*` key set at `{testCommand, postWaveCommand, postWavePathspecs, startWave}` **as a
set equality**. That is exactly what TSPEC V-13 restates and exactly what the edit's
not-expressible argument rests on. The compression is faithful.

Routed-item ledger:

| # | Routed item | Landed | Verified how |
|---|---|---|---|
| 1 | §5.8: floor re-specified as a last-**task** obligation, not a last-wave `postWaveCommand` (pm-review) | yes | §5.8 now reads "named as an obligation of the **last implementation task** (PLAN T-10, RK-2)". Residual: F-01, F-02. |
| 2 | §5.8/RT-7: `postWaveCommand` is a single global key, so per-wave scoping is not expressible (te-review) | yes | Re-measured at `origin/main`, not taken from the document — see §Data Model. |

Nothing I previously approved is broken. The edit changes prose in one subsection and one risk row;
it touches no interface, no type, no acceptance test, no oracle, no batch and no ownership claim.
Two residual imprecisions remain, both **Low**, neither gating.

## Architecture

### §5.8 — the floor moves from a wave gate to a task obligation

The pre-round sentence assigned the floor to "the **last wave's `postWaveCommand`** (TE Q-05: yes),
so the floor is a wave-level gate rather than a PUB-level surprise". The edit replaces that with an
obligation of "the **last implementation task** (PLAN T-10, RK-2), which runs it explicitly and
reports the measured per-file branch number", plus an explicit negative clause naming why
`implementation.postWaveCommand` cannot carry it.

Three things about the *shape* of this edit matter to my lens, and all three hold:

- **The obligation still names a runner, a command and a threshold.** `npm run test:coverage` from
  `pdlc/workflows`, `--per-file --branches 85`. A floor that moved owners but lost its command
  would have been a regression disguised as a correction; this one keeps every operative noun.
- **The negative clause is stated as a mechanism, not as a preference.** "V-13 closes the config
  surface at four keys with a single *global* `postWaveCommand`, so a per-wave-scoped setting is
  not expressible, and a global one would run `test:coverage` after **every** wave — red on waves
  whose new branches are not yet covered." That is a falsifiable statement about the runtime, and I
  falsified it against `origin/main` rather than accepting it (§Data Model). A future reader who
  wonders "why not just set `postWaveCommand`?" gets the answer in the document instead of
  re-discovering it.
- **The risk row and the body now agree.** RT-7's mitigation cell was rewritten in the same edit
  and now says the same thing as §5.8 in the same terms. Pre-round they would have diverged, which
  is the failure mode an erratum round exists to prevent. The revision-history row (v1.3) records
  the change, its cause and its non-scope, so the provenance of the re-assignment survives.

### What the edit deliberately did not touch, and should not have

The threshold (85%), the per-file mode, the include-list argument ("not 'the module is already in
the include list'"), the enumeration of the branch classes this feature adds (eight classifier arms,
seven renderer closures, the lazy-probe short-circuit, the announcement and report branches), and
RT-7's backstop (per-arm unit coverage in §5.3, the generative suite in §5.7) are byte-identical to
what I approved. RT-5's separate use of `implementation.postWavePathspecs` for the `dist/` path is
also untouched and remains correct — that key *is* legitimately global, since every wave's build
outputs want committing, so the edit's "global is wrong here" argument is scoped to the coverage
command and does not accidentally indict its neighbour.

## Interfaces

No interface in this TSPEC changed. The edit touches prose only — no signature, no exported symbol,
no seam parameter, no config key. I re-read the two interface surfaces the changed text names, to
confirm the document's description of them still matches the shipped code.

**`implementation.*` config surface (V-13, TSPEC §5.6).** At `origin/main`:

```
export const IMPLEMENTATION_DEFAULTS = Object.freeze({
  testCommand: null,
  postWaveCommand: null,
  postWavePathspecs: Object.freeze([]),
  startWave: 1,
});
```

Exactly four keys, in exactly the order V-13 and FSPEC §341 list them, and `postWaveCommand` is a
scalar `string|null` — there is no per-wave map, no array, no wave-indexed variant. The
"not expressible" claim is therefore a property of the type, not an opinion about ergonomics. This
is the strongest form the claim could take, and it is the form the edit uses.

**The post-wave execution seam.** `postWaveCommand` is consumed at
`orchestrate-dev.js:3280-3282` and again at `:3322-3324`, in both cases inside the per-wave body,
and `:3310` returns the gate label list `["post-wave", "test"]` whenever the key is set. So a set
`postWaveCommand` runs **once per wave, for every wave, unconditionally** — which is precisely the
failure the edit describes ("red on waves whose new branches are not yet covered"). The
announcement sites at `:15412`/`:15418` confirm the same per-wave framing in the operator-visible
strings.

I note for the record that this is a *runtime-measured* citation — the line positions are the
evidence, not decoration — so citing them by `file:line` is the sanctioned form under DEC-DOC-01
rather than a Low finding. The TSPEC itself cites the surface by symbol name (`V-13`,
`IMPLEMENTATION_DEFAULTS`), which is the right altitude for a spec.

## Data Model

The edit makes four checkable factual claims. I re-derived each against `origin/main` and against
the downstream PLAN at HEAD, rather than reading them back out of the document that asserts them.

| # | Claim as written | Where it is asserted | Measurement | Verdict |
|---|---|---|---|---|
| 1 | "V-13 closes the config surface at four keys" | §5.8, RT-7, v1.3 history row | `Object.keys(IMPLEMENTATION_DEFAULTS)` at `origin/main` is exactly `["testCommand","postWaveCommand","postWavePathspecs","startWave"]` | holds, exactly |
| 2 | `postWaveCommand` is "a single *global* setting", so per-wave scoping "is not expressible" | §5.8, RT-7 | The key's value type is `string \| null` — a scalar with no wave dimension; no sibling key carries one | holds; it is a type-level impossibility, not a limitation of convention |
| 3 | "a global one would run `test:coverage` after **every** wave" | §5.8, RT-7 | Consumed inside the per-wave body at `:3280` and `:3322`, guarded only on the key being non-empty, never on wave index | holds |
| 4 | The floor is a "last implementation **task**" obligation, at PLAN T-10 / RK-2 | §5.8, RT-7 | PLAN §3.4's run-configuration table carries the row `Coverage floor \| **T-10**, not postWaveCommand`; RK-2 in PLAN §4.4 states the same in risk form; T-10 sits in batch 4, the terminal batch | holds; the two documents now say the same thing in the same terms |

**Consistency across the pair.** The whole point of this erratum was that TSPEC and PLAN disagreed
about who owns the floor. They now agree, and they agree at three independent sites — TSPEC §5.8,
TSPEC RT-7, PLAN §3.4 + RK-2 — with no fourth site left carrying the old wording. I grepped the
TSPEC for surviving instances of the retired phrasing ("last implementation wave's
`postWaveCommand`", "wave-level gate"): the only remaining occurrences are inside the v1.3
revision-history row, quoted as the thing that was corrected. That is the right place for it.

**One structural observation, which is F-01 below.** The agreement is now held by *task ids*: TSPEC
§5.8 and RT-7 both pin `T-10` and `RK-2`, ids owned by a downstream document. PLAN's own revision
history records that ids `T-05`, `T-06` and `T-09` were retired during its round-1 revision, so id
churn in this PLAN is demonstrated, not hypothetical. If a later PLAN round renumbers, these two
TSPEC citations go stale silently — nothing mechanical reds. The fix is one clause, not a
restructure: lead with the role ("the last implementation task, per PLAN §3.4's run-configuration
row") and keep the id as a parenthetical locator. Low, because the coupling direction is already
unusual-but-deliberate here and the content is correct today.

## Test Strategy

This is the section where the re-assignment could have cost coverage, so I checked it hardest. It
did not — but it left one clause weaker than the mechanism behind it, which is F-02.

**Did the move weaken the gate's timing?** No. A `postWaveCommand` firing after the last wave and a
task obligation discharged in the terminal batch close at the same moment in Phase I; both are
before Phase DOD and well before Phase PUB. §5.8's "closed inside Phase I rather than surfacing as
a PUB-level surprise" survives the move intact. T-10 is in batch 4 with
`Deps = T-07, T-08, T-03, T-04`, so it genuinely runs after every other implementation task —
the floor is measured over the complete diff, which is the property that matters.

**Did the move weaken falsifiability?** This is the real question, and here the answer is
"unchanged, but the document under-states its own defence". A whole-file `--per-file --branches 85`
floor over `orchestrate-dev.js` — 734,711 B, per RT-1 — has an enormous denominator. Every branch
this feature adds (8 classifier arms + 7 renderer closures + 1 short-circuit + 5 announcement/report
branches) could be entirely uncovered and `npm run test:coverage` would still exit 0. A floor that
cannot go red for this feature's branches is, for this feature, an unfalsifiable oracle.

That gap is closed — but only in PLAN. T-10 carries **two** oracles: (i) the whole-file floor, and
(ii) the delta oracle, which reports c8's per-file uncovered-line list and asserts no uncovered line
falls inside this feature's introduced ranges, against PLAN §4.5.1's transcribed mapping table
(a deleted case fails a set equality rather than moving a percentage by 0.05). PLAN §4.5.1 states
the denominator problem explicitly. **TSPEC §5.8 names neither the denominator problem nor the
delta oracle**, so read on its own it asserts a floor closes a gap the floor structurally cannot
see.

This is *inherited*, not introduced by this edit — the pre-round §5.8 had the same silence, and I
approved it then on the strength of PLAN carrying the delta oracle. I raise it now at Low because
the edit brought §5.8 into the same sentence as T-10 and made the omission more visible, and
because the repair is one clause: after "reports the measured per-file branch number", add "paired
with the delta oracle of PLAN §4.5.1, since the whole-file denominator cannot by itself falsify an
uncovered new branch". No test changes, no scope change.

**Everything else in the test strategy is untouched and re-confirmed as approved.** §5.3's per-arm
unit coverage, §5.4's integration acceptance tests, §5.5's mutation duties, §5.7's generative suite
with its pinned `numRuns`, the §2.4 announcement set-equality oracle and the `merge-base`
call-count equality oracles of AT-03/AT-11 are byte-identical to the version I approved. No
acceptance test changed severity, level, owner or assertion in this edit.

## Open Questions

None open against the operator. Two notes, neither a finding:

- **The four errata this TSPEC raises upstream (§6.3) are unchanged by this edit** and remain
  outstanding against FSPEC and REQ. Since both upstream hashes are byte-identical to round 3, none
  of them has been landed or invalidated in the interim; they are still correctly stated as raised,
  not fixed. Nothing in this confirmation touches them.
- **`TE Q-05` is no longer referenced anywhere in the TSPEC.** The pre-round §5.8 carried
  "(TE Q-05: yes)" as the provenance of the wave-gate assignment; the edit removed the clause along
  with the assignment it justified. That is correct — the answer no longer describes the design —
  and the v1.3 history row records why the assignment changed, so no provenance is lost. I mention
  it only so a future reader searching for Q-05's disposition finds it here.

### Positive observations

- The negative clause is the best part of this edit. Most erratum rounds delete the wrong statement
  and stop; this one records *why* the wrong statement was unbuildable, in terms a reader can
  falsify against the runtime. That is the difference between a correction and a durable one.
- Both sites (§5.8 body and RT-7 mitigation) were rewritten in the same round, in the same terms.
  Half-landed errata that leave a risk row quoting the retired design are the common failure here,
  and this edit avoided it.
- The threshold, the command, the runner directory and the branch-class enumeration all survived
  the re-assignment unchanged. The floor moved owners without losing a single operative noun.

## Delta-Confirmation Findings

Both routed items landed and are independently re-measured. Two residual imprecisions, both Low,
neither gating. Recommendation: **Approved with minor changes**.

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | §5.8 and RT-7 now pin the downstream PLAN's task ids (`T-10`, `RK-2`) as the primary name for the floor's owner. PLAN has already retired ids `T-05`/`T-06`/`T-09` once, so id churn is demonstrated; a renumber leaves these two TSPEC citations stale with nothing mechanical going red. Lead with the role — "the last implementation task, per PLAN §3.4's run-configuration row" — and keep the id as a parenthetical locator. | TSPEC §5.8, §6.4 RT-7 |
| F-02 | Low | inherited | local | §5.8 says the floor "closes inside Phase I" without naming the whole-file denominator problem or the delta oracle that answers it. `orchestrate-dev.js` is 734,711 B (RT-1), so every branch this feature adds could be uncovered and `--per-file --branches 85` would still exit 0 — for this feature the floor alone is an unfalsifiable oracle. PLAN T-10 and §4.5.1 do carry the delta oracle; TSPEC should say so in one clause after "reports the measured per-file branch number". | TSPEC §5.8 |

## Recommendation

**Approved with minor changes**

The delta resolves both routed items — exactly, and at both sites that carried the retired wording —
without breaking anything I previously approved. No interface, type, acceptance test, oracle, batch
or ownership claim changed. Upstream is byte-identical to round 3, so the document remains a
faithful compression of REQ and FSPEC at their current version; FSPEC §341's four-key set equality
is precisely what the edit's not-expressible argument leans on, and it says what the TSPEC says it
says. The two residual findings are one-clause repairs, both non-gating, and neither blocks Phase P
from converging.

FINDING: Low | delta | local | TSPEC §5.8 / §6.4 RT-7 | The floor's owner is cited primarily by downstream PLAN task ids (T-10, RK-2); PLAN has retired ids before, so a renumber silently staleifies both citations. Lead with the role and keep the id as a parenthetical locator.
FINDING: Low | inherited | local | TSPEC §5.8 | The floor is described as closing the gap inside Phase I without naming the whole-file denominator (orchestrate-dev.js is 734,711 B) or the delta oracle at PLAN §4.5.1 that makes the floor sensitive to this feature's branches; read alone, §5.8 claims an oracle that structurally cannot go red for this feature.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:5ed76227d8e4cb5b37681421d30a3c50d29e755a7334d37e5ef09c996832234a
APPROVAL-HASH-NORMALIZED: sha256:2b38b3e626b1553b273ba3ca489c2c65f057222d13092abe45f14476f72ba49a
REVIEWED-COMMIT: 5d5bbd752487f6a4f0de2fa8250943ec7d0df3ca
UPSTREAM-STATE: REQ sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f
UPSTREAM-STATE: FSPEC sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e
