# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 10
**Scope:** Local (delta re-review — v9 findings + changed sections only)
**Baseline diffed:** `216b65d..HEAD` (5 REQ commits, +48/−56 on the REQ; 636 lines / 61,096 bytes), plus the 5 commits' changes to `docs/_constraints/pdlc-consolidation-vocabularies.md` (+60/−5, now v1.3 with two new sections)

## Prior-Finding Disposition

All three v9 findings, checked against the revision and against the code each cites.

| v9 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | Medium | **Resolved — option (a), written in both files and hardened past what I asked** | §4b now states the range instead of saying "the table": "**This REQ owns every row of that file's §1 and §2**, and changes none of anyone else's; a successor feature's vocabulary belongs in its own section of that file or in its own file, never interleaved into §1 or §2. So the oracle's range is stated, not 'the table': downstream completeness is checkable by **set-equality over the rows this REQ owns — §1 and §2 entire at Version 1.3**" (`:559-568`). Two things were added that I did not ask for and that matter more than the sentence I did ask for. First, the **symmetry**: "the defect rule is symmetric, a value used here with no row there **and** a row there naming a value this REQ never uses being equally defects. The symmetry is what makes a *deleted* row a breach" — that is the difference between a set-equality oracle and a containment check, stated at the REQ layer where the obligation lives, so the PROPERTIES author cannot implement it one-sided by accident. Second, the **version pin**: `Version 1.3`, plus the mirror rule in the file itself — "Consumers cite this file **at its `Version`**; a row change that is not accompanied by a version bump is itself a defect" (`pdlc-consolidation-vocabularies.md:23-24`) — which gives a downstream test a fixed expected value to transcribe, the thing my finding said was missing. Both halves are in the file too (`:16-24`), so a successor reading only the shared file sees the same rule. The pin checks out: the file's header is `Version 1.3 · 2026-08-06` (`:7`), and all three of the REQ's citations name 1.3. |
| F-02 | Low | **Resolved, both instances, and both verified at HEAD** | REQ `:475` now reads "The honest limit (baseline **§4**)" — and `pdlc-advisory-corpus-baseline.md` §4 is `## 4. The honest limit` (`:55`), whose body is exactly the sentence the REQ paraphrases ("`ESCALATIONS.md` records escalations, not resolutions… A resolution-**rate** input needs `advisorySummaryRows` persisted…", `:57-60`). The vocabularies citation is fixed in both places it appears: `nudge-consolidation.sh:41`'s read is now given as `:36-37` in the REQ (`:78`) and as "whose read of the log is at `:36-37`" in the file (`:105`). Checked against the script: `:36` is `with open(log, encoding="utf-8", errors="ignore") as fh:`, `:37` is `logtext = fh.read()`; `:32` (the old citation) is the `os.path.join` that composes the path. Correct now, in both files. |
| F-03 | Low | **Resolved — both paths named, and the clause repointed** | §5's in-scope list gains "the two project-level reference files this feature authors and thereafter owns — `docs/_constraints/pdlc-consolidation-vocabularies.md` (§4b's owned rows) and `docs/_constraints/pdlc-advisory-corpus-baseline.md` (REQ-CONS-06's corpus facts), both kept current with this REQ under §4b's change-control rule" (`:583-587`), and the trailing clause is repointed from "reporting against §4b's vocabularies" to "reporting against `pdlc-consolidation-vocabularies.md` §1's vocabularies" (`:586-587`). Both halves of the finding, and the added "thereafter owns" ties the scope line to F-01's ownership rule rather than merely listing two paths. The parenthetical is where my new F-01 lands — see below — but the finding as filed is closed. |

Three of three resolved, no v9 fix regressed. The single finding below is **not** a regression of
those three: it is the one seam between two fixes that landed in the same round — the ownership rule
(v9 F-01) was scoped to §1 and §2 in the same five commits that relocated two *further* normative
blocks into the same file as §3 and §4.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **The ownership rule and the set-equality range stop at §2, but this round moved two further normative blocks into the same file as §3 and §4 and declared both "binding here" — so the file now holds two sections of REQ-derived normative content with no declared owner, and §4's trailer enumeration is under no set-equality obligation at all.** The rule as written names two sections and only two: "This REQ **owns every row of that file's §1 and §2**… a successor feature's vocabulary belongs in its own section of that file or in its own file, never interleaved into §1 or §2" (`:559-562`), and the oracle is "set-equality over the rows this REQ owns — **§1 and §2 entire** at Version 1.3" (`:565-566`). The same five commits created `## 3. The consolidation log's record grammar` (`pdlc-consolidation-vocabularies.md:99`) and `## 4. Pass identity, artifact naming, and the PR trailer grammar` (`:153`), and the REQ binds itself to both: REQ-CONS-01 says the two clauses that freeze the legacy boundary "are stated once in **…§3** (at `Version` 1.3) and are binding here" (`:100-101`), and the REQ-CONS-03 preamble says the `passId` form, the derived proposal-artifact and branch names, "and the three PR-body trailers plus the per-commit `PDLC-PROMOTION-ID` are stated once in **…§4** (at `Version` 1.3) and are binding here" (`:221-223`). Three mechanical consequences, in ascending order of cost. **(a)** §3 and §4 are unowned. A successor may not touch §1 or §2 — the rule says so — but nothing says it may not edit §3 or §4, and the file's `Kind` row still declares it a read-only input to this feature "**and its successors**" (`:5`). §3 holds the legacy-region freeze (the two clauses (a)/(b) that make the un-consolidated predicate total) and §4 holds the duplicate-PR key's grammar; both are load-bearing for *this* feature's tests. This is v9 F-01's argument unchanged, applied to the sections v9 F-01's fix did not cover. **(b)** §4 is an enumeration with no oracle. It is a four-row table (three PR-body trailers plus `PDLC-PROMOTION-ID`) plus a two-row derived-names table — exactly the shape §4b's set-equality obligation exists for — and §4b's range explicitly excludes it. A deleted trailer row would not fail any obligation this REQ states, while a deleted §1 row would. That asymmetry is new this round: before the relocation the trailer grammar was REQ prose (`:222-231` at `216b65d`) and inherited nothing, but it was also not cited as a normative table a downstream layer transcribes; now it is both cited and unranged. **(c)** §5's own scope line inherits the gap: the in-scope deliverable is "`docs/_constraints/pdlc-consolidation-vocabularies.md` **(§4b's owned rows)**" (`:584-585`), and §4b's owned rows are §1 and §2 — so the two sections this feature authored *this round* are, on the face of §5, not part of the deliverable. Fix, and it is byte-neutral or cheaper, which matters at 344 bytes of headroom (Q-01): replace "§1 and §2" with "§1–§4" (or "every section of that file") in the three places it appears — §4b `:559-566`, the file's change-control paragraph (`pdlc-consolidation-vocabularies.md:16-22`), and §5's parenthetical `:584-585` — and let the set-equality obligation range over the owned sections rather than two of them. If the intent is genuinely that §3/§4 are *narrative* and only §1/§2 are enumerations under an oracle, say that instead: name §3 and §4 as owned-but-not-enumerated, so "unowned" is a decision rather than an omission. Either way the file must not contain a normative section that no document claims. | §4b `:559-568`, §5 `:584-585`, `pdlc-consolidation-vocabularies.md:16-24`, `:99`, `:153` |

## Existing-Code Claim Verification (changed sections)

This round added two `file:line` citations, relocated two blocks of prose into a shared file (new
text wherever it came from), and rewrote the `generated` predicate. All checked in a single pass at
HEAD.

| # | New/changed claim | Where | Verdict | Evidence |
|---|---|---|---|---|
| 1 | The `generated` predicate rewritten as producer-keyed with a cardinality: "at HEAD exactly the **four** tracked outputs of `pdlc/workflows/build-runtime.mjs` (`:465` mints the fourth), all under `pdlc/workflows/dist/`" | AC-5.1 `:362-366` | **Confirmed — count, location and the new anchor all hold** | `git ls-files pdlc/workflows/dist/` returns exactly four paths: `distribution-manifest.json`, `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `pdlc-cli.mjs`. `build-runtime.mjs:465` is `file: "pdlc-cli.mjs",` — the fourth artifact row, and the one the builder itself flags as not derivable by the `.bundle.js` rule the other rows use (`:466-468`). So "mints the fourth" names the right line for the right reason. The counterexample clause is new and correct: "An authored file whose path merely *contains* `dist/` — the `pdlc/workflows/__tests__/fixtures/` copies — is authored and does mint an id"; those four fixture files are tracked and a path glob would have exempted them |
| 2 | `nudge-consolidation.sh:41`'s read of the log is at `:36-37` (both the REQ's copy and the file's) | REQ `:78`, vocabularies `:105` | **Confirmed** | `:36` `with open(log, encoding="utf-8", errors="ignore") as fh:`, `:37` `logtext = fh.read()`. `:41` is still `pending = [p for p in learnings if os.path.basename(p) not in logtext]` — the bare substring test both documents describe |
| 3 | Baseline §4 is the honest limit | REQ `:475` | **Confirmed** | `pdlc-advisory-corpus-baseline.md:55` is `## 4. The honest limit`; §3 (`:39`) is the model ladder, which is what the old citation hit |
| 4 | Relocated §3 (log record grammar + legacy region) is lossless against the REQ text it replaced | vocabularies `:128-151` | **Confirmed — one dropped cross-reference, no dropped content** | Diffed the removed REQ block (`git show 216b65d:…REQ…`) against the new §3 text: the Pass 1 shape ("two-column table of **full paths**", "'Promoted' is only a section heading"), both freeze clauses, the exempt-record enumeration and the passId/timestamp argument all came across. The only loss is a label: the exempt row is now "a `refused` pass's row" where the REQ said "a `refused` pass's AC-7.2 row". Since the REQ still owns AC-7.2 and cites §3 by section, nothing is unresolvable — not raised as a finding. Verified against the log itself: `docs/_decisions/.consolidation-log.md` holds zero `pdlc:consumed` markers (so it is legacy region entire, as §3 says) and names the two full paths at `:16-17` |
| 5 | §4's `SKILL.md:49` anchor for the superseded `{date}`-only proposal name (relocated, now in a new file) | vocabularies `:161` | **Confirmed** | `pdlc/skills/consolidate-learnings/SKILL.md:49` is the line that writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md` |
| 6 | The corpus/enumeration claim the REQ-CONS-01 rewrite reflowed but did not change: 5 files at HEAD, 3 of them hidden by the depth-1 shipped glob | `:101-103`, `:110-117` | **Confirmed, and it is the non-obvious one** | I re-derived it rather than trusting the reflow, because `:101` reads "step 1's enumeration matches 5 files" while the shipped glob at `nudge-consolidation.sh:28` (`glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))`) matches only **2** today. Step 1 resolves it: the corpus is stated as `docs/*/LEARNINGS-*.md` **and** `docs/completed/*/LEARNINGS-*.md`, with the widening named as an in-scope edit to `:28`. Enumerated at HEAD: depth-1 gives `orchestrate-dev-workflow`, `pdlc-advisory-tier`; `docs/completed/*/` gives `pdlc-merge-phase`, `pdlc-review-loop-hardening`, `pdlc-workflow-distribution` — 5 exactly, and the three archived ones are precisely those the REQ names as hidden. `docs/discarded/*/` holds two more (`pdlc-rcv-budget-stop`, `pdlc-review-convergence`), deliberately excluded and correctly not counted. The two "consolidated" names are both in the log's legacy region (`:16-17`). The archive moves are real (`a614f01`, `300af4f`, both `R099`), so the depth-1 bias the REQ describes is a fact about this repo, not a hypothesis |
| 7 | Version pins: vocabularies at 1.3, baseline at 1.0 | REQ `:101`, `:223`, `:449`, `:559`, `:565` | **Confirmed** | `pdlc-consolidation-vocabularies.md` header `Version | 1.3 · 2026-08-06`; `pdlc-advisory-corpus-baseline.md` header `Version | 1.0 · 2026-08-06`. Every REQ citation names the matching number. The vocabularies `Cited by` row was updated in the same commit to list the two new citing sections (`REQ-CONS-01`, `REQ-CONS-03 preamble`, `AC-3.3`) |

No claim added or changed this round is factually wrong about the codebase — the **fourth**
consecutive round with no defect row. F-01 is not a row here: it is about which rows an obligation
ranges over, not about whether a sentence is true.

## Questions

v9's Q-01 is answered by the shape of the fix rather than by a sentence: the ownership route was
taken, not the ids route, which decides that `pdlc-engineering-loop` gets its own section or its own
file rather than interleaving rows — and the file now says so ("a successor feature's vocabulary
belongs in its own section of this file or in its own file",
`pdlc-consolidation-vocabularies.md:18-19`). Q-02's relocation question is answered by what happened:
two more blocks were relocated out (REQ-CONS-01's legacy-region construction, REQ-CONS-03's trailer
grammar) and the round's fixes were paid for out of the space that freed, not out of a reason. Q-03
is answered in the affirmative for the vocabularies file — the change-control paragraph makes the
version pin the maintenance obligation — and the `Cited by` row was in fact updated this round, which
is the behaviour the question asked about. No prior question is left open.

| ID | Question |
|----|---------|
| Q-01 | Not blocking, but it bounds how F-01 lands: the REQ is at **61,096 bytes** against the 61,440-byte hard ceiling (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — **344 bytes** of headroom, 43 fewer than last round, and still above both soft thresholds. F-01's fix as I have written it is byte-neutral or negative (`§1 and §2` → `§1–§4` in three places), so it should not force a relocation. I flag the number only so that the fix is not *expanded* into a paragraph it does not need to be. |
| Q-02 | For F-01, and it decides which of the two fixes is right: are §3 and §4 intended to be *enumerations under the set-equality oracle* (§4's trailer table is one, on its face) or *narrative constraints* that a downstream layer implements but does not transcribe row-for-row? §1 and §2 are unambiguously the former. If §4 is also the former, the range must include it; if it is the latter, saying so explicitly is what turns "unowned" into "owned, not enumerated". |

## Positive Observations

- **The fix took the harder half of the finding — the direction the oracle runs — without being
  asked for it.** My F-01 asked which rows the set-equality obligation ranges over. The revision
  answered that *and* wrote the symmetry: "a value used here with no row there **and** a row there
  naming a value this REQ never uses being equally defects. The symmetry is what makes a *deleted*
  row a breach" (`:566-568`). A one-sided containment check passes when a row is deleted, which is
  precisely the failure a set-equality oracle exists to catch, and nothing in my finding said so. The
  same paragraph appears in the shared file (`pdlc-consolidation-vocabularies.md:19-22`), so a
  successor reading only that file inherits the rule.

- **The version pin turns a shared-file dependency into something a test can transcribe.** "Consumers
  cite this file **at its `Version`**; a row change that is not accompanied by a version bump is
  itself a defect" (`:23-24`), and every one of the REQ's five citations names 1.3 or 1.0 to match.
  That is the mechanism the shipped `pdlc-rcv-baseline.md` family never had, and it is strictly
  better than the fact-id scheme I offered as the alternative: ids pin *which* rows, a version pins
  *which bytes*, and a downstream test needs the second to have a fixed expected value at all.

- **AC-5.3's base case is stated over the reachable state, not the tidy one.** The new clause does
  not say "retire is terminal" and stop; it says terminal is stated over the **proposal**, "since the
  pending case is the reachable one: once a `retire` proposal for an id is on a PR in state open or
  merged, that id's ladder has **ended** — a later `ineffective` tick proposes nothing, records
  `duplicate-suppressed` against that PR, and the AC-7.1 field names `retirement`" (`:423-426`). I
  replayed it against NFR-4 and the vocabularies join: `duplicate-suppressed` may accompany
  `promoted`/`promoted-degraded`/`no-op` (`pdlc-consolidation-vocabularies.md:50`), a pass whose
  every promotion is suppressed is `no-op` (`:65`), and NFR-4's closed-unmerged exclusion means an
  operator rejection reopens the ladder rather than deadlocking it. The displacement clause can no
  longer point back into a spent pair, and the `otherwise` that follows keeps the AC-7.1 field's rule
  total across both cases rather than contradicting it.

- **The relocation was done by the same discipline as last round's, and I could check it the same
  way.** Two more blocks moved into a shared file at round 10, and the only difference I could find
  between the removed REQ prose and the new §3 is a dropped `AC-7.2` label on the exempt-record
  clause — the content, both freeze clauses, the Pass 1 shape and the passId/timestamp argument all
  came across intact. Twice in a row a large move has cost zero rows, which is not the usual outcome
  of moving normative text this late.

- **The `generated` predicate got sharper under a finding that was already resolved.** v9 confirmed
  it; this round rewrote it anyway to be keyed on the producer *by construction* — "*Generated* is a
  predicate, not an example, and is keyed on the **producer**, never on a path glob" — added the
  cardinality (four), the anchor for the non-obvious fourth (`build-runtime.mjs:465`, the row the
  builder itself annotates as underivable from its filename), and wrote the counterexample into the
  REQ: the `__tests__/fixtures/` copies whose paths contain `dist/` are authored and *do* mint an id.
  The observation I recorded in v9's positive notes is now the document's own text, which is where it
  belongs.

## Recommendation

**Needs revision.** 0 High, 1 Medium, 0 Low. All three v9 findings closed, no v9 fix regressed, the
second consecutive relocation verified lossless, and no defect row in the code-claim table for the
fourth consecutive round.

The trajectory: v1→v2 closed 8H, v2→v3 2H+5M, v3→v4 2H+2M+3L, v4→v5 2 of 3, v5→v6 4 of 4, v6→v7 5 of
5, v7→v8 5 of 5 including the High, v8→v9 3 of 3, v9→v10 **3 of 3**. Five consecutive clean sweeps,
and the count fell 1M+2L → 1M. Applying this repo's own harvested convergence heuristic — findings
about *states* versus findings about *strings*
(`docs/discarded/pdlc-review-convergence/LEARNINGS-pdlc-review-convergence.md:32`) — this is the
second consecutive round with zero state defects, and the remaining finding is neither: it is about
the **scope of an obligation**, and it exists only because the round that stated the scope also
created two new sections for it to range over. That is a composition artefact of a single round's
edits, not a gap in the document's argument.

I want to be explicit that I am not manufacturing a finding to avoid approving. The test I applied:
if I imagine this REQ handed to an FSPEC author today, is there a decision they cannot make? Yes,
exactly one — a PROPERTIES author writing the set-equality oracle for §4's trailer table has no
stated range, because §4b's range names §1 and §2 and §4 is neither. That is a decision the REQ owns
(what an enumeration's oracle ranges over is the contract, not a mechanism), and it is the same
decision I raised at Medium in v9 and the author agreed was Medium. Applying the bar consistently
across rounds means it is Medium here too, even though the fix is three token substitutions.

### The stopping rule, applied against itself

§5a routes "cannot be tested as written" and "needs an oracle" findings downstream. F-01 is the
opposite shape — it is *about* an oracle's range, which the REQ has already chosen to state at the
REQ layer (§4b) rather than defer. An FSPEC resolving it would be re-scoping a REQ-level obligation.
It belongs here.

### What must change for approval

1. **F-01** — extend the owned range from two sections to four, in the three places it is stated:
   - §4b `:559-562`: "owns every row of that file's **§1–§4**" (and the interleaving clause likewise);
   - §4b `:565-566`: "set-equality over the rows this REQ owns — **§1–§4 entire** at Version 1.3";
   - §5 `:584-585`: "(§4b's owned rows)" reads correctly once §4b covers all four, so this cell needs
     no separate edit — but check it, because as written today it scopes the deliverable to §1/§2;
   - and the mirror paragraph in `pdlc-consolidation-vocabularies.md:17-19`.

   If the answer to Q-02 is that §3 and §4 are narrative rather than enumerated, then instead say so
   in one clause — "§3 and §4 are owned by this REQ but are not enumerations under the set-equality
   oracle" — which closes the ownership half and makes the oracle half a decision.

This is byte-neutral, so Q-01's 344-byte headroom does not bind it, and no reason needs to be
deleted to pay for it.

## Verdict

VERDICT: Needs revision
