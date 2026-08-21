# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.10, `sha256:9712b6b0…`)
**Date:** 2026-08-20
**Iteration:** 1

## Context

A full review, not a delta: the round history for this document was deleted by the harvest commit
`9cf48051` ("delete harvested cross-reviews and DoD code reviews"), so no
`CROSS-REVIEW-*-DECISIONS-v*.md` exists on disk and this dispatch is iteration 1 against the whole
of v1.10. I read the document end to end rather than diffing it.

**Upstream state, computed rather than trusted.** At `a9148c2f`:

| Document | sha256 | Version cell |
|---|---|---|
| REQ | `c62cfc35…` | 1.15 |
| FSPEC | `91ef2557…` | 1.6 |
| TSPEC | `3fa21acf…` | **1.11** |
| DECISIONS (under review) | `9712b6b0…` | 1.10 |

The document's `Upstream` cell (`:5`) and four prose sites (`:20`, `:81`, `:149`, `:396`) name
**TSPEC v1.10**. TSPEC is at v1.11, and its changelog opens with the change that matters most to
this record: "**OQ-7 is closed upstream, in this TSPEC's favour**"
(`TSPEC-pdlc-advisory-wave-gate.md:19`). That is not a version-cell nit — DECISIONS hedges four of
its own claims on OQ-7 still being open (F-02).

**How I reviewed it.** This document's stated purpose is to hold no tree measurements (`:24-33`,
`:52-55`), and its v1.10 preamble claims every claim was "re-grounded against the working tree". My
lens is testability, so I checked the claims that a PROPERTIES or test author would transcribe into
an oracle: the failure mode of each mechanism, the argv literals, the rejection reasons that
foreclose an alternative, and every "this is now asserted / a regression now fails the suite" claim.
Each was checked against the shipped module and the shipped suite, not against the citing document.

What holds at HEAD, verified and left alone: `stash` has no call site anywhere in
`pdlc/workflows/orchestrate-dev.js`; `reset --hard` has exactly one, on the seam-revert path
(`orchestrate-dev.js:3018`); `ADVISORY_DEFAULTS.enabled` is `false` (`:1945`); `nonNegativeInt`
exists as a sibling of `positiveInt` and `waveBudgetPerRun` is its only caller (`:2073-2077`,
`:2096`); the promotion `commitPaths` call is where DEC-A6-02 says it is, past the same green gate,
with the message literal the entry fixes (`:15472-15482`); and the build-outputs commit precedent it
cites is verbatim at `:15487-15488`.

## Options Considered

Three readings of "review a DECISIONS document through a testing lens" were available.

- **Check the four entries against TSPEC and stop.** Rejected: it is the reading that produced the
  defects this round found. Three of my Highs are places where DECISIONS is a *faithful* compression
  of a document or a tree state that has since moved, or of a channel that has since been retired.
  A citation check against v1.10 would have passed all three.
- **Re-litigate the four decisions on their merits.** Out of lens and out of scope — the mechanism,
  the promotion commit shape, the ref name and the `0` affordance are settled and shipped, and my
  job is not to reopen them.
- **Falsify every claim the document makes about a failure mode, an argv, a test, or a foreclosed
  alternative — against the module and the suite** (chosen). A DECISIONS entry is read downstream by
  PROPERTIES and by an implementing task; the claims that reach an oracle are exactly the claims
  about what throws, what is asserted, and what is impossible. Those are also the only claims in
  this document that a reader cannot check without leaving it.

Executing the chosen reading, claim by claim.

**Claim — "Any capture or restore call returning `ok !== true` throws" (`:318`).** False for
capture, and the document says so itself three lines later. `captureTreeSnapshot` never throws: it
returns `null` on every failed verb through a `fail(verb)` helper (`orchestrate-dev.js:12574-12613`),
and its own docstring states "Returns `null` on any `ok !== true` — never throws"
(`:12558`). `restoreTreeSnapshot` does throw, on all three verbs (`:12635-12662`). TSPEC agrees with
the code, not with this bullet (`TSPEC:1430`, "the capture-failure disposition, with the writers
named"). F-01.

**Claim — the ignored-path boundary is upstream's open question (`:125`, `:199-201`, `:208-210`,
`:331-333`).** Closed upstream, answered *no*. `TSPEC:1755` records OQ-7 as "**Closed upstream,
answered *no***", FSPEC BR-9 at v1.6 and REQ AC-5.1 at v1.14/v1.15 fix the map's domain as tracked
plus non-ignored untracked files (`REQ:503` — ignored paths "are operator files A6 never wrote and
never restores over"), and `TSPEC:504-509` states the scoped ignored-path arm this record holds in
reserve "is **not** built: the decision that would have required it did not come back". F-02.

**Claim — "A new file is not an option" (`:99`).** The premise under it is a retired channel.
`build-runtime.mjs` emits exactly one artifact, `pdlc-cli.mjs` (`build-runtime.mjs:3`, `:11`,
`:24-26`, `:133`); `git ls-files pdlc/workflows/dist/` returns that one path; the consumer sync step
is deleted and its copies are swept by an operator-invoked cleanup script
(`pdlc/hooks/scripts/cleanup-consumer-workflows.sh:4-7`). The shipping channel vendors **two module
files** verbatim — `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]`
(`pdlc/engine/scripts/prepack.mjs:20`, copied at `:38-47`). A new module is a three-list edit
(`prepack.mjs:20`, `publish-preflight.mjs:221-224`, `fixture-machine.mjs:426`), not an impossibility.
F-03.

**Claim — "a future 'simplification' collapsing `0` into `enabled: false` now fails the suite rather
than passing it" (`:406-408`).** True of the spec, false of the suite. `TSPEC:1484-1493` does
require the present-and-zero conjunct. The shipped fixture does not carry it: A6-15
(`pdlc/workflows/__tests__/advisoryWaveGate.test.js:1591-1619`) asserts `outcome`, `reason`, zero
`_agent` calls and `commit-tree === 1`, calls `runWaveGateSeam` directly rather than a run, and
never reads the report's advisory summary key. F-05.

**Claim — "The mechanism is two module-private functions" (`:203`).** Both are `export`ed
(`orchestrate-dev.js:12566`, `:12635`) and destructured by name in the suite
(`advisoryWaveGate.test.js:280`). F-04.

**Claim — DEC-A6-03's rejection of option A is a tested commitment (`:149-159`).** Confirmed, and it
is the best-evidenced claim in the document. `advisoryWaveGate.test.js:1624` runs two red waves and
asserts `new Set(targets)` set-equal to `{refs/pdlc/a6-snapshot-1, refs/pdlc/a6-snapshot-2}`
(`:1662`) plus one write each (`:1663-1664`) — set-equality, not containment, so a fixed-name
regression fails on both conjuncts exactly as described.

**Claim — no test catches a `-m`-less capture (`:189-192`).** Confirmed: `grep -rn "A6 snapshot"`
over `pdlc/workflows/__tests__/` and `pdlc/engine/__tests__/` returns nothing, so the message literal
`A6 snapshot: wave {waveNum} pre-repair tree ({feature})` (`orchestrate-dev.js:12596-12599`) is
unasserted anywhere. The entry's warning is accurate and still live.

**Claim — DEC-A6-02's reversibility caveat rests on TSPEC's message oracle (`:238-246`).** Confirmed:
`waveExecution.test.js:1347` asserts `chore(test-feat): wave 1 advisory promotion (T2)`, matching
`orchestrate-dev.js:15474` byte for byte. The caveat holds and the citation is now correct.

**Claim — the example gains the key and the engine asserts over it in a file of its own
(`:362-377`).** Confirmed on both channels: `.claude/pdlc.config.example.json` carries
`"advisory":{"enabled":false,"waveBudgetPerRun":1}`, and
`pdlc/engine/__tests__/advisory-config-example.test.js` is a purpose-named file asserting the section
parses with a non-negative integer budget, exactly as the entry allocates.

## Decision

**Needs revision.** Three High findings, all of the same shape and none of them a design objection:
a claim that a downstream reader would transcribe into an oracle, or that forecloses an option, no
longer holds at the bytes it describes. The four decision entries themselves — the dangling-snapshot
capture, the `commitPaths`-owned promotion, the wave-scoped ref, the `nonNegativeInt` affordance —
are sound, shipped, and I am not asking for any of them to move.

**Why F-01 is High and not a wording nit.** `:318` is the only sentence in the document that states
A6's failure semantics as a single rule, and it is the sentence a PROPERTIES author writes a property
from. Transcribed as written it yields `await assert.rejects(captureTreeSnapshot(...))` — a test that
fails against correct code, and whose "fix" is to make capture throw, which would break the
capture-failure disposition path the very next bullet describes (`:322-327`). The document contains
both readings four lines apart; the reader has no way to know the second one wins. The repair is one
sentence: restore throws (`orchestrate-dev.js:12638-12662`), capture returns `null` and the call site
writes the capture-failure disposition itself (`:12558-12561`, `TSPEC:1430`) — fail-closed is a
property of the *pair*, discharged two different ways on purpose.

**Why F-02 is High.** A re-evaluation trigger is the one part of a decision record that is supposed
to be *observable* — a condition someone can watch for. `:208-210` asks the reader to watch for "the
OQ-7 erratum returns holding ignored generated outputs inside the oracle", an event that has already
happened and resolved the *other* way (`TSPEC:1755`, `REQ:503`), with the contingent arm explicitly
not built (`TSPEC:504-509`). A trigger that fires on a past event with the opposite outcome is worse
than a missing trigger: it tells a future implementer that a mechanism arm is still owed. Three more
sites carry the same stale hedge (`:125`, `:199-201`, `:331-333`), and the `Upstream` cell (`:5`)
binds a TSPEC version that no longer exists. All five repairs are transcriptions of a decided
boundary, not new design.

**Why F-03 is High, and what I am *not* asking for.** I am not asking for "add a module" to be
adopted, or even reopened on merit — co-locating with `runAdvisorySeam`, `classifyEnvelope` and
`appendAdvisoryEntry` is very likely still the right call. I am asking that the reason be one the
tree supports. As written, `:93-100` rejects a whole class of alternatives by declaring it
unbuildable, on a bundle-and-sync mechanism that no longer exists: the sole build output is
`pdlc-cli.mjs`, the consumer copy is swept rather than synced, and the engine channel ships the
module as a *file* among two. The same paragraph is also the premise for the "no `fs`, no `process`"
half of option B's rejection (`:123`), which is enforced today by an in-suite source scan
(`advisoryWaveGate.test.js:3194`) rather than by a bundle format — a stronger and still-true reason,
which is what the rewrite should cite. This one is `Cross-Feature`: any sibling feature whose
DECISIONS or TSPEC still reasons from "one module, one bundle, synced to `.claude/workflows/`" has
inherited the same falsified premise.

**On F-05, and what I deliberately did not file.** DECISIONS describes TSPEC §5.2 accurately; the
missing conjunct is the *implementation's*. I file it against this document only because of what the
entry does with it — `:408` closes the obligation ("The behaviour is decided here and asserted
upstream; nothing further is owed by this record"), and a closed obligation is what stops the next
reader looking. Medium, with the repair being a hedge ("asserted in TSPEC §5.2; the fixture that
carries it is A6-15's to complete") rather than a deletion. I did **not** file the fixture gap itself
as a DECISIONS finding — it belongs to the implementation phase, and it is recorded under
`## Consequences` for that reader.

I also did not file two things I looked at hard:

1. **`git add -A --` (`:174`) versus `git add -A` (`:125`)** as a High. It is a real inconsistency and
   it is F-06, but at Low: `TSPEC:477`'s block is the authority and it carries the `--`, so DECISIONS
   at `:174` is the faithful transcription and `:125` is the loose one. The shipped call is
   `["add", "-A"]` (`orchestrate-dev.js:12579`) — a divergence from TSPEC's block that no oracle
   catches, since no test asserts the capture argv's trailing `--`. That is an implementation
   question (Q-02), not a defect of this record.
2. **The `Known gap in the remedy's reach` (`:265-271`)** as a DECISIONS defect. The entry is honest
   and correctly routes the halt-message obligation to REQ/FSPEC. But `grep -n "a6-snapshot\|copy the
   ref\|overwrit"` over REQ v1.15 and FSPEC v1.6 returns **nothing** — the routing never landed, and
   the ref-overwrite that `TSPEC:534` describes still reaches an operator with no warning at halt
   time. That is an upstream gap, not this document's, and it is emitted as an ERRATUM rather than
   folded into this verdict.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | "**Any capture or restore call returning `ok !== true` throws**" is false for capture and contradicts the next bullet. `captureTreeSnapshot` returns `null` via `fail(verb)` on every failed verb and never throws (`orchestrate-dev.js:12574-12613`, docstring `:12558`); only `restoreTreeSnapshot` throws (`:12638-12662`), and TSPEC assigns the capture-failure disposition to the call site (`TSPEC:1430`). A property transcribed from this sentence asserts a rejection that correct code never produces. **Fix:** state the two halves separately — restore throws and is tagged `__isRevertFailure`; capture returns `null` and `runWaveGateSeam` writes the capture-failure disposition — with "fail-closed" as the property of the pair | `## Consequences` → What follows from DEC-A6-01, `:318` |
| F-02 | High | Local | **Four sites still hedge on OQ-7 as an open upstream question, and the `Upstream` cell binds a superseded TSPEC.** OQ-7 is closed, answered *no* (`TSPEC:1755`; FSPEC BR-9 v1.6; `REQ:503`), and the scoped ignored-path arm this record holds in reserve is explicitly not built (`TSPEC:504-509`). The re-evaluation trigger at `:208-210` therefore names a past event with the opposite outcome — the least observable form a trigger can take — and `:5` names TSPEC v1.10 where the tree has v1.11 (`sha256:3fa21acf…`). **Fix:** rebind `:5` (and the prose sites `:20`, `:81`, `:149`, `:396`) to v1.11, restate `:125`, `:199-201` and `:331-333` as transcriptions of the decided boundary, and drop or invert the trigger | `:5`, `## Options Considered` D row `:125`, `DEC-A6-01` `:199-201` / `:208-210`, `## Consequences` `:331-333` |
| F-03 | High | Cross-Feature | **The "One module, one bundle" constraint forecloses an entire alternative class on a retired mechanism.** `build-runtime.mjs` emits only `pdlc-cli.mjs` (`:3`, `:11`, `:24-26`, `:133`) and `git ls-files pdlc/workflows/dist/` returns that one path; the `.claude/workflows/` consumer copy is now *swept* by `pdlc/hooks/scripts/cleanup-consumer-workflows.sh:4-7`, not synced; and the shipping channel vendors two module **files** (`pdlc/engine/scripts/prepack.mjs:20`, `:38-47`). "A new file is not an option" is therefore false as stated — it is a three-list edit (`prepack.mjs:20`, `publish-preflight.mjs:221-224`, `fixture-machine.mjs:426`). Option B's "cannot use `fs` or `process`" rests on the same paragraph, though that half survives on a different and still-true ground: the in-suite source scan at `advisoryWaveGate.test.js:3194`. **Fix:** restate the constraint on the engine channel, and re-reject "add a module" on merit (co-location with the advisory-tier symbols) rather than on impossibility | `## Context` `:93-100`, and the option-B row `:123` that depends on it |
| F-04 | Medium | Local | **DEC-A6-01's reversibility rests on "two module-private functions"; both are exported and directly unit-tested.** `export async function captureTreeSnapshot` (`orchestrate-dev.js:12566`) and `restoreTreeSnapshot` (`:12635`) are destructured by name in the suite (`advisoryWaveGate.test.js:280`, driving A6-10's round-trip at `:328-409` and the throw cases at `:410-459`). Reversibility is still "easy", but it is *test-visible*, not silent — the same caveat DEC-A6-02 correctly records for its message literal (`:238-246`), and for the same reason: an operator acts on this rating. **Fix:** "two exported, directly unit-tested functions", with the caveat stated | `DEC-A6-01` Reversibility, `:203-204` |
| F-05 | Medium | Local | **"A future 'simplification' collapsing `0` into `enabled: false` now fails the suite rather than passing it" is true of TSPEC, not of the suite.** `TSPEC:1484-1493` does require the present-and-zero summary conjunct; the shipped fixture omits it — A6-15 (`advisoryWaveGate.test.js:1591-1619`) asserts only `outcome`, `reason`, `agent.calls === []` and `commit-tree === 1`, drives `runWaveGateSeam` directly rather than a run, and never reads the report's advisory summary key. The paired `enabled: false` key-absent oracle lives on a different path entirely. The entry then closes the obligation at `:408` ("nothing further is owed by this record"), which is what makes the overstatement load-bearing. **Fix:** attribute the assertion to TSPEC §5.2 and name the fixture as owing it | `## Consequences` → What follows from DEC-A6-04, `:396-408` |
| F-06 | Low | Local | **Two different literals for the same argv, and a "verbatim" that is an ellipsis.** The option-D row writes `git add -A` (`:125`) while the Decision writes `git add -A --` (`:174`); `TSPEC:477` carries the `--`, so `:125` is the loose one. Separately, `:179-180` says the `-m "…"` is "transcribed here verbatim from TSPEC §2.5's block" — accurate about TSPEC, but what a reader sees is the ellipsis, while the shipped literal is `A6 snapshot: wave {waveNum} pre-repair tree ({feature})` (`orchestrate-dev.js:12596-12599`). Since §5.2's oracles are argv-sequence assertions, one literal per command is the safer form. **Fix:** align `:125` with `:174`, and say "transcribed with TSPEC's own elision" | `## Options Considered` `:125`, `DEC-A6-01` `:174`, `:179-180` |
| F-07 | Low | Process | **The `Cross-Reviews` cell cites eighteen files, none of which exists.** `:7` enumerates PM and TE DECISIONS reviews v1–v9; harvest deleted the whole round history at `9cf48051`, and this dispatch is keyed as iteration **1**, so the cell's numbering now collides with the file this round writes (`…-DECISIONS-v1.md` names round 1 of a history whose round 1 the cell also names). This is the nonexistent-authority citation class the REQ/FSPEC verification checks call out. **Fix:** a one-clause convention — the cell indexes rounds *responded to*, and harvested rounds are named as harvested — decided once for the pipeline rather than per artifact | Header, `:7` |

## Questions

## Consequences

## Positive Observations

## Recommendation

## Verdict
