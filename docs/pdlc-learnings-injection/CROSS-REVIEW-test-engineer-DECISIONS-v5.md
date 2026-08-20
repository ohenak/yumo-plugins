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

## Recommendation

## Verdict
