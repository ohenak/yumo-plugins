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

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));

// The modules this feature edits on the workflows side. Transcribed literally,
// not derived from a directory listing: a module dropped from the include set
// must fail here rather than quietly stop being measured.
const REQUIRED_INCLUDES = ["orchestrate-dev.js", "orchestrate-queue.js", "build-runtime.mjs"];

describe("workflows coverage instrumentation (CODE_REVIEW v1 §1-2)", () => {
  test("a coverage runner is declared as a script", () => {
    expect(typeof pkg.scripts?.["test:coverage"]).toBe("string");
    expect(pkg.scripts["test:coverage"]).toMatch(/\bc8\b/);
  });

  test("c8 is a declared devDependency, so the script runs on a fresh clone", () => {
    expect(typeof pkg.devDependencies?.c8).toBe("string");
  });

  test("every module this feature edits is in the include set", () => {
    const include = pkg.c8?.include;
    expect(Array.isArray(include)).toBe(true);
    for (const mod of REQUIRED_INCLUDES) {
      expect(include).toContain(mod);
    }
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

  test("dist/ and the test tree are excluded — generated and test bytes are not the subject", () => {
    const include = pkg.c8?.include ?? [];
    expect(include.some((p) => p.startsWith("dist/"))).toBe(false);
    expect(include.some((p) => p.startsWith("__tests__/"))).toBe(false);
  });
});
