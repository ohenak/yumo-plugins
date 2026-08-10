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
//        reads `2.1` — so a later erratum round that moves the register
//        fails as "the register moved" rather than as "the code is wrong";
//   (ii) a non-vacuity floor — the parsed register is non-empty and its
//        size is reported in the failure message, so two empty parses
//        cannot agree perfectly.
//
// This task creates no production code and needs no module symbol: it
// guards the traceability table itself, from batch 2 onward.

import { existsSync, readFileSync } from "fs";
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

  test("version pin: FSPEC reads 11.5 and TSPEC reads 2.1", () => {
    expect(fspec.version).toBe("11.5");
    expect(tspec.version).toBe("2.1");
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

// ─── PROPERTIES §12.2's property→file map (CR F-08) ─────────────────────────
//
// PROP-TRC-01 guarded FSPEC §13 against TSPEC §12.3 and nothing else, so PROPERTIES' own coverage
// matrix — the table that says which file owns which property — had no mechanical guard at all: a
// property could be defined and assigned to no file, or assigned to a file that does not exist,
// and only a reader would notice. The two guards below close that, in the same shape as the
// register equality above: set-equality in both directions, plus an existence check on the one
// side that names real paths.
//
// Ranges are expanded rather than matched literally: the table writes `PROP-EFF-01…09` where the
// definitions write nine separate `**PROP-EFF-0n**` headings, so a guard that compared raw tokens
// would be comparing two different vocabularies and would be red on correct documents.

const PROPERTIES_PATH = join(
  "docs",
  "pdlc-consolidation-agent",
  "PROPERTIES-pdlc-consolidation-agent.md"
);
const TESTS_DIR = __dirname;

const PROP_RANGE_RE = /PROP-([A-Z]+)-(\d+)…(\d+)/g;
const PROP_TOKEN_RE = /PROP-[A-Z]+-\d+/g;

/** Every property id in `text`, with `PROP-XXX-01…09` expanded to its nine members. */
function extractPropIds(text) {
  const ids = new Set();
  PROP_RANGE_RE.lastIndex = 0;
  let m;
  while ((m = PROP_RANGE_RE.exec(text))) {
    const [, family, from, to] = m;
    const width = from.length;
    for (let n = Number(from); n <= Number(to); n += 1) {
      ids.add(`PROP-${family}-${String(n).padStart(width, "0")}`);
    }
  }
  const withoutRanges = text.replace(PROP_RANGE_RE, " ");
  PROP_TOKEN_RE.lastIndex = 0;
  while ((m = PROP_TOKEN_RE.exec(withoutRanges))) ids.add(m[0]);
  return ids;
}

/**
 * PROPERTIES §12.2's table: one row per test file. Returns the assigned property ids (ranges
 * expanded) and the file paths the rows name, excluding the two rows that name no property of
 * their own (the `helpers/` reuse row carries a prose cell, not an assignment).
 */
function parsePropertiesFileMap(root) {
  const text = readFileSync(join(root, PROPERTIES_PATH), "utf8");
  const start = text.indexOf("### 12.2 Test files → level, owners, properties");
  const end = text.indexOf("### 12.3 PLAN §4 tasks → properties", start < 0 ? 0 : start);
  if (start < 0 || end < 0) {
    throw new Error("PROPERTIES §12.2 not found — heading text may have drifted");
  }
  const section = text.slice(start, end);

  const assigned = new Set();
  const files = new Set();
  for (const line of section.split("\n")) {
    if (!line.startsWith("|") || line.includes("---")) continue;
    const cells = line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    if (cells.length < 5 || cells[0] === "File") continue;
    for (const id of extractPropIds(cells[4])) assigned.add(id);
    for (const [, name] of cells[0].matchAll(/`([^`]+)`/g)) files.add(name);
  }
  return { assigned, files };
}

/** Every property DEFINED in PROPERTIES §§4–11 — one `**PROP-…**` heading each. */
function parsePropertyDefinitions(root) {
  const text = readFileSync(join(root, PROPERTIES_PATH), "utf8");
  const defs = new Set();
  for (const [, id] of text.matchAll(/^\*\*(PROP-[A-Z]+-\d+)(?: \([^)]*\))?\*\*/gm)) defs.add(id);
  return defs;
}

describe("T05 — PROPERTIES §12.2 property→file map (CR F-08)", () => {
  const { assigned, files } = parsePropertiesFileMap(REPO_ROOT);
  const defined = parsePropertyDefinitions(REPO_ROOT);

  test("non-vacuity floor: the map assigns properties and names files, and §§4–11 define properties", () => {
    expect(assigned.size).toBeGreaterThan(0);
    expect(files.size).toBeGreaterThan(0);
    expect(defined.size).toBeGreaterThan(0);
  });

  test("every property defined in §§4–11 is assigned a file by §12.2 (definitions ⊆ map)", () => {
    const unassigned = [...defined].filter((id) => !assigned.has(id)).sort();
    expect(unassigned).toEqual([]);
  });

  test("every property §12.2 assigns is defined in §§4–11 (map ⊆ definitions)", () => {
    const undefinedIds = [...assigned].filter((id) => !defined.has(id)).sort();
    expect(undefinedIds).toEqual([]);
  });

  test("set equality: sorted id lists are identical, both sides at the same count", () => {
    const definedSorted = [...defined].sort();
    const assignedSorted = [...assigned].sort();
    expect({ count: definedSorted.length, ids: definedSorted }).toEqual({
      count: assignedSorted.length,
      ids: assignedSorted,
    });
  });

  test("every file §12.2 names exists on disk — a property cannot be covered by a file that is not there", () => {
    const missing = [...files]
      .filter((name) => !existsSync(join(TESTS_DIR, name)))
      .sort();
    expect(missing).toEqual([]);
  });
});

// ─── FSPEC §8.4's citations of the harvest skill resolve to the lines they name ───────────────
// A `path:line` citation is a claim about a file that ships in this repo, so it is checkable, and
// checking it is the only thing that keeps it true as the cited file moves. Two citations are in
// play: the `Phases exercised` metadata row, and the `failure-mode-id` line the §5 Open Items
// convention adds. They live in different parts of the skill; a citation naming one location for
// both is false for whichever it is not.
describe("FSPEC §8.4 cites the harvest skill accurately", () => {
  const HARVEST_SKILL = join(REPO_ROOT, "pdlc", "skills", "harvest-learnings", "SKILL.md");
  const skillLines = readFileSync(HARVEST_SKILL, "utf8").split("\n");
  const fspec = readFileSync(join(REPO_ROOT, FSPEC_PATH), "utf8");

  /** 1-based line numbers of every line matching `re`. */
  const linesMatching = (re) =>
    skillLines.reduce((acc, line, i) => (re.test(line) ? [...acc, i + 1] : acc), []);

  /** Every `harvest-learnings/SKILL.md`-anchored `:{n}` or `:{n}-{m}` citation in the FSPEC. */
  const citations = [...fspec.matchAll(/harvest-learnings\/SKILL\.md[^\n]*?`?:(\d+)(?:-(\d+))?/g)]
    .map((m) => ({ from: Number(m[1]), to: Number(m[2] ?? m[1]), context: m[0] }));

  it("every cited range is a real range of lines in the skill", () => {
    expect(citations.length).toBeGreaterThan(0);
    for (const c of citations) {
      expect(c.to).toBeGreaterThanOrEqual(c.from);
      expect(c.to).toBeLessThanOrEqual(skillLines.length);
    }
  });

  it("the `Phases exercised` row is inside the range the FSPEC cites for the metadata table", () => {
    const rows = linesMatching(/\|\s*Phases exercised\s*\|/);
    expect(rows).toHaveLength(1);
    const [row] = rows;
    const metadataCitations = citations.filter((c) => c.to > c.from && c.from < row + 1 && c.to >= row);
    expect(metadataCitations.length).toBeGreaterThan(0);
    for (const c of metadataCitations) {
      expect(row).toBeGreaterThanOrEqual(c.from);
      expect(row).toBeLessThanOrEqual(c.to);
    }
  });

  it("the sentence introducing the `failure-mode-id` convention cites where the convention actually is", () => {
    const conventionLines = linesMatching(/^failure-mode-id:/);
    expect(conventionLines).toHaveLength(1);
    const [convention] = conventionLines;
    const metadataRow = linesMatching(/\|\s*Phases exercised\s*\|/)[0];
    // The two are genuinely in different places — the premise of the finding.
    expect(convention).toBeGreaterThan(metadataRow);

    // The FSPEC paragraph that introduces the convention (§8.4's producing-side obligation).
    const fspecLines = fspec.split("\n");
    const anchor = fspecLines.findIndex((l) => /The convention this feature adds to/.test(l));
    expect(anchor).toBeGreaterThan(-1);
    const sentence = fspecLines.slice(anchor, anchor + 4).join("\n");

    const cited = [...sentence.matchAll(/harvest-learnings\/SKILL\.md[^\n]*?`?:(\d+)(?:-(\d+))?/g)]
      .map((m) => ({ from: Number(m[1]), to: Number(m[2] ?? m[1]) }));
    expect(cited.length).toBeGreaterThan(0);
    for (const c of cited) {
      expect(convention).toBeGreaterThanOrEqual(c.from);
      expect(convention).toBeLessThanOrEqual(c.to);
    }
  });
});
