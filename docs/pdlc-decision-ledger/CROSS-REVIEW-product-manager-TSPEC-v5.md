# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.5, bytes unchanged)
**Upstream re-read:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.8, sha256:3eb52deb…)
**Date:** 2026-08-28
**Iteration:** 5 (upstream-cascade confirmation, not a full re-review)

## Overview

**The one question.** My v4 approval of this TSPEC was recorded against REQ
`sha256:c18b7e88…` (commit `6fd604320`). Three erratum commits have landed since
(`4e197abe5`, `0756cefed`, `273d0ce00`), producing REQ v1.8 at `sha256:3eb52deb…`. The TSPEC's own
bytes have not moved. Does it still hold against the REQ as it now stands?

**Method.** Re-read `CROSS-REVIEW-product-manager-TSPEC-v4.md`, ran
`git diff 6fd604320..HEAD -- REQ-pdlc-decision-ledger.md` (19 insertions, 11 deletions), then went
back into the TSPEC text that leans on the changed upstream clauses rather than working from the
erratum's own item list (DEC-ERR-03).

**What the erratum actually changed.** Three things, all in REQ §4 C-5 and its downstream recitals:

| REQ change | Was (v1.7) | Now (v1.8) |
|---|---|---|
| `decisionLedger.maxBytes` default | `8000`, typed *positive integer*, recorded as an unmeasured `learningsInjection` analogy | **`12500`**, typed **non-negative integer**, derived from Baseline **v1.2**'s `M-7b`/`M-7c` |
| `decisionLedger.maxEntries` type | *positive integer* | **non-negative integer** (`0` is a valid admits-nothing value, not a fallback to `70`) |
| §6 R-5 / §7 A-1 | "`maxBytes` is an author analogy, not measured" | both bounds re-derived; residual risk restated as *no growth model* (`M-6d`, `M-7d`) |
| Baseline dependency | v1.1 | **v1.2** |

**Why this is not a formality.** Both of the errata this TSPEC raised in §9.2 have now been answered
upstream — and ERR-2 was answered by adopting **this document's own recommendation of 12,500**. That
is the good outcome. But it means the TSPEC is now the stale party: it still ships `8000` as the
normative default in three places, and §3.6's central argument is built on the arithmetic that `8000`
produces. §3.6 is the section rounds 2–3 rewrote specifically to establish that the omission order is
**live on day one**. At `12500` it is not, and REQ C-5's new rationale says so in as many words:
8,000 "sits *below* `M-7b` — drops lines on day one", which is precisely the regime the REQ has now
chosen to leave.

I verified every figure below against the Baseline at HEAD. One reassurance worth stating up front,
because it bounds the repair: Baseline v1.2 did **not** move `Verified at` (`8c673a09f`, unchanged
from v1.1) and is purely additive — it adds the `M-7` rendered-index byte floors. So no measurement
in §3.5/§3.6 is invalidated, the frozen fixture is untouched, and §7.3's transcribed literals (the 41
ids, `6,305`, `22 lines / 4,553 bytes`, `10,859`) all still stand. What has to change is a literal, a
paragraph of arithmetic that depends on it, and some bookkeeping — not the design.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor |
|----|----------|-----------|----------|----------------|
| F-01 | High | delta | local | §4.1:496, §5:760, §7.3:942 — TSPEC ships `maxBytes` default `8000`; approved REQ C-5 now mandates `12500` |
| F-02 | High | delta | local | §3.6:433–456 — "the order is live under shipped defaults" and the day-one partial-omission bullet are false at `12500` |
| F-03 | Medium | delta | local | §9.2 ERR-1/ERR-2, §9.3 T-2, §9.4 A-1 — both errata resolved upstream; §9.4 restates a retired REQ assumption |
| F-04 | Medium | delta | local | Header:11, §3.5:376, §7.3:917 — Baseline pinned at v1.1; REQ v1.8 depends on v1.2 |
| F-05 | Medium | inherited | nonlocal | `docs/_constraints/pdlc-decision-corpus-baseline.md`:6 — "Cited by" propagation path omits the TSPEC |

FINDING: High | delta | local | §4.1:496, §5:760, §7.3:942 — TSPEC ships `maxBytes` default 8000 where approved REQ C-5 mandates 12500 (Scope: Local)
FINDING: High | delta | local | §3.6:433–456 — day-one omission argument is false at maxBytes 12500 (Scope: Local)
FINDING: Medium | delta | local | §9.2 ERR-1/ERR-2, §9.3 T-2, §9.4 A-1 — errata resolved upstream but still stated as open (Scope: Local)
FINDING: Medium | delta | local | Header:11, §3.5:376, §7.3:917 — Baseline pin stale at v1.1, REQ now depends on v1.2 (Scope: Local)
FINDING: Medium | inherited | nonlocal | Baseline:6 — Cited-by propagation path omits the TSPEC, which is how this cascade was missed (Scope: Cross-Feature)

### F-01 (High) — the shipped default contradicts approved REQ C-5

REQ C-5 at HEAD sets `decisionLedger.maxBytes` to **`12500`**, typed non-negative integer, with the
rationale "Measured, not analogised: Baseline's `M-7c` records 12,500 clears `M-7b`'s worst standing
case (9,296 substance bytes over 63 records) by 3,204 — 50 bytes/record framing allowance. 8,000 sits
*below* `M-7b` — drops lines on day one."

The TSPEC still carries `8000` in three places that are normative rather than narrative:

- **§4.1:496** — `readonly maxBytes: number;  // non-negative integer, default 8000`. This is the
  interface an implementer types `DECISION_LEDGER_DEFAULTS` from. (Note the *type* comment here is
  already right — §4.1 implemented non-negative ahead of the REQ, which is why ERR-1 existed.)
- **§5:760** — the engine disclosure literal
  `"decisionLedger": { "enabled": false, "maxEntries": 70, "maxBytes": 8000 }`, which §7.3's source
  census checks against `.claude/pdlc.config.example.json`. Shipping this unchanged means the
  example config an operator reads disagrees with the REQ.
- **§7.3:942** — the corpus oracle builds "at **C-5's shipped defaults** (`maxEntries: 70`,
  `maxBytes: 8000`)". The phrase *C-5's shipped defaults* is a reference to the REQ, so the literal
  beside it is now simply a misquotation of C-5.

ERR-2's own closing paragraph anticipated exactly this and priced the fix: "If the default moves, the
change is one literal in C-5's row and the same literal in the config parser's default, both inside
tasks the PLAN already owes; the only test that reads the value is §7.3's shipped-default assertion,
whose threshold follows the resolved default while its transcribed 6,305 does not move." That
estimate holds and I have re-verified the last clause — see F-02's second half for why §7.3's three
conjuncts survive the move. The required change is to replace `8000` with `12500` at those three
sites. The reason this is High rather than Medium is not the size of the edit: it is that a spec
which cites "C-5's shipped defaults" and then states a different number will be implemented as
written, and REQ-DECLEDGER-07's product promise about what a reviewer receives is decided by that
literal.

### F-02 (High) — §3.6's day-one argument inverts at the new default

This is the finding the item list would not have surfaced, and it matters more than F-01.

§3.6's second load-bearing paragraph is titled "**the order is live under shipped defaults, and this
section no longer claims otherwise**". Its arithmetic is explicit at §3.6:434–436: with §4.3's
≤1,200-byte framing charged, `8000 − 1200 = 6,800` bytes for lines; project-level alone (6,305) fits
"with ~495 bytes of headroom — about **three** feature-level lines at the measured mean". It then
draws the day-one conclusion at §3.6:443–447:

> - **at the Baseline's `Verified at` commit**, every reviewer receives the whole project-level
>   corpus on every feature, with ~495 bytes of headroom …
> - feature-level lines are admitted until the bound, and the larger feature directories are
>   **partially omitted from the first enabled dispatch**.

Re-run at `12500`: the allowance for lines becomes `12500 − 1200 = 11,300`. The worst standing
in-scope set this document measures — `M-6b`'s 63 records, 41 project-level plus
`pdlc-headless-engine`'s 22 — is **10,859** index bytes. `10,859 ≤ 11,300`. **Nothing is omitted, for
any feature, on day one.** The second bullet is now false, and the paragraph's headline claim that the
order is live under shipped defaults is false for every reachable dispatch.

This is not an accident of the new number; it is the *purpose* of it. REQ C-5 chose 12,500
specifically to clear `M-7b` with headroom, and Baseline `M-7c` says 8,000 "drops lines against the
standing corpus on day one" as a criticism. The REQ has deliberately moved the feature out of the
regime §3.6 describes.

Two consequences the revision must handle, and they pull in opposite directions, which is why I am
flagging rather than prescribing:

1. **§3.6's rationale for feature-level-first ordering loses its day-one witness.** The order is
   still correct and still load-bearing — it is what protects the promoted corpus once the corpus
   grows past the bound — but it is now a *future* guarantee rather than a first-dispatch behaviour.
   §3.6 should say that plainly instead of asserting a live regime that no longer exists. The
   honest restatement is available and is stronger than what the section says today: at 12,500 the
   product intent of REQ-DECLEDGER-01 (one line per in-scope decision) is **fully met on day one for
   every feature**, which is what ERR-2 asked for and got.
2. **The derived quantities move with it.** §3.6:456's "at ~44 promoted records the headroom is
   spent under C-5's current default" becomes roughly **~73** (headroom `11,300 − 6,305 = 4,995`, at
   the measured project-level mean of 153 bytes/line ≈ 32 further records). §3.6:435–436's "~495
   bytes / about three feature-level lines" becomes ~4,995 bytes / ~26 feature lines at the 152–261
   measured range. §7.3:963–964's note "Under the shipped bound roughly two do" moves with it, and
   §4.3's §7.3:630 remark that the 1,200-byte framing pin "is not free: §3.6's ~495 bytes of headroom
   shrink one-for-one with any raise" keeps its direction but loses most of its force — the pin is
   still right, the pressure behind it is now an order of magnitude lower.

**What survives, and I checked this deliberately because it bounds the repair.** §7.3's corpus oracle
is built over the **whole 141-record fixture**, not the in-scope set, and all three conjuncts hold at
12,500: 141 records against `maxEntries` 70 leaves `omitted[]` non-empty by the entries bound alone;
the byte bound still binds hard (141 rendered lines run ≈25,300 bytes against an 11,300 allowance);
`6,305 ≤ 12500 − 1200` still holds for conjunct (2); and with ~100 feature-level lines available to
drop against ~71 needing to go, conjunct (3)'s "every omitted id has `origin === "feature"`" still
holds and still reddens under a reversed drop order. **D-10's design is untouched and its rejection of
the project-level-only slice still stands** — at 11,300 that slice is even more vacuous than at 6,800.
So the fix here is prose and derived figures, not a re-architecture, and my v4 F-01 (which asked for a
one-clause correction in the same paragraph) can be closed in the same edit.

## Questions

<!-- questions -->

## Positive Observations

<!-- positives -->

## Recommendation

<!-- recommendation -->

## Verdict

<!-- written last -->
