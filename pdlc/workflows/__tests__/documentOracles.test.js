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
  chmodSync,
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
  S_PLUGIN_JSON_UNREADABLE,
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
  ]; // TSPEC §10.1's 13-file table (7 expected violations + 6 exempt entries).
  // Corrected from "12-file … + 5 exempt" (SE F-13, Phase CR): the array has always held 13
  // entries; only the comment was stale. Verified against `git ls-files` over the fixture root.

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

  // -------------------------------------------------------------------------
  // CR F-05 — the manifest's own readability is part of AC-6.2a.
  //
  // `packagingViolations` returned `[]` on THREE distinct inputs, only one of
  // which is benign: manifest absent (documented), manifest unparseable, and
  // manifest parseable but of neither known shape (no `else` after the
  // `entries`/`rows` branches, so `{}` or `{"rows":"[]"}` fell straight through
  // to clause (d) and returned []). A corrupt manifest therefore reported a
  // clean packaged tree, which is exactly what AC-6.2a exists to deny —
  // RELEASE-CHECKLIST §1's presence checks mitigate only the ABSENT case.
  //
  // The contract stays `{ clause, path, detail }[]`, empty === pass; only the
  // corrupt cases move from `[]` to a flagged 6.2(a) whose `detail` names the
  // parse/shape failure.
  // -------------------------------------------------------------------------
  describe("CR F-05 — an unreadable manifest is distinguishable from a clean tree", () => {
    const manifestRel = "pdlc/workflows/dist/distribution-manifest.json";

    test("an absent manifest is still [] — nothing has been packaged, so nothing can be violated", () => {
      const root = makePackagingFixture();
      rmSync(join(root, manifestRel));
      expect(packagingViolations(root)).toEqual([]);
    });

    test("a manifest that is not valid JSON is flagged 6.2(a), not silently []", () => {
      const root = makePackagingFixture();
      writeFileSync(join(root, manifestRel), '{"schemaVersion": 1, "rows": [\n');
      const violations = packagingViolations(root);
      expect(violations).not.toEqual([]);
      expect(
        violations.some(
          (v) => v.clause === "6.2(a)" && v.path === manifestRel && /not valid JSON/i.test(v.detail)
        )
      ).toBe(true);
    });

    // TSPEC §12.1's D6 mangling (an array replaced by a scalar) — the most
    // likely hand-edit / LLM-relay corruption. It parses fine and matches
    // neither known shape.
    test("a manifest of neither known shape is flagged 6.2(a), not silently []", () => {
      const root = makePackagingFixture();
      writeFileSync(join(root, manifestRel), `${JSON.stringify({ schemaVersion: 1, rows: "[]" })}\n`);
      const violations = packagingViolations(root);
      expect(violations).not.toEqual([]);
      expect(
        violations.some(
          (v) =>
            v.clause === "6.2(a)" && v.path === manifestRel && /neither .*rows.* nor .*entries/i.test(v.detail)
        )
      ).toBe(true);
    });

    test("an empty-object manifest is flagged 6.2(a) too (the {} fall-through)", () => {
      const root = makePackagingFixture();
      writeFileSync(join(root, manifestRel), "{}\n");
      expect(packagingViolations(root).some((v) => v.clause === "6.2(a)")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // CR G-01 — `packagingViolations` must be TOTAL over arbitrary JSON.
  //
  // F-05 closed the unparseable and neither-known-shape holes but left every
  // input that passes the `Array.isArray` gate and then dereferences a
  // non-object element. Four such inputs were MEASURED to throw an uncaught
  // `TypeError` (`null`, `{"rows":[null]}`, `{"entries":[null]}`,
  // `{"rows":[{}]}`); probing outwards from those found six more (a string or
  // non-string-`pluginPath` row, an entry missing `path`, a non-array
  // `retires` / `retired`, a non-string `plugin.path`), plus two inputs that
  // did not throw but were described by the wrong message (a top-level array
  // and a top-level scalar are not "an object with neither rows nor entries").
  //
  // `null` is the classic trap: `typeof null === "object"`, so it never
  // reaches the new `else`; `null.entries` throws first.
  //
  // The ruling implemented here (see the divergence note in
  // document-oracles.mjs between §10.2 and §10.3): NEITHER oracle may throw —
  // these are checklist instruments, and an exception aborts the whole check.
  // But the two "cannot judge" answers differ legitimately.
  // `advertisedVersionViolation` answers a question that can be genuinely
  // inapplicable, so it skips. `packagingViolations` answers "is the packaged
  // set well-formed?", and a manifest that is null / shapeless / whose rows
  // are not objects IS ITSELF a packaging defect — so malformed input is a
  // 6.2(a) VIOLATION, never a skip and never a silent [] (which would
  // reinstate F-05 exactly).
  // -------------------------------------------------------------------------
  describe("CR G-01 — every malformed-but-parseable manifest is a 6.2(a) violation, never a throw", () => {
    const manifestRel = "pdlc/workflows/dist/distribution-manifest.json";
    const realBundle = "pdlc/workflows/dist/orchestrate-dev.bundle.js";

    // [label, manifest JSON text, regex the 6.2(a) detail must match]
    const MALFORMED = [
      // --- the four the reviewer MEASURED as uncaught TypeErrors ---
      ["null (measured: TypeError on `.entries`)", "null", /not a JSON object.*\bnull\b/i],
      ['{"rows":[null]} (measured)', '{"rows":[null]}', /row 0 .*not a JSON object.*\bnull\b/i],
      ['{"entries":[null]} (measured)', '{"entries":[null]}', /entry 0 .*not a JSON object.*\bnull\b/i],
      ['{"rows":[{}]} (measured)', '{"rows":[{}]}', /row 0.*pluginPath.*not a non-empty string/i],
      // --- siblings found while making the oracle total ---
      ["[] — a top-level array is not a manifest object", "[]", /not a JSON object.*\barray\b/i],
      ['"a string" — a top-level scalar', '"a string"', /not a JSON object.*\bstring\b/i],
      ['{"rows":["x"]} — a row that is a string', '{"rows":["x"]}', /row 0 .*not a JSON object.*\bstring\b/i],
      [
        '{"rows":[{"pluginPath":7,…}]} — a non-string pluginPath',
        '{"rows":[{"pluginPath":7,"pluginSha1":"0"}]}',
        /row 0.*pluginPath.*not a non-empty string/i,
      ],
      ['{"entries":[{}]} — an entry with no path', '{"entries":[{}]}', /entry 0.*path.*not a non-empty string/i],
      [
        '{"entries":[{"path":<real>}]} — an entry with no pluginSha1',
        `{"entries":[{"path":${JSON.stringify(realBundle)}}]}`,
        /entry 0 .*pluginSha1.*not a string/i,
      ],
      [
        '{"rows":[{…,"retires":5}]} — a non-array retires',
        '{"rows":[{"pluginPath":"workflows/dist/orchestrate-dev.bundle.js","pluginSha1":"0","retires":5}]}',
        /row 0 .*retires.*not an array/i,
      ],
      [
        '{"rows":[],"retired":5} — a non-array top-level retired',
        '{"rows":[],"retired":5}',
        /top-level "retired".*not an array/i,
      ],
      [
        '{"plugin":{"path":5},"entries":[]} — a non-string plugin.path',
        '{"plugin":{"path":5},"entries":[]}',
        /plugin\.path.*does not resolve inside the packaged set/i,
      ],
    ];

    test.each(MALFORMED)("%s — does not throw", (_label, body) => {
      const root = makePackagingFixture();
      writeFileSync(join(root, manifestRel), `${body}\n`);
      expect(() => packagingViolations(root)).not.toThrow();
    });

    test.each(MALFORMED)("%s — is flagged 6.2(a), naming the shape failure", (_label, body, detailRe) => {
      const root = makePackagingFixture();
      writeFileSync(join(root, manifestRel), `${body}\n`);
      const violations = packagingViolations(root);
      expect(violations).not.toEqual([]);
      expect(
        violations.some((v) => v.clause === "6.2(a)" && detailRe.test(v.detail))
      ).toBe(true);
    });

    test("the shape violations are reported against the manifest itself, and the result still sorts", () => {
      const root = makePackagingFixture();
      writeFileSync(join(root, manifestRel), '{"rows":[null,{},"x"]}\n');
      const violations = packagingViolations(root);
      expect(violations.length).toBe(3);
      for (const v of violations) {
        expect(v.clause).toBe("6.2(a)");
        expect(v.path).toBe(manifestRel);
      }
      const sorted = [...violations].sort((a, b) => {
        if (a.clause !== b.clause) return a.clause < b.clause ? -1 : 1;
        return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
      });
      expect(violations).toEqual(sorted);
    });

    test("a manifest path that cannot be READ (a directory in its place) is 6.2(a), not a throw and not []", () => {
      const root = makePackagingFixture();
      rmSync(join(root, manifestRel));
      mkdirSync(join(root, manifestRel));
      let violations;
      expect(() => {
        violations = packagingViolations(root);
      }).not.toThrow();
      expect(violations).not.toEqual([]);
      expect(
        violations.some((v) => v.clause === "6.2(a)" && v.path === manifestRel && /could not be read/i.test(v.detail))
      ).toBe(true);
    });

    // The generic backstop is not decoration: an input no shape guard can
    // catch — a well-formed manifest naming a packaged file that exists but
    // cannot be READ — reaches it. Without it this throws EACCES out of
    // `readFileSync` during the sha1 recomputation. Needs a non-root uid:
    // under uid 0 the permission bits are bypassed and the file reads fine.
    itOrSkip(
      "a well-formed manifest naming an UNREADABLE packaged file reaches the backstop: 6.2(a), not a throw",
      "uid-nonroot",
      ["CR G-01: packagingViolations is total — the generic backstop is reached rather than throwing"],
      () => {
        const root = mkTmpRoot();
        mkdirSync(join(root, "pdlc/workflows/dist"), { recursive: true });
        const pluginRel = "workflows/dist/orchestrate-dev.bundle.js";
        const abs = join(root, "pdlc", pluginRel);
        writeFileSync(abs, "// bytes\n");
        chmodSync(abs, 0o000);
        try {
          writeFileSync(
            join(root, manifestRel),
            `${JSON.stringify({
              schemaVersion: 1,
              rows: [{ id: "orchestrate-dev", pluginPath: pluginRel, pluginSha1: "0".repeat(40) }],
              retired: [],
            })}\n`,
          );
          let violations;
          expect(() => {
            violations = packagingViolations(root);
          }).not.toThrow();
          expect(
            violations.some(
              (v) => v.clause === "6.2(a)" && v.path === manifestRel && /EACCES|could not be checked/i.test(v.detail),
            ),
          ).toBe(true);
        } finally {
          chmodSync(abs, 0o644);
        }
      },
    );

    test("totality is not bought with silence: a well-formed manifest is still [] (F-05 not reinstated)", () => {
      expect(packagingViolations(makePackagingFixture())).toEqual([]);
    });
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

  // -------------------------------------------------------------------------
  // CR F-19 — the documented return type is `"red" | "green" | { skipped }`.
  //
  // The final comparison read plugin.json from the working tree and from HEAD
  // through two UNGUARDED `JSON.parse` calls (plus two unguarded reads), so a
  // malformed or missing plugin.json on either side threw a SyntaxError/Error
  // straight out of the oracle — outside its contract. Every OTHER precondition
  // in this function is a skip-loudly branch (O-16); these were a crash.
  // -------------------------------------------------------------------------
  describe("CR F-19 — an unreadable plugin.json skips loudly instead of throwing", () => {
    test("malformed plugin.json in the working tree ⇒ { skipped: S_PLUGIN_JSON_UNREADABLE }", () => {
      const root = makeUntrackedOnlyFixture();
      writeFileSync(join(root, "plugin.json"), '{"name": "pdlc", "version":\n');
      expect(() => advertisedVersionViolation(root)).not.toThrow();
      expect(advertisedVersionViolation(root)).toEqual({ skipped: S_PLUGIN_JSON_UNREADABLE });
    });

    test("plugin.json absent from the working tree ⇒ { skipped: S_PLUGIN_JSON_UNREADABLE }", () => {
      const root = makeUntrackedOnlyFixture();
      rmSync(join(root, "plugin.json"));
      expect(advertisedVersionViolation(root)).toEqual({ skipped: S_PLUGIN_JSON_UNREADABLE });
    });

    test("malformed plugin.json at HEAD ⇒ { skipped: S_PLUGIN_JSON_UNREADABLE }", () => {
      const root = mkTmpRoot();
      writeTree(root, { "plugin.json": '{"name": "pdlc", "version":\n' });
      initGitRepo(root);
      commitAll(root, "initial (malformed plugin.json)");
      // Working tree is now well-formed and bumped; only HEAD's copy is broken.
      writeFileSync(
        join(root, "plugin.json"),
        `${JSON.stringify({ name: "pdlc", version: "0.12.0" }, null, 2)}\n`
      );
      mkdirSync(join(root, "pdlc/workflows/dist"), { recursive: true });
      writeFileSync(
        join(root, "pdlc/workflows/dist/orchestrate-dev.bundle.js"),
        "// generated, untracked\n"
      );
      expect(() => advertisedVersionViolation(root)).not.toThrow();
      expect(advertisedVersionViolation(root)).toEqual({ skipped: S_PLUGIN_JSON_UNREADABLE });
    });
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
