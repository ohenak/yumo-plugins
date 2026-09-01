// statsOutcome.test.js — PLAN T-07 (pdlc-stats).
//
// Reds `runStats` over `fakeStatsIo` (TSPEC §3.3, §4.2, §5; FSPEC §3.1-3.3, §6): Flow A
// (single-feature), Flow B (fleet), Flow C (the human/json rendering fork both flows take);
// AT-03's subdirectory byte-identity; AT-04's single-JSON-document stdout; AT-20's two gap-row
// legs (B5's read failure and EC-21's catch-all); AT-26's fleet zero-state row; AT-27's fleet
// half plus its eight root-failure runs; and that `exitCode` is only ever `0` or `1`.
//
// `pdlc/workflows/lib/stats.mjs` ships `runStats`, and every test here runs against it. Each
// loads `runStats` via a dynamic `await import` inside the test body rather than a top-level
// import, so a load-time failure in the module surfaces as failing tests rather than as an
// uncollectable file.
//
// AT-27's single-feature half (the unreadable-feature leg run under single-feature mode) is
// T-09's CLI-process suite, not this file's — T-07 owns AT-27's fleet half and the eight
// root-failure runs only (PLAN traceability table: "AT-27 | T-07 (fleet + root-failure), T-09
// (single-feature)").

import {
  parseReviewFilename,
  deriveRoundWindow,
  deriveDodRoundIndex,
  parseResolvedMarker,
} from "../orchestrate-dev.js";
import { fakeStatsIo } from "./helpers/statsDoubles.js";

const REAL_PARSERS = Object.freeze({
  parseReviewFilename,
  deriveRoundWindow,
  deriveDodRoundIndex,
  parseResolvedMarker,
});

// A parser bundle identical to REAL_PARSERS except `deriveRoundWindow` throws whenever the
// basename list it is handed carries this sentinel — the EC-21 "anything else throws while
// computing one feature" fixture (TSPEC §5's catch-all row), deliberately independent of any
// `io` seam so it cannot be satisfied by a guard placed around `listDir` alone (AT-20's point).
const EXPLODE_MARKER = "TRIGGER-EC21-EXPLODE.marker";
const EXPLODING_PARSERS = Object.freeze({
  ...REAL_PARSERS,
  deriveRoundWindow(basenames, docType) {
    if (basenames.includes(EXPLODE_MARKER)) {
      throw new Error("statsOutcome fixture: simulated unexpected failure (EC-21)");
    }
    return deriveRoundWindow(basenames, docType);
  },
});

describe("T-16: Flow A — single-feature run (FSPEC §3.1)", () => {
  it("T-16: a readable feature directory produces one report on stdout, empty stderr, exit 0 (human mode)", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["pdlc-sample"], files: [] },
      "/repo/docs/pdlc-sample": { dirs: [], files: ["REQ-pdlc-sample.md"] },
      "/repo/docs/pdlc-sample/REQ-pdlc-sample.md": "contents",
    });

    const outcome = runStats({ argv: ["pdlc-sample"], io, parsers: REAL_PARSERS, cwd: "/repo" });

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stderr).toBe("");
    expect(outcome.stdout.length).toBeGreaterThan(0);
  });

  it("T-16: the same run under --json produces stdout that parses as the five-key single-feature document (Flow C)", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["pdlc-sample"], files: [] },
      "/repo/docs/pdlc-sample": { dirs: [], files: [] },
    });

    const outcome = runStats({
      argv: ["pdlc-sample", "--json"],
      io,
      parsers: REAL_PARSERS,
      cwd: "/repo",
    });

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stderr).toBe("");
    const doc = JSON.parse(outcome.stdout);
    expect(Object.keys(doc).sort()).toEqual(
      ["byteRatio", "dodRounds", "halts", "reviewRounds", "schemaVersion"].sort()
    );
    expect(doc.schemaVersion).toBe(1);
  });
});

describe("T-16: Flow B — fleet run (FSPEC §3.2)", () => {
  it("T-16: a docs root with two feature directories produces a fleet report on stdout, exit 0 (human mode)", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["feature-a", "feature-b"], files: [] },
      "/repo/docs/feature-a": { dirs: [], files: [] },
      "/repo/docs/feature-b": { dirs: [], files: [] },
    });

    const outcome = runStats({ argv: [], io, parsers: REAL_PARSERS, cwd: "/repo" });

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stdout).toEqual(expect.stringContaining("feature-a"));
    expect(outcome.stdout).toEqual(expect.stringContaining("feature-b"));
  });

  it("T-16: the same fleet run under --json produces stdout parsing as the three-key fleet document (Flow C)", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["feature-a", "feature-b"], files: [] },
      "/repo/docs/feature-a": { dirs: [], files: [] },
      "/repo/docs/feature-b": { dirs: [], files: [] },
    });

    const outcome = runStats({ argv: ["--json"], io, parsers: REAL_PARSERS, cwd: "/repo" });

    expect(outcome.exitCode).toBe(0);
    const doc = JSON.parse(outcome.stdout);
    expect(Object.keys(doc).sort()).toEqual(["features", "schemaVersion", "unclassified"].sort());
    expect(Object.keys(doc.features).sort()).toEqual(["feature-a", "feature-b"]);
    expect(doc.unclassified).toEqual([]);
  });
});

describe("T-16: AT-03 — a subdirectory contributes nothing (BR-03, EC-04)", () => {
  it("T-16: stdout is byte-identical whether or not the feature directory carries a subdirectory of artifact-named files", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const args = (io) => ({ argv: ["pdlc-sample"], io, parsers: REAL_PARSERS, cwd: "/repo" });

    const withoutSubdir = fakeStatsIo({
      "/repo/docs": { dirs: ["pdlc-sample"], files: [] },
      "/repo/docs/pdlc-sample": { dirs: [], files: ["REQ-pdlc-sample.md"] },
      "/repo/docs/pdlc-sample/REQ-pdlc-sample.md": "one",
    });

    const withSubdir = fakeStatsIo({
      "/repo/docs": { dirs: ["pdlc-sample"], files: [] },
      "/repo/docs/pdlc-sample": { dirs: ["nested"], files: ["REQ-pdlc-sample.md"] },
      "/repo/docs/pdlc-sample/REQ-pdlc-sample.md": "one",
      "/repo/docs/pdlc-sample/nested": {
        dirs: [],
        files: ["REQ-pdlc-sample.md", "CROSS-REVIEW-test-engineer-TSPEC-v9.md"],
      },
      "/repo/docs/pdlc-sample/nested/REQ-pdlc-sample.md":
        "much larger contents that would change any byte total if it were ever read",
      "/repo/docs/pdlc-sample/nested/CROSS-REVIEW-test-engineer-TSPEC-v9.md":
        "also would change totals if it were ever counted",
    });

    const a = runStats(args(withoutSubdir));
    const b = runStats(args(withSubdir));

    expect(b.stdout).toBe(a.stdout);
    expect(b.stderr).toBe(a.stderr);
    expect(b.exitCode).toBe(a.exitCode);
  });
});

describe("T-16: AT-04 — stdout is exactly one JSON document (BR-20)", () => {
  it("T-16: --json stdout parses as a single document with no surrounding text and empty stderr, exit 0", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["pdlc-sample"], files: [] },
      "/repo/docs/pdlc-sample": { dirs: [], files: [] },
    });

    const outcome = runStats({
      argv: ["pdlc-sample", "--json"],
      io,
      parsers: REAL_PARSERS,
      cwd: "/repo",
    });

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stderr).toBe("");
    // JSON.parse throws on any leading/trailing non-whitespace garbage, so a clean parse here
    // is itself the "no surrounding text" assertion.
    expect(() => JSON.parse(outcome.stdout)).not.toThrow();
  });
});

describe("T-16: AT-20 — gap rows are rows, and one bad feature does not sink the fleet", () => {
  it("T-16: B5's read failure — a fleet feature whose directory cannot be listed becomes a gap row; every other feature is still reported; exit 0", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo(
      {
        "/repo/docs": { dirs: ["good-feature", "bad-feature"], files: [] },
        "/repo/docs/good-feature": { dirs: [], files: [] },
        "/repo/docs/bad-feature": { dirs: [], files: [] },
      },
      { throwOn: { listDir: ["/repo/docs/bad-feature"] } }
    );

    const outcome = runStats({ argv: ["--json"], io, parsers: REAL_PARSERS, cwd: "/repo" });

    expect(outcome.exitCode).toBe(0);
    const doc = JSON.parse(outcome.stdout);
    expect(doc.features["bad-feature"]).toEqual({ gap: expect.any(String) });
    expect(doc.features["good-feature"].reviewRounds).toBeDefined();
  });

  it("T-16: EC-21's catch-all — a fleet feature whose directory reads fine but whose metric computation throws unexpectedly also becomes a gap row; every other feature is still reported; exit 0 (a guard placed around `listDir` alone must not pass this leg)", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["good-feature", "bad-feature"], files: [] },
      "/repo/docs/good-feature": { dirs: [], files: [] },
      "/repo/docs/bad-feature": { dirs: [], files: [EXPLODE_MARKER] },
      [`/repo/docs/bad-feature/${EXPLODE_MARKER}`]: "",
    });

    const outcome = runStats({ argv: ["--json"], io, parsers: EXPLODING_PARSERS, cwd: "/repo" });

    expect(outcome.exitCode).toBe(0);
    const doc = JSON.parse(outcome.stdout);
    expect(doc.features["bad-feature"]).toEqual({ gap: expect.any(String) });
    expect(doc.features["good-feature"].reviewRounds).toBeDefined();
  });
});

describe("T-16: AT-26 — an empty feature directory is a measurement, not a gap", () => {
  it("T-16: a readable, empty feature directory is a normal fleet row — no gap marker, zero-state metrics, exit 0", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo({
      "/repo/docs": { dirs: ["empty-feature"], files: [] },
      "/repo/docs/empty-feature": { dirs: [], files: [] },
    });

    const outcome = runStats({ argv: ["--json"], io, parsers: REAL_PARSERS, cwd: "/repo" });

    expect(outcome.exitCode).toBe(0);
    const doc = JSON.parse(outcome.stdout);
    const row = doc.features["empty-feature"];
    expect(row.gap).toBeUndefined();
    expect(row.dodRounds).toEqual({ state: "measured", rounds: 0 });
    expect(row.halts).toEqual([]);
    expect(row.byteRatio.state).toBe("unavailable");
    for (const docType of ["REQ", "FSPEC", "TSPEC", "PLAN", "PROPERTIES", "DECISIONS"]) {
      expect(row.reviewRounds.byDocType[docType]).toEqual({
        state: "measured",
        rounds: 0,
        collidingRole: null,
      });
    }
  });
});

describe("T-16: AT-27 — an unreadable feature directory gaps the fleet (fleet half; single-feature half is T-09)", () => {
  it("T-16: the fleet run carries the unreadable feature as a gap row, reports every other feature normally, and exits 0", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo(
      {
        "/repo/docs": { dirs: ["ok-feature", "broken-feature"], files: [] },
        "/repo/docs/ok-feature": { dirs: [], files: [] },
        "/repo/docs/broken-feature": { dirs: [], files: [] },
      },
      { throwOn: { listDir: ["/repo/docs/broken-feature"] } }
    );

    const outcome = runStats({ argv: [], io, parsers: REAL_PARSERS, cwd: "/repo" });

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stdout).toEqual(expect.stringContaining("broken-feature"));
    expect(outcome.stdout).toEqual(expect.stringContaining("ok-feature"));
  });

  it("T-16: the fleet run under --json carries the unreadable feature as the single-key {gap} entry, distinct from a metrics object", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const io = fakeStatsIo(
      {
        "/repo/docs": { dirs: ["ok-feature", "broken-feature"], files: [] },
        "/repo/docs/ok-feature": { dirs: [], files: [] },
        "/repo/docs/broken-feature": { dirs: [], files: [] },
      },
      { throwOn: { listDir: ["/repo/docs/broken-feature"] } }
    );

    const outcome = runStats({ argv: ["--json"], io, parsers: REAL_PARSERS, cwd: "/repo" });

    expect(outcome.exitCode).toBe(0);
    const doc = JSON.parse(outcome.stdout);
    expect(Object.keys(doc.features["broken-feature"])).toEqual(["gap"]);
  });
});

describe("T-16: AT-27 — the eight root-failure runs ({docs root absent, unreadable} × {single-feature, fleet} × {human, json})", () => {
  const rootScenarios = [
    // `clause` is AT-27's positive condition conjunct: each human-mode message must
    // carry the clause matching its own condition, so swapping the two branch bodies
    // in `docsRootStatus` fails rather than merely permuting two non-identical strings.
    { label: "absent", clause: /docs root not found:/, buildIo: () => fakeStatsIo({}) },
    {
      label: "unreadable",
      clause: /docs root unreadable:/,
      buildIo: () =>
        fakeStatsIo(
          { "/repo/docs": { dirs: [], files: [] } },
          { throwOn: { listDir: ["/repo/docs"] } }
        ),
    },
  ];
  const modeScenarios = [
    { label: "single-feature", argv: ["pdlc-sample"], feature: "pdlc-sample" },
    { label: "fleet", argv: [], feature: null },
  ];
  const renderScenarios = [
    { label: "human", jsonFlag: [] },
    { label: "json", jsonFlag: ["--json"] },
  ];

  for (const root of rootScenarios) {
    for (const mode of modeScenarios) {
      for (const render of renderScenarios) {
        // The title is inlined as a template literal (never a variable): the wave
        // un-skip guard attributes a skip token to the task named in its first
        // string argument, and a variable here would fall back to this file's
        // red owner and halt the wave.
        it(`T-16: docs root ${root.label}, ${mode.label} mode, ${render.label} rendering — exit 1, the correct-condition message, and never EC-01's not_found`, async () => {
          const { runStats } = await import("../lib/stats.mjs");
          const io = root.buildIo();

          const outcome = runStats({
            argv: [...mode.argv, ...render.jsonFlag],
            io,
            parsers: REAL_PARSERS,
            cwd: "/repo",
          });

          expect(outcome.exitCode).toBe(1);

          if (render.label === "json") {
            const doc = JSON.parse(outcome.stdout);
            expect(Object.keys(doc).sort()).toEqual(["error", "feature", "schemaVersion"].sort());
            expect(doc.error.reason).toBe("no_docs_root");
            expect(doc.error.reason).not.toBe("not_found");
            expect(doc.feature).toBe(mode.feature);
          } else {
            expect(outcome.stdout).toBe("");
            expect(outcome.stderr).toEqual(expect.stringContaining("/repo/docs"));
            // AT-27 / PROP-ERR-03: the positive condition conjunct, and the human-mode
            // half of "no message is EC-01's not-found message".
            expect(outcome.stderr).toMatch(root.clause);
            expect(outcome.stderr).not.toMatch(/feature not found:/);
          }
        });
      }
    }
  }

  it("T-16: the absent-root message and the unreadable-root message are not byte-identical (single-feature, human mode)", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const absentOutcome = runStats({
      argv: ["pdlc-sample"],
      io: fakeStatsIo({}),
      parsers: REAL_PARSERS,
      cwd: "/repo",
    });
    const unreadableOutcome = runStats({
      argv: ["pdlc-sample"],
      io: fakeStatsIo(
        { "/repo/docs": { dirs: [], files: [] } },
        { throwOn: { listDir: ["/repo/docs"] } }
      ),
      parsers: REAL_PARSERS,
      cwd: "/repo",
    });

    expect(absentOutcome.stderr).not.toBe(unreadableOutcome.stderr);
  });
});

describe("T-16: exit codes are 0 or 1 only", () => {
  it("T-16: a representative sweep of decided scenarios never yields an exitCode outside {0, 1}", async () => {
    const { runStats } = await import("../lib/stats.mjs");
    const outcomes = [
      runStats({
        argv: ["pdlc-sample"],
        io: fakeStatsIo({
          "/repo/docs": { dirs: ["pdlc-sample"], files: [] },
          "/repo/docs/pdlc-sample": { dirs: [], files: [] },
        }),
        parsers: REAL_PARSERS,
        cwd: "/repo",
      }),
      runStats({
        argv: ["unknown-feature"],
        io: fakeStatsIo({ "/repo/docs": { dirs: [], files: [] } }),
        parsers: REAL_PARSERS,
        cwd: "/repo",
      }),
      runStats({ argv: [], io: fakeStatsIo({}), parsers: REAL_PARSERS, cwd: "/repo" }),
      runStats({ argv: ["a", "b"], io: fakeStatsIo({}), parsers: REAL_PARSERS, cwd: "/repo" }),
    ];

    for (const outcome of outcomes) {
      expect([0, 1]).toContain(outcome.exitCode);
    }
  });
});
