// ⚠️  GENERATED FILE — DO NOT EDIT.
// Built by `node pdlc/workflows/build-runtime.mjs` from:
//   pdlc/workflows/runtime-adapter.js
//   pdlc/workflows/orchestrate-dev.js
//   pdlc/workflows/orchestrate-queue.js
// Edit those, then rebuild. See pdlc/workflows/build-runtime.mjs for why this
// bundle exists (the workflow runtime allows no imports, exports past meta, or fs).
export const meta = {
  name: "orchestrate-dev",
  description:
    "Full PDLC pipeline for one REQ — spec authoring, reviews, TDD implementation, DoD, harvest, PR.",
  whenToUse: "Run the pipeline for a single named REQ path.",

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

    { title: "Phase MERGE", detail: "merge the PR + advance the queue row" },
  ],
};

const RT = {
  agent,
  parallel,
  pipeline,
  phase,
  log,
};

const RT_IO_MODEL = "haiku";

const RT_MISSING = "__PDLC_FILE_MISSING__";

function rtSkillPrompt(skill, prompt) {
  return (
    `You are the "${skill}" agent in the PDLC pipeline.\n` +
    `Before doing anything else, invoke the Skill tool with skill "pdlc:${skill}" ` +
    `and follow its instructions exactly for the task below.\n\n` +
    `Task:\n${prompt}`
  );
}

async function rtAgent(skill, prompt, opts = {}) {
  const { model, label, ...rest } = opts || {};
  return await RT.agent(rtSkillPrompt(skill, prompt), {
    label: label || skill,
    ...(model ? { model } : {}),
    ...rest,
  });
}

async function rtParallel(promises) {
  return await Promise.all(promises);
}

async function rtPipeline(label, fn) {
  return await fn();
}

function rtPhase(label) {
  RT.phase(label);
}

function rtLog(message) {
  RT.log(String(message));
}

const RT_READ_CHUNK = 6000;

const RT_READ_RETRIES = 3;

const RT_READ_CACHE_MAX_BYTES = 2097152;

const RT_HEX64_RE = /\b[0-9a-f]{64}\b/;
const RT_CHUNK_BEGIN = "__PDLC_CHUNK_BEGIN__";
const RT_CHUNK_END = "__PDLC_CHUNK_END__";

const RT_CHUNK_EOF = "__PDLC_CHUNK_EOF__";

const RT_CHUNK_BOF = "__PDLC_CHUNK_BOF__";

const RT_READ_ESCALATE_AFTER = 2;
const RT_IO_MODEL_HARD = "sonnet";

const RT_READ_MAX_DEPTH = 8;

const RT_SHA_CMD = '{ shasum -a 256 2>/dev/null || sha256sum; } | head -1';

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

function rtLinePlan(totalLines, perChunk) {
  const plan = [];
  for (let first = 1; first <= totalLines; first += perChunk) {
    plan.push({ first, last: Math.min(first + perChunk - 1, totalLines) });
  }
  return plan;
}

async function rtReadChunk(path, range, index) {
  let sawTruncation = false;
  for (let attempt = 0; attempt <= RT_READ_RETRIES; attempt++) {
    const model = attempt < RT_READ_ESCALATE_AFTER ? RT_IO_MODEL : RT_IO_MODEL_HARD;

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
      continue; 
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

const rtReadCache = {};
let rtReadCacheSeq = 0;
let rtReadCacheBytes = 0;

const rtCacheKey = (path) => `p:${path}`;

function rtCacheGet(path) {
  const key = rtCacheKey(path);
  return Object.prototype.hasOwnProperty.call(rtReadCache, key) ? rtReadCache[key] : null;
}

function rtCacheInvalidate(path) {
  const key = rtCacheKey(path);
  if (!Object.prototype.hasOwnProperty.call(rtReadCache, key)) return false;
  rtReadCacheBytes -= rtReadCache[key].size;
  delete rtReadCache[key];
  return true;
}

function rtCacheOldestKey() {
  let oldest = null;
  for (const key of Object.keys(rtReadCache)) {
    if (oldest === null || rtReadCache[key].seq < rtReadCache[oldest].seq) oldest = key;
  }
  return oldest;
}

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

const rtChunkCount = (size) => Math.max(1, Math.ceil(size / RT_READ_CHUNK));

async function rtReadFile(path) {
  const cached = rtCacheGet(path);
  let probe;
  try {
    probe = await rtReadProbe(path);
  } catch (err) {

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

  if (cached) rtCacheInvalidate(path);

  const displayLines = probe.newlines + (probe.endsWithNewline ? 0 : 1);
  const chunkCount = rtChunkCount(probe.size);
  const perChunk = Math.max(1, Math.ceil(displayLines / chunkCount));
  const plan = rtLinePlan(displayLines, perChunk);

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

    rtCachePut(path, verified, verifiedBy.size, verifiedBy.sha);
    return verified;
  }
  throw new Error(`rtReadFile: "${path}" reassembled but did not match the file's size and SHA-256`);
}

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
      continue; 
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

const RT_CLI_PATH = ".claude/workflows/pdlc-cli.mjs";
const RT_CLI_DIGEST_RE = /^DIGEST: sha256:([0-9a-f]{64})$/;

function rtShellQuote(arg) {
  return `'${String(arg).split("'").join("'\\''")}'`;
}

function rtCliCanonicalise(text) {
  return String(text === null || text === undefined ? "" : text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n*$/, "\n");
}

function rtExtractCliReply(reply) {
  if (typeof reply !== "string") return null;
  const lines = reply.split("\n");
  for (let i = lines.length - 1; i >= 1; i--) {
    const m = RT_CLI_DIGEST_RE.exec(lines[i].trim());
    if (m) return { digest: m[1], line: lines[i - 1] };
  }
  return null;
}

async function rtCliQuery(argv, label) {
  const command = `node ${RT_CLI_PATH} ${(argv || []).map(rtShellQuote).join(" ")}`;
  for (let attempt = 0; attempt <= RT_READ_RETRIES; attempt++) {

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
      continue; 
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

    }
  }
  rtLog(
    `pdlc-cli: no digest-verified reply for \`${command}\` after ${RT_READ_RETRIES + 1} ` +
      `attempts — falling back to the byte-taking read path`
  );
  return null;
}

async function rtProbeDoc(path, docType) {
  if (!path || typeof path !== "string") return null;
  const argv = ["doc-probe", path];
  if (docType) argv.push(docType);
  return await rtCliQuery(argv, `probe:doc:${path}`);
}

async function rtProbeReviewState(arg) {
  const { feature, docType } = arg || {};
  if (!feature || !docType) return null;
  return await rtCliQuery(["review-state", feature, docType], `probe:review-state:${feature}`);
}

async function rtProbePostmortem(arg) {
  const { phase, feature } = arg || {};
  if (!phase || !feature) return null;
  return await rtCliQuery(["postmortem", phase, feature], `probe:postmortem:${phase}:${feature}`);
}

async function rtWriteFile(path, contents) {
  rtCacheInvalidate(path);
  await RT.agent(
    `Write the following content to "${path}", relative to the repository root or as an absolute path, ` +
      `replacing the file's current contents exactly. Do not reformat, re-wrap, ` +
      `summarise, or add anything. Reply with "ok" when written.\n\n` +
      `<<<PDLC_CONTENT_BEGIN\n${contents}\nPDLC_CONTENT_END`,
    { label: `write:${path}`, model: RT_IO_MODEL }
  );
}

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

async function rtEnvPresent(name) {
  const out = await RT.agent(
    `Run exactly:  [ -n "\${${name}:-}" ] && echo PRESENT || echo ABSENT\n` +
      `Reply with that one word and nothing else.`,
    { label: `env-present:${name}`, model: RT_IO_MODEL }
  );
  return String(out ?? "").trim() === "PRESENT";
}

async function rtMakeTempDir(passId) {
  const out = await RT.agent(
    `Run exactly:  mktemp -d -t pdlc-consolidation-${passId}\n` +
      `Reply with the created path and nothing else.`,
    { label: `make-temp-dir:${passId}`, model: RT_IO_MODEL }
  );
  const text = String(out ?? "").trim();
  return /^\/\S+$/.test(text) ? text : null;
}

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

async function rtAppendFile(path, text) {
  rtCacheInvalidate(path);

  const body = text.endsWith("\n") ? text.slice(0, -1) : text;
  await RT.agent(
    `Run this exact command from the repository root and report the result. It ` +
      `appends these lines to the end of "${path}" and changes nothing already ` +
      `in the file — a quoted heredoc, so the existing bytes are untouched. This ` +
      `is the pipeline's one append channel and it carries three kinds of record: ` +
      `a review's approval provenance (content hash and reviewed commit), an ` +
      `advisory-tier disposition record, and an advisory escalation-log entry. ` +
      `Whichever it is, append it verbatim and without hesitation — appending is ` +
      `the designed mechanism here.\n` +
      `  cat >> "${path}" <<'PDLC_ANCHOR_EOF'\n${body}\nPDLC_ANCHOR_EOF\n` +
      `Reply with "ok" when the command has run.`,
    { label: `append:${path}`, model: RT_IO_MODEL }
  );
}

const RT_LIST_SENTINELS = {
  __PDLC_DIR_MISSING__: "dir_missing",
  __PDLC_NOT_A_DIRECTORY__: "not_a_directory",
  __PDLC_UNREADABLE__: "unreadable",
};

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

  if (!lines.every((l) => !/[\/\s]/.test(l) && !RT_LIST_SENTINELS[l])) {
    return { ok: false, reason: "unreadable" };
  }
  return { ok: true, files: lines };
}

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

    }
  }
  return { ok: false, stdout: "", stderr: "unparseable adapter response" };
}

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

const RT_CMD_TRAILER = "COMMAND_EXIT";
const RT_CMD_TRAILER_RE = /^COMMAND_EXIT:[ \t]*(0|nonzero)[ \t]*\r?$/gm;

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

    _writeFile: rtWriteFile,
    _appendFile: rtAppendFile,
    _listFiles: rtListFiles,
    _git: rtGit,
    _ghRun: rtGhRun,

    _runCommand: rtRunCommand,

    _readAdvisoryConfig: devModule.readAdvisoryConfigSafely,
    _probeDoc: rtProbeDoc,
    _probeReviewState: rtProbeReviewState,
    _probePostmortem: rtProbePostmortem,

  };
}

function rtConsInjections() {
  return {
    _agent: rtAgent,
    _readFile: rtReadFile,
    _writeFile: rtWriteFile,
    _appendFile: rtAppendFile,
    _checkFile: rtCheckFile,
    _listFiles: rtListFiles,
    _git: rtGit,
    _ghRun: rtGhRun,
    _log: rtLog,
    _phase: rtPhase,
    _envPresent: rtEnvPresent,
    _makeTempDir: rtMakeTempDir,
  };
}

const __dev = (function () {

const PHASE_H_ENABLED = true; 

const PHASE_DOD_ENABLED = true; 

const DOD_MAX_ITERATIONS = 3;

const PHASE_PUB_ENABLED = true; 

const CI_NO_CHECKS_TIMEOUT_MS = 10 * 60 * 1000; 
const CI_POLL_INTERVAL_MS = 30 * 1000; 
const CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000; 

const PHASE_MERGE_ENABLED = true; 

const MERGE_CONFIG_PATH = ".claude/pdlc.config.json";

const MERGE_GUARD_DEFAULTS = Object.freeze([
  "pdlc/workflows/",
  "pdlc/skills/",
  "pdlc/hooks/",
  ".claude/workflows/",
]);

const MERGE_MODES = Object.freeze(["off", "gated", "on"]);
const MERGE_STATUSES = Object.freeze(["merged", "deferred", "refused", "skipped"]);

const MERGE_DEFAULTS = Object.freeze({
  mergeMode: "off",
  mergeRequiresCi: true,
  allowSquashMerge: false,
  deleteBranchOnPdlcMerge: true,
  mergeableRetries: 3,
  mergeableRetryDelay: 10,
  guardPaths: [],
});

const MERGE_FILES_PAGE_LIMIT = 100; 
const MERGE_THREAD_PAGE_LIMIT = 100; 
const MERGE_MAX_THREAD_PAGES = 10; 

const MERGE_MAX_RETRIES = 10;

const MERGE_MAX_DECISION_STEPS = 1 + MERGE_MAX_RETRIES + 4 + 3 + 1 + 5;

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

const IMPLEMENTATION_DEFAULTS = Object.freeze({
  testCommand: null,
  postWaveCommand: null,
  postWavePathspecs: Object.freeze([]),
  startWave: 1,
});

function parseImplementationConfig(text) {
  const degraded = (sectionMalformed) => ({
    config: IMPLEMENTATION_DEFAULTS,
    sectionMalformed,
    invalidKeys: [],
  });

  if (text == null) return degraded(false);

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return degraded(false);
  }

  if (!isPlainObject(parsed) || !("implementation" in parsed)) return degraded(false);

  const section = parsed.implementation;
  if (!isPlainObject(section)) return degraded(true);

  const invalidKeys = [];

  const nonEmptyString = (key) => {
    if (!(key in section)) return IMPLEMENTATION_DEFAULTS[key];
    const v = section[key];
    if (typeof v === "string" && v.trim() !== "") return v;
    invalidKeys.push(key);
    return IMPLEMENTATION_DEFAULTS[key];
  };

  let postWavePathspecs = IMPLEMENTATION_DEFAULTS.postWavePathspecs;
  if ("postWavePathspecs" in section) {
    const v = section.postWavePathspecs;
    if (Array.isArray(v) && v.every((p) => typeof p === "string" && p.trim() !== "")) {
      postWavePathspecs = v;
    } else {
      invalidKeys.push("postWavePathspecs");
    }
  }

  let startWave = IMPLEMENTATION_DEFAULTS.startWave;
  if ("startWave" in section) {
    const v = section.startWave;
    if (Number.isInteger(v) && v >= 1) {
      startWave = v;
    } else {
      invalidKeys.push("startWave");
    }
  }

  return {
    config: {
      testCommand: nonEmptyString("testCommand"),
      postWaveCommand: nonEmptyString("postWaveCommand"),
      postWavePathspecs,
      startWave,
    },
    sectionMalformed: false,
    invalidKeys,
  };
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

async function readMergeConfigSafely(readFileFn, path) {
  try {
    return await readFileFn(path);
  } catch {
    return null;
  }
}

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
    case "consolidationPrs":

      return `gh pr list --repo ${params.repo} --state all --limit 100 --search "PDLC-CONSOLIDATION-PASS in:body" --json url,state,body`;
    case "consolidationCreate":

      return `gh pr create --repo ${params.repo} --head ${params.head} --base ${params.base} --title ${params.title} --body-file ${params.bodyFile}`;
    default:
      throw new Error(`mergeCommandFor: unrecognised surface "${surface}"`);
  }
}

function parsePrRef(input) {
  if (typeof input !== "string") return null;
  const match = input.match(/^https?:\/\/[^/]+\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:[/?].*)?$/);
  if (!match) return null;
  const number = parseInt(match[3], 10);
  if (!Number.isInteger(number) || number <= 0) return null;
  return { owner: match[1], repo: match[2], number };
}

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

    }

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

async function defaultGhRun(command, { execFn } = {}) {
  const { execSync: realExecSync } = await Promise.reject(new Error("Node module " + "child_process" + " is unavailable in the workflow runtime; this seam must be injected"));
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

async function observePrState(prUrl, { _ghRun }) {
  const r = await _ghRun(mergeCommandFor("prState", { prUrl }));
  const raw = r && r.ok === true ? r.stdout : null;
  return classifyPrState(raw);
}

async function observeCi(prUrl, { _ghRun, _checkCi = checkPrCi }) {
  const r = await _ghRun(mergeCommandFor("ci", { prUrl }));
  const raw = r && r.ok === true ? r.stdout : "";
  return _checkCi(prUrl, { execFn: () => raw });
}

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

async function observeRepoCaps({ _ghRun }) {
  const r = await _ghRun(mergeCommandFor("repoCaps", {}));
  const raw = r && r.ok === true ? r.stdout : null;
  return classifyRepoCaps(raw);
}

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

function isNonEmptyString(v) {
  return typeof v === "string" && v.length > 0;
}

function effectiveGuardPaths(configured) {
  const extra = Array.isArray(configured) ? configured : [];
  const norm = (p) => (p.endsWith("/") ? p : `${p}/`);
  return [
    ...new Set([...MERGE_GUARD_DEFAULTS, ...extra.filter(isNonEmptyString).map(norm)]),
  ];
}

function guardVerdict(changed, guardPaths) {
  if (!changed || changed.ok !== true) {
    return { fired: true, kind: "unretrievable", matched: [] }; 
  }
  const matched = changed.files.filter((p) => guardPaths.some((g) => p.startsWith(g)));
  return { fired: matched.length > 0, kind: matched.length ? "match" : "clear", matched };
}

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

function mergeCandidates(caps, config) {
  const chain = [];
  if (caps && caps.rebase) chain.push("rebase");
  if (caps && caps.mergeCommit) chain.push("merge");
  if (config && config.allowSquashMerge === true && caps && caps.squash) chain.push("squash");
  return chain;
}

function decideMerge(record, config) {

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

  if (record.o1 === null) {
    return { kind: "need", observation: "O1" };
  }

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

  if (record.o5 === null) {
    return { kind: "need", observation: "O5" };
  }
  const guardPaths = effectiveGuardPaths(config.guardPaths);
  const verdict = guardVerdict(record.o5, guardPaths);

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

  if (record.ci === null) {
    return { kind: "need", observation: "O2" };
  }

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

  if (record.o1.mergeable === "UNKNOWN" && record.o1Count <= config.mergeableRetries) {
    return { kind: "need", observation: "O1", waitMs: config.mergeableRetryDelay * 1000 };
  }

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

  if (record.o3 === null) {
    return { kind: "need", observation: "O3" };
  }

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

  if (record.o4 === null) {
    return { kind: "need", observation: "O4" };
  }

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

function firstLine(text) {
  return String(text ?? "").split("\n")[0].trim();
}

function guardRefused(del) {
  return Boolean(
    del &&
      del.ok === false &&
      typeof del.stderr === "string" &&
      del.stderr.includes("pdlc guard: refusing to delete CROSS-REVIEW files")
  );
}

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

function evidenceCellFor(mergeSha, prNumber) {
  return typeof mergeSha === "string" && mergeSha.length >= 7
    ? `${mergeSha.slice(0, 7)} #${prNumber}`
    : `merged #${prNumber}`;
}

async function deleteRemoteBranch({ feature, _git }) {
  const branch = featureBranchName(feature);
  const result = await _git(["push", "origin", "--delete", branch]);
  if (result && result.ok === true) return { ok: true };
  const reason = firstLine(result && result.stderr) || "git push --delete failed";
  return { ok: false, reason };
}

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

  const status = await _git(["status", "--porcelain"]);
  if (!status || status.ok !== true || String(status.stdout ?? "").trim() !== "") {
    return await fail("working tree is dirty");
  }

  const fetch = await _git(["fetch", "origin", defaultBranch]);
  if (!fetch || fetch.ok !== true) {
    return await fail(`git fetch failed: ${firstLine(fetch && fetch.stderr)}`);
  }

  const revParse = await _git([
    "rev-parse",
    "--verify",
    "--quiet",
    `refs/heads/${defaultBranch}`,
  ]);
  const branchExists = !!(revParse && revParse.ok === true);

  const checkout = branchExists
    ? await _git(["checkout", defaultBranch])
    : await _git(["checkout", "-B", defaultBranch, "FETCH_HEAD"]);
  if (!checkout || checkout.ok !== true) {
    return await fail(`checkout failed: ${firstLine(checkout && checkout.stderr)}`);
  }

  if (branchExists) {
    const rebase = await _git(["rebase", "--empty=drop", "FETCH_HEAD"]);
    if (!rebase || rebase.ok !== true) {
      await _git(["rebase", "--abort"]); 
      return await fail(
        `replay of local queue-row commits onto ${defaultBranch} conflicted: ` +
          firstLine(rebase && rebase.stderr),
      );
    }
  }

  const ancestor = await _git(["merge-base", "--is-ancestor", mergeSha ?? "FETCH_HEAD", "HEAD"]);
  if (!ancestor || ancestor.ok !== true) {
    return await fail("merge commit is not an ancestor of HEAD after update");
  }

  return { ok: true, branch: defaultBranch };
}

const MERGE_NOTES = Object.freeze({

  aheadOfRemote: (defaultBranch, feature) =>
    `Local ${defaultBranch} is ahead of its remote by the queue-row commit for ${feature}; ` +
    `pdlc does not push it — it reaches the remote with the next feature's PR.`,

  mergeDeferred: (feature, reason) =>
    `Merge deferred for ${feature}: ${reason}. The queue row is unchanged; merge the PR to advance it.`,

  sectionMalformed: () =>
    `.claude/pdlc.config.json's "merge" section is present but not an object; every merge setting is using its default.`,

  noPrNumber: (feature, prUrl) =>
    `Queue row for ${feature} was not updated: no PR number could be resolved from ${prUrl}.`,

  recordedUncommitted: (feature, detail) => `Queue row for ${feature}: ${detail}`,

  nonOverwrite: (feature, detail) => `Queue row for ${feature}: ${detail}`,

  branchDeleteFailed: (feature, reason) =>
    `Remote branch deletion failed for ${feature}: ${reason}`,
});

const MERGE_ESCALATIONS = Object.freeze({
  guard: ({ prUrl, tail }) => `MERGE ESCALATION: self-modification guard fired for ${prUrl} — ${tail}`,
  ci: ({ prUrl }) =>
    `MERGE ESCALATION: CI evidence absent for ${prUrl} — no checks reported and mergeRequiresCi is true`,
  queue: ({ prUrl, shortSha, feature, detail }) =>
    `MERGE ESCALATION: merged ${prUrl} (${shortSha}) but the queue row for ${feature} was not updated — ${detail}`,
  tree: ({ prUrl, reason, branch }) =>
    `MERGE ESCALATION: working tree not updated after merging ${prUrl} — ${reason}; tree is on ${branch}`,
});

const ADVISORY_ESCALATIONS = Object.freeze({
  seam: ({ seam, feature, reason }) =>
    `ADVISORY ESCALATION: seam ${seam} for ${feature} — ${reason}; see docs/_queue/ESCALATIONS.md`,
});

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

  if (!_enabled) return skippedOutcome(1, "Phase MERGE disabled");

  const notes = [];

  try {
    let config = configOverride;
    if (!config) {

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

    const defaultBranch = Object.prototype.hasOwnProperty.call(d, "defaultBranch")
      ? d.defaultBranch
      : record.o4 && record.o4.ok
        ? record.o4.defaultBranch
        : null;

    if (config.deleteBranchOnPdlcMerge) {
      const del = await deleteRemoteBranch({ feature, _git });
      if (!del.ok) notes.push(MERGE_NOTES.branchDeleteFailed(feature, del.reason));
    }

    const tree = await updateDefaultBranch({ defaultBranch, mergeSha: d.mergeSha, _git });

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

        if (tree.ok && defaultBranch && !(rec && rec.detail)) {
          notes.push(MERGE_NOTES.aheadOfRemote(defaultBranch, feature));
        }
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

    return {
      mergeStatus: "refused",
      mergeSha: null,
      mergeMethod: null,
      row: "internal",
      reason: err && err.message ? err.message : "phaseMerge failed unexpectedly",
      escalations: [],
      notes,
      queueRow: null,
    };
  }
}

const MODEL_DEFAULT = "opus"; 

const MAX_REVIEW_ROUNDS = 5;

const MAX_AUTHORING_ATTEMPTS = 3; 
const MAX_AUTHORING_DISPATCHES = 6; 
const MAX_AUTHORING_WRITE_BYTES = 12000; 

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

const MODEL_IMPLEMENTATION = "sonnet"; 

const MODEL_ADVISORY = "fable"; 
const MODEL_ADVISORY_FALLBACK = "opus"; 

const ADVISORY_CONFIG_PATH = MERGE_CONFIG_PATH; 

const ENVELOPE_DEFAULTS = Object.freeze(["E-1", "E-2", "E-3", "E-4"]);

const ADVISORY_DEFAULTS = Object.freeze({
  enabled: false,
  attemptBudget: 3,
  seamBudgetMinutes: 10,
  envelope: ENVELOPE_DEFAULTS, 
});

const ADVISORY_SEAMS = Object.freeze(["A1", "A2", "A3", "A4", "A5"]);

function parseAdvisoryConfig(text) {
  const degraded = (sectionMalformed) => ({
    config: ADVISORY_DEFAULTS,
    sectionMalformed,
    invalidKeys: [],
  });

  if (text == null) return degraded(false);

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return degraded(false);
  }

  if (!isPlainObject(parsed) || !("advisory" in parsed)) return degraded(false);

  const section = parsed.advisory;
  if (!isPlainObject(section)) return degraded(true);

  const invalidKeys = [];

  const boolField = (key) => {
    if (!(key in section)) return ADVISORY_DEFAULTS[key];
    const v = section[key];
    if (typeof v === "boolean") return v;
    invalidKeys.push(key);
    return ADVISORY_DEFAULTS[key];
  };

  const positiveInt = (key) => {
    if (!(key in section)) return ADVISORY_DEFAULTS[key];
    const v = section[key];
    if (Number.isInteger(v) && v >= 1) return v;
    invalidKeys.push(key);
    return ADVISORY_DEFAULTS[key];
  };

  const positiveNumber = (key) => {
    if (!(key in section)) return ADVISORY_DEFAULTS[key];
    const v = section[key];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    invalidKeys.push(key);
    return ADVISORY_DEFAULTS[key];
  };

  let envelope = ADVISORY_DEFAULTS.envelope;
  if ("envelope" in section) {
    const v = section.envelope;
    if (Array.isArray(v) && v.every((p) => typeof p === "string" && p.trim() !== "")) {
      envelope = Object.freeze([...v]);
    } else {
      invalidKeys.push("envelope");
    }
  }

  return {
    config: Object.freeze({
      enabled: boolField("enabled"),
      attemptBudget: positiveInt("attemptBudget"),
      seamBudgetMinutes: positiveNumber("seamBudgetMinutes"),
      envelope,
    }),
    sectionMalformed: false,
    invalidKeys,
  };
}

async function readAdvisoryConfigSafely(readFileFn, path) {
  try {
    return await readFileFn(path);
  } catch {
    return null;
  }
}

const MODEL_ERROR_RE =
  /\b(unknown|unrecognis\w*|unrecogniz\w*|invalid|unsupported)\b[^\n]*\b(model|alias)\b/i;

function isModelResolutionError(err) {
  return MODEL_ERROR_RE.test(String(err?.message ?? err ?? ""));
}

const ADVISORY_RUNG_SKILL = "se-review";

function resolveAdvisoryRung({ _agent, _log, _state, prompt, skill = ADVISORY_RUNG_SKILL }) {
  const log = typeof _log === "function" ? _log : () => {};

  function dispatchAt(model) {
    return _agent(skill, prompt, { model });
  }

  if (_state.resolved != null) {
    return dispatchAt(_state.resolved.model).then(
      (raw) => ({ kind: "response", raw }),
      (err) => ({ kind: "dispatch-error", err })
    );
  }

  return dispatchAt(MODEL_ADVISORY).then(
    (raw) => {
      _state.resolved = { model: MODEL_ADVISORY, fallback: false };
      return { kind: "response", raw };
    },
    (err) => {
      if (!isModelResolutionError(err)) return { kind: "dispatch-error", err };
      log(
        `ADVISORY_MODEL_FALLBACK: "${MODEL_ADVISORY}" did not resolve — substituting "${MODEL_ADVISORY_FALLBACK}"`
      );
      return dispatchAt(MODEL_ADVISORY_FALLBACK).then(
        (raw) => {
          _state.resolved = { model: MODEL_ADVISORY_FALLBACK, fallback: true };
          return { kind: "response", raw };
        },
        (fallbackErr) => {
          if (!isModelResolutionError(fallbackErr)) return { kind: "dispatch-error", err: fallbackErr };
          throw haltError(
            `Advisory model rung resolution failed: neither "${MODEL_ADVISORY}" nor ` +
              `"${MODEL_ADVISORY_FALLBACK}" resolved. No advisory agent output was produced.`
          );
        }
      );
    }
  );
}

function parseAdvisoryVerdict(raw, dispatchedSeam) {
  const fail = (why) => ({ verdict: null, malformed: true, why });

  if (typeof raw !== "string" || raw.trim() === "") {
    return fail("empty");
  }

  const lines = raw.split("\n");
  const extract = (prefix) => {
    let value;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(prefix)) {
        value = trimmed.slice(prefix.length).trim();
      }
    }
    return value;
  };

  const seam = extract("SEAM:");
  const diagnosis = extract("DIAGNOSIS:");
  const proposedAction = extract("PROPOSED-ACTION:");
  const confidence = extract("CONFIDENCE:");
  const withinEnvelopeRaw = extract("WITHIN-ENVELOPE:");
  const evidenceRaw = extract("EVIDENCE:");

  const nothingParsed =
    seam === undefined &&
    diagnosis === undefined &&
    proposedAction === undefined &&
    confidence === undefined &&
    withinEnvelopeRaw === undefined &&
    evidenceRaw === undefined;
  if (nothingParsed) {
    return fail("unparseable");
  }

  if (dispatchedSeam !== undefined && seam !== dispatchedSeam) {
    return fail("seam");
  }

  const evidence =
    evidenceRaw === undefined || evidenceRaw.trim() === ""
      ? []
      : evidenceRaw
          .split(",")
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);
  if (evidence.length === 0) {
    return fail("evidence");
  }

  if (diagnosis === undefined || diagnosis.trim() === "") {
    return fail("diagnosis");
  }

  if (proposedAction === undefined || proposedAction.trim() === "") {
    return fail("proposedAction");
  }

  if (confidence !== "high" && confidence !== "low") {
    return fail("confidence");
  }

  return {
    verdict: {
      seam,
      diagnosis,
      proposedAction,
      confidence,
      withinEnvelope: withinEnvelopeRaw === "yes",
      evidence,
    },
    malformed: false,
    why: null,
  };
}

function budgetExceeded({ attempts, attemptBudget, elapsedMs, waitMs, seamBudgetMinutes }) {
  return attempts >= attemptBudget || elapsedMs - waitMs >= seamBudgetMinutes * 60_000;
}

const ADVISORY_REFUSAL_REASONS = Object.freeze([
  "prohibited-action",
  "revert-on-test-touch",
  "out-of-envelope",
  "post-action-verification-failed",
  "record-write-failed",
  "malformed-verdict",
  "low-confidence",
  "budget-exhausted",
]);

const ADVISORY_EXCLUSIONS = Object.freeze(["X-a", "X-e", "X-d", "X-b", "X-c"]);

function refusalReasonFor(signals) {
  for (const reason of ADVISORY_REFUSAL_REASONS) {
    if (signals && signals[reason]) return reason;
  }
  return undefined;
}

const TEST_PATH_RE = /(^|\/)(tests?|__tests__|spec)\//i;
const TEST_FILE_RE = /\.(test|spec)\.[jt]sx?$|^conftest\.py$|_test\.py$|^test_.*\.py$/i;
const TEST_CONFIG_RE = /(^|\/)(jest\.config|pytest\.ini|\.coveragerc|setup\.cfg|vitest\.config|mutmut\.ini)/i;

const TEST_TOUCH_OPERATIONS = new Set([
  "edit-assertion",
  "delete-test-file",
  "delete-test-case",
  "rename-out-of-collection",
  "add-skip-marker",
  "narrow-parametrised-cases",
  "lower-threshold",
]);

function touchesTestArtifact(paths, action) {
  const list = Array.isArray(paths) ? paths : [];
  if (list.some((p) => TEST_PATH_RE.test(p) || TEST_FILE_RE.test(p) || TEST_CONFIG_RE.test(p))) {
    return true;
  }
  return Boolean(action && TEST_TOUCH_OPERATIONS.has(action.op));
}

const DOD_CRITERION_PATH_RE = /(^|\/)(package\.json|pyproject\.toml)$/i;

function touchesDodCriterion(paths, action) {
  const list = Array.isArray(paths) ? paths : [];
  if (list.some((p) => DOD_CRITERION_PATH_RE.test(p))) return true;
  return Boolean(action && action.op === "mark-criterion-satisfied");
}

async function branchCreated(path, mergeBase, defaultTip, _git) {
  const atMergeBase = await _git(["cat-file", "-e", `${mergeBase}:${path}`]);
  const atDefaultTip = await _git(["cat-file", "-e", `${defaultTip}:${path}`]);
  return atMergeBase.ok !== true && atDefaultTip.ok !== true;
}

function classifyEnvelope(candidate, ctx) {
  const paths = Array.isArray(candidate && candidate.paths) ? candidate.paths : [];
  const action = candidate && candidate.action;

  for (const exclusion of ADVISORY_EXCLUSIONS) {
    if (exclusion === "X-a") {
      if (touchesTestArtifact(paths, { op: action })) {
        return { inside: false, reason: "revert-on-test-touch", matched: [...paths] };
      }
    } else if (exclusion === "X-e") {
      const verdict = guardVerdict({ ok: true, files: paths }, ctx.guardPaths || []);
      if (verdict.fired) {
        return { inside: false, reason: "out-of-envelope", matched: verdict.matched };
      }
    } else if (exclusion === "X-d") {
      const scope = Array.isArray(ctx.declaredScope) ? ctx.declaredScope : [];
      const outside = paths.filter((p) => !scope.includes(p));
      if (outside.length > 0) {
        return { inside: false, reason: "out-of-envelope", matched: outside };
      }
    } else if (exclusion === "X-b") {
      if (touchesDodCriterion(paths, { op: action })) {
        return { inside: false, reason: "out-of-envelope", matched: [...paths] };
      }
    } else if (exclusion === "X-c") {
      const permitted = Array.isArray(ctx.permittedActions) ? ctx.permittedActions : [];
      if (!permitted.includes(action)) {
        return { inside: false, reason: "out-of-envelope", matched: [...paths] };
      }
    }
  }

  return { inside: true, reason: null, matched: [...paths] };
}

const ADVISORY_A3_CLASSES = Object.freeze(["real-defect", "mis-scoped-criterion", "deferral-candidate"]);

const A3_CLASS_RANK = Object.freeze({ "real-defect": 3, "mis-scoped-criterion": 2, "deferral-candidate": 1 });

const A3_FIELD_RE = {
  finding: /^FINDING:\s*(.*)$/m,
  classification: /^CLASSIFICATION:\s*(.*)$/m,
  evidence: /^EVIDENCE:\s*(.*)$/m,
  successor: /^SUCCESSOR:\s*(.*)$/m,
};

function parseA3Classification(raw) {
  const text = String(raw ?? "");
  const findingCount = (text.match(/^FINDING:/gm) || []).length;
  const closedSet = new Set(ADVISORY_A3_CLASSES);
  const classes = [];

  for (const block of text.split(/\n---\n/)) {
    const findingMatch = A3_FIELD_RE.finding.exec(block);
    const classMatch = A3_FIELD_RE.classification.exec(block);
    if (!findingMatch || !classMatch) continue;

    const cls = classMatch[1].trim();
    if (!closedSet.has(cls)) continue;

    const successorMatch = A3_FIELD_RE.successor.exec(block);
    if (cls === "deferral-candidate" && !successorMatch) continue;

    const evidenceMatch = A3_FIELD_RE.evidence.exec(block);
    const entry = {
      finding: findingMatch[1].trim(),
      class: cls,
      evidence: evidenceMatch ? evidenceMatch[1].trim() : "",
    };
    if (successorMatch) entry.successor = successorMatch[1].trim();
    classes.push(entry);
  }

  return { classes, complete: classes.length === findingCount };
}

function governingClass(classes) {
  const list = Array.isArray(classes) ? classes : [];
  let winner = null;
  let winnerRank = -Infinity;
  for (const entry of list) {
    const rank = A3_CLASS_RANK[entry && entry.class];
    if (rank !== undefined && rank > winnerRank) {
      winnerRank = rank;
      winner = entry.class;
    }
  }
  return winner;
}

function summariseA3Classification(raw) {
  const parsed = parseA3Classification(raw);
  if (parsed.classes.length === 0) return "";
  const governing = governingClass(parsed.classes);
  const lead = parsed.classes.find((entry) => entry.class === governing);
  if (!lead) return "";
  const evidence = lead.evidence ? ` (evidence: ${lead.evidence})` : "";
  const successor = lead.successor ? ` [successor: ${lead.successor}]` : "";
  return `${governing}: ${lead.finding}${evidence}${successor}`;
}

function buildA3SeamOps({ dodResult, codeReviewText, _readFile } = {}) {
  async function gatherEvidence() {
    const lastStatus = dodResult && dodResult.lastStatus;
    let text = codeReviewText;
    if (text === undefined && typeof _readFile === "function") {
      try {
        text = await _readFile();
      } catch {
        text = "";
      }
    }
    return `DOD_STATUS: ${lastStatus}\n${text || ""}`;
  }

  return {
    gatherEvidence,
    prompt: (evidence) =>
      "Classify every remaining finding as real-defect / mis-scoped-criterion / deferral-candidate, " +
      `each with evidence, and bind every deferral-candidate to a named successor.\n${evidence}`,
    conditionHolds: async () => true,
    apply: async () => {
      throw new Error("A3 seam: apply is unreachable — permittedActions is empty (A3-6)");
    },
    producedPaths: async () => [],
    revert: async () => {
      throw new Error("A3 seam: revert is unreachable — permittedActions is empty (A3-6)");
    },
    verifyGate: null,
    declaredScope: [],
    permittedActions: [],
  };
}

async function readGitFileList(argv, _git) {
  const result = await _git(argv);
  const stdout = result && typeof result.stdout === "string" ? result.stdout : "";
  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function buildA4SeamOps({ mergeBase, preRebaseHead, defaultTip, planFiles, implConfig, _git, _runCommand } = {}) {
  const ownPlanFiles = Array.isArray(planFiles) ? planFiles : [];
  const declaredScope = [...ownPlanFiles];
  const permittedActions = ["E-3"];

  async function gatherEvidence() {
    const conflictFiles = await readGitFileList(["diff", "--name-only", "--diff-filter=U"], _git);
    const determinations = [];
    let mixed = false;
    for (const path of conflictFiles) {
      const created = await branchCreated(path, mergeBase, defaultTip, _git);
      if (!created) mixed = true;
      determinations.push({ path, branchCreated: created });
    }
    const preRebaseDiff = await readGitFileList(["diff", "--name-only", `${mergeBase}..${preRebaseHead}`], _git);
    const nonTestConflictFiles = conflictFiles.filter((p) => !touchesTestArtifact([p], {}));

    declaredScope.length = 0;
    declaredScope.push(...new Set([...ownPlanFiles, ...preRebaseDiff, ...nonTestConflictFiles]));

    permittedActions.length = 0;
    if (!(conflictFiles.length > 0 && mixed)) permittedActions.push("E-3");

    return determinations.map((d) => `${d.path}: ${d.branchCreated ? "branch-created" : "shared"}`).join("\n");
  }

  return {
    gatherEvidence,
    prompt: (evidence) => `Resolve each conflict in a branch-created file, reporting per file which side was taken and why.\n${evidence}`,
    conditionHolds: async () => {
      const current = await readGitFileList(["diff", "--name-only", "--diff-filter=U"], _git);
      return current.length > 0;
    },
    apply: async () => ({ ok: true }),
    producedPaths: async () => readGitFileList(["diff", "--name-only"], _git),
    revert: async () => {
      await _git(["rebase", "--abort"]);
    },
    verifyGate: async () => {
      const testCommand = implConfig && implConfig.testCommand;
      const hasTestCommand = typeof testCommand === "string" && testCommand.length > 0;
      if (!hasTestCommand || typeof _runCommand !== "function") {
        return { passed: false }; 
      }
      const continueResult = await _git(["rebase", "--continue"]);
      if (!continueResult || continueResult.ok !== true) {
        return { passed: false, detail: continueResult && continueResult.stderr };
      }
      const testResult = await _runCommand(testCommand);
      return { passed: Boolean(testResult && testResult.ok === true) };
    },
    declaredScope,
    permittedActions,
  };
}

async function probeDefaultBranchChecks(defaultBranch, { _ghRun } = {}) {
  const reply = await _ghRun(
    `gh run list --branch ${defaultBranch} --json conclusion,workflowName,headSha`
  );
  if (!reply || reply.ok !== true) return { available: false, runs: [] };
  try {
    const parsed = JSON.parse(String(reply.stdout || "").trim());
    return Array.isArray(parsed)
      ? { available: true, runs: parsed }
      : { available: false, runs: [] };
  } catch {
    return { available: false, runs: [] };
  }
}

async function probeWorkflowRerun(runId, { _ghRun } = {}) {
  const idPart = runId ? ` ${runId}` : "";
  const dryRun = await _ghRun(`gh run rerun --failed${idPart} --dry-run`);
  if (dryRun && dryRun.ok === true) return { available: true };
  const auth = await _ghRun("gh auth status");
  const scoped =
    auth && auth.ok === true && /actions:\s*write|actions:write/.test(String(auth.stdout || ""));
  return { available: Boolean(scoped) };
}

function makeWaitAccumulator() {
  let total = 0;
  return {
    recordWait: (ms) => {
      const value = Number(ms);
      if (Number.isFinite(value) && value > 0) total += value;
    },
    waitMs: () => total,
  };
}

async function buildA5SeamOps({
  feature,
  prUrl,
  preSeamHead,
  defaultBranch,
  mergeBase,
  recordWait,
  _git,
  _ghRun,
  _checkCi,
} = {}) {
  const bl05 = await probeDefaultBranchChecks(defaultBranch, { _ghRun });
  const bl06 = await probeWorkflowRerun(undefined, { _ghRun });

  const tipRun = bl05.runs.length > 0 ? bl05.runs[0] : null;
  const preExisting = Boolean(tipRun && tipRun.conclusion !== "success");

  const e2Uncertified = Boolean(
    tipRun && tipRun.conclusion === "success" && tipRun.headSha === mergeBase
  );

  const permittedActions = [];
  if (bl05.available) {
    if (bl06.available) permittedActions.push("E-1");
    if (!e2Uncertified) permittedActions.push("E-2");
  }

  const declaredScope = await readGitFileList(
    ["diff", "--name-only", `${mergeBase}..HEAD`],
    _git
  );

  let pushed = false;
  let lastAction = null;

  function nowSafe() {
    try {
      return Date.now();
    } catch {
      return 0;
    }
  }

  async function rePoll() {
    let status;
    const t0 = nowSafe();
    try {
      status = await _checkCi(prUrl);
    } catch {

      if (typeof recordWait === "function") recordWait(nowSafe() - t0);
      return { passed: false, consumesAttempt: true, detail: "completion cap reached" };
    }
    if (typeof recordWait === "function") recordWait(nowSafe() - t0);
    return { passed: status === "passed", consumesAttempt: true, detail: `re-poll: ${status}` };
  }

  return {
    gatherEvidence: async () => {

      const log = await _ghRun("gh run view --log-failed");
      if (!log || log.ok !== true) {
        return { __preDispatch: { outcome: "escalated", reason: "out-of-envelope" } };
      }

      if (!bl05.available) {
        return { __preDispatch: { outcome: "escalated", reason: "out-of-envelope" } };
      }

      if (preExisting) {
        return { __preDispatch: { outcome: "escalated", reason: "out-of-envelope" } };
      }
      return { log: String(log.stdout || "") };
    },
    prompt: (evidence) =>
      [
        `CI for ${feature} (${prUrl}) is red. Name the failing step and its cause, and classify:`,
        `E-1 (flaky — a re-run should pass), E-2 (branch-introduced lint/format/type fix), or neither.`,
        `Failing job log:`,
        evidence && evidence.log ? evidence.log : "",
      ].join("\n"),
    conditionHolds: async () => (await _checkCi(prUrl)) === "failed",
    apply: async (verdict) => {
      lastAction = verdict ? verdict.proposedAction : null;
      if (lastAction === "E-1") return { ok: true }; 
      const commit = await _git([
        "commit",
        "-m",
        `advisory(A5): ${feature} — branch-introduced CI fix`,
      ]);
      return { ok: Boolean(commit && commit.ok === true) };
    },
    producedPaths: async () =>
      readGitFileList(["diff", "--name-only", `${preSeamHead}..HEAD`], _git),
    revert: async () => {
      if (pushed) return; 
      await _git(["reset", "--hard", preSeamHead]);
    },
    verifyGate: async () => {
      if (lastAction === "E-1") {
        const rerun = await _ghRun("gh run rerun --failed");
        if (!rerun || rerun.ok !== true) {
          return { passed: false, consumesAttempt: true, detail: "re-run refused" };
        }
        return rePoll();
      }
      const push = await _git(["push"]);
      if (!push || push.ok !== true) {
        return {
          passed: false,
          consumesAttempt: true,
          detail: `push rejected: ${String((push && push.stderr) || "").trim()}`,
        };
      }
      pushed = true;
      return rePoll();
    },
    declaredScope,
    permittedActions,
  };
}

function advisoryEntrySingleLine(value) {
  return String(value).replace(/\r?\n/g, " ");
}

function renderAdvisoryEntry(disposition, { now }) {
  const { seam, outcome, reason, verdict, model, fallback } = disposition;

  const dispositionValue =
    outcome === "escalated" && reason ? `${outcome} — ${reason}` : outcome;
  const confidence = verdict ? verdict.confidence : "n/a";
  const envelope = verdict ? (verdict.withinEnvelope ? "in" : "out") : "n/a";
  const diagnosis = verdict ? verdict.diagnosis : "no verdict was produced";
  const evidence =
    verdict && Array.isArray(verdict.evidence) && verdict.evidence.length > 0
      ? verdict.evidence
      : ["(none)"];
  const modelValue = fallback ? `${model} (fallback)` : model;

  const lines = [
    `## ${now} — ${seam} — ${outcome}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Seam | ${seam} |`,
    `| Confidence | ${advisoryEntrySingleLine(confidence)} |`,
    `| Envelope | ${envelope} |`,
    `| Disposition | ${advisoryEntrySingleLine(dispositionValue)} |`,
    `| Model | ${advisoryEntrySingleLine(modelValue)} |`,
    "",
    `**Diagnosis.** ${advisoryEntrySingleLine(diagnosis)}`,
    "",
    "**Evidence.**",
    ...evidence.map((e) => `- ${advisoryEntrySingleLine(e)}`),
    "",
  ];
  return lines.join("\n");
}

async function appendAdvisoryEntry({ feature, disposition, _appendFile, _now }) {
  const now = _now();
  const entry = renderAdvisoryEntry(disposition, { now });
  const path = `docs/${feature}/ADVISORY-${feature}.md`;
  await _appendFile(path, entry);
}

function advisorySummaryRows(dispositions, pubOutcome = {}) {
  const list = Array.isArray(dispositions) ? dispositions : [];

  const rows = ADVISORY_SEAMS.map((seam) => {
    const forSeam = list.filter((d) => d && d.seam === seam);
    const resolved = forSeam.filter((d) => d.outcome === "resolved").length;
    const escalated = forSeam.filter((d) => d.outcome === "escalated").length;
    const noAction = forSeam.filter((d) => d.outcome === "no-action").length;
    const last = forSeam.length > 0 ? forSeam[forSeam.length - 1] : null;
    return {
      seam,
      invocations: forSeam.length,
      resolved,
      escalated,
      noAction,
      model: last ? last.model : undefined,
      fallback: last ? last.fallback : undefined,
    };
  });

  const total = rows.reduce(
    (acc, row) => ({
      invocations: acc.invocations + row.invocations,
      resolved: acc.resolved + row.resolved,
      escalated: acc.escalated + row.escalated,
      noAction: acc.noAction + row.noAction,
    }),
    { invocations: 0, resolved: 0, escalated: 0, noAction: 0 }
  );

  return {
    rows,
    total,
    noChecks: Boolean(pubOutcome && pubOutcome.noChecks),
    completionCap: Boolean(pubOutcome && pubOutcome.completionCap),
  };
}

const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";

function renderEscalationEntry(disposition, ctx, { now }) {
  const { reason, verdict } = disposition;
  const { feature, seam, phase, phaseOutcome, decision } = ctx;
  const iso = new Date(now).toISOString();

  const diagnosis = verdict ? verdict.diagnosis : "no verdict was produced";
  const proposedAction = verdict ? verdict.proposedAction : "(none)";
  const evidence =
    verdict && Array.isArray(verdict.evidence) && verdict.evidence.length > 0
      ? verdict.evidence
      : ["(none)"];

  const lines = [
    `## ${iso} — ${feature} — ${seam}`,
    "",
    `**Decide:** ${advisoryEntrySingleLine(decision)}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Feature | ${feature} |`,
    `| Seam | ${seam} |`,
    `| Refusal reason | ${advisoryEntrySingleLine(reason ?? "n/a")} |`,
    "",
    `**Diagnosis.** ${advisoryEntrySingleLine(diagnosis)}`,
    "",
    `**Proposed action.** ${advisoryEntrySingleLine(proposedAction)}`,
    "",
    "**Evidence.**",
    ...evidence.map((e) => `- ${advisoryEntrySingleLine(e)}`),
    "",
    `**Pipeline state.** ${phase} — ${phaseOutcome}`,
    "",
  ];
  return lines.join("\n");
}

async function appendEscalationEntry({ disposition, ctx, _appendFile, _now }) {
  const now = _now();
  const entry = renderEscalationEntry(disposition, ctx, { now });
  await _appendFile(ESCALATIONS_PATH, entry);
}

const ADVISORY_SEAM_PHASES = Object.freeze({
  A1: Object.freeze({ id: "QUEUE", outcome: "skipped" }),
  A2: Object.freeze({ id: "QUEUE", outcome: "skipped" }),
  A3: Object.freeze({ id: "DOD", outcome: "halted" }),
  A4: Object.freeze({ id: "DOD", outcome: "halted" }),
  A5: Object.freeze({ id: "PUB", outcome: "halted" }),
});

function escalationDecision({ seam, feature, reason, verdict, classificationSummary }) {
  const proposal =
    verdict && verdict.proposedAction ? `"${verdict.proposedAction}"` : "no well-formed proposal";
  const classified = classificationSummary ? `; classified ${classificationSummary}` : "";
  return (
    `whether to take the ${seam} proposal for ${feature} yourself (${proposal}) — ` +
    `the advisory tier refused it as ${reason ?? "unclassified"} and changed nothing${classified}`
  );
}

const PROHIBITED_ACTION_PATTERNS = [

  /\b(mark|weaken|reduce)\b[\s\S]*\b(dod|definition of done)\b/i,
  /\bdefinition of done\b[\s\S]*\b(satisfied|weaken|reduce)/i,

  /\bready\s*:\s*true\b/i,

  /\bdeclare\b[\s\S]*\bci\b[\s\S]*\bpassed\b/i,

  /\bmerge\b[\s\S]*\b(pr|pull request)\b/i,
  /\balter\b[\s\S]*\bqueue\b[\s\S]*\bstatus\b/i,
];

function isProhibitedAction(proposedAction) {
  const text = String(proposedAction || "");
  return PROHIBITED_ACTION_PATTERNS.some((re) => re.test(text));
}

async function runAdvisorySeam({
  seam,
  feature,
  seamOps,
  config,
  rungState,
  _agent,
  _appendFile,
  _writeFile,
  _readFile,
  _git,
  _log,
  _now = () => Date.now(),
  _sleep = sleep,
  _notice,
  _waitMs,
  _summarise,
}) {
  const log = typeof _log === "function" ? _log : () => {};
  const notice = typeof _notice === "function" ? _notice : () => {};
  const readWaitMs = typeof _waitMs === "function" ? _waitMs : () => 0;

  let summary = "";

  let lastReason = null;
  let attempts = 0;
  let verdict = null;

  if (!config || config.enabled === false) {
    return { outcome: "no-action", reason: null, verdict: null, attempts: 0, model: undefined, fallback: false, seam };
  }

  function refuse(signals) {
    lastReason = refusalReasonFor(signals) ?? "budget-exhausted";
    return lastReason;
  }

  async function doRevert() {
    try {
      await seamOps.revert();
    } catch (err) {
      if (err && typeof err === "object") err.__isRevertFailure = true;
      throw err;
    }
  }

  async function terminate({ outcome, reason, verdict, attempts, appliedSuccessfully }) {
    let finalOutcome = outcome;
    let finalReason = reason;
    log("RECORD");
    const disposition = {
      seam,
      outcome: finalOutcome,
      reason: finalReason,
      verdict,
      attempts,
      model: rungState.resolved ? rungState.resolved.model : undefined,
      fallback: rungState.resolved ? rungState.resolved.fallback : false,
    };
    try {
      await appendAdvisoryEntry({ feature, disposition, _appendFile, _now });
    } catch {
      if (appliedSuccessfully) await doRevert();
      finalOutcome = "escalated";
      finalReason = "record-write-failed";
    }
    const terminal = {
      seam,
      outcome: finalOutcome,
      reason: finalReason,
      verdict,
      attempts,
      model: rungState.resolved ? rungState.resolved.model : undefined,
      fallback: rungState.resolved ? rungState.resolved.fallback : false,

      ...(summary ? { classificationSummary: summary } : {}),
    };

    if (finalOutcome === "escalated") {
      const placement = ADVISORY_SEAM_PHASES[seam];
      try {
        await appendEscalationEntry({
          disposition: terminal,
          ctx: {
            feature,
            seam,
            phase: placement ? placement.id : "unknown",
            phaseOutcome: placement ? placement.outcome : "unknown",
            decision: escalationDecision({
              seam,
              feature,
              reason: finalReason,
              verdict,
              classificationSummary: summary,
            }),
          },
          _appendFile,
          _now,
        });
      } catch (err) {
        notice(
          `ADVISORY escalation log write failed for seam ${seam}: ${
            err && err.message ? err.message : String(err)
          }`
        );
      }
      notice(ADVISORY_ESCALATIONS.seam({ seam, feature, reason: finalReason }));
    }

    return terminal;
  }

  const totalBudgetMs = config.seamBudgetMinutes * 60_000;

  try {

    while (true) {
      log("DIAGNOSE");
      const evidence = await seamOps.gatherEvidence();

      if (evidence && typeof evidence === "object" && evidence.__preDispatch) {
        const pre = evidence.__preDispatch;
        return await terminate({
          outcome: pre.outcome,
          reason: pre.reason ?? null,
          verdict: null,
          attempts,
          appliedSuccessfully: false,
        });
      }

      const promptText = seamOps.prompt(evidence);

      const dispatched = resolveAdvisoryRung({ _agent, _log: log, _state: rungState, prompt: promptText });
      const deadline = _sleep(totalBudgetMs).then(() => ({ kind: "preempted" }));
      const raced = await Promise.race([dispatched, deadline]);

      if (raced.kind === "preempted") {
        attempts += 1; 
        return await terminate({ outcome: "escalated", reason: refuse({ "budget-exhausted": true }), verdict: null, attempts, appliedSuccessfully: false });
      }

      log("VALIDATE");

      if (raced.kind === "dispatch-error") {
        attempts += 1;
        if (
          budgetExceeded({
            attempts,
            attemptBudget: config.attemptBudget,
            elapsedMs: 0,
            waitMs: readWaitMs(),
            seamBudgetMinutes: config.seamBudgetMinutes,
          })
        ) {
          return await terminate({ outcome: "escalated", reason: refuse({ "budget-exhausted": true }), verdict: null, attempts, appliedSuccessfully: false });
        }
        continue;
      }

      if (typeof _summarise === "function") {
        try {
          const produced = _summarise(raced.raw);
          if (typeof produced === "string" && produced !== "") summary = produced;
        } catch {

        }
      }

      const parsed = parseAdvisoryVerdict(raced.raw, seam);
      if (parsed.malformed) {
        attempts += 1;
        if (
          budgetExceeded({
            attempts,
            attemptBudget: config.attemptBudget,
            elapsedMs: 0,
            waitMs: readWaitMs(),
            seamBudgetMinutes: config.seamBudgetMinutes,
          })
        ) {

          const reason = refuse({ "malformed-verdict": attempts === 1, "budget-exhausted": true });
          return await terminate({ outcome: "escalated", reason, verdict: null, attempts, appliedSuccessfully: false });
        }
        continue;
      }

      verdict = parsed.verdict;

    log("RE-CHECK");
    const holds = await seamOps.conditionHolds();
    if (!holds) {
      return await terminate({ outcome: "no-action", reason: null, verdict, attempts, appliedSuccessfully: false });
    }

    log("GATE");

    const gateCtx = {
      seam,
      permittedActions: seamOps.permittedActions,
      declaredScope: seamOps.declaredScope,
      guardPaths: effectiveGuardPaths(undefined),
      capabilities: {},
    };
    const proposalCandidate = { action: verdict.proposedAction, paths: seamOps.declaredScope };

    const prohibited = isProhibitedAction(verdict.proposedAction);
    const gateResult = classifyEnvelope(proposalCandidate, gateCtx);
    const lowConfidence = verdict.confidence !== "high";
    if (prohibited || !gateResult.inside || lowConfidence) {
      const gateSignals = { "prohibited-action": prohibited, "low-confidence": lowConfidence };
      if (!gateResult.inside && gateResult.reason) gateSignals[gateResult.reason] = true;
      return await terminate({ outcome: "escalated", reason: refuse(gateSignals), verdict, attempts, appliedSuccessfully: false });
    }

    log("ACT");
    const applyResult = await seamOps.apply(verdict);
    if (!applyResult || applyResult.ok !== true) {
      await doRevert();
      return await terminate({ outcome: "escalated", reason: refuse({ "post-action-verification-failed": true }), verdict, attempts, appliedSuccessfully: false });
    }

    log("CHECK");
    const producedPaths = await seamOps.producedPaths();
    const checkCandidate = { action: verdict.proposedAction, paths: Array.isArray(producedPaths) ? producedPaths : [] };
    const checkResult = classifyEnvelope(checkCandidate, gateCtx);
    if (!checkResult.inside) {
      await doRevert();
      return await terminate({
        outcome: "escalated",
        reason: refuse(checkResult.reason ? { [checkResult.reason]: true } : {}),
        verdict,
        attempts,
        appliedSuccessfully: false,
      });
    }

    log("VERIFY");
    if (seamOps.verifyGate !== null) {
      const gateOutcome = await seamOps.verifyGate();
      if (!gateOutcome || gateOutcome.passed !== true) {
        await doRevert();

        if (gateOutcome && gateOutcome.consumesAttempt === true) {
          attempts += 1;
          if (
            budgetExceeded({
              attempts,
              attemptBudget: config.attemptBudget,
              elapsedMs: 0,
              waitMs: readWaitMs(),
              seamBudgetMinutes: config.seamBudgetMinutes,
            })
          ) {
            return await terminate({ outcome: "escalated", reason: refuse({ "budget-exhausted": true }), verdict, attempts, appliedSuccessfully: false });
          }
          continue;
        }
        return await terminate({ outcome: "escalated", reason: refuse({ "post-action-verification-failed": true }), verdict, attempts, appliedSuccessfully: false });
      }
    }

    return await terminate({ outcome: "resolved", reason: null, verdict, attempts, appliedSuccessfully: true });
    }
  } catch (err) {
    if (err && err.__isRevertFailure) throw err; 
    if (err && err.isHalt) throw err; 

    return await terminate({
      outcome: "escalated",
      reason: lastReason ?? "budget-exhausted",
      verdict,
      attempts,
      appliedSuccessfully: false,
    });
  }
}

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

const PHASE_DISPATCH = {
  R: {
    phase: "R",
    label: "REQ Cross-Review",
    creator: null,
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",

    grounding: [
      "Every code path or file the REQ names — confirm it exists and matches the described behavior.",
      "Every existing-behavior claim in the REQ — verify against current code, not assumption.",
    ],
  },
  F: {
    phase: "F",
    label: "FSPEC Creation + Review",
    creator: "pm-author",
    creatorInputs: ["REQ"],
    creatorOutputPath: "docs/{feature}/FSPEC-{feature}.md",
    reviewers: ["se-review", "te-review"],
    optimizer: "pm-author",
    grounding: [
      "The REQ this FSPEC derives from — every claim must trace to it.",
      "Every repo path the FSPEC names — confirm it exists and behaves as described.",
    ],
  },
  T: {
    phase: "T",
    label: "TSPEC Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC"],
    creatorOutputPath: "docs/{feature}/TSPEC-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    grounding: [
      "Every production file and symbol the TSPEC cites — confirm each one exists in the repo.",
      "Every claim about current behavior — verify against the cited code, not the TSPEC's prose.",
    ],
  },
  D: {
    phase: "D",
    label: "DECISIONS Creation + Review",
    creator: "se-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC"],
    creatorOutputPath: "docs/{feature}/DECISIONS-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    grounding: [
      "Each alternative's claimed code cost — verify against the actual files it would touch.",
      "Any claim that an alternative is simpler or cheaper — confirm against the existing code, not intuition.",
    ],
  },
  P: {
    phase: "P",
    label: "PLAN Creation + Review",
    creator: "se-author",

    creatorInputs: ["REQ", "FSPEC", "TSPEC", "DECISIONS?"],
    creatorOutputPath: "docs/{feature}/PLAN-{feature}.md",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    grounding: [
      "Every file the task table names — confirm it exists, or that the task explicitly declares it new.",
      "The task table's coverage claims — verify against the current test suite layout.",
    ],
  },
  PR: {
    phase: "PR",
    label: "PROPERTIES Creation + Review",
    creator: "te-author",
    creatorInputs: ["REQ", "FSPEC", "TSPEC", "PLAN"],
    creatorOutputPath: "docs/{feature}/PROPERTIES-{feature}.md",
    reviewers: ["pm-review", "se-review"],
    optimizer: "te-author",
    grounding: [
      "Every task the PLAN's table lists — confirm the PROPERTIES trace to it.",
      "Every named test file and test level — confirm it exists or is explicitly planned as new.",
    ],
  },
  CR: {
    phase: "CR",
    label: "Final Codebase Review",
    creator: null,
    creatorInputs: [],
    creatorOutputPath: null,
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    grounding: [
      "The feature's full diff against the default branch — every finding must cite the actual changed lines.",
      "The documents under docs/{feature}/ — confirm the shipped code matches what they specify.",
    ],
  },
  DOD: {
    phase: "DOD",
    label: "Definition of Done Verification",
    verifier: "dod-verify",
    remediator: "se-implement",
  },
};

function haltError(message, fields) {
  const err = new Error(message);
  err.isHalt = true;

  if (fields && typeof fields === "object") Object.assign(err, fields);
  return err;
}

function featureBranchName(feature) {
  return `feat-${String(feature ?? "").trim()}`;
}

function branchGuardTransport(_git) {
  return typeof _git === "function" && _git !== defaultGit ? _git : null;
}

function parseAbbrevRef(result) {
  if (!result || result.ok !== true) return null;
  const name = String((result && result.stdout) ?? "").trim();
  return name === "" ? null : name;
}

const GIT_READ_RETRIES = 2;

async function readHeadBranch(git) {
  let result = null;
  let observations = 0;
  while (observations < GIT_READ_RETRIES + 1) {
    result = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
    observations += 1;
    const branch = parseAbbrevRef(result);
    if (branch !== null) return { branch, observations, result, transportFault: false };

    if (!result || result.ok !== true) {
      return { branch: null, observations, result, transportFault: false };
    }
  }
  return { branch: null, observations, result, transportFault: true };
}

function transportFaultNote(head) {
  return head && head.transportFault
    ? ` (${head.observations} observations, all empty — transport fault suspected)`
    : "";
}

function branchGuardRemedy(branch) {
  return `Check out ${branch} yourself (git checkout -B ${branch}) and re-invoke; nothing was committed.`;
}

async function ensureFeatureBranch({ feature, _git, _log } = {}) {
  const branch = featureBranchName(feature);
  const emit = typeof _log === "function" ? _log : log;
  const git = branchGuardTransport(_git);
  if (!git) {
    emit(`Branch guard: inert — no git seam injected, ${branch} was not verified.`);
    return { ok: true, branch, action: "skipped" };
  }

  const head = await readHeadBranch(git);
  const current = head.branch;
  if (current === null) {
    throw haltError(
      `Error: branch guard — could not read the current branch ` +
        `(git rev-parse --abbrev-ref HEAD failed: ` +
        `${String((head.result && head.result.stderr) || "no output").trim()})` +
        `${transportFaultNote(head)}. ` +
        `Refusing to run the pipeline without knowing that commits will land on ${branch}. ` +
        branchGuardRemedy(branch)
    );
  }
  if (current === branch) return { ok: true, branch, action: "already-on" };

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

  const confirmation = await readHeadBranch(git);
  const after = confirmation.branch;
  if (after !== branch) {
    throw haltError(
      `Error: branch guard — after checking out ${branch} the working tree is still on ` +
        `"${after ?? "an unreadable branch"}"${transportFaultNote(confirmation)}. ` +
        `Refusing to run: every commit of this run would ` +
        `land there. ` +
        branchGuardRemedy(branch)
    );
  }

  emit(`Branch guard: working tree is on ${branch} (${action}).`);
  return { ok: true, branch, action };
}

async function verifyFeatureBranch({ feature, context, _git, _log } = {}) {
  const branch = featureBranchName(feature);
  const git = branchGuardTransport(_git);
  if (!git) return { ok: true, branch, verified: false };

  const where = context ? ` before ${context}` : "";
  const head = await readHeadBranch(git);
  const current = head.branch;
  if (current === branch) return { ok: true, branch, verified: true };

  throw haltError(
    `Error: branch guard${where} — the working tree is on ` +
      `"${current ?? "an unreadable branch"}"${transportFaultNote(head)}, ` +
      `not ${branch}. Refusing to continue: ` +
      `this round's commits would land there. ` +
      branchGuardRemedy(branch)
  );
}

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

function parsePlanTasks(markdown) {
  if (markdown == null || typeof markdown !== "string") return null;

  const isDescCell = (c) =>
    c.includes("desc") ||
    c.includes("task") ||
    c.includes("summary") ||
    c.includes("name") ||
    c.includes("title");
  const isBatchCell = (c) =>
    c.includes("batch") || c.includes("phase") || c.includes("wave");

  const blocks = [];
  let block = null;
  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      if (!block) {
        block = [];
        blocks.push(block);
      }
      block.push(trimmed);
    } else {
      block = null;
    }
  }
  if (blocks.length === 0) return null;

  const tasks = [];
  for (const rows of blocks) {
    const cols = splitPipeRow(rows[0]).map((c) => c.toLowerCase());
    const idIdx = cols.findIndex((c) => PLAN_ID_HEADER_CELLS.has(c));
    const depsIdx = cols.findIndex((c) => PLAN_DEPS_HEADER_CELLS.has(c));

    if (idIdx < 0 || depsIdx < 0) continue;

    const findCol = (pred) => {
      for (let i = 0; i < cols.length; i++) {
        if (i === idIdx || i === depsIdx) continue;
        if (pred(cols[i])) return i;
      }
      return -1;
    };
    const descIdx = findCol(isDescCell);
    const batchIdx = findCol(isBatchCell);

    for (let i = 1; i < rows.length; i++) {
      const cells = splitPipeRow(rows[i]);

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
  }

  if (tasks.length === 0) return null;
  return { tasks };
}

const PLAN_ID_HEADER_CELLS = new Set(["task id", "task-id", "task_id", "id", "#"]);
const PLAN_DEPS_HEADER_CELLS = new Set([
  "dependencies",
  "dependency",
  "depends on",
  "depends-on",
  "depends_on",
  "deps",
  "prerequisites",
  "prereqs",
]);

function splitPipeRow(row) {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

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

const PLAN_OWNER_HEADER_CELLS = new Set([
  "task",
  "task id",
  "task-id",
  "task_id",
  "owning task",
  "id",
]);
const PLAN_FILES_HEADER_CELLS = new Set([
  "files created or appended",
  "files",
  "owned files",
  "files owned",
  "file ownership",
  "files created/appended",
]);

function stripCellEmphasis(cell) {
  return String(cell == null ? "" : cell)
    .trim()
    .replace(/^[*_`~]+/, "")
    .replace(/[*_`~]+$/, "")
    .trim();
}

function isPlausiblePath(value) {
  if (!value) return false;
  if (/\s/.test(value)) return false;
  const lowered = value.toLowerCase();
  if (
    lowered === "-" ||
    lowered === "—" ||
    lowered === "–" ||
    lowered === "none" ||
    lowered === "n/a" ||
    lowered === "tbd"
  ) {
    return false;
  }
  return /^[A-Za-z0-9._\-/*+@]+$/.test(value);
}

function parsePlanOwnership(markdown) {
  if (markdown == null || typeof markdown !== "string") return null;

  const blocks = [];
  let block = null;
  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      if (!block) {
        block = [];
        blocks.push(block);
      }
      block.push(trimmed);
    } else {
      block = null;
    }
  }
  if (blocks.length === 0) return null;

  let sawQualifyingTable = false;
  const order = [];
  const byTask = new Map();

  for (const rows of blocks) {
    const cols = splitPipeRow(rows[0]).map((c) => c.toLowerCase());
    const taskIdx = cols.findIndex((c) => PLAN_OWNER_HEADER_CELLS.has(c));
    const filesIdx = cols.findIndex(
      (c, i) => i !== taskIdx && PLAN_FILES_HEADER_CELLS.has(c)
    );
    if (taskIdx < 0 || filesIdx < 0) continue;
    sawQualifyingTable = true;

    for (let i = 1; i < rows.length; i++) {
      const cells = splitPipeRow(rows[i]);

      if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;

      const taskId = stripCellEmphasis(cells[taskIdx]);
      if (!taskId) continue;

      const raw = (cells[filesIdx] || "").trim();
      const found = [];
      const ticked = raw.match(/`[^`]+`/g);
      if (ticked && ticked.length > 0) {
        for (const span of ticked) {
          const path = span.slice(1, -1).trim();
          if (path) found.push(path);
        }
      } else {
        const bare = stripCellEmphasis(raw);
        if (isPlausiblePath(bare)) found.push(bare);
      }

      if (!byTask.has(taskId)) {
        byTask.set(taskId, []);
        order.push(taskId);
      }
      const files = byTask.get(taskId);
      for (const path of found) {
        if (!files.includes(path)) files.push(path);
      }
    }
  }

  if (!sawQualifyingTable) return null;
  return { ownership: order.map((taskId) => ({ taskId, files: byTask.get(taskId) })) };
}

function validatePlanContract(tasks, ownership) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  const ownershipList = Array.isArray(ownership) ? ownership : [];
  const owned = new Set(ownershipList.map((o) => o.taskId));
  const known = new Set(taskList.map((t) => t.id));

  const problems = [];
  for (const t of taskList) {
    if (!owned.has(t.id)) {
      problems.push(
        `Task ${t.id} is in the PLAN task table but has no file-ownership manifest row`
      );
    }
  }
  for (const o of ownershipList) {
    if (!known.has(o.taskId)) {
      problems.push(
        `File-ownership manifest row ${o.taskId} names a task id that is not in the PLAN task table`
      );
    }
  }

  return problems.length === 0 ? { ok: true } : { ok: false, problems };
}

function pathsCollide(a, b) {
  if (a === b) return true;
  if (a.endsWith("/") && b.startsWith(a)) return true;
  if (b.endsWith("/") && a.startsWith(b)) return true;
  return false;
}

function planContractGateDetail(tasks, ownership, validation, waves) {
  const taskCount = Array.isArray(tasks) ? tasks.length : 0;
  if (ownership == null) {
    return `${taskCount} tasks, no file-ownership manifest (worktree exception path)`;
  }
  if (validation && validation.ok === false) {
    const problems = validation.problems || [];
    return (
      `${taskCount} tasks, ${ownership.length} manifest rows, ` +
      `${problems.length} contract problem(s): ${problems.join("; ")}`
    );
  }
  const waveCount = Array.isArray(waves) ? waves.length : 0;
  return `${taskCount} tasks, ${ownership.length} manifest rows, ${waveCount} waves`;
}

const VALID_VERDICTS = Object.freeze([
  "Approved",
  "Approved with minor changes",
  "Needs revision",
]);

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

  let nextNonEmpty = null;
  for (let j = verdictLineIndex + 1; j < lines.length; j++) {
    const candidate = lines[j].trim();
    if (candidate === "") continue;
    if (APPROVAL_ANCHOR_LINE.test(candidate)) continue;
    nextNonEmpty = candidate;
    break;
  }

  if (nextNonEmpty === null) {
    return { verdict: rawVerdict, high: 0, medium: 0, low: 0 };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(nextNonEmpty);
  } catch {
    log(
      `WARNING: reviewer ${skillName} returned no VERDICT — treating as Needs revision`
    );
    return fallback;
  }

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

      break;
    }
  }

  log(
    "WARNING: DECISIONS_WARRANTED field absent or malformed — defaulting to true"
  );
  return true;
}

function scanLines(text, visit) {
  const lines = String(text ?? "").split("\n");
  let fenceChar = null; 
  let fenceLen = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceChar === null) {
      if (m) {
        fenceChar = m[1][0];
        fenceLen = m[1].length;
      } 
      else visit(line, i);
    } else if (m && m[1][0] === fenceChar && m[1].length >= fenceLen) {
      fenceChar = null;
      fenceLen = 0; 
    }

  }
}

function canonicaliseForDigest(text) {
  const lf = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n"); 
  return lf.replace(/\n*$/, "\n"); 
}

function utf8Bytes(text) {
  const s = String(text ?? "");
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const cp = s.codePointAt(i);
    if (cp > 0xffff) i++; 
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

function rotr32(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function add32(a, b) {
  return (a + b) >>> 0;
}

function sha256Hex(text) {
  const bytes = utf8Bytes(canonicaliseForDigest(text));

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

function approvalHashOf(text) {
  return `sha256:${sha256Hex(text)}`;
}

const FORCE_PHASE_TOKENS = Object.freeze(["R", "F", "T", "P", "D", "PR"]);

const APPROVAL_ANCHOR_LINE = /^(APPROVAL-HASH|REVIEWED-COMMIT):/;

const APPROVAL_HASH_VALUE_RE = /^sha256:[0-9a-f]{64}$/;

const REVIEWED_COMMIT_VALUE_RE = /^[0-9a-f]{7,40}$/;

const COMMIT_UNAVAILABLE = "unavailable";

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

function extractFileVerdict(fileText, roleSlug) {
  const text = String(fileText ?? "");
  const lines = text.split("\n");

  let verdictIndex = -1;
  scanLines(text, (line, index) => {
    if (line.trim().startsWith("VERDICT: ")) verdictIndex = index;
  });
  if (verdictIndex === -1) return { ok: false, reason: "no_verdict_line" };

  const section = lines.slice(verdictIndex).join("\n");

  return { ok: true, ...parseVerdict(section, roleSlug) };
}

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

const RECOMMENDATION_MAX_BYTES = 4000;

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

function parseForcePhases(raw) {
  if (raw == null || String(raw).trim() === "") return { ok: true, phases: new Set() };
  const tokens = String(raw).split(/[,\s]+/).filter(Boolean);
  const valid = FORCE_PHASE_TOKENS; 
  const bad = tokens.filter((t) => t !== "all" && !valid.includes(t));
  if (bad.length) return { ok: false, badTokens: bad };
  return { ok: true, phases: tokens.includes("all") ? new Set(valid) : new Set(tokens) };
}

function isStale(recordedHash, documentBytes) {
  return isStaleByHash(recordedHash, approvalHashOf(documentBytes));
}

function isStaleByHash(recordedHash, documentHash) {
  if (typeof recordedHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(recordedHash))
    return "UNEVALUABLE";
  return documentHash === recordedHash ? "FRESH" : "STALE";
}

const REQUIRED_HEADINGS = Object.freeze({
  REQ: Object.freeze([
    { title: "Problem / Context", alts: ["Context", "Problem", "Background"] },
    { title: "Goals", alts: ["Objectives"] },
    { title: "Non-Goals", alts: ["Scope", "Out of scope"] },
    { title: "Constraints", alts: [] },
    { title: "Acceptance Criteria", alts: ["Acceptance"] },
    { title: "Risks", alts: [] },
    { title: "Obligations", alts: ["Open Questions", "Assumptions"] },
  ]),
  FSPEC: Object.freeze([
    { title: "Overview", alts: ["Scope", "Summary", "Context"] },
    { title: "Linked Requirements", alts: [] },
    { title: "Behavioral Flow", alts: [] },
    { title: "Business Rules", alts: [] },
    { title: "Edge Cases and Error Scenarios", alts: [] },
    { title: "Acceptance Tests", alts: [] },
    { title: "Open Questions", alts: ["Obligations", "Assumptions"] },
  ]),
  TSPEC: Object.freeze([
    { title: "Overview", alts: ["Scope", "Summary", "Context", "Introduction"] },
    { title: "Architecture", alts: ["Design"] },
    { title: "Interfaces", alts: ["Interface", "Protocol", "Protocols", "Seams", "APIs", "API"] },
    { title: "Data Model", alts: ["Types", "State", "Schema", "Data structures"] },
    { title: "Test Strategy", alts: ["Testing", "Test plan", "Verification"] },
    { title: "Open Questions", alts: ["Obligations", "Assumptions", "Risks", "Decisions"] },
  ]),
  PLAN: Object.freeze([
    { title: "Overview", alts: ["Scope", "Summary"] },
    { title: "Batches", alts: ["Tasks", "Work breakdown"] },
    { title: "Dependencies", alts: ["Ordering"] },
    { title: "Verification", alts: ["Testing", "Validation"] },
  ]),
  PROPERTIES: Object.freeze([
    { title: "Overview", alts: ["Scope", "Summary"] },
    { title: "Properties", alts: ["Invariants"] },
    { title: "Oracles", alts: ["Checks"] },
    { title: "Fixtures", alts: ["Generators", "Test data"] },
  ]),
  DECISIONS: Object.freeze([
    { title: "Context", alts: ["Background"] },
    { title: "Options Considered", alts: ["Options", "Alternatives"] },
    { title: "Decision", alts: ["Chosen", "Resolution"] },
    { title: "Consequences", alts: ["Tradeoffs", "Implications"] },
  ]),
});

const LEARNINGS_SECTIONS = Object.freeze([
  "Non-Convergences",
  "Cross-Feature Patterns",
  "Rejected Proposals",
  "Process Learnings",
  "Open Items for Consolidation",
]);

const HARVESTED_FROM_ROW = /^\s*\|\s*harvested\s+from\s*\|/i;

const HARVESTED_FROM_CLAUSE = '(the metadata table\'s "Harvested from" row)';

function hasHarvestedFromRow(fileText) {
  let found = false;
  scanLines(fileText, (line) => {
    if (!found && HARVESTED_FROM_ROW.test(line)) found = true;
  });
  return found;
}

const TOP_LEVEL_HEADING = /^ {0,3}##(?!#)\s+(.+?)\s*$/;

function normaliseHeadingTitle(raw) {
  return String(raw ?? "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function headingContains(hay, term) {
  if (!term) return false;
  const isWordChar = (c) => c !== "" && /[a-z0-9-]/.test(c);
  for (let from = 0; ; ) {
    const at = hay.indexOf(term, from);
    if (at === -1) return false;
    const before = at === 0 ? "" : hay[at - 1];
    const after = at + term.length >= hay.length ? "" : hay[at + term.length];
    if (!isWordChar(before) && !isWordChar(after)) return true;
    from = at + 1;
  }
}

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

function isEmptyBody(bodyLines) {
  const stripped = bodyLines.join("\n").replace(/<!--[\s\S]*?-->/g, "");
  const meaningful = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (meaningful.length === 0) return true;
  return meaningful.every((l) => /^[_*`~\s]*(?:TBD|TODO)[_*`~\s]*$/i.test(l));
}

function isCatalogueVerdictLine(line) {
  const trimmed = String(line ?? "").trim();
  if (!trimmed.startsWith("VERDICT: ")) return false;
  return VALID_VERDICTS.includes(trimmed.slice("VERDICT: ".length).trim());
}

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

function isComplete(artifactClass, docType, fileText) {
  const sections = topLevelSections(fileText);
  const T = sections.length;
  const S = sections.filter((s) => !isEmptyBody(s.body)).length;
  const done = (complete, missing) => ({ complete, missing, T, S });

  const rowTerms = (row) => {
    const terms = [normaliseHeadingTitle(row.title)];
    for (const a of row.alts || (row.alt ? [row.alt] : [])) terms.push(normaliseHeadingTitle(a));
    return terms.filter(Boolean);
  };
  const shortfall = (rows) => {
    const satisfied = new Set();
    for (const s of sections) {
      if (isEmptyBody(s.body)) continue;
      for (const row of rows) {
        const matches = row.prefix
          ? s.normalised.startsWith(normaliseHeadingTitle(row.title))
          : rowTerms(row).some((t) => headingContains(s.normalised, t));
        if (matches) satisfied.add(row.title);
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

    const scoped = /scope|cross-feature/i.test(String(fileText ?? ""));
    const findings = sections.some((s) => s.normalised.includes("findings") && !isEmptyBody(s.body));
    return done(scoped && findings, []);
  }

  if (artifactClass === "LEARNINGS") {

    const numbered = new Map();
    for (const s of sections) {
      const m = /^\s*(\d+)[.)]/.exec(String(s.title ?? ""));
      if (!m) continue;
      const n = Number(m[1]);
      if (n < 1 || n > LEARNINGS_SECTIONS.length) continue;
      if (!numbered.has(n) && !isEmptyBody(s.body)) numbered.set(n, s.title);
    }
    const missing = LEARNINGS_SECTIONS.filter((_, i) => !numbered.has(i + 1));

    if (!hasHarvestedFromRow(fileText)) missing.push(HARVESTED_FROM_CLAUSE);
    return done(missing.length === 0, missing);
  }

  return done(false, []);
}

function isPass(verdict) {
  return verdict === "Approved" || verdict === "Approved with minor changes";
}

function isPassResult(parsed) {
  if (!parsed) return false;
  if (isPass(parsed.verdict)) return true;
  return parsed.malformed !== true && parsed.high === 0;
}

function selectMode({ dispatchKind, docType, present, reviewFiles, startIndex }) {

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

  if (rounds.size === 0) {
    return {
      mode: "authoring",
      round: null,
      reason: `no review round on the branch for ${docType}`,
    };
  }

  const files = reviewFiles && typeof reviewFiles.get === "function" ? reviewFiles : new Map();
  const dualApproved = (round) =>
    roles.length > 0 &&
    roles.every((role) => {
      const rec = files.get(`${role}:${round}`);
      return !!rec && rec.verdictReadable === true && isPassResult(rec);
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

function isTerminal(mode, response, artifactClass, docType, after, entryMissing) {
  return terminalFrom(mode, response, artifactClass, isComplete(artifactClass, docType, after), entryMissing);
}

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

  if (loopResult.halted === true) {
    recordPhase(phaseId, phaseLabel, "❌", loopResult.haltDetail);
    throw haltError(loopResult.haltDetail);
  }

  let reviewerDetail = "";
  if (Array.isArray(loopResult.lastResults) && loopResult.lastResults.length > 0) {
    const details = loopResult.lastResults
      .filter((r) => !isPassResult(r))
      .map((r) => `${r.skill} (high:${r.high}, medium:${r.medium}, low:${r.low})`)
      .join("; ");
    reviewerDetail = details ? ` — non-approving reviewers: [${details}]` : "";
  }

  const postmortemPath = `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md`;

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

  const written = loopResult.postmortemWritten === true;

  const reason = written
    ? `Phase ${phaseId} did not converge across ${window}${reviewerDetail}. ` +
      `Post-mortem written at ${postmortemPath}. ` +

      `Recover: resolve it per AC-2.4, then set the feature's row back to pending.`
    : `Phase ${phaseId} did not converge across ${window}${reviewerDetail}. ` +
      `Post-mortem write FAILED — no artifact at ${postmortemPath}.`;

  throw haltError(reason, {
    haltPhase: phaseId,
    postmortemPath,
    postmortemStatus: written ? "written" : "write_failed",
  });
}

const NO_SESSION_AGENT = null;

function sessionScope(docType, phase) {
  return String(docType || phase);
}

function reviewerSessionKey(feature, docType, phase, skill) {
  return `${feature}/${sessionScope(docType, phase)}/reviewer/${reviewerRoleSlug(skill) || skill}`;
}

function authorSessionKey(feature, docType, phase) {
  return `${feature}/${sessionScope(docType, phase)}/author`;
}

function sessionBoundAgent({ _sessionAgent = NO_SESSION_AGENT, sessionKey, _agent, _log }) {
  if (typeof _sessionAgent !== "function") return _agent;
  const emit = typeof _log === "function" ? _log : () => {};
  return async (skill, prompt, opts) => {
    let reply;
    try {
      reply = await _sessionAgent(sessionKey, skill, prompt, opts);
    } catch (err) {
      emit(
        `Session transport failed for ${sessionKey} (${skill}) — falling back to a fresh dispatch: ` +
          `${(err && err.message) || err}.`
      );
      return _agent(skill, prompt, opts);
    }
    if (reply == null) {
      emit(
        `Session transport declined ${sessionKey} (${skill}) — falling back to a fresh dispatch.`
      );
      return _agent(skill, prompt, opts);
    }
    return reply;
  };
}

const ERRATUM_DOC_TYPES = Object.freeze([
  "REQ",
  "FSPEC",
  "TSPEC",
  "DECISIONS",
  "PLAN",
  "PROPERTIES",
]);

const ERRATUM_PHASE_BY_DOC_TYPE = Object.freeze({
  REQ: "R",
  FSPEC: "F",
  TSPEC: "T",
  DECISIONS: "D",
  PLAN: "P",
  PROPERTIES: "PR",
});

const MAX_ERRATUM_ROUNDS_PER_DOC = 1;

const ERRATUM_LINE_RE = /^\s*(?:[-*]\s+)?ERRATUM:\s*([^:]+?)\s*:\s*(\S.*?)\s*$/;

function parseErrata(text, onIgnored) {
  const found = [];
  const seen = new Set();
  scanLines(String(text ?? ""), (line) => {
    const m = ERRATUM_LINE_RE.exec(line);
    if (!m) return;
    const docType = m[1];
    const item = m[2];
    if (!ERRATUM_DOC_TYPES.includes(docType)) {
      if (typeof onIgnored === "function") onIgnored(docType, item);
      return;
    }
    const key = `${docType} ${item}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ docType, item });
  });
  return found;
}

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

  _probeDoc = NO_PROBE,
  _probeReviewState = NO_PROBE,

  _sessionAgent = NO_SESSION_AGENT,
  _log,
  _git,
}) {

  const roundDocType = docType === undefined ? docTypeFromPath(doc) : docType;
  const reviewFileType = roundDocType || "REVIEW";
  const emit = typeof _log === "function" ? _log : log;

  const errata = [];
  const erratumSeen = new Set();
  const collectErrata = (text, source) => {
    const parsed = parseErrata(text, (badType) =>
      emit(
        `Erratum ignored (${source}, phase ${phase}): "${badType}" is not one of ` +
          `${ERRATUM_DOC_TYPES.join(", ")}.`
      )
    );
    for (const entry of parsed) {
      const key = `${entry.docType} ${entry.item} ${source}`;
      if (erratumSeen.has(key)) continue;
      erratumSeen.add(key);
      errata.push({ docType: entry.docType, item: entry.item, source });
    }
  };

  const wrapped = (skill, basePrompt, targetPath, dispatchKind, sessionKey) =>
    dispatchAndVerify({
      skill,
      basePrompt,
      targetPath,
      docType: roundDocType,
      feature,
      dispatchKind,
      phaseId: phase,
      _agent: sessionBoundAgent({ _sessionAgent, sessionKey, _agent, _log: emit }),
      _readFile,
      _listFiles,
      _probeDoc,
      _probeReviewState,
      _log: emit,
      _git,
    });

  let haltedReturn = null;
  const runWrapped = async (skill, basePrompt, targetPath, dispatchKind, sessionKey) => {
    if (haltedReturn) return null;
    try {
      const episode = await wrapped(skill, basePrompt, targetPath, dispatchKind, sessionKey);
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
          errata: errata.slice(),
        };
        return null;
      }
      throw err;
    }
  };

  const reviewTargetPath = (skill, round) => crossReviewPath(feature, skill, reviewFileType, round);

  await verifyFeatureBranch({
    feature,
    context: `phase ${phase}'s review round`,
    _git,
    _log: emit,
  });

  if (phase !== "CR") {
    const checkResult = await _checkFile(doc);
    if (!checkResult.ok) {
      throw haltError(
        `Error: ${doc} does not exist — cannot enter reviewLoop for phase ${phase}`
      );
    }
  }

  let result1, result2;

  let lastOptimizerResult = null;

  let lastTrailerReason = null;

  while (true) {

    if (iteration > endIndex) {

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
        errata: errata.slice(),
      };
    }

    if (iteration === 1) {
      log("Starting iteration 1");
    } else {
      log(`Resuming from iteration ${iteration}`);
    }

    let anchorHash = null;
    let anchorCommit = "unavailable";
    if (phase !== "CR") {

      const probe = await probeDocument(_probeDoc, doc, roundDocType);
      anchorHash = (probe ? probe.hash : await _hashFile(doc)) ?? null; 
      anchorCommit = await headCommitSha(_git); 
    }

    const reviewerPrompt1 = reviewerPrompt(doc, phase, feature, iteration, reviewers[0], reviewFileType);
    const reviewerPrompt2 = reviewerPrompt(doc, phase, feature, iteration, reviewers[1], reviewFileType);

    const [r1, r2] = await _parallel([
      runWrapped(
        reviewers[0],
        reviewerPrompt1,
        reviewTargetPath(reviewers[0], iteration),
        "review",
        reviewerSessionKey(feature, roundDocType, phase, reviewers[0])
      ),
      runWrapped(
        reviewers[1],
        reviewerPrompt2,
        reviewTargetPath(reviewers[1], iteration),
        "review",
        reviewerSessionKey(feature, roundDocType, phase, reviewers[1])
      ),
    ]);
    if (haltedReturn) return haltedReturn;
    result1 = r1 && r1.response;
    result2 = r2 && r2.response;

    collectErrata(result1, reviewers[0]);
    collectErrata(result2, reviewers[1]);

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

    const gatePass = isPassResult(verdict1) && isPassResult(verdict2);

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

      return {
        converged: true,
        iterations: iteration,
        lastOptimizerResult,
        trailerReason: lastTrailerReason,
        errata: errata.slice(),
      };
    }

    const optPrompt = optimizerPrompt(doc, phase, feature, iteration, reviewers, reviewFileType);

    const optEpisode = await runWrapped(
      optimizer,
      optPrompt,
      doc,
      "authoring",
      authorSessionKey(feature, roundDocType, phase)
    );
    if (haltedReturn) return haltedReturn;
    const optimizerResult = optEpisode && optEpisode.response;
    lastOptimizerResult = optimizerResult;

    collectErrata(optimizerResult, optimizer);

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

    if (optEpisode && optEpisode.wroteBytes === false && optEpisode.measuredT > 0) {
      throw haltError(
        `Error: optimizer ${optimizer} completed without modifying ${doc} in phase ${phase}, iteration ${iteration} — re-reviewing an unchanged document cannot converge; pipeline halted.`
      );
    }

    iteration += 1;
  }
}

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

function approvalAnchorPreCount(fileText) {
  const found = [];
  scanLines(String(fileText ?? ""), (line) => {
    const m = /^APPROVAL-HASH:\s*(\S+)\s*$/.exec(line);
    if (m) found.push(m[1]);
  });
  return found;
}

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
      if (existing[0] === hash) continue; 
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
    await _git(["add", ...paths]); 
    await _git(["commit", "-m", `chore(pdlc): record approval anchors ${hash}`]);
  } catch {

  }
}

const MAP = {
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
};

const REVIEWER_ROLE_SLUGS = Object.freeze(Object.values(MAP));

function reviewerRoleSlug(skill) {
  return MAP[skill] || null;
}

function crossReviewPath(feature, skill, docType, round) {
  return `docs/${feature}/CROSS-REVIEW-${reviewerRoleSlug(skill) || skill}-${docType}-v${round}.md`;
}

function reviewerSkillForSlug(slug) {
  for (const skill of Object.keys(MAP)) {
    if (MAP[skill] === slug) return skill;
  }
  return null;
}

const CROSS_REVIEW_RE =
  /^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?:-v(?<n>[1-9][0-9]*))?\.md$/;

const CROSS_REVIEW_LOOSE_RE =
  /^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?<rest>.*)$/;

const CROSS_REVIEW_PREFIX = "CROSS-REVIEW-";

const REVIEW_DOC_TYPES = Object.freeze([
  "REQ",
  "FSPEC",
  "TSPEC",
  "PLAN",
  "PROPERTIES",
  "DECISIONS",
]);

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

  const loose = CROSS_REVIEW_LOOSE_RE.exec(name);
  if (!loose) return { ok: false, reason: "bad_role" }; 
  const rest = loose.groups.rest;

  if (/^-v[0-9]+\.md$/.test(rest)) return { ok: false, reason: "bad_round" };
  return { ok: false, reason: "trailing_junk" };
}

function deriveRoundWindow(basenames, docType) {
  const listing = Array.isArray(basenames) ? basenames : [];

  const unique = listing.filter((b, i) => listing.indexOf(b) === i);

  const present = new Map();
  const skipped = [];

  const roundOneForms = new Map();

  for (const basename of unique) {
    const result = parseReviewFilename(basename);
    if (!result.ok) {
      skipped.push({ basename, reason: result.reason });
      continue;
    }

    if (result.docType !== docType) continue;

    const rounds = present.get(result.role) || [];
    if (!rounds.includes(result.round)) rounds.push(result.round);
    present.set(result.role, rounds);

    if (result.round === 1) {
      const forms = roundOneForms.get(result.role) || { plain: false, v1: false };
      if (result.suffixed) forms.v1 = true;
      else forms.plain = true;
      roundOneForms.set(result.role, forms);

      if (forms.plain && forms.v1) {
        return {
          ok: false,
          reason: "malformed_round_one_duplicate",
          role: result.role,
        };
      }
    }
  }

  const indices = [];
  for (const rounds of present.values()) for (const round of rounds) indices.push(round);
  const startIndex = indices.length ? Math.max(...indices) + 1 : 1;
  const endIndex = windowEnd(startIndex);

  return { ok: true, startIndex, endIndex, present, skipped };
}

function windowEnd(startIndex) {
  return startIndex + MAX_REVIEW_ROUNDS - 1;
}

function docTypeFromPath(path) {
  const m = /\/([A-Z]+)-[^/]+\.md$/.exec(String(path ?? ""));
  return m ? m[1] : null;
}

function artifactClassOf(path) {
  const name = String(path ?? "");
  if (/\/CROSS-REVIEW-[^/]*$/.test(name)) return "cross-review";
  if (/\/CODE_REVIEW-[^/]*$/.test(name)) return "code-review";
  if (/\/LEARNINGS-[^/]*$/.test(name)) return "LEARNINGS";
  return "spec";
}

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

const PACING_CONTRACT_CLAUSE = [
  "Pacing contract (H-3): lay down the skeleton first, then write ONE top-level",
  "section per edit, keep every single write under 12,000 bytes, and commit after",
  "each section. A monolithic write is killed by the 180 s stall watchdog and loses",
  "everything it had not yet flushed.",
].join(" ");

function branchPinClause(feature) {
  const branch = featureBranchName(feature);
  return (
    `All commits for this task must land on branch ${branch}. ` +
    "Immediately before each commit run `git rev-parse --abbrev-ref HEAD`; if it prints " +
    "anything else — especially the default branch — STOP and report instead of committing. " +
    "Do not run `git checkout` yourself; the orchestrator has already placed the tree on the branch."
  );
}

function skeletonClause() {
  return (
    "This artifact is not on disk yet. Begin by laying out its top-level headings " +
    "as a skeleton, then fill them one at a time under the pacing contract above."
  );
}

function resumeClause({ T, S, firstUnwritten, targetPath }) {
  return [
    `RESUMED: ${targetPath} already carries partial content`,
    `(${S} of ${T} top-level sections carry a body).`,
    "Read the document on disk first and do NOT rewrite what is already written.",
    `The first unwritten section is ${firstUnwritten}.`,
    "Continue from there, one section per write, under the pacing contract above.",
  ].join(" ");
}

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

      high: parsedVerdict.ok ? parsedVerdict.high : null,
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

async function checkPostmortem({ phase, feature, _readFile }) {
  const path = `docs/${feature}/POSTMORTEM-${phase}-${feature}.md`;
  const text = await _readFile(path);
  if (text == null || String(text).trim() === "") return { status: "none", path };

  const marker = parseResolvedMarker(text);
  if (marker.ok && marker.resolved) return { status: "resolved", path };
  return { status: "unresolved", path, recommendation: extractRecommendation(text) };
}

const NO_PROBE = null;

const NO_RUN_COMMAND = null;

async function probeDocument(probe, path, docType) {
  if (typeof probe !== "function") return null;
  try {
    const result = await probe(path, docType);
    return result && result.ok === true ? result : null;
  } catch {
    return null;
  }
}

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

const POSTMORTEM_STATUSES = Object.freeze(["none", "resolved", "unresolved"]);

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

function noApprovalRecord(candidate, unevaluable = []) {
  return { approving: false, candidate, hash: null, unevaluable, tier1Empty: false };
}

function tier1ApprovalRecord({ reviewers, startIndex, reviewFiles }) {
  const candidate = startIndex - 1;
  if (candidate < 1) return noApprovalRecord(candidate);

  const roles = reviewers.map((skill) => reviewerRoleSlug(skill) || skill);
  const records = roles.map((role) => reviewFiles.get(`${role}:${candidate}`) || null);

  if (records.every((r) => r === null)) {
    return { ...noApprovalRecord(candidate), tier1Empty: true };
  }

  if (records.some((r) => r === null)) return noApprovalRecord(candidate);

  const unevaluable = records.filter((r) => !r.anchorHash).map((r) => r.path);
  const verdictsPass = records.every((r) => r.verdictReadable && isPassResult(r));
  if (!verdictsPass || unevaluable.length) return noApprovalRecord(candidate, unevaluable);

  const hashes = records.map((r) => r.anchorHash);
  if (!hashes.every((h) => h === hashes[0])) {

    return noApprovalRecord(candidate, records.map((r) => r.path));
  }

  return { approving: true, candidate, hash: hashes[0], unevaluable: [], tier1Empty: false };
}

const APPROVAL_RECORD_HEADING = /^\s*##\s+\d*\.?\s*Approval Record\s*$/;

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
    if (cells.length < 8) return; 
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

function authoringHaltError(message, trailerReason) {
  const err = haltError(message);
  err.isAuthoringHalt = true;
  err.trailerReason = trailerReason ?? null;
  return err;
}

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

  let entryMissing = null;
  let lastMeasured = null;

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

    const progressed =
      before.probed === after.probed ? before.identity !== after.identity : true;
    if (progressed) wroteBytes = true;
    before = after;

    if (verdict.terminal) break;

    if (measured.T === 0 && !progressed) break;

    consecutiveNoProgress = progressed ? 0 : consecutiveNoProgress + 1;
    const sections = `(${measured.S} of ${measured.T} sections complete)`;
    const trailerNote = lastTrailerReason ? `; last trailer outcome: ${lastTrailerReason}` : "";

    const stillMissing = Array.isArray(measured.missing) ? measured.missing : [];
    const gateNote = stillMissing.length
      ? `; gate still requires: [${stillMissing.join(", ")}]; if the document substantively covers these, this is a heading-naming mismatch against isComplete's required headings, not a content gap`
      : "";

    if (consecutiveNoProgress >= MAX_AUTHORING_ATTEMPTS) {
      throw authoringHaltError(
        `Phase ${phaseId}: ${skill} made no progress across ${MAX_AUTHORING_ATTEMPTS} consecutive attempts on ${targetPath} ${sections}${gateNote}${trailerNote}.`,
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

    measuredT: lastMeasured ? lastMeasured.T : 0,
    trailerReason: lastTrailerReason ?? null,
  };
}

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

function groundingClause(phaseId) {
  const dispatch = PHASE_DISPATCH[phaseId];
  const entries = dispatch && Array.isArray(dispatch.grounding) ? dispatch.grounding : [];
  if (entries.length === 0) return "";
  return (
    `Ground every claim in code, not only in documents: verify claims against the actual ` +
    `repository state, and cite file:line for every claim you make about existing behavior.\n` +
    entries.map((entry) => `- ${entry}`).join("\n")
  );
}

const ORACLE_QUALITY_CLAUSE = [
  "When you review acceptance tests, properties, or unit tests, demand:",
  "- No implementation echoes: an expectation must never import or derive its expected value " +
    "from the code under test; expected values are literal transcriptions from the spec.",
  "- No absence-only oracles: every negative assertion (X does not happen) must be paired with " +
    "a positive assertion on the same path (what DOES happen instead).",
  "- Completeness by set-equality, not containment: enumerated contracts (row tables, " +
    "catalogues) need a set-equality check over the full enumeration, so a deleted case fails.",
].join("\n");

const REVIEW_CONVERGENCE_CLAUSE =
  "Convergence is the goal: judge only whether your own blocking findings are resolved and " +
  "whether the revision broke anything — a narrower scope of attention, not a lower standard. " +
  "Only High findings block approval; Medium and Low are recorded, not gating.";

const CONTINUING_AUTHOR_CLAUSE =
  "You are the continuing author of this document, not a fresh reader of it. " +
  "Decisions approved in earlier rounds are settled — do not re-litigate them, and do not " +
  "rewrite approved sections beyond what the findings actually require. " +
  "Address every High and Medium finding, use judgment on Low, and expand scope beyond them for " +
  "nothing else. " +
  "Before you finish, re-read your revision for cross-round inconsistencies it may have " +
  "introduced with decisions taken in earlier rounds, and fix any you find.";

const ERRATUM_PROTOCOL_CLAUSE =
  "If you find a defect in an UPSTREAM document — one this document derives from — do not edit " +
  "that document yourself, and do not fold the defect into your verdict as if it were a defect of " +
  "the document in front of you. Emit one line per item in your final message, in exactly this form:\n" +
  "ERRATUM: {DOCTYPE}: {one-line item}\n" +
  `where {DOCTYPE} is one of ${ERRATUM_DOC_TYPES.join(", ")} (uppercase). The orchestrator routes ` +
  "each item to that document's author for a targeted versioned edit and to its approvers for a " +
  "delta confirmation.";

function reviewerPrompt(doc, phase, feature, iteration, reviewer, docType) {
  const base =
    `Review the document at ${doc} for phase ${phase} of feature ${feature}. This is iteration ${iteration}.\n` +
    branchPinClause(feature);

  const grounding = groundingClause(phase);
  const groundingPart = grounding ? `\n${grounding}` : "";

  const oraclePart = `\n${ORACLE_QUALITY_CLAUSE}\n${ERRATUM_PROTOCOL_CLAUSE}`;

  const type = docType || docTypeFromPath(doc) || "REVIEW";

  const targetFile = crossReviewPath(feature, reviewer, type, iteration);
  const targetClause =
    `Write your cross-review to exactly this path: ${targetFile}. ` +
    `Do not derive a different file type from the artifact under review — this phase's round ` +
    `history is keyed by that exact name, and a file outside it is not counted.`;

  if (iteration < 2) return `${base}${groundingPart}\n${targetClause}${oraclePart}`;

  const prev = iteration - 1;
  const role = reviewerRoleSlug(reviewer);
  const priorFile = role
    ? `${crossReviewPath(feature, reviewer, type, prev)} (your reviewer role is "${role}")`
    : `your own previous cross-review file for this document (docs/${feature}/CROSS-REVIEW-*-${type}-v${prev}.md — find your reviewer role's file for iteration v${prev})`;

  return (
    `${base}${groundingPart}\n` +
    `${REVIEW_CONVERGENCE_CLAUSE}\n` +
    `This is a re-review — follow the delta re-review protocol:\n` +
    `1. First read your own previous cross-review file: ${priorFile}.\n` +
    `2. Run \`git diff\` on ${doc} against the commit you last reviewed to see exactly what changed.\n` +
    `3. Verify each of your previous findings is resolved; scan ONLY the changed sections for new issues. ` +
    `Do not re-review unchanged sections you already approved.\n` +
    `4. The approval bar: any open High finding anywhere in the document — old or new — means Needs revision. ` +
    `Medium and Low findings do not block; file them and approve with minor changes.\n` +
    `${targetClause} End with the standard VERDICT trailer.` +
    oraclePart
  );
}

function optimizerPrompt(doc, phase, feature, iteration, reviewers = [], docType) {
  const base =
    `Address reviewer feedback on ${doc} for phase ${phase} of feature ${feature}. ` +
    `Iteration ${iteration} reviewers found issues. Update and commit.\n` +
    branchPinClause(feature);

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

  const grounding = groundingClause(phase);
  const groundingPart = grounding ? `\n${grounding}` : "";

  const continuing = `\n${CONTINUING_AUTHOR_CLAUSE}`;

  const erratum = `\n${ERRATUM_PROTOCOL_CLAUSE}`;

  if (phase === "T") {
    return `${base}${feedback}${groundingPart}${continuing}${erratum}\n${decisionsWarrantedTrailerRequirement()}`;
  }
  return `${base}${feedback}${groundingPart}${continuing}${erratum}`;
}

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

function decisionsWarrantedTrailerRequirement() {
  return (
    `End your final message with:\n` +
    `DECISIONS_WARRANTED: true if load-bearing architectural alternatives were weighed and rejected during the TSPEC review; ` +
    `DECISIONS_WARRANTED: false if this is a trivial feature with no real alternatives considered.`
  );
}

function creatorPrompt(phase, featureName, inputs) {
  const dispatch = PHASE_DISPATCH[phase];
  const grounding = groundingClause(phase);
  return (
    `Create ${dispatch.creatorOutputPath.replace(/\{feature\}/g, featureName)} for feature ${featureName}. ` +
    `Input documents: ${inputs.join(", ")}. Commit and push.\n` +
    branchPinClause(featureName) +
    (grounding ? `\n${grounding}` : "") +

    `\n${ERRATUM_PROTOCOL_CLAUSE}`
  );
}

function erratumAuthorPrompt({ feature, docType, docPath, itemLines, raisedIn }) {
  return (
    `ERRATUM ROUND for ${docPath} (feature ${feature}).\n` +
    `Phase ${raisedIn} raised the following errata against this ${docType}:\n` +
    `${itemLines}\n` +
    `This is an erratum round, NOT a rewrite. Apply a targeted, versioned edit that addresses ` +
    `exactly the items listed above and changes nothing else — do not restructure, do not ` +
    `re-litigate approved decisions, do not expand scope. If the document carries a version or ` +
    `changelog, bump it and record this erratum edit there. Commit.\n` +
    branchPinClause(feature)
  );
}

function erratumConfirmPrompt({ feature, docType, docPath, itemLines, round, reviewFile }) {
  return (
    `DELTA CONFIRMATION for ${docPath} (feature ${feature}).\n` +
    `You previously approved this ${docType}. It has just received a targeted erratum edit ` +
    `addressing these items:\n` +
    `${itemLines}\n` +
    `Do not re-review the whole document. Read the items above and \`git diff\` the erratum edit ` +
    `to ${docPath}, then answer one question: does the delta resolve those items without breaking ` +
    `anything you previously approved?\n` +
    `Write your confirmation as the next cross-review round for this document type — ` +
    `${reviewFile} (round v${round}) — and end it with the standard VERDICT trailer.\n` +
    branchPinClause(feature)
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

function waveImplementPrompt(task, featureName) {
  const owned = Array.isArray(task.files) ? task.files : [];
  const ownedList = owned.length > 0 ? owned.join(", ") : "(none listed)";
  return (
    `Implement task ${task.id}: ${task.description}\n` +
    `Feature: ${featureName}\n` +
    `TSPEC: docs/${featureName}/TSPEC-${featureName}.md\n` +
    `PROPERTIES: docs/${featureName}/PROPERTIES-${featureName}.md\n` +
    `Dependencies completed: ${task.dependencies.join(", ") || "none"}\n` +
    `Follow TDD: write the failing test first, then the minimum implementation.\n` +
    `Run only your task's targeted tests — do not run the full suite; the orchestrator runs it.\n` +
    `You own EXACTLY these files: ${ownedList}. Do not create or modify any other file.\n` +
    `Do NOT run git add or git commit — the orchestrator verifies your work and commits it.\n` +

    `PACING (hard runtime constraint): you are killed after 180 seconds without a tool call. ` +
    `Never compose one large write — start each file small and extend it in increments of at ` +
    `most 8,000 bytes per Write/Edit, interleaving verification commands. If a single edit ` +
    `would be long, split it into several smaller edits.\n` +
    `Report a short summary of what you changed.\n` +
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

function advisoryDistilPrompt(featureName) {
  return (
    `ADVISORY distil for feature ${featureName}:\n` +
    `1. Read docs/${featureName}/ADVISORY-${featureName}.md.\n` +
    `2. Append a summary of its entries to docs/${featureName}/LEARNINGS-${featureName}.md.\n` +
    `3. Do NOT delete ADVISORY-${featureName}.md yourself — the pipeline deletes it through the ` +
    `guarded channel after this dispatch returns.\n` +
    branchPinClause(featureName)
  );
}

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

async function checkPrCi(prUrl, { execFn } = {}) {
  const { execSync: realExecSync } = await Promise.reject(new Error("Node module " + "child_process" + " is unavailable in the workflow runtime; this seam must be injected"));
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

    if (check.status.toUpperCase() !== "COMPLETED") return "pending";
    const conclusion = (check.conclusion || "").toUpperCase();
    if (FAILURE.has(conclusion)) return "failure";
    if (SUCCESS.has(conclusion)) return "success";
    return "other";
  }

  if (check && typeof check.state === "string") {

    const st = check.state.toUpperCase();
    if (st === "PENDING" || st === "EXPECTED") return "pending";
    if (st === "SUCCESS") return "success";
    if (st === "FAILURE" || st === "ERROR") return "failure";
    return "other";
  }

  return "other";
}

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

function dodVerifyPrompt(featureName, version) {

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

async function rebaseOntoDefault({ feature, _agent = agent, _log = log }) {
  _log(`Rebasing feat-${feature} onto the latest default branch`);
  const result = await _agent("ship-pr", rebasePrompt(feature));
  return parseRebaseStatus(result);
}

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

    _log(`Dispatching remediation for CODE_REVIEW-${feature}-v${iteration}`);
    await _agent("se-implement", dodRemediatePrompt(feature, iteration));
  }

  return { passed: false, iterations: maxIterations };
}

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
  _runAdvisorySeam = async () => ({ outcome: "escalated" }),
  _advisoryRecord = () => {},
}) {

  const prResult = await _agent("ship-pr", createPrPrompt(feature));

  const prUrl = parsePrUrl(prResult);
  if (!prUrl) {
    throw haltError(
      `Error: Phase PUB — PR creation failed for feature ${feature} (no PR_URL returned)`
    );
  }
  _log(`PR raised: ${prUrl}`);

  const start = _now();
  let completionStart = null;
  while (true) {
    const status = await _checkCi(prUrl);

    if (status === "passed") {
      _log(`GHA checks passed for PR ${prUrl}`);
      return { prUrl, ciStatus: "passed", noChecks: false };
    }
    if (status === "failed") {

      const a5 = await _runAdvisorySeam({ seam: "A5", feature, prUrl });
      _advisoryRecord(a5);

      if (a5 && a5.outcome !== "escalated" && a5.model !== undefined) {
        continue;
      }
      throw haltError(`Error: Phase PUB — GHA checks failed for PR ${prUrl}`);
    }
    if (status === "pending" && completionStart === null) {

      completionStart = _now();
    }

    if (completionStart !== null) {

      if (_now() - completionStart >= completionTimeoutMs) {

        throw haltError(
          `Error: Phase PUB — GHA checks did not complete within ` +
            `${Math.round(completionTimeoutMs / 60000)} minutes for PR ${prUrl}`,
          { completionCap: true }
        );
      }
    } else if (_now() - start >= noChecksTimeoutMs) {

      _log(
        `No GHA checks detected within ${Math.round(
          noChecksTimeoutMs / 60000
        )} minutes — assuming repo has no PR checks configured`
      );
      return { prUrl, ciStatus: "no-checks", noChecks: true };
    }

    await _sleep(pollIntervalMs);
  }
}

function evaluateBatchGate(results, batchIndex, batch) {
  const batchNum = batchIndex + 1;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const task = batch[i];

    if (result == null || (typeof result === "string" && result.trim() === "")) {
      throw haltError(
        `Error: Batch ${batchNum} agent returned empty result — treating as failure`
      );
    }

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

function evaluateWaveDispatch(results, waveIndex, wave) {
  const waveNum = waveIndex + 1;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const task = wave[i] || { id: "(unknown)" };

    if (result == null || (typeof result === "string" && result.trim() === "")) {
      throw haltError(
        `Error: Wave ${waveNum} agent returned empty result — treating as failure`
      );
    }

    if (String(result).toLowerCase().includes("non-zero exit")) {
      throw haltError(
        `Error: Wave ${waveNum} task ${task.id} failed — non-zero exit detected`
      );
    }
  }
}

function outputTail(output, n = 30) {
  const text = String(output == null ? "" : output).replace(/\s+$/, "");
  if (text === "") return "(no output)";
  return text.split("\n").slice(-n).join("\n");
}

function evaluateSingleAgentGate(agentResult, phaseName) {

  if (
    agentResult == null ||
    (typeof agentResult === "string" && agentResult.trim() === "")
  ) {
    return {
      passed: false,
      reason: `Error: Phase ${phaseName} agent returned empty result — treating as failure`,
    };
  }

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

function computeTopologicalBatches(tasks) {
  const batches = [];
  for (const ready of topologicalReadySets(tasks)) {

    for (let i = 0; i < ready.length; i += 5) {
      batches.push(ready.slice(i, i + 5));
    }
  }
  return batches;
}

function topologicalReadySets(tasks) {
  const completed = new Set();
  const layers = [];
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

    const inconsistent = ready.some(
      (t) => t.planBatch !== undefined && t.planBatch <= maxCompletedBatch
    );
    if (inconsistent) {
      log(
        "WARNING: PLAN batch labels inconsistent with dependency edges — re-deriving topological batches"
      );
    }

    ready.sort(
      (a, b) =>
        tasks.findIndex((t) => t.id === a.id) -
        tasks.findIndex((t) => t.id === b.id)
    );

    layers.push(ready);

    for (const t of ready) {
      completed.add(t.id);
      if (t.planBatch !== undefined && t.planBatch > maxCompletedBatch) {
        maxCompletedBatch = t.planBatch;
      }
    }
  }

  return layers;
}

function computeWaves(tasks, ownership) {
  if (ownership == null) {
    return computeTopologicalBatches(tasks).map((batch) =>
      batch.map((t) => ({ ...t, files: null }))
    );
  }

  const filesById = new Map();
  for (const row of ownership) filesById.set(row.taskId, row.files || []);

  const waves = [];
  for (const ready of topologicalReadySets(tasks)) {
    const groups = [];
    let group = null;
    let groupFiles = [];

    for (const t of ready) {
      const files = filesById.has(t.id) ? filesById.get(t.id) : null;
      const owned = files || [];
      const collides =
        group !== null &&
        owned.some((f) => groupFiles.some((g) => pathsCollide(f, g)));

      if (group === null || collides) {
        group = [];
        groupFiles = [];
        groups.push(group);
      }
      group.push({ ...t, files });
      for (const f of owned) groupFiles.push(f);
    }

    for (const g of groups) {
      for (let i = 0; i < g.length; i += 5) waves.push(g.slice(i, i + 5));
    }
  }

  return waves;
}

const UNSKIP_TEST_FILE_RE = /\.(test|spec)\.[cm]?[jt]sx?$/;

function maskNonCode(source) {
  if (typeof source !== "string") return "";
  const n = source.length;
  const out = new Array(n);
  const blank = (i) => {
    out[i] = source[i] === "\n" ? "\n" : " ";
  };

  let prev = "";
  let i = 0;

  while (i < n) {
    const c = source[i];
    const c2 = i + 1 < n ? source[i + 1] : "";

    if (c === "/" && c2 === "/") {
      while (i < n && source[i] !== "\n") blank(i++);
      continue;
    }
    if (c === "/" && c2 === "*") {
      blank(i++);
      blank(i++);
      while (i < n) {
        if (source[i] === "*" && source[i + 1] === "/") {
          blank(i++);
          blank(i++);
          break;
        }
        blank(i++);
      }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      blank(i++);
      while (i < n) {
        const d = source[i];
        if (d === "\\") {
          blank(i++);
          if (i < n) blank(i++);
          continue;
        }
        blank(i++);
        if (d === c) break;
      }

      prev = '"';
      continue;
    }
    if (c === "/" && regexOpensAfter(prev)) {
      const end = regexLiteralEnd(source, i);
      if (end > i) {
        while (i < end) blank(i++);
        prev = "/";
        continue;
      }
    }

    out[i] = c;
    if (!/\s/.test(c)) prev = c;
    i++;
  }

  return out.join("");
}

function regexOpensAfter(prev) {
  return prev === "" || "([{;,=:!&|?+-*%^~<>".includes(prev);
}

function regexLiteralEnd(source, start) {
  let i = start + 1;
  let inClass = false;
  while (i < source.length) {
    const c = source[i];
    if (c === "\n") return -1;
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    else if (c === "/" && !inClass) {
      i++;
      while (i < source.length && /[a-z]/.test(source[i])) i++;
      return i;
    }
    i++;
  }
  return -1;
}

function scanSkipTokens(source) {
  if (typeof source !== "string" || source === "") return [];
  const masked = maskNonCode(source);
  const found = [];
  const re = /\b(describe|test|it)\.skip\s*\(/g;
  let m;
  while ((m = re.exec(masked)) !== null) {
    const start = m.index;

    let j = start - 1;
    while (j >= 0 && (masked[j] === " " || masked[j] === "\t")) j--;
    if (j >= 0 && masked[j] !== "\n") continue;

    while (j >= 0 && /\s/.test(masked[j])) j--;
    const prev = j >= 0 ? masked[j] : "";
    if (prev !== "" && !";{})".includes(prev)) continue;

    found.push({
      line: source.slice(0, start).split("\n").length,
      token: `${m[1]}.skip`,
      title: firstStringArgument(source, start + m[0].length),
    });
  }
  return found;
}

function firstStringArgument(source, idx) {
  let i = idx;
  while (i < source.length && /\s/.test(source[i])) i++;
  const quote = source[i];
  if (quote !== '"' && quote !== "'" && quote !== "`") return "";
  let out = "";
  i++;
  while (i < source.length) {
    const c = source[i];
    if (c === "\\") {
      out += source[i + 1] || "";
      i += 2;
      continue;
    }
    if (c === quote) break;
    out += c;
    i++;
  }
  return out;
}

function titleNamesTask(title, id) {
  if (!title || !id) return false;
  const escaped = String(id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z0-9_-])${escaped}([^A-Za-z0-9_-]|$)`).test(title);
}

async function checkWaveUnskips({ waves, waveIndex, _readFile } = {}) {
  const violations = [];
  const notices = [];
  const scanned = [];
  const done = { violations, notices, scanned };

  if (!Array.isArray(waves) || waves.length === 0) {
    notices.push("no wave plan to scan");
    return done;
  }
  if (typeof _readFile !== "function") {
    notices.push("no _readFile transport — owned test files were not scanned");
    return done;
  }

  const allIds = [];
  const complete = new Set();
  const ownersByFile = new Map();
  for (let wi = 0; wi < waves.length; wi++) {
    for (const task of waves[wi] || []) {
      if (!task || !task.id) continue;
      if (!allIds.includes(task.id)) allIds.push(task.id);
      if (wi <= waveIndex) complete.add(task.id);
      for (const file of Array.isArray(task.files) ? task.files : []) {
        if (!ownersByFile.has(file)) ownersByFile.set(file, []);
        const owners = ownersByFile.get(file);
        if (!owners.includes(task.id)) owners.push(task.id);
      }
    }
  }

  const targets = [];
  for (let wi = 0; wi <= waveIndex && wi < waves.length; wi++) {
    for (const task of waves[wi] || []) {
      for (const file of Array.isArray(task && task.files) ? task.files : []) {
        if (UNSKIP_TEST_FILE_RE.test(file) && !targets.includes(file)) targets.push(file);
      }
    }
  }
  if (targets.length === 0) {
    notices.push("no completed task owns a test file in the PLAN's manifest — nothing to scan");
    return done;
  }

  for (const file of targets) {
    let text = null;
    try {
      text = await _readFile(file);
    } catch {
      text = null;
    }
    if (typeof text !== "string" || text === "") {
      notices.push(`${file} could not be read — not scanned`);
      continue;
    }
    scanned.push(file);

    for (const token of scanSkipTokens(text)) {
      const named = allIds.filter((id) => titleNamesTask(token.title, id));
      const owners = named.length > 0 ? named : ownersByFile.get(file) || [];

      if (owners.length === 0) continue;

      if (!owners.every((id) => complete.has(id))) continue;
      violations.push({ ...token, file, owners });
    }
  }

  return done;
}

function formatUnskipViolations(waveNum, violations) {
  const rows = violations.map(
    (v) =>
      `  ${v.file}:${v.line} ${v.token}(${v.title ? `"${v.title}"` : ""}) — ` +
      `owned by ${v.owners.join(", ")}, complete as of wave ${waveNum}`
  );
  return (
    `Error: Wave ${waveNum} un-skip guard failed — ${violations.length} skipped ` +
    `test block(s) are owned by a task that is already complete, so the wave's ` +
    `gate passed on tests that never ran:\n${rows.join("\n")}\n` +
    `Each 🟢 owner's first obligation is to remove the \`.skip\` wrapper on its own ` +
    `block. A block owned by a LATER wave's task is legitimate and does not appear here.`
  );
}

const WAVE_STATE_PATH = ".claude/pdlc-wave-state.json";

function computePlanHash(waves) {
  const canonical = (Array.isArray(waves) ? waves : [])
    .map((wave) =>
      (Array.isArray(wave) ? wave : [])
        .map((t) => {
          const id = t && t.id != null ? String(t.id) : "";
          const files = t && Array.isArray(t.files) ? t.files : [];
          return `${id}:${files.join(",")}`;
        })
        .join("|")
    )
    .join(";");

  let h = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function parseWaveLedger(text) {
  if (text == null) return { state: null, reason: null };

  const trimmed = String(text).trim();
  if (trimmed === "" || trimmed === "{}") return { state: null, reason: null };

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { state: null, reason: "it is not readable JSON" };
  }

  if (!isPlainObject(parsed)) return { state: null, reason: "it is not a JSON object" };

  const feature = parsed.feature;
  const planHash = parsed.planHash;
  const lastGreenWave = parsed.lastGreenWave;
  const wellFormed =
    typeof feature === "string" &&
    feature.trim() !== "" &&
    typeof planHash === "string" &&
    planHash.trim() !== "" &&
    Number.isInteger(lastGreenWave) &&
    lastGreenWave >= 1;

  if (!wellFormed) {
    return { state: null, reason: "its fields are not the shape this workflow writes" };
  }

  const head = typeof parsed.head === "string" && parsed.head.trim() !== "" ? parsed.head.trim() : null;

  return { state: { feature, planHash, lastGreenWave, head }, reason: null };
}

function formatWaveLedger(feature, planHash, lastGreenWave, head = null) {
  const record =
    typeof head === "string" && head.trim() !== ""
      ? { version: 1, feature, planHash, lastGreenWave, head: head.trim() }
      : { version: 1, feature, planHash, lastGreenWave };
  return `${JSON.stringify(record, null, 2)}\n`;
}

async function agent(skill, prompt, opts) {

  throw new Error("agent() not available outside Claude Code runtime");
}

async function parallel(promises) {
  return Promise.all(promises);
}

async function pipeline(label, fn) {
  return fn();
}

function phase(label) {

}

function log(message) {

  if (typeof console !== "undefined") {
    console.log("[orchestrate-dev]", message);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultReadFile(path) {
  try {
    return fs.readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function defaultHashFile(path) {
  try {
    return approvalHashOf(fs.readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

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

function defaultWriteFile(path, contents, { fsMod = fs } = {}) {
  fsMod.writeFileSync(path, contents, "utf8");
}

function defaultAppendFile(path, text, { fsMod = fs } = {}) {

  fsMod.mkdirSync(dirname(path), { recursive: true });
  fsMod.appendFileSync(path, text, "utf8");
}

async function defaultGit(argv, { execFn } = {}) {
  const { execFileSync: realExecFileSync } = await Promise.reject(new Error("Node module " + "child_process" + " is unavailable in the workflow runtime; this seam must be injected"));
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

const GIT_LOCK_RETRIES = 5;

const GIT_LOCK_RETRY_DELAY_MS = 5000;

async function gitWithLockRetry(argv, { _git, _sleep, emit, label }) {
  let result = null;
  for (let attempt = 0; attempt <= GIT_LOCK_RETRIES; attempt++) {
    result = await _git(argv);
    if (result && result.ok === true) return result;
    const stderr = String((result && result.stderr) || "");
    const transient = stderr.includes("index.lock")
      ? ".git/index.lock is held"
      : stderr.includes("unparseable adapter response")
        ? "adapter response was unparseable"
        : /no matches found|command not found/.test(stderr)
          ? "the transport shell mangled the command"
          : /did not match any files/.test(stderr)
            ? "the transport ran git outside the repository root"
            : null;
    if (transient === null || attempt === GIT_LOCK_RETRIES) return result;
    emit(
      `${label}: ${transient} — retrying in ${GIT_LOCK_RETRY_DELAY_MS}ms ` +
        `(attempt ${attempt + 1} of ${GIT_LOCK_RETRIES})`
    );
    await _sleep(GIT_LOCK_RETRY_DELAY_MS);
  }
  return result;
}

function uncommittedWorkRemedy(paths) {
  return (
    `The wave's work is verified (the orchestrator's own test gate passed) and is ` +
    `present in the working tree, but UNCOMMITTED. Nothing is lost: commit it ` +
    `yourself (\`git add -- ${paths.join(" ")}\` then \`git commit\`) and re-invoke, ` +
    `or fix the git condition and re-invoke.`
  );
}

async function commitPaths({ paths, message, what, _git, _sleep, emit }) {
  const add = await gitWithLockRetry(["add", "--", ...paths], {
    _git,
    _sleep,
    emit,
    label: `${what}: git add`,
  });
  if (!add || add.ok !== true) {
    throw haltError(
      `Error: ${what} — \`git add -- ${paths.join(" ")}\` failed: ` +
        `${String((add && add.stderr) || "no output").trim()}. ` +
        uncommittedWorkRemedy(paths)
    );
  }

  const staged = await _git(["diff", "--cached", "--name-only", "--", ...paths]);
  if (staged && staged.ok === true && String(staged.stdout || "").trim() === "") {
    emit(`${what}: nothing staged — no changes to commit`);
    return "nothing-staged";
  }

  const commit = await gitWithLockRetry(["commit", "-m", message], {
    _git,
    _sleep,
    emit,
    label: `${what}: git commit`,
  });
  if (!commit || commit.ok !== true) {

    const refusal = `${String((commit && commit.stdout) || "")}\n${String(
      (commit && commit.stderr) || ""
    )}`;
    if (/nothing (added )?to commit|no changes added to commit/.test(refusal)) {
      emit(`${what}: nothing staged — no changes to commit`);
      return "nothing-staged";
    }
    throw haltError(
      `Error: ${what} — \`git commit\` failed: ` +
        `${String((commit && commit.stderr) || "no output").trim()}. ` +
        uncommittedWorkRemedy(paths)
    );
  }
  emit(`${what}: committed — ${message}`);
  return "committed";
}

function waveCommitMessage(featureName, task) {
  const description = String(task.description || "")
    .replace(/[`"$\\]/g, "")
    .trim();
  const short =
    description.length > 60 ? `${description.slice(0, 57)}...` : description;
  return `feat(${featureName}): ${task.id}${short ? ` — ${short}` : ""}`;
}

async function defaultRecordQueueRow() {
  return { queueRow: "none" };
}

async function gatherA4Context({ feature, preRebaseHead, _git, _readFile }) {
  let defaultRef = null;
  try {
    const symRef = await _git(["symbolic-ref", "refs/remotes/origin/HEAD"]);
    const match =
      symRef && symRef.ok
        ? /^refs\/remotes\/origin\/(.+)$/.exec(String(symRef.stdout || "").trim())
        : null;
    if (match) defaultRef = `origin/${match[1]}`;
  } catch {
    defaultRef = null;
  }

  let mergeBase = null;
  let defaultTip = null;
  if (defaultRef) {
    try {
      const mergeBaseResult = await _git(["merge-base", "HEAD", defaultRef]);
      mergeBase = mergeBaseResult && mergeBaseResult.ok ? String(mergeBaseResult.stdout || "").trim() : null;
    } catch {
      mergeBase = null;
    }
    try {
      const defaultTipResult = await _git(["rev-parse", defaultRef]);
      defaultTip = defaultTipResult && defaultTipResult.ok ? String(defaultTipResult.stdout || "").trim() : null;
    } catch {
      defaultTip = null;
    }
  }

  let planFiles = [];
  try {
    const planRaw = await _readFile(`docs/${feature}/PLAN-${feature}.md`);
    const ownership = typeof planRaw === "string" ? parsePlanOwnership(planRaw) : null;
    if (ownership) planFiles = [...new Set(ownership.ownership.flatMap((row) => row.files))];
  } catch {
    planFiles = [];
  }

  let implConfig = IMPLEMENTATION_DEFAULTS;
  try {
    const implRaw = await readMergeConfigSafely(_readFile, MERGE_CONFIG_PATH);
    implConfig = parseImplementationConfig(implRaw).config;
  } catch {
    implConfig = IMPLEMENTATION_DEFAULTS;
  }

  return { mergeBase, preRebaseHead, defaultTip, planFiles, implConfig };
}

async function gatherA5Context({ _git }) {
  let defaultBranch = null;
  try {
    const symRef = await _git(["symbolic-ref", "refs/remotes/origin/HEAD"]);
    const match =
      symRef && symRef.ok
        ? /^refs\/remotes\/origin\/(.+)$/.exec(String(symRef.stdout || "").trim())
        : null;
    if (match) defaultBranch = match[1];
  } catch {
    defaultBranch = null;
  }

  let mergeBase = null;
  if (defaultBranch) {
    try {
      const mergeBaseResult = await _git(["merge-base", "HEAD", `origin/${defaultBranch}`]);
      mergeBase =
        mergeBaseResult && mergeBaseResult.ok ? String(mergeBaseResult.stdout || "").trim() : null;
    } catch {
      mergeBase = null;
    }
  }

  let preSeamHead = null;
  try {
    const headResult = await _git(["rev-parse", "HEAD"]);
    preSeamHead = headResult && headResult.ok ? String(headResult.stdout || "").trim() : null;
  } catch {
    preSeamHead = null;
  }

  return { defaultBranch, mergeBase, preSeamHead };
}

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

  _runAdvisorySeam: runAdvisorySeamFn = runAdvisorySeam,
  _readAdvisoryConfig: readAdvisoryConfigFn = readAdvisoryConfigSafely,
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

  _probeDoc: probeDocFn = NO_PROBE,
  _probeReviewState: probeReviewStateFn = NO_PROBE,
  _probePostmortem: probePostmortemFn = NO_PROBE,

  _runCommand: runCommandFn = NO_RUN_COMMAND,

  _sessionAgent,
} = {}) {

  const emit = logFn;

  const agentFn = (skill, prompt, opts) =>
    rawAgentFn(skill, prompt, { model: MODEL_DEFAULT, ...opts });

  const phases = [];
  let haltReason;

  let dodVerifiedCommit = null;

  async function readCurrentHead() {
    try {
      const headResult = await gitFn(["rev-parse", "HEAD"]);
      return headResult && headResult.ok ? String(headResult.stdout || "").trim() : null;
    } catch {
      return null;
    }
  }

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

  const notices = [];

  let gatePostmortem = null;

  async function phaseGate({ phaseId, docType, docPath }) {
    const label = PHASE_DISPATCH[phaseId].label;

    const forced = forcedPhases.has(phaseId);

    const window = await phaseWindow(docType);

    if (!forced) {

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

        const probe = await probeDocument(probeDocFn, docPath, docType);
        const docHash = probe ? probe.hash ?? null : await hashFileFn(docPath);
        const freshness =
          docHash == null
            ? isStale(record.hash, null)
            : isStaleByHash(record.hash, docHash);
        if (freshness === "FRESH") {

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

  const forcedDetail = (detail, forced) =>
    forced ? `${detail} — forced (recorded approval overridden)` : detail;

  const wrapperSeams = {
    _agent: agentFn,
    _readFile: readFileFn,
    _hashFile: hashFileFn,
    _listFiles: listFilesFn,
    _appendFile: appendFileFn,
    _probeDoc: probeDocFn,
    _probeReviewState: probeReviewStateFn,
    _sessionAgent,
    _log: emit,
    _git: gitFn,
  };

  async function wrappedDispatch({ skill, basePrompt, targetPath, docType, dispatchKind, phaseId, sessionKey }) {
    const episode = await dispatchAndVerify({
      skill,
      basePrompt,
      targetPath,
      docType,
      feature: featureName,
      dispatchKind,
      phaseId,
      ...wrapperSeams,

      _agent: sessionBoundAgent({
        _sessionAgent,

        sessionKey: sessionKey ?? authorSessionKey(featureName, docType, phaseId),
        _agent: agentFn,
        _log: emit,
      }),
    });
    return episode.response;
  }

  async function erratumPostmortemHalt({ phaseId, label, reason }) {
    const postmortemPath = `docs/${featureName}/POSTMORTEM-${phaseId}-${featureName}.md`;
    const prompt = [
      `Write ${postmortemPath}.`,
      `Include the required sections: Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation.`,
      `The failure is an ERRATUM-PROTOCOL failure: ${reason}`,
      `Commit and push.`,
    ].join(" ");

    let written = false;
    try {
      const result = await agentFn(PHASE_DISPATCH[phaseId].optimizer, prompt, {
        model: MODEL_DEFAULT,
      });
      if (result != null && String(result).trim() !== "") {
        const confirmation = await checkFileFn(postmortemPath);
        written = !!(confirmation && confirmation.ok);
      }
    } catch {
      written = false;
    }

    recordPhase(phaseId, label, "❌", reason);
    throw haltError(
      written
        ? `${reason} Post-mortem written at ${postmortemPath}. ` +
            `Recover: resolve it per AC-2.4, then set the feature's row back to pending.`
        : `${reason} Post-mortem write FAILED — no artifact at ${postmortemPath}.`,
      {
        haltPhase: phaseId,
        postmortemPath,
        postmortemStatus: written ? "written" : "write_failed",
      }
    );
  }

  async function erratumRound({ phaseId, label, target, items }) {
    const upstreamPhase = ERRATUM_PHASE_BY_DOC_TYPE[target];
    const upstream = PHASE_DISPATCH[upstreamPhase];
    const upstreamPath = `docs/${featureName}/${target}-${featureName}.md`;
    const itemLines = items.map((e) => `- ${e.item} (raised by ${e.source})`).join("\n");
    const itemText = items.map((e) => e.item).join("; ");

    const authorSkill = upstream.creator ?? upstream.optimizer;
    const authorResponse = await wrappedDispatch({
      skill: authorSkill,
      basePrompt: erratumAuthorPrompt({
        feature: featureName,
        docType: target,
        docPath: upstreamPath,
        itemLines,
        raisedIn: phaseId,
      }),
      targetPath: upstreamPath,
      docType: target,
      dispatchKind: "authoring",
      phaseId: upstreamPhase,

      sessionKey: authorSessionKey(featureName, target, upstreamPhase),
    });

    const window = await phaseWindow(target);
    const round = window.startIndex;
    const reviewers = upstream.reviewers;
    const confirmPaths = reviewers.map(
      (skill) =>
        `docs/${featureName}/CROSS-REVIEW-${reviewerRoleSlug(skill) || skill}-${target}-v${round}.md`
    );

    const probe = await probeDocument(probeDocFn, upstreamPath, target);
    const anchorHash = (probe ? probe.hash : await hashFileFn(upstreamPath)) ?? null;
    const anchorCommit = await headCommitSha(gitFn);

    const responses = await parallelFn(
      reviewers.map((skill, i) =>
        wrappedDispatch({
          skill,
          basePrompt: erratumConfirmPrompt({
            feature: featureName,
            docType: target,
            docPath: upstreamPath,
            itemLines,
            round,
            reviewFile: confirmPaths[i],
          }),
          targetPath: confirmPaths[i],
          docType: target,
          dispatchKind: "review",
          phaseId: upstreamPhase,
          sessionKey: reviewerSessionKey(featureName, target, upstreamPhase, skill),
        })
      )
    );

    const verdicts = [];
    for (let i = 0; i < reviewers.length; i++) {
      const skill = reviewers[i];
      const trailer = parseVerdict(responses[i], skill);
      if (trailer.malformed !== true) {
        verdicts.push(trailer);
        continue;
      }

      let fileText = null;
      try {
        fileText = await readFileFn(confirmPaths[i]);
      } catch {
        fileText = null;
      }
      const fromFile = extractFileVerdict(fileText, reviewerRoleSlug(skill) || skill);

      if (fromFile.ok && fromFile.malformed !== true) {
        emit(
          `Erratum confirmation (${target}, ${skill}): response trailer unreadable, ` +
            `verdict read from ${confirmPaths[i]} instead — ${fromFile.verdict} ` +
            `(high ${fromFile.high}).`
        );
        verdicts.push(fromFile);
      } else {

        emit(
          `Erratum confirmation (${target}, ${skill}): response trailer unreadable and ` +
            `${confirmPaths[i]} carries no readable verdict ` +
            `(${fromFile.ok ? "malformed" : fromFile.reason}) — failing closed.`
        );
        verdicts.push(trailer);
      }
    }

    const nonApproving = reviewers.filter((_, i) => !isPassResult(verdicts[i]));
    if (nonApproving.length > 0) {
      await erratumPostmortemHalt({
        phaseId,
        label,
        reason:
          `Phase ${phaseId} halted: the delta confirmation of the ${target} erratum round did not ` +
          `pass — non-approving: [${nonApproving.join(", ")}]. Erratum items against ` +
          `${upstreamPath}: ${itemText}.`,
      });
    }

    await appendApprovalAnchors({
      paths: confirmPaths,
      hash: anchorHash,
      commit: anchorCommit,
      _readFile: readFileFn,
      _probeDoc: probeDocFn,
      _appendFile: appendFileFn,
      _git: gitFn,
      emit,
    });

    notices.push(
      `Phase ${phaseId}: erratum round for ${target} — ${items.length} item${items.length === 1 ? "" : "s"}, ` +
        `confirmed at round v${round} by ${reviewers.join(", ")}.`
    );

    return [
      { text: authorResponse, source: authorSkill },
      ...reviewers.map((skill, i) => ({ text: responses[i], source: skill })),
    ];
  }

  async function routeErrata({ phaseId, docType, label, loop, creatorResult }) {
    const seen = new Set();
    const admit = (entries) => {
      const kept = [];
      for (const entry of entries) {

        if (!entry || entry.docType === docType) continue;
        const key = `${entry.docType} ${entry.item}`;
        if (seen.has(key)) continue;
        seen.add(key);
        kept.push(entry);
      }
      return kept;
    };

    const creatorSkill = PHASE_DISPATCH[phaseId].creator ?? PHASE_DISPATCH[phaseId].optimizer;
    let pending = admit([
      ...(Array.isArray(loop && loop.errata) ? loop.errata : []),

      ...parseErrata(creatorResult ?? "", (badType) =>
        notices.push(
          `Phase ${phaseId}: erratum line ignored — "${badType}" is not one of ` +
            `${ERRATUM_DOC_TYPES.join(", ")}.`
        )
      ).map((entry) => ({ ...entry, source: creatorSkill })),
    ]);
    if (pending.length === 0) return "";

    const spent = new Map();
    const routed = [];

    while (pending.length > 0) {
      const followOn = [];

      for (const target of ERRATUM_DOC_TYPES) {
        const items = pending.filter((entry) => entry.docType === target);
        if (items.length === 0) continue;

        const already = spent.get(target) ?? 0;
        if (already >= MAX_ERRATUM_ROUNDS_PER_DOC) {
          await erratumPostmortemHalt({
            phaseId,
            label,
            reason:
              `Phase ${phaseId} halted: further errata were raised against ` +
              `docs/${featureName}/${target}-${featureName}.md after its erratum round was already ` +
              `spent — the erratum bound of ${MAX_ERRATUM_ROUNDS_PER_DOC} round per upstream doc ` +
              `per phase is exhausted. Unaddressed items: ${items.map((e) => e.item).join("; ")}.`,
          });
        }
        spent.set(target, already + 1);

        const upstreamPath = `docs/${featureName}/${target}-${featureName}.md`;
        const exists = await checkFileFn(upstreamPath);
        if (!exists || !exists.ok) {
          notices.push(
            `Phase ${phaseId}: erratum round for ${target} skipped — no document at ${upstreamPath} ` +
              `(${items.length} item${items.length === 1 ? "" : "s"}).`
          );
          continue;
        }

        const responses = await erratumRound({ phaseId, label, target, items });
        routed.push(target);
        for (const reply of responses) {
          followOn.push(
            ...parseErrata(reply.text ?? "").map((entry) => ({
              ...entry,
              source: reply.source,
            }))
          );
        }
      }
      pending = admit(followOn);
    }

    return routed.length > 0 ? ` — erratum rounds: ${routed.join(", ")}` : "";
  }

  async function converge({
    phaseId,
    docType,
    docPath,
    inputs,
    creatorPromptExtra,
    phaseLabelOverride,
    pushArtifact = true,
    pluralizeIterations = false,
    sessionKey,
    afterConverged,
  }) {
    const dispatch = PHASE_DISPATCH[phaseId];
    phaseFn(phaseLabelOverride ?? `Phase ${phaseId}: ${dispatch.label}`);

    const gate = await phaseGate({ phaseId, docType, docPath });
    if (pushArtifact) artifactPaths.push(docPath);
    if (gate.skip) return { skipped: true };

    let creatorResult = null;
    if (dispatch.creator) {
      const basePrompt = creatorPrompt(phaseId, featureName, inputs ?? dispatch.creatorInputs);
      creatorResult = await wrappedDispatch({
        skill: dispatch.creator,
        basePrompt: creatorPromptExtra ? `${basePrompt}\n${creatorPromptExtra}` : basePrompt,
        targetPath: docPath,
        docType,
        dispatchKind: "authoring",
        phaseId,
        sessionKey,
      });
      if (!creatorResult || creatorResult.trim() === "") {
        throw haltError(
          `Error: creator agent ${dispatch.creator} failed to produce ${docPath} for phase ${phaseId}`
        );
      }
    }

    const window = gate.window;
    const loop = await reviewLoop({
      doc: docPath,
      phase: phaseId,
      docType,
      reviewers: dispatch.reviewers,
      optimizer: dispatch.optimizer,
      feature: featureName,
      iteration: window.startIndex,
      startIndex: window.startIndex,
      endIndex: window.endIndex,
      _parallel: parallelFn,
      _checkFile: checkFileFn,
      ...wrapperSeams,
    });
    checkConverged(
      loop,
      phaseId,
      dispatch.label,
      recordPhase,
      featureName,
      window.startIndex,
      window.endIndex
    );

    const erratumSuffix = await routeErrata({
      phaseId,
      docType,
      label: dispatch.label,
      loop,
      creatorResult,
    });

    const suffix = afterConverged ? await afterConverged({ loop, creatorResult }) : undefined;

    const iterationWord = pluralizeIterations
      ? `iteration${loop.iterations !== 1 ? "s" : ""}`
      : "iterations";
    const detail = `Approved (${loop.iterations} ${iterationWord})${erratumSuffix}${suffix ?? ""}`;
    recordPhase(phaseId, dispatch.label, "✅", forcedDetail(detail, gate.forced), loop.iterations);

    return { skipped: false, loop, creatorResult };
  }

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

  const artifactPaths = [reqPath];
  let testSummary = "Not run";
  let harvestStatus = "Not run";
  let prUrl;
  let ciStatus;

  let mergeOutcome;

  const advisoryConfigRaw = await readAdvisoryConfigFn(readFileFn, ADVISORY_CONFIG_PATH);
  const advisoryConfigResult = parseAdvisoryConfig(advisoryConfigRaw);

  const advisoryTierOn = advisoryConfigResult.config.enabled;
  if (advisoryTierOn && advisoryConfigResult.invalidKeys.length) {
    emit(`Advisory config: using defaults for ${advisoryConfigResult.invalidKeys.join(", ")}`);
  }
  const advisoryRungState = { resolved: null };

  const advisoryDispositions = [];

  const advisoryNotice = (line) => notices.push(line);

  const advisoryPubOutcome = { noChecks: false, completionCap: false };

  const runA5AdvisorySeam = async ({ seam, feature, prUrl }) => {
    const wait = makeWaitAccumulator();
    const a5Context = await gatherA5Context({ _git: gitFn });
    const seamOps = await buildA5SeamOps({
      feature,
      prUrl,
      preSeamHead: a5Context.preSeamHead,
      defaultBranch: a5Context.defaultBranch,
      mergeBase: a5Context.mergeBase,
      recordWait: wait.recordWait,
      _git: gitFn,
      _ghRun: ghRunFn,
      _checkCi: checkCiFn,
    });
    return runAdvisorySeamFn({
      seam,
      feature,
      seamOps,
      config: advisoryConfigResult.config,
      rungState: advisoryRungState,
      _agent: agentFn,
      _appendFile: appendFileFn,
      _writeFile: writeFileFn,
      _readFile: readFileFn,
      _git: gitFn,
      _log: emit,
      _now,
      _sleep,
      _notice: advisoryNotice,
      _waitMs: wait.waitMs,
    });
  };

  try {

    await ensureFeatureBranch({ feature: featureName, _git: gitFn, _log: emit });

    await pipelineFn("PDLC Pipeline", async () => {

      await converge({
        phaseId: "R",
        docType: "REQ",
        docPath: reqPath,
        pushArtifact: false,
        pluralizeIterations: true,
      });

      const fspecPath = `docs/${featureName}/FSPEC-${featureName}.md`;
      await converge({ phaseId: "F", docType: "FSPEC", docPath: fspecPath });

      const tspecPath = `docs/${featureName}/TSPEC-${featureName}.md`;

      const tResult = await converge({
        phaseId: "T",
        docType: "TSPEC",
        docPath: tspecPath,
        creatorPromptExtra: decisionsWarrantedTrailerRequirement(),
      });

      let decisionsWarranted;
      if (tResult.skipped) {

        const decisionsProbe = await checkFileFn(
          `docs/${featureName}/DECISIONS-${featureName}.md`
        );
        decisionsWarranted = decisionsProbe.ok === true;
        emit(
          `DECISIONS_WARRANTED: ${decisionsWarranted} — Phase T skipped on recorded ` +
            `approval, so no trailer was emitted; read from the DECISIONS document ` +
            `on disk instead (${decisionsWarranted ? "present" : decisionsProbe.reason}).`
        );
      } else {

        decisionsWarranted = parseDecisionsWarranted(
          (tResult.loop && tResult.loop.lastOptimizerResult) ?? tResult.creatorResult ?? null
        );
      }

      let decisionsPath = null;
      if (!decisionsWarranted) {
        phaseFn("Phase D: ⏭ Skipped");
        emit("Phase D skipped — no load-bearing alternatives");
        recordPhase("D", PHASE_DISPATCH.D.label, "⏭", "Skipped — no load-bearing alternatives");
      } else {
        decisionsPath = `docs/${featureName}/DECISIONS-${featureName}.md`;
        await converge({
          phaseId: "D",
          docType: "DECISIONS",
          docPath: decisionsPath,

          sessionKey: authorSessionKey(featureName, "TSPEC", "T"),
        });
      }

      const planPath = `docs/${featureName}/PLAN-${featureName}.md`;
      const pInputs = [...PHASE_DISPATCH.P.creatorInputs.filter(i => i !== "DECISIONS?")];
      if (decisionsPath) pInputs.push("DECISIONS");
      await converge({
        phaseId: "P",
        docType: "PLAN",
        docPath: planPath,
        inputs: pInputs,
        afterConverged: async () => {

          const pPlanText = await readFileFn(planPath);
          const pParsed = parsePlanTasks(pPlanText);
          if (!pParsed || !Array.isArray(pParsed.tasks) || pParsed.tasks.length === 0) {
            const detail =
              `Error: Phase P — the task table in ${planPath} could not be parsed by the ` +
              `mechanical parser, so the implementation phase would have no task graph. ` +
              `Reshape the PLAN's task table: its header row must carry an exact 'Task ID' ` +
              `cell (or 'ID' / '#') and an exact 'Dependencies' cell (or 'Deps' / ` +
              `'Depends On'), one markdown table row per task, and every dependency cell ` +
              `must list task ids ('-' for none). Rejecting at Phase P rather than ` +
              `discovering it at Phase I.`;
            recordPhase("P", PHASE_DISPATCH.P.label, "❌", detail);
            throw haltError(detail);
          }
          let pBatches;
          try {
            pBatches = computeTopologicalBatches(pParsed.tasks);
          } catch (cycleErr) {
            const detail =
              `Error: Phase P — the task graph in ${planPath} cannot be executed. ` +
              `${(cycleErr && cycleErr.message) || String(cycleErr)} ` +
              `Fix the PLAN's Dependencies column (every id it names must be another ` +
              `task's id, and the edges must form a DAG). Rejecting at Phase P rather ` +
              `than discovering it at Phase I.`;
            recordPhase("P", PHASE_DISPATCH.P.label, "❌", detail);
            throw haltError(detail);
          }

          const pOwnershipParsed = parsePlanOwnership(pPlanText);
          if (pOwnershipParsed == null) {
            const detail =
              `Error: Phase P — ${planPath} carries no file-ownership manifest, so the ` +
              `implementation phase cannot derive same-tree waves and cannot know which ` +
              `files each task may write. Add a markdown table whose header row carries an ` +
              `exact 'Task' cell (or 'Task ID' / 'ID' / 'Owning Task') and an exact 'Files' ` +
              `cell (or 'Owned Files' / 'Files Created or Appended'), one row per task, ` +
              `each row listing that task's owned paths in backticks — se-author's ` +
              `batch-safety rule 2. Rejecting at Phase P rather than discovering it at ` +
              `Phase I.`;
            recordPhase("P", PHASE_DISPATCH.P.label, "❌", detail);
            throw haltError(detail);
          }
          const pContract = validatePlanContract(pParsed.tasks, pOwnershipParsed.ownership);
          if (!pContract.ok) {
            const detail =
              `Error: Phase P — the task table and the file-ownership manifest in ` +
              `${planPath} disagree: ${pContract.problems.join("; ")}. Every task in the ` +
              `task table needs exactly one manifest row, and every manifest row needs a ` +
              `task — se-author's batch-safety rule 2. Rejecting at Phase P rather than ` +
              `discovering it at Phase I.`;
            recordPhase("P", PHASE_DISPATCH.P.label, "❌", detail);
            throw haltError(detail);
          }
          const pWaves = computeWaves(pParsed.tasks, pOwnershipParsed.ownership);

          return (
            `; PLAN parses to ${pParsed.tasks.length} tasks in ` +
            `${pBatches.length} batches, ${pWaves.length} waves`
          );
        },
      });

      const propertiesPath = `docs/${featureName}/PROPERTIES-${featureName}.md`;
      await converge({ phaseId: "PR", docType: "PROPERTIES", docPath: propertiesPath });

      phaseFn("Phase I: Implementation");

      let tasks;
      const iPlanText = await readFileFn(planPath);
      const planParsed = parsePlanTasks(iPlanText);
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

      const iOwnershipParsed = parsePlanOwnership(iPlanText);
      const iOwnership = iOwnershipParsed ? iOwnershipParsed.ownership : null;
      const iContract = iOwnership ? validatePlanContract(tasks, iOwnership) : null;
      const waveMode = Boolean(iOwnership) && iContract !== null && iContract.ok === true;

      if (!waveMode) {
        emit(
          "Implementation: no valid file-ownership manifest on this PLAN — running the " +
            "worktree exception path (isolated batches, merge-back, self-report gate)."
        );

        const batches = computeTopologicalBatches(tasks);

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

          evaluateBatchGate(batchResults, batchIndex, batch);
        }

        recordPhase("I", "Implementation", "✅", "All batches complete");

        phaseFn("Phase PT: PROPERTIES Tests");
        const ptResult = await agentFn(
          "se-implement",
          propertiesTestPrompt(featureName)
        );
        const ptGate = evaluateSingleAgentGate(ptResult, "PT");
        if (!ptGate.passed) {
          throw haltError(ptGate.reason);
        }
      } else {

      const waves = computeWaves(tasks, iOwnership);

      const implRaw = await readMergeConfigSafely(readFileFn, MERGE_CONFIG_PATH);
      const implParsed = parseImplementationConfig(implRaw);
      const implConfig = implParsed.config;
      if (implParsed.sectionMalformed) {
        emit(
          `Notice: the "implementation" section of ${MERGE_CONFIG_PATH} is not an object — ` +
            `using defaults for every implementation key.`
        );
      }
      for (const key of implParsed.invalidKeys) {
        emit(
          `Notice: implementation.${key} in ${MERGE_CONFIG_PATH} is not a valid value — ` +
            `using the default.`
        );
      }

      const scriptGate =
        Boolean(implConfig.testCommand) && typeof runCommandFn === "function";
      if (!scriptGate) {
        const missing = [];
        if (!implConfig.testCommand) missing.push(`implementation.testCommand in ${MERGE_CONFIG_PATH}`);
        if (typeof runCommandFn !== "function") missing.push("the _runCommand transport");
        emit(
          `Notice: the script-owned test gate is unavailable — ${missing.join(" and ")} ` +
            `${missing.length > 1 ? "are" : "is"} absent. Falling back to the agents' ` +
            `self-reported test results for every wave of this run.`
        );
      }

      const waveGit = branchGuardTransport(gitFn);
      if (!waveGit) {
        emit(
          "Notice: no git transport is injected — wave work will be verified but NOT " +
            "committed by the orchestrator."
        );
      }
      const waveSleep = typeof _sleep === "function" ? _sleep : sleep;

      emit("Implementation wave plan:");
      for (let i = 0; i < waves.length; i++) {
        emit(`  Wave ${i + 1}: [${waves[i].map((t) => t.id).join(", ")}]`);
      }
      emit(
        `  Total: ${tasks.length} tasks in ${waves.length} waves ` +
          `(same tree, file-ownership disjoint)`
      );

      let startWave = implConfig.startWave;

      const explicitPointer = startWave > 1;
      if (startWave > waves.length) {
        emit(
          `Notice: implementation.startWave=${startWave} in ${MERGE_CONFIG_PATH} is past the ` +
            `last wave of this plan (${waves.length}) — running every wave from 1.`
        );
        startWave = 1;
      }
      if (startWave > 1) {

        emit(
          `Resuming at wave ${startWave} of ${waves.length} (implementation.startWave). ` +
            `Waves 1–${startWave - 1} are skipped as previously completed; the first ` +
            `executed wave's gate still verifies the whole tree. Clear ` +
            `implementation.startWave before the next fresh run.`
        );
      }

      const planHash = computePlanHash(waves);
      let ledgerResume = false;
      let allWavesRecorded = false;
      if (!explicitPointer) {
        const ledgerRaw = await readMergeConfigSafely(readFileFn, WAVE_STATE_PATH);
        const ledger = parseWaveLedger(ledgerRaw);
        const ignore = (why) =>
          emit(
            `Notice: the wave ledger ${WAVE_STATE_PATH} was ignored — ${why}. ` +
              `Running every wave from 1.`
          );

        const headCorroborated = async (recordedHead) => {
          if (!recordedHead) return true; 
          const transport = branchGuardTransport(gitFn);
          if (!transport) return true; 
          try {
            const reply = await transport([
              "merge-base",
              "--is-ancestor",
              recordedHead,
              "HEAD",
            ]);
            return !!(reply && reply.ok === true);
          } catch {
            return true; 
          }
        };

        if (ledger.reason) {
          ignore(ledger.reason);
        } else if (ledger.state) {
          const recorded = ledger.state;
          if (recorded.feature !== featureName) {
            ignore(
              `it records feature "${recorded.feature}", not "${featureName}"`
            );
          } else if (recorded.planHash !== planHash) {
            ignore("the PLAN's wave layout has changed since it was written");
          } else if (!(await headCorroborated(recorded.head))) {
            ignore(
              `the commit it records (${String(recorded.head).slice(0, 12)}) is not an ` +
                `ancestor of HEAD — the branch was reset or re-cut since it was written, ` +
                `so the work it records is not in this tree`
            );
          } else if (recorded.lastGreenWave > waves.length) {
            ignore(
              `it records ${recorded.lastGreenWave} wave(s) green and this plan has ` +
                `only ${waves.length}`
            );
          } else if (recorded.lastGreenWave === waves.length) {

            startWave = waves.length + 1;
            ledgerResume = true;
            allWavesRecorded = true;
            emit(
              `Skipping Phase I (wave ledger ${WAVE_STATE_PATH}): all ` +
                `${waves.length} waves of this plan were committed and recorded ` +
                `green by an earlier run. Delete ${WAVE_STATE_PATH} to force a ` +
                `full run.`
            );
          } else {
            startWave = recorded.lastGreenWave + 1;
            ledgerResume = true;
            emit(
              `Resuming at wave ${startWave} of ${waves.length} (wave ledger ` +
                `${WAVE_STATE_PATH}). Waves 1–${recorded.lastGreenWave} were committed ` +
                `and recorded green by an earlier run of this same plan; the first ` +
                `executed wave's gate still verifies the whole tree. Delete ` +
                `${WAVE_STATE_PATH} to force a full run.`
            );
          }
        }
      }

      const writeWaveLedger = async (contents, what) => {
        try {
          await writeFileFn(WAVE_STATE_PATH, contents);
        } catch (err) {
          emit(
            `Notice: could not ${what} the wave ledger ${WAVE_STATE_PATH} — ` +
              `${(err && err.message) || String(err)}. The run continues; a later ` +
              `invocation will simply start from wave 1.`
          );
        }
      };

      for (let waveIndex = 0; waveIndex < waves.length; waveIndex++) {
        const wave = waves[waveIndex];
        const waveNum = waveIndex + 1;
        if (allWavesRecorded) break;
        if (waveNum < startWave) {
          emit(
            `Wave ${waveNum}/${waves.length}: skipped (` +
              (ledgerResume
                ? `wave ledger: waves 1–${startWave - 1} already green`
                : `implementation.startWave=${startWave}`) +
              `)`
          );
          continue;
        }
        phaseFn(`Phase I: Wave ${waveNum}/${waves.length}`);

        const waveResults = await parallelFn(
          wave.map((task) =>
            agentFn("se-implement", waveImplementPrompt(task, featureName), {
              model: MODEL_IMPLEMENTATION,
            })
          )
        );

        evaluateWaveDispatch(waveResults, waveIndex, wave);

        let postWaveRan = false;
        if (implConfig.postWaveCommand && typeof runCommandFn === "function") {
          const post = await runCommandFn(implConfig.postWaveCommand);
          if (!post || post.ok !== true) {
            throw haltError(
              `Error: Wave ${waveNum} post-wave command failed — ` +
                `\`${implConfig.postWaveCommand}\` did not pass. ` +
                `Output tail:\n${outputTail(post && post.output)}`
            );
          }
          postWaveRan = true;
          emit(`Wave ${waveNum} post-wave: \`${implConfig.postWaveCommand}\` passed`);
        }

        if (scriptGate) {
          const gate = await runCommandFn(implConfig.testCommand);
          if (!gate || gate.ok !== true) {
            throw haltError(
              `Error: Wave ${waveNum} test gate failed — \`${implConfig.testCommand}\` ` +
                `did not pass. Output tail:\n${outputTail(gate && gate.output)}`
            );
          }
          emit(`Wave ${waveNum} gate: \`${implConfig.testCommand}\` passed`);
        } else {
          evaluateBatchGate(waveResults, waveIndex, wave);
        }

        const unskip = await checkWaveUnskips({
          waves,
          waveIndex,
          _readFile: readFileFn,
        });
        for (const notice of unskip.notices) {
          emit(`Notice: Wave ${waveNum} un-skip guard: ${notice}`);
        }
        if (unskip.violations.length > 0) {
          throw haltError(formatUnskipViolations(waveNum, unskip.violations));
        }
        if (unskip.scanned.length > 0) {
          emit(
            `Wave ${waveNum} un-skip guard: ${unskip.scanned.length} owned test ` +
              `file(s) scanned, no skipped block owed by a completed task`
          );
        }

        if (waveGit) {
          for (const task of wave) {
            const paths = Array.isArray(task.files) ? task.files : [];
            if (paths.length === 0) {
              emit(
                `Wave ${waveNum} task ${task.id}: no owned paths in the manifest — nothing to commit`
              );
              continue;
            }
            await commitPaths({
              paths,
              message: waveCommitMessage(featureName, task),
              what: `Wave ${waveNum} task ${task.id}`,
              _git: waveGit,
              _sleep: waveSleep,
              emit,
            });
          }

          if (postWaveRan && implConfig.postWavePathspecs.length > 0) {
            await commitPaths({
              paths: implConfig.postWavePathspecs,
              message: `chore(${featureName}): wave ${waveNum} build outputs`,
              what: `Wave ${waveNum} build outputs`,
              _git: waveGit,
              _sleep: waveSleep,
              emit,
            });
          }

          let waveHead = null;
          if (waveGit) {
            try {
              const rev = await waveGit(["rev-parse", "HEAD"]);
              if (rev && rev.ok === true) waveHead = String(rev.stdout ?? "").trim() || null;
            } catch {
              waveHead = null;
            }
          }
          await writeWaveLedger(
            formatWaveLedger(featureName, planHash, waveNum, waveHead),
            `record wave ${waveNum} in`
          );
        }
      }

      if (allWavesRecorded) {
        recordPhase(
          "I",
          "Implementation",
          "⏭",
          `Skipped — all ${waves.length} waves previously committed and ` +
            `recorded green (wave ledger)`
        );
      } else {
        recordPhase(
          "I",
          "Implementation",
          "✅",
          `All ${waves.length} waves complete (wave mode, ` +
            `${scriptGate ? "script-owned gate" : "self-report gate"})`
        );
      }

      phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)");
      const vWaveNum = waves.length + 1;
      const vResult = await agentFn(
        "se-implement",
        propertiesTestPrompt(featureName),
        { model: MODEL_IMPLEMENTATION }
      );

      evaluateWaveDispatch([vResult], waves.length, [{ id: "PROPERTIES tests" }]);

      if (scriptGate) {
        const vGate = await runCommandFn(implConfig.testCommand);
        if (!vGate || vGate.ok !== true) {
          throw haltError(
            `Error: V-wave ${vWaveNum} PROPERTIES test gate failed — ` +
              `\`${implConfig.testCommand}\` did not pass. The V-wave's work is ` +
              `already committed on feat-${featureName}, so this is recoverable. ` +
              `Output tail:\n${outputTail(vGate && vGate.output)}`
          );
        }
        emit(`V-wave ${vWaveNum} gate: \`${implConfig.testCommand}\` passed`);
      } else {

        const vSelfGate = evaluateSingleAgentGate(vResult, "PT");
        if (!vSelfGate.passed) {
          throw haltError(vSelfGate.reason);
        }
      }
      }

      testSummary = "All tests passing";
      recordPhase("PT", "PROPERTIES Tests", "✅", "All properties tests passing");

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

      if (!phaseDodEnabled) {
        phaseFn("Phase DOD: ⏭ Skipped");
        emit("Phase DOD skipped — DoD verification disabled");
        recordPhase("DOD", PHASE_DISPATCH.DOD.label, "⏭", "Skipped — DoD verification disabled");
      } else {
        phaseFn("Phase DOD: Definition of Done Verification");

        const preRebaseHeadResult = await gitFn(["rev-parse", "HEAD"]);
        const preRebaseHead =
          preRebaseHeadResult && preRebaseHeadResult.ok ? String(preRebaseHeadResult.stdout || "").trim() : null;

        const rebaseStatus = await rebaseOntoDefaultFn({
          feature: featureName,
          _agent: agentFn,
          _log: emit,
        });
        if (rebaseStatus === "conflict") {

          const a4Context = await gatherA4Context({
            feature: featureName,
            preRebaseHead,
            _git: gitFn,
            _readFile: readFileFn,
          });
          const a4 = await runAdvisorySeamFn({
            seam: "A4",
            feature: featureName,
            seamOps: buildA4SeamOps({ ...a4Context, _git: gitFn, _runCommand: runCommandFn }),
            config: advisoryConfigResult.config,
            rungState: advisoryRungState,
            _agent: agentFn,
            _appendFile: appendFileFn,
            _writeFile: writeFileFn,
            _readFile: readFileFn,
            _git: gitFn,
            _log: emit,
            _now,
            _sleep,

            _notice: advisoryNotice,
          });
          advisoryDispositions.push(a4);
          if (a4.outcome !== "resolved") {
            recordPhase("DOD", PHASE_DISPATCH.DOD.label, "❌", "Rebase onto default branch conflicted — resolve manually");
            throw haltError(
              `Phase DOD — rebase conflict for feature ${featureName}. ` +
              `The feature branch cannot be cleanly rebased onto the default branch. ` +
              `Resolve conflicts manually and re-run.`
            );
          }

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

          const codeReviewPath = `docs/${featureName}/CODE_REVIEW-${featureName}-v${dodResult.iterations}.md`;
          let codeReviewText = "";
          try {
            const text = await readFileFn(codeReviewPath);
            codeReviewText = typeof text === "string" ? text : "";
          } catch {
            codeReviewText = "";
          }
          const a3 = await runAdvisorySeamFn({
            seam: "A3",
            feature: featureName,
            seamOps: buildA3SeamOps({ dodResult, codeReviewText, _readFile: readFileFn }),
            config: advisoryConfigResult.config,
            rungState: advisoryRungState,
            _agent: agentFn,
            _appendFile: appendFileFn,
            _writeFile: writeFileFn,
            _readFile: readFileFn,
            _git: gitFn,
            _log: emit,
            _now,
            _sleep,
            _notice: advisoryNotice,

            _summarise: summariseA3Classification,
          });
          advisoryDispositions.push(a3);

          const classificationSummary =
            (a3 && a3.classificationSummary) ?? "";
          recordPhase("DOD", PHASE_DISPATCH.DOD.label, "❌", `Failed after ${dodResult.iterations} iterations — ${detail}`, dodResult.iterations);
          throw haltError(
            `Phase DOD failed after ${dodResult.iterations} iterations — Definition of Done not met. ${detail} ${classificationSummary}`.trimEnd()
          );
        }

        try {
          const dodHeadResult = await gitFn(["rev-parse", "HEAD"]);
          dodVerifiedCommit =
            dodHeadResult && dodHeadResult.ok ? String(dodHeadResult.stdout || "").trim() : null;
        } catch {
          dodVerifiedCommit = null;
        }
        recordPhase("DOD", PHASE_DISPATCH.DOD.label, "✅", `Passed (${dodResult.iterations} iteration${dodResult.iterations !== 1 ? "s" : ""})`, dodResult.iterations);
      }

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

        const learningsText = await readFileFn(learningsPath);
        if (!/approval record/i.test(String(learningsText ?? ""))) {
          emit(
            `Harvest note: the approval record is missing from ${learningsPath}. ` +
              `It is best-effort (AC-4.2c) and is not a halt condition.`
          );
        }

        if (
          typeof harvestResult === "string" &&
          harvestResult.includes(
            "pdlc guard: refusing to delete CROSS-REVIEW files"
          )
        ) {

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

          ...(advisoryTierOn ? { _runAdvisorySeam: runA5AdvisorySeam } : {}),
          _advisoryRecord: (disposition) => advisoryDispositions.push(disposition),
        });
        prUrl = pubResult.prUrl;
        ciStatus = pubResult.ciStatus;

        advisoryPubOutcome.noChecks = Boolean(pubResult.noChecks);
        const ciDetail =
          ciStatus === "passed"
            ? `PR ${prUrl} — all GHA checks passed`
            : `PR ${prUrl} — no GHA checks detected within timeout (assumed none configured)`;
        recordPhase("PUB", "Raise PR & Verify CI", "✅", ciDetail);
      }

      if (advisoryTierOn) {
        const advisoryPath = `docs/${featureName}/ADVISORY-${featureName}.md`;
        const advisoryLearningsPath = `docs/${featureName}/LEARNINGS-${featureName}.md`;
        const h2Sleep = typeof _sleep === "function" ? _sleep : sleep;
        try {
          const check = await checkFileFn(advisoryPath);
          const recordExists = Boolean(check && check.ok);
          if (recordExists) {
            await agentFn("harvest-learnings", advisoryDistilPrompt(featureName));
            const del = await gitFn(["rm", "--", advisoryPath]);
            if (guardRefused(del)) {
              notices.push(`ADVISORY record retained: ${firstLine(del && del.stderr)}`);
            } else if (!del || del.ok !== true) {
              notices.push(
                `ADVISORY distil step failed: ${firstLine(del && del.stderr) || "git rm did not succeed"}`
              );
            } else {
              await commitPaths({
                paths: [advisoryLearningsPath, advisoryPath],
                message: `chore(advisory): distil ${featureName} advisory record into LEARNINGS`,
                what: "Phase H2 distil",
                _git: gitFn,
                _sleep: h2Sleep,
                emit,
              });
              await gitFn(["push", "origin", "HEAD"]);
            }
          }
        } catch (err) {
          notices.push(
            `ADVISORY distil step failed: ${err && err.message ? err.message : String(err)}`
          );
        }
      }

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

    if (err && err.completionCap === true) advisoryPubOutcome.completionCap = true;

    const failedRow = [...phases].reverse().find((row) => row.status === "❌");
    const haltPhase = failedRow ? failedRow.phase : null;

    let postmortemStatus = "none";
    let postmortemPath = null;

    if (gatePostmortem) {
      postmortemStatus = "unresolved";
      postmortemPath = gatePostmortem.path;
    } else if (err && err.postmortemStatus) {

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

    let queueRow = null;
    try {
      const recorded = await recordQueueRowFn({ feature: featureName, status: "halted" });
      queueRow = recorded && recorded.queueRow ? recorded.queueRow : null;

      if (recorded && recorded.detail) {
        notices.push(`Queue row ${queueRow}: ${recorded.detail}`);
      }
    } catch {
      queueRow = null;
    }

    if (postmortemStatus === "none") {
      emit("No POSTMORTEM was written.");
    }

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
      dodVerifiedCommit,
      headSha: await readCurrentHead(),

      advisory: advisoryTierOn ? advisorySummaryRows(advisoryDispositions, advisoryPubOutcome) : undefined,
    });
  }

  return buildFinalReport({
    feature: featureName,
    outcome: "success",
    notices,

    queueRow: mergeOutcome.queueRow ?? "none",
    mergeStatus: mergeOutcome.mergeStatus,
    mergeSha: mergeOutcome.mergeSha,
    mergeMethod: mergeOutcome.mergeMethod,

    postmortemStatus: skipPostmortem ? "unresolved" : "none",
    postmortemPath: skipPostmortem ? skipPostmortem.path : null,
    phases,
    artifactPaths,
    testSummary,
    harvestStatus,
    prUrl,
    ciStatus,
    dodVerifiedCommit,
    headSha: await readCurrentHead(),

    advisory: advisoryTierOn ? advisorySummaryRows(advisoryDispositions, advisoryPubOutcome) : undefined,
  });
}

async function mergeWorktree(repoPath, worktreeBranch, targetBranch, { execFn } = {}) {
  const { execSync: realExecSync } = await Promise.reject(new Error("Node module " + "child_process" + " is unavailable in the workflow runtime; this seam must be injected"));
  const exec = execFn ?? ((cmd, opts) => realExecSync(cmd, opts));

  const execOpts = { cwd: repoPath, stdio: "pipe", encoding: "utf8" };

  try {
    exec(`git merge --no-ff ${worktreeBranch}`, execOpts);
    return { ok: true };
  } catch {

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

    }

    try {
      exec("git merge --abort", execOpts);
    } catch {

    }

    return { ok: false, conflictingFiles };
  }
}

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

  mergeStatus = "skipped",
  mergeSha = null,
  mergeMethod = null,
  notices = [],

  dodVerifiedCommit = null,
  headSha = null,

  advisory = undefined,
}) {
  const dodHeadUnverified = Boolean(
    dodVerifiedCommit && headSha && headSha !== dodVerifiedCommit
  );
  return {
    feature,
    outcome,
    phases,
    artifactPaths,
    testSummary,
    harvestStatus,
    dodVerifiedCommit,
    dodHeadUnverified,

    notices,

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
    ...(advisory ? { advisory } : {}),
  };
}

return { main, meta, checkPrCi, mergeWorktree, checkFileNonEmpty, parsePlanTasks, runAdvisorySeam, readAdvisoryConfigSafely, parseAdvisoryConfig, defaultAppendFile, ADVISORY_CONFIG_PATH, resolveAdvisoryRung, advisorySummaryRows, ADVISORY_DEFAULTS, commitPaths, MERGE_GUARD_DEFAULTS, mergeCommandFor, gitWithLockRetry };
})();

const __queue = (function () {
const realMain = __dev.main;
const runAdvisorySeam = __dev.runAdvisorySeam;
const readAdvisoryConfigSafely = __dev.readAdvisoryConfigSafely;
const parseAdvisoryConfig = __dev.parseAdvisoryConfig;
const defaultAppendFile = __dev.defaultAppendFile;
const ADVISORY_CONFIG_PATH = __dev.ADVISORY_CONFIG_PATH;
const resolveAdvisoryRung = __dev.resolveAdvisoryRung;
const advisorySummaryRows = __dev.advisorySummaryRows;
const ADVISORY_DEFAULTS = __dev.ADVISORY_DEFAULTS;
const commitPaths = __dev.commitPaths;

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

const DEFAULT_QUEUE_PATH = "docs/_queue/QUEUE.md";

const DRIFT_STATE_PATH = ".claude/workflows/.pdlc-drift-state.json";

const MODEL_QUEUE = "sonnet";

const QUEUE_STATUSES = [
  "pending",
  "in-progress",
  "awaiting-merge",
  "done",
  "blocked",
  "halted",
];

const QUEUE_ROW_DISPOSITIONS = Object.freeze([
  "recorded",
  "recorded (uncommitted)",
  "none",
  "error",
]);

function haltError(message) {
  const err = new Error(message);
  err.isHalt = true;
  return err;
}

function parseQueue(markdown) {
  if (markdown == null || typeof markdown !== "string") return [];

  const rows = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  if (rows.length === 0) return [];

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

    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    if (cells.length === 0) continue;

    const rawStatus = pick(cells, idxStatus, 1);
    const status = (rawStatus || "").toLowerCase();
    const feature = pick(cells, idxFeature, 2);
    const reqPath = pick(cells, idxReq, 3);
    if (!feature && !reqPath) continue; 

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

const FRONTMATTER_SCAN_LIMIT = 4000;

function parseReqFrontmatter(text) {
  const empty = { ready: false, dependsOn: [], feature: null };
  if (text == null || typeof text !== "string") return empty;

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

        dependsOn = value
          .replace(/^\[/, "")
          .replace(/\]$/, "")
          .split(/[\s,]+/)
          .map((d) => d.trim().replace(/['"]/g, ""))
          .filter(Boolean);
      } else if (value === "" ) {

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

function parseTriageVerdict(result) {
  const fallback = {
    verdict: "needs-human",
    reason: "triage agent returned no TRIAGE verdict — treating as needs-human",
    seamToken: null,
  };
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return fallback;
  }

  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    const m = /^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$/i.exec(trimmed);
    if (m) {
      const verdict = m[1].toLowerCase();
      const rest = m[2].trim();

      let seamToken = null;
      let reason = rest;
      const tokenMatch = /^\[SEAM:(A1|A2)\]\s*(.*)$/i.exec(rest);
      if (tokenMatch) {
        if (/^\[SEAM:/i.test(tokenMatch[2].trim())) {
          seamToken = null;
          reason = rest;
        } else {
          seamToken = tokenMatch[1].toUpperCase();
          reason = tokenMatch[2].trim();
        }
      }

      return {
        verdict,
        seamToken,
        reason: reason || "(no reason given)",
      };
    }
  }
  return fallback;
}

function hasResidualSeamToken(reason) {
  return typeof reason === "string" && /^\[SEAM:/i.test(reason.trim());
}

function updateQueueStatus(markdown, feature, newStatus, evidence = null) {
  if (typeof markdown !== "string" || !feature) {
    return { markdown, matched: false };
  }

  const lines = markdown.split("\n");

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

    if (evidence == null) {
      const newCells = cells.slice();
      newCells[statusCol] = newStatus;
      lines[i] = `| ${newCells.join(" | ")} |`;
      return { markdown: lines.join("\n"), matched: true };
    }

    const foundStatus = (cells[statusCol] || "").trim();
    if (!EVIDENCE_OVERWRITABLE_STATUSES.includes(foundStatus)) {
      return { markdown, matched: true, written: false, foundStatus };
    }

    return writeEvidenceCarryingRow(markdown, feature, newStatus, evidence, {
      statusCol,
      featureCol,
    });
  }

  return { markdown, matched: false }; 
}

const EVIDENCE_OVERWRITABLE_STATUSES = ["in-progress", "awaiting-merge", "done"];

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

  return { markdown, matched: false };
}

function ensureEvidenceColumn(markdown) {
  if (typeof markdown !== "string") return { markdown, migrated: false };

  const lines = markdown.split("\n");
  const isSeparatorRow = (cells) => cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "");
  const appendCell = (line, cellText) => `${line.replace(/\|\s*$/, "")}| ${cellText} |`;

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
  if (headerIdx === -1) return { markdown, migrated: false }; 

  const headerCells = splitRow(lines[headerIdx].trim()).map((c) => c.toLowerCase());
  if (headerCells.some((c) => c.includes("evidence"))) {
    return { markdown, migrated: false }; 
  }

  lines[headerIdx] = appendCell(lines[headerIdx].trim(), "Evidence");

  const sepIdx = headerIdx + 1;
  if (sepIdx < lines.length && lines[sepIdx].trim().startsWith("|")) {
    const sepLine = lines[sepIdx].trim();
    if (isSeparatorRow(splitRow(sepLine))) {
      lines[sepIdx] = appendCell(sepLine, "---");
    }
  }

  for (let i = sepIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const trimmed = line.trim();
    if (isSeparatorRow(splitRow(trimmed))) continue; 
    lines[i] = appendCell(trimmed, "");
  }

  return { markdown: lines.join("\n"), migrated: true };
}

function mergeEvidenceCell(prev, next) {
  if (typeof prev === "string" && prev !== "" && /^merged #/.test(next)) {
    return prev;
  }
  return next;
}

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

  candidates.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    return 0;
  });

  return { kind: "candidates", candidates };
}

function precheckDependencies(dependsOn, entries) {
  if (!Array.isArray(dependsOn) || dependsOn.length === 0) {
    return { blocked: false };
  }
  const rows = Array.isArray(entries) ? entries : [];

  for (const dep of dependsOn) {
    const match = rows.find((e) => e.feature === dep);

    if (match && match.status !== "done") {
      return {
        blocked: true,
        reason: `dependency ${dep} is ${match.status} in queue (not done)`,
      };
    }

  }

  return { blocked: false };
}

function honourA1Verdict(verdict, precheck) {
  const p = precheck || {};
  if (p.blocked) {
    return "escalate";
  }
  const dependsOn = Array.isArray(p.dependsOn) ? p.dependsOn : [];
  const entries = Array.isArray(p.entries) ? p.entries : [];
  const unsettled = dependsOn.some((dep) => !entries.some((e) => e.feature === dep));
  if (unsettled) {
    return "escalate";
  }
  return verdict;
}

function buildA1SeamOps({ feature, reqPath, dependsOn, triageReason, precheck }) {
  const unreachable = (member) => async () => {
    throw new Error(
      `A1 SeamOps.${member} is unreachable: permittedActions is empty (TSPEC §6.3, A1-4)`
    );
  };
  return {
    gatherEvidence: async () =>
      `Feature: ${feature}\nREQ: ${reqPath}\n` +
      `Phase-0 triage abstained: ${triageReason}\n` +
      `Declared dependencies: ${dependsOn.length ? dependsOn.join(", ") : "(none)"}\n` +
      `Pre-check: ${JSON.stringify(precheck)}`,
    prompt: (evidence) =>
      `A1 triage-abstention adjudication for "${feature}".\n${evidence}\n\n` +
      `Decide whether the pipeline should run for this candidate now. Reply with your verdict ` +
      `trailer; proposedAction must be exactly one of "run-candidate", "hold", or "escalate".`,
    conditionHolds: async () => true,
    apply: unreachable("apply"),
    producedPaths: unreachable("producedPaths"),
    revert: unreachable("revert"),
    verifyGate: null,
    declaredScope: [],
    permittedActions: [],
  };
}

const CITATION_RE = /([\w./-]+\.[A-Za-z0-9]+):(\d+)/g;

function extractCitations(reqText) {
  const citations = [];
  const re = new RegExp(CITATION_RE.source, "g");
  let m;
  while ((m = re.exec(reqText || "")) !== null) {
    citations.push({ location: `${m[1]}:${m[2]}`, file: m[1], line: Number(m[2]) });
  }
  return citations;
}

function buildA2SeamOps({
  feature,
  reqPath,
  originalReqText,
  _readFile,
  _writeFile,
  _git,
  _appendFile,
  _commitPaths,
}) {
  const recordPath = `docs/${feature}/ADVISORY-${feature}.md`;
  let capturedRows = null;

  return {
    gatherEvidence: async () => {
      const citations = extractCitations(originalReqText);
      const lines = [
        `Feature: ${feature}`,
        `REQ: ${reqPath}`,
        `Citations found: ${citations.length}`,
      ];
      for (const citation of citations) {
        let resolves = "unknown";
        try {
          const grep = await _git(["grep", "-n", "-F", citation.location, "--", citation.file]);
          resolves = grep && grep.ok && String(grep.stdout || "").trim() ? "resolves" : "drifted";
        } catch {
          resolves = "drifted";
        }
        lines.push(`  ${citation.location}: ${resolves}`);
      }
      lines.push("", originalReqText);
      return lines.join("\n");
    },
    prompt: (evidence) =>
      `A2 stale-REQ re-grounding for "${feature}".\n\n${evidence}\n\n` +
      `For each drifted citation, propose { oldLocation, newLocation, symbol, symbolStillExists }. ` +
      `Reply with your verdict trailer whose proposedAction is exactly ` +
      `JSON.stringify([{ oldLocation, newLocation, symbol, symbolStillExists }, …]). ` +
      `Rewrite citation location text ONLY — never the frontmatter region or any requirements ` +
      `sentence (P-2, A2-3).`,
    conditionHolds: async () => (await _readFile(reqPath)) === originalReqText,
    apply: async (verdict) => {
      let rows;
      try {
        rows = JSON.parse(verdict && verdict.proposedAction);
      } catch {
        return { ok: false, why: "proposedAction was not valid JSON (expected an array of re-grounding rows)" };
      }
      if (!Array.isArray(rows)) {
        return { ok: false, why: "proposedAction did not parse to an array of re-grounding rows" };
      }
      capturedRows = rows;
      let text = originalReqText;
      for (const row of rows) {
        if (row && typeof row.oldLocation === "string" && typeof row.newLocation === "string") {
          text = text.split(row.oldLocation).join(row.newLocation);
        }
      }
      await _writeFile(reqPath, text);
      return { ok: true };
    },
    producedPaths: async () => {
      const diff = await _git(["diff", "--name-only"]);
      return diff && diff.ok && diff.stdout
        ? String(diff.stdout)
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    },
    revert: async () => {
      await _git(["checkout", "--", reqPath]);
    },
    verifyGate: async () => {
      const entry =
        `\n## ${new Date().toISOString()} — A2 — re-grounded\n\n` +
        `Feature: ${feature}\nREQ: ${reqPath}\n` +
        `Rows: ${JSON.stringify(capturedRows || [])}\n`;
      try {
        await _appendFile(recordPath, entry);
      } catch (err) {
        return { passed: false, detail: `record write failed: ${err && err.message}` };
      }

      let commitResult;
      try {
        commitResult = await _commitPaths({
          paths: [reqPath, recordPath],
          message: `chore(advisory): A2 re-grounded citations for ${feature}`,
          what: `A2 re-grounding for ${feature}`,
          _git,
          emit: () => {},
        });
      } catch (err) {
        return { passed: false, detail: `commit failed: ${err && err.message}` };
      }

      const reqAtHead = await _git(["show", `HEAD:${reqPath}`]);
      const recordAtHead = await _git(["show", `HEAD:${recordPath}`]);
      const confirmed = Boolean(reqAtHead && reqAtHead.ok && recordAtHead && recordAtHead.ok);
      return confirmed
        ? { passed: true, detail: `${commitResult}` }
        : { passed: false, detail: "branch head does not carry both the REQ and the advisory record" };
    },
    declaredScope: [reqPath],
    permittedActions: ["E-4"],
  };
}

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
    `Also check whether the REQ's file:line citations still resolve at HEAD. If some have drifted ` +
    `but every cited symbol still exists, return needs-human [SEAM:A2].\n\n` +
    `Do NOT modify any files. End your final message with exactly one line:\n` +
    `TRIAGE: ready        <one-line reason>   — dependencies satisfied, safe to run\n` +
    `TRIAGE: blocked      <one-line reason>   — a dependency is not yet in the base; skip for now\n` +
    `TRIAGE: needs-human [SEAM:A1] <one-line reason>   — ambiguous; a human must decide\n` +
    `TRIAGE: needs-human [SEAM:A2] <one-line reason>   — the REQ's file:line citations have drifted`
  );
}

async function agent(skill, prompt, opts) {
  throw new Error("agent() not available outside Claude Code runtime");
}

function phase(label) {

}

function log(message) {
  if (typeof console !== "undefined") {
    console.log("[orchestrate-queue]", message);
  }
}

async function defaultReadFile(path) {
  const { readFileSync } = await Promise.reject(new Error("Node module " + "fs" + " is unavailable in the workflow runtime; this seam must be injected"));
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

async function defaultWriteFile(path, contents) {
  const { writeFileSync } = await Promise.reject(new Error("Node module " + "fs" + " is unavailable in the workflow runtime; this seam must be injected"));
  writeFileSync(path, contents, "utf8");
}

async function defaultGit(argv, { execFn } = {}) {
  const { execFileSync: realExecFileSync } = await Promise.reject(new Error("Node module " + "child_process" + " is unavailable in the workflow runtime; this seam must be injected"));
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

async function defaultReadAdvisoryConfig(readFileFn, path) {
  const raw = await readAdvisoryConfigSafely(readFileFn, path);
  return parseAdvisoryConfig(raw);
}

async function main({
  queuePath = DEFAULT_QUEUE_PATH,
  _agent: rawAgentFn = agent,
  _readFile: readFileFn = defaultReadFile,
  _writeFile: writeFileFn = defaultWriteFile,
  _appendFile: appendFileFn = defaultAppendFile,
  _git: gitFn = defaultGit,
  _runPipeline: runPipelineFn = realMain,
  _runAdvisorySeam: runAdvisorySeamFn = runAdvisorySeam,
  _readAdvisoryConfig: readAdvisoryConfigFn = defaultReadAdvisoryConfig,
  _commitPaths: commitPathsFn = commitPaths,
  _log: logFn = log,
  _phase: phaseFn = phase,
} = {}) {
  const emit = logFn;

  const agentFn = (skill, prompt, opts) =>
    rawAgentFn(skill, prompt, { model: MODEL_QUEUE, ...opts });

  phaseFn("Queue: Drift gate");

  const distributionConfigRaw = await readAdvisoryConfigSafely(readFileFn, ADVISORY_CONFIG_PATH);
  const driftGate = parseDistributionCheckEnabledOptOut(distributionConfigRaw)
    ? distributionOptOutGate()
    : mapDriftState(validateDriftRecord(await readDriftStateSafely(readFileFn, DRIFT_STATE_PATH)));
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

  const driftNotice = driftGate.row === 9 ? null : driftGate.report;
  if (driftNotice) {
    emit(
      `Drift gate proceeding (row ${driftGate.row}): ${driftGate.reasons.join("; ")}`
    );
  }

  const advisoryDispositions = [];
  const finish = (fields) =>
    buildQueueReport({
      ...fields,
      driftReport: driftNotice,
      advisory:
        advisoryConfig && advisoryConfig.config && advisoryConfig.config.enabled
          ? advisorySummaryRows(advisoryDispositions)
          : undefined,
    });

  const advisoryConfig = await readAdvisoryConfigFn(readFileFn, ADVISORY_CONFIG_PATH);
  const rungState = { resolved: null };

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

  phaseFn("Queue: Triage");
  const skipped = [];

  for (const entry of selection.candidates) {

    let reqText;
    try {
      reqText = await readFileFn(entry.reqPath);
    } catch {
      reqText = null;
    }
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

    const dependsOn = Array.from(
      new Set([...(entry.dependsOn || []), ...(fm.dependsOn || [])])
    );

    const precheck = precheckDependencies(dependsOn, entries);
    if (precheck.blocked) {
      emit(`Skip "${entry.feature}": blocked (pre-check) — ${precheck.reason}.`);
      skipped.push({
        feature: entry.feature,
        reason: `blocked (pre-check): ${precheck.reason}`,
      });
      continue;
    }

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

      const seam = triage.seamToken === "A2" ? "A2" : "A1";
      const seamOps =
        seam === "A2"
          ? buildA2SeamOps({
              feature: entry.feature,
              reqPath: entry.reqPath,
              originalReqText: reqText,
              _readFile: readFileFn,
              _writeFile: writeFileFn,
              _git: gitFn,
              _appendFile: appendFileFn,
              _commitPaths: commitPathsFn,
            })
          : buildA1SeamOps({
              feature: entry.feature,
              reqPath: entry.reqPath,
              dependsOn,
              triageReason: triage.reason,
              precheck,
            });

      const advisoryDisposition = await runAdvisorySeamFn({
        seam,
        feature: entry.feature,
        seamOps,
        config: advisoryConfig.config,
        rungState,
        _agent: rawAgentFn,
        _appendFile: appendFileFn,
        _writeFile: writeFileFn,
        _readFile: readFileFn,
        _git: gitFn,
        _log: emit,

        _notice: emit,
      });

      advisoryDispositions.push({ ...advisoryDisposition, seam });

      await commitAdvisoryRecord(
        `docs/${entry.feature}/ADVISORY-${entry.feature}.md`,
        entry.feature,
        gitFn,
        emit
      );

      if (seam === "A1") {

        const action =
          advisoryDisposition.reason === "out-of-envelope" && advisoryDisposition.verdict
            ? honourA1Verdict(advisoryDisposition.verdict.proposedAction, {
                blocked: precheck.blocked,
                dependsOn,
                entries,
              })
            : "escalate";

        if (action === "run-candidate") {
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
            phaseFn,
            emit,
            finish,
          });
        }

        emit(`Skip "${entry.feature}": A1 adjudicated ${action} — ${triage.reason}.`);
        skipped.push({
          feature: entry.feature,
          reason: `needs-human (A1 ${action}): ${triage.reason}`,
        });
        continue;
      }

      emit(`Skip "${entry.feature}": needs human decision (A2) — ${triage.reason}.`);
      skipped.push({
        feature: entry.feature,
        reason: `needs-human (A2): ${triage.reason}`,
      });
      continue;
    }

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

      phaseFn,
      emit,
      finish,
    });
  }

  emit(`No ready REQ this pass (${skipped.length} candidate(s) skipped).`);
  return finish({
    outcome: "idle",
    reason: "no candidate passed the readiness gate",
    remaining: remainingPending,
    skipped,
  });
}

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

  finish,
}) {
  phaseFn(`Pipeline: ${entry.feature}`);
  emit(
    `Picked "${entry.feature}" (deps: ${
      dependsOn.length ? dependsOn.join(", ") : "none"
    }) — ${triageReason}. Running orchestrate-dev.`
  );

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

  if (current === null || current === undefined) {
    return { queueRow: "none" };
  }

  const { markdown, matched, written, foundStatus } = updateQueueStatus(
    current,
    feature,
    status,
    evidence
  );

  if (!matched) {
    return {
      queueRow: "error",
      detail:
        `no row for ${feature} in ${queuePath}; ` +
        `status "${status}" was not recorded`,
    };
  }

  if (written === false) {
    return {
      queueRow: "recorded",
      detail: `row for ${feature} left unchanged: found status "${foundStatus}", not overwritable`,
    };
  }

  await writeFileFn(queuePath, markdown);
  return await commitQueueRow(queuePath, feature, status, gitFn);
}

const NOTHING_TO_COMMIT_RE = /nothing to commit/i;

function firstLine(text) {
  return String(text ?? "").split("\n")[0].trim();
}

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

  if (
    NOTHING_TO_COMMIT_RE.test(committed.stdout ?? "") ||
    NOTHING_TO_COMMIT_RE.test(committed.stderr ?? "")
  ) {
    return { queueRow: "recorded" };
  }

  return uncommitted(committed, queuePath);
}

async function commitAdvisoryRecord(recordPath, feature, gitFn, emit) {
  const added = await gitFn(["add", "--", recordPath]);
  if (!added || added.ok !== true) {
    emit(`Advisory record for "${feature}" left uncommitted: git add failed.`);
    return;
  }

  const committed = await gitFn([
    "commit",
    "-m",
    `chore(advisory): record ${feature} (queue)`,
    "--",
    recordPath,
  ]);
  if (committed && committed.ok === true) return;

  if (
    NOTHING_TO_COMMIT_RE.test((committed && committed.stdout) ?? "") ||
    NOTHING_TO_COMMIT_RE.test((committed && committed.stderr) ?? "")
  ) {
    return;
  }
  emit(`Advisory record for "${feature}" left uncommitted: git commit failed.`);
}

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

function buildQueueReport({
  outcome,
  reason,
  remaining,
  picked,
  active,
  pipelineReport,
  skipped,
  driftReport,
  advisory,
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
    ...(advisory ? { advisory } : {}),
  };
}

const DRIFT_CLOSED_ROW_STATES = ["in-sync", "missing", "stale", "local-edit", "unverified", "unknown"];

const DRIFT_CLOSED_ROW_REASONS = [
  "hash-tool-absent",
  "plugin-artifact-missing",
  "plugin-artifact-unreadable",
  "consumer-artifact-unreadable",
];

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

function failsD3(record) {
  return !(typeof record.schemaVersion === "number" && Number.isInteger(record.schemaVersion) && record.schemaVersion === 1);
}

function failsD4(record) {
  if (record.baselineStatus !== "resolved" && record.baselineStatus !== "unresolved") {
    return true;
  }
  return record.baselineReason !== null && !DRIFT_CLOSED_BASELINE_REASONS.includes(record.baselineReason);
}

function failsD5(record) {
  return typeof record.checkEnabled !== "boolean";
}

function failsD6(record) {
  return (
    !Array.isArray(record.rows) ||
    !Array.isArray(record.retiredPresent) ||
    !Array.isArray(record.writeFailures)
  );
}

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

function firstFailingDriftClause(record) {
  for (const [clauseId, fails] of DRIFT_CLAUSE_CHECKS) {
    if (fails(record)) return clauseId;
  }
  return null;
}

function validateDriftRecord(value) {

  let parsed;
  if (typeof value === "string") {

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

function emptyReport() {
  return { manifest: [], row: [], run: [] };
}

function gate(outcome, row, reasons, report) {
  return { outcome, row, reasons, report };
}

function mapDriftState(validated) {

  if (!validated || validated.ok !== true) {
    const clause = validated && typeof validated.clause === "string" ? validated.clause : "D1";
    const reasons = [`drift state did not yield a usable record (${clause})`];
    return gate("blocked", 1, reasons, { manifest: reasons, row: [], run: [] });
  }

  const record = validated.record;

  if (record.checkEnabled === false) {
    const reasons = ["checkEnabled is false — drift check skipped by operator opt-out (AC-4.3)"];
    return gate("proceed", 2, reasons, { manifest: reasons, row: [], run: [] });
  }

  if (Array.isArray(record.writeFailures) && record.writeFailures.length > 0) {
    const run = record.writeFailures.map(
      (failure) => `write failure: ${failure.path} (${failure.operation})`
    );
    const manifest =
      record.baselineReason === "drift-state-invalidated" ? ["drift-state-invalidated"] : [];
    return gate("blocked", 3, [...manifest, ...run], { manifest, row: [], run });
  }

  if (record.baselineStatus === "unresolved") {
    const manifest = [String(record.baselineReason)];
    return gate("blocked", 4, manifest, { manifest, row: [], run: [] });
  }

  if (record.rows.some((row) => row.state === "unknown")) {
    const row = record.rows
      .filter((r) => r.state === "unknown")
      .map((r) => `${r.id}: unknown${r.reason ? ` (${r.reason})` : ""}`);
    return gate("blocked", 5, row, { manifest: [], row, run: [] });
  }

  if (record.rows.some((row) => row.state === "missing" || row.state === "stale")) {
    const row = record.rows
      .filter((r) => r.state === "missing" || r.state === "stale")
      .map((r) => `${r.id}: ${r.state}`);
    return gate("blocked", 6, row, { manifest: [], row, run: [] });
  }

  if (Array.isArray(record.retiredPresent) && record.retiredPresent.length > 0) {
    const row = record.retiredPresent.map((entry) => `retired artifact present: ${entry.path}`);
    return gate("blocked", 7, row, { manifest: [], row, run: [] });
  }

  if (record.rows.some((row) => row.state === "local-edit" || row.state === "unverified")) {
    const run = record.rows
      .filter((r) => r.state === "local-edit" || r.state === "unverified")
      .map((r) => `${r.id}: ${r.state}`);
    return gate("proceed", 8, run, { manifest: [], row: [], run });
  }

  if (
    record.baselineStatus === "resolved" &&
    record.rows.length > 0 &&
    record.rows.every((row) => row.state === "in-sync") &&
    record.retiredPresent.length === 0 &&
    record.writeFailures.length === 0
  ) {
    return gate("proceed", 9, [], emptyReport());
  }

  const reasons = ["drift state does not describe a recognised outcome"];
  return gate("blocked", 10, reasons, { manifest: reasons, row: [], run: [] });
}

async function readDriftStateSafely(readFileFn, path) {
  try {
    return await readFileFn(path);
  } catch {
    return null;
  }
}

function parseDistributionCheckEnabledOptOut(raw) {
  if (typeof raw !== "string") return false;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return false;
  const distribution = parsed.distribution;
  if (distribution === null || typeof distribution !== "object" || Array.isArray(distribution)) {
    return false;
  }
  return distribution.checkEnabled === false;
}

const DISTRIBUTION_OPT_OUT_NOTICE =
  `drift check skipped by operator opt-out (${ADVISORY_CONFIG_PATH} distribution.checkEnabled: false)`;

function distributionOptOutGate() {
  return {
    outcome: "proceed",
    row: 0,
    reasons: [DISTRIBUTION_OPT_OUT_NOTICE],
    report: { manifest: [DISTRIBUTION_OPT_OUT_NOTICE], row: [], run: [] },
  };
}

return { main, meta, DEFAULT_QUEUE_PATH, rewriteStatus, updateQueueStatus };
})();

const __reqPath =
  typeof args === "string" && args.trim()
    ? args.trim()
    : args && typeof args === "object" && args.reqPath
      ? args.reqPath
      : null;

const __forcePhases =
  args && typeof args === "object" && args.forcePhases ? args.forcePhases : null;

if (!__reqPath) {
  return { outcome: "halted", haltReason: "No reqPath supplied — pass the REQ path as args." };
}

return await __dev.main({
  reqPath: __reqPath,
  forcePhases: __forcePhases,
  ...rtDevInjections(__dev),

  _recordQueueRow: async ({ feature, status, evidence }) =>
    __queue.rewriteStatus(
      __queue.DEFAULT_QUEUE_PATH,
      feature,
      status,
      rtReadFile,
      rtWriteFile,
      rtGit,
      evidence
    ),
});
