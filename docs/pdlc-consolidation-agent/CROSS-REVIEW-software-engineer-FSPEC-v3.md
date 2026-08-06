# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v3.0)
**Date:** 2026-08-06
**Iteration:** 3
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `a7db1b9` (the commit `CROSS-REVIEW-software-engineer-FSPEC-v2.md` reviewed); diff `a7db1b9..HEAD` — 229 insertions, 77 deletions across 12 commits. Only the changed sections were re-read for new issues.

## Prior findings — disposition

Every v2 finding was re-checked against the revision and, where it made a claim about HEAD, against
the code. **All eight are closed as filed.** Two of the repairs, however, introduce new checkable
defects in the sections they rewrote; those are filed below on their own merits, not as reopenings.

| v2 | Verdict | Evidence |
|---|---|---|
| F-01 (High) — the `orchestrate-dev.js` edit was in neither of the two places §2.6 said it was | **Resolved** | §15.3 now carries the row for `pdlc/workflows/orchestrate-dev.js` (naming `:1833`, `:1797`, `:1841`, `:1844-1849`) **and** a second row for the `pdlc/workflows/dist/orchestrate-dev.bundle.js` / `orchestrate-queue.bundle.js` rebuild "in the same commit". Both bundle claims verified: `bundles` at `build-runtime.mjs:448-466` joins `devModule` into *both* artifacts (`[QUEUE_META, BANNER, adapter, devModule, queueModule, QUEUE_ENTRY]` and `[DEV_META, BANNER, adapter, devModule, queueModule, DEV_ENTRY]`). T-05 now constrains the widening — optional, defaulting to `ADVISORY_RUNG_SKILL`, every call site unchanged, exactly one ladder — and AT-M10 is its regression test. §15.3's closing paragraph separates NFR-1 (a **run-time** prohibition on the pass) from the feature's own delivery diff, which is the right distinction and was worth writing down |
| F-02 (High) — AT-Q7's set-equality was red on a conforming pass | **Resolved as filed** | §6.5 now enumerates two seam domains with a set-equality on each; AT-Q7's Given puts each domain behind its own spy and classifies by resolved verb rather than by function name, which keeps the generic-seam coverage the oracle existed for. AT-Q7's own Given ("a pass that opens a PR") makes both equalities satisfiable. The *rule* that generalises it does not carry that scope — filed as F-04 |
| F-03 (High) — `{topic}` contradicted the continuity it claimed | **Resolved as filed** | The basename derivation is withdrawn, `{topic} = failure-mode-id` entire, the convention change is declared with three named consequences, `SKILL.md:41` is added to §15.3, and property row 1's false rationale is replaced by an explicit disclaimer that path stability buys the carrier nothing. Verified at HEAD: 15 skill directories under `pdlc/skills/`; the three decision files are `DECISIONS-plugin-distribution.md`, `DECISIONS-review-severity-bars.md`, `DECISIONS-test-oracle-mechanics.md`; `SKILL.md:41` is the `DECISIONS-{topic}.md` route line. The new derivation is well-formed but is not well-defined over the field it reads — filed as F-01 |
| F-04 (Medium) — the log record did not carry `action` | **Resolved** | §8.1's table is now **seven** fields — `passId`, `action`, `route` added — and the section declares itself **normative for the record's shape**, with §8.2's keying tuple demoted to "a key over these fields, never a second field list". §6.4, §8.4 step 1 and §10.2 order 2 all now point at §8.1. This is the right fix and it is stated in the one place that removes the ambiguity |
| F-05 (Medium) — `enacted` suppressed a promotion that only reached a proposal file | **Resolved** | `enacted` is now conditioned on `route != degraded`; §6.4 argues the conditioning explicitly against the PR route's `closed`-unmerged rule; BR-25 restates the substantive invariant ("a proposal that reached nothing is re-proposable; one that landed is not"); AT-Q12 constructs the degraded record and asserts the re-proposal, and AT-Q10 / AT-Q11 give the `enacted` and `absent` arms. AT-Q11's byte-identity assertion on the second run is the strongest oracle added this round |
| F-06 (Medium) — "open" ranged over an undefined `retired` state | **Resolved** | Step 1 now computes openness from the log alone: open ⇔ no record for that id carries `action: retire` with `route != degraded`. The §8.3 relationship is stated ("openness never filters it"), and the recall limit — a `retire` sitting on an unmerged PR is not observable from the log — is named with its failure direction (one extra question, never a missed one) |
| F-07 (Medium) — §10.3's `credential:` disambiguation was not total | **Resolved as filed** | The status-keyed table is explicitly withdrawn with its counterexamples named, and the reading is re-keyed on the co-occurrence of `credential-unavailable`. AT-K6's Given is widened from two rows to five and BR-41a / E-20b are re-worded to match. The biconditional the new table rests on has one unreachable-by-construction arm that is in fact reachable — filed as F-03 |
| F-08 (Low) — the empty-`reason:` precedent did not exist | **Resolved** | §2.6 withdraws the `skipped-cadence` precedent in terms ("a precedent for nothing about a row's fields") and re-grounds the claim on §10.3's own cardinality rule |

## Findings

All findings below are in sections the revision changed. Nothing unchanged since v2 is re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **`{topic} = failure-mode-id` is circular on the route it governs, and §5.2's worked example routes to the PR route under §5.1's own predicate.** The revision makes `{topic}` the whole `failure-mode-id`, which §8.1 derives from `(phase, artifact)` where `artifact` is "**exactly one canonical repository path** — the single file **the edit touches**" (§8.1 line 1012), a definition §8.2 reinforces in its own words ("'The single file the edit touches' is a requirement, not an assumption", line 1060) and §5.1 routes on ("Every proposal has exactly one **target path** (AC-5.1…). That path decides the route, and nothing else does", lines 522–523; BR-18 repeats it). Two consequences, both fatal as written. (a) **Circularity.** An AC-2.2 promotion's edit touches `docs/_decisions/DECISIONS-{topic}.md`, so `artifact` is that path, so `failure-mode-id = {phase}-docs-decisions-decisions-{topic}-md`, so `{topic}` is defined in terms of itself. The derivation is not total and does not terminate. (b) **The worked example contradicts the routing predicate.** §5.2's example is an AC-2.2 promotion with `artifact = pdlc/skills/se-author/SKILL.md` — a path under `MERGE_GUARD_DEFAULTS`' `pdlc/skills/` member (`orchestrate-dev.js:48-53`, verified), which §5.1 row 1 and BR-19 send to the **PR route**, and which NFR-1 forbids the pass to write in any tree. Yet §5.2's fourth property row asserts "The path is always inside `docs/_decisions/` and never inside a guard-set prefix", and AT-R6 / AT-R6b assert "the route is never the PR route" over that same Given. Under the document's own predicate those tests are red. The two readings of `artifact` are not interchangeable, and the choice has a third consequence nobody has priced: if `artifact` **is** the destination, then every AC-2.1 promotion in one phase slugs to one id (`{phase}-docs-constraints-domain-constraints-md`) and §6.4's `enacted` rule suppresses every domain invariant after the first — AT-Q11 would then be asserting that suppression as correct behaviour. The FSPEC must separate the failure mode's **subject** artifact (the file the failure was observed on, which is what §8.4 step 2's question and §8.5's file-existence predicate both range over) from the proposal's **target path** (the file the write touches, which is what §5.1 routes on), carry both in §8.1's now-normative table, and say which one `failure-mode-id` keys on. | §5.2, §5.1, §8.1, §8.2, AT-R6, AT-R6b |
| F-02 | Medium | Local | **§10.3's re-keyed `credential:` reading is claimed "total by construction" and is falsified by the pass's own new S-11c.** The new table reads `credential: absent` as *attempted-and-found-nothing* iff the row carries `credential-unavailable`, and grounds totality on a biconditional: "§6.3 and §7.3 require every attempted-and-empty resolution to record `credential-unavailable`, and vocabularies §1's composition rule makes that code unavailable on every row the second arm names." Both halves cannot hold at once on one reachable path. §7.2 (as revised) resolves the credential "**at its first §6 PR-route attempt**", which is step 13; §12.1 S-11c and AT-M9 construct a pass whose step-13 dispatch fails **after** it had already routed one proposal. So: proposal 1 takes the PR route, resolution finds nothing (§7.3 obliges `credential-unavailable`), proposal 2's authoring dispatch returns `{kind: "dispatch-error"}` and the pass terminates `failed`. `credential-unavailable` is permitted by vocabularies §1 only with `promoted-degraded` and `no-op` (verified) — so the row cannot carry it, and §10.3 reads it "not attempted", which is false; §7.3's obligation is simultaneously unsatisfiable, and recording the code anyway breaches REQ §4b's set-equality (AT-L5 would fail). AT-K6's row (iii) pins the wrong reading explicitly: it asserts a step-12/13 `failed` row carries no `credential-unavailable` and *is* not-attempted. Decide it: either the resolution is moved to a point that cannot interleave with a terminating dispatch, or the case is named in §10.3 as a third reading, or a fourth erratum asks vocabularies §1 to permit the code with `failed`. As written the "boolean, so total by construction" claim is the same shape of over-claim v2 F-07 rejected. | §10.3, §7.2, §7.3, §12.1 S-11c, AT-K6, AT-M9 |
| F-03 | Medium | Local | **§10.2 order 3's new emission condition contradicts §8.3's unrevised opening sentence, and the negative arm has no test.** Order 3 now reads "every pass that **reached step 11**… A pass that terminated earlier has no table to append and appends none: `refused` (step 6) and a step-8 `failed` (§12.1 S-09, S-11, S-11b)". §8.3 line 1092 still reads "**Every pass that emits a report** emits this table over every promotion recorded in prior passes" — and a `refused` pass and a step-8 `failed` pass both emit a report (§10.1, §12.1 S-09/S-11/S-11b all carry one log row and a report). AC-5.2 traces to §8.3, so the section an implementer reads for the table's obligation is the one that is now wrong. Compounding it, nothing falsifies the new arm: AT-M9 asserts the table **is** appended for S-11c and its prose distinguishes AT-M6 as having "no table … to leave behind", but AT-M6's own Then never asserts the absence, and no AT covers a `refused` pass's log at all. Per the paired-oracle rule, the added negative needs an assertion on the same path — a `refused`/step-8-`failed` row whose log carries the terminal row **and no effectiveness table**, alongside the positive AT-M9 already gives. Re-word §8.3's lead sentence to §10.2's condition and add (or extend) the AT. | §8.3, §10.2 order 3, §12.1 S-09/S-11/S-11b, AT-M6, AT-M9 |
| F-04 | Medium | Local | **BR-28 and §6.5 control (b) generalise AT-Q7's set-equality past the Given that makes it satisfiable.** AT-Q7's Given is "a pass that opens a PR", under which both equalities hold. BR-28 carries no such scope: "Over each of §6.5's two enumerated seam domains, the pass's observed verb **set** is set-equal to that domain's permitted set — `{read-pr, create-pr}` on the PR seam, `{clone, fetch, create-branch, add, commit, push}` on the git seam". A pass with no guard-set proposal — S-02, S-05, S-06, S-08, the *common* shape, since §5.1 sends `DOMAIN-CONSTRAINTS.md` and `DECISIONS-*` writes to the consuming-repo route — opens no PR and cuts no clone, so it observes `∅` on the PR seam and `{add, commit}` on the git seam. Both equalities are false on a conforming pass. The §6.5 table's own header says "Every verb the pass is **permitted** to issue on it", which is a containment bound, so the section states two incompatible relations three lines apart. This matters because BR-28 is the row a PROPERTIES author lifts into a universal property; the predictable outcome is a red property and then a loosening, which is how v2 F-02's absence-only weakness comes back. Repair: state the rule as *observed ⊆ permitted, universally* (still strong — every merge verb §6.5 enumerates is outside the permitted set, so containment falsifies a merge) *and* set-equal to the permitted set for a PR-opening pass, which is AT-Q7's Given. | §6.5, BR-28, AT-Q7 |
| F-05 | Low | Local | **§12.1's `Log row` column changes meaning in the S-11c row.** Every other row counts terminal rows only — S-02 promotes and appends failure-mode records and the effectiveness table, and its cell still reads "one". S-11c's cell reads "one, **plus** the §8.3 effectiveness table and one failure-mode record per already-routed proposal". Both are true; only one is the column. Since §12.1 is the table a test author enumerates scenarios from, a column that means "terminal rows" in fourteen rows and "everything appended" in the fifteenth invites a wrong oracle. Put the extra detail in the Scenario cell or add a column. | §12.1 S-11c |
| F-06 | Low | Local | **Two presentation defects in changed text.** (a) §5.2 lines 570–573 do not parse: "every `SKILL.md` in the repository collapses to one file — `pdlc/skills/se-author/SKILL.md`, `pdlc/skills/dod-verify/SKILL.md` and `pdlc/skills/te-review/SKILL.md` — fifteen skill directories at HEAD — are one file named for a phase letter and an extension." The facts are right (15 directories under `pdlc/skills/`, verified) but the sentence has two nested dashes and no main verb agreement. (b) §13.5 now runs AT-Q7, AT-Q7b, AT-Q8, AT-Q10, AT-Q11, AT-Q12, **AT-Q9** — the three new rows were inserted ahead of AT-Q9 rather than after it. Harmless to a machine, confusing to a reader diffing the table against §15.1. | §5.2, §13.5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(carried from v2, still open — the only one of the four the revision does not answer.)* AT-M7 requires the `ADVISORY_MODEL_FALLBACK:` line **verbatim** in the report body, and §10.4 item 2 requires it too. The resolver emits that line through `_log` (`orchestrate-dev.js:1858-1860`, the template literal at `:1859`), never in its return value, so the pass must capture its own log stream to satisfy either. §14.1 still has no row for that capture: T-04 covers "the injected seams for file IO, git and the PR API" and T-05 now covers the widening and the deadline, but nothing names `_log`. Does the same capture obligation extend to §2.6 row 4's "error's message surfaced verbatim in the report body" (AT-M6, AT-M9)? Both are report-body assertions on text the pass does not otherwise hold. |
| Q-02 | §8.4 step 1's open-promotion filter closes an id only on a **landed** `retire`. Since `retire` targets the promotion's `artifact` and a `retire` of a guard-set artifact routes to the PR route (§5.1), landing it requires an operator to merge that PR — so on this repo the filter closes essentially nothing, and the question list still grows monotonically with every pass (v2 Q-04's concern, now sharper rather than answered). §8.4 acknowledges the recall direction is safe; it does not bound the cost. Is a recency window or a cap intended before the harvest prompt's question list dominates every Phase H, or is the growth accepted and worth an O-C row of its own? |
| Q-03 | §15.3's new bundle row says the widened resolver's bytes "live in both artifacts as well as in the source", which is right — but `pdlc/workflows/dist/distribution-manifest.json` carries a sha1 per artifact, so the rebuild changes **three** manifest rows (both bundles plus the new consolidation bundle), not one. The manifest appears only in the older `build-runtime.mjs` row, whose Change cell reads "the new bundle's build entry and manifest row" (singular). Is that intentional shorthand, or should the row say the manifest is re-stamped for every artifact the rebuild touches? T-02 is the obligation that inherits the answer. |

## Positive Observations

- **Every code citation added this round is exact, and I re-verified all of them at HEAD.**
  `ADVISORY_RUNG_SKILL = "se-review"` is `orchestrate-dev.js:1797`; the export's signature is `:1833`;
  the single `_agent(ADVISORY_RUNG_SKILL, prompt, { model })` inside `dispatchAt` is `:1841`; the memo
  short-circuit begins `:1844`; the shipped call site is `:3132` with the deadline race at `:3133`.
  `build-runtime.mjs:448-466` really is the `bundles` array, and `devModule` really is joined into
  both bundle artifacts. `consolidate-learnings/SKILL.md:40` and `:41` are the two consuming-repo
  route lines. 15 skill directories; 3 hand-named `DECISIONS-*.md`. Nothing was asserted about the
  codebase that the codebase does not say.
- **T-05 is now the model of what an obligation row should look like.** It constrains the widening
  where it must be constrained (optional, defaulted, threaded to *both* the dispatch and the memoised
  path, exactly one ladder) and hands TSPEC only the spelling — and it answers v2 Q-02 in the same
  row by ruling that the pass calls the resolver **bare**, which is what makes §2.6's "rows 1–4 are
  set-equal to the resolver's return and throw set" true rather than approximately true. Recording
  that `{kind: "preempted"}` is the *call site's* shape and not the resolver's is the precise form of
  the distinction.
- **AT-Q11's byte-identity assertion is the strongest oracle added this round.** "`DOMAIN-CONSTRAINTS.md`
  is byte-identical after the second pass to what it was after the first" fails exactly the
  implementation that never consults the log — which no containment or presence check would catch —
  and it is paired with AT-Q10's three-conjunct positive so that suppression cannot be confused with
  never having derived the proposal. AT-Q12 completes the trio by mirroring AT-Q4's closed-unmerged
  rule onto the consuming-repo carrier, so the two carriers now agree on a stated invariant rather
  than by coincidence.
- **Two claims were withdrawn against the document's own interest.** §8.4 withdraws AT-F15's
  producing-side range — "the producing side … is an LLM invocation with no reproducible output, is
  therefore untestable here, and is carried as O-C6 rather than claimed by this row" — and demotes the
  never-invented-id property from an assertion to a convention *whose violation is detected*. §2.6
  withdraws the `skipped-cadence` precedent outright. Both are downgrades of the document's own
  strength, made because they were false, and both are marked as withdrawals so a later reader cannot
  mistake the earlier claim for a live one.
- **§2.2's "Terminates names a jump, not an exit" paragraph removes a whole class of future
  ambiguity.** Stating once that a terminating branch goes to step 14 and that steps 15–16 still run —
  and naming the single exception (step 4's `skipped-cadence`, which took no marker and has nothing to
  release) — is what lets S-11c's observable table be a *diff* against S-11b rather than a restatement.
  §17's shape-3 note carries the same rule to the flow view instead of leaving the two views to drift.
- **§8.1's "this table is normative for the record's shape" is the durable fix, not the local one.**
  The v2 defect was one missing field; the repair names an authority and re-points three readers at
  it, which is what stops the next field from going missing the same way. The `passId` / `action` /
  `route` rows are each annotated with *which contract reads them*, so a future editor deleting one
  can see what breaks.

## Recommendation

**Needs revision**

All eight v2 findings are closed as filed — this is the second consecutive round where every prior
finding was addressed rather than argued with, and the two repairs that needed to choose a harder
path (widening the resolver signature; withdrawing the basename derivation) chose it. What remains is
one High and three Mediums, three of which are defects *created by* this round's repairs.

1. **F-01 — decide what `artifact` is before `{topic}` can be derived from it.** As written the
   derivation is circular on the AC-2.2 route, §5.2's worked example routes to the PR route under
   §5.1's own predicate, and AT-R6 / AT-R6b are red. Separate the failure mode's subject artifact from
   the proposal's target path, carry both in §8.1's normative table, and state which one keys the id.
   Check the AC-2.1 consequence while you are there: if the id keys on the destination, every domain
   invariant in one phase shares one id and NFR-4 suppresses all but the first.
2. **F-02 — the `credential:` biconditional is not total.** A step-13 dispatch error after a PR-route
   attempt that resolved nothing produces a `failed` row that must and cannot carry
   `credential-unavailable`. Name the case, move the resolution, or route a fourth erratum — but do
   not leave AT-K6 row (iii) asserting a reading that path falsifies.
3. **F-03 — reconcile §8.3's lead sentence with §10.2 order 3**, and give the new negative arm an
   assertion on the same path as AT-M9's positive.
4. **F-04 — scope BR-28's set-equality** to a PR-opening pass and state the universal rule as
   containment in the enumerated permitted set, which is still strong enough to falsify a merge.

F-05 and F-06 are corrections of record, not blockers.

Nothing above contests the REQ's scope or the document's structure. §14.4's three errata are
unchanged and remain correctly routed; ER-2's new shipping-assumption paragraph — implementation does
not wait on the erratum, and the report-body assertion is never dropped if the row lands — is exactly
the note a test author needed.

## Verdict

One High finding (F-01) and three Medium (F-02, F-03, F-04) are open, plus two Low (F-05, F-06).
Per the approval rule — any High or Medium finding means the document is not approved — this
iteration does not approve `FSPEC-pdlc-consolidation-agent.md`.

VERDICT: Needs revision
