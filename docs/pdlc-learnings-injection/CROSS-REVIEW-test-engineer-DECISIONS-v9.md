# Cross-Review: test-engineer — DECISIONS (revision round, frozen)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.5, commit `9baf60b5`)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v8.md` (v0.4, `6f28eded`)
**Date:** 2026-08-21
**Iteration:** 9

## Context

Delta re-review under DECISION FREEZE. Five commits touched the document since the v8 base
`6f28eded`, +36/−11 lines, aimed at exactly the three findings v8 left open:

| Commit | Substance | Answers |
|---|---|---|
| `dbbfcb07` | `DEC-LI-08`'s framing paragraph restates the cost as a **formula over a named fixture** — a 477-byte block constant plus `49 + 2·len(path) + len(feature) + len(orderKey)` per selected document, plus `30 + len(String(bytes))` when the document is `bounded` — and evaluates it over this repository's corpus (684 / 1,607; 718 / 1,777 abridged) | v8 F-01 |
| `79675345` | `D-O-4` cites that formula instead of restating `694` / `1,012`, and states outright that neither reported quantity has a transcribable expected constant | v8 F-01 (downstream half) |
| `6548c08a` | §Scope's grounding pin gains a "two kinds of citation" paragraph separating pre-feature *grounds* from post-implementation *shipped-code confirmations* | v8 F-02 |
| `a370ba06` | Header re-pinned on REQ v0.10 / FSPEC v0.14; version bumped to 0.5 with a round-7 changelog | v8 F-03 |
| `9baf60b5` | Upstream version note records that FSPEC v0.14's window restatement and REQ AC-2.4's attribution clause leave the byte-accounting basis, `E-36` and `AT-30` untouched | v8 F-03 |

All three findings are resolved, and I verified the fix by re-running the shipped renderer rather
than by reading the prose. Nothing v8 approved regressed. One Low, non-gating arithmetic
observation on the new ceiling sentence is recorded below.

## Options Considered

Under freeze the only live question is whether to block. Three candidates, all rejected:

**(a) Block on the framing formula.** Rejected — the formula is exact, not approximately right. I
re-ran `renderLearningsBlock` (`pdlc/workflows/orchestrate-dev.js:2542-2561`) at HEAD with empty
`material`, over the fixture the document names (`git ls-files | grep -E 'LEARNINGS-.*\.md$'`, first
five, ten-character `orderKey`), and compared each rendered length in bytes against the document's
formula `477 + Σ(49 + 2·len(path) + len(feature) + len(orderKey)) [+ n·(30 + len(String(bytes)))]`:

| Fixture | Rendered (bytes) | Formula predicts |
|---|---|---|
| 1 document, not abridged | **684** | **684** |
| 5 documents, not abridged | **1,607** | **1,607** |
| 1 document, abridged | **718** | **718** |
| 5 documents, abridged | **1,777** | **1,777** |

Exact on all four, and the two constants the prose decomposes check out byte-for-byte:
`LEARNINGS_BLOCK_HEADER` is 50 bytes and `LEARNINGS_BLOCK_TRAILER` is 35
(`orchestrate-dev.js:2528-2529`). The per-document term matches the code's construction — the
opener embeds `doc.path`, the regex-extracted feature, `doc.orderKey` and the conditional
`(ABRIDGED: bounded at N bytes)` clause, and the closer embeds `doc.path` a second time
(`orchestrate-dev.js:2545-2552`). This is the "state the shape, not two literals" fix v8 asked for,
landed verbatim.

**(b) Block on the grounding-pin scope (v8 F-02).** Rejected — resolved as asked. The new paragraph
(§Scope) names the two post-implementation citations explicitly — `renderLearningsBlock`'s framing
inventory in `DEC-LI-08`, and `extractInjectableMaterial`'s `maxBytes <= 0` early return plus
`selectLearnings`'s `sections.length === 0` branch in `D-O-3` — and states that no decision rests on
them. That is exactly the pre-feature/post-hoc distinction the over-broad pin was collapsing.

**(c) Block on the upstream pin (v8 F-03).** Rejected — resolved and re-verified at HEAD. REQ is
v0.10 and FSPEC is v0.14 (REQ:18, FSPEC:18); TSPEC is still v0.9 (TSPEC:18), which the header still
says. Every substantive claim the new note makes holds: FSPEC's byte-accounting basis is still
material-only (FSPEC:489-495), `E-36` still decides `maxBytesPerDocument: 0` ⇒ `RSN-NO-MATERIAL` and
no slot (FSPEC:798), `AT-30` still carries all three zeros (FSPEC:967-968), and v0.14's erratum note
is indeed a window restatement plus the `RSN-COUNT` attribution rule with "no behavioural change"
(FSPEC:83-90).

## Decision

**Approved with minor changes.** No open High finding, old or new. The one delta-introduced High
from v8 (F-01) is closed by a fix that is verifiable rather than assertable, and the two Mediums are
closed as well.

**Why the fix is the right kind of fix, in testing terms.** v8's objection was not that two numbers
were off by a little — it was that `D-O-4` handed a downstream PROPERTIES/report author two literals
presented as measured constants, which is precisely the shape our expectation rule forbids: an
expected value must be a literal transcription from the spec, and a spec literal that is only
reproducible on an unnamed fixture is a trap, because the transcribing test goes green only against a
fixture chosen to make it true. The revision removes the trap at its source. `D-O-4` now says the
quantity "is derived per corpus from that formula, so a report assertion pins the formula's
evaluation over the fixture under test, never a number copied from here". That is the correct oracle
design for a corpus-dependent quantity: the test parameterises over its own fixture and evaluates the
stated formula, so a renderer change that alters framing goes RED, while a fixture change does not.
The two surviving literals — 477 and the per-document coefficient 49 — are properties of the shipped
renderer's fixed strings, not of any corpus, and both reproduce exactly.

**The two prior residues are gone, not papered over.** `694` / `1,012` / `21,012` no longer appear
anywhere as live claims — the only surviving occurrence is inside the round-7 changelog row, where
they are named as the values being *replaced* and are explicitly labelled as having come from two
different fixtures (DECISIONS:18). That is the correct place for a retracted number.

**Freeze discipline.** I re-derived the framing numbers and the upstream anchors and looked at
nothing else. The unchanged decision entries, the accounting basis, `D-O-3`'s zero-bound conjunct and
the obligations table's other rows were approved before and are not re-litigated here.

## Consequences

**What changes for the test author.** `D-O-4` is now discharged by a *derived* assertion rather than
a transcribed one. Concretely, the PROPERTIES/report obligation is now writable as: build the
fixture, evaluate `477 + Σ(49 + 2·len(path) + len(feature) + len(orderKey))` over exactly that
fixture's selected documents (plus `30 + len(String(bytes))` per abridged document), and assert the
reported realised **block** bytes equals it, while the reported realised **material** bytes equals
the sum of BR-8's *bytes injected*. That oracle is falsifiable in the way that matters: change any
framing string in `renderLearningsBlock` and it goes RED, because the expected side is computed from
the document's stated formula and the actual side from the renderer. Note for whoever writes it —
this is one place where "no implementation echoes" needs care: the expected value must transcribe
**this document's** formula, not call `renderLearningsBlock` or import the framing constants from
`orchestrate-dev.js`, or the test proves only that the renderer equals itself.

**The ceiling sentence is now honest about its own kind.** "up to roughly 21,600 bytes … but it is a
**function of the corpus**, not a fixed number: any reader can re-evaluate the formula against their
own paths" is the right claim shape for the acknowledged C-8 gap. The gap keeps a closing condition
(the two commensurable quantities `D-O-4` reports) without pinning it to a number that stops being
true when the corpus grows. One arithmetic wrinkle inside that sentence is recorded as F-01 below —
Low, non-gating, no transcription hazard, because `D-O-4` now forbids transcribing it.

**What the delta did not disturb.** The accounting basis, the `D-O-3` zero-bound conjunct, the
`D-O-4` material/block split and every other obligation row are byte-identical to the v8 text I
approved; the diff touches the header row, the §Scope citation paragraph, the upstream version note,
`DEC-LI-08`'s framing paragraph and `D-O-4`'s parenthetical, and nothing else.

**The version-cascade process cost recurred a fourth time, and was paid mechanically this round.**
v8's F-04 predicted it: this round again turned partly on confirming that two upstream bumps left
this document's claims true. The revision made that cheap by writing the delta's *substance* into the
upstream version note (which anchors it survives: FSPEC:489, FSPEC:798, FSPEC:967-968), so the check
was a three-anchor diff rather than a re-read of two documents. That is the shape the process
learning should preserve — I am re-filing it for harvest rather than re-opening it as a finding.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The ceiling sentence quotes the non-abridged five-document figure while the sentence beside it calls abridged "the common case".** `DEC-LI-08` states "a fully-conforming block over *this* corpus occupies up to roughly **21,600 bytes**". Over the named fixture, five non-abridged documents cost 1,607 (20,000 + 1,607 = 21,607 ≈ 21,600 ✓), but five *abridged* documents cost **1,777** (21,777) — and the preceding clause says abridging is what §4.1's 6,000-byte per-document default makes usual. An "up to" bound should take the larger arm: "roughly 21,800" would cover both. Non-gating and no transcription hazard — `D-O-4` explicitly forbids copying either number, and the formula, which is the load-bearing artifact, is exact. Fix if the document is touched again for another reason; not worth a round on its own | `DEC-LI-08` §"What the caps bound" |
| F-02 | Low | Process | **Fourth consecutive round decided by re-deriving upstream version movement by hand.** v6, v7, v8 and now v9 each spent review budget confirming that sibling-document bumps left this document's present-tense claims true. This round was cheaper only because the author pre-wrote the anchors (FSPEC:489, FSPEC:798, FSPEC:967-968) into the upstream version note. A mechanical sweep — grep present-tense sibling-version citations in a document under review, diff the cited anchors' bytes since the pinned commit — would retire the manual check entirely. Re-filed from v8 F-04 for harvest, not re-opened against this document | §"Upstream version note"; process |

**DEFERRED items** (freeze-scope observations, recorded and not blocking; no decision reopened):

DEFERRED: `DEC-LI-08`'s decomposition of the 477-byte block constant ("the `\n\n` prefix, the 50-byte header, the preamble, the separators and the 35-byte trailer") silently absorbs the `-2` that `docs.join("\n\n")` contributes (the joiner is charged per document in the 49 term, so the constant carries `479 − 2`); the total is exact, only the prose inventory is one term short of self-explaining.
DEFERRED: the formula writes `len(feature)`, and the shipped code derives that feature from the **filename** via `LEARNINGS_DOC_FEATURE_RE` (`orchestrate-dev.js:2534,2546-2547`), not from the directory; the two coincide on every path in the named fixture, but a PROPERTIES author computing the expected value should be told which one.
DEFERRED: the 477 and 49 constants are stated without a citation to the renderer that fixes them; a `pdlc/workflows/orchestrate-dev.js` §symbol reference in the paragraph would let the next reviewer re-derive without grepping.
DEFERRED: `D-O-4`'s two quantities are still named prose-side but not bound to report field names — that contract belongs to PROPERTIES/report, not here.

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Carried from v7 and v8, still open.) `D-O-6` is the sole falsifier of a wrongly-`null` `corpusOutcome`. Should PROPERTIES additionally carry a **mutation** check on it — revert the `RSN-UNLISTABLE` record on a failing dispatch and expect RED — given that no other obligation would catch the regression? |
| Q-02 | Should `D-O-4`'s report assertion be required to evaluate the formula from **this document's** text rather than importing the renderer's framing constants? The obligation implies it ("never a number copied from here"), but an implementer could satisfy the letter by calling `renderLearningsBlock` on both sides, which proves nothing. |

## Questions

## Positive Observations

- **The fix converted an assertion into something a reviewer can execute.** Four rendered lengths,
  two constants and one per-document coefficient all reproduce exactly against
  `renderLearningsBlock` at HEAD (`orchestrate-dev.js:2542-2561`). Replacing two literals with a
  formula plus a *named* fixture is what made this round a five-minute mechanical check instead of a
  re-measurement argument — and it is the same property that will make `D-O-4`'s eventual test
  falsifiable.
- **`D-O-4` now closes the transcription hazard explicitly, in the obligation's own text.** "Neither
  quantity has a transcribable expected constant" tells the downstream author *why* there is no
  number to copy, not merely that there isn't one. That sentence is doing real work: it pre-empts the
  most likely failure mode, a report test pinned to a constant that goes green on one corpus.
- **The two-kinds-of-citation paragraph is the right general answer to v8 F-02**, not a local patch —
  it names which citations are grounds and which are shipped-code confirmations, so a future reader
  can tell at a glance which claims would need re-grounding if the implementation changed.
- **The upstream note carries its own evidence.** Rather than asserting "v0.14 changed nothing that
  matters", it names what v0.14 *did* change (BR-6's window, the `RSN-COUNT` attribution) and which
  anchors it left alone. Both halves check out at HEAD (FSPEC:83-90, 489-495, 798, 967-968).
- **Surgical delta.** +36/−11 lines across five commits, each mapped to one open finding; nothing
  approved in v8 regressed.

## Recommendation

**Approved with minor changes.**

The v8 High (F-01) is resolved by verification, not assertion: the framing formula and all four
fixture figures reproduce byte-exactly on the shipped renderer, and the two literals that created the
transcription hazard are gone from `D-O-4` and survive only as a labelled retraction in the
changelog. The two v8 Mediums (grounding-pin scope, upstream re-pin) are resolved and re-verified at
HEAD. Two Low findings are recorded and do not gate: an "up to" ceiling that quotes the non-abridged
arm (F-01), and the recurring version-cascade process cost routed to harvest (F-02). Four DEFERRED
observations are recorded for a future round; none reopens a frozen decision.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:87ec8ebca294ebbdd45eb0fdebe939740fc968c8b91dcaf964dbc87ca299b193
APPROVAL-HASH-NORMALIZED: sha256:87ec8ebca294ebbdd45eb0fdebe939740fc968c8b91dcaf964dbc87ca299b193
REVIEWED-COMMIT: 9baf60b5c6344eb59c66b5b83523420358ce121b
UPSTREAM-STATE: REQ sha256:32cb8b7d4f4072d18772c7efeeb846460083dfea1959cd1159ac625a057fafeb
UPSTREAM-STATE: FSPEC sha256:ef2301995af6ab2b0d722339a15d07da1eeec8ce28b501a92155064d660b5e56
UPSTREAM-STATE: TSPEC sha256:1ddfdbc340d9078efc98930df625cc4f8f0dd6d3d9b24070fdee08af8ff44a95
