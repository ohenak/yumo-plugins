# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.12)
**Date:** 2026-08-20
**Iteration:** 3 (delta confirmation, erratum round)

## Overview

Delta confirmation on the v1.11 → v1.12 erratum (`efeb798e..0f2a9710`, nine commits). Scope is the
delta plus this TSPEC's fidelity to upstream **at HEAD** — REQ `sha256:f97f4f66…`, FSPEC
`sha256:d602c440…` (FSPEC v1.7) — not the routed item list (DEC-ERR-03).

Every current-state claim the erratum makes was re-measured against the tree rather than read:

| Erratum claim | Measured at HEAD | Verdict |
|---|---|---|
| `build-runtime.mjs` emits only `pdlc-cli.mjs` | `bundles` array has one entry, `file: "pdlc-cli.mjs"` (`build-runtime.mjs:131-133`) | holds |
| `prepack.mjs` vendors `MODULE_NAMES` verbatim | `const MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` + `copyFileSync` per name (`prepack.mjs:20,39-45`) | holds |
| One `commitPaths` per promoted task | `for (const promo of waveResolvedPromotions)` (`orchestrate-dev.js:15471`) over `groupPromotedPaths` rows (`:15403`) | holds |
| `git add -A`, no `--` | `["add", "-A"]` (`orchestrate-dev.js:12580`) | holds |
| `ADVISORY_SEAMS` is six members | `Object.freeze(["A1"…"A6"])` (`orchestrate-dev.js:1952`); `ADVISORY_SEAM_PHASES` carries six rows | holds |
| example config carries `advisory` | `{"enabled": false, "waveBudgetPerRun": 1}` | holds |
| nothing tracked under `.claude/workflows/` | `git ls-files .claude/workflows/` → 0 rows | holds |
| DEC-A6-03's halt-message obligation **has landed** upstream | FSPEC v1.7: BR-14 (co-location clause), §3 Step 10 two arms, E-34, AT-06-4 conjunct (3) + AT-06-4b; REQ carries the same clause | holds — the earlier "unlanded" report is inverted, correctly absorbed rather than re-routed |

All seven mechanical items land. One consequence of the eighth does not: the obligation landed in
the **design** half of this TSPEC and not in its **oracle** half, which is the finding below.

## Architecture

Nothing structural moved, and that is the right outcome for an erratum round: the delta is
re-grounding plus one mechanism named where prose used to route.

- **§1.2 (runtime channels).** The retired `dist/orchestrate-dev.bundle.js` premise is replaced by
  the two real channels — the single generated `dist/pdlc-cli.mjs`, and `prepack.mjs`'s verbatim
  vendoring of `MODULE_NAMES` into `@kaneho/pdlc-engine`. The load-bearing conclusion ("everything
  lands in `orchestrate-dev.js`, nothing to hand-sync") survives the re-grounding intact and is now
  true for a reason that exists at HEAD. PM F-01's premise is discharged.
- **§1.1 O-8 / §3.6.** Restated on the shipped shape: a loop over `groupPromotedPaths`'s rows, one
  `commitPaths` per promoted task. This is the reading the `{taskId}` slot forces, and it matches
  `orchestrate-dev.js:15471`. §3.6's DECISIONS-routing paragraph was updated in the same pass
  ("adds a call per promoted task … each surfacing in git history as its own commit"), so the
  document does not now argue against its own restatement — a common erratum failure mode avoided.
- **§2.5.** The stray `--` is gone from `git add -A`, so the mechanism block, its own prose, O-1,
  OQ-5 and the shipped call agree. §2.5 additionally stops describing the overwrite warning as
  operator lore and names the carrier.
- **§1.3 / §5.1.** Both HEAD-state caveats are re-measured and now record `none` residue on the
  five surfaces whose production halves landed, keeping the one genuinely outstanding row (the
  `advisoryRecord.test.js` `rows.map` literal) visible rather than sweeping it up with the rest.
  Keeping the rows with restated residue, instead of deleting them, is the right call for readers
  of v1.2–v1.11 reviews.

## Interfaces

Two seam-level surfaces changed and both are testable as written:

- **`runWaveGateSeam`'s return type (§4.2, line 763)** gains `snapshotRef: string | null` inside
  `haltFields`. The union is closed and the discriminator is total — non-`null` exactly when the
  capture succeeded — so a test can assert the field without a "sometimes absent key" ambiguity.
  The choice of `null` over `undefined` matches the existing `repairPaths: []`-not-`undefined`
  convention on the same object, which keeps the halt-report shape uniform across every A6-touched
  halt. Good.
- **The un-skip `haltError` second argument (§4.5)** now carries `snapshotRef` in the resolved-wave
  object and remains `undefined` when A6 did not fire. The disabled-tier byte-identity claim (§5.2,
  T-10-3/T-10-4, PROP-DIS-04) is unaffected: the shipped gate is `a6.disposition ? {…} : undefined`
  (`orchestrate-dev.js:15399`), not a test on `haltFields`, so a fifth member cannot leak a
  `haltAdvisory` key onto a disabled-tier halt. I re-checked that at HEAD rather than trusting the
  claim.

The commit-writer interface in §3.6 is unchanged in its argument set; only its call multiplicity was
restated. AT-04-3's oracle is over writer *identities*, so the restatement does not invalidate the
AT it cites.

## Data Model

The halt-fields contract (§4.5) moves from a closed four-member set to a closed five-member set:
`{rootCause, diagnosis, repairApplied, repairPaths, snapshotRef}`. The v1.12 addition is specified
well at the design altitude:

| Aspect | State in v1.12 | Assessment |
|---|---|---|
| Domain | ref name for **this** halting wave, or `null` | total, no third state — falsifiable |
| Capture-failure literal | `snapshotRef: null`, listed in the verbatim-literals table beside `repairPaths: []` | consistent with E-34's arm; assertable as an exact value |
| Rendering contract | from non-`null`: ref name **and** the overwrite sentence, adjacent; from `null`: neither half | this is the co-location observable BR-14 names, stated as a mechanism rather than an intention |
| Why a field, not prose in `diagnosis` | keeps AT-05-3's literal `diagnosis` comparison intact while BR-14's oracle asserts co-location | correct separation — folding it in would have coupled two independently-asserted oracles |

This is a good piece of design work: it turns an editorial obligation ("the report should also say")
into a data-model discriminator a test can drive both arms of. My objection is not to the model. It
is that the model arrived without the two oracles that make it falsifiable — see **Test Strategy**.

## Test Strategy

**This is where the round does not close.** The erratum absorbed BR-14 into §2.5 and §4.5 and did
not touch §5 at all — `git diff efeb798e..HEAD` shows no edit below §5.1's status caveat except the
two re-measured red-reason sentences. Measured against FSPEC at HEAD, §5.6's AT map is now behind
its upstream:

| Upstream at HEAD (FSPEC v1.7) | TSPEC §5.6 at v1.12 (line 1795) |
|---|---|
| **AT-06-4** — *Then* (1) the report carries the diagnosis, (2) it carries the root-cause class, **and (3) where it points at a captured pre-A6 tree state, the same report states there that re-running this feature overwrites that capture**; the oracle asserts co-location and the presence of the overwrite statement, never the capture's name | "halt report following an escalation carries the root-cause class (§4.5's halt fields)" — conjunct (2) only |
| **AT-06-4b** — no capture taken (E-34): diagnosis + class, points at no capture, **carries no overwrite warning** — "the companion that makes AT-06-4's conjunct (3) falsifiable rather than a string always present" | **absent** — no row, and no AT anywhere in §5 mentions the warning (grep for `overwrit` across §5.1–§5.6 returns nothing) |

The consequence is the specific failure this lens exists to catch. §4.5 now specifies a rendering
contract — non-`null` `snapshotRef` renders ref name *and* overwrite sentence, adjacent; `null`
renders neither — and no test in the feature's set asserts either arm. An implementation that plumbs
`snapshotRef` into `haltFields` and never renders the sentence is green under every AT this TSPEC
maps. So is one that emits the sentence unconditionally, including on the E-34 halt where FSPEC
requires its absence: without AT-06-4b, conjunct (3) degenerates into an always-present string, which
is the unfalsifiable-oracle shape FSPEC itself names in AT-06-4b's own text.

What resolves it, concretely, in §5.6 and the `advisoryWaveGate.test.js` row of §5.1:

1. Extend the AT-06-4 row to all three conjuncts, and state the oracle as **co-location within one
   rendered report string** — e.g. the overwrite sentence and the ref pointer are both found in the
   same `haltError` report text, not merely both present somewhere in the run — since co-location is
   the observable BR-14 pins and a two-independent-`toContain` oracle cannot falsify a split.
2. Add an **AT-06-4b** row on an E-34 fixture (capture fails, `snapshotRef: null`): diagnosis and
   class present, **no** ref pointer, **no** overwrite sentence — the negative that makes (3) able
   to fail. Both belong on `advisoryWaveGate.test.js`, which already owns §5.5's capture-failure
   disposition fixture, so no new file and no new double is needed.
3. §5.5 transcribes the verbatim halt strings; the overwrite sentence should join that list, or the
   AT should say explicitly that it asserts the *presence of a statement* rather than a literal, so
   the implementer does not have to guess which oracle shape is intended.

Everything else in §5 that the delta touches re-reads clean. The two re-measured red-reason caveats
are now accurate: `advisory-config-example.test.js` asserts `advisory.enabled` boolean and a
non-negative integer `advisory.waveBudgetPerRun`, and the example carries `{"enabled": false,
"waveBudgetPerRun": 1}`, so the stated red-reason was indeed falsified; `advisoryQueueSeams.test.js`'s
`toHaveLength(6)` counts against a six-member `ADVISORY_SEAMS` at HEAD. §5.2's two-red-wave fixture
still carries the only oracle that can see the one-ref-per-wave invariant, unchanged and still
correct.

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
