// AC-5.6's path-level notice oracle (TSPEC §6.5, §12.1) over
// `resolvePluginRoot`'s four `devDeclared` x `PDLC_PLUGIN_ROOT` rows.
//
// Fully offline: every case injects a fake filesystem, so no test reads
// ~/.claude or this repo's own plugin tree (matches skills.test.js's
// discipline for this module).
//
// This oracle is deliberately narrower than the shipped catalogue
// equalities it sits beside (TSPEC §6.5): `catalogue.test.js` only proves
// every registered id round-trips through `messageIds()`, and the
// suite-wide step only proves a registered id is emitted from *some* test.
// Neither proves the ignore branch is the one that emits it. This file
// drives `resolvePluginRoot` directly, asserting both the honour direction
// (row 1) and the ignore direction (row 3) positively, plus emptiness on
// the two variable-unset rows.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { resolvePluginRoot, PLUGIN_ROOT_ENV } from "../lib/skills.mjs";
import { message } from "../lib/catalogue.mjs";

const HOME = "/home/tester";
const CLAUDE = path.join(HOME, ".claude");

/** A fake fs over a plain {path: contents} map (mirrors skills.test.js). */
function fakeFs(files) {
  const keys = Object.keys(files);
  const dirs = new Set();
  for (const f of keys) {
    let d = path.dirname(f);
    while (d && d !== "/" && d !== ".") {
      dirs.add(d);
      d = path.dirname(d);
    }
  }
  return {
    existsSync: (p) => Object.hasOwn(files, p) || dirs.has(p),
    readFileSync: (p) => {
      if (!Object.hasOwn(files, p)) {
        const err = new Error(`ENOENT: no such file or directory, open '${p}'`);
        err.code = "ENOENT";
        throw err;
      }
      return files[p];
    },
    readdirSync: (p) => {
      if (!dirs.has(p)) throw new Error(`ENOENT: ${p}`);
      const prefix = p.endsWith("/") ? p : `${p}/`;
      const out = new Set();
      for (const f of [...keys, ...dirs]) {
        if (!f.startsWith(prefix)) continue;
        const remainder = f.slice(prefix.length);
        if (!remainder) continue;
        out.add(remainder.split("/")[0]);
      }
      return [...out];
    },
    statSync: () => ({}),
  };
}

/** The minimum files that make `root` look like a plugin root. */
function pluginTree(root, version = "0.22.0") {
  return {
    [path.join(root, ".claude-plugin", "plugin.json")]: JSON.stringify({
      name: "pdlc",
      version,
    }),
    [path.join(root, "skills", "pm-author", "SKILL.md")]: `# pm-author (${root})`,
  };
}

const DISCOVERED_ROOT = path.join(CLAUDE, "plugins", "cache", "yumo-plugins", "pdlc", "0.22.0");

function registryFile(installPath, lastUpdated = "2026-08-08T18:13:51.792Z") {
  return {
    [path.join(CLAUDE, "plugins", "installed_plugins.json")]: JSON.stringify({
      version: 2,
      plugins: {
        "pdlc@yumo-plugins": [{ scope: "user", installPath, version: "0.22.0", lastUpdated }],
      },
    }),
  };
}

// ── row 1: devDeclared: true, PDLC_PLUGIN_ROOT set — honour direction ────────

test("T32: devDeclared true honours a set PDLC_PLUGIN_ROOT exactly as today, with no notice", () => {
  const envValue = "/from-env";
  const fs = fakeFs({
    ...pluginTree(envValue),
    ...pluginTree(DISCOVERED_ROOT),
    ...registryFile(DISCOVERED_ROOT),
  });
  const out = resolvePluginRoot({
    devDeclared: true,
    env: { [PLUGIN_ROOT_ENV]: envValue },
    home: HOME,
    fs,
  });
  assert.equal(out.ok, true);
  assert.equal(out.root, envValue, "the env value must be honoured, not the discovered root");
  assert.equal(out.source, `explicit override (${PLUGIN_ROOT_ENV})`, "source string is unchanged");
  assert.deepEqual(out.notices, [], "the honour branch emits no notice");
});

// ── row 2: devDeclared: true, PDLC_PLUGIN_ROOT unset — discovery, as today ───

test("T32: devDeclared true with no PDLC_PLUGIN_ROOT set falls through to discovery with no notice", () => {
  const fs = fakeFs({ ...pluginTree(DISCOVERED_ROOT), ...registryFile(DISCOVERED_ROOT) });
  const out = resolvePluginRoot({ devDeclared: true, env: {}, home: HOME, fs });
  assert.equal(out.ok, true);
  assert.equal(out.root, DISCOVERED_ROOT);
  assert.deepEqual(out.notices, [], "no variable was set, so there is nothing to ignore or notice");
});

// ── row 3: devDeclared: false, PDLC_PLUGIN_ROOT set — ignore direction ───────

test("T32: devDeclared false ignores a set PDLC_PLUGIN_ROOT, runs discovery, and emits the ignored-env notice", () => {
  const envValue = "/from-env";
  const fs = fakeFs({
    ...pluginTree(envValue),
    ...pluginTree(DISCOVERED_ROOT),
    ...registryFile(DISCOVERED_ROOT),
  });
  const out = resolvePluginRoot({
    devDeclared: false,
    env: { [PLUGIN_ROOT_ENV]: envValue },
    home: HOME,
    fs,
  });
  assert.equal(out.ok, true);
  assert.equal(
    out.root,
    DISCOVERED_ROOT,
    "discovery must proceed as if the variable were unset, not resolve to the env value",
  );
  assert.notEqual(out.root, envValue);

  assert.equal(Array.isArray(out.notices), true);
  assert.equal(out.notices.length, 1, "exactly one notice: the ignored-env entry");
  const [notice] = out.notices;
  assert.equal(
    notice.id,
    "env.plugin-root-ignored",
    "asserted by catalogue id (§10.3), not by matching rendered text alone",
  );
  assert.equal(
    notice.text,
    message("env.plugin-root-ignored", { value: envValue }),
    "rendered text must come from lib/catalogue.mjs's message(id, params), not be re-derived inline",
  );
  assert.match(notice.text, new RegExp(envValue.replace(/[/.]/g, "\\$&")), "carries the ignored value");
  assert.match(notice.text, /--dev/, "carries the --dev remedy");
});

// ── row 4: devDeclared: false, PDLC_PLUGIN_ROOT unset — unchanged ────────────

test("T32: devDeclared false with no PDLC_PLUGIN_ROOT set is unchanged: discovery, no notice", () => {
  const fs = fakeFs({ ...pluginTree(DISCOVERED_ROOT), ...registryFile(DISCOVERED_ROOT) });
  const out = resolvePluginRoot({ devDeclared: false, env: {}, home: HOME, fs });
  assert.equal(out.ok, true);
  assert.equal(out.root, DISCOVERED_ROOT);
  assert.deepEqual(
    out.notices,
    [],
    "the ignore branch must not fire on an unset variable — a notice always emitted would not be falsifiable",
  );
});
