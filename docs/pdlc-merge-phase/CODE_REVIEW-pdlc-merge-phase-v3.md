# CODE REVIEW — pdlc-merge-phase (v3)

| Field | Detail |
|---|---|
| Feature | pdlc-merge-phase |
| Branch | feat-pdlc-merge-phase |
| Review version | 3 |
| Date | 2026-08-02 |
| Verdict | Pass |
| Branch coverage (lowest new module) | 85.58% (`orchestrate-queue.js`); `orchestrate-dev.js` 85.94% — unchanged, no production source touched in v2 or v3 remediation |
| Requirements traced | 50/50 |

**Scope:** delta re-verify at HEAD `dd36b14acae439f2f927c5762fe131574c2763f3`. The remediation
diff under scan is `git diff 18068dc..HEAD` — commit `dd36b14`, **two files, two lines**:
`CLAUDE.md:172` and `pdlc/skills/orchestrate-dev/SKILL.md:68`. No production source, no test, no
generated artifact. Criteria 1–4 are therefore not re-scanned over unchanged code, and the §2
traceability table is carried forward from v1/v2 unaltered.

**Counts:** stubs 0 · mock_data 0 · unwired_integrations 0 · coverage_below_threshold false ·
req_gaps 0 · boundary_gaps 0.

## §1 v2 Finding Remediation

**v2 finding 1 — escalation-contract wording over-claimed in two new doc sites. CLOSED.**

The v2 finding had two parts and a stated required fix for each. Both were taken.

**(a) The escalation claim is now scoped, and the four conditions named are the right four.**
This is the substantive half, so I verified the named set against both the REQ and the code
rather than accepting the enumeration.

| Named in `CLAUDE.md:172` | REQ AC-6.2a reference | Catalogue member | Emitting call site |
|---|---|---|---|
| guard fired | AC-3.2 | `MERGE_ESCALATIONS.guard` (`orchestrate-dev.js:1242`) | `:828` (guard matched) and `:840` (changed-file list unretrievable, AC-3.4) — two sites, one condition |
| CI evidence refused | AC-4.2 | `MERGE_ESCALATIONS.ci` (`:1243`) | `:869`, gated on `ci.escalate` |
| merged-but-queue-not-updated | AC-5.2 | `MERGE_ESCALATIONS.queue` (`:1245`) | `:1428` |
| post-merge tree failure | AC-5.7 | `MERGE_ESCALATIONS.tree` (`:1247`) | `:1461` |

The set is exactly AC-6.2a's `(AC-3.2, AC-4.2, AC-5.2, AC-5.7)` — four conditions, no fifth, no
omission. It is also exactly the membership of the frozen `MERGE_ESCALATIONS` catalogue
(`:1241`–`:1249`), whose closure is independently pinned by `mergePhase.test.js:985`
(`PROP-M-19`). Grep for `MERGE ESCALATION` across the module returns those four templates and
five call sites, with no sixth escalation constructed anywhere.

The v2 defect itself is gone: both sentences now say a non-merge is reported **with a one-line
reason**, and that a closed set of four conditions *additionally* raises the notice. That
matches the code — every non-merge path pushes `MERGE_NOTES.mergeDeferred` (`:1374`) while
`escalations` stays `[]` unless one of the four fires. The v2 finding's precise failure mode —
an operator told to grep `MERGE ESCALATION:` after a CI-pending deferral, finding nothing — is
closed, because the reason line is now the documented primary channel and it is universally
present.

"nothing in this phase halts the pipeline" is also correct: `phaseMerge`'s outer catch
(`:1476`–`:1492`) maps any throw to `row: "internal"` rather than propagating, and the phase's
glyph is never `❌` (`:6604`–`:6611`), which is what the halt path reads to derive a failed
phase.

**(b) The precondition enumeration no longer claims a count.** `SKILL.md:68` now opens "A merge
requires every precondition to hold" and lists seven items including **unresolved review
threads** — the AC-1.2 precondition the v2 wording omitted, and the one with its own GraphQL
observation (`observeReviewThreads`, `:549`). `CLAUDE.md:172` likewise gains "unresolved review
threads" to its inline list. The v2 fix offered two ways out — drop the count, or make the
enumeration AC-1.2's exactly — and the first was taken, which is sufficient: with no count
asserted, an illustrative list that also names ladder rows (`mergeMode`, idempotence) is
accurate rather than a miscount.

## §1b New Findings in the Remediation Diff

**None.** The diff is two prose lines. I checked each new clause against the implementation, not
against the specs: the four escalating conditions (verified above), the seven listed
preconditions (`:826` guard, `:929` capabilities, `:889`/`:897` mergeable, `:913` review
threads, `:862` CI, `:757` `mergeMode`, `:806` already-merged), the `off` default (`:60`), and
the non-halting claim. No clause is contradicted by the code.

## §2 Requirements Traceability

Carried forward from `CODE_REVIEW-pdlc-merge-phase-v1.md` §2 **unchanged**, as in v2: all 50 rows
(REQ-MERGE-01 AC-1.1 … REQ-MERGE-07 AC-7.3, plus NFR-1…NFR-5) trace to both a production path and
a falsifiable test, and the `Gap?` column is `No` on every row. No row is touched: this round
changed documentation only. `req_gaps: 0`.

## Regression Checks

Every gate re-run at this HEAD, not inherited from v2:

| Check | Result |
|---|---|
| `cd pdlc/workflows && npm test` | 61/62 suites, **2941 passed, 1 failed, 70 skipped** — counts byte-identical to the v1 and v2 runs. The single red is still `documentOracles.test.js:246` reporting the untracked `.tokensave/tokensave.db`, the environmental false positive CLAUDE.md documents and PLAN §8 K-6 pre-registers. Green in CI |
| `orchestrateDevSkill.test.js` `PROP-SKILL-06` | Green; `wc -l pdlc/skills/orchestrate-dev/SKILL.md` = **97**, under the 100-line budget. The edit was net-zero in line count |
| `node pdlc/workflows/build-runtime.mjs --check` | exit **0** |
| `pdlc/hooks/scripts/sync-workflows.sh --check` | exit **0** — the v1 finding-1 sync is still in place and has not drifted |
| Stale-disclosure grep (`never merged` / `never auto-merged` / `halted (uncommitted)` / `Six preconditions`) over the six rewritten doc sites | no matches |
| `coveredViolations` document-drift oracle | no new violation, despite the diff touching two files it walks (`pdlc/skills/orchestrate-dev/SKILL.md` is named at `documentOracles.test.js:238`) |

All six DoD criteria pass.

## Notes

**One advisory, deliberately not filed as a finding — and the reasoning, so the next reviewer
does not re-derive it.** `CLAUDE.md:172` labels the second escalating condition "CI evidence
refused". The escalation actually fires only on the AC-4.2 case — `no-checks` with
`mergeRequiresCi` true (`ciRule`'s `escalate: true` at `:687`); CI `pending` (`:693`), `failed`
(`:696`) and unknown (`:703`) all refuse with `escalate: false`. So the compressed label is
broader than the condition it names. I am recording this rather than filing it, on three
grounds. First, the enclosing sentence now routes the operator correctly in **every** case: the
one-line reason is documented as the universal channel and is universally present, so no reader
is sent looking for a notice that will not exist — that was the material defect in v2 and it is
gone. Second, the label tracks AC-6.2a's own reference (`AC-4.2`), so the doc and the REQ agree
about which condition is meant even where the four-word compression is loose. Third, the
authoritative domain is stated in REQ AC-6.1a/AC-6.2a and mechanically pinned by `PROP-M-19`, so
the contract is not resting on this prose. Same disposition, and same reason, as v2's advisory
about `CLAUDE.md:167`. If a later editor is in that paragraph anyway, "CI evidence absent when
required" is the exact phrase.

**PLAN §8 K-1 remains correctly open.** Untouched by this round. The two-runner `git --version`
reading is deferred to the first CI run and read in Phase DOD/PUB, per the PLAN's own text;
`updateDefaultBranch` (`:1117`) and the unconditional `--empty=drop` (`:1164`) are unchanged.
The v1 assessment stands: recorded in four places, fallback pre-approved, failure mode fail-safe
(an AC-5.7 escalation, never a wrong merge decision).

**Deferral bindings unchanged and intact.** D-MERGE-01/02 → queue row 14
(`docs/_queue/QUEUE.md:27`), D-MERGE-04/05 → row 16 (`:29`), D-MERGE-03 declined by design.
CR-ERRATA's three items remain document-shaped and routed for harvest.

**For the record, since this is the round that passes.** `mergeMode` ships `off`
(`orchestrate-dev.js:60`) and this repo has no `.claude/pdlc.config.json`, so Phase MERGE
resolves `skipped` here until an operator opts in — the AC-7.2 shipped state, not a gap. And per
REQ §6 BL-04 and PLAN §8 K-5, the `merged` path cannot be exercised end-to-end in `yumo-plugins`
at all, because REQ-MERGE-03's guard fires on every PR this queue raises. A future reader should
not read "never observed merging in `yumo-plugins`" as "never worked": the path is evidenced by
`mergePhase.test.js:154`'s row table and `mergeQueueDriver.test.js:212`'s two-invocation
selection test, which is the evidence standard the REQ itself specifies.
