# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.2)
**Date:** 2026-08-21
**Iteration:** 14 (delta confirmation, erratum round)

## Overview

**What changed, and against what base.** `git diff aca213a9..HEAD` on the PLAN is **36 insertions,
5 deletions**: the version cell (`1.1` → `1.2`), a new `### Post-batch remediation (CODE_REVIEW v1)
— outside the batch ladder` subsection inside §File-ownership manifest, one appended sentence
scoping §The arithmetic to the two dispatcher-parsed tables, a rewritten P-A-7 case-C row, commit
re-pins inside the v0.8 and v1.1 changelog rows, and a new 1.2 changelog row. No other byte moved.

**Verdict up front: three of the four routed items land cleanly; the fourth lands only in part, and
the part it left behind is a High.** Items 1 (commit re-pins), 2 (case C recorded as discharged) and
3 (the four unowned remediation files recorded) are resolved, and I verified each against the
repository rather than against the changelog's account of it. Item 4 — the second-owner rows P-A-5
requires for `2fc6fcd3` — records **two** second writes. The commit actually makes **nine**, one of
them to production `orchestrate-dev.js`, the file the manifest owns with eight ladder rows. The new
section states as fact that the commit "touched six test-side surfaces"; at HEAD that is false, and
the manifest still does not reconcile with the tree. **One High, one Medium, four Lows. Needs
revision.**

**Scope of this pass.** Per DEC-ERR-03 I measured the changed regions against upstream at the
version pinned in this dispatch, not against the item list. I re-hashed all four upstream documents:
REQ `32cb8b7d…`, FSPEC `ef230199…`, TSPEC `1ddfdbc3…`, DECISIONS `87ec8ebc…` — all four match the
dispatch pins exactly, so no upstream text this PLAN leans on has moved underneath it since the
round opened. Every commit pin, file inventory and test count in the new bytes I resolved myself.

## Batches

**No task row moved, and none could have.** The diff touches no `LI-*` row, no `Batch` cell, no
`Deps` cell and no AT partition. Both dispatcher-parsed manifest tables are byte-unchanged — I
diffed them column by column against `aca213a9`. The new material is one subsection appended after
them plus one sentence appended to §The arithmetic. That containment decision is the right one and I
say so in Positive Observations: the dispatcher parses `Owner` as a task id, and a row reading
`2fc6fcd3` or `none` would have been a stale-row contract violation.

### The routed manifest item lands, but only for two of the nine second writes

The new §Post-batch remediation opens with a factual claim about the tree: `2fc6fcd3` "landed after
batch 13 and touched **six test-side surfaces**". I resolved the commit and enumerated it
(`git show --name-status 2fc6fcd3`). It touched **twenty** files, and the discrepancy is not
bookkeeping — it changes which of the manifest's own rules are still satisfied at HEAD:

| Surface at `2fc6fcd3` | Status | Manifest owner | Recorded by this delta? |
|---|---|---|---|
| `helpers/learningsBaselineScenarios.js` | added | none | **yes** |
| `helpers/learningsComposition.js` | added | none | **yes** |
| `learningsDisclosure.test.js` | added | none | **yes** |
| `learningsErratumBinding.test.js` | added | none | **yes** |
| `fixtures/learnings-baseline/**` | modified | LI-06 / batch 4 | **yes** (second writer) |
| `learningsBaselineGuard.test.js` | modified (70/130) | LI-06 / batch 4 | **yes** (second writer) |
| `pdlc/workflows/orchestrate-dev.js` | **modified (15/6) — production** | LI-15…LI-22, eight rows | **no** |
| `scripts/capture-learnings-baseline.mjs` | **modified (74/19) — production** | LI-05 / batch 3 | **no** |
| `pdlc/workflows/.gitignore` | modified (1/0) | one ladder row | **no** |
| `learningsSelect.test.js` | modified (39/16) | LI-07 / batch 3 | **no** |
| `learningsCaptureScript.test.js` | modified (222/1) | LI-03 / batch 2 | **no** |
| `learningsConfig.test.js` | modified (235/2) | LI-12 / batch 5 | **no** |
| `learningsDispatchSet.test.js` | modified (113/24) | LI-11 / batch 5 | **no** |
| `learningsArmInventory.test.js` | modified (0/7) | LI-23 / batch 5 | **no** |
| `learningsCorpus.test.js` | modified (0/3) | LI-09 / batch 3 | **no** |
| `pdlc/engine/__tests__/learnings-config-example.test.js` | **added** | none | **no** |
| `pdlc/workflows/package.json` | **modified (13/6)** | declared *"not modified"* in prose | **no** |
| `pdlc/workflows/dist/pdlc-cli.mjs` | modified | no owner, by design | covered by existing prose |
| `coverageInstrumentation.test.js`, `pdlc/engine/__tests__/docs-uniqueness.test.js` | modified | outside this feature's manifest | n/a |

The section's own stated rule is the one it under-applies. It says two of the surfaces "are **second
writes** to files the batch ladder already owns, which is exactly the case P-A-5 says must be
recorded as a manifest amendment rather than left in a completion note." P-A-5's answer cell is
explicit about the form: **"one added row per file, naming the causing task and its batch."** Nine
files that the manifest assigns to a named `LI-*` owner received a second write in this commit; two
of them got a row. The remaining seven — including a **production** write to `orchestrate-dev.js`,
the file the manifest protects with its most emphatic single-writer paragraph ("Eight source edits,
eight batches, one writer each") — are in exactly the state P-A-5 says enforces nothing.

The `orchestrate-dev.js` write is not cosmetic. `2fc6fcd3` changes `selectLearnings`'s **signature**
(dropping the `feature` parameter), updates its caller in `buildLearningsInjector`, rewrites the
`RSN-COUNT` mixed-case comment from *"routed as `ERRATUM: FSPEC`"* to *"stated upstream as of FSPEC
v0.14's BR-6 … there is nothing left routed"*, and wires a live `_log` emitter into `main()` for
CODE_REVIEW v1 F2. That is a production behaviour change to a ladder-owned file, landing outside the
ladder, invisible to the manifest. Filed as F-01, High.

### The prose claim that package.json is not modified is false at HEAD

§Production and generated states, as one of two deliberate no-owner exceptions:
"`pdlc/workflows/package.json` is **not** modified: `scripts/capture-learnings-baseline.mjs` is
deliberately left outside `c8.include`, exactly because `orchestrate-dev.js`, `orchestrate-queue.js`
and `build-runtime.mjs` are resolved relative to `pdlc/workflows/`." At HEAD `package.json` **is**
modified by `2fc6fcd3`: `allow-external: true` is set, all four include entries are rewritten as
`**/`-anchored paths, `**/scripts/capture-learnings-baseline.mjs` is now **inside** `c8.include`,
and an `exclude` block for capture worktrees is added. The commit message region records this as
CODE_REVIEW v1 F4, second round. So the exemption this paragraph justifies no longer exists, and
DoD 11's "silence" rationale rests on a premise the tree contradicts. These bytes are pre-round, and
this edit did not touch them — but they sit inside the very section this edit was dispatched to
reconcile with `2fc6fcd3`, so the reconciliation is where the correction belongs. Filed as F-02,
High, tagged `inherited` so it routes back rather than halts.

### The eighteenth file

Changelog item (3) states the arithmetic it is closing: "fourteen test rows against **eighteen**
`learnings*` files tracked at `09c7c62f`." I counted at HEAD: seventeen under
`pdlc/workflows/__tests__/` (thirteen `learnings*.test.js`, three helpers, plus the fixtures
directory carried as its own row) and one more — `pdlc/engine/__tests__/learnings-config-example.test.js`,
**added by the same `2fc6fcd3`**. The four rows this delta adds close thirteen-plus-four = seventeen.
The eighteenth is the engine-side file, and it is owned by no `LI-*` row and appears in no manifest
row, which is the same defect the routed item named. Filed as F-03, Medium.

## Dependencies

**No `Deps` edge changed.** The diff contains no line inside §Dependencies and no `Deps` cell. This
delta scheduled nothing.

**Item 1 — the commit re-pins — is fully resolved, and I resolved every pin myself.** The three
pre-rebase hashes I raised at v12 are gone from the document; `git log` confirms `92b7ea0c`,
`d462ddd8` and `2cbacada` are all unreachable from HEAD, and the three replacements resolve to the
right tasks on the branch:

| Pin | Resolves to | Reachable from HEAD |
|---|---|---|
| LI-21 `e7fa8d87` | `feat(pdlc-learnings-injection): LI-21 — GREEN the run wiring and the report key` | yes |
| LI-16 `be2456c8` | `feat(pdlc-learnings-injection): LI-16 — GREEN pure core (TSPEC §I.3, §D.3–§D.6)` | yes |
| LI-17 `a4998e13` | `feat(pdlc-learnings-injection): LI-17 — GREEN renderer, renderLearningsBlock({selected})` | yes |

The re-pin is applied consistently: case C's *When* and outcome cells, the v0.8 changelog row and
the v1.1 changelog row all carry the new triple, so no reader lands on a hash they cannot resolve.
Re-pinning the historical changelog rows rather than leaving them "correct as of the day" is the
right call and the 1.2 row explains why in one sentence — those rows assert what is landed *at
HEAD*, so an unresolvable pin falsifies the claim rather than dating it. These are the same commits
under post-rebase identity; no historical claim changed. Item 1: closed.

**PROPERTIES agrees from its end.** §C.4 of PROPERTIES pins the same three commits (`e7fa8d87`,
`be2456c8`, `a4998e13`) and the same measurement anchor `09c7c62f`, so the two documents now name
one set of commits between them. That was the asymmetry my v12 raise was about, and it is closed.

**One PROPERTIES-side lag, recorded rather than raised.** §C.4's closing paragraph still offers case
B's route — "or, if it lands red, its rows are amended into the ledger by name first, under the same
P-A-7 rule" — which is the wording this PLAN's P-A-6 cell corrected at v1.1 by routing to "P-A-7's
governing case" instead. At HEAD that governing case is C, where no ledger remains to amend into.
The PLAN's side is right; the lag is downstream's field to advance, and recording it here keeps the
finding with its owner rather than charging this document for it.

**No upstream drift.** DEC-ERR-03 asks whether this PLAN is still a faithful compression of upstream
at upstream's current version. I re-hashed all four: REQ, FSPEC, TSPEC and DECISIONS match the
dispatch pins byte for byte, so nothing the changed regions cite has moved. The one upstream-facing
claim the new bytes make is case C's production paragraph (an optional ordinal stripped via
`SECTION_HEADING_RE`, an optional trailing gloss stripped, case-sensitive comparison against
`BR6_SECTION_NAMES`, `###` never matching `^##[ \t]+`), carried byte-identical from the bytes I
approved at v13. I re-derived it from shipped source at HEAD: `SECTION_HEADING_RE` is
`/^##[ \t]+(?:\d+\.[ \t]*)?(.*?)[ \t]*$/` at `orchestrate-dev.js`, `canonicalSectionName` tests
`BR6_SECTION_NAMES.includes(title)` before its gloss loop, and no `###` line can match a
`^##[ \t]+` anchor. All four clauses hold. Note in passing that `2fc6fcd3` also rewrote the
`RSN-COUNT` comment in the same file from "routed as `ERRATUM: FSPEC`" to "stated upstream as of
FSPEC v0.14's BR-6 … there is nothing left routed" — code and specification agree at HEAD, which is
consistent with the FSPEC I hashed, and is a further reason that production write deserved a row.

## Verification

### The four routed items, one at a time

| Routed item | Disposition | Verified against |
|---|---|---|
| **(1)** Case C cites `92b7ea0c`, `d462ddd8`, `2cbacada` — pre-rebase and unreachable | **Resolved.** Re-pinned to `e7fa8d87`, `be2456c8`, `a4998e13` in case C and in the v0.8 and v1.1 changelog rows | `git merge-base --is-ancestor` on all six hashes: the three old ones unreachable from HEAD, the three new ones reachable and resolving to LI-21 / LI-16 / LI-17 by subject line |
| **(2)** P-A-7's case C states a forward-looking expectation for something already discharged | **Resolved, and the claim is true.** The cell now records the outcome: 26 passed / 26 total, 0 skips at `09c7c62f`, all four `LI-AT-11` heading-form cases and both Group D amendments inside that count, failure limb "unexercised, not waived" | I ran it: `npm test -- __tests__/learningsBlock.test.js __tests__/learningsSelect.test.js` from `pdlc/workflows` reports **2 suites passed, 26 passed, 26 total**. `PROP-ORDER-06` and `PROP-CORPUS-09` are present in `learningsSelect.test.js` as PROPERTIES §C.4 describes |
| **(3)** Four `2fc6fcd3` remediation files owned by no LI task and in no manifest row | **Resolved for the four named; a fifth remains.** All four now carry rows with a landing commit and a CODE_REVIEW v1 cause | Each of the four resolves to `2fc6fcd3` under `git log --diff-filter=A`. But the same commit also adds `pdlc/engine/__tests__/learnings-config-example.test.js`, still unowned — F-03 |
| **(4)** Second-owner rows P-A-5 requires for `2fc6fcd3`'s re-capture | **Partially resolved.** Two second-writer rows recorded (`fixtures/learnings-baseline/**`, `learningsBaselineGuard.test.js`); seven more ladder-owned files written by the same commit carry none, one of them production | Full `--name-status` enumeration of `2fc6fcd3` in §Batches — F-01 |

Item (2) is the cleanest of the four. Recording a discharged obligation as an outcome rather than an
expectation is exactly the tense correction TE asked for, the rule underneath is unchanged, and the
distinction the cell draws — the failure limb is **unexercised, not waived** — is the one that keeps
the rule available if a later amendment does land red. I re-ran the measurement rather than trusting
it, and the numbers are exact.

### What the delta did not break

- **The batches 7–13 expected-red ledger is byte-identical.** The diff contains no ledger line.
- **Case C's ruling is unchanged; only its tense moved.** The green-at-landing obligation, the
  fix-before-batch-14 rule and the gate-failure clause are all still stated verbatim after the new
  outcome sentence. The rule survives its own discharge, which is what stops the next amendment
  falling through.
- **The two dispatcher-parsed tables are byte-unchanged**, so nothing the dispatcher reads changed.
- **§The arithmetic is now explicitly scoped.** The appended sentence restricts the 24-rows /
  17-files count to the two parsed tables and excludes the six new rows by construction. I checked
  the arithmetic still reconciles under that scoping: it does.
- **No AT partition, fixture or `Deps` edge moved**, as the 1.2 row claims. True against the diff.

### Batch-safety rule 2: the argument is sound but the premise is now narrower than stated

The new "single-writer premise survives" paragraph argues that `2fc6fcd3` is one serial commit
landing after batch 13 with no batch in flight, so no batch ever holds two writers, and LI-06 remains
the ladder owner. **That reasoning is correct**, and I verified the ordering claim
(`e7fa8d87` is an ancestor of `2fc6fcd3`, and `2fc6fcd3` postdates batch 13 by a day). It is the
right argument. My finding is not with the argument but with its domain: the paragraph reasons about
"both files" — LI-06's two — while the commit wrote nine ladder-owned files. The identical serial
argument covers all nine, so the fix is to widen the rows and the paragraph together, not to rework
the reasoning.

### My three open v13 Lows, re-checked

All three are still present at HEAD, all three untouched by this delta, all three still non-gating:
the 0.9 changelog row still credits the P-A-7 lead-in fix to "(PM v10 erratum)" when the raiser was
TE v11 F-01 (line 642); §Changelog's 0.6 row still precedes its 0.5 row (lines 638–639) while 0.7
through 1.2 are correctly appended; and case A's derivation still quotes its own superseded text,
"a commit landing in batches 2–6 is also \"before batch 7\"", against a *When* cell that has read
"before batch 9" since v1.1 (line 521). Re-filed as F-04, F-05, F-06, all `inherited`.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§Post-batch remediation states that `2fc6fcd3` "touched six test-side surfaces"; at HEAD it touched twenty files, nine of them ladder-owned, and two of those are production.** `git show --name-status 2fc6fcd3` lists modifications to `pdlc/workflows/orchestrate-dev.js` (15/6 — `selectLearnings`'s signature loses `feature`, its caller is updated, the `RSN-COUNT` comment is rewritten, a live `_log` emitter is wired into `main()` for CODE_REVIEW v1 F2), `scripts/capture-learnings-baseline.mjs` (74/19), `pdlc/workflows/.gitignore`, and five more ladder-owned suites — `learningsSelect.test.js` (LI-07), `learningsCaptureScript.test.js` (LI-03), `learningsConfig.test.js` (LI-12), `learningsDispatchSet.test.js` (LI-11), `learningsArmInventory.test.js` (LI-23), `learningsCorpus.test.js` (LI-09). P-A-5 requires "one added row per file, naming the causing task and its batch"; two files got a row. The routed item is therefore only partly landed, and the section's scope sentence is false as written. Fix: correct "six test-side surfaces" to the actual count, drop "test-side" (it is not), and add a second-writer row per ladder-owned file, with the serial-commit argument widened to cover them — the argument already generalises, only its domain is short | P-A-5; §File-ownership manifest single-writer contract |
| F-02 | High | Local | **§Production and generated declares "`pdlc/workflows/package.json` is **not** modified", and at HEAD it is.** `2fc6fcd3` sets `allow-external: true`, rewrites all four `c8.include` entries as `**/`-anchored paths, adds `**/scripts/capture-learnings-baseline.mjs` **to** the include set — the exact opposite of the paragraph's "deliberately left outside `c8.include`" — and adds an `exclude` block for the capture worktrees. The commit records this as CODE_REVIEW v1 F4, second round. The paragraph's justification for the exemption, and DoD 11's silence which rests on it, both stand on a premise the tree contradicts; a reader auditing coverage scope from this document would reach the wrong conclusion. These bytes are pre-round, so this is tagged `inherited` and routes back rather than halting, but it belongs in this reconciliation because it is the same commit and the same section. Fix: restate the paragraph as what the manifest now records — the script *is* inside `c8.include` under `allow-external`, why every entry had to become path-anchored, and what DoD 11 now says about it | §Production and generated; DoD 11 |
| F-03 | Medium | Local | **The eighteenth `learnings*` file is still unowned.** Changelog item (3) sets up the arithmetic it is closing — "fourteen test rows against eighteen `learnings*` files tracked at `09c7c62f`" — and adds four rows. Thirteen `learnings*` js files plus the fixtures-directory row plus the four new ones accounts for the seventeen under `pdlc/workflows/__tests__/`. The eighteenth is `pdlc/engine/__tests__/learnings-config-example.test.js`, added by the same `2fc6fcd3`, owned by no `LI-*` task and named in no manifest row. Fix: add it as a fifth new-file row, or state in one clause why an engine-side test file is outside this manifest's domain — either closes the count | P-A-5; TE v12's file-inventory item |
| F-04 | Low | Local | §Changelog's 0.9 row (line 642) still credits the P-A-7 lead-in fix to "(PM v10 erratum)". The raiser was **TE v11 F-01**; no PM cross-review in this feature contains the string "two cases that can arise". The 1.1 row names the right raiser one row below without correcting the row that carries the error. Fix: replace "(PM v10 erratum)" with "(TE v11 F-01)". Carried unfixed from PM v12 F-01 and PM v13 F-01 | Process record; no REQ clause |
| F-05 | Low | Local | §Changelog's 0.6 row (line 638) still precedes its 0.5 row (line 639), leaving the version table non-monotone; 0.7 through 1.2 are all correctly appended in order. Fix: swap the two rows. Carried unfixed from PM v10 F-03, PM v12 F-05 and PM v13 F-02 — four rounds | Process record; no REQ clause |
| F-06 | Low | Local | Case A's derivation still quotes its own superseded text — "a commit landing in batches 2–6 is also \"before batch 7\"" (line 521) — against a *When* cell that has read "before batch 9 (which includes batches 7 and 8)" since v1.1. The ruling is unaffected (batches 2–6 carry no ledger either way). Fix: quote "before batch 9", or drop the quotation marks. Carried from PM v13 F-03 | P-A-7 gate contract; no REQ clause |

DEFERRED: the six-row §Post-batch remediation table and the two dispatcher-parsed tables now state ownership in two different vocabularies (`Owner` vs `Landing commit`); a one-line legend above the manifest saying which table the dispatcher parses would make that intentional split legible to a first-time reader.
DEFERRED: §The arithmetic is now scoped by a sentence appended to a long paragraph; promoting the scoping to its own lead-in clause would make the exclusion visible before the counts rather than after them.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `2fc6fcd3`'s subject line reads `docs(cross-review): TE DECISIONS v8 context`, but it carries the whole CODE_REVIEW v1 remediation — twenty files, two of them production. The PLAN cites it as "the DoD remediation commit `2fc6fcd3`", which is what it *is* but not what it *says*. Is the intent to leave the mixed commit as-is and let the manifest rows carry the provenance? If so, one clause noting that the subject line understates the commit would save the next reader the resolution I just did. Not gating |
| Q-02 | Does the `2fc6fcd3` production write to `orchestrate-dev.js` (the `_log` wiring for CODE_REVIEW v1 F2, and `selectLearnings` losing its `feature` parameter) belong in DoD 14's list of consciously-carried remediations alongside the four POSTMORTEM-D items, or is it inside the injection region and therefore covered by clauses 1–13? The two lists currently do not intersect, and this commit is the one place the distinction bites |

## Positive Observations

- **The containment decision is right, and it is argued rather than asserted.** Putting the new rows
  in a subsection that carries a *landing commit* instead of an `Owner` cell — because the
  dispatcher parses `Owner` as a task id and a `2fc6fcd3` or `none` cell would parse as a stale row
  — keeps a machine-read contract intact while still recording the truth for humans. It also cites
  the precedent it follows (`dist/pdlc-cli.mjs`, already stated in prose for the same reason). That
  is the correct shape for this problem and I would not want it changed while fixing F-01.
- **The two dispatcher-parsed tables came through byte-unchanged**, and §The arithmetic was scoped
  explicitly rather than quietly recounted. An erratum that adds rows to a manifest is exactly where
  a count silently goes wrong; this one anticipated it.
- **Case C now records an outcome instead of a prediction, and keeps the rule.** The cell states the
  measurement (26/26, 0 skips at `09c7c62f`), names what is inside the count, and then says the
  failure limb is **unexercised, not waived** — so the rule survives its own discharge and is still
  there for the next amendment. I re-ran the suites; the numbers are exact.
- **The commit re-pin was applied everywhere the triple appears**, including two historical
  changelog rows, with a one-sentence justification for touching history that I agree with: those
  rows assert what is landed at HEAD, so an unresolvable pin falsifies rather than dates them.
- **The batch-safety argument is made rather than waved.** "Rule 2 is preserved, not excepted" is
  backed by the serial-commit reasoning, and the ordering claim is true — `e7fa8d87` is an ancestor
  of `2fc6fcd3`. The argument generalises to the seven files F-01 adds, which is why F-01 is a
  widening job and not a rework.

## Recommendation

**Needs revision**

Three of the four routed items land cleanly and I verified each first-hand: the commit re-pins
resolve, the 26/26 measurement reproduces exactly, and the four unowned remediation files are now
recorded. Item 4 is the one that did not finish. `2fc6fcd3` made nine second writes to ladder-owned
files, two of them to production code, and the new section records two of the nine while stating as
fact that the commit "touched six test-side surfaces". P-A-5's contract is "one added row per file";
the manifest still does not reconcile with the tree, and the file it leaves least protected is
`orchestrate-dev.js`, the one the manifest guards with its strongest single-writer paragraph. That
is F-01, High, `delta`, `local`.

Reconciling this section with `2fc6fcd3` also surfaced F-02: §Production and generated declares
`package.json` "not modified", and the same commit modified it — putting the capture script *inside*
`c8.include`, the exact opposite of the exemption the paragraph justifies. Those bytes are pre-round
and this edit did not touch them, so I tag it `inherited`: it routes back to the owning phase rather
than halting this round, but it belongs to this reconciliation, same commit and same section.

To close, three edits, all additive: (1) correct the scope sentence and add one second-writer row per
ladder-owned file `2fc6fcd3` wrote, widening the serial-commit paragraph to cover them; (2) restate
§Production and generated's `package.json` paragraph to match HEAD's `c8` block; (3) account for
`pdlc/engine/__tests__/learnings-config-example.test.js`, by row or by a scoping clause. The three
Lows are one word, one row swap and one quoted string, and belong in whatever pass next edits those
blocks.

Nothing I previously approved broke. No task moved batch, no `Deps` edge changed, no AT partition or
fixture moved, the batches 7–13 ledger is byte-identical, both dispatcher-parsed tables are
untouched, and upstream — REQ, FSPEC, TSPEC, DECISIONS — hashes byte-identical to the dispatch pins,
so this PLAN is still a faithful compression of upstream at upstream's current version.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | `2fc6fcd3` made nine second writes to ladder-owned files, two of them production; the new section records two and calls the commit "six test-side surfaces" | §File-ownership manifest → Post-batch remediation (CODE_REVIEW v1) |
| F-02 | High | inherited | local | `package.json` is declared "not modified" but `2fc6fcd3` modified it, putting the capture script inside `c8.include` — the opposite of the stated exemption | §File-ownership manifest → Production and generated |
| F-03 | Medium | delta | local | The eighteenth `learnings*` file, `pdlc/engine/__tests__/learnings-config-example.test.js`, is added by the same commit and owned by no row | §File-ownership manifest → Post-batch remediation / §Changelog v1.2 item (3) |
| F-04 | Low | inherited | nonlocal | §Changelog's 0.9 row credits the P-A-7 lead-in fix to "(PM v10 erratum)"; the raiser was TE v11 F-01 | §Changelog, row 0.9 |
| F-05 | Low | inherited | nonlocal | §Changelog's 0.6 row precedes its 0.5 row | §Changelog, rows 0.5/0.6 |
| F-06 | Low | inherited | nonlocal | Case A's derivation still quotes "before batch 7" against a *When* cell reading "before batch 9" | §P-A-7 case table, case A |

FINDING: High | delta | local | §File-ownership manifest → Post-batch remediation (CODE_REVIEW v1) | the section states `2fc6fcd3` "touched six test-side surfaces", but `git show --name-status 2fc6fcd3` lists twenty files including nine second writes to ladder-owned files — production `orchestrate-dev.js` (15/6: `selectLearnings` loses `feature`, caller updated, `_log` emitter wired into `main()`), production `scripts/capture-learnings-baseline.mjs` (74/19), `.gitignore`, and `learningsSelect`/`learningsCaptureScript`/`learningsConfig`/`learningsDispatchSet`/`learningsArmInventory`/`learningsCorpus`; P-A-5 requires one added row per file and only two were added, so the routed item is partly unlanded
FINDING: High | inherited | local | §File-ownership manifest → Production and generated | the paragraph declares `pdlc/workflows/package.json` is "**not** modified" and the capture script "deliberately left outside `c8.include`", but `2fc6fcd3` modified it — `allow-external: true`, all four include entries re-anchored as `**/` paths, `**/scripts/capture-learnings-baseline.mjs` added to the include set, plus a new `exclude` block — so the exemption and DoD 11's silence rest on a premise HEAD contradicts
FINDING: Medium | delta | local | §File-ownership manifest → Post-batch remediation / §Changelog v1.2 item (3) | item (3) frames the fix as fourteen rows against eighteen tracked `learnings*` files, but the four new rows account for seventeen; the eighteenth, `pdlc/engine/__tests__/learnings-config-example.test.js`, is added by the same `2fc6fcd3` and is owned by no LI task and named in no manifest row
FINDING: Low | inherited | nonlocal | §Changelog, row 0.9 | the row credits the P-A-7 lead-in fix to "(PM v10 erratum)" when the raiser was TE v11 F-01; the 1.1 row names the right raiser one row below without correcting this one
FINDING: Low | inherited | nonlocal | §Changelog, rows 0.5/0.6 | the 0.6 row precedes the 0.5 row, leaving the version table non-monotone while 0.7 through 1.2 are correctly ordered
FINDING: Low | inherited | nonlocal | §P-A-7 case table, case A | the outcome cell's derivation quotes "before batch 7" although the *When* cell has read "before batch 9 (which includes batches 7 and 8)" since v1.1

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 3}
