// Tests for pdlc/engine/lib/skills.mjs. Fully offline: every case injects a
// fake filesystem, so no test reads ~/.claude or this repo's own plugin tree.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  resolvePluginRoot,
  loadSkill,
  skillFilePath,
  composeDispatchPrompt,
  isPluginRoot,
  PLUGIN_ROOT_ENV,
} from "../lib/skills.mjs";

const HOME = "/home/tester";
const CLAUDE = path.join(HOME, ".claude");

/**
 * A fake fs over a plain {path: contents} map. Directories are implied by the
 * files under them, which is enough for existsSync/readdirSync/readFileSync.
 */
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
function pluginTree(root, version = "0.22.0", extra = {}) {
  return {
    [path.join(root, ".claude-plugin", "plugin.json")]: JSON.stringify({
      name: "pdlc",
      version,
    }),
    [path.join(root, "skills", "pm-author", "SKILL.md")]: `# pm-author (${root})`,
    ...extra,
  };
}

const CACHE_ROOT = path.join(CLAUDE, "plugins", "cache", "yumo-plugins", "pdlc", "0.22.0");
const MKT_ROOT = path.join(CLAUDE, "plugins", "marketplaces", "yumo-plugins", "pdlc");

function registryFile(installPath, lastUpdated = "2026-08-08T18:13:51.792Z") {
  return {
    [path.join(CLAUDE, "plugins", "installed_plugins.json")]: JSON.stringify({
      version: 2,
      plugins: {
        "pdlc@yumo-plugins": [
          { scope: "user", installPath, version: "0.22.0", lastUpdated },
        ],
      },
    }),
  };
}

// ── isPluginRoot ──────────────────────────────────────────────────────────────

test("isPluginRoot requires both the manifest and the skills tree", () => {
  const fs = fakeFs({
    ...pluginTree("/good"),
    "/bad/.claude-plugin/plugin.json": "{}",
  });
  assert.equal(isPluginRoot("/good", fs), true);
  assert.equal(isPluginRoot("/bad", fs), false, "manifest without skills/ is not a plugin root");
  assert.equal(isPluginRoot("/nowhere", fs), false);
  assert.equal(isPluginRoot(null, fs), false);
});

// ── resolution order ──────────────────────────────────────────────────────────

test("explicit CLI override wins over env and over every discovered install", () => {
  const fs = fakeFs({
    ...pluginTree("/override"),
    ...pluginTree("/from-env"),
    ...pluginTree(CACHE_ROOT),
    ...registryFile(CACHE_ROOT),
  });
  const out = resolvePluginRoot({
    override: "/override",
    env: { [PLUGIN_ROOT_ENV]: "/from-env" },
    home: HOME,
    fs,
  });
  assert.equal(out.ok, true);
  assert.equal(out.root, "/override");
  assert.match(out.source, /--plugin-root/);
});

test("env PDLC_PLUGIN_ROOT wins over discovery", () => {
  const fs = fakeFs({
    ...pluginTree("/from-env"),
    ...pluginTree(CACHE_ROOT),
    ...registryFile(CACHE_ROOT),
  });
  const out = resolvePluginRoot({ env: { [PLUGIN_ROOT_ENV]: "/from-env" }, home: HOME, fs });
  assert.equal(out.ok, true);
  assert.equal(out.root, "/from-env");
  assert.match(out.source, new RegExp(PLUGIN_ROOT_ENV));
});

test("an override that is not a plugin root fails closed and does not fall through", () => {
  const fs = fakeFs({
    "/override/README.md": "not a plugin",
    ...pluginTree(CACHE_ROOT),
    ...registryFile(CACHE_ROOT),
  });
  const out = resolvePluginRoot({ override: "/override", home: HOME, fs });
  assert.equal(out.ok, false, "a named-but-wrong override must never silently resolve elsewhere");
  assert.equal(out.root, null);
  assert.match(out.reason, /not a pdlc plugin root/);
  assert.match(out.reason, /\/override/);
});

test("discovery prefers the install registry's installPath", () => {
  const fs = fakeFs({
    ...pluginTree(CACHE_ROOT),
    ...pluginTree(MKT_ROOT),
    ...registryFile(CACHE_ROOT),
  });
  const out = resolvePluginRoot({ env: {}, home: HOME, fs });
  assert.equal(out.ok, true);
  assert.equal(out.root, CACHE_ROOT);
  assert.match(out.source, /installed_plugins\.json \(pdlc@yumo-plugins\)/);
});

test("a missing registry falls back to walking the extracted cache tree", () => {
  const fs = fakeFs({ ...pluginTree(CACHE_ROOT), ...pluginTree(MKT_ROOT) });
  const out = resolvePluginRoot({ env: {}, home: HOME, fs });
  assert.equal(out.ok, true);
  assert.equal(out.root, CACHE_ROOT);
  assert.match(out.source, /plugin cache/);
});

test("a corrupt registry does not stop discovery", () => {
  const fs = fakeFs({
    [path.join(CLAUDE, "plugins", "installed_plugins.json")]: "{ this is not json",
    ...pluginTree(CACHE_ROOT),
  });
  const out = resolvePluginRoot({ env: {}, home: HOME, fs });
  assert.equal(out.ok, true);
  assert.equal(out.root, CACHE_ROOT);
});

test("the cache walk picks the highest cached version", () => {
  const older = path.join(CLAUDE, "plugins", "cache", "yumo-plugins", "pdlc", "0.9.0");
  const newer = path.join(CLAUDE, "plugins", "cache", "yumo-plugins", "pdlc", "0.22.0");
  const fs = fakeFs({ ...pluginTree(older, "0.9.0"), ...pluginTree(newer, "0.22.0") });
  const out = resolvePluginRoot({ env: {}, home: HOME, fs });
  assert.equal(out.ok, true);
  assert.equal(out.root, newer);
});

test("with no cache, the marketplace checkout is discovered via marketplace.json source", () => {
  const repo = path.join(CLAUDE, "plugins", "marketplaces", "yumo-plugins");
  const fs = fakeFs({
    [path.join(repo, ".claude-plugin", "marketplace.json")]: JSON.stringify({
      name: "yumo-plugins",
      plugins: [{ name: "pdlc", source: "./pdlc" }],
    }),
    ...pluginTree(MKT_ROOT),
  });
  const out = resolvePluginRoot({ env: {}, home: HOME, fs });
  assert.equal(out.ok, true);
  assert.equal(out.root, MKT_ROOT);
  assert.match(out.source, /marketplace checkout/);
});

test("no plugin anywhere is a legible refusal listing what was tried", () => {
  const fs = fakeFs({ "/unrelated/file": "x" });
  const out = resolvePluginRoot({ env: {}, home: HOME, fs });
  assert.equal(out.ok, false);
  assert.equal(out.root, null);
  assert.match(out.reason, /no installed pdlc plugin found/);
  assert.ok(Array.isArray(out.tried));
});

// ── skill loading ─────────────────────────────────────────────────────────────

test("skillFilePath maps a bare name to skills/{name}/SKILL.md", () => {
  assert.equal(skillFilePath("/p", "pm-author"), "/p/skills/pm-author/SKILL.md");
});

test("skillFilePath maps a supplement by explicit name, with : or /", () => {
  assert.equal(
    skillFilePath("/p", "se-implement:SKILL-typescript.md"),
    "/p/skills/se-implement/SKILL-typescript.md"
  );
  assert.equal(
    skillFilePath("/p", "se-implement/SKILL-python.md"),
    "/p/skills/se-implement/SKILL-python.md"
  );
});

test("skillFilePath refuses traversal and empty identifiers", () => {
  assert.throws(() => skillFilePath("/p", "../../etc:passwd"), /illegal skill identifier/);
  assert.throws(() => skillFilePath("/p", "x:../y"), /illegal skill identifier/);
  assert.throws(() => skillFilePath("/p", ""), /skill name is required/);
});

test("loadSkill returns the verbatim file text and its path", () => {
  const body = "---\nname: pm-author\n---\n\n# PM author\n\nDo the thing.\n";
  const fs = fakeFs({ "/p/skills/pm-author/SKILL.md": body });
  const loaded = loadSkill("/p", "pm-author", { fs });
  assert.equal(loaded.text, body);
  assert.equal(loaded.path, "/p/skills/pm-author/SKILL.md");
  assert.equal(loaded.name, "pm-author");
});

test("loadSkill loads an se-implement language supplement by explicit name", () => {
  const fs = fakeFs({ "/p/skills/se-implement/SKILL-typescript.md": "# TS supplement" });
  assert.equal(loadSkill("/p", "se-implement:SKILL-typescript.md", { fs }).text, "# TS supplement");
});

test("loadSkill throws on a missing or empty skill file", () => {
  const fs = fakeFs({ "/p/skills/blank/SKILL.md": "   \n\n" });
  assert.throws(() => loadSkill("/p", "nope", { fs }), /not found in the installed pdlc plugin/);
  assert.throws(() => loadSkill("/p", "blank", { fs }), /empty file/);
});

// ── prompt composition ────────────────────────────────────────────────────────

test("composeDispatchPrompt inlines the skill text verbatim and carries the task", () => {
  const skillText = "# se-author\n\nRule 1: cite file:line.\nRule 2: no `pdlc` namespace here.";
  const out = composeDispatchPrompt("se-author", skillText, "Write the TSPEC.");
  assert.ok(out.includes(skillText), "the full skill text must appear verbatim");
  assert.ok(out.includes("Task:\nWrite the TSPEC."));
  assert.match(out, /You are the "se-author" agent/);
});

test("composeDispatchPrompt names no Skill tool and no pdlc: namespace (AC-3.1)", () => {
  const out = composeDispatchPrompt("pm-review", "# pm-review\n\nreview things", "Review REQ.");
  assert.ok(!/Skill tool/i.test(out), "must not instruct a Skill-tool invocation");
  assert.ok(!out.includes("pdlc:"), "must carry no pdlc: namespace reference");
});

test("composeDispatchPrompt uses the base skill name for a supplement identifier", () => {
  const out = composeDispatchPrompt("se-implement:SKILL-typescript.md", "TS rules", "Do task A1.");
  assert.match(out, /You are the "se-implement" agent/);
  assert.ok(out.includes("TS rules"));
});
