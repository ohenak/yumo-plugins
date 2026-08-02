// ─── mergeQueueWriteback.test.js ───────────────────────────────────────────
//
// PLAN §4/§12 (pdlc-merge-phase). This file is written by two tasks in one
// wave-3 chain — B1 (the migration-arm slice) then B2 (this slice: TSPEC
// §8.3/§8.4's `updateQueueStatus`/`rewriteStatus` evidence integration) — per
// §4's per-batch file-ownership manifest.
//
// B1's slice (unchanged by B2):
//   - `ensureEvidenceColumn` — AT-M1's *migration arm* (FSPEC §7.3, TSPEC
//     §8.5): the three structural changes to a QUEUE.md table, and no
//     fourth.
//   - `mergeEvidenceCell` — FSPEC §7.2's no-downgrade rule, including
//     PROP-M-13's seeded-pairs arm over the cell helper alone.
//
// B2's slice (this addition): AT-M1's *completion* (a merged PR's row
// gaining its `{shortSha} #{prNumber}` Evidence cell through
// `updateQueueStatus`'s 4th parameter), AT-M2, AT-M2a, the byte-identity
// differential against F1's goldens (PROP-M-12), the §2.5 non-overwrite
// conjuncts, and PROP-M-13/PROP-M-14/PROP-M-15's pure arms over
// `updateQueueStatus`/`rewriteStatus` (PM cross-review of PLAN-v1).
//
// `evidenceCellFor` is **not** here — TSPEC §14 traces it to this file but
// PLAN §7's declared divergence moves its coverage to A6's
// `mergePostMerge.test.js` (rule 2: A6 and A7 cannot share a file in
// adjacent waves). `prNumber`'s resolution (`parsePrRef` → `O1.number` →
// skipped-with-a-note) is `phaseMerge`'s (A7, `orchestrate-dev.js`) — out of
// scope for this file, which only reaches `orchestrate-queue.js`.

import {
  ensureEvidenceColumn,
  mergeEvidenceCell,
  updateQueueStatus,
  rewriteStatus,
  QUEUE_ROW_DISPOSITIONS,
  QUEUE_STATUSES,
  parseQueue,
  selectNextPending,
  precheckDependencies,
} from "../orchestrate-queue.js";
import { seeded, resolveSeed, MERGE_PROP_SEED } from "./helpers/mergeDoubles.js";
import { fakeFs, fakeGit } from "./helpers/seams.js";
import { QUEUE_SHAPES, FEATURE } from "./fixtures/queue-goldens/shapes.js";
import { QUEUE_GOLDENS } from "./fixtures/queue-goldens/index.js";

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

// ─── B2 — QUEUE_ROW_DISPOSITIONS' four members ─────────────────────────────

describe("QUEUE_ROW_DISPOSITIONS — the closed disposition catalogue (TSPEC §8.2, DC-01)", () => {
  test("exactly four frozen members", () => {
    expect(QUEUE_ROW_DISPOSITIONS).toEqual([
      "recorded",
      "recorded (uncommitted)",
      "none",
      "error",
    ]);
    expect(Object.isFrozen(QUEUE_ROW_DISPOSITIONS)).toBe(true);
  });
});

// ─── B2 — PROP-M-12: evidence-null identity (TSPEC §8.4.1, §13.5) ─────────

describe("updateQueueStatus — PROP-M-12: evidence-null identity", () => {
  test.each(Object.keys(QUEUE_SHAPES))(
    "%s: the 4-parameter null call ≡ the 3-parameter call ≡ the HEAD golden, for every status",
    (shapeName) => {
      const shape = QUEUE_SHAPES[shapeName];
      const shapeGoldens = QUEUE_GOLDENS[shapeName];

      const markdowns = [];
      for (const status of QUEUE_STATUSES) {
        const golden = shapeGoldens[status];
        const threeArg = updateQueueStatus(shape, FEATURE, status);
        const fourArgNull = updateQueueStatus(shape, FEATURE, status, null);

        // Three-way equality — TE F-11's non-circular arm is the golden.
        expect(fourArgNull).toEqual(threeArg);
        expect(fourArgNull).toEqual(golden);
        markdowns.push(golden.markdown);
      }

      // A golden captured empty (every status producing the same bytes)
      // cannot pass: matched shapes must actually differ across statuses.
      if (shapeGoldens[QUEUE_STATUSES[0]].matched) {
        expect(new Set(markdowns).size).toBeGreaterThan(1);
      }
    },
  );
});

// ─── B2 — AT-M1's completion: the full evidence-carrying write ─────────────

describe("updateQueueStatus — AT-M1 completion: the evidence-carrying write (TSPEC §8.3, §8.4)", () => {
  test("an awaiting-merge row becomes done, migrates the Evidence column once, and takes the sha-form cell", () => {
    const awaitingMerge = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, "awaiting-merge").markdown;

    const result = updateQueueStatus(awaitingMerge, FEATURE, "done", "abc1234 #42");
    expect(result.matched).toBe(true);
    expect(result.written).toBe(true);

    const lines = result.markdown.split("\n").filter((l) => l.trim().startsWith("|"));
    expect(lines[0]).toBe("| Order | Status | Feature | REQ Path | Depends-On | Evidence |");
    expect(lines[1]).toBe("| --- | --- | --- | --- | --- | --- |");

    const targetRow = lines.find((l) => l.includes(FEATURE));
    expect(targetRow).toContain("| done |");
    expect(targetRow.trim().endsWith("| abc1234 #42 |")).toBe(true);

    // Every other row: byte-identical original cells, one empty sixth cell.
    const otherRow = lines.find((l) => l.includes("other-feature-a"));
    expect(otherRow.trim().endsWith("|  |")).toBe(true);
    expect(otherRow).toContain("| pending |");
  });

  test("a queue already carrying the Evidence column is not migrated twice by the write", () => {
    const migrated = ensureEvidenceColumn(QUEUE_SHAPES.canonical5col).markdown;
    const awaitingMerge = updateQueueStatus(migrated, FEATURE, "awaiting-merge").markdown;

    const result = updateQueueStatus(awaitingMerge, FEATURE, "done", "abc1234 #42");
    expect(result.written).toBe(true);
    expect(ensureEvidenceColumn(result.markdown).migrated).toBe(false);

    const header = result.markdown.split("\n").find((l) => l.toLowerCase().includes("evidence"));
    expect((header.match(/Evidence/gi) || []).length).toBe(1); // never a second Evidence column
  });
});

// ─── B2 — AT-M2a: the already-merged recovery path (AC-5.2) ───────────────

describe("updateQueueStatus / rewriteStatus — AT-M2a: the already-merged recovery path", () => {
  test("O1.mergeCommit.oid present ⇒ the sha-form Evidence cell", () => {
    const awaitingMerge = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, "awaiting-merge").markdown;
    const result = updateQueueStatus(awaitingMerge, FEATURE, "done", "def5678 #42");

    expect(result.written).toBe(true);
    const row = result.markdown.split("\n").find((l) => l.includes(FEATURE));
    expect(row.trim().endsWith("| def5678 #42 |")).toBe(true);
    expect(parseQueue(result.markdown).find((e) => e.feature === FEATURE).status).toBe("done");
  });

  test("O1.mergeCommit.oid absent ⇒ the merged-placeholder Evidence cell", () => {
    const awaitingMerge = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, "awaiting-merge").markdown;
    const result = updateQueueStatus(awaitingMerge, FEATURE, "done", "merged #42");

    expect(result.written).toBe(true);
    const row = result.markdown.split("\n").find((l) => l.includes(FEATURE));
    expect(row.trim().endsWith("| merged #42 |")).toBe(true);
  });

  test("recovering through rewriteStatus reports 'recorded' and emits no §9.4 merge-deferred note at this layer", async () => {
    const QUEUE_PATH = "docs/_queue/QUEUE.md";
    const awaitingMerge = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, "awaiting-merge").markdown;
    const fs = fakeFs({ [QUEUE_PATH]: awaitingMerge });
    const git = fakeGit();

    const result = await rewriteStatus(
      QUEUE_PATH,
      FEATURE,
      "done",
      fs.readFile,
      fs.writeFile,
      git,
      "merged #42",
    );

    // The §9.4 note is `phaseMerge`'s (A7, orchestrate-dev.js) — this layer's
    // result carries no such field at all.
    expect(result).toEqual({ queueRow: "recorded" });
    expect(Object.keys(result)).toEqual(["queueRow"]);
    expect(git.callCount).toBe(2);
  });
});

// ─── B2 — the §2.5 non-overwrite rule, three positive conjuncts ───────────

describe("rewriteStatus / updateQueueStatus — the §2.5 non-overwrite rule (TSPEC §8.4c, FSPEC §7.4 row 18)", () => {
  test.each(["pending", "blocked", "halted"])(
    "a %s row: queue bytes unchanged, zero fakeGit argv, detail names the status found",
    async (foundStatus) => {
      const QUEUE_PATH = "docs/_queue/QUEUE.md";
      const before = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, foundStatus).markdown;
      const fs = fakeFs({ [QUEUE_PATH]: before });
      const git = fakeGit();

      const result = await rewriteStatus(
        QUEUE_PATH,
        FEATURE,
        "done",
        fs.readFile,
        fs.writeFile,
        git,
        "abc1234 #42",
      );

      expect(result.queueRow).toBe("recorded");
      expect(result.detail).toContain(foundStatus);
      expect(git.callCount).toBe(0); // zero argv recorded — no git call at all
      expect(fs.writes).toEqual([]);
      expect(fs.files[QUEUE_PATH]).toBe(before); // file byte-unchanged
    },
  );

  test("updateQueueStatus itself: matched, written: false, and the found status", () => {
    const before = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, "blocked").markdown;
    const result = updateQueueStatus(before, FEATURE, "done", "abc1234 #42");
    expect(result).toEqual({
      markdown: before,
      matched: true,
      written: false,
      foundStatus: "blocked",
    });
  });
});

// ─── B2 — AT-M2: idempotent evidence write produces no second commit ──────

describe("rewriteStatus — AT-M2: idempotent evidence write is silent on re-entry", () => {
  test("re-entering the same done+evidence write reports 'recorded' again, with no warning detail", async () => {
    const QUEUE_PATH = "docs/_queue/QUEUE.md";
    const awaitingMerge = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, "awaiting-merge").markdown;
    const fs = fakeFs({ [QUEUE_PATH]: awaitingMerge });

    const first = await rewriteStatus(
      QUEUE_PATH,
      FEATURE,
      "done",
      fs.readFile,
      fs.writeFile,
      fakeGit(),
      "abc1234 #42",
    );
    expect(first.queueRow).toBe("recorded");
    const afterFirst = fs.files[QUEUE_PATH];

    const gitSecond = fakeGit({
      commit: { ok: false, stdout: "nothing to commit, working tree clean", stderr: "" },
    });
    const second = await rewriteStatus(
      QUEUE_PATH,
      FEATURE,
      "done",
      fs.readFile,
      fs.writeFile,
      gitSecond,
      "abc1234 #42",
    );

    expect(second.queueRow).toBe("recorded");
    expect(second.detail ?? null).toBeNull();
    expect(fs.files[QUEUE_PATH]).toBe(afterFirst); // still byte-unchanged
  });
});

// ─── B2 — PROP-M-13's whole-row idempotence arm ────────────────────────────

describe("PROP-M-13 — write-back idempotence, the whole-row arm", () => {
  test.each(["abc1234 #42", "merged #42", "abc1234 #7"])(
    "applying the done write twice with evidence %j is a fixed point",
    (evidence) => {
      const awaitingMerge = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, "awaiting-merge").markdown;
      const first = updateQueueStatus(awaitingMerge, FEATURE, "done", evidence);
      expect(first.written).toBe(true);

      const second = updateQueueStatus(first.markdown, FEATURE, "done", evidence);
      expect(second.markdown).toBe(first.markdown); // fixed point, byte for byte
      expect(ensureEvidenceColumn(first.markdown).migrated).toBe(false); // never migrated twice

      const row = first.markdown.split("\n").find((l) => l.includes(FEATURE));
      expect(row).toContain("| done |"); // undecorated token, both times
    },
  );
});

// ─── B2 — PROP-M-14: structural containment ────────────────────────────────

/**
 * A local seeded-queue generator for PROP-M-14's domain alone (1–8 data
 * rows, mixed statuses and Depends-On cells, interleaved prose, a trailing
 * history table). Not exported to `helpers/mergeDoubles.js` — that file is
 * F1's single-writer file (PLAN §4), and this generator is specific to this
 * one property, not a shared cross-file fixture. It draws only from the RNG
 * `mergeDoubles.js` exports (`seeded`), per PROPERTIES §1.2 rule 1.
 */
function buildSeededQueue(rng, rowCount) {
  const featurePool = [
    "alpha-svc", "bravo-svc", "charlie-svc", "delta-svc",
    "echo-svc", "foxtrot-svc", "golf-svc", "hotel-svc",
  ];
  const names = rng.shuffle(featurePool).slice(0, rowCount);

  const rows = names.map((name, i) => {
    const status = rng.pick(QUEUE_STATUSES);
    const others = names.filter((n) => n !== name);
    const deps = others.length > 0 && rng.int(0, 1) === 1 ? rng.pick(others) : "-";
    return `| ${i + 1} | ${status} | ${name} | docs/${name}/REQ-${name}.md | ${deps} |`;
  });

  const markdown = [
    "# PDLC Queue",
    "",
    "Some prose above the table, interleaved deliberately (PROP-M-14's domain).",
    "",
    "| Order | Status | Feature | REQ Path | Depends-On |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
    "",
    "## History",
    "",
    "A trailing history table, same column count so uniformity is meaningful.",
    "",
    "| When | What | Who | Why | Ref |",
    "| --- | --- | --- | --- | --- |",
    "| 2026-01-01 | migrated | ci | routine | #1 |",
  ].join("\n");

  return { markdown, names };
}

describe("PROP-M-14 — structural containment: only the target row's Status/Evidence cells change", () => {
  const seed = resolveSeed(MERGE_PROP_SEED);
  const rng = seeded(seed);

  for (let rowCount = 1; rowCount <= 8; rowCount++) {
    test(`a ${rowCount}-row seeded queue: every non-target row and every non-table line is preserved`, () => {
      const { markdown: raw, names } = buildSeededQueue(rng, rowCount);
      const target = rng.pick(names);
      // Force the target row into an overwritable status so the write proceeds;
      // every OTHER row keeps its randomly drawn status, including non-overwritable ones.
      const before = updateQueueStatus(raw, target, "awaiting-merge").markdown;
      const beforeEntries = parseQueue(before);

      const result = updateQueueStatus(before, target, "done", "abc1234 #9");
      expect(result.written).toBe(true);

      const beforeLines = before.split("\n");
      const afterLines = result.markdown.split("\n");
      expect(afterLines).toHaveLength(beforeLines.length); // no line added or dropped

      // Every non-table line (prose, headings, blanks) is byte-identical, position for position.
      beforeLines.forEach((line, i) => {
        if (!line.trim().startsWith("|")) {
          expect(afterLines[i]).toBe(line);
        }
      });

      // Every non-separator row (header + data rows, main table AND the
      // trailing history table) has the same cell count. Separator-shaped
      // rows are excluded deliberately: `ensureEvidenceColumn` migrates only
      // the primary table's own separator (the line right after its
      // header) and treats every later separator-shaped line as a table
      // boundary to leave untouched (its own "stray separator-shaped row"
      // comment) — so a trailing table's separator is, by that documented
      // design, not widened even though its header and data rows are.
      const isSeparatorShaped = (cells) =>
        cells.every((c) => /^:?-{2,}:?$/.test(c.trim()) || c.trim() === "");
      const cellCounts = afterLines
        .filter((l) => l.trim().startsWith("|"))
        .map((l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|"))
        .filter((cells) => !isSeparatorShaped(cells))
        .map((cells) => cells.length);
      expect(new Set(cellCounts).size).toBe(1);

      // Every non-target data row: first five cells preserved, sixth is empty.
      const afterEntries = parseQueue(result.markdown);
      for (const beforeEntry of beforeEntries) {
        if (beforeEntry.feature === target) continue;
        const afterEntry = afterEntries.find((e) => e.feature === beforeEntry.feature);
        expect(afterEntry.status).toBe(beforeEntry.status);
        expect(afterEntry.reqPath).toBe(beforeEntry.reqPath);
        expect(afterEntry.dependsOn).toEqual(beforeEntry.dependsOn);
      }

      // Positive conjunct: the target row actually changed.
      const targetAfter = afterEntries.find((e) => e.feature === target);
      expect(targetAfter.status).toBe("done");
    });
  }
});

// ─── B2 — PROP-M-15's pure arm: round-trip through the shipped parser/gate ─

describe("PROP-M-15 — round-trip, the pure arm (TSPEC §9.4, AC-6.3)", () => {
  test("graph 1 — sole-dependency dependent: written done unblocks it", () => {
    const base =
      "| Order | Status | Feature | REQ Path | Depends-On |\n" +
      "| --- | --- | --- | --- | --- |\n" +
      "| 1 | awaiting-merge | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |\n" +
      "| 2 | pending | dependent-feature | docs/dependent-feature/REQ-dependent-feature.md | upstream-feature |";

    const result = updateQueueStatus(base, "upstream-feature", "done", "abc1234 #9");
    expect(result.written).toBe(true);

    const entries = parseQueue(result.markdown);
    // The sixth (Evidence) column is ignored by colIndex — the same five
    // fields resolve as before migration.
    const upstream = entries.find((e) => e.feature === "upstream-feature");
    expect(upstream.status).toBe("done");
    expect(upstream.reqPath).toBe("docs/upstream-feature/REQ-upstream-feature.md");

    const dependent = entries.find((e) => e.feature === "dependent-feature");
    expect(precheckDependencies(dependent.dependsOn, entries)).toEqual({ blocked: false });

    const pick = selectNextPending(entries);
    expect(pick.kind).toBe("candidates");
    expect(pick.candidates.map((c) => c.feature)).toContain("dependent-feature");
  });

  test("graph 2 — two-dependency dependent: still blocked while the other dependency is pending", () => {
    const base =
      "| Order | Status | Feature | REQ Path | Depends-On |\n" +
      "| --- | --- | --- | --- | --- |\n" +
      "| 1 | awaiting-merge | upstream-a | docs/upstream-a/REQ-upstream-a.md | - |\n" +
      "| 2 | pending | upstream-b | docs/upstream-b/REQ-upstream-b.md | - |\n" +
      "| 3 | pending | dependent-feature | docs/dependent-feature/REQ-dependent-feature.md | upstream-a, upstream-b |";

    const result = updateQueueStatus(base, "upstream-a", "done", "abc1234 #9");
    expect(result.written).toBe(true);

    const entries = parseQueue(result.markdown);
    expect(entries.find((e) => e.feature === "upstream-a").status).toBe("done");

    const dependent = entries.find((e) => e.feature === "dependent-feature");
    const check = precheckDependencies(dependent.dependsOn, entries);
    expect(check.blocked).toBe(true);
    expect(check.reason).toContain("upstream-b"); // the reason names the pending dependency

    // Structurally still a candidate (status is still "pending"); the
    // dependency gate is the half of AC-6.3 that actually holds it shut.
    const pick = selectNextPending(entries);
    expect(pick.candidates.map((c) => c.feature)).toContain("dependent-feature");
  });

  test("graph 3 — no dependent: the written row selects nothing further", () => {
    const base =
      "| Order | Status | Feature | REQ Path | Depends-On |\n" +
      "| --- | --- | --- | --- | --- |\n" +
      "| 1 | awaiting-merge | solo-feature | docs/solo-feature/REQ-solo-feature.md | - |";

    const result = updateQueueStatus(base, "solo-feature", "done", "abc1234 #9");
    expect(result.written).toBe(true);

    const entries = parseQueue(result.markdown);
    expect(entries.find((e) => e.feature === "solo-feature").status).toBe("done");

    const pick = selectNextPending(entries);
    expect(pick.kind).toBe("empty"); // nothing pending remains
  });
});
