# LEARNINGS — pdlc-review-loop-hardening

| Field | Detail |
|---|---|
| Feature | pdlc-review-loop-hardening |
| REQ | docs/pdlc-review-loop-hardening/REQ-pdlc-review-loop-hardening.md |
| Date Completed | 2026-07-30 |
| Total Iterations | REQ: 5 (never converged — see §1), FSPEC: 5, TSPEC: 5, PLAN: 5, PROPERTIES: 5, CODEBASE: 2, IMPL: 1 |
| Upstream | REQ → FSPEC → TSPEC → PLAN → PROPERTIES → IMPL |
| Harvested from | CODE_REVIEW-pdlc-review-loop-hardening-v1.md; CROSS-REVIEW-product-manager-PLAN-v1..v5.md; CROSS-REVIEW-product-manager-PROPERTIES-v1..v5.md; CROSS-REVIEW-product-manager-TSPEC-v1..v5.md; CROSS-REVIEW-software-engineer-CODEBASE-v1..v2.md; CROSS-REVIEW-software-engineer-FSPEC-v1..v5.md; CROSS-REVIEW-software-engineer-PROPERTIES-v1..v5.md; CROSS-REVIEW-software-engineer-REQ-v1..v5.md; CROSS-REVIEW-test-engineer-FSPEC-v1..v5.md; CROSS-REVIEW-test-engineer-PLAN-v1..v5.md; CROSS-REVIEW-test-engineer-REQ-v1..v5.md; CROSS-REVIEW-test-engineer-TSPEC-v1..v5.md (52 cross-reviews + 1 DoD code review = 53 files, all deleted by this harvest). Also read and **retained**: POSTMORTEM-R-pdlc-review-loop-hardening.md (it carries no `RESOLVED:` marker, so it is still live state, not a harvestable artifact). |
| DoD rounds | 1 (CODE_REVIEW-…-v1 only; Definition of Done recorded as MET at HEAD f093c14, four Low findings, none blocking) |

## 1. Non-Convergences

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| R (REQ) | software-engineer + test-engineer | **The only true non-convergence.** Blocking findings went **11 → 6 → 6 → 7 → 9** (Highs 4 → 1 → 1 → 1 → 3) while the REQ grew 330 → 1,398 lines (25.9 KB → 165.3 KB). Per-round resolution was 5/5, 5/5, 6/6, 5/5 — the author closed essentially every finding every round and the count still rose. `POSTMORTEM-R` names three root causes: (i) each fix added mechanism, and mechanism at REQ altitude is itself reviewable surface; (ii) the two reviewers were independent and non-overlapping, so each round drew two fresh finding streams; (iii) the review contract had no **altitude gate**, so implementation-level defects (runtime globals, dispatch counters) were litigated inside a *requirements* document. | Loop exhausted its rounds, wrote `POSTMORTEM-R-…md` and halted. Unblocked by an **operator-directed convergence pass on REQ v1.5**, recorded in a `## Resolution (2026-07-29, operator-directed)` section appended to the POSTMORTEM; the REQ closed without a sixth review round and the pipeline proceeded to Phase F. **The POSTMORTEM carries no `RESOLVED:` marker of any form** — not `yes`, not `no`. Per the documented lifecycle, Phase R would still fail closed on this file. It is deliberately **not deleted by this harvest**. | 5 (limit) |
| F (FSPEC) | software-engineer + test-engineer | Converged, but only at the last round, and the migration is the lesson: one defect around §1.2 rule 5 moved sites every round — v1 gate-ordering contradiction + undefined tier-1 `recordedHash`; v2 the `APPROVAL-HASH:` whole-file scan; v3 F-15's "and the bare-identifier forms" re-admitting the substring gate; v4 the fenced-block-as-*body* ambiguity, which the v1.4 changelog itself calls "a regression introduced by v1.3's own widening". | Dual `Approved` at v5. Blocking trajectory **15 → 6 → 2 → 1 → 0**, no High after round 2. Cost recorded at v5: +0.33% normative / +0.57% total on a ~260 KB document. | 5 |
| T (TSPEC) | product-manager + test-engineer | PM **approved at v3 and then filed Needs revision at v4** — unusual, and correctly done. The round-3 revision that closed TE's N-01 introduced `present: Map \| null` and a fixture (`AT-43a` case (b)) that **pinned as normative** a mid-loop `ListFailure` which does not halt, contradicting the approved FSPEC §3.3 "every caller halts" contract. PM owned the earlier miss in writing and justified re-opening on the grounds that v1.3 *newly pinned* the behaviour with a test rather than leaving it ambiguous prose. | v1.4 took PM's option (a) — the mid-loop failure halts; `Map \| null`, `kept`, rule 4's null bullet and the exception all deleted. The revision was **−25 B, the first not to grow**. Dual approval at v5. | 5 |
| P (PLAN) | product-manager + test-engineer | One defect in three costumes: (1) **the same derived count wrong three times** — non-`await`ed thirteen-name call sites stated as one (v1.1), three (v1.2), five (v1.3), restated *normatively in four sections* with no owner, so each round repaired copies rather than the cause; §4.1's copy was **blocking**, so `H-e` would have halted the plan at batch 1 on a false count. (2) Each fix opened the next: the v1.6 combinator ruling that fixed a false positive opened a false negative (`Promise.race`/`Promise.any` do not await every element); the replacement mechanism could then "green a defect *by finding nothing*" (total classification over the empty set is vacuously true). (3) `RLH-LOOP-03`'s span rule resolved `reviewLoop` to `:532–542` because the next column-0 `}` is `}) {`, leaving `:543–669` — precisely the region it forbids — unguarded. | The count closed only when v1.3 **deleted three copies and demoted the fourth to advisory**, converting the gate from an equality over an output to a predicate over the procedure. TE-PLAN-v5 later proved the "three" had been *correct output from a contradictory contract*: the same scanner yields 24/3 under TSPEC v1.6's alias phrasing and 35/5 under v1.7's. Round 5 closed all four residuals in four one-clause edits (8 hunks, +82/−7); both reviewers independently re-implemented the scanner and reproduced 35/5/0. | 5 |
| PR (PROPERTIES) | product-manager + software-engineer | Every round hit the same class: **a conjunct that would red a correct implementation**. Trajectory 8H/11M/5L → 1H/6M/6L → 0H/3M/4L → 0H/2M/4L → 0H/0M/2L. The headline instance is `PROP-HASH-01` — see §4 for the four-round partial-propagation story. Second blocker: `PROP-WINDOW-01` (i) asserted `deriveRoundWindow` is called "exactly once per phase entry", which is **false on conforming code** (`1 + k` calls: one at the §5.4 gate, one per wrapped episode via §5.6.1's `refreshReviewState`), and was contradicted by the same document's `PROP-LIST-01b`. SE carried it as a *question* for three rounds before filing it as F-25: "Carrying it a fourth time as a question would have been the comfortable call and the wrong one." | v5: PM **Approved** (zero findings), SE **Approved with minor changes** (2 Low). `PROP-WINDOW-01` resolved by replacing the invocation count with a **provenance oracle** (threaded vs re-derived), decided by the fact that `refreshReviewState` returns `{present, reviewFiles, startIndex}` — no `endIndex` — so per-episode re-derivation cannot reach the cap. | 5 |

Note that PROPERTIES was reviewed by **product-manager and software-engineer only** — there are no `CROSS-REVIEW-test-engineer-PROPERTIES-*` files. That asymmetry is not commented on anywhere in the corpus; recording it here as an observation, not a finding.

## 2. Cross-Feature Patterns

The highest-signal item in this section is the first row. It was applied three times in one run and is the general form of the defect class that dominated the whole feature.

| Finding | Suggested Promotion Target |
|---|---|
| **Owning-section-wins.** When a constraint is restated in a new context, the section that *owns* the question governs; **a restatement is not an amendment**. Routed to Harvest explicitly by PM-TSPEC-v5 as the general remedy for the four-round restatement-drift class, and endorsed independently by TE-PLAN-v5's §14.4 routing: "a §14 changelog row must never state a normative rule more precisely than the section that owns it; that is the mechanism that produced the round-2/round-3 contradiction." Applied three times this run. | `docs/_constraints/` — new project-level constraint |
| **A value derived from source by a prescribed procedure is stated in exactly one place, marked advisory, and gates are written as predicates over the procedure, never as equalities over its output.** TE-PLAN-v4's `Process`-tagged Harvest bullet, and the fix that actually ended the PLAN's four-round count churn — the repair was **deletion**, not reconciliation. | `docs/_constraints/` |
| **When a finding is about a derived quantity, re-derive it from the stated procedure and report the procedure, not the quantity.** TE-PLAN-v4, `Cross-Feature`: reviewers verified a number instead of re-deriving it, three rounds running. | `docs/_constraints/` |
| **`AT-19`'s structural blind spot: an exemption that delegates an obligation to a call outside the guarded set moves the risk rather than removing it.** `RLH-AT-19`'s exemptions delegate the await obligation to an `await` of `_parallel`, which sits outside FSPEC AT-19's closed thirteen-name set. Filed `Cross-Feature` by PM-PLAN-v4 obs 4, carried forward unchanged by PM-PLAN-v5 obs 3, and explicitly marked "for the constraints file". | `docs/_constraints/` |
| **Harvest deletes the very `CROSS-REVIEW-*` files a recorded-approval read depends on** — the two mechanisms are mutually destructive (SE-REQ-v2 F-01, High). This is the structural reason the tier-2 Approval Record exists at all. | `docs/_decisions/` |
| **Writing a `halted` row strands the feature in the queue forever**: `halted` is outside `selectNextPending`'s pickup set (`orchestrate-queue.js:80`, `:387`). Filed three times across three rounds — SE-REQ-v4 F-02 (tagged `Cross-Feature`), SE-REQ-v5 F-04 and TE-REQ-v4 F-06 (both tagged `Local`). | `docs/_decisions/` — queue status lifecycle |
| **The workflow runtime has no digest primitive and no `crypto`** — the eleven host globals plus C-2's ban on `import`/`import()`/`process`/`fs`/`fetch` (SE-REQ-v5 F-03; independently the ground for rejecting `crypto` in the PROPERTIES harness). A repo-wide runtime constraint that keeps being rediscovered per feature. | `docs/_constraints/` |
| **Seams are destructured shorthand outside `main()`.** CODEBASE-v1 F-4: the workflow-drift scanner resolves seam aliases only inside `main()`, so seams destructured elsewhere are missed. CODEBASE-v1 F-5 (dangling `fs` / `await import()` references surviving in the shipped `dist/` bundles) is routed to **the same** constraints entry. | `docs/_constraints/` — one shared entry for F-4 and F-5 |
| **A shipped property-generation library in this very suite was neither cited nor reused** (`__tests__/helpers/driftGenerators.js`) — TE-TSPEC-v1 F-08, `Cross-Feature`. Reuse is not discoverable from within a feature's own docs. | skill update — `te-author` |
| **`coveredViolations` walks the entire live root, so any untracked local file can red a document oracle for reasons unrelated to the diff.** `WALK_SKIP_DIRS` covers only `.git` and `node_modules`. Measured this run: `.tokensave/tokensave.db` (untracked, gitignored at `.gitignore:2`) contains both forbidden literals and reds AT-22 locally. Candidate successor surface: honour `.gitignore`, or scan tracked files only. **Recorded as a finding; deliberately not fixed here.** | `docs/_constraints/` + a successor QUEUE row |
| **`build-runtime.mjs` is import-unsafe** — it rebuilds and rewrites `dist/` as a side effect of being imported (`runtimeBundle.test.js:18`), which predates this feature (introduced at `3991b4d`). CODEBASE-v2 §7(a), routed to Harvest. See §4 for why this hollows out a self-check. | `docs/_constraints/` |

**Tag under-use, recorded per the harvest skill's under-tagging check.** Routing had to be done on substance rather than on tags, in both directions:

- The *identical* defect (the `Promise.race`/`Promise.any` false negative in TSPEC §8.5) was tagged `Cross-Feature` by TE-PLAN-v3 F-02 and `Local` by PM-PLAN-v3 N-03 in the same round.
- The queue-stranding hazard was tagged `Cross-Feature` once and `Local` twice, across three rounds, by two reviewers.
- `CROSS-REVIEW-test-engineer-TSPEC-v5.md` declares a **blanket** header default — "**Scope:** `Local` unless stated" — so no finding in that file can be classified individually. Both CODEBASE reviews take the opposite blanket approach (`Scope: Cross-Feature` at document level, no per-finding column), which means F-1…F-9 there inherit a Cross-Feature tag whether or not each earns it.
- Several `Local`-tagged findings reason entirely over repo-wide facts: `pdlc/workflows/package.json`'s dependency set (TE-PLAN-v3 F-03), `orchestrate-dev.js:532/542/669` (TE-PLAN-v4 F-02), `build-runtime.mjs`'s `QUEUE_ENTRY` closure (TE-TSPEC-v1 F-07), and `docs/_queue/QUEUE.md` rows 0–9 and their charters (SE-PROPERTIES v3/v4).

The blanket-default and no-column patterns are the specific gap: the `Scope:` field is being satisfied at document level, which passes the `check-scope-field` hook while carrying no routing information at all.

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| **"Exactly one well-formed `VERDICT:` line" as the cross-review *terminal* criterion** (TE-FSPEC-v1 F-03, High) | Author; **accepted by TE at v2** | A duplicated verdict field would make a *finished* cross-review permanently non-terminal, re-dispatching to `MAX_AUTHORING_DISPATCHES` and halting the phase "over a review the reviewer genuinely finished" — a false halt of exactly the class the trailer mechanism was introduced to remove. §16.3's criterion was restated as "**at least one `VERDICT:` line whose value is in the catalogue**", and the "exactly one" clause was **explicitly withdrawn from the terminal test** while being retained in §6.3's *approval* test. The fail-closed duplicate rule survives where it protects an approval and is dropped where it only blocked terminality. | **Yes — load-bearing.** This is the withdrawal that FSPEC §16.3:2442–2446 records, and the reason a later narrower restatement elsewhere is a defect rather than a refinement. See §4. |
| A shared **domain-generator module** reusing `driftGenerators.js` (TE-TSPEC-v1 F-08 / F-10, re-filed as v3 F-07) | Author; TE: "I am satisfied and will not re-file it." | Four recorded reasons: no common shape across the five domains; §5.3's single-writer rule costs one owning batch-1/2 task plus five `Deps` edges and puts a batch-2 file on `RLH-12`'s critical path; blast radius — "a drifting domain generator reds only its own property … a generator is not an oracle"; a second *primitive* library stays forbidden. A promotion path at a sixth caller was left open. | Yes — the "a generator is not an oracle" framing generalises. |
| Use **`crypto`** in the property harness | Author, on constraint C-2 | The workflow runtime has no `import`/`import()`/`process`/`fs`/`fetch`. Rejected with a cost analysis of the alternative rather than a bare refusal. | Yes — same constraint binds every future workflow-touching feature. |
| Retain **`Promise.race` / `Promise.any`** in TSPEC §8.5's combinator set | Both reviewers; author withdrew at TSPEC v1.7 | Measured zero occurrences of `race`/`any`/`allSettled` in the tree; the ruling's own justification ("awaited **collectively**") is false of them; and retaining them contradicted the same edit's meta-clause that citations exist so the predicate is "exercised rather than hypothetical". | Yes. |
| A **tighter bound than "≥1 site per file"** for the scan non-vacuity conjunct | TE-PLAN-v5, pre-emptively; PM-PLAN-v5 concurred | `orchestrate-queue.js` has 17 scan-set names but only 8 call sites, so at least 9 names legitimately have zero sites — **a per-name lower bound is arithmetically impossible**, and an equality is precisely the count-drift that rounds 2–4 removed. | Yes — a good worked example of declining to strengthen a gate. |
| Splitting the LEARNINGS assertion into `-stale` / `-gate` tests (PM-PROPERTIES-v2 L-07) | Author; **PM accepted the withdrawal** | FSPEC `AT-18` carries no staleness conjunct, so the split "would have prescribed an empty `-stale` test". PM: "Fixed by withdrawal, and the reasoning is better than my finding." | Yes. |
| Folding `reviewLoop`'s destructuring into `RLH-23` (batch 7) — PM-PLAN-v3 N-02 | Author; PM endorsed the rejection | Would leave `iteration > undefined` — "a live loop with **no termination gate**" — for a whole batch, with twenty-plus assertions sitting green over it. | Yes. |
| Making `RLH-01`'s await row **advisory-and-recorded** (PM-PLAN-v3 Q-01) | Author chose blocking-on-*classification* instead | PM-PLAN-v4: "That is the resolution my question was pointing at and **it is better than the advisory-and-recorded option I floated**." | Yes — blocking on classification rather than on a count is the generalisable move. |
| **Deleting** the single-computation invariant rather than oracling it (TE-PLAN-v3 F-05, offered by the reviewer) | Author kept it with `RLH-LOOP-03`; TE endorsed | TSPEC §7.1 anchors the arithmetic where §11.5 forbids it, so the innocent double-write is likely and the invariant earns its check. | Yes. |
| Extending FSPEC §1.2 rule 5 to the **response carrier** (TE-FSPEC-v2) | Author declined; TE-FSPEC-v4 recorded the acceptance unusually explicitly | "This is not a concession made to close the loop… §6.2 declares the response parser out of change scope… widening it here would pull the response parser into the change surface at FSPEC round 4, which is the wrong place and the wrong time. **No finding.**" | Yes — a model of declining a widening *at the right altitude* rather than on principle. |
| **Reviewer self-withdrawals** (recorded because the discipline is the reusable part): TE-TSPEC-v1 F-08's AT-64 predicate objection ("The author is right and I was wrong"); PM-TSPEC-v2 F-02's proposed union member ("right on the carrier and wrong on the union member — I withdraw the second half"); PM-PLAN-v3's hypothesis that §14.3 duplicates the committed `CROSS-REVIEW-*` files ("I now judge wrong, and I withdraw it: those files carry *findings*, not *dispositions*"); SE-PROPERTIES-v4's own Q-03 reading; and SE-PROPERTIES-v4/v5's `F-26`, where SE rejected **the mutation SE itself had prescribed** in round-3 F-21. | The reviewers themselves | In every case the withdrawal is written up with its reason rather than quietly dropped. TE-FSPEC-v4 does the mirror image — revising a severity **up** and saying so: "I am recording that I revised it up rather than quietly changing it." | Yes — "publish the withdrawal, not just the corrected position" is a `Process` learning in its own right (§4). |
| **The TSPEC §3.1 Q-07 decision that `build-runtime.mjs` would deliberately not be edited** | Reversed by the PLAN (which required editing it for `DEV_META` `inputs`) | The reversal was **never written back into the TSPEC**, and a stale comment asserting the old decision survived at `pipelineWiring.test.js:471` until CODEBASE-v2 **F-7** caught it. F-7 is routed to LEARNINGS §3 and §5 by the reviewer. Note for accuracy: the TSPEC/PLAN cross-reviews never mention `Q-07` — they consistently treat `build-runtime.mjs` as *in* scope (PM-TSPEC-v1: "the four `build-runtime.mjs` edits all trace to named FSPEC sections"), which is itself the evidence that the reversal went unrecorded. | Yes — see the "claims that outlive their truth" class in §4. |
| Raising `orchestrate-queue.js:74 export const QUEUE_STATUSES` and `:84 function haltError` as dead code | DoD verifier (`CODE_REVIEW-…-v1` §4.6) | Byte-identical on `origin/main` — pre-existing, so recorded and deliberately not raised against this feature. | Yes — the DC-08 "defer with a named successor" discipline. |
| Two candidate findings in SE-PROPERTIES-v5, declined to avoid raising the bar at the final round | SE | "I declined to file (i)'s 'every consumer' phrasing, because (iii)'s disclaimer covers it under exactly the structure I ruled sufficient for §4.2's quoted-line silence in round 4, and I declined to file the missing per-conjunct falsifier for (i)'s count half, because §5.1's rule is per-property." SE-PROPERTIES v4 and v5 each carry a "**Checked and dropped — do not re-file these**" section (~8 and ~7 items). | **Yes, strongly** — an explicit do-not-re-file list is the cheapest defence against round-N+1 re-litigation. |

## 4. Process Learnings

### 4.1 The dominant defect class: claims that outlive their truth

Five-plus instances in one run. In every case a **prose claim about the code stayed put while the code moved**:

1. **CODEBASE-v2 F-7** — a comment at `pipelineWiring.test.js:471` still asserted the TSPEC §3.1 Q-07 decision ("`build-runtime.mjs` will not be edited") after the PLAN reversed it.
2. **CODEBASE-v2 F-8** — the `RLH-CR-F1` preamble claims the test asserts against the committed `dist/`, but `runtimeBundle.test.js:18` imports `build-runtime.mjs`, **which builds on import**, so the assertion is against a freshly built tree.
3. **DoD F-1** — `reviewerSkillForSlug`'s doc comment claimed an enforcement that no test performed. (Fixed this run at `168544e`.)
4. **The FSPEC §16.3 narrowing** — TSPEC:1722 restated §16.3's terminal criterion as "exactly one well-formed `VERDICT:` field", the *withdrawn* form (§3, row 1). A false halt.
5. **The FSPEC §16.5 narrowing** — TSPEC:1724 restated the LEARNINGS completeness clause more narrowly, dropping the `Harvested from` conjunct.
6. **CODEBASE-v2 §7(b)** — a stale TSPEC §5.9 LEARNINGS row.
7. **CODEBASE-v2 F-9** — the harvest checklist omitted the now-mandatory `Harvested from` row. (Routed to LEARNINGS §4; the checklist has since been corrected.)

**Suggested countermeasure:** any comment or doc that asserts "X is enforced by Y" must name Y **as a test id**, and that test id must exist. A claim with no citable oracle is a claim with no expiry date.

### 4.2 The same narrowing defect, twice, in one feature

The TSPEC restated an FSPEC §16 criterion in a *narrower* form and the narrower form was wrong **both times**:

- **FSPEC §16.3:2439** owns the cross-review terminal criterion — "at least one `VERDICT:` line whose value is in the catalogue". TSPEC:1722 restated it as "exactly one well-formed `VERDICT:` field". FSPEC §16.3:2442–2446 explicitly records that "exactly one" was **deliberately withdrawn** as TE-FSPEC-v1 F-03. The restatement therefore reintroduced a defect the FSPEC had already removed by name.
- **FSPEC §16.5:2271** owns the LEARNINGS completeness clause. TSPEC:1724 restated it more narrowly, dropping the metadata-table conjunct.

The second one was caught by CR **F-2** and resolved in favour of the FSPEC. The resolution is recorded in the shipped code, at `pdlc/workflows/orchestrate-dev.js` around `HARVESTED_FROM_ROW` (:1156–1175): "§16 owns the structural-completeness criteria and governs, so the conjunct is implemented here (CR F-2) and the TSPEC narrowing is documentation drift for Harvest."

**The resolution rule that settled both — and a third case — is `owning-section-wins`** (promoted to §2, row 1): the section that owns the question governs, and a restatement is not an amendment. It is worth noting how cheap this rule is compared to what it prevents: the PLAN spent three rounds repairing *copies* of a derived count because no section owned it.

Also worth recording plainly: this feature exists to catch restated-constraint drift, and it shipped with two instances of restated-constraint drift in its own TSPEC. That is not irony so much as evidence the class is genuinely hard to see from inside the document.

### 4.3 Non-obvious mechanics of this repo's own test suite

Two facts that cost real time and are not written down anywhere a future implementer would look:

- **The suite requires a clean tree.** `advertisedVersionViolation` compares `plugin.json` between the working tree and HEAD **whenever `git status --porcelain -- pdlc/workflows/dist/` is non-empty**. An uncommitted rebuilt `dist/` therefore reds AC-6.6's oracle *spuriously*. The working discipline is: rebuild `dist/` and commit it **in the same commit**, then run the suite.
- **`npm test` silently repairs a stale tracked `dist/`.** `runtimeBundle.test.js:18` imports `build-runtime.mjs`, which rebuilds and rewrites `dist/` at import time. The consequence is sharp: **the in-repo `--check` assertion at `runtimeBundle.test.js:494` can never observe staleness** — the import already fixed it. Genuine staleness coverage exists only in DOD-03's temp-root tests. This is a real hole in a self-check: a test that cannot fail for the reason it exists. (Independently found as CODEBASE-v2 F-8 and §7(a).)

### 4.4 The "permanent red" AT-22 was an environment artifact, not an inherent red

PLAN §7.3's permitted-red ledger carries `AT-22 [red-until-L-06]` (`coveredViolations(LIVE_ROOT) is empty post-landing`, `documentOracles.test.js:246`) as a standing red, and the entire run's gate arithmetic was expressed as "1 permitted red". Measured:

- In the maintainer's working tree the suite ends `1 failed, 70 skipped, 1169 passed, 1240 total`. AT-22 fails on **exactly one path**: `.tokensave/tokensave.db`, matching the patterns `.claude/workflows/orchestrate-dev.js` and `managed manually`.
- `.tokensave/` is **untracked and gitignored** (`.gitignore:2`).
- The branch was cloned at `c2c2250` into a clean tree (no `.tokensave/`, no `.claude/workflows/`) and the full suite run there: **`70 skipped, 1170 passed, 1240 total` — zero failures.**

So AT-22 is **green on any clean checkout, including CI**. It is red locally only because `coveredViolations` walks the whole live root and a local tool's untracked SQLite database happens to contain both forbidden literals.

Two separable learnings:

1. **A permitted-red ledger entry that is actually environment-dependent is a mislabelled ledger entry.** It hid a real question — "is this red inherent to the code or to my machine?" — behind a number that everyone, reviewers included, carried forward for the entire run. **Countermeasure:** a permitted-red entry must record the *environment* in which it is red, and a red that disappears on a clean clone belongs in a different category from one that is genuinely code-caused.
2. **`coveredViolations` scanning the entire root is a robustness gap** — any untracked local file (editor backup, tool cache, database) can red a document oracle for reasons unrelated to the diff. `WALK_SKIP_DIRS` covers only `.git` and `node_modules`. Candidate successor surface: honour `.gitignore`, or scan tracked files only. Recorded as a finding in §2 and §5; **not fixed here**.

### 4.5 `PROP-HASH-01`: four rounds of partial propagation

The single best-documented convergence failure in the run, and the reason it took four rounds is *not* that the answer was hard.

The question was `parseApprovalHash`'s returned `hash` grammar: **bare 64-hex, or `sha256:`-prefixed?** PM-PROPERTIES-v4 F-01 filed it. SE-PROPERTIES-v5 derived the answer independently from six sources (FSPEC §5 `:372`, §7 `:1046`, §10.5 `:1466`; TSPEC §4.4 `:921`, §3.7 `:715–716`, §5.4→§5.5 routing) **before reading any clause**: `/^sha256:[0-9a-f]{64}$/`, the line's whole value. The routing settles it twice over — a bare-hex `hash` fails §5.5's guard, *and* even without the guard it could never equal `approvalHashOf(documentBytes)`, so `FRESH` would be unreachable and the entire skip mechanism could never fire.

So the answer was over-determined. What took four rounds was **propagation**. PM-PROPERTIES-v5:

> "I have found claimed-coverage-with-contradicting-reality in every round of this document, and in each of the previous four the repair was partial — the clause moved and a consequential cell did not. … That is the first time the propagation has been complete."

SE-PROPERTIES-v5 supplies the mechanism, and this is the sentence worth keeping:

> "Propagation is complete, and — the check that actually matters — **it is not over-propagated**. … Six sites carry the prefixed form and are correct; three sites carry the bare form and are correct to. A blanket find-and-replace would have broken the two digest properties; this revision distinguishes the two halves TSPEC §3.7 distinguishes. **That is the difference between propagating a value and propagating a string, and it is what four rounds of partial propagation failed at.**"

SE-PROPERTIES-v4 names the same failure from the technical side: "Three rounds of this property failed the same way: each revision restated the counting rule in the property's own words and each restatement drifted."

**The generalisable lesson:** a fix to a *stated grammar* has a blast radius, and the radius is not a string match — it is the set of sites that mean the same thing. Under-propagation and over-propagation are the same defect with opposite signs, and a blanket find-and-replace commits the second while appearing to fix the first. The `-v{N}` count is measuring propagation completeness here, not disagreement.

A pleasant counter-example from the same round, worth recording because final-round repairs usually go the other way: two independent fixes **interlocked**. Pinning malformed payloads to vary the hex run while keeping the `sha256:` label (a PM F-01 consequence) is what makes the mixed double-line document `n === 2` under *either* label matcher, which is what lets conjunct (ii) assert a *named* `duplicated` on a shape F-27's silence would otherwise have left undetermined. SE: "Neither fix was aimed there. … it is exactly the seam where a final-round repair usually opens a hole, and it closed one instead."

### 4.6 Concurrent-writer incident — orchestration, not code

**Two orchestrating writers committed to the same feature branch simultaneously.** The supervisor inferred from an agent's `completed` status that the agent was dormant. It was not — it was mid-batch.

Consequences: duplicate `RLH-12` fixtures, `RLH-16` double-authoring, and an unbidden commit landing mid-gate. The damage was caught by **the agent's own `SHARED-FILE-RACE` guard**, not by the supervisor.

**Lesson: agent status is not evidence of quiescence.** `completed` describes a reported state, not an observed one. Before writing to a shared branch, *measure* — check recent commits, check running tasks — rather than infer. This is DC-02 ("measure, don't infer") applied to orchestration itself, which is the layer that had been assuming it was exempt.

### 4.7 A supervisor brief that prohibited the very edits the PLAN mandated

The Phase I brief told implementers **not to edit any `SKILL.md`**. PLAN §5.4 assigns **nine `SKILL.md` edits** to RLH-07 / RLH-08 / RLH-09.

This is the *same* defect class the feature exists to catch — a restated constraint narrower than the owning document — occurring in the run that built the catcher, one layer up from where the catcher can see. The PLAN owns the change surface; a dispatch brief that restates it is a restatement, and `owning-section-wins` applies to briefs exactly as it applies to specs. Worth making explicit in `orchestrate-dev`/`tech-lead`: a brief may *narrow attention*, but it may not narrow *permission*, and where it appears to, the PLAN governs.

### 4.8 Review-discipline practices worth keeping

Several are already quoted in §3; collected here as process signal:

- **Publish the failed derivation pass, not only the corrected result** (PM-PLAN-v4 obs 6). "A count that has been wrong four times is made trustworthy by a written method, not by a fifth assertion."
- **How to handle a collision between an authorised amendment scope and the ownership rule** (PM-PLAN-v4 obs 5): take the clause, put it in the owning section, disclose it as beyond the brief, label its direction, and state the alternative it avoided. PM records that this is "what let me approve a third clause I had not authorised in under a page."
- **An explicit "checked and dropped — do not re-file these" section** (SE-PROPERTIES v4 and v5) is the cheapest available defence against round-N+1 re-litigation.
- **A changelog that owns the provenance of its own defects** — the FSPEC v1.4 changelog calling its own v1.3 widening the cause of the v1.4 regression. TE-FSPEC-v5: such a changelog "is a better artifact for the harvest phase to read than one that presents every fix as an improvement." Confirmed from the harvest side.
- **Severity revisions and withdrawals are recorded, not silently applied** (TE-FSPEC-v4 revising *up* and saying so; the five reviewer self-withdrawals in §3).
- **`POSTMORTEM-R`'s R-6 worked.** The instruction "no citation-drift nit at any severity" was adopted verbatim by TE-FSPEC-v4 and v5, which open their Scope sections by citing it. A post-mortem recommendation that later rounds cite by name is the mechanism doing what it is for.

### 4.9 A live instance of the contract this feature fixes, inside the feature's own corpus

The cross-review corpus is itself inconsistent about the machine-readable verdict:

- `CROSS-REVIEW-test-engineer-REQ-v1/v2/v3.md` and `CROSS-REVIEW-test-engineer-FSPEC-v1.md` carry **prose verdicts only, with no `VERDICT:` line at all**. The first machine-readable TE verdict appears at REQ v4.
- `CROSS-REVIEW-test-engineer-PLAN-v5.md` has a `## Verdict` heading whose body is "**Approved.**" — a heading with no parseable `VERDICT:` field.
- Only the five `CROSS-REVIEW-software-engineer-FSPEC-*` files carry both a `## Verdict` heading and the field; TE-FSPEC v2–v5 carry a bare `VERDICT:` line with no heading and no count trailer.
- **No file in the entire 53-file corpus carries an `APPROVAL-HASH:` or `REVIEWED-COMMIT:` anchor.** Every cell in §6 is therefore `unavailable`, copied from nothing rather than recomputed.

This is exactly the drift AC-4.2 was re-based to fix, observable in the artifacts produced *while* fixing it. It also means the tier-1 anchors have never yet been exercised end-to-end on real data.

### 4.10 Altitude

`POSTMORTEM-R`'s third root cause — no altitude gate, so implementation-level defects were litigated in a requirements document — is the one structural finding of the run that no code change addresses. The REQ quadrupled in size while its blocking-finding count rose, because every AC added to close a finding was itself new reviewable surface. Note the shape: **REQ was the only loop that failed, and it failed by growing.** FSPEC, TSPEC, PLAN and PROPERTIES all converged, and the TSPEC's first *shrinking* revision (−25 B) is also the one that closed its hardest finding.

## 5. Open Items for Consolidation

### 5.1 Human action items — these need a person, not `consolidate-learnings`

1. **A follow-up QUEUE row and therefore a REQ, for DoD F-2 + F-3.** Both are byte-identical to `origin/main` — pre-existing — and `CODE_REVIEW-…-v1` states outright: "F-2 and F-3 are one defect seen from two sides. F-2's live site is entirely pre-existing (unchanged bytes on both ends of the seam), so per DC-08 it is deferred with a named successor surface rather than folded into this feature." The coupling is the operative detail: **adding F-3's guard reds until F-2 is fixed**, so they cannot be sequenced apart.
   - **F-2** — the `checkPrCi` seam uses a dynamic `await import("child_process")` that the workflow runtime forbids. 100% pre-existing.
   - **F-3** — the same seam pattern at six sites. **Four of six pre-date this branch; two are net-new** (`defaultGit` seams this feature added, one per module). So F-3 is not wholly pre-existing, and this feature contributed to it.
   - There is currently **no queue row that charters this work**. Recorded here because a deferred finding with no successor row is how a deferral becomes an omission.
2. **`POSTMORTEM-R-pdlc-review-loop-hardening.md` still carries no `RESOLVED:` marker.** It was unblocked by an operator-directed convergence pass recorded in a `## Resolution` section, but the marker the phase gate actually reads is absent. **The marker is human-written only** — no agent may set it. Until it is set, Phase R fails closed on this feature. The file is deliberately retained by this harvest.
3. **`docs/_queue/QUEUE.md` row 22 still reads `halted`** for this feature. Queue state is human-owned and untouched by this harvest.

### 5.2 Promotion candidates for `consolidate-learnings`

| Candidate | Target | Note |
|---|---|---|
| **Owning-section-wins** — a restatement is not an amendment; the section that owns the question governs | `docs/_constraints/` | The highest-value item in this document. Applied three times this run; would have prevented both §4.2 narrowings, the §4.7 brief conflict, and the PLAN's four-round count churn. |
| A derived value is stated **once**, marked advisory; gates are predicates over the procedure, never equalities over the output | `docs/_constraints/` | TE-PLAN-v4. |
| Re-derive a disputed quantity from the stated procedure; report the procedure, not the number | `docs/_constraints/` | TE-PLAN-v4, `Cross-Feature`. |
| **Any doc/comment asserting "X is enforced by Y" must name Y as an existing test id** | `docs/_constraints/` + `se-review`/`se-implement` SKILL update | The countermeasure for §4.1's dominant defect class. |
| An exemption that delegates an obligation to a call **outside** the guarded set moves the risk rather than removing it | `docs/_constraints/` | PM-PLAN-v4 obs 4 / v5 obs 3, explicitly "for the constraints file". |
| Seams are destructured shorthand outside `main()`; dangling `fs` / `await import()` references survive in shipped `dist/` bundles | `docs/_constraints/` — **one shared entry** | CODEBASE-v1 F-4 and F-5, both routed here by the reviewer. |
| The workflow runtime has no digest primitive, no `crypto`, no `import`/`import()`/`process`/`fs`/`fetch` | `docs/_constraints/` | Rediscovered per feature; SE-REQ-v5 F-03 and the PROPERTIES `crypto` rejection. |
| A **permitted-red ledger entry must record the environment in which it is red**; a red that vanishes on a clean clone is a different category from a code-caused red | `docs/_constraints/` + `tech-lead` SKILL update | §4.4. |
| **Agent status is not evidence of quiescence** — measure (recent commits, running tasks) before writing to a shared branch | `docs/_decisions/` + `orchestrate-dev`/`tech-lead` SKILL update | §4.6; DC-02 applied to orchestration itself. |
| A dispatch brief may narrow *attention* but not *permission*; where a brief and the PLAN disagree on change surface, the PLAN governs | `orchestrate-dev` / `tech-lead` SKILL update | §4.7. |
| Reviews should carry an explicit "checked and dropped — do not re-file" section | `se-review` / `pm-review` / `te-review` SKILL update | §4.8; demonstrated by SE-PROPERTIES v4/v5. |
| `Scope:` must be **per-finding**, not a document-level blanket default | `pm-review` / `se-review` / `te-review` SKILL update + `check-scope-field.sh` | §2's tag-under-use note. A blanket header default passes the existing hook while carrying zero routing information. |
| Harvest deletes the `CROSS-REVIEW-*` files a recorded-approval read depends on — the reason the tier-2 Approval Record exists | `docs/_decisions/` | SE-REQ-v2 F-01. |
| `halted` is outside `selectNextPending`'s pickup set, so a `halted` row strands the feature | `docs/_decisions/` — queue lifecycle | Filed three times; see §2. |

### 5.3 Deferred findings, recorded so the deferral does not become an omission

| Finding | Status | Named successor surface |
|---|---|---|
| **CODEBASE-v1 F-4** (Low) — drift scanner resolves seam aliases only inside `main()` | Deliberately unfixed; not re-raised in v2 | LEARNINGS §5 + a `docs/_constraints/` entry |
| **CODEBASE-v1 F-5** (Low) — dangling `fs` / `await import()` in shipped `dist/` bundles | Deliberately unfixed | **the same** `docs/_constraints/` entry as F-4 |
| **CODEBASE-v1 F-6** (Low) — two different predicates for the `## Verdict` heading: `crossReviewComplete` (`orchestrate-dev.js:1244–1254`) vs `extractFileVerdict` (`:892–896`) | Deliberately unfixed | "a two-line tidy whenever that file is next touched" |
| **CODEBASE-v2 F-7** (Low) — Q-07 reversal unrecorded; false comment at `pipelineWiring.test.js:471` | Recorded | LEARNINGS §3 and §5 — both done (§3 last row, §4.1 item 1) |
| **CODEBASE-v2 F-8** (Low) — `RLH-CR-F1` preamble claims an assertion against committed `dist/`; the import rebuilds first. Predates this feature (`3991b4d`) | Recorded | §4.3 / §4.1; wants a real fix — see below |
| **CODEBASE-v2 F-9** (Low) — harvest checklist omitted the `Harvested from` row | Fixed this run | — |
| **CODEBASE-v2 §7(a)** — `build-runtime.mjs` is import-unsafe (builds as a side effect of import) | Recorded for Harvest | **No successor row exists.** This is the root cause of F-8 and of the §4.3 hole; it deserves one. |
| **DoD F-1** — `forcePhases` has no reachable or documented invocation channel (`DEV_META` declares no `inputs`) | Surfaced twice (CODEBASE-v1 F-1, then DoD F-1) | Resolved this run |
| **DoD F-2 / F-3** — forbidden dynamic `import()` in the `checkPrCi` and `defaultGit` seams | Deferred, pre-existing | **Needs a QUEUE row + REQ — see §5.1 item 1** |
| **`coveredViolations` walks the whole live root** (`WALK_SKIP_DIRS` = `.git`, `node_modules` only) | New finding, this harvest | Candidate: honour `.gitignore`, or scan tracked files only. No row exists. |
| **PM-PROPERTIES-v3 F-02's residual** — bound to `QUEUE.md` row 9, whose charter explicitly excludes it | Withdrawn in v4 after the author re-read all nine rows; the gap is recorded as **unowned**, and SE-v4 independently reproduced the "none charters it" conclusion row by row | Genuinely unowned — flag for consolidation |
| **Three TSPEC-review deferrals** (incl. Q-09) | Bound to `docs/_queue/QUEUE.md` row 9 `pdlc-authoring-contract` (`blocked`, Order 9 not 8 deliberately, per DC-08) | Row exists |

### 5.4 Verification performed, recorded as fact

- All four `pr-tests.yml` jobs — **unit-tests, artifact-freshness, fresh-clone-bootstrap, script-syntax** — were reproduced locally against a **clean clone of `c2c2250`**, and all four pass.
- The full suite on that clean clone: `70 skipped, 1170 passed, 1240 total`, **zero failures** (see §4.4 — AT-22's "permanent red" does not reproduce off the maintainer's machine).
- **Residual untested surface:** the `ubuntu-latest` / bash-5 matrix leg, which cannot be exercised from macOS.

## 6. Approval Record
