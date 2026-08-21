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

What this delta round had to establish, and whether it did:

| # | Criterion | Met? |
|---|---|---|
| CC-1 | The routed erratum landed in the REQ as a real delta | Yes — AC-2.4 tail, header bumped to 0.10 |
| CC-2 | The clause is true of the shipped selection at HEAD | Yes — `orchestrate-dev.js:2495`, `:2518-2521` |
| CC-3 | The cited co-authority exists at the cited version | Yes — FSPEC v0.14 `:18`, BR-6 "The mixed case, stated" `:519-528` |
| CC-4 | The clause introduces no new or renamed reason id | Yes — AC-3.2's three catalogues unchanged (REQ:325-334) |
| CC-5 | The new invariant has its own falsifying test in this revision | Yes — `learningsSelect.test.js:374`, with the mutation named; `LI-AT-13` asserts by set equality |
| CC-6 | Nothing approved through v11 regressed | Yes — hunks are additive; no other AC's text moved |
| CC-7 | Prior open findings dispositioned, not dropped | Yes — v11's two Lows carried forward below, both still open |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **(inherited from v11 F-01, unchanged by this delta.)** AC-5.1b attributes the operator notice to the reader: "the same response `orchestrate-dev.js`'s `parseImplementationConfig` ships, whose malformed section yields defaults plus an explicit operator notice" (REQ:394). At HEAD that function returns `{config: IMPLEMENTATION_DEFAULTS, sectionMalformed: true, invalidKeys: []}` and emits nothing; the notice is the caller's, and the second call site keeps only `.config`, so at that site a malformed section yields defaults with **no** notice. The precedent the AC leans on is real — defaults plus notice is what the wave-mode pipeline does — so the decision is undisturbed; the imprecision would lead a TSPEC author pinning "the reader reports" to the wrong seam. **Fix (non-gating):** "…yields defaults, on which its caller emits an explicit operator notice". | AC-5.1b (REQ:394) |
| F-02 | Low | Local | **(inherited from v11 F-02, unchanged by this delta.)** AC-3.2's mirror clause exempts an operator-visible field from every oracle: the run-level mirror "is additive, is not the oracle, and has a deliberately unconstrained value that nothing asserts on" (REQ:328-330). The per-dispatch oracle stays positively asserted, so falsifiability of the primary record is unchanged; but a mirror whose value contradicts the dispatch records it summarises would be undetectable by the suite and still green, while an operator reading the report top-down meets the contradiction first. **Fix (non-gating, or absorb at TSPEC):** drop the clause, or bound it with one consistency assertion — if a mirror is carried, it agrees with the dispatch records it summarises. | AC-3.2 (REQ:328-330) |

Neither finding is a defect this delta introduced, and neither is High; under the freeze neither
blocks. Both are single-clause edits that can ride any future erratum touching this document.

DEFERRED: AC-2.4's clause is now cause-defined in prose but the REQ never says, in one place, that the two ids **partition** the dropped set — a reader could still imagine a document reported under both. The code makes it a partition by construction (`overflow` and `windowRejected` are disjoint by `slice`), and `LI-AT-13`'s set-equality map enforces one id per path, so nothing is at risk; a half-sentence ("each dropped document carries exactly one id") would make the partition readable from the REQ alone.
DEFERRED: The falsifier at `learningsSelect.test.js:374` proves invariance at two window positions (last slot, middle). A property-based version over (window index of first byte failure) × (corpus size) would close the whole parameterised space rather than two witnesses; this is a PROPERTIES/TSPEC-time refinement, not a REQ matter.
DEFERRED: v11's two DEFERRED lines stand — (a) AC-3.1's set-equality test is vacuous for a dispatch that selected nothing, so the empty-dispatch assertion belongs to AC-3.2's "rows present and empty"; (b) §1.2 claim 2's code claims should reach TSPEC as a literal restatement pin against `consolidate-learnings.js:1348-1355` and `:587-593`.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The REQ, FSPEC v0.14 and the implementation now agree on the mixed case. Does TSPEC — modified in the same working tree this round — carry the matching statement, or does §I.3 still describe the retired split? This is not a REQ defect and I am not reviewing TSPEC here; it is the one place the two-readings hazard F11 named could survive the remedy. |
| Q-02 | F11 is tagged `Cross-Feature` in CODE_REVIEW v1. "Report a cut under the bound that actually removed it, not the bound that happened to also fail" is a reusable oracle-design rule. Is it queued for promotion to `docs/_constraints/DOMAIN-CONSTRAINTS.md` at harvest, or does it retire with this feature? |

## Risks

- **The remedy is three-part and only two parts are verified here.** REQ AC-2.4 and FSPEC BR-6
  now state the rule and the code implements it; if TSPEC's §I.3 still describes the retired
  split, a future test author reads the stale document and writes a red test against correct
  code — the same failure mode as v11's routed item, one document downstream.
- **The removed comment is the deletion F11's remedy asked for, and it is only partly done.**
  `orchestrate-dev.js:2497-2516` still carries a long narrative of the retired guard. It now
  reads as history rather than open routing ("Code and specification now agree; there is nothing
  left routed", `:2515`), so it is not a contradiction — but a comment describing a rule that no
  longer exists is exactly the artifact that gets read as normative two features from now.
- **`RSN-UNLISTABLE` remains the one corpus-level outcome with no natural fixture** (carried from
  v11). Unchanged by this delta, still unproven by any suite that does not inject a failing
  `git ls-files` reply.
- **Twelve rounds on one REQ.** This one carried a real, code-grounded item and resolved it in
  four lines. That is the shape a further round should have, or it should be declined at dispatch.

## Obligations

- Both Low findings (F-01, F-02) remain open and are the author's to ride on any future erratum
  touching this document, or to absorb at TSPEC time.
- The REQ delta is uncommitted at review time. It must land on `feat-pdlc-learnings-injection`
  together with the FSPEC v0.14 and implementation halves of the F11 remedy — the three are only
  coherent as a set, and a partial commit would leave a document citing a version that is not
  yet on the branch.
- CODE_REVIEW v1 F11's remedy includes "Delete the routing comment once the text matches the
  code". The text now matches; the comment's deletion (or demotion to a one-line historical
  note) is still outstanding at `orchestrate-dev.js:2497-2516`.

## Positive Observations

- **The erratum states a rule, not a special case.** "The reason ids of AC-3.2 name causes, not
  coincidences" is one sentence that decides every mixed case, including ones nobody has written
  a fixture for yet. It is the kind of clause a reviewer can diff a code branch against
  mechanically — which is exactly how I verified it in three greps.
- **The fix arrived with its own falsifier.** The new invariant has a test whose comment names
  the mutation that reds it (`learningsSelect.test.js:374`), and the pre-existing `LI-AT-13` was
  cleaned of an expected value that had been tuned to the implementation's unspec'd guard
  (`:296-302`). An implementation echo was removed in the same revision that removed the
  behaviour it echoed — that is the discipline working.
- **Set equality, not containment.** `LI-AT-13` asserts the full rejection map with `toEqual`
  plus a length check, so a dropped or relabelled case reds. The catalogue closure AC-3.2 demands
  is enforced, not asserted.
- **The chain closed end to end.** A DoD reviewer found code disagreeing with its spec, routed
  it as an erratum to two documents, both were edited at the same altitude each owns — the REQ
  states the cause rule, FSPEC states its mechanics — and the code lost the branch neither had
  ever authorised. No document closed a question it did not own.

## Recommendation

**Approved with minor changes**

No High findings. Erratum v0.10's AC-2.4 clause is true of the shipped selection at HEAD
(`orchestrate-dev.js:2495`, `:2518-2521`), the co-authority it cites exists at the version it
cites (FSPEC v0.14, BR-6 `:519-528`), it introduces no new reason id and leaves AC-3.2's three
closed catalogues untouched, and it arrives with a falsifying test that reds if the retired
`propagateBytes` reading is restored. The two hunks are additive; nothing approved through v11
regressed. The two carried Low findings are inherited wording refinements that do not block.

The outstanding work is downstream and outside this verdict: confirm TSPEC §I.3 carries the same
mixed-case statement, and finish F11's remedy by deleting the now-historical routing comment at
`orchestrate-dev.js:2497-2516`.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:32cb8b7d4f4072d18772c7efeeb846460083dfea1959cd1159ac625a057fafeb
APPROVAL-HASH-NORMALIZED: sha256:745d89e314bf9e0396a01603eaf21ce4707eaa875f4068ccb7be67aafa713615
REVIEWED-COMMIT: bbc88069907c434100e45a8e26885856fee3e530
