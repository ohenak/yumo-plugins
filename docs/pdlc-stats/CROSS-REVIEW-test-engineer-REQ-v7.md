# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.5, commit `af78b8c4e`)
**Date:** 2026-08-31
**Iteration:** 7
**Round type:** Delta re-review (prior: `CROSS-REVIEW-test-engineer-REQ-v6.md`, Needs revision)
**Delta under review:** `e33637af2..af78b8c4e` — six commits, v1.4 → v1.5

## 1. Delta scope

`git diff e33637af2 HEAD -- docs/pdlc-stats/REQ-pdlc-stats.md` touches seven regions, all of them
the ones my v6 findings named or their propagation sites: the metadata block and changelog note,
§2 G-3, §3 NG-6, REQ-STATS-02's harvested enumeration, REQ-STATS-05's zero rule, REQ-STATS-06's
rationale clause, §6 R-6 and §7 O-1. No acceptance criterion outside that set moved. I re-read the
changed regions in full and did not re-litigate the sections I approved in v5.

Because my v6 High rested on repository state rather than on document bytes, I re-ran the corpus
checks against HEAD rather than trusting either document. The results are in §2 and §3 — they are
the evidence for both the resolution and the one new finding.

## 2. Resolution of v6 findings

**F-01 (High) — resolved.** REQ-STATS-05 no longer reads absence as a clean run. The new rule
(`REQ-pdlc-stats.md:184-188`) states that where `LEARNINGS-{feature}.md` is present **and** no
`POSTMORTEM-{phase}-{feature}.md` file remains, halts report **harvested**, never `0`. Three things
make this the fix I asked for rather than a restatement:

- **The oracle is now positive on the same path.** The harvested state is asserted by a presence
  conjunct (LEARNINGS on disk) plus the absence of the post-mortem family, not by absence alone. It
  can fail: drop the LEARNINGS file from a harvested fixture and the expectation flips to `0`.
- **The pinned false green is gone.** I re-derived the archive that produced the v6 finding.
  `docs/completed/pdlc-advisory-tier/` has zero `POSTMORTEM-*` and one LEARNINGS, whose
  `Harvested from` row (`LEARNINGS-pdlc-advisory-tier.md:11`) names
  `POSTMORTEM-T-…` and `POSTMORTEM-PR-…` among "82 files, deleted by this harvest". Under v1.5 that
  archive reports **harvested**, not `0` halts. The fixture a test author would most naturally
  reach for now transcribes the right expected value.
- **A second archive I had not found is also caught.** `docs/completed/pdlc-consolidation-agent/`
  has zero post-mortems on disk, and its LEARNINGS enumerates
  `POSTMORTEM-{D,F,P,PR,R,T}-pdlc-consolidation-agent.md` at six files
  (`LEARNINGS-pdlc-consolidation-agent.md:35`) covering "**nine** halt episodes" (`:43`). Under v1.4
  this was a second silent zero-for-nine; under v1.5 it is harvested.

I also checked the case that would have broken the new rule — a *partial* post-mortem deletion,
where some survive and the metric would report a measured undercount rather than harvested. It does
not occur at HEAD. Across the thirteen archives, every feature with surviving post-mortems has a
file count matching what its LEARNINGS says it retained (advisory-wave-gate 2, engine-distribution 4,
headless-engine 4, learnings-injection 3, engineering-loop 2, plugin-retirement 3,
review-loop-hardening 1, wave-resume 1). The one apparent mismatch, `pdlc-workflow-distribution`,
whose LEARNINGS row says "all now deleted", still has `POSTMORTEM-R-pdlc-workflow-distribution.md`
on disk — so the metric measures 1, correctly, and the inaccuracy is in that LEARNINGS' prose, not
in this REQ. The measured branch is therefore safe over the whole corpus.

**F-01's companion — REQ-STATS-06's falsified rationale — resolved.** The "harvest deletes
cross-reviews and DoD reviews while post-mortems survive, so the numerator is only *partially*
deleted" clause is gone. `grep` over the document finds no residual occurrence outside the changelog
note that records its removal (`REQ-pdlc-stats.md:21`). What replaces it (`:201-202`) is the weaker
and true claim — "a family harvest deletes is gone from the numerator, so a computed value would
silently undercount rather than be absent" — plus an explicit refusal to quantify: "How much of the
numerator harvest removes is not asserted here." That is exactly the right altitude: the predicate
stands on its own without borrowing a premise the corpus contradicts.

**F-02 (Medium, G-3) — resolved.** G-3 (`:46-49`) now reads that a feature "whose directory cannot
be read is reported by name with the reason", "while absent or unparseable artifacts surface inside
their own metric's value, not as a feature-level label". I diffed that sentence against
REQ-STATS-07 (`:207-212`) clause by clause: unreadable directory → by-name with reason; readable but
empty → "not a gap but a normal row whose metrics report their zero states"; malformed stays a
within-metric state under REQ-STATS-03. The goal and the AC now say the same thing, so a test author
reading G-3 for orientation is no longer pointed at a gap row that REQ-STATS-07 will not produce.

**F-03 (Low, C-4 doc-type placeholder) — resolved.** REQ-STATS-06 now carries the clause I asked
for (`:203-204`): "The predicate is set-membership over C-4's grammars, so a grammatical basename
outside the driver's document-type catalogue is a survivor even where REQ-STATS-03 reports it
malformed." REQ-STATS-03 names the same family explicitly (`CROSS-REVIEW-{role}-REVIEW-v{N}.md`,
`:159-161`). The divergence is now deliberate and documented in both directions rather than latent.

**Bonus: NG-6 answers my Q-02 in the document.** `:74-76` now states that `LEARNINGS-{feature}.md`
"is only ever the discriminator separating harvested from a genuine zero — its `Harvested from` row
is never parsed to reconstruct a deleted count". That closes the parsing-surface question I raised
as an open choice, and it closes it the way I recommended. It also bounds the metric's own test
surface: no test may assert a recovered count.
