# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.13, commit `c6b96b1b`)
**Date:** 2026-08-20
**Iteration:** 4 (delta re-review against v1.12, commit `28dd256b`)

## Delta Verification

**Scope of the round.** `git diff --stat 28dd256b..HEAD` on the PLAN is **25 insertions, 6 deletions in one
file**: the lineage row's v3 cross-review list, the v1.13 changelog row, A6-18's `advisoryWaveGateMain.test.js`
paragraph (TE v3 F-01), batch-safety rule 2 (my v3 F-01), and two DoD legs (TE v3 F-02, TE v3 F-01). No task
row, batch column, wave, dependency edge or file-ownership cell moved — verified by diffing those regions:
11 tasks, 7 waves, manifest of 11 owning rows unchanged.

| Check | Method | Result |
|---|---|---|
| My v3 `F-01` (rule 2 was containment, not set-equality) | Projected the manifest (PLAN 359–370) to distinct paths and matched each against rule 2's clauses (PLAN 405–426) | **15/15 paths enumerated**, each in exactly one clause; the closing sentence states the set-equality discipline. **Resolved** |
| Every manifest path exists on disk (or is declared new) | `ls` over all 15 | All present at HEAD (`waveExecution.test.js`, `advisoryEscalationLog.test.js`, `documentOracles.test.js`, `helpers/advisoryDoubles.js`, `.claude/pdlc.config.example.json`, `pdlc/engine/__tests__/advisory-config-example.test.js`, the eight advisory suites, `orchestrate-dev.js`) |
| TE v3 F-01's corrected fifth value — capture *succeeds* on that fixture | Read the harness `_git` double (`pdlc/workflows/__tests__/advisoryWaveGateMain.test.js:109-138`) against `captureTreeSnapshot`'s verb sequence (`pdlc/workflows/orchestrate-dev.js:12566-12615`) | Confirmed: `rev-parse HEAD` → ok (`:122`), `add -A` → ok (`:112`), `write-tree` / `commit-tree` → ok (`:123`), `update-ref` and `reset --mixed` → ok through the terminal `return { ok: true, stdout: "" }` (`:138`). No `fail(...)` arm is reachable, so the capture returns `{head, tree, snap}` and `snapshotRef` is non-`null` |
| …and the ref is wave **1** | `expect(result.haltReason).toContain("Wave 1 test gate failed")` (`advisoryWaveGateMain.test.js:368`), untouched by this task | Holds — `refs/pdlc/a6-snapshot-1` is the value TSPEC §4.5's "Value when the capture succeeded" row (`TSPEC:1458`) prescribes |
| The capture runs before the seam on an applying wave | `captureTreeSnapshot` call site at `orchestrate-dev.js:3403`, above `runAdvisorySeam`, per TSPEC §3.2 step 4 | Holds; the fixture's run dispatches A6 at least once (`advisoryWaveGateMain.test.js:369`), so the wave applies |
| The claimed zero collateral cost of the now-due overwrite notice | `grep -c notices pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` → **0**; every notice oracle is a filter over `inapplicabilityStatements(logs)` (`:182-186`, used at `:209`, `:227`, `:246-247`, `:256`, `:273`, `:284`) | Holds. `PROP-SEAM-07`/`-08`/`-09`/`-10` all exist in that file (`:201`, `:215`, `:230`, `:277`) — the four ids the row names are real, and none is a whole-array count |
| DoD's un-skip negative arm is expressible on the shipped surface | `waveExecution.test.js:982`, `:1034-1035`, `:1093-1094` use `a6.calls.length` and `result.haltAdvisory`; the omitted-argument shape is the shipped `throw haltError(testGateMessage, a6.disposition ? { advisory: a6.haltFields } : undefined)` (`orchestrate-dev.js:15399`) | Holds — "the `advisory` argument is omitted" names the real production conditional, and `haltAdvisory` stays absent (`orchestrate-dev.js:16248`) |
| Consistency of the corrected value across the document | `grep -n "snapshot-1\|haltAdvisory"` over the PLAN | Three sites agree — A6-18's row (`:339`), the DoD widening leg (`:585-593`), the changelog (`:25`). The Overview's mention (`:56`) states only the four→five widening and names no value, so it did not need editing |
| Nothing else broke | Diffed the AT table, batch gates, dependency section and manifest regions | Unchanged; 48-AT set-equality claim and AT-06-4/AT-06-4b rows (`:555-556`) still carry both arms and both owners |

**The one correction the round turns on, checked in code rather than in prose.** The v1.12 text told the
implementer to write `snapshotRef: null` into a suite whose capture cannot fail. Had that shipped, batch 6 —
whose gate has no expected-red channel — would have gone red on the exact assertion the widening was added to
protect. The v1.13 text now prescribes `refs/pdlc/a6-snapshot-1` and, per the anti-echo rule, requires it be
composed spec-side as `"refs/pdlc/a6-snapshot-" + waveNum` rather than read back from the module under test.
Both halves are correct at HEAD.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | A6-18's corrected paragraph claims the fixture's `_git` double "answers `ok: true` to **every verb** `captureTreeSnapshot` issues", then enumerates `add`, `rev-parse`, `write-tree`, `commit-tree` explicitly plus `update-ref` through the fallthrough — but the capture issues a **sixth** verb, `reset --mixed <head>` (`pdlc/workflows/orchestrate-dev.js:12606-12613`), whose non-`ok` return is its own `fail("reset")` arm. It also reaches the double's terminal `return { ok: true, stdout: "" }` (`advisoryWaveGateMain.test.js:138`), so the conclusion is unaffected — but the sentence is presented as an exhaustive walk and is not set-equal to the verb list in the function it walks. Same discipline the document applies elsewhere: name the whole enumeration so a later reader can re-run the check mechanically. Fix when the row is next touched: add `reset` beside `update-ref` as the second fallthrough verb (and note that both `add` and `reset` go through `gitWithLockRetry`, which does not change the answer here). | AC-6.3, REQ-AWG-06 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | My v3 `F-01` was closed by naming the manifest projection in prose. That now makes **two** enumerations in this document maintained by hand against a mechanical source (the AT set against FSPEC §6, and rule 2's `(file, batch)` pairs against the manifest) plus a third the round just added (a capture-verb list against `captureTreeSnapshot`). Each has now cost at least one hand-edit to keep true. Is it worth carrying the two-line projection script into the DoD as a verification command rather than re-deriving it by reading, given the document already ships a `Commands` section? Recorded for harvest either way; it does not gate. |
| Q-02 | Fourth consecutive round with the same dispatch note: the completeness gate again supplied **PLAN's** headings (`Overview` / `Batches` / `Dependencies` / `Verification`) for a **cross-review** artifact, together with the skeleton-first pacing contract. I have written the reviewer format regardless, as in v1–v3. Routed to process learnings, not a finding against this document. |

## Positive Observations

- **The correction was made where an implementer reads, not only where a reviewer reads.** The wrong value
  appeared in one place; it could have been fixed in one place. Instead the corrected value, its derivation
  (which `_git` verbs succeed, why the capture therefore returns a ref, which wave the fixture halts on) and
  the anti-echo instruction for writing it all landed in A6-18's row, and the **same** value landed in the DoD
  widening leg — so the verifier and the implementer read one contract rather than two that agree by luck.
- **The consequence of the correction was carried, not left implicit.** A non-`null` `snapshotRef` makes
  BR-14's overwrite notice due on that halt report too. The revision says so, and then pays for the claim by
  naming the four notice oracles in that suite (`PROP-SEAM-07`'s arms, `-08`, `-09`, `-10`) and observing that
  every one is a *filtered* count. I re-measured: the file contains zero occurrences of the token `notices`,
  so nothing in it can see the extra element. The claim is complete, not representative.
- **The un-skip DoD leg now has a negative that a positive-only arm cannot fake.** The leg names the paired
  negative in the falsifiable form: a halt on a wave where A6 did not fire, positively pinned by `outcome`,
  `haltReason` and `a6.calls.length === 0`, with the `advisory` argument omitted and no overwrite notice
  anywhere in `notices`. That is precisely the shipped conditional at `orchestrate-dev.js:15399`, so the leg is
  tickable only against real production behaviour — no absence-only oracle.
- **Rule 2 changed shape, not just wording.** The previously unenumerated single-owner paths are now named and
  the section closes with "That accounts for every path in the manifest." I re-derived the projection myself:
  15 distinct paths, 15 clause memberships, no leftovers in either direction. A path added to the manifest
  without a clause is now a visible hole.
- **The revision broke nothing.** The DAG, batch column, gates, manifest cells, the 48-AT set-equality claim
  and AT-06-4/AT-06-4b's two-arm/two-owner rows are byte-identical to the version I approved in v3.

## Recommendation

**Approved with minor changes** — no High finding, no Medium finding, one Low.

Stated precisely, as a delta verdict:

- **My one v3 finding is closed at the level asked.** Rule 2's walk is now a set-equality over the manifest,
  the enumeration is complete in both directions at HEAD, and the discipline is stated so the next path added
  to the manifest cannot pass silently.
- **The round's own High (TE v3 F-01) is closed against code, not against prose.** I re-derived the capture
  outcome from the double and from `captureTreeSnapshot`'s six guarded verbs: the capture succeeds, the fixture
  halts on wave 1, and `refs/pdlc/a6-snapshot-1` is what TSPEC §4.5 prescribes for that case. The prescribed
  value is right, and the anti-echo instruction keeps it a spec-side literal.
- **The one Low is about the completeness of an enumeration, not about a wrong conclusion.** `reset` is missing
  from a verb list introduced as exhaustive; it behaves identically, so nothing downstream changes. Recorded
  for the next time that row is touched; it does not gate the phase.

Nothing must change for this document to proceed to PROPERTIES and implementation.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
