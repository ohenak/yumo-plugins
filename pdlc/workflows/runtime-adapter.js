/**
 * runtime-adapter.js — bridges the PDLC workflow modules to the Claude Code
 * workflow runtime.
 *
 * This file is NOT an ES module and is never imported. `build-runtime.mjs`
 * inlines it verbatim at the top level of a generated bundle, above the
 * IIFE-wrapped module bodies.
 *
 * Why it exists
 * -------------
 * orchestrate-dev.js / orchestrate-queue.js are written as testable ES modules:
 * static imports, named exports, sync `fs` and `child_process` defaults. The
 * workflow runtime accepts none of that — probed 2026-07-27, the sandbox has
 * NO `import` (static or dynamic), no `process`, no `fs`, no `fetch`; the only
 * host globals are: agent, parallel, pipeline, phase, log, workflow, args,
 * budget, console, setTimeout, clearTimeout.
 *
 * So every capability the modules take from Node is re-expressed here in terms
 * of `agent()`:
 *   - file read / write / existence  → an agent with Read/Write tools
 *   - `gh` and `git` invocations     → an agent with Bash
 * The modules already expose these as injection points (_readFile, _writeFile,
 * _checkFile, _checkCi, _mergeWorktree, _agent, _parallel, _pipeline, _log,
 * _phase), so the bundle passes adapters in rather than patching module bodies.
 *
 * Signature mismatch handled here: the modules call `agent(skill, prompt, opts)`;
 * the runtime's global is `agent(prompt, opts)`. rtAgent() maps one to the other
 * and turns the skill name into an explicit Skill-tool instruction.
 */

// Host globals, captured before any module-scope shadowing.
const RT = {
  agent,
  parallel,
  pipeline,
  phase,
  log,
};

// Model for the mechanical IO agents (file reads/writes, git/gh status reads).
// Deliberately the cheapest rung: these calls do no reasoning.
const RT_IO_MODEL = "haiku";

const RT_MISSING = "__PDLC_FILE_MISSING__";

/** Wrap a pdlc skill invocation into a single runtime agent prompt. */
function rtSkillPrompt(skill, prompt) {
  return (
    `You are the "${skill}" agent in the PDLC pipeline.\n` +
    `Before doing anything else, invoke the Skill tool with skill "pdlc:${skill}" ` +
    `and follow its instructions exactly for the task below.\n\n` +
    `Task:\n${prompt}`
  );
}

/** (skill, prompt, opts) → runtime agent(prompt, opts). */
async function rtAgent(skill, prompt, opts = {}) {
  const { model, label, ...rest } = opts || {};
  return await RT.agent(rtSkillPrompt(skill, prompt), {
    label: label || skill,
    ...(model ? { model } : {}),
    ...rest,
  });
}

/** The modules hand `parallel()` already-started promises, not thunks. */
async function rtParallel(promises) {
  return await Promise.all(promises);
}

/** The modules use `pipeline(label, fn)` as a labelled section, not a fan-out. */
async function rtPipeline(label, fn) {
  return await fn();
}

function rtPhase(label) {
  RT.phase(label);
}

function rtLog(message) {
  RT.log(String(message));
}

/** Read a file through an agent. Returns null when absent. */
async function rtReadFile(path) {
  const out = await RT.agent(
    `Read the file at "${path}", relative to the repository root.\n` +
      `Return ONLY its exact, complete contents as your final message: no commentary, ` +
      `no summary, no markdown code fences, no leading or trailing blank lines you add yourself.\n` +
      `If the file does not exist or cannot be read, return exactly: ${RT_MISSING}`,
    { label: `read:${path}`, model: RT_IO_MODEL }
  );
  if (typeof out !== "string") return null;
  if (out.trim() === RT_MISSING) return null;
  return out;
}

/** Write a file through an agent, verbatim. */
async function rtWriteFile(path, contents) {
  await RT.agent(
    `Write the following content to "${path}", relative to the repository root, ` +
      `replacing the file's current contents exactly. Do not reformat, re-wrap, ` +
      `summarise, or add anything. Reply with "ok" when written.\n\n` +
      `<<<PDLC_CONTENT_BEGIN\n${contents}\nPDLC_CONTENT_END`,
    { label: `write:${path}`, model: RT_IO_MODEL }
  );
}

/**
 * Existence/non-empty gate. Mirrors checkFileNonEmpty's contract:
 * { ok: true } | { ok: false, reason: "file_missing" | "file_empty" }
 */
async function rtCheckFile(path) {
  if (!path || (typeof path === "string" && path.trim() === "")) {
    return { ok: false, reason: "file_missing" };
  }
  const out = await RT.agent(
    `Run this exact command from the repository root and report the result:\n` +
      `  test -f "${path}" && test -s "${path}" && echo OK || { test -f "${path}" && echo EMPTY || echo MISSING; }\n` +
      `Return ONLY one word: OK, EMPTY, or MISSING.`,
    { label: `check:${path}`, model: RT_IO_MODEL }
  );
  const verdict = String(out || "").trim().toUpperCase();
  if (verdict.includes("OK")) return { ok: true };
  if (verdict.includes("EMPTY")) return { ok: false, reason: "file_empty" };
  return { ok: false, reason: "file_missing" };
}

/**
 * CI status for a PR. The agent only fetches raw `gh` JSON; classification
 * reuses the module's own tested checkPrCi() via a sync execFn closure, so the
 * none/pending/passed/failed/unknown mapping stays in one place.
 */
function rtMakeCheckCi(devModule) {
  return async function rtCheckCi(prUrl) {
    const raw = await RT.agent(
      `Run exactly: gh pr view ${prUrl} --json statusCheckRollup\n` +
        `Return ONLY the raw JSON it prints — no commentary, no code fences.\n` +
        `If the command fails, return exactly: ${RT_MISSING}`,
      { label: `ci:${prUrl}`, model: RT_IO_MODEL }
    );
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!text || text === RT_MISSING) return "unknown";
    return await devModule.checkPrCi(prUrl, { execFn: () => text });
  };
}

/**
 * Append to a file through an agent (TSPEC §3.3). Append-shaped by construction:
 * the prompt forbids reading, rewriting or reformatting the existing bytes, so
 * this is deliberately NOT `rtWriteFile(path, existing + text)` — a
 * read-modify-write would re-emit the reviewer's prose and any divergence would
 * silently rewrite a cross-review file.
 */
async function rtAppendFile(path, text) {
  await RT.agent(
    `APPEND the following content to the END of "${path}", relative to the repository root.\n` +
      `Do not read, rewrite, reformat, re-wrap, summarise, or alter any existing content — ` +
      `the file's current bytes must be preserved exactly, byte for byte, and the content below ` +
      `must be added after them verbatim. If the file does not exist, create it containing ` +
      `exactly the content below. Reply with "ok" when appended.\n\n` +
      `<<<PDLC_CONTENT_BEGIN\n${text}\nPDLC_CONTENT_END`,
    { label: `append:${path}`, model: RT_IO_MODEL }
  );
}

// TSPEC §3.2 / FSPEC §3.5 — rtListFiles's closed reply vocabulary. One sentinel
// per ListFailure the shell can observe; `bad_argument` is decided here, before
// calling out, exactly as rtCheckFile does for an empty path.
const RT_LIST_SENTINELS = {
  __PDLC_DIR_MISSING__: "dir_missing",
  __PDLC_NOT_A_DIRECTORY__: "not_a_directory",
  __PDLC_UNREADABLE__: "unreadable",
};

/**
 * Non-recursive listing of the regular files in `dirPath` (TSPEC §3.2).
 * Returns { ok: true, files } | { ok: false, reason } over LIST_FAILURES —
 * never throws, and an unrecognised reply maps to "unreadable" (a halt), never
 * to an empty list: "there are no cross-reviews" and "I could not find out"
 * must not collapse into the same value.
 */
async function rtListFiles(dirPath) {
  if (!dirPath || typeof dirPath !== "string" || dirPath.trim() === "") {
    return { ok: false, reason: "bad_argument" };
  }
  const d = dirPath;
  const out = await RT.agent(
    `Run this exact command from the repository root and report its output:\n` +
      `  if [ ! -e "${d}" ]; then echo __PDLC_DIR_MISSING__; ` +
      `elif [ ! -d "${d}" ]; then echo __PDLC_NOT_A_DIRECTORY__; ` +
      `elif [ ! -r "${d}" ] || [ ! -x "${d}" ]; then echo __PDLC_UNREADABLE__; ` +
      `else ls -p -A "${d}" | grep -v '/$'; true; fi\n` +
      `Return ONLY the command's exact output: one file name per line, no commentary, ` +
      `no code fences, no bullets, no path prefixes. If the command printed one of the ` +
      `sentinel tokens, return ONLY that token. If it printed nothing at all, return nothing at all.`,
    { label: `list:${d}`, model: RT_IO_MODEL }
  );
  const text = typeof out === "string" ? out.trim() : null;
  if (text === null) return { ok: false, reason: "unreadable" };
  if (text === "") return { ok: true, files: [] };
  if (RT_LIST_SENTINELS[text]) return { ok: false, reason: RT_LIST_SENTINELS[text] };

  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l !== "");
  // A basename has no separator and no whitespace. Anything else is prose the
  // prompt did not permit, and prose is "I could not find out".
  if (!lines.every((l) => !/[\/\s]/.test(l) && !RT_LIST_SENTINELS[l])) {
    return { ok: false, reason: "unreadable" };
  }
  return { ok: true, files: lines };
}

/**
 * Transport seam for git (TSPEC §3.4). `argv` excludes the leading "git".
 * Returns { ok, stdout, stderr } and never throws; the caller interprets.
 * Modelled on rtMergeWorktree's fixed-command + exact-JSON-reply discipline.
 */
async function rtGit(argv) {
  const args = Array.isArray(argv) ? argv : [];
  const out = await RT.agent(
    `Run exactly this command from the repository root, and nothing else:\n` +
      `  git ${args.join(" ")}\n` +
      `If it exits 0, return exactly: {"ok":true,"stdout":"<its stdout>","stderr":""}\n` +
      `If it exits non-zero, return exactly: {"ok":false,"stdout":"","stderr":"<its stderr>"}\n` +
      `Return ONLY that JSON object, correctly escaped — no commentary, no code fences. ` +
      `Do not retry, do not repair, and do not run any other command.`,
    { label: `git:${args[0] || ""}`, model: RT_IO_MODEL }
  );
  try {
    const parsed = JSON.parse(String(out).trim());
    return {
      ok: parsed && parsed.ok === true,
      stdout: typeof (parsed && parsed.stdout) === "string" ? parsed.stdout : "",
      stderr: typeof (parsed && parsed.stderr) === "string" ? parsed.stderr : "",
    };
  } catch {
    return { ok: false, stdout: "", stderr: "unparseable adapter response" };
  }
}

/**
 * Merge a worktree branch. Contract mirrors mergeWorktree():
 * { ok: true } | { ok: false, conflictingFiles: string[] }
 */
async function rtMergeWorktree(repoPath, worktreeBranch, targetBranch) {
  const out = await RT.agent(
    `In the repository at "${repoPath}", the current branch is "${targetBranch}".\n` +
      `Run: git merge --no-ff ${worktreeBranch}\n` +
      `If it succeeds, return exactly: {"ok":true}\n` +
      `If it conflicts, capture the conflicting files with ` +
      `\`git diff --name-only --diff-filter=U\`, then run \`git merge --abort\`, and return ` +
      `exactly: {"ok":false,"conflictingFiles":["path/one","path/two"]}\n` +
      `Return ONLY that JSON object — no commentary, no code fences. Do not resolve conflicts yourself.`,
    { label: `merge:${worktreeBranch}`, model: RT_IO_MODEL }
  );
  try {
    const parsed = JSON.parse(String(out).trim());
    if (parsed && parsed.ok === true) return { ok: true };
    return {
      ok: false,
      conflictingFiles: Array.isArray(parsed && parsed.conflictingFiles)
        ? parsed.conflictingFiles
        : [],
    };
  } catch {
    return { ok: false, conflictingFiles: [] };
  }
}

/** Injection bundle handed to orchestrate-dev's main(). */
function rtDevInjections(devModule) {
  return {
    _agent: rtAgent,
    _parallel: rtParallel,
    _pipeline: rtPipeline,
    _phase: rtPhase,
    _log: rtLog,
    _checkFile: rtCheckFile,
    _readFile: rtReadFile,
    _checkCi: rtMakeCheckCi(devModule),
    _mergeWorktree: rtMergeWorktree,
    // TSPEC §3.10. `_writeFile`'s adapter existed since the first bundle but was
    // never in this object; the other three are new with RLH-32.
    _writeFile: rtWriteFile,
    _appendFile: rtAppendFile,
    _listFiles: rtListFiles,
    _git: rtGit,
    // `_recordHalt` is deliberately ABSENT: its implementation differs by caller,
    // which a caller-independent adapter bundle cannot express. It is supplied
    // per entrypoint by build-runtime.mjs (§3.10, §7.2 edit 2b).
  };
}
