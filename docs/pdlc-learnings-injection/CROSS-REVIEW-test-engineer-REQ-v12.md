# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 12
**Round type:** delta re-review under DECISION FREEZE — one erratum delta (v0.9 → v0.10)
**Scope:** whether erratum v0.10's AC-2.4 attribution clause is true of the repository at HEAD, whether it disturbs anything approved through v11, and whether the clause is writable as a falsifiable test today.

## Problem / Context

Round 11 was a no-delta confirmation: it approved the REQ at v0.9 with two Low findings and
showed the routed item belonged to TSPEC. This round carries a real REQ delta. Erratum v0.10
(dispatched from DoD round 1, `CODE_REVIEW-pdlc-learnings-injection-v1.md` F11) lands two hunks
and nothing else:

1. the header row — version `0.9` → `0.10`, date `2026-08-19` → `2026-08-21`, and a changelog
   sentence naming the erratum;
2. four lines appended to **AC-2.4**, making the report attribution *cause-defined*: a document
   the count bound (AC-2.2) already cut is reported under that cause even when the total bound
   also bound on the documents that remained, and only documents the total bound drops are
   reported under it — "the reason ids of AC-3.2 name causes, not coincidences".

`git diff 4db24c50 -- docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` is 25 lines
end to end; no other REQ section changed. The delta is the REQ half of the F11 remedy, whose
other halves are FSPEC BR-6 (v0.14) and the removal of the implementation's `propagateBytes`
guard. F11's whole complaint was that the shipped code implemented a split rule that no upstream
document stated, so the only question this round can turn on is a factual one: **does the clause
now written into AC-2.4 match what the code at HEAD actually does, and does the FSPEC it cites
actually say what it is credited with saying?** I re-derived both from the working tree rather
than from the erratum's own summary.

## Goals

- Establish that AC-2.4's new attribution clause is true of `selectLearnings` at HEAD, by reading
  the selection code, not the FSPEC's description of it.
- Establish that the co-authority the clause cites — "what FSPEC v0.14's BR-6 now states" — exists
  in the current FSPEC bytes at that version, so a test author reading either document lands on
  one behaviour.
- Establish that the clause is *falsifiable today*: that a test exists which reds if the retired
  reading is restored, and that its oracle is set-equality over the full rejection enumeration
  rather than containment.
- Confirm the delta disturbed nothing approved through v11 — that the two hunks are additive and
  no other AC's reading moved under them.
- Carry v11's two open Low findings forward honestly rather than letting a delta round drop them.

## Non-Goals

- Re-litigating REQ sections unchanged since v11. Under the delta protocol only AC-2.4 and the
  header are in scope, plus the fidelity sweep over what the new clause leans on.
- Reviewing FSPEC v0.14 or the implementation as artifacts. I read both as *evidence about the
  REQ's truth*; findings against them are not this file's verdict, and none arose.
- Reviewing whether F11's remedy was the right remedy. That decision is settled upstream
  (CODE_REVIEW v1 F11, DoD round 1) and the freeze puts it out of scope.
- TSPEC-altitude mechanics — seam design, fixture construction, assertion placement. The one
  test-design observation this round produced is recorded as `DEFERRED:`, not as a finding.

## Constraints

- **Decision freeze.** A finding blocks only if (i) this delta broke something that worked, or
  (ii) a load-bearing claim contradicts the repository at HEAD or an upstream document. Neither
  applies; everything else is `DEFERRED:`.
- **Rigour bar.** Any open High, old or new, means Needs revision. There is none. v11's two open
  findings are Low and both remain open, unaltered by this delta.
- **REQ altitude.** AC-2.4 states an observable outcome — which reason id appears against which
  path in the report. That is black-box testable from the REQ alone, so the clause sits at the
  right altitude; it names a cause, not a code branch.
- **Working tree, not a commit.** The REQ delta is uncommitted at review time
  (`git status --porcelain` shows ` M` on the REQ alongside the FSPEC, TSPEC and the workflow
  sources); the reviewed bytes are the working-tree bytes, diffed against `4db24c50`, the
  `REVIEWED-COMMIT` anchor v11 recorded.

## Delta disposition

| Check | Result |
|---|---|
| Base compared against | `4db24c50` — the `REVIEWED-COMMIT` anchor recorded in v11 |
| Diff size | 25 lines, two hunks (header row; AC-2.4 tail) |
| Sections changed | header/changelog row; **AC-2.4** only |
| Sections in scope for new-issue scan | AC-2.4 |
| Header bump | `0.9` → `0.10`, `2026-08-19` → `2026-08-21` — correctly bumped, unlike v11's no-delta round |
| Changelog entry | present, names the source (`DoD round 1, CODE_REVIEW v1 F11`) and the substantive change |
| Prior-round findings touched | none — v11's F-01 (AC-5.1b attribution, REQ:394) and F-02 (AC-3.2 mirror clause) are outside both hunks and remain open verbatim |
| Regression surface | additive only: the pre-existing AC-2.4 sentence is unchanged up to its final `(AC-3.2)`, with the new clause appended after a comma |

The delta is the narrowest edit that could discharge F11 on the REQ side. It adds a
distinction where the text previously said only "each dropped document appears in the report as
available-but-not-selected (AC-3.2)" — true but silent on *which* id — and it does not restate,
weaken, or re-scope any other bound.

## Verification at HEAD

Every claim the new clause makes or leans on, re-derived from the working tree:

| Claim in the delta | Evidence at HEAD | Holds? |
|---|---|---|
| "a document the count bound (AC-2.2) already cut is reported under that cause even when the total bound also bound" | `orchestrate-dev.js:2518-2521`: `for (const doc of overflow) rejected.push({ path: doc.path, reason: "RSN-COUNT" })` — unconditional over `overflow = ordered.slice(windowSize)` (`:2470`), with no reference to `firstByteFailIndex` | Yes |
| "only documents this bound drops are reported under it" | `orchestrate-dev.js:2495`: `for (const doc of windowRejected) rejected.push({ path: doc.path, reason: "RSN-BYTES" })`, where `windowRejected` is populated only inside the `window.forEach` accumulation (`:2483-2493`) — i.e. strictly documents the count bound *kept* | Yes |
| The retired reading is genuinely gone from the code | The `propagateBytes` guard (`firstByteFailIndex !== -1 && firstByteFailIndex < window.length - 1`) survives only as a quoted comment describing its removal (`orchestrate-dev.js:2497-2504`); it appears in no live expression | Yes |
| "what FSPEC v0.14's BR-6 now states" | FSPEC header is `0.14`, `2026-08-21` (`FSPEC:18`); BR-6 carries a paragraph headed **"The mixed case, stated."** (`FSPEC:519-528`) whose two sentences are the same rule in the same direction: documents past the window carry `RSN-COUNT` whatever the window's byte outcome; only in-window total-bound drops carry `RSN-BYTES` | Yes |
| The erratum's provenance | `CODE_REVIEW-pdlc-learnings-injection-v1.md:37` F11 (Medium, `Cross-Feature`) names exactly `orchestrate-dev.js:2496-2515` and FSPEC BR-6, and its remedy is "Apply the erratum to FSPEC BR-6 and REQ AC-2.4 on this branch … Delete the routing comment once the text matches the code" | Yes |
| The clause is consistent with AC-3.2's catalogue | AC-3.2 (REQ:325-326) defines `RSN-COUNT` as "below the count threshold's cut" and `RSN-BYTES` as "dropped by the total byte bound" — cause-worded already; the new clause sharpens the mixed case without adding or renaming a member, so the three set-equality tests AC-3.2 mandates are untouched | Yes |

**Falsifiability of the new clause.** The clause earns a test that can fail, and one exists:
`learningsSelect.test.js:374` ("an overflow document's reason id does not depend on where inside
the window the total-byte bound first fails") holds the corpus and `maxDocuments` fixed, moves
the byte failure between the window's last slot and its middle, and asserts the out-of-window
ids are invariant — the comment states the mutation explicitly ("Restoring the
`firstByteFailIndex < window.length - 1` guard reds the second case"). Its companion
`LI-AT-13` (`:279`) asserts the mixed case by **set equality** over the whole rejection map
(`expect(Object.fromEntries(result.rejected.map(...))).toEqual(expectedReasons)` plus a length
assertion, `:347-351`), so a deleted or relabelled case reds rather than passing by containment.
The expected ids are literal transcriptions (`"RSN-BYTES"`, `"RSN-COUNT"`), not derived from the
module under test. `npm test -- __tests__/learningsSelect.test.js` is green at HEAD: 18/18.

## Acceptance Criteria

## Findings

## Questions

## Risks

## Obligations

## Positive Observations

## Recommendation

## Verdict
