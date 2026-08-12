// pdlc-engine startup sequence (Phase 6, pdlc-headless-engine, T44).
//
// Every command that can dispatch — `pdlc dev`, `pdlc queue` — and the
// non-dispatching `pdlc doctor` share ONE startup: a total, SEVEN-rung ladder
// (FSPEC §4.1, TSPEC §4.3) that resolves the plugin, reads its version, runs
// the C-10 handshake, verifies the skill prompts are readable, probes the
// guard script's interpreter, and checks the billing/auth posture — always
// reporting all seven rungs, in `RUNG_ORDER`, so `doctor` is literally the
// same code path the run commands take.
//
// This module deliberately imports NOTHING from pdlc/workflows/ at module
// load time. A failed handshake must abort before the workflow modules are
// even loaded (REQ C-10: fail-closed, dispatch nothing), which is why the
// derived dispatchable-skill set (TSPEC §3.3, `lib/run.mjs`'s
// `loadDispatchableSkills()`) is a caller-supplied `dispatchableSkills`
// argument here rather than something this module resolves itself — rung 4
// only ever reads what it is handed, never imports the workflow modules on
// its own (R-ARCH-1).

import path from "node:path";
import os from "node:os";
import nodeFs from "node:fs";
import { spawnSync } from "node:child_process";

import { resolvePluginRoot, loadSkill, PLUGIN_ROOT_ENV } from "./skills.mjs";
import { readPluginVersion, checkCompat, buildBanner } from "./handshake.mjs";
import { DEFAULT_PERMISSION_MODE, buildGuardHooksOption, assertCwdIsGitRepository } from "./transport.mjs";
import { readLoginEvidence, resolveAuthPosture } from "./auth.mjs";

/** FSPEC §4.1's ladder, verbatim: rung ids are LABELS, never integer indices. */
export const RUNG_ORDER = Object.freeze(["0", "1", "2", "3", "4", "4a", "5"]);

/**
 * The plugin's five real skill directories no workflow module ever dispatches
 * (REQ:499-507, DEC-ENG-05) — operator-invoked only (`/pdlc:tech-lead`, …).
 * Rung 4's Direction B reports a prompt file under one of these as
 * out-of-scope, never a refusal (EC-START-7). This is informational, not the
 * declaration BR-START-4 forbids: BR-START-4 governs the *dispatchable* set,
 * which is never hand-typed here (it is the caller-supplied
 * `dispatchableSkills`, derived from the workflow modules by `lib/run.mjs`).
 */
export const OPERATOR_ONLY_SKILLS = Object.freeze([
  "consolidate-learnings",
  "orchestrate-dev",
  "orchestrate-queue",
  "tech-lead",
  "tech-lead-python",
]);

/**
 * Rung 4a's candidate interpreters, in probe order — a transcription of the
 * shipped script's own candidate list
 * (`pdlc/hooks/scripts/guard-harvest-before-delete.sh:15-20`), never an
 * import from it (TSPEC §7.8, BR-GUARD-6).
 */
export const GUARD_INTERPRETERS = Object.freeze(["python3", "python", "py"]);

/**
 * Legacy export, kept for `__tests__/preflight.test.js`'s BL-PREREQ gate
 * (T00, out of this task's target_paths) which only asserts the symbol is
 * importable. Rung 4 no longer reads this: BR-START-4 forbids exactly this
 * kind of hand-typed declaration beside a dispatch site, and rung 4 now
 * takes the derived set as `dispatchableSkills` (TSPEC §3.3,
 * `lib/run.mjs`'s `loadDispatchableSkills()`).
 */
export const EXPECTED_SKILLS = Object.freeze([
  "consolidate-learnings",
  "dod-verify",
  "harvest-learnings",
  "orchestrate-dev",
  "orchestrate-queue",
  "pm-author",
  "pm-review",
  "se-author",
  "se-implement",
  "se-implement:SKILL-typescript.md",
  "se-implement:SKILL-python.md",
  "se-review",
  "ship-pr",
  "te-author",
  "te-review",
  "tech-lead",
  "tech-lead-python",
]);

/**
 * `runProbe`'s real default: the shipped script's own probe command,
 * verbatim (`guard-harvest-before-delete.sh:16`), so this precondition never
 * probes differently from the script it stands for. The `spawnSync` →
 * `{ran, outcome}` mapping is fixed by TSPEC §7.8's table, not left to the
 * caller.
 */
function defaultRunProbe(candidate) {
  const result = spawnSync(candidate, ["-c", "import sys"]);
  if (result.error) return { ran: false, outcome: "not found" };
  if (result.status !== 0) return { ran: false, outcome: `found but exited ${result.status}` };
  return { ran: true, outcome: "ran" };
}

/**
 * Total: never throws. One probe attempt per candidate, in
 * `GUARD_INTERPRETERS` order, stopping at the first that ran — presence is
 * not executability (EC-START-11).
 *
 * @param {object} [opts]
 * @param {string[]} [opts.candidates] Defaults to `GUARD_INTERPRETERS`.
 * @param {Function} [opts.runProbe] `(candidate: string) => {ran, outcome}`.
 * @returns {{interpreter: string|null, attempts: {candidate: string, outcome: string}[]}}
 */
export function probeGuardInterpreter({ candidates = GUARD_INTERPRETERS, runProbe = defaultRunProbe } = {}) {
  const attempts = [];
  for (const candidate of candidates) {
    const { ran, outcome } = runProbe(candidate);
    attempts.push({ candidate, outcome });
    if (ran) return { interpreter: candidate, attempts };
  }
  return { interpreter: null, attempts };
}

function renderAttempts(attempts) {
  return attempts.map((a) => `${a.candidate} (${a.outcome})`).join(", ");
}

/**
 * EC-GUARD-4 (TSPEC §6.4, AT-ENG-43): a startup-time capability probe of
 * whether the *transport* can carry the guard configuration at all — distinct
 * from rung 4a, which asks whether the *host* can run the shipped script.
 * Fail-closed: a transport that cannot carry the guard refuses rather than
 * dispatching unguarded, and the refusal satisfies three separate
 * obligations — names the missing capability, names the CLI fallback
 * transport, and states that selecting it is not yet available.
 *
 * @param {object} opts
 * @param {string} opts.pluginRoot
 * @param {Function} opts.probeFn Builds (or throws while building) the guard
 *   carrier configuration for this transport.
 * @returns {{ok: boolean, reason: string|null}}
 */
export function checkGuardCarrier({ pluginRoot, probeFn }) {
  try {
    probeFn(pluginRoot);
    return { ok: true, reason: null };
  } catch (err) {
    return {
      ok: false,
      reason:
        `this transport cannot carry the guard configuration (${err && err.message ? err.message : err}); ` +
        `the CLI fallback transport (\`claude -p\`) is the known alternative, but selecting it is not yet ` +
        `available in this engine.`,
    };
  }
}

function defaultGuardProbe(pluginRoot) {
  return buildGuardHooksOption({ pluginRoot });
}

/** Rung 0's cwd half: `true`/`false`, never throws (wraps the throwing assertion). */
function defaultIsGitRepo(cwd) {
  try {
    assertCwdIsGitRepository(cwd);
    return true;
  } catch {
    return false;
  }
}

/** Rung 0's REQ-path half (`dev` only — BR-START-0): the path exists under `cwd`. */
function defaultCheckReqPath(cwd, reqPath) {
  try {
    return nodeFs.existsSync(path.join(cwd, reqPath));
  } catch {
    return false;
  }
}

/**
 * Rung 4 Direction B's default: every installed identifier under
 * `{pluginRoot}/skills/*` with a readable `.md` file — `SKILL.md` names the
 * directory itself, any other `.md` is a supplement (`dir:file`), matching
 * the identifier shape `dispatchableSkills` and `loadSkillFn` already use.
 */
function defaultListInstalledSkills(pluginRoot, fs = nodeFs) {
  const skillsDir = path.join(String(pluginRoot || ""), "skills");
  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const entry of entries) {
    if (!entry.isDirectory || !entry.isDirectory()) continue;
    const dirPath = path.join(skillsDir, entry.name);
    let files;
    try {
      files = fs.readdirSync(dirPath);
    } catch {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      out.push(file === "SKILL.md" ? entry.name : `${entry.name}:${file}`);
    }
  }
  return out;
}

/**
 * Rung 0 (FSPEC §4.1 row 0, BR-START-0). `reqPath === undefined` is
 * `doctor`'s "not applicable" half; a string is `dev`'s "REQ path exists
 * under cwd" half, checked only once the cwd half itself passes.
 */
function evalRung0({ cwd, reqPath, isGitRepoFn, checkReqPathFn }) {
  const gitOk = isGitRepoFn(cwd);
  if (reqPath === undefined) {
    return {
      ok: gitOk,
      detail: gitOk
        ? "cwd is a git repository; REQ-path check not applicable (doctor)"
        : `cwd is not a git repository: ${cwd}`,
    };
  }
  if (!gitOk) return { ok: false, detail: `cwd is not a git repository: ${cwd}` };
  const reqOk = checkReqPathFn(cwd, reqPath);
  return {
    ok: reqOk,
    detail: reqOk
      ? `cwd is a git repository; REQ path exists: ${reqPath}`
      : `REQ path not found under cwd: ${reqPath}`,
  };
}

/** `id`'s directory half — `"se-implement:SKILL-typescript.md"` → `"se-implement"`. */
function skillDirOf(id) {
  return String(id).split(":")[0];
}

/**
 * Rung 4 (AC-3.5, BR-START-4, TSPEC §3.3/§4.4). Total: never throws.
 * `dispatchableSkills === null` (no caller-supplied derived set) is not a
 * failure — it means the caller has not resolved `loadDispatchableSkills()`
 * yet (this module never imports the workflow modules itself, R-ARCH-1) — so
 * the rung passes without asserting, exactly like rung 0's doctor
 * "not applicable" half.
 */
function evalRung4({ pluginRoot, dispatchableSkills, loadSkillFn, listInstalledSkillsFn }) {
  if (dispatchableSkills == null) {
    return { ok: true, detail: "dispatchable-set not supplied — set-equality check skipped" };
  }

  const missingA = [];
  for (const id of dispatchableSkills) {
    try {
      loadSkillFn(pluginRoot, id);
    } catch (err) {
      missingA.push(`${id} (${err && err.message ? err.message : err})`);
    }
  }

  const installed = listInstalledSkillsFn(pluginRoot);
  const unreachableB = installed.filter(
    (id) => !dispatchableSkills.includes(id) && !OPERATOR_ONLY_SKILLS.includes(skillDirOf(id))
  );

  const ok = missingA.length === 0 && unreachableB.length === 0;
  if (ok) {
    return {
      ok: true,
      detail: `${dispatchableSkills.length} dispatchable identifier(s), all readable; ${installed.length} installed prompt file(s) accounted for`,
    };
  }
  const parts = [];
  if (missingA.length) parts.push(`unreadable dispatchable prompt(s) (Direction A): ${missingA.join("; ")}`);
  if (unreachableB.length)
    parts.push(`installed prompt(s) not reachable by any dispatch (Direction B): ${unreachableB.join(", ")}`);
  return { ok: false, detail: parts.join("; ") };
}

/**
 * Resolve + handshake + skill-readability + guard executability + billing
 * posture, as one total, ordered, seven-rung ladder (TSPEC §4.3). Never
 * throws for an environment problem, it reports one. Rung 5 is evaluated
 * independently of rungs 1–4 (gated only by rung 0, EC-START-8); rungs
 * 1–4/4a form a single dependent chain, each skipped-with-reason once an
 * earlier link in the chain fails (BR-START-1).
 *
 * @param {object} [opts]
 * @param {string} [opts.pluginRoot] Explicit root (CLI `--plugin-root`).
 * @param {object} [opts.env] Environment (`PDLC_PLUGIN_ROOT`, auth, base URL).
 * @param {string} opts.engineVersion package.json → version.
 * @param {string} opts.engineCompat package.json → pdlcPluginCompat.
 * @param {string} [opts.permissionMode] Banner's tool-permission row.
 * @param {string} [opts.cwd] Consumer repo root. Default `process.cwd()`.
 * @param {string} [opts.reqPath] `dev`'s REQ path; omitted entirely = `doctor`.
 * @param {string[]|null} [opts.dispatchableSkills] Rung 4's derived set
 *   (TSPEC §3.3/§4.4). `null` (default) skips the equality check rather than
 *   failing it — see `evalRung4`.
 * @param {boolean} [opts.dryRun] EC-START-4: a rung-5-only refusal is
 *   reported but not fatal.
 * @param {string} [opts.home] Forwarded to `readLoginEvidence`.
 * @param {object} [opts.fs] Forwarded to `readLoginEvidence`.
 * @param {boolean} [opts.allowApiKeyBilling] Forwarded to `resolveAuthPosture`.
 * @param {Function} [opts.runProbe] Rung 4a's injectable probe (TSPEC §7.8).
 * @returns {{ok: boolean, rungs: object[], banner: string[], pluginRoot: string|null,
 *   pluginVersion: string|null, versions: {engine: string, plugin: string|null},
 *   baseUrl: string|null, auth: {row: number, catalogueId: string}, reason: string|null}}
 */
export function runStartupChecks({
  pluginRoot = null,
  env = process.env,
  engineVersion,
  engineCompat,
  permissionMode = DEFAULT_PERMISSION_MODE,
  resolveFn = resolvePluginRoot,
  readVersionFn = readPluginVersion,
  loadSkillFn = loadSkill,
  cwd = process.cwd(),
  reqPath = undefined,
  isGitRepoFn = defaultIsGitRepo,
  checkReqPathFn = defaultCheckReqPath,
  dispatchableSkills = null,
  listInstalledSkillsFn = defaultListInstalledSkills,
  dryRun = false,
  home = os.homedir(),
  fs = nodeFs,
  allowApiKeyBilling = false,
  readLoginEvidenceFn = readLoginEvidence,
  resolveAuthPostureFn = resolveAuthPosture,
  runProbe = defaultRunProbe,
  guardProbeFn = defaultGuardProbe,
  checkGuardCarrierFn = checkGuardCarrier,
} = {}) {
  const rungs = [];
  const push = (id, name, state, detail) => rungs.push({ rung: id, name, state, detail });

  // ── rung 0: args & cwd (gates every other rung) ──────────────────────────
  const r0 = evalRung0({ cwd, reqPath, isGitRepoFn, checkReqPathFn });
  push("0", "cwd & REQ path (BR-START-0)", r0.ok ? "pass" : "fail", r0.detail);

  const skip = (id, name, reason) => push(id, name, "skipped", reason);

  // ── the chain: 1 → 2 → 3 → 4 → 4a, each gated by the previous ───────────
  let chainAlive = r0.ok;
  const chainSkipReason = r0.ok ? null : `skipped — rung 0 did not pass: ${r0.detail}`;

  let pluginRootResolved = null;
  let pluginVersionResolved = null;

  if (chainAlive) {
    const resolution = resolveFn({ override: pluginRoot, env });
    push(
      "1",
      "plugin resolved (AC-3.2)",
      resolution.ok ? "pass" : "fail",
      resolution.ok ? `${resolution.root}  [via ${resolution.source}]` : resolution.reason
    );
    if (resolution.ok) pluginRootResolved = resolution.root;
    else chainAlive = false;
  } else {
    skip("1", "plugin resolved (AC-3.2)", chainSkipReason);
  }

  if (chainAlive) {
    const read = readVersionFn(pluginRootResolved);
    push("2", "plugin manifest readable", read.ok ? "pass" : "fail", read.ok ? read.manifestPath : read.reason);
    if (read.ok) pluginVersionResolved = read.version;
    else chainAlive = false;
  } else {
    skip("2", "plugin manifest readable", `skipped — an earlier rung did not pass`);
  }

  if (chainAlive) {
    const compat = checkCompat(engineCompat, pluginVersionResolved);
    push(
      "3",
      "version handshake (C-10)",
      compat.ok ? "pass" : "fail",
      compat.ok
        ? `plugin ${compat.pluginVersion} satisfies engine range ${compat.range}`
        : compat.reason
    );
    if (!compat.ok) chainAlive = false;
  } else {
    skip("3", "version handshake (C-10)", `skipped — an earlier rung did not pass`);
  }

  if (chainAlive) {
    const r4 = evalRung4({ pluginRoot: pluginRootResolved, dispatchableSkills, loadSkillFn, listInstalledSkillsFn });
    push("4", "dispatchable skills readable (AC-3.5)", r4.ok ? "pass" : "fail", r4.detail);
    if (!r4.ok) chainAlive = false;
  } else {
    push("4", "dispatchable skills readable (AC-3.5)", "skipped", `skipped — an earlier rung did not pass`);
  }

  if (chainAlive) {
    const probe = probeGuardInterpreter({ runProbe });
    if (probe.interpreter) {
      push(
        "4a",
        "guard executable (C-11, BR-GUARD-6)",
        "pass",
        `tried ${renderAttempts(probe.attempts)} — using ${probe.interpreter}`
      );
    } else {
      push(
        "4a",
        "guard executable (C-11, BR-GUARD-6)",
        "fail",
        `no interpreter could run the guard script: tried ${renderAttempts(probe.attempts)}. ` +
          `Install one of ${GUARD_INTERPRETERS.join(", ")} and re-run.`
      );
      chainAlive = false;
    }
  } else {
    push("4a", "guard executable (C-11, BR-GUARD-6)", "skipped", `skipped — an earlier rung did not pass`);
  }

  // ── rung 5: billing posture & guard capability — gated by rung 0 alone ──
  const evidence = readLoginEvidenceFn({ home, fs });
  const posture = resolveAuthPostureFn({ env, evidence, allowApiKeyBilling });
  const guardCheck = pluginRootResolved
    ? checkGuardCarrierFn({ pluginRoot: pluginRootResolved, probeFn: guardProbeFn })
    : { ok: true, reason: null };

  if (r0.ok) {
    const authDetail = `auth catalogue ${posture.catalogueId} (row ${posture.row})${
      posture.refuses ? " refuses to dispatch" : ""
    }`;
    const rung5Ok = !posture.refuses && guardCheck.ok;
    const detail5 = guardCheck.ok ? authDetail : `${authDetail}; ${guardCheck.reason}`;
    push("5", "billing posture & guard capability", rung5Ok ? "pass" : "fail", detail5);
  } else {
    skip("5", "billing posture & guard capability", chainSkipReason);
  }

  // ── AC-2.1's three doctor facts, always populated (independent of the
  //    ladder's own pass/fail so a refusal still leaves them readable) ─────
  const versions = { engine: engineVersion, plugin: pluginVersionResolved };
  const baseUrl = (env && env.ANTHROPIC_BASE_URL) || null;
  const auth = { row: posture.row, catalogueId: posture.catalogueId };

  const banner = buildBanner({
    engineVersion,
    pluginVersion: pluginVersionResolved,
    pluginRoot: pluginRootResolved,
    pluginCompat: engineCompat,
    auth,
    baseUrl,
    permissionMode,
  });

  const failed = rungs.filter((r) => r.state === "fail");
  const dryRunExcused = dryRun && failed.length > 0 && failed.every((r) => r.rung === "5");
  const ok = failed.length === 0 || dryRunExcused;

  return {
    ok,
    rungs,
    banner,
    pluginRoot: pluginRootResolved,
    pluginVersion: pluginVersionResolved,
    versions,
    baseUrl,
    auth,
    reason: ok ? null : failed.map((r) => `rung ${r.rung} (${r.name}): ${r.detail}`).join("\n"),
  };
}

/** Render `runStartupChecks`'s result as the operator-facing startup output. */
export function formatStartup(result, { withChecks = false } = {}) {
  const lines = [...result.banner];
  if (withChecks) {
    lines.push("");
    for (const r of result.rungs) {
      lines.push(`${r.state === "pass" ? "PASS" : r.state === "fail" ? "FAIL" : "SKIP"}  rung ${r.rung}  ${r.name}`);
      if (r.detail) lines.push(`      ${r.detail}`);
    }
  }
  return lines;
}
