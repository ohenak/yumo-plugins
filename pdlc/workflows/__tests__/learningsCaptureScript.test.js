/**
 * learningsCaptureScript.test.js — LI-03, PLAN §pdlc-learnings-injection, TSPEC §T.3.
 *
 * The two obligation oracles TSPEC §T.3 assigns to
 * `scripts/capture-learnings-baseline.mjs` and `.gitignore`:
 *
 *   LI-T-IGNORE  — root-anchored ignore rule (obligation 1). Three conjuncts, asserted
 *                  together in one test: `.baseline-worktree` at the repository root IS
 *                  ignored; a NESTED `.baseline-worktree` under a fixture directory is NOT;
 *                  `pdlc/workflows/__tests__/fixtures/learnings-baseline/` is NOT. (2) and
 *                  (3) are what give LI-04's root anchoring an oracle — a bare
 *                  `.baseline-worktree`, `*` or `.baseline*` rule would pass (1) alone while
 *                  un-tracking fixture material this feature is about to commit (TE F-06).
 *   LI-T-WORKTREE — `finally`-block removal (obligation 2). A forced throw injected between
 *                  worktree materialise and worktree remove, through the script's
 *                  fixture-driving seam (never `_git` — git stays real throughout), must
 *                  still leave the worktree path absent AND `git worktree list` showing no
 *                  entry for it. The second conjunct is what distinguishes a real
 *                  `git worktree remove` from an `rm -rf` (TSPEC §T.3).
 *
 * Both oracles run against a DEDICATED TEMPORARY git repository created by the test and used
 * as the instrument's `cwd`, with a real `git` binary — never this developer checkout, which
 * DoD 8 forbids mutating (TE F-03, Q-03).
 *
 * Both blocks are committed `.skip`ped: neither obligation's greening artifact exists yet.
 * LI-T-IGNORE is greened by LI-04 (`.gitignore` gains the root-anchored rule); LI-T-WORKTREE
 * is greened by LI-05 (`scripts/capture-learnings-baseline.mjs` is created). Each title names
 * its own owning task, per this PLAN's skip-naming rule.
 */

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// __dirname = pdlc/workflows/__tests__; three levels up is the repository root.
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const BRANCH_GITIGNORE_PATH = path.join(REPO_ROOT, ".gitignore");
const CAPTURE_SCRIPT_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "scripts",
  "capture-learnings-baseline.mjs"
);

/** The baseline fixtures committed on this branch — the entry point's expected output. */
const COMMITTED_FIXTURE_DIR = path.join(__dirname, "fixtures", "learnings-baseline");

const GIT_COMMIT_CONFIG = [
  "-c",
  "user.email=pdlc-learnings-capture@example.invalid",
  "-c",
  "user.name=pdlc-learnings-capture",
];

/**
 * Materialises a fresh, throwaway git repository, seeded with the branch's own `.gitignore`
 * and committed so it has a resolvable `HEAD`. Real `git`, never the developer's checkout.
 *
 * @returns {{ root: string }}
 */
function makeSeededTempRepo() {
  const root = mkdtempSync(path.join(tmpdir(), "pdlc-learnings-capture-"));
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
  const gitignoreText = readFileSync(BRANCH_GITIGNORE_PATH, "utf8");
  writeFileSync(path.join(root, ".gitignore"), gitignoreText);
  execFileSync("git", ["add", "-A"], { cwd: root });
  execFileSync("git", [...GIT_COMMIT_CONFIG, "commit", "-q", "-m", "seed"], { cwd: root });
  return { root };
}

/**
 * Runs `git check-ignore` for a path relative to `cwd` and returns its exit status:
 * 0 = ignored, 1 = not ignored. Any other status (e.g. 128) is a fatal git error and is
 * surfaced by the caller rather than folded into a boolean.
 *
 * @param {string} cwd
 * @param {string} relPath
 * @returns {number}
 */
function checkIgnoreStatus(cwd, relPath) {
  const result = spawnSync("git", ["check-ignore", relPath], { cwd, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(
      `pdlc-test: git check-ignore fatal error for ${relPath}: status ${result.status}, ` +
        `stderr: ${result.stderr}`
    );
  }
  return result.status;
}

describe("learningsCaptureScript", () => {
  let repoRoot;

  beforeEach(() => {
    repoRoot = makeSeededTempRepo().root;
  });

  it("LI-04: root-anchored .baseline-worktree ignore rule, three conjuncts", () => {
    // Conjunct (1): `.baseline-worktree` at the repository root IS ignored.
    const rootWorktreePath = path.join(repoRoot, ".baseline-worktree");
    mkdirSync(rootWorktreePath, { recursive: true });
    writeFileSync(path.join(rootWorktreePath, "marker.txt"), "marker");
    expect(checkIgnoreStatus(repoRoot, ".baseline-worktree")).toBe(0);

    // Conjunct (2): a NESTED `.baseline-worktree` under a fixture directory is NOT ignored —
    // a bare `.baseline-worktree`, `*` or `.baseline*` rule would wrongly swallow this.
    const nestedRel = path.join(
      "pdlc",
      "workflows",
      "__tests__",
      "fixtures",
      "x",
      ".baseline-worktree"
    );
    mkdirSync(path.join(repoRoot, nestedRel), { recursive: true });
    writeFileSync(path.join(repoRoot, nestedRel, "marker.txt"), "marker");
    expect(checkIgnoreStatus(repoRoot, nestedRel)).toBe(1);

    // Conjunct (3): the committed baseline fixture directory is NOT ignored.
    const baselineFixtureRel = path.join(
      "pdlc",
      "workflows",
      "__tests__",
      "fixtures",
      "learnings-baseline"
    );
    mkdirSync(path.join(repoRoot, baselineFixtureRel), { recursive: true });
    writeFileSync(path.join(repoRoot, baselineFixtureRel, "MANIFEST.json"), "{}");
    expect(checkIgnoreStatus(repoRoot, baselineFixtureRel)).toBe(1);
  });

  it("LI-05: a forced throw between materialise and remove still removes the worktree", async () => {
    expect(existsSync(CAPTURE_SCRIPT_PATH)).toBe(true);
    const { runCaptureScript } = await import(CAPTURE_SCRIPT_PATH);

    const mergeBaseRef = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    const worktreePath = ".baseline-worktree";
    const injectedError = new Error("pdlc-test: injected fixture-drive failure");

    await expect(
      runCaptureScript({
        cwd: repoRoot,
        worktreePath,
        mergeBaseRef,
        outputDir: path.join(repoRoot, "fixtures-out"),
        // The fixture/import seam — the step between worktree materialise and worktree
        // remove — never `_git`. Forcing a throw here proves the `finally` cleans up
        // regardless of why the drive step failed, without faking git itself.
        _captureFixtures: async () => {
          throw injectedError;
        },
      })
    ).rejects.toThrow(injectedError.message);

    // Conjunct 1: the worktree path is gone from the filesystem.
    expect(existsSync(path.join(repoRoot, worktreePath))).toBe(false);

    // Conjunct 2 (load-bearing): the temp repo's OWN `git worktree list` shows no entry for
    // it. `rm -rf` would satisfy conjunct 1 alone while leaving a stale `.git/worktrees/`
    // administrative entry that reds the next `git worktree add` at the same path — this is
    // what distinguishes `git worktree remove` from `rm -rf`.
    const worktreeList = execFileSync("git", ["worktree", "list", "--porcelain"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    const absoluteWorktreePath = path.join(repoRoot, worktreePath);
    expect(worktreeList.includes(absoluteWorktreePath)).toBe(false);
  });
});

// ─── CODE_REVIEW v1 F4 — `captureFixturesFromWorktree` driven directly ───────────────────────
//
// LI-05 above injects `_captureFixtures` and so bypasses the real fixture driver wholesale: its
// empty/non-array matrix guard, its duplicate-`caseId` guard, and its per-file digest/manifest
// writes had no direct test at all, and the module sat outside the c8 `include` set, so a defect
// in any of them would have shipped green. These tests drive the exported function itself.
//
// The function imports `<cwd>/<worktreePath>/pdlc/workflows/orchestrate-dev.js` — the merge-base
// module. Here that path is materialised as a tiny stub module in a temp directory, so the tests
// exercise the driver's own logic without a git worktree or the 15k-line real module.
describe("learningsCaptureScript — captureFixturesFromWorktree (CODE_REVIEW v1 F4)", () => {
  let scratch;
  let worktreePath;
  let outputDir;

  /** Materialises `<scratch>/<worktreePath>/pdlc/workflows/orchestrate-dev.js` as a stub whose
   *  default export is a recognisable sentinel, so a test can prove the driver handed the
   *  merge-base `main` to each matrix case's `run`. */
  function seedStubModule(body) {
    const moduleDir = path.join(scratch, worktreePath, "pdlc", "workflows");
    mkdirSync(moduleDir, { recursive: true });
    writeFileSync(path.join(moduleDir, "orchestrate-dev.js"), body, "utf8");
  }

  // The scratch tree must live INSIDE jest's `rootDir` (`pdlc/workflows`): the driver reaches
  // the merge-base module by dynamic `import()`, and under `--experimental-vm-modules` jest's
  // ESM runtime refuses to resolve a specifier outside the project root. It is removed in
  // `afterEach` and ignored by `pdlc/workflows/.gitignore`, so no tree state survives the run
  // (DoD 8). The LI-05 block above still uses a real temp git repository under `os.tmpdir()` —
  // it drives real `git worktree`, which needs a repository, not a module path.
  const SCRATCH_ROOT = path.resolve(__dirname, "..");

  beforeEach(() => {
    scratch = mkdtempSync(path.join(SCRATCH_ROOT, ".tmp-capture-driver-"));
    worktreePath = "wt";
    outputDir = path.join(scratch, "out");
    seedStubModule('export default function main() { return "MERGE-BASE-MAIN"; }\nexport const reviewLoop = () => {};\n');
  });

  afterEach(() => {
    rmSync(scratch, { recursive: true, force: true });
  });

  async function driver() {
    const { captureFixturesFromWorktree } = await import(CAPTURE_SCRIPT_PATH);
    return captureFixturesFromWorktree;
  }

  it("writes one file per dispatch, a SHA-256 digest per file, and a MANIFEST recording the ref", async () => {
    const captureFixturesFromWorktree = await driver();
    const prompts = { ALPHA: ["alpha-0", "alpha-1"], BETA: ["beta-0"] };

    const manifest = await captureFixturesFromWorktree({
      cwd: scratch,
      worktreePath,
      outputDir,
      mergeBaseRef: "deadbeef",
      matrix: [
        { caseId: "ALPHA", run: async (mainFn) => prompts.ALPHA.map((p) => `${p}:${mainFn()}`) },
        { caseId: "BETA", run: async (mainFn) => prompts.BETA.map((p) => `${p}:${mainFn()}`) },
      ],
    });

    // The merge-base module's default export reaches each case's `run` — the step-2 obligation.
    const alpha0 = readFileSync(path.join(outputDir, "ALPHA", "0.txt"), "utf8");
    expect(alpha0).toBe("alpha-0:MERGE-BASE-MAIN");

    // Set equality over the written tree, never containment: a driver that wrote an extra file
    // or skipped one would pass a "contains" check.
    expect(readdirSync(outputDir).sort()).toEqual(["ALPHA", "BETA", "MANIFEST.json"]);
    expect(readdirSync(path.join(outputDir, "ALPHA")).sort()).toEqual(["0.txt", "1.txt"]);
    expect(readdirSync(path.join(outputDir, "BETA")).sort()).toEqual(["0.txt"]);

    // Every manifest digest is the SHA-256 of the file actually on disk — the conjunct that
    // falsifies a driver writing one prompt's bytes and another prompt's digest.
    expect(manifest.mergeBaseSha).toBe("deadbeef");
    expect(Object.keys(manifest.files).sort()).toEqual(
      ["ALPHA/0.txt", "ALPHA/1.txt", "BETA/0.txt"].sort()
    );
    for (const [relPath, digest] of Object.entries(manifest.files)) {
      const onDisk = readFileSync(path.join(outputDir, relPath));
      expect({ relPath, digest }).toEqual({
        relPath,
        digest: createHash("sha256").update(onDisk).digest("hex"),
      });
    }

    // The manifest written to disk equals the manifest returned — a caller transcribing digests
    // from the return value and a reader loading MANIFEST.json must not be able to disagree.
    expect(JSON.parse(readFileSync(path.join(outputDir, "MANIFEST.json"), "utf8"))).toEqual(manifest);
  });

  it("refuses an empty or non-array matrix rather than writing an empty baseline", async () => {
    const captureFixturesFromWorktree = await driver();
    const base = { cwd: scratch, worktreePath, outputDir, mergeBaseRef: "deadbeef" };

    // An empty capture would overwrite the committed fixtures with nothing and leave every
    // downstream digest assertion passing vacuously on a set-equality of two empty sets.
    for (const matrix of [[], undefined, null, "not-a-matrix", {}]) {
      await expect(captureFixturesFromWorktree({ ...base, matrix })).rejects.toThrow(
        /no L3 fixture matrix cases supplied/
      );
    }
    expect(existsSync(outputDir)).toBe(false);
  });

  it("refuses a duplicate caseId rather than silently overwriting the first case's fixtures", async () => {
    const captureFixturesFromWorktree = await driver();
    await expect(
      captureFixturesFromWorktree({
        cwd: scratch,
        worktreePath,
        outputDir,
        mergeBaseRef: "deadbeef",
        matrix: [
          { caseId: "DUP", run: async () => ["first"] },
          { caseId: "DUP", run: async () => ["second"] },
        ],
      })
    ).rejects.toThrow(/duplicate caseId in matrix: DUP/);

    // The first case's bytes are still the ones on disk — the throw happened before the second
    // case could overwrite them, so the failure is detectable rather than silently absorbed.
    expect(readFileSync(path.join(outputDir, "DUP", "0.txt"), "utf8")).toBe("first");
    // ...and no MANIFEST was written, so a half-captured tree cannot be mistaken for a complete
    // one by the guard.
    expect(existsSync(path.join(outputDir, "MANIFEST.json"))).toBe(false);
  });

  it("parseCaptureArgv reads --ref/--out/--worktree and rejects a valueless flag", async () => {
    const { parseCaptureArgv } = await import(CAPTURE_SCRIPT_PATH);
    expect(parseCaptureArgv(["--ref", "abc123", "--out", "/tmp/x", "--worktree", ".wt"])).toEqual({
      ref: "abc123",
      out: "/tmp/x",
      worktree: ".wt",
    });
    expect(parseCaptureArgv([])).toEqual({});
    // A valueless flag must not silently swallow the next flag as its value: `--ref --out /x`
    // would otherwise capture the ref as "--out" and re-baseline against a garbage ref.
    expect(() => parseCaptureArgv(["--ref"])).toThrow(/--ref requires a value/);
    expect(() => parseCaptureArgv(["--ref", "--out", "/tmp/x"])).toThrow(/--ref requires a value/);
  });

  it("the committed capture entry point is wired to the committed matrix, not a refusal stub (F1/F12)", () => {
    const source = readFileSync(CAPTURE_SCRIPT_PATH, "utf8");
    // The deferral this file's own script used to carry. "yet" was a self-declared deferral
    // bound to no successor REQ, queue row or DECISIONS entry (CODE_REVIEW v1 F12).
    expect(source).not.toMatch(/no built-in L3 fixture matrix is wired into this CLI entrypoint/);
    expect(source).toContain("learningsBaselineScenarios.js");
    expect(source).toContain("runCaptureScript(");
  });

  // CODE_REVIEW v1 F1, second remediation round. The assertion above reads the script's
  // SOURCE. That is enough to show the refusal stub is gone, but not that what replaced it
  // runs: an entry point that throws on its first line, resolves the wrong ref, or writes a
  // different byte for every prompt would satisfy every one of those three greps. F1's actual
  // complaint was about provenance — "AC-6.2's 'captured from the pre-feature HEAD' is not
  // reproducible by the committed tooling" — and provenance is only reproducible if RUNNING
  // the committed tooling reproduces the committed bytes.
  //
  // So this executes the real entry point as a real subprocess, against the real repository,
  // at the pinned merge base, writing to a scratch directory, and compares the digests it
  // produces to the ones committed under `__tests__/fixtures/learnings-baseline/MANIFEST.json`.
  // It is the only oracle in the feature that would fail if the entry point's wiring were
  // wired to the wrong matrix, ref or renderer. It also covers the `isMainModule` block, which
  // no in-process test can reach.
  it("running the committed entry point reproduces the committed baseline digests byte-for-byte (F1)", () => {
    const scratch = mkdtempSync(path.join(tmpdir(), "pdlc-capture-entrypoint-"));
    try {
      const outDir = path.join(scratch, "out");
      const worktree = path.join(scratch, "wt");
      const run = spawnSync(
        process.execPath,
        [CAPTURE_SCRIPT_PATH, "--out", outDir, "--worktree", worktree],
        {
          cwd: REPO_ROOT,
          encoding: "utf8",
          // The child's V8 coverage is diverted to a scratch directory c8 never reads.
          //
          // Under `test:coverage` the parent runs with `NODE_V8_COVERAGE` pointing at c8's temp
          // directory, so this child would emit a SECOND coverage entry for the same
          // `file://.../capture-learnings-baseline.mjs` URL — one whose covered ranges are the
          // COMPLEMENT of the jest worker's (the child runs the `isMainModule` block and none of
          // the argument-rejection arms; the worker runs the arms and never the block). c8 does
          // not union two entries for one URL; the merged report came out strictly worse than
          // either arm alone (79.1% lines / 89.5% branches and 95.3% / 62.5% separately, but
          // 76.3% / 77.1% merged), which reds the stage-2 `--per-file --branches 85` gate on a
          // file whose real branch coverage clears it.
          //
          // The variable cannot simply be omitted from `env`: node re-propagates
          // `NODE_V8_COVERAGE` to spawned children whatever `options.env` says, so it must be
          // OVERRIDDEN with a path c8 does not collect from. `scratch` is removed in the
          // `finally` below, so nothing survives the run.
          env: { ...process.env, NODE_V8_COVERAGE: path.join(scratch, "v8-coverage") },
        },
      );

      // Control: a script that refused (the old stub exited 1) or crashed must not be
      // readable as "no mismatching digests found".
      expect({ status: run.status, stderr: run.stderr }).toMatchObject({ status: 0 });

      const produced = JSON.parse(readFileSync(path.join(outDir, "MANIFEST.json"), "utf8"));
      const committed = JSON.parse(
        readFileSync(path.join(COMMITTED_FIXTURE_DIR, "MANIFEST.json"), "utf8"),
      );

      // Not just "the same set of paths": the same digest at every path, and the same
      // recorded merge base. This is AC-6.2's provenance claim, checked rather than asserted.
      expect(produced.mergeBaseSha).toBe(committed.mergeBaseSha);
      expect(produced.files).toEqual(committed.files);
      expect(Object.keys(produced.files).length).toBeGreaterThan(0);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
});
