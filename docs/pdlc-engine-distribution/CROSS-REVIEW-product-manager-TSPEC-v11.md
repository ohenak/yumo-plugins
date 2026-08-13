# Cross-Review: product-manager — TSPEC (delta re-review, frozen round)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md (v0.11)
**Date:** 2026-08-13
**Iteration:** 11

## Scope

Delta only. Diffed `72b6776f` (the commit carrying my v10) → HEAD over the TSPEC
and its sibling DECISIONS. Changed surface: header version row, changelog (v0.10 row
corrected, v0.11 row added), §3.1 two rows, §5.1's blocker-1 paragraph, §6.2's citation
sentence, §6.5's oracle section, §10.1's new S-7 row, §12.1's unit row — plus
DECISIONS §7 in the same edit. Nothing else in the TSPEC moved.

Upstream unchanged this round: REQ is still v0.10 (`REQ:18`) and FSPEC v0.2 (`FSPEC:16`)
at HEAD, the versions this TSPEC was approved against. Nothing to absorb, nothing to
route back.

Not re-reviewed: sections settled in rounds 1–9.

## Prior-finding disposition

| Prior | Item | Landed? | Evidence at HEAD |
|---|---|---|---|
| F-01 (Medium, Cross-Feature) | §6.2's signalled-child AC citation is false — AC-1.4 is the version-triple criterion, not an exit-code contract | **Yes, in both documents** | `TSPEC:588-592` now cites `exitCodeFor`'s refusal/crash-1, halt/block-2 mapping (`pdlc/engine/lib/run.mjs:290-294`, pinned by `PROP-EXIT-1` — `__tests__/exit-loop.test.js:88`) and says explicitly that AC-1.4 states nothing about exit codes; reasoning deferred to DEC-EDIST-06 rather than restated (my Q-02's preference). `DECISIONS:467-471` and its "Constraints that forced the shape" row (`:494-497`) carry the same correction, so the phrase is no longer wrong in two places. The stale phrase inside the v0.10 changelog row is also fixed. Behaviour unchanged: `128 + signum`, exact-number oracle |
| F-02 (Medium, Local) | §5.1's blocker-1 closure pointed a correction downstream at upstream documents | **Yes** | `TSPEC:216-223` now says the manifest edit *discharges* blocker 1, that O-8's owner field is unchanged, that REQ's O-8 and FSPEC's F-5 step 7 / Q-8 are upstream and not rewritten here, and that clearing O-8 still gates AC-3.1's real-channel leg. That matches HEAD: `FSPEC:211`, `:352`, `:653`, `:795` all still record three operator-owned blockers, and `REQ:578` keeps O-8 owner-unchanged. No FSPEC erratum opened — correct, since the divergence is now stated as a narrow engineering claim, not a re-count |
| F-03 (Low, —) | v0.10 changelog row said "Four items" over a five-item list | **Yes** | Row now reads "Five items" (`TSPEC:27`), list still numbered (1)–(5) |

## New material checked (TE F-45/F-46 fixes, changed sections only)

The round-10 blocking finding (TE F-45) was resolved by extending `resolvePluginRoot`'s
return with one `notices` key. Product-relevant checks:

- **Grounding is true at HEAD.** `resolvePluginRoot` does return
  `{ok, root, source, reason, tried}` with no notice channel (`pdlc/engine/lib/skills.mjs:200-201`
  JSDoc `@returns`, `:219`, `:245`). `runStartupChecks` does already call it through a
  `resolveFn` seam defaulting to `resolvePluginRoot` (`lib/startup.mjs:325`, `:361`).
  `readEngineConfig` does return `{config, notices}` (`lib/run.mjs:174`) and `bin/pdlc.mjs:262-263`
  does drain it. `source` for the env branch is literally `explicit override (PDLC_PLUGIN_ROOT)`
  (`skills.mjs:54`, `:217`), as §6.5's honour row asserts.
- **AC-5.6 is not narrowed.** The oracle now drives all four rows of §6.5's table with the
  honour direction asserted positively (root `===` env value, `source` unchanged, `notices`
  empty), the ignore direction asserted by catalogue id *and* rendered text, and the two
  unset rows asserting empty — absence paired with a positive on the same path, and the
  enumeration is the full four-row table rather than a sample. §12.1's unit row (`:1770`)
  and §10.1's S-7 say the same thing, so the three statements agree.
- **No scope added.** The `notices` key is an extension of a shipped return, not a new
  product surface; no acceptance criterion gained or lost behaviour this round.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **§6.5's honour-row assertion "the resolved root `===` the env value" is exactly true only for an absolute env value.** At HEAD the explicit branch returns `path.resolve(explicit)` (`pdlc/engine/lib/skills.mjs:214`, `:219`), so a relative `PDLC_PLUGIN_ROOT` resolves against cwd and the literal equality fails for a reason unrelated to the behaviour under test. Not a defect in the decision and not blocking — the fixture simply uses an absolute path — but one clause ("the env value, resolved as today") would stop a future implementer from reading it as a promise that the raw string is echoed back | AC-5.6 (REQ-EDIST-05) |
| F-02 | Low | Local | **The `notices` shape differs from the channel it is compared to, and the rendering step is left implicit.** §6.5 (`TSPEC:663-673`) specifies `{id, text}` records while the cited precedent, `readEngineConfig`'s `notices`, is `string[]` printed directly (`lib/run.mjs:174`, `bin/pdlc.mjs:262-263`). The TSPEC states the record shape explicitly, so nothing here is false; what is unstated is which field reaches the operator's console when startup surfaces it. A half-sentence in §6.5 or §10.1 S-7 ("surfaced as `text`") closes it. Recorded, not gating — the assertable contract the oracle needs is fully specified | AC-5.6 (REQ-EDIST-05) |

DEFERRED: adding an operator-facing assertion that the ignored-env notice reaches stdout (not only the resolver's return) — a product-visibility question worth a PLAN task, not a TSPEC re-opening.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §6.5 says `notices` is "empty on every row but the ignore branch". Is empty-array-always the contract (never `undefined`), so the oracle's three empty-row assertions can be `deepStrictEqual([])` rather than a truthiness check? Reading §10.1 S-7 I believe yes; worth one word if the PLAN author would otherwise guess. |

## Positive Observations

- **F-01's fix is the version I hoped for and one better.** Not only is the false
  `AC-1.4's exit-code contract` citation withdrawn in both documents, §6.2 now *defers*
  the reasoning to DEC-EDIST-06 instead of restating it — the constraint is stated once,
  in the place that owns it, so the two-document divergence cannot recur.
- **F-02's fix chose honesty over convenience.** The easy move was to declare O-8 recounted
  downstream; the document instead says exactly what the manifest edit does and does not do,
  and leaves the upstream owner field alone. That is the correct routing for a TSPEC.
- **TE F-45's resolution names a seam instead of a wish.** "Where is the notice observable"
  is answered against the shipped return, with the extend-don't-replace discipline already
  used for S-2, and the decide/render/surface split is written in three agreeing places
  (§3.1, §6.5, §10.1 S-7) so no implementer arbitrates it.
- **The four-row oracle is falsifiable in both directions.** The honour row closes the exact
  hole the absence-only wording left: an implementation ignoring the variable unconditionally
  now goes red.
- **Freeze respected.** Every hunk in the diff maps to a round-10 raised item; nothing from
  rounds 1–9 is re-opened and no upstream document was touched.

## Recommendation

**Approved.**

All three of my v10 findings are resolved at HEAD, verified against code rather than
against the TSPEC's prose. The revision broke nothing previously approved: no acceptance
criterion is narrowed, reinterpreted or dropped, no scope is added, and the one blocking
finding from the round (TE F-45) is closed with a grounded, product-neutral extension.
The two findings above are Low and non-gating — a fixture-level precision clause and an
unstated rendering field — and can ride any later edit or be handled in the PLAN.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:4e8b26ca7dbd497f9ee9e49af5012a49ee2cd2d2521e8b4e3d9b1b78466ec13a
APPROVAL-HASH-NORMALIZED: sha256:95ea76ea704653140db1982801bd313ba518daa2420d0067a5e687d25457cad5
REVIEWED-COMMIT: e6f519924cd47d693d32fb56d5c21b24f8b073ed
