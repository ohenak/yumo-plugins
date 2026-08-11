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

Scoped to text added or changed in v1.5. No High findings: nothing in the revision weakened a
previously approved section, and the one fix that mattered (record-append timing) landed in the
design rather than in a reassurance. Two Mediums and one Low, all one- or two-sentence edits.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-36 | Medium | Local | **The "composed but never executed → appended with `null` terminals" case cannot arise at HEAD, so it specifies a branch no test can cover.** The new clause appears four times (§4.1's settlement bullet, §7.0's append-timing paragraph, §7.4 row 4's seam column, §8.3's `adapter.mjs` row) and each names the same production path: "the inert transport behind `--dry-run` (`bin/pdlc.mjs:173`)". That path produces no descriptor at all. `emitDryRun` (`bin/pdlc.mjs:171`) builds the adapter and then calls `adapter.composePrompt(skill, …)` directly (`:190`) — it never calls `_agent`, so nothing is composed *as a dispatch* and nothing reaches the accumulator. And if `_agent` ever were called on that adapter, `inertTransport().dispatch()` **throws** (`bin/pdlc.mjs:98-104`), so the attempt would settle with an error outcome, not with `null` terminals. Both halves of the named case are therefore unreachable. This is not a false-green risk — no row's predicate matches a `null`-terminal line, as §7.5 says — but it is an implementation instruction with no production caller and no fixture, which is exactly the dead-branch shape §8.3 exists to keep out. Two clean repairs: drop the clause and say instead that **every recorded line is a settlement line** (true at HEAD, and it simplifies row 4's "F is a settlement line" to a tautology), or keep it and name the real path it is reserved for. The upstream sentence it inherits is FSPEC BR-MODEL-3's "reachable from dry runs" (`FSPEC:654-656`), filed as an erratum rather than fixed here. | §4.1, §7.0, §7.4 row 4, §7.5, §8.3 |
| F-37 | Medium | Local | **Row 4's newly pinned member is the same member §5.3 declares engine-fatal, and the scope that reconciles them is unstated.** §5.3 says "`auth-failure` and `transport-contract-violation` end the run at exit `1` **without any module halt**" (TSPEC:1184), while row 4 now requires, *within run iv*, an `F` with `outcome === "transport-contract-violation"` followed by a `B` on `opus` in the same run. Read side by side, the harness author cannot tell whether run iv is supposed to end at exit `1` after `F`. It is reconcilable — §5.3's own mechanism sentence puts the catch at the top of `runDev`/`runQueue` (`run.mjs:187`, `:228`), i.e. it fires only for errors that *escape* the module, and the advisory rung's failure never escapes: `resolveAdvisoryRung`'s dispatch-error arm catches it and re-enters with the `opus` rung (`orchestrate-dev.js:3143-3157`, `:1851`→`:1861`) — but that scoping is inferred, not written, and it is now load-bearing for the corpus's marquee row. One clause on row 4 or in §5.3 ("engine-fatal classification applies to a rejection that reaches `run.mjs`'s top-level catch; a module that catches its own dispatch error, as the advisory fallback does at `orchestrate-dev.js:3143-3157`, keeps the run alive and the descriptor recorded") closes it, and also tells run iv's author that the fixture must assert exit `0`-shaped continuation, not exit `1`. | §7.4 row 4, §5.3 (TSPEC:1184-1194) |
| F-38 | Low | Local | **Row 4's derivation runs through `classifyThrown`, which lives in the real transport — run iv's double has to honour §3.4's contract for the derived member to appear.** The prose derives `transport-contract-violation` via "`classifyThrown`'s unrecognised arm (`transport.mjs:123`)", and that is correct for the SDK transport. Run iv dispatches through a fixture transport (§7.2), and §3.4's "both transports throw the same four classes" is what makes the derivation carry over — so the fixture must inject a `TransportError` (or something the double maps to one), not a bare `Error`. If a later author injects `new Error("model not found")` straight from the double, the recorded member depends on whatever the adapter does with an unclassified throw, and row 4 goes red for a reason that has nothing to do with the fallback. Naming the injected class in the row's parenthetical ("run iv's fixture throws `TransportError` carrying the literal message, per §3.4's shared class contract") makes the fixture requirement explicit at the point of use. | §7.4 row 4, §3.4, §7.2 |

## Questions

| ID | Question |
|----|---------|
| Q-15 | If F-36 is resolved the first way (every recorded line is a settlement line), does anything still need `corpusRun` to be nullable? The fifth row's scope filter reads `corpusRun != null` for unit tests that construct an adapter directly — worth confirming that those unit tests write to `${PDLC_TEST_RUN_DIR}` at all, since `_bootstrap.mjs` is `--import`ed into every test-file process (§7.0) and the adapter they build is the real one. If they do, the filter is essential and correctly placed; if a unit test's adapter has no accumulator wired, the filter is defensive and the row is narrower than it reads. Either answer is fine, but the harness author should not have to discover which. |

## Positive Observations

- **F-30 was fixed as a timing rule, not as a row-4 patch.** The available cheap repair was to
  restate row 4 so its conjuncts tolerated a composition-time line. Instead §7.0 gained the general
  rule ("any observation with a terminal half must be appended after that half exists") and then
  §4.1 applied it, with the other two accumulators explicitly checked against the rule ("message ids
  and `classifyOutcome` results have no terminal half and are appended at their one call"). That is
  the level the finding was about: append-only is a property of the seam, and the seam's document
  now states what the property costs.
- **The unsatisfiability was named out loud, with the tempting repair named too.** §4.1 spells out
  that a composition-time line would carry `outcome: null` forever, that `_assert-suite-wide.mjs`
  reads only the lines, and that "loosen row 4" would be the only available repair. Writing down the
  wrong fix next to the right one is the same move §7.4 already makes for "quantify rows 1/2 over
  the whole corpus", and it is the reason the last two rounds' fixes have held.
- **F-31's correction went past the label swap to the reason.** It would have been enough to swap
  `:173` and `:205`. §4.6 instead states why `doctor` cannot be a resolution point (its projection is
  §4.3's three startup facts, which are not tunables) and why the effective-value oracle belongs on
  `:205` (it is the only site whose dispatches reach a transport boundary). I checked `cmdDoctor`
  (`bin/pdlc.mjs:157-162`) and it is exactly as described — no adapter, no transport, and an explicit
  "No dispatch was performed." line.
- **F-32's member is derived, not looked up.** The prose reaches
  `transport-contract-violation` from §5.1's own table plus the elimination of the three named
  classes, so the row stays readable without opening `transport.mjs` — and the derivation is right:
  `classifyThrown`'s final `return new TransportError(...)` (`transport.mjs:123`) is the unrecognised
  arm. Pinning the member also closes the fixture-drift hole the row had, and the doc says which
  drift it closes rather than leaving "exact is better" as the argument.
- **F-34's answer added a fixture obligation instead of an assertion.** The weak fix was to assert
  "no `haiku` in run i" harder. The revision instead identified what run i's fixtures must *be*
  (well-formed `VERDICT:` trailers throughout) and observed that this is precisely the property run
  v(a) inverts — so the two runs' fixtures are now defined against each other. That is what makes
  "zero `haiku`" a check on the fixture rather than a restatement of it, and the document says so in
  those words.
- **Q-13/Q-14 were answered inside the witness bullets, and the bullet count was updated with
  them.** Three properties became five, and the header sentence counting them was changed in the
  same revision (`2e736bc6`). Small, but it is the class of drift F-33 was about, caught by the
  author rather than by this review.

## Recommendation

**Approved with minor changes**

The revision resolved all six v5 findings, and it resolved the leading one at the level it was
filed at: the record-append point is now a stated design rule with the append-only constraint that
forces it, not a clause added to row 4. Every citation the revision added checks out against HEAD —
`bin/pdlc.mjs:157/162/171/173/197/205`, `transport.mjs:123`, `orchestrate-dev.js:7454/7463/5992/6001`,
`adapter.mjs:273`, `FSPEC:654-656` — and nothing in v1.5 broke a previously approved section: §8.3's
"no file under `pdlc/workflows/` modified beyond declared exports" survives, because the settlement
append lands in `pdlc/engine`'s adapter and the two terminal fields are read by §7.4 alone.

The two Mediums are both one- or two-sentence edits and neither is a false-green: F-36 removes (or
grounds) a `null`-terminal branch that HEAD's dry-run path cannot produce, and F-37 writes down the
escape-scoping that reconciles row 4's newly pinned member with §5.3's engine-fatal rule. F-38 names
the class run iv's fixture must inject so the derived member actually appears. None needs a review
round to confirm; fold them into the next revision.

One upstream defect is filed as an erratum rather than fixed here: FSPEC BR-MODEL-3 claims the model
map's corpus is "reachable from dry runs", which HEAD's dry-run surface cannot support — it composes
one prompt and dispatches nothing (`bin/pdlc.mjs:190`, `:98-104`). The TSPEC already declines to use
`--dry-run-skill` as the instrument (§7.4, PM Q-03), so the erratum is about the upstream sentence,
not about this document's design.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:2ac2592d7f0085a64caf2e4d6080743fccaba7f9aa9e928ddbbbce5010a7965d
REVIEWED-COMMIT: 22eb0b3b07624811224ed9759821c0c6d6f91fbf
