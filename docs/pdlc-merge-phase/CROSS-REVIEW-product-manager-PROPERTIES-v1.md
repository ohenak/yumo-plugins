# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-merge-phase/PROPERTIES-pdlc-merge-phase.md` (v1.0, commit `bbd22e0`)
**Date:** 2026-08-02
**Iteration:** 1
**Scope:** Product-lens review of the 20 properties against REQ v1.1, FSPEC v1.3, TSPEC v1.2 and PLAN v1.1 — whether the REQ's safety commitments are each pinned by a property or explicitly and correctly declared out, whether any property contradicts an approved spec, whether every property traces to an AC and an owning PLAN task, and whether any property is an example test wearing a quantifier. Test-harness design, generator mechanics and mutation tooling are the TE lens.

## Findings

### 1. [blocking] `mergeRequiresCi`'s relaxation is unquantified, and §8.5 claims a mutant it cannot kill

REQ AC-4.3 lets `mergeRequiresCi: false` satisfy the CI precondition on `no-checks`; AC-4.4 requires `failed`, `pending` and an unretrievable rollup to be refused **regardless of that setting**. Together they are a safety commitment of exactly the same class as AC-1.5's no-bypass rule — a flag that must relax one cell and must not widen — and AC-1.5 correctly gets its own differential property (PROP-M-04). AC-4.3 gets none, and it is not in §7's declared-non-property list (which names only AC-1.2a, AC-2.3/AC-2.5b, AC-5.4/AC-5.6).

The gap is not merely an omission, because §8.5 lists "the CI rule's single relaxed cell (PROP-M-03)" as a mutation target these properties must kill. PROP-M-03 cannot kill it: `D_core` (§2) enumerates `mergeMode`, `prUrl`, `o1`, `ci`, `o3`, `o4`, `o5`, `caps` and `attempt` — **`mergeRequiresCi` is not an axis**, so every `D_core` case runs at the default `true`. A mutant widening the rule to `if (ci === "none" || ci === "pending") return requiresCi ? refuse : pass` behaves identically to the correct implementation under `mergeRequiresCi: true` and therefore survives PROP-M-03, PROP-M-17 (row 10 still refuses) and PROP-M-06 (the guard resolves above CI). The whole suite passes on a build in which a repository that opted out of CI merges on **pending** checks.

**Fix, cheap and in the shape the document already uses:** add `mergeRequiresCi ∈ {true, false}` to `D_core` (doubling an enumerated domain the document already runs at ≈4 800) and state a PROP-M-04-shaped conjunct — for every `ci ≠ "none"` the two settings are deep-equal, and for `ci === "none"` exactly `refused` + escalation versus precondition satisfied. That is AC-4.2, AC-4.3 and AC-4.4 in one falsifiable statement.

### 2. [blocking] PROP-M-18 contradicts FSPEC §2.5 on the already-merged path

PROP-M-18's oracle states: "Every `merged` run recorded **≥ 1 and ≤ 3** merge commands and **exactly one** `_recordQueueRow` call", over a domain that is explicitly "every §11 row".

FSPEC §11 **row 3** is a `merged` run — the PR was already `MERGED` on entry — and FSPEC §2.5 requires it to attempt **zero** merges ("the phase attempts **zero** merges, evaluates **no** guard"), which TSPEC §13.3 restates as "row 3 asserts zero merge commands" and PROP-M-16 itself relies on by running the annotation power set over "both row 18 and row 3". As written, PROP-M-18 asserts of row 3 the opposite of what the FSPEC requires: a correct implementation reds it, and the only way to make it green is to merge a PR that is already merged — the NFR-5 idempotence violation this feature exists to prevent.

**Fix:** split the merge-command conjunct by resolving row — `row === 18` ⇒ 1 ≤ n ≤ 3; `row === 3` ⇒ n === 0; every non-`merged` row ⇒ n === 0 — keeping "exactly one `_recordQueueRow` call" across both merged rows, which is correct as stated and is the conjunct that carries AC-5.2's recovery.

### 3. [advisory] AC-4.0 has neither a property nor a declared justification

AC-4.0 — CI evidence is established **at merge time**, not inherited from Phase PUB's snapshot — is a safety commitment (it exists to stop a merge on stale evidence) and appears in no property's trace and in no §7 exclusion. I believe it is in fact structurally guaranteed: `decideMerge` sees only `record.ci`, which comes from `O2`, and PROP-M-02's purity property pins the outcome as a function of `(record, config)` alone, so there is no path by which the report's `ciStatus` could influence it. That argument belongs in §7's exclusion list rather than in a reviewer's head — one line, naming PROP-M-02 as the structural carrier. If the author would rather quantify it, the natural form is a differential over an injected Phase PUB `ciStatus` that must not change any outcome.

### 4. [advisory] PROP-M-06's "exactly one notice" collides with FSPEC §9.4

PROP-M-06's oracle asks for "exactly one notice equal to `MERGE ESCALATION: self-modification guard fired …`". A guard-fired run reports `refused`, and FSPEC §9.4 requires **every** `deferred` and `refused` run to emit an additional plain merge-deferred note — so the notices channel carries two lines, not one. The intent is clearly "exactly one **escalation**" (PROP-M-19 treats notes separately), but read literally the property fails on a correct implementation. Reword to "exactly one line beginning `MERGE ESCALATION: `, equal to …, plus the §9.4 note and nothing else", which also makes the §9.4 note's presence on the guard path an asserted fact rather than an accident.

### 5. [advisory] PROP-M-19's coverage conjunct is not satisfiable inside its stated domain

PROP-M-19 requires the observed union to cover **every** member of `MERGE_ESCALATIONS` (4) and `MERGE_NOTES` (7) — the counts are right, I checked them against TSPEC §10.2. But its domain is "PROP-M-16's and PROP-M-17's runs", and two of the seven notes cannot arise there: §10.3's malformed-`merge`-section note needs a fixture whose config section is present but not an object, and the missing-`prNumber` note needs a merged run whose `prUrl` neither `parsePrRef` nor `O1.number` can resolve. Neither is in the 25-row table or the annotation power set. Add those two fixtures to PROP-M-19's domain explicitly — otherwise a correct implementation reds, and the likely repair under time pressure is to weaken the conjunct that makes the catalogue closed.

### 6. [advisory] Traceability: three ACs are pinned by an oracle but not cited, and four structural ACs are neither cited nor declared

Every property does have an owning PLAN task and a file that exists in PLAN §4's manifest — I checked all twenty, including PROP-M-17's three-file spread under A8 and PROP-M-15's B2/B3 split. The gaps are in the AC column: **AC-2.1/AC-2.2** (rebase first, merge commit second) are asserted by PROP-M-11's `["rebase","merge"]`-in-order oracle but traced only to AC-2.4; **AC-5.1** (the row goes to `done`) is asserted by PROP-M-14 and PROP-M-15 but traced to AC-5.3/AC-5.5; **AC-7.2** (`mergeMode` ships `off`) is asserted by PROP-M-09's frozen-defaults snapshot but traced to AC-7.1/AC-7.3. Add the three citations. Separately, **AC-1.1** (placement after Phase PUB), **AC-1.2** (the composite precondition list), **AC-2.5** and **AC-4.1** appear in no property and no exclusion; each is genuinely structural or a single branch, so a one-line addition to §7's exclusion list is all that is needed — the DoD phase reads that list as the completeness argument.

### 7. [advisory] AC-1.2a's exclusion is the one weak justification

§7 excludes AC-1.2a (bounded re-reads) as a "counting behaviour whose whole content is an exact number and an exact reason string". That reasoning fits AC-2.3/AC-2.5b, but AC-1.2a now has a **bounded** domain — `mergeableRetries ∈ 0…10` since TSPEC §3.1's cap — and PROP-M-01 already re-runs the loop at the cap, so the quantified form is eleven enumerated cases: for every `R`, an exhausting run makes exactly `1 + R` observations and the reason line interpolates that same count. TSPEC §13.2 samples only `{0, 1, 3}`. I would rather see the conjunct added to PROP-M-01 than the exclusion argued; if the author disagrees, the exclusion should at least say why the eleven-value sweep is not worth its cost.

### 8. [advisory] What the document gets right, recorded for harvest

Four of the six safety commitments in my brief are pinned exactly as I would want them, and two of the framings are reusable beyond this feature. **Guard dominance** (PROP-M-06) is scoped honestly — dominance is claimed only over the guards *below* it, and the five conditions that legitimately preempt it are excluded *and* asserted as a control block, so the exclusion is evidenced rather than assumed; that is the difference between a true property and a nearly-true one. **No-override** (PROP-M-07) is stated as `result ⊇ defaults` for every input including hostile shapes, which is irremovability rather than "the defaults are there in the cases we tried". **Squash unreachability** (PROP-M-11) asserts absence from the array *and* carries a positive control that an implementation deleting squash entirely also reds — the asymmetry that stops a negative property from passing vacuously. **`merged`-never-downgraded** (PROP-M-16) takes the full power set of the four annotations over both merged rows, which is the right shape for a commitment whose failure mode is a rare combination. §1.2's refusal to add `fast-check` and §1's rule 4 ("no property asserts only an absence") are the two general rules I would promote at harvest. And to answer the question directly: **no property here is an example test wearing a quantifier** — AT-M1, AT-M2, AT-M5 and AT-M6 appear as *points inside* quantified domains rather than as the domains themselves.

## Verdict

VERDICT: REVISE
{"high": 2, "medium": 0, "low": 6}
