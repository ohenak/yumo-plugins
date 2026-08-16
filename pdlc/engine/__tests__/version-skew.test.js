// Published-version skew oracle (CODE_REVIEW v4 §2 rows 1-2, §3-1, §3-2).
//
// REQ AC-2.1/AC-2.2's final operator-visible artifact is the package the
// documented command installs, not the tree. A tag is immutable on the
// registry (C-7), so once a version number has been published it names those
// bytes forever. HEAD may therefore never keep claiming a version number that
// is already recorded as published: doing so makes every provenance value HEAD
// emits (`engineVersion`, AC-4.1/AC-4.3) ambiguous against the published one —
// the same regime-ledger ambiguity this feature exists to close, one axis over.
//
// The published set is read from the tracked, dated publish evidence under
// `docs/completed/pdlc-engine-distribution/` (EVIDENCE-BR-3.9.md and any successor), not
// from the registry: the oracle is hermetic and offline, and the evidence file
// is written *after* a publish, so a tag commit (where PF-1 pins tag ≡
// `package.json` version) is never red on account of its own release.
//
// This is REQ NG-5's recorded reasoning applied to the engine axis; NG-5
// already applies it to the plugin axis (`plugin.json` 0.23.0 → 0.23.1, "so
// changed plugin bytes never again ship under a version number that already
// named different bytes").

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(ENGINE_ROOT, "..", "..");

const EVIDENCE_PATHSPEC = "docs/completed/pdlc-engine-distribution/EVIDENCE-*.md";

function manifest() {
  return JSON.parse(readFileSync(path.join(ENGINE_ROOT, "package.json"), "utf8"));
}

function trackedEvidenceFiles() {
  const out = execFileSync("git", ["ls-files", "--", EVIDENCE_PATHSPEC], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// A version counts as published only where the evidence states it as a
// registry fact: `@{name}@X.Y.Z` (the published package) or `engine-vX.Y.Z`
// (the tag it was published from). Bare `X.Y.Z` mentions elsewhere in prose
// are deliberately not harvested.
function publishedVersions(pkgName) {
  const found = new Set();
  const packageRe = new RegExp(
    `${pkgName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}@(\\d+\\.\\d+\\.\\d+)`,
    "g",
  );
  const tagRe = /engine-v(\d+\.\d+\.\d+)/g;
  for (const rel of trackedEvidenceFiles()) {
    const text = readFileSync(path.join(REPO_ROOT, rel), "utf8");
    for (const match of text.matchAll(packageRe)) found.add(match[1]);
    for (const match of text.matchAll(tagRe)) found.add(match[1]);
  }
  return found;
}

function compareSemver(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

test("AC-2.1/AC-2.2: HEAD's engine version never reuses a version already recorded as published", () => {
  const pkg = manifest();
  const published = publishedVersions(pkg.name);

  assert.ok(
    published.size > 0,
    `expected at least one published version to be recorded in ${EVIDENCE_PATHSPEC}`,
  );
  assert.ok(
    !published.has(pkg.version),
    `pdlc/engine/package.json declares version ${pkg.version}, which is already recorded as ` +
      `published (${[...published].sort().join(", ")}). Published bytes are immutable, so HEAD ` +
      `must bump past them rather than re-claim the number (REQ NG-5's reasoning, engine axis).`,
  );
});

test("AC-2.1/AC-2.2: HEAD's engine version is ahead of every recorded published version", () => {
  const pkg = manifest();
  const published = [...publishedVersions(pkg.name)];
  const highest = published.sort(compareSemver).at(-1);

  assert.equal(
    compareSemver(pkg.version, highest),
    1,
    `pdlc/engine/package.json declares version ${pkg.version}, which is not ahead of the highest ` +
      `recorded published version ${highest}; \`@latest\` would resolve to older bytes than HEAD.`,
  );
});

test("§3-2: the README's headless-engine block carries the sibling install block's pre-merge caveat", () => {
  const readme = readFileSync(path.join(REPO_ROOT, "pdlc/README.md"), "utf8");

  const siblingCaveat = "Until this work merges";
  assert.ok(
    readme.includes(siblingCaveat),
    "expected the `## Install in another repo` block to keep its pre-merge caveat",
  );

  const start = readme.indexOf("### Headless engine (npm)");
  assert.ok(start !== -1, "expected pdlc/README.md to carry the `### Headless engine (npm)` block");
  const rest = readme.slice(start + 1);
  const nextHeading = rest.search(/\n## /);
  const block = nextHeading === -1 ? rest : rest.slice(0, nextHeading);

  assert.ok(
    block.includes(siblingCaveat),
    "the `### Headless engine (npm)` block must carry the same pre-merge caveat as its sibling " +
      "`## Install in another repo` block: the published package predates this branch's bytes " +
      "until the successor version is cut (CODE_REVIEW v4 §3-2).",
  );
});
