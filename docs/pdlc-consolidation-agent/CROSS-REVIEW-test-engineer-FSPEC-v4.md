# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v4.0)
**Date:** 2026-08-06
**Iteration:** 4
**Scope:** Testing lens only, delta re-review. Baseline for the diff is `15f1ef0` (the commit v3 was
written against); the revision is ten commits, `b73213e`…`d0ee225`, +217/−118 lines. Prior findings
H-01…H-05 and Q-01…Q-03 are verified for disposition; new findings are drawn **only** from changed
sections. Product framing, architecture choice and prose style remain out of scope.

## Prior findings — disposition

All five v3 findings are **resolved**, and all three v3 questions are answered in the document. Each
was checked against the revised text and, where it made a claim about this repository, against HEAD.

| v3 ID | Sev | Disposition | Evidence in v4 |
|----|---|---|---|
| H-01 | High | **Resolved** | The fix went to the mechanism, not the assertion. §8.1's collision table is split into two rows — **within one pass** the colliding subjects are "**one** promotion … the merge is **silent by construction**, and its observable is the *absence* of a second record rather than a reason code"; **across passes** NFR-4 suppresses and "this suppression **is** reported". §8.2 gains a paragraph naming the intra-pass merge's exact observables ("one failure-mode record for the id, one `symptom`, one `target`, one write") and stating that no `duplicate-suppressed` and no `suppressed-by:` are written, with the reason (§6.4 defines the code only over a prior pass's record or an open/merged PR). AT-R6b's second fixture is restated over exactly that set and adds the negative half — "an implementation that reported the merge as a suppression would be indistinguishable, in the log, from one that dropped a promotion" — and now names AT-Q10 as the cross-pass sibling it is distinct from. The sibling (basename-derivation) fixture is kept |
| H-02 | Med | **Resolved** | §10.3's field table now reads `{id}:{action} → {evidence}` with **two** admissible spellings enumerated, which one an entry carries decided "by the suppressed proposal's own route, never by the writer", and the discriminator named ("the `pass:` prefix, which no URL bears"). §12.2 P-04, §15.2's free-form class row, BR-26, §10.4 item 6 and §6.4 all carry the same two-carrier form. AT-Q10's third conjunct is now a **literal**: `suppressed-by:` carries "exactly one entry whose literal text is `{failure-mode-id}:{action} → pass:{enacting passId}` — §10.3's consuming-repo spelling, not a URL and not a bare id". That is one expected value transcribed from the spec, not a family |
| H-03 | Med | **Resolved**, and verified independently at HEAD | §15.3's row now names **three** artifacts and states the count is load-bearing ("CI's `Generated artifacts are in sync` job rebuilds and diffs *every* artifact, so a commit that rebuilds two of the three fails it"); the manifest row says the rebuild "re-stamps three existing rows as well as adding the new one"; T-02 asks its question over three-going-on-four. Verified: `resolveAdvisoryRung` is defined at `pdlc/workflows/dist/orchestrate-dev.bundle.js:1994`, `pdlc/workflows/dist/orchestrate-queue.bundle.js:1970`, `pdlc/workflows/dist/pdlc-cli.mjs:1843`; `git ls-files pdlc/workflows/dist/` returns exactly those three plus `distribution-manifest.json`; the manifest carries ids `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` (`:6`, `:16`, `:26`); the `bundles` array opens at `build-runtime.mjs:448` and its third entry is `{ file: "pdlc-cli.mjs", …, id: "pdlc-cli", contents: cliArtifact }` (`:464-470`), with `cliArtifact` composed at `:291` |
| H-04 | Med | **Resolved**, and the repair is stronger than what I asked for | §6.5 now enumerates **three** domains (PR seam; git seam **invoking tree**; git seam **§6.1 clone**) in a four-column table that separates **obliged** from **permitted but not obliged**, and states the verb classification as part of the contract ("`git checkout -b X` and `git switch -c X` in the clone both resolve to `create-branch`") rather than leaving it to the spy. Both of my red-on-conforming paths are closed by name: `fetch` is in the permitted-not-obliged column with the reason ("a `clone` already fetches, so a distinct `fetch` verb is conforming and its **absence** is equally conforming"), and AC-3.8's branch prohibition is asserted only on the invoking tree. The universal assertion is now **containment**, with the obliged column asserted present only on a Given that obliges it; BR-28 carries the same form. AT-Q7 states all three conjuncts, and the new **AT-Q7c** is the row that pins containment as the universal rule — a pass with no guard-set proposal observing `∅` on two domains and `{add, commit}` on the third, which a universal set-equality would fail. §15.1 AC-3.7 and NFR-1 both list it |
| H-05 | Low | **Resolved** | §2.6's cell now reads "**not** emitted — step 11, which computes it, had not run when the failure fired, so there is no table to append". The leading contradiction is gone and the cell agrees with §10.2 order 3, §8.3's new opening sentence and §12.1 S-11b |
| Q-01 | — | **Answered**, and the answer creates finding H-06 below | §8.4 step 1 now says **Open** is "computed **by the pass**, from the log and nothing else, and handed to the harvest prompt as a list — the arithmetic is not delegated to the agent, so it is testable at this layer". That is the stronger of the two options I offered. §14.2 gains O-C7, which records the filter's unboundedness honestly and refuses a silent cap. What did not follow is the AT the answer's own last clause promises |
| Q-02 | — | **Answered** | §10.2 order 2's condition now reads "**one append per promotion, as it routes**, never one batch at the end of the step", with the reason stated ("it is the whole content of AT-M9's discriminating conjunct"). §12.1 S-11c is realigned, and §12.1 gains a preamble fixing the `Log row` column to terminal rows only in **every** row — which is the right repair, since it removes the reason S-11c's cell had been overloaded |
| Q-03 | — | **Not answered, and correctly so** | I asked what `enacted` reads when a prior record for the pair carries `route: PR` and the current pass derives the same pair as a consuming-repo proposal. §6.4's rule is unchanged and, read against the new §5.1/§8.1 split, the question dissolves: the route is a function of the `target`, the `target` a function of the promotion's kind, and the kind does not change under a path move. I am not carrying it forward |

## Findings

One finding, and it is **new** and inside text this revision introduced. No unchanged section was
re-litigated, and I re-read every changed section listed in the ten commits.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| H-06 | Medium | Local | **§8.4 step 1 pulls the open-promotion computation into this layer and calls it testable here, and no AT asserts it.** The revised cell is explicit in both directions: "**Open** is computed **by the pass**, from the log and nothing else, and handed to the harvest prompt as a list — the arithmetic is **not delegated to the agent, so it is testable at this layer** (a landed `retire` closes an id; a `degraded` one does not): an id is open when **no** record for that id carries `action: retire` with a `route` other than `degraded`." That is a pure, total, deterministic function of one file with an enumerated output, stated precisely enough to write the test — and §13 contains no row that constructs a log and asserts the resulting list. I checked the whole enumeration, not a sample: §13.7's AT-F5…AT-F8 are §8.3's *verdict* arms, AT-F15/AT-F16 are the receive-side id-matching rows, AT-F17/AT-F18 are §8.5's file-existence predicate, and §15.1's AC-5.2 row is unchanged at `AT-F5, AT-F6, AT-F7, AT-F8, AT-F15, AT-F16`. Nothing covers step 1. The gap is not academic in either direction: §8.4 itself now says "**Open** is a harvest-side filter, and it is deliberately not §8.3's population", so AT-F5's "exactly one row per distinct id" cannot stand in for it — the two sets are different by construction; and the `route != degraded` clause is precisely the sort of conjunct an implementation drops (closing an id on any `retire`, landed or not), which would silently shrink the list and produce the **unsafe** failure direction §8.4 and the new O-C7 both say they refuse — a missed recurrence, and with it a false `prevented`. What is needed is one AT over a constructed log fixture spanning all four arms of the predicate in one run — an id with a `retire` at `route: constraints` (closed), an id with a `retire` at `route: degraded` (open), an id with `promote` only (open), an id with `revise` only (open) — asserting the computed list is **set-equal** to the expected id set, not merely that it contains the open ones. Containment is what an implementation returning "every id ever recorded" satisfies, which is the degenerate case O-C7 accepts as a *limit* and must not be allowed to become the *implementation*. Add the row (AT-F19 or similar), and add it to §15.1's AC-5.2 list and to BR-35b's or a new business rule's AT column so the traceability matrix carries it. | §8.4 step 1, §13.7, §15.1 AC-5.2, §14.2 O-C7 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §8.1's record grew from seven fields to eight, and the table is declared "normative for the record's shape" — but no AT compares a written record's field set against it. AT-R6b asserts *one* `target` on the merge path and AT-F1…AT-F4 assert the id derivation; nothing asserts set-equality over the eight names, so a dropped `target` or `route` on some path is invisible until §6.4's carrier misbehaves two passes later. This is a pre-existing shape (the seven-field table had no such row either) and I am not filing it as a finding on that basis — but the field count just changed, which is exactly when the omission is cheapest to close. Is a field-set-equality AT wanted here, or is it TSPEC's serialisation concern? |
| Q-02 | §10.2 order 3's negative arm is now covered by AT-M6 (step-8 dispatch error, S-11b) and AT-M6b (`refused`, S-09), and the cell names both. S-11 — neither model rung resolves — is the third early-terminal shape, and AT-M4 covers it without asserting the absent table. That is fine if step 11's unreachability is one code path shared by S-11 and S-11b; if the two terminate through different arms, S-11 has no falsifier for the absent table. Which is it? |
| Q-03 | AT-Q7c's Given is "a pass with no guard-set proposal — every promotion routes to the consuming repo", and its Then asserts `{add, commit}` in the invoking tree. That holds only if the pass actually promoted something. Should the row pin the Given to a `promoted` pass (§12.1 S-02), so an implementation that promotes nothing and observes `∅` on all three domains cannot satisfy it? As written the invoking-tree conjunct is the only non-empty one, and it is the only thing separating AT-Q7c from a vacuous pass. |

## Positive Observations

- **H-04's repair went past what the finding asked for, and the extra step is the one that matters
  for testability.** I asked for the git seam split by tree with each verb marked obliged or
  permitted. The revision did that and then changed the *universal* assertion from set-equality to
  **containment**, with obligation asserted only on a Given that obliges it — because a conforming
  pass with no guard-set proposal observes `∅` on two of the three domains. That is a class of
  false-red I had not identified, and AT-Q7c exists specifically to pin it ("an implementation of
  AT-Q7's oracle that asserted set-equality universally is red here on correct behaviour"). A test
  written for a rule whose universal form is wrong is worse than no test; this now cannot happen.
- **The subject/target split is the structural change of this revision and it removed a whole class
  of oracle ambiguity.** Before it, `artifact` was doing two jobs — keying the id and deciding the
  route — and half of §13's rows had to be read twice to know which. §8.1 now carries both fields,
  a three-row table showing where they coincide and where they differ, and three consequences each
  stated as "a defect under a single conflated field" (the derivation terminates; an AC-2.2
  promotion never takes the PR route; AC-2.1 promotions stay distinct). Every downstream row that
  reads the field — §8.5 rows 3–4, §8.6, AT-F17, AT-F18, AT-R6b, BR-18, BR-33, BR-35a, §8.4 step 2 —
  was updated to say **which**. That is the difference between a spec a test author can transcribe
  and one they have to interpret.
- **H-01 was answered by making the merge's silence a stated observable rather than by weakening the
  assertion.** The easy fix was to delete AT-R6b's second fixture. Instead §8.2 states the merge's
  exact observable set, §8.1's collision table separates the intra-pass and cross-pass costs into two
  rows, and AT-R6b asserts the positive set (one record, one `symptom`, one `target`, one file)
  **paired with** the two negatives (no reason code, no `suppressed-by:`) and gives the reason the
  negative half exists: "an implementation that reported the merge as a suppression would be
  indistinguishable, in the log, from one that dropped a promotion". Positive and negative on one
  path, which is the standard I would have applied had it been argued at me.
- **§10.3's third credential reading is a named loss rather than an asserted-away one.** The honest
  move here was available and taken: rather than pretend the `failed` row is decidable, the document
  adds a third row reading "**undecidable from the row's fields alone**", names the report body as
  the discriminator, routes ER-4 for the vocabulary gap that causes it, and states outright that
  recording the code anyway "is **not** an option — it would breach REQ §4b's set-equality and turn
  AT-L5 red". AT-K6 then grows from five rows to six with the (iv)/(v) pair — attempted-and-resolved-
  nothing versus never-attempted, both `failed`, both carrying no reason code — named as "the pair
  this row exists for". That is a fixture set designed to falsify the tempting wrong implementation,
  not to demonstrate the right one.
- **AT-M6/AT-M6b are a properly paired negative.** AT-M6 now asserts the absent effectiveness table
  on the same path as its positive report-body assertion, and says why in its own row: "without it,
  an implementation that emitted a table on every pass regardless of where it terminated passes both
  rows." AT-M6b adds the `refused` arm that no other row asserted. §10.2 order 3 and E-16 both name
  which row asserts which arm, so the negative is traceable from the rule rather than only from the
  test.

## Recommendation

**Needs revision**

All five v3 findings and all three v3 questions are resolved, three of them by changing a mechanism
rather than an assertion, and every repository claim I re-checked at HEAD holds. The approval bar is
unchanged, and one Medium finding is open — in text this revision introduced.

What must change:

1. **H-06** — §8.4 step 1 now declares the open-promotion computation pass-side and "testable at
   this layer", and §13 has no row that tests it. Add one AT over a constructed log fixture covering
   all four arms of the predicate in one run (a `retire` at a landed `route`; a `retire` at
   `route: degraded`; a `promote`-only id; a `revise`-only id) asserting the computed list is
   **set-equal** to the expected id set — containment is satisfied by an implementation that returns
   every id ever recorded. List it in §15.1's AC-5.2 row and give it a business-rule home so the
   matrix carries it.

That is the whole of it. H-06 is the same shape as H-01/H-02/H-03 were in the last round — new
mechanism arriving one step ahead of the artefact that pins it — and it is the smallest instance of
that shape the document has produced. Nothing in this revision re-opens a decision an earlier one
settled, and the three questions above are questions, not findings: none of them blocks.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 0}
