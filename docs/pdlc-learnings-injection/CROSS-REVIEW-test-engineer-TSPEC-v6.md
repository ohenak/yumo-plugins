# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 6
**Scope:** frozen delta re-review. The TSPEC's own bytes are **unchanged** since my v5 review
(`git log 16f30820..HEAD -- TSPEC…` is empty; file sha256 `72712bd8…`, identical to v5's
`APPROVAL-HASH`). The delta in this window is **upstream**: FSPEC moved v0.8 → v0.9 (`cbb0a63e`,
"per-dispatch locus for corpus outcomes and ordering keys"), and REQ sits at v0.9 (`ff605dd3…`,
unchanged since v5). So the only question this round can answer is the one the frozen-round rule
names as blockable: does a load-bearing TSPEC claim now contradict an upstream document at HEAD?
It does — in three places, all one decision.

## Delta inventory (upstream)

| Commit | Locus | What moved |
|---|---|---|
| `cbb0a63e` | FSPEC BR-9 (`:511-515`) | Corpus-level outcomes recorded **per authoring dispatch**, not once per run |
| `cbb0a63e` | FSPEC BR-9 (`:535-536`) | "A run-level mirror of either catalogue, if carried, is **additive, not the oracle**: nothing asserts on it" |
| `cbb0a63e` | FSPEC BR-10 (`:546-553`) | Rule inputs split across **two loci** — `orderKeys` per dispatch, `thresholds` once per run — with **two** completeness tests, one per locus |
| `cbb0a63e` | FSPEC AT-20/AT-21/AT-22 (`:849-862`) | All three re-scoped to a **named dispatch**; AT-20 and AT-22 additionally require AT-18's changing-corpus run, where "one run-level field fails" / "one run-level set reproduces at most one of them and fails" |
| (pre-existing at v5, missed by me) | REQ AC-3.2 (`:321-330`), AC-3.3 (`:336-345`) | Same two decisions stated normatively: run-level mirror "has a deliberately unconstrained value that nothing asserts on"; "two completeness tests assert set equality, one per locus" |

Nothing in the TSPEC changed, so nothing this round can be "resolved". The findings below are all
class (ii) — factual contradiction with an upstream document at HEAD.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **BR-10's completeness oracle is one test over a merged run-level record; upstream now requires two, one per locus.** §T.2's enumeration table (`:612`, and its §A.5 row `:614`) reads `BR-10 members | orderKeys, thresholds | set equality over Object.keys(ruleInputs)`, and §D.2's shape (`:579-584`) puts both members inside a single run-level `ruleInputs` object. REQ AC-3.3 (`REQ:342-345`) and FSPEC BR-10 (`FSPEC:546-553`) now split them: the ordering key value per document is recorded **per authoring dispatch, alongside AC-3.1's rows for that dispatch**, thresholds **once per run**, and "**two** completeness tests assert set equality, one per locus (DC-01)". As written, a PLAN author derives one test over one object, and the per-dispatch locus that AT-22's changing-corpus half asserts over has no closure at all — a field can be added to the per-dispatch rule inputs and no set-equality test reds. | §T.2 `:612`, §D.2 `:579-584` |
| F-02 | High | Local | **The `DIVERGENT-CORPUS` oracle asserts on a value upstream declares deliberately unconstrained.** §T.6 (`:948-951`, assertion at `:950`) and §T.2's last row (`:612`) pin "run-level `corpusOutcome` and `ruleInputs` equal dispatch 5's observation" as the load-bearing assertion of the last-write-wins rule. REQ AC-3.2 (`REQ:322-324`) says a run-level mirror "is additive, is not the oracle, and has a **deliberately unconstrained value that nothing asserts on**"; FSPEC BR-9 (`FSPEC:535-536`) repeats it, and FSPEC AT-20/AT-22 (`FSPEC:849-862`) make the *failure* of a single run-level field the thing the test demonstrates ("one run-level field fails"). TSPEC's oracle therefore pins the exact value upstream leaves free, and in the direction opposite to the AT: an implementation that carried no run-level mirror at all — which upstream permits ("if carried") — reds this test. The divergent-corpus proof upstream wants is *per-dispatch reproduction*, which §D.2's `dispatches[i].orderKeys` already carries; only the assertion needs re-pointing. | §T.6 `:948-951`, §T.2 `:612` |
| F-03 | High | Local | **§A.5 states that REQ has not answered the locus question and routes ERR-6; REQ answered it at HEAD, the other way.** `:342-356` reads "AC-3.3 states the reproduction inputs live in the report's **run-level** record", calls the per-dispatch fields TSPEC's "**extension**", and concludes "**Until REQ answers, the run-level record remains the stated locus**". REQ AC-3.3 at HEAD (`REQ:336-345`) states the opposite as settled text: "Reproducibility is claimed **per dispatch, not per run** … one run-level record could not describe both", and the front-matter changelog (`REQ:18`) records "erratum v0.8 moves AC-3.2's not-selected rows and corpus-level outcomes to the same per-dispatch locus AC-3.3 uses". ERR-6 is closed, resolved as the TSPEC hoped; the paragraph's premise, and the design conclusion it licenses (§T.2's and §T.6's run-level oracles, F-01/F-02), are false at HEAD. The document's stated upstream is also stale: front matter cites FSPEC "(v0.5)" (`:11`) against FSPEC v0.9 on disk. | §A.5 `:342-356`, front matter `:11` |
| F-04 | Medium | Local | **D.1's structural-disjointness claim contradicts D.2's own shape.** `:565-568` enforces disjointness by field domain: "a corpus outcome may only appear in the **run-level** `corpusOutcome` field … one test per field asserts it carries only members of that field's catalogue". §D.2 also puts `corpusOutcome` on every `dispatches[i]` row (`:595`), and upstream now makes *that* row the oracle locus (`REQ:321-322`). The three per-field tests as specified would leave the per-dispatch occurrence uncovered by any catalogue-membership assertion. Once F-01…F-03 are settled the fix is mechanical — name the per-dispatch field as the domain — but it needs naming, or the domain test lands on the mirror rather than the oracle. | §D.1 `:565-568` vs §D.2 `:595` |
| F-05 | Medium | Local | **AT-20/AT-21/AT-22's suite and layer assignment predates their re-scoping.** §T.5 (`:906`) puts all three in `learningsRecord.test.js` at "L1/L2". FSPEC v0.9's AT-20 and AT-22 (`FSPEC:849-862`) now each carry a second half over "AT-18's changing-corpus run — listing failing for the first dispatch, succeeding for the second", i.e. a multi-dispatch run of the shape §T.6's `DIVERGENT-CORPUS` fixture provides at L3. Either the mapping moves those halves to the L3 suite or §T.5 states why a record-level fixture can stage two dispatches' records without driving a run; as it stands the 35-AT closure arithmetic still balances but two rows are assigned to a layer that cannot exercise their new clause. | §T.5 `:906` |

DEFERRED: v5's F-01 (fixture run-scope must reach Phases CR and H) and F-02 ("four hand-written hops" numeral) remain unaddressed and remain non-gating; both still belong in PLAN task text.

## Questions

| ID | Question |
|----|---------|
| Q-01 | With the per-dispatch locus settled upstream, is a run-level mirror carried at all? Upstream permits either ("if carried"). The choice changes §D.2's shape and F-04's domain test, and the TSPEC should state it rather than leave the mirror's existence implied by an oracle that upstream forbids. |
| Q-02 | If the mirror is kept, what still makes `corpusDiverged` observable in a test? It is a good field and I would keep it — but its current justification (`:335-341`) is written as a defence of last-write-wins, and last-write-wins is no longer a rule anything asserts. `dispatches.every(r => r.corpusDiverged === false)` remains a clean stable-corpus oracle; say so on its own terms. |

## Positive Observations

- **The design already contains everything upstream now asks for.** `dispatches[i].corpusOutcome`, `dispatches[i].orderKeys` and `dispatches[i].corpusDiverged` (`:331-333`, `:595-597`) are precisely the per-dispatch locus REQ AC-3.2/AC-3.3 settled on, and they were written here *before* REQ settled it. This round is not a redesign: F-01…F-04 are all "move the oracle onto the row that already exists, and delete the paragraph that says REQ hasn't decided". The mechanism survives intact.
- **§A.5's divergent-corpus analysis is what made the upstream decision available.** The observation that two dispatches in one run may legitimately observe different corpora, and that no single run-level record can describe both, is stated at `:323-326` and appears near-verbatim in REQ AC-3.3 at HEAD. Routing it as a product question rather than settling it in TSPEC was the right call; the only defect is that the routing note outlived the answer.
- **`DIVERGENT-CORPUS` is the right fixture, and it is falsifiable.** Five dispatches, corpus gaining a path after 2 and failing at 5, is exactly the shape FSPEC AT-20/AT-22's new second halves need — including the "listing failing for one dispatch, succeeding for another" clause. Re-point the assertions and the fixture needs no change.
- **`corpusDiverged` false-never-null on the first dispatch (`:333`) is still the right call.** It keeps `every(... === false)` a total oracle instead of a three-valued one, and that reasoning is unaffected by anything upstream moved.
- **The 35-AT closure and the `learningsSuiteMap` hand-transcribed assertion (`:911-912`) still hold.** F-05 moves rows between suites; it does not disturb the arithmetic or the guard that keeps the arithmetic honest.

## Recommendation

**Needs revision.**

Three High findings, all one decision and all class (ii): FSPEC v0.9 and REQ v0.9 at HEAD place the corpus outcome and the ordering keys at a **per-dispatch** locus, declare the run-level mirror additive and explicitly unasserted, and require **two** completeness tests rather than one. The TSPEC's §T.2, §T.6 and §A.5 still describe the run-level record as the locus, assert an oracle over the mirror upstream says nothing asserts on, and state that REQ has not yet answered a question REQ answered. A PLAN derived from this document today produces a test suite that reds against a conforming implementation (F-02) and leaves the real oracle locus without a closure test (F-01).

The revision is small and additive-to-nothing: re-point §T.2's two BR-10/§A.5 rows at the per-dispatch fields and split them into two completeness claims; restate §T.6's `DIVERGENT-CORPUS` assertion as per-dispatch reproduction plus `corpusDiverged` on exactly 3 and 5; replace §A.5's "Until REQ answers" paragraph with the answer, marking ERR-6 closed-as-resolved; refresh the front-matter upstream to FSPEC v0.9. F-04 and F-05 fall out of the same edit.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 2, "low": 0}
