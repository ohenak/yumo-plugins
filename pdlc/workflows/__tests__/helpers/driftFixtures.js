/**
 * driftFixtures.js — Consumer/plugin tree builders and row-state construction (TSPEC §3.3,
 * §13.1, §13.5, §13.6).
 *
 * Ownership (PLAN, single-writer-per-file): T-15 (batch 4). Gated by
 * `driftHelpers.test.js`'s T-01 clause (b) — every builder contract this row implements has a
 * named case there.
 *
 * Three exports form the core surface (TSPEC §3.3):
 *   - `makeConsumerTree(spec)`  — a consumer repo tree, eight independently-settable clauses.
 *   - `makePluginTree(spec)`    — a plugin `workflows/dist/` tree plus a computed
 *     `distribution-manifest.json` (FSPEC §1.1), `pluginSha1` derived from the bytes just
 *     written so M8/M9 hold by construction.
 *   - `setRowState(trees, id, state, opts)` — writes a consumer artifact (and sync-manifest
 *     entry, where the state has one) to realise one of §3.3's six row states, then
 *     RE-DERIVES the classification from what it just built and throws on a mismatch — the
 *     fixture builder is its own first oracle, so a mis-built "stale" that happens to land on
 *     "in-sync" (rung 3 precedes rung 5) or a "local-edit" missing its manifest entry (which
 *     degrades to "unverified", rung 4 precedes rung 6) fails loudly at construction time
 *     rather than producing a silently mis-classified fixture.
 *
 * Every returned tree carries an idempotent, never-throwing `cleanup()` that recursively
 * chmods the whole tree back to writable before `rmSync` (TSPEC §13.6) — this is what lets a
 * test freely chmod part of a fixture (e.g. to 0o000) and still tear down without special
 * handling.
 *
 * §13.5's backup fixtures (`sameSecondBackups`, `shuffledMtimes`, `decoyBackupDir`,
 * `nnExhausted`) populate the `.pdlc-backups/` directory of an *already-constructed* consumer
 * tree — they do not own a root of their own, so there is no separate `cleanup()` to return;
 * the owning consumer tree's `cleanup()` covers them.
 */

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { dirname, join } from "path";
import { tmpdir } from "os";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  chmodSync,
  lstatSync,
  rmSync,
  realpathSync,
  utimesSync,
} from "fs";

// ───────────────────────────── artifact paths (mirrors driftHarness.js) ─────────────────────────────

const CLAUDE_DIR_REL = [".claude"];
const WORKFLOWS_DIR_REL = [".claude", "workflows"];
const CONFIG_REL = [".claude", "pdlc.config.json"];
const DRIFT_STATE_REL = [".claude", "workflows", ".pdlc-drift-state.json"];
const SYNC_MANIFEST_REL = [".claude", "workflows", ".pdlc-sync-manifest.json"];
const BACKUPS_DIR_REL = [".claude", "workflows", ".pdlc-backups"];

function sha1(bytes) {
  return createHash("sha1").update(bytes).digest("hex");
}

function asBuffer(content) {
  return Buffer.isBuffer(content) ? content : Buffer.from(content);
}

function writeFileEnsuringDir(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

/**
 * Recursively restores writable/traversable permissions under `root` (files 0o666, dirs
 * 0o777), tolerating any path that no longer exists or cannot be stat'd. Symlinks are left
 * alone rather than followed, so cleanup never chmods or deletes outside the fixture tree.
 * This is what makes `cleanup()` succeed over a fixture a test locked down with
 * `chmodSync(..., 0o000)` (TSPEC §13.6).
 */
function chmodTreeWritable(root) {
  if (!root || !existsSync(root)) return;
  let stat;
  try {
    stat = lstatSync(root);
  } catch {
    return;
  }
  if (stat.isSymbolicLink()) return;
  try {
    chmodSync(root, stat.isDirectory() ? 0o777 : 0o666);
  } catch {
    // best-effort — cleanup must never throw (§13.6)
  }
  if (stat.isDirectory()) {
    let entries = [];
    try {
      entries = readdirSync(root);
    } catch {
      return;
    }
    for (const entry of entries) {
      chmodTreeWritable(join(root, entry));
    }
  }
}

function makeTreeCleanup(...roots) {
  return function cleanup() {
    for (const root of roots) {
      try {
        chmodTreeWritable(root);
      } catch {
        // never throw (§13.6)
      }
      try {
        rmSync(root, { recursive: true, force: true });
      } catch {
        // never throw (§13.6) — a fixture whose construction failed halfway must not have
        // its construction error masked by a teardown error either, so this is deliberately
        // swallowed rather than rethrown.
      }
    }
  };
}

// ───────────────────────────── §1.2 / §1.1-shaped degradable artifacts ─────────────────────────────

/**
 * Writes a JSON-object-shaped artifact (sync-manifest, config) with its three degradations:
 * `"absent"` (no file), `"unreadable"` (valid JSON, then chmod 0o200 — write-only), and
 * `"malformed"` (invalid JSON bytes). Any other value is JSON-serialised verbatim — the
 * fixture is a pass-through, not a schema-enforcing writer, so a contract test can hand it an
 * arbitrary shape and read the same shape back (TSPEC §3.3's `syncManifest`/`config` clauses).
 */
function writeDegradableJsonArtifact(absPath, value) {
  if (value === "absent") return;
  if (value === "unreadable") {
    writeFileEnsuringDir(absPath, "{}");
    chmodSync(absPath, 0o200);
    return;
  }
  if (value === "malformed") {
    writeFileEnsuringDir(absPath, "{ not valid json");
    return;
  }
  writeFileEnsuringDir(absPath, JSON.stringify(value));
}

/**
 * Writes the drift-state artifact: `"absent"` (no file), any other string written verbatim as
 * raw bytes (this is how a malformed fixture is expressed — TSPEC §3.3's `driftState` clause
 * is `string | object | "absent"`, not `"malformed"`, precisely so a test can hand it
 * arbitrary unparseable bytes), or an object JSON-serialised.
 */
function writeDriftStateArtifact(absPath, value) {
  if (value === "absent") return;
  if (typeof value === "string") {
    writeFileEnsuringDir(absPath, value);
    return;
  }
  writeFileEnsuringDir(absPath, JSON.stringify(value));
}

// ───────────────────────────── §3.3 makeConsumerTree ─────────────────────────────

function initGit(root) {
  execFileSync("git", ["init", "-b", "main"], { cwd: root, stdio: "ignore" });
  execFileSync("git", ["config", "user.name", "pdlc-fixture"], { cwd: root, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "pdlc-fixture@example.com"], {
    cwd: root,
    stdio: "ignore",
  });
  execFileSync("git", ["commit", "--allow-empty", "-m", "pdlc fixture init"], {
    cwd: root,
    stdio: "ignore",
  });
}

/**
 * A consumer repo tree over TSPEC §3.3's eight independently-settable clauses:
 * `git`, `claudeDir`, `workflowsDir`, `files`, `syncManifest`, `config`, `driftState`, and the
 * `home` sibling every tree carries regardless of spec.
 *
 * `root` is created with `mkdtempSync(join(realpathSync(tmpdir()), "pdlc-"))` — `realpathSync`
 * is applied once, at construction, so macOS's `tmpdir()` symlink (`/var/folders/…` into
 * `/private/var/…`) never has to be re-normalised by a caller. `home` is a SIBLING of `root`
 * (same parent directory), never an ancestor — an ancestor `HOME` would make every repo-root
 * fixture measure the `$HOME` guard instead of what it meant to measure (TSPEC §3.3).
 *
 * @param {object} [spec]
 * @param {boolean} [spec.git]
 * @param {boolean} [spec.claudeDir]
 * @param {boolean|{mode:number}} [spec.workflowsDir]
 * @param {Object<string, string|Buffer>} [spec.files]
 * @param {object|"absent"|"unreadable"|"malformed"} [spec.syncManifest]
 * @param {object|"absent"|"unreadable"|"malformed"} [spec.config]
 * @param {string|object|"absent"} [spec.driftState]
 * @returns {{root:string, home:string, tmp:string, cleanup:Function}}
 */
export function makeConsumerTree(spec = {}) {
  const tmp = realpathSync(tmpdir());
  const root = mkdtempSync(join(tmp, "pdlc-"));
  const home = mkdtempSync(join(dirname(root), "pdlc-home-"));

  if (spec.git === true) {
    initGit(root);
  }
  // spec.git === false (or absent): a fresh tmpdir already has no .git anywhere from root up
  // to home, so there is nothing to do.

  if (spec.claudeDir === true) {
    mkdirSync(join(root, ...CLAUDE_DIR_REL), { recursive: true });
  }

  let workflowsModeToApplyLast = null;
  if (spec.workflowsDir === true) {
    mkdirSync(join(root, ...WORKFLOWS_DIR_REL), { recursive: true });
  } else if (spec.workflowsDir && typeof spec.workflowsDir === "object") {
    mkdirSync(join(root, ...WORKFLOWS_DIR_REL), { recursive: true });
    workflowsModeToApplyLast = spec.workflowsDir.mode;
  }
  // spec.workflowsDir === false (or absent): left uncreated.

  if (spec.files) {
    for (const [rel, content] of Object.entries(spec.files)) {
      writeFileEnsuringDir(join(root, rel), content);
    }
  }

  if (spec.syncManifest !== undefined) {
    writeDegradableJsonArtifact(join(root, ...SYNC_MANIFEST_REL), spec.syncManifest);
  }

  if (spec.config !== undefined) {
    writeDegradableJsonArtifact(join(root, ...CONFIG_REL), spec.config);
  }

  if (spec.driftState !== undefined) {
    writeDriftStateArtifact(join(root, ...DRIFT_STATE_REL), spec.driftState);
  }

  // Applied LAST — a restrictive workflowsDir mode must never block a write this same
  // construction call still has to make (e.g. a pre-existing driftState, §13.1's
  // `unwritableParent` fixture: ".claude/workflows/ 0500, drift-state file 0600, applied last").
  if (workflowsModeToApplyLast != null) {
    chmodSync(join(root, ...WORKFLOWS_DIR_REL), workflowsModeToApplyLast);
  }

  return {
    root,
    home,
    tmp,
    cleanup: makeTreeCleanup(root, home),
  };
}

// ───────────────────────────── §3.3 makePluginTree ─────────────────────────────

function defaultPluginRows() {
  return [
    { id: "row-1", content: Buffer.from("plugin-bytes-for-row-1"), retires: [] },
    { id: "row-2", content: Buffer.from("plugin-bytes-for-row-2"), retires: [] },
  ];
}

/**
 * A plugin `workflows/dist/` tree plus a computed `distribution-manifest.json` (FSPEC §1.1).
 * Every `pluginSha1` is derived from the bytes this call just wrote, so M8/M9 hold by
 * construction (TSPEC §3.3).
 *
 * `manifestOverride` and `manifestRaw` are the two malformed-manifest escape hatches and are
 * MUTUALLY EXCLUSIVE — `manifestOverride` mutates the parsed object before it is re-serialised
 * (can only produce M1-M10 clause failures); `manifestRaw` replaces the serialised bytes
 * verbatim (can produce bytes the JSON helper cannot parse at all, closing FSPEC §2.5's
 * `manifest-malformed` via the helper's `12` return). Passing both is the kind of fixture bug
 * that silently discards one escape hatch, so this throws rather than picking a winner.
 *
 * @param {object} [spec]
 * @param {{id:string, content?:(string|Buffer), retires?:string[]}[]} [spec.rows] defaults to
 *   a two-row plugin tree (`row-1`, `row-2`)
 * @param {string} [spec.pluginVersion]
 * @param {(manifestObj:object)=>object} [spec.manifestOverride]
 * @param {string} [spec.manifestRaw]
 * @returns {{pluginRoot:string, manifest:(object|null), bytesOf:(id:string)=>Buffer, cleanup:Function}}
 */
export function makePluginTree(spec = {}) {
  if (spec.manifestOverride !== undefined && spec.manifestRaw !== undefined) {
    throw new Error(
      "makePluginTree: manifestOverride and manifestRaw are mutually exclusive — a raw " +
        "override would silently discard an object override (TSPEC §3.3)"
    );
  }

  const tmp = realpathSync(tmpdir());
  const pluginRoot = mkdtempSync(join(tmp, "pdlc-plugin-"));
  const distDir = join(pluginRoot, "workflows", "dist");
  mkdirSync(distDir, { recursive: true });

  const rowsSpec = spec.rows || defaultPluginRows();
  const pluginVersion = spec.pluginVersion || "0.11.0";
  const bytesById = new Map();

  const rows = rowsSpec.map((r) => {
    const content = asBuffer(r.content !== undefined ? r.content : `plugin-bytes-for-${r.id}`);
    bytesById.set(r.id, content);
    const fileName = `${r.id}.bundle.js`;
    writeFileSync(join(distDir, fileName), content);
    return {
      id: r.id,
      pluginPath: `workflows/dist/${fileName}`,
      consumerPath: `.claude/workflows/${fileName}`,
      artifactVersion: r.artifactVersion || pluginVersion,
      pluginSha1: sha1(content),
      retires: r.retires || [],
    };
  });

  const retired = Array.from(new Set(rows.flatMap((r) => r.retires))).sort();

  let manifestObj = {
    schemaVersion: 1,
    generatedAtUtc: new Date().toISOString(),
    pluginVersion,
    rows,
    retired,
  };

  if (spec.manifestOverride) {
    manifestObj = spec.manifestOverride(manifestObj);
  }

  const manifestPath = join(distDir, "distribution-manifest.json");
  if (spec.manifestRaw !== undefined) {
    writeFileSync(manifestPath, spec.manifestRaw);
    manifestObj = null; // unparseable by design — nothing meaningful to expose as `.manifest`
  } else {
    writeFileSync(manifestPath, JSON.stringify(manifestObj, null, 2) + "\n");
  }

  return {
    pluginRoot,
    manifest: manifestObj,
    bytesOf(id) {
      const bytes = bytesById.get(id);
      if (bytes === undefined) {
        throw new Error(`makePluginTree.bytesOf: unknown row id "${id}"`);
      }
      return bytes;
    },
    cleanup: makeTreeCleanup(pluginRoot),
  };
}

// ───────────────────────────── §1.2 sync-manifest entry helpers (setRowState internals) ─────

function readManifestDoc(consumerRoot) {
  const path = join(consumerRoot, ...SYNC_MANIFEST_REL);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    // Degraded (unreadable/malformed): every row with differing bytes is `unverified` (§1.2's
    // degradation rule) — treated identically to "no document" for entry lookup purposes.
    return null;
  }
}

function writeManifestDoc(consumerRoot, doc) {
  writeFileEnsuringDir(join(consumerRoot, ...SYNC_MANIFEST_REL), JSON.stringify(doc, null, 2) + "\n");
}

function upsertManifestEntry(consumerRoot, id, entry) {
  const doc = readManifestDoc(consumerRoot) || { schemaVersion: 1, entries: {} };
  doc.entries = doc.entries || {};
  doc.entries[id] = entry;
  writeManifestDoc(consumerRoot, doc);
}

function deleteManifestEntry(consumerRoot, id) {
  const doc = readManifestDoc(consumerRoot);
  if (!doc || !doc.entries || !(id in doc.entries)) return;
  delete doc.entries[id];
  writeManifestDoc(consumerRoot, doc);
}

function lookupManifestEntry(consumerRoot, id) {
  const doc = readManifestDoc(consumerRoot);
  if (!doc || !doc.entries) return null;
  return doc.entries[id] || null;
}

function makeSyncEntry({ id, consumerBytes, pluginBytes, row, pluginVersion }) {
  return {
    id,
    consumerHash: sha1(consumerBytes),
    pluginHash: sha1(pluginBytes),
    artifactVersion: row.artifactVersion,
    pluginVersion,
    syncedAtUtc: new Date().toISOString(),
  };
}

// ───────────────────────────── §3.3 setRowState — the six-state table, self-oracled ─────────

/**
 * Re-derives the row's classification from what is actually on disk right now, using exactly
 * the precedence TSPEC §3.3's table states: `missing` (path absent) > `in-sync` (bytes equal
 * the plugin's) > [`stale` | `local-edit`, discriminated by whether the sync-manifest entry's
 * `consumerHash` still matches the bytes on disk] > `unverified` (no entry, bytes differ).
 * `unknown` is out of scope here — it is produced by environment/permission fixtures, not by
 * mutating an ordinary consumer/plugin tree pair.
 */
function deriveRowState(consumerRoot, row, pluginBytes) {
  const abs = join(consumerRoot, ...row.consumerPath.split("/"));
  if (!existsSync(abs)) return "missing";
  const consumerBytes = readFileSync(abs);
  if (consumerBytes.equals(pluginBytes)) return "in-sync";
  const entry = lookupManifestEntry(consumerRoot, row.id);
  if (!entry) return "unverified";
  return sha1(consumerBytes) === entry.consumerHash ? "stale" : "local-edit";
}

/**
 * Realises one of TSPEC §3.3's six row states against an already-built `{ consumer, plugin }`
 * tree pair, then re-derives the classification from what it just wrote and THROWS if it does
 * not match `state` — the fixture builder is its own first oracle. This is what catches the
 * two documented traps: constructing "stale" with consumer bytes forced equal to the plugin's
 * (re-derives "in-sync", rung 3 precedes rung 5) and constructing "local-edit" without a
 * sync-manifest entry (re-derives "unverified", rung 4 precedes rung 6).
 *
 * @param {{consumer:{root:string}, plugin:{manifest:object, bytesOf:Function}}} trees
 * @param {string} id row id, must exist in `plugin.manifest.rows`
 * @param {"in-sync"|"missing"|"stale"|"local-edit"|"unverified"} state
 * @param {{consumerBytes?:(string|Buffer), originalBytes?:(string|Buffer)}} [opts]
 *   `consumerBytes` is the bytes actually on disk after this call; for `local-edit`,
 *   `originalBytes` is the (different) bytes the sync-manifest entry's `consumerHash` records.
 */
export function setRowState(trees, id, state, opts = {}) {
  const { consumer, plugin } = trees;
  const row = plugin.manifest && plugin.manifest.rows.find((r) => r.id === id);
  if (!row) {
    throw new Error(`setRowState: plugin tree has no row "${id}"`);
  }
  const pluginBytes = plugin.bytesOf(id);
  const abs = join(consumer.root, ...row.consumerPath.split("/"));
  const pluginVersion = plugin.manifest.pluginVersion;

  switch (state) {
    case "in-sync": {
      writeFileEnsuringDir(abs, pluginBytes);
      upsertManifestEntry(
        consumer.root,
        id,
        makeSyncEntry({ id, consumerBytes: pluginBytes, pluginBytes, row, pluginVersion })
      );
      break;
    }
    case "missing": {
      try {
        rmSync(abs, { force: true });
      } catch {
        // absence is the goal either way
      }
      deleteManifestEntry(consumer.root, id);
      break;
    }
    case "stale": {
      const bytes = asBuffer(opts.consumerBytes !== undefined ? opts.consumerBytes : `stale-bytes-for-${id}`);
      writeFileEnsuringDir(abs, bytes);
      upsertManifestEntry(
        consumer.root,
        id,
        makeSyncEntry({ id, consumerBytes: bytes, pluginBytes, row, pluginVersion })
      );
      break;
    }
    case "local-edit": {
      const originalBytes = asBuffer(
        opts.originalBytes !== undefined ? opts.originalBytes : `original-bytes-for-${id}`
      );
      const editedBytes = asBuffer(
        opts.consumerBytes !== undefined ? opts.consumerBytes : `edited-bytes-for-${id}`
      );
      upsertManifestEntry(
        consumer.root,
        id,
        makeSyncEntry({ id, consumerBytes: originalBytes, pluginBytes, row, pluginVersion })
      );
      writeFileEnsuringDir(abs, editedBytes);
      break;
    }
    case "unverified": {
      const bytes = asBuffer(
        opts.consumerBytes !== undefined ? opts.consumerBytes : `unverified-bytes-for-${id}`
      );
      writeFileEnsuringDir(abs, bytes);
      deleteManifestEntry(consumer.root, id);
      break;
    }
    default:
      throw new Error(`setRowState: unsupported state "${state}"`);
  }

  const derived = deriveRowState(consumer.root, row, pluginBytes);
  if (derived !== state) {
    throw new Error(
      `setRowState: requested row "${id}" state "${state}" but the tree just built re-derives ` +
        `to "${derived}" — the fixture builder is its own first oracle (TSPEC §3.3)`
    );
  }
}

// ───────────────────────────── §13.5 backup fixtures ─────────────────────────────
//
// These populate the `.pdlc-backups/` directory of an already-constructed consumer tree
// (typically from `makeConsumerTree`) — they build no root of their own, so there is nothing
// for them to return a `cleanup()` for; the owning tree's `cleanup()` covers them. The
// filename grammar (`{id}.{stamp}-{NN}.bak`) mirrors C1's `pdlc_backup_format` (TSPEC §11.1).

function backupName(id, stamp, nn) {
  return `${id}.${stamp}-${String(nn).padStart(2, "0")}.bak`;
}

/**
 * Six backups for one id, `-01`…`-06`, all in one filename `stamp` (TSPEC §11.3 row 4).
 *
 * @param {string} root consumer tree root
 * @param {string} id
 * @param {{count?:number, stamp?:string}} [opts]
 * @returns {{dir:string, names:string[], stamp:string}}
 */
export function sameSecondBackups(root, id, opts = {}) {
  const count = opts.count ?? 6;
  const stamp = opts.stamp || "20260101T000000Z";
  const dir = join(root, ...BACKUPS_DIR_REL);
  mkdirSync(dir, { recursive: true });
  const names = [];
  for (let nn = 1; nn <= count; nn++) {
    const name = backupName(id, stamp, nn);
    writeFileSync(join(dir, name), `backup contents ${nn}`);
    names.push(name);
  }
  return { dir, names, stamp };
}

/**
 * `sameSecondBackups` with every mtime randomised, via `utimesSync`, AFTER creation — red
 * against any selector that orders by mtime instead of the filename's descending `NN`
 * (TSPEC §11.3 row 4: retention selects by filename sort, never mtime).
 *
 * @param {string} root
 * @param {string} id
 * @param {{count?:number, stamp?:string}} [opts]
 * @returns {{dir:string, names:string[], stamp:string}}
 */
export function shuffledMtimes(root, id, opts = {}) {
  const built = sameSecondBackups(root, id, opts);
  const shuffled = [...built.names];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  shuffled.forEach((name, i) => {
    const t = nowSeconds - (shuffled.length - i) * 60;
    utimesSync(join(built.dir, name), t, t);
  });
  return built;
}

/**
 * `sameSecondBackups` plus non-backup-shaped decoys (a plain file, a `.bak`-suffixed file that
 * does not match the grammar) and a well-formed backup for an UNKNOWN id — the identity
 * requirement O-18 clause (c) needs (TSPEC §13.5).
 *
 * @param {string} root
 * @param {string} id
 * @param {{count?:number, stamp?:string, unknownId?:string}} [opts]
 * @returns {{dir:string, names:string[], stamp:string}}
 */
export function decoyBackupDir(root, id, opts = {}) {
  const built = sameSecondBackups(root, id, opts);
  writeFileSync(join(built.dir, "README.txt"), "not a backup");
  writeFileSync(join(built.dir, "notabackup.bak"), "does not match the backup filename grammar");
  const unknownId = opts.unknownId || "unknown-id";
  writeFileSync(join(built.dir, backupName(unknownId, built.stamp, 1)), "decoy for an unknown id");
  return built;
}

/**
 * 99 backups for one id in one `stamp` — `pdlc_backup_format` rejects `nn > 99` (TSPEC §11.1),
 * so 99 is the exhaustion boundary (FSPEC §1.4's exhaustion ⇒ `operation: backup`, exit 4).
 *
 * @param {string} root
 * @param {string} id
 * @param {{stamp?:string}} [opts]
 * @returns {{dir:string, names:string[], stamp:string}}
 */
export function nnExhausted(root, id, opts = {}) {
  return sameSecondBackups(root, id, { ...opts, count: 99 });
}
