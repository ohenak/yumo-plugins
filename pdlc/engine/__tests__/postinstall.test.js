// Tests for pdlc/engine/scripts/postinstall.mjs (PLAN T53, [red]; T34,
// batch 4, is the satisfying [green] task). TSPEC §9.2, PROPERTIES
// PROP-INSTALL-1, PROP-INSTALL-2 (AT-2.1, AT-2.4).
//
// Every block below is committed `test.skip`, titled "T34: …", per PLAN
// v0.10's skipped-block convention (§2, §4 kind 1): `scripts/postinstall.mjs`
// does not exist yet, its module-path assignment (§3) belongs to T34, and
// T34 un-skips exactly these blocks as its first act. `checkWaveUnskips`
// treats a block titled with a later wave's task id as legitimate, so the
// intermediate waves stay green.
//
// `install` is imported lazily inside each test body (dynamic `await
// import(...)`) rather than statically here: a top-level static import of a
// missing module would fail the whole file at load time before any `.skip`
// could take effect (same mechanics as `store.test.js`, `resolve-version.test.js`).
//
// This file's assumed call shape, stated once here rather than re-derived
// per test (TSPEC §9.2 names the consequences, not a signature):
//
//   install(fs, { packageRoot, storeRoot, version })
//     -> { resolvedVersion: string, resolvedStoreEntry: string }
//
//   `fs` is the injected seam (S-1's `listVersions(fs, root)` precedent):
//   `readdirSync(dir, {withFileTypes}?)`, `readFileSync(path)`,
//   `existsSync(path)`, `mkdirSync(path, {recursive}?)`, `writeFileSync(path,
//   data)`. `install` walks `packageRoot` (the installed npm package's own
//   tree — §9.2's "installed tree") and writes a copy under
//   `storeRoot/version` (`$PDLC_HOME/versions/<version>/`), additively:
//   entries already present under `storeRoot` for other versions are never
//   read or written (§9.2 "adds rather than replaces entries"). Nothing else
//   is passed in — there is no consumer-project argument at all, so
//   PROP-INSTALL-2's "reads and writes no consumer path" is a structural
//   property of the seam, not a runtime check the implementation must
//   remember to perform: the fixtures below plant a decoy path the fs *would*
//   serve if asked, so a wrongly-hardcoded reference would be caught rather
//   than silently unreachable.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

/**
 * An in-memory fs recording every path it is asked to read or write, over a
 * plain `{absPath: "content"}` seed for files (parent directories are
 * inferred). Mirrors `store.test.js`'s local `fakeFs` in spirit but adds
 * write support, since `install` — unlike `listVersions` — writes.
 */
function recordingFs(seedFiles = {}) {
  const files = new Map(Object.entries(seedFiles));
  const dirs = new Set();
  const registerDirs = (p) => {
    let d = path.dirname(p);
    while (d && !dirs.has(d)) {
      dirs.add(d);
      const parent = path.dirname(d);
      if (parent === d) break;
      d = parent;
    }
  };
  for (const p of files.keys()) registerDirs(p);

  const reads = [];
  const writes = [];

  return {
    reads,
    writes,
    existsSync(p) {
      reads.push(p);
      return files.has(p) || dirs.has(p);
    },
    readdirSync(p, opts) {
      reads.push(p);
      if (!dirs.has(p)) {
        const err = new Error(`ENOENT: no such file or directory, scandir '${p}'`);
        err.code = "ENOENT";
        throw err;
      }
      const prefix = p.endsWith(path.sep) ? p : p + path.sep;
      const names = new Set();
      for (const key of [...files.keys(), ...dirs]) {
        if (key !== p && key.startsWith(prefix)) {
          names.add(key.slice(prefix.length).split(path.sep)[0]);
        }
      }
      const withFileTypes = opts && opts.withFileTypes;
      return [...names].sort().map((name) => {
        if (!withFileTypes) return name;
        const full = path.join(p, name);
        const isDir = dirs.has(full);
        return { name, isDirectory: () => isDir, isFile: () => !isDir };
      });
    },
    readFileSync(p) {
      reads.push(p);
      if (!files.has(p)) {
        const err = new Error(`ENOENT: no such file or directory, open '${p}'`);
        err.code = "ENOENT";
        throw err;
      }
      return files.get(p);
    },
    mkdirSync(p) {
      writes.push(p);
      dirs.add(p);
      registerDirs(p);
    },
    writeFileSync(p, content) {
      writes.push(p);
      files.set(p, content);
      dirs.add(path.dirname(p));
      registerDirs(p);
    },
  };
}

const PACKAGE_ROOT = "/pkg";
const STORE_ROOT = "/store/versions";
// A decoy the fs *would* serve if `install` asked for it — never passed to
// `install` itself, so its presence in `reads`/`writes` would indict a
// hardcoded reference rather than going unreachable-and-untested.
const CONSUMER_ROOT = "/repo";

function seedPackage() {
  return {
    [path.join(PACKAGE_ROOT, "bin/pdlc.mjs")]: "bin-content",
    [path.join(PACKAGE_ROOT, "lib/store.mjs")]: "lib-content",
    [path.join(PACKAGE_ROOT, "scripts/postinstall.mjs")]: "script-content",
  };
}

function seedConsumerDecoy() {
  return {
    [path.join(CONSUMER_ROOT, ".claude/settings.json")]: "{}",
    [path.join(CONSUMER_ROOT, "docs/feature/REQ-feature.md")]: "# REQ",
  };
}

// ── PROP-INSTALL-1: additive placement (AT-2.1) ────────────────────────────

test.skip(
  "T34: install places the package tree under storeRoot/version, additively over an existing entry",
  async () => {
    const { install } = await import("../scripts/postinstall.mjs");
    const seed = {
      ...seedPackage(),
      // A pre-existing store entry for an older version, holding a file
      // `install` must never touch while installing "0.4.0".
      [path.join(STORE_ROOT, "0.3.0/bin/pdlc.mjs")]: "old-bin-content",
    };
    const fs = recordingFs(seed);

    const result = await install(fs, {
      packageRoot: PACKAGE_ROOT,
      storeRoot: STORE_ROOT,
      version: "0.4.0",
    });

    assert.equal(result.resolvedVersion, "0.4.0");
    assert.equal(result.resolvedStoreEntry, path.join(STORE_ROOT, "0.4.0"));

    // Set-equality with both members named (§9.2), not "the new one is
    // present": the old entry's directory still exists...
    assert.equal(fs.existsSync(path.join(STORE_ROOT, "0.3.0")), true);
    // ...and the new one does too, populated from the package tree.
    assert.equal(fs.existsSync(path.join(STORE_ROOT, "0.4.0")), true);
    assert.equal(
      fs.readFileSync(path.join(STORE_ROOT, "0.4.0/bin/pdlc.mjs")),
      "bin-content",
    );
  },
);

test.skip(
  "T34: install never reads or writes any path under an existing store entry for a different version",
  async () => {
    const { install } = await import("../scripts/postinstall.mjs");
    const oldEntryFile = path.join(STORE_ROOT, "0.3.0/bin/pdlc.mjs");
    const seed = { ...seedPackage(), [oldEntryFile]: "old-bin-content" };
    const fs = recordingFs(seed);

    await install(fs, { packageRoot: PACKAGE_ROOT, storeRoot: STORE_ROOT, version: "0.4.0" });

    const oldEntryDir = path.join(STORE_ROOT, "0.3.0");
    const touchedOldEntry = [...fs.reads, ...fs.writes].some((p) => p.startsWith(oldEntryDir));
    assert.equal(touchedOldEntry, false);
    // Its content is unchanged (adds rather than replaces).
    assert.equal(fs.readFileSync(oldEntryFile), "old-bin-content");
  },
);

test.skip(
  "T34: installing the same version twice still leaves every earlier version's entry present (additive, not a swap)",
  async () => {
    const { install } = await import("../scripts/postinstall.mjs");
    const seed = {
      ...seedPackage(),
      [path.join(STORE_ROOT, "0.2.0/bin/pdlc.mjs")]: "v2-content",
      [path.join(STORE_ROOT, "0.3.0/bin/pdlc.mjs")]: "v3-content",
    };
    const fs = recordingFs(seed);

    await install(fs, { packageRoot: PACKAGE_ROOT, storeRoot: STORE_ROOT, version: "0.4.0" });

    for (const version of ["0.2.0", "0.3.0", "0.4.0"]) {
      assert.equal(
        fs.existsSync(path.join(STORE_ROOT, version)),
        true,
        `expected ${version} to remain present after installing 0.4.0`,
      );
    }
  },
);

// ── PROP-INSTALL-2: reads and writes no consumer path (AT-2.4) ─────────────

test.skip(
  "T34: install's recorded write set is entirely under storeRoot, with a positive control that writes were observed at all",
  async () => {
    const { install } = await import("../scripts/postinstall.mjs");
    const fs = recordingFs({ ...seedPackage(), ...seedConsumerDecoy() });

    await install(fs, { packageRoot: PACKAGE_ROOT, storeRoot: STORE_ROOT, version: "0.4.0" });

    // Positive control: the recorder is not vacuously empty (PROP-INSTALL-2
    // "so the assertion cannot pass on a recorder that saw nothing").
    assert.ok(fs.writes.length > 0);
    for (const p of fs.writes) {
      assert.ok(
        p === STORE_ROOT || p.startsWith(STORE_ROOT + path.sep),
        `write to ${p} is outside the store root ${STORE_ROOT}`,
      );
    }
  },
);

test.skip(
  "T34: install's recorded read set contains no path under the consumer project root",
  async () => {
    const { install } = await import("../scripts/postinstall.mjs");
    const fs = recordingFs({ ...seedPackage(), ...seedConsumerDecoy() });

    await install(fs, { packageRoot: PACKAGE_ROOT, storeRoot: STORE_ROOT, version: "0.4.0" });

    const consumerReads = fs.reads.filter((p) => p.startsWith(CONSUMER_ROOT + path.sep));
    assert.deepEqual(consumerReads, []);
  },
);

test.skip(
  "T34: nothing is created under .claude/ — the decoy consumer .claude path is never among the recorded writes",
  async () => {
    const { install } = await import("../scripts/postinstall.mjs");
    const fs = recordingFs({ ...seedPackage(), ...seedConsumerDecoy() });

    await install(fs, { packageRoot: PACKAGE_ROOT, storeRoot: STORE_ROOT, version: "0.4.0" });

    const dotClaudeWrites = fs.writes.filter((p) => p.includes(".claude"));
    assert.deepEqual(dotClaudeWrites, []);
    // And the decoy's content is byte-unchanged (still readable, unmoved).
    assert.equal(
      fs.readFileSync(path.join(CONSUMER_ROOT, ".claude/settings.json")),
      "{}",
    );
  },
);

test.skip(
  "T34: install never even references the consumer root when none is supplied — omitting packageRoot/storeRoot inputs leaves no path to derive one from",
  async () => {
    const { install } = await import("../scripts/postinstall.mjs");
    const fs = recordingFs({ ...seedPackage(), ...seedConsumerDecoy() });

    // `install`'s declared input shape (this file's header comment) carries
    // no consumer-project argument at all — only packageRoot, storeRoot and
    // version. A caller cannot pass a consumer path even by accident.
    await install(fs, { packageRoot: PACKAGE_ROOT, storeRoot: STORE_ROOT, version: "0.4.0" });

    const touchedConsumer = [...fs.reads, ...fs.writes].some((p) =>
      p.startsWith(CONSUMER_ROOT + path.sep),
    );
    assert.equal(touchedConsumer, false);
  },
);
