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

Two Lows, both citation-precision defects in spans this revision added. My v3 Medium is resolved and
I found no substantive new issue in the changed spans — no assertion is lost, no claim is false, and
nothing I approved earlier is weakened.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-08 | Low | Local | **The obligation conjunct is cited one line short in all three places it appears.** DEC-CONS-03 domain 1, domain 2 and §11.2's row each cite `TSPEC:2097` for "`obliged ⊆ observed` per domain, on the Given that obliges it". `TSPEC:2097` reads "(without this, a call that falls out of the partition is exempt from containment); **containment**" — the partition rationale and the start of the *containment* conjunct. Obligation is at `TSPEC:2098-2099`: "…universally; **obligation** `obliged ⊆ observed` per domain, on \| the Given that obliges it". The transcription of the conjunct itself is exact; only the anchor is off. It matters because this document is the one that hands the conjunct to the PROPERTIES author, and the author will follow the anchor: landing on the containment clause is precisely the conjunct §11.2 has just finished saying is *not* sufficient. Fix: cite `TSPEC:2098-2099` in all three places. | AC-1.3, REQ:288 |
| F-09 | Low | Local | **§11.2 mislabels the fourth of the four set assertions, and states one `∅` equality where the TSPEC obliges two.** The row says "The oracle is **four** set assertions at `TSPEC:2094-2098` … the third is **obligation** … The fourth is **partition** (`TSPEC:2095-2096`)". `TSPEC:2095-2100` enumerates them in this order: partition (**first**), containment (second), obligation (third), "and the two `∅` equalities of AT-Q7c" (**fourth**). So partition is not the fourth, and the assertion the TSPEC calls fourth — AT-Q7c's *two* `∅` equalities, one per domain — appears in §11.2 only as the single invoking-tree "no argv carries a verb from that row's absent-always column". The clone domain's absent-always `∅` (every merge verb) is stated in §5 domain 2 but not carried into the property list. The cited span is also short at both ends: `:2094` is blank and `:2098` stops mid-sentence, so a reader following it sees three of the four. No assertion kind is lost, and the clone-domain `∅` is implied by containment against `:1620`'s permitted set, which is why this is Low and not Medium — but the enumeration is presented as complete and set-equal to the TSPEC's, and it is neither. Fix: cite `TSPEC:2095-2100`, order the four as the TSPEC does, and state the absent-always negative for **both** domains. | AC-3.8 |

## Questions

| ID | Question |
|----|---------|
| Q-04 | *(carried unchanged from v2/v3, still unanswered and still not a finding against this document.)* §11.3 item 3 is a functional gap as well as a documentation one: if the credentialed push cannot reach `git` by shell expansion and the module may not hold the value, AC-4.2's `present (redacted)` path has no shipped mechanism until the TSPEC picks a lane. Does the PLAN need the erratum answered **before** the task that implements `rtEnvPresent` and the push? |
| Q-05 | *(carried unchanged.)* DEC-CONS-04's observability paragraph names a forensic signature — two `.consolidation-log.md` records with distinct `passId`s carrying the same `(failure-mode-id, action)` key — that nothing computes. Should it appear in the operator-facing release note beside the drift-gate row §11.1 already flags? |
| Q-06 | *(carried unchanged from v3.)* `REQ:288` obliges a **pathspec** on both invoking-tree calls and explicitly rejects `commitPaths`' bare `git commit -m` shape. The new obligation conjunct asserts the two verbs are *observed*, which is a real strengthening, but a verb-level observation still cannot see the pathspec. Which oracle owns the pathspec — an AT in the register, or an argv-shape assertion like domain 3's? I would rather that be settled before PROPERTIES than discovered at DoD. |

## Positive Observations

- **The withdrawal of the false ground is the strongest thing in this revision, and it is the third
  such self-correction in this document.** It names the clause, calls it false, states which
  direction it pointed ("the opposite way from what the feature ships"), re-measures the count in the
  document itself, and then adds a guard I did not ask for — "Nothing in this entry may be read as a
  reason to weaken or drop that conjunct". My finding was that a PROPERTIES author had a documented
  reason to weaken `TSPEC §11.6(e).2`; the revision does not merely remove the reason, it leaves a
  standing instruction not to. That is the difference between patching a review finding and closing
  the failure mode behind it.
- **The obligation conjunct is a product finding dressed as a testability one, and the document says
  so.** "Containment alone would be vacuously satisfied by a pass that issued no invoking-tree `git`
  call at all" identifies a green-on-broken oracle whose operator-visible consequence is the AC-1.3
  log commit silently disappearing (`REQ:288`). §11.2 states that consequence in those terms rather
  than in set-theory terms, which is what makes it legible to whoever writes the property. This is a
  paired positive on the same path — the exact shape §11.2's own preamble demands — arriving without
  a reviewer having to ask for it.
- **The `rtHashFile` / `_checkFile` exclusion is recorded as a decision with a revisit trigger, not
  as silence.** "Deliberately outside this oracle — permanently, not by oversight", the evidence for
  why (`_hashFile` has no consumer at `TSPEC:439`; `_checkFile`'s only consumer is a repo-relative
  marker probe), and the condition that would reopen it ("a future consumer that hands either of them
  a `_makeTempDir` reply"). A set-equal oracle that excludes members is only trustworthy if the
  exclusions are enumerated and dated; these are.
- **Domain 2 withdrew a claim about its own rigour rather than a claim about the code.** "Cited
  rather than restated" was a statement about the *form* of the assertion, and it was wrong about a
  sentence sitting three words away. Catching that is harder than catching a wrong line number, and
  the replacement — transcription-with-provenance, aligned to §7's and §9's existing pins — makes the
  document internally consistent about how it pins enumerated sets, which is a durable win beyond
  this entry.

## Recommendation

**Approved with minor changes**

My v3 Medium (F-07) is resolved, and resolved past what I asked. Nothing in the three changed spans
broke anything I approved earlier: DEC-CONS-06's decision, its two-prompt scoping and its positive
arms survive on the ground I verified at v3; DEC-CONS-03's three domains still transcribe
`TSPEC:1619`/`:1620` set-equally, now with an obligation conjunct that strictly strengthens them;
§11.2's row gained assertions and lost none. Every new `file:line` and every new measurement I could
check verified — including the two greps the document performs on itself.

Two Lows remain, both citation precision in newly added text, neither changing any decision:

1. **F-08** — cite `TSPEC:2098-2099` (not `:2097`) for the obligation conjunct, in all three places.
2. **F-09** — §11.2: cite `TSPEC:2095-2100`, order the four assertions as the TSPEC orders them
   (partition is the first, not the fourth; the fourth is AT-Q7c's two `∅` equalities), and state the
   absent-always negative for the clone domain as well as the invoking-tree one.

Both are safe to fold into the next authoring pass on any other business; neither justifies a round
of its own, and by the approval rules Lows alone do not block. I am **not** asking for changes to
DEC-CONS-06's decision, scoping, positive arms or new exclusion paragraph, to DEC-CONS-03's domains,
or to any unchanged entry.

No upstream errata leave this review. The two TSPEC errata I raised at v2 (`rtShellQuote`
single-quoting every `_git` argv element; `TSPEC:1325`'s unqualified "structural" non-disclosure row)
remain open and are already routed; I do not re-emit them. F-08 and F-09 are defects of **this**
document — `TSPEC:2095-2100` and `§11.6(e).2` are correct and mutually consistent; it is DECISIONS
that points at them imprecisely.

## Verdict

VERDICT: Approved with minor changes
