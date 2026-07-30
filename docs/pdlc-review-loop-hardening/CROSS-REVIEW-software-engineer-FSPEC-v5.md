# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/FSPEC-pdlc-review-loop-hardening.md` (v1.4)
**Date:** 2026-07-30
**Iteration:** 5 (final round of a 5-round cap)
**Scope:** Delta re-review. Change surface is `git diff 719b10b..HEAD` on the FSPEC — 19 insertions, 4 deletions across two normative sites (§1.2 rule 5's new governing clause; AT-62's third leg) plus the v1.4 changelog entry, version cell and lineage row. F-18 verified against the normative text, not the changelog. New-defect scan restricted to the two changed sites and to the clauses they newly govern: §16.2's body rule and its placeholder row, §16.4's two markers, §16.5's import of §16.2's body rule, §15.5's heading walk. Nothing else re-litigated — F-15, F-16, F-17 were confirmed Resolved at v4.

## Disposition of v4 findings

| v4 ID | Sev | Status | Evidence |
|----|----|----|----|
| F-18 | Medium | **Resolved** | Both halves landed, in the form option (a) asked for — one clause in the single place the rule is stated, no per-site exception. §1.2 rule 5 now closes: "The exclusion governs which lines may **match a scanned pattern** — a `##` heading, a `VERDICT: `, `APPROVAL-HASH: ` or `RESOLVED: ` line; it does **not** empty a section's body for §16.2's non-empty-body test, where a fenced block **is** body content". That picks the reading rule 5's own rationale paragraph argued for and closes the two-implementations gap: a `## Interfaces` whose body is one signature block now has a non-empty body, scores toward `S`, `S` reaches `T`, the artifact is terminal, and the §15.5 → §15.3 → §15.6 false-halt chain I traced at v4 is cut at its first link. I checked the two sites that consume the body rule by reference rather than restating it — §15.5's heading walk ("return the first whose body does not satisfy **§16's criterion**", line 2178) and §16.5 ("§16.2's body rule applies", line 2424) — and both inherit the fix automatically, so there is no second, unfixed copy of the body test anywhere in the document. AT-62 gained the symmetric `S` conjunct with a real falsifier ("fails for a strip-then-scan body test — under which `S < T` forever and §15.6 halts the phase on a correct document"), which is the direction whose absence let the ambiguity survive the v1.3 edit. The `T` leg is untouched, so the test now pins both directions of the exclusion from one fixture family. |
| Q-01 | — | Still recorded, still not raised | Rule 5's closer test still has no info-string clause. Unchanged, and my v4 reasoning for not raising it stands. |

The v1.4 changelog names the defect as "a **regression introduced by v1.3's own widening**", which is the correct attribution and matches my v4 note that F-18 was a consequence of the F-17 fix rather than a failure of it. No REQ-altitude clause and no SKILL-template surface was widened to absorb it; normative growth is two sentences.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-19 | Low | Local | The new clause's list of governed patterns — "a `##` heading, a `VERDICT: `, `APPROVAL-HASH: ` or `RESOLVED: ` line" — omits §16.4's **`Scope:` field**, which is a mechanical scan over a markdown artifact and is named in rule 5's own site enumeration via "the completeness heading scan (§16, **all four classes**)". The governing sentence remains total ("**Every** mechanical scan this feature specifies over a markdown artifact it reads … ignores every line inside a fenced code block"), and the new list is appositive after an em dash, so a careful implementer excludes fenced `Scope:` lines correctly. But an implementer reading the appositive as the exhaustive set of governed patterns would let a `CODE_REVIEW-*` that quotes its own template inside a fence score terminal on the quote — precisely the false-terminal class rule 5 was written to prevent for `VERDICT: `. Fix is one token: add `` `Scope: ` `` to the list, or close it with "…, or any other line a §16 criterion matches". Not blocking: the total predicate governs, and this is a wording risk rather than a contradiction. | §1.2 rule 5, cf. §16.4 |
| F-20 | Low | Local | Interaction between the new clause and §16.2's **placeholder row** is unstated in one direction. §16.2: "A body consisting only of `TBD`, `TODO`, `_TBD_`, or an HTML comment counts as **empty**." A body that is a fenced block **containing** only `TBD` now reads as non-empty under the new clause (the fence lines are body content), so a skeleton written with fenced placeholders would score complete on write 1 — the outcome E-60 and AT-62's first leg exist to prevent. This is fail-**open** (premature terminal), not the fail-closed halt F-18 caused, its trigger population is small (agents write bare `TBD`, not fenced `TBD`), and §16.2 already declares the criterion "deliberately shallow … §15.4's counters, not this test, are what bound a badly behaved episode". Recording it so a later reviewer does not re-derive it; if it is ever cheap to close, the placeholder row can say "after fence markers are disregarded". | §16.2 placeholder row, cf. §1.2 rule 5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-62's third leg opens "*And given* all required headings present and one body that is **only** a fenced block", where the second leg opened "*And given* **the same fixture** with…". The dropped "same fixture" is what makes the third leg a fresh, otherwise-complete artifact rather than the placeholder skeleton of leg 1 — which it must be, since the assertion is "scores **structurally complete**" and a `TBD` body can never reach that. The assertion therefore forces the fixture and no implementer can build the wrong one, so this is not a finding. Noting it only because the TE lane owns fixture precision and may want the two words back. |

## Positive Observations

- **The fix is one clause at the one site the rule is stated, and nothing else moved.** Rule 5 already promised "This is stated once, here, and referenced rather than restated" — the fix honours that promise instead of eroding it. The two consumers of the body test (§15.5's walk, §16.5) reference §16 rather than restating it, so they inherited the correction with zero edits. That is the payoff of the referencing discipline, observable on the very next round.
- **AT-62 now pins both directions of the exclusion from one fixture family.** `T` unchanged by a fenced heading; `S` incremented by a fenced-only body. Together they falsify both the naive "scan everything" implementation and the naive "strip fences then scan" implementation — which are exactly the two implementations a reader could have derived from v1.3's text. The test surface now discriminates between them, which is what stops this class of ambiguity recurring silently.
- **The changelog names the defect as a regression of the previous round's own fix.** That is a harder and more useful sentence to write than "addresses SE-v4 F-18", and it is accurate: widening rule 5 to §16 was right, and the body conjunct was the one boundary the widening needed.
- **Trajectory and cost.** 15 → 6 → 2 → 1 → 0 blocking findings; no High since iteration 2. Round 5's normative surface is two sentences on a 260 KB document (+0.33% normative, +0.57% total), and no REQ-altitude clause, catalogue, or SKILL template was widened to absorb a review finding at any round. The document ends the loop tighter than it entered it.

## Recommendation

**Approved**

F-18, the sole open finding from v4, is resolved in the normative text and pinned by a falsifiable acceptance test. I have no open High or Medium finding anywhere in the document. F-19 and F-20 are Lows recorded for the record — each is a one-token wording improvement, neither contradicts a normative clause, and neither warrants holding the document. Both are appropriate to fold into TSPEC authoring or a later editorial pass rather than another FSPEC round.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 2}
