# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/harden-harvest-guard/PROPERTIES-harden-harvest-guard.md (v1.0)
**Date:** 2026-07-02
**Iteration:** 1

## Review basis

Verified against REQ v1.7 (Canonical Matrix M01–M90, S01–S07), FSPEC v1.4, TSPEC v1.1 (§§ 3.1–3.4, 6.1–6.6, § 7 traceability), PLAN v1.1 (TASK table, DoD bullets, iteration-1 disposition), DECISIONS v1.2 (DEC-01–DEC-10, CFD-1–CFD-8), and the pdlc DoD coverage criterion (dod-verify SKILL.md criterion 4). No `docs/_constraints/` or `docs/_decisions/` exist in this repo (checked 2026-07-02).

### Coverage matrix — mechanical verification (passed)

Every REQ requirement has ≥ 1 property, checked requirement-by-requirement, not by trusting the doc's own table:

| Requirement | Properties found | Verdict |
|---|---|---|
| REQ-GUARD-01 (P0) | PROP-DEC-01/-02/-03/-04/-05 | Covered |
| REQ-GUARD-02 (P0) | PROP-DEC-03/-05, PROP-DEG-01 | Covered |
| REQ-GUARD-03 (P0) | PROP-GIT-01/-02/-03/-04 | Covered — all ten G-states mapped to rows (M37, M38, M39, M35, M57, M33, M34, M01, M36, M40/M58/M59); the map is total |
| REQ-GUARD-04 (P1) | PROP-SCOPE-01/-02 | Covered (S01–S07, both polarities + basename filter) |
| REQ-GUARD-05 (P0) | PROP-TEST-01/-02/-03/-04, PROP-DEC-02 | Covered — the four-meta-test accounting matches PLAN v1.1 DoD bullet 2 and CFD-7's standalone-meta-test-4 shape exactly |
| REQ-GUARD-06 (P0) | PROP-DEG-01/-02, PROP-DEC-01 | Covered — incl. the M71 DEGRADED-over-PARSE_ERROR precedence and the M78/M81 presence-vs-falsiness boundary |
| REQ-GUARD-07 (P0) | PROP-MSG-01/-02/-03 | Covered — substring conjuncts match TSPEC § 6.3 + CFD-3 (`then commit`, `ailing closed`, `interpreter`) + CFD-4 (`piped input`, M21) |
| REQ-GUARD-NFR-01 (P0) | PROP-DEC-04, PROP-MSG-02 | Covered, in the worst-case fixture the REQ ACs demand |
| pdlc DoD coverage criterion | PROP-COV-01 | Covered as a recorded measurement decision (see F-02) |

Spot-checks that passed: PROP-DEC-03's P-QUOTE list (M01, M04–M07, M47–M51, M53–M54, M60–M63, M90 = 17 rows × 2 = 34) matches TSPEC § 6.6 verbatim; PROP-MSG-02's ALLOW-row enumeration is complete against the REQ matrix; Δ2's six P-DET representatives cover all four verdict classes plus both full-engine reasons; Δ3's excluded-class enumeration (M08, M48–M51, M63 content-token-free; M65/M66/M80 ambient-cwd; RR-7) is accurate against the actual row texts — including the correct *inclusion* of M64 (whose stdin `cwd` carries a `docs/` token) — and the ≥ 40 floor is consistent with the ≈ 49 qualifying rows; `SELF_TEST_MIN_CASES = 38` and its 11+11+5+11 derivation match PLAN TASK-05/CFD-6; the PROP-COMPAT-05 retirement matches TSPEC § 6.5's directive and the REQ-GUARD-05 migration note, with PROP-COMPAT-04 retained. Source version pins (REQ v1.7, FSPEC v1.4, TSPEC v1.1, PLAN v1.1, DECISIONS v1.2) are all current.

### AC-fidelity check on PROP-COV-01 (the challenged item)

The ≥ 85% branch-coverage criterion is pipeline-owned (dod-verify criterion 4), not a REQ AC of this feature — no REQ P0 is re-scoped. The measurement impossibility is real and was decided *upstream*, in reviewed artifacts this document merely inherits: DEC-01/DEC-02 (single-file bash + heredoc-embedded Python deployable; sibling `.py` rejected), DEC-01 alternative 3 (hypothesis/fast-check rejected for the stdlib-only floor; finite enumerable corner space → parameterized tables), TSPEC § 6.6. jest/istanbul instruments JS only; the production deliverables are bash and stdin-fed embedded Python that no toolchain instrumenter reaches without splitting the deployable those decisions deliberately keep whole. PROP-COV-01 does not hide the gap: it names the proxy mechanism (matrix-row totality enforced by meta-tests, the 38-case self-test floor, the property tables) **and enumerates the known-untested surfaces by name** (wrapper no-interpreter `--self-test` branch — PLAN TE Q-02 accepted; Python internal-error catch-all — no constructible trigger, contract carried by M41's template assertions; scope-check grep-unavailable path beyond Δ4). That is the opposite of silent re-scoping — it is a checkable evidence standard, arguably stronger than a bare percentage for this artifact class. Accepted, with the framing correction in F-02.

### Architecture deltas Δ1–Δ5 vs TSPEC-sanctioned conventions

Δ2 (P-DET), Δ3 (P-DEG), Δ4 (P-SCOPE-DEG-01) are genuine § 6.6 supplementary-layer additions (non-row titles, outside matrix accounting, zero new dependencies, same files — the P-D1/P-QUOTE precedent) and none changes a verdict, reason code, or matrix expectation. Δ3/Δ2 respect REQ-GUARD-05's exactly-one-test-per-row invariant on the same footing as the REQ's own M33 re-run sanction. Δ5 preserves PLAN v1.1's "four distinct countable meta-test titles" requirement (it is an added assertion, explicitly not a fifth meta-test). Δ1 strengthens an oracle to behavior TSPEC § 3.3 already specifies. See F-01/F-03 for the two framing defects.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **PROP-MSG-02/Δ1 mis-cites BR-01-4 as its source.** FSPEC v1.4 BR-01-4 states "Allow = exit 0, **no output contract**" — it explicitly declines to constrain allow-path output. The allow-silence contract the property enforces actually derives from TSPEC § 3.3 ("Block messages on stderr only; nothing on stdout"), which the property also cites and which fully sanctions the strengthened `expectAllow`. Substance is fine (a strengthening, not a weakening, and TSPEC-backed); the trace is wrong and could mislead a future editor into believing the FSPEC mandates allow-silence. Fix: trace PROP-MSG-02 and Δ1 to TSPEC § 3.3 (and § 3.2's silent degraded-allow) and drop or correct the BR-01-4 citation. | FSPEC BR-01-4, TSPEC § 3.3 |
| F-02 | Low | Process | **PROP-COV-01's "binding for dod-verify" phrasing overreaches the document's authority.** A feature-level PROPERTIES doc records a measurement decision; it cannot bind the pipeline's DoD verifier or instruct it what not to demand ("A DoD verifier should check this list rather than demand an instrumenter number"). Reword as a recorded measurement decision with evidence for the verifier to weigh. Process signal for harvest: dod-verify criterion 4 assumes instrumentable Python/TS toolchains and has no sanctioned path for non-instrumentable artifact classes (bash, heredoc-embedded scripts); this feature's structural-proxy-plus-named-untested-surfaces pattern is the durable answer and should be promoted so the next bash-deliverable feature doesn't re-derive it. | pdlc DoD criterion 4 (dod-verify SKILL.md) |
| F-03 | Low | Local | **Delta preamble overclaims: "Everything below fits the TSPEC § 6.6 supplementary-layer conventions."** True for Δ2/Δ3/Δ4. Δ1 amends the **§ 6.2** fixture-library helper contract (`expectAllow` — the oracle of every ALLOW matrix row, not a supplementary test), and Δ5 amends the **§ 6.3** self-audit mechanism. Both are behavior-neutral strengthenings and acceptable, but the preamble should name them as § 6.2/§ 6.3 amendments so se-implement treats `guardFixtures.js` and meta-test 1 as changed contracts rather than purely additive test tables, and so a future TSPEC touch reconciles § 6.2's `expectAllow` comment with the strengthened semantics. | REQ-GUARD-05, TSPEC §§ 6.2/6.3/6.6 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Δ4 leaves stderr unconstrained for the scope check's interpreter-missing path, while REQ-GUARD-06 case 3 describes that path as "a silent no-op." The interpretation recorded (advisory contract = stdout channel; external-tool resolution noise out of scope) is defensible — case 3 also states only the blocking guard is subject to the requirement — but please confirm with te-author/se-author that "silent" was never intended to cover stderr, or tighten Δ4 to assert it if the § 5 design makes that achievable under an empty PATH. |

## Positive Observations

- The division-of-labor framing (matrix rows as the per-cell oracle; PROPERTIES stating only cross-row invariants an implementation could violate while passing individual examples) is exactly the right altitude for this pipeline and avoids duplicating the REQ's 97-row oracle.
- Mechanical-derivation discipline throughout: the P-DEG table is filtered from `MATRIX` by reimplementing the § 3.2 predicate rather than hand-copied, with a loud floor (`P_DEG_MIN = 40`) — the same anti-vacuity pattern as CFD-6, applied consistently.
- Honest evidence labeling: PROP-GIT-03 and PROP-TEST-03 explicitly distinguish mechanically asserted invariants from construction-discipline invariants verified by review at the TASK-14 gate, instead of overclaiming runtime enforcement.
- The residual-risk classes (RR-1–RR-7) are correctly property-free on their bypass side, with their *allow* behavior pinned — the coverage-matrix closing paragraph states this trade explicitly rather than leaving the gap unexplained.
- PROP-COV-01's named-untested-surfaces list is precise, cross-referenced to accepted dispositions (PLAN TE Q-02, TSPEC § 3.3), and diff-checkable — the strongest honest form the coverage evidence can take for this artifact class.

## Recommendation

**Approved with minor changes**

Three Low findings; no High or Medium. F-01 and F-03 are wording/traceability corrections in the PROPERTIES doc; F-02 is a one-phrase reframe plus a harvest-time process note. None changes a property, verdict, reason code, or binding.
