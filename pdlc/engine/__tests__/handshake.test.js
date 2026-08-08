// Tests for pdlc/engine/lib/handshake.mjs (REQ C-10). Offline: injected fs only.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  parseVersion,
  satisfiesRange,
  readPluginVersion,
  checkCompat,
  buildBanner,
} from "../lib/handshake.mjs";

function fsWith(files) {
  return {
    readFileSync: (p) => {
      if (!Object.hasOwn(files, p)) {
        const err = new Error(`ENOENT: no such file or directory, open '${p}'`);
        err.code = "ENOENT";
        throw err;
      }
      return files[p];
    },
  };
}

const MANIFEST = path.join("/p", ".claude-plugin", "plugin.json");

// ── version parsing ───────────────────────────────────────────────────────────

test("parseVersion is total: parses x.y.z (with optional v/prerelease), null otherwise", () => {
  assert.deepEqual(parseVersion("0.22.0"), { major: 0, minor: 22, patch: 0 });
  assert.deepEqual(parseVersion("v1.2.3"), { major: 1, minor: 2, patch: 3 });
  assert.deepEqual(parseVersion("1.2.3-beta.1"), { major: 1, minor: 2, patch: 3 });
  for (const bad of ["", "1.2", "abc", null, undefined, "1.2.x", {}]) {
    assert.equal(parseVersion(bad), null, `expected null for ${JSON.stringify(bad)}`);
  }
});

// ── range semantics ───────────────────────────────────────────────────────────

test("caret on a 0.x range is bounded by the next minor (npm semantics)", () => {
  assert.equal(satisfiesRange("0.22.0", "^0.22.0").ok, true);
  assert.equal(satisfiesRange("0.22.7", "^0.22.0").ok, true);
  assert.equal(satisfiesRange("0.23.0", "^0.22.0").ok, false);
  assert.equal(satisfiesRange("0.21.9", "^0.22.0").ok, false);
  assert.equal(satisfiesRange("1.0.0", "^0.22.0").ok, false);
});

test("caret on a 1.x range is bounded by the next major", () => {
  assert.equal(satisfiesRange("1.2.3", "^1.2.3").ok, true);
  assert.equal(satisfiesRange("1.9.9", "^1.2.3").ok, true);
  assert.equal(satisfiesRange("2.0.0", "^1.2.3").ok, false);
  assert.equal(satisfiesRange("1.2.2", "^1.2.3").ok, false);
});

test("caret on 0.0.z pins the patch exactly", () => {
  assert.equal(satisfiesRange("0.0.5", "^0.0.5").ok, true);
  assert.equal(satisfiesRange("0.0.6", "^0.0.5").ok, false);
});

test("tilde, exact and wildcard ranges", () => {
  assert.equal(satisfiesRange("0.22.9", "~0.22.0").ok, true);
  assert.equal(satisfiesRange("0.23.0", "~0.22.0").ok, false);
  assert.equal(satisfiesRange("0.22.0", "0.22.0").ok, true);
  assert.equal(satisfiesRange("0.22.1", "0.22.0").ok, false);
  assert.equal(satisfiesRange("9.9.9", "*").ok, true);
});

test("an unsupported range grammar fails closed rather than passing", () => {
  for (const bad of [">=0.22.0", "0.22.x", "", "latest"]) {
    assert.equal(satisfiesRange("0.22.0", bad).ok, false, `range ${JSON.stringify(bad)}`);
  }
});

// ── manifest reading ──────────────────────────────────────────────────────────

test("readPluginVersion reads the version from .claude-plugin/plugin.json", () => {
  const fs = fsWith({ [MANIFEST]: JSON.stringify({ name: "pdlc", version: "0.22.0" }) });
  const out = readPluginVersion("/p", { fs });
  assert.equal(out.ok, true);
  assert.equal(out.version, "0.22.0");
  assert.equal(out.manifestPath, MANIFEST);
});

test("readPluginVersion reports missing, unparseable, and version-less manifests distinctly", () => {
  assert.match(readPluginVersion("/p", { fs: fsWith({}) }).reason, /cannot read plugin manifest/);
  assert.match(
    readPluginVersion("/p", { fs: fsWith({ [MANIFEST]: "{oops" }) }).reason,
    /not valid JSON/
  );
  assert.match(
    readPluginVersion("/p", { fs: fsWith({ [MANIFEST]: '{"name":"pdlc"}' }) }).reason,
    /no parseable "version" field/
  );
});

// ── the handshake decision ────────────────────────────────────────────────────

test("an in-range plugin version passes", () => {
  const out = checkCompat("^0.22.0", "0.22.3");
  assert.equal(out.ok, true);
  assert.equal(out.reason, null);
  assert.equal(out.pluginVersion, "0.22.3");
  assert.equal(out.range, "^0.22.0");
});

test("a missing plugin refuses and names the range, 'not found', and the remedy", () => {
  const out = checkCompat("^0.22.0", null);
  assert.equal(out.ok, false);
  assert.equal(out.pluginVersion, "not found");
  assert.match(out.reason, /\^0\.22\.0/);
  assert.match(out.reason, /not found/);
  assert.match(out.reason, /Remedy:/);
  assert.match(out.reason, /PDLC_PLUGIN_ROOT/);
});

test("an out-of-range plugin refuses naming BOTH versions, the range, and the remedy", () => {
  const out = checkCompat("^0.22.0", "0.25.1");
  assert.equal(out.ok, false);
  assert.match(out.reason, /0\.25\.1/, "must name the version found");
  assert.match(out.reason, /\^0\.22\.0/, "must name the engine's declared range");
  assert.match(out.reason, /Remedy:/);
});

test("an engine with no declared range refuses rather than assuming compatibility", () => {
  const out = checkCompat("", "0.22.0");
  assert.equal(out.ok, false);
  assert.match(out.reason, /declares no pdlcPluginCompat range/);
});

test("an unparseable installed version refuses", () => {
  assert.equal(checkCompat("^0.22.0", "not-a-version").ok, false);
});

// ── banner ────────────────────────────────────────────────────────────────────

test("the banner pairs engine and plugin version, and reports root, base URL and policy", () => {
  const lines = buildBanner({
    engineVersion: "0.1.0",
    pluginVersion: "0.22.0",
    pluginRoot: "/home/t/.claude/plugins/cache/yumo-plugins/pdlc/0.22.0",
    pluginCompat: "^0.22.0",
    apiKeyPolicy: ["none"],
    baseUrl: "http://127.0.0.1:8787",
  });
  const text = lines.join("\n");
  assert.match(text, /pdlc-engine v0\.1\.0/);
  assert.match(text, /pdlc v0\.22\.0/);
  assert.match(text, /engine requires \^0\.22\.0/);
  assert.match(text, /cache\/yumo-plugins\/pdlc\/0\.22\.0/);
  assert.match(text, /http:\/\/127\.0\.0\.1:8787/);
  assert.match(text, /apiKeySource policy \[none\]/);
  assert.match(text, /subscription only/);
});

test("the banner says 'direct' with no base URL and 'not found' with no plugin", () => {
  const text = buildBanner({
    engineVersion: "0.1.0",
    pluginVersion: null,
    pluginRoot: null,
    apiKeyPolicy: ["none"],
    baseUrl: undefined,
  }).join("\n");
  assert.match(text, /direct \(no ANTHROPIC_BASE_URL set\)/);
  assert.match(text, /pdlc vnot found/);
});
