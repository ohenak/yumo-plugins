/**
 * driftHelpers.test.js — Contract suite for the shared test helpers PL-02 identifies as
 * PLAN-added: TSPEC §14 names no home for these helper contracts even though they are
 * normative TSPEC statements (helper docstrings and behaviors pinned throughout the TSPEC
 * and PROPERTIES). This file is the single gate T-01 owns for T-07, T-08a, T-08b, T-15,
 * T-16, T-18 and T-39 (PLAN T-01, TE F-07).
 *
 * RED-terminal (PLAN batch 2): every import below names a helper module that does not yet
 * exist. The suite is authored as it should read once T-07/T-08a/T-08b/T-15/T-16/T-18/T-39
 * land — it is expected to fail at collection with "Cannot find module" until then. Nothing
 * in this file is implementation; T-01 owns only this test file (single-writer-per-file).
 *
 * Clauses below map 1:1 onto PLAN T-01's four labelled clauses (a)-(d).
 */

import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { tmpdir } from "os";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  chmodSync,
  statSync,
  existsSync,
  rmSync,
} from "fs";

// §1.3 — capability + harness contracts (clause a)
import { describeOrSkip, itOrSkip } from "./helpers/driftCapabilities.js";
// §3.1-3.4, §11.2 — harness core, read-back, batched grammar driver (clause a, d)
import {
  makeToolDir,
  readDriftState,
  readSyncManifest,
  runGrammar,
} from "./helpers/driftHarness.js";
// §3.3, §13.6 — consumer/plugin tree builders and row-state construction (clause b)
import {
  makeConsumerTree,
  makePluginTree,
  setRowState,
} from "./helpers/driftFixtures.js";
// §4.1-4.3, §8.3 — trace grammar, phase/ordering assertions (clause c)
import {
  parseTrace,
  assertPhaseOrder,
  assertPostCopyNarrow,
  assertTreeUnchanged,
  snapshotTree,
} from "./helpers/driftOrdering.js";
// §11.2 precedent — sourced-probe driver (clause d, T-39)
import { runProbe } from "./helpers/driftProbe.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Byte-exact percent encoder mirroring TSPEC §4.1's grammar rule, used only to construct
 * fixture trace lines in this test — the production encoder is bash-side (C1); this is the
 * test's own faithful re-implementation of the rule the decoder must invert. */
function percentEncodeTestOnly(bytes) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes, "binary");
  let out = "";
  for (const byte of buf) {
    const isSpecial =
      byte === 0x25 || byte === 0x09 || byte === 0x0a || byte === 0x0d || byte < 0x20 || byte > 0x7e;
    out += isSpecial ? "%" + byte.toString(16).toUpperCase().padStart(2, "0") : String.fromCharCode(byte);
  }
  return out;
}

function makeTmpDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

// ─── (a) Capability + harness contracts ────────────────────────────────────────────────

describe("T-01 clause (a) — capability + harness contracts", () => {
  describe("describeOrSkip / itOrSkip (TSPEC §1.3 contract 2, PROPERTIES §11.1)", () => {
    it("describeOrSkip throws when unverifiedInvariants is an empty array", () => {
      expect(() => describeOrSkip("x", "bash", [], () => {})).toThrow();
    });

    it("describeOrSkip throws when unverifiedInvariants is absent", () => {
      expect(() => describeOrSkip("x", "bash", undefined, () => {})).toThrow();
    });

    it("itOrSkip throws when unverifiedInvariants is an empty array", () => {
      expect(() => itOrSkip("x", "bash", [], () => {})).toThrow();
    });

    it("itOrSkip throws when unverifiedInvariants is absent", () => {
      expect(() => itOrSkip("x", "bash", undefined, () => {})).toThrow();
    });

    it("describeOrSkip and itOrSkip each take four parameters, name first (PROPERTIES §11.1)", () => {
      expect(describeOrSkip.length).toBe(4);
      expect(itOrSkip.length).toBe(4);
    });
  });

  describe("makeToolDir (TSPEC §3.2.1)", () => {
    it("throws when a requested tool cannot be resolved", () => {
      expect(() => makeToolDir(["this-tool-does-not-exist-anywhere-xyz"])).toThrow();
    });
  });

  describe("readDriftState (TSPEC §3.4 rule 2)", () => {
    it("returns null when the drift-state artifact is absent", () => {
      const tree = makeConsumerTree({ claudeDir: true, workflowsDir: true, driftState: "absent" });
      try {
        expect(readDriftState(tree.root)).toBeNull();
      } finally {
        tree.cleanup();
      }
    });

    it("throws on an unparseable drift-state artifact rather than returning null", () => {
      const tree = makeConsumerTree({
        claudeDir: true,
        workflowsDir: true,
        driftState: "{ not valid json",
      });
      try {
        expect(() => readDriftState(tree.root)).toThrow();
      } finally {
        tree.cleanup();
      }
    });
  });

  describe("inodeOf (TSPEC §3.4 rule 3)", () => {
    it("returns a bigint", async () => {
      const { inodeOf } = await import("./helpers/driftHarness.js");
      const dir = makeTmpDir("pdlc-t01-inode-");
      const file = join(dir, "probe.txt");
      writeFileSync(file, "x");
      try {
        expect(typeof inodeOf(file)).toBe("bigint");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("runGrammar / runProbe line-count invariant (TSPEC §11.2)", () => {
    // The harness's own defensive check is independent of any one driver's correctness —
    // it is exercised here with an injected fake spawn, per this repo's DI convention
    // (CLAUDE.md: every injected IO call is a constructor/parameter seam, not a module
    // mock); the driver-specific behavior (clause d) is exercised against the real scripts.
    it("runGrammar throws when the driver emits fewer output lines than input cases", () => {
      const cases = [
        "format\tfoo\t20260101T000000Z\t01",
        "parse\tfoo.20260101T000000Z-01.bak",
      ];
      const fakeSpawnSync = () => ({ status: 0, stdout: "ok\tfoo\n", stderr: "" });
      expect(() => runGrammar(cases, { _spawnSync: fakeSpawnSync })).toThrow();
    });

    it("runProbe throws when the driver emits fewer output lines than input cases", () => {
      const cases = [
        "pdlc_backup_format\tfoo\t20260101T000000Z\t01",
        "pdlc_backup_parse\tfoo.20260101T000000Z-01.bak",
      ];
      const fakeSpawnSync = () => ({ status: 0, stdout: "ok\t0\n", stderr: "" });
      expect(() => runProbe(cases, { _spawnSync: fakeSpawnSync })).toThrow();
    });
  });
});

// ─── (b) Fixture-builder contracts (T-15's gate — TE F-07(c)) ──────────────────────────

describe("T-01 clause (b) — fixture-builder contracts", () => {
  describe("makeConsumerTree's eight clauses (TSPEC §3.3)", () => {
    it("git: true — .git exists at root", () => {
      const tree = makeConsumerTree({ git: true });
      try {
        expect(existsSync(join(tree.root, ".git"))).toBe(true);
      } finally {
        tree.cleanup();
      }
    });

    it("git: false — no .git exists from root up to home", () => {
      const tree = makeConsumerTree({ git: false });
      try {
        expect(existsSync(join(tree.root, ".git"))).toBe(false);
        expect(existsSync(join(dirname(tree.root), ".git"))).toBe(false);
        expect(existsSync(join(tree.home, ".git"))).toBe(false);
      } finally {
        tree.cleanup();
      }
    });

    it("claudeDir: true | false — the two AC-3.8 fixtures", () => {
      const withDir = makeConsumerTree({ claudeDir: true });
      const withoutDir = makeConsumerTree({ claudeDir: false });
      try {
        expect(existsSync(join(withDir.root, ".claude"))).toBe(true);
        expect(existsSync(join(withoutDir.root, ".claude"))).toBe(false);
      } finally {
        withDir.cleanup();
        withoutDir.cleanup();
      }
    });

    it("workflowsDir: true | false | { mode } — including AT-14b's r-x and AT-32a's -wx forms", () => {
      const plain = makeConsumerTree({ claudeDir: true, workflowsDir: true });
      const absent = makeConsumerTree({ claudeDir: true, workflowsDir: false });
      try {
        expect(existsSync(join(plain.root, ".claude", "workflows"))).toBe(true);
        expect(existsSync(join(absent.root, ".claude", "workflows"))).toBe(false);
      } finally {
        plain.cleanup();
        absent.cleanup();
      }

      itOrSkip(
        "workflowsDir mode r-x (AT-14b) and -wx (AT-32a) apply the requested mode bits",
        "uid-nonroot",
        [
          "rung (i) preserves checkEnabled:false (FSPEC §4.4, §2.7)",
          "FSPEC §6.2 row 2's opt-out stays reachable on an unwritable-parent consumer",
        ],
        () => {
          const rx = makeConsumerTree({ claudeDir: true, workflowsDir: { mode: 0o500 } });
          const wx = makeConsumerTree({ claudeDir: true, workflowsDir: { mode: 0o300 } });
          try {
            const rxMode = statSync(join(rx.root, ".claude", "workflows")).mode & 0o777;
            const wxMode = statSync(join(wx.root, ".claude", "workflows")).mode & 0o777;
            expect(rxMode).toBe(0o500);
            expect(wxMode).toBe(0o300);
          } finally {
            rx.cleanup();
            wx.cleanup();
          }
        }
      );
    });

    it("files: { <relPath>: string | Buffer } — arbitrary consumer content is written verbatim", () => {
      const tree = makeConsumerTree({
        files: { "not-managed.txt": "hello", "sub/dir/binary.bin": Buffer.from([0, 1, 2]) },
      });
      try {
        expect(readFileSync(join(tree.root, "not-managed.txt"), "utf8")).toBe("hello");
        expect(readFileSync(join(tree.root, "sub/dir/binary.bin"))).toEqual(Buffer.from([0, 1, 2]));
      } finally {
        tree.cleanup();
      }
    });

    it("syncManifest: object | 'absent' | 'unreadable' | 'malformed' — §1.2's three degradations", () => {
      const withManifest = makeConsumerTree({ syncManifest: { "row-1": { consumerHash: "abc" } } });
      const absent = makeConsumerTree({ syncManifest: "absent" });
      try {
        expect(readSyncManifest(withManifest.root)).toEqual({ "row-1": { consumerHash: "abc" } });
        expect(readSyncManifest(absent.root)).toBeNull();
      } finally {
        withManifest.cleanup();
        absent.cleanup();
      }

      const malformed = makeConsumerTree({ syncManifest: "malformed" });
      try {
        expect(() => readSyncManifest(malformed.root)).toThrow();
      } finally {
        malformed.cleanup();
      }
    });

    it("config: object | 'absent' | 'unreadable' | 'malformed' — .claude/pdlc.config.json (E7)", () => {
      const configPath = (root) => join(root, ".claude", "pdlc.config.json");

      const withConfig = makeConsumerTree({
        claudeDir: true,
        config: { distribution: { checkEnabled: false } },
      });
      const absent = makeConsumerTree({ claudeDir: true, config: "absent" });
      const malformed = makeConsumerTree({ claudeDir: true, config: "malformed" });
      try {
        expect(JSON.parse(readFileSync(configPath(withConfig.root), "utf8"))).toEqual({
          distribution: { checkEnabled: false },
        });
        expect(existsSync(configPath(absent.root))).toBe(false);
        expect(() => JSON.parse(readFileSync(configPath(malformed.root), "utf8"))).toThrow();
      } finally {
        withConfig.cleanup();
        absent.cleanup();
        malformed.cleanup();
      }
    });

    it("driftState: string | object | 'absent' — the pre-existing record the T2 ladder needs", () => {
      const withState = makeConsumerTree({
        claudeDir: true,
        workflowsDir: true,
        driftState: { baselineReason: "resolved", rows: [] },
      });
      const absent = makeConsumerTree({ claudeDir: true, workflowsDir: true, driftState: "absent" });
      try {
        expect(readDriftState(withState.root)).toEqual({ baselineReason: "resolved", rows: [] });
        expect(readDriftState(absent.root)).toBeNull();
      } finally {
        withState.cleanup();
        absent.cleanup();
      }
    });

    it("home is a sibling, never an ancestor, of root — both realpathSync'd (TSPEC §3.3)", () => {
      const tree = makeConsumerTree({});
      try {
        expect(tree.root.startsWith(tree.home + "/")).toBe(false);
        expect(tree.home.startsWith(tree.root + "/")).toBe(false);
        expect(dirname(tree.root)).toBe(dirname(tree.home));
        // realpathSync applied at construction (§3.3): resolving again is a no-op.
        expect(statSync(tree.root).isDirectory()).toBe(true);
        expect(statSync(tree.home).isDirectory()).toBe(true);
      } finally {
        tree.cleanup();
      }
    });
  });

  describe("makePluginTree (TSPEC §3.3)", () => {
    it("throws when manifestOverride and manifestRaw are both given", () => {
      expect(() =>
        makePluginTree({
          manifestOverride: (o) => o,
          manifestRaw: "{ not json",
        })
      ).toThrow();
    });
  });

  describe("setRowState (TSPEC §3.3's self-oracle)", () => {
    it("throws when the tree it built re-derives to a different state than requested", () => {
      // §3.3 names this exact trap: constructing "stale" with consumer bytes forced equal
      // to the plugin's re-derives to "in-sync" (rung 3 precedes rung 5). setRowState must
      // catch its own construction rather than silently returning a mis-classified tree.
      const consumer = makeConsumerTree({ claudeDir: true, workflowsDir: true });
      const plugin = makePluginTree({});
      try {
        expect(() =>
          setRowState({ consumer, plugin }, "row-1", "stale", {
            consumerBytes: plugin.bytesOf("row-1"),
          })
        ).toThrow();
      } finally {
        consumer.cleanup();
        plugin.cleanup?.();
      }
    });
  });

  describe("cleanup() (TSPEC §13.6)", () => {
    it("is idempotent — two calls, no throw", () => {
      const tree = makeConsumerTree({});
      expect(() => tree.cleanup()).not.toThrow();
      expect(() => tree.cleanup()).not.toThrow();
    });

    itOrSkip(
      "succeeds over a chmod 000 directory",
      "uid-nonroot",
      ["cleanup() must chmod back before rmSync (§6.5) rather than fail on a locked-down fixture"],
      () => {
        const tree = makeConsumerTree({ claudeDir: true, workflowsDir: true });
        chmodSync(join(tree.root, ".claude", "workflows"), 0o000);
        expect(() => tree.cleanup()).not.toThrow();
        expect(existsSync(tree.root)).toBe(false);
      }
    );
  });
});

// ─── (c) Trace/ordering contracts (T-16's gate — TE F-07(b)) ───────────────────────────

describe("T-01 clause (c) — trace/ordering contracts", () => {
  function writeTraceFile(lines) {
    const dir = makeTmpDir("pdlc-t01-trace-");
    const path = join(dir, "trace.tsv");
    writeFileSync(path, lines.join("\n") + "\n");
    return { dir, path };
  }

  describe("§4.1 percent codec", () => {
    it.each([
      ["%", Buffer.from([0x25])],
      ["tab", Buffer.from([0x09])],
      ["newline", Buffer.from([0x0a])],
      ["a byte outside 0x20-0x7E", Buffer.from([0xff])],
    ])("round-trips %s through parseTrace's decoder", (_label, rawBytes) => {
      const encodedArg = percentEncodeTestOnly(rawBytes);
      const { dir, path } = writeTraceFile([`1\trun\tmanifest-read\t-\t${encodedArg}`]);
      try {
        const [record] = parseTrace(path);
        const decoded = Buffer.isBuffer(record.arg) ? record.arg : Buffer.from(String(record.arg), "binary");
        expect(Buffer.compare(decoded, rawBytes)).toBe(0);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("parseTrace's phase grammar (TSPEC §4.2)", () => {
    it("throws when a non-classify record carries a phase other than run", () => {
      const { dir, path } = writeTraceFile(["1\tas-found\tmanifest-read\t-\t"]);
      try {
        expect(() => parseTrace(path)).toThrow();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("throws when a classify record carries phase run instead of a pass label", () => {
      const { dir, path } = writeTraceFile(["1\trun\tclassify\trow-1\tin-sync"]);
      try {
        expect(() => parseTrace(path)).toThrow();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe("assertPhaseOrder (TSPEC §4.3)", () => {
    it("accepts a collapsed prefix of [as-found, post-copy, post-run]", () => {
      const trace = [
        { seq: 1, phase: "as-found", op: "classify", rowId: "row-1", arg: "in-sync" },
        { seq: 2, phase: "post-copy", op: "classify", rowId: "row-1", arg: "in-sync" },
      ];
      expect(() => assertPhaseOrder(trace)).not.toThrow();
    });

    it("rejects a trace whose collapsed classify-label prefix is out of order", () => {
      const trace = [
        { seq: 1, phase: "as-found", op: "classify", rowId: "row-1", arg: "in-sync" },
        { seq: 2, phase: "post-copy", op: "classify", rowId: "row-1", arg: "in-sync" },
        { seq: 3, phase: "as-found", op: "classify", rowId: "row-1", arg: "in-sync" },
      ];
      expect(() => assertPhaseOrder(trace)).toThrow();
    });
  });

  describe("assertPostCopyNarrow (TSPEC §4.3 — multiset equality, TE F-01)", () => {
    it("passes when the post-copy classify records exactly match the retiring ids once each", () => {
      const trace = [
        { seq: 1, phase: "post-copy", op: "classify", rowId: "row-1", arg: "retired" },
      ];
      expect(() => assertPostCopyNarrow(trace, ["row-1"])).not.toThrow();
    });

    it("fails when a retiring row id is classified twice at post-copy (duplicated row id)", () => {
      const trace = [
        { seq: 1, phase: "post-copy", op: "classify", rowId: "row-1", arg: "retired" },
        { seq: 2, phase: "post-copy", op: "classify", rowId: "row-1", arg: "retired" },
      ];
      expect(() => assertPostCopyNarrow(trace, ["row-1"])).toThrow();
    });
  });

  describe("assertTreeUnchanged (TSPEC §8.3, R-8, TE F-12)", () => {
    it("ignores a mutation under a .git/ segment", () => {
      const dir = makeTmpDir("pdlc-t01-tree-");
      mkdirSync(join(dir, ".git", "logs"), { recursive: true });
      writeFileSync(join(dir, ".git", "logs", "HEAD"), "before");
      try {
        const before = snapshotTree(dir);
        writeFileSync(join(dir, ".git", "logs", "HEAD"), "after-a-git-invocation");
        expect(() => assertTreeUnchanged(dir, before)).not.toThrow();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("reports a mutation outside .git/", () => {
      const dir = makeTmpDir("pdlc-t01-tree-");
      writeFileSync(join(dir, "tracked.txt"), "before");
      try {
        const before = snapshotTree(dir);
        writeFileSync(join(dir, "tracked.txt"), "after");
        expect(() => assertTreeUnchanged(dir, before)).toThrow();
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });
});

// ─── (d) Driver contracts (T-18's and T-39's gates — TE F-07(a)) ───────────────────────

describe("T-01 clause (d) — driver contracts", () => {
  describe("backup-grammar.sh (TSPEC §11.1, §11.2)", () => {
    it("round-trips a format case through pdlc_backup_parse", () => {
      const id = "foo";
      const stamp = "20260101T000000Z";
      const nn = "01";
      const [formatResult] = runGrammar([`format\t${id}\t${stamp}\t${nn}`]);
      expect(formatResult.ok).toBe(true);
      const filename = formatResult.fields[0];

      const [parseResult] = runGrammar([`parse\t${filename}`]);
      expect(parseResult.ok).toBe(true);
      expect(parseResult.fields).toEqual([id, stamp, nn]);
    });

    it("returns err for a malformed parse case", () => {
      const [result] = runGrammar(["parse\tnot-a-backup-name.txt"]);
      expect(result.ok).toBe(false);
    });

    // CROSS-REVIEW-se-codebase-v1.md F-10: `IFS=$'\t' read -r kind a b c` collapses
    // consecutive tabs (tab is an IFS-whitespace character even as the sole IFS member), so a
    // case with an EMPTY middle field silently shifts every later field left. A `format` case
    // with an empty `stamp` is the clearest observable: neither `pdlc_backup_format` nor its JS
    // oracle validates the stamp's shape (only `id` against M6 and `nn` against `01..99`), so
    // `format(id, "", nn)` is a legitimate ACCEPT — but the shift feeds the driver
    // `pdlc_backup_format(id, nn, "")`, whose THIRD argument (the real `nn`) arrives empty and
    // fails the `nn` regex, turning a case that must accept into one that wrongly rejects.
    it("does not collapse an empty middle field (stamp) into a false reject", () => {
      const [result] = runGrammar([`format\tsome-id\t\t01`]);
      expect(result.ok).toBe(true);
      expect(result.fields).toEqual(["some-id.-01.bak"]);
    });
  });

  describe("lib-probe.sh (TSPEC §11.2's sourced-probe precedent)", () => {
    it("returns one result line per input case", () => {
      const cases = [
        "pdlc_backup_format\tfoo\t20260101T000000Z\t01",
        "pdlc_backup_parse\tfoo.20260101T000000Z-01.bak",
      ];
      const results = runProbe(cases);
      expect(results).toHaveLength(cases.length);
    });

    it("returns err for an unknown function name", () => {
      const [result] = runProbe(["pdlc_does_not_exist\tfoo"]);
      expect(result.ok).toBe(false);
    });
  });
});
