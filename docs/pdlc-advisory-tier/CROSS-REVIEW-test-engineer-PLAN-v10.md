# Cross-Review: test-engineer — PLAN (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md (v1.9)
**Date:** 2026-08-04
**Iteration:** 10
**Scope:** Delta re-review against the bytes I approved at v9. The PLAN itself did not change; the
delta in this window is entirely upstream (PROPERTIES), so the question is whether the PLAN still
holds against the documents it now sits on top of. Unchanged sections are not re-reviewed.

## 1. Prior findings — disposition

My v9 review closed **Approved, 0H/0M/0L**, so I carry no backlog into this round. The table records
that explicitly rather than leaving it implied.

| Item | Disposition | Evidence I checked |
|---|---|---|
| **v9** — no findings filed | **Nothing open.** `CROSS-REVIEW-test-engineer-PLAN-v9.md:100` files "None"; `:161` records `{"high": 0, "medium": 0, "low": 0}` | — |
| **v8** — no findings filed | **Nothing open.** `CROSS-REVIEW-test-engineer-PLAN-v8.md:41` files "None" | — |
| **v7 F-01 (Low)** — wrong document label on §8.2's gate-row quantifier | **Still resolved.** `PLAN:869` still reads "every gate row of **FSPEC §5.4**" with the FSPEC/TSPEC disambiguation in-line; the PLAN has not been touched since | `PLAN:869` |
| **v9, item declined not filed** — `PROPERTIES:570-572` undershooting its paragraph by two lines | **Superseded — now a real drift, filed below as F-01.** The upstream paragraph moved | `PROPERTIES:619-626` |

## 2. What changed, and does it hold up

**The PLAN did not change.** `git diff 06040a4..HEAD -- docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md`
is empty — the bytes are identical to the commit I approved at v9 — and `git status --porcelain`
carries no uncommitted edit under `docs/`. So there is no in-document delta to scan for new issues.

**One upstream document did change, and the PLAN cites it.** In the window `06040a4..HEAD` the only
non-cross-review file touched under `docs/pdlc-advisory-tier/` is
`PROPERTIES-pdlc-advisory-tier.md` (+218/−71). FSPEC, TSPEC, DECISIONS and REQ are untouched, so every
PLAN anchor into those — `FSPEC:361-380`, `FSPEC:378`, `TSPEC:630`, `TSPEC:648-660`, `TSPEC:657`,
`DECISIONS:698` — still resolves to the bytes I verified at v9. The PLAN's single `PROPERTIES:*`
anchor does not (F-01).

**Where the PROPERTIES text went.** At v9, `PROPERTIES:570-574` carried the mutation-direction
rationale that `PLAN:258` paraphrases. §6.5 has since been restructured — the two-conjunct form for
A1/A3 is now stated at `PROPERTIES:605-617`, and the sentence the PLAN cites ("would fail against a
correct build, in the RED batch (A-07) that authors it, and not be diagnosed until A-23") is now at
`PROPERTIES:619-626`. Lines 570-572 today are conjunct 1 of the **A2/A4/A5** form
(`post-action-verification-failed`, the O-1 triple, "Never `resolved` alone is satisfied by a thrown
error") — same section, but the wrong half of the A1/A3 vs A2/A4/A5 split the citation exists to
disambiguate.

**The testing substance is unaffected, which is why F-01 is Low and not Medium.** `PLAN:258` states
the install-the-stub instruction in full inside its own cell — "each of those two cases asserts
`verifyGate === null`, that `resolved` is unreachable on every path, that the seam terminates in
`escalated` or `no-action` with its own O-1 triple, and that *installing* `async () => ({ passed: true })`
makes the case fail" — so an implementer of A-07 gets the correct authoring form without following the
pointer. Nothing about the oracle changes; the pointer's destination does.

**Upstream/downstream consistency re-checked against the new PROPERTIES bytes**, since that is the
only thing that could have broken the PLAN without editing it:

- **Block names still match.** PROPERTIES §6.5 homes PROP-GATE-01…05 in `A-23 — A3/A4 gate
  exclusivity`, `A-24 — A5 gate exclusivity`, `A-31 — A1/A2 gate exclusivity`
  (`PROPERTIES:580-582`), and PROP-GATE-06 in `A-22 — driver lifecycle` (`PROPERTIES:586`). `PLAN:258`
  authors exactly those four `describe.skip` block names and `PLAN:869` registers the same
  seam⇒block mapping. No block name drifted, so §3's un-skipper rule still resolves.
- **The mutation direction agrees in both documents.** `PROPERTIES:619-621` — "at A2/A4/A5 the
  mutation is to **replace** the declared gate …; at A1/A3 it is to **install** that same stub" —
  matches `PLAN:258` and `PLAN:869` word for word in effect. `PROPERTIES:622-623` even cites
  `PLAN:869` and `PLAN:258` back, so the two documents now point at each other; only the PLAN's leg
  of that pair is stale.
- **The gateless conjuncts are still positive, not absence-only.** `PROPERTIES:607-611` requires
  `resolved` unreachable on every path **and** termination in `escalated`/`no-action` with its own O-1
  triple — the what-happens-instead on the same path. `PROPERTIES:612-617` adds the structural
  conjunct (`verifyGate === null` asserted directly), with the reason it is the only available
  mutation control at a seam that never reaches step 6 (`TSPEC:434-439`). `PLAN:258` and `PLAN:869`
  both carry that pair.
- **Set-equality is still one case, still over the registry.** `PROPERTIES:584-586` (PROP-GATE-06)
  states the registry key set must equal `ADVISORY_SEAMS` by set equality, in one place; `PLAN:258`
  keeps that case in A-22's block, un-skipped at batch 9 ahead of the per-seam blocks and therefore
  written over the in-file registry rather than over case results. A sixth seam still fails the suite;
  a deleted case is still not expressible without deleting its registry row.
- **File claims agree by set.** The set of test-file basenames named anywhere in PROPERTIES is
  identical to the set named anywhere in the PLAN (`advisoryDriver.test.js`,
  `advisoryEnvelope.test.js`, `advisoryPreflight.test.js`, `scanFixtures.js`, …) — no document names a
  file the other does not. Files the PLAN treats as pre-existing exist under
  `pdlc/workflows/__tests__/`; the two it declares new (A-01's `advisoryPreflight.test.js` and
  `fixtures/scanFixtures.js`) are still untracked scratch in the working tree, not tracked content,
  so the "new" declaration is accurate against the branch.

**Mechanical contract re-derived over the current bytes** with the shipped parsers in
`pdlc/workflows/orchestrate-dev.js` — `parsePlanTasks` (`:2039`), `parsePlanOwnership` (`:2257`),
`validatePlanContract` (`:2344`), `computeTopologicalBatches` (`:6533`): **36** tasks, **36**
ownership rows, `validatePlanContract ⇒ {"ok":true}`, **20** topological batches — identical to v6
through v9, as byte-identical input requires.

## Findings

## Questions

## Positive Observations

## Recommendation
