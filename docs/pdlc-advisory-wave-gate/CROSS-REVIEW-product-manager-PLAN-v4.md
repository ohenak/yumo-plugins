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

| ID | Question |
|----|---------|
| Q-01 | Non-blocking, for whoever lands F-01. TSPEC §4.4 scopes non-negativity to `waveBudgetPerRun` ("the latter") and asks only that `enabled` be *carried*. Is a presence check on `enabled` the intent, or should the expectation also pin it to `false` — matching the shipped default and the example's own honesty about the tier's ship state? I read TSPEC as deliberately asking only for presence, so that a future operator-facing example flipping the demo value does not redden the engine suite. Worth one clause in A6-04 either way, so the implementer does not have to guess. |
| Q-02 | Carried unchanged from v3, still non-blocking: the `enabled: true` + `waveBudgetPerRun: 0` affordance remains discoverable only to an operator who opens the example and infers the pairing. No REQ or FSPEC row asks for more, so this is not a finding — but it stays a good candidate for a one-line note in this feature's LEARNINGS, so a future operator-documentation pass picks it up. |


## Positive Observations

- **The re-home landed in PLAN before TSPEC, and PLAN's version was the better-argued one.** A6-04
  already carried the purpose-named-file decision with four grounds — `ci-arrangement.test.js`'s
  self-declared single oracle (`:1`–`:21`), its zero occurrences of `advisory`, the fact that it
  already reads the example config for an unrelated reason (`:39`, `:799`–`:825`, annotated in-file),
  and the delivery-blocking consequence of parking a config-schema assertion on a required check.
  TSPEC v1.7 adopts the decision and the reasoning. This is the cascade working in the healthy
  direction: the downstream document found the defect, and the erratum round made upstream say what
  the implementers had already reasoned their way to.

- **The §5.6 correction cost PLAN nothing because PLAN was already built the right way.** TSPEC's
  old one-red-test-row-per-AT rule would have demanded forty-seven red-test tasks and collided with
  the batch-safety rules — A6-15 alone owns nineteen ATs in one file. PLAN never encoded the
  cardinality rule; it built an AT-coverage table instead. When TSPEC corrected the obligation to
  set-equality of ids, PLAN satisfied the new rule on the first check with zero edits. Compressing
  upstream's *intent* rather than its *phrasing* is what made that free.

- **A6-06 already says "whole `advisory` section, not just `waveBudgetPerRun`", with the reason.**
  The single most likely way to under-deliver this round's TSPEC change would be to ship the example
  with only the budget key. PLAN pre-empted it, and stated the E-33 rationale inline rather than
  citing it — which is why F-01 is a one-clause omission in the *test* row rather than a real gap in
  the delivered artifact.

- **Citation discipline held across a fourth round.** Every PLAN citation I re-ran against HEAD in
  this pass still lands: the four bare row-count sites, `orchestrate-dev.js:14398`–`:14406`,
  `docs-uniqueness.test.js:122`–`:123`, `pdlc/README.md:139`/`:145`. Across four rounds I have not
  found a citation in this PLAN that does not verify.


## Recommendation

**Approved with minor changes** — the prior approval still holds against TSPEC v1.7.

PLAN remains a faithful compression of TSPEC as it now stands. Of the seven passages this erratum
round moved, five leave PLAN exactly right — three because PLAN drove the change and upstream caught
up (the engine-test re-home, the whole-section example, `advisoryTierOn`), one because PLAN compressed
intent rather than phrasing and satisfied the corrected §5.6 rule unedited, and one because TSPEC
explicitly leaves it untranscribed (`ledgerAnchor`'s creation site). The set-equality obligation §5.6
newly imposes was checked mechanically, not read: 47 ids on both sides, sets identical.

Two passages left stale text in PLAN, neither gating:

1. **A6-04 should assert `enabled` as well as `waveBudgetPerRun`** (F-01, Medium). One clause. The
   shipped artifact stays correct either way — A6-06 delivers the whole section — but without this
   the affordance's only guard is one key thin.
2. **A6-03's "six ... surfaces §1.3 names" should read eight, or drop the count** (F-02, Low).
   Cosmetic; A6-03's own enumeration is complete and correct.

No High finding, so this does not re-open the document. Both fixes are single-clause edits to task
prose that touch no batching, ownership, dependency, or AT-coverage structure; they can ride the next
edit that opens PLAN for any reason. If none occurs, shipping as-is costs the guard on `enabled` and
nothing else.

**Note on this dispatch:** the completeness-gate headings supplied in my instructions
(`## Overview` / `## Batches` / `## Dependencies` / `## Verification`) are PLAN's headings, not a
cross-review's. I have written this file in the cross-review format my role defines. Flagging in case
the gate is pointed at review files by mistake.


## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f
APPROVAL-HASH-NORMALIZED: sha256:ec835eb6623d8fd50edb4cdfd2134def0edb8e7083ae04eee5fb1c1c62c0d2f3
REVIEWED-COMMIT: 350980b213efb61c87a4fdecd95db751ece31e52
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:c0ee14a4e69efd994c5d1d4d0c1d0b32c9f0e31e948a6f37127a209b1e20585a
UPSTREAM-STATE: DECISIONS sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
