# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.2, bytes unchanged)
**Upstream that moved:** `TSPEC-pdlc-advisory-wave-gate.md` v1.6 → v1.7
**Date:** 2026-08-20
**Iteration:** 4

## Scope

Upstream-cascade confirmation, not a re-review. PLAN's own bytes are unchanged since the v3
approval (`REVIEWED-COMMIT: c8981e48`); the approval went stale only because TSPEC moved from
`sha256:0610e311…` to `sha256:c0ee14a4…` in a Phase P erratum round. One question answered: does
PLAN still hold as a faithful compression of TSPEC **as it now stands**? Measured against upstream
text at HEAD, not against the raised-item list.

Method: diffed TSPEC across the round (`git diff c8981e48..HEAD`, 111 insertions / 21 deletions,
confined to the changelog, §1.3, §3.2, §4.4, §5.1, §5.6 and the §3.3 `ledgerAnchor` paragraph),
re-read each PLAN passage that leans on those sections, and re-derived the two claims the round made
newly checkable — §1.3's surface enumeration and §5.6's set-equality discharge rule — mechanically
rather than by reading. Settled decisions from rounds 1–3 were not reopened.

The headline finding is a pleasant one: **this erratum round moved TSPEC toward PLAN, not away from
it.** TSPEC v1.7's own changelog states the cause — "TSPEC prose had gone stale against PLAN
v1.1/v1.2 design changes." Five of the six raised items are upstream catching up to design decisions
PLAN already carried and this reviewer already verified in rounds 2 and 3. The sixth (§5.6) imposes
a genuinely new obligation on PLAN, and it is discharged exactly.

## Upstream delta, item by item

| # | TSPEC v1.7 change | Does PLAN still hold? | Evidence |
|---|---|---|---|
| 1 | §1.3: six → **eight** shipped surfaces; new bare-row-count row naming **four** sites | **Holds** — PLAN said this first | PLAN's Overview already reads "**Eight** shipped surfaces" (PLAN:47) and A6-03 already names all four sites, `advisoryHarvest.test.js:571` and `:726` included (PLAN:97). Landed in PLAN v1.2 per its changelog (PLAN:14); verified by this reviewer in v3. TSPEC has now caught up. |
| 2 | §1.3: `.enabled`-count row stays **three**, unchanged, and constrains A6 | **Holds** | PLAN A6-18 states the same count and the same three sites — `orchestrate-dev.js:3258`, `:13678`, `orchestrate-queue.js:1318` (PLAN:112) — and carries the same oracle anchor `advisoryDisabled.test.js:634`–`:658`. |
| 3 | §3.2 step 2: tier **gate** duplicated, tier **read** not; `runWaveGateSeam` receives a resolved `advisoryTierOn` boolean and performs no `.enabled` access | **Holds verbatim** | PLAN A6-18 already says "implemented by **receiving the already-resolved `advisoryTierOn` boolean** (`orchestrate-dev.js:13678`) as a parameter and performing **no new `.enabled` read**", and repeats TSPEC's own "What A6 needs duplicated is the tier *gate*, not the tier *read*" (PLAN:112). PLAN v1.1 changelog records it (PLAN:13). The signature block TSPEC added (`advisoryTierOn, // resolved boolean`) matches PLAN's description exactly. |
| 4 | §4.4/§5.1: engine expectation re-homed off `ci-arrangement.test.js` onto new `pdlc/engine/__tests__/advisory-config-example.test.js`; example gains the **whole** `advisory` section `{"enabled": false, "waveBudgetPerRun": 1}` | **Holds** — again PLAN-first | A6-04 owns `pdlc/engine/__tests__/advisory-config-example.test.js` and gives TSPEC's four-part justification (PLAN:98); A6-06 already specifies the **whole** section with `enabled` alongside, and the "no `pdlc/README.md` edit in scope" exclusion with its four independent reasons (PLAN:100). Manifest rows agree (PLAN:139, :141). TSPEC's map now says "earlier drafts of this map named `ci-arrangement.test.js`, corrected by erratum" — PLAN never carried the stale name. Re-verified at HEAD: the new file is absent, `.claude/pdlc.config.example.json` has 0 `advisory` occurrences, `pdlc/README.md` has 0. |
| 5 | §5.6: discharge rule corrected from "one red-test row per AT" to **set-equality of AT ids** against PLAN's own AT-coverage table | **Holds — and this one is newly load-bearing on PLAN; re-derived mechanically** | This is the only item that imposes a fresh obligation on PLAN rather than ratifying one. Extracted the AT id set from PLAN's `### AT coverage` table (PLAN:251–305) and from TSPEC §5.6, sorted both, and diffed: **47 ids each side, and both `comm` directions empty.** Exact set-equality, no near-miss. TSPEC's stated reason for the correction is also sound and matches PLAN's real shape — a row-per-AT rule would demand 47 red-test tasks and collide with batch-safety rule 2's single-writer constraint, which is precisely why A6-15 alone covers nineteen ATs in one file (PLAN:109). |
| 6 | §3.3: `ledgerAnchor`'s two stated creation sites reconciled onto the step-4 site; per-wave guarantee restated as inherited rather than transcribed | **Holds; no PLAN change owed** | TSPEC explicitly discharges Phase P here — "Phase P need not transcribe" either the carrier lifetime or the per-wave guarantee. PLAN correspondingly transcribes neither: A6-13 states only the fail-closed initialisation `{value: -1}` and A6-14 only the mutate-in-place/never-reassign rule with the driver's shallow-copy anchors `orchestrate-dev.js:3499`, `:3503` (PLAN:107–108). Nothing in PLAN cites the retired dual-site wording, so the reconciliation strands no PLAN sentence. |

Also checked and unaffected: §3.2 step 6's gate-sequence tokens, which PLAN A6-18 compresses as
"comparing the tokens appended since the last `apply` against the wave's own configured gate
sequence" and A6-15 pins concretely as `["post-wave","test","post-wave","test"]` (PLAN:109, :112) —
consistent with TSPEC's `["post-wave", "test"]` / `["test"]`-alone reading of `implConfig`.

## Findings

No delta findings. PLAN is not made unfaithful by any part of the TSPEC edit. One inherited
observation, recorded because a file-map asymmetry is the kind of thing that goes unnoticed until an
implementer trusts the wrong map, and one carried-forward pair from v3.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **TSPEC §5.1's file map omits `pdlc/workflows/__tests__/advisoryQueueSeams.test.js`, which TSPEC §1.3 requires be edited — PLAN is the more complete document here, so no PLAN change is owed.** Diffing the two path sets: PLAN's ownership manifest carries fifteen paths, TSPEC §5.1's map fourteen, and the one PLAN-only path is `advisoryQueueSeams.test.js`. It is not optional — §1.3's own bare-row-count row names `advisoryQueueSeams.test.js:627` as one of the four sites that must flip `5`→`6`, and PLAN correctly assigns it to A6-03 (PLAN:97) with a manifest row. **Tagged `inherited`, not `delta`:** the file was absent from §5.1 before this round too (verified against `c8981e48` — zero occurrences in §5.1 pre-round), so the erratum neither caused nor was asked to fix it. The consequence is bounded because Phase I's ownership gate reads PLAN's manifest, not TSPEC's map, so the edit is owned, committed and gate-visible regardless. Worth an eventual TSPEC row for map/§1.3 self-consistency; nothing here blocks implementation. | TSPEC §5.1 vs §1.3 |
| F-02 | Low | Local | **v3's F-01 is unresolved: the DoD engine row's sentence is still truncated.** PLAN:331–333 still reads "…`ci-arrangement.test.js` untouched, and the wave gate never runs" with the trailing clause's head lost (presumably "…never runs it", the point being that `implementation.testCommand` scopes the gate to `pdlc/workflows` and so the engine leg must be run by hand — verified again at `.claude/pdlc.config.json:3`). Carried forward unchanged from v3, where it was explicitly deferred to "a later edit"; PLAN's bytes did not move this round, so its survival is expected, not a regression. Every substantive claim in the row remains checkable. | Definition of Done |
| F-03 | Low | Local | **v3's F-02 is unresolved: A6-03's "Both are folded into an existing batch-1 task" is still stale against the now-four-site list** (PLAN:90/:97). The batch-cap reasoning it guards remains correct and load-bearing — batch 1 sits exactly on `computeTopologicalBatches`' five-task sub-batch cap (`orchestrate-dev.js:10805`), so a sixth batch-1 task would shift downstream `Batch` columns by one. Only the word "Both" is wrong. Also carried forward from v3 and deferred there. | §1.3 / A6-03 |

## Questions

None. v3's Q-01 (whether A6-07's `gatherEvidence` full-output assertion pins a named case) was
answered inside the test design at A6-13, needed no PLAN change then, and is untouched by this
round.

## Positive Observations

- **The §5.6 correction is the rare upstream edit that makes a downstream document *more* checkable,
  and PLAN passes the new check exactly.** Replacing "one red-test row per AT" with set-equality on
  AT ids turns a rule PLAN structurally could not satisfy — 47 red-test tasks would collide head-on
  with batch-safety rule 2 — into one a script can decide in a line. Both sets are 47 elements and
  both `comm` directions are empty. Not "close enough": exact. An oracle that could have been
  written as a vague completeness gesture was instead written as a set relation, which is the form
  that can actually fail.

- **Five of six items were upstream catching up to PLAN, which is the healthy direction for an
  erratum wave to run.** Rounds 2 and 3 pushed corrections up into the design (the four-site
  enumeration, the `advisoryTierOn` parameter, the `ci-arrangement.test.js` re-homing, the
  README-exclusion, the whole-`advisory`-section example); TSPEC v1.7 has now absorbed all five and
  says so in its changelog. The cascade found no place where PLAN had compressed a claim TSPEC no
  longer makes — the usual and more dangerous failure mode.

- **The §4.4 re-homing rationale is a genuine testing-lens improvement, not a relabelling.** Parking
  a config-schema assertion in `ci-arrangement.test.js`, whose stated oracle is FSPEC §5.1's CI
  arrangement alone, would let an unrelated example-config edit redden the delivery-blocking
  `Engine tests (ubuntu-latest)` required check under a scope naming no such concern. TSPEC now
  states that reason in the file map itself, where the next person tempted to hang a schema
  assertion there will read it. PLAN reached the same conclusion first (A6-04).

- **The `.enabled` exact-count oracle survives the design change intact, and PLAN says why.** The
  risk in item 3 is subtle: implementing A6's tier gate the obvious way — a literal
  `config.enabled === false` inside `runWaveGateSeam` — would take PROP-DIS-06's count from three to
  four and redden batch 12, whose gate declares the whole suite green. PLAN A6-18 names that trap
  explicitly, including the fact that the oracle matches `/\.enabled\b/g` over **raw source text**
  so comments and strings count too. That is a falsifiable oracle whose failure mode is documented
  at the point of implementation.

- **The unresolved v3 Lows are correctly-sized wording debt, not deferred risk.** Both are prose
  defects in rows whose substantive claims re-verify at HEAD; neither changes what gets built,
  tested or gated. Deferring them was the right call and remains so.

## Recommendation

**Approved with minor changes.** The v3 approval carries over to TSPEC v1.7 unchanged.

PLAN's own bytes did not move, and the TSPEC edit that staled the approval moved upstream text
*toward* PLAN rather than away from it: five of six raised items ratify design decisions PLAN
v1.1/v1.2 already carried, and each was re-checked here against the new TSPEC wording rather than
assumed. The one item imposing a fresh obligation on PLAN — §5.6's set-equality discharge rule — was
re-derived mechanically and holds exactly, 47 ids to 47 ids with both difference directions empty.
No PLAN passage cites upstream text that TSPEC no longer says, and none says it in a way TSPEC no
longer supports.

Three Low findings, none gating and none requiring a round of their own: F-01 is an inherited TSPEC
§5.1 map gap that PLAN already compensates for (PLAN is the more complete document, and Phase I's
ownership gate reads PLAN's manifest anyway); F-02 and F-03 are the two v3 wording Lows, expected to
survive a round in which PLAN was not edited. Fold all three into any later edit that touches these
documents. Phase P may proceed to Phase I on this PLAN.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

APPROVAL-HASH: sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f
APPROVAL-HASH-NORMALIZED: sha256:ec835eb6623d8fd50edb4cdfd2134def0edb8e7083ae04eee5fb1c1c62c0d2f3
REVIEWED-COMMIT: 350980b213efb61c87a4fdecd95db751ece31e52
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:c0ee14a4e69efd994c5d1d4d0c1d0b32c9f0e31e948a6f37127a209b1e20585a
UPSTREAM-STATE: DECISIONS sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
