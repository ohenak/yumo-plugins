# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.2)
**Date:** 2026-08-19
**Iteration:** 3
**Scope:** Delta re-review of the v1.1 → v1.2 diff (`bda13385..HEAD`), plus disposition of v2's findings (F-01, F-02, F-03)
**Prior review:** `CROSS-REVIEW-product-manager-PLAN-v2.md` (2 High, 0 Medium, 1 Low)

---

## Disposition of v2 findings

| v2 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | All four bare row-count sites are now named in all four places that had to carry them, and the grep re-run at HEAD returns exactly the four the PLAN names — `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571`, `advisoryHarvest.test.js:726` — with no fifth site anywhere under `pdlc/workflows/__tests__` (the only other `rows).toHaveLength` hits are `advisoryBundle.test.js:212`'s manifest rows and two `consolidation*` single-row assertions, none coupled to `ADVISORY_SEAMS`). A6-03's task text names all four with the `:726` reasoning attached (member *lookup*, not member list); batch 1's gate row names all four as file:line; §1.3 names all four; the DoD checklist's set-equality row names all four. `advisoryHarvest.test.js`'s single-owner problem is now stated in the task itself ("no other owning task, so any site left unnamed here reddens batch 2 under a gate that forbids batch 2 touching this file"), which is the sentence an implementer needs to not re-open the hole. |
| F-02 | High | **Resolved** — closed by option (b), and closed harder than the finding asked | The `pdlc/README.md` clause is gone from A6-06, and the drop is justified on four independently checkable grounds rather than asserted. All four verify: `pdlc/README.md` carries **zero** occurrences of `advisory` at HEAD (so there was no section to join); no REQ, FSPEC or TSPEC row demands the documentation (`grep -n -i README` over FSPEC and TSPEC returns nothing; REQ names no documentation obligation); the wave loop commits exactly `task.files` (`orchestrate-dev.js:14398`–`:14406` — `const paths = Array.isArray(task.files) ? task.files : []` feeding `commitPaths`), so a README edit under a task owning only the example config would have stranded; and `pdlc/engine/__tests__/docs-uniqueness.test.js:122`–`:123` does pin `pdlc/README.md:139` and `:145` to `claude plugin install` by **absolute line number** — both lines verified to carry that string today, so any inserted line above them shifts the pins and reddens `Engine tests (ubuntu-latest)`. The line-pin ground is the strongest of the four and was not in my v2 finding; it converts "unowned and uncommittable" into "actively delivery-breaking". |
| F-03 | Low | **Resolved** | §1.3 now says the manifest's twelfth path under `pdlc/workflows/__tests__` is the shared fixture `helpers/advisoryDoubles.js`, not a `*.test.js` file, so "eleven test-side files" and the twelve-path manifest reconcile on the page without the reader reconstructing the intent. |

## Findings

Two Low findings, both cosmetic residue of this round's own edits. No High, no Medium.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **A6-03's "Both are folded into this existing batch-1 task" is stale wording left by the two→four expansion.** The sentence sat immediately after "the two bare row-count assertions" in v1.1, where "Both" had a referent. The list above it now enumerates four sites, so "Both" reads as though only two of the four are folded in — the opposite of the paragraph's own preceding sentence ("All four sites flip `5` → `6` in this task"). No implementer is likely to be misled given the explicit "All four" one clause earlier, which is why this is Low and not Medium, but the sentence is a leftover, not a choice. **Fix:** "All four are folded into this existing batch-1 task rather than given a sixth batch-1 task of their own." | AC-1.4; PLAN §Batches (A6-03) |
| F-02 | Low | Local | **The DoD checklist's four-site continuation line is indented to 2 spaces where its siblings use 6.** `PLAN-pdlc-advisory-wave-gate.md:315` (`` `advisoryHarvest.test.js:571`, `advisoryHarvest.test.js:726`) now reading `6`. ``) breaks the 6-space continuation the rest of that `- [ ]` item and every neighbouring item uses. It still renders as one list item — 2 spaces is a valid lazy continuation — so nothing is lost to a reader or to the completeness gate; it is a diff artifact worth one keystroke while the section is open. **Fix:** re-indent to 6 spaces to match the item's other continuation lines. | PLAN §Definition of Done |

### Verification performed on this round's new claims

Every code citation added in v1.2 was re-run against HEAD; all land where claimed.

- `ci-arrangement.test.js:39` is `const configPath = path.join(repoRoot, ".claude", "pdlc.config.example.json")` — the example-config read A6-04 now concedes.
- `ci-arrangement.test.js:799`–`:825` is the `implementation.testCommand` test, and the file's own comment at `:796` annotates it exactly as A6-04 says: *"implementation.testCommand (unrelated to §5.1; unchanged by this task)"*.
- `advisoryDisabled.test.js:653`–`:657` matches `/\.enabled\b/g` over `sourceExcludingParser(DEV_SOURCE) + "\n" + sourceExcludingParser(QUEUE_SOURCE)` — raw source text, no comment or string stripping. A6-18's widened warning ("any `.enabled` token at all, comments and strings included") is a correct reading of that oracle, and a stricter one than the `config.enabled === false` literal it replaces.
- The `implementation.testCommand`/engine-scoping premise A6-04 and A6-06 both rest on holds against the config the wave gate actually reads: `.claude/pdlc.config.json`'s `testCommand` is `cd pdlc/workflows && npm test …` with no engine leg. (Worth stating explicitly because the *example* config at `.claude/pdlc.config.example.json` **does** carry `(cd pdlc/engine && npm test) && …`, and `ci-arrangement.test.js:810`–`:822` asserts it must. The PLAN's out-of-band `cd pdlc/engine && npm ci && npm test` obligation in A6-04/A6-06 and its "Engine channel — **not** covered by the batch gate" verification row are therefore right about this repo's live config, not accidentally right.)

## Questions

| ID | Question |
|----|---------|
| Q-01 | Non-blocking, carried forward from v2's Q-01 and now partly answered by the revision: A6-03 says "the rule, not the snapshot, is what A6-03 and batch 1's gate wording carry", yet what both actually carry is the four-item snapshot with the rule stated alongside it. That is the right call for an executable gate — a line-numbered list is falsifiable at dispatch time and a prose rule is not — so no change is asked. The question is only whether the implementer should re-run the derivation grep at batch-1 start and halt on a count other than four, rather than trusting line numbers that a rebase could shift. |
| Q-02 | On F-02's close: with the `pdlc/README.md` line dropped, the `enabled: true` + `waveBudgetPerRun: 0` affordance is discoverable only by an operator who opens `.claude/pdlc.config.example.json` and infers the pairing's meaning from the two keys sitting together. No REQ or FSPEC row asks for more, so this is not a finding. Is it worth a one-line note in the feature's own LEARNINGS at harvest, so the next operator-facing documentation pass has a place to pick it up? |

## Positive Observations

- **F-02 was closed by disproving the option rather than by picking it.** v2 offered (a) own the README row or (b) drop the clause. The revision takes (b) and then does the work that makes (b) the only defensible choice: it establishes that `pdlc/README.md` has no `advisory` content to join, that no spec row asks for the documentation, that the commit mechanism would strand the edit, and — the ground I had not found — that `docs-uniqueness.test.js:122`–`:123` pins two README lines by **absolute line number**, so the edit would have reddened a delivery-blocking required check rather than merely going uncommitted. A PLAN that says "we chose (b)" is fine; one that says "(a) was never available, here is why in four checkable clauses" is better, and it is the version a future reader can act on without re-deriving anything.
- **A6-04's justification got *weaker* in the right direction.** v1.1 argued the new file was needed because `ci-arrangement.test.js` "carries zero occurrences of `advisory`". v1.2 concedes that file already reads the example config (`:39`) and already asserts on it (`:799`–`:825`), then restates the reason on ground that survives the concession: the file declares itself the single oracle for FSPEC §5.1's CI arrangement, and a config-schema red there would block delivery on an oracle whose stated scope names no such check. Correcting a claim in the direction of "my earlier reason was too convenient" — while keeping the decision — is the rarer and more useful revision.
- **A6-18's widening is a real broadening of the hazard, not a wording tweak.** Warning against `config.enabled === false` protected against one spelling of the mistake; warning against any `.enabled` token "comments and strings included" protects against the spelling an implementer is most likely to reach for under time pressure — a comment explaining *why* the tier gate is received rather than read, which would itself have broken PROP-DIS-06 in batch 12. The oracle at `advisoryDisabled.test.js:653`–`:657` is a bare regex over raw source, so the widened statement is exactly true.
- **The four-site fix propagated to every place that had to carry it, not just the one the finding quoted.** v2's F-01 named A6-03 and batch 1's gate wording. The revision also updated §1.3 and the DoD checklist row. Fixing a finding at all of its homes rather than at the one address in the finding text is what keeps a document from drifting into internal disagreement across rounds.
- **The document's citation discipline held through a third round.** Every `file:line` added in v1.2 — `ci-arrangement.test.js:39`, `:799`–`:825`, `docs-uniqueness.test.js:122`–`:123`, `pdlc/README.md:139`/`:145`, `advisoryDisabled.test.js:653`–`:657`, `orchestrate-dev.js:14398`–`:14406`, and all four row-count sites — was re-run and lands where claimed. Across three rounds I have not found a citation in this PLAN that does not verify.

## Recommendation

## Verdict
