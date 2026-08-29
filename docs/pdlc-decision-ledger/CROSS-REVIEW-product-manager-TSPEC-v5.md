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
3. **One test justification stops being true.** §7.4:1185–1188 explains that AT-01 supplies an
   explicitly non-binding `maxBytes` because the 45- and 48-line sets render to 7,042 and 7,650 bytes
   which "with §4.3's framing budget exceed the `maxBytes` default of 8,000", making the expected
   sets unproducible under default configuration. At 12,500 they no longer exceed it
   (`7,650 + 1,200 = 8,850`). AT-01's practice is still right — its subject is the recognition rule,
   not the bounds — but the stated reason is now false and needs rewriting rather than deleting
   (Q-02).

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

### F-03 (Medium) — both errata are answered; the TSPEC still routes them

§9.2 raises ERR-1 and ERR-2. REQ v1.8 resolves both, and in ERR-2's case adopts this document's own
recommended value. Leaving them stated as open sends PLAN authoring — the immediate next consumer of
§9.2 and §9.3 — an instruction that is no longer true.

- **ERR-1** asked REQ C-5 to retype `maxEntries`/`maxBytes` from "positive integer" to non-negative so
  that `maxEntries: 0` is a valid admits-nothing value per FSPEC E-7. REQ C-5 now types both
  **non-negative integer**. ERR-1 is satisfied exactly as asked; §4.1's implementation was already
  correct, so nothing in the design moves — the entry should be marked resolved and retired. §4.1:512–514's
  note that it "raises the type label upstream" and §9.2's cross-reference should follow.
- **ERR-2** asked REQ to re-decide the 8000 default on the supplied measurement. REQ C-5 now sets
  **12500**. ERR-2's text still reads "this is a product judgement … so it is routed rather than
  taken" and offers "this may equally be resolved by leaving C-5 alone". That option was not taken.
- **§9.3 T-2** closes itself by pointing at ERR-2 as the live destination for "the value of a
  REQ-owned default"; that pointer now resolves to a settled question.
- **§9.4 A-1** (§9.4:1360–1361) states: "**A-1** `maxEntries` 70 is measured against `M-6b`/`M-6c`,
  `maxBytes` 8000 is not measured". REQ §7 A-1 at HEAD now reads that both are re-derived — (70) and
  (12500). This sentence is a direct factual claim about the REQ's assumption set and it is now
  false. REQ §6 **R-5** also changed underneath it: the residual risk is no longer "the bound is an
  unmeasured analogy" but "**neither bound commits to a growth model** (`M-6d`, `M-7d`) — the corpus
  grows, and a default sized to today's floor is eventually outgrown". That restated risk is a better
  fit for §3.6's own observation about `docs/_decisions/` growing by exactly the mechanism this
  pipeline runs, and §3.6 could cite it directly.

I have rated this Medium rather than High deliberately. Once F-01 and F-02 land, the author must
touch §9.2 and §9.4 anyway, and none of this narrows, drops or reinterprets a requirement on its
own — it is bookkeeping that has become false. But it must land before PLAN, for the reason ERR-2
itself gave: "What ERR-2 must not do is resolve *after* those tasks are written." It has resolved
before them. That is the good case, and it should be recorded as such.

### F-04 (Medium) — the Baseline pin is one version behind

The TSPEC pins Baseline **v1.1** in its header (`:11`), at §3.5:376 ("v1.1's `Verified at`") and at
§7.3:917 ("a frozen fixture copy at Baseline v1.1's `Verified at` commit"). REQ v1.8's `depends-on`
table now pins **v1.2**, and C-5's new rationale is derived from `M-7b`/`M-7c` — ids that **do not
exist** in v1.1, which stopped at the `M-6` entry floors. A reader following the TSPEC's citation to
v1.1 cannot find the derivation the default now rests on.

The reassuring half, which I verified so the author does not have to re-measure: Baseline v1.2 is
purely additive — it adds the `M-7` rendered-index byte floors — and `Verified at` is **unchanged** at
`8c673a09f`. So the frozen fixture is the same fixture, and every literal §3.5/§3.6/§7.3 transcribes
still holds. This is a pin and citation correction, not a re-measurement. Worth adding while there:
`M-7d` states that substance bytes "exclude every per-line separator, prefix and newline … a consumer
sizes against `M-7b` and declares its own framing allowance on top", which is precisely what §4.3's
≤1,200-byte budget is. §3.6 reconciling its 10,859 rendered bytes against `M-7b`'s 9,296 substance
bytes explicitly would close the last gap between the two documents' arithmetic — the difference is
~24.8 bytes/record of framing, comfortably inside `M-7c`'s 50-byte allowance, so the two derivations
of 12,500 agree and the spec can say so.

### F-05 (Medium, Cross-Feature) — the Baseline's propagation path does not list this TSPEC

The Baseline's `Cited by` field (`docs/_constraints/pdlc-decision-corpus-baseline.md:6`) enumerates
the REQ and the FSPEC, and states its own purpose: "**This list is the propagation path for a
`Version` bump**, so a new citation is added here in the same edit that mints it."

The TSPEC is not on that list, despite citing the Baseline in its header, throughout §3.5/§3.6's
measurements, and in §7.3's frozen-fixture definition. That omission is the mechanical reason this
cascade happened the way it did: the v1.1 → v1.2 bump and the C-5 default change propagated to the
REQ and stopped, and the TSPEC — the document that consumes the Baseline's numbers most heavily — was
never on the path that would have carried it.

Tagged **Cross-Feature** rather than Local because the Baseline declares itself a "**Project-level
shared reference**. Read-only input to `pdlc-decision-ledger` **and its successors**". Every future
consumer inherits this gap, and the fix is durable: add the TSPEC to `Cited by` now, and add
PROPERTIES and PLAN in the same edits that mint their citations, as the field's own rule requires.
This belongs in `docs/_constraints/DOMAIN-CONSTRAINTS.md` at harvest as the general rule — *a
versioned shared reference's citation list is a maintained propagation path, and adding a citation
without adding yourself to it breaks the next cascade.*

## Questions

| ID | Question |
|----|---------|
| Q-01 | At 12,500 the omission order never runs for any reachable in-scope dispatch (F-02). Does §7.5's property — whose prefix conjunct is what makes the order falsifiable — still exercise the order across a binding range, or does it also need its bounds parameterised away from C-5's shipped defaults the way AT-01 already does at §7.4:1185–1188? I did not re-derive §7.5's generated-input ranges; flagging so se-author checks rather than assumes. |
| Q-02 | §7.4:1187 justifies AT-01 supplying a non-binding `maxBytes` because the 45/48-line sets render to 7,042 and 7,650 bytes and "with §4.3's framing budget exceed the `maxBytes` default of 8,000". At 12,500 both fit (`7,650 + 1,200 = 8,850 ≤ 12,500`), so the stated reason evaporates. The *practice* is still right — AT-01's subject is the recognition rule, not the bounds — but the justification needs rewriting rather than deleting. Keep the explicit non-binding override? |

## Positive Observations

<!-- positives -->

## Recommendation

<!-- recommendation -->

## Verdict

<!-- written last -->
