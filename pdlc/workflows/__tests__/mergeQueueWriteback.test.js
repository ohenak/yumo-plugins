// ─── mergeQueueWriteback.test.js ───────────────────────────────────────────
//
// PLAN §4/§12 (pdlc-merge-phase). This file is written by two tasks in one
// wave-3 chain — B1 (this slice) then B2 (TSPEC §8.3/§8.4's `updateQueueStatus`
// integration) — per §4's per-batch file-ownership manifest.
//
// B1's slice, and only B1's slice:
//   - `ensureEvidenceColumn` — AT-M1's *migration arm* (FSPEC §7.3, TSPEC
//     §8.5): the three structural changes to a QUEUE.md table, and no
//     fourth. The full AT-M1 scenario (a merged PR's row gaining its
//     `{shortSha} #{prNumber}` Evidence cell) needs `updateQueueStatus`'s
//     evidence parameter and lands in B2.
//   - `mergeEvidenceCell` — FSPEC §7.2's no-downgrade rule, including
//     PROP-M-13's seeded-pairs arm over the cell helper alone.
//
// AT-M2, AT-M2a, the byte-identity differential against F1's goldens, the
// §2.5 non-overwrite conjuncts, and PROP-M-13/PROP-M-14's whole-row arms are
// **B2's**, not this file's B1 describe blocks (PM cross-review of PLAN-v1).

import { ensureEvidenceColumn, mergeEvidenceCell } from "../orchestrate-queue.js";
import { seeded, resolveSeed, MERGE_PROP_SEED } from "./helpers/mergeDoubles.js";
import { QUEUE_SHAPES, FEATURE } from "./fixtures/queue-goldens/shapes.js";

describe("ensureEvidenceColumn — AT-M1's migration arm (FSPEC §7.3, TSPEC §8.5)", () => {
  test("a five-column canonical queue: header gains Evidence, separator gains one cell, every data row gains one empty cell", () => {
    const before = QUEUE_SHAPES.canonical5col;
    const beforeDataLines = before
      .split("\n")
      .filter((l) => l.trim().startsWith("|"))
      .slice(2); // header + separator, then the three data rows

    const { markdown, migrated } = ensureEvidenceColumn(before);
    expect(migrated).toBe(true);

    const lines = markdown.split("\n").filter((l) => l.trim().startsWith("|"));
    expect(lines).toHaveLength(5); // header, separator, 3 data rows — no row added or dropped

    const [header, separator, ...dataLines] = lines;
    expect(header).toBe(
      "| Order | Status | Feature | REQ Path | Depends-On | Evidence |",
    );
    expect(separator).toBe("| --- | --- | --- | --- | --- | --- |");

    expect(dataLines).toHaveLength(3);
    dataLines.forEach((line, i) => {
      // Every original cell is byte-identical; exactly one empty cell is appended.
      const beforeLine = beforeDataLines[i];
      expect(line.startsWith(beforeLine.replace(/\s*\|\s*$/, ""))).toBe(true);
      expect(line.endsWith("|  |")).toBe(true);
    });
  });

  test("cell counts stay uniform across header, separator and every data row after migration", () => {
    const { markdown } = ensureEvidenceColumn(QUEUE_SHAPES.canonical5col);
    const rowCellCounts = markdown
      .split("\n")
      .filter((l) => l.trim().startsWith("|"))
      .map((l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").length);
    expect(new Set(rowCellCounts).size).toBe(1); // every row has the same cell count
    expect(rowCellCounts[0]).toBe(6);
  });

  test("migrated: false, and the file byte-unchanged, on a second pass over its own output", () => {
    const first = ensureEvidenceColumn(QUEUE_SHAPES.canonical5col);
    expect(first.migrated).toBe(true);

    const second = ensureEvidenceColumn(first.markdown);
    expect(second.migrated).toBe(false);
    expect(second.markdown).toBe(first.markdown); // never migrated twice
  });

  test("a queue already carrying an Evidence column is returned unchanged", () => {
    const before = QUEUE_SHAPES.alreadyMigrated;
    const { markdown, migrated } = ensureEvidenceColumn(before);
    expect(migrated).toBe(false);
    expect(markdown).toBe(before);
  });

  test("rows that are not part of the table (prose) are untouched", () => {
    const before = `# Queue\n\nSome prose above the table.\n\n${QUEUE_SHAPES.canonical5col}\n\nSome prose below the table.`;
    const { markdown } = ensureEvidenceColumn(before);
    expect(markdown).toContain("Some prose above the table.");
    expect(markdown).toContain("Some prose below the table.");
    expect(markdown.split("\n")[2]).toBe("Some prose above the table.");
  });

  test("markdown with no recognisable table (noTable shape) is returned unchanged", () => {
    const before = QUEUE_SHAPES.noTable;
    const { markdown, migrated } = ensureEvidenceColumn(before);
    expect(migrated).toBe(false);
    expect(markdown).toBe(before);
  });

  test("a single-data-row queue migrates the same way (oneDataRow shape)", () => {
    const { markdown, migrated } = ensureEvidenceColumn(QUEUE_SHAPES.oneDataRow);
    expect(migrated).toBe(true);
    const lines = markdown.split("\n").filter((l) => l.trim().startsWith("|"));
    expect(lines).toHaveLength(3); // header, separator, one data row
    expect(lines[2].endsWith("|  |")).toBe(true);
    expect(lines[2]).toContain(FEATURE);
  });

  test("non-string input is returned unchanged and unmigrated", () => {
    expect(ensureEvidenceColumn(null)).toEqual({ markdown: null, migrated: false });
    expect(ensureEvidenceColumn(undefined)).toEqual({ markdown: undefined, migrated: false });
  });
});

describe("mergeEvidenceCell — the no-downgrade rule (FSPEC §7.2)", () => {
  test("an empty previous cell always takes the new value", () => {
    expect(mergeEvidenceCell("", "merged #42")).toBe("merged #42");
    expect(mergeEvidenceCell("", "abc1234 #42")).toBe("abc1234 #42");
  });

  test("a real sha-form cell is never downgraded by a merged-placeholder re-entry", () => {
    expect(mergeEvidenceCell("abc1234 #42", "merged #42")).toBe("abc1234 #42");
  });

  test("a real sha-form cell IS overwritten by a later, different sha-form value", () => {
    // The rule only blocks downgrade to the `merged #{n}` placeholder shape,
    // never a genuine update to another concrete value.
    expect(mergeEvidenceCell("abc1234 #42", "def5678 #42")).toBe("def5678 #42");
  });

  test("a merged-placeholder cell is upgraded once a real sha resolves", () => {
    expect(mergeEvidenceCell("merged #42", "abc1234 #42")).toBe("abc1234 #42");
  });

  test("a merged-placeholder cell re-entered with the same placeholder form stays put", () => {
    expect(mergeEvidenceCell("merged #42", "merged #42")).toBe("merged #42");
  });

  test("an arbitrary non-empty previous value is not downgraded by a merged-placeholder re-entry", () => {
    expect(mergeEvidenceCell("some other note", "merged #7")).toBe("some other note");
  });

  test("PROP-M-13's cell-helper arm: 200 seeded pairs reproduce the stated equality", () => {
    const seed = resolveSeed(MERGE_PROP_SEED);
    const rng = seeded(seed);
    const shaForms = ["abc1234 #42", "def5678 #7", "0000000 #1"];
    const mergedForms = ["merged #42", "merged #7", "merged #1"];
    const arbitrary = ["", "some other note", "-", "pending review"];
    const domain = [...shaForms, ...mergedForms, ...arbitrary, ""];

    for (let i = 0; i < 200; i++) {
      const prev = rng.pick(domain);
      const next = rng.pick(domain);
      const result = mergeEvidenceCell(prev, next);
      const expectDowngradeBlocked = prev !== "" && /^merged #/.test(next);
      const expected = expectDowngradeBlocked ? prev : next;
      try {
        expect(result).toBe(expected);
      } catch (err) {
        throw new Error(
          `seed=${seed} i=${i} prev=${JSON.stringify(prev)} next=${JSON.stringify(next)} — ${
            err && err.message ? err.message : String(err)
          }`,
        );
      }
    }
  });
});
