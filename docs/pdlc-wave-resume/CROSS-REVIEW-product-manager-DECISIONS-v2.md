# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** Delta re-review. Product lens only — requirements traceability, scope compliance,
acceptance-criteria fidelity, and the fidelity of the *counted costs* this document stakes its
decisions on. Base reviewed at v1: `4edad92a`. Delta reviewed: `4edad92a..020b74a0`.

## Delta verification — my v1 findings

Each v1 finding was re-run against the same evidence source the document names — `origin/main` at
`345ae358` — not against the document's own assertion that it had been fixed.

| v1 finding | Disposition | Evidence re-run |
|---|---|---|
| **F-01 (Medium)** — the 44-test cost was overstated; measured, 26 | ✅ **Resolved** | §Context now reads **26 test cases (18 / 4 / 4)**, states the command (`npm test -- __tests__/waveExecution.test.js --verbose` from `pdlc/workflows`), and states the *counting rule* I had to infer in v1 ("test *cases*, with `it.each` members counted individually — the same three blocks are 23 `it` statements"). Re-derived: the ledger `describe` (`waveExecution.test.js:2239`–`:2716`) holds **15** `it` statements, one of which is the four-member `it.each` at `:2624` ⇒ 14 + 4 = **18**; `describe("Phase I — implementation.startWave resumes a halted run")` (`:2077`) holds **4**; `describe("computePlanHash — the ledger's plan fingerprint")` (`:2717`) holds **4**. 26, and 23 `it` statements. O-1 and DEC-WVR-01 both carry the corrected figure; no `44` survives anywhere in the file |
| **F-02 (Low)** — "largest tracked file" was the runner-up | ✅ **Resolved** | The row now claims largest tracked **source module**, second-largest tracked file overall, and prints the command. `git ls-tree -r -l origin/main \| sort -k4 -n -r \| head -3` returns exactly the three rows quoted: `dist/pdlc-cli.mjs` 738,924 B, `orchestrate-dev.js` 734,711 B, `docs/discarded/…/REQ-pdlc-review-convergence.md` 314,472 B. The revision does more than correct the rank — it turns the correction into the sharper reading ("the largest tracked file in the repo is a build output of the file this feature edits") and wires it to the third accepted risk |
| **F-03 (Low)** — "~81 lines" did not match the named span | ✅ **Resolved** | §Context and DEC-WVR-02 now both say **48 lines** for the chain and **84 lines** for the enclosing read block. Re-measured on `origin/main`: `if (ledger.reason) {` at `orchestrate-dev.js:15297`, the final `else`'s closing brace at `:15344` ⇒ **48**, exactly as the document bounds it; `if (!explicitPointer) {` at `:15263` through its closing brace at `:15346` ⇒ **84**. Both figures are now exact rather than approximate, and DEC-WVR-02 says which of the two it extracts |
| **F-04 (Low)** — two seam denominators (36th seam vs ~35 seams) | ✅ **Resolved** | §Context now states the denominator once and binds it: `main()` "destructures **36 parameters, 34 of them injected seams**… an added seam would be the **35th seam** and the **37th parameter**". Re-counted over the destructured list at `orchestrate-dev.js:12992`–`:13047`: **36** entries, **34** underscore-prefixed. O-3 and DEC-WVR-02 both now say "35th injected seam (a 37th parameter…)"; `git grep` finds no surviving `36th` or `~35` |
| **F-05 (Low)** — queue-parity gap missing from the DC-08 open table | ✅ **Resolved** | A fourth row is added, and it says the thing I asked for and one thing more: it names the disclosure/successor distinction explicitly ("a sentence in a test is a disclosure, not a successor surface"), cites REQ-WVR-07 P2 Phase 2, and names the successor surface as DEC-WVR-07's existing trigger — the queue's delegation payload growing a second key |
| **F-06 (Low)** — DEC-WVR-04's write-site oracle was absence-only | ✅ **Resolved** | The Consequences row is now positive-first with the absence as a derived conjunct: every observed ledger write parses to a key set **exactly** `{version, feature, planHash, lastGreenWave}` (plus `head` when a transport is injected), and no observed write is `{}` or `""`. It also states *why*, in the vocabulary of the oracle bar: "An absence-only oracle … would be satisfied by a run that writes nothing at all". Verified against the write site: `formatWaveLedger` (`orchestrate-dev.js:12325`–`:12331`) emits exactly those four keys, plus `head` when it is a non-empty string; there is exactly one `writeWaveLedger(` call site (`:15601`) |

**Both open questions were answered in the document rather than deferred.** Q-01 (is the `✅` report
row's extension conditional on `N > 1`?) is now written into DEC-WVR-03 as a decision clause, with
the reason stated in the count's own terms. Q-02 (`version` is written but never read) is now stated
in DEC-WVR-05 itself — verified: `parseWaveLedger` (`:12267`–`:12304`) checks `feature`, `planHash`
and `lastGreenWave` only and never dereferences `parsed.version`, so "the freeze binds the writer,
not the reader" is the honest reading. Q-03 (the `{}` hatch's reversibility) is answered by scoping
the "hard in expectation" caveat to an operator who discovered the behaviour by experiment.

## Findings

**Did the revision break anything?** The load-bearing new claims were re-run, not read:

- DEC-WVR-03's new `N > 1` condition is what now holds the changed-assertion count at three, so it
  was checked exhaustively rather than spot-checked. `git grep -n 'waves complete (wave mode'
  origin/main -- pdlc/workflows/__tests__/` returns **three** hits repo-wide, all in
  `waveExecution.test.js`: two whole-string `phaseDetail` equalities on **wave-1** runs inside
  `describe("Phase I — the script-owned test gate")` (`:539`, `:593`), which the condition leaves
  verbatim, and one on a **resuming** run (`:2117`, `"All 3 waves complete (wave mode,
  script-owned gate)"`) — which sits inside `it("skips the waves before the pointer entirely — no
  dispatch, no gate, no commit")`, i.e. the third of the three assertions the document already
  enumerates. The condition is load-bearing exactly as claimed, and it introduces no fourth.
- O-5's new exclusion criterion is mechanical and checks out. The invalid-value notice is emitted by
  the key-generic `for (const key of implParsed.invalidKeys)` loop around one templated `emit`
  (`orchestrate-dev.js:15093` legacy mode, `:15185` wave mode — two call sites, as claimed), shared
  verbatim by every `implementation` key, so attaching provenance there would attach it to
  `testCommand`'s notice too. And `parseImplementationConfig` (`:236`–`:243`) replaces a rejected
  `startWave` with the default before the decision runs, so `const explicitPointer = startWave > 1`
  (`:15236`) is false — there is no pointer left to attribute the run to. The criterion is
  falsifiable against code, not against intent.
- DEC-WVR-08's new third call-count fixture is grounded. The shipped guard order is
  feature → plan-hash → ancestry → over-count (`:15301`, `:15305`, `:15307`, `:15313`), so an
  over-count record with an unreachable head announces `head-unreachable` today; and TSPEC §3.1's
  `ANCESTRY_INDEPENDENT_CODES` is `{null, unreadable-json, not-an-object, wrong-shape,
  feature-mismatch, plan-changed}` — `over-count` is not in it, exactly as the row states. The
  bidirectional trigger is the right shape: the silent-flip failure mode it names is real.
- DEC-WVR-05's "written, not gated on" and DEC-WVR-04's positive write-side oracle are both
  verified above and consistent with the single write site.

No prior finding was reopened by the revision, and nothing that was approved in v1 was disturbed:
the diff adds material and corrects figures, and changes no decision, no alternative's disposition
and no downstream obligation — as its own revision-history row claims.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **The corrected largest-file row names one build input where there are two.** §Context's new row calls `pdlc/workflows/dist/pdlc-cli.mjs` "a *generated* artifact built from the module below", and the accepted-risks bullet says it is "built *from* it". The artifact's own header says otherwise: `// Built by \`node pdlc/workflows/build-runtime.mjs\` from: pdlc/workflows/orchestrate-dev.js` **and** `pdlc/workflows/cli.mjs` (first eight lines of the file at `origin/main`). The substance is unaffected — the risk framing ("rebase churn in a file whose build output is the largest tracked file") and the third accepted risk both hold — but this row is in the table whose whole method is that every figure is re-derivable from a stated command, and it is the one claim in the corrected set that a reader re-running the check would find stated slightly wider than the evidence. *Fix:* "a generated artifact built by `build-runtime.mjs` from the module below together with `cli.mjs`". | REQ R-4 |
| F-02 | Low | Local | **DEC-WVR-05's newly-`*(observable)*` trigger is the one observable trigger with no obligation carrying it.** The revision draws a sharp and welcome line: DEC-WVR-02's trigger is marked *(design aspiration, deliberately not an observable signal — no test or monitor is owed one)*, and DEC-WVR-05's is marked *(observable)* and describes the detector — "a test asserting contiguity over the dispatched wave numbers reds the day it stops holding". Every other observable trigger in the document has a Consequences row that owes the assertion: DEC-WVR-06's seven-code set equality, DEC-WVR-08's three call-count equalities, DEC-WVR-03's announcement set equality. DEC-WVR-05's Consequences row owes only the key-set equality over `formatWaveLedger`'s output — the contiguity assertion the trigger relies on is owed by nobody, so the trigger cannot actually fire. The property itself is real and verified (one `startWave` cut-off over the single loop at `orchestrate-dev.js:15369`), which is precisely why the marking matters: an `*(observable)*` label with no detector reads to a future reader as a fired-alarm guarantee that does not exist. *Fix:* either add the contiguity assertion to DEC-WVR-05's Consequences row alongside the key-set equality, or mark the trigger the way DEC-WVR-02's is marked and say the property is held by inspection of the single cut-off. | REQ-WVR-05, DC-03 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-WVR-03's Consequences row asks the announcement set-equality oracle to enumerate the exclusions "as literals — the invalid-`startWave` config-validation notice, **and the IG-6 no-record silence**". The first exclusion is a literal string that can be enumerated. The second is an absence: there is no sentence to transcribe, and asserting a silence inside a set-equality over emitted announcements is a different shape of assertion (no announcement on that path matches the token pattern) rather than a member of the excluded set. Worth one clause saying which of the two it is, so the implementer does not go looking for a string that does not exist. This is a wording question, not a defect: the intent — a fifth token-carrying announcement reds an assertion — is unambiguous, and te-review owns the oracle's shape. |
| Q-02 | The O-5 exclusion criterion is stated as a rule over *where the emit sits* ("notices emitted before the decision, by the shared `implementation`-config validation loop, do not [carry a token]"). That is checkable today because the config-validation loop is the only pre-decision emitter on this path. If a future change moves the invalid-`startWave` notice into the resume decision — e.g. so that an invalid pointer can be attributed — the criterion silently reclassifies it rather than flagging the move. Is the criterion meant to be a *description* of today's boundary (fine as written) or a *constraint* on where future notices may be emitted (which would want a sentence in DEC-WVR-03 saying so)? |

## Positive Observations

- **Every corrected figure was corrected with its command, not just with its value.** The 26-case
  row does not merely replace `44`; it states the command, the counting rule (`it.each` members
  counted individually), and the fact that the *same* three blocks are 23 `it` statements — which is
  what stops the next reviewer re-opening the count because they counted a different unit. That is
  the correction I asked for and one more thing besides.
- **F-02's correction made the document's argument stronger, not weaker.** The obvious minimal fix
  was to demote the claim to "second largest". The revision instead observed that the largest tracked
  file in the repo is a *build output of the very module this feature edits* and wired that into the
  third accepted risk (generated artifacts going stale, and the `postWavePathspecs` obligation). A
  correction that improves the risk register is a better outcome than a correction that survives
  review.
- **The `N > 1` condition was promoted from a question into a decision clause with its cost
  attached.** My Q-01 asked whether the conditionality was load-bearing. The answer is now in
  DEC-WVR-03's own text *and* in its Constraints row, phrased in the count's currency: "without which
  two further whole-string equalities outside the ledger blocks would change and the count would not
  be three". That is exactly the form that makes a future implementer discover the cost in the
  decision rather than in a red suite.
- **The fourth-announcement boundary is now closed by rule rather than by omission.** The strongest
  new material in the revision is O-5's criterion — "a notice carries a provenance token iff the
  resume decision emits it about a resolved start point" — because it is checkable against shipped
  code (a key-generic loop at two call sites; `explicitPointer` already false by the time the
  decision runs) rather than against intent, and because it comes with the oracle that makes a
  *fifth* announcement red something instead of slipping through. Excluding a case by a stated,
  falsifiable rule is a categorically better artifact than excluding it by not mentioning it.
- **The loud/silent split on the accepted risk is honest bookkeeping.** The old bullet implied one
  risk with one mitigation (run the suite). The revision splits it into the half a suite run detects
  and the half it cannot — an announcement that *should* carry a token and is simply left untouched,
  which reds nothing — and names the different detector each half needs, ending with "without that
  oracle this risk has no detector at all". Naming the undetectable half is the part most risk
  registers omit.
- **The DC-08 open table now distinguishes disclosure from successor surface.** "A sentence in a test
  is a disclosure, not a successor surface" is the general lesson behind my F-05, stated in one line
  that a future feature can reuse. It also keeps DEC-WVR-07's disposition intact rather than
  re-opening it, which is the correct handling of a residual gap that was always known.
- **Both open questions were answered in the document, not in a reply.** Q-02's answer (`version` is
  written and never read, so the freeze binds the writer only) and Q-03's answer (the `{}` tolerance
  is undocumented, so the "hard in expectation" caveat is scoped to an operator who found it by
  experiment) both landed as decision text. Answers that live in the artifact outlive answers that
  live in a review thread.
- **The revision history row is a faithful index of the diff.** Every change it claims is in the
  diff, and every substantive change in the diff is in it — including the ones that came from the
  other reviewer. Checking a revision against its own changelog should be boring, and here it was.

## Recommendation

**Approved with minor changes**

No High findings, and none carried over. All six v1 findings (F-01 Medium, F-02..F-06 Low) are
resolved, each verified by re-running the measurement rather than by reading the claim; both v1
questions are answered inside the decision text. Nothing the revision added disturbs what v1
approved: no decision changed, no alternative's disposition changed, no downstream obligation
changed, and no P0/P1 requirement is narrowed, dropped or re-triggered. The three genuinely new
load-bearing claims — the `N > 1` report-row condition, O-5's exclusion criterion, and DEC-WVR-08's
third call-count fixture — were each checked against `origin/main` and each holds.

The two remaining findings are Low and non-gating. Both can land in one pass:

1. **F-01 (Low)** — name both build inputs in the largest-file row: `dist/pdlc-cli.mjs` is built by
   `build-runtime.mjs` from `orchestrate-dev.js` **and** `cli.mjs`.
2. **F-02 (Low)** — give DEC-WVR-05's `*(observable)*` trigger a detector in its Consequences row, or
   mark it the way DEC-WVR-02's trigger is marked.

Neither changes a decision, and neither blocks Phase P.

Three defects sit in the upstream TSPEC, not in this document, and are raised as errata rather than
folded into this verdict: §3.1's "Four of the seven reasons interpolate" (three do —
`feature-mismatch`, `head-unreachable`, `over-count`; the sentence's own parenthetical lists exactly
three kinds of interpolated value, and §5.4's decision table repeats the four); §2.4's announcement
table, which omits the invalid-`startWave` config-validation notice entirely rather than excluding it
by rule — the gap this document identified and worked around correctly; and a duplicated clause in
§3.2's prose ("Keeping the field on the decision on the decision").

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46
APPROVAL-HASH-NORMALIZED: sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46
REVIEWED-COMMIT: 020b74a0d811b207dd28c232de6681af23cd142c
UPSTREAM-STATE: REQ sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f
UPSTREAM-STATE: FSPEC sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e
UPSTREAM-STATE: TSPEC sha256:3cd713c04963ac70131c7e7d93bdaa46e5ba702cb4684593f39a1207e0a53b94
