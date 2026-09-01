// Task-narrative drift oracles for the pdlc-stats surface —
// CODE_REVIEW-pdlc-stats-v2 §1 #1/#2 ("adjacent-surface falsification").
//
// A comment that narrates a pre-implementation state ("X is not yet a case in
// the switch", "that lands in T-17", "until then every test in this file
// fails") is true for exactly as long as the task is open. Once the task
// lands, the comment becomes a false claim about the code it sits on, and
// nothing mechanical notices. Both v1 and v2 of the DoD review found members
// of that family by hand; these oracles make the next member fail a test run
// instead.
//
// Two invariants, over every pdlc-stats-owned source and test file:
//
//   1. No comment narrates work as pending. The banned phrases are the ones
//      the review's own sweep names, matched case-insensitively.
//   2. No comment claims oracles are "committed `test.skip`" unless the file
//      actually contains a skipped test. Skips inside comments do not count;
//      the check strips comments before looking for a real one.
//
// This file is excluded from its own scan — it is the one place where the
// banned phrases legitimately appear, as the patterns being searched for.

import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const engineRoot = path.dirname(testsDir);
const repoRoot = path.dirname(path.dirname(engineRoot));

const SELF = path.basename(fileURLToPath(import.meta.url));

// ── the scanned set: every pdlc-stats-owned source and test file ───────────

function statsFilesIn(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name !== SELF && predicate(name))
    .map((name) => path.join(dir, name));
}

function scannedFiles() {
  const files = [
    ...statsFilesIn(testsDir, (n) => /^stats-.*\.(test\.)?m?js$/.test(n)),
    ...statsFilesIn(path.join(repoRoot, "pdlc/workflows/__tests__"), (n) =>
      /^stats[A-Z].*\.test\.js$/.test(n),
    ),
    ...statsFilesIn(path.join(repoRoot, "pdlc/workflows/lib"), (n) => n === "stats.mjs"),
  ];
  return files.sort();
}

// ── comment/string handling ────────────────────────────────────────────────

// Replace every line and block comment with equivalent whitespace, preserving
// newlines so line numbers survive. String and template literals are skipped
// over so a `//` inside one is not mistaken for a comment opener.
function stripComments(source) {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (c === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") {
        out += " ";
        i += 1;
      }
      continue;
    }
    if (c === "/" && next === "*") {
      out += "  ";
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
        out += source[i] === "\n" ? "\n" : " ";
        i += 1;
      }
      out += "  ";
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      out += c;
      i += 1;
      while (i < source.length) {
        if (source[i] === "\\") {
          out += source.slice(i, i + 2);
          i += 2;
          continue;
        }
        out += source[i];
        if (source[i] === quote) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

// ── invariant 1: no pending-work narrative ─────────────────────────────────

const PENDING_NARRATIVE = [
  /\bRED at (?:T-?\d|landing)/i,
  /\b(?:not yet|isn't|is not) (?:a case|landed|defined|implemented|wired)/i,
  /\bhave not landed\b/i,
  /\bcarries no\b[^\n]*\byet\b/i,
  /\bdoes not exist yet\b/i,
  /\bUntil then\b/i,
  /\blands? (?:in|across) (?:T-?\d|batch)/i,
  /\bland in later tasks\b/i,
  /\bnot defined here\b/i,
];

describe("pdlc-stats comments do not narrate delivered work as pending (CODE_REVIEW v2 §1)", () => {
  for (const file of scannedFiles()) {
    const rel = path.relative(repoRoot, file);
    test(`${rel} carries no pre-implementation narrative`, () => {
      const lines = fs.readFileSync(file, "utf8").split("\n");
      const offenders = [];
      lines.forEach((line, index) => {
        for (const pattern of PENDING_NARRATIVE) {
          if (pattern.test(line)) {
            offenders.push(`${rel}:${index + 1}: ${line.trim()}`);
            return;
          }
        }
      });
      assert.deepEqual(
        offenders,
        [],
        `pending-work narrative found in delivered code:\n${offenders.join("\n")}`,
      );
    });
  }
});

// ── invariant 2: skip narratives require real skips ────────────────────────

const SKIP_NARRATIVE =
  /committed[^\n]*\.skip|wrapped in\s*`?\.skip|un-?skips? (?:each|this exact) block/i;
const REAL_SKIP = /\b(?:test|it|describe)\s*\.\s*skip\s*\(|\{\s*skip\s*:\s*true/;

describe("pdlc-stats skip narratives match the file's actual skip state (CODE_REVIEW v2 §1 #2)", () => {
  for (const file of scannedFiles()) {
    const rel = path.relative(repoRoot, file);
    test(`${rel} only narrates committed skips if it has one`, () => {
      const source = fs.readFileSync(file, "utf8");
      if (!SKIP_NARRATIVE.test(source)) return;
      assert.ok(
        REAL_SKIP.test(stripComments(source)),
        `${rel} narrates committed \`.skip\` blocks but contains no skipped test — ` +
          "the blocks were un-skipped when their task landed; delete the narrative.",
      );
    });
  }
});

// ── the scan itself must have a subject ────────────────────────────────────

describe("the narrative-drift scan covers the pdlc-stats surface", () => {
  test("both engine stats test files and lib/stats.mjs are in the scanned set", () => {
    const rels = scannedFiles().map((f) => path.relative(repoRoot, f));
    assert.ok(rels.includes("pdlc/engine/__tests__/stats-cli.test.js"), rels.join(", "));
    assert.ok(rels.includes("pdlc/engine/__tests__/stats-cli-structure.test.js"), rels.join(", "));
    assert.ok(rels.includes("pdlc/workflows/lib/stats.mjs"), rels.join(", "));
    assert.ok(rels.length >= 12, `expected the full stats surface, got ${rels.length}`);
  });
});
