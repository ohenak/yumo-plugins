# Cross-Review: test-engineer — TSPEC (delta, round 15)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 15
**Scope:** Local. Delta re-review of v2.5 only (`880c2cbe..HEAD` — TSPEC commits `c74d5cef`,
`b74d2a7e`, `227fa4a0`, `6fbfe262`, `f8550e9d`, `bc14e546`, `147d327b`). v14 was *Approved with minor
changes* (0 High). This round verifies the three v14 findings, re-measures every mechanical claim the
revision added against HEAD and against a scratch git tree, and reads only what v2.5 changed.

## 1. v14 status

| # | Subject | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 (Medium) | §11.1's ignored-member guard named `git status --ignored --porcelain`, which collapses the ignored member to its directory and reds on a correct build | **Resolved** | §11.1 now specifies **`-uall`** and states why it is load-bearing (the "`-uall` is load-bearing" sentence in §11.1's L4 git case, ignored-member bullet). Re-measured on a scratch tree built exactly as the fixture is (`.gitignore` naming the directory, written before `git add -A`): plain `--porcelain` prints `!! docs/ign/`; `-uall` prints `!! docs/ign/LEARNINGS-ign.md`; `git check-ignore -v docs/ign/LEARNINGS-ign.md` exits **0** printing `.gitignore:1:docs/ign/	docs/ign/LEARNINGS-ign.md` — the document's stated alternative and its stated output, both exact |
| F-02 (Low) | `ls-files --error-unmatch` described as a listing | **Resolved** | The bullet now calls it an **exit-status probe, not a listing**, records the measured exit **1** and the stderr text, and says a conjunct using it asserts the non-zero status rather than an absence from stdout |
| F-03 (Low) | §11.2's `seams.js` line anchors off by one | **Resolved** | Re-measured: `typeof script === "function"` at `seams.js:405`, `value = script(args, index)` at `:406` (document: `:405-406` ✓); `Array.isArray(script)` / `script[Math.min(index, script.length - 1)]` at `:407-408` ✓; map form `:409-413` ✓; `.invocations` `:421`, `.calls`/`.commands`/`.callCount` `:423-425`, block close `:426` (document: `:421-426` ✓). `mergeDoubles.js`'s fall-through is `{ ok: true, stdout: "", stderr: "" }` at `:209` ✓ — the document's corrected spelling now carries `stderr` too |

## 2. The v2.5 absorption, measured

| # | Claim | Verified against | Result |
|---|---|---|---|
| 1 | REQ §4b decides the unreadable entry is **omitted** from the consumed pair, retried next pass | `REQ-pdlc-consolidation-agent.md:611-628` | **Confirmed**, and both quoted passages are verbatim (`"is instead **not consumed**…"`, `"Omission needs no new field…"`). REQ's falsifiability-loop reason is transcribed accurately, not paraphrased into something stronger |
| 2 | The entry still counts toward AC-1.2's volume trigger | `REQ:622-624` (*"stays in the un-consolidated set and so still counts toward AC-1.2's volume trigger"*) | **Confirmed**; §7.1 observable (1) and §12.2 conjunct (1) unchanged and still correct under the new arm |
| 3 | No stale "appears in the consumed pair" text survives the rewrite | `grep` over the whole TSPEC for `in the consumed pair` / `frozen at step` | **Confirmed** — zero hits outside the changelog's own account of the superseded arm. §6's `PassState.consumed` comment was re-cut in the same pass (`:690-694`) |
| 4 | §10.4's residue list is set-equal with §13.3's | both lists read | **Confirmed** — two members each (nested repository; retryable unreadable entry), and §13.3 states the set-equality claim explicitly |
| 5 | The all-unreadable pass's terminal status `no-op` is an observable this layer now carries | `TSPEC:2218-2219`; `REQ:224-232`, `:625-628` | **Confirmed as stated, unbound as tested** — see F-01 |

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **v2.5 absorbs a new terminal-status branch and leaves it with no routing row and no test case.** §10.4 (`:2218-2219`) now states that *"the terminal status of a pass that could read nothing is `no-op` — AC-1.4's third cause"*. That is a real branch with real consequences upstream: REQ AC-1.4 (`:224-232`) enumerates it as the third cause and says the streak folds key on **consumed-set emptiness, "the first and third consume nothing, the second consumes"**, and REQ §4b (`:625-628`) fixes its discriminator — *AC-7.1's consumed-by-basename list empty while the un-consolidated set is non-empty*. Nothing in this document reaches it. §10.3 has no row (row 1a is the **unlistable** corpus ⇒ `failed`, explicitly *"Never `no-op`"*, `:2179` — the immediately adjacent branch, and the one an implementer is most likely to conflate with it). §12.2's unreadable-corpus row is a **mixed** fixture — one readable member, one unreadable — so its consumed pair is non-empty by construction and it cannot reach this arm; its own header still says the decision "mints three observables", which is now an undercount. §12.3 assigns no case. §12's register offers nothing to fall back on: FSPEC's AC-1.4 → AT map is `AT-K3, AT-L2, AT-F13, AT-R7` (FSPEC `:2370`), of which AT-R7's `no-op` fixture (b) is the **all-suppressed** pass and AT-P6/E-08 is the **empty-glob** pass — first and second causes. An implementation that terminates an all-unreadable pass `failed` (by analogy with row 1a), or that treats an all-null read set as an empty corpus and advances the cadence datum, passes every row in §12. The repair is one fixture and is cheap: extend §12.2's row to a **second fixture in the same case** whose corpus enumerates two basenames and `_readFile` returns `null` for **both**, asserting three conjuncts positively — terminal status is exactly `no-op` (not `failed`, not `refused`), the rendered consumed pair's basename list is **empty**, and the un-consolidated count is **2** — with the existing mixed fixture as the control that keeps "pair is empty" from passing on a pass that enumerated nothing at all. Then add the §10.3 row beside 1a and give §12.3 the assignment. Note the deeper cause is upstream and is raised as an erratum in the same breath: FSPEC §5.3's `no-op` table still reads *"AC-1.4's **two named causes**"* (FSPEC `:752-759`) and mints no id for the third, which is why there was no register id to bind | §10.4 (`:2218-2219`), §10.3 row 1a, §12.2's unreadable-corpus row, §12.3 `consolidationPass.test.js` |
| F-02 | Low | Local | **§12.2 conjunct (2) is stated as containment where set-equality is available and cheaper to write.** The conjunct reads: the rendered pair *"names the **readable** basename and does **not** name the unreadable one"*. On a two-member fixture that is nearly the whole truth, but it is satisfied by an implementation that also names a third basename the enumeration never returned — the exact shape NFR-5's *"a block must name **exactly** the consumed set"* (this document, `:1009`) forbids, and the shape §11.1's real-git case is already careful to state as a **set** oracle. State it as the set equality it wants: the pair's basename list is set-equal to `{readable}`. Same fixture, same control, one stronger oracle | §12.2's unreadable-corpus row, conjunct (2) |

## 4. Questions

| ID | Question |
|----|---------|
| — | None. F-01 names the fixture and the three conjuncts rather than asking which arm was intended. |

## 5. Positive Observations

- **The absorption is the shape this pipeline is supposed to produce, and is rare in practice.** v2.5
  did not delete its own superseded reasoning to make the new arm look inevitable. §7.1's arm 2 keeps
  the convergence argument in view, states that REQ *answered* it rather than overlooked it, and gives
  the answer — a consumed-but-unread entry biases REQ-CONS-05's loop in one direction only. A reader
  who arrives in six months learns why the obvious argument loses, which is the thing a diff normally
  destroys. §13.3's re-cast from *answered here* to *answered upstream and absorbed* is the same
  discipline applied to the hand-off, and it keeps the falsifier (same basename unreadable on two
  consecutive passes) rather than closing the question flat.
- **The rewrite swept its own dependents.** `PassState.consumed`'s comment, §12.2's conjunct, §12.3's
  parenthetical, §10.4's residue list and §13.3's list all moved in the same round, and a grep for the
  old claim returns nothing. Three of the last five rounds left exactly this kind of residue; this one
  did not, and the set-equality claim between §10.4 and §13.3 is stated in the document rather than
  left for a reviewer to check.
- **All three v14 repairs were made at the level the finding was made at.** The `-uall` fix did not
  just swap a flag: it records the measurement, says the flag is load-bearing, names *why* the cheap
  wrong repair (weakening the guard) is the failure mode to avoid, and adds `check-ignore -v` with its
  exact output as an alternative. The `--error-unmatch` fix reclassified the command rather than
  rewording the sentence around it. Every one of those claims reproduced on a scratch tree.

## 6. Recommendation

**Needs revision**

One High. The v2.5 absorption itself is correct, faithful to REQ §4b and swept clean — the finding is
not against the decision but against its coverage: the round introduced a third `no-op` cause with
operator-visible consequences (terminal status, empty consumed pair, streak keying) and left §10.3 and
§12 with no row for it, next door to a branch (§10.3 row 1a) that deliberately terminates `failed` on
what an implementer will read as the neighbouring input. One fixture in the case §12.2 already owns
closes it, and the upstream gap that left no register id to bind is raised as a FSPEC erratum in the
same round. F-02 is a one-clause strengthening in the same row and rides along.

## 7. Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
