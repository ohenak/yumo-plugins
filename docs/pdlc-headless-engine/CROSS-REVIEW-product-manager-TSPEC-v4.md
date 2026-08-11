# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.3)
**Upstream read:** `REQ-pdlc-headless-engine.md`; `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-07)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v3.md` (0 High, 1 Medium, 2 Low)
**Diff reviewed:** `041d865b..HEAD` on the TSPEC (+176/−31)
**Date:** 2026-08-11
**Iteration:** 4
**Scope:** delta re-review — v3 findings, and the sections v1.3 changed; unchanged sections not re-litigated

## Disposition of v3 findings

All three closed, and the Medium was closed where it originated rather than by softening the claim.
I re-checked each fix against HEAD rather than against the revision's account of HEAD.

| v3 finding | What v1.3 did | Status |
|---|---|---|
| F-01 Medium — `timeoutMs` declared always-present (§4.1, §4.6) but grouped with the conditionally-assigned keys (§3.4); the operator's effective timeout might never reach a dispatch | §3.4 picks §4.1/§4.6 as the true reading: the adapter **stamps** the resolved `dispatch.timeoutMinutes` × 60 000 on every dispatch, the presence half becomes `cwd` **and** `timeoutMs`, `maxTurns` becomes the one declared-but-unreachable key, §4.6 gains an effective-value assertion, §8.3's adapter row carries the new edit | **Resolved as a design contradiction.** The premise checks out: `adapter.mjs:278` builds `{ cwd }` unconditionally, `:279`/`:280`/`:281` assign `model`/`timeoutMs`/`maxTurns` only when defined, no module passes `timeoutMs`, and `transport.mjs:152` defaults it to `defaultTimeoutMs`. The direction chosen is the one that makes BR-CLI-3's reported tunable mean something. The *assertion* that now carries it is not yet strong enough — F-02 below, a new finding against the new text, not a re-opening of this one |
| F-02 Low — `byPhase` buckets merge across `queue --loop` passes, undocumented | §4.4 gains a paragraph stating it is run-scoped by design, with `loop.iterations` as the divisor and the per-feature breakdown named a report change, not a counter change | **Resolved.** `orchestrate-queue.js:1400` is `` phaseFn(`Pipeline: ${entry.feature}`) `` as cited, so the normalised key really is the constant `"Pipeline"` and no feature name enters the bucket key. FSPEC §12.2/AC-4.5 ask for per-phase counts, so this is the asked shape stated plainly |
| F-03 Low — `:10448` missing from `SKILL_HARVEST`'s site list | Site lists re-measured; `:10448` moved off `SKILL_SE_IMPLEMENT` onto `SKILL_HARVEST` with both sites labelled (Phase H / advisory distil) | **Resolved, and I re-measured the whole set rather than the one line.** At HEAD the `"se-implement"` dispatch sites are `:8064`, `:10028`, `:10068`, `:10142`, `:10251` — exactly §3.3's list — and `"harvest-learnings"` is `:10448` (Phase H `wrappedDispatch`) and `:10542` (advisory distil), exactly the new comment. `PHASE_DISPATCH` row fields (`:3435`, `:3368`…) are consistently excluded from every constant's list, which matches §8.3's "at their dispatch sites" wording |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
