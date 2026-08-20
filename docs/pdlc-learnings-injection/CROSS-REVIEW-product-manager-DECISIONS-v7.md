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

## Consequences

## Findings

## Positive Observations

## Recommendation

## Verdict
