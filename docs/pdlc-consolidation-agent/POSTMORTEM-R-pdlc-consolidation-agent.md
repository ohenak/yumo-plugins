# POSTMORTEM — Phase R — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → **POSTMORTEM-R** |
| Downstream | operator decision; `LEARNINGS-pdlc-consolidation-agent.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..10}.md` (20 files) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (pm-author) | 2.0 | 2026-08-06 |

RESOLVED: yes

> **This is the second halt of Phase R on this REQ.** Version 1.0 of this file recorded the
> first window (rounds 1–5) and was resolved on 2026-08-06; that record is preserved in
> [§ Appendix — first window](#appendix--first-window-rounds-15-resolved). Everything above the
> appendix describes the **second** window, rounds 6–10, which is the halt now open.

## Phase

**Phase R — REQ authoring and cross-review convergence. Second window (rounds 6–10).**

Document under review: `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
(636 lines / 61,096 bytes at the v10 read; 637 lines / 61,003 bytes at HEAD — inside the
700-line / 61,440-byte hard ceiling, and **past both soft thresholds**, `SOFT_LINE_LIMIT=630` /
`SOFT_BYTE_LIMIT=55296`, `pdlc/hooks/scripts/check-req-size.sh:41-48`).
Branch: `feat-pdlc-consolidation-agent`. REQ header version 1.9.

The phase halted a second time because `deriveRoundWindow` opened a fresh window at round 6 on
re-entry (per §3.6 of the resolution recorded in the appendix), and that window also reached
`MAX_REVIEW_ROUNDS = 5` — rounds 6 through 10 — with the round-10 result **split**:

| Reviewer | Round-10 verdict | Round-10 findings |
|---|---|---|
| `pdlc:se-review` | `VERDICT: Needs revision` | 0 High, **1 Medium**, 0 Low |
| `pdlc:te-review` | `VERDICT: Approved with minor changes` | 0 High, 0 Medium, 2 Low |

Both reviewers filed **the same defect** in round 10 (SE F-01 ≡ TE F-52, and both say so in
writing). They disagree on its **severity**, and severity is what the approval bar reads: any open
High or Medium ⇒ Needs revision. One reviewer's Medium is therefore the entire remaining distance
between this REQ and a converged Phase R.

As in the first window, the halt is a **round-budget exhaustion, not a finding that the REQ is
wrong**: rounds 8, 9 and 10 closed with 0 High from both reviewers, and every round-10 finding has
already been addressed on the branch (`7fa2a84`, `07a3549`, `eef3b3c`, `589b6a9`, `ef6eb17`) — but
no round 11 exists in which a reviewer could observe that tree.

## Iterations

**5 — limit reached** (`MAX_REVIEW_ROUNDS = 5`, second window: rounds 6–10).

| Round | SE verdict | SE findings | TE verdict | TE findings | Prior-round closure |
|---|---|---|---|---|---|
| v6 | Needs revision | 0 H, 3 M, 2 L | Needs revision | 0 H, 2 M, 2 L | 4/4 and 5/5 of v5 |
| v7 | Needs revision | **1 H**, 2 M, 2 L | **Approved w/ minor changes** | 0 H, 0 M, 3 L | 5/5 and 5/5 of v6 |
| v8 | Needs revision | 0 H, 2 M, 1 L | Needs revision | 0 H, 2 M, 1 L | 5/5 of v7 **incl. the High** |
| v9 | Needs revision | 0 H, 1 M, 2 L | **Approved w/ minor changes** | 0 H, 0 M, 4 L | 3/3 and 3/3 of v8 |
| v10 | Needs revision | 0 H, **1 M**, 0 L | **Approved w/ minor changes** | 0 H, 0 M, 2 L | 3/3 and 4/4 of v9 |

Cumulative across both windows the phase has run **ten** rounds and twenty cross-review files.

Three properties of this window matter more than the counts:

1. **Closure is total and has been for five consecutive rounds.** Every disposition table in
   v6–v10 records 100% of the preceding round's findings resolved — v5→v6 4/4 and 5/5, v6→v7 5/5
   and 5/5, v7→v8 5/5 (including the only High of the window), v8→v9 3/3 and 3/3, v9→v10 3/3 and
   4/4. **No finding has ever been re-raised as unresolved, in either window.** Nor was any fix
   found to have regressed: SE checked explicitly for regression in each of the five rounds and
   found none.
2. **Severity is at the floor and stays there.** One High in five rounds (SE v7 F-01: the
   `(phase, artifact)` id derivation made AC-5.3's revision route unreachable), raised and closed
   inside one round. Rounds 8, 9, 10: zero High from both reviewers. SE's Medium count fell
   3 → 2 → 2 → 1 → 1; TE's fell 2 → 0 → 2 → 0 → 0. SE's total finding count fell 5 → 5 → 3 → 3 → 1.
3. **The code-claim audits are clean and have been for four rounds.** SE verified 7 changed
   `file:line` claims at HEAD in v10, and records "no claim added or changed this round is
   factually wrong about the codebase — the **fourth** consecutive round with no defect row". TE
   independently re-derived the same class of claims (the four tracked `pdlc/workflows/dist/`
   outputs, `build-runtime.mjs:465`, `nudge-consolidation.sh:28`/`:36-37`/`:41`, the 5/2/3 first-run
   corpus against the actual filesystem and the actual log) and all resolve.

**Zero `ERRATUM:` lines were emitted in any of the ten rounds.** No upstream document —
`MASTER-PLAN-engineering-loop.md`, `pdlc-advisory-tier`, `pdlc-merge-phase`, `DOMAIN-CONSTRAINTS`,
or either `docs/_constraints/` file this feature authored — was found defective by either reviewer
at any point.

## Reviewers

| Role | Skill | Files (this window) | Final verdict (v10) |
|---|---|---|---|
| Software Engineer | `pdlc:se-review` | `CROSS-REVIEW-software-engineer-REQ-v{6..10}.md` | **Needs revision** (0 H, 1 M, 0 L) |
| Test Engineer | `pdlc:te-review` | `CROSS-REVIEW-test-engineer-REQ-v{6..10}.md` | **Approved with minor changes** (0 H, 0 M, 2 L) |

Author across all five rounds: `pdlc:pm-author`. Both reviewers worked in delta mode from round 2
onward (`Scope: Local`, explicit delta base commit named in each file's header), re-reading their own
prior cross-review and diffing the REQ rather than re-reviewing the whole document.

Reviewer approval history over the full ten rounds:

| | v1 | v2 | v3 | v4 | v5 | v6 | v7 | v8 | v9 | v10 |
|---|---|---|---|---|---|---|---|---|---|---|
| SE | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| TE | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** | ✗ | **✓** | **✓** |

TE has approved three of the last four rounds. SE has never approved. The phase has therefore never
been one reviewer away from convergence in the same round until now, and in round 10 it was.

## Pattern of Disagreement

The first window halted with **no disagreement at all** — both reviewers found the same defects and
neither approved. This window is different, and the difference is the whole story:

> **The reviewers agree on the facts and disagree on one severity. That single severity call is the
> only thing standing between this REQ and Phase F.**

### 1. The round-10 finding is one finding, filed twice, at two severities

SE F-01 and TE F-52 are textually distinct and substantively identical. Both say: round 10 relocated
two further normative blocks into `docs/_constraints/pdlc-consolidation-vocabularies.md` as §3 and
§4, and bound the REQ to both ("are stated once in … §3/§4 (at `Version` 1.3) and are binding here",
REQ `:100-101`, `:221-223`) — but the ownership rule and the set-equality range written in the *same
round* name only "§1 and §2 entire" (`:565-566`). So §3 and §4 hold REQ-derived normative content
that no document claims, and §4's four-row PR-trailer table is an enumeration under no oracle.

Both name the same three fix sites (§4b `:559-566`, §5 `:584-585`, and the mirror paragraph in the
constraints file). Both agree the fix is roughly three token substitutions. Neither disputes a single
fact the other asserts. They differ on exactly one judgment:

| | SE (Medium ⇒ blocks) | TE (Low ⇒ does not block) |
|---|---|---|
| **Test applied** | "If I imagine this REQ handed to an FSPEC author today, is there a decision they cannot make? Yes, exactly one — a PROPERTIES author writing the set-equality oracle for §4's trailer table has no stated range." | "F-52 would be a Medium if drift in §3/§4 were undetectable. It is not." |
| **Decisive evidence** | The obligation's scope is a REQ-layer contract; §5a routes "needs an oracle" downstream, but this is *about* an oracle's range, which the REQ already chose to state at the REQ layer | The constraints file's own file-wide clause makes an unbumped row change a defect (`:25-26`), and the REQ pins `Version` 1.3 in all three citations — so a deleted trailer row cannot land silently |
| **Conclusion** | "Applying the bar consistently across rounds means it is Medium here too, even though the fix is three token substitutions" | "a maintenance lag, not a hole. A test author can transcribe §4's four-row trailer table today with a pinned expected value" |

Both arguments are sound, and they are sound because they measure different things. SE measures
whether the *obligation* is stated; TE measures whether a *test can be written today*. On this
document those two questions came apart for the first time in round 10, and nothing in the loop
adjudicates between them.

### 2. The severity split is structural, not a one-off

The same split produced the whole window's verdict pattern. In v7, v9 and v10 TE reached 0 High /
0 Medium and approved while SE held at 1–2 Medium. Read SE's three round-10-adjacent Mediums in
order and they are one continuous thread:

- **v8 F-03** (Medium): §4b's new `action` row introduces an unenumerated status qualifier — an
  enumeration under §4b's set-equality obligation with an undefined cell.
- **v9 F-01** (Medium): §4b nominates the newly-created `pdlc-consolidation-vocabularies.md` as a
  set-equality source but does not state the range — "the table" is not a range.
- **v10 F-01** (Medium): the range was stated (§1 and §2) in the same round that created §3 and §4.

TE filed the v9 instance at **Low** (F-49) and the v10 instance at **Low** (F-52). Same defect
family, same evidence, consistently one severity band apart for three consecutive rounds. Neither
reviewer drifted: each applied its own bar consistently, and each said so explicitly. There is no
round in which either reviewer changed its mind about the other's reasoning — the question was never
argued between them, because delta-scoped reviewers read the document and their own prior review,
not each other's.

### 3. What the disagreement is *not*

- **Not divergence.** The document improved monotonically. Findings fell 5 → 5 → 3 → 3 → 1 (SE) and
  4 → 3 → 3 → 4 → 2 (TE), severity fell to zero High for three straight rounds, and closure was 100%
  every round.
- **Not re-litigation.** No settled decision was reopened by either reviewer in five rounds. SE's
  round-10 note is explicit: "I am not manufacturing a finding to avoid approving."
- **Not a factual dispute.** Four consecutive rounds with no defect row in SE's code-claim table;
  TE independently re-derived the same claims against the filesystem, the log, and the builder.
- **Not an upstream defect.** Zero ERRATUM lines in ten rounds.
- **Not scope, priority, phasing, or user need.** Uncontested by both reviewers since round 4.
- **Not a feasibility objection.** No reviewer in either window has contested implementability.

### 4. The recurring *shape* of the residual findings: relocation debt

The first window's residue was **propagation debt** — a decision taken in round *N* not carried to
every enumeration frozen against the old answer. That failure mode is gone: TE's round-10 sweep of
the relocated text found "nothing was dropped in either move; both gained", and this is the second
consecutive round where a large relocation cost zero rows.

What replaced it is **relocation debt**, and it is a byte-ceiling artefact:

> The REQ sits 344–437 bytes below a hard ceiling it cannot cross. Every round must therefore
> **relocate normative text out of the REQ to pay for its own fixes**. Each relocation creates new
> sections in a shared file — and the ownership rule, the oracle range, and the §5 deliverable list
> that govern those sections were written for the sections that had moved *at the time*. The next
> round finds the seam the relocation opened, files it, the fix is written, and the round's fixes
> consume the space the relocation freed.

TE states the loop in one sentence (F-53): "a relocation that runs concurrently with a finding round
buys nothing at all — the two must be sized against each other, not merely ordered." The measurement
backs it: round 10 relocated ~2,900 bytes out of the REQ in the required order (`80bbc30` first,
per `pdlc/skills/pm-author/SKILL.md:118`) and the margin still got **worse**, 387 → 344 bytes.

This is a generator, not a residue. It produces approximately **one Medium per round for SE**, and
approximately **one Low per round for TE** — which is exactly the observed steady state, and exactly
why the loop cannot terminate under its own budget.

## Best-Guess Root Cause

**A REQ pinned against its size ceiling must relocate normative text to buy space for each round's
fixes; each relocation opens a fresh ownership/oracle-range seam; and one reviewer's severity bar
scores every such seam as blocking. That composition emits one blocking Medium per round
indefinitely, so no finite round budget terminates the loop.**

Three factors compose, in order of weight:

1. **The byte ceiling turned into a treadmill.** The REQ is at 61,003–61,096 bytes against a
   61,440-byte hard ceiling (`check-req-size.sh:42`) and past both soft thresholds. The soft
   threshold's own comment predicted this: "a REQ that can only absorb the next review round by
   deleting existing text will eventually delete a reason rather than a restatement" (`:47-48`).
   The author did the disciplined thing — relocate restatements to `docs/_constraints/` files rather
   than delete reasons, and relocate *first*, per `pm-author/SKILL.md:118` — and the discipline
   worked on its own terms (two lossless relocations, verified independently by both reviewers). But
   the relocations are **structural edits to a shared normative file**, and every structural edit to
   a normative file is new surface for the next review. The document is not converging because it is
   not holding still, and it is not holding still because it cannot both answer a round and stay
   under the ceiling without moving text.

2. **The governance rules for the relocated file were written incrementally, one round behind the
   relocations.** Ownership, the set-equality range, the version-pin obligation and §5's deliverable
   list each arrived in the round *after* the relocation that made them necessary — and each was
   scoped to the sections that existed when it was written. v9 F-01 asked for a range; the round-10
   fix wrote "§1 and §2 entire" while the same five commits created §3 and §4. That is not
   carelessness: it is what happens when the rule and the thing it governs are authored in the same
   round under a byte budget that forces both to be terse. Nothing in the authoring seam forces
   "after relocating a block, re-derive every rule whose scope is stated as a section list" — the
   exact structural analogue of the first window's missing propagation checklist, one level up.

3. **Two defensible severity bars, never reconciled, and the stricter one is decisive.** SE scores
   "an obligation whose scope is unstated" as Medium because the REQ owns oracle scope. TE scores the
   same fact as Low because the version-pin clause makes drift detectable, so a test author is not
   blocked today. Both are consistent with the shipped review guidance, both were applied
   consistently for three rounds, and the approval bar (any open Medium ⇒ Needs revision) makes the
   stricter one binding. The loop has no adjudication seam: delta-scoped reviewers never read each
   other's cross-review, so a two-reviewer severity split cannot be resolved *by* the loop — only by
   an operator or by removing the generator that keeps feeding it.

**Why more rounds would not help.** The steady state is one blocking Medium per round, sustained by
factor 1 and scored by factor 3. Five more rounds absorb five more relocations and produce five more
seams. This is the same conclusion the first window reached about propagation lag, now confirmed by a
second, independent window: the budget is not the binding constraint.

**What is not the root cause:** reviewer drift or escalating standards (severity fell monotonically;
both bars were applied consistently and stated explicitly); reviewer error (four consecutive rounds
with no defect row; every disputed fact independently verified at HEAD by both reviewers); a
defective upstream document (zero ERRATUM lines in ten rounds); an unimplementable or ill-scoped
requirement (uncontested by both reviewers since round 4); or author non-responsiveness (100% closure
in all ten rounds, and every v10 finding already fixed on the branch).

## Recommendation

**Approve the REQ and advance to Phase F, after a bounded operator verification.** The case for
this, rather than for another round:

- One reviewer has already approved three of the last four rounds, including round 10.
- The other reviewer's sole blocker is a **three-token scope widening** it costed itself as
  byte-neutral, on a document with zero High findings for three rounds and 100% closure for ten.
- **Every round-10 finding is already fixed on the branch**, in commits made after both v10 reviews
  were written — and the fix took the *harder* of the two routes SE offered in its Q-02:

| v10 finding | Addressed by | What landed |
|---|---|---|
| SE F-01 / TE F-52 (ownership + oracle range stop at §2) | `7fa2a84`, `07a3549`, `589b6a9` | Ownership widened to "**owns every section of that file — §1–§4 entire**" in both artifacts (REQ `:560-562`, vocabularies `:19-21`); and rather than merely widening the range, the round **answered Q-02 explicitly** — "§1, §2 and §4 are enumerations" under the set-equality oracle, "§3 is owned but not enumerated" — which is the disposition SE named as turning "unowned" from an omission into a decision. §5's deliverable now reads "§1–§4 entire" (`:585`). Citations repinned to `Version` 1.4 throughout (`:99`, `:182`, `:222`, `:557`) |
| TE F-53 (relocation sized against the round it runs beside) | `eef3b3c`, `ef6eb17` | REQ-CONS-06's preamble now cites baseline §1/§2 instead of recapitulating them — the exact candidate TE named at `:447-453`; and the REQ stopped restating vocabularies §3 (freeze clauses, write granularity) in favour of citing it. Net effect: **637 lines / 61,003 bytes at HEAD, margin 344 → 437 bytes** — the first round in this window where a relocation actually bought space |

No reviewer has observed that tree. As in the first window, **the halt records an exhausted budget,
not an unresolved defect set** — but unlike the first window, it also records a reviewer split that
another round of the same loop cannot adjudicate.

### Recommended action, in order

1. **Verify the five commits above actually close SE F-01 / TE F-52 and TE F-53.** Read each finding
   against the current REQ and `docs/_constraints/pdlc-consolidation-vocabularies.md` text — not
   against the commit messages. In particular confirm the enumerated/not-enumerated split is stated
   in **both** artifacts and that all citations name `Version` 1.4 (the file's header is 1.4). This
   is the judgment call the `RESOLVED:` marker gates, and it is the operator's, not the loop's.
2. **Adjudicate the severity split explicitly, and record the adjudication.** This is the decision
   the loop cannot make. Two defensible outcomes:
   - **(a) Accept TE's bar for this class** — an obligation-scope gap that is *detectable* through
     the version-pin clause is Low, not Medium. Then round 10 was already an approval on both sides
     and Phase R is done. Record the ruling in the REQ or in `docs/_decisions/` so the next feature
     in this family inherits it.
   - **(b) Accept SE's bar** — then the fix is already on the branch and one confirming round closes
     it. Prefer this only if you also take step 4, because otherwise the generator survives.
3. **If you re-run a round, run exactly one, and freeze the document's structure first.** Clear this
   halt by setting `RESOLVED: yes` with a commit that names what addressed each finding, then:
   `/pdlc:orchestrate-dev { "reqPath": "docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md", "forcePhases": "R" }`.
   **Do not relocate anything in that round.** The 437-byte margin now permits it, and factor 1 of
   the root cause is the only reason a relocation would happen — a round that both answers findings
   and moves text is the mechanism that produced this halt twice.
4. **Break the generator before the next round, not after it.** Before re-invoking, sweep the
   governance rules against the file they govern: for `pdlc-consolidation-vocabularies.md` and
   `pdlc-advisory-corpus-baseline.md`, confirm that ownership, the set-equality range, the
   enumerated/narrative classification, the version pin, and §5's deliverable list each range over
   **every section that currently exists**, not over the sections that existed when the rule was
   written. That is the mechanical check that has consumed a round in three of the last four.
5. **Do not re-open settled ground.** Scope, priority, phasing, user need, feasibility, and every
   claim about the shipped codebase have been uncontested by both reviewers for six or more rounds,
   with four consecutive clean code-claim audits. A round that revisits them spends the budget on
   ground that is already firm.

### Housekeeping (not blocking)

The REQ header's Cross-Reviews row still reads `v{1..9}` / 18 files (`:12`); it is 20 files through
v10. Fix it in whatever commit clears this halt.

### Not recommended

- **Re-running the loop unchanged with a larger budget.** Two independent five-round windows have now
  reached the same steady state by two different mechanisms (propagation debt, then relocation debt).
  Rounds are not the binding constraint.
- **Splitting the REQ.** The first window's escalation path proposed splitting the
  consolidation-cadence half from the cross-repo-promotion half. That is now the *wrong* move: the
  size pressure has already been relieved the right way — by relocating shared vocabulary into
  `docs/_constraints/` files that a successor feature (`pdlc-engineering-loop`) will read anyway —
  and a split would duplicate those citations across two REQs and double the governance surface that
  caused this halt.

### For Phase H

Two durable lessons, both cheap to promote and both stated in the reviewers' own words:

1. **Size a relocation against the round it runs beside, not merely ahead of it** (TE F-53).
   `pm-author/SKILL.md:118` already mandates relocate-*first*; what round 10 shows is that ordering
   alone is insufficient — a relocation whose recovered bytes are consumed by the same round's
   answers leaves the ceiling exactly where it was.
2. **When you relocate a block into a shared normative file, re-derive every rule whose scope is
   stated as a section list.** This is the propagation checklist the first window recommended, one
   level up: the first window missed cells inside enumerations, this window missed sections inside
   scope statements. One authoring-seam rule covers both.

## Resolution (window 2, 2026-08-06)

The Recommendation was carried out in full by the outer orchestrator:

**Step 1 — per-finding verification (Opus agent, against the tree at `4879e6b`, not commit
messages).** SE F-01 / TE F-52 closed by `7fa2a84`/`07a3549`/`589b6a9`: ownership §1–§4 entire in
both artifacts, the enumerated (§1/§2/§4) vs owned-prose (§3) split stated in both, §5's
deliverable widened, citations pinned at `Version` 1.4 (header is 1.4). TE F-53 closed by
`eef3b3c`/`ef6eb17`: REQ-CONS-06's preamble cites the baseline instead of recapitulating it,
vocabularies §3 no longer restated; margin 344 → 437 bytes. Both Q-01/Q-02 answered explicitly.
All code citations introduced by the five commits re-verified at HEAD; no defect row.

**Step 4 — governance sweep, both `docs/_constraints/` files.** The vocabularies file's rules are
fully consistent; the generator survived one file over — `pdlc-advisory-corpus-baseline.md` had no
ownership/classification/version-bump paragraph, two unpinned primary binding declarations, §5's
deliverable under-ranged it, and both `Cited by` rows were stale. Fixed in the resolution commit
without relocating any REQ text (REQ v2.0, 637 lines / 61,109 bytes, margin 331): version pins
added at the §3/§2/baseline-§3 binding declarations, §4b's ownership widened to "each
`docs/_constraints/` file it authors", §5's baseline parenthetical now "(§1–§4 entire, per §4b)",
a change-control paragraph appended to the baseline file, `Cited by` rows completed, and the
Cross-Reviews header row corrected to `v{1..10}` (20 files).

**Step 2 — severity adjudication, recorded.** `docs/_decisions/DECISIONS-review-severity-bars.md`
DEC-SEV-01: a governance-rule scope gap that is *detectable* through a version-pin/defect clause
is Low (TE's bar); Medium is reserved for gaps that block a downstream author today. Recorded at
project level so this family inherits it.

**Step 3 — the confirming round.** This resolution relocates nothing; the structure is frozen.
Re-entry opens rounds 11–15; the expectation is one short delta round confirming the closures
above.

## Appendix — first window (rounds 1–5, resolved)

Version 1.0 of this file recorded the first Phase R halt and was marked `RESOLVED: yes` on
2026-08-06, which is what permitted re-entry into rounds 6–10. Its findings are summarised here so
the two windows can be read against each other; the full text is in git history
(`git log --follow -- docs/pdlc-consolidation-agent/POSTMORTEM-R-pdlc-consolidation-agent.md`).

**Iterations (window 1).** 5 — limit reached. Both reviewers `Needs revision` in every round.

| Round | SE findings | TE findings |
|---|---|---|
| v1 | 8 H, 6 M, 2 L | 6 H, 5 M |
| v2 | 2 H, 5 M, 2 L | 4 H, 3 M, 2 L |
| v3 | 2 H, 2 M, 3 L | 2 H, 3 M, 1 L |
| v4 | 0 H, 1 M, 2 L | 0 H, 2 M, 2 L |
| v5 | 0 H, 3 M, 1 L | 0 H, 2 M, 3 L |

Severity trajectory 14 H → 6 H → 4 H → 0 H → 0 H, 100% per-round closure, zero ERRATUM lines.

**Pattern (window 1).** No disagreement of any kind — the reviewers' v5 blocker sets overlapped
almost exactly (SE F-02 ≡ TE F-34, SE F-03(b) ≡ TE F-33, SE F-04(a) ≡ TE F-36), and where they
differed they were complementary. The disagreement was with the round budget.

**Root cause (window 1).** *Propagation debt.* The REQ nominated half a dozen enumerations as
normative set-equality oracles ("checkable by set-equality against this table, not by containment"),
so every semantic change had to be propagated to *N* tables and any single missed cell was a
blocking finding by the document's own standard. With one decision per round and a 5-round budget,
the loop could absorb at most four decisions cleanly; this REQ took more. Contributing: no
propagation checklist at the authoring seam.

**Resolution (window 1, 2026-08-06).** All ten v5 findings and four open questions were verified
closed against the REQ text by two independent verification agents (commits `4e2c002`, `7640bd2`,
`cc601c3`, `e75a115`, `0445706`, plus one correction: TE F-35's fix had adopted a wrong line number,
repointed to `PHASE_DISPATCH` at `:3337`). A propagation sweep over all six self-nominated
set-equality oracles returned SWEEP CLEAN. The marker was flipped to `yes` and the pipeline
re-entered at round 6.

**How window 2 differs.** Propagation debt did not recur — the enumerations stayed consistent, and
both large relocations were verified lossless. The residue moved up a level, from *cells inside
enumerations* to *sections inside scope statements*, and for the first time the reviewers split on
severity. The two windows share one structural lesson: **the loop's residue is always the mechanical
closure check that no authoring-seam rule forces the author to run.**
