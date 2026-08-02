export const meta = {
  name: "orchestrate-dev",
  description:
    "Full PDLC pipeline for one REQ — spec authoring, reviews, TDD implementation, DoD, harvest, PR.",
  whenToUse: "Run the pipeline for a single named REQ path.",
  // CR F-1 — the module's own meta.inputs is dead in this artifact (it stays
  // inside the __dev IIFE, where nothing reads it), so the operator's declared
  // channel is this copy. Keep it in step with orchestrate-dev.js's meta.inputs:
  // forcePhases' catalogue here is FORCE_PHASE_TOKENS + "all".
  inputs: [
    {
      name: "reqPath",
      description:
        "Path to the approved REQ document, e.g. docs/{feature}/REQ-{feature}.md",
      type: "string",
      required: true,
    },
    {
      name: "forcePhases",
      description:
        "Optional comma- or space-separated phases to re-run despite a recorded approval. Valid: R, F, T, P, D, PR, all.",
      type: "string",
      required: false,
    },
  ],
  phases: [
    { title: "Phase R", detail: "REQ review" },
    { title: "Phase F", detail: "FSPEC author + review" },
    { title: "Phase T", detail: "TSPEC author + review" },
    { title: "Phase D", detail: "PLAN author + review" },
    { title: "Phase P", detail: "PROPERTIES author + review" },
    { title: "Phase I", detail: "implementation batches (sonnet)" },
    { title: "Phase CR", detail: "final codebase review" },
    { title: "Phase DOD", detail: "definition-of-done verify + remediate" },
    { title: "Phase H", detail: "harvest learnings" },
    { title: "Phase PUB", detail: "raise PR + verify CI" },
  ],
};

// ⚠️  GENERATED FILE — DO NOT EDIT.
// Built by `node pdlc/workflows/build-runtime.mjs` from:
//   pdlc/workflows/orchestrate-dev.js
//   pdlc/workflows/orchestrate-queue.js
//   pdlc/workflows/runtime-adapter.js
// Edit those, then rebuild. See pdlc/workflows/build-runtime.mjs for why this
// bundle exists (the workflow runtime allows no imports, exports past meta, or fs).

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

// Invocation-scoped read cache (REQ-RTCACHE-01..05,
// docs/pdlc-adapter-read-cache/REQ-pdlc-adapter-read-cache.md §6).
//
// Ceiling on the bytes the cache may hold at once. REQ §6: the largest document
// this adapter has transported is 209,953 bytes, so 2 MiB is ≈9.9 such
// documents — comfortably more than one review round's working set (REQ + spec
// + two cross-reviews). Over the cap, the OLDEST-INSERTED entries are evicted;
// the read itself is never refused, and an entry larger than the cap alone is
// simply not cached. Eviction order is an insertion counter, not a clock: the
// runtime has no `Date.now()` and no `Math.random()` (REQ §6 NFR-01).
const RT_READ_CACHE_MAX_BYTES = 2097152;

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
// Bisection depth cap for ranges that cannot be transcribed at their planned
// width. The line plan assumes uniform density, but a run of kilobyte-scale
// single-line table rows can pack a planned range far past the output budget
// — live: a 53-line range carried 25,026 bytes, one line 8,004 chars, and
// every attempt truncated (run wf_4644344b-db9). 2^8 = 256 splits reaches
// single lines from any plan this file produces.
const RT_READ_MAX_DEPTH = 8;
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
  let sawTruncation = false;
  for (let attempt = 0; attempt <= RT_READ_RETRIES; attempt++) {
    const model = attempt < RT_READ_ESCALATE_AFTER ? RT_IO_MODEL : RT_IO_MODEL_HARD;
    // A truncation-shaped reply (BOF seen, EOF never arrives) means the range
    // exceeds the reply's output budget — same-model retries are doomed, so
    // spend at most one escalated attempt before handing back to the caller,
    // whose move is to SPLIT the range, not to retry it.
    if (sawTruncation && model === RT_IO_MODEL) continue;
    if (sawTruncation && attempt > RT_READ_ESCALATE_AFTER) break;
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
    if (eofAt === -1 || eofAt <= afterBof) {
      sawTruncation = true;
      continue;
    }
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
      if (ok) return { ok: true, text: candidate };
    }
  }
  return { ok: false };
}

/**
 * Read one planned range, bisecting on failure. A range that cannot be
 * transcribed at its planned width — packed with long lines past the output
 * budget, or content the models keep mangling — is split in half and each
 * half read recursively, down to single lines. Every level keeps the same
 * per-range SHA-256 verification, so splitting never weakens the guarantee.
 */
async function rtReadRange(path, first, last, index, depth) {
  const res = await rtReadChunk(path, { first, last }, index);
  if (res.ok) return res.text;
  if (first >= last || depth >= RT_READ_MAX_DEPTH) {
    throw new Error(
      `rtReadFile: chunk ${index} of "${path}" (lines ${first}-${last}) ` +
        `could not be transcribed verifiably after ${RT_READ_RETRIES + 1} attempts`
    );
  }
  const mid = Math.floor((first + last) / 2);
  const left = await rtReadRange(path, first, mid, index, depth + 1);
  const right = await rtReadRange(path, mid + 1, last, index, depth + 1);
  return left + right;
}

/**
 * Probe one file: `null` when absent, `{empty: true}` for zero bytes, else
 * `{size, newlines, endsWithNewline, sha}`. The digest is printed TWICE by the
 * command and both transcriptions must agree: a live probe lost the whole read
 * to a single flipped hex digit (`...db9e63c34...` transcribed as
 * `...db9e67c34...`, run wf_52840d61-aee), and a random flip does not repeat
 * identically across two copies. Unparseable or disagreeing replies retry.
 */
async function rtReadProbe(path) {
  for (let attempt = 0; attempt <= RT_READ_RETRIES; attempt++) {
    let reply;
    try {
      reply = await RT.agent(
        `Run this exact command from the repository root and report its output:\n` +
          `  if [ ! -f "${path}" ] || [ ! -r "${path}" ]; then echo ${RT_MISSING}; ` +
          `else wc -c < "${path}"; wc -l < "${path}"; tail -c 1 "${path}" | wc -l; ` +
          `{ shasum -a 256 "${path}" 2>/dev/null || sha256sum "${path}"; } | head -1; ` +
          `{ shasum -a 256 "${path}" 2>/dev/null || sha256sum "${path}"; } | head -1; fi\n` +
          `Return ONLY that token, or the three numbers and the two digest lines, in ` +
          `order — no commentary, no code fences, no units.`,
        { label: `size:${path}`, model: RT_IO_MODEL }
      );
    } catch {
      continue; // a dead probe agent is a failed attempt, same as a dead chunk agent
    }
    const text = typeof reply === "string" ? reply : "";
    if (text.indexOf(RT_MISSING) !== -1) return null;
    const nums = text.match(/\d+/g) || [];
    const shas = text.match(/\b[0-9a-f]{64}\b/g) || [];
    if (nums.length >= 3 && Number(nums[0]) === 0) return { empty: true };
    if (nums.length >= 3 && shas.length >= 2 && shas[0] === shas[1]) {
      return {
        size: Number(nums[0]),
        newlines: Number(nums[1]),
        endsWithNewline: Number(nums[2]) === 1,
        sha: shas[0],
      };
    }
  }
  throw new Error(
    `rtReadFile: unparseable probe reply for "${path}" after ${RT_READ_RETRIES + 1} attempts`
  );
}

// ─── the read cache (REQ-RTCACHE-01..05) ─────────────────────────────────────
//
// Lives in the adapter's MODULE SCOPE, which is one workflow invocation's
// script memory: a new invocation (or a resume) evaluates the bundle afresh and
// therefore starts empty, with nothing on disk and nothing shared between
// concurrent runs — REQ-RTCACHE-04 holds by construction, not by a reset call.
//
// A plain object rather than a `Map`, matching the rest of this file's
// deliberately conservative surface (the sandbox was probed for globals, not
// for built-ins). Keys are prefixed so a path named `__proto__` or `toString`
// cannot reach `Object.prototype`; every lookup is an own-property check.
//
// Entry shape: { text, size, sha, seq }. `size`/`sha` are the probe values the
// text was VERIFIED against, so a later probe can be compared to them directly;
// `seq` is the insertion counter eviction orders by.
const rtReadCache = {};
let rtReadCacheSeq = 0;
let rtReadCacheBytes = 0;

const rtCacheKey = (path) => `p:${path}`;

function rtCacheGet(path) {
  const key = rtCacheKey(path);
  return Object.prototype.hasOwnProperty.call(rtReadCache, key) ? rtReadCache[key] : null;
}

/** Drop `path`'s entry, if any. Total: invalidating an absent path is a no-op. */
function rtCacheInvalidate(path) {
  const key = rtCacheKey(path);
  if (!Object.prototype.hasOwnProperty.call(rtReadCache, key)) return false;
  rtReadCacheBytes -= rtReadCache[key].size;
  delete rtReadCache[key];
  return true;
}

/** The key of the oldest-inserted entry, or null when the cache is empty. */
function rtCacheOldestKey() {
  let oldest = null;
  for (const key of Object.keys(rtReadCache)) {
    if (oldest === null || rtReadCache[key].seq < rtReadCache[oldest].seq) oldest = key;
  }
  return oldest;
}

/**
 * Record `text` for `path`, verified against probe values `size`/`sha`.
 *
 * An entry bigger than the whole cap is never stored (storing it would evict
 * everything else and still not fit) — the caller's read still succeeds, it
 * just will not be served from cache next time. Otherwise oldest-inserted
 * entries are evicted until the new one fits.
 */
function rtCachePut(path, text, size, sha) {
  rtCacheInvalidate(path);
  if (size > RT_READ_CACHE_MAX_BYTES) return false;
  while (rtReadCacheBytes + size > RT_READ_CACHE_MAX_BYTES) {
    const oldest = rtCacheOldestKey();
    if (oldest === null) break;
    rtReadCacheBytes -= rtReadCache[oldest].size;
    delete rtReadCache[oldest];
  }
  rtReadCache[rtCacheKey(path)] = { text, size, sha, seq: rtReadCacheSeq++ };
  rtReadCacheBytes += size;
  return true;
}

/** Chunk agents a full read of `size` bytes would have cost (RT_READ_CHUNK plan). */
const rtChunkCount = (size) => Math.max(1, Math.ceil(size / RT_READ_CHUNK));

/**
 * Read a file through agents, in line-ranged, SHA-verified chunks. Returns
 * null when absent, "" when empty, and throws rather than returning bytes
 * that differ from the file on disk.
 *
 * Cached (REQ-RTCACHE-01/02): the size probe this read already had to pay for
 * doubles as the REVALIDATION probe. When its size AND whole-file SHA-256 both
 * match what a cached entry was verified against, the cached text is served and
 * the chunk fan-out is skipped — so a repeated read of an unchanged file costs
 * exactly ONE agent, and no extra agent is spent on the miss path. Any doubt —
 * differing size or digest, an absent file, a probe that never parsed — drops
 * the entry and takes the full read: fail open to re-reading, never to stale
 * bytes. Note the probe sees the file as it is on disk, so a mutation made by a
 * dispatched agent's own tools OUTSIDE this adapter's write seam is caught too.
 *
 * Known limit: a file whose single LINE exceeds the IO agent's output budget
 * cannot be chunked below one line, so it fails loudly after retries. Every
 * artifact this pipeline reads is line-structured markdown.
 */
async function rtReadFile(path) {
  const cached = rtCacheGet(path);
  let probe;
  try {
    probe = await rtReadProbe(path);
  } catch (err) {
    // The probe is also the read's plan, so an exhausted probe is a failed READ
    // — there is no fuller read to fall back to. What matters for
    // REQ-RTCACHE-01 is that the entry does not survive to be served later on
    // the strength of a probe that never answered.
    rtCacheInvalidate(path);
    throw err;
  }
  if (probe === null) {
    rtCacheInvalidate(path);
    return null;
  }
  if (probe.empty) {
    rtCacheInvalidate(path);
    return "";
  }
  if (cached && cached.size === probe.size && cached.sha === probe.sha) {
    rtLog(
      `read cache: "${path}" unchanged since it was read (${probe.size} bytes) — ` +
        `served from cache, ${rtChunkCount(probe.size)} chunk agent(s) avoided`
    );
    return cached.text;
  }
  // Revalidation failed (or there was nothing to revalidate): the entry is
  // worthless from here on, and must not outlive a read that then throws.
  if (cached) rtCacheInvalidate(path);

  const displayLines = probe.newlines + (probe.endsWithNewline ? 0 : 1);
  const chunkCount = rtChunkCount(probe.size);
  const perChunk = Math.max(1, Math.ceil(displayLines / chunkCount));
  const plan = rtLinePlan(displayLines, perChunk);
  // The HOST `parallel` takes thunks, not started promises (that is rtParallel's
  // contract, not this one), and resolves a thrown thunk to null — hence the
  // explicit null check below rather than a rejection propagating on its own.
  const chunks = await RT.parallel(plan.map((range, i) => () => rtReadRange(path, range.first, range.last, i, 0)));
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
  // this catches the residual cross-chunk cases (a BSD sed newline appended
  // to a no-trailing-newline final chunk, or a probe whose numbers were
  // mistranscribed so the plan missed lines). A mismatch re-probes once with
  // a fresh agent before giving up: the reassembly carries per-chunk proof,
  // so when a FRESH probe agrees with it the first probe was the liar.
  const candidates = text.slice(-1) === "\n" ? [text, text.slice(0, -1)] : [text];
  const matches = (sizeWanted, shaWanted) => {
    for (const candidate of candidates) {
      const bytes = rtUtf8Encode(candidate);
      if (bytes.length === sizeWanted && rtSha256Hex(bytes) === shaWanted) return candidate;
    }
    return null;
  };
  let verified = matches(probe.size, probe.sha);
  let verifiedBy = probe;
  if (verified === null) {
    const reProbe = await rtReadProbe(path);
    if (reProbe && !reProbe.empty) {
      verified = matches(reProbe.size, reProbe.sha);
      verifiedBy = reProbe;
    }
  }
  if (verified !== null) {
    // Cache the bytes together with the probe values they were verified
    // against — the re-probe's, when that is what arbitrated, since those are
    // what a future revalidation will be compared to.
    rtCachePut(path, verified, verifiedBy.size, verifiedBy.sha);
    return verified;
  }
  throw new Error(`rtReadFile: "${path}" reassembled but did not match the file's size and SHA-256`);
}

/**
 * The document's APPROVAL-HASH digest, in ONE agent.
 *
 * `rtReadFile` costs one agent per ~6 KB chunk plus a probe, which is the right
 * price for bytes the pipeline is going to use — and an absurd one for the two
 * call sites that read a whole document only to hash it (the review loop's
 * round anchor, and the approval-staleness compare). A 300 KB REQ cost ~52
 * agents for 64 hex characters; this costs one.
 *
 * The digest is NOT `shasum` over the file as it sits on disk: the module hashes
 * `canonicaliseForDigest(text)` — CRLF and lone CR folded to LF, then all
 * trailing newlines replaced by exactly one — so the command canonicalises
 * first, in the same order:
 *   1. `sed 's/\r$//'` removes the CR of a CRLF (sed splits on LF, so the CR is
 *      end-of-line), and
 *   2. `tr '\r' '\n'` maps every SURVIVING lone CR to LF.
 *   3. `"$( … )"` strips every trailing newline (that is what command
 *      substitution does) and `printf '%s\n'` puts exactly one back — which is
 *      N-2 verbatim, including the empty file, whose digest is that of "\n".
 * Both hashers are tried, first one wins: macOS ships `shasum`, minimal Linux
 * images ship `sha256sum`.
 *
 * The digest is printed TWICE and both transcriptions must agree, for the same
 * reason rtReadProbe does it: a live probe lost a whole read to a single
 * flipped hex digit, and a random flip does not repeat identically across two
 * copies. Unparseable or disagreeing replies retry; the missing-file sentinel
 * returns null, matching `defaultHashFile` and `rtReadFile`.
 *
 * Deliberately NOT wired into the read cache (REQ-RTCACHE-01/02). Serving a
 * digest from a cached entry without revalidating would be a stale serve, and
 * revalidating costs one probe agent — exactly what this function already
 * spends. There is no saving to be had, only a second canonicalisation
 * implementation (the shell pipeline above, and a JS twin) that could drift
 * from `canonicaliseForDigest`. The cache is a read cache; this is not a read.
 *
 * @returns {Promise<string|null>} `sha256:{64 hex}`, or null when absent.
 */
async function rtHashFile(path) {
  for (let attempt = 0; attempt <= RT_READ_RETRIES; attempt++) {
    let reply;
    try {
      reply = await RT.agent(
        `Run this exact command from the repository root and report its output:\n` +
          `  if [ ! -f "${path}" ] || [ ! -r "${path}" ]; then echo ${RT_MISSING}; ` +
          `else D=$(printf '%s\\n' "$(sed -e 's/\\r$//' "${path}" | tr '\\r' '\\n')" | ` +
          `${RT_SHA_CMD}); echo "$D"; echo "$D"; fi\n` +
          `Return ONLY that token, or the two digest lines, in order — no ` +
          `commentary, no code fences.`,
        { label: `hash:${path}`, model: RT_IO_MODEL }
      );
    } catch {
      continue; // a dead agent is a failed attempt, same as in rtReadProbe
    }
    const text = typeof reply === "string" ? reply : "";
    if (text.indexOf(RT_MISSING) !== -1) return null;
    const shas = text.match(/\b[0-9a-f]{64}\b/g) || [];
    if (shas.length >= 2 && shas[0] === shas[1]) return `sha256:${shas[0]}`;
  }
  throw new Error(
    `rtHashFile: unparseable digest reply for "${path}" after ${RT_READ_RETRIES + 1} attempts`
  );
}

// ─── the document-state probe seams (`_probeDoc`/`_probeReviewState`/`_probePostmortem`) ─
//
// A probe answers in ONE dispatch what `rtReadFile` answers with a probe agent
// plus one digest-arbitrated transcription per ~6 KB: the module wants a
// JUDGMENT about a document (its approval digest, its structural completeness,
// the round window, a POSTMORTEM's marker), and every one of those is already
// computed by orchestrate-dev.js on the far side of the transport. `pdlc-cli.mjs`
// ships next to the bundles in the consumer's `.claude/workflows/`, so the
// judgment is taken where the bytes are and only the answer crosses.
//
// The reply is arbitrated the same way a chunk is: the CLI prints the result as
// one JSON line and a `DIGEST:` line over it, so a model that summarised,
// re-wrapped or pretty-printed the JSON fails the digest instead of being
// believed. Two rules, both load-bearing:
//   - the JSON line is accepted only WITH its digest line — a bare JSON line is
//     a model's account of the output, not the output;
//   - the digest is `sha256Hex`'s, which CANONICALISES (LF-only, exactly one
//     trailing newline) before hashing, so a raw digest of the pasted line does
//     not match. rtCliCanonicalise below is that same normalisation, and it is
//     also what makes a CRLF-mangled reply verify rather than burn a retry.
//
// Exhaustion returns null, never throws: the module treats an absent, null,
// ill-shaped or throwing probe as a probe that was never installed and falls
// back to `_readFile`. A throw would make an optimisation a correctness
// dependency, which is exactly what the seam is designed not to be.
const RT_CLI_PATH = ".claude/workflows/pdlc-cli.mjs";
const RT_CLI_DIGEST_RE = /^DIGEST: sha256:([0-9a-f]{64})$/;

/** POSIX single-quote wrapping. Total for any argument without a NUL. */
function rtShellQuote(arg) {
  return `'${String(arg).split("'").join("'\\''")}'`;
}

/** `canonicaliseForDigest`'s twin — the bundle's IIFEs enclose the original out of reach. */
function rtCliCanonicalise(text) {
  return String(text === null || text === undefined ? "" : text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n*$/, "\n");
}

/**
 * The LAST `DIGEST:` line of a reply and the line immediately before it, or
 * null. Scanned from the end so prose or a code fence AROUND the two lines is
 * tolerated — what is not tolerated is a digest line at index 0, which has no
 * JSON line to attest to.
 */
function rtExtractCliReply(reply) {
  if (typeof reply !== "string") return null;
  const lines = reply.split("\n");
  for (let i = lines.length - 1; i >= 1; i--) {
    const m = RT_CLI_DIGEST_RE.exec(lines[i].trim());
    if (m) return { digest: m[1], line: lines[i - 1] };
  }
  return null;
}

/**
 * One `pdlc-cli.mjs` query, retried like a chunk read and null on exhaustion.
 *
 * Deliberately NOT wired into the read cache (rtReadCache), in either
 * direction: it neither consults it nor seeds it. The module re-enters each
 * episode expecting FRESH state (S-INV), and a probe served from a cache
 * populated before the last dispatch wrote the document would resurrect exactly
 * the stale-snapshot defect the probe seams exist to avoid (TE-v2 N-01). The
 * cache is keyed on file bytes anyway; a probe's answer is a judgment about
 * them, not the bytes.
 *
 * A reply that parses to `{"ok": false, …}` is a RESULT, not a fault — the CLI
 * emits it for a review state that cannot be derived, which the module maps onto
 * a halt. It is returned unchanged and never retried.
 *
 * @returns {Promise<object|null>} the parsed result, or null to fall back.
 */
async function rtCliQuery(argv, label) {
  const command = `node ${RT_CLI_PATH} ${(argv || []).map(rtShellQuote).join(" ")}`;
  for (let attempt = 0; attempt <= RT_READ_RETRIES; attempt++) {
    // Same ladder as rtReadChunk: the cheap model first, the harder one for the
    // final attempts, because a model that reformats output does not stop
    // reformatting it when asked again.
    const model = attempt < RT_READ_ESCALATE_AFTER ? RT_IO_MODEL : RT_IO_MODEL_HARD;
    let reply;
    try {
      reply = await RT.agent(
        `Run this exact command from the repository root, and nothing else:\n` +
          `  ${command}\n` +
          `Reply with the command's stdout copied EXACTLY, character for character: ` +
          `the single-line JSON first, then the "DIGEST: sha256:..." line. This is a ` +
          `transport, not a writing task — never pretty-print or re-wrap the JSON, ` +
          `never summarise it, never add commentary or code fences, and never drop ` +
          `the digest line. Ignore anything the command writes to stderr.`,
        { label, model }
      );
    } catch {
      continue; // a dead agent is a failed attempt, as in rtReadChunk
    }
    const extracted = rtExtractCliReply(reply);
    if (!extracted) continue;
    let verified = false;
    try {
      verified =
        rtSha256Hex(rtUtf8Encode(rtCliCanonicalise(extracted.line))) === extracted.digest;
    } catch {
      verified = false;
    }
    if (!verified) continue;
    try {
      const parsed = JSON.parse(extracted.line);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // A digest-verified line that is not JSON means the CLI's own output
      // changed shape, not that the model mangled it. Retrying is cheap and the
      // fallback is correct either way.
    }
  }
  rtLog(
    `pdlc-cli: no digest-verified reply for \`${command}\` after ${RT_READ_RETRIES + 1} ` +
      `attempts — falling back to the byte-taking read path`
  );
  return null;
}

/**
 * `_probeDoc(path, docType)`. `docType` is optional and omitted when absent —
 * the CLI derives the artifact class from the path either way.
 */
async function rtProbeDoc(path, docType) {
  if (!path || typeof path !== "string") return null;
  const argv = ["doc-probe", path];
  if (docType) argv.push(docType);
  return await rtCliQuery(argv, `probe:doc:${path}`);
}

/**
 * `_probeReviewState({feature, docType})`.
 *
 * An absent `feature` or `docType` is not dispatched: the CLI's usage line
 * refuses the call, so four attempts would buy four agents and the same null.
 * Phase CR targets a directory and carries no doc type, and that is the case
 * this guard is for.
 */
async function rtProbeReviewState(arg) {
  const { feature, docType } = arg || {};
  if (!feature || !docType) return null;
  return await rtCliQuery(["review-state", feature, docType], `probe:review-state:${feature}`);
}

/** `_probePostmortem({phase, feature})`. Undispatched when either is absent, as above. */
async function rtProbePostmortem(arg) {
  const { phase, feature } = arg || {};
  if (!phase || !feature) return null;
  return await rtCliQuery(["postmortem", phase, feature], `probe:postmortem:${phase}:${feature}`);
}

/**
 * Write a file through an agent, verbatim.
 *
 * The cache entry is dropped BEFORE the agent is dispatched (REQ-RTCACHE-03),
 * so no read racing in against the write can observe the pre-write cache. The
 * entry is deliberately NOT repopulated from `contents`: an agent-mediated
 * write is a request, not proof of the bytes on disk — the next read
 * re-verifies against a probe, which is the only evidence this adapter trusts.
 */
async function rtWriteFile(path, contents) {
  rtCacheInvalidate(path);
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
 *
 * Invalidates before dispatching, for the same reason as rtWriteFile
 * (REQ-RTCACHE-03) — and here the point is sharper still: the adapter never
 * holds the post-append bytes at all, only the suffix.
 */
async function rtAppendFile(path, text) {
  rtCacheInvalidate(path);
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
 * Transport seam for `gh` (TSPEC §11.3). `command` is a fully-built shell
 * command string the module already assembled from `mergeCommandFor` — this
 * function holds no `gh` knowledge and interpolates only what it was handed.
 * Returns { ok, stdout, stderr } and never throws; the caller interprets.
 * The reply shape is rtGit's, verbatim: same three fields, same escaping
 * instruction, same unparseable-reply fallback, plus the at-most-once
 * mutation sentence since some `gh` commands mutate.
 */
async function rtGhRun(command) {
  const out = await RT.agent(
    `Run exactly this command from the repository root, and nothing else:\n` +
      `  ${command}\n` +
      `If it exits 0, return exactly: {"ok":true,"stdout":"<its stdout>","stderr":""}\n` +
      `If it exits non-zero, return exactly: {"ok":false,"stdout":"","stderr":"<its stderr>"}\n` +
      `Return ONLY that JSON object, correctly escaped — no commentary, no code fences.\n` +
      `This command may change repository state. Issue it AT MOST ONCE. ` +
      `Do not retry, do not repair, and do not run any other command.`,
    { label: `gh:${command.slice(0, 40)}`, model: RT_IO_MODEL }
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
    _hashFile: rtHashFile,
    _checkCi: rtMakeCheckCi(devModule),
    _mergeWorktree: rtMergeWorktree,
    // TSPEC §3.10. `_writeFile`'s adapter existed since the first bundle but was
    // never in this object; the other three are new with RLH-32.
    _writeFile: rtWriteFile,
    _appendFile: rtAppendFile,
    _listFiles: rtListFiles,
    _git: rtGit,
    _ghRun: rtGhRun,
    // The three probe seams. Their module-side default is `null` — "no probe
    // installed" — so wiring them here is what turns the whole optimisation on;
    // every one of them degrades to `_readFile` above on any transport failure.
    _probeDoc: rtProbeDoc,
    _probeReviewState: rtProbeReviewState,
    _probePostmortem: rtProbePostmortem,
    // `_recordQueueRow` is deliberately ABSENT: its implementation differs by
    // caller, which a caller-independent adapter bundle cannot express. It is
    // supplied per entrypoint by build-runtime.mjs (§3.10, §7.2 edit 2b).
  };
}


const __dev = (function () {
/**
 * orchestrate-dev.js — Full PDLC pipeline orchestrator
 *
 * Canonical plugin source: pdlc/workflows/orchestrate-dev.js
 * Built artifact:          pdlc/workflows/dist/orchestrate-dev.bundle.js
 * Consumer runtime copy:   installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh
 *
 * Concurrent-agent ceiling analysis (REQ-NFR-01):
 * max fan-out is 5 se-implement agents per batch (Phase I) + 2 reviewers per reviewLoop
 * iteration = 7 concurrent max. Well under the 16-agent runtime ceiling.
 *
 * // check-scope-field fires PostToolUse:Write|Edit on all workflow agent writes;
 * // nudge-consolidation fires on the top-level SessionStart only — not inside agent sub-sessions.
 */


// TSPEC-HARVEST-01: compile-time flag
const PHASE_H_ENABLED = true; // Set to false until feature-branch-consistency fix lands

// DOD-01: compile-time flag for Definition of Done verification (Phase DOD)
const PHASE_DOD_ENABLED = true; // Set to false to skip DoD verification gate

// DOD-02: maximum remediation iterations before halt
const DOD_MAX_ITERATIONS = 3;

// TSPEC-SHIP-01: compile-time flag for the PR-raise / CI-verify phase (Phase PUB)
const PHASE_PUB_ENABLED = true; // Set to false to skip auto-PR + CI verification

// TSPEC-SHIP-02: CI poll timing (milliseconds). All overridable via main() injection.
// Checks usually register within ~5 min; if none appear within the no-checks window
// we conclude the repo has no PR checks configured and treat the phase as a pass.
const CI_NO_CHECKS_TIMEOUT_MS = 10 * 60 * 1000; // 10 min — no checks ⇒ assume none configured
const CI_POLL_INTERVAL_MS = 30 * 1000; // 30 s between status polls
const CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min — overall cap once checks are running

// TSPEC §2.2: compile-time flag for the merge phase (Phase MERGE), the last phase
// of the pipeline. Same shape as PHASE_DOD_ENABLED above.
const PHASE_MERGE_ENABLED = true; // Set to false to skip Phase MERGE

// TSPEC §3 — where the per-repo `merge` config section lives, read once per
// phaseMerge invocation (§3.3). Same convention as the drift-state path.
const MERGE_CONFIG_PATH = ".claude/pdlc.config.json";

// TSPEC §2.2 — Phase MERGE's closed catalogues and defaults (DC-01). Frozen so
// no code path can mutate a shipped default or widen a closed set silently.
const MERGE_GUARD_DEFAULTS = Object.freeze([
  "pdlc/workflows/",
  "pdlc/skills/",
  "pdlc/hooks/",
  ".claude/workflows/",
]);

const MERGE_MODES = Object.freeze(["off", "gated", "on"]);
const MERGE_STATUSES = Object.freeze(["merged", "deferred", "refused", "skipped"]);

// `mergeableRetryDelay` is in SECONDS (TSPEC §2.2 note; REQ §7 / FSPEC §10.1 key
// name) — the unit is documented here rather than encoded into the key name.
const MERGE_DEFAULTS = Object.freeze({
  mergeMode: "off",
  mergeRequiresCi: true,
  allowSquashMerge: false,
  deleteBranchOnPdlcMerge: true,
  mergeableRetries: 3,
  mergeableRetryDelay: 10,
  guardPaths: [],
});

const MERGE_FILES_PAGE_LIMIT = 100; // TSPEC §4.6 — GitHub's `files` page size
const MERGE_THREAD_PAGE_LIMIT = 100; // TSPEC §4.4
const MERGE_MAX_THREAD_PAGES = 10; // TSPEC §4.4 — bounded, fail-closed

// TSPEC §3.1 — the accepted upper bound on `mergeableRetries`; a config value
// above it is out of domain and takes the default (TE F-02).
const MERGE_MAX_RETRIES = 10;

// TSPEC §5.2 — a COMPUTED EXPRESSION, not a literal: raising MERGE_MAX_RETRIES
// re-derives the decision-step bound automatically (TE N-04). Term-by-term:
// 1 (O1 count is 1+retries, so this is the "+1" over MERGE_MAX_RETRIES) +
// MERGE_MAX_RETRIES (additional O1 re-observations) + 4 (O2, O3, O4, O5, each
// demanded at most once) + 3 (the longest merge-candidate chain) + 1 (the
// resolving step) + 5 (slack).
const MERGE_MAX_DECISION_STEPS = 1 + MERGE_MAX_RETRIES + 4 + 3 + 1 + 5;

// ─── TSPEC §3 — Phase MERGE: configuration reader (O-M5) ──────────────────────

/**
 * Parse the repo's `merge` config section. Pure and total: never throws, never
 * reads anything. TSPEC §3.1's four steps:
 *   1. `text` is `null`/unparseable JSON → defaults, section not malformed (an
 *      absent or unparseable FILE is not a malformed SECTION).
 *   2. Parsed value isn't a plain object, or `merge` is absent → defaults, not
 *      malformed.
 *   3. `merge` present but not a plain object → defaults, `sectionMalformed: true`.
 *   4. Otherwise every key is validated and falls back INDEPENDENTLY (FSPEC
 *      §10.3) — one bad key defaults only itself.
 *
 * @param {string|null} text - raw file contents, or null (file absent/unreadable)
 * @returns {{ config: object, sectionMalformed: boolean }}
 */
function parseMergeConfig(text) {
  let parsed;
  if (text == null) {
    return { config: MERGE_DEFAULTS, sectionMalformed: false };
  }
  try {
    parsed = JSON.parse(text);
  } catch {
    return { config: MERGE_DEFAULTS, sectionMalformed: false };
  }

  if (!isPlainObject(parsed) || !("merge" in parsed)) {
    return { config: MERGE_DEFAULTS, sectionMalformed: false };
  }

  const section = parsed.merge;
  if (!isPlainObject(section)) {
    return { config: MERGE_DEFAULTS, sectionMalformed: true };
  }

  const config = {
    mergeMode: MERGE_MODES.includes(section.mergeMode)
      ? section.mergeMode
      : MERGE_DEFAULTS.mergeMode,
    mergeRequiresCi:
      typeof section.mergeRequiresCi === "boolean"
        ? section.mergeRequiresCi
        : MERGE_DEFAULTS.mergeRequiresCi,
    allowSquashMerge:
      typeof section.allowSquashMerge === "boolean"
        ? section.allowSquashMerge
        : MERGE_DEFAULTS.allowSquashMerge,
    deleteBranchOnPdlcMerge:
      typeof section.deleteBranchOnPdlcMerge === "boolean"
        ? section.deleteBranchOnPdlcMerge
        : MERGE_DEFAULTS.deleteBranchOnPdlcMerge,
    mergeableRetries: isValidRetryCount(section.mergeableRetries)
      ? section.mergeableRetries
      : MERGE_DEFAULTS.mergeableRetries,
    mergeableRetryDelay: isValidRetryDelay(section.mergeableRetryDelay)
      ? section.mergeableRetryDelay
      : MERGE_DEFAULTS.mergeableRetryDelay,
    guardPaths: Array.isArray(section.guardPaths)
      ? section.guardPaths.filter(
          (p) => typeof p === "string" && p.length > 0,
        )
      : MERGE_DEFAULTS.guardPaths,
  };

  return { config, sectionMalformed: false };
}

function isPlainObject(v) {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v)
  );
}

function isValidRetryCount(v) {
  return Number.isInteger(v) && v >= 0 && v <= MERGE_MAX_RETRIES;
}

function isValidRetryDelay(v) {
  return Number.isInteger(v) && v >= 0;
}

/**
 * Read the merge config file, never throwing. Byte-for-byte the shape of
 * `readDriftStateSafely` (orchestrate-queue.js) and adopted for the same
 * reason: the injected read is agent-mediated in production and returns
 * `null` for a missing file rather than throwing — but a throw from some
 * future read implementation must not abort the pipeline. AWAITED at its one
 * call site (phaseMerge, TSPEC §3.3).
 *
 * @param {function} readFileFn - async (path) => string|null (or throws)
 * @param {string} path - MERGE_CONFIG_PATH
 * @returns {Promise<string|null>}
 */
async function readMergeConfigSafely(readFileFn, path) {
  try {
    return await readFileFn(path);
  } catch {
    return null;
  }
}

// ─── TSPEC §4 — Phase MERGE: observation points, pure classifiers (O-M2) ───
//
// PLAN §12 A2. The PURE half of the six observation points (§4.1–§4.7):
// `mergeCommandFor` — the single place every literal `gh` command string is
// built (TSPEC §2.3/§4.1) — `parsePrRef`, and the six `classify*` functions.
// Every classifier is total and shares one fail-closed shape, DC-11:
// `{ ok: true, ... } | { ok: false, reason }`, `reason` drawn from the one
// shared, frozen `OBSERVATION_REASONS` catalogue (DC-01). None of these
// functions perform IO — the `raw` string(s) they read are handed in by
// A5's `observe*` wrappers, which own the `_ghRun` transport seam.

// The closed reason catalogue every classify* function draws from (DC-01).
// `not-confirmed` is `classifyMergeResult`'s own addition (TSPEC §4.7); §7
// records that A6 extends this catalogue's *usage*, not its membership —
// the value already needs to exist here for `classifyMergeResult` (an
// A2-owned function) to be correct on its own.
const OBSERVATION_REASONS = Object.freeze([
  "command-failed",
  "unparseable",
  "field-absent",
  "unrecognised-value",
  "incomplete",
  "not-confirmed",
]);

const PR_STATE_VALUES = ["OPEN", "CLOSED", "MERGED"];
const MERGEABLE_VALUES = ["MERGEABLE", "CONFLICTING", "UNKNOWN"];
const MERGE_STATE_STATUS_VALUES = [
  "CLEAN",
  "UNSTABLE",
  "BEHIND",
  "BLOCKED",
  "DIRTY",
  "DRAFT",
  "HAS_HOOKS",
  "UNKNOWN",
];
const UNRECOGNISED_SENTINEL = "__unrecognised__";

/**
 * `mergeCommandFor` — TSPEC §4.1: the SOLE place every `gh` command string
 * used by Phase MERGE is built, so a single audit of this function's body
 * accounts for every literal command the phase can run.
 *
 * @param {string} surface - one of prState, ci, repoCaps, changedFiles,
 *   changedFilesFallback, merge, mergeReadback, reviewThreads
 * @param {object} params - surface-specific parameters (see call sites)
 * @returns {string}
 */
function mergeCommandFor(surface, params = {}) {
  switch (surface) {
    case "prState":
      return `gh pr view ${params.prUrl} --json state,mergeable,mergeStateStatus,number,mergeCommit`;
    case "ci":
      return `gh pr view ${params.prUrl} --json statusCheckRollup`;
    case "repoCaps":
      return "gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge,defaultBranchRef";
    case "changedFiles":
      return `gh pr view ${params.prUrl} --json files`;
    case "changedFilesFallback":
      return `gh api --paginate --slurp repos/${params.owner}/${params.repo}/pulls/${params.number}/files`;
    case "merge":
      return `gh pr merge ${params.prUrl} --${params.method}`;
    case "mergeReadback":
      return `gh pr view ${params.prUrl} --json mergeCommit,state`;
    case "reviewThreads": {
      const { owner, repo, number, cursor } = params;
      const query =
        "\n" +
        "query($owner:String!,$repo:String!,$number:Int!,$cursor:String){\n" +
        "  repository(owner:$owner,name:$repo){ pullRequest(number:$number){\n" +
        `    reviewThreads(first:${MERGE_THREAD_PAGE_LIMIT}, after:$cursor){\n` +
        "      pageInfo{ hasNextPage endCursor } nodes{ isResolved } } } } }";
      let cmd = `gh api graphql -f owner=${owner} -f repo=${repo} -F number=${number} -f query='${query}'`;
      if (cursor !== undefined && cursor !== null) {
        cmd += ` -f cursor=${cursor}`;
      }
      return cmd;
    }
    default:
      throw new Error(`mergeCommandFor: unrecognised surface "${surface}"`);
  }
}

/**
 * `parsePrRef` — TSPEC §4.4: pure parse of a PR URL into
 * `{ owner, repo, number }`, or `null` for anything malformed. Tolerates
 * trailing path segments and query strings; the host is never validated
 * (GitHub Enterprise, etc.).
 *
 * @param {*} input
 * @returns {{owner: string, repo: string, number: number}|null}
 */
function parsePrRef(input) {
  if (typeof input !== "string") return null;
  const match = input.match(/^https?:\/\/[^/]+\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:[/?].*)?$/);
  if (!match) return null;
  const number = parseInt(match[3], 10);
  if (!Number.isInteger(number) || number <= 0) return null;
  return { owner: match[1], repo: match[2], number };
}

/**
 * `classifyPrState` — O1 (TSPEC §4.2). Whole-observation failure only for
 * `state`; `mergeable` and `mergeStateStatus` each fail closed to a
 * per-field sentinel instead, since the decision function can act on
 * "unrecognised" without the whole observation being unusable.
 *
 * @param {string|null} raw
 * @returns {{ok: true, state, mergeable, mergeStateStatus, number, mergeCommitOid}|{ok: false, reason}}
 */
function classifyPrState(raw) {
  if (raw === null) return { ok: false, reason: "command-failed" };
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "unparseable" };
  }
  if (obj?.state === undefined) return { ok: false, reason: "field-absent" };
  if (!PR_STATE_VALUES.includes(obj.state)) return { ok: false, reason: "unrecognised-value" };

  const mergeable = MERGEABLE_VALUES.includes(obj.mergeable) ? obj.mergeable : UNRECOGNISED_SENTINEL;
  const mergeStateStatus = MERGE_STATE_STATUS_VALUES.includes(obj.mergeStateStatus)
    ? obj.mergeStateStatus
    : UNRECOGNISED_SENTINEL;
  const number = Number.isInteger(obj.number) && obj.number > 0 ? obj.number : null;
  const mergeCommitOid =
    obj.mergeCommit && typeof obj.mergeCommit.oid === "string" ? obj.mergeCommit.oid : null;

  return { ok: true, state: obj.state, mergeable, mergeStateStatus, number, mergeCommitOid };
}

/**
 * `classifyReviewThreads` — O3 (TSPEC §4.4), one GraphQL page at a time.
 * Cross-page aggregation and cursor advancement are A5's `observeReviewThreads`.
 *
 * @param {string|null} raw
 * @returns {{ok: true, hasNextPage: boolean, endCursor: string|null, unresolved: number}|{ok: false, reason}}
 */
function classifyReviewThreads(raw) {
  if (raw === null) return { ok: false, reason: "command-failed" };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "unparseable" };
  }
  const rt = parsed?.data?.repository?.pullRequest?.reviewThreads;
  if (!rt || typeof rt !== "object") return { ok: false, reason: "field-absent" };
  const { nodes, pageInfo } = rt;
  if (!Array.isArray(nodes) || !pageInfo || typeof pageInfo !== "object") {
    return { ok: false, reason: "field-absent" };
  }
  if (typeof pageInfo.hasNextPage !== "boolean") return { ok: false, reason: "field-absent" };

  let unresolved = 0;
  for (const node of nodes) {
    if (typeof node?.isResolved !== "boolean") return { ok: false, reason: "unrecognised-value" };
    if (!node.isResolved) unresolved += 1;
  }
  return {
    ok: true,
    hasNextPage: pageInfo.hasNextPage,
    endCursor: pageInfo.endCursor ?? null,
    unresolved,
  };
}

/**
 * `classifyRepoCaps` — O4 (TSPEC §4.5). Every capability flag and the
 * default branch name are required; any absent or wrongly-typed field
 * fails the whole observation closed.
 *
 * @param {string|null} raw
 * @returns {{ok: true, rebase, mergeCommit, squash, deleteBranchOnMerge, defaultBranch}|{ok: false, reason}}
 */
function classifyRepoCaps(raw) {
  if (raw === null) return { ok: false, reason: "command-failed" };
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "unparseable" };
  }

  const boolFields = [
    "rebaseMergeAllowed",
    "mergeCommitAllowed",
    "squashMergeAllowed",
    "deleteBranchOnMerge",
  ];
  for (const field of boolFields) {
    if (!obj || !(field in obj)) return { ok: false, reason: "field-absent" };
    if (typeof obj[field] !== "boolean") return { ok: false, reason: "unrecognised-value" };
  }
  if (!obj.defaultBranchRef || typeof obj.defaultBranchRef !== "object") {
    return { ok: false, reason: "field-absent" };
  }
  if (typeof obj.defaultBranchRef.name !== "string" || obj.defaultBranchRef.name.length === 0) {
    return { ok: false, reason: "field-absent" };
  }

  return {
    ok: true,
    rebase: obj.rebaseMergeAllowed,
    mergeCommit: obj.mergeCommitAllowed,
    squash: obj.squashMergeAllowed,
    deleteBranchOnMerge: obj.deleteBranchOnMerge,
    defaultBranch: obj.defaultBranchRef.name,
  };
}

/**
 * `classifyChangedFiles` — O5 (TSPEC §4.6). Step 1 (`gh pr view --json
 * files`) is complete on its own whenever it returns fewer than
 * `pageLimit` well-formed entries — GitHub's own page size is the only
 * signal that step 1 might be truncated. A well-formed-but-full step 1, or
 * a step 1 that came back some other, non-array shape, escalates to the
 * step 2 fallback (`gh api --paginate --slurp .../files`); a step 1 whose
 * entries are individually malformed fails closed immediately, without
 * ever trying the fallback.
 *
 * @param {string|null} primaryRaw
 * @param {string|null} fallbackRaw
 * @param {{pageLimit?: number}} [opts]
 * @returns {{ok: true, files: string[]}|{ok: false, reason}}
 */
function classifyChangedFiles(primaryRaw, fallbackRaw, opts = {}) {
  const pageLimit = opts.pageLimit ?? MERGE_FILES_PAGE_LIMIT;

  if (primaryRaw !== null) {
    let obj;
    try {
      obj = JSON.parse(primaryRaw);
    } catch {
      return { ok: false, reason: "unparseable" };
    }
    const arr = obj?.files;
    if (Array.isArray(arr)) {
      const paths = [];
      for (const entry of arr) {
        if (!entry || typeof entry.path !== "string") {
          return { ok: false, reason: "unparseable" };
        }
        paths.push(entry.path);
      }
      if (paths.length < pageLimit) {
        return { ok: true, files: paths };
      }
      // Full page: possibly incomplete, fall through to the fallback below.
    }
    // A non-array `files` shape is treated the same way: not a hard
    // failure, just a signal that the fallback is needed.
  }

  if (fallbackRaw === null) return { ok: false, reason: "incomplete" };
  let pages;
  try {
    pages = JSON.parse(fallbackRaw);
  } catch {
    return { ok: false, reason: "incomplete" };
  }
  if (!Array.isArray(pages)) return { ok: false, reason: "incomplete" };

  const files = [];
  for (const page of pages) {
    if (!Array.isArray(page)) return { ok: false, reason: "incomplete" };
    for (const entry of page) {
      if (!entry || typeof entry.filename !== "string") {
        return { ok: false, reason: "incomplete" };
      }
      files.push(entry.filename);
      if (typeof entry.previous_filename === "string") {
        files.push(entry.previous_filename);
      }
    }
  }
  return { ok: true, files };
}

/**
 * `classifyMergeResult` — O6 (TSPEC §4.7). `gh pr merge` exiting zero is not
 * itself confirmation; the read-back (`gh pr view --json mergeCommit,state`)
 * must independently show `state: "MERGED"` with a string commit oid, or the
 * result is `not-confirmed` (TSPEC §7) rather than assumed successful.
 *
 * @param {string|null} mergeRaw - the merge command's own stdout, or null if it didn't run
 * @param {string|null} readbackRaw - the read-back command's stdout, or null if it didn't run
 * @returns {{ok: true, oid: string}|{ok: false, reason}}
 */
function classifyMergeResult(mergeRaw, readbackRaw) {
  if (mergeRaw === null) return { ok: false, reason: "command-failed" };
  if (readbackRaw === null) return { ok: false, reason: "command-failed" };
  let obj;
  try {
    obj = JSON.parse(readbackRaw);
  } catch {
    return { ok: false, reason: "unparseable" };
  }
  if (obj?.state === "MERGED" && obj?.mergeCommit && typeof obj.mergeCommit.oid === "string") {
    return { ok: true, oid: obj.mergeCommit.oid };
  }
  return { ok: false, reason: "not-confirmed" };
}

// ─── TSPEC §4.1 — the `_ghRun` transport seam's Node default ──────────────
//
// PLAN §12 A5. Mirrors `defaultGit`'s exact three-field contract and its
// exact `catch` shape (`err.stderr || err.message`), never throws. `gh`
// commands are single shell strings (unlike `git`'s argv array), so this
// uses `execSync`, matching `checkPrCi`'s existing default exactly.
async function defaultGhRun(command, { execFn } = {}) {
  const { execSync: realExecSync } = await import("child_process");
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));

  try {
    const stdout = exec(command, { stdio: "pipe", encoding: "utf8" });
    return { ok: true, stdout: String(stdout ?? ""), stderr: "" };
  } catch (err) {
    return {
      ok: false,
      stdout: "",
      stderr: String((err && (err.stderr || err.message)) ?? ""),
    };
  }
}

/**
 * `observePrState` — O1 (TSPEC §4.2). One `_ghRun` call, classified by
 * `classifyPrState`. Re-observation on `mergeable: UNKNOWN` is the caller's
 * (`decideMerge`/`phaseMerge`) responsibility, counted via `o1Count` — this
 * function itself is stateless.
 */
async function observePrState(prUrl, { _ghRun }) {
  const r = await _ghRun(mergeCommandFor("prState", { prUrl }));
  const raw = r && r.ok === true ? r.stdout : null;
  return classifyPrState(raw);
}

/**
 * `observeCi` — O2 (TSPEC §4.4). Reuses `checkPrCi` verbatim rather than
 * re-deriving CI classification: the raw rollup text is handed through via
 * an injected `execFn`, so `checkPrCi`'s own parsing/aggregation is never
 * duplicated. `defaultGhRun`'s failure contract always yields `stdout: ""`
 * (never `null`), which naturally fails `checkPrCi`'s internal `JSON.parse`
 * and yields `"unknown"` — no separate error branch is needed here.
 */
async function observeCi(prUrl, { _ghRun, _checkCi = checkPrCi }) {
  const r = await _ghRun(mergeCommandFor("ci", { prUrl }));
  const raw = r && r.ok === true ? r.stdout : "";
  return _checkCi(prUrl, { execFn: () => raw });
}

/**
 * `observeReviewThreads` — O3 (TSPEC §4.4). Bounded cursor pagination over
 * `classifyReviewThreads`, aggregating `unresolved` across pages. Exceeding
 * `MERGE_MAX_THREAD_PAGES` fails closed as `incomplete` rather than looping
 * forever or guessing partial state.
 */
async function observeReviewThreads(ref, { _ghRun }) {
  if (!ref) return { ok: false, reason: "unparseable" };

  let cursor;
  let unresolved = 0;
  for (let page = 0; page < MERGE_MAX_THREAD_PAGES; page++) {
    const r = await _ghRun(
      mergeCommandFor("reviewThreads", { owner: ref.owner, repo: ref.repo, number: ref.number, cursor }),
    );
    const raw = r && r.ok === true ? r.stdout : null;
    const parsed = classifyReviewThreads(raw);
    if (!parsed.ok) return parsed;
    unresolved += parsed.unresolved;
    if (!parsed.hasNextPage) return { ok: true, unresolved };
    cursor = parsed.endCursor;
  }
  return { ok: false, reason: "incomplete" };
}

/**
 * `observeRepoCaps` — O4 (TSPEC §4.5). One `_ghRun` call, no PR URL
 * involved — repo-level capabilities only.
 */
async function observeRepoCaps({ _ghRun }) {
  const r = await _ghRun(mergeCommandFor("repoCaps", {}));
  const raw = r && r.ok === true ? r.stdout : null;
  return classifyRepoCaps(raw);
}

/**
 * `observeChangedFiles` — O5 (TSPEC §4.6). Reuses `classifyChangedFiles`
 * itself to decide whether the fallback is needed at all, rather than
 * duplicating its completeness logic: a first pass with `fallbackRaw: null`
 * either resolves outright (short list, or a malformed entry failing
 * closed as `unparseable` without ever trying the fallback) or reports
 * `incomplete`, which is this function's own signal to fetch and re-run
 * classification with the fallback page attached. A missing `ref` when the
 * fallback would be needed fails closed as `incomplete` rather than
 * building an unparsable fallback command (TE-v3 N-01).
 */
async function observeChangedFiles(prUrl, ref, { _ghRun }) {
  const primary = await _ghRun(mergeCommandFor("changedFiles", { prUrl }));
  const primaryRaw = primary && primary.ok === true ? primary.stdout : null;

  const attempt = classifyChangedFiles(primaryRaw, null);
  if (attempt.ok === true) return attempt;
  if (attempt.reason === "unparseable") return attempt;

  if (!ref) return { ok: false, reason: "incomplete" };
  const fallback = await _ghRun(
    mergeCommandFor("changedFilesFallback", { owner: ref.owner, repo: ref.repo, number: ref.number }),
  );
  const fallbackRaw = fallback && fallback.ok === true ? fallback.stdout : null;
  return classifyChangedFiles(primaryRaw, fallbackRaw);
}

// ─── TSPEC §6 — Phase MERGE: the self-modification guard (O-M7) ────────────
//
// PLAN §12 A3. Implements FSPEC §4 / NFR-3. Two pure functions only — no IO,
// no clock, no config/env/argv read anywhere in either body (§6.3's no-
// override boundary, asserted by mergeGuard.test.js's source scan).

function isNonEmptyString(v) {
  return typeof v === "string" && v.length > 0;
}

/**
 * The effective guard-path set: `MERGE_GUARD_DEFAULTS` unioned with whatever
 * the caller configured, additively and unconditionally (TSPEC §6.1, FSPEC
 * §4.3). Defaults are never filtered, subtracted or re-ordered — a
 * configuration that lists fewer paths, none, or one shaped like a removal
 * (a `"!"`-prefixed string, say) is simply unioned in: it becomes a guard
 * path that matches nothing, silently, with no warning and no report line.
 * Non-string members are dropped; every configured string gains a trailing
 * `/` so a bare form and its slash-terminated twin are the same guard path.
 *
 * @param {*} configured - the config's `guardPaths` value, any shape
 * @returns {string[]} the de-duplicated effective guard-path set
 */
function effectiveGuardPaths(configured) {
  const extra = Array.isArray(configured) ? configured : [];
  const norm = (p) => (p.endsWith("/") ? p : `${p}/`);
  return [
    ...new Set([...MERGE_GUARD_DEFAULTS, ...extra.filter(isNonEmptyString).map(norm)]),
  ];
}

/**
 * The pure guard decision (TSPEC §6.2, FSPEC §4.2/§4.4). `changed` is O5's
 * classified changed-file observation, `{ ok: true, files: string[] }` or a
 * failure shape; anything not exactly `{ ok: true, ... }` fails CLOSED —
 * command failure, unparseable output, an absent `files` field and an
 * incomplete list all resolve as `ok !== true` one layer up (O5), so this
 * function's single check covers every one of them. Matching is
 * `String.prototype.startsWith`: case-sensitive, `/`-delimited (every guard
 * path ends in `/`), position-0 anchored — no globbing, no regex, no case
 * folding, no substring search.
 *
 * @param {{ok:boolean, files?: string[]}|null|undefined} changed - O5's observation
 * @param {string[]} guardPaths - the effective guard-path set
 * @returns {{fired:boolean, kind:"match"|"clear"|"unretrievable", matched:string[]}}
 */
function guardVerdict(changed, guardPaths) {
  if (!changed || changed.ok !== true) {
    return { fired: true, kind: "unretrievable", matched: [] }; // FSPEC §4.4
  }
  const matched = changed.files.filter((p) => guardPaths.some((g) => p.startsWith(g)));
  return { fired: matched.length > 0, kind: matched.length ? "match" : "clear", matched };
}

// ─── TSPEC §5 — Phase MERGE: the pure decision core ────────────────────────
//
// PLAN §12 A4. `decideMerge` is pure, total and demand-driven (TSPEC §5.1):
// one call in, one of three shapes out — `need` (the next observation to
// take), `act` (the next merge method to attempt) or `resolved` (a §11 row).
// It never loops, never calls IO/clock seams, and never mutates its
// arguments; the orchestrating step loop (the `for` loop that re-drives this
// function until it resolves, and the try/catch around the whole thing that
// maps a thrown/exhausted loop to `row: "internal"`, TSPEC §12 E21) is
// `phaseMerge`'s (A7), not this function's.

/**
 * FSPEC §5 / TSPEC §5.4 — the CI evidence rule, as a single lookup:
 * `mergeRequiresCi` relaxes exactly the `"none"` cell. `pending`, `failed`
 * and `unknown` refuse under both settings; `passed` always passes.
 *
 * @param {"passed"|"none"|"pending"|"failed"|"unknown"} ci
 * @param {boolean} requiresCi
 * @returns {{result:"pass"}|{result:"refused", row:string, reason:string, escalate:boolean}}
 */
function ciRule(ci, requiresCi) {
  if (ci === "passed") return { result: "pass" };
  if (ci === "none") {
    if (requiresCi) {
      return {
        result: "refused",
        row: "9",
        reason: "no CI checks reported and mergeRequiresCi is true",
        escalate: true,
      };
    }
    return { result: "pass" };
  }
  if (ci === "pending") {
    return { result: "refused", row: "10", reason: "CI is pending", escalate: false };
  }
  if (ci === "failed") {
    return { result: "refused", row: "10", reason: "CI failed", escalate: false };
  }
  // "unknown" — CI rollup could not be classified.
  return {
    result: "refused",
    row: "11",
    reason: "CI status could not be determined",
    escalate: false,
  };
}

function o1FieldUnreadable(o1) {
  return (
    o1.mergeable === UNRECOGNISED_SENTINEL ||
    o1.mergeStateStatus === UNRECOGNISED_SENTINEL ||
    o1.number === null
  );
}

/**
 * `mergeCandidates` — TSPEC §5.6 / FSPEC §6.1. Pure: builds the merge-method
 * candidate chain, in the fixed order rebase, merge, squash. Squash is
 * included only when BOTH the repository capability (`caps.squash`) and the
 * configuration (`config.allowSquashMerge === true`, strict equality) allow
 * it — under the shipped default (`allowSquashMerge: false`) squash is
 * absent from the returned array entirely, never merely skipped at attempt
 * time (PROP-M-11).
 *
 * @param {{rebase:boolean, mergeCommit:boolean, squash:boolean}} caps - O4's classified capabilities
 * @param {{allowSquashMerge:boolean}} config
 * @returns {Array<"rebase"|"merge"|"squash">}
 */
function mergeCandidates(caps, config) {
  const chain = [];
  if (caps && caps.rebase) chain.push("rebase");
  if (caps && caps.mergeCommit) chain.push("merge");
  if (config && config.allowSquashMerge === true && caps && caps.squash) chain.push("squash");
  return chain;
}

/**
 * `decideMerge(record, config)` — TSPEC §5.1–§5.3. See module docblock
 * above; guards are numbered and ordered exactly as TSPEC §5.3's table,
 * evaluated top to bottom, first match wins.
 *
 * `record` is the ObservationRecord (TSPEC §2.4): `{ prUrl, o1, o1Count, ci,
 * o3, o4, o5, attempts }`. `config` is a parsed merge config
 * (`MERGE_DEFAULTS`-shaped, TSPEC §3).
 *
 * @param {object} record
 * @param {object} config
 * @returns {
 *   {kind:"need", observation:string, waitMs?:number} |
 *   {kind:"act", method:"rebase"|"merge"|"squash"} |
 *   {kind:"resolved", row:string, mergeStatus:string, reason:string|null,
 *    escalations:string[], mergeSha:string|null, mergeMethod:string|null,
 *    defaultBranch?:string|null}
 * }
 */
function decideMerge(record, config) {
  // Guard 1 (§2.2 r2): mergeMode is "off".
  if (config.mergeMode === "off") {
    return {
      kind: "resolved",
      row: "2",
      mergeStatus: "skipped",
      reason: "mergeMode is off",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 2 (§2.2 r3): no PR URL from Phase PUB.
  if (!record.prUrl) {
    return {
      kind: "resolved",
      row: "6",
      mergeStatus: "deferred",
      reason: "no PR URL from Phase PUB",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 3 (§2.2 r4): O1 not yet observed.
  if (record.o1 === null) {
    return { kind: "need", observation: "O1" };
  }
  // Guard 4 (§2.2 r4): O1 whole-observation failure.
  if (!record.o1.ok) {
    return {
      kind: "resolved",
      row: "8",
      mergeStatus: "refused",
      reason: "PR state could not be determined",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 5 (§2.2 r5, §5.5): PR already MERGED. O4 is an OBSERVATION here,
  // never a precondition — only its default-branch name is consulted, and
  // its absence/failure never turns an already-merged PR into a refusal.
  if (record.o1.state === "MERGED") {
    if (record.o4 === null) {
      return { kind: "need", observation: "O4" };
    }
    return {
      kind: "resolved",
      row: "3",
      mergeStatus: "merged",
      reason: null,
      escalations: [],
      mergeSha: record.o1.mergeCommitOid ?? null,
      mergeMethod: "unknown",
      defaultBranch: record.o4.ok ? record.o4.defaultBranch : null,
    };
  }
  // Guard 6 (§2.2 r6): O5 not yet observed.
  if (record.o5 === null) {
    return { kind: "need", observation: "O5" };
  }
  const guardPaths = effectiveGuardPaths(config.guardPaths);
  const verdict = guardVerdict(record.o5, guardPaths);
  // Guard 7 (§2.2 r6): self-modification guard fired — a path matched.
  if (verdict.kind === "match") {
    const reason = `self-modification guard fired — matched paths: ${verdict.matched.join(", ")}`;
    return {
      kind: "resolved",
      row: "4",
      mergeStatus: "refused",
      reason,
      escalations: [`MERGE ESCALATION: self-modification guard fired for ${record.prUrl} — matched paths: ${verdict.matched.join(", ")}`],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 8 (§2.2 r6): self-modification guard fail-closed, O5 unretrievable.
  if (verdict.kind === "unretrievable") {
    return {
      kind: "resolved",
      row: "5",
      mergeStatus: "refused",
      reason: "changed-file list could not be retrieved",
      escalations: [`MERGE ESCALATION: self-modification guard fired for ${record.prUrl} — changed-file list could not be retrieved`],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 9 (§2.3 7a): PR is CLOSED.
  if (record.o1.state === "CLOSED") {
    return {
      kind: "resolved",
      row: "7",
      mergeStatus: "deferred",
      reason: "PR is CLOSED",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 10 (§2.3 7b): O2 (CI) not yet observed.
  if (record.ci === null) {
    return { kind: "need", observation: "O2" };
  }
  // Guard 11 (§2.3 7b, §5.4): the CI rule.
  const ci = ciRule(record.ci, config.mergeRequiresCi);
  if (ci.result === "refused") {
    return {
      kind: "resolved",
      row: ci.row,
      mergeStatus: "refused",
      reason: ci.reason,
      escalations: ci.escalate
        ? [`MERGE ESCALATION: CI evidence absent for ${record.prUrl} — no checks reported and mergeRequiresCi is true`]
        : [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 12 (§2.3 7c): mergeable / mergeStateStatus / number unparseable.
  if (o1FieldUnreadable(record.o1)) {
    return {
      kind: "resolved",
      row: "11a",
      mergeStatus: "refused",
      reason: "PR mergeability could not be determined",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 13 (§2.3 7c, §3.3): mergeable still UNKNOWN, bounded re-reads remain.
  if (record.o1.mergeable === "UNKNOWN" && record.o1Count <= config.mergeableRetries) {
    return { kind: "need", observation: "O1", waitMs: config.mergeableRetryDelay * 1000 };
  }
  // Guard 14 (§2.3 7c, §3.3): mergeable still UNKNOWN, retries exhausted.
  if (record.o1.mergeable === "UNKNOWN") {
    return {
      kind: "resolved",
      row: "13",
      mergeStatus: "deferred",
      reason: `mergeability still UNKNOWN after ${record.o1Count} observations`,
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 15 (§2.3 7c): CONFLICTING / DIRTY / BLOCKED.
  if (
    record.o1.mergeable === "CONFLICTING" ||
    record.o1.mergeStateStatus === "DIRTY" ||
    record.o1.mergeStateStatus === "BLOCKED"
  ) {
    return {
      kind: "resolved",
      row: "12",
      mergeStatus: "deferred",
      reason: `PR not mergeable (${record.o1.mergeable}/${record.o1.mergeStateStatus})`,
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 16 (§2.3 7d): O3 (review threads) not yet observed.
  if (record.o3 === null) {
    return { kind: "need", observation: "O3" };
  }
  // Guard 17 (§2.3 7d): O3 unretrievable/unparseable.
  if (!record.o3.ok) {
    return {
      kind: "resolved",
      row: "13a",
      mergeStatus: "refused",
      reason: "review-thread list could not be determined",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 18 (§2.3 7d): unresolved review threads remain.
  if (record.o3.unresolved > 0) {
    return {
      kind: "resolved",
      row: "14",
      mergeStatus: "deferred",
      reason: `${record.o3.unresolved} unresolved review thread(s)`,
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guard 19 (§2.3 7e): O4 (capabilities) not yet observed.
  if (record.o4 === null) {
    return { kind: "need", observation: "O4" };
  }
  // Guard 20 (§2.3 7e): O4 unretrievable/unparseable.
  if (!record.o4.ok) {
    return {
      kind: "resolved",
      row: "15",
      mergeStatus: "refused",
      reason: "merge-method capability could not be determined",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  const candidates = mergeCandidates(record.o4, config);
  // Guard 21 (r8): no permitted merge method.
  if (candidates.length === 0) {
    return {
      kind: "resolved",
      row: "16",
      mergeStatus: "deferred",
      reason: "no permitted merge method",
      escalations: [],
      mergeSha: null,
      mergeMethod: null,
    };
  }
  // Guards 22-24 (r8) drive the candidate chain. TSPEC §5.3 lists "an
  // untried candidate remains" (22) ahead of "the last attempt succeeded"
  // (23), but the only reading under which those two do not race is to
  // check success FIRST: once an attempt has succeeded the chain must stop
  // (NFR-2 — no more of the repo's merge surface is touched than the
  // decision needs), so an untried candidate remaining after a success must
  // never trigger another attempt.
  const attemptedMethods = record.attempts.map((a) => a.method);
  const lastAttempt = record.attempts[record.attempts.length - 1];
  if (lastAttempt && lastAttempt.ok) {
    return {
      kind: "resolved",
      row: "18",
      mergeStatus: "merged",
      reason: null,
      escalations: [],
      mergeSha: lastAttempt.oid ?? null,
      mergeMethod: lastAttempt.method,
    };
  }
  const nextCandidate = candidates.find((c) => !attemptedMethods.includes(c));
  if (nextCandidate) {
    return { kind: "act", method: nextCandidate };
  }
  // Guard 24: every candidate attempted, none succeeded.
  const reason = record.attempts.map((a) => `${a.method} failed (${a.detail})`).join("; ");
  return {
    kind: "resolved",
    row: "17",
    mergeStatus: "deferred",
    reason,
    escalations: [],
    mergeSha: null,
    mergeMethod: null,
  };
}

// ─── PLAN §12 A6 — merge execution and the post-merge helpers (TSPEC §7) ──
//
// `executeMerge` is O6 (§4.7): the phase's one mutating observation. The
// post-merge helpers — `deleteRemoteBranch` (M2, §7.2), `updateDefaultBranch`
// (M3, §7.4) and `evidenceCellFor` (§7.3) — run only once `decideMerge` has
// already resolved `merged`; none of them decide anything, they only report
// what they observed. All IO goes through the injected `_git` seam
// (`defaultGit`, `:5229`) — the same three-field `{ ok, stdout, stderr }`
// contract `_ghRun` uses, so every step below is a plain `if (!r.ok)`.

/** First line only — mirrors orchestrate-queue.js's `firstLine` exactly
 * (TSPEC §4.1); not imported across files because the runtime bundle forbids
 * cross-module `import` (build-runtime.mjs inlines each module standalone). */
function firstLine(text) {
  return String(text ?? "").split("\n")[0].trim();
}

/**
 * `executeMerge` — O6 (TSPEC §4.7). Issues exactly one `gh pr merge` variant
 * for `method`, then — only when that command itself exited zero —
 * independently reads back `gh pr view --json mergeCommit,state` and
 * classifies the pair via `classifyMergeResult`. A zero-exit merge command is
 * never itself confirmation; only the read-back is (FSPEC §6.2).
 *
 * `reason` is a two-member closed set, `"command-failed" | "not-confirmed"`
 * (§4.7): `classifyMergeResult`'s own third possibility, `"unparseable"`
 * (an unreadable read-back), is folded into `"not-confirmed"` here — the
 * read-back ran and simply did not establish `MERGED`, whatever shape its
 * output took. `detail` is always populated: the transport's first `stderr`
 * line when non-empty, else the fixed token `"merge not confirmed"`.
 *
 * @param {string} prUrl
 * @param {"rebase"|"merge"|"squash"} method
 * @param {{ _ghRun: function }} seams
 * @returns {Promise<{ok: true, oid: string}|{ok: false, reason: string, detail: string}>}
 */
async function executeMerge(prUrl, method, { _ghRun }) {
  const mergeResult = await _ghRun(mergeCommandFor("merge", { prUrl, method }));
  const mergeStderr = (mergeResult && mergeResult.stderr) || "";
  const detailFor = (stderr) => firstLine(stderr) || "merge not confirmed";

  if (!mergeResult || mergeResult.ok !== true) {
    return { ok: false, reason: "command-failed", detail: detailFor(mergeStderr) };
  }

  const readback = await _ghRun(mergeCommandFor("mergeReadback", { prUrl }));
  const readbackRaw = readback && readback.ok === true ? readback.stdout : null;
  const classified = classifyMergeResult(mergeResult.stdout, readbackRaw);
  if (classified.ok) return classified;

  const reason = classified.reason === "command-failed" ? "command-failed" : "not-confirmed";
  return { ok: false, reason, detail: detailFor(mergeStderr) };
}

/**
 * `evidenceCellFor` — TSPEC §7.3. A fixed 7-character truncation of the full
 * oid, never `git rev-parse --short` — the cell is then a pure function of
 * the observed value. `merged` is a literal token, never a SHA-shaped
 * placeholder.
 *
 * @param {string|null} mergeSha
 * @param {number} prNumber
 * @returns {string}
 */
function evidenceCellFor(mergeSha, prNumber) {
  return typeof mergeSha === "string" && mergeSha.length >= 7
    ? `${mergeSha.slice(0, 7)} #${prNumber}`
    : `merged #${prNumber}`;
}

/**
 * `deleteRemoteBranch` — M2 (TSPEC §7.2, FSPEC §6.4). One command through the
 * existing git seam: `git push origin --delete feat-{feature}`. The local
 * branch is never touched. A failure is reported plainly — it never becomes
 * an escalation and never changes `mergeStatus` (that decision belongs to
 * the caller, `phaseMerge`, A7).
 *
 * @param {{ feature: string, _git: function }} args
 * @returns {Promise<{ok: true}|{ok: false, reason: string}>}
 */
async function deleteRemoteBranch({ feature, _git }) {
  const branch = featureBranchName(feature);
  const result = await _git(["push", "origin", "--delete", branch]);
  if (result && result.ok === true) return { ok: true };
  const reason = firstLine(result && result.stderr) || "git push --delete failed";
  return { ok: false, reason };
}

/**
 * `updateDefaultBranch` — M3 (TSPEC §7.4, FSPEC §8.3). Every command goes
 * through the injected `_git(argv)` seam, whose contract never throws, so
 * this function contains no `try/catch` — each step is a plain `if (!r.ok)`.
 * `argv` arrays only, never command strings (a branch name is untrusted
 * input at the seam boundary).
 *
 * On any failure past step 0, an additional `rev-parse --abbrev-ref HEAD`
 * reports where the tree actually is (falling back to `"unknown"`) — the
 * escalation names the branch the operator must deal with, not the branch
 * the step intended to reach.
 *
 * @param {{ defaultBranch: string|null, mergeSha: string|null, _git: function }} args
 * @returns {Promise<{ok: true, branch: string}|{ok: false, reason: string, branch?: string}>}
 */
async function updateDefaultBranch({ defaultBranch, mergeSha, _git }) {
  if (defaultBranch == null) {
    return { ok: false, reason: "default branch name unavailable" };
  }

  const fail = async (reason) => {
    const abbrev = await _git(["rev-parse", "--abbrev-ref", "HEAD"]);
    const reported =
      abbrev && abbrev.ok === true ? String(abbrev.stdout ?? "").trim() : "";
    return { ok: false, reason, branch: reported || "unknown" };
  };

  // Step 1 — the tree must be clean before anything is checked out over it.
  const status = await _git(["status", "--porcelain"]);
  if (!status || status.ok !== true || String(status.stdout ?? "").trim() !== "") {
    return await fail("working tree is dirty");
  }

  // Step 2 — fetch the remote default branch, named by O4's own observation.
  const fetch = await _git(["fetch", "origin", defaultBranch]);
  if (!fetch || fetch.ok !== true) {
    return await fail(`git fetch failed: ${firstLine(fetch && fetch.stderr)}`);
  }

  // Step 3 — does the local branch exist yet? `!ok` is not itself a failure.
  const revParse = await _git([
    "rev-parse",
    "--verify",
    "--quiet",
    `refs/heads/${defaultBranch}`,
  ]);
  const branchExists = !!(revParse && revParse.ok === true);

  // Steps 4a/4b — check it out, creating it from FETCH_HEAD if it is new.
  const checkout = branchExists
    ? await _git(["checkout", defaultBranch])
    : await _git(["checkout", "-B", defaultBranch, "FETCH_HEAD"]);
  if (!checkout || checkout.ok !== true) {
    return await fail(`checkout failed: ${firstLine(checkout && checkout.stderr)}`);
  }

  // Step 5 — only when the branch already existed: replay any local
  // queue-row commits onto the fetched tip. One `rebase` covers both the
  // fast-forward case and the replay case (§7.4) — already-upstream commits
  // drop out as empty via `--empty=drop`, explicit so behaviour never
  // depends on the operator's rebase backend default.
  if (branchExists) {
    const rebase = await _git(["rebase", "--empty=drop", "FETCH_HEAD"]);
    if (!rebase || rebase.ok !== true) {
      await _git(["rebase", "--abort"]); // best-effort; result ignored
      return await fail(
        `replay of local queue-row commits onto ${defaultBranch} conflicted: ` +
          firstLine(rebase && rebase.stderr),
      );
    }
  }

  // Step 6 — the positive confirmation: the merge commit must be an
  // ancestor of HEAD after the update, turning a silently-wrong checkout
  // into a reported one. Exit-status only; no stdout is parsed for meaning.
  const ancestor = await _git(["merge-base", "--is-ancestor", mergeSha ?? "FETCH_HEAD", "HEAD"]);
  if (!ancestor || ancestor.ok !== true) {
    return await fail("merge commit is not an ancestor of HEAD after update");
  }

  return { ok: true, branch: defaultBranch };
}

// TSPEC §7.1/§10.2 — the plain (non-escalating) notice catalogue this phase
// emits (DC-01). A6 lands the constant here, closest to the M-helpers that
// produce most of its members, and resolves PROPERTIES §8's SE F-04 naming
// drift in the same commit: TSPEC §7.1's snippet writes the ahead-of-remote
// notice as a standalone `AHEAD_OF_REMOTE_NOTE(...)` while §10.2 names the
// frozen `MERGE_NOTES` catalogue — one symbol, `MERGE_NOTES.aheadOfRemote`,
// not two. The catalogue's remaining six members and every `notes.push(...)`
// call site belong to `phaseMerge` (A7), which extends this object literal
// rather than re-declaring it.
const MERGE_NOTES = Object.freeze({
  // FSPEC §8.2 — emitted once per merged run whose M4 disposition is
  // `recorded`; `defaultBranch` is always O4's own `defaultBranchRef.name`,
  // the same value M3 fetched, so the two cannot disagree.
  aheadOfRemote: (defaultBranch, feature) =>
    `Local ${defaultBranch} is ahead of its remote by the queue-row commit for ${feature}; ` +
    `pdlc does not push it — it reaches the remote with the next feature's PR.`,

  // FSPEC §9.4 — emitted once for every `deferred`/`refused` run, never for
  // `skipped`/`merged`. Exact text.
  mergeDeferred: (feature, reason) =>
    `Merge deferred for ${feature}: ${reason}. The queue row is unchanged; merge the PR to advance it.`,

  // TSPEC §3.3/§10.3 — the `merge` config section was present but not an
  // object; every setting fell back to its own default independently.
  sectionMalformed: () =>
    `.claude/pdlc.config.json's "merge" section is present but not an object; every merge setting is using its default.`,

  // TSPEC §7.5 — no PR number could be resolved from either `prUrl` or O1,
  // so the queue row is left untouched: no write, never "#null".
  noPrNumber: (feature, prUrl) =>
    `Queue row for ${feature} was not updated: no PR number could be resolved from ${prUrl}.`,

  // TSPEC §7.5/E19 — the queue write was made but not committed; `detail`
  // is `_recordQueueRow`'s own explanation, already a complete sentence.
  recordedUncommitted: (feature, detail) => `Queue row for ${feature}: ${detail}`,

  // FSPEC §2.5 — the queue row's current status is not one of the three
  // overwritable statuses, so nothing was written; `detail` names the
  // status found and is already a complete sentence.
  nonOverwrite: (feature, detail) => `Queue row for ${feature}: ${detail}`,

  // TSPEC §7.2/FSPEC §6.4 (M2) — best-effort remote branch deletion failed;
  // never an escalation, never changes mergeStatus.
  branchDeleteFailed: (feature, reason) =>
    `Remote branch deletion failed for ${feature}: ${reason}`,
});

// FSPEC §9.3 — the closed, 4-member escalation-text catalogue (DC-01):
// guard / CI / queue-not-updated / tree-not-updated. `decideMerge` (A4)
// already renders the guard-match, guard-unretrievable and CI-absent lines
// inline (it is pure and cannot import this catalogue's call site, since it
// predates it) — `guard` and `ci` below render byte-identical text from the
// same parameters so PROP-M-19's closure holds without `decideMerge` itself
// depending on this object. `queue`/`tree` are this phase's own (M3/M4)
// escalations and have no other renderer. Every member takes one object
// argument (TSPEC §7.1's own call shape for `tree`), never positional args.
const MERGE_ESCALATIONS = Object.freeze({
  guard: ({ prUrl, tail }) => `MERGE ESCALATION: self-modification guard fired for ${prUrl} — ${tail}`,
  ci: ({ prUrl }) =>
    `MERGE ESCALATION: CI evidence absent for ${prUrl} — no checks reported and mergeRequiresCi is true`,
  queue: ({ prUrl, shortSha, feature, detail }) =>
    `MERGE ESCALATION: merged ${prUrl} (${shortSha}) but the queue row for ${feature} was not updated — ${detail}`,
  tree: ({ prUrl, reason, branch }) =>
    `MERGE ESCALATION: working tree not updated after merging ${prUrl} — ${reason}; tree is on ${branch}`,
});

/**
 * `phaseMerge` — PLAN A7 (TSPEC §7, §10.4). The orchestrator: reads config
 * once (O-M5, §3.3), drives `decideMerge`'s demand/resolution loop (§5.2)
 * through the six `observe*`/`executeMerge` seams, then — only when the
 * core resolves `merged` — runs the M2–M4 post-merge sequence (§7.1) in
 * order: remote branch delete, default-branch update, queue write-back.
 * Never throws to the caller (FSPEC §2.1): the whole body past the enable
 * check is wrapped in `try/catch`, mapping any throw to
 * `{ mergeStatus: "refused", row: "internal" }`.
 *
 * `_enabled` and `_configPath` are the only two seams defaulted from a
 * module constant; every other seam is required so a test cannot
 * accidentally exercise production IO by omission (TE F-05).
 *
 * @param {{
 *   feature: string,
 *   prUrl: string|null,
 *   config?: object,
 *   _enabled?: boolean,
 *   _ghRun?: function,
 *   _git: function,
 *   _readFile: function,
 *   _recordQueueRow: function,
 *   _log?: function,
 *   _now?: function,
 *   _sleep?: function,
 *   _configPath?: string,
 * }} args
 * @returns {Promise<object>} MergeOutcome (TSPEC §2.4)
 */
async function phaseMerge({
  feature,
  prUrl,
  config: configOverride,
  _enabled = PHASE_MERGE_ENABLED,
  _ghRun = defaultGhRun,
  _git,
  _readFile,
  _recordQueueRow,
  _log,
  _now = () => Date.now(),
  _sleep = sleep,
  _configPath = MERGE_CONFIG_PATH,
}) {
  const skippedOutcome = (row, reason, notes = []) => ({
    mergeStatus: "skipped",
    mergeSha: null,
    mergeMethod: null,
    row: String(row),
    reason,
    escalations: [],
    notes,
    queueRow: null,
  });

  // FSPEC §2.2 row 1 — structural, not a checked precondition: no code path
  // below this line runs when the phase is disabled, so no read of the
  // config file happens either (§3.3).
  if (!_enabled) return skippedOutcome(1, "Phase MERGE disabled");

  try {
    const notes = [];

    let config = configOverride;
    if (!config) {
      // Exactly one read per run (O-M5, §3.3), skipped entirely when a test
      // (or a future caller) supplies `config` directly.
      const raw = await readMergeConfigSafely(_readFile, _configPath);
      const parsed = parseMergeConfig(raw);
      config = parsed.config;
      if (parsed.sectionMalformed) notes.push(MERGE_NOTES.sectionMalformed());
    }
    if (config.mergeMode === "off") return skippedOutcome(2, "mergeMode is off", notes);

    const record = {
      prUrl: prUrl ?? null,
      o1: null,
      o1Count: 0,
      ci: null,
      o3: null,
      o4: null,
      o5: null,
      attempts: [],
    };
    const ref = prUrl ? parsePrRef(prUrl) : null;

    const observe = {
      O1: () => observePrState(prUrl, { _ghRun }),
      O2: () => observeCi(prUrl, { _ghRun }),
      O3: () => observeReviewThreads(ref, { _ghRun }),
      O4: () => observeRepoCaps({ _ghRun }),
      O5: () => observeChangedFiles(prUrl, ref, { _ghRun }),
    };
    const slotFor = { O1: "o1", O2: "ci", O3: "o3", O4: "o4", O5: "o5" };

    // The demand-driven loop (§5.2). `decideMerge` is pure and total; every
    // IO call below is this orchestrator's own response to its demand.
    let d;
    let step = 0;
    for (; step < MERGE_MAX_DECISION_STEPS; step++) {
      d = decideMerge(record, config);
      if (d.kind === "resolved") break;
      if (d.kind === "act") {
        const result = await executeMerge(prUrl, d.method, { _ghRun });
        record.attempts.push({ method: d.method, ...result });
        continue;
      }
      if (d.waitMs) await _sleep(d.waitMs);
      record[slotFor[d.observation]] = await observe[d.observation]();
      if (d.observation === "O1") record.o1Count += 1;
    }
    if (!d || d.kind !== "resolved") {
      throw new Error("unreachable: decideMerge did not resolve");
    }

    const escalations = [...d.escalations];

    if (d.mergeStatus !== "merged") {
      // FSPEC §9.4 — one plain note for every deferred/refused run.
      notes.push(MERGE_NOTES.mergeDeferred(feature, d.reason));
      return {
        mergeStatus: d.mergeStatus,
        mergeSha: d.mergeSha,
        mergeMethod: d.mergeMethod,
        row: d.row,
        reason: d.reason,
        escalations,
        notes,
        queueRow: null,
      };
    }

    // ── merged — M2, M3, M4 (TSPEC §7.1) ──────────────────────────────────
    //
    // Row 3 (already MERGED) carries its own `defaultBranch` field (§5.5);
    // every other merged row reaches here only after guard 20 confirmed
    // `record.o4.ok`, so `record.o4.defaultBranch` is always readable then.
    const defaultBranch = Object.prototype.hasOwnProperty.call(d, "defaultBranch")
      ? d.defaultBranch
      : record.o4 && record.o4.ok
        ? record.o4.defaultBranch
        : null;

    // M2 — best-effort remote branch deletion; a plain note, never an
    // escalation, never changes mergeStatus.
    if (config.deleteBranchOnPdlcMerge) {
      const del = await deleteRemoteBranch({ feature, _git });
      if (!del.ok) notes.push(MERGE_NOTES.branchDeleteFailed(feature, del.reason));
    }

    // M3 — the default-branch update. Its escalation (if any) is pushed
    // after M4's below, so `escalations` ends up in FSPEC §9.3's table
    // order (guard, CI, queue-write, tree-update) regardless of which IO
    // step actually ran first.
    const tree = await updateDefaultBranch({ defaultBranch, mergeSha: d.mergeSha, _git });

    // M4 — the queue write-back (TSPEC §7.5). `prNumber`'s primary source
    // is the URL Phase PUB produced; `record.o1.number` is the fallback for
    // a `prUrl` shape `parsePrRef` cannot read. Absent both, the write is
    // skipped with a plain note rather than writing "#null".
    const prNumber = parsePrRef(prUrl)?.number ?? record.o1?.number ?? null;
    let queueRow = null;
    if (prNumber === null) {
      notes.push(MERGE_NOTES.noPrNumber(feature, prUrl));
    } else {
      const evidence = evidenceCellFor(d.mergeSha, prNumber);
      const rec = await _recordQueueRow({ feature, status: "done", evidence });
      queueRow = rec && rec.queueRow ? rec.queueRow : null;
      if (queueRow === "error") {
        const shortSha =
          typeof d.mergeSha === "string" && d.mergeSha.length >= 7
            ? d.mergeSha.slice(0, 7)
            : "sha unknown";
        escalations.push(
          MERGE_ESCALATIONS.queue({
            prUrl,
            shortSha,
            feature,
            detail: (rec && rec.detail) || "queue row not found",
          }),
        );
      } else if (queueRow === "recorded (uncommitted)") {
        notes.push(
          MERGE_NOTES.recordedUncommitted(
            feature,
            (rec && rec.detail) || "queue row recorded but not committed",
          ),
        );
      } else if (queueRow === "recorded") {
        // FSPEC §8.2 — emitted whenever M4's disposition is `recorded`,
        // including row 3's already-merged re-entry (§7.1's Q-01 answer).
        notes.push(MERGE_NOTES.aheadOfRemote(defaultBranch, feature));
        if (rec && rec.detail) notes.push(MERGE_NOTES.nonOverwrite(feature, rec.detail));
      }
    }

    if (!tree.ok) {
      escalations.push(
        MERGE_ESCALATIONS.tree({ prUrl, reason: tree.reason, branch: tree.branch ?? "unknown" }),
      );
    }

    return {
      mergeStatus: "merged",
      mergeSha: d.mergeSha,
      mergeMethod: d.mergeMethod,
      row: d.row,
      reason: d.reason,
      escalations,
      notes,
      queueRow,
    };
  } catch (err) {
    // FSPEC §2.1 — Phase MERGE never throws to the pipeline. E30/E21 (§12):
    // the outer catch is the single enforcement point for that guarantee.
    return {
      mergeStatus: "refused",
      mergeSha: null,
      mergeMethod: null,
      row: "internal",
      reason: err && err.message ? err.message : "phaseMerge failed unexpectedly",
      escalations: [],
      notes: [],
      queueRow: null,
    };
  }
}

// MODEL-01: per-phase model selection. Every phase runs on Opus for reasoning
// depth EXCEPT the Phase I implementation batches, which run on Sonnet for
// throughput/cost. Passed to the runtime via the agent() opts.model field.
const MODEL_DEFAULT = "opus"; // all phases except Phase I

// ── TSPEC §4.8 — review-loop / authoring budgets ───────────────────────────────
// Module-level, not main() parameters: they are policy, not capability, and the
// workflow runtime's bundle has no configuration channel to override them from.
// They are deliberately NOT exported — an export widens the bundle's published
// surface for no caller. Tests reach them through observable behaviour (round
// windows, dispatch counts), the same discipline DOD_MAX_ITERATIONS lives under.

// TSPEC-ROUNDS-01: per-invocation review-round budget (AC-1.6a). NOT an absolute
// round index — the gate and the reported counts derive from this plus the
// branch-derived starting index.
const MAX_REVIEW_ROUNDS = 5;

const MAX_AUTHORING_ATTEMPTS = 3; // consecutive no-progress dispatches, per episode
const MAX_AUTHORING_DISPATCHES = 6; // total dispatches, per episode
const MAX_AUTHORING_WRITE_BYTES = 12000; // per-tool-call emission ceiling stated to authors

// ── TSPEC §4.1 — the four closed failure catalogues (DC-01) ────────────────────
// Frozen so a test can enumerate them and a switch can be checked exhaustive.
// §4.2: `dir_missing` is the sole benign ListFailure; the other three mean
// "cannot judge" and halt.
const LIST_FAILURES = Object.freeze([
  "dir_missing",
  "not_a_directory",
  "unreadable",
  "bad_argument",
]);
const FILENAME_FAILURES = Object.freeze([
  "not_cross_review",
  "bad_role",
  "bad_doc_type",
  "bad_round",
  "trailing_junk",
]);
const HASH_FAILURES = Object.freeze(["absent", "duplicated", "unparseable"]);
const TRAILER_FAILURES = Object.freeze([
  "declared_incomplete",
  "absent",
  "duplicated",
  "unparseable",
]);

const MODEL_IMPLEMENTATION = "sonnet"; // Phase I se-implement batches only

// TSPEC-SCRIPT-03: Exported meta object
const meta = {
  name: "orchestrate-dev",
  description: "Full PDLC pipeline orchestrator — REQ to harvest.",
  inputs: [
    {
      name: "reqPath",
      description:
        "Path to the approved REQ document, e.g. docs/{feature}/REQ-{feature}.md",
      type: "string",
      required: true,
    },
    {
      name: "forcePhases",
      description:
        "Optional comma- or space-separated phases to re-run despite a recorded approval. Valid: R, F, T, P, D, PR, all.",
      type: "string",
      required: false,
    },
  ],
};

// TSPEC-DISPATCH-01: Normative Phase Dispatch Table
const PHASE_DISPATCH = {
  R: {
    phase: "R",
    label: "REQ Cross-Review",
    creator: null,
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
  },
  F: {
    phase: "F",
    label: "FSPEC Creation + Review",
    creator: "pm-author",
    creatorInputs: ["REQ"],
    creatorOutputPath: "docs/{feature}/FSPEC-{feature}.md",
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
  },
  T: {
    phase: "T",
    label: "TSPEC Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC"],
    creatorOutputPath: "docs/{feature}/TSPEC-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  D: {
    phase: "D",
    label: "DECISIONS Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC"],
    creatorOutputPath: "docs/{feature}/DECISIONS-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  P: {
    phase: "P",
    label: "PLAN Creation + Review",
    creator: "se-author",
    // DECISIONS input is conditional — append if DECISIONS doc exists on branch
    creatorInputs: ["REQ", "FSPEC", "TSPEC", "DECISIONS?"],
    creatorOutputPath: "docs/{feature}/PLAN-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  PR: {
    phase: "PR",
    label: "PROPERTIES Creation + Review",
    creator: "te-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC", "PLAN"],
    creatorOutputPath: "docs/{feature}/PROPERTIES-{feature}.md",
    reviewers: ["pm-review", "se-review"],
    optimizer: "te-author",
  },
  CR: {
    phase: "CR",
    label: "Final Codebase Review",
    creator: null,
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
  },
  DOD: {
    phase: "DOD",
    label: "Definition of Done Verification",
    verifier: "dod-verify",
    remediator: "se-implement",
  },
};

// ─── Halt helper ───────────────────────────────────────────────────────────────

/**
 * Creates a halt error with the given message.
 * @param {string} message
 * @returns {Error}
 */
function haltError(message, fields) {
  const err = new Error(message);
  err.isHalt = true;
  // §4.7: a halt that already KNOWS its disposition carries it, so `main()`'s
  // catch reports the fact rather than re-deriving it from a second `_checkFile`.
  if (fields && typeof fields === "object") Object.assign(err, fields);
  return err;
}

// ─── Branch guard — every commit of a run lands on feat-{feature} ─────────────
//
// The failure this exists for: nothing in the pipeline ever established the
// feature branch. A session whose working tree happened to sit on the default
// branch ran a whole review round there — cross-reviews, REQ revisions and the
// queue row were committed and pushed to `main`. The only mention of the branch
// was a "check out or create the feature branch" step inside the reviewer SKILL
// files, which is both skippable and racy: the two reviewers of a round run in
// PARALLEL in ONE shared working tree, so a checkout by either of them is a
// mutation the other never asked for. The branch is therefore established ONCE,
// by the orchestrator, before any phase runs, and the agents are told not to
// touch it.

/** The branch a feature's every commit belongs on. */
function featureBranchName(feature) {
  return `feat-${String(feature ?? "").trim()}`;
}

/**
 * The git transport the branch guard is allowed to ACT on.
 *
 * The guard is the one thing in this module that mutates the checkout, so it
 * runs only against an **injected** seam. Every production entrypoint injects
 * one (`rtDevInjections`'s `_git: rtGit`, for both the dev and the queue
 * bundle); a unit test that injects none keeps `defaultGit`, and must never
 * have its own worktree checked out from under it by a pipeline under test.
 * Absent transport ⇒ the guard reports that it is inert rather than pretending
 * it verified anything.
 *
 * @param {function|undefined} _git
 * @returns {function|null}
 */
function branchGuardTransport(_git) {
  return typeof _git === "function" && _git !== defaultGit ? _git : null;
}

/** The branch name `git rev-parse --abbrev-ref HEAD` reported, or null. */
function parseAbbrevRef(result) {
  if (!result || result.ok !== true) return null;
  const name = String((result && result.stdout) ?? "").trim();
  return name === "" ? null : name;
}

/** The one-line operator instruction every branch-guard halt ends with. */
function branchGuardRemedy(branch) {
  return `Check out ${branch} yourself (git checkout -B ${branch}) and re-invoke; nothing was committed.`;
}

/**
 * Place the working tree on `feat-{feature}` — called ONCE at pipeline entry,
 * before any phase runs.
 *
 * | HEAD reads | action |
 * |---|---|
 * | `feat-{feature}` | nothing — already there |
 * | anything else, branch exists | `git checkout feat-{feature}` |
 * | anything else, branch absent | `git checkout -b feat-{feature}` |
 *
 * Every other outcome HALTS. That includes the checkout *reporting* success
 * while HEAD still names another branch: the post-checkout `rev-parse` is a
 * second, independent observation, because "the command exited 0" and "the tree
 * is on the branch" are not the same claim, and it is the second one the rest
 * of the pipeline depends on.
 *
 * @param {{feature: string, _git?: function, _log?: function}} params
 * @returns {Promise<{ok: true, branch: string, action: "already-on"|"checked-out"|"created"|"skipped"}>}
 */
async function ensureFeatureBranch({ feature, _git, _log } = {}) {
  const branch = featureBranchName(feature);
  const emit = typeof _log === "function" ? _log : log;
  const git = branchGuardTransport(_git);
  if (!git) {
    emit(`Branch guard: inert — no git seam injected, ${branch} was not verified.`);
    return { ok: true, branch, action: "skipped" };
  }

  const head = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
  const current = parseAbbrevRef(head);
  if (current === null) {
    throw haltError(
      `Error: branch guard — could not read the current branch ` +
        `(git rev-parse --abbrev-ref HEAD failed: ${String((head && head.stderr) || "no output").trim()}). ` +
        `Refusing to run the pipeline without knowing that commits will land on ${branch}. ` +
        branchGuardRemedy(branch)
    );
  }
  if (current === branch) return { ok: true, branch, action: "already-on" };

  // An existing branch first; `-b` only when the plain checkout could not find
  // one. Ordered this way round so a branch that already carries work is joined,
  // never shadowed by a fresh one cut from wherever HEAD happened to be.
  let action = "checked-out";
  const checkout = await git(["checkout", branch]);
  if (!checkout || checkout.ok !== true) {
    const created = await git(["checkout", "-b", branch]);
    if (!created || created.ok !== true) {
      throw haltError(
        `Error: branch guard — the working tree is on "${current}" and neither ` +
          `\`git checkout ${branch}\` nor \`git checkout -b ${branch}\` succeeded ` +
          `(${String((created && created.stderr) || (checkout && checkout.stderr) || "no output").trim()}). ` +
          `Refusing to run: every commit of this run would land on "${current}". ` +
          branchGuardRemedy(branch)
      );
    }
    action = "created";
  }

  const after = parseAbbrevRef(await git(["rev-parse", "--abbrev-ref", "HEAD"]));
  if (after !== branch) {
    throw haltError(
      `Error: branch guard — after checking out ${branch} the working tree is still on ` +
        `"${after ?? "an unreadable branch"}". Refusing to run: every commit of this run would ` +
        `land there. ` +
        branchGuardRemedy(branch)
    );
  }

  emit(`Branch guard: working tree is on ${branch} (${action}).`);
  return { ok: true, branch, action };
}

/**
 * The cheap re-check, run at every `reviewLoop` entry: read HEAD and halt if it
 * is no longer `feat-{feature}`.
 *
 * Deliberately **verify-only, never a checkout**. By the time a phase is
 * running, dispatched agents may be mid-flight in the same working tree, and a
 * checkout underneath them would corrupt work in progress. A tree that drifted
 * between phases is an operator problem, and the only safe act is to stop before
 * the round's cross-reviews are committed somewhere else — which is exactly the
 * failure this guard exists for.
 *
 * @param {{feature: string, context?: string, _git?: function, _log?: function}} params
 * @returns {Promise<{ok: true, branch: string, verified: boolean}>}
 */
async function verifyFeatureBranch({ feature, context, _git, _log } = {}) {
  const branch = featureBranchName(feature);
  const git = branchGuardTransport(_git);
  if (!git) return { ok: true, branch, verified: false };

  const where = context ? ` before ${context}` : "";
  const current = parseAbbrevRef(await git(["rev-parse", "--abbrev-ref", "HEAD"]));
  if (current === branch) return { ok: true, branch, verified: true };

  throw haltError(
    `Error: branch guard${where} — the working tree is on ` +
      `"${current ?? "an unreadable branch"}", not ${branch}. Refusing to continue: ` +
      `this round's commits would land there. ` +
      branchGuardRemedy(branch)
  );
}

// ─── Deterministic file-existence check (replaces the guard agent) ────────────

/**
 * Verify a file exists and is non-empty. Deterministic replacement for the
 * former `guard` agent's file-existence check — a filesystem read needs no LLM.
 * A size-0 file, or one whose contents are whitespace-only, counts as empty.
 * Mirrors mergeWorktree's injectable-dependency style via the `fsMod` param.
 *
 * @param {string} path
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {{ ok: true } | { ok: false, reason: "file_missing" | "file_empty" }}
 */
function checkFileNonEmpty(path, { fsMod = fs } = {}) {
  if (!path || (typeof path === "string" && path.trim() === "")) {
    return { ok: false, reason: "file_missing" };
  }
  try {
    if (!fsMod.existsSync(path)) {
      return { ok: false, reason: "file_missing" };
    }
    const stat = fsMod.statSync(path);
    if (stat.size === 0) {
      return { ok: false, reason: "file_empty" };
    }
    const contents = fsMod.readFileSync(path, "utf8");
    if (typeof contents === "string" && contents.trim() === "") {
      return { ok: false, reason: "file_empty" };
    }
  } catch {
    return { ok: false, reason: "file_missing" };
  }
  return { ok: true };
}

// ─── TSPEC-IMPL-01: parsePlanTasks — deterministic PLAN task-table parse ───────

/**
 * Parse a PLAN markdown task table into the DAG task list the implementation
 * phase batches over. Deterministic replacement for the former se-author DAG
 * agent — a markdown table needs no LLM to read.
 *
 * Header row is matched case-insensitively and tolerates column-order variation
 * (mirrors parseQueue's header-mapping approach). A parseable table needs at
 * minimum an id column and a dependencies column; without both this returns null
 * so the caller can fall back to the agent path. The dependencies cell is a
 * comma/space separated list of ids, with "-"/"—"/"none"/"" meaning none.
 *
 * @param {string | null | undefined} markdown - Raw PLAN.md contents
 * @returns {{ tasks: Array<{ id: string, description: string, dependencies: string[], planBatch: number|undefined }> } | null}
 */
function parsePlanTasks(markdown) {
  if (markdown == null || typeof markdown !== "string") return null;

  const rows = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));
  if (rows.length === 0) return null;

  const isIdCell = (c) => c === "#" || c.includes("id");
  const isDepsCell = (c) =>
    c.includes("depend") || c.includes("deps") || c.includes("prereq");
  const isDescCell = (c) =>
    c.includes("desc") ||
    c.includes("task") ||
    c.includes("summary") ||
    c.includes("name") ||
    c.includes("title");
  const isBatchCell = (c) =>
    c.includes("batch") || c.includes("phase") || c.includes("wave");

  // Locate the header row: the first pipe row that carries both an id-like and a
  // dependencies-like column. Without an explicit dependency column the DAG can't
  // be derived from the table alone — return null and let the agent path read it.
  let cols = null;
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const cells = splitPipeRow(rows[i]).map((c) => c.toLowerCase());
    if (cells.some(isIdCell) && cells.some(isDepsCell)) {
      cols = cells;
      headerIdx = i;
      break;
    }
  }
  if (!cols) return null;

  const findCol = (pred, exclude = -1) => {
    for (let i = 0; i < cols.length; i++) {
      if (i === exclude) continue;
      if (pred(cols[i])) return i;
    }
    return -1;
  };

  const idIdx = findCol(isIdCell);
  const depsIdx = findCol(isDepsCell);
  const descIdx = findCol(isDescCell, idIdx);
  const batchIdx = findCol(isBatchCell);
  if (idIdx < 0 || depsIdx < 0) return null;

  const tasks = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const cells = splitPipeRow(rows[i]);
    // Skip the markdown separator row (|---|---|).
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;

    const id = (cells[idIdx] || "").trim();
    if (!id) continue;

    const description = descIdx >= 0 ? (cells[descIdx] || "").trim() : "";
    const dependencies = parsePlanDepsCell(cells[depsIdx]);

    let planBatch;
    if (batchIdx >= 0) {
      const raw = (cells[batchIdx] || "").trim();
      const m = raw.match(/\d+/);
      if (m) planBatch = parseInt(m[0], 10);
    }

    tasks.push({ id, description, dependencies, planBatch });
  }

  if (tasks.length === 0) return null;
  return { tasks };
}

/** Split a markdown table row on pipes, trimming leading/trailing pipe + cells. */
function splitPipeRow(row) {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

/** Parse a dependencies cell: comma/space list of ids; "-"/"—"/"none"/"" ⇒ []. */
function parsePlanDepsCell(cell) {
  if (!cell) return [];
  const trimmed = cell.trim();
  if (
    trimmed === "" ||
    trimmed === "-" ||
    trimmed === "—" ||
    trimmed === "–" ||
    trimmed.toLowerCase() === "none"
  ) {
    return [];
  }
  return trimmed
    .split(/[\s,]+/)
    .map((d) => d.trim())
    .filter(
      (d) =>
        d &&
        d !== "-" &&
        d !== "—" &&
        d !== "–" &&
        d.toLowerCase() !== "none"
    );
}

// ─── TSPEC-PARSE-01: parseVerdict ─────────────────────────────────────────────

/**
 * The closed verdict catalogue (TSPEC §3.9, §5.9; FSPEC §16.3).
 *
 * Lifted out of `parseVerdict`'s body to module scope — the same single-source
 * move RLH-05 made for `reviewerRoleSlug`'s `MAP`, and for the same reason: §5.9's
 * cross-review completeness criterion asks "is at least one `VERDICT: ` value in
 * the catalogue?", and a second, hand-copied catalogue beside this one is exactly
 * the desync defect this feature exists to remove (TSPEC §3.9 — "reused verbatim",
 * one grammar family, three carriers).
 *
 * `parseVerdict` itself is otherwise untouched: same reverse-scan, same
 * `malformed: true` fallback, same returns for every input (PLAN §12.3).
 */
const VALID_VERDICTS = Object.freeze([
  "Approved",
  "Approved with minor changes",
  "Needs revision",
]);

/**
 * Extract VERDICT from a reviewer agent result string.
 *
 * When the trailer is missing or malformed (any path that logs the "returned no
 * VERDICT" warning) the fallback additionally carries `malformed: true` so the
 * caller can distinguish a genuine "Needs revision" verdict from an unparseable
 * response and attempt a cheap trailer recovery. Genuine parses — including the
 * truncated-output zero-counts case — never set `malformed`. The extra field is
 * additive: existing consumers only read verdict/high/medium/low.
 *
 * @param {string | null | undefined} result - Raw agent result
 * @param {string} skillName - Reviewer skill identifier for warning messages
 * @returns {{ verdict: string, high: number, medium: number, low: number, malformed?: boolean }}
 */
function parseVerdict(result, skillName) {
  const fallback = {
    verdict: "Needs revision",
    high: 0,
    medium: 0,
    low: 0,
    malformed: true,
  };

  if (result == null || (typeof result === "string" && result.trim() === "")) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  const lines = result.split("\n");
  const reversed = lines.slice().reverse();

  let verdictLine = null;
  let verdictLineIndex = -1;

  for (let i = 0; i < reversed.length; i++) {
    const trimmed = reversed[i].trim();
    if (trimmed.startsWith("VERDICT: ")) {
      verdictLine = trimmed;
      verdictLineIndex = lines.length - 1 - i;
      break;
    }
  }

  if (verdictLine === null) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  const rawVerdict = verdictLine.slice("VERDICT: ".length).trim();

  if (!VALID_VERDICTS.includes(rawVerdict)) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  // Find next non-empty line after the VERDICT line
  let nextNonEmpty = null;
  for (let j = verdictLineIndex + 1; j < lines.length; j++) {
    if (lines[j].trim() !== "") {
      nextNonEmpty = lines[j].trim();
      break;
    }
  }

  // Truncated-output special case (TSPEC-PARSE-03)
  if (nextNonEmpty === null) {
    return { verdict: rawVerdict, high: 0, medium: 0, low: 0 };
  }

  // Parse JSON
  let parsed = null;
  try {
    parsed = JSON.parse(nextNonEmpty);
  } catch {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  // Validate JSON structure: exactly keys {high, medium, low}, all non-negative integers
  const keys = Object.keys(parsed).sort();
  if (
    keys.length !== 3 ||
    keys[0] !== "high" ||
    keys[1] !== "low" ||
    keys[2] !== "medium"
  ) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  if (
    !Number.isInteger(parsed.high) ||
    parsed.high < 0 ||
    !Number.isInteger(parsed.medium) ||
    parsed.medium < 0 ||
    !Number.isInteger(parsed.low) ||
    parsed.low < 0
  ) {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

  return {
    verdict: rawVerdict,
    high: parsed.high,
    medium: parsed.medium,
    low: parsed.low,
  };
}

// ─── TSPEC-PARSE-05: parseDecisionsWarranted ──────────────────────────────────

/**
 * Extract DECISIONS_WARRANTED value from an se-author post-PASS result.
 * @param {string | null | undefined} result - Raw agent result
 * @returns {boolean}  true if warranted (or absent/malformed); false only on explicit false
 */
function parseDecisionsWarranted(result) {
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    log(
      "WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"
    );
    return true;
  }

  const lines = result.split("\n");
  const reversed = lines.slice().reverse();

  for (const line of reversed) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DECISIONS_WARRANTED: ")) {
      const rawValue = trimmed
        .slice("DECISIONS_WARRANTED: ".length)
        .trim()
        .toLowerCase();
      if (rawValue === "true") {
        return true;
      }
      if (rawValue === "false") {
        return false;
      }
      // value not recognized — fall through to absent handling
      break;
    }
  }

  // Field absent or value not recognized
  log(
    "WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"
  );
  return true;
}

// ─── TSPEC §5.0 — the one fenced-region-aware scanner ─────────────────────────

/**
 * Visit every line of `text` that lies OUTSIDE a fenced code region.
 *
 * FSPEC §1.2 rule 5 governs every mechanical scan this pipeline performs over a
 * markdown artifact; it is expressed here once and every scanner calls it. There
 * is no per-site fence handling anywhere else.
 *
 * Three properties the callers depend on:
 *  1. A closer must use the same fence character and a run at least as long as
 *     the opener — a three-backtick line inside a four-backtick block is content,
 *     which is exactly the case a quoted fenced template produces.
 *  2. An unclosed fence swallows the remainder of the file. That fails closed in
 *     the correct direction: fewer matches, so a phase runs rather than skipping.
 *  3. The exclusion governs which lines may *match a scanned pattern*; it does
 *     not empty a section's body (§5.9 counts a fenced block as body content).
 *
 * Total: any input is coerced, nothing throws, the return is undefined.
 *
 * @param {string} text - the artifact text.
 * @param {function(string, number): void} visit - called as `visit(line, index)`
 *   for each unfenced line, where `index` is the line's index in `text.split("\n")`.
 * @returns {void}
 */
function scanLines(text, visit) {
  const lines = String(text ?? "").split("\n");
  let fenceChar = null; // "`" | "~" | null
  let fenceLen = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceChar === null) {
      if (m) {
        fenceChar = m[1][0];
        fenceLen = m[1].length;
      } // opener: the line is not visited
      else visit(line, i);
    } else if (m && m[1][0] === fenceChar && m[1].length >= fenceLen) {
      fenceChar = null;
      fenceLen = 0; // closer: the line is not visited
    }
    // lines inside a fence, and the fence lines themselves, are never visited
  }
}

// ─── TSPEC §5.3 — the content digest: inlined, pure, no seam ──────────────────
//
// The workflow runtime has no `crypto` and no `TextEncoder`, so SHA-256 and the
// UTF-8 encoding beneath it are hand-rolled here in `Number`-only arithmetic (no
// `BigInt`). This family is deliberately NOT a seam: a seam exists to reach a
// capability the runtime lacks, and a deterministic synchronous digest over an
// in-memory string needs none — a seam would only add an awaitable boundary on
// the hot path of every approval comparison and let a double return a hash the
// production code never computes (§3.7).

/**
 * Canonicalise `text` before it is digested.
 *
 * N-1 normalises line endings (CRLF and lone CR both become LF); N-2 forces
 * exactly one trailing newline. Both are applied INSIDE `sha256Hex`, never by a
 * caller, so no two call sites can disagree about which bytes were digested —
 * the defect class where a write path and a read path produce different hashes
 * and every approval reads STALE.
 *
 * Total and idempotent: `canonicaliseForDigest(canonicaliseForDigest(t))` is
 * `canonicaliseForDigest(t)` for every input, including `null` and `undefined`.
 *
 * @param {string} text
 * @returns {string} the canonical form — LF-only, exactly one trailing newline.
 */
function canonicaliseForDigest(text) {
  const lf = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n"); // N-1
  return lf.replace(/\n*$/, "\n"); // N-2
}

/**
 * Encode `text` as UTF-8, by hand, because the runtime has no `TextEncoder`.
 *
 * Surrogate pairs are combined into their astral scalar value (the case a wrong
 * encoder gets wrong); an UNPAIRED surrogate is encoded as the three-byte form
 * of its own code unit, which is deterministic and total rather than throwing.
 *
 * @param {string} text
 * @returns {number[]} the bytes, each in 0…255.
 */
function utf8Bytes(text) {
  const s = String(text ?? "");
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const cp = s.codePointAt(i);
    if (cp > 0xffff) i++; // a well-formed surrogate pair consumed two code units
    if (cp < 0x80) {
      out.push(cp);
    } else if (cp < 0x800) {
      out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    }
  }
  return out;
}

/** SHA-256 round constants (FIPS 180-4) — the first 32 bits of the fractional
 *  parts of the cube roots of the first 64 primes. */
const SHA256_K = [
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

/** Right-rotate a 32-bit word. */
function rotr32(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/** Two 32-bit words added modulo 2^32. Both operands are < 2^32, so the sum is
 *  < 2^33 and therefore exactly representable as a `Number` before truncation. */
function add32(a, b) {
  return (a + b) >>> 0;
}

/**
 * SHA-256 of `text`, as 64 lowercase hex characters.
 *
 * `canonicaliseForDigest` is applied HERE, inside the digest, so no call site can
 * digest un-canonicalised bytes (§5.3 N-1/N-2) — that is the whole reason this
 * function, and not its callers, owns the normalisation.
 *
 * `Math`, `>>>`, `|`, `^` and `Number` only: no `crypto`, no `BigInt`, no
 * `TextEncoder` (C-2).
 *
 * @param {string} text
 * @returns {string} 64 lowercase hex characters.
 */
function sha256Hex(text) {
  const bytes = utf8Bytes(canonicaliseForDigest(text));

  // Message length in BITS, as two 32-bit halves — `bytes.length * 8` can exceed
  // 2^32, and `<<` would silently wrap.
  const bitLenHi = Math.floor((bytes.length * 8) / 4294967296) >>> 0;
  const bitLenLo = (bytes.length * 8) % 4294967296 >>> 0;

  const padded = bytes.slice();
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  padded.push(
    (bitLenHi >>> 24) & 0xff,
    (bitLenHi >>> 16) & 0xff,
    (bitLenHi >>> 8) & 0xff,
    bitLenHi & 0xff,
    (bitLenLo >>> 24) & 0xff,
    (bitLenLo >>> 16) & 0xff,
    (bitLenLo >>> 8) & 0xff,
    bitLenLo & 0xff
  );

  // Initial hash values: the fractional parts of the square roots of the first
  // eight primes.
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Array(64);
  for (let block = 0; block < padded.length; block += 64) {
    for (let t = 0; t < 16; t++) {
      const o = block + t * 4;
      w[t] =
        ((padded[o] << 24) |
          (padded[o + 1] << 16) |
          (padded[o + 2] << 8) |
          padded[o + 3]) >>>
        0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = (rotr32(w[t - 15], 7) ^ rotr32(w[t - 15], 18) ^ (w[t - 15] >>> 3)) >>> 0;
      const s1 = (rotr32(w[t - 2], 17) ^ rotr32(w[t - 2], 19) ^ (w[t - 2] >>> 10)) >>> 0;
      w[t] = add32(add32(w[t - 16], s0), add32(w[t - 7], s1));
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = (rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = add32(add32(add32(h, S1), add32(ch, SHA256_K[t])), w[t]);
      const S0 = (rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = add32(S0, maj);

      h = g;
      g = f;
      f = e;
      e = add32(d, temp1);
      d = c;
      c = b;
      b = a;
      a = add32(temp1, temp2);
    }

    h0 = add32(h0, a);
    h1 = add32(h1, b);
    h2 = add32(h2, c);
    h3 = add32(h3, d);
    h4 = add32(h4, e);
    h5 = add32(h5, f);
    h6 = add32(h6, g);
    h7 = add32(h7, h);
  }

  const words = [h0, h1, h2, h3, h4, h5, h6, h7];
  let hex = "";
  for (const word of words) hex += `0000000${(word >>> 0).toString(16)}`.slice(-8);
  return hex;
}

/**
 * The prefixed form persisted as `APPROVAL-HASH:` (§4.4) and compared by §5.5.
 * There is exactly one digest in this pipeline: this is `sha256Hex` plus the
 * prefix, so the write path and the read path cannot diverge (A-11).
 *
 * @param {string} text
 * @returns {string} `sha256:{64 lowercase hex}`
 */
function approvalHashOf(text) {
  return `sha256:${sha256Hex(text)}`;
}

// ─── TSPEC §4.3 / §5.3 / §5.8 — the record parsers ────────────────────────────
//
// All five are total, synchronous, take no seam, and read the artifact through
// `scanLines`, so a marker quoted inside a fenced region never counts.

/**
 * The six skip-eligible phase ids `forcePhases` accepts, and the SAME array the
 * operator-facing rejection message is rendered from (§5.7, §6.2 row 12), so the
 * catalogue and the message cannot desynchronise. `PR` entered the catalogue at
 * REQ/FSPEC v1.6; a hand-written message would have been the one site that kept
 * silently teaching the operator the old five-token set.
 */
const FORCE_PHASE_TOKENS = Object.freeze(["R", "F", "T", "P", "D", "PR"]);

/** `sha256:` + 64 lowercase hex — the only well-formed APPROVAL-HASH value. */
const APPROVAL_HASH_VALUE_RE = /^sha256:[0-9a-f]{64}$/;
/** A commit sha as `REVIEWED-COMMIT:` may carry it: abbreviated or full lowercase hex. */
const REVIEWED_COMMIT_VALUE_RE = /^[0-9a-f]{7,40}$/;
/** The literal stored when no usable commit sha could be determined (§4.3, §4.4). */
const COMMIT_UNAVAILABLE = "unavailable";

/**
 * Read the tier-1 approval record out of a cross-review file (§4.4, §5.3).
 *
 * `HASH_FAILURES` describes the `APPROVAL-HASH:` line and nothing else.
 * `REVIEWED-COMMIT:` has no failure value because it has no failure: when it is
 * absent outside a fence, duplicated, or carries a value that is not lowercase
 * hex, `reviewedCommit` is the literal `"unavailable"` and `ok` stays `true`.
 * That is safe in the only direction that matters — §5.5's comparison never
 * reads the field (content-addressing is what makes the mechanism rebase-proof),
 * and degrading such a record to UNEVALUABLE would re-run a converged phase over
 * a field nothing consults.
 *
 * @param {string} fileText
 * @returns {{ok: true, hash: string, reviewedCommit: string}
 *          |{ok: false, reason: string}} `reason` is a `HASH_FAILURES` member.
 */
function parseApprovalHash(fileText) {
  const hashes = [];
  const commits = [];
  scanLines(fileText, (line) => {
    const h = /^\s*APPROVAL-HASH:\s*(\S*)\s*$/.exec(line);
    if (h) hashes.push(h[1]);
    const c = /^\s*REVIEWED-COMMIT:\s*(\S*)\s*$/.exec(line);
    if (c) commits.push(c[1]);
  });

  if (hashes.length === 0) return { ok: false, reason: "absent" };
  if (hashes.length > 1) return { ok: false, reason: "duplicated" };
  if (!APPROVAL_HASH_VALUE_RE.test(hashes[0])) return { ok: false, reason: "unparseable" };

  const reviewedCommit =
    commits.length === 1 && REVIEWED_COMMIT_VALUE_RE.test(commits[0])
      ? commits[0]
      : COMMIT_UNAVAILABLE;

  return { ok: true, hash: hashes[0], reviewedCommit };
}

// ─── TSPEC §5.1 — verdict extraction from a FILE ──────────────────────────────

/**
 * Read a reviewer's verdict out of a cross-review **file** (§5.1), in the three
 * steps the spec fixes, reusing `parseVerdict` unmodified.
 *
 * 1. **Locate the trailing section.** `scanLines` over the whole file, recording
 *    the index of the LAST visited `## Verdict` heading; the section is that line
 *    to EOF. A heading inside a fence is never visited, so it can neither become
 *    the boundary nor contribute a `VERDICT:` line. No such heading ⇒ no verdict
 *    ⇒ the phase runs.
 * 2. **Duplicate pre-count** over the section. More than one `VERDICT: ` line
 *    fails closed — and it fails closed *before* step 3, because `parseVerdict`
 *    scans from the end and would happily return the last of them.
 * 3. **`parseVerdict(section, roleSlug)`**, unchanged. Feeding it file text
 *    instead of a response string requires no change to it whatsoever.
 *
 * The scan is scoped to the trailing section rather than the whole file on
 * purpose: "exactly one `VERDICT:` line in the file" misclassifies any
 * cross-review that *quotes* the grammar — including a review of this very
 * feature, whose TSPEC §4.4 fenced block contains a literal `VERDICT:` line.
 *
 * @param {string|null|undefined} fileText
 * @param {string} roleSlug - for `parseVerdict`'s warning text only.
 * @returns {{ok: true, verdict: string, high: number, medium: number,
 *            low: number, malformed?: boolean}
 *          |{ok: false, reason: "no_verdict_section"|"duplicated"}}
 */
function extractFileVerdict(fileText, roleSlug) {
  const text = String(fileText ?? "");
  const lines = text.split("\n");

  let headingIndex = -1;
  scanLines(text, (line, index) => {
    if (/^\s*##\s+Verdict\s*$/.test(line)) headingIndex = index;
  });
  if (headingIndex === -1) return { ok: false, reason: "no_verdict_section" };

  const section = lines.slice(headingIndex).join("\n");

  let trailers = 0;
  scanLines(section, (line) => {
    if (line.trim().startsWith("VERDICT: ")) trailers += 1;
  });
  if (trailers > 1) return { ok: false, reason: "duplicated" };

  return { ok: true, ...parseVerdict(section, roleSlug) };
}

/**
 * Read an author's `REVISION-COMPLETE:` trailer out of its response (§4.3).
 *
 * Called ONLY on a revision episode (§5.6.2): a greenfield episode's terminal
 * test is structural completeness alone, so `absent` never arises there and no
 * greenfield episode can be held back by a trailer its SKILL was never amended
 * to emit. All four failure reasons are non-terminal — none of them ends an
 * episode, `declared_incomplete` least of all, which is the normal paced path.
 *
 * @param {string} response
 * @returns {{complete: true}|{complete: false, reason: string}} `reason` is a
 *   `TRAILER_FAILURES` member.
 */
function parseRevisionComplete(response) {
  const values = [];
  scanLines(response, (line) => {
    const m = /^\s*REVISION-COMPLETE:\s*(\S*)\s*$/.exec(line);
    if (m) values.push(m[1]);
  });

  if (values.length === 0) return { complete: false, reason: "absent" };
  if (values.length > 1) return { complete: false, reason: "duplicated" };

  const value = values[0].toLowerCase();
  if (value === "yes") return { complete: true };
  if (value === "no") return { complete: false, reason: "declared_incomplete" };
  return { complete: false, reason: "unparseable" };
}

/**
 * Read a POSTMORTEM's `RESOLVED:` marker (§5.8).
 *
 * The marker is positionally unconstrained — a `RESOLVED:` line anywhere outside
 * a fenced region counts — and is HUMAN-WRITTEN ONLY. No agent and no script
 * ever writes `yes`; a POSTMORTEM resolves when a person says it did.
 *
 * Absence and malformation are reported here as `ok: false`; §5.8's
 * `checkPostmortem` maps both onto `unresolved`, failing closed, because a
 * POSTMORTEM whose marker cannot be read costs an operator one edit whereas the
 * opposite default silently re-runs a phase that failed for an unfixed reason.
 *
 * @param {string} fileText
 * @returns {{ok: true, resolved: boolean}|{ok: false, reason: string}}
 */
function parseResolvedMarker(fileText) {
  const values = [];
  scanLines(fileText, (line) => {
    const m = /^\s*RESOLVED:\s*(\S*)\s*$/.exec(line);
    if (m) values.push(m[1]);
  });

  if (values.length === 0) return { ok: false, reason: "absent" };
  if (values.length > 1) return { ok: false, reason: "duplicated" };

  const value = values[0].toLowerCase();
  if (value === "yes") return { ok: true, resolved: true };
  if (value === "no") return { ok: true, resolved: false };
  return { ok: false, reason: "unparseable" };
}

/** §5.8's truncation ceiling for the recommendation carried into a halt message. */
const RECOMMENDATION_MAX_BYTES = 4000;

/**
 * Take the `## Recommendation` section of a POSTMORTEM — heading located via
 * `scanLines`, so a quoted heading inside a fence is not mistaken for the real
 * one — up to the next top-level heading or EOF (§5.8).
 *
 * The BODY is sliced from the raw lines rather than from the visited ones: the
 * fenced-region exclusion governs which lines may match a scanned pattern, it
 * does not empty a section's body (§5.0 property 3), so a recommendation whose
 * content is a code fence survives intact.
 *
 * Truncated at 4,000 bytes with an explicit notice, because this text feeds the
 * halt message so the operator sees what to do without opening the file.
 *
 * @param {string} fileText
 * @returns {string} the recommendation body, or `""` when there is no such section.
 */
function extractRecommendation(fileText) {
  const lines = String(fileText ?? "").split("\n");
  let headingIndex = -1;
  let nextHeadingIndex = -1;
  scanLines(fileText, (line, index) => {
    if (headingIndex === -1) {
      if (/^\s*##\s+Recommendation\s*$/.test(line)) headingIndex = index;
    } else if (nextHeadingIndex === -1 && /^#{1,2}\s/.test(line)) {
      nextHeadingIndex = index;
    }
  });

  if (headingIndex === -1) return "";
  const end = nextHeadingIndex === -1 ? lines.length : nextHeadingIndex;
  const body = lines.slice(headingIndex + 1, end).join("\n").trim();

  if (body.length <= RECOMMENDATION_MAX_BYTES) return body;
  return `${body.slice(0, RECOMMENDATION_MAX_BYTES)}\n\n[truncated at ${RECOMMENDATION_MAX_BYTES} bytes — see the POSTMORTEM for the rest]`;
}

/**
 * Parse the operator's raw `forcePhases` string (§5.7).
 *
 * Total, case-sensitive, whitespace- and comma-tolerant. Absent and empty are
 * the same thing: the empty set. An invalid token halts before any phase runs,
 * with the operator-facing text ending `Valid: R, F, T, P, D, PR, all.` — the
 * token catalogue and that message are derived from the SAME array, so they
 * cannot desynchronise. That derivation is load-bearing: `PR` entered the
 * catalogue at REQ/FSPEC v1.6, and a hand-written message would have been the
 * one site that silently kept teaching the operator the old five-token set.
 *
 * `all` means SIX phases, not five.
 *
 * Precedence (§5.7): forcing overrides a recorded APPROVAL — §2.5 steps 3 and 4
 * only — and never a recorded FAILURE. Step 2 is NOT skipped: `deriveRoundWindow`
 * still runs, because entering `reviewLoop` on the shipped `iteration = 1`
 * default on a branch that already carries `-v1` files re-creates H-1 on the one
 * path an operator reaches for precisely because the phase was reviewed before.
 *
 * @param {string} raw
 * @returns {{ok: true, phases: Set<string>}|{ok: false, badTokens: string[]}}
 */
function parseForcePhases(raw) {
  if (raw == null || String(raw).trim() === "") return { ok: true, phases: new Set() };
  const tokens = String(raw).split(/[,\s]+/).filter(Boolean);
  const valid = FORCE_PHASE_TOKENS; // six — "PR" added at REQ/FSPEC v1.6
  const bad = tokens.filter((t) => t !== "all" && !valid.includes(t));
  if (bad.length) return { ok: false, badTokens: bad };
  return { ok: true, phases: tokens.includes("all") ? new Set(valid) : new Set(tokens) };
}

// ─── TSPEC §5.5 — staleness ───────────────────────────────────────────────────

/**
 * Is a recorded approval hash still describing the document on disk?
 *
 * Three rules with teeth (§5.5), all of them structural rather than documented:
 *
 * 1. **Read at comparison time.** `documentBytes` is whatever the caller read at
 *    the moment of comparison — never a read cached earlier in the run, which is
 *    how a document edited between phases gets skipped as fresh.
 * 2. **No history walk** (O-8, as narrowed at FSPEC v1.5). One hash equality. No
 *    `git log` of the document, no reconstruction of past bytes.
 * 3. **Rebase invariance.** The comparison never reads `REVIEWED-COMMIT`. Phase
 *    DOD rebases `feat-{feature}` before every PR and rewrites every sha on the
 *    branch; a sha- or timestamp-based test would report every approval stale at
 *    that moment. Content-addressing is unaffected because content is unaffected.
 *    This is enforced by the signature, not by a comment: neither parameter is a
 *    commit, so there is no argument through which a sha could reach the compare.
 *
 * Only `FRESH` grants the skip. `STALE` and `UNEVALUABLE` both fall to §2.5 step
 * G and run the phase — FSPEC §1.2 rule 4's uniform direction: wherever a
 * machine-readable field cannot be read, the behaviour is *more* work, never less.
 *
 * Pure, total and synchronous: no seam, no throw, no IO (§3.7).
 *
 * @param {string} recordedHash - the `sha256:{64 hex}` literal carried by the
 *   approval record, copied verbatim — never recomputed over the working tree.
 * @param {string} documentBytes - the document's bytes, read at comparison time.
 * @returns {"FRESH"|"STALE"|"UNEVALUABLE"}
 */
function isStale(recordedHash, documentBytes) {
  return isStaleByHash(recordedHash, approvalHashOf(documentBytes));
}

/**
 * `isStale`'s comparison, over a document DIGEST rather than the document's
 * bytes. Same three outcomes, same rules 1–3: the only difference is who paid
 * for the digest.
 *
 * It exists because the transport under `_readFile` in the workflow runtime is
 * a fan-out of one agent per ~6 KB chunk, so reading a 300 KB REQ *only* to
 * hash it costs ~52 agents for 64 hex characters. `_hashFile` computes the
 * digest at the far side of the seam in a single agent, and this function is
 * the comparison that accepts it. `isStale` is preserved verbatim on top, so
 * the byte-taking form remains the tested definition of the outcome.
 *
 * Pure, total and synchronous: no seam, no throw, no IO (§3.7).
 *
 * @param {string} recordedHash - the `sha256:{64 hex}` literal from the record.
 * @param {string} documentHash - the document's digest in `approvalHashOf` form.
 * @returns {"FRESH"|"STALE"|"UNEVALUABLE"}
 */
function isStaleByHash(recordedHash, documentHash) {
  if (typeof recordedHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(recordedHash))
    return "UNEVALUABLE";
  return documentHash === recordedHash ? "FRESH" : "STALE";
}

// ─── TSPEC §5.9 / FSPEC §16 — structural completeness ─────────────────────────
//
// Four wrapped artifact classes. The criterion is deliberately **shallow** and
// script-decidable (C-5) over the only evidence available — the artifact on disk.
// Anything richer would need an agent in the terminal decision, which is the loop
// this feature exists to bound; §4.5's counters, not this test, are what bound a
// badly behaved episode (FSPEC §16.2).

/**
 * The six spec classes' required top-level headings (TSPEC §5.9 = FSPEC §16.2).
 *
 * `title` is the **canonical** name — the form §5.9 lists first, and the form
 * `missing` carries even when the document rendered `alt` or a case/spacing/
 * numeric-prefix variant. `alt` is §5.9's parenthesised alternative, accepted as
 * equivalent; `null` where the row states none.
 */
const REQUIRED_HEADINGS = Object.freeze({
  REQ: Object.freeze([
    { title: "Problem / Context", alt: null },
    { title: "Goals", alt: null },
    { title: "Non-Goals", alt: "Scope" },
    { title: "Constraints", alt: null },
    { title: "Acceptance Criteria", alt: null },
    { title: "Risks", alt: null },
    { title: "Obligations", alt: "Open Questions" },
  ]),
  FSPEC: Object.freeze([
    { title: "Overview", alt: "Scope" },
    { title: "Linked Requirements", alt: null },
    { title: "Behavioral Flow", alt: null },
    { title: "Business Rules", alt: null },
    { title: "Edge Cases and Error Scenarios", alt: null },
    { title: "Acceptance Tests", alt: null },
    { title: "Open Questions", alt: null },
  ]),
  TSPEC: Object.freeze([
    { title: "Overview", alt: null },
    { title: "Architecture", alt: "Design" },
    { title: "Interfaces", alt: null },
    { title: "Data Model", alt: "State" },
    { title: "Test Strategy", alt: null },
    { title: "Open Questions", alt: null },
  ]),
  PLAN: Object.freeze([
    { title: "Overview", alt: null },
    { title: "Batches", alt: "Tasks" },
    { title: "Dependencies", alt: null },
    { title: "Verification", alt: null },
  ]),
  PROPERTIES: Object.freeze([
    { title: "Overview", alt: null },
    { title: "Properties", alt: null },
    { title: "Oracles", alt: null },
    { title: "Fixtures", alt: null },
  ]),
  DECISIONS: Object.freeze([
    { title: "Context", alt: null },
    { title: "Options Considered", alt: null },
    { title: "Decision", alt: null },
    { title: "Consequences", alt: null },
  ]),
});

/**
 * LEARNINGS' five numbered sections, as `harvest-learnings/SKILL.md` mandates
 * them (FSPEC §16.5). `## 6. Approval Record` is **deliberately absent**: the
 * record is best-effort (AC-4.2c), and making it part of the terminal criterion
 * would let a record-writing bug re-dispatch harvest to MAX_AUTHORING_DISPATCHES
 * and then halt the phase over an optimisation's bookkeeping.
 *
 * Matched by normalised prefix, so `## 3. Rejected Proposals (with rationale)`
 * satisfies `Rejected Proposals`.
 */
const LEARNINGS_SECTIONS = Object.freeze([
  "Non-Convergences",
  "Cross-Feature Patterns",
  "Rejected Proposals",
  "Process Learnings",
  "Open Items for Consolidation",
]);

/**
 * FSPEC §16.5's **other** conjunct: the metadata table's `Harvested from` row.
 *
 * §16.5 states the LEARNINGS criterion as "the metadata table including its
 * `Harvested from` row, AND its five numbered sections each with a non-empty
 * body". TSPEC §5.9's restatement drops the first half; §16 owns the
 * structural-completeness criteria and governs, so the conjunct is implemented
 * here (CR F-2) and the TSPEC narrowing is documentation drift for Harvest.
 *
 * Why it matters and not merely tidiness: `harvest-learnings` step 8 deletes
 * every `CROSS-REVIEW-*` / `CODE_REVIEW-*` once the episode reaches terminal, and
 * `guard-harvest-before-delete.sh` checks only that the LEARNINGS file exists.
 * This row is the record of **what was deleted** — the one thing whose absence is
 * unrecoverable.
 *
 * Matched like §16.4's `Scope:` marker: one cheap, case-insensitive line scan,
 * through `scanLines` so a row quoted inside a fenced template block (as the
 * SKILL's own format section carries it) is not the document's own table.
 */
const HARVESTED_FROM_ROW = /^\s*\|\s*harvested\s+from\s*\|/i;

/**
 * §16.5's per-class resume clause for the absent row — the branch FSPEC names
 * "when all five are satisfied", which was unreachable while the five sections
 * were the whole criterion. Appended **last** to `missing`, so
 * `firstUnwrittenSection` names an unwritten section ahead of it.
 */
const HARVESTED_FROM_CLAUSE = '(the metadata table\'s "Harvested from" row)';

function hasHarvestedFromRow(fileText) {
  let found = false;
  scanLines(fileText, (line) => {
    if (!found && HARVESTED_FROM_ROW.test(line)) found = true;
  });
  return found;
}

/** A top-level `##` heading — never `###`, up to three leading spaces. */
const TOP_LEVEL_HEADING = /^ {0,3}##(?!#)\s+(.+?)\s*$/;

/**
 * §5.9's matching rules as one function: case-insensitive, whitespace-normalised,
 * a leading `N.` / `N)` numeric prefix ignored.
 */
function normaliseHeadingTitle(raw) {
  return String(raw ?? "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * The document's top-level sections, in document order.
 *
 * Headings are located through `scanLines`, so a `## …` line **quoted inside a
 * fenced block is not a section** (§1.2 rule 5) — a reviewer stall-killed after
 * quoting §6.2's template must not look like it reached the end. Bodies, by
 * contrast, are the **raw** lines between one heading and the next, fences
 * included: §5.0's exclusion governs which lines may *match a scanned pattern*,
 * it does not empty a section's body. Both directions matter and they pull
 * opposite ways (SE-v4 F-18 / TE-v4 F-01).
 */
function topLevelSections(fileText) {
  const lines = String(fileText ?? "").split("\n");
  const heads = [];
  scanLines(fileText, (line, index) => {
    const m = TOP_LEVEL_HEADING.exec(line);
    if (m) heads.push({ index, title: m[1] });
  });
  return heads.map((h, i) => ({
    title: h.title,
    normalised: normaliseHeadingTitle(h.title),
    index: h.index,
    body: lines.slice(h.index + 1, i + 1 < heads.length ? heads[i + 1].index : lines.length),
  }));
}

/**
 * §5.9's body rule. A body consisting only of `TBD`, `TODO`, `_TBD_` or an HTML
 * comment counts as **empty** — otherwise a skeleton written with placeholders
 * would score complete on write 1.
 *
 * The **accepted shallowness** (FSPEC v1.5, SE-v5 F-20 / TE-v5 Q-01): a body that
 * is only a fenced block containing `TBD` scores **non-empty**, because the fence
 * lines themselves are ordinary body content here. A fence-aware placeholder test
 * would reintroduce exactly the coupling that produced v1.4's false-halt.
 */
function isEmptyBody(bodyLines) {
  const stripped = bodyLines.join("\n").replace(/<!--[\s\S]*?-->/g, "");
  const meaningful = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (meaningful.length === 0) return true;
  return meaningful.every((l) => /^[_*`~\s]*(?:TBD|TODO)[_*`~\s]*$/i.test(l));
}

/**
 * Does `line` carry a catalogue verdict? One grammar, shared with `parseVerdict`
 * (TSPEC §3.9): the same `VERDICT: ` prefix over the trimmed line, the same
 * slice, the same `VALID_VERDICTS` array — which is why that array is now module
 * scoped rather than copied here.
 */
function isCatalogueVerdictLine(line) {
  const trimmed = String(line ?? "").trim();
  if (!trimmed.startsWith("VERDICT: ")) return false;
  return VALID_VERDICTS.includes(trimmed.slice("VERDICT: ".length).trim());
}

/**
 * FSPEC §16.3's cross-review criterion: the **trailing** `## Verdict` section
 * carries **at least one** `VERDICT: ` line whose value is in the catalogue.
 *
 * "Exactly one" was **withdrawn from the terminal test** at FSPEC v1.x and is
 * retained only in §6.3's *approval* test. Under the old reading a duplicated
 * verdict field made a finished review permanently non-terminal: the wrapper
 * re-dispatched to MAX_AUTHORING_DISPATCHES and halted the phase over a review
 * whose reviewer plainly reached the end (E-58). Terminal and approving are two
 * questions — a duplicated field is terminal **yes**, approving **no**, and
 * §5.1's own duplicate pre-count is what answers the second.
 *
 * The `APPROVAL-HASH:` / `REVIEWED-COMMIT:` lines §7 appends are not part of this
 * criterion: they are written *after* the episode reaches terminal.
 */
function crossReviewComplete(fileText) {
  const visited = [];
  scanLines(fileText, (line, index) => visited.push({ line, index }));
  let headingAt = -1;
  for (const v of visited) {
    const m = TOP_LEVEL_HEADING.exec(v.line);
    if (m && normaliseHeadingTitle(m[1]) === "verdict") headingAt = v.index;
  }
  if (headingAt === -1) return false;
  return visited.some((v) => v.index > headingAt && isCatalogueVerdictLine(v.line));
}

/**
 * Structural completeness of one wrapped artifact (§5.9, §3.7).
 *
 * Pure, total and synchronous — no seam, no throw, no IO. Unknown class or doc
 * type is **not complete**: FSPEC §1.2 rule 4's uniform direction is more work,
 * never less.
 *
 * `T` (top-level headings present) and `S` (those with non-empty bodies) are
 * carried for the run report and are **measured, not fixed**, so a document
 * richer than the minimum reports honestly. `missing` names the **canonical**
 * required titles that are absent or short; it is `[]` on the complete arm.
 *
 * @param {string} artifactClass - "spec" | "cross-review" | "code-review" | "LEARNINGS"
 * @param {string} docType - the spec doc type for the "spec" class; ignored otherwise
 * @param {string} fileText - the artifact's bytes
 * @returns {{complete: boolean, missing: string[], T: number, S: number}}
 */
function isComplete(artifactClass, docType, fileText) {
  const sections = topLevelSections(fileText);
  const T = sections.length;
  const S = sections.filter((s) => !isEmptyBody(s.body)).length;
  const done = (complete, missing) => ({ complete, missing, T, S });

  // A required row is satisfied when SOME section matches its canonical title or
  // its alternative AND that section's body is non-empty. Extra headings are
  // permitted, counted in `T`, and never subtract — a document richer than the
  // minimum is not incomplete. Order is not required.
  const shortfall = (rows) => {
    const satisfied = new Set();
    for (const s of sections) {
      for (const row of rows) {
        const matches = row.prefix
          ? s.normalised.startsWith(normaliseHeadingTitle(row.title))
          : s.normalised === normaliseHeadingTitle(row.title) ||
            (row.alt && s.normalised === normaliseHeadingTitle(row.alt));
        if (matches && !isEmptyBody(s.body)) satisfied.add(row.title);
      }
    }
    return rows.map((r) => r.title).filter((t) => !satisfied.has(t));
  };

  if (artifactClass === "spec") {
    const rows = REQUIRED_HEADINGS[docType];
    if (!rows) return done(false, []);
    const missing = shortfall(rows);
    return done(missing.length === 0, missing);
  }

  if (artifactClass === "cross-review") {
    return done(crossReviewComplete(fileText), []);
  }

  if (artifactClass === "code-review") {
    // §16.4: the `Scope:` field — matched with the SAME expression
    // `hooks/scripts/check-scope-field.sh` uses, so this criterion and the
    // existing hook agree on one marker rather than drifting apart — plus the
    // findings section the skill mandates. No verdict field: Phase DOD is out of
    // AC-4's scope entirely (§10.7), so a verdict on it would carry no meaning.
    const scoped = /scope|cross-feature/i.test(String(fileText ?? ""));
    const findings = sections.some((s) => s.normalised.includes("findings") && !isEmptyBody(s.body));
    return done(scoped && findings, []);
  }

  if (artifactClass === "LEARNINGS") {
    // §16.5, in full: "the metadata table including its `Harvested from` row,
    // AND its five numbered sections each with a non-empty body". The section
    // half of the criterion is POSITIONAL, not title-based: harvest-learnings is free to name
    // its five sections for the feature it distilled, and LEARNINGS_SECTIONS is
    // this module's default naming, not a contract the skill is held to. What is
    // fixed is that sections `1.`…`5.` all exist and all carry content.
    //
    // The approval record is EXCLUDED — it is section 6 when present, and
    // best-effort (AC-4.2c); see LEARNINGS_SECTIONS.
    const numbered = new Map();
    for (const s of sections) {
      const m = /^\s*(\d+)[.)]/.exec(String(s.title ?? ""));
      if (!m) continue;
      const n = Number(m[1]);
      if (n < 1 || n > LEARNINGS_SECTIONS.length) continue;
      if (!numbered.has(n) && !isEmptyBody(s.body)) numbered.set(n, s.title);
    }
    const missing = LEARNINGS_SECTIONS.filter((_, i) => !numbered.has(i + 1));
    // The metadata conjunct, appended last so an unwritten section is still what
    // the resume prompt names first (§16.5: the row is named "when all five are
    // satisfied"). See HARVESTED_FROM_CLAUSE.
    if (!hasHarvestedFromRow(fileText)) missing.push(HARVESTED_FROM_CLAUSE);
    return done(missing.length === 0, missing);
  }

  return done(false, []);
}

// ─── isPass helper ────────────────────────────────────────────────────────────

function isPass(verdict) {
  return verdict === "Approved" || verdict === "Approved with minor changes";
}

// ─── TSPEC §5.6.1 — selectMode; §5.6.2 — isTerminal ───────────────────────────

/**
 * Compute an episode's `mode` (TSPEC §5.6.1, FSPEC §15.2, AC-3.5 scope (d)).
 *
 * `EpisodeKey.mode` is not an input the caller invents. It is computed **once per
 * episode, at that episode's entry**, by this pure function, from what the phase
 * is dispatching an author to *do* — never from the artifact's structural state.
 *
 * **Invariant S-INV is the caller's obligation, not this function's.** `present`
 * and `reviewFiles` must be the state of the branch at the instant the episode
 * begins, read inside `reviewLoop` by `refreshReviewState`, never a snapshot taken
 * before the loop. Under an entry-time snapshot on a clean branch `present` is
 * empty for the life of the phase, every optimizer episode selects greenfield,
 * `isTerminal` requires no trailer, and the wrapper reports success on a round
 * whose findings were never addressed (TE-v2 N-01).
 *
 * The four rules, in the order §5.6.1 states them:
 *
 * 1. **The revision test is evaluated first** — structural completeness is never
 *    consulted here, so it can never move an episode out of revision mode.
 * 2. **Which round** — the highest round `present` holds that is not carrying
 *    same-round dual approval: the round still owed an authoring pass. A resuming
 *    invocation therefore re-enters the *same* round. §5.2's `max + 1` governs the
 *    next *reviewer* dispatch and is a different question over the same map.
 * 3. **Non-authoring wrapped dispatches are always greenfield**, without
 *    evaluating rule 1 — a review / dod-verify / harvest episode is never
 *    dispatched to address findings in its own artifact.
 * 4. **Greenfield needs positive evidence.** An episode is greenfield *only if*
 *    this episode's own refresh observed the branch and found no review round for
 *    this (feature, doc type) — i.e. `present` is empty. Everything else, including
 *    a non-empty `present` whose verdicts are unreadable, is revision. "Not read"
 *    is never "no findings"; the directions are not symmetric.
 *
 * The unread-*listing* axis never reaches rule 4: a `refreshReviewState` whose
 * `_listFiles` cannot be judged **halts** (§4.2, §6.2 rows 2 and 17), so `present`
 * is a `Map` at every call — the input domain has no third value to rule on, which
 * is what makes the rule total.
 *
 * @param {{dispatchKind: string, docType: string,
 *          present: Map<string, number[]>,
 *          reviewFiles: Map<string, {verdict: string, verdictReadable: boolean, anchorHash: string|null}>,
 *          startIndex: number}} arg
 * @returns {{mode: "authoring"|"revision", round: number|null, reason: string}}
 */
function selectMode({ dispatchKind, docType, present, reviewFiles, startIndex }) {
  // Rule 3 — evaluated before rule 1, not after it.
  if (dispatchKind !== "authoring") {
    return {
      mode: "authoring",
      round: null,
      reason: `non-authoring dispatch kind ${dispatchKind} is greenfield by construction`,
    };
  }

  const rounds = new Set();
  const roles = [];
  if (present && typeof present.forEach === "function") {
    present.forEach((list, role) => {
      roles.push(role);
      for (const n of list || []) rounds.add(n);
    });
  }

  // Rule 4 — greenfield needs positive evidence: an observed, EMPTY `present`.
  if (rounds.size === 0) {
    return {
      mode: "authoring",
      round: null,
      reason: `no review round on the branch for ${docType}`,
    };
  }

  // Rule 2 — the highest round not carrying same-round dual approval.
  const files = reviewFiles && typeof reviewFiles.get === "function" ? reviewFiles : new Map();
  const dualApproved = (round) =>
    roles.length > 0 &&
    roles.every((role) => {
      const rec = files.get(`${role}:${round}`);
      return !!rec && rec.verdictReadable === true && isPass(rec.verdict);
    });

  const descending = [...rounds].sort((a, b) => b - a);
  const owed = descending.find((r) => !dualApproved(r));
  const round = owed === undefined ? descending[0] : owed;

  return {
    mode: "revision",
    round,
    reason:
      owed === undefined
        ? `every observed ${docType} round is dual-approved; addressing round ${round}`
        : `${docType} round ${round} is still owed an authoring pass`,
  };
}

/**
 * The terminal test (TSPEC §5.6.2, FSPEC §8.4, AC-3.5b). Per mode, and it returns
 * a **record, not a boolean**, because the trailer reason it computes is the only
 * place that reason exists.
 *
 * | Mode | Terminal condition | Trailer |
 * |---|---|---|
 * | Greenfield | the required member of the artifact set is structurally complete | none required, none expected — `parseRevisionComplete` is not called |
 * | Revision | structurally complete **and** `parseRevisionComplete(response)` → `{complete: true}` | required |
 *
 * **Why the conjunct is absent from the greenfield path rather than reconciled.**
 * §7.4 amends only the three *author* SKILLs to emit `REVISION-COMPLETE:`; the
 * three review SKILLs, `dod-verify` and `harvest-learnings` never will, and
 * §5.6.1 rule 3 puts every one of those episodes in greenfield by construction. A
 * mode-blind conjunct would make the numerically dominant episode population
 * unable to *ever* reach terminal — H-3's own failure mode rebuilt by the
 * mechanism meant to remove it.
 *
 * **Both members are read, and `structural` is not one of them** — v1.2 returned
 * it as a third member no caller read, which is the shape AC-4.7a forbids, so it
 * lives as the local below where its only two readers are.
 *
 * **Revision mode is BASELINE-RELATIVE for the spec class.** A revision episode
 * must not be gated on a stricter structural shape than the document had when the
 * episode began: reviewers reviewed *that* shape and the loop accepted it for the
 * prior rounds, and the optimizer's job is to address findings, not to retrofit
 * canonical headings onto a document authored before this oracle existed. So when
 * `entryMissing` is supplied — the missing-set measured over the episode's entry
 * bytes — the structural conjunct becomes "no **regression**": the current
 * missing-set must be a subset of the entry one. A previously-satisfied canonical
 * section may not be deleted; a pre-existing shortfall does not block. Without
 * that relaxation a revision episode over such a document can NEVER reach
 * terminal, and the wrapper burns `MAX_AUTHORING_DISPATCHES` on an author that
 * already declared itself done.
 *
 * The baseline is **optional and defaults to the strict test**, so greenfield
 * (where the canonical headings are still required in full) and every non-spec
 * artifact class are untouched, as is every call site that does not pass one.
 *
 * @param {string} mode - the episode's mode, from `selectMode`
 * @param {string} response - the dispatch's response text
 * @param {string} artifactClass - §5.9's wrapped artifact class
 * @param {string} docType
 * @param {string|null} after - the target's bytes read AFTER the dispatch
 * @param {string[]|null} [entryMissing] - the missing-set measured at episode entry;
 *   applied only in revision mode over the "spec" class
 * @returns {{terminal: boolean, trailerReason: string|null}}
 */
function isTerminal(mode, response, artifactClass, docType, after, entryMissing) {
  return terminalFrom(mode, response, artifactClass, isComplete(artifactClass, docType, after), entryMissing);
}

/**
 * `isTerminal`'s decision over a measurement that has ALREADY been made, rather
 * than over the bytes it would be made from. The exported form above is this
 * function plus one `isComplete` call, so there is one terminal rule, not two.
 *
 * It exists for the probe seams (§3.8's `_probeDoc`): a probe answers
 * `{complete, missing, T, S}` at the far side of the seam, and the bytes it
 * measured never enter this module. Deliberately NOT exported — `isTerminal`'s
 * signature is the pinned one.
 *
 * @param {string} mode
 * @param {string} response
 * @param {string} artifactClass
 * @param {{complete: boolean, missing: string[], T: number, S: number}} measured
 * @param {string[]|null} [entryMissing]
 * @returns {{terminal: boolean, trailerReason: string|null}}
 */
function terminalFrom(mode, response, artifactClass, measured, entryMissing) {
  let structural = measured.complete;
  if (mode === "revision" && artifactClass === "spec" && Array.isArray(entryMissing)) {
    const baseline = new Set(entryMissing);
    structural = measured.missing.every((title) => baseline.has(title));
  }
  if (mode !== "revision") return { terminal: structural, trailerReason: null };
  const t = parseRevisionComplete(response);
  return {
    terminal: structural && t.complete,
    trailerReason: t.complete ? null : t.reason,
  };
}

// ─── REQ-GATE-04: Non-convergence halt helper ─────────────────────────────────

/**
 * If the reviewLoop result did not converge, throw a haltError that identifies
 * the phase, the non-approving reviewers, and their unresolved finding counts.
 * Also records the phase as ❌ in the phases array (PM-F03 / REQ-OBS-02).
 *
 * @param {{ converged: boolean, iterations: number, lastResults?: Array }} loopResult
 * @param {string} phaseId  - e.g. "R"
 * @param {string} phaseLabel - human-readable phase label
 * @param {Function} recordPhase - the local recordPhase callback
 */
function checkConverged(
  loopResult,
  phaseId,
  phaseLabel,
  recordPhase,
  feature,
  startIndex,
  endIndex
) {
  if (loopResult.converged !== false) return;

  // An authoring-budget halt is NOT a non-convergence: no reviewer disagreed, the
  // wrapper simply stopped paying for a dispatch that was going nowhere. It writes
  // no POSTMORTEM (§6.2 rows 10–11) and reports the wrapper's own detail.
  if (loopResult.halted === true) {
    recordPhase(phaseId, phaseLabel, "❌", loopResult.haltDetail);
    throw haltError(loopResult.haltDetail);
  }

  // Build reviewer detail string (PM-F02)
  let reviewerDetail = "";
  if (Array.isArray(loopResult.lastResults) && loopResult.lastResults.length > 0) {
    const details = loopResult.lastResults
      .filter((r) => !isPass(r.verdict))
      .map((r) => `${r.skill} (high:${r.high}, medium:${r.medium}, low:${r.low})`)
      .join("; ");
    reviewerDetail = details ? ` — non-approving reviewers: [${details}]` : "";
  }

  // §6.3: the template is made CORRECT and made USED — `feature` is interpolated,
  // and the path becomes §4.7's `postmortemPath` report field.
  const postmortemPath = `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md`;
  // AC-5.1: the window is RELATIVE. On a branch whose highest existing round is 3
  // the phase was admitted rounds 4..8, and "after 5 iterations" would name an
  // absolute index the run never used.
  const first = startIndex === undefined ? 1 : startIndex;
  const last = endIndex === undefined ? windowEnd(first) : endIndex;
  const window = `rounds ${first}..${last}`;
  recordPhase(
    phaseId,
    phaseLabel,
    "❌",
    `Non-convergence across ${window}${reviewerDetail}`,
    MAX_REVIEW_ROUNDS
  );

  // §6.3 step 3: the disposition is `reviewLoop`'s `_checkFile` CONFIRMATION,
  // never the POSTMORTEM agent's reply.
  const written = loopResult.postmortemWritten === true;

  // §6.4's two conditional shapes. The unconditional `POSTMORTEM written.` is gone.
  const reason = written
    ? `Phase ${phaseId} did not converge across ${window}${reviewerDetail}. ` +
      `Post-mortem written at ${postmortemPath}. ` +
      // §6.4 row 1's recovery clause. The literal words "queue row" are
      // deliberately NOT used: `RLH-AT-31-orch` and `-34-orch` require that a
      // clean or absent row leaves no queue-shaped text anywhere in the report,
      // so a phrase that names the queue in EVERY non-convergence halt would
      // make "one failure, not two" unobservable.
      `Recover: resolve it per AC-2.4, then set the feature's row back to pending.`
    : `Phase ${phaseId} did not converge across ${window}${reviewerDetail}. ` +
      `Post-mortem write FAILED — no artifact at ${postmortemPath}.`;

  throw haltError(reason, {
    haltPhase: phaseId,
    postmortemPath,
    postmortemStatus: written ? "written" : "write_failed",
  });
}

// ─── TSPEC-LOOP-01 through TSPEC-LOOP-08: reviewLoop ─────────────────────────

/**
 * @param {object} params
 * @param {string} params.doc       - Path to the document under review (or feature dir for Phase CR)
 * @param {string} params.phase     - Phase label: "R" | "F" | "T" | "D" | "P" | "PR" | "CR"
 * @param {string[]} params.reviewers - Exactly two reviewer skill identifiers
 * @param {string} params.optimizer - Optimizer skill identifier
 * @param {string} params.feature   - Feature name
 * @param {number} [params.iteration=1] - Starting iteration (always 1 for fresh runs)
 * @param {function} [params._agent] - Injected agent function (for testing)
 * @param {function} [params._parallel] - Injected parallel function (for testing)
 * @param {function} [params._checkFile] - Injected file-existence check (for testing)
 * @returns {Promise<{converged: boolean, iterations: number, lastOptimizerResult?: string|null}>}
 */
async function reviewLoop({
  doc,
  phase,
  docType,
  reviewers,
  optimizer,
  feature,
  iteration = 1,
  startIndex = iteration,
  endIndex = windowEnd(startIndex),
  _agent = agent,
  _parallel = parallel,
  _checkFile = checkFileNonEmpty,
  _listFiles = defaultListFiles,
  _readFile = defaultReadFile,
  _hashFile = defaultHashFile,
  _appendFile = defaultAppendFile,
  // The optional probe seams (see `probeDocument` / `resolveReviewState`). They
  // default to `null` rather than to a working implementation on purpose: absent
  // is the shipped state, and every site that consults one falls back.
  _probeDoc = NO_PROBE,
  _probeReviewState = NO_PROBE,
  _log,
  _git,
}) {
  // The doc type the round record is keyed by. Derived from `doc` when the caller
  // does not name it, so Phase CR's directory target degrades to "no doc type"
  // rather than to a wrong one.
  const roundDocType = docType === undefined ? docTypeFromPath(doc) : docType;
  const reviewFileType = roundDocType || "REVIEW";
  const emit = typeof _log === "function" ? _log : log;

  /** Wrap one dispatch of this loop in the §3.8 pacing wrapper. */
  const wrapped = (skill, basePrompt, targetPath, dispatchKind) =>
    dispatchAndVerify({
      skill,
      basePrompt,
      targetPath,
      docType: roundDocType,
      feature,
      dispatchKind,
      phaseId: phase,
      _agent,
      _readFile,
      _listFiles,
      _probeDoc,
      _probeReviewState,
      _log: emit,
      _git,
    });

  // An episode that exhausts an authoring budget RETURNS through the loop rather
  // than throwing past it: `checkConverged` is the one place that decides what a
  // failed phase does, and `RLH-AT-61-loop` reads the trailer reason off this
  // return. `halted` is the discriminator; `haltDetail` is the operator's text.
  let haltedReturn = null;
  const runWrapped = async (skill, basePrompt, targetPath, dispatchKind) => {
    if (haltedReturn) return null;
    try {
      const episode = await wrapped(skill, basePrompt, targetPath, dispatchKind);
      if (episode && episode.trailerReason !== undefined) {
        lastTrailerReason = episode.trailerReason;
      }
      return episode;
    } catch (err) {
      if (err && err.isAuthoringHalt) {
        haltedReturn = {
          converged: false,
          iterations: iteration,
          halted: true,
          haltDetail: err.message,
          trailerReason: err.trailerReason ?? null,
          postmortemWritten: false,
          lastResults: [],
        };
        return null;
      }
      throw err;
    }
  };

  /** The cross-review path a reviewer episode writes this round (§5.2). */
  const reviewTargetPath = (skill, round) =>
    `docs/${feature}/CROSS-REVIEW-${reviewerRoleSlug(skill) || skill}-${reviewFileType}-v${round}.md`;

  // The branch guard's cheap re-check: `main()` placed the tree on
  // feat-{feature} at entry, but phases run for a long time and a tree can drift
  // between them. Verify-only — reviewers of an earlier round may still be
  // flushing writes into this same tree, so a checkout here would be a mutation
  // under their feet.
  await verifyFeatureBranch({
    feature,
    context: `phase ${phase}'s review round`,
    _git,
    _log: emit,
  });

  // TSPEC-LOOP-02: Entry precondition check (skip for Phase CR)
  if (phase !== "CR") {
    const checkResult = await _checkFile(doc);
    if (!checkResult.ok) {
      throw haltError(
        `Error: ${doc} does not exist — cannot enter reviewLoop for phase ${phase}`
      );
    }
  }

  let result1, result2;
  // Retain the most recent optimizer result so callers (Phase T) can read the
  // DECISIONS_WARRANTED trailer without a separate post-PASS agent session. Null
  // when the loop converges on iteration 1 with no optimizer run.
  let lastOptimizerResult = null;
  // §3.9 / §5.6.1: the last episode's REVISION-COMPLETE trailer outcome, carried
  // on every return of this function.
  let lastTrailerReason = null;

  // TSPEC-LOOP-03: Iteration loop
  while (true) {
    // (a) Check iteration cap at loop-top
    if (iteration > endIndex) {
      // POSTMORTEM trigger
      const postmortemPath = `docs/${feature}/POSTMORTEM-${phase}-${feature}.md`;
      const postmortemPrompt = [
        `Write ${postmortemPath}.`,
        `Include the required sections: Phase, Iterations (${MAX_REVIEW_ROUNDS} — limit reached), Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation.`,
        `Read all cross-review files for this phase (all versioned suffixes) to identify unresolved findings.`,
        `Commit and push.`,
      ].join(" ");

      let postmortemFailed = false;
      try {
        const postmortemResult = await _agent(optimizer, postmortemPrompt);
        if (
          postmortemResult == null ||
          (typeof postmortemResult === "string" &&
            postmortemResult.trim() === "")
        ) {
          postmortemFailed = true;
        }
      } catch {
        postmortemFailed = true;
      }

      // §6.3 step 2 — CONFIRM, do not trust the agent's reply. `rtWriteFile`
      // answers `"ok"` when it *believes* it wrote; AC-2.2 exists because that
      // belief has been wrong. The confirmation is the only evidence admitted.
      let postmortemWritten = false;
      if (!postmortemFailed) {
        const confirmation = await _checkFile(postmortemPath);
        postmortemWritten = !!(confirmation && confirmation.ok);
      }

      if (postmortemFailed) {
        log(
          `WARNING: POSTMORTEM agent failed — artifact not written for phase ${phase}`
        );
      } else if (!postmortemWritten) {
        log(
          `WARNING: POSTMORTEM agent reported success but no artifact was confirmed at ${postmortemPath} for phase ${phase}`
        );
      }

      // Build lastResults from the final iteration's reviewer verdicts (PM-F02)
      const lastResults = [
        { skill: reviewers[0], ...parseVerdict(result1, reviewers[0]) },
        { skill: reviewers[1], ...parseVerdict(result2, reviewers[1]) },
      ];

      return {
        converged: false,
        iterations: MAX_REVIEW_ROUNDS,
        lastResults,
        postmortemWritten,
        postmortemPath,
        trailerReason: null,
      };
    }

    // (b) Emit iteration log
    if (iteration === 1) {
      log("Starting iteration 1");
    } else {
      log(`Resuming from iteration ${iteration}`);
    }

    // (b2) TSPEC §5.3 t0–t2 — capture the anchor BEFORE the reviewers are
    // dispatched (t3), so what is recorded is the document this round actually
    // reviewed, not whatever the optimizer left behind afterwards. Phase CR's
    // target is a directory and carries no anchor.
    let anchorHash = null;
    let anchorCommit = "unavailable";
    if (phase !== "CR") {
      // t0/t1 collapse into ONE seam call: the anchor never needed the bytes,
      // only their digest, and `_hashFile` returns exactly what
      // `approvalHashOf(await _readFile(doc))` returned — including `null` for
      // an absent or unreadable document. In the workflow runtime `_readFile`
      // is a per-chunk agent fan-out, so hashing the largest document in the
      // pipeline once per round used to cost ~1 agent per 6 KB; it now costs 1.
      // `_probeDoc` already carries that digest, under the same `approvalHashOf`
      // contract and with the same `null` for a document it could not read, so a
      // probing runtime pays for no second observation here.
      const probe = await probeDocument(_probeDoc, doc, roundDocType);
      anchorHash = (probe ? probe.hash : await _hashFile(doc)) ?? null; // t0–t1
      anchorCommit = await headCommitSha(_git); // t2
    }

    // (c) Dispatch reviewers in parallel. On iteration ≥2 each reviewer gets a
    // delta re-review prompt (read prior cross-review, diff-only scan) — see
    // reviewerPrompt. Iteration 1 is the full first-pass review.
    const reviewerPrompt1 = reviewerPrompt(doc, phase, feature, iteration, reviewers[0], reviewFileType);
    const reviewerPrompt2 = reviewerPrompt(doc, phase, feature, iteration, reviewers[1], reviewFileType);

    const [r1, r2] = await _parallel([
      runWrapped(reviewers[0], reviewerPrompt1, reviewTargetPath(reviewers[0], iteration), "review"),
      runWrapped(reviewers[1], reviewerPrompt2, reviewTargetPath(reviewers[1], iteration), "review"),
    ]);
    if (haltedReturn) return haltedReturn;
    result1 = r1 && r1.response;
    result2 = r2 && r2.response;

    // (d) Parse verdicts. A missing/malformed VERDICT trailer sets malformed:true —
    // make one cheap Haiku recovery attempt to re-emit the trailer from the reviewer's
    // own output before paying for a full optimizer + re-review round.
    let verdict1 = parseVerdict(result1, reviewers[0]);
    if (verdict1.malformed) {
      const recovered = await recoverVerdict({
        reviewer: reviewers[0],
        rawResult: result1,
        _agent,
      });
      if (recovered) verdict1 = recovered;
    }
    let verdict2 = parseVerdict(result2, reviewers[1]);
    if (verdict2.malformed) {
      const recovered = await recoverVerdict({
        reviewer: reviewers[1],
        rawResult: result2,
        _agent,
      });
      if (recovered) verdict2 = recovered;
    }

    // (e) Evaluate gate
    const gatePass = isPass(verdict1.verdict) && isPass(verdict2.verdict);

    // (f) PASS branch — t4. The round is terminal, so §5.3 t5 appends the anchor
    // pair to each reviewer's cross-review file and t6 commits. A failed or
    // ambiguous append is an operator-facing error that yields NO approval for the
    // round and never halts the run (§6.2 row 8, `AT-17`): the phase simply has no
    // recorded approval to skip on next time.
    if (gatePass) {
      await appendApprovalAnchors({
        paths: [reviewTargetPath(reviewers[0], iteration), reviewTargetPath(reviewers[1], iteration)],
        hash: anchorHash,
        commit: anchorCommit,
        _readFile,
        _probeDoc,
        _appendFile,
        _git,
        emit,
      });
      // §3.9: `trailerReason` rides on EVERY return, `null` on the clean path —
      // so `null` must be observable as a value, which a conditional spread is not.
      return {
        converged: true,
        iterations: iteration,
        lastOptimizerResult,
        trailerReason: lastTrailerReason,
      };
    }

    // (g) Invoke optimizer (FAIL path)
    const optPrompt = optimizerPrompt(doc, phase, feature, iteration, reviewers, reviewFileType);
    const optEpisode = await runWrapped(optimizer, optPrompt, doc, "authoring");
    if (haltedReturn) return haltedReturn;
    const optimizerResult = optEpisode && optEpisode.response;
    lastOptimizerResult = optimizerResult;

    if (
      optimizerResult == null ||
      (typeof optimizerResult === "string" && optimizerResult.trim() === "") ||
      (typeof optimizerResult === "string" &&
        optimizerResult.toLowerCase().includes("non-zero exit"))
    ) {
      throw haltError(
        `Error: optimizer agent ${optimizer} failed during phase ${phase}, iteration ${iteration} — pipeline halted. Document at ${doc} may be in an inconsistent state.`
      );
    }

    // A no-op optimizer episode: the episode completed (it is not the failure
    // above) but changed no bytes of `doc`. Dispatching the reviewers again over
    // byte-identical input cannot converge and only burns a review round — this
    // exact waste happened in production (SE F-08, TE F-07: both reviewers filed
    // a re-review of an unchanged document as a process defect). Halt now rather
    // than advance `iteration` and loop.
    //
    // Gated on `measuredT > 0`: a target `isComplete` cannot score at all (the
    // unmeasurable-target escape inside `dispatchAndVerify` — e.g. Phase CR's
    // directory target, or any caller whose read seam is a stub) always shows
    // `wroteBytes === false` on a no-op dispatch, with no way to distinguish
    // "genuinely unchanged" from "nothing was ever measurable here". Halting on
    // that would turn every unmeasurable target into a false-positive halt.
    if (optEpisode && optEpisode.wroteBytes === false && optEpisode.measuredT > 0) {
      throw haltError(
        `Error: optimizer ${optimizer} completed without modifying ${doc} in phase ${phase}, iteration ${iteration} — re-reviewing an unchanged document cannot converge; pipeline halted.`
      );
    }

    iteration += 1;
  }
}

// ─── TSPEC §5.3 — approval anchor capture and append (t0…t6) ─────────────────

/**
 * §5.3 t2 — the commit the reviewed bytes were read at. Never a halt condition:
 * a repo-less or failing `git` degrades to the `"unavailable"` sentinel §4.3 and
 * §5.5 rule 3 both already accept (the comparison never reads it).
 *
 * @param {function|undefined} _git
 * @returns {Promise<string>}
 */
async function headCommitSha(_git) {
  if (typeof _git !== "function") return "unavailable";
  try {
    const result = await _git(["rev-parse", "HEAD"]);
    const stdout = result && typeof result.stdout === "string" ? result.stdout.trim() : "";
    return /^[0-9a-f]{7,40}$/.test(stdout) ? stdout : "unavailable";
  } catch {
    return "unavailable";
  }
}

/**
 * §5.3's pre-count over one cross-review file: the `APPROVAL-HASH:` values on
 * unfenced lines, in order. `scanLines` already skips fenced regions, so a quoted
 * example anchor cannot fabricate an ambiguity.
 *
 * @param {string} fileText
 * @returns {string[]}
 */
function approvalAnchorPreCount(fileText) {
  const found = [];
  scanLines(String(fileText ?? ""), (line) => {
    const m = /^APPROVAL-HASH:\s*(\S+)\s*$/.exec(line);
    if (m) found.push(m[1]);
  });
  return found;
}

/**
 * §5.3 t5–t6. The pre-count is a count AND a comparison (E-14/E-15):
 *
 *   0 existing anchors        ⇒ append the pair
 *   1, equal to `hash`        ⇒ idempotent no-op; the approval stands
 *   1, unequal                ⇒ error surfaced, no append, no approval
 *   ≥ 2                       ⇒ history ambiguous, no append, no approval
 *
 * Nothing here throws: `AT-17`'s "does not halt".
 */
async function appendApprovalAnchors({
  paths,
  hash,
  commit,
  _readFile,
  _probeDoc,
  _appendFile,
  _git,
  emit,
}) {
  if (!hash) {
    emit(
      "Approval anchor not recorded: the reviewed document could not be read at " +
        "capture time. The round yields no approval; the phase will re-run."
    );
    return;
  }

  let appended = false;
  for (const path of paths) {
    // The pre-count is a JUDGMENT about the file, not its prose, so `_probeDoc`
    // can answer it: `anchors` is `approvalAnchorPreCount`'s array and `exists`
    // is the same absence the `null` read reports. `docType` is `null` because a
    // cross-review is scored whole-file (§5.9) — the probe's completeness fields
    // are not read here, only its anchors. The APPEND itself stays on
    // `_appendFile`: §7.4's append shape is not a read and has no probe.
    const probe = await probeDocument(_probeDoc, path, null);
    const existingText = probe ? null : await _readFile(path);
    if (probe ? probe.exists !== true : existingText == null) {
      emit(`Approval anchor not recorded: ${path} is absent. The round yields no approval.`);
      return;
    }
    const existing = probe
      ? (Array.isArray(probe.anchors) ? probe.anchors : [])
      : approvalAnchorPreCount(existingText);
    if (existing.length >= 2) {
      emit(
        `Approval anchor not recorded: ${path} already carries ${existing.length} ` +
          "APPROVAL-HASH: lines, so its history is ambiguous. The round yields no approval."
      );
      return;
    }
    if (existing.length === 1) {
      if (existing[0] === hash) continue; // E-14 — idempotent no-op.
      emit(
        `Approval anchor not recorded: ${path} already carries a DIFFERENT ` +
          `APPROVAL-HASH: (${existing[0]} vs ${hash}). The round yields no approval.`
      );
      return;
    }
    try {
      await _appendFile(path, `\nAPPROVAL-HASH: ${hash}\nREVIEWED-COMMIT: ${commit}\n`);
      appended = true;
    } catch (err) {
      emit(
        `Approval anchor not recorded: appending to ${path} failed (${err && err.message}). ` +
          "The round yields no approval."
      );
      return;
    }
  }

  if (!appended || typeof _git !== "function") return;
  try {
    await _git(["add", ...paths]); // t6
    await _git(["commit", "-m", `chore(pdlc): record approval anchors ${hash}`]);
  } catch {
    // t6 is best-effort: the anchors are on disk either way, and §5.5's comparison
    // reads the working tree, never the commit.
  }
}

// ─── Prompt helpers ───────────────────────────────────────────────────────────

/**
 * Map a reviewer skill id to the role slug it uses in its cross-review filename
 * (`CROSS-REVIEW-{role}-{DOC-TYPE}[-v{N}].md`). Slugs are taken from each reviewer
 * skill's Cross-Review File Format section. Returns null for unknown skills so
 * prompts degrade to the generic glob rather than an invented path.
 * @param {string} skill
 * @returns {string|null}
 */
/**
 * The single reviewer-skill → role-slug MAP (TSPEC §3.9). Lifted to module scope
 * so the filename grammar's role alternation (§5.2 G-2), the dispatch table and
 * the reverse accessor below all read the SAME catalogue and cannot desynchronise.
 * Sharing the object is what makes the three consistent; `RLH-MAP-01` is what keeps
 * this catalogue and `PHASE_DISPATCH`'s reviewer set consistent with each other.
 */
const MAP = {
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
};

/** The closed role catalogue G-2 validates a parsed filename's role against. */
const REVIEWER_ROLE_SLUGS = Object.freeze(Object.values(MAP));

function reviewerRoleSlug(skill) {
  return MAP[skill] || null;
}

/**
 * The reverse of `reviewerRoleSlug` (TSPEC §3.9): a role slug as it appears in a
 * `CROSS-REVIEW-{role}-…` basename back to the reviewer skill that produced it.
 *
 * The desynchronisation this pair guards against is between `MAP` and
 * `PHASE_DISPATCH`: a reviewer added to the dispatch table without a `MAP` entry
 * derives its cross-review path at the `reviewerRoleSlug(skill) || skill` fallback
 * (§5.2's call site), producing a basename whose role is outside G-2's closed
 * catalogue and therefore unparseable on the next round. `RLH-MAP-01`
 * (`__tests__/roundDerivation.test.js`) is what enforces that — both accessors are
 * exported for it, and the guarantee this comment states holds only because that
 * assertion runs. It is two-way: a dispatch reviewer with no slug reds, and a `MAP`
 * entry no phase dispatches reds too.
 *
 * @param {string} slug
 * @returns {string|null} the reviewer skill id, or `null` for a non-catalogue slug.
 */
function reviewerSkillForSlug(slug) {
  for (const skill of Object.keys(MAP)) {
    if (MAP[skill] === slug) return skill;
  }
  return null;
}

// ─── TSPEC §5.2 — filename grammar and round-index derivation (the H-1 fix) ────

/** The G-1…G-4 cross-review basename grammar, applied to a BASENAME. */
const CROSS_REVIEW_RE =
  /^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?:-v(?<n>[1-9][0-9]*))?\.md$/;

/** The same grammar with the round/extension tail left unconsumed, so a basename
 *  that fails only on its tail can be told apart: `bad_round` from `trailing_junk`. */
const CROSS_REVIEW_LOOSE_RE =
  /^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?<rest>.*)$/;

const CROSS_REVIEW_PREFIX = "CROSS-REVIEW-";

/** The closed doc-type catalogue a cross-review may be written against (§4.4). */
const REVIEW_DOC_TYPES = Object.freeze([
  "REQ",
  "FSPEC",
  "TSPEC",
  "PLAN",
  "PROPERTIES",
  "DECISIONS",
]);

/**
 * Parse a cross-review basename against the §5.2 grammar. Total: a string goes
 * in, a tagged union comes out, and it never throws.
 *
 * The four rules the grammar encodes, and the rejection each produces:
 *   G-1 (case)                  — `[a-z]` role / `[A-Z]` doc type
 *   G-2 (closed role catalogue) — validated AFTER the regex against `MAP`'s
 *                                 values, not baked into the pattern ⇒ `bad_role`
 *   G-3 (no leading zeros)      — `[1-9][0-9]*` ⇒ `bad_round`
 *   G-4 (no other optional part)— `$` immediately after `\.md` ⇒ `trailing_junk`
 *
 * The un-suffixed form IS round 1: `CROSS-REVIEW-{role}-{DOC}.md` and
 * `…-v1.md` denote the same round. That is not a convenience — the un-suffixed
 * form is what pre-existing branches in this repo carry, and treating it as "no
 * round" would make every historical approval invisible.
 *
 * @param {string} basename
 * @returns {{ok: true, role: string, docType: string, round: number, suffixed: boolean}
 *          |{ok: false, reason: string}} `reason` is a `FILENAME_FAILURES` member.
 */
function parseReviewFilename(basename) {
  const name = typeof basename === "string" ? basename : "";
  if (!name.startsWith(CROSS_REVIEW_PREFIX)) {
    return { ok: false, reason: "not_cross_review" };
  }

  const m = CROSS_REVIEW_RE.exec(name);
  if (m) {
    const { role, docType, n } = m.groups;
    if (!REVIEWER_ROLE_SLUGS.includes(role)) return { ok: false, reason: "bad_role" };
    if (!REVIEW_DOC_TYPES.includes(docType)) return { ok: false, reason: "bad_doc_type" };
    return {
      ok: true,
      role,
      docType,
      round: n === undefined ? 1 : Number(n),
      suffixed: n !== undefined,
    };
  }

  // The prefix is right but the rest is not. Classify the tail rather than
  // collapsing every such name onto `not_cross_review`, so E-03/E-07's notice
  // can tell an operator WHICH rule the file broke.
  const loose = CROSS_REVIEW_LOOSE_RE.exec(name);
  if (!loose) return { ok: false, reason: "bad_role" }; // G-1: the role segment itself
  const rest = loose.groups.rest;
  // Reachable only for a round token the strict pattern rejected — `-v0`, `-v01`.
  if (/^-v[0-9]+\.md$/.test(rest)) return { ok: false, reason: "bad_round" };
  return { ok: false, reason: "trailing_junk" };
}

/**
 * Derive the round window for one phase entry from ONE directory listing.
 *
 * Step 4 is the H-1 fix in a line: `startIndex` is one past the highest round
 * index already on the branch, so re-entering a phase never rewrites an existing
 * `-v{N}` cross-review. Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET
 * rather than an absolute cap — on a branch whose highest existing round is 3,
 * the re-entered phase starts at 4 and gets rounds 4…8, five rounds, not two.
 *
 * `present` and `skipped` are both carried out (step 7) precisely so one listing
 * suffices for the whole phase entry: a caller that had to re-enumerate, or
 * re-parse the listing itself, would violate AC-1.2 and the §2.4 layering rule.
 *
 * Step 5 halts rather than guessing: two files claiming round 1 for one role and
 * doc type may carry different verdicts, so picking either is a coin flip on
 * whether the phase is skipped, and picking "the newer" would import a filesystem
 * timestamp into an otherwise purely content-addressed decision.
 *
 * Synchronous, total, and takes no seam (§3.7).
 *
 * @param {string[]} basenames - the directory listing, basenames only.
 * @param {string} docType - the document type under derivation.
 * @returns {{ok: true, startIndex: number, endIndex: number,
 *            present: Map<string, number[]>,
 *            skipped: Array<{basename: string, reason: string}>}
 *          |{ok: false, reason: "malformed_round_one_duplicate", role: string}}
 */
function deriveRoundWindow(basenames, docType) {
  const listing = Array.isArray(basenames) ? basenames : [];
  // Deduplicated by basename, in the listing's own order — `skipped` is reported
  // in that order and `present` records each round index once.
  const unique = listing.filter((b, i) => listing.indexOf(b) === i);

  // Step 1 — parse every basename, keeping BOTH the entries and the rejects.
  const present = new Map();
  const skipped = [];
  // Per (role) record of which round-1 spelling was seen, for step 5.
  const roundOneForms = new Map();

  for (const basename of unique) {
    const result = parseReviewFilename(basename);
    if (!result.ok) {
      skipped.push({ basename, reason: result.reason });
      continue;
    }
    // A well-formed cross-review for a DIFFERENT doc type is a third outcome:
    // neither an entry nor a reject (§5.2, §8.2's partition property).
    if (result.docType !== docType) continue;

    // Step 2 — per-role round indices, deduplicated.
    const rounds = present.get(result.role) || [];
    if (!rounds.includes(result.round)) rounds.push(result.round);
    present.set(result.role, rounds);

    if (result.round === 1) {
      const forms = roundOneForms.get(result.role) || { plain: false, v1: false };
      if (result.suffixed) forms.v1 = true;
      else forms.plain = true;
      roundOneForms.set(result.role, forms);
      // Step 5 — one role, one doc type, two files both claiming round 1.
      if (forms.plain && forms.v1) {
        return {
          ok: false,
          reason: "malformed_round_one_duplicate",
          role: result.role,
        };
      }
    }
  }

  // Steps 3, 4 and 6.
  const indices = [];
  for (const rounds of present.values()) for (const round of rounds) indices.push(round);
  const startIndex = indices.length ? Math.max(...indices) + 1 : 1;
  const endIndex = windowEnd(startIndex);

  // Step 7.
  return { ok: true, startIndex, endIndex, present, skipped };
}

/**
 * The last round index of the review window that opens at `startIndex`.
 *
 * This is the SOLE place in the module where the window width is expressed in
 * terms of `MAX_REVIEW_ROUNDS`. `reviewLoop` takes `endIndex` as a parameter and
 * defaults it through this helper rather than recomputing the arithmetic, so the
 * budget can never be re-derived (and so drift) inside the loop itself.
 *
 * @param {number} startIndex
 * @returns {number}
 */
function windowEnd(startIndex) {
  return startIndex + MAX_REVIEW_ROUNDS - 1;
}

// ─── TSPEC §5.6.3 — the two prompt kinds, and the section walk behind them ────

/** The doc type an artifact path names, e.g. `docs/f/FSPEC-f.md` → `"FSPEC"`. */
function docTypeFromPath(path) {
  const m = /\/([A-Z]+)-[^/]+\.md$/.exec(String(path ?? ""));
  return m ? m[1] : null;
}

/**
 * §5.9's artifact class for a target path. The three special classes are
 * recognised by their filename convention; everything else is a spec-class
 * document, which is also the safe default for Phase CR's directory target
 * (`topLevelSections` of an unreadable target is empty, so the wrapper's
 * unmeasurable-target escape takes over — see `dispatchAndVerify`).
 */
function artifactClassOf(path) {
  const name = String(path ?? "");
  if (/\/CROSS-REVIEW-[^/]*$/.test(name)) return "cross-review";
  if (/\/CODE_REVIEW-[^/]*$/.test(name)) return "code-review";
  if (/\/LEARNINGS-[^/]*$/.test(name)) return "LEARNINGS";
  return "spec";
}

/**
 * The heading the resume prompt names — **never empty** (§15.5's closing
 * guarantee). It reuses the same module-scope walk `isComplete` uses; a second
 * heading walker would be a second oracle for the same question.
 *
 * Resolution order:
 * 1. an absent or blank target has no sections at all, so the resume prompt names
 *    the skeleton rather than a heading;
 * 2. a cross-review is scored whole-file (§5.9), so its one unwritten "section" is
 *    the trailing verdict block — the only thing its criterion can be missing;
 * 3. otherwise the first top-level section whose body is empty, by document order;
 * 4. otherwise the first required heading `isComplete` reports missing.
 *
 * @param {string} artifactClass
 * @param {string} docType
 * @param {string|null} text
 * @returns {string}
 */
function firstUnwrittenSection(artifactClass, docType, text) {
  const body = String(text ?? "");
  if (body.trim() === "") return "the document skeleton (no content on disk yet)";
  if (artifactClass === "cross-review" && !crossReviewComplete(body)) {
    return '(the trailing "## Verdict" section)';
  }
  const sections = topLevelSections(body);
  const unwritten = sections.find((s) => isEmptyBody(s.body));
  if (unwritten) return unwritten.title;
  const { missing } = isComplete(artifactClass, docType, body);
  if (Array.isArray(missing) && missing.length > 0) return missing[0];
  return "the closing pass over the whole document";
}

/**
 * §5.6.3's shared clause, carried by every wrapped authoring **and** review
 * dispatch. `skillFiles.test.js` pins the same three literals in the SKILL
 * templates, so the runtime prompt and the SKILL text say one thing.
 */
const PACING_CONTRACT_CLAUSE = [
  "Pacing contract (H-3): lay down the skeleton first, then write ONE top-level",
  "section per edit, keep every single write under 12,000 bytes, and commit after",
  "each section. A monolithic write is killed by the 180 s stall watchdog and loses",
  "everything it had not yet flushed.",
].join(" ");

/**
 * §6.3's branch pin, carried by every dispatch prompt that ends in a commit.
 *
 * The orchestrator's guard already placed the tree on the branch; this clause is
 * the agent-side half of the same invariant — a last-moment check by the one
 * process that is about to write, and an explicit prohibition on "fixing" the
 * branch itself, because reviewers run in parallel in one shared tree and a
 * checkout by either of them lands on the other. Fully substituted, per §6.3: no
 * un-substituted placeholder reaches an operator-facing (or agent-facing) string.
 */
function branchPinClause(feature) {
  const branch = featureBranchName(feature);
  return (
    `All commits for this task must land on branch ${branch}. ` +
    "Immediately before each commit run `git rev-parse --abbrev-ref HEAD`; if it prints " +
    "anything else — especially the default branch — STOP and report instead of committing. " +
    "Do not run `git checkout` yourself; the orchestrator has already placed the tree on the branch."
  );
}

/** The greenfield opener for a target that is not on disk yet. */
function skeletonClause() {
  return (
    "This artifact is not on disk yet. Begin by laying out its top-level headings " +
    "as a skeleton, then fill them one at a time under the pacing contract above."
  );
}

/**
 * The resume opener (§5.6.3 clause 2, FSPEC §15.5): the target already carries
 * partial content, so the dispatch continues it instead of starting over. The
 * section count and the heading are MEASUREMENTS the caller passes in — this
 * script's own walk over the bytes (`isComplete` / `firstUnwrittenSection`), or
 * `_probeDoc`'s answer over the same criterion. The agent is never asked where it
 * got to, under either.
 */
function resumeClause({ T, S, firstUnwritten, targetPath }) {
  return [
    `RESUMED: ${targetPath} already carries partial content`,
    `(${S} of ${T} top-level sections carry a body).`,
    "Read the document on disk first and do NOT rewrite what is already written.",
    `The first unwritten section is ${firstUnwritten}.`,
    "Continue from there, one section per write, under the pacing contract above.",
  ].join(" ");
}

/**
 * The continuation opener (§5.6.3 clause 3, FSPEC §15.5): a revision-mode episode
 * is addressing a specific round's findings on a document an earlier, interrupted
 * dispatch may already have partly edited. The five clauses `RLH-AT-48` inspects
 * are all here, and the cross-review basenames are the ones the episode's own
 * refresh actually saw on disk — never a name derived from arithmetic.
 *
 * The round is written in lower case deliberately: the acceptance harness reads
 * `Iteration N` out of prompts to key episodes, and a capitalised restatement here
 * would re-key the episode mid-flight.
 */
function continuationClause(round, reviewBasenames, targetPath) {
  const named = reviewBasenames.length > 0 ? reviewBasenames.join(", ") : "the cross-reviews of this round";
  return [
    `CONTINUATION of round ${round}. ${targetPath} may have been partially edited`,
    "already by an earlier dispatch that was interrupted mid-write.",
    `Address the findings in: ${named}.`,
    "Read the document on disk first and apply only what is not already reflected",
    "there; do NOT rewrite passages that already carry the change.",
    "When every finding this round owes has been applied, end your reply with the",
    "line `REVISION-COMPLETE: yes`. If you were stopped before finishing, end it",
    "with `REVISION-COMPLETE: no` instead.",
  ].join(" ");
}

// ─── TSPEC §5.6.1 S-INV — refreshReviewState ─────────────────────────────────

/**
 * Re-read the branch's review record for one (feature, doc type), at the instant
 * an episode begins. **This is S-INV**: `selectMode` is never handed a snapshot
 * taken before the loop, because on a clean branch such a snapshot stays empty for
 * the life of the phase and every optimizer episode then selects greenfield
 * (TE-v2 N-01).
 *
 * The `ListFailure` disposition lives HERE, above the `deriveRoundWindow` call, so
 * that a listing which cannot be judged never reaches the round derivation:
 *
 * | reason | disposition |
 * |---|---|
 * | `dir_missing` | benign — the feature directory has no reviews yet, `files ← []` |
 * | `not_a_directory`, `unreadable`, `bad_argument` | halt — "not read" is never "no findings" |
 *
 * @param {{feature: string, docType: string|null, _listFiles: function, _readFile: function}} arg
 * @returns {Promise<{ok: true, startIndex: number, endIndex: number,
 *                    present: Map, reviewFiles: Map, matched: object[], files: string[]}
 *                  |{ok: false, message: string}>}
 */
async function refreshReviewState({ feature, docType, _listFiles, _readFile }) {
  const dirPath = `docs/${feature}`;
  const listing = await _listFiles(dirPath);

  let files = [];
  if (listing && listing.ok) {
    files = Array.isArray(listing.files) ? listing.files : [];
  } else {
    const reason = (listing && listing.reason) || "unreadable";
    if (reason !== "dir_missing") {
      return { ok: false, message: `Cannot enumerate ${dirPath}: ${reason}` };
    }
  }

  const window = deriveRoundWindow(files, docType);
  if (!window.ok) {
    return {
      ok: false,
      message: `Cannot derive the review round window for ${docType} in ${dirPath}: ${window.reason} (role ${window.role})`,
    };
  }

  // The verdict record rule 2 reads. Unreadable is recorded as unreadable, never
  // downgraded to "no findings" — the two directions are not symmetric (§5.6.1).
  //
  // §5.6.1 pins WHICH files are opened: "§5.4's tier-1 reads over round
  // `w.startIndex - 1`, or empty when that is < 1". Reading every matched
  // basename instead would blow §5.4's two-`_readFile` fan-out and would open
  // rounds the approval search is forbidden to descend to (`RLH-AT-09`,
  // `RLH-AT-57`). `matched` still carries every round — it is derived from the
  // listing, costs no read, and `dispatchAndVerify` names the revision round's
  // files from it.
  const candidate = window.startIndex - 1;
  const reviewFiles = new Map();
  const matched = [];
  for (const basename of files) {
    const parsed = parseReviewFilename(basename);
    if (!parsed.ok || parsed.docType !== docType) continue;
    matched.push({ basename, role: parsed.role, round: parsed.round });
    if (parsed.round !== candidate) continue;
    const text = await _readFile(`${dirPath}/${basename}`);
    const parsedVerdict = extractFileVerdict(text, parsed.role);
    const anchor = parseApprovalHash(text);
    reviewFiles.set(`${parsed.role}:${parsed.round}`, {
      verdict: parsedVerdict.ok ? parsedVerdict.verdict : null,
      verdictReadable: parsedVerdict.ok && parsedVerdict.malformed !== true,
      anchorHash: anchor.ok ? anchor.hash : null,
      anchorReason: anchor.ok ? null : anchor.reason,
      path: `${dirPath}/${basename}`,
    });
  }

  return {
    ok: true,
    startIndex: window.startIndex,
    endIndex: window.endIndex,
    present: window.present,
    reviewFiles,
    matched,
    files,
  };
}

// ─── TSPEC §5.8 — the POSTMORTEM query (§2.5 step G's subject) ───────────────

/**
 * Ask whether this (phase, feature) carries a POSTMORTEM, and whether a human
 * has resolved it (§5.8).
 *
 * This is a **query, not a gate**. It never decides on its own whether a phase
 * runs; the refusal lives at §2.5 step G, which is the single point every
 * phase-running exit converges on (G-INV). Putting the refusal in here would
 * invert AC-2.3b, because step 4's `FRESH` branch calls it for REPORTING ONLY.
 *
 * Absent or malformed marker ⇒ `unresolved`. Fail closed: a POSTMORTEM whose
 * marker cannot be read costs an operator one edit, whereas the opposite default
 * silently re-runs a phase that previously failed for an unfixed reason.
 *
 * @param {{phase: string, feature: string, _readFile: function}} arg
 * @returns {Promise<{status: "none"|"resolved"|"unresolved", path: string,
 *                    recommendation?: string}>}
 */
async function checkPostmortem({ phase, feature, _readFile }) {
  const path = `docs/${feature}/POSTMORTEM-${phase}-${feature}.md`;
  const text = await _readFile(path);
  if (text == null || String(text).trim() === "") return { status: "none", path };

  const marker = parseResolvedMarker(text);
  if (marker.ok && marker.resolved) return { status: "resolved", path };
  return { status: "unresolved", path, recommendation: extractRecommendation(text) };
}

// ─── The optional probe seams — `_probeDoc`, `_probeReviewState`, `_probePostmortem` ─
//
// Every content read in this module crosses `_readFile`, which in the workflow
// runtime is a probe agent plus roughly one transcription agent per 6 KB. But the
// module almost never wants the content: it wants a JUDGMENT about it — the
// document's digest, its structural completeness, its round record, a POSTMORTEM's
// resolved marker. A probe seam answers that judgment at the FAR side of the
// transport, so the bytes never enter this module at all.
//
// The invariant that makes them safe to add anywhere: **a probe is an
// optimisation, never a correctness dependency.** Absent, `null`, ill-shaped or
// throwing, every one of the three falls back to the byte-taking path it replaced,
// which runs unchanged. That is why the resolvers below swallow the throw rather
// than propagating it — a probe that fails is a probe that was not there.
//
// The one exception is `_probeReviewState`'s explicit `{ok: false, message}`: that
// is not a failed probe but a SUCCESSFUL judgment that the review state cannot be
// derived, and it maps onto exactly the halt `refreshReviewState`'s own `ok: false`
// produces (§5.6.1, §6.2 rows 2 and 17). Downgrading it to a fallback would re-read
// the listing this module was just told it cannot judge.

/**
 * The absent probe — the shipped default of all three seams, and the value that
 * makes each of them a POLICY rather than a capability: a probe that is `null` is
 * a probe that was never installed, and every site falls back. Named rather than
 * spelled `null` at each site so the composition-root oracle (`RLH-AT-64`) can
 * resolve the default to a module-level non-function value, which is what
 * distinguishes "this parameter needs no runtime wiring" from "someone forgot to
 * wire it".
 */
const NO_PROBE = null;

/**
 * `_probeDoc(path, docType)` — one document's state, without its bytes:
 * `{ok, exists, empty, hash, artifactClass, complete, missing, T, S,
 *   firstUnwritten, anchors}`, semantically identical to reading the document and
 * applying `approvalHashOf` / `isComplete` / `firstUnwrittenSection` /
 * `approvalAnchorPreCount` to it.
 *
 * @returns {Promise<object|null>} the probe record, or `null` to fall back.
 */
async function probeDocument(probe, path, docType) {
  if (typeof probe !== "function") return null;
  try {
    const result = await probe(path, docType);
    return result && result.ok === true ? result : null;
  } catch {
    return null;
  }
}

/**
 * The `{ok: true}` half of a `_probeReviewState` reply, with its two maps
 * rehydrated: `present` arrives as `{role: number[]}` and `reviewFiles` as an
 * object keyed `"role:round"`, because the seam is a JSON transport and a `Map`
 * does not survive it. `selectMode` reads both through `Map`'s interface, so the
 * rehydration is not cosmetic (§5.6.1 rule 4's `present.forEach`, rule 2's
 * `files.get`).
 */
function rehydrateReviewState(result) {
  const present = new Map();
  const rawPresent = result.present && typeof result.present === "object" ? result.present : {};
  for (const role of Object.keys(rawPresent)) {
    present.set(role, Array.isArray(rawPresent[role]) ? rawPresent[role].slice() : []);
  }

  const reviewFiles = new Map();
  const rawFiles = result.reviewFiles && typeof result.reviewFiles === "object" ? result.reviewFiles : {};
  for (const key of Object.keys(rawFiles)) reviewFiles.set(key, rawFiles[key]);

  return {
    ok: true,
    startIndex: result.startIndex,
    endIndex: result.endIndex,
    present,
    reviewFiles,
    matched: Array.isArray(result.matched) ? result.matched : [],
    files: Array.isArray(result.files) ? result.files : [],
  };
}

/**
 * `refreshReviewState`'s result, from `_probeReviewState` when that seam can
 * answer and from the local computation otherwise. Both arms return the SAME
 * shape, including the `{ok: false, message}` a caller turns into a halt.
 *
 * @param {{feature: string, docType: string|null, _listFiles: function,
 *          _readFile: function, _probeReviewState: function|null}} arg
 */
async function resolveReviewState({ feature, docType, _listFiles, _readFile, _probeReviewState }) {
  if (typeof _probeReviewState === "function") {
    let probed = null;
    try {
      probed = await _probeReviewState({ feature, docType });
    } catch {
      probed = null;
    }
    if (probed && probed.ok === false) return { ok: false, message: probed.message };
    if (probed && probed.ok === true) return rehydrateReviewState(probed);
  }
  return refreshReviewState({ feature, docType, _listFiles, _readFile });
}

/** The closed status catalogue §5.8 answers with, and `_probePostmortem` reports. */
const POSTMORTEM_STATUSES = Object.freeze(["none", "resolved", "unresolved"]);

/**
 * `checkPostmortem`'s result, from `_probePostmortem` when that seam can answer
 * and from the local read otherwise. A reply whose `status` is outside §5.8's
 * closed catalogue is not a judgment this module can act on, so it falls back
 * rather than being coerced — fail-closed stays with `checkPostmortem`.
 *
 * @param {{phase: string, feature: string, _readFile: function,
 *          _probePostmortem: function|null}} arg
 */
async function resolvePostmortem({ phase, feature, _readFile, _probePostmortem }) {
  if (typeof _probePostmortem === "function") {
    let probed = null;
    try {
      probed = await _probePostmortem({ phase, feature });
    } catch {
      probed = null;
    }
    if (probed && POSTMORTEM_STATUSES.includes(probed.status)) return probed;
  }
  return checkPostmortem({ phase, feature, _readFile });
}

/**
 * §5.6.2's view of one target, taken through `_probeDoc` when that seam answers
 * and through `_readFile` otherwise. The two arms carry the same fields, so
 * `dispatchAndVerify`'s loop reads only these and never branches on which it got:
 *
 * | field | meaning |
 * |---|---|
 * | `probed` | which arm produced this record — the loop compares only LIKE records |
 * | `identity` | the value progress is scored on: the bytes on the read arm, the digest on the probe arm |
 * | `empty` | the skeleton-opener test (§5.6.3 clause 1) |
 * | `measured` | `isComplete`'s `{complete, missing, T, S}` |
 * | `firstUnwritten` | the heading the resume opener names |
 *
 * `firstUnwritten` is computed EAGERLY on the read arm even though only the resume
 * opener reads it: it keeps the record total, and both are pure walks over bytes
 * this arm already holds.
 */
async function targetState({ targetPath, artifactClass, docType, _readFile, _probeDoc }) {
  const probe = await probeDocument(_probeDoc, targetPath, docType);
  if (probe) {
    return {
      probed: true,
      identity: probe.hash ?? null,
      empty: probe.empty === true,
      measured: {
        complete: probe.complete === true,
        missing: Array.isArray(probe.missing) ? probe.missing : [],
        T: probe.T ?? 0,
        S: probe.S ?? 0,
      },
      firstUnwritten: probe.firstUnwritten,
    };
  }
  const text = await _readFile(targetPath);
  return {
    probed: false,
    identity: text,
    empty: String(text ?? "").trim() === "",
    measured: isComplete(artifactClass, docType, text),
    firstUnwritten: firstUnwrittenSection(artifactClass, docType, text),
  };
}

// ─── TSPEC §5.4 — the approval search (the H-4 fix) ──────────────────────────

/** The shape every non-approving exit of the search returns (§5.4). */
function noApprovalRecord(candidate, unevaluable = []) {
  return { approving: false, candidate, hash: null, unevaluable, tier1Empty: false };
}

/**
 * TIER 1 — the candidate round's per-role CROSS-REVIEW records (§5.4).
 *
 * Pure: the reads were already performed by `refreshReviewState`, which §5.6.1
 * defines as "§5.4's tier-1 reads over round `startIndex - 1`". That is what
 * holds the fan-out at **two `_readFile` per phase entry** — this function opens
 * nothing.
 *
 * Four properties, each load-bearing:
 *   - single-highest-round candidate, **no descending walk** (`RLH-AT-57`);
 *   - a role's absent `-v{candidate}` is **not approving**, not partially
 *     approving (`RLH-AT-10`);
 *   - unanimity is `isPass` on every role AND identical anchor hashes — a
 *     partial or disagreeing anchor pair adopts neither value (`RLH-AT-56`);
 *   - a duplicated `VERDICT:` line already failed closed upstream, in §5.1
 *     (`RLH-AT-11`).
 *
 * @param {{reviewers: string[], startIndex: number, reviewFiles: Map}} arg
 * @returns {{approving: boolean, candidate: number, hash: string|null,
 *            unevaluable: string[], tier1Empty: boolean}}
 */
function tier1ApprovalRecord({ reviewers, startIndex, reviewFiles }) {
  const candidate = startIndex - 1;
  if (candidate < 1) return noApprovalRecord(candidate);

  const roles = reviewers.map((skill) => reviewerRoleSlug(skill) || skill);
  const records = roles.map((role) => reviewFiles.get(`${role}:${candidate}`) || null);

  // "Tier 1 produced a file at all" is what makes the tiers exclusive.
  if (records.every((r) => r === null)) {
    return { ...noApprovalRecord(candidate), tier1Empty: true };
  }
  // Role-asymmetry: one reviewer wrote the candidate round and the other did not.
  if (records.some((r) => r === null)) return noApprovalRecord(candidate);

  // §6.2 row 6: an absent, duplicated or unparseable anchor is UNEVALUABLE and
  // the offending file is named in the report. Adopting the *other* file's value
  // is the failure FSPEC §19 calls out.
  const unevaluable = records.filter((r) => !r.anchorHash).map((r) => r.path);
  const verdictsPass = records.every((r) => r.verdictReadable && isPass(r.verdict));
  if (!verdictsPass || unevaluable.length) return noApprovalRecord(candidate, unevaluable);

  const hashes = records.map((r) => r.anchorHash);
  if (!hashes.every((h) => h === hashes[0])) {
    // Disagreement: neither value may be adopted, so BOTH files are offending.
    return noApprovalRecord(candidate, records.map((r) => r.path));
  }

  return { approving: true, candidate, hash: hashes[0], unevaluable: [], tier1Empty: false };
}

/** The `## 6. Approval Record` heading tier 2 reads by name (§4.4, §5.4). */
const APPROVAL_RECORD_HEADING = /^\s*##\s+\d*\.?\s*Approval Record\s*$/;

/**
 * TIER 2 — `## 6. Approval Record` in `LEARNINGS-{feature}.md` (§5.4).
 *
 * Consulted **only** when the candidate round produced no cross-review file at
 * all: the tiers are exclusive, so there is no "both tiers disagree" merge to
 * specify and no cross-tier completion (`RLH-AT-10` falsifies both).
 *
 * Under §5.2's `startIndex = max(present) + 1`, `candidate` is by construction a
 * round some role holds, so post-harvest — the case this tier was written for —
 * `present` is empty, `candidate` is 0 and §5.4's `candidate < 1` exit fires
 * first (FSPEC §12.4 example B). This path therefore survives for a listing that
 * changes under the run, and is deliberately kept rather than folded away: the
 * grammar it reads is the one harvest writes (§4.4, RLH-09).
 *
 * @param {{feature: string, docType: string, candidate: number,
 *          reviewers: string[], _readFile: function}} arg
 */
async function tier2ApprovalRecord({ feature, docType, candidate, reviewers, _readFile }) {
  const text = await _readFile(`docs/${feature}/LEARNINGS-${feature}.md`);
  if (text == null) return noApprovalRecord(candidate);

  const rows = [];
  let inSection = false;
  scanLines(text, (line) => {
    if (APPROVAL_RECORD_HEADING.test(line)) {
      inSection = true;
      return;
    }
    if (!inSection) return;
    if (/^\s*#{1,2}\s/.test(line)) {
      inSection = false;
      return;
    }
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 8) return; // leading + 6 columns + trailing
    rows.push(cells.slice(1, 7));
  });

  const roles = reviewers.map((skill) => reviewerRoleSlug(skill) || skill);
  const matched = roles.map((role) =>
    rows.find((r) => r[0] === docType && Number(r[1]) === candidate && r[2] === role) || null
  );
  if (matched.some((r) => r === null)) return noApprovalRecord(candidate);
  if (!matched.every((r) => isPass(r[3]))) return noApprovalRecord(candidate);

  const hashes = matched.map((r) => r[4]);
  if (!hashes.every((h) => APPROVAL_HASH_VALUE_RE.test(h) && h === hashes[0])) {
    return noApprovalRecord(candidate);
  }
  return { approving: true, candidate, hash: hashes[0], unevaluable: [], tier1Empty: false };
}

// ─── TSPEC §3.8 — dispatchAndVerify ──────────────────────────────────────────

/** An authoring-budget halt: caught by `reviewLoop`, which turns it into a return. */
function authoringHaltError(message, trailerReason) {
  const err = haltError(message);
  err.isAuthoringHalt = true;
  err.trailerReason = trailerReason ?? null;
  return err;
}

/**
 * Dispatch one agent episode and verify its outcome against §5.6.2, re-dispatching
 * inside the episode until it is terminal or a budget ends it. **Deliberately not
 * exported** (§3.8) — its behaviour is observed through `main()` and `reviewLoop`.
 *
 * Order of evaluation, which is the whole of the H-3 fix:
 * 1. **terminal first, then progress**. A dispatch that writes nothing and declares
 *    the round complete is terminal; scoring progress first would re-dispatch it.
 * 2. progress is `before !== after` over the WORKING TREE — not "a section was
 *    completed", and not a git diff (§5.6.2, `RLH-AT-45`).
 *
 * **Both observations of the target go through `targetState`**, so the optional
 * `_probeDoc` seam answers them without the document's bytes ever crossing into
 * this module, and an absent or failing probe falls back to `_readFile` with the
 * loop below unchanged.
 *
 * **The unmeasurable-target escape.** When the target yields no top-level sections
 * at all *and* the dispatch changed nothing, this wrapper has no measurement to
 * make: `isComplete` cannot score a document it cannot see. Re-dispatching such an
 * episode to the budget would convert every unmeasurable target (Phase CR's
 * directory; any caller whose read seam is a stub) into a halt. The episode is
 * therefore terminal after one dispatch — exactly the pre-feature behaviour.
 *
 * @returns {Promise<{response: any, mode: string, round: number|null,
 *                    invocations: number, wroteBytes: boolean}>}
 */
async function dispatchAndVerify({
  skill,
  basePrompt,
  targetPath,
  docType,
  feature,
  dispatchKind,
  phaseId,
  model,
  _agent,
  _readFile,
  _listFiles,
  _probeDoc,
  _probeReviewState,
  _log,
  _git,
}) {
  const emit = typeof _log === "function" ? _log : () => {};
  const artifactClass = artifactClassOf(targetPath);

  // §5.6.1: mode is computed ONCE per episode, at the episode's entry, over state
  // this episode itself observed.
  let selection;
  let roundFiles = [];
  if (dispatchKind === "authoring") {
    const state = await resolveReviewState({
      feature,
      docType,
      _listFiles,
      _readFile,
      _probeReviewState,
    });
    if (!state.ok) throw haltError(state.message);
    selection = selectMode({
      dispatchKind,
      docType,
      present: state.present,
      reviewFiles: state.reviewFiles,
      startIndex: state.startIndex,
    });
    if (selection.mode === "revision") {
      roundFiles = state.matched
        .filter((m) => m.round === selection.round)
        .map((m) => m.basename);
    }
  } else {
    selection = selectMode({
      dispatchKind,
      docType,
      present: new Map(),
      reviewFiles: new Map(),
      startIndex: 1,
    });
  }

  let invocations = 0;
  let consecutiveNoProgress = 0;
  let wroteBytes = false;
  let lastTrailerReason = null;
  let response = null;
  // The episode's structural baseline — see `isTerminal`. Measured ONCE, over the
  // bytes this episode entered on, and only for a revision episode over a spec:
  // every other combination keeps the strict test.
  let entryMissing = null;
  let lastMeasured = null;
  // Single-read-per-dispatch: `before` is taken from the target ONCE, on the
  // episode's first iteration. On every later iteration this episode's own prior
  // `after` — already known to describe the current on-disk state, since the
  // dispatched skill is the only writer of `targetPath` during an episode — is
  // reused as `before`, saving a full-file subagent echo per iteration. Trade-off:
  // a concurrent external edit between iterations is attributed to the agent as
  // progress; the previous per-iteration re-read tolerated that.
  let before = null;
  const observe = () =>
    targetState({ targetPath, artifactClass, docType, _readFile, _probeDoc });

  for (;;) {
    if (invocations === 0) {
      before = await observe();
    }
    invocations += 1;
    if (invocations === 1 && selection.mode === "revision" && artifactClass === "spec") {
      entryMissing = before.measured.missing;
    }

    let opener;
    if (selection.mode === "revision") {
      opener = continuationClause(selection.round, roundFiles, targetPath);
    } else if (invocations === 1 && before.empty) {
      opener = skeletonClause();
    } else {
      opener = resumeClause({
        T: before.measured.T,
        S: before.measured.S,
        firstUnwritten: before.firstUnwritten,
        targetPath,
      });
    }
    const prompt = `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}`;

    let faulted = false;
    try {
      response = await _agent(skill, prompt, model ? { model } : undefined);
    } catch {
      faulted = true;
      response = null;
    }
    if (faulted) {
      // §15.4: only a THROWN dispatch is a runtime fault. A reply with no trailer
      // is an omission, and an implementation that cannot tell them apart reports
      // a kill that did not happen.
      emit(`Dispatch fault observed: faultObserved=true (${skill}, phase ${phaseId}).`);
    }

    const after = await observe();
    const measured = after.measured;
    lastMeasured = measured;
    const verdict = terminalFrom(
      selection.mode,
      response ?? "",
      artifactClass,
      measured,
      entryMissing
    );
    lastTrailerReason = verdict.trailerReason;
    // §5.6.2's progress predicate, over whichever identity BOTH records carry:
    // the bytes on the read arm, the digest on the probe arm (two `null` digests
    // — an absent document, twice — are not progress). The arms are never
    // compared across each other: a probe that answered one observation and fell
    // back on the next leaves two incomparable identities, and scoring that as
    // progress spends dispatches rather than mis-halting an episode as stalled.
    const progressed =
      before.probed === after.probed ? before.identity !== after.identity : true;
    if (progressed) wroteBytes = true;
    before = after;

    if (verdict.terminal) break;
    // The unmeasurable-target escape — see the doc comment above.
    if (measured.T === 0 && !progressed) break;

    consecutiveNoProgress = progressed ? 0 : consecutiveNoProgress + 1;
    const sections = `(${measured.S} of ${measured.T} sections complete)`;
    const trailerNote = lastTrailerReason ? `; last trailer outcome: ${lastTrailerReason}` : "";

    if (consecutiveNoProgress >= MAX_AUTHORING_ATTEMPTS) {
      throw authoringHaltError(
        `Phase ${phaseId}: ${skill} made no progress across ${MAX_AUTHORING_ATTEMPTS} consecutive attempts on ${targetPath} ${sections}${trailerNote}.`,
        lastTrailerReason
      );
    }
    if (invocations >= MAX_AUTHORING_DISPATCHES) {
      throw authoringHaltError(
        `Phase ${phaseId}: ${skill} spent ${MAX_AUTHORING_DISPATCHES} dispatches without reaching structural completeness on ${targetPath} ${sections}${trailerNote}.`,
        lastTrailerReason
      );
    }
  }

  if (selection.mode === "revision") {
    emit(`Phase ${phaseId} round ${selection.round}: episode ended on the author's REVISION-COMPLETE trailer.`);
    // A shortfall the episode inherited is carried over rather than fixed. That is
    // deliberate (see `isTerminal`) but it must not be silent: the operator is the
    // only one who can decide whether the document should be retro-fitted.
    const carried = lastMeasured && Array.isArray(lastMeasured.missing) ? lastMeasured.missing : [];
    if (carried.length > 0) {
      emit(
        `Phase ${phaseId} round ${selection.round}: ${targetPath} carries a pre-existing structural shortfall, unchanged since this episode began and therefore not blocking — missing canonical headings: ${carried.join(", ")}.`
      );
    }
  }
  await advisoryPacingCheck({ wroteBytes, targetPath, _git, emit });

  return {
    response,
    mode: selection.mode,
    round: selection.round,
    invocations,
    wroteBytes,
    // The target's top-level-section count as last measured — i.e. whether this
    // episode's target was measurable at all (see the unmeasurable-target escape
    // above: a target `isComplete` cannot score, e.g. Phase CR's directory
    // target, also has `measuredT === 0`). A caller deciding whether "wrote
    // nothing" is meaningful must not conflate "genuinely unchanged" with
    // "nothing to measure in the first place".
    measuredT: lastMeasured ? lastMeasured.T : 0,
    trailerReason: lastTrailerReason ?? null,
  };
}

/**
 * §15.7's advisory proxy for "did that section land in one over-large write?".
 * No oracle for emitted bytes exists, so the per-artifact commit diff stands in —
 * and it is **advisory only**: it is reported and never halts anything (O-20).
 */
async function advisoryPacingCheck({ wroteBytes, targetPath, _git, emit }) {
  if (!wroteBytes || typeof _git !== "function") return;
  let result;
  try {
    result = await _git(["diff", "--numstat", "--", targetPath]);
  } catch {
    return;
  }
  const stdout = result && typeof result.stdout === "string" ? result.stdout : "";
  for (const line of stdout.split("\n")) {
    const m = /^(\d+)\t(\d+)\t(.+)$/.exec(line.trim());
    if (!m) continue;
    const added = Number(m[1]);
    if (added <= MAX_AUTHORING_WRITE_BYTES) continue;
    emit(
      `Advisory pacing check: ${m[3]} shows ${added} added lines against the ` +
        `${MAX_AUTHORING_WRITE_BYTES} per-write figure. That figure is advisory ` +
        `only — it is a proxy, not an oracle, and never a halt condition.`
    );
  }
}

/**
 * Build the reviewer dispatch prompt. Iteration 1 is a full first-pass review.
 * Iteration ≥2 appends the delta re-review protocol so the reviewer reads its own
 * previous cross-review and scans only the diff instead of re-reviewing the whole
 * document from scratch — the approval bar and VERDICT contract are unchanged.
 * @param {string} doc
 * @param {string} phase
 * @param {string} feature
 * @param {number} iteration
 * @param {string} [reviewer] - reviewer skill id (for the prior-cross-review path)
 * @returns {string}
 */
function reviewerPrompt(doc, phase, feature, iteration, reviewer, docType) {
  const base =
    `Review the document at ${doc} for phase ${phase} of feature ${feature}. This is iteration ${iteration}.\n` +
    branchPinClause(feature);
  if (iteration < 2) return base;

  const prev = iteration - 1;
  const role = reviewerRoleSlug(reviewer);
  // §6.3's general rule: NO un-substituted template reaches an operator-facing
  // string. `{DOC-TYPE}` and `{role}` were literal braces the reader had to
  // resolve by hand; both are known here.
  const type = docType || docTypeFromPath(doc) || "REVIEW";
  const priorFile = role
    ? `docs/${feature}/CROSS-REVIEW-${role}-${type}-v${prev}.md (your reviewer role is "${role}")`
    : `your own previous cross-review file for this document (docs/${feature}/CROSS-REVIEW-*-${type}-v${prev}.md — find your reviewer role's file for iteration v${prev})`;

  return (
    `${base}\n` +
    `This is a re-review — follow the delta re-review protocol:\n` +
    `1. First read your own previous cross-review file: ${priorFile}.\n` +
    `2. Run \`git diff\` on ${doc} against the commit you last reviewed to see exactly what changed.\n` +
    `3. Verify each of your previous findings is resolved; scan ONLY the changed sections for new issues. ` +
    `Do not re-review unchanged sections you already approved.\n` +
    `4. The approval bar is unchanged: any open High or Medium finding anywhere in the document — old or new — means Needs revision.\n` +
    `Write your new cross-review as v${iteration} and end with the standard VERDICT trailer.`
  );
}

function optimizerPrompt(doc, phase, feature, iteration, reviewers = [], docType) {
  const base =
    `Address reviewer feedback on ${doc} for phase ${phase} of feature ${feature}. ` +
    `Iteration ${iteration} reviewers found issues. Update and commit.\n` +
    branchPinClause(feature);

  // Point the optimizer straight at this iteration's cross-review files so it does
  // not hunt for them. Both reviewer roles' expected paths for v{iteration}.
  const roles = reviewers.map(reviewerRoleSlug).filter(Boolean);
  const type = docType || docTypeFromPath(doc) || "REVIEW";
  let feedback = "";
  if (roles.length > 0) {
    const paths = roles
      .map((role) => `docs/${feature}/CROSS-REVIEW-${role}-${type}-v${iteration}.md`)
      .join(" and ");
    feedback =
      `\nRead the reviewers' cross-review files for this iteration directly: ${paths} ` +
      `(equivalently, all CROSS-REVIEW-*-v${iteration}.md files for this document type in docs/${feature}/). ` +
      `Address every High and Medium finding in them.`;
  }

  // Phase T: fold the DECISIONS_WARRANTED signal into the convergence loop so no
  // separate post-PASS agent session is needed. The last optimizer result carries
  // the trailer; if the loop converges on iteration 1 the creator result carries it.
  if (phase === "T") {
    return `${base}${feedback}\n${decisionsWarrantedTrailerRequirement()}`;
  }
  return `${base}${feedback}`;
}

/**
 * Cheap trailer recovery for a reviewer whose VERDICT trailer was missing or
 * malformed. Re-asks the same reviewer — on Haiku — to re-emit ONLY the two
 * trailer lines from its own prior output (no re-review). Returns the re-parsed
 * verdict if it now parses cleanly, else null so the caller keeps the original
 * Needs-revision fallback and proceeds to the optimizer.
 *
 * @param {object} params
 * @param {string} params.reviewer - reviewer skill id
 * @param {string|null|undefined} params.rawResult - the reviewer's original output
 * @param {function} params._agent - injected agent function
 * @returns {Promise<{verdict: string, high: number, medium: number, low: number}|null>}
 */
async function recoverVerdict({ reviewer, rawResult, _agent = agent }) {
  const recoveryPrompt =
    `Your previous review response did not end with a machine-readable VERDICT trailer. ` +
    `Do not redo the review. Based ONLY on the text below (your own previous output), ` +
    `re-emit exactly the two trailer lines and nothing else:\n` +
    `VERDICT: <Approved | Approved with minor changes | Needs revision>\n` +
    `{"high": N, "medium": N, "low": N}\n\n` +
    `--- previous output ---\n${rawResult ?? ""}`;

  const recovered = await _agent(reviewer, recoveryPrompt, { model: "haiku" });
  const parsed = parseVerdict(recovered, reviewer);
  return parsed.malformed ? null : parsed;
}

/**
 * The DECISIONS_WARRANTED trailer requirement appended to the Phase T creator and
 * optimizer prompts (formerly the body of the standalone post-PASS TSPEC session).
 * @returns {string}
 */
function decisionsWarrantedTrailerRequirement() {
  return (
    `End your final message with:\n` +
    `DECISIONS_WARRANTED: true if load-bearing architectural alternatives were weighed and rejected during the TSPEC review; ` +
    `DECISIONS_WARRANTED: false if this is a trivial feature with no real alternatives considered.`
  );
}

function creatorPrompt(phase, featureName, inputs) {
  const dispatch = PHASE_DISPATCH[phase];
  return (
    `Create ${dispatch.creatorOutputPath.replace(/\{feature\}/g, featureName)} for feature ${featureName}. ` +
    `Input documents: ${inputs.join(", ")}. Commit and push.\n` +
    branchPinClause(featureName)
  );
}

function implementPrompt(task, featureName) {
  return (
    `Implement task ${task.id}: ${task.description}\n` +
    `Feature: ${featureName}\n` +
    `TSPEC: docs/${featureName}/TSPEC-${featureName}.md\n` +
    `PROPERTIES: docs/${featureName}/PROPERTIES-${featureName}.md\n` +
    `Dependencies completed: ${task.dependencies.join(", ") || "none"}\n` +
    `Follow TDD. Run tests. Commit and push.\n` +
    branchPinClause(featureName)
  );
}

function propertiesTestPrompt(featureName) {
  return (
    `Implement PROPERTIES tests for feature ${featureName}.\n` +
    `Read: docs/${featureName}/PROPERTIES-${featureName}.md\n` +
    `For each property without a corresponding test, write it using TDD at the specified test level.\n` +
    `Run the full test suite. All tests must pass before committing. Commit and push.\n` +
    branchPinClause(featureName)
  );
}

function harvestPrompt(featureName) {
  return (
    `Harvest learnings for feature ${featureName}:\n` +
    `1. Read all CROSS-REVIEW-*.md and CODE_REVIEW-*.md files (every doc type, every -vN suffix) for docs/${featureName}/.\n` +
    `2. Read all POSTMORTEM-*.md files for docs/${featureName}/ (if any).\n` +
    `3. Write docs/${featureName}/LEARNINGS-${featureName}.md.\n` +
    `4. Commit and push LEARNINGS before any delete operation.\n` +
    `5. Only after the LEARNINGS commit is confirmed on remote, delete the harvested CROSS-REVIEW-* and CODE_REVIEW-* files.\n` +
    `6. Commit and push the deletions.\n` +
    branchPinClause(featureName)
  );
}

// ─── TSPEC-SHIP: PR-raise + CI-verify (Phase PUB) ─────────────────────────────

function createPrPrompt(featureName) {
  return (
    `Raise a pull request for feature ${featureName}. ` +
    `The branch was already rebased onto the latest default branch in Phase DOD — do NOT rebase again.\n` +
    `1. Push the branch if needed: git push origin feat-${featureName}.\n` +
    `2. Open a pull request from feat-${featureName} into the default branch. ` +
    `If a PR is already open for this branch, reuse it — do not open a duplicate.\n` +
    `3. Base the PR title and description on the feature's REQ/FSPEC.\n` +
    `Do NOT merge the PR. End your final message with this trailer as the last line:\n` +
    `PR_URL: <the full https URL of the pull request>\n` +
    `If the PR could not be created, end with:\n` +
    `PR_URL: none`
  );
}

// ─── DOD rebase: ship-pr rebases feat-{feature} onto the latest default branch ─
function rebasePrompt(featureName) {
  return (
    `Rebase the feature branch onto the latest default branch for feature ${featureName}.\n` +
    `1. Fetch the latest default branch from remote: git fetch origin <default-branch>.\n` +
    `2. Rebase feat-${featureName} onto origin/<default-branch>: git rebase origin/<default-branch>.\n` +
    `   If the rebase conflicts, abort it (git rebase --abort) and report the conflict.\n` +
    `3. If the rebase succeeded, force-push the rebased branch: git push --force-with-lease origin feat-${featureName}.\n` +
    `Do NOT open a pull request. End your final message with exactly one trailer line:\n` +
    `REBASE_STATUS: clean     — rebase succeeded (or branch already current) and was pushed\n` +
    `REBASE_STATUS: conflict  — rebase produced conflicts; aborted, branch left unchanged`
  );
}

/**
 * Query the current GitHub Actions check status for a PR directly via the `gh`
 * CLI — no agent needed for a mechanical status read. Uses the same
 * execSync-with-injectable-execFn pattern as mergeWorktree.
 *
 * Maps `gh pr view <url> --json statusCheckRollup` to exactly one of:
 *   "none"    — the rollup array is empty/absent (no checks registered yet)
 *   "pending" — at least one check has not completed yet
 *   "passed"  — all completed and every conclusion is a success (SUCCESS/NEUTRAL/SKIPPED)
 *   "failed"  — at least one completed check has a failure/error conclusion
 *   "unknown" — exec threw or the JSON was unparseable
 *
 * @param {string} prUrl
 * @param {{ execFn?: function }} [opts] - injection point for tests (override execSync)
 * @returns {Promise<"none" | "pending" | "passed" | "failed" | "unknown">}
 */
async function checkPrCi(prUrl, { execFn } = {}) {
  const { execSync: realExecSync } = await import("child_process");
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));

  let raw;
  try {
    raw = exec(`gh pr view ${prUrl} --json statusCheckRollup`, {
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch {
    return "unknown";
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return "unknown";
  }

  const rollup = parsed && parsed.statusCheckRollup;
  if (!Array.isArray(rollup) || rollup.length === 0) {
    return "none";
  }

  let anyPending = false;
  let anyFailure = false;
  let allSuccess = true;
  for (const check of rollup) {
    const state = classifyCheckRollupEntry(check);
    if (state === "pending") anyPending = true;
    if (state === "failure") anyFailure = true;
    if (state !== "success") allSuccess = false;
  }

  if (anyPending) return "pending";
  if (anyFailure) return "failed";
  if (allSuccess) return "passed";
  return "unknown";
}

/**
 * Classify a single statusCheckRollup entry (CheckRun or StatusContext).
 * @param {object} check
 * @returns {"pending" | "success" | "failure" | "other"}
 */
function classifyCheckRollupEntry(check) {
  const SUCCESS = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);
  const FAILURE = new Set([
    "FAILURE",
    "ERROR",
    "CANCELLED",
    "TIMED_OUT",
    "ACTION_REQUIRED",
    "STARTUP_FAILURE",
  ]);

  if (check && typeof check.status === "string") {
    // CheckRun: status is QUEUED/IN_PROGRESS/COMPLETED, conclusion is set once done.
    if (check.status.toUpperCase() !== "COMPLETED") return "pending";
    const conclusion = (check.conclusion || "").toUpperCase();
    if (FAILURE.has(conclusion)) return "failure";
    if (SUCCESS.has(conclusion)) return "success";
    return "other";
  }

  if (check && typeof check.state === "string") {
    // StatusContext: legacy commit-status API.
    const st = check.state.toUpperCase();
    if (st === "PENDING" || st === "EXPECTED") return "pending";
    if (st === "SUCCESS") return "success";
    if (st === "FAILURE" || st === "ERROR") return "failure";
    return "other";
  }

  return "other";
}

/**
 * Extract the PR URL from a ship-pr create result's trailer.
 * @param {string | null | undefined} result
 * @returns {string | null}  the URL, or null if absent / "none"
 */
function parsePrUrl(result) {
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return null;
  }
  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("PR_URL: ")) {
      const value = trimmed.slice("PR_URL: ".length).trim();
      if (value === "" || value.toLowerCase() === "none") return null;
      return value;
    }
  }
  return null;
}

/**
 * Extract the REBASE_STATUS from a ship-pr rebase result's trailer (Phase DOD step 0).
 * @param {string | null | undefined} result
 * @returns {"clean" | "conflict" | "unknown"}
 */
function parseRebaseStatus(result) {
  const VALID = ["clean", "conflict"];
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return "unknown";
  }
  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("REBASE_STATUS: ")) {
      const token = trimmed
        .slice("REBASE_STATUS: ".length)
        .trim()
        .toLowerCase()
        .split(/\s/)[0];
      return VALID.includes(token) ? token : "unknown";
    }
  }
  return "unknown";
}

// ─── DOD-03: parseDodStatus ──────────────────────────────────────────────────

/**
 * Extract DOD_STATUS from a dod-verify agent result string.
 * @param {string | null | undefined} result - Raw agent result
 * @returns {{ status: "passed" | "failed" | "unknown", stubs: number, mock_data: number, unwired_integrations: number, coverage_below_threshold: boolean, branch_coverage_pct: number, req_gaps: number, boundary_gaps: number }}
 */
function parseDodStatus(result) {
  const fallback = {
    status: "unknown",
    stubs: 0,
    mock_data: 0,
    unwired_integrations: 0,
    coverage_below_threshold: false,
    branch_coverage_pct: 0,
    req_gaps: 0,
    boundary_gaps: 0,
  };

  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return fallback;
  }

  const lines = result.split("\n");

  let statusLine = null;
  let statusLineIndex = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("DOD_STATUS: ")) {
      statusLine = trimmed;
      statusLineIndex = i;
      break;
    }
  }

  if (statusLine === null) {
    return fallback;
  }

  const rawStatus = statusLine.slice("DOD_STATUS: ".length).trim().toLowerCase();

  if (rawStatus === "passed") {
    return {
      status: "passed",
      stubs: 0,
      mock_data: 0,
      unwired_integrations: 0,
      coverage_below_threshold: false,
      branch_coverage_pct: 100,
      req_gaps: 0,
      boundary_gaps: 0,
    };
  }

  if (rawStatus !== "failed") {
    return fallback;
  }

  // Find next non-empty line after the DOD_STATUS line
  let nextNonEmpty = null;
  for (let j = statusLineIndex + 1; j < lines.length; j++) {
    if (lines[j].trim() !== "") {
      nextNonEmpty = lines[j].trim();
      break;
    }
  }

  const failedZeros = {
    status: "failed",
    stubs: 0,
    mock_data: 0,
    unwired_integrations: 0,
    coverage_below_threshold: false,
    branch_coverage_pct: 0,
    req_gaps: 0,
    boundary_gaps: 0,
  };

  if (nextNonEmpty === null) {
    return failedZeros;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(nextNonEmpty);
  } catch {
    return failedZeros;
  }

  return {
    status: "failed",
    stubs: Number.isInteger(parsed.stubs) && parsed.stubs >= 0 ? parsed.stubs : 0,
    mock_data: Number.isInteger(parsed.mock_data) && parsed.mock_data >= 0 ? parsed.mock_data : 0,
    unwired_integrations: Number.isInteger(parsed.unwired_integrations) && parsed.unwired_integrations >= 0 ? parsed.unwired_integrations : 0,
    coverage_below_threshold: parsed.coverage_below_threshold === true,
    branch_coverage_pct: typeof parsed.branch_coverage_pct === "number" && parsed.branch_coverage_pct >= 0 ? parsed.branch_coverage_pct : 0,
    req_gaps: Number.isInteger(parsed.req_gaps) && parsed.req_gaps >= 0 ? parsed.req_gaps : 0,
    boundary_gaps: Number.isInteger(parsed.boundary_gaps) && parsed.boundary_gaps >= 0 ? parsed.boundary_gaps : 0,
  };
}

// ─── DOD-04: dodVerifyLoop ───────────────────────────────────────────────────

function dodVerifyPrompt(featureName, version) {
  // Round ≥2 is a delta re-verify after remediation — verify each prior finding is
  // fixed and scan only the remediation diff, instead of re-running the full scan.
  if (version >= 2) {
    return dodReVerifyPrompt(featureName, version);
  }
  return (
    `Challenge the Definition of Done for feature ${featureName} (review version v${version}). ` +
    `Assume incomplete until the evidence proves otherwise.\n` +
    `\n` +
    `Step 1 — Read the specs first (before touching any code):\n` +
    `  docs/${featureName}/REQ-${featureName}.md — acceptance criteria and success conditions\n` +
    `  docs/${featureName}/FSPEC-${featureName}.md — functional requirements, user flows, error cases\n` +
    `  docs/${featureName}/PROPERTIES-${featureName}.md — testable system properties\n` +
    `Build a checklist of every acceptance criterion, requirement, error case, and property.\n` +
    `\n` +
    `Step 2 — Scan production code (non-test files changed by this feature via git diff --name-only) for:\n` +
    `1. Stubs, TODOs, placeholders, NotImplementedError in production code (read function bodies, not signatures)\n` +
    `2. Unwired integrations — unused imports, dead config, placeholder URLs (trace request-to-response paths)\n` +
    `3. Mock/fake data in production code — hardcoded test data, mock variables outside test files\n` +
    `4. Branch coverage ≥85% for all new modules with property-based tests for parameterisable components\n` +
    `5. Requirements delivered — for each checklist item: trace it to a production code path AND a test that ` +
    `would fail if the implementation broke. Trace to the FINAL operator-visible artifact (after any ` +
    `entry-point re-render/overwrite), not the node/builder output; enumerate all writers of the traced ` +
    `output (grep the filename/key) and confirm no later writer clobbers the AC value without a test pinning ` +
    `the final artifact. Missing either one is a gap (req_gaps count). ` +
    `An assertion-free test does not count. A stub-backed test does not count.\n` +
    `6. Integration-boundary integrity (boundary_gaps count) — two checks:\n` +
    `   (a) Adjacent-surface falsification: does the diff make any existing artifact, disclosure string, ` +
    `comment, config default, or doc claim FALSE? For every output file the feature writes, grep for other ` +
    `writers of the same file/key and check for a later overwrite. When the feature touches one member of a ` +
    `same-shape family (one tools/get_* among several, one writer of a multi-writer artifact), enumerate the ` +
    `family and require each sibling covered or explicitly out-of-scope in the REQ.\n` +
    `   (b) Deferral binding: every deferral this feature introduces or leaves in place must name a successor ` +
    `that exists as a queue row (docs/_queue/QUEUE.md) or a named successor REQ file in docs/. A runbook step, ` +
    `operator config, or bare prose mention is NOT a successor.\n` +
    `\n` +
    `Document every finding (all six criteria) with a Scope tag (Local | Cross-Feature | Process) in ` +
    `docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md — include a §2 Requirements Traceability ` +
    `table listing every criterion with implementation path, test path, and Gap? column. ` +
    `Commit and push the review file. Do NOT fix anything — you are the evaluator, not the optimizer.\n` +
    `End with the DOD_STATUS trailer including req_gaps and boundary_gaps in the JSON.`
  );
}

/**
 * Round ≥2 (v2, v3…) delta re-verify prompt. After remediation, the previous
 * round's CODE_REVIEW findings and the remediation diff are the only things worth
 * re-reading — the rest of the tree was already verified. The evidence bar and the
 * DOD_STATUS trailer contract are unchanged from v1.
 */
function dodReVerifyPrompt(featureName, version) {
  const prev = version - 1;
  return (
    `This is re-verification round v${version} after remediation for feature ${featureName}. ` +
    `Assume incomplete until the evidence proves otherwise.\n` +
    `\n` +
    `Step 1 — Read docs/${featureName}/CODE_REVIEW-${featureName}-v${prev}.md. For EACH finding in it, ` +
    `verify remediation: trace the fix to a production code path AND a test that would fail if the fix broke. ` +
    `An assertion-free or stub-backed test does not count as remediation.\n` +
    `\n` +
    `Step 2 — Run \`git diff\` covering the remediation commits since v${prev} and scan ONLY that diff for new ` +
    `stubs, mock data, unwired integrations, integration-boundary gaps (adjacent surfaces the fixes silently ` +
    `falsify), or regressions introduced by the fixes. Do NOT re-scan unchanged ` +
    `code you already verified in the previous round.\n` +
    `\n` +
    `Carry the §2 Requirements Traceability table forward from v${prev}, updating only the rows affected by the ` +
    `remediation (update the Gap? column). Document the result in ` +
    `docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md with Scope tags (Local | Cross-Feature | Process) ` +
    `as before. Commit and push the review file. Do NOT fix anything — you are the evaluator, not the optimizer.\n` +
    `DOD_STATUS: passed only when every prior finding is verified remediated AND the remediation diff is clean. ` +
    `End with the DOD_STATUS trailer including req_gaps and boundary_gaps in the JSON.`
  );
}

function dodRemediatePrompt(featureName, version) {
  return (
    `Address every finding in the Definition of Done code review for feature ${featureName}.\n` +
    `1. Read docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md — the latest DoD review.\n` +
    `2. Fix every finding via strict TDD: write or update the failing test first, then the minimum production code. ` +
    `Derive correct behavior from the TSPEC/FSPEC/PROPERTIES (REQ for intent).\n` +
    `3. Run the full test suite with branch coverage. All tests must pass.\n` +
    `4. Commit and push the fixes. Do NOT edit the CODE_REVIEW file.\n` +
    branchPinClause(featureName)
  );
}

/**
 * Phase DOD step 0: rebase the feature branch onto the latest default branch so the
 * DoD scan (and the subsequent PR) sees the real merge state. Delegated to ship-pr.
 *
 * @param {object} params
 * @param {string} params.feature
 * @param {function} [params._agent]
 * @param {function} [params._log]
 * @returns {Promise<"clean" | "conflict" | "unknown">}
 */
async function rebaseOntoDefault({ feature, _agent = agent, _log = log }) {
  _log(`Rebasing feat-${feature} onto the latest default branch`);
  const result = await _agent("ship-pr", rebasePrompt(feature));
  return parseRebaseStatus(result);
}

/**
 * Phase DOD: verify the Definition of Done, then dispatch remediation, then re-verify.
 * dod-verify is the evaluator — it documents findings in a versioned CODE_REVIEW file
 * but does not fix them. se-implement is the optimizer — it addresses the findings via
 * TDD. The loop alternates verify → remediate → verify, capped at DOD_MAX_ITERATIONS.
 *
 * @param {object} params
 * @param {string} params.feature
 * @param {number} [params.maxIterations]
 * @param {function} [params._agent]
 * @param {function} [params._log]
 * @returns {Promise<{ passed: boolean, iterations: number, lastStatus?: object }>}
 */
async function dodVerifyLoop({
  feature,
  maxIterations = DOD_MAX_ITERATIONS,
  _agent = agent,
  _log = log,
}) {
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    _log(`DoD verification — iteration ${iteration}`);

    const verifyResult = await _agent(
      "dod-verify",
      dodVerifyPrompt(feature, iteration)
    );
    const status = parseDodStatus(verifyResult);

    if (status.status === "passed") {
      _log("DoD verification passed");
      return { passed: true, iterations: iteration };
    }

    if (status.status === "unknown") {
      _log("WARNING: dod-verify returned no DOD_STATUS — treating as failed");
    }

    _log(
      `DoD findings recorded in CODE_REVIEW-${feature}-v${iteration}: ` +
      `stubs=${status.stubs}, mock_data=${status.mock_data}, ` +
      `unwired=${status.unwired_integrations}, coverage_gap=${status.coverage_below_threshold} ` +
      `(branch_coverage=${status.branch_coverage_pct}%), req_gaps=${status.req_gaps}, ` +
      `boundary_gaps=${status.boundary_gaps}`
    );

    if (iteration === maxIterations) {
      return { passed: false, iterations: iteration, lastStatus: status };
    }

    // Dispatch remediation: se-implement addresses the findings recorded in this
    // version's CODE_REVIEW file, then the next iteration re-verifies.
    _log(`Dispatching remediation for CODE_REVIEW-${feature}-v${iteration}`);
    await _agent("se-implement", dodRemediatePrompt(feature, iteration));
  }

  // Should not reach here, but guard
  return { passed: false, iterations: maxIterations };
}

/**
 * Phase PUB: raise (or reuse) the PR for the feature branch, then poll GHA checks
 * until they pass, fail, or the no-checks window expires. The poll-timing logic
 * lives here (in the script), not in the agent — the agent only reports the
 * current state. Returns the PR URL and the resolved CI status.
 *
 * @param {object} params
 * @param {string} params.feature
 * @param {function} [params._agent]
 * @param {function} [params._checkCi] - (prUrl) => Promise<ci status>; injectable for tests
 * @param {function} [params._log]
 * @param {function} [params._now]   - clock (ms); injectable for tests
 * @param {function} [params._sleep] - async sleep(ms); injectable for tests
 * @param {number} [params.noChecksTimeoutMs]
 * @param {number} [params.pollIntervalMs]
 * @param {number} [params.completionTimeoutMs]
 * @returns {Promise<{ prUrl: string, ciStatus: "passed" | "no-checks" }>}
 */
async function raisePrAndVerifyCi({
  feature,
  _agent = agent,
  _checkCi = checkPrCi,
  _log = log,
  _now = () => Date.now(),
  _sleep = sleep,
  noChecksTimeoutMs = CI_NO_CHECKS_TIMEOUT_MS,
  pollIntervalMs = CI_POLL_INTERVAL_MS,
  completionTimeoutMs = CI_COMPLETION_TIMEOUT_MS,
}) {
  // 1. Create (or reuse) the PR. The branch was already rebased onto the latest
  //    default branch in Phase DOD, so ship-pr does not rebase here.
  const prResult = await _agent("ship-pr", createPrPrompt(feature));

  const prUrl = parsePrUrl(prResult);
  if (!prUrl) {
    throw haltError(
      `Error: Phase PUB — PR creation failed for feature ${feature} (no PR_URL returned)`
    );
  }
  _log(`PR raised: ${prUrl}`);

  // 2. Poll GHA checks directly via `gh`. The script owns the cadence and the
  //    timeouts; the poll itself is a mechanical status read, not an agent turn.
  const start = _now();
  let completionStart = null;
  while (true) {
    const status = await _checkCi(prUrl);

    if (status === "passed") {
      _log(`GHA checks passed for PR ${prUrl}`);
      return { prUrl, ciStatus: "passed" };
    }
    if (status === "failed") {
      throw haltError(`Error: Phase PUB — GHA checks failed for PR ${prUrl}`);
    }
    if (status === "pending" && completionStart === null) {
      // First time checks register — start the completion budget from here so
      // slow-registering checks get a full window regardless of registration latency.
      completionStart = _now();
    }

    if (completionStart !== null) {
      // Checks are registered and running — wait for completion up to the overall
      // cap, measured from when checks first appeared (not from PR-raise).
      if (_now() - completionStart >= completionTimeoutMs) {
        throw haltError(
          `Error: Phase PUB — GHA checks did not complete within ` +
            `${Math.round(completionTimeoutMs / 60000)} minutes for PR ${prUrl}`
        );
      }
    } else if (_now() - start >= noChecksTimeoutMs) {
      // No checks ever appeared (status none/unknown) within the window —
      // assume the repo has no PR checks configured and treat the phase as a pass.
      _log(
        `No GHA checks detected within ${Math.round(
          noChecksTimeoutMs / 60000
        )} minutes — assuming repo has no PR checks configured`
      );
      return { prUrl, ciStatus: "no-checks" };
    }

    await _sleep(pollIntervalMs);
  }
}

// ─── TSPEC-IMPL-06: Per-batch test gate helpers ───────────────────────────────

/**
 * Evaluates whether a batch of se-implement agents all passed their tests.
 * @param {Array<string|null>} results - Array of agent results
 * @param {number} batchIndex - Zero-based batch index
 * @param {Array<{id: string}>} batch - Array of task objects
 * @throws {Error} halt error if any test failed
 */
function evaluateBatchGate(results, batchIndex, batch) {
  const batchNum = batchIndex + 1;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const task = batch[i];

    // Rule 1: empty-result check
    if (result == null || (typeof result === "string" && result.trim() === "")) {
      throw haltError(
        `Error: Batch ${batchNum} agent returned empty result — treating as failure`
      );
    }

    // Rule 2: failure marker scan
    if (/Tests: \d+ failed/.test(result)) {
      const match = result.match(/Tests: (\d+) failed/);
      const count = match ? match[1] : "?";
      throw haltError(
        `Error: Batch ${batchNum} task ${task.id} failed — Tests: ${count} failed`
      );
    }

    if (result.toLowerCase().includes("non-zero exit")) {
      throw haltError(
        `Error: Batch ${batchNum} task ${task.id} failed — non-zero exit detected`
      );
    }
  }

  log(`Batch ${batchNum} complete — all tests passing`);
}

/**
 * Evaluates whether a single-agent phase passed its tests.
 * @param {string|null} agentResult - The agent result string
 * @param {string} phaseName - Phase name for error messages (e.g. "PT")
 * @returns {{ passed: boolean, reason?: string }}
 */
function evaluateSingleAgentGate(agentResult, phaseName) {
  // Rule 1: empty-result check
  if (
    agentResult == null ||
    (typeof agentResult === "string" && agentResult.trim() === "")
  ) {
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} agent returned empty result — treating as failure`,
    };
  }

  // Rule 2: failure marker scan
  if (/Tests: \d+ failed/.test(agentResult)) {
    const match = agentResult.match(/Tests: (\d+) failed/);
    const count = match ? match[1] : "?";
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} failed — Tests: ${count} failed`,
    };
  }

  if (agentResult.toLowerCase().includes("non-zero exit")) {
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} failed — non-zero exit detected`,
    };
  }

  return { passed: true };
}

// ─── Topological batching ─────────────────────────────────────────────────────

/**
 * Compute topological batches from task array (TSPEC-IMPL-02).
 * @param {Array<{id: string, dependencies: string[], planBatch: number}>} tasks
 * @returns {Array<Array<{id: string, dependencies: string[], planBatch: number}>>}
 */
function computeTopologicalBatches(tasks) {
  const completed = new Set();
  const batches = [];
  let maxCompletedBatch = -1;

  while (completed.size < tasks.length) {
    const ready = tasks.filter(
      (t) =>
        !completed.has(t.id) && t.dependencies.every((d) => completed.has(d))
    );

    if (ready.length === 0 && completed.size < tasks.length) {
      throw haltError(
        "Error: PLAN dependency graph contains a cycle — cannot compute topological batches"
      );
    }

    if (ready.length === 0) break;

    // Detect PLAN batch label inconsistency
    const inconsistent = ready.some(
      (t) => t.planBatch !== undefined && t.planBatch <= maxCompletedBatch
    );
    if (inconsistent) {
      log(
        "WARNING: PLAN batch labels inconsistent with dependency edges — re-deriving topological batches"
      );
    }

    // Sort by original array index (document order)
    ready.sort(
      (a, b) =>
        tasks.findIndex((t) => t.id === a.id) -
        tasks.findIndex((t) => t.id === b.id)
    );

    // Split into sub-batches of at most 5
    for (let i = 0; i < ready.length; i += 5) {
      batches.push(ready.slice(i, i + 5));
    }

    for (const t of ready) {
      completed.add(t.id);
      if (t.planBatch !== undefined && t.planBatch > maxCompletedBatch) {
        maxCompletedBatch = t.planBatch;
      }
    }
  }

  return batches;
}

// ─── Runtime API stubs (replaced by real runtime in production) ───────────────

/* These are no-op stubs for the module-level functions that the real Claude Code
   runtime provides. Tests override them via dependency injection. */

// eslint-disable-next-line no-unused-vars
async function agent(skill, prompt, opts) {
  // Provided by runtime
  throw new Error("agent() not available outside Claude Code runtime");
}

// eslint-disable-next-line no-unused-vars
async function parallel(promises) {
  return Promise.all(promises);
}

// eslint-disable-next-line no-unused-vars
async function pipeline(label, fn) {
  return fn();
}

// eslint-disable-next-line no-unused-vars
function phase(label) {
  // Provided by runtime
}

function log(message) {
  // In tests this is overridden; in production it's the runtime log
  if (typeof console !== "undefined") {
    console.log("[orchestrate-dev]", message);
  }
}

// Real wall-clock sleep used by Phase PUB's poll loop. Injectable in tests via _sleep.
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Default file read — real fs, returns null on any error (mirrors orchestrate-queue's
// defaultReadFile). Injectable in tests via _readFile. Used for PLAN DAG parsing.
function defaultReadFile(path) {
  try {
    return fs.readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/**
 * Default `_hashFile`: the document's approval digest, without handing the
 * document's bytes back across the seam.
 *
 * Returns EXACTLY what `approvalHashOf` returns for the file's contents —
 * `sha256:{64 hex}` over the canonicalised text, not a raw digest of the bytes
 * on disk — because every consumer compares it against an `APPROVAL-HASH:`
 * literal. Null on any error, mirroring `defaultReadFile`'s contract, so a
 * caller that used to test `bytes != null` can test the hash the same way.
 *
 * Injectable in tests via `_hashFile`; supplied in the workflow runtime by the
 * adapter's `rtHashFile`, which is one IO agent instead of `_readFile`'s
 * per-chunk fan-out. That saving is the whole reason this seam exists.
 */
function defaultHashFile(path) {
  try {
    return approvalHashOf(fs.readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

// ─── TSPEC §3.2 — the listing seam's Node default ─────────────────────────────

/**
 * List a directory's file basenames. Never throws: every failure is reported as
 * `{ ok: false, reason }` with `reason` drawn from the closed LIST_FAILURES
 * catalogue (§4.2). Non-recursive; directories are excluded; basenames only, so
 * parseReviewFilename's anchored grammar sees what it expects.
 *
 * The `{ fsMod = fs }` second-argument idiom is copied from checkFileNonEmpty so
 * the two file-touching Node defaults are tested the same way.
 *
 * @param {string} dirPath - repo-relative directory path
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {{ ok: true, files: string[] } | { ok: false, reason: string }}
 */
function defaultListFiles(dirPath, { fsMod = fs } = {}) {
  if (typeof dirPath !== "string" || dirPath.trim() === "") {
    return { ok: false, reason: "bad_argument" };
  }
  try {
    const entries = fsMod.readdirSync(dirPath, { withFileTypes: true });
    return {
      ok: true,
      files: entries
        .filter((entry) => !entry.isDirectory())
        .map((entry) => entry.name),
    };
  } catch (err) {
    const code = err && err.code;
    if (code === "ENOENT") return { ok: false, reason: "dir_missing" };
    if (code === "ENOTDIR") return { ok: false, reason: "not_a_directory" };
    return { ok: false, reason: "unreadable" };
  }
}

// ─── TSPEC §3.3 — the two write seams' Node defaults ──────────────────────────

/**
 * Write a file, replacing its contents entirely. Throws on failure — deliberately
 * the exception to §3.2's never-throw rule: a failed write is not a condition a
 * caller can meaningfully continue past, and defaultReadFile / checkFileNonEmpty
 * already establish throw-on-IO-failure as this module's idiom. Callers wrap it
 * where FSPEC prescribes a specific halt.
 *
 * @param {string} path
 * @param {string} contents
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {void}
 */
function defaultWriteFile(path, contents, { fsMod = fs } = {}) {
  fsMod.writeFileSync(path, contents, "utf8");
}

/**
 * Append text to a file. APPEND-SHAPED, NEVER A WHOLE-FILE REWRITE (FSPEC §7.4):
 * a read-modify-write would re-emit the reviewer's prose, and any divergence
 * between what was read and what was written would silently rewrite a
 * cross-review file. Hence appendFileSync, not writeFileSync(existing + text).
 * Throws on failure, for the same reason defaultWriteFile does.
 *
 * @param {string} path
 * @param {string} text
 * @param {{ fsMod?: object }} [opts] - injection point for tests (override fs)
 * @returns {void}
 */
function defaultAppendFile(path, text, { fsMod = fs } = {}) {
  fsMod.appendFileSync(path, text, "utf8");
}

// ─── TSPEC §3.4 — the transport seam's Node default ───────────────────────────

/**
 * Run a git command. The caller branches on `ok`; the seam interprets nothing.
 * Never throws. `argv` is an array, not a command string: a string would need
 * quoting rules at the seam boundary and would make a feature name containing a
 * space a shell-injection surface. The `{ execFn }` injection point mirrors
 * mergeWorktree, which resolves child_process's execSync the same way.
 *
 * @param {string[]} argv - git arguments, NOT including the leading "git"
 * @param {{ execFn?: function }} [opts] - injection point for tests
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
 */
async function defaultGit(argv, { execFn } = {}) {
  const { execFileSync: realExecFileSync } = await import("child_process");
  const exec =
    execFn ?? ((file, args, opts) => realExecFileSync(file, args, opts));

  const args = Array.isArray(argv) ? argv : [];
  const execOpts = { stdio: "pipe", encoding: "utf8" };

  try {
    const stdout = exec("git", args, execOpts);
    return { ok: true, stdout: String(stdout ?? ""), stderr: "" };
  } catch (err) {
    return {
      ok: false,
      stdout: String((err && err.stdout) ?? ""),
      stderr: String((err && (err.stderr || err.message)) ?? ""),
    };
  }
}

// ─── TSPEC §3.5 — the queue-row seam's Node default ───────────────────────────

/**
 * Record a halt against the feature's queue row. The default is a NO-OP that
 * reports "none": a unit test, or a direct invocation in a repo with no queue,
 * has no row to write and must not fail for it.
 *
 * The seam exists to preserve the dependency direction — row location and row
 * writing stay in orchestrate-queue.js; orchestrate-dev.js never learns the
 * queue's table grammar. orchestrate-queue's _runPipeline and the dev bundle's
 * DEV_ENTRY supply the real closures.
 *
 * @returns {Promise<{ queueRow: string, detail?: string }>}
 */
async function defaultRecordQueueRow(/* { feature, status } */) {
  return { queueRow: "none" };
}

// ─── TSPEC-SCRIPT-04: main() ──────────────────────────────────────────────────

/**
 * Main pipeline function — runs the full PDLC pipeline from REQ to harvest.
 * @param {{ reqPath: string, _agent?: function, _parallel?: function, _log?: function, _checkFile?: function, _readFile?: function, _hashFile?: function, _phase?: function, _pipeline?: function, _probeDoc?: function, _probeReviewState?: function, _probePostmortem?: function }} params
 * @returns {Promise<FinalReport>}
 */
async function main({
  reqPath,
  forcePhases = null,
  _agent: rawAgentFn = agent,
  _parallel: parallelFn = parallel,
  _log: logFn = log,
  _checkFile: checkFileFn = checkFileNonEmpty,
  _readFile: readFileFn = defaultReadFile,
  _hashFile: hashFileFn = defaultHashFile,
  _phase: phaseFn = phase,
  _pipeline: pipelineFn = pipeline,
  _mergeWorktree: mergeWorktreeFn = mergeWorktree,
  _rebaseOntoDefault: rebaseOntoDefaultFn = rebaseOntoDefault,
  _dodVerifyLoop: dodVerifyLoopFn = dodVerifyLoop,
  _raisePrAndVerifyCi: raisePrAndVerifyCiFn = raisePrAndVerifyCi,
  _checkCi: checkCiFn = checkPrCi,
  _phaseDodEnabled: phaseDodEnabled = PHASE_DOD_ENABLED,
  _phasePubEnabled: phasePubEnabled = PHASE_PUB_ENABLED,
  _phaseMergeEnabled: phaseMergeEnabled = PHASE_MERGE_ENABLED,
  _now,
  _sleep,
  _listFiles: listFilesFn = defaultListFiles,
  _writeFile: writeFileFn = defaultWriteFile,
  _appendFile: appendFileFn = defaultAppendFile,
  _git: gitFn = defaultGit,
  _recordQueueRow: recordQueueRowFn = defaultRecordQueueRow,
  _ghRun: ghRunFn = defaultGhRun,
  // The three optional probe seams. `null` is the shipped state: a runtime that
  // supplies none of them runs every read below exactly as it did before they
  // existed (see the probe-seam section above `probeDocument`).
  _probeDoc: probeDocFn = NO_PROBE,
  _probeReviewState: probeReviewStateFn = NO_PROBE,
  _probePostmortem: probePostmortemFn = NO_PROBE,
} = {}) {
  // Override module-level log for injection
  const emit = logFn;

  // MODEL-01: pin every agent call to Opus by default. Phase I overrides this to
  // Sonnet at its dispatch site. An explicit opts.model always wins over the default,
  // so downstream helpers (reviewLoop, dodVerifyLoop, ship/rebase, harvest) inherit Opus.
  const agentFn = (skill, prompt, opts) =>
    rawAgentFn(skill, prompt, { model: MODEL_DEFAULT, ...opts });

  const phases = [];
  let haltReason;

  /**
   * §5.8/§4.7: an unresolved POSTMORTEM found on a SKIP path. The state is real
   * whether or not the phase ran, so `postmortemStatus`/`postmortemPath` carry
   * it on a successful run too — `haltPhase` staying `null` is what tells the
   * operator this was "skipped, and by the way there is an open POSTMORTEM
   * here" rather than "refused because of it".
   */
  let skipPostmortem = null;

  function recordPhase(phaseId, label, status, detail, iterations) {
    phases.push({
      phase: phaseId,
      label,
      status,
      ...(iterations !== undefined ? { iterations } : {}),
      ...(detail ? { detail } : {}),
    });
  }

  // ─── TSPEC §5.6 — the pacing wrapper's main()-side seams ─────────────────

  /**
   * The branch-derived round window for one doc type, read at phase entry (§5.2).
   * A listing that cannot be judged halts here rather than being read as "no
   * reviews on the branch" (§6.2 rows 2 and 17).
   */
  async function phaseWindow(docType) {
    const state = await resolveReviewState({
      feature: featureName,
      docType,
      _listFiles: listFilesFn,
      _readFile: readFileFn,
      _probeReviewState: probeReviewStateFn,
    });
    if (!state.ok) throw haltError(state.message);
    return state;
  }

  // ─── TSPEC §2.5 — the phase gate (steps 1–4 and step G) ──────────────────

  /**
   * §4.7's report LINES — the skip notice's siblings. Additive on every report,
   * so a note ("this anchor was UNEVALUABLE") reaches the operator without being
   * smuggled into a phase row's `detail`, which other oracles pin verbatim.
   */
  const notices = [];

  /**
   * Set when §2.5 step G refuses a phase, so §4.7's `postmortemStatus` reports
   * `"unresolved"` rather than the `"written"` a plain existence check would
   * infer. `haltPhase` still names the phase — that field is what distinguishes
   * "refused because of it" from a skip that merely mentions one.
   */
  let gatePostmortem = null;

  /**
   * Run §2.5 steps 1–4 and step G for one skip-eligible phase entry.
   *
   * Called BEFORE the phase's creator dispatch, because a skip elides the whole
   * phase and a creator that had already run would have rewritten the very
   * document the approval was anchored to.
   *
   * @param {{phaseId: string, docType: string, docPath: string}} arg
   * @returns {Promise<{skip: true}|{skip: false, window: object, forced: boolean}>}
   */
  async function phaseGate({ phaseId, docType, docPath }) {
    const label = PHASE_DISPATCH[phaseId].label;
    // Step 1. Force overrides a recorded APPROVAL — steps 3 and 4, and only
    // those. Step 2 is NOT skipped: entering reviewLoop on the shipped
    // `iteration = 1` default re-creates H-1 on exactly the path an operator
    // reaches for BECAUSE the phase was reviewed before (§5.7, RLH-AT-01a).
    const forced = forcedPhases.has(phaseId);

    // Step 2 — the branch-derived round window.
    const window = await phaseWindow(docType);

    if (!forced) {
      // Step 3 — the approval search. Tier 1's reads already happened above.
      let record = tier1ApprovalRecord({
        reviewers: PHASE_DISPATCH[phaseId].reviewers,
        startIndex: window.startIndex,
        reviewFiles: window.reviewFiles,
      });
      if (record.tier1Empty) {
        record = await tier2ApprovalRecord({
          feature: featureName,
          docType,
          candidate: record.candidate,
          reviewers: PHASE_DISPATCH[phaseId].reviewers,
          _readFile: readFileFn,
        });
      }
      for (const path of record.unevaluable) {
        notices.push(
          `Phase ${phaseId}: approval anchor UNEVALUABLE at ${path} — the phase runs.`
        );
      }

      if (record.approving) {
        // Step 4 — staleness. §5.5 rule 1: the bytes are read AT COMPARISON
        // TIME, never from a read cached earlier in the run.
        // The digest is computed at the far side of the seam (`_hashFile`), so
        // the comparison still reads the document AT COMPARISON TIME — it just
        // never carries the bytes back. In the workflow runtime `_readFile` is a
        // per-chunk agent fan-out, and this site never wanted the chunks.
        //
        // The absent/unreadable document keeps the byte-taking form verbatim:
        // `_hashFile` reports it as `null`, exactly as the whole-file read did,
        // and `isStale(hash, null)` is then the same call the previous line
        // made. Stating that case as `isStale` rather than folding it into a
        // digest constant is what makes the equivalence readable — and keeps
        // §5.5's claim that the gate consults `isStale` literally true.
        // `_probeDoc` reports the same digest under the same contract, so when it
        // answers it stands in for `_hashFile` here — including its `null`, which
        // keeps the byte-taking `isStale(hash, null)` branch below. That branch is
        // NOT `isStaleByHash(hash, null)`: the two disagree on exactly one input,
        // a recorded hash of an empty document, where `isStale` says FRESH.
        const probe = await probeDocument(probeDocFn, docPath, docType);
        const docHash = probe ? probe.hash ?? null : await hashFileFn(docPath);
        const freshness =
          docHash == null
            ? isStale(record.hash, null)
            : isStaleByHash(record.hash, docHash);
        if (freshness === "FRESH") {
          // The phase does not run. `checkPostmortem` is still evaluated, for
          // REPORTING ONLY — AC-2.3's refusal is conditioned on the phase
          // otherwise running, so a skip has nothing to refuse (§6.2 row 13a).
          const pm = await resolvePostmortem({
            phase: phaseId,
            feature: featureName,
            _readFile: readFileFn,
            _probePostmortem: probePostmortemFn,
          });
          let detail = `Skipped — approved round ${record.candidate}, hash FRESH`;
          if (pm.status === "unresolved") {
            detail += `; unresolved POSTMORTEM at ${pm.path}`;
            skipPostmortem = pm;
          }
          recordPhase(phaseId, label, "⏭", detail);
          return { skip: true };
        }
        if (freshness === "UNEVALUABLE") {
          notices.push(
            `Phase ${phaseId}: ${docPath} could not be compared against the recorded approval — the phase runs.`
          );
        }
      }
    }

    // Step G — G-INV. Every exit that leads to running the phase arrives here,
    // forced or not, and step 5 is reachable only through it. Force never
    // overrides a recorded FAILURE (§5.7, §6.2 row 13, AC-4.6a).
    const gate = await resolvePostmortem({
      phase: phaseId,
      feature: featureName,
      _readFile: readFileFn,
      _probePostmortem: probePostmortemFn,
    });
    if (gate.status === "unresolved") {
      gatePostmortem = gate;
      recordPhase(phaseId, label, "❌", `Refused — unresolved POSTMORTEM at ${gate.path}`);
      throw haltError(
        `Phase ${phaseId} refused: unresolved POSTMORTEM at ${gate.path} records a previous failure. ` +
          `Resolve it per AC-2.4 (set RESOLVED: yes) and re-run. Recommendation: ${gate.recommendation || "(none recorded)"}`
      );
    }

    return { skip: false, window, forced };
  }

  /**
   * §4.7's force-override notice, folded into the phase row so the run's own
   * record says the phase was forced. The wording is not pinned to a literal
   * anywhere in the TSPEC; that it is *said* is (RLH-AT-28).
   */
  const forcedDetail = (detail, forced) =>
    forced ? `${detail} — forced (recorded approval overridden)` : detail;

  /** The seams every wrapped dispatch and every reviewLoop entry shares. */
  const wrapperSeams = {
    _agent: agentFn,
    _readFile: readFileFn,
    _hashFile: hashFileFn,
    _listFiles: listFilesFn,
    _appendFile: appendFileFn,
    _probeDoc: probeDocFn,
    _probeReviewState: probeReviewStateFn,
    _log: emit,
    _git: gitFn,
  };

  /** Wrap one main()-level dispatch (a creator, or harvest) in §3.8's episode. */
  async function wrappedDispatch({ skill, basePrompt, targetPath, docType, dispatchKind, phaseId }) {
    const episode = await dispatchAndVerify({
      skill,
      basePrompt,
      targetPath,
      docType,
      feature: featureName,
      dispatchKind,
      phaseId,
      ...wrapperSeams,
    });
    return episode.response;
  }

  // ─── TSPEC-ENTRY-01: REQ path validation ─────────────────────────────────

  if (!reqPath || reqPath.trim() === "") {
    haltReason = `Error: no REQ path provided. Usage: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md`;
    return buildFinalReport({
      feature: "",
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }

  const PATTERN = /^docs\/([^/]+)\/REQ-\1\.md$/;
  const match = PATTERN.exec(reqPath);
  if (!match) {
    haltReason = `Error: REQ path does not match expected pattern docs/{feature}/REQ-{feature}.md — got: ${reqPath}`;
    return buildFinalReport({
      feature: "",
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }

  const featureName = match[1];

  // ─── TSPEC §5.7 / §6.2 row 12 — the forcePhases gate ──────────────────────
  //
  // An invalid token halts BEFORE any phase runs. The catalogue and the message
  // are rendered from the same array, so they cannot desynchronise.

  const forceParse = parseForcePhases(forcePhases);
  if (!forceParse.ok) {
    haltReason =
      `Error: invalid forcePhases token${forceParse.badTokens.length === 1 ? "" : "s"}: ` +
      `${forceParse.badTokens.join(", ")}. Valid: ${[...FORCE_PHASE_TOKENS, "all"].join(", ")}.`;
    return buildFinalReport({
      feature: featureName,
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }
  const forcedPhases = forceParse.phases;

  // ─── TSPEC-ENTRY-03: deterministic REQ file existence check ───────────────

  const reqCheck = await checkFileFn(reqPath);

  if (!reqCheck.ok) {
    if (reqCheck.reason === "file_empty") {
      haltReason = `Error: REQ file at ${reqPath} is empty`;
    } else {
      haltReason = `Error: REQ file not found at ${reqPath}`;
    }
    return buildFinalReport({
      feature: featureName,
      outcome: "halted",
      phases,
      artifactPaths: [],
      testSummary: "Not run",
      harvestStatus: "Not run",
      haltReason,
    });
  }

  // ─── Pipeline ─────────────────────────────────────────────────────────────

  const artifactPaths = [reqPath];
  let testSummary = "Not run";
  let harvestStatus = "Not run";
  let prUrl;
  let ciStatus;
  // TSPEC §10.1/§10.4: set only inside Phase MERGE, itself reachable only past
  // Phase PUB — a run that halts earlier never assigns this, so the success
  // path below always has a real MergeOutcome to read (Phase MERGE never
  // throws, FSPEC §2.1) and the halt path never reads it at all, relying
  // instead on `buildFinalReport`'s own `mergeStatus: "skipped"` default
  // (§11 row 23).
  let mergeOutcome;

  try {
    // The branch guard, once, BEFORE any phase runs: every artifact this run
    // writes — cross-reviews, spec revisions, implementation commits, the queue
    // row — is committed from this one working tree, so the branch it sits on is
    // established here rather than left to whichever agent commits first.
    await ensureFeatureBranch({ feature: featureName, _git: gitFn, _log: emit });

    await pipelineFn("PDLC Pipeline", async () => {
      // ─── Phase R: REQ Cross-Review ───────────────────────────────────────
      phaseFn("Phase R: REQ Cross-Review");
      const rGate = await phaseGate({ phaseId: "R", docType: "REQ", docPath: reqPath });
      if (!rGate.skip) {
      const rWindow = rGate.window;
      const rLoop = await reviewLoop({
        doc: reqPath,
        phase: "R",
        docType: "REQ",
        reviewers: PHASE_DISPATCH.R.reviewers,
        optimizer: PHASE_DISPATCH.R.optimizer,
        feature: featureName,
        iteration: rWindow.startIndex,
        startIndex: rWindow.startIndex,
        endIndex: rWindow.endIndex,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
        ...wrapperSeams,
      });
      checkConverged(rLoop, "R", PHASE_DISPATCH.R.label, recordPhase, featureName, rWindow.startIndex, rWindow.endIndex);
      recordPhase("R", PHASE_DISPATCH.R.label, "✅", forcedDetail(`Approved (${rLoop.iterations} iteration${rLoop.iterations !== 1 ? "s" : ""})`, rGate.forced), rLoop.iterations);
      }

      // ─── Phase F: FSPEC Creation + Review ───────────────────────────────
      phaseFn("Phase F: FSPEC Creation + Review");
      const fspecPath = `docs/${featureName}/FSPEC-${featureName}.md`;
      const fGate = await phaseGate({ phaseId: "F", docType: "FSPEC", docPath: fspecPath });
      artifactPaths.push(fspecPath);
      if (!fGate.skip) {
      const fCreatorResult = await wrappedDispatch({
        skill: PHASE_DISPATCH.F.creator,
        basePrompt: creatorPrompt("F", featureName, PHASE_DISPATCH.F.creatorInputs),
        targetPath: fspecPath,
        docType: "FSPEC",
        dispatchKind: "authoring",
        phaseId: "F",
      });
      if (!fCreatorResult || fCreatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${PHASE_DISPATCH.F.creator} failed to produce ${fspecPath} for phase F`
        );
      }
      const fWindow = fGate.window;
      const fLoop = await reviewLoop({
        doc: fspecPath,
        phase: "F",
        docType: "FSPEC",
        reviewers: PHASE_DISPATCH.F.reviewers,
        optimizer: PHASE_DISPATCH.F.optimizer,
        feature: featureName,
        iteration: fWindow.startIndex,
        startIndex: fWindow.startIndex,
        endIndex: fWindow.endIndex,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
        ...wrapperSeams,
      });
      checkConverged(fLoop, "F", PHASE_DISPATCH.F.label, recordPhase, featureName, fWindow.startIndex, fWindow.endIndex);
      recordPhase("F", PHASE_DISPATCH.F.label, "✅", forcedDetail(`Approved (${fLoop.iterations} iterations)`, fGate.forced), fLoop.iterations);
      }

      // ─── Phase T: TSPEC Creation + Review ───────────────────────────────
      phaseFn("Phase T: TSPEC Creation + Review");
      const tspecPath = `docs/${featureName}/TSPEC-${featureName}.md`;
      const tGate = await phaseGate({ phaseId: "T", docType: "TSPEC", docPath: tspecPath });
      artifactPaths.push(tspecPath);
      // Declared outside the gate's branch: Phase D's `DECISIONS_WARRANTED` read
      // is downstream of Phase T and must survive a skipped Phase T, where the
      // trailer was never re-emitted and the conservative answer is "no".
      let tCreatorResult = null;
      let tLoop = null;
      if (!tGate.skip) {
      tCreatorResult = await wrappedDispatch({
        skill: PHASE_DISPATCH.T.creator,
        basePrompt: `${creatorPrompt("T", featureName, PHASE_DISPATCH.T.creatorInputs)}\n${decisionsWarrantedTrailerRequirement()}`,
        targetPath: tspecPath,
        docType: "TSPEC",
        dispatchKind: "authoring",
        phaseId: "T",
      });
      if (!tCreatorResult || tCreatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${PHASE_DISPATCH.T.creator} failed to produce ${tspecPath} for phase T`
        );
      }
      const tWindow = tGate.window;
      tLoop = await reviewLoop({
        doc: tspecPath,
        phase: "T",
        docType: "TSPEC",
        reviewers: PHASE_DISPATCH.T.reviewers,
        optimizer: PHASE_DISPATCH.T.optimizer,
        feature: featureName,
        iteration: tWindow.startIndex,
        startIndex: tWindow.startIndex,
        endIndex: tWindow.endIndex,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
        ...wrapperSeams,
      });
      checkConverged(tLoop, "T", PHASE_DISPATCH.T.label, recordPhase, featureName, tWindow.startIndex, tWindow.endIndex);
      recordPhase("T", PHASE_DISPATCH.T.label, "✅", forcedDetail(`Approved (${tLoop.iterations} iterations)`, tGate.forced), tLoop.iterations);
      }

      // ─── TSPEC-DECISIONS-01: DECISIONS_WARRANTED read from Phase T ─────────
      // The trailer requirement is appended to the Phase T creator and optimizer
      // prompts, so its answer arrives inside the convergence loop — no separate
      // post-PASS agent session. The last optimizer result carries it; if the loop
      // converged on iteration 1 (no optimizer run) the creator result does.
      const decisionsWarranted = parseDecisionsWarranted(
        (tLoop && tLoop.lastOptimizerResult) ?? tCreatorResult
      );

      // ─── Phase D: DECISIONS (conditional) ───────────────────────────────
      let decisionsPath = null;
      if (!decisionsWarranted) {
        phaseFn("Phase D: ⏭ Skipped");
        emit("Phase D skipped — no load-bearing alternatives");
        recordPhase("D", PHASE_DISPATCH.D.label, "⏭", "Skipped — no load-bearing alternatives");
      } else {
        phaseFn("Phase D: DECISIONS Creation + Review");
        decisionsPath = `docs/${featureName}/DECISIONS-${featureName}.md`;
        const dGate = await phaseGate({ phaseId: "D", docType: "DECISIONS", docPath: decisionsPath });
        artifactPaths.push(decisionsPath);
        if (!dGate.skip) {
        const dCreatorResult = await wrappedDispatch({
          skill: PHASE_DISPATCH.D.creator,
          basePrompt: creatorPrompt("D", featureName, PHASE_DISPATCH.D.creatorInputs),
          targetPath: decisionsPath,
          docType: "DECISIONS",
          dispatchKind: "authoring",
          phaseId: "D",
        });
        if (!dCreatorResult || dCreatorResult.trim() === "") {
          throw haltError(
            `Error: creator agent ${PHASE_DISPATCH.D.creator} failed to produce ${decisionsPath} for phase D`
          );
        }
        const dWindow = dGate.window;
        const dLoop = await reviewLoop({
          doc: decisionsPath,
          phase: "D",
          docType: "DECISIONS",
          reviewers: PHASE_DISPATCH.D.reviewers,
          optimizer: PHASE_DISPATCH.D.optimizer,
          feature: featureName,
          iteration: dWindow.startIndex,
          startIndex: dWindow.startIndex,
          endIndex: dWindow.endIndex,
          _parallel: parallelFn,
          _checkFile: checkFileFn,
          ...wrapperSeams,
        });
        checkConverged(dLoop, "D", PHASE_DISPATCH.D.label, recordPhase, featureName, dWindow.startIndex, dWindow.endIndex);
        recordPhase("D", PHASE_DISPATCH.D.label, "✅", forcedDetail(`Approved (${dLoop.iterations} iterations)`, dGate.forced), dLoop.iterations);
        }
      }

      // ─── Phase P: PLAN Creation + Review ────────────────────────────────
      phaseFn("Phase P: PLAN Creation + Review");
      const planPath = `docs/${featureName}/PLAN-${featureName}.md`;
      const pInputs = [...PHASE_DISPATCH.P.creatorInputs.filter(i => i !== "DECISIONS?")];
      if (decisionsPath) pInputs.push("DECISIONS");
      const pGate = await phaseGate({ phaseId: "P", docType: "PLAN", docPath: planPath });
      artifactPaths.push(planPath);
      if (!pGate.skip) {
      const pCreatorResult = await wrappedDispatch({
        skill: PHASE_DISPATCH.P.creator,
        basePrompt: creatorPrompt("P", featureName, pInputs),
        targetPath: planPath,
        docType: "PLAN",
        dispatchKind: "authoring",
        phaseId: "P",
      });
      if (!pCreatorResult || pCreatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${PHASE_DISPATCH.P.creator} failed to produce ${planPath} for phase P`
        );
      }
      const pWindow = pGate.window;
      const pLoop = await reviewLoop({
        doc: planPath,
        phase: "P",
        docType: "PLAN",
        reviewers: PHASE_DISPATCH.P.reviewers,
        optimizer: PHASE_DISPATCH.P.optimizer,
        feature: featureName,
        iteration: pWindow.startIndex,
        startIndex: pWindow.startIndex,
        endIndex: pWindow.endIndex,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
        ...wrapperSeams,
      });
      checkConverged(pLoop, "P", PHASE_DISPATCH.P.label, recordPhase, featureName, pWindow.startIndex, pWindow.endIndex);
      recordPhase("P", PHASE_DISPATCH.P.label, "✅", forcedDetail(`Approved (${pLoop.iterations} iterations)`, pGate.forced), pLoop.iterations);
      }

      // ─── Phase PR: PROPERTIES Creation + Review ──────────────────────────
      phaseFn("Phase PR: PROPERTIES Creation + Review");
      const propertiesPath = `docs/${featureName}/PROPERTIES-${featureName}.md`;
      const prGate = await phaseGate({ phaseId: "PR", docType: "PROPERTIES", docPath: propertiesPath });
      artifactPaths.push(propertiesPath);
      if (!prGate.skip) {
      const prCreatorResult = await wrappedDispatch({
        skill: PHASE_DISPATCH.PR.creator,
        basePrompt: creatorPrompt("PR", featureName, PHASE_DISPATCH.PR.creatorInputs),
        targetPath: propertiesPath,
        docType: "PROPERTIES",
        dispatchKind: "authoring",
        phaseId: "PR",
      });
      if (!prCreatorResult || prCreatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${PHASE_DISPATCH.PR.creator} failed to produce ${propertiesPath} for phase PR`
        );
      }
      const prWindow = prGate.window;
      const prLoop = await reviewLoop({
        doc: propertiesPath,
        phase: "PR",
        docType: "PROPERTIES",
        reviewers: PHASE_DISPATCH.PR.reviewers,
        optimizer: PHASE_DISPATCH.PR.optimizer,
        feature: featureName,
        iteration: prWindow.startIndex,
        startIndex: prWindow.startIndex,
        endIndex: prWindow.endIndex,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
        ...wrapperSeams,
      });
      checkConverged(prLoop, "PR", PHASE_DISPATCH.PR.label, recordPhase, featureName, prWindow.startIndex, prWindow.endIndex);
      recordPhase("PR", PHASE_DISPATCH.PR.label, "✅", forcedDetail(`Approved (${prLoop.iterations} iterations)`, prGate.forced), prLoop.iterations);
      }

      // ─── Phase I: Implementation ─────────────────────────────────────────
      phaseFn("Phase I: Implementation");

      // TSPEC-IMPL-01: PLAN DAG parsing. Parse the PLAN task table in-script
      // first — a markdown table needs no LLM. Only if the table is not parseable
      // (e.g. dependencies live in prose) fall back to the extraction agent, which
      // runs on Haiku since this is mechanical extraction, not reasoning.
      let tasks;
      const planParsed = parsePlanTasks(await readFileFn(planPath));
      if (planParsed && Array.isArray(planParsed.tasks) && planParsed.tasks.length > 0) {
        tasks = planParsed.tasks;
      } else {
        const dagAgentResult = await agentFn(
          "se-author",
          `Read docs/${featureName}/PLAN-${featureName}.md and extract the task table. ` +
            `Return a JSON object with this exact structure: ` +
            `{"tasks": [{"id": "TASK-01", "description": "...", "dependencies": ["TASK-00"], "planBatch": 1}]}`,
          { model: "haiku" }
        );

        try {
          const parsed = JSON.parse(dagAgentResult);
          if (!parsed || !Array.isArray(parsed.tasks)) {
            throw new Error("Invalid schema");
          }
          tasks = parsed.tasks;
        } catch {
          throw haltError(
            "Error: PLAN parsing agent failed to return structured task list"
          );
        }
      }

      // TSPEC-IMPL-02: Topological batching
      const batches = computeTopologicalBatches(tasks);

      // TSPEC-IMPL-03: Batch plan logging — must precede first agent() call
      emit("Implementation batch plan:");
      for (let i = 0; i < batches.length; i++) {
        const deps = batches[i].some((t) => t.dependencies.length > 0)
          ? `  (depends on: Batch ${i})`
          : "";
        emit(
          `  Batch ${i + 1}: [${batches[i].map((t) => t.id).join(", ")}]${deps}`
        );
      }
      emit(`  Total: ${tasks.length} tasks in ${batches.length} batches`);

      // TSPEC-IMPL-04: Per-batch se-implement dispatch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        phaseFn(
          `Phase I: Batch ${batchIndex + 1}/${batches.length}`
        );

        const batchResults = await parallelFn(
          batch.map((task) =>
            agentFn(
              "se-implement",
              implementPrompt(task, featureName),
              { isolation: "worktree", model: MODEL_IMPLEMENTATION }
            )
          )
        );

        // TSPEC-IMPL-05: Worktree merge-back
        // The Claude Code runtime handles worktree isolation and merge-back automatically
        // when agents are called with { isolation: "worktree" } (Assumption A2).
        // mergeWorktree() is the testable implementation for environments where the
        // runtime does not handle this transparently.
        for (let i = 0; i < batch.length; i++) {
          const task = batch[i];
          const worktreeBranch = `feat-${featureName}-${task.id}-worktree`;
          const mergeResult = await mergeWorktreeFn(".", worktreeBranch, `feat-${featureName}`);
          if (mergeResult && mergeResult.ok === false) {
            const fileList = (mergeResult.conflictingFiles || []).join(", ") || "(unknown)";
            throw haltError(
              `Error: merge conflict merging worktree for task ${task.id} into feat-${featureName} — conflicting files: ${fileList}. Pipeline halted.`
            );
          }
        }

        // TSPEC-IMPL-06: Per-batch test gate
        evaluateBatchGate(batchResults, batchIndex, batch);
      }

      recordPhase("I", "Implementation", "✅", "All batches complete");

      // ─── Phase PT: PROPERTIES Tests ─────────────────────────────────────
      phaseFn("Phase PT: PROPERTIES Tests");
      const ptResult = await agentFn(
        "se-implement",
        propertiesTestPrompt(featureName)
      );
      const ptGate = evaluateSingleAgentGate(ptResult, "PT");
      if (!ptGate.passed) {
        throw haltError(ptGate.reason);
      }
      testSummary = "All tests passing";
      recordPhase("PT", "PROPERTIES Tests", "✅", "All properties tests passing");

      // ─── Phase CR: Final Codebase Review ─────────────────────────────────
      phaseFn("Phase CR: Final Codebase Review");
      const crWindow = await phaseWindow(null);
      const crResult = await reviewLoop({
        doc: `docs/${featureName}/`,
        phase: "CR",
        docType: null,
        reviewers: PHASE_DISPATCH.CR.reviewers,
        optimizer: PHASE_DISPATCH.CR.optimizer,
        feature: featureName,
        iteration: crWindow.startIndex,
        startIndex: crWindow.startIndex,
        endIndex: crWindow.endIndex,
        _parallel: parallelFn,
        _checkFile: checkFileFn,
        ...wrapperSeams,
      });
      checkConverged(crResult, "CR", PHASE_DISPATCH.CR.label, recordPhase, featureName, crWindow.startIndex, crWindow.endIndex);
      recordPhase("CR", PHASE_DISPATCH.CR.label, "✅", `Approved (${crResult.iterations} iterations)`, crResult.iterations);

      // ─── Phase DOD: Definition of Done Verification ─────────────────────
      if (!phaseDodEnabled) {
        phaseFn("Phase DOD: ⏭ Skipped");
        emit("Phase DOD skipped — DoD verification disabled");
        recordPhase("DOD", PHASE_DISPATCH.DOD.label, "⏭", "Skipped — DoD verification disabled");
      } else {
        phaseFn("Phase DOD: Definition of Done Verification");
        // DOD step 0: rebase onto the latest default branch so the scan — and the PR
        // raised later in Phase PUB — reflects the real merge state. Moved here from
        // ship-pr so DoD evaluates the post-rebase tree.
        const rebaseStatus = await rebaseOntoDefaultFn({
          feature: featureName,
          _agent: agentFn,
          _log: emit,
        });
        if (rebaseStatus === "conflict") {
          recordPhase("DOD", PHASE_DISPATCH.DOD.label, "❌", "Rebase onto default branch conflicted — resolve manually");
          throw haltError(
            `Phase DOD — rebase conflict for feature ${featureName}. ` +
            `The feature branch cannot be cleanly rebased onto the default branch. ` +
            `Resolve conflicts manually and re-run.`
          );
        }
        const dodResult = await dodVerifyLoopFn({
          feature: featureName,
          _agent: agentFn,
          _log: emit,
        });
        if (!dodResult.passed) {
          const detail =
            dodResult.lastStatus
              ? `stubs=${dodResult.lastStatus.stubs}, mock_data=${dodResult.lastStatus.mock_data}, unwired=${dodResult.lastStatus.unwired_integrations}, coverage_gap=${dodResult.lastStatus.coverage_below_threshold}, req_gaps=${dodResult.lastStatus.req_gaps}`
              : "verification failed";
          recordPhase("DOD", PHASE_DISPATCH.DOD.label, "❌", `Failed after ${dodResult.iterations} iterations — ${detail}`, dodResult.iterations);
          throw haltError(
            `Phase DOD failed after ${dodResult.iterations} iterations — Definition of Done not met. ${detail}`
          );
        }
        recordPhase("DOD", PHASE_DISPATCH.DOD.label, "✅", `Passed (${dodResult.iterations} iteration${dodResult.iterations !== 1 ? "s" : ""})`, dodResult.iterations);
      }

      // ─── Phase H: Harvest ────────────────────────────────────────────────
      // check-scope-field fires PostToolUse:Write|Edit on all workflow agent writes;
      // nudge-consolidation fires on the top-level SessionStart only — not inside agent sub-sessions.
      if (!PHASE_H_ENABLED) {
        phaseFn("Phase H: ⏭ Skipped (prerequisite)");
        emit("Phase H skipped — prerequisite not yet landed");
        harvestStatus = "Skipped (prerequisite not yet landed)";
        recordPhase("H", "Harvest", "⏭", "Phase H: ⏭ Skipped (prerequisite not yet landed)");
      } else {
        phaseFn("Phase H: Harvest");
        const learningsPath = `docs/${featureName}/LEARNINGS-${featureName}.md`;
        const harvestResult = await wrappedDispatch({
          skill: "harvest-learnings",
          basePrompt: harvestPrompt(featureName),
          targetPath: learningsPath,
          docType: "LEARNINGS",
          dispatchKind: "harvest",
          phaseId: "H",
        });

        // AC-4.2c: the §4.4 approval record is best-effort and is deliberately NOT
        // part of §5.9's LEARNINGS criterion — a record-writing bug must not
        // re-dispatch harvest to its budget. Its absence is reported, not swallowed.
        const learningsText = await readFileFn(learningsPath);
        if (!/approval record/i.test(String(learningsText ?? ""))) {
          emit(
            `Harvest note: the approval record is missing from ${learningsPath}. ` +
              `It is best-effort (AC-4.2c) and is not a halt condition.`
          );
        }

        // TSPEC-HARVEST-04: Guard block detection
        if (
          typeof harvestResult === "string" &&
          harvestResult.includes(
            "pdlc guard: refusing to delete CROSS-REVIEW files"
          )
        ) {
          // Extract blocked file path from the guard hook's canonical error message
          let blockedPath = "(path not parseable)";
          const dirMatch = harvestResult.match(
            /pdlc guard: refusing to delete CROSS-REVIEW files in \[([^\]]+)\]/
          );
          if (dirMatch) {
            blockedPath = dirMatch[1];
          }
          harvestStatus = `Halted: guard-harvest-before-delete blocked deletion of ${blockedPath}`;
          throw haltError(
            `Phase H halted: guard-harvest-before-delete blocked deletion of ${blockedPath}`
          );
        }

        harvestStatus = "Harvested";
        recordPhase("H", "Harvest", "✅", "Learnings harvested");
      }

      // ─── Phase PUB: Raise PR & Verify CI ─────────────────────────────────
      // Runs last so the PR captures the complete feature branch, including the
      // harvested LEARNINGS. The poll-timing logic lives in raisePrAndVerifyCi.
      if (!phasePubEnabled) {
        phaseFn("Phase PUB: ⏭ Skipped");
        emit("Phase PUB skipped — auto-PR disabled");
        recordPhase("PUB", "Raise PR & Verify CI", "⏭", "Skipped — auto-PR disabled");
      } else {
        phaseFn("Phase PUB: Raise PR & Verify CI");
        const pubResult = await raisePrAndVerifyCiFn({
          feature: featureName,
          _agent: agentFn,
          _checkCi: checkCiFn,
          _log: emit,
          _now,
          _sleep,
        });
        prUrl = pubResult.prUrl;
        ciStatus = pubResult.ciStatus;
        const ciDetail =
          ciStatus === "passed"
            ? `PR ${prUrl} — all GHA checks passed`
            : `PR ${prUrl} — no GHA checks detected within timeout (assumed none configured)`;
        recordPhase("PUB", "Raise PR & Verify CI", "✅", ciDetail);
      }

      // ─── Phase MERGE: Merge & Advance Queue ──────────────────────────────
      // TSPEC §10.4: placed immediately after Phase PUB, inside the same
      // guarded `pipelineFn` body — Phase MERGE's own internal try/catch
      // (§5.2) is what keeps this call from ever reaching the halt path below.
      phaseFn("Phase MERGE: Merge & Advance Queue");
      mergeOutcome = await phaseMerge({
        feature: featureName,
        prUrl,
        _ghRun: ghRunFn,
        _git: gitFn,
        _readFile: readFileFn,
        _recordQueueRow: recordQueueRowFn,
        _log: emit,
        _now,
        _sleep,
        _enabled: phaseMergeEnabled,
      });
      for (const line of mergeOutcome.escalations) notices.push(line);
      for (const note of mergeOutcome.notes) notices.push(note);
      // §10.3: the glyph is never ❌ — the halt path derives the failed phase
      // from a recorded "❌" row, and Phase MERGE never halts the pipeline.
      const mergeGlyph =
        mergeOutcome.mergeStatus === "merged"
          ? "✅"
          : mergeOutcome.mergeStatus === "skipped"
            ? "⏭"
            : "⚠️";
      const mergeDetail =
        mergeOutcome.mergeStatus === "merged"
          ? `Merged ${prUrl} (${mergeOutcome.mergeMethod}, ${
              typeof mergeOutcome.mergeSha === "string"
                ? mergeOutcome.mergeSha.slice(0, 7)
                : "sha unknown"
            })`
          : mergeOutcome.reason;
      recordPhase("MERGE", "Merge PR", mergeGlyph, mergeDetail);
    });
  } catch (err) {
    haltReason = err.message;
    if (testSummary === "Not run" && haltReason) {
      testSummary = haltReason;
    }

    // ─── TSPEC §4.7 / §6.5 — what an operator gets on a halt ────────────────
    // The phase that failed is read off the recorded rows rather than carried in
    // a parallel variable, so it can never disagree with the phase table.
    const failedRow = [...phases].reverse().find((row) => row.status === "❌");
    const haltPhase = failedRow ? failedRow.phase : null;

    // §6.3: the POSTMORTEM claim is a FILESYSTEM confirmation, never the agent's
    // narration — the whole of H-2 is that the two were assumed to agree.
    let postmortemStatus = "none";
    let postmortemPath = null;
    // §6.2 row 13: a step-G refusal names an EXISTING, unresolved POSTMORTEM.
    // The existence check below would call the same artifact `"written"` — the
    // refusal's whole point is that it was not written by this run.
    if (gatePostmortem) {
      postmortemStatus = "unresolved";
      postmortemPath = gatePostmortem.path;
    } else if (err && err.postmortemStatus) {
      // §6.3/§6.4: `checkConverged` already resolved the disposition from
      // `reviewLoop`'s `_checkFile` confirmation. Re-probing here would call a
      // file that a LATER phase happens to have left behind this phase's
      // POSTMORTEM, and would contradict the halt reason it already emitted.
      postmortemStatus = err.postmortemStatus;
      postmortemPath = err.postmortemPath ?? null;
    } else if (haltPhase) {
      const candidate = `docs/${featureName}/POSTMORTEM-${haltPhase}-${featureName}.md`;
      let confirmation;
      try {
        confirmation = await checkFileFn(candidate);
      } catch {
        confirmation = { ok: false };
      }
      if (confirmation && confirmation.ok) {
        postmortemStatus = "written";
        postmortemPath = candidate;
      }
    }

    // §6.5: EVERY halt class commits the queue row — exactly once per invocation.
    let queueRow = null;
    try {
      const recorded = await recordQueueRowFn({ feature: featureName, status: "halted" });
      queueRow = recorded && recorded.queueRow ? recorded.queueRow : null;
      // §6.5 / E-38, E-40: a row write that failed or found nothing leaves the
      // operator a REMAINING ACTION, and that action reaches them as its own
      // report line — never folded into `haltReason`, which stays the phase's own
      // reason (AT-33's "subordinate"). A clean write carries no detail and is
      // therefore silent: AT-31's "one failure, not two" and AT-34's "no-op is
      // not a fault" are both that silence.
      if (recorded && recorded.detail) {
        notices.push(`Queue row ${queueRow}: ${recorded.detail}`);
      }
    } catch {
      queueRow = null;
    }

    if (postmortemStatus === "none") {
      emit("No POSTMORTEM was written.");
    }
    // §14.4: exactly ONE recovery act is offered. A direct re-invocation is
    // deliberately not offered — the queue row is the single entry point.
    emit(
      `Recover: set the ${featureName} row in docs/_queue/QUEUE.md back to pending, then re-run the queue.`
    );

    return buildFinalReport({
      feature: featureName,
      outcome: "halted",
      phases,
      artifactPaths,
      testSummary,
      harvestStatus: harvestStatus === "Not run" ? "Not run" : harvestStatus,
      prUrl,
      ciStatus,
      haltReason,
      haltPhase,
      postmortemStatus,
      postmortemPath,
      queueRow,
      notices,
    });
  }

  return buildFinalReport({
    feature: featureName,
    outcome: "success",
    notices,
    // §4.7 / TSPEC §10.1: `queueRow` rides on every report. A run that never
    // reaches Phase MERGE — or reaches it without merging — writes no status
    // of its own (`orchestrate-dev` owns no other status write but the halt
    // one — AC-2.7a), so the value is the same `"none"` the default
    // `_recordQueueRow` reports; a `merged` run instead carries the §7.4
    // disposition `phaseMerge` itself produced.
    queueRow: mergeOutcome.queueRow ?? "none",
    mergeStatus: mergeOutcome.mergeStatus,
    mergeSha: mergeOutcome.mergeSha,
    mergeMethod: mergeOutcome.mergeMethod,
    // §4.7: a phase skipped over an unresolved POSTMORTEM still reports it.
    postmortemStatus: skipPostmortem ? "unresolved" : "none",
    postmortemPath: skipPostmortem ? skipPostmortem.path : null,
    phases,
    artifactPaths,
    testSummary,
    harvestStatus,
    prUrl,
    ciStatus,
  });
}

// ─── Merge worktree helper (TSPEC-IMPL-05) ────────────────────────────────────

/**
 * Merges a worktree branch into the current HEAD of the given repo directory.
 *
 * Steps:
 *   1. Run `git merge --no-ff {worktreeBranch}` in {repoPath}.
 *   2. On non-zero exit: run `git diff --name-only --diff-filter=U` to get conflicting files.
 *   3. Run `git merge --abort`.
 *   4. Return `{ ok: false, conflictingFiles: string[] }`.
 *   On success: return `{ ok: true }`.
 *
 * @param {string} repoPath       - Path to the git repo (cwd for git commands)
 * @param {string} worktreeBranch - Branch name to merge (e.g. "feat-task-01-worktree")
 * @param {string} [targetBranch] - Target branch name (informational only; repo must already be on it)
 * @param {{ execFn?: function }} [opts] - Injection point for tests (override execSync)
 * @returns {Promise<{ ok: true } | { ok: false, conflictingFiles: string[] }>}
 */
async function mergeWorktree(repoPath, worktreeBranch, targetBranch, { execFn } = {}) {
  const { execSync: realExecSync } = await import("child_process");
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));

  const execOpts = { cwd: repoPath, stdio: "pipe", encoding: "utf8" };

  try {
    exec(`git merge --no-ff ${worktreeBranch}`, execOpts);
    return { ok: true };
  } catch {
    // Non-zero exit: capture conflicting files before aborting
    let conflictingFiles = [];
    try {
      const diffOutput = exec(
        "git diff --name-only --diff-filter=U",
        execOpts
      );
      conflictingFiles = diffOutput
        .trim()
        .split("\n")
        .filter((line) => line.length > 0);
    } catch {
      // If diff fails (e.g. nothing staged), return empty list
    }

    try {
      exec("git merge --abort", execOpts);
    } catch {
      // Abort may fail if merge wasn't in progress — ignore
    }

    return { ok: false, conflictingFiles };
  }
}

// ─── Final report builder ─────────────────────────────────────────────────────

function buildFinalReport({
  feature,
  outcome,
  phases,
  artifactPaths,
  testSummary,
  harvestStatus,
  prUrl,
  ciStatus,
  haltReason,
  haltPhase = null,
  postmortemStatus = "none",
  postmortemPath = null,
  queueRow = null,
  // TSPEC §10.1: present, unconditionally, on EVERY report — including the
  // halt path, which never assigns these and so reports exactly this default
  // (FSPEC §11 row 23: a run that halted before Phase MERGE considered no
  // merge at all).
  mergeStatus = "skipped",
  mergeSha = null,
  mergeMethod = null,
  notices = [],
}) {
  return {
    feature,
    outcome,
    phases,
    artifactPaths,
    testSummary,
    harvestStatus,
    // §4.7's non-skip report lines. Carried as their own field rather than
    // appended to a phase row's `detail`, which oracles pin verbatim.
    notices,
    // §4.7's four halt-disposition fields ride on EVERY report, present with a
    // readable value on success too: a conditionally-spread field cannot express
    // "no POSTMORTEM", which is precisely the fact `RLH-AT-46` reads.
    haltPhase,
    postmortemStatus,
    postmortemPath,
    queueRow,
    mergeStatus,
    mergeSha,
    mergeMethod,
    ...(prUrl ? { prUrl } : {}),
    ...(ciStatus ? { ciStatus } : {}),
    ...(haltReason ? { haltReason } : {}),
  };
}

return { main, meta, checkPrCi, mergeWorktree, checkFileNonEmpty, parsePlanTasks };
})();

const __queue = (function () {
const realMain = __dev.main;
/**
 * orchestrate-queue.js — Serial queue driver around orchestrate-dev
 *
 * Canonical plugin source: pdlc/workflows/orchestrate-queue.js
 * Built artifact:          pdlc/workflows/dist/orchestrate-queue.bundle.js
 * Consumer runtime copy:   installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh
 *
 * Purpose
 * -------
 * The PDLC pipeline (orchestrate-dev) is NOT stateless: each FSPEC/TSPEC/PLAN is
 * authored against the codebase as it exists at fire time. Two REQs that touch the
 * same subsystem must therefore run in a dependency-respecting order, one at a time.
 *
 * This wrapper turns a human-curated queue into a Claude loop ("/loop run
 * /pdlc:orchestrate-queue"). On each invocation it picks AT MOST ONE ready REQ from
 * docs/_queue/QUEUE.md, runs a Phase-0 readiness check, and — if ready — delegates
 * the whole pipeline to orchestrate-dev's main(). One feature per invocation keeps
 * each run bounded and observable; the loop fires again for the next.
 *
 * Design axes (resolved with the developer):
 *   1. Ordering   — QUEUE.md gives the high-level order (Option A) AND each REQ
 *                   declares its own `depends-on` in frontmatter (Option B). The
 *                   effective dependency set is the UNION of both. A REQ that is not
 *                   marked `ready: true` in its frontmatter is never auto-picked,
 *                   so an in-progress draft can sit safely in the queue.
 *   2. Concurrency— Serial. One pipeline per invocation; an existing `in-progress`
 *                   queue entry blocks new pickups until a human resolves it.
 *   3. Readiness  — A Phase-0 triage agent (se-author, which knows the current
 *                   implementation) verifies declared dependencies are actually
 *                   present in the base before the dependent's specs are authored.
 *                   A deterministic pre-check (precheckDependencies) runs FIRST and
 *                   short-circuits candidates the queue already proves blocked (a
 *                   dependency present with a non-`done` status), so no Sonnet triage
 *                   agent is spawned to rediscover what QUEUE.md already states.
 *
 * Manual single-REQ runs remain available via /pdlc:orchestrate-dev — this wrapper
 * does not replace it, it drives it.
 */


// ─── Exported meta object (mirrors orchestrate-dev) ──────────────────────────
const meta = {
  name: "orchestrate-queue",
  description:
    "Serial PDLC queue driver — picks the next ready REQ from docs/_queue/QUEUE.md and runs orchestrate-dev for it. Designed to be driven by /loop.",
  inputs: [
    {
      name: "queuePath",
      description:
        "Path to the queue file. Defaults to docs/_queue/QUEUE.md.",
      type: "string",
      required: false,
    },
  ],
};

// Default location of the queue file.
const DEFAULT_QUEUE_PATH = "docs/_queue/QUEUE.md";

// Location of the drift-state artifact the queue's gate reads (FSPEC §6.1). Written by the
// sync hook / manual sync / manifest check — never by this module.
const DRIFT_STATE_PATH = ".claude/workflows/.pdlc-drift-state.json";

// MODEL-01: the queue driver's own agent work (the Phase-0 readiness triage) runs
// on Sonnet — it is a bounded lookup against git/working-tree state, not deep
// reasoning. The delegated pipeline (orchestrate-dev) pins its OWN models: Opus for
// every phase except its Phase I implementation batches. See orchestrate-dev.js.
const MODEL_QUEUE = "sonnet";

// Recognized queue statuses. Only `pending` entries are eligible for pickup.
// `in-progress` is a crash/active marker; `awaiting-merge`/`done`/`blocked`/`halted`
// are terminal-for-this-loop and skipped.
const QUEUE_STATUSES = [
  "pending",
  "in-progress",
  "awaiting-merge",
  "done",
  "blocked",
  "halted",
];

// TSPEC §8.2 — the closed *row disposition* catalogue `rewriteStatus` /
// `commitQueueRow` / `uncommitted` report through `_recordQueueRow`. This is
// vocabulary about the queue-row *write*, never about the queue *status*
// column (`QUEUE_STATUSES` above): a disposition of `"recorded"` can be
// reported whatever `status` was written, including `"halted"`. Exported and
// frozen (DC-01) so a test enumerates membership rather than pinning prose.
const QUEUE_ROW_DISPOSITIONS = Object.freeze([
  "recorded",
  "recorded (uncommitted)",
  "none",
  "error",
]);

// ─── Halt helper (same shape as orchestrate-dev) ─────────────────────────────
function haltError(message) {
  const err = new Error(message);
  err.isHalt = true;
  return err;
}

// ─── QUEUE-PARSE-01: parseQueue ──────────────────────────────────────────────

/**
 * Parse a QUEUE.md markdown table into an ordered list of entries.
 *
 * Expected table columns (header row is matched case-insensitively, extra columns
 * are ignored): Order | Status | Feature | REQ Path | Depends-On
 *
 * Depends-On is a comma/space separated list of feature names, or "-"/"—"/"" for none.
 *
 * @param {string | null | undefined} markdown - Raw QUEUE.md contents
 * @returns {Array<{order: number|null, status: string, feature: string, reqPath: string, dependsOn: string[], rawStatus: string}>}
 */
function parseQueue(markdown) {
  if (markdown == null || typeof markdown !== "string") return [];

  const rows = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  if (rows.length === 0) return [];

  // Locate header to map columns; fall back to positional if header missing.
  let headerIdx = -1;
  let cols = null;
  for (let i = 0; i < rows.length; i++) {
    const cells = splitRow(rows[i]).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("req"))) {
      headerIdx = i;
      cols = cells;
      break;
    }
  }

  const colIndex = (names) => {
    if (!cols) return -1;
    for (let i = 0; i < cols.length; i++) {
      if (names.some((n) => cols[i].includes(n))) return i;
    }
    return -1;
  };

  const idxOrder = colIndex(["order", "#"]);
  const idxStatus = colIndex(["status"]);
  const idxFeature = colIndex(["feature"]);
  const idxReq = colIndex(["req path", "req", "path"]);
  const idxDeps = colIndex(["depends", "depends-on", "deps"]);

  const entries = [];
  const startIdx = headerIdx === -1 ? 0 : headerIdx + 1;

  for (let i = startIdx; i < rows.length; i++) {
    const cells = splitRow(rows[i]);
    // Skip the markdown separator row (|---|---|).
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    if (cells.length === 0) continue;

    const rawStatus = pick(cells, idxStatus, 1);
    const status = (rawStatus || "").toLowerCase();
    const feature = pick(cells, idxFeature, 2);
    const reqPath = pick(cells, idxReq, 3);
    if (!feature && !reqPath) continue; // not a data row

    const orderRaw = pick(cells, idxOrder, 0);
    const order = /^\d+$/.test(orderRaw) ? parseInt(orderRaw, 10) : null;

    entries.push({
      order,
      status,
      rawStatus: rawStatus || "",
      feature,
      reqPath,
      dependsOn: parseDepsCell(pick(cells, idxDeps, 4)),
    });
  }

  return entries;
}

function splitRow(row) {
  // Drop leading/trailing pipe, then split. Keeps internal spacing trimmed.
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function pick(cells, idx, fallbackIdx) {
  const i = idx >= 0 ? idx : fallbackIdx;
  return i >= 0 && i < cells.length ? cells[i] : "";
}

function parseDepsCell(cell) {
  if (!cell) return [];
  const cleaned = cell.replace(/[—–-]/g, (m) => (m === "-" ? "-" : "")).trim();
  if (cleaned === "" || cleaned === "-" || cleaned.toLowerCase() === "none") {
    return [];
  }
  return cell
    .split(/[\s,]+/)
    .map((d) => d.trim())
    .filter((d) => d && d !== "-" && d !== "—" && d !== "–" && d.toLowerCase() !== "none");
}

// ─── QUEUE-PARSE-02: parseReqFrontmatter ─────────────────────────────────────

/**
 * How far into a REQ to look for the frontmatter block. Large enough to clear
 * an agent-added preamble, small enough that a `---` rule in the body is never
 * mistaken for frontmatter.
 */
const FRONTMATTER_SCAN_LIMIT = 4000;

/**
 * Parse the YAML-ish frontmatter block of a REQ document.
 *
 * Recognized keys:
 *   ready: true|false       — gate. Absent or non-true means "not pickable".
 *   depends-on: [a, b]      — inline list, or comma/space list, or "-"/none.
 *   feature: name           — informational.
 *
 * Tolerant of missing frontmatter (returns ready:false so nothing is auto-run by
 * accident) and of simple YAML list syntaxes.
 *
 * @param {string | null | undefined} text - Raw REQ contents
 * @returns {{ ready: boolean, dependsOn: string[], feature: string|null }}
 */
function parseReqFrontmatter(text) {
  const empty = { ready: false, dependsOn: [], feature: null };
  if (text == null || typeof text !== "string") return empty;

  // The frontmatter is normally the first thing in the file, but the runtime
  // reads files by round-tripping them through an agent's final message: for a
  // large REQ the agent may prepend a line explaining it could not return the
  // whole file verbatim. Scan a bounded prefix for the first `---` block rather
  // than anchoring at offset 0, so a preamble does not read as "no frontmatter"
  // (which silently degrades to ready:false and skips a genuinely ready REQ).
  const head = text.slice(0, FRONTMATTER_SCAN_LIMIT);
  const fm = /(?:^|\n)\s*---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(head);
  if (!fm) return empty;

  const body = fm[1];
  const lines = body.split("\n");

  let ready = false;
  let feature = null;
  let dependsOn = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();

    if (key === "ready") {
      ready = value.toLowerCase() === "true";
    } else if (key === "feature") {
      feature = value || null;
    } else if (key === "depends-on" || key === "dependson" || key === "deps") {
      if (value.startsWith("[")) {
        // inline flow list: [a, b]
        dependsOn = value
          .replace(/^\[/, "")
          .replace(/\]$/, "")
          .split(/[\s,]+/)
          .map((d) => d.trim().replace(/['"]/g, ""))
          .filter(Boolean);
      } else if (value === "" ) {
        // block list on following indented "- item" lines
        for (let j = i + 1; j < lines.length; j++) {
          const item = /^\s*-\s*(.+)$/.exec(lines[j]);
          if (!item) break;
          dependsOn.push(item[1].trim().replace(/['"]/g, ""));
        }
      } else if (value !== "-" && value.toLowerCase() !== "none") {
        dependsOn = value
          .split(/[\s,]+/)
          .map((d) => d.trim().replace(/['"]/g, ""))
          .filter((d) => d && d !== "-");
      }
    }
  }

  return { ready, dependsOn, feature };
}

// ─── QUEUE-PARSE-03: parseTriageVerdict ──────────────────────────────────────

/**
 * Extract the Phase-0 triage verdict from an se-author result.
 * Looks for the last line of form `TRIAGE: ready|blocked|needs-human`.
 * Defaults to "needs-human" (the safe, no-auto-run option) when absent/malformed.
 *
 * @param {string | null | undefined} result
 * @returns {{ verdict: "ready"|"blocked"|"needs-human", reason: string }}
 */
function parseTriageVerdict(result) {
  const fallback = {
    verdict: "needs-human",
    reason: "triage agent returned no TRIAGE verdict — treating as needs-human",
  };
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return fallback;
  }

  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    const m = /^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$/i.exec(trimmed);
    if (m) {
      return {
        verdict: m[1].toLowerCase(),
        reason: m[2].trim() || "(no reason given)",
      };
    }
  }
  return fallback;
}

// ─── QUEUE-WRITE-01: updateQueueStatus ───────────────────────────────────────

/**
 * Return a new QUEUE.md string with `feature`'s row Status cell set to newStatus.
 * Pure string transform — preserves all other formatting.
 *
 * TSPEC §4.6: the return is `{ markdown, matched }`, not a bare string. The old
 * not-found path (`return markdown; // feature row not found`) was
 * indistinguishable, to the caller, from a successful update whose replacement
 * happened to be a no-op — so a status write against a row that had been deleted
 * mid-run looked exactly like a write that landed. `matched` makes the
 * difference observable, which is what `_recordQueueRow` needs in order to
 * report `queueRow: "error"` (FSPEC §13.5) rather than claiming a write it
 * never made.
 *
 * `evidence` (TSPEC §8.4) is the 4th, defaulted, parameter. `evidence == null`
 * is exactly today's code path, character for character: column resolution,
 * row match, `newCells[statusCol] = newStatus`, re-emit — no migration, no
 * sixth cell, no re-emission of any other row (FSPEC §7.4's required
 * evidence-free identity property, PROP-M-12). `evidence != null` first
 * applies the §2.5 non-overwrite rule (only `in-progress` / `awaiting-merge`
 * / `done` rows are overwritten; any other status is reported back,
 * untouched, as `{ matched: true, written: false, foundStatus }`) and, when
 * overwritable, migrates the `Evidence` column via `ensureEvidenceColumn`
 * (once — never twice) before setting the status cell and merging the
 * evidence cell through `mergeEvidenceCell`'s no-downgrade rule.
 *
 * @param {string} markdown
 * @param {string} feature
 * @param {string} newStatus
 * @param {string|null} [evidence]
 * @returns {{ markdown: string, matched: boolean, written?: boolean, foundStatus?: string }}
 */
function updateQueueStatus(markdown, feature, newStatus, evidence = null) {
  if (typeof markdown !== "string" || !feature) {
    return { markdown, matched: false };
  }

  const lines = markdown.split("\n");

  // Resolve column indices from the header (same logic as parseQueue).
  let statusCol = 1;
  let featureCol = 2;
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim()).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("feature"))) {
      const s = cells.findIndex((c) => c.includes("status"));
      const f = cells.findIndex((c) => c.includes("feature"));
      if (s >= 0) statusCol = s;
      if (f >= 0) featureCol = f;
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    if ((cells[featureCol] || "").trim() !== feature) continue;

    // evidence == null: exactly today's code path, byte for byte (§8.4.1).
    if (evidence == null) {
      const newCells = cells.slice();
      newCells[statusCol] = newStatus;
      lines[i] = `| ${newCells.join(" | ")} |`;
      return { markdown: lines.join("\n"), matched: true };
    }

    // evidence != null: §2.5's non-overwrite rule first — the file is
    // returned byte-unchanged whenever the row's current status is not
    // one the write-back is permitted to overwrite.
    const foundStatus = (cells[statusCol] || "").trim();
    if (!EVIDENCE_OVERWRITABLE_STATUSES.includes(foundStatus)) {
      return { markdown, matched: true, written: false, foundStatus };
    }

    // Overwritable: migrate the Evidence column (once), re-locate the row in
    // the migrated table, set the status and evidence cells, and re-emit.
    return writeEvidenceCarryingRow(markdown, feature, newStatus, evidence, {
      statusCol,
      featureCol,
    });
  }

  return { markdown, matched: false }; // feature row not found
}

// TSPEC §8.4c / FSPEC §2.5 — the only statuses the evidence-carrying write is
// permitted to overwrite. Any other status (`pending`, `blocked`, `halted`)
// is left untouched: it describes work this run did not drive to completion.
const EVIDENCE_OVERWRITABLE_STATUSES = ["in-progress", "awaiting-merge", "done"];

/**
 * The evidence-carrying write itself (TSPEC §8.4, steps a/d/e), split out so
 * `updateQueueStatus`'s non-overwrite early-return never touches
 * `ensureEvidenceColumn` — the file it returns on that path is the pristine
 * input, not a discarded migration.
 *
 * @param {string} markdown
 * @param {string} feature
 * @param {string} newStatus
 * @param {string} evidence
 * @param {{statusCol: number, featureCol: number}} hint - column indices
 *   resolved from the pre-migration header (unaffected by the appended
 *   Evidence column, which lands after them).
 * @returns {{ markdown: string, matched: boolean, written?: boolean }}
 */
function writeEvidenceCarryingRow(markdown, feature, newStatus, evidence, hint) {
  const { markdown: migrated } = ensureEvidenceColumn(markdown);
  const lines = migrated.split("\n");

  let statusCol = hint.statusCol;
  let featureCol = hint.featureCol;
  let evidenceCol = -1;
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim()).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("feature"))) {
      const s = cells.findIndex((c) => c.includes("status"));
      const f = cells.findIndex((c) => c.includes("feature"));
      const e = cells.findIndex((c) => c.includes("evidence"));
      if (s >= 0) statusCol = s;
      if (f >= 0) featureCol = f;
      if (e >= 0) evidenceCol = e;
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    if ((cells[featureCol] || "").trim() !== feature) continue;

    const newCells = cells.slice();
    newCells[statusCol] = newStatus;
    if (evidenceCol >= 0) {
      const prevEvidence = (newCells[evidenceCol] || "").trim();
      newCells[evidenceCol] = mergeEvidenceCell(prevEvidence, evidence);
    }
    lines[i] = `| ${newCells.join(" | ")} |`;
    return { markdown: lines.join("\n"), matched: true, written: true };
  }

  // Unreachable in practice — the caller already located this exact row
  // before migrating — but stay defensive rather than throw.
  return { markdown, matched: false };
}

// ─── QUEUE-WRITE-02: ensureEvidenceColumn / mergeEvidenceCell ────────────────
// TSPEC §8.5, FSPEC §7.3 (Q-02) and §7.2. Pure helpers behind the `Evidence`
// column Phase MERGE's queue write-back needs; `updateQueueStatus` (B2)
// drives them, they do not drive it.

/**
 * Migrate a QUEUE.md table to carry a sixth `Evidence` column, once.
 *
 * Exactly three structural changes, and no fourth (FSPEC §7.3): `Evidence`
 * appended to the header row (the row whose cells include "status" and one
 * containing "feature" — the same predicate `parseQueue`/`updateQueueStatus`
 * use); one `---` cell appended to the separator row immediately below it,
 * recognised by "every cell is a dash run or empty"; and one empty cell
 * appended to every other data row, so cell counts stay uniform. Rows that
 * are not part of the table (prose, blank lines, anything not starting with
 * `|`) are untouched, and no other cell of any row is rewritten — the
 * append is a string splice after the row's trailing `|`, never a
 * split/rejoin of the row's existing cells. A queue already carrying an
 * `Evidence` column is returned unchanged (`migrated: false`) — never
 * migrated twice. A queue with no recognisable header is also returned
 * unchanged.
 *
 * @param {string} markdown
 * @returns {{ markdown: string, migrated: boolean }}
 */
function ensureEvidenceColumn(markdown) {
  if (typeof markdown !== "string") return { markdown, migrated: false };

  const lines = markdown.split("\n");
  const isSeparatorRow = (cells) => cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "");
  const appendCell = (line, cellText) => `${line.replace(/\|\s*$/, "")}| ${cellText} |`;

  // Locate the header row exactly as parseQueue/updateQueueStatus do.
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim()).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("feature"))) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return { markdown, migrated: false }; // no table found

  const headerCells = splitRow(lines[headerIdx].trim()).map((c) => c.toLowerCase());
  if (headerCells.some((c) => c.includes("evidence"))) {
    return { markdown, migrated: false }; // already migrated — never twice
  }

  lines[headerIdx] = appendCell(lines[headerIdx].trim(), "Evidence");

  // The separator row is the very next `|`-starting line, if it is
  // separator-shaped; appending an empty-shaped dash cell keeps the
  // rendered table well-formed over a six-column header.
  const sepIdx = headerIdx + 1;
  if (sepIdx < lines.length && lines[sepIdx].trim().startsWith("|")) {
    const sepLine = lines[sepIdx].trim();
    if (isSeparatorRow(splitRow(sepLine))) {
      lines[sepIdx] = appendCell(sepLine, "---");
    }
  }

  // Every other `|`-starting row is a data row: append one empty cell.
  for (let i = sepIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const trimmed = line.trim();
    if (isSeparatorRow(splitRow(trimmed))) continue; // a stray separator-shaped row
    lines[i] = appendCell(trimmed, "");
  }

  return { markdown: lines.join("\n"), migrated: true };
}

/**
 * FSPEC §7.2's no-downgrade rule for the `Evidence` cell: a cell already
 * holding a non-empty value is never downgraded to the `merged #{prNumber}`
 * placeholder form by a later re-entry that could not resolve the oid — a
 * real SHA always wins over a placeholder. Everything else takes the new
 * value, including a `merged #{n}` cell being overwritten by a later
 * `{shortSha} #{n}` once the oid resolves.
 *
 * @param {string} prev - the cell's current content (e.g. "" for a freshly migrated row).
 * @param {string} next - the value this write would set absent the rule.
 * @returns {string}
 */
function mergeEvidenceCell(prev, next) {
  if (typeof prev === "string" && prev !== "" && /^merged #/.test(next)) {
    return prev;
  }
  return next;
}

// ─── selectNextPending ───────────────────────────────────────────────────────

/**
 * Decide which queue entry to attempt next, BEFORE the async readiness triage.
 * Pure: returns the first `pending` entry whose REQ-gate could let it run, or a
 * structured "nothing to pick" reason. Also surfaces an `in-progress` blocker.
 *
 * @param {Array} entries - parseQueue() output
 * @returns {{ kind: "blocked-active", entry: object }
 *          | { kind: "candidates", candidates: object[] }
 *          | { kind: "empty", reason: string }}
 */
function selectNextPending(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { kind: "empty", reason: "queue is empty" };
  }

  const active = entries.find((e) => e.status === "in-progress");
  if (active) {
    return { kind: "blocked-active", entry: active };
  }

  const candidates = entries.filter((e) => e.status === "pending");
  if (candidates.length === 0) {
    return {
      kind: "empty",
      reason: "no pending entries (all done, awaiting-merge, blocked, or halted)",
    };
  }

  // Preserve queue order: by explicit order field when present, else document order.
  candidates.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    return 0;
  });

  return { kind: "candidates", candidates };
}

// ─── precheckDependencies ─────────────────────────────────────────────────────

/**
 * Deterministic dependency pre-check run BEFORE the Sonnet triage agent.
 *
 * The queue file already records the lifecycle status of every feature it knows
 * about. If a declared dependency is present in the queue with a non-`done` status
 * it is *definitely* not merged into the base yet — no agent session is needed to
 * conclude the candidate is blocked. This short-circuits that case to avoid burning
 * a triage agent spawn on an answer the queue already gives.
 *
 * Conservative on purpose: a dependency that is `done`, or one that is absent from
 * the queue entirely, CANNOT be judged from the queue alone (it may live outside the
 * queue, or `done` may not yet be reflected in the working tree) — those fall
 * through to the triage agent, which inspects git/working-tree state.
 *
 * @param {string[]} dependsOn - union of QUEUE ∪ REQ-frontmatter dependency names
 * @param {Array} entries      - parseQueue() output
 * @returns {{ blocked: boolean, reason?: string }}
 */
function precheckDependencies(dependsOn, entries) {
  if (!Array.isArray(dependsOn) || dependsOn.length === 0) {
    return { blocked: false };
  }
  const rows = Array.isArray(entries) ? entries : [];

  for (const dep of dependsOn) {
    const match = rows.find((e) => e.feature === dep);
    // Present in the queue but not yet done → definitely blocked. First one wins.
    if (match && match.status !== "done") {
      return {
        blocked: true,
        reason: `dependency ${dep} is ${match.status} in queue (not done)`,
      };
    }
    // Dependency done, or not in the queue at all → inconclusive here; defer to triage.
  }

  return { blocked: false };
}

// ─── Prompt helper ───────────────────────────────────────────────────────────

function triagePrompt(feature, reqPath, dependsOn) {
  const depList = dependsOn.length ? dependsOn.join(", ") : "(none declared)";
  return (
    `Phase-0 readiness triage for feature "${feature}".\n` +
    `REQ: ${reqPath}\n` +
    `Declared dependencies (must already be merged into the base branch): ${depList}\n\n` +
    `Determine whether the PDLC pipeline can author correct FSPEC/TSPEC/PLAN for this REQ NOW, ` +
    `given the current state of the codebase. Specifically verify, using git history and the ` +
    `working tree, that every declared dependency's implementation is present in the base. ` +
    `Also flag if the REQ references subsystems that do not yet exist.\n\n` +
    `Do NOT modify any files. End your final message with exactly one line:\n` +
    `TRIAGE: ready        <one-line reason>   — dependencies satisfied, safe to run\n` +
    `TRIAGE: blocked      <one-line reason>   — a dependency is not yet in the base; skip for now\n` +
    `TRIAGE: needs-human  <one-line reason>   — ambiguous; a human must decide`
  );
}

// ─── Runtime API stubs (replaced by real runtime in production) ──────────────
/* Mirror orchestrate-dev: tests override these via dependency injection. */

// eslint-disable-next-line no-unused-vars
async function agent(skill, prompt, opts) {
  throw new Error("agent() not available outside Claude Code runtime");
}

// eslint-disable-next-line no-unused-vars
function phase(label) {
  // Provided by runtime
}

function log(message) {
  if (typeof console !== "undefined") {
    console.log("[orchestrate-queue]", message);
  }
}

// Default file IO — real fs, injectable for tests (mirrors mergeWorktree style).
async function defaultReadFile(path) {
  const { readFileSync } = await import("fs");
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

async function defaultWriteFile(path, contents) {
  const { writeFileSync } = await import("fs");
  writeFileSync(path, contents, "utf8");
}

// ─── TSPEC §3.4 — the transport seam's Node default ───────────────────────────

/**
 * Run a git command. The caller branches on `ok`; the seam interprets nothing
 * and never throws. `argv` is an array, NOT a command string: a string would
 * need quoting rules at the seam boundary and would make a feature name
 * containing a space a shell-injection surface.
 *
 * Mirrors `defaultGit` in orchestrate-dev.js (RLH-18). The two modules are
 * bundled into separate IIFEs, so the duplicate name is not a collision, and
 * each module stays independently loadable by the runtime.
 *
 * @param {string[]} argv - git arguments, NOT including the leading "git"
 * @param {{ execFn?: function }} [opts] - injection point for tests
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
 */
async function defaultGit(argv, { execFn } = {}) {
  const { execFileSync: realExecFileSync } = await import("child_process");
  const exec =
    execFn ?? ((file, args, opts) => realExecFileSync(file, args, opts));

  const args = Array.isArray(argv) ? argv : [];
  const execOpts = { stdio: "pipe", encoding: "utf8" };

  try {
    const stdout = exec("git", args, execOpts);
    return { ok: true, stdout: String(stdout ?? ""), stderr: "" };
  } catch (err) {
    return {
      ok: false,
      stdout: String((err && err.stdout) ?? ""),
      stderr: String((err && (err.stderr || err.message)) ?? ""),
    };
  }
}

// ─── main() ───────────────────────────────────────────────────────────────────

/**
 * Drive the queue: pick at most one ready REQ and run the full pipeline for it.
 *
 * @param {object} params
 * @param {string} [params.queuePath]   - Defaults to DEFAULT_QUEUE_PATH.
 * @param {function} [params._agent]      - Injected agent (triage).
 * @param {function} [params._readFile]   - async (path) => string|null.
 * @param {function} [params._writeFile]  - async (path, contents) => void.
 * @param {function} [params._git]        - async (argv) => {ok, stdout, stderr};
 *   TSPEC §3.6 — threads down to `rewriteStatus` so every status write is
 *   committed (§6.5). Never throws; the caller branches on `ok`.
 * @param {function} [params._runPipeline]- async ({reqPath}) => FinalReport.
 * @param {function} [params._log]        - Injected logger.
 * @param {function} [params._phase]      - Injected phase marker.
 * @returns {Promise<QueueReport>}
 */
async function main({
  queuePath = DEFAULT_QUEUE_PATH,
  _agent: rawAgentFn = agent,
  _readFile: readFileFn = defaultReadFile,
  _writeFile: writeFileFn = defaultWriteFile,
  _git: gitFn = defaultGit,
  _runPipeline: runPipelineFn = realMain,
  _log: logFn = log,
  _phase: phaseFn = phase,
} = {}) {
  const emit = logFn;

  // MODEL-01: pin the queue's own agent calls (Phase-0 triage) to Sonnet. The
  // delegated orchestrate-dev pipeline is invoked without _agent below, so it uses
  // its OWN runtime agent and its OWN Opus-default model pinning — unaffected by this.
  const agentFn = (skill, prompt, opts) =>
    rawAgentFn(skill, prompt, { model: MODEL_QUEUE, ...opts });

  // ─── Drift gate (O-19, FSPEC §6.2/§6.4, TSPEC §12.3/§12.4) ───────────────
  // Runs BEFORE the queue is even read, so a blocked drift state costs no queue
  // work. `readDriftStateSafely` is the O-19(d) wrapper: the injected read is
  // agent-mediated (rtReadFile, runtime-adapter.js:85-96), not a raw filesystem
  // call, and that seam never throws in production — it maps a missing/unreadable
  // file to `null` itself. The wrapper exists anyway (defence in depth, O-19(c)):
  // if some future/alternate read implementation DID throw, propagating that
  // exception here would abort the whole queue invocation instead of yielding a
  // `blocked` verdict, which is the wrong failure mode for something that must
  // fail closed onto row 1 (FSPEC §6.2 row 1 — "hook never ran").
  phaseFn("Queue: Drift gate");
  const driftRaw = await readDriftStateSafely(readFileFn, DRIFT_STATE_PATH);
  const driftGate = mapDriftState(validateDriftRecord(driftRaw));
  if (driftGate.outcome === "blocked") {
    emit(
      `Queue blocked by drift gate (row ${driftGate.row}): ${driftGate.reasons.join("; ")}`
    );
    return buildQueueReport({
      outcome: "blocked",
      reason: `Drift gate row ${driftGate.row}: ${driftGate.reasons.join("; ")}`,
      remaining: 0,
      driftReport: driftGate.report,
    });
  }

  // A PROCEEDING verdict is not necessarily a silent one. Row 9 is the trivial
  // all-clear (empty `reasons`, empty report) and says nothing; every other
  // proceeding row carries something the operator must still see:
  //   • row 2 — the checkEnabled:false opt-out. AC-4.1 row 2 is "proceed; skip
  //     noted in report", AC-4.3 is "skips state evaluation and notes the skip".
  //     A queue that ran a stale tree without saying so would be exactly the
  //     silent-degradation this feature exists to prevent.
  //   • row 8 — local-edit / unverified rows. AC-4.1 row 8 is "proceed, rows
  //     named in the run report".
  // Both obligations are on the RETURNED QueueReport (and the run log), not on
  // `mapDriftState`'s node output — so the notice is captured once here and
  // `finish` is the single funnel every remaining exit path in this pass returns
  // through, `runPicked`'s two included. Adding a new `return` below that calls
  // `buildQueueReport` directly would silently reopen this gap.
  const driftNotice = driftGate.row === 9 ? null : driftGate.report;
  if (driftNotice) {
    emit(
      `Drift gate proceeding (row ${driftGate.row}): ${driftGate.reasons.join("; ")}`
    );
  }
  const finish = (fields) => buildQueueReport({ ...fields, driftReport: driftNotice });

  // ─── Load queue ─────────────────────────────────────────────────────────
  phaseFn("Queue: Load");
  const queueText = await readFileFn(queuePath);
  if (queueText == null) {
    return finish({
      outcome: "no-queue",
      reason: `Queue file not found at ${queuePath}`,
      remaining: 0,
    });
  }

  const entries = parseQueue(queueText);
  const remainingPending = entries.filter((e) => e.status === "pending").length;

  // ─── Select candidate(s) ─────────────────────────────────────────────────
  phaseFn("Queue: Select");
  const selection = selectNextPending(entries);

  if (selection.kind === "blocked-active") {
    emit(
      `Queue blocked: "${selection.entry.feature}" is still in-progress. ` +
        `Resolve it (mark done/awaiting-merge or reset to pending) before new work is picked up.`
    );
    return finish({
      outcome: "blocked",
      reason: `An entry is in-progress: ${selection.entry.feature}`,
      remaining: remainingPending,
      active: selection.entry.feature,
    });
  }

  if (selection.kind === "empty") {
    emit(`Nothing to pick up — ${selection.reason}.`);
    return finish({
      outcome: "idle",
      reason: selection.reason,
      remaining: 0,
    });
  }

  // ─── Walk candidates in order; run readiness triage on each until one is ready ──
  phaseFn("Queue: Triage");
  const skipped = [];

  for (const entry of selection.candidates) {
    // REQ-gate: frontmatter must mark ready:true and contributes extra deps.
    const reqText = await readFileFn(entry.reqPath);
    if (reqText == null) {
      emit(`Skip "${entry.feature}": REQ not found at ${entry.reqPath}.`);
      skipped.push({ feature: entry.feature, reason: "REQ file missing" });
      continue;
    }

    const fm = parseReqFrontmatter(reqText);
    if (!fm.ready) {
      emit(`Skip "${entry.feature}": REQ not marked ready: true (still a draft).`);
      skipped.push({ feature: entry.feature, reason: "REQ not marked ready" });
      continue;
    }

    // Union of declared dependencies (QUEUE ∪ REQ frontmatter).
    const dependsOn = Array.from(
      new Set([...(entry.dependsOn || []), ...(fm.dependsOn || [])])
    );

    // Deterministic pre-check: if the queue already shows a dependency as not done,
    // it is definitely blocked — skip without spawning a (Sonnet) triage agent.
    const precheck = precheckDependencies(dependsOn, entries);
    if (precheck.blocked) {
      emit(`Skip "${entry.feature}": blocked (pre-check) — ${precheck.reason}.`);
      skipped.push({
        feature: entry.feature,
        reason: `blocked (pre-check): ${precheck.reason}`,
      });
      continue;
    }

    // Phase-0 readiness triage against the actual codebase.
    const triageResult = await agentFn(
      "se-author",
      triagePrompt(entry.feature, entry.reqPath, dependsOn)
    );
    const triage = parseTriageVerdict(triageResult);

    if (triage.verdict === "blocked") {
      emit(`Skip "${entry.feature}": blocked — ${triage.reason}.`);
      skipped.push({ feature: entry.feature, reason: `blocked: ${triage.reason}` });
      continue;
    }
    if (triage.verdict === "needs-human") {
      emit(
        `Skip "${entry.feature}": needs human decision — ${triage.reason}.`
      );
      skipped.push({
        feature: entry.feature,
        reason: `needs-human: ${triage.reason}`,
      });
      continue;
    }

    // ─── triage.verdict === "ready": run the pipeline for exactly this entry ──
    return runPicked({
      entry,
      dependsOn,
      triageReason: triage.reason,
      queuePath,
      queueText,
      remainingPending,
      skipped,
      runPipelineFn,
      writeFileFn,
      readFileFn,
      gitFn,
      // `queueText` is deliberately NOT passed: every status write now re-reads
      // at write time through `rewriteStatus`, so a pre-run snapshot would be
      // stale by construction (TSPEC §3.6).
      phaseFn,
      emit,
      finish,
    });
  }

  // No candidate became ready this pass.
  emit(`No ready REQ this pass (${skipped.length} candidate(s) skipped).`);
  return finish({
    outcome: "idle",
    reason: "no candidate passed the readiness gate",
    remaining: remainingPending,
    skipped,
  });
}

/**
 * Mark the picked entry in-progress, run the pipeline, then record the outcome.
 * Status transitions: pending → in-progress → awaiting-merge (success) | halted.
 * Note: success is `awaiting-merge`, NOT `done` — a human merges the PR and sets
 * `done`, which is the signal a dependent's Phase-0 triage looks for in the base.
 */
async function runPicked({
  entry,
  dependsOn,
  triageReason,
  queuePath,
  remainingPending,
  skipped,
  runPipelineFn,
  writeFileFn,
  readFileFn,
  gitFn,
  phaseFn,
  emit,
  // `main`'s exit funnel — carries the proceeding drift notice onto whichever
  // report this pass returns (see the `finish` comment in `main`). Injected
  // rather than recomputed so there is exactly one place that decides it.
  finish,
}) {
  phaseFn(`Pipeline: ${entry.feature}`);
  emit(
    `Picked "${entry.feature}" (deps: ${
      dependsOn.length ? dependsOn.join(", ") : "none"
    }) — ${triageReason}. Running orchestrate-dev.`
  );

  // Persist in-progress BEFORE running so a crash leaves a visible marker.
  // TSPEC §6.5 scopes the commit to *every* status write, not only `halted`:
  // `in-progress` and `awaiting-merge` become durable too, which is a strict
  // improvement and avoids a second, divergent code path.
  await rewriteStatus(
    queuePath,
    entry.feature,
    "in-progress",
    readFileFn,
    writeFileFn,
    gitFn
  );

  let report;
  try {
    report = await runPipelineFn({ reqPath: entry.reqPath });
  } catch (err) {
    await rewriteStatus(
      queuePath,
      entry.feature,
      "halted",
      readFileFn,
      writeFileFn,
      gitFn
    );
    return finish({
      outcome: "halted",
      reason: `Pipeline threw for ${entry.feature}: ${err && err.message}`,
      remaining: remainingPending - 1,
      picked: entry.feature,
    });
  }

  const succeeded = report && report.outcome === "success";
  // TSPEC §9.1 — `mergeStatus` rides the pipeline report Phase MERGE (A7/A8)
  // populates. Read defensively: a report without the field (an older bundle,
  // a throw-path stub) is `undefined`, which is not `"merged"`, so a missing
  // field falls back to today's `awaiting-merge` behaviour rather than a
  // wrongly-recorded `done` (fail-safe direction, FSPEC §7.5). `merged` can
  // only be true when `succeeded` is also true — Q-02's mutual exclusion.
  const merged = succeeded && report.mergeStatus === "merged";
  const newStatus = merged ? "done" : succeeded ? "awaiting-merge" : "halted";
  await rewriteStatus(
    queuePath,
    entry.feature,
    newStatus,
    readFileFn,
    writeFileFn,
    gitFn
  );

  emit(
    merged
      ? `"${entry.feature}" complete and merged (${report.mergeSha ?? "sha unknown"}) — status set to done.`
      : succeeded
      ? `"${entry.feature}" complete — status set to awaiting-merge. Merge the PR, then set it to done to unblock dependents.`
      : `"${entry.feature}" halted: ${report && report.haltReason}. Status set to halted.`
  );

  return finish({
    outcome: succeeded ? "ran" : "halted",
    reason: succeeded
      ? `Pipeline succeeded for ${entry.feature}`
      : `Pipeline halted for ${entry.feature}: ${report && report.haltReason}`,
    remaining: remainingPending - 1,
    picked: entry.feature,
    pipelineReport: report,
    skipped,
  });
}

/**
 * Re-read the queue (the pipeline may have touched it), set a feature's status,
 * and commit that one row (TSPEC §6.5).
 *
 * **Exported deliberately, and load-bearing** (TSPEC §3.6): the bundle can only
 * publish names the module exports (`stripModuleSyntax` rewrites `export
 * function` to `function`; `wrapModule` re-publishes only the names in its
 * `exportedNames` list), and `build-runtime.mjs`'s `_recordQueueRow` closure
 * has to reach this function through `__queue`.
 *
 * The re-read is not defensive padding: the pipeline that just ran may itself
 * have rewritten the queue, so a snapshot taken before the run is stale by
 * construction. Exactly one read, at write time.
 *
 * Never throws for a git failure — §6.5's "commit failure does not downgrade the
 * halt". The row is on disk either way; only its durability is at stake.
 *
 * @param {string} queuePath
 * @param {string} feature
 * @param {string} status
 * @param {function} readFileFn  - async (path) => string|null
 * @param {function} writeFileFn - async (path, contents) => void
 * @param {function} [gitFn]     - async (argv) => {ok, stdout, stderr}
 * @returns {Promise<{ queueRow: string, detail?: string }>}
 *   `queueRow` is drawn from `QUEUE_ROW_DISPOSITIONS`, TSPEC §4.7's / §8.2's
 *   closed catalogue: `"recorded" | "recorded (uncommitted)" | "none" |
 *   "error"`. The catalogue describes the *row disposition*, not the status
 *   written, so a recorded write reports `"recorded"` whatever `status` was.
 */
async function rewriteStatus(
  queuePath,
  feature,
  status,
  readFileFn,
  writeFileFn,
  gitFn = defaultGit,
  evidence = null
) {
  const current = await readFileFn(queuePath);

  // FSPEC §14.3 — no queue document at all. Reporting `"none"` (rather than an
  // error) is what stops a direct, queue-less invocation turning one failure
  // into two. No write, no git.
  if (current === null || current === undefined) {
    return { queueRow: "none" };
  }

  const { markdown, matched, written, foundStatus } = updateQueueStatus(
    current,
    feature,
    status,
    evidence
  );

  // FSPEC §13.5 — document present, row expected, row absent. Distinct from
  // "none": something removed the row mid-run, which the operator must see.
  // Write nothing and touch git not at all; a write here would clobber the
  // queue with an unchanged copy and hide the discrepancy.
  if (!matched) {
    return {
      queueRow: "error",
      detail:
        `no row for ${feature} in ${queuePath}; ` +
        `status "${status}" was not recorded`,
    };
  }

  // §2.5 / TSPEC §8.4c — evidence supplied, but the row's current status is
  // not one this write is allowed to overwrite. `updateQueueStatus` already
  // returned the file byte-unchanged; skip the write and the git commit
  // entirely, and name the status that blocked it.
  if (written === false) {
    return {
      queueRow: "recorded",
      detail: `row for ${feature} left unchanged: found status "${foundStatus}", not overwritable`,
    };
  }

  await writeFileFn(queuePath, markdown);
  return await commitQueueRow(queuePath, feature, status, gitFn);
}

/** `git`'s idempotence signal. Emitted on stdout by some versions, stderr by others. */
const NOTHING_TO_COMMIT_RE = /nothing to commit/i;

/** First line only — a multi-line hook rejection must not flood the report. */
function firstLine(text) {
  return String(text ?? "").split("\n")[0].trim();
}

/**
 * TSPEC §6.5 — exactly two `_git` invocations, in order:
 *
 *     git add    -- {queuePath}
 *     git commit -m "chore(queue): {feature} → {status}" -- {queuePath}
 *
 * Both are pathspec-scoped after `--`. `git commit -a` would sweep unrelated
 * working-tree changes into a queue-status commit, and a halted pipeline
 * routinely leaves a partially written document in the tree — that partial
 * progress is what the recovery path resumes from, so the tree is neither
 * cleaned nor treated as an error. No `push`: the halt must survive the
 * *process*, which a local commit achieves.
 *
 * @returns {Promise<{ queueRow: string, detail?: string }>}
 */
async function commitQueueRow(queuePath, feature, status, gitFn) {
  const added = await gitFn(["add", "--", queuePath]);
  if (!added.ok) return uncommitted(added, queuePath);

  const committed = await gitFn([
    "commit",
    "-m",
    `chore(queue): ${feature} → ${status}`,
    "--",
    queuePath,
  ]);
  if (committed.ok) return { queueRow: "recorded" };

  // E-39 — the row already read the target status and was already committed
  // (the common case on a re-entry). Idempotence, not a fault: no warning, and
  // nothing to narrate. `git` reports it on stdout or stderr depending on
  // version, so both are inspected.
  if (
    NOTHING_TO_COMMIT_RE.test(committed.stdout ?? "") ||
    NOTHING_TO_COMMIT_RE.test(committed.stderr ?? "")
  ) {
    return { queueRow: "recorded" };
  }

  return uncommitted(committed, queuePath);
}

/**
 * E-38 / FSPEC §13.4 — the row is correct on disk but git refused (hook
 * rejection, missing identity, index lock). Distinct from `"error"` because the
 * operator's remaining action differs: a manual commit, not a re-run.
 */
function uncommitted(result, queuePath) {
  const reason = firstLine(result && result.stderr);
  return {
    queueRow: "recorded (uncommitted)",
    detail:
      `queue row written but not committed` +
      (reason ? `: ${reason}` : "") +
      `; commit ${queuePath} manually`,
  };
}

// ─── Report builder ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} QueueReport
 * @property {"ran"|"halted"|"idle"|"blocked"|"no-queue"} outcome
 * @property {string} reason
 * @property {number} remaining        - pending entries left after this pass
 * @property {string} [picked]         - feature run this pass (if any)
 * @property {string} [active]         - in-progress feature blocking pickup (if any)
 * @property {object} [pipelineReport] - the orchestrate-dev FinalReport (if a pipeline ran)
 * @property {Array}  [skipped]        - candidates skipped this pass with reasons
 * @property {{manifest:string[], row:string[], run:string[]}} [driftReport] - the drift gate's
 *   Manifest/Row/Run reasons (FSPEC §6.3). Present whenever the gate had something to say —
 *   on a `blocked` verdict, and on a proceeding verdict at any row other than 9's all-clear
 *   (AC-4.1 rows 2 and 8, AC-4.3). Absent exactly when the gate was silent.
 */
function buildQueueReport({
  outcome,
  reason,
  remaining,
  picked,
  active,
  pipelineReport,
  skipped,
  driftReport,
}) {
  return {
    outcome,
    reason,
    remaining: typeof remaining === "number" ? Math.max(0, remaining) : 0,
    ...(picked ? { picked } : {}),
    ...(active ? { active } : {}),
    ...(pipelineReport ? { pipelineReport } : {}),
    ...(skipped && skipped.length ? { skipped } : {}),
    ...(driftReport ? { driftReport } : {}),
  };
}

// ─── DRIFT-01: validateDriftRecord (TSPEC §12.1, FSPEC §1.3 / §6.2 row 1) ────
//
// Shape validator for the single injected read of `.claude/workflows/.pdlc-drift-state.json`
// (FSPEC §6.1). Pure — no filesystem, no model calls. Defence in depth only: the hook is the
// primary drift detector; this validator exists to fail closed (⇒ `blocked`) on any relay that
// is not byte-faithful to what the writer produced, since the read is LLM-mediated (an agent
// turn), not a raw filesystem read (§6.1). It does not, and cannot, detect a relay that mangles
// a *value* while staying inside that value's closed set (§6.1's stated residual) — only shapes.
//
// Clause order is significant: clauses are checked D1 → D8 and the FIRST failing clause is
// reported, matching FSPEC §6.2's row-1 predicate table and TSPEC §12.1's one-clause-per-row
// fixtures. `mapDriftState` (T-12) consumes this function's `{ok, record}` / `{ok, clause}`
// result as its own row 1; the mapping/report/gate-wiring layers are out of this task's scope.

const DRIFT_CLOSED_ROW_STATES = ["in-sync", "missing", "stale", "local-edit", "unverified", "unknown"];

const DRIFT_CLOSED_ROW_REASONS = [
  "hash-tool-absent",
  "plugin-artifact-missing",
  "plugin-artifact-unreadable",
  "consumer-artifact-unreadable",
];

// §2.8's declared precedence order is irrelevant here — D4 only needs closed-set membership,
// not ranking.
const DRIFT_CLOSED_BASELINE_REASONS = [
  "drift-state-invalidated",
  "manifest-empty",
  "json-tool-absent",
  "manifest-malformed",
  "manifest-absent",
  "repo-root-unresolved",
  "plugin-root-unreadable",
  "plugin-root-unset",
];

const DRIFT_CLOSED_GENERATED_BY = ["hook", "check", "sync"];

function isDriftPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// D3 — schemaVersion present, integer 1.
function failsD3(record) {
  return !(typeof record.schemaVersion === "number" && Number.isInteger(record.schemaVersion) && record.schemaVersion === 1);
}

// D4 — baselineStatus one of "resolved" | "unresolved"; baselineReason present and either
// null or one of the eight closed baseline reasons (FSPEC §6.2's literal clause text, TSPEC
// §12.1 row 6/7). Note (T-12): this clause does NOT correlate baselineReason's null-ness with
// baselineStatus — a "resolved" record carrying a closed baseline reason (e.g.
// "drift-state-invalidated") is shape-valid under D4. §2.8/§4.4 describe what real writers
// produce (baselineStatus:"unresolved" alongside "drift-state-invalidated"), but that is a
// writer-side invariant, not a reader-side shape constraint — §6.2's row 3 precedence fixture
// (TSPEC §12.2) is exactly a shape-valid "resolved" record carrying that reason, and mapDriftState
// must still be able to reach it.
function failsD4(record) {
  if (record.baselineStatus !== "resolved" && record.baselineStatus !== "unresolved") {
    return true;
  }
  return record.baselineReason !== null && !DRIFT_CLOSED_BASELINE_REASONS.includes(record.baselineReason);
}

// D5 — checkEnabled present boolean (not the string "false", not absent).
function failsD5(record) {
  return typeof record.checkEnabled !== "boolean";
}

// D6 — rows, retiredPresent, writeFailures all present arrays.
function failsD6(record) {
  return (
    !Array.isArray(record.rows) ||
    !Array.isArray(record.retiredPresent) ||
    !Array.isArray(record.writeFailures)
  );
}

// D7 — every member of rows / retiredPresent / writeFailures is shape-valid. Only called once
// D6 has already confirmed all three are arrays.
function failsD7(record) {
  const rowsOk = record.rows.every(
    (row) =>
      isDriftPlainObject(row) &&
      typeof row.id === "string" &&
      row.id.length > 0 &&
      DRIFT_CLOSED_ROW_STATES.includes(row.state) &&
      (row.reason === null || DRIFT_CLOSED_ROW_REASONS.includes(row.reason))
  );
  if (!rowsOk) return true;

  const retiredOk = record.retiredPresent.every(
    (entry) =>
      isDriftPlainObject(entry) &&
      typeof entry.path === "string" &&
      entry.path.length > 0 &&
      typeof entry.supersededBy === "string" &&
      entry.supersededBy.length > 0 &&
      DRIFT_CLOSED_ROW_STATES.includes(entry.supersedingState)
  );
  if (!retiredOk) return true;

  return !record.writeFailures.every(
    (failure) =>
      isDriftPlainObject(failure) &&
      typeof failure.path === "string" &&
      typeof failure.operation === "string"
  );
}

// D8 — generatedBy closed-set; pluginVersion null-or-string; syncCommand, if present,
// null-or-string. Absence of syncCommand is the one thing D8 tolerates (FSPEC §1.3, SE F-16).
function failsD8(record) {
  if (!DRIFT_CLOSED_GENERATED_BY.includes(record.generatedBy)) return true;
  if (!(record.pluginVersion === null || typeof record.pluginVersion === "string")) return true;
  if ("syncCommand" in record) {
    if (!(record.syncCommand === null || typeof record.syncCommand === "string")) return true;
  }
  return false;
}

const DRIFT_CLAUSE_CHECKS = [
  ["D3", failsD3],
  ["D4", failsD4],
  ["D5", failsD5],
  ["D6", failsD6],
  ["D7", failsD7],
  ["D8", failsD8],
];

// Runs D3–D8 against a parsed top-level object, in order, returning the first failing clause
// id or `null` when every clause is satisfied. Shared by the top-level validation and by the
// single-level envelope check below (TSPEC §12.1 row 4).
function firstFailingDriftClause(record) {
  for (const [clauseId, fails] of DRIFT_CLAUSE_CHECKS) {
    if (fails(record)) return clauseId;
  }
  return null;
}

/**
 * Validate the shape of a drift-state record as relayed by the injected read (FSPEC §6.1,
 * §6.2 row 1; TSPEC §12.1). `value` is whatever the injected read returned — the caller is
 * responsible for normalising a throw to `null` (O-19(d)); this function only judges shape.
 *
 * @param {unknown} value
 * @returns {{ok:true, record:object} | {ok:false, clause:"D1"|"D2"|"D3"|"D4"|"D5"|"D6"|"D7"|"D8"}}
 */
function validateDriftRecord(value) {
  // D1 — a usable value. In production this is always a string (or `null`, per §6.1) because the
  // seam is a raw, LLM-mediated file read; some callers validate an already-parsed record object
  // obtained by other means (e.g. AT-24's end-to-end fresh-clone assertion, which reads the
  // written drift-state JSON directly off disk), so a plain object is accepted here too and
  // treated as already having passed D2's JSON-parse step. Anything else (`null`, an array, a
  // scalar) is D1.
  let parsed;
  if (typeof value === "string") {
    // D2 — parses as JSON, and the top level is an object (not an array or a scalar).
    try {
      parsed = JSON.parse(value);
    } catch {
      return { ok: false, clause: "D2" };
    }
  } else if (isDriftPlainObject(value)) {
    parsed = value;
  } else {
    return { ok: false, clause: "D1" };
  }

  if (!isDriftPlainObject(parsed)) {
    return { ok: false, clause: "D2" };
  }

  // D2's single-level known-envelope check (TSPEC §12.1 row 4, v2.1 TE Q-02): a top-level
  // object with exactly one key, "result", whose value is ITSELF fully shape-valid, is a
  // mangled relay (re-wrapped), not a record to unwrap. This check goes exactly one level
  // deep — it does not recurse the inner value through this same envelope check again — so
  // `{"result": 42}` is judged on its own top-level shape (⇒ D3, schemaVersion missing) rather
  // than being treated as an envelope, because 42 is not itself shape-valid.
  const keys = Object.keys(parsed);
  if (
    keys.length === 1 &&
    keys[0] === "result" &&
    isDriftPlainObject(parsed.result) &&
    firstFailingDriftClause(parsed.result) === null
  ) {
    return { ok: false, clause: "D2" };
  }

  const clause = firstFailingDriftClause(parsed);
  if (clause) {
    return { ok: false, clause };
  }

  return {
    ok: true,
    record: {
      ...parsed,
      syncCommand: "syncCommand" in parsed ? parsed.syncCommand : null,
    },
  };
}

// ─── T-12: mapDriftState — the ten-row precedence mapping (AC-4.1, TSPEC §12.2) ─────────────
//
// A pure function of `validateDriftRecord`'s result (never of the raw injected read — the
// call site is O-19(d)'s job, T-13). Every branch below is ordered exactly as FSPEC §6.2's
// precedence table and each later branch's fixture is required (TSPEC §12.2) to "defeat" every
// row above it, so the ORDER of these checks is itself the spec, not an implementation detail.
//
// Report shape: the three reason sets (Manifest / Row / Run, FSPEC §6.3) are disjoint, so
// `report` is always `{ manifest: string[], row: string[], run: string[] }` — never a flat
// list — because a flat list would let a Row-level reason print under Manifest with nothing
// to catch it (TSPEC §12.2, rows 3/4/7's structural assertions).

function emptyReport() {
  return { manifest: [], row: [], run: [] };
}

function gate(outcome, row, reasons, report) {
  return { outcome, row, reasons, report };
}

/**
 * Map a `validateDriftRecord` result to the queue's gate verdict (FSPEC §6.2, TSPEC §12.2).
 *
 * @param {{ok:true, record:object} | {ok:false, clause:string} | null | undefined} validated
 * @returns {{outcome:"blocked"|"proceed", row:number, reasons:string[], report:{manifest:string[], row:string[], run:string[]}}}
 */
function mapDriftState(validated) {
  // Row 1 — the read did not yield a shape-valid record (FSPEC §6.2 row 1; D1-D8 upstream).
  // This is the mapping's own fail-closed floor: every one of validateDriftRecord's negative
  // clauses (D1-D8) lands here, undifferentiated, because none of rows 2-10 below can be
  // trusted to mean what they say once the shape itself is unverified.
  if (!validated || validated.ok !== true) {
    const clause = validated && typeof validated.clause === "string" ? validated.clause : "D1";
    const reasons = [`drift state did not yield a usable record (${clause})`];
    return gate("blocked", 1, reasons, { manifest: reasons, row: [], run: [] });
  }

  const record = validated.record;

  // Row 2 — checkEnabled:false is the operator's opt-out. It sits above every row below EXCEPT
  // row 1 (FSPEC §6.2's "three further design points") — so it must be checked before rows
  // 3-10, deliberately even when the record also carries their conditions (TSPEC §12.2 row 2).
  if (record.checkEnabled === false) {
    const reasons = ["checkEnabled is false — drift check skipped by operator opt-out (AC-4.3)"];
    return gate("proceed", 2, reasons, { manifest: reasons, row: [], run: [] });
  }

  // Row 3 — a non-empty writeFailures blocks even with checkEnabled:true (AT-31(a)). Named at
  // Run level, one line per entry; `drift-state-invalidated`, when carried, renders at Manifest
  // level (FSPEC §6.3 — "drift-state-invalidated's rendering site is the Manifest-level line").
  if (Array.isArray(record.writeFailures) && record.writeFailures.length > 0) {
    const run = record.writeFailures.map(
      (failure) => `write failure: ${failure.path} (${failure.operation})`
    );
    const manifest =
      record.baselineReason === "drift-state-invalidated" ? ["drift-state-invalidated"] : [];
    return gate("blocked", 3, [...manifest, ...run], { manifest, row: [], run });
  }

  // Row 4 — baselineStatus:"unresolved" blocks once writeFailures is empty (defeats row 3).
  // Named at Manifest level only.
  if (record.baselineStatus === "unresolved") {
    const manifest = [String(record.baselineReason)];
    return gate("blocked", 4, manifest, { manifest, row: [], run: [] });
  }

  // Row 5 — any row "unknown" blocks, ordered above a co-occurring stale row (defeats row 6).
  if (record.rows.some((row) => row.state === "unknown")) {
    const row = record.rows
      .filter((r) => r.state === "unknown")
      .map((r) => `${r.id}: unknown${r.reason ? ` (${r.reason})` : ""}`);
    return gate("blocked", 5, row, { manifest: [], row, run: [] });
  }

  // Row 6 — any row "missing" or "stale" blocks, ordered above a co-occurring retired path
  // (defeats row 7).
  if (record.rows.some((row) => row.state === "missing" || row.state === "stale")) {
    const row = record.rows
      .filter((r) => r.state === "missing" || r.state === "stale")
      .map((r) => `${r.id}: ${r.state}`);
    return gate("blocked", 6, row, { manifest: [], row, run: [] });
  }

  // Row 7 — retiredPresent non-empty blocks even with every row in-sync (AT-31(b)). Named at
  // Row level, never Manifest level (a flat list would hide it there — TSPEC §12.2).
  if (Array.isArray(record.retiredPresent) && record.retiredPresent.length > 0) {
    const row = record.retiredPresent.map((entry) => `retired artifact present: ${entry.path}`);
    return gate("blocked", 7, row, { manifest: [], row, run: [] });
  }

  // Row 8 — local-edit / unverified rows proceed, named in the run report (FSPEC §6.2 row 8's
  // literal text: "rows named in the run report").
  if (record.rows.some((row) => row.state === "local-edit" || row.state === "unverified")) {
    const run = record.rows
      .filter((r) => r.state === "local-edit" || r.state === "unverified")
      .map((r) => `${r.id}: ${r.state}`);
    return gate("proceed", 8, run, { manifest: [], row: [], run });
  }

  // Row 9 — resolved, non-empty rows, all in-sync, both arrays empty ⇒ proceed silently.
  if (
    record.baselineStatus === "resolved" &&
    record.rows.length > 0 &&
    record.rows.every((row) => row.state === "in-sync") &&
    record.retiredPresent.length === 0 &&
    record.writeFailures.length === 0
  ) {
    return gate("proceed", 9, [], emptyReport());
  }

  // Row 10 — the terminal row: shape-valid but matches no row 1-9 (FSPEC §6.2's totality
  // argument — e.g. `resolved` with `rows: []`, which row 9 explicitly excludes).
  const reasons = ["drift state does not describe a recognised outcome"];
  return gate("blocked", 10, reasons, { manifest: reasons, row: [], run: [] });
}

// ─── T-13: readDriftStateSafely — the O-19(d) wrapper (TSPEC §12.3) ─────────
//
// O-19(c): the injected read this wraps (`_readFile`, production: `rtReadFile`,
// runtime-adapter.js:85-96) is LLM-mediated — an agent turn that reads a file and
// relays its contents as the agent's final message — not a raw filesystem call.
// `rtReadFile` itself never throws today: it maps "file absent / unreadable" to a
// returned `null`, the same as this module's own `defaultReadFile`. This wrapper's
// `try`/`catch` is therefore defence in depth (O-19(d)), not dead code covering an
// impossible path: it is what stands between a hypothetical throwing read (a
// transport failure some other future/alternate injected implementation surfaces
// as an exception rather than a `null`) and an *aborted* queue invocation. Without
// it, that throw would propagate out of `main` entirely instead of mapping to
// `mapDriftState`'s row 1 `blocked` verdict with a returned report — the fail-closed
// behavior FSPEC §6.2 row 1 ("hook never ran") requires. The call site (`main`,
// below) `await`s this — per CLAUDE.md's runtime rule, every injected IO call must
// be awaited because the runtime adapter's implementations are async.
//
// @param {function} readFileFn - async (path) => string|null (or throws)
// @param {string} path - DRIFT_STATE_PATH
// @returns {Promise<unknown>} the raw read result, or `null` on any throw
async function readDriftStateSafely(readFileFn, path) {
  try {
    return await readFileFn(path);
  } catch {
    return null;
  }
}

return { main, meta, DEFAULT_QUEUE_PATH, rewriteStatus, updateQueueStatus };
})();


// ─── Entrypoint ───────────────────────────────────────────────────────────────
const __reqPath =
  typeof args === "string" && args.trim()
    ? args.trim()
    : args && typeof args === "object" && args.reqPath
      ? args.reqPath
      : null;

// §7.2 edit 1 — the operator's phase override has no other channel into the bundle.
const __forcePhases =
  args && typeof args === "object" && args.forcePhases ? args.forcePhases : null;

if (!__reqPath) {
  return { outcome: "halted", haltReason: "No reqPath supplied — pass the REQ path as args." };
}

return await __dev.main({
  reqPath: __reqPath,
  forcePhases: __forcePhases,
  ...rtDevInjections(__dev),
  // §7.2 edits 3 + 4 — a direct dev invocation still owns its queue row, so it
  // closes over __queue's row helpers at the default queue path. Absent this,
  // the seam falls back to defaultRecordQueueRow's queueRow "none" no-op.
  _recordQueueRow: async ({ feature, status }) =>
    __queue.rewriteStatus(
      __queue.DEFAULT_QUEUE_PATH,
      feature,
      status,
      rtReadFile,
      rtWriteFile,
      rtGit
    ),
});
