# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/harden-harvest-guard/PROPERTIES-harden-harvest-guard.md (v1.1)
**Date:** 2026-07-02
**Iteration:** 3

Reviewed against the v1.1 fixup diff `01b9b05..HEAD` (single commit `3cc2598` — "PROP-COV-01 re-grounding"), plus DECISIONS v1.2 (DEC-01/DEC-02, CFD-1–CFD-8), TSPEC v1.1 (§§ 3.5.4, 3.6, 3.7, 6.1), PLAN v1.1 (TASK-02), REQ v1.7 (G-state matrix). No `docs/_constraints/` or `docs/_decisions/` exist (re-checked 2026-07-02) — no standing project-level constraints apply. Per task scope this iteration verifies the three carried-forward iter-2 findings against the actual current text and scans only for defects introduced by these edits — it does not re-open sections untouched by the diff.

## Iteration-2 disposition (verified against actual sections + the diff, not the changelog)

| Iter-2 ID | Sev | Claimed area | Verified against | Result |
|---|---|---|---|---|
| F-01 | **Medium** | PROP-COV-01 coverage-waiver re-grounding | Diff hunk `@@ -254`: the section is materially rewritten. The refutable absolute ("coverage tool ... **cannot** attach ... without splitting the single-file deployable") is **gone**, replaced by "A numeric branch-coverage figure is *not* strictly impossible — it is rejected on concrete grounds." The four grounds I asked for are all present: (a) bashcov/kcov are **new non-npm toolchain deps** (line 258); (b) coverage.py is measured-**copy** indirection + a new dep (line 259); (c) `trace` **named as rejected** — "stdlib `trace` is line-only, not branch" (line 258, satisfies the branch-vs-line ground); (d) bash unreachable by installed toolchain (line 258). The "**binding for dod-verify**" framing is replaced by "**input to dod-verify, with documented waiver rationale**" and an explicit non-suppression clause: "it does not instruct the verifier to suppress a finding — dod-verify remains free to flag the missing number" (line 267). A `Process`-scoped **Harvest signal** paragraph is added (line 269). | ✅ **Resolved** |
| F-02 | Low | Δ6 mixed fixture must be G4, not "no upstream"/G2 | Diff hunk `@@ -37`: Δ6 now reads "one repo with a **bare origin remote** (G4 builder discipline — a branch with no upstream would collapse to G2/`NOT_COMMITTED` since `git remote` gates the check per TSPEC § 3.6)" and "**committed-but-unpushed** `LEARNINGS-a.md`". PROP-DEC-02 oracle §2 (hunk `@@ -91`) mirrors it verbatim ("reusing the G4 builder discipline, i.e. a bare origin remote ... committed locally but not pushed, so `git remote` is non-empty and the state is G4 not G2"). The G2-collapse trap is now called out explicitly. | ✅ **Resolved** |
| F-03 | Low | Missing v1.1 revision-history row | Diff hunk `@@ -321`: a `1.1` row is added summarizing all v1.1 work (Δ4 spawn, Δ6 discriminator + G4 builder, landing-task bindings, Δ1/Δ5 supersessions, PROP-COV-01 re-grounding + Process signal, trace corrections). Version can legitimately span the `01b9b05`+`3cc2598` commit pair; the row accurately describes the final v1.1 state. | ✅ **Resolved** |

Net: the one Medium and both Lows from iteration 2 are resolved. The Medium fix is substantive, not cosmetic — the waiver now rests on cost/portability grounds a dod-verify challenger cannot refute by producing a number, and it explicitly cedes the verifier's right to flag.

## Existing-doc claim verification (single pass, v1.1-fixup deltas only)

| New claim in the fixup | Verified against | Result |
|---|---|---|
| Δ6 / PROP-DEC-02: bare origin remote + committed-but-unpushed `LEARNINGS-a.md` ⇒ `verify_feature(a)=NOT_PUSHED`; "a branch with no upstream collapses to G2 since `git remote` gates the check" | TSPEC § 3.6 (remote-existence gate → G2/`NOT_COMMITTED` when absent) + § 3.7 (`git push -u origin` substring is the G4 message) + REQ G4 | ✅ accurate |
| PROP-COV-01: "stdlib `trace` is line-only, not branch" | Python stdlib `trace` performs line counting, not branch coverage (coverage.py is the branch tool) | ✅ accurate |
| PROP-COV-01: "coverage.py + extraction/replay harness are new deps"; bash unreachable by nyc/istanbul | DEC-01 stdlib-only floor rejects even test-side Python deps (`hypothesis`, line 30); repo test toolchain is npm/jest only | ✅ substance accurate |
| PROP-COV-01: "bashcov/kcov ... **DEC-02's stdlib-/repo-tooling-only floor** rejects" | DEC-02 (title + constraints, DECISIONS line 42–53) is the production **architecture** decision (heredoc, raw-stdin argv, zero external binaries *before the interpreter probe*). It states no test-tooling floor. The stdlib-only floor that rejects extra deps lives in DEC-01 (line 30) / TSPEC § 3.3, and it is a **Python-source** floor — bashcov/kcov are bash tools rejected by the repo's general no-new-dependency convention, not by any Python floor. | ⚠️ miscited — see F-01 below |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **PROP-COV-01's bashcov/kcov rejection is attributed to "DEC-02's stdlib-/repo-tooling-only floor," but that floor is not in DEC-02.** DEC-02 (DECISIONS § DEC-harden-harvest-guard-02) is the *production architecture* decision — single-file bash wrapper + embedded heredoc, raw stdin as `argv[1]`; its constraints concern runtime binaries before the interpreter probe, not the test toolchain, and it declares no "repo-tooling-only floor." The floor that actually rejects extra dependencies is DEC-01's **stdlib-only** floor (DECISIONS line 30, where `hypothesis` is rejected) together with the repo's npm-only test-toolchain convention — and that floor is Python-scoped, whereas bashcov/kcov are bash coverage tools. The *decision* (reject new non-npm coverage tooling) is correct and well-supported; only the citation is loose. Because this section self-labels as "input to dod-verify," a challenger verifier can trace the citation and find DEC-02 does not say what is attributed to it. Repoint to "the repo's zero-new-dependency convention (DEC-01 stdlib-only floor + npm-only test toolchain)," or drop the specific DEC number for the bash-tool clause. No blocker — substance holds. | PROP-COV-01 (line 258) |

## Questions

*(none)*

## Positive Observations

- **The Medium fix is exactly the re-grounding I asked for, and honest about its own limits.** The waiver now leads with "not strictly impossible ... rejected on concrete grounds," enumerates the measured-copy checksum indirection as the reason the Python figure is declined, names `trace` as line-only, and — critically — inverts the dod-verify posture from "binding" to "input ... dod-verify remains free to flag the missing number." That last clause removes the refutable-authority defect entirely: the section no longer tries to pre-empt the verifier, it arms the verifier.
- **The added `Process` harvest signal is correctly scoped.** It routes the durable gap (the pdlc DoD coverage criterion has no discharge path for non-instrumentable shell artifacts) to the dod-verify skill rather than burying it as a per-feature footnote — matching my iter-2 recommendation and the te-review Process-tag discipline.
- **Δ6 / PROP-DEC-02 §2 are now internally consistent and technically correct.** Both the delta row and the oracle name the bare-origin G4 builder discipline verbatim and call out the `git remote`-gate G2-collapse trap, so an implementer cannot silently build the fixture as G2 and destroy the sorted-order discriminator. The cross-reference to PROP-COV-01 item-1 row-totality (the justification for adding the case rather than re-scoping the clause) still resolves — item 1 is untouched by the fixup.
- **The edit is surgically scoped.** The diff touches only the three finding sites plus the revision row; no untouched property, oracle, or trace was disturbed, so no regression surface was introduced beyond the one citation nit above.

## Recommendation

**Approved with minor changes**

All three iteration-2 carried-forward findings (one Medium, two Lows) are resolved against the actual current text. The PROP-COV-01 waiver is re-grounded on refutation-proof cost/portability constraints, names `trace` as rejected, and reframes itself as non-binding input to dod-verify — the Medium is genuinely closed. One new **Low** remains: the bashcov/kcov rejection miscites DEC-02 for a "stdlib-/repo-tooling-only floor" that lives in DEC-01/repo convention. It is a citation-precision nit in a dod-verify-facing section, correctable in a one-line edit; it does not block. Every test oracle in the document remains implementable as written.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
