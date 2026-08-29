# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md`
**Date:** 2026-08-29
**Iteration:** 7 (delta re-review of v0.7 against v0.6)

## Overview

**Confirmation question:** does v0.7 land the one item v6 routed, and did it break anything already approved?

**Answer: the routed item landed, at all four sites, consistently, and nothing already approved moved.** My v6 F-01 (High) is closed. What remains is non-gating: one Medium about a production declaration with no production consumer, one Low about the census test's operand import direction, and one `ERRATUM: TSPEC` for the residual upstream gap the PLAN itself correctly declines to decide.

The v6 round reviewed `a2bad6db6`. Four commits have landed on the PLAN since:

| Commit | Subject |
|---|---|
| `b22b1c0a0` | name `orchestrate-dev.js` as `DECISION_LEDGER_CENSUS_TOKENS`'s home in T-11 |
| `9f1d6ede6` | complete T-18's `DECISION_LEDGER_CENSUS_TOKENS` instruction |
| `68317ce6e` | give `DECISION_LEDGER_CENSUS_TOKENS` a manifest owner |
| `5ffa27135` | align DoD census bullet and record v0.7 revision history |

The diff is 20 changed lines across five hunks and exactly the four sites v6 named, plus the version bump and revision-history paragraph: `T-11` (PLAN:152), `T-18` (PLAN:~161), the file-ownership manifest rows for `decisionLedgerCensus.test.js` (PLAN:207) and `orchestrate-dev.js` (PLAN:~219), and the §Definition of Done census bullet (PLAN:489–495). No `Batch` column, no `Depends on` column and no file-ownership assignment moved.

v6 offered the author two acceptable resolutions and named a third as unacceptable. The author took the second — keep the member, give it a production home — and said so explicitly, naming my proposed first resolution as **rejected** with a reason I accept: dropping the member would put the PLAN out of contract with the TSPEC it had just re-pinned, and would void §7.3's own stated reason for the exclusion. That is the right call, and it is the resolution the PLAN was already half-carrying in T-18's three-word fragment.

## Batches

### The routed item landed (v6 F-01 — closed)

v6's High said: the partition names fifteen owned declarations while the design declares fourteen, because `DECISION_LEDGER_CENSUS_TOKENS` had no home — no PLAN green task created it, and T-11's own opening cloned the precedent's *test-file* `ANCHOR_TOKENS`. Both of T-11's HEAD-reading conjuncts were therefore red on conforming code. v0.7 answers by giving the member a production home. Site by site:

| Site | HEAD text | Verdict |
|---|---|---|
| `T-11` (PLAN:152) | `CENSUS_TOKENS` "is itself **declared in `pdlc/workflows/orchestrate-dev.js` as a production top-level constant, written by T-18**"; "unlike the precedent's `ANCHOR_TOKENS`, which is test-file-local … and unlike this task's two test-file lists below"; the two HEAD-reading conjuncts "are therefore satisfied at **T-18's** landing, not before, which is the ordinary red-before-green edge rather than red-by-construction" | ✅ names the home, names the timing, and names why the timing is legal |
| `T-18` (PLAN:158) | the three-word fragment is now a full instruction: "**Add the frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration to `pdlc/workflows/orchestrate-dev.js`** as a top-level constant holding T-11's six token strings … it is production code, not a test operand, because TSPEC §7.3 makes it a member of `DECISION_LEDGER_OWNED_DECLS` precisely so that its own declaration is sliced out" | ✅ the implementer now has an executable instruction |
| File-ownership manifest, test file (PLAN:207) | "the third census operand, `DECISION_LEDGER_CENSUS_TOKENS`, is **not** a test-file constant — it is production, declared in `orchestrate-dev.js` by T-18, see the batch-8 row" | ✅ an explicit disclaimer, not silence |
| File-ownership manifest, module (PLAN:219) | T-18's row now claims "**and the `DECISION_LEDGER_CENSUS_TOKENS` declaration** — the one member of `DECISION_LEDGER_OWNED_DECLS` no earlier batch writes" | ✅ owner recorded where the gate reads it |
| §Definition of Done (PLAN:489–495) | "All fifteen owned members are declarations in `orchestrate-dev.js` written by a `[green]` task of batches 3–8; … `DECISION_LEDGER_CENSUS_TOKENS` is **production**, declared by T-18 — which is what makes its slice non-empty and its resolves-to-one conjunct satisfiable" | ✅ same contract, same words |

The counts are unchanged and still internally consistent: tokens **six** ∪ exempt **nine** = owned **fifteen**, disjoint. I re-checked the claim that carries the whole fix — *every* owned member has a `[green]` owner — mechanically, by grepping each of the fifteen names against the task table rather than trusting the prose:

| Member | Green owner | Member | Green owner |
|---|---|---|---|
| `parseDecisionLedgerConfig` | T-13 | `DECISION_LEDGER_PREAMBLE` | T-15 |
| `DECISION_LEDGER_DEFAULTS` | T-13 | `DECISION_LEDGER_RULE_TEXT` | T-15 |
| `DECISION_LEDGER_NOTICES` | T-13 | `renderDecisionLedgerBlock` | T-15 |
| `DECISION_CORPUS_ARGV` | T-14 | `selectDecisions` | T-16 |
| `DECISION_HEADING_RE` | T-14 | `DECISION_LEDGER_OMIT_REASONS` | T-16 |
| `recogniseDecisionRecords` | T-14 | `gatherDecisionCorpus` | T-17 |
| `buildDecisionLedgerInjector` | T-17 | `DECISION_LEDGER_CORPUS_OUTCOMES` | T-17 |
| `DECISION_LEDGER_CENSUS_TOKENS` | **T-18** | | |

Fifteen members, fifteen owners, all in batches 3–8, no member owned twice and none homeless. v6's High is closed on its own terms.

### The red-before-green edge is real, not asserted

The fix only works if T-11 stays skipped until T-18 lands. I checked the columns rather than the sentence: T-11 is `[red]`, batch 2, `Depends on` T-00, T-01; T-18 is `[green]`, batch 8, `Depends on` T-10, T-10a, T-11, T-17, and its row ends "Un-skips T-10, T-10a and T-11." So the un-skip edge is declared in the dependency column, not only in prose, and the batch column re-derives (`max(dep batch) + 1` with T-17 at 7 → 8). This is the same red-before-green shape T-10/T-10a already use and which earlier rounds approved.

### One thing the fix creates, which the PLAN does not name (F-01, Medium)

`DECISION_LEDGER_CENSUS_TOKENS` is now a production top-level constant of `orchestrate-dev.js` whose only consumer is a test — T-11's `decisionLedgerCensus.test.js`. Nothing in the production module reads it: it exists so that its own declaration is a sliceable region, i.e. its purpose is to be *removed* from the census's scanned source. I grounded the "no production consumer" reading in the module's shape: `orchestrate-dev.js` exports inline (`export const` / `export function`, `pdlc/workflows/orchestrate-dev.js:48`, `:52`, `:88`, `:106`) with no trailing `export { … }` block, so a declaration that no other production site references is genuinely dead outside tests, and there is no export-surface or unused-export guard in `pdlc/workflows/__tests__/` that would notice.

This is not a High. It does not red anything, the six literals are pinned (below), and the choice is TSPEC §7.3's, not the PLAN's. But it is the dead-config shape my lens flags at Medium: a frozen constant introduced in production with no production caller. The cheap fix is one clause in T-18 saying so deliberately — that the constant is production *solely* to be sliced, that its only importer is the census test, and that this is intended rather than an unwired integration — so that a DoD sweep reading the diff does not file it as an unwired artifact and "fix" it by deleting it, which would silently re-open the exact failure v0.7 just closed.

## Dependencies

### Upstream pins — unmoved and still correct

The four pins in the header are byte-identical to v0.6's and were verified character-for-character in the v6 round; this edit touches no pin. In-body citations still read "TSPEC v0.9 §7.3" at every site, including the two new sentences, and `grep -n "v0\.8"` still returns no TSPEC citation. The revision-history paragraph describes v0.7 as closing a reviewer-raised item rather than as an upstream re-grounding, which is the honest description of this pass.

### Batch-DAG — untouched, re-derived anyway

The edit changes no `Batch` and no `Depends on` cell. I re-derived the tail of the graph the fix depends on, since the whole argument rests on T-18 landing after T-11 is committed:

| Task | Depends on | max(dep batch) | Declared batch | Verdict |
|---|---|---|---|---|
| T-11 | T-00, T-01 | 1 | 2 | ✅ |
| T-13 | T-02, T-04 | 2 | 3 | ✅ |
| T-14 | T-05, T-13 | 3 | 4 | ✅ |
| T-15 | T-06, T-14 | 4 | 5 | ✅ |
| T-16 | T-07, T-15 | 5 | 6 | ✅ |
| T-17 | T-08, T-09, T-16 | 6 | 7 | ✅ |
| T-18 | T-10, T-10a, T-11, T-17 | 7 | 8 | ✅ |
| T-19 | T-12, T-12a, T-18 | 8 | 9 | ✅ |

Acyclic over the touched sub-graph, ids unique, every dependency resolves to a declared task, and the ordering that makes the fix sound (T-13…T-18 all before or at the un-skip point of the `[red]` T-11) holds.

**Same-batch same-new-file check.** The edit adds no file and no task. `decisionLedgerCensus.test.js` is still created by T-11 alone in batch 2; `orchestrate-dev.js` is an existing file with six sequential owners in batches 3–8, one per batch, so no two concurrent implementers author it. No collision introduced.

### One residual, and it is upstream (`ERRATUM: TSPEC`)

The PLAN now asserts something about the module surface that its upstream does not carry. I checked TSPEC for every occurrence of the constant: `DECISION_LEDGER_CENSUS_TOKENS` appears at `TSPEC-pdlc-decision-ledger.md:36`, `:89`, `:1296`, `:1297`, `:1300`, `:1318` and `:1329` — the overview/changelog lines and §7.3 (`### 7.3` opens at `:1153`, `### 7.4` at `:1342`). It appears in **no** module-surface section: not §4.1/§4.2/§4.4 (Interfaces, `:649`–`:875`), and not §5.2 Frozen catalogues (`:909`), which enumerates exactly three frozen constants — `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`, `DECISION_LEDGER_NOTICES`.

So TSPEC requires a production top-level constant to exist (via §7.3's `DECISION_LEDGER_OWNED_DECLS` membership and its resolves-to-one conjunct) while specifying it in no interface or data-model section. The PLAN is right not to decide this itself, and right to route it: the revision-history paragraph already names it as `ERRATUM: TSPEC`. I am seconding that route rather than making it a PLAN finding — the PLAN's transcription is faithful to the upstream it pins, and the fix belongs in TSPEC §5.2, where the other three frozen catalogues are declared with their shapes.

## Verification

Every claim above was measured at HEAD, not read out of a document:

| Claim | How verified |
|---|---|
| Delta is exactly four commits, 20 changed lines, five hunks | `git log --oneline a2bad6db6..HEAD -- …PLAN…`; `git diff a2bad6db6..HEAD -- …PLAN…` read in full |
| Only the four routed sites plus header/revision-history changed | Hunk headers at `@@ -14`, `@@ -147`, `@@ -202`, `@@ -214`, `@@ -487`; no `Batch` or `Depends on` cell in any `+` line |
| All fifteen owned members have a `[green]` owner in batches 3–8 | Per-name grep of each of the fifteen against the task table; table above |
| `DECISION_LEDGER_CENSUS_TOKENS`'s owner is T-18 | `PLAN…md:158` (task row), `:219` (manifest row) — two independent sites agree |
| T-18 depends on T-11 and un-skips it | `PLAN…md:158` `Depends on` column = T-10, T-10a, T-11, T-17; row text "Un-skips T-10, T-10a and T-11" |
| T-18's batch is 8 and re-derives | T-17 at batch 7 (`Depends on` T-08, T-09, T-16); `max + 1 = 8` = declared |
| `orchestrate-dev.js` exports inline, no trailing export block | `grep -n "^export" pdlc/workflows/orchestrate-dev.js` (`:48`, `:52`, `:88`, `:106`, …); `grep -n "^export {"` → no match |
| No export-surface / unused-export guard exists that would flag a test-only production constant | `grep -rln "unused\|exportSurface\|Object.keys(mod)" pdlc/workflows/__tests__` — matches are unrelated (`advisoryDisabled`, `mergeObservations`, `devModeKinds`) |
| TSPEC declares the constant in §7.3 only | `grep -n "DECISION_LEDGER_CENSUS_TOKENS" …TSPEC…` → `:36`, `:89`, `:1296`, `:1297`, `:1300`, `:1318`, `:1329`; section map puts `### 7.3` at `:1153` and `### 7.4` at `:1342` |
| TSPEC §5.2 enumerates three frozen catalogues, none of them `CENSUS_TOKENS` | `…TSPEC…md:909` frozen-catalogue table read in full |
| No same-batch same-new-file collision introduced | File-ownership manifest read in full (`PLAN…md:207`–`:219`); `orchestrate-dev.js` has one owner per batch 3–8 |
| No stale `v0.8` TSPEC citation reintroduced | `grep -n "v0\.8" …PLAN…` → no TSPEC citation |

**The implementation-echo question, and why it does not red.** The census's forbidden-token operand is now imported *from the module the census scans* — the one shape my lens normally files as an implementation echo, since an expectation must not derive its expected value from the code under test. Here it is neutralised, and by construction rather than by luck: the companion assertion is `CENSUS_TOKENS ∪ CENSUS_EXEMPT = OWNED_DECLS` with the two sub-sets disjoint, and both `CENSUS_EXEMPT` (nine names) and `OWNED_DECLS` (fifteen names) are frozen **test-file** literals of `decisionLedgerCensus.test.js`. That pins `CENSUS_TOKENS` to exactly `OWNED_DECLS \ CENSUS_EXEMPT` — six names, determined entirely by test-file literals. An implementer who quietly drops a token from the production constant to make the census pass reddens the partition instead. The oracle is therefore falsifiable in the direction that matters. What the PLAN does not say is that this is *why* the partition is load-bearing here, and the partition is the only thing standing between this design and a self-derived oracle — F-02 (Low) asks for that one clause.

**Not verifiable at this altitude, correctly deferred:** the fixture shape of `decisionLedgerCensus.test.js`, whether `bodyOf`/`allTopLevelDecls` are cloned or imported from the precedent, whether the fifteen non-empty-slice assertions run in a loop or unrolled, and the exact `Object.freeze` shape of the new constant. Those are TSPEC/PROPERTIES and implementation concerns; the PLAN owes the operand contract and the ownership, and states both.

## Positive Observations

- **The author took the harder of the two resolutions I offered, and was right to.** v6 named dropping the member as one acceptable fix; v0.7 names it **rejected**, with a reason that survives checking — it would put the PLAN out of contract with the TSPEC it had just re-pinned, and would void §7.3's stated rationale. A reviewer's suggestion is not a specification, and pushing back on it with a grounded argument is the right move. The evidence the author cites for the intent — T-18's pre-existing "Add `DECISION_LEDGER_CENSUS_TOKENS`." fragment in the row whose source file is `orchestrate-dev.js` — is real; the design always meant production, and only the sentence was missing.
- **Four sites, one contract, no residue.** The failure mode this document keeps having to defend against is a fix landing at the row but not at the manifest, or at the manifest but not at the DoD bullet. All four say the same thing in the same words, and the two manifest rows say it from both ends: the test-file row *disclaims* the operand and points at batch 8, the module row *claims* it. A reader arriving from either direction reaches the same owner.
- **The conjunct that used to be red by construction is now red-before-green, and the PLAN says which.** "Satisfied at T-18's landing, not before, which is the ordinary red-before-green edge rather than red-by-construction" is exactly the right distinction, and it is backed by the dependency column rather than asserted in prose.
- **The counts stayed put, which is itself evidence.** Six ∪ nine = fifteen is unchanged from v0.6; the fix moved a *home*, not an arithmetic. A fix that had quietly shifted the literals would have been the tell that the author was patching the symptom.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | `DECISION_LEDGER_CENSUS_TOKENS` is now a production top-level constant of `orchestrate-dev.js` with **no production consumer** — its only importer is T-11's census test, and its purpose is to be sliced *out* of the scanned source. The module exports inline with no trailing `export { … }` block (`pdlc/workflows/orchestrate-dev.js:48`, `:52`, `:88`, `:106`), and no export-surface guard exists in `pdlc/workflows/__tests__/`, so nothing flags it. This is the dead-config shape: introduced in production, executed by no production path. It is intended, and it is TSPEC §7.3's choice rather than the PLAN's — but the PLAN does not say it is intended, so a DoD sweep reading the diff can file it as an unwired artifact and remediate it by deletion, silently re-opening the homeless-member defect v0.7 just closed. Ask: one clause in T-18 stating that the constant is production *solely* so its declaration is a sliceable region, that its only importer is the census test, and that this is deliberate. | §Batches → `T-18` (PLAN:158) |
| F-02 | Low | Local | The census's forbidden-token operand is imported from the module the census scans — an implementation echo in shape. It is neutralised in fact, because the companion partition (`CENSUS_TOKENS ∪ CENSUS_EXEMPT = OWNED_DECLS`, disjoint) pins the six to `OWNED_DECLS \ CENSUS_EXEMPT`, both frozen **test-file** literals, so dropping a production token reddens the partition. But the PLAN presents the partition as a completeness check for *future* symbols only, and never says it is also what stops the six from being self-derived. An implementer who reads the partition as redundant and thins it leaves an oracle whose expected value comes from the code under test. Ask: one clause in T-11 naming the partition as the reason the imported operand is safe. | §Batches → `T-11` (PLAN:152) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Once TSPEC §5.2 gains the constant (the routed erratum), will T-18's row cite `§5.2` alongside `§7.3` for its shape, or keep the single §7.3 citation? Not blocking — the instruction is executable either way — but the other three frozen catalogues are cited to §5.2 by their owning tasks (T-13, T-16, T-17), and this one would then be the odd row out. |

## Recommendation

**Approved with minor changes**

v6's High is closed. `DECISION_LEDGER_CENSUS_TOKENS` has a production home, a green owner (T-18), a manifest row that claims it, a manifest row that disclaims it from the test file, and a DoD bullet that says the same thing — and I confirmed mechanically that all fifteen members of `DECISION_LEDGER_OWNED_DECLS` are written by a `[green]` task of batches 3–8, so the frozen list is no longer partly homeless and T-11's resolves-to-one and non-empty-slice conjuncts are satisfiable on conforming code. The satisfaction point is T-18's landing, which is an ordinary red-before-green edge declared in the dependency column, not red-by-construction.

Nothing already approved broke: no batch, dependency or ownership assignment moved, the DAG re-derives, the pins are unchanged and still correct, no same-batch same-new-file collision was introduced, and the six/nine/fifteen arithmetic is unchanged. The author's rejection of my alternative resolution is reasoned and correct.

The two remaining findings are non-gating and each cost one clause: F-01 asks T-18 to say the test-only production constant is deliberate, so a later DoD sweep does not delete it; F-02 asks T-11 to say the partition is what keeps the imported token operand from being a self-derived oracle. Both protect the fix from a future reader rather than from the current implementer.

The residual upstream gap — TSPEC declares this production constant in §7.3 only, in no module-surface section, while §5.2 enumerates exactly three frozen catalogues — is routed as `ERRATUM: TSPEC`, as the PLAN itself proposes. The PLAN should not absorb it.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Medium | delta | local | The round's own fix makes `DECISION_LEDGER_CENSUS_TOKENS` a production constant with no production consumer (only importer is the census test); dead-config shape, unflagged by any export-surface guard, and undeclared as deliberate — a DoD sweep can remediate it by deletion and re-open the closed defect. | §Batches → `T-18` (PLAN:158) |
| F-02 | Low | delta | local | The census's forbidden-token operand is now imported from the module under census; the partition against two test-file-frozen lists is what neutralises the echo, but the PLAN never says so, so thinning the partition would leave a self-derived oracle. | §Batches → `T-11` (PLAN:152) |

FINDING: Medium | delta | local | §Batches → T-18 (PLAN:158) | DECISION_LEDGER_CENSUS_TOKENS is introduced as a production top-level constant of orchestrate-dev.js with no production consumer — its sole importer is T-11's census test and its purpose is to be sliced out of the scanned source; the module exports inline with no trailing export block (pdlc/workflows/orchestrate-dev.js:48,:52,:88,:106) and no export-surface guard exists in pdlc/workflows/__tests__, so nothing flags it, and the PLAN never states the dead-looking declaration is deliberate — a DoD sweep can delete it as an unwired artifact and re-open the homeless-member defect this round closed.
FINDING: Low | delta | local | §Batches → T-11 (PLAN:152) | The census's forbidden-token operand is imported from the module the census scans; the companion partition against the test-file-frozen CENSUS_EXEMPT and OWNED_DECLS is what pins the six and stops the oracle being self-derived, but the PLAN presents the partition only as a future-symbol completeness check, so an implementer who thins it leaves an expectation derived from the code under test.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:a8e91304b5a0d3d4f1eaf1428ec4fc0470f0509aa12267919f70e55a2897a100
APPROVAL-HASH-NORMALIZED: sha256:a8e91304b5a0d3d4f1eaf1428ec4fc0470f0509aa12267919f70e55a2897a100
REVIEWED-COMMIT: 5ffa27135f30cd26a70b58fd736eb6dea866d097
UPSTREAM-STATE: REQ sha256:ce6b133f0c1d692f172f1753b4d17a075bf1f933827a34701b2ee69d0d3c7b7c
UPSTREAM-STATE: FSPEC sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39
UPSTREAM-STATE: TSPEC sha256:eef45ef32f0dd394e81abcf3aa5215fa54ba8dbbdc69f9d595c08feece0623c8
UPSTREAM-STATE: DECISIONS sha256:13aba06127b4d392bdf71f93066dd7ed6cb626dadbc4dda54029ab80bb4fb89a
