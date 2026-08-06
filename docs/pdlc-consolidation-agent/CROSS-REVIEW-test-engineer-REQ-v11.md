# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 11
**Scope:** Local (Scope tags per finding below)
**Delta base:** `e775262` (the tree v10 reviewed) → HEAD

Delta re-review. v10's findings F-52 and F-53 are dispositioned in §Prior findings; new findings are
numbered F-54 onward so ids never collide across rounds. Only the five commits that touched the REQ
since `e775262`, plus the two `docs/_constraints/` files they edited, were read for new issues;
unchanged sections approved in v1–v10 were not revisited.

## Prior findings

Both v10 findings are dispositioned below, each against the file the revision edited rather than
against its prose.

| v10 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-52 | Low/Cross-Feature | **Resolved — the ownership rule and the oracle range now cover the sections that had moved, and the round distinguished the two kinds of owned section rather than widening blindly** | I asked for two things: widen the file's ownership sentence past §1/§2, and widen §4b's range and §5's deliverable to match. Both landed, and a distinction I had not asked for landed with them. `pdlc-consolidation-vocabularies.md:18-27` now reads "`REQ-pdlc-consolidation-agent` **owns every section of this file — §1–§4 entire**", and then splits the owned set: "**§1, §2 and §4 are enumerations** — their tables are transcribed row-for-row downstream and are under the set-equality oracle below — while **§3 is owned normative prose**, binding but not enumerated, so it carries no row oracle." §4b mirrors it (`:557-566`) and states the range as "set-equality over every enumerated row this REQ owns — **§1, §2 and §4 entire at Version 1.4** (§4's four-row trailer table and its two derived names included)". §5's deliverable now names "§1–§4 entire, per §4b" for both files (`:585-586`). I checked the classification against the sections rather than accepting it: §4 (`:156-170`) is exactly a two-row derived-names table plus a four-row trailer table, so it is an enumeration and the oracle now reaches the `PDLC-CONSOLIDATION-SOURCES` row whose deletion v10 found unpunished; §3 (`:102-154`) is prose with one fenced block-grammar example and no transcribable table, so exempting it is correct rather than convenient. The version pin moved 1.3 → 1.4 in all six REQ citations (`:83`, `:99`, `:182`, `:222`, `:398`, `:557`) and the file's header row is `| Version | 1.4 · 2026-08-06 |` (`:7`), so no citation is stale. One seam this widening opened is refiled narrowly as F-55. |
| F-53 | Low/Process | **Complied with in the required order, and the outcome moved the wrong way again — refiled as F-56** | The round relocated first and relocated exactly where I pointed. `eef3b3c` ("REQ-CONS-06 preamble cites baseline §1/§2 instead of recapitulating them") is the candidate I named at v10 `:447-453`; `ef6eb17` ("stop restating vocabularies §3 — cite it") took two further restatements out of REQ-CONS-01 and AC-1.3's prose. I verified neither move lost anything a test needs — see §Positive Observations. What did not improve is the measurement: at HEAD the REQ is **637 lines / 61,109 bytes** (`wc -l -c`) against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`), a margin of **331 bytes** where v10 measured 344 and v9 measured 387. Two relocations in one round net-added 13 bytes and one line. The trend is now three rounds long, which is what makes it worth refiling a third time rather than dropping. |

## Findings

Three Lows, no Medium, no High. Both v10 findings are dispositioned on their mechanism; one below is
a v10 finding refiled with a longer trend behind it, and two are seams this round opened while
closing F-52. Every `file:line` in the changed text resolves to a real authority saying what is
attributed to it, and I re-derived the classification claims against the sections themselves rather
than trusting the round's own summary. None of the three blocks a test author from writing a fixture
today, which is why none is filed higher.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-54 | Low | Cross-Feature | **The baseline file's content changed in this round without a version bump, and the clause that makes that a defect is the very paragraph the round added — so the file breaches its own rule on the commit that introduced it, while the REQ pins `Version` 1.0 in three places.** `7fa2a84` and its siblings added a change-control paragraph to `docs/_constraints/pdlc-advisory-corpus-baseline.md:15-20` — "`REQ-pdlc-consolidation-agent` owns every section of this file — §1–§4 entire … All four sections are **owned normative prose**: no table here is transcribed row-for-row downstream, so no set-equality oracle ranges over this file. Consumers cite this file **at its `Version`**; a **content** change that is not accompanied by a version bump is itself a defect." The same diff also rewrote the `Cited by` row (`:6`) to add `§5`. The header row still reads `| Version | 1.0 · 2026-08-06 |` (`:7`). So the file's bytes at `Version` 1.0 today are not the bytes at `Version` 1.0 yesterday, which is precisely the drift the new clause exists to prevent — and the sibling file did the analogous edit correctly, bumping 1.3 → 1.4 for a change of exactly the same kind (`pdlc-consolidation-vocabularies.md:7`, `:18-27`). Three REQ citations pin the unbumped version: AC-1.5's ladder cite (`:202`), REQ-CONS-06's preamble (`:448`), and the honest-limit line (`:474`, which cites "baseline §4" — verified, `pdlc-advisory-corpus-baseline.md:62` is `## 4. The honest limit`). This is Low and not higher because nothing a downstream test transcribes moved: §1's three-row Record/Where/Fate table, §2's absent-at-HEAD facts, §3's ladder and §4's limit are byte-identical across the diff (`git diff e775262..HEAD -- docs/_constraints/pdlc-advisory-corpus-baseline.md` touches only `:6` and the inserted paragraph), and the file declares itself outside any row oracle, so no expected value a PROPERTIES author would pin has changed. The fix is one character: `1.0` → `1.1` in the baseline header, and the same in the REQ's three citations. Tagged Cross-Feature because it is the general hazard of a governance clause that takes effect on the commit that writes it — the round that adds "cite at the Version" must bump the Version in the same commit, or its first act is a violation. | `docs/_constraints/pdlc-advisory-corpus-baseline.md:6-7`, `:15-20`; REQ `:202`, `:448`, `:474` |
| F-55 | Low | Local | **§4b's ownership sentence now spans two files, but the enumeration/prose classification that follows it — and the oracle range built on that classification — were written for one. Read literally, §4b puts the baseline file's §1 table under a set-equality oracle at a `Version` that file does not have; the baseline file itself says the opposite.** The widening F-52 asked for landed as "**This REQ owns every section of each `docs/_constraints/` file it authors — §1–§4 entire in both**" (`:557-558`). The next sentence then classifies "**Of the owned sections**, §1, §2 and §4 are enumerations and §3 is owned normative prose" (`:560-562`) — and "the owned sections" is now, by the sentence immediately preceding it, the sections of *both* files. Applied to the baseline file that is false in both directions: its §1 **is** a three-row table (`pdlc-advisory-corpus-baseline.md:24-30`) that the classification would sweep under the oracle, and its §3 is the model-ladder section (`:46`) that the classification would exempt, while the file's own paragraph says all four of its sections are normative prose carrying no row oracle (`:17-19`). §5 compounds the reading by listing both files as deliverables "per §4b" in identical words (`:585-586`), so nothing there distinguishes them either. The gap is narrower than it looks, which is why it is Low: the range clause ends "§1, §2 and §4 entire at **Version 1.4**" (`:563-564`), and only the vocabularies file is at 1.4 — the baseline is 1.0 — so a careful PROPERTIES author resolves it correctly from the version pin alone, and the baseline file states the answer explicitly if they open it. But a test oracle should not need a version pin to identify its own subject. One clause closes it: name the file in the classification sentence — "Of the vocabularies file's owned sections, §1, §2 and §4 are enumerations …" — and add the half-sentence §5 is missing, that the baseline file's four owned sections carry no row oracle. Both are edits inside sentences that already exist, ~40 bytes net. | §4b (`:557-566`), §5 (`:585-586`); `docs/_constraints/pdlc-advisory-corpus-baseline.md:17-19`, `:24-28`, `:46` |
| F-56 | Low | Process | **Third round running, a compliant relocate-first pass moved material out and the margin got worse: 387 → 344 → 331 bytes. The two relocations I named at v10 were both executed, and the round still net-added 13 bytes.** `pdlc/skills/pm-author/SKILL.md:118` requires relocation "**before** addressing that round's findings — never after", and the order holds: `7fa2a84` (constraints file first), then `07a3549`, `eef3b3c`, `589b6a9`, `ef6eb17`. Both relocations were the ones v10 pointed at — REQ-CONS-06's preamble now cites baseline §1/§2 instead of recapitulating them (`:447-451`, five lines where there were seven), and REQ-CONS-01's and AC-1.3's restatements of the freeze clauses and the write-granularity obligation are gone, replaced by citations (`:97-100`, `:182-186`). At HEAD the REQ is **637 lines / 61,109 bytes** against `BYTE_LIMIT=61440` and `LINE_LIMIT=700` (`check-req-size.sh:41-42`), still past both soft thresholds (`SOFT_LINE_LIMIT=630`, `SOFT_BYTE_LIMIT=55296`, `:47-48`). The v10 lesson was "a relocation that runs concurrently with a finding round buys nothing at all". The sharper one, now that it has held three times with the candidates chosen well: **restatement is not what this document is spending its budget on.** The two relocations shed roughly 900 bytes of restatement; the round's *answers* — a widened ownership sentence, a classification sentence, a re-scoped oracle range, six version repins — added about as much, and every one of them is this REQ's own normative content, not a restatement of anyone's. So the next round cannot buy margin by relocating; there is little restatement left to move. Concretely: F-54's fix is four characters and F-55's is ~40 bytes, so round 12 fits. Beyond that, the honest options are a second `docs/_constraints/` file for §4b's change-control machinery, or accepting that this REQ sits at ~99% of a warn-only budget (`check-req-size.sh` is a PostToolUse warning, not a block — the hook never refuses a write), and saying so in the document rather than re-testing it each round. | Whole document; `pdlc/hooks/scripts/check-req-size.sh:41-42`, `:47-48`; `pdlc/skills/pm-author/SKILL.md:118`; commits `7fa2a84`, `07a3549`, `eef3b3c`, `589b6a9`, `ef6eb17` |

## Questions

No open questions. None of the three findings is a request for information: F-54's fix is a version
digit, F-55's is naming a file inside two sentences that already exist, and F-56 is a measurement
with a stated next step.

## Positive Observations

- **The round split "owned" from "enumerated" instead of just widening the range, which is the
  distinction the oracle actually needs — and I checked the split against the sections rather than
  against its own summary.** F-52 asked only for "§1 and §2" → "§1–§4". The round gave that, then
  qualified it: §1, §2 and §4 are enumerations under the set-equality oracle, §3 is owned normative
  prose carrying no row oracle (`pdlc-consolidation-vocabularies.md:18-27`, mirrored at REQ
  `:560-562`). Blind widening would have put §3 under a row oracle it cannot satisfy — §3
  (`:102-154`) is prose plus one fenced grammar example, with no table to transcribe — and would have
  produced a property no implementer could write. Meanwhile §4 (`:156-170`) is exactly what the
  oracle should reach: a two-row derived-names table and a four-row trailer table. So the
  `PDLC-CONSOLIDATION-SOURCES` row whose silent deletion v10 found unpunished is now covered by the
  symmetric rule, and the range clause names the four-row table explicitly (`:563-565`) so a
  PROPERTIES author does not have to infer which tables count.
- **Both relocations were checked for loss, and both citations point at text that says what is
  attributed to it.** `ef6eb17` removed REQ-CONS-01's restatement of the two freeze clauses and
  AC-1.3's restatement of the write-granularity obligation, leaving citations to vocabularies §3.
  I read §3 rather than trusting the commit message: `:143-154` carries both freeze clauses in full,
  including the empty-pair case ("even when its consumed set is empty … so the boundary is frozen
  unconditionally by the first pass"), the single `refused`-row exemption with its
  no-field-is-ever-a-basename argument, and the explicit "The in-progress marker is **not** a second
  exempt record: it lives in its own file" — which is the clause the REQ kept inline (`:99-100`) and
  correctly kept, since it is the REQ's own disambiguation. `:123-132` carries the write-granularity
  rule with the two consequences AC-1.3 now cites in one line instead of four. Nothing a test needs
  was left behind in either move.
- **REQ-CONS-06's preamble now cites the baseline's two sections and states its two obligations,
  which is the shape a test author wants.** The v10 text recapitulated §1's fate table and §2's
  absence finding in a single 7-line paragraph; the new one (`:447-451`) names §1 and §2, then states
  what this REQ takes from them as lettered obligations — "(a) REQ-CONS-06 consumes
  `docs/_queue/ESCALATIONS.md` … and never a destroyed artifact, so no count is ever derived from
  LEARNINGS advisory text" and "(b) Because §2 finds it absent at HEAD, REQ-CONS-06 is specified
  **absent-first**". Both are testable as written: (a) is a negative with a positive on the same path
  (the count comes from `ESCALATIONS.md`, not from LEARNINGS text), and (b) names the fixture state
  (tier off) the AC-6.1 tests run in. I verified the baseline still supports both — `:22-30` is the
  fate table naming `ESCALATIONS.md` durable and `ADVISORY-{feature}.md` deleted at H2, `:33-44` is
  the absent-at-HEAD finding with its `advisoryTierOn` / `parseAdvisoryConfig` citations.
- **The version repin was complete rather than partial.** All six vocabularies citations in the REQ
  moved 1.3 → 1.4 in the same round the file's header did (`:83`, `:99`, `:182`, `:222`, `:398`,
  `:557` against `pdlc-consolidation-vocabularies.md:7`), and the file's `Cited by` row was updated
  to match the actual citation set — it now lists `§5` and `AC-3.7`, and I confirmed AC-3.7 does cite
  vocabularies §4 (REQ `:268`, "the PR body carries the `PDLC-CONSOLIDATION-PASS` trailer
  (vocabularies §4, cited by the REQ-CONS-03 preamble)"). A partial repin is the failure mode that
  makes a pinned citation worse than none; this one has no stragglers.
- **`check-req-size.sh` is genuinely non-blocking, which is why F-56 is Process and not a delivery
  risk.** I read the script to the end rather than assuming: every path prints a
  `PostToolUse`/`additionalContext` JSON line and falls through to `exit 0`
  (`pdlc/hooks/scripts/check-req-size.sh`, final block). So the 331-byte margin degrades the
  document's headroom, not the pipeline's ability to run.

## Recommendation

**Approved with minor changes** — 0 High, 0 Medium, 3 Low.

Both v10 Lows are dispositioned on their mechanism. F-52 is resolved and resolved better than asked:
the round widened ownership to §1–§4 in both files *and* split the owned set into enumerations
(§1/§2/§4, under the symmetric set-equality rule) and owned normative prose (§3, no row oracle) —
so §4's four-row trailer table is now covered, a deleted `PDLC-CONSOLIDATION-SOURCES` row is a
breach, and §3 is not saddled with an oracle it cannot satisfy. F-53 was complied with in the
required order, on the two candidates v10 named, with no loss of anything a test needs; only its
measurement failed to improve, and that is refiled as F-56.

Applying the Challenger bar to each of the three remaining candidates rather than to their count:

- **F-54** would be a Medium if any value a downstream test transcribes had changed under a frozen
  version. None did — the baseline's diff touches its `Cited by` row and inserts a governance
  paragraph; §1's fate table, §2's absence finding, §3's ladder and §4's limit are byte-identical.
  And the file declares itself outside any row oracle, so nothing downstream pins a row of it. It is
  a self-breach of a new clause, not a drift a test can observe.
- **F-55** would be a Medium if the ambiguity were undecidable. It is not: the range clause pins
  `Version 1.4`, which only the vocabularies file carries, and the baseline file states the answer in
  its own words. A PROPERTIES author reaches the right oracle; they just have to cross two documents
  to be sure of it.
- **F-56** is a measurement inside a warn-only budget, filed `Process`. The script exits 0 on every
  path, so nothing is blocked.

I re-derived every factual claim in the changed text rather than accepting the relocation as
truth-preserving: the six repinned vocabularies citations against the file's `Version` 1.4 header;
§3's freeze clauses and write-granularity rule against the text the REQ stopped restating
(`:123-131`, `:143-154`); §4's two-row and four-row tables against the classification that calls it
an enumeration (`:156-170`); the baseline's §1 table, §2 absence finding and §4 heading against
REQ-CONS-06's new preamble and the honest-limit line; AC-3.7's vocabularies §4 citation (`:268`)
against the file's updated `Cited by` row; and `check-req-size.sh`'s limits and its `exit 0`. All
resolve.

What should change, in order — all three are single edits:

1. **F-54** — Bump `docs/_constraints/pdlc-advisory-corpus-baseline.md` to `Version` 1.1 and repin
   the REQ's three citations (`:202`, `:448`, `:474`). Four characters plus three, and it makes the
   file's own new clause true of the file.
2. **F-55** — Name the vocabularies file in §4b's classification sentence ("Of **the vocabularies
   file's** owned sections, §1, §2 and §4 are enumerations …") and add to §5's deliverable that the
   baseline's four owned sections carry no row oracle. ~40 bytes.
3. **F-56** — Do not plan a relocation for round 12; there is little restatement left to move and
   the two fixes above fit in the remaining 331 bytes. If the document must grow again after that,
   move §4b's change-control machinery to its own `docs/_constraints/` file rather than trimming a
   reason.

No upstream defects were found. Every `file:line` in the changed text and in both edited
`docs/_constraints/` files resolves to a real authority saying what is attributed to it. No ERRATUM
lines are emitted.

## Verdict

VERDICT: Approved with minor changes
