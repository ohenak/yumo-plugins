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

| ID | Question |
|----|---------|
| Q-01 | For a feature with **no** `LEARNINGS-{feature}.md` and no post-mortems, is a plain zero halt count right, or should an unharvested feature with zero post-mortems also be distinguished from one never run through the pipeline? I believe plain zero is correct there and the fix in §3 preserves it, but the boundary is worth one sentence in the AC. |
| Q-02 | Should `pdlc stats` read `LEARNINGS`' `Harvested from` row to *recover* the deleted post-mortem count, rather than only reporting harvested? That would make the metric measured rather than not-available for archives like `pdlc-advisory-tier`, but it adds a parsing rule and C-5 would then bind it. My recommendation is **no** for this REQ — report harvested, keep the parsing surface small — but the choice belongs to the author. |

## Positive Observations

- **The document is genuinely stable.** Byte-identical to v1.4 with a clean working tree; the
  erratum channel has stopped churning this document. Everything I approved in v5 is still true of
  the bytes, and I re-derived that mechanically rather than assuming it.
- **REQ-STATS-06 already models the pattern REQ-STATS-05 needs.** The harvested-vs-measured
  distinction, the refusal to emit a misleading computed value, and the deferral of tokens to FSPEC
  are all correct there. The fix in §3 is not new machinery — it is applying an idiom this document
  already owns to the one metric that was left without it.
- **C-5's deference discipline held up under a hostile check.** REQ-STATS-05 pins the `RESOLVED:`
  classification to the pipeline's own marker rule rather than restating it, so case, duplicate
  markers and fenced-block placement stay decided in one place. That is exactly why the defect I
  found is in the *discovery* step and not in the classification step — the deferral worked.
- **The archive-preference rule in C-2 is honestly labelled.** It names itself as this REQ's own
  decision rather than an inherited convention, and cites where the archive location *is*
  verifiable. That labelling is what let me check the corpus at all.

## Recommendation

**Needs revision**

One High finding (F-01). REQ-STATS-05's halt oracle reads a harvest-deleted post-mortem as a clean
run, which is demonstrably wrong for `docs/completed/pdlc-advisory-tier/` — a feature whose own
LEARNINGS records two post-mortems and their deletion. The criterion as written would be pinned into
the suite as a false green against a real archive, and it is absence-only, so it cannot fail for the
reason it exists.

The change is bounded and REQ-local: give REQ-STATS-05 a harvested state mirroring REQ-STATS-06's,
paired with the positive `LEARNINGS`-present conjunct, and soften REQ-STATS-06's "post-mortems
survive" rationale to the true weaker claim. No FSPEC material needs to move upward; rendering
tokens stay under O-1. F-02 and F-03 remain non-gating and can ride along with that edit.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Description |
|----|----------|-----------|----------|----------------|-------------|
| F-01 | High | inherited | nonlocal | §5 REQ-STATS-05 halt zero rule (and REQ-STATS-06 rationale) | "No post-mortem file is zero halts, never an error" is an absence-only oracle that reads harvest-deletion as a clean run. `docs/completed/pdlc-advisory-tier/` has zero `POSTMORTEM-*` yet its `LEARNINGS-pdlc-advisory-tier.md:15` records "Two POSTMORTEMs" and `:11` lists both as "deleted by this harvest", so the metric reports 0 halts for a feature that halted twice, with no gap flag. REQ-STATS-06's premise "post-mortems survive" is falsified by the same archive; upstream is self-contradictory (`pdlc/skills/harvest-learnings/SKILL.md:28` deletes two families, `:77` and `pdlc/OPERATIONS.md:296` say three). Fix: harvested state for REQ-STATS-05 keyed on LEARNINGS-present + post-mortem-family-absent; soften REQ-STATS-06's rationale. Not touched by this round (REQ bytes unchanged), hence inherited. |
| F-02 | Medium | inherited | nonlocal | §2 Goals, G-3 (`REQ-pdlc-stats.md:47`) | Carried from v5 F-01, unchanged. G-3 still says artifacts "missing or fail to parse" are "reported missing/malformed", contradicting REQ-STATS-07: readable-but-empty is a normal zero row, only an unreadable directory is a by-name gap, and malformed is a within-metric state (REQ-STATS-03). |
| F-03 | Low | inherited | nonlocal | §4 C-4 doc-type placeholder vs REQ-STATS-03 | Carried from v5 F-02, unchanged. C-4's `{doc-type}` is open while the driver's catalogue is closed (`pdlc/workflows/orchestrate-dev.js:10105-10112`, rejected `:10144` `bad_doc_type`), so `CROSS-REVIEW-product-manager-REVIEW-v1.md` is malformed under REQ-STATS-03 but a survivor under REQ-STATS-06. Worth one clause noting the predicate is deliberately set-membership over C-4. |

FINDING: High | inherited | nonlocal | §5 REQ-STATS-05 halt zero rule | "No post-mortem file is zero halts, never an error" is an absence-only oracle that reads harvest-deletion as a clean run: docs/completed/pdlc-advisory-tier/ has zero POSTMORTEM files yet its LEARNINGS records two post-mortems deleted by harvest, so the metric silently reports 0 halts for a feature that halted twice, and REQ-STATS-06's "post-mortems survive" rationale is falsified by that same archive.
FINDING: Medium | inherited | nonlocal | §2 Goals, G-3 | G-3's "artifacts missing or failing to parse are reported missing/malformed" contradicts the corrected REQ-STATS-07: a readable-but-empty directory is a normal zero row, only an unreadable directory is a by-name gap, and malformed is a within-metric state rather than a feature-level label.
FINDING: Low | inherited | nonlocal | §4 C-4 doc-type placeholder | C-4's open {doc-type} placeholder admits CROSS-REVIEW-{role}-REVIEW-v{N}.md as a REQ-STATS-06 survivor while REQ-STATS-03 classifies the same real files as malformed under the driver's closed REVIEW_DOC_TYPES catalogue.

## Verdict
