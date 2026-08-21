# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.1)
**Date:** 2026-08-21
**Iteration:** 13 (delta re-review under DECISION FREEZE)

## Overview

**What changed, and against what base.** The commit I confirmed at v12 (`ba120270`) is no longer an
ancestor of HEAD — the branch was rewritten — so I re-anchored on its content-equivalent, `49595a4b`
("PLAN v0.9 erratum — three-case lead-in, renderSection body claim"), and diffed forward.
`git diff 49595a4b..HEAD` on the PLAN is **8 insertions, 5 deletions across 13 lines and nothing
else**: the version cell (`0.9` → `1.1`), the three cells of P-A-7's case A/B/C table, one new DoD
clause (14), P-A-6's answer cell, and two appended changelog rows (1.0, 1.1). Everything else in the
document is byte-identical to the bytes I approved at v12.

**Verdict up front: my four routed Lows are closed, one stays open, and nothing broke.** Of my five
v12 findings, three were routed and all three landed (F-02 batch-13 gap, F-03 batches 7–8, F-04 case
B's punctuation splice). F-01 (the 0.9 changelog's wrong attribution) and F-05 (the 0.5/0.6 row
inversion) are still open — both are single-word/single-swap items I did not route as gating and do
not gate now. The delta introduced **one** new inaccuracy, a self-quote left stale by the case A
edit, Low. **No High. No Medium. Three Lows.** Approved with minor changes.

**The freeze held.** Nothing in this delta opens a decision. The case-table edits change *domain
boundaries stated in the header cells* so the batch line tiles without a gap — they do not change
what any case rules, and I diffed each ruling clause to confirm the outcome column of cases A and B
is byte-identical apart from the em-dash repair, and case C's outcome column is byte-identical
entire. DoD 14 and the P-A-6 edit are the two substantive additions and both are *disclosures* of
positions already taken elsewhere, not new positions.

**Scope of this pass.** Per the delta protocol I read only the changed regions plus the upstream text
each changed region leans on, and I verified every repository claim the new bytes make — the four
DoD 14 remediations, the dist-freshness claim in the 1.0 row, and the case-C production clauses —
against HEAD source rather than against the changelog's account of them.

## Batches

**No task row moved, and none could have.** The diff touches no line inside §Batches. I extracted the
`Batch`, `Deps`, owner and owned-file columns for all 23 `LI-*` rows at `49595a4b` and at HEAD: byte
identical. LI-08's amendment note — the row the previous erratum rewrote and I verified clause by
clause at v12 — is untouched, so the corrected `renderSection` claim ("two unexercised knobs plus a
`body` the landed suites already use") stands exactly as I approved it. The §File-ownership manifest
is likewise untouched, so single-writer ownership is unchanged.

**The one clause in this delta that makes claims about batch work is DoD 14, and every one of its
claims is true at HEAD.** It names four POSTMORTEM-D remediations carried on this branch with the
test that owns each. I checked all four against the repository rather than the changelog:

- **(a) the erratum restatement retry, "inside `erratumRound`, tested by `erratumProtocol.test.js`'s
  `RT-1g-a…e`".** The suite carries the named arms — `RT-1g-a` at
  `pdlc/workflows/__tests__/erratumProtocol.test.js:1384` ("a non-approving confirmation with zero
  FINDING: lines earns exactly one restatement re-dispatch…") through `RT-1g-e` at line 1495 ("the
  finding-grammar clause names the halting reading instead of promising leniency (POSTMORTEM-D item
  7)"). The named-arm span is real, and `RT-1g-e` names POSTMORTEM-D directly, which is the
  provenance DoD 14 asserts.
- **(b) the rewritten `findingGrammarClause()`.** Defined in `pdlc/workflows/orchestrate-dev.js`, and
  the only other occurrence in the tree is the generated bundle `pdlc/workflows/dist/pdlc-cli.mjs` —
  i.e. it is production code that reaches the shipped artifact, not a test-only helper. The
  dead-config check passes: this is a wired production seam, not a builder with zero callers.
- **(c) `pdlc/hooks/scripts/check-finding-grammar.sh`, "registered as a `PostToolUse: Write|Edit`
  hook in `pdlc/hooks/hooks.json`".** The script exists, and `hooks.json`'s `PostToolUse` matcher
  `Write|Edit` lists it as the third command after `check-scope-field.sh` and `check-req-size.sh` —
  the registration is exactly as described, matcher included. The behavioural suite is real too:
  `pdlc/workflows/__tests__/hookCompatibility.test.js:490` opens
  `describe("CR round 1 (PM F-09): check-finding-grammar.sh behaviour", …)`, the block DoD 14 names.
- **(d) the `## Delta-Confirmation Findings (erratum rounds)` sections in
  `pdlc/skills/{pm,se,te}-review/SKILL.md`.** Present in all three files (four occurrences of the
  heading string in each, i.e. the section plus its in-prose references). Three of three, as claimed.

**DoD 14's scope statement is the right shape, and it is the shape I asked for at CR round 1.** It
says plainly that REQ G-5 ("this feature changes what an author is told, never what the pipeline
requires of what they produce") holds for the injection region and does **not** hold for this branch
as a whole, because (a) changes how many dispatches an erratum round may make. It then does the thing
that keeps this inside the freeze: it records that a PLAN **cannot authorise** that narrowing, routes
the authoritative amendment to REQ as an erratum, and forbids citing (a)–(d) as precedent. A product
decision is not being made in an engineering artifact here; a product decision made elsewhere is
being disclosed, with the correct owner named. It also explicitly does not widen the DoD bar —
clauses 1–13 remain the injection region's bar and (a)–(d) carry their own named tests. I have no
finding against it. (The REQ-side amendment is already routed by
the round that produced DoD 14; I do not re-emit it as an ERRATUM here — re-routing a live item would
buy a second round for one edit, and this delta neither introduced it nor changed its status.)

## Dependencies

**No `Deps` edge changed.** The diff contains no line inside §Dependencies and no `Deps` cell; the
23-row dependency graph is byte-identical to the base. This delta scheduled nothing.

**The one cross-document dependency this delta touches is P-A-6, and the edit tightens it.** The
answer cell previously offered two routes for a PROPERTIES suite that lands red: land it green in one
commit, "or else its red rows are amended into the ledger by name first (P-A-7)". That second route
is **case B's** route, and case B closed at batch 12 — so at HEAD the fallback pointed at a mechanism
that no longer exists. The cell now reads "its rows are handled under **P-A-7's governing case** —
which at HEAD is case C, where no ledger remains to amend into and the obligation is
green-at-landing; the amend-into-the-ledger-by-name route is case B's, and case B closed at batch
12". I checked this against P-A-7's table at HEAD: case B's *When* is "batch 9 through batch 12" and
case C's is "batch 13 or later", so the cell's claim about which case governs at HEAD is exactly
right, and it is stated by indirection ("the governing case") rather than by naming C outright — so
the sentence does not go stale again if the domain moves. This is a correctness repair to a
downstream instruction, not a new decision: the obligation on Phase P is unchanged (commit when
green), only the description of the fallback is corrected.

**PROPERTIES' side of the dependency still agrees.** §C.4 of PROPERTIES continues to route
PROP-BOUND-03's `maxBytesPerDocument <= 0` case, PROP-BOUND-05/07/08 and the Group D amendments to
this PLAN, and states they travel under case C — no ledger row, green at landing, fix owed before
batch 14. The P-A-6 edit brings the PLAN's own fallback wording into line with what PROPERTIES
already says, so the two documents now describe the same route from both ends. That closes the last
asymmetry I noted at v12 (where agreement existed on the ruling but the PLAN's P-A-6 cell still
offered the superseded route).

**One version pin remains behind, and it is still not this document's to fix.** PROPERTIES' Upstream
cell pins this PLAN at an earlier version while the PLAN is now v1.1. As at v12, the lag is harmless
in substance — none of the text PROPERTIES quotes changed in this delta, and the case A/B/C outcome
columns it leans on are byte-identical apart from case B's em dash — so every PROPERTIES quotation
still resolves. A downstream document's Upstream pin is that document's field to advance; recording
it here rather than raising it keeps the finding with its owner.

## Verification

### My v12 findings, checked one at a time at HEAD

| v12 finding | Disposition | Verified against |
|---|---|---|
| **F-02 (Low, inherited)** — a commit landing in batch 13 *ahead of* LI-21 is governed by neither case B (bounded at 12) nor case C (opened "once LI-21 has landed") | **Resolved.** Case C's header now reads "**batch 13 or later**, the case that is live at HEAD", and its *When* reads "any commit landing in batch 13 or after, including batch 14 — LI-21 (`92b7ea0c`) has landed, so batch 13's pre-LI-21 slot is closed and cannot recur; the domain is stated by batch number rather than by LI-21's commit so that no batch falls between case B's upper bound (12) and this case" | The fix is the one I asked for — the domain is restated by batch number, so it no longer depends on a commit's landing state. It also says *why*, which is what stops the seam reopening |
| **F-03 (Low, inherited)** — batches 7 and 8 fall in neither case A's "before batch 7" nor case B's "batch 9 through 12" | **Resolved.** Case A's *When* now reads "**before batch 9 (which includes batches 7 and 8)**", and the outcome cell gains a closing clause stating that those two batches are exactly the ones whose ledger already lists `learningsBlock` as a whole-suite red, so the derivation decides them and yields no row | The two headers now tile the batch line with no gap: A = before 9, B = 9–12, C = 13 or later. I checked the three *When* cells against each other at HEAD; every batch number from 1 upward is claimed by exactly one case |
| **F-04 (Low, inherited)** — case B's parenthetical opens with an em dash and closes with a comma, so the row's object clause reads as a splice | **Resolved.** The aside now reads "— a span that is well-formed only while a greening batch remains ahead, which is why case C exists — the named row `learningsBlock` → …". The dash closes before the object | The gate contract in that cell is otherwise byte-identical; only the closing punctuation mark changed |
| **F-01 (Low, delta)** — the 0.9 changelog row credits the lead-in fix to "(PM v10 erratum)" when the raiser was TE v11 F-01 | **Open.** Line 612 still reads "(PM v10 erratum)". The 1.1 row does note that "TE F-01 (the P-A-7 lead-in's stale 'two') was already applied at v0.9 and needed no write", which records the right raiser one row down but does not correct the row that carries the wrong one | Re-filed below as F-01, Low, unchanged |
| **F-05 (Low, inherited)** — §Changelog's 0.6 row precedes its 0.5 row | **Open.** Lines 608–609 still read 0.6 then 0.5; 0.7, 0.8, 0.9, 1.0 and 1.1 are all correctly appended in order | Re-filed below as F-02, Low, unchanged |

Three of three routed items landed, and each landed as a *domain* restatement rather than a
re-ruling — no case's outcome column changed except case B's single punctuation mark. That is the
correct shape for a frozen round.

### What the delta did not break

I re-checked the four properties I have called load-bearing since v10–v11, since the case table is
exactly where a careless edit would disturb them. All four survive:

- **The batches 7–13 expected-red ledger is byte-identical.** The diff contains no ledger line. Its
  three invariants — stated in test names not suite names where a suite splits across two green
  tasks, shrinks by exactly the rows the batch's own task greens, and reaches empty at batch 13 —
  are all carried on untouched bytes.
- **Case C's green-at-landing ruling is intact, and its production clauses still hold at HEAD.** The
  outcome column is byte-identical: no ledger row, green at landing, fix owed before batch 14 runs,
  gate failure if a red survives into batch 14. Its four production claims (an optional ordinal
  stripped via `SECTION_HEADING_RE`, an optional trailing gloss stripped, case-sensitive comparison
  against `BR6_SECTION_NAMES`, `###` never matching `^##[ \t]+`) are the ones I re-derived from
  TSPEC §D.3 and from shipped source at v12; the delta touched none of them.
- **No AT partition, fixture row or manifest row moved.** The 1.0 and 1.1 changelog rows both claim
  this, and both claims are true against the diff, clause for clause.
- **The single-writer file-ownership manifest is unchanged**, so DoD 14's four remediations — which
  are *not* owned by any `LI-*` row — do not create an unowned writer inside the manifest's domain.
  DoD 14 states this directly ("No task row was added for them"), and the manifest agrees by being
  untouched.

### The 1.0 row's repository claims, checked rather than believed

The 1.0 changelog row makes one claim about the repository that is not a claim about this document:
"**DoD 6's `dist/` clause was found violated at HEAD and repaired in code**… `build-runtime.mjs
--check` printed `STALE pdlc/workflows/dist/pdlc-cli.mjs`… the rebuild is committed and
`consolidationBuild.test.js`'s `T32` is green on the branch as committed." I ran the check myself:
`node pdlc/workflows/build-runtime.mjs --check` prints `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`
and exits zero at HEAD, so the repair is real and the drift is closed. `T32` exists as claimed —
`pdlc/workflows/__tests__/consolidationBuild.test.js:174`, `describe("T32 — the consolidation bundle
(T-02, TSPEC §8.2, §8.3)")`, with the header comment at line 11 mapping it to TSPEC §8.2/§8.3/T-02.
A changelog row asserting a green gate that the tree does not actually satisfy would be a factual
contradiction with HEAD and would block; this one holds.

### One new inaccuracy the delta introduced

Case A's *When* cell moved to "before batch 9", but its outcome cell's derivation still quotes the
old text: "a commit landing in batches 2–6 is also **\"before batch 7\"**" (line 491). The
derivation is quoting a cell that no longer says that. The reasoning underneath is unaffected —
batches 2–6 carry no ledger at all, so the outcome is "no row" either way, and the new closing clause
covers 7 and 8 explicitly — so this is a stale self-quote, not a wrong ruling. It is exactly the
class of residue the case-A edit was likely to leave, which is why I looked for it. Low; filed as
F-03. Fix: change the quoted string to "before batch 9", or drop the quotation marks and write
"batches 2–6 are also inside case A's window".

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | §Changelog's 0.9 row (line 612) still credits the P-A-7 lead-in fix to "(PM v10 erratum)". PM v10 raised no such item — its findings were the `renderSection` claim (F-01), case A's window (F-02) and the changelog row inversion (F-03) — and no PM cross-review in this feature contains the string "two cases that can arise". The raiser was **TE v11 F-01**, which the *1.1* row now names correctly one row below without correcting the row that carries the error. The same 0.9 row's other attribution, "(TE v10 F-01, PM v10 F-01)", is right. Fix: replace "(PM v10 erratum)" with "(TE v11 F-01)". Carried from PM v12 F-01, unchanged | Process record; no REQ clause |
| F-02 | Low | Local | §Changelog's 0.6 row (line 608) still precedes its 0.5 row (line 609), leaving the version table non-monotone; 0.7 through 1.1 are all correctly appended in order. Fix: swap the two rows. Carried from PM v10 F-03 / PM v12 F-05, unfixed across three rounds | Process record; no REQ clause |
| F-03 | Low | Local | **Introduced by this delta.** Case A's *When* cell now reads "before batch 9 (which includes batches 7 and 8)", but its outcome cell's derivation still quotes the superseded text — "a commit landing in batches 2–6 is also \"before batch 7\"" (line 491). The derivation quotes a cell that no longer says that. The ruling is unaffected: batches 2–6 carry no ledger, so the outcome is "no row" either way, and the new closing clause claims 7 and 8 explicitly. Fix: quote "before batch 9", or drop the quotation and write "batches 2–6 are also inside case A's window" | P-A-7 gate contract; no REQ clause |

DEFERRED: §Changelog's 1.0 and 1.1 rows each run to a single paragraph-length cell; a two-column split (what changed / what provably did not) would make the "nothing else changed" clauses checkable at a glance rather than by reading to the end of the cell.
DEFERRED: DoD 14 names the four remediations in prose (a)–(d) with their owning tests inline; a four-row table (remediation / production seam / owning suite / named arm) would let a DoD verifier walk it mechanically.
DEFERRED: P-A-6 now routes through "P-A-7's governing case" by indirection, which is stale-proof; the same indirection would suit the two other places that name case C by letter.

## Questions

| ID | Question |
|----|---------|
| Q-01 | DoD 14 says REQ G-5 "is narrowed by (a), not satisfied by it", and that the authoritative REQ amendment is routed as an erratum. When that amendment lands, does DoD 14 stay as a disclosure of the branch's carried remediations, or does its G-5 paragraph retire into the REQ? A one-clause note on its intended lifetime would tell the harvest phase whether this is durable content or round-scoped. Not gating, and not a decision this frozen round should take |

## Positive Observations

- **All three routed items landed as domain restatements, not re-rulings.** The case A/B/C table's
  outcome columns are byte-identical apart from case B's single punctuation mark. In a frozen round
  that distinction is the whole game, and the author held it precisely.
- **Case C's domain is now stated by batch number rather than by a commit's landing state.** That is
  the stronger version of the fix I asked for: "batch 13 or later" cannot go stale, where "once LI-21
  has landed" was true only relative to a moment. Both edits also record *why* the wording changed,
  so the seam does not reopen the next time someone edits the cell.
- **The headers now tile the batch line with no gap.** A = before 9, B = 9–12, C = 13 or later. I
  walked the batch numbers against the three *When* cells; every batch is claimed by exactly one
  case. Two seams that had been carried since v11 closed with one edit each.
- **P-A-6 stopped offering a route that no longer exists.** The old cell pointed a Phase P author at
  case B's amend-into-the-ledger fallback, which closed at batch 12. Fixing it by indirection —
  "P-A-7's governing case" — means the cell stays true as the governing case moves.
- **DoD 14 discloses a scope narrowing instead of quietly absorbing it.** It states that REQ G-5
  holds for the injection region and not for the branch, says a PLAN cannot authorise that, routes
  the amendment to REQ's author, and forbids citing the remediations as precedent for deciding
  product scope in engineering artifacts. That is the correct handling of an out-of-scope change, and
  it is the reason this delta does not carry a scope-creep finding.
- **Every repository claim in the new bytes survives a first-hand check.** Four remediations, four
  named test locations, one hook registration with the right matcher, one dist-freshness gate — I
  verified each against HEAD rather than against the changelog, and all held, including the `--check`
  run that now prints `in-sync`.

## Recommendation

**Approved with minor changes**

All three of my routed v12 findings are resolved, and each was fixed at the header rather than by
re-arguing the ruling underneath — the case A/B/C outcome columns are byte-identical apart from case
B's em dash, and the batch line now tiles with no gap between A, B and C. The two v12 Lows I did not
route (the 0.9 row's wrong attribution, the 0.5/0.6 inversion) remain open and remain non-gating.
The delta introduced one Low: case A's derivation still quotes its own superseded "before batch 7"
text.

Nothing I previously approved moved. No task changed batch, no `Deps` edge changed, no AT partition,
fixture or manifest row was touched, and the batches 7–13 ledger is byte-identical. The two
substantive additions — DoD 14 and the P-A-6 correction — are disclosures and repairs, not new
decisions, so the freeze held. Every repository claim in the new bytes checks out at HEAD, including
the four POSTMORTEM-D remediations with their named suites, the hook registration with its
`Write|Edit` matcher, and the dist-freshness gate, which now prints `in-sync`.

No High and no Medium, so nothing blocks. The three Lows are one word, one row swap and one quoted
string; they belong in whatever pass next edits those blocks, not in a round of their own.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
