# DECISIONS — pdlc-wave-resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | se-author |
| Version | 1.0 |
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | *(none yet — this round)* |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

**Revision history.**

| Version | Change |
|---|---|
| 1.0 | Initial authoring. Records DEC-WVR-01..08, the alternatives weighed against them, and the cost each alternative was measured at. |

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
| The module the feature edits is the largest tracked file in the repo | `git ls-tree -r -l origin/main` sorted by size: `pdlc/workflows/orchestrate-dev.js`, 734,711 bytes / 16,336 lines; the runner-up is a document at 314,472 bytes |
| The shipped resume mechanism is three module-level pure functions plus one read site and one write site | `computePlanHash`, `parseWaveLedger`, `formatWaveLedger`; the read chain under `if (!explicitPointer) {`; the single `writeWaveLedger(` call site inside the `if (waveGit)` branch |
| The decision itself is an inline `if / else if` chain in `main()` | the chain from `if (ledger.reason) {` through the final `else` that sets `startWave = recorded.lastGreenWave + 1` — ~81 lines, every arm reachable only through a full `main()` run |
| The regression net over that chain is one `describe` block of 32 tests | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` in `pdlc/workflows/__tests__/waveExecution.test.js`, plus 8 tests in the `implementation.startWave` block and 4 in `describe("computePlanHash — the ledger's plan fingerprint")` |
| `main()` already carries ~35 injected seams, `_git` among them | the destructured parameter list of `export default async function main({ … })`; `_git: gitFn = defaultGit` is one of them, and `branchGuardTransport(_git)` is how the ancestry probe reaches it |
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
therefore invalidates the 44 shipped tests that reach them — 32 in the ledger `describe`, 8 in the
`implementation.startWave` block (which asserts the *interaction* of the operator pointer with the
record), 4 in the `computePlanHash` block. It also re-opens `WAVE_STATE_PATH` as a name, which
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
a **36th seam**, duplicating a transport `main()` already has, and a second adapter binding beside
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

## Consequences
