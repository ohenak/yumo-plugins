// pdlc-engine skill resolution and dispatch-prompt composition
// (Phase 2, pdlc-headless-engine).
//
// REQ G-5 / C-10 / AC-3.1: skill prompts are NOT packaged inside the engine.
// They are read, at dispatch time, from the *installed* pdlc plugin, so the
// plugin stays the sole delivery vehicle for SKILL.md and `/pdlc:*` keeps
// working standalone in interactive sessions. The engine never snapshots,
// vendors, or syncs them.
//
// ── Discovered plugin-cache layout (probed on darwin, 2026-08-08; REQ O-8) ──
//
// Claude Code keeps an install registry and two on-disk trees under ~/.claude:
//
//   ~/.claude/plugins/installed_plugins.json
//       { "version": 2,
//         "plugins": {
//           "pdlc@yumo-plugins": [
//             { "scope": "user",
//               "installPath": "/Users/<u>/.claude/plugins/cache/yumo-plugins/pdlc/0.22.0",
//               "version": "0.22.0",
//               "installedAt": "...", "lastUpdated": "...", "gitCommitSha": "..." } ] } }
//
//     The registry key is "{pluginName}@{marketplaceName}", and the value is an
//     ARRAY (one entry per install scope). `installPath` points at a directory
//     that IS the plugin root: it directly contains `.claude-plugin/plugin.json`,
//     `skills/`, `hooks/`, `workflows/`, `templates/`.
//
//   ~/.claude/plugins/cache/{marketplace}/{plugin}/{version}/
//       The extracted, version-pinned plugin tree `installPath` names above.
//       This is the authoritative copy the running Claude Code session loads.
//
//   ~/.claude/plugins/marketplaces/{marketplace}/
//       A git checkout of the whole marketplace REPO — so the plugin root here is
//       a SUBDIRECTORY (`marketplaces/yumo-plugins/pdlc/`), named by
//       `.claude-plugin/marketplace.json` → plugins[].source ("./pdlc"). It is
//       the update source, not the pinned install, and can be ahead of the cache.
//
// Both trees are supported below, in that order of preference, because only the
// cache tree is version-pinned to what the session actually loaded. A dev
// override (env PDLC_PLUGIN_ROOT or --plugin-root) beats both and is how this
// repo's own checkout is used: the working tree's `pdlc/` directory is itself a
// valid plugin root.

import nodeFs from "node:fs";
import nodeOs from "node:os";
import path from "node:path";

import { parseVersion } from "./handshake.mjs";

/** The marketplace-independent plugin name this engine drives. */
export const PLUGIN_NAME = "pdlc";

/** Env var an operator sets to point the engine at an arbitrary plugin root. */
export const PLUGIN_ROOT_ENV = "PDLC_PLUGIN_ROOT";

/**
 * Minimal filesystem surface every function here depends on. Injected whole in
 * tests so no case touches the real disk.
 */
const defaultFs = {
  existsSync: (p) => nodeFs.existsSync(p),
  readFileSync: (p, enc) => nodeFs.readFileSync(p, enc),
  readdirSync: (p) => nodeFs.readdirSync(p),
  statSync: (p) => nodeFs.statSync(p),
};

/** True when `dir` looks like a plugin root: manifest + skills tree both present. */
export function isPluginRoot(dir, fs = defaultFs) {
  if (!dir) return false;
  try {
    return (
      fs.existsSync(path.join(dir, ".claude-plugin", "plugin.json")) &&
      fs.existsSync(path.join(dir, "skills"))
    );
  } catch {
    return false;
  }
}

function safeReaddir(fs, dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function safeReadJson(fs, file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Candidates from ~/.claude/plugins/installed_plugins.json — the registry, and
 * therefore the most authoritative source: it names the exact tree the running
 * Claude Code loads for `pdlc@{marketplace}`.
 */
function registryCandidates(claudeDir, fs) {
  const registry = safeReadJson(fs, path.join(claudeDir, "plugins", "installed_plugins.json"));
  if (!registry || typeof registry.plugins !== "object" || registry.plugins === null) return [];

  const out = [];
  for (const [key, entries] of Object.entries(registry.plugins)) {
    // Key grammar is "{plugin}@{marketplace}"; match on the plugin half only,
    // so any marketplace that ships pdlc is discovered.
    if (key.split("@")[0] !== PLUGIN_NAME) continue;
    const list = Array.isArray(entries) ? entries : [entries];
    for (const entry of list) {
      if (!entry || typeof entry.installPath !== "string") continue;
      out.push({
        root: entry.installPath,
        source: `installed_plugins.json (${key})`,
        // `lastUpdated` orders multiple scopes; absent sorts oldest.
        lastUpdated: typeof entry.lastUpdated === "string" ? entry.lastUpdated : "",
      });
    }
  }
  // Newest install wins when a plugin is installed at more than one scope.
  out.sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : a.lastUpdated > b.lastUpdated ? -1 : 0));
  return out.map(({ root, source }) => ({ root, source }));
}

/**
 * Candidates from the extracted cache tree, walked directly. This is the
 * fallback for a registry that is missing, corrupt, or written in a schema this
 * code does not know: cache/{marketplace}/{plugin}/{version}/.
 */
function cacheCandidates(claudeDir, fs) {
  const cacheDir = path.join(claudeDir, "plugins", "cache");
  const out = [];
  for (const marketplace of safeReaddir(fs, cacheDir)) {
    const pluginDir = path.join(cacheDir, marketplace, PLUGIN_NAME);
    // Highest version first. The comparison is SEMVER, not lexicographic:
    // "0.9.0" sorts above "0.22.0" as a string, which would resolve an old
    // cached plugin in preference to the current one. Unparseable directory
    // names sort last rather than throwing.
    const versions = safeReaddir(fs, pluginDir).sort((a, b) => {
      const va = parseVersion(a);
      const vb = parseVersion(b);
      if (!va && !vb) return a < b ? 1 : a > b ? -1 : 0;
      if (!va) return 1;
      if (!vb) return -1;
      if (va.major !== vb.major) return vb.major - va.major;
      if (va.minor !== vb.minor) return vb.minor - va.minor;
      return vb.patch - va.patch;
    });
    for (const version of versions) {
      out.push({
        root: path.join(pluginDir, version),
        source: `plugin cache (${marketplace}/${PLUGIN_NAME}/${version})`,
      });
    }
  }
  return out;
}

/**
 * Candidates from the marketplace git checkouts. The plugin root is a
 * subdirectory of the repo, named by marketplace.json → plugins[].source when
 * that file parses; we also try the conventional `{repo}/pdlc` directly, which
 * is what this marketplace uses.
 */
function marketplaceCandidates(claudeDir, fs) {
  const mktDir = path.join(claudeDir, "plugins", "marketplaces");
  const out = [];
  for (const marketplace of safeReaddir(fs, mktDir)) {
    const repo = path.join(mktDir, marketplace);
    const manifest = safeReadJson(fs, path.join(repo, ".claude-plugin", "marketplace.json"));
    const declared = Array.isArray(manifest && manifest.plugins) ? manifest.plugins : [];
    for (const p of declared) {
      if (!p || p.name !== PLUGIN_NAME || typeof p.source !== "string") continue;
      out.push({
        root: path.resolve(repo, p.source),
        source: `marketplace checkout (${marketplace}, declared source ${p.source})`,
      });
    }
    out.push({
      root: path.join(repo, PLUGIN_NAME),
      source: `marketplace checkout (${marketplace}, conventional layout)`,
    });
  }
  return out;
}

/**
 * Resolve the pdlc plugin root.
 *
 * Order (decided design, do not reorder): explicit override → install registry →
 * extracted cache tree → marketplace checkout.
 *
 * @param {object} [opts]
 * @param {object} [opts.env] Environment to read `PDLC_PLUGIN_ROOT` from.
 * @param {string} [opts.override] Explicit root (CLI `--plugin-root`); beats env.
 * @param {string} [opts.home] Home directory; defaults to os.homedir().
 * @param {object} [opts.fs] Injected filesystem surface.
 * @returns {{ok: boolean, root: string|null, source: string|null,
 *            reason: string|null, tried: Array<{root: string, source: string}>}}
 *   `tried` lists every candidate considered, in order, for a legible refusal.
 */
export function resolvePluginRoot({
  env = process.env,
  override = null,
  home = null,
  fs = defaultFs,
} = {}) {
  const tried = [];

  const explicit = override || (env && env[PLUGIN_ROOT_ENV]) || null;
  if (explicit) {
    const root = path.resolve(explicit);
    const source = override
      ? "explicit override (--plugin-root)"
      : `explicit override (${PLUGIN_ROOT_ENV})`;
    tried.push({ root, source });
    if (isPluginRoot(root, fs)) return { ok: true, root, source, reason: null, tried };
    // An explicit override that is wrong is an operator error, not a reason to
    // silently fall through to a different plugin than the one they named.
    return {
      ok: false,
      root: null,
      source: null,
      reason:
        `${source} points at ${root}, which is not a pdlc plugin root ` +
        `(expected .claude-plugin/plugin.json and skills/ inside it)`,
      tried,
    };
  }

  const claudeDir = path.join(home || nodeOs.homedir(), ".claude");
  const candidates = [
    ...registryCandidates(claudeDir, fs),
    ...cacheCandidates(claudeDir, fs),
    ...marketplaceCandidates(claudeDir, fs),
  ];

  const seen = new Set();
  for (const candidate of candidates) {
    if (seen.has(candidate.root)) continue;
    seen.add(candidate.root);
    tried.push(candidate);
    if (isPluginRoot(candidate.root, fs)) {
      return { ok: true, root: candidate.root, source: candidate.source, reason: null, tried };
    }
  }

  return {
    ok: false,
    root: null,
    source: null,
    reason: `no installed pdlc plugin found under ${claudeDir}/plugins (registry, cache, and marketplace checkouts all searched)`,
    tried,
  };
}

/**
 * Map a skill identifier to its file path inside a plugin root.
 *
 * Two forms are accepted:
 *   "pm-author"                          → skills/pm-author/SKILL.md
 *   "se-implement:SKILL-typescript.md"   → skills/se-implement/SKILL-typescript.md
 * ("/" works in place of ":" for the second form.)
 */
export function skillFilePath(pluginRoot, skillName) {
  const raw = String(skillName || "").trim();
  if (!raw) throw new Error("skillFilePath: skill name is required");
  const [dir, file] = raw.includes(":")
    ? raw.split(":", 2)
    : raw.includes("/")
      ? raw.split("/", 2)
      : [raw, "SKILL.md"];
  if (!dir || !file) throw new Error(`skillFilePath: malformed skill identifier "${raw}"`);
  // Traversal guard: identifiers come from the workflow modules, but a skill
  // name is still the one string that turns into a path read.
  if (dir.includes("..") || file.includes("..") || file.includes("/")) {
    throw new Error(`skillFilePath: illegal skill identifier "${raw}"`);
  }
  return path.join(pluginRoot, "skills", dir, file);
}

/**
 * Inline every sibling `.md` supplement in a skill's directory beside its
 * SKILL.md (DEC-ENG-06): a bare identifier's dispatch prompt-file set is
 * SKILL.md plus every other prompt file that lives next to it, never
 * SKILL.md alone. Directory listing is best-effort: an injected fs surface
 * with no `readdirSync` (several dispatch-path test fixtures target skills
 * with no supplements at all) is treated as "no supplements found", not a
 * hard failure — and a supplement that vanishes between the listing and the
 * read is skipped rather than sinking the whole dispatch.
 */
function withSupplements(fs, dir, skillMdText) {
  let names;
  try {
    names = fs.readdirSync(dir);
  } catch {
    return skillMdText;
  }
  const supplements = names.filter((n) => n.endsWith(".md") && n !== "SKILL.md").sort();
  if (supplements.length === 0) return skillMdText;
  let combined = skillMdText;
  for (const name of supplements) {
    let supplementText;
    try {
      supplementText = fs.readFileSync(path.join(dir, name), "utf8");
    } catch {
      continue;
    }
    combined +=
      `\n\n--- BEGIN SUPPLEMENT: ${name} ---\n` +
      `${supplementText}\n` +
      `--- END SUPPLEMENT: ${name} ---`;
  }
  return combined;
}

/**
 * Read one skill prompt file from the installed plugin. For a bare
 * identifier (e.g. "se-implement") this also inlines every supplement
 * beside SKILL.md (DEC-ENG-06); an explicit identifier ("se-implement:
 * SKILL-typescript.md" or "se-implement/SKILL-typescript.md") targets that
 * one file only, unchanged from before.
 * @returns {{name: string, path: string, text: string}}
 * @throws when SKILL.md is missing or empty — a dispatch with no role prompt is
 *   never better than a refusal.
 */
export function loadSkill(pluginRoot, skillName, { fs = defaultFs } = {}) {
  const raw = String(skillName || "").trim();
  const isExplicit = raw.includes(":") || raw.includes("/");
  const file = skillFilePath(pluginRoot, skillName);
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch (err) {
    throw new Error(
      `skill "${skillName}" not found in the installed pdlc plugin: ${file} (${err && err.message ? err.message : err})`
    );
  }
  if (!text || !text.trim()) {
    throw new Error(`skill "${skillName}" resolved to an empty file: ${file}`);
  }
  if (isExplicit) {
    return { name: skillName, path: file, text };
  }
  return { name: skillName, path: file, text: withSupplements(fs, path.dirname(file), text) };
}

/**
 * Compose the dispatch prompt. Mirrors the workflow adapter's `rtSkillPrompt`
 * INTENT (role line, then instructions, then task) but INLINES the skill bytes:
 * there is no Skill tool in a plain-Node dispatch and no `pdlc:` namespace to
 * reference (REQ AC-3.1).
 */
export function composeDispatchPrompt(skillName, skillText, taskPrompt) {
  const name = String(skillName || "").split(":")[0].split("/")[0];
  return (
    `You are the "${name}" agent in the PDLC pipeline.\n` +
    `Your complete role definition follows between the markers below. ` +
    `Read it in full and follow it exactly for the task after it.\n\n` +
    `--- BEGIN ROLE DEFINITION: ${name} ---\n` +
    `${String(skillText)}\n` +
    `--- END ROLE DEFINITION: ${name} ---\n\n` +
    `Task:\n${String(taskPrompt == null ? "" : taskPrompt)}`
  );
}
