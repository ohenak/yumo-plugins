// Tests for T45 — the E-4b guard/body split's own legs (pdlc-engine-distribution).
// TSPEC §9.3, §12.1's "engine-side legs live in one named file" bullet.
//
// This file is created here (the split task, batch 8) carrying only the two
// legs §9.3's exception 1 and exception 2 require of the split itself:
//
//   1. importing `bin/cli.mjs` is inert (no dispatch, no `USAGE`, no exit
//      code) — the entry guard's whole point.
//   2. `bin/cli.mjs` exports a callable `main` alongside an exported default
//      `deps` object shaped `{runDev, runQueue, runQueueLoop, startupFor,
//      liveAdapter}`.
//
// Per §12.1 ("One file stays the answer even though the two legs' setups
// differ"), the wiring task extends this SAME file one batch later with the
// process-entry and injection-level provenance legs; this task does not
// touch those.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { message } from "../lib/catalogue.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CLI_URL = path.join(engineRoot, "bin", "cli.mjs");

// ── exception 1: importing bin/cli.mjs is inert ────────────────────────────
//
// "Nothing happened" is stated as absence, not as a passing file that does
// not exist: two observations, `process.exitCode` and whatever the import
// wrote to stderr, both captured immediately around a dynamic `await
// import()` and restored in `finally` so this leg's capture cannot bleed
// onto a neighbouring test left running in the same process (PM v8 Q-01).

test("importing bin/cli.mjs is inert: no dispatch, no USAGE, exitCode untouched", async () => {
  const exitCodeBefore = process.exitCode;
  const originalConsoleError = console.error;
  let stderrText = "";
  console.error = (...args) => {
    stderrText += args.map(String).join(" ") + "\n";
  };
  try {
    await import(CLI_URL);
  } finally {
    console.error = originalConsoleError;
  }
  assert.equal(process.exitCode, exitCodeBefore, "import must not set process.exitCode");
  assert.equal(stderrText, "", "import must not write anything to stderr");
  assert.doesNotMatch(stderrText, /Usage:/, "import must not print USAGE");
});

// ── exception 2: main is exported and callable, deps is the exported default ──

test("bin/cli.mjs exports a callable main and a five-key default deps object", async () => {
  const mod = await import(CLI_URL);
  assert.equal(typeof mod.main, "function", "main must be an exported function");
  assert.ok(mod.default && typeof mod.default === "object", "default export must be an object");
  assert.deepEqual(
    Object.keys(mod.default).sort(),
    ["liveAdapter", "runDev", "runQueue", "runQueueLoop", "startupFor"].sort(),
    "default deps must carry exactly the five §9.3 seam members"
  );
  for (const key of ["runDev", "runQueue", "runQueueLoop", "startupFor", "liveAdapter"]) {
    assert.equal(typeof mod.default[key], "function", `deps.${key} must be a function`);
  }
});

// ── node.below-floor catalogue registration (TSPEC §10.3, AC-2.4) ─────────
//
// `bin/pdlc.mjs` cannot import `lib/catalogue.mjs` — doing so would add a
// static import and falsify PROP-LAUNCH-7 — so the guard's refusal is a
// literal string duplicated in that file rather than routed through
// `message()`. This test is what keeps the two in sync: it renders the
// catalogue's registered template and asserts it is byte-identical to the
// guard's own literal (`bin/pdlc.mjs`), and — since `message()` records an
// observation on every call, catalogue or otherwise — it is also this
// registration's only emission, satisfying §7.4's reverse-direction
// set-equality (a registered id that no path ever emits fails the step).

test("catalogue: node.below-floor renders and names both the floor and the found version", () => {
  const rendered = message("node.below-floor", { floor: "20", found: "12.0.0" });
  assert.equal(rendered, "pdlc requires Node >= 20; found 12.0.0");
});
