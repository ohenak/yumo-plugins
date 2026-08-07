# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 9
**Scope:** Local (Scope tags per finding below)
**Delta base:** `980fde0` (the tree v8 reviewed) → HEAD

Delta re-review. v8's findings F-45…F-47 are dispositioned in §Prior findings; new findings are
numbered F-48 onward so ids never collide across rounds. Only the five commits that touched the REQ
since `980fde0`, plus the two new `docs/_constraints/` files they created, were read for new issues;
unchanged sections approved in v1–v8 were not revisited.

## Prior findings

All three v8 findings are dispositioned below, each against the code or the measurement the revision
cites rather than against its prose.

| v8 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-45 | Medium | **Partially resolved — the ordinary path is closed, one state further out is not; refiled as F-48 at Medium** | The round made the choice I said the REQ had to make, and made it on the strongest of my three shapes plus a fourth I had not offered. AC-5.3 gains "**when the pass's chosen alternative is already on a PR in state open or merged, it proposes the other one**", declares `retire` **terminal**, and adds a streak reset — "a **merged** revision resets that promotion's `ineffective` streak to zero … re-judged on two fresh `recurred` counted passes rather than re-flagged on the next one" (`:430-435`). AC-5.1's `action` paragraph was made to agree rather than left behind: remediations reach AC-3.1 "unimpeded **by it**" but "can still be suppressed by an *earlier remediation of the same kind* — each action fires at most once per id" (`:390-392`). The exact v8 fixture is now decidable: promote merged → `ineffective` → `revise` merged → streak 0 → two fresh `recurred` → `ineffective` → `revise` spent → **retire** proposed. What remains is the state one tick beyond that, where *both* alternatives are spent because the retirement is sitting on an open PR; NFR-4's key is open-**or**-merged (`:522-528`), so it suppresses. Refiled narrowly as F-48. |
| F-46 | Medium | **Resolved — the breach is cleared, and cleared by relocation rather than by another compression pass** | At HEAD the REQ is **634 lines / 61,053 bytes** (`wc -l -c`) against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — under both, where v8 measured 683 / 65,492. The 4,439 bytes came out through the mechanism `pm-author/SKILL.md:118` names: two new project-level files, `docs/_constraints/pdlc-consolidation-vocabularies.md` (118 lines — §1 vocabularies, §2 the phase observable, §3 the log's record grammar) and `docs/_constraints/pdlc-advisory-corpus-baseline.md` (60 lines), both committed, each carrying a `Cited by` row and a version. I checked the relocation for loss rather than for size: the §1 table is row-for-row identical to the old §4b table plus both joins and the composition paragraph verbatim, and the three "as above" / "any status emitting a proposal" cells were **replaced by explicit sets** (`:47-49`) under the file's own rule that "no cell in either table below may use a positional back-reference" (`:15-16`) — so the set-equality obligation survived the move and got harder to break by row insertion, not softer. The residual margin is thin enough to note separately (F-50, Low). |
| F-47 | Low | **Resolved, and over-delivered** | AC-5.1 gains "**One promotion is one authored file**" (`:373-380`), which states the split direction as a requirement — "a remedy spanning two authored files is **two** proposals — two ids, two AC-3.3 commits, two AC-5.2 rows, two AC-5.3 streaks — which may share one PR" — so AC-5.2's per-id set-equality and AC-5.3's streak are now decidable for the two-file remedy I described. The paragraph also closes a hole I had not filed: a **generated** path never mints an id, so `pdlc/workflows/orchestrate-dev.js` plus its rebuilt `dist/` bundles is one promotion, not three. That citation checks out — `CLAUDE.md:68` reads "`pdlc/workflows/dist/` must be rebuilt in the same commit", which is what the REQ attributes to it. |

## Findings

Four Lows, no Medium, no High. Both v8 Mediums are resolved on their mechanism; F-47 is resolved and
over-delivered. Nothing in the changed text makes a claim about code at HEAD that does not check out
(see §Positive Observations for the citations I re-verified line by line). The four below are each a
single clause of imprecision in material this round introduced or relocated — none of them blocks a
test author from writing the fixture today, which is exactly why none is filed higher.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-48 | Low | Local | **The displacement rule's base case rests on one word that reads "retired" where the state is "retirement proposed", so the both-alternatives-spent tick is decidable only by inference.** AC-5.3's new paragraph makes the ladder total by two clauses: "**when the pass's chosen alternative is already on a PR in state open or merged, it proposes the other one**", and "`retire` is the **terminal** remediation — a retired promotion is gone, so no successor is owed and the ladder cannot run out" (`:430-435`). The first clause is unconditional and the second is the base case that stops it recursing. Reachable state: `promote` merged → `ineffective` → `revise` merged → streak reset to zero (`:434`) → two fresh `recurred` counted passes → `ineffective` → `revise` spent, so `retire` is proposed → the operator leaves the retirement PR **open** across two more counted passes, during which the promotion still exists (it is retired only when that PR merges) and still recurs → `ineffective` fires a third time. Now both members of the closed alternative set are on PRs in state open-or-merged, so NFR-4's key matches both (`:522-528`) and the displacement clause, read literally, points from each to the other. The base case is present in intent — `retire` is declared terminal precisely to stop this — but its justification is written about a promotion that has been *retired*, not one whose retirement is *pending*, and the pending case is the reachable one. A test author building that fixture must choose between two readings: (a) the ladder ended when `retire` was proposed, so the pass opens nothing, records `duplicate-suppressed` naming the pending retirement PR in `suppressed-by:`, and the AC-7.1 field names `retirement`; or (b) the displacement clause applies and the outcome is undefined. Reading (a) is the dominant one and I expect implementers to land on it, which is why this is Low and not a repeat of v8's F-45 — but it is an inference, not a transcription. One clause fixes it: state the base case over the *proposal*, e.g. "once a `retire` proposal for an id is on a PR in state open or merged, that id's ladder has ended: a later `ineffective` tick proposes nothing, records `duplicate-suppressed` against that PR, and the AC-7.1 field names `retirement`." | AC-5.3 ("A spent alternative, and the terminal remediation"), NFR-4, AC-7.1 |
| F-49 | Low | Cross-Feature | **The enumeration that every downstream set-equality oracle transcribes now lives outside the reviewed document, and only the *addition* direction of the defect rule travelled with it — a deleted row is the case set-equality exists to catch, and it is now unstated and undiffable in the REQ.** §4b at HEAD reduces to a citation and one obligation: the vocabulary "is stated once … in `docs/_constraints/pdlc-consolidation-vocabularies.md` §1 … downstream completeness is checkable by **set-equality against it**, and adding a value here without a row there is a defect" (`:561-571`). The relocation itself is right and I said so under F-46. What did not survive it is symmetry. While the table sat in the REQ, deleting `branch-exists` was a diff in a document under cross-review, so both directions of the set-equality contract were mechanically visible. It now sits in a file whose own header declares it "**not** a pipeline artifact, not reviewed, not queue-eligible" (`pdlc-consolidation-vocabularies.md:5`), and the REQ cites it by section only — never by the `Version` the file carries (`1.1 · 2026-08-06`, `:7`). So a test transcribing that table has no pinned expected value, and a row deleted there breaks no stated rule: the REQ still names `branch-exists` at AC-3.5 (`:269`), but nothing says the mismatch is a defect. Two clauses close it, and the file is already shaped for both: cite it **at its version** from §4b, and state the converse defect rule ("a value the REQ names with no row there, or a row there naming a value the REQ never uses, is equally a defect") in the file's own change-control paragraph beside the back-reference ban it already carries (`:15-16`). Tagged Cross-Feature because it is a property of relocating an enumerated contract out of a reviewed artifact, not of this REQ — every future feature that trims to budget this way inherits it. | §4b; `docs/_constraints/pdlc-consolidation-vocabularies.md:5`, `:7`, `:15-16`, `:24-53` |
| F-50 | Low | Process | **The breach is cleared but the margin is 387 bytes — 0.6 % — so `pm-author` rule 5e's relocate-first trigger fires again at the start of the next round, before any of the clauses above can be written.** At HEAD the REQ is 634 lines / **61,053** bytes (`wc -l -c`) against `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:42`); 5 % of that ceiling is 3,072 bytes and the margin is 387. The file is also still past both soft thresholds (`SOFT_LINE_LIMIT=630`, `SOFT_BYTE_LIMIT=55296`, `:47-48`). `pdlc/skills/pm-author/SKILL.md:118` requires relocation "**before** addressing that round's findings — never after", so a v9 round that writes F-48's and F-49's clauses inline breaches on contact: F-48 alone is roughly 300 bytes. I am filing this as `Process`/Low rather than blocking, because the round did the right thing and did it the right way — two committed `docs/_constraints/` files, each with `Cited by` and `Version`, and the §1 table checked row-for-row for loss. The signal worth carrying is that a relocation sized to *clear* the ceiling rather than to *restore working margin* buys one round. The next relocation candidate is visible and is the same shape: REQ-CONS-01's legacy-region construction and its two-clause frozen-boundary argument (`:93-107`) are project-level facts about `.consolidation-log.md`, and `pdlc-consolidation-vocabularies.md` §3 is already the file that owns that log's grammar. | Whole document; `pdlc/hooks/scripts/check-req-size.sh:42`, `:47-48`; `pdlc/skills/pm-author/SKILL.md:118` |
| F-51 | Low | Local | **"A generated path is never an `artifact`" is stated as a rule but exemplified as a single case, so the authored/generated classifier a test must implement is not transcribable for any path outside `pdlc/workflows/dist/`.** AC-5.1's new paragraph closes the split direction well (F-47, resolved) and adds: "A **generated** path is never an `artifact` and never mints an id: the tracked outputs of `pdlc/workflows/build-runtime.mjs` under `pdlc/workflows/dist/`, which this repo requires to be rebuilt 'in the same commit' as their source (`CLAUDE.md`, …), ride the authored file's commit" (`:373-377`). The citation is exact — `CLAUDE.md:68` reads "`pdlc/workflows/dist/` must be rebuilt in the same commit" — and the worked example is the right one. What is missing is the predicate: "generated" appears nowhere else in the REQ (grep: `:371`, `:373`, `:375`, and `:599` in an unrelated sense), so the rule is a class with one member. The derivation must be **total** — AC-5.1 says so in the same breath ("the derivation stays total on every edit shape", `:377`) — and totality over a class defined by one example is not checkable. A test author can write the `orchestrate-dev.js` + `dist/` fixture today and will get it right; they cannot decide `pdlc/workflows/dist/distribution-manifest.json` promoted on its own, or a future generated artifact outside `dist/`. One clause gives the predicate a decidable form — e.g. "a path a tracked build step of this repo writes, as documented in `CLAUDE.md`'s generated-artifact list; at HEAD that set is exactly `pdlc/workflows/dist/`" — which also makes the set-equality obligation of F-49 apply to it. | AC-5.1 ("One promotion is one authored file"), `CLAUDE.md:68` |

## Questions

No open questions. None of the four findings is a request for information: each names the clause that
closes it, and in three of the four the REQ already contains the intent the clause would make literal.

## Positive Observations

- **The relocation was checked for loss, not for size, and it survived that check.** I compared
  `docs/_constraints/pdlc-consolidation-vocabularies.md` §1 (`:24-53`) against the §4b table it
  replaced, row by row: same 28 rows, same order, both joins (`:55-58`) and the composition paragraph
  (`:60-64`) verbatim. The three cells that had read "as above" or "any status emitting a proposal"
  were **replaced by explicit sets** — `ineffective`/`unmeasurable` and `revision`/`retirement` now
  both read "any status emitting the AC-5.2 table" (`:47`, `:49`), and `action` reads
  "`promoted`, `promoted-degraded`, `no-op`" (`:48`) — under the file's own rule that "no cell in
  either table below may use a positional back-reference" (`:15-16`). I checked that resolution for
  fidelity rather than assuming it: `failed` is excluded from the `action` row, and that is correct,
  because AC-3.5's four failure classes all resolve to `promoted-degraded`/`no-op` (`:264-269`) and
  AC-1.6's `failed` is decided before any proposal exists (`:211-215`). The set-equality obligation
  came out of the move harder to break by row insertion, not softer.
- **The size fix was a relocation, not a fifth compression pass — which is what I asked for and the
  more expensive of the two options.** 4,439 bytes came out into two committed project-level files,
  each carrying a `Cited by` row naming the exact REQ sections that depend on it and a `Version`
  stamp. `pdlc-advisory-corpus-baseline.md` additionally carries `Verified at | HEAD, 2026-08-06` —
  which is the right shape for a file whose whole content is claims about `orchestrate-dev.js` line
  numbers. No reason was deleted to fund it.
- **Every relocated citation still resolves at HEAD, and I re-verified them in the new files rather
  than trusting that a move preserves truth.** `MODEL_ADVISORY` (`orchestrate-dev.js:1652`) and
  `MODEL_ADVISORY_FALLBACK` (`:1653`) are the two constants; `resolveAdvisoryRung` is exported at
  `:1833`; the `ADVISORY_MODEL_FALLBACK:` announcement is at `:1859`; `MERGE_GUARD_DEFAULTS` is the
  frozen four-member array at `:48-53`; the POSTMORTEM name is built at `:5429` and the cross-review
  name at `:5799`; `recordPhase("I", …)` is at `:10020`. `CLAUDE.md:68` says what AC-5.1 attributes
  to it, word for word. `check-req-size.sh` still reads `LINE_LIMIT=700` / `BYTE_LIMIT=61440`
  (`:41-42`) and `SOFT_LINE_LIMIT=630` / `SOFT_BYTE_LIMIT=55296` (`:47-48`).
- **F-45 was answered on the strongest available shape, plus one I had not offered.** I gave three
  options and the round took the hardest — a displacement rule plus a terminal action — and added a
  fourth mechanic I had not asked for and that the fixture needs: a **merged** revision resets the
  `ineffective` streak to zero (`:434-435`), so a revision that lands is re-judged on two fresh
  `recurred` counted passes. Without that reset the very next counted pass would re-flag a promotion
  whose fix had just merged, and the AC-5.3 oracle would have been decidable but wrong. The residual
  I file as F-48 is one word inside that new paragraph, not a missing mechanism.
- **AC-5.1's new paragraph closed a hole I had not filed while closing the one I had.** F-47 asked
  only for the two-authored-file id count; the answer states it as a requirement with all four
  consequences enumerated ("two ids, two AC-3.3 commits, two AC-5.2 rows, two AC-5.3 streaks — which
  may share one PR", `:371-373`) **and** rules that a generated path never mints an id, which removes
  a three-ids-for-one-edit reading of the likeliest promotion this feature will ever make. That is the
  fourth consecutive round in which the narrower answer was available and the wider one was given.
- **AC-5.3's report field gained its absent case from the SE side without weakening mine.** The
  `revision` / `retirement` field is now "**absent** for an ordinary `promote`, which chose nothing"
  (`:423`). A three-state field (`revision` / `retirement` / absent) with each state tied to a stated
  precondition is assertable; the two-state field it replaced forced an implementer to invent a value
  for the ordinary path. F-48 is the one remaining state that field does not name.

## Recommendation

**Approved with minor changes** — 0 High, 0 Medium, 4 Low.

Both v8 Mediums are resolved, and resolved on the mechanism rather than on the wording. F-45's
undecidable second-remediation cycle is closed by a displacement rule, a terminal action and a
streak reset on a merged revision — the exact fixture I said had two defensible expected outcomes now
has one. F-46's size breach is cleared by relocation to two committed, versioned `docs/_constraints/`
files, and I checked the relocation for content loss row by row rather than for byte count: the
enumerated table came across intact and its three back-reference cells were resolved into explicit
sets, so the set-equality obligation is stronger after the move than before it. F-47 is resolved and
over-delivered.

I want to be explicit about why this is an approval and not a fifth "Needs revision". The Challenger
bar is any open High or Medium, and I applied it to each of the four candidates rather than to their
count. None of them survives it:

- **F-48** would be a Medium if the base case were missing; it is present ("`retire` is the
  **terminal** remediation"), and only its justifying sentence is written about a *retired* promotion
  where the reachable state is a *pending* retirement. The dominant reading is decidable and correct.
- **F-49** and **F-51** are each an unstated direction of a rule whose stated direction is exact. A
  test author can transcribe both tables today; what is at risk is drift after the fact, not the
  fixture now.
- **F-50** is a measurement inside the ceiling, filed `Process` because the lesson is about how much
  margin a relocation should buy, not about this document's content.

What should change, in order — all four are single clauses and together are well under 1 KB, but see
F-50 before writing any of them inline:

1. **F-48** — Restate AC-5.3's base case over the *proposal*: once a `retire` proposal for an id is on
   a PR in state open or merged, that id's ladder has ended — a later `ineffective` tick proposes
   nothing, records `duplicate-suppressed` against that PR, and the AC-7.1 field names `retirement`.
2. **F-49** — Cite `pdlc-consolidation-vocabularies.md` **at its version** from §4b, and state the
   converse defect rule in that file beside its back-reference ban, so a deleted row is a defect too.
3. **F-51** — Give "generated path" a decidable predicate rather than one example.
4. **F-50** — Relocate before writing 1–3, not after. REQ-CONS-01's legacy-region construction
   (`:93-107`) is the natural next block and `pdlc-consolidation-vocabularies.md` §3 already owns that
   log's grammar.

No upstream defects were found. Every `file:line` in the changed text and in both new
`docs/_constraints/` files resolves to a real authority saying what is attributed to it —
`orchestrate-dev.js:48-53`/`:1652`/`:1653`/`:1833`/`:1859`/`:5429`/`:5799`/`:10020`,
`orchestrate-queue.js:1245-1256`, `CLAUDE.md:68`, `check-req-size.sh:41-42`/`:47-48`,
`pm-author/SKILL.md:118`. No ERRATUM lines are emitted.

## Verdict

VERDICT: Approved with minor changes
