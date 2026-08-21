# TSPEC — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | se-author |
| Version | 1.1 |
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-product-manager-TSPEC-v1.md`, `CROSS-REVIEW-test-engineer-TSPEC-v1.md` |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

**Revision history.**

| Version | Change |
|---|---|
| 1.0 | Initial authoring. |
| 1.1 | Round-1 cross-review revision. Provenance is announced as a clause **appended outside** the existing punctuation, and the shipped assertions that nonetheless change are enumerated by `file:line` with their replacements (§2.4; TE F-01, PM F-01). The ancestry probe stays **lazy** and gains a call-count oracle (§2.2, §2.3, §3.2, AT-03/AT-11; TE F-02, PM F-05). AT-06 compares configs differing only in the `startWave` key (TE F-03, PM F-02); AT-16 states the oracle real delegation can honestly carry (DEC-WVR-07; TE F-04, PM F-03). Added: the operator resume banner to §2.3 (TE F-05), a generative property suite (§5.3, §5.7; TE F-06), the coverage-floor obligation (§5.8, RT-7; TE F-07), the two named harness extensions (§5.2; TE F-08), the `⏭` provenance conjunct (AT-12; TE F-09), AT-14’s ordering precondition (TE F-10), and IG-6’s positive conjunct and named closure home (AT-02; PM F-04). A-2 restated on the coverage this feature adds (PM F-06). Lows: DC-08 miscitation dropped (PM F-07), BR ids added to §2.6 (PM F-08), baseline citations version-qualified (PM F-09), `ReasonContext` given a constructor (TE F-11), `lastGreenWave`’s consumer named (TE F-12), the no-echo rule restated at AT-02 (TE F-13), and the announcement table given a set-equality oracle (AT-13; TE F-14). |

## 1. Overview

This TSPEC discharges FSPEC OB-F2: it **ratifies the shipped interim wave-ledger contract and
formalises it**, rather than inventing a second mechanism alongside it (REQ BL-03, R-4). The
mechanism that implements automatic Phase I wave resume already exists on the default branch,
marked INTERIM in its own comments and deliberately contained so this feature could replace it
cleanly. This document names that contract, states the **delta** between it and the behaviour
FSPEC specifies, and owns the location, encoding, matching procedure and write mechanics the FSPEC
deliberately left unstated (REQ OB-1).

**Nothing here is a new product decision.** Every behavioural clause traces to an FSPEC BR/EC/AT
and thence to a REQ criterion; where the shipped code and the FSPEC disagree, this TSPEC changes
the code, not the spec.

### 1.1 Grounding, and the prerequisite that is not met

REQ BL-04 requires the resume mechanism and `docs/_constraints/pdlc-wave-gate-baseline.md` to be
readable in the authoring tree. They are **not**. This branch is 1,637 commits behind the default
branch (`git rev-list --count HEAD..origin/main` → 1637) and contains neither: `grep -n
WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` returns nothing in this tree, and
`docs/_constraints/pdlc-wave-gate-baseline.md` does not exist here.

Every claim below about shipped behaviour is therefore verified against **`origin/main` at
`345ae358`**, by name — exported symbol, function name, comment text or config key, per DEC-DOC-01
— so that it re-verifies after the rebase that OB-F1 owes. Commands are given in the form
`git show origin/main:<path> | grep -n <symbol>`, which a reviewer can run from this tree today.

| # | Claim about shipped behaviour | Verified by (all against `origin/main`) |
|---|---|---|
| V-1 | The record's path is a single exported constant, `.claude/pdlc-wave-state.json` | `WAVE_STATE_PATH` in `pdlc/workflows/orchestrate-dev.js` |
| V-2 | Reading the record is total and never throws: three outcomes — silent no-record, ignored-with-reason, well-formed | `parseWaveLedger`, whose doc comment enumerates the three; `{}` and `""` both return `{state: null, reason: null}` |
| V-3 | The plan fingerprint is FNV-1a over wave order, task ids and owned paths, 8 hex digits, explicitly "not a cryptographic digest" | `computePlanHash` |
| V-4 | The written record is `{version: 1, feature, planHash, lastGreenWave}` plus optional `head` | `formatWaveLedger` |
| V-5 | An operator pointer is judged explicit **before** the out-of-range clamp, so a past-the-end pointer still suppresses the record | `const explicitPointer = startWave > 1;`, evaluated above the `if (startWave > waves.length)` clamp |
| V-6 | The record is consulted only when no explicit pointer is in force | the `if (!explicitPointer) {` block that wraps the whole read/decide chain |
| V-7 | Ancestry is corroborated by `git merge-base --is-ancestor`, and both "no commit recorded" and "no transport to ask" return `true` | `headCorroborated`, whose two early returns are commented "pre-`head` record: honoured as before" and "no transport to ask — not evidence of absence" |
| V-8 | Commits **and** the record write are guarded by the git transport, not by the gate mode | the `if (waveGit)` branch opening under the comment "Only now — verified — does anything get committed (M-6)", with the `writeWaveLedger(formatWaveLedger(...))` call as its last statement |
| V-9 | The write is per wave, best-effort, and a failure is a notice | `writeWaveLedger`'s `try/catch` emitting "Notice: could not …. The run continues" |
| V-10 | The record survives a completed Phase I | the comment "The record is KEPT" above the `allWavesRecorded` report row |
| V-11 | The complete-record case skips every wave and records a `⏭` Phase I row | `allWavesRecorded = true; startWave = waves.length + 1;` and the `recordPhase("I", "Implementation", "⏭", …)` arm |
| V-12 | Exactly one force-a-full-run hatch is announced, in both banners | the string `to force a full run` in the mid-plan resume banner and, wrapped across a line break, in the `Skipping Phase I (wave ledger` banner |
| V-13 | The recognised `implementation.*` keys are exactly four | `IMPLEMENTATION_DEFAULTS` — `testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave` |
| V-14 | The record's exclusion is anchored by a root-anchored ignore rule with a stated rationale | `.gitignore` line `/.claude/pdlc-wave-state.json`, under the comment block explaining why the anchor matters for the checked-in fixture tree |
| V-15 | The queue path delegates the whole pipeline in-process | `orchestrate-queue.js` imports `orchestrate-dev`'s default export as `realMain` and returns the delegated report as `pipelineReport` |
| V-16 | Behaviour is exercised today by integration tests through `main()` | the `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` block in `pdlc/workflows/__tests__/waveExecution.test.js` |
| V-17 | Phase PT's V-wave dispatches one agent and, under a script-owned gate, invokes the gate once, unconditionally after the wave loop | `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")`, its single `withDispatchRetry(() => agentFn("se-implement", propertiesTestPrompt(...)))`, and the `if (scriptGate) { const vGate = await runCommandFn(implConfig.testCommand); … }` arm |
| V-18 | The operator resume banner is emitted from its own `if (startWave > 1)` block, **after** the past-the-end clamp and **before** the `if (!explicitPointer)` block — so it is a separate announcement from the record's resume banner, and a clamped pointer produces the notice but not the banner | the `emit` whose first line is `Resuming at wave ${startWave} of ${waves.length} (implementation.startWave).` and whose last sentence is `Clear implementation.startWave before the next fresh run.` (added at round 1, TE F-05) |
| V-19 | A record rejected for feature mismatch or plan-hash mismatch issues **zero** `merge-base` subprocess calls: the ancestry probe is the third arm of the `else if` chain, below `recorded.feature !== featureName` and `recorded.planHash !== planHash` | the ordering of the `else if` chain inside `if (!explicitPointer)`, with `await headCorroborated(recorded.head)` appearing only in the third arm (added at round 1, TE F-02) |

### 1.2 The delta this feature implements

The shipped mechanism satisfies most of the FSPEC already. What follows is the complete list of
places where it does not, each with the clause that fails and the change owed. **These rows are
the feature's scope**; everything else is ratification plus tests.

| # | Gap | Clause that fails | Change owed |
|---|---|---|---|
| D-1 | The block is marked INTERIM and describes itself as contained "so that feature can replace it cleanly". Leaving the marker after this feature ships is exactly R-4's "interim/final divergence". | REQ BL-03, R-4 | Replace the INTERIM commentary with the formalised contract, citing this TSPEC. No behavioural change. |
| D-2 | No announcement carries a **provenance** token. The banners name the *source* (`implementation.startWave`, `wave ledger …`); an operator or a test must infer `operator-set` / `automatic` from it. | FSPEC BR-07, §2 "Announcement" | Emit provenance as announced content in every announcing outcome (§2.4, §3.3). |
| D-3 | The **executed** Phase I report row reads `All N waves complete (wave mode, …)` — it states neither the resume point nor its provenance. Only the `⏭` skip row names the record. | REQ-WVR-01 ("the run log **and final report** state the resume point and its provenance"), FSPEC AT-01 | Extend the `✅` row's detail with resume point and provenance (§2.4). |
| D-4 | The `{}` "cleared" shape is tolerated by the reader and written by nothing. | FSPEC OB-F3 | Decided in §6: **keep the read tolerance, add no writer**. No code change; the decision is recorded and tested. |
| D-5 | `parseWaveLedger`, `computePlanHash` and `formatWaveLedger` are reachable only through `main()` for the resume decision itself: there is no unit-level test of `parseWaveLedger`'s reason strings, and no set-equality assertion over the ignore reasons or the three outcomes. | FSPEC OB-F5, AT-02, AT-13 | Extract the decision as a pure classifier (§2.2) and add the three transcribed set-equality suites (§5). |
| D-6 | No test covers EC-15a — a run where an early write succeeds and a later one fails. | FSPEC AT-15 arm 2 | Add the discriminating test (§5). |
| D-7 | Nothing asserts the ignore rule itself, nor the record's absence from any commit. | FSPEC AT-14, REQ-WVR-10 | Add the ignore-rule assertion (§5); RED in this tree until OB-F1's rebase. |
| D-8 | Nothing asserts queue/direct parity of resume point and provenance. | FSPEC AT-16, REQ-WVR-07 | Add the parity test over `realMain` (§5). |
| D-9 | Nothing asserts that this feature's PLAN claims the record in no wave's owned-path set. | FSPEC OB-F6, EC-16 | Add the per-feature ownership assertion (§5). |
| D-10 | `docs/_constraints/pdlc-wave-gate-baseline.md` carries no `M-WVR-*` section. | FSPEC OB-F4, REQ OB-2 | Append a new section at the next unoccupied number with `M-WVR-1..2` and bump the file's `Version` (§6). |
| D-11 | Three shipped assertions pin announcement and report text by **whole-string equality**, so D-2's and D-3's changes cannot be additive for them. Leaving this to be discovered inside an implementation wave is how the regression net RT-2 depends on gets weakened by improvisation. | consequence of D-2, D-3 | Update exactly the three assertions §2.4 enumerates by `file:line`, each to the new whole string transcribed as a literal — never to a relaxed matcher. No other assertion in the ledger `describe` changes. |

**What is explicitly *not* changed.** The path constant, the record's field names and version, the
FNV-1a fingerprint, the evaluation order of the disregard causes, **the laziness of the ancestry
probe** (§2.3: a record rejected at the feature or plan-hash guard still issues zero `merge-base`
subprocess calls), the transport-guarded write site, the fail-open posture of every read, and the
retention of a complete record. Each is ratified as specified; changing any of them would be a
re-litigation of a decision the REQ already closed.

### 1.3 Scope boundaries carried from upstream

- *Phase I* means the **implementation wave loop**. Phase PT's V-wave (V-17) is outside the resume
  record's scope and replays on every invocation (FSPEC §2, EC-20, BR-11).
- Worktrees fail open. A Claude-created worktree does not carry `.claude/pdlc-wave-state.json`, so
  the record is absent there and the run is a silent full one (FSPEC EC-17). This is a consequence
  of consumer-local state, not of any rule this TSPEC adds; see §6 for the citation defect the REQ
  carries about it.
- Wave halts write **no POSTMORTEM** (`pdlc-wave-gate-baseline.md` `M-WG-5`, at `Version | 1.2 ·
  2026-08-20`), so there is no
  `RESOLVED:` lifecycle for this feature to coordinate with. Stated here rather than assumed, per
  REQ OB-1.
- The queue row lifecycle is orthogonal: a human resets `halted → pending`; the record governs
  only where the re-run's Phase I starts (REQ OB-1).

## 2. Architecture

### 2.1 Where the code lives, and why it stays there

All of it is in `pdlc/workflows/orchestrate-dev.js`: three module-level pure functions plus one
read-site and one write-site inside `main()`'s Phase I wave branch. No new module, no new file, no
new host capability (REQ C-3, FSPEC BR-17).

The module is a **restricted dialect** (project CLAUDE.md, `pdlc/workflows/*.js`): no `import`, no
`fs`, no `process`, no `fetch`. Everything that touches the world arrives as an injected seam. That
is why `computePlanHash` is FNV-1a arithmetic rather than a digest — there is no crypto seam in
this module — and why the record is read through `readMergeConfigSafely` and written through
`writeFileFn` rather than through any direct IO. **Cite-and-reuse:** `readMergeConfigSafely` is the
shipped never-throwing reader the merge and implementation configs already use; this feature reuses
it rather than adding a second total reader, and `parseWaveLedger`'s total, never-throwing,
per-key-independent shape is modelled on `parseImplementationConfig`, as that function's own doc
comment records.

The built artifacts under `pdlc/workflows/dist/` are **generated**. Every change lands in the
source module; `node pdlc/workflows/build-runtime.mjs` regenerates the artifacts, and
`pdlc/hooks/scripts/sync-workflows.sh` copies them into the untracked consumer tree. A wave whose
tasks edit the source module owns the regenerated artifacts through `implementation.postWavePathspecs`,
which is why the post-wave command runs before the gate (`pdlc-wave-gate-baseline.md` `M-WG-2`, at
`Version | 1.2 · 2026-08-20`).

### 2.2 The decision, extracted as a pure classifier

Today the decision is an `if/else if` chain inline in `main()`, interleaved with `emit` calls and
one `await`ed ancestry probe. It is correct, and every arm is reachable only through a full
`main()` run. That is what makes AT-02's set equality over **announced reasons** and AT-13's set
equality over **outcomes** impossible to write honestly: a test would have to enumerate what the
chain happens to emit, which is reading the expectation back out of the mechanism under test.

**The chain is therefore extracted, unchanged in behaviour, into one pure total function**
(`classifyWaveLedger`, §3.2). The extraction is deliberately minimal:

- **What moves:** the ordered decision — feature match, plan-hash match, ancestry verdict,
  over-count, complete, mid-plan — and the choice of reason code for each rejection.
- **What does not move:** the `await`ed `git merge-base --is-ancestor` probe, the `emit` calls, and
  the report row. The classifier receives ancestry as an already-resolved boolean (`headOk`) and
  returns a *description* of the outcome; `main()` performs the IO and the announcing.

**The probe stays lazy, and that is a contract, not an incident (TE F-02, PM F-05).** Shipped, the
probe is the *third* arm of the `else if` chain, so a record naming another feature or written
against another plan is rejected with **zero** `merge-base` subprocess calls. A classifier taking a
resolved boolean would, naively called, resolve it for every well-formed record — one new git
subprocess on paths that had none, which is precisely the "no new IO" claim of §3.4 quietly
becoming false. The call site therefore resolves ancestry **only when the decision turns on it**:

```
d := classifyWaveLedger(parsed, {…, headOk: true})      # optimistic, pure, no IO
if d.code ∈ ANCESTRY_INDEPENDENT_CODES:                 # IG-6, IG-1a/b/c, IG-2, IG-3
    use d                                               # zero probes, exactly as shipped
else if not await headCorroborated(parsed.state.head):  # at most ONE probe, ever
    d := classifyWaveLedger(parsed, {…, headOk: false}) # → IG-5, since guard 5 precedes guard 6
```

`ANCESTRY_INDEPENDENT_CODES` is `{null, "unreadable-json", "not-an-object", "wrong-shape",
"feature-mismatch", "plan-changed"}` — exactly the outcomes guards 1–4 of §3.2 decide, i.e. the
guards that sit above the ancestry guard. The second classifier call is pure, so it costs no IO;
the record's `head` being absent still costs no subprocess, because `headCorroborated` returns
`true` before reaching the transport (V-7). The resulting call counts are the shipped ones and are
asserted as such: **zero** `merge-base` invocations on a feature-mismatch and on a plan-hash-mismatch
fixture, **exactly one** on the ancestry fixture (§5.4 AT-03, AT-11).

This keeps every seam where it is (no new injection point) while making the decision a value a
unit test can assert over. `parseWaveLedger` keeps its current job — turning bytes into
`{state, reason}` — so the two functions compose as *shape* then *match*.

The classifier is **total**: every input resolves to exactly one of the three outcomes of FSPEC
BR-01, which is what makes BR-01's closure mechanically checkable rather than asserted in prose.

### 2.3 Control flow at Phase I entry

Ordering below is normative and matches the shipped chain; FSPEC §3.2 already ratified that this
order — ancestry (IG-5) **before** over-count (IG-4) — is the specification, not the REQ's IG
numbering (FSPEC BR-03, AT-03).

```
waves := computeWaves(parsePlanTasks(PLAN), parsePlanOwnership(PLAN))
planHash := computePlanHash(waves)

startWave := implConfig.startWave                       # parseImplementationConfig, default 1
explicitPointer := startWave > 1                        # judged BEFORE the clamp (V-5)
if startWave > waves.length:                            # out of range → full run, still explicit
    emit(pointer-past-end notice, provenance=operator-set)
    startWave := 1

if startWave > 1:                                       # the OPERATOR resume banner, shipped
    emit("Resuming at wave N of M (implementation.startWave). … Clear implementation.startWave
          before the next fresh run." + provenance=operator-set)

if not explicitPointer:                                 # V-6: the record is consulted only here
    raw    := readMergeConfigSafely(_readFile, WAVE_STATE_PATH)
    parsed := parseWaveLedger(raw)                      # → {state, reason}
    d      := classifyWaveLedger(parsed, {feature, planHash, waveCount: waves.length, headOk: true})
    if d.code not in ANCESTRY_INDEPENDENT_CODES:        # §2.2 — at most one probe, and only here
        if not await headCorroborated(parsed.state.head):
            d := classifyWaveLedger(parsed, {…, headOk: false})
    apply d:                                            # §3.2 return shape
        outcome "full-run"   → startWave stays 1; emit d.reason unless d.silent
        outcome "resume"     → startWave := d.startWave; ledgerResume := true; emit resume banner
        outcome "skip-phase" → startWave := waves.length + 1; allWavesRecorded := true; emit skip banner

for waveIndex in 0 .. waves.length-1:
    if allWavesRecorded: break
    if waveNum < startWave: emit per-wave skip line (naming the source); continue
    dispatch → post-wave command → gate → (only if green) commit → write record
```

The operator resume banner is emitted **between the clamp and the `!explicitPointer` guard**, exactly
where the shipped chain emits it (V-18): its condition is the post-clamp `startWave > 1`, so a
past-the-end pointer that clamped back to 1 produces the past-the-end notice and *no* resume banner.
It is the announcement that carries `provenance: operator-set` for outcome (b) — §2.4 row (b),
operator pointer — and §5.4 AT-05 names it as the announcement the token must be found on, so the
token cannot be satisfied by appearing on some other line.

`headCorroborated` stays exactly as shipped, including both fail-open returns (V-7): a record with
no `head` and a run with no transport both answer `true`, because an unanswerable probe is not a
staleness finding (FSPEC EC-07, EC-21).

### 2.4 Announcements and the report row (D-2, D-3)

FSPEC BR-07 makes provenance **announced content**, and FSPEC §2 lets a test assert that an
announcement *conveys* `operator-set` or `automatic`. The shipped banners convey the source but
never those words, so this TSPEC introduces a frozen two-member vocabulary (`RESUME_PROVENANCE`,
§3.1) and appends it to each announcement as a trailing parenthesised clause. The
suffix is appended **after the sentence's terminal punctuation and outside every existing
parenthesis** — never interpolated inside one — so that every shipped assertion matching on a
*prefix* or on an interior *substring* is untouched:

| Outcome | Announcement (existing text, unchanged) | Appended, after the final `.` |
|---|---|---|
| (a) full run, operator pointer past the end | `Notice: implementation.startWave=N in {cfg} is past the last wave of this plan (M) — running every wave from 1.` | ` (provenance: operator-set)` |
| (a) full run, disregarded record | `Notice: the wave ledger {path} was ignored — {reason}. Running every wave from 1.` | ` (provenance: automatic)` |
| (a) full run, no record (IG-6) | *(nothing)* | *(nothing — silence is the specification, FSPEC BR-02)* |
| (b) resume mid-plan, operator pointer | `Resuming at wave N of M (implementation.startWave). … Clear implementation.startWave before the next fresh run.` | ` (provenance: operator-set)` |
| (b) resume mid-plan, record | `Resuming at wave N of M (wave ledger {path}). … Delete {path} to force a full run.` | ` (provenance: automatic)` |
| (c) skip Phase I | `Skipping Phase I (wave ledger {path}): all M waves … Delete {path} to force a full run.` | ` (provenance: automatic)` |

The suffix is **content, not wording**: FSPEC's "announcement content, not wording" note governs,
and PROPERTIES asserts that the announcement conveys the token, not that the sentence is
byte-identical.

The **report** carries the same two facts on one Phase I row (FSPEC EC-09's "one row with a
distinguishing status, not a second row"):

| Case | Status | Detail |
|---|---|---|
| Executed from wave 1, no resume | `✅` | `All M waves complete (wave mode, {gate})` — unchanged |
| Executed from wave N > 1 | `✅` | `Waves N–M complete, waves 1–(N-1) skipped as previously completed (wave mode, {gate}) (provenance: {p})` |
| Skipped in full | `⏭` | `Skipped — all M waves previously committed and recorded green (wave ledger) (provenance: automatic)` |

The `⏭` row keeps its shipped text **whole** — the token goes outside the parenthesis, not inside it
— so `expect(row.detail).toContain("recorded green (wave ledger)")` (the complete-record test, `it("a
matching record whose waves are all green skips Phase I whole, and the row says so")`,
`waveExecution.test.js:2682` on `origin/main`) still passes unchanged. The `✅` row is the same shape:
the shipped `All M waves complete (wave mode, {gate})` string is used verbatim for a run that starts
at wave 1, and the resume variant is a different sentence rather than a decoration of it.

#### The three shipped assertions that do change (D-11, TE F-01, PM F-01)

An appended clause is invisible to a prefix or substring matcher but **not** to whole-string
equality, and three shipped assertions are whole-string equality. They change; there is no wording
that avoids it, so they are named here and their replacements specified, rather than improvised
inside an implementation wave against the very regression net RT-2 relies on. Line numbers are
against `origin/main` at `345ae358` and are given only as a locator — each row names the enclosing
test, which is the stable citation (DEC-DOC-01).

| # | Enclosing test (`pdlc/workflows/__tests__/waveExecution.test.js`) | Shipped assertion | Replacement |
|---|---|---|---|
| 1 | `it("a pointer past the last wave runs every wave, and says so")`, `:2137-2141` | `expect(logs).toContain(` + the past-the-end notice string — `toContain` on an **array** is element equality | The same assertion, its expected string extended with the literal ` (provenance: operator-set)` transcribed from the table above. Still element equality. |
| 2 | `it.each([…])("%s is ignored with a notice, and every wave runs")`, `:2652-2657`, all four members | `expect(logs).toContain(` + the ignored-record notice string | The same assertion, its expected string extended with the literal ` (provenance: automatic)`. Still element equality, still all four members. |
| 3 | `it("skips the waves before the pointer entirely — no dispatch, no gate, no commit")`, `:2117-2118` | `expect(phaseDetail(result, "I")).toBe("All 3 waves complete (wave mode, script-owned gate)")` — this run resumes at wave 2, so **D-3** changes its detail | `expect(phaseDetail(result, "I")).toBe("Waves 2–3 complete, waves 1–1 skipped as previously completed (wave mode, script-owned gate) (provenance: operator-set)")` — whole-string equality, the new string transcribed as a literal. |

Three constraints on those edits, stated so a reviewer can check them mechanically:

- **No matcher is relaxed.** Replacing `toContain(exactString)` with `some(m => m.startsWith(…))`
  is forbidden: it would retire the exact-wording oracle that pins these notices today, which is a
  strictly larger change than the one this feature owes.
- **No other assertion in the ledger `describe` changes.** In particular the four prefix matchers —
  `startsWith("Resuming at wave 2 of 3")` (`:2113`), `startsWith("Resuming at wave 2 of 3 (wave
  ledger")` (`:2294`), `startsWith("Resuming at wave 3 of 3 (implementation.startWave)")` (`:2618`),
  and the two `some(m => m.startsWith("Resuming at wave")) === false` negatives (`:2163`, `:2658`) —
  are unaffected by an appended clause, and RT-2's regression net is otherwise intact.
- **The diff is one task.** The three edits land in the same task as the announcement change that
  forces them, never as a later "fix the suite" task, so the round's change to the net is reviewable
  as one thing.

#### What the report carries on a **halted** run (PM Q-01)

Both `recordPhase("I", …)` calls sit after the wave loop, so a run that halts mid-Phase-I produces
neither row — as shipped, and unchanged here. This is deliberate and in scope as stated:
REQ-WVR-01's "run log and final report" is discharged on the run log for a halted run (the resume
banner is emitted at Phase I entry, before any wave is dispatched) and on both surfaces for a run
that completes Phase I. FSPEC AT-18's middle run is exactly this case and asserts on the log. No
resume-point row is added to the halt path: doing so would be a report-shape change the FSPEC does
not ask for, and a wave halt already names the failing wave in the halt message it throws
(`Error: Wave N test gate failed — …`), which is what the run surfaces in place of a Phase I row.

### 2.5 What the run writes, and when

Unchanged from shipped, and ratified here as the contract:

1. The write happens **inside** the `if (waveGit)` branch (V-8) — the same branch that guards the
   commits. A run with no git transport commits nothing and therefore records nothing, which is
   REQ-WVR-09 and FSPEC EC-13. The guard is the **transport**, not the gate mode: a self-report-gate
   run with a transport records normally (FSPEC AT-09's companion arm).
2. It happens **after** the wave's pathspec-scoped commits, never beside the gate, so a wave is
   recorded only once its work is on the branch (FSPEC BR-08).
3. It is **per wave** and **best-effort**: `writeWaveLedger` catches, emits a notice, and continues
   (V-9). A run in which some writes succeed and a later one fails leaves the last successfully
   written record in place, so the next invocation resumes from there (FSPEC EC-15a, AT-15 arm 2).
4. `head` is stamped from `git rev-parse HEAD` after those commits, best-effort: a transport that
   cannot answer yields `head: null`, which the reader honours (V-7).
5. Each write carries `lastGreenWave = waveNum`, the **plan-absolute** wave number, not a count of
   waves this run executed — which is what makes completion the high-water property FSPEC BR-08
   requires and AT-18 discriminates on.

**One interaction the FSPEC does not state, recorded here and routed upstream.** The write site is
outside the `!explicitPointer` guard, so a run started at wave N by an operator pointer records
`lastGreenWave = N` for a wave the *operator*, not the pipeline, asserted the predecessors of. The
damage is bounded exactly as FSPEC BR-10 bounds it — the first executed wave's gate verifies the
whole tree, so an un-run predecessor reds the gate rather than shipping — but the behaviour is
unspecified upstream. Ratified as-is (changing it would make an operator-pointer run unable to
record anything, losing resume for the very recovery path the feature serves); raised as an
erratum against the FSPEC so the clause exists.

### 2.6 Requirement → component map

| Requirement | FSPEC business rules | Component |
|---|---|---|
| REQ-WVR-01 | BR-07 (provenance is announced), BR-08 (completion is a high-water property) | `classifyWaveLedger` `resume` outcome; resume banner; `✅` report detail (§2.4) |
| REQ-WVR-02 | BR-02, BR-03, **BR-12** (no state of the record may make the pipeline refuse to run — the fail-open posture of §3.4) | `parseWaveLedger` reasons + `WAVE_IGNORE_REASONS` codes (§3.1); classifier's rejection arms |
| REQ-WVR-03 | BR-10 (skipping skips dispatch only), BR-11 | unchanged wave loop: gate before commit; skipping skips dispatch only |
| REQ-WVR-04 | **BR-04** (an explicit pointer outranks the record and suppresses consultation), **BR-05** (`1` is not a setting, past-the-end is), BR-06 (§3.5) | `explicitPointer`, evaluated above the clamp (V-5); the operator resume banner (V-18); `RESUME_PROVENANCE` |
| REQ-WVR-05 | BR-13 (retention; staleness is proved at read time) | retention — no clearing write; reader-side invalidation in the classifier |
| REQ-WVR-06 | BR-09 (falsification, not archaeology) | classifier reads only the record; `headCorroborated` is falsification, not archaeology |
| REQ-WVR-07 | **BR-16** (delegated and direct runs resolve the same outcome, resume point and provenance) | no queue-specific code: `orchestrate-queue` delegates to `realMain` (V-15); §5.4 AT-16 |
| REQ-WVR-08 | BR-11 (the wave loop lands nothing under outcome (c)) | `skip-phase` outcome, `allWavesRecorded` break, `⏭` row |
| REQ-WVR-09 | BR-08, BR-15 (best-effort, per-wave writes) | write site nested in the `if (waveGit)` transport branch (V-8) |
| REQ-WVR-10 | **BR-14** (never tracked content, anchored by an ignore rule), BR-17 | `WAVE_STATE_PATH` under the root-anchored `.gitignore` rule (V-14); no pathspec names it |

The five business rules PM F-08 found covered in substance but uncited are bolded above; each now
names the component that carries it, so FSPEC §4 coverage is checkable by reading one column rather
than by reconstruction.

## 3. Interfaces

Signatures are given in TypeScript notation for precision; the module itself is JavaScript with
JSDoc, and the JSDoc blocks are the shipped convention this feature follows.

### 3.1 Frozen catalogues (new)

Three closed catalogues, each `Object.freeze`d and each **transcribed** into a test as a literal
so a deletion or an addition reds an assertion rather than passing one (FSPEC OB-F5). Precedent
and shape: `ADVISORY_SEAMS` and `ENVELOPE_DEFAULTS`, whose transcribed set-equality discipline is
the baseline's `M-WG-8`/`M-WG-9`/`M-WG-13`/`M-WG-14`.

```ts
/** FSPEC BR-01 — the outcome catalogue, closed at three. */
export const RESUME_OUTCOMES: readonly ["full-run", "resume", "skip-phase"];

/** FSPEC BR-07 — the provenance vocabulary, closed at two. */
export const RESUME_PROVENANCE: readonly ["operator-set", "automatic"];

/**
 * FSPEC BR-02 / AT-02 — the announced disregard reasons, keyed by code.
 * Seven codes, because IG-1 has three distinguishable arms; IG-6 is silent and
 * carries no code. Each value renders the reason clause that follows
 * "the wave ledger ... was ignored — ".
 */
export const WAVE_IGNORE_REASONS: Readonly<Record<WaveIgnoreCode, (ctx: ReasonContext) => string>>;

type WaveIgnoreCode =
  | "unreadable-json"   // IG-1a — parseWaveLedger: "it is not readable JSON"
  | "not-an-object"     // IG-1b — parseWaveLedger: "it is not a JSON object"
  | "wrong-shape"       // IG-1c — parseWaveLedger: "its fields are not the shape this workflow writes"
  | "feature-mismatch"  // IG-2
  | "plan-changed"      // IG-3
  | "head-unreachable"  // IG-5
  | "over-count";       // IG-4
```

**Why codes and not strings.** Four of the seven reasons interpolate run-specific values (the
recorded feature name, the recorded commit's short sha, the recorded and actual wave counts), so a
set-equality assertion over rendered sentences would be an assertion over fixture data. The codes
are the closed set; the renderers are the wording, governed by FSPEC's "content, not wording" note.
The three `parseWaveLedger` arms keep their **exact shipped sentences** as their renderers, so no
shipped assertion changes.

### 3.2 The pure decision (new)

```ts
interface ReasonContext {
  feature: string;        // the feature this run is for
  recordedFeature?: string;
  recordedHead?: string | null;
  recordedWaves?: number;
  waveCount: number;      // waves this plan derives
}

interface ClassifyInput {
  parsed: ParsedWaveLedger;   // §4.2 — the output of parseWaveLedger, verbatim
  feature: string;
  planHash: string;
  waveCount: number;          // waves.length, always >= 1
  headOk: boolean;            // the already-resolved ancestry verdict (§2.2)
}

type WaveResumeDecision =
  | { outcome: "full-run";   startWave: 1;               provenance: "automatic"; silent: true;  code: null }
  | { outcome: "full-run";   startWave: 1;               provenance: "automatic"; silent: false; code: WaveIgnoreCode; reason: string }
  | { outcome: "resume";     startWave: number;          provenance: "automatic"; lastGreenWave: number }
  | { outcome: "skip-phase"; startWave: number;          provenance: "automatic" };

/**
 * Pure and total. Never throws, never reads, never emits. Given a parsed record
 * and this run's context, returns exactly one decision.
 */
export function classifyWaveLedger(input: ClassifyInput): WaveResumeDecision;
```

**Totality is the contract.** For every `ClassifyInput`, `outcome` is a member of
`RESUME_OUTCOMES` and `provenance` a member of `RESUME_PROVENANCE`. The `operator-set` provenance
never originates here: an explicit pointer means the classifier is not called at all (V-6), and
`main()` labels that path itself.

**Evaluation order (normative, FSPEC §3.2/BR-03), first failure wins:**

| Order | Guard | On failure |
|---|---|---|
| 1 | `parsed.state == null && parsed.reason == null` | `full-run`, `silent: true`, `code: null` — IG-6 |
| 2 | `parsed.reason != null` | `full-run`, `code` ∈ {`unreadable-json`, `not-an-object`, `wrong-shape`} — IG-1 |
| 3 | `parsed.state.feature === feature` | `full-run`, `code: "feature-mismatch"` — IG-2 |
| 4 | `parsed.state.planHash === planHash` | `full-run`, `code: "plan-changed"` — IG-3 |
| 5 | `headOk === true` | `full-run`, `code: "head-unreachable"` — IG-5 |
| 6 | `parsed.state.lastGreenWave <= waveCount` | `full-run`, `code: "over-count"` — IG-4 |
| 7 | `parsed.state.lastGreenWave === waveCount` | `skip-phase`, `startWave = waveCount + 1` |
| — | otherwise | `resume`, `startWave = lastGreenWave + 1` |

Guard 2's code is carried by `parseWaveLedger`, which is the only place that can distinguish the
three arms; the classifier maps its `reason` string to the code through
`WAVE_IGNORE_REASONS`' inverse. Equivalently — and this is the implementer's choice, not a
behavioural one — `parseWaveLedger` may return the code alongside the reason, provided its shipped
three-outcome signature and its exact reason sentences are preserved.

### 3.3 Existing exports, ratified unchanged

```ts
export const WAVE_STATE_PATH: ".claude/pdlc-wave-state.json";
export function computePlanHash(waves: Array<Array<{ id: string; files: string[] | null }>>): string;
export function parseWaveLedger(text: string | null): ParsedWaveLedger;
export function formatWaveLedger(
  feature: string, planHash: string, lastGreenWave: number, head?: string | null
): string;
export const IMPLEMENTATION_DEFAULTS: Readonly<{
  testCommand: null; postWaveCommand: null; postWavePathspecs: readonly []; startWave: 1;
}>;
export function parseImplementationConfig(text: string | null): {
  config: ImplementationConfig; sectionMalformed: boolean; invalidKeys: string[];
};
export async function readMergeConfigSafely(readFileFn: ReadFile, path: string): Promise<string | null>;
```

No signature above changes. `formatWaveLedger`'s optional `head` stays optional on both write and
read (V-4, V-7).

### 3.4 Injected seams used (all pre-existing)

| Seam | `main()` parameter | Use here | Failure posture |
|---|---|---|---|
| Read | `_readFile` | the record, via `readMergeConfigSafely` | throw → `null` → IG-6 silent full run |
| Write | `_writeFile` | the record, via `writeWaveLedger` | throw → notice, run continues (FSPEC BR-15) |
| Git | `_git`, resolved through `branchGuardTransport` | `merge-base --is-ancestor`, `rev-parse HEAD`, the wave commits | absent → no commits, no record (REQ-WVR-09); probe absent → `headOk = true` |
| Command | `_runCommand` | the wave gate and the post-wave command | absent → self-report gate; **does not** affect the record's write guard |
| Log | `emit` | every announcement of §2.4 | — |
| Report | `recordPhase` | the single Phase I row | — |

**No new seam is introduced.** That is REQ C-3 discharged structurally rather than by assertion:
the diff adds no parameter to `main()` and no capability to the runtime adapter.

### 3.5 Configuration surface

Unchanged and closed at four keys (V-13): `testCommand`, `postWaveCommand`, `postWavePathspecs`,
`startWave`. **No key is added** — in particular no `forceFullRun`, which REQ OQ-1 decided against;
the sole hatch is deleting `WAVE_STATE_PATH`, and it is named in the outcome (b) and (c)
announcements (V-12, FSPEC BR-06). `startWave` remains a resume-point *selector*: `1` is
indistinguishable from unset (FSPEC AT-06) and a past-the-end value is a full run (AT-07).

## 4. Data Model

### 4.1 The record on disk

Path: `.claude/pdlc-wave-state.json` (`WAVE_STATE_PATH`, V-1). Consumer-local, untracked, excluded
by a **root-anchored** `.gitignore` rule (V-14). The anchor is load-bearing and is ratified as
such: an unanchored `.claude/pdlc-wave-state.json` pattern would match at every depth and reach the
checked-in fixture trees under `pdlc/`, which is the same reasoning the sibling
`/.claude/workflows/` rule records. Precedent for the location: the drift-state record the
`check-workflow-drift` hook writes, also consumer-local and untracked.

Encoding: pretty-printed JSON, two-space indent, newline-terminated (`formatWaveLedger`, V-4) —
deliberately human-readable, because the reader who matters most is a person debugging a resumed
run.

```json
{
  "version": 1,
  "feature": "pdlc-wave-resume",
  "planHash": "3fa91c07",
  "lastGreenWave": 4,
  "head": "4f0c1d9a3b8e5c2170fd94ab6e13c2d5081ff7a2"
}
```

| Field | Type | Written | Read | Meaning |
|---|---|---|---|---|
| `version` | `1` | always | **ignored** | Forward-compat marker. The reader does not gate on it: a future writer that bumps it must decide then whether an older reader should reject it, and today rejecting on version would fail *closed* against a record this same code wrote. |
| `feature` | non-empty string | always | required | The feature the record belongs to. Mismatch → IG-2. |
| `planHash` | non-empty string, 8 lowercase hex | always | required | `computePlanHash(waves)`. Mismatch → IG-3. |
| `lastGreenWave` | integer ≥ 1 | always | required | The **plan-absolute** number of the highest wave committed and recorded, not a count of waves this run ran (§2.5 item 5). `> waveCount` → IG-4; `=== waveCount` → skip-phase; otherwise resume at `+1`. |
| `head` | 40-hex string, or absent | when a git transport answered `rev-parse HEAD` | optional | The commit the recorded wave's work landed on. Absent → honoured on the other fields alone (FSPEC EC-21). Present and unreachable from HEAD → IG-5. |

**Absent, empty, and `{}` are the same state** — `parseWaveLedger` returns `{state: null, reason:
null}` for all three (V-2), which is IG-6: a silent full run. That equivalence is the whole content
of the `{}` "cleared" shape, and §6 records why nothing writes it.

**The record is not an integrity artifact.** `planHash` is FNV-1a (V-3): it answers "is this the
same plan?", not "has anyone tampered with this?". The adversary model is REQ G-2's: whatever the
record says, no new commit lands before the full suite has verified the whole tree, so the worst a
wrong record can do is a full run or a gate halt. This is why the digest question — sha256 versus
FNV-1a — is settled by "no crypto seam in this module" rather than by a security argument.

### 4.2 In-memory types

```ts
/** parseWaveLedger's return — three states, distinguished by which field is null. */
type ParsedWaveLedger =
  | { state: null; reason: null }                       // absent / empty / {}  — IG-6, silent
  | { state: null; reason: string }                     // content, not ours    — IG-1, announced
  | { state: WaveLedgerRecord; reason: null };          // well-formed; still has to MATCH

interface WaveLedgerRecord {
  feature: string;
  planHash: string;
  lastGreenWave: number;   // integer >= 1
  head: string | null;     // normalised: absent, blank, or non-string all become null
}
```

`WaveLedgerRecord` is the **validated** shape: `parseWaveLedger` admits it only when `feature` and
`planHash` are non-empty strings and `lastGreenWave` is an integer ≥ 1, so nothing downstream
re-checks types. `head` is normalised at parse time to `string | null`, which is why
`headCorroborated`'s falsy check is total.

### 4.3 Derived values, computed per run

| Value | Source | Notes |
|---|---|---|
| `waves` | `computeWaves(parsePlanTasks(PLAN), parsePlanOwnership(PLAN))` | The wave layout. `waves.length` is `waveCount`. |
| `planHash` | `computePlanHash(waves)` | Canonical string is `id:file,file` joined by `|` within a wave and `;` between waves, hashed FNV-1a 32-bit, rendered as 8 hex digits. Sensitive to wave order, task ids, task-to-wave assignment, and owned paths — each of which changes what a resume would skip. |
| `startWave` | `implConfig.startWave`, then the decision | 1-indexed. `waveCount + 1` encodes "skip everything". |
| `explicitPointer` | `startWave > 1` **before** the clamp | The one boolean that decides whether the record is read at all. |
| `ledgerResume` | set by the `resume`/`skip-phase` outcomes | Selects which per-wave skip line the loop emits. |
| `provenance` | `operator-set` when `explicitPointer`, else `automatic` | Announced content (§2.4); never persisted. |

### 4.4 What is deliberately not modelled

- **No per-wave list.** The record stores a high-water integer, not a set of completed waves.
  Waves are executed in topological order and the loop is serial, so a set could only ever be a
  prefix; storing one would invite a reader that honours a non-prefix set and skips a wave whose
  predecessor never ran.
- **No timestamps.** Staleness is proved by the reader from feature, plan hash and ancestry (REQ
  G-4, FSPEC BR-13); a clock would add a fourth criterion that neither the REQ nor the FSPEC asks
  for, and this module has no clock seam in Phase I.
- **No task-level state.** Completion is a property of a wave, because the gate is a property of a
  wave. Task-level resume would require trusting a per-task record against a tree the gate has not
  yet verified.
- **No commit list.** One `head` per record, not a history — completion is never inferred from
  commit presence (FSPEC BR-09); `head` exists only to *falsify* the record.

## 5. Test Strategy

### 5.1 The oracle rule this feature lives under

REQ §1 is explicit: **the oracle is an observed resume, never the presence of a code path.** A test
that asserts `classifyWaveLedger` exists, or that greps the module for `WAVE_STATE_PATH`, proves
nothing the three shipped preconditions did not already defeat. Every acceptance test below asserts
one of: a dispatched or undispatched wave (counted), an announced sentence, a report row, or the
bytes written to the record.

Two corollaries, both from the reviewer-oracle clauses this project applies:

- **No implementation echoes.** Every expected value — the seven reason codes, the three outcomes,
  the four config keys, the wave counts — is a **literal transcribed from this TSPEC or the FSPEC**
  into the test, never a value read back out of the module under test. That is what makes AT-02,
  AT-08 and AT-13 able to fail on a deletion.
- **No absence-only oracles.** "No commit was produced" cannot distinguish a skipped wave from one
  that ran with nothing to add. Wherever the FSPEC asks for a skip, the assertion is a **call count
  on a spy** (zero agent dispatches, zero gate invocations) paired with a positive conjunct (the
  V-wave's exactly-one dispatch and exactly-one gate call), per FSPEC AT-12.

### 5.2 Test doubles — reuse, do not reinvent

The shipped suite already ships the harness this feature needs, and it is reused rather than
re-built (DC-08's cite-and-reuse rule):

| Double | Where it ships | What it gives this feature |
|---|---|---|
| `makeLedgerArgs({ledger, config, writes, record, logs, git, runCommand})` | `pdlc/workflows/__tests__/waveExecution.test.js`, immediately above the ledger `describe` | Both halves of the record seam under test control: `_readFile` scripted per path (`WAVE_STATE_PATH`, `CONFIG_PATH`, `PLAN-*`), `_writeFile` captured into `writes`. Nothing touches the real filesystem. |
| `ledgerWrites(writes)` | same file | The record writes, in order, as text — the oracle for §2.5's per-wave, high-water contract. |
| `PLAN_THREE_WAVES`, `CONFIG_WITH_TEST_COMMAND` | same file | A three-wave plan and a script-gate config, so wave counts in assertions are literals. |
| `makeArgs` + `record`/`logs` capture | same file | The run report's phase rows and the run log. |
| A counting `_agent` spy and a counting `_runCommand` spy | the pattern used by the shipped "a complete ledger skips every wave without a single implementation dispatch" test | FSPEC AT-12's call-count oracle. |

**New doubles are limited to fixtures**, not machinery: additional record byte-strings (malformed
JSON, a JSON array, a well-shaped record naming another feature, one with a stale `planHash`, one
with an unreachable `head`, one with `lastGreenWave` over the count, one with no `head`), and a
`_git` double whose `merge-base --is-ancestor` reply is scripted per test.

### 5.3 Test categories

| Level | Subject | File |
|---|---|---|
| Unit — pure | `classifyWaveLedger` over every guard of §3.2's table; `parseWaveLedger`'s three arms and their exact sentences; `formatWaveLedger`'s two shapes; `computePlanHash`'s sensitivities | `pdlc/workflows/__tests__/waveResume.test.js` (new) |
| Unit — catalogues | transcribed set-equality over `RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `WAVE_IGNORE_REASONS` keys, and `IMPLEMENTATION_DEFAULTS` keys | same file |
| Integration — through `main()` | every FSPEC AT that names an announcement, a report row, a dispatch count, or a written record | `pdlc/workflows/__tests__/waveExecution.test.js` (existing ledger block, extended) |
| Integration — queue parity | direct run vs `orchestrate-queue` delegation over the same feature, plan and record | `pdlc/workflows/__tests__/waveResumeQueueParity.test.js` (new) |
| Repo-state | the root-anchored `.gitignore` rule; this feature's PLAN ownership manifest | `pdlc/workflows/__tests__/waveResumeRepoState.test.js` (new) |

Splitting the new unit and repo-state work into **new files** is deliberate: `waveExecution.test.js`
is a large, heavily-shared file, and Phase I's single-writer-per-batch rule makes a new file the
cheap way to let unit work and integration work land in different waves without a shared-file
race. The extensions to `waveExecution.test.js` are one task, in one wave, owning that file alone.

### 5.4 Acceptance-test coverage map

Every FSPEC AT, with the oracle form that discharges it. `PROPERTIES` owns the final wording; this
map is the contract that no AT is left without a home.

| FSPEC AT | Level | Oracle |
|---|---|---|
| AT-01 automatic resume at the failed wave | integration | Run 1 halts at wave N; run 2 emits `Wave k/M: skipped (wave ledger: …)` for k<N, dispatches wave N, announces the resume banner with `provenance: automatic`, and the report's Phase I row states the resume point (D-3). |
| AT-02 disregard catalogue complete and closed | unit + integration | **Set equality** over `Object.keys(WAVE_IGNORE_REASONS)` against the seven codes transcribed from §3.1; plus one integration run per code asserting outcome (a) and its announced sentence, and one asserting IG-6 emits nothing matching `wave ledger`. |
| AT-03 ordering of disregard causes | unit | A record failing **both** ancestry and over-count classifies `head-unreachable`, not `over-count` — the one pair where §3.2's order diverges from the REQ's IG numbering. |
| AT-04 verification independence | integration | Over the enumerated fixture set (resume at wave 2, at the last wave, `head` = tip, `head` = earlier ancestor): the gate command is invoked before the first commit call in every case, asserted on the interleaving of the `_runCommand` and `_git` spies. |
| AT-05 operator override wins | integration | With both a valid record and `startWave: 2`: resume at 2, `provenance: operator-set`, and **no** log line matching `wave ledger … was ignored` — the record was never consulted. |
| AT-06 pointer at default is not a setting | integration | `startWave: 1` with a valid record → identical logs and report row to the same run with no `implementation` section at all. |
| AT-07 pointer past the end | integration | `startWave: 99` on a 3-wave plan → the past-the-end notice with `provenance: operator-set`, all three waves dispatched, no wave skipped, no ledger consultation. |
| AT-08 the hatch is named, and is the only one | integration + unit | (i) the outcome (b) and (c) banners each contain `to force a full run`; (ii) the same fixture with the record removed resolves outcome (a) — the hatch works; (iii) **set equality** of `Object.keys(IMPLEMENTATION_DEFAULTS)` against the four keys transcribed from §3.5. |
| AT-09 verified-but-uncommitted is never completed | integration | A run with green gates and **no** `_git` transport writes nothing (`ledgerWrites(writes)` is empty); the next run starts at that same wave. *Companion:* the same run **with** a transport, under each gate mode in turn, writes normally — proving the guard is the transport, not the gate. |
| AT-10 a no-change wave is still completed | integration | A wave whose tasks own no changed paths still records; the next run announces the **next** wave. *Positive conjunct:* adding or removing an unrelated commit leaves the announced resume point identical. |
| AT-11 ancestry is falsification, not archaeology | integration | Unreachable `head` → outcome (a) with the ancestry reason; probe unavailable (no transport / throwing transport) → record honoured. |
| AT-12 complete record skips the wave loop in full | integration | Counting spies: **zero** agent dispatches and **zero** gate invocations in the wave loop; the `⏭` row; the banner naming reason and hatch. *Fourth conjunct:* Phase PT dispatches exactly **one** agent and invokes the gate exactly **once**, and its commit is the only Phase-I-adjacent commit. |
| AT-13 outcome catalogue closed at three | unit + integration | **Set equality** over `RESUME_OUTCOMES` against the three transcribed literals, plus three integration fixtures each resolving one outcome and announcing it. |
| AT-14 the record never becomes tracked content | repo-state | The `.gitignore` rule `/.claude/pdlc-wave-state.json` exists and is root-anchored; no `implementation.postWavePathspecs` value and no PLAN-owned path names it. **RED in this tree until OB-F1's rebase** — it must not be weakened to "no churn observed". |
| AT-15 failed writes are notices, bounded | integration | *Arm 1:* every write throws → a notice per failure, run completes, next run is outcome (a). *Arm 2:* wave-1 write succeeds, wave-M write throws → run completes, next run resolves **(b)** at the wave after the last successful write. Arm 2 is the discriminator against an implementation that discards the record on any failure. |
| AT-16 queue parity | integration | The same feature, plan and record run directly and through `orchestrate-queue`'s delegation to `realMain`: same outcome, same resume point, same provenance, and the queue report's `pipelineReport` carries the same Phase I row. *Discriminating arm:* the record resolves against the same working directory on both paths. |
| AT-17 advisory remediation composes | integration + repo-state | Green-after-remediation → wave commits and records; failed remediation → identical halt, record still names the wave below. *And:* this feature's PLAN ownership manifest names `WAVE_STATE_PATH` in no wave's owned set (finite check, asserted by name). |
| AT-18 completion accumulates across invocations | integration | Halt at 2 → resume → halt at 4 → third run announces **wave 4** and skips 1–3 individually. Discriminates against a record that counts only the waves the previous run itself executed. |

### 5.5 Mutation-resistance notes

Three mutations this suite is specifically designed to kill, because each would otherwise pass:

1. **Deleting the ancestry guard.** Killed by AT-02's set equality (the `head-unreachable` code
   disappears) *and* AT-11. This is exactly why the FSPEC keeps IG-4 and IG-5 as separate rows.
2. **Moving the record write outside the transport branch** (recording on a green gate rather than
   on a commit). Killed by AT-09's empty-`ledgerWrites` assertion; not killed by any test that only
   checks the resume point, since a no-transport run's next invocation would then *look* correct.
3. **Recording a run-relative wave number.** Killed only by AT-18; every single-halt test passes
   under it.

### 5.6 What is not tested, and why

- **Concurrency** (FSPEC EC-19): the pipeline is serial by construction and the record is
  consumer-local. No guarantee is offered, so none is asserted.
- **`version` handling**: nothing reads it (§4.1), so there is no behaviour to test. A test
  asserting the literal `1` in written bytes is covered by `formatWaveLedger`'s unit test.
- **The general claim that no PLAN may ever own consumer-local state**: unfalsifiable as a
  per-feature test; routed to Phase P's ownership-manifest gate (FSPEC OB-F6).

## 6. Open Questions

No question in this TSPEC is open against the operator. What follows is: the decisions this
document takes (with the alternatives weighed and rejected), the upstream obligations it
discharges or routes, the errata it raises, and the residual risks.

### 6.1 Decisions taken here

Each is a real alternative that was weighed and rejected; they are the content of
`DECISIONS-pdlc-wave-resume.md`.

| # | Decision | Rejected alternative, and why |
|---|---|---|
| DEC-WVR-01 | **Formalise the shipped interim mechanism in place** — remove the INTERIM commentary, keep every constant, field name, evaluation order and write site. | *Rewrite behind a new abstraction* (a `WaveResumeStore` protocol, a versioned record format). Rejected: REQ BL-03 forbids duplicating alongside, R-4 names divergence as the risk, and a rewrite would re-litigate decisions the REQ closed (retention, deletion-only hatch, FNV-1a) at the cost of every shipped test. |
| DEC-WVR-02 | **Extract the decision chain into one pure total classifier** (`classifyWaveLedger`), leaving the ancestry probe, the announcements and the report row in `main()`. | (a) *Leave it inline*: rejected — AT-02 and AT-13 then have no honest oracle, since a test would enumerate what the chain emits rather than what the spec says. (b) *Extract the whole decision including the probe*, injecting a new ancestry seam: rejected — it adds a `main()` parameter and a runtime capability for a probe that already fails open, contradicting REQ C-3's "no new capabilities" and §3.4's structural discharge of it. |
| DEC-WVR-03 | **Announce provenance as an explicit `operator-set` / `automatic` token**, appended to the existing banner text. | *Ratify source-naming* (`implementation.startWave` vs `wave ledger …`) as conveying provenance. Rejected: it makes every provenance oracle an inference from a source string, so a banner that named the wrong source would still pass; and FSPEC §2 makes provenance announced *content*. The additive suffix keeps every shipped string assertion green. |
| DEC-WVR-04 | **Keep the `{}` read tolerance; write nothing.** (FSPEC OB-F3 discharged.) | (a) *Wire a writer* that clears the record after Phase I: rejected — REQ-WVR-05 decided **retention with invalidation**, and a clearing write is precisely the self-clearing position that decision rejected. (b) *Drop the tolerance* and let `{}` fall to IG-1: rejected — it converts a silent fresh-run case into an announced anomaly, contradicting FSPEC BR-02, and an operator who empties the file by hand would get a scary notice for using the sanctioned hatch's near-miss. |
| DEC-WVR-05 | **Ratify the plan-absolute high-water integer** as the record's only progress field. | *A set of completed waves*, or *per-task state*. Rejected in §4.4: a set can only be a prefix given serial topological execution, and modelling it invites a reader that honours a non-prefix set and skips a wave whose predecessor never ran. |
| DEC-WVR-06 | **Reason codes, not rendered sentences, are the closed catalogue.** | *Set equality over rendered strings*: rejected — four of the seven interpolate run-specific values, so the assertion would be over fixture data rather than over the catalogue. |

### 6.2 Upstream obligations

| # | Obligation | Disposition |
|---|---|---|
| OB-F1 | REQ BL-04 unmet: this tree is 1,637 commits behind and carries neither the mechanism nor the wave-gate baseline. | **Not dischargeable by this document.** Owned by the orchestrator/operator as branch management. Every claim here is verified against `origin/main` by name so it re-verifies after the rebase. AT-14 is RED until it lands. Re-raised as an erratum below, because the REQ's §10 and the FSPEC's OB-F1 characterise it inconsistently. |
| OB-F2 | Ratify or revise the shipped contract, never duplicate. | **Discharged** — §1.2, §2, §3, DEC-WVR-01. |
| OB-F3 | Decide the fate of the `{}` cleared shape. | **Discharged** — DEC-WVR-04: keep the tolerance, add no writer. |
| OB-F4 / REQ OB-2 | Promote REQ OF-1 and OF-2 into `docs/_constraints/pdlc-wave-gate-baseline.md` as `M-WVR-1..2`. | **Deferred to implementation, blocked on OB-F1** — the file is not in this tree. Recipe, re-derived from the file at `origin/main`: it is at `Version | 1.2 · 2026-08-20` with sections through `## 4` and ids through `M-WG-14`, so promotion appends a **new `## 5`**, ids `M-WVR-1` (the replay cost: 7 no-op dispatches over waves 1–3 of a 16-wave plan) and `M-WVR-2` (a completed task may legitimately produce no commit; stray agent commits observed), each with a Measured-by command, and bumps `Version` to **1.3** — to the next version above whatever is found at promotion time, not to a fixed number. The new section must state the version it was checked against and record that `M-WG-6` was **reviewed and left**, not missed. A PLAN task owns this file; it is not a code change. |
| OB-F5 | Set equality, not containment, for the three closed catalogues. | **Discharged into the design** — §3.1 makes each catalogue a frozen export; §5.4 AT-02/AT-08/AT-13 make each a transcribed set-equality assertion. PROPERTIES owns the wording. |
| OB-F6 | Assert over **this feature's PLAN** that the record is in no wave's owned-path set. | **Routed** — §5.3's repo-state file and §5.4 AT-17. The general form stays a Phase P gate question. |

### 6.3 Errata raised upstream

Raised, not fixed here; each is emitted as an `ERRATUM:` line in this dispatch's final message.

1. **FSPEC** states it derives from REQ v1.5; the REQ at HEAD is **v1.6**, whose erratum round
   rescoped REQ-WVR-08's no-commit claim to the implementation wave loop — a change FSPEC §2 and
   BR-11 already reflect, so the version cell is stale rather than the content.
2. **FSPEC** OB-F1 says the REQ's §10 records BL-04 as "discharged at FSPEC authoring". REQ v1.6
   §10 says the opposite — "**open and unmet** — not discharged at FSPEC authoring".
3. **FSPEC** has no clause stating what a run **writes** when an explicit operator pointer is in
   force. The shipped write site is outside the `!explicitPointer` guard, so an operator-pointer
   run records `lastGreenWave` for waves the operator, not the pipeline, asserted the predecessors
   of (§2.5). Bounded by BR-10, but unspecified; this TSPEC ratifies the shipped behaviour and
   needs the clause to trace to.
4. **REQ** OB-1's worktree conclusion rests on `.worktreeinclude` listing only `.claude/workflows/`,
   but that file is **not tracked on the default branch** (`git ls-tree -r origin/main` finds no
   `.worktreeinclude`). The conclusion still holds — an untracked include list is, if anything,
   less likely to carry the record — but the evidence cited is consumer-local, not a repo fact.

### 6.4 Risks

| # | Risk | Mitigation |
|---|---|---|
| RT-1 | **Rebase churn.** Landing on a base 1,637 commits ahead may surface conflicts in `orchestrate-dev.js`, the single largest file in the repo, and the file this feature edits. | The edit surface is small and localised (one comment block, one extracted function, three announcement suffixes, one report detail). The rebase happens *before* implementation (OB-F1), not during it. |
| RT-2 | **Extraction changes behaviour silently.** A pure-function extraction can reorder guards without any existing test noticing. | The shipped ledger `describe` block is kept green unchanged as the regression net, and §3.2's order table is asserted directly by AT-03's ancestry-and-over-count pair. Extraction lands as its own task, before any announcement change. |
| RT-3 | **The provenance suffix breaks a string assertion elsewhere.** | Partly realised, and handled by enumeration rather than by claim (TE F-01). The suffix is appended after the sentence's terminal punctuation and outside every existing parenthesis, which leaves every prefix and interior-substring matcher green — including the `⏭` row's `toContain("recorded green (wave ledger)")`. Three shipped assertions are whole-string equality and do change; §2.4 names each by enclosing test with its replacement, all three land in the same task as the announcement change, and no matcher is relaxed. A *fourth* breakage is the residual risk: mitigated by running the full `pdlc/workflows` suite as that task's own gate before the wave's, and by the rule that any further assertion found to change is added to §2.4's table in the same commit. |
| RT-4 | **AT-14 cannot pass in this tree**, so a wave could be tempted to weaken it to "no churn observed". | Named here and in §5.4 as a branch-state consequence: the assertion is on the ignore rule itself, and the correct response to a red is the rebase, not a weaker oracle. |
| RT-5 | **Generated artifacts go stale.** Editing `orchestrate-dev.js` leaves `pdlc/workflows/dist/` stale, which the suite itself reds. | `implementation.postWavePathspecs` must name the dist path so each wave's build outputs are committed; the post-wave command runs before the gate (`M-WG-2`). This is a PLAN obligation, recorded here. |
| RT-6 | **Advisory budget interaction.** Auto-resume makes runs shorter and more numerous, so `advisory.waveBudgetPerRun` effectively refreshes per re-invocation. | Recorded, not coordinated (FSPEC §7, REQ OB-3). Bounded in practice because clearing a halt still requires a human. Nothing in this TSPEC changes it. |

### 6.5 Assumptions

- **A-1.** The pipeline is invoked serially against one working copy (FSPEC A-1). Nothing here
  guards concurrent invocations.
- **A-2.** `computeWaves` is deterministic for a given PLAN, so `computePlanHash` is a stable
  "same plan?" answer across invocations. This is a property of the shipped parser, asserted by
  the existing `computePlanHash` unit block; if it ever became order-unstable, IG-3 would fire on
  every re-invocation and the feature would degrade to a full run — fail-open, as designed.
- **A-3.** An operator who sets `implementation.startWave` intends it for the invocation in which
  it is set (FSPEC A-2); staleness there is mitigated by announcement, not by expiry.

Both A-1 and A-3 are vetoable by the operator; no P0 criterion depends on either.
