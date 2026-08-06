# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v6.1)
**Date:** 2026-08-06
**Iteration:** 6
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md:10-39`). Baseline for the diff is `7ad57c9` —
the commit v5 was written against; the revision is six commits, `561dd89`…`87a6cb7`, +76/−14 lines.
Prior findings M-01, M-02 and L-01 are verified for disposition; new observations are drawn **only**
from changed text.

## Prior findings — disposition

All three v5 findings are **resolved**, and all three v5 questions are answered in the document.
Each was checked against the revised text and, where it made a claim about this repository, against
HEAD — I re-derived every line number rather than trusting the postmortem's, as its own
Recommendation asked (`POSTMORTEM-F:265-266`).

| v5 ID | Sev | Disposition | Evidence in v6.1 |
|----|---|---|---|
| M-01 | Medium | **Resolved**, in the form the finding asked for | §8.1 gains a **per-field reader table** (`FSPEC:1126-1136`) enumerating six readers and the arm each takes on a short record, and §13.7 gains **AT-F21** (`:2028`) — the falsifier that was missing. Its Given is a constructed `.consolidation-log.md` carrying two short records (`E` missing `route`, `F` missing `target`) plus one well-formed record, and its Then is the five conjuncts I specified on **one path**: the pass reaches its terminal status and does not halt; a parse notice names each short record and its missing field; the positive downstream state (`E`'s proposal re-proposed rather than suppressed, and `E` present in AT-F19's open list); the short records' **bytes unchanged**; the well-formed record unaffected. The row states which prohibited behaviour each conjunct catches — halt on `undefined`, `route ?? "degraded"` (the direction that would close an id, re-opening the v4 H-06 hazard by another door), silent rewrite — so no conjunct is decorative. The negative half is never asserted alone. Traceability landed too: **E-12b** (`:2475`) sits beside E-12 as the sibling error row, BR-33a (`:2420`) now cites `AT-F20 (the writer half)` and `AT-F21 (the reader half)` in place of AT-F16/AT-F20, and §15.1's AC-5.1 row (`:2162`) names AT-F21 |
| M-02 | Medium | **Resolved**, and beyond what the finding asked for | I asked for a fourth AT-R6b fixture covering the (2, 3) pair. The row (`:1971`) was rewritten to **five named fixtures**, and fixtures 3, 4 and 5 range over **all three** ordered pairs the three-member order admits — (1,3), (2,3), (1,2) — one pair each, with the (1,2) pair pinned by "**no** `DECISIONS-*` file is created or appended", which is the conjunct that stops that rank being inferred from the other two. The (2,3) fixture asserts exactly the four observables I named (`target = docs/_decisions/DECISIONS-{failure-mode-id}.md`, `route = decisions`, no guard-set write, no PR) and states in its own text why it exists: "an implementation whose rule is 'constraints wins, otherwise keep whichever proposal arrived first' is green on every other row in §13 and red only here". The row closes with the set-equality reasoning I asked for — "The three together range over **every** pair the three-member order admits … sampled at one pair, the enumeration is not covered" — and BR-33b (`:2421`) names fixture 2 for the tie-break and fixtures 3/4/5 for the pairs |
| L-01 | Low | **Resolved**, at the seam and at the call site | §6.5 now cites `parseAbbrevRef` (`:3491-3496`), "the read itself is `readHeadBranch` (`:3520`), which issues `_git(["rev-parse", "--abbrev-ref", "HEAD"])` through the seam at **`:3524`**, and the branch guard calls it at `:3580`". Verified every one at HEAD: `function parseAbbrevRef(result)` is `orchestrate-dev.js:3492` (JSDoc `:3491`), `async function readHeadBranch(git)` is `:3520`, `result = await git(["rev-parse", "--abbrev-ref", "HEAD"]);` is `:3524`, `const head = await readHeadBranch(git);` is `:3580`, `gitWithLockRetry` `:8617`, `commitPaths` `:8669`. The stale `:3585` is gone from the document |
| Q-01 | — | **Answered, as an assertion** | AT-F19's report-body conjunct is now the **literal `3`** — "the cardinality of `{B, C, D}` on this fixture — not merely as present: a report emitting a constant, or the count of every recorded id (`4` here), satisfies presence". Naming the wrong-answer literal `4` is what makes the conjunct falsifiable rather than merely stronger |
| Q-02 | — | **Answered, closed** | §6.5 gains a paragraph (`:937-941`): "**The permitted read set is the closed two-member enumeration the table spells** … a pass that needs a third read verb (`git log`, `git diff`, a `gh pr list`) is a change to this table, made here, not a reading of it", and the table cell now reads "the two **non-mutating reads**" rather than "every non-mutating read" (`:917`). A test author reading §6.5 alone reaches the closed set — which was the postmortem's own housekeeping check (`POSTMORTEM-F:324-326`) |
| Q-03 | — | **Answered** | ER-5 (`:2122`) now spells its on-landing delta in ER-2's form: "'no AT changes' is not the permanent answer … once the value grammar is vocabulary-owned, a **value-level** check over `suppressed-by:`'s two spellings becomes available to AT-L5 (or to a sibling row), and AT-Q10's literal-text conjunct becomes an assertion against §1 rather than against §10.3 alone. Values staying outside AT-L5's domain is a consequence of the erratum being open, not a non-goal." That is the distinction I asked for |

## Findings

Three findings, all **Low**, all new, all inside text this revision introduced. No unchanged section
was re-litigated. All three are of the class `DEC-LAYER-01` assigns below this layer — **fixture
construction and oracle strength** (`DECISIONS-spec-layer-boundary.md:31-33`) — and in each case the
FSPEC does state the observable, so per that decision's review consequence (`:35-39`) they are Low,
"deferred, tracked", not blocking. Each also has a one-clause FSPEC-layer repair, given below, that
adds **no** new rule, BR or AT and so is admissible under the freeze; taking the repair or taking the
deferral both close the finding.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-01 | Low | Local | **§8.2's tie-break note claims a fixture asserts the kind-3 `target`-following clause; the fixture it names cannot.** `:1280-1282` reads "AT-R6b's colliding fixture asserts **which** `artifact` survives (and, on a kind-3 merge, the `target` with it)". AT-R6b's colliding fixture is **fixture 2**, whose Given is explicitly "**Colliding subjects, both AC-2.2**" (`:1971`) — kind 2 on both sides. On kind 2 the `target` is `docs/_decisions/DECISIONS-{failure-mode-id}.md`, a function of the id, and the id is invariant under the tie-break by that section's own second note (`:1275-1277`) — so fixture 2's `target` is decided before the tie-break runs and cannot observe it. Fixtures 3, 4 and 5 are each "over one shared subject … no tie-break is in play" (`:1971`), and in 3 and 4 precedence returns kind 1 or 2, never 3. So no fixture in §13 merges colliding subjects under a precedence that returns kind 3, which is the *motivating* case the rule states for itself at `:1261-1264` ("A same-kind merge of two process learnings over colliding subjects therefore leaves both `artifact` and `target` with two candidates"). The gap is falsifiable and cheap to state: `target` is set per proposal at §5.2 time and then chosen at merge time, so an implementation that applies lexicographic-first to `artifact` and keeps proposal order for `target` is green on all five fixtures — and §8.5's BR-35a file-existence test then runs against a `target` and an `artifact` that disagree. Note this line was named in the resolution as already repaired ("§8.2 `:1280` no longer overstates the fixture's `target` assertion", `POSTMORTEM-F:355-356`); the parenthetical is still there and still reads as an assertion about fixture 2. **FSPEC-layer repair, one clause:** delete the parenthetical, leaving "asserts **which** `artifact` survives", and name the owner of the kind-3 case — the two-process-learning colliding merge — as PROPERTIES/AT-layer per DEC-LAYER-01 | §8.2 `:1278-1282`, §13.4 AT-R6b `:1971` |
| L-02 | Low | Local | **E-12b's Given enumerates three indexed fields; the AT it names fixtures two of them, and the omitted one carries the strongest stated unsafe direction.** E-12b (`:2475`) reads "missing a field a reader indexes … `route` for §6.4 / §8.4 step 1, `target` for §5.1, **`artifact` for §8.3 / §8.5**", and its AT cell is `AT-F21` alone. AT-F21's fixture carries a record short of `route` and one short of `target` — no `artifact`-short record exists in §13 (I grepped the whole AT set, not a sample). The two `artifact` arms are not the mild ones: §8.1's reader table says a short `artifact` at §8.3 leaves "the row … still emitted, keyed on the id … the row is never dropped, **which would read as `insufficient-evidence` and silently move a verdict**" (`:1132`), and at §8.5 "the test cannot run: the promotion keeps the state it had for that pass and **no** remediation is proposed — the notice is the report, **never a guessed `retirement`**" (`:1133`). Both name a specific wrong outcome that changes an operator-visible verdict or emits an unasked-for retirement, and neither has a fixture. This is the completeness-by-set-equality problem in an error table rather than an AT: an enumerated Given sampled at two of three members, with a traceability cell that reads as if all three were covered. **FSPEC-layer repair, one clause:** qualify E-12b's AT cell — `AT-F21` for the `route`/`target` arms, the `artifact` arms named as PROPERTIES-owned per DEC-LAYER-01 — so the row no longer claims coverage it does not have | §19 E-12b `:2475`, §8.1 reader table `:1126-1136`, §13.7 AT-F21 |
| L-03 | Low | Local | **AT-F21's positive-downstream conjunct is asserted for one of its two short records; the other participates only in the notice and bytes conjuncts.** Conjunct (3) reads "`E`'s proposal is **re-proposed**, not suppressed … and `E` is present in the open-promotion list §8.4 step 1 computes" — `E` is the `route`-short record. `F`, the `target`-short one, appears in conjuncts (2) and (4) only, so the arm §8.1's reader table states for it — §5.1 routing: "not routed; the promotion is re-proposed on a later pass" (`:1129`) — has no assertion anywhere. What that leaves unfalsified is narrow but real: an implementation that reports the notice for `F`, leaves its bytes alone, and then routes it anyway on a guessed `target` passes AT-F21 as written, and a guessed `target` is one of the three behaviours BR-33a forbids by name. The row already knows the shape of the fix — it is conjunct (3) applied to `F`'s arm — so this is oracle strength on an existing fixture, not a new fixture. **FSPEC-layer repair:** extend conjunct (3) to name `F`'s arm (not routed, re-proposed), or state that `F`'s downstream arm is PROPERTIES-owned | §13.7 AT-F21 `:2028`, §8.1 reader table `:1129` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Fixtures 3, 4 and 5 of AT-R6b all use `phase = P` and the same subject `pdlc/workflows/orchestrate-dev.js`, so all three derive the **same** `failure-mode-id` — which is what makes the merge fire, and is correct. Are they three separate passes (three fixtures, three logs), or is there any reading under which a test author builds them as one pass? The row says "each one pass at `phase = P`", which I read as three passes; asking only because a single-pass reading would collide all three merges on one id and one record, and the row's assertions are per-fixture. No finding either way. |
| Q-02 | §6.5's closed-read-set paragraph says a pass needing `git log` / `git diff` / `gh pr list` "is a change to this table, made here". Under DEC-LAYER-01 seam verb permitted-sets are TSPEC-owned (`DECISIONS-spec-layer-boundary.md:30`). Does "made here" survive that decision — i.e. is §6.5's table the frozen v6.1 statement that TSPEC now inherits and may widen with a recorded reason, or does a widening still require an FSPEC edit? Asking so the TSPEC author is not left guessing which document owns the set they are about to transcribe. |

## Positive Observations

- **AT-F21 is the row I asked for, and it pairs every negative with a positive on the same path.**
  Five conjuncts over one fixture: terminal status reached (positive) beside "does not halt"
  (negative), the notice naming each record beside the record's bytes unchanged, and — the one that
  makes it a real oracle — the positive downstream state, `E` re-proposed and present in AT-F19's
  open list. The row then names the three prohibited implementations and says each "is red on
  exactly one of these conjuncts", which is the sentence that proves the conjunct set is not
  padding. It is a file-fixture test with no agent in it, so it is writable today.
- **AT-R6b now covers the kind order by set-equality over its ordered pairs, not by sampling.**
  Fixtures 3, 4 and 5 give (1,3), (2,3) and (1,2) one fixture each, and the row says why the third
  is not redundant: without the (1,2) fixture the rank is "inferred from the other two". The (2,3)
  fixture names the exact wrong implementation it kills ("constraints wins, otherwise keep whichever
  proposal arrived first … green on every other row in §13 and red only here"). That is a fixture set
  written to falsify a transposition, which is what an enumerated order needs.
- **The tie-break refuses proposal order for a stated, testable reason.** "'First proposed' is not
  [a pure function of the inputs]: proposal order is decided by the pass's own model, so an
  implementation keyed on it is not reproducible across two passes over one corpus" (`:1270-1274`).
  A tie-break keyed on model output would be an untestable rule dressed as a rule; refusing it on
  determinism grounds, and naming the byte comparison plus the literal that discriminates it
  (`pdlc/skills/a-b.md`, `-` = 0x2D before `/` = 0x2F — which I verified is the correct ordering
  for those two paths), is what makes it fixturable at all. My L-01 is about one clause of the
  coverage claim, not about the rule.
- **AT-F19's count conjunct names the wrong answers, not just the right one.** "the **literal `3`**
  … not merely as present: a report emitting a constant, or the count of every recorded id (`4`
  here), satisfies presence". Stating the value a defective implementation would emit is the
  difference between an assertion and a stronger-sounding assertion.
- **Every repository claim in the changed text holds at HEAD, including the two the revision moved.**
  I re-derived rather than trusting the resolution note: `readHeadBranch` `orchestrate-dev.js:3520`,
  its seam call `:3524`, the guard's call site `:3580`, `parseAbbrevRef` `:3492`, `gitWithLockRetry`
  `:8617`, `commitPaths` `:8669`, and AT-R6b's new guard-set citation `MERGE_GUARD_DEFAULTS`
  `:48-53` — which is exactly the frozen four-member array, and `pdlc/workflows/` in it is what makes
  fixture 3's subject a genuine guard-set path. No citation in the changed text is off by a line.

## Recommendation

## Verdict
