# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.3, 2026-08-19)
**Date:** 2026-08-19
**Iteration:** 4
**Scope:** Delta re-review of v1.3 against `CROSS-REVIEW-software-engineer-FSPEC-v3.md`. Diff base `0e73ea02` (v1.2, the bytes v3 reviewed) → HEAD `7b8b314c`, one FSPEC commit, 15 insertions / 10 deletions. Changed regions only: changelog, E-30, AT-02-7, AT-06-6, AT-07-1. Reviewed on `feat-pdlc-advisory-wave-gate`.

## Prior Findings Disposition

Both v3 findings were Medium; both are resolved at the root, and each resolution was checked against shipped code rather than against the document's own claim.

| v3 ID | Sev | Disposition | Evidence in v1.3 |
|---|---|---|---|
| F-01 | Medium | **Resolved** | E-30 no longer names the halt report as the failed-log-write carrier. It now names "the run report's notice channel, which the tier already downgrades a failed escalation-log write onto, while the halt report goes on carrying BR-14's diagnosis and root-cause class", and states plainly that re-surfacing it in the halt report "would be new behaviour, not inherited" (FSPEC:301). That is exactly the shipped seam: the escalation-log write is wrapped in a `try`/`catch` whose handler calls `notice("ADVISORY escalation log write failed for seam …")` (`pdlc/workflows/orchestrate-dev.js:3357-3364`), and the `_notice` seam is documented as "the run report's notice channel … a failed escalation-log write is downgraded onto it too" (`:3208-3210`). AT-06-6 now asserts against that carrier and keeps the AT-05-3 halt-reason literal unchanged (FSPEC:438), so it is green against the inherited mechanism instead of red on carrier alone. |
| F-02 | Medium | **Resolved** | AT-02-7's companion is no longer absence-only. It now terminates `resolved` on a green re-gate — a named positive disposition — and the AT says why the positive is required: "E-24 shares the `budget-exhausted` literal, so a non-escalation is not readable from the reason string alone" (FSPEC:353-359). E-24 and E-25 do both carry that literal (FSPEC:289-290), so the stated reason for the pairing is true, not decorative. The *Given* is also restated as one dispatch→verdict window, matching BR-11 (FSPEC:211-216). |

## Findings — v1.3

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **AT-07-1 now carries two distinct terminal dispositions under one *Then*, and its BR-2 arm is a near-duplicate of AT-02-8.** The blanket *Then* is "refused by the workflow script, the shipped refusal reason is reported, tree unchanged", with an inline `**except the BR-2 arm**` clause carrying `unclassified` / no refusal reason / no attempt consumed / tree unchanged (FSPEC:442). The carve-out is correct — the shipped catalogue is a frozen eight-member list with no member for an out-of-vocabulary class (`orchestrate-dev.js:2297-2307`), so demanding a reported reason there would have been red-by-construction — and it is properly paired with positive assertions, so it is not an absence-only oracle. The nit is only that the BR-2 arm's disposition is already pinned end-to-end by AT-02-8 (FSPEC:360), leaving AT-07-1's arm additive in exactly one conjunct ("no attempt consumed"). A one-line split — BR-2's arm delegated to AT-02-8, AT-07-1 keeping only the attempt-count conjunct — would leave one oracle per claim without changing coverage. Not gating: as written the assertions are decidable and consistent. | §6.7 AT-07-1, §6.2 AT-02-8 |

Checks run on the changed text, all clean:

- **BR-3 arm attempt accounting (FSPEC:442) verified against shipped counting, not assumed.** The arm pins `advisory.attemptBudget` to `1` "so the reported reason is the malformed-verdict one rather than the budget one". Shipped, `attempts += 1` fires only on `parsed.malformed` (`orchestrate-dev.js:3458-3459`), and the terminal reason is `refuse({ "malformed-verdict": attempts === 1, "budget-exhausted": true })` resolved in catalogue order, where `malformed-verdict` precedes `budget-exhausted` (`:2303-2305`, `:3470-3474`). The arm therefore holds only if a BR-3 violation counts as malformed — and BR-3 declares exactly that: "a diagnosis with none is malformed under the tier's existing rule … escalates, consuming one attempt" (FSPEC:158), with E-10 and AT-01's row agreeing (FSPEC:265, :344). Consistent on both channels.
- **"No attempt consumed" on the BR-2 arm is consistent with both attempt definitions in play.** FSPEC's own ("an attempt is one repair-and-re-gate cycle", BR-11, FSPEC:216) and the shipped counter's ("a verdict obtained on the first try leaves `attempts === 0`", `orchestrate-dev.js:3195-3197`) agree for a well-formed verdict carrying an out-of-vocabulary class: no repair, no malformed parse, no increment.
- **Set-completeness of AT-07-1's partition survived the edit.** Proposable {BR-2, BR-3, BR-5, BR-6, BR-7, BR-8} ∪ non-proposable {BR-1, BR-4, BR-9…BR-16} still covers BR-1…BR-16 exactly once; the carve-out changed an arm's *Then*, not the enumeration.
- **No implementation echoes introduced.** The new expected values (`unclassified`, `resolved`, `budget-exhausted`, `malformed-verdict`) are literals transcribed from §4/§5 rows, not values derived from the code under test.

**Errata re-emitted upstream (third round, still unresolved on REQ HEAD).** Two REQ defects the FSPEC correctly declines to absorb, both re-verified against HEAD bytes:

1. REQ NFR-4's rationale clause still reads "without that carve-out a slow suite ends every invocation inside attempt 1 and `advisory.attemptBudget` never binds" (`REQ:452-454`). False under the per-dispatch window REQ AC-2.4 itself defines and the shipped per-attempt race implements (`orchestrate-dev.js:3371-3384`, `:3417`, with `budgetExceeded` called at `elapsedMs: 0`, `:3461-3466`): the gate command runs between dispatches, never inside a dispatch→verdict window, so the carve-out is structural and inherited — it cannot be the thing that makes `attemptBudget` bind.
2. REQ's config table still describes `advisory.seamBudgetMinutes` as "working time per **wave** invocation" (`REQ:205`), the wave-scoped reading AC-2.4 rejects and BR-11 had to correct downstream.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v3, still open and still non-gating: with the window per-dispatch, total A6 wall-clock on one wave is bounded only by `attemptBudget × (seamBudgetMinutes + gate runtime)`. Is one sentence in BR-11 saying that total is deliberately unbounded worth adding, so no implementer invents a cap the spec never asked for? |

## Positive Observations

- **F-01 was fixed by moving the assertion to the mechanism, not by weakening the assertion.** The easy repair was to soften AT-06-6 into "surfaced somewhere"; instead E-30 names the exact inherited carrier and marks halt-report re-surfacing as new behaviour A6 would have to buy. That is the C-1 "shipped behaviour cited, never restated" discipline applied to a case where the document had it wrong.
- **AT-02-7's companion now states why it needs a positive disposition.** Most absence-only repairs bolt on a positive assertion; this one explains that the shared `budget-exhausted` literal between E-24 and E-25 makes the reason string non-discriminating. The rationale is checkable and checks out, so a future reviewer will not delete the conjunct as redundant.
- **The BR-2 carve-out is red-avoidance for the right reason.** It exists because the frozen eight-member catalogue genuinely holds no reason for an out-of-vocabulary class, and the AT says so inline rather than quietly dropping the conjunct.
- **The upstream errata were left upstream for the third round running.** v1.3's changelog records the re-emission (FSPEC:18) rather than repairing a false REQ rationale inside the derived document.

## Recommendation

**Approved**

No High and no Medium findings. Both v3 Mediums are resolved at the root and verified against shipped code: E-30/AT-06-6 now name the run report's notice channel, which is where `orchestrate-dev.js:3357-3364` actually routes a failed escalation-log write, and AT-02-7's companion carries a named positive disposition whose necessity the AT justifies. The two claims new in v1.3 that could have gone wrong — the BR-3 arm's `malformed-verdict` reason under `attemptBudget` `1`, and the BR-2 arm's "no attempt consumed" — were both checked against the shipped counter and catalogue ordering and both hold. One Low remains on AT-07-1's dual disposition, which is a readability split, not a correctness gap. The two REQ errata are re-emitted, not folded in.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:cacf86e86918b989b0699268723e21c2ccd88841be6505c9e031a3dbfff188f3
APPROVAL-HASH-NORMALIZED: sha256:cacf86e86918b989b0699268723e21c2ccd88841be6505c9e031a3dbfff188f3
REVIEWED-COMMIT: 7b8b314c4a02c7558678aeaca28479b04d92b538
UPSTREAM-STATE: REQ sha256:32ba7d949d59041db6d67de80c06c10d270c3e545c11473debe5694cfe851f6c
