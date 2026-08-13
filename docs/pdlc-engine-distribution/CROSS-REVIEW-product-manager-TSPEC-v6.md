# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.6)
**Upstream read:** `REQ-pdlc-engine-distribution.md` (AC-2.4, AC-5.3), `FSPEC-pdlc-engine-distribution.md` (§5.2, AT-2.5)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v5.md` (Needs revision — 1 High, 1 Medium, 1 Low)
**Diff reviewed:** `b6e73147..HEAD` on the TSPEC (84 +/26 −)
**Date:** 2026-08-13
**Iteration:** 6
**Scope:** Delta re-review. Only v5's findings and this round's own new work; sections settled earlier are not re-litigated.

## 1. Disposition of v5's findings

| v5 ID | Severity | Status | Evidence in v0.6 |
|---|---|---|---|
| F-01 | High | **Resolved** | §9.3's clause 3 now scans the **non-comment** source (`:1222-1230`), the mechanism sentence matches ("a token match over the file's **non-comment** text… drop `//`-to-end-of-line and `/* … */` spans before matching", `:1245-1255`), and §12.1's arrangement row was carried along ("zero occurrences of the `await` token in the file's non-comment source… so the mandated header comment cannot turn the oracle red", `:1447`). The revision also stated *why* the qualifier is load-bearing and made its dependence on clause 2 explicit, so a later, longer file fails review rather than outrunning its own oracle. The closing claim at `:1267-1270` was corrected in the same pass — it no longer claims the oracle proves the file "parses low enough to run at all", which the dropped ES-2020 clause no longer supports |
| F-02 | Medium | **Resolved** | §7.2 (`:786-805`) and §12.4's one-task rule (`:1535-1548`) now say the constant edit at `:47-63` is the **only** required test-file edit, that the leak case at `:79-90` is an *exclusion* list that stays unchanged, and that `PROP-PARITY-15` (`:268-282`) is the third reader that turns green on the same edit provided `_provenance` stays out of `UNOVERRIDDEN_IO_SEAMS`. I re-read all three sites at HEAD: `:79-90` is four `assert.equal(…, false)` exclusions (`seam-contract.test.js:79-90`), `:65-73` are the two `deepEqual` set-equalities, and `PROP-PARITY-15`'s positive case (`:268-282`) asserts membership in `TSPEC_3_1_DEV_SEAMS` and non-membership in `UNOVERRIDDEN_IO_SEAMS` (`:223-238`). The document now matches the files |
| F-03 | Low | **Resolved** | §12.1 now reads "no test runs under **both runners**" and cites `PROP-PARITY-10`'s real-module import as sanctioned precedent (`:1449`). Verified: `seam-contract.test.js:299` is `await import("../../workflows/orchestrate-dev.js")` and is engine-side |
| Q-01 | — | **Answered** | §14.2 gains risk **R-E** (`:1623-1633`): the Node-12.17 subset claim is documented, not tested; what it costs is AC-2.4's user-visible half; mitigations and the reversal condition named. This is the answer I asked for, in the place an operator reading only §14 will find it |
| Q-02 | — | **Not addressed** | The merge-leg fixture's remaining setup is still not enumerated. Restated as F-02 below, at Low |

All three prior findings are closed, and none of the closures narrowed the
document to make itself right — F-01's fix added the stripping rule *and* its
stated precondition, F-02's fix named the two adjacent readers rather than just
deleting the wrong citation. Nothing settled in rounds 1–5 was re-opened.

The blocker below is entirely this round's own new work: the process-entry leg
added for TE v5 F-32.

## 2. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **The round's own new process-entry leg is unwritable against the `bin/cli.mjs` this same TSPEC specifies: §3.1 says the file is HEAD's body "moved unchanged", and HEAD's body exports nothing and self-invokes.** §12.1 (`:1449`) and §12.3 (`:1498-1504`) now require a leg that "drives `cli.mjs`'s three command bodies — importing them directly, as §5.4 already contemplates — and asserts each of `runDev` (`bin/pdlc.mjs:385`), `runQueueLoop` (`:434`) and `runQueue` (`:457`) receives a `provenance` argument". I verified all three call sites exist at exactly those lines. But the file that will *become* `cli.mjs` has two shapes that make in-process driving impossible, and §3.1's row (`:92`) freezes both: it says `cli.mjs` is "Everything in `bin/pdlc.mjs` at HEAD, moved unchanged… no behaviour moves". (a) **No exports.** `grep -c "^export" pdlc/engine/bin/pdlc.mjs` is `0`; `cmdDev` (`:352`) and `cmdQueue` (`:396`) are file-private, so there are no "command bodies" to import. (b) **Unconditional self-invocation.** `bin/pdlc.mjs:505` is a bare `main().catch(…)`, so importing the module runs the CLI against the *test process's* `argv` and mutates `process.exitCode` — before any assertion. (c) A third, smaller one: `runDev`/`runQueue`/`runQueueLoop` arrive by static import (`bin/pdlc.mjs:30`), and no seam is named anywhere in §3.1/§11 that lets a test substitute recorders for them, unlike `importWorkflow` (`run.mjs:387`) which §12.1 correctly leans on one hop lower. Every shipped test reaches this entry as a **subprocess** instead (`__tests__/cli.test.js:18,22`, `spawnSync(process.execPath, [BIN, …])`) — and a subprocess cannot observe an argument object, which is precisely what this leg must assert. §5.4's "Unit coverage of the body may import `bin/cli.mjs` directly" (`:357-358`) is an intention, not a shape: it predates this leg and names no export surface. The consequence is not academic — this leg is the *only* proof that `pdlc queue --loop` carries provenance, and §7.2 (`:785`) states plainly that omitting `:434` ships `NO_PROVENANCE` "while every §12 oracle stayed green". Left as written, an implementer who moves the file faithfully finds the leg unwritable at build time and will either drop it (restoring exactly the AC-5.3 hole this round opened the section to close) or invent an unnamed mechanism under time pressure. Fix in §3.1's `bin/cli.mjs` row, one clause: the move is *not* byte-unchanged — `cli.mjs` **exports its command bodies** (or a single `main(argv, deps)`), and self-invocation moves to the guard/an `import.meta.url` entry check, with the `run*()` trio reachable as an injectable default so the leg can record them. Then say so in §5.4's `:357-358` sentence and in §12.1's leg, replacing "as §5.4 already contemplates" with the named surface | AC-5.3, AC-2.1 |
| F-02 | Low | Local | **§12.3's green merge leg still leaves its fixture half-specified, so the PLAN cannot transcribe it (restating v5 Q-02, unanswered).** The leg sets `mergeMode: "on"` and asserts the produced-kind set is non-empty and contains kind 3 (`:1445-1456`); I re-verified the precondition is real (`MERGE_DEFAULTS.mergeMode: "off"`, `orchestrate-dev.js:61`). What is still not written down anywhere a task author will read is the *rest* of the arrangement kind 3 needs before it can be produced — repo capabilities, mergeable state, unresolved-thread state, CI status. The task author is left to derive it by reading `decideMerge` at implementation time, which is the "expectation derived from the code under test" shape the properties bar forbids. One sentence naming the fixture's four remaining fields, or an explicit pointer to the ladder case in §6.4 they must be transcribed from, closes it. Recorded, not gating | AC-5.3 |

## 3. Questions

| ID | Question |
|----|---------|
| Q-01 | §12.1's production-path leg now asserts the provenance value **by identity and `Object.isFrozen`**, "not a structurally-equal copy" (`:1449`, TE v5 Q-16). I agree with the bar. Does the same identity bar apply to the `runQueueLoop` pass-level assertion — "**every pass** carries the same frozen value"? Read strictly it must (that is the whole content of "one `Provenance` per run, not one per pass", `:791-796`), but the sentence says "the same frozen value" where the leg above says "identity", and a task author transcribing two different words may write two different assertions. Is one word intended for both? |
| Q-02 | R-E (`:1623-1633`) says the subset claim is "reversible by adding a parser if the file ever grows". Is there a trigger worth naming — e.g. "if `bin/pdlc.mjs` ever exceeds clause 2's three top-level statements, the parser is no longer optional"? The mitigation currently rests on a size property that no oracle pins, while clause 2 does pin it; connecting the two would let a future reviewer see the risk expire on a mechanical condition rather than on judgement. |

## 4. Positive Observations

- **The `runQueueLoop` gap is the round's real find, and the document reports it in the operator's terms rather than the implementer's.** §7.2's new hand-off row (`:785`) names three call sites where the prior draft implied two, and I verified every number: `runDev({…})` at `bin/pdlc.mjs:385`, `runQueueLoop({…})` at `:434`, `runQueue({…})` at `:457`; and the forwarding claim holds exactly as stated — `runQueueLoop({maxPasses = null, ...args})` (`run.mjs:478`) calls `runQueue(args)` (`:491`), so the loop mode inherits provenance if and only if the caller put it in the object. The sentence that matters is the plain one: `pdlc queue --loop` "would emit `NO_PROVENANCE` while every §12 oracle stayed green". That is a shipped mode of the product going unmarked with a green build — a user-visible AC-5.3 failure — and the document names it in one line instead of burying it in a wiring table. This is the second round running that this section has found a carrier hop no test would have caught; the pattern is working.

- **"One `Provenance` per run, not one per pass" is a product decision, and it was answered as one.** `:791-796` reads BR-1.5's "resolved once per run" literally, states the consequence a task author needs (all passes carry identical provenance; do **not** re-derive inside the loop), and grounds it in the forwarding code rather than in intent. A queue loop is one run — that is the answer an operator correlating commits back to an engine version needs, and it is now unambiguous in the artifact instead of decided at implementation time.

- **F-02's closure named the two adjacent readers instead of just fixing the wrong citation.** The v5 finding only asked that the `:79-82` instruction be corrected. The revision instead explained *why* the exclusion list must stay unchanged ("`_provenance` goes onto both rows, so it belongs in neither exclusion… Adding it here would assert the opposite of the wiring", `:796-800`) and named `PROP-PARITY-15` as the third reader with its own precondition. I checked all three sites against HEAD and every claim matches. A task author now cannot edit the wrong constant by accident, which is more than the finding asked for.

- **K-3's reprice keeps telling the truth as the cost grows.** `:1601` now adds "**all three** of `bin/cli.mjs`'s `run*()` call sites… the loop site included, or `pdlc queue --loop` ships unmarked", and §12.4 pulls `bin/cli.mjs` into the same single task as `lib/run.mjs` and `seam-contract.test.js` (`:1544-1548`) — correct, since those are halves of one atomic contract and the batch-safety rule needs them co-owned. Three rounds in a row this row has gone up rather than been defended; that is what an honest cost row looks like.

## 5. Recommendation

**Needs revision** — one High, and it is a one-clause edit to §3.1's `bin/cli.mjs` row
plus two matching sentences.

All three of v5's findings are closed, and Q-01 is answered with a named risk in the
place operators read risks. The closures were thorough rather than minimal: F-01's fix
carried the qualifier into §12.1's arrangement row and the section's closing claim,
F-02's fix named both adjacent readers of the constant. Every line and file citation
added this round checks out against HEAD — `bin/pdlc.mjs:385/:434/:457`,
`run.mjs:478/:491`, `seam-contract.test.js:47-63/:65-73/:79-90/:223-238/:268-282/:299`,
`package.json:13`, `_run-suite.mjs:50`, `orchestrate-queue.js:491`.

The blocker is internal to this round's own new work. The process-entry leg — added
because `pdlc queue --loop` would otherwise ship unmarked with a green suite — is
specified as an **in-process** test that imports `cli.mjs`'s command bodies, while §3.1
still specifies `cli.mjs` as HEAD's body "moved unchanged". HEAD's body exports nothing
(`grep -c "^export"` → `0`), self-invokes at `:505`, and takes `run*()` by static import
at `:30`; every shipped test reaches it by `spawnSync` instead (`cli.test.js:18,22`),
which cannot observe an argument object. So the leg that closes the AC-5.3 hole cannot
be written against the design that surrounds it.

To resolve **F-01**: state in §3.1's `bin/cli.mjs` row that the move is not
byte-unchanged — the file exports its command bodies (or one `main(argv, deps)`),
self-invocation moves behind an entry guard, and the `run*()` trio is reachable as an
injectable default; then update §5.4 `:357-358` and §12.1's leg to name that surface
instead of "as §5.4 already contemplates". No design decision moves; the three call
sites, the identity assertion and the loop leg are all unaffected.

F-02 (§12.3's merge-leg fixture still not enumerable by the PLAN) is worth a pass in the
same edit but does not gate on its own.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}

