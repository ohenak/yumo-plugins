#!/usr/bin/env node
// PLAN T49 — support for .github/workflows/publish.yml (TSPEC §8.3, §8.4).
//
// Exports the pure, unit-tested functions `publish-channel.test.js` drives directly:
//   checkTagVersion(tag, packageVersion)              -> {ok, message}   PF-1 / AT-3.6
//   checkPluginCompatRange(pluginCompatRange, pluginVersion) -> {ok, message}  PF-2 / AT-3.7
//   runPublish(opts)                                   -> {conclusion, published, version, message}
//
// A thin CLI at the bottom (not itself unit-tested — it is a dispatcher over the
// functions above, reading real repo state where the tests inject fixtures) is what
// `publish.yml`'s `preflight` and `publish` jobs invoke.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { satisfiesRange } from "../lib/handshake.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(ENGINE_ROOT, "..", "..");
const PACKAGE_JSON_PATH = path.join(ENGINE_ROOT, "package.json");
const PLUGIN_JSON_PATH = path.join(REPO_ROOT, "pdlc", ".claude-plugin", "plugin.json");
const DECISIONS_PATH = path.join(REPO_ROOT, "docs", "_decisions", "DECISIONS-plugin-distribution.md");

// ─── PF-1 (AT-3.6) ──────────────────────────────────────────────────────────

/**
 * Does `tag` (e.g. "engine-v1.2.3") name the same version as `packageVersion`
 * (T-1a, pdlc/engine/package.json's `version`)? Failure names both values.
 * @returns {{ok: boolean, message: string|null}}
 */
export function checkTagVersion(tag, packageVersion) {
  const m = /^engine-v(.+)$/.exec(String(tag ?? ""));
  const tagVersion = m ? m[1] : null;
  if (!tagVersion) {
    return {
      ok: false,
      message:
        `tag "${tag}" does not match the "engine-v*" convention (TSPEC §8.1); ` +
        `no version could be read from it (expected manifest version: ${packageVersion})`,
    };
  }
  if (tagVersion !== packageVersion) {
    return {
      ok: false,
      message:
        `tag version ${tagVersion} does not equal pdlc/engine/package.json's version ` +
        `${packageVersion} (PF-1)`,
    };
  }
  return { ok: true, message: null };
}

// ─── PF-2 (AT-3.7) ──────────────────────────────────────────────────────────

/**
 * Does `pluginVersion` (T-1b) satisfy the declared `pluginCompatRange`
 * (`pdlcPluginCompat`)? Delegates to the runtime's own `satisfiesRange`
 * (lib/handshake.mjs) so CI and the runtime handshake cannot disagree about
 * the range grammar (TSPEC §8.3 PF-2). Failure names both the range and the
 * version.
 * @returns {{ok: boolean, message: string|null}}
 */
export function checkPluginCompatRange(pluginCompatRange, pluginVersion) {
  const verdict = satisfiesRange(pluginVersion, pluginCompatRange);
  if (!verdict.ok) {
    return {
      ok: false,
      message:
        `plugin version ${pluginVersion} does not satisfy the declared pdlcPluginCompat ` +
        `range ${pluginCompatRange} (PF-2): ${verdict.reason}`,
    };
  }
  return { ok: true, message: null };
}

// ─── runPublish (§8.4) ──────────────────────────────────────────────────────

/**
 * Orchestrates PF-1/PF-2 and the §8.4 channel call over an injected S-5
 * `channel`. See `publish-channel.test.js`'s header comment for `opts`'
 * full shape and each field's role.
 * @returns {Promise<{conclusion: "success"|"failure", published: boolean,
 *                     version: string|null, message: string}>}
 */
export async function runPublish({
  gateConclusion,
  tag,
  packageVersion,
  pluginCompatRange,
  pluginVersion,
  channel,
  name,
  tarballPath,
  tarballBytes,
  secretToken,
  sentinel,
  existingVersionMode,
  log,
}) {
  const record = (line) => {
    if (Array.isArray(log)) log.push(line);
  };
  const fail = (message) => {
    record(`FAILED: ${message}`);
    return { conclusion: "failure", published: false, version: null, message };
  };

  // The five §5.1 gate jobs' combined result (re-run at the tag, §8.2).
  if (gateConclusion !== "success") {
    return fail(`the PR-gate re-run did not succeed (gateConclusion: ${gateConclusion})`);
  }

  const pf1 = checkTagVersion(tag, packageVersion);
  if (!pf1.ok) return fail(pf1.message);

  const pf2 = checkPluginCompatRange(pluginCompatRange, pluginVersion);
  if (!pf2.ok) return fail(pf2.message);

  // AC-3.5's negative half: missing/empty NODE_AUTH_TOKEN is a named failure,
  // nothing published.
  if (!secretToken) {
    return fail("NODE_AUTH_TOKEN is missing or empty; refusing to publish (AC-3.5)");
  }

  const version = packageVersion;
  const alreadyPublished = await channel.exists(name, version);
  if (alreadyPublished) {
    // AT-3.3: idempotency, both branches exercised over the stub — public npm
    // refuses a re-publish, so only the stub can rehearse the no-op branch.
    if (existingVersionMode === "no-op") {
      const message = `version ${version} is already published; re-run is a no-op (AT-3.3)`;
      record(message);
      return { conclusion: "success", published: false, version, message };
    }
    return fail(
      `version ${version} already exists on the channel; refusing to overwrite it ` +
        `(AT-3.3 collision on ${version})`,
    );
  }

  // AC-3.5's absence half: the built artifact must never carry the sentinel
  // (in production, the real secret value) it was asked to guard.
  if (sentinel && tarballBytes && Buffer.from(tarballBytes).includes(Buffer.from(String(sentinel)))) {
    return fail(
      "the built artifact contains the sentinel credential value; refusing to publish (AC-3.5)",
    );
  }

  record(`publishing ${name}@${version}`);
  await channel.publish(tarballPath ?? `${name}-${version}.tgz`, { name, version });
  const message = `published ${name}@${version}`;
  record(message);
  return { conclusion: "success", published: true, version, message };
}

// ─── PF-3 ───────────────────────────────────────────────────────────────────

/**
 * Manifest is publishable: `private` absent, `license` a real SPDX id, and
 * `name` equal to the scope recorded in `DECISIONS-plugin-distribution.md`
 * (N-6) — asserted against the recorded decision, never a literal invented
 * here.
 * @returns {{ok: boolean, message: string|null}}
 */
export function checkManifestPublishable(manifest, decisionsText) {
  if (manifest.private) {
    return { ok: false, message: 'package.json still declares "private": true (PF-3, O-8 blocker 1)' };
  }
  if (!manifest.license || manifest.license === "UNLICENSED") {
    return {
      ok: false,
      message: `package.json's license field (${manifest.license}) is not a real SPDX id (PF-3, N-2)`,
    };
  }
  const scopeMatch = /^## DEC-DIST-06: The npm scope is `(@[a-z0-9-]+)`/m.exec(decisionsText ?? "");
  const recordedScope = scopeMatch ? scopeMatch[1] : null;
  if (!recordedScope) {
    return { ok: false, message: "no npm scope is recorded in DECISIONS-plugin-distribution.md (PF-3, N-6)" };
  }
  const expectedName = `${recordedScope}/pdlc-engine`;
  if (manifest.name !== expectedName) {
    return {
      ok: false,
      message:
        `package.json's name (${manifest.name}) does not equal the recorded scope's ` +
        `${expectedName} (PF-3, N-6)`,
    };
  }
  return { ok: true, message: null };
}

// ─── PF-4 / PF-5 (AT-3.8a/b) ────────────────────────────────────────────────
//
// Re-asserted against the packed tarball itself at publish time (§8.4 step 4),
// mirroring — not importing — `packaging.test.js`'s oracle: that file is a
// test module, not a production dependency, so this is a deliberate second,
// production-side copy of the same TSPEC §5.4 table, run for real at publish
// time rather than only in CI's test suite.

const LIB_MODULES_AT_HEAD = [
  "adapter",
  "auth",
  "catalogue",
  "guard-measurement",
  "handshake",
  "outcome",
  "report",
  "run",
  "skills",
  "startup",
  "transport-cli",
  "transport",
];
const LIB_MODULES_FROM_THIS_FEATURE = ["resolve-version", "store", "provenance"];
const WORKFLOW_MEMBERS = [
  "vendor/workflows/orchestrate-dev.js",
  "vendor/workflows/orchestrate-queue.js",
  "vendor/workflows/VENDOR-MANIFEST.json",
];

function licenceRecorded(decisionsText) {
  return /^\*\*N-2 recorded:\*\*\s*yes/m.test(decisionsText ?? "");
}

function expectedPackedSet({ licenceRecorded: licence }) {
  return [
    "package.json",
    "README.md",
    ...(licence ? ["LICENSE"] : []),
    "bin/pdlc.mjs",
    "bin/cli.mjs",
    ...LIB_MODULES_AT_HEAD.map((m) => `lib/${m}.mjs`),
    ...LIB_MODULES_FROM_THIS_FEATURE.map((m) => `lib/${m}.mjs`),
    ...WORKFLOW_MEMBERS,
    "scripts/postinstall.mjs",
  ];
}

/**
 * PF-4: the packed file list equals TSPEC §5.4's expected set member-for-
 * member, in both directions.
 * @returns {{ok: boolean, message: string|null}}
 */
export function checkPackedSet(actualMembers, decisionsText) {
  const expected = expectedPackedSet({ licenceRecorded: licenceRecorded(decisionsText) });
  const actualSet = new Set(actualMembers);
  const expectedSet = new Set(expected);
  const unexpected = actualMembers.filter((m) => !expectedSet.has(m));
  const missing = expected.filter((m) => !actualSet.has(m));
  if (unexpected.length > 0 || missing.length > 0) {
    return {
      ok: false,
      message:
        `packed set mismatch against TSPEC §5.4 (PF-4). Unexpected: ${JSON.stringify(unexpected)}. ` +
        `Missing: ${JSON.stringify(missing)}.`,
    };
  }
  return { ok: true, message: null };
}

/**
 * PF-5: vendor manifest hashes (`vendor/workflows/VENDOR-MANIFEST.json`)
 * equal the canonical sources at this commit (AF-2, §5.3).
 * @returns {{ok: boolean, message: string|null}}
 */
export function checkVendorManifest(vendorDir, sourceDir) {
  const manifestPath = path.join(vendorDir, "VENDOR-MANIFEST.json");
  if (!existsSync(manifestPath)) {
    return { ok: false, message: `${manifestPath} is missing (PF-5) — did prepack run?` };
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const entry of manifest.modules ?? []) {
    const vendoredPath = path.join(vendorDir, entry.name);
    const canonicalPath = path.join(sourceDir, entry.name);
    if (!existsSync(vendoredPath) || !existsSync(canonicalPath)) {
      return { ok: false, message: `${entry.name}: vendored or canonical source is missing (PF-5)` };
    }
    const vendoredHash = createHash("sha256").update(readFileSync(vendoredPath)).digest("hex");
    const canonicalHash = createHash("sha256").update(readFileSync(canonicalPath)).digest("hex");
    if (entry.sha256 !== vendoredHash || entry.sha256 !== canonicalHash) {
      return { ok: false, message: `${entry.name}: manifest hash disagrees with vendored/canonical bytes (PF-5)` };
    }
  }
  return { ok: true, message: null };
}

// ─── CLI (invoked by publish.yml) ───────────────────────────────────────────
//
// Not itself unit-tested: a thin dispatcher over the functions above, reading
// real repo/environment state where the tests inject fixtures instead.

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

function readManifest() {
  return readJson(PACKAGE_JSON_PATH);
}

function readPluginVersion() {
  return readJson(PLUGIN_JSON_PATH).version;
}

function readDecisionsText() {
  return existsSync(DECISIONS_PATH) ? readFileSync(DECISIONS_PATH, "utf8") : "";
}

function reportFailure(message) {
  console.error(`::error::${message}`);
  process.exitCode = 1;
}

function runPreflightCommand(tag) {
  const manifest = readManifest();
  const pf1 = checkTagVersion(tag, manifest.version);
  if (!pf1.ok) return reportFailure(pf1.message);
  console.log(`PF-1 ok: tag ${tag} matches package.json version ${manifest.version}`);

  const pluginVersion = readPluginVersion();
  const pf2 = checkPluginCompatRange(manifest.pdlcPluginCompat, pluginVersion);
  if (!pf2.ok) return reportFailure(pf2.message);
  console.log(`PF-2 ok: plugin version ${pluginVersion} satisfies ${manifest.pdlcPluginCompat}`);
}

function runManifestCommand() {
  const manifest = readManifest();
  const pf3 = checkManifestPublishable(manifest, readDecisionsText());
  if (!pf3.ok) return reportFailure(pf3.message);
  console.log(`PF-3 ok: package.json is publishable as ${manifest.name}`);
}

/**
 * F-5 step 6's pairing record, as a pure function of its inputs (TSPEC
 * §5.2:212, §8.4, O-6 single-writer). Extracted out of `runWritePairingCommand`
 * so the record's five-key shape is independently assertable — including by
 * `packaging.test.js` — without mutating the real `package.json`; the write
 * itself stays the publish job's job alone.
 *
 * @param {object} manifest parsed `package.json`
 * @param {string} pluginVersion `pdlc/.claude-plugin/plugin.json`'s version at tag time
 * @param {string} tag the publish tag (e.g. `engine-v0.1.0`)
 * @param {string} commit the commit sha the tag points at
 * @returns {{engineVersion: string, pluginCompat: string, pluginVersionAtTag: string, tag: string, commit: string}}
 */
export function buildPairingRecord(manifest, pluginVersion, tag, commit) {
  return {
    engineVersion: manifest.version,
    pluginCompat: manifest.pdlcPluginCompat,
    pluginVersionAtTag: pluginVersion,
    tag,
    commit,
  };
}

function runWritePairingCommand(tag) {
  const manifest = readManifest();
  const pluginVersion = readPluginVersion();
  const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  manifest.pdlcPairing = buildPairingRecord(manifest, pluginVersion, tag, commit);
  writeFileSync(PACKAGE_JSON_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`wrote pdlcPairing to ${PACKAGE_JSON_PATH}`);
}

function listTarballMembers(tarballPath) {
  const result = spawnSync("tar", ["-tzf", tarballPath], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`tar listing failed: ${result.stderr}`);
  }
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.endsWith("/"))
    .map((line) => line.replace(/^package\//, ""));
}

/**
 * `npm pack --json`'s `filename` field is version-dependent for scoped
 * packages: some npm versions report the scoped form (`@scope/name-x.y.z.tgz`,
 * matching the tarball's internal package name) while the file actually
 * written to disk is always the scope-normalized form
 * (`scope-name-x.y.z.tgz` — the leading `@` stripped, the first `/` turned
 * into `-`). Trusting the JSON verbatim breaks exactly when npm reports the
 * scoped form: the join produces a path that never existed
 * (`.../@kaneho/pdlc-engine-0.1.0.tgz`), and downstream `npm publish` on that
 * nonexistent path silently falls back to interpreting its argument as a
 * registry spec instead (an E404 `GET` on the package name, not a
 * file-not-found error — this is what shipped in publish.yml). Tried in
 * order: the verbatim `filename` from the JSON, then the scope-normalized
 * form; the first one that exists on disk wins. Neither existing is a build
 * defect, not a user error, so it fails loudly rather than silently packing
 * the wrong path forward.
 */
export function tarballPathFromPackResult(packResultPath) {
  const packInfo = readJson(packResultPath);
  const entry = Array.isArray(packInfo) ? packInfo[0] : packInfo;
  const destDir = path.dirname(path.resolve(packResultPath));
  const verbatimPath = path.join(destDir, entry.filename);
  if (existsSync(verbatimPath)) return verbatimPath;

  const normalizedFilename = entry.filename.replace(/^@/, "").replace("/", "-");
  const normalizedPath = path.join(destDir, normalizedFilename);
  if (existsSync(normalizedPath)) return normalizedPath;

  throw new Error(
    `tarballPathFromPackResult: could not find the packed tarball on disk. Tried:\n` +
      `  - ${verbatimPath} (verbatim "filename" from npm pack --json)\n` +
      `  - ${normalizedPath} (scope-normalized form)\n` +
      `Neither exists.`,
  );
}

function runVerifyPackedCommand(packResultPath) {
  const tarballPath = tarballPathFromPackResult(packResultPath);
  const members = listTarballMembers(tarballPath);

  const pf4 = checkPackedSet(members, readDecisionsText());
  if (!pf4.ok) return reportFailure(pf4.message);
  console.log(`PF-4 ok: packed set equals TSPEC §5.4's expected set (${members.length} members)`);

  const pf5 = checkVendorManifest(
    path.join(ENGINE_ROOT, "vendor", "workflows"),
    path.join(REPO_ROOT, "pdlc", "workflows"),
  );
  if (!pf5.ok) return reportFailure(pf5.message);
  console.log("PF-5 ok: vendor manifest hashes equal canonical sources");
}

/** Real §10.2 PublishChannel: shells out to `npm view`/`npm publish` (§8.4). */
function realPublishChannel() {
  return {
    exists: async (name, version) => {
      const result = spawnSync("npm", ["view", `${name}@${version}`, "version"], { encoding: "utf8" });
      if (result.status !== 0) return false;
      return result.stdout.trim() === version;
    },
    publish: async (tarballPath) => {
      const result = spawnSync("npm", ["publish", tarballPath, "--access", "public"], {
        encoding: "utf8",
        env: process.env,
      });
      if (result.status !== 0) {
        throw new Error(`npm publish failed: ${result.stderr || result.stdout}`);
      }
      return { ok: true };
    },
  };
}

async function runPublishCommand(packResultPath) {
  const manifest = readManifest();
  const tag = process.env.GITHUB_REF_NAME ?? "";
  const pluginVersion = readPluginVersion();
  const tarballPath = tarballPathFromPackResult(packResultPath);
  const tarballBytes = readFileSync(tarballPath);
  const log = [];

  const result = await runPublish({
    // `gate` and `preflight` are this workflow's own `needs:` — reaching this
    // step already proves both succeeded (§8.1).
    gateConclusion: "success",
    tag,
    packageVersion: manifest.version,
    pluginCompatRange: manifest.pdlcPluginCompat,
    pluginVersion,
    channel: realPublishChannel(),
    name: manifest.name,
    tarballPath,
    tarballBytes,
    secretToken: process.env.NODE_AUTH_TOKEN,
    sentinel: process.env.NODE_AUTH_TOKEN,
    existingVersionMode: "fail",
    log,
  });

  for (const line of log) console.log(line);
  if (result.conclusion !== "success") {
    reportFailure(result.message);
    return;
  }
  console.log(result.message);
}

async function main() {
  const [, , command, arg] = process.argv;
  switch (command) {
    case "preflight":
      runPreflightCommand(arg);
      break;
    case "manifest":
      runManifestCommand();
      break;
    case "write-pairing":
      runWritePairingCommand(arg);
      break;
    case "verify-packed":
      runVerifyPackedCommand(arg);
      break;
    case "publish":
      await runPublishCommand(arg);
      break;
    default:
      console.error(`unknown command: ${command}`);
      process.exitCode = 1;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}

