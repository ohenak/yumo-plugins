# LEARNINGS — pdlc-stats

| Field | Detail |
|---|---|
| Feature | pdlc-stats |
| REQ | `docs/pdlc-stats/REQ-pdlc-stats.md` |
| Date Completed | 2026-09-01 |
| Total Iterations | REQ: 9, FSPEC: 12, TSPEC: 11, PLAN: 7, PROPERTIES: 7, DECISIONS: 12, IMPL (Phase CR): 3 (se) / 2 (pm) / 2 (te), DOD: 4 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | 127 process artifacts, all deleted by the second commit of this harvest pass: 123 `CROSS-REVIEW-*.md` (REQ v1–v9 × {se, te} = 18; FSPEC v1–v12 × {se, te} = 24; TSPEC v1–v11 × {pm, te} = 22; PLAN v1–v7 × {pm, te} = 14; PROPERTIES v1–v7 × {pm, se} = 14; DECISIONS v1–v12 × {pm, te} = 24; IMPLEMENTATION v1–v3 × {se} = 3; REVIEW v1–v2 × {pm, te} = 4) plus 4 `CODE_REVIEW-pdlc-stats-v{1,2,3,4}.md`. **No `POSTMORTEM-*` file exists for this feature.** `ADVISORY-pdlc-stats.md` and `MUTATION-EVIDENCE-pdlc-stats.md` are neither cross-reviews nor code reviews and were deliberately left in place, unharvested. |
| Phases exercised | R, F, T, D (DECISIONS), P (PLAN), PROP, I, CR, DOD |
| DoD rounds | 4 |

## 1. Non-Convergences

No `POSTMORTEM-*` file exists — no phase hit a hard halt or exhausted its budget to the point of
producing one. What this feature produced instead is the opposite failure mode: **loops that kept
converging on a moving target.** TSPEC reached v11, DECISIONS v12, FSPEC v12 and REQ v9, and the
bulk of the later rounds in every one of those loops were *not* new defects in the document under
review — they were upstream-cascade re-confirmations, `UPSTREAM-STATE` staleness repairs, and
erratum residue. Two `ERRATUM: REQ` and two `ERRATUM: TSPEC` routes fired during the DECISIONS and
PLAN loops; each one re-opened every downstream document that pinned the corrected text, whether or
not that document's own bytes had changed.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| DECISIONS | test-engineer | DEC-STATS-01's option-cost table priced option B as paying no new co-change sites. The re-measuring sweep (`grep -rln "escalation-view" pdlc/engine/__tests__/ pdlc/workflows/__tests__/`) was scoped to two **test** directories, so it structurally could not see `publish-preflight.mjs:205-219` — production-side copies of `LIB_MODULES_AT_HEAD`/`LIB_MODULES_FROM_THIS_FEATURE` that B does move (15 → 16, feeding PF-4's both-directions equality at publish time). The document quoted a re-runnable command whose output contradicted the number it was cited for; a second round found the same command returned 14 files, not the 15 the prose claimed. | K-9 promoted the rule to `docs/_constraints/DOMAIN-CONSTRAINTS.md` **and** widened the sweep beyond `__tests__/`. Landed as **DC-23** (vendoring co-change sweep must not be `__tests__/`-scoped). | 12 |
| DECISIONS / TSPEC | product-manager, test-engineer | Erratum residue produced *null rounds* — a document whose own bytes did not change but whose upstream pin had moved. Reviewers repeatedly declined the shortcut ("no diff, nothing to check") on DEC-ERR-03 grounds: the erratum item landing is necessary but not sufficient, and the frozen compression can be falsified by upstream moving underneath it without a single byte changing here. One round's only finding was that the document's own defect record now described a TSPEC version that no longer existed. | Each null round was re-measured against HEAD rather than against the erratum item list. Correct, and expensive: this is the direct cause of DECISIONS v8→v12 and TSPEC v8→v11. | 12 / 11 |
| TSPEC | test-engineer | A non-resolving TSPEC pin persisted in the v8/v9 `UPSTREAM-STATE` trailers (TE F-04) and was carried as `DEFERRED` for four consecutive rounds before closing. | Closed on the document's side and recorded at harvest; the dispatch-side pin (`f2261510…`) was never retired by anything in the pipeline. See §5. | 11 |
| CR (implementation) | software-engineer | `CROSS-REVIEW-software-engineer-IMPLEMENTATION-v3.md` closes `VERDICT: Needs revision` with one open High — and there is no v4. The loop was terminated by the DoD channel (`CODE_REVIEW-v4`) verifying the same defect closed, rather than by a fourth se-IMPLEMENTATION round. | The High (uncommitted remediation, §4 below) was landed and verified by `CODE_REVIEW-pdlc-stats-v4` (`VERDICT: Pass`). The CR loop's last file therefore reads as unresolved even though the finding is closed. | 3 |
| DOD | dod-verify | Four rounds, driven almost entirely by *narrative drift*: per-task docstrings and test-file headers describing a pre-implementation state ("RED T-09: `stats` is not yet in `bin/cli.mjs`'s `main()` switch") that later tasks on the single-writer chain had silently falsified. v1 filed it at 20/22 requirements traced; v2 reached 22/22 and found the same class again in two more files. | Remediated by rewriting the narratives against delivered oracles, and the defect class was converted into a mechanical 29-assertion oracle (`pdlc/engine/__tests__/stats-narrative-drift.test.js`). v4: **Pass**, 22/22 traced, 96.27% branch coverage on the lowest new module. | 4 |

## 2. Cross-Feature Patterns

| Finding | Suggested Promotion Target |
|---|---|
| **An enumeration's co-change tests must pin the enumeration's *size*, wherever the enumeration lives — and the query that derives the co-change set must not be scoped to test directories.** Raised as `Cross-Feature` in te-DECISIONS v1 (F-01), v2 (F-01), v3 (F-01), v4 (F-01) and v6 — five separate rounds circling one rule. The recurring shape: a per-file grep finds enumerations but never finds the assertions that pin their size, and a `__tests__/`-scoped sweep silently drops production-side copies (`publish-preflight.mjs`, `prepack.mjs`). | **Already promoted — landed as DC-23 in `docs/_constraints/DOMAIN-CONSTRAINTS.md` during this feature.** Flagging for consolidation only to confirm DC-23's phrasing covers *every* enumeration in a co-change set, not the four instances that happened to be caught. |
| **"Sole production construction site" is a contract stated in prose across this repo and mechanically checkable, yet is repeatedly left to review.** te-DECISIONS v1 F-04 (`Cross-Feature`): K-4 declared "a second construction site is a review-blocking finding, not a test failure" for `statsParsers()`, while `resolveWorkflowRoot()`, `loopSessionModule()` and `escalationViewModule()` carry the identical "one arrangement, reused" contract in prose with no detector either. The fix shape is a source-scan oracle (literal naming of all four classifiers occurs exactly once, inside `statsParsers`), not a reviewer's attention. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — a sole-construction-site contract stated in prose owes a source-census oracle. This is a repo-wide shape, not a `pdlc stats` fact. |
| **Tests that re-derive their expected value using the mechanism under test are non-falsifying.** Two independent reviewers found this in two different artifacts: te-FSPEC F-05 (`Process`) on AT-10/AT-13 ("the measured index derived from the surviving file", "what the resolution pipeline's own `RESOLVED:` rule yields") and a PROPERTIES round on PROP-PBT-04 (`statsProperties.test.js:262-264` re-derives byte totals with `stats.mjs:210-212`'s own formula, so the object under test echoes itself over circular inputs). AT-11 is the counter-example that does it right: it pins the literal `2`. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — expectations over real corpora must be transcribed literals, not re-derivations. Pairs with the existing literal-vs-source-drift lessons. |
| **Real-tree acceptance tests pinned under `docs/completed/` break whenever a feature is archived.** te-FSPEC F-09 notes all four real-tree ATs (AT-10, AT-11, AT-13, AT-18) pin archived directories, in a project that has *already* broken tests once by moving documents into `docs/completed/`. This is the recorded `doc-moves-break-pinned-tests` failure mode recurring in a new surface. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` — extend the existing doc-move constraint to cover acceptance-test fixtures pinned at archive paths, not just test constants. |
| **A local machine's untracked `.claude/pdlc.config.json` can fail a run-precondition pin that is green in CI.** te-REVIEW F-03 (`Process`, still open): the operator's copy carries a locally-prepended engine leg, `waveResumePreflight.test.js:45-46` expects the canonical workflows-only string, and CI supplies the canonical value so the red never appears there. This is the same class as CLAUDE.md's existing debugging note about untracked files and `coveredViolations`, now appearing on a **config pin** rather than a document oracle. | `CLAUDE.md` debugging note / `pdlc/OPERATIONS.md` — widen "untracked files can fail a document oracle" to "untracked files can fail a document oracle *or a run-precondition pin*". Remediation is operator-side; explicitly **not** se-implement work. |

**Under-tagging note.** Several findings tagged `Local` describe repo-wide mechanisms and should have
been `Cross-Feature`: the `renderHaltsBlock` / `File Ownership Manifest` column-keying finding
(pm-PLAN F-05, tagged `Process`) turns on how the PLAN contract lint keys same-batch/same-file
grouping — a lint that runs on every feature's PLAN — and te-DECISIONS F-03's `pdlc/README.md:231`
prose enumeration ("The four workflow modules …") is a repo-level transcription site with no grep
that reaches it. See §4 for the tag-discipline signal.

## 3. Rejected Proposals (rationale worth carrying)

| Proposal | Rejected by | Rationale | Reusable for future features? |
|---|---|---|---|
| Re-open K-3's arithmetic because `c8.include` measures **eight** entries at branch HEAD, falsifying K-3's "seven at HEAD" | test-engineer, DECISIONS round | The design's measurement basis is the **pre-feature tree**. `git show main:pdlc/workflows/package.json` has exactly seven entries; `4 + 1 + 2 = 7` is the true basis and "this feature makes eight" is the predicted consequence, not a contradiction. | **Yes.** A design document's counts are measured against `main`, not against the branch that is in the middle of changing them. Reviewers grounding on HEAD will keep re-filing this. |
| Raise a High because the branch's shipped test title says "seven modules" while the literal asserts eight | test-engineer | Real defect, but in `coverageInstrumentation.test.js:264` — **code**, not the DECISIONS document. It is *exactly* the failure K-3 predicted. Recorded `DEFERRED` to the implementation phase rather than folded into the document verdict. | **Yes.** Route a finding to the phase that owns the artifact; do not inflate a document's verdict with a code defect the document correctly predicted. |
| Approve a null round on the item list ("the erratum landed and was routed") | product-manager and test-engineer, twice | DEC-ERR-03 makes the erratum item's landing *necessary but not sufficient*. The question is whether the document is still a faithful compression of the upstream text at HEAD — answered by re-reading upstream, not by checking the erratum's own diff off a list. In one round the only finding was reachable **only** this way. | **Yes.** This is the single most load-bearing rejected shortcut in the feature. Approving on the item list is what the round exists to catch. |
| Raise a stale divergence-record to **High** and halt the phase | test-engineer, DECISIONS v11-ish | The gating test is whether a decision, oracle, falsifier, or task sizing is falsified. Here the opposite happened: K-3's arithmetic was correct and TSPEC moved *into* agreement with it, so an implementer following K-3 literally still lands the right edit. What was false was a meta-claim about a disagreement, not engineering content. Halting over a discharged erratum's residue would be severity inflation. | **Yes.** "The document's account of a disagreement is stale" ≠ "the document's engineering content is wrong." Codify the distinction before the next erratum cascade. |
| Demand a new K-row or a new oracle for the enlarged harvested case | test-engineer → DECISIONS | The document's own *What decisions do not decide* section carves out "token spellings, key sets, exit codes, row order, edge-case outcomes" as FSPEC §4/§5 material. REQ-STATS-06's out-of-catalogue disposition is precisely an edge-case outcome — a pre-declared scope boundary, not a dodge. | **Yes.** An explicit, pre-declared "what this document does not decide" section is a working defence against scope creep in review. Worth making standard in DECISIONS. |
| Re-derive the whole ten-row site table from scratch after a preamble edit | test-engineer | Delta protocol: the preamble hunk changed two words; verify the two words against the table and the sweep command, then stop. | **Yes.** Delta re-review discipline is what kept 12-round loops finite. |

## 4. Process Learnings

- **Four DoD rounds, and round v3's only finding was that the round-2 remediation was never
  committed.** `CODE_REVIEW-pdlc-stats-v3.md` records the branch tip still at `926cdb42b`, with the
  entire remediation (9 modified tracked files, +65/−80 comment-only, plus an **untracked** 178-line
  `pdlc/engine/__tests__/stats-narrative-drift.test.js`) alive only in the working tree. The
  remediator reported "completed" without landing anything. All four Phase PUB checks — `Unit tests
  (ubuntu-latest, node 20)`, `Engine tests (ubuntu-latest)`, `Shell scripts parse`, `Fixture
  machine` — run against the **pushed tip**, so an uncommitted remediation is invisible to every one
  of them and the new 29-assertion oracle would never have run in CI. The fix was `git add`, commit,
  push — *zero* content change. **One whole DoD round and one whole CR round were spent on a
  delivery step, not an engineering defect.** The cheapest available guard: make "remediation
  complete" assert `git status --porcelain` is empty and the tip has moved, before re-dispatching a
  verifier.
- **Recording the exact tree state in a review is what made round 4 cheap.** v3 wrote down the file
  list, the `+65/−80` numstat, the untracked path, and the test counts. v4 then verified four
  falsifiable conditions (`--porcelain` empty; tip `cb6543ae6`, `926cdb42b` four commits back;
  `stats-narrative-drift.test.js` tracked at `5a9b2ccd3`, 178/0 numstat; pushed to origin) and
  closed. A finding written as a measurement re-verifies mechanically; a finding written as an
  assertion does not.
- **The three highest-iteration loops (FSPEC 12, DECISIONS 12, TSPEC 11) were not driven by
  disagreement about the feature.** They were driven by upstream cascade — four erratum routes
  (`ERRATUM: REQ` ×2, `ERRATUM: TSPEC` ×2), each re-opening every pinning downstream document. This
  is the exact workload `cascade.pinCheck` was built for, and it ships **off** by default
  (`.claude/pdlc.config.json` → `cascade.pinCheck.enabled`). A feature with this cascade profile is
  the strongest available argument for turning it on; the `PIN-CHECK` no-round-budget dispatch would
  have absorbed most of the null rounds that reviewers correctly refused to rubber-stamp.
- **Phase CR file naming is inconsistent and cost a reader's time.** software-engineer wrote
  `CROSS-REVIEW-software-engineer-IMPLEMENTATION-v{1,2,3}.md`; product-manager and test-engineer
  wrote `CROSS-REVIEW-{role}-REVIEW-v{1,2}.md` for the same phase over the same artifact. Two
  doc-type tokens for one phase means any count, sweep, or harvest keyed on doc-type must know both.
- **`harvest-learnings/SKILL.md` is self-inconsistent about what it harvests** (pm-DECISIONS F-02):
  `:77` lists `CROSS-REVIEW`, `CODE_REVIEW`, `POSTMORTEM`; `:126` and `:59` disagree with it, and
  NG-6 (`:79-80`) sets a trap that produced **two falsified premises across rounds 6 and 7**. Worth
  fixing at the source rather than in each feature's reviews.
- **Scope-tag discipline eroded in the long loops.** Early rounds carry a clean legend (`Local` /
  `Cross-Feature` / `Process`) and per-finding tags; later rounds tag whole documents `Local (per-
  finding tags below)` or omit the legend. Of 127 artifacts, only ~22 mention `Cross-Feature` at
  all, and nearly all of those are in the first six DECISIONS rounds. The signal degrades exactly
  when the loop gets long enough to need it.
- **A constraint that cites its own dispatch as authority is unverifiable** (pm F-12, `Process`):
  C-2 grounded the `docs/completed/{feature}/` lookup in "the REQ's own dispatch input", which no
  later reader or test can open. Verifiable authorities existed and went uncited
  (`docs/completed/` holds 13 archived feature directories; `docs/completed/REQ-completed.md`
  documents the convention).
- **No silent tool-denial evidence appears in the artifacts.** Searched all 127 files for permission-
  denial / silent-denial / tool-denial language; there is none. If denials occurred, they were not
  recorded in any review or escalation, which is itself a gap: the process leaves no trace of them.

## 5. Open Items for Consolidation

These are plain items — no failure-mode IDs were assigned by the handing dispatch.

1. **`waveResumePreflight.test.js:45-46` vs. `.claude/pdlc.config.json:10`** — te-REVIEW F-03,
   `Process`, **still open at harvest**. The operator's untracked config carries a prepended engine
   leg; the pin expects the canonical workflows-only `implementation.testCommand`. Remediation is
   operator-side (restore the pinned string; the engine leg is already its own CI check). Explicitly
   **not** se-implement work for pdlc-stats. Carries repo-wide, not feature-scoped.
2. **The dispatch-side TSPEC pin (`f2261510…`) is retired by nothing in the pipeline** — carried
   `DEFERRED` for four consecutive TSPEC rounds, closed on the document's side only. No mechanism
   exists that retires a stale downstream routing clause; te-DECISIONS v10 records this unchanged.
3. **`harvest-learnings/SKILL.md` self-inconsistency** (`:59` / `:77` / `:126`, NG-6 at `:79`) —
   produced two falsified premises during this feature's review rounds. Source fix, not a per-feature
   workaround.
4. **Phase CR doc-type token split** (`IMPLEMENTATION` vs `REVIEW`) — pick one, or teach the sweeps
   both.
5. **`CROSS-REVIEW-software-engineer-IMPLEMENTATION-v3.md` shipped `VERDICT: Needs revision` with an
   open High, and no v4 was written.** The finding *was* closed, via `CODE_REVIEW-v4`. Whether a CR
   loop may be terminated by the DoD channel is undecided; today it leaves the CR record reading
   unresolved.
6. **Confirm DC-23's phrasing generalises.** It landed from this feature's K-9, but was written
   against the four co-change instances that were caught. te-DECISIONS v2/v3 argued the rule must be
   phrased over *every* enumeration in a co-change set.
7. **Sole-production-construction-site contracts have no detector** (§2) — `resolveWorkflowRoot()`,
   `loopSessionModule()`, `escalationViewModule()` all carry the contract in prose only.

## 6. Approval Record

Twelve approvals, transcribed verbatim from the final cross-review of each document.

| Document | Reviewer | File | Verdict | Approval anchors |
|---|---|---|---|---|
| REQ | software-engineer | `CROSS-REVIEW-software-engineer-REQ-v9.md` | Approved with minor changes | `APPROVAL-HASH: sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`<br>`REVIEWED-COMMIT: e12b78fd82c0d18c40f1700d8c79071c0b4c5e8e` |
| REQ | test-engineer | `CROSS-REVIEW-test-engineer-REQ-v9.md` | Approved | `APPROVAL-HASH: sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`<br>`REVIEWED-COMMIT: e12b78fd82c0d18c40f1700d8c79071c0b4c5e8e` |
| FSPEC | software-engineer | `CROSS-REVIEW-software-engineer-FSPEC-v12.md` | Approved with minor changes | `APPROVAL-HASH: sha256:a493133f67150b27020b10d05cd676a505e172f0b89082a208ce8198a3137f5d`<br>`REVIEWED-COMMIT: 311910dcee1df8c0dd18329b8988957fb07b222e` |
| FSPEC | test-engineer | `CROSS-REVIEW-test-engineer-FSPEC-v12.md` | Approved | `APPROVAL-HASH: sha256:a493133f67150b27020b10d05cd676a505e172f0b89082a208ce8198a3137f5d`<br>`REVIEWED-COMMIT: 311910dcee1df8c0dd18329b8988957fb07b222e` |
| TSPEC | product-manager | `CROSS-REVIEW-product-manager-TSPEC-v11.md` | Approved | `APPROVAL-HASH: sha256:7b119eb7fa68475db641e2c244a3b9c10b742b2310d0079ccbb137d9e6d3e85e`<br>`REVIEWED-COMMIT: 0d72080f399274f7c36cc7c998fef5431979947d` |
| TSPEC | test-engineer | `CROSS-REVIEW-test-engineer-TSPEC-v11.md` | Approved with minor changes | `APPROVAL-HASH: sha256:7b119eb7fa68475db641e2c244a3b9c10b742b2310d0079ccbb137d9e6d3e85e`<br>`REVIEWED-COMMIT: 0d72080f399274f7c36cc7c998fef5431979947d` |
| PLAN | product-manager | `CROSS-REVIEW-product-manager-PLAN-v7.md` | Approved with minor changes | `APPROVAL-HASH: sha256:64d8f1c5365bf95a3666dae0da22e3c42c2a1fb1e170cf0f959c494ad3c1ecc9`<br>`REVIEWED-COMMIT: b8a2a32309412fcbb328dece6ed869307dc36c9b` |
| PLAN | test-engineer | `CROSS-REVIEW-test-engineer-PLAN-v7.md` | Approved with minor changes | `APPROVAL-HASH: sha256:64d8f1c5365bf95a3666dae0da22e3c42c2a1fb1e170cf0f959c494ad3c1ecc9`<br>`REVIEWED-COMMIT: b8a2a32309412fcbb328dece6ed869307dc36c9b` |
| PROPERTIES | product-manager | `CROSS-REVIEW-product-manager-PROPERTIES-v7.md` | Approved with minor changes | recorded in the approval-anchor commit `5e67c186b` (`chore(pdlc): record approval anchors sha256:7c2a888d79a92ee102fcc7c976661d7e371763e565df0261393e714c05f93f73`) |
| PROPERTIES | software-engineer | `CROSS-REVIEW-software-engineer-PROPERTIES-v7.md` | Approved with minor changes | recorded in the approval-anchor commit `5e67c186b` (`chore(pdlc): record approval anchors sha256:7c2a888d79a92ee102fcc7c976661d7e371763e565df0261393e714c05f93f73`) |
| DECISIONS | product-manager | `CROSS-REVIEW-product-manager-DECISIONS-v12.md` | Approved with minor changes | recorded in the approval-anchor commit `5e67c186b` (`chore(pdlc): record approval anchors sha256:7c2a888d79a92ee102fcc7c976661d7e371763e565df0261393e714c05f93f73`) |
| DECISIONS | test-engineer | `CROSS-REVIEW-test-engineer-DECISIONS-v12.md` | Approved with minor changes | recorded in the approval-anchor commit `5e67c186b` (`chore(pdlc): record approval anchors sha256:7c2a888d79a92ee102fcc7c976661d7e371763e565df0261393e714c05f93f73`) |

Phase CR and DoD closing records (not approval-anchored):

| Record | File | Verdict |
|---|---|---|
| Implementation, software-engineer | `CROSS-REVIEW-software-engineer-IMPLEMENTATION-v3.md` | Needs revision (1 High — uncommitted remediation; closed by `CODE_REVIEW-v4`, no v4 CR written) |
| Implementation, product-manager | `CROSS-REVIEW-product-manager-REVIEW-v2.md` | Approved with minor changes |
| Implementation, test-engineer | `CROSS-REVIEW-test-engineer-REVIEW-v2.md` | Approved with minor changes |
| DoD | `CODE_REVIEW-pdlc-stats-v4.md` | **Pass** — 22/22 requirements traced, 96.27% branch coverage on `pdlc/workflows/lib/stats.mjs` |
