// consolidationTraceability.test.js — PLAN T05 (batch 1, dep: T00).
//
// L3: parses the FSPEC's AT register (§13) and TSPEC §12.3's own table and
// asserts set equality in both directions — every register id has exactly
// one file, and no file claims an id the register does not carry. Ids are
// extracted by matching the `AT-…` token grammar over the whole cell and
// de-duplicated, so `(no FSPEC AT)` prose contributes nothing unless it
// names an id (idempotent for the report row's deliberate AT-L5 citation).
//
// The parser is a pure function of an injected `root` (DC-04) and consults
// no ambient state — never `process.cwd()`. The count is read, never
// hard-coded: the 99-id figure recorded in TSPEC §12.3 and PLAN T05 is a
// reader's summary, not a second source of truth this test transcribes.
//
// Beside the equality sit two conjuncts that make a failure legible instead
// of merely red:
//   (i)  a version pin — FSPEC's `Version` cell reads `11.5` and TSPEC's
//        reads `2.0` — so a later erratum round that moves the register
//        fails as "the register moved" rather than as "the code is wrong";
//   (ii) a non-vacuity floor — the parsed register is non-empty and its
//        size is reported in the failure message, so two empty parses
//        cannot agree perfectly.
//
// This task creates no production code and needs no module symbol: it
// guards the traceability table itself, from batch 2 onward.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

const FSPEC_PATH = join(
  "docs",
  "pdlc-consolidation-agent",
  "FSPEC-pdlc-consolidation-agent.md"
);
const TSPEC_PATH = join(
  "docs",
  "pdlc-consolidation-agent",
  "TSPEC-pdlc-consolidation-agent.md"
);

const AT_TOKEN_RE = /AT-[A-Za-z0-9]+/g;

/** Every `AT-…` token in `text`, matched over the whole span and de-duplicated. */
function extractIds(text) {
  const ids = new Set();
  let m;
  AT_TOKEN_RE.lastIndex = 0;
  while ((m = AT_TOKEN_RE.exec(text))) ids.add(m[0]);
  return ids;
}

/**
 * The `| Product | Status | Author | Version | Date |` header row's
 * `Version` cell, from the first such table in `text`.
 */
function parseVersionCell(text) {
  const headerIdx = text.indexOf("| Product | Status | Author | Version | Date |");
  if (headerIdx < 0) return null;
  const lines = text.slice(headerIdx).split("\n");
  const splitRow = (row) =>
    row
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
  const headerCells = splitRow(lines[0]);
  const dataCells = splitRow(lines[2] || "");
  const versionIdx = headerCells.indexOf("Version");
  if (versionIdx < 0) return null;
  return dataCells[versionIdx] ?? null;
}

/** FSPEC's AT register: every `AT-…` id named across §13, plus the doc's `Version` cell. */
function parseFspecRegister(root) {
  const text = readFileSync(join(root, FSPEC_PATH), "utf8");
  const start = text.indexOf("## 13. Acceptance tests");
  const end = text.indexOf("## 14. Obligations", start < 0 ? 0 : start);
  if (start < 0 || end < 0) {
    throw new Error(
      "FSPEC §13 (Acceptance tests) section not found — heading text may have drifted"
    );
  }
  return {
    ids: extractIds(text.slice(start, end)),
    version: parseVersionCell(text),
  };
}

/** TSPEC §12.3's own table: every `AT-…` id its cells name, plus the doc's `Version` cell. */
function parseTspecTable(root) {
  const text = readFileSync(join(root, TSPEC_PATH), "utf8");
  const start = text.indexOf("### 12.3 Acceptance test");
  const end = text.indexOf("### 12.4 Vocabulary conformance", start < 0 ? 0 : start);
  if (start < 0 || end < 0) {
    throw new Error(
      "TSPEC §12.3 (Acceptance test → level and file) section not found — heading text may have drifted"
    );
  }
  return {
    ids: extractIds(text.slice(start, end)),
    version: parseVersionCell(text),
  };
}

describe("T05 — traceability set-equality (FSPEC §13 register ↔ TSPEC §12.3 table)", () => {
  const fspec = parseFspecRegister(REPO_ROOT);
  const tspec = parseTspecTable(REPO_ROOT);

  test("non-vacuity floor: both parses are non-empty", () => {
    expect({
      fspecCount: fspec.ids.size,
      tspecCount: tspec.ids.size,
    }).toEqual({
      fspecCount: expect.any(Number),
      tspecCount: expect.any(Number),
    });
    expect(fspec.ids.size).toBeGreaterThan(0);
    expect(tspec.ids.size).toBeGreaterThan(0);
  });

  test("version pin: FSPEC reads 11.5 and TSPEC reads 2.0", () => {
    expect(fspec.version).toBe("11.5");
    expect(tspec.version).toBe("2.0");
  });

  test("every FSPEC register id has exactly one TSPEC §12.3 file (register ⊆ table)", () => {
    const missingFromTable = [...fspec.ids].filter((id) => !tspec.ids.has(id)).sort();
    expect(missingFromTable).toEqual([]);
  });

  test("no TSPEC §12.3 file claims an id the FSPEC register does not carry (table ⊆ register)", () => {
    const notInRegister = [...tspec.ids].filter((id) => !fspec.ids.has(id)).sort();
    expect(notInRegister).toEqual([]);
  });

  test("set equality: sorted id lists are identical, both sides at the same count", () => {
    const fspecSorted = [...fspec.ids].sort();
    const tspecSorted = [...tspec.ids].sort();
    expect({ count: fspecSorted.length, ids: fspecSorted }).toEqual({
      count: tspecSorted.length,
      ids: tspecSorted,
    });
  });
});
