/**
 * launch-wiring.test.js — Phase CR remediation of PM F-01…F-04.
 *
 * Every builder these legs drive already existed and was already unit-tested
 * before this file: `runVersionDoctor` had `version-doctor.test.js`,
 * `execLauncher` had `launcher.test.js`, `resolveVersion` had
 * `resolve-version.test.js`, `resolvePluginRoot`'s notice had
 * `plugin-root-notice.test.js`. All four were green while **no production
 * edge reached any of them** — `pdlc --version` printed `Unknown command`, a
 * pinned repo ran whatever was installed, and `PDLC_PLUGIN_ROOT` was ignored
 * in silence. That is the exact shape the CR production-caller sweep exists
 * to catch, and a unit test over a builder structurally cannot catch it.
 *
 * So this file asserts REACHABILITY, not composition. Its legs enter through
 * `main()` or `launch()` — the two real entries — and assert on what an
 * operator observes. Where a leg needs a seam it injects one (`exec`, `fs`,
 * `env`, the five-member `deps`), never to stand in for the wiring under
 * test, only to keep the leg hermetic: no leg spawns a second Node, reads a
 * real version store, or touches a consumer repo.
 *
 * Owned by this file alone; it modifies no module.
 */

import test, { describe } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const CLI_URL = pathToFileURL(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "cli.mjs")
).href;

/** Capture stdout/stderr and `process.exitCode` around one entry call. */
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

/** A fake `fs` whose `existsSync` answers from a fixed path set. */
function fakeFs(paths, dirs = {}) {
  const present = new Set(paths);
  return {
    existsSync: (p) => present.has(String(p)),
    readdirSync: (p) => {
      const entries = dirs[String(p)];
      if (entries) return entries;
      const err = new Error(`ENOENT: no such directory, scandir '${p}'`);
      err.code = "ENOENT";
      throw err;
    },
    statSync: () => ({ isDirectory: () => true }),
  };
}

const STORE_HOME = path.join(path.sep, "fake-home", ".pdlc");
const STORE_ROOT = path.join(STORE_HOME, "versions");

/** A store `fs` holding exactly `versions`, and nothing else on disk. */
function storeFs(versions) {
  return fakeFs([], { [STORE_ROOT]: versions });
}

// ─────────────────────────────────────────────────────────────────────────
// PM F-01 — the version surface exists AS A COMMAND, not only as a builder
// ─────────────────────────────────────────────────────────────────────────

describe("PM F-01: `--version` and `doctor` reach runVersionDoctor through main()", () => {
  test("`pdlc --version` reports the triple instead of failing as an unknown command", async () => {
    const { main } = await import(CLI_URL);
    const { stdout, stderr, exitCode } = await captureRun(() => main(["node", "pdlc", "--version"]));

    // The defect verbatim: before this wiring, `main()`'s switch had no
    // `--version` case, so the command fell to `default` and exited 1.
    assert.ok(
      !/Unknown command/.test(stdout + stderr),
      `\`--version\` must not fall through to the unknown-command branch. Got:\n${stdout}${stderr}`
    );
    assert.notEqual(exitCode, 1, "a diagnostic must not exit 1 on the thing it diagnoses (§6.2)");

    // AC-1.4's three reported facts, each asserted on its own.
    assert.match(stdout, /pdlc-engine v\d+\.\d+\.\d+/, "must report the engine version");
    assert.match(stdout, /engine requires .+/, "must report the declared compat range");
    assert.match(stdout, /plugin:\s+pdlc v/, "must report the plugin version it finds");
    assert.match(stdout, /^mode:\s+\S+/m, "must report the resolved mode (DEC-EDIST-07)");
  });

  test("`pdlc doctor` carries the four store lines runVersionDoctor builds, which cmdDoctor alone never printed", async () => {
    const { main } = await import(CLI_URL);
    const { stdout } = await captureRun(() => main(["node", "pdlc", "doctor"]));

    // These four are exactly what `runVersionDoctor` appends for `command:
    // "doctor"`. `cmdDoctor`'s hand-rolled banner printed none of them, and
    // their absence is what proved the builder unreached.
    for (const label of ["mode:", "store root:", "installed:", "install command:"]) {
      assert.ok(stdout.includes(label), `doctor output must carry "${label}". Got:\n${stdout}`);
    }
  });

  test("the two surfaces agree: doctor's report is `--version`'s plus the doctor-only trio, never a second rendering", async () => {
    const { main } = await import(CLI_URL);
    const version = await captureRun(() => main(["node", "pdlc", "--version"]));
    const doctor = await captureRun(() => main(["node", "pdlc", "doctor"]));

    // Every line `--version` prints must appear in doctor's output. A
    // second, independently-composed renderer would drift from this.
    for (const line of version.stdout.trim().split("\n")) {
      assert.ok(
        doctor.stdout.includes(line),
        `doctor must carry --version's line "${line}" verbatim — two renderings would drift`
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────
// PM F-02 — the pin EXECUTES, and an uninstalled pin REFUSES
// ─────────────────────────────────────────────────────────────────────────

/**
 * Drives the real `launch()` with every impure seam injected. `exec` and
 * `runMain` are recorders, so each leg can assert which arm was taken by
 * capture count before inspecting any argument.
 */
async function runLaunch(argv, { versions, config = {}, env = {}, execResult = 0 }) {
  const { launch } = await import(CLI_URL);
  const calls = { exec: [], runMain: [] };
  const markerBefore = process.env.PDLC_RESOLVED_ENGINE;
  delete process.env.PDLC_RESOLVED_ENGINE;

  // The consumer's config read is the one input `launch` takes from the real
  // filesystem via `readEngineConfig`, so the leg points `--cwd` at a
  // fixture directory instead of faking the reader.
  const captured = await captureRun(() =>
    launch(argv, {
      env: { ...env, PDLC_HOME: STORE_HOME },
      fs: storeFs(versions),
      homedir: path.join(path.sep, "fake-home"),
      exec: (binPath, forwardedArgv, forwardedEnv) => {
        calls.exec.push({ binPath, argv: forwardedArgv, env: forwardedEnv });
        return execResult;
      },
      runMain: async (a) => {
        calls.runMain.push({ argv: a, marker: process.env.PDLC_RESOLVED_ENGINE });
      },
    })
  );

  if (markerBefore === undefined) delete process.env.PDLC_RESOLVED_ENGINE;
  else process.env.PDLC_RESOLVED_ENGINE = markerBefore;
  void config;
  return { ...captured, calls };
}

const PINNED_REPO = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "launch-wiring",
  "pinned-to-9.9.9"
);
const UNPINNED_REPO = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "launch-wiring",
  "no-pin"
);

describe("PM F-02: the resolution hop is on the path `pdlc dev` takes", () => {
  test("pinned-and-installed EXECUTES the pinned version, forwarding argv and the resolved-child marker", async () => {
    const { calls, stdout } = await runLaunch(
      ["node", "pdlc", "dev", "docs/f/REQ-f.md", "--cwd", PINNED_REPO],
      { versions: ["0.1.0", "9.9.9"] }
    );

    // Arm taken, by count, before anything about the call.
    assert.equal(calls.exec.length, 1, "the pinned version must be exec'd, not run in this process");
    assert.equal(calls.runMain.length, 0, "the launcher must not also run the pipeline in-process");

    const call = calls.exec[0];
    assert.equal(
      call.binPath,
      path.join(STORE_ROOT, "9.9.9", "bin", "pdlc.mjs"),
      "must exec the PINNED store entry — 9.9.9 — not the highest installed one"
    );
    assert.deepEqual(
      call.argv,
      ["dev", "docs/f/REQ-f.md", "--cwd", PINNED_REPO],
      "the original argv must be forwarded verbatim"
    );
    assert.deepEqual(
      JSON.parse(call.env.PDLC_RESOLVED_ENGINE),
      { mode: "pin", version: "9.9.9", pin: "9.9.9" },
      "the child must be told the decision, so it neither re-resolves nor re-derives the mode"
    );
    assert.match(stdout, /pinned via/, "AC-5.1: the run announces the pin");
  });

  test("the pinned child's exit status is the launcher's own, verbatim", async () => {
    const { returned } = await runLaunch(["node", "pdlc", "dev", "docs/f/REQ-f.md", "--cwd", PINNED_REPO], {
      versions: ["9.9.9"],
      execResult: 7,
    });
    assert.equal(returned, 7, "a numeric child status is re-raised unchanged (DEC-EDIST-06)");
  });

  test("pinned-and-MISSING refuses, naming the pin and what is installed, and runs nothing", async () => {
    const { calls, stderr, exitCode } = await runLaunch(
      ["node", "pdlc", "dev", "docs/f/REQ-f.md", "--cwd", PINNED_REPO],
      { versions: ["0.1.0", "0.2.0"] }
    );

    // AC-5.5's defect is a SILENT FALLBACK, so the counts are the finding:
    // neither arm may run.
    assert.equal(calls.exec.length, 0, "AC-5.5: must never fall back to executing another version");
    assert.equal(calls.runMain.length, 0, "AC-5.5: must never fall back to running in-process either");
    assert.equal(exitCode, 1, "the refusal is an engine refusal (exit 1)");
    assert.ok(stderr.includes("9.9.9"), `the refusal must name the pinned version. Got:\n${stderr}`);
    assert.ok(
      stderr.includes("0.1.0") && stderr.includes("0.2.0"),
      `the refusal must name what IS installed. Got:\n${stderr}`
    );
  });

  test("no pin declared resolves to the highest installed version and says so (AC-5.2)", async () => {
    const { calls, stdout } = await runLaunch(
      ["node", "pdlc", "dev", "docs/f/REQ-f.md", "--cwd", UNPINNED_REPO],
      { versions: ["0.2.0", "0.10.0", "0.3.0"] }
    );
    assert.equal(calls.exec.length, 1);
    assert.equal(
      calls.exec[0].binPath,
      path.join(STORE_ROOT, "0.10.0", "bin", "pdlc.mjs"),
      "0.10.0 is the highest by semver order, not by string order"
    );
    assert.deepEqual(JSON.parse(calls.exec[0].env.PDLC_RESOLVED_ENGINE), {
      mode: "latest",
      version: "0.10.0",
      pin: null,
    });
    assert.match(stdout, /no pin declared/, "AC-5.2: the absence of a pin is as visible as its presence");
  });

  test("AC-5.4: a checkout on the machine without `--dev` resolves to the released version, never to dev", async () => {
    // The engine under test IS inside a checkout of this repo, so this leg
    // fixes the one condition that could make dev-mode inferable, and
    // asserts it is not inferred.
    const { calls } = await runLaunch(["node", "pdlc", "dev", "docs/f/REQ-f.md", "--cwd", UNPINNED_REPO], {
      versions: ["0.5.0"],
    });
    assert.equal(calls.exec.length, 1, "the released version must execute");
    assert.equal(JSON.parse(calls.exec[0].env.PDLC_RESOLVED_ENGINE).mode, "latest", "dev-mode is never inferred (T-6)");
  });

  test("the resolved child does not resolve again — the marker's presence alone stops the ladder", async () => {
    const { calls } = await runLaunch(["node", "pdlc", "dev", "docs/f/REQ-f.md", "--cwd", PINNED_REPO], {
      versions: ["0.1.0", "0.2.0"], // the pin is ABSENT: a second resolution would refuse
      env: { PDLC_RESOLVED_ENGINE: '{"mode":"pin","version":"9.9.9","pin":"9.9.9"}' },
    });
    assert.equal(calls.runMain.length, 1, "the child runs the pipeline in its own process");
    assert.equal(calls.exec.length, 0, "the child must never spawn a grandchild");
  });

  test("an unparseable marker still stops the ladder — the loop guard reads presence, not content", async () => {
    const { calls } = await runLaunch(["node", "pdlc", "dev", "docs/f/REQ-f.md", "--cwd", PINNED_REPO], {
      versions: ["0.1.0"],
      env: { PDLC_RESOLVED_ENGINE: "{not json" },
    });
    assert.equal(calls.exec.length, 0, "a garbled marker must degrade to running here, never to a re-spawn");
    assert.equal(calls.runMain.length, 1);
  });

  test("a usage error is answered as a usage error, not as a message about the version store", async () => {
    const { calls, stderr } = await runLaunch(["node", "pdlc", "dev", "--not-a-flag", "--cwd", UNPINNED_REPO], {
      versions: [],
    });
    assert.equal(calls.exec.length, 0);
    assert.equal(calls.runMain.length, 1, "the usage error is reported by main()'s own gate, unresolved");
    assert.ok(!/version store/.test(stderr), "resolving before validating would name the wrong problem");
  });
});

// ─────────────────────────────────────────────────────────────────────────
// PM F-04 — the stamped mode AGREES with the resolved mode
// ─────────────────────────────────────────────────────────────────────────

describe("PM F-04: provenance's mode and pin come from the resolution, not from a literal", () => {
  /**
   * Drives the whole production path — `launch()` resolves, sets the marker,
   * and calls the REAL `main()`, whose `cmdDev` builds provenance — and
   * returns what `runDev` was handed. Only the five-member `deps` seam and
   * the store are injected; `provenanceFor` itself is not stubbed, which is
   * the point.
   */
  async function stampedProvenanceFor({ versions, cwd, resolvesTo }) {
    const { launch, main } = await import(CLI_URL);
    const captured = [];
    const deps = {
      runDev: async (args) => {
        captured.push(args.provenance);
        return { report: null };
      },
      runQueue: async () => ({ report: null }),
      runQueueLoop: async () => ({
        passes: [],
        outcome: undefined,
        stopReason: "exhausted",
        exitCode: 0,
        loop: { iterations: 0, maxIterations: null },
      }),
      startupFor: () => ({
        ok: true,
        pluginRoot: "/fake-plugin-root",
        pluginVersion: "0.23.0",
        banner: [],
        rungs: [],
        notices: [],
      }),
      liveAdapter: () => ({
        adapter: { getApiKeySource: () => "none", getPauseLog: () => [] },
        cwd,
        tunables: {
          retryAttempts: 3,
          retryBackoff: { baseMs: 1000, capMs: 2000 },
          timeoutMinutes: 30,
          maxIterations: Infinity,
        },
      }),
    };

    const markerBefore = process.env.PDLC_RESOLVED_ENGINE;
    delete process.env.PDLC_RESOLVED_ENGINE;
    await captureRun(() =>
      launch(["node", "pdlc", "dev", "docs/f/REQ-f.md", "--cwd", cwd], {
        env: { PDLC_HOME: STORE_HOME },
        fs: storeFs(versions),
        homedir: path.join(path.sep, "fake-home"),
        // The store entry these legs resolve to IS the running engine, so
        // the in-process arm is taken and the real `main()` runs — which is
        // what puts `provenanceFor` on the path under test.
        engineVersion: resolvesTo,
        exec: () => {
          throw new Error("this leg must take the in-process arm, not spawn a child");
        },
        runMain: (argv) => main(argv, deps),
      })
    );
    if (markerBefore === undefined) delete process.env.PDLC_RESOLVED_ENGINE;
    else process.env.PDLC_RESOLVED_ENGINE = markerBefore;

    assert.equal(captured.length, 1, "runDev must have been reached exactly once");
    return captured[0];
  }

  const ENGINE_OWN_VERSION = JSON.parse(
    readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8")
  ).version;

  test("a released, unpinned run is stamped `latest` — NOT `dev`", async () => {
    const provenance = await stampedProvenanceFor({ versions: [ENGINE_OWN_VERSION], cwd: UNPINNED_REPO, resolvesTo: ENGINE_OWN_VERSION });

    // The defect this closes: `mode` was the literal "dev" for every run, so
    // a released run was stamped `dev` in the consumer's committed history
    // and AC-5.3's mark discriminated nothing.
    assert.notEqual(provenance.mode, "dev", "a released run must not be stamped dev (AC-5.3)");
    assert.equal(provenance.mode, "latest", "the stamped mode must equal the mode the ladder resolved");
    assert.equal(provenance.pin, null, "an unpinned run states there is no pin (AC-5.2)");
    // `line` carries the triple only; `block` is the rendering that states
    // the mode, and it is the one appended to POSTMORTEMs (§7.2 kind 2).
    assert.ok(
      provenance.block.includes("Mode: latest"),
      `the block an artifact carries must state the resolved mode. Got:\n${provenance.block}`
    );
    assert.ok(
      !provenance.block.includes("Mode: dev"),
      "a released run must not be stamped dev in the consumer's committed history"
    );
  });

  test("a pinned run is stamped `pin` and names the pin", async () => {
    const provenance = await stampedProvenanceFor({ versions: ["9.9.9"], cwd: PINNED_REPO, resolvesTo: "9.9.9" });
    assert.equal(provenance.mode, "pin", "AC-5.1: the run announces the pin");
    assert.equal(provenance.pin, "9.9.9");
    assert.ok(
      provenance.block.includes("Mode: pin (pin: 9.9.9)"),
      `the artifact-borne block must name the pin. Got:\n${provenance.block}`
    );
  });

  test("the stamped engine version is a version, never `undefined`", async () => {
    const provenance = await stampedProvenanceFor({ versions: [ENGINE_OWN_VERSION], cwd: UNPINNED_REPO, resolvesTo: ENGINE_OWN_VERSION });

    // `provenanceFor` read `startup.engineVersion` and `startup.pluginCompat`
    // — two fields `runStartupChecks` does not return — so every POSTMORTEM,
    // QUEUE.md row and commit message a run wrote carried the literal text
    // "undefined" where REQ-EDIST-04's whole point is the version.
    assert.match(String(provenance.engineVersion), /^\d+\.\d+\.\d+/, "engineVersion must be a real version");
    assert.ok(provenance.pluginCompat, "pluginCompat must be the declared range, not undefined");
    assert.ok(
      !/undefined/.test(provenance.line) && !/undefined/.test(provenance.block),
      `no rendered provenance may contain "undefined". line: ${provenance.line}`
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────
// PM F-03 — PDLC_PLUGIN_ROOT is ignored LOUDLY, and `--dev` exists
// ─────────────────────────────────────────────────────────────────────────

describe("PM F-03: AC-5.6 — the ignored env var is announced, positively", () => {
  test("a run with PDLC_PLUGIN_ROOT set and no --dev EMITS the ignore notice", async () => {
    const { main } = await import(CLI_URL);
    const before = process.env.PDLC_PLUGIN_ROOT;
    process.env.PDLC_PLUGIN_ROOT = path.join(path.sep, "tmp", "definitely-not-a-plugin-root");
    let stdout;
    try {
      ({ stdout } = await captureRun(() => main(["node", "pdlc", "doctor"])));
    } finally {
      if (before === undefined) delete process.env.PDLC_PLUGIN_ROOT;
      else process.env.PDLC_PLUGIN_ROOT = before;
    }

    // The POSITIVE half AC-5.6 requires. Asserting merely that the run
    // resolved somewhere else is satisfied by silence, which is precisely
    // the branch AC-5.6 forbids.
    assert.match(
      stdout,
      /PDLC_PLUGIN_ROOT was set .* and ignored/,
      `the notice must be rendered to the operator, not merely returned. Got:\n${stdout}`
    );
    assert.match(stdout, /--dev/, "the notice must name the remedy that would honour it");
  });

  test("`--dev` is in the closed flag set for dev, queue and doctor", async () => {
    const { main } = await import(CLI_URL);
    for (const command of ["dev", "queue", "doctor"]) {
      const argv = command === "dev" ? ["node", "pdlc", "dev", "docs/f/REQ-f.md", "--dev"] : ["node", "pdlc", command, "--dev"];
      const { stdout, stderr } = await captureRun(() => main(argv));
      assert.ok(
        !/unknown flag "--dev"/.test(stdout + stderr),
        `\`pdlc ${command} --dev\` must not be a usage error — the notice and handshake.mjs's REMEDY both name it`
      );
    }
  });

  test("the doctor refusal's remedy states the condition that makes the env var work", async () => {
    const { main } = await import(CLI_URL);
    const before = process.env.PDLC_PLUGIN_ROOT;
    process.env.PDLC_PLUGIN_ROOT = path.join(path.sep, "tmp", "definitely-not-a-plugin-root");
    let stdout;
    try {
      ({ stdout } = await captureRun(() => main(["node", "pdlc", "doctor", "--plugin-root", "/tmp/nope"])));
    } finally {
      if (before === undefined) delete process.env.PDLC_PLUGIN_ROOT;
      else process.env.PDLC_PLUGIN_ROOT = before;
    }
    if (/Override the plugin root/.test(stdout)) {
      assert.match(
        stdout,
        /--dev/,
        "F-06: advising PDLC_PLUGIN_ROOT without naming --dev sends the operator down a path that does nothing"
      );
    }
  });
});
