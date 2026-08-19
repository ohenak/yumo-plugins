# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.2, bytes unchanged)
**Date:** 2026-08-20
**Iteration:** 4
**Scope:** Upstream-cascade confirmation only. PLAN's own bytes did not move; TSPEC moved v1.6 → v1.7 (erratum round, Phase P). Question answered: does PLAN still hold against TSPEC as it now stands?
**Prior review:** `CROSS-REVIEW-product-manager-PLAN-v3.md` (Approved with minor changes; 0 High, 0 Medium, 2 Low)

## Confirmation basis

PLAN bytes are unchanged since approval: `git log c8981e48..HEAD -- PLAN-pdlc-advisory-wave-gate.md` returns
no commits, and `git diff --stat` over the same range is empty. The approval recorded
`UPSTREAM-STATE: TSPEC sha256:0610e311…`; TSPEC at HEAD hashes `sha256:c0ee14a4…`, so the anchor is
genuinely stale and this confirmation is owed.

Seven commits moved TSPEC v1.6 → v1.7. I re-read each changed passage at HEAD and asked, per passage,
whether PLAN is still a faithful compression of it — not whether the routed item list landed.

| TSPEC v1.7 change | PLAN's corresponding text | Still faithful? |
|---|---|---|
| §5.1 / §4.4 re-home the engine expectation off `ci-arrangement.test.js` onto a purpose-named new file `pdlc/engine/__tests__/advisory-config-example.test.js` | A6-04's owning-file cell, the file-ownership manifest row (`:139`), and §Overview (`:31`) all already name `advisory-config-example.test.js` | **Yes.** PLAN led here; TSPEC caught up. |
| §4.4 / §5.1: example gains the **whole** `advisory` section `{"enabled": false, "waveBudgetPerRun": 1}`, not `waveBudgetPerRun` alone | A6-06 says "gains **whole** `advisory` section, not just `waveBudgetPerRun`", with the E-33 pairing rationale | **Yes.** |
| §4.4 / §5.1: the new expectation asserts `advisory` parses and **carries `enabled` and `waveBudgetPerRun`**, the latter a non-negative integer (TE F-34) | A6-04 states the assertion as "`advisory` section parses and carries `waveBudgetPerRun`, a non-negative integer" | **No** — see F-01. |
| §1.3's enumeration grows from six shipped surfaces to **eight** | A6-03 opens "the six collateral transcription surfaces §1.3 names" | **No** — see F-02. |
| §5.6's discharge rule corrected from one-red-test-row-per-AT to **set-equality of AT ids** against PLAN's own AT-coverage table | PLAN carries an `### AT coverage` table; it holds no stale row-per-AT rule | **Yes**, and the set-equality now demanded actually holds — see below. |
| §3.2 step 2 takes a resolved `advisoryTierOn` boolean, performs no `.enabled` read, PROP-DIS-06 stays at exactly three tokens | A6-18 already carries `advisoryTierOn`, the "no `.enabled` read" constraint, and the exact-count-of-three oracle | **Yes.** PLAN v1.1/v1.2 drove this. |
| §4.3 reconciles `ledgerAnchor`'s creation onto the step-4 site, stating Phase P transcribes neither site | PLAN's five `ledgerAnchor` mentions are all behavioural (mutated in place, `value === 2`/`=== 4` fixtures); none pins a creation site | **Yes.** No PLAN obligation was created. |

**§5.6 set-equality, mechanically checked.** TSPEC's new rule is the one thing in this round that
imposes a *checkable* global obligation on PLAN, so I ran it rather than reading it: the AT ids in
TSPEC §5.6 and the AT ids in PLAN's `### AT coverage` table are both 47, and the two sets are equal —
no TSPEC-only ids, no PLAN-only ids. The corrected rule is satisfied by PLAN exactly as it stands,
with no edit owed. (My first pass reported four missing ids; that was my own window truncating PLAN's
table at line 300 when it runs to 306. Re-run over the full table, the sets are identical.)

## Findings

Two findings, both introduced by this round's TSPEC edit rather than by PLAN. No High.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **A6-04's red-test assertion no longer matches the expectation TSPEC now specifies: `enabled` is missing from the asserted key set.** A6-04 states the new expectation as "example config's `advisory` section parses and carries `waveBudgetPerRun`, a non-negative integer (TSPEC §4.4, §5.1)" — one key. TSPEC at HEAD says, in both places A6-04 cites, that the expectation asserts the section "parses, carries `enabled` and `waveBudgetPerRun`, the latter a non-negative integer" (`TSPEC:1063`, §5.1 manifest row `:1181`, credited TE F-34). This is a two-key assertion cited as a one-key assertion. The gap matters for product reasons PLAN itself states: A6-06 ships the **whole** section precisely because JSON admits no comments and the copied-out block is "the only file that can tell an operator" what `waveBudgetPerRun: 0` **with `enabled: true`** means — E-33's documented "keep tier on, keep A6 off" affordance. With no `pdlc/README.md` row in scope (A6-06, confirmed), that example block is the affordance's sole teaching site, and this new test is its sole guard. An expectation that asserts only `waveBudgetPerRun` stays green if a later edit drops `enabled` from the example, silently retiring the pairing that makes E-33 legible. **Fix:** in A6-04, state the assertion as "`advisory` section parses and carries both `enabled` and `waveBudgetPerRun`, the latter a non-negative integer", matching §4.4 and §5.1 verbatim. One clause; no batching, ownership, or dependency consequence. | E-33; AC-1.4; TSPEC §4.4, §5.1 |
| F-02 | Low | Local | **A6-03's "the six collateral transcription surfaces §1.3 names" is stale: §1.3 now names eight.** `PLAN:97` opens A6-03 with a cardinality borrowed from upstream, and this round's erratum expanded §1.3 from "Six shipped surfaces go red" to "Eight shipped surfaces go red" (`TSPEC:215`), the enumeration having been "short two sites". A reader who follows the pointer counts eight rows and cannot tell from the sentence which are outside A6-03 — in fact two are: the `.enabled` occurrence-count row is a *constraint* on A6 rather than an edit (owned as such by A6-18), and the constants rows belong to A6-02. No implementer loses work, because A6-03 enumerates its own surfaces explicitly in the very next clause and names all four bare row-count sites including `advisoryHarvest.test.js:726`; the count-word is the only stale token. **Fix:** either drop the cardinality ("the collateral transcription surfaces §1.3 names") or scope it ("the four collateral transcription rows of §1.3's eight surfaces"). | PLAN §Batches (A6-03); TSPEC §1.3 |

**Tagged for the erratum protocol:**

FINDING: Medium | delta | local | PLAN §Batches, A6-04 | A6-04 states the engine expectation as asserting `waveBudgetPerRun` alone; TSPEC §4.4/§5.1 at HEAD specify it asserts both `enabled` and `waveBudgetPerRun`, the latter non-negative. `enabled` is the key that makes E-33's "tier on, A6 off" pairing guarded, and the example block is its only teaching site.

FINDING: Low | delta | local | PLAN §Batches, A6-03 | A6-03 cites "the six collateral transcription surfaces §1.3 names"; §1.3 at HEAD names eight. A6-03's own explicit enumeration remains correct and complete, so only the borrowed cardinality is stale.

Both are `delta`: PLAN's text was accurate against TSPEC v1.6 in each case, and it is this round's edit that moved the upstream wording out from under it. Neither is a defect PLAN could have avoided.

## Questions

## Positive Observations

## Recommendation

## Verdict
