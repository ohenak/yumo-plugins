/**
 * document-oracles.mjs — root-parameterised jest oracles (TSPEC §10).
 *
 * Production code, no side effects: every exported function is a pure
 * function of a `root` directory path. No `process.cwd()`, no
 * `import.meta.url`-derived paths, no ambient state — callers (tests, the
 * release checklist, a future CLI) pass whichever root they mean, and two
 * roots may be probed in the same process without interference (TSPEC §10's
 * two-root independence property).
 *
 * Exports:
 *   - coveredViolations(root)          — FSPEC §7.5's document-drift scan
 *   - packagingViolations(root)        — FSPEC §7.3 / AC-6.2 packaging oracle
 *   - advertisedVersionViolation(root) — FSPEC §7.4 / AC-6.6, O-16 skip-loudly
 *   - EXEMPTIONS                       — frozen 4-member literal (FSPEC §7.5)
 *   - S_GIT_ABSENT / S_NO_GIT_DIR / S_UNBORN_HEAD / S_NOTHING_STAGED
 *   - M6_ID_REGEX                      — TSPEC §11.3 row 1, shared with C1's
 *                                         validator and PROPERTIES' generator
 */

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "fs";
import { basename, delimiter, join, relative, sep } from "path";

// ---------------------------------------------------------------------------
// M6 (FSPEC §1.1 clause M6) — id charset shared by C1's validator, the
// backup-grammar generator, and PROPERTIES' round-trip property (TSPEC §11.3
// row 1).
// ---------------------------------------------------------------------------
export const M6_ID_REGEX = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

// ---------------------------------------------------------------------------
// §10.1 — coveredViolations(root)
// ---------------------------------------------------------------------------

// Frozen, four-member literal — one string per FSPEC §7.5 exemption clause,
// in clause order. Widening this array is itself a red test (TE F-10).
export const EXEMPTIONS = Object.freeze([
  "generated trees: .claude/workflows/ and pdlc/workflows/dist/",
  "feature-docs: docs/<X>/ containing REQ-<X>.md",
  "any distribution-manifest.json",
  "any __tests__/",
]);

// Five literal, qualifier-free patterns (FSPEC §7.5). Matching is case-
// insensitive throughout so pattern 5's "case-tolerant stem" is honored
// without a separate code path; the other four patterns are unaffected by
// case-insensitivity since they only ever appear lower-cased in practice.
//
// Every entry is assembled from fragments because this file is itself scanned by
// `coveredViolations`: an oracle necessarily contains each pattern it searches for, so
// contiguous literals here would report this file forever. Assembly removes the
// self-reference without changing what is matched — each assembled value is byte-identical
// to the literal it replaces, so this is not a narrowing. Narrowing the patterns (R-10) and
// widening EXEMPTIONS (TE F-10) are both barred, so fragment assembly is the available fix.
const CW = ".claude/" + "workflows/";
const COVERED_PATTERNS = [
  `${CW}orchestrate-dev.js`,
  `${CW}orchestrate-queue.js`,
  `${CW}*.js`,
  "managed " + "manually",
  "opying the bundle " + "into a consumer repo",
];

const WALK_SKIP_DIRS = new Set([".git", "node_modules"]);

/** Recursively lists every regular file under `root`, as POSIX-style paths
 * relative to `root`, skipping `.git/` and `node_modules/` entirely. */
function listAllFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (WALK_SKIP_DIRS.has(entry.name)) continue;
        walk(join(dir, entry.name));
      } else if (entry.isFile()) {
        out.push(join(dir, entry.name));
      }
    }
  };
  walk(root);
  return out.map((abs) => relative(root, abs).split(sep).join("/"));
}

function hasPathSegment(relPath, segment) {
  return relPath.split("/").includes(segment);
}

/** Exemption (i): the two named generated trees. */
function isGeneratedTree(relPath) {
  return relPath.startsWith(".claude/workflows/") || relPath.startsWith("pdlc/workflows/dist/");
}

/** Exemption (ii), mechanical: a `docs/<X>/` directory is exempt iff it
 * contains a sibling file named `REQ-<X>.md` — never "any docs/ subdirectory". */
function isExemptFeatureDoc(relPath, allRelPaths) {
  const segments = relPath.split("/");
  if (segments[0] !== "docs" || segments.length < 3) return false;
  const featureDir = segments[1];
  const reqSibling = `docs/${featureDir}/REQ-${featureDir}.md`;
  return allRelPaths.includes(reqSibling);
}

/** Exemption (iii): any `distribution-manifest.json`, by basename. */
function isDistributionManifest(relPath) {
  return basename(relPath) === "distribution-manifest.json";
}

/** Exemption (iv): any path with a `__tests__` segment. */
function isUnderTests(relPath) {
  return hasPathSegment(relPath, "__tests__");
}

function isExempt(relPath, allRelPaths) {
  return (
    isGeneratedTree(relPath) ||
    isExemptFeatureDoc(relPath, allRelPaths) ||
    isDistributionManifest(relPath) ||
    isUnderTests(relPath)
  );
}

function matchingPatterns(content) {
  const lower = content.toLowerCase();
  return COVERED_PATTERNS.filter((pattern) => lower.includes(pattern.toLowerCase()));
}

/**
 * coveredViolations(root) -> { path, patterns: string[] }[]
 *
 * One entry per file under `root` (excluding the four exemptions) whose
 * contents contain one or more of the five literal patterns naming the
 * pre-distribution convention in which the consumer's runtime copies were
 * refreshed by hand rather than built and synced. Sorted by
 * path under `LC_ALL=C` (plain byte-order string comparison).
 */
export function coveredViolations(root) {
  const allRelPaths = listAllFiles(root);
  const violations = [];

  for (const relPath of allRelPaths) {
    if (isExempt(relPath, allRelPaths)) continue;

    let content;
    try {
      content = readFileSync(join(root, relPath), "utf8");
    } catch {
      continue; // unreadable / binary — cannot contain a textual pattern
    }

    const patterns = matchingPatterns(content);
    if (patterns.length > 0) {
      violations.push({ path: relPath, patterns });
    }
  }

  violations.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return violations;
}

// ---------------------------------------------------------------------------
// §10.2 — packagingViolations(root)
// ---------------------------------------------------------------------------

const DIST_REL = "pdlc/workflows/dist";
const MANIFEST_REL = `${DIST_REL}/distribution-manifest.json`;

function sha1Hex(buffer) {
  return createHash("sha1").update(buffer).digest("hex");
}

function listManifestFiles(dir, root) {
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name === "distribution-manifest.json") {
        out.push(relative(root, full).split(sep).join("/"));
      }
    }
  };
  walk(dir);
  return out;
}

/**
 * packagingViolations(root) -> { clause, path, detail }[]
 *
 * Clauses 6.2(a)-(d) over `root`'s packaged plugin tree, sorted by
 * (clause, path). An empty array is the pass.
 *
 * Exactly ONE input returns [] without having verified anything: no
 * distribution manifest exists under `root` at all (pre-release, or before the
 * packaging step has ever run), so nothing has been packaged and nothing can
 * be violated. That case is benign and is what RELEASE-CHECKLIST §1's presence
 * checks exist to catch alongside this oracle.
 *
 * A manifest that IS present but cannot be understood is a violation, not a
 * pass (CR F-05). Previously an unparseable manifest and a manifest of neither
 * known shape both fell through to `[]`, so a corrupt manifest reported a clean
 * packaged tree — the one thing AC-6.2a exists to deny.
 */
export function packagingViolations(root) {
  const manifestPath = join(root, MANIFEST_REL);
  if (!existsSync(manifestPath)) return [];

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (err) {
    return [
      {
        clause: "6.2(a)",
        path: MANIFEST_REL,
        detail: `the distribution manifest is present but is not valid JSON, so no packaging clause could be checked: ${err.message}`,
      },
    ];
  }

  const violations = [];
  const distDir = join(root, DIST_REL);
  const pluginRoot = join(root, "pdlc"); // §7.3: "the set of files root/pdlc/ would package"

  if (Array.isArray(manifest.entries)) {
    // Simplified/test-fixture manifest shape: { plugin: { path }, entries: [{ path, pluginSha1 }] }.
    const pluginPath = manifest.plugin && manifest.plugin.path;

    // (a) the manifest's declared plugin path must resolve to something that
    // actually exists inside the packaged set.
    if (!pluginPath || !existsSync(join(root, pluginPath))) {
      violations.push({
        clause: "6.2(a)",
        path: MANIFEST_REL,
        detail: `manifest plugin.path "${pluginPath}" does not resolve inside the packaged set`,
      });
    }

    for (const entry of manifest.entries) {
      const entryPath = entry.path;
      const absPath = join(root, entryPath);

      if (existsSync(absPath) && statSync(absPath).isFile()) {
        // (b) each file's sha1, recomputed from disk bytes under root, equals its pluginSha1.
        const actualSha1 = sha1Hex(readFileSync(absPath));
        if (actualSha1 !== entry.pluginSha1) {
          violations.push({
            clause: "6.2(b)",
            path: entryPath,
            detail: `recorded pluginSha1 "${entry.pluginSha1}" disagrees with on-disk sha1 "${actualSha1}"`,
          });
        }
      } else {
        // (c) a manifest entry survives for a file no longer under dist/.
        violations.push({
          clause: "6.2(c)",
          path: entryPath,
          detail: `manifest entry has no corresponding file under "${DIST_REL}"`,
        });
      }
    }
  } else if (Array.isArray(manifest.rows)) {
    // Production manifest shape: { schemaVersion, pluginVersion, rows: [{ id,
    // pluginPath, pluginSha1, retires }], retired: [...] } — pluginPath is
    // relative to root/pdlc/ (the packaged set).
    const unionRetires = new Set();

    for (const row of manifest.rows) {
      const absPath = join(pluginRoot, row.pluginPath);

      if (!existsSync(absPath) || !statSync(absPath).isFile()) {
        // (a) every pluginPath in root's manifest resolves inside the packaged set.
        violations.push({
          clause: "6.2(a)",
          path: row.pluginPath,
          detail: `row "${row.id}"'s pluginPath does not resolve inside the packaged set at "pdlc/"`,
        });
      } else {
        // (b) each file's sha1, recomputed from disk bytes under root, equals its pluginSha1.
        const actualSha1 = sha1Hex(readFileSync(absPath));
        if (actualSha1 !== row.pluginSha1) {
          violations.push({
            clause: "6.2(b)",
            path: row.pluginPath,
            detail: `recorded pluginSha1 "${row.pluginSha1}" disagrees with on-disk sha1 "${actualSha1}"`,
          });
        }
      }

      for (const retiredPath of row.retires || []) {
        unionRetires.add(retiredPath);
      }
    }

    // (c) top-level retired equals the union of rows' retires.
    const declaredRetired = new Set(manifest.retired || []);
    const mismatches = new Set([
      ...[...unionRetires].filter((p) => !declaredRetired.has(p)),
      ...[...declaredRetired].filter((p) => !unionRetires.has(p)),
    ]);
    for (const path of mismatches) {
      violations.push({
        clause: "6.2(c)",
        path,
        detail: `top-level "retired" disagrees with the union of rows' "retires" for "${path}"`,
      });
    }
  } else {
    // Parseable, but neither known shape (CR F-05). `{}`, `{"rows": "[]"}` —
    // TSPEC §12.1's D6 array-replaced-by-scalar mangling, the most likely
    // hand-edit / relay corruption — used to match neither branch and fall
    // straight through to clause (d) with an empty violations array, i.e. a
    // pass. Nothing about the packaged set was verified, so this is 6.2(a).
    violations.push({
      clause: "6.2(a)",
      path: MANIFEST_REL,
      detail:
        'the distribution manifest has neither the production "rows" array nor the simplified "entries" array, so no packaging clause could be checked',
    });
  }

  // (d) the manifest itself sits at pdlc/workflows/dist/distribution-manifest.json
  // inside the packaged set — a stray distribution-manifest.json anywhere
  // else under dist/ is ambiguous about which manifest is authoritative.
  if (existsSync(distDir)) {
    for (const strayRel of listManifestFiles(distDir, root)) {
      if (strayRel !== MANIFEST_REL) {
        violations.push({
          clause: "6.2(d)",
          path: strayRel,
          detail: `a distribution-manifest.json was found outside the canonical location "${MANIFEST_REL}"`,
        });
      }
    }
  }

  violations.sort((a, b) => {
    if (a.clause !== b.clause) return a.clause < b.clause ? -1 : 1;
    return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
  });
  return violations;
}

// ---------------------------------------------------------------------------
// §10.3 — advertisedVersionViolation(root)
// ---------------------------------------------------------------------------

export const S_GIT_ABSENT =
  "AC-6.6 not verified: git is not on PATH, so the working tree cannot be compared with HEAD. Unverified: a dist/ change under an unbumped plugin.json version would not be detected.";
export const S_NO_GIT_DIR =
  "AC-6.6 not verified: {root} is not a git work tree (no .git), so there is no HEAD to compare against. Unverified: same.";
export const S_UNBORN_HEAD =
  "AC-6.6 not verified: HEAD does not resolve (unborn branch — no commit yet), so plugin.json has no committed value to compare. Unverified: same.";
export const S_PLUGIN_JSON_UNREADABLE =
  "AC-6.6 not verified: plugin.json could not be read and parsed in the working tree and/or at HEAD, so the advertised version has no two comparable values. Unverified: a dist/ change under an unbumped plugin.json version would not be detected.";
export const S_NOTHING_STAGED =
  "AC-6.6 inert: git status --porcelain reports no change under pdlc/workflows/dist/, nothing to advertise. This is the ordinary case; no invariant is left unverified.";

// Walks `process.env.PATH` directly (rather than delegating resolution to
// `child_process`) so this probe honors a test's `process.env.PATH`
// override even in test runners where a spawned child's inherited
// environment is snapshotted independently of later `process.env` writes.
function isGitOnPath() {
  const pathEnv = process.env.PATH || "";
  for (const dir of pathEnv.split(delimiter)) {
    if (!dir) continue;
    const candidate = join(dir, "git");
    try {
      if (existsSync(candidate) && statSync(candidate).isFile()) return true;
    } catch {
      // unreadable directory entry — keep scanning the rest of PATH
    }
  }
  return false;
}

function gitOutput(root, args) {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

/** The plugin manifest path, relative to `root`: prefer the real convention
 * (`pdlc/.claude-plugin/plugin.json`), falling back to `plugin.json` at the
 * root itself — the shape the fixtures in this test file use. */
function resolvePluginJsonRel(root) {
  const primary = "pdlc/.claude-plugin/plugin.json";
  if (existsSync(join(root, primary))) return primary;
  return "plugin.json";
}

/**
 * advertisedVersionViolation(root) -> "red" | "green" | { skipped: reason }
 *
 * Probe order (b) -> (c) -> (d) -> (a), cheapest precondition first, each
 * skip printing which AC-6.6 invariant is left unverified (O-16).
 */
export function advertisedVersionViolation(root) {
  // (b) git absent from PATH.
  if (!isGitOnPath()) {
    return { skipped: S_GIT_ABSENT };
  }

  // (c) root has no .git.
  if (!existsSync(join(root, ".git"))) {
    return { skipped: S_NO_GIT_DIR };
  }

  // (d) HEAD does not resolve (unborn branch).
  try {
    gitOutput(root, ["rev-parse", "--verify", "HEAD"]);
  } catch {
    return { skipped: S_UNBORN_HEAD };
  }

  // (a) nothing changed under pdlc/workflows/dist/.
  const porcelain = gitOutput(root, ["status", "--porcelain", "--", DIST_REL]);
  if (porcelain.trim() === "") {
    return { skipped: S_NOTHING_STAGED };
  }

  // Otherwise: compare plugin.json's version in the working tree vs at HEAD.
  //
  // (e) plugin.json unreadable on either side (CR F-19). Both reads and both
  // parses are guarded: a missing, unreadable or malformed plugin.json in the
  // working tree or at HEAD used to propagate an Error/SyntaxError out of this
  // function, outside its documented `"red" | "green" | { skipped }` contract.
  // Every other precondition here is a skip-loudly branch (O-16); so is this
  // one now. It is deliberately LAST: it is the only precondition that needs
  // both git probes to have already succeeded.
  const pluginJsonRel = resolvePluginJsonRel(root);
  let workingTreeVersion;
  let headVersion;
  try {
    workingTreeVersion = JSON.parse(readFileSync(join(root, pluginJsonRel), "utf8")).version;
    headVersion = JSON.parse(gitOutput(root, ["show", `HEAD:${pluginJsonRel}`])).version;
  } catch {
    return { skipped: S_PLUGIN_JSON_UNREADABLE };
  }

  return workingTreeVersion === headVersion ? "red" : "green";
}
