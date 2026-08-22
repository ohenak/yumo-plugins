# LEARNINGS — pdlc-learnings-injection

| Field | Detail |
|---|---|
| Feature | pdlc-learnings-injection |
| REQ | docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md |
| Date Completed | 2026-08-21 |
| Total Iterations | REQ: 12, FSPEC: 15, TSPEC: 15, PLAN: 15, PROPERTIES: 15, DECISIONS: 9, REVIEW: 2, DoD: 2 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | _(pending — filled in §6 pass)_ |
| Phases exercised | R, F, T, D, P, PT, IMPL, DOD, PR |
| DoD rounds | 2 |

## 1. Non-Convergences

Three halts, all `ERRATUM-PROTOCOL`, all on the delta-confirmation channel. The first two are the
**same failure mode two phases apart**; the third is a different class and should not be filed with
them.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| T (FSPEC erratum, v7) | se-review | Findings written as a markdown table with `delta`/`local` tags rendered *inside* the finding-text cell; **0** line-leading `FINDING:` lines. Non-approving + zero parseable lines → fail-closed synthetic `High \| delta \| nonlocal` → R4 halt. Both confirmers actually agreed on substance (E-13 provenance, AT-32 vacuous green); the disagreement was reviewer-vs-parser | FSPEC v0.7 (`fa229bde`): E-13 measured provenance restored to the two-repository scope, AT-32 gained a positive-presence conjunct, AC-6.2 row restored to `AT-31, AT-32`. Had the reviewer's own declared tags reached the parser the gate scores **R3** (one bounded follow-up). Systemic items 4–7 **deferred to harvest** | 7 of 15 |
| D (FSPEC erratum, v9) | se-review **and** te-review | Recurrence of the T failure mode, now on both channels at once. Both tagged their Highs `inherited` in prose/table cells only; fail-closed overwrote `inherited` → `delta` on both → R4 halt. Root cause named explicitly: *nothing was changed after the first occurrence* — engine, both review skills and `findingGrammarClause()` were byte-identical to what produced the T halt | Re-scored crediting the declared tags → **R2** (re-open FSPEC approval, no halt). Locus corrections landed as FSPEC v0.9 (`cbb0a63e`, `523e2df9`). Systemic items **escalated out of the harvest channel** and landed: engine restatement retry + prompt fix (`472e505c`), skill skeleton slot + Provenance/Locality table split (`42289c5e`, `d015ff89`), `check-finding-grammar.sh` lint (`eef6fedb`) | 9 of 15 |
| PR (PLAN erratum, v1.2) | pm-review **and** te-review | **Not** a channel failure — both confirmations well-formed, correctly tagged, cleanly parsed. The erratum edit described the *routed list* rather than the *commit*: it wrote "touched six test-side surfaces" (= 4+2 from the routed item's own sentence) where `git show --name-status 2fc6fcd3` lists **45 changed files**, 5 added files and 9 second writers. Two independent channels converged on the same subsection with the same arithmetic | v1.3 erratum: §Post-batch remediation re-derived from the commit (19 rows), `package.json` premise corrected in all three places, counts reconciled, pins refreshed. Logged as **a protocol success with a document defect** — no change to `erratumGateDecision`, `parseConfirmationFindings` or DEC-ERR-03 indicated. Routed `DEC-ORACLE-05`, `DEC-SEV-04` | 12 of 15 (PLAN v1.2 erratum) |

**The distance between "phase continues" and "phase halts" was four lines of text** (POSTMORTEM-D).
For an `inherited` finding, tagging *narrows* the reading from halting to non-halting — the exact
opposite of what `findingGrammarClause()`'s leniency sentence told reviewers. Both reviewers had
already done the expensive part (dating the drift to `c1180acb` / `386e4f0c`) and then dropped the
conclusion in the one place it was load-bearing, on advice that said it could not matter.

**Grammar conformance decayed rather than held**: 3–5 `FINDING:` lines per round at REQ v5–v7, then
zero on six consecutive rounds. Four approving near-misses (REQ v8, FSPEC v8 se, REQ v10, REQ v11
both channels) carried zero lines and passed ungated, because the fail-closed rule only inspects
**non-approving** confirmations. The signal was present four times and observable only at the halt.

## 2. Cross-Feature Patterns

Findings tagged `Cross-Feature`, plus `Local`-tagged findings that reference a sibling feature or a
repo-wide mechanism and were re-routed here under the under-tagging check.

| Finding | Suggested Promotion Target |
|---|---|
| **A sibling DECISIONS was cited as authority for the shape it explicitly rejected.** REQ §1.2 claim 2 / C-3 / O-7 asked for "one corpus definition, shared with consolidation"; `DEC-CONS-05` decides the opposite — *one predicate, two enumerations*, with only the predicate held equal by a differential test and each `git ls-files` argv pinned literally. Survived from v8 through several rounds at High | `docs/_decisions/DECISIONS-pdlc-consolidation-agent.md` — add an explicit "this decision does **not** authorise a shared enumeration module" anti-citation note |
| **The reuse channel named in the REQ does not exist at runtime.** The module holding `enumerateCorpus` is not shipped with the engine that runs the pipeline, so "inside the same JS bundle" named a seam that is absent at HEAD. Separately, `defaultListFiles` is non-recursive and filters directories out, so it cannot discover `docs/{p}/` at all | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — a REQ claiming reuse of a sibling mechanism must name the runtime channel on which that mechanism is loadable, not just the source tree it lives in |
| **The shipped enumeration fails *closed*, not fail-open.** `enumerateCorpus` is total — returns `{unlistable: true, detail}` rather than throwing. The REQ asserted a fail-open outcome and sourced it to a decision that says nothing about the unlistable case. Terminology was also inverted (*predicate* vs *enumeration*) against the cited upstream | `docs/_decisions/DECISIONS-pdlc-consolidation-agent.md` — pin the predicate/enumeration vocabulary so downstream REQs cannot invert it |
| **The `_git` never-throws seam contract is false on the runtime channel.** `DEC-LI-02` stated `_git(argv)` "returns `{ok, stdout, stderr}` and never throws on either channel" and `DEC-LI-04` converted that into "check `ok`, not `catch`". True of `defaultGit`; **not** enforced for injected test doubles or the runtime channel, and G-4/C-7 were unconditional on it | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — a seam contract asserted over "either channel" must name the enforcement point on each channel or be weakened to the channel that enforces it |
| **Malformed configuration was not decidable as specified.** BR-14 required a section "present under a name that is not `learningsInjection`" (the `learningsInjectoin` typo) to be distinguished from an absent section — a misspelled *section name* is indistinguishable from absence to every sibling config reader (`parseAdvisoryConfig`, `parseMergeConfig`, `parseImplementationConfig`). AT-32 pinned the divergence | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — extend DC-01: a "malformed" state must be decidable by the reader that is actually shipped, and must match the sibling readers' precedent unless the divergence is itself decided |
| **DC-01's receive-side triple shipped with two of three members.** The REQ stated behaviour for absent and malformed input but not truncated, and AC-5.1 folded three distinct preconditions (`enabled: false`, absent, malformed) into one silent criterion — which violates DC-01's receive side, since silence gives the three states no observable distinction | `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-01) — make the three-member triple a mechanical REQ checklist item rather than prose |
| **DC-09's stopping rule was absent from the REQ** although DC-09 singles it out ("paste the stopping rule") and names `pm-review`/`se-review`/`te-review` of REQ as appliers | `pm-author` / `se-review` skill update — a REQ-authoring checklist row that fails closed on a missing stopping rule |
| **Absence-based oracles pass vacuously without a positive-presence conjunct.** Recurred at least four times: AT-32 (compared against a live enabled sibling with no presence conjunct), AT-22 (false green against a report that cannot reproduce a second dispatch's selection), AT-02/AT-03 (dispatch universe unpinned, so set-equality passes vacuously), and both `.baseline-worktree` obligations stated as PLAN tasks with **no oracle at all** | `docs/_decisions/DECISIONS-test-oracle-mechanics.md` — **`DEC-ORACLE-05` already routed** as a candidate during Phase PR |
| **Absence claims in *specs* need the same falsifier discipline as oracles.** "`package.json` is **not** modified" is a spec-layer absence assertion with no falsifier — no gate reads it, and a verifier checks the exemption rather than the file. Proposal: a spec claiming a file is unmodified must name the commit range over which that holds | `docs/_decisions/DECISIONS-review-severity-bars.md` — **`DEC-SEV-04` already landed** during Phase PR |
| **A guard scoped to one enumerated file where the claim it guards ranges over a glob** (`D-O-8`'s producer-set guard). DC-18's rule is that a guard ranges over a glob precisely because the enumeration is what goes stale | `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-18) — restate as a review-blocking bar, not advisory |
| **Documents carry hand-maintained counts of sets `git` can enumerate, and they go stale.** Third document on this branch to do so (PLAN §File-ownership manifest, §Overview "fourteen new test files", §The arithmetic). Proposal: an engine-side oracle reconciling a manifest against `git ls-tree` for the feature's path globs, failing when a tracked file appears in no row — the directory-closure version already exists as `learningsSuiteMap.test.js` | `docs/_decisions/DECISIONS-test-oracle-mechanics.md` — bundled into **`DEC-ORACLE-05`** |
| **The shipped runnable artifact went stale against reviewed source** — `build-runtime.mjs --check` printed `STALE pdlc/workflows/dist/pdlc-cli.mjs` with `consolidationBuild.test.js` T32 red on the branch as committed. A standing repo hazard, not a feature defect | `pdlc/OPERATIONS.md` / wave-gate config — already covered by `postWaveCommand` + `postWavePathspecs` (DEC-08); this occurrence is evidence the gate is load-bearing and must not be relaxed |
| **Corpus membership for untracked and gitignored LEARNINGS files was left open**, and a sibling DECISIONS explicitly asked this REQ to close it. `--exclude-standard` means a gitignored LEARNINGS file is not corpus — a decision no document owned | `docs/_decisions/DECISIONS-pdlc-consolidation-agent.md` — record the `--exclude-standard` consequence once, for both consumers |

## 3. Rejected Proposals (with rationale)

The reusable ones. Most turn on the **engine's two-module vendoring contract** (`MODULE_NAMES =
["orchestrate-dev.js", "orchestrate-queue.js"]`), which is a hard compatibility constraint and not a
style preference — it will reject the same proposals again for any future pipeline feature.

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Put the feature in a new `pdlc/workflows/learnings-injection.js` | DEC-LI-01 (se-author) | `prepack.mjs` vendors exactly two modules. A third file is present in this repo's test run and **absent in every consumer repository** — green in CI, missing in production, and nothing errors: the injector simply never exists | **Yes — reusable as a standing rule.** Any new `pdlc/workflows/*.js` needed at pipeline runtime is unshippable unless `MODULE_NAMES` is extended in the same change |
| Extend `MODULE_NAMES` to three | DEC-LI-01 | An edit to the engine's **distribution contract**, blast radius = every consumer repo. Paying that for one feature's file layout buys reviewer convenience and risks every consumer's install path | Yes — cost framing reusable verbatim |
| `import { LS_FILES_ARGV } from "./consolidate-learnings.js"` (reuse over restatement) | DEC-LI-03 | The one place where "reuse, don't restate" **loses to a hard constraint**: `consolidate-learnings.js` is not in `MODULE_NAMES`, so the import resolves here and is absent in consumers — a module-load failure of `orchestrate-dev.js` itself, i.e. the pipeline fails to start rather than degrading. A pinning test is the compensating control | **Yes, and it is the highest-signal entry here** — it names the exact condition under which the repo's default reuse posture must be inverted |
| Enumerate the corpus with `_listFiles` | DEC-LI-03 | Measured, not taste: `defaultListFiles` is a single non-recursive `readdirSync` that filters directories out, returns basenames only, and has no gitignore or glob knowledge. Reimplementing the predicate on it yields *a different predicate wearing the same name* — which passes a same-shape test while disagreeing with consolidation about which documents exist | Yes — the "same-shape test, different predicate" failure mode generalises |
| Widen the corpus to consolidation's project-level artefacts (`docs/_constraints/`, `docs/_decisions/`) | DEC-LI-03 | Recorded **because it is the natural next thought** for an agent reading only the code. Those artefacts already reach authoring roles by a different route — the role prompts instruct every author to read them directly | Yes |
| Gate injection on `dispatchKind === "authoring"` alone | DEC-LI-04 | Measured: `reviewLoop` is shared and Phase CR calls it with `docType: null`, which survives to `dispatchAndVerify`. The single-conjunct gate admits Phase CR's optimizer — `se-author` remediating **shipped code** with no target document — which REQ C-1/NG-5 exclude. "Not simpler in effect; wrong" | Yes — `docType: null` from Phase CR is a live trap for any dispatch-site gate |
| Attach at each of the four call sites (or add an `injectLearnings: true` flag per site) | DEC-LI-04 | Restates by hand a membership the pipeline already computes and drifts silently when a fifth site appears — the new site does not inject and **no test fails**, because the oracle is a set equality against the run that happened. *"A rule that cannot notice its own omission is not a rule"* | **Yes — quotable as a general oracle-design bar** |
| Memoise the corpus per run (or persist an index/cache file) | DEC-LI-05 | Two grounds. Behavioural: contradicts per-dispatch observation (FSPEC E-32) — a LEARNINGS file landing mid-run, or an enumeration failing at dispatch 5 after succeeding at dispatch 1, must stay visible. **Evidential: a memo lets the determinism test pass because the second call never happened** — green on a cache rather than on the rule | **Yes** — the vacuous-oracle-via-cache shape recurs; already cited to `DECISIONS-test-oracle-mechanics.md` |
| Treat a malformed section or wrong-typed threshold as a **disable** | DEC-LI-07 | Disablement is an explicit act; turning an advisory feature off over one mistyped number is a silent behaviour change the operator did not ask for, and diverges from both shipped sibling readers for no stated reason | Yes |
| Detect a misspelt section name via a registry of legal top-level keys | DEC-LI-07 | No such registry exists, and one would misfire on every key a later feature adds. A misspelt section is a stray top-level key → absent → default-enabled | Yes — closes the recurring "typo'd config section" design itch |
| A dynamic byte budget, or a cap as a fraction of composed prompt size | DEC-LI-08 | **Authority, not difficulty**: nothing in `orchestrate-dev.js` knows a prompt ceiling, and inventing one means deciding which content yields under pressure — a product decision the REQ has not made. *"A number invented here would be load-bearing, undiscoverable, and wrong in a way no test could catch."* The fractional variant also breaks determinism: selection would depend on unrelated upstream document length | **Yes — the cleanest statement on this branch of a layer-ownership refusal** |
| Refuse to compose when the prompt exceeds a threshold | DEC-LI-08 | Converts an advisory feature into a run-halting one, contradicting fail-open (G-4) | Yes |
| Remove the baseline worktree with `rm -rf` | DEC-LI-11 | Measured: satisfies "the path is gone" while leaving a stale administrative entry under `.git/worktrees/` that reds the next `git worktree add` at the same path. Correct form is `git worktree remove --force` in a `finally` | **Yes — concrete, easily re-encountered** |
| Assert containment rather than set equality over baseline case ids | DEC-LI-11 | Containment lets a *silently deleted* baseline case pass — and a deleted case is precisely how a byte-identity failure gets made to disappear instead of surface | Yes |
| Recompute the merge-base at test time; check out the merge-base over the branch working tree | DEC-LI-11 | The merge-base moves under rebase or merge; checking it out over the working tree destroys the harness the capture needs | Yes |

## 4. Process Learnings

**The highest-signal learning on this branch: harvest-channel deferral is the wrong disposition for a
rule that halts phases.** `POSTMORTEM-T` raised four systemic items (engine restatement retry, skill
mutual-exclusion of the two finding shapes, prompt clause fix, mechanical guard) and deferred all
four to harvest. Two phases later `POSTMORTEM-D` recorded the *identical* failure mode on both
channels at once, and its root cause section is one sentence: *"Nothing was changed after the first
occurrence… A repeat was the expected outcome, not a surprise."* Only after the second halt were the
items escalated out of the harvest channel and landed (`472e505c`, `42289c5e`, `d015ff89`,
`eef6fedb`). **Proposed rule: a POSTMORTEM item whose absence can halt a phase is not harvestable —
it lands before the next round of the phase that halted, or the halt is accepted as recurring.**

**Every phase ran long, and four hit the same ceiling.** REQ 12 rounds; FSPEC, TSPEC, PLAN and
PROPERTIES all **15** — with 55 of 166 rounds non-approving. Four documents stopping at exactly the
same number is a ceiling signature, not four independent convergences, and it means the approvals at
v15 are budget-exhaustion approvals rather than convergence approvals. Worth checking whether the
review-iteration cap is doing bar-lowering work here.

**A schema collision in the review template caused two of the three halts.** The findings table is
`| ID | Severity | Scope | Finding | Section ref |` — **one** scope column where the erratum grammar
has **two orthogonal axes** (provenance `delta`/`inherited`, locality `local`/`nonlocal`). Reviewers
resolved the collision by writing `Local` in the column and the real tags as inline code inside the
finding-text cell — semantically complete, mechanically invisible, and an internal contradiction
visible in the artifact. Fixed during Phase D by splitting the column (`42289c5e`).

**An obligation with no skeleton slot decays.** Under the Authoring Pacing Contract a cross-review is
written section-by-section from a skeleton of `##` headings; the `FINDING:` block had no heading, so
it was the one obligation with nowhere to live. Conformance went 3–5 lines per round at REQ v5–v7 →
**zero on six consecutive rounds**. The fix was to give it a literal `## Delta-Confirmation Findings`
heading immediately above `## Verdict`. Generalisable: *if the pacing contract emits sections, then
every obligation must be a section.*

**A gate that inspects only failing rounds cannot see its own erosion.** The fail-closed rule only
reads non-approving confirmations, so four approving zero-`FINDING:` rounds passed ungated. The
signal was present four times and observable only at the halt. `check-finding-grammar.sh` now lints
**every** round regardless of verdict.

**Reviewers reasoned about the outcome they wanted rather than about the parser's input.** te-review
stated "the rigour bar is any open High, old or new"; the engine filters `severity High && provenance
delta`, so an inherited High is *non-gating*. Both reviewers had done the expensive work of dating
the drift to establish `inherited`, then dropped that conclusion in the one place it was load-bearing
— because `findingGrammarClause()` told them tagging "can only ever widen the outcome, never narrow
it," which is **false for exactly this case**. Prompt leniency language that is true for one branch
and false for another is worse than no leniency language.

**Erratum rounds must re-read the commit, not the raise.** (POSTMORTEM-PR item 11, routed here.) The
role's *Erratum Rounds — Re-ground Upstream First* discipline covers upstream **documents**; Phase PR
showed the same discipline is owed to a **commit**. The v1.2 edit wrote "touched six test-side
surfaces" — `4 + 2` from the routed item's own sentence restated as if it were a measurement — where
`git show --name-status 2fc6fcd3` lists 45 files. **Proposed skill amendment: when an erratum item
names a commit, enumerate that commit's full file list before writing the rows it asks for.** The
`package.json` finding is the proof: it was never in the routed list, so describing the routed list
could not possibly have surfaced it.

**Reviewer scope tags were systematically under-used, and the tag vocabulary collided with a second
vocabulary.** Only 52 findings across 166 documents carried a `Cross-Feature` or `Process` tag, and
several `Local`-tagged findings referenced sibling features or repo-wide mechanisms (the
`DEC-CONS-05` miscitation, the `_git` seam contract, the `MODULE_NAMES` vendoring constraint) — these
were re-routed to §2 under the under-tagging check. Consolidation should treat this branch's §2 as
under-counted, not as an exhaustive census.

**Recurring Low-severity classes that a lint would end outright:**
- **Raw `file:line` anchors** (DEC-DOC-01 anti-pattern) recurred in at least eight rounds across
  TSPEC, PLAN and DECISIONS, and drifted for real: `orchestrate-dev.js` gained +154 lines under
  `472e505c`, moving cited anchors by 40–140 lines. Cite by heading, rule id, symbol or verbatim
  quote — a raw `file:line` is only legitimate when position *is* the measured evidence.
- **Header `Cross-Reviews` rows go stale by construction**, every round, on every document. One
  reviewer's fix is the right one: state the row as a glob (`-v{N}.md`) rather than a brace list.
- **Version-cascade rounds re-derived by hand** — v6, v7, v8 and v9 each spent review budget
  confirming that sibling-document bumps left present-tense claims true. A mechanical sweep of
  present-tense sibling claims at the top of each cascade round would have surfaced four of six edits
  in one round without a reviewer re-deriving each.
- **A review round was dispatched over a zero-byte delta** (TE v8 returned `Needs revision` on
  `386e4f0c`; iteration 9 re-dispatched both reviewers against the same commit with no intervening
  author edit). A delta-confirmation round over an empty diff cannot change any reviewer's mind and
  should be refused by the dispatcher.

**Out-of-scope pipeline behaviour shipped on this branch.** The systemic erratum fixes (restatement
retry, rewritten `findingGrammarClause()`, `check-finding-grammar.sh`, the `## Delta-Confirmation
Findings` slot) carry **no REQ acceptance criterion and no PLAN task row** — the PLAN's table runs
LI-01…LI-23 and covers only the injection region. This was the right call under the recurrence
pressure, but it means the branch ships behaviour that no oracle in the feature's own ladder owns.
The lint in particular shipped as 97 live operator-facing lines with no behavioural test at first
(raised at Medium, closed by `558d0d96`).

**The DoD loop, by contrast, converged cleanly in 2 rounds** — 12 findings in v1, all remediated,
one Low residue (G1: a JSDoc `@param` left behind by the v1 F3 signature change), then PASS at
`67523a26` with 25/25 requirements traced, 0 gaps, 117 suites / 4388 tests, 0 live skips, 88.23%
lowest-module branch coverage. Notably the verifier **checked the whole disclosure family, not the
nearest member** ("G1 is the whole family, not its nearest member") and refused assertion-free or
stub-backed remediation, mutation-verifying fixes by deleting the seam and confirming the oracle
reds. That is the pattern to keep.

## 5. Open Items for Consolidation

The handed open-promotion list was empty (*no open promotions are recorded*), so **no item below
carries a `failure-mode-id:` line**. Each was checked against that empty list and matched nothing.

1. **A POSTMORTEM item whose absence can halt a phase must not be harvest-deferred.** Promote as a
   standing rule: such items land before the next round of the phase that halted. Evidence is the
   T→D recurrence, where deferral of four items produced the identical halt two phases later on both
   channels. Target: `docs/_decisions/DECISIONS-review-severity-bars.md` or the `orchestrate-dev`
   halt-recovery contract.
2. **Erratum rounds must enumerate a named commit's full file list before writing rows about it.**
   Routed here explicitly by `POSTMORTEM-PR` recommendation 11. Target: `se-author` / `pm-author` /
   review-skill *Erratum Rounds — Re-ground Upstream First* section, extended from documents to
   commits.
3. **Manifest-completeness oracle** reconciling a document's file-ownership manifest against
   `git ls-tree` for the feature's path globs. Third document on this branch to carry a stale count
   of a set `git` can enumerate. Already routed as candidate `DEC-ORACLE-05` in
   `docs/_decisions/DECISIONS-test-oracle-mechanics.md`; consolidation should confirm or reject it.
4. **`DEC-SEV-04`** (a spec claiming a file is unmodified must name the commit range over which that
   holds) landed in `docs/_decisions/DECISIONS-review-severity-bars.md` during Phase PR. Flagged for
   consolidation to confirm the wording survives review, not to re-promote.
5. **The two-module vendoring constraint deserves project-level status.** `MODULE_NAMES =
   ["orchestrate-dev.js", "orchestrate-queue.js"]` silently rejected three separate design proposals
   on this feature (DEC-LI-01 twice, DEC-LI-03 once), and its failure mode is the worst kind: green
   in CI, absent in every consumer repository, nothing errors. Target:
   `docs/_constraints/DOMAIN-CONSTRAINTS.md` as a hard constraint with the CI-green/production-absent
   failure mode named.
6. **"A rule that cannot notice its own omission is not a rule"** (DEC-LI-04) and **"a memo lets the
   determinism test pass because the second call never happened"** (DEC-LI-05) are two statements of
   one bar: a set-equality oracle against *the run that happened* cannot detect a missing producer.
   Target: `docs/_decisions/DECISIONS-test-oracle-mechanics.md`.
7. **Prompt leniency language must be branch-exact.** `findingGrammarClause()`'s "tagging can only
   ever widen the outcome" was true for approving confirmations and false — inverted, halting —
   for non-approving ones. Corrected on this branch (`d015ff89`); promote the general rule that a
   leniency claim in a dispatch prompt must state the branch on which it does not hold. Target:
   skill-authoring guidance.
8. **Review-template schema collisions.** One `Scope` column served two orthogonal axes and caused
   two halts. Promote: when a gate parses a vocabulary, the authoring template must have exactly one
   column per axis of that vocabulary. Fixed for erratum rounds (`42289c5e`); the general rule is not
   recorded anywhere.
9. **Reconsider the review-iteration ceiling.** Four documents stopped at exactly 15 rounds. Either
   the cap is doing bar-lowering work or the convergence bar is mis-set; consolidation should look at
   this across features rather than from this branch alone. Target: `pdlc/OPERATIONS.md` review-loop
   economics.
10. **Cheap mechanical lints not yet built**, each ending a Low class that recurred all branch:
    a stale-`Cross-Reviews`-header check (state the row as a glob), a `DEC-DOC-01` raw-`file:line`
    citation lint, a present-tense sibling-claim sweep at the top of each cascade round, and a
    dispatcher refusal of delta-confirmation rounds over a zero-byte diff. Target: `pdlc/hooks/` —
    `check-finding-grammar.sh` is the working precedent.
11. **Out-of-scope pipeline behaviour shipped without ladder ownership.** The systemic erratum fixes
    have no REQ AC and no PLAN task row. Consolidation should decide whether such recurrence-driven
    fixes get a standing exemption with a named oracle requirement, or must be split to their own
    REQ. Target: `pdlc/OPERATIONS.md`.

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round, copied verbatim out of the
`CROSS-REVIEW-*` files before deletion. **No hash was recomputed at harvest time.** 111 approving
rounds of 166 total; 17 of them carry no `APPROVAL-HASH:`/`REVIEWED-COMMIT:` anchor line and are
recorded as `unavailable` rather than invented. Some `Reviewed Commit` values are abbreviated in the
source file and are reproduced as written.

`REVIEW` is the Phase CR codebase-review document type, outside the six pipeline document types; its
one approving round is retained here rather than dropped, ordered last.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 2 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 4 | software-engineer | Approved with minor changes | sha256:0110298fd9f864a67213a3aa816da70c6295de63d93e68915dfed89ab832cedb | 218debf3cc6541c320242c11c1d8f6433a324084 |
| REQ | 4 | test-engineer | Approved with minor changes | sha256:0110298fd9f864a67213a3aa816da70c6295de63d93e68915dfed89ab832cedb | 218debf3cc6541c320242c11c1d8f6433a324084 |
| REQ | 6 | software-engineer | Approved with minor changes | sha256:c13aab67f31e8c42df9b9809d2c3f571148be02407a8658a915ab375a693dfae | bc603aa0cec3516c0d9af6ac417a8d914db879a7 |
| REQ | 6 | test-engineer | Approved with minor changes | sha256:c13aab67f31e8c42df9b9809d2c3f571148be02407a8658a915ab375a693dfae | bc603aa0cec3516c0d9af6ac417a8d914db879a7 |
| REQ | 7 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 8 | software-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 9 | software-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 10 | software-engineer | Approved with minor changes | sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd | a2353445280c5f08b8938da272ba4e42ec9becb9 |
| REQ | 10 | test-engineer | Approved with minor changes | sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd | a2353445280c5f08b8938da272ba4e42ec9becb9 |
| REQ | 11 | software-engineer | Approved with minor changes | sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd | 4db24c50d51de6389173b9c14d0b59cd7f1079ed |
| REQ | 11 | test-engineer | Approved with minor changes | sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd | 4db24c50d51de6389173b9c14d0b59cd7f1079ed |
| REQ | 12 | software-engineer | Approved with minor changes | sha256:32cb8b7d4f4072d18772c7efeeb846460083dfea1959cd1159ac625a057fafeb | bbc88069907c434100e45a8e26885856fee3e530 |
| REQ | 12 | test-engineer | Approved with minor changes | sha256:32cb8b7d4f4072d18772c7efeeb846460083dfea1959cd1159ac625a057fafeb | bbc88069907c434100e45a8e26885856fee3e530 |
| FSPEC | 4 | software-engineer | Approved with minor changes | sha256:0ae549da7d496c284d4d64301aa71c9c6837564ff502414ec4f9ed577301d687 | f005e6ed64688904c5f747c989cfb5d1696f0569 |
| FSPEC | 4 | test-engineer | Approved with minor changes | sha256:0ae549da7d496c284d4d64301aa71c9c6837564ff502414ec4f9ed577301d687 | f005e6ed64688904c5f747c989cfb5d1696f0569 |
| FSPEC | 6 | software-engineer | Approved | sha256:d3d26d542296ce1234edae4377477fbbd8fc3935598beff1804ac590b1843859 | 67740c936bf8307a943eaafa0d3b1fb6e4761b6c |
| FSPEC | 6 | test-engineer | Approved | sha256:d3d26d542296ce1234edae4377477fbbd8fc3935598beff1804ac590b1843859 | 67740c936bf8307a943eaafa0d3b1fb6e4761b6c |
| FSPEC | 7 | test-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 8 | software-engineer | Approved with minor changes | sha256:57b71e0c5687067aa34ec4c4afc0c2ce58ff3dce61b1813f21b42cca5f048fcf | a85ced73e5ff5708359a9b82a91b7cb56a64e79a |
| FSPEC | 8 | test-engineer | Approved | sha256:57b71e0c5687067aa34ec4c4afc0c2ce58ff3dce61b1813f21b42cca5f048fcf | a85ced73e5ff5708359a9b82a91b7cb56a64e79a |
| FSPEC | 10 | software-engineer | Approved | sha256:256537d8208acce044d199dbd66f35b4888140d6253a1f09e9b91dc82b7c4b18 | cbb0a63e21ddc64b59a95dc227f4d940934d47a1 |
| FSPEC | 10 | test-engineer | Approved | sha256:256537d8208acce044d199dbd66f35b4888140d6253a1f09e9b91dc82b7c4b18 | cbb0a63e21ddc64b59a95dc227f4d940934d47a1 |
| FSPEC | 11 | software-engineer | Approved with minor changes | sha256:764414d0d049480ae616dd04fdc5fc44a70f268674d704766d0b191189c492e0 | cb220f5af3e206ae6403939cb48a9ace4eb0132b |
| FSPEC | 11 | test-engineer | Approved | sha256:764414d0d049480ae616dd04fdc5fc44a70f268674d704766d0b191189c492e0 | cb220f5af3e206ae6403939cb48a9ace4eb0132b |
| FSPEC | 12 | software-engineer | Approved with minor changes | sha256:a4f775bd64c167994ba62897ffe6c78efd82d017369bdf632c0f49b858dfa9a5 | 9a4b75939a3ef97c2312f3014a8bd93d5e8c7fbf |
| FSPEC | 12 | test-engineer | Approved | sha256:a4f775bd64c167994ba62897ffe6c78efd82d017369bdf632c0f49b858dfa9a5 | 9a4b75939a3ef97c2312f3014a8bd93d5e8c7fbf |
| FSPEC | 13 | test-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 14 | software-engineer | Approved with minor changes | sha256:fb18dbda1cef8497143e931894d09b83871657b9c8108305948cc03566b0727c | c1d7218ecc9f23413134c665b22d07219deceb33 |
| FSPEC | 14 | test-engineer | Approved with minor changes | sha256:fb18dbda1cef8497143e931894d09b83871657b9c8108305948cc03566b0727c | c1d7218ecc9f23413134c665b22d07219deceb33 |
| FSPEC | 15 | software-engineer | Approved with minor changes | sha256:ae75fa6291f1a060153f65b6b1bcc3959acd62b2c0872e7b319489c964a86a1d | cfb3d4d61cc4352a1ca1cfd89c8fb3850b92b614 |
| FSPEC | 15 | test-engineer | Approved with minor changes | sha256:ae75fa6291f1a060153f65b6b1bcc3959acd62b2c0872e7b319489c964a86a1d | cfb3d4d61cc4352a1ca1cfd89c8fb3850b92b614 |
| TSPEC | 3 | test-engineer | Approved with minor changes | sha256:4e6888742a5e9eae366bdb8c6fa5b22af9ee632815fd296c441782ee6393741b | 0dc246416459269b7686d4a8e675479829caa331 |
| TSPEC | 4 | test-engineer | Approved with minor changes | unavailable | unavailable |
| TSPEC | 5 | test-engineer | Approved with minor changes | sha256:72712bd87b4f5d762be9049cfe680fa0c378d83a0002690097a129e3efb79fdb | 16f308209781bec914dca9f6b7a58cc042f0c44b |
| TSPEC | 7 | test-engineer | Approved with minor changes | sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3 | ccc739d1bb1edaca2e650864bed3422f5c587e14 |
| TSPEC | 8 | test-engineer | Approved with minor changes | sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3 | 7a1d132ad707535a643cf35b34054ff375824746 |
| TSPEC | 9 | test-engineer | Approved with minor changes | sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3 | 15d8f46e |
| TSPEC | 10 | test-engineer | Approved with minor changes | sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3 | 0f7d75927d84acd7eb6a80d5d89132b6c9f53cae |
| TSPEC | 11 | test-engineer | Approved with minor changes | sha256:f629d29d23386297f5e3ec490530f7ed6b697ec63c56acf6711d7fee14a530d5 | bfe58851239e83a3e2091667e5c59b0f8d84d610 |
| TSPEC | 14 | test-engineer | Approved with minor changes | sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131 | 739fea34dc578e37710ac7c274896ff705ad99ea |
| TSPEC | 15 | test-engineer | Approved with minor changes | sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131 | 0214c54fc68fb2b194ecd5c6bdb3b4802d4bf6eb |
| PLAN | 2 | test-engineer | Approved with minor changes | unavailable | unavailable |
| PLAN | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
| PLAN | 4 | test-engineer | Approved with minor changes | sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508 | f08bfbf8addce91a7d5342e016b2e7ba63b694cf |
| PLAN | 5 | test-engineer | Approved with minor changes | sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508 | 1f8a90be5ea972e76a35279eec8eb8da877d20c2 |
| PLAN | 6 | test-engineer | Approved with minor changes | sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508 | c374c449074ccc059189ad9995e80b21e3fd54de |
| PLAN | 8 | test-engineer | Approved with minor changes | sha256:4510f9c3f12b8c7b75ef5b2b9b20304e09879aa90542c51aae42c0b1e10c2d09 | 7bcbce64dc9bbd18c9f5cc66f668c39bdf2de938 |
| PLAN | 9 | test-engineer | Approved with minor changes | sha256:d028d972450c5da27bba6362db9e77b0125441d1b7d7f835d1caae968feafe09 | 6a2d3007ca7b4b0399c6f221f023f39c52fac824 |
| PLAN | 10 | test-engineer | Approved with minor changes | sha256:b9fbd3eacb1bf4224a2c86ef4897eabf5cd2da29ef2d4582070a6e89cbc1789e | f73046ad595cc36b921c967a72c227285d2712e7 |
| PLAN | 11 | test-engineer | Approved with minor changes | sha256:281c60c0fc5494b4e489fa01d49e9c28a757b80b5def7704ef4e77fe2af0d915 | be64a0c68f496ae9d830a646dd5e596e5697f078 |
| PLAN | 12 | test-engineer | Approved with minor changes | sha256:eaddd3928e3c68853624fb78d2fc43ac900c14a3636e4fba96035d57e793011f | ba1202704cc5da81416df7efe1580a172ab4e467 |
| PLAN | 13 | test-engineer | Approved with minor changes | sha256:cd9fda263ccc0bb06e1d6e1ca2a070608d97ccfe9e8fa41b5b952f5066a45fbc | aa5f0378db85713e65ecaae8beda97154879c73d |
| PLAN | 15 | test-engineer | Approved with minor changes | sha256:d6a0b45c5c1753b91752d4fe60a42a700ef441f532a26d9a4535e88c1857673a | 6792fa5fac5cc0b26ce6c388e1b18bf2fd87456e |
| PROPERTIES | 2 | software-engineer | Approved with minor changes | sha256:fe50242a965b21b7e8d5c9482c22c1baa43aa159f41eca3447000fbc95baa9c8 | f10dbd43e6eded4f6ecbb7f9b7ae8bc2b7a53e89 |
| PROPERTIES | 5 | software-engineer | Approved with minor changes | sha256:6d74d3eb5a231da2987b013954367f8b2064b6604a1ea679173a83529fd383b6 | 48fd5ba5c34aa2c89804172edc23f54c4eeffcb2 |
| PROPERTIES | 6 | software-engineer | Approved with minor changes | sha256:6d74d3eb5a231da2987b013954367f8b2064b6604a1ea679173a83529fd383b6 | 5fceba19fe280ee53cc83175e7a82aff7fa3c6b9 |
| PROPERTIES | 8 | software-engineer | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 9 | software-engineer | Approved with minor changes | sha256:3e9fdf8b3e8160b65e2621df4965a4b79a6f74b268cae2a25287ae727c482366 | 23adb5e580f01f8e5576de809435fef45edd96f2 |
| PROPERTIES | 11 | software-engineer | Approved | sha256:e9de08bcefa8e343ce2895301ce0fb39b6e1115eccdbd5e7acaa9875fe842489 | a469ef4b1e42f33f12ddcee6363636336dd123d1 |
| PROPERTIES | 12 | software-engineer | Approved with minor changes | sha256:e9de08bcefa8e343ce2895301ce0fb39b6e1115eccdbd5e7acaa9875fe842489 | 72771ffa100c88741e3c76fcd23c40733d534fef |
| PROPERTIES | 13 | software-engineer | Approved with minor changes | sha256:29f4b6c4ee0e1d2bd3a49607bca9419020f53e2bdb0420ccd9fc9ff78d7afe8f | c575cdc301e210f75b6512bea0f005668c355385 |
| PROPERTIES | 14 | software-engineer | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 15 | software-engineer | Approved with minor changes | sha256:5eb02c76c4fab5c73919541db30a4ee9e01d6f44e135384473980f830d394aef | 9e9a79e5cb81b35d552c1fd560db0aecaec24f26 |
| DECISIONS | 2 | test-engineer | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | d140fbeee5ae114d1b305ec84c4ac9745c98f9b3 |
| DECISIONS | 3 | test-engineer | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | 42515b3e428cb73faea56cd452d38ce46a9bffed |
| DECISIONS | 4 | test-engineer | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | 82bd5869a765350f65436e7ea35005bc2c2ff48c |
| DECISIONS | 5 | test-engineer | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | 82bd5869a765350f65436e7ea35005bc2c2ff48c |
| DECISIONS | 6 | test-engineer | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | 8f3db3d8e89dafe9dab1c3b468ce0ed9bb48c631 |
| DECISIONS | 7 | test-engineer | Approved with minor changes | sha256:56617f5ab31a8158a33b702ec4a21e8cf1f167b9ef1d78c8e2793976a645bd32 | e29a296eddd84d907270d0d868d9e00c3c8b9460 |
| DECISIONS | 9 | test-engineer | Approved with minor changes | sha256:87ec8ebca294ebbdd45eb0fdebe939740fc968c8b91dcaf964dbc87ca299b193 | 9baf60b5c6344eb59c66b5b83523420358ce121b |
| REVIEW | 2 | test-engineer | Approved with minor changes | unavailable | unavailable |
| -DECISIONS | 1 | product-manager | Approved with minor changes | unavailable | unavailable |
| -DECISIONS | 2 | product-manager | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | d140fbeee5ae114d1b305ec84c4ac9745c98f9b3 |
| -PROPERTIES | 2 | product-manager | Approved with minor changes | sha256:fe50242a965b21b7e8d5c9482c22c1baa43aa159f41eca3447000fbc95baa9c8 | f10dbd43e6eded4f6ecbb7f9b7ae8bc2b7a53e89 |
| -REVIEW | 2 | product-manager | Approved with minor changes | unavailable | unavailable |
| -DECISIONS | 3 | product-manager | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | 42515b3e428cb73faea56cd452d38ce46a9bffed |
| -PROPERTIES | 3 | product-manager | Approved with minor changes | unavailable | unavailable |
| -TSPEC | 3 | product-manager | Approved with minor changes | sha256:4e6888742a5e9eae366bdb8c6fa5b22af9ee632815fd296c441782ee6393741b | 0dc246416459269b7686d4a8e675479829caa331 |
| -DECISIONS | 4 | product-manager | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | 82bd5869a765350f65436e7ea35005bc2c2ff48c |
| -PLAN | 4 | product-manager | Approved with minor changes | sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508 | f08bfbf8addce91a7d5342e016b2e7ba63b694cf |
| -DECISIONS | 5 | product-manager | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | 40dffb861f9c2b5144c63e7ae203fb5dcf8a835d |
| -PLAN | 5 | product-manager | Approved with minor changes | sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508 | 1f8a90be5ea972e76a35279eec8eb8da877d20c2 |
| -PROPERTIES | 5 | product-manager | Approved with minor changes | sha256:6d74d3eb5a231da2987b013954367f8b2064b6604a1ea679173a83529fd383b6 | 48fd5ba5c34aa2c89804172edc23f54c4eeffcb2 |
| -TSPEC | 5 | product-manager | Approved with minor changes | sha256:72712bd87b4f5d762be9049cfe680fa0c378d83a0002690097a129e3efb79fdb | 16f308209781bec914dca9f6b7a58cc042f0c44b |
| -DECISIONS | 6 | product-manager | Approved with minor changes | sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6 | 8f3db3d8e89dafe9dab1c3b468ce0ed9bb48c631 |
| -PLAN | 6 | product-manager | Approved with minor changes | sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508 | c374c449074ccc059189ad9995e80b21e3fd54de |
| -PROPERTIES | 6 | product-manager | Approved with minor changes | sha256:6d74d3eb5a231da2987b013954367f8b2064b6604a1ea679173a83529fd383b6 | 5fceba19fe280ee53cc83175e7a82aff7fa3c6b9 |
| -DECISIONS | 7 | product-manager | Approved with minor changes | sha256:56617f5ab31a8158a33b702ec4a21e8cf1f167b9ef1d78c8e2793976a645bd32 | e29a296eddd84d907270d0d868d9e00c3c8b9460 |
| -TSPEC | 7 | product-manager | Approved with minor changes | sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3 | ccc739d1bb1edaca2e650864bed3422f5c587e14 |
| -PLAN | 8 | product-manager | Approved with minor changes | sha256:4510f9c3f12b8c7b75ef5b2b9b20304e09879aa90542c51aae42c0b1e10c2d09 | 7bcbce64dc9bbd18c9f5cc66f668c39bdf2de938 |
| -TSPEC | 8 | product-manager | Approved with minor changes | sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3 | 7a1d132ad707535a643cf35b34054ff375824746 |
| -DECISIONS | 9 | product-manager | Approved with minor changes | sha256:87ec8ebca294ebbdd45eb0fdebe939740fc968c8b91dcaf964dbc87ca299b193 | 9baf60b5c6344eb59c66b5b83523420358ce121b |
| -PLAN | 9 | product-manager | Approved with minor changes | sha256:d028d972450c5da27bba6362db9e77b0125441d1b7d7f835d1caae968feafe09 | 6a2d3007ca7b4b0399c6f221f023f39c52fac824 |
| -PROPERTIES | 9 | product-manager | Approved with minor changes | sha256:3e9fdf8b3e8160b65e2621df4965a4b79a6f74b268cae2a25287ae727c482366 | 23adb5e580f01f8e5576de809435fef45edd96f2 |
| -TSPEC | 9 | product-manager | Approved with minor changes | sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3 | 260f34bc4f4630cbe78b587730e2c6a3fe912b9d |
| -PLAN | 10 | product-manager | Approved with minor changes | sha256:b9fbd3eacb1bf4224a2c86ef4897eabf5cd2da29ef2d4582070a6e89cbc1789e | f73046ad595cc36b921c967a72c227285d2712e7 |
| -TSPEC | 10 | product-manager | Approved with minor changes | sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3 | 0f7d75927d84acd7eb6a80d5d89132b6c9f53cae |
| -PLAN | 11 | product-manager | Approved with minor changes | sha256:281c60c0fc5494b4e489fa01d49e9c28a757b80b5def7704ef4e77fe2af0d915 | be64a0c68f496ae9d830a646dd5e596e5697f078 |
| -PROPERTIES | 11 | product-manager | Approved with minor changes | sha256:e9de08bcefa8e343ce2895301ce0fb39b6e1115eccdbd5e7acaa9875fe842489 | a469ef4b1e42f33f12ddcee6363636336dd123d1 |
| -TSPEC | 11 | product-manager | Approved with minor changes | sha256:f629d29d23386297f5e3ec490530f7ed6b697ec63c56acf6711d7fee14a530d5 | bfe58851239e83a3e2091667e5c59b0f8d84d610 |
| -PLAN | 12 | product-manager | Approved with minor changes | sha256:eaddd3928e3c68853624fb78d2fc43ac900c14a3636e4fba96035d57e793011f | ba1202704cc5da81416df7efe1580a172ab4e467 |
| -PROPERTIES | 12 | product-manager | Approved with minor changes | sha256:e9de08bcefa8e343ce2895301ce0fb39b6e1115eccdbd5e7acaa9875fe842489 | 72771ffa100c88741e3c76fcd23c40733d534fef |
| -PLAN | 13 | product-manager | Approved with minor changes | sha256:cd9fda263ccc0bb06e1d6e1ca2a070608d97ccfe9e8fa41b5b952f5066a45fbc | aa5f0378db85713e65ecaae8beda97154879c73d |
| -PROPERTIES | 13 | product-manager | Approved with minor changes | sha256:29f4b6c4ee0e1d2bd3a49607bca9419020f53e2bdb0420ccd9fc9ff78d7afe8f | c575cdc301e210f75b6512bea0f005668c355385 |
| -TSPEC | 13 | product-manager | Approved | unavailable | unavailable |
| -TSPEC | 14 | product-manager | Approved with minor changes | sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131 | 739fea34dc578e37710ac7c274896ff705ad99ea |
| -PLAN | 15 | product-manager | Approved with minor changes | sha256:d6a0b45c5c1753b91752d4fe60a42a700ef441f532a26d9a4535e88c1857673a | 6792fa5fac5cc0b26ce6c388e1b18bf2fd87456e |
| -PROPERTIES | 15 | product-manager | Approved | sha256:5eb02c76c4fab5c73919541db30a4ee9e01d6f44e135384473980f830d394aef | 9e9a79e5cb81b35d552c1fd560db0aecaec24f26 |
| -TSPEC | 15 | product-manager | Approved with minor changes | sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131 | 0214c54fc68fb2b194ecd5c6bdb3b4802d4bf6eb |
