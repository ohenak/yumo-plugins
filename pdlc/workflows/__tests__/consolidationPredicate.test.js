// consolidationPredicate.test.js — PLAN T14 (RED, describe.skip).
//
// One block, un-skipped by its owning task — never rewritten by it, per PLAN §13.3's batch-safety
// rule 2:
//
//   T25 — corpus and predicate: AT-P1 (both conjuncts — the first *is* TSPEC §7.1's pin (a), the
//     literal element-by-element assertion of the argv `enumerateCorpus` hands `_git`, both
//     `:(glob)` prefixes included, so the `docs/discarded/` exclusion is decided by the pathspec
//     and not by a fixture; the second conjunct is the positive membership case), AT-P2, AT-P3,
//     AT-P4, AT-P5, AT-P6, AT-P8, AT-P9, AT-P10, AT-P11 (TSPEC §7.1, FSPEC §12.1 at :2114-2124).
//
// `enumerateCorpus` and `classifyCorpus` do not exist as behaviour yet (PLAN T02 skeleton — both
// throw `notImplemented`); T25 is the row that gives them one. This file drives `enumerateCorpus`
// through `fakeGit` (never a real `git`) and `classifyCorpus` directly over plain
// `CorpusFile[]`/`logText` fixtures, per `consolidationDoubles.js`'s fixture-builder rule (no
// fixture here may depend on git *visibility* — TSPEC §7.1).

import { enumerateCorpus, classifyCorpus, renderConsumedPair } from "../consolidate-learnings.js";
import { fakeGit, buildConsolidationLog, buildCorpusListing, buildCorpusFiles } from "./helpers/consolidationDoubles.js";

// The literal argv TSPEC §7.1 pins (pin (a)) — transcribed here, not imported, because it is not
// exported by the module: the module only ever *hands* this array to `_git`.
const LS_FILES_ARGV = [
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "--",
  ":(glob)docs/*/LEARNINGS-*.md",
  ":(glob)docs/completed/*/LEARNINGS-*.md",
];

describe("T14 — the predicate suite (L1)", () => {
  describe("T25 — corpus and predicate", () => {
    // ─── AT-P1 — enumeration: the literal argv, and positive membership ─────

    test("AT-P1 conjunct 1: enumerateCorpus hands _git the literal ls-files argv, both :(glob) prefixes included", async () => {
      const git = fakeGit({ "ls-files": { ok: true, stdout: "" } });

      await enumerateCorpus(git._git);

      expect(git.calls).toHaveLength(1);
      expect(git.calls[0]).toEqual(LS_FILES_ARGV);
    });

    test("AT-P1 conjunct 2: a docs/completed/{f}/LEARNINGS-{f}.md line parses into the corpus (positive membership, not an absence-only claim about docs/discarded/)", async () => {
      const stdout = buildCorpusListing(["docs/completed/feat-x/LEARNINGS-feat-x.md"]);
      const git = fakeGit({ "ls-files": { ok: true, stdout } });

      const result = await enumerateCorpus(git._git);

      expect(result.files).toEqual([
        { path: "docs/completed/feat-x/LEARNINGS-feat-x.md", basename: "LEARNINGS-feat-x.md" },
      ]);
    });

    // ─── AT-P2 — a stray basename outside any block, after the first marker ─

    test("AT-P2: a basename outside any <!-- pdlc:consumed --> block, after the first marker, marks nothing (FSPEC E-07)", () => {
      const files = buildCorpusFiles(["docs/feat-y/LEARNINGS-feat-y.md"]);
      const logText = buildConsolidationLog({
        blocks: [{ passId: "P-2026-01-01-01", basenames: ["LEARNINGS-other.md"] }],
      }) + "\nartifact: LEARNINGS-feat-y.md\n";

      const predicate = classifyCorpus(files, logText);

      expect(predicate.unconsolidated).toEqual(["LEARNINGS-feat-y.md"]);
      expect(predicate.consolidated.has("LEARNINGS-feat-y.md")).toBe(false);
    });

    // ─── AT-P3 — no marker at all: the whole file is legacy region ──────────

    test("AT-P3: a log with no <!-- pdlc:consumed marker at all is entirely legacy region (FSPEC E-03)", () => {
      const files = buildCorpusFiles(["docs/feat-z/LEARNINGS-feat-z.md"]);
      const logText = "some prose mentioning LEARNINGS-feat-z.md somewhere in it\n";

      const predicate = classifyCorpus(files, logText);

      expect(predicate.consolidated.has("LEARNINGS-feat-z.md")).toBe(true);
      expect(predicate.unconsolidated).toEqual([]);
    });

    // ─── AT-P4 — absent log file: every basename un-consolidated, no error ──

    test("AT-P4: an absent log file (logText === null) leaves every enumerated basename un-consolidated, no error (FSPEC E-01)", () => {
      const files = buildCorpusFiles(["docs/feat-a/LEARNINGS-feat-a.md", "docs/feat-b/LEARNINGS-feat-b.md"]);

      const predicate = classifyCorpus(files, null);

      expect(predicate.unconsolidated.sort()).toEqual(["LEARNINGS-feat-a.md", "LEARNINGS-feat-b.md"]);
      expect(predicate.consolidated.size).toBe(0);
    });

    // ─── AT-P5 — unterminated block extends to EOF ──────────────────────────

    test("AT-P5: an opening marker with no closing marker extends the block to end of file; its basenames count as consumed (FSPEC E-04)", () => {
      const files = buildCorpusFiles(["docs/feat-c/LEARNINGS-feat-c.md"]);
      const logText = "<!-- pdlc:consumed P-2026-01-01-01 -->\nLEARNINGS-feat-c.md\n";

      const predicate = classifyCorpus(files, logText);

      expect(predicate.consolidated.has("LEARNINGS-feat-c.md")).toBe(true);
    });

    // ─── AT-P6 — empty un-consolidated set: the consumed pair is still a ────
    // well-formed record (its append-before-any-other-record ordering is a
    // main()-level fact for a later suite; this file's pure-function half is
    // that renderConsumedPair never degrades into an omitted or malformed
    // pair just because basenames is empty — FSPEC E-08)

    test("AT-P6: renderConsumedPair with an empty basenames array still renders a complete, well-formed pair (opener and closer, nothing between)", () => {
      const rendered = renderConsumedPair("P-2026-01-01-01", []);

      expect(rendered).toContain("<!-- pdlc:consumed P-2026-01-01-01 -->");
      expect(rendered).toContain("<!-- /pdlc:consumed -->");

      const openerEnd = rendered.indexOf("<!-- pdlc:consumed P-2026-01-01-01 -->") + "<!-- pdlc:consumed P-2026-01-01-01 -->".length;
      const closerStart = rendered.indexOf("<!-- /pdlc:consumed -->");
      expect(rendered.slice(openerEnd, closerStart).trim()).toBe("");
    });

    // ─── AT-P8 — an unreadable log is treated as empty text, not an error ───

    test("AT-P8: a log present but unreadable is treated as empty text — every enumerated basename is un-consolidated, no error (FSPEC E-02)", () => {
      const files = buildCorpusFiles(["docs/feat-e/LEARNINGS-feat-e.md"]);

      // "unreadable" is modelled the same way §3.4/E-02 states it: the caller (main, via
      // _readFile) never sees this file's text, so classifyCorpus is driven with "" — the same
      // input AT-P4's null-vs-empty distinction is not about; here the distinction under test is
      // logText content, not presence.
      const predicate = classifyCorpus(files, "");

      expect(predicate.unconsolidated).toEqual(["LEARNINGS-feat-e.md"]);
      expect(predicate.consolidated.size).toBe(0);
    });

    // ─── AT-P9 — a dangling closer with no opener opens no block ────────────

    test("AT-P9: a closing marker with no opener opens no block and moves no boundary; a real block elsewhere is unaffected (FSPEC E-05)", () => {
      const files = buildCorpusFiles(["docs/feat-f/LEARNINGS-feat-f.md", "docs/feat-g/LEARNINGS-feat-g.md"]);
      const logText =
        "<!-- /pdlc:consumed -->\n" +
        buildConsolidationLog({ blocks: [{ passId: "P-2026-01-01-01", basenames: ["LEARNINGS-feat-g.md"] }] });

      const predicate = classifyCorpus(files, logText);

      expect(predicate.unconsolidated).toEqual(["LEARNINGS-feat-f.md"]);
      expect(predicate.consolidated.has("LEARNINGS-feat-g.md")).toBe(true);
    });

    // ─── AT-P10 — two LEARNINGS sharing a basename: one set member, reported

    test("AT-P10: two LEARNINGS sharing a basename under different directories collapse to one un-consolidated member, and the collision is reported (FSPEC E-09)", () => {
      const files = buildCorpusFiles(["docs/feat-h/LEARNINGS-shared.md", "docs/completed/feat-i/LEARNINGS-shared.md"]);

      const predicate = classifyCorpus(files, null);

      expect(predicate.unconsolidated).toEqual(["LEARNINGS-shared.md"]);
      expect(predicate.basenameCollisions).toEqual([
        ["docs/feat-h/LEARNINGS-shared.md", "docs/completed/feat-i/LEARNINGS-shared.md"],
      ]);
    });

    // ─── AT-P11 — a basename in both regions is consolidated exactly once ──

    test("AT-P11: a basename appearing in both the legacy region and a block is consolidated exactly once (FSPEC E-06)", () => {
      const files = buildCorpusFiles(["docs/feat-j/LEARNINGS-feat-j.md"]);
      const logText = buildConsolidationLog({
        legacy: "prose mentioning LEARNINGS-feat-j.md\n",
        blocks: [{ passId: "P-2026-01-01-01", basenames: ["LEARNINGS-feat-j.md"] }],
      });

      const predicate = classifyCorpus(files, logText);

      expect(predicate.consolidated.has("LEARNINGS-feat-j.md")).toBe(true);
      expect(predicate.unconsolidated).toEqual([]);
    });
  });
});
