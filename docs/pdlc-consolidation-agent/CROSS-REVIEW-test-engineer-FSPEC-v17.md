# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 17
**Scope:** DELTA re-review. Diff reviewed: `76476315..HEAD` (the commit v16 recorded as
`REVIEWED-COMMIT`) — four commits touch the document, one of them the v11.6 authoring round and
three of them DOD anchor-sweep fixes. I did not re-read the document; I read the diff, re-derived
every citation the diff touches against HEAD source, and re-checked the two Lows v16 left open.

## Delta

The diff is nine hunks in three families. None of them changes a rule, an AC, a BR, an AT's
expected value, a fixture, or an oracle's strength — the header note says so and the diff bears it
out.

**Family 1 — the te L-01 repair (§13.5, AT-Q7).** AT-Q7's containment clause (1) now reads
"observed ⊆ that domain's permitted set **as recorded at the implementing layer** (§6.5's obliged ∪
permitted columns, ∪ every widening TSPEC has recorded against them under DEC-LAYER-01 — the same
bound AT-Q7c spells out)", plus the justifying tail "since no recorded widening is a merge or branch
verb". This is exactly what v15's L-01 asked for and v16 carried forward: the two adjacent rows now
state one bound in one form. The added tail is what keeps the row's falsification claim honest —
a widened bound would otherwise weaken "falsifies every merge verb" without saying why it does not.
Nothing in AT-Q7's obligation clause (2), its state clause (3), or its set-not-multiset rule moved.
**L-01 is resolved.** L-02 is explicitly accepted-as-recorded rather than repaired, which is the
disposition I asked for.

**Family 2 — the SKILL.md anchor sweep** (the three DOD commits). Five citations re-measured. All
five check out at HEAD:

| Citation after the diff | HEAD | Disposition |
|---|---|---|
| `consolidate-learnings/SKILL.md:56` — "was the `Date Completed` date boundary", now the §3.2 predicate | `:56` is step 1's "Find the boundary", scoping via the block/legacy predicate and citing the vocabularies doc §3 | **Correct**, and the "was" phrasing is the right form once the edit has landed |
| `:61` — domain-invariant destination | `:61` is the `DOMAIN-CONSTRAINTS.md` append bullet | **Correct** |
| `:62` — `DECISIONS-{topic}.md` route | `:62` carries the route *and* `{topic} = failure-mode-id` | **Correct** |
| `:59` — the pattern-vs-coincidence bar | `:59` is step 4, "recurs across ≥2 unrelated features, **or** a single occurrence stating a standing invariant" | **Correct**, and it is the literal §5.2 transcribes |
| `:64` — the log record fields | `:64` is step 6, "date, LEARNINGS files consumed, promoted, deferred" | **Correct** |
| `:75` — the four-column proposal table | `:75` is `\| Source LEARNINGS \| Target skill \| Proposed change \| Rationale \|` | **Correct** |
| `harvest-learnings/SKILL.md:70-79` (was `:70-78`) — the metadata table | `:70` is the `Field \| Detail` header, `:71` the separator, `:72-79` the eight rows ending `DoD rounds` — `Phases exercised` is `:78` | **Correct**; the widening by one line is precisely the row this feature adds |

**Family 3 — the two self-locators.** §4.3's release-ordering anchor `:557-558` → `:566-567` and
§15.3's change-register anchor `:2449` → `:2459`. Both re-derived: FSPEC `:566-567` is "it runs at
step 16 after the terminal row is appended", and `:2459` is the `nudge-consolidation.sh` row of the
§15.3 table. **Correct.**

**What the sweep did not reach.** The three DOD commits were titled as a *citer* sweep ("widen the
SKILL-anchor warranty to every citer", "sweep both SKILLs"), and they did sweep both SKILLs. They
did not sweep the other citer family in the same document — the eight citations of
`pdlc/hooks/scripts/nudge-consolidation.sh`, one of which sits inside AT-P7's cell, which this round
edited. That family is now stale against HEAD, because this feature's own implementation
(`b22834b7`) rewrote the hook. See M-01 and M-02.

## Findings

No High. The delta resolves L-01 cleanly and breaks nothing that sixteen prior rounds approved:
every expected value in every AT row is unchanged, and every citation the diff *writes* is right at
HEAD. Two Mediums are new-in-scope (AT-P7's cell was edited this round, and the diff range contains
the commits that declared a citer sweep); two Lows carry forward.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| M-01 | Medium | Local | **The `nudge-consolidation.sh` citer family was not swept, and is now stale at HEAD.** This feature's implementation rewrote the hook (`b22834b7`), so every line number the FSPEC gives for it is pre-edit. At HEAD: the corpus globs are `:60-61` (`CORPUS_GLOBS` tuple + comprehension), not `:28`; the `pending` binding is `:73-74`, not `:41`; the log read/`except: logtext = ""` is `:66-70`, not `:36-39`; the `THRESHOLD` comparison is `:81`, not `:43`; the print/exit is `:85-87`, not `:47-48`. Only `THRESHOLD = 5` at `:25` still holds. Affected: §3.1's corpus table (`:325`, `:330`), §3.2's legacy-region row (`:365`), §3.1's shipped-behaviour table (`:386`), §7's E-02 mirror (`:434`), §2.3's threshold row (`:1998`, still correct), §13.5 AT-P7 (`:2130`), §15.3 (`:2459`), §16 E-02 (`:2693`). No *expected value* is wrong — the predicate, the fail-open-on-unreadable behaviour, and the widened glob are all as specified, and AT-P7 pre-declares that "every line number here is a locator that will drift with the edit". This is why it is Medium and not High: a test author is pointed at wrong lines but not toward a wrong assertion. The repair is mechanical — re-measure the eight citations, and adopt the "was `X`, now `Y`" form the §15.3 SKILL row already uses. | §3.1 (`:386`), §13.5 AT-P7 (`:2130`), §15.3 (`:2459`) |
| M-02 | Medium | Local | **AT-P7 states a mechanism for its empty-corpus case that does not exist in the post-edit block.** The row says "the block early-exits at `if not learnings: sys.exit(0)` (`:29-30`), so on an empty-corpus case `pending` is unbound and the hook's set is read as empty rather than as an error", and it scopes itself explicitly — "'the shipped block' means the post-edit block". At HEAD the post-edit block has **no** `if not learnings` early exit at all (`grep` finds none); `pending` is unconditionally bound at `:73-74` and is simply `[]` on an empty corpus. The expected value the row asserts (empty set, no error) is still right, so no oracle is wrong — but the *reason* it gives is false against the code it names, and a reader repairing M-01's line numbers will go looking for a statement that has no referent. Two sub-points in the same cell: the row prescribes reading `pending` "out of the namespace the block was executed in", whereas the shipped block exposes it through a `PDLC_CONSOLIDATION_DEBUG=1` stderr emission (`:77-79`) that the parity test reads (`pdlc/workflows/__tests__/consolidationHookParity.test.js:160`, `:351`). The spec's *intent* — not stdout, not threshold-gated — is honoured by that channel (`:78` writes before the `:81` gate), so the test is sound; the spec's *literal* is not what shipped. Fold the channel description into the same re-measurement M-01 asks for. | §13.5 AT-P7 (`:2130`) |
| L-01 | Low | Local | **Carried from v16 L-02 (v15 L-02), unaddressed and non-blocking by explicit decision.** AT-Q7c's seven-member literal is pinned to TSPEC §9.3's current contents, so a fifth recorded widening restages the erratum that produced it. The v11.6 note now records this as accepted-not-repaired, which is the right disposition: the cell states the shape rule before the instantiation, so a reader finding the literal short knows which side governs. Recorded as a known drift point. | §13.5 AT-Q7c (`:2178`) |
| L-02 | Low | Local | **New, and the mirror image of the resolved L-01.** AT-Q7's containment clause now carries the DEC-LAYER-01 widening bound by reference ("∪ every widening TSPEC has recorded against them"), while AT-Q7c carries it by reference *and* instantiates the current literal. That asymmetry is now deliberate and correct — AT-Q7 ranges over three domains and instantiating all three would triple L-01's drift surface. Filed only so the next reviewer does not "fix" the asymmetry by instantiating AT-Q7 too. No change requested. | §13.5 AT-Q7 (`:2176`), AT-Q7c |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The §15.3 SKILL row adopted a "was `X`, now carries `Y`" form once the edit landed, while the §3.1 shipped-behaviour table keeps a "File:line at HEAD / Shipped behaviour" header that now means *pre-feature* HEAD. Is the intent that §3.1 stays frozen at the pre-feature baseline (in which case say so in the header, once) or that it tracks HEAD like §15.3 does? Either answer closes M-01; they imply different repairs, and picking one prevents a sixth sweep. |

## Positive Observations

- **The L-01 repair carried its own justification, not just its own words.** Copying AT-Q7c's
  "as recorded at the implementing layer" phrase into AT-Q7 would have aligned the two rows and
  quietly weakened AT-Q7's strongest sentence — "which alone falsifies every merge verb" is only
  true of the widened bound if no widening is a merge verb. The author added exactly that clause.
  That is the difference between making two rows match and keeping the oracle true.
- **L-02 was answered, not silently dropped.** The header note states the disposition — accepted as
  a recorded drift point, governed by the shape rule beside it — and gives the reason. A reviewer
  finding it in round 18 will not re-file it, which is what a carried Low is supposed to buy.
- **The SKILL sweep is boundary-exact where it matters most.** `harvest-learnings/SKILL.md:70-79`
  is the metadata table from its `Field | Detail` header through the final `DoD rounds` row, with
  the feature's own `Phases exercised` row at `:78` inside it. I checked both endpoints rather than
  a midpoint: `:69` is blank and `:80` is past the table.
- **The `:56` row states the negative as well as the positive.** "was the `Date Completed` date
  boundary, now carries the §3.2 predicate" tells a reader both what to expect and what to expect
  *not* to find — which is what stops the next re-measurement from landing on the nearby step-4 bar
  at `:59`, the same failure mode §8.4's repair guarded against in v16.
- **No expected value moved, and I checked rather than assumed.** AT-P7's set-equality oracle,
  AT-Q7's three-assertions-per-domain structure, AT-Q7c's both-sided bound, AT-P10's
  report-plus-set-size pairing and AT-Q8's reason-code distinctness are all byte-identical across
  the diff. The document's oracle strength is exactly what v16 approved.
- **Both Mediums are locator-class, and the tests they point at are green.** The parity test
  (`consolidationHookParity.test.js`) already implements AT-P7's substance — differential over a
  shared fixture table, `pending` observed off a pre-gate channel rather than threshold-gated
  stdout, set-equality on every case. The spec is behind its own implementation here; it is not
  wrong about behaviour.

## Recommendation

**Approved with minor changes**

The delta closes my one open request (v15/v16 L-01) with a repair that strengthens the row rather
than merely aligning it, re-measures six SKILL anchors and two self-locators that all verify exactly
at HEAD, and leaves every acceptance test, oracle and set-equality obligation in the document
untouched. Nothing sixteen rounds approved was broken.

The two Mediums are non-gating and mechanical: the `nudge-consolidation.sh` citer family is stale
against a hook this feature's own implementation rewrote (M-01), and AT-P7 explains its
empty-corpus case by an early exit the post-edit block does not contain (M-02). Neither makes a test
author write a wrong assertion — the affected test exists and passes — so neither blocks. Both are
worth folding into the next edit that touches §13.5 or §15.3, together with an answer to Q-01 so the
sweep does not have to run a sixth time.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 2, "low": 2}


APPROVAL-HASH: sha256:fcbe2e85f40fb77df54439985cd6497c95cb3d655bdb7828d6f7f3ddededbe25
REVIEWED-COMMIT: 48631bc661d04b3e810c7e49d4710c23723241cc
