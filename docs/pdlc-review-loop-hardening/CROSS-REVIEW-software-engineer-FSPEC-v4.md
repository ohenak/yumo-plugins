# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/FSPEC-pdlc-review-loop-hardening.md` (v1.3)
**Date:** 2026-07-30
**Iteration:** 4
**Scope:** Delta re-review. Change surface is `git diff cc0d80e..HEAD` on the FSPEC (59 insertions, 17 deletions, 5 commits), i.e. §1.2 rule 5, §15.5's form-selection paragraph, §19 AT-19 / AT-62 / AT-65, and §21.4's DC-01 row. Each v3 finding verified against the normative text, not the changelog. New-defect scan restricted to the changed text and to the sites rule 5's widened predicate newly reaches (§16.2, §16.4, §15.5's heading walk, §12.2, §10.5). Bundle regexes re-measured against `pdlc/workflows/dist/*.bundle.js`.

## Disposition of v3 findings

| v3 ID | Sev | Status | Evidence |
|----|----|----|----|
| F-15 | Medium | **Resolved** | The clause is gone from the normative sentence. §19 AT-19 now reads "no **call or member reference** to `process` or `fetch` — asserted as `/\bprocess\s*\./` and `/\bfetch\s*\(/`, **not** as a substring search", with the retraction marked in place. The paragraph below no longer merely forbids the substring form: it now states the bare-identifier measurement explicitly — "`/\bprocess\b/`, `/\bfetch\b/` is red on the same two sites, the backticks and spaces around them supplying the word boundary; AT-19 specifies no comment- or string-stripping step, so it has no way to exempt them". That is the measurement I made independently and it is stated correctly. `grep -n "bare-identifier"` over the document returns only the changelog and this retraction; no other site re-admits the form. The surviving two regexes are the only forms green on the current, correct artifacts. |
| F-16 | Low | **Resolved** | §21.4's DC-01 row now reads "§10.1's tier-1 anchor **selection** is likewise total over the candidate round's **per-role** files". It matches §10.1's v1.2 wording verbatim in the load-bearing noun; the two sites no longer disagree about the domain the totality claim covers. |
| F-17 | Low | **Resolved**, and at the higher severity the peer review assigned it | The scope clause is **struck**, not reconciled: rule 5's predicate is now "Every mechanical scan this feature specifies over a markdown artifact it reads", and the enumeration names the four sites that were outside the old predicate — "the hash read at either tier (§10.1, §10.5)", "the completeness heading scan (§16, **all four classes**)", "the heading walk that feeds the resume prompt (§15.5)", and "the `RESOLVED:` scan (§12.2)". Both halves of what I asked for landed (widen the predicate, drop "tier-1"), and the predicate is now strictly broader than the enumeration, which is the safe direction — a site the enumeration forgets is still covered. AT-62 carries the spec-class falsifier. I checked the widened predicate for over-reach against the one scan where fenced exclusion would be *wrong*: §7's digest. It is unaffected — §7.3 defines the digest over "the bytes as read, with exactly two normalisations and no others" and closes the list, so no reader can pull rule 5 into it. The residue is not the predicate but what "ignores every line" now does to §16.2's *body* test — see F-18. |
| Q-01 | — | Not addressed, correctly | E-66's mechanism clause; still not a finding, still not restated. |

TE-v3 F-02's matching-closer definition and F-03's code-review class both landed in text I re-read: rule 5's closer rule ("same fence character … at least as long; every other fence line is content") is total and correctly makes AT-65's four-backtick wrapper non-closable by the template's own three-backtick lines, and §15.5's form-selection paragraph now names the code-review class, which §15.5's own per-class mapping table and §16.4 already carried — the rows are completed, not invented.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-18 | Medium | Local | **Widening rule 5 to §16 leaves it ambiguous whether a fenced block counts as a section *body*, and the reading the enumeration invites turns a correctly-authored spec section into a false non-terminal.** Rule 5's operative clause is unqualified — "**ignores every line inside a fenced code block**: scanning skips from a line whose first non-whitespace characters are a fence opener … to the matching closer". §16.2's criterion is two conjuncts read in one pass: every top-level heading is present (`T`), **and** each has "a **non-empty body** — at least one non-blank, non-heading **line** between it and the next `##` heading (or EOF)" (`S`). A body consisting only of a fenced block therefore contains no line the scan can see, and the section scores **empty**. The consequence is not benign fail-closed: the artifact is never terminal, §15.5's heading walk names that already-written section as "the first unwritten section", the agent re-dispatched onto it changes no bytes, §15.3's byte-change predicate scores no progress, and §15.4/§15.6 **halt the phase** on a complete document — the exact false-halt class §16.1 and §16.3 each removed a clause to eliminate ("the wrapper would re-dispatch to `MAX_AUTHORING_DISPATCHES` and then halt the phase over a review the reviewer genuinely finished"). The population is real: a TSPEC `## Interfaces` whose body is one signature block, a PLAN `## Verification` that is one command block, a PROPERTIES `## Fixtures` that is one fixture block, a LEARNINGS numbered section that is one snippet (§16.5 imports §16.2's body rule). The other reading — that rule 5 governs only which lines may **match** a scanned pattern (a `##`, a `VERDICT: `, an `APPROVAL-HASH: `, a `RESOLVED: `), leaving fenced content as body — is the one rule 5's own rationale paragraph argues for, and is correct; but nothing in the text says so, and the enumeration entry reads "the completeness heading scan (§16, **all four classes**)", which cannot mean headings only since §16.3–§16.5 have no heading scan — so it names §16's whole criterion, body conjunct included. Two defensible implementations, materially different outcomes (terminal vs. phase halt), no clause to choose between them. **This is a one-clause fix and needs no design work.** Either (a) add to rule 5: "the exclusion governs which lines may *match* a scanned pattern; it does not remove content from §16.2's non-empty-body test — a section whose body is a fenced block has a non-empty body", or (b) put the same sentence in §16.2's body-rule row. Option (a) keeps the rule stated once. AT-62 should gain the matching falsifier: it currently pins only the `T` direction ("a fenced `## …` leaves `T` unchanged") — the `S` direction (a section whose body is only a fenced block scores **satisfied**, so the artifact reaches terminal) is the half that is unasserted, and its absence is why the ambiguity survived the edit. | §1.2 rule 5, cf. §16.2, §16.5, §15.5, §19 AT-62 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Rule 5's closer test is "same fence character, at least as long", with no clause about an **info string** on the closing line. CommonMark says a closing fence may not carry one, so ` ```js ` inside a three-backtick block is content to a renderer but a closer to rule 5 — the block ends early and the lines after it are re-exposed to the scan. The nested-quote population AT-65 pins is unaffected (the wrapper is longer than anything it contains), and the rule as written is total and deterministic, which is what an implementer needs. I am **not** raising it: the FSPEC nowhere claims renderer equivalence, and adding an info-string clause is a second mechanism for a case the pinned quoting convention already avoids. Recording it only so a later reviewer does not re-derive it. |

## Positive Observations

- **F-17 was fixed by deleting the scope clause, and the peer's F-01 was fixed by the same deletion.** One edit, one rule, no exception and no second rule — and the predicate now errs *wider* than its own enumeration, so the next scan this feature adds inherits the exclusion without an author remembering to list it. That is the inversion I asked for.
- **F-15's retraction paragraph now carries the measurement, not just the prohibition.** v1.2 forbade the substring form and stated why; v1.3 adds the bare-identifier measurement and the reason no implementation can rescue it (no comment- or string-stripping step is specified). The next person who reaches for `/\bprocess\b/` is stopped by the document rather than by a red CI run.
- **The closer definition is the right amount of specification.** "Same character, at least as long, every other fence line is content" is total, is three clauses, and makes AT-65's fixture falsifiable against a naive "next fence line closes it" implementation. It resists the temptation to import CommonMark wholesale into a spec whose scanner does not need it.
- **AT-62 gained a falsifier rather than an assertion.** "Without it a quoted heading inflates `T` and the episode never reaches terminal" states the failure the test exists to catch. F-18 is that the symmetric statement for `S` was not written — the form of the fix is right, its coverage is half.
- **Four of five fixes are deletions or one-liners on a 259 KB document at round 4.** Net growth +1.5%, and no REQ-altitude or SKILL-template surface was widened to absorb a review finding.

## Recommendation

**Needs revision**

One Medium is open, and it closes with one sentence plus one falsifier clause: **F-18** — say in §1.2 rule 5 that the exclusion governs which lines may *match* a scanned pattern and does not empty a section body, and extend AT-62 to assert the `S` direction. Nothing else in the change surface is open: F-15, F-16 and F-17 are all resolved in the normative text, and I have no open High finding anywhere in the document.

F-18 is a consequence of the F-17 fix, not a defect the F-17 fix failed to make — widening rule 5 to §16 was correct, and the body conjunct is the one site where "ignores every line" needed a boundary. I would not hold the document for anything else.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 0}
