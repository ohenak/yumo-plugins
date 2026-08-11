# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.8, 2026-08-11)
**Date:** 2026-08-11
**Iteration:** 5
**Scope:** Delta confirmation of the Phase-F erratum round. Technical feasibility,
implementability, completeness of error handling, architectural compatibility. Product framing,
UX and test-pyramid choices are out of scope.

## Method

Delta confirmation, not a re-review. I diffed `765d2909..HEAD` on the REQ (the commit my v4
anchors name as reviewed) and on `docs/_constraints/pdlc-engine-baseline.md`, where two of the
eleven errata land. Four commits carry the round: `0664b6e6`, `53f07115`, `b707edde`, `a10bd21d`,
plus `ba92cb92` for §1.2a's totality note.

Per DEC-ERR-03 I re-derived every changed statement against HEAD on
`feat-pdlc-headless-engine` rather than reading the edit as self-certifying: each `file:line` in
the changed text was opened, and the two counting claims (AC-3.5's dispatchable set, M-ENG-06's
totality over the criteria) were recomputed from the modules and from the REQ itself, not
checked against the author's arithmetic. Sections untouched by the erratum round are not
re-litigated; the one exception is noted at F-26, where new text makes an old row's claim
contradictory rather than merely unverified.

## Erratum Disposition

Eleven errata were routed (two pairs are the same defect raised by two reviewers, so nine
distinct edits). Ten are confirmed resolved. One is resolved in form but wrong in content — the
row it was asked to add exists, and the row misstates HEAD (F-25).

| # | Erratum (raiser) | State | Evidence re-derived at HEAD |
|---|---|---|---|
| 1 | No AC records which transport ran; NG-6 / AC-5.1 / AC-6.3 bind per transport (SE) | **Resolved** | AC-4.5 now makes transport identity a per-dispatch recorded field over a closed two-member set, "recorded from what the engine actually invoked, never from configuration intent". The provenance clause matters: it is the same rule the pipeline already applies to `ciStatus`, so the field cannot be back-filled from config. |
| 2 | AC-4.5's report has no named operator surface; NG-7 forbids writing into the consumer repo (SE) | **Resolved** | The report is delivered on the run's own output stream, with no engine-owned file in the consumer repo, and persistence elsewhere is explicitly out of scope. This closes the contradiction rather than widening scope. |
| 3 | `pdlc doctor` is operator-visible with no upstream authority (SE) | **Resolved** | AC-2.1 now carries the diagnostic startup-posture surface — dispatches nothing, bills nothing, reports the version pair (C-10), effective base URL, and the auth catalogue id — and leaves name and flags to FSPEC. Verified the surface exists at `pdlc/engine/bin/pdlc.mjs:40`; the AC now authorises it in substance while keeping the naming altitude in FSPEC, which is the right split. |
| 4 | AC-2.1 rows 2/4/5 rest on an unobservable "settings state present"; row 5 unfixturable (TE) | **Resolved** | Rows 2/4/5 now read "logged-in evidence readable (M-ENG-08)", and M-ENG-08 names the record: `~/.claude.json` carrying an `oauthAccount` object, with the credential itself explicitly *not* in any file the engine reads. Every row is now fixturable by placing or withholding that record plus env vars; row 5 needs no operator credential. |
| 5, 6 | §1.2a's per-AC red/green claim is not total — M-ENG-06 has no AC-2.3 row (TE), and no AC-4.4 row (pm-author) | **Resolved in form; see F-25** | M-ENG-06 now declares itself total and gains both rows, and §1.2a says a criterion without a row is a defect in the fact rather than a gap the reader resolves. I recomputed the totality claim: all 26 `**AC-n.m**` criteria in the REQ appear in exactly one row (the combined cells `AC-2.1/2.2/2.4`, `AC-4.1/4.2`, `AC-5.1/5.2` cover the four that a naive id scan misses). The AC-2.3 row is accurate — `transport.mjs:159` is `const dispatchEnv = { ...env };`, passed at `:168`, and BR-ENV-3's every-dispatch half is genuinely unasserted. **The AC-4.4 row is not accurate** — F-25. |
| 7, 8 | M-ENG-08's closing "never a refusal" is over-broad by one case; contradicts AC-2.1 row 5 (SE, TE) | **Resolved** | The clause now splits on `ANTHROPIC_API_KEY`: absent ⇒ `auth.unknown` at row 6 (FSPEC §5.1 BR-AUTH-0), present without the billing flag ⇒ refusal at row 5. AC-2.1 row 5 and M-ENG-08 now agree. FSPEC's own §5.1 row 5 is a separate routing, not this document's. |
| 9 | AC-3.5's both-directions set-equality is unsatisfiable against every prompt file present (pm-author) | **Resolved — recomputed independently** | I derived the dispatchable set from the modules rather than trusting the count: the skill identifiers the modules actually dispatch are `dod-verify`, `harvest-learnings`, `pm-author`, `pm-review`, `se-author`, `se-implement`, `se-review`, `ship-pr`, `te-author`, `te-review` = **10** (`orchestrate-dev` / `orchestrate-queue` occur only as self-names, and the queue calls dev in-process, not by dispatch). Their prompt files are 10 `SKILL.md` + the 2 `se-implement` language supplements = **12**. The plugin ships 15 skill directories, so **5** remain operator-invoked and outside the set: `consolidate-learnings`, `tech-lead`, `tech-lead-python`, `orchestrate-dev`, `orchestrate-queue`. Every number in the revised AC matches. The AC also now says which identifiers are dispatchable is *derived from the modules, never from a list the engine maintains alongside them* — that is the right rule, and it is exactly what `startup.mjs:20`'s frozen 17-name list violates today, which M-ENG-06's red row now says in as many words. |
| 10 | AC-1.2(c)'s empty read-set is attributed to a queue-only ordering (pm-author) | **Resolved — verified by exhaustion** | `.claude/workflows/` occurs exactly once in `orchestrate-dev.js`, at `:52`, inside `MERGE_GUARD_DEFAULTS` — a frozen Phase-MERGE self-modification guard path, matched against, never opened. So clause (c) does hold unconditionally on the dev surface regardless of posture, and the opt-out is load-bearing only for AC-1.3's queue run (`orchestrate-queue.js:64` drift-state path, reached only in the else-branch at `:1074`). The revised clause states precisely this. |
| 11 | AC-1.3's `--loop` has no iteration bound while the operator surface accepts one (pm-author) | **Resolved** | AC-1.3 now names exactly two stop reasons, requires them distinguishable without inspecting the queue (outcome line plus the AC-4.5 report), and §4.1 declares `queue.maxIterations` with "operator, per invocation" ownership. That ownership matches the surface that provoked the erratum: `pdlc queue [--loop [--max-iterations <n>]]` (`pdlc/engine/bin/pdlc.mjs:39`). AC-4.5's closing sentence carries the stop reason into the report, so the two edits are consistent rather than merely adjacent. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-25 | High | Local | **M-ENG-06's new AC-4.4 row, and §1.2a's red list that quotes it, both misstate HEAD — and they misstate it in the direction §1.2a exists to prevent.** The row reads: "the thrown-outcome classifier names timeout, rate-limit and transport-contract outcomes only (`transport.mjs:98`, `:189`, `:216`); no `auth-failure` member exists, so the stop-without-retry behaviour is unasserted", declared state **red — open work**; §1.2a now lists AC-4.4 among "Red at HEAD". The cited line refutes the claim it is cited for: `classifyThrown` begins at `transport.mjs:98` and its **first** named member at `:100` is `AuthPolicyError`. That class is defined at `:23`, thrown at `:204` when the SDK's `system/init` reports an `apiKeySource` outside the policy set — *before any model output is returned* — and its message names the failing source verbatim (`SDK reported apiKeySource "…", policy only allows: …`), which is AC-4.4's third clause already satisfied. It is also already excluded from the retry loop: `adapter.mjs:291` rethrows anything that is not a `RateLimitedError`, so an auth failure is structurally never retried, which is AC-4.4's first clause. And it is already covered by a test — `transport.test.js:50`, "apiKeySource other than \"none\" throws AuthPolicyError before any output", asserting `instanceof AuthPolicyError` at `:63`. The genuinely open work is narrower than the row claims and is the *third* clause only: no test asserts that an auth failure is **not retried** and that the **run stops** with the modules' halt semantics, and no closed catalogue names the member `auth-failure` as AC-4.1 demands. A planner reading "red — open work" writes a failing-first test for AC-4.4 and finds two of its three clauses green on the first run; that is precisely the wasted round §1.2a was created to eliminate (SE v1 F-07, TE v1 F-07), and correctness of these rows is the whole subject of the erratum that produced this one. **Fix:** restate the AC-4.4 row as **partially green**, following the AC-2.3 row's own template of naming the unasserted half — asserted at HEAD: an auth outcome is classified (`transport.mjs:23`, `:100`, `:204`), carries the failing source in its message, is excluded from the rate-limit retry loop (`adapter.mjs:291`) and is covered by `transport.test.js:50`; unasserted: that the run stops through the modules' halt path, and the closed-catalogue naming AC-4.1 owns. Then drop AC-4.4 from §1.2a's "Red at HEAD" list. No other clause of the erratum round needs to move. | §1.2a; `docs/_constraints/pdlc-engine-baseline.md` M-ENG-06, AC-4.4 row |
| F-26 | Medium | Local | **The new row contradicts an existing row of the same table, and the totality claim is what makes that fatal rather than untidy.** M-ENG-06's first row declares "AC-4.1/4.2 (taxonomy, retry)" **green — regression-protecting**. AC-4.1 is a *set-equality* criterion: the classifier's possible outputs must equal exactly six members, and "the test asserts set-equality between the classifier's possible outputs and these six". No such catalogue exists at HEAD — `transport.mjs` defines four error classes plus the success path, and the strings `transport-contract-violation` and `agent-reported-failure` appear nowhere in `pdlc/engine/`; no test in `pdlc/engine/__tests__/` asserts set-equality over any catalogue. So AC-4.1's asserted half is the *individual* classifications (each of the four classes has a test), and its set-equality half is unasserted — "partially green", not green. I would normally leave an unchanged row alone under the delta protocol; the new totality declaration ("every criterion appears in exactly one row … a criterion added without a row here is a defect in this fact") changes that, because a table that claims to be the single authority on start state cannot carry two rows that disagree about whether an `auth-failure` member exists. Fix with F-25 in one edit: move AC-4.1 to partially green with its set-equality half named as the open work. A false *green* is the more expensive of the two errors — it is the state that gets no test written at all. | `docs/_constraints/pdlc-engine-baseline.md` M-ENG-06, rows 1 and 5 |
| F-27 | Low | Local | **The new AC-2.3 row declares "partially green" but cites only production lines, so the reader cannot see what makes the asserted half green.** The row's evidence is `transport.mjs:159` / `:168`. The asserted half is green because of a test — `transport.test.js:170`, "dispatch env spreads the provided env rather than replacing it". Every other row of M-ENG-06 cites the test file that protects it (`__tests__/{…}.test.js`, `smoke.test.js:294`, `run.test.js:48`), so this row is the outlier, and a planner checking whether the first-dispatch assertion really exists has to go find it. Add `__tests__/transport.test.js:170` to the row's evidence cell. This is not a correctness finding; the row's state and its unasserted-half description are both right. | `docs/_constraints/pdlc-engine-baseline.md` M-ENG-06, AC-2.3 row |

No erratum is emitted upward. F-25's REQ half (§1.2a's red list) is this document's own text, and its
larger half lives in `docs/_constraints/pdlc-engine-baseline.md`, which is a REQ-owned extraction
reviewed here rather than a separate pipeline artifact — there is no upstream document to route to.

## Questions

Q-06 and Q-08 are carried unchanged from v4; both remain TSPEC decisions, not REQ gaps, and
neither was in this round's scope.

| ID | Question |
|----|---------|
| Q-06 | *(carried)* How does AC-6.2's opt-in live smoke coexist with AC-6.1's hermeticity guard, when AC-6.1 states the guard "fails the suite on any attempt to construct a real transport"? Presumably the guard is armed per-suite rather than per-process; who owns that switch is a TSPEC decision AC-6.1's wording currently forecloses. |
| Q-08 | *(carried)* Corpus run iv reaches `MODEL_ADVISORY_FALLBACK` by forcing `fable` model resolution to fail. At HEAD the fallback is guarded by `isModelResolutionError` (`orchestrate-dev.js:1861`); whether the engine reproduces that guard or delegates to the module is TSPEC's, not the REQ's. |
| Q-09 | *(new)* M-ENG-08's evidence record is `~/.claude.json` — a `$HOME`-relative path, not a repo- or cwd-relative one. Fixturing AC-2.1 rows 2/4/5 therefore means overriding `HOME` (or an equivalent seam) for the process under test. That is TSPEC's to design and I am not asking the REQ to name a mechanism; I raise it only to confirm the erratum's "fixturable with no operator credential involved" is understood to include a per-test `HOME`, since on the primary transport the SDK reads that file in-process rather than in a child the test controls. |

## Positive Observations

- **The AC-1.2(c) edit is the round's best work, because it made a claim *smaller* and *truer* at
  the same time.** The old text explained an empty read-set by an ordering that belongs to a
  different module; the new text says the dev module opens nothing under `.claude/workflows/` on
  any posture and attributes the opt-out to the queue surface where it actually bites. I tried to
  break it by exhaustion rather than by reading — one occurrence of the string in
  `orchestrate-dev.js`, at `:52`, inside a frozen guard-path list — and the claim holds.
- **AC-3.5 now states a rule instead of a count.** "Which identifiers are dispatchable is derived
  from the modules, never from a list the engine maintains alongside them" is the durable half;
  the 10/12/5 numbers are correctly marked as an observation of HEAD. That rule also indicts
  `startup.mjs:20`'s frozen 17-name list in advance, and M-ENG-06's red row now says so — the REQ
  and the baseline agree about the same defect from two directions.
- **AC-4.5's transport-identity clause borrows the provenance discipline the pipeline already uses
  for `ciStatus`**: recorded from what was actually invoked, never from configuration intent. That
  phrasing forecloses the cheap implementation (report the configured transport) without naming a
  mechanism, which is the right altitude for an AC.
- **M-ENG-08's correction is a genuine one-case narrowing, not a rewrite.** "Never a refusal"
  became a split on `ANTHROPIC_API_KEY`, and AC-2.1 row 5, row 6 and FSPEC §5.1 BR-AUTH-0 now
  line up. The correction names the case it was over-broad by, so the next reader can check it.
- **The change note is honest about compression.** Earlier notes were shortened to hold the size
  budget and the note says so; no approved decision was quietly reopened, and the diff bears that
  out — every hunk outside the eleven errata is change-note text.

## Recommendation

**Needs revision**

Ten of the eleven errata are confirmed resolved, and I re-derived each one against HEAD rather
than reading the edit as self-certifying — including the two counting claims, which both hold.
The round did what it was asked to do everywhere except one row.

The blocker is narrow and cheap. F-25 is a single table row whose declared start state and
evidence sentence are refuted by the line the sentence cites: AC-4.4 is partially green at HEAD,
not red. It is High rather than Medium for one reason — this row was *created by* an erratum whose
entire subject was the correctness of these start states, and the table now declares itself the
single authority over every criterion. A wrong row inside a fact that claims totality is worse
than the missing row it replaced, because the missing row invited a reader to look while the
wrong row tells them not to.

The fix is one edit to `docs/_constraints/pdlc-engine-baseline.md` and one word in §1.2a: restate
the AC-4.4 row as partially green with its unasserted half named (the run-stops assertion and
AC-4.1's catalogue naming), drop AC-4.4 from §1.2a's "Red at HEAD" list, and — in the same edit,
since it is the same contradiction — move AC-4.1 off "green" to partially green with its
set-equality half named (F-26). F-27 is a one-cell citation addition worth taking while the file
is open. Nothing in the REQ's criteria text needs to change, and no approved decision reopens.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
