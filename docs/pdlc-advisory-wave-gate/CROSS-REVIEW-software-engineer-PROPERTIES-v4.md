# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 4 (upstream-cascade confirmation — PROPERTIES bytes unchanged; TSPEC moved v1.8 → v1.10)

## Overview

This is an **upstream-cascade confirmation**, not a re-review. PROPERTIES' own bytes are unchanged
since the v3 approval (`REVIEWED-COMMIT: 87d4c233`, `sha256:08ad37cc…` at HEAD). What moved is
TSPEC: my v3 anchor recorded `UPSTREAM-STATE: TSPEC sha256:79777fa6…` (v1.8, commit `18000ae4`);
HEAD carries `sha256:1531143c…` (v1.10). I re-read my v3 cross-review, then read
`git diff 18000ae4 HEAD -- .../TSPEC-…md` in full (14 hunks) and re-read the edited §1.3, §3.2,
§4.4, §5.1 and §6 regions at their current bytes.

Two upstream anchors other than TSPEC also moved since v3 and I checked them because DEC-ERR-03
scopes me to *upstream at HEAD*, not to the dispatched item list: REQ moved `a10396e8…` →
`817b6745…` (v1.9, restoration round) and DECISIONS/PLAN moved as well. FSPEC is byte-identical.
Nothing in REQ v1.9 is cited by a PROPERTIES row in a way the restoration disturbs — REQ §5's C-2
still carries `waveBudgetPerRun` default `1`, which is what PROP-CFG-01/-02 assert — so no finding
below is REQ-driven.

The single question: **does PROPERTIES still hold as a faithful compression of TSPEC as it now
stands?** It does not. The v1.10 edit's largest move is not a wording repair — it is a re-grounding
of §1.3 and §5.1 **on the branch as it actually stands**, recording that commit `e3b9d5a3` already
landed almost all of A6's test-side transcription ahead of Phase I, that the production side did
not move, and that the workflows suite is therefore **red at HEAD**. PROPERTIES' Overview and
PROP-SEAM-02 still describe the pre-`e3b9d5a3` world, and they do so with explicit
*"verified at HEAD"* / *"verified absent at HEAD"* claims. Those claims are now false against the
same HEAD their upstream just re-grounded on, which is exactly the class DEC-ERR-03 makes a finding
of this confirmation. Two High findings follow; both are repairs of current-state prose, and
neither reopens a settled property or its oracle.

## Properties

No property *statement* is disturbed by the v1.10 edit. Each property below is checked against the
upstream text it now leans on, at its current version.

- **PROP-SEAM-02** (`:73`) traces to TSPEC §1.3 and enumerates the coupled transcription surfaces
  by raw line pin. §1.3 is the section v1.10 rewrote hardest: it now carries a new
  *"State of these surfaces at HEAD"* table stating that `advisoryEnvelope`, `advisoryConfig`,
  `advisoryDriver`, `advisoryHarvest`, `consolidationProperties`, `helpers/advisoryDoubles` and
  **all four bare row-count sites** already carry their six-member form at HEAD, with only
  `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality untranscribed. The property's
  *claim* survives that unchanged — the surfaces are still transcription surfaces and must still
  read six as one set. What does not survive is the anchoring, see F-02/F-03.
- **PROP-SEAM-01, PROP-CTR-01, PROP-ENV-01, PROP-ENV-10** trace to TSPEC §3.1, untouched by v1.10.
  Unchanged and still faithful.
- **PROP-CTR-13 / PROP-CFG-02** lean on §4.4's `waveBudgetPerRun: 0` arm. v1.10 rewrote §4.4's
  prose — `0` is now an *"intended operator configuration (honoured, not documented anywhere
  operator-facing this feature ships)"* rather than a *"documented operator affordance"*, and §6's
  close was reworded to match. I checked both properties against the new wording: neither asserts
  anything about documentation or about the example file *teaching* the affordance. They assert
  behaviour — `0` survives validation and reads back `0`; the tier stays enabled, the wave escalates
  `budget-exhausted` with zero `_agent` calls, and `report.advisory` is present with the sixth row
  at zero. That is precisely the guarantee §4.4 still makes ("what the feature does guarantee about
  `0` is behavioural and fully asserted"). No cascade.
- **PROP-CFG-03** leans on §4.4 and §5.1. v1.10 narrowed §5.1's example row to
  *"the shipped-default pairing only — it does not teach E-33's `0`-with-`enabled: true`
  affordance"*. PROP-CFG-03 asserts only that the whole `advisory` section is present, parses,
  carries both keys and holds a non-negative integer, plus the `testCommand` blast-radius conjunct.
  Still a faithful compression; its `ci-arrangement.test.js` pins have drifted (F-04).
- **PROP-DIS-06's neighbours and §3.2 step 2's `.enabled` constraint.** v1.10 re-anchored §3.2's
  three `.enabled` sites from `orchestrate-dev.js:3258` / `:13678` / `orchestrate-queue.js:1318` to
  symbol anchors, and quoted the queue-side conjunction in full. PROPERTIES carries no line pin into
  those three sites and states the constraint behaviourally, so it inherits the repair for free.
- **PROP-REC-07** — the subject of the v3 confirmation — is untouched by this edit and still holds.

## Oracles

I re-verified every anchor PROPERTIES offers as an oracle site against HEAD, in one pass rather
than one per round.

| PROPERTIES anchor | State at HEAD | Verdict |
|---|---|---|
| `advisoryDisabled.test.js:622` (bare count) | assertion is at `:629` and reads `toHaveLength(6)` | drifted **and** inverted |
| `advisoryQueueSeams.test.js:627` | at `:634`, reads `toHaveLength(6)` | drifted and inverted |
| `advisoryHarvest.test.js:571` | at `:578`, reads `toHaveLength(6)` | drifted and inverted |
| `advisoryHarvest.test.js:726` | at `:733`, reads `toHaveLength(6)` | drifted and inverted |
| `advisoryHarvest.test.js:573` (seam literal) | `:573` is `_runAdvisorySeam,` | drifted |
| `helpers/advisoryDoubles.js:271` (`SEAMS` literal) | `:271` is a bare `//` comment line | drifted |
| `advisoryRecord.test.js:496` | still `["A1"…"A5"]` ordered equality | correct — and the one surface §1.3 agrees is untranscribed |
| `advisoryRecord.test.js:544` | `test.each([… "A6"])` — already six | correct pin, stale premise |
| `advisoryDriver.test.js:221`, `:846` | `GATE_EXCLUSIVITY_REGISTRY` decl / set-equality `it` | correct |
| `consolidationProperties.test.js:250` | six-member `rng.pick` list | correct pin, already transcribed |
| `ci-arrangement.test.js:39` | `const configPath = …pdlc.config.example.json` | correct |
| `ci-arrangement.test.js:799`–`:819` | the two `testCommand` regexes are at `:798` and `:807`; `:819` is unrelated comment text | drifted |

Two conclusions. First, the *"All four such sites are verified at HEAD"* sentence in the Overview's
derivation rule 1 is false in both coordinates at once — the lines moved and the values flipped
from `5` to `6`. Second, the two files PROPERTIES records as *"verified absent at HEAD"* both exist:
`pdlc/workflows/__tests__/advisoryWaveGate.test.js` (1.8K) and
`pdlc/engine/__tests__/advisory-config-example.test.js` (2.5K). TSPEC v1.10's new §5.1 Status-column
caveat says exactly this — *"both `new` files already exist at HEAD … both are on disk"* — so this
is not a PROPERTIES-only staleness, it is a direct contradiction of the upstream text PROPERTIES
compresses.

The oracle *designs* are unaffected: every one of these is a set-equality or a cardinality
assertion whose form PROPERTIES fixes correctly, and none of the drift changes which oracle owns
which property. The repair is to the current-state prose and the anchors, not to the oracles.

## Fixtures

PROPERTIES' §"Fixtures and generators" rows were re-checked against the upstream sections they
cite at their current bytes.

- **Config fixtures** (`:283`) — `waveBudgetPerRun` at `1`, `0`, `-1`, `1.5`, `"x"`, `null`, absent,
  plus the tier-off and tier-on-A6-off whole-config arms, citing TSPEC §3.1 and §4.4. §3.1 is
  untouched by v1.10; §4.4's rewrite narrowed a *rationale* claim, not the key table's type,
  default or validator (`integer ≥ 0`, `1`, `nonNegativeInt` — unchanged). The fixture set still
  covers exactly the arms §4.4 requires, including the `0` arm the rewrite went out of its way to
  keep behaviourally guaranteed. No cascade.
- **Example-config fixture** (`:284`) — reads the tracked `.claude/pdlc.config.example.json` and
  names `ci-arrangement.test.js:39` and `:799`–`:819` as the pre-edit baseline. The *design* here
  survives v1.10 intact: §5.1 still routes the new assertion to the purpose-named
  `advisory-config-example.test.js` and still keeps `ci-arrangement.test.js` unowned. But the
  `:799`–`:819` range no longer points at the `testCommand` regex pair (F-04), and the fixture's
  implicit premise that the engine-channel file is yet to be authored is contradicted by §5.1's new
  caveat (folded into F-01).
- **Fixtures for the seam's own behaviour** — the `_agent` / `_git` / `_runCommand` doubles and the
  snapshot round-trip fixture cite §5.2, which v1.10 did not touch. Unchanged.

One fixture-adjacent gap the re-grounding creates and PROPERTIES cannot currently express: because
`e3b9d5a3` landed the test half without the production half, the workflows suite is red *before*
Phase I opens, so a "these oracles go red on the first constant edit" framing no longer describes
the baseline a Phase I author will meet. TSPEC v1.10 routes the *remedy* (revert vs. re-derive
PLAN's A6 batches) to PLAN, and I agree that is not PROPERTIES' call. What is PROPERTIES' call is
not asserting a HEAD state that is no longer the HEAD state; that is F-01/F-02, and it is a prose
repair, not a fixture redesign.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | Overview records `advisoryWaveGate.test.js` and `advisory-config-example.test.js` as "verified absent at HEAD"; both are on disk at HEAD, and TSPEC v1.10 §5.1's new Status-column caveat says so explicitly. PROPERTIES contradicts the upstream text it compresses. | Overview, "Where the tests live" (`:33`–`:39`) |
| F-02 | High | delta | local | Derivation rule 1 asserts the four bare row-count sites are "verified at HEAD" asserting `toHaveLength(5)`; all four read `toHaveLength(6)` at HEAD, which is what TSPEC v1.10 §1.3's new "State of these surfaces at HEAD" table records. The rule's claim is sound; its HEAD grounding is inverted. | Overview, derivation rule 1 (`:51`–`:55`); PROP-SEAM-02 (`:73`) |
| F-03 | Medium | delta | local | TSPEC v1.10 re-anchored §1.3's and §3.2's line pins to stable content per DEC-DOC-01 precisely because `e3b9d5a3` drifted them; PROP-SEAM-02 still carries the raw-line form and six of its pins are wrong at HEAD. | PROP-SEAM-02 (`:73`) |
| F-04 | Low | inherited | nonlocal | PROP-CFG-03 and the example-config fixture pin `ci-arrangement.test.js:799`–`:819` for the `testCommand` regex pair; the pair is at `:798` and `:807`, and `:819` is unrelated comment text. | PROP-CFG-03 (`:165`), Fixtures (`:284`) |
| F-05 | Low | inherited | nonlocal | Overview Scope still derives from "TSPEC v1.6 (§2–§5)"; TSPEC is v1.10. Carried from v3 F-01 and now two versions staler. | Overview, Scope (`:25`); version table (`:12`) |

FINDING: High | delta | local | Overview "Where the tests live" | both files recorded "verified absent at HEAD" exist at HEAD, contradicting TSPEC v1.10 §5.1's Status-column caveat
FINDING: High | delta | local | Overview derivation rule 1 / PROP-SEAM-02 | the four bare row-count sites are asserted "verified at HEAD" at `toHaveLength(5)`; all four read `6` at HEAD per TSPEC v1.10 §1.3's re-grounded table
FINDING: Medium | delta | local | PROP-SEAM-02 | raw line pins retained where TSPEC v1.10 re-anchored §1.3 to stable content per DEC-DOC-01; six of the pins are wrong at HEAD
FINDING: Low | inherited | nonlocal | PROP-CFG-03 / Fixtures | `ci-arrangement.test.js:799`–`:819` no longer spans the `testCommand` regex pair (now `:798`, `:807`)
FINDING: Low | inherited | nonlocal | Overview Scope | derivation still cites TSPEC v1.6; TSPEC is v1.10

**What must change.** F-01 and F-02 are current-state sentences, not properties: restate the two
"verified …at HEAD" claims to describe HEAD as TSPEC §1.3 and §5.1 now describe it — the
transcription largely landed early via `e3b9d5a3`, the production side did not, the suite is red at
HEAD, and `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality is the one test-side literal
still untranscribed. F-03 follows the same repair: re-anchor PROP-SEAM-02's pins to symbol or
block-title anchors, as TSPEC just did, rather than re-numbering lines that will drift again. No
property statement, level assignment, oracle form or PLAN home changes.

## Recommendation

**Needs revision** — two High findings. The v3 approval does not carry to TSPEC v1.10 as written.
The gap is narrow and mechanical: PROPERTIES' properties are still right, but its HEAD grounding is
now the opposite of its upstream's, and a Phase I author trusting either sentence would look for
work already done and expect a green baseline that is red.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 2}
