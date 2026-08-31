// statsDoubles.js — PLAN T-02 (pdlc-stats, batch 1, "[Fake first]").
//
// The single shared test-double module every `stats*.test.js` file (workflows-side and
// engine-side) draws from for TSPEC §6.1's two doubles plus the real-path seam:
//
//   1. `fakeStatsIo(tree, {throwOn})` — a hand-written `StatsIo` (TSPEC §3.1) double, with
//      no write member at all, so a production write attempt is a `TypeError`, never a
//      silent success.
//   2. `recordingParsers(real)` — wraps the **real** `orchestrate-dev.js` driver exports
//      (TSPEC §3.2) and records every call's arguments, so a test can assert "this
//      classifier was called with this basename" without hand-rolling a stub that could
//      drift from the driver's actual grammar.
//   3. `realStatsIo()` — the real-`node:fs` `StatsIo` used by the real-path tests (AT-09,
//      AT-10, AT-11, AT-13, AT-14b, AT-18). This is **not** a second implementation shipped
//      as a seam: it is written to make exactly the four `node:fs` calls `bin/cli.mjs`'s
//      production `statsIo()` makes — `readdirSync(dir, {withFileTypes: true})`,
//      `lstatSync(path).size` (never `statSync` — TSPEC §2.4), `readFileSync(path, "utf8")`,
//      `existsSync(path)`. T-10 carries an equivalence conjunct that pins these two
//      construction sites to an identical call set, so this helper diverging from
//      `bin/cli.mjs` would hide behind a green T-10 rather than surface as a red.
//
// Nothing here touches the real clock or `git`. `realStatsIo()` is the sole exception to
// "no real filesystem" — it is the seam real-path tests are built to exercise.

import fs from "node:fs";

// ─── fakeStatsIo — the `StatsIo` double (TSPEC §3.1, §6.1) ────────────────
//
// `tree` is a plain object mapping absolute paths to either a directory listing
// `{dirs: string[], files: string[]}` (entry *names*, not full paths — TSPEC §3.1's
// `listDir` returns `{name, isDirectory, isFile, isSymbolicLink}` records built from these
// names, joined by the caller against `absDir` the same way `path.join` would) or to a
// file's contents as a plain string (used both for `readFile` and, via UTF-8 byte length,
// for `fileSize`). The fake never fabricates a symbolic link — `isSymbolicLink` is always
// `false` — because AT-15's symbolic-link leg is deliberately a **real-fs** falsifying test
// (TSPEC §6.1, T-18), not something a hand-built tree can stand in for.
//
// `throwOn` drives one call site to throw per named path, without needing real permission
// bits: `fakeStatsIo(tree, {throwOn: {listDir: [absDir]}})` makes `listDir(absDir)` throw
// and every other call succeed normally. Each of the four seam names is independently
// keyed, and each key's value is an array of paths that throw for that seam only.
//
// The double has no write member. Any consumer that reaches for a fifth, write-shaped
// member (`writeFile`, `mkdir`, ...) gets `undefined` is not a function — a `TypeError` at
// the call site, not a silent success (TSPEC §6.1).
export function fakeStatsIo(tree = {}, { throwOn = {} } = {}) {
  const shouldThrow = (seam, arg) => Array.isArray(throwOn[seam]) && throwOn[seam].includes(arg);
  const throwFor = (seam, arg) => {
    throw new Error(`fakeStatsIo: scripted throw for ${seam}(${arg})`);
  };
  const joinChild = (absDir, name) => (absDir.endsWith("/") ? `${absDir}${name}` : `${absDir}/${name}`);

  return {
    listDir(absDir) {
      if (shouldThrow("listDir", absDir)) throwFor("listDir", absDir);
      const node = tree[absDir];
      if (!node || typeof node !== "object" || Array.isArray(node)) {
        throw new Error(`fakeStatsIo: no directory entry for ${absDir}`);
      }
      const dirs = (node.dirs ?? []).map((name) => ({
        name,
        isDirectory: true,
        isFile: false,
        isSymbolicLink: false,
      }));
      const files = (node.files ?? []).map((name) => ({
        name,
        isDirectory: false,
        isFile: true,
        isSymbolicLink: false,
      }));
      return [...dirs, ...files];
    },

    fileSize(absPath) {
      if (shouldThrow("fileSize", absPath)) throwFor("fileSize", absPath);
      const contents = tree[absPath];
      if (typeof contents !== "string") {
        throw new Error(`fakeStatsIo: no file contents for ${absPath}`);
      }
      return Buffer.byteLength(contents, "utf8");
    },

    readFile(absPath) {
      if (shouldThrow("readFile", absPath)) throwFor("readFile", absPath);
      const contents = tree[absPath];
      if (typeof contents !== "string") {
        throw new Error(`fakeStatsIo: no file contents for ${absPath}`);
      }
      return contents;
    },

    exists(absPath) {
      if (shouldThrow("exists", absPath)) throwFor("exists", absPath);
      return Object.prototype.hasOwnProperty.call(tree, absPath);
    },

    // exposed for tests that want to build child paths the same way listDir's
    // caller is expected to (absDir + "/" + name); not part of StatsIo itself.
    _joinChild: joinChild,
  };
}

// ─── recordingParsers — the `StatsParsers` double (TSPEC §3.2, §6.1) ──────
//
// Wraps the **real** `orchestrate-dev.js` exports named in TSPEC §3.2
// (`parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, `parseResolvedMarker`)
// and records every call's arguments, in order, per member, on `.calls.<name>`. The default
// behavior for every member is the real classifier — a stub is opt-in per assertion (pass a
// narrow override in `overrides`), never the ambient default, matching TSPEC §6.1's
// "the default is the real thing" requirement so a hand-written parser can never drift from
// the driver's actual grammar and stay hidden.
//
// `real` is the four-export bundle as constructed by production `statsParsers()` (or the
// driver module itself); `overrides` may replace any subset of the four members with a
// test-supplied function for the tests that need to drive a specific classifier branch
// directly instead of constructing a filename that provokes it (TSPEC §2.5).
export function recordingParsers(real, overrides = {}) {
  const calls = {
    parseReviewFilename: [],
    deriveRoundWindow: [],
    deriveDodRoundIndex: [],
    parseResolvedMarker: [],
  };

  const wrap = (name) => {
    const fn = overrides[name] ?? real[name];
    return (...args) => {
      calls[name].push(args);
      return fn(...args);
    };
  };

  const parsers = {
    parseReviewFilename: wrap("parseReviewFilename"),
    deriveRoundWindow: wrap("deriveRoundWindow"),
    deriveDodRoundIndex: wrap("deriveDodRoundIndex"),
    parseResolvedMarker: wrap("parseResolvedMarker"),
  };

  return { parsers, calls };
}

// ─── realStatsIo — the real-`node:fs` `StatsIo` (TSPEC §2.3, §6.1) ────────
//
// Backs the real-path tests (AT-09, AT-10, AT-11, AT-13, AT-14b, AT-18) against the
// repository's own `docs/completed/` archive. Deliberately mirrors — call for call — the
// production `statsIo()` this feature adds to `pdlc/engine/bin/cli.mjs`: `readdirSync` with
// `withFileTypes: true` (one syscall per directory, no second `stat` per entry),
// `lstatSync(...).size` and never `statSync` (TSPEC §2.4 — a symbolic link contributes its
// own size, not its target's), `readFileSync(..., "utf8")`, and `existsSync`. T-10's
// equivalence conjunct pins both construction sites to this identical call set.
export function realStatsIo() {
  return {
    listDir(absDir) {
      return fs.readdirSync(absDir, { withFileTypes: true }).map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
        isSymbolicLink: entry.isSymbolicLink(),
      }));
    },

    fileSize(absPath) {
      return fs.lstatSync(absPath).size;
    },

    readFile(absPath) {
      return fs.readFileSync(absPath, "utf8");
    },

    exists(absPath) {
      return fs.existsSync(absPath);
    },
  };
}

// ── buildArtifactTree — the artifact-directory tree builder every fixture uses (TSPEC §6.1) ──
//
// `fakeStatsIo`'s `tree` parameter is a flat map keyed by absolute path: directory
// entries map to `{dirs, files}` name lists, file entries map to a string of contents.
// Hand-maintaining that flat map — one entry per ancestor directory, kept in sync as
// files are added or removed — is exactly the kind of duplication every stats fixture
// (T-04..T-11) would otherwise repeat. `buildArtifactTree(root, files)` takes the
// natural shape a fixture actually wants to declare — a root absolute path plus a map
// of root-relative file paths to their string contents — and derives the full flat
// tree, including every intermediate directory's `dirs`/`files` listing, so a fixture
// never hand-writes a `dirs`/`files` array itself.
export function buildArtifactTree(root, files = {}) {
  const normRoot = root.endsWith("/") ? root.slice(0, -1) : root;
  const tree = {};

  const ensureDir = (absDir) => {
    if (!tree[absDir]) {
      tree[absDir] = { dirs: [], files: [] };
    }
  };

  ensureDir(normRoot);

  for (const [relPath, contents] of Object.entries(files)) {
    const parts = relPath.split("/").filter((part) => part.length > 0);
    if (parts.length === 0) {
      throw new Error(`buildArtifactTree: empty relative path for root ${normRoot}`);
    }

    let currentAbs = normRoot;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const dirName = parts[i];
      ensureDir(currentAbs);
      if (!tree[currentAbs].dirs.includes(dirName)) {
        tree[currentAbs].dirs.push(dirName);
      }
      currentAbs = `${currentAbs}/${dirName}`;
      ensureDir(currentAbs);
    }

    const fileName = parts[parts.length - 1];
    ensureDir(currentAbs);
    if (!tree[currentAbs].files.includes(fileName)) {
      tree[currentAbs].files.push(fileName);
    }
    tree[`${currentAbs}/${fileName}`] = contents;
  }

  return tree;
}
