# Cross-Review: product-manager — DECISIONS (revision re-review, frozen round)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 7
**Scope:** Local

## Context

v6 was a delta confirmation on unchanged DECISIONS bytes (`REVIEWED-COMMIT: 8f3db3d8`,
`APPROVAL-HASH: sha256:85888c03…`) and recorded `Approved with minor changes` with five
inherited findings — F-01 (AC-3.3 locus row asserting a settled question open), F-02
(`DEC-LI-07`'s divergence framing plus an undischarged `D-O-9`), F-03 (stale `TSPEC v0.5` /
`FSPEC v0.7` pins), F-04 (a paraphrase of FSPEC `A-2` that `A-2` no longer says) and F-05
(a dated "current upstream" paragraph).

This round the document itself moved. Six commits land between `8f3db3d8` and HEAD
`e29a296e`, all of them addressing those findings or the TE reviewer's: `1eb66bdb` re-pins the
header, `0e1a3edf` re-grounds `DEC-LI-03`, `3293ade4` re-grounds `DEC-LI-06`'s reversibility,
`5423f0b1` records the TSPEC erratum as landed, `483a9de0` restates the AC-3.3 non-decision,
`e29a296e` records `D-O-6` as the sole falsifier of a `null` corpus outcome. The document is
now v0.3.

Upstream at HEAD, verified by hash: REQ `sha256:ff605dd3…` (v0.9) — byte-identical to what v6
recorded; FSPEC `sha256:ae75fa62…` (v0.13) — byte-identical to what v6 recorded; TSPEC has moved
from `sha256:f629d29d…` (v0.7) to `sha256:22dee8ce…` (v0.9). So this round has two jobs: confirm
the six commits closed what they claim to close, and confirm nothing in them is false against
REQ v0.9 / FSPEC v0.13 / TSPEC v0.9 or against the repository at HEAD. Decision freeze is in
force; I opened no new decision.

## Options Considered

Three ways this delta could have broken something. Each was traced to upstream text or to code,
not judged by impression.

**Reading A — the delta over-claims: it says things landed that did not land.** The strongest
candidate, since five of six commits assert a closure. Checked one at a time against HEAD:

| Delta claim | Checked against | Holds? |
|---|---|---|
| Header pin `TSPEC v0.9`, `FSPEC v0.13`, `REQ v0.9` | Version rows: TSPEC `\| pdlc \| Draft \| Claude \| 0.9 \| 2026-08-20 \|`; FSPEC `\| 0.13 \| 2026-08-20 \|`; REQ `\| 0.9 \| 2026-08-19 \|` | Yes |
| "§I.3 gates on `config.enabled` alone" | TSPEC §I.2's divergence table and the "There is no `present` field: it had no consumer, so it is removed (TE F-06)" paragraph; §I.3's predicate `dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)` | Yes |
| "`OQ.2` settled" | TSPEC §"Still open, unresolved by design": "**OQ.2 — … CLOSED by REQ v0.9**" | Yes |
| "`ERR-4` CLOSED, resolved REQ v0.9" | TSPEC: "**ERR-4 (REQ G-1 / AC-1.1 versus AC-5.1a) — CLOSED, resolved by REQ v0.9**" | Yes |
| "`LEARNINGS_DEFAULTS.enabled === true`" | TSPEC §I.2: `export const LEARNINGS_DEFAULTS = Object.freeze({ enabled: true, … })` | Yes |
| "`ERR-6` is CLOSED" | TSPEC: "**ERR-6 (REQ AC-3.3) — CLOSED, resolved by REQ v0.9**" | Yes |

Rejected — every closure claim is true at HEAD. One sub-claim is imprecise rather than false and
is filed as F-01 (Low): the `D-O-9` row says "**DISCHARGED at TSPEC v0.9**", but the four edits
first landed earlier in the TSPEC's own history (`c618c28f` retired `ERR-4`/`ERR-6`; `f7e678c2`
dropped the `present` field), and v0.9 is where they are *observed*, not where they landed. The
discharge itself is real either way, so nothing downstream reads a false state.

**Reading B — the rewritten `DEC-LI-03` trigger misquotes `A-2` or misstates `BR-1`.** This is
where F-04 was, so a botched fix would be the classic delta defect. The new text quotes `A-2`
verbatim — "If a future phase introduces a dispatch that satisfies neither conjunct in the
pipeline's own terms yet is authoring in spirit, BR-1 excludes it by construction" — and FSPEC's
`A-2` bullet at HEAD carries exactly that sentence, including the "correct default: widening is
explicit, never implicit" continuation the entry paraphrases. The two-conjunct restatement matches
FSPEC's decision-table row `D-2`: "Does BR-1's two-conjunct rule hold — authoring-classified **and**
a target document among the six C-1 types?", with the third branch "authoring-classified, target
none of the six → no block". Rejected.

The one new *code* claim in that rewrite is `G-C` — "Phase CR's `docType: null` already instantiates
it". Verified in the repository, not only in TSPEC: `pdlc/workflows/orchestrate-dev.js`'s Phase CR
block calls `reviewLoop({ doc: \`docs/${featureName}/\`, phase: "CR", docType: null, … })`, and
TSPEC `P-2b` records the same shape with `roundDocType` staying `null` into `dispatchAndVerify`.
The claim is true of the shipped code, not only of the spec.

**Reading C — the `DEC-LI-06` reversibility rewrite trades a true-but-loose ground for a false
precise one.** It now asserts that a read memo is invisible to the filesystem-footprint oracle and
that the real ground is `E-32` plus `D-O-6`'s counts, "not AC-5.2". FSPEC `BR-15` at HEAD says both
sides are compared "as **sets of paths**, not as counts, so a document opened more than once neither
adds a member nor changes the verdict" — so a memo, which removes repeat opens but not first opens,
leaves the observed set identical and AT-33 green. `E-32` at HEAD reads "Each dispatch selects over
the state **it** observed", quoted correctly. The parenthetical carve-out for a cache *file* holds
too: `BR-15` states "no index, cache or state file is created anywhere (NG-1, NG-4)". Rejected —
the rewrite is more precise *and* true.

I also re-checked the two entries the delta did **not** touch but which the new `DEC-LI-10`
paragraph now leans on. TSPEC §D.1 does scope each domain-membership test to non-`null` values
("one test per domain asserts that every **non-`null`** value it ever carries is a member"), does
keep `LEARNINGS_CORPUS_OUTCOMES` at exactly `["RSN-UNLISTABLE", "RSN-EMPTY"]` under set-equality,
and does state the mirror's domain test "is a membership test only … so it does not turn the mirror
into an oracle". The DECISIONS paragraph's conclusion — that the scoped test can no longer falsify a
`null` recorded where a catalogued reason was required, leaving `D-O-6`'s behavioural case as sole
falsifier — follows from that text rather than restating it.

## Decision

**All five v6 findings are resolved. No High finding, old or new. Approved with minor changes.**

Prior-finding disposition, each verified against the delta and upstream at HEAD:

| Prior | Was | Now | Verified against |
|---|---|---|---|
| F-01 (Medium) — AC-3.3 locus row described a settled question as open and routed to REQ via `ERR-6` | Open since v3 | **Resolved** (`483a9de0`). The row now reads "REQ, which **has now settled it** (v0.9); TSPEC `ERR-6` is CLOSED", and states the settled answer PROPERTIES must be written on: ordering key per authoring dispatch, thresholds once per run, two loci, two completeness tests | REQ AC-3.3 verbatim ("the **ordering key value per document** is recorded **per authoring dispatch** … the **§4.1 thresholds in force** are recorded **once per run** … two completeness tests assert set equality, one per locus"); FSPEC `BR-10`'s two-row locus table; TSPEC `ERR-6` CLOSED |
| F-02 (Medium) — `DEC-LI-07` asserted a live divergence; `D-O-9` stood open | Open since v3 | **Resolved** (`5423f0b1`, `e29a296e`). The paragraph is retitled "was a recorded erratum, and it has landed", names all four edits, and the `D-O-9` row is struck through and marked discharged with the trace retained | TSPEC §I.2/§I.3, `OQ.2` CLOSED, `ERR-4` CLOSED, `LEARNINGS_DEFAULTS.enabled: true` |
| F-03 (Low) — stale `TSPEC v0.5` / `FSPEC v0.7` pins, widened three rounds | Open since v3 | **Resolved** (`1eb66bdb`). Header row reads TSPEC v0.9 / REQ v0.9 / FSPEC v0.13; `DEC-LI-07`'s citation reads "FSPEC `BR-14` (v0.13 at HEAD)". Remaining `v0.5` mentions are all historical narration ("TSPEC v0.5 **was** authored…"), which is correct, not stale | Grep of every `TSPEC v0.\|FSPEC v0.\|REQ v0.` occurrence in the document against upstream version rows |
| F-04 (Low) — `DEC-LI-03` paraphrased `A-2` as "authoring in spirit but not so classified", which `A-2` no longer says | Open since v3 | **Resolved** (`0e1a3edf`). The trigger now quotes `A-2` verbatim and restates `BR-1`'s two conjuncts as two exclusion shapes | FSPEC `A-2`, decision-table `D-2`, and `orchestrate-dev.js`'s Phase CR call for `G-C` |
| F-05 (Low) — the upstream-version note was a dated claim in timeless voice | Open since v5 | **Resolved** (`1eb66bdb`). Rewritten to "grounded on upstream **at HEAD**: TSPEC v0.9, FSPEC v0.13, REQ v0.9 … **No live upstream gap remains**", with the history kept only as the reason `DEC-LI-07` reads as a divergence | Upstream hashes and version rows at HEAD |

Nothing the delta introduced is false against REQ v0.9, FSPEC v0.13, TSPEC v0.9 or the repository
at HEAD. The `BR-14` five-state table `DEC-LI-07` transcribes is byte-identical upstream, so the
re-pin did not silently change what is being cited. One Low finding is new (F-01 below), and it is
a precision nit on a landing-version attribution, not a false state.

## Consequences

**PLAN and PROPERTIES are unblocked on this document's account.** The two findings that had a
downstream cost are the two that closed. F-01's stale AC-3.3 row would have told a PROPERTIES
author that the locus question was open and routed to REQ; it now hands them the settled contract
and, in the same row, the trap: a completeness or membership assertion aimed at `runMirror` is
"green on a single-dispatch fixture and silently wrong on AT-18's divergent run". That is the
absence-only-oracle failure mode named at the exact place a test author would hit it. F-02's
undischarged `D-O-9` would have told the same author to wait for a TSPEC edit that had already
landed; `AT-31`/`AT-32` may now be authored against §I.3 as written.

**One durable observation about how these five findings survived four rounds.** All five were
citation- or currency-defects, and all five were invisible to every mechanical gate the pipeline
runs: nothing falsifies a header pin, nothing notices that an obligation was discharged in the
*target* document without a signal routing back to the document that raised it, and nothing dates
a "current upstream" sentence written in timeless voice. The v6 review filed these three as
`Process` candidates; this round is the evidence that they close only when a human re-reads
upstream, since the delta that closed them was authored from the cross-review, not from a red test.
I am not re-filing them here — they belong to harvest, and v6 already carries them — but the
fourth-round-to-close latency is the number worth keeping.

**The `D-O-6` dependency is now written down where it can be seen.** The new `DEC-LI-10` paragraph
and the extended `D-O-6` row make explicit a coupling that was previously only derivable: because
TSPEC §D.1's membership tests are scoped to non-`null`, dropping `D-O-6`'s behavioural conjunct as
"redundant with the count conjunct" would silently remove the only falsifier of a `null` corpus
outcome recorded where a catalogued reason was required. That is exactly the kind of cross-obligation
dependency a later optimizer round deletes by accident, and it is now guarded by prose in both
places rather than in neither.

**Deferred items** — recorded, not opened, per the freeze:

DEFERRED: `D-O-9`'s "DISCHARGED at TSPEC v0.9" attributes the discharge to the version where the edits are observed rather than the version where they landed; a future pass could name the landing version.
DEFERRED: The AC-3.3 non-decision row is now the longest cell in the table and carries the `runMirror` test-targeting warning; that warning may deserve promotion to an obligation row rather than living inside a non-decision cell.
DEFERRED: The three `Process` candidates from v6 (unfalsifiable header pins, discharge-without-routing, dated claims in timeless voice) remain unaddressed by any gate and are now demonstrated over five rounds; they belong to harvest.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | `D-O-9`'s row records the erratum as "**DISCHARGED at TSPEC v0.9**" and `DEC-LI-07` says TSPEC "has since made all four edits: at HEAD (v0.9)…". Both are true as observations at HEAD, but v0.9 is not the version where the edits landed — `ERR-4`/`ERR-6` were retired and the `present` field dropped in earlier TSPEC revisions, and v0.9's own changelog is about FSPEC Step 5 sequencing (`ERR-8`). Non-gating: the discharge is real, and no downstream reader is misled about *whether* it landed. Fix is one clause — name the landing version, or say "landed at or before TSPEC v0.9". | REQ AC-5.1a (via `DEC-LI-07`); `D-O-9` |
| F-02 | Low | Local | `DEC-LI-03`'s re-evaluation trigger cites `G-C` for the `docType: null` instantiation. `G-C` is a row in this document's own grounds table, and its evidence cell cites `orchestrate-dev.js` — which checks out at HEAD (Phase CR's `reviewLoop({doc: …, phase: "CR", docType: null, …})`). But a reader arriving at `DEC-LI-03` sees a bare id with no hint that it is local rather than an upstream FSPEC anchor, in a sentence whose other two citations (`BR-1`, `A-2`) are upstream. Non-gating; one word ("this document's `G-C`") removes the ambiguity. | REQ C-1 / FSPEC `BR-1` |

**Verified, no finding:** the header pin against all three upstream version rows; `A-2`'s quotation
verbatim; `BR-1`'s two conjuncts against FSPEC decision-table `D-2`; `BR-15`'s "sets of paths, not
… counts" quotation; `E-32`'s "the state **it** observed" quotation; `BR-10`'s two-loci /
two-completeness-tests structure against REQ AC-3.3's own wording; TSPEC §D.1's non-`null` scoping
and its unchanged `["RSN-UNLISTABLE", "RSN-EMPTY"]` set-equality operand; TSPEC §D.2's
`ADDITIVE, NOT THE ORACLE` mirror with a deliberately unconstrained value; `BR-14`'s five-state
table byte-identical to what `DEC-LI-07` transcribes; and Phase CR's `docType: null` in
`pdlc/workflows/orchestrate-dev.js`.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `D-O-9` is retained struck-through "so the erratum's trace survives". Is that the convention this document wants for future discharged obligations, or is `D-O-9` a one-off because it was the round's headline? Either answer is fine; naming it saves the next author a judgement call. |

## Positive Observations

- **Every closure claim in this delta is checkable, and every one checked out.** The revision could
  have written "TSPEC has landed the erratum" and left it there. Instead it names all four edits
  individually — §I.3's gate, `OQ.2`, `ERR-4`, `LEARNINGS_DEFAULTS.enabled` — so confirming it was
  four greps rather than a re-read of TSPEC. That is what makes a frozen round cheap.
- **`DEC-LI-06`'s reversibility rewrite made the entry more falsifiable, not just more current.**
  The old text said "revisiting E-32 and AC-5.2"; the new text explains *why* AC-5.2 would not have
  to move (`BR-15` compares sets, and a memo removes no member), which converts a plausible-sounding
  pairing into a claim with a test attached — AT-33 stays green, so the footprint oracle is not the
  defence. Naming which oracle *cannot* catch the regression is more useful than naming one that can.
- **The `D-O-9` row was struck through rather than deleted.** Deleting it would have left the next
  reader unable to reconstruct why `DEC-LI-07` carries a whole paragraph about a divergence that no
  longer exists. Keeping the row with its trace costs one line and preserves the audit path.
- **The AC-3.3 non-decision row now tells PROPERTIES where *not* to assert.** It would have been
  enough to record that REQ settled the locus. Naming the failure mode — a mirror-targeted assertion
  is green on a single-dispatch fixture and wrong on AT-18's divergent run — puts the warning at the
  point of use, which is where a test author will actually meet it.
- **`DEC-LI-10`'s new paragraph is honest about a weakness rather than defensive about it.** "The
  consequence this entry owes the reader: the scoped test can no longer falsify a `corpusOutcome`
  that is `null` where a catalogued reason was required" is a decision document admitting its own
  completeness test has a blind spot, and then naming who covers it. That is the right instinct.

## Recommendation

**Approved with minor changes**

No High finding. All five findings carried from v6 are resolved, each verified against the upstream
text or the repository rather than against the commit message that claims to close it. The delta
introduced no defect: every new or rewritten passage — the header pin, `DEC-LI-03`'s two exclusion
shapes, `DEC-LI-06`'s memo-versus-cache-file distinction, `DEC-LI-07`'s landed-erratum paragraph,
the AC-3.3 non-decision row, `DEC-LI-10`'s blind-spot paragraph and `D-O-6`'s extended row — checks
out against REQ v0.9, FSPEC v0.13, TSPEC v0.9 or `pdlc/workflows/orchestrate-dev.js` at HEAD.

Two Low findings are recorded and do not gate: F-01 (the `D-O-9` discharge attributes the landing to
the version where it is observed) and F-02 (`G-C` cited without signalling that it is a local
ground). Three deferred items are recorded in `## Consequences` per the freeze. No decision was
opened, reopened or contradicted in this round.

DECISIONS now stands alongside REQ, FSPEC and TSPEC at HEAD with no live upstream gap. PLAN and
PROPERTIES may proceed on it.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
