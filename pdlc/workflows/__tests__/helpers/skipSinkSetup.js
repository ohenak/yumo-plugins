/**
 * skipSinkSetup.js — jest `globalSetup`. Creates the run-scoped skip sink and publishes its
 * path in `process.env`, which every worker process inherits (workers are forked after
 * globalSetup). The path is deterministic *per run* — one `mkdtemp` directory under the OS
 * tmpdir, never inside the working tree — and the matching `globalTeardown` removes it.
 */

import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { SKIP_SINK_ENV } from "./skipSink.js";

export default function setupSkipSink() {
  const dir = mkdtempSync(join(tmpdir(), "pdlc-skip-sink-"));
  const path = join(dir, "skips.jsonl");
  writeFileSync(path, "");
  process.env[SKIP_SINK_ENV] = path;
  // globalTeardown gets a fresh module registry, so hand it the directory through globalThis
  // as well as the env var (jest passes neither directly).
  globalThis.__PDLC_SKIP_SINK_DIR__ = dir;
}
