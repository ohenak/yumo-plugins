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

// An agent's final message is not a faithful transport for a large file — and
// not only by TRUNCATION. Measured failures, in order of discovery:
//   1. a single-agent echo returned 102,429 bytes of a 209,953-byte document;
//   2. a chunk agent's final message carried 9,885 of 18,140 base64 chars
//      (≈4096-token output cap);
//   3. the VM boundary rejected 6,000-element byte arrays (max 4,096);
//   4. base64 replies of EXACTLY the right length diverged from the file
//      mid-stream — the IO model cannot transcribe 8,000 chars of base64, and
//      in 25 measured replies 23 were corrupted, one of them length-correct
//      (run wf_20fb1a29-246 / wf_a985bc0f-d18, 2026-08-01).
//
// Failure 4 is the binding one: a length check cannot catch same-length
// corruption. So the transport is now (a) PROSE, which a model copies far more
// faithfully than base64's structureless entropy, (b) chunked on LINE
// boundaries so no UTF-8 sequence is ever split, and (c) verified per chunk
// against a SHA-256 the agent's OWN TOOL computed over the same byte range —
// the model cannot hand-compute a digest of its mangled copy, so a mismatch is
// detected and retried, and an exhausted retry throws rather than serving
// garbage. The reassembled file is verified once more against the whole-file
// digest from the size probe.
//
// Target bytes per chunk. ~6,000 bytes of markdown is ≲2,500 output tokens —
// under the ≈4,096-token final-message cap with margin for the framing.
const RT_READ_CHUNK = 6000;
// Per chunk, beyond the first attempt. A mangled or truncated reply is a
// transport fault, not a property of the file, so retries are worth taking.
// Prose transcription fails far less often than base64's measured 23/25, but
// it is still a model output: four attempts bound the tail.
const RT_READ_RETRIES = 3;

const RT_HEX64_RE = /\b[0-9a-f]{64}\b/;
const RT_CHUNK_BEGIN = "__PDLC_CHUNK_BEGIN__";
const RT_CHUNK_END = "__PDLC_CHUNK_END__";
// Appended by the CHUNK COMMAND itself (not by the model), so the payload's
// final bytes — including trailing blank lines, which a model collapses when
// they sit against a sentinel it writes — are interior to tool output the
// model copies verbatim. Live failure: a chunk whose last line was blank
// failed all 4 attempts with byte-perfect payloads short one newline
// (run wf_c6751860-d4a).
const RT_CHUNK_EOF = "__PDLC_CHUNK_EOF__";
// Same reasoning at the payload's FRONT: a chunk whose first line is blank
// loses it against the model-written BEGIN sentinel (run wf_a5b4ad68-885,
// lines 113-168: one attempt was byte-perfect except that leading newline).
const RT_CHUNK_BOF = "__PDLC_CHUNK_BOF__";
// Attempts beyond this index escalate from RT_IO_MODEL to RT_IO_MODEL_HARD:
// haiku deterministically REFORMATS some content instead of copying it (the
// same run returned a markdown table as parsed JSON on all 4 attempts), so
// no number of same-model retries converges on those chunks.
const RT_READ_ESCALATE_AFTER = 2;
const RT_IO_MODEL_HARD = "sonnet";
// Both platforms' hashers, first one wins: macOS ships `shasum`, minimal Linux
// images ship `sha256sum`. Output of both starts with the 64-hex digest.
const RT_SHA_CMD = '{ shasum -a 256 2>/dev/null || sha256sum; } | head -1';

/** string → UTF-8 byte values. Astral pairs via surrogates; lone surrogates throw. */
function rtUtf8Encode(text) {
  const out = [];
  for (let i = 0; i < text.length; i++) {
    let cp = text.charCodeAt(i);
    if (cp >= 0xd800 && cp <= 0xdbff) {
      const lo = text.charCodeAt(i + 1);
      if (!(lo >= 0xdc00 && lo <= 0xdfff)) throw new Error(`rtUtf8Encode: lone surrogate at ${i}`);
      cp = 0x10000 + ((cp - 0xd800) << 10) + (lo - 0xdc00);
      i++;
    } else if (cp >= 0xdc00 && cp <= 0xdfff) {
      throw new Error(`rtUtf8Encode: lone surrogate at ${i}`);
    }
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
  }
  return out;
}

/** FIPS 180-4 round constants. */
const RT_SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rtRotr32(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * SHA-256 of a byte array, as 64 lowercase hex chars. Distinct from the
 * module-scope `sha256Hex`, which the bundle's IIFEs enclose out of reach and
 * which canonicalises its input — this one digests the EXACT bytes, because
 * its whole job is comparing them to what `shasum` saw on disk. `Math`, `>>>`
 * and `|` only: the runtime has no `crypto`, `BigInt` or `TextEncoder`.
 */
function rtSha256Hex(bytes) {
  const bitLenHi = Math.floor((bytes.length * 8) / 4294967296) >>> 0;
  const bitLenLo = (bytes.length * 8) % 4294967296 >>> 0;
  const padded = bytes.slice();
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  padded.push(
    (bitLenHi >>> 24) & 0xff, (bitLenHi >>> 16) & 0xff, (bitLenHi >>> 8) & 0xff, bitLenHi & 0xff,
    (bitLenLo >>> 24) & 0xff, (bitLenLo >>> 16) & 0xff, (bitLenLo >>> 8) & 0xff, bitLenLo & 0xff
  );
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Array(64);
  for (let block = 0; block < padded.length; block += 64) {
    for (let t = 0; t < 16; t++) {
      const o = block + t * 4;
      w[t] = ((padded[o] << 24) | (padded[o + 1] << 16) | (padded[o + 2] << 8) | padded[o + 3]) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = (rtRotr32(w[t - 15], 7) ^ rtRotr32(w[t - 15], 18) ^ (w[t - 15] >>> 3)) >>> 0;
      const s1 = (rtRotr32(w[t - 2], 17) ^ rtRotr32(w[t - 2], 19) ^ (w[t - 2] >>> 10)) >>> 0;
      w[t] = (((w[t - 16] + s0) >>> 0) + ((w[t - 7] + s1) >>> 0)) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const S1 = (rtRotr32(e, 6) ^ rtRotr32(e, 11) ^ rtRotr32(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (((((h + S1) >>> 0) + ch) >>> 0) + ((RT_SHA256_K[t] + w[t]) >>> 0)) >>> 0;
      const S0 = (rtRotr32(a, 2) ^ rtRotr32(a, 13) ^ rtRotr32(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  let hex = "";
  for (const word of [h0, h1, h2, h3, h4, h5, h6, h7]) {
    hex += ("0000000" + (word >>> 0).toString(16)).slice(-8);
  }
  return hex;
}

/**
 * 1-based inclusive line ranges covering [1, totalLines], at most `perChunk`
 * lines each. Empty for totalLines 0; no empty trailing range.
 */
function rtLinePlan(totalLines, perChunk) {
  const plan = [];
  for (let first = 1; first <= totalLines; first += perChunk) {
    plan.push({ first, last: Math.min(first + perChunk - 1, totalLines) });
  }
  return plan;
}

/**
 * One line range, re-requested until the transcribed text matches the SHA-256
 * the agent's own tool computed over the same range. Returns the verified
 * chunk TEXT (a string — the VM boundary caps marshalled arrays at 4,096
 * elements, so byte arrays must never cross it). The payload is terminated
 * by a tool-printed EOF marker (see RT_CHUNK_EOF) so its exact trailing
 * bytes survive the model's copy; the digest arbitrates everything else.
 */
async function rtReadChunk(path, range, index) {
  for (let attempt = 0; attempt <= RT_READ_RETRIES; attempt++) {
    const model = attempt < RT_READ_ESCALATE_AFTER ? RT_IO_MODEL : RT_IO_MODEL_HARD;
    let reply;
    try {
      reply = await RT.agent(
        `Run these two exact commands from the repository root:\n` +
          `  sed -n '${range.first},${range.last}p' "${path}" | ${RT_SHA_CMD}\n` +
          `  { printf '${RT_CHUNK_BOF}\\n'; sed -n '${range.first},${range.last}p' "${path}"; printf '${RT_CHUNK_EOF}\\n'; }\n` +
          `Reply with the first command's 64-hex digest, then the second command's ` +
          `output copied EXACTLY, character for character, from the ${RT_CHUNK_BOF} line ` +
          `through the ${RT_CHUNK_EOF} line. This is a byte transport, not a writing ` +
          `task: preserve every blank line and every space, never summarise, never ` +
          `convert tables or lists to JSON or any other shape, never fix typos, never ` +
          `add code fences.\n` +
          `Reply shape:\n` +
          `SHA256: {digest}\n` +
          `{the second command's output}`,
        { label: `read:${path}#${index}`, model }
      );
    } catch {
      // An agent that dies (API error, tool-reference fault) is a failed
      // ATTEMPT, not a failed read — observed live as a 400 killing the thunk
      // and with it the whole file read (run wf_c6751860-d4a).
      continue;
    }
    if (typeof reply !== "string") continue;
    const bofAt = reply.indexOf(RT_CHUNK_BOF);
    if (bofAt === -1) continue;
    const shaMatch = RT_HEX64_RE.exec(reply.slice(0, bofAt));
    if (!shaMatch) continue;
    const sha = shaMatch[0];
    const afterBof = reply.indexOf("\n", bofAt);
    if (afterBof === -1) continue;
    const eofAt = reply.lastIndexOf(RT_CHUNK_EOF);
    if (eofAt === -1 || eofAt <= afterBof) continue;
    // Everything between the tool-printed BOF and EOF marker lines is the
    // payload, byte for byte — both boundaries come from tool output, so
    // blank lines at either edge are interior text the model preserves. When
    // the range's final line has no trailing newline (GNU sed on the file's
    // last line), the EOF marker abuts the payload — which is exactly why no
    // newline may be stripped or added here. The digest still gets the last
    // word; the two fallbacks only give a model that nudged a marker onto its
    // own line a chance to verify.
    const payload = reply.slice(afterBof + 1, eofAt);
    const candidates = [payload];
    if (payload.slice(-1) === "\n") candidates.push(payload.slice(0, -1));
    candidates.push(payload + "\n");
    for (const candidate of candidates) {
      let ok = false;
      try {
        ok = rtSha256Hex(rtUtf8Encode(candidate)) === sha;
      } catch {
        ok = false;
      }
      if (ok) return candidate;
    }
  }
  throw new Error(
    `rtReadFile: chunk ${index} of "${path}" (lines ${range.first}-${range.last}) ` +
      `could not be transcribed verifiably after ${RT_READ_RETRIES + 1} attempts`
  );
}

/**
 * Read a file through agents, in line-ranged, SHA-verified chunks. Returns
 * null when absent, "" when empty, and throws rather than returning bytes
 * that differ from the file on disk.
 *
 * Known limit: a file whose single LINE exceeds the IO agent's output budget
 * cannot be chunked below one line, so it fails loudly after retries. Every
 * artifact this pipeline reads is line-structured markdown.
 */
async function rtReadFile(path) {
  // Probe: size, newline count, whether the last byte is a newline, whole-file
  // digest. Four short values — the transcription-hostile payload never rides
  // in this reply, and the digest anchors the reassembly check below.
  let size = null, newlines = null, endsWithNewline = null, fileSha = null;
  for (let attempt = 0; attempt <= RT_READ_RETRIES; attempt++) {
    let reply;
    try {
      reply = await RT.agent(
        `Run this exact command from the repository root and report its output:\n` +
          `  if [ ! -f "${path}" ] || [ ! -r "${path}" ]; then echo ${RT_MISSING}; ` +
          `else wc -c < "${path}"; wc -l < "${path}"; tail -c 1 "${path}" | wc -l; ` +
          `{ shasum -a 256 "${path}" 2>/dev/null || sha256sum "${path}"; } | head -1; fi\n` +
          `Return ONLY that token, or the three numbers and the digest line, in order — ` +
          `no commentary, no code fences, no units.`,
        { label: `size:${path}`, model: RT_IO_MODEL }
      );
    } catch {
      continue; // a dead probe agent is a failed attempt, same as a dead chunk agent
    }
    const text = typeof reply === "string" ? reply : "";
    if (text.indexOf(RT_MISSING) !== -1) return null;
    const nums = text.match(/\d+/g) || [];
    const sha = RT_HEX64_RE.exec(text);
    if (nums.length >= 3 && Number(nums[0]) === 0) return "";
    if (nums.length >= 3 && sha) {
      size = Number(nums[0]);
      newlines = Number(nums[1]);
      endsWithNewline = Number(nums[2]) === 1;
      fileSha = sha[0];
      break;
    }
  }
  if (size === null) {
    throw new Error(`rtReadFile: unparseable probe reply for "${path}" after ${RT_READ_RETRIES + 1} attempts`);
  }
  if (size === 0) return "";

  const displayLines = newlines + (endsWithNewline ? 0 : 1);
  const chunkCount = Math.max(1, Math.ceil(size / RT_READ_CHUNK));
  const perChunk = Math.max(1, Math.ceil(displayLines / chunkCount));
  const plan = rtLinePlan(displayLines, perChunk);
  // The HOST `parallel` takes thunks, not started promises (that is rtParallel's
  // contract, not this one), and resolves a thrown thunk to null — hence the
  // explicit null check below rather than a rejection propagating on its own.
  const chunks = await RT.parallel(plan.map((range, i) => () => rtReadChunk(path, range, i)));
  let text = "";
  for (let i = 0; i < plan.length; i++) {
    const part = chunks && chunks[i];
    if (typeof part !== "string") {
      throw new Error(
        `rtReadFile: chunk ${i} of "${path}" (lines ${plan[i].first}-${plan[i].last}) did not verify`
      );
    }
    text += part;
  }
  // Whole-file check against the probe's digest. Each chunk verified alone;
  // this catches the residual cross-chunk case (a BSD sed newline appended to
  // a no-trailing-newline final chunk — see rtReadChunk's JSDoc).
  for (const candidate of text.slice(-1) === "\n" ? [text, text.slice(0, -1)] : [text]) {
    const bytes = rtUtf8Encode(candidate);
    if (bytes.length === size && rtSha256Hex(bytes) === fileSha) return candidate;
  }
  throw new Error(`rtReadFile: "${path}" reassembled but did not match the file's size and SHA-256`);
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
