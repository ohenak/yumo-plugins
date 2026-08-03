# LEARNINGS — pdlc-merge-phase

| Field | Detail |
|---|---|
| Feature | pdlc-merge-phase |
| REQ | docs/completed/pdlc-merge-phase/REQ-pdlc-merge-phase.md |
| Date Completed | 2026-08-02 |
| Total Iterations | REQ: 2, FSPEC: 3, TSPEC: 3, PLAN: 2, PROPERTIES: 2, CODE (final review): 2, IMPL: 1 (17 tasks / 12 waves, no re-plan) |
| Upstream | REQ → FSPEC → TSPEC → PLAN → PROPERTIES → IMPL (DECISIONS: not warranted, TSPEC §15.4 `DECISIONS_WARRANTED: no`) |
| Harvested from | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-software-engineer-REQ-v2.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v2.md`, `CROSS-REVIEW-software-engineer-FSPEC-v1.md`, `CROSS-REVIEW-software-engineer-FSPEC-v2.md`, `CROSS-REVIEW-software-engineer-FSPEC-v3.md`, `CROSS-REVIEW-test-engineer-FSPEC-v1.md`, `CROSS-REVIEW-test-engineer-FSPEC-v2.md`, `CROSS-REVIEW-test-engineer-FSPEC-v3.md`, `CROSS-REVIEW-product-manager-TSPEC-v1.md`, `CROSS-REVIEW-product-manager-TSPEC-v2.md`, `CROSS-REVIEW-product-manager-TSPEC-v3.md`, `CROSS-REVIEW-test-engineer-TSPEC-v1.md`, `CROSS-REVIEW-test-engineer-TSPEC-v2.md`, `CROSS-REVIEW-test-engineer-TSPEC-v3.md`, `CROSS-REVIEW-product-manager-PLAN-v1.md`, `CROSS-REVIEW-product-manager-PLAN-v2.md`, `CROSS-REVIEW-test-engineer-PLAN-v1.md`, `CROSS-REVIEW-test-engineer-PLAN-v2.md`, `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`, `CROSS-REVIEW-product-manager-PROPERTIES-v2.md`, `CROSS-REVIEW-software-engineer-PROPERTIES-v1.md`, `CROSS-REVIEW-software-engineer-PROPERTIES-v2.md`, `CROSS-REVIEW-product-manager-CODE-v1.md`, `CROSS-REVIEW-product-manager-CODE-v2.md`, `CROSS-REVIEW-test-engineer-CODE-v1.md`, `CROSS-REVIEW-test-engineer-CODE-v2.md`, `CODE_REVIEW-pdlc-merge-phase-v1.md`, `CODE_REVIEW-pdlc-merge-phase-v2.md`, `CODE_REVIEW-pdlc-merge-phase-v3.md`, `CR-ERRATA.md` — 32 files, all deleted by this harvest |
| DoD rounds | 3 (`CODE_REVIEW-…-v1` → `-v2` → `-v3` Pass) |
| POSTMORTEMs | none — no review loop reached `MAX_REVIEW_ROUNDS` |

## 1. Non-Convergences

No loop exhausted its round budget and no POSTMORTEM was written. Two loops took the full three
rounds; both are recorded here because *where* the third round went is the reusable signal, not
because either failed to converge.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| FSPEC | test-engineer | Round 1 closed nine findings, but the *fix* to round 1's exclusivity defect created round 2's F-10: with `O1` now observed exactly once at row 4, an unparseable `mergeable` / `mergeStateStatus` matched **no** row in the §11 table and was prescribed `refused` by §3.2 and `deferred` by §2.3 7c simultaneously. Asserting exhaustiveness is what exposed the hole | v1.2 split §2.3 7c the way 7e was already split (`refused` on unparseable, `deferred` on retrieved-and-not-`MERGEABLE`) and added the matching §11 row. Approved v3 | 3 |
| TSPEC | product-manager + test-engineer | Round 1 found the row-table suite assigned to a function that structurally could not produce its assertions (`decideMerge` has no `queueWritten`, no seam traffic), `row` ids mixing two different numbering schemes, a config key silently renamed (`mergeableRetryDelay` → `…Seconds`), and a decision-step bound reachable from configuration. Round 2 closed those; round 3 was a small confirmation pass over the §5.5 row-5 `O4` delta | v1.2 drove the whole row table through `phaseMerge`, restored the REQ/FSPEC config key, clamped the retry bound. Both roles approved v3 | 3 |

The generalisable point: in both loops the third round existed because a **round-2 fix tightened a
claim** (exhaustiveness; a single observation point), and tightening a claim is exactly what makes
the previously-invisible uncovered case visible. That is the loop working, not the loop stalling.

## 2. Cross-Feature Patterns

Findings that constrain work beyond this feature. Several were tagged `Local` by their reviewer but
reference a repo-wide mechanism or a sibling surface; those are re-routed here per the under-tagging
rule, and the tagging gap itself is recorded in §4.

| Finding | Suggested Promotion Target |
|---|---|
| **A seam two components write needs one owner, named in the spec.** `orchestrate-queue`'s `runPicked` rewrote the feature's status to `awaiting-merge` *after* `orchestrate-dev` returned — so Phase MERGE's `done` was silently overwritten and then git-committed, on exactly the path the feature existed to serve. Found at REQ altitude (SE-REQ F-01) only because the reviewer read the driver's post-pipeline write. Any REQ that adds a writer to an already-written artifact must name the existing writer in §5 Scope and state the precedence | docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **Disposition vocabularies must describe the *operation*, not one caller's status.** The queue recording seam shipped as `_recordHalt` / `defaultRecordHalt` returning `"halted" \| "halted (uncommitted)" \| "none" \| "error"`. Reused to record `done`, every member went vacuous or false. The rename to `_recordQueueRow` / `QUEUE_ROW_DISPOSITIONS` (`recorded`, `recorded (uncommitted)`, `none`, `error`) touched six test files, one shared helper and two frozen closed name-sets — the rename surface was itself under-scoped by the PLAN (TE-PLAN F-01) | docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **A renamed closed catalogue leaves vacuous transcriptions behind.** Four unrelated phase suites carried `const QUEUE_ROW_DOMAIN = ["halted", …]` — hand-copied literals. After the rename they still passed, because the default double returns `"none"`, a member of *both* catalogues. Vacuous, not red (DoD v1 finding 2). Fix and rule: assert against the **imported** frozen catalogue so the next rename reds instead of going silent | docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **An oracle whose expected value is produced by the code under test is not an oracle.** Every assertion on `MERGE_ESCALATIONS.tree` / `.queue` was `expect(lines).toEqual([MERGE_ESCALATIONS.queue(…), …])` — both sides resolving to the same frozen catalogue. Garbling both templates in the source left **the entire ~2 930-test suite green**. Two operator-facing sentences the FSPEC pins verbatim could be reworded and ship. Measured, not argued, in both directions: after two literal-text assertions landed, the identical garble reds two named tests | docs/_constraints/DOMAIN-CONSTRAINTS.md; te-review skill |
| **Differential goldens must be captured before the change and never regenerated.** TSPEC §13.5 originally asserted the no-evidence call was "byte-identical to the shipped implementation's output" — self-comparison after the change (TE-TSPEC F-11). Corrected to goldens captured from `updateQueueStatus` at HEAD *before* the change, one per `QUEUE_STATUSES` member, and the PLAN's `F1 → B1 → B2` chain made the ordering structural rather than a discipline. Verified at review time from git history: the fixtures directory has exactly one commit (F1), an hour before B2 | docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **`jest`'s `testPathIgnorePatterns` contains `/__tests__/helpers/` — a self-test colocated with a helper is never collected.** PLAN F1 placed `helpers/mergeDoubles.test.js` beside the doubles it proves; the "red first" self-test of the doubles *and the goldens* would silently never have run (SE-PROPERTIES F-07). Rule: helper self-tests live in `__tests__/` proper. No existing helper has a colocated test, for exactly this reason | docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **An operator note must be gated on the fact it asserts, not on a neighbouring disposition.** The FSPEC §8.2 "Local `{defaultBranch}` is ahead of its remote by the queue-row commit" note fired whenever the queue write reported `recorded` — which was true on three paths where the sentence was false: a failed tree update (the commit is on the feature branch), the §2.5 non-overwrite case (no commit exists, and the contradicting note printed beside it), and `defaultBranch === null` (emitting "Local **null** is ahead…"). Gate the note on `tree.ok && defaultBranch && !(rec && rec.detail)` — narrow the claim, do not delete the promise | docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **A diff that falsifies a shipped claim falsifies it everywhere it is written.** "The pipeline never auto-merges" was stated in six places; the DoD sweep (v1 findings 3–8, `boundary_gaps: 7`) found all six. The highest-severity member was `pdlc/skills/orchestrate-queue/SKILL.md` — **a prompt an agent reads**, not operator prose. Rule: when a diff falsifies a disclosure, grep the claim's own words across skills, CLAUDE.md, README and QUEUE.md, and rank agent-read prompts first | docs/_constraints/DOMAIN-CONSTRAINTS.md; dod-verify skill |
| **Correcting a disclosure invites over-claiming the replacement.** The v1 remediation's new Phase MERGE prose said any failure "is reported as a `MERGE ESCALATION:` notice" — but only four named conditions escalate; every `deferred` row carries `escalations: []` and one plain note. An operator told to grep `MERGE ESCALATION:` after a CI-pending deferral finds nothing. The same paragraph miscounted "six preconditions" and omitted a real one. Documentation remediation needs the same criterion-6 check as the original diff (DoD v2 finding 1) | dod-verify skill; docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **A safety control whose defaults are authoring-repo paths is inert everywhere else while still reporting as present.** `pdlc/workflows/` + `pdlc/skills/` never match a PR in a consuming repo, where the pipeline lives in the installed plugin and `.claude/workflows/` (TE-REQ F-08, SE-REQ F-04) — and the "defaults are additive and unremovable" guarantee then protects nothing there. Resolved by adding `pdlc/hooks/` and `.claude/workflows/` to the frozen defaults. Any future path-matching guard must state the outcome it protects, then enumerate defaults to reach it in *both* deployment shapes | docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **NFRs must be written against the runtime that actually ships.** "No LLM participates in the decision to merge" and "no new agent dispatch" were unsatisfiable as written: in the workflow runtime every `gh` / `git` call *is* an agent dispatch (SE-REQ F-02). Restated as "no LLM **judgment** participates — every transcribed observation is parsed by tested module code and anything that does not parse fails closed" and "no new **reasoning** dispatch". The restatement is testable (`phaseMerge` takes no `_agent` parameter at all) where the original was not | docs/_constraints/DOMAIN-CONSTRAINTS.md |
| **`parsePlanTasks` over-parses: its header matching is loose substring containment.** Both shipped PLANs in `docs/completed/` parse to **289** and **247** "tasks" and throw `PLAN dependency graph contains cycle`. The mechanism is header capture — a column named `forbids` matches `includes("id")`, `depends on` matches `includes("depend")` — so an ordinary *data* row in a risk register can be swallowed as a task table. This PLAN found the hazard against its own §8 and defused it by rewording those headers, and added a DoD checkbox that re-runs `parsePlanTasks` + `computeTopologicalBatches` after any edit above §12. Rule for PLAN authors: **parse-verify the document you wrote** — do not assume the parser sees the table you see | docs/_constraints/DOMAIN-CONSTRAINTS.md; se-author skill |
| **A ticked Definition-of-Done box is a claim, not evidence.** TSPEC §13.3 required the suite to assert its own case count is 25 "so a dropped row is a failure rather than an absence"; PLAN §11 recorded that box `[x]`. What shipped asserted the *test-local id list* had 25 members — a check on the list, not on coverage. All 25 rows genuinely had cases, but deleting any one of them left the suite green: the anti-rot device was the missing thing and it was the thing the box claimed. Rule: a checklist box naming a falsifiability device must cite the assertion, and the verifier must mutate rather than read | docs/_constraints/DOMAIN-CONSTRAINTS.md; dod-verify skill |
| **The generated-artifact chain has one link CI cannot see.** `build-runtime.mjs --check` was green while the untracked consumer copy under `.claude/workflows/` still held pre-merge-phase bundles — so the new phase was in `dist/` but unreachable from the runtime, and the queue's own drift gate would have refused the next invocation before reading `QUEUE.md` (DoD v1 finding 1, the sole `unwired_integrations`). A feature that changes the bundle is not landed until `sync-workflows.sh --check` exits 0 | docs/_constraints/DOMAIN-CONSTRAINTS.md; PLAN template verification step |

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Export a `ROW_IDS` catalogue from the module and have the properties assert `row ∈ ROW_IDS` | software-engineer (PROPERTIES F-03) | A membership oracle read from the implementation's own catalogue passes vacuously under exactly the row-id mutation it exists to catch. Kept as a **test-local frozen transcription of FSPEC §11's 25 ids**, with the reasoning recorded in the test file | Yes — the general rule: never source an oracle's expected set from the code under test |
| Assert `COVERED_ROWS.length === 25` to close the row-completeness gap | test-engineer (CODE v2) | A count is satisfied by a duplicated id. Set-equality against the id list catches a dropped row *and* a mistyped one | Yes |
| Change `decideMerge` to match TSPEC §5.3's stated guard 22/23 order | product-manager (CODE v1 finding 2, → CR-ERRATA item 1) | The **code is right and the table is wrong**: under the TSPEC's order a success with an untried candidate still in the chain triggers a second `gh pr merge`. Shipped behaviour matches FSPEC §6.2 and NFR-2. Table-only fix, deferred to a TSPEC revision | Yes — when code and spec disagree, decide which is authoritative *before* writing the fix |
| Change row ids to `number` to match TSPEC §2.4's `number \| string` and PROP-M-17's `row === 3` | product-manager (CODE v1 finding 4, → CR-ERRATA item 2) | Every row id ships as a string and code and tests are internally consistent. One line in §2.4 retires the ambiguity; changing the code would churn a whole suite to satisfy a doc | Yes |
| Escalate the §2.5 non-overwrite case (PR merged, row not `done`) instead of emitting a plain note | product-manager (CODE v1 finding 5, → CR-ERRATA item 3) | FSPEC §7.4 and §11 row 18 sanction it deliberately: the row describes work this run did not drive, and overwriting would destroy the operator's own record. **This is the one residual gap between US-05's promise and the shipped behaviour** — recorded so the next queue stall on a `blocked` row is diagnosed in seconds rather than rediscovered | Yes, and it is a live diagnostic hint |
| "Fix" `mergeMode: "off"` by shipping `gated` so the merged path is exercised end to end | dod-verify (v1 Notes, explicit instruction to the remediator) | `off` is the **specified shipped state** (AC-7.2: a repo does not begin auto-merging until its operator opts in), and REQ §6 BL-04 pre-registers that the `merged` path cannot run end-to-end in `yumo-plugins` at all, because the self-modification guard fires on every PR this queue raises. The path is evidenced by the row-table and two-invocation selection tests — the evidence standard the REQ itself specifies | Yes — "never observed in this repo" ≠ "never worked"; say so in the REQ up front |
| Merge queues / batched merges (D-MERGE-03) | REQ §7, confirmed at DoD | Declined by design, not deferred: a serial queue makes it unnecessary at current scale. Recorded as declined rather than counted as an unbound deferral | Yes — distinguish *declined* from *deferred*; only the latter needs a successor queue row |
| Split every PLAN task into a separate red-test row per the SKILL's rule | product-manager (PLAN v1 finding 3, accepted deviation) | `orchestrate-dev.js` is touched by nine tasks and rule 2 already serialises same-file tasks into their own batches, so the split would take 17 rows to 34 and 12 batches to ~23 with no new concurrency to order. The PLAN **declared** the deviation and preserved the underlying property by naming each row's red-first acceptance tests — which is why the PM's blocking finding (two ATs with no owning task) had to close first | Yes — a declared deviation that preserves the property is acceptable; an undeclared one is not |
| File `CLAUDE.md:167`'s unqualified lifecycle sentence, and the compressed "CI evidence refused" label, as DoD findings | dod-verify (v2 and v3 Notes) | Both were recorded with reasoning rather than filed, so the next reviewer does not re-derive the question: the enclosing paragraphs route the reader correctly in every case, and the authoritative domain is pinned by REQ AC-6.1a/AC-6.2a and `PROP-M-19`. A remediation round costs more than the imprecision | Yes — "recorded, deliberately not filed, and here is why" is a better artifact than silence |
| Change the code to close the `MERGE_NOTES`/`MERGE_ESCALATIONS` echo problem by restructuring the catalogue | test-engineer (CODE v1 finding 2) | The catalogue is right; the *assertions* were the defect. Two literal-text assertions mirroring the existing guard-escalation anchor, plus six for the notes — roughly a dozen lines, no new scope, and the repo already contained the pattern twice | Yes |

## 4. Process Learnings

**Reviewers executed probes instead of reading, and it changed every phase's outcome.** This is the
single strongest process signal of the run, and it recurs in five independent forms:

- **Mutation, in both directions.** The TE garbled two escalation templates in the source and ran the
  whole suite (green — the finding); after remediation the TE re-ran *the same* garble (two named
  reds — the closure). "The v1 evidence and the v2 evidence are the same experiment with opposite
  outcomes" is a closure standard worth copying. A second mutation — dropping one member of
  `MERGE_GUARD_DEFAULTS` — reddened 1 087 tests and named the guard's two-arm test by line, which is
  what confirmed the central safety pillar was load-bearing rather than decorative.
- **Running the parser over the document.** The TE imported the real `parsePlanTasks` +
  `computeTopologicalBatches` and fed the PLAN to them: 17 tasks, 12 waves, every `Batch` column
  equal to its derived wave, no cycle, no "batch labels inconsistent" warning. The PLAN's claims
  about *other* PLANs (289 and 247 tasks) reproduced exactly.
- **Re-running the reproduction against the patched module.** The PM re-drove all four
  ahead-of-remote fixtures through the fixed code rather than reading the diff, and checked the
  *positive* arm too — the fix narrowed the note to the case where it is true instead of deleting an
  operator-facing promise.
- **Checking provenance from git history.** Golden fixtures were confirmed captured before the change
  by reading the fixtures directory's commit history (one commit, F1, an hour before B2) — a
  stronger check than any assertion in the suite.
- **Re-executing the gate.** The DoD verifier re-ran `sync-workflows.sh --check` and a catalogue
  mutation itself rather than accepting the remediation commit message: "verified by mutation, not by
  reading".

**Absence-only oracles were caught at three different altitudes.** FSPEC AT-M3's control arm asserted
"not-refused" (satisfied by `skipped`, by an unrelated broken precondition, by an exception path);
the fix pinned the positive terminal value on every arm. The same instinct then showed up as a
*rule* in the implementation: every new absence assertion in the CR remediation was paired with a
positive conjunct. Worth carrying: **an absence assertion needs a positive neighbour in the same
case.**

**Two named review-round costs were avoidable and specific to authoring discipline.** (a) A config
key documented in the REQ and FSPEC (`mergeableRetryDelay`) was renamed in the TSPEC to
`mergeableRetryDelaySeconds`; because the config reader falls back per key *silently*, an operator
following the approved documents would have got the default with no warning. Renaming an
operator-facing key is a product decision, not a TSPEC tidy-up. (b) A rename task's surface was
scoped by grepping only the files the author remembered; the actual surface included a shared helper,
two frozen closed name-sets and two harness *injection* lines — and missing an injection line makes
tests fall through to a no-op default and pass vacuously rather than fail loudly.

**Pre-registering a known environmental failure paid for itself three times.** The
`documentOracles` red from the untracked `.tokensave/` directory was documented in CLAUDE.md and
pre-registered as PLAN §8 K-6. Every one of the three DoD rounds and both CODE cross-reviews hit it,
recognised it in one line, and moved on, instead of re-deriving it or "fixing" the oracle. The
underlying defect is real and cross-feature: `coveredViolations` walks the whole tree including
untracked files, so any local tool cache can red a document oracle for reasons unrelated to the diff
(see §5).

**CR-ERRATA.md worked as a routing artifact and should be reused.** Three CODE-round advisories were
document-shaped, not code-shaped: a TSPEC table that disagrees with correct code, a type declared
`number | string` that ships as a string, and a sanctioned product gap. Editing approved specs
mid-implementation is wrong; dropping the findings is worse. Writing them to a tracked
`CR-ERRATA.md` that harvest picks up alongside the cross-reviews is the right third option — the
DoD verifier explicitly confirmed the items "have a home… no queue row needed".

**Scope tagging was uneven, and this harvest re-routed findings.** The DoD `CODE_REVIEW-*` files
carried a per-finding `Scope` column and used it well (`Process`, `Cross-Feature`). The spec-phase
cross-reviews carried a per-finding `Scope` column but tagged almost everything `Local`, including
findings about `jest` configuration, the PLAN parser, seam vocabulary shared by four other phases,
and guard defaults that behave differently in consuming repos — all repo-wide mechanisms. The two
final-codebase PM reviews carried a document-level `Scope:` line and **no per-finding tags at all**.
Roughly eight `Local`-tagged findings were re-routed to §2 above on the under-tagging rule. Worth
fixing at the skill level: the review skills should prompt "does this finding name a file outside
this feature's directory? then it is at least a candidate `Cross-Feature`".

**Three iterations at FSPEC and TSPEC, and both were productive rather than churn** — see §1. The DoD
loop converged in three rounds where rounds 2 and 3 changed **documentation only** (nine files
+42/−23, then two files/two lines); no production source was touched after the CR remediation. That
shape — one substantive round then two prose rounds — suggests the criterion-6 adjacent-surface sweep
is where DoD effort actually lands for a pipeline-modifying feature, and that it is worth running
that sweep *before* the first DoD round rather than discovering six stale sites in it.

## 5. Open Items for Consolidation

Candidates for promotion. This harvest is not authorised to promote any of them; `consolidate-learnings`
decides.

| # | Item | Why it needs a decision above this feature |
|---|---|---|
| 1 | **TSPEC errata, unapplied.** (a) §5.3's guard 22/23 ordering table contradicts correct code; (b) §2.4 declares `row: number \| string` while every row id ships as a string, and `PROPERTIES` PROP-M-17 still writes `row === 3`. Both are table-only fixes explicitly marked "do not change the code" | The TSPEC is the document the next author transcribes. Either revise it or record that approved specs are frozen post-approval and errata live in LEARNINGS — the project currently does both |
| 2 | **US-05's residual gap.** PR merged + queue row in `pending`/`blocked`/`halted` ⇒ the row is deliberately not overwritten and the operator's only signal is a plain note, not an escalation | A sanctioned exception to a user-story guarantee should be recorded once at project level, not rediscovered per feature. Candidate: `docs/_decisions/` |
| 3 | **`coveredViolations` walks untracked files.** A local tool cache (`.tokensave/`) reds a document oracle for reasons unrelated to any diff; green in CI, red locally, and every reviewer this run had to be told why | Repeated across features and already documented as a workaround in CLAUDE.md. Either narrow the walk to tracked files or make the false positive a first-class, named skip |
| 4 | **`jest` never collects `__tests__/helpers/**`.** Any helper self-test placed beside its helper silently does not run | Repo-wide `package.json` configuration fact with a silent failure mode. Belongs in DOMAIN-CONSTRAINTS, not in one feature's PROPERTIES review |
| 5 | **"No implementation-echo oracles" as a stated constraint.** The team had *articulated* the principle in a comment in this very suite (`ROW_IDS` deliberately avoids the trap) and still shipped eight echo assertions in a neighbouring file | The gap is between knowing the rule and applying it uniformly — which is what a promoted constraint plus a `te-review` checklist item is for |
| 6 | **`parsePlanTasks` robustness.** Loose substring header matching lets a data row be captured as a task table; two shipped PLANs parse to hundreds of "tasks" and throw on cycle detection | Either harden the parser or make "parse-verify your PLAN" an `se-author` obligation with the command written down. Today it is a workaround rediscovered per PLAN |
| 7 | **Seam/disposition naming rule.** `_recordHalt` → `_recordQueueRow` cost a six-file rename because the seam was named for its first caller's status | Cheap rule, broad application: name a seam and its return catalogue for the *operation*, not the caller |
| 8 | **PLAN §8 K-1 is still open by design.** The two-runner `git --version` reading (`git rebase --empty=drop` needs ≥ 2.26) is deferred to the first CI run; the plain-`rebase` fallback is pre-approved with no re-review. Failure mode is fail-safe — an AC-5.7 escalation, never a wrong merge decision | Someone must actually read the two CI readings and close K-1, or the deferral decays into an assumption |
| 9 | **Tier-1 approval anchors were not produced this run** — see §6. No `APPROVAL-HASH:` / `REVIEWED-COMMIT:` line exists in any of the 28 cross-review files | If anchors are meant to be routine, the workflow's post-terminal append needs to be doing it; if they are optional, the harvest checklist should say so |
| 10 | **Deferral bindings, for the record.** D-MERGE-01/02 → `pdlc-advisory-tier` (queue row 14); D-MERGE-04/05 → `pdlc-engineering-loop` (queue row 16); D-MERGE-03 declined by design | Both successor rows pre-exist and depend on this feature. Consolidation should confirm they still carry the deferrals when those features are picked up |

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round, copied out of the
`CROSS-REVIEW-*` files before they were deleted.

**Anchor availability — stated explicitly, because every cell is degraded.** No cross-review file in
this feature carried an `APPROVAL-HASH:` or `REVIEWED-COMMIT:` line; the tier-1 anchors were never
computed or appended during this run. Per the harvest rule ("copy, never recompute"), **Approval
Hash is `unavailable` on every row** — a harvest-time digest would hash the document as it stands
*after* the phase and turn every harvested approval into a false "fresh" one. For **Reviewed
Commit** the value recorded below is the commit that introduced the review file itself, taken from
`git log -1 -- {file}`; it is a provenance pointer to the reviewed bytes, **not** a copied
`REVIEWED-COMMIT:` anchor, and should not be read as one. This section is best-effort by design and
excluded from the completeness criterion — its degradation is reported here, never a halt.

Rows are ordered by document type in pipeline order, then round ascending, then role slug ascending.
`CODE` (the final codebase review) is not one of the six pipeline document types; its two approving
rounds are recorded last so no approving cross-review is dropped.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 2 | software-engineer | Approved | unavailable | 6ab85fe |
| REQ | 2 | test-engineer | Approved | unavailable | 6ab85fe |
| FSPEC | 2 | software-engineer | Approved | unavailable | 88a6fd2 |
| FSPEC | 3 | software-engineer | Approved | unavailable | 13e80d9 |
| FSPEC | 3 | test-engineer | Approved | unavailable | 096e8d3 |
| TSPEC | 2 | product-manager | Approved | unavailable | 48bdb83 |
| TSPEC | 3 | product-manager | Approved | unavailable | 5f13f10 |
| TSPEC | 3 | test-engineer | Approved | unavailable | ddb32ba |
| PLAN | 2 | product-manager | Approved | unavailable | 9be4d3c |
| PLAN | 2 | test-engineer | Approved | unavailable | 3e699d2 |
| PROPERTIES | 2 | product-manager | Approved | unavailable | 49502b1 |
| PROPERTIES | 2 | software-engineer | Approved | unavailable | eecad57 |
| CODE | 2 | product-manager | Approved | unavailable | 74025ad |
| CODE | 2 | test-engineer | Approved | unavailable | 2788d6f |
