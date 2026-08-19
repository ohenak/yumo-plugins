# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.6)
**Date:** 2026-08-20
**Iteration:** 7
**Scope:** Local
**Delta base:** `0871a1fe` (last commit carrying the v6-approved bytes) → HEAD `f6a45cc5`; six commits, TSPEC only.
**Upstream re-grounded:** REQ `sha256:a10396e8…` and FSPEC `sha256:82f74a2d…` — both match the hashes named in this dispatch, and both were re-read at HEAD, not assumed.

## Routed items: disposition

| # | Routed item | Verdict | Evidence |
|---|---|---|---|
| 1 | §1.1's O-8 row states the resolution wave commit is the existing `commitPaths` gaining one pathspec — DEC-A6-02's rejected option A | **Landed** | O-8 now reads "**One further `commitPaths` call** after the per-task loop, inside the same `if (waveGit)` block, carrying the promotion's paths under its own `message` and `what` (§3.6); the owning task's own commit keeps its own pathspec, unwidened", and names the widening as "the rejected option A of DEC-A6-02". Checked against `DECISIONS-pdlc-advisory-wave-gate.md:138-155`: the decision text specifies exactly that shape (one additional call, same `if (waveGit)` block, past the same green gate, `message` = `chore({feature}): wave {N} advisory promotion ({taskId})`). Row and §3.6 no longer disagree, and the traceability entry point a reader arrives through no longer teaches the rejected shape |
| 2, 3, 4 | §4.4/§5.1's `waveBudgetPerRun` row claims the key is mirrored into `pdlc/engine`'s `ci-arrangement` expectations; no such expectation exists (three items, one defect, raised by pm-review ×2 and te-review) | **Landed** | Verified at HEAD, not from the document: `grep -c -i advisory pdlc/engine/__tests__/ci-arrangement.test.js` returns **0**, and `.claude/pdlc.config.example.json` carries exactly `dispatch` and `implementation`. The claim is now withdrawn in both places it appeared. §4.4's table cell reads "Mirrored into `.claude/pdlc.config.example.json`; no `pdlc/engine` expectation covers it today (see below)", and a new paragraph states the withdrawal explicitly, with the zero-occurrence fact and the reason the work is still worth doing ("an affordance nothing asserts can ship into the example broken and undiscoverable"). §5.1 gains two second-channel rows carved out of its set-equality rule by an explicit sentence, so the PLAN's file-ownership manifest can carry them. `grep -n "ci-arrangement\|mirror"` over the whole TSPEC finds no residual stale claim; there is no §7 or §9 in this document (the items' numbering is from a superseded draft — the live homes are §4.4 and §5.1, and both were edited) |
| 5 | `waveBudgetPerRun: 0` has a matrix row in §5.4 that nothing tests | **Landed** | §5.2 gains a behaviour arm: tier **enabled**, `waveBudgetPerRun: 0`, first wave's script gate red ⇒ disposition `escalated` / `reason: "budget-exhausted"`, `_agent` double records **zero** calls, snapshot still taken, and the advisory summary key **present** with the sixth row's counters at zero. §5.4's matrix row now reads "`waveBudgetPerRun: 0` (the behaviour arm, §5.2)". The present-and-zero conjunct is the one that discriminates this arm from `advisory.enabled: false` (AT-01-4, where the key is absent entirely), and the document says so — a positive-value oracle, not an absence-only one, and the named regression it catches (collapsing `0` into `enabled: false`) genuinely fails it |
| 6 | §4.5's one-ref-per-wave property has no fixture | **Landed** | §4.5's Snapshot-ref row now carries "asserted on §5.2's two-red-wave run — a single-wave fixture cannot see it", and §5.2 gains the fixture: two waves, both gates red, the set of `update-ref` targets observed on the `_git` double set-equal to `{refs/pdlc/a6-snapshot-1, refs/pdlc/a6-snapshot-2}`. Set-equality over two distinct targets each written once is falsifiable by the stated regression (a fixed name writes one target twice and fails on both conjuncts) — the unobservability argument is correct, and the fixture is the minimum that removes it |

## Upstream re-grounding (DEC-ERR-01 / DEC-ERR-03)

The document declares it re-grounded on FSPEC v1.4 before addressing the raised items. Checked, since a claimed absorption that did not happen is worse than none:

- **BR-11's per-attempt window.** FSPEC `:213-221` states the seam budget is per **attempt**, "not cumulative, not per A6 invocation", worst case `attemptBudget` × value. TSPEC's AT-02-7 row now says exactly that, with the worst case in the row. Faithful.
- **AC-4.1's three conjuncts.** REQ `:382-393` names three fixtures; FSPEC v1.4 split AT-04-1 into AT-04-1a (conjunct i) and AT-04-1b (conjunct iii), leaving AT-04-1 as conjunct (ii). §5.6 now carries all three rows, and each names a carrier that exists in this document: AT-04-1a → §5.2's two-attempt six-token run (which does drive red-then-green through the injected `_runCommand` and keeps the shipped `verifyGate`, so the ledger is observed rather than stipulated); AT-04-1b → §5.5's dropped-re-gate mutation, whose two-row construction is present at §5.5 and is the same construction FSPEC `:397-398` routes here as O-1. No conjunct is left without a home.
- **Which carve-out FSPEC dropped.** The changelog claims it is the seam-budget one, not the `.gitignore` one. Confirmed: FSPEC v1.4's changelog and REQ v1.7's both delete NFR-4's `attemptBudget`-starvation carve-out, while BR-9 (`:200-206`), AT-05-1 (`:418-419`) and AC-5.1 (`:441-445`) all still read "tracked and untracked alike, generated outputs included" with no ignored-path carve-out. OQ-7 therefore correctly stays open-upstream, and every upstream-pending flag in §3.3, §5.2, §5.5 and §5.6 correctly stands unchanged. Nothing was quietly closed under cover of the erratum round.

Nothing previously approved was broken by the edit. The set-equality rule in §5.1 is intact and the two new rows sit outside it by an explicit carve-out rather than by silently widening the rule; §5.5, §3.2's step-6 anchor mechanism and §3.3's `ledgerAnchor` row are untouched.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-34 | Medium | Local | **The example config has no `advisory` section to "gain" a key, and the new engine expectation does not say what the authored section must contain.** §4.4 states the fact correctly in prose — "The tracked example carries exactly two sections, `dispatch` and `implementation`" — but two of its own neighbours are written as if a section existed: §4.4's closing sentence reads "`.claude/pdlc.config.example.json` … gains the key alongside them" (them = `enabled`, `attemptBudget`, `seamBudgetMinutes`, `envelope`, none of which are in the example), and §5.1's row reads "The `advisory` section **gains** `waveBudgetPerRun`". The edit is an authoring job for the whole section, and the new oracle — "the `advisory` section parses, carries `waveBudgetPerRun`, and its value is a non-negative integer" — passes on `{"advisory":{"waveBudgetPerRun":1}}` alone. That leaves the oracle under-determined against the rationale the same paragraph gives it: if the example is "the operator's first and possibly only encounter with the key **on a tier that ships off by default**", an example carrying `waveBudgetPerRun` with no `enabled: false` beside it teaches the operator the wrong thing and still goes green. Two decidable questions Phase P will otherwise have to invent answers to: which keys the authored section carries, and which value `waveBudgetPerRun` shows (the default `1`, or the `0` that is the affordance being documented). One sentence in §4.4 naming the section's literal shape, echoed by the §5.1 row's wording, makes the expectation exact and keeps the stated risk actually covered | §4.4, §5.1 |

Two v6 findings remain open and are **not** re-filed here, since both were accepted last round as non-gating Phase-P lint work and neither sits in a section this erratum touched: F-32 (`sameSequence` is used at §3.2's step-6 block and never defined — still absent from §3.3's member table and §3.5's signature list) and F-33 (§5.5's revert citation `orchestrate-dev.js:3554-3568` still omits `:3548`, where `await doRevert()` actually sits). Recording them so they are not lost between rounds, not to re-open the document.

## Questions

None this round.

## Positive Observations

- The withdrawal in §4.4 is written as a correction with its evidence attached, not as a quiet deletion: it names the two prior claimants (PM F-01, TE F-06, DEC-A6-04's consequences), states the zero-occurrence fact that falsifies the old claim, and then argues the work forward rather than dropping it. A reader arriving later cannot mistake the new expectation for one that always existed — "authored, not adjusted" is the right sizing and it is said twice, in §4.4 and again in §5.1's row.
- The `waveBudgetPerRun: 0` arm is specified with the discriminating conjunct rather than the convenient one. "Summary key present with counters at zero" is what separates it from `enabled: false`; "no `_agent` calls" alone would have been satisfied by the disabled tier too. The document also names the regression the conjunct exists to catch, which is what makes it a test rather than an observation.
- The two-red-wave ref fixture is justified by unobservability, not by symmetry: "a regression to one fixed name passes every assertion in this section" is exactly the argument that earns a new fixture, and the set-equality shape means a fixed-name regression fails on both conjuncts rather than on an incidental one.
- O-8's correction goes past the sentence that was wrong. It states the shape positively, cites §3.6, and then names the rejected option explicitly — so the obligation table now inoculates the reader against the shape instead of merely no longer teaching it.
- The re-grounding is real and checkable. Every upstream claim I spot-checked (BR-11's per-attempt window, AC-4.1's three conjuncts, BR-9's no-carve-out restoration oracle) matched HEAD, and the changelog's claim about *which* carve-out FSPEC dropped is correct — the easy error here was to read "carve-out dropped" as closing OQ-7, and the document did not make it.

## Recommendation

**Approved with minor changes**

All six routed items landed, and each landed as a testable change rather than a wording repair: the two claims that were false at HEAD are withdrawn with evidence, and the three properties that had no fixture now have fixtures whose named regressions genuinely fail them. The upstream re-grounding on FSPEC v1.4 is faithful, and no previously approved section was broken. F-34 is a single-sentence gap in the newly authored example-config expectation — non-gating, and Phase P can close it in the lint pass.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
