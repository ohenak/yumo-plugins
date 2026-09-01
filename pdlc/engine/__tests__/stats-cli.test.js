// `pdlc stats [feature] [--json] [--cwd <path>]` — CLI process-level tests
// (PLAN T-09, feature pdlc-stats; TSPEC §3.4, §5, §6.2 "Process" row).
//
// RED at T-09: `stats` is not yet a case in `bin/cli.mjs`'s `main()` switch
// (TSPEC §3.4's "Four edits, all additive" have not landed), so today every
// invocation below falls through to the `default` branch — `USAGE` plus
// "Unknown command: stats" on stderr, exit 1. That happens to share exit
// code 1 and empty stdout with several of the real refusals this file
// pins, so every assertion below also pins the SPECIFIC stderr content
// (the offending flag token, the feature name, the JSON error shape) that
// only the real `cmdStats`/`runStats` wiring can produce — never a bare
// exit-code/empty-stdout check alone, which the `default` branch already
// satisfies today and would false-green this file at HEAD.
//
// T-17 lands `FLAGS_BY_COMMAND.stats`, the `case "stats"` arm, `cmdStats`
// and the `USAGE` line (turning T-09, T-10, T-11 green together per the
// PLAN's batch table). Until then every test in this file fails for that
// one reason — command not recognised — not for a wrong/absent metric.
//
// Process-level tests run `main(["node","pdlc","stats",...])` IN-PROCESS,
// per TSPEC §6.2's "Process" row and the `captureRun` precedent it cites in
// `pdlc/engine/__tests__/loop-cli.test.js`. That precedent swaps only
// `console.log`/`console.error`; `cmdStats` (TSPEC §3.4) writes via
// `process.stdout.write`/`process.stderr.write` directly, so the
// `captureRun` below extends the precedent to swap those two streams as
// well as `console.*` — both are captured so a future implementation detail
// (which stream carries which byte) never desyncs this file from `cmdStats`.

import test, { describe } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";

import { main } from "../bin/cli.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));

/**
 * Mirrors `loop-cli.test.js`'s `captureRun`, extended (TSPEC §6.2) to swap
 * `process.stdout.write`/`process.stderr.write` in addition to
 * `console.log`/`console.error`/`console.info`/`console.warn`/`console.debug`,
 * since `cmdStats` writes through the raw streams, not `console.*`.
 * Restores every seam in `finally` and restores `process.exitCode` to its
 * pre-call value so one usage-error run never leaks `1` into the next test
 * in this shared worker process (TSPEC §6.2's stated precondition).
 */
async function captureRun(fn) {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalConsoleDebug = console.debug;
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;
  const exitCodeBefore = process.exitCode;
  let stdout = "";
  let stderr = "";
  console.log = (...args) => {
    stdout += args.map(String).join(" ") + "\n";
  };
  console.info = console.log;
  console.debug = console.log;
  console.error = (...args) => {
    stderr += args.map(String).join(" ") + "\n";
  };
  console.warn = console.error;
  process.stdout.write = (chunk) => {
    stdout += typeof chunk === "string" ? chunk : chunk.toString("utf8");
    return true;
  };
  process.stderr.write = (chunk) => {
    stderr += typeof chunk === "string" ? chunk : chunk.toString("utf8");
    return true;
  };
  let returned;
  try {
    returned = await fn();
  } finally {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.debug = originalConsoleDebug;
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }
  const exitCode = process.exitCode;
  process.exitCode = exitCodeBefore;
  return { stdout, stderr, exitCode, returned };
}

/**
 * The specific, offending-token-naming line of a usage error, as opposed to
 * the static `USAGE` banner both `checkFlags` and `main`'s `default` branch
 * print ahead of it. `USAGE` itself mentions `--plugin-root`, `--cwd` and
 * `--dry-run` (they are real flags of other commands), so a naive
 * `assert.match(stderr, /--plugin-root/)` would pass on the `default:
 * Unknown command` branch today for the wrong reason — matching the banner,
 * not an offending-token message that does not exist yet. Isolating the
 * last non-empty line sidesteps that: `checkFlags` writes `USAGE` then the
 * one-line error as two separate `console.error` calls, so the error is
 * always the final line, and today's `default` branch's final line is
 * `Unknown command: stats`, which names none of these tokens.
 */
function lastStderrLine(stderr) {
  const lines = stderr.split("\n").filter((line) => line.length > 0);
  return lines[lines.length - 1] ?? "";
}

// ─── AT-24 — the flag set is closed, and a usage error prints nothing to
//     stdout (FSPEC §6.9, TSPEC §3.4/§5's first row, BR-01/BR-20/EC-08) ───
//
// Five refusals, each asserted with the SAME two conjuncts: stdout is
// exactly "" (BR-20's one usage-error exception), and stderr names the
// specific offending token — never a bare exit-code check, which the
// `default: Unknown command` branch already satisfies at HEAD.

describe("T-17: AT-24: pdlc stats's flag set is closed; a usage error writes nothing to stdout", () => {
  test("`--dev` is refused even though `doctor`/`dev`/`queue` accept it", async () => {
    const { stdout, stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "stats", "pdlc-stats", "--dev", "--cwd", repoRoot]),
    );
    assert.equal(stdout, "", stderr);
    assert.equal(exitCode, 1);
    assert.match(lastStderrLine(stderr), /--dev/);
  });

  test("`--plugin-root <path>` is refused even though `dev`/`queue`/`doctor` accept it", async () => {
    const { stdout, stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "stats", "pdlc-stats", "--plugin-root", "/tmp/nope", "--cwd", repoRoot]),
    );
    assert.equal(stdout, "", stderr);
    assert.equal(exitCode, 1);
    assert.match(lastStderrLine(stderr), /--plugin-root/);
  });

  test("`--dry-run` is refused even though `dev`/`queue` accept it", async () => {
    const { stdout, stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "stats", "pdlc-stats", "--dry-run", "--cwd", repoRoot]),
    );
    assert.equal(stdout, "", stderr);
    assert.equal(exitCode, 1);
    assert.match(lastStderrLine(stderr), /--dry-run/);
  });

  test("`--cwd` with no value token is a usage error, not a resolve against process.cwd()", async () => {
    const { stdout, stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "stats", "pdlc-stats", "--cwd"]),
    );
    assert.equal(stdout, "", stderr);
    assert.equal(exitCode, 1);
    assert.match(lastStderrLine(stderr), /--cwd/);
  });

  test("a token accepted by no command anywhere is refused, naming itself", async () => {
    const { stdout, stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "stats", "pdlc-stats", "--never-anywhere-token", "--cwd", repoRoot]),
    );
    assert.equal(stdout, "", stderr);
    assert.equal(exitCode, 1);
    assert.match(lastStderrLine(stderr), /--never-anywhere-token/);
  });

  test("all five refusals hold identically under `--json`: stdout is still exactly \"\", never a half document", async () => {
    const { stdout, stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "stats", "pdlc-stats", "--json", "--dev", "--cwd", repoRoot]),
    );
    assert.equal(stdout, "", stderr);
    assert.equal(exitCode, 1);
    assert.match(lastStderrLine(stderr), /--dev/);
  });
});

// ─── AT-04 — stdout is exactly one JSON document (FSPEC §6.2, TSPEC §4.2.1) ─
//
// Given a reportable feature (this repo's own `docs/pdlc-stats/`, real,
// live at HEAD), `pdlc stats pdlc-stats --json` must produce stdout that
// `JSON.parse`s as a single document with no surrounding text, with any
// diagnostic output on stderr instead, exit 0. At HEAD `stats` is
// unrecognised, so stdout is empty — `JSON.parse("")` throws, which is the
// right-reason failure this case pins until T-17 lands `cmdStats`.

describe("T-17: AT-04: stdout is exactly one JSON document under --json", () => {
  test("`pdlc stats pdlc-stats --json --cwd <repoRoot>` stdout parses as a single JSON document, exit 0", async () => {
    // A real child process, not captureRun: the in-process capture swaps
    // `process.stdout.write` across await points, and under `node --test`'s
    // child-process protocol the runner's own serialized reporter frames land
    // in the buffer ahead of the CLI's document — which this oracle's "no
    // surrounding text" clause would then fail for a reason that is not AT-04's.
    const { spawnSync } = await import("node:child_process");
    const run = spawnSync(
      process.execPath,
      [path.join(engineRoot, "bin", "cli.mjs"), "stats", "pdlc-stats", "--json", "--cwd", repoRoot],
      { encoding: "utf8" },
    );
    const { stdout, stderr } = run;
    const exitCode = run.status;
    assert.equal(exitCode, 0, stderr || stdout);
    let parsed;
    assert.doesNotThrow(() => {
      parsed = JSON.parse(stdout);
    }, `stdout did not parse as JSON: ${JSON.stringify(stdout)}`);
    assert.equal(typeof parsed, "object");
    assert.notEqual(parsed, null);
  });
});

// ─── AT-23 — an unknown feature is reported by name, in both modes
//     (FSPEC §6.9, TSPEC §5's "not_found" row, BR-30) ────────────────────
//
// A feature name matching no directory under `docs/` or `docs/completed/`.
// Human mode: exit 1, stderr names the feature. JSON mode: exit 1, stdout
// parses to exactly the three BR-30 keys (`schemaVersion`, `error`,
// `feature`), `error` carries exactly `reason`/`message`,
// `error.reason === "not_found"`, `feature` is the supplied name.

const UNKNOWN_FEATURE = "pdlc-stats-cli-test-does-not-exist";

describe("T-17: AT-23: an unknown feature is reported by name, in both modes", () => {
  test("human mode: exit 1, stderr names the unknown feature", async () => {
    const { stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "stats", UNKNOWN_FEATURE, "--cwd", repoRoot]),
    );
    assert.equal(exitCode, 1);
    assert.match(stderr, new RegExp(UNKNOWN_FEATURE));
  });

  test("--json mode: stdout is exactly the BR-30 three-key error object, reason \"not_found\"", async () => {
    const { stdout, stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "stats", UNKNOWN_FEATURE, "--json", "--cwd", repoRoot]),
    );
    assert.equal(exitCode, 1, stderr);
    let parsed;
    assert.doesNotThrow(() => {
      parsed = JSON.parse(stdout);
    }, `stdout did not parse as JSON: ${JSON.stringify(stdout)}`);
    assert.deepEqual(new Set(Object.keys(parsed)), new Set(["schemaVersion", "error", "feature"]));
    assert.deepEqual(new Set(Object.keys(parsed.error)), new Set(["reason", "message"]));
    assert.equal(parsed.error.reason, "not_found");
    assert.equal(parsed.feature, UNKNOWN_FEATURE);
  });
});

// ─── AT-27's single-feature half — an unreadable feature directory fails
//     the single run (FSPEC §6.9, TSPEC §5's "unreadable_feature" row,
//     BR-20, D-10) ──────────────────────────────────────────────────────
//
// A feature whose directory exists but cannot be listed. Single-feature
// mode emits no report, names the feature and the reason on stderr, exits
// 1 — never fleet's gap-row-and-continue behaviour (that is AT-27's OTHER
// half, out of this task's scope). The `--json` leg additionally asserts
// BR-30's error object is on stdout — `error.reason === "unreadable_feature"`
// — never empty stdout (D-10 explicitly rules that out).
//
// Skipped when running as root: `chmod 000` does not deny a root reader,
// so the fixture could not falsify anything in that environment.

const isRoot = typeof process.getuid === "function" && process.getuid() === 0;

function makeUnreadableFeatureFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-stats-cli-unreadable-"));
  const docsDir = path.join(root, "docs");
  const featureName = "unreadable-feature";
  const featureDir = path.join(docsDir, featureName);
  fs.mkdirSync(featureDir, { recursive: true });
  fs.writeFileSync(path.join(featureDir, "REQ-unreadable-feature.md"), "# REQ\n");
  fs.chmodSync(featureDir, 0o000);
  return { root, featureDir, featureName };
}

function cleanupUnreadableFeatureFixture({ root, featureDir }) {
  fs.chmodSync(featureDir, 0o755);
  fs.rmSync(root, { recursive: true, force: true });
}

describe("T-17: AT-27 (single-feature half): an unreadable feature directory fails the single run", () => {
  test("human mode: no report, feature and reason named on stderr, exit 1", { skip: isRoot }, async () => {
    const fixture = makeUnreadableFeatureFixture();
    try {
      const { stdout, stderr, exitCode } = await captureRun(() =>
        main(["node", "pdlc", "stats", fixture.featureName, "--cwd", fixture.root]),
      );
      assert.equal(exitCode, 1);
      assert.equal(stdout, "");
      assert.match(stderr, new RegExp(fixture.featureName));
    } finally {
      cleanupUnreadableFeatureFixture(fixture);
    }
  });

  test("--json mode: stdout carries BR-30's error object, reason \"unreadable_feature\" — not empty stdout", { skip: isRoot }, async () => {
    const fixture = makeUnreadableFeatureFixture();
    try {
      const { stdout, stderr, exitCode } = await captureRun(() =>
        main(["node", "pdlc", "stats", fixture.featureName, "--json", "--cwd", fixture.root]),
      );
      assert.equal(exitCode, 1, stderr);
      assert.notEqual(stdout, "");
      let parsed;
      assert.doesNotThrow(() => {
        parsed = JSON.parse(stdout);
      }, `stdout did not parse as JSON: ${JSON.stringify(stdout)}`);
      assert.deepEqual(new Set(Object.keys(parsed)), new Set(["schemaVersion", "error", "feature"]));
      assert.equal(parsed.error.reason, "unreadable_feature");
      assert.equal(parsed.feature, fixture.featureName);
    } finally {
      cleanupUnreadableFeatureFixture(fixture);
    }
  });
});

// ─── End-to-end real-path conjunct: DoD rounds = 2 for pdlc-loop-economics,
//     and `--cwd` is REQUIRED (TSPEC §6.1's AT-11 measurement; `Engine
//     tests` runs `cd pdlc/engine && npm test`, and `pdlc/engine/` itself
//     carries no `docs/`, so the flagless form is a root-not-found refusal,
//     not an ambient-cwd success) ───────────────────────────────────────
//
// `docs/completed/pdlc-loop-economics/` carries
// `CODE_REVIEW-pdlc-loop-economics-v{1,2}.md` at HEAD (verified present,
// TSPEC §6.1): DoD rounds is the highest version present, `2` — not `3`,
// not a file count. This drives the production `statsIo` (real `node:fs`)
// against this repository's own archive, exercised through the CLI
// process entry, over the SAME `main()` this file's other cases use.

describe("T-17: End-to-end: pdlc stats pdlc-loop-economics --json --cwd <repoRoot> reads DoD rounds 2", () => {
  test("`--json --cwd <repoRoot>` reads dodRounds === 2 against the real repository archive", async () => {
    const { stdout, stderr, exitCode } = await captureRun(() =>
      main(["node", "pdlc", "stats", "pdlc-loop-economics", "--json", "--cwd", repoRoot]),
    );
    assert.equal(exitCode, 0, stderr || stdout);
    let parsed;
    assert.doesNotThrow(() => {
      parsed = JSON.parse(stdout);
    }, `stdout did not parse as JSON: ${JSON.stringify(stdout)}`);
    // dodRounds is the `{state, rounds}` discriminated shape (TSPEC §3.2's
    // metric envelope), never a bare number — the measurement itself is 2.
    assert.deepEqual(parsed.dodRounds, { state: "measured", rounds: 2 });
  });

  // `--cwd` is required (TSPEC §3.4's "already `VALUE_FLAGS`") — the
  // flagless form resolves the root from `process.cwd()` (TSPEC §3.4's
  // `cmdStats` sketch), so it is asserted deterministically here by
  // `chdir`-ing this process to `pdlc/engine/` itself (the exact directory
  // `Engine tests`'s `cd pdlc/engine && npm test` leaves the suite running
  // in), rather than trusting whatever directory happened to invoke this
  // file — `pdlc/engine/` carries no `docs/`, so the omission is a
  // `no_docs_root` refusal at exit 1, never a silent wrong-root success.
  test("the flagless form (`--cwd` omitted) is a root-not-found refusal at exit 1 from pdlc/engine/", async () => {
    const cwdBefore = process.cwd();
    process.chdir(engineRoot);
    try {
      const { stdout, stderr, exitCode } = await captureRun(() =>
        main(["node", "pdlc", "stats", "pdlc-loop-economics", "--json"]),
      );
      assert.equal(exitCode, 1, stdout);
      let parsed;
      assert.doesNotThrow(() => {
        parsed = JSON.parse(stdout);
      }, `stdout did not parse as JSON: ${JSON.stringify(stdout)}`);
      assert.deepEqual(new Set(Object.keys(parsed)), new Set(["schemaVersion", "error", "feature"]));
      assert.equal(parsed.error.reason, "no_docs_root");
    } finally {
      process.chdir(cwdBefore);
    }
  });
});

// ─── AT-26/AT-27 fleet halves: the no-feature-argument invocation, driven
//     through the SAME production caller (`main()` → `case "stats"` →
//     `cmdStats` → real `statsIo()`/`statsParsers()`) as the single-feature
//     legs above. CR-v1 PM F-01: `buildReport`'s fleet branch,
//     `renderFleetHuman` and `renderJson`'s fleet arm were reachable only
//     through `runStats` with an injected `fakeStatsIo`, so nothing stopped
//     `cmdStats` from ceasing to forward a null feature. These legs assemble
//     the operator-visible fleet artifact over a real temporary tree. ──────

function makeFleetFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-stats-cli-fleet-"));
  const docsDir = path.join(root, "docs");

  // A healthy feature: one spec document plus one cross-review, so every
  // metric is measurable rather than degenerate.
  const healthyDir = path.join(docsDir, "alpha-feature");
  fs.mkdirSync(healthyDir, { recursive: true });
  fs.writeFileSync(path.join(healthyDir, "REQ-alpha-feature.md"), "# REQ\n");
  fs.writeFileSync(
    path.join(healthyDir, "CROSS-REVIEW-product-manager-REQ-v1.md"),
    "# review\n",
  );

  // A feature whose directory cannot be listed: EC-21's per-feature catch-all
  // turns it into a `{gap}` row without changing the fleet's exit code.
  const brokenDir = path.join(docsDir, "beta-feature");
  fs.mkdirSync(brokenDir, { recursive: true });
  fs.writeFileSync(path.join(brokenDir, "REQ-beta-feature.md"), "# REQ\n");
  fs.chmodSync(brokenDir, 0o000);

  // BR-26: a leading-underscore directory outside NON_FEATURE_DIRS is
  // unclassified, not a feature.
  fs.mkdirSync(path.join(docsDir, "_odd-directory"), { recursive: true });

  return { root, brokenDir };
}

function cleanupFleetFixture({ root, brokenDir }) {
  fs.chmodSync(brokenDir, 0o755);
  fs.rmSync(root, { recursive: true, force: true });
}

describe("T-17: AT-26/AT-27 (fleet halves): `pdlc stats --cwd <root>` with NO feature argument", () => {
  test(
    "human mode: the assembled fleet report carries the healthy row, the gap row with its reason, and the unclassified row, at exit 0",
    { skip: isRoot },
    async () => {
      const fixture = makeFleetFixture();
      try {
        const { stdout, stderr, exitCode } = await captureRun(() =>
          main(["node", "pdlc", "stats", "--cwd", fixture.root]),
        );

        assert.equal(exitCode, 0, stderr || stdout);
        const lines = stdout.split("\n");
        assert.equal(lines[0], "Fleet");
        // The healthy row is a full metric row (BR-18's reductions), not a gap.
        const healthyRow = lines.find((l) => l.includes("alpha-feature"));
        assert.ok(healthyRow, `no alpha-feature row in:\n${stdout}`);
        assert.match(healthyRow, /REQ=1/);
        assert.match(healthyRow, /malformed=0/);
        // The gap row names the reason, not just the feature (REQ-STATS-07).
        const gapRow = lines.find((l) => l.includes("beta-feature"));
        assert.ok(gapRow, `no beta-feature row in:\n${stdout}`);
        assert.match(gapRow, /gap: /);
        assert.ok(
          gapRow.replace(/^\s*beta-feature\s+gap: /, "").length > 0,
          `the gap row carries no reason text: ${JSON.stringify(gapRow)}`,
        );
        // The unclassified row is marked as such, never silently a feature.
        assert.ok(
          lines.includes("  _odd-directory  unclassified"),
          `no unclassified row in:\n${stdout}`,
        );
      } finally {
        cleanupFleetFixture(fixture);
      }
    },
  );

  test(
    "--json mode: the fleet document's exact three-key top level, with the `gap` entry discriminant and the unclassified name outside `features`",
    { skip: isRoot },
    async () => {
      const fixture = makeFleetFixture();
      try {
        const { stdout, stderr, exitCode } = await captureRun(() =>
          main(["node", "pdlc", "stats", "--json", "--cwd", fixture.root]),
        );

        assert.equal(exitCode, 0, stderr || stdout);
        let parsed;
        assert.doesNotThrow(() => {
          parsed = JSON.parse(stdout);
        }, `stdout did not parse as JSON: ${JSON.stringify(stdout)}`);

        // BR-23 — the fleet document's exact top-level key set.
        assert.deepEqual(
          new Set(Object.keys(parsed)),
          new Set(["schemaVersion", "features", "unclassified"]),
        );
        assert.deepEqual(Object.keys(parsed.features).sort(), ["alpha-feature", "beta-feature"]);
        // The entry discriminant: four metric keys, or exactly `{gap}`.
        assert.deepEqual(
          new Set(Object.keys(parsed.features["alpha-feature"])),
          new Set(["reviewRounds", "dodRounds", "halts", "byteRatio"]),
        );
        assert.deepEqual(Object.keys(parsed.features["beta-feature"]), ["gap"]);
        assert.equal(typeof parsed.features["beta-feature"].gap, "string");
        assert.ok(parsed.features["beta-feature"].gap.length > 0);
        // Unclassified names never enter `features`.
        assert.deepEqual(parsed.unclassified, ["_odd-directory"]);
      } finally {
        cleanupFleetFixture(fixture);
      }
    },
  );
});
