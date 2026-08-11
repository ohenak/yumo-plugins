# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.5)
**Date:** 2026-08-11
**Iteration:** 7

**Scope:** delta re-review against v6. `git diff 22eb0b3b..HEAD --
docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` is **empty** — the document is
byte-identical to the revision I approved with minor changes in round 6. The delta in this
round is entirely **upstream**: FSPEC moved v1.3 → v1.5 (the erratum round my v6 review
filed, plus the POSTMORTEM-T v2.0 resolution), and that movement is what this review
checks TSPEC against. Every claim below is grounded in HEAD source on
`feat-pdlc-headless-engine` and cited `file:line`.

## Prior findings disposition

None of v6's three findings (0 High, 2 Medium, 1 Low) is addressed, because the document
did not change. All three were explicitly non-blocking and folded-forward by agreement, so
this is not a regression — it is the state I approved. They carry into this round unchanged,
and one of them (F-36) is now **settled in its own favour by the upstream edit**.

| v6 finding | Disposition | Verification |
|---|---|---|
| F-36 Medium — the "composed but never executed → `null` terminals" branch has no producer at HEAD | **Still open, and the upstream half of the argument has now landed.** I offered two repairs: drop the clause, or requalify it per FSPEC BR-MODEL-3. FSPEC took the *second* — v1.5's BR-MODEL-3 now reads "The dry-run surface is **not** a way to reach it: one invocation composes one skill's prompt and dispatches nothing … so it exercises at most one row and is never the corpus's source" (`FSPEC:670-674`). TSPEC's clause still says the opposite half out loud: the `null`-terminal line exists so as to keep BR-MODEL-3 "true in both halves" (`TSPEC:789-794`). The branch remains unproducible — `emitDryRun` calls `adapter.composePrompt` directly (`pdlc/engine/bin/pdlc.mjs:190`) and never `_agent`; had a dispatch been attempted, `inertTransport().dispatch()` **throws** (`:100-102`), which settles as an error outcome, not `null` terminals | `pdlc/engine/bin/pdlc.mjs:98-104`, `:171-193`; `FSPEC:670-674`; `TSPEC:789-794`, `:1429-1432` |
| F-37 Medium — row 4's pinned `transport-contract-violation` vs §5.3's engine-fatal rule | **Still open, unchanged.** §5.3's engine-fatal sentence (`TSPEC:1184`) and §7.4 row 4 still read side by side without the escape-scoping clause. Re-derived at HEAD and the reconciliation still holds: `resolveAdvisoryRung`'s dispatch-error arm catches and re-enters the `opus` rung (`pdlc/workflows/orchestrate-dev.js:3143-3157`), so the rejection never reaches `run.mjs`'s top-level catch | `TSPEC:1184-1194`, §7.4 row 4 |
| F-38 Low — run iv's fixture should be named as throwing §3.4's `TransportError` | **Still open, unchanged.** Row 4's parenthetical still derives the member without naming the class the fixture injects | §7.4 row 4, §3.4 |

## Findings

No High findings. The document did not change, so nothing in it was weakened; the only new
finding is one the upstream edit created underneath it. Three findings are v6's, carried
forward verbatim in substance and re-verified at HEAD rather than restated on trust.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-39 | Medium | Process | **All five of TSPEC's `FSPEC:{line}` citations now point at the wrong text — FSPEC v1.4/v1.5 inserted 15 lines of change note above them and 2+2 more in the body.** Each was correct when written and none is correct now: `FSPEC:193-196` (TSPEC:601, cited for "no transport selector") now lands on §3.2's flag table; the sentence meant is at `FSPEC:208-211`. `FSPEC:654-656` (TSPEC:792, BR-MODEL-3) now lands mid-§7.3; BR-MODEL-3 is at `FSPEC:670-674`. `FSPEC:709` (TSPEC:1096, the *meaning* of `agent-reported-failure`) now lands on AT-ENG-29's row; the member's meaning is at `FSPEC:727`. `FSPEC:1149-1160` (TSPEC:942) now lands in §12.1's prose; §12.2's table is `FSPEC:1165-1177`. `FSPEC:190` (TSPEC:1753, the `--dry-run-skill` flag row) now lands on a blank line; the row is `FSPEC:203`. The fourth one carries the most weight: TSPEC:942's "**Row-by-row against FSPEC §12.2** … because a reader must be able to check completeness rather than infer it" is the anchor for the report's **set-equality completeness check**, and a harness author who follows the line range checks the field enumeration against the wrong region. Each citation also names its section id, so nothing is unrecoverable — but line pointers that silently rot are exactly the kind of grounding this pipeline pins on purpose. Repair is mechanical: re-derive the five ranges against FSPEC v1.5. **Worth stating as durable process signal:** a downstream doc citing an upstream doc by line number takes on a maintenance obligation every erratum round discharges, and this round proves the obligation is real | §3.4 (`TSPEC:601`), §4.1 (`:792`), §5.1 (`:1096`), §11 (`:942`), §7.4 (`:1753`) |
| F-36 | Medium | Local | *(carried from v6; upstream has now taken the side I flagged.)* **The "composed but never executed → both terminal fields `null`" branch has no production producer, and FSPEC v1.5 now says so explicitly.** The clause appears in four places (§4.1's settlement bullet `TSPEC:789-794`, §7.0's append-timing paragraph `:1429-1432`, §7.4 row 4's seam column, §8.3's `adapter.mjs` row) and names its production path as "the inert transport behind `--dry-run` (`bin/pdlc.mjs:173`)". That path produces no descriptor: `emitDryRun` builds the adapter (`pdlc/engine/bin/pdlc.mjs:171-178`) and then calls `adapter.composePrompt(skill, …)` **directly** (`:190`), never `_agent`, so no dispatch reaches the accumulator; and if `_agent` ever were called, `inertTransport().dispatch()` throws (`:100-102`), which settles as an error outcome, not `null` terminals. The rationale sentence is now upstream-contradicted outright: TSPEC says the `null` line keeps BR-MODEL-3 "true in both halves", while BR-MODEL-3 v1.5 says "The dry-run surface is **not** a way to reach it … never the corpus's source" (`FSPEC:670-674`). Not a false-green risk — no row's predicate matches a `null`-terminal line, and §7.4 says so — but it is a documented branch with no producer, no fixture and no oracle, which is the dead-branch shape §8.3 exists to keep out. Repair is now one-sided: drop the branch and the four restatements of it, since the requalification half already landed upstream | §4.1, §7.0, §7.4 row 4, §7.5, §8.3 |
| F-37 | Medium | Local | *(carried from v6, unchanged.)* **Row 4's pinned `outcome === "transport-contract-violation"` sits against §5.3's rule that the same member ends the run at exit `1`, and the scope that reconciles them is inferred, not written.** §5.3 (`TSPEC:1184`) says `auth-failure` and `transport-contract-violation` end a run at exit `1` "without a module halt"; row 4 requires that, *within run iv*, an `F` carrying that member is followed by a `B` on `opus` in the same run. Both are true only because §5.3's catch sits at the top of `runDev`/`runQueue` and the advisory rung's dispatch error never escapes — `resolveAdvisoryRung` catches it and re-enters the `opus` rung (`pdlc/workflows/orchestrate-dev.js:3143-3157`). Unwritten, a harness author cannot tell whether run iv's fixture should end exit `1` or continue. One clause on row 4 or in §5.3 closes it | §7.4 row 4, §5.3 (`TSPEC:1184-1194`) |
| F-38 | Low | Local | *(carried from v6, unchanged.)* **Row 4's derivation runs through `classifyThrown` (`pdlc/engine/lib/transport.mjs:123`), which lives in the real transport, but run iv uses a fixture double — nothing states the double must throw §3.4's `TransportError` for the derived member to appear.** Naming the injected class in the row's parenthetical makes the fixture requirement explicit at the point of use | §7.4 row 4, §3.4, §7.2 |

## Questions

| ID | Question |
|----|---------|
| Q-16 | *(carried from v6, still unanswered because the document did not change.)* If F-36 is resolved by dropping the branch, does §7.4's fifth suite-wide row still need `corpusRun != null` as its scope filter? The answer turns on whether unit tests that construct an adapter directly write to `${PDLC_TEST_RUN_DIR}` at all — they do if `_bootstrap.mjs` is `--import`ed into every test-file process (§7.0) and those adapters are real ones. If they do, the filter is essential and correctly placed; if they do not, it is defensive and the row reads narrower than it is. Either answer is fine; the harness author should not have to discover which. |
| Q-17 | Now that FSPEC v1.5 has requalified BR-MODEL-3, is any TSPEC oracle still reachable through `--dry-run` at all, or is the dry-run surface purely an inspection surface with no assertion hanging off it? §7.4 already routes the model-map corpus through fixture-driven runs and explicitly declines `--dry-run-skill` as the instrument (`TSPEC:1753-1758`), and §5.4 gives `--dry-run` an exit-`0` row (`TSPEC:1200`). If the exit-code row is its only oracle, saying so in one clause would let the next reader stop re-deriving the answer — this is the third round in which the dry-run surface's testing role has had to be re-established from source. |

## Positive Observations

## Recommendation

## Verdict
