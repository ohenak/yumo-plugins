# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, byte-unchanged)
**Date:** 2026-08-31
**Iteration:** 11

## Context

**Upstream-cascade confirmation.** My own bytes have not moved: `sha256:48522bf9…`, byte-identical to
the `APPROVAL-HASH` recorded at v8 and re-confirmed at v9 and v10. `git diff` over
`docs/pdlc-stats/DECISIONS-pdlc-stats.md` across this round's range
(`10963e85dcf2d62fb869f704f02d9d2c76484ba7..HEAD`) is empty.

Measured on `feat-pdlc-stats` HEAD (`a2f1201b0`):

| Upstream | v10's pin | HEAD sha256 | Moved? |
|---|---|---|---|
| REQ | `5f3e8051…` (v1.6) | `f75c348f…` (v1.7) | **yes** — the erratum under confirmation |
| FSPEC | `c7d2c832…` | `c7d2c832…` | no — byte-identical |
| TSPEC | `f2261510…` (phantom) | `a06a6032…` | no — matches v10's *body* measurement |

Both HEAD hashes match the dispatch's cited REQ `f75c348f…` and FSPEC `c7d2c832…`, so I am
confirming against exactly the versions the orchestrator named.

**The delta.** One commit, `e12b78fd8`, +12/−3, touching only the version header and one clause of
REQ-STATS-06. It withdraws the v1.6 survivor clause — *"the predicate is set-membership over C-4's
grammars, so a grammatical basename outside the driver's document-type catalogue is a survivor even
where REQ-STATS-03 reports it malformed"* — and replaces it with the opposite disposition: such a
basename *"contributes no process bytes and counts as no file of its family remaining"*, so a feature
carrying only those reports **harvested**. C-5, R-5, REQ-STATS-01 through 05 and 07 are byte-unchanged.

**A third consecutive phantom TSPEC pin.** v10's `UPSTREAM-STATE` trailer recorded TSPEC
`f2261510…`. I hashed every revision of `TSPEC-pdlc-stats.md` on this branch's history path: it
matches none of them. This is the third round running — v8's `512a9fcf…`, v9's `235fd3dd…`, now
v10's `f2261510…` — and the third time the reviewing round has had to recover by falling back to the
hash measured in the prior round's own body (v10's body: `a06a6032…`, which *does* match HEAD, and is
how I know TSPEC did not move). Carried below as F-04, escalated; see there for why the recurrence
changes its severity.

## Options Considered

The document is frozen, so the only options open to me are dispositions of this round.

| Option | Shape | Why not / why |
|---|---|---|
| Approve on the item list ("the erratum landed as routed") | Treat the routed item's landing as sufficient | **Rejected.** DEC-ERR-03 is explicit that items landing is necessary, not sufficient. The question is whether the document is still a faithful compression of REQ **v1.7**, which is answered by re-reading the upstream text the document leans on, not by checking the erratum's own diff off a list. |
| Raise a High on the semantic flip | Treat "an upstream AC reversed its disposition after I approved" as gating on its face | **Rejected.** The gating test is whether a decision, oracle, falsifier, type or task sizing in *this document* is falsified. I traced all three of DECISIONS' upstream anchors — C-5, REQ-STATS-02, R-5 — and the flip reaches none of them. Severity must reflect real impact; a High here would be inflation. |
| Route the delta back as a DECISIONS obligation | Demand a new K-row or a new oracle for the enlarged harvested case | **Rejected**, and the document itself says why. *What these decisions do not decide* carves out "token spellings, key sets, exit codes, row order and **edge-case outcomes**" as FSPEC §4/§5 material. REQ-STATS-06's out-of-catalogue disposition is precisely an edge-case outcome. The carve-out is not a dodge — it is the pre-declared scope boundary that makes this delta orthogonal, and it was approved as such. |
| Confirm faithfulness; carry the four inherited items non-gating | Approve, leave the owed one-line repairs to the next DECISIONS touch | **Chosen** |

One thing I deliberately did **not** do: treat "the delta is orthogonal" as a reason to skip the
re-read. Orthogonality is a *conclusion* I had to earn against the current bytes of C-5,
REQ-STATS-02 and R-5, not a premise. The section below records what I actually checked.

## Decision

**The document, unchanged, remains a faithful compression of REQ v1.7 / FSPEC v1.7 / TSPEC v1.7 at
HEAD. No decision, oracle, falsifier, type or task sizing in DEC-STATS-01/02/03 is falsified by the
REQ-STATS-06 erratum. No High finding, old or new.**

### The three upstream anchors, re-read at HEAD

DECISIONS cites REQ in exactly three places. I read each in the current version rather than trusting
the document's account of it.

| Anchor | What DECISIONS compresses it to | REQ v1.7 at HEAD | Verdict |
|---|---|---|---|
| **C-5** (`REQ:121-133`, cited by symbol per DEC-DOC-01) | "every artifact classification `pdlc stats` makes must be the classification the driver makes", over `parseResolvedMarker`, `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex` | Names four parsing rules: the `CROSS-REVIEW-*` basename grammar, its round derivation, the `CODE_REVIEW-*-v{N}` version grammar, and the POSTMORTEM `RESOLVED:` marker | **Holds.** Four rules ↔ four injected exports, unchanged. Byte-untouched by the erratum. |
| **REQ-STATS-02** | "the JSON document's top-level key set is set-equal to the printed metric set plus one schema-version field" | Says exactly that, and adds that "REQ-STATS-03/04/06's harvested state ride in their own metric's value, never as extra top-level keys" | **Holds**, and see below — this is the one clause the delta could have disturbed. |
| **R-5** | "rests a consumer-stability guarantee on that field existing" | Unchanged | **Holds.** |

### Why the flip does not reach DEC-STATS-02

This is the near miss, and it is worth stating explicitly rather than waving through. The erratum
**enlarges the input set on which the ratio metric reports `harvested`**: under v1.6 a feature whose
only `CROSS-REVIEW-` basenames were out-of-catalogue produced a *measured* ratio; under v1.7 it
produces `harvested`. A new value reaching a JSON document is exactly the shape of change that breaks
BR-21's set-equality and forces TSPEC §6.3's cross-mode oracle to carry a standing per-key exception
— the "permanent hole" DEC-STATS-02 exists to prevent.

It does not break it, for a reason that is in REQ-STATS-02's own bytes at HEAD: the harvested state
**rides in the ratio metric's own value**, not as an extra top-level key. The key set is unchanged;
only the domain of one value grew. So `schemaVersion` remains the single JSON-only field, the
`renderJson`-as-projection shape stands, and §6.3's oracle keeps its clean set-equality with no
exception. DEC-STATS-02's re-evaluation trigger — *"a second JSON-only **field** appears"* — counts
fields, not values, and has still not fired.

### Why the flip does not reach DEC-STATS-03 — and makes it more load-bearing

The new clause makes the harvested/measured verdict turn on whether *the driver's document-type
catalogue* recognises a basename. That is a direct dependency on `parseReviewFilename`'s
classification, which is the seam DEC-STATS-03 governs.

Under v1.6 a classifier divergence on such a basename would have flipped the ratio one way; under
v1.7 it flips the other. **In both readings the operator-visible token depends on the catalogue**, so
the delta does not introduce the dependency — it re-points it. And DEC-STATS-03's guard is an
identity oracle (`===` against `orchestrate-dev.js`'s own exports at the single production
construction site), which the document correctly argues "cannot be satisfied by a re-implementation
at all, so C-5 holds for **every** input, not just tested ones". A total guard covers an enlarged
input set for free. **No new oracle is owed**, which is exactly the property that made Option A worth
its cost over Option C's corpus-based equivalence — Option C would have owed a new corpus case here.

The Consequences section's *"a second consumer for the four driver exports"* bullet already records
the coupling in the form the delta needs, and K-4's construction-site-count conjunct still fences the
one way the oracle could be voided. Nothing in the obligations table is re-sized.

### What I checked that did not move

- **No new decision to absorb.** The erratum adds no `BR-`, `E-` or `AC-` row and performs no
  vocabulary rename — it withdraws a clause. There is nothing for `DEC-STATS-01/02/03` to take on.
- **DEC-STATS-01 untouched.** The delta's "evaluated over exactly the file set whose bytes the
  process side sums" is a single-traversal coupling between the predicate and the numerator. Both
  live in `computeFeatureStats` in `lib/stats.mjs` under DEC-STATS-01, so the coupling is satisfied
  by the chosen placement rather than constraining it.
- **The ten-site co-change table and K-1..K-9 are untouched** by a REQ edit that changes no
  enumeration, no member list and no count word.

## Consequences

### Nothing owed upstream this round

No `ERRATUM:` line is routed. The REQ delta is a clean withdrawal of a clause that dissented from its
own section's rationale; nothing in DECISIONS cited that clause, so nothing in DECISIONS rotted when
it went.

### The four inherited items, restated with what this round changed

All four were raised at v10 against bytes that have not moved since. None is gating. I restate them
only so a later round need not re-derive them.

1. **F-01 — K-3's discharged divergence clause.** Unchanged from v10. TSPEC did not move this round
   (HEAD `a06a6032…` = v10's body measurement), so the clause is stale in exactly the way v10
   described and no worse. Owed at the next DECISIONS touch, not this round.
2. **F-02 — the v1.6 grounding attestation**, at `DECISIONS:54`: *"REQ v1.4 and FSPEC v1.5 were
   re-read and carry no decision this document owes."* This round makes it **staler by one more REQ
   version** — REQ is now v1.7, FSPEC v1.7. I performed the absorption check independently above and
   found nothing owed, so no load-bearing claim is falsified; the risk remains that a later round
   reads the attestation and concludes re-grounding is unnecessary when it is not.
3. **F-03 — the site-table introductory sentence.** Low, unchanged.
4. **F-04 — the phantom `UPSTREAM-STATE` pin, escalated Low → Medium.** I rated this Low twice. A
   third consecutive non-resolving pin is new evidence about impact, not a re-litigation of the same
   evidence, so the severity moves. The mechanism has now failed on every cascade round this document
   has had, and each recovery depended on a reviewer noticing the trailer disagreed with the prior
   round's body and choosing the body. That is a guard enforced by attention, not by a check — the
   same "ninth-to-tenth step where a green suite stops being evidence" the document itself names as a
   distinct kind of cost. A reviewer who trusts the trailer diffs from a base that never existed and
   confirms against a version nobody reviewed, silently. Recommendation stands and is unchanged: emit
   the trailer pin from the measurement the body reports, and treat a non-resolving pin as
   **fail-closed** in the round that reads it. Tagged `Process` — this is a cascade-mechanism defect,
   not a defect in this document's bytes.

### Positive observations

- **The scope carve-out earned its keep.** *What these decisions do not decide* pre-declared
  edge-case outcomes as FSPEC material. That one paragraph is why a semantic reversal in an AC
  produced a bounded re-read here instead of an open-ended re-litigation of what DECISIONS owes. A
  document that states its own boundary degrades gracefully under upstream churn.
- **A total guard is what makes an enlarged input set free.** DEC-STATS-03's identity oracle absorbed
  a widened harvested predicate with no new case, no new fixture and no re-sizing. The option table's
  rejected Option C would have owed a corpus case for exactly this delta. The cost argument made at
  v1.2 is now paid off by an event that had not happened yet when it was made — the best available
  evidence that the decision was right rather than merely defensible.
- **The erratum decided rather than reconciled.** The commit withdrew the dissenting clause instead
  of bending FSPEC BR-16 to meet it. One reading now survives across REQ, FSPEC, AT-17 leg 4 and
  PROP-RATIO-08 leg 4, so the oracles downstream of it agree by construction rather than by
  coincidence.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | K-3's *"Upstream divergence, owed to TSPEC, not resolved here (TE F-05)"* clause states TSPEC §2.1 describes P9-02's title count moving *six → seven*; TSPEC v1.7 repaired that row to seven → eight and discharged the erratum, so the clause — and the matching sentences in the v1.5 and v1.6 changelogs — cite upstream text upstream no longer says (DEC-ERR-03). Unchanged this round: TSPEC did not move. Non-gating — every engineering conjunct of K-3 re-measures true at HEAD and TSPEC converged onto it; only the disagreement bookkeeping is stale. Owed at the next DECISIONS touch. | Obligations table, K-3; changelog v1.5 *"carried unresolved by design"*; changelog v1.6 *"erratum owed upstream"* |
| F-02 | Medium | inherited | nonlocal | The v1.6 grounding attestation (*"REQ v1.4 and FSPEC v1.5 were re-read and carry no decision this document owes"*) is now three REQ versions and two FSPEC versions stale against HEAD (REQ v1.7, FSPEC v1.7). Staler by one more REQ version this round. I performed the absorption check independently above and found nothing owed, so no load-bearing claim is falsified; the risk is a later round trusting the attestation to decide re-grounding is unnecessary. | Changelog, v1.6 grounding attestation (`DECISIONS:54`) |
| F-03 | Low | inherited | nonlocal | The sentence introducing the co-change site table still reads *"Four hold the enumerations; five pin them"*, contradicting the document's own 5 + 4 + 1 breakdown two paragraphs below. Cosmetic, pins no oracle. | DEC-STATS-01, site-table introduction |
| F-04 | Medium | inherited | nonlocal | Process defect in the cascade mechanism, not in this document's bytes. A third consecutive round has recorded an `UPSTREAM-STATE` TSPEC pin resolving to no version on this branch's history path — v8 `512a9fcf…`, v9 `235fd3dd…`, v10 `f2261510…` — while each round's body measured a real hash (v10's body `a06a6032…`, which matches HEAD). Every recovery so far depended on a reviewer preferring the body over the trailer. A non-resolving pin silently turns a cascade confirmation into a guess about the baseline. Escalated Low → Medium on the recurrence: three-for-three is evidence about impact, not a re-reading of the same evidence. Recommend the trailer pin be emitted from the body's measurement, and a non-resolving pin be treated fail-closed by the round that reads it. | v10 / v9 / v8 `UPSTREAM-STATE` trailers (mechanism, not document bytes) |

FINDING: Medium | inherited | nonlocal | Obligations table, K-3 — "Upstream divergence, owed to TSPEC (TE F-05)" clause | K-3 states TSPEC §2.1 describes P9-02's title count moving six → seven; TSPEC v1.7 repaired the row to seven → eight and discharged the erratum, so that clause and the matching v1.5/v1.6 changelog sentences cite upstream text upstream no longer says (DEC-ERR-03). Unchanged this round — TSPEC did not move. Non-gating: all of K-3's engineering conjuncts re-measure true at HEAD. Owed at the next DECISIONS touch.
FINDING: Medium | inherited | nonlocal | Changelog, v1.6 grounding attestation (DECISIONS:54) | "REQ v1.4 and FSPEC v1.5 were re-read and carry no decision this document owes" is now three REQ versions and two FSPEC versions stale against HEAD (REQ v1.7, FSPEC v1.7); the absorption check was done independently this round and found nothing owed, but a later round could trust the attestation to skip re-grounding.
FINDING: Low | inherited | nonlocal | DEC-STATS-01, site-table introduction | "Four hold the enumerations; five pin them" contradicts the document's own 5 + 4 + 1 breakdown two paragraphs below; cosmetic, pins no oracle.
FINDING: Medium | inherited | nonlocal | v10/v9/v8 UPSTREAM-STATE trailers (cascade mechanism, not document bytes) | Third consecutive round whose UPSTREAM-STATE TSPEC pin resolves to no version in history (512a9fcf…, 235fd3dd…, f2261510…) while each body measured a real hash (v10 body a06a6032… = HEAD); recovery has depended on reviewer attention every time. Escalated Low → Medium on the recurrence. Recommend emitting the trailer pin from the body's measurement and treating a non-resolving pin as fail-closed.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}

APPROVAL-HASH: sha256:48522bf9e03f6a459ce4c38eb0aa4b8fcb00d6c2d3693c749167af7bc2a4c88e
APPROVAL-HASH-NORMALIZED: sha256:d298b24c3b488e3fa5985ce3a8cf1ed0fc882b151b0c9b7de18fded6f3a9d034
REVIEWED-COMMIT: 930d65c49d6c308b73f1084da19b852bafe08887
UPSTREAM-STATE: REQ sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862
UPSTREAM-STATE: FSPEC sha256:a493133f67150b27020b10d05cd676a505e172f0b89082a208ce8198a3137f5d
UPSTREAM-STATE: TSPEC sha256:f2261510e5b63be00a859776877eb3513e453da0728c10eaecca8b5bb04d244f
