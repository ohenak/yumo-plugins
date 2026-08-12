---
feature: pdlc-headless-engine
---

# TSPEC — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** (`docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` v0.10; `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` v1.6) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.8 | 2026-08-11 |

**v1.8 changelog** — revision round 9, addressing `CROSS-REVIEW-test-engineer-TSPEC-v9.md`
(1 High, 2 Medium, 1 Low) and `CROSS-REVIEW-product-manager-TSPEC-v9.md` (0 High, 2 Medium, 1 Low).
Upstream pins unchanged (REQ v0.10, FSPEC v1.6). One erratum is raised against FSPEC this round
(BR-START-1's "no probe of any kind" versus BR-GUARD-6's rung-4a probe), emitted in the dispatch
message, not folded into any document.

- **F-44 (High) / PM F-01 (Medium) — §3.3's site classes 3 and 4 are scoped by argument syntax, and
  indirect dispatch becomes a third outcome.** As written, class 3 selected five sites at HEAD, not
  one (`skill: reviewers[0]`/`[1]` at `orchestrate-dev.js:5909`, `:5910`, `skill: authorSkill`
  `:9288`, `skill: dispatch.creator` `:9528`), and class 4 selected seven more than the census
  counted (`:5573`, `:5579`, `:5585`, `:5876`, `:7124`, `:7463`, `:9244`) — none statically
  resolvable, so the "cannot resolve ⇒ failure" rule made the guard permanently red on correct code,
  the F-40 failure mode one layer down. Classes 3 and 4 now require a string literal or an identifier
  bound to a module-level constant; **indirect dispatch** (parameter, local, or member expression) is
  neither a site nor a failure, because the derivation already governs those values at their source,
  and its count is asserted too. The census re-derives from the class definitions: **7 / 28 / 1 / 12
  = 48 direct plus 11 indirect**, the twelfth direct site being `_agent(ADVISORY_RUNG_SKILL, …)`
  (`:1841`), which obeys the rule and was previously absent from the eleven.
- **F-45 (Medium) — §7.8's EC-START-11 branch asserts rung 5's record positively.** `state !==
  "skipped"` was satisfied by a rung-5 *failure* on a three-valued enum; the fixture is hermetic and
  injected, so it now asserts rung 5's record exists with `state === "pass"` under a green billing
  posture.
- **F-46 (Medium) / PM F-02 (Medium) — §7.8's script anchors corrected and §9.3's incidental note
  deleted.** At HEAD the probe is `guard-harvest-before-delete.sh:16`, the candidate loop `:15-20`
  and the fail-open `:21`; FSPEC's `:14-21` range is **correct** and needs no upstream edit, so the
  §9.3 paragraph alleging an off-by-one there is removed.
- **F-47 (Low) / PM F-03 (Low) — the census says which figures are measured and which are counted
  after the edit**, in §3.3 and in this changelog line, rather than labelling the whole census "at
  HEAD".
- **Q-20, Q-21 answered in §7.8.** Rung 4a's `spawnSync` is named as a local process probe, not the
  billable kind BR-START-1's zero-tokens sentence forbids; and `runProbe`'s `{ran, outcome}` mapping
  from `spawnSync`'s three shapes (`ENOENT`, non-zero `status`, `status === 0`) is fixed here rather
  than left to the plan.

**v1.7 changelog** — revision round 8, addressing `CROSS-REVIEW-test-engineer-TSPEC-v8.md`
(2 High, 1 Medium, 1 Low) and `CROSS-REVIEW-product-manager-TSPEC-v8.md` (0 High, 2 Medium, 1 Low).
Upstream pins unchanged (REQ v0.10, FSPEC v1.6); no upstream text moved this round.

- **F-40 (High) — §3.3's no-bare-literal guard is scoped by *site*, not by string shape.** The shape
  predicate was unwritable: as syntax it selects 54 hyphenated literals in `orchestrate-dev.js` and
  24 in `orchestrate-queue.js` (red on correct code); as membership it is a tautology; as a skill
  directory name it is red on `meta.name` at `orchestrate-dev.js:3316` and `orchestrate-queue.js:45`.
  The decisive case is the reviewer-role map, whose keys and values are syntactically
  indistinguishable on the same three lines (`:6229-6231`). The guard now enumerates four closed
  **site classes**, treats an unresolvable site as a failure rather than a skip, and adds the
  **per-class site census** (then 7 / 28 / 1 / 11 = 47 — classes 2 and 4 measured at HEAD, class 1
  counted after the edit; superseded by v1.8's 48 direct + 11 indirect) so that an extractor
  which silently stops matching turns the guard red instead of green over ∅. DEC-ENG-05 moved with it.
- **F-41 (High) — rung 4a gains an oracle, a seam and a traceability row.** New **§7.8** declares
  `GUARD_INTERPRETERS` and `probeGuardInterpreter({runProbe})` on `lib/startup.mjs` — the probe seam
  neither §7.0/§7.1's bootstrap nor `_runCommand` provides — and specifies both upstream branches:
  EC-START-10 (refusal names each candidate and its outcome plus the remedy, exit `1`, and **zero
  descriptors in §7.0's accumulator**, a positive conjunct rather than an absence assertion) and
  EC-START-11 (present-but-not-runnable `python3`, runnable `python` ⇒ rung 4a passes). The probe
  command is the shipped script's own, verbatim (`guard-harvest-before-delete.sh:15`). §8.2 gains the
  **C-11 row**, §8.1 names the two constraint-borne obligations that have no AC row, and §6.4 and
  §8.3's `lib/startup.mjs` row now distinguish EC-GUARD-4 from rung 4a.
- **F-42 (Medium) — the derivation test gains a transcription conjunct, reconciling §3.3 with §7.4.**
  Deleting a `PHASE_DISPATCH` role field previously shrank both sides of the recomputation and stayed
  green; the ten identifiers are now transcribed test-side, as §7.4 does for M-ENG-07, with the
  reason the two are the same object stated: BR-START-4 forbids a *production-side* declaration, not
  a test-side assertion of what production must derive.
- **PM F-02 (Medium) — §5.3's top-level catch is marked as designed, not observed.** HEAD's
  `pdlc/engine/lib/run.mjs` contains no `catch` clause at all (only `withCwd`'s `try/finally` at
  `:159`); the catch in `runDev` (`:187`) / `runQueue` (`:228`) is part of this feature's edit, now
  said so in §5.3, §7.4 row 4, §8.1's AC-4.4 row and §8.3's `run.mjs` row.
- **PM F-01 (Medium) — §9.2 swept onto the one-platform matrix.** O-ENG-T1, O-ENG-T4 and O-ENG-T5 no
  longer reason from a two-platform matrix that §7.6 had already corrected (`pr-tests.yml:40`).
- **F-43 / PM F-03 (Low)** — §5.3 now cites `orchestrate-dev.js:1847` and `:1857` (where the
  `{kind: "dispatch-error"}` value is constructed and returned) alongside `:3143-3149` (where the
  caller reads it), matching §7.4 row 4.
- **Q-18, Q-19 answered in the design.** `_assert-suite-wide.mjs` gains a sixth conjunct making the
  corpus scoping falsifiable (distinct non-null `corpusRun` values set-equal to the five named
  configurations, §7.5); §6.5 states that the M-ENG-09 gate asserts presence **and** consistency
  between the recorded `denyFired` value and the shipped mechanism, so it is never green on a
  negative measurement the code has not responded to.

**v1.6 changelog** — revision round 6, addressing `CROSS-REVIEW-product-manager-TSPEC-v6.md`
(0 High, 1 Medium, 1 Low) and `CROSS-REVIEW-test-engineer-TSPEC-v6.md` (0 High, 2 Medium, 1 Low),
and folding in the two findings the v7 reviews carried forward unchanged. Both reviewers' leading
finding is the same and the FSPEC erratum this round settled it: **v1.5's "composed but never
executed → both terminal fields `null`" branch has no producer**, and FSPEC v1.5's BR-MODEL-3 now
says so upstream ("the dry-run surface is **not** a way to reach it … never the corpus's source",
`FSPEC:680-684`). Repaired in the direction upstream took — the branch and its four restatements are
**deleted** and replaced by the stronger rule, **every recorded line is a settlement line** (§4.1,
§7.0, §7.4 row 4 and corpus preamble, §8.3), grounded in the seam rather than asserted: the
accumulator hangs off `_agent` (`adapter.mjs:271`) and never off `composePrompt` (`:259`), and
`emitDryRun` calls `composePrompt` directly (`bin/pdlc.mjs:190`), so the dry-run surface records
nothing. Row 4 gains the two clauses its fixture author needs: the **injection point** — run iv
injects at `queryFn` per §7.1's construction rule, and the injected rejection must both map to
`TransportError` (`transport.mjs:123`, for the pinned `outcome`) and satisfy `MODEL_ERROR_RE`
(`orchestrate-dev.js:1780-1781`, for `B` to exist at all) (PM F-02, TE F-38) — and the **escape
scoping** that reconciles the pinned member with §5.3's engine-fatal rule: the classification applies
to a rejection that reaches `runDev`/`runQueue`'s top-level catch, and `resolveAdvisoryRung` handles
its own (`orchestrate-dev.js:1856`→`:1861`, `:3143`), so run iv continues rather than exiting `1`
(TE F-37; stated in §5.3 too, so it is findable from both sides). The five stale `FSPEC:{line}`
citations the erratum's change notes shifted are re-anchored against FSPEC v1.5, plus one stale
`REQ:` line (PM F-02, TE F-39). Questions answered in the design: `corpusRun != null` is
**essential, not defensive**, because `_bootstrap.mjs` is `--import`ed into every test-file process
(TE Q-15/Q-16); the two live tests do inherit §7.0's writer, and what keeps §7.5's claim honest is
that their records carry `corpusRun === null` (PM Q-02, TE Q-16); and the dry-run surface's complete
oracle set is now stated — §5.4's exit-`0` row and §7.1's prompt-composition assertions, nothing
else (TE Q-17).

**v1.5 changelog** — revision round 5, addressing `CROSS-REVIEW-product-manager-TSPEC-v5.md`
(1 High, 1 Medium, 1 Low) and `CROSS-REVIEW-test-engineer-TSPEC-v5.md` (0 High, 3 Medium, 3 Low).
Both reviewers' leading finding is the same one and it is the last hop of v1.4's fix: **v1.4 stamped
the terminal half on the descriptor but left the record's write timing at composition**, and §7.0's
accumulator is append-only, so row 4's `outcome`/`errorText` conjuncts were unsatisfiable — red on
correct code (PM F-01, TE F-30). Fixed by pinning the timing in the design: **one line per dispatch
*attempt*, appended when the attempt settles**, carrying that attempt's `outcome`/`errorText`; a
dispatch composed but never executed (the inert transport behind `--dry-run`) is appended at
composition with both fields `null` — *superseded in v1.6: that branch has no producer and the
clause is deleted.* Row 4's `F` is a settlement line, and FSPEC BR-MODEL-3's
composed-not-billed guarantee is restated with the timing attached (§4.1, §7.0, §7.4). Mediums:
row 4 pins the **exact** outcome member `transport-contract-violation` — derived from §5.1 via
`classifyThrown`'s unrecognised arm (`transport.mjs:123`) — instead of the complement of `ok`
(TE F-32); the fifth suite-wide row names `corpusRun != null` as the filter that scopes it to
run-shaped tests (PM F-02); and the two `createAdapter` sites are re-attributed — `bin/pdlc.mjs:173`
is `emitDryRun`'s inert surface, `:205` is `liveAdapter`'s run path, and **`doctor` constructs no
adapter at all** (`cmdDoctor:157`), so it is not a tunable resolution point (TE F-31, §3.4/§4.6/§8.3).
Lows: the fifth row's predicate is stated over records (`phase === null`) with `byPhase["(no phase)"]`
kept as the reader-facing gloss (PM F-03, TE F-35); §7.4's lead sentence says **three** accumulators
rather than four (TE F-33); and run i's "zero `haiku`" assertion gains its second site — reviewer
fixtures emit well-formed `VERDICT:` trailers so `recoverVerdict` (`orchestrate-dev.js:7454`→`:7463`)
never fires (TE F-34). Questions answered in place: `promptHash` is over the **composed** prompt
(`adapter.mjs:273`) and each retry attempt gets its own line, with no count asserted (TE Q-13/Q-14,
PM Q-02); §7.5's live path writes no observation records, so `errorText` never leaves memory outside
the hermetic suite (PM Q-01).

**v1.4 changelog** — revision round 4, addressing `CROSS-REVIEW-product-manager-TSPEC-v4.md`
(2 High, 0 Medium, 1 Low) and `CROSS-REVIEW-test-engineer-TSPEC-v4.md` (1 High, 1 Medium, 2 Low).
Both reviewers' Highs are the same finding, and it is one v1.3 introduced: **§7.4 row 4's replacement
discriminator was not computable from any recorded field**, so the advisory-fallback witness reduced
to "some `se-review` dispatch ran on Opus" — true of every pipeline run, green even with the
`:1851`→`:1861` fallback branch deleted (PM F-01, TE F-26). Fixed where they asked, in the data:
§4.1's `DispatchDescriptor` gains **`outcome`** (§4.2's member, stamped when the dispatch settles)
and **`errorText`** (the rejection's message, verbatim, never parsed by the engine); §7.4's
accumulator tuple gains those plus `attempt` and a `promptHash`; and row 4 becomes a **pair over
recorded fields** — same skill, same `promptHash` (the fallback re-dispatches the same prompt,
`dispatchAt` closing over one `prompt`, `orchestrate-dev.js:1840-1842`), `fable` with a non-`ok`
outcome and the fixture's injected message, then `opus` at a greater `seq`. No seam identity is
stamped and no workflow module is touched, so §8.3's boundary holds. **PM F-02 / TE F-27**: §4.6's
effective-timeout oracle was green on the default, because `DEFAULT_TIMEOUT_MS` (`transport.mjs:64`)
equals the tunable's own default; run i's fixture now pins `dispatch.timeoutMinutes: 7` and the test
asserts the literal `420000` at the boundary and `7` in the report. Lows: §7.4 transcribes
`orchestrate-dev.js:9995` verbatim including `iContract !== null` (PM F-03, TE F-28), and the
`"(no phase)"` assertion becomes a fifth **row** of §7.4's property table so the table and
`_assert-suite-wide.mjs` enumerate the same five things (TE F-29). Questions answered in the design:
the adapter receives the resolved timeout as a `dispatchTimeoutMs` constructor option alongside
`maxRateLimitPauses`/`retryBackoffBaseMs`, supplied at `bin/pdlc.mjs:173`/`:205` where
`resolveTunables` is called (TE Q-11); run i's `testCommand` is a local exit-`0` script inside §7.1's
hermeticity guard (PM Q-01); and rows 1/2 stay scoped to run i because the `haiku` PLAN-DAG dispatch
(`:9968`) records `phase === "Phase I"` and would falsify row 2 in run v(b) (TE Q-12).

**v1.3 changelog** — revision round 3, addressing `CROSS-REVIEW-test-engineer-TSPEC-v3.md`
(1 High, 1 Medium, 2 Low) and `CROSS-REVIEW-product-manager-TSPEC-v3.md` (0 High, 1 Medium, 2 Low).
**The High (TE F-22) is a translation defect of the class §7.4 exists to catch, in §7.4 itself:**
rows 1/2 quantified over the normalised phase, and Phase I's V-wave is announced as `"Phase PT"`
(`orchestrate-dev.js:10248`) while pinned on `sonnet` (`:10253`), so row 1's *every* was red on
correct code. Rows 1/2 now partition on a defined **Phase-I wave set** (normalised `"Phase I"` plus
the V-wave descriptor), §4.1's normalisation is left honest rather than bent to hide it, and **run i
is pinned to wave mode** — fixture PLAN with a valid ownership manifest plus
`implementation.testCommand` (`:9995`) — with the mode asserted rather than assumed. **The Medium
(PM F-01)** settles `timeoutMs`: it is engine-stamped on every dispatch from `resolveTunables`'
`dispatch.timeoutMinutes`, §3.4's presence half becomes `cwd` **and** `timeoutMs`, `maxTurns` is the
one declared-but-unreachable key, and §4.6 gains the effective-value oracle that makes BR-CLI-3's
reported tunable honest (§3.4, §4.1, §4.6, §8.3). **TE F-23**: row 4 drops the run-wide `seq`
adjacency conjunct — a flakiness source — keeping the fixture's forced model-resolution failure as
the discriminator, and names the `fable` dispatch as the error's source. Lows: §4.1's `label:`
enumeration gains `:9574` (`routeErrata`'s options object, TE F-24); §3.3's skill-constant site lists
re-measured, moving `:10448` from `SKILL_SE_IMPLEMENT` to `SKILL_HARVEST` (TE F-25, PM F-03); §4.4
states that `byPhase` is run-scoped and merges across `--loop` passes by design (PM F-02). Questions
answered in the design: the `"(no phase)"` bucket is an asserted member of §7.4's suite-wide set
rather than a reported number (PM Q-01, TE Q-10); §3.4's presence half is key-presence with the `cwd`
*value* owned by AC-2.5's test (TE Q-09); rows 3/4's advisory predicates are existential because the
seam memoises its resolved model (`:1844`), so quantifying them would be red on correct code (PM Q-02).

**v1.2 changelog** — revision round 2, addressing `CROSS-REVIEW-product-manager-TSPEC-v2.md`
(2 High, 1 Medium, 1 Low) and `CROSS-REVIEW-test-engineer-TSPEC-v2.md` (2 High, 2 Medium, 1 Low).
Both Highs from each reviewer reduce to two root causes, and both are now fixed at the source rather
than in the assertions that consumed them. **(1) `opts.label` is `null` at every dispatch site** —
measured, not assumed — so the phase is taken from the `_phase` seam held as adapter run state and
stamped on each descriptor (§4.1), which makes `dispatches.byPhase`, `RetryRow`, `PauseRow` and
`authSources` carry a real phase (§4.4, §4.5) while keeping §8.3's "no other file under
`pdlc/workflows/` is modified" true. **(2) The suite's run id was minted per child process**, so no
two test files shared an observation directory; it is now minted once by a runner before any child
exists, with a self-test asserting both files' records land in one directory (§7.0). §7.4's model-map
oracle is restated as AC-3.3's own two directions with a literal per-row witness table, since
M-ENG-07 row 1 is quantified and rows 1/4 and 6/7 are not separable by `(phase, model)` pairs. Also:
`stopReason` made total over the loop's actual exits and `maxIterations` converted to `null` where
the block is built (§4.5); the transport boundary restated as containment plus `cwd` presence rather
than instance set-equality (§3.4); a closed exemption allow-list for the no-bare-literal test (§3.3);
rung 4's narrowing recorded as a decision (§3.3); new open question O-ENG-T5 (§9.2).

**v1.1 changelog** — revision round 1, addressing `CROSS-REVIEW-product-manager-TSPEC-v1.md`
(4 High, 2 Medium, 1 Low) and `CROSS-REVIEW-test-engineer-TSPEC-v1.md` (7 High, 7 Medium, 2 Low).
Substantive changes: transport selection removed in favour of FSPEC §3.2's no-selector decision
(§3.4, §4.5); the suite's accumulate-then-assert mechanism replaced with a cross-process one
(§7.4, and its consumers §3.5, §5.1); the skill-set derivation oracle changed from a source scan to
a data read (§3.3); the queue's dispatchable set corrected and rung 4's scope stated (§3.3);
`agent-reported-failure` given a literal predicate and an owning layer (§5.1); the guard-parity
oracle given an execution mechanism and falsifying counterparts (§6.3); AC-1.2's filesystem
observation designed (new §7.7); the `engine` block enumerated against FSPEC §12.2 and given a
loop-termination sub-block (§4.5); tunables collected into one resolver table (new §4.6).

## 1. Overview

### 1.1 What this document decides

FSPEC fixes *observable* behaviour: the ladder's rungs, the auth first-match list, the six-member
outcome taxonomy, the retry table, the report's fields. This TSPEC fixes the **code that produces
them**: which module owns which behaviour, the exact seam signatures each workflow module declares,
the types crossing each boundary, and the mechanism for the two obligations FSPEC deliberately left
open at the mechanism level (guard parity, §6; the per-transport fallback, §3.4).

It is not a greenfield design. A partial engine is committed under `pdlc/engine/`
(`bin/pdlc.mjs`, seven `lib/*.mjs`, nine `__tests__/*.test.js`), and `docs/_constraints/pdlc-engine-baseline.md`
**M-ENG-06** is the authority on which acceptance criterion is red, green or partially green at HEAD.
Every section below therefore states, per component, whether it is **extended**, **replaced**, or
**new** — the three demand different work, and a plan that treats them alike mis-schedules.

### 1.2 Design premises inherited, not re-decided

| Premise | Source | Consequence here |
|---|---|---|
| The modules run in plain Node; only `agent()` is missing | M-ENG-01 | The engine supplies seams, not a runtime (§3.1) |
| SDK primary, `claude -p` declared fallback, one `_agent` seam | REQ §1.3, M-ENG-04/05 | One transport interface, two implementations (§3.4) |
| Skill prompts come from the installed plugin, inlined | G-5, A-ENG-01 | No Skill tool in a composed prompt (§3.3) |
| The modules are imported, never forked | C-4, AC-1.5 | Two anti-fork observables (§2.4) |
| Nothing engine-owned is written into the consumer repo | NG-7, BR-REP-0 | The report is one JSON line on stdout (§4.5) |

### 1.3 The four structural changes this design makes to HEAD

Everything else is additive. These four replace shipped behaviour and are where review attention
belongs:

1. **Auth becomes two components, not one banner row.** HEAD has no auth check at all —
   `startup.mjs` renders an `apiKeyPolicy` banner row (`pdlc/engine/lib/startup.mjs:49`, `:64`,
   `handshake.mjs:183` `buildBanner`) from the CLI flag alone, and never inspects the environment or
   the login record. §3.2 adds `lib/auth.mjs` (startup posture, C-1a) and §5.2 keeps the per-dispatch
   assertion where it already is (`transport.mjs:201-206`), but records it **per dispatch** rather
   than as one scalar (`adapter.mjs:320`'s `lastApiKeySource`, surfaced once at `report.mjs:51`).
2. **The skill set becomes derived, not declared.** HEAD probes a frozen 17-name list
   (`startup.mjs:20` `EXPECTED_SKILLS`) for readability — containment in one direction, over a set
   that over-declares the dispatchable one. §3.3 derives the identifier set from the modules
   themselves and checks set-equality in both directions over that scope (AC-3.5, FSPEC §4.4).
3. **Outcome classification becomes an enumerated total function.** HEAD throws four error classes
   (`transport.mjs:23`, `:33`, `:46`, `:55`) and has no `transport-contract-violation` or
   `agent-reported-failure` member at all; the six-member closed catalogue and its set-equality
   observable are §5.1's.
4. **Every operator-visible string becomes a catalogue entry.** HEAD builds strings inline
   (`handshake.mjs:124` `REMEDY`, `startup.mjs:139`, `bin/pdlc.mjs:36` `USAGE`). §3.5 introduces one
   emission seam so the suite can accumulate emitted ids and compare them to the registered set
   (AC-6.4(a), BR-MSG-1).

### 1.4 Ownership boundary — one sentence

**The engine owns hosting; the modules own the pipeline.** No file under `pdlc/engine/` decides a
phase outcome, a queue row, a review verdict or a halt; no file under `pdlc/workflows/` learns that
it is being hosted. The two changes this design makes to `pdlc/workflows/` (§3.3's
`DISPATCHABLE_SKILLS` export, §3.6's nothing-else) are declarations *about* the modules, not
behaviour changes inside them, and each is a tested change in this repo — never a fork (C-4).

## 2. Architecture

### 2.1 Module map

Layering is strict downward: a module may import only from layers below it. `lib/startup.mjs`'s
existing rule — it imports **nothing** from `pdlc/workflows/` — is preserved and widened into the
table's "may import workflows" column, because it is what makes "fail closed before any module
evaluation" (C-10, FSPEC §4.2) a structural property rather than a call-order convention.

| Layer | File | State | Responsibility | May import workflows |
|---|---|---|---|---|
| 5 CLI | `bin/pdlc.mjs` | extended | argv → command; usage errors; exit codes; report emission | no (only via layer 4) |
| 4 run wiring | `lib/run.mjs` | extended | seam injection per module; `cwd` pinning; dynamic module import | **yes, and only here** |
| 3 startup | `lib/startup.mjs` | extended | the six-rung ladder, total, reporting every rung | no (rung 4 delegates, §3.3) |
| 3 startup | `lib/auth.mjs` | **new** | C-1a startup posture, first-match over env + login record | no |
| 3 startup | `lib/handshake.mjs` | extended | version parse/compare/range, C-10 decision, banner rows | no |
| 3 startup | `lib/skills.mjs` | extended | plugin-root resolution, identifier→path, prompt composition | no |
| 2 dispatch | `lib/adapter.mjs` | extended | the `_agent` seam: compose → dispatch → classify → retry → record | no |
| 1 transport | `lib/transport.mjs` | extended | SDK invocation, message-stream parse, C-1b assertion | no |
| 1 transport | `lib/transport-cli.mjs` | **new** | `claude -p` invocation and output parse (§3.4) | no |
| 0 shared | `lib/outcome.mjs` | **new** | the six-member taxonomy and its total classifier (§5.1) | no |
| 0 shared | `lib/catalogue.mjs` | **new** | registered message ids, one emission seam (§3.5) | no |
| 0 shared | `lib/report.mjs` | extended | pure `engine` block build + stamp | no |

Two rules fall out of the table and are asserted, not merely stated:

- **R-ARCH-1 — only `lib/run.mjs` may reference `pdlc/workflows/`.** Any other engine file naming a
  workflow path is a layering violation and fails the suite (§7.4). This is what keeps rung 3's
  refusal genuinely pre-import.
- **R-ARCH-2 — layers 0–1 hold no policy.** The taxonomy, the catalogue and the transports know
  nothing about phases, skills or the queue; everything pipeline-shaped lives at layer 2 and above.

### 2.2 Control flow of one run

```
argv ──► parseInvocation (bin)              usage error ──► stderr, exit 1, no report line (BR-REP-0a)
          │
          ▼
       runLadder (startup)  rung 0..5, total, every rung reported
          │  fail ──► catalogue refusal ──► report line (one JSON, stdout) ──► exit 1
          ▼
       banner (version pair, base URL, auth id)
          │
          ▼
       run.mjs: dynamic import of the workflow module(s), chdir to consumer root
          │
          ▼
       module main({...seams})
          │   every dispatch ──► adapter._agent
          │                        compose (skills)  ──► transport.dispatch
          │                        classify (outcome) ──► retry ladder ──► record
          ▼
       module report ──► stampReport(+engine block) ──► one JSON line ──► exit 0 | 2
```

The only two places the engine can end a run of its own accord are the ladder (exit `1`, zero
tokens) and an engine-fatal classification (`auth-failure`, `transport-contract-violation`; exit `1`,
no POSTMORTEM, queue row untouched — BR-FAIL-3). Every other ending is the module's (`0`/`2`).

### 2.3 Process model

One pipeline per process. `lib/run.mjs` `withCwd` (`pdlc/engine/lib/run.mjs:155`) `process.chdir`s
into the consumer root for the duration and restores in a `finally`, because the modules address the
filesystem consumer-relative and never call `process.cwd()` themselves — they hand bare relative
paths to `fs` (M-ENG-01: `defaultReadFile` at `orchestrate-dev.js:8492`) and shell `git` with no cwd
option. This is process-global state, and it is why the engine dispatches no run concurrently with
another in the same process. `dispatchOpts.cwd` is *also* set per dispatch
(`adapter.mjs:278`) so the transport pins the agent's own working directory (AC-2.5, BR-CWD-1)
independently of the process cwd.

**Two engine runs against one consumer repo are out of scope** (EC-RUN-4): no lock is designed here.
The gap is recorded, not closed.

### 2.4 Anti-fork, structurally

`WORKFLOW_MODULE_URLS` (`pdlc/engine/lib/run.mjs:52`) resolves both modules by relative URL from the
engine source inside this repo checkout, and `workflowModulePath()` (`:58`) exposes the absolute path
as the AC-1.5 observable. Two assertions make "not a fork" decidable with no reference copy:

| Observable | Assertion | HEAD state |
|---|---|---|
| resolved specifier | equals the repo-relative path `pdlc/workflows/orchestrate-{dev,queue}.js` | weaker at HEAD — `__tests__/run.test.js:64` asserts a `file:` URL only (M-ENG-06) |
| tree contents | no second file named `orchestrate-dev.js` / `orchestrate-queue.js` anywhere under `pdlc/engine/` | green (`__tests__/run.test.js:48`) |

Tightening the first to a path assertion is in scope (AC-1.5(a)).

### 2.5 What the engine does *not* build

`runtime-adapter.js`'s IO surface is not ported (M-ENG-03): `_readFile`, `_writeFile`, `_appendFile`,
`_listFiles`, `_checkFile`, `_hashFile`, `_ghRun`, `_checkCi`, `_mergeWorktree`, `_recordQueueRow`,
`_rebaseOntoDefault`, the advisory seams and the probe seams all keep the modules' own Node defaults,
so an engine run exercises exactly the code paths the module test-suite already covers. Overriding a
seam whose default works is a defect here, with one deliberate exception (`_git`, §3.1).

## 3. Interfaces

Every signature below is transcribed from the declaration cited beside it. Where the engine and the
module disagree about a default, the module wins: the engine passes seams, never expectations.

### 3.1 The per-module seam contract (G-2, BR-PARITY-2)

`orchestrate-dev.js`'s `main()` declares 30+ injection parameters (`pdlc/workflows/orchestrate-dev.js:8916`);
`orchestrate-queue.js`'s declares 12 (`orchestrate-queue.js:1033`). **The engine supplies only the
seams whose module default does not work in plain Node, plus `_git`.** The complete contract, per
module — this table is the exhaustive answer REQ G-2 defers to TSPEC:

| Seam | Module default | dev | queue | Why supplied / left alone |
|---|---|---|---|---|
| `_agent(skill, prompt, opts)` | `agent()` **throws** (`orchestrate-dev.js:8458-8460`) | ✅ | ✅ | The one capability the runtime provided (M-ENG-01) |
| `_parallel(promises)` | `Promise.all` (`:8464`) — works | ✅ | — *(not declared)* | Supplied for log symmetry; behaviour identical |
| `_pipeline(label, fn)` | `fn()` (`:8469`) — works | ✅ | — *(not declared)* | Adds the section log line only |
| `_phase(label)` | no-op (`:8474`) | ✅ | ✅ | Progress output |
| `_log(message)` | `console.log` | ✅ | ✅ | Routed through the engine's log sink |
| `_runCommand` | `NO_RUN_COMMAND` = `null` | ✅ | — *(not declared)* | **Load-bearing:** a null seam silently degrades Phase I's script-owned wave gate to the legacy self-report path |
| `_git(argv)` | `defaultGit` (`:8609`) — works | ✅ | ✅ | **The one deliberate exception** (below) |
| `_runPipeline(args)` | `realMain` (`orchestrate-queue.js:1041`) | — | ✅ | **Necessity:** the queue calls it at `:1422` with `{reqPath}` and *no seams*, so the delegated dev pipeline would reach the throwing stub |
| every other IO / advisory / probe seam | working Node default | ✗ | ✗ | §2.5 — overriding is a defect |
| `_sessionAgent` | declared without a default; `sessionBoundAgent` defaults it to `NO_SESSION_AGENT` (`orchestrate-dev.js:5567`) | ✗ | ✗ | Fresh-per-dispatch is today's semantics (R-4, O-6). The seam must stay unpainted, not be wired |

**Why `_git` is supplied although its default works.** `branchGuardTransport`
(`orchestrate-dev.js:3487`) returns a transport only when `_git` is a function *and*
`_git !== defaultGit`: the guard refuses to mutate a checkout through a seam nobody explicitly chose.
Leaving the default in place makes the branch guard announce itself inert and skip, and the pipeline
then commits onto whatever branch the tree happens to be on — the precise failure the guard exists
to prevent. **Distinct function identity is the contract**, so `createGit()` (`adapter.mjs:116`) must
never be memoised into the module's own default and a test asserts the inequality.

`devInjection(adapter)` (`run.mjs:80`) and `queueInjection(adapter, runPipeline)` (`:114`) are the two
functions that build these objects; they forward the declared seams and nothing else (`composePrompt`
and the getters are deliberately not forwarded, so the injection object reads against the module's
parameter list).

**Fall-through is fatal, never silent** (EC-PAR-5): if a dispatch path reaches the modules' throwing
stub, the thrown `agent() not available outside Claude Code runtime` propagates as an engine failure
naming the seam — it is never caught and turned into a skipped phase.

### 3.2 `lib/auth.mjs` — the startup posture (new, C-1a)

```js
// Total: never throws for an environment problem; every input maps to a row.
export function readLoginEvidence({ home, fs, env }): {
  readable: boolean,          // ~/.claude.json parsed
  loggedIn: boolean,          // it carries an `oauthAccount` object (M-ENG-08)
  path: string,               // the file inspected, named in refusals
  reason: string|null,        // "absent" | "unreadable: {code}" | "no oauthAccount"
}

export const AUTH_ROWS = Object.freeze([...]);   // the six, in first-match order
export function resolveAuthPosture({ env, evidence, allowApiKeyBilling }): {
  row: 1|2|3|4|5|6,
  catalogueId: "auth.oauth-token" | "auth.session" | "auth.api-key-optin"
             | "auth.session-key-ignored" | "auth.api-key-refused" | "auth.unknown",
  refuses: boolean,           // true only for row 5
  evidencePath: string,       // echoed into the refusal (BR-AUTH-0)
}
```

Three properties are structural, not stylistic:

- **First match, evaluated in order, row 6 total** (BR-AUTH-1). The rows are an ordered array and the
  resolver returns on the first predicate that holds; the sixth predicate is `true`.
- **`ANTHROPIC_API_KEY` set to the empty string counts as absent** (EC-AUTH-1) — an empty key cannot
  bill. The predicate is `typeof v === "string" && v.trim() !== ""`, in one helper, used by every row.
- **Unreadable evidence is distinguished from absent evidence in the *message*, never in the row**
  (EC-AUTH-2): both leave `loggedIn: false`, so rows 2 and 4 cannot match and the list falls through
  to 5 or 6 by the key's presence alone — exactly M-ENG-08's per-platform correction.

`resolveAuthPosture` is pure over injected `env`/`evidence`, so every row is fixturable by pointing
`HOME` at a scratch directory with or without the record (BR-AUTH-0) and no operator credential is
involved in any test, including row 5.

### 3.3 Skill resolution and the derived dispatchable set (AC-3.5, BR-START-4)

**The identifier set is derived from the modules, not declared beside them.** A hand-typed array
beside the dispatch sites is exactly the declaration BR-START-4 forbids, and a *source scanner*
tying that array to the modules does not repair it. Measured at HEAD across both modules, a scanner
honouring "string literal in first argument position of a dispatch call" derives **five** of the ten
identifiers — `{ship-pr, dod-verify, se-implement, se-author, harvest-learnings}` — from these sites:
`ship-pr` (`orchestrate-dev.js:8008`, `:8112`), `dod-verify` (`:8035`, a multi-line call form),
`se-implement` (`:8064`, `:10028`, `:10068`, `:10142`, `:10251`), `se-author` (`:9964` and
`orchestrate-queue.js:1216`), `harvest-learnings` (`:10542`). The other **five** (`pm-author`,
`pm-review`, `se-review`, `te-author`, `te-review`) never appear as a literal at any dispatch site in
either module: they are reached through `PHASE_DISPATCH`'s role fields (`:3337` the export,
`:3344`–`:3435` the rows) or, for `se-review`, through a module-local constant (`ADVISORY_RUNG_SKILL`
`:1797`, dispatched at `:1841`). `harvest-learnings` also appears as a `skill:` object field
(`:10448`), which is not a call site at all. So the scanner is short by half, and the sites it does
find include two multi-line call forms a single-line grep misses — set-equality fails, and the only
available repair is loosening the oracle, which is how the property goes quietly vacuous.

**So the export is computed, not typed, and the oracle reads data rather than parsing source.** The
change to each module is one derivation plus the promotion of the remaining bare literals to named
constants, so that every dispatched identifier is reachable as a module-level value:

```js
// pdlc/workflows/orchestrate-dev.js — PHASE_DISPATCH is already exported (:3337)
export const ADVISORY_RUNG_SKILL = "se-review";           // was module-local (:1797)
export const SKILL_SHIP_PR = "ship-pr";                   // :8008, :8112
export const SKILL_SE_IMPLEMENT = "se-implement";         // :8064, :10028, :10068, :10142, :10251
export const SKILL_DOD_VERIFY = "dod-verify";             // :8035
export const SKILL_HARVEST = "harvest-learnings";         // :10448 (Phase H), :10542 (advisory distil)
export const SKILL_SE_AUTHOR = "se-author";               // :9964

const PHASE_ROLE_KEYS = ["creator", "optimizer", "verifier", "remediator", "reviewers"];
export const DISPATCHABLE_SKILLS = Object.freeze([...new Set([
  ...Object.values(PHASE_DISPATCH).flatMap((p) =>
    PHASE_ROLE_KEYS.flatMap((k) => (p[k] == null ? [] : [].concat(p[k])))),
  ADVISORY_RUNG_SKILL, SKILL_SHIP_PR, SKILL_SE_IMPLEMENT,
  SKILL_DOD_VERIFY, SKILL_HARVEST, SKILL_SE_AUTHOR,
])].sort());

// pdlc/workflows/orchestrate-queue.js — imports from orchestrate-dev.js already (:41)
export const SKILL_TRIAGE = "se-author";                  // Phase-0 readiness triage (:1216)
export const DISPATCHABLE_SKILLS = Object.freeze(
  [SKILL_TRIAGE, ADVISORY_RUNG_SKILL].sort());            // advisory reached via :1252 → :1258
```

**Each constant's comment lists *every* dispatch site of that literal at HEAD**, re-measured for this
revision by scanning both modules for the quoted identifier (TE F-25, PM F-03). The v1.1 lists put
`:10448` on `SKILL_SE_IMPLEMENT` and left it off `SKILL_HARVEST`; the site is
`skill: "harvest-learnings"` inside Phase H's `wrappedDispatch` (`orchestrate-dev.js:10448`), and
`:10542` is the advisory-distil call. The lists are load-bearing rather than decorative: §8.3's edit
surface is "bare skill literals replaced by these constants **at their dispatch sites**", so a site
missing from a comment is a literal that survives the edit and turns §3.3's own no-bare-literal test
red.

Two corrections to v1.0 are folded in here, both grounded at HEAD. The queue's set is **not**
`["se-author"] // A2 re-grounding`: `se-author` is the queue's **Phase-0 readiness triage** dispatch
(`orchestrate-queue.js:1216`), and the queue reaches a *second* identifier the v1.0 array omitted —
`runAdvisorySeamFn` is called at `:1252` with `_agent: rawAgentFn` (`:1258`), and `runAdvisorySeam`
(`orchestrate-dev.js:2943`) dispatches under `ADVISORY_RUNG_SKILL` (`:1841`). A source scan could
never have caught that omission either, because the `"se-review"` literal lives in the *dev*
module's source, so declaration and scanner would have agreed with each other and both disagreed
with the run.

The tie is then two **workflows-side tests** (not production code), and neither parses source:

| Test | Assertion | What it catches |
|---|---|---|
| derivation | two conjuncts: (i) `DISPATCHABLE_SKILLS` ≡ the union recomputed in the test from `PHASE_DISPATCH` + the named constants, read as imported data; (ii) `DISPATCHABLE_SKILLS` ≡ the **ten identifiers transcribed test-side** (below) | (i) alone is impossible by construction — a regression guard on the derivation itself. (ii) is what makes deletion visible: remove a `PHASE_DISPATCH` role field and (i) shrinks on both sides and stays green, while (ii) turns red |
| no-bare-literal | every **skill-naming site** in either module (the four site classes below, enumerated structurally, never by string shape) resolves to a **member** of the exported union — containment per DEC-ENG-05 — conjoined with the per-class site census | a *new* dispatch site naming an identifier the exports do not carry, which is the only way an identifier can escape the derivation; and an extractor that silently stops matching, which containment alone would score green |

**The no-bare-literal guard is containment, not absence, and this supersedes the allow-list framing
an earlier draft of this section carried** (DEC-ENG-05). An absence test — "no literal equal to a
union member appears outside the constant declarations, with a closed allow-list of exempt sites" —
cannot be written against HEAD: bare literals sit at dispatch sites in eleven places across the two
modules (enumerated above), so the allow-list would either leave the suite permanently red or have
to exempt nearly every site it exists to police. The guard is therefore stated as:

> Every **skill-naming site** in either workflow module resolves to a member of the two modules'
> exported `DISPATCHABLE_SKILLS` union. A site is a syntactic position, not a string shape, and the
> four classes are closed: **(1)** the value of a module-level `SKILL_*` / `ADVISORY_RUNG_SKILL`
> constant declaration; **(2)** a `PHASE_DISPATCH` role field (`creator`, `optimizer`, `verifier`,
> `remediator`, `reviewers[]`); **(3)** a `skill:` object field **whose value is a string literal or
> an identifier bound to a module-level constant**; **(4)** the first argument of a dispatch call,
> **under the same restriction on argument syntax**. A site resolving to a string literal contributes
> that literal; a site resolving to a module-level constant contributes that constant's value; a site
> of class 1 or 2, or a class 3/4 position whose argument is neither of those two syntactic forms yet
> is not **indirect dispatch** as defined next, that the extractor cannot resolve is a **failure**,
> never a skip.
>
> **Indirect dispatch** — a class 3/4 argument that is a bare parameter, a local binding, or a member
> expression (`reviewers[0]`, `dispatch.creator`, `PHASE_DISPATCH[phaseId].optimizer`, a `skill`
> parameter threaded through a wrapper) — is a **third outcome: neither a site nor a failure**. Such
> an argument carries a value the derivation already governs at its own source: it originates in a
> class-2 role field or in a class-4 direct site upstream of the call, and scoring it a second time
> at the point of use would demand the extractor evaluate the program. The extractor counts these
> positions and asserts the count (below), so a direct site *becoming* indirect moves a number rather
> than disappearing.

**The predicate is structural because no string predicate exists** (TE F-40). "Skill-identifier
shape" read as syntax — lowercase words joined by hyphens — selects 54 distinct literals in
`orchestrate-dev.js` and 24 in `orchestrate-queue.js` at HEAD (`grep -oE '"[a-z]+(-[a-z]+)+"'`),
including `"command-failed"`, `"dispatch-error"`, `"rev-parse"` and `"awaiting-merge"`; containment
fails on every one of them, so the test would be red on correct code and the only repair would be
loosening the predicate — the exact pressure this section exists to remove. Read as membership
instead, containment becomes `x ∈ S for all x ∈ S`, a tautology that cannot fail on any input,
including the drift it is written to catch. Read as "a shipped skill directory name" it is red again:
`name: "orchestrate-dev"` (`orchestrate-dev.js:3316`) and `name: "orchestrate-queue"`
(`orchestrate-queue.js:45`) are `meta` fields naming directories under `pdlc/skills/` that are not in
the derived 10. The decisive case is the reviewer-role map: its keys `"se-review"`, `"pm-review"`,
`"te-review"` and its values `"software-engineer"`, `"product-manager"`, `"test-engineer"` sit on the
same three lines (`orchestrate-dev.js:6229-6231`) and are syntactically indistinguishable, so **no
string predicate can separate them** — but structurally the map is none of the four classes, so
neither keys nor values are sites, and the map needs no exemption. Sites are enumerable; shapes are
not. This supersedes any reading of DEC-ENG-05's rule as a lexical filter; DEC-ENG-05 moves with it.

**Containment over an extracted set is vacuously green whenever extraction returns ∅**, so the guard
carries a second conjunct: the **per-class site census**, asserted, not observed. After the edit §8.3
specifies, the four classes hold **7 / 28 / 1 / 12 = 48** direct sites plus **11 indirect-dispatch
positions** — 7 constant declarations (6 in `orchestrate-dev.js`, `SKILL_TRIAGE` in
`orchestrate-queue.js`); 28 role-field literals across `PHASE_DISPATCH`'s eight rows
(`orchestrate-dev.js:3337-3437`, measured: 5 non-null `creator`, 7 `optimizer`, 14 across seven
two-member `reviewers` arrays, 1 `verifier`, 1 `remediator`); 1 `skill:` field (`:10448`); 12
dispatch-call first arguments (`:8008`, `:8112`, `:8035`, `:8064`, `:10028`, `:10068`, `:10142`,
`:10251`, `:9964`, `:10542`, `orchestrate-queue.js:1216`, and the module-constant argument
`_agent(ADVISORY_RUNG_SKILL, …)` at `:1841`, which resolves exactly as the rule prescribes and is
therefore a site, not an omission). The 11 indirect positions are `skill: reviewers[0]` and
`skill: reviewers[1]` (`:5909`, `:5910`), `skill: authorSkill` (`:9288`), `skill: dispatch.creator`
(`:9528`), and the seven variable-argument dispatches at `:5573`, `:5579`, `:5585`, `:5876`, `:7124`,
`:7463` and `:9244`. **Classes 2 and 4's figures are measured at HEAD** (28 and, for the pre-edit
literals, the eleven above); **class 1's 7 is counted after the edit** — only `ADVISORY_RUNG_SKILL`
(`orchestrate-dev.js:1797`) exists today, the six other `SKILL_*` constants and `SKILL_TRIAGE` are
introduced by this feature — and class 3's single site becomes a constant reference by the same edit.
Classes 3 and 4 hold constant *references* after the edit, which is why the extractor must resolve
references rather than match literals — and why "cannot resolve", for a resolvable syntactic form, is
a failure. A prettier reflow of the two multi-line call forms, or a call-form change, drops sites from
class 4 and turns the census red instead of letting containment pass over a shrunken set; a direct
site rewritten to dispatch through a variable moves one count out of the direct 12 and into the
indirect 11 rather than vanishing from both. **The census is a test-side transcription and is
updated deliberately** when a phase row or dispatch site is added — that edit is the point at which a
human confirms the new site names a union member.

The guard then fails exactly when the drift this section fears occurs: a new dispatch site naming an
identifier the exports do not carry. **Needing an exemption at all is the re-evaluation trigger**
(DEC-ENG-05) — under structural scoping no exemption exists to widen.

**Why the derived set earns a test-side transcription too, and why that is not the declaration
BR-START-4 forbids** (TE F-42). At HEAD the derived union is **10 identifiers** — `{dod-verify,
harvest-learnings, pm-author, pm-review, se-author, se-implement, se-review, ship-pr, te-author,
te-review}` — and the derivation test transcribes exactly that list as its second conjunct. Without
it, deleting a `PHASE_DISPATCH` role field shrinks the export and the test's recomputation together,
both stay equal, and rung 4's Direction-A set-equality against readable prompt files also stays green
because the deleted identifier's file is simply no longer expected — nothing anywhere goes red. This
is the same reasoning §7.4 applies to M-ENG-07, which is "a transcription of the modules' constants,
never an import from them", and the two sections now agree rather than choosing oppositely.
BR-START-4 forbids a hand-maintained declaration **in production, beside the dispatch sites**, where
it can disagree with the run; a test-side transcription is the opposite object — it is the spec
asserting what production must derive, and it goes red rather than silently governing behaviour. The
production side remains computed, never typed.

Adding these exports is a change to the modules, in this repo, with tests (C-4). It is behaviourally
bundle-safe: `stripModuleSyntax` (`pdlc/workflows/build-runtime.mjs:45`) rewrites `export const` to
`const`, and the bundle's published-binding lists (`:87`, `:107`) are explicit, so the runtime
bundles are unaffected by a name they do not publish. It is **not** byte-safe: `stripModuleSyntax`
inlines the whole module body, so both `pdlc/workflows/dist/*.bundle.js` and
`distribution-manifest.json` change and must be rebuilt and committed in the same task
(`.github/workflows/pr-tests.yml:77` `artifact-freshness` gates on exactly that — §8.3).

**Rung 4 therefore imports the two modules** (after rungs 1–3 pass, never before — R-ARCH-1 keeps that
import inside `lib/run.mjs`, which exposes `loadDispatchableSkills()` for startup to call).
**Rung 4 checks the union of both modules' sets on every invocation, not the invoked command's
module alone.** Under a per-command reading `pdlc queue` would pass rung 4 over a set excluding a
skill it can dispatch — `se-review` reaches the queue only through the delegated dev pipeline and
the advisory seam — and a missing `se-review/SKILL.md` would surface mid-run instead of at startup.
The union is also cheap: `lib/run.mjs` imports both modules regardless, because the queue imports
the dev module itself (`orchestrate-queue.js:41`). The equality is then computed over that scope:

| Direction | Statement | Failure |
|---|---|---|
| A: dispatchable ⊆ readable | every derived identifier has a present, non-empty prompt file under `{pluginRoot}/skills/{id}/` | refusal naming each missing identifier |
| B: readable ⊆ dispatchable | every prompt file **belonging to a derived identifier's directory** is reachable by a composed dispatch | refusal naming each unreachable file |
| out of scope | a prompt file under a skills directory no module dispatches (`tech-lead`, `consolidate-learnings`, …) | reported, never a refusal (EC-START-7) |

**This narrows rung 4, and the narrowing is intended rather than incidental** (PM Q-02, TE Q-06).
HEAD's `EXPECTED_SKILLS` literal (`startup.mjs:20`) carries 17 entries; the derived set carries 10.
The arithmetic is REQ-conformant — 10 dispatchable + the 2 `se-implement` supplements + 5
operator-invoked skills present in the plugin and outside the set (`consolidate-learnings`,
`orchestrate-dev`, `orchestrate-queue`, `tech-lead`, `tech-lead-python`), matching `REQ:509-512` —
so nothing is being lost by accident. But it means **after the constant is deleted, nothing asserts
those five are readable, and that is the design's answer, not an oversight**: an operator who invokes
`/pdlc:tech-lead` interactively is outside the engine entirely, the engine can never dispatch those
identifiers, and a startup refusal over a file no engine run reads would be a false gate. They are
reported by the out-of-scope row above and never refused. Recording it here so the reduction is a
decision on the record rather than a silent consequence of the derivation.

Direction B is what forces §3.3's supplement decision. `skills/se-implement/` holds three files
(`SKILL.md`, `SKILL-typescript.md`, `SKILL-python.md`), and **no module dispatch names a supplement**
— `SKILL-typescript`/`SKILL-python` appear nowhere in `pdlc/workflows/*.js`; the supplements are
loaded by the *agent* at runtime per `pdlc/skills/se-implement/SKILL.md:3`, which under a headless
dispatch it cannot do (it is told no plugin path). **Decision: the engine inlines a dispatched
identifier's whole prompt-file set**, `SKILL.md` first, each supplement following under a named
delimiter. This makes the 12-file count REQ AC-3.5 fixes reachable, satisfies Direction B without an
exemption list, and keeps BR-SKILL-3's intent (the supplements travel with `se-implement` and only
with it). It is an engine-side *composition* choice, not a prompt rewrite (NG-8): no byte of any
`SKILL.md` changes. See the FSPEC erratum this raises, §9.

**The delimiter grammar is fixed and asserted** (TE Q-02). Each supplement is introduced by a line
`--- BEGIN SUPPLEMENT: {basename} ---` and closed by `--- END SUPPLEMENT: {basename} ---`, matching
the role-definition delimiters `composeDispatchPrompt` already emits (`skills.mjs:312`). AC-3.1's
oracle is then **set-equality over the file set**, not containment of a supplement's text somewhere
in the prompt: for each dispatched identifier, the set of basenames appearing in BEGIN markers ≡ the
set of `.md` files in that identifier's skill directory (3 for `se-implement`, 1 for each of the
other nine, 12 in total). Containment would pass a prompt that inlined a supplement twice, or one
that inlined a file no longer in the directory.

`composeDispatchPrompt(skillName, skillText, taskPrompt)` (`skills.mjs:312`) keeps its shape — role
line, delimited role definition, task — and gains the supplement blocks between the role definition
and the task. `skillFilePath()` (`:267`) keeps both identifier forms (`se-implement`,
`se-implement:SKILL-typescript.md`) and its traversal guard (`:278-280`).

Plugin-root resolution is discharged and unchanged (O-8): explicit override → install registry →
extracted cache → marketplace checkout, with `tried[]` retained for a legible refusal
(`skills.mjs:204-256`).

### 3.4 The `Transport` interface and its two implementations (C-2, C-6, FSPEC §3.2)

One interface, deliberately narrow — a transport dispatches a composed prompt and reports what it
observed. It owns no policy: no retry, no backoff, no rate-limit pausing, no auth verdict. Those live
one layer up in the adapter (R-ARCH-2).

```js
createTransport({ queryFn, env, apiKeySourcePolicy, defaultTimeoutMs, permissionMode })
  -> { dispatch(prompt, { model, cwd, timeoutMs, maxTurns })
         -> Promise<DispatchResult> }
```

**This four-key options object is the whole transport-facing boundary.** The boundary test is a
**two-part contract, not a set-equality over one instance** — the distinction matters because the
four keys are not all present on any real dispatch. `model` and `maxTurns` are assigned only when
defined (`adapter.mjs:279`, `:281`), and §4.1 records that `maxTurns` is never set by any module, so
no dispatch this feature can produce carries all four. An instance-level set-equality would fail on
every dispatch. Both halves are therefore stated:

| Half | Assertion | What it catches |
|---|---|---|
| containment | every key observed on any `dispatchOpts` is a member of the permitted set `{ model, cwd, timeoutMs, maxTurns }` | a fifth key leaking across the boundary — the completeness half, and the reason this is not merely a spot check |
| presence | `cwd` **and** `timeoutMs` are present on **every** dispatch | the per-dispatch cwd discipline §2.3 depends on, and the effective-timeout guarantee §4.6/BR-CLI-3 depend on (see below) |

**`timeoutMs` is engine-supplied on every dispatch; `maxTurns` is the one declared-but-unreachable
key** (PM F-01). v1.2 said in two places what could not both be true: §3.4 grouped `timeoutMs` with
the conditionally-assigned keys, while §4.1 and §4.6 declared it always present and derived from
`dispatch.timeoutMinutes`. §4.1 and §4.6 are the ones kept, because §4.6's tunable is only honest if
it reaches the dispatch. No workflow module passes `timeoutMs`, so HEAD's adapter assigns it only when
an opts field carries it (`adapter.mjs:280`) — i.e. never; under that reading the operator's resolved
timeout would never leave `resolveTunables`, every dispatch would run on `createTransport`'s
constructor default (`transport.mjs:152`, `timeoutMs = defaultTimeoutMs`), and `tunables.timeoutMinutes`
(§4.5, BR-CLI-3) would report an effective value nothing enforced. **The adapter therefore stamps
`timeoutMs` = the resolved `dispatch.timeoutMinutes` × 60 000 onto the options object of every
dispatch**, overriding nothing the modules pass (they pass nothing) and leaving the transport's own
default as a construction-time fallback no run-shaped path reaches. That assignment is part of §8.3's
edit surface.

**Where the adapter receives the value: one constructor option, the shape `createAdapter` already
uses for tunables** (TE Q-11). `createAdapter` (`adapter.mjs:215`) already takes its other two
resolved tunables as defaulted constructor options — `maxRateLimitPauses` (`:224`) and
`retryBackoffBaseMs` (`:225`) — and `dispatchTimeoutMs` joins them on the same footing: one option,
one default, closed over by `_agent` and written onto `dispatchOpts` at `:278-281`. The resolved
value is supplied by the two construction sites, both in `bin/pdlc.mjs`, and v1.4 mis-labelled which
is which (TE F-31): **`:173` is inside `emitDryRun`** — AC-3.1's inspection surface, built over
`inertTransport()`, so the resolved value is printed but never reaches a transport boundary — and
**`:205` is inside `liveAdapter`** ("Build the live adapter: real SDK transport, consumer cwd"),
which is the run path and the only site whose dispatches carry the stamp. **`doctor` constructs no
adapter and no transport at all** (`cmdDoctor`, `:157`; its arm prints "doctor: all checks passed. No
dispatch was performed." at `:162`), so it is not a third resolution point and §4.6's table is not
read through it. Both real sites are where `resolveTunables({ config, flags })` (§4.6) is called and
where the `tunables` report block (§4.5) is built — so the number stamped on the dispatch and the
number reported are the same call's return by construction, not by convention, and §4.6's
effective-value oracle is asserted on the `:205` path because it is the one that dispatches. No per-run seam and no
second resolution point is introduced; `run.mjs` receives the already-built adapter (`:72`, `:182`
document it as such) and resolves nothing itself.

**The presence half asserts key presence; the `cwd` *value* is asserted elsewhere** (TE Q-09) — a
division of labour, not an omission. `adapter.mjs:278` builds `{ cwd }` unconditionally, so the key
exists even when the value is `undefined` (§4.1 types it `string|undefined`), and presence alone would
stay green on a run where the cwd discipline had silently degraded. AC-2.5's test owns the value: the
resolved repo root reaching the transport per dispatch (§2.3, `run.mjs:155`). This row is therefore
not the whole guarantee, and the same split applies to `timeoutMs` — presence here, *effective value
equals the reported tunable* in §4.6's test.

So it is set-equality against the *permitted* set, asserted as containment plus the two required keys —
never equality against the keys of a single call. §4.1's `DispatchDescriptor` is a strictly wider
*adapter-internal* shape: `skill`, `label` and `attempt` stay adapter-local (`adapter.mjs:272`,
`:285`) and are never handed to a transport, which is why HEAD builds `dispatchOpts` as
`{ cwd }` plus conditional keys (`adapter.mjs:278-281`) rather than forwarding the
descriptor — this design keeps that build and adds the engine-stamped `timeoutMs` to it. The two enumerations are deliberately different and §4.1 names which is which.

`createTransport` (`transport.mjs:135`) and its `dispatch` JSDoc (`:143-150`) already declare exactly
this shape at HEAD; the SDK implementation is the one that exists. **Both implementations return the
same `DispatchResult`** (§4.2) and throw from the same four-class error set — `AuthPolicyError`
(`:23`), `RateLimitedError` (`:33`), `TimeoutError` (`:46`), `TransportError` (`:55`) — which is why
`classifyOutcome` (§5.1) can be transport-blind.

| Concern | `transport.mjs` (SDK, primary) | `transport-cli.mjs` (`claude -p`, fallback, new) |
|---|---|---|
| dispatch | `queryFn({ prompt, options })`, consume the async stream | spawn `claude -p --output-format stream-json`, consume stdout lines |
| model / cwd / turns | `options.model` / `.cwd` / `.maxTurns` (`:176-178`) | `--model`, child `cwd`, `--max-turns` |
| child env | `{ ...env }`, **spread, never replaced** (`:159`) | identical rule, same helper |
| timeout | `AbortController` + timer (`:162-166`) | same timer, `child.kill("SIGTERM")` then `SIGKILL` |
| `apiKeySource` | `system/init` message (`:199-206`) | same field in the stream-json init line |
| permission mode | `options.permissionMode` + paired `allowDangerouslySkipPermissions` (`:170-174`) | `--permission-mode`, `--dangerously-skip-permissions` |
| guard parity | in-process `hooks.PreToolUse` (§6) | `--settings` file per dispatch (§6) |
| absent terminal result | `TransportError` (`:236-243`) | identical: a stream that ends without a result is a contract violation, never an empty success |

**The proxy-passthrough rule is a shared invariant, not two implementations of one idea** (C-2, G-4).
The env spread at `transport.mjs:159` is what carries `ANTHROPIC_BASE_URL` and
`ANTHROPIC_CUSTOM_HEADERS` (SPIKE §4) into every dispatch. A single exported helper builds the child
env for both transports, and a shared parity test asserts a sentinel variable survives (BR-PARITY-5).

**Per-dispatch auth assertion stays in the transport** (C-1b), because it is an observation of that
dispatch, not a policy: the observed `apiKeySource` is checked against `apiKeySourcePolicy`
(`DEFAULT_API_KEY_SOURCE_POLICY = ["none"]`, `:63`) and a mismatch throws `AuthPolicyError` **before
any tool runs**. `startupFor` (`bin/pdlc.mjs:88`) widens that set to the five-member policy only under
`--allow-api-key-billing` (`:93`).

**There is no transport selector in this feature, and `resolveTransport` takes no operator input.**
FSPEC §3.2 is explicit (`FSPEC:215-217`): every real run uses the primary transport, the fallback is
exercised through recorded fixtures only, and making it runtime-selectable is O-1's work, not this
document's. v1.0 stated the opposite here and the correct thing in §6.4; this is the single place
the question is settled.

```js
resolveTransport({ env }) -> { kind: "agent-sdk", transport, reason }   // kind is constant here
```

The consequences a test author needs, stated rather than implied:

- **`kind` is `"agent-sdk"` on every code path a run can take.** `reason` is present so the field
  reads as an observation rather than a constant, and so O-1 can add branches without changing the
  shape; at this feature's scope `reason` has one value, naming the absent selector.
- **`"cli"` is reachable only by direct unit construction** — a test importing `transport-cli.mjs`
  and driving it over §7.2's recorded fixtures. It is not reachable through `resolveTransport`, and
  no flag, env var or fallback path produces it.
- **The report's `transport` field therefore asserts one value on any run-shaped test** (§4.5), and
  two only in the per-transport unit tests that construct the fallback directly. The
  `"agent-sdk" | "cli"` enumeration is the field's *type*, not its runtime range in this feature.
- **There is no failover, silent or otherwise** (**R-TRANS-1**, a TSPEC-introduced design rule with
  no upstream id — v1.0 attributed it to a `BR-TRANS-6` that does not exist in REQ or FSPEC): an SDK
  failure is a failure, classified by §5.1 and surfaced. With no selector there is nothing to fail
  over *to*, and a transport that quietly changed underneath a run would make every subsequent
  observation unattributable.

### 3.5 The message catalogue seam (C-8, AC-6.4)

Every operator-visible string the engine emits — refusals, gate reasons, pause notices, exit
summaries — is registered, and emitted only through the registry:

```js
// lib/catalogue.mjs (new)
export const MESSAGES = Object.freeze({ "auth.api-key-refused": { severity, template }, ... });
export function message(id, params): string   // throws on unknown id or missing param
export function messageIds(): string[]
```

Three properties, all mechanically checked rather than reviewed:

- **Unknown id throws** at emission, so an unregistered string cannot reach an operator.
- **Every registered id is emitted at least once by the suite, asserted once suite-wide**, not per
  test: each `message()` call appends its id to the run's observation directory (§7.0's
  cross-process mechanism — a module-scoped `Set` would be per test *file*, not per run), and a
  final step asserts set-equality with `messageIds()`. Per-test assertions would make the property
  vacuous the moment a test is skipped (this repo's `consolidation-agent-vacuous-green` lesson).
- **Ids are stable identifiers, wording is not.** The catalogue id is the contract other documents
  cite (`auth.*` rows in §3.2); the template may be reworded without a spec change, and no test
  asserts prose.

Severity is data on the entry, not the caller's choice, so the same condition cannot be a warning in
one path and a refusal in another.

### 3.6 Report and provenance seams (AC-4.5, BR-REP-0, NG-7)

`buildEngineBlock()` (`report.mjs:36`) and `stampReport(report, engine)` (`:70`) keep their contract:
the module's report is copied verbatim and extended with one `engine` key — `stampReport` never
mutates and never edits a module-produced field (NG-7). Two fields change from declaration to
observation:

| Field | HEAD | Target |
|---|---|---|
| `transport` | hardcoded `"agent-sdk"` (`report.mjs:50`) | the `kind` `resolveTransport` returned, recorded once per run — same value, but observed rather than declared (§3.4) |
| `apiKeySource` | one run-scoped `lastApiKeySource` (`adapter.mjs:245`, written `:320`, read `:381`) | a per-dispatch record; the block carries the observed set plus per-dispatch rows |

`buildEngineBlock` therefore takes `transport` and `authSources` arguments instead of a constant and a
scalar. Both are supplied by the adapter's getters, which is why the adapter already exposes
`getPauseLog`, `getDenialLog`, `getDispatchCounts`, `getApiKeySource` — the last becomes
`getAuthSources()`. **The engine writes the `engine` block and nothing else**, so a module field and
an engine field can never collide silently: a test asserts `engine` is the only key `stampReport`
adds.

## 4. Data Model

Every shape here is engine-owned and in-memory. **The engine defines no persisted schema**: the
pipeline's documents, cross-reviews, queue table and drift-state file remain exactly as the workflow
modules write them (NG-7). The only bytes the engine adds to disk are the `engine` block inside the
run report (§3.6) and, when the operator asks for it, the report file itself.

### 4.1 `DispatchDescriptor` — the adapter's own per-dispatch record

**This is an adapter-internal shape, not the transport boundary.** The transport receives §3.4's
four-key options object (`{ model, cwd, timeoutMs, maxTurns }`, built at `adapter.mjs:278-281`, with
`timeoutMs` engine-stamped rather than conditional — §3.4);
`skill`, `label` and `attempt` stay adapter-local (`:272`, `:285`) and feed the logs, pause rows and
`authSources` records instead. Two enumerations, two different boundary tests: set-equality over the
transport's option keys, and field-presence over the descriptor.

```js
{ skill: string,          // a member of the derived dispatchable set (§3.3)
  label: string|null,     // opts.label if a module ever passes one; null at HEAD (see below)
  phase: string|null,     // run state, from the `_phase` seam — NOT from opts (see below)
  seq: number,            // 0-based, one value per dispatch, non-decreasing within the run;
                          // a dispatch's retry attempts share its seq and differ in `attempt`
  prompt: string,         // composed: role line + role definition + supplements + task
  model: string,          // verbatim from the module's opts.model; never defaulted here
  cwd: string|undefined,  // per-dispatch, never process.chdir (§2.3)
  timeoutMs: number,      // dispatch.timeoutMinutes × 60 000, engine-stamped on every dispatch (§3.4, §4.6)
  attempt: number,        // 0-based; 0 is the first try, not a retry
  outcome: Outcome|null,  // §4.2's member, stamped when the dispatch settles; null only in flight
  errorText: string|null }// String(err?.message ?? err) verbatim when the dispatch threw, else null
  // maxTurns is a transport option with no descriptor field: the modules never set it,
  // so it is absent per dispatch and the transport omits it (transport.mjs:178).
```

**`label` is `null` on every dispatch at HEAD, and nothing in this design may be keyed on it.**
This is measured, not assumed: no `_agent` call site anywhere passes a `label`. The general
dispatcher passes `model ? { model } : undefined` (`orchestrate-dev.js:7124`), the seam wrapper
passes `{ model: MODEL_DEFAULT, ...opts }` (`:8971`), and the four specially-pinned sites pass
`{ model }` alone (`:1841` advisory and its fallback via `dispatchAt`, `:7463` verdict recovery,
`:9968` PLAN-DAG extraction); the queue is the same (`orchestrate-queue.js:1053`). Of the 13
`label:` occurrences in `orchestrate-dev.js`, eight are `PHASE_DISPATCH` row fields (`:3340`–`:3433`),
two are git-helper seam options (`:8710`, `:8730`), one is `label: dispatch.label` inside the options
object handed to `routeErrata` (`:9574` — an internal helper's argument, not `_agent`'s), and the rest
are JSDoc — **none is a dispatch argument**. (The `:9574` row was missing from v1.2's enumeration,
TE F-24; the conclusion is unchanged, and re-measured for this revision.) The adapter's own comment, "`opts.model` and `opts.label` are the two fields the modules
actually pass" (`adapter.mjs:266-268`), is stale; `const tag = label || skill` (`:274`) therefore
always yields the skill. Correcting that comment is part of this feature's edit surface (§8.3).

**The phase comes from the `_phase` seam held as run state, not from the dispatch options.** The
modules *do* announce every phase boundary — `phaseFn("Phase I: Wave 1/3")` (`orchestrate-dev.js:10136`),
and likewise `:9516`, `:9951`, `:10066`, `:10248`, `:10289`, `:10314`, `:10445`, `:10500`, `:10573`;
the queue announces `"Queue: Triage"` and its siblings (`orchestrate-queue.js:1065`, `:1130`, `:1144`,
`:1170`, `:1400`). The adapter currently only logs the label (`adapter.mjs:357-359`). This design has
it **retain the last announced label as run state and stamp it on each descriptor**, which supplies
every per-phase consumer without touching a workflow module — the property §8.3's "no other file
under `pdlc/workflows/` is modified" depends on. Three rules make it total:

- **Normalisation.** `phase` is the announced label's prefix up to the first `:` — `"Phase I: Wave 1/3"`
  and `"Phase I: Implementation"` both normalise to `"Phase I"`, and `"Queue: Triage"` to `"Queue"`.
  Per-phase counts (§4.4) bucket on this normalised value, so waves of one phase do not fan out into
  separate buckets.
- **The pre-phase window is a named bucket, never a silent one, and it is asserted rather than merely
  reported.** A dispatch composed before the first `_phase` call records `phase: null` and is reported
  under the literal key `"(no phase)"`. At HEAD no such dispatch exists, and that expectation is
  carried by an assertion, not by prose (PM Q-01, TE Q-10): **`byPhase["(no phase)"]` is absent or `0`
  on every run-shaped test** — the fifth row of §7.4's suite-wide property table, riding the model-map
  accumulator rather than owning one. Reporting alone would mean the first dispatch that drifted ahead of
  a phase banner landed in a bucket nobody fails on, which is the vacuity §7.4 exists to avoid. The
  assertion is on the pipeline-run tests, not on unit tests that dispatch through the adapter without
  announcing a phase; those construct the adapter directly and are outside the run-shaped set. The
  field that draws that line is `corpusRun` (PM F-02): the assertion is **no record with
  `corpusRun != null` has `phase === null`**, stated over records because `"(no phase)"` is §4.4's
  report key and never appears in a recorded line (§7.4's fifth row).
- **`phase` is provenance, never a verdict** (§4.5's second convention): it records what the run
  announced, and no engine decision reads it.

`model` passes through untouched (`adapter.mjs:271`): the modules own phase→model pinning
(`MODEL_DEFAULT` `orchestrate-dev.js:1603`, `MODEL_IMPLEMENTATION` `:1646`, `MODEL_ADVISORY` `:1652`,
`MODEL_ADVISORY_FALLBACK` `:1653`, `MODEL_QUEUE` `orchestrate-queue.js:70`). An engine-side default
would silently re-price a phase, so there is none — an absent `model` is passed as absent and the
transport omits the option (`transport.mjs:176`).

**`outcome` and `errorText` are the descriptor's terminal half, and they exist because a
composed-only record cannot witness a failure-driven behaviour** (PM F-01, TE F-26). Every field
above is stamped when the dispatch is *composed*; a dispatch that ends by throwing was, until this
revision, recorded identically to one that returned. That made §7.4 row 4 — the advisory fallback,
whose only trigger is a `fable` dispatch failing to resolve — unwitnessable from recorded data, so
the row reduced to "some `se-review` dispatch ran on Opus", which every pipeline run satisfies. Both
fields close that:

- **`outcome` is §4.2's member, not a new taxonomy.** The adapter is already the layer that calls
  `classifyOutcome` (§5.1) — it is the only place that sees both the thrown value and the result
  text — so the stamp is that call's return, written back onto the descriptor when the dispatch
  settles. The six-member set (§4.2, AC-4.1) is unchanged and stays frozen; a seventh member for
  "model did not resolve" is deliberately **not** added, because that string is `orchestrate-dev`'s
  own vocabulary (`MODEL_ERROR_RE` `orchestrate-dev.js:1780`, `isModelResolutionError` `:1791`) and R-ARCH-2
  keeps module prose out of `outcome.mjs`.
- **`errorText` is verbatim, and the engine never parses it.** It is `String(err?.message ?? err)`
  for a dispatch that threw and `null` otherwise. The engine takes no decision from it — `phase`'s
  "provenance, never a verdict" convention (§4.5) applies unchanged. It exists so a *test* can
  discriminate on a failure it forced: run iv's fixture injects the model-resolution rejection, so
  the harness matches `errorText` against the literal string it injected, a transcription of the
  fixture rather than an import of the module's regex.
- **Retries stay legible.** `attempt` is a local of the one `_agent` call (§5.2, BR-RETRY-4) and
  `seq` indexes the dispatch, so a retried dispatch records one descriptor per attempt under a
  shared `seq`, each carrying its own terminal `outcome` — the intermediate `retryable` ones
  included. A retry duplicate carries the same `skill`, `phase` and `model` as the attempt it
  repeats, so it can neither falsify rows 1/2's universals nor satisfy an existential the first
  attempt did not already satisfy.
- **The record is appended when the dispatch settles — one line per attempt** (PM F-01, TE F-30).
  The two timings above are different things and the document now says both: the descriptor is
  *stamped* at composition (every field except the terminal half) and *written* to §7.0's
  accumulator at settlement. It has to be that way round, because §7.0's file is **append-only**
  (`${PDLC_TEST_RUN_DIR}/{pid}.jsonl`, no rewrite, no locking): a line appended at composition would
  carry `outcome: null, errorText: null` forever no matter how the in-memory object was mutated
  afterwards, `_assert-suite-wide.mjs` reads only the lines, and §7.4 row 4's terminal conjuncts
  would be unsatisfiable — red on correct code, with "loosen row 4" as the only available repair.
  **Every recorded line is therefore a settlement line, without exception** (PM F-01/TE F-36).
  There is no composition-time line and no line with `null` terminals: this design appends from the
  `_agent` body alone (`lib/adapter.mjs:271`), and `composePrompt` is a **separate entry point**
  (`lib/adapter.mjs:259`, exported at `:373`) that no accumulator hangs off. The one production
  surface that composes without dispatching therefore writes nothing — `emitDryRun` calls
  `adapter.composePrompt(skill, …)` **directly**
  (`bin/pdlc.mjs:190`), never `_agent`, so no descriptor is stamped and no line is produced. Had
  `_agent` been called on that adapter, `inertTransport().dispatch()` **throws**
  (`bin/pdlc.mjs:98-104`), which settles as an error outcome — still a settlement line, still not a
  `null` one. This is the upstream rule, not a local narrowing: FSPEC BR-MODEL-3 says a descriptor
  exists when a dispatch is composed "so the whole corpus is reachable from hermetic fixture-driven
  runs and no row of the map depends on billed traffic", and that "the dry-run surface is **not** a
  way to reach it … it exercises at most one row and is never the corpus's source"
  (`FSPEC:680-684`). Both halves hold here: every *dispatched* composition produces exactly one line
  per attempt, and the corpus's settlements are fixture transports (§7.2), never billed traffic.
  §7.4 states which line each row's predicate reads, and row 4's `F` is a settlement line by this
  rule rather than by a condition it has to check.

Neither field is engine-facing state: nothing in the run loop, the report projection or the exit-code
mapping (§5.4) reads them. They are recorded fields, and §7.4 is their only consumer.

### 4.2 `DispatchResult` and `Outcome`

```js
DispatchResult = {
  text: string,                 // the assistant's final text, verbatim
  sessionId: string,
  costUsd: number,
  usage: object,
  rateLimitEvents: object[],    // every rate_limit_event seen in the stream
  apiKeySource: string|null,    // from system/init; null when never reported
}
```

`_agent` returns `result.text` alone (`adapter.mjs`, §3.1) — the modules parse prose, and widening
that return would let a module start depending on transport internals.

```js
Outcome = "ok" | "retryable" | "timeout" | "auth-failure"
        | "transport-contract-violation" | "agent-reported-failure"    // AC-4.1
```

Exactly six members, frozen, exported once. **Set-equality is asserted in both directions** — every
classifier branch yields a member, and every member is produced by some fixture — so neither an
unclassified error nor a dead member can survive (§5.1).

### 4.3 `AuthPosture` and `StartupResult`

`AuthPosture` is §3.2's return: `{ row, catalogueId, refuses, evidencePath }`, plus the resolved
`apiKeySourcePolicy` the transport will enforce per dispatch. The startup posture (C-1a) and the
per-dispatch assertion (C-1b) share the catalogue id but are separate observations: agreement between
them is a checked property, not an assumption (a run may start on row 1 and observe a key mid-run).

```js
StartupResult = {
  ok: boolean,
  rungs: RungRecord[],     // always all seven, in RUNG_ORDER, in order
  banner: string,
  pluginRoot: string|null,
  pluginVersion: string|null,
  reason: string|null,     // catalogue id + detail of the first failing rung
}
// FSPEC §5's ladder, verbatim: rung ids are *labels*, not indices (FSPEC:293-301, v1.6)
RUNG_ORDER = Object.freeze(["0", "1", "2", "3", "4", "4a", "5"]);
RungRecord = { rung: RungId, name: string, state: "pass"|"fail"|"skipped", detail: string|null }
```

**The rung id is a string label drawn from `RUNG_ORDER`, never an integer index** (FSPEC v1.6 C-11,
BR-GUARD-6). FSPEC inserts **rung 4a — guard executable** between rungs 4 and 5 (`FSPEC:299`;
EC-START-10/11, AT-ENG-11a): the host must be able to run the shipped
`guard-harvest-before-delete` script, i.e. an accepted interpreter is obtainable (**§7.8** for the
probe seam and both branches' tests; FSPEC §9.1 — *not* §6.4, which is EC-GUARD-4's transport-capability
probe), and failure refuses with the candidates tried and the remedy, exit `1`, nothing dispatched. An
integer `0..5` typing cannot express `4a`, and an implementer working from this document alone would
face exactly two bad repairs — drop the rung, or renumber the ladder to `0..6`. **Renumbering is
forbidden**: FSPEC fixes rung numbers 0–5 and every `EC-START-*` message, `pdlc doctor` line and
acceptance test names them, so a renumber silently invalidates the upstream vocabulary. The ladder is
therefore seven records long, ordered by `RUNG_ORDER`, and the set-equality of a run's emitted rung
ids with `RUNG_ORDER` is itself asserted — so a later inserted rung cannot go unrecorded.

**The ladder is total** (BR-START-1): a rung after a failure records `"skipped"` with the reason it
was skipped, never absence. `pdlc doctor` prints the same array — the mechanism is one function, so
the diagnostic and the gate cannot diverge.

**`doctor` has a stated projection, not just "prints the array"** (AC-2.1's closing paragraph,
`REQ:428-432`; FSPEC BR-START-3 `:303-305`). AC-2.1 requires three facts readable *without starting
a run*, and a `RungRecord`'s `{rung, name, state, detail}` does not carry them, so `StartupResult`
gains them as first-class fields rather than leaving them buried in `detail` prose:

| AC-2.1 fact | Field | Rung that observed it |
|---|---|---|
| engine and plugin versions, always as a pair | `versions: { engine, plugin }` | 3 (handshake, C-10) |
| effective base URL | `baseUrl: string\|null` | 5 (billing posture) |
| auth catalogue id | `auth: { row, catalogueId }` (§3.2's `AuthPosture`, minus `refuses`) | 5 |

`doctor` renders exactly those three plus the rung array, and the same three are the values §4.5's
`engine` block carries, from the same call — so the diagnostic and the report cannot disagree about
a fact one of them observed. HEAD's `runStartupChecks` (`startup.mjs:60`) returns
`{ok, banner, pluginRoot, pluginVersion, reason}` and pushes free-text check lines; the change is to
make the records structured and to add rungs 0 (args/cwd), 4a (guard executable, C-11) and 5 (billing
posture), keeping the string banner as a rendering of the array (`formatStartup`, `:145`).

Rung 4's `EXPECTED_SKILLS` frozen literal (`startup.mjs:20`) is deleted, replaced by the derived set
(§3.3) — the constant is the declaration BR-START-4 forbids.

### 4.4 `PauseRow`, `RetryRow`, `DenialRow`, `DispatchCounts`

`PauseRow` exists at HEAD (`adapter.mjs`, pushed on `RateLimitedError`); it keeps every field it has
and gains one, `phase` (see below — HEAD's `label` is the skill, never a phase):

```js
{ timestamp, skill, label, phase, attempt, waitedMs, rateLimitType, status, resetsAt, retryAfterMs }
```

It is append-only and run-scoped: a pause is evidence of what the account did, so rows are never
coalesced or trimmed. `rateLimitType` and `status` carry the SDK's own vocabulary verbatim
(`"five_hour"`, `"rejected"` — SPIKE §3), never a normalised synonym, so the report can be read
against Anthropic's semantics rather than the engine's.

**`RetryRow` is new** (`{ timestamp, skill, phase, attempt, outcome, delayMs }`) and is the row
FSPEC §12.2 asks for by name — "taxonomy member, phase, attempt number, delay". `PauseRow` alone
could not carry it: it has no taxonomy-member field, and §5.2 now retries `timeout`, which produces
no rate-limit pause at all and so would otherwise appear in the report nowhere. Every retry writes a
`RetryRow`; a rate-limit retry additionally writes the `PauseRow` that records what the *account*
did. The two are not redundant — one is the engine's decision, the other the provider's state.

`DenialRow` records permission denials (`{ timestamp, skill, tool, reason }`). `DispatchCounts` is
`{ bySkill: { [skill]: number }, byPhase: { [phase]: number } }`: FSPEC §12.2 asks for **per-phase**
counts, and HEAD's `{[skill]: number}` (`adapter.mjs` `dispatchCounts`) cannot answer that, since one
skill is dispatched from several phases. Both keys are always present, empty objects included. All of
these feed the report; none feeds a decision.

**`byPhase` is keyed on §4.1's `phase` — the normalised `_phase` run state — never on `label`.** This
is the difference between a real per-phase view and a single bucket: `label` is `null` at every
dispatch site (§4.1, measured), so a `byPhase` keyed on it would report `{ "null": N }` for the whole
run and answer FSPEC §12.2 with strictly less information than `bySkill` already carries, while
looking satisfied. The same correction applies to the three other rows that carry a phase:

| Row / field | v1.1 wrote | This revision |
|---|---|---|
| `PauseRow.label`, `DenialRow.label` (`adapter.mjs:305`, `:340` push `label: tag`) | `tag`, i.e. always the skill | keep `label` as the log tag **and** add `phase`, so a pause is attributable to a phase rather than re-stating the skill |
| `RetryRow` | `{ timestamp, skill, label, attempt, outcome, delayMs }` | `{ timestamp, skill, phase, attempt, outcome, delayMs }` — FSPEC §12.2 names *phase*, and this is the field that supplies it |
| `authSources` (§4.5) | `{ skill, label, attempt, apiKeySource }` | `{ skill, phase, attempt, apiKeySource }` — the per-dispatch record AC-2.4 and AC-4.5 both read |

**`byPhase` is run-scoped, not per-feature: in a `queue --loop` run its buckets merge across passes,
by design** (PM F-02). The counter is §4.1's per-run state and is never reset between loop iterations,
so pass 2's `"Phase T"` dispatches land in the same bucket as pass 1's, and the queue's own
per-feature announcement — `` phaseFn(`Pipeline: ${entry.feature}`) `` (`orchestrate-queue.js:1400`) —
normalises to the constant `"Pipeline"` (§4.1's prefix rule), carrying no feature name into the key.
FSPEC §12.2 and AC-4.5 ask for per-phase counts, not per-phase-per-feature ones, so this is the asked
shape rather than a shortfall; `loop.iterations` (§4.5) is the divisor a reader needs to interpret a
multi-pass total, and a per-feature breakdown, if ever wanted, is a report change and not a counter
change. Stated here because a twelve-`"Phase T"` bucket on a five-feature loop is otherwise read as
a defect.

`label` survives only where it is honestly a log tag. Every field that a reader would take to mean
"which phase" is now supplied by the seam that actually knows.

### 4.5 The `engine` report block

```js
report.engine = {
  engineVersion, pluginVersion, pluginRoot,
  startupAuth: { row, catalogueId },       // the §3.2 row that decided at startup
  transport: "agent-sdk",                  // observed, §3.6; one value in this feature (§3.4)
  authSources: [{ skill, phase, attempt, apiKeySource }],   // per dispatch, AC-4.5 (§4.4)
  baseUrl: string|null,                    // ANTHROPIC_BASE_URL, or null when direct
  startup: RungRecord[],
  dispatches: DispatchCounts,              // per normalised phase and per skill (§4.4)
  retries: RetryRow[],                     // every retry, §4.4 — empty array, never absent
  pauses: PauseRow[], denials: DenialRow[],
  tunables: { retryAttempts, retryBackoff, timeoutMinutes, maxIterations },  // effective, §4.6
  permissionMode: string,                  // the single named setting in force (BR-PERM-1/2)
  loop: { iterations, maxIterations, stopReason, lastOutcome } | null,  // queue --loop only, below
  outcomes: { [Outcome]: number },         // all six keys, zeros included
  startedAt, finishedAt,
}
```

**Row-by-row against FSPEC §12.2** (`FSPEC:1203-1213`), because a reader must be able to check
completeness rather than infer it. Six rows are AC-4.5's own; three are FSPEC-added:

| FSPEC §12.2 row | Field here | Note |
|---|---|---|
| engine version with the plugin version, as a pair | `engineVersion`, `pluginVersion` | always both, never one |
| startup auth catalogue id | `startupAuth.{row, catalogueId}` | **added in v1.1** — v1.0 carried no startup-posture field, only the per-dispatch one |
| transport-reported auth source, **per dispatch** | `authSources[]` | one row per dispatch, not a scalar (§3.6) |
| effective base URL | `baseUrl` | `null` when direct, never absent |
| per-phase dispatch counts | `dispatches` | keyed by the normalised `_phase` value **and** by skill (§4.1, §4.4); v1.0's `{[skill]: number}` alone could not answer "per phase", and a `byPhase` keyed on `opts.label` would have answered it with one `null` bucket |
| retry / pause rows: taxonomy member, phase, attempt, delay | `retries[]`, `pauses[]` | **`retries[]` added in v1.1** — v1.0 carried `PauseRow` only, so a `timeout` retry (§5.2 now retries them) had no row at all |
| transport (FSPEC-added) | `transport` | §3.4 |
| effective dispatch tunables (FSPEC-added, BR-CLI-3) | `tunables` | **added in v1.1** — §4.6 |
| permission posture in force (FSPEC-added, BR-PERM-1/2) | `permissionMode` | **added in v1.1** — the single named setting's value, `transport.mjs:89` |

`RetryRow` is `{ timestamp, skill, phase, attempt, outcome, delayMs }` where `outcome` is the
taxonomy member that provoked the retry (`retryable` or `timeout`) — the member FSPEC's row asks for
by name. A `PauseRow` is the rate-limit-shaped specialisation and keeps its own richer fields
(§4.4); a `retryable` retry produces one of each, a `timeout` retry produces a `RetryRow` only.

**The loop sub-block is what makes AC-1.3's two stop reasons distinguishable** without inspecting
the queue. `pdlc queue --loop` ends for exactly two declared reasons (REQ:379-387, FSPEC BR-LOOP-2
`:1074-1079`), and both exit `0`, so the exit code cannot carry the distinction:

| `stopReason` | Condition | HEAD |
|---|---|---|
| `"exhausted"` | no ready row remains — the module reported `idle` or `no-queue` | `run.mjs:279-281` returns that outcome |
| `"bound-reached"` | `queue.maxIterations` reached with ready work possibly remaining | `run.mjs:282` returns `outcome: "max-passes"` |
| `"stopped"` | the loop ended on a non-clean exit — a refusal, or a pass whose outcome was not `ran` | `run.mjs:277-278` returns `outcome: "refused"`; `:280` returns `outcome \|\| "unknown"` |

**`stopReason` is total over the loop's actual exits, not only over AC-1.3's two.** AC-1.3 scopes its
two reasons to the loop that "then exits 0" (`REQ:379-387`), but `runQueueLoop` has two further
exits, and a report field the operator reads to decide whether a queue is drained cannot be silent
on them: a refusal returns `{ passes, outcome: "refused" }` (`run.mjs:277-278`) — the fact §5.4
already relies on — and a non-`ran` pass returns `outcome || "unknown"` (`:280`). Both take
`"stopped"`, and the pass-level `outcome` string is carried alongside in `loop.lastOutcome`, so the
third member names *that* the loop stopped early while the pass record says why. AC-1.3's two
members keep their exact meanings and remain the only two reachable on a zero-exit loop, so nothing
that reads them has to widen.

`loop.iterations` is the number of passes actually run and `loop.maxIterations` the bound in force.
**`loop.maxIterations` is `null` for an unbounded run, converted where the block is built, never left
to the serialiser.** The value in flight is `Infinity` (`bin/pdlc.mjs:304-305`, §4.6) and
`JSON.stringify(Infinity)` is `null`, so the written file would look right by accident while an
in-memory reader of the report object saw `Infinity` — two readers disagreeing about one field. The
conversion is therefore explicit at the point the `loop` block is assembled, and a test asserts the
in-memory object, not just the round-tripped JSON.

The same two ids are the loop's own stdout outcome line
(catalogue ids `loop.exhausted` and `loop.bound-reached`, §3.5), so the operator reads the
distinction in the line *and* in the report, as AC-1.3 requires. `loop` is `null` for `pdlc dev` and
for a single-pass `pdlc queue`, which is the one place an absent value is meaningful: no loop ran.

Two conventions this repo already relies on carry over. **Counts are present-and-zero, never absent**,
so a quiet run and a broken counter are distinguishable (the advisory tier's all-zero rows make the
same distinction). And **provenance is observation, never verdict**: `transport`, `authSources` and
`baseUrl` record what happened; nothing in the block is derived from what the engine intended.

`stampReport` places all of this under the single `engine` key of the module's own report object, so
`outcome`, `phase`, `prUrl`, `ciStatus` and every other module field reach the operator byte-identical
to a Claude Code run (AC-1.1, `orchestrate-dev.js:6190`).

### 4.6 The tunable set and its single resolution point

REQ §4.1 (`:302-308`) fixes the closed set of thresholds and rules that "no AC may depend on a
tunable that is not listed here". All five are named here, with the one function that resolves each,
so an AC that depends on one is decidable. `resolveTunables({ config, flags })` is that function; its
return is what §4.5's `tunables` block reports, so the *effective* value is always observable
(BR-CLI-3).

| REQ §4.1 tunable | Default | Owner | Resolved from | HEAD |
|---|---|---|---|---|
| `dispatch.retryAttempts` | 3 retries after the first attempt | engine config | `resolveTunables` ← config, O-3 location | hard-coded `maxRateLimitPauses` default 3 (`adapter.mjs:57`) |
| `dispatch.retryBackoff` | exponential from 30 s, capped at 15 min | engine config | same | hard-coded `baseMs` 30 s (`adapter.mjs:58`), cap 15 min (`:59`), ≤1 s jitter (`:60`) |
| `dispatch.timeoutMinutes` | 30 min per dispatch | engine config | same; the adapter stamps the resolved value × 60 000 as `timeoutMs` on **every** dispatch (§3.4) | not a named tunable at HEAD: no module passes `timeoutMs`, so HEAD's conditional assignment (`adapter.mjs:280`) never fires and the transport's constructor default decides (`transport.mjs:152`) |
| `auth.allowApiKeyBilling` | `false` | operator, per invocation | **flag only** — `--allow-api-key-billing` (`bin/pdlc.mjs:88-93`), never config, never env (BR-CLI-2) | green |
| `queue.maxIterations` | **unbounded** | operator, per invocation | **flag only** — `--max-iterations` (`bin/pdlc.mjs:83`, `:303-307`) | green, and correctly unbounded: the flag omitted yields `Infinity` (`:304-305`), so `runQueueLoop`'s `maxPasses = 100` (`run.mjs:273`) is a *parameter* default the CLI always overrides, never the operator-visible one |

Three rules make the table load-bearing rather than descriptive:

- **One resolution point.** Every read of a tunable goes through `resolveTunables`; no call site
  reaches config or a flag directly, which is what makes the reported effective values honest. It is
  called at the two `createAdapter` construction sites in `bin/pdlc.mjs` — `:173` in `emitDryRun`
  (the inert AC-3.1 surface) and `:205` in `liveAdapter` (the run path) — which both build the
  adapter's tunable options and the `tunables` report block from one return (§3.4). `doctor` is not a
  third site: it constructs no adapter (`cmdDoctor`, `:157`) and its projection is §4.3's three
  startup facts, which are not tunables (TE F-31). For
  `dispatch.timeoutMinutes` that honesty needs one assertion of its own, because the value only
  becomes effective by being stamped on the dispatch (§3.4). **The fixture pins a non-default value,
  and both sides of the assertion are spec literals** (PM F-02, TE F-27): run i's
  `.claude/pdlc.config.json` carries `dispatch.timeoutMinutes: 7`, and the test asserts the literal
  `420000` as `timeoutMs` at the transport boundary on **every** dispatch of that run *and* the
  literal `7` in the reported `tunables` block. Asserting boundary-equals-report at the *default*
  would be the weaker oracle it looks like: `DEFAULT_TIMEOUT_MS = 30 * 60 * 1000` (`transport.mjs:64`,
  the `defaultTimeoutMs` constructor default at `:139`, applied per dispatch at `:152`) is exactly
  the tunable's own default, so a run whose config was never consulted
  reports 30, is served 1 800 000 by the transport's constructor default, and passes — self-consistent
  and false. At 7 the two are distinguishable: dropping the stamp (§3.4) leaves 1 800 000 at the
  boundary against a reported 7, and a config never read leaves the report at 30 against an asserted
  literal 7. Both failures are red, and neither is derived from the code under test.
- **The two operator-owned rows are flag-only** and are not accepted from configuration at all
  (BR-CLI-2 for billing; the same rule extended to `--max-iterations`, since an unattended bound
  silently set by a config file is the failure BR-LOOP-2 exists to prevent).
- **`queue.maxIterations` unbounded is the shipped default**, and AC-1.3's promise depends on it:
  with no flag the loop is bounded only by BR-LOOP-1 and `loop.maxIterations` reports `null`. A test
  asserts `runQueueLoop`'s own `100` is never the effective value on a CLI-driven run — a defaulted
  bound reached at pass 100 would be reported as `bound-reached` on a queue the operator believed
  unbounded.

Where engine configuration *lives* remains O-3 (§9.1); this section fixes the set, the defaults and
the resolution point, none of which depend on that answer.

## 5. Error Handling

### 5.1 `lib/outcome.mjs` — one total classifier (AC-4.1, BR-FAIL-1)

The classification decision is extracted out of the transport into a new module so that it is (a)
transport-blind and (b) testable without a dispatch:

```js
export const OUTCOMES = Object.freeze([
  "ok", "retryable", "timeout", "auth-failure",
  "transport-contract-violation", "agent-reported-failure",
]);
export function classifyOutcome({ error, result, reportedFailure }): Outcome   // total: no throw
```

The mapping is by error class, which is why §3.4 requires both transports to throw the same four:

| Input | Outcome |
|---|---|
| `AuthPolicyError` (`transport.mjs:23`) | `auth-failure` |
| `RateLimitedError` (`:33`) | `retryable` |
| `TimeoutError` (`:46`) | `timeout` |
| `TransportError` (`:55`) | `transport-contract-violation` |
| no error, and `reportedFailure === true` | `agent-reported-failure` |
| no error, otherwise, with a terminal result | `ok` |

**`agent-reported-failure` has a literal predicate, and it is not `outcome.mjs`'s.** v1.0 said only
"a result whose text the module's own contract marks as a reported failure", which no fixture can be
written against; and any workable predicate is module-prose knowledge (`VERDICT:` grammar, `ERRATUM:`
lines, POSTMORTEM conventions), which R-ARCH-2 forbids a layer-0 module from holding. Both are
resolved the same way — **the predicate lives at layer 2 and `outcome.mjs` receives an already-tagged
input**:

```js
// lib/adapter.mjs (layer 2) — the only place that reads a dispatch's text
const REPORTED_FAILURE_RE = /^\s*(DISPATCH-FAILED|ERROR):\s*\S/m;
const reportedFailure = REPORTED_FAILURE_RE.test(result.text);
classifyOutcome({ error: null, result, reportedFailure });
```

The literal predicate is: **the result text contains a line whose first non-space content is
`DISPATCH-FAILED:` or `ERROR:` followed by non-space text.** Upstream fixes only the member's
*meaning* — "the dispatch ran and the agent reported failure" (`FSPEC:737`, `REQ:522`) — and
deliberately leaves the predicate to this document (BR-FAIL-2 hands the *consequence* to the
modules), so the token above is TSPEC-introduced, with no upstream id. Three consequences worth
stating,
because each is a way this could have gone wrong:

- **It is engine vocabulary, not pipeline vocabulary.** It deliberately does *not* read `VERDICT:`,
  `REVISION-COMPLETE:` or `ERRATUM:`. Those are the modules' own parses of an agent's prose, and a
  dispatch carrying `VERDICT: Needs revision` is a **successful** dispatch — the module decides what
  the verdict means (BR-FAIL-2). An engine that classified it as a failure would silently convert a
  normal review round into a retry or a halt.
- **The fixture is a transcription, not an echo.** §5.1's reverse-direction fixture for this member
  is a recorded transport result whose text begins with `DISPATCH-FAILED: …`; it is written against
  the predicate stated *here*, in the spec, not against whatever the classifier happens to look for.
  The falsifying companion is a fixture whose text merely *mentions* the token mid-line, which must
  classify `ok`.
- **`outcome.mjs` stays policy-free** (R-ARCH-2): it holds the six-member enumeration and a total
  map over `(error, reportedFailure)`, and knows nothing about phases, skills or prose.

HEAD already funnels every thrown value into those four classes: `classifyThrown`
(`transport.mjs:98`) passes the four through unchanged, maps a fired timer to `TimeoutError`
(`:107-109`), a rate-limit-shaped error to `RateLimitedError` (`:110-121`) forwarding `status`,
`rateLimitType`, `resetsAt`, `retryAfterMs` verbatim, and **everything unrecognised to
`TransportError`** (`:123`) — never to success and never to `retryable`. That last arm is the reason
`classifyOutcome` can be total without a fallback branch of its own.

Two obligations follow, and both are tests rather than code:

- **Forward (outputs ⊆ six), suite-wide.** Every `classifyOutcome` call records its result through
  §7.0's cross-process observation seam; a final step asserts that union is a subset of `OUTCOMES`.
  Scoping the assertion to the provocation corpus alone would let a seventh member appear in any
  other test unnoticed — the same accumulate-then-assert shape as the catalogue (§3.5). **This
  direction is the one that fails vacuously green** if the accumulator is not genuinely cross-process
  (`observed ⊆ OUTCOMES` holds over the empty set), which is why §7.4's mechanism is specified rather
  than assumed, and why the harness's own emptiness is a failure (§7.4).
- **Reverse (six ⊆ outputs).** A named provocation fixture per member. A member no fixture reaches
  fails the check, and the repair is a new fixture, never a loosened oracle.

`agent-reported-failure` is classified, recorded, and handed to the module unchanged (BR-FAIL-2). It
is terminal for the dispatch: never retried, consuming no attempt beyond the one that produced it. The
modules own what a failed agent response means — re-dispatch, round exhaustion, POSTMORTEM — and an
engine that retried here would silently double a review round.

### 5.2 The retry machine (AC-4.2, BR-RETRY-1…4)

HEAD implements **rate-limit pausing only**: `_agent` retries the same dispatch on `RateLimitedError`
up to `maxRateLimitPauses` (`adapter.mjs:290-318`, default 3 at `:57`) and rethrows every other error
(`:291-292`). Timeouts are not retried at all. The target machine keeps that loop's shape and
generalises its predicate:

- **One budget, `dispatch.retryAttempts` (default 3 retries after the first attempt), shared by
  `retryable` and `timeout`** (BR-RETRY-1). A timeout retry is one of the three, never an extra one.
- **A per-dispatch cap of one timeout retry** (BR-RETRY-2): a second `timeout` anywhere in the
  remaining attempts is terminal even with budget left. The cap is counted per dispatch *run*, not per
  attempt position, so it is a counter beside `attempt`, not a comparison against it. **The terminal
  reason is recorded, not just the terminality**: the last `RetryRow` (§4.4) carries
  `terminal: "timeout-cap" | "budget-exhausted"`, because FSPEC §8.2's sequence 8
  (`retryable, timeout, timeout`) ends by the cap with budget still left and is otherwise
  indistinguishable in the report from budget exhaustion.
- **Budgets are per dispatch** (BR-RETRY-4): `attempt` is a local of the `_agent` call
  (`adapter.mjs:285`, "number of pauses already taken for THIS dispatch"), so nothing accumulates across dispatches within a phase. That locality is the
  mechanism — a run-scoped counter would make one slow phase silently starve the next.
- **`auth-failure` and `transport-contract-violation` are never retried**, at any budget.

- **A `timeout` retry's delay is the backoff ladder's, with no rate-limit hints.** This is the one
  delay v1.0 left unstated. `computeRateLimitWaitMs`'s preference order is rate-limit-shaped
  (`retryAfterMs` → `resetsAt` → exponential), and a `TimeoutError` carries none of the first two, so
  a timeout retry takes the **exponential arm alone**: `dispatch.retryBackoff`'s `baseMs × 2^attempt`
  from 30 s (`adapter.mjs:58`), capped at 15 min (`:59`), with the same ≤1 s jitter (`:60`), using
  the shared `attempt` counter. Mechanically that is `computeRateLimitWaitMs` called with an error
  carrying no hints, so there is one ladder and not two. FSPEC §8.2's sequence 3 (`timeout, success`)
  is therefore testable on its timing: the fixture asserts a 30 s delay at `attempt` 0, not merely
  that a retry happened.

Delays come from `computeRateLimitWaitMs` (`adapter.mjs:75`), unchanged in preference order:
transport-supplied `retryAfterMs` if finite and positive → the remaining interval to a supplied
`resetsAt` (`< 1e12` guarded) → exponential `baseMs × 2^attempt` from 30 s (`:58`), every branch capped
at 15 min (`:59`) with ≤ 1 s of jitter added (`:60`). Because the ladder is a pure function of
`(err, attempt, options)` with `now`/`jitterFn` injected, FSPEC §8.2's pause table and its eight
sequences are transcribed into fixtures directly — the tests assert the delay, not that "a pause
happened".

**Every pause is recorded** (§4.4) with the delay actually observed, so an unattended run's wall clock
is explainable afterwards: three 30 s pauses and a 30/60/120 s ladder are distinguishable in the
report.

### 5.3 Engine-fatal stops (BR-FAIL-3)

`auth-failure` and `transport-contract-violation` end the run at exit `1` **without any module halt**:
no POSTMORTEM is written, no `halted` queue row is committed, and the feature's queue row stays
exactly as the modules last left it (typically `in-progress`). The engine never fabricates a pipeline
outcome — a POSTMORTEM it invented would be indistinguishable from one the review loop produced, and
this repo's whole halt-clearing protocol (`RESOLVED: yes` against a real `## Recommendation`) depends
on that distinction holding.

The single witness is the run report on stdout, carrying the dispatches already made and the
classification that stopped the run. Mechanically: the engine **gains** a top-level catch in
`runDev` (`run.mjs:187`, the declaration) and `runQueue` (`:228`) — **this is designed behaviour, not
observed: at HEAD `pdlc/engine/lib/run.mjs` contains no `catch` clause at all**, only the `try` at
`:159` whose `withCwd` pairing is `try/finally`. Adding it is part of this feature's edit to that file
(§8.3). The catch stamps the report (§3.6), prints it, and exits — the module is never given a chance
to write its own halt artefacts, because it is no longer running.

**The classification is scoped to rejections that *escape* the module** (TE F-37). A member of the
taxonomy is engine-fatal when it reaches that top-level catch — not whenever it is stamped on a
descriptor. A module that catches its own dispatch error keeps the run alive and the descriptor
recorded: the advisory rung's model-resolution failure is handled inside `resolveAdvisoryRung`'s
rejection arm (`orchestrate-dev.js:1856`) and re-dispatched at the `opus` rung (`:1861`), and the
non-model-resolution case is **returned** to the caller as a `{ kind: "dispatch-error" }` value
(constructed and returned at `orchestrate-dev.js:1847` and `:1857`; the caller reads it at
`:3143-3149`), never rethrown. This is load-bearing for §7.4 row 4, whose `F` carries
`outcome === "transport-contract-violation"` and is followed by a `B` **in the same run** — without
this scope a harness author would read row 4 and §5.3 as contradictory.

### 5.4 Exit-code mapping (AC-1.4, BR-EXIT-1…3)

| Code | Condition | Written where |
|---|---|---|
| `0` | the pipeline finished, or a non-dispatching surface (`doctor`, `--dry-run`) passed | `bin/pdlc.mjs:236-238` |
| `2` | the pipeline **halted or blocked at its own gate** — a normal, recorded pdlc outcome | the module's `outcome` field, mapped once |
| `1` | the **engine** refused or crashed: startup gate, auth policy, bad usage, unparseable transport output | every refusal path, uniformly |

**A halt is not a crash** (BR-EXIT-1). The modules produce a halt's record — POSTMORTEM file, `halted`
queue row, pathspec-scoped commit — and the engine's only job is to stay alive long enough for those
writes to land, then report `2`. Exiting `1` on a halt would erase the operator's ability to tell
"pdlc stopped and told you why" from "the host broke", which is the distinction the exit code exists
for.

The mapping lives in **one** function over the module's `outcome` field, called once at the top level,
so `refused`, `idle`, `no-queue`, `halted`, `blocked` and `max-passes` (`run.mjs:282`) cannot acquire
divergent codes down different paths. Under `--loop`, the loop's code is the worst iteration's,
`1` > `2` > `0` (BR-EXIT-3); since a refusal stops the loop, the worst is always the last iteration's.

**The exit code deliberately does not distinguish AC-1.3's two stop reasons**, and that is why they
need a carrier elsewhere. `idle`, `no-queue` and `max-passes` all map to `0` — correctly, since all
three are clean terminations an unattended wrapper must not treat as failures — so the code cannot
tell "the queue is drained" from "the bound was reached with work remaining". §4.5's `loop.stopReason`
and the loop's own outcome line carry that distinction (`exhausted` / `bound-reached`), and §8.1
maps AC-1.3 to both. A wrapper reading only the exit code sees a clean stop; one that must not
believe a queue is drained reads the report.

## 6. Guard Parity Design

### 6.1 What is being reproduced

`pdlc/hooks/scripts/guard-harvest-before-delete.sh` is a blocking `PreToolUse` hook on the `Bash`
matcher. Its decision procedure, read from the script itself:

1. Parse the hook's stdin JSON; **unparseable input exits 0** (`:29-30`) — the guard never interferes
   with something it did not understand.
2. Scope: the command text must mention `CROSS-REVIEW`, `CODE_REVIEW` or `ADVISORY` (`:35-36`) **and**
   match a removal form — `rm`/`unlink` at a command boundary, or `git rm` (`:37-38`).
3. Extract the protected path tokens, take the directories they live in (`:42-50`), and block the call
   when a directory holds no `LEARNINGS-*.md` (`:53-57`).
4. **Exit 2 blocks the call and feeds stderr back to the agent** (`:6`); exit 0 allows. The refusal
   prefix and bracketed directory are byte-exact because `orchestrate-dev.js` reads them.

Two properties of that procedure are the ones the engine must preserve, and neither is a spelling:
the guard is **conditional** on `LEARNINGS-*.md` (BR-GUARD-2 — harvest must still be able to delete),
and the refusal is **visible to the agent**, so it can proceed differently instead of continuing while
believing the deletion happened.

**The script itself is the guard's definition and is not rewritten** (NG-1). Both transports invoke
the shipped script and consume its exit code; a JavaScript reimplementation would be a second
definition that could drift, and "exists on the branch" would then mean two things.

### 6.2 Mechanism per transport (C-5, BR-GUARD-1)

| | Primary (`agent-sdk`) | Fallback (`claude -p`) |
|---|---|---|
| carrier | `hooks: { PreToolUse: [{ matcher: "Bash", hooks: [cb] }] }` on the `query` options (`sdk.d.ts:1545`, event name `:816`) | a per-dispatch `--settings` JSON file registering the same hook |
| callback | runs the shipped `.sh` with the tool-input JSON on stdin, maps exit 2 → deny with the script's stderr as the reason | the CLI runs the script itself; the deny path is the CLI's own |
| lifetime | the dispatch's options object — created per dispatch, never process-global | a temp file per dispatch, removed after |
| source of truth | `{pluginRoot}/hooks/scripts/guard-harvest-before-delete.sh` | the same path |

The configuration is built once, by the engine, and handed to whichever transport `resolveTransport`
chose — so the invariant is one object and the carriers are two adapters over it (R-ARCH-2: policy
above, plumbing below).

### 6.3 The provenance assertion (BR-GUARD-3)

The test that matters runs **with no pdlc hooks registered on the host** and asserts the refusal
still happens. A green test on a developer machine where the plugin's hooks are live proves nothing
about the engine — it proves the host. Mechanically the test writes `CLAUDE_PROJECT_DIR` and
`HOME`/settings into a scratch tree containing neither `.claude/settings.json` hook entries nor an
installed plugin registration.

**The execution mechanism, stated.** §7.1 forbids constructing the real SDK client or spawning a
`claude` child, and FSPEC §18.2 (AT-ENG-X3) confirms the fallback is fixture-only, so nothing here
issues a real tool call. What executes is the **deletion the guard is guarding**, driven by the test:

1. The test builds the engine's guard configuration exactly as §6.2's carrier does, extracting the
   `PreToolUse` callback (primary) or the `--settings` file's registration (fallback).
2. It invokes that callback with a synthetic tool-input JSON naming an `rm` of a `CROSS-REVIEW-*`
   file in the scratch tree — the same JSON shape the SDK passes (`sdk.d.ts:1545`).
3. **It then performs the deletion the callback's verdict permits**: on `deny`, nothing; on `allow`,
   the actual `fs.rm`. This is the step v1.0 omitted, and without it clause (b) is unfalsifiable —
   the file survives because nobody ever tried to delete it.

Each clause therefore has a falsifying counterpart, asserted in the same file, and the negative half
is written first (§7.3's AT-ENG-45 discipline):

| Clause | Positive assertion | Falsifying counterpart |
|---|---|---|
| (a) the deny | callback returns deny for `rm` of a `CROSS-REVIEW-*` with no `LEARNINGS-{f}.md` in the directory (AC-5.1) | with `LEARNINGS-{f}.md` present the same call **allows** (AC-5.2), so the guard is conditional and not a blanket refusal |
| (b) the file survives | after step 3, the file is on disk | the **same fixture with the same deletion step** under an allow verdict **removes** the file — proving the harness can delete, so survival is the guard's doing |
| (c) the agent sees the refusal | the deny's reason carries the script's stderr, byte-exact prefix and bracketed directory (§6.1 step 4) | a deliberately mis-built configuration (matcher `"Write"` instead of `"Bash"`, or the hook path pointed at a nonexistent script) produces **no deny**, and the test asserts it fails — proving the assertion is reading the engine's wiring and not a constant |

Clause (c) asserts the callback's return value, which is what the SDK feeds back to the agent; that
the SDK *does* feed it back is the SDK's contract, and the only thing that can check it on a real
run is §6.5's live measurement. That boundary is stated rather than papered over: the hermetic suite
proves the engine builds and honours the guard; the live test proves the runtime consults it.

Both directions are asserted per transport, the fallback over its recorded fixture (AC-5.1, AC-5.2).

### 6.4 Fail-closed refusal when the guard cannot be carried (EC-GUARD-4)

If the guard configuration cannot be applied on the transport a run would use, **the engine refuses to
dispatch rather than dispatching unguarded**. Because this feature ships no runtime transport selector,
a refusal on the primary transport is a refusal of the whole engine, and the message must satisfy
three obligations, asserted as three separate expectations (AT-ENG-43): it names the missing
capability, names the fallback transport as the known alternative, and states that selecting it is not
yet available. That is a state an operator can act on — measure or defer — rather than a dead end.

The check is a startup-time capability probe, not a per-dispatch surprise: it runs with the ladder's
billing-posture rung (5), so a run that cannot be guarded never gets as far as touching the repo.
**This is not rung 4a.** EC-GUARD-4 asks whether the *transport* can carry the guard configuration;
rung 4a (C-11, BR-GUARD-6) asks whether the *host* can run the shipped guard script at all. Different
question, different failure, different test — rung 4a's design is §7.8, and a reader arriving from
§8.3's `lib/startup.mjs` row should go there for it.

### 6.5 The measurement O-2 owes first (BR-GUARD-5, M-ENG-06)

`DEFAULT_PERMISSION_MODE = "bypassPermissions"` (`transport.mjs:89`) is the production posture, set
explicitly and paired with `allowDangerouslySkipPermissions` (`:170-174`). **Whether a PreToolUse deny
fires at all under that posture is unmeasured on either transport.** This is the single largest open
safety gap and the first thing implementation must measure, because a guard the bypass setting
disables would pass every well-formedness test in §6.3 and protect nothing — the tests would be
green and vacuous, which is precisely the failure mode this repo has already paid for once.

The measurement is a live, opt-in test (§7.5) dispatching a real deletion attempt under the
production posture. Its result determines the design, and the branches are pre-committed so that a
red measurement does not become a design debate:

| Measured | Consequence |
|---|---|
| deny fires under `bypassPermissions` | §6.2 stands as written |
| deny does not fire | the posture and the guard are **one decision, not two**: either the posture tightens (drop the bypass, enumerate `allowedTools`) or the guard moves to a mechanism the posture cannot disable (the SDK's `canUseTool` callback, which is consulted on the tool-use path rather than registered as a hook) |

**The measurement leaves a durable record, and the hermetic suite reads it.** A live-only test
records nothing: on a fresh clone `bypassPermissions` (`transport.mjs:89`) and a hook-based guard
coexist with no artefact saying whether that combination was ever measured, on which platform, or
against which SDK version — and C-9 makes per-platform measurement a constraint. So the live test's
last act is to append a dated row to `docs/_constraints/pdlc-engine-baseline.md`, in the same
`M-ENG-*` form this repo already uses (`DEFAULT_PERMISSION_MODE`'s own comment at
`transport.mjs:70-89` is the precedent for recording a measured runtime fact beside the code):

**M-ENG-09 — PreToolUse deny under `bypassPermissions`**, columns
`date | platform | transport | sdkVersion | denyFired`.

Two assertions in the **hermetic** suite make the record load-bearing rather than decorative:

- **The shipped mechanism matches the recorded verdict.** If a row records `denyFired: no` for the
  current platform, a hermetic test fails while §6.2's hook carrier is still the shipped mechanism —
  the red gate that forces the §6.5 branch to be taken rather than noted.
- **Unrecorded is red, not silent** (PM Q-03, TE Q-05). With no M-ENG-09 row for the running
  platform, the hermetic suite **fails** with a catalogue-registered message naming the missing
  measurement. This is deliberate: an absent measurement is exactly the state in which the guard's
  well-formedness tests are green and prove nothing, so it must not be the state a clean CI run
  reports. The failure names the opt-in command that produces the row.

**Ordering matters for the PLAN, and the rule has to be stated in terms a task can actually
discharge.** An earlier draft required "the gate and the first M-ENG-09 rows, one per CI platform,
land in the *same* task". That is unsatisfiable as written: the row is produced only by the **opt-in,
credentialed live test** (§7.5), and **nothing in CI ever runs it** (§7.6 — no CI job dispatches a
model call or reads a credential), so no mechanism inside the task yields a row for a platform the
implementer is not sitting on. The satisfiable rule is:

| Obligation | Who discharges it | When |
|---|---|---|
| the gate, and the M-ENG-09 row for the **implementing host's own `process.platform`** | the task, mechanically — run the opt-in command, commit the row | same task as the gate, so the task never lands a state its own suite calls red |
| a row for any **other** `process.platform` | the maintainer, by hand, on a host of that platform | before unattended use on that platform (BR-GUARD-4) — never producible by CI |

The gate is keyed on `process.platform`, not on §7.6's matrix (O-ENG-T4), so the two obligations are
independent: the task's own platform is always covered, and an uncovered platform is exactly the
`unrecorded is red` state on the host that lacks a row — which is the honest report, not a CI
failure the task could have prevented. Introducing the gate *without* the local row would leave the
pipeline red for a reason unrelated to the change that turned it red; that is what the first row
above forbids. O-ENG-T5 remains the open question of what an off-matrix host should do with that red.

**What the gate asserts about the row, stated as one clause** (TE Q-19). Presence keyed on
`process.platform` is necessary but not sufficient: the gate asserts **presence *and* that the
recorded `denyFired` value is consistent with the shipped mechanism**. Concretely — `denyFired: yes`
with §6.2's hook carrier shipped is green; `denyFired: no` with the hook carrier still shipped is
**red**, because that is exactly the state the second branch of the table above exists to force out;
`denyFired: no` after the posture has been tightened or the guard moved to `canUseTool` is green
again, because the recorded fact and the shipped mechanism now agree. So the gate is never green on a
negative measurement that the code has not responded to. This matters because the alternative —
green on any row, including one recording *guard did not fire* — would make every well-formedness
test in §6 vacuous, proving only that a file has a line in it.

Until that measurement exists, §6's tests are the *shape* of the answer, not the answer, and an
engine run can delete review history the plugin path would have protected. **A plan schedules this
before any unattended use** (BR-GUARD-4).

Note the guard's own denial-blindness interacts here. `adapter.mjs:320-341` already logs and tallies
permission denials precisely because a dispatch whose tool calls were denied still terminates as a
success with prose claiming the work was done — the agent is not told. A guard deny that the agent
cannot see would reproduce that failure exactly, which is why "the agent sees the refusal" is an
asserted property in §6.3 and not an implementation detail.

## 7. Test Strategy

The suite is `node --test` under `pdlc/engine/`, no test framework beyond the runtime's. Everything
below is a mechanism, not an aspiration: each subsection names the seam that makes the property
assertable.

### 7.0 How the suite is invoked (the decision §§3.5, 5.1, 7.1, 7.4 all depend on)

`node --test` runs **each test file in its own child process** (measured on this repo's node
v20.20.1: a file writing to a shared module-scoped `Set` prints size 1 from one pid, a second file
importing the same module prints size 0 from another), and gives **no ordering guarantee across
files**. v1.0's "a module-scoped accumulator read by a test file that runs last by name ordering"
is therefore not a mechanism at all, and its failure mode is asymmetric and dangerous: the outcome
harness's forward direction (`observed ⊆ OUTCOMES`) would pass **vacuously green over the empty
set** — precisely the failure §5.1 exists to prevent — while the catalogue's set-equality would fail
permanently. So the invocation is fixed here, once:

```json
"scripts": {
  "test": "node __tests__/_run-suite.mjs"
}
```

**The run id is minted by the runner, before any child exists — not by the bootstrap on first use.**
This is the one detail v1.1 got wrong, and it is worth stating why, because the mechanism looks
correct until it is measured. `--import=./__tests__/_bootstrap.mjs` is preloaded into **every** test
file's own child process (§7.1), and each of those processes is a sibling: an environment variable a
child assigns is visible to that child alone, never to its siblings and never to its parent. A
bootstrap that mints `PDLC_TEST_RUN_ID` "on first use" therefore mints a *different* id in every test
file's process, and `_assert-suite-wide.mjs` — itself a fresh process — mints a further one. Each
process writes into its own run directory and the final step reads a directory holding at most its
own records. That fails loudly rather than passing vacuously, because §7.0's emptiness guard catches
it — but it fails **by construction on every run**, and the tempting repair under time pressure is
to scan all run directories and drop the emptiness guard, which walks straight back into the vacuity
this section exists to prevent. So the fix is at the point the id is minted, not the point it is read.

`__tests__/_run-suite.mjs` does four things in order, and nothing else:

| Step | Action |
|---|---|
| 1 | mint one `PDLC_TEST_RUN_ID` and derive `PDLC_TEST_RUN_DIR` from it |
| 2 | create the run directory empty, removing any prior contents, so a stale record from an earlier run can never be counted as this run's observation |
| 3 | spawn `node --test --import=./__tests__/_bootstrap.mjs __tests__/` with that id in its environment, stdio inherited — **every** test-file process is a descendant, so all inherit the one value |
| 4 | on success only, spawn `node __tests__/_assert-suite-wide.mjs` with the same environment, and exit on its status |

A Node runner rather than `PDLC_TEST_RUN_ID=$(…) node --test … && …` in the npm script: the shell
form is the same fix and was the alternative considered, but it puts the assignment in shell syntax
`cmd.exe` does not accept, and it gives step 2 no ordered home. The runner keeps the whole decision
in one file a test can drive directly.

**A self-test proves the inheritance rather than assuming it** (the check TE F-18 asks for): two
deliberately separate test files each write one observation record, and an assertion — run in the
final step — requires that both records are found in **one** run directory, and that the directory
count for the run is exactly one. Two directories, or one directory holding one record, fails. This
is the property the whole cross-process mechanism rests on, and it is the property that was silently
false in v1.1, so it is asserted directly instead of being implied by the harnesses that consume it.

Three parts, each doing one job:

| Part | Job | Why it must be this |
|---|---|---|
| `--import=./__tests__/_bootstrap.mjs` | preloads into **every** test-file process: §7.1's construction guard and socket trap, and the observation writer below | a bootstrap that is merely `import`ed by some test files is installed only in those files' processes; `--import` is the only thing that makes "a new test file inherits it without opting in" true |
| observation directory | each process appends its observations as JSON lines to `${PDLC_TEST_RUN_DIR}/{pid}.jsonl`; the run dir is keyed by `PDLC_TEST_RUN_ID`, **minted once by the runner and inherited by every descendant** (above) — the bootstrap only ever *reads* it, and fails loudly if it is unset rather than minting a private one | append-only per-pid files need no locking and survive concurrent processes, unlike a shared file or a socket |

**Append-only fixes *when* an observation may be written, not just how** (PM F-01, TE F-30). A line
is never revisited once appended, so any observation with a terminal half must be appended after
that half exists. For §7.4's dispatch descriptors this is stated in §4.1: one line per dispatch
*attempt*, appended when the attempt **settles**, carrying that attempt's `outcome` and `errorText`.
**Every dispatch line is a settlement line** — the accumulator hangs off `_agent`
(`lib/adapter.mjs:271`) and not off `composePrompt` (`:259`), so the composed-but-never-dispatched
case writes nothing rather than writing a `null`-terminal line (§4.1, `bin/pdlc.mjs:190`;
`FSPEC:682-684`). The other two accumulators (message ids, §3.5;
`classifyOutcome` results, §5.1) have no terminal half and are appended at their one call.
| step 4, `node __tests__/_assert-suite-wide.mjs` | reads the union of every `.jsonl` and makes §7.4's assertions | a *step*, not a test file, so it is ordered by the runner rather than by filename luck, and it runs once per suite by construction |

**The two `_`-prefixed helpers live in `__tests__/` without being collected as test files** (TE Q-07).
`node --test {dir}` collects only files matching its test-file naming convention, and
`_bootstrap.mjs` / `_assert-suite-wide.mjs` match none of them — measured on this repo's node
v20.20.1: a directory holding `a.test.js` and `_helper.mjs` reports `# pass 1` and never executes the
helper. So the helpers are reachable by path (`--import`, and step 4's explicit argument) while
staying outside the collected suite, and no `_`-prefixed file needs to be moved out of `__tests__/`
or guarded against double execution.

`--test-concurrency=1` plus a single-process entry file was the alternative considered; it was
rejected because it serialises the suite for a property that does not need serialisation, and
because it leaves the ordering assumption in place rather than removing it.

**The final step's own emptiness is a failure.** If the observation directory is missing or holds no
records, `_assert-suite-wide.mjs` exits non-zero naming that, rather than asserting over an empty
union — the one guard that stops the whole mechanism from degrading back into the vacuous green it
was introduced to prevent. A self-test asserts exactly that: run the step against an empty scratch
run dir, expect failure.

### 7.1 Hermeticity, observed rather than asserted (AC-6.1, BR-VER-1)

Three layers, in increasing order of paranoia:

1. **Seam construction.** Every test builds a transport through `createTransport({ queryFn })`
   (`transport.mjs:135`); the SDK's own `query` is reached only by `defaultQueryFn` (`:17`), which
   imports the SDK lazily. A test that omits `queryFn` gets the real client.
2. **Construction guard.** A guard fails the run on any attempt to construct the real transport — the
   SDK client *or* a `claude` child spawn. It is installed by `__tests__/_bootstrap.mjs`, preloaded
   into every test-file process by `--import` (§7.0), which is what makes "a new test file inherits
   it without opting in" true rather than aspirational.
3. **Socket trap.** The same preloaded bootstrap patches `net.Socket.prototype.connect` (and the
   `tls` path) to fail the suite on any outbound connection attempt.

Layers 2 and 3 exist **per process**, not suite-wide, and that is the correct scope: each is a trap
in the process that could violate hermeticity. What must be suite-wide is only the *observation* of
§7.4's set properties, which §7.0 handles separately.

**The trap is itself tested**: one test deliberately attempts a connection and expects to trip it
(AT-ENG-63). A trap that never fires is indistinguishable from one that was never installed — the
same vacuity argument as §3.5's catalogue and §5.1's classifier, and the reason none of these three
properties is left to a comment.

`--dry-run-skill` (`bin/pdlc.mjs:171-172`) composes a prompt without dispatching, so the whole prompt
corpus is reachable hermetically, and the CLI's own surface is testable without a transport at all.

### 7.2 Fixtures per transport (AC-6.3, BR-VER-2)

One fixture set per transport, recorded from that transport's real output: SDK message streams
(`system/init` with `apiKeySource`, `rate_limit_event`, terminal `result`) and `claude -p`
stream-json lines. The SPIKE (`docs/pdlc-headless-engine/SPIKE-agent-sdk-auth.md`) is the first such
recording. Refreshing a set against a newer SDK or CLI is a documented, repeatable step —
a `__tests__/fixtures/README.md` naming the command and the redaction rules — rather than a rewrite,
because the fixtures are the only thing standing between a transport upgrade and a silent contract
change.

Fixtures are redacted of account identifiers at recording time; no fixture may contain a credential.
**The scanner that checks this is paired with a positive control in the same test**, because an
absence-only scan passes identically whether its pattern is right, wrong or empty. Both halves:

| Half | Assertion |
|---|---|
| negative | the scan over `__tests__/fixtures/` finds no match |
| positive | the **same scanner**, run over a scratch file the test writes containing one deliberately key-shaped string, **must** flag it — asserted in the same test, so a broken pattern fails here instead of passing silently over the fixtures |

The pattern is named in the spec rather than left to the implementation: `sk-ant-` followed by ≥20
characters of `[A-Za-z0-9_-]`, plus any assignment of `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN`
to a non-empty value. The redaction rules `fixtures/README.md` documents are the same list, and the
positive control carries one instance of each rule, so "the README's rules" and "the scanner's
pattern" are asserted equal rather than assumed to be.

### 7.3 The parity oracle and its write-replaying double (AC-1.1, BR-PARITY-3/4/5)

The oracle asserts that an engine run produces the same artifacts a Claude Code run does. Its
correctness depends entirely on the double:

- **A double that only returns a response string leaves `docs/{f}/` empty**, and every structural
  clause passes on nothing. So the double **replays each dispatch's file writes from its fixture** —
  for a reviewer dispatch, creating the cross-review file the prompt names, with the fixture's
  `VERDICT:` line and counts — reproducing the creation events a real agent would have produced.
- **A fixture is bound to a dispatch by `(skill, phase, round index)`** — §4.1's phase, from the
  `_phase` run state, which is what makes this key available at all — **never by skill alone**
  (TE Q-03). Keying on skill would make a round-2 reviewer dispatch replay round 1's writes, so the
  double would overwrite `CROSS-REVIEW-{role}-{doc}-v1.md` instead of creating `-v2.md` — breaking
  the append-only property `deriveRoundWindow` (`orchestrate-dev.js:2151`) reads from the directory
  listing, *inside the oracle meant to prove parity*. The double derives the round index the same
  way the module does, from the directory listing, and a test asserts that two successive reviewer
  dispatches for one document produce two files rather than one rewritten one.
- **The double must *not* write the approval anchors.** `APPROVAL-HASH:` / `REVIEWED-COMMIT:` are the
  module's own write (`orchestrate-dev.js:6190`, through `_appendFile`, after its own pre-count
  check). A double that wrote them would make the anchor clause assert the fixture's bytes instead of
  the module's append logic — the exact vacuity BR-PARITY-5 exists to prevent.
- **The oracle observes creation events, not the surviving tree** (BR-PARITY-4): Phase H deletes
  harvested `CROSS-REVIEW-*` / `CODE_REVIEW-*` files once the LEARNINGS commit is confirmed, so a
  harvested file's later absence is not a failure. The double records a creation log and the clauses
  read that log.
- **The negative half is asserted first** (AT-ENG-45): a write-less double must *fail* this test.
  Without that, a later refactor could silence the oracle and the suite would stay green.

### 7.4 Set-equality harnesses

Five suite-wide assertions share one shape — accumulate through a seam across the whole suite,
assert once at the end — because per-test assertions go vacuous the moment a test is skipped. They
run on **three accumulators**, not five (TE F-33): the catalogue, the outcome taxonomy and the
model-map accumulator each own one; the dispatchable-skill property owns none (it is computed once
from imported data); and the fifth property (§4.1's pre-phase bucket) rides the model-map
accumulator. All five are listed here rather than left in prose, because this table is the checklist
`_assert-suite-wide.mjs` is built from (TE F-29):

| Property | Seam (writes a record per observation) | Assertion in `_assert-suite-wide.mjs` |
|---|---|---|
| message catalogue (§3.5) | `message(id, …)` records the id | emitted ids ≡ `messageIds()` |
| outcome taxonomy (§5.1) | `classifyOutcome` records its result | observed ⊆ `OUTCOMES`, and provocation fixtures ⊇ `OUTCOMES` |
| **pinned model map (§4.1, AC-3.3)** | the adapter appends one line per dispatch *attempt* at **settlement** (§4.1, §7.0), carrying that `DispatchDescriptor`'s `{ corpusRun, seq, skill, phase, model, attempt, outcome, errorText, promptHash }`; **every line is a settlement line** — there is no composition-time line and no `null`-terminal line (§4.1) | AC-3.3's two directions verbatim: **every recorded model value appears in M-ENG-07's model column**, and **every one of M-ENG-07's seven rows is witnessed by ≥1 descriptor**, per the witness table below |
| dispatchable skills (§3.3) | not an accumulator — computed once from imported data | both directions, §3.3's table |
| pre-phase window (§4.1) | the same model-map accumulator, read on its `phase` field | **no record with `corpusRun != null` has `phase === null`** — `corpusRun` is the field that scopes the assertion to run-shaped tests (PM F-02), and `phase === null` is the record-level predicate (PM F-03, TE F-35). Reader-facing gloss: `byPhase["(no phase)"]` is absent or `0` on every corpus run |

**The model-map row is new in v1.1** and closes AC-3.3, which v1.0 left owned by verbatim
pass-through alone. `adapter.mjs:271` forwarding `model` untouched is necessary and correctly
designed, but it proves neither direction: a phase that silently stopped pinning a model would pass
a pass-through test, and a model reaching a phase no row names would too. So it needs an accumulator
of its own. The forward direction catches a new model; the reverse catches a phase that stopped
pinning — the failure that motivated the criterion.

**The assertion is AC-3.3's two directions, not a set-equality over `(phase, model)` pairs.** v1.1
wrote the stronger-looking form, and it is not writable — it would have been red on correct code for
three separate reasons, and the only available repair would have been to loosen the oracle, the exact
vacuity §3.3 argues against:

- **M-ENG-07 row 1 is a quantified statement, not a pair.** "Every phase except Phase I → `opus`"
  (`docs/_constraints/pdlc-engine-baseline.md:132`) expands to one pair per phase label, so a literal
  `pairs ≡ rows` comparison compares a dozen observations against one row and fails in the forward
  direction for reasons unrelated to any defect. Row 1 is asserted as the quantifier it is.
- **Rows 1 and 4 are indistinguishable by `(phase, skill, model)`.** The advisory fallback dispatches
  `ADVISORY_RUNG_SKILL` (`se-review`) on `opus` from inside `runAdvisorySeam`
  (`orchestrate-dev.js:1841`, reached again for the fallback at `:1861`), which is descriptor-identical
  to an ordinary `opus` `se-review` reviewer dispatch. Without a discriminator, corpus run iv passes
  while the fallback branch never executed — precisely the failure AC-3.3 names.
- **Rows 6 and 7 carry no phase distinction and no label at all.** Both `haiku` sites pass `{ model }`
  alone (`:7463` verdict recovery, `:9968` PLAN-DAG extraction), so `label` cannot separate them
  (§4.1); `skill` plus the provoking fixture can.

**Each row's witness is transcribed literally**, which is what makes the reverse direction writable
without a field the run cannot produce. `corpusRun` is supplied by the harness — it configures the
run, so it knows which of M-ENG-07's five it is executing. `promptHash` is a stable digest of the
descriptor's composed `prompt` (sha-256, first 16 hex), recorded instead of the prompt so the
cross-process accumulator (§7.0) carries a bounded record; only equality between two hashes is ever
read, never the hash's value. **No witness reads `seq` as an adjacency**; row 4 reads it only as a
direction (`B.seq > F.seq`), which holds however many dispatches interleave, and the one row that
leaned on adjacency is corrected below:

| M-ENG-07 row | Model | Witness predicate over the recorded descriptors |
|---|---|---|
| 1 every phase except Phase I | `opus` | **quantified, not existential**: in run i, *every* descriptor **outside the Phase-I wave set** (defined below) has `model === "opus"` (and ≥1 such descriptor exists) |
| 2 Phase I implementation waves | `sonnet` | in run i, *every* descriptor **inside the Phase-I wave set** has `model === "sonnet"` (and ≥1 exists) |
| 3 advisory-tier dispatch | `fable` | in run iii, ≥1 descriptor with `skill === ADVISORY_RUNG_SKILL` and `model === "fable"` |
| 4 advisory fallback | `opus` | in run iv, **a pair** `(F, B)` of recorded descriptors with `F.skill === B.skill === ADVISORY_RUNG_SKILL`, `F.promptHash === B.promptHash`, `B.seq > F.seq`, `F.model === "fable"`, `F.outcome === "transport-contract-violation"` (the exact member, derived from the spec below — not `!== "ok"`, TE F-32) and `F.errorText` containing the literal message run iv's fixture injects, and `B.model === "opus"`. `F` is a **settlement line** (§4.1); every conjunct is a recorded field; the discriminator is the re-dispatched prompt plus the recorded failure, not `seq` adjacency (see below) |
| 5 queue Phase-0 triage | `sonnet` | in run ii, ≥1 descriptor with `phase === "Queue"`, `skill === "se-author"`, `model === "sonnet"` |
| 6 verdict-recovery re-emit | `haiku` | in run v(a) — the malformed-`VERDICT` fixture — ≥1 descriptor with `model === "haiku"` and a reviewer `skill` |
| 7 PLAN-DAG extraction | `haiku` | in run v(b) — the unparseable-task-table fixture — ≥1 descriptor with `model === "haiku"` and `skill === "se-author"` |

Rows 1 and 2 being quantified is what preserves the property the pair form was reaching for: a phase
that stopped pinning is caught by row 1's *every*, not by a missing pair. The forward direction stays
a plain containment over model values, which is total and needs no normalisation.

**Rows 1 and 2 partition on the Phase-I *wave set*, not on the normalised phase string** (TE F-22).
v1.2 wrote `phase !== "Phase I"` / `phase === "Phase I"`, and that transcription is red on correct
code: Phase I's V-wave — the PROPERTIES-tests dispatch appended to the wave sequence — is *announced*
as `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")` (`orchestrate-dev.js:10248`), so it
normalises to `"Phase PT"` under §4.1's prefix rule, while it is *pinned* on `MODEL_IMPLEMENTATION`,
i.e. `sonnet` (`:10253`). Row 1's *every* would be falsified by a correct dispatch and row 2 would
miss it. M-ENG-07's prose ("Phase I implementation waves", `pdlc-engine-baseline.md:132-133`) covers
that dispatch fine; it is the mechanised transcription onto the normalised phase that breaks, which
is exactly the class of translation defect this section exists to catch — and §4.1's normalisation is
*not* changed to hide it, because the announcement is honest run provenance and `byPhase` should keep
reporting it as `"Phase PT"`.

The set is therefore defined once, over recorded descriptor fields the harness already has:

> **Phase-I wave set** = descriptors with `phase === "Phase I"`, **plus** the V-wave descriptor:
> `phase === "Phase PT"` **and** `skill === SKILL_SE_IMPLEMENT`. Every other descriptor is outside it.

**Rows 1 and 2 are scoped "in run i" for a reason, and widening them to the corpus would be red on
correct code** (TE Q-12). The `haiku` PLAN-DAG extraction dispatch (`orchestrate-dev.js:9968`) is
composed *after* `phaseFn("Phase I: Implementation")` (`:9951`), so it records `phase === "Phase I"`
and therefore falls **inside** the wave set while carrying `model === "haiku"` — row 2's *every*
would be red on it. It cannot arise in run i: it is the fallback taken only when `parsePlanTasks`
returns no tasks (`:9959-9962`), and run i's fixture PLAN parses, which run i asserts directly —
**zero descriptors with `model === "haiku"` in run i**. That assertion covers **both** `haiku` sites,
so run i's fixture owes a second property, stated here rather than left implicit (TE F-34):
`recoverVerdict` (`orchestrate-dev.js:7454`, dispatching on `haiku` at `:7463`, called at `:5992` and
`:6001`) fires only for a reviewer whose `VERDICT:` trailer is missing or malformed, so **run i's
reviewer fixtures emit well-formed trailers throughout** — the same fixture property run v(a)
deliberately violates to witness row 6. Both `haiku` routes are therefore closed in run i by fixture
content, not by luck, and the "zero `haiku`" assertion is a real check on the fixture rather than a
restatement of it. Run v(b) is where the PLAN-DAG site is witnessed (row 7),
and rows 1/2 do not range over that run. This is recorded next to the wave-set definition for the
same reason the memoisation note sits next to rows 3/4: the tempting "improvement" is to quantify
rows 1/2 over the whole corpus, and it is wrong.

That second clause is exact in run i rather than approximate, because **run i drives wave mode**, and
this is the fixture decision v1.2 left unstated — the other half of F-22. Wave mode is selected by
one condition, transcribed as written (`orchestrate-dev.js:9995`, PM F-03/TE F-28):
`const waveMode = Boolean(iOwnership) && iContract !== null && iContract.ok === true;` — i.e. the
PLAN carries a valid file-ownership manifest (the `iContract !== null` conjunct is implied by the
first, since `iContract` is `null` exactly when `iOwnership` is falsy — `:9994` — but this section's
whole claim is that transcriptions are exact). The legacy worktree path is reachable by
exactly one route, a PLAN approved before the manifest requirement with Phase P skipped on a recorded
approval (`:9987-9990`). **Run i's fixture repo therefore ships a PLAN with a valid ownership
manifest and a `implementation.testCommand` in `.claude/pdlc.config.json`**, so the run takes wave
mode and the script-owned gate (`:10099-10100`). Two properties of that config file are fixed here
rather than left to implementation time: the `testCommand` is a **local node script that exits `0`
and touches nothing outside the fixture repo** — never this repository's own suite, which §7.1's
hermeticity guard would in any case not permit (PM Q-01) — and `dispatch.timeoutMinutes` is **`7`**,
the non-default value §4.6's effective-timeout oracle asserts as a literal `420000` at the transport
boundary. Two further consequences the harness makes explicit rather
than trusting:

- **The mode is asserted, not assumed.** Run i's assertions include ≥1 descriptor with
  `phase === "Phase I"` and ≥1 with `phase === "Phase PT"` and `skill === SKILL_SE_IMPLEMENT` — the
  V-wave. The two Phase-PT dispatch sites are mutually exclusive within a run: wave mode's V-wave
  (`:10248`→`:10253`, `MODEL_IMPLEMENTATION`) sits in the `waveMode` branch and the legacy path's
  Phase PT (`:10068`, announced `"Phase PT: PROPERTIES Tests"`, no `model` option and therefore Opus)
  in the `!waveMode` branch. Had run i's fixture silently drifted into legacy mode, the V-wave clause
  would be picking up an Opus dispatch and row 2 would be red — a loud failure, not a quiet
  reinterpretation.
- **Legacy mode is out of scope for rows 1 and 2, and named as such.** No corpus run drives it, so no
  row asserts over it. Pinning legacy Phase PT is not an AC-3.3 obligation — M-ENG-07's row 2 speaks
  of implementation *waves*, which the worktree path does not run — and a future corpus run vi for the
  exception path would need its own witness rows, not a widening of these.

**Row 4 drops `seq` adjacency and keeps the forced-failure provenance** (TE F-23). Requiring the
fallback descriptor's "immediately preceding descriptor by `seq`" to be the same skill on `fable` is
a flakiness source the row does not need: `seq` is §4.1's *run-wide* dispatch index, and adjacency in
it holds only if no other dispatch is composed across the hop from `dispatchAt(MODEL_ADVISORY)` to
`dispatchAt(MODEL_ADVISORY_FALLBACK)` (`orchestrate-dev.js:1851`→`:1861`) — which nothing in this
design establishes, since run iv is a whole pipeline run and the A3/A4 seams sit in Phase DOD beside
the verifier and remediator dispatches. What replaces it is the forced failure **as a recorded
field**, paired with the re-dispatched prompt — v1.3 kept the failure as prose, which is the half
F-26 rejected and the next paragraph repairs. **The error is raised by
the `fable` dispatch, not the `opus` one** — `:1861` is reached only behind `isModelResolutionError`,
so the fallback descriptor is the *consequence* of the failure and never its source; v1.2's second
"whose" was ambiguous on exactly this point and an implementer reading it as the `opus` descriptor
would have written an assertion that is never true.

**What pairs the two descriptors is the re-dispatched prompt, and it is a recorded field** (PM F-01,
TE F-26). v1.3 replaced the adjacency with the prose "recorded within the same advisory-seam
invocation", which no harness can evaluate: the seam is `orchestrate-dev`'s, the engine never sees an
invocation identity, and stamping one would mean editing a workflow module — the thing §8.3's
boundary forbids. An implementer could only write the computable residue, "∃ `se-review` descriptor
on `opus`", which every pipeline run satisfies whether or not `:1851`→`:1861` exists. The link the
engine *can* record is that **the fallback re-dispatches the same prompt**: `dispatchAt` closes over
one `prompt` (`orchestrate-dev.js:1840-1842`) and both rungs go out through it, so `F` and `B` are
byte-identical in the composed prompt (`promptHash`) while differing in `model` — a pairing no
ordinary reviewer dispatch produces, because it has no `fable` sibling at all, let alone one carrying
a model-resolution rejection in `errorText`. Seven properties of this witness are worth stating,
because they are what F-26 asked for and what a fixture author has to satisfy:

- **It is falsified by the deletion it exists to catch.** Delete `:1851`→`:1861` and no `B` exists
  for the `fable` `F`: the pair is empty and row 4 is red, where the residue predicate stayed green.
- **It reads no ordering beyond `B.seq > F.seq`.** That conjunct is a direction, not an adjacency —
  it holds no matter how many dispatches interleave, so TE F-23's flakiness cannot return through it.
  The `seq` values themselves are compared, never counted.
- **`F.outcome` names the exact member, and the member is derived from the spec** (TE F-32). The
  `fable` dispatch rejects, so the adapter stamps `classifyOutcome`'s member and the verbatim
  message (§4.1). Which member is decidable from §5.1 without reading the classifier: a
  model-resolution rejection is none of the three named transport classes (`AuthPolicyError`,
  `RateLimitedError`, `TimeoutError`), so `classifyThrown`'s unrecognised arm maps it to
  `TransportError` (`transport.mjs:123`) and §5.1's table maps that to
  **`transport-contract-violation`**. Row 4 therefore pins the literal member rather than the
  complement of `ok`: `!== "ok"` would also pass a fixture that regressed into injecting a timeout or
  an auth failure, i.e. a run that never exercised model resolution at all. If run iv's fixture is
  ever changed to inject a rejection of a different class, the row's literal is what makes the change
  visible instead of silently absorbed.
- **The derivation runs through `classifyThrown`, so the injection point is part of the row** (PM
  F-02, TE F-38). `classifyThrown` lives in the real transport, so the pinned member appears only if
  run iv's rejection *enters through* one: run iv injects at **`queryFn`**, building its transport
  with §7.1's own construction rule `createTransport({ queryFn })` (§7.2), and the adapter under test
  is the real one. A fixture that instead substituted a transport double would bypass
  `classifyThrown` entirely and the pinned literal would be red on correct code — the failure mode
  TE F-32 asked for the pin to prevent. The injected rejection must also satisfy
  `isModelResolutionError` (`orchestrate-dev.js:1791-1792`), whose `MODEL_ERROR_RE` (`:1780-1781`)
  tests the *message*: one rejection carrying a message like `unknown model "fable"` satisfies both
  obligations at once — `classifyThrown`'s unrecognised arm maps it to `TransportError`
  (`transport.mjs:123`) so `F.outcome` is the pinned member, and the same message trips
  `MODEL_ERROR_RE` so `:1856` takes the fallback arm and `B` exists at all. Neither obligation is
  optional: a `TimeoutError` would fail the first, a `TransportError` reading `boom` would fail the
  second and row 4 would be red with no `B` to pair.
- **Run iv continues; it does not exit `1`** (TE F-37). §5.3 classifies
  `transport-contract-violation` as engine-fatal — it "ends the run at exit `1` without a module
  halt" — and row 4 requires an `F` carrying that member followed by a `B` on `opus` **in the same
  run**. The two reconcile on *escape*: §5.3's catch — which this feature **adds** at the top of
  `runDev` (`run.mjs:187`) and `runQueue` (`:228`); HEAD has no `catch` in that file — means the
  classification applies to a rejection that reaches the engine's
  top-level catch, and the advisory rung's rejection never gets there. `resolveAdvisoryRung` handles
  it inside its own `.then` rejection arm (`orchestrate-dev.js:1856`), re-enters at the `opus` rung
  (`:1861`), and where a rejection *is* not a model-resolution one it is turned into a
  `{ kind: "dispatch-error" }` **value** the caller consumes as a loop continue
  (`orchestrate-dev.js:3143-3149`) rather than rethrowing. So run iv's fixture asserts a run that
  survives the failure: the descriptor is recorded, the exit code is the run's ordinary one, and a
  run that ended at exit `1` after `F` would be the regression, not the expectation.
- **The failure half is paired with a positive conjunct on the same record**, so the pair is not an
  absence-only oracle: `F.errorText` must contain the literal string the fixture injects — a
  transcription of the fixture, not an import of `MODEL_ERROR_RE` (`orchestrate-dev.js:1780`), which
  would make the test agree with the module by construction.
- **The pair reads settlement lines, and retries do not disturb it** (PM Q-02, TE Q-14). One line is
  appended per *attempt* (§4.1), so a rate-limit retry of the `fable` rung appends a second
  `F`-shaped line under the shared `seq`; the predicate is existential, so extra `F` candidates can
  only help it, and no count of `fable` failures is asserted — counting would couple the row to the
  seam's retry scheduling, which is the flakiness TE F-23 removed. `promptHash` is the digest of the
  descriptor's `prompt` field, i.e. the **composed** prompt `composePrompt(skill, prompt)` produces
  (`adapter.mjs:273`), not the module's raw argument (TE Q-13); the fallback re-dispatch composes the
  same skill and the same raw prompt, so the two hashes agree by construction of `dispatchAt`
  (`orchestrate-dev.js:1840-1842`).

**The fifth suite-wide assertion is the pre-phase bucket, and it is written over records rather than
over the report** (§4.1, PM Q-01/TE Q-10). The predicate `_assert-suite-wide.mjs` implements is **no
record with `corpusRun != null` has `phase === null`**; `byPhase["(no phase)"]` is the reader-facing
gloss, and it is a gloss because `byPhase` is §4.4's *report* projection — `"(no phase)"` is the key
that projection substitutes for `null`, and it never appears in a `.jsonl` line (PM F-03, TE F-35).
Two fields carry the scope, and both are on every record: `corpusRun` is harness-supplied (it names
which of the five run configurations is executing), so `corpusRun != null` is exactly "this record
came from a run-shaped test" and excludes the unit tests that construct an adapter directly and
dispatch without announcing a phase (PM F-02) — those legitimately record `phase === null` and must
not turn the row red. **The filter is essential, not defensive** (TE Q-15/Q-16): `_bootstrap.mjs` is
`--import`ed into *every* test-file process (§7.0), and the adapter those unit tests build is the
real one, so their descriptors do land in `${PDLC_TEST_RUN_DIR}` alongside the corpus runs'. Drop
`corpusRun != null` and the row goes red on a correctly-behaving unit test. This stays true under
the settlement-only rule above: those unit tests dispatch through fixture transports, so their lines
settle like any other. It is a row of the property table above, not a note beneath it (TE F-29), so
the table, §8.3's row for `_assert-suite-wide.mjs` and the module itself enumerate the same five
things. It rides the model-map accumulator rather than owning one, because `phase` is already on
every record. Listing it makes it an assertion rather than a reported number nobody fails on — the
first dispatch that drifts ahead of its phase banner is red.

**Row 3's and row 4's advisory predicates are existential on purpose** (PM Q-02). `runAdvisorySeam`'s
own model choice is memoised in `_state.resolved` (`orchestrate-dev.js:1844`): once a rung has
resolved, every later seam invocation dispatches straight at the memoised model (`:1845`) and the
`fable`→`opus` fallback branch (`:1851`→`:1861`) is never re-entered. A future revision that
"strengthened" rows 3/4 into a quantifier over all `ADVISORY_RUNG_SKILL` descriptors would therefore
be red on correct code — the later descriptors carry the memoised model with no failure behind them,
and ordinary reviewer dispatches share the identifier entirely. The memo is left here because
that is the shape of strengthening a later author is most likely to attempt.

Its corpus is M-ENG-07's own: the union of **five run configurations** (dev healthy path, queue,
advisory seam, advisory fallback, and the two `haiku` recovery paths), because no single run
exercises every row. **A descriptor exists for every dispatch that is *composed* through `_agent`,
and every settlement is a fixture transport's, so no row depends on billed traffic** (FSPEC
BR-MODEL-3, `FSPEC:680-682`) — with the write timing §4.1 fixes: the line is appended at
**settlement**, one per attempt, so it carries the terminal `outcome`/`errorText` rows 3 and 4 read.
Every line in the corpus is a settlement line; there is no `null`-terminal line for a row to have to
exclude. **The instrument is the fixture-driven run,
recorded through §7.0's observation seam — not `--dry-run-skill`** (PM Q-03, and FSPEC BR-MODEL-3
now says the same upstream: "the dry-run surface is **not** a way to reach it … it exercises at most
one row and is never the corpus's source", `FSPEC:682-684`): that flag selects which
single skill's composed prompt is printed (`FSPEC:210`), a one-prompt surface, whereas every row here
needs a whole run's worth of descriptors, rows 1 and 2 need a run's full phase context, and row 4
needs the failure the fixture forces mid-run.
`--dry-run-skill` remains §7.1's prompt-corpus instrument and is not cited for this property. A
whole-run `--dry-run` stays open as O-5 and this harness deliberately does not depend on it.
**What the dry-run surface still carries an oracle for, in full** (TE Q-17), so the next reader does
not re-derive it a fourth time: §5.4's exit-`0` row, and §7.1's prompt-composition assertions over
the printed prompt — a surface testable without any transport at all, which is why §7.1 uses it.
That is the whole set. It records nothing (§4.1), so no §7.4 row and no §7.0-recorded property can
hang off it, and after FSPEC v1.5's requalification of BR-MODEL-3 nothing upstream asks one to.
M-ENG-07's table stays a **transcription** of the modules' constants, never an import from them —
importing it would make the drift AC-3.3 exists to catch invisible.

The first three properties — message catalogue, outcome taxonomy, model map — write through §7.0's
observation seam, so the union is genuinely suite-wide across processes; the fourth is computed from
imported data and the fifth reads the third's records, so neither adds a seam. The accumulator is per process by construction and never reset per test — resetting per
test is how these degrade into the per-test assertions they replace. Each property's assertion also
fails on an empty observation set (§7.0), so "no test exercised this" is a red result, not a green
one.

### 7.5 The opt-in live path (AC-6.2, BR-VER-3)

Behind an explicit flag (never the default suite, never CI), one real small feature runs end-to-end
against a scratch repo, asserting §7.3's structural set plus the one thing only a live run shows: at
least one cross-review round reaching a parseable terminal verdict produced by a real model call. The
§6.5 guard measurement is the second live test, and it is the one that gates unattended use.

**A live `pdlc` invocation writes no observation records** (PM Q-01). §7.0's writer is installed by
`__tests__/_bootstrap.mjs` through `--import`, so `errorText` — the one descriptor field that can
carry a message the engine did not author — is only ever appended to a file under
`PDLC_TEST_RUN_DIR` by the hermetic suite, where every rejection is fixture-injected. A live run
carries the same descriptor shape in memory and drops it with the process. No REQ/FSPEC clause asks
for redaction, and this design does not need one; if the live path is ever given an accumulator, the
redaction question arrives with it.

**The two live tests are the named exception, and they are inside the claim rather than outside it**
(PM Q-02, TE Q-16). Both live tests — the cross-review round above and §6.5's guard measurement —
run under the same runner and therefore *do* inherit `_bootstrap.mjs`'s writer, so "the live path
writes no records" is a claim about `pdlc` invoked by an operator, not about every process that ever
dispatches for real. What keeps it safe is that the records these two write are never read by
`_assert-suite-wide.mjs`: they carry `corpusRun === null` (the harness supplies `corpusRun` only for
the five corpus configurations, §7.4), which excludes them from the fifth suite-wide row by the same
filter that excludes the direct-adapter unit tests, and rows 1–4 are scoped to named corpus runs.
The residue is narrow and stated rather than denied: a live test's `errorText` can carry a real
model's message into `${PDLC_TEST_RUN_DIR}` — a runner-owned scratch directory recreated empty on
every suite run (§7.0 step 2), not a durable artefact.

**That exclusion is asserted, not merely supplied** (TE Q-18). "The harness supplies `corpusRun` only
for the five corpus configurations" is a construction fact, and a later live test written by copying a
corpus run's helper would inherit a non-null `corpusRun` and land inside rows 1–4 carrying a real
model's `errorText`. So `_assert-suite-wide.mjs` gains a sixth conjunct, the same shape as the four
already there: **the set of distinct `corpusRun` values across all records with `corpusRun != null` is
set-equal to the five named corpus configurations** — not containment, so an unnamed sixth
configuration is red, and a corpus configuration that recorded nothing is red too. The live tests
remain outside rows 1–4 by carrying `corpusRun === null`, and that scoping is now a property the suite
can falsify rather than a convention a future author can break silently.

### 7.6 CI arrangement

`.github/workflows/pr-tests.yml` currently runs four jobs — `unit-tests` (`:27`; matrix
`os: [ubuntu-latest]`, node 20, `working-directory: pdlc/workflows`), `artifact-freshness` (`:77`),
`fresh-clone-bootstrap` (`:103`) and `script-syntax` (`:161`) — and **none of them runs
`pdlc/engine/`'s tests**. A fifth job is therefore part of this feature, not a
follow-up:

```yaml
engine-tests:
  strategy: { matrix: { os: [ubuntu-latest] } }   # same matrix as unit-tests (pr-tests.yml:40)
  # working-directory: pdlc/engine ; npm ci ; npm test
```

**The matrix is one platform, not two.** `macos-latest` was dropped from `unit-tests` in `410f3a07`,
so HEAD's matrix is `os: [ubuntu-latest]` (`pr-tests.yml:40`; the surrounding comment still describes
the two-platform intent and is stale about the value). "Same matrix as `unit-tests`" therefore means
ubuntu-only today, and this document makes no claim that CI exercises macOS.

The job body is `npm test` and nothing else, which is what makes §7.0's invocation load-bearing
rather than a developer convention: the `--import` bootstrap flag and the suite-wide assertion step
are inside the `test` script, so CI inherits both. A job that spelled out `node --test __tests__/`
directly would run without the hermeticity bootstrap and without the set-equality step, and would be
green for a strictly weaker property than the local suite — the drift is prevented by there being
one spelling, in `package.json`.

Matching the existing matrix is deliberate — the engine job tracks whatever `unit-tests` runs rather
than declaring a second, independently-drifting platform list. But because that matrix is now a
single platform, **per-platform coverage is not something CI delivers**, and the design does not
pretend otherwise: the engine spawns processes and reads `~/.claude.json`, both of which differ
across the maintainer's macOS and CI's Linux, so the platform-sensitive obligation is carried by
**`process.platform` keying** (§6.5's M-ENG-09 row, O-ENG-T4) rather than by a matrix entry. A run on
a platform with no recorded row is red on that host, wherever the host is; adding `macos-latest` back
to the matrix would be one way to get a second platform observed, and is a CI-minutes decision
(O-ENG-T1), not a correctness one. The job runs the hermetic suite only; nothing in CI dispatches a
model call or reads a credential.

### 7.7 AC-1.2's filesystem observation (the instrument, not a proxy)

AC-1.2 (`REQ:355-376`) is the one criterion whose oracle is an **instrument**: the run must be
observed at the filesystem level *for its whole duration*, and three clauses must hold on that same
observed run — at least one read of `{pluginRoot}/skills/{skill}/SKILL.md`, at least one read of
`docs/{f}/REQ-{f}.md`, and an **empty** set of paths opened under the consumer's `.claude/workflows/`.
v1.0 mapped this to `WORKFLOW_MODULE_URLS` (`run.mjs:52`), which resolves module specifiers and
observes nothing; no section designed the observation at all. This section does.

**The instrument is an in-process `fs` recorder installed by the test, not a platform tracer.**
`strace`/`dtrace` were considered and rejected: they need elevated privileges on macOS, differ per
platform (against C-9's grain rather than with it), and cannot run in the hermetic suite. Instead:

| Element | Design |
|---|---|
| what records | a wrapper over `node:fs`'s read entry points (`readFileSync`, `promises.readFile`, `createReadStream`, `openSync`, `promises.open`) installed by `__tests__/_bootstrap.mjs` (§7.0) and enabled only for the AC-1.2 test |
| scope | **the whole run**, from before `runLadder` to after the report is stamped — installed by the bootstrap, so it is live during the dynamic `import()` of the modules too, which is the window the `.claude/workflows/` clause is really about |
| coverage of both readers | the engine reads through `node:fs` directly, and the modules read through their **own Node defaults** (`defaultReadFile`, `orchestrate-dev.js:8492`) which are also `node:fs` — so one wrapper observes both, and §2.5's decision not to override the modules' IO seams is what makes that true. An injected `_readFile` recorder would have observed the modules only |
| what is recorded | every resolved absolute path, in order, with the call that opened it |

The three clauses are then assertions over one recording, and the two positive clauses are what make
the negative one falsifiable:

1. `∃` a recorded path matching `{pluginRoot}/skills/{skill}/SKILL.md` for the dispatched skill.
2. `∃` a recorded path equal to `docs/{f}/REQ-{f}.md` under the consumer root.
3. `∄` a recorded path under `{consumerRoot}/.claude/workflows/`.

**Clause 3 is absence-shaped and is never asserted alone.** It is asserted only in a test where 1
and 2 pass on the *same* recording — an instrument that recorded nothing satisfies clause 3
perfectly. Two further falsifying controls, in the same file: a case that deliberately reads a file
under `.claude/workflows/` inside the observation window **must** fail clause 3 (proving the matcher
sees that tree), and a case asserting the recording is non-empty (proving the wrapper is installed).

The consumer fixture is a scratch repo carrying a **populated** `.claude/workflows/` tree, not an
absent one; an empty directory would satisfy clause 3 for the wrong reason. This is what turns
AC-1.2 from "we found no read" into "we watched, and there was none" — and it is the reason the
posture the run is given (`distribution.checkEnabled`, `REQ:365-374`, consumed at
`orchestrate-queue.js:2068`, `:1071-1072`) is part of the fixture and named in §8.1's row.

### 7.8 Rung 4a's probe seam and its two tests (C-11, BR-GUARD-6, AT-ENG-11a)

Rung 4a is this revision's one new fail-closed refusal, and a refusal with no oracle is the class of
gate that passes on every developer machine and proves nothing about the hosts it exists to refuse
(TE F-41). It has two branches, both fixed upstream, and each needs its own test:

| Branch | Upstream | Behaviour |
|---|---|---|
| no candidate runs | EC-START-10 (`FSPEC:406`) | refuse, naming every candidate tried, what each yielded, and the remedy; exit `1`; **nothing dispatched** |
| present-but-not-runnable, then runnable | EC-START-11 (`FSPEC:407`) | rung 4a **passes** — presence is not executability, and a later candidate deciding is the correct outcome, not a tolerated one |

**Neither branch is writable without a seam this document must name.** FSPEC fixes the observation as
"by **running** a candidate, not by finding it on `PATH`" (`FSPEC:922-924`), so an EC-START-11 fixture
must present a `python3` that resolves and fails to execute while `python` succeeds. §7.0/§7.1's
bootstrap traps sockets and records `fs`; neither observes process spawning, and `_runCommand` is a
*workflow-module* seam (§3.1), supplied to `orchestrate-dev.js` for Phase I's wave gate — it is not on
the startup path and cannot be reached from `lib/startup.mjs`. So the seam is declared here:

```js
// pdlc/engine/lib/startup.mjs
export const GUARD_INTERPRETERS = Object.freeze(["python3", "python", "py"]);  // FSPEC:918-921
// Total: never throws. One probe attempt per candidate, in GUARD_INTERPRETERS order.
// Returns the first candidate that ran, or null with the full attempt record.
export function probeGuardInterpreter({ candidates = GUARD_INTERPRETERS, runProbe = defaultRunProbe })
  : { interpreter: string|null, attempts: { candidate: string, outcome: string }[] }
```

`runProbe(candidate)` is the injectable seam, defaulting to a real
`spawnSync(candidate, ["-c", "import sys"])` — **the shipped script's own probe command, verbatim**
(`guard-harvest-before-delete.sh:16`), because a precondition that probes differently from the script
it stands for can pass where the script fails. Its contract is narrow on purpose: it returns `{ ran: boolean, outcome: string }`, where `outcome`
is the operator-facing phrase the refusal quotes. **The mapping from `spawnSync`'s three shapes is
fixed here, not left to the plan** (TE Q-21), because EC-START-10's oracle asserts each candidate's
own outcome phrase and a fixture author cannot write those expectations without it:

| `spawnSync` result | `ran` | `outcome` |
|---|---|---|
| `error.code === "ENOENT"` | `false` | `"not found"` |
| `status !== 0` | `false` | `` `found but exited ${status}` `` (e.g. `"found but exited 9009"` for the Microsoft Store stub) |
| `status === 0` | `true` | `"ran"` |

The script's own test is a *conjunction* — `command -v "$cand"` **and** `"$cand" -c "import sys"`
(`guard-harvest-before-delete.sh:16`) — while `spawnSync` collapses "absent" into `ENOENT` rather
than a non-zero status. The two therefore agree on every accept/reject verdict; the mapping above is
what keeps them agreeing on the *phrase* as well. It is
a **startup-module seam, engine-side**, so §3.1's "every other probe seam keeps its Node default"
rule — which governs what the engine injects into the two *workflow* modules — is untouched by it.
`GUARD_INTERPRETERS` is a transcription of the shipped script's own candidate list
(`pdlc/hooks/scripts/guard-harvest-before-delete.sh:15-20`, the candidate loop; fail-open at `:21`), never an
import from it, and FSPEC's
"the engine never widens or narrows that set independently" (`FSPEC:919-921`) is asserted as
set-equality against a test-side transcription of those three names — the same discipline §3.3 and
§7.4 apply, and the reason a script-side change turns a test red rather than drifting silently.

**Rung 4a's probe is a local process spawn, not the kind BR-START-1 forbids** (TE Q-20). BR-START-1's
"no model call, and no probe of any kind, is made while the ladder is running" (`FSPEC:302-303`) is
justified in its own sentence by "zero tokens billed", so its subject is the *billable* probe — a
model call, or a network round-trip to the provider. Rung 4a's `spawnSync(candidate, ["-c", "import
sys"])` bills nothing, contacts nothing, and is the observation BR-GUARD-6 explicitly requires ("by
**running** a candidate", `FSPEC:922-924`). An implementer meeting the two sentences together should
build rung 4a as specified here; the missing "billable" qualifier in BR-START-1 is raised as an
erratum against FSPEC (§9.3), not resolved by narrowing this design.

The two tests are hermetic, both driven by injecting `runProbe`:

| Test | Fixture | Assertions |
|---|---|---|
| EC-START-10 — no candidate runs | `runProbe` returns `{ran: false}` for all three, with a distinct `outcome` each | rung 4a `state === "fail"`; the refusal text contains **each of the three candidate names and its own outcome phrase** (three separate expectations, as §6.4 does for EC-GUARD-4) and the remedy; exit code `1`; **and §7.0's dispatch accumulator holds exactly zero descriptors** |
| EC-START-11 — presence is not executability | `runProbe` returns `{ran: false, outcome: "found but did not execute"}` for `python3` and `{ran: true}` for `python` | rung 4a `state === "pass"`; the returned `interpreter === "python"`; `attempts` records both, in order; **rung 5's record exists with `state === "pass"`** under a green billing posture in the same fixture — the positive form of "the ladder continued", since `RungRecord.state` is three-valued (§4.3) and `state !== "skipped"` would be satisfied by a rung-5 *failure* as readily as by a pass |

**"Nothing dispatched" is asserted positively, never as an absence.** The oracle is
`accumulator.length === 0` over §7.0's dispatch-descriptor accumulator on a run that reached the
ladder — an assertion that a live instrument recorded zero, not an assertion that no evidence was
found. The same accumulator is what makes §4.1's settlement-line rule falsifiable, and a companion
control in the same file asserts a run that *does* dispatch records a non-zero count, so an
accumulator that was never installed cannot score the refusal green.

Rung 4a's `RungRecord.detail` carries the `attempts` record rendered, so `pdlc doctor` shows the same
per-candidate outcomes the refusal names, from the same call (§4.3) — the diagnostic and the gate
cannot disagree about which interpreters were tried.

## 8. Traceability

### 8.1 Acceptance criteria → design section → owning component

Total over REQ v0.10's 26 acceptance criteria (the count is unchanged from v0.9). "Owning component"
names where the behaviour lives, not every file it touches; a component in **bold** is new in this
feature. Two upstream obligations are constraint-borne rather than AC-borne and so have no row here;
they are carried by §8.2 instead, and named so the omission is deliberate rather than invisible:
**C-11 / EC-START-10, EC-START-11 / AT-ENG-11a** (rung 4a — §4.3, §7.8) and **C-10 / rung 3**.

| AC | Subject | TSPEC § | Owning component |
|---|---|---|---|
| AC-1.1 | artifact parity with a Claude Code run | §3.1, §3.6, §7.3 | `lib/run.mjs`, `lib/report.mjs` (parity is a property of the seams, not a component) |
| AC-1.2 | the run observed at the filesystem level: two reads present, `.claude/workflows/` set empty | **§7.7**, §4.6 (the `distribution.checkEnabled` posture the fixture carries) | **`__tests__/_bootstrap.mjs`'s `fs` recorder** + the AC-1.2 test's three clauses |
| AC-1.3 | queue surface, both stop reasons named | §3.1 (`_runPipeline`), §4.5 (`loop.stopReason`), §4.6 (`queue.maxIterations`), §5.4 | `lib/run.mjs:273-282`, `bin/pdlc.mjs:303-313`, `lib/report.mjs` |
| AC-1.4 | halt recorded, exit `2` not `1` | §5.4 | `bin/pdlc.mjs:236-238` |
| AC-1.5 | not a fork: resolved specifier, no second module file | **§2.4** (both observables), §7.6 (the job that runs them) | `lib/run.mjs:52`, `:58`; `__tests__/run.test.js:48`, `:64` |
| AC-2.1 | startup banner, six ordered auth rows | §3.2, §4.3 | **`lib/auth.mjs`**, `lib/startup.mjs` |
| AC-2.2 | key present without opt-in ⇒ refusal | §3.2 (row 5), §5.4 | **`lib/auth.mjs`**, `bin/pdlc.mjs:88-93` |
| AC-2.3 | proxy env reaches every dispatch | §3.4 | `lib/transport.mjs:159` |
| AC-2.4 | logged-in session, key ignored | §3.2 (row 4), §4.5 | **`lib/auth.mjs`**, `lib/report.mjs` |
| AC-2.5 | dispatch cwd is the repo, per dispatch | §2.3, §4.1 | `lib/adapter.mjs:278`, `lib/run.mjs:155` |
| AC-3.1 | a dispatch composes for every skill in the set | §3.3 | `lib/skills.mjs:312` |
| AC-3.2 | no plugin installed ⇒ legible refusal | §3.3 (resolution), §4.3 rung 1 | `lib/skills.mjs:204-256` |
| AC-3.3 | pinned model map, set-equality both directions | §4.1 (descriptor + phase provenance), **§7.4** (the harness and its per-row witness table) | modules' constants; `lib/adapter.mjs:271` passes through; the descriptor accumulator asserts AC-3.3's two directions against M-ENG-07 |
| AC-3.4 | permission posture is explicit | §6.2, §6.5 | `lib/transport.mjs:89`, `:170-174` |
| AC-3.5 | dispatchable ≡ readable, both directions | §3.3, §7.4 | **`DISPATCHABLE_SKILLS`** exports + `lib/startup.mjs` rung 4 |
| AC-4.1 | six-member outcome taxonomy | §4.2, §5.1 | **`lib/outcome.mjs`** |
| AC-4.2 | retry budget and timeout cap | §5.2 | `lib/adapter.mjs:285-318`, `computeRateLimitWaitMs :75` |
| AC-4.3 | exhausted retries surface legibly | §5.2, §5.3, §3.5 | `lib/adapter.mjs`, **`lib/catalogue.mjs`** |
| AC-4.4 | mid-run `auth-failure` is fatal, never retried | §5.1, §5.3 | **`lib/outcome.mjs`**, `lib/run.mjs:187/228` (the catch this feature adds there, §8.3) |
| AC-4.5 | report carries module fields + engine block | §3.6, §4.5 (row-by-row vs FSPEC §12.2), §4.6 | `lib/report.mjs:36`, `:70` |
| AC-5.1 | guard refuses with `LEARNINGS` absent, per transport | §6.2, §6.3 | engine-supplied hook config; shipped `.sh` |
| AC-5.2 | harvest's deletions succeed once it exists | §6.1, §6.3 | same |
| AC-6.1 | hermetic suite, observed | §7.0 (the `--import` that installs it), §7.1 | `__tests__/_bootstrap.mjs` (guard + socket trap), `package.json` `scripts.test` |
| AC-6.2 | opt-in live smoke | §7.5 | `__tests__/live/` |
| AC-6.3 | per-transport recorded fixtures | §7.2 | `__tests__/fixtures/` |
| AC-6.4 | closed message catalogue, both directions | §3.5, §7.0, §7.4 | **`lib/catalogue.mjs`**, `__tests__/_assert-suite-wide.mjs` |

### 8.2 Constraints → design section

| C | TSPEC § | C | TSPEC § |
|---|---|---|---|
| C-1a startup billing posture | §3.2, §4.3 | C-6 permissions explicit, non-interactive | §6.2, §6.5 |
| C-1b per-dispatch auth assertion | §3.4, §4.3 | C-7 model aliases forwarded, not re-mapped | §4.1 |
| C-2 environment passthrough | §3.4 | C-8 closed message catalogue | §3.5 |
| C-3 `cwd` is the consumer project | §2.3, §4.1 | C-9 every runtime fact measured, per platform | §6.5, §7.2, §7.6 |
| C-4 the modules are not forked | §2.4, §2.5, §3.3 | C-10 plugin version handshake | §4.3 rung 3 |
| C-5 guard parity | §6.2, §6.4 | C-11 host can run the shipped guard | §4.3 rung 4a, **§7.8** (probe seam + both branches) |

### 8.3 New and changed files

| File | State | Sections |
|---|---|---|
| **`lib/auth.mjs`** | new | §3.2, §4.3 |
| **`lib/outcome.mjs`** | new | §4.2, §5.1 |
| **`lib/catalogue.mjs`** | new | §3.5 |
| **`lib/transport-cli.mjs`** | new | §3.4 |
| `lib/transport.mjs` | extended (guard config, transport selection) | §3.4, §6.2 |
| `lib/adapter.mjs` | extended (retry machine, per-dispatch auth record, **`_phase` run state stamped on each descriptor**, **`dispatchTimeoutMs` constructor option stamped as `timeoutMs` on every dispatch's options object** (§3.4), **terminal `outcome` + verbatim `errorText` written back onto each descriptor, and the record appended to §7.0's accumulator at settlement — one line per attempt, appended from the `_agent` body (`:271`) and never from `composePrompt` (`:259`), so every line is a settlement line** (§4.1), stale `opts.label` comment at `:266-268` corrected) | §3.4, §3.6, §4.1, §4.4, §4.6, §5.2 |
| `lib/startup.mjs` | changed (structured rungs over `RUNG_ORDER` — seven labels `0,1,2,3,4,4a,5`, including FSPEC v1.6's rung 4a guard-executable check — derived skill set, plus **`GUARD_INTERPRETERS` and `probeGuardInterpreter({runProbe})`**, §7.8's injectable probe seam) | §4.3, **§7.8** (rung 4a); §6.4 is EC-GUARD-4, a different check |
| `lib/report.mjs` | changed (observed transport, `authSources`) | §3.6, §4.5 |
| `lib/run.mjs`, `bin/pdlc.mjs` | extended (**a top-level `catch` added to `runDev` (`:187`) and `runQueue` (`:228`) — HEAD's `run.mjs` has no `catch` clause, only `withCwd`'s `try/finally` at `:159`; §5.3 depends on it**, exit mapping, `doctor` projection, flags, `resolveTunables` — called at both `createAdapter` sites, `bin/pdlc.mjs:173` (`emitDryRun`, inert transport) and `:205` (`liveAdapter`, the run path); `doctor` (`:157`) constructs no adapter, feeding the adapter's tunable options and the `tunables` report block from one return) | §4.3, §4.6, §5.4, §7.1 |
| **`__tests__/_bootstrap.mjs`** | new — hermeticity guard + socket trap + observation writer + `fs` recorder | §7.0, §7.1, §7.7 |
| **`__tests__/_assert-suite-wide.mjs`** | new — §7.4's six suite-wide assertions (four set-equality properties + the pre-phase predicate, `no record with corpusRun != null has phase === null`, + §7.5's corpus-scoping conjunct: the distinct non-null `corpusRun` values are set-equal to the five named configurations), over three accumulators | §7.0, §7.4 |
| **`__tests__/_run-suite.mjs`** | new — mints the run id, prepares the run dir, spawns the suite then the assertion step | §7.0 |
| `pdlc/engine/package.json` | changed — `scripts.test` becomes the runner invocation | §7.0 |
| `pdlc/engine/__tests__/smoke.test.js` | **extended** — the HEAD file (387 lines) that already runs the real `orchestrate-dev.js` against a write-replaying transport double; §7.3's parity oracle is this file grown, not a new one, and it is one of the nine `*.test.js` §1.1 counts | §7.3 |
| `pdlc/workflows/orchestrate-dev.js` | **exports added** (`DISPATCHABLE_SKILLS`, `ADVISORY_RUNG_SKILL`, the five `SKILL_*` constants) + bare skill literals replaced by those constants at their **direct** dispatch sites (the eleven class-4 literals and the one class-3 `skill:` literal §3.3 enumerates; the eleven indirect-dispatch positions are untouched, since they carry values the derivation already governs at their source) | §3.3 |
| `pdlc/workflows/orchestrate-queue.js` | **exports added** (`DISPATCHABLE_SKILLS`, `SKILL_TRIAGE`); imports `ADVISORY_RUNG_SKILL` (`:41`) | §3.3 |
| `pdlc/workflows/dist/orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js` | **regenerated** — `stripModuleSyntax` inlines the whole module body, so the added constants change the bundle bytes even though no name is published | §3.3 |
| `pdlc/workflows/dist/distribution-manifest.json` | **regenerated** — sha1 and byte counts follow the bundles | §3.3 |
| `docs/_constraints/pdlc-engine-baseline.md` | one measurement added (**M-ENG-09**, PreToolUse deny under `bypassPermissions`) | §6.5 |
| `.github/workflows/pr-tests.yml` | one job added (`engine-tests`) | §7.6 |
| `.claude/pdlc.config.json` | **changed** — `implementation.testCommand` (`:3`) runs `cd pdlc/workflows && npm test …` and *only* that, so no Phase I wave gate executes the engine suite this feature builds; the command must additionally run `pdlc/engine`'s suite | §7.0, §7.6 |

No other file under `pdlc/workflows/` is modified (§2.4, §2.5) — and this claim is now load-bearing
in a second way. **The per-phase view is bought entirely on the engine side.** §4.1 takes the phase
from the `_phase` seam the modules already call, held as adapter run state, rather than adding a
`label` to the modules' dispatch sites; had the modules been asked to pass labels, the workflow-module
rows above would have to list the dispatch sites too, and this sentence would be false. The two rows
that touch `pdlc/workflows/` remain the export/constant change and nothing else.

**The three generated rows are a PLAN obligation, not a footnote.** `node pdlc/workflows/build-runtime.mjs`
must run in the **same task** that adds the module exports, and the regenerated `dist/` artifacts
must be in that task's owned-file set and its commit — `.github/workflows/pr-tests.yml:77`
(`artifact-freshness`) gates on `build-runtime.mjs --check` producing no diff, so a wave that commits
the source change without the rebuild leaves CI red at Phase PUB for a reason unrelated to the work.
`implementation.postWavePathspecs` naming `pdlc/workflows/dist/` is the mechanism this repo already
ships for exactly that.

**The wave gate is a fourth PLAN obligation, and it is currently blind to this feature.**
`.claude/pdlc.config.json`'s `implementation.testCommand` (`:3`) is
`cd pdlc/workflows && npm test …` — it runs the *workflows* suite and nothing else. Phase I's wave
gate executes exactly that command, so **every wave of this feature would go green without a single
`pdlc/engine/` test ever running**, and the first execution of the suite this document designs would
be the `engine-tests` CI job at Phase PUB — the latest possible moment, past every gate meant to
catch it. The config is therefore in the edit surface: `testCommand` must run both suites, and the
task that first adds an engine test owns the change. This is the same class of omission as the
generated-artifact rows above — a gate that names one directory while the work lands in another.

## 9. Open Questions

### 9.1 Carried from FSPEC §13.2, with this document's disposition

| # | Question | Disposition here | Owner |
|---|---|---|---|
| O-1 | fallback `claude -p` flag surface; per-transport model-alias semantics | §3.4 fixes the *interface* both transports satisfy; the CLI's flag spellings are a PLAN task producing the §7.2 fixture set. **Not blocking**: the primary transport ships without it, and v1.1 removes the transport selector v1.0 had mistakenly designed here — `resolveTransport` returns a constant `kind` and `"cli"` is reachable only by direct unit construction, so making the fallback runtime-selectable remains wholly O-1's | PLAN |
| O-2 | guard-parity mechanism per transport, and first **whether a PreToolUse deny fires at all under `bypassPermissions`** | §6.5 pre-commits both branches so a red measurement is not a design debate, and v1.1 gives the measurement a **durable record** (M-ENG-09) the hermetic suite reads: an unrecorded measurement is a red suite, not a silent omission. **Blocking for unattended use**, and scheduled before it (BR-GUARD-4) | PLAN, first implementation wave |
| O-3 | where engine configuration lives (consumer config vs. engine-global with override) | still not decided, and now decidably so: **§4.6 fixes the set, the defaults and the single resolution point** (`resolveTunables`), and names all five of REQ §4.1's tunables including the two v1.0 never mentioned (`queue.maxIterations`, `dispatch.retryBackoff`). Only the *location* the resolver reads from is open, and no AC depends on it | deferred |
| O-4 | token viability and renewal runbook for cron contexts | out of scope for TSPEC — an operational runbook, not a mechanism. §3.2 row 1 is the only code contact | deferred |
| O-5 | dry-run surface shape | partly discharged: `--dry-run-skill` exists (`bin/pdlc.mjs:171-172`) and §7.1 makes it the hermetic prompt-corpus surface. Whether a whole-run `--dry-run` is added is a PLAN decision | PLAN |
| O-6 | session-reuse flag design | **the seam must not be painted shut** (R-4). §3.1 keeps `_sessionAgent` unwired, so fresh-per-dispatch stays today's semantics and a future flag has somewhere to attach | deferred, deliberately |
| O-7 | re-derive retry defaults from observed unattended load | §5.2's defaults are a starting point, not a measured floor; §4.4's pause records are the measurement instrument | deferred, instrumented |
| O-8 | plugin installed-location discovery | **discharged** — probed and shipped (`skills.mjs:204-256`), unchanged here | closed |
| O-9 | whether either transport can distinguish a logged-in session from a token credential from its own reported state | §3.2 and §3.4 are deliberately independent observations for exactly this reason. If the answer is no, §3.2's startup mapping is the whole answer and §3.4's per-dispatch check remains a policy assertion, not a discrimination | deferred |

### 9.2 Raised by this document

- **O-ENG-T1 — the CI job's cost and placement.** §7.6 adds a fifth job on the existing matrix, which
  is **one platform** at HEAD — `os: [ubuntu-latest]` (`pr-tests.yml:40`). Whether `macos-latest` is
  added back so the engine suite runs on two platforms every PR, or on merge only, is a maintainer
  decision about CI minutes that a plan can set either way. The technical requirement is only that
  **both platforms are exercised somewhere**, because C-9 makes per-platform measurement a constraint
  (`~/.claude.json` location, process spawning) — and §7.6 is explicit that today CI is not where the
  second platform comes from.
- **O-ENG-T2 — two concurrent engine runs in one repo.** §2.3 records the opposite of what v1.0
  wrote here: `withCwd` (`run.mjs:155`) **does** `process.chdir` for the run's duration, which is
  process-global and is exactly why one process hosts one pipeline at a time; `cwd` is *additionally*
  passed per dispatch (`adapter.mjs:278`) so the agent's own directory is pinned independently. So
  the in-process case is settled by exclusion, not by coherence — and the open question is the
  cross-process one: two runs against the same worktree share a git index and a branch. The engine does not currently
  detect this. The likely answer is an advisory lock file scoped to the repo, refusing the second run
  with a catalogue-registered message; it is not designed here because no acceptance criterion binds
  it and inventing a locking protocol without a stated requirement is how a lock becomes the thing
  that halts unattended runs.
- **O-ENG-T3 — supplement inlining and prompt size.** §3.3 decides that `se-implement` dispatches
  carry `SKILL.md` plus both language supplements. That is the smallest change that satisfies
  AC-3.5's 12-file count without an exemption list, but it sends both languages to every
  implementation dispatch. If measured prompt size becomes a problem, the alternative is a
  language-conditioned selection driven by the repo's own manifest — a decision that needs a
  measurement first, and one this TSPEC deliberately does not pre-empt.
- **O-ENG-T4 — the M-ENG-09 gate's platform granularity.** §6.5 makes an unrecorded guard
  measurement a red hermetic suite, keyed by platform. Whether "platform" means `process.platform`
  (which takes a distinct value per host the suite runs on — and deliberately does **not** track
  §7.6's matrix, which is one platform) or a finer key including the SDK version is a maintainer
  decision: a version-keyed row is more honest and goes stale on every SDK bump, which on an
  unattended pipeline means a red suite for a reason no code change caused. The design records the
  SDK version in the row either way; only the *staleness predicate* is open.
- **O-ENG-T5 — the unmeasured platform.** Both reviewers arrived at this independently (PM Q-01, TE
  Q-08), which is the reason it is promoted to an open question rather than answered in passing.
  §6.5's "unrecorded is red" makes a missing M-ENG-09 row for the running platform fail the hermetic
  suite. On the one platform §7.6's matrix runs (`ubuntu-latest`) and on the maintainer's macOS, that
  is exactly right, and the same-task ordering rule answers the fresh-clone case. But the row is keyed
  by platform, so a contributor on a third —
  a Linux distribution that reports differently, a container host, Windows — gets a red suite for a
  measurement they cannot reasonably be asked to take. AC-6.1 scopes the suite to §7.6's matrix, so
  this is not a criterion gap, and it is deliberately **not** decided here: the candidate answers
  (skip with a reported notice off-matrix, versus refuse and require a recorded row) differ in
  whether an unattended run on an unexpected host fails loudly or quietly, which is a maintainer's
  call and the same shape of call as O-ENG-T4's staleness predicate. A PLAN author hits this on day
  one, so it is named rather than left to be discovered.

### 9.3 Errata raised against upstream documents

Both were emitted in earlier dispatches, routed through the erratum channel, and are **resolved
upstream** — recorded here so a later reader can see the round they closed in rather than re-raising
them:

- `ERRATUM: FSPEC: BR-SKILL-3` (**resolved**) — the two `se-implement` language supplements are named
  nowhere in `pdlc/workflows/*.js`; they are loaded by the agent per
  `pdlc/skills/se-implement/SKILL.md:3`. BR-SKILL-3 now reads "inlined when the module's dispatch
  asks for them. The engine adds no language-detection policy of its own" (`FSPEC:562-564`).
- `ERRATUM: REQ: AC-3.5` (**resolved**) — the 12-prompt-file count (10 `SKILL.md` + 2 supplements)
  was only reachable if the engine inlined a dispatched identifier's whole file set, because no
  module dispatch names a supplement. AC-3.5 is now scoped to "the set of prompt files the installed
  plugin holds **for those identifiers**" (`REQ:502-506`), which is §3.3's decision stated upstream.

A third was raised by the round-6 reviewers and resolved upstream before this revision: FSPEC v1.4/v1.5
requalified BR-MODEL-3's dry-run reachability claim (`FSPEC:680-684`), and §4.1/§7.4 above are this
document's side of that correction.

Round 8 raised no erratum. Every upstream citation that revision touched was
re-grounded against HEAD — FSPEC's rung 4a material (`FSPEC:299` the ladder row, `:406-407`
EC-START-10/11, `:918-921` BR-GUARD-6's candidate set and `:922-924` "observed by running", `:967` AT-ENG-11a)
and REQ's C-11 (`REQ:284`) — and each lands on the text it claims.

Round 8's incidental note alleging that FSPEC's `guard-harvest-before-delete.sh:14-21` was "a line
off at each end" is **withdrawn**: re-measured at HEAD, `PY_BIN=""` is `:14`, the candidate loop is
`:15-20` and the fail-open `[ -z "$PY_BIN" ] && exit 0` is `:21`, so FSPEC's range spans exactly
initialisation through fail-open and is correct. The off-by-one was this document's, in §7.8, and is
fixed there (TE F-46, PM F-02).

**One new erratum is raised by round 9**, against FSPEC, and is emitted through the erratum channel
rather than folded into this document:

- `ERRATUM: FSPEC: BR-START-1` — "No model call, and no probe of any kind, is made while the ladder
  is running" (`FSPEC:302-303`) is literally contradicted by BR-GUARD-6's requirement that rung 4a
  observe interpreter availability "by **running** a candidate" (`FSPEC:922-924`). BR-START-1's own
  justification is "zero tokens billed", so the intended scope is the *billable* probe; rung 4a was
  inserted after BR-START-1 was written and the qualifier was never added. §7.8 states the reading an
  implementer should build to, but the qualifier belongs upstream.
