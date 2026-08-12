# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (v1.4)
**Date:** 2026-08-12
**Iteration:** 5
**Scope:** Delta re-review. Round 4 left one Medium (F-16) and one Low (F-17), no High. This
round reads only what changed between `06ce3342` (the commit round 4 reviewed) and HEAD, plus the
mechanical re-verification the v1.4 changelog invites. Sections untouched by the delta are not
re-reviewed.

## What changed

`git diff 06ce3342..HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`: 64 insertions,
13 deletions across six commits (`034fdeb5`, `ac573f25`, `8ce0254f`, `e12b9624`, `c5efb9d6`,
`f5ff0cd7`), in six places:

1. **§0** — version `1.3 → 1.4` plus a seven-row round-4 changelog and a paragraph arguing TE F-17
   is not open at HEAD.
2. **§3 T11** — the coverage-forwarding oracle is re-specified as **positional**: set-equality over
   the child's whole argv with the forwarded flag's index pinned below `__tests__/`; containment
   explicitly rejected (TE F-16).
3. **§4** — a new paragraph stating the `Batch` column is human-auditing only and the runtime
   derives 17 waves (TE Q-01), and the T16 note rewritten from "three generated paths" to the one
   `pdlc/workflows/dist/` directory entry (PM F-02).
4. **§6** — the parse-safety argument restated against §4's live `Files | Task | Batch` header and
   the two membership facts it actually rests on (PM F-01, PM v3 F-04).
5. **§8 / §11** — document-oracle CWD sensitivity re-attributed from the module to the test's
   `LIVE_ROOT` setup (PM v3 F-01).
6. **§9** — AT-ENG-57 re-captioned from "near-miss" to the endpoint of AC-1.3's range (PM v3 F-03).

## Prior findings — disposition

| ID (v4) | Severity | Status in v1.4 | Evidence |
|---|---|---|---|
| F-16 | Medium | **Resolved** | T11 (`:178`) now names node-option position explicitly and specifies set-equality over the child argv with the flag's index pinned below `__tests__/`, naming the expected shape `["--test", "--experimental-test-coverage", "--import=./__tests__/_bootstrap.mjs", "__tests__/"]` and rejecting containment by name with the reason (an appending implementation satisfies containment while V5 and §8's floor are both unrunnable). Re-measured this round on node v20.20.1: pre-position exits `0`, post-position exits `1` — the document's stated measurement reproduces |
| F-17 | Low | **Resolved** | §6's three quotations are byte-identical to the live headers: `# \| Integration point at HEAD \| What attaches`, `# \| Question \| Disposition here`, `# \| Command \| Observes \| State at HEAD`. The v1.2 §6 rewrite corrected the quotation; §0's paragraph says so, and it checks out |

## Verification re-run at HEAD

Everything the v1.4 changelog asserts as checkable, re-measured against HEAD rather than read.

| Claim | Method | Result |
|---|---|---|
| `parsePlanTasks` 54 tasks, `parsePlanOwnership` 54 owning tasks / 76 pairs, `validatePlanContract` ok, `computeWaves` 17, 0 collisions | imported the real `orchestrate-dev.js` exports over the live PLAN; re-derived each wave's owned-path union and looked for a repeat inside a wave | 54 / 54 / 76 / `{"ok":true}` / 17 / **0 collisions**. The v1.4 edits moved no content the parsers read |
| T11's positional measurement | scratch `__tests__/` on node v20.20.1: `node --test --experimental-test-coverage __tests__/` vs `node --test __tests__/ --experimental-test-coverage` | exit `0` and exit `1` respectively — exactly as §3 T11 states |
| `PLAN_ID_HEADER_CELLS` excludes bare `task`; `PLAN_DEPS_HEADER_CELLS` members | read `orchestrate-dev.js:3814` and `:3815-3824` | `{"task id","task-id","task_id","id","#"}` — bare `task` is not a member; the deps set is the eight spellings §6 lists, verbatim. §6's stated invariant is the real one |
| `Batch` parsed then ignored | `orchestrate-dev.js:3932-3934` | "A batch/wave/phase column may be present and is ignored — waves are DERIVED from ownership and dependencies, never read off the PLAN's own batch labels." §4's new paragraph transcribes the mechanism, not a paraphrase of it |
| §4 carries **one** dist entry, not three | grepped §4's manifest rows for T16 | three T16 rows (`orchestrate-dev.js`, `orchestrate-queue.js`, `pdlc/workflows/dist/`), of which exactly **one** is the dist entry. The note's "count it and you will find one, not three" is a true instruction |
| Oracle module disclaims `process.cwd()`; sensitivity is the test's | `document-oracles.mjs:2-6`; `documentOracles.test.js:62` | module header: "pure function of a `root` … No `process.cwd()`". `:62` is exactly `const LIVE_ROOT = realpathSync(resolve(HERE, "../../.."))`. The re-attribution in §8 and §11 is correct, and it is the more useful statement: it names the line a future editor would have to change |
| AT-ENG-57 is a full member of AC-1.3's row | `FSPEC:1347` | `\| AC-1.3 \| §11.1, §11.2 \| AT-ENG-52…AT-ENG-57 \|` — a range endpoint, not a parenthetical. PLAN §9's AC-1.3 row (`:686`) carries the same range |
| §11 V2's `testCommand` quoted token-for-token | `.claude/pdlc.config.json:3` | matches the quoted string exactly, including all four ignore patterns |

## Findings

No High findings. One new Low: the delta added line-number citations to PLAN's own text, and every
one of them is off.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-18 | Low | Local | **The new self-citations into this PLAN are off by one, and §0's is off by 28.** §6 cites §4's header as `:238`; it is at `:239`. §6 cites the three `#`-opening headers as `:507`, `:765`, `:796`; they are at `:508`, `:766`, `:797`. §0's changelog row cites the same §4 header as `:211`, which is a T42 row in §3. Citations *out* of the document (`orchestrate-dev.js:3814`, `:3815-3824`, `:3932-3934`, `document-oracles.mjs:2-6`, `documentOracles.test.js:62`, `FSPEC:1347`, `.claude/pdlc.config.json:3`) all check out — this is only the self-referential set, and self-citations in a document that keeps growing a changelog at the top will drift again on the next edit. Not gating: the quoted header text is byte-exact, so a reader lands on the right table by search. Either bump the four by one and fix §0's to `:239`, or cite §4/§7/§10/§11 by section and drop the line numbers, which is the form that survives the next prepended changelog | §0 changelog row 2; §6 (`:489`, `:32`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Round 4's Q-02, still open and still not a finding: no task asserts that **this PLAN's own §4 manifest parses**. T08 pins the CI arrangement; nothing pins `validatePlanContract(parsePlanTasks(PLAN).tasks, parsePlanOwnership(PLAN).ownership).ok` over the real file. The v1.2→v1.3 failure was silent in the direction that matters — a malformed manifest *degrades* to the legacy worktree path rather than failing — and F-18 shows the document is still being edited in ways that move line numbers under quoted structure. One red test over the live file would have caught v1.2 at authoring time |
| Q-02 | Carried: T04's totality property generates "arbitrary thrown values (strings, `null`, `undefined`, non-`Error` objects, nested causes)". Is that corpus pinned in a shared `throwables` fixture, or left to the implementer? A hand-rolled generator emitting only `Error` instances passes the property while proving nothing |
| Q-03 | Carried: is §8's ≥85 % floor per-module or over the whole `lib/` aggregate? An aggregate 85 % with `lib/transport-cli.mjs` below it satisfies the sentence without meeting the intent |

## Positive Observations

- **F-16 was closed with the mechanism, not with a softer sentence.** The row could have said "the
  test asserts flag order". Instead it names the position (node-option, before the path list), the
  measurement on both spellings with both exit codes, the oracle shape (set-equality over the whole
  argv), the pinned index, and — the part that makes it durable — *why containment is rejected*: an
  appending implementation satisfies it while V5 and §8's floor are both unrunnable. That is a
  falsifiable-oracle argument written into the plan, so the implementer cannot pick the weak form by
  accident.
- **§6 now rests on a membership fact instead of an absence.** "No id-like column at all" was true
  of v1.2 and false of v1.3 — an argument that quietly expired. The replacement (`task` ∉
  `PLAN_ID_HEADER_CELLS`; no `PLAN_DEPS_HEADER_CELLS` member) is a set-membership claim I could check
  against `:3814` and `:3815-3824` in one hop, and it is stated as a constraint on future edits
  rather than a property of today's text.
- **The §8/§11 re-attribution moved the claim to the line that would have to change.** "The module
  reads `process.cwd()`" was false; `document-oracles.mjs:2-6` explicitly disclaims it. Pointing at
  `documentOracles.test.js:62`'s `LIVE_ROOT` instead is both true and actionable — anyone who wants
  those oracles hermetic now knows the exact seam.
- **The T16 note narrowed toward the parser's semantics.** "Three generated paths" contradicted the
  single directory row; the rewrite explains why one trailing-`/` entry is *strictly safer* than
  three file cells under the prefix collision rule and covers files a future rebuild adds. It even
  tells the reader how to falsify it ("count it against §4's rows").
- **The two numbering systems are now reconciled in the document rather than in a reviewer's head.**
  §4 says the `Batch` column is retained for auditing and ignored by the parser, cites the docstring
  that says so, and states the operational rule (match a stopped wave on task id, never a `b`-label).
  That was Q-01 in round 4 and it is answered.
- **Every checkable claim in the changelog reproduced.** 54 / 54 / 76 / ok / 17 / 0 collisions, and
  the node exit codes. A changelog whose rows are re-runnable is the reason this review is short.

## Recommendation

**Approved with minor changes**

No High findings, and none opened by the delta. Both round-4 carries are resolved with evidence I
re-derived rather than accepted: F-16's oracle is now positional and set-equality-shaped with the
rejection of containment argued, and F-17's quotations are byte-identical to the live headers. The
six edits are all in the same direction — replacing claims that had expired (an absence argument, a
`process.cwd()` attribution, a "near-miss" caption, a three-path note) with claims tied to a line
someone can open.

One Low remains: F-18, the four off-by-one self-citations and §0's `:211`. Fix by bumping them or,
better, by citing sections instead of lines — self-citations in a document that grows a changelog at
the top will drift on every round. Q-01 is the item I would most like an answer to even though it is
not a finding: nothing in the plan asserts that this PLAN's own manifest parses, and that is exactly
the defect that degraded silently once already.

No erratum round. Every upstream citation checked this round (`FSPEC:1347`, `orchestrate-dev.js`,
`document-oracles.mjs`, `documentOracles.test.js`, `.claude/pdlc.config.json`) is accurate at HEAD.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:e46380a1ba540ac3f993815573516cd2ac9a3a9d61b40f5afebec84531c784db
REVIEWED-COMMIT: f5ff0cd7d921eae9e18c0901c6f40d65b659a4ee
