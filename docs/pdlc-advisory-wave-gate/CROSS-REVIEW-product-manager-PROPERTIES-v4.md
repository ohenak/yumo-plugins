# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 4
**Scope:** Upstream-cascade confirmation only — PROPERTIES' own bytes are unchanged since the v3 approval (`REVIEWED-COMMIT: 87d4c233`); TSPEC moved from `sha256:79777fa6…` (v1.8) to `sha256:1531143c…` (v1.10 + Phase-P erratum). One question: does PROPERTIES still hold as approved against upstream as it now stands?

## Overview

**What moved.** Two upstream documents changed under this approval, not one:

| Upstream | At v3 approval | At HEAD | Bearing on PROPERTIES |
|---|---|---|---|
| TSPEC | `sha256:79777fa6…` (v1.8) | `sha256:1531143c…` (v1.10 + Phase-P erratum) | §1.3 and §5.1 re-grounded on HEAD; §4.4 affordance wording corrected; §3.2 step 2 `.enabled` sites re-anchored to symbols |
| REQ | `sha256:a10396e8…` (v1.8) | `sha256:817b6745…` (v1.9) | NFR-4 restated; §1 ledger citations re-anchored; C-2 `waveBudgetPerRun` default `1` restored |
| FSPEC | `sha256:82f74a2d…` | `sha256:82f74a2d…` | byte-identical — nothing owed |
| DECISIONS / PLAN | — | `sha256:25f8e954…` / `sha256:e97acf66…` | read for contradiction; none found against PROPERTIES |

**The one substantive shift.** TSPEC v1.10 stopped describing the A6 test-side transcription as
future work. Commit `e3b9d5a3` landed almost all of it ahead of Phase I, so §1.3 now carries an
`At HEAD` / `Residue` table and §5.1 gains a *Status column caveat* stating that `edited` and `new`
describe each file's required end state, **not work outstanding**, and that both files TSPEC calls
`new` — `advisoryWaveGate.test.js` and `pdlc/engine/__tests__/advisory-config-example.test.js` —
are already on disk.

PROPERTIES has a section that says the opposite, in its own voice, as a HEAD-verified claim. That
is the finding of this confirmation (F-01), and it is not on the routed item list — it is the
cascade itself (DEC-ERR-03). A second, softer instance of the same drift sits in the derivation
rules (F-02). The property *semantics* — what each PROP-* asserts, and which AC it serves — are
untouched by both upstream edits; nothing this round changed narrows, broadens or re-triggers an
acceptance criterion, and no property lost its requirement.

## Properties

Re-read of the properties this document leans on upstream surfaces that moved, at their current
version:

| PROPERTIES text | Upstream at HEAD | Still faithful? |
|---|---|---|
| PROP-CTR-10 — `seamBudgetMinutes` measured per attempt over the dispatch→verdict window, with a companion run whose *gate command is slow* but whose every dispatch→verdict window stays inside budget | REQ v1.9 NFR-4 now reads "the window closes at the attempt's verdict, and the gate runs after that verdict, not within the measured span" (replacing "the gate runs between attempts, never inside one") | **Yes — improved.** PROP-CTR-10's slow-gate companion is precisely the case the old wording could not justify. The restatement makes the property the criterion's oracle rather than an extension of it |
| PROP-CFG-01 / PROP-CFG-02 — `waveBudgetPerRun` default `1`; `0` survives as configured, `-1`/`1.5`/`"x"`/`null` fall back to `1` | REQ §5 C-2's default `1` restored (REQ F-01); TSPEC §4.4 unchanged on type, default and validator | Yes — the contract cells match in both documents |
| PROP-CTR-13 — tier enabled + `waveBudgetPerRun: 0` ⇒ escalate `budget-exhausted`, snapshot still taken, `report.advisory` **present** with the sixth row at zero | TSPEC §4.4 rewords the affordance from "documented operator affordance" to "**intended operator configuration** (honoured, not documented anywhere operator-facing this feature ships)" | Yes. PROPERTIES never claimed a documentation carrier — it asserts the *behaviour* and the observable that separates this arm from `enabled: false`. The upstream correction withdrew a rationale claim, not a behavioural one, so PROP-CTR-13 is untouched |
| PROP-CFG-03 — example carries the whole `advisory` section `{"enabled": false, "waveBudgetPerRun": 1}`, asserted in the purpose-named new engine file, never in `ci-arrangement.test.js` | TSPEC §5.1's engine-channel row now says the literal "is the shipped-default pairing only — it does not teach E-33's `0`-with-`enabled: true` affordance" | Yes. PROP-CFG-03 asserts shape and parse, and explicitly parks the assertion off `ci-arrangement.test.js` — the same disposition TSPEC still carries |
| PROP-DIS-06 / §1.3's `.enabled`-counts-three constraint | TSPEC §3.2 step 2 and §1.3 re-anchored the three sites from `:3258` / `:13678` / `:1318` to symbol anchors (`runAdvisorySeam`'s disabled-tier early return, the run-level `advisoryTierOn` assignment, `orchestrate-queue.js`'s `finish` closure); the count is unchanged at three | Yes — PROPERTIES states the constraint, not the line numbers, so the re-anchoring passes through cleanly |
| PROP-SEAM-02 — cardinality surfaces are transcription surfaces; four sites named "verified at HEAD" as `expect(rows).toHaveLength(5)` at `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571`, `:726` | TSPEC §1.3 re-grounds: all four sites "already read `toHaveLength(6)`" at HEAD, and re-anchors its own pins to block titles per DEC-DOC-01 | **The property yes, the evidence no.** Measured at HEAD: the four sites are `:629`, `:634`, `:578`, `:733` and all read `(6)`. See F-02 |
| "File existence, verified at HEAD" — the two new files "are both absent at HEAD and both are explicitly planned as new" | TSPEC §5.1's new Status caveat: both are "on disk", `advisory-config-example.test.js` red because the example carries no `advisory` section | **No.** Both exist at HEAD; the sentence is false against upstream and against the tree. See F-01 |

No acceptance criterion was narrowed, broadened or re-triggered by either upstream edit, and the
AC→property map in §C-1 still resolves for every P0/P1 criterion, NFR-4 included.

## Oracles

The oracle side is where the cascade actually bites, so it was measured rather than reasoned about.

**Measured at HEAD (`git rev-parse HEAD`, working tree on `feat-pdlc-advisory-wave-gate`):**

- `pdlc/workflows/__tests__/advisoryWaveGate.test.js` — **exists** (1.8 K). PROPERTIES names it the
  home of PROP-CTR-09, -11, -12, -13 and PROP-GATE-* and calls it absent.
- `pdlc/engine/__tests__/advisory-config-example.test.js` — **exists** (2.5 K). PROPERTIES names it
  PROP-CFG-03's home and calls it absent.
- The four cardinality oracles read `toHaveLength(6)` at `advisoryDisabled.test.js:629`,
  `advisoryQueueSeams.test.js:634`, `advisoryHarvest.test.js:578` and `:733` — six, not five, and
  seven-ish lines below every pin PROPERTIES records.

This does not invalidate a single property. PROP-SEAM-02 asserts that cardinality surfaces are
coupled to `ADVISORY_SEAMS`, and that coupling is exactly what makes the suite red at HEAD — the
property is being *demonstrated* by the drift, not contradicted by it. What is invalidated is
PROPERTIES' account of the oracle *baseline*: a te- or se-author reading §"File existence, verified
at HEAD" is told to author two files that are on disk, and reading derivation rule 1 is told to go
retarget four `(5)` literals that already read `(6)`. Both statements were true when written and
are false now; both are load-bearing for Phase I sequencing, which is why F-01 is High rather than
a bookkeeping nit.

The fix is small and does not reopen anything: restate the two grounding paragraphs the way TSPEC
§1.3 and §5.1 restated theirs — describe HEAD, name the residue, and say that `new` and the
transcription list describe the required end state rather than outstanding work. The disposition of
`e3b9d5a3` (revert, or re-derive PLAN's A6 batches around it) is PLAN's and Phase I's call in both
documents; PROPERTIES should not decide it, only stop asserting the pre-`e3b9d5a3` baseline as
current.

One oracle-adjacent citation is unchanged and still off the DEC-DOC-01 bar: PROP-CFG-03 and the
Example-config fixture row cite `ci-arrangement.test.js:39` and `:799`–`:819` as raw `file:line`
anchors where a symbol or a block title would hold. Inherited, Low, `Process`, non-gating — and now
the last such pair in this feature's PROPERTIES, since TSPEC re-anchored its own.

## Fixtures

The fixture inventory was re-read against the moved upstream text; it comes through the cascade
intact.

- **Config fixtures** (`waveBudgetPerRun` at `1`, `0`, `-1`, `1.5`, `"x"`, `null`, absent; plus
  tier-off and tier-on-A6-off whole-config arms) still match TSPEC §4.4's key table and validator
  after the affordance rewording. The tier-on-A6-off arm is the fixture that proves the
  *behaviour* TSPEC now says is the affordance's only carrier — so the rewording strengthens this
  fixture's justification rather than stranding it.
- **Example-config fixture** — the tracked `.claude/pdlc.config.example.json` read by the
  engine-channel test. TSPEC §5.1 still routes this assertion to the purpose-named new engine file
  and still keeps `ci-arrangement.test.js` unowned by PLAN, which is what this fixture row assumes.
  Its `:39` / `:799`–`:819` anchors are the DEC-DOC-01 residue noted above (F-03).
- **Pre-A6 baseline** — the halt-reason string, queue row and created-file set captured from the
  shipped pipeline. Worth one caution rather than a finding: "captured from the shipped pipeline on
  the same inputs" is a *runtime* capture, so it is unaffected by `e3b9d5a3`'s test-side edits, but
  the transcribed gate-failure literal should be re-verified against `orchestrate-dev.js` at
  whichever commit Phase I opens on, since that file is the half that has **not** moved.
- **Mutation, ownership-manifest, gate-output and citation-floor fixtures** trace to TSPEC §3.3,
  §3.4, §5.2 and §5.5 — none of which this erratum round touched. No re-verification owed.
- **Verbatim-string discipline** — the eight refusal reasons pinned byte-for-byte against
  `orchestrate-dev.js:2297`–`:2306`. The production side of `orchestrate-dev.js` is confirmed
  unmoved by TSPEC §1.3 ("the production side did not move"), so these remain valid; they are the
  one place where a raw line pin is defensible-adjacent, though a symbol anchor would still be
  cheaper to maintain when this section is next edited.

No fixture named by PROPERTIES depends on the pre-`e3b9d5a3` test-side baseline, which is why the
cascade damage is confined to the two grounding paragraphs and does not reach the fixture plan.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | §"File existence, verified at HEAD" states that `pdlc/workflows/__tests__/advisoryWaveGate.test.js` and `pdlc/engine/__tests__/advisory-config-example.test.js` "are both absent at HEAD and both are explicitly planned as new by A6-00 and A6-04". Both files exist at HEAD (1.8 K and 2.5 K), and TSPEC §5.1's new *Status column caveat* now says so explicitly: `edited` and `new` "describe each file's required end state, not work outstanding … both are on disk, the latter red because `.claude/pdlc.config.example.json` carries no `advisory` section at HEAD". PROPERTIES now asserts the negation of its upstream, under a heading that claims HEAD verification. **Fix:** restate that paragraph the way TSPEC §5.1 restated its own — both files exist at HEAD, `new` denotes required end state, the disposition of the early-landed edits is PLAN's and Phase I's call (TSPEC §1.3) — and keep the closing invariant ("no property names a file that neither exists nor is planned"), which still holds | AC-6.1, AC-6.2, C-2 |
| F-02 | Medium | Local | Derivation rule 1 names four cardinality sites "verified at HEAD" as `expect(rows).toHaveLength(5)` at `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571` and `:726`. At HEAD all four read `toHaveLength(6)`, at `:629`, `:634`, `:578` and `:733`. TSPEC §1.3 has already absorbed this — it re-anchored the same four pins to block titles per DEC-DOC-01 and records them as already transcribed. PROP-SEAM-02 itself is unaffected (the document says the *rule*, not the snapshot, is what the property carries), which is why this is Medium and not High. **Fix:** re-anchor to the block titles TSPEC §1.3 now uses, and state the sites as already-transcribed-and-red rather than as pending `(5)`→`(6)` edits | AC-1.1, AC-6.1 |
| F-03 | Low | Process | PROP-CFG-03 and the Example-config fixture row cite `ci-arrangement.test.js:39` and `:799`–`:819` as raw `file:line` anchors; neither is runtime-measured evidence, so DEC-DOC-01 asks for the resolving symbol or the block title instead. Carried forward from v2/v3 unchanged; still non-gating, and best absorbed by whichever edit lands F-01 and F-02 rather than by a round of its own | AC-7.2 (`DECISIONS-review-severity-bars.md`, DEC-DOC-01) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC §1.3 and §5.1 both route the disposition of `e3b9d5a3` — revert the early-landed test edits, or re-derive PLAN's A6 batches around them — to PLAN and Phase I. Once PLAN decides, does PROPERTIES owe anything beyond the grounding restatement in F-01? My read is no: every property is stated over the required end state, so a revert and a re-derivation both leave the property set identical. Worth a one-line confirmation from the te-author rather than an assumption |
| Q-02 | PROP-SEAM-02's snapshot of *four* cardinality sites is now the third document to carry a copy of that list (REQ-adjacent §1.3, TSPEC §1.3, here). Should the count live in exactly one place — TSPEC §1.3, which both other documents already defer to — with PROPERTIES citing the rule and the section rather than re-listing the sites? This is a durable-shape question for harvest, not a change request for this round |

## Positive Observations

- **The property set survived a two-document upstream move without a single semantic drift.** REQ
  restated NFR-4 and TSPEC reworded §4.4's affordance — both the kind of edit that usually strands a
  downstream property — and neither reached a `PROP-*` row. PROP-CTR-10's slow-gate companion run is
  now *better* justified than it was under the old NFR-4 wording, and PROP-CTR-13 asserts the
  behaviour that TSPEC now says is the `0` affordance's only carrier. That is a document that
  compressed the *criteria* rather than the prose around them.
- **PROP-CFG-03 called the `ci-arrangement.test.js` question correctly before upstream did.** It
  parks the example-config assertion in a purpose-named file and leaves `ci-arrangement.test.js`
  unowned; TSPEC §5.1 and §4.4 have since restated the same disposition twice, in this round's own
  words. Downstream converging on upstream is the healthy direction of travel.
- **The drift that did land is confined and self-limiting.** PROPERTIES itself says the derivation
  *rule*, not the four-site snapshot, is what PROP-SEAM-02 carries — so the one paragraph that went
  stale had already told the reader not to lean on it. Only the file-existence paragraph asserts
  HEAD state without that hedge, and it is one paragraph.
- **AC-6.2's trace chain is still intact end to end** after the round: AC-6.2 → PROP-REC-03/-04/-07
  → A6-17 → `advisoryEscalationLog.test.js`, which §5.1 still carries as an `edited` file. The v3
  confirmation walked this chain; nothing in v1.9 or v1.10 broke a hop.

## Recommendation

**Needs revision** — on one High finding, with a narrow and fully-specified remedy.

PROPERTIES is still a faithful compression of the *decisions* in TSPEC and REQ at HEAD. What it is
no longer faithful to is upstream's account of the *baseline* those decisions will be implemented
against: TSPEC §1.3 and §5.1 were re-grounded on HEAD in this round, and PROPERTIES' two
corresponding grounding paragraphs were not, so the two documents now say opposite things about
whether two named test files exist.

Exactly what must change, and nothing else:

1. **F-01 (High)** — restate §"File existence, verified at HEAD": both new-status files exist at
   HEAD; `new` denotes required end state, not outstanding work (mirroring TSPEC §5.1's Status
   column caveat); the disposition of `e3b9d5a3` is PLAN's and Phase I's. Keep the closing
   invariant sentence.
2. **F-02 (Medium)** — re-anchor derivation rule 1's four sites to the block titles TSPEC §1.3 now
   uses, and describe them as already transcribed and red, not as pending `(5)`→`(6)` edits.
3. **F-03 (Low, Process)** — replace the `ci-arrangement.test.js:39` / `:799`–`:819` raw anchors
   with the resolving symbol or block title while the file is open.

Do not re-open the property set, the AC map, the fixture plan or the `e3b9d5a3` disposition. This
is a grounding restatement of two paragraphs, mirroring one upstream has already made.

FINDING: High | delta | local | "File existence, verified at HEAD" | claims `advisoryWaveGate.test.js` and `pdlc/engine/__tests__/advisory-config-example.test.js` are "both absent at HEAD"; both exist at HEAD and TSPEC §5.1's new Status-column caveat now says so explicitly — PROPERTIES asserts the negation of its upstream under a HEAD-verified heading
FINDING: Medium | delta | local | Derivation rule 1 (cardinality surfaces) | the four sites named "verified at HEAD" as `toHaveLength(5)` at `:622`/`:627`/`:571`/`:726` all read `toHaveLength(6)` at `:629`/`:634`/`:578`/`:733`; TSPEC §1.3 already re-anchored and re-grounded the same four pins this round
FINDING: Low | inherited | nonlocal | PROP-CFG-03 and the Example-config fixture row | raw `file:line` citations `ci-arrangement.test.js:39` and `:799`–`:819` where a symbol or block title would hold (DEC-DOC-01); non-gating, absorb with the F-01/F-02 edit

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
