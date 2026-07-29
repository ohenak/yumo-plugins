/**
 * driftFault.test.js — TSPEC §5's fault-seam suite: AT-18a/AT-18b (the closed 16-token
 * `PDLC_FAULT` enumeration's unrecognised-token path, §5.4), §14.1 F-1 (malformed specs) and
 * F-2 (`M6_ID_REGEX`'s exclusion of both seam delimiters), plus the layer-1 sourced-probe
 * cases T-39 adds over C1's fault/trace/hash/JSON primitives (§2.2, §11.2).
 *
 * Ownership (PLAN, single-writer-per-file): T-27 (batch 5) owns this file exactly.
 *
 * RED-terminal (PLAN Phase 3 preamble). `check-workflow-drift.sh` / `sync-workflows.sh` (C2/C3)
 * and `pdlc/hooks/scripts/lib/pdlc-drift.sh` (C1) do not exist yet — every `runScript()` call
 * below invokes a script path that is not on disk (bash reports "No such file or directory",
 * exit 127) and every `runProbe()` call resolves to `lib-probe.sh`'s `unknown-function`/
 * `unset-variable` fallback (C1 not sourced). This file is authored as it should read once
 * C1 lands (batch 6, `pdlc_fault_active`/`pdlc_trace`/`pdlc_sha1`/`pdlc_probe_hash_tool`/
 * `pdlc_json_read`/`PDLC_FAULT_TOKENS`) and the entrypoints land (batch 11).
 */

import { join } from "path";
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from "fs";
import { tmpdir } from "os";

import { runScript, readDriftState, readSyncManifest, makeToolDir, countOf, MESSAGES } from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import { itOrSkip } from "./helpers/driftCapabilities.js";
import { runProbe } from "./helpers/driftProbe.js";
import { M6_ID_REGEX } from "../lib/document-oracles.mjs";

// ───────────────────────────── fixture + comparison helpers ─────────────────────────────

/**
 * TSPEC §13.1's `syncedConsumer`: `freshConsumer` (`makeConsumerTree({git:true,claudeDir:false})`
 * + a valid 2-row plugin tree) with every row `in-sync` and a matching sync manifest.
 */
function buildSyncedConsumer() {
  const plugin = makePluginTree({});
  const consumer = makeConsumerTree({ git: true, claudeDir: false });
  for (const row of plugin.manifest.rows) {
    setRowState({ consumer, plugin }, row.id, "in-sync");
  }
  return {
    consumer,
    plugin,
    cleanup() {
      consumer.cleanup();
      plugin.cleanup?.();
    },
  };
}

function runEntrypoint(fixture, entrypoint, fault = []) {
  return runScript(entrypoint, {
    consumerRoot: fixture.consumer.root,
    home: fixture.consumer.home,
    pluginRoot: fixture.plugin.pluginRoot,
    fault,
  });
}

/** Strips `generatedAtUtc` before comparison — every byte-equivalence assertion in §5.4/AT-18b
 * normalises that field away (R-11). */
function stripGeneratedAt(record) {
  if (!record || typeof record !== "object") return record;
  const { generatedAtUtc, ...rest } = record;
  return rest;
}

/**
 * §5.4 rule 2's byte-equivalence conjunct: stdout, the drift state and the sync manifest, all
 * modulo `generatedAtUtc`. AT-18a/AT-18b state this as "one shared fixture run twice"; this
 * suite instead builds two content-identical `syncedConsumer` fixtures and runs one faulted,
 * one clean, so neither run's writes can shadow the other's (a literal re-run over one root
 * would make the second run's comparison order-dependent on the first run's side effects).
 */
function expectByteEquivalentRuns(faultedRun, faultedFixture, cleanRun, cleanFixture) {
  expect(faultedRun.stdout).toBe(cleanRun.stdout);
  expect(stripGeneratedAt(readDriftState(faultedFixture.consumer.root))).toEqual(
    stripGeneratedAt(readDriftState(cleanFixture.consumer.root))
  );
  expect(readSyncManifest(faultedFixture.consumer.root)).toEqual(readSyncManifest(cleanFixture.consumer.root));
}

// ───────────────────────────── AT-18a / AT-18b ─────────────────────────────

describe("AT-18a — unrecognised token: N-7 once, nothing else on stderr, run not perturbed", () => {
  it("prints N-7 exactly once with the token text, and is byte-equivalent to the seam-unset run", () => {
    const faulted = buildSyncedConsumer();
    const clean = buildSyncedConsumer();
    try {
      const faultedRun = runEntrypoint(faulted, "hook", ["not-a-real-token"]);
      const cleanRun = runEntrypoint(clean, "hook", []);

      // Conjunct 1 — "exactly once", by count, never `toContain`.
      expect(countOf(faultedRun.stderr, "N-7")).toBe(1);

      const n7Match = MESSAGES["N-7"].exec(faultedRun.stderr);
      expect(n7Match).not.toBeNull();
      expect(n7Match.groups.token).toBe("not-a-real-token");

      // PM F-01's second silence site (§1.4a): stderr with the one N-7 line removed and
      // trimmed is "" — "N-7 and nothing else", not merely "N-7 is present".
      const withoutN7 = faultedRun.stderr.replace(MESSAGES["N-7"], "").trim();
      expect(withoutN7).toBe("");

      // Conjunct 2 — "not perturbed", asserted as byte equivalence, never "exit is still 0".
      expectByteEquivalentRuns(faultedRun, faulted, cleanRun, clean);

      // AC-2.4 — the hook exits 0 always.
      expect(faultedRun.status).toBe(0);
    } finally {
      faulted.cleanup();
      clean.cleanup();
    }
  });
});

describe("AT-18b — the identical fixture under --check exits 4; record byte-identical to AT-18a's modulo generatedAtUtc", () => {
  it("exits 4 under --check and the drift-state record matches the hook run's", () => {
    const hookFixture = buildSyncedConsumer();
    const checkFixture = buildSyncedConsumer();
    try {
      const hookRun = runEntrypoint(hookFixture, "hook", ["not-a-real-token"]);
      const checkRun = runEntrypoint(checkFixture, "check", ["not-a-real-token"]);

      expect(checkRun.status).toBe(4);
      expect(countOf(checkRun.stderr, "N-7")).toBe(1);

      expect(stripGeneratedAt(readDriftState(checkFixture.consumer.root))).toEqual(
        stripGeneratedAt(readDriftState(hookFixture.consumer.root))
      );
    } finally {
      hookFixture.cleanup();
      checkFixture.cleanup();
    }
  });
});

// ───────────────────────────── §14.1 F-1 — malformed specs ─────────────────────────────

describe("§14.1 F-1 — a malformed spec is unrecognised on the same footing as an unknown token (§5.1.1, §5.4 rule 4)", () => {
  it.each([
    ["mkdir:foo", "a selector on a non-selector-bearing token"],
    ["mkdir:", "an empty selector"],
    ["backup:a:b", "more than one colon"],
  ])('PDLC_FAULT="%s" (%s) — N-7 once with the whole spec text, nothing injected', (specText) => {
    const faulted = buildSyncedConsumer();
    const clean = buildSyncedConsumer();
    try {
      const faultedRun = runEntrypoint(faulted, "hook", [specText]);
      const cleanRun = runEntrypoint(clean, "hook", []);

      expect(countOf(faultedRun.stderr, "N-7")).toBe(1);

      const n7Match = MESSAGES["N-7"].exec(faultedRun.stderr);
      expect(n7Match).not.toBeNull();
      // The whole spec text, not just the malformed token — a fixture meant to scope a fault
      // to one row must not have its selector silently dropped (§5.1.1, §5.4 rule 4).
      expect(n7Match.groups.token).toBe(specText);

      expectByteEquivalentRuns(faultedRun, faulted, cleanRun, clean);
    } finally {
      faulted.cleanup();
      clean.cleanup();
    }
  });
});

// ───────────────────────────── §14.1 F-2 — M6_ID_REGEX excludes both delimiters ─────────

describe("§14.1 F-2 — M6_ID_REGEX excludes both seam delimiters (TE F-05(d), Q-03)", () => {
  it.each([
    [",", "comma — this grammar's spec-list delimiter"],
    [":", "colon — this grammar's selector delimiter"],
    ["\t", "tab — §4.1's trace-field delimiter"],
    ["\n", "newline"],
  ])("rejects an id containing %j (%s)", (ch) => {
    // Asserted as a property of the regex itself — not as a consequence of the ids the
    // fixtures happen to use (a fixture set that never contains ":" proves nothing, §5.1.1).
    expect(M6_ID_REGEX.test(`abc${ch}def`)).toBe(false);
  });

  it("still accepts the charset it does allow", () => {
    expect(M6_ID_REGEX.test("Row-1.2_3")).toBe(true);
  });
});

// ───────────────────────────── layer-1 sourced-probe cases (T-39) ─────────────────────────

describe("layer-1 sourced-probe cases (T-39) — C1's fault/trace/hash/JSON primitives (§2.2, §11.2)", () => {
  const PROBE_PATH_TOOLS = ["bash", "git", "python3", "shasum", "sha1sum", "mv", "rm", "date", "printf"];

  function probeEnvWith(extra = {}) {
    return {
      PATH: makeToolDir(PROBE_PATH_TOOLS),
      HOME: mkdtempSync(join(tmpdir(), "pdlc-fault-probe-home-")),
      LC_ALL: "C",
      LANG: "C",
      TZ: "UTC",
      ...extra,
    };
  }

  describe("pdlc_fault_active (§5.1 / §5.1.1)", () => {
    it("is active (exit 0) for a recognised, unscoped token present in PDLC_FAULT", () => {
      const [result] = runProbe(["pdlc_fault_active\tmkdir"], { env: probeEnvWith({ PDLC_FAULT: "mkdir" }) });
      expect(result.ok).toBe(true);
      expect(result.fields[0]).toBe("0");
    });

    it("is inactive (exit 1) for a token absent from PDLC_FAULT", () => {
      const [result] = runProbe(["pdlc_fault_active\tbackup"], { env: probeEnvWith({ PDLC_FAULT: "mkdir" }) });
      expect(result.ok).toBe(true);
      expect(result.fields[0]).toBe("1");
    });

    it("scopes a selector-bearing token to its matching scope key, and not to another row's", () => {
      const env = probeEnvWith({ PDLC_FAULT: "artifact-copy-corrupt:row-1" });
      const [matching] = runProbe(["pdlc_fault_active\tartifact-copy-corrupt\trow-1"], { env });
      const [other] = runProbe(["pdlc_fault_active\tartifact-copy-corrupt\trow-2"], { env });
      expect(matching.fields[0]).toBe("0");
      expect(other.fields[0]).toBe("1");
    });

    it("is inactive for a recognised token when PDLC_FAULT names only an unrecognised one", () => {
      const [result] = runProbe(["pdlc_fault_active\tmkdir"], {
        env: probeEnvWith({ PDLC_FAULT: "not-a-real-token" }),
      });
      expect(result.fields[0]).toBe("1");
    });

    it("is inactive for a recognised token when PDLC_FAULT names only a malformed spec", () => {
      const [result] = runProbe(["pdlc_fault_active\tmkdir"], { env: probeEnvWith({ PDLC_FAULT: "mkdir:foo" }) });
      expect(result.fields[0]).toBe("1");
    });

    // The "N-7 once, whole spec text" half of these cases (PLAN T-27) is asserted at the
    // entrypoint layer above (AT-18a, F-1): `runProbe` (T-39) exposes only `bin/lib-probe.sh`'s
    // stdout protocol (TSPEC §11.2) — the sourced process's stderr is not part of its return
    // shape, so a probe-level stderr assertion is not observable through this seam.
  });

  it("pdlc_trace exits 0 even when PDLC_TRACE_FILE names an unwritable path (ENOTDIR)", () => {
    const blockerDir = mkdtempSync(join(tmpdir(), "pdlc-fault-blocker-"));
    const blockerFile = join(blockerDir, "blocker");
    writeFileSync(blockerFile, "a regular file standing in the trace path");
    const unwritableTracePath = join(blockerFile, "trace.tsv");
    try {
      const [result] = runProbe(["pdlc_trace\trun\tmanifest-read\trow-1\t-"], {
        env: probeEnvWith({ PDLC_TRACE_FILE: unwritableTracePath }),
      });
      expect(result.ok).toBe(true);
      expect(result.fields[0]).toBe("0");
    } finally {
      rmSync(blockerDir, { recursive: true, force: true });
    }
  });

  it("pdlc_sha1 returns 0 and 40 hex chars for a readable file", () => {
    const dir = mkdtempSync(join(tmpdir(), "pdlc-fault-sha1-"));
    const file = join(dir, "content.txt");
    writeFileSync(file, "pdlc-fault-suite-sha1-fixture");
    try {
      const [result] = runProbe([`pdlc_sha1\t${file}`], { env: probeEnvWith() });
      expect(result.ok).toBe(true);
      expect(result.fields[0]).toBe("0");
      expect(result.fields[1]).toMatch(/^[0-9a-f]{40}$/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("pdlc_probe_hash_tool resolves 0 and sets PDLC_HASH_BIN / PDLC_HASH_ARGS", () => {
    const env = probeEnvWith();
    const [probeResult, binDump, argsDump] = runProbe(
      ["pdlc_probe_hash_tool", "dump\tPDLC_HASH_BIN", "dump\tPDLC_HASH_ARGS"],
      { env }
    );
    expect(probeResult.ok).toBe(true);
    expect(probeResult.fields[0]).toBe("0");
    expect(binDump.ok).toBe(true);
    expect(argsDump.ok).toBe(true);
  });

  describe("pdlc_json_read (FSPEC §2.3's closed 0/10/11/12)", () => {
    it("0 — parses a readable, well-formed JSON file", () => {
      const dir = mkdtempSync(join(tmpdir(), "pdlc-fault-jsonread-"));
      const file = join(dir, "doc.json");
      writeFileSync(file, JSON.stringify({ a: { b: "value" } }));
      try {
        const [result] = runProbe([`pdlc_json_read\t${file}\t.a.b`], { env: probeEnvWith() });
        expect(result.ok).toBe(true);
        expect(result.fields[0]).toBe("0");
        expect(result.fields[1]).toBe("value");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    itOrSkip(
      "10 — an unreadable file (permission denied)",
      "uid-nonroot",
      ["pdlc_json_read's unreadable-file exit (10) needs a real permission denial; root bypasses it"],
      () => {
        const dir = mkdtempSync(join(tmpdir(), "pdlc-fault-jsonread-"));
        const file = join(dir, "doc.json");
        writeFileSync(file, JSON.stringify({ a: 1 }));
        chmodSync(file, 0o200);
        try {
          const [result] = runProbe([`pdlc_json_read\t${file}\t.a`], { env: probeEnvWith() });
          expect(result.ok).toBe(true);
          expect(result.fields[0]).toBe("10");
        } finally {
          chmodSync(file, 0o600);
          rmSync(dir, { recursive: true, force: true });
        }
      }
    );

    it("11 — an absent file", () => {
      const dir = mkdtempSync(join(tmpdir(), "pdlc-fault-jsonread-"));
      const file = join(dir, "does-not-exist.json");
      try {
        const [result] = runProbe([`pdlc_json_read\t${file}\t.a`], { env: probeEnvWith() });
        expect(result.ok).toBe(true);
        expect(result.fields[0]).toBe("11");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it("12 — a malformed (unparseable) file", () => {
      const dir = mkdtempSync(join(tmpdir(), "pdlc-fault-jsonread-"));
      const file = join(dir, "malformed.json");
      writeFileSync(file, "{ not valid json");
      try {
        const [result] = runProbe([`pdlc_json_read\t${file}\t.a`], { env: probeEnvWith() });
        expect(result.ok).toBe(true);
        expect(result.fields[0]).toBe("12");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  it("dump PDLC_FAULT_TOKENS — sixteen members in §5.2's table order", () => {
    const [result] = runProbe(["dump\tPDLC_FAULT_TOKENS"], { env: probeEnvWith() });
    expect(result.ok).toBe(true);
    expect(result.fields[0]).toBe("0");
    expect(result.fields.slice(1)).toEqual([
      "git-worktree-list",
      "walk-stat",
      "manifest-read",
      "sync-manifest-read",
      "mkdir",
      "drift-state-replace",
      "drift-state-invalidate",
      "drift-state-unlink",
      "artifact-copy",
      "artifact-copy-corrupt",
      "backup",
      "backup-corrupt",
      "retire-delete",
      "sync-manifest-update",
      "plugin-artifact-read",
      "consumer-artifact-read",
    ]);
  });
});
