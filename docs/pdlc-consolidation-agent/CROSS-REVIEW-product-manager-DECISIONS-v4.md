# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 4
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `6e66b256..HEAD` — three document commits: `6034f0fb` (withdraw DEC-CONS-06's false
second scoping ground; record the `rtHashFile` / `_checkFile` exclusion), `ed050777` (DEC-CONS-03
domains 1 and 2 — add the obligation conjunct, restate domain 2's pin as transcription-with-
provenance), `61f11478` (§11.2's DEC-CONS-03 row — carry all four set assertions, not the
containment half alone). I read my v3 cross-review, ran
`git diff 6e66b256..HEAD -- docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`,
and confined this pass to the changed spans plus my one open v3 finding.

Changed spans: §5 (DEC-CONS-03) domain 1's closing sentence and domain 2's whole body; §8
(DEC-CONS-06)'s read-prompt-scoping bullet and the new exclusion paragraph that follows it; §11.2's
DEC-CONS-03 row. Everything else is untouched and not re-litigated — DEC-CONS-01 and its residual,
DEC-CONS-02, DEC-CONS-03 domain 3, DEC-CONS-04, DEC-CONS-05, DEC-CONS-07, §7, §10, §11.1, §11.3.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-07 | Medium | **Resolved, and past what I asked** | I asked for the false second scoping ground to be struck or corrected. The revision does both and adds the guard I did not ask for. The clause is withdrawn **by name and with its direction stated** — "that is withdrawn as false, and it pointed the opposite way from what the feature ships" — the true post-widening count is given (`TSPEC-…:425-426` contains `relative to the repository root` exactly once; the second sentence reads "against the repository root"), the count today is re-measured in the document (`grep -n` ⇒ the single line `runtime-adapter.js:805`), and `TSPEC §11.6(e)` conjunct 2 is named as a **shipped test assertion** with its falsifying job restated. The added sentence "Nothing in this entry may be read as a reason to weaken or drop that conjunct; it is the only falsifier this feature has for the read/write harmonisation mistake §5.6(a) exists to prevent" closes the exact failure path my finding described. I re-verified every fact: `grep -n 'relative to the repository root' pdlc/workflows/runtime-adapter.js` returns **only** `805:` (`runtime-adapter.js:805`); `TSPEC:425-426` is quoted verbatim; `TSPEC:2160` is conjunct 2 and reads as the document says. |
| Q-04 / Q-05 / Q-06 | — | Still open, still not findings | None is answered here and none needs to be: Q-04 is PLAN sequencing, Q-05 a release-note suggestion, Q-06 an oracle-ownership question for PROPERTIES. Carried forward unchanged. |

## Verification of the changed sections

Every new claim, `file:line`, and measurement in the three commits was re-run against HEAD.

- **The withdrawn DEC-CONS-06 ground and its replacement facts** — verified as recorded under F-07
  above. The surviving positive ground (the cwd sentence occurs three times: `:374`, `:618`, `:911`)
  is unchanged from v3, where I verified it; the revision correctly now leans the scoping of **both**
  arms on that one ground.
- **The new exclusion paragraph is accurate on every part.** `rtHashFile` is declared at
  `pdlc/workflows/runtime-adapter.js:613` and its prompt line
  `Run this exact command from the repository root and report its output:` is at `:618`. The
  `_checkFile` transport's prompt is `:823-825` (`Run this exact command …` / the `test -f … && test
  -s …` line / `Return ONLY one word: OK, EMPTY, or MISSING.`) and its label `check:${path}` is at
  `:826`. Neither is a read prompt in DEC-CONS-06's sense.
- **"No absolute path reaches either one in this feature" holds at the TSPEC.**
  `grep -n '_hashFile' TSPEC-…` returns exactly **one** line, `:439` — the `rtDevInjections` member
  list of §5.6(b) (`:437-441`) — so the seam has no consumer, as the document says. `grep -n
  '_checkFile'` returns `:169, :241, :362, :372, :378, :438, :912, :915, :919, :969, :971, :1836,
  :2013, :2324, :2326, :2446, :2454`; every consumer-side occurrence is the marker probe on
  `docs/_decisions/.consolidation-lock` (`:912-919` is the `present ≡ (await _checkFile(markerPath))
  .ok === true` decision; `:969-971` is the observe-then-write ordering) and the rest are the seam
  list, the doubles, and register rows. The marker path is repo-relative. The exclusion is sound at
  this feature's spec, and naming the revisit trigger ("a future consumer that hands either of them
  a `_makeTempDir` reply") is the right form — it is not a silent omission.
- **Domain 1's obligation conjunct is the right conjunct, and it closes a real hole.**
  "Containment alone would be vacuously satisfied by a pass that issued no invoking-tree `git` call
  at all" is exactly true of `observed ⊆ permitted`, and the AC-1.3 log commit (`REQ:288`) is what a
  vacuous pass would silently drop. `TSPEC` does oblige this: "**obligation** `obliged ⊆ observed`
  per domain, on the Given that obliges it" — see F-08 for the one-line citation slip.
- **Domain 2's withdrawal is honest and the replacement form is the one the document already uses
  elsewhere.** The prior text said the clone verb set was "cited rather than restated"; the same
  sentence did restate it inline, so the self-correction is factually right. The replacement —
  "transcription with provenance", hardcode *and* cite — is the same form as §7's `CORPUS_GLOBS` pin
  (`DECISIONS:524`: stated over the *declaration*, never a line number) and §9's six terminal
  statuses (`DECISIONS:714`, citing
  `docs/_constraints/pdlc-consolidation-vocabularies.md:38-43`), so the analogy the document draws
  is real, not decorative.
- **§11.2's DEC-CONS-03 row now carries the whole oracle, and says why the half it used to carry was
  insufficient.** "Containment plus an absent-always negative are both satisfied by a pass that
  issues *no* invoking-tree `git` call at all — i.e. by a regression that silently drops the AC-1.3
  log commit" is correct, and it is the product-visible failure (`REQ:288`, AC-1.3) rather than an
  abstract one. The obliged sets it names — `add`, `commit` in the invoking-tree domain; `clone`,
  `create-branch`, `add`, `commit`, `push` in the clone domain — are set-equal to `TSPEC:1619`'s and
  `:1620`'s obliged columns, which I transcribed and checked at v3. "Comparison is over a `Set`,
  never a multiset" matches `TSPEC:2100`.
- **No regression against the v3 resolutions.** `grep -n "Q-0\|reviewer Q"` over the document still
  returns nothing, so F-05 stays resolved; §2's DEC-CONS-01 provisional marker (F-06) and
  DEC-CONS-06's two-member read-prompt oracle (F-04) are untouched by these three commits.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
