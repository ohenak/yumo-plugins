/**
 * provenanceQueueRow.test.js — TSPEC §7.2 kind 3: the QUEUE.md row a run
 * rewrites carries the provenance mark on BOTH its own artifacts — the row's
 * own `Engine` cell and the commit message that lands it (PLAN T21 / T36 /
 * T39, PROPERTIES PROP-PROV-5, PROP-PROV-6).
 *
 * RED (authored by T21, batch 2 — `orchestrate-queue.js` has no `Engine`
 * column at HEAD and `rewriteStatus` takes seven parameters, so none of the
 * assertions below can pass yet). Two green owners split this file's
 * skipped blocks, per PLAN §3's fan-out note ("T16 and T21-T24 each fan out
 * to more than one green task because the red test states a conjunction no
 * single ownership-disjoint edit can satisfy"):
 *
 *   - T36 (batch 4) un-skips "T36: ..." — `ensureEngineColumn` (mirroring
 *     `ensureEvidenceColumn`) and the `Engine` cell written on BOTH
 *     `updateQueueStatus` row-write paths: the `evidence == null` quick path
 *     and `writeEvidenceCarryingRow`.
 *   - T39 (batch 5, depends on T36) un-skips "T39: ..." — `rewriteStatus`
 *     gains an 8th positional `provenance = NO_PROVENANCE` and hands
 *     `provenance.line` to `commitQueueRow` (the commit message) and to the
 *     row writer (the `Engine` cell), so all five of its call routes
 *     (R-1...R-5) inherit the mark by construction, from one writer, without
 *     any of the five callers threading it themselves.
 *
 * `ensureEngineColumn` does not exist at HEAD, so it is reached only through
 * a namespace import (RLH-19's technique, `orchestrateQueue.test.js`) — a
 * static named import of a name the module does not yet export is a
 * link-time SyntaxError under native ESM (this package is `"type": "module"`,
 * jest runs with `transform: {}`), which would stop the whole suite from
 * running rather than failing one red assertion. `rewriteStatus` and
 * `updateQueueStatus` already exist at HEAD (just without the provenance
 * plumbing), so they are imported directly.
 */

import { updateQueueStatus, rewriteStatus } from "../orchestrate-queue.js";
import * as queueModule from "../orchestrate-queue.js";
import { fakeFs, fakeGit } from "./helpers/seams.js";
import { QUEUE_SHAPES, FEATURE } from "./fixtures/queue-goldens/shapes.js";
import {
  makePopulatedProvenance,
  PROVENANCE_QUEUE_FIXTURES,
  PROVENANCE_QUEUE_FEATURE,
} from "./helpers/provenanceDoubles.js";

const QUEUE_PATH = "docs/_queue/QUEUE.md";

describe.skip("T36: ensureEngineColumn — mirrors ensureEvidenceColumn (PROP-PROV-5, PROP-PROV-6)", () => {
  test("a five-column canonical queue: header gains a literal 'Engine' cell, separator gains one cell, every data row gains one empty cell", () => {
    const before = QUEUE_SHAPES.canonical5col;
    const beforeDataLines = before
      .split("\n")
      .filter((l) => l.trim().startsWith("|"))
      .slice(2); // header + separator, then the three data rows

    const { markdown, migrated } = queueModule.ensureEngineColumn(before);
    expect(migrated).toBe(true);

    const lines = markdown.split("\n").filter((l) => l.trim().startsWith("|"));
    expect(lines).toHaveLength(5); // header, separator, 3 data rows — no row added or dropped

    const [header, separator, ...dataLines] = lines;
    // Header literal, asserted verbatim (TSPEC §7.2 — "no header cell
    // *contains* a matcher token" is the guarantee; the literal string is
    // what makes it true, so the literal is what this test pins).
    expect(header).toBe("| Order | Status | Feature | REQ Path | Depends-On | Engine |");
    expect(separator).toBe("| --- | --- | --- | --- | --- | --- |");

    expect(dataLines).toHaveLength(3);
    dataLines.forEach((line, i) => {
      const beforeLine = beforeDataLines[i];
      expect(line.startsWith(beforeLine.replace(/\s*\|\s*$/, ""))).toBe(true);
      expect(line.endsWith("|  |")).toBe(true);
    });
  });

  test("migrated: false, and the file byte-unchanged, on a second pass over its own output", () => {
    const first = queueModule.ensureEngineColumn(QUEUE_SHAPES.canonical5col);
    expect(first.migrated).toBe(true);

    const second = queueModule.ensureEngineColumn(first.markdown);
    expect(second.migrated).toBe(false);
    expect(second.markdown).toBe(first.markdown); // never migrated twice
  });

  test("a queue already carrying an Engine column is returned unchanged", () => {
    const before = PROVENANCE_QUEUE_FIXTURES["both-columns"];
    const { markdown, migrated } = queueModule.ensureEngineColumn(before);
    expect(migrated).toBe(false);
    expect(markdown).toBe(before);
  });

  test("a queue carrying Evidence but not Engine migrates cleanly — one migration already applied", () => {
    const before = PROVENANCE_QUEUE_FIXTURES["evidence-only"];
    const { markdown, migrated } = queueModule.ensureEngineColumn(before);
    expect(migrated).toBe(true);
    const header = markdown.split("\n")[0];
    expect(header).toBe("| Order | Status | Feature | REQ Path | Depends-On | Evidence | Engine |");
  });

  test("rows that are not part of the table (prose) are untouched", () => {
    const before = `# Queue\n\nSome prose above the table.\n\n${QUEUE_SHAPES.canonical5col}\n\nSome prose below the table.`;
    const { markdown } = queueModule.ensureEngineColumn(before);
    expect(markdown).toContain("Some prose above the table.");
    expect(markdown).toContain("Some prose below the table.");
  });

  test("markdown with no recognisable table (noTable shape) is returned unchanged", () => {
    const { markdown, migrated } = queueModule.ensureEngineColumn(QUEUE_SHAPES.noTable);
    expect(migrated).toBe(false);
    expect(markdown).toBe(QUEUE_SHAPES.noTable);
  });

  test("non-string input is returned unchanged and unmigrated", () => {
    expect(queueModule.ensureEngineColumn(null)).toEqual({ markdown: null, migrated: false });
    expect(queueModule.ensureEngineColumn(undefined)).toEqual({
      markdown: undefined,
      migrated: false,
    });
  });
});

describe.skip("T36: updateQueueStatus writes the Engine cell on BOTH row-write paths (PROP-PROV-5, AT-5.3b)", () => {
  test("the evidence == null quick path also writes the Engine cell when a provenance line is supplied", () => {
    const p = makePopulatedProvenance();
    const result = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, "in-progress", null, p.line);

    expect(result.matched).toBe(true);
    const header = result.markdown.split("\n")[0];
    expect(header).toBe("| Order | Status | Feature | REQ Path | Depends-On | Engine |");

    const row = result.markdown.split("\n").find((l) => l.includes(FEATURE));
    expect(row.trim().endsWith(`| ${p.line} |`)).toBe(true);
    expect(row).toContain("| in-progress |");
  });

  test("no provenance line supplied ⇒ byte-identical to today: no Engine column added at all", () => {
    const result = updateQueueStatus(QUEUE_SHAPES.canonical5col, FEATURE, "in-progress");
    expect(result.matched).toBe(true);
    expect(result.markdown).not.toMatch(/Engine/);
  });

  test("writeEvidenceCarryingRow writes the Engine cell alongside the Evidence cell", () => {
    const p = makePopulatedProvenance();
    const awaitingMerge = updateQueueStatus(
      QUEUE_SHAPES.canonical5col,
      FEATURE,
      "awaiting-merge",
    ).markdown;
    const result = updateQueueStatus(awaitingMerge, FEATURE, "done", "def5678 #42", p.line);

    expect(result.written).toBe(true);
    const header = result.markdown.split("\n")[0];
    expect(header).toBe(
      "| Order | Status | Feature | REQ Path | Depends-On | Evidence | Engine |",
    );

    const row = result.markdown.split("\n").find((l) => l.includes(FEATURE));
    expect(row.trim().endsWith(`| def5678 #42 | ${p.line} |`)).toBe(true);
  });

  test("AT-5.3b — the two-migration case: a table lacking BOTH Evidence and Engine migrates both, correctly aligned, on one evidence-carrying write", () => {
    const p = makePopulatedProvenance();
    const before = PROVENANCE_QUEUE_FIXTURES["no-columns"];
    const feature = PROVENANCE_QUEUE_FEATURE;

    const awaitingMerge = updateQueueStatus(before, feature, "awaiting-merge").markdown;
    const result = updateQueueStatus(awaitingMerge, feature, "done", "abc1234 #7", p.line);

    expect(result.written).toBe(true);
    const header = result.markdown.split("\n")[0];
    expect((header.match(/Evidence/g) || []).length).toBe(1);
    expect((header.match(/Engine/g) || []).length).toBe(1);
    // Evidence lands before Engine — ensureEvidenceColumn's column is
    // migrated first, ensureEngineColumn's is appended after it, so a later
    // reader locating cells by fixed offset does not have to guess order.
    expect(header.indexOf("Evidence")).toBeLessThan(header.indexOf("Engine"));

    const row = result.markdown.split("\n").find((l) => l.includes(feature));
    expect(row.trim().endsWith(`| abc1234 #7 | ${p.line} |`)).toBe(true);

    // Every OTHER row keeps two empty trailing cells, correctly aligned —
    // not shifted by an off-by-one between the two migrations.
    const otherRow = result.markdown.split("\n").find((l) => l.includes("other-feature-a"));
    expect(otherRow.trim().endsWith("|  |  |")).toBe(true);
  });
});

describe.skip("T39: rewriteStatus's 8th parameter — the single writer all five routes inherit (PROP-PROV-5, AT-5.3)", () => {
  test("provenance omitted (NO_PROVENANCE default) ⇒ byte-identical to today: no Engine cell, no mark in the commit message", async () => {
    const fs = fakeFs({ [QUEUE_PATH]: QUEUE_SHAPES.canonical5col });
    const git = fakeGit();

    const result = await rewriteStatus(
      QUEUE_PATH,
      FEATURE,
      "in-progress",
      fs.readFile,
      fs.writeFile,
      git,
    );

    expect(result.queueRow).toBe("recorded");
    expect(fs.files[QUEUE_PATH]).not.toMatch(/Engine/);
    const commitCall = git.calls.find((c) => c[0] === "commit");
    expect(commitCall[2]).not.toContain("pdlc-engine");
  });

  test.each([
    ["R-3/R-4: in-progress, no evidence", "in-progress", null],
    ["R-5: awaiting-merge, no evidence", "awaiting-merge", null],
    ["R-2/R-5: halted, no evidence", "halted", null],
  ])(
    "%s — a supplied provenance marks both the Engine cell and the commit message",
    async (_label, status, evidence) => {
      const p = makePopulatedProvenance();
      const fs = fakeFs({ [QUEUE_PATH]: QUEUE_SHAPES.canonical5col });
      const git = fakeGit();

      const result = await rewriteStatus(
        QUEUE_PATH,
        FEATURE,
        status,
        fs.readFile,
        fs.writeFile,
        git,
        evidence,
        p,
      );

      expect(result.queueRow).toBe("recorded");
      const row = fs.files[QUEUE_PATH].split("\n").find((l) => l.includes(FEATURE));
      expect(row.trim().endsWith(`| ${p.line} |`)).toBe(true);

      const commitCall = git.calls.find((c) => c[0] === "commit");
      expect(commitCall[2]).toContain(p.line);
    },
  );

  test("R-2 evidence-carrying: done + evidence still lands the Engine cell alongside the Evidence cell", async () => {
    const p = makePopulatedProvenance();
    const fs = fakeFs({ [QUEUE_PATH]: QUEUE_SHAPES.canonical5col });
    await rewriteStatus(QUEUE_PATH, FEATURE, "awaiting-merge", fs.readFile, fs.writeFile, fakeGit());

    const git = fakeGit();
    const result = await rewriteStatus(
      QUEUE_PATH,
      FEATURE,
      "done",
      fs.readFile,
      fs.writeFile,
      git,
      "def5678 #42",
      p,
    );

    expect(result.queueRow).toBe("recorded");
    const row = fs.files[QUEUE_PATH].split("\n").find((l) => l.includes(FEATURE));
    expect(row.trim().endsWith(`| def5678 #42 | ${p.line} |`)).toBe(true);
    const commitCall = git.calls.find((c) => c[0] === "commit");
    expect(commitCall[2]).toContain(p.line);
  });

  test("the same frozen provenance value, supplied across R-3, R-5's in-progress/awaiting-merge/halted statuses, marks every one — the mark lives in the single writer, not in five callers", async () => {
    const p = makePopulatedProvenance();
    const statuses = ["in-progress", "awaiting-merge", "halted"];
    for (const status of statuses) {
      const fs = fakeFs({ [QUEUE_PATH]: QUEUE_SHAPES.canonical5col });
      const git = fakeGit();
      await rewriteStatus(QUEUE_PATH, FEATURE, status, fs.readFile, fs.writeFile, git, null, p);
      const row = fs.files[QUEUE_PATH].split("\n").find((l) => l.includes(FEATURE));
      expect(row).toContain(p.line);
    }
  });
});
