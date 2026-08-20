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

_pending_

## Recommendation

_pending_

## Verdict

_pending_
