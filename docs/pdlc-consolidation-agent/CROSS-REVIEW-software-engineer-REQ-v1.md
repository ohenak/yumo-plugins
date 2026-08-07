# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 1
**Scope:** Local + Cross-Feature (technical lens: feasibility, implementability, existing-code claim verification, threshold declaration, integration boundaries)

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-3.7 asserts inheritance of a mechanism that cannot reach the object it names.** The self-modification guard is `guardVerdict` (`pdlc/workflows/orchestrate-dev.js:731`) over `effectiveGuardPaths` (`:708`), and it is called only from Phase MERGE of an `orchestrate-dev` run deciding whether to merge **that run's own feature PR** (`MERGE_MODES`, `:55`; `mergeStatus` ladder). Nothing in `yumo-plugins` evaluates an *inbound* PR opened by a foreign process — there is no receiving pipeline, no webhook, no branch-protection rule, no CI job that calls `guardVerdict`. The PR is in fact never auto-merged, but only because nothing auto-merges anything there; AC-3.7 as written is vacuous and untestable, and it reads as if a real control were in force. Either name the actual enforcement surface (branch protection / required review on the plugin repo) or restate AC-3.7 as a non-mechanism. | AC-3.7 |
| F-02 | High | Cross-Feature | **The routing predicate is not set-equal to the guard set it claims to inherit.** AC-3.1 and AC-3.7 enumerate two prefixes, `pdlc/skills/**` and `pdlc/workflows/**`. `MERGE_GUARD_DEFAULTS` (`pdlc/workflows/orchestrate-dev.js:48-53`) is four: `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/`. A promotion that edits a hook script therefore falls **outside** AC-3.1's routing and lands in no defined path — most sharply, the very threshold AC-1.2 depends on lives at `pdlc/hooks/scripts/nudge-consolidation.sh:25` (`THRESHOLD = 5`). Either enumerate the full four-member set or cite `MERGE_GUARD_DEFAULTS` by name so the two cannot drift; a two-member restatement of a four-member catalogue is exactly the containment-not-set-equality failure DC-01/DC-12 warn about. | AC-3.1, AC-3.7 |
| F-03 | High | Local | **The only real consumer is the plugin repo itself, and no AC covers that case.** `docs/_queue/QUEUE.md` states this queue is the pipeline's own queue and that every PR in it trips REQ-MERGE-03 because every one touches `pdlc/workflows/**` or `pdlc/skills/**`; D-CONS-02 concedes "one real consumer today". So for the shipping configuration, "the consuming repo" and "the configured plugin repository" are the same repository and the same working tree. AC-3.1 (open a PR against the plugin repo), AC-4.1 (a *cross-repo* credential), AC-4.4 (local `gh` auth) and NFR-4 (no duplicate PR) are all written for a two-repo topology and are undefined in the degenerate one: which branch is the promotion cut from when the tree is mid-pipeline on `feat-*`? Does the pass stash? This is a phasing/scope gap, not an oracle gap — it decides whether the feature is buildable at all today. | AC-3.1, AC-4.1, AC-4.4, §6 BL-03 |
| F-04 | High | Local | **AC-1.1's cadence names no mechanism, and the only candidate is deferred.** "Given a configured cadence, Then a consolidation pass runs without operator invocation" requires a scheduler. At HEAD the repo has none: `pdlc/hooks/hooks.json` carries only `PreToolUse` / `PostToolUse` / `SessionStart` entries — all of which are *operator-session-triggered*, so none can satisfy "without operator invocation". The one obvious candidate, a cloud Routine, is explicitly deferred by D-CONS-04. AC-1.2's volume trigger has the same problem: `nudge-consolidation.sh` only ever prints `additionalContext` at `SessionStart` (`:44-49`) — it cannot start anything. This is "technically possible ≠ implementable on the current architecture": name the trigger surface, or move AC-1.1 behind a named platform successor and let AC-1.2 ship as the operative trigger. | AC-1.1, AC-1.2, D-CONS-04 |
| F-05 | High | Local | **AC-1.3's serial refusal has no state, no location, and no crash recovery.** The queue's analogue — cited by the AC as "for the same reason the queue is" — is an `in-progress` row in `QUEUE.md`, found by `entries.find((e) => e.status === "in-progress")` (`pdlc/workflows/orchestrate-queue.js:630`), and its own header documents that such an entry "blocks new pickups **until a human resolves it**" (`:26-27`). Consolidation has no queue row and no equivalent marker. The REQ must say what records "in progress", where it lives, who clears it, and what happens when a pass dies mid-flight holding it — otherwise the first crash wedges the cadence permanently and silently. | AC-1.3 |
| F-06 | High | Local | **Three configured values are cited but never declared.** AC-3.1's "configured plugin repository", AC-5.5's "configured number of passes", and AC-1.1's cadence value all appear as inputs with no config key, no default, and no named owner. The established config surface is `.claude/pdlc.config.json` (today carrying only an `implementation` section; cf. `advisory.enabled`, `distribution.checkEnabled`, `merge.mergeMode` precedents). BL-04 leaves the cadence value open as OQ-E3 — an unresolved blocker cannot double as an AC input. Per the REQ review bar, an AC citing a configured threshold without a declared key + default + owner is a High finding and must be resolved before FSPEC. | AC-1.1, AC-3.1, AC-5.5, BL-04 |
| F-07 | High | Local | **AC-6.1's "first-class input" does not exist in any machine-readable form, and its source is deleted.** Three checks: (a) Phase H2's distil dispatch asks only for free prose — `"Append a summary of its entries to docs/{f}/LEARNINGS-{f}.md"` (`pdlc/workflows/orchestrate-dev.js:7589`), with no schema, so per-seam counts are not recoverable from LEARNINGS by any deterministic parse; (b) the structured form the AC describes *does* exist — `advisorySummaryRows` over `ADVISORY_SEAMS` (`:2694` ff.), invocations/resolved/escalated/noAction per seam — but only as an in-memory field of one run's report, never persisted; (c) `ADVISORY-{feature}.md`, the append-only record with the seven declared fields (`renderAdvisoryEntry`, `:2642`), is **deleted** after distil through the guarded channel. `pdlc/skills/harvest-learnings/SKILL.md` does not mention advisory records at all. So the REQ requires reading a structured artifact that is destroyed and whose survivor is unstructured. This needs an upstream decision (persist the summary rows in a defined LEARNINGS section) before it is buildable. | AC-6.1, AC-6.2, AC-6.3 |
| F-08 | High | Cross-Feature | **DC-09 violation: the REQ carries no stopping rule.** `docs/_constraints/DOMAIN-CONSTRAINTS.md:245` ("A REQ stays at requirements altitude, and carries its own stopping rule") requires the stopping rule be **pasted into the artifact under review** — its origin note records that a rule living only in the constraints file did nothing, while the same rule written into the REQ changed both reviewers' behaviour across four converging rounds. This REQ has §5 Scope and §7 Deferrals but no stopping-rule section. Given this feature's REQ sits at the head of a five-requirement, seven-AC-group document with a large implementability surface, omitting it invites the 16-round failure DC-09 was promoted from. | §5, whole document |
| F-09 | Medium | Cross-Feature | **`docs/_queue/ESCALATIONS.md` — the one durable per-seam evidence store — is not named anywhere in the REQ.** `ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md"` (`pdlc/workflows/orchestrate-dev.js:2750`) is append-only, non-feature-scoped, never distilled and never deleted — the exact opposite lifecycle to the per-feature `ADVISORY-*` record F-07 shows is destroyed. AC-6.2 ("a seam escalates disproportionately **across features**") is a cross-feature query, which is precisely the shape this log answers and which per-feature LEARNINGS prose cannot. Omitting it means REQ-CONS-06 will be built against the weaker source. | AC-6.2, REQ-CONS-06 |
| F-10 | Medium | Local | **AC-1.5 names one rung and ignores the two-rung mechanism that actually exists.** `MODEL_ADVISORY = "fable"` (`pdlc/workflows/orchestrate-dev.js:1652`) is paired with `MODEL_ADVISORY_FALLBACK = "opus"` (`:1653`), a declared, warned, reported fallback (`ADVISORY_MODEL_FALLBACK:` notice, `:1859`), and a hard-failure path when **neither** resolves (`:1869-1870`, "No advisory agent output was produced"). AC-1.5 states only the happy rung; the REQ never says what a consolidation pass does when the rung falls back (does the pass still run? is the fallback reported per AC-7.1?) or when resolution fails outright. Additionally both constants are **module-private to `orchestrate-dev.js`** — they are not exported and `orchestrate-queue.js` carries its own `MODEL_QUEUE` (`:70`) rather than importing anything — so a consolidation agent that is not an `orchestrate-dev` phase has no shared rung to sit on. Say which. | AC-1.5, BL-01 |
| F-11 | Medium | Local | **AC-5.2's recurrence determination is unmeasurable as stated, and its determinism decides NFR-4.** "whether its targeted failure mode **recurred** in the LEARNINGS consumed since" over a free-prose corpus is either a string/structured match against something AC-5.1 pins, or a model judgement. The REQ must choose at requirements altitude even though the oracle belongs to TSPEC, because a model judgement makes NFR-4 ("re-running over the same LEARNINGS set produces no duplicate promotions") false by construction — two runs can classify the same promotion differently and emit different proposals. AC-5.1's bar ("stated concretely enough to be observed") is a quality adjective, not a checkable condition. | AC-5.1, AC-5.2, NFR-4 |
| F-12 | Medium | Local | **NFR-4's "no duplicate PR" has no identity key.** Nothing states how a pass recognises the PR it already opened: branch naming convention, title marker, a body trailer, or the URL recorded by AC-3.4. AC-3.3 compounds it — one PR carrying many commits means an interrupted pass may find a PR that is *partially* correct, and the REQ says nothing about extending versus superseding it. Idempotence claimed without an identity key is not implementable. | NFR-4, AC-3.3, AC-3.4 |
| F-13 | Medium | Local | **The failure paths in REQ-CONS-03/04 are unordered, so partial state is undefined.** AC-3.5 fires the proposal-file fallback when "the PR cannot be opened", and AC-4.3 when the credential is absent/invalid — but the observable failures are not only pre-flight: the PR opens and the AC-3.4 log write fails; the branch pushes and PR creation fails; the first of AC-3.3's commits lands and the second is rejected. The REQ owes a statement of which side of each boundary is authoritative. Relatedly AC-3.6 forbids direct push to the default branch but says nothing about the promotion branch's lifecycle (name, reuse across passes, deletion), which is where the residue of a half-failed pass lives. | AC-3.4, AC-3.5, AC-3.6, AC-4.3 |
| F-14 | Medium | Local | **NFR-5 is an absence-only assertion with no paired positive.** "The pass never modifies a LEARNINGS file it consumed" states what does not happen but never states what **does** record consumption, so the negative is untestable in isolation. The mechanism exists at HEAD and should be named: the boundary is `docs/_decisions/.consolidation-log.md`, and "consumed" means the LEARNINGS **basename appears in that log's text** — `pending = [p for p in learnings if os.path.basename(p) not in logtext]` (`pdlc/hooks/scripts/nudge-consolidation.sh:38`), matching `consolidate-learnings/SKILL.md:35`. Pairing NFR-5 with that positive also makes AC-1.4's `no-op` and AC-2.4's log row checkable on the same path. | NFR-5, AC-1.4, AC-2.4 |
| F-15 | Low | Local | **§1 misdescribes the existing proposal table's columns.** The REQ says the table has columns "Target skill / Proposed change / Rationale". The shipped table is four-column — `| Source LEARNINGS | Target skill | Proposed change | Rationale |` (`pdlc/skills/consolidate-learnings/SKILL.md:54`). The dropped column is the provenance column AC-3.2 later requires the PR body to carry, so the omission is mildly misleading about how much already exists. | §1 |
| F-16 | Low | Local | **`.consolidation-log.md` is cited bare, without its directory.** AC-2.4 and AC-3.4 name `.consolidation-log.md`; the actual path is `docs/_decisions/.consolidation-log.md` (`pdlc/skills/consolidate-learnings/SKILL.md:35`; `pdlc/hooks/scripts/nudge-consolidation.sh:33`). §1 gives full paths for its sibling artifacts, so the inconsistency is local to these two ACs. Same for `CONSOLIDATION-PROPOSAL-{date}.md` in AC-3.4/AC-3.5. | AC-2.4, AC-3.4, AC-3.5 |

## Existing-Code Claim Verification

Every assertion the REQ makes about *existing* code, checked in one pass against HEAD
(`bb99f89` lineage, branch `feat-pdlc-consolidation-agent`). Batched deliberately — not one per round.

| # | REQ claim | Section | Verdict | Evidence |
|---|---|---|---|---|
| 1 | `consolidate-learnings` promotes into project-level DOMAIN-CONSTRAINTS and DECISIONS | §1 | **Confirmed** | `pdlc/skills/consolidate-learnings/SKILL.md:10`, `:42` |
| 2 | It writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md` rather than editing skills | §1 | **Confirmed** | `pdlc/skills/consolidate-learnings/SKILL.md:49`, `:82` |
| 3 | That file's columns are "Target skill / Proposed change / Rationale" | §1 | **Inaccurate** — four columns, first is `Source LEARNINGS` (F-15) | `pdlc/skills/consolidate-learnings/SKILL.md:54` |
| 4 | The named skills live in `yumo-plugins/pdlc/skills/` | §1 | **Confirmed**, and note they live in *this* repo (F-03) | `pdlc/skills/` (16 skill dirs) |
| 5 | Nothing carries the proposal across the repo boundary | §1 | **Confirmed** — no `gh pr create` / cross-repo push anywhere in `pdlc/skills/consolidate-learnings/` or `pdlc/workflows/` outside Phase PUB's own-repo `ship-pr` | grep, repo-wide |
| 6 | The `nudge-consolidation` SessionStart hook's threshold is ≥5 un-consolidated LEARNINGS | AC-1.2 | **Confirmed** as a value; **but the hook only prints** (F-04) | `pdlc/hooks/scripts/nudge-consolidation.sh:25`, emit at `:44-49` |
| 7 | "Un-consolidated" is decided against `.consolidation-log.md` | AC-2.4, NFR-5 | **Confirmed**; path is `docs/_decisions/.consolidation-log.md` (F-16) | `nudge-consolidation.sh:33`, `:38`; `SKILL.md:35` |
| 8 | `.consolidation-log.md` records date, consumed files, promoted, deferred | AC-2.4 | **Confirmed** | `pdlc/skills/consolidate-learnings/SKILL.md:43`, `:83` |
| 9 | The pattern bar is "recurs across ≥2 unrelated features, or a single standing invariant" | AC-2.3, NFR-3 | **Confirmed verbatim** | `pdlc/skills/consolidate-learnings/SKILL.md:38`, `:81` |
| 10 | `MODEL_ADVISORY` exists as an advisory model rung | AC-1.5 | **Confirmed but incomplete** (F-10) | `pdlc/workflows/orchestrate-dev.js:1652`; fallback `:1653`; failure `:1869-1870` |
| 11 | `pdlc-merge-phase` REQ-MERGE-03 is a self-modification guard | AC-3.7 | **Confirmed as a requirement**; its reach is the issue (F-01) | `docs/completed/pdlc-merge-phase/REQ-pdlc-merge-phase.md:163`; impl `orchestrate-dev.js:708`, `:731` |
| 12 | The guard covers `pdlc/skills/**` and `pdlc/workflows/**` | AC-3.1, AC-3.7 | **Under-stated** — the set is four, not two (F-02) | `pdlc/workflows/orchestrate-dev.js:48-53` |
| 13 | `pdlc-advisory-tier` harvests `ADVISORY-{feature}.md` into LEARNINGS | AC-6.1 | **Confirmed that it happens; the result is unstructured and the source is deleted** (F-07) | distil prompt `orchestrate-dev.js:7585-7592`; record writer `:2687`; delete `:10499` |
| 14 | The advisory summary is available "by seam" | AC-6.1 | **Confirmed only as an in-memory report field**, never persisted (F-07) | `advisorySummaryRows`, `orchestrate-dev.js:2694` ff.; `ADVISORY_SEAMS` drives the five rows |
| 15 | Consolidation should be serial "for the same reason the queue is" | AC-1.3 | **Queue mechanism confirmed; no analogue exists for consolidation** (F-05) | `pdlc/workflows/orchestrate-queue.js:630`, header `:26-27` |
| 16 | `pdlc-advisory-tier` is delivered (BL-01) | §6 | **Confirmed** — queue row 14 `done`, merged `bb99f89` (#38) | `docs/_queue/QUEUE.md` row 14; `git log` |
| 17 | `pdlc-workflow-distribution` is delivered (BL-02) | §6 | **Confirmed** — archived to `docs/completed/`, merged `1fb6cbe` | `docs/completed/pdlc-workflow-distribution/`; `QUEUE.md` |
| 18 | DEC-E2 / DEC-E4 / DEC-E5 / Break 2 / OQ-E3 exist in the master plan | header, NFR-1, BL-04 | **Confirmed, all five** | `docs/design/MASTER-PLAN-engineering-loop.md:57`, `:195`, `:216`, `:228`, `:304` |
| 19 | The master plan orders this feature 4th with those dependencies | header | **Confirmed** | `docs/design/MASTER-PLAN-engineering-loop.md:246` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | In the self-consuming configuration (F-03), is the promotion PR cut from the same clone the pipeline is running in, or from a separate clone the pass makes? The answer changes AC-4.4, NFR-4 and the branch lifecycle in F-13, and it is a scope decision, not a TSPEC detail. |
| Q-02 | Is AC-5.2's recurrence verdict deterministic or model-made (F-11)? If model-made, does NFR-4 mean "no duplicate *promotion*" only, with the effectiveness table exempt from idempotence? |
| Q-03 | AC-3.3 lets multiple promotions share one PR, and AC-5.4 routes retirements down the same path. May an additive promotion and a retirement of a *different* promotion share one PR, or must retirements be separately reviewable? |
| Q-04 | AC-5.3 flags `ineffective` after recurrence "across two consecutive passes". With cadence unresolved (BL-04), two passes could be two weeks or two days apart. Is the window measured in passes or in elapsed time, and does a `no-op` pass (AC-1.4) count as one of the two? |
| Q-05 | AC-6.3 allows proposing an envelope widening. The advisory envelope is a four-member literal in config (`advisory.envelope`, per-key independent fallback). Is a widening proposal a PR against `pdlc/workflows/**` (the shipped default) or against a consumer's `.claude/pdlc.config.json` — which is *untracked* config, not a PR-able surface? |
| Q-06 | AC-7.2's "single notification" names no channel. Is that the run report, a `notice`, or a push notification? Unattended execution (F-04) has no session to print into. |
| Q-07 | Does AC-1.4's `no-op` still run REQ-CONS-05's effectiveness reporting? A pass with no new LEARNINGS can still observe that a prior promotion has aged into `insufficient-evidence` (AC-5.5) — but AC-1.4 says it "exits successfully without opening anything". |

## Positive Observations

- **The problem statement is unusually honest and precise.** §1's distinction between *propose-only* and *hand-transcribed* — "the skill currently enforces the second while only intending the first" — is the correct diagnosis and it is verifiable at `pdlc/skills/consolidate-learnings/SKILL.md:49`. It names a real defect rather than a preference.
- **REQ-CONS-02 is the right shape for a preservation requirement.** Pinning the unchanged behaviours as explicit ACs (AC-2.1 … AC-2.4) rather than as prose means a regression in the existing skill is a failed AC, not a silent loss. AC-2.3's bar is transcribed faithfully from the source (claim 9 above).
- **AC-4.1's credential separation is stated as a structural property, not a policy.** The paragraph after REQ-CONS-04 — "the agent cannot merge its own proposal even if every other control failed" — is exactly the right justification altitude, and it is the one control in this REQ that would still hold if F-01's guard claim were removed entirely.
- **REQ-CONS-05 is a genuinely rare requirement.** Most improvement loops are unfalsifiable by construction; requiring each promotion to name the failure mode it targets, and each later pass to grade it `prevented` / `recurred` / `insufficient-evidence` over a closed three-value set, is a real oracle design. AC-5.5's `unmeasurable` state is the part most specs omit.
- **The deferral table binds successors properly.** D-CONS-02 and D-CONS-04 both name `pdlc-engineering-loop` as the binding surface rather than trailing off into prose intent — DC-08 compliant. D-CONS-03's rationale (effectiveness beats age as a pruning signal) is correct and worth keeping.
- **Dependency reasoning is sound and checks out.** BL-02's claim that an undistributable promotion is not a promotion is exactly why the master plan orders this 4th (`MASTER-PLAN-engineering-loop.md:246`), and both blockers are in fact delivered (claims 16–17).

## Recommendation

**Needs revision.** 8 High, 6 Medium, 2 Low.

### DC-09 check, applied honestly

DC-09 (`docs/_constraints/DOMAIN-CONSTRAINTS.md:245`) says a round whose blocking findings are
**all** implementability or oracle-falsifiability defects means the REQ has met its bar and the
findings should be routed downstream rather than re-litigated. I applied that test before writing
this verdict, and this round does **not** pass it — four of the eight High findings contest scope,
phasing or a factual claim about existing behaviour, which are REQ-layer concerns:

- **F-01** and **F-02** are *false or under-stated claims about existing code*, not missing oracles.
  A REQ may defer how a thing is tested; it may not assert a control is in force when no code path
  enforces it (F-01) or restate a four-member shipped catalogue as two members (F-02).
- **F-03** is a **scope** defect: the topology the whole of REQ-CONS-03/04 assumes (two repos) is
  not the topology of the only consumer that exists.
- **F-04** is a **phasing** defect: AC-1.1 requires a platform capability that does not exist at
  HEAD and whose only candidate the same document defers (D-CONS-04).
- **F-08** is a standing-constraint violation that DC-09 states about REQs specifically.

The remaining four High findings (F-05, F-06, F-07) plus every Medium are closer to the
implementability class, and I would accept most of them being **closed by deferral with a named
receiving phase** rather than by writing mechanism into the REQ — with two exceptions that must be
answered *here*, because they change what the feature is rather than how it is built:

- **F-06's configured values** must land as declared keys with defaults and owners before FSPEC, per
  the standing REQ bar. Naming `.claude/pdlc.config.json` keys is requirements-altitude work.
- **F-07's input availability** is a scope question, not a test question: if the structured advisory
  summary is not persisted, REQ-CONS-06 is unbuildable as written and either gains a persistence
  requirement or narrows to what LEARNINGS prose can actually support.

### What must change for approval

1. **F-01** — restate AC-3.7 against a real enforcement surface, or mark it explicitly as a
   consequence of "nothing auto-merges in the plugin repo" rather than as inherited machinery.
2. **F-02** — make the routing predicate set-equal to `MERGE_GUARD_DEFAULTS`
   (`orchestrate-dev.js:48-53`), or cite the constant by name so drift is impossible.
3. **F-03** — add an AC covering the same-repo configuration, or scope the feature to the two-repo
   case and record the self-consumption case as a bound deferral.
4. **F-04** — name the cadence trigger surface, or move AC-1.1 behind a named successor and let
   AC-1.2 be the operative trigger for this feature.
5. **F-06** — declare cadence, plugin-repository, and staleness-in-passes as config keys with
   defaults and a named owner.
6. **F-07** — state whether the advisory summary is persisted in a defined form, and if not, narrow
   REQ-CONS-06 accordingly.
7. **F-08** — paste a stopping rule into the REQ, per DC-09.
8. **F-05, F-10, F-14** — each needs one sentence at requirements altitude: what marks a pass
   in-progress and who clears it; what a rung fallback means for the pass; what positively records
   consumption (the mechanism already exists — `nudge-consolidation.sh:38`).

The Mediums not listed above (F-09, F-11, F-12, F-13) and both Lows should be addressed but are
individually cheap; F-11 is the one to answer deliberately, since it decides whether NFR-4 is true.

## Verdict

VERDICT: Needs revision
