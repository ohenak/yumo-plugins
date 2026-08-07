# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v3.0)
**Date:** 2026-08-06
**Iteration:** 3
**Scope:** Testing lens only, delta re-review. Baseline for the diff is `2557055` (the commit v2 was
written against); the revision is twelve commits, `f7cc78c`…`15f1ef0`, +229/−77 lines. Prior findings
G-01…G-06 and Q-01…Q-04 are verified for disposition; new findings are drawn **only** from changed
sections. Product framing, architecture choice and prose style remain out of scope.

## Prior findings — disposition

All six v2 findings are **resolved**, and all four v2 questions are answered in the document rather
than in a commit message. Each was checked against the revised text.

| v2 ID | Sev | Disposition | Evidence in v3 |
|----|---|---|---|
| G-01 | High | **Resolved** | §6.5 now enumerates **two** seam domains with a permitted verb set each, AT-Q7 asserts one set-equality **per domain** (PR seam `{read-pr, create-pr}`, git seam `{clone, fetch, create-branch, add, commit, push}`), "multiset" is gone and stated as a set with AT-Q2's three commits named as the reason, and control (a)'s permission appeal is explicitly withdrawn ("`contents:write` alone permits a merge commit … control (b) cannot be derived from this row"). BR-28 carries the per-domain form. The generic-seam direction survives: the spy "classifies by the verb it resolves to rather than by the function name". Two residual scoping defects are new finding H-04 below — the shape is now right |
| G-02 | High | **Resolved** | §2.2 gives steps 12 and 13 a `Terminates` cell; §2.2 adds "**Terminates names a jump, not an exit**" (to step 14, steps 15–16 unchanged); §2.6 adds a six-row observables table distinguishing S-11c from S-11b; §12.1 adds S-11c; AT-M9 constructs it with a routed/unrouted split; §10.2 order 3, §15.1 AC-1.6, §15.2 `failed`, §17's flow and shape-3 paragraph all realigned. One cell of the new observables table is internally contradictory — Low finding H-05 |
| G-03 | High | **Resolved** | AT-Q10 (`enacted` ⇒ nothing appended ∧ `duplicate-suppressed` names the pair and the enacting `passId` ∧ `pr:` empty), AT-Q11 (`absent` ⇒ exactly one append, then **byte-identity** of `DOMAIN-CONSTRAINTS.md` across a re-run), AT-Q12 (a `route: degraded` record must **not** suppress). §15.1 NFR-4 and BR-25 route to them. AT-Q11's byte-identity conjunct is the oracle that fails a never-consults-the-log implementation, which is exactly what was missing. The field these rows write into was not extended with them — Medium finding H-02 |
| G-04 | Med | **Resolved** | §5.2's `{topic}` is now the **whole** `failure-mode-id`; the basename derivation is withdrawn by name with the collapse argued (15 skill directories at HEAD verified, `ls pdlc/skills` → 15); a fourth property row ("Discriminating on the full `artifact`") is added; the path-stability property is honestly demoted to readability ("path stability buys the carrier nothing and is not claimed to"); the convention change and the three hand-named files at HEAD (`DECISIONS-plugin-distribution.md`, `DECISIONS-review-severity-bars.md`, `DECISIONS-test-oracle-mechanics.md` — all verified present) are listed with the SKILL.md:41 edit; AT-R6 updated and AT-R6b added. AT-R6b's second fixture is new finding H-01 |
| G-05 | Med | **Resolved** | §15.3 gains the `pdlc/workflows/orchestrate-dev.js` guard-set row and a bundle-rebuild row; §14.1 T-05 constrains the widening (optional `skill` defaulting to `ADVISORY_RUNG_SKILL`, threaded to the dispatch and the memoised path, exactly one ladder) and answers the deadline question; AT-M10 is the regression test that the omitted-argument call site still dispatches `se-review`. Verified at HEAD: `ADVISORY_RUNG_SKILL = "se-review"` (`pdlc/workflows/orchestrate-dev.js:1797`), `resolveAdvisoryRung({ _agent, _log, _state, prompt })` (`:1833`), the single `_agent` call inside `dispatchAt` (`:1841`), the memoised branch (`:1843-1849`), the `{kind: "preempted"}` race at the shipped call site (`:3130-3134`). The row's artifact count is wrong — Medium finding H-03 |
| G-06 | Med | **Resolved** | AT-F15 is restated over a **constructed** fixture, says in its own row that it is receive-side, and names O-C6 as the carrier of the producing-side gap; §8.4's "both asserted rather than hoped for" is replaced by "the second is asserted by a test; the first is a convention whose **violation** is detected", with AT-F16 named as the detector. Verified: the convention is natural language in `pdlc/skills/harvest-learnings/SKILL.md` — nothing at this layer can assert compliance, which the document now says |
| Q-01 | — | **Answered** | §10.1 row 3 now reads "yes — the status alone", and AT-C3 carries that returned body as its named positive conjunct with the reason spelled out ("the four absences alone are satisfied by a pass that never ran") |
| Q-02 | — | **Answered** | §12.1 S-03 names the bootstrap conjunction (empty datum set ∧ empty consumed set) and resolves it to `no-op`, stating that S-03 and S-05 compose rather than compete |
| Q-03 | — | **Answered** | §8.4 adds "**Open** is a harvest-side filter, and it is deliberately not §8.3's population" — §8.3 emits one row per distinct recorded id, retired included; step 1's filter only bounds the harvest question list, and its own limit (a `retire` on an unmerged PR stays open) is stated with the failure direction ("one extra question, never a missed one") |
| Q-04 | — | **Answered** | §14.4 ER-2 states the shipping assumption: every AT is written against `Version` 1.4, implementation does not wait, and if the row lands the reason-code assertion is **added to** — never replacing — AT-M6/AT-M9's report-body assertion |

## Findings

All findings below are **new**, and every one is inside a section the revision changed. No unchanged
section was re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| H-01 | High | Local | **AT-R6b's colliding fixture asserts an observable that three other sections say cannot occur on that Given, so the row that was added to close G-04 cannot be written as stated.** The Given is "two AC-2.2 promotions **in one pass** … two artifacts that collide under §8.1's slug (`pdlc/skills/a-b.md` and `pdlc/skills/a/b.md`)"; the Then is "the two write **one** file and the collision is reported exactly as §8.1 obliges (`duplicate-suppressed` naming the pair)". Three sections contradict that. (1) §8.2 "Uniqueness, scoped": *within one pass* "two proposals deriving one id under one action … are one failure mode, and are recorded **once**" — a merge, with one `symptom`, not a suppression, so nothing is withheld and there is no second promotion to report. (2) §6.4 defines `duplicate-suppressed` only over a **prior pass's** record ("some prior pass's failure-mode record carries the same pair") or a PR observed `open`/`merged` — neither exists for an intra-pass collision, so a conforming implementation emits no reason code here and AT-R6b is red on correct behaviour. (3) BR-26 and §12.2 P-04 require a suppressed proposal to populate `suppressed-by:`, whose §10.3 grammar is `{id}:{action} → {PR URL}` — an intra-pass merge has neither a PR nor an enacting `passId` to name, so the assertion is unsatisfiable in both directions. §8.1's own collision table is explicit that the cost it prices is the **cross-pass** one ("NFR-4 suppresses a promotion targeting one of the colliding files because a *different* one is already on a PR or in a §6.4 log record"), so "reported exactly as §8.1 obliges" is citing an obligation that does not cover this Given. Either restate AT-R6b's second fixture over §8.2's actual observable (one id, **one** record, one `symptom`, one file — and say whether the merge is reported at all, since today §8.1's cost table promises intra-pass silence), or make the intra-pass collision a first-class reported event with a named field and a §12.1 row. The sibling fixture (first arm) is sound and falsifies the withdrawn derivation — keep it. | §13.4 AT-R6b, §8.2, §6.4, §8.1, BR-26, §12.2 P-04 |
| H-02 | Medium | Local | **The consuming-repo carrier's new ATs write a `passId` into a field whose grammar admits only a PR URL, and no oracle in §13 can catch the mismatch.** §6.4 requires a suppressed consuming-repo proposal to record "`duplicate-suppressed` naming the pair and the `passId` of the record that enacted it, **in place of a PR URL**", and AT-Q10 asserts exactly that third conjunct. But §10.3's field table still reads `suppressed-by:` \| "zero or more `{id}:{action} → {PR URL}` entries", and §12.2 P-04 still reads "a `suppressed-by:` entry naming the `(id, action)` pair and the **open-or-merged PR**". Neither was touched by this revision, which extended §6.4 and §13.5 only. So a test author writing AT-Q10 has to invent the entry's shape (`{id}:{action} → {passId}`? a second field? a prefix?), and AT-L5 cannot catch a wrong choice because `suppressed-by:` is **excluded by name** from the enumerated class it compares. Extend §10.3's grammar row and P-04 to the two-carrier form, and state which alternative an entry carries so AT-Q10's third conjunct has one literal expected value rather than a family of them. | §10.3 (field table), §12.2 P-04, §6.4, §13.5 AT-Q10 |
| H-03 | Medium | Local | **§15.3's new bundle-rebuild row undercounts the generated artifacts the widening touches, and asserts the wrong count in the sentence T-02 then reasons from.** The row names `orchestrate-dev.bundle.js` and `orchestrate-queue.bundle.js` and concludes "the widened resolver's bytes live in **both** artifacts as well as in the source". Verified at HEAD, there are **three** tracked artifacts carrying `resolveAdvisoryRung`: `pdlc/workflows/dist/orchestrate-dev.bundle.js:1994`, `pdlc/workflows/dist/orchestrate-queue.bundle.js:1970` and `pdlc/workflows/dist/pdlc-cli.mjs:1843` — all three are `git ls-files`-tracked and each has its own row in `pdlc/workflows/dist/distribution-manifest.json` (ids `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`), whose sha1 fields therefore change too. The `bundles` array the row cites (`build-runtime.mjs:448-466`) has a **third** entry, `{ file: "pdlc-cli.mjs", id: "pdlc-cli", contents: cliArtifact }` at `:466-470`, and `cliArtifact` is composed at `:291`. The testing consequence is concrete: CI's `Generated artifacts are in sync` job rebuilds and diffs **every** artifact, so a change-manifest that names two of three describes a commit that fails that job, and T-02's question "whether a drift in the widened resolver is one artifact or three" is asked over a count that is already wrong before TSPEC answers it. Correct the row to the three artifacts plus the manifest's three sha1 rows. | §15.3, §14.1 T-02, §2.6 item 2 |
| H-04 | Medium | Local | **AT-Q7's git-seam set-equality is stated over a "permitted" set pooled across both trees, which leaves two ways for it to be red on a conforming pass — the same failure mode G-01 raised, one level in.** §6.5's new table column is headed "Every verb the pass is permitted to issue on it", and AT-Q7 then asserts the observed set is **equal** to it; permitted and obliged are not the same set, and the difference decides the oracle. (a) `fetch` is in the git set with "clone/fetch §6.1" as its obligation, but §6.1's text is "a temporary directory cut from the **fetched** default branch" — a `git clone` fetches, so a conforming implementation may issue `clone` and never a distinct `fetch` verb, and the equality goes red on correct behaviour. (b) The domain is defined as "every call in **either** tree", and the absent-verb list ("every branch operation AC-3.8 forbids in the invoking tree — `checkout`, `switch`, `stash`, `reset`, `rebase`") is then asserted absent from the pooled set — but AC-3.8's prohibition is scoped to the **invoking** tree, and inside the throwaway clone a `git checkout -b` is both permitted and a plausible spelling of `create-branch`. The row's "classifies by the verb it resolves to" mitigates (b) only if the classification is stated, which it is not. Split the git seam by tree (invoking vs clone) with a set per tree, and mark each verb obliged (in the equality) or merely permitted (in a superset bound with a required-subset assertion), so the implementer is not the one deciding which. | §6.5 (seam table), §13.5 AT-Q7, BR-28, §6.1 |
| H-05 | Low | Local | **§2.6's new observables table contradicts itself inside one cell, and the cell is one a test author reads to build AT-M6's and AT-M9's oracles.** The `§10.2 order-3 effectiveness table` row's step-8 column reads: "emitted (steps 10–11 preceded the failure only from step 12 on) — at step 8 the table does not yet exist and is **not** emitted". It opens with "emitted" and closes with "not emitted". The rest of the document is unambiguous and agrees on the negative: §10.2 order 3 ("A pass that terminated earlier has no table to append and appends none: `refused` (step 6) and a step-8 `failed`"), §12.1 S-11b, and AT-M9's own "Distinct from AT-M6, whose Given … has no table and no records to leave behind". Delete the leading "emitted" so the cell reads as the negative it argues for. | §2.6 (observables table) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §8.4 step 1's `open` is now a **mechanical** predicate ("no record for that id carries `action: retire` with a `route` other than `degraded`"), but the party that computes it is the harvest agent, and §13 has no row for it. Is the open-list computation a pass-side function the harvest prompt merely consumes (in which case it is testable here and should have an AT — a landed `retire` closes an id, a `degraded` one does not), or is the arithmetic itself delegated to the agent (in which case say so, as AT-F15 now says of the producing side)? The stated failure direction — "one extra question, never a missed one" — makes this safe either way, which is why it is a question and not a finding. |
| Q-02 | AT-M9's Then asserts "exactly **one** failure-mode record is appended — for the routed proposal, none for the unrouted one". §10.2 order 2 places all failure-mode records at step 13; for that oracle to be constructible the appends must be **per proposal as it routes**, not one batch at the end of step 13. Is that the intent? If so, §10.2's order table should say "one append per promotion, as it routes", since the difference is the whole content of AT-M9's discriminating conjunct. |
| Q-03 | §6.4's `enacted` predicate is keyed on a record whose `route` is "not `degraded`" over the four-member set `constraints` / `decisions` / `PR` / `degraded`. What is the reading when a prior record for the pair carries `route: PR` and the current pass derives the same pair as a **consuming-repo** proposal (the guard-set classification having changed, e.g. after the §15.3 SKILL.md edit moves a path)? The PR carrier would consult the PR's state; the consuming-repo carrier as written reads `enacted` from the record alone. AT-Q10/Q11/Q12 span `constraints` and `degraded` only. |

## Positive Observations

- **Three of the six fixes changed a mechanism rather than an assertion, which is the pattern this
  document has now sustained across two revisions.** G-01 was not answered by narrowing AT-Q7; it was
  answered by *enumerating the two seam domains in §6.5 first* and then writing one equality per
  domain, with the reason the pooled form was wrong stated in the spec ("§5.4, §6.1 and §6.2 all
  oblige git verbs"). G-04 was not answered by adding a collision test; it was answered by replacing
  the derivation, then declaring the convention change and its consequences for the three hand-named
  files at HEAD, then adding the test. G-05 was not answered by editing §15.3's table; T-05 grew the
  constraint (optional, defaulted, threaded to both paths, exactly one ladder) so the widening cannot
  be spelled in a way that breaks the existing call site, and AT-M10 is its falsifier.
- **AT-Q11's byte-identity conjunct is the strongest oracle added in this revision.** "`DOMAIN-CONSTRAINTS.md`
  is **byte-identical** after the second pass to what it was after the first" is the one assertion
  that fails an implementation which never consults the log, and the row says so in its own text
  rather than leaving a reader to infer it. AT-Q12 is its necessary complement — a record's mere
  existence must not suppress — and it is correctly framed as "the consuming-repo mirror of AT-Q4".
- **AT-C3's positive conjunct was added at the right layer.** The fix was not to bolt a call-count
  spy onto four absences; it was to make §10.1 state that a `skipped-cadence` tick returns a body
  carrying the status, so the positive conjunct is a real artefact of the design and not a test-only
  observable. The row then names why it is required.
- **Two overclaims were withdrawn in writing rather than quietly edited.** §8.4 now separates "the
  convention is asserted" from "a violation is detected" and keeps only the second; §5.2 demotes path
  stability from an idempotence mechanism to a readability property and states outright that "path
  stability buys the carrier nothing and is not claimed to". Both cost the document a claim and both
  make the surviving claims testable.
- **ER-2 now answers the question a test author would otherwise have to ask twice.** Naming `Version`
  1.4 as the shipping pin, saying implementation does not wait, and specifying that a landed reason
  code is **added to** the report-body assertion rather than replacing it, means AT-M6 and AT-M9 have
  exactly one shape today and a known delta later.

## Recommendation

**Needs revision**

Every v2 finding and every v2 question is resolved, and three of the six were resolved by changing
mechanism. The approval bar is unchanged, and one High and three Medium findings are open — all four
inside text this revision introduced.

What must change:

1. **H-01** — AT-R6b's colliding fixture asserts `duplicate-suppressed` for an **intra-pass**
   collision, which §8.2 says is a merge recorded once, §6.4 defines only over a prior pass's record
   or an open/merged PR, and §10.3's `suppressed-by:` grammar cannot express. Restate the fixture
   over §8.2's actual observable (one id, one record, one `symptom`, one file) and say whether an
   intra-pass merge is reported at all — or make it a reported event with a field and a §12.1 row.
   The sibling fixture is sound and should stay.
2. **H-02** — extend §10.3's `suppressed-by:` grammar and §12.2 P-04 to the two-carrier form, so
   AT-Q10's "names the enacting `passId`" conjunct has one literal expected shape. `suppressed-by:`
   is excluded from AT-L5's comparison, so nothing else in §13 catches a wrong guess.
3. **H-03** — §15.3's bundle row names two artifacts; three tracked artifacts carry
   `resolveAdvisoryRung` at HEAD (`dist/orchestrate-dev.bundle.js:1994`,
   `dist/orchestrate-queue.bundle.js:1970`, `dist/pdlc-cli.mjs:1843`), each with its own
   `distribution-manifest.json` row. Correct the row and T-02's "one artifact or three".
4. **H-04** — split §6.5's git seam by tree and mark each verb obliged-or-permitted, so AT-Q7's
   equality is not red on a pass that folds `fetch` into `clone` or spells `create-branch` as
   `checkout -b` inside the throwaway clone.
5. **H-05** (Low) — delete the leading "emitted" from §2.6's order-3 cell, which then reads as the
   negative the rest of the document states.

None of the five re-opens a decision this revision settled. H-01, H-02 and H-03 are places where new
mechanism arrived ahead of the field, grammar or manifest it writes into; H-04 is a scoping repair to
text already present.

## Verdict

VERDICT: Needs revision
