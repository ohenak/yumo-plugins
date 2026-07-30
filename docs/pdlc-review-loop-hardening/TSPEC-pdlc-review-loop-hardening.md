# TSPEC — pdlc-review-loop-hardening

**Version:** 1.1
**Status:** Draft (round-1 cross-review feedback addressed; awaiting round 2)

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` (REQ **v1.6**, FSPEC **v1.6** — both amended by this revision, see §0) |
| Downstream | `DECISIONS, PLAN, PROPERTIES, IMPL` |
| Cross-Reviews | `docs/pdlc-review-loop-hardening/CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` (link list while active; harvested into `LEARNINGS-pdlc-review-loop-hardening.md` after Phase H) |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` |

---

## 0. Changelog

### v1.1 (2026-07-30) — round-1 cross-review feedback

Addresses **every** High and Medium finding of `CROSS-REVIEW-product-manager-TSPEC-v1.md` (2 High,
3 Medium) and `CROSS-REVIEW-test-engineer-TSPEC-v1.md` (3 High, 5 Medium, 2 Low), and settles the
four open questions the two reviews contested. The two reviews overlapped on exactly two defects;
each shared defect was fixed **once, at its root**, not patched per site.

**In both cases the correct fix was deletion of an over-generalised clause, not addition of a
reconciling one** — the same shape this feature's FSPEC phase converged on (post-mortem lesson R-5).
The mode-blind trailer conjunct was *removed* from the greenfield path rather than given a class
exception, and the global pre-step-1 POSTMORTEM gate was *demoted* to a per-path query rather than
given an exemption list.

| Finding | Severity | Resolution | Where |
|---|---|---|---|
| **PM F-01** | High | **Fixed.** §2.5 placed `checkPostmortem` before the approval skip and refused unconditionally, inverting AC-2.3b and FSPEC §12.4 and making that section's worked example A unreachable. Root cause: §11.5's *forced-path-only* rule had been lifted into a global pre-step-1 gate. The gate is now split — unconditional refusal on the **forced** path (step 1), refusal at new **step 4a** only when the phase would otherwise run, and **report-only** when the approval skip has already elided the phase. §5.8 states plainly that `checkPostmortem` is a query, not a gate. Worked example A re-verified reachable. | §2.5, §5.8, §6.2 rows 13/13a |
| **PM F-02 ≡ TE F-02** | High | **Fixed by deletion, at the root.** §5.6's terminal test was `trailer.complete && isComplete(…)` with no mode condition, while §7.4 amends only the three *author* SKILLs — so a wrapped `pm-review`/`se-review`/`te-review`/`dod-verify`/`harvest-learnings` episode could never terminate, would burn all 6 dispatches and halt, reconstructing **H-3**. The unconditional conjunction is gone: new §5.6.2 `isTerminal(mode, …)` returns structural completeness **alone** on a greenfield episode and completeness **and** the trailer on a revision episode, per FSPEC §8.4. §4.3 now states `parseRevisionComplete` is called only on a revision episode. | §5.6.2, §4.3, §6.2 rows 9/9a |
| **PM F-03 ≡ TE F-01** | High | **Fixed.** `EpisodeKey.mode` was a coordinate no specified function computed. New **§5.6.1 `selectMode`** is that function, and it is the only one: mode is selected **once at episode entry** from what the phase is dispatching an author to do, revision test first, decided from the review artifacts on the branch, **independent of the artifact's structural state**, failing toward revision (AC-3.5 scope (d), FSPEC §15.2). The retracted "derive mode from disk" rule is named and explicitly *not* reinstated. §5.6.3 now states that its `invocation === 1 && target absent/empty` rule selects the **prompt kind, not the mode** — all four (kind, mode) combinations occur. | §5.6.1, §5.6.3, §3.7, §4.5 |
| **TE F-03** | High | **Fixed — aligned to the FSPEC.** AT-19 as written derived its seam set from `main()`'s parameters, which is red on a correct tree: `_now()` is *correctly* called synchronously at four sites in `checkPrCi`, and `main()`'s wrapper `rawAgentFn(skill, prompt, {…})` is a correct un-awaited `_agent` alias call site. AT-19 now uses FSPEC's **closed thirteen-name list**, with the alias and returned-promise cases ruled explicitly. | §8.5, §3.10 |
| **TE F-04** | Medium | **Fixed by a machine-checkable predicate**, replacing the hand-list that left `_rebaseOntoDefault`, `_dodVerifyLoop` and `_raisePrAndVerifyCi` satisfied by nothing. Membership is now derived from the parameter's **own declaration**: E-1 default resolves to a non-function policy value; E-2 no `=` initialiser at all; E-3 default is a function declared in this module whose destructured parameter list contains `_agent`. The reviewer's suggested predicate ("locally-defined function default") was measured against the tree and **declined as too wide** — `defaultListFiles`, `defaultGit`, `defaultWriteFile`, `defaultAppendFile` and `defaultRecordHalt` all match it yet are genuine capability seams. The "an unused exemption entry is also a failure" clause is kept, and a second anti-rot clause added (exempt-**and**-wired is a failure). | §8.5, §3.10 |
| **TE F-05** | Medium | **Fixed.** §5.3's pre-count was count-only and collapsed E-14 into E-15. It is now a count **and** a comparison: 0 ⇒ append; 1 **equal** ⇒ E-14 idempotent no-op; 1 **unequal** ⇒ E-15; ≥2 ⇒ E-15. | §5.3, §6.2 rows 4/8 |
| **TE F-06** | Medium | **Fixed.** `deriveRoundWindow` had no carrier for AT-05's `skipped non-conforming: …` text. It now keeps rejects and returns `{ ok, startIndex, endIndex, present, skipped }`, `skipped` being `{ basename, reason }` rows. | §5.2, §3.7 |
| **TE F-07** | Medium | **Fixed.** §7.2 edit 2 never wired `_recordHalt` into `QUEUE_ENTRY`'s `_runPipeline` closure, and added `_listFiles`/`_appendFile` to `__queue.main`, which per §3.6 accepts neither. Edit 2 is split into **2a** (`QUEUE_ENTRY`'s injection object gains `_git: rtGit` **and nothing else**) and **2b** (the `_runPipeline` closure gains `_recordHalt`, spelled out). | §7.2, §3.5 |
| **TE F-08** | Medium | **Fixed — the existing library is used.** `pdlc/workflows/__tests__/helpers/driftGenerators.js` was uncited. §8.2 now carries a seven-row property table reusing its `seeded` / `resolveSeed` / `shrink`, with replay-not-index reproduction via `PDLC_PROP_SEED`; §9.4 records the reuse. | §8.2, §8.1, §9.4 |
| **PM F-04** | Medium | **Fixed.** Carried items were bound to prose owners, contrary to `DC-08`. A new **`blocked` row 8 `pdlc-authoring-contract`** in `docs/_queue/QUEUE.md` (row-6/row-7 convention, depends on this feature) is now the named successor surface for **Q-09** (the acute one — a live false-halt risk), **T-Q-03** and **Q-05**. No existing queue row was altered; row 0's `halted` status is untouched. | §10.2, §10.3, `QUEUE.md` |
| **PM F-05 ≡ T-Q-01** | Medium | **Settled as a slip and corrected at REQ altitude** — see §0.1 below. | REQ, FSPEC, §5.5, §5.7, §6.2 row 12, §10.3 |
| **TE F-09** | Low | **Fixed.** `parseApprovalHash`'s behaviour when `REVIEWED-COMMIT:` is absent is now stated: `reviewedCommit` is the literal `"unavailable"` when the line is absent, duplicated or non-hex, and a missing corroboration line is **never** a `HashFailure`. | §3.7, §4.3 |
| **TE F-10** | Low | **Fixed, and the reviewer's premise confirmed by measurement.** §8.3 claimed "the suite must stay green", which is false at HEAD. Measured baseline: **1038 passed / 1 failed / 70 skipped, 1109 total, 36 suites**, the one failure being `documentOracles.test.js`'s intentional `AT-22 [red-until-L-06]`. The gate is now stated as **no new failures against that baseline**, not absolute green. The AT-22 name collision is real, so this feature's test names are namespaced **`RLH-AT-{N}`**. | §8.3 |

**Open questions settled in this revision** (all four now closed or bound; none left to prose):

| Q | Disposition |
|---|---|
| **T-Q-05** | **Closed, not carried.** Declined the duplicate-row-helpers alternative **on the merits**: a second copy of the queue's table grammar risks a silent wrong-row rewrite, which is strictly worse than bytes. The measurement is stated in §7.2 per `DC-02` — the queue bundle already inlines all of `orchestrate-dev` at 140,096 B / 3,540 lines against the dev bundle's 92,525 B / 2,377 lines, so the larger artifact has been in production since `pdlc-workflow-distribution` landed with no observed size problem. |
| **Q-06** | **Declined and closed.** Provenance on the `RESOLVED:` marker would be a *second* agent-unwritable field, **nothing branches on it** (§5.8 parses the boolean only, per C-5), and git already carries author and timestamp more reliably than a hand-typed field. |
| **Q-05** | **Correctly carried, now bound** to `QUEUE.md` row 8. No product exposure today — §5.9 normalises numeric prefixes — but it needed a successor surface. |
| **Q-09** | **Carried, bound** to `QUEUE.md` row 8, and flagged as the acute one: script-side heading lists drifting from the SKILL templates produce a **false halt**. |

**Nothing was declined without a stated reason, and nothing is left unresolved.** The two items
declined outright are Q-06 (above) and TE F-04's suggested exemption predicate (declined as
measurably too wide, and replaced with a narrower one rather than dropped).

### 0.1 REQ v1.6 and FSPEC v1.6 — an amendment to two already-approved upstream documents

`PR` (PROPERTIES) was missing from AC-4.7's skip-eligible phase set. Both round-1 cross-reviews
raised it independently and without reference to each other (PM **F-05**, TE **T-Q-01**), and the
operator ruled it a **drafting slip**, directing the correction upstream rather than a workaround
here. Amending approved upstream documents downstream of approval is deliberate and authorised, and
is recorded prominently in all three changelogs precisely because it is not routine.

The argument for "slip" rather than "judgement being reversed" is internal to the REQ. AC-4.7's own
functional criterion — convergence established by a reviewer-pair cross-review artifact for a named
document — is satisfied by PROPERTIES. The decisive evidence is **AC-4.7a**, which declines a
persisted verdict on `CODE_REVIEW-*` on the express ground that an out-of-scope phase's record would
have no reader: under the five-phase set, AC-4.2's verdict and AC-4.2b's approval record *were*
written for PROPERTIES cross-reviews and then read by nothing — the exact unread record AC-4.7a
exists to forbid.

- **REQ → v1.6:** AC-4.7's enumeration becomes `R, F, T, P, D, PR`.
- **FSPEC → v1.6:** §10.7 (comparison scope), §11.1 (catalogue; `all` means **six**), §11.3 (parse
  table and the rejection halt text).
- **This document:** §5.5's scope, §5.7's `valid` array `["R","F","T","P","D","PR"]`,
  `parseForcePhases`'s catalogue **and its rejection message**, §6.2 row 12, and AT-29's expected
  operator text, now `Valid: R, F, T, P, D, PR, all.`

The widening is one token in a closed enumeration. No mechanism changed and no clause was withdrawn:
`PHASE_DISPATCH` already carried six document-review phases, FSPEC §16.2 already enumerated
PROPERTIES among the six spec classes, and §4.3 already carried `PROPERTIES` in the doc-type
catalogue. Only the enumeration was short.

### v1.0 (2026-07-29)

Initial technical specification.

---

## 1. Overview

### 1.1 What this document is

The FSPEC (v1.5, 66 acceptance tests `AT-01`…`AT-66`, 71 edge cases `E-01`…`E-71`, 21 obligations
`O-1`…`O-21`) fixes **behaviour**. This TSPEC fixes **code**: module layout, exact function
signatures, injected-seam definitions and their Node defaults, data shapes, control flow, constant
placement, and the file each change lands in. It does not re-narrate the FSPEC. Every behavioural
claim here is a pointer — `AC-*`, `E-*`, `AT-*`, `O-*`, `DC-*` — and the reader is expected to
resolve it in REQ v1.5 / FSPEC v1.5 / `docs/_constraints/DOMAIN-CONSTRAINTS.md`.

Where the FSPEC deliberately left a decision to implementation, §10 records the resolution taken
here. Where it left something genuinely open at REQ altitude, §10 carries it forward unresolved
rather than inventing an answer.

### 1.2 The four defects

| Id | Observed harness defect | Root cause in code | Landing section |
|---|---|---|---|
| **H-1** | Review iteration index derived as `1` on every entry, so round-2+ cross-reviews overwrite round-1 files and history is destroyed | `reviewLoop`'s `iteration = 1` default parameter is never overridden — all seven call sites in `orchestrate-dev.js` omit it | §5.2 (round derivation), §3.2 (`_listFiles`) |
| **H-2** | A phase that cannot converge exits non-terminally: the loop reports failure but the run continues, and no POSTMORTEM is actually written | `checkConverged` builds a `postmortemPath` template it never uses, and its halt text claims "POSTMORTEM written" | §6.3, §12-equivalent (§6.4 POSTMORTEM gate) |
| **H-3** | The 180 s stall watchdog kills a monolithic document write; six consecutive kills produced zero output | No pacing contract exists between the orchestrator and an authoring agent — one dispatch, one unbounded write | §5.6 (`dispatchAndVerify`) |
| **H-4** | An already-approved phase is re-run from scratch on re-entry, discarding a converged artifact | No persisted approval record exists to consult; convergence lives only in the in-process loop | §5.4 (approval), §5.5 (staleness) |

The four are not independent. H-1 supplies the round index that H-4's approval search keys on; H-3's
pacing wrapper is the unit H-2's terminal-exit rule wraps; H-2's POSTMORTEM gate is what makes H-4's
"skip an approved phase" safe to trust.

### 1.3 Change surface

Five tracked paths change. Nothing outside them does.

| Path | Nature of change |
|---|---|
| `pdlc/workflows/orchestrate-dev.js` | Bulk of the work: six new seams on `main()`, the round/approval/pacing machinery, the terminal-exit fix, new module constants |
| `pdlc/workflows/orchestrate-queue.js` | Queue-row commit via `_git`; export of the previously-private status rewriter |
| `pdlc/workflows/runtime-adapter.js` | Adapter implementations for the new seams, wired through `rtDevInjections` |
| `pdlc/workflows/build-runtime.mjs` | Four load-bearing edits (§7.2) so the new exports and the queue's `_git` reach the bundles |
| `pdlc/workflows/__tests__/` | New and extended jest suites (§8) |

Two SKILL prompts are amended in the same change (`pdlc/skills/{se,pm,te}-review/SKILL.md` for the
persisted-verdict field, and the three author SKILLs for the `REVISION-COMPLETE:` trailer) — these
are prompt text, specified in FSPEC §6.5 and §8.4, and are reproduced here only as a checklist row
in §7.4.

`pdlc/workflows/dist/` is **generated**. It is rebuilt by `node pdlc/workflows/build-runtime.mjs`
in the same commit as any source change above, per `CLAUDE.md` § "Workflow scripts and the runtime
build". It is never hand-edited and never authored by this TSPEC.

### 1.4 Binding constraints

These are not preferences. Each one has killed a working implementation in this repo before.

**C-2 — the runtime is a constrained execution environment** (`DEC-DIST-01`,
`docs/_decisions/DECISIONS-plugin-distribution.md`). A bundle may declare `export const meta` as its
first statement and as a pure literal; it may declare no other `export`; it has no `import`, no
`import()`, no `process`, no `fs`, no `fetch`, no `crypto`, no `TextEncoder`. Exactly eleven host
globals exist: `agent`, `parallel`, `pipeline`, `phase`, `log`, `workflow`, `args`, `budget`,
`console`, `setTimeout`, `clearTimeout`.

*Consequence.* Every new capability that touches the outside world arrives as an **injected seam** —
a named parameter on `main()`'s destructured options object, defaulted to a Node implementation so
jest can exercise the module directly, and supplied by `runtime-adapter.js` in the bundle. No new
capability is obtained any other way. §3 defines the six.

**Await discipline.** The adapter's seam implementations are `async`; the jest test doubles are
synchronous. A missing `await` on an injected call therefore **passes every unit test and fails only
in the runtime**. Every call to an injected seam in this design is `await`ed, without exception,
including calls whose result is discarded. AT-19 (§8.5) is the mechanical guard.

**C-5 — no agent in a decision loop a script can make.** Every parser, comparison, counter and gate
specified here is pure JavaScript running in the workflow process. An `agent()` call appears only
where the work is genuinely generative (authoring, reviewing) or where the runtime offers no
primitive (file IO, `git`, `gh`) — and in the latter case behind a seam, never inline in a loop.

**No `crypto`.** The content digest (§5.3) is therefore an inlined, pure-JS SHA-256 over a
hand-rolled UTF-8 encoding. It is synchronous and deterministic, so — unlike file IO — it is **not**
a seam and takes no injection. §3.7 states why.

**DC-01 (closed and total).** Every string crossing a component boundary is a closed catalogue on
the emit side and a **total** function on the receive side. Six parsers are specified in §5; each is
total, each has an explicit disposition for absent, malformed and truncated input. `ListFailure`
(§4.2) and `TrailerFailure` (§4.3) are the two new closed catalogues.

**DC-02 (measured, not inferred).** Every assertion this document makes about existing code was
checked against the working tree on `feat-pdlc-review-loop-hardening`: at HEAD **`af6f335`** for v1.0,
and **re-measured at HEAD `ef4705a`** for every claim v1.1 touched or added. The v1.1 re-measurements
are recorded where they are used rather than only here — `main()`'s sixteen `_`-parameters against
`rtDevInjections`' nine (§8.5), `checkPrCi`'s four synchronous `_now()` call sites and the un-awaited
`rawAgentFn` alias wrapper (§8.5), `QUEUE_ENTRY`'s injection object (§7.2), the bundle sizes (§7.2),
the `AT-22` test-name collision in `documentOracles.test.js` and the 1038/1/70 suite baseline (§8.3).
No claim in this document rests on a v1.0 measurement that v1.1 did not re-check. Code is
cited as **enclosing symbol plus a distinctive literal** — never as a bare `file:line`, which drifts
(FSPEC §1.1, O-16).

### 1.5 Reuse of shipped precedent

Per the `se-author` "cite-and-reuse the sibling" rule, three existing mechanisms are reused rather
than reinvented:

- **The injection idiom itself.** `main()` in `orchestrate-dev.js` already destructures sixteen
  injections (`_agent`, `_parallel`, `_log`, `_checkFile`, `_readFile`, `_phase`, `_pipeline`,
  `_mergeWorktree`, `_rebaseOntoDefault`, `_dodVerifyLoop`, `_raisePrAndVerifyCi`, `_checkCi`,
  `_phaseDodEnabled`, `_phasePubEnabled`, `_now`, `_sleep`). The six new seams extend that list in
  place; no new injection mechanism is introduced.
- **`parseVerdict(result, skillName)`** in `orchestrate-dev.js` — its `VALID_VERDICTS` array, its
  reverse-scan (`const reversed = lines.slice().reverse()`), and its `malformed: true` fallback are
  reused verbatim for the persisted verdict record (§5.1). One grammar family, three carriers
  (FSPEC §2.3).
- **`reviewerRoleSlug(skill)`'s `MAP`** — `{"se-review": "software-engineer", "pm-review":
  "product-manager", "te-review": "test-engineer"}` — is the single source of the role-slug
  catalogue G-2 (§5.2). The filename grammar derives its role alternation from that map, so a new
  reviewer role cannot desynchronise the two.

Deliberately **not** reused: `listAllFiles(root)` / `WALK_SKIP_DIRS` from `document-oracles.mjs`.
FSPEC §3.4 states the reason (it is a Node-only recursive walker with no seam and a skip-list tuned
for a different job). The two listing paths instead share one error contract — the `ListFailure`
catalogue of §4.2 — so a "cannot judge" failure means the same thing on both sides (DC-11).

## 2. Architecture

### 2.1 Technology stack — nothing new

No new runtime dependency, no new package, no new build step. The change is confined to the existing
ES-module sources under `pdlc/workflows/`, their existing jest suite (`cd pdlc/workflows && npm
test`), and the existing generator `build-runtime.mjs`. This is deliberate: C-2 forbids `import` in
the bundle, so a new dependency could not reach the runtime at all — anything a bundle needs must be
either inlined pure JS or an injected seam.

### 2.2 Module layout — one file, not a new package

Every new pure function specified in §5 lands **in `pdlc/workflows/orchestrate-dev.js`**, as a
module-level `export function` beside the existing `parseVerdict` / `checkFileNonEmpty` /
`parseDecisionsWarranted` family. No new source file is created under `pdlc/workflows/`.

The reason is structural, not stylistic. `build-runtime.mjs`'s `wrapModule(varName, body,
exportedNames, prelude)` inlines **whole files**: the dev bundle is composed from a fixed array
`[DEV_META, BANNER, adapter, devModule, DEV_ENTRY]`, where `devModule` is
`wrapModule("__dev", stripModuleSyntax(devSource), […])`. A new source file would require a new
`wrapModule` invocation, a new entry in both bundle composition arrays, a new `exportedNames` list,
and a new cross-module reference idiom (`__helpers.foo`) that nothing in the tree uses today. The
cost of a fifth module is paid on every future build edit; the benefit — file-length hygiene — is
not one this design needs to buy.

Two exceptions, both forced:

- **`runtime-adapter.js`** gains `rtListFiles`, `rtAppendFile`, `rtGit` and their `rtDevInjections`
  wiring. That file is the adapter; a seam implementation cannot live anywhere else.
- **`orchestrate-queue.js`** gains the `_git` thread-through and the export of its status rewriter
  (§3.6). That is where the queue row is written.

### 2.3 Dependency graph

```
                        ┌──────────────────────────┐
   runtime globals ───► │  runtime-adapter.js      │  (inlined verbatim by the build,
   (agent, parallel,    │  rtAgent … rtGit         │   never imported)
    pipeline, phase,    │  rtDevInjections()       │
    log, setTimeout)    └───────────┬──────────────┘
                                    │ supplies seams
                                    ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  orchestrate-dev.js                                            │
   │                                                                │
   │   main({ reqPath, forcePhases, _listFiles, _writeFile,         │
   │          _appendFile, _git, _recordHalt, …16 existing })       │
   │            │                                                   │
   │            ├─► phase gate       ─► §5.4 approval / §5.5 stale  │
   │            ├─► reviewLoop(…, startIndex)  ─► §5.2 rounds       │
   │            │       └─► dispatchAndVerify  ─► §5.6 pacing       │
   │            └─► checkConverged   ─► §6.3 terminal exit          │
   │                                                                │
   │   pure, seam-free:  sha256Hex, canonicalise, scanLines,        │
   │                     parseReviewFilename, parseVerdict,         │
   │                     parseApprovalHash, parseRevisionComplete,  │
   │                     parseForcePhases, isStale, isComplete      │
   └───────────────────────────┬────────────────────────────────────┘
                               │ __dev.main / row helpers
                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  orchestrate-queue.js   updateQueueStatus, rewriteStatus(_git) │
   └────────────────────────────────────────────────────────────────┘
```

The arrow from `orchestrate-queue.js` back up is new. Today the dev bundle does **not** include
`queueModule` at all — `contents: [DEV_META, BANNER, adapter, devModule, DEV_ENTRY]`. §7.2's fourth
build edit adds it, which is what makes `_recordHalt` (§3.5) able to close over the queue's row
helpers rather than reimplementing queue-row parsing inside `orchestrate-dev.js`.

### 2.4 The layering rule

Three strata, and the rule that keeps them honest:

| Stratum | Contents | May call |
|---|---|---|
| **Pure** | every parser, the digest, the scanner, `isStale`, `isComplete`, `updateQueueStatus` | only other pure functions |
| **Seam** | `_listFiles`, `_readFile`, `_writeFile`, `_appendFile`, `_git`, `_recordHalt`, `_agent`, … | the host, via the adapter |
| **Orchestration** | `main`, `reviewLoop`, `dispatchAndVerify`, `checkConverged`, phase gate | both strata above |

**A pure function never performs IO, and an orchestration function never parses.** This is what
makes §8's test strategy cheap: the pure stratum is tested with string inputs and no doubles at all,
the orchestration stratum with sync doubles for every seam. It is also what satisfies C-5 — the
decision logic is entirely in the pure stratum, where no `agent()` call is reachable.

### 2.5 Control flow of one phase entry

The following is the new shape of a `PHASE_DISPATCH` entry's execution, for phases in the
force/skip-eligible set. Steps 1–4 are new; step 5 is today's `reviewLoop` with a corrected starting
index; steps 6–7 are the corrected terminal exit.

```
1.  forcePhases gate           §5.7   phase named in forcePhases?
                                      ├─ yes ─► do step 2, SKIP steps 3–4, then step G
                                      └─ no  ─► step 2
2.  round derivation           §5.2   await _listFiles(`docs/${feature}`)
                                      ├─ ListFailure(dir_missing)  ─► [] ⇒ startIndex 1
                                      ├─ ListFailure(other)        ─► halt "cannot judge"
                                      └─ ok ─► parseReviewFilename over every entry
                                               startIndex = max(presentIndices) + 1  (or 1)
                                               endIndex   = startIndex + MAX_REVIEW_ROUNDS - 1
                                               present, reviewFiles, skipped carried forward
3.  approval search            §5.4   candidate = startIndex - 1 (single, no walk)
                                      tier 1: the candidate round's per-role CROSS-REVIEW files
                                      tier 2: `## 6. Approval Record` in LEARNINGS-{feature}.md
                                      (tiers are exclusive; at most 2 _readFile per phase entry)
                                      ├─ candidate < 1   ─► no approval record ─► step G
                                      ├─ NOT APPROVING   ─► no approval record ─► step G
                                      └─ approving       ─► step 4
4.  staleness                  §5.5   isStale(recordedHash, await _readFile(docPath))
                                      ├─ FRESH       ─► SKIP: the phase does not run.
                                      │                 checkPostmortem §5.8 is evaluated here for
                                      │                 REPORTING ONLY — its result never changes
                                      │                 the outcome; an unresolved POSTMORTEM for
                                      │                 this (phase, feature) is named in the "⏭"
                                      │                 skip notice (§4.7). Phase done.
                                      ├─ STALE       ─► step G
                                      └─ UNEVALUABLE ─► step G, note in report
G.  POSTMORTEM gate            §5.8   THE PHASE WILL RUN UNLESS THIS REFUSES
                                      await checkPostmortem({ phase, feature })
                                      ├─ unresolved ─► refuse the phase (§6.2 row 13)
                                      └─ none / resolved ─► step 5
5.  reviewLoop(…, iteration = startIndex, present, reviewFiles)
                                      each round: dispatchAndVerify per author/reviewer episode §5.6
                                      gatePass = isPass(v1) && isPass(v2)   (unchanged)
                                      on pass: append APPROVAL-HASH / REVIEWED-COMMIT   §5.3
6.  checkConverged                    converged ─► done
                                      not      ─► step 7
7.  terminal exit              §6.3   write docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md
                                      await _recordHalt({ feature, status: "halted" })
                                      throw haltError(one of §6.4's two conditional shapes)
```

**The gate is an invariant over paths, not a step number.** Stated normatively, and this is the form
an implementation must preserve:

> **G-INV.** Step G is evaluated on **every** exit that leads to running the phase, and step 5 is
> reachable only through it. No path — forced, unforced-with-no-candidate, unforced-not-approving,
> `STALE`, `UNEVALUABLE`, or any exit added later — may reach `reviewLoop` without having passed
> step G. Equivalently: "the phase would otherwise run" *is* the gate's precondition, and it is
> discharged by placing the gate at the single point all such exits converge on, never by
> enumerating which steps happen to reach it today.

Its power is the same on all of them — **refusal** (§6.2 row 13). The forced path is not a special
case of the gate: force overrides a recorded *approval* (steps 3–4 are skipped) and never a recorded
*failure* (§5.7, §11.5, AC-4.6a), so a forced phase reaches step G exactly like any other run.

The **one** call of `checkPostmortem` that is not step G is step 4's `FRESH` branch, where the phase
does *not* run: there the query is evaluated for **reporting only** and cannot change the outcome.
That is the call an implementation drops silently. AC-2.3's refusal is conditioned on "the phase
would otherwise run", so a skipped phase has nothing to refuse — but AC-2.3b *also* requires the
skip report to name any unresolved POSTMORTEM for that (phase, feature), so the call is still made
and its result reaches §4.7's notice.

**Both of FSPEC §12.4's worked examples are reachable under G-INV, and they diverge only at step 3.**
*Example A* — Phase R converged, its approving pair is still on the branch pre-harvest, an unresolved
`POSTMORTEM-R-{feature}.md` sits beside it: step 3 finds the approval, step 4 returns `FRESH`, the
phase is skipped and the notice names the POSTMORTEM; the run continues to Phase F. *Example B* (also
AC-2.3b's) — post-harvest, zero `CROSS-REVIEW-*` files, `present` empty ⇒ `startIndex = 1` ⇒
`candidate = 0`: step 3's `candidate < 1` exit leads to running the phase, so it goes to step G, which
refuses and reproduces the Recommendation. A gate that sits ahead of step 1 breaks A; a gate reachable
only from step 4 breaks B. G-INV is the statement that holds for both.

### 2.6 What is deliberately not built

- **No history walk, at either approval tier** (O-8, narrowed at FSPEC v1.5). Approval is one
  hash-equality test against the single highest round present. No descending scan of earlier rounds,
  no `git log` of the document, no reconstruction of past bytes.
- **No agent on the approval path.** `recoverVerdict({ reviewer, rawResult, _agent })` exists and is
  reused nowhere in this design: an agent adjudicating whether a phase may be skipped breaches C-5
  and, worse, fails **open** — a hallucinated "Approved" silently discards a phase.
- **No per-worktree consumer state.** Out of scope; deferred to D-DIST-07 (queue row 6).
- **No caching layer over `_listFiles`.** The read fan-out is already bounded (one `_listFiles` and
  at most two `_readFile` per phase entry, §5.4); a cache would add an invalidation problem in
  exchange for nothing measurable.

## 3. Interfaces

Signatures are normative. A jest double must satisfy the stated shape; the adapter implementation
must satisfy it asynchronously.

### 3.1 `main()` — the composition root

`orchestrate-dev.js`, at the anchor
`export default async function main({ reqPath, _agent: rawAgentFn = agent, … })`. Six parameters are
added to the sixteen that exist today. Nothing existing is renamed or reordered.

```js
export default async function main({
  reqPath,
  forcePhases = null,                          // §5.7 — raw operator string, unparsed
  // …the sixteen existing injections, unchanged…
  _listFiles: listFilesFn = defaultListFiles,  // §3.2
  _writeFile: writeFileFn = defaultWriteFile,  // §3.3
  _appendFile: appendFileFn = defaultAppendFile, // §3.3
  _git: gitFn = defaultGit,                    // §3.4
  _recordHalt: recordHaltFn = defaultRecordHalt, // §3.5
} = {}) {
```

`forcePhases` is data, not a seam: it carries no default implementation and is never called. It
defaults to `null`, which `parseForcePhases` (§5.7) maps to the empty set — absent and empty are the
same thing, so the runtime need not distinguish "not supplied" from "supplied empty".

`export const meta` gains a second `inputs` entry beside the existing `{ name: "reqPath", …,
required: true }`:

```js
{ name: "forcePhases", description: "…", type: "string", required: false }
```

`DEV_META` in `build-runtime.mjs` is **not** edited — it is a separate hand-written literal that
carries `name`, `description`, `whenToUse`, `phases` and no `inputs` array at all. Adding one would
create a second declaration to keep in sync for no benefit; the bundle entrypoint reads `args`
directly (FSPEC §11.2).

### 3.2 `_listFiles(dirPath)` — the listing seam

```js
/**
 * @param {string} dirPath  repo-relative directory path
 * @returns {Promise<{ ok: true, files: string[] } | { ok: false, reason: ListFailure }>}
 *          files: basenames only, not paths; order unspecified; directories excluded
 */
```

- **Never throws.** Every failure is a `{ ok: false, reason }` with `reason` drawn from the closed
  `ListFailure` catalogue of §4.2 (DC-01 receive side, DC-11 one error contract).
- **Basenames, not paths.** `parseReviewFilename` (§5.2) consumes basenames; returning paths would
  force every caller to re-derive the basename and would make the grammar's `^`/`$` anchors wrong.
- **Non-recursive.** The only directory ever listed is `docs/${feature}`; cross-review files are
  flat there. A recursive walk would be a different contract with different failure modes.

**Node default** (jest, and any direct `node` invocation):

```js
export function defaultListFiles(dirPath, { fsMod = fs } = {}) { /* readdirSync withFileTypes */ }
```

It maps `ENOENT` → `{ ok: false, reason: "dir_missing" }`, `ENOTDIR` → `"not_a_directory"`,
`EACCES`/`EPERM` → `"unreadable"`, a non-string or empty `dirPath` → `"bad_argument"`, and any other
error → `"unreadable"`. The `{ fsMod = fs }` second-argument idiom is copied verbatim from the
shipped `export function checkFileNonEmpty(path, { fsMod = fs } = {})` so the two file-touching Node
defaults are tested the same way.

**Adapter implementation:** `rtListFiles`, an `agent()` with Bash, following `rtCheckFile`'s
constrained-output discipline (its prompt literal is
`` `Return ONLY one word: OK, EMPTY, or MISSING.` ``) and `rtMergeWorktree`'s JSON return discipline
(`{"ok":true}` / `{"ok":false,…}`). It returns the same union; the four `ListFailure` values are the
only `reason` strings the prompt permits, and an unrecognised agent response maps to
`{ ok: false, reason: "unreadable" }` rather than throwing.

### 3.3 `_writeFile(path, contents)` and `_appendFile(path, text)`

```js
/** @returns {Promise<void>}  throws on failure */
export function defaultWriteFile(path, contents, { fsMod = fs } = {})
export function defaultAppendFile(path, text, { fsMod = fs } = {})
```

These two are the exception to §3.2's never-throw rule, and deliberately so: a failed write is not a
condition any caller can meaningfully continue past, and the existing `defaultReadFile` /
`checkFileNonEmpty` pair already establishes throw-on-IO-failure as this module's idiom. Callers
wrap them where FSPEC prescribes a specific halt (§6.2).

`_appendFile` is **append-shaped and never a whole-file rewrite** (FSPEC §7.4). This matters for the
approval-hash record: a read-modify-write would re-emit the reviewer's prose, and any divergence
between what was read and what was written would silently rewrite a cross-review file. The Node
default uses `appendFileSync`, and the adapter's `rtAppendFile` prompt instructs the agent to append
and nothing else — it must not be implemented as `rtWriteFile(path, existing + text)`.

**`_writeFile`'s adapter implementation already exists.** `runtime-adapter.js` defines
`async function rtWriteFile(path, contents)` (prompt literal
`` `replacing the file's current contents exactly` ``) but `rtDevInjections(devModule)` does not
include it — today it returns exactly `_agent, _parallel, _pipeline, _phase, _log, _checkFile,
_readFile, _checkCi, _mergeWorktree`. Adding `_writeFile: rtWriteFile` to that object is the entire
adapter change for this seam. `rtAppendFile` is new.

### 3.4 `_git(argv)` — the transport seam

```js
/**
 * @param {string[]} argv  git arguments, NOT including the leading "git"
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}   never throws
 */
export function defaultGit(argv, { execFn } = {})
```

The caller branches on `ok`; the seam interprets nothing. The `{ execFn }` injection point mirrors
the shipped `export async function mergeWorktree(repoPath, worktreeBranch, targetBranch, { execFn }
= {})`, which resolves `child_process`'s `execSync` the same way.

**Argv, not a string.** A single command string would require quoting rules at the seam boundary and
would make a feature name containing a space a shell-injection surface. `argv` has no quoting rules.

**`_mergeWorktree` is not folded into `_git`, and `_git` does not replace it.** FSPEC §1.4 states the
disposition in full; the operative distinction is that `_mergeWorktree` is a **task** seam (one named
operation returning a domain record `{ ok, conflictingFiles }`) and `_git` is a **transport** seam
(arbitrary argv, all interpretation in the script). Re-expressing the merge through `_git` would move
conflict parsing out of the adapter and into `orchestrate-dev.js`, and would give callers a second,
looser way to invoke a merge. The two do not answer a shared question, so DC-11's one-contract rule is
not engaged.

**Adapter implementation:** `rtGit`, an `agent()` with Bash returning the `{ ok, stdout, stderr }`
JSON, modelled on `rtMergeWorktree` (prompt literal `` `Run: git merge --no-ff ${worktreeBranch}` ``).

### 3.5 `_recordHalt({ feature, status })` — the queue-row seam

```js
/**
 * @param {{ feature: string, status: string }} arg
 * @returns {Promise<{ queueRow: "halted" | "halted (uncommitted)" | "none" | "error",
 *                     detail?: string }>}
 */
export async function defaultRecordHalt(/* { feature, status } */) {
  return { queueRow: "none" };
}
```

The default is a **no-op that reports `"none"`** — a unit test, or a direct invocation in a repo with
no queue, has no row to write and must not fail for it.

This seam exists to preserve the dependency direction. Row location and row writing stay in
`orchestrate-queue.js`; `orchestrate-dev.js` never learns the queue's table grammar. Three callers
supply it:

| Caller | What it supplies |
|---|---|
| `orchestrate-queue`'s `_runPipeline` | a closure over the queue path and its own `rewriteStatus`, so a halt in the delegated run is written and committed by the one function that owns status writes (§6.5) |
| the dev bundle's `DEV_ENTRY` (direct invocation) | a closure the bundle builds over `__queue`'s row helpers — reachable only after §7.2's `build-runtime.mjs` edits 3 and 4 |
| jest, or a repo with no queue | the default no-op |

Row location on the halt path is three steps: resolve `DEFAULT_QUEUE_PATH`
(`"docs/_queue/QUEUE.md"`, already exported from `orchestrate-queue.js`); `await _readFile(queuePath)`
— `null` ⇒ the no-row case; exact match on the `Feature` column, the same match `updateQueueStatus`
performs — not found ⇒ the no-row case. No new input is added for the queue path: a direct invocation
wanting a different queue would be using the queue driver.

### 3.6 `orchestrate-queue.js` changes

| Symbol | Change |
|---|---|
| `export function updateQueueStatus(markdown, feature, newStatus)` | return shape becomes `{ markdown, matched }` (§4.6), replacing today's `return markdown; // feature row not found` — the caller can no longer confuse "row updated" with "no such row" |
| `async function rewriteStatus(queuePath, feature, status, readFileFn, writeFileFn)` | **exported**, gains a `_git` parameter, and gains the commit of §6.5 after the write |
| `export default async function main({ … })` | parameter list gains `_git` so the seam threads down to `rewriteStatus` |
| `async function runPicked({ … })` | its three status writes — the `"in-progress"` write, the `"halted"` rewrite, and the `const newStatus = succeeded ? "awaiting-merge" : "halted";` rewrite — all route through the committing `rewriteStatus` |

`rewriteStatus` is non-exported today; the bundle cannot publish what the module does not export
(`stripModuleSyntax` rewrites `export function` to `function` and `wrapModule` re-publishes only the
names in its `exportedNames` list). Exporting it is therefore load-bearing, not cosmetic.

### 3.7 Pure functions — new, all in `orchestrate-dev.js`, all exported

Every one is synchronous, total, and takes no seam. Algorithms are in §5; this is the contract.

```js
// ── scanning ────────────────────────────────────────────────────────────────
export function scanLines(text, visit)
//   The one fenced-region-aware line scanner (§5.0). `visit(line, index)` is
//   called only for lines OUTSIDE a fenced code region. Returns undefined.
//   Callers: parseVerdict-on-file, parseApprovalHash, parseRevisionComplete,
//            parseResolvedMarker, isComplete's heading scan.

// ── digest (§5.3) ───────────────────────────────────────────────────────────
export function canonicaliseForDigest(text)   // N-1 line endings, N-2 one trailing \n
export function utf8Bytes(text)               // hand-rolled, no TextEncoder
export function sha256Hex(text)               // 64 lowercase hex; canonicalises internally
export function approvalHashOf(text)          // `sha256:${sha256Hex(text)}`

// ── parsers (§5.1, §5.2, §5.4, §5.7, §5.8) ──────────────────────────────────
export function parseReviewFilename(basename)
//   → { ok: true, role, docType, round } | { ok: false, reason: FilenameFailure }
export function parseApprovalHash(fileText)
//   → { ok: true, hash, reviewedCommit } | { ok: false, reason: HashFailure }
//   `reviewedCommit` is the literal string "unavailable" whenever no
//   REVIEWED-COMMIT: line is present outside a fence, or its value is not
//   lowercase hex. A missing corroboration line is NEVER a HashFailure:
//   HASH_FAILURES describes the APPROVAL-HASH: line only (§4.3).
export function parseRevisionComplete(response)
//   → { complete: true } | { complete: false, reason: TrailerFailure }
export function parseForcePhases(raw)
//   → { ok: true, phases: Set<string> } | { ok: false, badTokens: string[] }
export function parseResolvedMarker(fileText)
//   → { ok: true, resolved: boolean } | { ok: false, reason }
export function extractRecommendation(fileText)   // §5.8; 4000-byte truncation

// ── judgements (§5.5, §5.9) ─────────────────────────────────────────────────
export function isStale(recordedHash, documentBytes)
//   → "UNEVALUABLE" | "STALE" | "FRESH"
export function isComplete(artifactClass, docType, fileText)
//   → { complete: true } | { complete: false, missing: string[] }

// ── round derivation (§5.2) ─────────────────────────────────────────────────
export function deriveRoundWindow(basenames, docType)
//   → { ok: true, startIndex, endIndex, present: Map<role, number[]>,
//       skipped: Array<{ basename: string, reason: FilenameFailure }> }
//   | { ok: false, reason: "malformed_round_one_duplicate", role }

// ── episode mode (§5.6.1) ───────────────────────────────────────────────────
export function selectMode({ dispatchKind, docType, present, reviewFiles })
//   → { mode: "authoring" | "revision", round: number|null, reason: string }
//   The ONLY producer of EpisodeKey.mode (§4.5). Pure: it reads no file itself,
//   consuming the §5.2 listing and the §5.1/§5.4 reads the phase entry already
//   performed. FSPEC §15.2's four rules; fails toward "revision".

export function isTerminal(mode, response, artifactClass, docType, after)
//   → boolean.  Greenfield: structural completeness ALONE, no trailer.
//   Revision: structural completeness AND parseRevisionComplete → complete.
```

`sha256Hex` is **not a seam**, and this is a deliberate design decision rather than an oversight. A
seam exists to reach a capability the runtime lacks; a seam's cost is an async boundary, an adapter
implementation, a jest double, and an `await` that can be forgotten. A SHA-256 over an in-memory
string needs none of those — it is deterministic, synchronous and dependency-free once written in
pure JS, which C-2 forces anyway because there is no `crypto`. Making it a seam would introduce an
awaitable call on the hot path of every approval comparison for no capability gained, and would let a
test double return a hash the production code never computes.

### 3.8 `dispatchAndVerify({ episode, prompt })` — the pacing wrapper

```js
/**
 * @param {{ episode: EpisodeKey, prompt: string, model?: string }} arg
 * @returns {Promise<{ ok: true, response: string }
 *                  | { ok: false, reason: "no_progress" | "dispatch_budget"
 *                                       | "trailer" , detail: string }>}
 */
async function dispatchAndVerify({ episode, prompt, model = MODEL_DEFAULT })
```

Non-exported at module level but reachable from `reviewLoop`'s and the phase gate's scope; it closes
over `_agent`, `_readFile`, `_checkFile` and the counters. `EpisodeKey` is §4.5's five-coordinate
record. It implements FSPEC §15's **terminal-first-then-progress** ordering: the trailer verdict is
evaluated before the progress predicate, so an author that declared completion is never re-dispatched
merely because its last write produced no byte change.

### 3.9 Changed existing signatures

| Symbol | Change |
|---|---|
| `export async function reviewLoop({ doc, phase, reviewers, optimizer, feature, iteration = 1, _agent, _parallel, _checkFile })` | the `iteration = 1` default stays (it is the correct value for a virgin branch), but **all seven existing call sites now pass the branch-derived `startIndex`**; the gate `if (iteration > 5)` becomes `if (iteration > endIndex)`; the return shape gains `postmortemWritten` |
| `function checkConverged(loopResult, phaseId, phaseLabel, recordPhase)` | gains `feature` so its `postmortemPath` template can interpolate; the dead `` const postmortemPath = `docs/{feature}/POSTMORTEM-${phaseId}-{feature}.md` `` becomes `` `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md` `` and is **read**; the literal `5`s become `MAX_REVIEW_ROUNDS` / `startIndex..endIndex` per §7.1; the unconditional `POSTMORTEM written.` becomes §6.4's two conditional shapes |
| `function buildFinalReport({ feature, outcome, phases, artifactPaths, testSummary, harvestStatus, prUrl, ciStatus, haltReason })` | gains `haltPhase`, `postmortemPath`, `postmortemStatus`, `queueRow`, plus the skip / force / pacing-proxy report lines |
| `function reviewerRoleSlug(skill)` | unchanged, but gains a **reverse accessor** `function reviewerSkillForSlug(slug)` over the same `MAP`, so the filename grammar's role alternation and the dispatch table cannot desynchronise |
| `function reviewerPrompt(doc, phase, feature, iteration, reviewer)` and `function optimizerPrompt(doc, phase, feature, iteration, reviewers = [])` | the `{DOC-TYPE}` literals — including inside `` `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${iteration}.md` `` — are substituted with the real document type, so the prompt names the concrete path the script will later parse |
| `export function parseVerdict(result, skillName)` | **unchanged**, reused as-is against file text, with §5.1's duplicate pre-count in front of it |
| `export async function recoverVerdict({ reviewer, rawResult, _agent = agent })` | **unchanged and not reused** on the approval path (C-5; it would fail open) |

### 3.10 Adapter wiring — `rtDevInjections`

The post-change return object, in the order the existing one uses:

```js
function rtDevInjections(devModule) {
  return {
    _agent: rtAgent, _parallel: rtParallel, _pipeline: rtPipeline,
    _phase: rtPhase, _log: rtLog, _checkFile: rtCheckFile,
    _readFile: rtReadFile, _checkCi: rtMakeCheckCi(devModule),
    _mergeWorktree: rtMergeWorktree,
    _writeFile: rtWriteFile,     // existed; was never wired
    _appendFile: rtAppendFile,   // new
    _listFiles: rtListFiles,     // new
    _git: rtGit,                 // new
  };
}
```

`_recordHalt` is **not** in `rtDevInjections`. It is supplied per entrypoint — `QUEUE_ENTRY` closes
over the queue's own `rewriteStatus`, `DEV_ENTRY` closes over `__queue`'s row helpers — because its
implementation differs by caller, which is exactly what `rtDevInjections`, a caller-independent
bundle of adapters, cannot express. AT-64 (§8.5) derives its expected seam set from `main()`'s
parameter list rather than a hand-written list, and must therefore account for `_recordHalt`'s
per-entrypoint supply rather than asserting it appears in `rtDevInjections`. `_recordHalt` is
**wired, not exempt**, under §8.5's classification: `QUEUE_ENTRY`'s `_runPipeline` closure (§7.2 edit
2b) and `DEV_ENTRY` are the two places that satisfy it, and if either is dropped AT-64 reds.

## 4. Data Model

Every record here is a plain object literal. No class, no `Symbol`, no prototype — C-2's bundle has
no module system to hang a type on, and `stripModuleSyntax` operates on text.

### 4.1 The four closed failure catalogues (DC-01)

Each is a frozen array declared beside the constants block, so a test can enumerate it and a
`switch` can be checked exhaustive.

```js
export const LIST_FAILURES     = ["dir_missing", "not_a_directory", "unreadable", "bad_argument"];
export const FILENAME_FAILURES = ["not_cross_review", "bad_role", "bad_doc_type",
                                  "bad_round", "trailing_junk"];
export const HASH_FAILURES     = ["absent", "duplicated", "unparseable"];
export const TRAILER_FAILURES  = ["declared_incomplete", "absent", "duplicated", "unparseable"];
```

### 4.2 `ListFailure` — and its dispositions

| Value | Cause | Disposition |
|---|---|---|
| `dir_missing` | the directory does not exist | **benign** — treated as an empty listing; a feature whose `docs/{feature}/` has not been created yet has no cross-reviews, which is a true and useful answer |
| `not_a_directory` | the path exists but is a file | **cannot judge** ⇒ halt |
| `unreadable` | permissions, IO error, or an adapter response the prompt did not permit | **cannot judge** ⇒ halt |
| `bad_argument` | `dirPath` absent, non-string, or empty | **cannot judge** ⇒ halt |

The three non-benign values produce one halt-reason shape, shared by both listing paths (DC-11):

```
Cannot enumerate {dirPath}: {reason}
```

The asymmetry is the whole point. "There are no cross-reviews" and "I could not find out whether
there are cross-reviews" must not collapse into the same value, because the second, silently treated
as the first, restarts an approved phase from round 1 — H-1's failure mode reintroduced through the
error path.

### 4.3 `TrailerFailure` and `HashFailure`

`parseRevisionComplete(response)` returns `{ complete: true }` or `{ complete: false, reason }`. It
is called **only on a revision episode** (§5.6.2's `isTerminal`); a greenfield episode's terminal test
is structural completeness alone, so `absent` never arises there and no greenfield episode can be
held back by a trailer its SKILL was never amended to emit. The dispositions below are therefore all
revision-path dispositions:

| `reason` | Meaning | Consequence in `dispatchAndVerify` |
|---|---|---|
| `declared_incomplete` | the trailer is present and says the author is not done | continue the episode — this is the normal paced path, not an error |
| `absent` | no `REVISION-COMPLETE:` line at all | non-terminal; continue, counts against `MAX_AUTHORING_ATTEMPTS` if no progress |
| `duplicated` | more than one such line outside fenced regions | fail closed — non-terminal, and reported |
| `unparseable` | the line exists but its value is not `yes`/`no` | fail closed — non-terminal, and reported |

`parseApprovalHash(fileText)` returns `{ ok: true, hash, reviewedCommit }` or `{ ok: false, reason }`
over `HASH_FAILURES`. All three failure values reach the **same** place: §5.5's `UNEVALUABLE`, which
means the phase runs. There is no branch in which an unparseable hash grants a skip.

**`HASH_FAILURES` is about the `APPROVAL-HASH:` line and nothing else.** `REVIEWED-COMMIT:` has no
failure value, because it has no failure: when the line is absent outside a fence, is duplicated, or
carries a value that is not lowercase hex, `reviewedCommit` is the literal `"unavailable"` and `ok`
stays `true`. That closes the totality gap under DC-01 without inventing a fourth catalogue entry, and
it is safe in the only direction that matters — §5.5's comparison never reads the field (§5.3,
rebase invariance), and §4.4's tier-2 column already admits `unavailable` as a value, so the harvest
copy has somewhere to put it. A record whose hash parses and whose corroboration is missing is a
usable approval; degrading it to `UNEVALUABLE` would re-run a converged phase over a field nothing
consults.

### 4.4 The persisted records

**Tier-1, in each `CROSS-REVIEW-{role}-{DOCTYPE}[-v{N}].md`.** Two carriers in one file, written by
two different producers.

```markdown
## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

APPROVAL-HASH: sha256:{64 lowercase hex}
REVIEWED-COMMIT: {40 lowercase hex | unavailable}
```

| Field | Producer | Written when | Read by |
|---|---|---|---|
| `VERDICT:` + JSON counts | the **reviewer agent**, as the file's last section | during the review dispatch | `parseVerdict(section, roleSlug)`, unchanged, over the trailing `## Verdict` section only |
| `APPROVAL-HASH:` / `REVIEWED-COMMIT:` | the **script**, appended | strictly after the review episode reaches terminal (t5 of FSPEC §7.4's ordering) | `parseApprovalHash(fileText)` |

The append is append-shaped for two independent reasons: AC-1.4 forbids overwriting a cross-review
file at all, and a replace-shaped edit emits both match and replacement, roughly doubling the bytes
against `MAX_AUTHORING_WRITE_BYTES`. An append emits two lines.

**Tier-2, in `LEARNINGS-{feature}.md`.** Tier 1 does not survive Phase H — `harvest-learnings`
deletes the cross-review files it harvests — so a second, durable carrier exists as a new final
top-level section, `## 6. Approval Record`, leaving the five existing sections' numbers untouched:

| Column | Domain |
|---|---|
| Document Type | `REQ` \| `FSPEC` \| `TSPEC` \| `PLAN` \| `PROPERTIES` \| `DECISIONS` |
| Round | positive decimal integer, branch-absolute (the same `N` as the filename's `-v{N}`) |
| Role | `product-manager` \| `software-engineer` \| `test-engineer` |
| Verdict | `parseVerdict`'s `VALID_VERDICTS` — `Approved` \| `Approved with minor changes` \| `Needs revision` |
| Approval Hash | `sha256:{64 lowercase hex}` \| `unavailable` |
| Reviewed Commit | abbreviated-or-full lowercase hex sha of the **reviewed document's** commit \| `unavailable` |

One row per (document type, round, role); a round approved by two roles contributes two rows.
Ordering is total — document type in pipeline order, round ascending, role slug ascending — so the
section is byte-stable across re-derivations. A feature with no approving round emits the heading and
the header row with **no data rows**; the section is never omitted, because an empty table is
evidence that harvest looked, while a missing section is indistinguishable from a harvest that
predates the mechanism.

**Copy, never recompute.** Harvest builds Approval Hash and Reviewed Commit by copying the
`APPROVAL-HASH:` / `REVIEWED-COMMIT:` bytes verbatim out of the tier-1 file. It may not recompute the
digest, and may not substitute a harvest-time hash — recomputation at harvest time would hash the
document as it stands *after* the phase, turning every harvested approval into a false `FRESH`.

**Tier selection is exclusive.** A phase entry consults tier 1 **or** tier 2, never both merged: if
the candidate round's cross-review files exist, they are the record; only if they are absent is
LEARNINGS consulted. This bounds the read fan-out at two `_readFile` per phase entry and removes the
"both tiers disagree" merge entirely.

### 4.5 `EpisodeKey` — the pacing unit

```js
/** @typedef {{
 *   artifactSet: string,   // the document (or document set) being produced
 *   phaseId: string,       // "R" | "F" | "T" | "D" | "P" | "PR" | "CR" | "DOD"
 *   roundIndex: number,    // branch-absolute, from §5.2
 *   mode: "authoring" | "revision",
 *   invocation: number,    // monotonic within (artifactSet, phase, round, mode)
 * }} EpisodeKey */
```

Five coordinates, because four collide. Without `mode`, an authoring dispatch and a revision dispatch
for the same document in the same round share counters, and a long revision exhausts the authoring
budget. Without `invocation`, the counters have nothing to increment.

`mode` is produced by exactly one function — **`selectMode` (§5.6.1)** — called once at episode
entry. No other site assigns it, and in particular it is never derived from the artifact's structural
state; FSPEC §15.2 records that derivation as retracted. `roundIndex` on a **revision** episode is
`selectMode`'s returned `round` (the highest round still owed an authoring pass), not §5.2's
`startIndex`, which is the *next reviewer* round; on a greenfield episode it is `startIndex`.

Per-episode counters, both reset when any coordinate changes:

| Counter | Constant | Semantics |
|---|---|---|
| consecutive no-progress dispatches | `MAX_AUTHORING_ATTEMPTS = 3` | reset to 0 by any dispatch that makes progress |
| total dispatches | `MAX_AUTHORING_DISPATCHES = 6` | never reset within the episode |

Worst-case dispatch count for one phase is `(1 + MAX_REVIEW_ROUNDS) × MAX_AUTHORING_DISPATCHES` = 36.
That bound is stated here so a reviewer can check it against the run budget rather than discover it.

### 4.6 `updateQueueStatus`'s return shape

```js
/** @returns {{ markdown: string, matched: boolean }} */
export function updateQueueStatus(markdown, feature, newStatus)
```

Today the not-found path is `return markdown; // feature row not found` — indistinguishable, to the
caller, from a successful update whose replacement happened to be a no-op. `matched` makes the
difference observable, which is what `_recordHalt` needs to report `queueRow: "none"` rather than
claiming a write it did not perform. Every existing call site is updated to destructure.

### 4.7 New fields on the final report

`buildFinalReport`'s destructured list gains four fields:

| Field | Domain | Set by |
|---|---|---|
| `haltPhase` | phase id \| `null` | the terminal-exit path (§6.3) |
| `postmortemPath` | `docs/{feature}/POSTMORTEM-{phaseId}-{feature}.md` \| `null` | §6.3 |
| `postmortemStatus` | `"written"` \| `"write_failed"` \| `"unresolved"` \| `"none"` | §6.3, §5.8 |
| `queueRow` | `"halted"` \| `"halted (uncommitted)"` \| `"none"` \| `"error"` | `_recordHalt`'s return |

`"halted (uncommitted)"` is the E-38 case: the row was rewritten on disk but `git commit` failed
(hook rejection, missing identity, index lock). It is distinct from `"error"` — the operator's
remaining action is a manual commit, not a re-run — and the **original halt reason is reported
first**, with this as a subordinate note.

Plus three report **lines** (not fields): the per-phase skip notice, the force-override notice, and
the advisory pacing/commit-diff proxy. Per-phase skip reuses the existing `"⏭"` status marker — the
one `recordPhase("D", PHASE_DISPATCH.D.label, "⏭", "Skipped — no load-bearing alternatives")` already
uses — so an approval skip is visibly distinct from both a run and a `"❌"` failure.

**The skip notice's content is specified, not left to the writer** (AC-2.3b's report obligation,
FSPEC §12.4). The detail string is:

```
Skipped — approved round {candidate}, hash FRESH[; unresolved POSTMORTEM at {postmortemPath}]
```

The bracketed clause is present **iff** `checkPostmortem({ phase, feature })`, evaluated on the skip
path for reporting only (§2.5), returns `{ status: "unresolved" }`. It carries the path and nothing
more — the Recommendation excerpt belongs to the refusal halt (§6.4), not to a line in a phase
table, and a skip is not a failure. When `checkPostmortem` returns `none` or `resolved` the clause is
absent; a phase that is skipped with a clean POSTMORTEM state must not emit an empty parenthetical,
because an operator scanning the table reads any suffix as a signal.

Two report fields interact with the same call: `postmortemStatus` is set to `"unresolved"` on the
skip path too — the state is real whether or not the phase ran — while `haltPhase` and
`postmortemPath` stay `null`, because the run did not halt. A reader can therefore distinguish
"skipped, and by the way there is an open POSTMORTEM here" from "refused because of it" without
re-deriving either.

### 4.8 Constants

All four land in one block in `orchestrate-dev.js` immediately after the anchor
`const MODEL_DEFAULT = "opus";`, following the convention `const DOD_MAX_ITERATIONS = 3;` sets.

```js
// TSPEC-ROUNDS-01: per-invocation review-round budget (AC-1.6a). NOT an absolute
// round index — the gate and the reported counts derive from this plus the
// branch-derived starting index.
const MAX_REVIEW_ROUNDS = 5;

const MAX_AUTHORING_ATTEMPTS = 3;      // consecutive no-progress dispatches, per episode
const MAX_AUTHORING_DISPATCHES = 6;    // total dispatches, per episode
const MAX_AUTHORING_WRITE_BYTES = 12000; // per-tool-call emission ceiling stated to authors
```

Module-level, not `main()` parameters: they are policy, not capability, and C-2's bundle has no
configuration channel to override them from. They are not exported — an export widens the bundle's
published surface for no caller. Tests reach them through observable behaviour (round windows,
dispatch counts), which is the same discipline `DOD_MAX_ITERATIONS` already lives under.

`MAX_AUTHORING_WRITE_BYTES` has **no oracle**: nothing in the runtime measures the bytes an agent
actually emits per tool call. It is a value stated in the prompt and enforced only by the agent's
compliance, corroborated by §6.6's advisory commit-diff proxy. This is recorded, not hidden, because
a constant that looks enforced but is not is worse than one known to be advisory.

## 5. Algorithms

### 5.0 `scanLines(text, visit)` — the one fenced-region-aware scanner

FSPEC §1.2 rule 5 governs **every** mechanical scan this feature performs over a markdown artifact.
It is specified here **once**, as a function, and every scanner calls it. There is no per-site fence
handling anywhere in this design.

```js
export function scanLines(text, visit) {
  const lines = String(text ?? "").split("\n");
  let fenceChar = null;      // "`" | "~" | null
  let fenceLen = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceChar === null) {
      if (m) { fenceChar = m[1][0]; fenceLen = m[1].length; }   // opener: line is not visited
      else visit(line, i);
    } else if (m && m[1][0] === fenceChar && m[1].length >= fenceLen) {
      fenceChar = null; fenceLen = 0;                            // closer: line is not visited
    }
    // inside a fence, and the fence lines themselves, are never visited
  }
}
```

Three properties the callers depend on:

1. **A closer must use the same fence character and a run at least as long as the opener.** Every
   other fence-looking line is content. A three-backtick line inside a four-backtick block does not
   close it — which is exactly the case that arises when a reviewer quotes a fenced template.
2. **An unclosed fence swallows the remainder of the file.** This is fail-closed in the correct
   direction: a truncated artifact yields fewer matches, so a phase runs rather than being skipped.
3. **The exclusion governs which lines may *match a scanned pattern*. It does not empty a section's
   body.** §5.9's non-empty-body test counts a fenced block **as** body content. This clause exists
   because widening the exclusion over §16.2 produced a false-halt regression (FSPEC v1.4): a section
   whose entire body is a code fence is a correct document, and emptying it halts the phase.

**Callers** (the illustrative, non-closed list of rule 5): the trailing-`## Verdict` locator and its
duplicate pre-count (§5.1); the `APPROVAL-HASH:` scan and pre-count (§5.3); the tier-1 and tier-2
hash reads (§5.4); the completeness heading scan across all four artifact classes (§5.9); the heading
walk that feeds the resume prompt (§5.6); the `RESOLVED:` scan (§5.8); the `Scope:` field check; and
the `REVISION-COMPLETE:` trailer scan (§5.6).

### 5.1 Verdict extraction from a file

The reviewer writes the verdict as the file's **last section**:

```markdown
## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
```

Reading it is three steps, and reuses `parseVerdict` unmodified.

1. **Locate the trailing section.** `scanLines` over the whole file; record the index of the **last**
   visited line matching `/^\s*##\s+Verdict\s*$/`. The section is that line to EOF. A `## Verdict`
   heading inside a fence is not visited, so it can neither become the boundary nor contribute a
   `VERDICT:` line. No such heading ⇒ the section is empty ⇒ "no `VERDICT:` line" ⇒ **phase runs**.
2. **Duplicate pre-count.** `scanLines` over the section; count lines whose trimmed form starts with
   `VERDICT: `. More than one ⇒ fail closed, no approval. This pre-count is the one thing the
   response path does not need — a response has one trailer by construction, a file can accumulate.
3. **`parseVerdict(section, roleSlug)`**, unchanged. It is already total over `null`, empty,
   missing-trailer, non-catalogue value, absent JSON (its
   `if (nextNonEmpty === null) return { verdict: rawVerdict, high: 0, medium: 0, low: 0 };` branch),
   unparseable JSON, wrong-keys JSON and negative counts, and it already signals unparseability
   distinguishably via `malformed: true`. Feeding it file text instead of a response string requires
   no change to it whatsoever.

**Why the scan is scoped to the trailing section and not the whole file.** "Exactly one `VERDICT:`
line in the file" misclassifies any cross-review that *quotes* the grammar — including a review of
this very TSPEC, whose §4.4 fenced block contains a literal `VERDICT: Approved with minor changes`.
The mechanism would defeat itself on the reviews of its own feature.

Approval requires `isPass(verdict)` — the shipped
`return verdict === "Approved" || verdict === "Approved with minor changes";`. Reusing it, rather
than re-deriving a pass set, is what makes the skip neither stricter nor looser than the gate that
produced the approval in the first place (AC-4.3).

### 5.2 Filename grammar and round-index derivation — the H-1 fix

**The grammar** (FSPEC §4.1), applied to a basename:

```js
const CROSS_REVIEW_RE =
  /^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?:-v(?<n>[1-9][0-9]*))?\.md$/;
```

Four rules the regex encodes, each a rejection this design depends on:

| Rule | Encoded by | Rejects |
|---|---|---|
| G-1 (case) | `[a-z]` for role, `[A-Z]` for doc type | `CROSS-REVIEW-Software-Engineer-FSPEC.md` |
| G-2 (closed role catalogue) | validated **after** the regex against `reviewerRoleSlug`'s `MAP` values, not baked into the pattern | `CROSS-REVIEW-architect-FSPEC.md` ⇒ `bad_role` |
| G-3 (no leading zeros) | `[1-9][0-9]*` | `-v01`, `-v0` |
| G-4 (no other optional part) | `$` immediately after `\.md` | `CROSS-REVIEW-se-FSPEC-v2.backup.md` ⇒ `trailing_junk` |

**The un-suffixed form is round 1.** `CROSS-REVIEW-software-engineer-FSPEC.md` and
`CROSS-REVIEW-software-engineer-FSPEC-v1.md` denote the same round. This is not a convenience: the
un-suffixed form is what every pre-existing branch in this repo carries, and treating it as "no
round" would make every historical approval invisible.

`parseReviewFilename` validates the role against `MAP`'s values and the doc type against the closed
catalogue `REQ | FSPEC | TSPEC | PLAN | PROPERTIES | DECISIONS`, returning
`{ ok: false, reason }` over `FILENAME_FAILURES` otherwise. It is total: any string in, a tagged
union out, never a throw.

**`deriveRoundWindow(basenames, docType)`:**

```
1.  parsed  ← basenames.map(b => ({ basename: b, result: parseReviewFilename(b) }))
    entries ← parsed where result.ok && result.docType === docType
    skipped ← parsed where !result.ok, as { basename, reason: result.reason }
2.  present ← Map<role, number[]>            // per-role round indices, deduplicated
3.  indices ← every round index in `present`
4.  startIndex ← indices.length ? Math.max(...indices) + 1 : 1
5.  per-role malformed-duplicate check: a role that has BOTH the un-suffixed form and an
    explicit `-v1` for the same doc type has two files claiming round 1
        ⇒ { ok: false, reason: "malformed_round_one_duplicate", role }   ⇒ halt
6.  endIndex ← startIndex + MAX_REVIEW_ROUNDS - 1
7.  → { ok: true, startIndex, endIndex, present, skipped }
```

**Step 1 keeps the rejects, and step 7 carries them out.** E-03 and E-07 both specify a non-conforming
basename as "skipped **and reported**", and AT-05 asserts the phase-entry line contains the literal
`skipped non-conforming: CROSS-REVIEW-se-FSPEC-v2.md`. Discarding the rejects inside the filter would
leave the caller no way to emit that text except by re-running `parseReviewFilename` over the listing
itself — a parse in the orchestration stratum, which §2.4 forbids. `skipped` is ordered by the
listing's own order, deduplicated by basename, and empty (not absent) when every basename conformed;
a caller emits the notice iff it is non-empty. Only basenames that fail the *grammar* appear —
a well-formed cross-review for a **different** doc type is not a reject, it is simply not this
document's, and reporting it would fire on every phase entry in a normal `docs/{feature}/`.

Step 4 is the H-1 fix in one line. Today `reviewLoop`'s `iteration = 1` default is never overridden
by any of its seven call sites, so round 2 writes `-v1` again and destroys round 1. After this
change, every call site passes `startIndex`.

Step 5 halts rather than guessing. The two files may carry different verdicts; picking either is a
coin flip on whether a phase is skipped, and picking "the newer" would import a filesystem timestamp
into a decision that is otherwise purely content-addressed.

**Step 6 is why `MAX_REVIEW_ROUNDS` is not substituted naively at all five `5` sites.** The constant
is a **per-invocation budget**, not an absolute index (AC-1.6a). On a branch whose highest existing
round is 3, a re-entered phase starts at 4 and gets rounds 4–8 — five rounds, not two. The gate
`if (iteration > 5)` therefore becomes `if (iteration > endIndex)`, and `checkConverged`'s message
names `rounds ${startIndex}..${endIndex}`; only the two sites that report a *count* rather than an
*index* (`Iterations (${MAX_REVIEW_ROUNDS} — limit reached)` and
`iterations: MAX_REVIEW_ROUNDS`) use the constant alone. Substituting naively at all five is the same
class of defect as H-1 itself.

**Concrete paths in prompts.** `reviewerPrompt` and `optimizerPrompt` today emit the literal
`{DOC-TYPE}`, including inside
`` `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${iteration}.md` ``. Substituting the real doc
type is required for the grammar above to ever match what the reviewer writes. The general rule this
establishes: **no un-substituted `{…}` template reaches a prompt or a report.**

### 5.3 The content digest — inlined, pure, no seam

```js
export function canonicaliseForDigest(text) {
  const lf = String(text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");  // N-1
  return lf.replace(/\n*$/, "\n");                                            // N-2
}
```

N-1 normalises line endings; N-2 forces **exactly one** trailing newline. Both are applied **inside**
`sha256Hex`, never by the caller, so no call site can accidentally digest un-canonicalised bytes —
the class of defect where two call sites disagree and every approval reads `STALE`.

`utf8Bytes(text)` hand-rolls UTF-8 from `codePointAt`, handling surrogate pairs, because C-2's
runtime has no `TextEncoder`. `sha256Hex(text)` is a standard SHA-256 over those bytes using `Math`,
`>>>`, `|`, `^` and `Number` only — no `BigInt` dependence, no `crypto`. It returns 64 lowercase hex
characters. `approvalHashOf(text)` prefixes `sha256:`.

**Why no seam:** §3.7. The short form is that a seam buys a capability, and this needs none — it is
deterministic, synchronous, and pure once written, so a seam would add an awaitable boundary on the
hot path of every approval comparison and would let a double return a hash production never computes.

**Capture ordering** (FSPEC §7.4's t0…t6), which the implementation must follow exactly:

```
t0  await _readFile(docPath)              → bytes B     ← a NEW read, taken for this purpose
t1  hash ← approvalHashOf(B)                            (pure, no IO)
t2  sha  ← the commit the reviewed document is at       (via _git, or "unavailable")
t3  reviewer dispatch(es) for this round                (each an AC-3.5-wrapped episode)
t4  each cross-review file reaches TERMINAL             (§5.9)
t5  await _appendFile(each, the two anchor lines)
t6  commit the append
```

The append is the **script's own** write, strictly after t4, so it is not a member of any pacing
measurement and cannot disturb the terminal decision that preceded it. The wrapper is not re-entered
afterwards.

**Idempotence pre-count — a count *and* a comparison.** Before appending, `scanLines` the file and
collect the `APPROVAL-HASH:` lines outside fences. The count alone is not the decision: E-14 and E-15
share the value "one" and have opposite outcomes, so the existing value is compared against the hash
just computed.

| Pre-count | Existing value vs. computed hash | Branch | Edge |
|---|---|---|---|
| 0 | — | append the two lines; verification read must then find **exactly one** | normal path |
| 1 | **equal** | **idempotent no-op.** No append, no error; the round keeps its approval — this is a re-entry over an already-anchored round | E-14 |
| 1 | **unequal** | **error surfaced** naming the file, both hashes and the round; **no append**, and **that round yields no approval** | E-15 |
| ≥ 2 | — | **error surfaced** naming the file and the count; **no append**, and **that round yields no approval**. Two anchors mean the file's history is ambiguous, and picking either is a coin flip on whether a phase is skipped | E-15 |

The unequal and ≥2 branches take §5.3's failed-append disposition (§6.2 row 8): operator-facing error,
no approval from that round, the run continues, and §5.5's `UNEVALUABLE` correctly re-runs the phase
on re-entry. They deliberately do **not** overwrite, delete or reconcile the existing anchors —
AC-1.4 forbids rewriting a cross-review file, and a "repair" here would launder exactly the ambiguity
that should be visible.

Collapsing all three non-zero cases into "already anchored, skip the append" — which a count-only
pre-count does — silently accepts an unequal or duplicated anchor as a valid approval, and §6.2 row
8's verification read never fires because it runs only after an append this branch skipped.

**Failed append is an error, not a silent degradation, and not a halt.** If `_appendFile` rejects, or
the verification read does not find exactly one `APPROVAL-HASH:` line, the script emits an
operator-facing error naming the file and the failure, and **that round yields no approval**. The
current run continues normally — the round's verdict is already known from the response trailer; what
is lost is only the future skip, and §5.5's `UNEVALUABLE` branch will correctly run the phase on
re-entry. **Recording an approval without its hash is forbidden.**

**`REVIEWED-COMMIT` is corroboration, never load-bearing.** §5.5's comparison never reads it. This is
what makes the mechanism rebase-proof: Phase DOD rebases `feat-{feature}` and rewrites every sha on
the branch, and a comparison that read the sha would report every approval stale immediately
afterwards. Content-addressing survives a rebase because content does. When the sha cannot be
determined, the field is the literal `unavailable`.

### 5.4 The approval search — the H-4 fix

Runs once per skip-eligible phase entry, after `deriveRoundWindow` and before `reviewLoop`.

```
candidate ← startIndex - 1        // the single highest round present; 0 ⇒ no candidate ⇒ run
if candidate < 1: run the phase

TIER 1 — the candidate round's per-role CROSS-REVIEW files
  for each reviewer role r in this phase's PHASE_DISPATCH entry's `reviewers` pair:
      path ← docs/{feature}/CROSS-REVIEW-{r}-{DOCTYPE}[-v{candidate}].md
      if present.get(r) does not contain candidate:  → NOT APPROVING (absent is not approving)
      text ← await _readFile(path)
      verdict ← §5.1 over text;  if !isPass(verdict) → NOT APPROVING
      anchor  ← parseApprovalHash(text)
  unanimity: every role in the pair must be approving AND every parsed anchor hash
             must be identical → otherwise NOT APPROVING
  if tier 1 produced any file at all: this is the record; do NOT consult tier 2

TIER 2 — only when the candidate round has no cross-review file at all (post-harvest)
  read `## 6. Approval Record` from docs/{feature}/LEARNINGS-{feature}.md
  select the rows for (docType, candidate); apply the same unanimity and isPass rules
```

Four properties, each load-bearing:

- **Single-highest-round candidate, no descending walk.** Only `startIndex - 1` may grant approval.
  If the highest round was not approving, the phase runs — it is not rescued by an approval two
  rounds ago, which would resurrect a verdict on a document that has since changed twice.
- **A role's absent `-v{candidate}` is not approving.** Role-asymmetry (one reviewer wrote round 4,
  the other did not) is a non-approval, not a partial approval.
- **Tier selection is exclusive**, so there is no "both tiers disagree" merge to specify, and the read
  fan-out is bounded at **two `_readFile` per phase entry** — one per role in the reviewer pair.
- **No cross-tier completion.** One role from tier 1 plus one from tier 2 never combine.

Then §5.5 runs. Approval alone never grants a skip; approval plus `FRESH` does.

### 5.5 Staleness

```js
export function isStale(recordedHash, documentBytes) {
  if (typeof recordedHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(recordedHash))
    return "UNEVALUABLE";
  return approvalHashOf(documentBytes) === recordedHash ? "FRESH" : "STALE";
}
```

| Result | Cause | Effect |
|---|---|---|
| `FRESH` | the document's bytes now digest to the recorded hash | record `"⏭"`, skip the phase |
| `STALE` | they do not | run the phase |
| `UNEVALUABLE` | absent, duplicated or unparseable hash; or the document could not be read | run the phase, and note it in the report |

Three rules with teeth:

1. **Read at comparison time.** `documentBytes` comes from an `await _readFile(docPath)` performed at
   the moment of comparison, not from any earlier read cached during the run. A cached read is how a
   document edited between phases gets skipped as fresh.
2. **No history walk, at either tier** (O-8, as narrowed at FSPEC v1.5). One hash-equality test. No
   `git log` of the document, no reconstruction of past bytes, no descending scan.
3. **Rebase invariance.** The comparison never reads `REVIEWED-COMMIT`. Phase DOD rebases
   `feat-{feature}` before every PR, rewriting every sha on the branch; a sha- or timestamp-based test
   would report every approval stale at that moment. Content-addressing is unaffected because content
   is unaffected.

Scope: phases `R`, `F`, `T`, `P`, `D`, `PR` — **six**, matching AC-4.7 as corrected at REQ v1.6 and
FSPEC §10.7 at v1.6. `PR` (PROPERTIES) was omitted from AC-4.7 through v1.5; both TSPEC round-1
cross-reviews raised the omission independently and the operator ruled it a drafting slip, so it was
corrected upstream rather than worked around here. §10.3 T-Q-01 carries the full disposition. Phase
CR and Phase DOD remain out of scope — they review the tree rather than a named document and produce
no `CROSS-REVIEW-{role}-{doc-type}` pair, so there is no recorded hash to compare and this function is
never reached for them.

### 5.6 `dispatchAndVerify` — the H-3 fix

One episode = one (artifactSet, phase, round, mode) tuple.

#### 5.6.1 `selectMode` — how `mode` is computed (FSPEC §15.2, AC-3.5 scope (d))

`EpisodeKey.mode` is not an input the caller invents. It is computed **once, at episode entry**, by a
pure function, from **what the phase is dispatching an author to do** — never from the artifact's
structural state:

```js
export function selectMode({ dispatchKind, docType, present, reviewFiles })
//   dispatchKind : "authoring" | "review" | "dod-verify" | "harvest"
//   docType      : the doc type this episode's artifact set belongs to
//   present      : deriveRoundWindow's per-role Map<role, number[]> for docType
//   reviewFiles  : Map<`${role}:${round}`, { verdict, verdictReadable, anchorHash }>
//                  — the §5.1 / §5.4 reads already performed for this phase entry
//   →  { mode: "authoring" | "revision", round: number|null, reason: string }
```

Four rules, taken from FSPEC §15.2 and normative here:

1. **The revision test is evaluated first.** The episode is a **revision** episode iff a
   findings-bearing review round exists on the branch for this (feature, doc type). Structural
   completeness is consulted **only** when no such round exists, so completeness can never move an
   episode out of revision mode.
2. **Which round.** The highest round index `present` holds for that (feature, doc type) whose review
   artifacts do **not** carry same-round dual approval — the round still owed an authoring pass. A
   resuming invocation therefore re-enters the **same** round and re-derives its findings from the
   surviving `CROSS-REVIEW-*` files. §5.2's `max + 1` governs the **next reviewer** dispatch, which
   happens only after this episode reaches terminal; it is not the round a revision episode addresses.
   `selectMode` and `deriveRoundWindow` consume the same `present` map and answer different questions.
3. **Non-authoring wrapped dispatches are always greenfield.** `dispatchKind !== "authoring"` ⇒
   `{ mode: "authoring", round: null }` without evaluating rule 1. A `pm-review` / `se-review` /
   `te-review` / `dod-verify` / `harvest-learnings` episode is never dispatched to address findings in
   its own artifact — each writes a new file — so the revision test cannot match.
4. **Fail toward revision.** If review artifacts for the candidate round exist but their verdict
   fields are unreadable (§5.1's fail-closed cases), the episode is a **revision** episode. The
   directions are not symmetric: mis-entering greenfield silently drops a whole review round, while
   mis-entering revision costs at most a continuation prompt naming findings already reflected — and
   §8.2's trailer terminates that in one dispatch.

Stickiness is a **consequence**, not the mechanism: the selection is made once and does not change
for the life of the episode, whatever later measurements observe. Episode entry is the instant the
counters start at zero, so mode, prompt kind and counters share one scope. This is what lets a fresh
process recover `(round, mode)` after a stall kill — everything `selectMode` reads is on disk.

**The retracted derivation, stated so this document does not reinstate it.** FSPEC §15.2 withdraws
v1.3's per-dispatch re-measurement *and* v1.4's entry-time derivation from the artifact's structural
state. Neither is used here. In particular, §5.6.3's prompt-kind rule — `invocation === 1` and the
target absent or empty — selects **the prompt kind, not the mode**. The two are different axes: a
revision episode resuming after a stall kill finds an incomplete document and takes the *resume*
prompt shape, while remaining a **revision** episode carrying that round's findings. Reading that
rule as the mode rule reproduces exactly the failure §15.2 describes — the resumed episode carries a
prompt naming no findings, greenfield terminal fires on structural completeness, and the wrapper
reports success on a round whose findings were never addressed.

#### 5.6.2 The loop

The loop:

```
loop:
  invocation += 1;  dispatches += 1
  if dispatches > MAX_AUTHORING_DISPATCHES:
      return { ok:false, reason:"dispatch_budget", detail:… }

  before ← await _readFile(targetPath)              // bytes, or null
  response ← await _agent(prompt built per the two kinds below, { model })

  // ── TERMINAL FIRST ──
  after ← await _readFile(targetPath)
  if isTerminal(episode.mode, response, class, docType, after):
      return { ok:true, response }

  // ── THEN PROGRESS ──
  if bytesDiffer(before, after):  noProgress ← 0
  else:
      noProgress += 1
      if noProgress >= MAX_AUTHORING_ATTEMPTS:
          return { ok:false, reason:"no_progress", detail:… }
  prompt ← the resume form (below)
```

**The terminal test is per mode** (FSPEC §8.4, AC-3.5b). There is no unconditional trailer conjunct:

```js
function isTerminal(mode, response, artifactClass, docType, after) {
  const structural = isComplete(artifactClass, docType, after).complete;
  if (mode !== "revision") return structural;              // greenfield
  return structural && parseRevisionComplete(response).complete;
}
```

| Mode | Terminal condition | Trailer |
|---|---|---|
| **Greenfield** | the required member of the artifact set is structurally complete (§5.9) | **none required, none expected.** `parseRevisionComplete` is not called on this path |
| **Revision** | structurally complete **and** `parseRevisionComplete(response)` → `{ complete: true }` | required |

**Why the conjunct was deleted from the greenfield path rather than reconciled.** §7.4 amends only
the three **author** SKILLs to emit `REVISION-COMPLETE:`; the three review SKILLs, `dod-verify` and
`harvest-learnings` are not amended and will never emit it. Rule 3 of §5.6.1 puts every one of those
episodes in greenfield by construction. A mode-blind conjunct therefore makes the numerically
dominant episode population unable to *ever* reach terminal: each burns all six
`MAX_AUTHORING_DISPATCHES` and halts its phase — H-3's own failure mode, a correct artifact scored
not-done and the run killed, reconstructed by the mechanism built to remove it. A clause reconciling
"absent trailer counts as complete for these classes" would leave the same conjunct in place and
carry a second rule to keep in sync with §7.4's amendment list; deleting the conjunct from the
greenfield path leaves one rule.

**Terminal-first-then-progress** is not an arbitrary order. An author whose final dispatch declared
completion and whose last write happened to change no bytes (a re-emission of identical content) is
**done**, and evaluating progress first would re-dispatch it, burning budget on a finished document.
It also keeps a genuine stall counted: a stall-killed dispatch emits **no** trailer, so *no progress
without a trailer* still counts against `MAX_AUTHORING_ATTEMPTS` exactly as before.

**The progress predicate is one mode-independent byte-change test over the working tree** (FSPEC
§15.3): `before !== after`, where both are `_readFile` results with `null` for absent. It is
deliberately not "the document grew", which would fail a legitimate deletion, and deliberately not a
git-based diff, because uncommitted content is real content — **no git operation on the pacing path
may discard uncommitted work.**

#### 5.6.3 The two prompt kinds (O-6)

**This table selects the prompt kind. It does not select the mode** — §5.6.1 does that, from a
different input, at a different time. Both axes are consulted for every dispatch: the prompt kind
decides *fresh brief vs. resume brief*, the mode decides *whether findings are named and whether a
trailer is required*. All four combinations occur; a revision episode resuming after a stall kill is
`(resume, revision)`.

| Kind | When | Contains |
|---|---|---|
| **Fresh authoring** | `invocation === 1` and the target is absent or empty | the full authoring brief plus the pacing contract: emit at most `MAX_AUTHORING_WRITE_BYTES` per tool call, write the skeleton first, then one top-level section per write, commit after each, and end the response with `REVISION-COMPLETE: yes\|no` |
| **Resume** | otherwise | the same pacing contract, plus retry-ness derived **from disk by the script** — the headings already present, and the **name of the first unwritten section**, computed by the script's own heading walk (§5.9), never asked of the agent |

The script names the first unwritten section, with three definite cases: the file is absent (⇒ "start
with the skeleton"); the skeleton exists but a required heading is missing (⇒ that heading); every
required heading exists but one has an empty body (⇒ that heading's body). Deriving retry-ness from
disk rather than from conversational memory is what makes the wrapper restartable after a stall kill
— the case that motivated the whole feature.

**Revision mode** uses the same wrapper. `mode: "revision"` comes from `selectMode` (§5.6.1), not from
the caller and not from the artifact's state; the prompt additionally names the cross-review findings
of `selectMode`'s returned `round`, re-read from the surviving `CROSS-REVIEW-*` files rather than from
conversational memory. Its counters are separate because its `EpisodeKey` differs in `mode` (§4.5).

**Budget exhaustion writes no POSTMORTEM.** Running out of dispatches is not non-convergence — it is
the pacing wrapper refusing to keep paying. The phase halts with the wrapper's reason; §6.3's
POSTMORTEM path belongs to `checkConverged` alone.

**Commit cadence** (O-20): the author is instructed to commit after each top-level section, so an API
failure loses at most one section. The **commit-diff proxy** — comparing the bytes added by each
commit against `MAX_AUTHORING_WRITE_BYTES` — is the only available corroboration that the write
ceiling was respected, and it is **advisory**: it is reported and never halts a run, because a
legitimately large single section is indistinguishable from a violation at commit granularity.

### 5.7 `parseForcePhases`

```js
export function parseForcePhases(raw) {
  if (raw == null || String(raw).trim() === "") return { ok: true, phases: new Set() };
  const tokens = String(raw).split(/[,\s]+/).filter(Boolean);
  const valid = ["R", "F", "T", "P", "D", "PR"];   // six — "PR" added at REQ/FSPEC v1.6
  const bad = tokens.filter((t) => t !== "all" && !valid.includes(t));
  if (bad.length) return { ok: false, badTokens: bad };
  return { ok: true, phases: tokens.includes("all") ? new Set(valid) : new Set(tokens) };
}
```

Total, case-sensitive, whitespace- and comma-tolerant. Absent and empty are the same thing: the empty
set. An invalid token halts before any phase runs, with the operator-facing text ending
`Valid: R, F, T, P, D, PR, all.` — the token catalogue and the message are derived from the same
array, so they cannot desynchronise. That derivation is the point of this shape and is now
load-bearing: `PR` entered the catalogue at REQ/FSPEC v1.6 (§10.3 T-Q-01), and a hand-written message
would have been the one site that silently kept teaching the operator the old five-token set.

**`all` means six phases, not five** — `new Set(valid)` with `valid.length === 6`. AT-29 asserts the
message text verbatim, so it is the regression guard for both halves.

**Precedence.** `forcePhases` overrides a **recorded approval** (§5.4/§5.5 are skipped for a forced
phase). It does **not** override a **recorded failure**: an unresolved POSTMORTEM (§5.8) refuses the
phase even under force. Forcing is an operator saying "re-run this despite approval", not "ignore
that this previously failed unresolved."

`orchestrate-queue` gets no force surface at all. The queue is an unattended driver; forcing is an
attended act, and O-5's direct-invocation path is where it belongs.

### 5.8 POSTMORTEM resolution

```js
export function parseResolvedMarker(fileText)   // scanLines; `RESOLVED: yes|no`
export function checkPostmortem({ phase, feature, _readFile })
//   → { status: "none" }                       no POSTMORTEM file
//   | { status: "resolved" }                    marker present and `yes`
//   | { status: "unresolved", recommendation }  marker present and `no`, or absent/malformed
```

**Where it is called from, and with what power,** is fixed by §2.5 and is part of this contract:
`checkPostmortem` is a **query**, not a gate. It never decides on its own whether a phase runs; the
caller does, and the caller's power differs by path — unconditional refusal on the forced path,
refusal on the would-otherwise-run path, and reporting only on the skip path. An implementation that
puts the refusal *inside* `checkPostmortem`, or calls it ahead of the approval skip, reproduces the
inversion AC-2.3b exists to fix.

The marker is **positionally unconstrained** within the file — a `RESOLVED:` line anywhere outside a
fenced region counts — and is **human-written only**. No agent and no script ever writes `yes`; a
POSTMORTEM resolves when a person says it did.

Absent or malformed marker ⇒ `unresolved`. Fail closed: a POSTMORTEM whose marker cannot be read is
treated as an unaddressed failure, which costs an operator one edit, whereas the opposite default
silently re-runs a phase that previously failed for an unfixed reason.

`extractRecommendation(fileText)` takes the `## Recommendation` heading (located via `scanLines`) to
the next top-level heading or EOF, truncated at 4,000 bytes with an explicit truncation notice. It
feeds the halt message so the operator sees *what to do* without opening the file.

### 5.9 Structural completeness

```js
export function isComplete(artifactClass, docType, fileText)
```

Four wrapped artifact classes:

| Class | Criterion |
|---|---|
| **spec documents** (REQ, FSPEC, TSPEC, PLAN, PROPERTIES, DECISIONS) | every top-level `##` heading has a non-empty body, **and** the class's required headings are all present |
| **cross-review** | the trailing `## Verdict` section carries exactly one well-formed `VERDICT:` field — the field is the marker precisely because it is written last |
| **code-review** | the `Scope:` field is present |
| **LEARNINGS** | its own required headings; the approval record section is **excluded** from the criterion |

Required headings per spec class (this document's own class is the TSPEC row):

| Class | Required top-level headings (normalised title; numeric prefixes permitted) |
|---|---|
| REQ | Problem / Context, Goals, Non-Goals *(or Scope)*, Constraints, Acceptance Criteria, Risks, Obligations *(or Open Questions)* |
| FSPEC | Overview *(or Scope)*, Linked Requirements, Behavioral Flow, Business Rules, Edge Cases and Error Scenarios, Acceptance Tests, Open Questions |
| **TSPEC** | **Overview, Architecture *(or Design)*, Interfaces, Data Model *(or State)*, Test Strategy, Open Questions** |
| PLAN | Overview, Batches *(or Tasks)*, Dependencies, Verification |
| PROPERTIES | Overview, Properties, Oracles, Fixtures |
| DECISIONS | Context, Options Considered, Decision, Consequences |

Matching rules: case-insensitive, whitespace-normalised, a leading `N.` / `N)` numeric prefix ignored,
parenthesised alternatives accepted as equivalent. Extra headings are permitted and counted in `T`.
**Order is not required** — enforcing it would fail a legitimate reordering and adds nothing to the
terminal question. A body consisting only of `TBD`, `TODO`, `_TBD_`, or an HTML comment counts as
**empty**, or a skeleton written with placeholders would score complete on write 1.

The report carries `T` (top-level headings present) and `S` (those with non-empty bodies), both
measured rather than fixed, so a document richer than the minimum reports honestly.

**Known, accepted shallowness** (FSPEC v1.5, SE-v5 F-20 / TE-v5 Q-01): a body consisting only of a
fenced block containing `TBD` scores non-empty, because §5.0's exclusion deliberately does not empty a
section body. A fence-aware placeholder test would reintroduce exactly the coupling that produced
v1.4's false-halt regression. The criterion is shallow by design; §4.5's counters, not this test, are
what bound a badly behaved episode.

## 6. Error Handling

### 6.1 The uniform direction

FSPEC §1.2 rule 4 fixes the direction of every ambiguity in this feature: **wherever a
machine-readable field cannot be read, the behaviour is *more* work, never less.** The phase runs;
the episode does not reach terminal; the approval is not granted. That rule is not restated at each
site below — it is why each site takes the branch it does.

The one deliberate exception is `ListFailure.dir_missing` (§4.2), which is benign because "the
directory does not exist" is a *complete and correct* answer to "what cross-reviews are there", not a
failure to answer.

### 6.2 Failure disposition table

| # | Failure | Detection | Disposition |
|---|---|---|---|
| 1 | `_listFiles` → `dir_missing` | seam return | empty listing; `startIndex = 1`; phase runs |
| 2 | `_listFiles` → `not_a_directory` / `unreadable` / `bad_argument` | seam return | **halt**, `Cannot enumerate {dirPath}: {reason}` |
| 3 | two files claim round 1 for one role | `deriveRoundWindow` step 5 | **halt**, naming the role and both filenames |
| 4 | filename does not match the grammar | `parseReviewFilename` | ignored for round derivation; not an error — the directory legitimately holds REQ, FSPEC, POSTMORTEM, LEARNINGS. Carried out on `deriveRoundWindow`'s `skipped` array (§5.2 step 7) and named in the phase-entry line as `skipped non-conforming: {basenames}` (E-03, E-07, AT-05) |
| 5 | no `## Verdict` section, or a duplicate `VERDICT:` line | §5.1 | not approving; phase runs |
| 6 | `APPROVAL-HASH:` absent / duplicated / unparseable | `parseApprovalHash` | `UNEVALUABLE`; phase runs; noted in the report |
| 7 | reviewed document unreadable at comparison time | `_readFile` → `null` | `UNEVALUABLE`; phase runs |
| 8 | `_appendFile` rejects, or the verification read finds ≠ 1 anchor, or the pre-count finds one **unequal** anchor (E-15) or ≥ 2 anchors (E-15) | §5.3 | operator-facing error; **round yields no approval**; run continues. The pre-count's one-**equal**-anchor case (E-14) is **not** here — it is an idempotent no-op, not a failure |
| 9 | `REVISION-COMPLETE:` absent / duplicated / unparseable, **on a revision episode** | `parseRevisionComplete` | episode not terminal; continue; counts toward the counters |
| 9a | no `REVISION-COMPLETE:` on a **greenfield** episode | — | **not a failure and not detected.** `parseRevisionComplete` is not called; terminal is structural completeness alone (§5.6.2). This row exists so the absence is a recorded non-event rather than a gap |
| 10 | `MAX_AUTHORING_ATTEMPTS` consecutive no-progress dispatches | `dispatchAndVerify` | halt the phase, `reason: "no_progress"`; **no POSTMORTEM** |
| 11 | `MAX_AUTHORING_DISPATCHES` exceeded | `dispatchAndVerify` | halt the phase, `reason: "dispatch_budget"`; **no POSTMORTEM** |
| 12 | invalid `forcePhases` token | `parseForcePhases` | halt **before any phase runs**, ending `Valid: R, F, T, P, D, PR, all.` (six tokens plus `all`, per REQ/FSPEC v1.6) |
| 13 | unresolved POSTMORTEM for the phase, **on a path where the phase would otherwise run** (§2.5 step 4a) or **on the forced path** (§2.5 step 1) | `checkPostmortem` | refuse the phase, `postmortemStatus: "unresolved"`, halt reason carries the Recommendation excerpt; **not overridable by `forcePhases`** |
| 13a | unresolved POSTMORTEM for a phase the approval skip has already elided (§2.5 step 4, `FRESH`) | `checkPostmortem`, evaluated for reporting only | **not a failure.** The skip stands and the run proceeds; the notice names the POSTMORTEM path (§4.7) and `postmortemStatus` is `"unresolved"`. AC-2.3's refusal is conditioned on the phase otherwise running, so there is nothing here to refuse |
| 14 | non-convergence within `startIndex..endIndex` | `checkConverged` | §6.3's terminal exit |
| 15 | POSTMORTEM write failed | `_checkFile` after the write agent | §6.4's second halt shape, `postmortemStatus: "write_failed"` |
| 16 | queue-row commit failed | `_git` → `{ ok: false }` | §6.5; `queueRow: "error"`; the halt itself is **not** downgraded |

Rows 10 and 11 write **no POSTMORTEM** on purpose. Exhausting the authoring budget is the pacing
wrapper refusing to keep paying; it is not the reviewers failing to converge, and a POSTMORTEM
claiming non-convergence would be false. The POSTMORTEM path belongs to `checkConverged` alone.

### 6.3 The terminal exit — the H-2 fix

Today `checkConverged` builds
`` const postmortemPath = `docs/{feature}/POSTMORTEM-${phaseId}-{feature}.md`; `` — a template that
interpolates `phaseId` but carries **literal, uninterpolated `{feature}` braces** — and then never
reads the variable. Its halt text nevertheless asserts `POSTMORTEM written.`

**Disposition: made correct and made used**, not deleted. Deleting satisfies AC-5.2's letter, but the
path is needed as a structured report field, so correcting it discharges both obligations.

```js
const postmortemPath = `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md`;
```

`feature` is added to `checkConverged`'s parameter list; it is in scope at every call site.

The exit sequence, in order:

```
1.  dispatch the POSTMORTEM author for {phaseId, feature}, writing postmortemPath
2.  await _checkFile(postmortemPath)      ← CONFIRM, do not trust the agent's reply
3.  postmortemWritten ← the confirmation, not the agent's return
4.  await _recordHalt({ feature, status: "halted" })
5.  throw haltError(one of §6.4's two shapes)
```

Step 2 is the crux. A write relayed through `agent()` (`rtWriteFile` replies `"ok"` when it believes
it wrote) is precisely the narration this feature exists to stop trusting, and AC-2.2's whole point is
that a halt must not claim a write that did not happen. `reviewLoop`'s return shape is extended from
`{ converged: false, iterations: 5, lastResults }` to carry `postmortemWritten: boolean` — the
information its existing `postmortemFailed` local already holds and discards.

**The general rule this establishes: no un-substituted template reaches a report.** Any operator-facing
string whose `{…}` placeholders are not all substituted is a defect. The same rule condemns
`reviewerPrompt`'s and `optimizerPrompt`'s `{DOC-TYPE}` literals (§5.2).

### 6.4 Halt message shapes

The two conditional replacements for the unconditional `POSTMORTEM written.`:

| Condition | Reason string | `postmortemStatus` |
|---|---|---|
| POSTMORTEM agent returned **and** `_checkFile` confirms a non-empty file | `Phase {P} did not converge after {MAX_REVIEW_ROUNDS} rounds{reviewerDetail}. Post-mortem written at {path}. Recover: resolve it per AC-2.4, then set the queue row back to pending.` | `"written"` |
| agent threw, **or** `_checkFile` reports missing/empty | `Phase {P} did not converge after {MAX_REVIEW_ROUNDS} rounds{reviewerDetail}. Post-mortem write FAILED — no artifact at {path}.` | `"write_failed"` |

The refusal halt (§5.8, row 13) is a third, distinct shape, naming the existing POSTMORTEM path and
carrying the truncated Recommendation so the operator sees the required action without opening the
file.

`checkConverged`'s existing `recordPhase(phaseId, phaseLabel, "❌", …, 5)` call has its message
rewritten to name `rounds {startIndex}..{endIndex}` and its trailing count argument replaced by
`MAX_REVIEW_ROUNDS` (§7.1, edit 1).

### 6.5 The queue-row commit

Exactly two `_git` invocations, in order, from the committing `rewriteStatus`:

```
git add    -- docs/_queue/QUEUE.md
git commit -m "chore(queue): {feature} → {status}" -- docs/_queue/QUEUE.md
```

| Aspect | Specification |
|---|---|
| Message | `chore(queue): {feature} → {status}`, matching this repo's existing convention (`chore(queue): row 1 pdlc-workflow-distribution awaiting-merge → done`) so the history stays greppable |
| Pathspec | the queue path only, after `--`. `git commit -a` would sweep unrelated working-tree changes into a queue-status commit; the `-- {path}` form commits only that file even when the tree is dirty |
| Scope | **every** status write, not only `halted`. `in-progress` and `awaiting-merge` become durable too — a strict improvement, and it avoids a second, divergent code path |
| Push | **not** performed. The halt must survive the *process*, which a local commit achieves; pushing is a network act with its own failure modes and is not what AC-2.1 asks for |
| Halt classes | both. An authoring-budget halt (rows 10–11) writes no POSTMORTEM and still commits the `halted` row |

**A dirty working tree is not an error and is not cleaned.** A halted pipeline routinely leaves a
partially written document in the tree — that partial progress is exactly what the recovery path
resumes from — so stashing, resetting or refusing would destroy the state recovery needs. The
pathspec form makes the dirty tree irrelevant.

**One accepted edge case:** if `QUEUE.md` is already staged with *other* operator changes, the commit
captures those too. Detecting it needs a diff-vs-index comparison whose only available action would be
to refuse, and refusing loses the halt. The commit message names the status change, so the extra
content is visible in review.

**Commit failure does not downgrade the halt.** `_git` returns `{ ok: false }`; `_recordHalt` returns
`{ queueRow: "error", detail }`; the report carries it; the pipeline still halts for the original
reason. A failure to *record* a halt is not a reason to *not* halt.

### 6.6 Advisory-only signals

Two signals in this design are reported and never halt:

- the **commit-diff proxy** for `MAX_AUTHORING_WRITE_BYTES` (§5.6) — a legitimately large single
  section is indistinguishable from a violation at commit granularity;
- an **`UNEVALUABLE` staleness result** — it already causes the phase to run, which is the whole
  remedy; halting on top of that would convert a missing optimisation into an outage.

## 7. Build and Distribution

### 7.1 The `MAX_REVIEW_ROUNDS` edits (AC-5.1)

The iteration cap is the bare literal `5` at five sites in `orchestrate-dev.js`. Anchors are
**enclosing symbol + distinctive literal**; no `file:line` appears here because line numbers drift.

| # | Enclosing symbol | Distinctive literal | Edit |
|---|---|---|---|
| 1 | `checkConverged` | `recordPhase(phaseId, phaseLabel, "❌", ` + `` `Non-convergence after 5 iterations${reviewerDetail}` `` + `, 5)` | message names `rounds ${startIndex}..${endIndex}`; the trailing count argument becomes `MAX_REVIEW_ROUNDS` |
| 2 | `checkConverged` | `` throw haltError(`Phase ${phaseId} did not converge after 5 iterations${reviewerDetail}. POSTMORTEM written.`) `` | `after ${MAX_REVIEW_ROUNDS} rounds`, and the unconditional `POSTMORTEM written.` becomes §6.4's two conditional shapes |
| 3 | `reviewLoop` | `if (iteration > 5)` | `if (iteration > endIndex)`, `endIndex = startIndex + MAX_REVIEW_ROUNDS - 1` |
| 4 | `reviewLoop` | `Include the required sections: Phase, Iterations (5 — limit reached), …` | `Iterations (${MAX_REVIEW_ROUNDS} — limit reached)` |
| 5 | `reviewLoop` | `return { converged: false, iterations: 5, lastResults };` | `iterations: MAX_REVIEW_ROUNDS`, and the shape gains `postmortemWritten` |

Sites 1 and 3 derive from the constant **and** `startIndex`; only sites 4 and 5, which report a
*count* rather than an *index*, use the constant alone. §5.2 states why.

### 7.2 The `build-runtime.mjs` edits (§17.3)

Three of these were omitted from FSPEC v1.0 and added at v1.1 (SE-v1 F-04) precisely because
`_recordHalt`'s closure over the queue's row helpers is **unreachable** without them. Edit 2 is
**two** edits to the same literal — 2a and 2b below — for the reason TE-v1 F-07 identified: the
seam that has to reach the *delegated dev pipeline* is not in the same object as the seam that has to
reach `__queue.main`, and conflating them leaves the production path unwired behind a green suite.

| # | Anchor | Edit | Why |
|---|---|---|---|
| 1 | `DEV_ENTRY`'s existing `args && typeof args === "object" && args.reqPath` test | also read `args.forcePhases`, and pass it: `__dev.main({ reqPath: __reqPath, forcePhases: __forcePhases, ...rtDevInjections(__dev) })` | the operator override has no other channel into the bundle |
| 2a | `QUEUE_ENTRY`'s existing `_writeFile: rtWriteFile,` line | add **`_git: rtGit`, and nothing else** | this object is the argument to `__queue.main`, whose signature gains only `_git` (§3.6). `_listFiles` and `_appendFile` here would be silently ignored — and, worse, would *spuriously satisfy* AT-64's "present in an entrypoint's injection object" clause for seams that are in fact unwired |
| 2b | `QUEUE_ENTRY`'s existing `` _runPipeline: ({ reqPath }) => __dev.main({ reqPath, ...__devInjections }), `` | becomes `` _runPipeline: ({ reqPath }) => __dev.main({ reqPath, ...__devInjections, _recordHalt: async ({ feature, status }) => …rewriteStatus over __queuePath… }), `` | **without this the `_recordHalt` seam is unwired on the production queue path.** `rtDevInjections` cannot supply it (§3.10: its implementation differs by caller), so the delegated dev pipeline would fall back to `defaultRecordHalt`'s `{ queueRow: "none" }` no-op and AT-21 — "non-convergence commits the `halted` row *under `orchestrate-queue`*" — would be **false in production while green at L2** against an injected `recordingRecordHalt()`. `_listFiles` and `_appendFile` reach the dev pipeline through `__devInjections` (§3.10) and need no mention here |
| 3 | `wrapModule("__queue", …, ["main", "meta", "DEFAULT_QUEUE_PATH"])` | extend `exportedNames` with `rewriteStatus` and `updateQueueStatus` | neither is on `__queue` today; without them `DEV_ENTRY`'s `_recordHalt` closure has nothing to call |
| 4 | `contents: [DEV_META, BANNER, adapter, devModule, DEV_ENTRY]` | insert `queueModule` | the **dev** bundle does not inline the queue module at all today; adding it (with its `wrapModule` prelude `const realMain = __dev.main;`) is what makes "the dev bundle can reach the queue's row helpers" true rather than assumed |

`stripModuleSyntax` is **unmodified**. Its
`.replace(/^export (const|let|var|function|async function|class) /gm, "$1 ")` is what silently inlines
§5.3's digest without an `import`, and its `import`-line filter is what keeps the bundle C-2-legal.
The new pure functions of §3.7 need nothing from it beyond what it already does.

**Edit 2b's closure, spelled out**, since it is the one whose omission is invisible:

```js
_recordHalt: async ({ feature, status }) =>
  __queue.rewriteStatus(__queuePath, feature, status, rtReadFile, rtWriteFile, rtGit),
```

It closes over the queue path the entrypoint already resolved, and calls the **exported**
`rewriteStatus` (edit 3) so the row write and its commit happen in the one function that owns status
writes (§6.5). It is `async` and its result is `await`ed by `orchestrate-dev`'s terminal exit (§6.3
step 4) — the seam is in AT-19's scan set for exactly that reason.

**Ordering hazard.** Edit 4 makes `queueModule` appear in the dev bundle, and `queueModule`'s prelude
references `__dev.main`. `devModule` must therefore still precede `queueModule` in the `contents`
array — which the insertion point above preserves. Reversing them produces a bundle that throws at
load.

**Edit 4's size cost, measured rather than asked** (`DC-02`; closes T-Q-05). At HEAD `ef4705a`:

| Artifact | Bytes | Lines |
|---|---|---|
| `pdlc/workflows/dist/orchestrate-dev.bundle.js` | 92,525 | 2,377 |
| `pdlc/workflows/dist/orchestrate-queue.bundle.js` | 140,096 | 3,540 |
| `pdlc/workflows/orchestrate-queue.js` (source) | 47,733 | 1,158 |

The queue bundle **already inlines both modules today** and ships. Edit 4 therefore grows the dev
bundle to roughly the size of an artifact that has been in production since
`pdlc-workflow-distribution` — the largest shipped artifact already contains exactly this union, so
no new size territory is entered and there is no undocumented ceiling to discover. The alternative
the FSPEC leaves implicit — duplicating the two row helpers into `orchestrate-dev.js` — is
**declined on the merits**, not for want of a limit: it would put a second copy of the queue's table
grammar in a module whose §3.5 contract is precisely that it never learns that grammar, and a second
copy of a parser is the failure mode DC-11 and §1.5's cite-and-reuse rule both exist to prevent.

### 7.3 Generated artifacts

`pdlc/workflows/dist/` is generated. Every commit that touches any of the five sources in §1.3
**also** runs:

```bash
node pdlc/workflows/build-runtime.mjs
```

and commits the resulting `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js` and
`distribution-manifest.json`. `build-runtime.mjs --check` exits non-zero when an artifact is stale;
`__tests__/runtimeBundle.test.js` asserts freshness plus the structural constraints; and
`pdlc/hooks/scripts/sync-workflows.sh --check` covers the untracked consumer copy under
`.claude/workflows/`. None of the three is authored by this feature — they already exist and already
guard this — but a change that lands source without a rebuild reds the suite, which is the intended
outcome.

The consumer copy is never committed and never hand-edited (`DEC-DIST-02`).

### 7.4 SKILL prompt amendments

Prompt text, not code, but load-bearing: the persisted records of §4.4 exist only if the agents write
them.

| File | Amendment | Source |
|---|---|---|
| `pdlc/skills/se-review/SKILL.md`, `pm-review`, `te-review` | write the `## Verdict` section as the file's **last** section, in §4.4's exact grammar | FSPEC §6.5 |
| `pdlc/skills/se-author/SKILL.md`, `pm-author`, `te-author` | end every response with `REVISION-COMPLETE: yes\|no` as its **last line**; observe the pacing contract | FSPEC §8.4 |
| `pdlc/skills/harvest-learnings/SKILL.md` | emit `## 6. Approval Record` per §4.4, copying the anchor lines **verbatim** and never recomputing | FSPEC §9.4 |
| `pdlc/skills/orchestrate-dev/SKILL.md` | document the POSTMORTEM lifecycle and the `RESOLVED:` marker | AC-5.3 |
| `pdlc/skills/orchestrate-queue/SKILL.md` | document that a `halted` row is committed | AC-5.4 |

`pdlc/workflows/__tests__/skillFiles.test.js` already asserts properties of SKILL files and is the
natural home for assertions that these amendments are present.

### 7.5 The version bump

`pdlc/.claude-plugin/plugin.json`'s `version` is bumped in the same change. The distribution manifest
records the plugin version the bytes were built at, so a bundle rebuild without a version bump
produces a manifest that under-reports what changed.

## 8. Test Strategy

### 8.1 Levels and doubles

Three levels, matching §2.4's three strata. The rule is that a test is written at the **lowest level
that can falsify the claim**.

| Level | Subject | Doubles | Where |
|---|---|---|---|
| **L1 — pure** | every parser, `sha256Hex`, `scanLines`, `isStale`, `isComplete`, `deriveRoundWindow`, `parseForcePhases`, `updateQueueStatus` | **none** — string in, record out | new `__tests__/` files, §8.3 |
| **L2 — orchestration** | `main`, `reviewLoop`, `dispatchAndVerify`, `checkConverged`, the phase gate, `rewriteStatus` | **synchronous** doubles for every seam, supplied through `main()`'s injection list | extends `reviewLoop.test.js`, `orchestrate-dev.test.js`, `orchestrateQueue.test.js` |
| **L3 — composition** | the built bundles and the composition root | **none at all** — this is the point | `runtimeBundle.test.js`, `pipelineWiring.test.js` |

**The seam doubles are sync; the adapter is async.** This asymmetry is a *feature* of the test
design and simultaneously its central hazard: it is precisely why a missing `await` passes L1 and L2
and fails only in production. L3's AT-19 is the compensating control, and it is the only thing
standing between this design and this repo's most repeated defect class.

Every double follows `DEC-ORACLE-03` — one canonical double at a named path, not a fresh ad-hoc
object per test file. A single `__tests__/helpers/seams.js` exports factory functions
(`fakeListFiles(files)`, `fakeFs(initialContents)`, `fakeGit(script)`, `recordingRecordHalt()`) so
that a change to a seam contract breaks one file, not thirty.

**L1 is example-based *and* property-based.** Every parameterisable component in the L1 row carries
at least one property, generated with the shipped `__tests__/helpers/driftGenerators.js` — §8.2 names
the properties and the generator's contract. Examples pin the known answers a property cannot
(`sha256Hex`'s digest vectors, `quoted-verdict.md`'s nesting); properties cover the input space the
examples sample.

`DEC-ORACLE-01` applies to the run-wide assertions: AT-13's "one digest function on both paths" and
AT-64's "every seam is wired" cannot live at module level, and are written as explicit tests.

### 8.2 Fixtures

`__tests__/fixtures/cross-reviews/` holds the byte-exact artifacts the grammar tests need. Three
deserve naming because getting them wrong makes the test vacuous:

- **`quoted-verdict.md`** (AT-65) — the fence is pinned to the **nested** form: a four-backtick block
  wrapping a three-backtick template that contains `VERDICT: Approved`. An implementation that treats
  "the next fence line closes it" must **red** on this fixture. A three-in-three fixture would pass
  under the wrong implementation.
- **`quoted-hash.md`** (AT-66) — a fenced `APPROVAL-HASH:` line that must not enter the pre-count.
- **`unclosed-fence.md`** (AT-66) — an opener with no closer, whose remainder must be swallowed.

Digest fixtures pin known-answer vectors: the empty string, an ASCII string, a multi-byte UTF-8
string, and a surrogate-pair string (an emoji), each with its expected 64-hex digest computed
externally. Without the last two, the hand-rolled `utf8Bytes` is untested where it is most likely to
be wrong.

**Examples are not sufficient on their own for the parameterisable components**, and the generator
this repo needs already ships. `pdlc/workflows/__tests__/helpers/driftGenerators.js` — verified at
HEAD `ef4705a` — exports `seeded(seed)` (a stateful `xorshift32` with `int` / `pick` / `shuffle` /
`bytes`), `resolveSeed(literalSeed)` (a `PDLC_PROP_SEED` environment override), and `shrink(case)`.
It is dependency-free, so C-2's "no new dependency" argument does not apply to it, and it is already
consumed by seven suites (`driftBaseline`, `driftBackups`, `driftFault`, `driftHook`, `driftOrdering`,
`driftRepoRoot`, `queueDriftGate`). **It is reused, not re-implemented, and a second generator
library is not written** (§1.5's cite-and-reuse rule; `DEC-ORACLE-03`).

One property per parameterisable component, each declaring its own literal seed through
`resolveSeed`, each L1 (string in, record out):

| Component | Property | Generated input |
|---|---|---|
| `canonicaliseForDigest` | **idempotence**: `f(f(t)) === f(t)`; and every result ends in exactly one `\n` and contains no `\r` | `rng.bytes`-derived strings with injected `\r\n`, `\r`, and 0…5 trailing newlines |
| `scanLines` | **totality and partition**: never throws for any input, and the visited set ∪ the fenced-and-fence-line set is exactly the line set, disjointly | line sequences drawn from a small alphabet of fence openers (3–6 backticks/tildes), closers, and content |
| `parseReviewFilename` | **round-trip**: a basename assembled from the G-1…G-4 grammar parses back to the role, doc type and round it was assembled from; and any basename with a deliberately mutated part yields `ok: false` with the reason that part governs | role ∈ `MAP`'s values, doc type ∈ the closed catalogue, round ∈ 1…999, suffix present or absent |
| `deriveRoundWindow` | **window invariant**: `startIndex > max(every index in present)` and `endIndex === startIndex + MAX_REVIEW_ROUNDS - 1`, for every listing that does not trip the round-1 duplicate halt; and `skipped` ∪ the parsed entries partitions the input basenames | shuffled listings mixing conforming basenames, non-conforming ones, and unrelated files |
| `sha256Hex` | **determinism and totality**: equal inputs digest equal, output always matches `/^[0-9a-f]{64}$/` — the known-answer vectors above remain the correctness oracle, this is the coverage oracle | arbitrary byte-derived strings including lone surrogates |
| `parseForcePhases` | **catalogue closure**: every returned phase is in the `valid` array, and any token outside it appears in `badTokens` — no token is silently dropped or coerced | token multisets drawn from the valid array, `all`, casing variants, and junk |
| `isComplete` | **monotonicity in the required direction**: adding a required heading with a non-empty body never moves a document from complete to incomplete | heading sets drawn from §5.9's per-class tables, bodies drawn from {non-empty, empty, `TBD`, HTML comment} |

Reproduction is by **replay, not by index**, per the generator's own contract: each file prints its
seed and case n is reproduced by replaying draws 1…n. `shrink` is used for the failure report, not
for the pass path.

### 8.3 AT → jest file map

**Test names are namespaced `RLH-AT-{N}`**, not bare `AT-{N}`. The collision is real and measured:
`__tests__/documentOracles.test.js` at HEAD carries
`test("AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing", …)` from the
preceding feature, while this feature's AT-22 is "halt does not claim an unwritten POSTMORTEM". Two
tests named `AT-22` in one suite, owned by different features, make a failure report ambiguous
exactly when it matters. The table below uses FSPEC's bare ids because that is how the FSPEC numbers
them; the **jest test name** for every row is `RLH-AT-{N}`.

| ATs | Concern | File |
|---|---|---|
| AT-01 … AT-07, AT-63 | round-index derivation, filename grammar, un-suffixed round 1, clean branch, unenumerable directory, non-conforming basenames, overwrite guard, per-role duplicate halt | `__tests__/roundDerivation.test.js` **(new)** |
| AT-08 … AT-11, AT-56, AT-57 | same-round dual approval, no cross-round combination, absent role file, duplicated verdict, partial/disagreeing anchor pair, higher non-approving round | `__tests__/approvalSearch.test.js` **(new)** |
| AT-12 … AT-18 | digest usability, one digest function, canonicalisation inside, pre-harvest edit invalidation, rebase invariance, failed append, record-less LEARNINGS | `__tests__/approvalHash.test.js` **(new)** |
| AT-19, AT-20, AT-64 | bundle structural constraints, `dist/` freshness, composition root wiring | `__tests__/runtimeBundle.test.js` **(extend)** |
| AT-21 … AT-27, AT-30 … AT-34 | POSTMORTEM lifecycle, structured halt fields, queue-row commit, commit-failure branches | `__tests__/haltAndQueue.test.js` **(new)**, plus `orchestrateQueue.test.js` **(extend)** |
| AT-28, AT-29 | force overrides approval only; bad token rejection | `__tests__/forcePhases.test.js` **(new)** |
| AT-35 … AT-54, AT-58 | the pacing wrapper end to end: terminal/progress ordering, the four trailer reasons, counter reset and per-episode isolation, mode across the invocation seam, artifact-set semantics, working-tree measurement, budget exhaustion, prompt contract, advisory proxy, no-git-discards | `__tests__/pacingWrapper.test.js` **(new)** |
| AT-55 | no un-substituted template reaches a report | `__tests__/reportTemplates.test.js` **(new)** |
| AT-59, AT-60, AT-62 | terminal-but-not-approving, structural completeness incl. placeholder skeleton | `__tests__/completeness.test.js` **(new)** |
| AT-61 | each trailer reason distinguishable in the report | `pacingWrapper.test.js` |
| AT-65, AT-66 | fenced-region exclusion, both directions plus unclosed fence | `__tests__/scanLines.test.js` **(new)** |

**The gate is "no new failures against a measured baseline", not "the suite is green."** The suite is
not green at HEAD and has not been for the life of this branch. Measured by
`cd pdlc/workflows && npm test` at HEAD `ef4705a`:

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
```

The single failure is `documentOracles.test.js`'s **intentional** red placeholder
`AT-22 [red-until-L-06]`, carried deliberately from the preceding feature. Stating the gate as
absolute green would make it unsatisfiable on arrival, and the predictable response — deleting or
skipping that placeholder to get green — would discard another feature's deferral marker. The gate
this feature is held to is therefore: **1038 passing / 1 failing / 70 skipped or better, with the one
failure still being `documentOracles.test.js` `AT-22 [red-until-L-06]` and no other.** A second
failure, or a *different* single failure, is a regression.

Existing suites that will need mechanical updates: `reviewLoop.test.js` (the
`iteration` parameter is now supplied at every call site), `parseVerdict.test.js` (unchanged
behaviour; new file-path callers), `orchestrateQueue.test.js` (`updateQueueStatus`'s return shape),
`pipelineWiring.test.js` (the six new `main()` parameters), `dodPhase.test.js` / `shipPhase.test.js` /
`implPhase.test.js` / `harvestPhase.test.js` (unaffected in behaviour; affected by `buildFinalReport`'s
widened field list).

### 8.4 What each level may not do

- **L1 may not touch the filesystem.** If a pure-function test needs a file, the function under test
  is not pure and belongs in L2.
- **L2 may not read `pdlc/workflows/dist/`.** A test that reads a generated artifact to make a claim
  about source behaviour will pass against a stale bundle.
- **L3 may not inject anything.** Injecting into a composition-root test defeats its only purpose.

### 8.5 AT-19 and AT-64 — the two tests that guard the runtime

These are called out because they are the only two whose failure mode is invisible to every other
test in the suite.

**AT-19 — bundle-level constraint assertions.** `runtimeBundle.test.js` today asserts: `meta` first,
nothing else exported, no static `import`, a top-level `return`, IO routed through the adapters, and
`dist/` freshness. It asserts **nothing** about `process`, `fetch`, or awaiting. AT-19 is therefore a
**new** assertion this TSPEC must write, not an existing one to point at:

- two anchored regexes over each bundle's text — `/\bprocess\s*\./` and `/\bfetch\s*\(/` — each
  matching zero times;
- **not** the bare-identifier forms. The banner in both healthy bundles legitimately contains
  `child_process` and `git fetch origin`, so a substring test matches on a correct bundle and the
  assertion becomes noise. FSPEC v1.3 struck the bare forms from AT-19 for exactly this measured
  reason.
- an await-discipline assertion over `orchestrate-dev.js`'s **source**, scoped to **FSPEC AT-19's
  closed thirteen-name set** — `_agent`, `_readFile`, `_writeFile`, `_appendFile`, `_checkFile`,
  `_listFiles`, `_git`, `_checkCi`, `_mergeWorktree`, `_recordHalt`, `_rebaseOntoDefault`,
  `_dodVerifyLoop`, `_raisePrAndVerifyCi` — and **not** to a set derived from `main()`'s parameter
  list.

**Why the parameter-list derivation is wrong here, measured at HEAD `ef4705a`.** The two guards
answer different questions and must not share a derivation. AT-64 asks *is every capability wired*,
which must be derived so a new seam cannot be forgotten. AT-19 asks *is every asynchronous call
awaited*, which is a property of the seam's **implementation**, not of its position in a parameter
list — and `main()`'s parameter list contains parameters that are correctly called without `await`:

- **`_now` is a clock.** It is a `main()` parameter threaded down to `checkPrCi`, whose body calls it
  synchronously at four sites (`const start = _now();`, `completionStart = _now();`, and the two
  elapsed-time comparisons `_now() - completionStart` / `_now() - start`). A clock must not be
  awaited; awaiting it would make every comparison compare a promise.
- **`_phaseDodEnabled` / `_phasePubEnabled` are booleans**, never called at all.

So a parameter-list derivation reds AT-19 on the shipped, correct source — and §8.1 calls this test
"the only thing standing between this design and this repo's most repeated defect class", so a test
that must be loosened ad hoc to go green is worse than none. The FSPEC supplies a closed list
precisely because the membership question is a design judgement, not a derivation; AT-64, below,
is what stops that list from being the thing that rots.

**Two call-site shapes the assertion must classify explicitly, or it reds on correct source:**

| Shape | Example at HEAD | Ruling |
|---|---|---|
| **Alias** — the seam is destructured under a local name (`_readFile: readFileFn`, `_agent: rawAgentFn`) and called through that name | `await readFileFn(planPath)`, `await checkFileFn(reqPath)` | the assertion resolves the alias from `main()`'s destructuring pattern and scans **the local name**, not the `_`-prefixed one. Scanning the `_` name alone finds zero call sites and passes vacuously — the worst possible failure for this test |
| **Returned promise** — the call is the entire body of an arrow function, or the operand of a `return`, so its promise is awaited by the caller | `` const agentFn = (skill, prompt, opts) => rawAgentFn(skill, prompt, { model: MODEL_DEFAULT, ...opts }); `` | **exempt, and the wrapper's own name inherits the obligation.** `agentFn` is then itself scanned as an alias of `_agent`, and every `await agentFn(…)` site satisfies the rule. Requiring `await` inside the wrapper would be a redundant await on a correct construction |

Every other call site of an aliased thirteen-list seam must be lexically preceded by `await`,
including calls whose result is discarded. The assertion runs over `orchestrate-dev.js` and
`orchestrate-queue.js` **source** (permitted at any level — it reads source, not `dist/`, so §8.4's
L2 prohibition does not apply).

**AT-64 — the composition root wires every seam.** Asserted against the **production** composition
root with **no injection whatsoever**: `main`'s default-parameter behaviour and `rtDevInjections`'s
returned object are inspected as they ship.

The seam set is **derived from `main()`**, not hand-listed — the test parses `main`'s destructured
parameter list for names matching `/^_/` and requires each to be satisfied. A hand-list is precisely
the artefact that rots: the next seam added to `main()` would leave the test green while the runtime
receives `undefined` and throws on first use.

**Every `_`-prefixed parameter must be either *wired* or *exempt*, and exemption is a predicate over
the parameter's own declaration — not a list of names.** A list of names is the same artefact as a
hand-maintained seam list: it relocates the rot rather than removing it, and it says nothing about
*why* a name is on it, so nothing distinguishes a legitimate policy parameter from a real capability
seam somebody parked there to get green.

**Wired** means: present in `rtDevInjections`, **or** present in a bundle entrypoint's injection
object — which for `QUEUE_ENTRY` includes the `_runPipeline` closure's `__dev.main({…})` argument
(§7.2 edit 2b), the only place `_recordHalt` is supplied on the queue path.

**Exempt** means the parameter's declaration in `main()`'s destructuring pattern matches exactly one
of three forms, each decided from source text:

| Form | Test | Members at HEAD `ef4705a` |
|---|---|---|
| **E-1 — policy value** | the default is an identifier resolving to a module-level declaration whose value is **not a function**, or a non-function literal | `_phaseDodEnabled = PHASE_DOD_ENABLED`, `_phasePubEnabled = PHASE_PUB_ENABLED` |
| **E-2 — pass-through** | the destructuring element has **no `=` initialiser at all**; the parameter's default is declared by the callee it is threaded into | `_now`, `_sleep` (defaulted inside `checkPrCi` as `_now = () => Date.now()`, `_sleep = sleep`) |
| **E-3 — agent-composite** | the default is a function **declared in this module** whose own destructured parameter list contains `_agent` | `_rebaseOntoDefault = rebaseOntoDefault`, `_dodVerifyLoop = dodVerifyLoop`, `_raisePrAndVerifyCi = raisePrAndVerifyCi` |

E-3 is the form the previous four-name list omitted, and its omission is why the rule as written in
v1.0 **red on a correct tree**: measured at HEAD, `main()` carries sixteen `_`-prefixed parameters
while `rtDevInjections` returns nine, leaving `_rebaseOntoDefault`, `_dodVerifyLoop` and
`_raisePrAndVerifyCi` satisfied by nothing. After this feature the counts are twenty-one and thirteen
and the same three remain. They are not capability seams: each reaches the outside world only through
`_agent`, which is itself wired, so injecting them would inject a second copy of a capability the
composition root already supplies.

**E-3 is narrow by construction, and that is what defends the *addition* direction.** The declared
`_agent` parameter is the discriminator, and no capability seam has one: `defaultReadFile`,
`defaultWriteFile`, `defaultAppendFile`, `defaultListFiles` and `checkFileNonEmpty` reach `fs`;
`defaultGit`, `mergeWorktree` and `checkPrCi` reach `child_process` through an `execFn`; `agent`,
`parallel`, `pipeline`, `phase` and `log` are host globals with no module declaration at all, so E-3
cannot apply to them; and `defaultRecordHalt` — a deliberate no-op — declares no `_agent` either, so
it stays on the wired side where §7.2 edit 2b has to satisfy it. A future seam cannot be exempted by
adding a name; it can only be exempted by acquiring an `_agent` parameter, which is a change to its
signature that a reviewer sees.

**Two anti-rot clauses, one per direction:**

1. **A parameter classified exempt that is *also* wired is a failure.** It means the predicate has
   drifted into admitting a real seam, and the test says so rather than passing quietly. (Green on
   the tree today: none of the seven exempt names appears in `rtDevInjections` or in either
   entrypoint.) This is the direction-symmetric replacement for "an unused exemption entry is also a
   failure".
2. **Evidence must resolve.** E-1's default identifier must have a module-level declaration and E-3's
   must be a function declared in this file. A parameter whose default identifier no longer resolves
   is a **failure**, never a silent exemption — that is the removal-direction guard the old
   fully-consumed clause supplied, restated for a predicate.

The test reports the derived classification for every parameter, so the failure message names which
parameter fell in neither class rather than only that a count disagreed.

## 9. Traceability

### 9.1 FSPEC obligations → TSPEC sections

`O-10` … `O-15` do not appear: they were retracted during FSPEC review and are absent from the
FSPEC's own obligation map. Their absence here is deliberate, not an omission.

| O-row | Discharged in | Note |
|---|---|---|
| **O-1** | §3.2, §4.2, §6.2 rows 1–2 | `_listFiles` seam + `defaultListFiles` + `rtListFiles`; `ListFailure` as the one shared error contract; `listAllFiles` explicitly not reused (§1.5) |
| **O-2** | §5.2 | `CROSS_REVIEW_RE` with G-1…G-4, role validation against `reviewerRoleSlug`'s `MAP`, closed doc-type catalogue, total reject rule |
| **O-3** | §5.8 | `parseResolvedMarker`, `checkPostmortem`, `extractRecommendation` with 4,000-byte truncation |
| **O-4** | §6.5 | two `_git` invocations, message form, pathspec, dirty-tree and commit-failure branches |
| **O-5** | §3.5 | `_recordHalt`'s three suppliers, row location, `queueRow: "none"` when absent |
| **O-6** | §5.6 | the two prompt kinds; retry-ness derived from disk; the script names the first unwritten section, three definite cases |
| **O-7** | §5.9 | four wrapped classes; the six spec-class heading tables; LEARNINGS' approval-record exclusion |
| **O-8** | §5.5 | one hash-equality test, no history walk at either tier, read-at-comparison-time, rebase invariance |
| **O-9** | §3.1, §5.7 | `forcePhases` on `main()` + `meta.inputs`; `parseForcePhases`; precedence over approval but not over an unresolved POSTMORTEM |
| **O-16** | §7.1, §7.2, §3.9 | every edit anchored by enclosing symbol + distinctive literal; **no bare `file:line` citation appears anywhere in this document** |
| **O-17** | §5.1, §5.3, §4.3 | one grammar family, three carriers; digest mechanism and canonicalisation; trailer grammar and its four reasons |
| **O-19** | §4.8, §5.6, §8.3 | constant **placement** (module-level, unexported, beside `MODEL_DEFAULT`), and the explicit statement that `MAX_AUTHORING_WRITE_BYTES` has **no** oracle; the behavioural oracles (a)–(j) are the AT-35…AT-53 tests of §8.3 |
| **O-20** | §5.6, §6.6 | per-section commit cadence; the commit-diff proxy as advisory-only; no git operation may discard uncommitted content |
| **O-21** | §4.4 | `## 6. Approval Record` placement, six columns, copy-never-recompute, exclusive tier selection, `unavailable` marker |
| **O-18** | §5.4 | absent role file is not approving; single-highest-round candidate; no cross-tier completion |

**Nothing is deferred.** Every O-row the FSPEC left open to TSPEC is answered above. Two are answered
*narrowly* and the narrowing is stated where it lands: O-19's oracle half is discharged as test
obligations (§8.3) rather than as a runtime mechanism, because no runtime mechanism exists to measure
emitted bytes; and O-8 is discharged in its v1.5-narrowed form (one comparison, no walk) rather than
its v1.0 form.

### 9.2 Defect → mechanism → test

| Defect | Mechanism | First falsifying test |
|---|---|---|
| **H-1** | `deriveRoundWindow`'s `max(present) + 1` (§5.2), passed to `reviewLoop` at all seven call sites | AT-01 |
| **H-2** | `checkConverged`'s corrected `postmortemPath`, `_checkFile` confirmation, `_recordHalt`, the two conditional halt shapes (§6.3, §6.4) | AT-22 |
| **H-3** | `dispatchAndVerify`'s terminal-first-then-progress loop, per-episode counters, resume prompt (§5.6) | AT-35 |
| **H-4** | the two-tier approval search + `isStale` (§5.4, §5.5) | AT-08 |

### 9.3 Constraint compliance

| Constraint | Where honoured |
|---|---|
| **C-2** — bundle-legal | six new capabilities, all injected seams (§3.1); no `import`, `process`, `fs`, `fetch`, `crypto`, `TextEncoder` introduced anywhere; digest hand-rolled (§5.3); AT-19 asserts it (§8.5) |
| **C-2** — await discipline | every injected call `await`ed by construction; AT-19's source-level lint is the mechanical guard |
| **C-5** — no agent in a script-decidable loop | the entire decision surface lives in §2.4's pure stratum; `recoverVerdict` explicitly not reused on the approval path (§2.6) |
| **DC-01** — closed and total | four failure catalogues (§4.1); six total parsers (§5); every emit-side string catalogued |
| **DC-02** — measured, not inferred | every claim about existing code verified against the tree at HEAD `af6f335` (v1.0) and re-measured at `ef4705a` (v1.1, §1.4); `stripModuleSyntax`'s and `wrapModule`'s behaviour, `rtDevInjections`'s nine entries, `main()`'s sixteen injections, the dev bundle's composition array and `DEV_META`'s missing `inputs` all read directly. v1.1 adds six measurements rather than inferences, and two of them **overturned** a reviewer's own suggestion or premise: TE F-04's proposed exemption predicate was measured too wide against five real capability seams, and §8.3's "must stay green" was measured false (1038/1/70) | 
| **DC-11** — one error contract per question | `ListFailure` shared across both listing paths; `_git` and `_mergeWorktree` justified as answering different questions (§3.4) |
| **DEC-DIST-01/02** | `dist/` regenerated in the same commit; consumer copy never committed (§7.3) |
| **DEC-ORACLE-01/03** | run-wide assertions written as explicit tests; one canonical double per seam at a named path (§8.1) |

### 9.4 Reused rather than reinvented

Recorded so a reviewer can check the "cite-and-reuse the sibling" obligation mechanically.

| Obligation | Shipped precedent reused | Where |
|---|---|---|
| dependency injection for capabilities | `main()`'s existing sixteen-parameter destructured list | §3.1 |
| verdict parsing and its closed catalogue | `parseVerdict` + `VALID_VERDICTS`, unchanged | §5.1 |
| pass/fail semantics of a verdict | `isPass` | §5.1 |
| role-slug catalogue | `reviewerRoleSlug`'s `MAP` | §5.2 |
| Node-default IO with an injectable module | `checkFileNonEmpty(path, { fsMod = fs })` | §3.2 |
| `child_process` injection for git | `mergeWorktree(…, { execFn })` | §3.4 |
| adapter agent-relay with a JSON contract | `rtMergeWorktree` | §3.2, §3.4 |
| adapter agent-relay with constrained one-word output | `rtCheckFile` | §3.2 |
| skip marker in the phase table | the existing `"⏭"` status | §4.7 |
| seeded property generation for the parameterisable parsers | `__tests__/helpers/driftGenerators.js` — `seeded`, `resolveSeed`, `shrink`; dependency-free `xorshift32`, `PDLC_PROP_SEED` override, already consumed by seven suites | §8.2 |
| bundle staleness and structural guards | `build-runtime.mjs --check`, `runtimeBundle.test.js` | §7.3 |

Explicitly **not** reused, with the reason stated at the point of decision: `listAllFiles` /
`WALK_SKIP_DIRS` (§1.5), `recoverVerdict` (§2.6), `_mergeWorktree` as a general git transport (§3.4).

## 10. Open Questions

### 10.1 FSPEC §20 questions this TSPEC resolves

The FSPEC carried nine open questions and named an owner for each. Those owned by TSPEC are resolved
here; the resolution is stated with its reason so a reviewer can disagree with the reason rather than
guess at it.

| FSPEC Q | Resolution |
|---|---|
| **Q-01** — is `rtListFiles` one `ls -1A`-class Bash call or a `find`-class call scoped to depth 1? | **`ls -1A`-class, single call.** The only directory ever listed is `docs/{feature}` and the contract is explicitly non-recursive (§3.2), so depth-limiting machinery buys nothing. The prompt instructs one command and constrains the reply to a JSON array of basenames or one of the four `reason` values, following `rtCheckFile`'s constrained-output discipline. |
| **Q-02** — is the SHA-256 inlined? | **Yes, written out in `orchestrate-dev.js` as `sha256Hex`** (§3.7, §5.3), roughly 80 lines of pure JS. It is not a seam (§3.7), and it cannot be a dependency (C-2 forbids `import`). §2.2's one-file rule places it beside the other pure functions. |
| **Q-03** — must the digest encode UTF-8 rather than hashing UTF-16 code units? | **Yes, UTF-8**, via `utf8Bytes` (§3.7). Two reasons, and the second is the operative one: UTF-16 code units would make the digest disagree with every external SHA-256 tool an operator might reach for, and — decisively — hashing code units silently mishandles surrogate pairs, so two visually distinct documents can collide. The **falsifier is a fixture, not an argument**: §8.2's surrogate-pair known-answer vector reds any UTF-16 implementation. |
| **Q-04** — does the pacing proxy run per episode or per phase? | **Per phase.** Both are advisory, so the trade is attribution sharpness against `_git` call count. Per-phase wins because the proxy's output is a report line an operator skims, not a signal anything branches on, and because a per-episode proxy multiplies `_git` calls by up to 36 per phase (§4.5) for a measurement that cannot halt anything. |
| **Q-07** — should `forcePhases` be declared in `DEV_META`? | **No.** `DEV_META` is a hand-written literal in `build-runtime.mjs` carrying `name`, `description`, `whenToUse`, `phases` and **no** `inputs` array at all. Adding one creates a second declaration to keep in sync, for a bundle entrypoint that reads `args` directly. The module's `meta.inputs` (§3.1) is the canonical documented surface. |
| **Q-08** — does `_recordHalt` live in `runtime-adapter.js` or in the bundle entrypoints? | **In the entrypoints** (§3.10). Its implementation differs by caller — `QUEUE_ENTRY` closes over the queue's own `rewriteStatus`, `DEV_ENTRY` over `__queue`'s row helpers — and `rtDevInjections` is by construction a caller-*independent* bundle of adapters. Placing a per-caller closure there would require passing the caller in, which is the shape `rtMakeCheckCi(devModule)` already shows to be awkward. |

### 10.2 FSPEC §20 questions carried forward unresolved

Every row below is either **closed here** or **bound to a named successor surface**, per `DC-08`. No
row is owned by prose intent alone. The successor surface for the three carried rows is
**`docs/_queue/QUEUE.md` row 8, `pdlc-authoring-contract`** — a `blocked` row added 2026-07-30 in the
same convention as rows 6 and 7, depending on this feature, whose stated scope is exactly these
items: the six author/review SKILLs declaring machine-readably what they produce.

| FSPEC Q | Owner | Status |
|---|---|---|
| **Q-05** — if a future `harvest-learnings` revision adds a sixth prose section, does the approval record renumber to `## 7`, or is the heading pinned by name? | **QUEUE.md row 8 `pdlc-authoring-contract`** | **Carried, bound.** Not a TSPEC decision, and no product exposure today: §5.9's heading matcher normalises numeric prefixes, so this implementation tolerates either answer. The question is the SKILL's contract, which is row 8's scope. |
| **Q-06** — should the `RESOLVED:` marker also record who resolved it and when? | — (closed) | **Declined, closed — not carried.** Three reasons, the third decisive. (i) It would be a *second* agent-unwritable field in the POSTMORTEM record alongside the resolution boolean, doubling the surface on which an agent can produce a well-formed-but-wrong marker. (ii) **Nothing branches on it**: §5.8 parses the boolean only (C-5 — no agent in a script-decidable loop), and no AT, report field or halt message consumes provenance, so the field would be write-only. (iii) **Git already carries it** — the commit that flipped `RESOLVED:` has both the author and the timestamp, more reliably than a hand-typed field, and `git log -S 'RESOLVED: yes' -- {postmortemPath}` retrieves it. Recording it in the document duplicates version-control metadata as prose. Reopen only if a consumer appears that must branch on *who* resolved a POSTMORTEM. |
| **Q-09** — should the six author/review SKILLs declare the top-level heading template §16.2 measures against? | **QUEUE.md row 8 `pdlc-authoring-contract`** | **Carried, bound, and flagged as a real risk — the acute one of the three.** Today §5.9's per-class heading lists live only in the workflow script, while the templates the authors actually follow live in the SKILLs. The two can drift, and the failure mode is a correct document scored incomplete — **a false halt**, not a cosmetic defect. This TSPEC does not close it because closing it means editing six SKILLs to declare a machine-readable heading contract: a change to the authoring interface, not to this feature's mechanism, and one that would widen this feature's blast radius from the workflow scripts to the prompts that drive every phase. Mitigation until row 8 lands: §8.3's `completeness.test.js` fixtures are taken from the SKILL templates verbatim, so a drift reds the suite rather than a run — the risk is bounded to "detected at test time" as long as that copying discipline holds, which is itself the thing row 8 removes the need for. |

### 10.3 New questions this TSPEC raises

| # | Question | Owner | Disposition |
|---|---|---|---|
| **T-Q-01** | **The skip-eligible phase set omitted `PR` (PROPERTIES).** AC-4.7, FSPEC §10.7 and §11.3 all named the set as `R, F, T, P, D` — five phases — while `PHASE_DISPATCH` in `orchestrate-dev.js` carries **six** document-review phases: `R`, `F`, `T`, `D`, `P` (PLAN) and `PR` (PROPERTIES). AC-4.7's own *functional* criterion — "phases whose convergence is established by a reviewer-pair cross-review artifact for a named document" — is satisfied by `PR`: it has a creator, a reviewer pair, and an optimizer exactly like the other five. FSPEC §16.2 enumerates PROPERTIES among the six spec classes, and §4.3 includes `PROPERTIES` in the doc-type catalogue. So the mechanism supported it and only the phase-set enumeration excluded it. | REQ / pm-author | **Settled — ruled a slip, and corrected at REQ altitude.** Both TSPEC cross-reviews raised it independently (PM F-05, TE T-Q-01) and the product owner ruled it a slip rather than a deliberate exclusion: the decisive evidence is that AC-4.7a's unread-record consequence would have applied to a PROPERTIES approval record no differently from a PLAN one, so the enumeration was inconsistent with the criterion it claimed to enumerate. **REQ v1.6** widens AC-4.7 to `R, F, T, P, D, PR`; **FSPEC v1.6** follows at §10.7, §11.2 (`all` expands from five phases to six) and §11.3's force catalogue. In this document: §5.5's scope, §5.7's `valid` array `["R","F","T","P","D","PR"]`, `parseForcePhases`'s catalogue **and its rejection message**, and AT-29's expected operator text, now `Valid: R, F, T, P, D, PR, all.`. Nothing else changed — the widening is one token in a closed enumeration, and the mechanism was already total over the six phases. |
| **T-Q-02** | **Where does `startIndex` live between the phase gate and `reviewLoop`?** §5.2 derives it in the phase gate; `reviewLoop` needs both it and `endIndex`, and `checkConverged` needs them for its message. Passing them as two more positional arguments through three functions is ugly; a small per-phase record threaded once is cleaner but changes `reviewLoop`'s call signature at seven sites. | implementation (se-implement) | **Left to implementation.** Both shapes satisfy every AT. Stated here only so it is a deliberate choice at implementation time rather than an accident, and so a reviewer does not read the omission as an oversight. |
| **T-Q-03** | **`MAX_AUTHORING_WRITE_BYTES` has no oracle, and §6.6's commit-diff proxy is advisory.** The consequence is that the constant is enforced only by agent compliance. If compliance turns out to be poor in practice, the only stronger control available under C-2 is to make the *pipeline* halt on an oversized commit — which converts a stylistic violation into an outage and would very likely fire on a legitimately large section. | **QUEUE.md row 8 `pdlc-authoring-contract`** | **Accepted as-is, and bound.** Recorded rather than hidden: a constant that looks enforced but is not is worse than one documented as advisory. It is the same class of gap as Q-09 — a contract the workflow script states and the SKILL does not — so it is bound to the same successor row rather than to "post-implementation observation", which is not a surface anyone owns (`DC-08`). Revisit there, with measured non-compliance data. |
| **T-Q-04** | **§5.9's placeholder test is deliberately shallow** — a body consisting solely of a fenced block containing `TBD` scores non-empty. FSPEC v1.5 declined to fix this (SE-v5 F-20 / TE-v5 Q-01) because a fence-aware placeholder test would reintroduce the §16.2 ↔ rule 5 coupling that caused v1.4's false-halt regression. | accepted | **Carried as a known, accepted shallowness**, per the FSPEC's own instruction to carry it to TSPEC. §4.5's counters, not this test, are what bound a badly behaved episode. |
| **T-Q-05** | **Adding `queueModule` to the dev bundle (§7.2 edit 4) grows `orchestrate-dev.bundle.js` by the whole queue module** — roughly 1,150 source lines — for the sake of `_recordHalt`'s row helpers. No size budget for the bundles is documented anywhere in the repo. | — (closed) | **Closed, not carried.** Measured rather than estimated (`DC-02`); the numbers are stated in §7.2. `orchestrate-queue.bundle.js` **already** inlines the whole of `orchestrate-dev` today and stands at 140,096 B / 3,540 lines against `orchestrate-dev.bundle.js`'s 92,525 B / 2,377 lines — so the larger bundle is already ~1.5× the one this edit grows, has been in production since `pdlc-workflow-distribution` landed, and no size problem has been observed at that scale. The queue *source* being inlined is 47,733 B / 1,158 lines. There is no budget to breach and no evidence of a practical ceiling anywhere near here. The duplicate-row-helpers alternative is **declined on the merits, not deferred**: it would put a second copy of the queue's table grammar in `orchestrate-dev.js`, and a divergence between the two copies is a silent wrong-row rewrite — a strictly worse failure than bytes. Reopen only if a measured bundle limit is ever established. |
