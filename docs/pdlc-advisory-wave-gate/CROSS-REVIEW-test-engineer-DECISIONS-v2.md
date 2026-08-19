# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.1)
**Date:** 2026-08-20
**Iteration:** 2
**Scope:** Delta re-review, testing lens only. Verified that v1's three High findings (F-01 `commit-tree -m`, F-02 git-verb enumeration, F-03 the `waveBudgetPerRun: 0` coverage claim) are resolved, and scanned only the sections the v1→v1.1 diff touched for new testability defects. Unchanged sections already reviewed in v1 are not re-litigated.

## Resolution of v1 findings

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | Option D's cell and DEC-A6-01's decision line now read `git commit-tree {tree} -p {head} -m "…"`, transcribed from TSPEC §2.5 (`TSPEC:282`), with a paragraph naming the literal as load-bearing. The oracle limitation is stated rather than assumed away. See F-01 below for a defect in the *reason* offered, not the transcription |
| F-02 | High | **Resolved** | "Five new git verbs enter this workflow, not two" now enumerates `write-tree`, `commit-tree`, `update-ref`, `read-tree`, `clean`. Verified at HEAD: each is 0 occurrences in `pdlc/workflows/orchestrate-dev.js`; the only `"clean"` strings are `parseRebaseStatus`'s status vocabulary (`orchestrate-dev.js:9920`, `:9923`, `:10441`), and the reuse set `add`/`reset`/`rev-parse` is right — `reset --hard` ships once, on the seam-revert path (`orchestrate-dev.js:2870`) |
| F-03 | High | **Resolved (over-corrected)** | The consequence no longer claims AT-01-4/AT-01-6 falsify a collapse, admits the gap and routes it as a TSPEC erratum. The enumeration is now too strong in the other direction — see F-02 below |
| F-04 | Medium | **Resolved** | DEC-A6-04 now separates dispatch level from mechanism level and states capture-before-budget ordering, matching TSPEC §3.2 step 3 (`TSPEC:504-514`) and the `reason: "budget-exhausted"` literal (`TSPEC:512`, `:1144`) |
| F-05 | Medium | **Resolved** | Option A's rejection is now explicitly "stated but not falsifiable", names the missing two-A6-wave set-equality oracle over `{a6-snapshot-1, a6-snapshot-2}`, and routes it as a TSPEC erratum. `TSPEC:973` still carries the property with no fixture behind it, so the admission is accurate |
| F-06 | Medium | **Resolved** | Rewritten and now correct at HEAD: `.claude/pdlc.config.example.json` carries exactly `dispatch` and `implementation` with no `advisory` section, and `pdlc/engine/__tests__/ci-arrangement.test.js` contains zero occurrences of `advisory` (it reads the example at `:39` and asserts `implementation.testCommand` at `:799-818`). "Authoring a new expectation, not relocating one" is the right sizing |
| F-07 | Low | **Resolved** | DEC-A6-02 now names TSPEC §7's AT-04-5 test-mapping row as the message oracle and states that FSPEC's AT-04-5 does not range over the message; the O-8 disagreement is stated and routed (`TSPEC:139` still reads the option-A shape, so the claim holds) |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | The new `-m` paragraph justifies the literal with a mechanism claim that is false at HEAD: "a `-m`-less capture **blocks** against the shipped transport". It does not block. `defaultGit` runs `execFileSync("git", argv, { stdio: "pipe", encoding: "utf8" })` with no `input` (`orchestrate-dev.js:11659-11663`), so the child's stdin is an empty, closed pipe; `commit-tree` reads EOF and succeeds with an empty message. Measured directly against a scratch repo through that exact call shape: exit 0 in 14 ms, commit created, `%B` = `"\n"`. The correction makes the paragraph's own conclusion *stronger*, and it should say so: the omission is not self-revealing at runtime, it is silent, so neither §5.5's argv double nor §5.6's real-repo fixture goes red — a snapshot commit's message is invisible to a content-hash-map oracle. As written, a reader takes "it blocks" as a runtime backstop for a literal the document has just said no test guards | DEC-A6-01, "Decision" |
| F-02 | Medium | Local | The `waveBudgetPerRun: 0` consequence now under-counts existing coverage, which is the same enumeration defect as v1 F-03 with the sign flipped. It enumerates AT-01-4, AT-01-6 and AT-07-2b and concludes "**Nothing anywhere** exercises the behaviour this entry rests on". TSPEC v1.5 — the version this document declares upstream — added a §5.2 case, "a wave entered over budget still captures, and dispatches nothing" (`TSPEC:1142-1151`), asserting on one run that the disposition is `escalated` with `reason: "budget-exhausted"`, that record and escalation entries are written, that the snapshot was still taken, and that **no `_agent` call occurs**. That is the same code path `0` takes on its first red wave (`waveBudget.resolved >= waveBudgetPerRun`, `TSPEC:498`), and it covers two of the entry's three named facts. What remains genuinely uncovered is narrow and should be stated as such: no fixture pins the **`0` literal** as the configured value, and none asserts the **sixth summary row reading zero**. Left as "nothing anywhere", the routed erratum asks TSPEC for an AT it half has, and the collapse-risk sentence overstates what a future "simplification" would get away with | DEC-A6-04, "What follows from DEC-A6-04" |
| F-03 | Low | Local | The transcription-site count for the envelope literal is one short of the hand-sync surface it is meant to size. `["E-1", "E-2", "E-3", "E-4"]` appears at six *code* sites under `pdlc/workflows/__tests__/` (`advisoryEnvelope.test.js:284`, `advisoryDisabled.test.js:129`, `:616`, `advisoryHarvest.test.js:196`, `helpers/advisoryDoubles.js:242`, `:340`), which matches "six more" exactly — but a seventh transcription sits in `advisoryDoubles.js:234`, the comment that records *why* the frozen shape must be hand-synced. A comment that restates a set-equality literal is a maintenance site like any other: it is what a later editor reads to decide whether the copy below is still right, and a stale one there is how the partial edit this bullet exists to prevent gets rationalised. The seam-literal count is exact as written — six sites, verified (`advisoryEnvelope`, `advisoryRecord` ×2, `advisoryHarvest`, `consolidationProperties`, `helpers/advisoryDoubles`) | "What follows for the whole feature" |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Given F-01 — that a `-m`-less `commit-tree` succeeds silently with an empty message rather than failing — is the snapshot commit's message worth one cheap assertion in §5.5's argv sequence (`commit-tree` argv contains `-m`), or is the message genuinely unobserved by any downstream consumer, including the halt message that names the ref for an operator to `git show`? If the latter, the paragraph's "not optional and not cosmetic" is a convention, not a correctness claim, and reads better as one |
| Q-02 | v1 Q-01 (whether AT-05-1 pins the *ordered* restore sequence `read-tree -u` → `clean -fd` → `reset --mixed`, or only the content-hash map) was not addressed in this revision. It is not gating and the ordering is now stated in the decision line, but a reordering that puts `reset --mixed` before `clean` still passes a content-only oracle on the fixtures §5.6 describes. Is that ordering meant to be a tested invariant or an implementation note? |

## Positive Observations

- Every claim this revision added about HEAD that I could check mechanically holds, including the ones that were wrong in v1 and are the whole reason for the round: the five-verb enumeration (0 occurrences each), the `clean`-is-rebase-vocabulary carve-out, `reset --hard` shipping exactly once at `orchestrate-dev.js:2870`, the two-section example config, and zero `advisory` occurrences in `ci-arrangement.test.js`. The engine-channel bullet went from a false coupling claim to a correct one *and* kept the product reason for doing the work anyway.
- The wave-contract constraint was tightened to quote the shipped prompt in full — `Do NOT run git add or git commit — the orchestrator verifies your work and commits it.` (`orchestrate-dev.js:9701`) — and, more usefully, names *which half* is load-bearing: the `git add` prohibition is what makes "index equals HEAD at gate time" true, which is the premise the `reset --mixed` exactness argument rests on. That is a premise made falsifiable rather than assumed.
- Three separate places now say "this is decided but not tested" and route the oracle upstream instead of asserting coverage that does not exist (option A's ref-per-wave rejection, the `0` collapse guard, the engine-channel expectation). Admitting an untested decision is the correct move for a DECISIONS document, and it is what makes the residual findings above small.
- The `advisoryDoubles.js` coupling paragraph is the best addition in the revision from a test-engineering angle: it names the failure mode precisely — a partial edit reddens files that never mention the changed constant, with a reason the record cannot predict — and keeps the one-task sequencing while correcting its size. That is PLAN-actionable.

## Recommendation

**Approved with minor changes**

All three v1 High findings are resolved against code, not against prose. The two Medium findings are corrections to reasoning inside sections this round rewrote — F-01 replaces a false runtime backstop with the stronger true statement, F-02 narrows an over-stated coverage gap so the routed TSPEC erratum asks for the right AT. Neither blocks; both are one-sentence edits.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
APPROVAL-HASH-NORMALIZED: sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
REVIEWED-COMMIT: d40e14e2c45b6b74657c790295584fee9a9b7089
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:93385165ef7c7ad8ce2c87d990c48007fa80090dcd8980cb980513692611b4f2
