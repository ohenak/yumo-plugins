# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation, TSPEC)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (bytes unchanged since v4, sha256:85888c03…)
**Upstream re-read:** TSPEC `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (sha256:f629d29d…, v0.7)
**Date:** 2026-08-20
**Iteration:** 5 (upstream-cascade confirmation — TSPEC moved, DECISIONS did not)

## Context

DECISIONS' own bytes have not moved since v4 (`APPROVAL-HASH: sha256:85888c03…`, reviewed commit
`82bd5869`). What moved is **TSPEC**. v4 recorded `UPSTREAM-STATE: TSPEC sha256:eff5a19b…` — commit
`ccc739d1`, TSPEC **v0.6**. HEAD is sha256:f629d29d… — commit `bfe58851`, TSPEC **v0.7**. Six
commits landed on the path in between:

| Commits | Substance |
|---|---|
| `e33425a6` | Header re-grounded: Upstream row moves FSPEC v0.9 → **v0.12**, version 0.6 → **0.7**, and a v0.7 erratum block is added recording "no behavioural change" |
| `cb4dae90`, `35dc817f` | **ERR-7 CLOSED.** §A.2 stops routing the `docType` conjunct as a divergence from FSPEC `BR-1` and states it as an implementation *of* `BR-1`'s two-conjunct rule; `BR-11`'s complement is restated as "outside `BR-1`'s rule" rather than "non-authoring". **ERR-3 CLOSED** on FSPEC v0.11 dropping the corpus enumeration from `BR-15`'s expected read set |
| `2c8b880c` | §D.1's four domain-membership tests are scoped to **non-`null`** values (`v === null \|\| catalogue.includes(v)`), because `null` is `corpusOutcome`'s healthy value; `LEARNINGS_CORPUS_OUTCOMES`' set-equality test is explicitly unchanged |
| `4fe44ecb`, `dfd8c1ff`, `bfe58851` | DEC-DOC-01 de-anchoring: P-2a, P-2b, P-10, ERR-2 and §A.2's Phase CR citation move from `file:line` to symbol/call-shape citations. No claim changes |

The confirmation question is not "did the items land" — they did — but whether DECISIONS is still a
faithful compression of TSPEC **as it now stands** (DEC-ERR-03). I re-read every TSPEC section
DECISIONS cites by id or paraphrases, at HEAD: §A.2, §D.1, §D.2, §I.3, §T.5/§T.6, the ground-truth
table `P-1`…`P-12`, the divergence table, `OQ.2`, and `ERR-2`/`ERR-3`/`ERR-4`/`ERR-6`/`ERR-7`.
I did not re-read DECISIONS end to end and did not revisit a settled decision.

Two structural facts frame everything below. First, **this is the first cascade confirmation for
DECISIONS whose trigger is TSPEC** — v3 and v4 were FSPEC cascades, and TSPEC's state was recorded
in their `UPSTREAM-STATE` trailers but not re-derived. So the drift this round surfaces is mostly
**inherited**: it was already present in the pre-round TSPEC bytes (`eff5a19b`, v0.6) and this
round's six commits did not create it. That provenance is not a technicality — it is what keeps the
round non-gating and routes the fixes back to DECISIONS' own revision loop. Second, the direction of
every delta in the table above is **toward** this document: ERR-7's closure makes the two-conjunct
gate `DEC-LI-03` decided the upstream rule rather than a divergence from it, and the de-anchoring
commits move TSPEC to the same symbol-citation convention DECISIONS' own preamble already declares.

## Options Considered

**(a) The delta invalidates a decision — non-approving, `delta/local` High.** The reading ERR-7's
closure would earn if `DEC-LI-03` had been *predicated* on the divergence: DECISIONS gates the
injector on `dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)`, and TSPEC
v0.6 §A.2 said that conjunct was something "FSPEC `BR-1` as written forbids", routed as ERR-7. Had
v0.7 resolved ERR-7 the *other* way — by dropping the `docType` conjunct — `DEC-LI-03`, `D-O-8`'s
producer-set guard and `AT-02`'s expected set would all have moved under this document. That is the
first thing I checked. It did not happen: §A.2 at HEAD keeps the conjunct, names it "load-bearing,
not defensive", and closes ERR-7 by pointing at FSPEC v0.11/v0.12 having adopted it. `§I.3`'s
`docType ∈ LEARNINGS_TARGET_DOCTYPES` predicate is unchanged. Reading (a) has no support in the
bytes.

**(b) Nothing to say — approve silently.** Wrong, and this round wrong for a sharper reason than v4's.
`DEC-LI-07` does not merely *cite* TSPEC; it asserts a **live disagreement** with it, in the present
tense, and hands `D-O-9` downstream as an obligation TSPEC still owes. At HEAD that disagreement no
longer exists in either direction: TSPEC §I.3 gates on `config.enabled` **alone**, the divergence
table's `enabled` row reads "Settled upstream by REQ v0.9 (ERR-4 closed)", `OQ.2` is headed "CLOSED
by REQ v0.9" with the three forced edits recorded as "they have now been made", and `ERR-4` is
retired. `D-O-9` is discharged. A silent approval leaves a document telling PROPERTIES and PLAN
authors — its two named readers — that TSPEC §I.3 carries a gate it does not carry, and leaves an
obligation table listing a discharged obligation as outstanding. That is exactly the citation-currency
class DEC-ERR-03 asks this round to catch, and it is a stronger instance than v4's `A-2` paraphrase,
because here the stale sentence is not a paraphrase but a claim about another document's current
content.

**(c) Faithful-but-drifted — approve with tagged, non-gating findings.** What the bytes support. No
decision is invalidated; no obligation in `D-O-1`…`D-O-8` loses falsifying power; the compression
still holds everywhere it makes a behavioural claim, and on `DEC-LI-03` it is *better* backed than
it was, since the conjunct TSPEC once flagged as a divergence is now the upstream rule at both FSPEC
and TSPEC. What has drifted is **citation currency about TSPEC's own state**: two paragraphs and one
obligation row describe a TSPEC that stopped existing at v0.6, and the header's version note pins
TSPEC v0.5. None of it blocks PROPERTIES authoring — the decisions those authors must implement are
correct and now agree with TSPEC — but all of it misdirects a reader who follows the citation.

## Decision

**DECISIONS still holds as approved against TSPEC v0.7.** Reading (c) — Approved with minor changes,
four Medium and two Low findings, none gating, none reopening a decision.

Every claim DECISIONS makes that reaches TSPEC, re-derived against HEAD rather than against the v0.6
bytes v4 recorded:

| DECISIONS claim | TSPEC at HEAD (v0.7) | Verdict |
|---|---|---|
| `DEC-LI-03`'s gate: `dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)` | §A.2 keeps the conjunct, calls it "load-bearing, not defensive", and §I.3's predicate is unchanged | **Holds, newly backed** — the conjunct TSPEC v0.6 routed as ERR-7 is now stated as implementing `BR-1` |
| `G-B`: four code sites carry the authoring classification, all funnelling through `dispatchAndVerify`; evidence given as "the three object-literal sites plus `reviewLoop`'s positional argument" | `P-2a` rewritten to exactly that decomposition — three object literals (`converge()`'s phase creator, `erratumRound()`'s author dispatch and its land-proof retry) plus `reviewLoop`'s positional `"authoring"` to `runWrapped` | **Holds; convergent** — the de-anchored `P-2a` now reads the way DECISIONS already wrote it |
| `G-C`: Phase CR calls the shared `reviewLoop` with `docType: null` over a directory target, and the `null` survives to `dispatchAndVerify` | `P-2b` restates the same chain by symbol (`roundDocType` derivation, `wrapped` forwarding), line anchors dropped | **Holds** — same mechanism, same measured witness |
| `DEC-LI-06`: no cache of our own; the refusal is defended by `D-O-6`'s call counts | Divergence table's "Corpus caching" row still rejects a run-scoped memo on E-32/AT-14 grounds; untouched by this delta | **Holds** (its *reversibility ground* is v4's F-01, still unlanded) |
| `DEC-LI-07`: "TSPEC v0.5 **still** builds the injector on `present && config.enabled && !sectionMalformed` (§I.3) and **still carries** `OQ.2` and `ERR-4` open… raised as **DEC-ERR-01 against TSPEC**… **Until TSPEC lands that edit**, `D-O-5` is the standing protection" | §I.3 gates on `config.enabled` alone; `OQ.2` is "CLOSED by REQ v0.9" and records the three forced edits as made; `ERR-4` is "CLOSED, resolved by REQ v0.9"; `LEARNINGS_DEFAULTS.enabled === true` | Decision **holds and now agrees with TSPEC**; the surrounding paragraph **is false at HEAD** — F-01 |
| `D-O-9`: "TSPEC closes `OQ.2`, retires `ERR-4`, drops the `present`/`sectionMalformed` conjuncts… must land before `AT-31`/`AT-32` are authored" | All four landed at or before v0.6 | **Discharged**, but still tabled as outstanding — F-01 |
| §Decisions deliberately NOT taken, row 4: AC-3.3's locus is routed "via **TSPEC `ERR-6`**"; "TSPEC keeps the run-level record (last-write-wins)" | `ERR-6` is "CLOSED, resolved by REQ v0.9"; §D.2 makes the **per-dispatch** field the oracle locus and the run-level mirror "additive… not the oracle" | **Drifted on both halves** — F-02 (compounds v4's F-03 against FSPEC `BR-10`) |
| `DEC-LI-10`: three closed catalogues, completeness tests assert **set equality** against hand-transcribed sets | §D.1 unchanged for completeness; its separate **domain-membership** tests are now scoped to non-`null` | **Holds** — completeness ≠ domain; `LEARNINGS_CORPUS_OUTCOMES`' set equality is explicitly unchanged. See F-06 for the oracle consequence |
| Header preamble: citations name symbols, not lines, per `DEC-DOC-01` | TSPEC's de-anchoring commits adopt the same convention | **Holds; convergent** |
| Header "Upstream version note": "TSPEC v0.5… REQ v0.9 and FSPEC v0.7 settled…" | TSPEC is v0.7, grounded on FSPEC **v0.12** | **Stale pin** — F-03 |

The two findings this round adds (F-01, F-02) are both **inherited**: the TSPEC edits that made them
stale landed before `eff5a19b`, the version v4 recorded. This delta neither created nor worsened
them. It is what made them visible, because a TSPEC-triggered cascade is the round whose job is to
re-derive TSPEC citations.

## Consequences

**For PROPERTIES, which is the next reader.** Nothing in this round blocks it. The gate it must
write `AT-31`/`AT-32` against is now stated identically in TSPEC §I.3 and `DEC-LI-07`'s Decision, so
the hazard `D-O-9` existed to prevent — a property authored against a superseded gate — is closed on
the substance. Two items are worth landing before transcription anyway, both carried from v4: F-04
(`DEC-LI-06`'s reversibility ground still credits `AC-5.2` with cache detection `BR-15`'s path-set
form no longer performs, leaving `D-O-6`'s counts as the sole falsifier) and F-02 (row 4 still points
at a run-level record TSPEC has demoted to a non-asserted mirror). A PROPERTIES author who follows
row 4 writes a completeness assertion over the mirror: green on a single-dispatch fixture, silently
wrong on `AT-18`'s divergent run. That is the one drift in this round with a path to a false green.

**On the oracle arithmetic of the `null` scoping (F-06).** §D.1's domain tests now read
`v === null || catalogue.includes(v)`, which is correct — `null` is `corpusOutcome`'s healthy value
and an unscoped assertion would red every happy-path run — but it is a real loss of bite on exactly
one axis: a `corpusOutcome` that is `null` where `RSN-UNLISTABLE` was required now satisfies the
domain test. The compensating oracle exists and this document owns it: `D-O-6` requires the positive
behavioural case ("an enumeration succeeding at dispatch 1 but failing at dispatch 5 records
`RSN-UNLISTABLE` at 5"), which is a positive-value assertion, not a domain one. So the invariant is
still falsifiable — but `D-O-6` is now its **only** falsifier, and nothing in DECISIONS says so.
This is the same shape as v4's F-01: an upstream edit that improves an oracle can simultaneously
retire the falsifying power a downstream document was implicitly leaning on.

**For the harvest phase.** The reusable lesson here is a `Process` one about cascade coverage, and
it is worth recording: *a document's own trailer can record an upstream sha without anyone ever
having re-derived that upstream's citations.* v3 and v4 both carried `UPSTREAM-STATE: TSPEC …` while
reviewing against FSPEC; the TSPEC citations went unchecked across two rounds, and `DEC-LI-07`'s
present-tense claim about TSPEC's content had been false since v0.6 without any round being wrong to
approve. Recording an upstream sha is a *statement of what was current*, not a *claim of what was
checked*. The cheap fix in this role's cascade protocol: when the trigger document changes, re-derive
its citations — and treat every present-tense claim about a **sibling document's current state**
(`TSPEC still carries X`, `until TSPEC lands Y`) as a citation with an expiry date, checked on every
cascade regardless of trigger. Those sentences age differently from claims about behaviour: behaviour
claims stay true until the design changes, sibling-state claims become false the moment the sibling
complies.

**What this round did not do.** I did not re-read DECISIONS end to end, did not re-derive its
code-level claims at HEAD, and did not revisit any settled decision. TSPEC was read at HEAD in the
sections `ccc739d1..bfe58851` touched, plus every section DECISIONS cites by id or describes in the
present tense.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | `DEC-LI-07`'s closing paragraph asserts a **live** disagreement with TSPEC in the present tense — "TSPEC v0.5 **still** builds the injector on `present && config.enabled && !sectionMalformed` (§I.3) and **still carries** `OQ.2` and `ERR-4` open", raised as `DEC-ERR-01`, with "**Until TSPEC lands that edit**, `D-O-5` is the standing protection". At TSPEC HEAD all four requested edits are landed: §I.3 gates on `config.enabled` alone ("There is no `present` conjunct and no `!sectionMalformed` conjunct"), `OQ.2` is headed "CLOSED by REQ v0.9" and records the three forced edits as made, `ERR-4` is "CLOSED, resolved by REQ v0.9", and `LEARNINGS_DEFAULTS.enabled === true`. `D-O-9` therefore lists a **discharged** obligation as outstanding. The decision itself is correct and now agrees with TSPEC; what is false is the claim about the sibling document's current content, addressed to the two readers (PROPERTIES, PLAN) the paragraph itself names. Fix: restate as settled — `DEC-ERR-01` landed in TSPEC v0.6, §I.3 now matches this entry — and mark `D-O-9` discharged, keeping `D-O-5` as the standing IMPL guard on its own merit | `DEC-LI-07` §"The divergence from TSPEC is a recorded erratum"; obligations table `D-O-9` |
| F-02 | Medium | inherited | nonlocal | §Decisions deliberately NOT taken, row 4 is stale on both halves of its TSPEC citation. It routes AC-3.3's locus "via **TSPEC `ERR-6`**, which already routes this to REQ AC-3.3" — `ERR-6` at HEAD is "CLOSED, resolved by REQ v0.9" — and states "TSPEC keeps the run-level record (last-write-wins)", while TSPEC §D.2 now makes the **per-dispatch** `corpusOutcome` the oracle locus and the run-level mirror "additive… not the oracle", with §D.1's mirror test a membership test only, "so it does not turn the mirror into an oracle". This is v4's F-03 (there measured against FSPEC `BR-10`) now confirmed against TSPEC as well: both upstreams have settled the question the row presents as open, in the direction opposite to the locus the row endorses. Highest-consequence item in this round — a PROPERTIES author following it asserts completeness over a non-oracle: green on a single-dispatch fixture, silently wrong on `AT-18`'s divergent run. Fix: replace the row with the settled answer (two loci, one completeness test each, mirror unasserted) and drop the `ERR-6` routing. v4's F-05 rides with it: neither per-locus test is owned by any `D-O` obligation, and `DEC-LI-10`'s DC-14 rule covers only the three id catalogues | §Decisions deliberately NOT taken, row 4; `D-O` obligations table |
| F-03 | Low | inherited | nonlocal | The header's "Upstream version note" pins "**TSPEC v0.5** was authored against FSPEC v0.5 / REQ v0.7" and "REQ v0.9 and **FSPEC v0.7** settled the shipping-default question". TSPEC at HEAD is **v0.7**, grounded on **FSPEC v0.12** / REQ v0.9. The substantive point the note makes (this document is grounded on current upstream) is unaffected, and it compounds v4's F-04 (`DEC-LI-07` §Context still pinning "FSPEC v0.7" for `BR-14`'s five states) — version-pinned citations naming versions several erratum rounds behind cannot be checked without redoing the diff. Fix: refresh all three pins to TSPEC v0.7 / FSPEC v0.12 / REQ v0.9 in one pass | Header §Upstream version note; `DEC-LI-07` §Context |
| F-04 | Medium | inherited | nonlocal | v4's F-01, unlanded: `DEC-LI-06`'s reversibility is stated **Hard** on the ground that adding a cache "means revisiting `E-32` and `AC-5.2` upstream first", listing "`AC-5.2` (positive-membership filesystem oracle)" among the constraints forcing the no-cache shape. FSPEC `BR-15` compares expected and observed reads as **sets of paths, not counts**, so a per-dispatch or run-scoped read memo leaves the verdict identical and `AC-5.2` no longer detects the reversal it is cited as guarding. Unchanged by this delta — TSPEC's "Corpus caching" divergence row still rejects the memo on `E-32`/`AT-14` grounds, which is the surviving ground. Fix: restate the reversibility ground as `E-32` + `D-O-6`, and note that `AC-5.2` is footprint-shaped, not cache-detecting | `DEC-LI-06` §Reversibility; §Constraints forcing the shape |
| F-05 | Medium | inherited | nonlocal | v4's F-02, unlanded: `DEC-LI-03`'s re-evaluation trigger paraphrases FSPEC `A-2` as covering a dispatch "authoring in spirit **but not so classified**", while `A-2` at HEAD quantifies only over a dispatch satisfying "**neither** conjunct in the pipeline's own terms yet authoring in spirit". The exclusion still holds via `BR-1`'s two-conjunct rule — and TSPEC v0.7 §A.2 now states that rule as settled rather than routed (ERR-7 CLOSED), which strengthens the available authority — but a reader checking the trigger against `A-2` will not find the sentence DECISIONS attributes to it. Fix: re-cite `BR-1`'s two-conjunct rule as the authority, keeping `A-2` as the widening-is-explicit default | `DEC-LI-03` §Re-evaluation trigger |
| F-06 | Low | delta | local | This delta scoped TSPEC §D.1's domain-membership tests to non-`null` values (`v === null \|\| catalogue.includes(v)`), correctly — `null` is `corpusOutcome`'s healthy value and an unscoped assertion would red every happy-path run — but the scoped test can no longer falsify a `corpusOutcome` that is `null` where `RSN-UNLISTABLE` or `RSN-EMPTY` was required. The compensating oracle exists and this document owns it: `D-O-6`'s positive behavioural case ("an enumeration succeeding at dispatch 1 but failing at dispatch 5 records `RSN-UNLISTABLE` at 5") is a positive-value assertion. `D-O-6` is now the **sole** falsifier of a wrongly-`null` corpus outcome, and nothing in `DEC-LI-10` or `D-O-6` says so, so a PROPERTIES author trimming `D-O-6` to its count conjunct would leave the invariant unguarded. Fix: add one clause to `D-O-6` naming the positive-value case as non-negotiable now that the domain test admits `null`; no decision changes | `DEC-LI-10`; obligations table `D-O-6` (against TSPEC §D.1) |

FINDING: Medium | inherited | nonlocal | DEC-LI-07 §"The divergence from TSPEC is a recorded erratum" and D-O-9 | The entry asserts in the present tense that TSPEC still gates §I.3 on `present && config.enabled && !sectionMalformed` and still carries OQ.2 and ERR-4 open, and hands D-O-9 downstream as an obligation TSPEC still owes; at TSPEC HEAD all four DEC-ERR-01 edits landed (§I.3 gates on config.enabled alone, OQ.2 CLOSED, ERR-4 CLOSED, LEARNINGS_DEFAULTS.enabled true), so the paragraph is false and D-O-9 is discharged while still tabled as outstanding
FINDING: Medium | inherited | nonlocal | §Decisions deliberately NOT taken, row 4 | The row routes AC-3.3's locus via TSPEC ERR-6 (CLOSED at HEAD) and states TSPEC keeps the run-level record, while TSPEC §D.2 now makes the per-dispatch corpusOutcome the oracle locus and the run-level mirror explicitly not an oracle, so a PROPERTIES author following the row asserts completeness over a non-oracle that is green on a single-dispatch fixture and silently wrong on AT-18's divergent run
FINDING: Low | inherited | nonlocal | Header §Upstream version note; DEC-LI-07 §Context | Version pins name TSPEC v0.5 and FSPEC v0.7 while HEAD is TSPEC v0.7 grounded on FSPEC v0.12; the substantive claims remain true but cannot be checked without redoing the diff
FINDING: Medium | inherited | nonlocal | DEC-LI-06 §Reversibility | v4 F-01 remains unlanded: the Hard reversibility is grounded on AC-5.2 breaking if a cache is added, but BR-15 compares reads as sets of paths so a read memo changes no member; E-32 plus D-O-6's call counts are the surviving ground and the entry should say so
FINDING: Medium | inherited | nonlocal | DEC-LI-03 §Re-evaluation trigger | v4 F-02 remains unlanded: the trigger attributes to FSPEC A-2 a sentence covering a dispatch "authoring in spirit but not so classified", while A-2 at HEAD quantifies only over a dispatch satisfying neither conjunct; BR-1's two-conjunct rule, now settled in both FSPEC and TSPEC, is the citation that actually holds
FINDING: Low | delta | local | DEC-LI-10 / D-O-6 against TSPEC §D.1 | This delta scoped §D.1's domain-membership tests to non-`null` values, correctly, but the scoped test can no longer falsify a corpusOutcome that is null where a catalogued reason was required; D-O-6's positive behavioural case is now the sole falsifier and neither DEC-LI-10 nor D-O-6 records that dependency

## Recommendation

**Approved with minor changes** — DECISIONS still holds as approved against TSPEC v0.7. The erratum
round moved TSPEC **toward** this document on the one point where the two documents were in stated
conflict: `ERR-7` is closed with the `docType` conjunct kept, so `DEC-LI-03`'s gate is now the rule
both FSPEC and TSPEC state, and `P-2a`/`P-2b`'s de-anchored citations now read the way `G-B`/`G-C`
already wrote them. No decision is invalidated, no `D-O` obligation loses falsifying power in a way
that would halt, and the confirmation is approving.

What should land in DECISIONS' next revision, none of it reopening a decision: F-01 (restate
`DEC-LI-07`'s divergence paragraph as settled and mark `D-O-9` discharged), F-02 (replace row 4 with
the settled two-locus answer and drop the `ERR-6` routing), F-04 and F-05 (v4's two unlanded items),
F-03 (refresh the version pins in one pass) and F-06 (name `D-O-6`'s positive-value case as the sole
surviving falsifier of a wrongly-`null` corpus outcome). F-02 is the one worth landing **before**
PROPERTIES transcribes oracles — it is the only item in this round with a route to a false green.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 2}

APPROVAL-HASH: sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6
APPROVAL-HASH-NORMALIZED: sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6
REVIEWED-COMMIT: 82bd5869a765350f65436e7ea35005bc2c2ff48c
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:fb18dbda1cef8497143e931894d09b83871657b9c8108305948cc03566b0727c
UPSTREAM-STATE: TSPEC sha256:f629d29d23386297f5e3ec490530f7ed6b697ec63c56acf6711d7fee14a530d5
