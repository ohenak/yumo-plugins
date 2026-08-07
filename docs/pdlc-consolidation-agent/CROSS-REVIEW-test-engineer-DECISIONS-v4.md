# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 4
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v3.md`. Diff base
`e95352c3` (the commit at which v3 was completed) → HEAD; three revision commits touched this
document (`6034f0fb`, `ed050777`, `61f11478`), +40/−11 lines across §5 (DEC-CONS-03 domains 1–2),
§8 (DEC-CONS-06) and §11.2 (DEC-CONS-03 property). Testing lens only: whether each v3 finding is
closed, and whether the changed text introduced an oracle that cannot fail or a measurement the
code contradicts. Unchanged sections approved in v1–v3 are not re-litigated.

## Disposition of v3 findings

| v3 ID | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | Low | **Resolved, and in three places rather than the one I named** | I asked for the obligation conjunct in §11.2 alone. It landed in §11.2 *and* in both §5 domains. §11.2 now says plainly that containment plus the absent-always negative "are not the whole contract, and a property author must not read them as it", names the vacuous pass explicitly ("a pass that issues *no* invoking-tree `git` call at all — i.e. … a regression that silently drops the AC-1.3 log commit"), and transcribes **all four** set assertions, not the three I asked for: partition, containment, obligation, and the ∅ equalities, plus "Comparison is over a `Set`, never a multiset". Every one reproduces at `TSPEC-pdlc-consolidation-agent.md:2095-2100`. The per-domain obliged sets are transcribed correctly: `add`, `commit` for the invoking tree (`TSPEC:1619` obliged column) and `clone`, `create-branch`, `add`, `commit`, `push` for the clone domain (`TSPEC:1620` obliged column) — both verified character-for-character. The fourth conjunct (partition) is the one I did **not** ask for and is the one that closes the remaining hole: without it an unclassified call is exempt from containment, which is exactly what `TSPEC:2096-2097` says. The property can no longer green on a pass that did nothing |
| F-02 | Low | **Resolved by withdrawal-and-restatement, not by deletion** | §5 domain 2's "cited rather than restated" clause is gone. The replacement states the pin as a **transcription with provenance** — "the test hardcodes it *and* names `TSPEC:1620` as the authority, so a later widening of that row is a divergence from a cited source rather than a silent drift past an uncited one" — and explicitly cross-references the two pins I offered as the model (§7's `CORPUS_GLOBS`, §9's six terminal statuses), so the three now share one shape. The withdrawal is recorded in terms, including *why* the old wording was wrong ("the same sentence restates it inline, and a test written from an inline list without the provenance would drift past exactly the widening the clause claimed to catch"). The transcription itself re-verified against `TSPEC:1620` — obliged `clone`, `create-branch`, `add`, `commit`, `push`; permitted `fetch`, `read-branch`, `read-status`; absent every merge verb — exact |
| Q-01 | — | **Answered by construction** | The question was whether the obligation conjunct was meant to live only in the TSPEC. The revision answers by putting it in both §5 domains and §11.2, so a PROPERTIES author reading §11.2 alone now inherits the whole four-assertion contract. No residue |
| Q-02 | — | **Answered, and in the direction I expected** | §8 gains a dedicated paragraph naming `rtHashFile` and the `_checkFile` transport as "deliberately outside this oracle — permanently, not by oversight", with the grounds I asked to have written down rather than re-derived. All four measurements reproduce: `rtHashFile` at `runtime-adapter.js:613`, its prompt at `:618`; the `_checkFile` transport's `check:${path}` label at `:825` (call spanning `:821-826`, cited `:823-825`); the pass's only `_checkFile` consumer is the marker probe on the repo-relative `docs/_decisions/.consolidation-lock` (`TSPEC:912-919`, `:969-971` — the take path's three seam calls); and `_hashFile` occurs in the TSPEC **exactly once**, at `:439`, inside the `rtDevInjections` member list, with no consumer anywhere — which is precisely the "member of the injection surface … with no consumer" the paragraph claims. The paragraph also names the trigger that would reopen it (a future consumer handed a `_makeTempDir` reply), so the exclusion is dated rather than permanent-by-assertion |

Two further checks on text that changed for reasons other than my findings. The v3 review did not
raise §8's second scoping ground; PM F-07 did, and the correction is the more interesting one this
round. The withdrawn claim was that this feature's widening "puts a second such clause in that same
write prompt", which would have made a whole-file negative red on correct code. That is false, and
the document now says so and shows the work: the widened prompt is stated verbatim at
`TSPEC:425-426`, and its second sentence reads "Do not resolve it **against** the repository root"
— a different string from the tracked `"relative to the repository root"`, which the blockquote
carries exactly once. So the post-widening whole-file count is 1, the count `grep -n` returns today
(single hit, `runtime-adapter.js:805`). The document then does the thing that matters for a test
author: it identifies that count as a **shipped test assertion** — `TSPEC §11.6(e)` conjunct 2, at
`TSPEC:2160`, verified — and forbids reading the entry as a reason to weaken it. A withdrawal that
protects the assertion the withdrawn claim would have licensed dropping is the correct shape, and
it is rarer than it should be.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The new obligation cite is one line short of the sentence it names, in all three places it appears.** §5 domain 1, §5 domain 2 and §11.2 each attribute the obligation conjunct to `TSPEC:2097`. Measured, `TSPEC:2097` is the *partition* parenthetical ("(without this, a call that falls out of the partition is exempt from containment); **containment**"); the obligation clause begins at `:2098` and completes at `:2099` ("**obligation** `obliged ⊆ observed` per domain, on / the Given that obliges it"). §11.2's range cite `TSPEC:2094-2098` has the same off-by-one at the other end: the four-assertion block runs `:2095-2100`, so the range opens on a blank line and closes before the `∅` equalities and the `Set`-not-multiset clause — both of which §11.2 goes on to quote. Nothing substantive is wrong: every transcribed conjunct is correct against the block. But this document's own standard for a pin (§5 domain 2, this round) is a transcription **with provenance whose divergence from the cited row is itself asserted**, and a provenance that lands on the neighbouring assertion is the weaker half of that. Retarget to `TSPEC:2098-2099` for obligation and `TSPEC:2095-2100` for the four-assertion block | §5, DEC-CONS-03 *Testability*, domains 1 and 2; §11.2, DEC-CONS-03 bullet |

## Questions

None. Both v3 questions are answered in the revision, and F-01 above is a cite retarget rather than
an open question.

## Positive Observations

- **F-01 was over-satisfied in the only way that counts.** I asked for one conjunct (obligation) in
  one section (§11.2). The revision added it in three sections and brought the **fourth** assertion
  — partition — with it, which I had not asked for and which is the one that keeps an unclassified
  call from being exempt from containment (`TSPEC:2096-2097`). §11.2 now carries the whole oracle a
  PROPERTIES author inherits, not a summary of it, and says in terms that the two conjuncts it used
  to carry "are not the whole contract, and a property author must not read them as it".
- **The vacuous-pass hazard is named, not just fixed.** Both §5 domains and §11.2 spell out what
  containment alone would have let through — "a pass that issued no invoking-tree `git` call at all"
  — and tie it to the operator-visible loss (the AC-1.3 log commit, `REQ:288`). A property author
  reading the fix understands why the conjunct exists, so a later simplification that drops it is a
  visible regression rather than a tidy-up.
- **§8's withdrawal protects the assertion the false claim would have licensed dropping.** The
  withdrawn ground implied the whole-file count of `"relative to the repository root"` would rise to
  2 after the widening. It does not — `TSPEC:425-426`'s widened prompt carries the tracked string
  once, its second sentence using "against the repository root" — and rather than deleting the
  sentence and moving on, the entry identifies the live shipped conjunct that depends on the count
  (`TSPEC §11.6(e)` conjunct 2, `TSPEC:2160`), states that its falsifying job is the *opposite*
  mistake, and forbids reading the entry as grounds to weaken it. That is the difference between
  correcting a document and correcting the thing the document was about to cause.
- **Q-02 was closed permanently rather than answered locally.** The new §8 paragraph does not merely
  say "no absolute path reaches `rtHashFile` or `_checkFile`"; it cites the consumer census that
  makes it true (`TSPEC:912-919`, `:969-971` for the marker probe; `TSPEC:439` as `_hashFile`'s only
  occurrence, and it really is the only one), and names the trigger to revisit. A future reader does
  not have to re-run my greps to know whether the exclusion still holds.
- **Three rounds of withdrawals are all still on the page.** DEC-CONS-03's §13.1 mis-cite, "no
  mutating git verb at all", "the clone belongs to no verb set", "cited rather than restated", and
  now §8's false second scoping ground — each recorded with what was wrong and why, none overwritten.
  For a decisions document that a PROPERTIES author will mine for oracles, the record of rejected
  formulations is worth as much as the accepted ones: it is the list of oracles that look right and
  are not.

## Recommendation

## Verdict
