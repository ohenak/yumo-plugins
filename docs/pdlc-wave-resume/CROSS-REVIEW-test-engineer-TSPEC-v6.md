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

*(pending)*

## Test Strategy

*(pending)*

## Open Questions

*(pending)*

## Delta-Confirmation Findings

*(pending)*

## Verdict

*(pending)*
