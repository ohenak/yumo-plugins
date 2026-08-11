# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.8)
**Date:** 2026-08-11
**Iteration:** 6
**Scope:** delta re-review of `ba92cb92`…`d14db5b0` (POSTMORTEM-F resolution round) against the
v5 approval. Only the changed cells were re-read; unchanged, already-approved sections were not
re-litigated. Every citation the changed cells added was re-verified at HEAD (DEC-ERR-03), not
carried from the prior round.

## Delta scope

`git diff ba92cb92..d14db5b0` touches two files and four cells. The REQ body changed by exactly
one clause — §1.2a's red list drops `AC-4.4` (`REQ:108`). Everything else lands in the cited fact
`docs/_constraints/pdlc-engine-baseline.md`, M-ENG-06:

| # | Changed cell | Direction |
|---|---|---|
| 1 | AC-4.1 lifted out of the **green** row into its own **partially green** row | green → weaker |
| 2 | AC-4.4 moved from **red — open work** to **partially green**, with four citations | red → stronger |
| 3 | AC-2.3's partially-green row gains a test citation (`transport.test.js:170`) | evidence added |
| 4 | REQ §1.2a red list drops AC-4.4, tracking change 2 | follows |

Two of the four are re-derivations that *weaken* a prior claim (AC-4.1 out of green; the AC-4.4
row is careful to name what stays unasserted). That is the correct direction for a POSTMORTEM
resolution round — this round makes the table less flattering to HEAD, not more.

## Prior-finding disposition

| Prior | Severity | Status | Verified at HEAD |
|---|---|---|---|
| v5 F-01 (M-ENG-06's green row carries clauses that are not green at HEAD) | Medium | **Partially addressed** | The AC-4.1 half is fixed — it now has its own partially-green row. The two clauses I actually named are unchanged: the report's transport field is still one hardcoded configuration scalar (`pdlc/engine/lib/report.mjs:50`, `transport: "agent-sdk"`), never per-dispatch as AC-4.5:558-563 now requires; and the report carries no stop-reason field at all (no `stopReason` in `report.mjs`), while AC-1.3's two-reason closure sits unqualified in the green row. Re-raised below as F-01, unchanged severity. |
| v5 F-02 (`queue.maxIterations` default contradicts HEAD; a third stop reason exists) | Medium | **Not addressed** | Still true, and now split across two layers: the CLI defaults to unbounded (`bin/pdlc.mjs:305`, `Infinity` unless `--max-iterations` is passed — this half matches §4.1), but the module default is still 100 (`run.mjs:273`, `maxPasses = 100`) and the loop still returns a third outcome AC-1.3 does not admit (`run.mjs:282`, `outcome: "max-passes"`). Re-raised as F-02. |
| v5 F-03 (M-ENG-06's totality sentence over-states "exactly one row") | Low | **Not addressed** | `pdlc-engine-baseline.md:87` still reads "appears in exactly one row below" while AC-4.5 legitimately spans two rows (green-except-auth-clause, and the red row's per-dispatch auth clause). Re-raised as F-03. |
| v5 Q-01 (hook/settings provenance under the SDK transport) | — | Open, unchanged | Not in this round's scope; carried forward. |

None of the three is blocking, and none was ever claimed to be. The round's own scope was the
POSTMORTEM-F items, which it discharges.

## Verification of the changed cells

Every citation the round added, read at HEAD this round:

- **AC-4.4's four claims all hold.** `AuthPolicyError` is defined at `transport.mjs:23`;
  `classifyThrown` passes it through first at `:100`; it is thrown at `:204` inside the
  `system`/`init` branch — i.e. **before any model output**, and the message names the failing
  `apiKeySource` (`:205`); it is structurally never retried, because `adapter.mjs:291` rethrows
  anything that is not a `RateLimitedError`. The test citation is exact: `transport.test.js:50`
  is the test, `:63` is the `instanceof AuthPolicyError` assertion, and the test also pins
  `apiKeySource`, `allowedSources`, and that the stream never advanced past the gate (`:69`).
  The row's *unasserted* half is stated honestly and is also true: the string `auth-failure`
  appears nowhere in `pdlc/engine/`, and nothing asserts the halt travels the modules' halt path.
- **AC-4.1's downgrade is correct and its negative claim is literally true.** `transport.mjs`
  defines four error classes (`:23`, `:33`, `:46`, `:55`) plus the success path, and each has a
  test (`transport.test.js:50`, `:95`, `:115`/`:133`/`:143`, `:159`). I grepped
  `pdlc/engine/` for `transport-contract-violation` and `agent-reported-failure`: zero hits, so
  the six-member catalogue AC-4.1:511-518 declares does not exist at HEAD and no set-equality
  test could be passing. Leaving this in the green row was the real defect; the round found it.
- **AC-2.3's added citation is exact.** `transport.test.js:170` is the test named. Its scope is
  correctly bounded — it captures `options.env` from a single dispatch, so BR-ENV-3's
  *every-dispatch* half and the fallback transport's child env stay listed as unasserted.
- **The table is still total, by set-equality not containment.** I enumerated all 26 criteria in
  the REQ (`AC-1.1`…`AC-6.4`) and matched them against M-ENG-06's rows including the slash forms
  (`AC-2.1/2.2/2.4`, `AC-5.1/5.2`, `AC-1.4/4.3/6.1`). Both sets are equal; moving AC-4.1 and
  AC-4.4 between rows preserved totality, and §1.2a's dropping of AC-4.4 from the red list is
  the consistent follow-through.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The green row's AC-4.5 and AC-1.3 cells still promise regression protection for two clauses that are red at HEAD** *(v5 F-01, re-raised; the AC-4.1 half of it was fixed this round)*. AC-4.5:558-563 requires the transport to be a **per-dispatch recorded field** drawn from what the engine invoked; HEAD emits one hardcoded configuration-derived scalar, `transport: "agent-sdk"` (`report.mjs:50`). AC-4.5:563-564 and AC-1.3 require the report to name which of the loop's two stop reasons ended it; `report.mjs` has no stop-reason field at all. A TSPEC author reading these two cells as "green — regression-protecting" will size them as re-assert-green work and write tests that fail on the first run, which is precisely the mis-estimate §1.2a exists to prevent (TE v1 F-07). Fix is the pattern the table already uses twice: qualify the cells — `AC-4.5 **except its per-dispatch auth and per-dispatch transport clauses**`, and `AC-1.3 **except the reported stop reason**`. | §1.2a; AC-4.5; AC-1.3; `docs/_constraints/pdlc-engine-baseline.md` M-ENG-06 |
| F-02 | Medium | Local | **`queue.maxIterations`'s declared default still contradicts HEAD's module default, and AC-1.3's two-reason closure is still not testable as written** *(v5 F-02, re-raised unchanged)*. §4.1 declares the loop unbounded by default, ending only on exhaustion or an operator-set positive bound. At HEAD the CLI agrees (`bin/pdlc.mjs:305`, `Infinity` absent `--max-iterations`) but the module does not (`run.mjs:273`, `maxPasses = 100`), and the loop returns a **third** stop reason AC-1.3 does not admit (`run.mjs:282`, `outcome: "max-passes"`). A test written against AC-1.3's closed two-member set fails against the module-level entry point. Either §4.1/AC-1.3 admits `max-passes` as a third reason, or the REQ states that the 100 is a module-internal default the CLI always overrides and is out of AC-1.3's scope. | §4.1; AC-1.3 |
| F-03 | Low | Local | **M-ENG-06's totality sentence still over-states the invariant it is defending** *(v5 F-03, re-raised)*. `pdlc-engine-baseline.md:87` says every criterion "appears in exactly one row below", but AC-4.5 deliberately and correctly spans two rows (report fields and pause rows in green; the per-dispatch auth clause in red), and F-01's fix will add a third clause to that split. A reader who finds AC-4.5 twice must decide whether it is a duplication defect. One trailing subordinate clause — "…in exactly one row, except where a criterion's clauses are in different states and the split is named in both cells" — resolves it, in the same sentence F-01's fix will edit anyway. | `docs/_constraints/pdlc-engine-baseline.md` M-ENG-06 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(re-asked rounds 2–5, unchanged, not in this round's scope)* O-2 still names hook/settings provenance as the largest open safety gap, and AC-5.1 asserts guard refusal on **either** transport. If the SDK path turns out to accept no PreToolUse-equivalent, does AC-5.1 become a blocking gate on the primary transport — meaning a run that would delete artifacts must use the fallback? |

## Positive Observations

- **The round moved the table in the harder direction.** Two of four changed cells *reduce* a
  claim about HEAD (AC-4.1 out of green; AC-4.4's promotion carries an explicit unasserted half).
  A resolution round that only promoted rows would be the suspicious one; this one re-derived and
  found that a cell in the green row had never been green. That is the §1.2a mechanism working.
- **AC-4.4's new cell is a model of a testable partially-green row.** It names the artifact
  (`AuthPolicyError`), the ordering property that makes it meaningful (thrown *before* any model
  output), the structural reason retry is impossible (`adapter.mjs:291`'s rethrow) and the test
  that pins it — then names the two halves still open. Every one of those is a `file:line` I
  could confirm in a single read. A TSPEC author can size this row without re-deriving it.
- **The honest negative on AC-4.1 is the strongest sentence in the diff.** "the strings
  `transport-contract-violation` and `agent-reported-failure` appear nowhere in `pdlc/engine/`"
  is a claim a reviewer falsifies with one grep, and it is the claim that makes AC-4.1's
  set-equality oracle legibly red. Compare an absence-only phrasing like "set-equality is not
  tested", which would have been unfalsifiable at this altitude.
- **Totality survived the row surgery.** Moving criteria between rows is exactly where a
  one-row-per-AC invariant usually breaks. I checked by set-equality over all 26 criteria rather
  than spot-checking the moved ones, and both sets match.

## Recommendation

**Approved with minor changes**

The POSTMORTEM-F items are discharged in the document, every citation the round added is exact at
HEAD, and no previously approved oracle regressed — the changes only weaken or evidence claims
about HEAD, never strengthen an unsupported one. The REQ remains a sound basis for TSPEC and
PROPERTIES authoring.

Three findings are residue, all carried from v5 and all non-blocking. F-01 is the un-fixed half of
my prior finding: this round pulled AC-4.1 out of the green row but left the two clauses I
originally named (AC-4.5's per-dispatch transport field, AC-1.3's reported stop reason), both
verifiable as absent at `report.mjs:50`. F-02 is a documented default that disagrees with
`run.mjs:273` plus a third stop reason AC-1.3 does not admit. F-03 is a one-clause wording fix in
the very sentence F-01's fix will edit. A TSPEC author reading these ACs still knows what to
build; they would only mis-estimate whether the first test starts red.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:6028109747c2359f41ef57567abc85691670b2ad330ce413389118a3d78409ba
REVIEWED-COMMIT: d14db5b0943b1fc8c9ea6e7cc4c2e7631aa983d0
