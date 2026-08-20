# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 7
**Scope:** frozen delta re-review. Base `2d26d4b0` (the commit carrying my v6) → HEAD `ccc739d1`;
the TSPEC moved 0.5 → 0.6 across nine commits (`c4fd70bf` … `ccc739d1`, +177/−139). Upstream did
not move in this window: REQ sits at v0.9 and FSPEC at v0.9, the same bytes v6 reviewed against.
The only question this round names as blockable: did the revision break something that worked, or
does a load-bearing claim now contradict the repository or upstream at HEAD? Neither, in the
sections I own.

## Verification of my v6 blocking findings

| v6 ID | Was | Now | Verdict |
|---|---|---|---|
| F-01 (High) | one BR-10 closure claim over `Object.keys(ruleInputs)` while upstream requires two, one per locus | §T.2 splits it: **locus 1 = per dispatch** (`orderKeys`, entries' `path`/`orderKey`, set equality over `Object.keys(dispatches[i].orderKeys[j])`, "asserted on `dispatches[i]`, never on the mirror") and **locus 2 = run** (set equality over `Object.keys(ruleInputs.thresholds)`), matching FSPEC BR-10's table and its "**two** completeness tests … one per locus" (`FSPEC:544-556`). The added sentence naming the containment-shaped merged test as the thing that would *not* red on a deleted per-dispatch member is the deleted-case-must-red property stated in the right place. | **Resolved** |
| F-02 (High) | `DIVERGENT-CORPUS` pinned run-level `corpusOutcome`/`ruleInputs` to dispatch 5, i.e. asserted on a value upstream leaves free | §T.6's fixture now asserts on the per-dispatch locus only — `dispatches[1..2].orderKeys` original, `[3..4]` grown, `dispatches[5].corpusOutcome === "RSN-UNLISTABLE"` with that dispatch's BR-8 rows present-and-empty, `corpusDiverged` true on exactly 3 and 5 — and states it asserts nothing about `runMirror`. Positive-conjunct shaped throughout; no absence-only oracle. | **Resolved** |
| F-03 (High) | §A.5 routed ERR-6 as an open question REQ had already answered; front matter cited FSPEC v0.5 | ERR-6 and ERR-4 are both marked CLOSED with the resolution transcribed, §OQ.2 is closed rather than "blocked on", and the front matter now cites FSPEC v0.9 + REQ v0.9. The "Settled upstream" rows in DECISIONS carry the rejected alternative rather than deleting it. | **Resolved** |
| F-04 (Medium) | §D.1's disjointness had three field domains while §D.2 put a corpus outcome on the dispatch row | §D.1 now names four domains — `rejected[].reason`, `dispatches[i].corpusOutcome` (oracle locus), `runMirror.corpusOutcome`, `notices[].id` — and §T.2's BR-9 row follows. See F-01 below for the residue. | Resolved, one Medium residue |
| F-05 (Medium) | AT-20/AT-22 assigned L1/L2 after FSPEC v0.9 re-scoped their second halves onto a multi-dispatch run | §T.5's `learningsRecord.test.js` row now splits the layer: L1/L2 for AT-17/18/19/21, **L3 for AT-20 and AT-22**, driving `DIVERGENT-CORPUS`. The 2+9+3+3+6+12 = 35 arithmetic is undisturbed (I re-added it). | **Resolved** |

## Repository checks (claims changed by this delta, verified against code, not prose)

- The five-hop seam table (`:222-231`) is accurate at HEAD: `export default async function main`
  (`orchestrate-dev.js:11982`), the enumerated `wrapperSeams` literal (`:12381-12394`, spread at
  `:12406`), `reviewLoop`'s fixed destructure (`:7266+`), its `wrapped` closure re-listing exactly
  seven seams by hand — `_agent, _readFile, _listFiles, _probeDoc, _probeReviewState, _log, _git`
  (`:7342-7357`) — and `dispatchAndVerify`'s matching seven-seam destructure (`:8862-8878`). The
  v6-era "four hops / `mainDev`" wording was wrong about the symbol; the fix is right about it.
- §T.5's pattern claim holds verbatim: `advisoryDisabled.test.js:70` is
  `import mainDev, * as dev from "../orchestrate-dev.js"`, i.e. the default export bound under a
  local alias, which is what the revised sentence now says.
- REQ v0.9's fail-open resolution is where §I.3 says it is (`REQ:378-395`), including "no second
  gate beyond this key", the malformed-section fail-open, and the `parseImplementationConfig`
  precedent — which exists at `orchestrate-dev.js:191`.
- §I.3's four-state table maps onto FSPEC v0.9's rows exactly: E-21 absent ⇒ enabled, no notice;
  E-22 `enabled:false` ⇒ baseline-identical, no key; E-23 malformed ⇒ enabled + `NTC-MALFORMED`;
  E-34 wrong-typed ⇒ enabled + `NTC-KEYTYPE` (`FSPEC:716-722`). Owning ATs match FSPEC's column.
- No consumer `learningsInjection` section exists at HEAD (`.claude/` carries only
  `pdlc.config.example.json`), so AC-1.1's bare-repository premise the delta now leans on is true.
