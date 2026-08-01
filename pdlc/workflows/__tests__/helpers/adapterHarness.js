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
  "rtBase64Decode",
  "rtUtf8Decode",
  "rtChunkPlan",
  "rtReadChunk",
  "rtReadFile",
  "rtCheckFile",
  "rtListFiles",
  "rtDevInjections",
];

/**
 * The host `parallel`: an array of THUNKS, every one started, a thrown thunk
 * resolved to `null` rather than rejecting the whole call. Mirrors the runtime,
 * which is what makes the adapter's own null-check meaningful.
 */
export const hostParallel = (thunks) =>
  Promise.all(
    (thunks || []).map((thunk) =>
      Promise.resolve()
        .then(() => thunk())
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
 * `rtReadFile` issues (the `wc -c` size probe and the `tail | head | base64`
 * chunk fetch) from the real bytes of `files`.
 *
 * `corrupt(prompt, base64, callIndex)` may return a replacement reply — the
 * point of the harness: it is how a truncated chunk, a fenced reply or a
 * garbage size is injected without touching production code.
 *
 * @param {Record<string, string>} files  path -> contents (decoded text)
 * @param {(prompt: string, base64: string, callIndex: number) => (string|undefined)} [corrupt]
 */
export function fileAgent(files, corrupt) {
  const calls = [];
  const agent = async (prompt, opts) => {
    const index = calls.length;
    calls.push({ prompt, opts });
    const path = /"([^"]+)"/.exec(prompt);
    const name = path ? path[1] : "";
    const bytes = Object.prototype.hasOwnProperty.call(files, name)
      ? Buffer.from(files[name], "utf8")
      : null;

    let reply;
    if (/wc -c/.test(prompt)) {
      reply = bytes === null ? "__PDLC_FILE_MISSING__" : String(bytes.length);
    } else {
      const m = /tail -c \+(\d+) "[^"]+" \| head -c (\d+)/.exec(prompt);
      if (!m || bytes === null) reply = "__PDLC_FILE_MISSING__";
      else {
        const offset = Number(m[1]) - 1;
        reply = bytes.subarray(offset, offset + Number(m[2])).toString("base64");
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
