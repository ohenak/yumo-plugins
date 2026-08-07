# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-06
**Iteration:** 14
**Scope:** DELTA ONLY. Diff reviewed: `0499e532..HEAD` (four commits `bbd0c255`, `fabe861b`,
`d13c9ea8`, `99aff9bc` — 50 insertions, 16 deletions in one file), against my v13
**Approved with minor changes** at `0499e532`. I did not re-read the document; I read the diff, the
four sections it touches, and re-verified at HEAD every repo anchor the new text cites.

## Prior-finding disposition

All four of my v13 Lows are resolved, and both reviewers' Q-01 is answered in the document.

| v13 ID | Finding | Disposition | Evidence |
|---|---|---|---|
| L-01 | BR-13 not narrowed alongside BR-14 — read literally it refused on a fresh `RELEASED:` marker | **Resolved** | BR-13 (`:2583`) now reads "a second pass observing a **fresh `IN-PROGRESS:`** marker terminates `refused`", and adds the positive counterpart rather than only deleting the over-broad clause: "A `RELEASED:` marker is not held, so it is never refused on at any age (BR-14a, §4.2)". Its AT cell picks up `AT-M11` beside `AT-M1`, so the register row now points at the test that falsifies the misreading. Three registers (§4.2's table `:476`, BR-14a `:2585`, E-11b `:2679`) and BR-13 now agree. |
| L-02 | E-12b attributed the whole `phase` arm to §14.5 LD-5 while T-10 and BR-33a had been narrowed | **Resolved** | E-12b (`:2678`) now carries "the same narrowing T-10 and BR-33a carry: what LD-5 holds is **§8.3's** `phase` arm, because §8.4 steps 2–3's `phase` half is collected field-agnostically by §8.1's §8.4 steps 2–3 reader row". I checked the third register it had to match: LD-5 (`:2328`) enumerates `phase` as "(§8.3 emits the row, verdict `insufficient-evidence`)" — §8.3 only — and T-10 (`:2245`) as "**§8.3's `phase` arm** … deliberately not here". All three registers now say the same thing. The repair was the deletion-shaped one I asked for: no new rule, BR, AT or register entry. |
| L-03 | §4.2's new rationale claimed the empty marker has a single producer | **Resolved, and better than the repair I suggested** | The prose no longer over-claims ("it means one thing in general: a pass died part-way through a marker write", `:504-506`), and the two producers are given a **table** (`:510-513`) rather than a sentence — kill-inside-take at step 6 vs kill-inside-release at step 16, what each had already done, and the record each produces. The conservatism is stated as a direction, not an apology: "over-recording, never under-recording … a spurious reclamation row is legible to a reader holding the completed pass's own terminal row beside it, whereas a missed one is unrecoverable" (`:518-521`). AT-M3's oracle (`:2118`) is untouched and still holds on both producers, which is the property that kept this Low rather than Medium. |
| L-04 | AT-P7 did not name the channel the hook's set is observed through | **Resolved, all three parts** | AT-P7's *When* (`:2103`) now names the observation as "the block's **`pending` binding** (bound at `:41`, before the `THRESHOLD` comparison at `:43`), read out of the namespace the block was executed in — **not** from its stdout, which is threshold-gated". It also carries the two adjacent facts: the empty-corpus early exit "`if not learnings: sys.exit(0)` (`:29-30`), so … `pending` is unbound and the hook's set is read as empty rather than as an error" — which is the arm I was worried a test author would hit as a `KeyError` and call a failure — and the locator-drift warning that this feature itself edits `:28` and `:41`. Every citation re-verified at HEAD against `pdlc/hooks/scripts/nudge-consolidation.sh`: `THRESHOLD = 5` at `:25`, glob at `:28`, early exit at `:29-30`, read at `:36-37`, `pending` at `:41`, `n = len(pending)` at `:42`, `if n >= THRESHOLD` at `:43`. The row's `:43` is right; my own v13 text said `:42` and was off by one. |
| Q-01 | Should an aged `RELEASED:` marker be reported as evidence of a long-idle repo? | **Answered, in the form I asked for** | §4.2 `:485-493` answers it as a **declined option** with the reason: the cadence datum in `.consolidation-log.md` already answers "how long since the last pass" from a committed source, and the marker's timestamp "would be a second, weaker answer to the same question — one lost on every fresh clone". It closes with "The silence here is a decision, not an oversight", which is exactly the reading I wanted a later reader to have. No AT was invented to carry a question I explicitly did not ask for one on. |

One forward obligation in that new paragraph needed checking rather than trusting: "One consequence
belongs in TSPEC's operator notes rather than here: the operator question 'is a pass running?' is
answered by **reading the line**, never by the file's existence" (`:492-493`). TSPEC is already
authored, so an FSPEC assigning it a note it does not carry would be a real traceability gap. It
carries it: `TSPEC-pdlc-consolidation-agent.md:1034-1039` — "**empty in the steady state**, one per
consuming repo, carrying the last pass's `RELEASED:` line", and "a `RELEASED:`-carrying
`.consolidation-lock` means *free*, not *stuck*". No finding.

## Findings

One **Low**, new with this diff. Nothing carried forward: v13's four are all closed above. No test is
missing and no test would be written wrong on it.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-01 | Low | Local | **The new two-producer table's intra-document locator is stale.** Its second row cites "(§4.3 `:511-512` orders release after the append)" (`:513`), but `:511-512` are that table's own header separator and first data row. The statement it means to cite is §4.3 `:543-544` — "Release is unconditional for every marker-holding pass, including `failed`: it runs at step 16 after the terminal row is appended". The claim is **true** and the section named (§4.3) is right; only the line pair is wrong, and it is wrong by exactly the 34 lines this diff inserted above it, so it looks like a locator bumped by `+2` when the insertion moved it by `+34`. Nothing depends on it: the ordering is also fixed by §4.3's terminal-status table (`:534-541`, "yes, at 16") and by the step numbering, and no AT reads a line number. Repair is two digits. Worth flagging beyond the typo because it is the second-order cost L-04's own drift warning names — this document cites itself by line, and every edit invalidates some of those. | §4.2 (`:513`) vs §4.3 (`:543-544`) |

## Questions

None. My v13 Q-01 is answered in the document (`:485-493`) and I have nothing to replace it with.

## Positive Observations

- **A declined option was written down as a decision, which is the rarer half of answering a
  reviewer's question.** Q-01 asked whether aging a released marker had been considered and declined,
  precisely so a later reader would not read silence as oversight. The answer (`:485-493`) does not
  add a rule, an AT or a config key — it records the weighing, names the alternative that already
  answers the same question from a better source, and says which property makes the rejected one
  weaker ("lost on every fresh clone"). It also states its own scope: "no acceptance test asserts
  anything about a released marker's age beyond AT-M11's 'free at any age'", so the test surface is
  bounded in the same breath. An FSPEC that grows a feature every time a reviewer asks a question is
  the failure mode here, and this diff did not do it.
- **L-03 was fixed with a table where I had proposed a sentence.** My suggested repair was "name the
  second producer and say the record is deliberately conservative". The diff builds a three-column
  producer table (`:510-513`) that additionally records *what the dying pass had already done* — the
  column that makes the conservatism legible rather than asserted, because it is what shows the
  step-16 case already has its terminal row in the log. That is the column a PROPERTIES author needs
  to state the invariant ("a reclamation row is never the only trace of a pass that completed"), and
  it was not asked for.
- **Every conjunct I would use to falsify the new prose survived the edit.** I re-derived §4.2's
  outcome table as a total function over the six observable states (absent, `RELEASED:`,
  `IN-PROGRESS:` young, `IN-PROGRESS:` old, empty, neither-form) after the diff: all six still
  covered exactly once, the two free states still differing only in bookkeeping (`:481-483`), and the
  last row still decided toward reclamation with the wedge argument intact (`:495-498`). AT-M3
  (`:2118`) and AT-M11 (`:2119`) are byte-unchanged, and AT-M11 remains correctly shaped — its
  negative conjuncts ("**no** `reclaimed-stale-lock` and **no** `consolidation-in-progress`") are
  paired with the positive on the same path ("the marker is taken and the pass proceeds"), so it is
  not an absence-only oracle even though BR-13's new clause leans on it.
- **The `pending` channel is specified precisely enough to write the test today, including its one
  ugly arm.** The part of L-04 I cared about was not naming the binding — it was the empty-corpus
  case, where a verbatim execution exits at `:29-30` and leaves `pending` unbound, so a naive
  namespace read raises rather than returning a set. AT-P7 now states the expected reading ("`pending`
  is unbound and the hook's set is read as empty rather than as an error"), which is the difference
  between a test that is green and a test that is red for a reason that is not a defect. I re-ran the
  hook's line anchors at HEAD and all seven cited lines are exact, including the `:43` threshold
  comparison the row now cites correctly.
- **The header block declares the round honestly and the diff bears it out.** v11.4 (`:12-22`)
  enumerates five lettered items plus the Q-01 answer; every hunk in the diff maps to one of them.
  No new repo path, no new lexicon value, no new config key, no new AT, no new BR, no new §14.5
  register row — and I re-checked the set-equalities I have tracked since v10 (§8.1's cell-level
  rule, the §14.5 register, BR-33a's enumeration, AT-F19/F20/F21/Q7c, the AC→AT map at `:2345`) and
  none of them moved. The only register that changed content is BR-13, and it changed to agree with
  three others rather than to add a sixth position.

## Recommendation

## Verdict
