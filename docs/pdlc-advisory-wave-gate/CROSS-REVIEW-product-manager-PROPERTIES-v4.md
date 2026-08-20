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

*(pending)*

## Fixtures

*(pending)*

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*
