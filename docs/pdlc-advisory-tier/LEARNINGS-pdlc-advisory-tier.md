# LEARNINGS — pdlc-advisory-tier

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-tier |
| REQ | docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md |
| Date Completed | 2026-08-05 |
| Total Iterations | REQ: 4, FSPEC: 8, TSPEC: 7, DECISIONS: 3, PLAN: 10, PROPERTIES: 6, Final codebase review: 2, IMPL: 36 tasks / 20 batches |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| DoD rounds | 3 (`CODE_REVIEW-pdlc-advisory-tier-v1/v2/v3.md`) |
| Harvested from | `CROSS-REVIEW-software-engineer-REQ-v1..v4.md`, `CROSS-REVIEW-test-engineer-REQ-v1..v4.md`, `CROSS-REVIEW-software-engineer-FSPEC-v1..v8.md`, `CROSS-REVIEW-test-engineer-FSPEC-v1..v8.md`, `CROSS-REVIEW-product-manager-TSPEC-v1..v7.md`, `CROSS-REVIEW-test-engineer-TSPEC-v1..v7.md`, `CROSS-REVIEW-product-manager-DECISIONS-v1..v3.md`, `CROSS-REVIEW-test-engineer-DECISIONS-v1..v3.md`, `CROSS-REVIEW-product-manager-PLAN-v1..v6,v8,v9,v10.md`, `CROSS-REVIEW-test-engineer-PLAN-v1..v10.md`, `CROSS-REVIEW-product-manager-PROPERTIES-v1..v6.md`, `CROSS-REVIEW-software-engineer-PROPERTIES-v1..v6.md`, `CROSS-REVIEW-final-codebase-pdlc-advisory-tier-v1.md`, `CROSS-REVIEW-final-codebase-pdlc-advisory-tier-v2.md`, `CODE_REVIEW-pdlc-advisory-tier-v1.md`, `CODE_REVIEW-pdlc-advisory-tier-v2.md`, `CODE_REVIEW-pdlc-advisory-tier-v3.md`, `POSTMORTEM-T-pdlc-advisory-tier.md`, `POSTMORTEM-PR-pdlc-advisory-tier.md` — 82 files, deleted by this harvest |

## 1. Non-Convergences

Two POSTMORTEMs, both from the **erratum channel** — never from a document's own review loop. Every
primary review loop (REQ, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES) converged on its own terms; the
halts came from routing a finding *upstream* and failing the delta-confirmation.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| T (erratum → FSPEC) | te-review, `CROSS-REVIEW-*-FSPEC-v4` | Two of four routed errata rested on one false git-history premise — that `26c3f1c` *predates* `raisePrAndVerifyCi`. It does not (`git grep -c 'raisePrAndVerifyCi' 26c3f1c …` ⇒ 4), and the emitting author had recorded the opposite in TSPEC §1.1 one document earlier. The edit that acted on them replaced a correct D-6/T-10-3 disabled-run baseline with a fork-point baseline. se-review approved the edit at face value; te-review ran the check and blocked. | D-6/T-10-3 restored to `26c3f1c`; the two sound errata (A2-6/R-2 ordering, C-2 report gating) kept; FSPEC re-converged at v1.4→v1.5 through a fresh Phase F rather than a standalone confirmation. `RESOLVED: yes`. | 1 erratum round (of 1 permitted); FSPEC review reached v8 overall |
| PR (erratum → PLAN) | te-review, `CROSS-REVIEW-*-PLAN-v6` | All ten routed lines (4 distinct defects) were sound and all four were fixed — but fix 1 was scoped to the *wording* of the erratum (A1) while the TSPEC change it reconciles with covered **A1 and A3**. `PLAN:869` then instructed A-07 to stub a gate A3 does not declare: a case red against a correct build, undiagnosed until A-23, or silently vacuous. Underneath sat a genuine unreconciled FSPEC↔TSPEC divergence about whether A3 has a post-action gate — which is why pm-review scored it Low and te-review High from the same observation. | Decided **once, at the level of the conflict**: A3 has no post-action gate (TSPEC's reading), recorded as **DEC-ADV-11** and restated in FSPEC §5.4 in A1's form. PLAN v1.7 generalised §8.2 to the gateless form for both seams and named an explicit registry `gate` column so the generated case does not key off the shipped object. `RESOLVED: yes`. | 1 erratum round (of 1 permitted); PLAN review reached v10 overall |

**The shared shape.** In both halts the protocol *worked*: the bound (one erratum round per upstream
doc per phase) converted a refused confirmation into a halt instead of an unbounded re-edit spiral,
and in both cases the refusing reviewer was an original approver applying its own standing
obligation (te-review's "verify every 'X exists at commit C' claim against the git object", and its
"does this case fail against a wrong build and pass against a correct one"). Neither halt was a
harness defect. Both were caught on a **one-reviewer margin** — had the second approver also taken
the prose at face value, a regression would have landed.

## 2. Cross-Feature Patterns

| Finding | Suggested Promotion Target |
|---|---|
| **The Workflow launcher parses the script statically and refuses `import(` anywhere in it** — even inside dead code. The seam defaults' `await import("child_process")` sites cost both bundles their launch (`SyntaxError: import() is not available in workflow scripts`). `build-runtime.mjs` now neutralizes dynamic imports in the two runtime bundles into a rejecting expression that keeps the specifier greppable, with a build-time gate plus bundle-level tests; `pdlc-cli.mjs` is plain Node and keeps its imports. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — extend CLAUDE.md's list of runtime prohibitions from "`import()` does not exist" to "**no `import(` token may survive in a bundle, reachable or not**" |
| **The launcher also rejects C0 control bytes.** `parseErrata`'s dedup key used `${docType}\x00${item}`; the NUL rode into every bundle and the Workflow permission handler, which inlines the resolved script into its approval dialog, refused to launch `orchestrate-dev` at all. Fixed to a space, with a byte-level oracle (RLH-AT-65) asserting no C0 byte except tab/LF/CR survives in sources or artifacts. | Same constraint doc — the generated-artifact byte hygiene rule |
| **A `no-action` default on an injected seam can be a liveness bug, not a neutral one.** `raisePrAndVerifyCi`'s `_runAdvisorySeam` default returned `no-action`, which the A5 branch reads as "the seam re-observed CI green" and re-polls — so with no seam injected a persistently red CI **spun forever** (a jest worker pinned at 100% CPU). The behaviour-preserving default is `escalated`, which falls through to the byte-identical halt, plus an `a5.model !== undefined` conjunct so a seam that never dispatched cannot re-poll. Rule: a seam default must be chosen for *what the consumer does with it*, not for what reads as inert. | `docs/_decisions/DECISIONS-seam-defaults.md` (new) — "default a seam to the value that preserves the pre-feature control flow, and prove it with a negative control" |
| **A self-inclusive source-text scan will match its own controls, its own narration and its own `it()` label.** PROP-REG-08 (no `describe.skip` in `advisory*.test.js`) and PROP-INFRA-01 both scan every file in a glob *including their own*, and both wanted their forbidden-shape fixtures in the same file — a mechanical contradiction between the property and its falsification control. Resolved by moving every forbidden literal into a shared non-test fixture module (`__tests__/fixtures/scanFixtures.js`) outside the scanned glob, exporting them as named constants. Assembling literals at runtime from fragments was considered and rejected (hides the shapes from the reader). | `docs/_decisions/DECISIONS-test-oracle-mechanics.md` — add the self-inclusive-scan hazard beside DEC-ORACLE-01 |
| **`validatePlanContract` does not validate the file paths in an ownership manifest** — it compares task-id sets in both directions only. A PLAN whose manifest omits a file created mid-feature still returns `{ok: true}`. The mechanism that actually bites is the Phase I wave commit, which stages exactly `task.files` (`orchestrate-dev.js:8143-8159`), so an unowned fixture never enters a commit. The misreading "the parse gate proves my manifest complete" will recur on any PLAN that adds a file mid-feature. | Skill update — `se-author` batch-safety rule 2, and the CLAUDE.md phrasing of what the contract gate checks |
| **RED-terminal waves are unsatisfiable against the script-owned Phase I gate.** The gate runs the whole configured suite after every wave and `haltError`s on failure; there is no per-wave scoping seam. A PLAN whose batches are "🔴 author failing tests / 🟢 implement" halts the pipeline at the first red batch. Two workable shapes: fold each 🔴 into its 🟢 successor as one TDD task, or have the 🔴 task author cases `describe.skip`-ped and the 🟢 task un-skip them (this feature took the second, and made the un-skip sweep itself an asserted property). | Skill update — `se-author` PLAN authoring; CLAUDE.md §Implementation waves |
| **A second escalation channel needs an explicit reconciliation with the shipped one.** REQ-ADV-10 introduced file-based `docs/_queue/ESCALATIONS.md` next to the existing `MERGE ESCALATION:` report notices — two places an operator must watch. Resolved by making the advisory notices a *sibling* frozen catalogue sharing the `ESCALATION:` token, with `MERGE_ESCALATIONS` byte-unchanged and asserted so. | `docs/_decisions/DECISIONS-operator-signals.md` (new) |
| **The shared `_appendFile` transport prompt described one caller's purpose as fact.** The adapter's dispatch prompt asserted the append "records the review's approval provenance"; the same branch added two non-approval consumers (advisory record, escalation log), so two of three call sites were misdescribed to the executing agent — which matters because CLAUDE.md documents that transport agents hesitate on appends whose stated purpose does not match what they are handed. Fixed to describe the *operation* first and then enumerate all three purposes. | `runtime-adapter.js` convention + CLAUDE.md artifact-convention section |
| **A push between Phase PUB and Phase MERGE moves the head and restarts CI**, so `decideMerge` reads `pending` and resolves `refused`. AC-9.3's post-PUB advisory-record distil is the pipeline's first such push. Not a defect here (`mergeMode` ships `off`) but it decides an operator-visible outcome and belongs at REQ altitude wherever it recurs. | `docs/_decisions/DECISIONS-merge-phase.md` |

**Under-tagging.** Only 12 findings across 77 cross-review files carry an explicit `Scope:` tag in
the scanned form, and several `Local`-tagged findings plainly reference repo-wide mechanisms (the
`_appendFile` transport prompt, `validatePlanContract`'s semantics, the Phase I gate). Those were
re-routed to this section on the CLAUDE.md under-tagging rule; the tag under-use itself is recorded
in §4.

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Give A3 a post-action `verifyGate` ("Phase DOD's verify step / no findings remaining"), per FSPEC §5.4's original row | Phase PR erratum resolution, **DEC-ADV-11** | A3's `permittedActions` is `[]`, so the driver never reaches step 6, no resolution is ever applied and there is nothing for a gate to verify. FSPEC already accepts exactly this argument for A1. Recorded rather than left implicit so the next reader does not re-open it. | Yes — the "a seam whose permitted-action set is empty cannot carry a post-action gate" rule generalises to any future seam |
| Keep both rung ladders — the tested `resolveAdvisoryRung` probe and the shipped `dispatchViaRungLadder` | DoD v1 finding 1 → v2 remediation | Two semantically different implementations, one shipped and one tested. `resolveAdvisoryRung` issued a discarded-output probe dispatch; TSPEC §3.4's own text says "never a separate probe". Collapsed to one ladder called by the driver's DIAGNOSE step, with the tests repointed at the shipped symbol at both unit and `runAdvisorySeam` level. | Yes — "the tested symbol must be the shipped symbol" is the whole of the lesson |
| Assemble the forbidden-shape literals for the source-scan oracles at runtime from concatenated fragments | te-review, PROPERTIES rounds | It would satisfy the self-inclusive scan, but it hides the shapes from the reader and weakens the scan against the real evasion it exists to catch. A shared fixture module outside the scanned glob keeps them literal and greppable. | Yes |
| Recompute approval hashes at harvest time | Standing harvest rule, honoured here | Recomputing hashes the document as it stands *after* the phase, turning every harvested approval into a false "fresh" one. Every anchor in §6 is copied verbatim. | Yes — invariant, not a per-feature choice |
| Key the generated gate-exclusivity case off the shipped `SeamOps` object at test time | te-review Q-02, POSTMORTEM-PR R-5 | It makes the test agree with whatever the implementation does: a seam that silently *lost* its gate would take the gateless branch and pass — precisely the mutation the case exists to catch. The PLAN now names an explicit registry `gate` column instead. | Yes — general anti-pattern for parameterised/table-driven oracles |
| Adopt `fast-check` for the parser/classifier surfaces | DoD v1 §1 assessment | The repo carries no property-testing library and never has; the advisory suites instead drive exhaustive/parameterised oracles **off the exported frozen catalogues** (e.g. `REASON_FIXTURES` key-set-asserted against `ADVISORY_REFUSAL_REASONS`; `PROP-GATE-06` asserting the gate registry's key set equals `ADVISORY_SEAMS`), which is set-equality over the whole input domain here. Reusing the in-repo seeded `driftGenerators.js` was preferred where generation was genuinely needed. | Yes — prefer the in-repo generator plus catalogue-derived set-equality over a new dependency |
| Merge Phase CR and Phase DOD into one gate | Standing operator decision (2026-08-02), re-confirmed by this run | This feature is the evidence: CR v1 caught three unwired-integration Highs (A5, escalation log, A3 classification) and DoD v1 then caught three *more* (two ladders, unwired `refusalReasonFor`, the `terminate()` bypass) in code CR had already approved-with-revision. Different lenses, different catch. | Yes — do not merge them |

## 4. Process Learnings

**The erratum channel's failure modes are all at emission or application, never at confirmation.**
Three independent observations from two POSTMORTEMs say the same thing from three angles:

1. *An emitted erratum should carry its grounding.* POSTMORTEM-T's root cause was a factual premise
   ("`26c3f1c` predates `raisePrAndVerifyCi`") that was falsifiable by one `git grep` and was
   contradicted by the emitter's own TSPEC one document earlier. Routing is deliberately
   low-friction, so nothing mechanical enforces that a routed claim was checked. Candidate rule:
   every `ERRATUM: {DOC}: …` line asserting a git-object fact ("predates", "does not exist at C",
   "signature is X") must cite the command and result that establishes it — the same discipline the
   confirming reviewers already apply, moved one step earlier.
2. *An erratum fix should be scoped to the upstream change, not to the erratum's wording.*
   POSTMORTEM-PR: the routed line named A1; the TSPEC edit it reconciles with covered A1 **and** A3
   in one sentence. The fix stopped at the named seam. An erratum line is a **pointer to a symptom**,
   and nothing checks fix extent against change extent.
3. *Read the child document that raised the erratum while writing the parent's fix.* PROPERTIES §6
   already stated the correct both-seams gateless form and `PROPERTIES:568` had **predicted the exact
   failure mode** the PLAN fix then walked into. Errata flow child → parent as findings; there is no
   reciprocal convention for checking a parent's fix against the child text that motivated it.

**Routing an erratum to the child of a document conflict relocates it, never resolves it.** A3's gate
was described one way in an approved FSPEC row and the opposite way in TSPEC v1.3, and neither
acknowledged the other. Every PLAN sentence about it was then defensible-or-defective depending on
which parent you read — which is precisely why pm-review and te-review reached opposite severities
from the same observation. The fix was to decide once at FSPEC⟷TSPEC and record it (DEC-ADV-11).

**Tests that supply the composition root production omits produce a green suite against wiring that
does not ship.** This was the dominant defect class of the whole feature, found three times:

- CR v1 H-1: `buildA5SeamOps` had zero production call sites; `advisoryPubSeam.test.js` built the
  seam and forwarded the full driver parameter set itself, so every A5 case was green against a
  composition root that did not exist. Alongside it, a literal `const waitMs = 0` stub with an
  "out of this task's scope" comment in shipped code.
- CR v1 H-2: `appendEscalationEntry` had zero call sites; the covering suite wrapped the call in a
  local `simulateEscalationLogStep` helper introduced as "a pure re-expression of that one
  control-flow fact" — an **implementation echo of control flow that did not exist**.
- CR v1 H-3: the DoD halt read `classificationSummary`, which no path produced; both covering cases
  injected the field from a scripted *disposition*.

The remediation pattern that made each green meaningful is identical: drive `dev.default(...)` with
the tier enabled and a scripted **agent**, not a scripted disposition or a local call-site helper.

**A `catch` that builds its terminal value directly bypasses everything the terminal builder owns.**
DoD v1 finding 3 (the one High): `runAdvisorySeam`'s terminal `catch` constructed its `escalated`
disposition as an object literal instead of calling `terminate()`. Reproduced empirically —
`_appendFile` called **zero** times, `_notice` **zero** times: no advisory record (AC-9.1), no
`ESCALATIONS.md` entry (AC-10.1), no report notice (AC-10.5) — and its `reason:
"unclassified-error"` was outside the frozen eight-member catalogue that AC-3.6 declares closed. The
totality claims of three acceptance criteria were all false on one path. Related, same round:
`refusalReasonFor` — the *ordered* first-match resolver over that catalogue — had zero production
callers, so reordering the catalogue changed nothing on the live path and AC-3.6's precedence was an
emergent property of straight-line control flow. Both were fixed by routing every termination through
one `refuse()` closure, with an oracle that reads the expected precedence **off the catalogue at
runtime**, so a re-hard-coded literal cannot pass.

**Three DoD rounds, and the third found the fix itself was wrong.** v1: 5 findings + 10 traceability
gaps. v2: every v1 finding closed, one new low — reconciling the two ladders changed
`resolveAdvisoryRung`'s signature and return contract, and TSPEC §3.4 / PROPERTIES §4.2 still declared
the pre-remediation one (a contract surface, since JSDoc `@param`/`@returns` is a declared convention).
v3: the PROPERTIES leg closed, but the TSPEC rewrite had moved `prompt` out of the deps bag into a
**second positional parameter** — a shape the shipped function does not accept, and one that fails
silently (`prompt === undefined` dispatched to the agent) rather than throwing. The same section's
regex snippet had also dropped the load-bearing `\w*` suffixes. Lesson: a documentation remediation
needs the same "does this claim hold against the object" check as a code one, and "documentation-only,
low" is not a reason to skip re-verification.

**Division of labour by model held up.** Phase I waves ran on Sonnet; every spec-authoring, review,
DoD, CR and PUB dispatch ran on Opus. The advisory tier's own dispatches pin `MODEL_ADVISORY =
"fable"` with `MODEL_ADVISORY_FALLBACK = "opus"`. The pattern that worked: cheap parallel model for
mechanical, well-specified, ownership-disjoint implementation under a script-owned gate; expensive
model for the judgment steps — and every High in this feature was found by an Opus review, not by a
wave.

**Volume signals.** 77 cross-review rounds is high: FSPEC 8, PLAN 10, TSPEC 7, PROPERTIES 6. Much of
that is the erratum channel's cost — each of the two erratum rounds pushed its upstream document
through extra append-only confirmation rounds (FSPEC v4→v8, PLAN v6→v10) rather than converging the
document on its own merits. PLAN also has a **numbering gap** (`CROSS-REVIEW-product-manager-PLAN-v7`
absent while te's `-v7` exists), which is legitimate — `deriveRoundWindow` derives from the basenames
present, and R-3/R-4 in both POSTMORTEMs deliberately re-dispatched only the refusing reviewer — but
it means round counts are not reviewer-symmetric and should not be read as such.

**Scope tags were largely omitted.** Only a small minority of findings carried an explicit `Scope:`
field; several repo-wide findings were tagged `Local`. The `check-scope-field` PostToolUse hook warns
but does not block, and reviewers routinely wrote the finding table without it. Either the hook should
be promoted to a block on `CROSS-REVIEW-*` files, or the review skills should carry the tag inside the
findings-table column (as several of these reviews in fact did) so it is structural rather than a
separate line.

**Untracked local files keep falsifying document oracles.** `documentOracles.test.js` AT-22 was red
locally in every DoD round — first on `.tokensave/tokensave.db`, later also on `pdlc/workflows/coverage/`
— and green in CI, exactly as CLAUDE.md warns. Each round spent budget re-establishing this. Worth a
gitignore entry or an oracle-side skip list rather than a documentation note.

## 5. Open Items for Consolidation

Candidates only — this harvest promotes nothing itself.

| # | Candidate | Target |
|---|---|---|
| 1 | **Runtime bundle byte/token constraints.** Extend the documented prohibition from "`import()` does not exist" to "no `import(` token may survive in a bundle, reachable or not", and add "no C0 control byte except tab/LF/CR in sources or artifacts". Both are now enforced by `build-runtime.mjs` gates and `runtimeBundle.test.js` (RLH-AT-65); the *documentation* is what is missing. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` + CLAUDE.md §runtime build |
| 2 | **Erratum-emission grounding rule.** Require an `ERRATUM:` line asserting a git-object fact to cite the command and result. POSTMORTEM-T R-5. | `pm-review` / `se-review` / `te-review` skills; CLAUDE.md §erratum channel |
| 3 | **Erratum-fix extent rule.** When an erratum is resolved by pointing at another document's edit, read that edit's full extent before writing the fix; and read the child document that raised it. POSTMORTEM-PR R-7(a) and (b). | `se-author` / `pm-author` skills; CLAUDE.md §erratum channel |
| 4 | **Route conflicts to the level they live at.** An erratum against the child of two disagreeing parents cannot resolve the disagreement. Add an explicit "if the finding is that two upstream documents disagree, route to the *pair*, not the child" clause. | CLAUDE.md §erratum channel; review skills |
| 5 | **Oracle rule: the test may not supply the composition root.** A test that constructs the seam/wiring production omits proves nothing about production. Promote the remediation pattern (drive the entry point with a scripted agent) as the standing form for integration oracles. | `docs/_decisions/DECISIONS-test-oracle-mechanics.md`; `te-author` / `dod-verify` skills |
| 6 | **Oracle rule: self-inclusive source scans need out-of-glob controls.** Two properties in this feature collided with their own falsification fixtures. | `docs/_decisions/DECISIONS-test-oracle-mechanics.md` beside DEC-ORACLE-01 |
| 7 | **Seam-default rule.** Choose an injected seam's default for what the consumer does with it (`escalated`, which falls through to the pre-existing halt), not for what reads as inert (`no-action`, which spun forever). Pair it with a "seam never dispatched" guard. | new `docs/_decisions/DECISIONS-seam-defaults.md`; CLAUDE.md §runtime-adapter |
| 8 | **Clarify what `validatePlanContract` actually validates** (task-id bijection only, never file paths) and where ownership really bites (the wave commit stages exactly `task.files`). | CLAUDE.md §Phase graph / §Implementation waves; `se-author` |
| 9 | **PLAN authoring: no RED-terminal waves.** Document the two workable shapes against the script-owned gate. | `se-author` skill; CLAUDE.md §Implementation waves |
| 10 | **Make the `Scope:` tag structural.** Either block on it for `CROSS-REVIEW-*` in `check-scope-field.sh`, or make it a column of the findings table in the four review skills. | hook + review skills |
| 11 | **Silence the untracked-file document-oracle red** (`.tokensave/`, `pdlc/workflows/coverage/`) via gitignore or an oracle skip list, rather than a standing CLAUDE.md caveat that every reviewer re-derives. | `.gitignore` / `pdlc/workflows/lib/document-oracles.mjs` |
| 12 | **BL-01 remains open**: the `"fable"` model alias is unverified against a live runtime. Recorded honestly in `MANUAL-VERIFICATION-pdlc-advisory-tier.md` (`RESULT: unverified — no runtime available`) and bound at `pdlc/RELEASE-CHECKLIST.md` §4c. The tier ships correctly on either rung by AC-1.2/AC-1.3 construction with AC-1.4 keeping a wholly unresolvable configuration a loud failure — but the checklist item must actually be discharged before release. | `pdlc/RELEASE-CHECKLIST.md` §4c (already bound; flagged so consolidation does not lose it) |
| 13 | **Deferrals D-ADV-01 / D-ADV-03 / D-ADV-05** (widen the envelope, learned confidence calibration, per-seam model selection) are bound to `docs/_queue/QUEUE.md` row `Order 15` (`pdlc-consolidation-agent`). D-ADV-02 / D-ADV-04 are declared Closed, not deferred. | `docs/_queue/QUEUE.md` row 15 |
| 14 | **Residual low doc-drift, unfixed at harvest** (DoD v3, both documentation-only): `TSPEC-pdlc-advisory-tier.md:324,:329` still declares `resolveAdvisoryRung`'s `prompt` as a second positional parameter rather than a fourth deps-bag property, and `:340`'s `MODEL_ERROR_RE` snippet drops the load-bearing `\w*` suffixes. `:354` cites the M-3 halt at `dev:1755` (actually `:1868`). Behaviour is correct and tested; the declared contract is not. | `docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md` — one file, three edits, no production change |
| 15 | **`distilAdvisoryRecord` is named in the PLAN export inventory** (`PLAN:686`, `:723`) but does not exist; the distil step is an agent dispatch per TSPEC §9.3, which is what shipped. PLAN drift only. Likewise the guard script's new `[class: …]` suffix token has no parsing consumer — harmless, but the stated consumer does not exist. | PLAN inventory correction; `guard-harvest-before-delete.sh` / TSPEC §9.3 wording |

## 6. Approval Record

Copied verbatim out of the `CROSS-REVIEW-*` files before deletion — never recomputed. Rounds whose
cross-review carries no `APPROVAL-HASH:` / `REVIEWED-COMMIT:` anchor pair contribute no row (this
includes several approving rounds that reached terminal without an anchor append, notably
`product-manager-PLAN-v6`/`-v9`, `test-engineer-PLAN-v8`/`-v9`, `product-manager-TSPEC-v1`/`-v3`,
`test-engineer-TSPEC-v3`, `software-engineer-FSPEC-v4`/`-v7`, `test-engineer-FSPEC-v7`,
`product-manager-PROPERTIES-v2`/`-v5`, `software-engineer-PROPERTIES-v5`, and both final-codebase
rounds, which are Phase CR artifacts rather than anchored document approvals).

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 3 | software-engineer | Approved with minor changes | sha256:5b5fa9e2bfc7ef52bccba2b33ef789bbeb9375fa35149a712e5a564cba6de053 | b81d7d4c7bad4b5c2ef24754cdc6c63bce642487 |
| REQ | 3 | test-engineer | Approved with minor changes | sha256:5b5fa9e2bfc7ef52bccba2b33ef789bbeb9375fa35149a712e5a564cba6de053 | b81d7d4c7bad4b5c2ef24754cdc6c63bce642487 |
| REQ | 4 | software-engineer | Approved with minor changes | sha256:d6693f42aaab38e3da6ddc0fbcfc1d34f1e58c2bd3464f0801668383b224aeac | 728d98708d752a59feffd9854df1c6e2be9b072e |
| REQ | 4 | test-engineer | Approved with minor changes | sha256:d6693f42aaab38e3da6ddc0fbcfc1d34f1e58c2bd3464f0801668383b224aeac | 728d98708d752a59feffd9854df1c6e2be9b072e |
| FSPEC | 3 | software-engineer | Approved with minor changes | sha256:add0010006f28fe715ea861cb150ee2bda4a54cdd63c32fab011eb56a7d3d8f6 | 502c070f77c65d033c7a300ca53fdfd3a1f2cce5 |
| FSPEC | 3 | test-engineer | Approved with minor changes | sha256:add0010006f28fe715ea861cb150ee2bda4a54cdd63c32fab011eb56a7d3d8f6 | 502c070f77c65d033c7a300ca53fdfd3a1f2cce5 |
| FSPEC | 5 | software-engineer | Approved with minor changes | sha256:179c3fe23b3ec6ed594b22e25805420363e5231da708f51969fdba1a4ce1e3e3 | 70027d2b61e28569f05873514265b68c40b31ba0 |
| FSPEC | 5 | test-engineer | Approved | sha256:179c3fe23b3ec6ed594b22e25805420363e5231da708f51969fdba1a4ce1e3e3 | 70027d2b61e28569f05873514265b68c40b31ba0 |
| FSPEC | 6 | software-engineer | Approved | sha256:7edebd8c03ce3a22dbbabb0221628055ff1e656e3630458e1fdb9a00c2c8fc8c | 08925cf1964979ef3261ed6aca99361da33d2b31 |
| FSPEC | 6 | test-engineer | Approved | sha256:7edebd8c03ce3a22dbbabb0221628055ff1e656e3630458e1fdb9a00c2c8fc8c | 08925cf1964979ef3261ed6aca99361da33d2b31 |
| FSPEC | 8 | software-engineer | Approved | sha256:34cdc04e0fbbc7415e60c1994c6e11066f8ceffcf74cdaa937718bbc7979477d | 85ac394e2ffadd9c5a83c2ca49a586c1b66ed844 |
| FSPEC | 8 | test-engineer | Approved | sha256:34cdc04e0fbbc7415e60c1994c6e11066f8ceffcf74cdaa937718bbc7979477d | 85ac394e2ffadd9c5a83c2ca49a586c1b66ed844 |
| TSPEC | 4 | test-engineer | Approved | sha256:dae4d0e115a2c146c797ff76728180eb60d27318d531d7a1a1b67cd1b234efec | e067f5e6429a1903b32bb44796b87d202d829353 |
| TSPEC | 5 | product-manager | Approved | sha256:1bfae603bb947d36fc8bda73a5d94e310643413075bdf59ad06885c1bbe260a0 | b198f1aa8b5a08b6e4eae6adcbe8bd749da7b2ae |
| TSPEC | 5 | test-engineer | Approved | sha256:1bfae603bb947d36fc8bda73a5d94e310643413075bdf59ad06885c1bbe260a0 | b198f1aa8b5a08b6e4eae6adcbe8bd749da7b2ae |
| TSPEC | 6 | product-manager | Approved | sha256:9f97e3cda8ad6dac04ec72f6ab5a2b5951de737082e64b965104e8b1b81466bd | ef2404fecc698c5601b0c8f4935b35750b08bd3a |
| TSPEC | 6 | test-engineer | Approved | sha256:9f97e3cda8ad6dac04ec72f6ab5a2b5951de737082e64b965104e8b1b81466bd | ef2404fecc698c5601b0c8f4935b35750b08bd3a |
| TSPEC | 7 | product-manager | Approved | sha256:e72403f41d0d6253cc481a89735b2a70364252801dd79b63be4ffb63943bb349 | 2e8227e5abe47472ad240da842e38fb96c32b119 |
| TSPEC | 7 | test-engineer | Approved | sha256:e72403f41d0d6253cc481a89735b2a70364252801dd79b63be4ffb63943bb349 | 2e8227e5abe47472ad240da842e38fb96c32b119 |
| PLAN | 5 | product-manager | Approved with minor changes | sha256:8e777d90dd54b450b7c9c423a5ecb4dd6ca88ce4401eb7ee7214d53454c09e5d | bc6dccf99a7d5d1b0c2eaf0dd138e3de3f5eed71 |
| PLAN | 5 | test-engineer | Approved with minor changes | sha256:8e777d90dd54b450b7c9c423a5ecb4dd6ca88ce4401eb7ee7214d53454c09e5d | bc6dccf99a7d5d1b0c2eaf0dd138e3de3f5eed71 |
| PLAN | 7 | test-engineer | Approved with minor changes | sha256:f441d5070ac2a8569bd30d1bc5da2653d5b5658e00bdf1dcbb18c7aca6728690 | 08925cf1964979ef3261ed6aca99361da33d2b31 |
| PLAN | 10 | product-manager | Approved with minor changes | sha256:db8c053710f68585c679a991e54acbad81a1c97d0da75690d3a7a1211a59fd82 | 10d875dd9729aac5ffba533e144b6582425e4b61 |
| PLAN | 10 | test-engineer | Approved with minor changes | sha256:db8c053710f68585c679a991e54acbad81a1c97d0da75690d3a7a1211a59fd82 | 10d875dd9729aac5ffba533e144b6582425e4b61 |
| PROPERTIES | 3 | product-manager | Approved with minor changes | sha256:839ec022a3220a12f9ec91df9a02543b55c8b267a76c6731ee971f776cd65428 | fd4bcedb787783039189cef0c4b7d36376ba9a57 |
| PROPERTIES | 3 | software-engineer | Approved with minor changes | sha256:839ec022a3220a12f9ec91df9a02543b55c8b267a76c6731ee971f776cd65428 | fd4bcedb787783039189cef0c4b7d36376ba9a57 |
| PROPERTIES | 6 | product-manager | Approved with minor changes | sha256:50ff2771791ac33c7345460734dc4eb1c96f215e36aff3b09350936e4db09f85 | 4df1f7b13030121c0eaf23057c3b12100ba0cba8 |
| PROPERTIES | 6 | software-engineer | Approved with minor changes | sha256:50ff2771791ac33c7345460734dc4eb1c96f215e36aff3b09350936e4db09f85 | 4df1f7b13030121c0eaf23057c3b12100ba0cba8 |
| DECISIONS | 2 | product-manager | Approved with minor changes | sha256:5dcf04002d363c175e2aaae7e20c67f1036640c1d8e26ad4a7056b322bc19d91 | 67aceb23704f44ac29f6ef980dd4651748bb199a |
| DECISIONS | 2 | test-engineer | Approved with minor changes | sha256:5dcf04002d363c175e2aaae7e20c67f1036640c1d8e26ad4a7056b322bc19d91 | 67aceb23704f44ac29f6ef980dd4651748bb199a |
| DECISIONS | 3 | product-manager | Approved | sha256:13ad2e44f413d7a80250cf7a9b0bddc6b0bffa3a489ae85018a30a72a1860a85 | 08925cf1964979ef3261ed6aca99361da33d2b31 |
| DECISIONS | 3 | test-engineer | Approved | sha256:13ad2e44f413d7a80250cf7a9b0bddc6b0bffa3a489ae85018a30a72a1860a85 | 08925cf1964979ef3261ed6aca99361da33d2b31 |

32 anchored approving rounds recorded.
