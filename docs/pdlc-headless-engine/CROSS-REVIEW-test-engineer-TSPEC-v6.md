# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.5)
**Date:** 2026-08-11
**Iteration:** 6
**Scope:** delta re-review of v1.5 against v5's six findings (0 High, 3 Medium, 3 Low) and
Q-13/Q-14. Diffed `eae70701..HEAD` (the commit carrying the v5 review) on the TSPEC alone;
unchanged sections not re-reviewed. Every claim below is grounded in HEAD source on
`feat-pdlc-headless-engine` and cited `file:line`.

## Prior findings disposition

All six v5 findings are resolved, each re-derived from HEAD rather than from the changelog.

| v5 finding | Disposition | Verification |
|---|---|---|
| F-30 Medium — §7.0's append-only accumulator made row 4's terminal conjuncts unsatisfiable, because the record's write timing was left at composition | **Resolved, and stated in all four places that need it.** §4.1 gains an explicit bullet ("the descriptor is *stamped* at composition and *written* to §7.0's accumulator at settlement — one line per attempt"), §7.0 gains the general rule ("any observation with a terminal half must be appended after that half exists"), §7.4's row 4 seam column now says "appends one line per dispatch *attempt* at **settlement**", and §8.3's `adapter.mjs` row carries the same clause. The four statements agree on timing and on granularity | TSPEC §4.1, §7.0 (the new paragraph under the observation-directory table), §7.4 row 4, §8.3 |
| F-31 Medium — the two `createAdapter` sites were mis-attributed and `doctor` was named as one | **Resolved, and the correction matches HEAD exactly.** `:173` is inside `emitDryRun` (`bin/pdlc.mjs:171`), built over `inertTransport()` (`:174`); `:205` is inside `liveAdapter` (`:197`); `cmdDoctor` is at `:157` and its success arm prints "doctor: all checks passed. No dispatch was performed." at `:162`, constructing no adapter and no transport. §4.6 additionally states *why* that matters — `doctor`'s projection is §4.3's three startup facts, not tunables — and §4.6's effective-value oracle is now explicitly asserted on the `:205` path | `bin/pdlc.mjs:157`, `:162`, `:171`, `:173-174`, `:197`, `:205` |
| F-32 Medium — row 4's `F.outcome !== "ok"` was absence-shaped where the exact member is derivable | **Resolved, and derived rather than asserted.** Row 4 pins `F.outcome === "transport-contract-violation"`, and the prose derives it from §5.1 without reading the classifier: a model-resolution rejection is none of the three named classes, so the unrecognised arm maps it to `TransportError` and §5.1's table maps that to the pinned member. The regression the pin catches is named (a fixture that drifted into injecting a timeout or auth failure would still pass `!== "ok"`) | `transport.mjs:123` (unrecognised arm returns `TransportError`); TSPEC §5.1 table row `TransportError` → `transport-contract-violation` (TSPEC:1076) |
| F-33 Low — the lead sentence's accumulator count contradicted the table | **Resolved.** §7.4's lead now reads "three accumulators, not five", enumerates which three own one, and says which two ride/compute. Table, lead and closing paragraph now agree | TSPEC §7.4 lead and closing paragraph |
| F-34 Low — run i's "zero `haiku`" assertion covers a second site that went unstated | **Resolved with the right justification.** The wave-set note now names `recoverVerdict` (`orchestrate-dev.js:7454`, dispatching `model: "haiku"` at `:7463`, called at `:5992` and `:6001`) and states the fixture property that closes it: run i's reviewer fixtures emit well-formed `VERDICT:` trailers throughout — the property run v(a) deliberately violates. Both routes are closed by fixture content, and the doc says so | `orchestrate-dev.js:7454`, `:7463`, `:5992`, `:6001` |
| F-35 Low — the fifth row's seam and assertion columns named different fields | **Resolved, and the record/report distinction is now the point of the paragraph.** The predicate is stated over records ("no record with `corpusRun != null` has `phase === null`"), with `byPhase["(no phase)"]` kept explicitly as a reader-facing gloss because `"(no phase)"` is §4.4's report key and never appears in a `.jsonl` line. §7.0's third rule carries the same sentence | TSPEC §7.0, §7.4 fifth row and closing paragraph |

Q-13 and Q-14 are both answered in the design. Q-13: `promptHash` is over the **composed** prompt,
and `composePrompt(skill, prompt)` is indeed what the descriptor's `prompt` field would hold
(`adapter.mjs:273`). Q-14: no count is asserted, with the reason recorded (counting would couple the
row to retry scheduling — the flakiness TE F-23 removed). Both answers are where a later author will
hit the question, not in a changelog.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
