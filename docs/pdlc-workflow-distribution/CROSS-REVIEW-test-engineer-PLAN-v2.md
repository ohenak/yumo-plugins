# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md` (v2.0, Draft)
**Date:** 2026-07-28
**Iteration:** 2

Delta re-review against `CROSS-REVIEW-test-engineer-PLAN-v1.md` (3H / 4M / 3L). I verified each v1
finding at the site named in §0a — not at the disposition table — and fresh-eyed the three genuinely
new blocks (T-39, §3.1, §6.3) plus the defer-commit mechanism's interaction with §10.3. Upstream
REQ/FSPEC/TSPEC/PROPERTIES are approved and are not re-litigated; PLAN altitude only.

## Disposition of v1 findings (verified at the site)

| v1 ID | Verdict | Evidence |
|---|---|---|
| **F-01** (AT-7 orphan) | **Resolved.** | T-22 now owns *both* conjuncts of AT-7's classify half — the `unverifiedRow` fixture, `unverified` classification **and** `--check` exit 2 — with the batch straddle stated in-row; T-38 keeps the queue half. `AT-7` now appears at six sites (§0a, T-22, T-38, PL-05, §9, layer table). §9's 39 is derivable: AT-1…AT-36 + AT-8b/14b/18b = 39, and the four split ATs map to owning tasks (AT-5 → T-24 ×2 + T-38; AT-31 → T-38 ×2; AT-34 → T-22 ×3; AT-14b → T-25 ×2) — all four confirmed present in those rows. PL-05 records the TSPEC tension without proposing an edit, which is the right call. |
| **F-02** (mutation-pair loophole) | **Resolved.** | §3.1 replaces the withdrawn `Falsifies`-column citation with a checkable ledger: mutation named *before* the run, red observed **with a failing-case count and first failure message**, revert observed green with `git diff --exit-code` clean over the subject. It is a conjunct of §5's batch 12/13 gate, §8's batch 12–13 Phase-CR row and two §9 DoD boxes — no longer prose-only. Ownership is genuinely batch-safe: T-40 creates the header at batch 7, T-41…T-49 each append **their own** fragment at batch 12, T-50 concatenates and deletes at batch 13 (§4.4). The no-nameable-mutation residual is handled honestly (filed as a residual, **not** marked green, counted as unverified) — that is the fallback v1 asked for, implemented as asked. Loose ends in §4.4/§3.1 wording are F-03 below. |
| **F-03** (per-layer green claim false) | **Resolved.** | The false claim is withdrawn in both places it lived (§3 note 1, PL-03). T-39 (`bin/lib-probe.sh` + `driftProbe.js`) is a sound reading of the §11.2 `backup-grammar.sh` precedent, and Phase 4's preamble table gives each of the five layers a **sourced** green whose authoring task exists at batch 5 and lists T-39 in `Deps` (T-27→layer 1, T-20/T-21→2, T-22→3, T-23→4, T-28→5 — all verified). The entrypoint-mediated residual is named per layer in the right-hand column rather than claimed away. §5's two-conjunct gate for 6–10 (new green **and** strictly-shrinking enumerated red) closes v1's "the red list got shorter" loophole, and §8's batch 6–10 row makes "a layer that turned nothing green is a gate failure" explicit. T-39's two protective constraints (`pdlc_fault_active` called nowhere; test-helper, never shipped) correctly preserve PROP-SEAM-02's three-file scan and PROPERTIES §8.1's static scan, and §8's batch-4 row checks them. |
| **F-04** (L-06 bundle staleness) | **Resolved.** | L-06 runs `build-runtime.mjs` and stages `dist/` in its own batch (19); §4.1's `dist/**` row carries `L-06→19` and §3 note 3 re-derives six owners across six distinct batches (3, 4, 5, 6, 19, 21) — no same-batch collision. §5's 14–21 gate and §1 constraint 2 both updated. |
| **F-05** (DoD counts) | **Resolved — and my v1 count was wrong.** | See the recount below. |
| **F-06** (`git check-ignore`) | **Resolved.** | `--no-index` is on the two negative conjuncts in L-01, and the index-consulting form is retained *only* for the third conjunct, where it is correct because L-01 untracks first. Propagated to §7, §8's 14–22 row ("the flag **is** the check") and §9. |
| **F-07** (batch-4 helper gates) | **Resolved.** | T-01 is now four labelled clauses; T-15 cites (b), T-16 cites (c), T-18 and T-39 cite (d); all four add `T-01` to `Deps` (batch still 4 = max(T-01→2, T-08a→3)+1). T-18 no longer cites `driftBackups.test.js`, which was the consumer-as-gate error. §3 note 5's red-before-green edge list is updated to match. |
| **F-08** (PL-01 rationale) | **Resolved.** | The `git add -f` rationale is withdrawn; the two real hazards (future `dist/` artifact silently unstageable; `git status` losing AC-6.6's observation point) replace it. Resolution unchanged, correctly. |
| **F-09** (L-05 oracle timing) | **Resolved — and I re-derived it against TSPEC §10.3's probe order.** | At L-05's pre-commit gate: `git` present, `.git` present, `HEAD` resolves, `git status --porcelain -- pdlc/workflows/dist/` **non-empty** (L-06's rebuild is still uncommitted, guaranteed by §1's defer-commit rule) ⇒ the oracle falls through to the version comparison, `plugin.json` differs from `HEAD`'s ⇒ `"green"`. Post-commit at L-09 the tree is clean ⇒ branch (a) fires ⇒ `S_NOTHING_STAGED` skip ⇒ `!== "red"` holds. Both readings are correct and the defer-commit mechanism is what makes the pre-commit one reachable. The residual is a prose inaccuracy elsewhere — F-04 below. |
| **F-10** (skip comparator) | **Resolved.** | T-07 exports the frozen inventory (TSPEC §1.3 ∪ PROPERTIES §11.1) plus `REGISTERED_SKIPS`; T-01 asserts membership and non-empty invariant lists; §9's first DoD box now describes a comparator, not an eyeball pass. |

### F-05 recount — settled independently

I re-derived the totals from PROPERTIES v2.1 rather than from the PLAN's claim.

- **Distinct property ids: 63.** Mechanical extraction of every `PROP-<FAM>-<NN>` token, deduplicated:
  8 CLS, 6 RSN, 8 BSL, 13 BKP, 7 MTM, 8 SEAM, 6 DET, 7 NEG = **63**. Matches §9 exactly.
- **§12 placement rows: 75.** Counted row by row from §12's table: driftClassify 21, driftBaseline 10,
  driftOrdering 7, driftSync 9, driftHook 3, driftWriteFailure 1, driftRepoRoot 2, driftFault 6,
  driftBackups 13, queueDriftGate 3 = **75**. The 12-row delta over 63 is exactly the eleven split
  properties (CLS-04, BSL-05, MTM-02/-03/-04/-05, NEG-03/-04/-07, RSN-05, SEAM-05) plus CLS-02(a)/(b)
  — which is precisely how §9 describes it.
- **My v1 count of 55 was wrong.** Stated plainly: I enumerated seven families (13 BKP + 8 BSL +
  8 CLS + 6 DET + 7 MTM + 7 NEG + 6 RSN = 55), wrote "plus SEAM", and then never added SEAM's eight.
  55 + 8 = 63. My alternative "≈67" was wrong too. The author's rejection of my number is correct
  and my finding's (b) leg should be read as: v1.0's 65 was wrong, and so was my 55.
- I also reconciled §9's 75 against §2's task table: T-41 owns 21 rows, T-42 10, T-43 7, T-44 9,
  T-45 3, T-46 1, T-47 2, T-48 6, T-49 13, T-50 3 = **75**. Every placement row has an owning task.
- §9(a): TSPEC §14.1 is **18** rows (S-1/2, B-1…5, M-1/2/3, PH-1, V-1…4, F-1/2/3) — confirmed by
  reading the table. §9(c): all **thirteen** TSPEC §1.4 floor rows now appear in §9's restructured
  bullet, including the message-catalogue `distinct()` floor. Both correct.

### Mechanical re-checks (T-39 and the Phase 7 permutation)

- **Batch column.** Re-derived `batch == max(dep batch) + 1` for all **61** rows (P0-00; T-01…T-39
  with T-08 split a/b; T-40…T-50; L-01…L-09). Every row matches, the graph is acyclic, ids are
  unique, every dependency resolves, and the total is still **22** batches — T-39 fits in batch 4
  and Phase 7's reorder is a permutation (L-02→14 … L-09→22).
- **Same-batch same-file.** No collision in any batch. Batch 4 (T-08b, T-15, T-16, T-17, T-18, T-39,
  T-11) writes seven distinct files; batch 12's ten tasks write ten distinct suites **and** nine
  distinct ledger fragments; `dist/**`'s six owners sit in six different batches.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **§6.3's D-1/D-2/D-3 oracles are assigned to a task whose row does not contain them.** §6.3's table header states the three oracles are "asserted in `documentOracles.test.js` **by T-02**, red until L-06", and §9's DoD requires "§6.3's D-1, D-2 and D-3 each meet their stated oracle". But **T-02's row enumerates its file "in full"** — AT-19/20/21/22/23/28/29, the two-root independence assertion, the `dist/` write guard, the `advertisedVersionViolation !== "red"` assertion, `EXEMPTIONS`, `EXPECTED_SEVEN`, the split fixture guard — and **names none of D-1…D-3**, with no catch-all clause. §4.2 gives T-02 sole ownership of the file, so no other task can add them. The dispatcher hands `se-implement` a phase task table, not §6.3, so the three cases will not be written; REQ §6's document-corrections obligation (b) then lands back in exactly the state PM F-04 flagged — the half `coveredViolations` is blind to, with no automated done-criterion, and §9's checkbox degrades to an eyeball. Secondary consequence: once authored, these three cases are red from batch 2 until L-06, and Phase 7's precondition paragraph enumerates only four expected-red assertions (AT-22, §9.3, §10.3, T-19) with §5's 14–21 gate keyed to that same list — the §6.3 oracles are a fifth item that must be enumerated alongside AT-22 under L-06, or batches 14–18 halt on an unlisted red. **Fix (one row + one clause):** add D-1/D-2/D-3 to T-02's enumeration, and add them to Phase 7's precondition list grouped with AT-22 as L-06-owned. | §6.3, §2 Phase 1 (T-02), §2 Phase 7 preamble, §5 (14–21), §9 |
| F-02 | Low | Local | **Two of §6.3's three oracles are stated semantically, not mechanically.** D-1's negative conjunct — "contains **no line asserting that** `build-runtime.mjs` writes into `.claude/workflows/`" — and D-3's — "**no longer describes** a generated artifact living under `.claude/workflows/`" — cannot be evaluated by a test; and D-1's edit deliberately *adds* the string `.claude/workflows/` to that section (as the untracked consumer copy), so a naive "string absent" implementation would contradict the edit. The positive halves are fine as written. Restate the negatives as greppable predicates, e.g. *no line in the section matches both `build-runtime` and `.claude/workflows`*, and *no line in `pdlc/README.md` matches `.claude/workflows/.*bundle`*. Without this, the implementer either invents a predicate or asserts nothing — and an absence conjunct that cannot fail is the class this review treats as no test at all. | §6.3 (D-1, D-3) |
| F-03 | Low | Local | **Three ledger-ownership loose ends in §3.1 / §4.4.** (a) §3.1's "Where it is recorded" paragraph still opens with the *rejected* design — "a tracked file created by the **first** property task to run in batch 12 and appended to by each subsequent one" — and only the next sentence installs T-40 + fragments + T-50. The two sentences describe incompatible mechanisms and the first is the batch-safety violation the second exists to prevent; delete the stale clause. (b) **T-50's own three properties have no fragment.** §4.4 enumerates fragments `T-4{1..9}` only, and T-50's row describes it as the concatenator, not as a ledger author — yet T-50 lands PROP-MTM-05's queue half, PROP-NEG-04's queue half and PROP-BSL-05's queue half, which §5's batch-13 gate requires falsification runs for. T-50 is the sole batch-13 writer so it can simply append its own entries; say so. (c) The residual count is unbounded: nothing in §5 or §9 caps how many properties may be filed as residuals, so a conforming run could file all 63. That is the fallback v1 asked for and I am not moving the goalpost — but a stated ceiling (or a DoD line requiring the residual list to be surfaced in the phase report for an explicit accept) would keep the ledger from degrading into a residual dump. | §3.1, §4.4, T-50 |
| F-04 | Low | Local | **§5's merge note and Phase 7's precondition mis-state when the §10.3 assertion is actually red.** §5's note says `advertisedVersionViolation(LIVE_ROOT)` is "knowingly `"red"` from batch 3 through batch 20", and Phase 7 lists it among the four assertions red on entry to batch 14. Traced against §10.3's pinned probe order: it is red at the **pre-commit** gates of batches 3–6 (dirty `dist/`, version equal to `HEAD`'s), then **green** from batch 7 through batch 18 inclusive (per-batch commits leave `dist/` clean ⇒ branch (a) ⇒ `S_NOTHING_STAGED` ⇒ `!== "red"` passes; batches 7–13 touch no `dist/`, and batches 14–18 touch none either), red again at batches 19–20 (L-06's uncommitted rebuild under an unbumped version), and green from 21. So it is **not** red entering batch 14, and the "batch 3 through batch 20" span is only true if every reading is taken pre-commit — which is not what batches 7–18 do. More importantly the merge note's stated mechanism is inverted: the hazard of merging at, say, batch 6 is that the landed `dist/`-change-under-old-version is **undetectable** by this oracle once committed (that is TSPEC's own AC-6.6 accepted residual, the reason `RELEASE-CHECKLIST.md` row 2 exists) — not that the oracle is loudly red. The conclusion ("do not merge until L-05") is right; the reason should be the undetectability, which is the stronger argument. | §5 (merge note; 14–21 gate), §2 Phase 7 preamble |
| F-05 | Low | Local | **PL-03 under-declares what T-39 adds to TSPEC-owned suites.** PL-03 says T-39 "adds one test helper and one test driver, both already-excluded paths" — but the probe work also inserts PLAN-authored `it()` blocks into **seven** suites whose contents TSPEC §14 enumerates (`driftRepoRoot`, `driftBaseline`, `driftClassify`, `driftSync`, `driftFault`, plus the layer-5 reuse in `driftMessages`). That is legitimate and well-motivated, and it is exactly the situation PL-02 exists to declare for `driftHelpers.test.js`; PL-03 should declare it the same way so a Phase-CR reviewer does not read a probe case as a TSPEC-mandated one, and so §8's batch-5 check ("every AT in §14 has a real `it()`") is not mistaken for an exhaustive-contents check. | §7.1 PL-03, §2 Phase 3 |
| F-06 | Low | Local | **Two small accuracy nits in the gate/DoD tables.** (a) §5's gate table is split by a stray blank line after the batch-1 row, so it renders as two tables and the header does not apply to rows 2–22 — cosmetic but it is the dispatcher-facing table. (b) §9's set-equality group lists "3 trace phases" as a set-equality meta-oracle; TSPEC §1.4's trace-phase floor is stated as *all three labels observed on one sync run*, and §1.4's closing paragraph names only baseline reasons, row states, row reasons, operations and mapping rows as the `Set`-plus-set-equality construction (§4.3's oracle is multiset positive-presence). Asserting set-equality there is strictly stronger and therefore harmless, but it is attributed to §1.4 rather than declared as a PLAN choice. | §5, §9 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §3.1 requires the revert verified by `git diff --exit-code` "over the subject file **before the batch closes**". For batch 12's ten concurrent tasks, several mutate the *same* subject (`pdlc-drift.sh` is the subject for T-41, T-42, T-44, T-46, T-48, T-49). Are those falsification runs serialised within the batch, or does each agent work in its own worktree/copy? A concurrent mutate-and-revert on one physical file makes both the red observation and the `git diff --exit-code` conjunct unreliable. |
| Q-02 | The ledger requires a mutation/red/revert cycle per green property — 63 ids across 75 placement rows. Is the red observation scoped to the property's own `it()` (jest `-t`), or to the whole suite? The batch report field is "failing case count", which reads suite-scoped and would make a broad mutation's count uninformative. |

## Positive Observations

- **The F-05 recount is the author's, and it is right.** Rejecting a reviewer's number with a
  re-derivation from the source document — rather than splitting the difference — is the correct
  behaviour, and the 63/75 decomposition reconciles to the placement table and to the task table
  independently. My 55 was an arithmetic omission of the SEAM family.
- **§3.1 converted an unenforceable exception into a checkable artifact.** Naming the mutation before
  the run, recording the case count *and* the first failure message, and closing with
  `git diff --exit-code` gives Phase CR three independently forgeable-only-by-lying conjuncts where
  v1.0 had a sentence. The fragment-per-task + single-writer-concatenation ownership is the right
  shape and needs no prose caveat.
- **T-39 is the right fix for F-03 and is minimal.** It reuses a precedent TSPEC already established
  rather than inventing a mechanism, adds no production file, and its two self-imposed constraints
  are exactly the ones that keep PROP-SEAM-02 and PROPERTIES §8.1 honest. The per-layer table's
  right-hand column — what stays red until batch 11 — is the part that makes the fix credible.
- **Phase 7's resequencing is a genuine safety improvement, not a reshuffle.** Additive-first with
  `git rm --cached` second-to-last, combined with defer-commit, means every halt in batches 14–21
  leaves `HEAD` at a state where the four bundles are still tracked — and the per-row halt-state +
  one-line recovery is the kind of detail that is normally discovered during the incident.
- **The defer-commit mechanism is what makes L-05's `"green"` reading reachable**, and the pre/post
  commit distinction is now stated at all four sites that read the oracle. This is a case where the
  fix for one finding (PM F-02) supplied the precondition for another (TE F-09) — verified, not
  assumed.
- **The batch DAG survived two structural changes intact.** Adding T-39 and permuting nine landing
  tasks left every `batch == max(dep)+1` relation correct, the graph acyclic, and the batch count
  unchanged at 22. That is not typical.
- **The withdrawals are honest.** The `Falsifies`-column citation, the per-layer red-testability
  claim and PL-01's `git add -f` rationale are each marked withdrawn with the correct replacement
  reason, rather than quietly reworded.

## Recommendation

**Needs revision**

One Medium remains, and it is a single-row edit:

1. **F-01** — add §6.3's D-1/D-2/D-3 oracles to **T-02's** task row (the dispatcher reads the row, not
   §6.3), and list them alongside AT-22 as L-06-owned in Phase 7's expected-red enumeration.

F-02…F-06 are Low and should be folded into the same pass; F-02's mechanical restatement of D-1/D-3's
negative conjuncts and F-03(a)'s stale-sentence deletion are the two worth doing carefully. No other
open finding remains from v1; all three Highs and all four Mediums are resolved at the site, and the
count dispute is settled in the author's favour.

---

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 5}
