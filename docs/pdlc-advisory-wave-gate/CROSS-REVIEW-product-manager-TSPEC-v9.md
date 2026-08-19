# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.8)
**Date:** 2026-08-20
**Iteration:** 9
**Scope:** Local

## Re-grounding on upstream HEAD

Checked before reading the delta, per DEC-ERR-03 — the question is whether the TSPEC is still a
faithful compression of upstream as it stands now, not merely whether the raised item landed.

| Upstream | HEAD sha256 | My v8 `UPSTREAM-STATE` anchor | Match |
|---|---|---|---|
| REQ | `a10396e8…d9645` | `a10396e8…d9645` | identical |
| FSPEC | `82f74a2d…61c3e` | `82f74a2d…61c3e` | identical |

Both also match the hashes carried in this dispatch. Neither upstream document moved a byte since
the state I approved at v8, so no upstream citation in the TSPEC can have gone stale, nothing
upstream was decided this round, and no absorption is owed. The v1.8 changelog says exactly this
and is true as written. I re-read AC-6.2 and AC-6.4 at HEAD against the sections this delta
touches, and the TSPEC's rendering of them is unchanged and faithful.

## Confirmation of the raised item

**Item (se-review):** §3.1's export list omitted `ADVISORY_SEAM_PHASES` while the prose below it
required that table to gain an `A6` row; the shipped table is a module-private `const` at
`orchestrate-dev.js:3108`, leaving PROP-REC-07 with no executable unit contract.

**Landed: yes.** Every factual claim the edit makes, I checked against the tree:

| Claim in v1.8 | Verified |
|---|---|
| The shipped table is a bare `const` at `orchestrate-dev.js:3108` | Yes — `const ADVISORY_SEAM_PHASES = Object.freeze({` at `:3108`, no `export`; the file's other advisory constants (`:1578`, `:1933`, `:1940`, `:1947`, `:2075`, `:2297`, `:2311`, `:2451`) are all exported, so the omission is a real distinction and not an accident of grep |
| The `unknown`/`unknown` fallback exists and is the negative control | Yes — `const placement = ADVISORY_SEAM_PHASES[seam]` then `phase: placement ? placement.id : "unknown"` at `orchestrate-dev.js:3338`, inside the `finalOutcome === "escalated"` branch, with the `phaseOutcome` line beside it |
| `advisoryEscalationLog.test.js` is already on §5.1's edited-files list | Yes — TSPEC `:1198`, AC-6.2/AC-6.4, carrying AT-06-3/AT-06-5/AT-06-6 |
| PROPERTIES maps PROP-REC-07 onto that file's owning PLAN task A6-17 | Yes — PROPERTIES `:157` names the file and `(A6-17)`; PLAN `:152` gives A6-17 that file, `:111` makes it the RED task for AC-6.2, `:397` lists PROP-REC-07 among its properties. No new file, no new owner |
| `*(module-private)*` is a defined marker, not new prose | Yes — §3's preamble already reads "Every signature below is a module-scope export … unless marked *(module-private)*". The delta uses the section's own existing convention |

The resolution direction is the right one from a product standpoint, and I want to be explicit
about why, because "add the export" was the cheaper-looking fix. Exporting the table would widen
this feature's public interface surface with no product consumer — no call site outside the module
reads it — purely to let a unit test import a frozen literal and assert it contains the row the
same commit added. That is a diff restated as a test, and it would prove nothing about what an
operator sees. The oracle the delta names instead — the written escalation entry reading phase `I`
/ outcome `halted`, with A3–A5 held at `DOD`/`halted` and `PUB`/`halted` on the same suite and the
`unknown` arm asserted as a negative control — is an assertion about the artifact AC-6.2 actually
promises the operator. It discriminates the omission it names and it needs no export. PROP-REC-07
is already written to that shape, so the delta reconciles the TSPEC toward PROPERTIES rather than
forcing PROPERTIES to move.

**Nothing previously approved is broken.** The edit is confined to the §3.1 paragraph and the
changelog. `ADVISORY_SEAMS` still gains `"A6"` in the exported list at §3.1 — that is a separate
exported constant and is untouched. §4.5's escalation-entry row (`:438`) reads phase and
phase-outcome "from `ADVISORY_SEAM_PHASES.A6` (§3.1)" and remains consistent, since it asserts a
read, not an export. OQ-12 (`:1594`), which closes the question of whether `outcome: "halted"` can
ever be a false record, is unaffected and still stands behind the entry the oracle now reads.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | *(Inherited, unchanged from v8 F-01 — this round did not touch it, and the v1.8 changelog's "PM F-01" refers to the v7 `ledgerAnchor` item, not this one.)* §5.1's `.claude/pdlc.config.example.json` row (`:1220`) still claims the shipped pairing "teaches E-33's `waveBudgetPerRun: 0` with `enabled: true` affordance", while the literal it pins one clause earlier is `{"enabled": false, "waveBudgetPerRun": 1}` — the example never shows `0`, and never shows `enabled: true`. The same overclaim appears at `:54` and `:1097`. No behavioural consequence: E-33's `0` is validated in code and asserted by AT-07-2b either way, so no operator-visible behaviour depends on this sentence. It is a rationale claim the artifact does not support, and the fix is to drop the "teaches" clause and say plainly that `0` is honoured and asserted but not documented — the resolution §4.4 already applies one paragraph below for the README. Does not gate. | FSPEC E-33, AT-07-2b |

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(Carried from v8 Q-01, still open and still non-gating.)* If operator discoverability of the `waveBudgetPerRun: 0` affordance is genuinely wanted, that is a product decision belonging in REQ/FSPEC with a named carrier, not in TSPEC rationale. Is "validated and asserted, undocumented" the accepted end state for this feature? A one-line answer in the erratum record would close it. |

## Positive Observations

- The delta resolves a real defect in the direction that keeps the interface honest. The tempting
  fix — export the constant so a test can import it — would have widened a public surface for a
  test that restates its own diff. Choosing the observable-entry oracle instead means AC-6.2's
  promise is what gets tested, and the interface stays exactly as shipped.
- Naming the negative control is what makes this a resolution rather than a rationalisation. A
  `phase`/`outcome` assertion alone would pass on a table with no `A6` row if the fixture happened
  not to exercise it; the `unknown`/`unknown` fallback at `:3338` gives the property something that
  fails when the row is missing. That is the difference between an oracle and a description.
- Telling Phase P in as many words to "transcribe the sixth row and leave the `const` unexported",
  and marking a PLAN task that adds `export` as outside this TSPEC's interface surface, is a
  pre-emptive close on the most likely downstream misreading. Cheap to write, expensive to
  discover in Phase I.
- The reconciliation mints no new file and no new owner — it lands on `advisoryEscalationLog.test.js`
  under A6-17, which already owned it. An erratum fix that changes no ownership is one that cannot
  perturb the batch-safety argument.
- Every line anchor in the edit resolved on first check. That has been true for several rounds now
  and is why these confirmations stay cheap.

## Recommendation

**Approved with minor changes**

The raised item is landed and verified against HEAD, and upstream is byte-identical to the state I
approved at v8, so the TSPEC remains a faithful compression of it. F-01 is an inherited Medium in
rationale prose with no behavioural consequence and does not gate.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
