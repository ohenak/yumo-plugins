# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.2, 2026-08-28)
**Date:** 2026-08-28
**Iteration:** 2

Delta re-review. Base for the diff is `9635b9ad2` (the tree my v1 read); the document has moved
through twelve commits to `f981ddfa4`, +304/−29 lines. My v1 raised five High findings; four are
resolved, one is resolved in prose but left unlanded in the section's normative clause list. I
re-read only the changed sections for new issues and did not re-litigate the sections I approved.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §7.4's normative pinning list, clause (b), still specifies the non-hermetic guard my v1 F-03 asked to be replaced — `mergeBaseSha` asserted against `git merge-base origin/main HEAD` **computed at test time** — and now directly contradicts the corrected "Baseline identity" bullet 40 lines above, which adopts the shipped hand-transcribed-literal shape and says the assertion resolves against `HEAD`, "never against `origin/main`". Two incompatible instructions for one assertion; the clause list is the one an implementer follows | §7.4:968–973 vs §7.4:916–931 |
| F-02 | Medium | Local | §3.6's new safety promise — "every reviewer receives the **whole** project-level corpus, on every feature, always" — rests on the measured 6,305 + 1,200 ≤ 8,000 arithmetic, and no oracle pins it. The framing half is pinned (§4.3's ≤1,200-byte unit test); the corpus half is prose only. The corpus grows by design, and at ~154 B/line about three more promoted decisions silently break the promise with every test green | §3.6:390–399, §4.3 |

Scope legend: `Local` — addressed in this loop, discarded at harvest.

## Resolution of v1 findings

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §3.6 re-executes the measurement, concedes the inertness claim, and acts on it twice: §4.3 shortens the citation to `[{sourcePath} § {id}]` (D-7, −33%), and §3.6 now states the order is live from the first dispatch. The REQ-owned default is routed upstream as ERR-2 with the numbers attached rather than decided here — the right disposition |
| F-02 | High | **Resolved** | §7.4 splits AT-04 and AT-05 onto different entry points, with a table naming what each falsifies. AT-05 now enters through `parseDecisionLedgerConfig` → `buildDecisionLedgerInjector`, so the four spellings are genuinely four inputs. The added implementer rule — "the recorded arm must consume the config text it is varying" — is the generalisation I wanted |
| F-03 | High | **Partially resolved → F-01 above** | The "Baseline identity" bullet now matches `loopEconomicsBaselineGuard.test.js:239–253` exactly, including the reason. Clause (b) of the pinning list was not edited with it |
| F-04 | High | **Resolved** | §3.4 names the positive conjunct (statement/`sourcePath` equal the project-level record's, transcribed from the fixture; `origin === "project"`; feature-level statement asserted absent) and states the two-mutation argument. §7.6's AT-18 row carries the assignment, so no conjunct points at an unassigned section |
| F-05 | High | **Resolved** | §7.3 states why the old wording was unimplementable so it is not re-attempted, then respecifies the census on the precedent's actual shape: a frozen `DECISION_LEDGER_CENSUS_TOKENS` set-equality-checked against the module's exported names, over the whole file minus four brace-matched owned regions. The non-empty-slice assertion is the anti-vacuity check I would have asked for. `sourceExcludingParser` exists at `advisoryDisabled.test.js:717` as cited |
| F-06 | Med | **Resolved** | D-8 + §4.2 make `renderDecisionLedgerBlock` the only producer; `selectDecisions` obtains `renderedBytes` by calling it |
| F-07 | Med | **Resolved, and better than asked** | §7 concedes the c8 per-file gate cannot see this feature inside a ~17k-line file, then replaces the percentage floor with a stronger checkable obligation: every one of §6.1's fourteen failure rows mapped to a named test in the PLAN task that implements it. Verified against `pdlc/workflows/package.json:9` — the gate is as described |
| F-08 | Med | **Resolved** | AT-03 now mutates the scripted `_readFile` double's returned text, not the fixture, and §7.6 explains why the two requirements were contradictory as literally stated |
| F-09 | Med | **Resolved** | §7.5 gives the property its own transcribed formatter and states the echo argument explicitly |
| F-10 | Low | **Resolved** | This spec's errata renamed `ERR-1`/`ERR-2`; `E-1` now unambiguously means FSPEC's |
| F-11 | Low | **Resolved** | §8.1 cites E-9/E-10/E-11 by id with a mechanism and a pinned fixture case each |
| F-12 | Low | **Resolved** | D-6 states placement outside the learnings sentinel region and gives the PROP-DIS-06 reason |

## F-01 in detail — the one thing blocking approval

§7.4 makes the correction I asked for in the bullet that describes the baseline's identity
(lines 916–931). It now reads, correctly:

> The load-bearing check is equality against a **hand-transcribed literal** in the test file —
> `expect(manifest.mergeBaseSha).toBe(EXPECTED_MERGE_BASE_SHA)` … `git merge-base --is-ancestor
> {recorded sha} HEAD` is kept only as a documented **weaker second signal** … it resolves ancestry
> against **`HEAD`**, never against `origin/main`, so the assertion needs no fetch, is hermetic in
> CI, and cannot red on an unrelated push to `main`.

That is exactly the shipped shape. I confirmed it against
`pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js:239–253`, which asserts
`toBe(EXPECTED_MERGE_BASE_SHA)` and then runs `git merge-base --is-ancestor manifest.mergeBaseSha HEAD`,
carrying the same reason in its own comment.

But the section's normative list — the one an implementer reads as the specification of the guard,
introduced as **"The pinning O-4 asks for, three clauses"** — was not edited alongside it, and still
says (line 970):

> (b) `mergeBaseSha` asserted against `git merge-base origin/main HEAD` computed at test time, so a
> baseline captured from the wrong base fails loudly;

This is the original F-03 text verbatim. `git diff 9635b9ad2 HEAD` shows no change to these lines.
Two problems, and the second is the reason this stays High rather than dropping to Low:

1. **It is the defect F-03 named.** Computing `git merge-base origin/main HEAD` at test time makes
   the assertion depend on the local `origin/main` ref being current. In CI without a full fetch the
   ref may be absent or stale; after any unrelated push to `main` the merge base moves and the guard
   reddens on an event with no relationship to this feature. It is a delivery-blocking flake in a
   required check (`Unit tests (ubuntu-latest, node 20)`).
2. **The document now contradicts itself inside one section.** One bullet says resolve against
   `HEAD`, never `origin/main`; another says compute `git merge-base origin/main HEAD` at test time.
   An implementer cannot satisfy both, and the clause list is the more instruction-shaped of the two.
   A reviewer of the resulting test cannot say which form the spec required.

**The change that resolves it.** Rewrite clause (b) to the shape the "Baseline identity" bullet
already adopted, so the list matches the prose:

> (b) `mergeBaseSha` asserted equal to a **hand-transcribed** `EXPECTED_MERGE_BASE_SHA` literal in
> the test file — never read from the manifest it is checking — with
> `git merge-base --is-ancestor {recorded sha} HEAD` kept as a documented weaker second signal;

No other part of §7.4 needs to move: (a), (c) and the mutation-proof bullet are all correct as
written, and the mutation-proof step already expects "the manifest assertion green", which is only
coherent under the hand-transcribed form.

## F-02 in detail

§3.6's rewrite is the strongest part of this revision, and it lands one promise it does not assign
a test to. Having established that the byte bound binds first, it states:

> - every reviewer receives the **whole** project-level corpus, on every feature, always;

and derives it from `8000 − 1200 = 6,800` bytes for lines against the measured 6,305 for the 41
project-level lines — about 495 bytes of headroom. That promise is what replaces the inertness
argument as the design's safety property, so it is load-bearing, and it is corpus-dependent in the
one direction the corpus actually moves: `docs/_decisions/` grows every time a feature promotes a
decision, and this feature's own DECISIONS document is already owed (§9.1: "DECISIONS is warranted").
At the measured 137–160 bytes/line, roughly three more promoted decisions exhaust the headroom, and
the first project-level line then drops with every test still green — §7.3's corpus oracle pins ids
and counts, not bytes, and §7.5's property quantifies over generated inputs, not the standing corpus.

The asymmetry is worth naming: §4.3 pins the framing half of exactly this arithmetic with a unit test
against a ≤1,200-byte literal, for precisely the reason given here — "an unmeasured quantity sitting
inside a measured budget", "unfalsifiable prose". The corpus half of the same sum has the same
property and no pin.

**A cheap discharge, in the fixture where the numbers already are.** Add one assertion to §7.3's
corpus oracle: over the frozen fixture, the rendered project-level block's byte length is
`≤ maxBytes − 1200` at C-5's shipped default, with the measured 6,305 transcribed as the expected
value so drift is visible rather than merely bounded. It reddens when the promise stops being true,
on the frozen corpus, hermetically — and because the fixture is frozen it reddens at the deliberate
moment someone re-captures it, which is the right moment to re-decide ERR-2's default. If instead
the intent is that ERR-2's resolution supersedes this, say so in §3.6 and make the assertion's
threshold the resolved default; either way the promise gets an oracle.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §7.6 says AT-01 supplies an explicitly non-binding `maxBytes`, correctly, so its 45/48-line expected sets are producible. Does any test then exercise the renderer at C-5's **shipped default** over the real corpus shape? §7.5's property covers the bounds abstractly and AT-13/AT-15 are examples; F-02 is the concrete gap I see. If the answer is "AT-13's examples are drawn at the default", saying so in §7.6 would close it |
| Q-02 | §7.5 lists four conjuncts failing on "four different mutations", but the mapping given sends two mutations to the prefix conjunct and two to no-truncation — the two bounds conjuncts (`maxEntries`, `maxBytes`) get no named mutation. Are they intended to be covered by the generator's `0`/exactly-fitting/generous range alone, or is a mutation owed for each? |
| Q-03 | §7.3's census excludes `main()`'s wiring block as an owned region. `main()` is large and owns much unrelated code; is the excluded slice the whole function or only the ledger wiring within it? If the whole function, a coupling introduced in `main()` escapes the census |

## Positive Observations

- **Every High finding was engaged on the merits, not deflected.** Four of five are fully resolved,
  and the fifth is resolved in substance. More notably, three of the fixes went past what I asked:
  F-01 produced a format change (D-7) that removes a third of the block, F-07 replaced a coverage
  percentage with a per-row mapping that is strictly more checkable, and F-02 produced a stated rule
  for implementers rather than a one-off correction.
- **§3.6 concedes a falsified claim in the document's own voice and rebuilds the argument.** "An
  earlier draft of this section argued the order was *inert* … Both TSPEC reviewers falsified that
  claim by executing the rule and measuring the bytes, and I have re-executed it and reproduce their
  figures exactly." The replacement safety argument — the order itself protects the promoted corpus,
  rather than the bound never binding — is stronger than the one it replaces, and correctly routes
  the value judgement upstream (ERR-2) instead of taking it here.
- **§7.3's census correction is a model of how to close an unimplementable spec.** It states why the
  old operands failed (ubiquitous token, non-existent regions), names both replacements as frozen and
  set-equality-checked, and adds a non-empty-slice guard so the census cannot go vacuous. It also
  says honestly what it does *not* prove (a coupling via a generically-named local) and names the
  compensating control.
- **The AT-01/AT-03 notes anticipate the wrong fix and forbid it.** "If this test ever reddens, the
  correct response is **never** to trim the expected set to whatever the renderer emitted" — that is
  the implementation-echo failure written down at the point of temptation. AT-03's note resolves a
  genuine contradiction between the fixture-immutability guard and the mutation scenario by moving
  the mutation into the double.
- **§7.5's own-formatter argument is exactly right.** Naming that a reused production renderer would
  make the no-truncation conjunct true by construction, and accepting one duplicated format literal
  as the price, is the correct trade — and §4.3's framing pin plus AT-02 keep the duplicate honest.

## Recommendation

**Needs revision**

One High finding, and it is a small edit: §7.4's clause (b) must be brought into line with the
corrected bullet 40 lines above it, which already states the shipped, hermetic shape. Nothing in the
design is in question — this is the last unlanded sentence of an otherwise complete response to my
v1 findings. F-02 is Medium and non-gating, but it is cheap to discharge in the same pass and it
protects the safety promise §3.6 now rests on.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
