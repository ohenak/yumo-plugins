# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation, FSPEC)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.2, sha256:85888c03…, commit `d140fbee`)
**Upstream re-read:** FSPEC `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (sha256:ae75fa62…, v0.13)
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade — FSPEC moved v0.12 → v0.13, DECISIONS did not)

## Context

DECISIONS' own bytes have not moved since v4 (`APPROVAL-HASH: sha256:85888c03…`, commit `d140fbee`).
What moved is **FSPEC**. My v5 confirmation recorded `UPSTREAM-STATE: FSPEC sha256:fb18dbda…`, which
is commit `c1d7218e`, FSPEC **v0.12**. HEAD is sha256:ae75fa62…, commit `cfb3d4d6`, FSPEC **v0.13**.
Six commits landed on that path in between, all one erratum round:

| Commits | Substance |
|---|---|
| `eeafa236`, `402185b3` | **BR-6's byte-accounting basis is re-decided: material only.** A document's *contributed bytes* are now "the section headings and bodies taken from it, and nothing else"; the identification line, the per-document delimiters and source-path label, and the block's preamble are "charged to no threshold". The pre-round text said the opposite — contributed bytes were "every byte the block carries on its account: its identification line, its delimiters and source-path label (BR-7), **and** the section headings and bodies taken". `RSN-NO-MATERIAL`'s catalogue gloss widens to cover the zero-bound case. |
| `c33bec50` | `maxBytesPerDocument: 0` is decided: no document yields material, each is dropped with `RSN-NO-MATERIAL` before the total bound, consumes no slot, and the run is BR-14's enabled empty-selection run. Recorded as **E-36**, exercised by **AT-30** (third zero, beside `maxDocuments: 0` and `maxTotalBytes: 0`). D-12's question restated from "carries any priority section" to "yields any material". |
| `5dcd00e0` | **F-O-1 widens**: TSPEC now owns *two* heading-recognition rules — the BR-3 document-shape predicate **and** the rule by which a heading counts as one of BR-6's named sections — both bounded by bytes-only and no-model-call. |
| `0884fe45`, `cfb3d4d6` | The v0.13 erratum block and the changelog row recording the three decisions. |

Per DEC-ERR-03 my scope is this DECISIONS measured against FSPEC **at HEAD**, not against the item
list: any claim this document leans on that FSPEC no longer says, or no longer says the same way, is
a finding of this round. So I re-read, at HEAD, every FSPEC section DECISIONS reaches into — BR-6's
byte-accounting paragraphs, BR-6's per-document-bound paragraph, BR-7, the reason catalogue, the
D-1…D-12 decision table, §Edge Cases E-25/E-36, AT-30, and the F-O-1…F-O-4 obligations table — and
then re-read DECISIONS' every byte-flavoured claim: `DEC-LI-05`'s composition and BR-7 citation,
`DEC-LI-06`'s read-cost framing, `DEC-LI-08` in full, `DEC-LI-10`'s catalogues, the §Decisions
deliberately NOT taken table, §Consequences, and obligations `D-O-1`…`D-O-9`.

The delta is narrower than v5's in reach but sharper in kind. v5's trigger (TSPEC v0.6 → v0.7) moved
upstream **toward** this document. This one moves a **quantity definition** underneath it: the same
three threshold names now bound a strictly smaller set of bytes than they bounded when `DEC-LI-08`
was written and approved. That is exactly the class of drift where a decision survives intact while
the sentence expressing it stops being true of the upstream it compresses, so it is where I spent
this round.

## Options Considered

**(a) The delta invalidates a decision — non-approving, a `delta/local` High.** The reading that
could have earned this is `DEC-LI-08`: it is the entry that *is* about bounding, and the round
redefined what the bounds bound. I checked it first, and the test I applied is whether any
`D-O` obligation loses falsifying power or any decision's chosen shape becomes wrong. Neither
happens. `DEC-LI-08`'s decision is **static caps only, no dynamic budget**, and its two rejections
(measure-the-prompt, fraction-of-prompt) turn on authority and determinism, not on which bytes the
caps count. Narrowing the counted set from framing-plus-material to material-only leaves both
rejections standing verbatim and leaves the caps applied unconditionally. Similarly `DEC-LI-05`'s
byte-identity-by-construction is untouched: an empty selection still concatenates `""`, and the
v0.13 zero-bound case reaches that same empty-selection path (E-36 explicitly routes to BR-14's
enabled empty-selection run), so `DEC-LI-05` gains a **new** empty-selection input rather than a
counterexample. Reading (a) has no support in the bytes.

**(b) Nothing to say — approve silently.** Wrong, and for a reason that is easy to under-weight
because the decisions themselves are fine. `DEC-LI-08` states that "the injection is bounded a
priori" and hands `D-O-4` downstream as the obligation that closes C-8's acknowledged gap: report
"realised prompt sizes **against REQ §4.1's caps**". Under material-only accounting those two
quantities are no longer the same quantity — a realised block is its material *plus* framing FSPEC
now charges to no threshold, so a conforming run routinely renders a block larger than
`maxTotalBytes`. An operator holding `D-O-4`'s report next to §4.1's caps, per the sentence this
document wrote, reads an overrun that is not one, or is told to move a cap that was never binding on
the thing that grew. The obligation is the closing condition for the one gap this document
deliberately left open; leaving it phrased against a superseded accounting basis is precisely the
citation-currency class DEC-ERR-03 asks a cascade round to catch.

**(c) Faithful-but-drifted — approve, with tagged non-gating findings.** This is what the bytes
support. No decision is invalidated; no `D-O` obligation is voided; the compression still holds
everywhere it makes a behavioural claim. What drifted is (i) two sentences whose **quantity
semantics** FSPEC changed underneath them (`DEC-LI-08`'s "bounded a priori" framing and `D-O-4`'s
caps comparison), and (ii) one obligation, `D-O-3`, whose `extractInjectableMaterial` property is
now stated over a bound domain that includes a value FSPEC has since given a **different** outcome
than the property's own clause predicts. Both land in the next revision of DECISIONS; neither
reopens a decision, and neither blocks the phase.

## Decision

**DECISIONS still holds as approved against FSPEC v0.13.** Reading (c) — Approved with minor
changes, six Medium and two Low findings, none gating, none reopening a decision.

Every claim in DECISIONS that reaches into FSPEC, re-derived against HEAD rather than against the
v0.12 bytes v5 recorded:

| DECISIONS claim | FSPEC at HEAD (v0.13) | Verdict |
|---|---|---|
| `DEC-LI-05`: block is a suffix, `""` when the selection is empty; byte-identity holds by construction | BR-14's enabled empty-selection run is unchanged; E-36 routes the new `maxBytesPerDocument: 0` case *into* it, and AT-30 now asserts all three zeros against the same "rows present and empty, not the absent key" oracle | **Holds, with one more input** — the delta adds an empty-selection path, which is the path this decision makes safe by construction |
| `DEC-LI-05` §Constraints: "FSPEC `BR-7`, which fixes what the block must convey but not where it sits" | BR-7 unchanged in what it fixes; v0.13 only removes the preamble/delimiters from the *byte charge*, not from BR-7's ownership, and F-O-2 still routes their wording to TSPEC | **Holds** |
| `DEC-LI-08`: bound the addition with REQ §4.1's static thresholds only — per-document bytes, total bytes, document count — applied unconditionally | The three thresholds still exist, still apply unconditionally, still own no dynamic budget. But they now bound **material only**: framing "is charged to no threshold" (BR-6) | **Decision holds; the sentence drifts** — "bound the addition" over-claims, since the addition is material *plus* uncharged framing → F-01 |
| `DEC-LI-08` §Stated honestly: C-8's second half satisfied in the weak sense, "the injection is bounded a priori"; closing condition is REQ O-1 measurement of "realised prompts crowding the caps" | Same accounting change; a conforming block can exceed `maxTotalBytes` by its framing without any threshold binding | **Drifts** — the crowding test the paragraph prescribes compares two now-different quantities → F-01 |
| `D-O-4`: "realised prompt sizes **against REQ §4.1's caps**", the input C-8's weak half needs | ditto | **Drifts, and this is the load-bearing one** — it is the obligation that owns the acknowledged gap's closing condition → F-01 |
| `D-O-3`: properties over `extractInjectableMaterial` — "byte bound, whole-character prefix, `bounded` exactly when cut" | BR-6 at HEAD carves the zero bound out of the cut-and-flag rule: at `maxBytesPerDocument: 0` the document **yields nothing**, is dropped with `RSN-NO-MATERIAL` before the total bound and consumes no slot — it does **not** take 0 bytes and carry the `bounded` flag, which is what the unamended "first section alone exceeds the bound → taken up to the bound and cut, either way `bounded`" rule predicts | **Obligation survives, its stated clause is now incomplete** — a bound-generating property written from this clause over a domain that includes 0 goes RED against a v0.13-conforming implementation → F-02 |
| `DEC-LI-10`: closed catalogues, hand-transcribed expected sets, including `RSN-*` | The `RSN-*` **id set** is unchanged; only `RSN-NO-MATERIAL`'s gloss widened ("yields no material — carries none of BR-6's priority sections, **or** the per-document bound is zero and admits none") | **Holds** — set-equality expectations transcribe ids, not glosses; no transcription moves |
| §Decisions deliberately NOT taken, row 2: "The ordering key, the section subset, and the eligibility rule → FSPEC `BR-4`, `BR-6`, `BR-3`" | The *subset* is still BR-6's and eligibility still BR-3's; F-O-1 now additionally routes the **recognition rule** for both to TSPEC | **Holds** — placement is unchanged; ownership of the matching mechanism was never claimed here |
| `DEC-LI-06`: no cache; read cost `O(dispatches × corpus bytes)`; `D-O-6`'s call counts | Untouched by this delta | **Holds** (v5's F-04 reversibility-ground finding still unlanded → F-06) |
| `DEC-LI-03` §Re-evaluation trigger, citing FSPEC `A-2` | `A-2` at HEAD (line-leading in §Assumptions) quantifies only over a dispatch satisfying "**neither** conjunct in the pipeline's own terms yet is authoring in spirit"; the trigger attributes to it a sentence over "authoring in spirit but not classified". Unchanged by this round — the `A-2` edit was `c1d7218e`, inside v5's recorded state | **Inherited drift, unmoved** → F-07 |
| `DEC-LI-07`'s divergence paragraph and `D-O-9`; §Decisions deliberately NOT taken row 4 | Unchanged by this round; both were measured against TSPEC in v5 and remain unlanded | **Inherited** → F-03, F-04 |
| Header version note and `DEC-LI-07` §Context pins ("TSPEC v0.5", "FSPEC v0.7") | HEAD is REQ v0.9, **FSPEC v0.13**, TSPEC v0.7 | **Inherited, deepened by one version** → F-05 |

The two findings this round *adds* (F-01, F-02) are both tagged **delta**: the pre-round FSPEC bytes
made `DEC-LI-08`'s "bound the addition" and `D-O-3`'s cut-and-flag clause literally correct, and it
is this round's edit that made them not so. That provenance is the right one — these route into
DECISIONS' own revision loop, not back to FSPEC, because FSPEC's new position is the better one and
the document is what must catch up.

## Consequences

**For PROPERTIES, the next reader.** Nothing here blocks it, but one item is now a false-green
generator and is worth landing before `D-O-3`'s properties are authored. `D-O-3` asks for a property
over `extractInjectableMaterial` with three conjuncts, one of which is "`bounded` exactly when cut".
The natural way to write that is a generated bound over non-negative integers plus a generated
document, asserting `bounded === (takenBytes < availableBytes)`. At `bound === 0` FSPEC v0.13 says
the document yields nothing and leaves the selection entirely with `RSN-NO-MATERIAL` — it is not a
`bounded` document at all. The property author has three outcomes available and only one is right:
generate from 1 upward and silently lose the newly-decided edge (a coverage hole `AT-30` catches only
at the workflow level, never at the unit level), keep 0 in the domain and go RED against a correct
implementation, or shrink the bound domain *and* add the zero-case conjunct FSPEC now specifies.
`D-O-3` should say the third out loud. This is the one place in this round where the drift, followed
literally, produces a wrong test rather than a misdirected reader.

**For the operator report (`D-O-4`) and the acknowledged C-8 gap.** `DEC-LI-08` is the only entry in
this document that *admits* an unclosed gap and names its closing condition, which makes the
precision of that condition load-bearing in a way the other entries' prose is not. Under
material-only accounting the report has to carry two numbers where it previously carried one:
realised **material** bytes, comparable to `maxTotalBytes` and the sole quantity the thresholds
govern, and realised **block** bytes, which is what actually lands in the prompt and what any future
displacement decision would have to yield against. Reporting only the first hides the growth term;
reporting only the second and comparing it to §4.1 manufactures overruns. The fix is one sentence in
`D-O-4` and one in §Stated honestly — no decision moves, and `DEC-LI-08`'s shape (static caps, no
dynamic budget) is unaffected either way.

**On what the delta made better.** Two things, worth recording because a cascade round that only
reports drift misreads the direction of travel. First, `DEC-LI-05` is strengthened: v0.13 routes the
zero-per-document-bound case into BR-14's enabled empty-selection run, so a third distinct
configuration now reaches the `""`-concatenation path whose safety this decision established by
construction, and `AT-30` asserts all three against the same oracle. A decision that survives having
its input space widened without an added conjunct is a decision that was made at the right altitude.
Second, F-O-1's widening removes an ownership hole that sat directly under `DEC-LI-02`'s
never-throwing-parser family: the rule by which a heading counts as one of BR-6's named sections
previously had no named owner, and `looksLikeLearningsDocument`'s totality obligation in `D-O-3`
implicitly assumed one existed. It now does, on the same bytes-only, no-model-call terms, which is
the constraint `D-O-3`'s totality property needs to be writable as stated.

**Process note, carried from v5 and reinforced (F-08 in that round's terms, not re-filed here).**
v5's lesson was that recording an `UPSTREAM-STATE:` sha is a statement of what was current, not a
claim that anything was checked. This round is the second consecutive one to find that the *only*
stale material in an unchanged DECISIONS is a present-tense claim about a sibling document's state
or a quantity definition owned upstream. Both classes share a signature: a sentence whose truth
depends on someone else's current bytes rather than on this feature's behaviour. A cascade round
that greps this document for present-tense sibling claims and for every upstream-owned unit of
measurement would have found F-01 and F-03 mechanically. That is a cheap addition to the role's
cascade protocol and I record it rather than re-file it.

**What this round did not do.** I did not re-read DECISIONS end to end, did not re-derive its
code-level claims against HEAD, and did not revisit any settled decision. I read FSPEC at HEAD in the
sections `c1d7218e..cfb3d4d6` touched, plus every FSPEC section DECISIONS cites or depends on for a
quantity definition.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | `DEC-LI-08` and `D-O-4` are phrased against the superseded byte-accounting basis. FSPEC v0.13 charges framing (identification line, delimiters, source-path label, block preamble) to **no** threshold, so the three caps bound the **material**, not "the addition". "The injection is bounded a priori" now over-claims, and `D-O-4`'s "realised prompt sizes against REQ §4.1's caps" compares two different quantities — a conforming block can exceed `maxTotalBytes` by framing without any threshold binding. This is the closing condition for the only gap this document leaves open, so the imprecision has an owner and a consequence. Fix: restate the caps as bounding material, and split `D-O-4` into realised **material** bytes (comparable to §4.1) and realised **block** bytes (the growth term any displacement decision would act on) | `DEC-LI-08` §Decision and §Stated honestly; obligations table `D-O-4` |
| F-02 | Medium | delta | local | `D-O-3`'s `extractInjectableMaterial` clause — "byte bound, whole-character prefix, `bounded` exactly when cut" — no longer covers the bound FSPEC just decided. At `maxBytesPerDocument: 0` (E-36) the document **yields nothing**, is dropped with `RSN-NO-MATERIAL` before the total bound and consumes no slot; it does not take 0 bytes and carry `bounded`, which is what the cut-and-flag rule this clause paraphrases predicts. A generated-bound property written from the clause with 0 in its domain goes RED against a correct implementation; written with 0 excluded it silently loses the edge, leaving `AT-30` as the only oracle and none at the unit level. Fix: add the zero-bound conjunct to `D-O-3` (bound 0 ⇒ no material, `RSN-NO-MATERIAL`, no slot, `bounded` not set) and state the property's bound domain | Obligations table `D-O-3` (FSPEC BR-6 §"How the per-document bound binds", E-36, AT-30) |
| F-03 | Medium | inherited | nonlocal | v5's F-01, unlanded: `DEC-LI-07`'s closing paragraph asserts a **live** disagreement with TSPEC in the present tense — TSPEC "still" gates §I.3 on `present && config.enabled && !sectionMalformed` and "still carries" `OQ.2`/`ERR-4` open — and hands `D-O-9` downstream as an obligation TSPEC still owes. All four `DEC-ERR-01` edits landed in TSPEC v0.6: §I.3 gates on `config.enabled` alone, `OQ.2` is CLOSED, `ERR-4` is CLOSED, `LEARNINGS_DEFAULTS.enabled` is `true`. The decision agrees with TSPEC; the paragraph describing the disagreement is false, and `D-O-9` is discharged but still tabled outstanding. Fix: restate as settled, mark `D-O-9` discharged, keep `D-O-5` standing as an IMPL guard on its own merit | `DEC-LI-07` §"The divergence TSPEC recorded as an erratum"; obligations table `D-O-9` |
| F-04 | Medium | inherited | nonlocal | v5's F-02, unlanded and still the highest-consequence carried item: §Decisions deliberately NOT taken, row 4 routes AC-3.3's locus "via **TSPEC `ERR-6`**" (CLOSED at HEAD, resolved in REQ v0.9) and states "TSPEC keeps the run-level record (last-write-wins)", while TSPEC §D.2 makes the **per-dispatch** `corpusOutcome` the oracle locus and §D.1 leaves the run-level mirror explicitly non-asserted. A PROPERTIES author following the row writes the completeness assertion over the mirror: green on a single-dispatch fixture, silently wrong on `AT-18`'s divergent run. Fix: replace the row with the settled two-locus answer (one completeness test per locus, mirror unasserted) and drop the `ERR-6` routing | §Decisions deliberately NOT taken, row 4 |
| F-05 | Low | inherited | nonlocal | v5's F-03, unlanded and now one version deeper: the header version note pins "TSPEC v0.5 … FSPEC v0.7 … REQ v0.7" and `DEC-LI-07` §Context repeats "FSPEC v0.7"; HEAD is REQ v0.9, TSPEC v0.7, **FSPEC v0.13**. Version-pinned citations six erratum rounds behind cannot be checked by a reader without redoing the diff. Fix: three pins to REQ v0.9 / FSPEC v0.13 / TSPEC v0.7 in one pass | Header §Upstream version note; `DEC-LI-07` §Context |
| F-06 | Medium | inherited | nonlocal | v5's F-04, unlanded: `DEC-LI-06`'s reversibility is stated **Hard** on the ground that reversing the cache refusal "reds `E-32` and `AC-5.2` upstream first", listing `AC-5.2` (positive-membership oracle) among the constraints holding the no-cache shape. FSPEC `BR-15` compares expected **paths, not counts**, so a per-dispatch run-scoped read memo leaves that verdict identical — `AC-5.2` no longer detects the reversal it is cited as guarding, leaving `D-O-6`'s call counts the sole surviving falsifier. Unchanged by this delta. Fix: ground the reversibility on `E-32` plus `D-O-6`, and describe `AC-5.2` as footprint-shaped rather than cache-detecting | `DEC-LI-06` §Reversibility; §Constraints |
| F-07 | Medium | inherited | nonlocal | v5's F-05, unlanded: `DEC-LI-03`'s re-evaluation trigger attributes to FSPEC `A-2` a sentence covering a dispatch "authoring in spirit but not classified", while `A-2` at HEAD quantifies only over a dispatch satisfying "**neither** conjunct in the pipeline's own terms yet is authoring in spirit". The narrower exclusion is `BR-1`'s two-conjunct rule, settled in FSPEC v0.12 and TSPEC v0.7. Fix: re-cite `BR-1`'s two-conjunct rule and `A-2`'s widening-is-explicit default in `A-2`'s own terms | `DEC-LI-03` §Re-evaluation triggers |
| F-08 | Low | inherited | nonlocal | v5's F-06, unlanded: TSPEC §D.1's domain-membership tests read `v === null || catalogue.includes(v)`, so the domain test no longer falsifies a `corpusOutcome` of `null` where a catalogued reason (`RSN-UNLISTABLE`, `RSN-EMPTY`) is required. `D-O-6`'s positive behavioural case is the sole remaining falsifier, and neither `DEC-LI-10` nor `D-O-6` records that dependency — a PROPERTIES author trimming `D-O-6`'s positive-value conjunct as redundant leaves the invariant unguarded. Fix: one clause naming `D-O-6`'s positive-value assertion non-negotiable; no decision changes | `DEC-LI-10`; obligations table `D-O-6` (TSPEC §D.1) |

FINDING: Medium | delta | local | DEC-LI-08 §Decision and §Stated honestly; D-O-4 | the entry says the static caps "bound the addition" and that the injection is "bounded a priori", and D-O-4 asks for realised prompt sizes measured against REQ §4.1's caps, but FSPEC v0.13 charges framing (identification line, delimiters, source-path label, block preamble) to no threshold, so the caps bound material only and a conforming block can exceed maxTotalBytes without any threshold binding; the closing condition for this document's one acknowledged gap now compares incommensurable quantities
FINDING: Medium | delta | local | D-O-3 (extractInjectableMaterial properties) | the clause "byte bound, whole-character prefix, bounded exactly when cut" does not cover maxBytesPerDocument: 0, which FSPEC v0.13 decides as yields-nothing / RSN-NO-MATERIAL / no slot / not bounded (E-36, AT-30); a generated-bound property including 0 reds against a correct implementation and one excluding 0 loses the edge with no unit-level oracle
FINDING: Medium | inherited | nonlocal | DEC-LI-07 §"The divergence TSPEC recorded as an erratum"; D-O-9 | the paragraph asserts in the present tense that TSPEC still gates §I.3 on present && config.enabled && !sectionMalformed and still carries OQ.2 and ERR-4 open, and tables D-O-9 as outstanding, but all four DEC-ERR-01 edits landed in TSPEC v0.6 and the decision now agrees with TSPEC
FINDING: Medium | inherited | nonlocal | §Decisions deliberately NOT taken, row 4 | the row routes AC-3.3's locus via TSPEC ERR-6 (CLOSED at HEAD) and states TSPEC keeps the run-level record, while TSPEC §D.2 makes the per-dispatch corpusOutcome the oracle locus and §D.1 leaves the run-level mirror non-asserted, so a PROPERTIES author following the row writes a completeness test over the mirror that is green on a single-dispatch fixture and silently wrong on AT-18's divergent run
FINDING: Low | inherited | nonlocal | Header §Upstream version note; DEC-LI-07 §Context | version pins read TSPEC v0.5 / FSPEC v0.7 / REQ v0.7 while HEAD is REQ v0.9 / FSPEC v0.13 / TSPEC v0.7, so the citations cannot be checked without redoing the diff
FINDING: Medium | inherited | nonlocal | DEC-LI-06 §Reversibility and §Constraints | the Hard reversibility is grounded on AC-5.2 redding when the cache refusal is reversed, but FSPEC BR-15 compares expected paths rather than read counts, so a run-scoped memo leaves AC-5.2's verdict identical and D-O-6's call counts are the sole surviving falsifier
FINDING: Medium | inherited | nonlocal | DEC-LI-03 §Re-evaluation triggers | the trigger attributes to FSPEC A-2 a sentence covering a dispatch authoring in spirit but not classified, while A-2 at HEAD quantifies only over a dispatch satisfying neither of BR-1's two conjuncts yet authoring in spirit
FINDING: Low | inherited | nonlocal | DEC-LI-10; D-O-6 (TSPEC §D.1) | TSPEC's domain-membership tests admit null, so D-O-6's positive behavioural case is the sole falsifier of a wrongly-null corpusOutcome and neither DEC-LI-10 nor D-O-6 records that dependency

## Recommendation

**Approved with minor changes** — DECISIONS still holds as approved against FSPEC v0.13.

The erratum round changed a quantity definition underneath this document rather than a behaviour it
compresses: `maxBytesPerDocument`, `maxTotalBytes` and BR-8's *bytes injected* now measure material
only, with framing charged to no threshold. No decision is invalidated by that. `DEC-LI-08`'s shape
(static caps, no dynamic budget) survives both of its rejections intact, and `DEC-LI-05` is
strengthened — the newly decided `maxBytesPerDocument: 0` case (E-36) routes into BR-14's enabled
empty-selection run, adding a third configuration to the `""`-concatenation path whose safety this
decision established by construction, all three asserted by AT-30 against one oracle. No `D-O`
obligation is voided. So this confirmation is approving, and no High finding is raised on either
axis.

Two items should land in DECISIONS' next revision, neither reopening a decision:

- **F-01** — restate `DEC-LI-08`'s caps as bounding *material*, and split `D-O-4` into realised
  material bytes (comparable to §4.1) and realised block bytes (the growth term). This is the
  closing condition for the document's one acknowledged gap, so it should say which number closes it.
- **F-02** — add the zero-bound conjunct to `D-O-3` and state the property's bound domain. This is
  the only drift in this round that, followed literally, produces a wrong test rather than a
  misdirected reader.

Five inherited items (F-03…F-08, all measured in v4/v5 and still unlanded because DECISIONS' bytes
have not moved) ride along unchanged; F-04 remains the highest-consequence of them for the PROPERTIES
author.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 6, "low": 2}

APPROVAL-HASH: sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6
APPROVAL-HASH-NORMALIZED: sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6
REVIEWED-COMMIT: 8f3db3d8e89dafe9dab1c3b468ce0ed9bb48c631
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:ae75fa6291f1a060153f65b6b1bcc3959acd62b2c0872e7b319489c964a86a1d
UPSTREAM-STATE: TSPEC sha256:f629d29d23386297f5e3ec490530f7ed6b697ec63c56acf6711d7fee14a530d5
