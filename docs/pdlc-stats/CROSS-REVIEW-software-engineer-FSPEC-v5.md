# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.3, bytes unchanged since v4 approval)
**Upstream changed:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.3 (`50dffe8c8`, erratum round 2)
**Date:** 2026-08-31
**Iteration:** 5 (upstream-cascade confirmation, not a re-review)

## Overview

This is an upstream-cascade confirmation, not a re-review. The FSPEC's own bytes have not
changed since the v4 approval (`REVIEWED-COMMIT: 32a23e013`). The REQ it pins moved once, at
`50dffe8c8` — "REQ v1.3 — erratum round 2, nine targeted wording fixes" — after that approval was
recorded, so the REQ version the approval was taken against no longer exists.

The one question answered here: **does the FSPEC still hold against the REQ as it now stands?**

Method: re-read the v4 cross-review, ran `git show 50dffe8c8 -- docs/pdlc-stats/REQ-pdlc-stats.md`,
then re-read the current text of every REQ passage the FSPEC leans on — not just the changed
hunks — and asked whether the FSPEC is still a faithful compression of it.

Headline: the REQ erratum round landed, in one commit, **all seven** errata the FSPEC's §7.3 had
raised against it. Six of the seven landed in exactly the direction the FSPEC had decided, so the
behavioral spine is now *more* aligned than at approval time. The seventh did not: REQ-STATS-04's
harvested predicate was narrowed to the version grammar, while BR-11 still states it over the bare
`CODE_REVIEW-*` prefix, and the two now disagree on an observable output. That is the one High.

The remainder is staleness of a specific kind: §7.3, and the in-place erratum notices at BR-06,
BR-27 and EC-09, quote upstream wording that no longer exists and assert a disagreement that has
since been resolved. Those citations are wrong as of HEAD even though no behavior turns on them,
which is precisely what this confirmation is for (DEC-ERR-03).

## Linked Requirements

The REQ edit touched eight criteria and one constraint. Each row below is the current REQ text
(v1.3, sha256:c4588c8b…) measured against the FSPEC section that compresses it.

| Upstream item changed | What REQ v1.3 now says | FSPEC section leaning on it | Still faithful? |
|---|---|---|---|
| C-5 | Post-mortem phase *discovery* is carved out of the fidelity rule: "the driver builds that path from a phase it already holds and classifies no `POSTMORTEM-*` basename… That listing is this REQ's own (REQ-STATS-05)" | §1 fidelity anchor; BR-12 | **Yes — and the FSPEC's argument is now the REQ's own text.** §1's "there is no driver classification of that listing to diverge from" was the FSPEC's defence of an unlicensed match; C-5 now licenses it in the same words. Only §7.3's bullet, which still says "the REQ's own C-5 enumeration is what needs the carve-out", is stale. |
| REQ-STATS-03 | Malformed is decided, not third-bucketed, and explicitly "covers the grammatical-but-out-of-catalogue names the pipeline writes (`CROSS-REVIEW-{role}-REVIEW-v{N}.md`); one label stands: a third bucket would be an independent rule C-5 forbids" | D-8; BR-06; AT-09 | **Yes, behaviorally exact.** D-8's decision and the REQ's decision now coincide, and the REQ reproduces D-8's own reason. BR-06's closing sentence ("a wording defect of the upstream criterion… raised as an erratum") is the stale part. |
| REQ-STATS-04 | Harvested iff LEARNINGS present **and** "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains" | BR-11; AT-12; §7.3 bullet 3 | **No — F-01.** BR-11 still reads "no `CODE_REVIEW-*` file remains in the directory". |
| REQ-STATS-06 | Harvested iff LEARNINGS present and "at least one of the two process families is entirely absent (no `CROSS-REVIEW-*` remains, or no `CODE_REVIEW-*` does, or neither)" | BR-16; AT-17; A8 | **Yes, clause for clause.** The REQ adopted BR-16's disambiguation verbatim in structure, including the three-way "or neither". The two-readings erratum is discharged. |
| REQ-STATS-07 | Gap disposition restricted to unreadability: "for any feature whose directory cannot be read, reports it by name with the reason… a readable but empty directory is not a gap but a normal row whose metrics report their zero states" | BR-27; B5; EC-03; EC-11; EC-21 | **Yes behaviorally — but BR-27 quotes the retired wording (F-03).** |
| REQ-STATS-08 | Conjunct (b) regains its separators (", issues no network request, and runs no `git` write command") | §3.4; BR-28; AT-21, AT-22 | **Yes.** The FSPEC always read it as a three-item conjunction; the REQ now punctuates it that way. Nothing to change. |
| REQ-STATS-09 | *Given* carved: "…in a repository whose `docs/` root is present and readable — a missing or unreadable `docs/` root is not this criterion's case but a root failure" | EC-01/EC-09; D-9; BR-04, BR-30; AT-23, AT-24, AT-27 | **Yes behaviorally, and the contradiction is gone — but EC-09 and D-9 still assert it exists (F-04).** |
| REQ-STATS-02 | States re-attributed: "REQ-STATS-03's malformed and unmeasurable states and REQ-STATS-03/04/06's harvested state ride in their own metric's value" | BR-20, BR-21, BR-22, BR-24; AT-04, AT-05 | **Yes.** The set-equality obligation is unchanged and BR-22's "states ride inside their metric's value" is untouched by the re-attribution. |

Nothing in the REQ's changed text removes a requirement the FSPEC covers, and no new criterion,
constraint or non-goal was added, so §2.1's coverage table needs no new row.

## Behavioral Flow

No flow-table cell changes meaning under REQ v1.3.

- **Flow A, A2 → A3 (root probe before feature resolution).** D-9's ordering — A2 exits on a
  missing or unreadable `docs/` root before A3 can resolve a feature — was the FSPEC's decision
  *against* REQ-STATS-09's literal *Given*. REQ v1.3 now states the same ordering as its own
  carve-out, so A2/A3 is no longer a departure to be justified; it is the criterion. The flow
  itself is right as written.
- **Flow A, A6 (DoD metric) and A8 (ratio).** A8's decision point already reads "Is either process
  family entirely absent alongside a `LEARNINGS-{feature}.md`?", which is REQ-STATS-06 v1.3 word
  for word. A6 delegates its predicate to BR-11 and therefore inherits F-01's divergence; fixing
  BR-11's clause fixes A6 without touching the table.
- **Flow B, B5.** "Could the directory not be **read**… No → a normal row, including for a
  directory that is readable and empty" is now the REQ's own sentence rather than a narrowing of
  it. B5 and REQ-STATS-07 v1.3 agree exactly.
- **§3.4 (read-only invariant).** REQ-STATS-08's re-punctuated conjunct (b) enumerates the same
  three obligations §3.4 already carries, and the liveness conjunct ("never suffices alone") is
  untouched. No change.

Carried forward and still open from v4: **F-01 of that round** (Flow C3 routes a refusal Flow A's
A4 cannot raise) and **F-03 of that round** (B5's decision point is narrower than EC-21's
catch-all). Both are Local and pre-existing; neither is aggravated or repaired by the REQ edit, and
neither is re-raised here, since this confirmation is not the channel for the FSPEC's own open
minor findings.

## Business Rules

**BR-11 — the one behavioral divergence the REQ edit opened (F-01).**

REQ v1.3, REQ-STATS-04: harvested where "`LEARNINGS-{feature}.md` is present **and** no
`CODE_REVIEW-{feature}-v{N}.md` file matching **the version grammar** remains".

FSPEC BR-11 (unchanged): harvested when LEARNINGS is present "**and** no `CODE_REVIEW-*` file
remains in the directory".

These were the same rule against REQ v1.2, and §7.3's third bullet says so explicitly: "BR-11
follows the REQ literally; a foreign-feature `CODE_REVIEW-` file would suppress the harvested state
under both documents, so this FSPEC introduces no divergence". The REQ has now moved to the
narrower predicate the erratum asked for, and BR-11 has not, so that sentence is false as of HEAD
and the divergence it denies now exists. The witness is the exact fixture the erratum was about:

> `docs/{f}/` holds `LEARNINGS-{f}.md` and `CODE_REVIEW-otherfeature-v1.md` (or
> `CODE_REVIEW-{f}-draft.md`), and no grammar-matching DoD review.

Under REQ-STATS-04 v1.3 no grammar-matching file remains, so the metric reports **`harvested`**.
Under BR-11 a `CODE_REVIEW-*` file does remain, so the harvested test fails and "the measured
highest version wins" — over an empty match set, i.e. **`0`**. A divergence between `harvested` and
`0` on the same directory is exactly the class of defect REQ C-5 and the FSPEC's own §1 fidelity
anchor exist to prevent: a confident wrong number.

Two internal signals agree with the REQ's narrowing rather than with BR-11, which is why I read
this as an unpropagated edit and not a decision:

- **EC-16** already says a `CODE_REVIEW-` basename that does not match the version grammar
  "contributes nothing, exactly as an unrelated file". A file that is *exactly as an unrelated
  file* cannot also suppress a state that unrelated files do not suppress. BR-11 and EC-16 are in
  tension with each other independently of the REQ.
- **BR-10** derives the count from `deriveDodRoundIndex`'s grammar, so the metric's evidence set is
  already the grammar-matched set. BR-11 is the only place the broader prefix is used.

Fix, one clause: BR-11 reads "…and no `CODE_REVIEW-{feature}-v{N}.md` file matching the version
grammar remains in the directory (BR-10's grammar; a basename outside it is not this metric's
evidence — EC-16)". Nothing else in §4.2 moves.

**BR-06 — decision now shared with the REQ, notice stale (F-05).**

BR-06's paragraph on `CROSS-REVIEW-{role}-REVIEW-v{N}.md` still closes: "That a pipeline-authored
artifact lands in a list an operator reads as 'malformed' is a wording defect of the upstream
criterion, not a divergence introduced here; it is raised as an erratum against the REQ (§7.3)".
REQ-STATS-03 v1.3 now decides that case in the same direction and for the same reason ("a third
bucket would be an independent rule C-5 forbids"). The disposition is right, the tests (AT-09) are
right, and only the "wording defect… raised as an erratum" sentence should go — replaced by a
citation of the criterion that now settles it.

**BR-27 — rule agrees, quotation does not (F-03).**

BR-27's narrowing sentence quotes REQ-STATS-07 as saying "missing or fail to parse … reports it by
name as missing/malformed". That string is gone from the REQ; v1.3 reads "for any feature whose
directory cannot be read, reports it by name with the reason… a readable but empty directory is not
a gap but a normal row whose metrics report their zero states". BR-27's *rule* is now the REQ's
rule, so what remains is a downstream document quoting upstream text that no longer exists and
describing itself as a narrowing of it — which will read, to TSPEC, as an unresolved gap between
the two documents. Delete the quotation and the "raised as an erratum" clause; keep the
zero-state-versus-gap distinction and the EC-03 pointer, which are load-bearing.

**BR-16, BR-22, BR-28 — no change needed.** BR-16 is now the REQ's own predicate including the
"or neither" arm; BR-22's states-ride-inside-the-value rule is untouched by REQ-STATS-02's
re-attribution; BR-28's three prohibitions match REQ-STATS-08's re-separated conjunct (b).

## Edge Cases and Error Scenarios

**EC-09 — the contradiction it announces has been retired upstream (F-04).**

EC-09's outcome column ends: "That departs from REQ-STATS-09's *Given*, which sweeps this case in;
the departure is decided at D-9 and raised as an erratum (§7.3), not left implicit."

REQ-STATS-09 v1.3's *Given* no longer sweeps the case in. It reads "…in a repository whose `docs/`
root is present and readable — a missing or unreadable `docs/` root is not this criterion's case
but a root failure", which is EC-09's behaviour stated as the criterion. So the behaviour stands
unchanged and correct, and the sentence justifying it now asserts a departure from a *Given* that
does not exist. Same for **D-9**, whose whole rationale column is built on "REQ-STATS-09's *Given*
sweeps this case in without meaning to".

This matters more than ordinary staleness because EC-09 is a P1 error path and D-9 is the decision
record TSPEC will read to learn *why* the root probe precedes feature resolution. A reader who
follows the pointer to REQ-STATS-09 finds agreement and cannot reconstruct what was decided. The
repair is small and improves both: EC-09 drops the departure clause and cites REQ-STATS-09's
carve-out; D-9 keeps its decision and its `no_docs_root`-versus-not-found reasoning, restating the
premise in the past tense ("REQ v1.2's *Given* swept this case in; v1.3 carves it out to match").

**EC-01, EC-03, EC-11, EC-21 — unchanged and now better supported.** EC-03 (readable but empty
directory → a measured row) and EC-11 / EC-21 (unreadable directory → gap row in fleet, exit 1 in
single-feature) are exactly REQ-STATS-07 v1.3's two dispositions. The v1 empty-directory
contradiction is closed on both sides.

**EC-05 / EC-16 — the asymmetry survives the REQ edit intact.** REQ-STATS-03 v1.3 keeps malformed
reporting on the cross-review side and REQ-STATS-04 v1.3 keeps "does not contribute, exactly as an
unrelated file" on the DoD side. EC-16's "the asymmetry against EC-05 is deliberate" still holds —
and, as noted under BR-11, EC-16 is the internal witness that BR-11's broad prefix is the outlier.

**EC-15 — unaffected.** Halts still have no malformed bucket; C-5's new carve-out concerns
*discovery* of post-mortem phases, not the disposition of a non-matching `POSTMORTEM-` basename,
and REQ-STATS-05 is unchanged.

## Acceptance Tests

No acceptance test is invalidated by REQ v1.3, and no AT asserts the divergent reading, which is
why F-01 is a one-clause fix rather than a re-derivation.

| AT | Bearing on the REQ edit |
|---|---|
| AT-12 (DoD harvested) | Its two fixtures are "a surviving `CODE_REVIEW-{feature}-v4.md`" and "none". Both are grammar-matching-or-absent, so AT-12 passes identically under BR-11's current wording and under REQ-STATS-04 v1.3. It does **not** pin the divergence — which also means the divergence would ship untested if BR-11 is left alone. |
| AT-28 (non-matching `CODE_REVIEW-` basename) | Fixture holds `CODE_REVIEW-{feature}-v2.md` **and** `CODE_REVIEW-{feature}-draft.md`, and asserts the count reads `2` and the non-matching name is in no malformed list. Because a grammar-matching file survives, the harvested branch is never entered, so AT-28 does not reach the disagreement either. |
| AT-17 (ratio harvested) | Pins BR-16's three-arm predicate on three fixtures — now the REQ's own predicate. Unchanged and still correct. |
| AT-09 (malformed, on the real `docs/completed/pdlc-advisory-wave-gate/` directory) | REQ-STATS-03 v1.3 explicitly names `CROSS-REVIEW-{role}-REVIEW-v{N}.md` as malformed, so AT-09 now pins a criterion-level obligation rather than a literal reading of a disputed one. Strictly stronger. |
| AT-23, AT-24, AT-27 (not-found, usage, root failure) | Unchanged. AT-27's root leg still runs the full eight-cell `{absent, unreadable} × {single-feature, fleet} × {human, --json}` product and still asserts the non-null `feature` conjunct; REQ-STATS-09's carve-out endorses that product rather than contesting it. |
| AT-20, AT-26 (fleet gaps) | Unchanged; REQ-STATS-07 v1.3 now states the readable-but-empty row AT-26 asserts. |
| AT-21, AT-22 (read-only) | Unchanged; REQ-STATS-08's edit was punctuation. |

**Coverage gap opened by F-01.** Once BR-11 is corrected, no existing AT exercises it. The cheapest
sufficient leg is a third fixture on AT-12: `LEARNINGS-{feature}.md` present, one
`CODE_REVIEW-{feature}-draft.md` (or a foreign-feature `CODE_REVIEW-`) present, no grammar-matching
file — *Then:* the DoD metric reads `harvested`, not `0`, and the non-matching basename appears in
no malformed list (BR-11, BR-10's grammar, EC-16). That leg fails under today's BR-11 and passes
under the corrected one, which is what makes the correction real rather than editorial. Whether it
lands as an AT-12 leg or its own number is the FSPEC author's call.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | BR-11's harvested predicate ("no `CODE_REVIEW-*` file remains") is broader than REQ-STATS-04 v1.3's ("no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains"). On a directory with LEARNINGS plus only a non-grammar `CODE_REVIEW-` basename, the REQ requires `harvested` and BR-11 yields `0`. §7.3's third bullet still asserts "this FSPEC introduces no divergence", which was true of REQ v1.2 and is false at HEAD. EC-16 and BR-10 already side with the REQ. Fix: narrow BR-11 to BR-10's grammar; add the AT-12 third leg. | §4.2 BR-11; §7.3 bullet 3; EC-16 |
| F-02 | Medium | delta | local | §7.3 "Upstream errata raised, **not folded in**" is stale in its entirety: all seven bullets were folded in by REQ v1.3 (`50dffe8c8`). It still tells TSPEC the documents disagree — most sharply "until it has one the two documents disagree on a P1 path" (REQ-STATS-09) and "the REQ's own C-5 enumeration is what needs the carve-out" (post-mortem discovery, now carved out in C-5 itself). Fix: convert §7.3 to a settled-upstream record naming REQ v1.3 as the resolving version, retaining only F-01's item as genuinely open. | §7.3 (all bullets) |
| F-03 | Medium | delta | local | BR-27 quotes REQ-STATS-07 as saying "missing or fail to parse … reports it by name as missing/malformed" and calls itself a narrowing of that. The quoted string no longer exists; v1.3 states BR-27's own rule (unreadability is the gap, readable-but-empty is a measured row). The rule is faithful; the quotation and the "raised as an erratum" clause are not. | §4.5 BR-27 |
| F-04 | Medium | delta | local | EC-09's "That departs from REQ-STATS-09's *Given*, which sweeps this case in", and D-9's rationale built on the same premise, describe a contradiction REQ v1.3 removed with its "in a repository whose `docs/` root is present and readable" carve-out. The behaviour is unchanged and endorsed upstream; the justification cites text that is gone, on a P1 error path TSPEC will read for intent. Restate D-9's premise in the past tense and drop EC-09's departure clause. | §5 EC-09; §7.1 D-9; §7.3 bullet 6 |
| F-05 | Low | delta | local | BR-06's closing sentence calls the malformed disposition of `CROSS-REVIEW-{role}-REVIEW-v{N}.md` "a wording defect of the upstream criterion… raised as an erratum". REQ-STATS-03 v1.3 decides that case in the same direction and for D-8's own reason. Replace the erratum notice with a citation of the criterion that now settles it; D-8's decision and AT-09 stand. | §4.2 BR-06; §7.1 D-8 |

FINDING: High | delta | local | §4.2 BR-11 | BR-11's `CODE_REVIEW-*` harvested predicate diverges from REQ-STATS-04 v1.3's version-grammar predicate: `harvested` versus `0` on the same directory.
FINDING: Medium | delta | local | §7.3 | "Upstream errata raised, not folded in" — all seven were folded into REQ v1.3; the section now asserts disagreements that no longer exist.
FINDING: Medium | delta | local | §4.5 BR-27 | BR-27 quotes retired REQ-STATS-07 wording ("missing or fail to parse … missing/malformed") and calls itself a narrowing of text that no longer exists.
FINDING: Medium | delta | local | §5 EC-09 / §7.1 D-9 | Both justify the root-failure behaviour as a departure from REQ-STATS-09's *Given*, which v1.3 carved out; the premise is gone on a P1 path.
FINDING: Low | delta | local | §4.2 BR-06 | BR-06 still calls the malformed disposition an unresolved upstream wording defect; REQ-STATS-03 v1.3 decides it in the same direction.

## Open Questions

_pending_

## Recommendation

_pending_

## Verdict

_pending_
