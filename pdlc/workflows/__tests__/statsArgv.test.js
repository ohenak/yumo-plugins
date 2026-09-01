// T-03: `parseStatsArgv` reds (PLAN T-03; TSPEC §3.3; FSPEC AT-24 parser half).
//
// `pdlc/workflows/lib/stats.mjs` ships `parseStatsArgv`, and every test here runs against it.
// Each loads the module via a dynamic `import()` inside the test body rather than a top-level
// import, so a load-time failure in the module surfaces as one failing test rather than as an
// uncollectable file.
//
// Scope per PLAN's AT-10 split: T-03 owns the *parser* half of AT-24 — `parseStatsArgv`'s own
// total, pure, closed-surface contract (TSPEC §3.3's `parseStatsArgv` type) and the two-positionals
// refusal it is responsible for (TSPEC §5 row 2, BR-01). The CLI-process half of AT-24 (`--dev`,
// `--plugin-root`, `--dry-run`, `--cwd` with no value, refused via `validateFlags`/`checkFlags`
// before `cmdStats` ever runs, with empty stdout asserted) belongs to T-09's process-level suite,
// not here.

describe("T-03: parseStatsArgv", () => {
  describe("T-03: accepts the closed surface — no args, a feature, --json, --cwd", () => {
    it("T-12: no argv yields ok:true with feature null, json false, cwd null", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      expect(parseStatsArgv([])).toEqual({
        ok: true,
        feature: null,
        json: false,
        cwd: null,
      });
    });

    it("T-12: a single positional is taken as the feature name", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      expect(parseStatsArgv(["pdlc-stats"])).toEqual({
        ok: true,
        feature: "pdlc-stats",
        json: false,
        cwd: null,
      });
    });

    it("T-12: --json sets json true with no feature", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      expect(parseStatsArgv(["--json"])).toEqual({
        ok: true,
        feature: null,
        json: true,
        cwd: null,
      });
    });

    it("T-12: --cwd <path> sets cwd to the value token, consumed rather than read as a positional", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      expect(parseStatsArgv(["--cwd", "/tmp/some-repo"])).toEqual({
        ok: true,
        feature: null,
        json: false,
        cwd: "/tmp/some-repo",
      });
    });

    it("T-12: feature, --json and --cwd combine in one ok:true result", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      expect(parseStatsArgv(["pdlc-stats", "--json", "--cwd", "/tmp/some-repo"])).toEqual({
        ok: true,
        feature: "pdlc-stats",
        json: true,
        cwd: "/tmp/some-repo",
      });
    });
  });

  describe("T-03: two-positionals refusal (AT-24 parser half, TSPEC §5 row 2, BR-01)", () => {
    it("T-12: two positionals yields ok:false naming the offending second positional", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      const result = parseStatsArgv(["a", "b"]);

      expect(result.ok).toBe(false);
      expect(result.message).toEqual(expect.stringContaining("b"));
    });

    it("T-12: three or more positionals still refuse with the same {ok:false} shape", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      const result = parseStatsArgv(["a", "b", "c"]);

      expect(result.ok).toBe(false);
      expect(typeof result.message).toBe("string");
    });
  });

  describe("T-03: the {ok:false,message} shape is closed (BR-01's closed surface)", () => {
    it("T-12: an ok:true result carries exactly feature, json and cwd alongside ok — no extra keys", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      const result = parseStatsArgv(["pdlc-stats", "--json"]);

      expect(result.ok).toBe(true);
      expect(Object.keys(result).sort()).toEqual(["cwd", "feature", "json", "ok"]);
    });

    it("T-12: an ok:false result carries exactly message alongside ok — no extra keys, no feature/json/cwd leak", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      const result = parseStatsArgv(["a", "b"]);

      expect(result.ok).toBe(false);
      expect(Object.keys(result).sort()).toEqual(["message", "ok"]);
      expect(typeof result.message).toBe("string");
    });
  });

  describe("T-03: total — never throws", () => {
    it("T-12: an empty-string positional and an unrecognised bare token still return a value, not a throw", async () => {
      const { parseStatsArgv } = await import("../lib/stats.mjs");

      expect(() => parseStatsArgv(["", "--unknown-but-not-this-fn's-job"])).not.toThrow();
    });
  });
});
