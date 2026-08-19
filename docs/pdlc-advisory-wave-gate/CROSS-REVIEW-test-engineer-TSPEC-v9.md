# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.8)
**Date:** 2026-08-19
**Iteration:** 9
**Scope:** Delta confirmation of the Phase PR erratum round (commit `a349767b`), plus upstream re-grounding per DEC-ERR-03. Not a full re-review.

## Delta Under Confirmation

One routed item, from se-review: §3.1's module-scope export list (`:502`–`:511`) omitted
`ADVISORY_SEAM_PHASES` while the prose below it required that table to gain an `A6` row, and the
shipped table is a module-private `const` at `orchestrate-dev.js:3108` — leaving PROPERTIES'
PROP-REC-07 with no executable unit contract.

**Resolved, and resolved in the direction I would have argued for.** The edit does not widen the
interface; it states the visibility that already holds and then names the oracle that makes the
missing row observable anyway. Checks I re-derived against HEAD:

| Claim in the delta | Verified |
|---|---|
| §3's preamble licenses the construction: "Every signature below is a module-scope export … unless marked *(module-private)*" (`:513`–`:515`) | Yes — the marker now appears on `ADVISORY_SEAM_PHASES`, so its absence from the export block is grammatical, not a gap |
| Shipped table is a bare `const`, not exported, at `orchestrate-dev.js:3108` | Yes — `const ADVISORY_SEAM_PHASES = Object.freeze({…})`, five rows A1–A5, no `export` |
| Fallback at `orchestrate-dev.js:3338` writes the literal `"unknown"` for **both** fields | Yes — `phase: placement ? placement.id : "unknown"` and the `phaseOutcome` line immediately beside it |
| PROPERTIES' PROP-REC-07 is written to the escalation-entry shape, not the constant | Yes — PROPERTIES `:157` reads "escalation-log **entry**, not constant", pins `I`/`halted` for A6, holds A3–A5 at `DOD`/`halted` and `PUB`/`halted`, and asserts the `unknown` arm as a negative control |
| Its home `advisoryEscalationLog.test.js` is already on §5.1's edited-files list | Yes — TSPEC `:1198` |
| PLAN task A6-17 owns that file | Yes — PLAN `:111` (RED task, AT-06-3/-5/-6) and the ownership manifest row at `:152` |

Nothing new is minted: no new test file, no new owning task, no new export, no batch movement.

## Findings

Three findings, none gating. One is created by this round's changelog; two are inherited from v8 and
were not touched by the edit.

| ID | Severity | Scope | Tags | Finding | Section ref |
|----|----------|-------|------|---------|-------------|
| F-01 | Medium | Local | inherited, nonlocal | **§5.1's stated set-equality with §1.3 is still false on disk.** §5.1's preamble (`:1183`–`:1184`) claims the two file sets are "set-equal … checked as equality in both directions, not containment". `advisoryQueueSeams.test.js` appears in §1.3's table (`:243`, the bare row-count retarget list) and has no §5.1 row. Coverage is not lost — PLAN A6-03's manifest owns the file and its `:627` count flip — so this is a false invariant in a map future authors read, not a test hole. Carried unchanged from TE TSPEC v8 F-01; this round did not touch §5.1 or §1.3. | §5.1 (`:1180`–`:1198`), §1.3 (`:243`) |
| F-02 | Low | Local | delta, local | **The v1.8 changelog reconciles against the v7 cross-reviews, not the v8 ones.** It states the upstream hashes match "the `UPSTREAM-STATE` anchors on both v7 cross-reviews" and disposes of "both v7 findings" (TE F-34, PM F-01/`ledgerAnchor`). The operative approvals are v8: TE v8 (`{"high":0,"medium":1,"low":1}`) and PM v8 (`{"high":0,"medium":1,"low":0}`), whose three findings — TE F-01, TE F-02, PM F-01's example-literal shape — get no disposition line. The hashes themselves are right (I re-derived both against the v8 anchors, below), so nothing substantive rides on this; the changelog just names the wrong round as the reconciliation baseline, which is exactly the kind of provenance line a later erratum wave trusts. | §Changelog v1.8 (`:14`–`:31`) |
| F-03 | Low | Local | inherited, nonlocal | **§3.2 step 2's line anchor is one line wide.** The doc attributes "Read once, reused everywhere below …" to `orchestrate-dev.js:13675`–`:13677`; the comment occupies `:13676`–`:13677`, while `:13675` is the `parseAdvisoryConfig(advisoryConfigRaw)` call. PLAN A6-18 copies the same range. Carried unchanged from TE TSPEC v8 F-02. | §3.2 step 2 (`:45`, `:602`) |

### Why the routed item is a real resolution, not a wording move

The old text created an oracle vacuum: PROP-REC-07 was named a *unit* contract over a constant the
test could not import. The fix does not paper over that — it relocates the proof onto a surface that
already exists and already discriminates the defect.

- **The oracle is positive-valued, not absence-shaped.** The A6 entry must read phase `I` and outcome
  `halted`. That is an exact status value, not `!= unknown`. The `unknown`/`unknown` arm is asserted
  separately as a negative control, which is the correct use of an absence-shaped string: as the
  *expected* value on a fixture engineered to produce it, never as the pass condition on the happy path.
- **The negative control is executable.** `runAdvisorySeam` is an exported function taking `seam` as a
  free string (`orchestrate-dev.js:3224`), so a fixture can dispatch a seam id with no table row and
  observe the fallback at `:3338` through the real append path. Had the seam id been closed over
  internally, this arm would have been unreachable and I would have flagged it; it is not.
- **It discriminates the omission it names.** Delete the `A6` row from the `const` and the entry reads
  `unknown`/`unknown` — the test goes red through the shipped writer. An `expect(TABLE).toHaveProperty("A6")`
  unit test would also go red, but only by restating the diff; it would stay green if the *caller* stopped
  consulting the table at all. The chosen oracle fails in both cases. This is the DC-07 production-path
  rule applied correctly.
- **The A3–A5 rows are held on the same suite.** Asserting `DOD`/`halted` and `PUB`/`halted` alongside
  A6 turns the new row into a non-regression check, so a sixth row added by clobbering the literal
  cannot pass quietly.
- **No export, and the refusal to export is argued from the oracle, not from taste.** §3.1 now says in
  as many words that the only reason to export would be to enable the constant-import oracle §5.6 and
  PROPERTIES both reject. That is the right ordering: the interface surface follows the proof strategy.

### Upstream re-grounding (DEC-ERR-03)

Both upstream documents are byte-identical to what I approved at v8, so nothing TSPEC compresses has
moved and no absorption was owed this round:

| Upstream | HEAD sha256 | v8 anchor | Match |
|---|---|---|---|
| REQ | `a10396e8…d9645` | `a10396e8…d9645` | yes |
| FSPEC | `82f74a2d…61c3e` | `82f74a2d…61c3e` | yes |

The REQ hash also equals the one carried in this dispatch. I re-read the AC-6.2 / AC-6.4 obligations
TSPEC §3.1 now leans on and the §10.1 *Pipeline state* field definition the table derives; the
document is still a faithful compression of both, and the delta narrows rather than widens what it
claims about them.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The negative-control fixture needs a seam id absent from `ADVISORY_SEAM_PHASES`. Once A6 lands, all six catalogued seams have rows, so the fixture must use a non-catalogue id (`"A9"` or similar) passed straight to `runAdvisorySeam`. That is executable today and I am not blocking on it, but §3.1 leaves the fixture's shape to Phase P — worth one clause naming it so the implementer does not reach for a catalogue seam and find the arm unreachable. |

## Positive Observations

- Resolving a "the export list is incomplete" finding by *narrowing* the claim rather than widening the
  interface is the right instinct, and rare. The easy fix was one `export` keyword; it would have added a
  public surface with no production reader purely to enable a test that restates its own fixture.
- The delta names the negative control explicitly. Most specs stop at the positive assertion and leave the
  falsifiability argument implicit; this one states what goes wrong when the row is missing and where the
  observation lands, which is what makes PROP-REC-07 checkable by someone who did not write it.
- Holding A3–A5's values on the same suite as the A6 assertion is a small choice with real regression value.
- Every anchor I spot-checked in the delta holds: `:3108`, `:3338` and both fallback field expressions,
  §5.1's `advisoryEscalationLog.test.js` row, PLAN A6-17's task and manifest rows, PROPERTIES' PROP-REC-07
  wording. No new file and no new owner is minted, so PLAN's batch DAG and single-writer-per-batch
  constraints are untouched by this round.

## Recommendation

**Approved with minor changes**

The routed item lands, and lands as a genuine testability improvement rather than a wording repair: an
unexecutable unit contract has been replaced with an executable integration oracle that carries positive
values, a negative control, and a non-regression companion. Upstream is unmoved and TSPEC remains a
faithful compression of it. No High finding. F-01 and F-03 are inherited non-gating items from v8 that
this round did not reach; F-02 is a provenance line in the round's own changelog. None blocks the phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:79777fa6310e87180c6901e9d1b87ddcb9f926147fefb9f07c52720d0c5ff8d6
APPROVAL-HASH-NORMALIZED: sha256:bc73cea449a7e223a2f343c6db612fb5221a7567cbbb50350e1e99397137bb14
REVIEWED-COMMIT: a349767b569c1a1d50052f3484cf6ecf1fe1f449
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
