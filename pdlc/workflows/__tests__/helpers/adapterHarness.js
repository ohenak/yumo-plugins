/**
 * adapterHarness.js — loads `runtime-adapter.js` the way the runtime does.
 *
 * The adapter is deliberately NOT an ES module: it has no `import` and no
 * `export`, and `build-runtime.mjs` inlines its text at the top level of a
 * bundle, above the module IIFEs, with the host globals already in scope. A
 * test therefore cannot `import` it — it must reproduce that environment.
 *
 * `loadAdapter` does exactly that: it evaluates the shipped source inside a
 * `Function` whose parameters are the five host globals the adapter captures
 * (`agent`, `parallel`, `pipeline`, `phase`, `log`), and returns the adapter's
 * top-level bindings. So these tests exercise the bytes that ship, not a copy.
 *
 * Excluded from jest discovery by `testPathIgnorePatterns` (`/__tests__/helpers/`).
 */

import { readFileSync } from "fs";
import { createHash } from "crypto";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ADAPTER = resolve(HERE, "..", "..", "runtime-adapter.js");

/** Top-level adapter bindings the harness exposes to tests. */
const EXPOSED = [
  "RT_READ_CHUNK",
  "RT_READ_RETRIES",
  "RT_MISSING",
  "RT_IO_MODEL",
  "rtUtf8Encode",
  "rtSha256Hex",
  "rtLinePlan",
  "rtReadChunk",
  "rtReadRange",
  "rtReadFile",
  // The read cache (REQ-RTCACHE-01..05). The eviction ladder is exercised
  // through these directly: driving it end-to-end would mean transporting
  // 2 MiB through the chunk agents, ~350 agent calls per megabyte.
  "RT_READ_CACHE_MAX_BYTES",
  "rtCacheGet",
  "rtCachePut",
  "rtCacheInvalidate",
  "rtWriteFile",
  "rtAppendFile",
  "rtHashFile",
  "rtCheckFile",
  "rtListFiles",
  // The pdlc-cli probe seams and their transport.
  "RT_IO_MODEL_HARD",
  "RT_READ_ESCALATE_AFTER",
  "RT_CLI_PATH",
  "rtShellQuote",
  "rtCliCanonicalise",
  "rtExtractCliReply",
  "rtCliQuery",
  "rtProbeDoc",
  "rtProbeReviewState",
  "rtProbePostmortem",
  "rtDevInjections",
  // The `gh` transport (TSPEC §11.3).
  "rtGhRun",
  // The command transport Phase I's script-owned gate runs through
  // (PROPOSAL §3.3 / M-6).
  "rtRunCommand",
];

/**
 * The runtime marshals each thunk's resolved value across the host↔VM boundary,
 * and rejects an array longer than 4,096 elements ("array length N exceeds the
 * maximum of 4096 supported across the workflow VM boundary", observed live on
 * run wf_a4034a6e-597). Modelled here so a test fails the way the runtime does.
 */
export const VM_BOUNDARY_MAX_ARRAY = 4096;

const marshal = (value) => {
  if (Array.isArray(value) && value.length > VM_BOUNDARY_MAX_ARRAY) {
    throw new Error(
      `array length ${value.length} exceeds the maximum of ${VM_BOUNDARY_MAX_ARRAY} ` +
        `supported across the workflow VM boundary`
    );
  }
  return value;
};

/**
 * The host `parallel`: an array of THUNKS, every one started, a thrown thunk
 * resolved to `null` rather than rejecting the whole call. Mirrors the runtime,
 * which is what makes the adapter's own null-check meaningful. Each resolved
 * value passes through the boundary marshalling above, as it does live.
 */
export const hostParallel = (thunks) =>
  Promise.all(
    (thunks || []).map((thunk) =>
      Promise.resolve()
        .then(() => thunk())
        .then(marshal)
        .catch(() => null)
    )
  );

/**
 * Evaluate `runtime-adapter.js` with stubbed host globals.
 *
 * @param {{agent?: Function, parallel?: Function, pipeline?: Function,
 *          phase?: Function, log?: Function}} [globals]
 * @returns {Record<string, any>} the adapter's top-level bindings
 */
export function loadAdapter(globals = {}) {
  const src = readFileSync(ADAPTER, "utf8");
  const factory = new Function(
    "agent",
    "parallel",
    "pipeline",
    "phase",
    "log",
    `"use strict";\n${src}\nreturn { ${EXPOSED.join(", ")} };`
  );
  return factory(
    globals.agent || (async () => ""),
    globals.parallel || hostParallel,
    globals.pipeline || (async (label, fn) => fn()),
    globals.phase || (() => {}),
    globals.log || (() => {})
  );
}

/**
 * An `agent` double backed by an in-memory file tree, answering the two prompts
 * `rtReadFile` issues (the probe — size, newline count, last-byte-newline flag,
 * whole-file SHA-256 — and the `sed -n 'a,bp'` chunk transcription with its
 * range digest) from the real bytes of `files`.
 *
 * The double behaves like GNU sed: the final line of a no-trailing-newline
 * file is emitted WITHOUT an appended newline. `bsdSed: true` flips that, so
 * a test can pin the other platform's behaviour.
 *
 * `corrupt(prompt, reply, callIndex)` may return a replacement reply — the
 * point of the harness: it is how a mangled transcription, a fenced reply or
 * a garbage probe is injected without touching production code.
 *
 * @param {Record<string, string>} files  path -> contents (decoded text)
 * @param {(prompt: string, reply: string, callIndex: number) => (string|undefined)} [corrupt]
 * @param {{bsdSed?: boolean}} [opts]
 */
export function fileAgent(files, corrupt, opts = {}) {
  const calls = [];

  const sedRange = (text, first, last) => {
    const endsNL = text.endsWith("\n");
    const body = endsNL ? text.slice(0, -1) : text;
    const lines = body === "" ? [] : body.split("\n");
    const slice = lines.slice(first - 1, last);
    if (slice.length === 0) return "";
    let out = slice.join("\n");
    const tookFinalLine = last >= lines.length;
    if (!tookFinalLine || endsNL || opts.bsdSed) out += "\n";
    return out;
  };

  const agent = async (prompt, optsIgnored) => {
    const index = calls.length;
    calls.push({ prompt, opts: optsIgnored });
    const path = /"([^"]+)"/.exec(prompt);
    const name = path ? path[1] : "";
    const has = Object.prototype.hasOwnProperty.call(files, name);
    const text = has ? files[name] : null;
    const bytes = has ? Buffer.from(text, "utf8") : null;

    let reply;
    if (/wc -c/.test(prompt)) {
      if (bytes === null) reply = "__PDLC_FILE_MISSING__";
      else {
        const newlines = (text.match(/\n/g) || []).length;
        const endsNL = text.endsWith("\n") ? 1 : 0;
        const sha = createHash("sha256").update(bytes).digest("hex");
        reply = `${bytes.length}\n${newlines}\n${endsNL}\n${sha}  ${name}\n${sha}  ${name}`;
      }
    } else {
      const m = /sed -n '(\d+),(\d+)p' "[^"]+"/.exec(prompt);
      if (!m || bytes === null) reply = "__PDLC_FILE_MISSING__";
      else {
        const chunk = sedRange(text, Number(m[1]), Number(m[2]));
        const sha = createHash("sha256").update(Buffer.from(chunk, "utf8")).digest("hex");
        // The second command's output is the tool-printed BOF line, the chunk,
        // then the tool-printed EOF marker line; when the chunk has no trailing
        // newline the EOF marker abuts it, exactly as `printf` after `sed`
        // behaves live.
        reply = `SHA256: ${sha}\n__PDLC_CHUNK_BOF__\n${chunk}__PDLC_CHUNK_EOF__`;
      }
    }
    if (corrupt) {
      const replacement = corrupt(prompt, reply, index);
      if (replacement !== undefined) return replacement;
    }
    return reply;
  };
  agent.calls = calls;
  return agent;
}
