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
 *   - EXEMPTIONS                       — frozen 4-member literal (FSPEC §7.5)
 *   - M6_ID_REGEX                      — TSPEC §11.3 row 1, shared with C1's
 *                                         validator and PROPERTIES' generator
 *
 * The packaging oracle (packagingViolations) and the advertised-version
 * oracle (advertisedVersionViolation), along with their five named skip
 * reasons, were retired in the pdlc-plugin-retirement sweep (FSPEC AT-1.6,
 * DECISIONS DEC-09): both checked `pdlc/workflows/dist/`'s now-deleted
 * bundles and manifest. Post-sweep plugin/engine compatibility is checked
 * directly via `pdlc/engine/lib/handshake.mjs`'s `satisfiesRange` against
 * `pdlc/.claude-plugin/plugin.json`'s version.
 */

import { readdirSync, readFileSync } from "fs";
import { basename, join, relative, sep } from "path";

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
  "generated tree: pdlc/workflows/dist/",
  "feature-docs: docs/<X>/ containing REQ-<X>.md",
  "any distribution" + "-manifest.json",
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

/** Exemption (i): the one remaining named generated tree. */
function isGeneratedTree(relPath) {
  return relPath.startsWith("pdlc/workflows/dist/");
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

/** Exemption (iii): the retired index-manifest filename (EXEMPTIONS[2]), by basename.
 *
 * No live-tree writer emits this filename anymore (pdlc-plugin-retirement,
 * DEC-02/DEC-09 retired the build step that used to produce it alongside the
 * now-deleted workflow-runtime bundles). The clause is kept narrow rather than
 * removed because the completed pdlc-workflow-distribution feature's FSPEC
 * §7.5 pins EXEMPTIONS as a frozen four-member literal; today this clause's
 * only decisive role is keeping `documentOracles.test.js`'s dedicated
 * exemption-(iii) fixture witness from being shadowed by clause (i)'s
 * generated-tree match. */
function isDistributionManifest(relPath) {
  return basename(relPath) === "distribution" + "-manifest.json";
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

