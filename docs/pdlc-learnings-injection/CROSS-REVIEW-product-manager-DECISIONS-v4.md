# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 4 (upstream-cascade confirmation; DECISIONS bytes unchanged)
**Scope:** Local

## Context

I approved DECISIONS at v3 (`Approved with minor changes`, 0 High / 2 Medium / 1 Low) with
`REVIEWED-COMMIT: 42515b3e` and `UPSTREAM-STATE: FSPEC sha256:a4f775bd…` — FSPEC **v0.10**, commit
`9a4b7593`. FSPEC at HEAD is `sha256:fb18dbda…` (commit `c1d7218e`, **v0.12**). REQ
(`sha256:ff605dd3…`) and TSPEC (`sha256:eff5a19b…`) are byte-identical to the versions my v3
approval was recorded against, so the whole cascade lives in FSPEC.

DECISIONS' own bytes have not moved since `42515b3e` (`sha256:85888c03…`, unchanged). The only
question is whether it is still a faithful compression of upstream as upstream now stands. Per
DEC-ERR-03 I re-read the whole span `9a4b7593..c1d7218e`, not the last commit, because my approval
was recorded against the older blob:

| FSPEC round | What moved |
|---|---|
| v0.11 (`c9f672c3`, `1b4dc3de`) | **Substantive.** `BR-1` restated as a **two-conjunct** rule — authoring-classified **and** target document among REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES (REQ C-1) — so an authoring-tagged dispatch with no C-1 target (Phase CR's optimizer round) is outside the rule. `BR-15`'s expected read set drops the corpus enumeration as a member and is stated as an enumerable set equality. AT-02 and AT-33 track both. |
| v0.12 (`3f21bd3b` … `c1d7218e`) | BR-1's complement carried through: `BR-11`, AT-03 and AT-29 quantify over dispatches **outside BR-1's rule** rather than "non-authoring" ones; `D-2` becomes a three-branch question naming the authoring-classified non-C-1 target; AT-02 gains the fixture that reds when the second conjunct is reverted; the Overview and `A-2` stop restating one conjunct when deferring to BR-1; `BR-15`'s expected side stated as a set, not a count; the header Cross-Reviews row stops hand-enumerating rounds. |

The load-bearing observation for this confirmation: the FSPEC delta moves BR-1 **toward** the gate
DEC-LI-03 already decided, not away from it. So the confirmation question is not "did a decision
get contradicted" but the narrower one DEC-ERR-03 asks — does anything DECISIONS *says about*
upstream no longer match what upstream says, or no longer say it the same way.

## Options Considered

Three readings of this cascade were live before I traced the text. Evidence picks one.

**Reading A — the delta strengthens DEC-LI-03, so confirm and move on.** FSPEC v0.11 rewrote BR-1
into exactly the two-conjunct rule DEC-LI-03 chose, and v0.12 named Phase CR's optimizer round as
the branch the second conjunct excludes — the same call site, with the same `docType: null`
evidence, that DEC-LI-03's *"gate on `dispatchKind === \"authoring\"` alone"* rejection cites.
**Rejected as the whole story.** A delta that agrees with a decision can still falsify a *sentence*
about upstream, and DEC-LI-03 quotes FSPEC `A-2` by its old wording. Confirming on agreement alone
would have skipped that.

**Reading B — the BR-1 restatement makes DECISIONS' own claim stale, halt.** DECISIONS §Scope says
*"no behaviour rule (FSPEC `BR-1` … `BR-16`) is re-decided here"*, and DEC-LI-03 nonetheless writes
a two-conjunct gate expression. If FSPEC previously carried a one-conjunct BR-1, then at approval
time DECISIONS *was* deciding behaviour, and FSPEC has now absorbed it — which would make the
DECISIONS entry a rule restatement rather than a rationale record. **Rejected on evidence.** BR-1
was never the whole gate: REQ **C-1** has been the two-part rule (`authoring-classified` **and**
target ∈ six types) throughout, and DEC-LI-03's *"Constraints that forced the shape"* cites C-1
directly, not BR-1. What v0.11/v0.12 did was make FSPEC state C-1's second conjunct explicitly
instead of leaving it implied. DECISIONS decided *where the gate is written* (`dispatchAndVerify`,
once) — an attachment-point choice, not a behaviour rule — and that is untouched.

**Reading C — the decisions hold; a small number of sentences *about* upstream have gone stale.**
This is what the trace supports, and it is the same failure mode I recorded at v3: DECISIONS is the
one artifact in this pipeline that narrates the *state* of its siblings, so sibling motion ages it
even when nothing it decides is wrong. At v3 that produced F-01 (AC-3.3 locus described as open,
closed upstream), F-02 (TSPEC divergence described as live, landed in TSPEC v0.6) and F-03 (stale
version pins). DECISIONS' bytes have not moved since, so all three are still on the page — carried
here as **inherited**, and F-03 has drifted further (`FSPEC v0.7` pinned against v0.12 at HEAD).
This round's delta adds one more of the same shape: DEC-LI-03's re-evaluation trigger paraphrases
FSPEC `A-2`, and `A-2` was reworded by the v0.12 edit.

I also considered filing the `A-2` paraphrase as Medium rather than Low. Rejected: unlike F-01 and
F-02, it does not tell a downstream author that a settled question is open — the exclusion default
it relies on is still exactly what `A-2` states at HEAD. It is a wording drift in a trigger clause,
not a false statement about pipeline state.

## Decision

**DECISIONS still holds as approved against FSPEC at HEAD.** No decision it takes is contradicted by
FSPEC v0.11–v0.12; the one substantive upstream move (BR-1's second conjunct made explicit) lands on
the same side of the argument DEC-LI-03 already made. One new citation defect from this delta, three
inherited from v3, all non-gating.

### Clause-by-clause re-verification against upstream at HEAD

| DECISIONS claim | Upstream at HEAD | Holds? |
|---|---|---|
| DEC-LI-03 decision: gate is `dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)` | FSPEC `BR-1` now states the identical two conjuncts, naming REQ C-1 | Yes — strengthened |
| DEC-LI-03 rejection: *"gate on `dispatchKind` alone … admits Phase CR's optimizer — `se-author` remediating shipped code, with no target document at all — which is exactly what REQ C-1 and NG-5 exclude"* | BR-1 at HEAD: *"an authoring-classified dispatch whose target is none of those six document types (the code-review phase's optimizer round at HEAD) is outside the rule, which is what REQ AC-1.2 and NG-5 decide"* | Yes — upstream now says it in its own voice |
| DEC-LI-03 rejection: *"gate on `docType` alone … admits every reviewer round and violates `BR-1`'s exclusion list"* | BR-1 retains its **Excluded** bullet (every review dispatch, implementation, DoD, harvest, ship, advisory seams) | Yes |
| DEC-LI-03 funnelling guard: producer-set pinning test, four members at HEAD | Unchanged by delta; G-B/G-C evidence rows read pre-feature source, not FSPEC | Yes |
| DEC-LI-03 trigger: *"a dispatch kind that is authoring in spirit but not so classified (FSPEC `A-2`'s stated default is that it is excluded)"* | `A-2` reworded: it now quantifies over a dispatch that *"satisfies **neither** conjunct in the pipeline's own terms yet is authoring in spirit"* | **Partly** — see F-04 |
| §Scope: *"no behaviour rule (FSPEC `BR-1` … `BR-16`) is re-decided here"* | BR-1/BR-11 rewritten but the rule's extension is unchanged; DECISIONS decides attachment point, not membership | Yes |
| DEC-LI-10: `LEARNINGS_TARGET_DOCTYPES` expected membership hand-transcribed from **REQ C-1's** six names | REQ byte-identical this round; BR-1 now names the same six | Yes |
| DEC-LI-06 constraints: *"REQ NG-4 and FSPEC `BR-15` state that the run creates no index, cache or state file anywhere, and AC-5.2's filesystem-footprint oracle asserts it"* | `BR-15`'s **expected-set** definition changed (enumeration contributes no member; sets not counts) — the no-artefact clause DECISIONS cites is untouched | Yes |
| DEC-LI-06 trigger: *"FSPEC relaxes E-32 to a run-scoped observation"* | E-32 untouched by delta | Yes |
| DEC-LI-07: five-state table transcribed from FSPEC `BR-14` | `BR-14` untouched by delta | Yes |
| DEC-LI-04 / DEC-LI-05 / DEC-LI-08 / DEC-LI-09: `BR-3`, `BR-7`, `BR-12` groundings | None touched by delta | Yes |
| Non-decision row: AC-3.3 record locus *"open, routed to REQ via TSPEC `ERR-6`"*; *"TSPEC keeps the run-level record (last-write-wins)"* | Closed upstream since FSPEC v0.9 / TSPEC v0.6 | **No** — F-01 (inherited from v3) |
| DEC-LI-07: *"TSPEC v0.5 still builds the injector on `present && config.enabled && !sectionMalformed` … still carries `OQ.2` and `ERR-4` open"* | TSPEC v0.6 records `ERR-4` **CLOSED**, gates on `config.enabled` alone | **No** — F-02 (inherited from v3) |
| Header/upstream-note pins: `TSPEC v0.5`, `FSPEC v0.7`; DEC-LI-07's *"FSPEC v0.7 `BR-14`"* | TSPEC v0.6, FSPEC **v0.12** | **No** — F-03 (inherited from v3, drifted further) |

F-01, F-02 and F-03 were raised at v3 against unchanged bytes and remain unaddressed; they are
recorded here as `inherited` so this round routes back to the owning phase rather than halting. F-04
is this round's own, and is Low: the exclusion default DEC-LI-03 leans on is still `A-2`'s default at
HEAD, so the trigger fires on the same condition — only the sentence quoting it has aged.

## Consequences

**For this round.** The confirmation approves. FSPEC v0.11–v0.12 absorbed a rule DECISIONS had
already reasoned to, and re-decided nothing DECISIONS owns. Four findings stand, all citation
defects, none blocking: PLAN and PROPERTIES read DECISIONS for rationale and read FSPEC/TSPEC for
contract, and those two documents agree with each other at HEAD.

**For the next authoring pass on DECISIONS**, the edits I would make, unchanged from v3 plus one:

1. Replace the AC-3.3 locus row in *"Decisions deliberately NOT taken here"* with the settled
   answer: FSPEC `BR-10` fixes two loci — ordering-key values per authoring dispatch, §4.1
   thresholds once per run — one completeness test each, run-level mirror additive and unasserted.
   Keep the row; change what it says. (F-01)
2. Rewrite DEC-LI-07's *"divergence from TSPEC"* paragraph in the past tense: `DEC-ERR-01` landed in
   TSPEC v0.6, `ERR-4` is CLOSED, the gate is `config.enabled` alone, and `D-O-9` is discharged
   rather than outstanding. (F-02)
3. Repin: header `Upstream` row and `**Upstream version note**` to TSPEC v0.6 / FSPEC v0.12; DEC-LI-07's
   *"FSPEC v0.7 `BR-14`"* to v0.12 (the cited `BR-14` text is unchanged, so this is a pin edit only).
   (F-03)
4. Align DEC-LI-03's re-evaluation trigger with `A-2` as reworded: the excluded-by-construction
   default now covers a dispatch failing **either** conjunct, and the authoring-classified non-C-1
   target is named by `BR-1` itself rather than left to `A-2`. One clause. (F-04)

**For the pipeline.** This is the second consecutive confirmation where every finding against
DECISIONS is a stale sentence about a sibling document, and none is a wrong decision. That is a
durable signal, not a run of bad luck. DECISIONS is the only artifact in this pipeline whose value
partly comes from *narrating upstream state* — "TSPEC still carries `ERR-4` open", "FSPEC `A-2`'s
stated default is…" — which is genuinely useful to a future agent and is also the one property that
guarantees staleness the moment a sibling moves, with nothing mechanically detecting it. Two
`Process`-flavoured harvest candidates fall out: (a) an upstream-quote convention for DECISIONS —
cite the **spec id** and the claim, never the version-pinned sentence, so a reworded upstream
paragraph does not falsify a rationale record; (b) a cascade check that re-reads DECISIONS' explicit
"still open / owned there" pointers against the named owner's current status, since those are the
sentences that go false silently.

**On this confirmation itself.** The routed item list was FSPEC's BR-1/BR-11/BR-15 erratum — none of
which names DECISIONS. Confirming on the item list alone would have returned a clean approval over
four stale citations, three of them already outstanding. Re-reading the upstream text this document
leans on, at HEAD, across the whole span since the recorded `UPSTREAM-STATE`, is what DEC-ERR-03
asks for and is what surfaced F-04.

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
