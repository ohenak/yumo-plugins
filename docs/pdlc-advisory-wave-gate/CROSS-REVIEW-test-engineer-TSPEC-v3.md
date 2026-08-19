# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.2)
**Date:** 2026-08-20
**Iteration:** 3
**Scope:** Local
**Delta base:** `68002c75` (v2 review commit) → HEAD `f370eb5c`, 162 insertions / 51 deletions, TSPEC only

## Round-2 findings: disposition

| Prior | Verdict | Evidence |
|---|---|---|
| F-13 High — capture-failure route and the one-snapshot-per-wave invariant mutually exclusive | **Resolved** | §2.5 and §3.2 step 4 move the capture to the call site, *before* `runAdvisorySeam` is entered, and say why in the terms I raised: `gatherEvidence` sits inside the driver's attempt loop (`orchestrate-dev.js:3393`, `:3395`) which `consumesAttempt: true` re-enters (`:3554`), so the `__preDispatch` escape (`:3401-3410`) is unreachable from a path that never enters the driver. Every cited line checked and correct. The capture-failure path now names its own writers — `appendAdvisoryEntry` (`:2965`), `appendEscalationEntry` (`:3090`), `ADVISORY_ESCALATIONS.seam` (`:1578`) — with the shipped record/escalation asymmetry (`:3331-3345`) mirrored rather than re-invented. §5.2 adds the invariant as a call-count assertion on a two-attempt run |
| F-14 High — AC-4.1 conjunct (iii) fixture asserted a rule no section stated | **Resolved in principle, one gap remains** | §3.2 step 6 now states the rule: `resolved` requires `outcome === "resolved"` **and** the `invocations` ledger having grown by the wave's own gate sequence. That is the right home and the right shape — the mutation fixture is now a red test against a stated rule rather than against an implementation. The rule's multi-attempt case is left open; F-21 below |
| F-15 Medium — AT-06-1 containment | **Resolved** | §5.6's AT-06-1 row now reads "field set asserted by set-equality against a transcribed literal, not containment", with value assertions on top |
| F-16 Medium — AT-05-1 vs §5.2 case 4 disagreement | **Resolved** | AT-05-1 marked upstream-pending on the same erratum as §5.2 case 4 and OQ-7; PLAN mints the task with the expected value pending |
| F-17 Medium — `(h)`'s negative not falsifiable without the premise | **Resolved** | §3.3 adds the dispatch-options paragraph (A6 adds no option beyond the shipped seams'), and §5.5's `(h)` row asserts the premise on the run. See F-23 on where that sentence renders |
| F-18 Medium — capture-failure halt fields had no values | **Resolved** | §4.5's new sub-table gives all four literals, including `repairPaths: []` "not `undefined`" and the fixed `diagnosis` sentence §5.5 transcribes |
| F-19 Low / F-20 Low | **Resolved** | §5.1's arithmetic replaced by a two-directional set-equality rule; AT-07-1's oracle now names the literal compared (BR-1…BR-16 minus proposable = transcribed non-proposable, by set-equality) |

The three new findings below are all in text this round introduced.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-21 | High | Local | **Step 6's new ledger rule is under-determined on the multi-attempt run, and as literally written it denies resolution to a genuinely green re-gate.** §3.2 step 6 requires the `invocations` ledger to have grown "since dispatch, by the wave's own gate sequence — the ordered `["post-wave", "test"]` pair". On a one-attempt run that is exact. But the red re-gate path is a supported, specified path: `verifyGate` returns `{passed:false, consumesAttempt:true}`, the driver reverts, consumes an attempt and re-enters the loop (`orchestrate-dev.js:3554-3568`, §3.3's `verifyGate` row, E-20/E-24/AT-02-9), and attempt 2's `verifyGate` appends a *second* pair. Growth since dispatch is then `[post-wave, test, post-wave, test]`, which is not the pair the rule names. An implementer reading the rule as equality refuses a resolution the design intends to allow — a green gate reported unresolved, the wave budget not incremented and the pipeline halted; an implementer reading it as containment accepts a ledger that grew by a *stale* attempt's pair while the final attempt's `verifyGate` appended nothing, which is the mutation F-14 asked to exclude. §2.4's worked table does not settle it either: all three rows are single-re-gate shapes, and no row shows a two-attempt sequence. State the rule per-attempt — the growth attributable to the **final** attempt's `verifyGate` must be the wave's own ordered sequence, one complete pair (or `["test"]` under §2.4's third row) — and add the two-attempt sequence to §2.4's table so AT-04-2 and §5.5's conjunct-(iii) fixture have one operand to compare against | §3.2 step 6, §2.4, §5.5 (AC-4.1 (iii)) |
| F-22 | Medium | Local | **The capture-failure record entry's `disposition` is specified in three fields; the shipped renderer reads six, and the unnamed ones render as `undefined`.** §2.5 and §3.2 step 4 pin `verdict: null`, `reason: null`, `attempts: 0`, and reason correctly about the null-verdict fallbacks. But `renderAdvisoryEntry` destructures `{seam, outcome, reason, verdict, model, fallback}` (`orchestrate-dev.js:2924`) and the Model cell is `advisoryEntrySingleLine(fallback ? model + " (fallback)" : model)` — `advisoryEntrySingleLine` is `String(value)` (`:2905-2907`), with no null fallback, so an unnamed `model` ships the literal text `undefined` into `ADVISORY-{feature}.md`, an operator-facing artifact, on exactly the path AC-6.1 exists to make legible. It also leaves §5.2's fixture without a transcribable expected value for that row: a test written against the run's own bytes would be an implementation echo of whatever the code happens to pass. Name all six members of the capture-failure disposition literally, the way §4.5 now names the four halt fields — including what `model` reads when no rung was ever resolved (`"n/a"` and `fallback: false` would keep the renderer total without touching it) | §2.5, §3.2 step 4, §5.2 |
| F-23 | Medium | Local | **Four table rows carry an extra cell, and the text in it is exactly this round's new content.** Lines 459 and 466 (§3.3, a two-column `Member \| Behaviour` table) and lines 1004 and 1005 (§5.5's four-column prohibition table) each append a further `\|`-delimited cell after the row's last column: the `gatherEvidence` "two things it deliberately does not do" paragraph (F-13/Q-01's answer), the `verifyGate` step-6 ledger sentence (F-14's), `(g)`'s "the fixture's repo **has** a config file" sentence (Q-02's) and `(h)`'s "the premise is asserted too" sentence (F-17's). GFM renders a row's cells only up to the header's column count and drops the remainder, so all four answers are invisible in every rendered view — and §5.5 is the table Phase P transcribes oracles from. Fold each sentence into the row's last cell, or below the table as prose | §3.3 (lines 459, 466), §5.5 (lines 1004, 1005) |
| F-24 | Medium | Local | **Now that the capture moved to the call site, steps 3 and 4 no longer run in the order they are numbered, and no section says so.** Step 3's wave-budget escalation is still routed "via the shipped `__preDispatch` escape `gatherEvidence` already supports" — i.e. *inside* `runAdvisorySeam` — while step 4's capture now runs before `runAdvisorySeam` is entered. So an over-budget wave captures a tree and rewrites `refs/pdlc/a6-snapshot` before discovering it will never dispatch. Nothing breaks, but two oracles get murkier: AT-02-6's budget case now observes a snapshot ref and a capture on a wave with no dispatch, and §5.2's "captureTreeSnapshot called exactly once" has to say once *per wave including no-dispatch waves*. The budget check is a pure read of `waveBudget`; move it to the call site ahead of the capture and say so in step 3, or state explicitly that a no-dispatch wave still captures and let AT-02-6 assert it | §3.2 steps 3–4, §5.2, §4.5 (Snapshot ref row) |
| F-25 | Low | Local | **The one-snapshot-per-wave assertion names a double but not an argv.** §5.2 asserts the invariant "as a call count on the `_git` double". Both `captureTreeSnapshot` and `restoreTreeSnapshot` drive `_git`, and each is several verbs (§2.5's sketch: `write-tree`, `commit-tree`, `update-ref` vs `read-tree`, `clean`, `reset`), so a bare call count on the transport counts the wrong thing on any run that also restores — which the two-attempt fixture does. Name the counted argv (`commit-tree === 1` is the one capture-unique verb) | §5.2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On the capture-failure path §3.2 step 4 orders the writes record → escalation → notice → halt, with a failed record write demoted to a notice because "`record-write-failed` names a *resolution* being withdrawn". Agreed. Does §5.2 want a fixture for it? A failing `_appendFile` on that path is one line of arrangement and pins the demotion, which is otherwise a rule with no test named anywhere in §5.6. |
| Q-02 | §4.5's `diagnosis` literal is a fixed sentence naming `snapshot-unavailable`. Is the *underlying* git failure worth appending to it (the failed verb, say)? The fixed sentence is right for transcription; an operator debugging why `write-tree` failed gets nothing from it, and the escalation entry's free-text `decision` slot may be the better home. |

## Questions

## Positive Observations

- The F-13 answer is better than the fix I asked for. I raised an incompatibility and named two
  escapes; the revision picked the one that preserves the invariant, then paid for it honestly —
  it wrote out the writers, the ordering, the failure discipline on each write, and the reason
  `record-write-failed` is *not* the right reason here. That last distinction (a refusal reason
  names a resolution being withdrawn, and nothing was applied) is the kind of thing that usually
  gets discovered in Phase I by a test that cannot decide what to assert.
- PM F-01's answer is the right shape for a catalogue: `snapshot-unavailable` demoted from a
  ninth `ADVISORY_REFUSAL_REASONS` member to prose in three named free-text slots, which is what
  keeps AT-03-7's eight-member ordered-sequence equality green without an exception clause. A
  frozen catalogue that grows once grows again.
- §4.5's literal-value sub-table is exactly the transcription contract §5.5 needed, down to
  `repairPaths: []` "not `undefined`, so the halt report's shape is the same on every A6-touched
  halt". Shape stability is a testable property and it is now stated as one.
- Every code citation added this round is accurate — `:3393`, `:3395`, `:3401-3410`, `:3406`,
  `:3554-3568`, `:2965`, `:3090`, `:2297-2306`, `:3331-3345` all say what the document says they
  say. Three rounds in, I am checking these to confirm rather than to catch.

## Recommendation

**Needs revision**

One High. F-21 is narrow and mechanical: the rule added to answer F-14 is correct for the
one-attempt run and silent about the retry-then-green run the same document specifies elsewhere,
and the two readings that silence permits differ on whether a green wave resolves. One sentence in
§3.2 step 6 scoping the growth to the final attempt, plus one row in §2.4's table showing the
two-attempt sequence, closes it and gives AT-04-2 and the conjunct-(iii) fixture a shared operand.

F-22 and F-24 are consequences of this round's own move and are cheap to state; F-23 is
mechanical and costs nothing but is worth doing before Phase P transcribes §5.5.

No upstream defects found this round. OQ-7's BR-9 boundary remains the one open erratum and is
already routed.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 1}
