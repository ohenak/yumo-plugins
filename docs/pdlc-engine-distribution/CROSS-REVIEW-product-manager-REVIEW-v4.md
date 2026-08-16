# Cross-Review: product-manager — Review (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the implementation on `feat-pdlc-engine-distribution` (delta `40b2ab0c..HEAD`), against `REQ-pdlc-engine-distribution.md` §5 and my own round-3 review `CROSS-REVIEW-product-manager-REVIEW-v3.md`
**Date:** 2026-08-16
**Iteration:** 4
**Scope:** every finding below carries a Local / Cross-Feature / Process tag

## Method

Delta protocol. I read my own round-3 review first, then diffed
`40b2ab0c..HEAD` — 9 files, +477/−118 across four commits — and exercised only
what changed. Nothing outside the delta is re-litigated. Every claim below was
checked against the tree, not against a commit message or a changelog cell.

**Both suites run, not quoted.** `pdlc/engine` → `1..748`, 810 tests, **808
pass / 0 fail / 2 skipped** (the two documented `PDLC_LIVE=1` opt-in legs).
`pdlc/workflows` → **4 516 pass / 1 fail**, the same known-local false red
carried since round 1 (`documentOracles.test.js:246`, this checkout's untracked
`.claude/` and `.serena/` trees; CI green). Note that the engine's top-level
count moved `747 → 748` again between rounds — which is precisely why round 3's
F-01 asked the ledger to stop quoting absolute totals, and the fix now holds.

**The new coverage claim re-measured, not accepted.** PLAN v0.14's DoD item 4
states `scripts/fixture-machine.mjs` at 57.71% line / 88.57% branch / 40.74%
functions. I ran `npm test -- --experimental-test-coverage` and got those three
numbers exactly. I also read the branch column for the other seven modules the
item enumerates: `bin/cli.mjs` 87.35, `lib/provenance.mjs` 100, `lib/resolve-
version.mjs` 97.14, `lib/store.mjs` 94.44, `scripts/postinstall.mjs` 100,
`scripts/prepack.mjs` 91.67, `scripts/publish-preflight.mjs` 88.61. All eight
clear the ≥85% branch floor, so item 4 is satisfied as written.

**The PK-\* transcription checked against the spec, not against the old copy.**
The new shared fixture is only trustworthy if it still says what TSPEC says, so
I read `TSPEC:347-359` row by row against `_tspec-packed-set.mjs`: PK-1…PK-23
match member for member, PK-3's conditionality on N-2's *recorded decision*
survives the move, and V-03's twelve `lib/` modules plus §3.1's three are the
fifteen the count conjunct claims.

## Round-3 findings — disposition at HEAD

My round-3 review carried two Low findings and no Highs. Both are resolved.

| Round-3 ID | Severity | Disposition at HEAD | Evidence I checked |
|---|---|---|---|
| F-01 | Low / Process | **Resolved** | PLAN v0.14 rewrites v0.13's engine evidence to drop `1..744` / `803 pass` and state the conclusion the reconciliation actually rested on — **0 fail**, 2 documented `PDLC_LIVE=1` skips (`PLAN:30`). This is the right fix rather than a re-count: HEAD now measures `1..748` / 808 pass, so a re-stated absolute would already be stale one round later, and the new form is not. The changelog also says plainly that the old numbers came from a mid-stream run and that no row was wrongly flipped — the record now explains its own defect instead of quietly overwriting it |
| F-02 | Low / Local | **Resolved** | `launch-wiring.test.js:340-379` pins the *partition*, not the one id. It reads the resolver's complete refusal enumeration from `lib/resolve-version.mjs`'s own source (`refuse("…")`, 5 ids — I re-grepped: `:58,:69,:80,:84,:93`), subtracts `REFUSING_REFUSAL_IDS` (now exported, `bin/cli.mjs:303-308`), and asserts the remainder is exactly `["store.empty"]` by `deepEqual`. A sixth id added outside the refusing set reddens by name, with a failure message that tells the author to choose proceed wording. It fails closed on `declared.length >= 5`, so a resolver rewritten to build refusals another way cannot satisfy the subtraction vacuously — the specific hole that would have made this guard theatre |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Process | PLAN v0.14's new DoD item 4 passage scopes its coverage concession to `scripts/fixture-machine.mjs` "for this module alone… the only module in the enumeration whose purpose is to drive machine-level state", and declares it "**not** a precedent for the seven other modules in this item, all of which meet the floor on hermetic legs" (`PLAN:490`). The floor sentence is true and I verified it — all eight modules clear ≥85% **branch**. But the passage spends its argument on *function* coverage (40.74%, "roughly 60% of this module's functions are first exercised on `main`"), and on that measure the module is not alone: `scripts/publish-preflight.mjs` reports **63.33% functions** (88.61 branch), with the same shape of residue — `40-46`, `353-370`, `395-414`, `452-549` are its real-`npm`/network drivers. A DoD reader who takes the passage at face value concludes one module has un-executed drivers and seven do not, then meets the second one at item 14. Nothing here changes what ships or whether item 4 passes; it is a fidelity gap in the completion record, the same class as round-3 F-01. Fix, one clause: name `publish-preflight.mjs` as carrying the same residue for the same reason, or narrow the claim to "the only module whose *branch* floor rests on gated legs" — whichever is true of the decision that was actually taken | DoD item 4 |

## On what I checked and am *not* filing

Four changes in this delta could each have weakened a guarantee on the way to
fixing something else. I checked all four; none did.

**`_tspec-packed-set.mjs` de-duplicates without loosening.** Two hand-copies of
TSPEC §5.4 became one imported module. The anti-echo property is intact — the
expected set is still read from the spec, never from a directory listing nor
from `checkPackedSet`'s own refusal message — and `tspecPackedCount` still
derives `4 + 15 + 3 + 1 + licence` from the class sizes rather than from
`tspecPackedSet().length`, which is the detail that keeps the count conjunct
from agreeing with any list at all. The co-change obligation (TSPEC §5.4 and
FSPEC §5.2 move first) moved into the shared file rather than being dropped.

**AC-2.4 gains a carrier it never had.** `provenance-path.test.js:82-164` is
the substantive product win in this round: the old comment claimed a
byte-comparison against `bin/pdlc.mjs` that the test never performed, and the
commit records that mutating `major < 20` to `major < 8` left the suite green.
The new leg reads all three homes of the floor from their own files —
`package.json`'s `engines.node`, the guard's `major < N`, the catalogue
template — and asserts they agree, with both extractions failing closed by name
if the shape is gone. I confirmed the pinned `"20"` is a transcription and not
an echo: REQ:235 defines T-2 as 20 and REQ:199 restates it as C-3.

**The prepack scratch-root fix keeps the production entry.** `run.test.js`'s
process-entry leg no longer writes `pdlc/engine/vendor/` inside the shared
checkout, but it still spawns the real `scripts/prepack.mjs` as a process, so
the entry guard and the zero-argument `runPrepack()` are still what execute.
The `realpathSync` note is a genuine catch — an un-realpath'd `argv[1]` would
have made `isMainEntry` decline to fire and left the leg green while asserting
nothing. It closes with a positive assertion that the checkout's vendor root is
in its prior state, so re-introducing an in-place run reddens deterministically
in that file rather than intermittently in another.

**Exporting `REFUSING_REFUSAL_IDS` widens a module surface by one binding.**
Worth a glance because `bin/cli.mjs` is a packed member (PK-4b) and its shape
is asserted elsewhere; the five-key `deps` and inert-import legs still pass, and
the set is a constant the test needs to read rather than re-declare — which is
what makes the F-02 guard read the real partition instead of a copy of it.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from round 3 and still open in the record rather than in the code: branch 7 now has **two** operator-facing messages chosen by audience (`store.empty` refuses for `--version`/`doctor`, `store.empty-in-place` proceeds for `pdlc dev`). The behaviour is right and shipped. Does the operator want the two-audience rule recorded as a `DEC-EDIST-` row — a standing design rule for this launcher — or is it a one-off? The TSPEC erratum below asks only for the id to be registered; it deliberately does not decide this |
| Q-02 | Unchanged from rounds 1–3, and now answered *in the record* by PLAN's new DoD item 2 passage, which is the right resolution for this feature. The residual question is outside it: `documentOracles.test.js` walks the repo skipping only `.git/` and `node_modules/`, so every reviewer with a `.serena/` or `.tokensave/` tree meets a red that no diff explains. Four rounds have now paid that tax. Is one shared ignore list worth a `pdlc/workflows` queue row, given the item-2 passage makes it non-blocking here? |

## Positive Observations

- **A missing oracle was reported as a missing oracle.** The AC-2.4 fix is the
  best thing in this round, and not because of the test. The old comment
  asserted a byte-comparison the code never made; the new comment says so, in
  the file, with the mutant that proved it (`major < 20` → `major < 8`, green
  three runs running) and the sentence "a comment claiming an oracle that does
  not exist is worse than no comment, because it stops the search". An
  acceptance criterion with no carrier is the one defect a review process is
  least likely to catch twice, and this round left a marker for the reader who
  comes after.
- **The floor is checked in three places against each other, and then against
  reality.** It would have been enough to compare the guard to the catalogue.
  The leg also pins `guardFloor === "20"` and asserts the refusal text *names*
  the floor it enforces, explicitly so that a regex matching some other
  `major < N` cannot satisfy the first two assertions against itself. That is
  the anti-vacuity habit applied without being asked.
- **The de-duplication fixed the class, not the instance.** Round 3 accepted two
  hand-copies of §5.4 because both were faithful. This round noticed that
  "both faithful today" is not a property, moved the transcription into one
  imported module, and recorded the co-change obligation where the next editor
  will actually be standing. The suites now provably say the same thing rather
  than happening to.
- **An intermittent red was diagnosed instead of retried.** The prepack leg's
  1-in-5 flake is written up with its mechanism (`resolveWorkflowRoot` prefers
  a vendor root that another file's test was about to `rmSync`), its measured
  rate, and the reason it mattered — it made this round's own mutation probes
  ambiguous while `pr-tests.yml` gates Phase PUB on the suite's colour. Flakes
  usually get a re-run; this one got a cause and a permanent assertion.
- **The ledger now states a conclusion that stays true.** v0.14 does not
  re-count to `806`; it drops absolute totals and keeps "0 fail / 2 documented
  skips". HEAD has already moved to 748/808 since, which is the proof the form
  was chosen correctly rather than conveniently.
- **The coverage concession is a decision, not a silence.** DoD item 4 now says
  which option was taken (b), what it costs in the operator's terms (≈60% of
  that module's functions first execute on `main`, so a defect surfaces at item
  14), why it is bounded, and that it sets no precedent. My F-01 asks only that
  its enumeration be as exact as the rest of the passage.

## Recommendation

**Approved with minor changes** (0 High, 0 Medium, 1 Low).

Both of my round-3 findings are closed, and closed structurally rather than
locally: F-02 is guarded by the refusal-id *partition* read from the resolver's
own source, not by a second assertion about `store.empty`, and F-01 is fixed by
removing the class of stale number rather than by refreshing one. The delta
narrowed no guarantee I could find, and two of its changes — the AC-2.4 carrier
and the single PK-\* transcription — make the contract materially stricter than
it was when I approved round 3.

The convergence question for this round is whether my blocking findings are
resolved and whether the revision broke anything. Yes, and no. The one finding
I file is Low and concerns a sentence in the completion record, not behaviour
any operator will meet:

1. In PLAN DoD item 4, either name `scripts/publish-preflight.mjs` (63.33%
   functions) as carrying the same driver residue as `fixture-machine.mjs`, or
   narrow "for this module alone" to the branch-floor claim that is true of it
   (F-01). The decision is sound; only its enumeration is short by one.

One erratum is emitted separately against TSPEC. It is unchanged from round 3
and still unlanded: the `store.empty-in-place` id remains unregistered in
§10.3's enumeration, and §6.2's branch 7 still describes a single message.
`bin/cli.mjs:299-302` itself records that the departure was raised as an
erratum rather than decided in code, so the tree and the spec currently disagree
about how many operator-facing messages branch 7 has. Per protocol I have not
folded it into this verdict and it does not change the recommendation — the
implementation I am approving behaves correctly; the record does not yet
describe it.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
