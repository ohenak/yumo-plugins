# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.3)
**Date:** 2026-08-21
**Iteration:** 15

## Overview

**What changed, and against what base.** `git diff 95098af5..HEAD` on the PLAN — 95098af5 being the
v1.2 commit I reviewed at v14 — is **74 insertions, 35 deletions**: the version cell (`1.2` → `1.3`),
the upstream pin cell (FSPEC `v0.13` → `v0.14`, REQ `v0.9` → `v0.10`, DECISIONS `v0.3` → `v0.5`) and
three prose pins that carry the same versions, a qualified §Overview change-surface sentence, the
`package.json` row of the change-surface table, the §Production and generated `package.json` bullet,
a rewritten and much longer §Post-batch remediation subsection (six rows → **nineteen**), one
sentence in §The arithmetic, DoD 11 and DoD 12, case A's derivation quote, a changelog row swap, one
changelog credit, and a new 1.3 row. No task row's `Owner`, `Batch` or `Deps` cell moved.

**Verdict up front: all six of my v14 findings are resolved, and I resolved each against the
repository rather than against the changelog's account of it.** The two Highs — the under-recorded
`2fc6fcd3` manifest amendment (F-01) and the false "`package.json` is **not** modified" premise
(F-02) — are closed with material I could verify line by line: the subsection is now derived from
`git show --name-status 2fc6fcd3` and its 45-path accounting reconciles exactly, and the
`package.json` prose now matches the shipped `c8` block byte for byte. The Medium (F-03, the
eighteenth `learnings*` file) has its own row. The three Lows (F-04 changelog credit, F-05 changelog
order, F-06 case A's stale quote) are all fixed. **Nothing I previously approved broke.** Two new
Lows, both cosmetic, neither gating. **Approved with minor changes.**

**Scope of this pass, under DECISION FREEZE.** I measured only the changed regions, and I asked of
each only the two questions a frozen round admits: did this delta break something that worked, and
does any load-bearing claim in the changed bytes contradict the repository at HEAD or an upstream
document. I re-derived every commit pin, every file enumeration, every diffstat number and the whole
`c8` block from the tree at HEAD (`6792fa5f`) and at the measurement anchor `09c7c62f`. Upstream
pins were re-read from the documents themselves, not from this PLAN's header.

## Batches

**No task row moved, and I checked mechanically rather than by eye.** I extracted the `Owner`,
`Batch` and `Deps` columns of every `| LI-NN |` row from both revisions and diffed them: identical.
The only edit inside a task row is LI-12's prose pin (`FSPEC v0.13's AT-30` → `v0.14's`, twice), and
the per-batch expected-red ledger for batches 7–13 is byte-identical between the two revisions. The
1.3 changelog row's claim — "no task moved batch, no `Deps` edge changed, no AT partition, fixture
or ledger row was touched" — is true against the diff.

### F-01 (High, v14) is resolved: the subsection now reconciles with the commit

My v14 High was that §Post-batch remediation described `2fc6fcd3` as "six test-side surfaces" and
recorded two of nine second writes, while P-A-5 requires "one added row per file". The rewritten
subsection states its own provenance — "derived from `git show --name-status 2fc6fcd3`, not from any
prior description of the commit" — and I re-ran that command. Its accounting reconciles exactly:

| The subsection's claim | Measured at `2fc6fcd3` |
|---|---|
| lists **45 paths** | 45 |
| 18 added fixture prompts under `PIPELINE-NON-AUTHORING-PROMPTS/` | `0.txt`…`17.txt`, 18 added |
| **five added test-side files** | `helpers/learningsBaselineScenarios.js`, `helpers/learningsComposition.js`, `learningsDisclosure.test.js`, `learningsErratumBinding.test.js`, `pdlc/engine/__tests__/learnings-config-example.test.js` |
| nine modified files under `pdlc/workflows/__tests__/` | `coverageInstrumentation`, `fixtures/learnings-baseline/MANIFEST.json`, `learningsArmInventory`, `learningsBaselineGuard`, `learningsCaptureScript`, `learningsConfig`, `learningsCorpus`, `learningsDispatchSet`, `learningsSelect` — nine |
| one modified pre-existing engine suite | `pdlc/engine/__tests__/docs-uniqueness.test.js` |
| four modified production/configuration files | `orchestrate-dev.js`, `scripts/capture-learnings-baseline.mjs`, `pdlc/workflows/package.json`, `pdlc/workflows/.gitignore` |
| the regenerated `dist/pdlc-cli.mjs` | modified |
| seven pipeline/document files | `REQ`, `FSPEC`, `TSPEC`, `CLAUDE.md`, `pdlc/OPERATIONS.md`, `pdlc/README.md`, `.claude/pdlc.config.example.json` |

18 + 5 + 9 + 1 + 4 + 1 + 7 = **45**. The partition is exhaustive and disjoint, which is the property
that makes "one added row per file" checkable rather than assertable.

**Every second-writer row's owner and batch is correct against the manifest table above it.** I
checked each against the file-ownership manifest's own rows: `learningsCaptureScript.test.js` →
LI-03 / batch 2 (manifest line 231), `learningsSelect.test.js` → LI-07 / 3 (line 233),
`learningsCorpus.test.js` → LI-09 / 3 (line 235), `learningsDispatchSet.test.js` → LI-11 / 5
(line 239), `learningsConfig.test.js` → LI-12 / 5 (line 240), `learningsArmInventory.test.js` →
LI-23 / 5 (line 241), `scripts/capture-learnings-baseline.mjs` → LI-05 / 3 (line 199). Not one is
mis-attributed.

**The three production-side row bodies are exact.** `git show --numstat 2fc6fcd3` gives
`orchestrate-dev.js` 15/6, `scripts/capture-learnings-baseline.mjs` 74/19,
`pdlc/workflows/package.json` 13/6 and `pdlc/workflows/.gitignore` 1/0 — matching the rows' "15
insertions, 6 deletions", "74 insertions, 19 deletions" and "one ignore line" verbatim. The
`.gitignore` row's disambiguation is true: the commit touches `pdlc/workflows/.gitignore` (adding
`/.tmp-capture-driver-*/`) and does **not** touch the root `.gitignore` LI-04 owns. And the
`selectLearnings` signature claim is true at HEAD — `pdlc/workflows/orchestrate-dev.js:2426` reads
`export function selectLearnings({ entries, thresholds })`, with no `feature` parameter.

### F-03 (Medium, v14) is resolved, and the count now reconciles from two directions

The eighteenth file has its own row: `pdlc/engine/__tests__/learnings-config-example.test.js`,
"new — no LI owner", cause F9. I counted the tree at the measurement anchor: `git ls-tree -r
09c7c62f` yields **fourteen** `pdlc/workflows/__tests__/learnings*.test.js` suites, **three**
helpers (`learningsFixtures.js`, `learningsBaselineScenarios.js`, `learningsComposition.js`) and the
one engine-side file — eighteen. §Overview's new sentence states exactly that decomposition, and
§The arithmetic reaches the same eighteen by the other route (ladder's thirteen + `2fc6fcd3`'s five
added). Both are true, and they agree.

## Dependencies

**No `Deps` edge changed.** The column diff above is mechanical, not impressionistic: the `Deps`
cells of all 23 `LI-*` rows are byte-identical between `95098af5` and HEAD. This delta scheduled
nothing and re-ordered nothing.

**The upstream re-pin is a pin refresh, and the pins are right.** The header now reads REQ v0.10 /
FSPEC v0.14 / TSPEC v0.9 / DECISIONS v0.5. I read each document's own version row rather than
trusting the PLAN's header:

| Document | Version row at HEAD | PLAN's pin |
|---|---|---|
| `REQ-pdlc-learnings-injection.md` | `0.10` (line 18) | v0.10 ✓ |
| `FSPEC-pdlc-learnings-injection.md` | `0.14` (line 18) | v0.14 ✓ |
| `TSPEC-pdlc-learnings-injection.md` | `0.9` (line 18) | v0.9 ✓ |
| `DECISIONS-pdlc-learnings-injection.md` | `0.5` (line 18) | v0.5 ✓ |

The three prose pins that moved with the header are LI-12's `LI-AT-30` cell, the `RSN-NO-MATERIAL`
arm row and the F-O-1 obligations row — all three are version references to text whose substance did
not change (REQ v0.10 is AC-2.4's attribution erratum, FSPEC v0.14 restates BR-6's window and the
same attribution; DECISIONS v0.5 re-grounds DEC-LI-08's byte formula and explicitly records that
"v0.14's window restatement and AC-2.4's attribution clause leave the byte-accounting basis, `E-36`
and `AT-30` untouched"). So the cited claims — E-36's third `LI-AT-30` case, the two-disjuncts-one-
branch `RSN-NO-MATERIAL` arm, F-O-1's second heading rule — are unmoved beneath the new pin numbers.
A pin refresh with no cascade is the correct handling and the 1.3 row says so in those words.

**P-A-7's case table is unchanged in substance.** The only edit inside it is case A's derivation
quoting `"before batch 9"` instead of the superseded `"before batch 7"` — my v14 F-06. The *When*
cell it now agrees with has read "before batch 9 (which includes batches 7 and 8)" since v1.1, so
the quotation and the cell are finally the same string. Case B's span (9–12), case C's domain
(batch 13 or later), the commit triple `e7fa8d87` / `be2456c8` / `a4998e13` and the 26/26 discharge
record are all byte-identical to the bytes I approved at v14.

**Downstream is untouched by this delta**, and the one PROPERTIES-side lag I recorded at v14 (§C.4
still offering case B's amend-into-the-ledger route) is still downstream's field to advance. I
record it again here rather than charging it to this document.

## Verification

### F-02 (High, v14) is resolved, and the new text is byte-accurate against the shipped `c8` block

My v14 High was that §Production and generated declared `pdlc/workflows/package.json` "**not**
modified" with the capture script "deliberately left outside `c8.include`", while `2fc6fcd3` had put
it *inside*. The correction lands in **three** places — §Overview's change-surface row (line 66), the
§Production and generated bullet (lines 214–223) and DoD 11/12 (lines 592–593) — and each states the
tree. I read `pdlc/workflows/package.json` at HEAD:

| The PLAN's claim | `pdlc/workflows/package.json` at HEAD |
|---|---|
| `allow-external: true` | line 25 ✓ |
| an `include` of **four** `**/`-anchored entries | lines 19–24: `**/pdlc/workflows/orchestrate-dev.js`, `**/pdlc/workflows/orchestrate-queue.js`, `**/pdlc/workflows/build-runtime.mjs`, `**/scripts/capture-learnings-baseline.mjs` ✓ |
| the capture script **added to** the include set | fourth entry, line 23 ✓ |
| a **three**-glob `exclude` for the capture tests' worktrees | lines 36–40: `**/.tmp-capture-driver-*/**`, `**/.baseline-worktree/**`, `**/pdlc-capture-entrypoint-*/**` ✓ |
| the rationale: under `allow-external`, bare cwd-relative basenames stop matching, so the script's entry alone would have dropped the three workflow modules | stated verbatim in the file's own `//c8` note, line 17, and attributed there to "CODE_REVIEW v1 F4, second round" ✓ |
| `coverageInstrumentation.test.js` fails if an included module stops resolving | same note, closing sentence ✓ |

That is a rare thing in a reconciliation round: the document and the code now say the same thing in
the same words, and the words came from the code. **DoD 12 is retired rather than deleted** — it
records what it used to exempt, why the exemption died at `2fc6fcd3`, and that the three oracles it
named (`LI-T-IGNORE`'s conjuncts, `LI-T-WORKTREE`'s two, the baseline guard) survive as behavioural
oracles rather than as stand-ins for a missing floor. Retiring a DoD clause in place, with its
history, is the right move: a deleted clause leaves a verifier wondering whether it was discharged
or dropped.

**DoD 11's new sentence is true and it protects a measurement I would otherwise have had to
re-derive.** It says the stage-2 per-file set is now **four** modules, not three, and that §The
measured baseline's three-row table (`build-runtime.mjs` 88.23, `orchestrate-dev.js` 88.14,
`orchestrate-queue.js` 88.75) is the **pre-`2fc6fcd3`** measurement it says it is, not the set the
gate measures at HEAD. Both halves check out: the include set is four entries, the measured-baseline
block is dated 2026-08-20 and labelled as measured on a docs-only branch, and the `--testPathIgnore
Patterns` quartet DoD 11 names matches the command printed in that section verbatim. The 88.14 /
3.14-points-of-headroom claim is unchanged and still scoped to `orchestrate-dev.js`, which is what
the region actually edits.

### The three v14 Lows, re-checked at HEAD

| v14 finding | Status | Evidence |
|---|---|---|
| F-04 — 0.9 changelog row credits "(PM v10 erratum)"; raiser was TE v11 F-01 | **Resolved** | the row now reads "(TE v11 F-01; this row originally credited a PM v10 erratum — corrected in v1.3, PM v13)". Correcting a credit *and* recording that it was corrected is better than a silent overwrite |
| F-05 — the 0.6 changelog row precedes 0.5 | **Resolved** | the two rows are swapped; 0.1 … 1.3 is now monotone end to end |
| F-06 — case A quotes its own superseded "before batch 7" | **Resolved** | the derivation now quotes "before batch 9", matching the *When* cell |

### What the delta did not break

- **Both dispatcher-parsed tables still parse.** The §Batches task table's `Owner`/`Batch`/`Deps`
  columns are byte-identical; the file-ownership manifest table gained no row (the nineteen new rows
  are in the `Owner`-free subsection below it, exactly as at v1.2). The containment decision I
  praised at v14 survived a fourfold expansion of the table it protects — which is the real test of
  it.
- **§The arithmetic still reconciles.** Its scoping sentence now reads "nineteen rows" where it read
  "six", and the 24-rows / 17-files count over the two parsed tables is untouched and still correct.
  The appended tree-side reconciliation (thirteen ladder + five added = eighteen) is new, and I
  verified it against `git ls-tree`.
- **The batches 7–13 expected-red ledger is byte-identical.** I diffed the section: no ledger line
  moved.
- **DoD 13 and DoD 14 are untouched**, so the POSTMORTEM-D disclosure and the REQ G-5 narrowing
  statement stand as approved.
- **No AT partition, fixture or `Deps` edge moved**, as the 1.3 row claims. True against the diff.

### Two new Lows, both introduced by this delta, neither load-bearing

The single-writer paragraph now enumerates its domain as "LI-06's fixtures and guard, six
ladder-owned suites, and the three production surfaces of LI-15…LI-22, LI-05 and the `c8`
configuration" — but `package.json`'s own row two lines above reads "**first write** — previously
owner-less". A first write to an owner-less file is not a second write to a ladder-owned surface, so
the enumeration overreaches by one. The argument is unaffected (the serial-commit reasoning covers a
first write trivially), and the row itself is right; only the paragraph's summary is loose. F-01,
Low. Similarly, the `docs-uniqueness.test.js` row's cause reads "accounts for the branch's document
set", but the actual change is narrower and more interesting: it re-pins two `locate("pdlc/README.md",
…)` line anchors from 98/104 to 132/138 because this feature added a 24-line README section above
them, with a comment explaining that the pin is a positive assertion and is therefore re-pinned
rather than relaxed. F-02, Low. Neither blocks; both are one clause each.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **The single-writer paragraph's enumeration includes one file that is not a second write to a ladder-owned surface.** It reads "The second-writer rows name ladder-owned files — LI-06's fixtures and guard, six ladder-owned suites, and the three production surfaces of LI-15…LI-22, LI-05 and the `c8` configuration", but the `pdlc/workflows/package.json` row two lines above reads "**first write** — previously owner-less **and unmodified**". Both statements cannot hold; the row is the correct one. The serial-commit argument is unaffected — it covers a first write to an owner-less file trivially — so this is a summary that overreaches its own table by one entry, not a defect in the reasoning. Fix: say "the two production surfaces of LI-15…LI-22 and LI-05, plus the owner-less `c8` configuration and `pdlc/workflows/.gitignore`, whose first writes the same serial argument covers" | P-A-5; §File-ownership manifest single-writer contract |
| F-02 | Low | Local | **`docs-uniqueness.test.js`'s cause cell understates what the commit did to it.** The row reads "accounts for the branch's document set". `git show 2fc6fcd3 -- pdlc/engine/__tests__/docs-uniqueness.test.js` is 7/2: it re-pins two `locate("pdlc/README.md", …, "claude plugin install")` line anchors from 98/104 to **132/138**, because this feature added a 24-line "Prior-feature learnings injection" section above them, and adds a comment recording that the pin is deliberate — "it asserts the sites as a POSITIVE at a known locus rather than merely counting occurrences — so it is re-pinned, not relaxed". That is a runtime-position claim this feature moved, which is more than "the branch's document set" conveys. Fix: one clause — "re-pins two README line anchors (98/104 → 132/138) displaced by this feature's own README section; the pin is a positive-locus assertion, re-pinned rather than relaxed" | Local record; no REQ clause |

DEFERRED: the §Post-batch remediation table has grown from six rows to nineteen and now mixes four relations to the ladder (new/no owner, second writer, pre-existing suite with no prior row, first write to an owner-less file); a one-line legend above it naming those four categories would let a reader classify a row without reading the paragraph below the table.
DEFERRED: §Overview and §The arithmetic now reach "eighteen" by two different decompositions (14 suites + 3 helpers + 1 engine file; 13 ladder + 5 added); both are correct and their agreement is the interesting fact, so stating that they are two routes to one number would make the reconciliation self-evidencing.
DEFERRED: DoD 12 is retired in place but keeps its clause number in the DoD's running order; a verifier walking clauses 1–14 now encounters one that asserts nothing to verify, which a "(retired — no obligation)" marker in the clause's first three words would signal before the paragraph is read.

## Questions

| ID | Question |
|----|---------|
| Q-01 | My v14 Q-01 stands unanswered and is now more visible, not less: `2fc6fcd3`'s subject line is `docs(cross-review): TE DECISIONS v8 context`, and the subsection it anchors now shows the commit carrying 45 paths, four production/configuration files and five new test files. The PLAN's rows carry the provenance correctly, so nothing is lost — but the subject line still understates the commit by an order of magnitude, and every future reader who resolves it will do the double-take I did twice. Is the intent to leave the mixed commit as-is with the manifest carrying the truth? One clause saying so would close it. Not gating |
| Q-02 | Also carried from v14: DoD 14 names four consciously-carried POSTMORTEM-D remediations, and the `orchestrate-dev.js` row now records a production write from `2fc6fcd3` (the `_log` emitter wired into `main()` for CODE_REVIEW v1 F2, and `selectLearnings` dropping `feature`). Is that write inside the injection region and therefore covered by DoD clauses 1–13, or is it a fifth consciously-carried item? The two lists still do not intersect, and this is the one commit where the distinction bites. Not gating |
| Q-03 | New, arising from DoD 11's four-module stage-2 set: the ≥ 85 % per-file branch floor now applies to `scripts/capture-learnings-baseline.mjs` as well, but the measured headroom in §The measured baseline is stated only for `orchestrate-dev.js` (88.14 %, 3.14 points). Is the capture script's own per-file branch number known at HEAD, and does it clear 85 % with room? DoD 11 is now a claim about four modules whose measured evidence covers three. Not gating in a frozen round — the measurement is the gate's to make, not this document's — but a reader planning against DoD 11 would want the fourth number |

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
