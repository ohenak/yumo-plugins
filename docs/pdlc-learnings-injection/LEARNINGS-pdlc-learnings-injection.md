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

## 4. Process Learnings

## 5. Open Items for Consolidation

## 6. Approval Record
