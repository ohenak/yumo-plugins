# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 9 (delta re-review of PROPERTIES v0.5 → v0.6; frozen round)

## Overview

**What I reviewed.** The delta `7ac7fe8b..HEAD` on
`PROPERTIES-pdlc-learnings-injection.md` (v0.5 → v0.6, two commits: `2769ce86`, `23adb5e5`).
`git diff --stat 7ac7fe8b..HEAD` over `docs/` shows exactly three files — this document plus the two
v8 cross-reviews — and the document's own diff is **32 insertions / 10 deletions in five hunks**: the
version cell (0.5 → 0.6), one LI-04 citation reword, the §C.4 heading-form / `maxBytes` enumeration,
the §C.4 P-A-6 quote, the §C.4 LI-AT-30 citation reword, and §G.3's "Still open" list. Nothing else
moved: `## Overview`'s premise table, all ten property groups (§P.A–§P.J), §O.1–§O.9, §F.1–§F.4,
§C.1–§C.3 and §G.1–§G.2 are byte-identical to the text I approved at v8.

**My three v8 findings — all three resolved, each in the form I asked for.**

- **F-01 (Medium, Process)** — §C.4 asserted a routing §G.3 did not carry. **Resolved.** §G.3's
  header now reads `**Still open — three items:**` and carries both P-A-7 case-B items as bullets
  ahead of the AT-15 item, each closing "Whether … is PLAN's call; this document routes the gap and
  decides nothing" — the DEC-ERR-01-compliant framing. The AT-15 bullet gained a parenthetical
  distinguishing the re-routed item from the two new ones. The §C.4 assertion and §G.3's list now
  agree, so the routing reaches an author from this document rather than only from my dispatch.
- **F-02 (Low, Local)** — the overstated un-numbered-`## Cross-Feature Patterns` absence.
  **Resolved, and narrowed exactly as proposed.** The clause now says the suite carries "none of
  `LI-AT-11`'s **variant** heading-form arms", enumerates the three that are genuinely absent, and
  states affirmatively that the un-numbered spelling *does* appear "as LI-AT-05's material and as
  LI-AT-12's fixture text, with `expect(result.sections).toEqual(["Cross-Feature Patterns"])` proving
  the matcher accepts it — so what is owed there is the variant fixture as a whole, not that
  spelling". I re-verified every half: `## Cross-Feature Patterns` at `learningsBlock.test.js:42`
  (inside the LI-AT-05 test, `:39–:66`) and `:110` / `:130` (inside the two LI-AT-12 tests), with the
  `toEqual(["Cross-Feature Patterns"])` assertions at `:118` / `:139`; the glossed
  `"Rejected Proposals (with rationale)"` at `:81` and no un-glossed variant anywhere;
  `grep -n '###'` over the file returns nothing; `Process Findings` does not occur.
- **F-03 (Low, Local)** — the "only `maxBytes` literals" claim. **Resolved.** The sentence now says
  "only ***binding*** `maxBytes` literals", names them by their source form (`const maxBytes = 40`,
  `const maxBytes = 66`) and names the third call explicitly as "a deliberately non-binding `100000`
  under the comment 'Unbounded: large enough that maxBytes never binds'". Verified at
  `learningsBlock.test.js:111`, `:131`, `:86–:87`; the comment text is an exact prefix of `:86`.

**What the revision broke.** Nothing. Every claim in the delta re-verifies against the repository,
with one exception that is a quotation-fidelity slip inside a §G.3 bullet, not a false claim (F-01,
Low). No property, oracle, level, fixture, count or trace moved: `grep -o 'PROP-[A-Z]*-[0-9]*' |
sort -u | wc -l` still returns **70**, matching the header and §C.4's summary table.

**Verification method.** `git diff 7ac7fe8b..HEAD` on the document and `--stat` over `docs/`;
`grep -n 'describe(\|test('`, `grep -n 'maxBytes\|100000\|Hand-computed\|Unbounded\|Rejected
Proposals\|Process Findings\|Cross-Feature Patterns\|toEqual'` and a `###` grep over
`pdlc/workflows/__tests__/learningsBlock.test.js`; `grep -n 'LI-AT-30'` over
`learningsConfig.test.js`; `sed -n '13p' .gitignore`; exact-substring greps of PLAN's P-A-6 answer
row and P-A-7 case-B row; `git log -1` on `2cbacada`, `d462ddd8`, `92b7ea0c`.

## Properties

No property text changed in this delta. Groups A–J, their claims, levels, owning tasks and mutation
rows are byte-identical to v0.5. What the delta touches is §C.4's account of *what the landed suite
already contains* — which is the evidence that four Group-B/D properties are still owed — plus §G.3's
routing of the two gaps that account exposes. So what I re-checked is whether the narrowed
enumeration still supports "all four owed", and it does, on grounds I re-measured rather than
inherited.

- **PROP-BOUND-03 (zero bound) — still owed.** No `extractInjectableMaterial(text, 0)` call exists in
  `learningsBlock.test.js`; the three calls pass `100000` (`:87`), `maxBytes = 40` (`:111`, used at
  `:113`) and `maxBytes = 66` (`:131`, used at `:133`). The delta's new "only *binding* literals"
  phrasing does not weaken this — the load-bearing half is the absence of the zero call, and it is
  unchanged and true.
- **PROP-BOUND-05 (section list from the rendered block) — still owed.** The landed suite recovers
  sections only from the producer's own report: `expect(result.sections).toEqual(BR6_SECTION_NAMES)`
  (`:90`) and `toEqual(["Cross-Feature Patterns"])` (`:118`, `:139`). `SECTION_HEADING_RE` occurs
  nowhere in the file. The delta's concession that the un-numbered spelling *does* appear does not
  touch this — appearing as fixture input is not the same as being re-derived from output, and the
  revised sentence says exactly that ("what is owed there is the variant fixture as a whole").
- **PROP-BOUND-07 (framing vs material literal) — still owed.** No framing byte literal is asserted;
  framing is mentioned only in comments (`:10`, `:56`).
- **PROP-BOUND-08 (real-corpus arm) — still owed.** Neither `LEARNINGS_CORPUS_ARGV` nor `git ls-files`
  occurs in the file.
- **The suite's shape is quoted correctly.** `learningsBlock.test.js:38` is verbatim
  `describe("LI-17: block/material suite (LI-AT-05, LI-AT-11, LI-AT-12)", () => {` — one `describe`,
  three AT ids — and the file's four `test(` titles (`:39`, `:67`, `:103`, `:121`) confirm the
  AT-05/AT-11/AT-12 partition §C.4 describes. The `:42` and `:110`/`:130` occurrences the delta now
  concedes fall inside the AT-05 test and the two AT-12 tests respectively, exactly as the new
  sentence attributes them.
- **The scheduling premise is unchanged and still true.** `2cbacada` is LI-17 (GREEN the renderer),
  `d462ddd8` is LI-16 (GREEN the pure selection core), `92b7ea0c` is LI-21 — all three confirmed by
  `git log -1`. Case A remains unreachable, case B live, P-A-6's window spent. The P-A-6 quote hunk
  is a *fidelity improvement*: PLAN's row reads verbatim "commit at the first point the suite is
  green, which in practice is after LI-21 (batch 13)", and the delta corrects the document's earlier
  "the first point it is green" to match it exactly.
- **Counts unmoved.** 70 distinct `PROP-` ids, matching the header and §C.4's summary table; §C.1
  (35/35) and §C.2/§C.3 (23/23 tasks) are outside the delta and still reconcile.

## Oracles

No oracle text changed: §O.1–§O.9, §G.1's T-O-6 row and §O.8's mutation ledger are byte-identical to
v0.5. The delta's effect on the oracle surface is indirect — it changes how §C.4 and §G.3 *cite* the
landed suite — so the three discipline checks I run every round I ran against the new citation forms.

- **No implementation echo.** The delta introduces no expected value. Every literal it adds is a
  quoted source string (`const maxBytes = 40`, `const maxBytes = 66`, `100000`, a test title, a
  comment) used as a *locator*, never as an expectation. §G.2.2's hand-computed 40/66 derivation is
  untouched, and the landed suite still labels them "Hand-computed (never derived here)"
  (`learningsBlock.test.js:108`).
- **No absence-only oracle.** The revised §C.4 paragraph is strictly *more* positive than the text it
  replaces: where v0.5 asserted a bare absence for the un-numbered spelling, v0.6 states what the
  suite **does** carry on that path ("the un-numbered `## Cross-Feature Patterns` spelling *does*
  appear … with `expect(result.sections).toEqual(["Cross-Feature Patterns"])` proving the matcher
  accepts it") beside the three arms that are genuinely missing. Same for the `maxBytes` sentence:
  the non-binding `100000` arm is now named rather than silently excluded. The one real
  absence-shaped oracle in the neighbourhood, PROP-BOUND-03's zero case, is unchanged and still
  pairs its negative with the positive `{material: "", bounded: false, bytes: 0, sections: []}`
  return on the same path.
- **Set-equality, not containment.** Unchanged where it matters. The delta re-cites
  `learningsConfig.test.js`'s three LI-AT-30 cases **by test title instead of by line number**, and
  the third title is transcribed verbatim: the file's `:258` reads
  `test("LI-AT-30: maxBytesPerDocument: 0 ⇒ every non-self corpus path RSN-NO-MATERIAL, none
  RSN-COUNT, no slot consumed (E-36)")` — byte-for-byte what the document now quotes, including the
  `⇒`, the comma placement and the `(E-36)` tail. The two abbreviated titles
  (`"LI-AT-30: maxDocuments: 0 …"`, `"LI-AT-30: maxTotalBytes: 0 …"`) are exact prefixes of `:226`
  and `:242`. Its own summary of what `:258` asserts (`RSN-NO-MATERIAL` on every non-self path, no
  document carrying `RSN-COUNT`) remains a faithful précis of the set-equality assertion there.
- **DEC-DOC-01 posture improved, not degraded.** Three of the five hunks replace raw `file:line`
  anchors with citations that survive a reflow: LI-04's `.gitignore:13` → the rule's literal text
  (`the .gitignore rule /.baseline-worktree/`, still true — `sed -n 13p .gitignore` is
  `/.baseline-worktree/`); the `maxBytes` line numbers → the `const` declarations; the LI-AT-30 line
  numbers → the test titles. The one surviving raw anchor (`learningsBlock.test.js:38`) sits beside
  the verbatim `describe(…)` string it names, which is the exempt form.
- **One quotation-fidelity slip, in §G.3, not in an oracle.** §G.3's second new bullet puts PLAN's
  case-B span in quotation marks as "every batch from the landing batch through the batch that greens
  them". PLAN's actual text is "every batch from the one the commit lands in through the batch that
  greens them". The substance is identical and the gap the bullet routes is real; only the quoted
  form is a paraphrase presented as a quote. That is F-01 (Low). §C.4's own version of the same
  phrase is unquoted paraphrase, which is fine, and §C.4's shorter quote — "the batch that greens
  them" — is an exact substring.

## Fixtures

§F.1–§F.4 are byte-identical; the delta names no new fixture and moves no expected byte count. Three
fixture-adjacent claims changed form (not substance), and all three re-verify.

- **The fourteen-row inventory is untouched.** Every `exists (landed)` cell and every `Added by` sha
  is unchanged from the v0.5 table I checked exhaustively last round, including
  `fixtures/learnings-baseline/`'s four-path enumeration (`MANIFEST.json`,
  `PHASE-F-AUTHORING-PROMPT/0.txt`, `PHASE-R-REVIEW-PROMPTS/{0,1}.txt`, `4a6c1816`) and
  `helpers/learningsFixtures.js` (`1920f281`). The snapshot pin to `21edb7c5` survives the rewrite,
  so the inventory still cannot go silently stale.
- **LI-04's artifact citation.** Reworded from the `.gitignore:13` anchor to the rule's own text.
  Still exactly true at HEAD: `.gitignore` line 13 is `/.baseline-worktree/`, and it is the file's
  only occurrence of that string.
- **The heading-form fixture obligation is now stated at the right granularity.** The revised clause
  says what is owed is "the variant fixture as a whole", which is the correct fixture-level framing:
  the landed suite's fixtures are ad-hoc string literals (`:42`, `:110`, `:130`) exercising one
  spelling, while LI-AT-11's variant arm needs the declared-heading-form knob on
  `helpers/learningsFixtures.js`. The additivity premise for that knob is unchanged (PLAN, LI-02 row:
  `renderSection` already accepts `ordinal`, `gloss` and `body`), so no fixture obligation moved and
  no consumer suite gains a ledger row.
- **The glossed-name attribution is one degree off.** §C.4 says "the builder renders the canonical
  glossed `"Rejected Proposals (with rationale)"`". At `learningsBlock.test.js:81` that string is a
  literal in the section list the test hands the builder — the test pins it, the builder echoes it.
  The claim the sentence is making (no un-glossed variant is exercised) is true either way, so this
  is a wording nit inside a frozen round, recorded as DEFERRED, not a finding.
- **No expected value moved.** The `BYTES-BINDING` (3/5/0), `ZERO-BOUND`, `DIVERGENT-CORPUS`,
  `DISCARDED-NESTED`/`DISCARDED-DIRECT` and `COUNT-BINDING` fixtures are outside the delta, and
  nothing in the delta derives an expected value from the code under test or from PLAN's ledger.
- **`scripts/capture-learnings-baseline.mjs`** — the sentence survived the rewrite unchanged and
  still measures true; `ced75955` remains "LI-05 — GREEN the capture script".

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | §G.3's second new bullet quotes PLAN's P-A-7 case-B span as "every batch from the landing batch through the batch that greens them". PLAN's row reads "every batch from the one the commit lands in through the batch that greens them" — the quotation marks promise a verbatim transcription and deliver a paraphrase. The substance is unaffected (both name the same span) and the gap the bullet routes is real and correctly stated, so nothing downstream is misled; but a quoted string that is not the source's bytes is the failure mode DEC-DOC-01 exists to prevent. Fix in the next ordinary revision: either drop the quotation marks, or transcribe PLAN's clause exactly. §C.4's own use of the same phrase is unquoted paraphrase and needs no change, and §C.4's shorter quote "the batch that greens them" is already an exact substring | §G.3, "Still open — three items", second bullet |

DEFERRED: §C.4 attributes the glossed `"Rejected Proposals (with rationale)"` to "the builder"; at `learningsBlock.test.js:81` the string is a literal in the section list the test hands the builder, so the test pins it and the builder echoes it — the absence claim it supports is true either way.
DEFERRED: §G.3's two new bullets close with "are emitted as `ERRATUM: PLAN` lines from this dispatch", a reference to a reviewer dispatch rather than to a document state; a reader opening the file cold has no way to check it. Naming the round (SE v8) instead would make it self-checking.
DEFERRED: §G.1's T-O-6 tail ("No new PLAN task is required") and §C.4's "no red-owning task remaining ahead of them" are both true at different altitudes; a cross-reference between them would stop a reader reconciling them by hand. Carried unchanged from v8.
DEFERRED: the Overview's premise table still carries the capture-time row asserting no `learnings*` test file and no `scripts/` directory exists, which is false at HEAD. It is explicitly self-labelled a capture-time measurement whose falsification is scheduled by LI-04/LI-07…LI-14, and PROP-META-01 forbids asserting it, so it is not a defect — but §C.4 now models the better practice (pin to a named commit) and propagating that pin would close the last misreadable surface. Carried unchanged from v8.
DEFERRED: PLAN's `Status` column still reads ⬚ for LI-01…LI-21/LI-23 although the commits exist; PLAN v0.7 explains the column as dispatcher-owned, so it is not a PROPERTIES defect. Carried unchanged from v8.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §G.3 now routes both P-A-7 case-B gaps, and my v8 dispatch emitted them as `ERRATUM: PLAN` lines. I am deliberately **not** re-emitting them this round — re-routing an item already routed and still open is DEC-ERR-01's anti-pattern, and this document itself invokes that rule two paragraphs later. If the orchestrator's routing is per-dispatch rather than per-item, say so and I will re-emit both verbatim next round. |
| Q-02 | Unchanged from v8 and still open upstream: with P-A-6's window open (LI-21 at `92b7ea0c`) and the PROPERTIES suite not yet written, do the four owed Group-D amendments to `learningsBlock.test.js` land as a separate commit under P-A-7 case B, or in the same commit as the PROPERTIES suite — which would put P-A-6 and case B on one sha and needs the ledger row named first either way? This is PLAN's call and does not block this document. |

## Positive Observations

## Recommendation

## Verdict
