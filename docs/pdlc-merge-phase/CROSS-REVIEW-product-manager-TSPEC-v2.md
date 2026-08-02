# Cross-Review: product-manager — TSPEC (round 2)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-merge-phase/TSPEC-pdlc-merge-phase.md` (v1.1, through `e579640`)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** Delta re-review of TSPEC v1.1 against FSPEC v1.3 and REQ v1.1 — disposition of my four round-1 blocking findings and my three advisories, plus a scan of the revised sections and the three accepted errata for any new product-lens defect. Unchanged sections already reviewed in v1 were not re-litigated; technical design, test mechanics and code quality remain out of this lens.

## Disposition of round-1 findings

| ID | Round-1 severity | Disposition | Evidence in v1.1 |
|----|------------------|-------------|------------------|
| F-01 | High | **Resolved** | §2.4 now states the rule once — `row` is *always* a FSPEC §11 identifier, domain `1`…`23` + `"11a"` + `"13a"`, with `"internal"` reserved for E30 — and §5.3's 24-guard table carries the §11 id in bold alongside the §2.2 row it implements. The two mislabels are corrected in place (guard 2 → **row 6**, guard 4 → **row 8**) and named as corrections so the next reader sees the reasoning; guards 7/8 are split so §11 rows 4 and 5 get distinct producers and distinct escalation text. §12 E8 now says "notably guard 4 is §11 row 8 … not row 4". I checked producer uniqueness across the whole table: every §11 row 1–18 plus 11a and 13a has exactly one producer, rows 3/4 are no longer double-claimed, and §13.3 pins the suite's own case count at 25 so a dropped row fails rather than silently disappears. |
| F-02 | High | **Resolved, and better than I asked** | §7.1 emits `AHEAD_OF_REMOTE_NOTE(defaultBranch, feature)` immediately after M4, quotes FSPEC §8.2's sentence verbatim, classifies it as a plain note (never an escalation), and sources `defaultBranch` from `O4` — the same value M3 fetched, so the notice and the step cannot disagree. It is enumerated in §10.2's note catalogue and asserted in `mergePhase` including its suppression cases, and §13.5 adds the `recorded`-only gate as a mutation target. |
| F-03 | High | **Resolved** | `mergeableRetryDelay` is restored as the key name in §2.2's `MERGE_DEFAULTS`, §3.1's validator table, §4.3's wait computation and §13.2, with "in seconds" documented rather than encoded in the name. The operator-facing contract now matches REQ §7 and FSPEC §10.1 exactly. |
| F-04 | Medium | **Resolved via the erratum route the finding prescribed** | FSPEC v1.3 §9.1 now enumerates `squash` and scopes it ("reachable only where `allowSquashMerge: true` is explicitly configured … never in a fallback chain"); TSPEC §2.4, §5.6 and §10.1 state the same scoping. The reported domain and the shipped-default domain (`rebase` \| `merge`) are both stated, which is what a consumer switching on the field needs. |
| F-05 | Low | **Resolved** | FSPEC v1.3 §2.2 row 5 and §2.5 now say row 5 takes `O4` as an observation and never a precondition, with the `unknown`-`O4` → row 22 consequence written into the FSPEC itself. TSPEC §5.5 no longer stands alone against its own upstream. |
| F-06 | Low | **Resolved** | §14 gained the eight rows I named — AC-6.1a (with the 25-row table), §11 rows 19–22, AC-2.3, AC-3.3/AC-3.7, AC-4.2, AC-4.3, AC-5.4, AC-6.2a — each with a component and a test home. |
| F-07 | Low (process) | **Applied as advised; net length still grew** | The duplicate obligation table, the feasibility prose and §12's restating rows are gone, exactly the cuts I proposed. The document nonetheless went 1,226 → 1,462 lines because fourteen TE findings and three errata landed in the same revision. I flagged the trim, not the total, and I do not ask for more: nothing I can now point at is non-obligation-bearing. Recording it so the DoD phase reads the growth as accounted for rather than unexamined. |
| Q-01 | — | **Answered and pinned** | §7.1: the notice is emitted iff M4's disposition is `recorded`, which includes §11 row 3's re-entry, and is suppressed for `none`, `error` and `recorded (uncommitted)` — precisely the three cases in which FSPEC §8.2's sentence would be false. This is a refinement of "once per merged run", not a narrowing of it. |
| Q-02 | — | **Answered structurally** | §9.1: on the queue path the driver has already written `in-progress` before the pipeline runs, so M4 can never find `pending`/`blocked`/`halted` there; on the direct path there is no M5 at all. The two are mutually exclusive by construction, and §13.2 asserts the boundary with a fixture that forces `blocked` mid-run rather than assuming the case away. |

## New findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| M-01 | Low | Local | **A fourth, undeclared narrowing of an FSPEC-stated config domain.** §3.1 bounds `mergeableRetries` to `0…10` (`MERGE_MAX_RETRIES`), where FSPEC §10.3 and REQ §7 state "integers ≥ 0" with no ceiling. I accept the substance without reservation: §3.1's own reasoning is correct — an unbounded value exhausts §5.2's decision-step bound and converts FSPEC §11 row 13 (`deferred`) into `refused, row: "internal"`, so the literal transcription is the unsafe one — and the fallback direction is FSPEC §10.3's own rule (out-of-domain takes the default), so a mistyped value is safe and the operator-visible effect is a retry count nobody sensible sets. What is missing is only the paperwork: this is a change to a documented operator-facing domain and it is the one such change **not** routed through §15.2's errata table, while §15.3 now asserts "no divergence between TSPEC and FSPEC remains" — a claim this makes false. Fix, non-blocking: add it to §15.2 as erratum **E-4** against FSPEC §10.3 / REQ §7 (`mergeableRetries` accepts integers `0…10`; above the cap takes the default) and correct §15.3's closing claim. This does not gate approval and should not trigger another authoring round on its own — fold it into the next edit the document takes for any reason. | AC-7.3; FSPEC §10.3 |

## Questions

| ID | Question |
|----|---------|
| Q-03 | §7.1 gates the §8.2 notice on disposition `recorded`, which also covers the AC-5.8 "already `done` with the same evidence, nothing to commit" case. Where an earlier run's queue-row commit has since reached the remote inside a later feature's PR, the local default is no longer ahead and the sentence over-states. It is a harmless, self-correcting note on a recovery path and I am not asking for a code change — but if the boundary is cheap to pin in `mergePhase`'s assertions, it is worth one line so a future reader does not read the notice as a guarantee. |

## Positive Observations

- Every one of the four blocking findings was closed at the source of the defect rather than at its symptom: F-01 became a **stated rule in §2.4** with §5.3 enforcing it, not a pair of corrected cells, so the class of error cannot recur silently.
- Three FSPEC errata were raised, accepted and reflected back into both documents in the same round (`7028537`, `e579640`), including the retirement of v1.1's provisional `"7d-unknown"` designator once FSPEC v1.3 gave the condition a real row 13a. Upstream and downstream now agree in writing on every point I raised.
- §7.1's answer to Q-01 is stronger than the finding required: rather than emitting FSPEC §8.2's sentence unconditionally, it enumerates the three dispositions on which the sentence would be **false** and suppresses it there — the operator gets a notice that is always true instead of one that is always present.
- §9.1's Q-02 answer is a mutual-exclusion argument backed by a test that forces the excluded case, which is the right way to close a "can this collide?" question: it documents the boundary rather than asserting it cannot be reached.
- The `mergeableRetries` cap (M-01) is exactly the kind of finding I want engineering to raise against a spec I wrote: it caught a config value that could convert one FSPEC §11 row into another. The reasoning is stated in place and the boundary pair is tested; only the erratum row is missing.
- The safety properties I checked in round 1 all survive the revision intact: no guard override (§6.3, with the source scan now scoped to arity plus two extracted bodies), `squash` absent from the array under shipped defaults (§5.6), no `mergeMode` value bypassing preconditions (§5.3), fail-closed parsing on every surface, and `mergeStatus: merged` never downgraded by any post-merge failure (§12).

## Recommendation

**Approved with minor changes**

All four round-1 blocking findings are genuinely resolved, the three advisories are addressed, and the three errata are accepted upstream in FSPEC v1.3 with the TSPEC updated to match. M-01 is a documentation-only gap in the errata table with a safe, well-reasoned behaviour behind it and does not warrant another round; fold it into the next edit, along with Q-03 if it is cheap.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 1}
