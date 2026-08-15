// Tests for guard parity (T28, pdlc-headless-engine) — TSPEC §6 "Guard
// Parity Design", covering PROP-GUARD-1 through PROP-GUARD-15
// (PROPERTIES-pdlc-headless-engine.md:334-348), AT-ENG-41…AT-ENG-44.
//
// RED at T28 (batch 4): `buildGuardHooksOption` and a `hooksOption`
// constructor option do not exist yet on lib/transport.mjs;
// lib/transport-cli.mjs (and its `buildGuardSettingsFile`) does not exist
// yet at all; `checkGuardCarrier` does not exist yet on lib/startup.mjs.
// All three land at T36/T37 (PLAN §4, PROPERTIES "Task" column). This file
// pins the oracle and both halves of every clause ahead of that build, per
// TE F-41/DEC-ORACLE-01: a refusal (or an allow) with no falsifying
// counterpart proves nothing.
//
// The oracle throughout is the SHIPPED SCRIPT ITSELF
// (pdlc/hooks/scripts/guard-harvest-before-delete.sh), invoked directly as a
// subprocess and compared against the engine's own guard-hook callback —
// never a restated/hardcoded expectation of what the script "should" do
// (NG-1, DEC-ORACLE-01). Spawning that script is not a hermeticity
// violation: `__tests__/_bootstrap.mjs`'s construction guard only traps
// spawn/execFile calls whose basename is exactly "claude" (TSPEC §7.1); a
// bash+python subprocess is untouched by it.
//
// Every scratch tree below is deliberately NOT a git repo and carries
// neither `.claude/settings.json` hook entries nor a plugin registration —
// "no pdlc hooks registered on the host" (BR-GUARD-3). §6.3's mechanism: the
// test extracts the engine's own PreToolUse callback (primary) or the
// fallback's registered `--settings` command, invokes it with a synthetic
// tool-input JSON, and — critically — PERFORMS the deletion the verdict
// permits (fs.rmSync on allow, nothing on deny). Without that step,
// "survives" is unfalsifiable (TSPEC §6.3 step 3).

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from "node:fs";
import os from "node:os";

import { createTransport, DEFAULT_PERMISSION_MODE, buildGuardHooksOption } from "../lib/transport.mjs";
import { checkGuardCarrier } from "../lib/startup.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");
const SCRIPT_PATH = path.join(PLUGIN_ROOT, "hooks/scripts/guard-harvest-before-delete.sh");

// The three protected artifact classes (BR-GUARD-1) — PROP-GUARD-2 requires
// one case each, never a subset.
const PROTECTED_CLASSES = [
  { className: "CROSS-REVIEW", fileName: "CROSS-REVIEW-test-engineer-REQ-v1.md" },
  { className: "CODE_REVIEW", fileName: "CODE_REVIEW-guard-parity-v1.md" },
  { className: "ADVISORY", fileName: "ADVISORY-guard-parity.md" },
];

/** A scratch feature directory: `<root>/docs/<feature>/`, no git, no host hooks. */
function makeScratchTree({ withLearnings = false, withHostHooks = false } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "pdlc-guard-parity-"));
  const featureDir = path.join(root, "docs", "guard-parity-fixture");
  mkdirSync(featureDir, { recursive: true });
  if (withLearnings) {
    writeFileSync(path.join(featureDir, "LEARNINGS-guard-parity-fixture.md"), "# harvested\n");
  }
  if (withHostHooks) {
    // A live plugin-style hook registration on the HOST — used only by
    // PROP-GUARD-12 to prove the engine's own verdict is unaffected by it.
    const claudeDir = path.join(root, ".claude");
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(
      path.join(claudeDir, "settings.json"),
      JSON.stringify(
        {
          hooks: {
            PreToolUse: [
              {
                matcher: "Bash",
                hooks: [{ type: "command", command: `"${SCRIPT_PATH}"` }],
              },
            ],
          },
        },
        null,
        2
      )
    );
  }
  return { root, featureDir };
}

function cleanupTree(root) {
  rmSync(root, { recursive: true, force: true });
}

/**
 * Ground truth (DEC-ORACLE-01): run the shipped script directly, exactly as
 * a PreToolUse hook carrier would, and report its verdict.
 */
function runScriptDirect({ command, cwd }) {
  const input = JSON.stringify({ tool_name: "Bash", tool_input: { command } });
  const result = spawnSync(SCRIPT_PATH, [], {
    input,
    cwd,
    env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
    encoding: "utf8",
  });
  return { status: result.status, stderr: result.stderr || "", stdout: result.stdout || "" };
}

/** The synthetic PreToolUse input shape the SDK passes (sdk.d.ts:2325). */
function toolUseInput({ command, cwd }) {
  return {
    hook_event_name: "PreToolUse",
    session_id: "guard-parity-test",
    transcript_path: "/dev/null",
    cwd,
    tool_name: "Bash",
    tool_input: { command },
    tool_use_id: "toolu_guard_parity_test",
  };
}

/**
 * Simulates the SDK's own matcher-based dispatch (TSPEC §6.3 step 1-2): only
 * a matcher that actually matches `toolName` gets invoked. This is what lets
 * PROP-GUARD-6's mis-built-matcher case prove the assertion reads the
 * engine's wiring rather than a constant — with matcher "Write", the "Bash"
 * tool use is never routed to the callback at all.
 */
async function dispatchHookEvent(hooksOption, event, { toolName, command, cwd }) {
  const matchers = (hooksOption && hooksOption[event]) || [];
  for (const { matcher, hooks } of matchers) {
    const re = matcher instanceof RegExp ? matcher : new RegExp(`^(${matcher})$`);
    if (!re.test(toolName)) continue;
    for (const cb of hooks) {
      const result = await cb(toolUseInput({ command, cwd }), "toolu_guard_parity_test", {
        signal: new AbortController().signal,
      });
      return result || {};
    }
  }
  return {}; // no matcher fired — structurally identical to an allow (§6.3 clause c falsifier)
}

function isDeny(hookResult) {
  return Boolean(hookResult && hookResult.hookSpecificOutput && hookResult.hookSpecificOutput.permissionDecision === "deny");
}

function denyReason(hookResult) {
  return (hookResult && hookResult.hookSpecificOutput && hookResult.hookSpecificOutput.permissionDecisionReason) || "";
}

/** TSPEC §6.3 step 3: perform the deletion the verdict permits. */
function performGuardedDelete(hookResult, filePath) {
  if (!isDeny(hookResult)) rmSync(filePath, { force: false });
}

// ── PROP-GUARD-1/2: no host hooks, no LEARNINGS ⇒ refused, all three classes ──

for (const { className, fileName } of PROTECTED_CLASSES) {
  test(`PROP-GUARD-1/2 (primary): ${className} deletion is refused with no LEARNINGS and no host hooks`, async () => {
    const { root, featureDir } = makeScratchTree({ withLearnings: false });
    try {
      const filePath = path.join(featureDir, fileName);
      writeFileSync(filePath, "# protected\n");
      const command = `rm docs/guard-parity-fixture/${fileName}`;

      const oracle = runScriptDirect({ command, cwd: root });
      assert.equal(oracle.status, 2, "oracle (shipped script) must itself refuse in this fixture");

      const hooksOption = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });
      const result = await dispatchHookEvent(hooksOption, "PreToolUse", { toolName: "Bash", command, cwd: root });

      assert.equal(isDeny(result), true, `expected deny for ${className}`);
      performGuardedDelete(result, filePath);
      assert.equal(existsSync(filePath), true, "denied deletion must not touch the file");
    } finally {
      cleanupTree(root);
    }
  });
}

// ── PROP-GUARD-3: the SAME fixture, with LEARNINGS present, allows ──────────

for (const { className, fileName } of PROTECTED_CLASSES) {
  test(`PROP-GUARD-3 (primary): ${className} deletion is allowed on the same fixture once LEARNINGS exists`, async () => {
    const { root, featureDir } = makeScratchTree({ withLearnings: true });
    try {
      const filePath = path.join(featureDir, fileName);
      writeFileSync(filePath, "# protected\n");
      const command = `rm docs/guard-parity-fixture/${fileName}`;

      const oracle = runScriptDirect({ command, cwd: root });
      assert.equal(oracle.status, 0, "oracle (shipped script) must itself allow once LEARNINGS exists");

      const hooksOption = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });
      const result = await dispatchHookEvent(hooksOption, "PreToolUse", { toolName: "Bash", command, cwd: root });

      assert.equal(isDeny(result), false, `expected allow for ${className} once LEARNINGS exists`);
    } finally {
      cleanupTree(root);
    }
  });
}

// ── PROP-GUARD-4: survival is falsifiable — same fixture, same delete step,
//    allow verdict actually removes the file ───────────────────────────────

test("PROP-GUARD-4 (primary): the paired allow verdict actually removes the file — survival is falsifiable", async () => {
  const denyCase = makeScratchTree({ withLearnings: false });
  const allowCase = makeScratchTree({ withLearnings: true });
  try {
    const denyFile = path.join(denyCase.featureDir, PROTECTED_CLASSES[0].fileName);
    const allowFile = path.join(allowCase.featureDir, PROTECTED_CLASSES[0].fileName);
    writeFileSync(denyFile, "# protected\n");
    writeFileSync(allowFile, "# protected\n");
    const denyCommand = `rm docs/guard-parity-fixture/${PROTECTED_CLASSES[0].fileName}`;
    const allowCommand = denyCommand;

    const hooksOption = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });

    const denyResult = await dispatchHookEvent(hooksOption, "PreToolUse", {
      toolName: "Bash",
      command: denyCommand,
      cwd: denyCase.root,
    });
    performGuardedDelete(denyResult, denyFile);
    assert.equal(existsSync(denyFile), true, "deny verdict: file survives");

    const allowResult = await dispatchHookEvent(hooksOption, "PreToolUse", {
      toolName: "Bash",
      command: allowCommand,
      cwd: allowCase.root,
    });
    performGuardedDelete(allowResult, allowFile);
    assert.equal(existsSync(allowFile), false, "allow verdict on the SAME fixture/step: file is actually removed");
  } finally {
    cleanupTree(denyCase.root);
    cleanupTree(allowCase.root);
  }
});

// ── PROP-GUARD-5: the deny reason is visible to the agent, byte-exact ───────

test("PROP-GUARD-5 (primary): the deny reason carries the script's stderr byte-exact, prefix and bracketed directory", async () => {
  const { root, featureDir } = makeScratchTree({ withLearnings: false });
  try {
    const fileName = PROTECTED_CLASSES[0].fileName;
    const filePath = path.join(featureDir, fileName);
    writeFileSync(filePath, "# protected\n");
    const command = `rm docs/guard-parity-fixture/${fileName}`;

    const oracle = runScriptDirect({ command, cwd: root });
    assert.equal(oracle.status, 2);

    const hooksOption = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });
    const result = await dispatchHookEvent(hooksOption, "PreToolUse", { toolName: "Bash", command, cwd: root });

    assert.equal(isDeny(result), true);
    assert.equal(denyReason(result), oracle.stderr, "the callback's reason must equal the script's stderr byte-exact");
    assert.match(denyReason(result), /^pdlc guard: refusing to delete/, "byte-exact prefix orchestrate-dev.js string-tests for");
    assert.match(denyReason(result), /\[docs[/\\]guard-parity-fixture\]/, "byte-exact bracketed directory orchestrate-dev.js regex-extracts");
  } finally {
    cleanupTree(root);
  }
});

// ── PROP-GUARD-6: clause (c) reads the engine's OWN wiring, not a constant ──

test("PROP-GUARD-6a (primary): a mis-built matcher (\"Write\" instead of \"Bash\") produces NO deny — the callback is never even routed", async () => {
  const { root, featureDir } = makeScratchTree({ withLearnings: false });
  try {
    const fileName = PROTECTED_CLASSES[0].fileName;
    const filePath = path.join(featureDir, fileName);
    writeFileSync(filePath, "# protected\n");
    const command = `rm docs/guard-parity-fixture/${fileName}`;

    const hooksOption = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });
    // Deliberately mis-build the matcher a real config would ship as "Bash".
    const misbuilt = { PreToolUse: [{ matcher: "Write", hooks: hooksOption.PreToolUse[0].hooks }] };

    const result = await dispatchHookEvent(misbuilt, "PreToolUse", { toolName: "Bash", command, cwd: root });

    assert.equal(isDeny(result), false, "matcher mismatch: the guard must never fire, proving the assertion reads wiring");
    // The falsifying counterpart: the SAME fixture, correctly wired, DOES deny.
    const correct = await dispatchHookEvent(hooksOption, "PreToolUse", { toolName: "Bash", command, cwd: root });
    assert.equal(isDeny(correct), true, "the same fixture, correctly wired, must deny — proving PROP-GUARD-6a is not vacuously true");
  } finally {
    cleanupTree(root);
  }
});

test("PROP-GUARD-6b (primary): a hook path pointed at a nonexistent script produces NO deny", async () => {
  const { root, featureDir } = makeScratchTree({ withLearnings: false });
  try {
    const fileName = PROTECTED_CLASSES[0].fileName;
    const filePath = path.join(featureDir, fileName);
    writeFileSync(filePath, "# protected\n");
    const command = `rm docs/guard-parity-fixture/${fileName}`;

    const nonexistentScript = path.join(PLUGIN_ROOT, "hooks/scripts/does-not-exist-guard.sh");
    assert.equal(existsSync(nonexistentScript), false, "fixture precondition: the path really is absent");

    const misbuilt = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT, scriptPath: nonexistentScript });
    const result = await dispatchHookEvent(misbuilt, "PreToolUse", { toolName: "Bash", command, cwd: root });

    assert.equal(isDeny(result), false, "a hook path pointed at a nonexistent script must never produce a deny");
  } finally {
    cleanupTree(root);
  }
});

// ── PROP-GUARD-7: the dispatch the guard is proven against is composed
//    exactly as production, bypassPermissions included ────────────────────

test("PROP-GUARD-7: a dispatch built with createTransport carries BOTH bypassPermissions AND the guard hooks — never a weaker posture", async () => {
  let capturedOptions = null;
  const fakeQueryFn = async ({ options }) => {
    capturedOptions = options;
    return (async function* () {
      yield { type: "system", subtype: "init", apiKeySource: "none" };
      yield {
        type: "result",
        subtype: "success",
        result: "ok",
        session_id: "s1",
        total_cost_usd: 0,
        usage: {},
      };
    })();
  };

  const hooksOption = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });
  const transport = createTransport({ queryFn: fakeQueryFn, hooksOption });
  await transport.dispatch("guard parity composition probe", { cwd: process.cwd(), timeoutMs: 5000 });

  assert.ok(capturedOptions, "the fake queryFn must have been called");
  assert.equal(
    capturedOptions.permissionMode,
    DEFAULT_PERMISSION_MODE,
    "the guard must be proven under the PRODUCTION permission mode, not a weaker one"
  );
  assert.equal(capturedOptions.allowDangerouslySkipPermissions, true, "bypass's required paired acknowledgement");
  assert.ok(capturedOptions.hooks, "the composed dispatch options must carry the guard hooks");
  assert.equal(capturedOptions.hooks.PreToolUse[0].matcher, "Bash");
  assert.equal(capturedOptions.hooks.PreToolUse[0].hooks.length, 1);
});

// ── PROP-GUARD-8: both directions, per transport — the fallback's carrier is
//    its own `--settings` file, never the primary's in-process callback ────

/**
 * The fallback's carrier per §6.2: a `--settings` JSON file registering the
 * shipped script as a `command`-type hook, the same shape `pdlc/hooks/hooks.json`
 * already ships. Since `claude -p` "runs the script itself" (§6.2), the
 * hermetic proof is: extract the registered command from the written file and
 * run it exactly as the CLI's own hook machinery would — never spawning a
 * `claude` child (the hermeticity guard's exact matcher, TSPEC §7.1).
 */
function runFallbackCommand(settingsPath, { command, cwd }) {
  const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  const registered = settings.hooks.PreToolUse[0].hooks[0].command;
  // hooks.json's shape quotes the path: `"${SCRIPT_PATH}"` with no shell
  // expansion needed here since buildGuardSettingsFile resolves it already.
  const scriptPath = registered.replace(/^"|"$/g, "");
  const input = JSON.stringify(toolUseInput({ command, cwd }));
  const result = spawnSync(scriptPath, [], {
    input,
    cwd,
    env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
    encoding: "utf8",
  });
  return { status: result.status, stderr: result.stderr || "" };
}

test("PROP-GUARD-8 (fallback): the --settings carrier denies with no LEARNINGS and allows once LEARNINGS exists — its own fixture, not the primary's", async () => {
  const { buildGuardSettingsFile } = await import("../lib/transport-cli.mjs");

  const denyCase = makeScratchTree({ withLearnings: false });
  const allowCase = makeScratchTree({ withLearnings: true });
  const fileName = PROTECTED_CLASSES[0].fileName;
  const command = `rm docs/guard-parity-fixture/${fileName}`;
  let denyHandle;
  let allowHandle;
  try {
    writeFileSync(path.join(denyCase.featureDir, fileName), "# protected\n");
    writeFileSync(path.join(allowCase.featureDir, fileName), "# protected\n");

    denyHandle = buildGuardSettingsFile({ pluginRoot: PLUGIN_ROOT });
    assert.ok(existsSync(denyHandle.path), "settings file must exist once built");
    const denyResult = runFallbackCommand(denyHandle.path, { command, cwd: denyCase.root });
    assert.equal(denyResult.status, 2, "fallback carrier must refuse with no LEARNINGS");

    allowHandle = buildGuardSettingsFile({ pluginRoot: PLUGIN_ROOT });
    const allowResult = runFallbackCommand(allowHandle.path, { command, cwd: allowCase.root });
    assert.equal(allowResult.status, 0, "fallback carrier must allow once LEARNINGS exists — same pairing as the primary");
  } finally {
    if (denyHandle) denyHandle.cleanup();
    if (allowHandle) allowHandle.cleanup();
    cleanupTree(denyCase.root);
    cleanupTree(allowCase.root);
  }
});

// ── PROP-GUARD-9: the shipped script is the ONLY definition — the engine
//    must invoke {pluginRoot}/hooks/scripts/guard-harvest-before-delete.sh,
//    never a reimplementation ────────────────────────────────────────────

test("PROP-GUARD-9 (primary): the engine invokes the shipped script path and consumes its exit code — no reimplementation", async () => {
  const invoked = [];
  const execFileFn = (file, args, opts) => {
    invoked.push(file);
    // Delegate to the real thing so the deny/allow behaviour is unchanged —
    // this seam only observes WHICH file is run, it does not fake the result.
    return spawnSync(file, args, opts);
  };

  const { root, featureDir } = makeScratchTree({ withLearnings: false });
  try {
    const fileName = PROTECTED_CLASSES[0].fileName;
    writeFileSync(path.join(featureDir, fileName), "# protected\n");
    const command = `rm docs/guard-parity-fixture/${fileName}`;

    const hooksOption = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT, execFileFn });
    const result = await dispatchHookEvent(hooksOption, "PreToolUse", { toolName: "Bash", command, cwd: root });

    assert.equal(isDeny(result), true, "behaviour must be unchanged when routed through the injected seam");
    assert.deepEqual(invoked, [SCRIPT_PATH], "the engine must invoke exactly the resolved plugin script path, once");
  } finally {
    cleanupTree(root);
  }
});

// ── PROP-GUARD-10: the guard configuration's lifetime is per-dispatch,
//    never process-global ──────────────────────────────────────────────────

test("PROP-GUARD-10a (primary): two calls to buildGuardHooksOption produce two independently-built configurations", () => {
  const first = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });
  const second = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });

  assert.notEqual(first, second, "must not be the same object (process-global) across dispatches");
  assert.notEqual(first.PreToolUse, second.PreToolUse, "the PreToolUse array must not be shared");
  assert.notEqual(first.PreToolUse[0].hooks, second.PreToolUse[0].hooks, "the hooks array must not be shared");
});

test("PROP-GUARD-10b (fallback): the temp --settings file's lifetime is per dispatch, removed after, independent of a second dispatch's file", async () => {
  const { buildGuardSettingsFile } = await import("../lib/transport-cli.mjs");

  const first = buildGuardSettingsFile({ pluginRoot: PLUGIN_ROOT });
  const second = buildGuardSettingsFile({ pluginRoot: PLUGIN_ROOT });

  assert.notEqual(first.path, second.path, "two dispatches must not share one temp settings file");
  assert.ok(existsSync(first.path));
  assert.ok(existsSync(second.path));

  first.cleanup();
  assert.equal(existsSync(first.path), false, "cleanup must remove the first dispatch's file");
  assert.equal(existsSync(second.path), true, "the second dispatch's file must be unaffected by the first's cleanup");

  second.cleanup();
  assert.equal(existsSync(second.path), false);
});

// ── PROP-GUARD-11: the guard's own decision procedure is unchanged — pinned
//    directly against the shipped script, no engine code involved. Green at
//    HEAD (`guard-harvest-before-delete.sh:29-30`, `:35-38`); pinned so a
//    later edit to the script cannot drift its own contract silently. ──────

test("PROP-GUARD-11a: unparseable hook stdin exits 0 (script.sh:29-30)", () => {
  const result = spawnSync(SCRIPT_PATH, [], { input: "not json{{{", encoding: "utf8" });
  assert.equal(result.status, 0);
});

test("PROP-GUARD-11b: scope requires BOTH a protected class name and a removal form", () => {
  const { root, featureDir } = makeScratchTree({ withLearnings: false });
  try {
    // Names a protected class, but no removal verb — out of scope, allowed.
    const mentionsClassNoRemoval = runScriptDirect({
      command: "cat docs/guard-parity-fixture/CROSS-REVIEW-x.md",
      cwd: root,
    });
    assert.equal(mentionsClassNoRemoval.status, 0);

    // A removal verb, but no protected class token — out of scope, allowed.
    const removalNoClass = runScriptDirect({ command: "rm docs/guard-parity-fixture/scratch.md", cwd: root });
    assert.equal(removalNoClass.status, 0);
  } finally {
    cleanupTree(root);
  }
});

test("PROP-GUARD-11c/EC-GUARD-5 (AT-ENG-44): a non-matching deletion (plain source file) is unaffected", () => {
  const { root, featureDir } = makeScratchTree({ withLearnings: false });
  try {
    writeFileSync(path.join(featureDir, "index.js"), "// scratch\n");
    const result = runScriptDirect({ command: "rm docs/guard-parity-fixture/index.js", cwd: root });
    assert.equal(result.status, 0, "a plain source/scratch file must be unaffected by the guard's classes");
  } finally {
    cleanupTree(root);
  }
});

// ── PROP-GUARD-12/EC-GUARD-1 (AT-ENG-44): a host WITH the plugin's hooks
//    registered must still refuse, and the engine's own guard must not
//    double-fire — its verdict is identical with or without the host's own
//    (separately-live) hook file, proving the engine's guard is
//    self-contained and not a second layer stacked on the host's ─────────

test("PROP-GUARD-12: the engine's guard verdict is identical whether or not the host also carries a live hook registration", async () => {
  const withHost = makeScratchTree({ withLearnings: false, withHostHooks: true });
  const withoutHost = makeScratchTree({ withLearnings: false, withHostHooks: false });
  try {
    const fileName = PROTECTED_CLASSES[0].fileName;
    writeFileSync(path.join(withHost.featureDir, fileName), "# protected\n");
    writeFileSync(path.join(withoutHost.featureDir, fileName), "# protected\n");
    const command = `rm docs/guard-parity-fixture/${fileName}`;

    const hooksOption = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });

    const withHostResult = await dispatchHookEvent(hooksOption, "PreToolUse", {
      toolName: "Bash",
      command,
      cwd: withHost.root,
    });
    const withoutHostResult = await dispatchHookEvent(hooksOption, "PreToolUse", {
      toolName: "Bash",
      command,
      cwd: withoutHost.root,
    });

    assert.equal(isDeny(withHostResult), true, "must still refuse on a host that ALSO has the plugin's hooks live (EC-GUARD-1)");
    assert.equal(isDeny(withoutHostResult), true);
    assert.equal(
      denyReason(withHostResult),
      denyReason(withoutHostResult),
      "one verdict, one reason — the engine's guard does not consult or duplicate the host's own hook file"
    );
    // Exactly one PreToolUse matcher entry was dispatched to produce this
    // verdict — never a second, stacked refusal the agent cannot interpret.
    assert.equal(hooksOption.PreToolUse.length, 1);
  } finally {
    cleanupTree(withHost.root);
    cleanupTree(withoutHost.root);
  }
});

// ── PROP-GUARD-13/EC-GUARD-3: an untracked LEARNINGS file is governed by the
//    shipped script's OWN definition of "exists" — filesystem presence, not
//    git tracking — asserted by equality with the script's verdict, never a
//    restated definition ────────────────────────────────────────────────────

test("PROP-GUARD-13: an untracked (no git repo at all) LEARNINGS-*.md still governs the verdict, by equality with the script's own", async () => {
  const { root, featureDir } = makeScratchTree({ withLearnings: true }); // never git-init'd anywhere in this suite
  try {
    assert.equal(existsSync(path.join(root, ".git")), false, "fixture precondition: not a git repo at all");
    const fileName = PROTECTED_CLASSES[0].fileName;
    writeFileSync(path.join(featureDir, fileName), "# protected\n");
    const command = `rm docs/guard-parity-fixture/${fileName}`;

    const oracle = runScriptDirect({ command, cwd: root });
    const hooksOption = buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT });
    const result = await dispatchHookEvent(hooksOption, "PreToolUse", { toolName: "Bash", command, cwd: root });

    assert.equal(isDeny(result), oracle.status === 2, "the engine's verdict must equal the script's own, never a restated rule");
    assert.equal(isDeny(result), false, "an untracked-but-present LEARNINGS file allows, exactly as the script alone decides");
  } finally {
    cleanupTree(root);
  }
});

// ── PROP-GUARD-14/15/EC-GUARD-4 (AT-ENG-43): fail-closed refusal to dispatch
//    when the guard configuration cannot be carried, before the repo is
//    touched, message satisfying all three obligations ────────────────────

test("PROP-GUARD-14: a transport that CAN carry the guard configuration passes the capability check", () => {
  const result = checkGuardCarrier({
    pluginRoot: PLUGIN_ROOT,
    probeFn: () => buildGuardHooksOption({ pluginRoot: PLUGIN_ROOT }),
  });
  assert.equal(result.ok, true);
  assert.equal(result.reason, null);
});

test("PROP-GUARD-14/15: a transport that CANNOT carry the guard configuration refuses, before the repo is touched", () => {
  const result = checkGuardCarrier({
    pluginRoot: PLUGIN_ROOT,
    probeFn: () => {
      throw new Error("simulated: this host/transport cannot register a PreToolUse hook");
    },
  });

  assert.equal(result.ok, false, "must refuse rather than dispatch unguarded (fail-closed, C-5)");
  assert.equal(typeof result.reason, "string");
  // AT-ENG-43: three separate obligations, asserted as three separate expectations.
  assert.match(result.reason, /guard/i, "obligation 1: names the missing capability");
  assert.match(result.reason, /cli|claude -p|fallback/i, "obligation 2: names the fallback transport as the known alternative");
  assert.match(result.reason, /not yet available|not.{0,20}available/i, "obligation 3: states selecting it is not yet available");
});
