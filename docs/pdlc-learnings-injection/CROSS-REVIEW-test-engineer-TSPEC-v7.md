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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **§D.1's fourth field domain and §A.5's "no fixture may assert on the mirror" cannot both be followed literally.** §D.1 (`:588-594`) requires "one test per domain" over four domains, the fourth being `runMirror.corpusOutcome`, qualified as "a membership test only". §A.5 (`:340-345`) says "no fixture in §T.6 may assert on it — an implementation that dropped the mirror entirely would still conform", and FSPEC BR-9 (`FSPEC:537-538`) says of the run-level mirror "nothing asserts on it (AC-3.2)". A membership assertion is still an assertion, and against an implementation that dropped the mirror it reads `undefined` and reds. This is not blocking — this TSPEC decides to carry the mirror, so the test is green against the design it governs, and both sides state the same intent (the mirror is not the oracle) — but a PLAN author reads two instructions and needs one. Cheapest resolution: state in §D.1 that the mirror's domain test is guarded on the mirror being carried, or drop the fourth domain and let the three catalogue closures plus the per-dispatch domain test stand. | §D.1 `:588-594` vs §A.5 `:340-345`, `FSPEC:537-538` |
| F-02 | Medium | Local | **`present` is now justified by a sentence its own next clause refutes.** §I.3 (`:441-448`) says the injector is gated on `config.enabled` **alone** — correct under REQ v0.9 AC-5.1a — and then keeps `present` because "AC-5.1a's report distinction … must still be expressible: `buildFinalReport` receives `undefined` when, and only when, `config.enabled` is `false`". If key presence is decided by `enabled` alone, `present` is not what expresses the distinction, and no test in §T.5/§T.6 asserts on it beyond the shape assertion at `:966-968`. A field carried in a returned shape with no consumer and no behavioural oracle is the dead-config shape DC-07 warns about. Either name a real consumer (the `NTC-MALFORMED`-vs-absent-section reporting split reads like the intended one, since §I.3's rows 1 and 3 differ only in whether the section was present) or say plainly that `present` survives as parser-diagnostic state, tested only for shape. | §I.3 `:441-448`, §T.5 `:966-968` |
| F-03 | Low | Local | **No closure test remains over `ruleInputs`' own key set.** v6's row asserted set equality over `Object.keys(ruleInputs)`; the split correctly replaced it with the two per-locus tests, but nothing now reds if a future rule input is added as a third `ruleInputs` sibling of `thresholds` rather than inside it. Upstream requires two tests and gets two, so this is additive; §D.2's `runMirror` sibling is the precedent showing the record level is unclosed. | §T.2 `:645-652`, §D.2 `:598-612` |

DEFERRED: §T.2's BR-10 locus-1 row folds two distinct set equalities (the dispatch record's rule-input field set, and each `orderKeys[j]` entry's keys) into one cell — worth two rows when PLAN transcribes it.
DEFERRED: §D.1's "four field domains" and "D.1's three catalogues" sit one line apart in §T.2's table; a half-sentence saying why the counts differ would save the PLAN author a re-derivation.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does the `DIVERGENT-CORPUS` fixture's dispatch 5 still produce BR-8 rows "present and empty" *and* a `corpusDiverged: true`, i.e. do both the corpus-outcome branch and the divergence comparison run on a dispatch whose listing failed? §T.6 asserts both; §A.5's rule defines `corpusDiverged` over `{corpusOutcome, orderKeys}`, so it should hold, but the fixture is the one place where a failed listing and a divergence flag co-occur and it is worth one explicit sentence for the implementer. |

## Positive Observations

- **The revision moved oracle loci without moving the mechanism, exactly as v6 predicted it could.** `dispatches[i].{corpusOutcome, orderKeys, corpusDiverged}` were already designed; this round re-pointed the assertions onto them and deleted the run-level oracles. That is the cheap shape of a spec correction, and it kept `DIVERGENT-CORPUS` — the fixture doing the real falsifying work — intact.
- **The completeness split is stated as a red-test property, not as a bookkeeping change.** "A containment-shaped test over one merged record would not red when a per-dispatch member is deleted" (`:641-644`) is the deleted-case-must-red obligation named in the document that PLAN derives from, which is where it is cheapest to honour.
- **Closed errata are closed with their resolutions transcribed and their rejected alternatives retained.** ERR-4, ERR-6 and OQ.2 each carry what REQ v0.9 decided *and* what this TSPEC had provisionally carried, so the DECISIONS reader can see the shape of the correction rather than only its outcome.
- **`corpusDiverged`'s justification was rewritten on its own terms.** It no longer defends last-write-wins; it defends `dispatches.every(r => r.corpusDiverged === false)` as a one-line stable-corpus oracle with a defined value on the first dispatch. That is a falsifiable positive assertion, not an absence-shaped one.
- **The `main`/`mainDev` correction is the kind of small factual fix that stops a PLAN task from being written against a symbol that does not exist.** Verified at HEAD.

## Recommendation

**Approved with minor changes.** Every High finding I raised in v6 is resolved, and resolved at the
locus upstream settled on rather than by re-wording around it. Nothing in the delta breaks a claim
that held before, and no load-bearing claim contradicts the repository or REQ/FSPEC v0.9 at HEAD —
I re-checked the five seam sites, the export name, the test-import pattern, the config-state rows
against FSPEC E-21…E-34, and the bare-repository premise in code rather than in prose. F-01 and
F-02 are wording repairs a PLAN author can absorb; neither changes a fixture, a suite assignment or
the 35-AT closure.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3
APPROVAL-HASH-NORMALIZED: sha256:91726204b43da70f7025bd7e0423498212e5dea7f4ecf377de823f5868c6d7af
REVIEWED-COMMIT: ccc739d1bb1edaca2e650864bed3422f5c587e14
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:256537d8208acce044d199dbd66f35b4888140d6253a1f09e9b91dc82b7c4b18
