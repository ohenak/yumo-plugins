# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (bytes unchanged since v4 approval, commit `32a23e013`)
**Upstream changed:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.3 (sha256:c4588c8b08d3138b1d2498adda75aa9896f5cd3dee9eb8ed4d1b7c5d92376126), erratum round 2, commit `50dffe8c8`
**Date:** 2026-08-31
**Iteration:** 5 (cascade confirmation, not a re-review)
**Previous review:** `CROSS-REVIEW-test-engineer-FSPEC-v4.md` — *Approved with minor changes* (0 High, 2 Medium, 2 Low)

## Overview

This is an **upstream-cascade confirmation**, not a re-review. The FSPEC's own bytes have not moved
since the v4 approval (`REVIEWED-COMMIT: 32a23e013`). What moved is the REQ: the erratum round in
commit `50dffe8c8` landed nine targeted wording fixes, so the REQ version my approval was taken
against (sha256:71ecf5574…, recorded in v4's `UPSTREAM-STATE`) no longer exists. The single question
asked and answered here is whether the FSPEC is still a faithful compression of REQ v1.3 **as it now
stands**.

The erratum's direction is worth stating first, because it changes what "faithful" means for this
pair. Seven of the nine fixes are the REQ *accepting the FSPEC's decisions* — §7.3 raised seven
errata and the REQ resolved all seven, in the FSPEC's favour every time: C-5 now carves out
post-mortem phase discovery, REQ-STATS-03 now blesses the malformed label for
`CROSS-REVIEW-{role}-REVIEW-v{N}.md`, REQ-STATS-09 now carves out the `docs/`-root case,
REQ-STATS-07 now restricts gaps to unreadability and calls an empty directory a zero-state row,
REQ-STATS-06 now states the at-least-one-family predicate, REQ-STATS-02 now attributes the states
correctly, REQ-STATS-08 regains its separators. Convergence, not contradiction — the two documents
now agree on behaviour on every path the FSPEC decided differently and said so.

That makes the confirmation mostly clean, and the residue is exactly the class this cascade check
exists to catch. Two things did not survive the move:

1. **One rule that was deliberately left literal now diverges.** REQ-STATS-04's harvested predicate
   was rewritten from the bare `CODE_REVIEW-*` prefix to the `CODE_REVIEW-{feature}-v{N}.md` version
   grammar. BR-11 still reads the bare prefix. §7.3 justified that literalism with the sentence
   "this FSPEC introduces no divergence, and the erratum stays with the REQ" — the erratum has now
   left, and the divergence it predicted is what remains. No AT covers the discriminating fixture.
   That is F-01, and it is the only gating item.
2. **A body of in-rule prose now describes a disagreement that no longer exists.** EC-09, D-8, D-9,
   BR-27 and all of §7.3 characterise upstream text in the past tense of the pre-erratum REQ
   ("that departs from REQ-STATS-09's *Given*", "a defect of the upstream criterion", "the wording
   is raised as an erratum"). Those sentences cite upstream that no longer says what they say it
   says. No oracle turns on them, so they are Medium and Low — but a TSPEC author reading them will
   believe REQ and FSPEC disagree on a P1 path when they now agree.

Everything else I checked holds. Scope note per my role: I confirmed testability and traceability of
the changed upstream against the FSPEC's rules and ATs. I did not re-open settled design, and I did
not re-read sections no changed REQ sentence reaches.

## Linked Requirements

Nine REQ edits landed. Each is checked below against the FSPEC text that compresses it, at the
FSPEC's current bytes. "Holds" means the FSPEC's rules and ATs are still a faithful compression of
the amended sentence; it does not mean the FSPEC's prose *about* the REQ is still accurate — that is
tracked separately at F-03 and F-04.

| REQ edit (v1.3) | What it now says | FSPEC surface | Verdict |
|---|---|---|---|
| **C-5** — post-mortem phase *discovery* carved out of the fidelity rule; "that listing is this REQ's own (REQ-STATS-05); fidelity binds the `RESOLVED:` marker, not the discovery" | Discovery is the REQ's; the marker is the driver's | §1 fidelity anchor (lines 59-67), BR-12 | **Holds — exactly.** §1 already argued this in the FSPEC's own words ("nothing in the driver classifies a `POSTMORTEM-*` **listing** … that is not a C-5 divergence"). The REQ now says the same thing. The FSPEC's §7.3 bullet claiming the carve-out is still owed is what is stale (F-03), not BR-12. |
| **REQ-STATS-03** — malformed label decided; covers grammatical-but-out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}` names; "one label stands: a third bucket would be an independent rule C-5 forbids" | The FSPEC's D-8 answer, promoted into the criterion | BR-06, EC-05, D-8 | **Holds.** EC-05 already lists "a document type outside BR-09's six — including the pipeline's own `CROSS-REVIEW-{role}-REVIEW-v{N}.md`" as malformed, and D-8 chose that over a third bucket for the reason the REQ now gives verbatim. D-8's *rationale* is now stale (F-04); its *decision* is now upstream-blessed. |
| **REQ-STATS-04** — harvested restated over `CODE_REVIEW-{feature}-v{N}.md` "matching the version grammar", and the clause regains its subject | Only grammar-matching files suppress `harvested` | BR-11, AT-12, AT-28 | **Does not hold — F-01 (High).** BR-11 still says "no `CODE_REVIEW-*` file remains". The two now disagree on a real fixture and no AT discriminates. |
| **REQ-STATS-05** — unchanged in this round, but its scope widened by C-5's carve-out | Owns the post-mortem listing | BR-12, BR-13, AT-13, AT-14, AT-14b | **Holds.** BR-12 already states the basename form it matches and defers only resolution tagging; AT-13's foreign-feature leg (`POSTMORTEM-P-some-other-feature.md`) is the oracle for the listing rule the REQ now assigns here, and EC-15 states the no-malformed-bucket consequence. The carve-out gave the FSPEC's existing coverage an upstream owner; it required no new AT. |
| **REQ-STATS-06** — harvested predicate disambiguated to "at least one of the two process families is entirely absent (no `CROSS-REVIEW-*` remains, or no `CODE_REVIEW-*` does, or neither)" | The reading BR-16 derived | BR-16, §3.1 A8, AT-17, EC-13 | **Holds — word for word.** BR-16 reads "at least one of the two process families is entirely absent — that is, either no `CROSS-REVIEW-*` file remains, or no `CODE_REVIEW-*` file remains, or neither remains", and AT-17 pins it on three fixtures. The ambiguity BR-16 resolved by inference is now stated upstream, and it resolved it the same way. Note the granularity split this creates against REQ-STATS-04 — see F-01. |
| **REQ-STATS-07** — gap disposition restricted to unreadability; "a readable but empty directory is not a gap but a normal row whose metrics report their zero states" | Gap ⇔ directory cannot be read | BR-27, EC-03, §3.2 B5, AT-26 | **Holds for the empty-directory half; F-02 (Medium) on the other half.** BR-27's read-scoped subject and EC-03's zero-state row now match the criterion exactly — the narrowing the FSPEC performed is upstream text. But the phrase EC-21 leaned on ("or fail to parse") is gone, and EC-21 still degrades a *compute* failure to a gap row. |
| **REQ-STATS-09** — *Given* carved to "a repository whose `docs/` root is present and readable"; a missing root is a root failure | The FSPEC's D-9 answer, promoted | EC-09, D-9, BR-30, AT-27 | **Holds behaviourally.** The behaviour EC-09 and D-9 specify is now the behaviour the criterion demands; AT-27's eight-run cross product and its `feature`-per-mode conjunct need no change. The *prose* asserting a departure is stale (F-04). |
| **REQ-STATS-02** — malformed/unmeasurable attributed to REQ-STATS-03 only; harvested to REQ-STATS-03/04/06 | Correct attribution of the states to their owning ACs | BR-22, BR-21, §4.4, AT-05, AT-25 | **Holds.** BR-22 carries `harvested`, `unmeasurable`, `n/a` and the malformed list inside each metric's value with no sibling top-level keys; the attribution fix changes which AC is cited, not which key is emitted. §7.3's "no FSPEC behavior turns on either" was correct and remains correct. |
| **REQ-STATS-08** — conjunct (b) regains its list separators | Wording only | §3.4, BR-28, AT-24 | **Holds.** The read-only invariant, the git-write token list and AT-24's `--dry-run` argument are unaffected. |

Two traceability rows in §2.1 are worth re-reading against this table when the FSPEC is next edited:
`REQ-STATS-04 → BR-10, BR-11` (the row F-01 breaks) and `REQ-STATS-07 → BR-18, BR-23, BR-25, BR-26,
BR-27` with `AT-18, AT-19, AT-20, AT-26, AT-27` (the row F-02 puts a claim on, because AT-20's
second leg is credited to a criterion that no longer describes it).

## Behavioral Flow

Only the flow rows a changed REQ sentence reaches are re-read here.

**§3.1 A2 / §3.2 B2 (read the `docs/` root).** Both route a root failure to EC-09 and Flow C, exit 1.
REQ-STATS-09's amended *Given* now excludes this path from not-found explicitly, which is what A2's
"exits before A3 can resolve a feature" ordering already implements. The flow is unchanged and now
has an upstream sentence behind it rather than a decision row apologising for it.

**§3.1 A6 (DoD count).** The decision column reads "Any `CODE_REVIEW-*` file present?". That is the
bare-prefix test, and it is the flow-level expression of F-01: under REQ v1.3 the question the flow
must ask is "any `CODE_REVIEW-{feature}-v{N}.md` file present?". A flow row phrased over the wrong
predicate is where a TSPEC author reads their branch condition from, so this row moves with BR-11 or
not at all.

**§3.1 A7 (halts).** "Per post-mortem file: what does the driver's `RESOLVED:` rule classify it as?"
— the row asks the driver only for the marker, and constructs the file set itself. That is precisely
the split C-5 now writes. Nothing to change.

**§3.1 A8 (ratio).** "Is either process family entirely absent alongside a `LEARNINGS-{feature}.md`?
… Harvested is checked before the zero-denominator test (BR-16)." Matches the amended REQ-STATS-06
including the precedence, which the REQ still leaves to the FSPEC and which EC-13 and AT-17 pin.

**§3.2 B5 (per-feature computation in fleet mode).** "Could the directory not be **read**
(permissions, or it is not a readable directory)? Yes → a gap row … No → a normal row, including for
a directory that is readable and empty (EC-03: emptiness is a measurable state, not a gap)." This
row is now a verbatim match for the amended REQ-STATS-07 — both halves, including the empty-directory
disposition the REQ previously mis-described. It is the single clearest case of the erratum landing
where the FSPEC already was.

The consequence for F-02 is visible here: B5's question is binary on *readability*, and EC-21's
catch-all is a third outcome that no flow row asks a question about. Before the erratum, EC-21 could
be argued back to REQ-STATS-07's "fail to parse". After it, the flow and the criterion agree with
each other and EC-21 sits outside both.

## Business Rules

**BR-11 (DoD harvested) — the one rule the erratum broke.** BR-11 reads: "The DoD metric reports
`harvested` when `LEARNINGS-{feature}.md` is present **and** no `CODE_REVIEW-*` file remains in the
directory." REQ-STATS-04 v1.3 reads: "where `LEARNINGS-{feature}.md` is present **and** no
`CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains, this metric reports
**harvested**".

The divergence is not academic, and it is decidable with one fixture. Take a harvested feature whose
directory retains `CODE_REVIEW-notes.md`, or another feature's `CODE_REVIEW-other-feature-v1.md`:

- **REQ v1.3:** no file matches the version grammar → `harvested`.
- **BR-11 at HEAD:** a `CODE_REVIEW-*` file remains → not harvested → and since BR-10 derives the
  index only from grammar-matching basenames, there is no highest version to report, so the metric
  falls to `0` — the exact state BR-11's own closing sentence ("the harvested state never displaces
  evidence this metric can actually read") exists to prevent, on a directory where there is no
  readable evidence at all.

So the two documents now disagree on the reported value, and they disagree in the direction that
prints a measured-looking `0` where the truth is "the evidence was deleted" — the failure mode
REQ-STATS-04 was written to stop. This is a High under my lens for the ordinary reason: a rule that
contradicts its criterion, on a P-level metric, with no test that can tell the two readings apart.

Two things make it worth fixing at the rule rather than waving through. First, §7.3's third bullet
predicted this exact situation and bet against it: "BR-11 follows the REQ literally; a foreign-feature
`CODE_REVIEW-` file would suppress the harvested state under both documents, so this FSPEC introduces
no divergence, and the erratum stays with the REQ." That reasoning was sound while the REQ said
`CODE_REVIEW-*`. The erratum has now moved the REQ, which is the event that inverts the bet — and it
is precisely the kind of consequence a cascade confirmation exists to find, since the FSPEC's bytes
are untouched and nothing else would have surfaced it.

Second, the erratum deliberately did **not** make the same narrowing to REQ-STATS-06, which still
reads `CROSS-REVIEW-*` / `CODE_REVIEW-*` at the bare prefix. So the REQ now uses two different
granularities on purpose: the DoD *count* metric is grammar-scoped, the *ratio*'s harvested predicate
is prefix-scoped. BR-16 matches the prefix reading and is correct as written; BR-11 matches the prefix
reading and is now wrong. An editor who "fixes" both to the same granularity will break BR-16. The
fix is one clause on BR-11 only, plus §3.1 A6's decision question, plus one AT leg (see below).

**BR-16 (ratio harvested).** Verified word-for-word against the amended REQ-STATS-06, including the
three-way disjunction and the BR-15 precedence. No change.

**BR-12 (halts).** Verified against the amended C-5: BR-12 matches the basename form itself and
defers only the `RESOLVED:` classification. The FSPEC's §1 anchor argued for this carve-out and the
REQ granted it. No change.

**BR-27 (gap rows are rows).** The rule's *scope* now matches REQ-STATS-07 exactly. Its
*justification* does not: BR-27 still says "This narrows REQ-STATS-07's 'missing or fail to parse …
reports it by name as missing/malformed'" and "'as missing' is not what a zero-state row says, so the
wording is raised as an erratum (§7.3)". REQ-STATS-07 no longer contains the quoted phrase and no
longer needs the erratum. Quoting upstream text that was deleted is the citation defect this
confirmation is asked to catch — F-04.

BR-27's scope also settles my own v4 F-02, in the opposite direction to the fix I proposed. I asked
for BR-27's subject to be widened to cover computation failure so EC-21's citation would resolve. The
REQ has since gone the other way and pinned gap ⇔ unreadable. That recommendation should be
considered withdrawn: widening BR-27 now would create the divergence F-01 describes, in a second
place. The reconciliation for EC-21 has to be either an upstream sentence or an explicit
robustness framing — F-02 states both options and picks neither, because that choice is the author's.

**BR-22, BR-21, BR-30, BR-29, BR-20.** Re-read against the amended REQ-STATS-02 and REQ-STATS-09.
The state-inside-the-value discipline, the three-key error object, the closed `reason` enum and the
exit-code table are all unaffected by the erratum: it changed which AC owns a state, never which key
carries it. My v4 F-01, F-03 and F-04 (AT-27's key-set conjunct, BR-30's stale lead sentence,
AT-27's stderr conjunct) remain open as recorded there; they are unrelated to this cascade and I do
not re-raise them here.

## Edge Cases and Error Scenarios

**EC-03 (empty feature directory).** "Every metric reports its zero state … Not a gap and not an
error — an empty directory is a real, reportable state." REQ-STATS-07 now says the same in its own
*Then*. This edge case went from being the FSPEC's contested narrowing to being upstream's own
disposition. No change.

**EC-05 (basename fails the grammar).** Includes "a document type outside BR-09's six — including the
pipeline's own `CROSS-REVIEW-{role}-REVIEW-v{N}.md`". REQ-STATS-03 v1.3 now names that case and
assigns it to malformed for the reason D-8 gave. Match confirmed; the pipeline-authored artifacts in
`docs/completed/pdlc-advisory-wave-gate/` that AT-01 and A-3 lean on are unaffected.

**EC-07 (partial harvest).** "The DoD metric and the ratio are evaluated on their own evidence,
independently (BR-11, BR-16)." Independence is still right, and is now *more* clearly right given the
REQ's deliberate granularity split. But the EC-07 row inherits BR-11's predicate by reference, so it
inherits F-01's defect: on a partially harvested directory whose surviving `CODE_REVIEW-` file is
off-grammar, EC-07 and the REQ report different DoD states. Fixing BR-11 fixes this row with it; no
separate edit is needed.

**EC-09 (`docs/` root missing or unreadable).** The behaviour clause is unchanged and correct. The
trailing clause is not: "That departs from REQ-STATS-09's *Given*, which sweeps this case in; the
departure is decided at D-9 and raised as an erratum (§7.3), not left implicit." REQ-STATS-09 v1.3
now reads "in a repository whose `docs/` root is present and readable — a missing or unreadable
`docs/` root is not this criterion's case but a root failure." There is no departure left to
disclose. Leaving the sentence in place tells a TSPEC author that a P1 criterion and this FSPEC
disagree, which would be a reason to go and re-check the REQ before transcribing AT-27 — wasted work
at best, and at worst an invitation to "reconcile" AT-27 toward a not-found report that neither
document now wants. F-04.

**EC-11 (feature directory exists but cannot be read).** Unaffected: it is the unreadability case,
which is exactly what REQ-STATS-07 now reserves the gap row for, and D-10's `unreadable_feature`
enum value stands.

**EC-13, EC-14, EC-15.** Re-read against the amended C-5 and REQ-STATS-06. EC-15's argument ("Halts
have no malformed bucket — REQ-STATS-05 defines none") is strengthened by the carve-out: REQ-STATS-05
now explicitly owns the listing, so the absence of a malformed bucket is its choice to have made. No
change.

**EC-21 (unexpected failure computing one feature's metrics).** "Degrades to that feature's gap row;
the remaining features are still reported (BR-27)." Before the erratum, EC-21's authority could be
traced to REQ-STATS-07's "for any feature whose artifacts are missing **or fail to parse**". That
phrase is deleted. The criterion now authorises a gap row on one condition only — the directory
cannot be read — and BR-27 and §3.2 B5 both say so.

That leaves EC-21 specifying a third disposition with no upstream sentence behind it, and AT-20's
second leg asserting it. Two defensible resolutions, and they are not equivalent:

1. **Robustness, not coverage.** EC-21 is a catch-all guard, deliberately below the criterion's
   altitude; then EC-21 should say so and stop citing BR-27 as its authority, §2.1's REQ-STATS-07 row
   should not credit AT-20's second leg to that criterion, and the reason string should be
   distinguishable from a read failure (my v4 Q-01, still unanswered).
2. **Real behaviour the criterion should carry.** Then it is a REQ erratum, not an FSPEC edit — and a
   deliberate one, since the round that just closed narrowed this exact sentence.

Either way the traceability claim as it stands is wrong: a criterion restricted to unreadability is
credited with an AT whose whole point is that it fails an implementation guarding only the read.
F-02, Medium — the behaviour is sound and tested, the trace is not.

## Acceptance Tests

The erratum invalidates no existing AT. It leaves one AT set short of a fixture and one AT leg
mis-credited.

**AT-12 — the AT F-01 needs.** AT-12 today: "two directories, both with `LEARNINGS-{feature}.md`: one
with a surviving `CODE_REVIEW-{feature}-v4.md` and no other, one with none. *Then:* the first reads
exactly `4` and the second reads `harvested`." Both fixtures are on-grammar or empty, so both readings
of BR-11 — bare prefix and version grammar — pass AT-12 identically. Under my "write the test right
now" check, this AT cannot be used to decide which predicate to implement, which is the definition of
a gap once the two predicates diverge.

The discriminating leg is one fixture: a third directory with `LEARNINGS-{feature}.md` present and a
single `CODE_REVIEW-` file that fails the version grammar — `CODE_REVIEW-notes.md`, or another
feature's `CODE_REVIEW-other-feature-v1.md`, which is the realistic one given how these files are
named. *Then:* that directory reads `harvested`, not `0`. Stating the falsifier in the AT, in the form
this document has used well elsewhere: **an implementation whose harvested test globs
`CODE_REVIEW-*` reports `0` here and fails this leg.** That sentence is what stops the leg being
transcribed into a fixture that happens to use a well-formed name and re-collapsing into AT-12.

Worth pairing it with AT-17's ratio fixtures in the TSPEC's mind, because the two metrics now
deliberately differ: the same off-grammar `CODE_REVIEW-other-feature-v1.md` file makes the DoD metric
`harvested` (grammar-scoped, REQ-STATS-04) while keeping the ratio *not* harvested on the DoD side
(prefix-scoped, REQ-STATS-06). A single shared fixture asserting both metrics on that one directory
would pin the split as intentional and make any later "consistency" refactor go red. I would file that
as the strongest available oracle for this erratum, and it costs one directory.

**AT-20 — sound test, wrong credit.** Both legs are good tests and I am not asking for either to
change. The second leg's own sentence — "B5's read failure and EC-21's catch-all are different paths:
only this leg fails an implementation whose guard is around the read alone" — is exactly why §2.1
cannot go on crediting it to REQ-STATS-07 now that REQ-STATS-07 is scoped to the read alone. The AT
states, in its own words, that it tests something the criterion no longer covers. That is F-02's
evidence, and it is in the document already.

**AT-27, AT-23, AT-13, AT-14, AT-14b, AT-17, AT-26, AT-24.** Re-read; all still faithful to the
amended REQ. AT-27's eight-run cross product and its `feature`-per-mode conjunct are, if anything,
better supported now: they test the behaviour REQ-STATS-09 v1.3 demands rather than the behaviour D-9
decided against it. AT-13's foreign-feature basename leg is now the direct oracle for a listing rule
the REQ explicitly owns. No AT needs to be withdrawn or re-fixtured because of this erratum.

**Property-based note, unchanged from v4.** The review-round and DoD basename grammars remain the
parameterisable components in this feature, and the erratum makes the DoD grammar *more* load-bearing,
not less — it is now the discriminator between `harvested` and a measured index. A property over
generated basenames (`CODE_REVIEW-{feature}-v{N}.md` accepted; prefix-matching non-members rejected)
would cover F-01's whole input space rather than the one fixture above. That belongs in PROPERTIES,
not here; I note it so the TSPEC author does not treat the single leg as the ceiling.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Is the granularity split between REQ-STATS-04 (version grammar) and REQ-STATS-06 (bare `CODE_REVIEW-*` prefix) intentional? The erratum narrowed one and not the other in the same commit, which reads deliberate, and BR-16 vs BR-11 would then be intentionally asymmetric. If it is deliberate, say so in one clause at BR-11 so the next editor does not "harmonise" the two and break BR-16. If it is not, the erratum is incomplete and REQ-STATS-06 needs the same narrowing — a REQ edit, not an FSPEC one. (F-01) |
| Q-02 | Which resolution does EC-21 take — robustness guard below the criterion's altitude, or behaviour REQ-STATS-07 should carry? The answer decides whether §2.1's REQ-STATS-07 row keeps AT-20 and whether the gap row's reason must be distinguishable from a read failure. This subsumes my v4 Q-01, which is still open and now has upstream consequences. (F-02) |
| Q-03 | Now that all seven §7.3 errata have landed, should §7.3 be rewritten as a resolved-erratum ledger (what was raised, what the REQ decided, at which REQ version) or removed? A ledger has real value for the harvest phase — it is the record that the FSPEC's decisions were vindicated upstream rather than quietly dropped — but only if it is stamped with REQ v1.3 so it is readable as history rather than as live disagreement. (F-03) |

## Positive Observations

- **The FSPEC won every erratum it raised, and that is a measurable outcome, not a compliment.**
  Seven items were raised in §7.3 against the REQ's wording; the erratum round resolved all seven in
  the direction the FSPEC had reasoned to, in several cases adopting the FSPEC's own sentences
  (BR-16's three-way disjunction, §1's "the driver builds that path from a phase it already holds",
  D-8's "a third bucket would be an independent rule"). A downstream document that decides against
  its upstream and *documents the decision with its rationale* is what made that possible: the REQ
  author had a written argument to accept rather than a silent divergence to discover later.
- **The cascade defect that did land is the one no local review could have caught.** BR-11 was
  correct at every previous round and is wrong now without a byte of the FSPEC changing. §7.3's
  bullet even recorded the assumption it depended on ("so this FSPEC introduces no divergence") —
  which is what let me find it by reading a diff of the *other* document. Recording the assumption a
  literal reading rests on is the practice that turned an invisible breakage into a one-clause fix.
- **The empty-directory disposition converged from both ends.** v1 found a contradiction, BR-27 and
  EC-03 narrowed the FSPEC's behaviour, §7.3 raised the wording, and REQ-STATS-07 now states the
  zero-state row upstream. Three rounds and one erratum, ending with both documents saying the same
  thing in their own registers, and AT-26 and §3.2 B5 pinning it.
- **AT-13's foreign-feature leg predates the criterion that now needs it.** The FSPEC was already
  testing the post-mortem *listing* rule against a foreign-feature basename while C-5 still denied
  the rule existed. When the carve-out landed, the coverage was already in place. Tests written to
  the behaviour rather than to the citation survive upstream edits; that is the general lesson and it
  is worth carrying to LEARNINGS.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | BR-11's harvested predicate still tests the bare `CODE_REVIEW-*` prefix; REQ-STATS-04 v1.3 now tests the `CODE_REVIEW-{feature}-v{N}.md` version grammar. On a harvested directory retaining an off-grammar or foreign-feature `CODE_REVIEW-` file the REQ requires `harvested` and BR-11 yields `0`. §7.3's third bullet explicitly bet that no divergence would arise while the erratum stayed upstream; the erratum has landed and inverted the bet. No AT discriminates: AT-12's two fixtures pass under both readings. Fix: BR-11's predicate, §3.1 A6's decision question, and one AT-12 leg over an off-grammar survivor asserting `harvested` with the falsifier named. Do **not** propagate the narrowing to BR-16 — REQ-STATS-06 kept the prefix reading deliberately. | BR-11, §3.1 A6, AT-12, EC-07, §7.3 |
| F-02 | Medium | delta | local | EC-21 degrades an unexpected metric-computation failure to a gap row citing BR-27, and §2.1 credits AT-20's second leg to REQ-STATS-07. The erratum deleted the phrase that authorised this ("or fail to parse") and restricted the criterion to a directory that cannot be read; BR-27 and §3.2 B5 now match that scope exactly. AT-20's own leg says it tests a path B5's read guard does not cover, so the trace is self-contradicting. Decide EC-21 as a below-criterion robustness guard (drop the BR-27 authority and the §2.1 credit, distinguish the reason string) or raise it as a REQ erratum. Note this withdraws my v4 F-02, which asked to widen BR-27 the way the REQ has since forbidden. | EC-21, BR-27, AT-20, §2.1 REQ-STATS-07 row, §3.2 B5 |
| F-03 | Medium | delta | local | All seven errata in §7.3 have been resolved upstream in REQ v1.3, but §7.3 still presents them as open disagreements ("this FSPEC records which reading it derived from so the two documents can be reconciled without guessing", "the criterion needs the carve-out", "the erratum stays with the REQ"). A reader deciding whether REQ and FSPEC agree — a TSPEC author, or the next reviewer — is told they do not, on a P1 criterion, when they now do. One bullet is worse than stale: the REQ-STATS-04 bullet asserts "this FSPEC introduces no divergence", which F-01 shows is now false. Fix: rewrite §7.3 as a resolved ledger stamped `REQ v1.3` (raised → decided → landed) or delete it, and correct the REQ-STATS-04 bullet as part of F-01's fix rather than leaving it as a live claim. | §7.3, and each of its seven bullets |
| F-04 | Low | delta | local | Four in-rule sentences quote or characterise pre-erratum REQ text that no longer exists: EC-09's "That departs from REQ-STATS-09's *Given*, which sweeps this case in"; D-9's question framing ("A repository with no `docs/` root at all satisfies REQ-STATS-09's *Given*"); D-8's "The cost … is a defect of the upstream criterion and is raised as an erratum"; BR-27's quotation of "missing or fail to parse … reports it by name as missing/malformed" plus "so the wording is raised as an erratum". All four now hold behaviour the REQ endorses, so nothing is untestable and no AT moves — but a rule that quotes deleted upstream text is a citation that cannot be checked, and these are the sentences a reader uses to decide whether to trust the rule above them. Fix: one clause each, restating the decision as upstream-aligned rather than as a departure. | EC-09, D-8, D-9, BR-27 |

FINDING: High | delta | local | BR-11 / §3.1 A6 / AT-12 | BR-11's harvested predicate still reads the bare `CODE_REVIEW-*` prefix while REQ-STATS-04 v1.3 reads the `CODE_REVIEW-{feature}-v{N}.md` version grammar; an off-grammar or foreign-feature survivor makes the REQ say `harvested` and BR-11 say `0`, and AT-12's fixtures pass under both readings so no test discriminates.
FINDING: Medium | delta | local | EC-21 / BR-27 / §2.1 REQ-STATS-07 row | The erratum deleted "or fail to parse" and restricted REQ-STATS-07's gap row to an unreadable directory, leaving EC-21's computation-failure gap row citing BR-27 without upstream authority and AT-20's second leg credited to a criterion it explicitly does not test.
FINDING: Medium | delta | local | §7.3 | All seven §7.3 errata landed in REQ v1.3 but §7.3 still presents them as open disagreements, and its REQ-STATS-04 bullet asserts "this FSPEC introduces no divergence", which F-01 shows is now false.
FINDING: Low | delta | local | EC-09 / D-8 / D-9 / BR-27 | Four in-rule sentences quote or characterise pre-erratum REQ wording that no longer exists, telling the reader the FSPEC departs from a criterion that now agrees with it.

## Recommendation

**Needs revision.** The FSPEC no longer holds against the REQ as it now stands on one path: BR-11 and
REQ-STATS-04 report different values for the same directory, and no acceptance test can tell the
readings apart. That is a High and it gates by the standing rule.

It is a narrow revision, and none of it is re-litigation. F-01 is one clause on BR-11, one decision
question in §3.1 A6, and one AT-12 leg with its falsifier named — plus the §7.3 bullet whose
assumption it invalidates. F-02 is a disposition choice on EC-21 (robustness guard or REQ erratum)
and the §2.1 credit that follows from it. F-03 and F-04 are the stale-upstream sweep this erratum
made necessary and can be done in one pass.

Everything else confirmed clean. Seven of the nine REQ edits are upstream adopting decisions this
FSPEC had already made and defended, and in those places the two documents now agree word for word —
BR-16, BR-12, §1's fidelity anchor, BR-27's scope, EC-03, EC-05, BR-22 and the whole of AT-27, AT-13
and AT-17 are unaffected. No acceptance test is withdrawn or re-fixtured by this cascade; the AT set
gains one leg and loses none.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
