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

## 3. New finding: `harvested` cannot distinguish deleted from never-produced

This is the mirror of the v6 High, and it is introduced by this round's edit, so I am filing it as
delta. It is **Medium, not High**, and I want to be explicit about why before stating it: the new
rule errs toward *not-available*, never toward a wrong number. There is no false green, the oracle
is positive and falsifiable, and a test author can derive an unambiguous expected value from the AC.
It does not block.

The defect is that REQ-STATS-05's harvested predicate — LEARNINGS present **and** post-mortem family
absent — is satisfied both by "harvest deleted them" and by "none was ever written". Two real
archives sit in the second case and will now be reported as harvested when the truth is a measured
zero, and each says so in its own words:

- `docs/completed/pdlc-merge-phase/` — zero post-mortems, LEARNINGS present. Its metadata row states
  `| POSTMORTEMs | none — no review loop reached MAX_REVIEW_ROUNDS |`
  (`LEARNINGS-pdlc-merge-phase.md:12`), and §1 repeats it: "No loop exhausted its round budget and no
  POSTMORTEM was written" (`:16`). Its `Harvested from` row (`:10`) enumerates 32 deleted files and
  names no `POSTMORTEM-*` among them.
- `docs/completed/pdlc-loop-economics/` — zero post-mortems, LEARNINGS present.
  `LEARNINGS-pdlc-loop-economics.md:16`: "No review loop exhausted its round budget and no
  `POSTMORTEM-*` file exists for this feature".

Both are genuine zeros. Both now report `harvested`. The reason the plain-`0` branch does not rescue
them is that it is keyed on *no LEARNINGS*, and a harvested archive always has one — so over
`docs/completed/` the plain-`0` branch is unreachable by construction. It is not dead overall: I
checked the active side, where twelve feature directories under `docs/` (including `pdlc-stats`
itself) have no LEARNINGS and no post-mortems and will correctly report `0`. So the branch is
reachable and testable, just never from the archive.

Why this matters to the testing lens rather than only to prose accuracy:

1. **It costs R-6 its evidence.** R-6 (`:260-262`) exists to protect baselines taken over
   `docs/completed/`. Under v1.5 the halts metric is not-measured for four of the thirteen archives,
   and for two of those the true value is known to be zero. A baseline consumer cannot tell the
   "we lost this" cases (advisory-tier, consolidation-agent — nine real halt episodes) from the
   "there was nothing to lose" cases (merge-phase, loop-economics). The metric is safe but less
   informative than the corpus permits.
2. **The same shape exists in REQ-STATS-03 and REQ-STATS-06, inherited.** `pdlc-loop-economics` has
   zero `CROSS-REVIEW-*` files, and its LEARNINGS states positively that none ever existed — the
   feature used direct authoring and "`HANDOFF-PROMPT.md` … explicitly scoped out cross-review round
   files" (`LEARNINGS-pdlc-loop-economics.md:71`). So every document-type row reports `harvested`
   under REQ-STATS-03, and the ratio reports `harvested` under REQ-STATS-06, for a feature that
   produced no such files in the first place. Those two ACs are unchanged bytes I approved in v5, so
   per the delta protocol I am not re-opening them; I note the shape here only so the author sees
   that one clause fixes the family, not just REQ-STATS-05.
3. **It shapes the fixture set.** A test author needs to know that "harvested" is deliberately the
   union of two real-world causes, so the suite pins it as such rather than someone later
   "fixing" the merge-phase fixture to `0` and breaking the AC.

**The cheapest resolution is one sentence, and it is not a new mechanism.** I am explicitly *not*
asking for LEARNINGS prose to be parsed — NG-6 now forbids exactly that, correctly, and I agree with
it. What is missing is that the REQ does not acknowledge the conflation it is accepting. One clause
in REQ-STATS-05 saying that `harvested` means *evidence not on disk with a LEARNINGS present* and
deliberately does not distinguish deletion from never-written — cross-referenced from R-6 so the
baseline consumer is warned — makes the trade-off explicit and pins the two archives as intended
behavior rather than as an unnoticed edge. FSPEC can then choose the token under O-1 knowing the
state is a union.
