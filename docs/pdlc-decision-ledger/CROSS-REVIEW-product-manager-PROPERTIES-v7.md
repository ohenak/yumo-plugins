# Cross-Review: product-manager — PROPERTIES (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md (v1.3, 2026-09-01)
**Date:** 2026-09-01
**Iteration:** 7 (targeted-correction delta confirmation, PROPERTIES v1.2 → v1.3, PROP-WIRE-08 re-anchor for `CODE_REVIEW-pdlc-decision-ledger-v3.md` F-8)
**Scope:** Local

## What this round is

Not a cascade round. Every upstream pin is byte-identical to the round-6 `UPSTREAM-STATE` anchors — REQ `9bc8bc32…05f10d`, FSPEC `48691453…a11256`, TSPEC `b8dcac11…46db6d`, DECISIONS `48e73a41…880240`, PLAN `285bf180…d56841` all re-measured unmoved at HEAD `173142da4`. Zero upstream movement; this is a document-side erratum absorption only.

The round-6 recommendation was **Approved with minor changes** (six Medium bookkeeping items, no High). Three questions, at the High-only bar:

1. Is the delta inside the claimed envelope?
2. Is the re-worded PROP-WIRE-08 truthful and still falsifiable?
3. Does the round-6 approval still hold?

**Answer: yes, yes, yes.**

## 1. Envelope

The commit is one file, 16 insertions / 2 deletions, and the diff touches exactly three regions:

| Region | Change |
|---|---|
| Status row | `1.2 / 2026-08-29` → `1.3 / 2026-09-01` |
| §Revision history | New `v1.3` changelog block prepended above the v1.2 block |
| §Properties, WIRE family | PROP-WIRE-08's row re-worded in place |

Mechanically confirmed against the claimed envelope:

- **No property added, removed or renumbered.** PROP-WIRE-05…12 are intact and in order; the WIRE family's membership, the ✖-marked rows (WIRE-09) and the Class column values (`Contract` for WIRE-08) are all unchanged.
- **No count, fixture, corpus digest or measured literal moved.** The four corpus literals, the 25-file fixture count, the `70`/`12500` defaults, the `102` census literal and the ≤1,200-byte budget are outside the diff entirely.
- **No acceptance criterion moved.** §Coverage Matrix, the AT mapping (AT-03 → PROP-WIRE-06/-07/-08) and the module-ownership manifest are untouched — the delta does not reach them.
- **Scope discipline observed.** The changelog is explicit that this is a targeted absorption of `TSPEC` §2.4/§4.5 only, and that the Upstream cell's stale pins and the §Gaps routed items are deliberately left standing. Naming what was *not* done is the right move for a targeted round; it stops a reader mistaking v1.3 for a full re-pin.

Envelope holds.

## 2. Is the re-worded property truthful?

Checked the row's four factual claims against shipped code and `TSPEC` v1.4, not against the changelog's own summary:

| Claim in PROP-WIRE-08 | Evidence at HEAD |
|---|---|
| `reviewerPrompt` is unchanged and takes **no** ledger argument | `orchestrate-dev.js` `function reviewerPrompt(doc, phase, feature, iteration, reviewer, docType, frozen, findingGrammar)` — eight parameters, and a comment stating outright that there is no ledger parameter |
| Its return is only the wrapper's `basePrompt` | Confirmed at the two `runWrapped` reviewer call sites; the builder's return is passed as `basePrompt`, so anything folded in would precede the suffix |
| The block is a trailing `ledgerBlock` option on `dispatchAndVerify` | `dispatchAndVerify({ …, ledgerBlock = "" })`, defaulted so an uninjected run is byte-unchanged |
| Threaded via `reviewLoop`'s `wrapped` / `runWrapped` closures | Both closures carry `ledgerBlock = ""` as their trailing parameter and forward it; both reviewer dispatches pass the round's rendered block |
| Concatenated **last**, after pacing clause, opener and learnings block | `` `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}${learningsBlock}${ledgerBlock}` `` — `ledgerBlock` is terminal |
| `TSPEC` v1.4 §2.4/§4.5 says this | Both sections describe exactly this threading; the TSPEC status row reads v1.4, 2026-09-01 |
| Old anchors were dead | `orchestrate-dev.js:11483/:11506` no longer sit on `reviewerPrompt` return statements |

Every claim checks out. The retired ninth-parameter account was not merely mis-anchored, it was **wrong on substance** — a prompt-builder parameter could not have satisfied the property, because the builder's output is `basePrompt` and the wrapper appends three further parts after it. The row now says so, with the reason, which is a strictly better artefact than the version it replaces.

## 3. Is it still falsifiable — and is the falsifier the same one?

Yes, and it is if anything sharper. The old falsifier was builder-level ("appended after `oraclePart` and `findingGrammarPart` on both return paths"). The new one is observable-level: *any delivered reviewer prompt of any round that does not end with the block*. That is the falsifier a product reader actually cares about, since the delivered prompt is what a reviewer sees.

It is **not narrowed**. It preserves the iteration-1 / iteration-≥2 axis verbatim in intent, and it *adds* two universals the old text left implicit — "both reviewers" and "every round". A property that quantifies over more delivered prompts is harder to satisfy, not easier. The existing `decisionLedgerLoop.test.js` oracles already assert on composed reviewer-prompt bytes on both the iteration-1 and iteration-≥2 paths for both reviewers, so the changelog's claim that no oracle needs to change is correct, and it is correct for the right reason: those oracles were always written against the delivered prompt, never against the builder.

No requirement is uncovered and no acceptance criterion is narrowed. AT-03's mapping to PROP-WIRE-06/-07/-08 still discharges, and PROP-WIRE-07's neighbouring "`reviewLoop` must pass `""` as the `ledgerBlock` argument" sentence is now consistent with WIRE-08 rather than in tension with it — before this delta, WIRE-07 described an option-threaded `""` while WIRE-08 described a builder parameter. The delta quietly removes an internal contradiction between two adjacent properties.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The v1.3 prose cites `TSPEC` **v1.4** §2.4/§4.5 while the header Upstream cell still pins `TSPEC-pdlc-decision-ledger.md` **v1.0**. That is now a same-document version disagreement, deliberately incurred. Round 5's Q-02 and round 6's Q-02 asked the same structural question: should in-body citations carry version labels at all, or should the header row be the single version-bearing site? This delta is the third round in a row where the answer would have mattered. Worth settling on the next real revision. |
| Q-02 | Round 6's Q-01 stands unanswered: the manifest's self-describing "set-equal to `PLAN`'s manifest in both directions" claim is an assertion of present fact that goes stale silently. Re-phrasing it as an obligation on the next author would retire a recurring finding class rather than a single instance. |

## Observations

- **The correction was made in the direction of the code, not away from it.** A cheaper fix would have been to re-pin the two line numbers. Instead the row was re-grounded on function names per DEC-DOC-01, which is the fix that stays true when the file moves again — and it will.
- **The row now states a negative fact, not just a positive one.** "`reviewerPrompt` is unchanged and takes no ledger argument … anything folded in there would sit *before* the suffix and could not be last" tells the next reader why the obvious implementation is wrong. That is worth the extra bytes.
- **The changelog is honest about what it did not do.** Naming the Upstream cell and §Gaps as deliberately untouched keeps the six round-6 Medium items visible instead of letting a version bump imply they were swept up.
- **Zero upstream movement, and the delta proves it.** Four rounds of cascade and one erratum round have now passed with no requirement lost and no acceptance criterion narrowed.

## Recommendation

**Approved with minor changes**

The round-6 approval holds. The delta is inside its claimed envelope, the re-worded PROP-WIRE-08 is truthful against shipped code and `TSPEC` v1.4, and its falsifier is preserved and marginally strengthened. No High findings; Phase P is not gated.

Two Medium items carry forward, both bookkeeping:

1. **F-01** — the header Upstream cell's `TSPEC` v1.0 / `PLAN` v0.7 pins now contradict the v1.3 prose's own `TSPEC` v1.4 citation. Re-measure mechanically on the next revision (Q-01).
2. **F-02** — round 6's F-01…F-06 remain open and untouched by this delta, as its changelog states.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | The v1.3 changelog and PROP-WIRE-08 both cite `TSPEC` **v1.4** §2.4/§4.5, while the header Upstream cell still pins `TSPEC-pdlc-decision-ledger.md` **v1.0** (and `PLAN` **v0.7**, three PLAN versions behind HEAD v1.1). The delta widens the gap round-6 F-04 named into a same-document version disagreement. Substance is unaffected — the cited sections exist and say what the row claims — but a reader following the header pin lands on a TSPEC that predates the threading being described. Re-measure both pins on the next revision. | Header, Upstream row; §Revision history, v1.3 block; §Properties, PROP-WIRE-08 |
| F-02 | Medium | inherited | nonlocal | Round-6 F-01…F-06 are all still open, untouched by this delta and expressly excluded from it: the `documentOracles.test.js` / `decisionLedgerConfig.test.js` module-ownership manifest entries not re-derived against PLAN v1.1, PROP-DISC-07's terminal-count owner still attributed to T-12a → T-19 in three sites, the §Gaps routed item's fifteen-member owned list against PLAN's fourteen, and the INV-family TSPEC citations (§7.3's widened declaration regex, the "roughly a dozen" quotation, PROP-INV-09's `FSPEC` §7.6 for `TSPEC` §7.6). None falsifies a property. Best folded into one PROPERTIES erratum round of its own. | §Coverage, test-module ownership manifest; §Properties, DISC and INV families; §Gaps |

FINDING: Medium | delta | local | Header, Upstream row; §Revision history v1.3 block; §Properties PROP-WIRE-08 | v1.3 prose cites TSPEC v1.4 §2.4/§4.5 while the header Upstream cell still pins TSPEC v1.0 and PLAN v0.7, a same-document version disagreement (round-6 F-04 widened, deliberately deferred) (Scope: Local)
FINDING: Medium | inherited | nonlocal | §Coverage test-module ownership manifest; §Properties DISC and INV families; §Gaps | round-6 F-01…F-06 remain open and expressly untouched by this delta: manifest not re-derived against PLAN v1.1, PROP-DISC-07 owner attribution in three sites, §Gaps fifteen-member owned list, INV-family TSPEC citations (Scope: Local)

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}

APPROVAL-HASH: sha256:7ea6961f0fcbcbdb5be73de5881a7f8bfd3aad86eebe5afdf15384c6ee28e1b5
APPROVAL-HASH-NORMALIZED: sha256:3119cacafa2998407b2ff33bf0b2d15711b0dc70235c6b2e6385d41df802c3f5
REVIEWED-COMMIT: 8e116a3cd27a5fd046e5c1c4605a36f52119f27d
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:b8dcac11a521bc199d223a0547d3bd7d672640f5f6598d5b6103b2031246db6d
UPSTREAM-STATE: DECISIONS sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240
UPSTREAM-STATE: PLAN sha256:285bf1800e81c75c57ad06e32caa1df78b8f268c488262a6ceae2498fed56841
