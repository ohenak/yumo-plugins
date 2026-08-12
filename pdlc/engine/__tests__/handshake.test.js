// Tests for pdlc/engine/lib/handshake.mjs (REQ C-10). Offline: injected fs only.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  parseVersion,
  compare,
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

test("the banner pairs engine and plugin version, and reports root, base URL and the auth catalogue id", () => {
  const lines = buildBanner({
    engineVersion: "0.1.0",
    pluginVersion: "0.22.0",
    pluginRoot: "/home/t/.claude/plugins/cache/yumo-plugins/pdlc/0.22.0",
    pluginCompat: "^0.22.0",
    auth: { row: 2, catalogueId: "auth.session" },
    baseUrl: "http://127.0.0.1:8787",
  });
  const text = lines.join("\n");
  assert.match(text, /pdlc-engine v0\.1\.0/);
  assert.match(text, /pdlc v0\.22\.0/);
  assert.match(text, /engine requires \^0\.22\.0/);
  assert.match(text, /cache\/yumo-plugins\/pdlc\/0\.22\.0/);
  assert.match(text, /http:\/\/127\.0\.0\.1:8787/);
  assert.match(text, /auth:\s+auth\.session/);
});

test("the banner says 'direct' with no base URL, 'not found' with no plugin, and 'unknown' with no auth posture", () => {
  const text = buildBanner({
    engineVersion: "0.1.0",
    pluginVersion: null,
    pluginRoot: null,
    auth: undefined,
    baseUrl: undefined,
  }).join("\n");
  assert.match(text, /direct \(no ANTHROPIC_BASE_URL set\)/);
  assert.match(text, /pdlc vnot found/);
  assert.match(text, /auth:\s+unknown/);
});

test("BR-AUTH-2: the banner never carries a transport-reported apiKeySource — only the startup catalogue id", () => {
  const text = buildBanner({
    engineVersion: "0.1.0",
    pluginVersion: "0.22.0",
    auth: { row: 1, catalogueId: "auth.oauth-token" },
    baseUrl: null,
  }).join("\n");
  assert.match(text, /auth:\s+auth\.oauth-token/);
  assert.doesNotMatch(text, /apiKeySource/);
});

// ── ordering law: parseVersion/satisfiesRange as a total comparator ───────────
// (T41, PROP-HAND-6, S-5). `compare` (handshake.mjs:26) is exported for this
// suite alone; every other test in this file drives it only indirectly,
// through `satisfiesRange`.

function* generateVersionTriples() {
  // Small bounded ranges deliberately collide, sit adjacent, and sit far
  // apart on every field, so every possible ordering relation (<, ==, >) is
  // exercised on major, on minor and on patch, including the 0.0.z corner
  // `satisfiesRange`'s caret grammar treats specially.
  for (const major of [0, 1, 2]) {
    for (const minor of [0, 1, 2]) {
      for (const patch of [0, 1, 2]) {
        yield { major, minor, patch };
      }
    }
  }
}

function versionString(v) {
  return `${v.major}.${v.minor}.${v.patch}`;
}

const TRIPLES = [...generateVersionTriples()];

test("PROP-HAND-6/S-5: compare is total over a generated version-triple corpus — always -1, 0 or 1, never throws", () => {
  assert.ok(TRIPLES.length >= 20, "corpus must cover more than a handful of triples");
  for (const a of TRIPLES) {
    for (const b of TRIPLES) {
      let result;
      assert.doesNotThrow(() => {
        result = compare(a, b);
      });
      assert.ok(
        result === -1 || result === 0 || result === 1,
        `compare(${versionString(a)}, ${versionString(b)}) => ${String(result)}`,
      );
    }
  }
});

test("PROP-HAND-6/S-5: compare is antisymmetric — compare(a,b) is compare(b,a) negated, and 0 only together", () => {
  for (const a of TRIPLES) {
    for (const b of TRIPLES) {
      // `-compare(b, a)` can yield `-0` when `compare(b, a)` is `0`;
      // normalise before comparing so the assertion is about sign, not
      // about IEEE-754 zero identity.
      assert.equal(
        compare(a, b),
        -compare(b, a) || 0,
        `compare(${versionString(a)}, ${versionString(b)}) vs the reversed call`,
      );
    }
  }
});

test("PROP-HAND-6/S-5: compare is transitive over the generated corpus", () => {
  for (const a of TRIPLES) {
    for (const b of TRIPLES) {
      if (compare(a, b) > 0) continue;
      for (const c of TRIPLES) {
        if (compare(b, c) > 0) continue;
        assert.ok(
          compare(a, c) <= 0,
          `transitivity: ${versionString(a)} <= ${versionString(b)} <= ${versionString(c)} but compare(a,c) = ${compare(a, c)}`,
        );
      }
    }
  }
});

test("parseVersion is total and antisymmetric-preserving over the same corpus (round-trip through the string form)", () => {
  // parseVersion . versionString is the identity on this corpus, and the
  // round-tripped value orders identically to the source triple — the
  // comparator's laws above are therefore laws about *parsed versions*,
  // not an artifact of hand-built triples that skip parsing entirely.
  for (const a of TRIPLES) {
    const roundTripped = parseVersion(versionString(a));
    assert.deepEqual(roundTripped, a);
    for (const b of TRIPLES) {
      assert.equal(compare(roundTripped, b), compare(a, b));
    }
  }
});

// ── round-trip: a version inside a range stays inside it under patch bumps ────

test("PROP-HAND-6/S-5: a version inside a caret or tilde range stays inside it after any patch bump", () => {
  const patchBumps = [0, 1, 2, 5, 100];
  let checked = 0;
  for (const base of TRIPLES) {
    for (const prefix of ["^", "~"]) {
      // ^0.0.z pins the patch exactly (tested above in "caret on 0.0.z pins
      // the patch exactly") — a patch bump deliberately falls back out of
      // that range, so it is not part of this property.
      if (prefix === "^" && base.major === 0 && base.minor === 0) continue;

      const range = `${prefix}${versionString(base)}`;
      // The base version is always inside its own range.
      assert.equal(satisfiesRange(versionString(base), range).ok, true, range);

      for (const bump of patchBumps) {
        const bumped = { major: base.major, minor: base.minor, patch: base.patch + bump };
        const out = satisfiesRange(versionString(bumped), range);
        assert.equal(
          out.ok,
          true,
          `${versionString(bumped)} should stay inside ${range} after a +${bump} patch bump`,
        );
        checked += 1;
      }
    }
  }
  assert.ok(checked >= 20, "corpus must cover more than a handful of range/bump pairs");
});

test("PROP-HAND-6/S-5: a version outside a range is never pulled inside it by a patch bump alone", () => {
  // A version already below the range's lower bound (major.minor short of
  // base) stays below it no matter how its patch is bumped, since compare
  // never lets patch outrank major or minor.
  const range = "^1.2.3";
  for (const patch of [0, 1, 2, 100]) {
    const out = satisfiesRange(`1.1.${patch}`, range);
    assert.equal(out.ok, false, `1.1.${patch} must stay below ${range}`);
  }
});
