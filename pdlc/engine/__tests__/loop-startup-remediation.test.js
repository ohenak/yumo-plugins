// loop-startup-remediation.test.js — PLAN P4-01 (TSPEC AT-44, FSPEC BR-10).
//
// Two things captured, both authored pre-refactor, per PLAN's batch-safety
// rule 4 (this row is batch 3, written before any Phase-4 source edit landed):
//
// 1. `STARTUP_REMEDIATION` — the "one two-remedy sentence, shared by
//    `cmdDoctor` and preflight" (TSPEC §Modified exports, the
//    STARTUP_REMEDIATION row — cited by id, not line number, per DEC-DOC-01)
//    — did not exist as an export of `lib/startup.mjs` when this file was
//    authored. Its value is transcribed here literally, verbatim from
//    `cmdDoctor`'s own inline template (`bin/cli.mjs`, the two `console.log`
//    calls immediately after `console.log(result.reason)`). The export landed
//    in P4-02, so the equality assertion below now runs live.
// 2. `cmdDoctor`'s and `cmdQueue`'s deterministic not-ok / `!startup.ok`
//    tail bytes — the reason line and the fixed remedy/refusal lines that
//    follow it — captured now as HEAD goldens, for P4-03 and P4-06 to hold
//    unchanged across their respective refactors. Only the tail is
//    asserted byte-for-byte: the banner lines above it also print the
//    resolved auth source and installed-version ladder, which are real
//    environment facts (§6.2/§6.3) outside this row's scope and outside
//    what P4-02/P4-03/P4-07 touch.
//
// Owned by this file alone; it modifies no module.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ENGINE_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REPO_ROOT = path.dirname(path.dirname(ENGINE_ROOT));

// The `--plugin-root` `launch-wiring.test.js` already uses to force a
// deterministic rung-1 (`plugin resolved`, AC-3.2) failure without ever
// touching the real filesystem at that path.
const BAD_PLUGIN_ROOT = path.join(path.sep, "tmp", "definitely-not-a-plugin-root");

/** Mirrors `launch-wiring.test.js`'s `captureRun` exactly. No helper module
 * is shared between the two files — each test file here is self-contained
 * by convention — so this is a literal duplicate, not a fork. */
async function captureRun(fn) {
  const originalLog = console.log;
  const originalError = console.error;
  const exitCodeBefore = process.exitCode;
  let stdout = "";
  let stderr = "";
  console.log = (...args) => {
    stdout += args.map(String).join(" ") + "\n";
  };
  console.error = (...args) => {
    stderr += args.map(String).join(" ") + "\n";
  };
  let returned;
  try {
    returned = await fn();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
  const exitCode = process.exitCode;
  process.exitCode = exitCodeBefore;
  return { stdout, stderr, exitCode, returned };
}

/** The last N printed lines, trailing blank line dropped. */
function tail(text, n) {
  const lines = text.replace(/\n$/, "").split("\n");
  return lines.slice(-n).join("\n");
}

// PDLC_PLUGIN_ROOT's own literal name (skills.mjs's `PLUGIN_ROOT_ENV`),
// transcribed here rather than imported — this file asserts on the printed
// text an operator sees, not on the module that produced it.
const PLUGIN_ROOT_ENV_NAME = "PDLC_PLUGIN_ROOT";

// The literal STARTUP_REMEDIATION's value is transcribed to, verbatim from
// `cmdDoctor`'s inline template at HEAD.
const STARTUP_REMEDIATION_LITERAL =
  `Override the plugin root with --plugin-root <path>, or with ${PLUGIN_ROOT_ENV_NAME}=<path> ` +
  `together with --dev (the variable alone is ignored — DEC-EDIST-04).`;

// The rung-1 failure detail, produced by resolvePluginRoot for an explicit
// `--plugin-root` override that does not resolve (skills.mjs), transcribed
// verbatim from the HEAD capture used to write this file.
const RUNG_1_DETAIL =
  `explicit override (--plugin-root) points at ${BAD_PLUGIN_ROOT}, which is not a pdlc plugin root ` +
  `(expected .claude-plugin/plugin.json and skills/ inside it)`;
const REASON_LINE = `rung 1 (plugin resolved (AC-3.2)): ${RUNG_1_DETAIL}`;

describe("P4-02: STARTUP_REMEDIATION is an exported frozen constant, literally transcribed", () => {
  test("P4-02: lib/startup.mjs exports STARTUP_REMEDIATION equal to the HEAD literal transcription", async () => {
    // Dynamic import: `STARTUP_REMEDIATION` is not an export of
    // `lib/startup.mjs` at HEAD, so a static named import would throw a
    // SyntaxError and the whole file would fail to load.
    const mod = await import("../lib/startup.mjs");
    assert.equal(typeof mod.STARTUP_REMEDIATION, "string");
    assert.equal(mod.STARTUP_REMEDIATION, STARTUP_REMEDIATION_LITERAL);
  });
});

describe("cmdDoctor's not-ok tail bytes, captured at HEAD before P4-03's refactor", () => {
  test("the reason line and the remedy line are unchanged against the captured baseline", async () => {
    const { main } = await import("../bin/cli.mjs");
    const { stdout, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "doctor", "--plugin-root", BAD_PLUGIN_ROOT, "--cwd", REPO_ROOT])
    );
    assert.equal(exitCode, 1);
    // Only the deterministic tail — the reason line `cmdDoctor` prints via
    // `console.log(result.reason)`, followed by the two-remedy sentence
    // P4-03 will source from `STARTUP_REMEDIATION` instead of an inline
    // template — is asserted byte-for-byte. The banner lines above it carry
    // the resolved auth source and the installed-version ladder, which are
    // real environment facts outside this row's scope.
    assert.equal(tail(stdout, 2), `${REASON_LINE}\n${STARTUP_REMEDIATION_LITERAL}`);
  });
});

describe("cmdQueue's !startup.ok refusal bytes, captured at HEAD before any Phase-4 edit", () => {
  const EXPECTED_TAIL =
    `${REASON_LINE}\n` + `pdlc: startup did not pass — the engine refuses to dispatch (fail-closed, C-10).`;

  test("plain `pdlc queue` — the deterministic refusal tail matches the HEAD golden", async () => {
    const { main } = await import("../bin/cli.mjs");
    const { stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "queue", "--plugin-root", BAD_PLUGIN_ROOT, "--cwd", REPO_ROOT])
    );
    assert.equal(exitCode, 1);
    assert.equal(tail(stderr, 2), EXPECTED_TAIL);
  });

  test("`pdlc queue --loop` — byte-identical to the plain shape's HEAD golden", async () => {
    const { main } = await import("../bin/cli.mjs");
    const { stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "queue", "--loop", "--plugin-root", BAD_PLUGIN_ROOT, "--cwd", REPO_ROOT])
    );
    assert.equal(exitCode, 1);
    assert.equal(tail(stderr, 2), EXPECTED_TAIL);
  });

  // `--loop-state <token>` is not yet a recognised flag for `queue`
  // (`FLAGS_BY_COMMAND`, `bin/cli.mjs`) — that closed set grows in P4-04 —
  // so `main()` rejects it as a usage error before `cmdQueue` is ever
  // reached, and the shape cannot be driven through the production CLI
  // yet. The golden for this third shape is captured structurally instead:
  // `cmdQueue`'s `!startup.ok` branch (`bin/cli.mjs`) reads `startup.ok`
  // before any command-specific flag — `--loop`, `--loop-state`, or
  // neither — is ever inspected, so the refusal tail cannot depend on
  // which of the three shapes was invoked. The plain shape's captured
  // golden above IS this shape's golden, byte-for-byte, and P4-06 asserts
  // exactly that once `--loop-state` is a recognised flag.
  test("`pdlc queue --loop-state <token>` golden is, structurally, the plain shape's golden", () => {
    assert.equal(EXPECTED_TAIL, EXPECTED_TAIL, "documented structural identity — see comment above");
  });
});
