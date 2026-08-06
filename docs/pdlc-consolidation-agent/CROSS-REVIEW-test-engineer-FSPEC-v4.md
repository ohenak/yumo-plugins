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

<!-- filled below -->

## Questions

<!-- filled below -->

## Positive Observations

<!-- filled below -->

## Recommendation

<!-- filled below -->

## Verdict

VERDICT: Needs revision
