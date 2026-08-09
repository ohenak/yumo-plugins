# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md`
**Date:** 2026-08-09
**Iteration:** 1
**Scope:** Technical lens — testability against the chosen architecture, test-level fit, oracle
soundness (no implementation echoes, no absence-only oracles, set-equality over enumerations),
fixture and double design, and agreement with PLAN §4's task table and §5's file-ownership manifest.

## Grounding pass

Every `file:line` claim in §1's grounding table was re-measured against the working tree at
`feat-pdlc-consolidation-agent` HEAD before any finding below was written. The table is accurate —
unusually so — and I record that explicitly because the findings that follow are about the
document's internal consistency, not about its reading of the codebase.

| §1 claim | Re-measured | Verdict |
|---|---|---|
| `MERGE_GUARD_DEFAULTS` frozen, four members, `:48-53` | `export const MERGE_GUARD_DEFAULTS = Object.freeze([` at `orchestrate-dev.js:48` | ✅ |
| `resolveAdvisoryRung` `:1833`, `ADVISORY_RUNG_SKILL` `"se-review"` `:1797` | both exact | ✅ |
| `ADVISORY_MODEL_FALLBACK:` emit line `:1859` | exact | ✅ |
| `gitWithLockRetry` module-private `async function` at `:8653`, **not** `:8617` | `async function gitWithLockRetry(` at `:8653`, no `export` | ✅ |
| `commitPaths` `:8705`, unscoped `git commit -m` at `:8726` | exact; and it **is** `export`ed, as §13.3 erratum 1 already records | ✅ |
| `commitQueueRow` `orchestrate-queue.js:1576`, `NOTHING_TO_COMMIT_RE` `:1554` | exact | ✅ |
| `rtListFiles` transports `ls -p -A \| grep -v '/$'` at `:915`, rejects separator lines `:929-931` | exact (declaration is `:905`; the cited lines are the transport and the reject, as worded) | ✅ |
| `rtWriteFile` `:802-811`, `relative to the repository root` at `:805`, one occurrence | exact; one occurrence in the file | ✅ |
| `seams.js:296-299` distinguishes `file_missing` / `file_empty` | exact | ✅ |
| `AT19_SEAM_NAMES` `runtimeBundle.test.js:215`, `AWAIT_SCAN_SOURCES` `:1040` | exact | ✅ |
| `driftGenerators.js` `seeded` `:76`, `resolveSeed` `:134` | exact | ✅ |
| `package.json:18-22`, `/__tests__/helpers/` at `:20` | exact | ✅ |
| hook `THRESHOLD = 5` `:25`, glob `:28`, early exit `:29-30`, predicate `:41`, message `:43-48` | exact | ✅ |
| `docs/_queue/ESCALATIONS.md` absent at HEAD | `docs/_queue/` holds `QUEUE.md` only | ✅ |
| live corpus is **5** LEARNINGS under the two §3.1 globs | 3 under `docs/completed/*/` + 2 under `docs/*/`; the 2 under `docs/discarded/` correctly excluded | ✅ |
| `ADVISORY_SEAMS` `orchestrate-dev.js:1669` (PROP-ADV-02) | exact, five members | ✅ |
| PROP-BLD-02's post-T33 arithmetic: **5** tracked `dist/` files, **4** manifest rows | 4 tracked + 3 manifest rows at HEAD, +1 each for the third bundle | ✅ |
| PROP-BLD-02's premise that `CLAUDE.md`'s "Those three are the tracked, shipped outputs" is already false | `CLAUDE.md:58-62` names three; `pdlc-cli.mjs` is tracked and carries manifest row `:26` | ✅ |
| §13.3 erratum 1's uniform +36 drift | `8617+36=8653`, `8669+36=8705`, `8690+36=8726`; PLAN §2's `:10136-10143` → `:10172`, `:10151` → `:10187` — all confirmed, and the stale locators are still live in `PLAN:107,203,216,256,451,452`, `TSPEC:255,257,258,1524,1816,1817,1820`, `FSPEC:791,792,1041,1042` | ✅ correctly routed as erratum, not absorbed |

Stated property count also checks out: **113** distinct `PROP-*` ids are minted across §§2, 4–11,
matching §1's claim.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **PROP-COR-12's baseline is `git show HEAD:`, which the feature's own commit invalidates.** The property compares two hooks: "each run against **HEAD's hook** (a `git show HEAD:pdlc/hooks/scripts/nudge-consolidation.sh` copy written into the temp tree) and against the edited hook". T09 commits the edit to that exact file on this branch. From the first commit after T09 onward, `git show HEAD:…` returns the **edited** hook, both arms of the differential become the same program, arm (a)'s byte-identity is a tautology and arm (b)'s required divergence is **red on correct code**. The property is self-invalidating in the same way §2.2/PROP-FIX-02 warns about ("a Given pinned to HEAD inverts on its own PR") — the document diagnoses this failure mode for the corpus fixture and then commits it for the hook baseline. Fix: pin the pre-edit baseline by something the feature cannot move — the merge-base with the default branch (`git merge-base HEAD origin/main`), or better, an inlined verbatim copy of the shipped script checked in under `__tests__/fixtures/` so the baseline is a fixture and not a git query at all. | §4.3, PROP-COR-12 (`:385-398`) |
| F-02 | High | Local | **PROP-TRG-01…06 and PROP-PASS-01…05 specify the same invariants twice, at the same level, in two files owned by two different tasks.** Four collisions are same-level and therefore duplicated work, not layered coverage: PROP-TRG-01 (L2, `consolidationPass.test.js`, T20, AC-1.1/AC-1.2, AT-C1/AT-C1b/AT-C2) vs PROP-PASS-01 (L2, `consolidationLifecycle.test.js`, T23, AC-1.1/AC-1.2, AT-C1/AT-C1b) — the same `(n, k, volumeThreshold)` family instantiated at the same `(5,2,5)` and `(6,0,5)`; PROP-TRG-02 (L2, T20, AT-C1) vs PROP-PASS-01's empty-datum arm; PROP-TRG-04 (L2, T20, AT-C4) vs PROP-PASS-02's manual arm (L2, T23, AT-C4); PROP-TRG-05 vs PROP-PASS-05 — **verbatim the same property**, both L2, both AT-C8/NFR-3, both "one fixed corpus and one fixed configuration, run twice", both asserting set-equality by `(failure-mode-id, action)`, differing only in file and owner. Per PLAN §5's ownership manifest these are two different waves writing the same test; whichever lands second is either a copy or a silent divergence, and a later change to the trigger rule has two homes to update. (PROP-TRG-03 vs PROP-PASS-03 and PROP-TRG-06 vs PROP-PASS-04 are L1-vs-L2 and are defensible under O-4 — leave those.) Fix: pick one home per invariant; the natural split is L1 arms stay in `consolidationParse.test.js` and the whole-pass L2 arms consolidate into `consolidationLifecycle.test.js` (T23), with §5.1 cross-referencing rather than restating. | §5.1 (`:440-478`) vs §9.1 (`:1157-1199`) |
| F-03 | High | Local | **§12.2 and §12.3 contradict the body on where the `PROP-COR-*` properties live, and omit `PROP-TRG-01…06` from both matrices entirely.** Three concrete disagreements. (a) §12.2's `consolidationHookParity.test.js` row reads "PROP-COR-11, PROP-COR-12", but the body puts PROP-COR-07 (`:371`), PROP-COR-08 (`:301`), PROP-COR-12 and PROP-COR-13 (`:400`) in that file, and puts PROP-COR-11 in `consolidationPass.test.js` (`:362-367`, L2, T20). (b) §12.2's `consolidationPredicate.test.js` row reads "PROP-COR-01…10", but COR-07/08 are L4 in HookParity and COR-09 (`:346`) / COR-10 (`:356`) are L2 in `consolidationPass.test.js` — the range is wrong in both directions. (c) **PROP-TRG-01…06 appear in no §12.2 row and no §12.3 row**, so six minted properties have no owning task in the task matrix. §12.3 reproduces (a) and (b) identically (`:1528`, `:1532`). This matters beyond tidiness: §12.3 is the artifact an implementer reads to know what a task owes, PLAN §5's wave partitioning is file-scoped, and PROP-TRC-01 only checks FSPEC↔TSPEC — nothing checks §12.2/§12.3 against the body, so this class of drift is invisible to the suite the document specifies. Fix: rebuild §12.2/§12.3 from the body's per-property `· File: · Task:` trailers (which are the authoritative statement) and, given the volume, consider extending PROP-TRC-01 with a third equality over PROPERTIES §12.2 ↔ the body's trailers. | §12.2 (`:1494-1520`), §12.3 (`:1521-1550`) |
| F-04 | Medium | Local | **PROP-PASS-07's stated home contradicts §12.2, §12.3 and PLAN T06/T11.** §9.2 closes PROP-PASS-07 with "*L2 · `consolidationPass.test.js` · T28 → T31*" (`:1221`), while §12.2 `:1503` and §12.3 `:1530` both place it in `consolidationRung.test.js` under T06 → T11/T31, and PLAN T11 says it "Un-skips T06's `T11 — AT-M10` block" in `pdlc/workflows/__tests__/consolidationRung.test.js`. Two of three sources and the upstream PLAN agree, so §9.2's trailer is the error — but an implementer working §9 top-to-bottom writes the `resolveAdvisoryRung` regression into a file T20/T28 owns, against PLAN's manifest, and T06 is left with an empty file. Fix: correct §9.2's trailer to `consolidationRung.test.js · T06 → T11/T31`. | §9.2, PROP-PASS-07 (`:1215-1222`) |
| F-05 | Medium | Local | **PROP-COR-07 states its oracle as a Python local variable, and never names the env gate the channel actually requires.** The property says the hook's set "is read as the block's **`pending` binding** (`:41`, before the threshold comparison at `:43`), never from stdout". A subprocess test cannot observe a Python local. The real observable — TSPEC §7.1 `:875-877` and PLAN T09 item (4) — is an **env-gated stderr line**: `if os.environ.get("PDLC_CONSOLIDATION_DEBUG") == "1": sys.stderr.write("PDLC_PENDING:" + …)`. PROP-COR-07 mentions `PDLC_PENDING:` only in its zero-corpus sentence and never mentions the variable at all, so the property as written does not tell a fixture author to set it. Worse, the failure is silent in the passing direction: with the variable unset, stderr carries no `PDLC_PENDING:` line, and a harness that parses a missing line into `∅` gets JS `∅` ⊆ hook `∅` on every discriminating row. PROP-FIX-03's all-or-nothing degradation counter guards only the `PY_BIN` probe, not this. Fix: name `PDLC_CONSOLIDATION_DEBUG=1` and the stderr channel in PROP-COR-07's oracle sentence, and add "a `PDLC_PENDING:` line was actually observed on stderr" as a per-row precondition that fails the row rather than emptying it — folding it into PROP-FIX-03's `executed` counter would do. | §4.3, PROP-COR-07 (`:371-383`); §2.4, PROP-FIX-03 (`:175-186`) |
| F-06 | Medium | Local | **§1's grounding table cites two property ids the document never mints.** The `resolveAdvisoryRung` / `ADVISORY_RUNG_SKILL` row's "Used by" cell reads "§9 rung (PROP-RUN-\*)" (`:50`) and the `ADVISORY_MODEL_FALLBACK:` row reads "PROP-RUN-02" (`:51`). No `PROP-RUN-*` id exists anywhere in the document; the properties meant are PROP-PASS-06 (`:1203`) and PROP-PASS-07 (`:1215`). The grounding table is the document's own audit trail from measured fact to consuming property, so a dangling id there is the one place a reader cannot self-correct. (The `RUN` stem is presumably a leftover from an earlier naming that survives in PLAN as `consolidationRung.test.js`, which is what makes F-04's contradiction easy to introduce.) Fix: point both rows at PROP-PASS-06 / PROP-PASS-07. | §1 grounding table (`:50-51`) |
| F-07 | Low | Local | **PROP-CFG-02 and PROP-COR-07 pin hook facts by line index in the one file T09 renumbers, against the document's own rule.** PROP-COR-13 explicitly requires locating the `CORPUS_GLOBS` declaration "**by name, never by line index**", and §10.2 states the same discipline for the source-text properties. But PROP-CFG-02 asserts `volumeThreshold` `5` "must equal `nudge-consolidation.sh:25`'s `THRESHOLD`" and PROP-COR-07 cites the predicate at `:41` and the comparison at `:43`. T09 item (3) relocates the early exit at `:29-30` and item (4) inserts the debug block, so `:41` and `:43` both move; only `:25` is above the edits and stable. The assertions themselves are fine — it is the locators that will rot, and rotting locators in a spec are what produced §13.3 erratum 1. Fix: state these by name (`THRESHOLD`'s declaration, the `pending` comprehension, the `n >= THRESHOLD` comparison) as PROP-COR-13 already does. | §4.4 PROP-CFG-02 (`:416-420`), §4.3 PROP-COR-07 (`:376`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-DBL-02 and PROP-PASS-10 both owe the same mutation check — "delete one `await` inside `finishPass`, watch it go red, restore" — but assign it to different tasks (T31 for the mutation check in PROP-DBL-02, "owed as a check, discharged once at implementation time" in PROP-PASS-10) and to different properties (PROP-PASS-08 in PROP-DBL-02's text, PROP-PASS-10 in §9.4). Is that one obligation discharged once, or two? A mutation check nobody owns is the one that quietly does not happen. Not raised as a finding because the obligation is stated in both places rather than in neither. |
| Q-02 | PROP-COR-08 builds its own temp repository and runs the pinned argv under a real `git`, which is the right shape — but it is the only L4 row outside PROP-FIX-03's `executed` counter, and its Given depends on `git init` succeeding in the sandbox CI runs in. If `git init` fails, does the row fail or skip? The differential rows have an all-or-nothing story; this one does not, and it is the row that grounds PROP-COR-01's whole argv pin. |
| Q-03 | §12.3's closing note lists **T02** and **T30** as deliberately carrying no property row, T30 because its properties "run through T22's file". PLAN's manifest gives T30 `consolidationCredential.test.js` as a green owner and T22 as the red owner of the same file. Under PLAN §2's single-writer-per-batch rule, is T30 writing production code only, with T22's file already carrying every credential assertion? If so the note is right; if T30 is expected to add rows, two tasks write one file. |
| Q-04 | PROP-BLD-01 asserts the third bundle is "import-free" and re-binds `MERGE_GUARD_DEFAULTS`, and says "All five `dist/` files are re-stamped in the same" build. At HEAD `build-runtime.mjs` produces four tracked outputs; the fifth is this feature's. Does `build-runtime.mjs --check` currently re-stamp `pdlc-cli.mjs`, or is that a fourth manifest row this feature also has to add? PROP-BLD-02's post-T33 arithmetic (5 files / 4 rows) implies the latter, but no property names the manifest-row addition as an obligation. |

## Positive Observations

- **The grounding table is the best I have reviewed in this pipeline.** Nineteen `file:line` claims,
  every one exact at HEAD, including three (`gitWithLockRetry`, `commitPaths`, the unscoped commit)
  where the document deliberately contradicts its own upstream inputs and routes the disagreement as
  an erratum rather than absorbing it. The "+36 uniform drift" measurement is correct to the line,
  and the two side corrections it carries (`commitPaths` *is* exported; FSPEC's `:3580` is exact)
  are the kind of detail that only comes from actually re-running the search.
- **The oracle rules in §3 are stated as rules and then actually obeyed.** O-1 through O-6 are not
  decorative: PROP-MRK-02(d)'s two-age `RELEASED:` fixture, PROP-RTE-06(c)'s positive control,
  PROP-COR-09's readable control, and PROP-PR-05's two-sided containment (rather than a set-equality
  that would be red on conforming code) each show the rule being applied where it costs something.
  O-6's conjunct-to-defect mapping in PROP-REC-03 — spelling out which of `route ?? "constraints"`
  and `route ?? "degraded"` each conjunct catches, and which is the unsafe direction — is exactly
  the reasoning that makes a property reviewable instead of merely readable.
- **PROP-COR-12 exists because the previous formulation was found to pass vacuously**, and the
  document says so ("this repo, where HEAD's pending count is 1 of 2 and the widened count 3 of 5 —
  both below `THRESHOLD = 5`, so both sides printed the empty string and identity held for the wrong
  reason"). Catching a vacuous oracle by measuring the repository rather than reasoning about it is
  the habit that prevents whole classes of green-but-worthless tests. F-01 is a defect in the
  replacement, not a retreat from the insight.
- **PROP-DBL-01 declares negative space rather than leaving a gap.** Stating "no property drives
  `_listFiles`, and a reviewer who finds a `_listFiles`-driven case has found a defect", with the
  production reason (`rtListFiles` finds zero subdirectories because it filters `/$`), is the right
  way to stop a later contributor from "improving" the suite into a false green.
- **PROP-FIX-03's `test()`-declared-last placement, with the reason given** (jest does not run a
  block's `afterAll` when every test is skipped, so the all-skip world's `executed === 0` would go
  unobserved) is a real jest behaviour correctly applied, and the kind of thing normally discovered
  the hard way three months after shipping.

## Recommendation

**Needs revision**

Three High findings, all of them cheap to fix and none of them a disagreement about what this layer
should prove. The document's oracle discipline is sound and its grounding is exact; what needs
another pass is internal consistency.

Concretely, the next revision should:

1. **F-01** — repoint PROP-COR-12's baseline off `git show HEAD:` onto something T09 cannot move: a
   `git merge-base HEAD origin/main` read, or a checked-in verbatim fixture copy of the shipped
   script. As written the property is red on correct code once T09 commits.
2. **F-02** — collapse the four same-level PROP-TRG / PROP-PASS collisions to one home each
   (PROP-TRG-01/02/04/05 against PROP-PASS-01/02/05), leaving the L1-vs-L2 pairs alone, and adjust
   the §1 count of 113 accordingly.
3. **F-03** — rebuild §12.2 and §12.3 from the body's per-property `File` / `Task` trailers, so the
   `PROP-COR-*` homes agree and `PROP-TRG-*` acquires an owning task.
4. **F-04, F-05, F-06** — correct PROP-PASS-07's trailer to `consolidationRung.test.js` / T06; name
   `PDLC_CONSOLIDATION_DEBUG=1` and the stderr channel in PROP-COR-07 and make an unobserved
   `PDLC_PENDING:` line fail its row rather than empty it; repoint §1's two `PROP-RUN-*` cells at
   PROP-PASS-06 / PROP-PASS-07.
5. **F-07** — restate the two line-anchored hook citations by name, as PROP-COR-13 already requires.

No finding asks this layer to re-decide anything FSPEC or TSPEC settled, and no finding is about
the properties' substance — F-01 is the only one that would produce a failing suite, and F-02/F-03
are the ones that would produce duplicated or unowned work in Phase I.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 3, "low": 1}
