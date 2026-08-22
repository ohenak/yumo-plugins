// learningsCorpus.test.js — PLAN LI-09 (RED corpus-shell suite, greened by LI-18).
//
// TSPEC §A.3, §T.7: L2 shell tests for `gatherLearningsCorpus`, driven only through
// `helpers/seams.js`'s `fakeGit`/`fakeFs` doubles. Covers four of TSPEC §T.7's fail-open
// arms:
//   - LI-AT-25: `!reply.ok` from `_git` ⇒ `{unlistable: true}` (corpus-level RSN-UNLISTABLE)
//   - LI-AT-26: two cases — `_readFile` returns `null`, and `_readFile` throws — both real
//     per P-8 (`rtReadFile` throws where `defaultReadFile` returns `null`), both yielding
//     that one document's `RSN-UNREADABLE`
//   - LI-AT-27: a readable document that does not parse as a LEARNINGS document ⇒
//     `RSN-UNPARSEABLE`
//   - BR-12's last row (TSPEC §T.7): a fault that is NOT a graceful `!reply.ok` reply —
//     `_git` itself throwing — still enters the outer `try/catch` and still yields
//     `{unlistable: true}`, never propagating past `gatherLearningsCorpus`
//
// `fakeFs`'s own `_readFile` double is contracted to never throw (`seams.js`: "`_readFile`
// returns `null` for an absent path — never throws, mirroring the shipped `defaultReadFile`").
// AT-26's second case therefore cannot be built from `fakeFs` alone; it wraps `fakeFs`'s
// reader in one small inline function that throws for a single scripted path and delegates
// to `fakeFs`'s own double for every other path — not a new ad-hoc seam-double factory,
// just a one-off per-test override of a single path's outcome, on the precedent other
// suites in this package already use (e.g. `mergePhase.test.js`, `waveExecution.test.js`).
//
// `gatherLearningsCorpus` and `selectLearnings` do not exist in `orchestrate-dev.js` until
// LI-18 ("GREEN the IO shell") defines them, so every assertion block below is committed
// `.skip`ped, titled with LI-18's id, per the wave gate's full-suite-green rule. LI-18's
// first action is to remove exactly these `.skip` wrappers, observe the red, then implement
// until green — never delete a block or add a new one beside it.
//
// The `orchestrate-dev.js` import is deferred to a dynamic `await import` inside each test
// body (rather than a top-level import) so this file still loads cleanly today, with
// `gatherLearningsCorpus`/`selectLearnings` absent from that module's exports.

import { readFileSync } from "fs";

import { fakeGit, fakeFs } from "./helpers/seams.js";
import {
  buildLearningsCorpus,
  LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
} from "./helpers/learningsFixtures.js";

describe("gatherLearningsCorpus — corpus-shell fail-open arms (TSPEC §A.3, §T.7)", () => {
  test("LI-18: LI-AT-25 — !reply.ok from _git yields {unlistable: true}, corpus-level RSN-UNLISTABLE", async () => {
    const { gatherLearningsCorpus } = await import("../orchestrate-dev.js");

    const git = fakeGit({ ok: false, stderr: "fatal: not a git repository" });
    const fs = fakeFs({});

    const result = await gatherLearningsCorpus({
      feature: "some-feature",
      _git: git,
      _readFile: fs.readFile,
    });

    expect(result).toEqual({ unlistable: true });
    // §A.3: enumeration fails before any document is opened.
    expect(fs.reads).toEqual([]);
  });

  test("LI-18: LI-AT-26 case 1 — _readFile returns null ⇒ that document alone is RSN-UNREADABLE, the rest used normally", async () => {
    const { gatherLearningsCorpus, selectLearnings } = await import("../orchestrate-dev.js");

    const readable = buildLearningsCorpus([
      {
        path: "docs/readable-doc/LEARNINGS-readable-doc.md",
        doc: {
          feature: "readable-doc",
          dateCompleted: "2026-01-01",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }],
        },
      },
    ]);
    const missingPath = "docs/missing-doc/LEARNINGS-missing-doc.md";
    const lsFilesStdout = [readable.lsFilesStdout, missingPath].join("\n");
    const git = fakeGit({ ok: true, stdout: lsFilesStdout });
    // fakeFs is seeded with only the readable document's contents, so a read of
    // missingPath returns null per fakeFs's own never-throw contract.
    const fs = fakeFs(readable.contents);

    const result = await gatherLearningsCorpus({
      feature: "authoring-feature",
      _git: git,
      _readFile: fs.readFile,
    });

    expect(result.unlistable).toBe(false);
    const missingEntry = result.entries.find((e) => e.path === missingPath);
    expect(missingEntry).toMatchObject({ text: null, readOk: false, excluded: null });
    const readEntry = result.entries.find((e) => e.path === readable.paths[0]);
    expect(readEntry).toMatchObject({ readOk: true });

    const { rejected } = selectLearnings({
      entries: result.entries,
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    });
    expect(rejected).toContainEqual({ path: missingPath, reason: "RSN-UNREADABLE" });
    expect(rejected.some((r) => r.path === readable.paths[0])).toBe(false);
  });

  test("LI-18: LI-AT-26 case 2 — _readFile throws ⇒ that document alone is RSN-UNREADABLE, the rest used normally (P-8)", async () => {
    const { gatherLearningsCorpus, selectLearnings } = await import("../orchestrate-dev.js");

    const readable = buildLearningsCorpus([
      {
        path: "docs/ok-doc/LEARNINGS-ok-doc.md",
        doc: {
          feature: "ok-doc",
          dateCompleted: "2026-01-02",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }],
        },
      },
    ]);
    const throwingPath = "docs/throws-doc/LEARNINGS-throws-doc.md";
    const lsFilesStdout = [readable.lsFilesStdout, throwingPath].join("\n");
    const git = fakeGit({ ok: true, stdout: lsFilesStdout });
    const fs = fakeFs(readable.contents);
    // A one-off override of a single scripted path's outcome, delegating to fakeFs's own
    // double everywhere else — the runtime channel's `rtReadFile` throws (P-8), which
    // `fakeFs`'s never-throw double cannot itself represent.
    const _readFile = (path) => {
      if (path === throwingPath) throw new Error("EACCES: simulated permission fault");
      return fs.readFile(path);
    };

    const result = await gatherLearningsCorpus({
      feature: "authoring-feature",
      _git: git,
      _readFile,
    });

    expect(result.unlistable).toBe(false);
    const throwingEntry = result.entries.find((e) => e.path === throwingPath);
    expect(throwingEntry).toMatchObject({ text: null, readOk: false, excluded: null });
    const okEntry = result.entries.find((e) => e.path === readable.paths[0]);
    expect(okEntry).toMatchObject({ readOk: true });

    const { rejected } = selectLearnings({
      entries: result.entries,
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    });
    expect(rejected).toContainEqual({ path: throwingPath, reason: "RSN-UNREADABLE" });
    expect(rejected.some((r) => r.path === readable.paths[0])).toBe(false);
  });

  test("LI-18: LI-AT-27 — a readable document that does not parse as LEARNINGS ⇒ RSN-UNPARSEABLE, the rest used normally", async () => {
    const { gatherLearningsCorpus, selectLearnings } = await import("../orchestrate-dev.js");

    const notLearningsPath = "docs/not-learnings/LEARNINGS-not-learnings.md";
    const notLearningsText = "# Some Other Document\n\nThis is not a LEARNINGS document at all.\n";
    const corpus = buildLearningsCorpus([
      { path: notLearningsPath, text: notLearningsText },
      {
        path: "docs/normal-doc/LEARNINGS-normal-doc.md",
        doc: {
          feature: "normal-doc",
          dateCompleted: "2026-01-05",
          sections: [{ name: "Cross-Feature Patterns", bodyBytes: 200 }],
        },
      },
    ]);
    const git = fakeGit({ ok: true, stdout: corpus.lsFilesStdout });
    const fs = fakeFs(corpus.contents);

    const result = await gatherLearningsCorpus({
      feature: "authoring-feature",
      _git: git,
      _readFile: fs.readFile,
    });

    expect(result.unlistable).toBe(false);
    const notLearningsEntry = result.entries.find((e) => e.path === notLearningsPath);
    // The shell reads it successfully — parsing is the pure core's decision, not the shell's.
    expect(notLearningsEntry).toMatchObject({ readOk: true, text: notLearningsText });

    const { rejected } = selectLearnings({
      entries: result.entries,
      thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
    });
    expect(rejected).toContainEqual({ path: notLearningsPath, reason: "RSN-UNPARSEABLE" });
    expect(rejected.some((r) => r.path === "docs/normal-doc/LEARNINGS-normal-doc.md")).toBe(
      false
    );
  });

  test("LI-18: fault-injection case (BR-12's last row) — a fault that is NOT a graceful !reply.ok still enters the outer try/catch, yielding {unlistable: true}", async () => {
    const { gatherLearningsCorpus } = await import("../orchestrate-dev.js");

    // Unlike LI-AT-25 (a graceful `{ok: false}` reply), this scripts `_git` itself to
    // throw — an unexpected fault distinct from the documented failure shape — so the
    // ONLY thing that can catch it is the shell's outer try/catch (TSPEC §A.3: "the whole
    // shell is wrapped in one try/catch returning the unlistable outcome ... nothing in
    // this feature can throw past dispatchAndVerify").
    const git = fakeGit(() => {
      throw new Error("simulated fault: not a graceful git failure reply");
    });
    const fs = fakeFs({});

    const result = await gatherLearningsCorpus({
      feature: "some-feature",
      _git: git,
      _readFile: fs.readFile,
    });

    expect(result).toEqual({ unlistable: true });
  });
});

// PROP-CORPUS-07 (§D.3, BR-3, E-19, E-33, F-O-1): `looksLikeLearningsDocument` is a first-line
// recognition rule, deliberately weak (BR-3) — a document missing later sections, or truncated
// mid-body, keeps its first line and stays eligible; only a first non-blank line that is not a
// level-1 `LEARNINGS` heading is rejected. Driven directly at L1, never through the corpus
// shell — the predicate under test is exported and pure.
describe("looksLikeLearningsDocument — PROP-CORPUS-07: the first-line recognition rule (BR-3)", () => {
  test("PROP-CORPUS-07: accepts a document missing later sections (only a heading and a preamble, no section bodies at all)", async () => {
    const { looksLikeLearningsDocument } = await import("../orchestrate-dev.js");

    const text = "# LEARNINGS — some-feature\n\nHarvested on 2026-01-01.\n";

    expect(looksLikeLearningsDocument(text)).toBe(true);
  });

  test("PROP-CORPUS-07: accepts a document truncated mid-body (its first line survives, everything after is cut off)", async () => {
    const { looksLikeLearningsDocument } = await import("../orchestrate-dev.js");

    const text = "# LEARNINGS — some-feature\n\n## 1. Non-Convergences\n\nThis section never clo";

    expect(looksLikeLearningsDocument(text)).toBe(true);
  });

  test("PROP-CORPUS-07: rejects a file whose first non-blank line is not a level-1 LEARNINGS heading", async () => {
    const { looksLikeLearningsDocument } = await import("../orchestrate-dev.js");

    const text = "# Some Other Document\n\n## 1. Non-Convergences\n\nNot a LEARNINGS document at all.\n";

    expect(looksLikeLearningsDocument(text)).toBe(false);
  });

  test("PROP-CORPUS-07: leading blank lines before the heading are skipped, not treated as the first line", async () => {
    const { looksLikeLearningsDocument } = await import("../orchestrate-dev.js");

    const text = "\n   \n# LEARNINGS — some-feature\n\nBody text.\n";

    expect(looksLikeLearningsDocument(text)).toBe(true);
  });

  test("PROP-CORPUS-07: no RSN-TRUNCATED id is ever emitted anywhere in orchestrate-dev.js — a truncated document is never a distinguished rejection reason, per BR-3's deliberate weakness", () => {
    const source = readFileSync(new URL("../orchestrate-dev.js", import.meta.url), "utf8");

    expect(source).not.toContain("RSN-TRUNCATED");
  });
});
