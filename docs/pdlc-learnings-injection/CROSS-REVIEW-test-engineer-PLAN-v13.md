# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.1)
**Date:** 2026-08-21
**Iteration:** 13 (delta re-review under DECISION FREEZE)

## Overview

**What this round is.** A delta re-review under DECISION FREEZE, not a fresh read. I approved this
PLAN at v0.5 (round 8), v0.6 (round 9), v0.7 (round 10), confirmed v0.8 (round 11) and v0.9
(round 12, three Low findings, no High). Since the commit I last reviewed (`ba120270`) the document
has moved to **v1.1** across six commits: one substantive addition (DoD 14, at v1.0) and four
targeted edits applying round-11 findings — mine and pm-review's — to P-A-7's case headers and to
P-A-6.

**The delta, measured.** `git diff ba120270 -- …/PLAN-…md` is **8 insertions, 5 deletions in one
file**. I re-derived the scope from the diff rather than from the changelog's account of itself:
the version cell (0.9 → 1.1), P-A-7's case A / B / C rows, the new DoD clause 14, P-A-6's answer
cell, and two changelog rows. **No task row moved batch, no `Deps` edge changed, no AT partition,
fixture or single-writer manifest row was touched, and the batches 7–13 expected-red ledger is
byte-identical** (lines 467–476 of the current file are unchanged by the diff). The v1.0 and v1.1
changelog rows each claim exactly that, and both claims are accurate against the diff.

**My two open findings from round 12 are resolved; one is not.**

- **F-02 (batch 13 claimed by no case header) — resolved.** Case C's domain now reads *"batch 13 or
  later, the case that is live at HEAD"* with the *When* cell stating the domain **by batch number
  rather than by LI-21's commit**, and saying why: "so that no batch falls between case B's upper
  bound (12) and this case". The tiling is now closed on both ends — case A covers "before batch 9
  (which includes batches 7 and 8)", B covers 9–12, C covers 13 and later.
- **F-03 (P-A-6's foreclosed fallback) — resolved.** P-A-6 no longer offers case B's
  amend-into-the-ledger-by-name route unconditionally; it routes to "**P-A-7's governing case** —
  which at HEAD is case C, where no ledger remains to amend into and the obligation is
  green-at-landing", and names case B's closure at batch 12.
- **F-01 (the v0.7 changelog row's stale `renderSection` claim) — still open, unedited.** The row
  still reads "`renderSection` already carries unexercised `ordinal`, `gloss` and `body` knobs" in
  the present tense, which the 0.9 row and LI-08's note both now correct. Carried forward below as
  Low, unchanged in severity: it is a historical-record row, and a reader who reads forward reaches
  the right fact.

**What the delta newly introduces.** DoD 14 is the only substantive addition, and it is a
**disclosure clause, not a new obligation**: it names four POSTMORTEM-D remediations riding on this
branch, names the test that owns each, and explicitly declines to widen the DoD ("clauses 1–13
remain the injection region's bar"). Every one of its four factual claims about HEAD is checkable,
and I checked all four (see §Verification). All four hold.

**One new Low, and it is not this delta's doing.** Upstream moved while this round was in flight —
REQ to v0.10, FSPEC to v0.14, DECISIONS to v0.5 — and this PLAN's header still pins REQ v0.9 /
FSPEC v0.13 / DECISIONS v0.3. TSPEC and DECISIONS have both already re-pinned. The substance the
PLAN cites is unaffected (see §Dependencies), so this is a pin refresh, not a cascade.

**Result. No High finding, old or new.** Two Low: the carried v0.7 changelog row, and the stale
upstream pins.

## Batches

**No task row changed, so the batch DAG is out of scope by measurement rather than by assertion.**
The diff touches P-A-7's three case rows, DoD 14, P-A-6 and two changelog rows — none of them a
task row. All twenty-two `LI-*` rows keep their `Batch` value, their `Deps` cell, their
file-ownership cell and their `Status` cell byte-for-byte; the `[Fake first]` labelling on LI-02,
LI-06 and LI-23, the red-before-green pairing, and the single-writer file manifest are unchanged
from the v0.9 bytes I confirmed at round 12. I re-ran the batch-derivation only far enough to
confirm the diff could not have perturbed it, and it could not: not one `|` cell inside the task
table is on either side of the diff.

**The expected-red ledger, my lens's primary gate input, is byte-identical.** Rows for batches 7
through 13 are unchanged: batch 7 → seven whole suites red; batch 8 → `learningsSelect` narrowed to
`LI-AT-15` only; batch 9 → `learningsBlock` dropped entire; batch 11 → `learningsRecord` narrowed
to `LI-AT-22`'s locus-2 assertion; batch 12 → `learningsDispatchSet` narrowed to `LI-AT-23`,
`LI-AT-24`, `LI-AT-31`; batch 13 → **nothing**. The three load-bearing properties stated beneath it
(stated in test names not suite names, shrinking by exactly what the batch's task claims to green,
empty at batch 13) are likewise untouched.

**Case A's new *When* cell, checked against that ledger rather than against its own prose.** The
cell now reads *"before batch 9 (which includes batches 7 and 8)"* where v0.9 read *"before batch
7"*. The claim it rests on — that batches 7 and 8 are "exactly the ones whose ledger already lists
`learningsBlock` as a whole-suite red" — is true at the table: the batch-7 row lists
`learningsBlock` among seven whole suites, the batch-8 row lists it among six, and the batch-9 row
drops it. So a heading-form amendment landing during batch 7 or 8 is already covered by an existing
whole-suite red row and owes no new row, which is exactly what case A's Effect cell concludes. The
widened header does not change the outcome for any batch; it changes which clause **states** the
outcome, moving batches 7–8 from a derivation buried in the Effect cell to the header itself. That
is a strict improvement in a rule table a dispatcher reads by header.

**No overlap was created at the seam.** Case A now ends at "before batch 9" and case B opens at
batch 9; case B's title conjunct ("after LI-17 has greened the suite") is consistent with the
ledger, since LI-17 is the batch-9 task that drops `learningsBlock` from the ledger entire. A and B
are disjoint, B and C are disjoint at 12/13, and every batch from 1 to 14 is now claimed by exactly
one case.

**DoD 14 adds no task row and no test obligation.** I checked this specifically, because a DoD
clause that names four pieces of shipped work is one edit away from becoming an implicit
twenty-third task. It does not: the clause says in terms that the four remediations are "not owned
by an `LI-*` task row", are "process repairs, not feature work", "carry their own tests, named
above", and that "clauses 1–13 remain the injection region's bar". The file-ownership manifest is
unchanged, so no new file enters the single-writer contract, and no batch acquires a new gate.

## Dependencies

**No `Deps` edge changed.** The dependency graph is byte-identical to v0.9: same edges, same
acyclicity, same unique ids, every dependency resolving to a declared task. Nothing in this delta
could have moved it, and the diff confirms nothing did.

**Upstream moved — and I checked whether it moved under this document.** This is the one thing this
round had to establish that last round did not, because at round 12 the four upstream hashes were
byte-identical to the dispatch pins and this round they are not. Re-hashed at HEAD:

| Document | Hash at round 12 | Hash now | Version cell now | PLAN's header pin |
|---|---|---|---|---|
| REQ | `ff605dd3…` | `32cb8b7d…` | **0.10** | v0.9 |
| FSPEC | `ae75fa62…` | `ef230199…` | **0.14** | v0.13 |
| TSPEC | `22dee8ce…` | `1ddfdbc3…` | 0.9 (unchanged) | v0.9 ✅ |
| DECISIONS | `56617f5a…` | `87ec8ebc…` | **0.5** | v0.3 |

**What actually changed upstream, and whether it contradicts anything here.** The REQ delta is
seven lines: AC-2.4 gains an attribution clause making the report's exclusion reason
**cause-defined** — a document the count bound (AC-2.2) already cut is reported under that cause
even when the total bound also failed, "and only documents this bound drops are reported under it".
FSPEC v0.14 carries the matching `BR-6` restatement and names `AT-13` as the test that exercises
it. TSPEC's delta is **one line** — its upstream pin, refreshed to REQ v0.10 / FSPEC v0.14, with
its own version cell still 0.9, so this PLAN's "TSPEC v0.9" pin is still exactly right. DECISIONS
v0.5 rewrites `DEC-LI-08`'s framing literals and states in terms that "Both moved since round 6
without touching anything decided here".

I traced the one behavioural change into this PLAN's own tables. The fail-open arm inventory rows
read `count bound ⇒ RSN-COUNT | AT-08, AT-13, COUNT-BINDING | LI-07 / LI-16` and `byte bound ⇒
RSN-BYTES | AT-07, BYTES-BINDING | LI-07 / LI-16`. Those rows are **cause-keyed already** — each
names the bound that removes the document and the reason id it carries — so FSPEC v0.14's
clarification confirms them rather than contradicting them, and the AT it names (`AT-13`) is
already assigned here to the `RSN-COUNT` arm and owned by LI-07 (red) / LI-16 (green). LI-07's task
cell likewise already names the `COUNT-BINDING` case as "exactly 3 documents contribute and exactly
5 carry `RSN-COUNT`", which is the cause-defined reading. **No task row, no AT assignment and no
ledger row is falsified by the upstream move.** What is stale is the header's three version
numerals and the line-36 sentence "Behaviour lives in REQ v0.9 / FSPEC v0.13 / TSPEC v0.9". That is
a pin refresh, filed Low below — under freeze it is not a blocking finding, because it falsifies no
load-bearing claim: this PLAN references upstream **by id**, the ids it references are unchanged,
and the sibling documents that did re-pin (TSPEC, DECISIONS) both record that the move touched
nothing decided.

**The P-A-7 → P-A-6 dependency, re-checked as a gate input.** P-A-6 now defers to "P-A-7's
governing case" instead of naming case B's mechanism directly. That makes P-A-6's answer a
**pointer** rather than a restatement, which is the right shape: one rule, one place, and the
pointer cannot go stale when the governing case changes. The clause it replaced could — it named
the ledger-amendment route unconditionally, and that route is foreclosed at HEAD. P-A-6 still
resolves to a concrete instruction for an implementer standing at HEAD, because it names the live
case inline ("which at HEAD is case C") and states the obligation it carries (green-at-landing).
Nothing downstream of P-A-6 changed: it still ends "No task row in this PLAN owns either", so Phase
P's suite remains outside the ledger's universe exactly as P-A-3 rules.

## Verification

**How I verified this round, command by command.** Nothing below is taken from the changelog's
account of itself.

| Check | Command / artefact | Result |
|---|---|---|
| Delta is as described | `git diff ba120270 -- …/PLAN-…md` | 8 insertions, 5 deletions, one file: version cell, P-A-7 cases A/B/C, new DoD 14, P-A-6, two changelog rows |
| Ledger untouched | diff over the batches 7–13 table | Byte-identical; no row on either side of the diff |
| Task table untouched | diff over the twenty-two `LI-*` rows | Byte-identical — no `Batch`, `Deps`, file or `Status` cell changed |
| Case A's premise | ledger rows for batches 7, 8, 9 | `learningsBlock` red whole after 7 and after 8, dropped entire at 9 — the header's "includes batches 7 and 8" is true |
| Upstream state | `shasum -a 256` on REQ/FSPEC/TSPEC/DECISIONS | All four differ from round 12; REQ→v0.10, FSPEC→v0.14, DECISIONS→v0.5, TSPEC still v0.9 |
| Upstream change is non-contradicting | `git diff ba120270` on REQ/FSPEC | AC-2.4 / `BR-6` attribution made cause-defined, `AT-13` named; PLAN's arm rows are cause-keyed already |
| DoD 14 (a) — restatement retry | `erratumProtocol.test.js` `RT-1g-a`…`RT-1g-e` (lines 1384, 1425, 1452, 1466, 1495); `orchestrate-dev.js:14873` "one restatement retry before fail-closed" | Present, five named tests, production site inside `erratumRound` |
| DoD 14 (b) — `findingGrammarClause()` | `pdlc/workflows/orchestrate-dev.js:11032` (definition), callers at 10971, 11004, 11110 | Present, three call sites |
| DoD 14 (c) — the hook | `pdlc/hooks/scripts/check-finding-grammar.sh` exists; registered in `pdlc/hooks/hooks.json` as the third `PostToolUse: Write\|Edit` command | Registered, not merely present |
| DoD 14 (c) — its tests | `hookCompatibility.test.js:490` `describe("CR round 1 (PM F-09): check-finding-grammar.sh behaviour")` | Present under exactly the name DoD 14 cites |
| DoD 14 (d) — skill sections | `grep -l "## Delta-Confirmation Findings (erratum rounds)"` over `pdlc/skills/{pm,se,te}-review/SKILL.md` | All three match |
| v1.0's `dist/` claim | `node pdlc/workflows/build-runtime.mjs --check` | `in-sync pdlc/workflows/dist/pdlc-cli.mjs`, exit 0 — the repair the row describes is landed |
| v1.0's `T32` claim | `consolidationBuild.test.js:174` `describe("T32 — the consolidation bundle …")` | Present and named as cited |

**The check that mattered this round.** DoD 14 is a clause whose entire content is factual claims
about HEAD — four remediations, each with a named owning test. A disclosure clause that names a
test which does not exist is worse than no disclosure, because it converts an unverified assumption
into a citation a later reader will trust. Every one of the eight artefacts it names resolves, and
each resolves **under the name given**: the tests are `RT-1g-a`…`RT-1g-e`, not "some tests in
`erratumProtocol.test.js`"; the hook block is titled `CR round 1 (PM F-09)`, exactly as cited; the
hook is *registered* in `hooks.json`, not merely deposited in `scripts/`. That last one is the
distinction my lens exists to make — a hook script present but unregistered is dead config, and the
clause would have been claiming coverage that never runs. It is registered.

**Does the delta break anything I previously approved?** No. The four case-header and P-A-6 edits
are strictly clarifying: each replaces a wording that under-claimed a domain with one that claims
it, and none changes the outcome any case yields for any batch. Case C's Effect cell — the
mechanism citation into shipped `canonicalSectionName` / `SECTION_HEADING_RE` behaviour, the
green-at-landing obligation, and the routing of PROPERTIES' §C.4 re-reds — is byte-identical, so
the "expected to land green" ruling still rests on the shipped code I verified at rounds 11 and 12.
The TDD ordering, the `[Fake first]` labelling, the red-before-green pairing, LI-06's mutation-proof
discipline and the file-ownership manifest are all untouched.

**Did the delta break anything else?** One thing, and it is a carry-forward rather than new: my
round-12 F-01 is unedited, so the v0.7 changelog row still contradicts the 0.9 row and LI-08's note
about `renderSection`'s `body` knob. The new v1.0 and v1.1 rows do not touch it either way.

**Verification bar for the round.** No open High, old or new. Two Lows are recorded, not gating.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **Carried from round 12, unedited.** The v0.7 changelog row still states in the present tense that "`renderSection` already carries unexercised `ordinal`, `gloss` and `body` knobs" — the exact claim the 0.9 row and LI-08's amendment note both now correct as false for `body` at HEAD (`learningsBlock.test.js` passes `body:` on all six of its section specs). The document contradicts itself across two sections, and the stale copy is the one a `renderSection` grep reaches first. Fix: one clause — tense it as what round 8 believed, or strike `` and `body` ``. | §Changelog → row 0.7 |
| F-02 | Low | Local | The header's upstream pins and the line-36 sentence still read **REQ v0.9 / FSPEC v0.13 / DECISIONS v0.3**; at HEAD those are **v0.10 / v0.14 / v0.5**. TSPEC v0.9 is still correct. Not a cascade and not blocking: REQ v0.10 / FSPEC v0.14 only make AC-2.4 / `BR-6` attribution cause-defined and name `AT-13`, which this PLAN's arm-inventory rows already key by cause and already assign to LI-07/LI-16; DECISIONS v0.5 states in terms that neither move touched anything decided. Fix: refresh three numerals at the next open. | §Header → Upstream; line 36 |

DEFERRED: refresh the header's upstream pins to REQ v0.10 / FSPEC v0.14 / DECISIONS v0.5 (TSPEC v0.9 is already right) at the next open of this document.
DEFERRED: close the v0.7 changelog row's stale present-tense `renderSection` `body` claim, which the 0.9 row already corrects downstream of it.
DEFERRED: case A's Effect cell still narrates the derivation over "before batch 7" while its *When* header now reads "before batch 9"; the two agree in substance, and a one-clause reflow would make the cell read in one pass.

## Questions

None. Round 12's questions were closed by that round's own greps, and this delta raises none: every
factual claim it adds is checkable at HEAD, and I checked each rather than asking about it.

## Positive Observations

- **DoD 14 is a disclosure that survives being checked.** Eight named artefacts — five test names,
  a function, a hook script and its registration, three SKILL.md sections — and all eight resolve
  under exactly the names given. The hook is *registered* in `hooks.json`, not merely present in
  `scripts/`, which is the difference between a tested behaviour and dead config.
- **DoD 14 declines to widen the bar, and says so.** "Clauses 1–13 remain the injection region's
  bar", "no task row was added", "they carry their own tests, named above". A DoD clause that names
  four pieces of carried work is one edit from becoming an implicit twenty-third task; this one
  states the boundary rather than leaving a reader to infer it.
- **Case C's domain is now stated by batch number, not by a commit sha.** That is the more durable
  half of the fix my F-02 asked for: "batch 13 or later" cannot go stale, whereas "once LI-21 has
  landed" required the reader to know which batch LI-21 was. The cell also says *why* the numeral
  form was chosen, so the next editor will not revert it.
- **P-A-6 now points at the governing rule instead of restating one branch of it.** One rule, one
  place — the pointer cannot rot when the live case changes, and it still names the live case
  inline so an implementer at HEAD gets a concrete instruction, not a redirection.
- **The delta stayed inside its own footprint.** 8/5 lines, no task row, no `Deps` edge, no AT
  partition, no fixture or manifest row, a byte-identical batches 7–13 ledger. Four rounds running,
  this document's errata have not once perturbed the gate table my lens cares most about.

## Recommendation

**Approved with minor changes**

Both of my open round-12 findings are resolved, and resolved in the durable form rather than the
minimal one. The one substantive addition, DoD 14, is a disclosure clause whose every factual claim
about HEAD checks out, and which explicitly declines to widen the DoD or add a task row. Nothing I
previously approved is disturbed: the expected-red ledger, the batch DAG, the file-ownership
manifest and the TDD ordering are byte-identical. Two Low findings remain — my carried v0.7
changelog row, and three stale upstream version numerals whose substance the PLAN already reflects
by id. Neither changes what an implementer would do at HEAD; both are worth a single sweep whenever
this document is next opened.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
