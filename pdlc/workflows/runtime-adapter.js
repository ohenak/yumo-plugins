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

// An agent's final message is not a faithful transport for a large file: a
// measured run returned 102,429 bytes of a 209,953-byte document, starting
// mid-document, and a sibling read prepended a ```bash fence. Neither loss is
// detectable in the reply itself, and orchestrate-dev's completeness gate reads
// the result as a structurally incomplete document and re-authors it. So the
// read is chunked, every chunk is size-verified against the bytes it asked for,
// and anything that cannot be verified throws rather than returning garbage.
//
// The binding limit is NOT the ~100 KB body truncation above — it is the IO
// agent's max output tokens: a live chunk agent's Bash tool returned 18,140
// base64 chars intact, but its final message carried only 9,885 (≈4096 tokens
// at base64's ~2.4 chars/token). 6000 source bytes is 8,000 base64 chars,
// ~3.3k tokens — under that cap with margin for the reply's framing.
const RT_READ_CHUNK = 6000;
// Per chunk, beyond the first attempt. A truncated or fenced reply is a
// transport fault, not a property of the file, so a retry is worth taking.
const RT_READ_RETRIES = 2;

const RT_BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;
const RT_B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
// The runtime has no Buffer, no atob and no TextDecoder (probed 2026-07-27), so
// the decoders below are hand-rolled and dependency-free.
const RT_B64_INDEX = (function () {
  const map = {};
  for (let i = 0; i < RT_B64_ALPHABET.length; i++) map[RT_B64_ALPHABET.charAt(i)] = i;
  return map;
})();

/** base64 text → array of byte values. Throws on anything not decodable. */
function rtBase64Decode(text) {
  if (typeof text !== "string" || !RT_BASE64_RE.test(text)) {
    throw new Error("rtBase64Decode: input is not base64");
  }
  if (text.length % 4 !== 0) {
    throw new Error("rtBase64Decode: length is not a multiple of 4");
  }
  const pad = text.slice(-2) === "==" ? 2 : text.slice(-1) === "=" ? 1 : 0;
  const bytes = [];
  for (let i = 0; i < text.length; i += 4) {
    const c0 = RT_B64_INDEX[text.charAt(i)];
    const c1 = RT_B64_INDEX[text.charAt(i + 1)];
    const c2 = RT_B64_INDEX[text.charAt(i + 2)];
    const c3 = RT_B64_INDEX[text.charAt(i + 3)];
    if (c0 === undefined || c1 === undefined) {
      throw new Error("rtBase64Decode: misplaced padding");
    }
    const n = (c0 << 18) | (c1 << 12) | ((c2 === undefined ? 0 : c2) << 6) | (c3 === undefined ? 0 : c3);
    const last = i + 4 >= text.length;
    bytes.push((n >> 16) & 0xff);
    if (!last || pad < 2) bytes.push((n >> 8) & 0xff);
    if (!last || pad < 1) bytes.push(n & 0xff);
  }
  return bytes;
}

/** UTF-8 byte values → string. Handles 1–4-byte sequences, astral via surrogates. */
function rtUtf8Decode(bytes) {
  let out = "";
  let units = [];
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    let cp;
    let len;
    if (b0 < 0x80) {
      cp = b0;
      len = 1;
    } else if ((b0 & 0xe0) === 0xc0) {
      cp = b0 & 0x1f;
      len = 2;
    } else if ((b0 & 0xf0) === 0xe0) {
      cp = b0 & 0x0f;
      len = 3;
    } else if ((b0 & 0xf8) === 0xf0) {
      cp = b0 & 0x07;
      len = 4;
    } else {
      throw new Error(`rtUtf8Decode: invalid leading byte 0x${b0.toString(16)} at ${i}`);
    }
    if (i + len > bytes.length) throw new Error(`rtUtf8Decode: truncated sequence at ${i}`);
    for (let k = 1; k < len; k++) {
      const b = bytes[i + k];
      if ((b & 0xc0) !== 0x80) throw new Error(`rtUtf8Decode: invalid continuation byte at ${i + k}`);
      cp = (cp << 6) | (b & 0x3f);
    }
    i += len;
    if (cp > 0xffff) {
      const rest = cp - 0x10000;
      units.push(0xd800 + (rest >> 10), 0xdc00 + (rest & 0x3ff));
    } else {
      units.push(cp);
    }
    // Flushed in slices: String.fromCharCode.apply over a whole document's
    // worth of code units risks an argument-count limit.
    if (units.length >= 4096) {
      out += String.fromCharCode.apply(null, units);
      units = [];
    }
  }
  if (units.length) out += String.fromCharCode.apply(null, units);
  return out;
}

/** Byte ranges covering [0, size). Empty for size 0; no empty trailing range. */
function rtChunkPlan(size, chunkSize) {
  const plan = [];
  for (let offset = 0; offset < size; offset += chunkSize) {
    plan.push({ offset, count: Math.min(chunkSize, size - offset) });
  }
  return plan;
}

/**
 * One byte range, re-requested until it decodes to exactly `count` bytes.
 *
 * Returns the verified base64 STRING, not the decoded byte array: this value
 * crosses the host↔VM boundary through `RT.parallel`, and the runtime caps a
 * marshalled array at 4,096 elements (a live run failed every 6,000-byte chunk
 * with "array length 6000 exceeds the maximum of 4096 supported across the
 * workflow VM boundary"). A string is not length-capped; the caller decodes.
 */
async function rtReadChunk(path, chunk, index) {
  for (let attempt = 0; attempt <= RT_READ_RETRIES; attempt++) {
    const reply = await RT.agent(
      `Run this exact command from the repository root and report its output:\n` +
        `  tail -c +${chunk.offset + 1} "${path}" | head -c ${chunk.count} | base64\n` +
        `Return ONLY the base64 text the command printed — no commentary, no summary, ` +
        `no code fences, no leading or trailing prose. Line breaks inside the base64 are fine.`,
      { label: `read:${path}#${index}`, model: RT_IO_MODEL }
    );
    const compact = typeof reply === "string" ? reply.replace(/\s+/g, "") : "";
    if (!RT_BASE64_RE.test(compact)) continue;
    let bytes;
    try {
      bytes = rtBase64Decode(compact);
    } catch {
      continue;
    }
    // The size check is what makes a truncated reply visible: base64 of a short
    // read is still valid base64.
    if (bytes.length !== chunk.count) continue;
    return compact;
  }
  throw new Error(
    `rtReadFile: chunk ${index} of "${path}" (offset ${chunk.offset}, ${chunk.count} bytes) ` +
      `could not be read verifiably after ${RT_READ_RETRIES + 1} attempts`
  );
}

/**
 * Read a file through agents, in verified chunks. Returns null when absent, and
 * throws rather than returning bytes that differ from the file on disk.
 */
async function rtReadFile(path) {
  const sizeReply = await RT.agent(
    `Run this exact command from the repository root and report its output:\n` +
      `  if [ ! -f "${path}" ] || [ ! -r "${path}" ]; then echo ${RT_MISSING}; else wc -c < "${path}"; fi\n` +
      `Return ONLY that token or that number — no commentary, no code fences, no units.`,
    { label: `size:${path}`, model: RT_IO_MODEL }
  );
  const sizeText = typeof sizeReply === "string" ? sizeReply.replace(/\s+/g, "") : "";
  if (sizeText === "" || sizeText.indexOf(RT_MISSING) !== -1) return null;
  if (!/^[0-9]+$/.test(sizeText)) {
    throw new Error(`rtReadFile: unparseable size reply for "${path}": ${String(sizeReply).slice(0, 80)}`);
  }
  const size = Number(sizeText);
  if (size === 0) return "";

  const plan = rtChunkPlan(size, RT_READ_CHUNK);
  // The HOST `parallel` takes thunks, not started promises (that is rtParallel's
  // contract, not this one), and resolves a thrown thunk to null — hence the
  // explicit null check below rather than a rejection propagating on its own.
  const chunks = await RT.parallel(plan.map((chunk, i) => () => rtReadChunk(path, chunk, i)));
  const bytes = [];
  for (let i = 0; i < plan.length; i++) {
    // Each part is the chunk's verified base64 string (see rtReadChunk); the
    // decode happens on THIS side of the VM boundary. Verified there, verified
    // again here — the string could not survive the boundary corrupted silently.
    const part = chunks && chunks[i];
    let partBytes = null;
    if (typeof part === "string") {
      try {
        partBytes = rtBase64Decode(part);
      } catch {
        partBytes = null;
      }
    }
    if (!partBytes || partBytes.length !== plan[i].count) {
      throw new Error(`rtReadFile: chunk ${i} of "${path}" did not return its ${plan[i].count} bytes`);
    }
    for (let k = 0; k < partBytes.length; k++) bytes.push(partBytes[k]);
  }
  if (bytes.length !== size) {
    throw new Error(`rtReadFile: "${path}" reassembled to ${bytes.length} bytes, expected ${size}`);
  }
  return rtUtf8Decode(bytes);
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
