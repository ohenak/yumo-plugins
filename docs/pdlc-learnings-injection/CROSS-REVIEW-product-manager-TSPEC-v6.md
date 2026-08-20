# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 6

**Scope of this delta re-review.** The TSPEC is **byte-unchanged** since the state I approved at
v5: `git diff 16f30820..HEAD -- TSPEC` is empty, and the file hashes to
`sha256:72712bd8…`, exactly the `APPROVAL-HASH` recorded in
`CROSS-REVIEW-product-manager-TSPEC-v5.md`. There is no delta to scan for new issues.

What *did* move is the upstream this document is grounded on. My v5 `UPSTREAM-STATE` recorded
FSPEC `sha256:57b71e0c…`; FSPEC is now `sha256:256537d8…` (v0.9, `cbb0a63e`, plus the v0.8
re-grounding `a6b42bae`). REQ is unchanged at `sha256:ff605dd3…` (v0.9). Under the frozen-round
bar this round is therefore judged on criterion (ii) alone — **factual contradiction with an
upstream document at HEAD, on a load-bearing claim**. Two such contradictions are live, both
`inherited` and `nonlocal` by construction (there was no edit to make anything `delta` or `local`).

Both are already named as obligations by documents downstream of this one: `D-O-9` in
`DECISIONS-pdlc-learnings-injection.md:664` and `SE-O-1` in
`CROSS-REVIEW-software-engineer-REQ-v11.md:133`. Neither has landed. I am not opening a new
decision here — I am recording that the decisions already taken upstream are not yet reflected
in this document, and that PROPERTIES and PLAN authors read *this* document.

## Prior findings disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 (v5) — §(d) prose says "four hand-written hops", table beneath enumerates five edit sites | Low | **Not addressed** — TSPEC unchanged since `16f30820`. Restated below as F-03; still non-gating, still a one-word fix. |
| F-02 (v5) — §(d) names the edit site `mainDev`, the test file's alias, not the production symbol `main` | Low | **Not addressed** — same reason. Restated below as F-04. Re-verified at HEAD: the production default export is `main` (`pdlc/workflows/orchestrate-dev.js:11982`); `mainDev` exists only as the test alias in `advisoryDisabled.test.js:70`. |

Nothing I approved in v1–v5 has been reopened by an edit, because there were no edits. The two
new High findings below are not re-litigation of approved sections: they are sections that were
correct-against-upstream when I approved them and have since been **overtaken by upstream
revisions**, which is precisely the contradiction-with-upstream case the frozen bar reserves.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **FINDING: High \| inherited \| nonlocal \| TSPEC:432,435,448,1179,1183-1184,1228 \| The injector's build gate contradicts REQ v0.9 AC-5.1a and AC-5.1b, and the contradiction is load-bearing for the acceptance tests PROPERTIES will author.** TSPEC:435 states the injector is built "**only** when `present && config.enabled && !sectionMalformed`", and `buildFinalReport` receives `undefined` otherwise. REQ v0.9 says the opposite on both extra conjuncts, in the reviewed bytes: AC-5.1a — "An **absent configuration section is not this state**: no consumer repository carries the section at HEAD, so absent must read as §4.1's declared defaults, which leave `enabled` at `true` and the run injecting under AC-1.1. Disablement is an explicit act, and **there is no second gate beyond this key** (G-1)" (`REQ:378-385`); AC-5.1b — "the run stays **enabled** on §4.1's declared defaults **and** the report carries a catalogued notice naming the malformed section" (`REQ:386-393`). So `present` is a second gate REQ forbids, and `!sectionMalformed` fails *closed* where REQ decided fail-*open*. §4.1's table row is `learningsInjection.enabled \| true \| consumer config` (`REQ:223`), with no `present` predicate anywhere. FSPEC has already re-grounded and explicitly leaves this correction to TSPEC: "already settled stays written: Step 0(2) and BR-14 read an absent section as REQ §4.1's declared `enabled: true`, with no second gate key (REQ v0.9 AC-5.1a). No behavioural change; the gate correction is TSPEC's to land" (`FSPEC:39-42`). The document also still carries the question as **open** — the rejected-alternatives row reads "**Not decided here — see OQ.2 and ERR-4**" (`TSPEC:1179`), `OQ.2` is listed under "Still open" and "*Blocked on the REQ erratum ERR-4 raises*" (`TSPEC:1183-1184`), and `ERR-4` routes it to REQ (`TSPEC:1228`). It is not open; REQ v0.9 closed it, and `DEC-LI-07` records that ("REQ v0.9 has since settled it", `DECISIONS:391`). Product consequence, which is why this blocks: the consequence sentence at `TSPEC:1189` — "on the shipping default, AC-1.1's *then* does not hold in this repository" — is now a false statement about the shipped contract, and `AT-31`/`AT-32` authored from §I.3 would **red a correct implementation**. The three routed derivations agree the divergence table's last row (`TSPEC:432`) and the malformed row (`TSPEC:448`) move on the same edit. **Fix:** drop the `present` and `sectionMalformed` conjuncts from §I.3 so the gate is `config.enabled` alone; correct the divergence row at `:432` (an absent section reads as defaults, `enabled` stays `true`); correct the malformed row at `:448` so `sectionMalformed` yields an **enabled** run plus `NTC-MALFORMED` rather than an absent `learningsInjection` key; close `OQ.2` and retire `ERR-4` as settled upstream; replace the `:1179` row with the decided reading. | REQ G-1, AC-1.1, AC-5.1a, AC-5.1b, §4.1; FSPEC `BR-14`, Step 0(2); DECISIONS `DEC-LI-07`, `D-O-9` |
