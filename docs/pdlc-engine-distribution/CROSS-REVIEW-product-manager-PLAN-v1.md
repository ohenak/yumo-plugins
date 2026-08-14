# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md`
**Date:** 2026-08-13
**Iteration:** 1
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Technical design, batch mechanics and test strategy are the SE/TE lenses.

## Summary of the review

The plan is strong where it is mechanical: the ownership manifest is in bijection with the task
table, the serialisation chains on `catalogue.mjs` / `orchestrate-dev.js` / `orchestrate-queue.js`
are real `Deps` edges rather than prose, and every `file:line` anchor I sampled resolves correctly
at HEAD. That part of the plan a reviewer can check, and it checks out.

The product problem is upstream of all of that: **the plan's coverage claims are stated in an
acceptance-test id namespace that does not exist as a single namespace.** The FSPEC defines
`AT-1.1`…`AT-7.2` (each tagged with the `AC-` it serves) and the TSPEC uses those ids. The REQ
defines `AC-1.1`…`AC-6.2`. The PLAN's `Deps`-table citations are written as `AT-n.m`, but some
resolve to the FSPEC's `AT-n.m` and others to the REQ's `AC-n.m` — and for §2 the two numberings
are **offset by one**, so the same token means two different tests in two different rows of the
same table. Because coverage is asserted only through those tokens, I cannot certify coverage by
reading the plan; I had to diff the id sets, and doing so surfaced four acceptance tests with no
task at all, three of them serving P0 criteria (AC-1.2, AC-2.2, AC-4.4).

None of this is a design objection. The tasks that exist are well-shaped; the gaps are tests the
plan does not schedule and citations that point an implementer at the wrong specification.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Process | **The `AT-` prefix denotes two disjoint id namespaces inside one task table.** FSPEC `AT-2.4` is *(AC-2.3)* the clean-tree install/upgrade test; the Node-floor test is FSPEC `AT-2.5` *(AC-2.4)*. PLAN T13, T25, T45 and DoD item 7 all cite `AT-2.4` for the **Node floor / `bin/pdlc.mjs` guard** — i.e. they mean REQ `AC-2.4`. But T50 cites `AT-2.4` and `AT-2.5` in the same cell and its prose reads "AT-2.5 on a below-floor image" — i.e. T50 means the FSPEC's ids. Same token, two meanings, one table. Same defect on `AT-1.5` (T31, T52 mean REQ AC-1.5 "per-release pairing"; FSPEC AT-1.5 is *(AC-1.2)* the skills-marker test) and on `AT-6.1` (T11, T41 and DoD item 8 use it for the two-root module resolver; FSPEC AT-6.1 is *(AC-6.1)* the bootstrap-commands test, which is what T44 correctly uses it for). *Fix:* pick the FSPEC/TSPEC `AT-` namespace as the single vocabulary — the TSPEC already uses it (`AT-3.3`, `AT-3.8a/b`, `AT-5.3`, `AT-6.2`) — and restate every §2 and §7 citation in it; where a row genuinely traces to a REQ criterion, write `AC-n.m`. | AC-1.2, AC-1.5, AC-2.3, AC-2.4, AC-6.1 |
| F-02 | High | Local | **AC-4.4 has no task.** FSPEC `AT-4.4` is annotated **"Writable today — no carrier is missing … it needs two plugin versions and a revert"**, explicitly excluded from the O-9 blocking that covers AT-4.2/AT-4.5. It appears nowhere in the PLAN: §2 cites AT-4.1, AT-4.2, AT-4.3 and AT-4.5 and never AT-4.4. AC-4.4 is the **anti-echo** criterion — the pair must *change* when a different plugin version is made current and *revert* when reverted. Without it, the whole provenance stream (T20, T27, T29, T35, T36, T38, T39, T42, T44) is satisfiable by a hardcoded constant that happens to match once, which is precisely the failure REQ §5 wrote AC-4.4 to catch. *Fix:* add a task owning the change-then-revert observation, with a test file in §3. | AC-4.4 (P0, REQ-EDIST-04) |
| F-03 | High | Local | **AC-1.2 has no task.** FSPEC `AT-1.5` *(AC-1.2)* requires a plugin whose dispatched role's `SKILL.md` carries a distinguishing marker, and asserts the **composed prompt carries that marker** — the proof that prompts are read from the installed plugin at dispatch time rather than from engine-resident bytes. Grepping the PLAN for `marker`, `SKILL.md`, `composed prompt` and `dispatch time` returns only T14's unrelated "env marker". The plan's two `AT-1.5` citations (T31 README literals, T52 `npm view … pdlcPairing`) both mean REQ AC-1.5. AC-1.2 is P0 and is the load-bearing half of G-1's "no skills snapshot" promise: AC-1.3's packed-set equality proves the engine ships *no* skills, but only AT-1.5 proves it then reads the *right* ones. *Fix:* schedule AT-1.5 as its own task. | AC-1.2 (P0, REQ-EDIST-01) |
| F-04 | High | Local | **AC-2.2 has no task.** FSPEC `AT-2.3` *(AC-2.2)* is the two-consumer-repo upgrade: version N installed, both repos having run at N, one upgrade command on the machine, then **both runs execute N+1, visible in output *and* artifacts, with no command run inside either repo**. T50 lists `AT-2.3` among its ids, but T50's own prose describes a single install-then-upgrade recording `{resolvedVersion, resolvedStoreEntry}` inequality — that is FSPEC AT-2.4 *(AC-2.3)* content. The distinguishing conjuncts of AC-2.2 (two repos, artifact-visible, zero in-repo commands) appear in no task description. This is the criterion that carries G-2's "zero per-project action" and US-02 outright. *Fix:* either give T50 an explicit second leg naming the two-repo conjuncts, or add a task. | AC-2.2 (P0, REQ-EDIST-02) |
| F-05 | High | Local | **T49 claims seven publish criteria by ellipsis and gives four of them no carrier.** The cell reads `(AT-3.1…AT-3.7)` and names two test files: `ci-arrangement.test.js` (YAML job-name/shape oracles) and `packaging.test.js` (packed-tarball contents). Neither can carry AT-3.3 *(AC-3.3)*, which requires a **channel stub holding version N with its bytes hashed**, re-run, and byte-identity asserted on **both** the no-op and loud-failure branches; nor AT-3.5 *(AC-3.5)*, which requires a **sentinel credential value** scanned in the built artifact *and* the captured stub-publish log, plus REQ AC-3.5's two positives (secret present ⇒ authenticates and the release is cut; absent/empty ⇒ named failure, nothing published); nor AT-3.2's assertion **on the run conclusion** rather than on package absence. Corroborating evidence that these legs are unscheduled: T03 creates **`S-5` publish-channel stub**, and `S-5` is referenced by no other row in the plan — a fixture with no consumer. *Fix:* enumerate AT-3.1…AT-3.7 as explicit rows or explicit legs, each with the test file that carries it, and wire S-5 to the task that uses it. | AC-3.2, AC-3.3, AC-3.5 (P0, REQ-EDIST-03) |
| F-06 | Medium | Local | **The AC-1.1 / AC-1.4 refusal and triple variants are unscheduled.** FSPEC `AT-1.2` (out-of-range refusal, text **distinguishable from** AT-1.1's), `AT-1.3` (diagnostic still completes and reports the triple in either refusal state), `AT-1.4` *(BR-1.3)* (unparseable plugin manifest ⇒ refusal naming root and parse failure, **not** the "none installed" message) and `AT-1.6` (triple equals the banner's and the report's) appear in no task. T15 partially overlaps AT-1.3/AT-1.6 via its `--version`/`doctor` legs, but it cites `AT-1.4, AT-1.1` — which under F-01's ambiguity reads as REQ AC-1.4/AC-1.1 — so an implementer working from T15 has no instruction to write the *distinguishability* assertions, which are the whole content of AT-1.2 and AT-1.4. AC-1.1 is P0. *Fix:* name AT-1.2, AT-1.3, AT-1.4 and AT-1.6 in T15's cell (or a sibling task) once F-01's vocabulary is fixed. | AC-1.1, AC-1.4 (P0, REQ-EDIST-01) |
| F-07 | Medium | Local | **§7's closing paragraph records an unreconciled upstream contradiction, and T45 is written "subject to" it.** The PLAN states that TSPEC AT-3.8a "still states packed equals §5.2's … `bin/pdlc.mjs`, twelve named `lib/*.mjs` modules", which the E-4b split's new `bin/cli.mjs` and §3.1's three new `lib` modules falsify, and that "T16 [is] written but the acceptance test implementer reads still names the wrong expected set". T45 likewise registers the below-floor id "**subject to the erratum raised against TSPEC §10.3/§9.3**". Scheduling a task whose expected value is known to be wrong means the implementer transcribes a wrong literal — and AC-1.3's set-equality is precisely the criterion that must not be softened. This is honest of the plan to record, but a PLAN should not go to Phase I carrying it. I have raised the erratum below so the TSPEC reconciles §5.4's `PK-*` table before implementation starts. *Fix:* gate T16/T45 on the erratum's resolution, or restate their expected sets once the TSPEC lands. | AC-1.3, AC-2.4 |
| F-08 | Low | Local | **Two `[red]` rows name test files that already exist at HEAD without declaring the row an extension.** T10 names `pdlc/engine/__tests__/engine-config.test.js` and T17 names `pdlc/engine/__tests__/ci-arrangement.test.js`; both files are present in the tree today. T17's cell says it "absorbs V-19's older overlapping matrix assertions", which declares the extension clearly; T10's does not, so its `[red]` reads as file creation. Product impact is small but real — a reader counting "eighteen new test files" (§5 integration point 1) against §3 gets a different number than the tree supports. *Fix:* mark T10 as extending an existing file, as T17 does. | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §1.2 lists AC-6.2's bundle-side load root as N-1, deliberately not built, consistent with TSPEC §14.3 and REQ O-9. T51 then records the AT-6.2 observation "with the limit stated in the evidence itself". Is the plan's position that **REQ-EDIST-06 is only partially delivered in Phase 1** — AC-6.1 fully, AC-6.2 as a limited manual observation? If so, that is a product-visible narrowing of a P0 requirement and I would like it stated in §1.2 in those words, so the DoD reader is not left to infer it from the evidence file. |
| Q-02 | T02 and T05 are `[gate]` rows whose "Source File" is `docs/_decisions/DECISIONS-plugin-distribution.md` — operator decisions, not code. §4 kind 3 says T05 "gates only the first *real* publish (T52)". Does the plan intend the branch to be mergeable with T05 unresolved, i.e. is O-8 blocker 3 (the `UNLICENSED` licence) explicitly **out** of this feature's Definition of Done? §7 item 12 says the decisions doc "carries the npm scope (T02) and the licence (T05)", which reads as *in*. The two statements need reconciling. |
| Q-03 | Once F-01 is fixed, does the plan want a small traceability table (`AT-id → task id`) in §2 or §7? Set-equality against the FSPEC's enumeration would have made F-02…F-06 mechanically visible to the author rather than requiring a reviewer to diff two id sets by hand. |

## Positive Observations

- **Every `file:line` anchor I sampled is accurate at HEAD**, which is unusual and worth saying:
  `orchestrate-dev.js:6736` is the `appendApprovalAnchors` commit, `:10429` the `commitPaths`
  lock-retry commit, `orchestrate-queue.js:1603`/`:1645` the two queue commit sites,
  `build-runtime.mjs:274`/`:307` the two generated `__queue.rewriteStatus(...)` closures (`:274`
  visibly passes seven arguments today, exactly as T55/T44 claim), and `run.mjs:53` the
  relative-escape module URL. §5's integration points can be checked rather than trusted.
- **The suite-wide catalogue constraint is correctly read and correctly designed around.**
  `_assert-suite-wide.mjs`'s `checkMessageCatalogue` does fail in both directions — emitted-but-
  unregistered *and* registered-but-never-emitted — and §1.3's response (each of the six
  catalogue-touching tasks registers **and** emits within itself, in six consecutive batches) is
  the right shape rather than a `[Fake first]` registration that would go red for a whole batch.
- **The anti-fork oracle is not quietly weakened.** `run.test.js`'s walk over `pdlc/engine/` is
  real at HEAD, vendoring would falsify it, and T33 replaces it with a tracked-ness test rather
  than deleting it — with the replacement in the *same* task as the vendoring, so the suite never
  goes red for an unrelated reason. R-5 warned that a weakened anti-fork oracle is the actual
  hazard; the plan honours that.
- **§3's ownership manifest is in genuine bijection with §2** (55 rows, 55 tasks), and the
  red→green pairs in §4 are explicit `Deps` edges rather than batch-number coincidence, which is
  what makes the coverage gaps above checkable at all.
- **§7's "what is deliberately not done" paragraph names its own unresolved contradiction** rather
  than hiding it. F-07 asks for it to be closed before Phase I, but recording it was the right
  call and is why the erratum below could be raised at all.

## Recommendation

**Needs revision** — five High findings.

Exactly what to change, in the order I would do it:

1. **F-01 first, because it is the cause of the rest.** Adopt the FSPEC/TSPEC `AT-` namespace as
   the plan's single vocabulary and restate every citation in §2 and §7 in it. Where a row traces
   to a REQ criterion rather than an acceptance test, write `AC-n.m`. Specifically: T13/T25/T45 and
   DoD item 7 mean the Node floor (FSPEC `AT-2.5`), not `AT-2.4`; T31/T52 mean `AC-1.5`, not
   `AT-1.5`; T11/T41 and DoD item 8 mean the two-root resolver, which is not `AT-6.1`.
2. **Add the four missing acceptance tests as tasks**, each with a test file in §3: `AT-1.5`
   (F-03, AC-1.2), `AT-2.3` (F-04, AC-2.2), `AT-4.4` (F-02, AC-4.4), and explicit rows or legs for
   `AT-3.2`, `AT-3.3`, `AT-3.5` (F-05) with `S-5` named as their fixture.
3. **Name `AT-1.2`, `AT-1.3`, `AT-1.4`, `AT-1.6` in T15's cell or a sibling task** (F-06), so the
   refusal-distinguishability assertions are instructed rather than inferred.
4. **Resolve the TSPEC contradiction before T16 and T45 are implemented** (F-07); the erratum is
   raised below.
5. **Mark T10 as extending an existing file** (F-08), as T17 already does.

Once §2's citations resolve to one namespace, the set-equality Q-03 suggests would make this
review's whole first half mechanical for the next round.

## Verdict

VERDICT: Needs revision
{"high": 5, "medium": 2, "low": 1}
