# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.4, commit `e33637af2`)
**Date:** 2026-08-31
**Iteration:** 6
**Round type:** Delta re-review (prior: `CROSS-REVIEW-test-engineer-REQ-v5.md`, Approved with minor changes)
**Delta under review:** none — REQ bytes unchanged since v5

## 1. Delta scope

`git diff e33637af2 HEAD -- docs/pdlc-stats/REQ-pdlc-stats.md` is **empty**, and
`git status --porcelain` on the path is clean. The REQ is byte-identical to the v1.4 bytes I
approved in v5. There is therefore no delta to confirm: no previously-approved expectation moved,
and no routed item landed in this round's bytes.

That makes this round a re-confirmation against an unchanged document. Per the delta protocol I did
not re-litigate sections already approved. I did, however, re-run the REQ/FSPEC verification checks
that are grounded in *repository state* rather than in document bytes — those checks can flip
without the document changing, because the corpus the command measures is itself under version
control. One of them flipped, and it is section 3 below.

## 2. Carried findings from v5

Both non-gating findings from v5 are still open, unchanged, and still non-gating.

- **v5 F-01 (Medium, G-3)** — carried forward as **F-02**. §2 G-3 (`REQ-pdlc-stats.md:47`) still
  reads that feature artifacts "missing or fail to parse" are "reported missing/malformed". This
  still contradicts REQ-STATS-07, which reserves the by-name gap report for a directory that cannot
  be read, treats a readable-but-empty directory as a normal zero row, and leaves *malformed* as a
  within-metric state owned by REQ-STATS-03. The AC governs test authoring, so no test is misled;
  the goal statement simply summarises the ACs wrongly.
- **v5 F-02 (Low, C-4 doc-type placeholder)** — carried forward as **F-03**, unchanged. C-4's
  `{doc-type}` is an open placeholder while the driver's catalogue is closed
  (`REVIEW_DOC_TYPES`, `pdlc/workflows/orchestrate-dev.js:10105-10112`, rejected at `:10144` with
  reason `bad_doc_type`), so `CROSS-REVIEW-product-manager-REVIEW-v1.md` is malformed under
  REQ-STATS-03 yet a survivor under REQ-STATS-06.
- **v5 F-03 (Low)** was confined to the v1.4 changelog note's rationale rather than to an
  acceptance criterion. I am not re-filing it: it does not bind any test.

## 3. New finding: the harvested-halt oracle is a false green

REQ-STATS-06 states, as the load-bearing rationale for the harvested-ratio rule, that

> harvest deletes cross-reviews and DoD reviews while post-mortems survive, so the numerator is only
> *partially* deleted

and REQ-STATS-05 states, as its zero rule, that

> no post-mortem file is zero halts, never an error.

Both rest on one premise: **that harvest never deletes post-mortems.** I checked the premise against
the corpus rather than against the prose, and it is false at HEAD.

### Evidence: a real archive where harvest deleted the post-mortems

`docs/completed/pdlc-advisory-tier/` contains `LEARNINGS-pdlc-advisory-tier.md`, zero
`CROSS-REVIEW-*` and **zero `POSTMORTEM-*`**. That feature did not run clean — its own LEARNINGS
records the opposite. `LEARNINGS-pdlc-advisory-tier.md:15` opens §1 Non-Convergences with "Two
POSTMORTEMs, both from the **erratum channel**", and the metadata `Harvested from` row
(`LEARNINGS-pdlc-advisory-tier.md:11`) enumerates them by name and says so explicitly:

> `POSTMORTEM-T-pdlc-advisory-tier.md`, `POSTMORTEM-PR-pdlc-advisory-tier.md` — 82 files, deleted by
> this harvest

So `pdlc stats pdlc-advisory-tier`, built exactly to REQ-STATS-05, will report **zero halts for a
feature that halted twice**, and will do so silently — REQ-STATS-05 says the zero is "never an
error", and REQ-STATS-07's gap channel does not fire either, because the directory is readable.

This is not a lone anomaly of one archive; the corpus is genuinely mixed. Across the thirteen
harvested features under `docs/completed/`, nine retain post-mortems alongside their LEARNINGS while
four have none. For `pdlc-advisory-tier` the LEARNINGS proves the absence is deletion. That mixture
is precisely what makes the metric unmeasurable as specified: **a zero post-mortem count is
ambiguous between "never halted" and "halted, then harvested", and REQ-STATS-05 collapses the two
into the first reading without a discriminator.**

### Why the upstream authority does not rescue the premise

The harvest role is self-contradictory at HEAD, which is how both states got onto disk.
`pdlc/skills/harvest-learnings/SKILL.md:28` (and again at `:59` and `:129`) scopes deletion to two
families — "delete the `CROSS-REVIEW-*` and `CODE_REVIEW-*` files" — while the metadata-table
template one document later, `pdlc/skills/harvest-learnings/SKILL.md:77`, instructs the harvester to
write

> `| Harvested from | {list of CROSS-REVIEW + CODE_REVIEW + POSTMORTEM files, now deleted} |`

and `pdlc/OPERATIONS.md:296` agrees with the template, describing the row as the record of which
`CROSS-REVIEW-*` / `CODE_REVIEW-*` / `POSTMORTEM-*` files "harvest deleted". The advisory-tier
harvester followed the template. So the REQ cannot settle the question by citing upstream: the
upstream says both things, and the corpus contains both outcomes.

### Why this is High from the testing lens

This is not a wording dispute about which upstream sentence wins. It is a defect in the acceptance
criterion's oracle, on three counts my mandate names explicitly.

1. **Absence-only oracle.** REQ-STATS-05's rule is "no post-mortem file present ⇒ zero halts". The
   negative assertion carries no paired positive assertion about what the feature's halt history
   actually was. Any accidental absence — harvested, hand-deleted, never-written — reads as a clean
   run. A test author writing the harvested fixture has nothing falsifiable to assert: the oracle
   passes for a feature that halted twice and for a feature that never halted, which means it can
   never fail for the reason it exists.

2. **The fixture that would be written is a pinned false green.** `docs/completed/pdlc-advisory-tier/`
   is the most natural real-archive fixture for "harvested feature, halts metric". Written to
   REQ-STATS-05 as it stands, the expected value is `halts: 0`, and that expectation would be
   transcribed into the suite as *correct*. The suite would then defend the wrong answer against
   any future fix.

3. **REQ-STATS-06's stated rationale is falsified, and the rationale is doing work.** The harvested
   predicate happens to classify `pdlc-advisory-tier` correctly (it has no cross-reviews, so it is
   harvested by either reading), but it reaches the right answer for a reason the corpus
   contradicts. "The numerator is only *partially* deleted" is the sentence that justifies why a
   computed ratio would "silently undercount rather than be absent". Where post-mortems were also
   deleted, the numerator is *wholly* deleted, and the justification does not hold. A reviewer of
   the downstream TSPEC will reason from this sentence.

### The fix is available and cheap

The discriminator already exists on disk and survives harvest: `LEARNINGS-{feature}.md` is present
in every harvested archive, its `Harvested from` row names the deleted `POSTMORTEM-*` files, and its
§1 Non-Convergences section states the count in prose. Concretely, to reach Approved:

- Give REQ-STATS-05 a **harvested state**, exactly as REQ-STATS-06 already has one: where
  `LEARNINGS-{feature}.md` is present and no `POSTMORTEM-*` file remains, the halt count is
  *harvested / not-measured*, not zero. Reserve the plain zero for a feature with no LEARNINGS and
  no post-mortems, where absence really does mean "never halted".
- Pair the negative with a positive on the same path, so the AC is testable: the harvested state is
  asserted by the presence of LEARNINGS plus the absence of the post-mortem family, not by absence
  alone.
- Correct REQ-STATS-06's rationale clause so it no longer asserts as fact that post-mortems survive.
  The predicate itself can stand unchanged; only the "while post-mortems survive" justification
  needs to become the weaker and true claim, that at least one harvest-deleted family is absent.

I am deliberately not prescribing the rendering token for the harvested halt state — that is FSPEC
material under O-1, same as REQ-STATS-06's tokens.

Note this converges with the software-engineer's v5 High from a different direction. SE asked for
the upstream question to be *settled* before the REQ asserts an answer. I am asking for something
weaker and fully REQ-local: whichever way the upstream question is eventually settled, REQ-STATS-05
must not read a deleted post-mortem as a zero halt, because the corpus already contains both
outcomes and the command must measure the corpus as it is.

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
