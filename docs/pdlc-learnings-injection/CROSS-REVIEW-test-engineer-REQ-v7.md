# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.7)
**Date:** 2026-08-19
**Iteration:** 7 (delta confirmation on the v0.7 erratum; prior round v6 approved at `bc603aa0`)

**Round type.** Delta confirmation over two erratum commits — `c1180acb` (AC-3.3 reproduction locus)
and `91420bbf` (AC-5.1a shipping default) — measured against upstream at HEAD, not only against the
routed item list.

## Routed items — landing status

| Routed item | Landed | Evidence |
|---|---|---|
| AC-1.1/§4.1 vs AC-5.1a disagreed on the shipping default | **Yes** | AC-5.1a now scopes the inert state to an *explicit* `false`; "an absent configuration section is not this state … absent must read as §4.1's declared defaults, which leave `enabled` at `true`". §4.1 still declares `true`. Resolved toward the enabled reading, as directed. Verified at HEAD: `grep -rn learningsInjection` over the repository returns nothing outside this feature's docs, so the premise the AC leans on holds. |
| AC-3.3 placed reproduction inputs in a run-level record while the corpus may move mid-run (raised four ways: pm-review ×2, se-author ×2, te-review) | **Yes, for the inputs it names** | AC-3.3 now claims reproducibility "**per dispatch, not per run**", splits loci explicitly (ordering key value per document → per authoring dispatch; §4.1 thresholds → once per run), and mandates one set-equality completeness test per locus. AC-3.1's hand-off sentence was updated in the same commit ("recorded separately, at the loci and under the closures AC-3.3 names"), so the two ACs no longer contradict. |

Necessary, and — for the inputs AC-3.3 enumerates — sufficient. F-26 below is the part of the
divergent-corpus case the relocation did not reach.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-26 | Medium | Local | AC-3.3 now makes a moving corpus first-class and relocates the *ordering key* to a per-dispatch locus, but AC-3.2's not-selected record — the corpus-membership half of the same reproduction — was not touched and stays scoped to "the same report", with no locus stated. Corpus membership at a dispatch is an input the rule used: if a feature is harvested mid-run, dispatch 1 and dispatch 2 have different eligible sets and different `RSN-*` outcomes, and an operator holding only a run-level not-selected list cannot reproduce dispatch 1. Concretely, the fixture the delta exists to justify — two authoring dispatches, corpus grows between them — cannot be written without asking whether AC-3.2's rows are per dispatch or per run. Per §7.1 this is an oracle/implementability defect, not a scope contest: closable by binding the locus in FSPEC as a named entry obligation rather than by another REQ round. | AC-3.2 / AC-3.3 |
| F-27 | Medium | Local | AC-1.2's byte-identity half enumerates the outside set as "(reviews, implementation, DoD verification and remediation, harvest, ship, advisory seams)", which reads as closed but omits the one dispatch at HEAD that is **tagged `dispatchKind: "authoring"` and falls outside C-1 only on the docType conjunct**: Phase CR's optimizer, dispatched through `reviewLoop` with `docType: null` and the author skill `se-author`. C-1's rule decides it correctly (null ∉ the six), so no oracle is *wrong* — but a test engineer building AC-1.2's byte-identity fixture from the parenthetical will not include the highest-risk dispatch, the one a tag-only implementation would inject into. Name it (or state that the outside set is C-1's complement, and that the parenthetical is illustrative). | AC-1.2, C-1 |
| F-28 | Low | Cross-Feature | §1.2 claim 2 attributes "a fail-open outcome when the listing itself fails" to `DECISIONS-pdlc-consolidation-agent § DEC-CONS-05`. DEC-CONS-05 (`:422-500`) decides *one predicate, two enumerations* and the evidence forms for each half; it says nothing about the unlistable outcome. The `{unlistable: true, detail}` shape is real (`consolidate-learnings.js:1348-1355`) but is recorded in a different entry of that document (`:107`). The claim is true, the authority cited for it is not the one that carries it. | §1.2 claim 2 |
| F-29 | Low | Cross-Feature | Terminology inversion against the cited upstream. DEC-CONS-05 uses **predicate** for the two-region un-consolidated rule (held *equal* by a differential test) and **enumeration** for the `git ls-files` argv (held *pinned*, literally, including both `:(glob)` prefixes). §1.2 claim 2 and C-3 call `LS_FILES_ARGV` "the pass-side definition — the predicate". The mechanism this REQ asks for is the right one (literal restatement plus a pinning test = DEC-CONS-05's enumeration evidence form), and the object is named unambiguously, so the test to write is clear; the word is the upstream's other half. Relatedly, O-7's "DEC-CONS-05 rejected that oracle" is broader than upstream: what was rejected is enumeration **set-equality** (C-3 states this correctly) and the count-message differential — DEC-CONS-05 *ships* a predicate-agreement differential against the `SessionStart` hook. | §1.2 claim 2, C-3, O-7 |
| F-30 | Low | Local | Carried from v6 F-24, untouched by the erratum (which touched only Groups 3 and 5): §1.2 claim 2's "reaching one directory level under `docs/`" is inaccurate on its plain reading for `docs/completed/{feature}/`, which sits two levels down and is reached by the second `:(glob)` pathspec. No oracle depends on the phrase — AC-2.6 states all three depth cases independently and correctly. | §1.2 claim 2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is AC-3.2's not-selected record per authoring dispatch or per run? AC-3.3's per-dispatch reproduction claim needs the former on a divergent-corpus run; AC-3.1's rows are already per dispatch, so per-dispatch is the cheap answer. (F-26) |
| Q-02 | Is AC-1.2's parenthetical the closed outside set, or is the outside set defined as C-1's complement with the parenthetical illustrative? (F-27) |

## Upstream re-verification (this round, at HEAD)

Every load-bearing HEAD claim the REQ leans on was re-measured rather than trusted:

- **`dispatchKind: "authoring"` exists and covers what C-1 says it covers.** Three tagged sites in `orchestrate-dev.js`: the review-loop optimizer (`:7663`, via `runWrapped`), the two erratum sites (`:12821`, `:12915`), and the phase creator (`:13515`). C-1's "creator, optimizer and erratum sites" is exact. The POSTMORTEM write at `:12509` uses the optimizer *skill* through raw `agentFn` with no tag, so it is outside on both conjuncts — consistent with C-1.
- **Phase R has no creator.** `PHASE_DISPATCH` gives Phase R `optimizer: "pm-author"` (`:3633`) and the creator fallback at `:13353` confirms the shape. AC-1.1's refusal to make "six dispatches" the oracle is well-founded.
- **AC-2.6's three depth cases hold against the shipped argv.** `LS_FILES_ARGV` (`consolidate-learnings.js:1338-1346`) is `ls-files --cached --others --exclude-standard -- :(glob)docs/*/LEARNINGS-*.md :(glob)docs/completed/*/LEARNINGS-*.md`. `docs/discarded/{p}/LEARNINGS-*.md` is three segments deep and matched by neither (`*` does not cross `/`) — not selected, not recorded; `docs/discarded/LEARNINGS-*.md` matches the first pathspec — an ordinary member; `docs/completed/{p}/` matches the second. All three as stated.
- **The import-unavailability premise is exact, including the anchor.** `prepack.mjs:20` is `const MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` — the line the citation names, not off by one.
- **The corpus premise behind O-8 holds.** Nine LEARNINGS documents at HEAD (7 under `docs/completed/*`, 2 under `docs/*`), the smallest 18.9 KB. Against §4.1's 6,000 B per document and 20,000 B total, the byte bound binds at three documents and the count cap of 5 is unreachable — exactly the `RSN-COUNT` exercise gap O-8 books, and it is real, not hypothetical.
- **DC-01 and DC-09 resolve.** `docs/_constraints/DOMAIN-CONSTRAINTS.md:20` and `:245`; DC-09 is the REQ-altitude-and-stopping-rule constraint §7.1 pastes, as cited.
- **The AC-5.1a premise holds.** No `learningsInjection` key exists anywhere in the repository at HEAD, so "absent" is the state every consumer is actually in — which is why the erratum's direction (absent ⇒ enabled) is the one that makes AC-1.1 testable at all.

## Positive Observations

- The AC-3.3 rewrite does the hard thing rather than the cheap one: instead of asserting a single
  repository state, it *names the mechanism* by which two dispatches can disagree (a feature
  harvested in flight), then splits the record by locus and puts a completeness test on each. That
  is a testable statement of a genuinely awkward fact, and it closes the same defect five reviewers
  reached from three roles.
- AC-3.1 was edited in the same commit to hand off cleanly ("recorded separately, at the loci and
  under the closures AC-3.3 names"). Two mandated set-equality tests over per-dispatch structures
  could easily have been left to collide — one forbidding a fifth row field, the other adding one —
  and the "alongside AC-3.1's rows" wording keeps them separable.
- AC-5.1a's resolution is the falsifiable direction. Had absent read as inert, AC-1.1 would have
  been vacuous on every repository that exists today, and the whole Group 1 suite would have gone
  green against a feature that never ran. The AC now states the HEAD fact it depends on, so the
  premise itself is checkable.
- AC-5.1b's misspelt-section clause was updated in the same edit to follow the new default
  ("reads as absent, and is therefore the default-enabled state above, not an inert one"). The
  erratum did not leave a stale sibling behind — the usual failure mode of a one-AC fix.
- The negative-space discipline elsewhere in the document remains unusually good for a REQ: AC-2.2
  disclaims rank invariance under directory rename, AC-2.1 disclaims cap equality, AC-4.3 explains
  why comparing live-run verdicts would measure model nondeterminism, and AC-6.2 pins the baseline
  to a pre-feature fixture that the branch under test may not regenerate. Each of these is a
  false-green this suite will not have to discover in production.

## Recommendation

**Approved with minor changes**

Both routed items landed, and the upstream re-read turned up no claim that has drifted from what
HEAD or `DECISIONS-pdlc-consolidation-agent` now says. No High is open: F-26 and F-27 are oracle
and enumeration-precision defects of exactly the kind §7.1's stopping rule directs be carried
downstream as named FSPEC/TSPEC entry obligations rather than revised in place, and F-28–F-30 are
citation precision that changes no test. Blocking count 0 for the second consecutive round.

Carry downstream as entry obligations for FSPEC:

1. Bind AC-3.2's record locus (per dispatch vs per run) and specify the divergent-corpus fixture —
   two authoring dispatches, corpus grows between them, reproduction from the report alone. (F-26)
2. State AC-1.2's outside set as C-1's complement and name Phase CR's `docType: null` optimizer in
   the byte-identity fixture. (F-27)

## Delta-confirmation tags

FINDING: Medium | delta | local | AC-3.2 / AC-3.3 | The delta made a moving corpus first-class and relocated the ordering key per dispatch, but AC-3.2's not-selected record — the corpus-membership input of the same reproduction — was left run-scoped with no locus stated, so the divergent-corpus fixture the delta exists to justify cannot be written from the report alone.
FINDING: Medium | inherited | nonlocal | AC-1.2 / C-1 | AC-1.2's outside-set parenthetical reads as closed but omits Phase CR's optimizer, the one dispatch tagged `dispatchKind: "authoring"` at HEAD that C-1 excludes only on the docType conjunct (`docType: null`, `orchestrate-dev.js:14553-14558`, skill `se-author`) — the highest-risk omission for a tag-only implementation.
FINDING: Low | inherited | nonlocal | §1.2 claim 2 | The fail-open-on-unlistable outcome is attributed to DEC-CONS-05, which decides enumeration/predicate evidence forms and says nothing about it; the shape is carried by a different entry of the same DECISIONS document.
FINDING: Low | inherited | nonlocal | §1.2 claim 2 / C-3 / O-7 | "Predicate" and "enumeration" are used in the inverse of DEC-CONS-05's senses, and O-7's "DEC-CONS-05 rejected that oracle" is broader than upstream, which rejected enumeration set-equality and the count-message differential while shipping a predicate differential against the hook.
FINDING: Low | inherited | nonlocal | §1.2 claim 2 | Carried from v6 F-24: "reaching one directory level under `docs/`" remains inaccurate for `docs/completed/{feature}/`; no oracle depends on it, AC-2.6 states the depth cases correctly and independently.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}
