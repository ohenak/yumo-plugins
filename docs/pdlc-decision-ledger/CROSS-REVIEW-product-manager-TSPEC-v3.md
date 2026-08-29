# Cross-Review: product-manager — TSPEC (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.3)
**Date:** 2026-08-28
**Iteration:** 3
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

Delta re-review protocol: prior findings verified first, then only the sections this revision changed
were scanned for new issues.

## Method

Diffed `f981ddfa4..HEAD` on the TSPEC (157 insertions, 25 deletions across §1, §3.6, §4.3, §7.3, §7.4,
§7.5, §7.6, §9, §9.1, §9.2). Every claim the revision makes about repository state was re-checked
against code rather than against the document's prose, and §3.6's corrected measurement was
re-executed independently at `8c673a09f` using `DECISION_HEADING_RE`, `DECISION_CORPUS_ARGV`'s globs
and §4.3's shipped line format:

| Claim (v0.3) | Independently measured | |
|---|---|---|
| project-level 41 lines / 6,305 bytes | 41 / 6,305 | ✓ |
| project-level lines 109–200, mean 153 | 109–200, mean 153 | ✓ |
| feature-level lines **152–261** | 152–261 | ✓ |
| means 183 / 191 / 206 (`advisory-wave-gate` / `engineering-loop` / `headless-engine`) | 183 / 191 / 206 | ✓ |
| ~495 bytes headroom; ~three project-level lines; spent at ~44 records | 8000−1200−6305 = 495; 495/153 = 3.2; 41+3 = 44 | ✓ |

**F-03's corrected figures reproduce exactly**, including the three per-directory means. The code
claims the revision newly rests on were checked at their sources, not taken on the document's word:
`bodyOf` slices a builder from its declaration line to the next top-level declaration
(`pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:117-125`), `ANCHOR_TOKENS` is the frozen
literal (`:114`), and the census set-equality assertion is `:139`/`:144` — so §7.3's restated
precedent is now an accurate description of the shipped test. §7.4's clause (b) likewise matches the
shipped guard: `EXPECTED_MERGE_BASE_SHA` is a hand-transcribed literal (`loopEconomicsBaselineGuard.test.js:130`),
compared with `.toBe` (`:246`), with `--is-ancestor` retained as the weaker second signal (`:249`).
`sourceExcludingParser` exists at `advisoryDisabled.test.js:717`.

**All five prior findings are resolved**, and F-01 and F-02 were resolved by the route I asked for
rather than by re-wording: F-01 by hedging §3.6 *and* pinning it (D-10), F-02 by stating AT-02's chain
from the rendered line, correcting §4.3's contrary sentence, and routing the FSPEC wording upstream
as ERR-3. F-04's and F-05's corrections check out against the code and against FSPEC AT-03's literal
text. Both open questions (Q-01, Q-02) are answered in place.

Nothing this revision touched broke a previously approved section. Two new issues, neither gating,
both inside sections this round added.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | D-10's third conjunct is vacuous on the input §7.3 specifies: over a project-level-only block at shipped defaults nothing is ever omitted, so `omitted[]` cannot detect the drop-loop re-ordering the section claims it catches | REQ-DECLEDGER-01, BR-12 |
| F-02 | Low | Local | A blank line between the D-9 and D-10 rows splits §9.1's decisions table, so D-10/D-11 render outside it | REQ-DECLEDGER-08 |

### F-01 (Medium) — the new pin's third conjunct cannot fail

The shipped-default assertion is the right answer to my last round's F-01, and its first two conjuncts
do exactly what I asked for: transcribing **6,305** turns the headroom into a tripwire that reddens at
the deliberate re-capture, and `≤ maxBytes − 1200` reddens if the bound is lowered underneath it. Both
are load-bearing. The third conjunct is not.

§7.3 specifies the input as *"the **project-level-only** block over the frozen fixture at C-5's shipped
defaults (`maxEntries: 70`, `maxBytes: 8000`)"*, then asserts *"`omitted[]` contains no id whose
`origin` is `"project"`"*, and justifies it: *"the `omitted[]` conjunct is what fails if a future change
re-orders the drop loop so a project-level line goes first."*

That justification is false, by the section's own arithmetic. On that input there are 41 lines against
`maxEntries: 70` and 6,305 bytes against a 6,800-byte allowance — **neither bound binds, so the drop
loop never runs and `omitted[]` is empty regardless of its order**. A mutation that reverses the drop
order passes this assertion untouched. It is an absence-only oracle with no positive assertion on the
same path, which is precisely the shape §7.5's new mutation table is otherwise so careful about.

This also weakens the answer §7.6 gives to TE Q-01. That note says the shipped defaults are otherwise
never exercised because AT-01 *"supplies non-binding bounds by construction"* — but the assertion
offered as the remedy is itself non-binding, so the shipped defaults still have no test in the regime
where they actually do something.

Both problems close with one change, and the corpus already contains the witness. Build the block over
the **full in-scope set for `pdlc-headless-engine`** — §3.6's own 63 lines / 10,859 bytes — at the same
shipped defaults. 10,859 exceeds the 6,800-byte allowance, so the byte bound binds and the loop must
drop; under §3.6's feature-level-first order it drops all 22 feature-level lines and stops, leaving
exactly 6,305. Then assert `omitted[]` **set-equal** to the 22 feature-level ids (transcribed from the
fixture, not derived from the renderer). That single assertion reddens on a re-ordered drop loop, on a
loop that stops early or late, and on corpus drift — and it is the first test anywhere in §7 to exercise
C-5's defaults with a bound that binds. Keep the project-level-only assertion for the 6,305 and
headroom conjuncts; it is the binding case that is missing, not the non-binding one.

If se-author prefers the smaller edit, the alternative is simply to delete the sentence claiming the
conjunct catches re-ordering and keep the conjunct as the cheap invariant it is — but then §7.6's
answer to TE Q-01 should stop presenting this assertion as the place the shipped configuration is
exercised.

### F-02 (Low) — D-10 and D-11 fall out of §9.1's table

Line 1231 is blank, sitting between the D-9 row and the new D-10 row. A markdown table ends at the
first blank line, so D-10 and D-11 are a headerless fragment rendering as literal pipe-delimited text
rather than as rows of the decisions table above them. Since §9.1 is the material DECISIONS is
harvested from — and D-10/D-11 are the two decisions this round exists to record — they should be
inside the table a reader and the harvest step will read. Delete the blank line.

## Questions

| ID | Question |
|----|---------|
| Q-01 | If F-01's binding-regime assertion is adopted, does the 22-id `omitted[]` literal want the same re-capture discipline as the 6,305 literal — i.e. is it transcribed into the guard so a fixture re-capture that changes the feature directory reddens it, or is it derived from the fixture at test time? The first is consistent with §7.3's stated rule; the second would be an implementation echo of the corpus. |

## Positive Observations

- **The two Mediums were resolved at their root, not at their wording.** F-01 asked for a hedge and a
  tripwire and got both, plus D-10 recording *why* the mechanism reading was wrong — the order
  prioritises the promoted corpus, it does not guarantee it. F-02 asked for AT-02's chain to be stated
  from the rendered line and got the chain in full, the contrary clause in §4.3 removed, and the reason
  named: reading `record.heading` would compare the recogniser against itself. The spec now argues my
  finding better than my finding did.
- **The corrected measurement reproduces to the byte, including the figures nobody asked for.** F-03
  only required the feature-level range; the revision supplies per-directory means and the project-level
  range as well, and all seven of the numbers I re-derived match. Publishing figures that a reviewer can
  re-execute is what let this round be short.
- **F-04's correction made the design's own argument sharper.** The restatement is not a retraction —
  it identifies declaration-anchored slicing as the precedent's actual instrument and then gives the
  real reason the earlier wording failed: "convergence", "dedupe" and "erratum-mint" are not single named
  declarations. I verified that against `loopEconomicsAnchorGuard.test.js` and it is accurate.
- **The `main()` slice got tighter under a question rather than looser.** TE's Q-03 could have been
  answered by excluding `main()` wholesale; instead the exclusion is narrowed to a sentinel-bounded run,
  with `main()` outside it left inside the census — a smaller hole than the one the question was asking
  about, with the non-empty-slice check already specified to stop it going vacuous.
- **§7.5's per-conjunct mutation table is exactly the right response to "does the generator discharge
  this?"** Four conjuncts, four named falsifying mutations, each applied and reverted with the observed
  red recorded — and the note about a drop loop stopping one line late still landing inside the
  generator's range is the honest reason the table is needed.
- **Both criteria this spec outran were routed, not reinterpreted.** ERR-3 and ERR-4 are raised at the
  FSPEC with the corrected wording proposed, and D-11 records the AT-03 divergence with its rejected
  alternative, so no later reader meets either divergence as an unexplained one. I confirmed both FSPEC
  criteria are still uncorrected upstream (`FSPEC-pdlc-decision-ledger.md:359-361`, `:364-367`) and have
  re-emitted both as errata so they land before PLAN authoring.
- **PM Q-02 got a real answer, not a deferral.** "No PLAN task turns on which way ERR-2 resolves,
  provided it resolves before those tasks are written" is the answer that lets PLAN proceed, and it says
  what would go wrong if the timing slipped.

## Recommendation

**Approved with minor changes**

Both Mediums from round 2 are resolved, all three Lows are resolved, and the numbers underlying the
whole of §3.6 reproduce independently at the commit the spec pins. No High finding is open, and nothing
this revision touched broke a section approved earlier. From the product lens the document is ready for
PLAN authoring.

F-01 is worth landing before PLAN writes the corpus-oracle task, because it changes what that task
builds: adding the binding-regime case is a cheaper edit now than discovering after implementation that
C-5's defaults were never exercised where they bind and that the drop order's regression test does not
exist. F-02 is a one-line deletion. Neither needs another review round — a v0.4 carrying both, plus the
two errata landing at the FSPEC, closes this phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
