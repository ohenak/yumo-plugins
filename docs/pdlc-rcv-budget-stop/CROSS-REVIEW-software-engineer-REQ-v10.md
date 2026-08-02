# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.4, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 10
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v9 was the REQ as of `21297cd` (v2.3); this
review covers `21297cd..HEAD` on that file — commits `3592689`, `3b6f3df`, `987f2c3`, `3fe6120`,
`36cc615`, `19dccf4`, `ba952c2`, `76f66fc`, `851a896` (115 changed lines across the §0 header and
changelog, §3.1 X-06, §4.1, §5 AC-1.5(4), §6, §7, §8 O-10 and O-12, §9 R-14 and §10) plus the three
files the change reaches outside this document: `docs/_constraints/pdlc-rcv-baseline.md` (new §3.1,
new §3.2), `docs/_constraints/pdlc-rcv-split.md` (§5 obligation, new §5.2, new §5.3) and
`docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` X-07/R-16/O-10/§5. Sections unchanged since
v9 were not re-litigated.

## 1. Disposition of the v9 findings

**The Medium and all three Lows are closed**, each at the surface the finding named, and the Medium
was closed by the two-part fix I asked for rather than by narrowing the claim.

| v9 id | Sev | Status | What was checked |
|---|---|---|---|
| **F-01** (§4.1's *target state* qualifier defers the whole word *invalid*; no stated `W` for a malformed value; `NaN` reachable) | **Medium** | ✅ closed, both halves | `3b6f3df` rewrites the §4.1 `W` row to defer only the named checks: *"Only *invalid*'s **consistency** half — ordering, the highest round, `H − A ∈ {0, 1}` — is **target state** (`REQ-RCV-07` AC-7.1, X-06); **§6's S-13/S-14 grammar is in force at this ship**, so a value that is not a decimal integer ≥ 1 contributes none and `W` falls back to **1**, never `NaN` into `windowEnd` (AC-1.2, O-12)."* That is the *defer the check, not the word* fix. `987f2c3` keeps the two grammars in §6 with an explicit in-force marker, `19dccf4` adds the grammar/analysis layer split to X-06 (*"AC-7.1 step 2 therefore re-checks that grammar rather than first-checking it"*, carried to X-07 — v9 Q-02 answered *yes*), and `3fe6120` adds the matching interim leg to O-10 as **leg 3**. `O-12` gained the closing half — *"origin resolution takes the greatest **well-formed** `WINDOW-START:` value (§6), falling back to `1` when none is, so `W` is a decimal integer on every path"* — so the `NaN` path is now closed at the TSPEC obligation as well as at the criterion. Leg 3 itself carries two defects of its own: F-01 and F-02 below. |
| **F-02** (the 0-call contract leg is owed over a seam signature no document fixes) | Low | ✅ closed, in O-12 as proposed | `3fe6120` appends to O-12: *"Also specify the **injected *validate* seam** O-10's contract leg asserts against — its parameter name, per this repo's `_`-prefixed injection convention (`_agent`, `_readFile`, …), its arity 2 and its boolean return (AC-1.5(4) fixes the predicate as total and single-valued over the region and the branch listing) — accepted by the interim composition and not called; `REQ-RCV-07` AC-7.1 supplies its implementation."* Name, arity, return and convention, at the obligation that owns how `W` reaches `deriveRoundWindow`. O-10 now cites `(O-12)` at the point it asserts the signature, so the two ends are linked in both directions. |
| **F-03** (X-06's *"the call site exists … but does not consult it"* contradicts the 0-call leg) | Low | ✅ closed, with the wording proposed, and carried | `19dccf4`: *"The **injection point** exists — the interim composition accepts the seam as a parameter — so row 18 adds a call rather than rebuilding a call graph, and **no call site is emitted at this ship**: the interim composition calls it **0 times** (O-10)."* `REQ-RCV-07` X-07 carries the same sentence verbatim in the same revision. |
| **F-04** (`pdlc-rcv-split.md` §5's *same commit* rule is unachievable under the pacing contract) | Low | ✅ closed at both the rule and the compliance claim | `ba952c2` restates §5's obligation over the **revision**, with the reason recorded in the split record itself: *"Revise all four **within the same revision**, in the same words, before that revision is submitted for review — the reviewer checks both ends **at HEAD**, not at a commit boundary. (Stated over the revision rather than the commit because the authoring pacing contract mandates one top-level section per edit and a commit after each …)"*. §10 drops the *in the same commit* claim to match and now says *"v2.4's were, in this revision."* I checked that claim rather than accepting it: X-06/R-14 and X-07/R-16 all carry, at HEAD, the *injection point / no call site emitted / 0 times* wording, the grammar-vs-analysis layer split, the three-horn rejection by reference to §5.1, and `Order 18` / 10 → 12 → 18. **True as stated.** |

**Independent re-verification of the four relocations.** The round moved four blocks out of this
document; I diffed each against its new home clause by clause rather than trusting the *nothing
changed meaning* note.

- **`pdlc-rcv-split.md` §5.2** carries both halves of the deleted AC-1.5(4) arithmetic — the
  *constraint-on-`W`-only* counter-example (two `HALT-REASON:`, one invalid `WINDOW-START:`, `A < H`,
  clearance consumed while `W` is still 1, permanently) and the `H − A ≤ 1` vacuity argument
  (`H − A − 1` free windows, every invocation, fail-open). `REQ-RCV-07`'s duplicate copy of the same
  argument was deleted in the same revision and replaced by a pointer, so this is a real
  de-duplication across both ends, not a one-way move.
- **`pdlc-rcv-split.md` §5.3** carries the refusal-is-not-a-halt argument in full: clause 1 halting on
  the budget path, AC-1.4 governing every halt, `H += 1`, the stripped `RESOLVED:`, *"spending the
  clearance it declined to spend and converting a repairable region into an unrepairable one."*
- **`pdlc-rcv-baseline.md` §3.1** carries all eight per-row notes from the deleted §6 table, including
  the two that are load-bearing elsewhere: `WINDOW-START:`'s *never authored by a human* with the
  authoring-scoped exemption and the *deleting a single answering line is forbidden at every `H − A`*
  rule (R-10's residual cites it), and S-16's *sole emitter and `{reason}` selection are
  `REQ-RCV-07` AC-7.1 step 4's*.
- **`pdlc-rcv-baseline.md` §3.2** carries all five relocated §4.1 rows, including the three that
  AC-1.4 and AC-1.5(5) read: the unreadable-but-present post-mortem (`status: "none"` ⇒ `H = A = 0`),
  the single `RESOLVED:` line's fail-closed gate, and *the last `HALT-REASON:` line* read as a
  convergence halt when unreadable. §4.1 correctly keeps exactly the two rows its own gate turns on.

**Sizes are mine, not the document's:** `wc -lc` gives **442 lines / 55,273 bytes** against
`check-req-size.sh:47-48`'s soft thresholds (630 / 55,296). Headroom is **23 bytes**, down from 58 —
Q-01 below.

## 2. Disposition of the v9 questions

| v9 id | Status | Note |
|---|---|---|
| **Q-01** (relocate before writing the fixes — 58 bytes will not absorb them) | ✅ acted on, and the answer was *relocate more than I named* | Four blocks moved, not the two I suggested, and the two I did suggest (§4.1's durability table, §6's row notes) are among them. The fixes then landed inside the freed space: 442 lines / 55,273 bytes, still under both soft thresholds. The margin is now 23 bytes, which is the same question one round later — Q-01 below. |
| **Q-02** (should X-06 name the grammar/analysis layer split explicitly, and is it a paired edge?) | ✅ answered *yes*, at both ends | X-06: *"**What is *not* deferred:** §6's S-13/S-14 **grammar** is in force at this ship — the predicate's grammar layer is this REQ's, its **analysis** layer (ordering, highest round, `H − A ∈ {0, 1}`) is AC-7.1's, so that step re-checks rather than first-checks the grammar."* X-07 carries it: *"**AC-7.1 step 2 therefore re-checks that grammar rather than first-checking it**, and what this REQ first adds is the **analysis** layer."* R-16 carries the same split. Treated as a paired edge per `pdlc-rcv-split.md` §5, as I asked. |
| **Q-03** (carried, `REQ-RCV-07`'s `W`-visibility question) | — | Still that REQ's. Recorded only so the trail is unbroken for harvest. |


## 3. Findings

Scanned the changed sections only — §0 header/changelog, §3.1 X-06, §4.1, §5 AC-1.5(4), §6, §7, §8
O-10 and O-12, §9 R-14, §10 — plus the four relocation targets and `REQ-RCV-07` X-07/R-16/O-10/§5.
**Two Medium, one Low.** Both Mediums are defects **inside** the new O-10 **leg 3**, the fixture this
round added to close v9 F-01. The fix's shape is right and I would not undo it; leg 3 as written is
under-determined in one place and contradicted by §6 in another, and a test author implementing it
literally would write an assertion that either fails or asserts the wrong disposition.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **Medium** | Local | **§6's S-13 row and O-10 leg 3 give opposite answers to *does a malformed `WINDOW-START:` line count toward `A`*, and the two answers grant and refuse a clearance respectively.** §6's restated grammar row reads *"a line whose value is not one is **not a `WINDOW-START: {N}` line** and contributes no value"* — an existence claim about the line, not about its value. §4.1's clearance row defines the count over exactly that kind: *"`A` = `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines"*. Compose them and a malformed line contributes nothing to `A` either. But O-10 leg 3 asserts the opposite in terms: *"the malformed line **still counts toward `A`** (the counts are over line prefixes, not values), so `A = H = 1` and no clearance is observed."* The divergence is observable on leg 3's own fixture and it is the fail-open/fail-closed axis: **counting it** gives `A = H = 1`, `A < H` false, the gate grants nothing, the loop writes no answering line — leg 3's asserted behaviour, and fail-closed. **Not counting it** gives `A = 0 < H = 1` with a readable `RESOLVED: yes`, so both surviving conjuncts pass and the gate **grants** — a `WINDOW-START: {N}` appended, a fresh window opened, over a region whose accounting is already known to be corrupt. That second reading is precisely the fail-open `pdlc-rcv-split.md` §5.2 names (*"two `HALT-REASON:` lines and one *invalid* `WINDOW-START:` would give `A < H`, so the loop would write an answering line and consume the clearance"*), reached here **because** §6's grammar was put in force. It also decides a second thing: whether leg 3 is a valid site for the 0-call oracle (under *counting*, `A < H` is false and a wired gate short-circuits; under *not counting*, a wired gate reaches the seam). **Fix, one clause in §6:** scope the exclusion to value derivation, not to line identity — *"a line whose value is not one contributes **no value to `W`**; it remains a `WINDOW-START:` line for §4.1's `A` count, which is over line prefixes, not values (O-10 leg 3)"* — and add the same *prefixes, not values* half-sentence to §4.1's clearance row, which is the row a TSPEC author reads for the count. | §6 `WINDOW-START: {N}` (S-13) row; §4.1 clearance row; §8 O-10 leg 3 |
| F-02 | **Medium** | Local | **O-10 leg 3 omits the branch-listing state, and its most natural completion falsifies the leg's own conclusion.** Legs 1 and 2 both pin the listing — leg 1 *"highest round on the branch = `windowEnd(1)` = **3**"*, leg 2 *"highest round below `windowEnd(1)`"* — because in this REQ the listing, not the region, decides whether a round can open (AC-1.1, AC-1.5(1)). Leg 3 pins the region (*one `HALT-REASON:` line, one `WINDOW-START: abc`, a readable `RESOLVED: yes`*) and says nothing about the listing, then concludes *"The ordinary window `[1, 3]` opens — no refusal, no S-16, no answering line, counts unmoved, **≥ 1** dispatch."* But a fixture built by analogy with leg 1 — the obvious move, since leg 3 is described as leg 1 with the value corrupted — has highest round = **3** = `windowEnd(1)`, and then `W` = 1 gives the window `[1, 3]` with **no round left**: AC-1.5(1) halts on the budget path, S-4 is rendered, and the dispatch count is **0**, not ≥ 1. The leg's own `≥ 1`-dispatch conjunct, which O-10 says is *"what makes each leg falsify an interim that refuses"*, then fails against a correct implementation. The state that makes leg 3 true is a region that halted for a reason other than budget exhaustion with rounds still left under `W` = 1 — reachable (a mid-window S-3 fixed-point halt), but nowhere stated. **Fix, one clause:** pin the listing exactly as leg 2 does — *"…and the highest round on the branch **below `windowEnd(1)`**, so the budget path is not the thing under test"*. Worth one line of rationale too, since it is the reason leg 3 cannot be leg 1's twin: **leg 3 is a fixture about the origin, so its listing must leave the window open**, or the budget halt masks the origin behaviour the leg exists to pin. | §8 O-10 leg 3; leg 1 and leg 2's listing clauses; §5 AC-1.5(1) |
| F-03 | Low | Local | **§6's collapsed row asserts `budget-exhausted:` (S-4) is *"stated once in baseline §3"*; baseline §3 has no such row, and baseline §3.1 — the round's own relocation target — says so.** v2.3's §6 carried the exemption explicitly: *"**One row below sits outside baseline §3's scope deliberately, not by defect:** `budget-exhausted:` is a render fixed by catalogue §2."* `987f2c3` deletes that sentence and folds S-4 into the four-way row whose note reads *"**Stated once in baseline §3**, with this REQ's local notes at baseline §3.1"*. I read baseline §3's table: `MAX_REVIEW_ROUNDS`, `## Reset Region`, `HALT-REASON:`, `WINDOW-START:`, `WINDOW-RESUMED:`, `reset-region-corrupt:`, `DOC-BYTES:`, `DOC-SHA256:`, `REVIEW-MODE:`, `REVIEW-SCOPE-ROUNDS:`, `MAX_AUTHORING_WRITE_BYTES`, `## Measurement Required`, symbol-proximity window — **no `budget-exhausted:` row**, exactly as before. Baseline §3.1's relocated note still says *"Outside this table's scope deliberately: a render fixed by catalogue §2"*, so the two documents now disagree about the same row, and §6's own rule — *"a threshold used here and absent there is a defect"* — makes the REQ self-report a defect that is not one. The consequence is small and downstream: a TSPEC or FSPEC author following §6's pointer finds nothing, and a later reviewer's obvious repair is to **add** a row to the shared baseline, which is the change catalogue §2's *fixed here and only here* rule forbids. Hence Low, not Medium. **Fix:** split S-4 out of the collapsed row, or add six words to its note — *"S-4 excepted: outside baseline §3 deliberately, its render is catalogue §2's (baseline §3.1)"*. | §6 collapsed S-12/S-15/S-16/S-4 row; `pdlc-rcv-baseline.md` §3, §3.1 |

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
