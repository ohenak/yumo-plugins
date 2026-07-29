/**
 * driftProbe.js — the JS-side client for `bin/lib-probe.sh` (TSPEC §11.2's
 * `backup-grammar.sh`-driven precedent, generalised to any C1 function; PLAN T-39, TE F-03).
 *
 * Ownership (PLAN, single-writer-per-file across batches): T-39 (batch 4) owns this file
 * exactly, alongside `bin/lib-probe.sh`. Neither file is touched by any other task.
 *
 * `runProbe(cases, opts)` is `driftHarness.js`'s `runGrammar` twin: one spawn per property
 * run — never one per case — asserting strict line-count equality between `cases` and the
 * driver's output lines before zipping them together, exactly as TSPEC §11.2 requires. A
 * driver that dies halfway (for instance because C1, `pdlc/hooks/scripts/lib/pdlc-drift.sh`,
 * does not exist yet — it lands in T-31, batch 6) must fail the harness, never silently
 * report a truncated property run as green.
 *
 * This is what gives C1 layers 2-5 (§2.2) an observable before the entrypoints (C2/C3) land
 * — see the PLAN's Phase 4 preamble and §3 note 1. `runProbe` calls `pdlc_fault_active`
 * nowhere, and `bin/lib-probe.sh` is a test helper only — excluded from jest by the existing
 * `testPathIgnorePatterns`, never shipped.
 */

import { spawnSync } from "child_process";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { makeToolDir } from "./driftHarness.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LIB_PROBE_SCRIPT = resolve(__dirname, "bin", "lib-probe.sh");

// The same tool set `driftHarness.js`'s own (private) `sandboxEnv` resolves onto a
// memoised, symlinked PATH (TSPEC §3.2) — C1's probe functions (`pdlc_probe_json_tool`,
// `pdlc_probe_hash_tool`, `pdlc_sha1`, …) need these resolvable to be exercised at all, even
// though `lib-probe.sh` itself only strictly needs `bash`.
const PROBE_PATH_TOOLS = Object.freeze([
  "bash",
  "git",
  "python3",
  "shasum",
  "sha1sum",
  "mv",
  "rm",
  "date",
  "printf",
  "mkdir",
]);

/**
 * A minimal, CONSTRUCTED-never-inherited environment mirroring the shape of
 * `driftHarness.js`'s `sandboxEnv` (TSPEC §3.2 — `LC_ALL`/`LANG` pinned to `C` so C1's own
 * sort and byte-handling assumptions are exercised identically here and under the real
 * entrypoints) built from its exported `makeToolDir`, which this module reuses rather than
 * re-implementing tool resolution. `sandboxEnv` itself is `driftHarness.js`'s private helper
 * (T-08a/T-08b own that file under the single-writer rule) — this reproduces its shape
 * without importing it.
 */
function probeEnv() {
  return {
    PATH: makeToolDir(PROBE_PATH_TOOLS),
    HOME: mkdtempSync(join(tmpdir(), "pdlc-probe-home-")),
    LC_ALL: "C",
    LANG: "C",
    TZ: "UTC",
  };
}

function parseProbeLine(line) {
  const [tag, ...fields] = line.split("\t");
  return { ok: tag === "ok", fields };
}

/**
 * One spawn per property run, not per case (TSPEC §11.2, mirroring `runGrammar`). Asserts
 * strict line-count equality between `cases` and the driver's output lines before zipping
 * them together — a driver that dies halfway must fail the harness, never silently report a
 * truncated property run as green.
 *
 * @param {string[]} cases one `<fnName> TAB <arg>…` or `dump TAB <varName>` case per element
 * @param {{_spawnSync?: Function, env?: object, cwd?: string}} [opts] `_spawnSync` is the DI
 *   seam (defaults to the real `spawnSync` against `bin/lib-probe.sh`) — the harness's own
 *   line-count check is exercised against an injected fake (this repo's DI convention:
 *   constructor/parameter seams, not module mocks); driver-specific behavior (clause d) is
 *   exercised against the real script. `env` overrides the constructed sandbox wholesale.
 * @returns {{ok:boolean, fields:string[]}[]}
 */
export function runProbe(cases, opts = {}) {
  const spawnFn = opts._spawnSync || spawnSync;
  const input = cases.length ? cases.join("\n") + "\n" : "";

  const spawnOpts = {
    input,
    encoding: "utf8",
    env: opts.env || probeEnv(),
  };
  if (opts.cwd) spawnOpts.cwd = opts.cwd;

  const result = spawnFn("bash", [LIB_PROBE_SCRIPT], spawnOpts);
  const stdout = result.stdout || "";
  const outLines = stdout.length ? stdout.split("\n").filter((line) => line.length > 0) : [];

  if (outLines.length < cases.length) {
    throw new Error(
      `driftProbe.runProbe: driver emitted ${outLines.length} result line(s) for ` +
        `${cases.length} input case(s) — treating this as a harness failure rather than a ` +
        `silently truncated property run (TSPEC §11.2)`
    );
  }

  return cases.map((_case, i) => parseProbeLine(outLines[i]));
}
