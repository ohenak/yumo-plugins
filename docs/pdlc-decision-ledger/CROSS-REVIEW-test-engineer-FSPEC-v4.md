# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.2)
**Upstream re-measurement:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` v1.8 (sha256:3eb52deb…)
**Previous round:** `CROSS-REVIEW-test-engineer-FSPEC-v3.md` (2 High, 1 Medium, 1 Low — Needs revision)
**Date:** 2026-08-28
**Iteration:** 4

## Scope of this round

Delta confirmation, not a re-review. v3 recorded two High findings against the FSPEC's recital of
REQ **v1.8**'s re-measured bounds; a targeted erratum has since landed in three commits
(`c75797636`, `577cf6860`, `f450e8de4`), taking the FSPEC to **v1.2**. I read the diff of those
three commits, then re-read the upstream text this spec leans on at its current version, and
answered one question: does the delta resolve the routed items without breaking anything approved
earlier, and is the document still a faithful compression of REQ HEAD?

Per DEC-ERR-03 the measure is upstream HEAD, not the routed-item list. So the sections the erratum
did *not* touch were re-measured against REQ v1.8 too, and one carried finding is restated below
because it is still live — not because it was routed.

## What the delta changed

Eighteen lines in, nine out, across four sites and nothing else:

| Site | Change |
|---|---|
| Header `:9`, `:11`, `:17` | Upstream pin REQ **v1.7 → v1.8**, Baseline pin **v1.1 → v1.2**, version row **1.1 → 1.2** |
| Header `:19`–`:26` | New v1.2 erratum note recording the scope of the edit |
| §1 `:52`, §6 `:340` | Baseline `Verified at` citations re-pinned to **v1.2** |
| §3.1 `:120` | `maxBytes` default recital **`8000` → `12500`** |
| §7 Assumptions `:553`–`:555` | A-1 restated: both defaults measured once at the Baseline's named commit and cited by id |

No behavioral flow, business rule, edge case or acceptance test text moved. That is the right blast
radius for this erratum — the cascade really was confined to recited constants and a provenance
claim, exactly as v3 scoped it.

## Routed items — confirmation

**F-01 (High) — resolved.** §3.1 `:120` now reads "Defaults are `enabled` `false`, `maxEntries`
`70`, `maxBytes` `12500` (REQ C-5)." REQ C-5 `:173` records `12500` as the measured value clearing
`M-7b`'s worst standing case, and names `8000` as the value that "sits *below* `M-7b`" and drops
lines on day one. The recital and its `(REQ C-5)` attribution now agree. I grepped the whole FSPEC
for `8000` / `8,000`: the only surviving occurrence is `:21`, inside the erratum note, describing
the value that was replaced. That is correct historical prose, not a live recital — the definition
site every downstream author reads is single-valued again.

**F-02 (High) — resolved.** §7 Assumptions `:553`–`:555` now reads "both defaults are measured once
against the Baseline's named commit and cited by id, not re-derived here — `maxEntries` (70) from
`M-6b`/`M-6c`, `maxBytes` (12500) from `M-7b`/`M-7c`". That is REQ A-1 at `:377`–`:379` in
substance and in id set. The retired `learningsInjection`-analogy claim is gone, so the
"carried from REQ §7 unchanged" preamble is true again — which was the more dangerous half of the
finding, since an operator auditing the vetoable assumptions stops at that sentence. I also checked
the R-5 half: the FSPEC recites no R-5 at all (grep for `R-5` hits only `BR-5`), so there is no
stale commit-growth recital left to re-aim. Nothing to fix there.

**F-04 (Low) — resolved in this document.** All three Baseline pins moved together: header `:11`,
§1 `:52`, §6 `:340` now name **v1.2**. §6's frozen-fixture instruction therefore points at Baseline
v1.2's `Verified at` commit (`8c673a09f`), which is the commit the fixture must actually be cut at.
The second half of F-04 — the Baseline's own `Cited by` propagation row omitting FSPEC §7
Assumptions — is unchanged and restated below, since §7 now cites four `M-*` ids and is still not on
the propagation list.

**F-03 (Medium) — not addressed, and still live.** Restated below; see the next section for why the
erratum note's reasoning does not close it.

## Upstream re-measurement (DEC-ERR-03)

I re-derived, against current upstream bytes rather than against the routed list:

**Baseline v1.2 resolves every id this spec cites.** `M-7b` (`baseline:110`) records the 9,296-byte
worst standing case over 63 records; `M-7c` (`:111`) records the 12,500 cap clearing it by 3,204
bytes at 50 bytes of framing per record. `M-6b`/`M-6c` (`:101`–`:102`) give 63 and 70. So both
halves of the restated A-1 are citations that land, at the version the header now pins.

**The AT-01 expected set survives the Baseline bump.** This was the one place a v1.1 → v1.2 move
could have silently invalidated a test. `M-1d` (`:57`) still enumerates **41** project-level ids;
the feature-level table (`:67`) still gives `pdlc-advisory-wave-gate` **4** and
`pdlc-engineering-loop` **7**. So AT-01's "45 and 48 lines" at `:353` still computes, and both are
still inside `maxEntries` `70`. The corpus ATs are unaffected, as v3 predicted.

**The retyping claim in the erratum note is accurate, for `maxEntries`.** REQ `:172` types
`maxEntries` non-negative and reads `0` as the "admits-nothing" value rather than a wrong-typed
fallback. FSPEC E-7 `:324` already treats `maxEntries` `0` as zero in-scope decisions — E-6's
outcome, not an error, not a fallback, not a halt — and AT-14 `:467`–`:472` pins it positively
against AT-04's committed baseline. That pairing is now right-typed upstream instead of in tension
with it, so the note's "needs no edit here" holds on the `maxEntries` side.

**It does not hold on the `maxBytes` side.** REQ `:173` retyped `maxBytes` non-negative in the same
row, which makes `0` a *valid operator value* rather than a wrong-typed one caught by §3.1's
fallback table. The FSPEC states no outcome for it. E-8 `:325` covers "a **single line by itself**
exceeds `maxBytes`", which composes to the right answer under `maxBytes` `0` — every line is
omitted whole, none remain, E-6 follows — but that is a derivation a reader has to perform, not a
stated outcome, and no AT pins it. The asymmetry is now visible in the document: `maxEntries` `0`
has an edge case *and* an acceptance test; `maxBytes` `0` has neither.

This is a testability gap, not a correctness one, which is why it stays Medium. It bites at
PROPERTIES: O-8 `:526` owes a property "parameterised over set size × line sizes × **both bounds**",
universally quantified over "**any** resolved bounds". A te-author generating `maxBytes` in
`[0, ∞)` will hit `0` on the first shrink and has no spec'd oracle to assert against — the property
will either be written to skip `0`, which silently narrows the invariant, or written to guess.

## What remains

Two findings, neither gating, both inherited — they sit in bytes this erratum did not touch, and
both were already on the record in v3. Nothing the delta introduced is defective, and nothing
previously approved broke.

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Medium | inherited | nonlocal | `maxBytes` `0` is a valid operator value under REQ v1.8's non-negative retyping, and no edge case or AT states its outcome, while `maxEntries` `0` has both (E-7 + AT-14). Derivable from E-8 + BR-13 → E-6, but not stated. O-8's property is quantified over **any** resolved bounds, so PROPERTIES inherits an unspecified oracle at the boundary. Fix is one row: an E-* naming `maxBytes` `0` as E-6's outcome, or one clause in E-8 | §5 Size edges `:322`–`:325`; §7 O-8 `:526`; REQ C-5 `:173` |
| F-02 | Low | inherited | nonlocal | The Baseline's `Cited by` propagation row (`baseline:6`) lists this FSPEC's citing sites as "header, §1, §3.3, §4 …, §5 …, §6 AT-01, §7 O-5" — it does not list **§7 Assumptions**, which after this edit cites `M-6b`/`M-6c`/`M-7b`/`M-7c` by id. That row is the mechanism by which a Baseline `Version` bump is routed to its consumers, so the site that went stale in the round just closed is the one site the router cannot see. Add `§7 Assumptions` to `baseline:6` | §7 Assumptions `:553`; `baseline:6` |

F-02 is filed Low because no test depends on it and the pins are correct today. I am flagging it a
second time only because it is the *same mechanism* that produced the v3 Highs: the propagation row
missed §7, so the v1.1 → v1.2 bump did not route there, so §7's provenance claim went stale
unnoticed. Closing the row closes the loop rather than the instance. Scope on it is
`Cross-Feature` in the ordinary legend — it is a constraint about how Baseline-style pinned
reference documents propagate, not about this feature.

## Positive Observations

- **The erratum note is a model of blast-radius disclosure.** `:19`–`:26` states what moved upstream,
  what cascades, what does *not* and why, and closes with "Nothing else moves." I was able to
  falsify its scope claim mechanically (grep for `8000`, `v1.7`, `R-5`) in under a minute, which is
  exactly what a delta-confirmation round should cost.
- **The v3 Q-01 mis-scoping was silently corrected.** REQ's own erratum note had pointed at §3.3,
  which carries no bound literal; the author walked the real anchors (§3.1 and §7) instead of the
  cited one. That is the harder and correct behavior.
- **All three Baseline pins moved in one edit.** §1, §6 and the header agree, so §6's frozen-fixture
  instruction cannot cut a fixture at a different commit than §1 assumes — the failure mode that
  would have produced an unreproducible corpus AT.
- **The A-1 restatement is quotable against upstream.** It carries the id set rather than
  re-deriving the numbers, which is what makes it stay true across the next Baseline bump.

## Recommendation

**Approved with minor changes**

The delta resolves F-01, F-02 and F-04 from v3, and re-measurement against REQ v1.8 and Baseline
v1.2 finds nothing previously approved broken — the AT-01 expected set, the corpus fixtures and the
E-6/E-7/AT-14 cluster all still hold. No open High. The two remaining findings are inherited and
non-gating; F-01 (Medium) is worth landing before PROPERTIES authoring, since O-8's property
inherits the unspecified `maxBytes` `0` boundary.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Medium | inherited | nonlocal | `maxBytes` `0` valid under REQ v1.8 non-negative retyping; no edge case or AT states its outcome, unlike `maxEntries` `0` (E-7 + AT-14). O-8's property is quantified over any resolved bounds and inherits an unspecified oracle | §5 Size edges `:322`–`:325`; §7 O-8 `:526` |
| F-02 | Low | inherited | nonlocal | Baseline `Cited by` propagation row omits FSPEC §7 Assumptions, which cites four `M-*` ids — the bump-routing mechanism cannot see the site that went stale this round | §7 Assumptions `:553`; `baseline:6` |

FINDING: Medium | inherited | nonlocal | §5 Size edges / §7 O-8 | `maxBytes` `0` is a valid operator value under REQ v1.8's non-negative retyping but no edge case or AT states its outcome, while `maxEntries` `0` has both E-7 and AT-14; O-8's bounds property is quantified over any resolved bounds and so inherits an unspecified oracle at the boundary
FINDING: Low | inherited | nonlocal | §7 Assumptions / baseline:6 | The Baseline's `Cited by` propagation row does not list FSPEC §7 Assumptions, which now cites `M-6b`/`M-6c`/`M-7b`/`M-7c` by id, so a future Baseline `Version` bump will again fail to route to the site that went stale this round

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
