# CODE REVIEW — pdlc-consolidation-agent (v3)

| Field | Detail |
|---|---|
| Feature | pdlc-consolidation-agent |
| Branch | `feat-pdlc-consolidation-agent` |
| Reviewer role | dod-verify (evaluator — documents findings, fixes nothing) |
| Review version | v3 (delta re-verification) |
| Date | 2026-08-10 |
| HEAD reviewed | `a731c101` |
| Prior round | `CODE_REVIEW-pdlc-consolidation-agent-v2.md` (committed `5a730e38`) |
| Remediation under review | `a731c101` — "close DOD v2 G1/G2/G3 — SKILL anchor sweep, pointer form, proposal path" |
| Verdict | **Findings** |
| Branch coverage (lowest new module) | 87.25% (unchanged) |
| Requirements traced | 34/34 — 0 gaps (carried from v2) |

**Version reconciliation.** This round was dispatched as "v2", but `CODE_REVIEW-pdlc-consolidation-agent-v2.md` is already
committed at `5a730e38` and its remediation commit (`a731c101`) landed after it. Per the dod-verify version rule — next
unused integer — this is **v3**, executed under the v2+ delta protocol. Writing to the v2 path would have destroyed the
round-2 record this round's disposition table depends on. (v2 recorded the same reconciliation against v1; the dispatcher's
version argument has now been one behind for two consecutive rounds, which is itself worth an operator glance.)

**Scope:** Local + Cross-Feature (per-finding tags below).

---

## §1 Code Quality Findings

### Disposition of the v2 findings

| v2 | Summary | Status at HEAD | Evidence |
|---|---|---|---|
| **G1** | Nine `consolidate-learnings/SKILL.md:NNN` anchors in REQ and FSPEC falsified by the round-1 diff | **Partially resolved** | All 12 REQ+FSPEC anchors independently re-measured true at HEAD (table below), and mechanised by a derived oracle that survives five mutation probes. But the sweep covered **two of the four** citing documents — `TSPEC:179` and `docs/_constraints/pdlc-consolidation-vocabularies.md:163` still carry stale anchors of the same family, and the new oracle reads only REQ and FSPEC so it cannot catch them. Carried forward as **H1** |
| **G2** | Third bundle-backed SKILL still a hand-executed runbook | **Resolved** | `SKILL.md:6` `# consolidate-learnings — Pointer/Contract`; `:8` "This skill delegates to a workflow script. It does not run the pass itself."; `:10` names `pdlc/workflows/consolidate-learnings.js`; `:11-15` state what hand-execution bypasses; `## Invocation Contract` (`:29-39`) matches the sibling form (`orchestrate-queue/SKILL.md:6-33`); the hand-execution Quality Checklist is gone, replaced by `## Reading the Result` (`:99-106`). Mutation probe: dropping the heading and the module name turns `consolidationSkillAnchors.test.js` red (2 failures) |
| **G3** | SKILL promised `CONSOLIDATION-PROPOSAL-{date}.md`; the module writes `{passId}` | **Resolved in the SKILL** | `SKILL.md:70` now spells `{passId}`, glossed `{YYYY-MM-DD}-{n}`; the template heading `:73` matches `renderProposalFile` (`consolidate-learnings.js:2425`) and the path matches `proposalPathFor` (`:2168`). Mutation probe: reverting to `{date}` turns the suite red (1 failure). **But the fix falsified REQ:41**, which still quotes the `{date}` form as the skill's behaviour — carried forward as **H2** |

**Verification of G1's REQ/FSPEC sweep, independently measured (not read off the commit message).** Every citation resolved
against `pdlc/skills/consolidate-learnings/SKILL.md` at HEAD:

| Citing site(s) | Anchor | Content at HEAD | True? |
|---|---|---|---|
| REQ:81, REQ:82, REQ:620, FSPEC:378 | `:56` | `1. **Find the boundary.**` — the block/legacy predicate that replaced the date boundary | ✓ |
| FSPEC:711 (continuation form) | `:59` | `4. **Distinguish pattern from coincidence.**` — the promotion bar | ✓ |
| FSPEC:658 | `:61` | the `DOMAIN-CONSTRAINTS.md` append route | ✓ |
| FSPEC:659, FSPEC:705 | `:62` | the `DECISIONS-{topic}.md` route carrying `{topic} = failure-mode-id` | ✓ |
| REQ:244, FSPEC:717 (continuation form) | `:64` | `6. **Record the pass**` — date, consumed, promoted, deferred | ✓ |
| REQ:43, FSPEC:756 | `:75` | the four-column proposal table header | ✓ |

Twelve for twelve, including the two file-less continuation anchors (`FSPEC:711`, `:717`) that v2's hand sweep missed and the
commit found. FSPEC:378 was additionally rewritten from present to past tense ("was …"), which is the right treatment for a
before/after row whose "before" no longer exists in the cited file.

### Findings open at v3

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| H1 | 6(a) adjacent-surface falsification | medium | `TSPEC-pdlc-consolidation-agent.md:179`; `docs/_constraints/pdlc-consolidation-vocabularies.md:163` | Three `consolidate-learnings/SKILL.md:NNN` anchors of the family G1 obliged to be re-swept are still stale; two land on non-content lines. The new oracle's totality conjunct reads only REQ and FSPEC, so it cannot see them | Re-measure the three anchors (`:35`→`:56`, `:41`→`:62`, `:49`→ delete or re-point), and widen `consolidationSkillAnchors.test.js`'s document set from `{REQ, FSPEC}` to every tracked citer — TSPEC and `docs/_constraints/` included — so the warranty is coextensive with the family | Local (TSPEC), Cross-Feature (`docs/_constraints/`) |
| H2 | 6(a) adjacent-surface falsification | low | `REQ-pdlc-consolidation-agent.md:41` | G3's own fix falsified this line: it states the skill "writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md`", and after `a731c101` no `{date}` form exists in the SKILL | Rewrite to the past tense the same commit applied to FSPEC:378, or to `{passId}`. REQ:41 is now the sole `{date}` occurrence in the whole spec corpus — REQ:22, :272, :278, :315, :462 and thirteen FSPEC/TSPEC/PROPERTIES sites all say `{passId}` | Local |

#### H1 — the anchor sweep and its new warranty are both scoped to two of four citing documents

G1's required fix was "re-sweep the `consolidate-learnings/SKILL.md:` anchor set against HEAD". The commit swept REQ and
FSPEC. A repo-wide sweep — `git grep -n "consolidate-learnings/SKILL\.md:[0-9]"`, excluding review artifacts — returns
**four** citing documents, not two. Measured at HEAD:

| Citing site | Anchor | Claims to point at | Actually at HEAD | Correct anchor |
|---|---|---|---|---|
| `TSPEC:179` | `SKILL.md:35` | "`:35`'s `Date Completed` boundary replaced by the block/legacy predicate" | `:35` is `No positional argument — the pass operates across the whole repo's docs/…` — the Invocation Contract, unrelated | `:56` |
| `TSPEC:179` | `SKILL.md:41` | "`:41`'s `DECISIONS-{topic}.md` route gains `{topic} = failure-mode-id`" | `:41` is `---`, a horizontal rule — no content at all | `:62` |
| `docs/_constraints/pdlc-consolidation-vocabularies.md:163` | `SKILL.md:49` | "superseding the `{date}`-only name at `…SKILL.md:49`" | `:49` is a **blank line**; and after G3 the `{date}`-only name exists nowhere in the file, so the superseded referent is unrecoverable from the citation | delete the anchor, or re-point at `:70` and restate |

Two observations make this the same finding rather than three:

1. **TSPEC:179 is not a decorative citation.** TSPEC §3.2 is the file-ownership manifest — `CLAUDE.md` makes it the input
   Phase P validates and Phase I partitions waves by. `:41` resolving to a horizontal rule and `:49` to a blank line is
   precisely the shape v1's F6 and v2's G1 took, and the shape the new suite's conjunct (ii) exists to reject. The conjunct
   is real and works (probe 5 below), it simply does not read these files.
2. **`vocabularies.md:163` is Cross-Feature and outlives this feature.** That file is on `main` (added by `809dd114`) and is
   untouched on this branch, so its `:49` was already stale before `a731c101` — but the same commit made it *doubly* false by
   removing the `{date}` name the sentence exists to supersede. `docs/_constraints/` is read by `pm-author` and `se-author`
   on **every future feature**, so a stale anchor there is the longest-lived instance of the class, not the shortest.

The mechanised warranty inherits the same boundary. `consolidationSkillAnchors.test.js:48-51` builds `docs` from exactly
`{REQ, FSPEC}`, and the totality conjunct (`:197-214`) is set-equal over that pair only. Its comment is honest about the
scope ("every consolidate-learnings SKILL citation in REQ and FSPEC") — but G1's class is the *family*, and a warranty that
covers half the family leaves the next edit free to repeat the regression in the other half. Widening the document list is
the whole fix; the oracle's machinery needs no change. DECISIONS §960's discipline is the right precedent and it says
"every anchor", not "every anchor in two documents".

Severity medium, matching G1: the substance is delivered — every one of these sentences is *true about the SKILL's content*,
only its coordinates are wrong — and no runtime artifact is affected.

#### H2 — G3's fix falsified REQ:41, the same way G1's fix falsified REQ and FSPEC's anchors

REQ:39-44 ("The cross-repo dead end") reads, at HEAD:

> When a learning says *a skill prompt itself should change*, the skill writes
> `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md` — a four-column markdown table … (`…SKILL.md:75`)

Present tense, about a shipped file. Before `a731c101` it was true: the SKILL did say `{date}` — that was G3. The commit
corrected the SKILL to `{passId}` and re-pointed the anchor on the very next line from `:54` to `:75`, but left the quoted
filename alone. So the line's line-number half was swept and its quoted-content half was not.

This is worth naming precisely because it is the round's own recurrence of its own lesson, one document away from where the
lesson was applied: FSPEC:378 got exactly the right treatment in this commit (rewritten to "was …"), REQ:41 did not. And no
oracle covers it — the new suite checks that the *SKILL* contains no `{date}` form (`:223`) but never checks the documents
that quote the SKILL.

Low: this is a motivation paragraph, the sentence's load-bearing claim is the cross-repo boundary rather than the filename,
and the module owns every write, so no artifact can be mis-named. It is nonetheless a false present-tense statement about a
shipped file in the document every downstream phase grounds on.

### Mutation probes — the new oracle is load-bearing, not decorative

The remediation's headline claim is that `consolidationSkillAnchors.test.js` "derives and never transcribes". I did not take
this on the commit message's word. Five probes, each reverted afterwards (`git status` clean at the end):

| Probe | Mutation | Result |
|---|---|---|
| 1 | `REQ:81`'s anchor `:56` → `:35` (the literal v1/v2 regression) | RED — `boundary — every citing sentence names the derived line` |
| 2 | `SKILL.md`'s `{passId}` → `{date}` (revert G3) | RED — `spells the shipped {passId} path…` |
| 3 | Drop the `Pointer/Contract` heading and the module name (revert G2) | RED — 2 failures |
| 4 | Add a new, unclaimed `SKILL.md:99` citation to FSPEC | RED — `claims the whole citation family — no citation goes unchecked` |
| 5 | Insert one blank line at `SKILL.md:30` — the exact G1 regression class | RED — all 6 claim rows |

Probe 5 is the one that matters: the suite would have caught the defect it was written for, before it shipped. Probe 4
confirms the totality conjunct is real — which is also what makes H1 a scope finding rather than a design one.

Two weak assertions worth noting without raising them as findings: `:254`'s `not.toMatch(/^\s*-? ?\[ \] /m)` is an
absence-only oracle for "no hand-execution checklist", and `:255`'s disjunction would pass on almost any prose mentioning
"the workflow script". The load-bearing halves of G2 (`:243` heading, `:247` module name) are positive assertions and both
probe red, so the finding is closed on those, not on these two.

### Clean scans

- **Criterion 1 (stubs).** `a731c101` touches four files: two spec documents, one shipped prompt file, one new test. No
  production JavaScript changed. Read the SKILL in full: its `{passId}` / `{features}` / `{skill}` braces are prompt-template
  slots, not deferred work; no `TODO`/`FIXME`/`NotImplementedError`, no coverage pragma. **0 findings.**
- **Criterion 2 (unwired integrations).** Nothing added. The G2 rewrite adds no import, config key or client; it names
  `pdlc/workflows/consolidate-learnings.js`, which exists and is the module `main` lives in. **0 findings.**
- **Criterion 3 (mock/fake data).** v1's single instance stayed gone; the diff introduces no hardcoded sample data. The one
  `{date}` string the diff leaves behind is a stale *claim*, filed as H2 under criterion 6, not fake data. **0 findings.**
- **Criterion 4 (coverage).** Re-measured at HEAD, unchanged and above floor — see §3.
- **Regressions from the fixes.** `a731c101` removed a section from a shipped prompt file, which is the kind of edit that
  silently breaks a verbatim pin. TSPEC:2462 obliges four verbatim conjuncts over two SKILL files, located by heading rather
  than line index; both consolidate-learnings conjuncts (the block/legacy predicate, the `{topic} = failure-mode-id` route)
  survive at `:56` and `:62`, and `consolidationBuild.test.js` is green. The harvest-learnings family is clean at HEAD across
  all three of its citers (`REQ:626`, `FSPEC:1498`, `vocabularies.md:81` → `:70-78`, with `Harvested from` at `:77` and
  `Phases exercised` at `:78`; `TSPEC:180`'s `:72-78`/`:77` both true). **0 regressions.**
- **Deferral binding (criterion 6b).** Unchanged and still bound: `D-CONS-*` names `pdlc-engineering-loop`, which has both a
  queue row (`docs/_queue/QUEUE.md:41`, Order 6, `pending`) and a REQ file. **No unbound deferral.**

### Environment observations (not findings)

- `node pdlc/workflows/build-runtime.mjs --check` → exit 0, all five artifacts in sync. Correct: the diff changed no bundled
  source, so no rebuild was owed.
- `pdlc/hooks/scripts/sync-workflows.sh --check` → exit 0 (with the documented `pdlc.config.json` unreadable notice).
- Full gate `npm test` → 102 of 103 suites, **4229 passed / 70 skipped / 1 failed**. The single failure is
  `documentOracles.test.js` AT-22. I checked rather than assumed: every violating path it reports is untracked
  (`.serena/cache/typescript/document_symbols.pkl`, `.serena/cache/typescript/raw_document_symbols.pkl`,
  `.tokensave/tokensave.db` — `git ls-files --error-unmatch` fails on all three). `CLAUDE.md` documents this false-red
  explicitly. **Not a defect.**
- Consolidation suites: **19 passed, 610 tests, 0 skipped** (was 18/596 at v2). The 70 repo-wide skips remain
  environment-gated; no consolidation suite carries an unconditional skip.

---

## §2 Requirements Traceability

`a731c101` touched no implementation and no AC-bearing test. §2 is therefore **carried forward from v2 unchanged**, all 34
rows with both an implementation path and a failing-test path, and re-verified only where the diff could have disturbed it:

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Sev | Scope |
|---|---|---|---|---|---|---|---|
| 1–34 | — | Carried from `CODE_REVIEW-…-v2.md` §2 | unchanged | unchanged | No | — | — |
| 9 ▲ | REQ AC-2.2 | DECISIONS route, `{topic}` = failure-mode-id | `consolidate-learnings.js:1545`, `:1812` | `consolidationIdentity.test.js`; SKILL prose pin re-verified at `SKILL.md:62` | No | — | — |
| 16 ▲ | REQ AC-3.5 | Proposal-file fallback | `:2168` `proposalPathFor`, `:2425` `renderProposalFile` | `consolidationOperatorChannels.test.js`; `consolidationSkillAnchors.test.js:219-224` now pins the SKILL's name against `proposalPathFor` itself rather than a transcribed string | No | — | — |
| 1 ▲ | REQ AC-1.1 | Un-consolidated predicate, as edited into the SKILL | `:1401` `triggerFor`; predicate | `consolidationPass.test.js`; SKILL prose pin re-verified at `SKILL.md:56` | No | — | — |

**`req_gaps: 0`.** Both remaining findings are documentation-coordinate defects in criterion 6, not missing implementation
and not missing tests.

---

## §3 Criterion-by-Criterion

**Criterion 1 — No stubs in production code.** Clean. The diff contains no production JavaScript. I read the rewritten
`SKILL.md` in full rather than diffing it, because G2's fix was a structural rewrite of a shipped prompt: no deferred-work
marker, no hollow section, template braces only where a prompt template belongs. *0 findings.*

**Criterion 2 — No unwired integrations.** Clean. Nothing new to wire. The one integration claim the diff *adds* — that the
SKILL is backed by `pdlc/workflows/consolidate-learnings.js` — is true, and is now asserted positively by a test that reds
when the name is removed. *0 findings.*

**Criterion 3 — No mock/fake data in production.** Clean, and now guarded rather than merely fixed: `proposalPathFor` is
imported by the anchor suite and the SKILL's filename is compared against the function's own output, so the two cannot drift
apart again by transcription. *0 findings.*

**Criterion 4 — Branch coverage ≥ 85% and property-based testing.** Passes, unchanged:

```
node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage \
  --collectCoverageFrom='consolidate-learnings.js' --testPathPattern='consolidation'

Statements   94.26%  |  Branches   87.25%  |  Functions   93.65%  |  Lines   96.14%
Test Suites: 19 passed · Tests: 610 passed, 0 skipped
```

Identical to v2's figures, which is the expected result: the diff added 257 lines of test over documentation surfaces and no
module code, so it can neither raise nor lower module coverage. Property-based testing remains present (seeded-PRNG
generators, PROP-GEN-*/PROP-DIS-*), and the new suite adds a *derived* oracle rather than a fixture — the class of test this
repo's post-mortems repeatedly ask for. *0 findings.*

**Criterion 5 — Requirements delivered.** Passes. All 34 rows carry both halves; v1's six gaps stayed closed. I re-checked
the two rows whose implementation the SKILL prose is pinned against (AC-1.1's predicate, AC-2.2's `{topic}` route) because
the diff rewrote the file carrying those pins, and both pins hold at their new lines. No AC's final operator-visible
artifact is affected by this diff: no writer was added, removed or reordered, and item 10's single-writer trace from v2
(`renderReportBody`, one production caller, no later re-render) is undisturbed. *0 findings.*

**Criterion 6 — Integration-boundary integrity.** Two findings; again the only criterion the round did not close.

*(a) Adjacent-surface falsification.* The round closed G1 for REQ and FSPEC convincingly — twelve anchors independently
re-measured, two continuation-form anchors found beyond the nine v2 enumerated, and a derived oracle that reds on the exact
regression. It did not close the family: **H1**, three anchors still stale in TSPEC §3.2 and in a `docs/_constraints/` file,
two of them on a horizontal rule and a blank line, with the new warranty's document set drawn narrower than the finding it
discharges. **H2** is the smaller and sharper instance — G3's own fix falsified REQ:41's quotation of the name it corrected,
in a document whose next line the same commit re-swept. Sweeping the family myself: `git grep` over all tracked non-review
files returns four citers for the consolidate SKILL (REQ, FSPEC, TSPEC, `vocabularies.md`) and three for the harvest SKILL;
the harvest set is clean at HEAD, the consolidate set is clean in the two documents the commit read and stale in the two it
did not.

*(b) Sibling-surface omission.* **Closed.** G2's third family member now opens with the same `— Pointer/Contract` heading and
delegation sentence as `orchestrate-dev` and `orchestrate-queue`, names its bundle, carries an `Invocation Contract`
section in the sibling shape, and states what hand-execution bypasses. The descriptive body is retained deliberately and
correctly — it is what REQ and FSPEC anchor into, and it is now framed as the contract the module implements rather than as
steps for a reader to perform. The hand-execution checklist is gone. Three of the four assertions covering this are
positive and two probe red.

*(c) Deferral binding.* Clean. No prose-only successor.

**boundary_gaps: 2** (H1, H2).

---

## §4 Recommendation

Not done, but the remainder is now one document-sweep commit wide, and the trend across three rounds is unambiguous: round 1
was six requirement gaps and a broken PR route; round 2 was zero requirement gaps and three documentation gaps; round 3 is
zero requirement gaps and two coordinate defects in the same class, one of them pre-existing on `main`.

What this round did well is worth recording, because it changes what the remaining work is: the fix did not merely correct
the nine anchors it was handed, it went looking and found two more that v2's hand sweep had missed, and then it built the
oracle that makes the class mechanically impossible to reintroduce. Every probe I ran against that oracle went red,
including the precise regression that produced G1. That is a real oracle, not a green-looking one.

The gap is that the oracle's reach was set to the two documents the finding happened to enumerate rather than to the family
the finding was about — so the same defect survives, untested, in TSPEC and in `docs/_constraints/`.

1. **H1 first, and fix the warranty in the same commit as the anchors.** Re-point `TSPEC:179`'s `:35`→`:56` and `:41`→`:62`;
   for `vocabularies.md:163`, prefer deleting the anchor over re-pointing it, since the `{date}` name it supersedes no longer
   exists in the file and a coordinate onto a deleted referent will go stale again. Then widen
   `consolidationSkillAnchors.test.js:48-51` from `{REQ, FSPEC}` to every tracked citer. Deriving that list from `git grep`
   rather than a literal would make the totality conjunct total in the sense G1 meant.
2. **H2 is a one-line edit** — apply FSPEC:378's own treatment to REQ:41. Consider whether the widened oracle should also
   assert that no citing document quotes a proposal-filename form `proposalPathFor` cannot produce; that is the assertion
   that would have caught H2, and it is two lines beside the check already at `:219-224`.

Neither finding can produce a wrong artifact at runtime — the module owns every write, and all 34 ACs trace end to end. They
mislead readers and the agents that ground on these files, which in this repo is the failure mode the pipeline exists to
catch. One more round should close it.

## §5 Verdict

VERDICT: Needs revision

---

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 87.25, "req_gaps": 0, "boundary_gaps": 2}
