// documentOracles.test.js — T-02 (batch 2, RED-terminal)
//
// Exercises the three root-parameterised jest oracles that will live in
// `../lib/document-oracles.mjs` (T-09, batch 3): `coveredViolations`,
// `packagingViolations`, `advertisedVersionViolation`. Also asserts the
// literal `EXEMPTIONS` array, the two-root independence property, the
// `pdlc/workflows/dist/` write guard, the split covered-violations fixture
// guard (on-disk presence + git-tracked-ness), and §6.3's D-1/D-2/D-3
// document-correction oracles against CLAUDE.md / pdlc/README.md.
//
// RED reason (batch 2): `../lib/document-oracles.mjs` and
// `./helpers/driftCapabilities.js` do not exist yet — both are created in
// batch 3 (T-09, T-07 respectively). This whole file therefore fails to
// load ("Cannot find module"), which is the batch's named, specified RED
// reason per the PLAN's RED-authoring convention (§1 Conventions).
//
// Everything below this point is written against the eventual, real
// contracts (TSPEC §10, §10.1, §10.2, §10.3, §13.4, §14) so that once T-09
// lands the module, these cases exercise the real behaviour rather than a
// placeholder. §6.3's D-1/D-2/D-3 assertions are expected to stay red from
// this batch until L-06 (a much later Phase-7 landing task) actually
// corrects CLAUDE.md / pdlc/README.md — this is by design, not a bug.

import { execFileSync } from "child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import {
  advertisedVersionViolation,
  coveredViolations,
  EXEMPTIONS,
  packagingViolations,
  S_GIT_ABSENT,
  S_NO_GIT_DIR,
  S_NOTHING_STAGED, // eslint-disable-line no-unused-vars -- imported for parity with the pinned four; not asserted directly here (§10.3 note)
  S_UNBORN_HEAD,
} from "../lib/document-oracles.mjs";

import { itOrSkip } from "./helpers/driftCapabilities.js";

// ---------------------------------------------------------------------------
// Roots
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const LIVE_ROOT = realpathSync(resolve(HERE, "../../..")); // TSPEC §13.4
const COVERED_FIXTURE_ROOT = resolve(HERE, "fixtures", "covered-violations"); // T-10, batch 3
const DIST_DIR = resolve(WORKFLOWS, "dist");

// ---------------------------------------------------------------------------
// Local, self-contained fixture helpers.
//
// None of these import from driftFixtures.js / driftOrdering.js / a shared
// makeToolDir — those live in other tasks' files (T-15/T-16/T-07) that this
// task must not create or depend on (single-writer-per-file). Everything
// below is inlined so this file stands alone.
// ---------------------------------------------------------------------------

function mkTmpRoot() {
  return realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "pdlc-docorc-")));
}

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts });
}

function writeTree(root, spec) {
  for (const [relPath, content] of Object.entries(spec)) {
    const full = join(root, relPath);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
}

function snapshotDir(dir) {
  if (!existsSync(dir)) return null;
  const out = [];
  const walk = (base, prefix) => {
    for (const entry of readdirSync(base, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const full = join(base, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(full, rel);
      } else {
        const st = statSync(full);
        out.push({ path: rel, size: st.size, mtimeMs: st.mtimeMs });
      }
    }
  };
  walk(dir, "");
  return out;
}

function makeToolDir(names) {
  const dir = mkTmpRoot();
  for (const name of names) {
    const resolved = run("bash", ["-c", `command -v ${name}`]).trim();
    if (!resolved) throw new Error(`makeToolDir: cannot resolve tool "${name}"`);
    symlinkSync(resolved, join(dir, name));
  }
  return dir;
}

function initGitRepo(root, { branch = "main" } = {}) {
  run("git", ["init", "-q", "-b", branch], { cwd: root });
  run("git", ["config", "user.email", "docoracles-test@example.com"], { cwd: root });
  run("git", ["config", "user.name", "documentOracles.test.js"], { cwd: root });
}

function commitAll(root, message) {
  run("git", ["add", "-A"], { cwd: root });
  run("git", ["commit", "-q", "-m", message], { cwd: root });
}

/** `git init` + one commit of plugin.json (version "0.11.0"); an untracked
 * dist/ bundle file is then written WITHOUT `git add`. TSPEC §10.3's
 * fxRootUntrackedOnly recipe. */
function makeUntrackedOnlyFixture() {
  const root = mkTmpRoot();
  writeTree(root, {
    "plugin.json": `${JSON.stringify({ name: "pdlc", version: "0.11.0" }, null, 2)}\n`,
  });
  initGitRepo(root);
  commitAll(root, "initial");
  mkdirSync(join(root, "pdlc/workflows/dist"), { recursive: true });
  writeFileSync(join(root, "pdlc/workflows/dist/orchestrate-dev.bundle.js"), "// generated, untracked\n");
  return root;
}

/** Identical to fxRootUntrackedOnly, but plugin.json's version is bumped in
 * the working tree (not committed). TSPEC §10.3's fxRoot2 recipe. */
function makeBumpedVersionFixture() {
  const root = makeUntrackedOnlyFixture();
  const pkgPath = join(root, "plugin.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.version = "0.12.0";
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  return root;
}

/** Builds a minimal packaged-plugin tree: two dist/ bundles plus a
 * distribution-manifest.json recording their sha1 hashes, optionally
 * broken per `opts.break` (TSPEC §10.2 / §13.4's makePackagingFixture). */
function makePackagingFixture(opts = {}) {
  const root = mkTmpRoot();
  const distDir = join(root, "pdlc/workflows/dist");
  mkdirSync(distDir, { recursive: true });

  const devBundle = "// orchestrate-dev.bundle.js\n";
  const queueBundle = "// orchestrate-queue.bundle.js\n";
  writeFileSync(join(distDir, "orchestrate-dev.bundle.js"), devBundle);
  writeFileSync(join(distDir, "orchestrate-queue.bundle.js"), queueBundle);

  const sha1 = (content) => run("bash", ["-c", `printf '%s' "$1" | shasum -a 1 | cut -d' ' -f1`, "sha1", content]).trim();

  const manifest = {
    plugin: { path: "pdlc/workflows/dist" },
    entries: [
      { path: "pdlc/workflows/dist/orchestrate-dev.bundle.js", pluginSha1: sha1(devBundle) },
      { path: "pdlc/workflows/dist/orchestrate-queue.bundle.js", pluginSha1: sha1(queueBundle) },
    ],
  };

  if (opts.break === "sha1") {
    // clause 6.2(b): manifest's recorded hash disagrees with the bytes on disk.
    manifest.entries[0].pluginSha1 = "0000000000000000000000000000000000000000";
  } else if (opts.break === "retired") {
    // clause 6.2(c): a manifest entry survives for a file no longer under dist/.
    manifest.entries.push({
      path: "pdlc/workflows/dist/orchestrate-retired.bundle.js",
      pluginSha1: sha1("// retired\n"),
    });
  } else if (opts.break === "pluginPath") {
    // clause 6.2(a): the manifest's declared plugin path doesn't match dist/'s actual location.
    manifest.plugin.path = "pdlc/workflows/nonexistent-dist";
  }

  writeFileSync(join(distDir, "distribution-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return root;
}

// ---------------------------------------------------------------------------
// §10.2 — the LIVE_ROOT/pdlc/workflows/dist/ write guard.
//
// No test in this file may write into the live dist/ directory. A snapshot
// is taken before all tests and compared after all tests.
// ---------------------------------------------------------------------------

let distSnapshotBefore;

beforeAll(() => {
  distSnapshotBefore = snapshotDir(DIST_DIR);
});

afterAll(() => {
  expect(snapshotDir(DIST_DIR)).toEqual(distSnapshotBefore);
});

// ---------------------------------------------------------------------------
// §10.1 — EXEMPTIONS (frozen four-member literal, TE F-10)
// ---------------------------------------------------------------------------

describe("EXEMPTIONS (§10.1)", () => {
  test("is the frozen four-member literal, one string per FSPEC §7.5 clause, in clause order", () => {
    expect(EXEMPTIONS).toEqual([
      "generated trees: .claude/workflows/ and pdlc/workflows/dist/",
      "feature-docs: docs/<X>/ containing REQ-<X>.md",
      "any distribution-manifest.json",
      "any __tests__/",
    ]);
  });
});

// ---------------------------------------------------------------------------
// §10 / §14 — coveredViolations(root)
// ---------------------------------------------------------------------------

const EXPECTED_SEVEN = [
  "docs/PLAN-top-level.md",
  "docs/_queue/QUEUE.md",
  "docs/design/MASTER-PLAN.md",
  "pdlc/skills/orchestrate-dev/SKILL.md",
  "pdlc/skills/orchestrate-queue/SKILL.md",
  "pdlc/workflows/orchestrate-dev.js",
  "pdlc/workflows/orchestrate-queue.js",
]; // TSPEC §10.1 fixture-contents table, sorted LC_ALL=C by path

describe("coveredViolations (§10, §10.1)", () => {
  test("AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing", () => {
    expect(coveredViolations(LIVE_ROOT)).toEqual([]);
  });

  test("AT-23: coveredViolations(fixture root) returns exactly the 7 expected paths, sorted LC_ALL=C", () => {
    const result = coveredViolations(COVERED_FIXTURE_ROOT);
    expect(result.map((entry) => entry.path)).toEqual(EXPECTED_SEVEN);
    for (const entry of result) {
      expect(Array.isArray(entry.patterns)).toBe(true);
      expect(entry.patterns.length).toBeGreaterThan(0);
    }
  });

  describe("two-root independence (§10)", () => {
    test("calling coveredViolations against the fixture root does not perturb the LIVE_ROOT call, or vice versa", () => {
      const liveBefore = coveredViolations(LIVE_ROOT);
      const fixtureResult = coveredViolations(COVERED_FIXTURE_ROOT);
      const liveAfter = coveredViolations(LIVE_ROOT);

      expect(liveAfter).toEqual(liveBefore);
      expect(fixtureResult.map((entry) => entry.path)).toEqual(EXPECTED_SEVEN);
    });
  });
});

// ---------------------------------------------------------------------------
// §10.1, TE Q-04 — the split covered-violations fixture guard.
//
// On-disk presence is capability-free (runs on every runner). Tracked-ness
// is gated by itOrSkip("git", …) since it shells out to `git ls-files`.
// ---------------------------------------------------------------------------

describe("covered-violations fixture guard (§10.1, TE Q-04)", () => {
  const ALL_FIXTURE_RELATIVE_PATHS = [
    ...EXPECTED_SEVEN,
    "docs/some-feature/REQ-some-feature.md",
    "docs/some-feature/FSPEC-some-feature.md",
    ".claude/workflows/orchestrate-dev.bundle.js",
    "pdlc/workflows/dist/orchestrate-queue.bundle.js",
    "pdlc/workflows/dist/distribution-manifest.json",
    "pdlc/workflows/__tests__/someTest.js",
  ]; // TSPEC §10.1's 12-file table (7 expected violations + 5 exempt entries)

  test("every fixture-inventory file exists on disk (capability-free, every runner)", () => {
    for (const rel of ALL_FIXTURE_RELATIVE_PATHS) {
      expect(existsSync(join(COVERED_FIXTURE_ROOT, rel))).toBe(true);
    }
  });

  itOrSkip(
    "every fixture-inventory file is git-tracked, not merely present on disk",
    "git",
    [
      "AC-6.4's anti-widening guard not verified: the covered-violations fixture's git-tracked-ness could not be confirmed without git, so an untracked stray file masquerading as fixture content would go unnoticed.",
    ],
    () => {
      for (const rel of ALL_FIXTURE_RELATIVE_PATHS) {
        expect(() => run("git", ["ls-files", "--error-unmatch", rel], { cwd: COVERED_FIXTURE_ROOT })).not.toThrow();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// §10.2 / §14 — packagingViolations(root)
// ---------------------------------------------------------------------------

describe("packagingViolations (§10.2)", () => {
  test("AT-19: packagingViolations(LIVE_ROOT) is [] (live-dist/ write guard runs in this file's beforeAll/afterAll)", () => {
    expect(packagingViolations(LIVE_ROOT)).toEqual([]);
  });

  test("AT-29: fxRoot3 (break: sha1) is flagged clause 6.2(b), and packagingViolations(LIVE_ROOT) is still [] in the same test", () => {
    const fxRoot3 = makePackagingFixture({ break: "sha1" });
    const violations = packagingViolations(fxRoot3);
    expect(violations.some((v) => v.clause === "6.2(b)")).toBe(true);
    expect(packagingViolations(LIVE_ROOT)).toEqual([]);
  });

  test("fxRoot3b (break: retired): a manifest entry surviving for a removed dist/ file is flagged clause 6.2(c)", () => {
    const root = makePackagingFixture({ break: "retired" });
    const violations = packagingViolations(root);
    expect(violations.some((v) => v.clause === "6.2(c)")).toBe(true);
  });

  test("fxRoot3c (break: pluginPath): a manifest whose declared plugin path disagrees with dist/'s actual location is flagged clause 6.2(a)", () => {
    const root = makePackagingFixture({ break: "pluginPath" });
    const violations = packagingViolations(root);
    expect(violations.some((v) => v.clause === "6.2(a)")).toBe(true);
  });

  test("returned violations are sorted by (clause, path)", () => {
    const root = makePackagingFixture({ break: "retired" });
    const violations = packagingViolations(root);
    const sorted = [...violations].sort((a, b) => {
      if (a.clause !== b.clause) return a.clause < b.clause ? -1 : 1;
      return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
    });
    expect(violations).toEqual(sorted);
  });

  describe("two-root independence (§10)", () => {
    test("calling packagingViolations against a broken fixture root does not perturb the LIVE_ROOT call", () => {
      const liveBefore = packagingViolations(LIVE_ROOT);
      makePackagingFixture({ break: "sha1" });
      const liveAfter = packagingViolations(LIVE_ROOT);
      expect(liveAfter).toEqual(liveBefore);
    });
  });
});

// ---------------------------------------------------------------------------
// §10.3 / §14 — advertisedVersionViolation(root)
// ---------------------------------------------------------------------------

describe("advertisedVersionViolation (§10.3)", () => {
  test("AT-21: git absent from PATH ⇒ { skipped: S_GIT_ABSENT } (probe branch (b), cheapest precondition first)", () => {
    const emptyPathDir = makeToolDir([]);
    const originalPath = process.env.PATH;
    process.env.PATH = emptyPathDir;
    try {
      expect(advertisedVersionViolation(LIVE_ROOT)).toEqual({ skipped: S_GIT_ABSENT });
    } finally {
      process.env.PATH = originalPath;
    }
  });

  test("§10.3 branch (c): no .git directory ⇒ { skipped: S_NO_GIT_DIR }", () => {
    const root = makeBumpedVersionFixture();
    rmSync(join(root, ".git"), { recursive: true, force: true });
    expect(advertisedVersionViolation(root)).toEqual({ skipped: S_NO_GIT_DIR });
  });

  test("§10.3 branch (d): unborn HEAD (no commit yet) ⇒ { skipped: S_UNBORN_HEAD }", () => {
    const root = mkTmpRoot();
    initGitRepo(root);
    expect(advertisedVersionViolation(root)).toEqual({ skipped: S_UNBORN_HEAD });
  });

  test("AT-20: fxRootUntrackedOnly — untracked-only dist/ under an unbumped version is \"red\" (git diff HEAD misses this; the landing commit's own shape)", () => {
    const root = makeUntrackedOnlyFixture();
    expect(advertisedVersionViolation(root)).toBe("red");
  });

  test("AT-28: fxRoot2 — identical tree with version bumped in the working tree is \"green\"", () => {
    const root = makeBumpedVersionFixture();
    expect(advertisedVersionViolation(root)).toBe("green");
  });

  test("advertisedVersionViolation(LIVE_ROOT) is never \"red\" (§10.3) — \"green\" once landed, { skipped: S_NOTHING_STAGED } on an ordinary later commit", () => {
    expect(advertisedVersionViolation(LIVE_ROOT)).not.toBe("red");
  });
});

// ---------------------------------------------------------------------------
// §6.3 — D-1, D-2, D-3 document-correction oracles (v2.1, TE F-01).
//
// Asserted against LIVE_ROOT's live document text. Expected to be red from
// this batch until L-06 (Phase 7) actually corrects CLAUDE.md / pdlc/README.md.
// ---------------------------------------------------------------------------

function extractSection(markdown, headingLine) {
  const lines = markdown.split("\n");
  const startIdx = lines.findIndex((line) => line.trim() === headingLine);
  if (startIdx === -1) {
    throw new Error(`extractSection: heading not found: ${headingLine}`);
  }
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i += 1) {
    if (/^#{1,6}\s/.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join("\n");
}

describe("§6.3 document-correction oracles (D-1, D-2, D-3) — red from this batch until L-06", () => {
  const claudeMd = readFileSync(join(LIVE_ROOT, "CLAUDE.md"), "utf8");
  const readmeMd = readFileSync(join(LIVE_ROOT, "pdlc", "README.md"), "utf8");

  test("D-1: CLAUDE.md's 'Workflow scripts and the runtime build' section names both pdlc/workflows/dist/ and distribution-manifest.json, and no line co-occurs build-runtime with .claude/workflows/", () => {
    const section = extractSection(claudeMd, "### Workflow scripts and the runtime build");

    expect(section).toEqual(expect.stringContaining("pdlc/workflows/dist/"));
    expect(section).toEqual(expect.stringContaining("distribution-manifest.json"));

    const coOccurs = section
      .split("\n")
      .some((line) => line.includes("build-runtime") && line.includes(".claude/workflows/"));
    expect(coOccurs).toBe(false);
  });

  test("D-2: CLAUDE.md's hooks table has a row whose script is check-workflow-drift.sh, and the skills/scripts inventory names sync-workflows.sh", () => {
    expect(claudeMd).toEqual(expect.stringContaining("check-workflow-drift.sh"));
    expect(claudeMd).toEqual(expect.stringContaining("sync-workflows.sh"));
  });

  test("D-3: pdlc/README.md mentions workflows/dist/, and no line matches .claude/workflows/ followed by bundle", () => {
    expect(readmeMd).toEqual(expect.stringContaining("workflows/dist/"));

    const badLine = readmeMd
      .split("\n")
      .some((line) => /\.claude\/workflows\//.test(line) && /bundle/.test(line));
    expect(badLine).toBe(false);
  });
});
