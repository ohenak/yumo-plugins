// Tests for pdlc/engine/lib/store.mjs (PLAN T06, TSPEC §6.1, PROP-VER-11,
// AT-5.5). `lib/store.mjs` does not exist yet: its assertions are committed
// now, skipped under the "T26:" id (dynamic import below lets the file load
// skipped rather than fail on import), and T26 un-skips and drives them
// green. Fully offline: every case injects a fake fs; no real `$PDLC_HOME`
// is ever touched.
//
// Contract under test (TSPEC §6.1, §10.1 S-1):
//   listVersions(fs, root) -> { versions: string[], skipped: {name, reason}[] }
//     versions is sorted ascending (lowest first) via handshake.mjs's
//     `compare`, over parsed {major, minor, patch}. A directory entry whose
//     name does not parse as a version is never guessed at: it is left out
//     of `versions` and reported by name in `skipped` (PROP-VER-11 — a
//     positive observation, not a silent filter). Non-directory entries
//     (plain files sitting in the store root) are not version entries at
//     all and are excluded without being reported. A missing root reads as
//     an empty store (TSPEC §6.3 ladder branch 7), never a throw.
//   rootFor(root, version) -> string
//     A pure path mapping from a version string to its install root; it
//     does not consult the fs or validate that the version is installed
//     (that check is the resolution ladder's job, not the store's).

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

// `listVersions`/`rootFor` are imported lazily inside each test body below
// (dynamic `await import(...)`) rather than statically here: `lib/store.mjs`
// is owned by T26 and does not exist yet, and a top-level static import of a
// missing module would fail the whole file at load time before any `.skip`
// could take effect.

/**
 * A fake fs over a plain directory-name -> "dir" | "file" map, all
 * directly under one root. `readdirSync` returns the bare names;
 * `statSync(p).isDirectory()` reports which of them are directories.
 */
function fakeFs(root, entries) {
  const names = Object.keys(entries);
  return {
    readdirSync: (p) => {
      if (p !== root) throw new Error(`fakeFs: unexpected readdirSync(${p})`);
      return [...names];
    },
    statSync: (p) => {
      const name = path.relative(root, p);
      if (!Object.hasOwn(entries, name)) {
        const err = new Error(`ENOENT: no such file or directory, stat '${p}'`);
        err.code = "ENOENT";
        throw err;
      }
      const kind = entries[name];
      return { isDirectory: () => kind === "dir" };
    },
  };
}

function missingFs(root) {
  return {
    readdirSync: (p) => {
      assert.equal(p, root);
      const err = new Error(`ENOENT: no such file or directory, scandir '${p}'`);
      err.code = "ENOENT";
      throw err;
    },
    statSync: () => {
      throw new Error("fakeFs: statSync should not be called when readdirSync already refused");
    },
  };
}

const ROOT = "/store/versions";

// ── enumeration: sorting ──────────────────────────────────────────────────

test("T26: listVersions sorts entries ascending via handshake's numeric compare, not lexicographically", async () => {
  const { listVersions } = await import("../lib/store.mjs");
  const fs = fakeFs(ROOT, {
    "0.10.0": "dir",
    "0.2.0": "dir",
    "0.1.10": "dir",
    "1.0.0": "dir",
  });
  const { versions, skipped } = listVersions(fs, ROOT);
  // Lexicographic order would read "0.1.10", "0.10.0", "0.2.0", "1.0.0" —
  // numeric compare must not agree with it on the middle two.
  assert.deepEqual(versions, ["0.1.10", "0.2.0", "0.10.0", "1.0.0"]);
  assert.deepEqual(skipped, []);
});

test("T26: listVersions on an empty store root returns an empty versions list", async () => {
  const { listVersions } = await import("../lib/store.mjs");
  const fs = fakeFs(ROOT, {});
  const { versions, skipped } = listVersions(fs, ROOT);
  assert.deepEqual(versions, []);
  assert.deepEqual(skipped, []);
});

test("T26: listVersions on a missing store root reads as empty, never throws", async () => {
  const { listVersions } = await import("../lib/store.mjs");
  const fs = missingFs(ROOT);
  const { versions, skipped } = listVersions(fs, ROOT);
  assert.deepEqual(versions, []);
  assert.deepEqual(skipped, []);
});

// ── enumeration: unparseable entries are skipped and reported ────────────

test("T26: an unparseable directory name is skipped and reported by name, not guessed at (PROP-VER-11)", async () => {
  const { listVersions } = await import("../lib/store.mjs");
  const fs = fakeFs(ROOT, {
    "0.3.1": "dir",
    "latest": "dir",
    "0.4.0": "dir",
    "not-a-version": "dir",
  });
  const { versions, skipped } = listVersions(fs, ROOT);
  assert.deepEqual(versions, ["0.3.1", "0.4.0"]);
  assert.equal(skipped.length, 2);
  const skippedNames = skipped.map((s) => s.name).sort();
  assert.deepEqual(skippedNames, ["latest", "not-a-version"]);
  // The report is positive, not merely a count: each entry names itself and
  // carries a non-empty reason, so a caller can render it without re-deriving
  // which name was rejected.
  for (const entry of skipped) {
    assert.equal(typeof entry.reason, "string");
    assert.ok(entry.reason.length > 0);
  }
});

test("T26: every unparseable entry is reported, not just the first", async () => {
  const { listVersions } = await import("../lib/store.mjs");
  const fs = fakeFs(ROOT, {
    "bogus-a": "dir",
    "bogus-b": "dir",
    "0.1.0": "dir",
  });
  const { skipped } = listVersions(fs, ROOT);
  assert.deepEqual(
    skipped.map((s) => s.name).sort(),
    ["bogus-a", "bogus-b"],
  );
});

// ── enumeration: non-directory entries are excluded, not reported ────────

test("T26: a non-directory entry sitting in the store root is excluded and not reported as skipped", async () => {
  const { listVersions } = await import("../lib/store.mjs");
  const fs = fakeFs(ROOT, {
    "0.3.1": "dir",
    ".DS_Store": "file",
    "README.txt": "file",
  });
  const { versions, skipped } = listVersions(fs, ROOT);
  assert.deepEqual(versions, ["0.3.1"]);
  // Not a version directory at all — never surfaced as a rejected version.
  assert.deepEqual(skipped, []);
});

// ── rootFor: pure mapping, no fs consulted ────────────────────────────────

test("T26: rootFor maps a version string to a path under the store root", async () => {
  const { rootFor } = await import("../lib/store.mjs");
  assert.equal(rootFor(ROOT, "0.3.1"), path.join(ROOT, "0.3.1"));
  assert.equal(rootFor(ROOT, "1.0.0"), path.join(ROOT, "1.0.0"));
});

test("T26: rootFor is a pure string mapping: it does not require the version to be enumerated first", async () => {
  const { rootFor } = await import("../lib/store.mjs");
  // Presence validation is the resolution ladder's job (branch 4,
  // pin-missing), not the store's — rootFor never throws or consults the fs.
  assert.equal(rootFor(ROOT, "9.9.9"), path.join(ROOT, "9.9.9"));
});

test("T26: rootFor gives distinct roots for distinct versions", async () => {
  const { rootFor } = await import("../lib/store.mjs");
  assert.notEqual(rootFor(ROOT, "0.1.0"), rootFor(ROOT, "0.2.0"));
});
