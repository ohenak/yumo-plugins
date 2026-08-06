# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 12
**Scope:** Local (Scope tags per finding below)
**Delta base:** `e54ee26` (the tree v11 reviewed) → HEAD

Delta re-review, and the delta is empty. `git diff e54ee26..HEAD --
docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` produces **no output**, and the
file's digest at HEAD is `sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17`
— byte-for-byte the `APPROVAL-HASH` I recorded in v11. The same diff over `docs/_constraints/` is
also empty, so neither governed file moved either. The REQ's last content commit is `6c025bb`
(`git log -1 -- …REQ-…md`), which is an ancestor of the tree v11 reviewed; the ~120 commits since
are Phase F work (FSPEC v1→v6, its ten cross-reviews, `POSTMORTEM-F`) plus two queue rows, none of
which touched this document.

Two consequences for this round, stated plainly rather than inferred:

1. **Nothing can have been broken.** There is no changed section to scan for new issues, so this
   review opens no new finding ids. F-57+ is unused.
2. **Nothing can have been fixed either.** All three v11 Lows are re-verified against the tree
   below and all three are still open, in exactly the state v11 left them.

## Prior findings

Each v11 finding is re-checked against the file it was about, not against its own prose.

| v11 ID | Sev | Disposition | Evidence at HEAD |
|---|---|---|---|
| F-54 | Low/Cross-Feature | **Open — unchanged** | `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` still reads `| Version | 1.0 · 2026-08-06 |`, while the change-control paragraph that makes an unbumped content change a defect is still the inserted `:15-20` text ("Consumers cite this file **at its `Version`**; a content change that is not accompanied by a version bump is itself a defect") and the `Cited by` row at `:6` still carries the `§5` the same diff added. The three REQ citations still pin the unbumped version: AC-1.5 (`:202`, "**`docs/_constraints/pdlc-advisory-corpus-baseline.md` §3** (at `Version` 1.0)"), REQ-CONS-06's preamble (`:448`, "(at `Version` 1.0)") and the honest-limit line (`:474`, "The honest limit (baseline §4)"). Still Low for the reason v11 gave and DEC-SEV-01 records: no value a downstream test transcribes moved, and the file declares itself outside any row oracle. |
| F-55 | Low/Local | **Open — unchanged** | §4b still widens ownership across both files — "**This REQ owns every section of each `docs/_constraints/` file it authors — §1–§4 entire in both**" (`:558-559`) — and the classification sentence that follows still says "Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned normative prose**" (`:560-563`) without naming which file's owned sections it ranges over. The oracle range still ends "§1, §2 and §4 entire at Version 1.4" (`:564-565`), which is the pin that lets a careful reader resolve it, since only the vocabularies file is at 1.4 (`pdlc-consolidation-vocabularies.md:7`) and the baseline is at 1.0. §5 still lists both files in identical words, "(§1–§4 entire, per §4b)" for each (`:585-586`), so it still distinguishes nothing. |
| F-56 | Low/Process | **Open — measurement unchanged** | `wc -l -c` at HEAD: **637 lines / 61,109 bytes**, identical to v11, against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) and past both soft thresholds `SOFT_LINE_LIMIT=630` / `SOFT_BYTE_LIMIT=55296` (`:47-48`). Margin **331 bytes**. Worth one correction on the record: `6c025bb`'s commit message states the margin moved "344 → 437 bytes"; the tree says 331. The message is describing a different measurement than `check-req-size.sh` performs, and the script's own limits are the ones that matter. |

## Findings

No new findings. The three carried forward are F-54, F-55 and F-56, re-verified above and restated
here so the table is complete on its own terms; ids are not renumbered across rounds.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-54 | Low | Cross-Feature | The baseline file's content changed under a frozen `Version`, and the clause that makes that a defect is the paragraph the same commit added, so the file breaches its own rule; the REQ pins the unbumped `1.0` in three places. Fix: `1.0` → `1.1` in the baseline header and in the REQ's two version-pinned citations. | `docs/_constraints/pdlc-advisory-corpus-baseline.md:6-7`, `:15-20`; REQ `:202`, `:448`, `:474` |
| F-55 | Low | Local | §4b's ownership sentence spans both governed files, but the enumeration/prose classification and the oracle range built on it were written for one. Read literally it puts the baseline file's §1 table under a set-equality oracle at a `Version` that file does not carry, while the baseline file says all four of its sections are prose under no row oracle. Decidable today only via the `Version 1.4` pin. Fix: name the vocabularies file in the classification sentence, and add to §5 that the baseline's four owned sections carry no row oracle. | REQ §4b (`:558-565`), §5 (`:585-586`); `docs/_constraints/pdlc-advisory-corpus-baseline.md:17-19`, `:24-30`, `:46` |
| F-56 | Low | Process | The REQ sits at 61,109 / 61,440 bytes — a 331-byte margin against a warn-only budget — and the trend across rounds 9→12 is 387 → 344 → 331 → 331. Not a delivery risk: `check-req-size.sh` emits a `PostToolUse` `additionalContext` line and `exit 0` on every path (final block), so nothing is blocked. Filed to keep the headroom visible to whoever lands F-54/F-55 (~44 bytes together, which fit). | Whole document; `pdlc/hooks/scripts/check-req-size.sh:41-42`, `:47-48` |

**Why no finding was upgraded on a no-change round.** The Challenger default is that a document
that did not move does not thereby earn a better verdict — but it does not earn a worse one either,
and severity is a property of the defect, not of how many rounds it has survived. `DEC-SEV-01`
(`docs/_decisions/DECISIONS-review-severity-bars.md:10`) settles exactly this class: "a
version-pin-detectable governance-scope gap is Low; Medium is reserved for gaps that block a
downstream author today." I applied the test rather than the label. F-54: a PROPERTIES or TSPEC
author transcribing an expected value from the baseline file transcribes §1's fate table, §2's
absent-at-HEAD facts, §3's ladder or §4's limit — all byte-identical across the diff that broke the
version rule, and all outside any row oracle by the file's own declaration (`:17-19`), so no
expected value is wrong today. F-55: the range clause pins `Version 1.4`, only one of the two files
carries 1.4, and the other states the answer in its own words — the oracle's subject is
recoverable, just not from one sentence. Neither blocks a fixture being written today. They stay
Low.

## Questions

| ID | Question |
|---|---|
| Q-01 | Process, non-blocking, and the only thing about this round that is actually new: Phase R was re-entered for a confirming round after `POSTMORTEM-R` was resolved, but the REQ has not changed since that resolution — the round is confirming a tree it already approved at v11. Is a re-entry with an empty delta meant to produce a fresh review pair at all, or should the recorded v11 approval (whose `APPROVAL-HASH` still matches the bytes at HEAD) satisfy the gate directly? I have written the review either way; the question is whether the pipeline should be spending two reviewer rounds on a byte-identical document. |

## Positive Observations

- **The v11 approval anchor is still valid, and I checked it rather than assuming it.**
  `shasum -a 256` over the REQ at HEAD returns
  `0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17`, identical to the
  `APPROVAL-HASH` line in `CROSS-REVIEW-test-engineer-REQ-v11.md:151`. That is the anchor doing its
  designed job: it says the approval covers *these* bytes, and the bytes are unchanged, so the
  approval is not stale. This is the case the anchor mechanism exists for and it survived a
  hundred-plus intervening commits.
- **Phase F did not silently edit its upstream.** ~120 commits landed between the two reviewed
  trees — the whole FSPEC v1→v6 arc, ten FSPEC cross-reviews and a Phase F postmortem — and the REQ
  diff is empty. Errata that Phase F found were routed as FSPEC-layer work and as two project-level
  decisions (`DECISIONS-spec-layer-boundary.md`, `DECISIONS-review-severity-bars.md`), not folded
  into the REQ by whoever noticed them. That is the erratum channel behaving as specified.
- **Every code citation in the REQ still resolves at HEAD, re-verified line by line rather than
  carried over from v11** — a hundred commits is enough for a pinned line number to drift, so I
  re-ran them all. `resolveAdvisoryRung` is at `pdlc/workflows/orchestrate-dev.js:1833`
  (`export function resolveAdvisoryRung({ _agent, _log, _state, prompt })`, cited by AC-1.5 `:202`);
  the fallback notice is at `:1859` (`ADVISORY_MODEL_FALLBACK: "${MODEL_ADVISORY}" did not
  resolve …`, cited by AC-1.6 `:205-206`); `ADVISORY_SEAMS` is at `:1669`
  (`export const ADVISORY_SEAMS = Object.freeze(["A1", "A2", "A3", "A4", "A5"])`, cited by
  REQ-CONS-06) — and it is a frozen five-member literal, which is what makes the "widen the seam
  set" proposal a real PR-able surface rather than a config edit. `consolidate-learnings/SKILL.md:35`
  is the boundary step naming `docs/_decisions/.consolidation-log.md` and `docs/*/LEARNINGS-*.md`;
  `nudge-consolidation.sh:41` is the predicate `pending = [p for p in learnings if
  os.path.basename(p) not in logtext]` and `:28` is the glob
  `glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))` — still the un-widened
  `docs/*/`, so §5's claim that this feature widens it to `docs/completed/*/` is a claim about work
  not yet done, which is the correct tense for a scope line.
- **`harvest-learnings/SKILL.md:70-78` is the metadata table §5 says this feature extends, and it
  does not yet carry `Phases exercised`.** The rows at HEAD are Feature / REQ / Date Completed /
  Total Iterations / Upstream / Harvested from / DoD rounds. So AC-5.2's convention addition is a
  genuine delta against HEAD, not a description of something already shipped — the failure mode
  where an activation REQ asks for wiring that already exists is absent here.
- **`check-req-size.sh` is still non-blocking at HEAD.** Its final block prints the
  `PostToolUse`/`additionalContext` JSON and falls through to `exit 0`, which is why F-56 is a
  headroom observation and not a delivery risk.

## Recommendation

**Approved with minor changes** — 0 High, 0 Medium, 3 Low.

The document under review is byte-identical to the one I approved at v11 — same digest, empty diff,
empty diff over both governed `docs/_constraints/` files. So the verdict is the same verdict, for
the same reasons, and I want to be explicit that this is not deference to the prior round: I
re-derived it. Every one of the REQ's `file:line` claims about existing behaviour was re-run against
HEAD (§Positive Observations lists them with the text found at each line), because ~120 commits is
more than enough to move a pinned line number, and all of them still resolve to code saying what is
attributed to it. All three carried Lows were re-checked against the files they are about, not
against v11's description of them.

Applying the Challenger bar to the three candidates individually rather than to their count:

- **F-54** would be Medium if a value a downstream test transcribes had changed under a frozen
  version. None did: the baseline's §1 fate table, §2 absent-at-HEAD finding, §3 ladder and §4 limit
  are byte-identical across the diff that broke the rule, and the file declares itself outside any
  row oracle (`:17-19`). It is a self-breach of a governance clause, not a drift any oracle can
  observe.
- **F-55** would be Medium if the oracle's subject were undecidable. It is not — the range clause
  pins `Version 1.4`, only the vocabularies file carries 1.4, and the baseline states the answer in
  its own words. A PROPERTIES author reaches the right range; they cross two documents to be sure.
- **F-56** is a headroom measurement inside a warn-only budget (`exit 0` on every path), filed
  `Process`.

All three sit squarely in the class `DEC-SEV-01` adjudicates as Low
(`docs/_decisions/DECISIONS-review-severity-bars.md:10`), and I reached that scoring by its test —
"does this block a downstream author today?" — rather than by citing it. No High, no Medium,
therefore not Needs revision.

What should change, unchanged from v11 and now ~44 bytes in total:

1. **F-54** — bump `docs/_constraints/pdlc-advisory-corpus-baseline.md` to `Version` 1.1 and repin
   the REQ's two version-pinned citations (`:202`, `:448`). Seven characters.
2. **F-55** — name the vocabularies file in §4b's classification sentence ("Of **the vocabularies
   file's** owned sections, §1, §2 and §4 are enumerations …") and add to §5 that the baseline's
   four owned sections carry no row oracle. ~40 bytes.
3. **F-56** — both fixes fit in the 331-byte margin. Do not plan a relocation to make room; there is
   little restatement left to move, and v11's evidence is that a relocation round buys nothing.

If the phase closes without them, none is a blocker at the REQ layer — but F-55 is the one worth
landing, because it is the only one of the three that a PROPERTIES author has to resolve by
cross-reading two files.

**No upstream defects.** REQ is the root document of this feature; nothing upstream of it exists to
be wrong. No ERRATUM lines are emitted.

## Verdict

VERDICT: Approved with minor changes
