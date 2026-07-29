/**
 * driftLadder.test.js — TSPEC §14: AT-14, AT-14b, AT-15, AT-16; §14.1 V-3.
 *
 * Ownership (PLAN, single-writer-per-file): T-25 (batch 5) owns this file exactly.
 *
 * RED-terminal (PLAN batch 5, same pattern as `driftRecordShape.test.js` in batch 2):
 *   - `mapDriftState` is not yet exported from `orchestrate-queue.js` (T-12, not yet landed) —
 *     the import below fails module resolution with the named reason "does not provide an
 *     export named 'mapDriftState'".
 *   - `check-workflow-drift.sh` / `sync-workflows.sh` do not yet implement the invalidation
 *     ladder (C1/C2, later batches), so even once T-12 lands every `runScript` call here still
 *     fails against the real scripts.
 * This suite is authored to read as green once T-12 and C1/C2 land; nothing here is
 * implementation — T-25 owns only this test file.
 *
 * The invalidation ladder (TSPEC §4.4/§5.3): the normal write path is a sibling-temp + `mv`
 * (fault token `drift-state-replace`). When that fails, rung (i) — an in-place
 * `O_WRONLY|O_TRUNC` write (`drift-state-invalidate`) — is attempted. When that also fails,
 * rung (ii) — `unlink` + fresh write (`drift-state-unlink`) — is attempted. When all three
 * fail, rung (iii) is the residual: the pre-existing record is left byte-unchanged and N-3 is
 * emitted.
 *
 * `RunResult.driftStateInodeBefore` (TSPEC §5.3's automatic pre-capture) is not present on the
 * `runScript` this file imports (T-08a's landed slice) — this file therefore captures the
 * pre-run inode/bytes itself, inline, immediately after fixture construction and immediately
 * before the run, which is the same information §5.3 describes, just captured at the call site
 * rather than by the harness. `driftHarness.js`/`driftFixtures.js`/`driftOrdering.js` are
 * single-writer files owned by other tasks and are not touched here.
 */

import { join } from "path";
import { chmodSync, readFileSync } from "fs";

import { itOrSkip, INVARIANTS_AT_14B, INVARIANTS_AT_16 } from "./helpers/driftCapabilities.js";
import {
  runScript,
  readDriftState,
  inodeOf,
  expectFailOpen,
  allOf,
  countOf,
} from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree } from "./helpers/driftFixtures.js";
import { parseTrace } from "./helpers/driftOrdering.js";
import { validateDriftRecord, mapDriftState } from "../orchestrate-queue.js";

const DRIFT_STATE_REL = [".claude", "workflows", ".pdlc-drift-state.json"];
const WORKFLOWS_DIR_REL = [".claude", "workflows"];

function driftStatePath(root) {
  return join(root, ...DRIFT_STATE_REL);
}

function workflowsDirPath(root) {
  return join(root, ...WORKFLOWS_DIR_REL);
}

// §3.2.1 — a full PATH tool set with every python interpreter deliberately absent, the
// construction AT-14's `jsonToolAbsent` tree needs.
const PATH_TOOLS_NO_JSON_TOOL = ["bash", "git", "shasum", "sha1sum", "mv", "rm", "date", "printf", "mkdir"];

/**
 * §13.1's `preExistingDriftState`: a full, shape-valid drift-state record (FSPEC §1.3's schema),
 * derived from a `makePluginTree()` result so its rows line up with the plugin manifest AT-14b/
 * AT-15/AT-16 exercise. Written to disk *before* any restrictive mode bits are applied — TSPEC
 * §13.1's "written before the mode change".
 */
function preExistingDriftStateRecord(plugin, overrides = {}) {
  const rows = plugin.manifest.rows.map((row) => ({
    id: row.id,
    state: "in-sync",
    reason: null,
    pluginHash: row.pluginSha1,
    consumerHash: row.pluginSha1,
    pluginArtifactVersion: row.artifactVersion,
    consumerArtifactVersion: row.artifactVersion,
  }));
  return {
    schemaVersion: 1,
    generatedAtUtc: "2026-07-28T00:00:00Z",
    generatedBy: "hook",
    pluginVersion: plugin.manifest.pluginVersion,
    checkEnabled: true,
    syncCommand: null,
    baselineStatus: "resolved",
    baselineReason: null,
    retiredPresent: [],
    writeFailures: [],
    rows,
    ...overrides,
  };
}

/** `mapDriftState(validateDriftRecord(raw))`, verbatim per TSPEC §6.5/§12.2 — `raw` is the RAW
 * file text (a string), never a parsed object: `validateDriftRecord` does its own JSON parsing
 * (and fenced-block stripping), so a parsed object here would silently skip the clause it is
 * meant to exercise. */
function mapRawText(rawText) {
  return mapDriftState(validateDriftRecord(rawText));
}

function readDriftStateRawText(root) {
  return readFileSync(driftStatePath(root), "utf8");
}

// Every fixture's cleanup is tracked here and run in `afterEach` (TSPEC §13.6).
let cleanups = [];
function track(tree) {
  cleanups.push(tree.cleanup);
  return tree;
}
afterEach(() => {
  while (cleanups.length) {
    const cleanup = cleanups.pop();
    cleanup();
  }
});

// ───────────────────────────── AT-14 — T1, no interpreter, no pre-existing record ─────────────

describe("AT-14 — json-tool-absent ladder entry (T1 emitter, TSPEC §6.5)", () => {
  it("writes a parseable record through the T1 printf emitter with no interpreter present", () => {
    const plugin = track(makePluginTree());
    const consumer = track(makeConsumerTree({ git: true, claudeDir: true }));

    const run = runScript("hook", {
      consumerRoot: consumer.root,
      pluginRoot: plugin.pluginRoot,
      path: PATH_TOOLS_NO_JSON_TOOL,
    });

    // 1. `readDriftState` parses — asserted by the fact that it does not throw, not by a
    // try/catch in this test (TSPEC §6.5 assertion 1).
    const raw = readDriftState(consumer.root);
    expect(raw).not.toBeNull();

    // 2. The T1-emitter's fixed shape.
    expect(raw.baselineStatus).toBe("unresolved");
    expect(raw.baselineReason).toBe("json-tool-absent");
    expect(raw.pluginVersion).toBeNull();
    expect(raw.syncCommand).toBeNull();
    expect(raw.checkEnabled).toBe(true);
    expect(raw.rows).toEqual([]);
    expect(raw.retiredPresent).toEqual([]);

    // 3. The real §2.4 queue function, not a re-implementation — O-4's second conjunct.
    const rawText = readDriftStateRawText(consumer.root);
    expect(mapRawText(rawText)).toMatchObject({ outcome: "blocked", row: 4 });

    // 4. hook exit 0.
    expect(run.status).toBe(0);

    // 5. The record was written through the ordinary path: `mkdir` precedes `write`, and — since
    // this fixture has no plugin manifest rows classified (`rows: []`, assertion 2) — the trace
    // carries no `classify` record at all (v2.1, TE L-01).
    const trace = parseTrace(run.tracePath);
    const mkdirIndex = trace.findIndex((r) => r.op === "mkdir");
    const writeIndex = trace.findIndex((r) => r.op === "write");
    expect(mkdirIndex).toBeGreaterThanOrEqual(0);
    expect(writeIndex).toBeGreaterThanOrEqual(0);
    expect(mkdirIndex).toBeLessThan(writeIndex);
    expect(trace.some((r) => r.op === "classify")).toBe(false);
  });
});

// ───────────────────────────── AT-14b — rung (i), the permission asymmetry ─────────────────────

describe("AT-14b — rung (i) preserves checkEnabled:false (TSPEC §6.5, §13.1 unwritableParent)", () => {
  itOrSkip(
    "check run: in-place write succeeds though the parent is unwritable — inode unchanged",
    "uid-nonroot",
    INVARIANTS_AT_14B,
    () => {
      const plugin = track(makePluginTree());
      const record = preExistingDriftStateRecord(plugin, { checkEnabled: false });
      const consumer = track(
        makeConsumerTree({
          git: true,
          claudeDir: true,
          config: { distribution: { checkEnabled: false } },
          driftState: record,
          workflowsDir: { mode: 0o500 }, // applied last, per §13.1's unwritableParent recipe
        })
      );
      // §13.1: "drift-state file 0600" — explicit, after the directory mode is set.
      chmodSync(driftStatePath(consumer.root), 0o600);

      const before = inodeOf(driftStatePath(consumer.root));

      const run = runScript("check", { consumerRoot: consumer.root, pluginRoot: plugin.pluginRoot });

      const raw = readDriftState(consumer.root);
      expect(raw).not.toBeNull();
      expect(raw.baselineReason).toBe("drift-state-invalidated");
      expect(raw.pluginVersion).toBeNull();
      expect(raw.syncCommand).toBeNull();
      expect(raw.checkEnabled).toBe(false);
      expect(inodeOf(driftStatePath(consumer.root))).toBe(before);

      const rawText = readDriftStateRawText(consumer.root);
      expect(mapRawText(rawText)).toMatchObject({ outcome: "proceed", row: 2 });

      void run;
    }
  );

  // TSPEC §6.5's second construction note: a sync run over the SAME `r-x` parent additionally
  // blocks copies and the sync-manifest rewrite (both are temp-write-then-`mv`, so the failure
  // surface is the parent — TE F-06, §6.1 note 4). Same six conjuncts, plus those extra
  // `writeFailures` members — the note pinned as a second `it()` rather than merely believed.
  itOrSkip(
    "sync run: same six conjuncts, plus artifact-copy / sync-manifest-update writeFailures",
    "uid-nonroot",
    INVARIANTS_AT_14B,
    () => {
      const plugin = track(makePluginTree());
      const record = preExistingDriftStateRecord(plugin, { checkEnabled: false });
      const consumer = track(
        makeConsumerTree({
          git: true,
          claudeDir: true,
          config: { distribution: { checkEnabled: false } },
          driftState: record,
          workflowsDir: { mode: 0o500 },
        })
      );
      chmodSync(driftStatePath(consumer.root), 0o600);

      const before = inodeOf(driftStatePath(consumer.root));

      runScript("sync", { consumerRoot: consumer.root, pluginRoot: plugin.pluginRoot });

      const raw = readDriftState(consumer.root);
      expect(raw).not.toBeNull();
      expect(raw.baselineReason).toBe("drift-state-invalidated");
      expect(raw.pluginVersion).toBeNull();
      expect(raw.syncCommand).toBeNull();
      expect(raw.checkEnabled).toBe(false);
      expect(inodeOf(driftStatePath(consumer.root))).toBe(before);

      const rawText = readDriftStateRawText(consumer.root);
      expect(mapRawText(rawText)).toMatchObject({ outcome: "proceed", row: 2 });

      const operations = (raw.writeFailures || []).map((f) => f.operation);
      expect(operations).toEqual(expect.arrayContaining(["artifact-copy", "sync-manifest-update"]));
    }
  );
});

// ───────────────────────────── AT-15 — rung (ii) lands ─────────────────────────────────────────

describe("AT-15 — rung (ii) lands: unlink + fresh write (TSPEC §5.3)", () => {
  it("inode changes; stderr names drift-state-replace and drift-state-invalidate, not -unlink", () => {
    const plugin = track(makePluginTree());
    const record = preExistingDriftStateRecord(plugin);
    const consumer = track(
      makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, driftState: record })
    );

    const before = inodeOf(driftStatePath(consumer.root));

    const run = runScript("sync", {
      consumerRoot: consumer.root,
      pluginRoot: plugin.pluginRoot,
      fault: ["drift-state-replace", "drift-state-invalidate"],
    });

    const raw = readDriftState(consumer.root);
    expect(raw).not.toBeNull();

    const after = inodeOf(driftStatePath(consumer.root));
    expect(after).not.toBeNull();
    expect(typeof after).toBe("bigint");
    expect(after).not.toBe(before);

    // The token naming a rung appears exactly when that rung FAILED (TSPEC §5.3, SE F-29 ≡
    // TE F-43) — asserted positively, in the direction the spec fixes.
    expectFailOpen(run, {
      operation: "drift-state-replace",
      entrypoint: "sync",
      root: consumer.root,
    });
    expectFailOpen(run, {
      operation: "drift-state-invalidate",
      entrypoint: "sync",
      root: consumer.root,
    });
    const unlinkMentions = allOf(run.stderr, "W-7").filter(
      (m) => m.groups.operation === "drift-state-unlink"
    );
    expect(unlinkMentions).toHaveLength(0);
  });
});

// ───────────────────────────── AT-16 — rung (iii) residual ─────────────────────────────────────

describe("AT-16 — rung (iii) residual (TSPEC §5.3, §6.1)", () => {
  // Primary — fault-injected, runs on EVERY runner (no permission fixture involved, §6.1 note 2:
  // `drift-state-unlink`'s permission form is not portable and is not used).
  it("--check: the pre-existing record is byte-unchanged, N-3 on stderr, exit 4 (fault form)", () => {
    const plugin = track(makePluginTree());
    const record = preExistingDriftStateRecord(plugin);
    const consumer = track(
      makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, driftState: record })
    );

    const before = readFileSync(driftStatePath(consumer.root));

    const run = runScript("check", {
      consumerRoot: consumer.root,
      pluginRoot: plugin.pluginRoot,
      fault: ["drift-state-replace", "drift-state-invalidate", "drift-state-unlink"],
    });

    const after = readFileSync(driftStatePath(consumer.root));
    expect(after.equals(before)).toBe(true);
    expect(countOf(run.stderr, "N-3")).toBeGreaterThanOrEqual(1);
    expect(run.status).toBe(4);
  });

  it("hook: the same residual, exit 0 (AC-2.4 is absolute)", () => {
    const plugin = track(makePluginTree());
    const record = preExistingDriftStateRecord(plugin);
    const consumer = track(
      makeConsumerTree({ git: true, claudeDir: true, workflowsDir: true, driftState: record })
    );

    const before = readFileSync(driftStatePath(consumer.root));

    const run = runScript("hook", {
      consumerRoot: consumer.root,
      pluginRoot: plugin.pluginRoot,
      fault: ["drift-state-replace", "drift-state-invalidate", "drift-state-unlink"],
    });

    const after = readFileSync(driftStatePath(consumer.root));
    expect(after.equals(before)).toBe(true);
    expect(countOf(run.stderr, "N-3")).toBeGreaterThanOrEqual(1);
    expect(run.status).toBe(0);
  });

  // Corroborating — permission-constructed, non-root only (TSPEC §1.3's named uid-0 inventory:
  // "immutable/unwritable file and unwritable parent"). A read-only drift-state file blocks
  // rung (i)'s in-place write; the unwritable parent blocks both the normal replace and rung
  // (ii)'s unlink — reaching the same residual by real permission denial rather than a token.
  itOrSkip(
    "the residual also lands when both the file and its parent are genuinely unwritable",
    "uid-nonroot",
    INVARIANTS_AT_16,
    () => {
      const plugin = track(makePluginTree());
      const record = preExistingDriftStateRecord(plugin);

      const checkConsumer = track(
        makeConsumerTree({
          git: true,
          claudeDir: true,
          driftState: record,
          workflowsDir: { mode: 0o500 },
        })
      );
      chmodSync(driftStatePath(checkConsumer.root), 0o400);
      const beforeCheck = readFileSync(driftStatePath(checkConsumer.root));
      const checkRun = runScript("check", {
        consumerRoot: checkConsumer.root,
        pluginRoot: plugin.pluginRoot,
      });
      const afterCheck = readFileSync(driftStatePath(checkConsumer.root));
      expect(afterCheck.equals(beforeCheck)).toBe(true);
      expect(countOf(checkRun.stderr, "N-3")).toBeGreaterThanOrEqual(1);
      expect(checkRun.status).toBe(4);

      const hookConsumer = track(
        makeConsumerTree({
          git: true,
          claudeDir: true,
          driftState: record,
          workflowsDir: { mode: 0o500 },
        })
      );
      chmodSync(driftStatePath(hookConsumer.root), 0o400);
      const hookRun = runScript("hook", {
        consumerRoot: hookConsumer.root,
        pluginRoot: plugin.pluginRoot,
      });
      expect(hookRun.status).toBe(0);

      void workflowsDirPath; // referenced for path construction only in comments above
    }
  );
});

// ───────────────────────────── §14.1 V-3 — AC-2.6 generatedAtUtc ───────────────────────────────

describe("V-3 — AC-2.6: generatedAtUtc is present and ISO-8601 Z (§14.1)", () => {
  it("a green run's record carries generatedAtUtc, asserted once on a record not otherwise normalised", () => {
    const plugin = track(makePluginTree());
    const consumer = track(makeConsumerTree({ git: true, claudeDir: true }));

    runScript("hook", { consumerRoot: consumer.root, pluginRoot: plugin.pluginRoot });

    const raw = readDriftState(consumer.root);
    expect(raw).not.toBeNull();
    expect(raw.generatedAtUtc).toEqual(expect.any(String));
    expect(raw.generatedAtUtc).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});
