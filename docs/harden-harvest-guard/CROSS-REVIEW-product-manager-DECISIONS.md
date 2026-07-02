# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/harden-harvest-guard/DECISIONS-harden-harvest-guard.md (v1.1)
**Date:** 2026-07-02
**Iteration:** 1

Upstream baseline read in full: REQ v1.7 (requirements, Residual Risk Register RR-1–RR-7/RR-W, Canonical Matrix M01–M90/S01–S07, all disposition tables), FSPEC v1.4 (FSPEC-GUARD-01/-02/-03/-04/-06, carry-forward table, dispositions), TSPEC v1.1 (§ 2, § 3.1 step 0, § 3.5, § 6.6 spot-checked), and both iteration-2 TSPEC cross-reviews (PM v2, TE v2). Checks performed: (1) every DEC-01–DEC-10 claim traced to REQ/FSPEC/TSPEC content or a named review finding — no unrecorded product-behavior change rides in any "Decision" or "Consequences" paragraph; (2) every consequences line either names its RR-register entry (RR-1 → DEC-06, RR-3/RR-6 → DEC-08, RR-5 → DEC-09, RR-7 → DEC-10) or states "No RR-register entry" with a checkable rationale — none silently dropped; (3) the carry-forward table CF-1–CF-7 reconciled item-by-item against the PM v2 (F2-01, F2-02) and TE v2 (F2-01–F2-05) Lows — complete, with the PM F2-01/TE F2-03 overlap correctly folded (CF-1/CF-5) and each disposition matching what the source finding asked for; (4) every cited matrix row (M14–M17, M20–M21, M37, M42–M46, M56, M62, M64–M68, M70–M77, M80, M82–M90) checked against the REQ matrix — all accurate; (5) reversibility and re-evaluation triggers read for product recognizability. Two Low cross-reference defects found; nothing behavioral.

## Traceability Verification (summary)

| DEC | Traces to | Verified |
|---|---|---|
| DEC-01 | TE TSPEC F-04 remedy; TSPEC § 6.6; CF-1 amendment matches PM v2 F2-01 / TE v2 F2-03 exactly (env-clear chosen, argc-gate named as sanctioned equivalent — both were offered by the reviews) | Yes |
| DEC-02 | TSPEC § 2 / § 3.3, C5/C16; ARG_MAX ≥ 256 KiB consequence stated in TSPEC § 2 verbatim | Yes |
| DEC-03 | REQ-GUARD-01 steps 1/5 (literal-vs-expandable rewrite, REQ v1.2); TSPEC § 3.5 data model | Yes |
| DEC-04 | FSPEC-GUARD-03 error-scenario boundary; C18/TE TSPEC F-06; M77 fail-open-class annotation | Yes (see F-02 on the CF-2 pointer) |
| DEC-05 | PM TSPEC F-01 (High) option (a); REQ v1.7 disposition table; M87–M89 promotion per TE F-09 process rule (recorded in FSPEC v1.1, quoted accurately) | Yes |
| DEC-06 | PM TSPEC F-04; REQ v1.7 `N>` extension; M90 | Yes (see F-01 on the CF-1 citation) |
| DEC-07 | SE FSPEC F-02 eager/lazy choice; REQ v1.5 preamble; M75/M76/M83/M85; false-block consequence honestly restated (SE F2-03 correction carried) | Yes |
| DEC-08 | RR-3 (REQ v1.4 clarification), RR-6 (REQ v1.7, PM TSPEC F-05); depth-8 cap = TSPEC § 3.5.2, M73 | Yes |
| DEC-09 | REQ-GUARD-01 step-4 union rule (REQ v1.3); RR-5 incl. `pushd`/`popd` extension; M17/M64–M66/M80/M85–M86 | Yes |
| DEC-10 | REQ-GUARD-06 case 1; RR-7; field-bleed named as normative consequence, matching the REQ's accepted-consequence wording; M42–M43/M68–M72 | Yes |

Carry-forward table: CF-1 (=PM F2-01 + TE F2-03), CF-2 (=PM F2-02), CF-3 (=TE F2-01, all three residual conjuncts carried: `commit`, fail-closed rationale, `interpreter`), CF-4 (=TE F2-02, fixed `piped input` marker — within TSPEC-owned prose latitude under REQ-GUARD-07, satisfying the "unresolvable operand" required content), CF-5 (fold marker), CF-6 (=TE F2-04, count-floor assertion), CF-7 (=TE F2-05, `bespoke: true` convention exactly as the finding specified). **Complete — no v2 Low is dropped, and no disposition goes beyond what its source finding sanctioned.**

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **DEC-06's consequences cite "the CF-1 lexical rule" — a colliding identifier that resolves to the wrong item inside this very document.** DEC-06 says fd-duplication and appends "remain never-destructive per the CF-1 lexical rule (M56, M62, M67, M15)". The intended referent is the **FSPEC's** carry-forward CF-1 (SE v4 F-01: the `>&` all-digits-or-`-` disambiguation, FSPEC-GUARD-02 rule 1, superseding REQ M62's phrasing; TSPEC § 3.5.1 also labels it "CF-1"). But this DECISIONS document defines its **own** CF-1 in the Carry-Forward Notes table — the self-test gate hardening — and CF-1..CF-7 is the namespace a reader of the binding disposition table resolves against. A future agent (or se-implement, for whom the CF table is declared binding) following "CF-1" from DEC-06 lands on the self-test gate, not the redirection rule. Secondary imprecision in the same clause: the `>>`/`N>>` **append** exclusion (M15) is not governed by the `>&` lexical rule at all — it is the separate append-is-not-destructive rule of REQ-GUARD-02. Fix: reword to "per the `>&` lexical disambiguation rule (FSPEC carry-forward CF-1 / FSPEC-GUARD-02 rule 1) — M56, M62, M67 — and the REQ-GUARD-02 append exclusion (M15)", or otherwise disambiguate the two CF namespaces. | REQ-GUARD-02; FSPEC-GUARD-02 rule 1; DEC-06 consequences |
| F-02 | Low | Local | **CF-2's binding instruction points the future REQ correction at the wrong FSPEC section.** CF-2 directs the next REQ touch to replace M77's known-wrong fixture parenthetical with "a reference to the FSPEC-GUARD-06 failure-vs-absence boundary". The failure-vs-absence boundary is defined in **FSPEC-GUARD-03**'s error-scenario row ("Operational boundary (failure vs absence): …"); FSPEC-GUARD-06 is block-message emission and only maps the query-failure path to `NOT_COMMITTED` — it does not define the boundary. DEC-04's own context paragraph cites FSPEC-GUARD-03 correctly, so the document is internally inconsistent about the owner. (The mis-citation is inherited verbatim from PM v2 F2-02 — this reviewer's own upstream wording — but CF-2 is the instruction a future pm-author will execute against the REQ, so the pointer must be corrected here rather than propagated.) Fix: one word — "FSPEC-GUARD-03 failure-vs-absence boundary (error-scenario row)". | REQ-GUARD-03 / matrix row M77; FSPEC-GUARD-03 error scenarios; CF-2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | RR-2 (cross-segment-only indeterminate deletes), RR-4 (G2/G3 HEAD fallback), and RR-W trace to REQ-level choices (D3 segment-scoping, fallback-vs-permanent-block, out-of-scope Write-tool) that have no DEC entry — consistent with the preamble's "the 'do' side is owned by those documents", and each register row carries its own rationale, so nothing is silently dropped. Confirm this is the intended division (register-rationale suffices; DEC entries only where a rejected alternative is likely to be re-litigated) rather than an omission — the G2/G3 fallback in particular is exactly the kind of choice a future agent might confidently "fix" to permanent blocking. |

## Positive Observations

- The carry-forward table is a model of the pattern: each CF names its source finding(s), states the binding disposition in implementable terms, marks which DEC it amends, and explicitly forbids silent stacking of the two sanctioned CF-1 mechanisms ("pick one, don't stack both silently").
- Consequences sections are honest to the point of self-incrimination: DEC-01 records that its own original safety claim was inaccurate and cites the reviews that caught it; DEC-07 carries the SE F2-03 correction that the eager check was a real semantic extension, not a neutral clarification.
- The "No RR-register entry" statements are all argued, not asserted — e.g. DEC-01 quantifies the closed keyhole as two independent anomalies deep, and DEC-03 explains why parser-fidelity gaps need no register entry (matrix failures + fail-closed top-level handler).
- Re-evaluation triggers are product-recognizable conditions throughout (hook payloads nearing ARG_MAX, degraded false blocks on real machines, a guaranteed-interpreter hook runtime, a legitimate non-checkout pipeline context) rather than engineering restatements.
- Reversibility ratings are differentiated and justified (easy for localized idioms, hard where matrix rows pin ordering) — DEC-06's "easy in mechanism, one-way in practice" is exactly the right product framing for removing a defended form.
- No unrecorded product-behavior change found anywhere: every observable named in a Decision paragraph (reason codes, matrix rows, enumeration membership) is quoted from REQ v1.7/FSPEC v1.4, never introduced here.

## Recommendation

**Approved with minor changes**

Both findings are Low, one-line cross-reference corrections in the DECISIONS document itself (F-01: disambiguate the colliding CF-1 citation in DEC-06; F-02: repoint CF-2 at FSPEC-GUARD-03). Neither alters any decision, disposition, reason code, or matrix expectation, and neither blocks se-implement from consuming the CF table.

> Any High or Medium finding → Needs revision (mandatory). None present.
