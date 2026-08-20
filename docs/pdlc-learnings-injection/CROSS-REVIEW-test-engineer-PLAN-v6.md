# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (bytes unchanged since v4 approval)
**Upstream that moved:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.6 → v0.7)
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade confirmation)

## Overview

**Question answered.** PLAN's own bytes have not moved since the v4 approval anchor. This round the
upstream that moved is **TSPEC**, from v0.6 (`ccc739d1`, the version my v5 confirmation recorded as
`UPSTREAM-STATE: TSPEC sha256:eff5a19b…`) to v0.7 at HEAD (`bfe58851`, `sha256:f629d29d…`) — six
commits, +66/−37 lines. I re-read my v5 cross-review, diffed TSPEC across `ccc739d1..HEAD`, and
measured only the PLAN material that leans on the changed TSPEC text. I did not re-open the batch
DAG, the file-ownership manifest, the AT partition, the expected-red ledger, or the fail-open arm
table — the TSPEC edit touches none of the sections those are derived from.

**What TSPEC now says that it did not say at approval time.**

| TSPEC section | Before (v0.6) | After (v0.7) |
|---|---|---|
| Front matter | grounded on FSPEC v0.9 | grounded on FSPEC v0.12; v0.7 erratum note added |
| §Open Questions ERR-7 | open divergence: BR-1 forbids the `docType` conjunct, AT-02 has two contradictory expected sets | **CLOSED**, resolved by FSPEC v0.11/v0.12 |
| §Open Questions ERR-3 | open: BR-15's expected read set includes an enumeration that contributes no member | **CLOSED**, resolved by FSPEC v0.11 |
| §A.2 | the `docType` conjunct is "routed as ERR-7", a divergence from BR-1 | the conjunct **implements BR-1 as written**; §I.3's predicate is BR-1 directly. Byte-identity restated as "dispatches **outside BR-1's rule**", not "non-authoring" |
| §D.1 | domain-membership tests assert every value is a catalogue member | tests assert every **non-`null`** value is a member; `null` is the healthy `corpusOutcome` and deliberately not a catalogue member |
| P-2a, P-2b, P-10, ERR-2, §T.6 land-proof retry | `orchestrate-dev.js:13515`, `:7663`, `:12821`, `:12915`, `:14551-14556`, `:15167` line anchors | restated as enclosing-symbol / call-shape citations per DEC-DOC-01; P-2a reworded to "carry the authoring classification" (three object literals + one positional argument) |

**Direction of travel is again toward PLAN, not away from it.** Every substantive TSPEC change in
this round adopts a reading PLAN was already written to:

- §D.1's non-`null` scoping is **PLAN's own** correction, raised as TE F-01 against PLAN v0.3 and
  carried in LI-23's row ("the `corpusOutcome` equality is scoped to non-`null` observations, and
  that scoping is load-bearing") with the positive half delegated by name to LI-10's
  `DIVERGENT-CORPUS` dispatches 1, 2 and 4. TSPEC has now absorbed it verbatim, including the
  "do not repair this by expecting `LEARNINGS_CORPUS_OUTCOMES ∪ {null}`" prohibition. The two
  documents agree; no task row changes.
- P-2a's rewording matches LI-01's premise-suite phrasing exactly — "three object-literal
  `dispatchKind: \"authoring\"` sites plus one positional `\"authoring\"` argument", the
  distinction PLAN raised as TE F-12 because a literal grep returns 3, not 4. LI-01's injective key
  `(enclosing named function, prompt-source symbol)` still resolves cleanly against TSPEC's new
  symbol-level citation: `(converge, creatorPrompt)`, `(erratumRound, erratumAuthorPrompt)`,
  `(erratumRound, land-proof-retry template)`, `(reviewLoop, optimizerPrompt)`. The premise suite
  is still authorable, still structural, still green at batch 1.
- The DEC-DOC-01 de-anchoring is a citation-form change with no behavioural content. LI-01 already
  asserts its premises **structurally, never positionally** — the row says so in as many words — so
  a TSPEC that stopped naming line numbers removes a hazard for this PLAN rather than creating one.
  ERR-2's re-citation likewise leaves LI-11's fourth run-shape fixture untouched.
- ERR-3's closure explicitly says "AT-33 tracks the correction; **nothing in this TSPEC changes**",
  so LI-11's hand-transcribed AT-33 read set — enumeration excluded — is still the right oracle.

**What does not survive the edit is PLAN's description of its upstream**, in exactly the same way
and in exactly the same place as v5's findings: §Errata still presents ERR-3 and ERR-7 as live
defects and still describes TSPEC §A.2 as diverging from BR-1. Both statements were true of TSPEC
v0.6 and are false of TSPEC v0.7. That is prose about the state of two other documents, not an
oracle, a fixture, a batch or a dependency edge — so it is Medium, not gating, and it is the same
one-line-edit class of repair v5 already asked for.

## Batches

**No batch moves.** I re-derived nothing here because nothing in the TSPEC delta reaches the batch
DAG's inputs: the edit touches front matter, four premise-evidence cells, §A.2's justification
prose, §D.1's scoping sentence, §T.6's one citation, and three erratum entries. None of those is a
task boundary, a file owner, a suite assignment, or a dependency edge, and the §T.5 partition, §T.3
obligations, §T.7 arm inventory and §I.1/§I.3 symbol list that PLAN's 23 rows are cut from are
byte-identical across `ccc739d1..HEAD`.

The rows I checked individually, because they name a TSPEC section the edit touched:

| Task | What it leans on | Still holds against TSPEC v0.7? |
|---|---|---|
| LI-01 (batch 1) | P-1, P-2a, P-3, P-4, P-7, P-8, P-10 as premises | **Yes.** P-2a's rewording matches LI-01's own phrasing; P-10's de-anchoring is satisfied by the row's structural assertion (`buildFinalReport` takes `notices = []` and spreads `advisory` conditionally), which never depended on `:15167` |
| LI-11 (batch 5) | §A.2 consequence b, §T.6's fourth run shape, AT-02, AT-33 | **Yes.** §A.2's conclusion is unchanged — the `docType` conjunct is still load-bearing and the composition-site set equality is still `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}` on the probe side. What changed is *why* the conjunct is right (it now implements BR-1 rather than diverging from it), which strengthens the row: the test author no longer has two readings to choose between |
| LI-23 (batch 5) | §D.1's three frozen catalogues, §T.7's twelve arms | **Yes, and it is now the upstream's reading too.** §D.1's new non-`null` scoping is the row's existing scoping |
| LI-10 (batch 5) | §D.2's record shape, the healthy `corpusOutcome === null` | **Yes.** §D.2 is untouched; §D.1 now cites it for the same reason LI-10 does |
| LI-15 (batch 7) | §D.1's catalogues, §I.1/§I.3 | **Yes.** `LEARNINGS_CORPUS_OUTCOMES` stays exactly `["RSN-UNLISTABLE", "RSN-EMPTY"]`; §D.1's edit is explicit that its set-equality test is unchanged |
| LI-20 (batch 12) | the attachment predicate `dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)` | **Yes.** This is now a direct implementation of BR-1's two-conjunct rule, cited by §A.2 as such |

**Nothing routes back to the batch ladder.** No red-test row loses its predecessor, no
implementation row gains one, no same-batch same-new-file collision is introduced, and the twelve
`learnings*.test.js` files LI-14's directory closure enumerates are unchanged.

## Dependencies

**No dependency edge is invalidated.** The edges PLAN declares are derived from single-writer
serialisation on `pdlc/workflows/orchestrate-dev.js`, from red-before-green pairing, and from
fixture ownership — three things the TSPEC delta does not touch. I spot-checked the three edges
whose *stated reason* cites a TSPEC section:

| Edge | Stated reason | Verdict |
|---|---|---|
| everything → LI-01 | "a premise that has moved since **TSPEC v0.6**" | The edge holds; the **version label in the reason is now stale** (TSPEC is v0.7). This is one of the version-citation staleness items below, not a broken edge — LI-01's job is unchanged, and the premises it pins are the same six |
| LI-04, LI-05 → LI-03 | "both obligations of TSPEC §T.3" | Holds. §T.3 is byte-identical across the delta |
| LI-16 → LI-15 … LI-22 → LI-21 | single-writer serialisation on one source file | Holds. Untouched by any document change |
| LI-23 → LI-06 | baseline must exist before the arm inventory runs | Holds; §T.7's arm list is unchanged |

**Upstream-state ledger for this round.** PLAN now sits under REQ v0.9 (`ff605dd3…`, unchanged),
FSPEC v0.12 (`fb18dbda…`, unchanged since my v5 confirmation), TSPEC **v0.7** (`f629d29d…`, the
document that moved) and DECISIONS (`85888c03…`, unchanged). Two of the four upstream version
labels PLAN's front matter carries — FSPEC v0.10 and TSPEC v0.6 — are now behind their documents.
The FSPEC half of that was already open from v5; the TSPEC half is this round's.

**DECISIONS is not implicated.** The TSPEC edit closes two errata routed *to FSPEC*; it promotes no
decision, retracts none, and changes no re-evaluation trigger. Nothing cascades from here to
DECISIONS or from DECISIONS back into this PLAN.

## Verification

**Every oracle PLAN names is still falsifiable, and still falsifiable the same way.** The three
places a TSPEC edit could have broken an oracle, checked directly:

1. **The domain-membership oracles (§D.1, LI-23 / `LI-T-ARMS-1…3`).** TSPEC's new scoping — "every
   **non-`null`** value it ever carries is a member of that field's catalogue", with the test
   reading `v === null || catalogue.includes(v)` — is precisely LI-23's row, and the catalogue's
   set-equality test is explicitly unchanged. The oracle stays a **set equality, never containment**,
   so an arm that stops being entered still reds and an invented code still reds. The positive
   conjunct for the healthy value has not been dropped: it lives in LI-10's `DIVERGENT-CORPUS` rows
   asserting `dispatches[i].corpusOutcome === null` on dispatches 1, 2 and 4. Non-`null` scoping
   plus a named positive assertion elsewhere is not an absence-only oracle — the healthy state is
   asserted exactly, by value, in a task row that names the delegation.

2. **The composition-site oracle (§A.2, LI-11).** §A.2's *conclusion* is unchanged; only its
   provenance moved from "divergence routed as ERR-7" to "implements BR-1 as written". LI-11 still
   asserts the probe set equal to `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}` and the accepted
   set equal to `LEARNINGS_TARGET_DOCTYPES`, both hand-transcribed, both equality. The mutation
   proof AT-02 now carries upstream — revert BR-1's second conjunct and expect RED — is exactly what
   this pair of equalities produces: dropping the `docType` conjunct makes the accepted set a strict
   superset and reds the second equality. The oracle got *more* support from the edit, not less.

3. **The AT-33 read-set oracle (§T.6, ERR-3).** TSPEC's closure states "AT-33 tracks the correction;
   nothing in this TSPEC changes", so LI-11's hand-transcribed expected read set — the scripted
   `ls-files` stdout minus the self paths, **never derived from `gatherLearningsCorpus`** — remains
   the right instrument, and remains falsifiable independently of the implementation it tests.

**Definition of Done.** Clauses 1–3 and 5–13 are unaffected. Clause 4 is the one v5 finding still
open on PLAN's own bytes: it promises baseline byte-identity for "every non-authoring dispatch
(AC-4.3)", a paraphrase that was faithful to FSPEC v0.10 and is now narrower than **both** upstreams
— FSPEC v0.12's AT-03/AT-29 and TSPEC v0.7 §A.2 now say "outside BR-1's rule". An
authoring-classified optimizer round with `docType: null` sits inside DoD 4's exemption and outside
what the oracle promises, so an implementation injecting into that round would pass the DoD gate
while failing AT-03. TSPEC moving to the same wording as FSPEC does not resolve this; it removes the
last reading under which DoD 4's paraphrase was defensible. It remains Medium: the oracle LI-11
authors is correct, the DoD's prose restatement of it is not, and the repair is one clause.

**Nothing here justifies reopening the revision loop.** No red test is mis-ordered, no fixture is
invalidated, no coverage obligation is lost, and no oracle became unfalsifiable. The findings below
are all stale prose about upstream state, repairable in one touch of this document.

## Recommendation

**Approved with minor changes.**

PLAN still holds as approved against TSPEC as it now stands. Every task row, oracle, fixture,
dependency edge and batch number survives the v0.6 → v0.7 erratum intact, and on the two
substantive points TSPEC moved **toward** PLAN: §D.1's non-`null` domain scoping is PLAN's own TE
F-01 correction absorbed upstream, and P-2a's rewording is PLAN's TE F-12 phrasing absorbed
upstream. No High finding, nothing gating, no reason to reopen the revision loop.

Four Mediums, all of one kind: PLAN describes an upstream that no longer exists. Three are this
round's (§Errata's two closed-erratum re-raisings, and the stale TSPEC/FSPEC version labels); one is
inherited from v5 and still open (DoD 4's byte-identity paraphrase). All are prose edits, none
blocks implementation, and none needs a new round — fold them into the next touch of this document.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §Errata re-raises ERR-3 and ERR-7 as live FSPEC defects; TSPEC v0.7 marks both CLOSED | §Errata raised from this document's authoring |
| F-02 | Medium | delta | local | §Errata's first table row describes TSPEC §A.2 as adding a conjunct BR-1 forbids, and LI-11's AT-02 as having two contradictory expected sets; §A.2 now implements BR-1 directly and the contradiction is gone | §Errata, FSPEC BR-1 row |
| F-03 | Medium | delta | nonlocal | Front matter and §Overview cite `TSPEC (v0.6)` and `FSPEC v0.10`; upstream is TSPEC v0.7 / FSPEC v0.12 | Front matter Upstream field; §Overview "This PLAN cites"; §Dependencies "everything → LI-01" reason |
| F-04 | Medium | inherited | nonlocal | DoD 4 promises byte-identity for "every non-authoring dispatch", narrower than FSPEC AT-03/AT-29 and TSPEC §A.2's "outside BR-1's rule"; an authoring-classified `docType: null` round passes the gate while failing AT-03 | §Definition of Done, clause 4 |

FINDING: Medium | delta | local | §Errata raised from this document's authoring | The section opens "Two defects in FSPEC v0.10 are still live at HEAD... first raised by TSPEC v0.6 (as ERR-3 and ERR-7) and are re-raised because FSPEC v0.10 ... does not carry a correction for either". TSPEC v0.7 at HEAD marks ERR-7 "CLOSED, resolved by FSPEC v0.11 and v0.12" and ERR-3 "CLOSED, resolved by FSPEC v0.11". Both defects are corrected upstream and neither is live. Restate the section as a discharged-erratum record (both closed, LI-11 unaffected) rather than a live routing, so a reader does not chase two corrections that have already landed. The adjacent sentence "TSPEC's remaining open errata (ERR-1, ERR-2, ERR-5)" is still accurate at HEAD and needs no change.

FINDING: Medium | delta | local | §Errata, FSPEC BR-1 row | The row reads "FSPEC BR-1 still states the rule 'consumes the classification, it does not restate the membership', while TSPEC §A.2 adds the load-bearing docType conjunct" with the effect "LI-11's AT-02 has two contradictory expected sets... a reviewer scoring it against BR-1 would reject a correct test". FSPEC v0.11 restated BR-1 as the two-conjunct rule and TSPEC v0.7 §A.2 now says "This is FSPEC BR-1 as it now stands, not a divergence from it", with §I.3's predicate implementing BR-1 directly. The row's premise, its effect and its reviewer hazard are all discharged; the BR-15 row below it is stale in the same way (TSPEC's ERR-3 closure states "AT-33 tracks the correction; nothing in this TSPEC changes"). Note in passing that this is the one place the edit *helps* an oracle: AT-02 now carries the revert-the-second-conjunct mutation proof that LI-11's two set equalities produce.

FINDING: Medium | delta | nonlocal | Front matter Upstream field; §Overview "This PLAN cites"; §Dependencies "everything → LI-01" reason | Three version labels are behind their documents: the Upstream field cites `TSPEC-pdlc-learnings-injection.md (v0.6)` and `FSPEC-pdlc-learnings-injection.md (v0.10)`, §Overview says "Behaviour lives in REQ v0.9 / FSPEC v0.10 / TSPEC v0.6", and the batch-ladder reason for "everything → LI-01" says "a premise that has moved since TSPEC v0.6". Upstream at HEAD is TSPEC v0.7 and FSPEC v0.12. Since this PLAN's own contract is "where a row and the TSPEC disagree, the TSPEC wins", a stale version label on the winning document is the citation most worth keeping current. Bump all three; no other text in those sentences needs to change.

FINDING: Medium | inherited | nonlocal | §Definition of Done, clause 4 | Clause 4 promises baseline byte-identity for "every non-authoring dispatch (AC-4.3)". This was faithful to FSPEC v0.10 and is now narrower than both upstreams: FSPEC v0.12's AT-03/AT-29 and TSPEC v0.7 §A.2 both say "outside BR-1's rule". An authoring-classified optimizer round with docType null (Phase CR) sits inside DoD 4's exemption and outside the promise the AT makes, so an implementation that injected into that round would pass the DoD gate while failing AT-03. Raised as v5 F-03 and still open on unchanged bytes; the TSPEC edit removes the last reading under which the paraphrase was defensible. Restate the final clause as "every dispatch outside BR-1's two-conjunct rule" to match the oracle LI-11 authors.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 0}
