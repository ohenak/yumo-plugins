# DECISIONS — pdlc-wave-resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | se-author |
| Version | 1.1 |
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | CROSS-REVIEW-product-manager-DECISIONS-v1.md, CROSS-REVIEW-test-engineer-DECISIONS-v1.md |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

**Revision history.**

| Version | Change |
|---|---|
| 1.0 | Initial authoring. Records DEC-WVR-01..08, the alternatives weighed against them, and the cost each alternative was measured at. |
| 1.1 | Round-1 cross-review revision. Every counted claim re-derived at `origin/main` `345ae358`: the regression net is **26 cases (18 / 4 / 4)**, not 44, with the command and the counting rule stated (TE F-01, PM F-01); the decision chain is **48 lines** as bounded, inside an 84-line read block (TE F-03, PM F-03); `orchestrate-dev.js` is the largest tracked **source module**, second overall behind the generated `dist/pdlc-cli.mjs` (TE F-04, PM F-02); one seam denominator throughout — a 35th seam, a 37th parameter (PM F-04). DEC-WVR-03's "each announcing outcome" is **bounded by a stated criterion** and the invalid-`startWave` config notice excluded by it, with a set-equality oracle over token-carrying announcements and the exclusions enumerated (TE F-02); the `N > 1` condition on the `✅` row is written into the decision (PM Q-01). DEC-WVR-04's write-side oracle becomes a positive key-set equality with the absence as a conjunct (TE F-05, PM F-06); DEC-WVR-08 gains a third call-count equality for over-count × unreachable head and a bidirectional trigger (TE F-06); DEC-WVR-05 gains an observable trigger and states that `version` is written, not gated on (TE F-07, PM Q-02, TE Q-03); DEC-WVR-02's trigger is marked a design aspiration (TE F-07). The queue-parity residual gap is added to the DC-08 open table (PM F-05), and the fourth-assertion risk is split into its loud and silent halves. No decision, alternative disposition or downstream obligation changed. |

## Context

`pdlc-wave-resume` does not build a mechanism; it **formalises one that already ships**. Automatic
Phase I wave resume exists on the default branch today, written as an explicitly INTERIM block
inside `pdlc/workflows/orchestrate-dev.js` and marked as such in its own header comment ("INTERIM,
and marked as such deliberately. The formalized mechanism is the `pdlc-wave-resume` feature").
REQ BL-03 and R-4 therefore close the largest decision before this document opens: the shipped
contract is **ratified or revised, never duplicated alongside**. Every decision below is taken
inside that frame.

**Verification frame.** This branch is 1,637 commits behind the default branch
(`git rev-list --count HEAD..origin/main` → `1637`) and carries neither the mechanism
(`grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` → `0`) nor
`docs/_constraints/pdlc-wave-gate-baseline.md`. Every claim in this document about shipped code or
shipped tests is therefore verified against **`origin/main` at `345ae358`**, by name — exported
symbol, enclosing test, comment text or config key, per DEC-DOC-01
(`docs/_decisions/DECISIONS-review-severity-bars.md`) — so that it re-verifies after the rebase
that TSPEC OB-F1 owes. Where a *cost* is claimed below it is a counted cost, and the count is
stated with the command that produced it, not asserted from intuition.

**The measured surface these decisions trade against.**

| Fact | Measurement (`origin/main` at `345ae358`) |
|---|---|
| The module the feature edits is the largest tracked **source module** in the repo, and the second-largest tracked file overall | `git ls-tree -r -l origin/main \| sort -k4 -n -r \| head -3`: `pdlc/workflows/dist/pdlc-cli.mjs` 738,924 B first — a *generated* artifact built from the module below — then `pdlc/workflows/orchestrate-dev.js`, 734,711 bytes / 16,336 lines; third, at 314,472 B, a document. The rank sharpens rather than softens the risk: the largest tracked file in the repo is a build output of the file this feature edits |
| The shipped resume mechanism is three module-level pure functions plus one read site and one write site | `computePlanHash`, `parseWaveLedger`, `formatWaveLedger`; the read chain under `if (!explicitPointer) {`; the single `writeWaveLedger(` call site inside the `if (waveGit)` branch |
| The decision itself is an inline `if / else if` chain in `main()` | the chain from `if (ledger.reason) {` through the closing brace of the final `else` that sets `startWave = recorded.lastGreenWave + 1` — **48 lines**, every arm reachable only through a full `main()` run. (The enclosing `if (!explicitPointer) {` read block — reader, `parseWaveLedger` call, `ignore` helper, `headCorroborated` closure *and* the chain — is 84 lines; DEC-WVR-02 extracts only the 48-line inner chain, and only the classifying half of it.) |
| The regression net over that chain is **26 test cases**, in one file | `npm test -- __tests__/waveExecution.test.js --verbose`, run from `pdlc/workflows` at `origin/main` `345ae358`: **18** cases in `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` (15 `it` statements, one of which is a four-member `it.each` ⇒ 14 + 4), **4** in `describe("Phase I — implementation.startWave resumes a halted run")`, **4** in `describe("computePlanHash — the ledger's plan fingerprint")`. **Counting rule: test *cases*, with `it.each` members counted individually** — the same three blocks are 23 `it` statements. `git grep -l` over `pdlc/workflows/__tests__/` for `WAVE_STATE_PATH`, `computePlanHash`, `parseWaveLedger` or `formatWaveLedger` returns `waveExecution.test.js` alone, so 26 is the whole net |
| `main()` already destructures **36 parameters, 34 of them injected seams**, `_git` among them | counted over the destructured list of `export default async function main({ … })`: 36 entries, of which `reqPath` and `forcePhases` are the declared inputs and the other 34 are underscore-prefixed seams. `_git: gitFn = defaultGit` is one of them, and `branchGuardTransport(_git)` is how the ancestry probe reaches it. **One denominator is used throughout this document:** an added seam would be the **35th seam** and the **37th parameter** |
| The runtime adapter already wires that transport for both bundles | `runtime-adapter.js` binds `_git: rtGit` twice — once for the dev injections, once for the queue's |

**What the decisions are about.** Given a shipped, tested, fail-open mechanism, the open questions
are not "what should resume do" — the REQ and FSPEC closed those — but four engineering questions:
(1) how much of the shipped shape to keep (DEC-WVR-01, DEC-WVR-05); (2) how to make the decision
*testable at unit level* without moving IO (DEC-WVR-02, DEC-WVR-08); (3) how to make provenance and
the disregard reasons **assertable** rather than inferable (DEC-WVR-03, DEC-WVR-06); and (4) what to
do with the two loose ends the FSPEC handed down — the tolerated `{}` shape (DEC-WVR-04) and the
queue/direct parity claim the queue's delegation cannot honestly support (DEC-WVR-07).

## Options Considered

Every alternative below was a real candidate, and each is recorded with the cost it was *measured*
at rather than the cost it was assumed to have. Where an alternative is called "cheaper" or
"simpler", the claim is checked against the files it would actually touch.

### O-1 — Rewrite behind a new abstraction, instead of formalising in place (→ DEC-WVR-01)

A `WaveResumeStore` protocol with a versioned record format and its own module. **Cost, counted:**
it replaces the three exported pure functions and the two call sites in `orchestrate-dev.js`, and
therefore invalidates the **26 shipped test cases** that reach them (`npm test --
__tests__/waveExecution.test.js --verbose` from `pdlc/workflows` at `origin/main` `345ae358`;
cases, `it.each` members counted individually) — **18** in the ledger `describe`, **4** in the
`implementation.startWave` block, **4** in the `computePlanHash` block. The `implementation.startWave`
block is the *operator pointer's own* four cases (skip-before-pointer, past-the-end, default,
invalid); the pointer-versus-record interaction test, `it("an explicit implementation.startWave
outranks the ledger")`, lives in the ledger `describe` and is counted there. It also re-opens `WAVE_STATE_PATH` as a name, which
`.gitignore` pins by a root-anchored rule (`/.claude/pdlc-wave-state.json`, line 41 of the file at
`origin/main`, under a comment block explaining the anchor). The module is a restricted dialect —
no `import` — so a "new module" is not a file split but a second in-file block, which is exactly the
duplication REQ BL-03 forbids. Rejected: strictly more cost, and R-4's divergence risk realised.

### O-2 — Leave the decision chain inline (→ DEC-WVR-02)

Zero code cost, and that is its whole appeal. **Cost, counted, on the test side:** FSPEC AT-02
(set equality over announced disregard reasons) and AT-13 (set equality over outcomes) then have no
honest oracle. All seven reason sentences and all three outcomes are reachable only through a full
`main()` run, so the assertion would enumerate what the chain happens to emit — reading the
expectation out of the mechanism under test, which DC-03 ("every load-bearing assertion is
falsified before it is trusted") and DC-04 ("an oracle is a pure function of an injected root") both
rule out. Rejected on oracle quality, not on style.

### O-3 — Extract the whole decision *including* the ancestry probe (→ DEC-WVR-02)

Superficially the cleaner extraction: one function, no two-call dance. **Cost, checked against the
actual signature:** the probe is `await transport(["merge-base", "--is-ancestor", recordedHead,
"HEAD"])` where `transport = branchGuardTransport(gitFn)`. Moving it into a pure classifier means
the classifier is no longer pure, so the probe must arrive as a new injected parameter on `main()` —
a **35th injected seam** (a 37th parameter on a signature that already destructures 36),
duplicating a transport `main()` already has, and a second adapter binding beside
the two existing `_git: rtGit` lines in `runtime-adapter.js`. It is a new *seam over an existing
capability*, not a new host capability (the adapter's `rtGit` already answers `merge-base`), but it
is still production surface whose only consumer is a test, on a probe that already fails open in
three distinct ways (`headCorroborated` returns `true` for a record with no `head`, for an absent
transport, and for a throwing probe). Rejected: TSPEC §3.4's "the diff adds no parameter to
`main()`" is a structural discharge of REQ C-3, and this alternative spends it for nothing.

### O-4 — Resolve the ancestry verdict eagerly for every well-formed record (→ DEC-WVR-08)

One line shorter and one classifier call fewer, so genuinely simpler to read. **Cost, checked
against the shipped chain:** shipped, `await headCorroborated(recorded.head)` is the *third* arm of
the `else if` chain — below `recorded.feature !== featureName` and below `recorded.planHash !==
planHash`. A record naming another feature, or written against another plan layout, is rejected
today with **zero** `merge-base` subprocess calls. Eager resolution issues one on both of those
paths. That is new IO on paths that had none, contradicting §3.4's no-new-IO claim; and it would
have been unfalsifiable, because the shipped ancestry test asserts with `toContainEqual` —
containment — which an *extra* call cannot fail. Rejected. The accepted cost of avoiding it is one
extra **pure** classifier call, on the ancestry-false path only.

### O-5 — Ratify source-naming as conveying provenance (→ DEC-WVR-03)

The shipped banners already name their source: `(implementation.startWave)` in the operator banner,
`(wave ledger .claude/pdlc-wave-state.json)` in the record's. Reading `operator-set` / `automatic`
off those strings costs nothing to implement. **Cost, on the oracle:** every provenance assertion
becomes an inference from a source string, so a banner that named the *wrong* source would still
satisfy it, and FSPEC §2 makes provenance announced **content**. Rejected.

The counter-cost of the accepted option was checked rather than waved at, because appending text to
a shipped string is exactly the kind of change that quietly reds a suite. Appending
` (provenance: …)` **after the sentence's terminal punctuation and outside every existing
parenthesis** leaves every prefix and interior-substring matcher green — including
`expect(row.detail).toContain("recorded green (wave ledger)")` in `it("a matching record whose waves
are all green skips Phase I whole, and the row says so")`. Three shipped assertions are
whole-string equality and **do** change; they are enumerated with their replacements in TSPEC §2.4,
and the count is three, not "a few": the past-the-end notice in `it("a pointer past the last wave
runs every wave, and says so")`, the four-member `it.each` ignored-record notice, and the
`phaseDetail(result, "I")` equality in `it("skips the waves before the pointer entirely — no
dispatch, no gate, no commit")`. No matcher is relaxed to absorb them.

**The enumeration is closed, and its boundary is stated rather than left implicit (TE F-02).** A
*fourth* shipped whole-string assertion pins an announcement reached on the operator-pointer path:
the config-validation notice `Notice: implementation.startWave in {cfg} is not a valid value — using
the default.`, asserted by `expect(logs).toContain(` + the full sentence in `it("an invalid pointer
degrades to wave 1 and is named in the run's notices")` — structurally the same shape as
assertions 1 and 2. It takes **no** provenance token, and the criterion that excludes it is
mechanical, not a matter of taste:

> **A notice carries a provenance token iff the resume decision emits it about a resolved start
> point.** Notices emitted *before* the decision, by the shared `implementation`-config validation
> loop, do not.

That criterion is checkable against the shipped code rather than against intent. The invalid-value
notice is emitted by a **key-generic** loop — `for (const key of implParsed.invalidKeys)` around one
`emit` of the templated sentence `implementation.{key} … is not a valid value — using the default.` —
which is shared verbatim by every `implementation` key (`testCommand`, `postWaveCommand`, `postWavePathspecs`,
`startWave`) and appears at two call sites (legacy mode and wave mode). Attaching provenance there
would attach it to `testCommand`'s notice too. And by the time the resume decision runs,
`parseImplementationConfig` has already replaced the rejected value with the default, so
`const explicitPointer = startWave > 1` is **false**: there is no operator pointer left to attribute
the run to. FSPEC BR-07's own carve-out is what covers the case — this is "the absence of a resume",
not "a full run reached by an operator pointer"; BR-02 makes that state silent about resume, and it
stays silent here. The past-the-end notice is on the other side of the line for the same mechanical
reason: it is emitted **inside** the resume decision, from a valid pointer that resolved to a full
run, with `explicitPointer` **true**.

The count therefore stays **three**, and it stays three by a rule a test can apply rather than by an
omission. The corresponding obligation is in Consequences: the announcement catalogue is asserted by
set equality over the announcements that carry a token, with the excluded notices enumerated as
literals — so a *fifth* announcement reds an assertion instead of slipping through. (TSPEC §2.4's
announcement table omits the invalid-pointer notice entirely rather than excluding it by rule; that
is an upstream gap, raised as an erratum rather than repaired here.)

### O-6 — Wire a writer for the cleared `{}` shape, or drop the tolerance (→ DEC-WVR-04)

`parseWaveLedger` treats `""` and `"{}"` identically to an absent file (`if (trimmed === "" ||
trimmed === "{}") return { state: null, reason: null };`), and **nothing writes `{}`** — verified:
the only `writeWaveLedger(` call site writes `formatWaveLedger(...)`, whose output always carries
`version`, `feature`, `planHash` and `lastGreenWave`. Two ways to close the asymmetry:

- *(a) Wire a writer* that clears the record after Phase I. Rejected: REQ-WVR-05 decided
  **retention with invalidation**, and a clearing write is precisely the self-clearing position that
  decision rejected. It also adds a second write site to a block whose containment is its main
  virtue.
- *(b) Drop the tolerance*, letting `{}` fall through to the wrong-shape reason. Rejected: it costs
  nothing to implement and converts a silent fresh-run case into an announced anomaly, contradicting
  FSPEC BR-02. An operator who empties the file by hand — the near-miss of the sanctioned "delete
  the file" hatch — would get a notice reading as a fault.

### O-7 — Model progress as a set of completed waves, or as per-task state (→ DEC-WVR-05)

The record's only progress field is the plan-absolute integer `lastGreenWave`
(`formatWaveLedger` writes `{version, feature, planHash, lastGreenWave}` plus optional `head`).
**Cost, checked against the executor:** waves are executed serially in plan order — the loop is
`for (let waveIndex = 0; waveIndex < waves.length; waveIndex++)` with a single `startWave` cut-off —
so a set of completed waves can only ever be a prefix. Modelling it as a set adds a shape the
writer cannot produce and invites a future reader that honours a non-prefix set and skips a wave
whose predecessor never ran. Per-task state is strictly worse: it would have to survive a PLAN
re-derivation, which `planHash` deliberately refuses to do. Rejected.

### O-8 — Make the closed catalogue the rendered sentences rather than the codes (→ DEC-WVR-06)

Rejected because a set-equality assertion over rendered sentences is an assertion over fixture data:
of the seven disregard reasons, **three** interpolate run-specific values — the recorded feature
name (`it records feature "X", not "Y"`), the recorded commit's short sha (`the commit it records
(abc123456789) is not an ancestor of HEAD …`), and the recorded and actual wave counts (`it records
N wave(s) green and this plan has only M`). The other four are fixed sentences. Codes are the
closed set; renderers are the wording, governed by FSPEC's "content, not wording" note. (TSPEC §3.1
says "four of the seven reasons interpolate"; the correct count is three reasons carrying four
interpolated values — raised as an erratum, not silently propagated here.)

### O-9 — Make AT-16 assert a real delegated resume (→ DEC-WVR-07)

FSPEC AT-16 / REQ-WVR-07 want queue/direct parity of resume point and provenance. **What the queue
actually delegates, verified:** `orchestrate-queue.js` imports `orchestrate-dev`'s default export as
`realMain`, defaults `_runPipeline: runPipelineFn = realMain`, and calls
`runPipelineFn({ reqPath: entry.reqPath })` — a payload whose key set is exactly `{reqPath}`. No
seam, no config, no resume pointer crosses that boundary. Three ways to assert more than that were
weighed:

- *(a) Inject `_runPipeline`* and compare a real run against the stub. Rejected: the delegation is
  then not under test at all, and the parity assertion passes under every mutation this feature
  could make.
- *(b) Wrap `realMain` in test seams and drive the queue for real.* Rejected: the working directory
  both paths would "agree" on is supplied by the test double, so the discriminating arm is true by
  construction.
- *(c) Add seam forwarding to the queue's delegation* so a delegated pipeline can be driven under
  test. Rejected: production surface whose only consumer is a test, on a boundary REQ C-3 says gains
  nothing — and it would place a queue-side resume configuration where FSPEC BR-16 says none exists.

## Decision

Eight decisions, each stating what was chosen, what was rejected, what forced the shape, how
reversible it is, and what should make a future reader re-open it. Ids are the TSPEC's
(`TSPEC §6.1`), so the two documents cite one another by the same name.

### DEC-WVR-01: Formalise the shipped interim mechanism in place

**Context:** The mechanism ships today, marked INTERIM, contained "precisely so that feature can
replace it cleanly rather than untangle it". The feature has to decide whether to replace it or to
adopt it.
**Decision:** Adopt it. Remove the INTERIM commentary and replace it with the formalised contract
citing this feature's TSPEC; keep every constant, field name, evaluation order and write site. The
shipped header comment also miscounts its own surface ("two pure functions … two write sites"; it
is three pure functions and one write site), and the replacement states the surface correctly.
**Alternatives considered:**
- O-1, rewrite behind a `WaveResumeStore` abstraction — rejected because it invalidates the 26
  shipped test cases counted in §Context (18 / 4 / 4), re-opens a path constant that `.gitignore` pins by a root-anchored rule, and in a dialect
  with no `import` is a second in-file block, i.e. the duplication REQ BL-03 forbids.
**Constraints that forced this shape:** REQ BL-03 (ratify or revise, never duplicate); R-4
(interim/final divergence is the named risk); the restricted `pdlc/workflows/*.js` dialect (no
`import`, no `fs`, no `process`).
**Reversibility:** easy — nothing here forecloses a later extraction into a module if the dialect
ever gains imports.
**Re-evaluation triggers:** the dialect gains module imports; a second consumer outside
`orchestrate-dev.js` needs the record; the record's format needs a version 2.

### DEC-WVR-02: Extract the decision chain into one pure total classifier

**Context:** The resume decision is an inline `if / else if` chain of **48 lines** in `main()`
(`if (ledger.reason) {` through the final `else`'s closing brace), interleaved with `emit` calls and
one `await`ed probe, inside an 84-line read block. FSPEC AT-02 and AT-13 demand set equality
over announced reasons and over outcomes.
**Decision:** Extract the ordered decision — feature match, plan-hash match, ancestry verdict,
over-count, complete, mid-plan — into one pure, total `classifyWaveLedger`, taking the ancestry
verdict as an already-resolved boolean and returning a *description* of the outcome. The probe, the
`emit` calls and the report row stay in `main()`.
**Alternatives considered:**
- O-2, leave it inline — rejected: AT-02 and AT-13 then have no honest oracle (DC-03, DC-04).
- O-3, extract the probe too behind a new injected seam — rejected: a 35th injected seam — a 37th
  parameter on a signature that already destructures 36 — duplicating the `_git` transport the probe already reaches through `branchGuardTransport`, plus a
  second adapter binding, for a probe that already fails open three ways.
**Constraints that forced this shape:** REQ C-3 (no new capabilities); TSPEC §3.4's structural
discharge of it ("the diff adds no parameter to `main()`"); totality, which is what makes FSPEC
BR-01's three-outcome closure mechanically checkable rather than asserted in prose.
**Reversibility:** easy for the extraction itself; the *behaviour* it preserves is not up for
revision.
**Re-evaluation triggers:** *(design aspiration, deliberately not an observable signal — no
observation of a running system raises it, so no test or monitor is owed one)* the announcements
themselves need to become pure values (e.g. a structured run log), at which point more of `main()`'s
emit layer could follow the same move. The observable half of this decision is carried by
DEC-WVR-06's trigger, which reds the seven-code set equality.

### DEC-WVR-03: Announce provenance as an explicit `operator-set` / `automatic` token

**Context:** FSPEC BR-07 makes provenance announced content and FSPEC §2 lets a test assert that an
announcement *conveys* it. The shipped banners name the source but never the words.
**Decision:** Introduce a frozen two-member vocabulary `RESUME_PROVENANCE` and append
` (provenance: …)` to each announcing outcome, **after the sentence's terminal punctuation and
outside every existing parenthesis**. "Each announcing outcome" is bounded by a stated criterion, not
by enumeration alone: **a notice carries a token iff the resume decision emits it about a resolved
start point**, so the shared `implementation`-config validation notice for an invalid `startWave`
(emitted before the decision, by the key-generic `invalidKeys` loop, with `explicitPointer` already
`false`) is excluded — see O-5. Extend the executed Phase I report row with the resume point and
provenance **only for a run that resumes** (`N > 1`); a run starting at wave 1 reuses the shipped
sentence `All M waves complete (wave mode, {gate})` verbatim, which is what keeps the two
`phaseDetail` equalities in `describe("Phase I — the script-owned test gate")` green and holds the
changed-assertion count at three. Leave the `⏭` row's shipped text whole, the token outside its
parenthesis.
**Alternatives considered:**
- O-5, ratify source-naming as conveying provenance — rejected: it makes every provenance oracle an
  inference from a source string, so a banner naming the wrong source would still pass.
**Constraints that forced this shape:** FSPEC BR-07 and §2; REQ-WVR-01's "run log **and final
report**"; and the shipped regression net — the placement rule is what keeps every prefix and
substring matcher green, leaving exactly three whole-string assertions to change, each named with
its replacement in TSPEC §2.4 and landed in the same task as the change that forces it; and the
`N > 1` condition on the `✅` row, without which two further whole-string equalities outside the
ledger blocks would change and the count would not be three.
**Reversibility:** easy — the suffix is additive text behind a frozen catalogue.
**Re-evaluation triggers:** a third provenance ever exists (e.g. a resume sourced from something
that is neither an operator pointer nor the record); the run log becomes structured, at which point
provenance should be a field rather than a clause.

### DEC-WVR-04: Keep the `{}` read tolerance; write nothing

**Context:** FSPEC OB-F3 asks for the fate of the cleared `{}` shape, which `parseWaveLedger`
tolerates as "no record" and which no writer produces.
**Decision:** Keep the tolerance exactly as shipped; add no writer. FSPEC OB-F3 is discharged by
this decision plus a test, not by a code change.
**Alternatives considered:**
- O-6(a), wire a clearing writer — rejected: REQ-WVR-05 decided retention with invalidation, and a
  clearing write is the self-clearing position that decision rejected.
- O-6(b), drop the tolerance — rejected: it converts a silent fresh-run case into an announced
  anomaly (contra FSPEC BR-02) and punishes an operator who empties the file by hand.
**Constraints that forced this shape:** REQ-WVR-05; FSPEC BR-02's silence requirement for the
no-record case.
**Reversibility:** easy in code. The "hard in expectation" caveat is scoped honestly: the `{}`
tolerance is **not** documented anywhere an operator reads — every banner names *deleting* the file
as the hatch — so the expectation exists only for an operator who discovered the behaviour by
experiment. Making it a supported hatch would be a REQ-level statement, not an implementation one.
**Re-evaluation triggers:** a future writer genuinely needs a "deliberately cleared, do not resume"
state distinguishable from "no record", which is a REQ-level change, not an implementation one.

### DEC-WVR-05: Ratify the plan-absolute high-water integer as the only progress field

**Context:** The record carries `{version, feature, planHash, lastGreenWave}` plus an optional
`head`. Progress is one integer.
**Decision:** Ratify it. `lastGreenWave` stays the plan-absolute wave number — not a count of
executed waves — and stays the only progress field. `head` stays optional on both write and read.
`version` is **written, not gated on**: `parseWaveLedger` never reads `parsed.version` — its
well-formedness check is over `feature`, `planHash` and `lastGreenWave` only — and this decision
ratifies that read-side indifference rather than closing it. Freezing the record at `version: 1`
therefore constrains the **writer** (no PLAN task adds a field), not the reader.
**Alternatives considered:**
- O-7, a set of completed waves — rejected: waves execute serially in plan order behind a single
  `startWave` cut-off, so a set can only ever be a prefix; modelling it invites a future reader that
  honours a non-prefix set and skips a wave whose predecessor never ran.
- O-7, per-task state — rejected: it would have to survive a PLAN re-derivation, which `planHash`
  deliberately refuses to do.
**Constraints that forced this shape:** serial topological wave execution; `planHash` as the "same
plan?" invalidator; REQ-WVR-05's retention-with-invalidation.
**Reversibility:** hard — the field is the record's format, and a change means a `version: 2` and a
reader that honours both.
**Re-evaluation triggers:** *(observable)* the executed wave numbers of a run ever fail to form a
contiguous ascending run from `startWave` — the prefix property that a single `startWave` cut-off over
`for (let waveIndex = 0; waveIndex < waves.length; waveIndex++)` guarantees today, and that a test
asserting contiguity over the dispatched wave numbers reds the day it stops holding; or a wave becomes
resumable at task granularity.

### DEC-WVR-06: Reason codes, not rendered sentences, are the closed catalogue

**Context:** FSPEC OB-F5 wants set equality — not containment — over the announced disregard
reasons. There are seven, three of which interpolate run-specific values.
**Decision:** The closed, frozen catalogue is the **code** set (`unreadable-json`,
`not-an-object`, `wrong-shape`, `feature-mismatch`, `plan-changed`, `head-unreachable`,
`over-count`); rendered sentences are wording, produced by per-code renderers from a
`ReasonContext` whose only constructor is the classifier. The three `parseWaveLedger` arms keep
their exact shipped sentences as their renderers, so no shipped assertion changes.
**Alternatives considered:**
- O-8, set equality over rendered strings — rejected: the assertion would be over fixture data
  wherever a sentence interpolates, and would red on every wording change that FSPEC's "content, not
  wording" note explicitly permits.
**Constraints that forced this shape:** FSPEC OB-F5 (set equality, not containment); FSPEC's
content-not-wording note; DC-01 (a contract crossing a boundary is closed and total).
**Reversibility:** easy.
**Re-evaluation triggers:** a reason is added that cannot be rendered from `ReasonContext`; the run
log becomes structured, at which point the code — not the sentence — is what should be logged.

### DEC-WVR-07: AT-16 asserts the delegation's shape, not a delegated resume

**Context:** REQ-WVR-07 / FSPEC AT-16 want queue-and-direct parity of resume point and provenance.
The queue delegates in-process by calling `runPipelineFn({ reqPath: entry.reqPath })`, defaulted to
`realMain` — a payload whose key set is exactly `{reqPath}`.
**Decision:** Assert what the boundary can honestly carry: `_runPipeline` left at its default, the
payload's key set pinned at `{reqPath}` by set equality, and the behavioural half of parity
discharged on the direct path. The residual gap is **named in AT-16** rather than papered over.
**Alternatives considered:**
- O-9(a), inject `_runPipeline` and compare against a stub — rejected: the delegation is then not
  under test, and the assertion survives every mutation this feature could make.
- O-9(b), wrap `realMain` in test seams and drive the queue for real — rejected: the working
  directory the two paths "agree" on would be supplied by the double, making the discriminating arm
  true by construction.
- O-9(c), add seam forwarding to the queue's delegation — rejected: production surface whose only
  consumer is a test, and it would put a queue-side resume configuration where FSPEC BR-16 says none
  exists.
**Constraints that forced this shape:** the shipped in-process delegation and its one-key payload;
REQ C-3; DC-08 — an unresolved item needs a **named successor surface**, which is why the gap is
written into AT-16's own text rather than into prose intent.
**Reversibility:** easy — if the queue ever forwards seams for an unrelated reason, the stronger
assertion becomes available for free.
**Re-evaluation triggers:** the queue's delegation payload grows a second key; the queue gains any
resume-relevant configuration of its own.

### DEC-WVR-08: The ancestry probe stays lazy

**Context:** Extracting the decision (DEC-WVR-02) means the classifier takes ancestry as a resolved
boolean. Resolving it naively means resolving it for every well-formed record.
**Decision:** Resolve it only for decisions that turn on it: classify optimistically with
`headOk: true`, and re-classify with `headOk: false` only when the optimistic decision is not a
`full-run` whose code is in `ANCESTRY_INDEPENDENT_CODES`. At most one `merge-base` subprocess per
run, and zero on the feature-mismatch and plan-changed paths — the shipped call counts, asserted as
equalities rather than containments.
**Alternatives considered:**
- O-4, resolve `headOk` eagerly — one line shorter, and rejected anyway: shipped, the probe is the
  *third* arm of the chain, so those two rejection paths issue zero `merge-base` calls today. Eager
  resolution is new IO on paths that had none, contradicting TSPEC §3.4 and REQ C-3, and the shipped
  ancestry test asserts with `toContainEqual`, so the extra call would have been unfalsifiable.
**Constraints that forced this shape:** the shipped guard order (ancestry below feature and
plan-hash); "no new IO"; DC-03 — the cheaper alternative's defect is precisely that no existing
assertion could falsify it.
**Reversibility:** easy.
**Re-evaluation triggers:** *(bidirectional — movement in either direction invalidates the scheme)*
the ancestry verdict becomes needed by a guard **above** the plan-hash guard, **or ceases to be needed
by a guard below it** — in particular, `over-count` being added to `ANCESTRY_INDEPENDENT_CODES`, which
would silently flip an over-count record with an unreachable head from `head-unreachable` to
`over-count`; the probe becomes free (e.g. HEAD ancestry already resolved earlier in the run).

## Consequences

### What these decisions commit the implementation to

| Decision | Consequence the PLAN and the implementation inherit |
|---|---|
| DEC-WVR-01 | One comment-block replacement in `orchestrate-dev.js`; no behavioural diff in that task. The replacement states the surface correctly (three pure functions, one read site, one write site), since the shipped INTERIM comment miscounts it. |
| DEC-WVR-02 | The extraction lands as **its own task, before any announcement change**, with the shipped ledger `describe` block kept green **entirely unchanged by that task** — it is the extraction's regression net. |
| DEC-WVR-03 | Exactly three shipped whole-string assertions change, in the **same task** as the announcement change, each to the new whole string transcribed as a literal. No matcher is relaxed to a `startsWith` or an `includes`; doing so would retire the exact-wording oracle, a strictly larger change than this feature owes. **Plus one oracle that closes the catalogue:** the set of announcements observed to carry a `(provenance: …)` token is asserted **equal** to the announcing rows transcribed from TSPEC §2.4, and the excluded notices are enumerated in the same assertion as literals — the invalid-`startWave` config-validation notice, and the IG-6 no-record silence — so a fifth announcement, or a token appearing on an excluded notice, reds an assertion instead of passing containment. **And one exclusivity conjunct:** no run emits a Phase I detail matching both `✅` shapes; a wave-1 run's detail is asserted equal to the shipped `All M waves complete (wave mode, {gate})` literal, which is what stops a future refactor emitting the resume sentence with `1–M` for a fresh run. |
| DEC-WVR-04 | A test, not a code change: the `{}` and `""` inputs are asserted to reach the silent no-record outcome (positive, on the read path), **and the write path is asserted positively, with the absence as a derived conjunct**: on a run that commits at least one wave, every observed ledger write parses to an object whose key set is **exactly** `{version, feature, planHash, lastGreenWave}` (plus `head` when a transport is injected), and no observed write is `{}` or `""`. Set equality, not containment — so a writer that drops a field, emits a cleared shape, **or disappears entirely** reds the assertion. An absence-only oracle ("no write equals `{}`") would be satisfied by a run that writes nothing at all, and is not what this row prescribes. |
| DEC-WVR-05 | The record's format is frozen at `version: 1`; no PLAN task may add a field — enforced mechanically, not by prohibition on the PLAN author: set equality over the keys `formatWaveLedger` emits, asserted in **both** shapes (`head` present and `head` absent). `version` is written and not read, so the freeze binds the writer only (see the decision). |
| DEC-WVR-06 | Three frozen catalogues, each transcribed into a test as a literal so an addition or a deletion reds an assertion. |
| DEC-WVR-07 | AT-16 carries its own residual-gap sentence; a reviewer who reads it as full parity has misread it, and the sentence is what prevents that. |
| DEC-WVR-08 | **Three** call-count oracles asserted as **equalities**: zero `merge-base` calls on the feature-mismatch and plan-hash-mismatch fixtures, exactly one on the ancestry fixture, and exactly one on an **over-count record whose head is unreachable** — which must announce `head-unreachable`, not `over-count`. That third fixture is the only one that pins the laziness and the guard order together (`over-count` is not in `ANCESTRY_INDEPENDENT_CODES`, so the probe fires and the record re-classifies); without it, adding `over-count` to that set to save a subprocess would flip the announced reason with nothing red: both codes stay in the seven, so AT-02's set equality holds, and the shipped over-count test asserts by containment. |

### What is deliberately left open, and where it goes

Per DC-08, each unresolved item names a successor surface rather than an intent:

| Item | Successor surface |
|---|---|
| The branch is 1,637 commits behind and carries neither the mechanism nor `docs/_constraints/pdlc-wave-gate-baseline.md` (TSPEC OB-F1). | Orchestrator/operator branch management, **before** implementation. It is a PLAN sequencing precondition: the wave carrying the ignore-rule assertion (AT-14) must not be dispatched before the rebase, because in wave mode a red gate halts that wave and every wave after it. |
| Promotion of REQ OF-1/OF-2 into the wave-gate baseline as `M-WVR-1..2` (TSPEC OB-F4). | A dedicated PLAN task owning that file — a document change, not a code change — appending a **new** section at the next unoccupied number and bumping the file's `Version` to the next above whatever is found at promotion time. |
| Advisory budget interaction: shorter, more numerous runs refresh `advisory.waveBudgetPerRun` per invocation (TSPEC RT-6). | Recorded, not coordinated. Nothing in these decisions changes it, and clearing a halt still requires a human. |
| AT-16 observes the delegation's *shape*, not a delegated resume: FSPEC BR-16's behavioural half — that a delegated and a direct run resolve the same outcome, resume point and provenance — is discharged on the **direct path only** (REQ-WVR-07, P2, Phase 2). DEC-WVR-07 names this inside AT-16's own text, but a sentence in a test is a disclosure, not a successor surface. | The re-evaluation trigger DEC-WVR-07 already names: **the queue's delegation payload growing a second key**, at which point the stronger assertion becomes available for free. Until then the gap stays here, in the table a future reader consults, rather than only inside the test. |

### Risks these decisions accept

- **A fifth announcement, or a fourth changed whole-string assertion, is discovered mid-wave.** The
  fourth *announcement* is no longer an unforeseeable discovery: the invalid-`startWave` notice is
  identified and excluded by rule in O-5 and DEC-WVR-03. Two residual halves remain, and each has its
  own mitigation, because a suite run only covers one of them. The **loud** half — an assertion that
  changes — is mitigated by running the full `pdlc/workflows` suite as the announcement task's own
  gate before the wave's, and by the rule that any further changed assertion is added to TSPEC §2.4's
  table in the same commit, never absorbed by relaxing a matcher. The **silent** half — an
  announcement that *should* carry a token and is simply left untouched, which reds nothing — is
  mitigated by the set-equality oracle over the token-carrying announcements with the exclusions
  enumerated as literals (DEC-WVR-03's Consequences row). Without that oracle this risk has no
  detector at all.
- **Rebase churn in the largest tracked *source module* in the repo** (`orchestrate-dev.js`,
  734,711 bytes; second overall behind the generated `pdlc/workflows/dist/pdlc-cli.mjs` at 738,924
  bytes, which is built *from* it — which is exactly why the third risk below exists).
  Mitigated by the small, localised edit surface these decisions produce — one comment block, one
  extracted function, three announcement suffixes, one report detail — and by rebasing *before*
  implementation rather than during it.
- **Generated artifacts go stale.** Editing the source module leaves `pdlc/workflows/dist/` stale,
  which the suite itself reds. Any wave whose tasks touch the module must name the dist path in
  `implementation.postWavePathspecs`; the post-wave command runs before the gate.

### What a future reader should not re-litigate

The path constant, the record's field names and `version: 1`, the FNV-1a fingerprint, the
evaluation order of the disregard causes (ancestry **above** over-count), the laziness of the
ancestry probe, the transport-guarded write site, the fail-open posture of every read, and the
retention of a complete record. Each was closed upstream or here, with the alternative recorded
above. Re-opening one without a trigger from its **Re-evaluation triggers** row is re-litigation,
not review.
