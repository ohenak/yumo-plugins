# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (own bytes unchanged since v4 approval)
**Upstream changed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.7 → v1.8, sha256:3eb52debcd13aa37913322e7855628a9b237af278581e6773f48ceb1cfd72cba)
**Date:** 2026-08-28
**Iteration:** 5 (upstream-cascade confirmation, not a re-review)

## Scope of this confirmation

I approved TSPEC at v4 ("Approved with minor changes", 0 High / 1 Medium / 1 Low) against
`UPSTREAM-STATE: REQ sha256:c18b7e88…`. That REQ no longer exists: an erratum round moved it to
v1.8. TSPEC's own bytes have not changed. The single question here is whether TSPEC is still a
faithful compression of the REQ **as it now stands** — not whether the routed items landed.

They did land. That is necessary and not sufficient, and in this case it is the reason the answer is
no: the two errata TSPEC itself raised (§9.2, ERR-1 and ERR-2) were both **accepted upstream**, and
ERR-2 was accepted with the value TSPEC recommended — `maxBytes` **12500**. TSPEC anticipated the
number in one paragraph (§3.6:472–474) while the rest of the document — its type comments, its
config example, its shipped-default oracle, its headroom argument, its AT-01 rationale and its
assumption recital — is still written at **8000**. A spec that recommends a change upstream inherits
the duty to be correct once the change is taken; nine sites now cite a REQ that says something
else.

I re-read only: my v4 cross-review, the REQ diff `bdd9e1d1..b5fd4dd3`, Baseline v1.2's new §8
(`M-7a`–`M-7e`), and the TSPEC sections that lean on C-5/A-1/R-5 — §3.6, §4.1, §5.3, §7.3, §7.5's
AT-01 note, §9.2, §9.3 T-2, §9.4. I did not re-litigate anything else.

## Upstream delta

Four commits (`efbf3dad9`, `4e197abe5`, `0756cefed`, `273d0ce00`), +19 −11 lines in the REQ, plus
Baseline v1.1 → **v1.2**. Three substantive movements:

| # | REQ change | TSPEC's exposure |
|---|---|---|
| 1 | C-5 retypes both thresholds `positive integer` → **`non-negative integer`**, stating `0` is a valid admits-nothing value | TSPEC §4.1 already **implements** non-negative — correct — but §4.1:512–514 and §9.2 ERR-1 still describe it as a *divergence from* the REQ that is *raised upstream*. The divergence is gone |
| 2 | C-5's `maxBytes` default `8000` → **`12500`**, derived from Baseline v1.2's new `M-7b` (9,296 substance bytes over the 63-record worst standing case) and `M-7c` (12,500 clears it by 3,204 ≈ 50 bytes/record of framing) | Load-bearing. §3.6's binding argument, §7.3's D-10 assertion prose, §7.5's AT-01 note, §4.1's type comment and §5.3's config example all compute from 8000 |
| 3 | R-5 and A-1 **retire the unmeasured-analogy claim**: A-1 now reads "Both defaults derive from measurements … `maxBytes` (12500) from `M-7b`/`M-7c`"; R-5 is re-aimed at the *growth model* (`M-6d`, `M-7d`) rather than at measurement | TSPEC §9.4 recites the retired sentence verbatim as "carried from FSPEC §7 **unchanged**", and TSPEC carries R-5's new growth risk nowhere |

The REQ's own erratum note scopes the cascade: *"FSPEC §3.3's recital of the default cascades;
nothing else moves."* That is true of the FSPEC. It is not true of the TSPEC, which is where the
default is turned into arithmetic and then into oracles — and arithmetic does not cascade by
citation, it has to be re-executed.

## Arithmetic re-executed at the new default

Every figure below is recomputed from TSPEC's own measured quantities (§3.6, §4.3's ≤1,200-byte
framing pin) with `maxBytes = 12500` substituted for `8000`. Nothing else changed.

| Quantity | TSPEC says (at 8000) | At C-5's default as it now stands (12500) |
|---|---|---|
| Line allowance `maxBytes − 1200` | 6,800 | **11,300** |
| Headroom above the 41-line project-level set (6,305) | ~495 bytes ≈ three feature lines at mean 183 | **4,995** bytes ≈ **27** feature lines at mean 183, 19 at the largest observed 261 |
| Worst standing case, `M-6b`'s 63-line set (10,859 index + 1,200 framing = 12,059) | exceeds the bound; lines dropped | **fits, with 441 bytes spare** — nothing is dropped |
| AT-01's two dispatches (7,042 and 7,650 index bytes + 1,200) | 8,242 / 8,850 both **exceed** 8,000 ⇒ expected sets unproducible under defaults | 8,242 / 8,850 both **fit** under 12,500 ⇒ the stated reason for the override is falsified |
| §7.3's 141-record whole-fixture build | byte bound binds | still binds, and `maxEntries` 70 binds first at 141 records — **the D-10 oracle itself survives** |

The consequence that matters most is the third row, and it is a reversal, not a drift. §3.6:433 is
headed **"the order is live under shipped defaults, and this section no longer claims otherwise"** —
a heading written to retire an earlier draft's inertness claim that a previous round had already
found and killed. At 12,500 the inertness claim is **true again**: at the Baseline's `Verified at`
commit, no real dispatch — not even the largest, `M-6b`'s 63-record worst standing case — reaches
the bound. The drop loop runs on no production input. The section now asserts the opposite of HEAD,
in a section whose whole purpose is to have stopped asserting the opposite of HEAD.

That is a testing finding, not a prose one, because §3.6's paragraph is what D-10 cites as its
justification (§9.1's D-10 row reproduces "~495 bytes of headroom — about three more promoted
decisions") and what §7.3's shipped-default assertion is built to pin. The pin can survive; its
stated warrant cannot.

One further consequence has to be written down before the next revision, because it would otherwise
be applied as stale advice from my own last round. **My v4 F-01 must be withdrawn, not carried.**
That Medium asked for §7.3's D-10 input to be rebuilt over the largest *reachable* in-scope set —
project-level ∪ `pdlc-headless-engine`, `M-6b`'s 63 lines / 10,859 bytes — instead of the 141-record
super-set, on the grounds that the byte bound binds there too. At 8,000 that was right (10,859 >
6,800). At 12,500 it is **wrong**: 10,859 ≤ 11,300 and 63 ≤ 70, so that build omits nothing,
`omitted[]` is empty under every drop order, and conjunct (3) becomes exactly the vacuous
empty-by-construction assertion D-10's rejected alternative exists to prevent. The 141-record
whole-fixture build is now the *only* build of the three considered across rounds 3–5 that keeps
conjunct (3) falsifiable, and its "which is what a real dispatch gathers" clause — the sentence my
v4 F-01 asked to strike — is the part that should go, on its own, without the input changing.

## Positive Observations

- **The erratum channel worked exactly as designed, in both directions.** TSPEC declined to edit a
  REQ-owned default, measured it instead, and routed the measurement with the numbers attached
  (§9.2 ERR-2). The REQ took the measurement, promoted it into Baseline v1.2 as `M-7b`/`M-7c` so the
  figure is cited by id rather than restated, and adopted the recommended value. Neither document
  invented a number the other owned. The residue this confirmation reports is the cost of that being
  a two-step process, not a defect in it.
- **ERR-1 resolved in FSPEC's favour, which is the outcome the tests needed.** `nonNegativeInt`
  accepting `0` is now upstream doctrine rather than a documented divergence, so §7's F-13 case
  (`maxEntries: 0` ⇒ block is `""`, not an error, not a fallback) is now testing the REQ instead of
  testing against it. That is a strictly better position for the property in §7.5, whose bounds
  "spanning `0`" clause no longer has to justify itself.
- **D-10's oracle survives the default change untouched.** Its input is the 141-record fixture and
  its conjuncts are set-equality on 41 ids, a transcribed 6,305, and a non-empty origin-partitioned
  `omitted[]`. At 12,500 `maxEntries: 70` still binds at 141 records and `6,305 ≤ 11,300` still
  holds, so all three conjuncts still hold and conjunct (3) is still falsifiable under a reversed
  drop order. The assertion was built on quantities that do not move; only the prose explaining it
  was built on one that did. That is the right way round, and it is why this confirmation is a
  revision rather than a redesign.
- **The framing pin (D-9, §4.3) is what makes this confirmation cheap.** Because ≤1,200 is pinned by
  a unit test rather than assumed, every row of the table above is one subtraction. An unpinned
  framing size would have made "does 12,500 still bind?" unanswerable without running the renderer.

## Recommendation

**Needs revision.**

Three High findings, all `delta` — the erratum introduced them by moving the value TSPEC computes
from. None is a design defect: the mechanism, the seams, the oracles and the property are all
correct at either value, exactly as §3.6:474 promised ("the bound is a parameter, the order is the
mechanism, and both are correct at either value"). What is wrong is that nine sites still state the
old parameter, and one argument reverses its truth value at the new one.

The revision is bounded and mechanical, and I would expect it in one erratum round:

1. **Substitute the default** at §4.1:496, §5.3:760 and §7.3:942 — `8000` → `12500`. §5.3 is the
   urgent one: its test asserts `decisionLedger`'s key→value map by **set equality** against a
   hand-transcribed literal of "C-5's declared defaults verbatim", so shipping this spec as written
   pins 8000 into `.claude/pdlc.config.example.json` and into the assertion, and the example file
   then disagrees with the REQ with every test green.
2. **Re-derive §3.6's second argument.** The heading "the order is live under shipped defaults" is
   false at 12,500 and must be replaced by what is now true: at the Baseline commit the bound is
   **not** reached by any real dispatch (12,059 ≤ 12,500, 441 bytes spare), the order is live only
   under growth or under an operator-lowered bound, and that is precisely REQ R-5's new growth-model
   risk. Do not restore the retired "inert, therefore safe" framing — state the measured slack and
   the id (`M-7c`) it comes from, and let D-10's pin carry the falsifiability as it already does.
3. **Fix the derived figures that fall out of (2):** §3.6:435's `8000 − 1200 = 6,800`, the two
   "~495 bytes / about three feature lines" statements (§3.6:435–437, §3.6:441–443), §7.3:958's
   "6,800-byte allowance", §7.3:964's "roughly two", and §9.1's D-10 row, which reproduces the
   ~495 figure inside the rationale column.
4. **Keep AT-01's non-binding override, replace its reason.** §7.5:1187's justification — the 45/48
   sets "exceed the `maxBytes` default of 8,000" — is now false (8,242 and 8,850 both fit under
   12,500). The override should stay, because AT-01's subject is the recognition rule and it should
   not go red when an operator moves a bound, but it must be justified as **insulation from the
   bounds** rather than as unproducibility. Left as-is, an implementer who re-checks the arithmetic
   deletes the override, and AT-01 silently starts depending on C-5's default.
5. **Close ERR-1 and ERR-2 in §9.2** and drop §4.1:512–514's "diverges from REQ C-5's 'positive
   integer' type label" — there is no divergence at HEAD. §9.3's T-2 closing note and §9.4's A-1
   recital ("`maxBytes` 8000 is not measured", carried "unchanged") need the same one-clause
   correction; A-1 at HEAD says both defaults are measured, and R-5's growth caveat should be picked
   up where (2) lands.

Nothing in §2, §4.2, §4.3, §5.1–§5.2, §6, §7.4, §7.5's property or §8 is touched by this, and I did
not re-open any of it.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | `maxBytes` default `8000` still stated at three sites; REQ C-5 at HEAD ships `12500`. §5.3's config-example test asserts set equality against a hand transcription of "C-5's declared defaults verbatim", so the wrong value is pinned into `.claude/pdlc.config.example.json` and into the oracle, green | §4.1:496, §5.3:760, §7.3:942 |
| F-02 | High | delta | local | §3.6's "the order is live under shipped defaults" is false at 12,500: the worst standing case (`M-6b`'s 63 records, 10,859 + 1,200 = 12,059) fits with 441 bytes spare, so the drop loop runs on no real dispatch at the Baseline commit. The section asserts the opposite of HEAD, and §9.1's D-10 row reproduces its ~495-byte headroom figure as D-10's warrant | §3.6:433–452, §9.1 D-10 row |
| F-03 | High | delta | nonlocal | §9.4 recites A-1 "carried from FSPEC §7 **unchanged**" as "`maxBytes` 8000 is not measured"; REQ A-1 at HEAD says both defaults derive from measurements cited by id (`M-7b`/`M-7c`), and REQ R-5 is re-aimed at the growth model (`M-6d`/`M-7d`), which TSPEC carries nowhere. A citation of upstream that upstream no longer says | §9.4:1360–1362 |
| F-04 | Medium | delta | local | Derived figures computed from 8,000 are stale wherever they appear: `8000 − 1200 = 6,800`, "~495 bytes ≈ three feature lines", §7.3:958's "6,800-byte allowance", §7.3:964's "roughly two". At 12,500 the allowance is 11,300 and the project-level headroom 4,995 (~27 lines at mean 183) | §3.6:435–443, §7.3:958, §7.3:964 |
| F-05 | Medium | delta | local | AT-01's non-binding-bounds override is justified by an arithmetic that no longer holds — the 45/48-line sets render 8,242 and 8,850 bytes with framing, both under 12,500, so they are **not** unproducible at the default. Keep the override, re-justify it as insulation from the bounds; left as-is an implementer deletes it and AT-01 starts depending on C-5's default | §7.5:1185–1191 |
| F-06 | Medium | delta | local | ERR-1 and ERR-2 are both decided upstream but §9.2 still presents them as raised and unresolved ("routed rather than taken", "may equally be resolved by leaving C-5 alone"), and §4.1:512–514 still describes a divergence from C-5's "positive integer" label that no longer exists. §9.3's T-2 note carries the same open framing | §9.2:1293–1322, §4.1:512–514, §9.3 T-2 |
| F-07 | Low | delta | local | My v4 F-01 (rebuild D-10's input over the reachable 63-record set) is **withdrawn**, not carried: at 12,500 that set omits nothing (10,859 ≤ 11,300, 63 ≤ 70) and conjunct (3) goes vacuous. Keep the 141-record whole-fixture build; strike only the "which is what a real dispatch gathers" clause, which is the §3.1 contradiction | §7.3:940–941 |

FINDING: High | delta | local | `maxBytes` default 8000 at §4.1:496, §5.3:760, §7.3:942 diverges from REQ C-5's shipped 12500; §5.3's set-equality transcription pins the wrong value green
FINDING: High | delta | local | §3.6:433–452's "order is live under shipped defaults" is false at 12500 — the 63-record worst standing case fits with 441 bytes spare; §9.1's D-10 row reproduces the stale ~495-byte warrant
FINDING: High | delta | nonlocal | §9.4:1360–1362 recites REQ A-1 as "`maxBytes` 8000 is not measured" and carries R-5's retired analogy claim; REQ A-1/R-5 at HEAD say both defaults are measured and re-aim the risk at growth
FINDING: Medium | delta | local | Derived figures at §3.6:435–443, §7.3:958, §7.3:964 recompute from 8000 (6,800 allowance, ~495 headroom, "roughly two" lines); at 12500 they are 11,300 and 4,995 (~27 lines)
FINDING: Medium | delta | local | §7.5:1185–1191's justification for AT-01's non-binding bounds is falsified (8,242 / 8,850 both fit under 12500); keep the override, re-justify it as insulation from the bounds
FINDING: Medium | delta | local | §9.2:1293–1322 still presents ERR-1 and ERR-2 as open, and §4.1:512–514 still claims a divergence from C-5's "positive integer" label that no longer exists at HEAD
FINDING: Low | delta | local | v4's F-01 substitution is withdrawn — the 63-record build omits nothing at 12500, making D-10's conjunct (3) vacuous; keep the 141-record build and strike only §7.3:940–941's "real dispatch gathers" clause

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 3, "low": 1}
