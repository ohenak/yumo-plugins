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
  // Dispatched as an exact shell command — the same "run this exact command"
  // shape rtCheckFile/rtListFiles/rtCheckCi use — rather than a "write these
  // bytes" instruction. The command IS the whole intent, visible and mechanical:
  // a quoted heredoc that adds `text` after the file's existing bytes and touches
  // nothing already there (so this is NOT rtWriteFile(existing + text), which
  // would re-emit and could silently rewrite the reviewer's prose). `text`
  // carries its own trailing newline; the heredoc re-supplies exactly one, so a
  // single trailing newline is stripped before the body to keep the bytes exact.
  const body = text.endsWith("\n") ? text.slice(0, -1) : text;
  await RT.agent(
    `Run this exact command from the repository root and report the result. It ` +
      `records the review's approval provenance — the content hash and reviewed ` +
      `commit — by appending these lines to the end of "${path}"; a quoted heredoc, ` +
      `so it changes nothing already in the file.\n` +
      `  cat >> "${path}" <<'PDLC_ANCHOR_EOF'\n${body}\nPDLC_ANCHOR_EOF\n` +
      `Reply with "ok" when the command has run.`,
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
 * Each argv element rides through `rtShellQuote`: the command the prompt
 * writes must be valid shell AS WRITTEN, because the executing agent
 * sometimes runs it verbatim and sometimes re-quotes it — an unquoted commit
 * message (spaces, parens, backticks) is a coin flip between a clean run, a
 * zsh glob error and command substitution.
 */
async function rtGit(argv) {
  const args = Array.isArray(argv) ? argv : [];
  const out = await RT.agent(
    `Run exactly this command from the repository root, and nothing else:\n` +
      `  git ${args.map(rtShellQuote).join(" ")}\n` +
      `If it exits 0, return exactly: {"ok":true,"stdout":"<its stdout>","stderr":""}\n` +
      `If it exits non-zero, return exactly: {"ok":false,"stdout":"","stderr":"<the LAST 300 characters of its combined output>"}\n` +
      `Return ONLY that JSON object, correctly escaped — no commentary, no code fences. ` +
      `Do not retry, do not repair, and do not run any other command.`,
    { label: `git:${args[0] || ""}`, model: RT_IO_MODEL }
  );
  return rtParseTransportReply(out);
}

/**
 * Map a transport agent's reply text to the { ok, stdout, stderr } contract.
 * The prompt forbids fences and commentary, but the transcribing model
 * sometimes adds them anyway — six consecutive fenced replies halted a run —
 * so the parser extracts the outermost `{...}` span before parsing rather
 * than demanding a bare object. Anything without a parseable object span is
 * still the fixed "unparseable adapter response" failure.
 */
function rtParseTransportReply(out) {
  const text = String(out ?? "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(text.slice(start, end + 1));
      return {
        ok: parsed && parsed.ok === true,
        stdout: typeof (parsed && parsed.stdout) === "string" ? parsed.stdout : "",
        stderr: typeof (parsed && parsed.stderr) === "string" ? parsed.stderr : "",
      };
    } catch {
      // fall through to the fixed failure below
    }
  }
  return { ok: false, stdout: "", stderr: "unparseable adapter response" };
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
      `If it exits non-zero, return exactly: {"ok":false,"stdout":"","stderr":"<the LAST 300 characters of its stderr>"}\n` +
      `Return ONLY that JSON object, correctly escaped — no commentary, no code fences.\n` +
      `This command may change repository state. Issue it AT MOST ONCE. ` +
      `Do not retry, do not repair, and do not run any other command.`,
    { label: `gh:${command.slice(0, 40)}`, model: RT_IO_MODEL }
  );
  return rtParseTransportReply(out);
}

// ─── PROPOSAL §3.3 / M-6 — the command transport Phase I gates through ────────
//
// The trailer token and its two legal values. A trailer rather than JSON: the
// reply carries a raw output tail, and a test runner's output is exactly the
// text that breaks hand-written JSON escaping (quotes, backslashes, ANSI, CRs).
const RT_CMD_TRAILER = "COMMAND_EXIT";
const RT_CMD_TRAILER_RE = /^COMMAND_EXIT:[ \t]*(0|nonzero)[ \t]*\r?$/gm;

/**
 * `_runCommand(command) => { ok, output }`. Runs ONE command string at the repo
 * root and classifies its exit status.
 *
 * Model: `RT_IO_MODEL_HARD` ("sonnet"), not the `RT_IO_MODEL` ("haiku") every
 * other transport here uses. Deliberate, and the one place in this file where
 * the cheap model is the wrong choice: this reply is the ONLY evidence the
 * pipeline has that a wave is green (M-6 — no agent's self-reported green is
 * load-bearing), and producing it means running a long command, waiting for it,
 * and transcribing a tail of its output verbatim beneath an exact trailer. That
 * is the same long-output transcription task `rtReadChunk` escalates to sonnet
 * for, with a worse failure mode: a mis-parse here green-lights a red wave.
 *
 * FAIL-CLOSED, in both directions: no trailer, or MORE than one trailer (an
 * output tail that happens to contain the token), yields `ok: false`. The
 * caller halts, which is the safe outcome for an unreadable gate.
 */
async function rtRunCommand(command) {
  const out = await RT.agent(
    `Run exactly this command from the repository root, and nothing else:\n` +
      `  ${command}\n` +
      `Wait for it to finish. Do not run it in the background, do not retry it, ` +
      `do not repair anything it reports, and do not run any other command.\n` +
      `Then reply with EXACTLY this, and nothing else:\n` +
      `- FIRST line: "${RT_CMD_TRAILER}: 0" if it exited 0, or "${RT_CMD_TRAILER}: nonzero" ` +
      `if it exited non-zero.\n` +
      `- Then the last 30 lines of its combined output, verbatim, one per line.\n` +
      `No commentary, no summary, no code fences. Emit the "${RT_CMD_TRAILER}:" token ` +
      `exactly once — if the output tail itself contains that token, drop those lines.`,
    { label: `run:${String(command).slice(0, 40)}`, model: RT_IO_MODEL_HARD }
  );

  const text = String(out == null ? "" : out);
  RT_CMD_TRAILER_RE.lastIndex = 0;
  const matches = text.match(RT_CMD_TRAILER_RE) || [];
  if (matches.length !== 1) return { ok: false, output: text };
  return { ok: /:[ \t]*0[ \t]*\r?$/.test(matches[0]), output: text };
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
    // PROPOSAL §3.3 / M-6. Module-side default is `null` (NO_RUN_COMMAND) —
    // "no command transport installed" — so wiring it here is what turns Phase
    // I's script-owned test gate on. Both bundles get it: DEV_ENTRY and
    // QUEUE_ENTRY both spread this one object.
    _runCommand: rtRunCommand,
    // The three probe seams. Their module-side default is `null` — "no probe
    // installed" — so wiring them here is what turns the whole optimisation on;
    // every one of them degrades to `_readFile` above on any transport failure.
    // TSPEC §7.1 (PLAN A-25) — the advisory tier's once-per-run config read,
    // composed on the module's own reader; main() hands it the injected
    // `_readFile`, so the transport is the adapter's in either case.
    _readAdvisoryConfig: devModule.readAdvisoryConfigSafely,
    _probeDoc: rtProbeDoc,
    _probeReviewState: rtProbeReviewState,
    _probePostmortem: rtProbePostmortem,
    // `_recordQueueRow` is deliberately ABSENT: its implementation differs by
    // caller, which a caller-independent adapter bundle cannot express. It is
    // supplied per entrypoint by build-runtime.mjs (§3.10, §7.2 edit 2b).
  };
}
