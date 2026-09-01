// Coverage instrumentation for the workflows package (CODE_REVIEW v1 §1-2).
//
// The finding: this package declared no coverage configuration at all — no
// `collectCoverageFrom`, no threshold, no reporter. Under
// `--experimental-vm-modules` the modules this feature edits are loaded as ESM
// through jest's vm-module path, where jest's own babel instrumentation reports
// 0% for them, so "≥85% branch coverage" could not be positively established
// for the feature's own workflows-side changes (the provenance seam in
// `orchestrate-dev.js`, `orchestrate-queue.js`'s `Engine` column migration,
// and `build-runtime.mjs`).
//
// The remedy is the one the engine package already uses: c8, which reads V8's
// own coverage and therefore sees vm-evaluated ESM. This file is the oracle
// that the instrumentation exists and stays wired — it asserts the *declared*
// configuration, which is decidable offline in milliseconds. It deliberately
// does not run c8 itself: that is `npm run test:coverage`'s job (and CI's),
// and a test that re-ran the whole suite under coverage from inside the suite
// would not terminate.

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PKG_DIR = packageRoot;
const pkg = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));

// The modules this feature edits on the workflows side. Transcribed literally,
// not derived from a directory listing: a module dropped from the include set
// must fail here rather than quietly stop being measured.
// Every entry is `**/`-anchored and path-qualified because `allow-external` is on: see the
// `//c8` note in package.json, and the resolution oracle at the bottom of this file.
const CAPTURE_SCRIPT_INCLUDE = "**/scripts/capture-learnings-baseline.mjs";

const REQUIRED_INCLUDES = [
  "**/pdlc/workflows/orchestrate-dev.js",
  "**/pdlc/workflows/orchestrate-queue.js",
  "**/pdlc/workflows/build-runtime.mjs",
  // CODE_REVIEW v1 §1-1: the delta-coverage gate is itself production code on a
  // required check (`test:coverage` &&-chains it), so it is measured like the
  // modules it measures. Leaving it out was the asymmetry the finding named —
  // a coverage gate over orchestrate-dev.js whose own module nobody measured.
  "**/pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs",
];

describe("workflows coverage instrumentation (CODE_REVIEW v1 §1-2)", () => {
  test("a coverage runner is declared as a script", () => {
    expect(typeof pkg.scripts?.["test:coverage"]).toBe("string");
    expect(pkg.scripts["test:coverage"]).toMatch(/\bc8\b/);
  });

  test("c8 is a declared devDependency, so the script runs on a fresh clone", () => {
    expect(typeof pkg.devDependencies?.c8).toBe("string");
  });

  test("the run is check-coverage'd against a branch floor of at least 85%", () => {
    // `check-coverage` is what turns a report into a gate: without it c8 prints
    // a table and exits 0 no matter how low the numbers are, which is the
    // "declared but inert" shape the finding is about.
    expect(pkg.c8?.["check-coverage"]).toBe(true);
    expect(typeof pkg.c8?.branches).toBe("number");
    expect(pkg.c8.branches).toBeGreaterThanOrEqual(85);
    expect(pkg.c8.lines).toBeGreaterThanOrEqual(85);
    expect(pkg.c8.functions).toBeGreaterThanOrEqual(85);
    expect(pkg.c8.statements).toBeGreaterThanOrEqual(85);
  });

  // CODE_REVIEW v2 §1-1. The `c8` block's thresholds are **global-aggregate**:
  // `orchestrate-dev.js` is ~15k lines and dominates the aggregate, so a small
  // module could sit well below the declared 85% branch floor without the gate
  // noticing — the declared floor is not the enforced floor. The remedy is a
  // second, per-file stage over the DoD-named criterion (branch ≥85%), added
  // alongside the aggregate stage rather than replacing it: nothing the
  // aggregate block declares is weakened, and the one floor DoD actually names
  // is enforced per module.
  test("test:coverage carries a per-file stage, so a small module cannot hide behind the aggregate", () => {
    const script = pkg.scripts?.["test:coverage"] ?? "";
    expect(script).toMatch(/--per-file\b/);
    expect(script).toMatch(/--check-coverage\b/);
  });

  test("the per-file stage's branch floor is the DoD-named 85% or higher", () => {
    const script = pkg.scripts?.["test:coverage"] ?? "";
    const perFileStage = script
      .split("&&")
      .map((s) => s.trim())
      .find((s) => /--per-file\b/.test(s));
    expect(perFileStage).toBeDefined();
    const branches = /--branches\s+(\d+(?:\.\d+)?)/.exec(perFileStage);
    expect(branches).not.toBeNull();
    expect(Number(branches[1])).toBeGreaterThanOrEqual(85);
  });

  test("the per-file stage runs in addition to the aggregate stage, not instead of it", () => {
    // Both stages must survive: the `c8` block still declares 90%
    // lines/functions/statements in aggregate, which the per-file stage's own
    // relaxed non-branch numbers must not be able to replace.
    const stages = (pkg.scripts?.["test:coverage"] ?? "").split("&&").map((s) => s.trim());
    expect(stages.length).toBeGreaterThanOrEqual(2);
    expect(/--per-file\b/.test(stages[0])).toBe(false);
    expect(stages.some((s) => /--per-file\b/.test(s))).toBe(true);
    expect(pkg.c8?.["check-coverage"]).toBe(true);
  });

  // CODE_REVIEW v1 F4. `scripts/capture-learnings-baseline.mjs` is production
  // tooling this feature added, but it lives ABOVE `pdlc/workflows/` and the
  // include set was written as bare basenames, so c8 never opened it: its
  // digest/MANIFEST writes could regress to any number without moving a
  // coverage number.
  //
  // Two things are needed and both are asserted, because either alone is inert.
  // (1) c8 refuses to report any file outside its cwd unless `allow-external`
  //     is set — with it off, an include entry naming the script matches
  //     nothing and the table comes back empty.
  // (2) The entry must be a glob c8 actually resolves. A `../../`-relative
  //     climb does NOT work (verified: empty table); a basename-anchored
  //     `**/` glob does. So the anti-regression assertion is that the entry is
  //     not a parent-relative path, which is the shape that silently measures
  //     nothing.
  test("the capture script is measured too, by a glob c8 can actually resolve (F4)", () => {
    const include = pkg.c8?.include ?? [];
    expect(include).toContain(CAPTURE_SCRIPT_INCLUDE);
    expect(CAPTURE_SCRIPT_INCLUDE.startsWith("..")).toBe(false);
    expect(pkg.c8?.["allow-external"]).toBe(true);
    // `allow-external` makes bare cwd-relative entries stop resolving, so a bare
    // basename anywhere in the set is the silent-drop shape (CODE_REVIEW v1 F4, round 2).
    for (const entry of include) {
      expect(entry.startsWith("**/")).toBe(true);
    }
    // The merge-base worktrees the capture tests materialise carry their own
    // orchestrate-dev.js, which matches the include globs under `allow-external`.
    expect(pkg.c8?.exclude ?? []).toEqual(
      expect.arrayContaining([
        "**/.tmp-capture-driver-*/**",
        "**/.baseline-worktree/**",
        "**/pdlc-capture-entrypoint-*/**",
      ]),
    );
    expect(existsSync(path.resolve(PKG_DIR, "../../scripts/capture-learnings-baseline.mjs"))).toBe(
      true,
    );
  });

  // CODE_REVIEW v1 F4, second remediation round. The shape assertions above are
  // all satisfiable by a config that measures NOTHING but the capture script:
  // `allow-external` changes how c8 resolves the include set, and under it the
  // three bare cwd-relative basenames stop matching, so adding the script's
  // glob silently dropped `orchestrate-dev.js`, `orchestrate-queue.js` and
  // `build-runtime.mjs` out of the report — the aggregate gate then measured a
  // 200-line script instead of a 17k-line one, and every shape assertion above
  // still passed. A declared-configuration oracle cannot catch that, because
  // the defect is in what the declaration RESOLVES TO, not in what it says.
  //
  // So this one runs the real thing: c8, from the package root, with the
  // package's own shipped `c8` block (no include/exclude overrides — only the
  // temp and report directories are redirected so the run cannot clobber
  // `coverage/`), over a driver that loads one in-package module and the
  // out-of-package script. Both must appear in the resulting report. It stays
  // fast because the driver loads `build-runtime.mjs --check` rather than the
  // suite: the question is which paths c8 RESOLVES, and one in-package module
  // answers it for all three.
  test("the shipped c8 config resolves BOTH in-package modules and the external script (F4)", () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), "pdlc-c8-arrangement-"));
    try {
      const buildRuntime = path.join(PKG_DIR, "build-runtime.mjs");
      const captureScript = path.resolve(PKG_DIR, "../../scripts/capture-learnings-baseline.mjs");
      const driver = path.join(tmp, "driver.mjs");
      // `build-runtime.mjs` runs its work at import; `--check` keeps it read-only.
      // The capture script's own work is behind an `isMainModule` guard, so importing
      // it evaluates the module body without running a capture.
      writeFileSync(
        driver,
        `await import(${JSON.stringify(pathToFileURL(buildRuntime).href)});\n` +
          `await import(${JSON.stringify(pathToFileURL(captureScript).href)});\n`,
        "utf8",
      );

      // Two transient failure modes are retried here, and only these:
      //  - `consolidationBuild.test.js` mutates and restores the real
      //    `dist/pdlc-cli.mjs` in a parallel jest worker (its TT-5 mutation
      //    case and its rebuild-from-backup case), so `--check` can
      //    transiently see STALE or a missing dist through no fault of the
      //    c8 config — the race signature below, up to five attempts with a
      //    300ms backoff, counted so exhaustion reads as "the race window
      //    never closed" rather than disappearing into a generic exit;
      //  - the c8 child is sensitive to machine-wide load (concurrent engine
      //    runs have flaked it with exit 1 while the config was provably
      //    fine), so any other non-zero status gets two fresh retries with
      //    per-attempt temp/report dirs.
      // What this does and does not weaken (Phase CR round 1, TE F-04): a
      // genuine misconfiguration — a wrong c8 `include` list, a genuinely
      // STALE dist — is a property of the bytes on disk, not of timing, so
      // it fails every attempt and is reported by the `status: 0` control
      // below.
      let run;
      let reportDir;
      let attemptsRaced = 0;
      let genericFailures = 0;
      for (let attempt = 0; attempt < 5; attempt++) {
        reportDir = path.join(tmp, `report-${attempt}`);
        run = spawnSync(
          process.execPath,
          [
            path.join(PKG_DIR, "node_modules", "c8", "bin", "c8.js"),
            "--reporter=json-summary",
            `--temp-directory=${path.join(tmp, `v8-${attempt}`)}`,
            `--report-dir=${reportDir}`,
            "--check-coverage=false",
            process.execPath,
            driver,
            "--check",
          ],
          { cwd: PKG_DIR, encoding: "utf8" },
        );
        if (run.status === 0) break;
        const distRaced = /STALE\s+pdlc\/workflows\/dist\/|ENOENT.*pdlc-cli\.mjs/.test(
          `${run.stderr}`,
        );
        if (distRaced) {
          attemptsRaced += 1;
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
        } else {
          genericFailures += 1;
          if (genericFailures >= 3) break;
        }
      }

      // Exhaustion is not success. Five consecutive race-signature failures
      // means the dist is stale on disk, not that a worker was mid-write.
      expect({ raceWindowNeverClosed: attemptsRaced === 5, stderr: run.stderr })
        .toMatchObject({ raceWindowNeverClosed: false });

      // Control: a driver that failed to run would produce an empty report, and
      // "no rows" must not be readable as "the config is fine".
      expect({ status: run.status, stderr: run.stderr }).toMatchObject({ status: 0 });

      const summary = JSON.parse(
        readFileSync(path.join(reportDir, "coverage-summary.json"), "utf8"),
      );
      const measured = Object.keys(summary).filter((k) => k !== "total");

      expect(measured).toEqual(
        expect.arrayContaining([buildRuntime, captureScript]),
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("dist/ and the test tree are excluded — generated and test bytes are not the subject", () => {
    const include = pkg.c8?.include ?? [];
    expect(include.some((p) => p.startsWith("dist/"))).toBe(false);
    expect(include.some((p) => p.startsWith("__tests__/"))).toBe(false);
  });

  // P9-02a: strengthens the containment-only oracle above to a set-equality —
  // a deleted entry reds as loudly as a missing one. Direction is artifact
  // (pkg.c8.include) on the left, spec literal on the right. The seven-member
  // literal is REQUIRED_INCLUDES' three entries, CAPTURE_SCRIPT_INCLUDE, and
  // the three lib/ modules P9-02/K-3 add. consolidate-learnings.js is deliberately
  // excluded (PM Q-02). Un-skipped by P9-02.
  test("P9-02: the include set is exactly the seven modules the feature owns, no more and no fewer", () => {
    const include = pkg.c8?.include ?? [];
    expect(include).toEqual([
      ...REQUIRED_INCLUDES,
      CAPTURE_SCRIPT_INCLUDE,
      "**/pdlc/workflows/lib/loop-session.mjs",
      "**/pdlc/workflows/lib/escalation-view.mjs",
      "**/pdlc/workflows/lib/stats.mjs",
    ]);
  });

  // P9-02a: duplicates the shipped resolution oracle above, but the driver
  // also imports the three new lib/ modules so a bare-basename entry that
  // `allow-external` silently drops is caught by a real c8 run rather than a
  // string comparison. Un-skipped by P9-02.
  test("P9-02: the shipped c8 config resolves the three new lib/ modules too (F4)", () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), "pdlc-c8-arrangement-lib-"));
    try {
      const buildRuntime = path.join(PKG_DIR, "build-runtime.mjs");
      const captureScript = path.resolve(PKG_DIR, "../../scripts/capture-learnings-baseline.mjs");
      const loopSession = path.join(PKG_DIR, "lib", "loop-session.mjs");
      const escalationView = path.join(PKG_DIR, "lib", "escalation-view.mjs");
      const stats = path.join(PKG_DIR, "lib", "stats.mjs");
      const driver = path.join(tmp, "driver.mjs");
      writeFileSync(
        driver,
        `await import(${JSON.stringify(pathToFileURL(buildRuntime).href)});\n` +
          `await import(${JSON.stringify(pathToFileURL(captureScript).href)});\n` +
          `await import(${JSON.stringify(pathToFileURL(loopSession).href)});\n` +
          `await import(${JSON.stringify(pathToFileURL(escalationView).href)});\n` +
          `await import(${JSON.stringify(pathToFileURL(stats).href)});\n`,
        "utf8",
      );

      let run;
      let reportDir;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        reportDir = path.join(tmp, `report-${attempt}`);
        run = spawnSync(
          process.execPath,
          [
            path.join(PKG_DIR, "node_modules", "c8", "bin", "c8.js"),
            "--reporter=json-summary",
            `--temp-directory=${path.join(tmp, `v8-${attempt}`)}`,
            `--report-dir=${reportDir}`,
            "--check-coverage=false",
            process.execPath,
            driver,
            "--check",
          ],
          { cwd: PKG_DIR, encoding: "utf8" },
        );
        if (run.status === 0) break;
      }

      expect({ status: run.status, stderr: run.stderr }).toMatchObject({ status: 0 });

      const summary = JSON.parse(
        readFileSync(path.join(reportDir, "coverage-summary.json"), "utf8"),
      );
      const measured = Object.keys(summary).filter((k) => k !== "total");

      expect(measured).toEqual(
        expect.arrayContaining([buildRuntime, captureScript, loopSession, escalationView, stats]),
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
