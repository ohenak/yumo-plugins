# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-review-loop-hardening/FSPEC-pdlc-review-loop-hardening.md (v1.4)
**Date:** 2026-07-30
**Iteration:** 5 (final round of a loop capped at 5)

**Scope:** Delta re-review, testing/verifiability lens. Change surface is
`git diff 719b10b..HEAD -- docs/pdlc-review-loop-hardening/FSPEC-pdlc-review-loop-hardening.md`
— 19 insertions / 4 deletions across two normative sites (§1.2 rule 5's closing clause; AT-62's third
conjunct) plus the v1.4 changelog entry and the lineage row. TE-v4 F-01 verified against the **normative
text**, not the changelog. New defects sought only in the two changed sites and in the sections whose
meaning they alter (§16.2, §16.5, §15.5, §15.3, §16.4). Nothing passed at v1–v4 is re-litigated. Per
post-mortem lesson R-6, no citation-drift nit is raised at any severity.

## Disposition of iteration-4 findings

| Prior | Severity at v4 | Disposition | Evidence in the normative text |
|---|---|---|---|
| F-01 — rule 5's unqualified "ignores every line" did not say whether a fenced block is *body* content for §16.2's second conjunct, so a section whose body is only a code block scores empty forever; §15.5's resume prompt then names an already-written section, the agent correctly writes nothing, §15.3's byte-change predicate scores no progress, and the phase halts on a correct document under a stall label | Medium | **Resolved** | Both halves of the fix landed, in the two places I specified. **(i) The clause.** §1.2 rule 5 now closes with "The exclusion governs which lines may **match a scanned pattern** — a `##` heading, a `VERDICT: `, `APPROVAL-HASH: ` or `RESOLVED: ` line; it does **not** empty a section's body for §16.2's non-empty-body test, where a fenced block **is** body content". That is the boundary the rule lacked: it separates *what a line may be read as* from *whether a line exists*, which is exactly the distinction the two competing implementations turned on. The strip-then-scan implementation is now non-conforming by the text, not merely disfavoured by tone. **(ii) The oracle.** AT-62 gained the `S` direction: "*And given* all required headings present and one body that is **only** a fenced block (`## Interfaces`, one signature block). *Then* that body is **non-empty**, counts toward `S`, and the artifact scores **structurally complete**", with the falsifier named in place — "fails for a strip-then-scan body test — under which `S < T` forever and §15.6 halts the phase on a correct document." |

**Is AT-62 a real oracle in both directions?** Yes, and the two directions are consistent rather than
merely adjacent — which is the thing worth checking, because a fenced `## …` line has to be *both*
not-a-heading and body-content simultaneously, and a spec can easily state one and contradict the other.
Conjunct 2 (v1.3) asserts `T` is **unchanged** by a fenced `## …` line: it does not match the heading
pattern, so it opens no section. Conjunct 3 (v1.4) asserts a fenced-only body is **non-empty**: §16.2's
body rule counts "non-blank, non-heading" lines, and a fenced `## …` line is precisely a non-blank
non-heading line under conjunct 2's own reading. The same fixture therefore satisfies both conjuncts
under one implementation, and no implementation satisfies both under strip-then-scan (it fails 3) or
under no-exclusion (it fails 2). Two conjuncts that jointly admit exactly one implementation is what I
mean by a real oracle in both directions.

Each conjunct also carries its own distinct falsifier, and the falsifiers are not the same test: conjunct
2 reds on the no-exclusion implementation with an inflated `T`; conjunct 3 reds on the strip-then-scan
implementation with a deflated `S`. A test writer building conjunct 3 needs the other bodies to carry
prose — the fixture does not say so in words, but the asserted terminal state ("scores **structurally
complete**") pins it definitionally, so the fixture is derivable without asking the author. That is the
bar I apply, and it is met.

**Is the §15.5 / §15.3 aggravating path actually closed, or only described?** Closed, and closed at the
single point that matters rather than patched at each symptom. I traced it forward rather than trusting
the changelog:

1. §15.5's heading walk returns "the **first** whose body does not satisfy §16's criterion for that
   artifact class" — it does not carry its own body test, it defers to §16.2's. The clause governs
   §16.2, so the walk no longer returns a fenced-only section, and the resume prompt no longer names a
   written section. The v4 path dies at step 1.
2. §15.5's greenfield form-selection table selects **Resume** on "at least one section not satisfying
   §16's criterion" — same deferral, same fix, so a complete document is no longer even classified as
   partial.
3. §16.5 imports §16.2's body rule verbatim for LEARNINGS' five numbered sections ("§16.2's body rule
   applies"), so the LEARNINGS class inherits the fix with no separate clause — the fifth exposed class
   is covered by the same eleven words.
4. §15.3 was never touched and did not need to be: it is a mode-independent byte-change predicate, and
   §16.1 explicitly forbids §16 from redefining it. The no-progress misattribution was downstream of the
   resume prompt naming a written section; with that gone, the counter is back to firing only on "no
   bytes at all". This is the right shape — the fix is at the cause, not at the counter.

The v4 fix is therefore **one clause reaching five consumers through their existing references**, with no
per-site exception added anywhere. §16.2, §16.4, §16.5, §15.5 and §12.2 carry no new text at v1.4. That
is the same discipline v1.3 showed and it is why this round's change is auditable end to end.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **Low** | Local | The new clause's pattern list — "a `##` heading, a `VERDICT: `, `APPROVAL-HASH: ` or `RESOLVED: ` line" — omits §16.4's two code-review markers (`Scope:` and the findings section), which are scanned lines under a site rule 5 explicitly enumerates ("the completeness heading scan (**§16, all four classes**)"). Read as illustrative apposition, this is harmless. Read as a closed catalogue — and §1.2 rule 3 in the same list is itself about closed catalogues, so a reader is primed for that reading — a fenced `Scope:` line would fall outside "governed patterns" and could satisfy §16.4 from inside a quoted template, making a stall-killed code review terminal: the fail-open direction rule 5 exists to prevent. **Why this is a Low and not a repeat of v4's Medium:** the text *decides* it. Rule 5's governing sentence still names §16 all four classes and still says "ignores every line inside a fenced code block"; the new clause is grammatically a statement about the exclusion's *nature* (matching, not deletion), not a re-derivation of its site list, and nothing in it purports to narrow that list. At v4 two readings existed with no clause choosing between them; here one reading is supported by the normative sentence and the other requires overriding it with an apposition. That is a wording tightening, not an undecided behaviour. **Suggested (non-blocking) fix:** append `, a Scope: line` to the list, or replace the list with "any pattern named at a site above". | §1.2 rule 5, §16.4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §16.2's placeholder rule ("a body consisting only of `TBD`, `TODO`, `_TBD_`, or an HTML comment counts as **empty**") is now composed with "a fenced block **is** body content". A body that is a fenced block whose sole content is `TBD` therefore scores non-empty. I do not raise this as a finding — no agent wraps a placeholder in a code fence, the shape appears nowhere in the 44 artifacts under `docs/*/`, and adding a fence-aware placeholder test would re-introduce exactly the strip-then-scan coupling v1.4 just removed. Recording it so the TSPEC/PROPERTIES author decides it deliberately rather than discovering it: if the placeholder test is implemented as a trimmed-body string comparison it will behave this way by construction, which is the acceptable answer. |

## Positive Observations

- **The fix is at the definition, not at the symptoms.** Five consumers (§16.2's own test, §16.5's
  imported body rule, §15.5's heading walk, §15.5's form-selection table, and through them §15.3's
  reporting sub-cases) changed behaviour without a single one of them gaining a line of text. A fix that
  propagates through existing references is one a later reviewer can audit in one paragraph; a fix
  replicated at five sites is five paragraphs that can drift apart.
- **The clause distinguishes reading from deleting**, which is the conceptual error the whole finding
  rested on. "Ignores every line" conflated "this line cannot be a heading" with "this line does not
  exist". Splitting those is what makes the rule composable with *any* future scan site, not just the six
  enumerated ones — the next site to be added inherits a rule that already knows the difference.
- **AT-62's third conjunct names its falsifier in implementation terms** ("fails for a strip-then-scan
  body test"), not in outcome terms. That names the *specific wrong implementation* the finding
  identified, so an implementer reading only the AT knows which design is excluded. All three conjuncts
  of AT-62 now follow that pattern; so does AT-65. This is the falsifier-first habit I praised at v4,
  sustained under time pressure in the last round, which is when it is usually dropped.
- **The changelog calls the defect a regression of v1.3's own widening** rather than a newly discovered
  gap. That is the accurate description — the shape was not reachable before v1.3 pulled §16 under rule 5
  — and a changelog that owns the provenance of its own defects is a better artifact for the harvest
  phase to read than one that presents every fix as an improvement.

## Recommendation

**Approved**

TE-v4 F-01 is resolved, in the normative text, in both parts I specified: the clause bounds the exclusion
to pattern-matching, and AT-62 now falsifies the halting implementation as well as the inflating one. I
checked the aggravating path forward rather than accepting the changelog's account of it, and it is closed
at its cause — §15.5's two predicates defer to §16.2's body test, §16.5 imports it, and §15.3 was
correctly left untouched. Nothing I passed at v1–v4 regressed; the change surface is 23 lines and I found
nothing else in it.

One Low (F-01, the pattern list omitting §16.4's `Scope:`) and one recorded question (Q-01, fenced
placeholder bodies). Under the skill's three-value vocabulary this is **Approved with minor changes**;
under this loop's two-value verdict contract it is **Approved**, since neither item is a High or a Medium
and neither blocks the TSPEC.

I want to be as explicit about approving as I was at v4 about not approving, because this is the final
round and an approval given to close a loop is worth nothing. At v4 I revised a finding **up** from Low to
Medium on re-examination and said so. Applying the same standard in the other direction: F-01 here is a
Low because the normative sentence decides the behaviour and the ambiguity is in an illustrative
apposition — the v4 Medium existed precisely because *no* sentence decided it and two implementations were
both conforming. That is a difference in kind, not a difference in mood. If the pattern list were the only
statement of the exclusion's scope I would call it Medium and say so plainly.

Trajectory across the loop: **15 → 6 → 2 → 1 → 0** blocking findings; no High since iteration 2. The
document is testable: every mechanical scan it specifies has a stated site list, a total parser, and at
least one AT with a named falsifier.

**Findings: 0 High, 0 Medium, 1 Low.**

VERDICT: Approved
