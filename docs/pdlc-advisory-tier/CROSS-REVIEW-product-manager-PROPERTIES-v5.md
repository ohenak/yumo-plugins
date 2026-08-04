# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 5
**Scope:** product lens — delta re-review of the v1.3→v1.4 revision; REQ traceability, scope compliance, acceptance-criteria fidelity
**Base reviewed at v4:** `08925cf` · **Head reviewed here:** `6bcd258`

## Prior findings — disposition

Both v4 findings are **resolved**, and I re-verified each closure against branch head rather than
against the revision's own account of itself.

| v4 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | Medium | **Resolved** | §13.1's preamble now reads "**None is still open — all six are now closed upstream, and none is emitted as an `ERRATUM:` line**" (`PROPERTIES:1162-1163`), and items 1, 3, 4 and 6 are rewritten in item 5's closure form. I re-checked all four closures at head, not the citations' plausibility: item 1 — `TSPEC:655` gives A1's `verifyGate` as "**`null`** — A1 declares no post-action gate (§5.4's '—' row) … Deliberately **not** `async () => ({ passed: true })`", `TSPEC:657` gives A3's as "**`null`** — same shape as A1", `TSPEC:416` types it `{null \| (() => Promise<…>)} verifyGate`, `TSPEC:434` states "Those two seams also supply **`verifyGate: null`**", and `PLAN:1024` records the resolution "in favour of `null`" with `PLAN:869` stating the mutation in both directions. Item 3 — `PLAN:257`'s A-06 row now carries "`result.reason ∈ {\"prohibited-action\", \"revert-on-test-touch\", \"out-of-envelope\"} ∪ {null}` — the three-member enum `TSPEC:532` declares, **not** the eight-member `ADVISORY_REFUSAL_REASONS`", matching `PLAN:779`. Item 4 — `TSPEC:424` holds `SeamOps` at nine members with `waitMs` "deliberately not a tenth", `TSPEC:428` names the surface as "the `waitMs` argument the driver passes to `budgetExceeded`, not a `SeamOps` accessor", `TSPEC:489` gives `runAdvisorySeam` the counter. Item 6 — `TSPEC:1265-1271` now reads "a grep for the token `advisory.enabled` finds one site, not three. The assertion is a **source-text scan for `/\.enabled\b/`**" over the two named modules, "and it must return **exactly three** matches". Nothing is routed from this document; the erratum round the phase still has is unspent. |
| F-02 | Low | **Resolved** | §2.1 no longer cites the deleted `A-00`. It now cites the primary source — `pdlc/workflows/package.json:18-22`, whose `jest.testPathIgnorePatterns` is `["/node_modules/", "/__tests__/helpers/", "/__tests__/fixtures/"]` (`PROPERTIES:179-182`) — which I confirmed verbatim in the file at head. The §2.4 pre-flight step is kept as the secondary, forward-looking citation (`PLAN:138-141`, which does state that `--testPathIgnorePatterns` **replaces** the configured list), and the deletion is recorded in-line ("`A-00` was deleted in PLAN v1.2, `PLAN:1020`") so the next reader does not repeat my lookup. This is a better fix than the one I asked for: the citation it chose cannot go stale under a PLAN revision, which is exactly why the previous one did. |

## Findings

## Questions

## Positive Observations

## Recommendation
