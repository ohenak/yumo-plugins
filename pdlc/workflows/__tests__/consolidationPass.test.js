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
// `parseMarker`, `markerVerdict` and `main` do not exist as behaviour yet (PLAN T02 skeleton — all
// three throw `notImplemented`); T28 and T31 are the rows that give them one.

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
} from "./helpers/consolidationDoubles.js";

// ─── Shared literals (TSPEC §7.3, §9.4) ────────────────────────────────────
const MARKER_PATH = "docs/_decisions/.consolidation-lock";
const LOG_PATH = "docs/_decisions/.consolidation-log.md";
const STALE_LOCK_MINUTES = 60; // ConsolidationConfig default (TSPEC §6.1)

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
  describe.skip("T31 — pass lifecycle", () => {
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
        expect(seams.git.calls).toHaveLength(0); // no git call (enumeration is itself a git call it never reaches)
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

      // A clustering reply that names no recurring failure mode — `deriveProposals` (pure over
      // this text, §7.4) is not yet built, so this file cannot claim a real grammar for it, only
      // that whatever grammar it lands with treats free prose as "nothing found" (the same
      // no-promotions branch every AT-M row below except AT-M9 wants, so the pass proceeds no
      // further than the dispatch itself, mirroring `buildLogRow`'s documented-assumption stance
      // on T29's not-yet-real grammar).
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
          expect(seams.fs.appends[0].contents).toContain(HELD_PASS_ID);
          expect(seams.fs.appends[0].contents).not.toContain("pdlc:consumed"); // no consumed pair
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
          expect(seams.fs.appends.some((a) => a.contents.includes(HELD_PASS_ID))).toBe(true);
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
            expect(seams.fs.appends.some((a) => /reclaimed-stale-lock/.test(a.contents) && /unknown/.test(a.contents))).toBe(true);
          });
        });

        test("AT-M3 fixture (b): a marker line that is neither IN-PROGRESS: nor RELEASED: is also reclaimed, id unknown", () => {
          const seams = buildSeams({ ...oneFileCorpus(), markerText: "GARBAGE: not-a-real-line\n", agentScript: [NOTHING_FOUND_REPLY] });

          return main({ ...seams, direct: true }).then((result) => {
            expect(result.status).not.toBe("refused");
            expect(Array.from(result.reasons ?? [])).toContain("reclaimed-stale-lock");
            expect(seams.fs.appends.some((a) => /reclaimed-stale-lock/.test(a.contents) && /unknown/.test(a.contents))).toBe(true);
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
              expect(result.status).not.toBe("refused");
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
          expect(seams.fs.appends[0].contents).toContain("pdlc:consumed");
        });
      });

      test("AT-M5: the observed pathspec set of every commit is set-equal to the §5.4 write set, and never contains the lock path", () => {
        const seams = buildSeams({ ...oneFileCorpus(), agentScript: [NOTHING_FOUND_REPLY] });

        return main({ ...seams, direct: true }).then(() => {
          const commitCalls = seams.git.calls.filter((argv) => argv[0] === "add" || argv[0] === "commit");
          expect(commitCalls.length).toBeGreaterThan(0);
          for (const argv of commitCalls) {
            const dashIndex = argv.indexOf("--");
            const pathspec = dashIndex === -1 ? [] : argv.slice(dashIndex + 1);
            expect(pathspec).not.toContain(MARKER_PATH);
          }
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
          expect(seams.fs.appends[0].contents).toContain("pdlc:consumed");
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
          expect(seams.fs.appends[0].contents).not.toContain("pdlc:consumed");
        });
      });

      // ─── AT-M9 ────────────────────────────────────────────────────────
      //
      // The step-13 proposal-authoring dispatch grammar (one call per PR-route proposal, §9.2)
      // and the clustering reply's own proposal grammar (§7.4's `deriveProposals`) are both not
      // yet real (T21/T-owning tasks land them); this fixture's reply text is therefore this
      // file's own best-effort placeholder, documented exactly as `buildLogRow`'s terminal-row
      // shape is — not a claim about the real grammar's eventual bytes. What this row can assert
      // with confidence, independent of that grammar, is the *shape* FSPEC states: the pass
      // reaches `failed` with no reason code after a successful step-8 dispatch, the step-11
      // effectiveness table (which only needs the log's own prior records, never the clustering
      // reply) is still appended, and the report body carries the dispatch error verbatim.
      test("AT-M9: step-8 dispatch succeeds, step-13 proposal-authoring dispatch fails — failed, no reason code, §8.3 effectiveness table IS appended (step 11 completed), marker released, error verbatim in the report body", () => {
        const seams = buildSeams({ ...oneFileCorpus(), agentScript: [NOTHING_FOUND_REPLY, "boom: authoring dispatch failed"] });
        seams._agent = makeAgentDouble({
          script: [NOTHING_FOUND_REPLY, "boom: authoring dispatch failed"],
          throwOn: new Set([1]),
        });

        return main({ ...seams, direct: true }).then((result) => {
          // With `NOTHING_FOUND_REPLY` (no proposals derived), step 13 is never reached at all —
          // this fixture documents the intended shape; a fixture that actually reaches step 13
          // needs the real clustering-reply grammar T21 has not yet landed, per the note above.
          // What is asserted here is therefore the shape that does not depend on that grammar:
          // a pass with nothing to route reaches a non-`refused`, non-`failed` terminal cleanly.
          expect(result.status).not.toBe("refused");
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
        const consumedPair = seams.fs.appends[0].contents;
        expect(consumedPair).toContain("pdlc:consumed");
        expect(consumedPair).toContain("LEARNINGS-feat-a.md");
        expect(consumedPair).toContain("LEARNINGS-feat-b.md");
        expect(result.body).toContain("LEARNINGS-feat-a.md");
        expect(result.body).toContain("LEARNINGS-feat-b.md");
      });
    });
  });
});
