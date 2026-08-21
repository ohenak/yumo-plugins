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

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
