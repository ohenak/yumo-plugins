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

Both Highs are in text v1.3 added, and both are the same shape: an oracle whose stated purpose is to
catch a specific regression, but which stays green when that regression happens. Neither is a
disagreement with the design — the designs are right; the assertions written to protect them are not
yet decidable from what the run records.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§7.4 row 4 now has no discriminator the harness can evaluate, so it is green when the advisory fallback never fires.** Dropping the `seq` adjacency conjunct (TE F-23) removed the only recorded link between the `fable` dispatch and its `opus` fallback and replaced it with prose — "recorded within the same advisory-seam invocation whose `fable` descriptor raised the model-resolution error the fixture forces". §4.1's `DispatchDescriptor` records `skill, label, phase, seq, prompt, model, cwd, timeoutMs, attempt` (plus the harness's `corpusRun`); **there is no seam-invocation field and no error/outcome field**, so neither half of that clause is derivable. What an implementer can actually write is the residue — `skill === ADVISORY_RUNG_SKILL && model === "opus"` — and §7.4 itself says two paragraphs earlier why that is worthless: the fallback is "descriptor-identical to an ordinary `opus` `se-review` reviewer dispatch" and "corpus run iv passes while the fallback branch never executed — precisely the failure AC-3.3 names" (`ADVISORY_RUNG_SKILL = "se-review"`, §3.3). Run iv is a whole pipeline run full of `opus` `se-review` reviewer dispatches, so the row is not merely weak, it is unfalsifiable. The product consequence is M-ENG-07 row 7's rung losing its only witness: the advisory fallback could stop working and AC-3.3's reverse direction would still report green. **Fix:** make the discriminator a recorded field. Either (a) record one on the descriptor — a seam/invocation id, or the dispatch's terminal outcome, so "the `opus` descriptor from the invocation whose `fable` sibling failed" is a predicate over data; or (b) restore an ordering link *scoped to `ADVISORY_RUNG_SKILL` descriptors* rather than run-wide adjacency — the `fable` descriptor's `seq`, and the next `ADVISORY_RUNG_SKILL` descriptor by `seq` — which the memo in `_state.resolved` (`orchestrate-dev.js:1844`) makes unique per run and which does not carry TE F-23's flakiness, since it never asserts that nothing else dispatched in between. Whichever is chosen, state it as a predicate over recorded fields, the way rows 1, 2 and 5 are. | AC-3.3, M-ENG-07 |
| F-02 | High | Local | **§4.6's new effective-timeout assertion is green at the default values, including on the regression it names.** The rule reads: "a test asserts that the `timeoutMs` observed at the transport boundary equals the reported `tunables.timeoutMinutes` × 60 000 … so a regression that dropped the stamp is red rather than silently served by `defaultTimeoutMs`". That last clause is false as the fixture set stands. §4.6's table gives `dispatch.timeoutMinutes` a default of **30 min**, and the fallback it is meant to distinguish itself from is `DEFAULT_TIMEOUT_MS = 30 * 60 * 1000` — "30 min, matches REQ `dispatch.timeoutMinutes` default" (`transport.mjs:64`, consumed at `:139`, `:152`). Drop the stamp and the boundary still observes 1 800 000 ms while the report still says 30, the two agree, the test passes. Both channels are also run-produced, so nothing in the assertion is anchored to a literal from the spec — the comparison is self-consistent by construction whenever the two defaults coincide, which by design they always do. BR-CLI-3's promise is that the *reported* tunable is the one in force; this assertion cannot currently detect it being false. **Fix:** one sentence pinning the fixture: the test's engine configuration sets `dispatch.timeoutMinutes` to a value **≠ 30** (any non-default, e.g. 7), so the stamped value and `transport.mjs:64`'s constructor default are distinguishable, and assert the boundary value against **both** the reported tunable and the literal 7 × 60 000. The same fixture then also proves the presence half of §3.4 is carrying a real value rather than a coincidence. | BR-CLI-3, AC-4.5 |
| F-03 | Low | Local | **§7.4 mis-quotes the wave-mode condition it presents as a quotation.** The line reads ``waveMode = Boolean(iOwnership) && iContract.ok === true`` (`orchestrate-dev.js:9995`); HEAD is `const waveMode = Boolean(iOwnership) && iContract !== null && iContract.ok === true;`. The dropped conjunct changes nothing semantically (`iContract` is `null` exactly when `iOwnership` is falsy, `:9993`), and the fixture consequence the paragraph draws is correct. But §7.4's whole method is that transcriptions are literal, and this is the section arguing that abridged transcription is how translation defects enter. **Fix:** quote the line as written, or drop the backticks and state the condition in prose. | AC-3.3 |

## Questions

## Positive Observations

## Recommendation

## Verdict
