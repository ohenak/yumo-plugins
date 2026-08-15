// T18 (pdlc-engine-distribution) — AT-2.2 / PROP-INSTALL-8. Asserts each
// engine install/upgrade/pairing command occurs exactly once across a
// STATED, TRACKED file set — never a tree walk (TE round-1 F-05) — and that
// the plugin's three pre-existing `claude plugin install` sites are present
// as a positive, distinct from the engine's own uniqueness key (TE round-2
// F-03: the pathspec below is tightened to also exclude nested `docs/` and
// `__tests__/` dirs inside fixture corpora, which the un-tightened
// `:(exclude)docs/` alone did not reach).
//
// RED at T18: `pdlc/README.md` does not yet carry the install/upgrade/
// pairing commands (T31, not yet landed), so the three engine-command counts
// below are 0, not 1. This file goes green at T31 with no change here.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));

const PATHSPEC = [
  "README.md",
  "pdlc/README.md",
  "pdlc/engine/README.md",
  "*.md",
  ":(exclude)docs/",
  ":(exclude)*/fixtures/*",
  ":(exclude)*/__tests__/*",
];

function trackedDocFiles() {
  const out = execFileSync("git", ["ls-files", "--", ...PATHSPEC], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function countOccurrences(haystack, needle) {
  if (needle === "") return 0;
  let count = 0;
  let idx = 0;
  for (;;) {
    idx = haystack.indexOf(needle, idx);
    if (idx === -1) break;
    count += 1;
    idx += needle.length;
  }
  return count;
}

function engineCommandLiteral() {
  const pkgPath = path.join(engineRoot, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  return pkg.name;
}

test("AT-2.2: docs uniqueness set is git ls-files over the stated pathspec, not a tree walk", () => {
  const files = trackedDocFiles();
  assert.ok(files.length > 0, "expected the stated pathspec to match tracked files");
  for (const rel of files) {
    assert.ok(!rel.startsWith("docs/"), `${rel} must be excluded (outside docs/)`);
    assert.ok(!rel.includes("/fixtures/"), `${rel} must exclude fixture corpora`);
    assert.ok(!rel.includes("/__tests__/"), `${rel} must exclude test-fixture trees`);
  }
});

test("T31: AT-2.2: each engine install/upgrade/pairing command occurs exactly once", () => {
  const files = trackedDocFiles();
  const pkgName = engineCommandLiteral();
  const commands = [
    `npm i -g ${pkgName}`,
    `npm i -g ${pkgName}@latest`,
    `npm view ${pkgName} pdlcPairing`,
  ];

  const contents = files.map((rel) => ({
    rel,
    text: readFileSync(path.join(repoRoot, rel), "utf8"),
  }));

  for (const command of commands) {
    let total = 0;
    for (const { text } of contents) {
      total += countOccurrences(text, command);
    }
    assert.equal(total, 1, `expected exactly one occurrence of "${command}", found ${total}`);
  }
});

test("AT-2.2: the plugin's three `claude plugin install` sites are asserted as a positive", () => {
  const files = trackedDocFiles();
  const contents = files.map((rel) => ({
    rel,
    text: readFileSync(path.join(repoRoot, rel), "utf8"),
  }));

  let total = 0;
  for (const { text } of contents) {
    total += countOccurrences(text, "claude plugin install");
  }
  assert.equal(total, 3, `expected exactly three "claude plugin install" sites, found ${total}`);

  const locate = (rel, lineNo, snippet) => {
    const entry = contents.find((f) => f.rel === rel);
    assert.ok(entry, `${rel} must be in the tracked doc set`);
    const lines = entry.text.split("\n");
    const line = lines[lineNo - 1] ?? "";
    assert.ok(
      line.includes(snippet),
      `expected ${rel}:${lineNo} to contain "${snippet}", got: ${line}`,
    );
  };

  locate("README.md", 115, "claude plugin install");
  locate("pdlc/README.md", 139, "claude plugin install");
  locate("pdlc/README.md", 145, "claude plugin install");
});
