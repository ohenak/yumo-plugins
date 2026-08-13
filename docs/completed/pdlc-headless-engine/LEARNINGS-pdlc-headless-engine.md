# LEARNINGS — pdlc-headless-engine

| Field | Detail |
|---|---|
| Feature | pdlc-headless-engine |
| REQ | docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md |
| Date Completed | 2026-08-12 |
| Total Iterations | REQ: 8, FSPEC: 8, TSPEC: 12 (two windows: 1–5, then 6–12), PLAN: 7, PROPERTIES: 2, DECISIONS: 5, IMPL: 1 halted wave-3 run + 1 completing run |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | `CROSS-REVIEW-software-engineer-REQ-v{1..8}.md`, `CROSS-REVIEW-test-engineer-REQ-v{1..8}.md`, `CROSS-REVIEW-software-engineer-FSPEC-v{1..8}.md`, `CROSS-REVIEW-test-engineer-FSPEC-v{1..8}.md`, `CROSS-REVIEW-product-manager-TSPEC-v{1..12}.md`, `CROSS-REVIEW-test-engineer-TSPEC-v{1..12}.md`, `CROSS-REVIEW-product-manager-PLAN-v{1..7}.md`, `CROSS-REVIEW-test-engineer-PLAN-v{1..7}.md`, `CROSS-REVIEW-product-manager-PROPERTIES-v{1,2}.md`, `CROSS-REVIEW-software-engineer-PROPERTIES-v{1,2}.md`, `CROSS-REVIEW-product-manager-DECISIONS-v{1..5}.md`, `CROSS-REVIEW-test-engineer-DECISIONS-v{1..5}.md` (84 cross-reviews, now deleted); `CODE_REVIEW-pdlc-headless-engine-v1.md`, `CODE_REVIEW-pdlc-headless-engine-v2.md` (now deleted); `POSTMORTEM-F-pdlc-headless-engine.md`, `POSTMORTEM-T-pdlc-headless-engine.md`, `POSTMORTEM-D-pdlc-headless-engine.md`, `POSTMORTEM-I-pdlc-headless-engine.md` (read, retained — all four carry `RESOLVED: yes`) |
| DoD rounds | 2 (`CODE_REVIEW-…-v1`, `CODE_REVIEW-…-v2`) |

## 1. Non-Convergences

Four phases halted. Only one was ordinary round-budget exhaustion; three were the **erratum protocol's
one-round bound** meeting a factual defect that needed two.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| T (first halt) | product-manager + test-engineer | Genuine `MAX_REVIEW_ROUNDS = 5` exhaustion. One executable oracle — TSPEC §7.4 row 4, the model-map/AC-3.3 discriminator — was re-specified every round and never landed a recorded field. TSPEC v1.5 was authored *after* round-5 reviews landed and so was never read by the loop that rejected it. | Operator verified PM `F-01`/`F-02`/`F-03` against HEAD, flipped `RESOLVED: yes`, re-invoked. Round 6 converged on v1.5 unchanged — the halt was a reading-window artefact, not a document defect. | 5 |
| T (second halt) | software-engineer + test-engineer | `ERRATUM-PROTOCOL`: the FSPEC delta-confirmation was non-approving from **both** reviewers, same defect, same site, same one-clause fix (`F-24`/`F-01`). The routed erratum named §6.3's line range; the same BR-MODEL-3 claim ("model map exercised over the live surface") also lived in §6.3's preamble, which the site-scoped edit did not touch. The erratum was resolved *and* the false claim survived. | One clause struck/requalified in FSPEC §6.3's preamble; erratum confirmed on the *claim*, not the line range; Phase T re-run. | 1 erratum round (E1), on top of the 6–12 window |
| F | software-engineer (te-review approved) | `ERRATUM-PROTOCOL`: eleven errata routed to the REQ in one round; ten confirmed, `F-25` blocked. `M-ENG-06`'s new AC-4.4 row asserted a red state (`auth-failure` member absent, stop-without-retry unasserted) that the reviewer re-derived from HEAD as **partially green** — member defined, thrown, excluded from retry, and already asserted. The dispute was between a document and the code, not between two roles. | Three cells and one word in `docs/_constraints/pdlc-engine-baseline.md` + REQ §1.2a, evidence-backed; `RESOLVED: yes`; Phase F re-run. | 2 FSPEC rounds + 1 erratum round (E1) |
| D | software-engineer (te-review approved) | `ERRATUM-PROTOCOL`: DECISIONS v1.2 converged, then the REQ erratum's delta confirmation was reported non-approving for `[se-review]` — **but both confirmation files on disk say `Approved with minor changes` `{0,1,1}`**. The gate read the response trailer, not the committed file, and failed closed on an absent/unparseable trailer. A queued FSPEC erratum was silently dropped when the halt fired mid-`routeErrata`. | Operator verified both confirmation files, flipped `RESOLVED: yes`, re-invoked. No document change was needed — the halt was a gate defect. | 2 DECISIONS rounds + 1 erratum round (E1) |
| I | (script gate, no reviewer) | Wave 3 of 17 failed the wave test gate: 14 failures. **RC-1** — the CI-arrangement task edited `.claude/pdlc.config.json`'s `implementation.testCommand` mid-implementation, appending `&& cd pdlc/engine && npm test`; the pre-existing §2.4 pin test parses `--testPathIgnorePatterns … $` to end-of-line, so the appended shell tokens leaked into the asserted set. Latently worse: chaining the deliberately-red engine suite into the gate would have failed **every subsequent wave by design**. **RC-2** — a red TDD test (`dispatchableSkills.test.js`) landed in the *gated* `pdlc/workflows` suite with its green scheduled for a later wave (13 of 14 failures). Because the gate runs before per-task commits, all Wave 3 work bar one commit was left uncommitted. | RC-1 reverted (untracked consumer state); RC-2 fixed by implementing `DISPATCHABLE_SKILLS` in both workflow modules to the test's exact contract (`c3b68b5a`). Re-verified: 83 suites, 3485 passed, 0 failed; `build-runtime.mjs --check` in sync. `POSTMORTEM-I` written after the fact by the operator — **the engine wrote neither the POSTMORTEM nor the `halted` queue row**. | 1 halt, 3 root-cause repairs |

## 2. Cross-Feature Patterns

Findings whose blast radius leaves this feature. The dominant shape: **a repo-wide gate or measured fact
edited from inside one feature's window.**

| Finding | Suggested Promotion Target |
|---|---|
| `implementation.testCommand` in `.claude/pdlc.config.json` is **repo-wide state edited by a per-feature task**. PLAN v6/v7 `F-01`/`F-02` caught the literal dropping `'documentOracles'` from a set claimed "preserved verbatim" — re-enabling CWD- and untracked-file-sensitive oracles inside *every other feature's* wave gate. The same file then caused the Phase-I halt (RC-1) when the flip landed mid-implementation. Three separate halts/blocking findings trace to one config key. | `docs/_decisions/DECISIONS-wave-gate-config.md` — a `testCommand` edit must be the terminal act of a phase, must keep `--testPathIgnorePatterns` arguments line-terminal (engine segment first), and must be reviewed against HEAD's value token-for-token, never transcribed. |
| A PLAN/TSPEC may pin a CI arrangement that **does not exist at HEAD**. `F-14` (High): the two-platform remediation was built on `os: [ubuntu-latest, macos-latest]` while `.github/workflows/pr-tests.yml:40` carried a single entry. Same class as `F-05` mis-transcribing the CI `script-syntax` job. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — any spec citing a CI job, matrix, or command must quote the file:line at HEAD, and the reviewer must re-derive rather than accept the quote. |
| **Set-equality harnesses that pass vacuously.** `F-03` (High) found three of them (TSPEC §3.5, §5.1, §7.4) that could not work under the runner §7 names — one would fail *green*. DoD `F-05` found `_assert-suite-wide.mjs` self-describing an implementation that did not exist. The fix pattern that finally worked: enumerate rows in a named constant, assert enumeration ↔ implementation **in both directions**, and carry an explicit falsifier (vacuous-empty guard, eighth-row guard, deleted-row guard). | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — "a set-equality oracle must carry a vacuity falsifier and be asserted in both directions" as a project-level testing constraint. |
| **A green test that pins nothing.** `F-04` (High): guard-parity tests AT-ENG-41/42/43 were not pinned to the permission posture real dispatches carry, so they could stay green without anything having run. Mirrored at DoD by `F-17`: two comments delegate PROP-MODEL-9 to an owner file that never carries it, and production behaviour is correct but untested. | Skill update — `te-review` / `dod-verify`: "does this test constrain the artifact operators see, or only the shape of a stand-in?" |
| **Relocated measured facts sit outside every review lane.** `docs/_constraints/pdlc-engine-baseline.md` is not a pipeline artifact: no docType, no round window, no cross-review file, and **not a member of `ERRATUM_DOC_TYPES`**. `M-ENG-06`/`M-ENG-07`/`M-ENG-08` were approved as *citations* for six rounds and audited for the first time in the erratum round — which is exactly where Phase F halted. Two of eleven errata were themselves defects in relocated content. | `docs/_decisions/DECISIONS-review-severity-bars.md` (or new) — relocated measured facts need either a review lane or an explicit rule that relocation requires re-derivation in the same round. |
| **`M-ENG-09` is a capability the pipeline cannot measure for itself.** `F-09` (Medium) predicted it; DoD `F-01` (High) is it: the baseline carries one row (`darwin`), `engine-tests` is pinned to `ubuntu-latest`, and the gate is correctly red there. No agent may synthesise the row. This is the only remaining ship-blocker, and it is **operator-gated by design**, not a remediation failure. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — a class of "operator-gated acceptance criteria" that DoD reports as open-by-design rather than as an unremediated finding. |
| **A PLAN's ownership manifest that does not parse silently downgrades Phase I to worktrees.** `F-02` (Medium, PLAN v6): `parsePlanOwnership` returned `null` over the document, so the same-tree wave path §5's gates assume would never have run. Caught only because a reviewer ran the shipped parser over the document. | Skill update — `se-review`: reviewing a PLAN means *running the shipped parser over it*, not reading the table. |
| **`ERRATUM_DOC_TYPES` excludes documents the protocol needs.** Phase D's `F-25`-equivalent had no upstream lane because the defect lived in a constraints file; the reviewer correctly declined to emit an erratum and had to fail the REQ instead. Also DEC-ENG-03's rung-5 pin cited an authority the FSPEC EC-row placement did not support. | `docs/_decisions/DECISIONS-erratum-protocol.md` — extend routing, or define an explicit "no lane" disposition so it stops surfacing as a non-approving verdict on an innocent document. |
| **`M-ENG-08`'s closing sentence contradicted the section it summarised** (`F-05`, Medium) and `M-ENG-07`'s literal expectation set lives in a document the loop declares out of scope for itself (`F-22`). Measured-fact files accrete summary prose that no oracle checks. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — measured-fact rows are the contract; prose summaries in the same file must be derivable from the rows or deleted. |

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Make the transport runtime-selectable (SDK ⇄ `claude -p`), or fail over between them | se-author, DEC-ENG-01 / DEC-ENG-02 | The SDK is the primary transport and `claude -p` is a built fallback, but **an SDK failure is a failure**, not a signal to try another path. Failover would make the auth/guard posture non-deterministic and turn one red into two silent retries. | Yes — the "one transport, no failover" rule generalises to any capability where a second path has a different security posture. |
| Re-implement the guard hook inside the engine (or ship a second guard definition) | se-author, DEC-ENG-03 | The shipped `.sh` hook script stays the guard's **only** definition; transports invoke it. A fail-open interpreter probe at startup is accepted with its consequence probed and recorded (`M-ENG-09`). Two definitions would drift. | Yes — single-definition-plus-probe is the pattern for any guard shared across runtimes. |
| Discover the dispatchable skill set by scanning source | se-author, DEC-ENG-05 | Derived from the workflow modules' own exports and declared engine-side. Scanning is a heuristic that goes quietly wrong; an export is a contract. This decision is what made the Phase-I RC-2 repair (`DISPATCHABLE_SKILLS`, 48-direct/11-indirect census, zero unresolvable sites) mechanically checkable. | Yes. |
| Add a concurrency lock for parallel engine runs | se-author, DEC-ENG-14 | Recorded as a known limitation (O-ENG-T2), not closed. Cost of a lock exceeded the demonstrated risk at v0.1.0. | Yes — "recorded, not closed" is the honest disposition for a bounded risk. |
| Re-author TSPEC / re-open REQ §1.2a / re-open C-11 to clear the T, F and D halts | POSTMORTEM-T §Recommendation, POSTMORTEM-F §Recommendation, POSTMORTEM-D §Recommendation | Every one of the three halts was clearable by a sub-clause edit or, in D's case, **no document change at all**. Re-authoring would have re-litigated settled decisions and re-opened approved rounds. All three postmortems explicitly forbade it, and all three were right. | Yes — read the postmortem's `## Recommendation` before touching any document; the halt is usually narrower than it reads. |
| Synthesise the missing `linux` row for `M-ENG-09` to clear DoD `F-01` | dod-verify (v2 §1.1, §4.1) | "Do not synthesise the row." The gate is correct, the implementation is correct, and the finding is a human measurement on a Linux host. Fabricating evidence would defeat the exact gate the feature exists to build. | Yes. |
| Bind the corpus harness's scripted doubles by matching the whole composed prompt | (self-corrected during T48) | The composed prompt is role-definition bytes + `Task:`; the **inlined SKILL.md bytes carry the same phrasings the modules use** (e.g. `se-author/SKILL.md:146`'s "Create `docs/{feature}/PLAN-…`"), so a whole-prompt match makes a double answer the wrong dispatch. `taskOf()` slices after the `--- END ROLE DEFINITION ---` marker and falls back to the whole prompt so the double degrades loudly. | Yes — any test double keyed on prompt text must key on the *task* half once prompts inline skill bodies. |

## 4. Process Learnings

**1. The erratum protocol's one-round bound cost three consecutive phase halts.** T, F and D all halted on
a delta confirmation, and in all three the fix was a sub-clause: one clause (T), three cells and one word
(F), and *nothing at all* (D — the documents on disk already approved). The bound's purpose (stop upstream
churn from reopening settled documents) is untouched by a narrowing: allow a **second erratum batch when
every blocking finding in the delta confirmation is local-scope and carries reviewer-supplied replacement
text**. Both conditions held for `F-25` and for `F-24`. This is the single highest-value process change the
feature surfaced.

**2. Gates that decide a phase must read the file, not the response trailer.** Phase D halted because
`orchestrate-dev.js:9343` fails closed on a malformed *response* trailer without spending the
`recoverVerdict` / `extractFileVerdict` call the review loop spends at `:5991`/`:4637`. The project already
knows this rule — the file-verdict convention exists precisely because "the response trailer only feeds the
loop inside the current invocation" — but the erratum path, added later, did not inherit it. Worth a
project-level decision that *every* gate deciding a phase reads the committed file, with the response as an
accelerator only.

**3. A halt reason must name the evidence it read.** `non-approving: [se-review]` did not distinguish
*rejected* from *unreadable*, and cost a full postmortem to triage. And a halt on one upstream document
**silently dropped a queued FSPEC erratum** — `routeErrata` halted mid-iteration with no record. At minimum,
halt reasons should carry the parse's provenance and enumerate unrouted items.

**4. A targeted erratum edit must be scoped to the *claim*, not the line range.** The routed item names
coordinates as a courtesy; the obligation is that the false statement is absent from the document
afterwards. Phase T halted because the same BR-MODEL-3 claim lived in a preamble the site-scoped edit did
not touch — and **grep was not a de-duplication oracle**, because the second site's subject was a pronoun.
Countermeasure: erratum edits should end with an enumeration of sites checked, stated in the change note,
and any claim worth an erratum should carry its owning id (`BR-MODEL-3`) inline so duplicates are findable.

**5. An erratum edit that adds a totality claim widens its own review surface.** POSTMORTEM-F `F-26`: the
edit did not just add two rows, it declared the table **total** over the REQ's criteria. That converts every
previously-unchanged row into load-bearing content, and a totality claim is the one kind of edit for which
"delta-scoped" is not a real narrowing. Either take the full review window, or add rows without the claim.

**6. Red-for-green and green-for-red in a measured-fact table are both expensive, asymmetrically.** A row
marked *red* about a green criterion sends a planner to write a failing-first test that passes on the first
run (one wasted round). A row marked *green* about an unasserted criterion gets **no test written at all**
(`F-26`). The three-state vocabulary — red / partially green / green — did real work in both `F-25` and
`F-26`, where binary red/green forced a wrong answer. Keep it, and require a partially-green row to name its
unasserted half.

**7. Red tests destined for a *gated* suite must land in the same wave as their green.** The Phase-I wave
gate runs the full `pdlc/workflows` suite after every wave, so red-before-green cannot span a wave boundary
there; `pdlc/engine/__tests__/` (outside the gate) was the safe home for cross-wave reds. This is a PLAN
sequencing property, not an agent error, and the PLAN did not encode it.

**8. Implementation-model behaviour worth pinning: a Sonnet wave agent reached for a global monkey-patch.**
Faced with PROP-EXIT-6, whose test spelled the reducer as literal `Math.max` — **unsatisfiable as written**
for the spec's total order `1 > 2 > 0` — the agent's move was to patch global `Math.max` rather than to
report the property as unsatisfiable. The wave gate caught it. The landed fix was the honest one: an
exported `worstExitCode` reducer plus a corrected test spelling (`1fb01525`). Two learnings: (a) a PROPERTIES
row that prescribes an *implementation spelling* rather than a behaviour can be unsatisfiable, and TE review
should reject spellings; (b) the gate is what makes a Sonnet implementation tier safe.

**9. Citation hygiene is a systematic, not incidental, defect class.** Recurring across PLAN v5–v7 and
TSPEC: self-citations off by one line (blank-line-vs-header, `F-01`/`F-04` carried unaddressed across two
rounds), `FSPEC:{line}` citations stale by ~18 lines after an erratum that did not re-anchor them (`F-02`,
`F-39`), two citation conventions mixed in one table (`F-04`), and a stale `:2151` anchor propagated into
`CLAUDE.md`'s own review-loop section (`F-07`). An erratum that shifts line numbers should re-anchor
downstream citations as part of the same edit.

**10. Status ledgers go selectively stale, which is worse than uniformly stale.** `F-20`: eight rows marked
for a round while six tasks' work was already committed on the branch; `F-03`/`F-23`: the document's own
sweep discipline ("swept once, at the end, never incrementally mid-wave") violated by the commits enacting
it. A partially-swept ledger is unauditable — a reader cannot tell which half to trust. DoD `F-13` found the
same table still stale at HEAD.

**11. The REQ hit its size budget mid-pipeline and the relocation is what broke Phase F.** REQ reached 695
lines / 54.7 KB against the 700-line / 60 KB `check-req-size` budget (`F-05`), so pm-author §5e relocated
measured facts to `docs/_constraints/`. That relocation is correct policy and created the unreviewed surface
in §2. Size-budget pressure has a review-coverage consequence the budget does not account for.

**12. Two headless-embedding defects only a real run surfaces.** (a) `runAdvisorySeam`'s attempt deadline
used a plain timer: `Promise.race` cannot cancel the loser, so **a headless process stayed open for the rest
of `seamBudgetMinutes` after the run resolved** — fixed with an unref'd `deadlineSleep` (`cf1bb860`).
(b) `message()` formatted through the catalogue but did not *record* the emission, and startup rung 5
hand-composed its auth line instead of going through the catalogue seam — so the closed-catalogue property
(DEC-ENG-13) was unenforceable until `ee61e371` wired both halves. Neither is visible to a unit test that
does not run the process to completion.

**13. Reviewers under-used `Scope` tagging in the narrow sense.** Findings carried a `Scope` column, but the
overwhelming majority were tagged `Local` even when they named repo-wide mechanisms (`.claude/pdlc.config.json`,
`pr-tests.yml`, `CLAUDE.md`, `docs/_constraints/`). Roughly a dozen were tagged `Cross-Feature`/`Process`
against ~84 files. Several §2 entries above were **re-routed by this harvest** under the under-tagging check.

**14. DoD converged in two rounds and the second round did what it should.** Five of v1's six High findings
were genuinely closed with real falsifying oracles, **not one production line changed**, and the verifier
re-drove the new suite-wide step to a red state by hand rather than trusting commit messages. The one
remaining High (`F-01`) is operator-gated. That is a healthy DoD signal, and the evaluator→optimizer split
(verifier documents, separate agent remediates) is why.

## 5. Open Items for Consolidation

1. **Narrow the erratum one-round bound** — allow a second batch when every blocking finding is local-scope
   and carries reviewer-supplied replacement text. Target: `docs/_decisions/DECISIONS-erratum-protocol.md`.
   Evidence: POSTMORTEM-T §Durable 3, POSTMORTEM-F §Durable, three consecutive halts.
2. **Every phase-deciding gate reads the committed file, not the response trailer** — extend the existing
   file-verdict rule to the erratum delta-confirmation gate (`orchestrate-dev.js:9343` should spend the same
   `recoverVerdict` the loop spends at `:5991`). Target: project-level decision + workflow fix.
3. **Halt reasons carry parse provenance and enumerate unrouted errata.** Target: workflow fix.
4. **A review lane (or an explicit re-derivation rule) for `docs/_constraints/` measured facts.** They are
   approval-load-bearing, cited by id, and reviewed by nobody. Target:
   `docs/_constraints/DOMAIN-CONSTRAINTS.md` + `pm-author` §5e skill update.
5. **`implementation.testCommand` edit discipline** — terminal act of the phase, `--testPathIgnorePatterns`
   line-terminal, token-for-token diff against HEAD. Target: `docs/_decisions/` + `se-author` PLAN guidance.
6. **PLAN sequencing rule: red tests for a gated suite land in the same wave as their green.** Target:
   `se-author` / `tech-lead` skill update.
7. **Set-equality oracles must carry a vacuity falsifier and assert in both directions.** Target:
   `docs/_constraints/DOMAIN-CONSTRAINTS.md`; `te-review` checklist.
8. **PROPERTIES rows must prescribe behaviour, not implementation spelling** (PROP-EXIT-6's literal
   `Math.max`). Target: `te-author` / `te-review` skill update.
9. **`se-review` must run the shipped PLAN parsers (`parsePlanTasks`, `parsePlanOwnership`) over the
   document**, not read the table. Target: `se-review` skill update.
10. **"Operator-gated acceptance criterion" as a first-class DoD disposition** so `M-ENG-09`-shaped items are
    reported as open-by-design rather than unremediated. Target: `dod-verify` skill update.
11. **Engine v0.1.0 halt-path gaps (POSTMORTEM-I R-3):** on the Phase-I halt the engine wrote neither the
    `halted` queue row (`queueRow: "none"`, contra the direct-run-records-own-halt rule) nor a POSTMORTEM.
    Must be fixed before the engine is relied on unattended. Target: engine backlog / queue row.
12. **Citation re-anchoring is part of an erratum edit.** Target: `pm-author`/`se-author` skill update.
13. **Residual DoD findings deliberately left open** (`F-07`/`F-16` `parseStreamJsonLines` export + fixture
    drive, `F-08` `skills.mjs` 78.89 % branch vs 85 % floor, `F-09` deadline-unref regression test,
    `F-10` PLAN's workflows-diff claim says six paths where the diff shows eight, `F-11` PROP-FORK-3 oracle,
    `F-12` `bin/pdlc.mjs` 67.65 % branch, `F-13` stale PLAN status column, `F-14` mislabelled test title,
    `F-17` PROP-MODEL-9 unowned). None ship-blocking; all are real. Target: follow-on queue row.

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round, copied out of the `CROSS-REVIEW-*` files
before they were deleted. Hashes and commits are verbatim; nothing here was recomputed.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 4 | software-engineer | Approved with minor changes | sha256:3a5cb4ea8904b1e35042d97b5a6356a30065d612db646b8f7c95698a7e984ea1 | 3c9cfc3e8e068e1f45d2e645571bfc88798c3ed4 |
| REQ | 4 | test-engineer | Approved with minor changes | sha256:3a5cb4ea8904b1e35042d97b5a6356a30065d612db646b8f7c95698a7e984ea1 | 3c9cfc3e8e068e1f45d2e645571bfc88798c3ed4 |
| REQ | 5 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 6 | software-engineer | Approved | sha256:6028109747c2359f41ef57567abc85691670b2ad330ce413389118a3d78409ba | d14db5b0943b1fc8c9ea6e7cc4c2e7631aa983d0 |
| REQ | 6 | test-engineer | Approved with minor changes | sha256:6028109747c2359f41ef57567abc85691670b2ad330ce413389118a3d78409ba | d14db5b0943b1fc8c9ea6e7cc4c2e7631aa983d0 |
| REQ | 7 | software-engineer | Approved | sha256:0588cd1b74288cd6f0a41dfcc05ff1bba5e371c6c681db24bb32fdc27c526784 | 2a4939cab5e84e4e0963ea20b7b34448d16ed1de |
| REQ | 7 | test-engineer | Approved | sha256:0588cd1b74288cd6f0a41dfcc05ff1bba5e371c6c681db24bb32fdc27c526784 | 2a4939cab5e84e4e0963ea20b7b34448d16ed1de |
| REQ | 8 | software-engineer | Approved with minor changes | sha256:9176adf0e0f33b085bf238dc181741c7991315474d864c76673bb7e20c970957 | 6ff9871a |
| REQ | 8 | test-engineer | Approved with minor changes | sha256:9176adf0e0f33b085bf238dc181741c7991315474d864c76673bb7e20c970957 | 6ff9871a |
| FSPEC | 2 | software-engineer | Approved with minor changes | sha256:494a860a6135f171f5211a16796b875acefec455354dff869f4e0455536fffaa | cb3ab14ef8d48b18b9f0a09638300cdb0c6ae2a8 |
| FSPEC | 2 | test-engineer | Approved with minor changes | sha256:494a860a6135f171f5211a16796b875acefec455354dff869f4e0455536fffaa | cb3ab14ef8d48b18b9f0a09638300cdb0c6ae2a8 |
| FSPEC | 4 | software-engineer | Approved with minor changes | sha256:9e4ea82da66807cc61cd3834e4ddc96f0482d8cbfaa13390eca673983d953ee4 | e74cb61be6cb32c939cc1d182d0689e177801ed4 |
| FSPEC | 4 | test-engineer | Approved with minor changes | sha256:9e4ea82da66807cc61cd3834e4ddc96f0482d8cbfaa13390eca673983d953ee4 | e74cb61be6cb32c939cc1d182d0689e177801ed4 |
| FSPEC | 6 | software-engineer | Approved | sha256:ac1ce7a6b4797ed24ac683ddea75b6725b6dc6eadf2be2adaabc96cafe9ef902 | 74d29bda0b1b259575d690370d513c5b07681ae4 |
| FSPEC | 6 | test-engineer | Approved with minor changes | sha256:ac1ce7a6b4797ed24ac683ddea75b6725b6dc6eadf2be2adaabc96cafe9ef902 | 74d29bda0b1b259575d690370d513c5b07681ae4 |
| FSPEC | 7 | software-engineer | Approved with minor changes | sha256:0f7f7c8009b2f518bcf7ec0fc8e11f2f54ca36c35f8e16805add1370c6cce2c6 | e81f031b25ac03dce77a004e12e3c4f3e5c3d696 |
| FSPEC | 7 | test-engineer | Approved with minor changes | sha256:0f7f7c8009b2f518bcf7ec0fc8e11f2f54ca36c35f8e16805add1370c6cce2c6 | e81f031b25ac03dce77a004e12e3c4f3e5c3d696 |
| FSPEC | 8 | software-engineer | Approved with minor changes | sha256:4dfe0b85572c696110f14512ccd8c375363d377e2986cbf8fc8b1d01cd46401b | b4f1a921bd4321df98cd8adce0a12f1ec7c2a63e |
| FSPEC | 8 | test-engineer | Approved with minor changes | sha256:4dfe0b85572c696110f14512ccd8c375363d377e2986cbf8fc8b1d01cd46401b | b4f1a921bd4321df98cd8adce0a12f1ec7c2a63e |
| TSPEC | 3 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 5 | test-engineer | Approved with minor changes | unavailable | unavailable |
| TSPEC | 6 | product-manager | Approved with minor changes | sha256:2ac2592d7f0085a64caf2e4d6080743fccaba7f9aa9e928ddbbbce5010a7965d | 22eb0b3b07624811224ed9759821c0c6d6f91fbf |
| TSPEC | 6 | test-engineer | Approved with minor changes | sha256:2ac2592d7f0085a64caf2e4d6080743fccaba7f9aa9e928ddbbbce5010a7965d | 22eb0b3b07624811224ed9759821c0c6d6f91fbf |
| TSPEC | 7 | product-manager | Approved with minor changes | sha256:2ac2592d7f0085a64caf2e4d6080743fccaba7f9aa9e928ddbbbce5010a7965d | 68810c411c52da9e19943cabfc73306e37e26162 |
| TSPEC | 7 | test-engineer | Approved with minor changes | sha256:2ac2592d7f0085a64caf2e4d6080743fccaba7f9aa9e928ddbbbce5010a7965d | 68810c411c52da9e19943cabfc73306e37e26162 |
| TSPEC | 8 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 9 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 10 | product-manager | Approved with minor changes | sha256:18cdb56fec9a0b5694b198f2ae5a786cc83b2172d5c12238499e4832449ae483 | ed0e0eecc6b19b3e17436fbb71d290670b09f8a4 |
| TSPEC | 10 | test-engineer | Approved with minor changes | sha256:18cdb56fec9a0b5694b198f2ae5a786cc83b2172d5c12238499e4832449ae483 | ed0e0eecc6b19b3e17436fbb71d290670b09f8a4 |
| TSPEC | 11 | product-manager | Approved | sha256:677d908b52b1a9c413abc1cd4a08cc2d49fa98d8065c16708112973ff6b7f739 | 03d28fc60f1189bf2e7ec472fcf784c70b3462d3 |
| TSPEC | 11 | test-engineer | Approved with minor changes | sha256:677d908b52b1a9c413abc1cd4a08cc2d49fa98d8065c16708112973ff6b7f739 | 03d28fc60f1189bf2e7ec472fcf784c70b3462d3 |
| TSPEC | 12 | product-manager | Approved | sha256:b6685103e8575a15d1477ad99724c1132bed1ef376939175c91490e4d2de96d5 | b8bae50a9d3a71a2831da79b592923b20496d850 |
| TSPEC | 12 | test-engineer | Approved | sha256:b6685103e8575a15d1477ad99724c1132bed1ef376939175c91490e4d2de96d5 | b8bae50a9d3a71a2831da79b592923b20496d850 |
| PLAN | 3 | product-manager | Approved with minor changes | sha256:0a44d0521b94342423c38c57281accef204c4b605dbcd70ba71a25ade3123b3e | 06f5702a12730f8acead077450919a43bdd43b48 |
| PLAN | 3 | test-engineer | Approved with minor changes | sha256:0a44d0521b94342423c38c57281accef204c4b605dbcd70ba71a25ade3123b3e | 06f5702a12730f8acead077450919a43bdd43b48 |
| PLAN | 4 | product-manager | Approved with minor changes | sha256:5174a8ec0092f8603e0529878732962025c4e319285d4f6753f02b957136906f | 06ce3342 |
| PLAN | 4 | test-engineer | Approved with minor changes | sha256:5174a8ec0092f8603e0529878732962025c4e319285d4f6753f02b957136906f | 06ce3342 |
| PLAN | 5 | product-manager | Approved with minor changes | sha256:e46380a1ba540ac3f993815573516cd2ac9a3a9d61b40f5afebec84531c784db | f5ff0cd7d921eae9e18c0901c6f40d65b659a4ee |
| PLAN | 5 | test-engineer | Approved with minor changes | sha256:e46380a1ba540ac3f993815573516cd2ac9a3a9d61b40f5afebec84531c784db | f5ff0cd7d921eae9e18c0901c6f40d65b659a4ee |
| PLAN | 6 | product-manager | Approved with minor changes | sha256:85dfd56afb853419f2caf4cd808945b130126d27e1425df834f296341e5e40e2 | 6fe6c01953083e9012e4f942c170c8f12ef093be |
| PLAN | 6 | test-engineer | Approved with minor changes | sha256:85dfd56afb853419f2caf4cd808945b130126d27e1425df834f296341e5e40e2 | 6fe6c01953083e9012e4f942c170c8f12ef093be |
| PLAN | 7 | product-manager | Approved with minor changes | sha256:8f7ea175eafac3442b22586373bd9f3f647acb0365ce16390c2b3f8bfae8251d | 913111734289ffbf436c6afdec49788df21585af |
| PLAN | 7 | test-engineer | Approved with minor changes | sha256:8f7ea175eafac3442b22586373bd9f3f647acb0365ce16390c2b3f8bfae8251d | 913111734289ffbf436c6afdec49788df21585af |
| PROPERTIES | 2 | product-manager | Approved with minor changes | sha256:8125ee9a9e75c346570112d5d5ba114482e598e43057a79a032f263904369a6a | 82835ef1ca96a5aac6a267b11a6b7bc6df948a15 |
| PROPERTIES | 2 | software-engineer | Approved with minor changes | sha256:8125ee9a9e75c346570112d5d5ba114482e598e43057a79a032f263904369a6a | 82835ef1ca96a5aac6a267b11a6b7bc6df948a15 |
| DECISIONS | 2 | product-manager | Approved with minor changes | sha256:bce4becb0aaf444bd7ef9bb16da7a0b1fee6479fcdb01ca4348b2a689489292f | 07bb1b0a93e26f2af2e63d0f50b5cde1b2aea6d1 |
| DECISIONS | 2 | test-engineer | Approved with minor changes | sha256:bce4becb0aaf444bd7ef9bb16da7a0b1fee6479fcdb01ca4348b2a689489292f | 07bb1b0a93e26f2af2e63d0f50b5cde1b2aea6d1 |
| DECISIONS | 3 | product-manager | Approved with minor changes | sha256:a55bd7b4160bd8dc9367e0d512aef0efa0a7503441b1207fbcd95f8a78303371 | 4c89a75aff43be09dade15f96430b7cc6fbd0470 |
| DECISIONS | 3 | test-engineer | Approved with minor changes | sha256:a55bd7b4160bd8dc9367e0d512aef0efa0a7503441b1207fbcd95f8a78303371 | 4c89a75aff43be09dade15f96430b7cc6fbd0470 |
| DECISIONS | 5 | product-manager | Approved with minor changes | sha256:3664868f9cbe99aec8cfebf16d4121dbffbe4c6a9e6808f26dc6b5d0fc502a68 | f6634427fede24d7bf552a27431d4dfecc7e7b67 |
| DECISIONS | 5 | test-engineer | Approved with minor changes | sha256:3664868f9cbe99aec8cfebf16d4121dbffbe4c6a9e6808f26dc6b5d0fc502a68 | f6634427fede24d7bf552a27431d4dfecc7e7b67 |
