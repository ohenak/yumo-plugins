# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.4)
**Upstream read:** `REQ-pdlc-headless-engine.md` (AC-3.3), `FSPEC-pdlc-headless-engine.md` (§6.2, BR-MODEL-2/3), `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-07)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v4.md` (2 High, 0 Medium, 1 Low)
**Diff reviewed:** `041d865b..HEAD` on the TSPEC (+321/−39)
**Date:** 2026-08-11
**Iteration:** 5
**Scope:** delta re-review — v4 findings, and what v1.4 changed; unchanged sections not re-litigated

## Disposition of v4

| v4 finding | What v1.4 did | Status |
|---|---|---|
| F-01 High — §7.4 row 4 had no discriminator the harness could evaluate | §4.1 gains `outcome` (§4.2's member, stamped on settle) and `errorText` (`String(err?.message ?? err)`, verbatim, never parsed); §7.4's tuple gains those plus `attempt` and `promptHash`; row 4 becomes a pair `(F, B)` over recorded fields — same skill, same `promptHash`, `B.seq > F.seq`, `F.model === "fable"`, `F.outcome !== "ok"`, `F.errorText` containing the fixture's injected literal, `B.model === "opus"` | **Design resolved; the mechanism is not yet observable — see F-01 below.** The pairing premise checks out at HEAD: `dispatchAt` closes over one `prompt` (`orchestrate-dev.js:1840-1841`) and both rungs go through it (`:1851`, `:1861`), so `F` and `B` are byte-identical in the composed prompt while differing in `model`. Deleting `:1851`→`:1861` leaves the `fable` `F` unpaired and the row red, which is what I asked for. What is missing is the write-timing of the record `_assert-suite-wide.mjs` actually reads |
| F-02 High — §4.6's timeout oracle was green on the default | §4.6 pins run i's fixture to `dispatch.timeoutMinutes: 7` and asserts the literal `420000` at the boundary plus the literal `7` in the report; §7.4 states the same fixture value | **Resolved, and for the reason given.** `DEFAULT_TIMEOUT_MS = 30 * 60 * 1000` (`transport.mjs:64`, the `defaultTimeoutMs` constructor default at `:139`, applied per dispatch at `:152`) really is the tunable's own default, so at 30 the oracle was self-consistent and false. At 7 a dropped stamp leaves 1 800 000 against a reported 7. Both literals are spec transcriptions, neither is derived from the code under test |
| F-03 Low — §7.4 mis-quoted the wave-mode condition | §7.4 now transcribes `const waveMode = Boolean(iOwnership) && iContract !== null && iContract.ok === true;` and says why the implied conjunct is kept | **Resolved.** Byte-identical to `orchestrate-dev.js:9995` |

Both v4 Highs were answered where I asked — in the data, not in prose — and the supporting
citations I re-checked at HEAD are exact: `adapter.mjs:215`/`:224`/`:225` (the constructor-option
shape `dispatchTimeoutMs` joins), `:266-268` (the stale comment), `:278-281` (the conditional
build), `bin/pdlc.mjs:173`/`:205` (the two `createAdapter` sites), `orchestrate-dev.js:1780`/`:1791`
(`MODEL_ERROR_RE`, `isModelResolutionError`), `:1844`/`:1845` (the memo), `:9968` (`haiku` PLAN-DAG,
after `phaseFn("Phase I: Implementation")` at `:9951`), `:10248`→`:10253` (the V-wave on
`MODEL_IMPLEMENTATION`), `:10099-10100` (the script-owned gate).

## Findings

One High, and it is the last hop of the fix v1.4 landed rather than a disagreement with it. The
descriptor now carries the discriminator; the channel the assertion reads does not yet carry the
descriptor's terminal half.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **Row 4's new conjuncts are stamped after the record is written, so as specified the harness still cannot evaluate them.** §7.0 fixes the accumulator as **append-only JSON lines** — "each process appends its observations as JSON lines to `${PDLC_TEST_RUN_DIR}/{pid}.jsonl` … append-only per-pid files need no locking" (`TSPEC:1372`) — and §7.4 still says, in the same section the revision edited, "**A descriptor is recorded when a dispatch is *composed***, whether or not a model call is executed" (`TSPEC:1651`). §4.1 is explicit that the terminal half is *not* available then: "Every field above is stamped when the dispatch is *composed*" (`:721`), while `outcome` is "stamped when the dispatch settles; null only in flight" (`:668`) and `errorText` likewise. A line appended at composition therefore carries `outcome: null, errorText: null` forever — the in-memory descriptor is mutated later, but the JSONL line is not, and `_assert-suite-wide.mjs` reads only the lines. Under a literal implementation, row 4's `F.outcome !== "ok"` and the `errorText` match are unsatisfiable and row 4 is **red on correct code**; under the obvious repair-in-the-dark, an implementer loosens the row back to the residue v4 rejected. Either way M-ENG-07 row 7's — row 4's — witness is lost again, which is the same product consequence F-01 named last round. **Fix:** state the write-timing as part of the design, in §7.4 or §7.0, and reconcile the `:1651` sentence with it. Two shapes both work and both keep FSPEC BR-MODEL-3 ("a descriptor exists when a dispatch is composed … no row depends on billed traffic", `FSPEC:654-656`) true: (a) one line per dispatch, appended **when the dispatch settles**, with composed-but-never-executed dispatches (the dry-run corpus) appended at composition with `outcome: null` — the row-4 conjuncts then simply never match those; or (b) two lines, a composition line and a settlement line joined by `(corpusRun, seq, attempt)` in the assert script. Whichever is chosen, say which line row 4's `F` is, so the pair predicate is decidable from the file. | AC-3.3, BR-MODEL-3 |
| F-02 | Medium | Local | **The fifth suite-wide row names no filter field, so "every run-shaped test" is not computable from the records.** The new row asserts `byPhase["(no phase)"]` is "absent or `0` on every run-shaped test" (§7.4 table), and §4.1 explains the exclusion in prose — "not on unit tests that dispatch through the adapter without announcing a phase; those construct the adapter directly and are outside the run-shaped set". But the accumulator is one union of per-pid lines with no test identity in it; the only recorded field that could carry the distinction is `corpusRun` (harness-supplied, §7.4), and the document never says so. This is my v4 Q-02 unanswered rather than a new defect, and it is Medium rather than High because a reasonable implementer will reach for `corpusRun != null` — but if they instead assert over the whole union, the row is red on every unit test that dispatches without a phase, and the repair under time pressure is to delete the row. **Fix:** one clause naming the filter — e.g. "records with `corpusRun` set" — in the fifth row's assertion cell. | AC-3.3, AC-4.5 |
| F-03 | Low | Local | **The fifth row's predicate is written against a report key, while its stated seam is the descriptor accumulator.** The seam cell says it "rides the model-map accumulator, read on its `phase` field", and the records carry `phase: null` (§4.1); `"(no phase)"` is the *report* key §4.4's projection produces, not a value present in the JSONL. Both readings compute the same thing, so nothing is wrong — but §7.4's own standard is that the table is "the checklist `_assert-suite-wide.mjs` is built from", and a checklist row keyed on a field the file does not contain invites the implementer to reach for the report instead of the records. **Fix:** state the predicate over the records — "no record with `phase === null`" — and keep `byPhase["(no phase)"]` as the reader-facing gloss. | AC-4.5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | `errorText` is specified verbatim (`String(err?.message ?? err)`) and is appended to a file under `PDLC_TEST_RUN_DIR`. In the hermetic corpus the rejections are fixture-injected, so nothing sensitive can reach it — but is that reasoning worth one line, given the same descriptor shape is the one the adapter carries on a live opt-in run (§7.5)? Not a finding: §7.5's path does not write to the accumulator as far as I can see, and no REQ/FSPEC clause requires redaction. |
| Q-02 | Row 4 forbids nothing about retries: a rate-limit retry of the `fable` rung appends a second `F`-shaped record under a shared `seq`. The pair is existential, so this cannot break it — but if the settlement-line shape (F-01's option (a)) is chosen, does each retry attempt get its own line? §4.1 says one descriptor per attempt, which reads as yes; naming it in §7.4 would save the implementer the derivation. |

## Positive Observations

- **The fix went into the data, not into the prose, and it is falsifiable by the deletion it exists
  to catch.** The three properties §7.4 states for the new witness are the right three, and the
  middle one — "it reads no ordering beyond `B.seq > F.seq`" — is what lets the row close my F-01
  without re-opening TE F-23's flakiness. `promptHash` is a genuinely good choice: it is the one
  link the *engine* can see, given that seam identity lives in `orchestrate-dev` and stamping it
  would breach §8.3's boundary — and the document says exactly that, rather than quietly picking it.
- **The revision refused the cheap version of both Highs.** F-01 could have been closed by weakening
  row 4 to something true; F-02 could have been closed by deleting the sentence about what the
  oracle catches. Instead the descriptor grew two fields and the fixture grew a non-default timeout,
  and §8.3's edit surface row for `adapter.mjs` was updated to carry both — so the edit surface
  still enumerates everything the design asks for.
- **`outcome` was not allowed to grow a seventh member.** Adding "model did not resolve" to §4.2
  would have been the shortest path to a discriminator and would have put `orchestrate-dev`'s
  vocabulary (`MODEL_ERROR_RE`) inside `outcome.mjs`, against R-ARCH-2. The document names that
  temptation and declines it, then gets the discriminator from `errorText` matched against the
  *fixture's* literal rather than the module's regex — no implementation echo, which is precisely
  the oracle-quality bar this phase is being held to.
- **TE Q-12's answer is load-bearing and correct at HEAD.** I re-checked: the `haiku` PLAN-DAG
  dispatch (`orchestrate-dev.js:9968`) is composed after `phaseFn("Phase I: Implementation")`
  (`:9951`) and inside the `parsePlanTasks`-empty fallback (`:9959-9962`), so it would indeed be
  inside the wave set carrying `haiku`, and rows 1/2 scoped to run i are right rather than timid.
  Recording *why* the tempting widening is wrong, next to the definition, is the same discipline as
  the memoisation note beside rows 3/4.
- **Nothing in the diff narrows or reinterprets an acceptance criterion.** AC-3.3's two directions
  are still asserted verbatim; the corpus is still five run configurations; BR-MODEL-3's
  composed-not-executed guarantee is preserved in intent (F-01 is about where that guarantee is
  written down, not about abandoning it); §4.6's new fixture pin serves BR-CLI-3 rather than
  trimming it. No scope creep, no product decision made in the TSPEC.

## Recommendation

**Needs revision** — one High, and a narrow one. The two v4 Highs are genuinely closed in design:
row 4 now discriminates on recorded fields, and §4.6's oracle can now fail. F-01 is the remaining
hop between the descriptor and the file the assertion reads: §7.0 made that file append-only and
§7.4 still says the line is written at composition, which is before `outcome` and `errorText` exist.
That is one paragraph of design, not a rethink, and until it is written the row this whole round was
about is either red on correct code or quietly loosened at implementation time.

To close:

1. **F-01 (High)** — pin the record's write-timing in §7.4/§7.0 and reconcile `TSPEC:1651` with it,
   keeping FSPEC BR-MODEL-3's composed-not-billed guarantee: settlement-time line with a
   composition-time line for never-executed dispatches, or two lines joined by
   `(corpusRun, seq, attempt)`. Say which line row 4's `F` is.
2. **F-02 (Medium, non-gating)** — name the field that scopes the fifth row to run-shaped tests.
3. **F-03 (Low, non-gating)** — state the fifth row's predicate over `phase === null` records.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
