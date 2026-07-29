/**
 * bootstrap.test.js — AT-24: the fresh-clone bootstrap sequence (TSPEC §9, O-12).
 *
 * A fresh clone of this repo, with no plugin installed and `CLAUDE_PLUGIN_ROOT`
 * unset, runs `node pdlc/workflows/build-runtime.mjs` then the real
 * `sync-workflows.sh` and `sync-workflows.sh --check` — the actual bootstrap a
 * maintainer performs. AT-24's seven assertions (§9.2) and the two independent
 * mode-bit objects over the five shipped scripts (§9.3) are asserted here.
 *
 * RED (batch 2): this file's own test cases are authored and correct against
 * the TSPEC, but every one of the following collaborators is still unwritten,
 * so the whole file fails to load / every case throws on the missing
 * module or export until the batches that own them land:
 *   - __tests__/helpers/freshClone.js       (makeFreshClone)            — T-17
 *   - __tests__/helpers/driftHarness.js     (runScript, readDriftState,
 *                                             indexMode)                 — T-01/T-08a/T-15
 *   - __tests__/helpers/driftOrdering.js    (assertClassifyBeforeCreate,
 *                                             assertTreeUnchanged)       — T-01/T-16
 *   - __tests__/helpers/driftHarness.js     (MESSAGES)                  — T-08b
 *   - pdlc/workflows/orchestrate-queue.js   (validateDriftRecord,
 *                                             mapDriftState)             — T-04/T-12/T-13
 * This is the RED-terminal, batch-2 authoring pass (PLAN T-06): no source file
 * is created by this task, only this test file.
 */

import { execFileSync } from "child_process";
import {
  accessSync,
  constants as fsConstants,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import { createHash } from "crypto";
import { dirname, join, relative, resolve, sep } from "path";
import { fileURLToPath } from "url";

import { makeFreshClone } from "./helpers/freshClone.js";
import { runScript, readDriftState, indexMode } from "./helpers/driftHarness.js";
import { assertClassifyBeforeCreate, assertTreeUnchanged } from "./helpers/driftOrdering.js";
import { MESSAGES } from "./helpers/driftHarness.js";
import { validateDriftRecord, mapDriftState } from "../orchestrate-queue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// LIVE_ROOT: the repo itself — TSPEC §13.4 (`resolve(__dirname, "../../..")`, realpath-normalised).
// __dirname here is pdlc/workflows/__tests__, so three levels up is the repo root.
const LIVE_ROOT = resolve(__dirname, "..", "..", "..");

// TSPEC §9.3: all five shipped scripts, `lib/pdlc-drift.sh` deliberately excluded (sourced, no
// execute bit — OQ-4).
const FIVE_SCRIPTS = [
  "pdlc/hooks/scripts/check-workflow-drift.sh",
  "pdlc/hooks/scripts/sync-workflows.sh",
  "pdlc/hooks/scripts/check-scope-field.sh",
  "pdlc/hooks/scripts/guard-harvest-before-delete.sh",
  "pdlc/hooks/scripts/nudge-consolidation.sh",
];

/**
 * A recursive snapshot of `root`: relative path, type, mode, and sha1 of every
 * regular file, excluding any path with a `.git/` segment (TSPEC §8.3 — the
 * same shape `assertTreeUnchanged` is documented to compare). Built locally
 * rather than imported, because §9.2 assertion 6 needs a "before" snapshot of
 * an empty directory and no shared snapshot-builder export is named in the
 * TSPEC text this task was handed.
 */
function snapshotTree(root) {
  const entries = [];
  const walk = (dir) => {
    let dirEntries;
    try {
      dirEntries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of dirEntries) {
      const abs = join(dir, entry.name);
      const rel = relative(root, abs);
      if (rel.split(sep).includes(".git")) continue;
      if (entry.isDirectory()) {
        walk(abs);
      } else if (entry.isFile()) {
        const stat = statSync(abs);
        const sha1 = createHash("sha1").update(readFileSync(abs)).digest("hex");
        entries.push({ path: rel, type: "file", mode: stat.mode & 0o777, sha1 });
      }
    }
  };
  walk(root);
  return entries;
}

describe("AT-24: fresh-clone bootstrap sequence (build-runtime -> sync -> check)", () => {
  let clone;
  let homeBefore;
  let manifest;
  let syncRun;
  let checkRun;
  let driftState;

  beforeAll(() => {
    clone = makeFreshClone();

    // §9.1 step 4: home is a sibling temp dir, nothing written into it — snapshot it before
    // the two commands run so assertion 6 has a genuine "before" state to diff against.
    homeBefore = snapshotTree(clone.home);

    // §9.2's run sequence: build the bundles/manifest, then sync, then check — over the same
    // clone, `pluginRoot` deliberately undefined so `CLAUDE_PLUGIN_ROOT` is absent and the
    // maintainer-marker branch (FSPEC §2.4) resolves `<pluginRoot>` to `<root>/pdlc`.
    execFileSync("node", ["pdlc/workflows/build-runtime.mjs"], {
      cwd: clone.root,
      encoding: "utf8",
    });

    manifest = JSON.parse(
      readFileSync(join(clone.root, "pdlc/workflows/dist/distribution-manifest.json"), "utf8")
    );

    syncRun = runScript("sync", {
      consumerRoot: clone.root,
      pluginRoot: undefined,
      home: clone.home,
    });

    checkRun = runScript("check", {
      consumerRoot: clone.root,
      pluginRoot: undefined,
      home: clone.home,
    });

    driftState = readDriftState(clone.root);
  });

  afterAll(() => {
    clone?.cleanup();
  });

  // ── §9.2 assertion 1 ──────────────────────────────────────────────────────
  it("assertion 1: both bundles and the distribution manifest exist under <root>/pdlc/workflows/dist/", () => {
    const distDir = join(clone.root, "pdlc/workflows/dist");
    expect(existsSync(join(distDir, "orchestrate-dev.bundle.js"))).toBe(true);
    expect(existsSync(join(distDir, "orchestrate-queue.bundle.js"))).toBe(true);
    expect(existsSync(join(distDir, "distribution-manifest.json"))).toBe(true);
  });

  // ── §9.2 assertion 2 ──────────────────────────────────────────────────────
  it("assertion 2: after sync, every row is in-sync in the written drift state and writeFailures is empty", () => {
    expect(driftState).not.toBeNull();
    expect(Array.isArray(driftState.rows)).toBe(true);
    expect(driftState.rows.length).toBeGreaterThan(0);
    for (const row of driftState.rows) {
      expect(row.state).toBe("in-sync");
    }
    expect(driftState.writeFailures).toEqual([]);
  });

  // ── §9.2 assertion 3 ──────────────────────────────────────────────────────
  it("assertion 3: runScript(\"check\") exits 0", () => {
    expect(checkRun.status).toBe(0);
  });

  // ── §9.2 assertion 4 ──────────────────────────────────────────────────────
  it("assertion 4: mapDriftState(validateDriftRecord(raw)) yields { outcome: \"proceed\", row: 9 }", () => {
    const validated = validateDriftRecord(driftState);
    const gate = mapDriftState(validated);
    expect(gate).toMatchObject({ outcome: "proceed", row: 9 });
  });

  // ── §9.2 assertion 5 ──────────────────────────────────────────────────────
  it("assertion 5: the as-found pass classifies every row missing (ancestor rule), and every mkdir follows every as-found classify on the sync run", () => {
    const expectedRowIds = manifest.rows.map((row) => row.id);

    // Positive-presence, ordering, and manifest-precedence conjuncts (§4.3(a)-(d)).
    assertClassifyBeforeCreate(syncRun.trace, expectedRowIds);

    // The clone excludes `.claude/workflows/` entirely (§9.1 step 1), so the ancestor rule
    // (§3.2) resolves every row's as-found state to "missing".
    const asFoundClassifies = syncRun.trace.filter(
      (record) => record.phase === "as-found" && record.op === "classify"
    );
    expect(asFoundClassifies.length).toBe(expectedRowIds.length);
    for (const record of asFoundClassifies) {
      expect(String(record.arg)).toBe("missing");
    }
  });

  // ── §9.2 assertion 6 ──────────────────────────────────────────────────────
  it("assertion 6: nothing is written under $HOME across either command", () => {
    assertTreeUnchanged(clone.home, homeBefore);
  });

  // ── §9.2 assertion 7 ──────────────────────────────────────────────────────
  it("assertion 7: record.syncCommand is the fully expanded, unquoted, unbraced sync-workflows.sh path, and matches MESSAGES.W-5's captured cmd for a stale row on the same tree", () => {
    const expectedCommand = join(clone.root, "pdlc/hooks/scripts/sync-workflows.sh");
    expect(driftState.syncCommand).toBe(expectedCommand);
    expect(driftState.syncCommand).not.toMatch(/\$/);
    expect(driftState.syncCommand).not.toMatch(/\{/);

    // Make one row `stale` on the same tree, then re-run to capture W-5's remediation and
    // compare it byte-for-byte against record.syncCommand.
    //
    // `stale` is FSPEC §3.3 rung 5 — `sha1(consumer) == syncManifest[id].consumerHash`, i.e.
    // the consumer copy is untouched since its last sync and the PLUGIN's copy moved on.
    // Editing the consumer copy instead lands on rung 6, `local-edit` (W-4), which is a
    // different message with a different (`--force`) command; so the mutation goes to the
    // plugin-side artifact named by the manifest row's `pluginPath`, resolved under
    // `<root>/pdlc` (FSPEC §2.4's maintainer-marker `<pluginRoot>`).
    const staleRow = manifest.rows[0];
    const pluginArtifact = join(clone.root, "pdlc", staleRow.pluginPath);
    expect(existsSync(join(clone.root, staleRow.consumerPath))).toBe(true);

    // The clone is shared across this whole describe via `beforeAll`, so the mutation is
    // captured and restored in a `finally` (CR F-16): without it, every later assertion in
    // this file reads a tree with a permanently `stale` row, and which of them notices depends
    // on jest's ordering. `assertion 7b` below is the falsifier for this restore.
    const pristineBytes = readFileSync(pluginArtifact);
    try {
      writeFileSync(
        pluginArtifact,
        Buffer.concat([pristineBytes, Buffer.from("\n// AT-24 assertion-7 plugin-side mutation\n")])
      );

      // The hook entrypoint, because W-5 belongs to FSPEC §5.2's hook warning taxonomy (order 5,
      // "any row `stale` or `missing`"). `sync-workflows.sh` deliberately emits no W-5 at all —
      // FSPEC §5.4/§5.5's "sync always attempts `stale`/`missing`" — so `--check` is not a
      // surface on which this message is specified to appear.
      const staleCheck = runScript("hook", {
        consumerRoot: clone.root,
        pluginRoot: undefined,
        home: clone.home,
      });

      const match = staleCheck.stderr.match(MESSAGES["W-5"]);
      expect(match).not.toBeNull();
      expect(match.groups.cmd).toBe(driftState.syncCommand);
    } finally {
      writeFileSync(pluginArtifact, pristineBytes);
    }
  });

  // ── CR F-16 ───────────────────────────────────────────────────────────────
  //
  // Assertion 7 mutates the `beforeAll`-shared clone (the plugin-side artifact) to manufacture
  // a `stale` row. Every assertion in this describe reads that same clone, so the mutation must
  // not outlive the assertion that made it — this case is the falsifier for that, and it is
  // deliberately placed immediately after assertion 7 so it observes the clone in the state
  // assertion 7 leaves it in.
  it("assertion 7b: the shared clone is left in sync — assertion 7's plugin-side mutation does not outlive it", () => {
    const rerun = runScript("check", {
      consumerRoot: clone.root,
      pluginRoot: undefined,
      home: clone.home,
    });
    expect(rerun.status).toBe(0);
    for (const row of readDriftState(clone.root).rows) {
      expect(row.state).toBe("in-sync");
    }
  });

  // ── §9.3 mode-bit assertions ──────────────────────────────────────────────
  describe("§9.3: two independent mode-bit objects over all five shipped scripts", () => {
    it.each(FIVE_SCRIPTS)("index mode of %s is 100755 in the live repo", (rel) => {
      expect(indexMode(LIVE_ROOT, rel)).toBe("100755");
    });

    it.each(FIVE_SCRIPTS)("on-disk mode of %s is executable in the fresh clone", (rel) => {
      expect(() => accessSync(join(clone.root, rel), fsConstants.X_OK)).not.toThrow();
    });
  });

  // ── dedicated bare-path invocation, §3.1's one exception ─────────────────
  it("dedicated: a bare-path invocation of sync-workflows.sh (no interpreter) does not exit 126", () => {
    const scriptPath = join(clone.root, "pdlc/hooks/scripts/sync-workflows.sh");
    let status;
    try {
      execFileSync(scriptPath, ["--check"], {
        cwd: clone.root,
        encoding: "utf8",
        env: {
          PATH: process.env.PATH,
          HOME: clone.home,
          PWD: clone.root,
          LC_ALL: "C",
          LANG: "C",
          TZ: "UTC",
        },
      });
      status = 0;
    } catch (err) {
      status = err.status ?? -1;
    }
    // A dedicated assertion, separate from the four assertions above: exit 126 (EACCES /
    // "command not executable") would otherwise surface downstream as "sync produced no
    // drift state", a misleading message (§9.3).
    expect(status).not.toBe(126);
  });
});
