// consolidationPass.test.js — PLAN T20 (RED, describe.skip).
//
// Two blocks, each un-skipped by its own owning task — never rewritten by it, per PLAN §13.3's
// batch-safety rule 2:
//
//   T28 — marker predicates: `parseMarker` and `markerVerdict` driven directly on literal inputs
//     (pure, no `main`) — including AT-M11's pure half: `markerVerdict` returns `free` for a
//     `RELEASED: {passId} {ISO-8601}` marker (FSPEC:2133) in both of AT-M11's fixtures, one
//     written seconds ago and one older than `staleLockMinutes` — the older fixture is what stops
//     an implementation routing every non-`IN-PROGRESS:` file through the `reclaim` arm.
//
//   T31 — pass lifecycle: AT-C1, AT-C1b, AT-C2 … AT-C8, AT-M1 … AT-M6, AT-M6b, AT-M9, AT-M11
//     through `main()` with every seam doubled; plus the (no FSPEC AT) obligation TSPEC §12.2
//     records — (i) the unreadable-corpus-entry case, and (ii) AT-M3's own fixture (a), the empty
//     marker, written inside the AT-M3 case beside AT-M11 (TSPEC:2497). Both AT-M11 halves live in
//     this one file, so T05's "exactly one file per register id" is undisturbed.
//
// `parseMarker`, `markerVerdict` and `main` are implemented (T28, T31); this header used to say
// they throw `notImplemented`, a symbol deleted from the module in `4fdc7fac`. No oracle below is
// weakened on account of an unimplemented subject.

import main, {
  parseMarker,
  markerVerdict,
} from "../consolidate-learnings.js";
import {
  fakeFs,
  fakeGit,
  fakeGhRun,
  makeAgentDouble,
  fakeEnvPresent,
  fakeMakeTempDir,
  fakeNow,
  FIXED_NOW_MS,
  buildConsolidationLog,
  buildCorpusListing,
  buildCorpusFiles,
  buildEscalationsFixture,
} from "./helpers/consolidationDoubles.js";

// ─── Shared literals (TSPEC §7.3, §9.4) ────────────────────────────────────
const MARKER_PATH = "docs/_decisions/.consolidation-lock";
const LOG_PATH = "docs/_decisions/.consolidation-log.md";
const STALE_LOCK_MINUTES = 60; // ConsolidationConfig default (TSPEC §6.1)
// The advisory rung pair, transcribed exactly as `consolidationRung.test.js:37-38` transcribes it
// (`orchestrate-dev.js:1683-1684` — module-private, so both suites transcribe rather than import).
const MODEL_ADVISORY = "fable";
const MODEL_ADVISORY_FALLBACK = "opus";

describe("T20 — the pass, end to end (L2)", () => {
  // ═══════════════════════════════════════════════════════════════════════
  // Block 1 — T28: the marker predicates, pure, no `main` (TSPEC §7.3)
  // ═══════════════════════════════════════════════════════════════════════
  describe("T28 — marker predicates", () => {
    describe("parseMarker — exactly two one-line forms, null for everything else", () => {
      test("an IN-PROGRESS: line parses to {state: 'in-progress', passId, at}", () => {
        const parsed = parseMarker("IN-PROGRESS: 2025-06-01-1 2025-06-01T00:00:00.000Z");
        expect(parsed).toEqual({
          state: "in-progress",
          passId: "2025-06-01-1",
          at: Date.parse("2025-06-01T00:00:00.000Z"),
        });
      });

      test("a RELEASED: line (FSPEC BR-14a's sentinel) parses to {state: 'released', passId, at}", () => {
        const parsed = parseMarker("RELEASED: 2025-06-01-1 2025-06-01T00:00:00.000Z");
        expect(parsed).toEqual({
          state: "released",
          passId: "2025-06-01-1",
          at: Date.parse("2025-06-01T00:00:00.000Z"),
        });
      });

      test("empty text is null (E-11's truncated-write state — unparseable, not a third form)", () => {
        expect(parseMarker("")).toBeNull();
      });

      test("a third verb is null — only IN-PROGRESS: and RELEASED: are recognised", () => {
        expect(parseMarker("DONE: 2025-06-01-1 2025-06-01T00:00:00.000Z")).toBeNull();
      });

      test("a multi-line marker is null", () => {
        expect(parseMarker("IN-PROGRESS: 2025-06-01-1 2025-06-01T00:00:00.000Z\nextra")).toBeNull();
      });

      test("an unparseable timestamp is null", () => {
        expect(parseMarker("IN-PROGRESS: 2025-06-01-1 not-a-timestamp")).toBeNull();
      });

      test("null input (an absent file's non-reading) is null", () => {
        expect(parseMarker(null)).toBeNull();
      });
    });

    describe("markerVerdict — free / refuse / reclaim (TSPEC §7.3)", () => {
      test("absent file (parsed null, present false) is free — nothing to refuse or reclaim", () => {
        expect(markerVerdict(null, false, FIXED_NOW_MS, STALE_LOCK_MINUTES)).toBe("free");
      });

      test("a present, fresh IN-PROGRESS: marker is refuse", () => {
        const parsed = { state: "in-progress", passId: "p", at: FIXED_NOW_MS - 1000 };
        expect(markerVerdict(parsed, true, FIXED_NOW_MS, STALE_LOCK_MINUTES)).toBe("refuse");
      });

      test("a present, stale IN-PROGRESS: marker (older than staleLockMinutes) is reclaim", () => {
        const staleAt = FIXED_NOW_MS - (STALE_LOCK_MINUTES + 1) * 60 * 1000;
        const parsed = { state: "in-progress", passId: "p", at: staleAt };
        expect(markerVerdict(parsed, true, FIXED_NOW_MS, STALE_LOCK_MINUTES)).toBe("reclaim");
      });

      test("a present, unparseable marker (parsed null) is reclaim, never refuse — it carries no timestamp to age out", () => {
        expect(markerVerdict(null, true, FIXED_NOW_MS, STALE_LOCK_MINUTES)).toBe("reclaim");
      });

      // ─── AT-M11's pure half (FSPEC:2133) ─────────────────────────────────
      //
      // A RELEASED: marker is free at ANY age — staleness is a property of a *held* marker, and a
      // released one is not held (TSPEC:956-964). Two fixtures, one written seconds ago and one
      // older than staleLockMinutes, are the pair that stops an implementation from routing every
      // non-IN-PROGRESS: file through the reclaim arm: without the older fixture, a markerVerdict
      // that ages every present-and-not-in-progress marker into reclaim would still pass the
      // fresh-only case.
      test("AT-M11 (pure half): a RELEASED: marker written seconds ago is free", () => {
        const parsed = { state: "released", passId: "p", at: FIXED_NOW_MS - 1000 };
        expect(markerVerdict(parsed, true, FIXED_NOW_MS, STALE_LOCK_MINUTES)).toBe("free");
      });

      test("AT-M11 (pure half): a RELEASED: marker older than staleLockMinutes is ALSO free — age never matters for a released marker", () => {
        const staleAt = FIXED_NOW_MS - (STALE_LOCK_MINUTES + 1) * 60 * 1000;
        const parsed = { state: "released", passId: "p", at: staleAt };
        expect(markerVerdict(parsed, true, FIXED_NOW_MS, STALE_LOCK_MINUTES)).toBe("free");
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Block 2 — T31: the pass lifecycle, through `main()`, every seam doubled
  // ═══════════════════════════════════════════════════════════════════════
  describe("T31 — pass lifecycle", () => {
    // ─── Fixture plumbing ────────────────────────────────────────────────
    //
    // `main()` has no `config`/`root` parameter (TSPEC §7.8): configuration comes from
    // `.claude/pdlc.config.json` through `_readFile`, per-key independent fallback. Every AT-C/
    // AT-M fixture below relies on the ConsolidationConfig DEFAULTS (cadenceHours 168,
    // volumeThreshold 5, staleLockMinutes 60 — TSPEC §6.1) rather than writing a config file, which
    // is why AT-C1/AT-C1b's (n, k, volumeThreshold) triple is instantiated at threshold 5: that IS
    // the shipped default, not a fixture the test also has to author a config file for.
    //
    // Terminal-row grammar note: TSPEC §10.3 states the row's field TABLE (`pass:`, `date:`,
    // `status:`, `trigger:`, …) but gives no literal example of how a row is delimited on disk —
    // that rendering is T29's (`renderTerminalRow`), which does not exist yet either. `buildLogRow`
    // below is this file's own reconstruction, used only to build AT-C5/AT-C6/AT-C7's log
    // fixtures (`cadenceDatum`/`mintPassId` read exactly this shape in the fixtures below); it is
    // not a claim about T29's eventual byte-for-byte output.
    function buildLogRow({ passId, date, status = "no-op", trigger = "cadence" }) {
      return `## Pass ${passId}\npass: ${passId}\ndate: ${date}\nstatus: ${status}\ntrigger: ${trigger}\n\n`;
    }

    // `report(state)`'s exact return shape is not spelled anywhere in TSPEC beyond "one report"
    // (§10.1) — this file assumes it exposes (at least) PassState's own field names verbatim
    // (`status`, `trigger`, `reasons` as a `Set<ReasonCode>`, `passId`, `proposals`, `records`,
    // `effectiveness`, `prUrl`, `markerHeld`) plus a rendered `body` string (`renderReportBody`'s
    // output, TSPEC §7.9) — the two things every AT below actually needs. If `main()`'s eventual
    // shape differs, this assumption is what T31's landing revises, not a claim pinned elsewhere.
    const TODAY = "2025-01-01"; // FIXED_NOW_MS's local date (mergeDoubles.js)

    /**
     * Build one full seam bundle for `main()`. `corpusPaths` are repo-root-relative
     * `docs/{feature}/LEARNINGS-{feature}.md` paths (TSPEC §7.1); `bodies` maps a subset to their
     * `_readFile` text (an omitted path reads as absent/unreadable, TSPEC §5.1). `logText` seeds
     * `docs/_decisions/.consolidation-log.md`; `markerText` seeds
     * `docs/_decisions/.consolidation-lock` (omitted ⇒ absent, `_checkFile` ⇒ `file_missing`).
     */
    function buildSeams({ corpusPaths = [], bodies = {}, logText = "", markerText, agentScript = [] } = {}) {
      const files = { [LOG_PATH]: logText };
      if (markerText !== undefined) files[MARKER_PATH] = markerText;
      for (const [path, text] of Object.entries(bodies)) files[path] = text;
      const fs = fakeFs(files);
      const git = fakeGit({ "ls-files": { ok: true, stdout: buildCorpusListing(corpusPaths) } });
      const agent = makeAgentDouble({ script: agentScript });
      return {
        fs,
        git,
        _readFile: fs.readFile,
        _writeFile: fs.writeFile,
        _appendFile: fs.appendFile,
        _checkFile: fs.checkFile,
        _git: git._git,
        _ghRun: fakeGhRun(),
        _agent: agent,
        _envPresent: fakeEnvPresent()._envPresent,
        _makeTempDir: fakeMakeTempDir(null)._makeTempDir,
        _now: fakeNow,
        _log: () => {},
        _phase: () => {},
      };
    }

    // ─── AT-C1 / AT-C1b (FSPEC:2100-2101) — the constructed (n, k, volumeThreshold) fixture ──
    describe("AT-C1 / AT-C1b — the constructed corpus fixture, both sides of the volume threshold", () => {
      function buildCorpus(n) {
        return Array.from({ length: n }, (_, i) => `docs/feat-${i}/LEARNINGS-feat-${i}.md`);
      }

      test("AT-C1: (5, 2, 5) — n-k=3 < volumeThreshold, so the tick fires on cadence's empty-datum branch (no-cadence-datum)", () => {
        const paths = buildCorpus(5);
        const consumedBasenames = paths.slice(0, 2).map((p) => p.split("/").pop());
        const logText = buildConsolidationLog({ blocks: [{ passId: "2024-01-01-1", basenames: consumedBasenames }] });
        const seams = buildSeams({ corpusPaths: paths, logText });

        return main({ ...seams }).then((result) => {
          expect(result.trigger).toBe("cadence");
          expect(Array.from(result.reasons ?? [])).toContain("no-cadence-datum");
        });
      });

      test("AT-C1b: (6, 0, 5) — n-k=6 >= volumeThreshold, so the volume test fires first, trigger volume", () => {
        const paths = buildCorpus(6);
        const seams = buildSeams({ corpusPaths: paths, logText: "" });

        return main({ ...seams }).then((result) => {
          expect(result.trigger).toBe("volume");
        });
      });
    });

    test("AT-C2 (FSPEC:2102): 5+ un-consolidated and cadenceHours not elapsed — the pass runs with trigger volume", () => {
      const paths = Array.from({ length: 5 }, (_, i) => `docs/feat-${i}/LEARNINGS-feat-${i}.md`);
      // A recent promoted row keeps cadence un-elapsed while volume alone still fires.
      const recentDate = new Date(FIXED_NOW_MS - 60 * 60 * 1000).toISOString();
      const logText = buildLogRow({ passId: "2024-12-31-1", date: recentDate, status: "no-op", trigger: "manual" });
      const seams = buildSeams({ corpusPaths: paths, logText });

      return main({ ...seams }).then((result) => {
        expect(result.trigger).toBe("volume");
      });
    });

    test("AT-C3 (FSPEC:2103): fewer than volumeThreshold un-consolidated, cadenceHours not elapsed — skipped-cadence, and nothing else happens", () => {
      const paths = ["docs/feat-a/LEARNINGS-feat-a.md"]; // 1 un-consolidated, well under threshold 5
      const recentDate = new Date(FIXED_NOW_MS - 60 * 60 * 1000).toISOString();
      const logText = buildLogRow({ passId: "2024-12-31-1", date: recentDate, status: "no-op", trigger: "manual" });
      const seams = buildSeams({ corpusPaths: paths, logText });

      return main({ ...seams }).then((result) => {
        // Positive conjunct — required so this row cannot pass on a pass that merely crashed.
        expect(result.status).toBe("skipped-cadence");
        // The four absences (TSPEC:1845, AC-1.1/AC-7.2):
        expect(seams.fs.appends).toHaveLength(0); // no log row appended
        expect(seams.fs.reads.some((r) => /LEARNINGS-/.test(r.path))).toBe(false); // no body read
        expect(result.passId).toBeNull(); // no passId minted
        // FSPEC §2.4 permits the basename enumeration itself ("reads … the
        // corpus basenames"); what a skipped tick may not do is any further
        // git activity — no branch read, no add, no commit.
        expect(seams.git.calls.filter((argv) => argv[0] !== "ls-files")).toHaveLength(0);
      });
    });

    test("AT-C4 (FSPEC:2104): cadenceHours not elapsed by any measure, but a DIRECT invocation runs unconditionally with trigger manual", () => {
      const paths = ["docs/feat-a/LEARNINGS-feat-a.md"];
      const recentDate = new Date(FIXED_NOW_MS - 60 * 60 * 1000).toISOString();
      const logText = buildLogRow({ passId: "2024-12-31-1", date: recentDate, status: "no-op", trigger: "manual" });
      const seams = buildSeams({ corpusPaths: paths, logText });

      return main({ ...seams, direct: true }).then((result) => {
        expect(result.trigger).toBe("manual");
        expect(result.status).not.toBe("skipped-cadence"); // BR-05: manual skips BR-01/BR-02 entirely
      });
    });

    test("AT-C5 (FSPEC:2105): a later `refused` row never advances the datum — the datum is D1, the earlier promoted row's date", () => {
      const d1 = new Date(FIXED_NOW_MS - 200 * 60 * 60 * 1000).toISOString(); // > 168h ago
      const d2 = new Date(FIXED_NOW_MS - 1 * 60 * 60 * 1000).toISOString(); // recent, but refused
      const logText =
        buildLogRow({ passId: "2024-01-01-1", date: d1, status: "promoted", trigger: "cadence" }) +
        buildLogRow({ passId: "2024-01-05-1", date: d2, status: "refused", trigger: "manual" });
      const paths = ["docs/feat-a/LEARNINGS-feat-a.md"]; // under volumeThreshold, so only cadence can fire
      const seams = buildSeams({ corpusPaths: paths, logText });

      return main({ ...seams }).then((result) => {
        // D1 is > cadenceHours old, so cadence fires; had D2 (recent) been read as the datum, it
        // would still be within cadenceHours and the tick would skip instead.
        expect(result.trigger).toBe("cadence");
      });
    });

    test("AT-C6 (FSPEC:2106): a log already carrying {today}-1 — the new passId is {today}-2", () => {
      const logText = buildLogRow({ passId: `${TODAY}-1`, date: new Date(FIXED_NOW_MS).toISOString(), status: "no-op", trigger: "manual" });
      const paths = Array.from({ length: 6 }, (_, i) => `docs/feat-${i}/LEARNINGS-feat-${i}.md`); // force a run
      const seams = buildSeams({ corpusPaths: paths, logText });

      return main({ ...seams }).then((result) => {
        expect(result.passId).toBe(`${TODAY}-2`);
      });
    });

    test("AT-C7 (FSPEC:2107): newest rows all carry a previous date, one unparseable — the counter restarts, {today}-1", () => {
      const prevDay = "2024-12-31";
      const logText =
        buildLogRow({ passId: `${prevDay}-3`, date: new Date(FIXED_NOW_MS - 24 * 60 * 60 * 1000).toISOString(), status: "no-op", trigger: "manual" }) +
        "## Pass (malformed)\nthis row is not parseable\n\n"; // contributes no `m` (E-10)
      const paths = Array.from({ length: 6 }, (_, i) => `docs/feat-${i}/LEARNINGS-feat-${i}.md`);
      const seams = buildSeams({ corpusPaths: paths, logText });

      return main({ ...seams }).then((result) => {
        expect(result.passId).toBe(`${TODAY}-1`);
      });
    });

    test("AT-C8 (FSPEC:2108): one fixed corpus/config, run twice under different triggers — set-equal promotion sets by (failure-mode-id, action)", () => {
      const paths = ["docs/feat-a/LEARNINGS-feat-a.md", "docs/feat-b/LEARNINGS-feat-b.md"];
      const bodies = {
        "docs/feat-a/LEARNINGS-feat-a.md": "# LEARNINGS\n\n## 1. Domain / architectural invariant\nAlways validate input at the boundary.\n",
        "docs/feat-b/LEARNINGS-feat-b.md": "# LEARNINGS\n\n## 1. Domain / architectural invariant\nAlways validate input at the boundary.\n",
      };
      // volume: 5 corpus members, none consumed — fires on volume alone.
      const volumePaths = Array.from({ length: 5 }, (_, i) => `docs/feat-${i}/LEARNINGS-feat-${i}.md`);
      const volumeSeams = buildSeams({ corpusPaths: volumePaths, bodies, logText: "" });
      // cadence: below threshold, but the datum is stale.
      const staleDate = new Date(FIXED_NOW_MS - 200 * 60 * 60 * 1000).toISOString();
      const cadenceLog = buildLogRow({ passId: "2024-01-01-1", date: staleDate, status: "no-op", trigger: "manual" });
      const cadenceSeams = buildSeams({ corpusPaths: paths, bodies, logText: cadenceLog });

      return Promise.all([main({ ...volumeSeams }), main({ ...cadenceSeams })]).then(([byVolume, byCadence]) => {
        expect(byVolume.trigger).toBe("volume");
        expect(byCadence.trigger).toBe("cadence");
        const keyOf = (p) => `${p.failureModeId}:${p.action}`;
        const volumeKeys = new Set((byVolume.proposals ?? []).map(keyOf));
        const cadenceKeys = new Set((byCadence.proposals ?? []).map(keyOf));
        expect(volumeKeys).toEqual(cadenceKeys);
      });
    });

    // ═══════════════════════════════════════════════════════════════════
    // AT-M — the marker and the lifecycle (FSPEC §13.3), through `main()`.
    // Every fixture below uses `direct: true` (AT-C4) so the cadence/volume
    // gate is bypassed and the Given clauses below can state only the one
    // fact each AT is actually about, per BR-05.
    // ═══════════════════════════════════════════════════════════════════
    describe("AT-M — the marker and the lifecycle", () => {
      function markerLine(state, passId, atMs) {
        const verb = state === "in-progress" ? "IN-PROGRESS" : "RELEASED";
        return `${verb}: ${passId} ${new Date(atMs).toISOString()}`;
      }

      const FRESH_AT = FIXED_NOW_MS - 1000; // 1s ago — well inside staleLockMinutes (60m)
      const STALE_AT = FIXED_NOW_MS - (STALE_LOCK_MINUTES + 1) * 60 * 1000; // > staleLockMinutes ago
      const HELD_PASS_ID = "2024-06-01-9"; // an arbitrary already-held passId

      // A clustering reply that names no recurring failure mode. `deriveProposals` (pure over this
      // text, §7.4, `consolidate-learnings.js:928-957`) is landed: it parses JSON
      // `{clusters: […]}` and derives nothing from anything else, so free prose IS the
      // "nothing found" input — the no-promotions branch every AT-M row below except AT-M9 wants,
      // where the pass proceeds no further than the dispatch itself. AT-M9 uses the JSON grammar
      // instead, because it is the one row that must reach step 13.
      const NOTHING_FOUND_REPLY = "no recurring failure mode pattern found across the corpus";

      function oneFileCorpus() {
        return {
          corpusPaths: ["docs/feat-a/LEARNINGS-feat-a.md"],
          bodies: { "docs/feat-a/LEARNINGS-feat-a.md": "# LEARNINGS\n\n## 1. Domain / architectural invariant\nAlways validate at the boundary.\n" },
        };
      }

      test("AT-M1: a marker present and fresh — refused, consolidation-in-progress, held passId+timestamp named, no consumed pair, no commit, one log row still written", () => {
        const markerText = markerLine("in-progress", HELD_PASS_ID, FRESH_AT);
        const seams = buildSeams({ ...oneFileCorpus(), markerText, agentScript: [] });

        return main({ ...seams, direct: true }).then((result) => {
          expect(result.status).toBe("refused");
          expect(Array.from(result.reasons ?? [])).toContain("consolidation-in-progress");
          // Naming the held passId and timestamp (FSPEC §13.3 AT-M1) — the one durable record of
          // this refusal is the log row `finishPass` still writes (§10.1's `refused` guard gates
          // only the commit and the marker release, never the terminal row).
          expect(seams.fs.appends).toHaveLength(1);
          expect(seams.fs.appends[0].text).toContain(HELD_PASS_ID);
          expect(seams.fs.appends[0].text).not.toContain("pdlc:consumed"); // no consumed pair
          // No commit: no `add`/`commit` argv reached `_git` (enumeration's own `ls-files` call is
          // not a commit call, so this is never satisfied vacuously by "git was never called").
          expect(seams.git.calls.some((argv) => argv[0] === "add" || argv[0] === "commit")).toBe(false);
        });
      });

      test("AT-M2: a marker older than staleLockMinutes — reclaimed, reclaimed-stale-lock records the abandoned passId, and the pass proceeds", () => {
        const markerText = markerLine("in-progress", HELD_PASS_ID, STALE_AT);
        const seams = buildSeams({ ...oneFileCorpus(), markerText, agentScript: [NOTHING_FOUND_REPLY] });

        return main({ ...seams, direct: true }).then((result) => {
          expect(result.status).not.toBe("refused");
          expect(Array.from(result.reasons ?? [])).toContain("reclaimed-stale-lock");
          expect(seams.fs.appends.some((a) => a.text.includes(HELD_PASS_ID))).toBe(true);
        });
      });

      // ─── AT-M3 (two fixtures) paired with AT-M11 (FSPEC §13.3) ──────────
      describe("AT-M3 — an unparseable-but-present marker reclaims, records the abandoned id unknown (paired with AT-M11 below)", () => {
        test("AT-M3 fixture (a): an empty marker file (file_empty, a write that died mid-flush) is reclaimed, not refused — the id is reported unknown (E-11, this obligation's own reason for existing)", () => {
          const seams = buildSeams({ ...oneFileCorpus(), markerText: "", agentScript: [NOTHING_FOUND_REPLY] });

          return main({ ...seams, direct: true }).then((result) => {
            expect(result.status).not.toBe("refused");
            expect(Array.from(result.reasons ?? [])).toContain("reclaimed-stale-lock");
            expect(Array.from(result.reasons ?? [])).not.toContain("consolidation-in-progress");
            expect(seams.fs.appends.some((a) => /reclaimed-stale-lock/.test(a.text) && /unknown/.test(a.text))).toBe(true);
          });
        });

        test("AT-M3 fixture (b): a marker line that is neither IN-PROGRESS: nor RELEASED: is also reclaimed, id unknown", () => {
          const seams = buildSeams({ ...oneFileCorpus(), markerText: "GARBAGE: not-a-real-line\n", agentScript: [NOTHING_FOUND_REPLY] });

          return main({ ...seams, direct: true }).then((result) => {
            expect(result.status).not.toBe("refused");
            expect(Array.from(result.reasons ?? [])).toContain("reclaimed-stale-lock");
            expect(seams.fs.appends.some((a) => /reclaimed-stale-lock/.test(a.text) && /unknown/.test(a.text))).toBe(true);
          });
        });
      });

      test("AT-M11: a RELEASED: marker, in two fixtures (seconds-old and older than staleLockMinutes) — on both, taken and the pass proceeds, no reclaimed-stale-lock and no consolidation-in-progress at either age", () => {
        const fixtures = [FRESH_AT, STALE_AT];

        return Promise.all(
          fixtures.map((atMs) => {
            const markerText = markerLine("released", HELD_PASS_ID, atMs);
            const seams = buildSeams({ ...oneFileCorpus(), markerText, agentScript: [NOTHING_FOUND_REPLY] });
            return main({ ...seams, direct: true }).then((result) => {
              // Positive: the marker was TAKEN by this pass, not merely "not refused". The
              // observable is that the pass wrote its own id over the released one — a pass that
              // bailed for any reason would leave `HELD_PASS_ID` in the file.
              const markerWrites = seams.fs.writes.filter((w) => w.path === MARKER_PATH);
              expect(markerWrites.length).toBeGreaterThan(0);
              expect(markerWrites[0].contents).toBe(`IN-PROGRESS: ${result.passId} ${new Date(FIXED_NOW_MS).toISOString()}`);
              expect(seams.fs.files[MARKER_PATH]).toBe(
                `RELEASED: ${result.passId} ${new Date(FIXED_NOW_MS).toISOString()}`
              );
              expect(result.passId).not.toBe(HELD_PASS_ID);

              // Positive: the terminal status is the one a nothing-found pass reaches, named —
              // `not.toBe("refused")` alone is also satisfied by `failed`.
              expect(result.status).toBe("no-op");

              const reasons = Array.from(result.reasons ?? []);
              expect(reasons).not.toContain("reclaimed-stale-lock");
              expect(reasons).not.toContain("consolidation-in-progress");
            });
          })
        );
      });

      test("AT-M4: neither advisory rung resolves at step 8 — failed, advisory-model-unresolved, the consumed pair from step 7 is present, and no §8.3 effectiveness table is appended", () => {
        const seams = buildSeams({
          ...oneFileCorpus(),
          agentScript: [`unrecognised model alias "fable"`, `unrecognised model alias "opus"`],
        });
        seams._agent = makeAgentDouble({
          script: [`unrecognised model alias "fable"`, `unrecognised model alias "opus"`],
          throwOn: new Set([0, 1]),
        });

        return main({ ...seams, direct: true }).then((result) => {
          expect(result.status).toBe("failed");
          expect(Array.from(result.reasons ?? [])).toContain("advisory-model-unresolved");
          // Step 7 (consumed pair) ran before step 8 (dispatch); step 11 (effectiveness table)
          // never ran — exactly two appends: the consumed pair and the terminal row.
          expect(seams.fs.appends).toHaveLength(2);
          expect(seams.fs.appends[0].text).toContain("pdlc:consumed");
        });
      });

      // AT-M7's main()-level leg. `consolidationRung.test.js` drives the §8.4 tee around the real
      // `resolveAdvisoryRung` and proves the resolver's line is retained and forwarded; what it
      // cannot reach from there is the other half of §8.4's obligation — that `main()` threads
      // that tee as the resolver's `_log` and folds `dispatchLog` into the rendered body. This row
      // is that half, and it is the one assertion that would go red if `main()` passed the
      // caller's raw sink (or a swallowing stub) instead of its tee.
      test("AT-M7 (main()-level): the primary rung fails to resolve, the fallback succeeds — the pass proceeds and the ADVISORY_MODEL_FALLBACK: line reaches the report body", () => {
        const aliasError = `unrecognised model alias "${MODEL_ADVISORY}"`;
        const seams = buildSeams({ ...oneFileCorpus(), agentScript: [aliasError, NOTHING_FOUND_REPLY] });
        seams._agent = makeAgentDouble({
          script: [aliasError, NOTHING_FOUND_REPLY],
          throwOn: new Set([0]),
        });

        return main({ ...seams, direct: true }).then((result) => {
          // M-2: resolution fell back rather than failing — a `failed`/`advisory-model-unresolved`
          // pass would satisfy a body assertion vacuously, since the halt message carries the same
          // line.
          expect(result.status).not.toBe("failed");
          expect(Array.from(result.reasons ?? [])).not.toContain("advisory-model-unresolved");
          expect(result.rung).toBe(MODEL_ADVISORY_FALLBACK);

          expect(result.body).toContain(
            `ADVISORY_MODEL_FALLBACK: "${MODEL_ADVISORY}" did not resolve — substituting "${MODEL_ADVISORY_FALLBACK}"`
          );
        });
      });

      test("AT-M5: the observed pathspec set of every commit is set-equal to the §5.4 write set, and never contains the lock path", () => {
        const seams = buildSeams({ ...oneFileCorpus(), agentScript: [NOTHING_FOUND_REPLY] });

        return main({ ...seams, direct: true }).then((result) => {
          const commitCalls = seams.git.calls.filter((argv) => argv[0] === "add" || argv[0] === "commit");
          expect(commitCalls.length).toBeGreaterThan(0);

          const writeSet = new Set(result.writeSet);
          expect(writeSet.size).toBeGreaterThan(0); // the equality below is not vacuous on ∅

          const observed = new Set();
          for (const argv of commitCalls) {
            const dashIndex = argv.indexOf("--");
            const pathspec = dashIndex === -1 ? [] : argv.slice(dashIndex + 1);
            // Per call: the marker path is never in a pathspec (§5.4's exclusion conjunct).
            expect(pathspec).not.toContain(MARKER_PATH);
            for (const p of pathspec) observed.add(p);
          }

          // The title's actual claim: set-EQUALITY against §5.4's write set, asserted in both
          // directions. Containment either way would pass with a member dropped — the observed
          // side missing a written path (an uncommitted write), or the write set missing an
          // observed one (a path committed that the pass never recorded writing).
          expect([...observed].sort()).toEqual([...writeSet].sort());
          expect(writeSet.has(MARKER_PATH)).toBe(false);

          // The spec-anchored side. Everything above compares the run against itself: both sides of
          // the equality are produced by the same pass, so a pass that committed the wrong path and
          // recorded that same wrong path in its write set would satisfy it. §5.4's table names four
          // possible members, and three of them are conditional on work this fixture does not do —
          // no AC-2.1 promotion (`DOMAIN-CONSTRAINTS.md`), no AC-2.2 promotion
          // (`DECISIONS-{topic}.md`), no §5.3 proposal (`CONSOLIDATION-PROPOSAL-{passId}.md`). What
          // remains for a nothing-found pass is the fourth: the log, carrying the §3.3 consumed pair
          // and the §10 terminal row. So the literal set is derivable from the FSPEC without running
          // anything, and it is asserted as a literal.
          expect(result.status).toBe("no-op"); // the branch the derivation above assumes
          expect([...observed].sort()).toEqual([LOG_PATH]);
        });
      });

      test("AT-M6: a first (clustering) dispatch that fails for a reason that is not model resolution — failed, no reason code, the error's message verbatim in the report body, marker released, consumed pair present, and nothing step 11 would have appended", () => {
        const seams = buildSeams({ ...oneFileCorpus(), agentScript: ["boom: transient network failure"] });
        seams._agent = makeAgentDouble({ script: ["boom: transient network failure"], throwOn: new Set([0]) });

        return main({ ...seams, direct: true }).then((result) => {
          expect(result.status).toBe("failed");
          expect(Array.from(result.reasons ?? [])).toHaveLength(0);
          expect(result.body).toContain("boom: transient network failure");
          expect(seams.fs.appends).toHaveLength(2); // consumed pair + terminal row, nothing else
          expect(seams.fs.appends[0].text).toContain("pdlc:consumed");
          // Marker released: the write double's last recorded marker content is the RELEASED: form.
          const markerWrites = seams.fs.writes.filter((w) => w.path === MARKER_PATH);
          expect(markerWrites.length).toBeGreaterThan(0);
          expect(markerWrites[markerWrites.length - 1].contents).toMatch(/^RELEASED: /);
        });
      });

      test("AT-M6b: refused at step 6 (marker held and fresh) — the log carries exactly one appended record, the terminal row: no effectiveness table, no consumed pair", () => {
        const markerText = markerLine("in-progress", HELD_PASS_ID, FRESH_AT);
        const seams = buildSeams({ ...oneFileCorpus(), markerText, agentScript: [] });

        return main({ ...seams, direct: true }).then((result) => {
          expect(result.status).toBe("refused");
          expect(seams.fs.appends).toHaveLength(1);
          expect(seams.fs.appends[0].text).not.toContain("pdlc:consumed");
        });
      });

      // ─── AT-M9 ────────────────────────────────────────────────────────
      //
      // The fixture reaches step 13 for real. Both grammars this row depends on are landed and
      // read off HEAD rather than guessed at:
      //
      //   * the clustering reply's grammar is `deriveProposals`' own — JSON
      //     `{clusters: [{phase, artifact, kind, action, symptom, diff, evidence}]}`
      //     (`consolidate-learnings.js:928-957`); a cluster whose `diff` is absent derives a
      //     proposal with `diff: null` (`:948`), which is exactly the proposal that needs
      //     authoring at step 13;
      //   * `artifact: "pdlc/workflows/orchestrate-dev.js"` with `kind: 3` gives
      //     `targetFor` the artifact itself (`:1301-1305`), which `routeOf` classifies `PR`
      //     because it is under the `MERGE_GUARD_DEFAULTS` prefix `pdlc/workflows/`
      //     (`orchestrate-dev.js:48-53`, `consolidate-learnings.js:1657-1665`) — so
      //     `routeProposal` routes it `PR` (`:1675-1680`) and the pass enters the
      //     `prProposals.length > 0` arm.
      //
      // The second dispatch then throws. Because step 8 already resolved the rung,
      // `resolveAdvisoryRung` returns `{kind: "dispatch-error"}` rather than throwing
      // (`orchestrate-dev.js:1876-1879`), which is §2.6 row 4's arm: `failed` with NO reason
      // code. That distinction is what separates this row from AT-M4/AT-M6, and it is asserted
      // rather than assumed — a fixture that threw before the rung resolved would take the
      // `advisory-model-unresolved` arm and this row's second conjunct would be red.
      test("AT-M9: step-8 dispatch succeeds, step-13 proposal-authoring dispatch fails — failed, no reason code, §8.3 effectiveness table IS appended (step 11 completed), marker released, error verbatim in the report body", () => {
        // A prior record in the log is what gives step 11's effectiveness table a row to render;
        // without one the table is empty and `finishPass` appends nothing (`:978-985`), so
        // conjunct 3 would be vacuous. Its `(failureModeId, action)` pair is deliberately NOT the
        // pair this pass proposes — an enacting record for the same pair would suppress the
        // proposal at step 12 (`enactedByLog`, `:1690`) and step 13 would never be reached.
        const PRIOR_ID = "t-docs-feat-b-tspec-feat-b-md";
        const priorRecord = [
          `failure-mode-id: ${PRIOR_ID}`,
          "phase: T",
          "symptom: an earlier pass promoted this one",
          "artifact: docs/feat-b/TSPEC-feat-b.md",
          "target: docs/_constraints/DOMAIN-CONSTRAINTS.md",
          "passId: 2024-01-01-1",
          "action: promote",
          "route: constraints",
        ].join("\n");
        const CLUSTER_REPLY = JSON.stringify({
          clusters: [
            {
              phase: "T",
              artifact: "pdlc/workflows/orchestrate-dev.js",
              kind: 3,
              action: "promote",
              symptom: "the reviewer missed the missing edge case",
              // AC-2.3's bar, in the shape `clearsPatternBar` reads: two distinct features.
              // A bare string fails the bar and would be diverted to the proposal file at
              // step 13 before any authoring dispatch, so this row would never reach the
              // dispatch failure it is about.
              evidence: { recurrence: ["feat-a", "feat-b"] },
              // no `diff` — this is what makes step 13 dispatch an authoring call
            },
          ],
        });
        const AUTHORING_ERROR = "boom: authoring dispatch failed";

        const base = oneFileCorpus();
        const seams = buildSeams({
          ...base,
          // A present, non-empty advisory corpus, so step 10 adds neither `no-advisory-corpus` nor
          // `advisory-corpus-empty` and conjunct 2 can assert the reason set is empty outright
          // rather than empty-except-for-notes-this-row-is-not-about.
          bodies: {
            ...base.bodies,
            "docs/_queue/ESCALATIONS.md": buildEscalationsFixture([{ feature: "feat-a", seam: "A1" }]),
          },
          logText: `${priorRecord}\n\n`,
          agentScript: [CLUSTER_REPLY, AUTHORING_ERROR],
        });
        seams._agent = makeAgentDouble({
          script: [CLUSTER_REPLY, AUTHORING_ERROR],
          throwOn: new Set([1]),
        });
        // `buildSeams` scripts `_makeTempDir` to `null` (the §9.1 api-failure fixture every other
        // row here wants). This row needs the clone to OPEN, because the authoring dispatch lives
        // past `openClone` — with a null temp dir the pass degrades before step 13 and the
        // dispatch under test never happens.
        seams._makeTempDir = fakeMakeTempDir("/tmp/pdlc-consolidation-clone")._makeTempDir;

        return main({ ...seams, direct: true }).then((result) => {
          // (0) Step 13 was actually reached — two dispatches, the second one the authoring call
          // for the PR-route proposal. Without this conjunct every conjunct below could be
          // satisfied by a pass that never routed anything.
          expect(seams._agent.calls).toHaveLength(2);
          expect(seams._agent.calls[1].prompt).toContain("Author the promotion diff");
          expect(seams._agent.calls[1].prompt).toContain("t-pdlc-workflows-orchestrate-dev-js");

          // (1) failed
          expect(result.status).toBe("failed");
          // (2) NO reason code — §2.6 row 4, not E-19's `advisory-model-unresolved`
          expect(Array.from(result.reasons ?? [])).toHaveLength(0);
          // (3) the §8.3 effectiveness table IS appended — step 11 completed before step 13 failed
          const appended = seams.fs.appends.map((a) => a.text);
          expect(appended.some((t) => t.includes(PRIOR_ID) && /verdict:/.test(t))).toBe(true);
          // (4) the consumed pair from step 7 is still there
          expect(appended.some((t) => t.includes("pdlc:consumed"))).toBe(true);
          // (5) the marker is released, not left held. Asserted on the marker file's own bytes —
          // the durable observable a *later* pass reads (`markerVerdict` above) — rather than on
          // `result.markerHeld`, which `releaseMarker` (`:1279-1283`) does not clear and which no
          // report or row renders.
          const marker = seams.fs.files[MARKER_PATH];
          expect(marker).toMatch(new RegExp(`^RELEASED: ${result.passId} `));
          // (6) the dispatch error is in the report body verbatim
          expect(result.body).toContain(AUTHORING_ERROR);
          // (7) nothing was promoted — the pass opened no PR
          expect(result.prUrl ?? null).toBeNull();
        });
      });
    });

    // ═══════════════════════════════════════════════════════════════════
    // (no FSPEC AT) — TSPEC §12.2's own obligation: an unreadable corpus
    // entry is still treated correctly by the un-consolidated count, by
    // `renderConsumedPair`'s output, and by the report body's naming.
    // ═══════════════════════════════════════════════════════════════════
    test("(no FSPEC AT) an unreadable corpus entry, beside a readable one, is still counted un-consolidated, still named in the consumed pair, and still named in the report body", () => {
      const paths = ["docs/feat-a/LEARNINGS-feat-a.md", "docs/feat-b/LEARNINGS-feat-b.md"];
      const bodies = {
        // "feat-a" is omitted deliberately — `_readFile` reads it as `null` (absent-or-unreadable,
        // §5.2), modelling an unreadable corpus member exactly as AT-P8 models an unreadable log.
        "docs/feat-b/LEARNINGS-feat-b.md": "# LEARNINGS\n\n## 1. Domain / architectural invariant\nAlways validate at the boundary.\n",
      };
      const seams = buildSeams({ corpusPaths: paths, bodies, agentScript: ["no recurring failure mode pattern found across the corpus"] });

      return main({ ...seams, direct: true }).then((result) => {
        expect(seams.fs.appends.length).toBeGreaterThan(0);
        const consumedPair = seams.fs.appends[0].text;
        expect(consumedPair).toContain("pdlc:consumed");
        expect(consumedPair).toContain("LEARNINGS-feat-a.md");
        expect(consumedPair).toContain("LEARNINGS-feat-b.md");
        expect(result.body).toContain("LEARNINGS-feat-a.md");
        expect(result.body).toContain("LEARNINGS-feat-b.md");
      });
    });
  });
});
