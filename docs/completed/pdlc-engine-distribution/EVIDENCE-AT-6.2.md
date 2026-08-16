# EVIDENCE-AT-6.2 — the channel-coexistence observation

**Task:** PLAN T51. **Criterion:** FSPEC AT-6.2 *(AC-6.2)* **[manual]** — *"Given: a machine
with both channels installed and independently known install state. When: a run is started
through each. Then: the engine run emits its provenance block; the bundle run completes, emits
its named output artifacts, and carries no provenance block."* (FSPEC §8, AT-6 group; manual
per TE round-1 Q-04: the install state is known out of band, so this is an operator
observation with recorded evidence, not an automated channel test.)

**Recorded:** 2026-08-15, on branch `feat-pdlc-engine-distribution` at commit
`2ff9cc11f83ffbed90949a4165a120f9ce0d872b`, Node `v20.20.1`, macOS. Observation performed by
Claude (Fable 5) at the operator's request, in the operator's own Claude Code session on the
machine described below.

## 1. The install state, known out of band

Both channels are installed on this machine, independently:

- **Plugin (bundle channel):** pdlc plugin v0.23.0 in the Claude Code plugin cache at
  `~/.claude/plugins/cache/yumo-plugins/pdlc/0.23.0` (a 0.22.7 cache entry also present,
  not used). The bundle-channel runtime copy is the untracked consumer tree
  `.claude/workflows/`, freshly synced from `pdlc/workflows/dist/` at the commit above —
  `pdlc/hooks/scripts/sync-workflows.sh --check` exits 0, every manifest row in sync.
- **Engine (npm channel):** engine v0.1.0. The run below invokes the checkout's own entry
  (`node pdlc/engine/bin/pdlc.mjs`, dev mode) rather than the globally npm-installed `pdlc`
  binary, which exists on PATH but is a stale mid-feature build; the checkout entry is the
  engine at the recorded commit. Store root and dev-mode resolution are reported by the run
  itself below.

## 2. The observation: one idle-queue pass through each channel

The same run was started through each channel: an `orchestrate-queue` pass over the same
scratch queue file (a valid, empty `QUEUE.md` table), chosen so the run completes quickly
and dispatches no pipeline work while still exercising each channel's full load, drift-gate,
queue-read, and report path end to end.

### 2a. Engine channel — provenance block present

Command: `node pdlc/engine/bin/pdlc.mjs queue --queue-path <scratch>/QUEUE.md`
(2026-08-15T17:07:39Z). Final report line (the engine's stamped report):

```json
{"outcome":"idle","reason":"queue is empty","remaining":0,"engine":{"engineVersion":"0.1.0",
"pluginVersion":"0.23.0","pluginRoot":"/Users/kaneho/.claude/plugins/cache/yumo-plugins/pdlc/0.23.0",
"transport":"agent-sdk","tunables":{"retryAttempts":3,"retryBackoff":{"baseMs":30000,"capMs":900000},
"timeoutMinutes":30,"maxIterations":null}, ...}}
```

The module's own report (`outcome`/`reason`/`remaining`) is wrapped with the engine's
provenance stamp: the `engine` block naming `engineVersion: "0.1.0"`,
`pluginVersion: "0.23.0"`, the plugin root, transport and tunables. **The engine run is
marked.**

### 2b. Bundle channel — completes, emits its report, carries no provenance block

The same queue pass was started through Claude Code's workflow runtime executing the
consumer bundle `.claude/workflows/orchestrate-queue.bundle.js` (workflow run
`wf_350a412b-d1f`, 6 IO agents, ~57 s). The run completed and returned its named output —
the queue run report:

```json
{"outcome":"idle","reason":"queue is empty","remaining":0}
```

No `engine` key, no provenance block, no provenance-shaped field of any kind. **The bundle
run is unmarked.** The conjunction AT-6.2 states — completed, emitted its named output,
carries no provenance block — is observed.

## 3. What the first observation attempt caught (recorded because it is the point)

The first bundle-channel attempt, at commit `c5a2256f`, did **not** complete: the queue
bundle threw `ReferenceError: ADVISORY_RUNG_SKILL is not defined` at load. Root cause:
`build-runtime.mjs`'s hand-maintained `__dev` publish list and queue-prelude rebind list had
drifted from `orchestrate-queue.js`'s real import statement when the advisory tier landed —
a defect present identically in main's `dist/` at `f5ce04dc`, invisible to every automated
gate because the engine channel imports the `.js` sources (never the bundles) and no test
loaded a built bundle. It was fixed in `2ff9cc11` (imports wired, a build-time
import-wiring assertion, and a bundle-load smoke test in `runtimeBundle.test.js`), and the
observation above was then performed at that commit. This is the coexistence-regression
class AT-6.2 exists to observe; the criterion found a real one on its first exercise.

## 4. The stated limit (FSPEC §9 Q-2, TE round-4 F-02)

This observation's only discriminating conjunct is **absence-shaped**: with no run-bound
load-root observation available on the bundle side (F-7 step 4), it cannot distinguish
"bundle run correctly unmarked" from "bundle run marked through some channel this report
shape does not carry". It rests on the independently known install state in §1, and it
claims exactly the conjunction in §2 and no more. It is a one-time, dated observation, not
a regression guard: nothing re-runs this two-channel pass. (The load half — "the bundle
still loads at all" — is, since `2ff9cc11`, guarded by the bundle-load smoke test; the
unmarked half remains observation-only.)

## 5. Scope note

This document observes AT-6.2 only. AT-6.1 (fresh-clone build/sync/check) is the CI job at
`.github/workflows/pr-tests.yml` and is not this task's scope; AC-6.2's load-root carrier
question remains with O-9/Q-1 as the FSPEC records. T51 owns exactly this file.
