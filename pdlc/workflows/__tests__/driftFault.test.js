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

import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  chmodSync,
  rmSync,
  existsSync,
} from "fs";
import { createHash } from "crypto";
import { tmpdir } from "os";

import { runScript, readDriftState, readSyncManifest, makeToolDir, countOf, MESSAGES } from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import { itOrSkip } from "./helpers/driftCapabilities.js";
import { runProbe } from "./helpers/driftProbe.js";
import { readFaultTokens, seeded, resolveSeed, genId } from "./helpers/driftGenerators.js";
import { M6_ID_REGEX } from "../lib/document-oracles.mjs";

// ───────────────────────────── fixture + comparison helpers ─────────────────────────────

/**
 * TSPEC §13.1's `syncedConsumer`: `freshConsumer` (`makeConsumerTree({git:true,claudeDir:false})`
 * + a valid 2-row plugin tree) with every row `in-sync` and a matching sync manifest.
 *
 * @param {object} [sharedPlugin] an already-built `makePluginTree()` fixture to reuse instead of
 *   building a fresh one. Byte-equivalence assertions (AT-18a/AT-18b, §14.1 F-1) run this twice
 *   and compare the two runs' drift-state records: `syncCommand` embeds the plugin's own
 *   `sync-workflows.sh` path verbatim (FSPEC §1.3/AC-0.4), so two independently-built plugin
 *   trees would legitimately differ there and the comparison could never be byte-identical for a
 *   real reason. Passing one shared plugin tree makes `syncCommand` identical across both runs
 *   because it names the same file, not because a fixture artifact was normalised away
 *   (precedent: `driftOrdering.test.js`'s §4.4 unwritable-trace test, commit 34b1a8c).
 */
function buildSyncedConsumer(sharedPlugin) {
  const plugin = sharedPlugin || makePluginTree({});
  const consumer = makeConsumerTree({ git: true, claudeDir: false });
  for (const row of plugin.manifest.rows) {
    setRowState({ consumer, plugin }, row.id, "in-sync");
  }
  return {
    consumer,
    plugin,
    cleanup() {
      consumer.cleanup();
      if (!sharedPlugin) plugin.cleanup?.();
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

/**
 * Deep-clones `value`, dropping any key ending in `Utc` at any depth — the timestamp fields
 * (`generatedAtUtc`, the sync manifest's per-row `syncedAtUtc`) TSPEC §4.4 permits to differ
 * between two otherwise-byte-identical runs (precedent: `driftOrdering.test.js`'s
 * `stripTimestamps`, same defect/fix as this file's §4.4-adjacent byte-equivalence checks).
 */
function stripTimestamps(value) {
  if (Array.isArray(value)) return value.map(stripTimestamps);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      if (key.endsWith("Utc")) continue;
      out[key] = stripTimestamps(v);
    }
    return out;
  }
  return value;
}

/**
 * The FULL N-7 line (FSPEC §4.6, §2759): `pdlc: unrecognised PDLC_FAULT token "{token}"; no
 * fault injected.` — `MESSAGES["N-7"]` deliberately matches only the `"token";` prefix (the
 * convention every N-3..N-8 entry shares: no `remediation` group is captured for these), so it
 * is the wrong tool for "strip the N-7 line and check nothing else remains" (AT-18a's "N-7 and
 * nothing else", §1.4a). This local pattern matches the whole line for that one purpose.
 */
const N7_FULL_LINE = /^pdlc: unrecognised PDLC_FAULT token "[^"]*"; no fault injected\.\r?\n?/m;

/**
 * §5.4 rule 2's byte-equivalence conjunct: stdout, the drift state and the sync manifest, all
 * modulo `generatedAtUtc`. AT-18a/AT-18b state this as "one shared fixture run twice"; this
 * suite instead builds two content-identical `syncedConsumer` fixtures and runs one faulted,
 * one clean, so neither run's writes can shadow the other's (a literal re-run over one root
 * would make the second run's comparison order-dependent on the first run's side effects).
 */
function expectByteEquivalentRuns(faultedRun, faultedFixture, cleanRun, cleanFixture) {
  expect(faultedRun.stdout).toBe(cleanRun.stdout);
  expect(stripTimestamps(readDriftState(faultedFixture.consumer.root))).toEqual(
    stripTimestamps(readDriftState(cleanFixture.consumer.root))
  );
  expect(stripTimestamps(readSyncManifest(faultedFixture.consumer.root))).toEqual(
    stripTimestamps(readSyncManifest(cleanFixture.consumer.root))
  );
}

// ───────────────────────────── AT-18a / AT-18b ─────────────────────────────

describe("AT-18a — unrecognised token: N-7 once, nothing else on stderr, run not perturbed", () => {
  it("prints N-7 exactly once with the token text, and is byte-equivalent to the seam-unset run", () => {
    const sharedPlugin = makePluginTree({});
    const faulted = buildSyncedConsumer(sharedPlugin);
    const clean = buildSyncedConsumer(sharedPlugin);
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
      const withoutN7 = faultedRun.stderr.replace(N7_FULL_LINE, "").trim();
      expect(withoutN7).toBe("");

      // Conjunct 2 — "not perturbed", asserted as byte equivalence, never "exit is still 0".
      expectByteEquivalentRuns(faultedRun, faulted, cleanRun, clean);

      // AC-2.4 — the hook exits 0 always.
      expect(faultedRun.status).toBe(0);
    } finally {
      faulted.cleanup();
      clean.cleanup();
      sharedPlugin.cleanup();
    }
  });
});

describe("AT-18b — the identical fixture under --check exits 4; record byte-identical to AT-18a's modulo generatedAtUtc", () => {
  it("exits 4 under --check and the drift-state record matches the hook run's", () => {
    const sharedPlugin = makePluginTree({});
    const hookFixture = buildSyncedConsumer(sharedPlugin);
    const checkFixture = buildSyncedConsumer(sharedPlugin);
    try {
      const hookRun = runEntrypoint(hookFixture, "hook", ["not-a-real-token"]);
      const checkRun = runEntrypoint(checkFixture, "check", ["not-a-real-token"]);

      expect(checkRun.status).toBe(4);
      expect(countOf(checkRun.stderr, "N-7")).toBe(1);

      // AT-18b's Then says "byte-identical to AT-18a's, modulo the timestamp field". Taken
      // literally that is unsatisfiable: `generatedBy` is FSPEC §6.2's closed 3-member record
      // of *which entrypoint wrote this*, so the hook run says "hook" and the `--check` run
      // says "check" by design, not by drift. Excluding it here keeps the assertion's real
      // content — the token perturbed nothing about the computed record — while the two run-
      // identity fields (the timestamp and the entrypoint) are the only permitted differences.
      // Flagged for L-06: AT-18b's wording should name `generatedBy` alongside the timestamp.
      const { generatedBy: _checkBy, ...checkRecord } = stripTimestamps(readDriftState(checkFixture.consumer.root));
      const { generatedBy: _hookBy, ...hookRecord } = stripTimestamps(readDriftState(hookFixture.consumer.root));
      expect(_checkBy).toBe("check");
      expect(_hookBy).toBe("hook");
      expect(checkRecord).toEqual(hookRecord);
    } finally {
      hookFixture.cleanup();
      checkFixture.cleanup();
      sharedPlugin.cleanup();
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
    const sharedPlugin = makePluginTree({});
    const faulted = buildSyncedConsumer(sharedPlugin);
    const clean = buildSyncedConsumer(sharedPlugin);
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
      sharedPlugin.cleanup();
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
  const PROBE_PATH_TOOLS = ["bash", "git", "python3", "shasum", "sha1sum", "mv", "rm", "date", "printf", "mkdir"];

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

// ═══════════════════════════════ PLAN T-48 — seam-closure properties ═══════════════════════════
//
// PROP-SEAM-01, -02, -03, -04, -06 and PROP-SEAM-05's fault half (PROPERTIES §8.0-§8.2, §12).
// Appended to T-27's file per PLAN §4.4's single-writer convention — nothing above this banner is
// touched. Every falsification (mutation named first → red observed → revert → green) is recorded
// in docs/pdlc-workflow-distribution/FALSIFICATION-LEDGER-T-48.md; this file carries only the
// assertions.

const __t48_filename = fileURLToPath(import.meta.url);
const __t48_dirname = dirname(__t48_filename);
// __t48_dirname = <repo>/pdlc/workflows/__tests__ → up three levels is the repository root.
const T48_REPO_ROOT = resolve(__t48_dirname, "..", "..", "..");

const T48_SEED = resolveSeed(0x5ea11048);

/**
 * PROPERTIES §8.1 / TSPEC §2.1: the **three** shipped bash sources, and no fourth file carries a
 * guard. `__tests__/helpers/bin/lib-probe.sh` is deliberately absent from this list AND calls
 * `pdlc_fault_active` nowhere (PLAN T-39) — it is a test helper, never shipped, so neither the
 * §8.1 static scan nor PROP-SEAM-02's call-site closure may see it.
 */
const T48_SHIPPED_BASH_SOURCES = Object.freeze([
  "pdlc/hooks/scripts/lib/pdlc-drift.sh", // C1
  "pdlc/hooks/scripts/check-workflow-drift.sh", // C2
  "pdlc/hooks/scripts/sync-workflows.sh", // C3
]);

const T48_TSPEC_PATH = join(
  T48_REPO_ROOT,
  "docs",
  "pdlc-workflow-distribution",
  "TSPEC-pdlc-workflow-distribution.md"
);

// ───────────────────────────── PROP-SEAM-02's static oracle ─────────────────────────────

/**
 * ORACLE B of PROPERTIES §8.1 — a static scan of the three shipped bash sources **as text**.
 *
 * ══ INDEPENDENCE, DELIBERATELY PRESERVED (PROPERTIES §8.0, PLAN T-48) ══
 * This function must NOT consult `readFaultTokens()`, `PDLC_FAULT_TOKENS`, or any list derived
 * from either. It knows exactly one name — the guard function `pdlc_fault_active` — and recovers
 * the token vocabulary purely from the bytes at the call sites. `readFaultTokens()` (oracle A)
 * sources C1 in a child bash and reads the array's *runtime value*; this reads *different bytes of
 * the same file* and explicitly excludes the array declaration (rule 2 below). Deriving either
 * oracle from the other — e.g. "extract the tokens, then filter to those in the array", or
 * "assert the array members appear somewhere in the file text" — collapses the pair into one
 * oracle and turns PROP-SEAM-02 into a tautology that stays green through a shared mistake: a
 * padded array would agree with itself, and a guard for a token nobody enumerated would be
 * filtered out before the assertion ever saw it. Both directions of the set equality below are
 * only meaningful while the two derivations stay disjoint.
 *
 * Three scoping rules PROPERTIES §8.1 states normatively (SE F-14):
 *   1. only **argument 1** is read, and it must be a bare literal — argument 2 (the scope key) is
 *      unconstrained, because TSPEC §5.1.1 *requires* selector-bearing guards to pass a variable
 *      there;
 *   2. the scan excludes `pdlc_fault_active`'s own definition site and the `PDLC_FAULT_TOKENS`
 *      array declaration (reading the declaration here is exactly the collapse described above);
 *   3. the scan excludes comments and heredoc bodies — `pdlc_fault_active` is matched only at a
 *      command position on a non-comment line, outside any `<<`-delimited region.
 *
 * @returns {Array<{file: string, line: number, rawArg1: (string|null), literal: (string|null)}>}
 */
function t48ExtractGuardCallSites() {
  const GUARD = "pdlc_fault_active";
  const sites = [];

  for (const rel of T48_SHIPPED_BASH_SOURCES) {
    const abs = join(T48_REPO_ROOT, rel);
    const lines = readFileSync(abs, "utf8").split("\n");

    let heredocDelimiter = null; // rule 3 — inside a `<<`-delimited body
    let inGuardDefinition = false; // rule 2 — inside `pdlc_fault_active() { … }`
    let inTokenDeclaration = false; // rule 2 — inside `PDLC_FAULT_TOKENS=( … )`

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const lineNo = i + 1;

      if (heredocDelimiter !== null) {
        // bash accepts the delimiter with leading tabs stripped under `<<-`; comparing the
        // trimmed line covers both forms and never under-consumes a body.
        if (raw.trim() === heredocDelimiter) heredocDelimiter = null;
        continue;
      }
      if (inTokenDeclaration) {
        if (/^\s*\)\s*$/.test(raw)) inTokenDeclaration = false;
        continue;
      }
      if (inGuardDefinition) {
        if (/^\}\s*$/.test(raw)) inGuardDefinition = false;
        continue;
      }
      if (raw.trim() === "" || /^\s*#/.test(raw)) continue;

      if (/^\s*(readonly\s+)?(-a\s+)?PDLC_FAULT_TOKENS=\(/.test(raw)) {
        if (!/\)\s*$/.test(raw)) inTokenDeclaration = true;
        continue;
      }
      if (new RegExp(String.raw`^\s*(function\s+)?${GUARD}\s*\(\s*\)\s*\{`).test(raw)) {
        inGuardDefinition = true;
        continue;
      }

      // A heredoc opened on THIS line only suppresses subsequent lines, so the redirection is
      // recorded before the line itself is scanned (a `<<` and a real call site can share a line).
      const heredocOpen = raw.match(/<<-?\s*(["']?)([A-Za-z_][A-Za-z0-9_]*)\1/);
      // Strip a trailing comment (`#` that is neither escaped nor part of `$#`).
      const code = raw.replace(/(^|[^\\$])#.*$/, "$1");

      if (code.includes(GUARD)) {
        for (const segment of code.split(/;|&&|\|\||\|/)) {
          if (!segment.includes(GUARD)) continue;
          // Command position: after `if`/`then`/`while`/`until`/`elif`/`do`/`!`/start-of-segment.
          const m = segment.match(
            new RegExp(
              String.raw`(?:^|\s)(?:!\s+|if\s+|then\s+|elif\s+|while\s+|until\s+|do\s+)*${GUARD}(?:\s+(\S+))?`
            )
          );
          const rawArg1 = m && m[1] !== undefined ? m[1] : null;
          sites.push({ file: rel, line: lineNo, rawArg1, literal: t48LiteralOf(rawArg1) });
        }
      }
      if (heredocOpen) heredocDelimiter = heredocOpen[2];
    }
  }
  return sites;
}

/**
 * `"tok"` / `'tok'` / bare `tok` → `tok`; anything carrying `$`, a backtick, a glob or command
 * substitution → `null` (rule 1's "argument 1 is always a bare literal token"). The accepted
 * shape is the M6 charset TSPEC §5.1.1 fixes for the token namespace — deliberately NOT a
 * membership test against any token list (see the independence note above).
 */
function t48LiteralOf(rawArg1) {
  if (rawArg1 === null) return null;
  const m = rawArg1.match(/^(?:"([^"$`\\]*)"|'([^'\\]*)'|([^"'$`\s\\*?]+))$/);
  if (!m) return null;
  const value = m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3];
  return M6_ID_REGEX.test(value) ? value : null;
}

// ───────────────────────────── PROP-SEAM-03's TSPEC-sourced partition ─────────────────────

/**
 * Reads TSPEC §5.1.1's selector table — the **document**, not C1's
 * `_pdlc_fault_is_selector_bearing` and not a list hard-coded here. PROPERTIES §8.1 requires the
 * partition to be "read from TSPEC §5.1.1, not re-derived": a copy in this file would go green
 * against an implementation that disagrees with the spec as long as the copy drifted with it.
 *
 * @returns {{bearing: string[], nonBearing: string[]}}
 */
function t48ReadSelectorPartitionFromTspec() {
  const text = readFileSync(T48_TSPEC_PATH, "utf8");
  const start = text.indexOf("#### 5.1.1");
  if (start < 0) throw new Error(`t48ReadSelectorPartitionFromTspec: no "#### 5.1.1" heading in ${T48_TSPEC_PATH}`);
  const rest = text.slice(start + 1);
  const endRel = rest.search(/\n#{1,4} /);
  const section = endRel < 0 ? rest : rest.slice(0, endRel);

  const bearing = [];
  const nonBearing = [];
  for (const line of section.split("\n")) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1);
    if (cells.length < 3) continue;
    if (/^[\s:-]+$/.test(cells[0])) continue; // the `|---|` separator row
    const tokens = [...cells[0].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    if (tokens.length === 0) continue; // the header row (`Token`, unbackticked)
    const verdict = cells[1].trim();
    if (/\*\*yes\*\*/.test(verdict)) bearing.push(...tokens);
    else if (/\*\*no\*\*/.test(verdict)) nonBearing.push(...tokens);
    else throw new Error(`t48ReadSelectorPartitionFromTspec: unreadable Selector? cell ${JSON.stringify(verdict)}`);
  }
  return { bearing, nonBearing };
}

// ───────────────────────────── shared fixture / snapshot helpers ─────────────────────────

/**
 * A three-row tree with two independently faultable rows for every selector-bearing token:
 * `row-1` and `row-3` are both `stale` (so both are read, backed up and copied) and both retire a
 * present consumer file (so both reach the retirement delete), while `row-2` is `in-sync`. Two
 * candidate scopes per guard is what makes "scoped ≠ unscoped" a real assertion — with one
 * candidate, an implementation that drops the selector entirely would be indistinguishable.
 */
function t48MakeScopedPlugin() {
  return makePluginTree({
    rows: [
      { id: "row-1", retires: [".claude/workflows/legacy-1.js"] },
      { id: "row-2" },
      { id: "row-3", retires: [".claude/workflows/legacy-3.js"] },
    ],
  });
}

function t48BuildScopedFixture(sharedPlugin) {
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: false,
    files: {
      ".claude/workflows/legacy-1.js": "legacy-1-bytes",
      ".claude/workflows/legacy-3.js": "legacy-3-bytes",
    },
  });
  const trees = { consumer, plugin: sharedPlugin };
  setRowState(trees, "row-1", "stale");
  setRowState(trees, "row-2", "in-sync");
  setRowState(trees, "row-3", "stale");
  return { consumer, plugin: sharedPlugin, cleanup: () => consumer.cleanup() };
}

/** The drift record's `rows[]` keyed by id, timestamps stripped — the per-row comparison unit. */
function t48RowsById(consumerRoot) {
  const record = readDriftState(consumerRoot);
  const out = new Map();
  for (const row of (record && record.rows) || []) out.set(row.id, stripTimestamps(row));
  return out;
}

/**
 * `relative path → sha1` for every regular file under `.claude/workflows`, excluding the two JSON
 * artifacts (compared separately, modulo timestamps) and `.pdlc-backups/` (whose names embed a
 * wall-clock stamp). This is PROP-SEAM-05's "consumer tree" observable.
 */
function t48WorkflowsTreeDigest(consumerRoot) {
  const base = join(consumerRoot, ".claude", "workflows");
  const out = {};
  const walk = (dir, prefix) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir).sort()) {
      if (name === ".pdlc-backups" || name === ".pdlc-drift-state.json" || name === ".pdlc-sync-manifest.json") continue;
      const abs = join(dir, name);
      const rel = prefix ? `${prefix}/${name}` : name;
      const st = statSync(abs);
      if (st.isDirectory()) walk(abs, rel);
      else out[rel] = createHash("sha1").update(readFileSync(abs)).digest("hex");
    }
  };
  walk(base, "");
  return out;
}

/** Everything an unrelated seam is allowed to leave untouched, in one comparable value. */
function t48ObservablesOf(run, consumerRoot) {
  return {
    status: run.status,
    stdout: run.stdout,
    stderr: run.stderr,
    driftState: stripTimestamps(readDriftState(consumerRoot)),
    syncManifest: stripTimestamps(readSyncManifest(consumerRoot)),
    tree: t48WorkflowsTreeDigest(consumerRoot),
  };
}

// ═══════════════════════════════ PROP-SEAM-01 ═══════════════════════════════

/**
 * PROP-SEAM-01 — Recognition equals the enumeration (PROPERTIES §8.1).
 * (a) every one of the sixteen enumerated tokens is recognised: no N-7.
 * (b) four generated non-members, **one draw from each of §8.1's four classes**, each print N-7
 *     exactly once with the whole spec text and leave the run byte-equivalent to the seam-unset
 *     run.
 * Falsification subject: C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`) — see the ledger fragment.
 */
describe("PROP-SEAM-01 — recognition equals the enumeration (§8.1)", () => {
  const tokens = readFaultTokens(); // oracle A: C1's runtime array (§8.0), never the file text

  it.each(tokens.map((t) => [t]))(
    "(a) PDLC_FAULT=%s is recognised — no N-7 line at all",
    (token) => {
      const sharedPlugin = makePluginTree({});
      const fixture = buildSyncedConsumer(sharedPlugin);
      try {
        const run = runEntrypoint(fixture, "hook", [token]);
        // The whole content of (a): a recognised token is never reported as unrecognised. The
        // complementary claim — that each of these tokens actually gates a guard rather than
        // being an inert list entry — is PROP-SEAM-02's superset direction, deliberately not
        // re-asserted here (§8.0: no single edit may make both oracles green).
        expect(countOf(run.stderr, "N-7")).toBe(0);
        expect(N7_FULL_LINE.test(run.stderr)).toBe(false);
      } finally {
        fixture.cleanup();
        sharedPlugin.cleanup();
      }
    },
    30000
  );

  it(
    "(b) four non-member classes — one draw each — print N-7 once and perturb nothing",
    () => {
      const rng = seeded(T48_SEED);
      const members = new Set(tokens);

      // Class 1 — an unrelated M6-conforming string (the control that proves N-7 fires at all).
      let unrelated = genId(rng);
      while (members.has(unrelated)) unrelated = genId(rng);

      // Class 2 — an edit-distance-1, case-preserving mutation of a drawn member: falsifies a
      // prefix/substring match instead of an exact one.
      const victim = rng.pick(tokens);
      const mutations = [
        `${victim}${rng.pick(["r", "x", "z"])}`, // append one character
        victim.slice(0, -1), // delete one character
        `${victim.slice(0, -1)}${victim.endsWith("t") ? "s" : "t"}`, // substitute one character
      ].filter((s) => s.length > 0 && !members.has(s));
      const editDistance1 = rng.pick(mutations);

      // Class 3 — a member with leading OR trailing whitespace: falsifies an implementation that
      // trims (TSPEC §5.1's no-trim rule).
      const spacedVictim = rng.pick(tokens);
      const whitespaced = rng.int(0, 1) === 0 ? ` ${spacedVictim}` : `${spacedVictim} `;

      // Class 4 — a member with its case changed, otherwise identical: falsifies a
      // case-insensitive comparison (`shopt -s nocasematch`, `${x,,}`).
      const casedVictim = rng.pick(tokens);
      const caseChanged = casedVictim.toUpperCase();

      const draws = [
        ["unrelated M6 string", unrelated],
        ["edit-distance-1 mutation", editDistance1],
        ["leading/trailing whitespace", whitespaced],
        ["changed case", caseChanged],
      ];

      // Each class contributes exactly one draw, by construction rather than by luck (SE F-15),
      // and no draw may accidentally BE a member — that would make the case vacuous.
      expect(draws).toHaveLength(4);
      for (const [, spec] of draws) expect(members.has(spec)).toBe(false);
      expect(new Set(draws.map(([, s]) => s)).size).toBe(4);

      const sharedPlugin = makePluginTree({});
      const clean = buildSyncedConsumer(sharedPlugin);
      const faultedFixtures = [];
      try {
        const cleanRun = runEntrypoint(clean, "hook", []); // the one seam-unset comparison run
        for (const [className, spec] of draws) {
          const faulted = buildSyncedConsumer(sharedPlugin);
          faultedFixtures.push(faulted);
          const faultedRun = runEntrypoint(faulted, "hook", [spec]);

          expect({ className, n7: countOf(faultedRun.stderr, "N-7") }).toEqual({ className, n7: 1 });
          const match = MESSAGES["N-7"].exec(faultedRun.stderr);
          expect(match).not.toBeNull();
          expect(match.groups.token).toBe(spec); // the WHOLE spec text, verbatim
          expect(faultedRun.stderr.replace(N7_FULL_LINE, "").trim()).toBe("");
          expectByteEquivalentRuns(faultedRun, faulted, cleanRun, clean);
          expect(faultedRun.status).toBe(0); // AC-2.4 — the hook exits 0 always
        }
      } finally {
        for (const f of faultedFixtures) f.cleanup();
        clean.cleanup();
        sharedPlugin.cleanup();
      }
    },
    60000
  );
});

// ═══════════════════════════════ PROP-SEAM-02 ═══════════════════════════════

/**
 * PROP-SEAM-02 — Static call-site closure (PROPERTIES §8.1). The set of literal FIRST arguments
 * to `pdlc_fault_active` across the three shipped bash sources equals `readFaultTokens()`.
 * Falsification subject: C1/C2/C3. In-process, zero spawns beyond `readFaultTokens()`'s one.
 *
 * The two oracles are independent by construction — see `t48ExtractGuardCallSites`'s header.
 */
describe("PROP-SEAM-02 — the static call-site closure over the three shipped bash sources (§8.1)", () => {
  const enumerated = readFaultTokens(); // oracle A — C1's runtime array
  const sites = t48ExtractGuardCallSites(); // oracle B — the three files as text

  it("the extractor reached the subject: it found guard call sites in more than one shipped file", () => {
    // A silently-empty scan (renamed guard, wrong path, an over-eager heredoc/comment exclusion)
    // would make every conjunct below vacuous or trivially symmetric, so the scan asserts about
    // itself first — the same discipline `readFaultTokens()`'s sanity conjunct applies to oracle A.
    expect(sites.length).toBeGreaterThan(0);
    expect(new Set(sites.map((s) => s.file)).size).toBeGreaterThan(1);
  });

  it("rule 1 — argument 1 is a bare literal at every call site (argument 2 is unconstrained)", () => {
    const nonLiteral = sites.filter((s) => s.literal === null);
    expect(
      nonLiteral.map((s) => `${s.file}:${s.line} — argument 1 is ${JSON.stringify(s.rawArg1)}`)
    ).toEqual([]);
  });

  it("subset — every guarded token is in the enumeration (FSPEC §10 O-10)", () => {
    const guarded = [...new Set(sites.map((s) => s.literal).filter((t) => t !== null))].sort();
    const unenumerated = guarded.filter((t) => !enumerated.includes(t));
    expect(unenumerated).toEqual([]);
  });

  it("superset — every enumerated token has at least one guard (§8.1's anti-padding direction)", () => {
    const guarded = new Set(sites.map((s) => s.literal).filter((t) => t !== null));
    const unguarded = enumerated.filter((t) => !guarded.has(t));
    expect(unguarded).toEqual([]);
  });
});

// ═══════════════════════════════ PROP-SEAM-03 ═══════════════════════════════

/**
 * PROP-SEAM-03 — the selector-bearing partition (PROPERTIES §8.1), with the partition READ FROM
 * TSPEC §5.1.1 rather than hard-coded here, and TSPEC §5.1.1's malformed-selector exception.
 * Falsification subject: C1's `_pdlc_fault_is_selector_bearing` / `_pdlc_fault_ensure_parsed`.
 */
describe("PROP-SEAM-03 — the 7 bearing / 9 non-bearing partition, read from TSPEC §5.1.1", () => {
  const { bearing, nonBearing } = t48ReadSelectorPartitionFromTspec();
  const enumerated = readFaultTokens();

  it("TSPEC §5.1.1's table partitions the enumeration into 7 bearing and 9 non-bearing", () => {
    expect(bearing).toHaveLength(7);
    expect(nonBearing).toHaveLength(9);
    // The partition is over exactly the enumerated set — no token missing, none invented. This
    // is a claim about the two DOCUMENTS agreeing (TSPEC's table vs C1's array); the runtime
    // behaviour is asserted separately below.
    expect([...bearing, ...nonBearing].sort()).toEqual([...enumerated].sort());
    expect(new Set([...bearing, ...nonBearing]).size).toBe(16);
  });

  describe("non-bearing tokens — a selector makes the spec malformed (§5.1.1, §5.4 rule 4)", () => {
    let sharedPlugin;
    let clean;
    let cleanRun;
    const built = [];

    beforeAll(() => {
      sharedPlugin = makePluginTree({});
      clean = buildSyncedConsumer(sharedPlugin);
      cleanRun = runEntrypoint(clean, "hook", []);
    }, 60000);

    afterAll(() => {
      for (const f of built) f.cleanup();
      if (clean) clean.cleanup();
      if (sharedPlugin) sharedPlugin.cleanup();
    });

    it.each(nonBearing.map((t) => [t]))(
      "%s + a selector — N-7 exactly once with the whole spec text, nothing injected",
      (token) => {
        const selector = genId(seeded(T48_SEED + token.length));
        const specText = `${token}:${selector}`;
        const faulted = buildSyncedConsumer(sharedPlugin);
        built.push(faulted);
        const faultedRun = runEntrypoint(faulted, "hook", [specText]);

        expect(countOf(faultedRun.stderr, "N-7")).toBe(1);
        const match = MESSAGES["N-7"].exec(faultedRun.stderr);
        expect(match).not.toBeNull();
        expect(match.groups.token).toBe(specText);
        expectByteEquivalentRuns(faultedRun, faulted, cleanRun, clean);
      },
      30000
    );
  });

  describe("bearing tokens — a well-formed selector scopes the fault to exactly that scope key", () => {
    let sharedPlugin;
    let baseline;
    let baselineRows;
    let baselineRun;
    const built = [];

    beforeAll(() => {
      sharedPlugin = t48MakeScopedPlugin();
      baseline = t48BuildScopedFixture(sharedPlugin);
      baselineRun = runScript("sync", {
        consumerRoot: baseline.consumer.root,
        home: baseline.consumer.home,
        pluginRoot: sharedPlugin.pluginRoot,
      });
      baselineRows = t48RowsById(baseline.consumer.root);
      // The fixture must actually give the loop something to do, or "the loop continues over the
      // rest" is unobservable and every conjunct below passes for the wrong reason.
      expect(baselineRows.size).toBe(3);
    }, 60000);

    afterAll(() => {
      for (const f of built) f.cleanup();
      if (baseline) baseline.cleanup();
      if (sharedPlugin) sharedPlugin.cleanup();
    });

    it.each(bearing.map((t) => [t]))(
      "%s:row-1 — no N-7, only row-1 is affected, and the run differs from the unscoped one",
      (token) => {
        const scoped = t48BuildScopedFixture(sharedPlugin);
        const unscoped = t48BuildScopedFixture(sharedPlugin);
        built.push(scoped, unscoped);

        const runOf = (fixture, fault) =>
          runScript("sync", {
            consumerRoot: fixture.consumer.root,
            home: fixture.consumer.home,
            pluginRoot: sharedPlugin.pluginRoot,
            fault,
          });

        const scopedRun = runOf(scoped, [`${token}:row-1`]);
        const unscopedRun = runOf(unscoped, [token]);

        // (i) a well-formed selector on a bearing token is RECOGNISED — no N-7 at all.
        expect(countOf(scopedRun.stderr, "N-7")).toBe(0);
        expect(countOf(unscopedRun.stderr, "N-7")).toBe(0);

        // (ii) reached the subject: the fault changed something relative to the clean baseline.
        const scopedRows = t48RowsById(scoped.consumer.root);
        const changed =
          scopedRun.stderr !== baselineRun.stderr ||
          scopedRun.status !== baselineRun.status ||
          JSON.stringify([...scopedRows]) !== JSON.stringify([...baselineRows]);
        expect({ token, reachedSubject: changed }).toEqual({ token, reachedSubject: true });

        // (iii) the loop continues over the rest: every row OTHER than the selected one is
        // byte-identical to the clean baseline's record for that row.
        for (const id of ["row-2", "row-3"]) {
          expect({ token, id, row: scopedRows.get(id) }).toEqual({ token, id, row: baselineRows.get(id) });
        }

        // (iv) TSPEC §5.4 rule 4's named failure: a spec that silently DROPS its selector would
        // make the scoped run identical to the unscoped one over a fixture with two candidate
        // scopes. Both runs are conforming; they must not be the same run.
        const unscopedRows = t48RowsById(unscoped.consumer.root);
        const scopedSignature = JSON.stringify([scopedRun.stderr, [...scopedRows]]);
        const unscopedSignature = JSON.stringify([unscopedRun.stderr, [...unscopedRows]]);
        expect({ token, selectorHonoured: scopedSignature !== unscopedSignature }).toEqual({
          token,
          selectorHonoured: true,
        });
      },
      60000
    );
  });

  describe("the malformed-selector exception — a bearing token with a malformed selector is N-7 (SE F-06)", () => {
    let sharedPlugin;
    let clean;
    let cleanRun;
    const built = [];

    beforeAll(() => {
      sharedPlugin = makePluginTree({});
      clean = buildSyncedConsumer(sharedPlugin);
      cleanRun = runEntrypoint(clean, "hook", []);
    }, 60000);

    afterAll(() => {
      for (const f of built) f.cleanup();
      if (clean) clean.cleanup();
      if (sharedPlugin) sharedPlugin.cleanup();
    });

    // TSPEC §5.1.1 names two malformed forms — the empty selector (`backup:`) and the extra
    // colon (`backup:a:b`). Alternating them across the seven bearing tokens covers both forms
    // over the whole bearing half at one run per token (PROPERTIES §1.4's 16-run budget for this
    // property), rather than covering one form seven times.
    it.each(bearing.map((t, i) => [i % 2 === 0 ? `${t}:` : `${t}:a:b`, t]))(
      'PDLC_FAULT="%s" — N-7 once with the whole spec text, nothing injected',
      (specText) => {
        const faulted = buildSyncedConsumer(sharedPlugin);
        built.push(faulted);
        const faultedRun = runEntrypoint(faulted, "hook", [specText]);

        expect(countOf(faultedRun.stderr, "N-7")).toBe(1);
        const match = MESSAGES["N-7"].exec(faultedRun.stderr);
        expect(match).not.toBeNull();
        expect(match.groups.token).toBe(specText);
        expectByteEquivalentRuns(faultedRun, faulted, cleanRun, clean);
      },
      30000
    );
  });
});

// ═══════════════════════════════ PROP-SEAM-04 ═══════════════════════════════

/**
 * PROP-SEAM-04 — a partially-recognised list behaves member-wise (PROPERTIES §8.1, TSPEC §5.4
 * rule 3): the recognised members still inject, N-7 is printed once for the unrecognised one, and
 * the exit is the unrecognised-token exit (hook 0, `--check`/sync 4).
 * Falsification subject: C1's `_pdlc_fault_ensure_parsed` / `pdlc_fault_unrecognised_seen`.
 */
describe("PROP-SEAM-04 — a partially-recognised list injects its recognised members and still exits 4", () => {
  const tokens = readFaultTokens();
  /**
   * Each drawn list is FORCED to contain one token whose injection is observable on a
   * `syncedConsumer` `--check` run (PROPERTIES §6.2's "forced, not hoped for" rule, applied
   * here): otherwise "the recognised members still inject" is satisfied by luck, and rule 3's
   * whole content — that an unrecognised member does NOT void the list — goes untested. These
   * two guards are always reached on this fixture and both change stderr; `sync-manifest-read`
   * is deliberately NOT among them, because a fully in-sync tree decides `in-sync` on hash
   * equality (rung 3) and never reaches the sync-manifest read, so faulting it is a no-op here.
   */
  const OBSERVABLE = ["mkdir", "drift-state-replace"];
  /**
   * The extras are drawn from the enumeration MINUS the two baseline-resolution guards. A run
   * whose repo root does not resolve exits **3** (FSPEC §5.8's precedence, TSPEC §8) before the
   * unrecognised-token exit is reachable, so drawing `git-worktree-list`/`walk-stat` would turn
   * this property into a test of exit precedence rather than of §5.4 rule 3.
   */
  const DRAW_POOL = tokens.filter((t) => t !== "git-worktree-list" && t !== "walk-stat");

  it(
    "four generated k≥1 mixed lists — recognised members inject, one N-7 for the non-member, exit 4 on --check and 0 on the hook",
    () => {
      const rng = seeded(T48_SEED ^ 0x04);
      const members = new Set(tokens);
      const lists = [];
      for (let i = 0; i < 4; i++) {
        const forced = rng.pick(OBSERVABLE);
        const extras = rng.shuffle(DRAW_POOL.filter((t) => t !== forced)).slice(0, rng.int(0, 2));
        let nonMember = genId(rng);
        while (members.has(nonMember)) nonMember = genId(rng);
        lists.push({
          real: [forced, ...extras],
          nonMember,
          specs: rng.shuffle([forced, ...extras, nonMember]),
        });
      }
      for (const l of lists) {
        expect(l.real.length).toBeGreaterThanOrEqual(1); // k ≥ 1
        expect(members.has(l.nonMember)).toBe(false);
        expect(l.specs).toHaveLength(l.real.length + 1);
      }

      const sharedPlugin = makePluginTree({});
      const clean = buildSyncedConsumer(sharedPlugin);
      const built = [];
      try {
        const cleanCheck = runEntrypoint(clean, "check", []);
        expect(cleanCheck.status).toBe(0); // the fixture is green with the seam off

        for (const list of lists) {
          const checkFixture = buildSyncedConsumer(sharedPlugin);
          const hookFixture = buildSyncedConsumer(sharedPlugin);
          built.push(checkFixture, hookFixture);
          const checkRun = runEntrypoint(checkFixture, "check", list.specs);
          const hookRun = runEntrypoint(hookFixture, "hook", list.specs);

          const label = list.specs.join(",");

          // N-7 exactly once — for the ONE unrecognised member, carrying its own text. An
          // implementation that voided the whole list would still print one N-7, which is why
          // the injection conjunct below is what actually separates the two readings.
          expect({ label, n7: countOf(checkRun.stderr, "N-7") }).toEqual({ label, n7: 1 });
          const match = MESSAGES["N-7"].exec(checkRun.stderr);
          expect(match).not.toBeNull();
          expect(match.groups.token).toBe(list.nonMember);

          // The recognised members still injected: the run is NOT the clean run. Compared with
          // the N-7 line removed, so the difference is attributable to the INJECTION and not to
          // the notice the unrecognised member itself prints.
          const injected =
            checkRun.stderr.replace(N7_FULL_LINE, "") !== cleanCheck.stderr ||
            JSON.stringify(stripTimestamps(readDriftState(checkFixture.consumer.root))) !==
              JSON.stringify(stripTimestamps(readDriftState(clean.consumer.root)));
          expect({ label, injected }).toEqual({ label, injected: true });

          // The unrecognised exit, on both surfaces (AC-2.4 / AC-2.9(5), FSPEC §4.6).
          expect({ label, status: checkRun.status }).toEqual({ label, status: 4 });
          expect({ label, status: hookRun.status }).toEqual({ label, status: 0 });
        }
      } finally {
        for (const f of built) f.cleanup();
        clean.cleanup();
        sharedPlugin.cleanup();
      }
    },
    180000
  );
});

// ═══════════════════════════════ PROP-SEAM-05 (fault half) ═══════════════════════════════

/**
 * PROP-SEAM-05 (fault half) — the FAULT seam is inert when it carries nothing (PROPERTIES §8.1,
 * TSPEC §5.1's "`PDLC_FAULT=\"\"` is inert — the variable is treated as unset").
 *
 * §12 splits this property across two files. `driftOrdering.test.js` owns the **trace-file half**
 * — the comparison that varies `PDLC_TRACE_FILE` with `PDLC_FAULT` unset throughout. This file
 * owns the **fault half**: the comparison that varies `PDLC_FAULT` across its two carries-nothing
 * forms (absent, and present-but-empty) while the trace seam is held OFF in both arms, so a
 * failure here localises to the fault seam and cannot be a trace-seam regression in disguise.
 * Falsification subject: C1's `_pdlc_fault_ensure_parsed`.
 */
describe("PROP-SEAM-05 (fault half) — PDLC_FAULT unset and PDLC_FAULT=\"\" are the same run", () => {
  it(
    "three generated trees: every observable is identical whether PDLC_FAULT is absent or empty",
    () => {
      const rng = seeded(T48_SEED ^ 0x05);
      for (let i = 0; i < 3; i++) {
        const rowCount = rng.int(2, 4);
        const rows = [];
        const seenIds = new Set();
        while (rows.length < rowCount) {
          const id = genId(rng);
          if (seenIds.has(id)) continue;
          seenIds.add(id);
          rows.push({ id, content: rng.bytes(rng.int(16, 96)) });
        }
        const plugin = makePluginTree({ rows });
        const absentTree = makeConsumerTree({ git: true, claudeDir: false });
        const emptyTree = makeConsumerTree({ git: true, claudeDir: false });
        try {
          // Arm A — neither seam set at all.
          const absentRun = runScript("sync", {
            consumerRoot: absentTree.root,
            home: absentTree.home,
            pluginRoot: plugin.pluginRoot,
            trace: false,
          });
          // Arm B — the fault seam present in the environment but carrying nothing (§5.1). The
          // harness only exports PDLC_FAULT when `fault` is non-empty, so the empty value is set
          // through `env` explicitly; `trace: false` keeps the trace seam off in both arms.
          const emptyRun = runScript("sync", {
            consumerRoot: emptyTree.root,
            home: emptyTree.home,
            pluginRoot: plugin.pluginRoot,
            trace: false,
            env: { PDLC_FAULT: "" },
          });

          // Reached the subject: an empty-but-present PDLC_FAULT must not be silently ignored by
          // the harness either — the arms genuinely differ in their environment.
          expect(absentRun.status).toBe(0);
          expect(t48ObservablesOf(emptyRun, emptyTree.root)).toEqual(
            t48ObservablesOf(absentRun, absentTree.root)
          );
          // In particular: no N-7. An implementation that treated "" as one empty, unrecognised
          // spec would print N-7 and take exit 4 — the exact regression this half forbids.
          expect(countOf(emptyRun.stderr, "N-7")).toBe(0);
        } finally {
          absentTree.cleanup();
          emptyTree.cleanup();
          plugin.cleanup();
        }
      }
    },
    120000
  );
});

// ═══════════════════════════════ PROP-SEAM-06 ═══════════════════════════════

/**
 * PROP-SEAM-06 — `M6_ID_REGEX` excludes every delimiter both seams use (PROPERTIES §8.2).
 * 500 generated draws plus §6.2's forced adversarial forms; in-process, zero spawns.
 * Falsification subject: `pdlc/workflows/lib/document-oracles.mjs`'s `M6_ID_REGEX` (and, through
 * TSPEC §11.3 row 1's single-declaration rule, C1's `PDLC_M6_ID_REGEX`).
 */
describe("PROP-SEAM-06 — M6_ID_REGEX excludes both seams' delimiters over generated members (§8.2)", () => {
  const DELIMITERS = Object.freeze([
    [",", "the PDLC_FAULT spec separator (TSPEC §5.1)"],
    [":", "the PDLC_FAULT selector separator (TSPEC §5.1)"],
    ["\t", "the PDLC_TRACE_FILE field delimiter (TSPEC §4.1)"],
    ["\n", "the trace record separator (TSPEC §4.1)"],
  ]);

  it("500 generated draws (with §6.2's forced adversarial proportions) contain no seam delimiter", () => {
    const rng = seeded(T48_SEED ^ 0x06);
    const draws = [];
    // §6.2 rule 2: the adversarial proportions are FORCED, not hoped for — the shapes most likely
    // to smuggle a delimiter past a lazy charset (dotted, hyphenated, stamp-shaped) are quotas.
    for (let i = 0; i < 500; i++) {
      if (i % 10 === 0) draws.push(genId(rng, { containsDot: true }));
      else if (i % 10 === 1) draws.push(genId(rng, { containsHyphen: true }));
      else if (i % 20 === 2) draws.push(genId(rng, { stampShaped: true }));
      else draws.push(genId(rng));
    }
    expect(draws).toHaveLength(500);
    expect(draws.filter((d) => d.includes(".")).length / 500).toBeGreaterThanOrEqual(0.1);
    expect(draws.filter((d) => d.includes("-")).length / 500).toBeGreaterThanOrEqual(0.1);
    expect(draws.filter((d) => /\d{8}T\d{6}Z/.test(d)).length / 500).toBeGreaterThanOrEqual(0.05);

    for (const draw of draws) {
      // Reached the subject: every draw really is an M6 member, so the exclusions below are
      // claims about the member set and not about strings the regex already rejects.
      expect({ draw, member: M6_ID_REGEX.test(draw) }).toEqual({ draw, member: true });
      for (const [ch, why] of DELIMITERS) {
        expect({ draw, why, contains: draw.includes(ch) }).toEqual({ draw, why, contains: false });
      }
    }
  });

  it("and the exclusion holds in the other direction — inserting a delimiter into a member breaks it", () => {
    const rng = seeded(T48_SEED ^ 0x60);
    for (let i = 0; i < 20; i++) {
      const member = genId(rng);
      for (const [ch, why] of DELIMITERS) {
        const at = 1 + (i % Math.max(1, member.length - 1));
        const mutated = member.slice(0, at) + ch + member.slice(at);
        expect({ mutated, why, member: M6_ID_REGEX.test(mutated) }).toEqual({ mutated, why, member: false });
      }
    }
  });
});
