# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.4, 2026-08-08)
**Date:** 2026-08-10
**Iteration:** 1
**Scope:** Technical lens — feasibility, implementability, completeness of error handling,
architectural compatibility. Product framing, UX and test-pyramid choices are out of lens.

## Method

Every existing-behaviour claim in the REQ was checked against HEAD of
`feat-pdlc-headless-engine`, not against the documents that assert it. Line citations below are
`file:line` at that HEAD.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The 0.4 transport change was applied to five items and left the mechanism layer behind.** The change note names its own blast radius — "C-1, NG-6, O-1 and R-1 updated to match" — but G-3, G-5, C-2, C-5, C-6, C-7, AC-2.3, AC-5.1 and AC-6.1 still specify a spawned `claude -p` child process as *the* mechanism. On the now-primary SDK path the engine spawns nothing: it hands an options object to an in-process `query()` (`pdlc/engine/lib/transport.mjs:159` `const dispatchEnv = { ...env }`, `:168` `options = { abortController, env: dispatchEnv }`, `:176` `options.model = model`). Consequences, each independently testable-as-false: C-7's "alias resolution and unknown-alias errors stay **the CLI's** job" names an owner the primary path does not contain; AC-2.3's "asserted for **every spawn the engine performs**" is vacuously true when the count of engine-performed spawns is zero; AC-6.1's "fails if a test path would **spawn a real `claude` process**" guards the wrong hazard (the live hazard is `defaultQueryFn` reaching the real SDK, `transport.mjs:18`). Fix: restate these clauses over the *dispatch options handed to a transport*, transport-neutral, and let TSPEC bind mechanism per transport. | §1.3 change note; G-3, G-5, C-2, C-5, C-6, C-7, AC-2.3, AC-5.1, AC-6.1 |
| F-02 | High | Local | **C-1 requires an `apiKeySource` assertion at a moment when `apiKeySource` is not yet observable.** C-1 states "The refusal is at **startup**, before any dispatch" and AC-2.2 requires the engine to "dispatch nothing" and exit non-zero. But the sole measured source of that value is the SDK's `system/init` message *inside* a `query()` call (SPIKE §4b; read at `transport.mjs:200` from the message stream, and the gate at `:201-205` throws mid-dispatch). Obtaining it at startup therefore costs exactly the dispatch the constraint forbids. The shipped startup path confirms the squeeze: `runStartupChecks` (`pdlc/engine/lib/startup.mjs:60-120`) performs plugin resolution, manifest read, compat handshake and skill readability — and **no auth check at all**, only an `apiKeyPolicy` banner row (`:49`, `:64`). A test engineer cannot derive a passing test for AC-2.2 as written. Fix: split the obligation — state what startup can decide without billing (environment/settings inspection for `ANTHROPIC_API_KEY` and the opt-in flag) and keep the `apiKeySource` equality as the per-dispatch fail-closed gate, or declare an explicit probe dispatch and own its cost. | C-1; AC-2.2; §1.3 |
| F-03 | High | Local | **AC-2.1's auth-source closed set is a different value space from C-1's, and no obligation measures the mapping between them.** AC-2.1 requires the banner to report the source "as one of a closed set (logged-in session / OAuth token / API key)". C-1's mechanical form asserts `apiKeySource === "none"`. Nothing in the REQ maps a three-member operator-facing set onto the SDK-reported field, and the spike measured exactly one value (`"none"`, SPIKE §4b) — it does not establish that the SDK can distinguish a logged-in session from a `CLAUDE_CODE_OAUTH_TOKEN`. O-1 obliges probing the `claude -p` flag surface and the SDK message-stream *shape*; neither covers this discrimination. That is a C-9/DC-02 violation: a stated runtime fact that is inferred rather than measured. Fix: reduce AC-2.1 to the value the engine can actually read, or add an obligation to measure the discriminator before TSPEC. | AC-2.1; C-1; C-9; O-1 |
| F-04 | High | Local | **AC-1.2 and AC-1.3 cannot both hold for a queue run, given G-2's no-fork rule.** AC-1.2 requires that "**no path under the consumer's `.claude/workflows/` is opened**", enumerating `docs/**` and `.claude/pdlc.config.json` as the only permitted consumer reads; NG-7 repeats that the engine "does not read, repair, or report on `.claude/workflows/`". But `orchestrate-queue.js:64` declares `DRIFT_STATE_PATH = ".claude/workflows/.pdlc-drift-state.json"`, and `main()` reads it through the injected `_readFile` at `orchestrate-queue.js:1075`, **before `QUEUE.md` is read at all**. AC-1.3 requires that same module's Phase-0 behaviour be unchanged and G-2/C-4 forbid forking it, so `pdlc queue` necessarily opens that path. This is not hypothetical: commit `e29ea716` on this branch added the `distribution.checkEnabled` opt-out *ahead of* the drift-state record precisely to route around it, and `f390ca38` bent the queue smoke test to match. The REQ still reads as though the case does not exist. Fix: name the drift gate in AC-1.2 and state its disposition — permitted read, or "the engine's declared queue posture is `distribution.checkEnabled: false`" — so the AC is decidable. | AC-1.2, AC-1.3, NG-7, G-2 |
| F-05 | High | Local | **G-2's seam enumeration is presented as complete and is not, and building to it exactly yields a throwing queue run.** G-2 says the engine "supplies the modules' existing injection seams (`_agent`, `_parallel`, `_pipeline`, `_phase`, `_log`, `_runCommand`, and the session seam `_sessionAgent`)". Measured against the modules: `orchestrate-queue.js`'s `main()` (`:1033-1045`) declares **no** `_parallel`, `_pipeline`, `_runCommand` or `_sessionAgent` parameter, and it delegates the pipeline through a seam G-2 does not name — `_runPipeline` (`:1040`, default `realMain`) — invoked at `:1422` as `runPipelineFn({ reqPath: entry.reqPath })` **with no seams forwarded**. An engine that supplies exactly G-2's list therefore reaches `orchestrate-dev.js`'s module-scope `agent()` stub (`:8458-8462`), which throws `"agent() not available outside Claude Code runtime"` — AC-1.3 fails on the first dispatch. `_runPipeline` is the only route to AC-1.3 that C-4 permits, as the implementation has already had to discover and document (`pdlc/engine/lib/run.mjs:96-109`, "a **necessity, not a preference**"). Per the altitude boundary the fix is *not* to refine the list here: delete the parenthetical enumeration from G-2 and let TSPEC own the seam contract, or state it non-exhaustively and record that the queue module's seam set differs from the pipeline's. | G-2; AC-1.3; C-4 |
| F-06 | Medium | Local | **C-5/AC-5.1's guard-parity mechanism is specified only for the fallback transport, and O-2's two candidate answers are both `claude -p`-shaped.** AC-5.1 requires the deletion refusal to travel "via the per-dispatch hook/settings the engine itself passes to `claude -p`", asserted independently of plugin hook wiring. On the primary SDK path there is no `--settings` flag to carry a PreToolUse hook, and no hook or settings wiring exists in the engine today (`grep -n 'hook\|settings' pdlc/engine/lib/*.mjs` returns only two comment lines, `transport.mjs:82` and `skills.mjs:26`). The guard covers `CROSS-REVIEW-*`, `CODE_REVIEW-*` and `ADVISORY-*` (`pdlc/hooks/scripts/guard-harvest-before-delete.sh:35,43,49`), so an unguarded dispatch path loses a real safety invariant, not a nicety. Fix: rescope O-2 to ask the question per transport, and restate AC-5.1's mechanism clause transport-neutrally (F-01's remedy applies). | C-5; AC-5.1; O-2 |
| F-07 | Medium | Process | **The REQ's obligations read as open while the work that discharges them has already landed on this branch.** O-1 and O-8 both say "before TSPEC", but commits `059750de` (SDK transport + auth gate), `2ed13815` (plugin-skill adapter, version handshake), `054d5292` (dev/queue wiring), `d0d2288b` and `f6f8029a` are already on `feat-pdlc-headless-engine`, and the probes those obligations demand exist as shipped code: plugin-root resolution with multiple candidate roots in `pdlc/engine/lib/skills.mjs`, message-stream parsing in `transport.mjs:180-205`, compat range `pdlcPluginCompat: "^0.22.0"` in `pdlc/engine/package.json`. DC-02 wants a measured fact to carry the citation it was measured from; these facts are now measurable from the tree and the REQ records none of them. Fix: mark O-1/O-8 discharged with citations to the shipped probes (or explicitly carried, with what remains unmeasured), so a reader can tell which obligations are still live. | O-1, O-8; C-9/DC-02 |
| F-08 | Low | Local | **R-3 cites the wrong section.** "§1.1's auth facts are policy, not physics" — §1.1 is the user-story table ("Who has this problem"); the auth facts live in §1.3. | R-3 |
| F-09 | Low | Local | **NG-6 cites a change note by a location it does not occupy.** NG-6 says "see §1.3 change note 0.4"; the 0.4 change note sits above §1 (document lines 20-24), not inside §1.3. §1.3's heading carries a "superseded" marker but not the note. | NG-6; §1.3 |
| F-10 | Low | Local | **`queue.loopIdleExit` is listed as a threshold but is a fixed behaviour.** §4.1 is scoped to "every threshold an acceptance criterion relies on, with its default and its owner", and admits no AC may depend on an unlisted tunable. `queue.loopIdleExit` has owner "engine" and default "exit 0 when no ready row remains" — an invariant AC-1.3 states directly, not a value anyone tunes. Listing it dilutes the table's contract. Fix: drop the row and leave the exit-0 behaviour in AC-1.3. | §4.1; AC-1.3 |
| F-11 | Low | Local | **Frontmatter `ready: false` contradicts the feature's queue posture.** `docs/_queue/QUEUE.md:38` carries row 3 `pending` for `pdlc-headless-engine` with no unmet Depends-On, while the REQ's frontmatter sets `ready: false`, which suppresses queue auto-pickup. If the intent is that this feature runs by direct invocation only, say so; otherwise the flag must flip. | frontmatter; `docs/_queue/QUEUE.md:38` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does the Agent SDK resolve bare model aliases (`opus`, `sonnet`, `haiku`) with the same semantics the CLI applies, including the error it raises for an unknown alias? C-7 deliberately delegates that job, and the modules do pass bare aliases — `MODEL_DEFAULT = "opus"` (`orchestrate-dev.js:1603`), `MODEL_IMPLEMENTATION = "sonnet"` (`:1646`), `MODEL_QUEUE = "sonnet"` (`orchestrate-queue.js:70`), plus a hard-coded `{ model: "haiku" }` at `orchestrate-dev.js:7463`. If the SDK's resolution differs, C-7's "the engine holds no model table" is still achievable but its stated rationale changes. |
| Q-02 | AC-1.1 requires "the same artifact set as the workflow-runtime path produces for the same inputs". Is that a **set-equality** check over a declared enumeration of expected files, or containment? As phrased a TE cannot tell, and containment would let a silently dropped artifact pass. Naming the enumeration (or naming where it is declared) closes it without adding TSPEC detail here. |
| Q-03 | NG-2 says "within this REQ the engine is run from a checkout of this repo", but `pdlc/engine/` already carries its own `package.json` with a real dependency (`@anthropic-ai/claude-agent-sdk`) and its own `test` script. Is installing that dependency inside the checkout in scope here, or does it belong to `pdlc-engine-distribution`? AC-6.1's "no network" and this install step want an explicit boundary. |
| Q-04 | AC-4.2 says a `timeout` is "treated as retryable once, then terminal", which is a different budget from `dispatch.retryAttempts` (3). Is the timeout budget intentionally independent of the retry budget, and does a timeout consume a retry attempt or not? Two readings, two different tests. |

## Positive Observations

- **Every measured fact in §1.2 verifies exactly at HEAD.** This is unusual and worth saying: `agent()` throwing at `orchestrate-dev.js:8458`, `parallel` at `:8464`, `pipeline` at `:8469`, `phase` at `:8474`, `defaultReadFile` at `:8492`, the two dynamic `child_process` imports at `:7680` and `:10754`, `orchestrate-queue.js`'s own `defaultReadFile` at `:948`, `rtSkillPrompt` at `runtime-adapter.js:47`, and `runtime-adapter.js` at exactly 53,056 bytes. Nothing was rounded or remembered. DC-02 is being honoured in the section that matters most.
- **The skill-count claim is exact.** G-5's "17 skill prompt files — 15 `SKILL.md` plus the two `se-implement` language supplements" matches the tree precisely: 15 `skills/*/SKILL.md` plus `SKILL-python.md` and `SKILL-typescript.md`.
- **C-10's handshake is a real constraint with a real range.** Engine `pdlcPluginCompat: "^0.22.0"` against plugin `0.22.0` — declared, checkable, and paired in the banner rather than assumed.
- **AC-4.1 is written the way a boundary contract should be written**: a closed taxonomy plus an explicit totality rule ("unrecognised output classifies as `transport-contract-violation`, never as success"), and AC-4.4 correctly carves `auth-failure` out of the retry path instead of letting a dead credential burn a queue's wall clock.
- **§4.1 declares its thresholds with owners and defaults, and admits its own uncertainty** (O-7 obliges re-deriving the retry defaults from observed behaviour rather than treating a guess as settled). That is the right posture for numbers nobody has measured yet.
- **G-5's rejected alternative is recorded, not just decided.** The Skill-tool-invocation option and the reason it lost are both in the text, which is what makes the decision reviewable a year from now.

## Recommendation

**Needs revision.**

The shape of this REQ is sound and its measured-fact discipline is better than most documents
that reach me. The problem is localised and mechanical: **v0.4 changed the primary transport
and updated five items, and the mechanism layer did not follow.** Everything below G-3 still
describes an engine that spawns `claude -p` children. That single root cause produces F-01,
and it is also what leaves C-1's startup timing (F-02), AC-2.1's auth vocabulary (F-03) and
AC-5.1's guard mechanism (F-06) pointing at a component the primary path no longer contains.

To clear the High findings, the next revision needs exactly five changes:

1. **F-01** — Sweep G-3, G-5, C-2, C-5, C-6, C-7, AC-2.3, AC-5.1, AC-6.1 into transport-neutral
   wording over "the dispatch options handed to a transport"; let TSPEC bind mechanism per
   transport. C-7 additionally needs a new owner for alias resolution, or an explicit statement
   that the engine forwards and the *transport* owns rejection.
2. **F-02** — Split C-1's obligation by observability: what startup can decide without billing
   a dispatch, versus the per-dispatch `apiKeySource` equality gate. AC-2.2 follows.
3. **F-03** — Either reduce AC-2.1's banner set to the value the engine can read, or add an
   obligation to measure the session-vs-token discriminator before TSPEC (C-9 requires one or
   the other).
4. **F-04** — Name the queue drift gate in AC-1.2 and state its disposition, so AC-1.2 and
   AC-1.3 stop contradicting each other for `pdlc queue`.
5. **F-05** — Remove G-2's parenthetical seam enumeration (or mark it non-exhaustive and note
   that the queue module's seam set differs), routing the seam contract to TSPEC. Do not fix
   this by extending the list in the REQ — that is TSPEC material either way.

F-06 and F-07 are worth addressing in the same pass but do not gate. F-08 through F-11 are
citation and hygiene fixes.

One note on sequencing rather than content: P1–P4 implementation commits are already on this
branch while the REQ sits at "draft — awaiting operator review" in Phase R. That is the
operator's call, not mine, but it does mean the five changes above should be checked against
the shipped code as they are written — in at least two places (F-04, F-05) the implementation
has already discovered the gap and worked around it, and the REQ is the document that is now
behind.

## Verdict

VERDICT: Needs revision
{"high": 5, "medium": 2, "low": 4}
