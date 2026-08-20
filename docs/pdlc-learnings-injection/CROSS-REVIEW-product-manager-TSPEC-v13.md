# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 13 (delta confirmation)
**Round type:** Delta confirmation — previously approved, targeted erratum edit
**Erratum commit:** `4e16392d` (heading), substance in `e6b58df5`
**Upstream at dispatch:** REQ `ff605dd3…` (v0.9), FSPEC `ae75fa62…` (v0.13) — both re-verified at HEAD

## Overview

**Question asked:** does the erratum delta resolve the two routed items without breaking what I
previously approved — and, per DEC-ERR-03, is this TSPEC still a faithful compression of its
upstream *at HEAD*, whether or not the discrepancy appears in the routed list?

**Answer: yes on both, with no findings.**

The two routed items were the same defect seen from two lenses. I raised that §D.3 discharged only
F-O-1's document-shape half, leaving `extractInjectableMaterial`'s recognition rule for BR-6's five
priority headings — the numeric `## N.` prefix and the `(with rationale)` gloss — unspecified.
te-author raised that the section matcher was specified nowhere. Both are now closed: §D.3 carries
`BR6_SECTION_NAMES`, `SECTION_HEADING_RE`, `GLOSS_RE`, three numbered matching rules, a section-extent
rule, and a duplicates/absences rule.

**On the shape of the delta.** The commit named in this dispatch (`4e16392d`) is a one-line heading
rename — `### D.3 The document-shape predicate` becomes `### D.3 The two heading-recognition rules
*(discharges F-O-1, both halves)*`. Taken alone that would be cosmetic, and a heading that claims
"both halves" over a body carrying one would be a worse state than before. It is not alone: the
substance landed in `e6b58df5` earlier in the same erratum round, and the rename is the last step
that makes the section's title honest about what its body now holds. I verified the body directly
rather than inferring it from the commit message.

**Upstream re-verification (DEC-ERR-03).** I re-hashed both upstream documents at HEAD; both match
the dispatch digests byte-for-byte, so no upstream drift could have occurred since dispatch. I then
re-read the upstream passages this section newly leans on — F-O-1's obligation row, BR-6's priority
table, and BR-6's delegation sentence — rather than trusting the TSPEC's paraphrase of them.

## Architecture

**Where the obligation now sits, and whether that placement is coherent.**

F-O-1 is an obligation FSPEC delegates *to TSPEC*. The product question is not which file the
regex lives in — that is se-review's lens — but whether the document records the obligation as
discharged in the same place it actually discharges it, so a reader tracing FSPEC → TSPEC lands on
the answer rather than a pointer.

Before this round the document was incoherent on exactly that point: §D.3's heading claimed the
discharge, the obligations table (§ obligations, F-O-1 row) claimed the discharge, and only one of
the two rules was written down. The delta closes the triangle:

| Locus | State at HEAD |
|---|---|
| §D.3 heading | Names *both* halves explicitly — `*(discharges F-O-1, both halves)*` |
| §D.3 body | Rule 1: `looksLikeLearningsDocument` / `LEARNINGS_HEADING_RE`. Rule 2: `BR6_SECTION_NAMES` + `SECTION_HEADING_RE` + `GLOSS_RE`, three matching rules, extent, duplicates |
| Obligations table F-O-1 row | "**both** heading-recognition rules (FSPEC v0.13) … §D.3 — the predicate (`LEARNINGS_HEADING_RE`) and the section matcher (`BR6_SECTION_NAMES`, optional ordinal, optional gloss, otherwise exact)" |
| §I.3 `extractInjectableMaterial` JSDoc | Points at the rule (`optional N. ordinal (discarded — priority comes from BR6_SECTION_NAMES's index, never from …)`) without restating it |
| v0.8 erratum note (header) | Records item (3) as landed, naming what §D.3 gained |

I checked the last row specifically for the failure mode this document has hit before: two loci
each stating a rule, drifting apart. §I.3 does **not** restate the matcher — it cites §D.3's
decision and carries only the contract (`sections` are canonical names, not literal heading text).
One normative statement, one pointer. That is the right shape.

**Scope of the delta.** Nothing outside §D.3's heading changed in `4e16392d`, and the substantive
commit touched §D.3 only. I re-read §D.4 (the ordering key) and §D.5 immediately downstream of the
edit to confirm the new section-extent rule did not silently move a boundary they depend on; it did
not — §D.4 keys off the harvest metadata table, which is not a BR-6 section, and §D.5's
`RSN-NO-MATERIAL` path consumes `sections: []`, which the new rule produces rather than redefines.

No previously approved material was weakened, narrowed, or reinterpreted by this delta.

## Interfaces

**Fidelity of the new rule to FSPEC F-O-1 — the delegation actually asked.**

FSPEC F-O-1 at HEAD (line 1009) states the obligation as two rules "on the same terms", the second
being *"the rule by which a heading counts as one of BR-6's named sections — whether the numbered
form, the bare title or a prefix of it is matched"*, bounded by two constraints: each consults only
the document's bytes, and each is decidable without a model call. BR-6 reinforces the delegation:
*"Which heading forms count as which section is F-O-1's, not text to be matched literally from
here."*

Upstream therefore poses a three-way question and hands TSPEC the decision. §D.3 answers all three
explicitly, which is what a discharge requires:

| F-O-1's enumerated form | §D.3's decision | Grounding given |
|---|---|---|
| Numbered form (`## 2. Cross-Feature Patterns`) | **Matched.** Ordinal optional, stripped, and carries no meaning | Measured: 9/9 corpus documents write it |
| Bare title (`## Cross-Feature Patterns`) | **Matched.** Same section as the numbered form | Defensive tolerance, declared not measured |
| A *prefix* of the title | **Not matched.** Exact, case-sensitive comparison — no prefix, substring, or case folding | Forced by FSPEC E-33 |

The prefix rejection is the one that could have been a divergence, so I checked it against the
requirement rather than accepting the rationale. It holds, and the reasoning is upstream's own:
E-33's document (`regime-ledger`'s `LEARNINGS-postgres-audit-repository.md`, carrying
`## Cross-Feature Findings` and `## Process Findings`) is FSPEC's one measured `RSN-NO-MATERIAL`
document. Under a prefix rule `Cross-Feature Findings` would match `Cross-Feature Patterns`, that
document would contribute material, and E-33 together with AT-28 would be unreachable by
construction. Choosing "no prefix match" is the only choice that keeps upstream's measured example
reachable. §D.3 states exactly this argument. That is a decision traceable to a requirement, not an
engineering preference.

**Both F-O-1 bounds are preserved.** The matcher is three frozen strings and two regexes over the
document's own bytes — no model call, no external state. §D.3 says so for rule 1; rule 2 inherits
it visibly from its own construction.

**Priority order — the product-critical detail.** BR-6's table ranks Cross-Feature Patterns 1 and
Non-Convergences 2, with a stated product rationale (Cross-Feature Patterns is "where an author is
already generalising beyond their own feature"). `BR6_SECTION_NAMES` transcribes BR-6's five names
in BR-6's order, and §D.3 states that priority comes from the array index "and from nowhere else".
It then names the trap directly: the corpus numbers these sections `1. Non-Convergences`,
`2. Cross-Feature Patterns` — the *inverse* of BR-6's ranking for the top two — so reading priority
off the heading ordinal "would invert the first two sections of every document in the corpus". I
verified this against all 9 documents; the inversion is real in every one. Naming it is what
protects BR-6's product intent from a plausible implementation shortcut.

## Data Model

**`BR6_SECTION_NAMES` diffed against BR-6's table, name by name.** Contract-fidelity checks are
mechanical, so I ran this one literally rather than reading for sense:

| Priority | FSPEC BR-6 table | TSPEC `BR6_SECTION_NAMES` | Match |
|---|---|---|---|
| 1 | Cross-Feature Patterns | `"Cross-Feature Patterns"` | exact |
| 2 | Non-Convergences | `"Non-Convergences"` | exact |
| 3 | Rejected Proposals (with rationale) | `"Rejected Proposals (with rationale)"` | exact, gloss included |
| 4 | Process Learnings | `"Process Learnings"` | exact |
| 5 | Open Items for Consolidation | `"Open Items for Consolidation"` | exact |
| — | Approval Record — **never** injected | absent from the array | correct by construction |

Five for five, in order, with the array's index carrying the priority. No sixth value, no internal
variant, no renaming.

**Approval Record's exclusion is structural, not a branch.** BR-6 marks it "**never**" injected,
and FSPEC gives a product reason: it is per-run verdict bookkeeping, and keeping approval
vocabulary out of an authoring prompt reinforces BR-11's boundary. §D.3 achieves it by omission —
`Approval Record` is not in `BR6_SECTION_NAMES`, "so is never matched, never taken, and needs no
exclusion branch". A never-injected requirement enforced by absence from the allow-list cannot be
defeated by a missed conditional. This is the stronger discharge of BR-6's `never`.

**The `## 6.` deviation is handled without a special case.** §D.3 cites
`docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md`, whose sixth section is
`## 6. Phase PUB Retroactive Cross-Review (2026-06-24)` rather than `Approval Record`. I confirmed
that heading exists verbatim. Under the allow-list rule it is simply not one of the five. The same
mechanism that excludes Approval Record excludes an unanticipated sixth section — so a corpus
document deviating from the harvest skill's format degrades safely instead of leaking bookkeeping
into an authoring prompt.

**Corpus claims re-measured.** Every empirical assertion §D.3 makes, I ran rather than trusted:

- The §I.1 predicate — `git ls-files --cached --others --exclude-standard --
  ':(glob)docs/*/LEARNINGS-*.md' ':(glob)docs/completed/*/LEARNINGS-*.md'` — returns exactly **9**
  paths at HEAD, matching P-5 and every "9 corpus documents" claim in the section. A naive
  `docs/**` sweep returns 11; the two extra sit under `docs/discarded/`, which the `:(glob)`
  semantics exclude because `*` does not cross `/`. The count is right for the stated reason.
- All 9 write the numbered form, with ordinals running `1. Non-Convergences`,
  `2. Cross-Feature Patterns`, `3. Rejected Proposals (with rationale)`, `4. Process Learnings`,
  `5. Open Items for Consolidation` — confirming both the "every one writes the numbered form"
  claim and the priority-inversion warning.
- All 9 write the **glossed** `Rejected Proposals (with rationale)`, which is precisely why §D.3
  declares the un-glossed tolerance *not measured*. That provenance label is accurate.

The document distinguishes measured from defensive claims correctly throughout the new material —
the discipline ERR-5 was raised to enforce, applied here without being asked.

## Test Strategy

## Open Questions

## Positive Observations

## Delta-Confirmation Findings

## Verdict
