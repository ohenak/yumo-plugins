// Publish channel legs (PLAN T58, [red], batch 2; TSPEC §8.4, §10.1 S-5; FSPEC §5.1 kind 2;
// PROPERTIES PROP-PUB-1..5, PROP-PUB-8). Every block below is committed `test.skip`, titled with
// its owning `[green]` task's id, per PLAN v0.10's skipped-block convention (see
// `packaging.test.js`'s header for the same pattern): this is the `[red]` task, and the
// production this file's assertions are written against — `.github/workflows/publish.yml` and
// `pdlc/engine/scripts/publish-preflight.mjs` — lands in T49 (batch 5). T49's first act is to
// remove exactly the `.skip` wrappers below, then make each block pass.
//
// The stub-channel legs T49 previously claimed by ellipsis (PM round-1 F-05), each named here
// with the S-5 `fakePublishChannel` stub `_doubles.mjs` already exports (T03), which is this
// file's only consumer until T49:
//
//   AT-3.1 — whole-gate-green path: every §5.1 member green ⇒ the stub records exactly one
//            publish of the declared version, with no human step in the run. The red-member
//            conjugate of AT-3.2, on the same stub configuration.
//   AT-3.2 — one §5.1 member red ⇒ nothing published **and** the run's conclusion is
//            `failure`, asserted on the conclusion, not on package absence.
//   AT-3.3 — idempotency: the stub holds version N with its bytes hashed, the workflow is
//            re-run for N, both branches are exercised (explicit no-op; loud failure naming
//            the collision), one per stub configuration, and on **each** branch N's stored
//            bytes are unchanged and the output names N.
//   AT-3.5 — a known sentinel credential value scanned in both the built artifact and the
//            captured stub-publish log with zero occurrences, paired with AC-3.5's two
//            positives (secret present ⇒ the stub authenticates and the release is cut;
//            absent or empty ⇒ a named failure and nothing published).
//   AT-3.6 — a tag disagreeing with T-1a (the engine's `package.json` version) fails naming
//            both values.
//   AT-3.7 — a declared `pdlcPluginCompat` range excluding T-1b (the plugin version at the
//            tag) fails naming the range and the plugin version.
//
// Also covers PROP-PUB-8: `NODE_AUTH_TOKEN` consumed only by the `publish` step (a static
// read of `publish.yml`, no stub involved).
//
// Expected exports of `../scripts/publish-preflight.mjs` (T49, not yet created — this file
// therefore defers loading it to `import()` inside each test body, never a top-level import,
// so the file itself still loads and the skips take effect):
//
//   checkTagVersion(tag, packageVersion) -> {ok, message}
//     PF-1 / AT-3.6. `tag` is the full ref, e.g. `"engine-v1.2.3"`; `packageVersion` is T-1a.
//     `ok` is true iff the numeric version embedded in `tag` equals `packageVersion` exactly.
//     `message` on failure names **both** values (AT-3.6).
//
//   checkPluginCompatRange(pluginCompatRange, pluginVersion) -> {ok, message}
//     PF-2 / AT-3.7. Delegates to `satisfiesRange` (`lib/handshake.mjs`) — the same function
//     the runtime handshake uses (TSPEC §8.3 PF-2) — so CI and runtime cannot disagree about
//     the range grammar. `message` on failure names both the range and `pluginVersion`.
//
//   runPublish(opts) -> { conclusion: "success" | "failure", published: boolean,
//                         version: string | null, message: string }
//     Orchestrates PF-1..PF-5 and the §8.4 channel call over an injected S-5 `channel`.
//     `opts`:
//       gateConclusion        "success" | "failure" — the §5.1 gate jobs' combined result
//       tag                   e.g. "engine-v1.2.3"
//       packageVersion        T-1a
//       pluginCompatRange     `pdlcPluginCompat`
//       pluginVersion         T-1b
//       channel               S-5 PublishChannel (`exists`, `publish`)
//       name                  the package name `publish` is called with
//       tarballBytes          Buffer — the built artifact, scanned for the sentinel (AT-3.5)
//       secretToken           string | undefined | "" — stands in for `NODE_AUTH_TOKEN`
//       sentinel              string — the known sentinel credential value
//       existingVersionMode   "no-op" | "fail" — which of AT-3.3's two branches to exercise
//                              when `channel.exists` is already true for `version`
//       log                   string[] — the captured stub-publish log lines are pushed here
//     A red gate, a failing preflight check, a missing/empty secret, or the "fail" branch of
//     an existing version must all resolve with `published: false` and
//     `conclusion: "failure"`; only the all-green, no-collision path resolves `published: true`
//     with `conclusion: "success"` and exactly one `channel.publish` call.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { fakePublishChannel } from "./_doubles.mjs";
import { tspecPackedSet } from "./_tspec-packed-set.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(ENGINE_ROOT, "..", "..");
const PREFLIGHT_MODULE = path.join(ENGINE_ROOT, "scripts", "publish-preflight.mjs");
const PUBLISH_WORKFLOW = path.join(REPO_ROOT, ".github", "workflows", "publish.yml");

const SENTINEL = "PDLC-TEST-SENTINEL-DO-NOT-PUBLISH-abc123";

/** Loads T49's module by its filesystem path, deferred so this file loads before it exists. */
async function loadPreflight() {
  return import(pathToFileURL(PREFLIGHT_MODULE).href);
}

// ─── AT-3.1: whole-gate-green ⇒ exactly one publish, no human step ─────────────────────────

test(
  "T49: publish channel — whole-gate-green path publishes exactly once, no human step (AT-3.1)",
  async () => {
    const { runPublish } = await loadPreflight();
    const channel = fakePublishChannel();
    const log = [];

    const result = await runPublish({
      gateConclusion: "success",
      tag: "engine-v1.2.3",
      packageVersion: "1.2.3",
      pluginCompatRange: "^1.0.0",
      pluginVersion: "1.4.0",
      channel,
      name: "pdlc-engine",
      tarballBytes: Buffer.from("built-artifact-bytes"),
      secretToken: "npm_fake-token-for-test",
      sentinel: SENTINEL,
      existingVersionMode: "fail",
      log,
    });

    assert.equal(result.conclusion, "success");
    assert.equal(result.published, true);
    assert.equal(result.version, "1.2.3");
    assert.equal(channel.calls.publish.length, 1, "exactly one publish call, no human step");
    assert.equal(await channel.exists("pdlc-engine", "1.2.3"), true);
  },
);

// ─── AT-3.2: one red member ⇒ nothing published, conclusion `failure` ──────────────────────

test(
  "T49: publish channel — one red gate member ⇒ nothing published, conclusion asserted as failure (AT-3.2)",
  async () => {
    const { runPublish } = await loadPreflight();
    const channel = fakePublishChannel();

    const result = await runPublish({
      gateConclusion: "failure",
      tag: "engine-v1.2.3",
      packageVersion: "1.2.3",
      pluginCompatRange: "^1.0.0",
      pluginVersion: "1.4.0",
      channel,
      name: "pdlc-engine",
      tarballBytes: Buffer.from("built-artifact-bytes"),
      secretToken: "npm_fake-token-for-test",
      sentinel: SENTINEL,
      existingVersionMode: "fail",
      log: [],
    });

    // Asserted on the conclusion, not on package absence (PROP-PUB-2).
    assert.equal(result.conclusion, "failure");
    assert.equal(result.published, false);
    assert.equal(channel.calls.publish.length, 0);
  },
);

// ─── AT-3.3: idempotency — both branches, byte-identity on each ────────────────────────────

test(
  "T49: publish channel — re-run for an already-held version takes the no-op branch, bytes unchanged, output names the version (AT-3.3)",
  async () => {
    const { runPublish } = await loadPreflight();
    const tarballBytes = Buffer.from("built-artifact-bytes-for-N");
    const channel = fakePublishChannel({ existing: { "pdlc-engine": ["1.2.3"] } });
    const preRunVersions = new Set(channel.published.get("pdlc-engine"));
    assert.ok(preRunVersions.size > 0, "fixture setup: the pre-run bytes/state are non-empty");

    const result = await runPublish({
      gateConclusion: "success",
      tag: "engine-v1.2.3",
      packageVersion: "1.2.3",
      pluginCompatRange: "^1.0.0",
      pluginVersion: "1.4.0",
      channel,
      name: "pdlc-engine",
      tarballBytes,
      secretToken: "npm_fake-token-for-test",
      sentinel: SENTINEL,
      existingVersionMode: "no-op",
      log: [],
    });

    assert.equal(result.published, false, "the no-op branch never calls publish again");
    assert.match(result.message, /1\.2\.3/, "the output names N");
    assert.deepEqual(
      channel.published.get("pdlc-engine"),
      preRunVersions,
      "N's stored bytes are unchanged on the no-op branch",
    );
  },
);

test(
  "T49: publish channel — re-run for an already-held version takes the loud-failure branch naming the collision, bytes unchanged (AT-3.3)",
  async () => {
    const { runPublish } = await loadPreflight();
    const tarballBytes = Buffer.from("built-artifact-bytes-for-N");
    const channel = fakePublishChannel({ existing: { "pdlc-engine": ["1.2.3"] } });
    const preRunVersions = new Set(channel.published.get("pdlc-engine"));

    const result = await runPublish({
      gateConclusion: "success",
      tag: "engine-v1.2.3",
      packageVersion: "1.2.3",
      pluginCompatRange: "^1.0.0",
      pluginVersion: "1.4.0",
      channel,
      name: "pdlc-engine",
      tarballBytes,
      secretToken: "npm_fake-token-for-test",
      sentinel: SENTINEL,
      existingVersionMode: "fail",
      log: [],
    });

    assert.equal(result.conclusion, "failure");
    assert.equal(result.published, false);
    assert.match(result.message, /1\.2\.3/, "the loud failure names N (the collision)");
    assert.deepEqual(
      channel.published.get("pdlc-engine"),
      preRunVersions,
      "N's stored bytes are unchanged on the loud-failure branch",
    );
  },
);

// ─── AT-3.5: sentinel absent from artifact + log, plus AC-3.5's two positives ──────────────

test(
  "T49: publish channel — secret present ⇒ stub authenticates and the release is cut, sentinel absent from artifact and log (AT-3.5)",
  async () => {
    const { runPublish } = await loadPreflight();
    const channel = fakePublishChannel();
    const tarballBytes = Buffer.from("built-artifact-bytes, no secrets here");
    const log = [];

    const result = await runPublish({
      gateConclusion: "success",
      tag: "engine-v1.2.3",
      packageVersion: "1.2.3",
      pluginCompatRange: "^1.0.0",
      pluginVersion: "1.4.0",
      channel,
      name: "pdlc-engine",
      tarballBytes,
      secretToken: "npm_fake-token-for-test",
      sentinel: SENTINEL,
      existingVersionMode: "fail",
      log,
    });

    assert.equal(result.conclusion, "success");
    assert.equal(result.published, true, "positive: secret present ⇒ authenticated publish");
    assert.equal(
      tarballBytes.toString("utf8").includes(SENTINEL),
      false,
      "the built artifact must never contain the sentinel",
    );
    assert.equal(
      log.join("\n").includes(SENTINEL),
      false,
      "the captured stub-publish log must never contain the sentinel",
    );
  },
);

// ─── The publish CLI layer's one contract (TE CR F-02) ───────────────────────
//
// `publish.yml` reaches this module only through `run:` lines naming a
// subcommand token, and nothing tied those tokens to the `case` labels
// `main()` dispatches on. Measured: renaming `case "verify-packed":` to
// `case "verify-packed-MUTATED":` left the engine suite 725/725 green, and
// the rename would have failed at tag time — inside the one workflow the PR
// gate structurally cannot run — with `unknown command`.
//
// Set-equality in both directions, so a renamed case AND a workflow step
// invoking a subcommand nobody implemented each fail. This is the whole
// oracle: the module's behaviour is covered elsewhere, but the NAME the
// workflow calls it by was covered nowhere.

// Both parsers are scoped to the region that carries the contract (TE CR v2
// F-05). Whole-file scans were green but wider than the contract: a second
// `switch` in the module, or a commented-out `run:` line in the workflow,
// would have reddened this oracle for a reason that is not a contract
// violation, and a failure message that can mean something else is a failure
// message a future reader will discount.

/** Every subcommand token `publish.yml` invokes this module with, comments excluded. */
function workflowSubcommandTokens(workflowText) {
  const tokens = new Set();
  // A YAML comment cannot invoke anything. Only lines whose first non-space
  // character is `#` are dropped; a `#` inside a `run:` line is shell, not
  // YAML, and stripping those would narrow the scan below the contract.
  const live = workflowText
    .split("\n")
    .filter((line) => !/^\s*#/.test(line))
    .join("\n");
  const pattern = /publish-preflight\.mjs\s+([a-z][a-z0-9-]*)/g;
  let match;
  while ((match = pattern.exec(live)) !== null) tokens.add(match[1]);
  return [...tokens].sort();
}

/**
 * Every `case "<token>":` label `main()`'s switch dispatches on — read from
 * that switch's body alone, so a `case` label belonging to any other switch in
 * the module is not mistaken for a subcommand.
 */
function implementedSubcommands(moduleText) {
  const switchStart = moduleText.indexOf("switch (command) {");
  assert.ok(switchStart >= 0, "main()'s dispatch switch was not found — the parser, not the module, is stale");
  // Balance braces from the switch's own `{` so the body ends where it ends.
  let depth = 0;
  let end = -1;
  for (let i = moduleText.indexOf("{", switchStart); i < moduleText.length; i += 1) {
    if (moduleText[i] === "{") depth += 1;
    else if (moduleText[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  assert.ok(end > switchStart, "main()'s dispatch switch is unbalanced — the parser cannot scope the scan");
  const body = moduleText.slice(switchStart, end);

  const labels = new Set();
  const pattern = /^\s*case "([a-z][a-z0-9-]*)":/gm;
  let match;
  while ((match = pattern.exec(body)) !== null) labels.add(match[1]);
  return [...labels].sort();
}

test(
  "T49: the subcommand tokens publish.yml invokes are set-equal to the cases main() implements (§8.1, §8.4)",
  async () => {
    const workflowText = readFileSync(PUBLISH_WORKFLOW, "utf8");
    const moduleText = readFileSync(PREFLIGHT_MODULE, "utf8");

    const invoked = workflowSubcommandTokens(workflowText);
    const implemented = implementedSubcommands(moduleText);

    // Positive control first: an equality between two empty sets is
    // satisfied by a parser that matched nothing, which is the failure mode
    // this whole oracle exists to avoid.
    assert.ok(invoked.length >= 5, `the workflow must invoke at least the five known subcommands, parsed: ${invoked}`);
    assert.ok(implemented.length >= 5, `main() must implement at least five subcommands, parsed: ${implemented}`);

    assert.deepEqual(
      invoked,
      implemented,
      "every token publish.yml runs must be a case main() implements, and every case must be reachable from the workflow — " +
        `workflow: [${invoked}] vs module: [${implemented}]`,
    );
  },
);

// ─── AT-3.5's falsifier: a POISONED tarball must redden (TE CR F-01) ──────────
//
// The leg above asserts the sentinel is absent from a tarball that never
// contained it — true of any implementation, including one with no guard at
// all. Measured: deleting the `Buffer.includes(sentinel)` branch in
// `runPublish` left the whole engine suite 725/725 green, so AC-3.5's
// absence half shipped unguarded. These two legs are a matched pair: the
// same inputs publish when the bytes are clean and refuse when they are
// poisoned, so the refusal is attributable to the guard and to nothing else.

/** The one configuration under test, parameterised only by the artifact bytes. */
function poisonProbeInputs(tarballBytes, channel, log) {
  return {
    gateConclusion: "success",
    tag: "engine-v1.2.3",
    packageVersion: "1.2.3",
    pluginCompatRange: "^1.0.0",
    pluginVersion: "1.4.0",
    channel,
    name: "pdlc-engine",
    tarballBytes,
    secretToken: "npm_fake-token-for-test",
    sentinel: SENTINEL,
    existingVersionMode: "fail",
    log,
  };
}

test(
  "T49: publish channel — an artifact CARRYING the sentinel refuses and publishes nothing (AC-3.5, PROP-PUB-4)",
  async () => {
    const { runPublish } = await loadPreflight();
    const channel = fakePublishChannel();
    const log = [];
    const poisoned = Buffer.from(`built-artifact-bytes ${SENTINEL} trailing-bytes`);

    const result = await runPublish(poisonProbeInputs(poisoned, channel, log));

    assert.equal(result.conclusion, "failure", "a poisoned artifact must not conclude success");
    assert.equal(result.published, false, "nothing may be published");
    assert.equal(
      channel.calls.publish.length,
      0,
      "the channel must never be reached — refusing after publishing is not refusing",
    );
    assert.match(
      result.message,
      /sentinel|AC-3\.5/i,
      `the failure must name what it refused for. Got: ${result.message}`,
    );
    assert.equal(
      log.join("\n").includes(SENTINEL),
      false,
      "the refusal must not itself echo the credential it refused over",
    );
  },
);

test(
  "T49: publish channel — the positive control: the SAME inputs with clean bytes do publish (AT-3.5)",
  async () => {
    const { runPublish } = await loadPreflight();
    const channel = fakePublishChannel();
    const log = [];
    const clean = Buffer.from("built-artifact-bytes trailing-bytes");

    const result = await runPublish(poisonProbeInputs(clean, channel, log));

    // Without this control the leg above would also pass against an
    // implementation that refuses everything.
    assert.equal(result.conclusion, "success");
    assert.equal(result.published, true);
    assert.equal(channel.calls.publish.length, 1, "exactly one publish, so the difference is the sentinel alone");
  },
);

for (const missingSecret of [undefined, ""]) {
  test(
    `T49: publish channel — secret ${JSON.stringify(missingSecret)} ⇒ named failure, nothing published (AT-3.5)`,
    async () => {
      const { runPublish } = await loadPreflight();
      const channel = fakePublishChannel();

      const result = await runPublish({
        gateConclusion: "success",
        tag: "engine-v1.2.3",
        packageVersion: "1.2.3",
        pluginCompatRange: "^1.0.0",
        pluginVersion: "1.4.0",
        channel,
        name: "pdlc-engine",
        tarballBytes: Buffer.from("built-artifact-bytes"),
        secretToken: missingSecret,
        sentinel: SENTINEL,
        existingVersionMode: "fail",
        log: [],
      });

      assert.equal(result.conclusion, "failure");
      assert.equal(result.published, false);
      assert.match(
        result.message,
        /NODE_AUTH_TOKEN|secret|token/i,
        "the failure must name the missing secret",
      );
      assert.equal(channel.calls.publish.length, 0);
    },
  );
}

test(
  "T49: publish.yml — NODE_AUTH_TOKEN is consumed only by the publish step (PROP-PUB-8)",
  () => {
    assert.ok(
      existsSync(PUBLISH_WORKFLOW),
      ".github/workflows/publish.yml must exist (TSPEC §8.1) — not yet created",
    );
    const text = readFileSync(PUBLISH_WORKFLOW, "utf8");
    const lines = text.split("\n");
    const jobHeaderRe = /^ {2}([A-Za-z0-9_-]+):\s*$/;
    const stepsWithToken = new Set();
    let currentJob = null;
    for (const line of lines) {
      const jobMatch = line.match(jobHeaderRe);
      if (jobMatch) currentJob = jobMatch[1];
      if (currentJob && line.includes("NODE_AUTH_TOKEN")) stepsWithToken.add(currentJob);
    }
    assert.deepEqual(
      stepsWithToken,
      new Set(["publish"]),
      "NODE_AUTH_TOKEN must be referenced only inside the `publish` job, asserted positively " +
        "as a set-equality (PROP-PUB-8) — never by scanning other jobs for its absence alone",
    );
  },
);

// ─── AT-3.6: tag disagreeing with T-1a fails naming both values ────────────────────────────

test(
  "T49: publish-preflight — checkTagVersion fails naming both the tag's and the manifest's version on disagreement (AT-3.6, PF-1)",
  async () => {
    const { checkTagVersion } = await loadPreflight();

    const agree = checkTagVersion("engine-v1.2.3", "1.2.3");
    assert.equal(agree.ok, true);

    const disagree = checkTagVersion("engine-v1.2.3", "1.2.4");
    assert.equal(disagree.ok, false);
    assert.match(disagree.message, /1\.2\.3/, "names the tag's version");
    assert.match(disagree.message, /1\.2\.4/, "names the manifest's version (T-1a)");
  },
);

// ─── AT-3.7: pluginCompat range excluding T-1b fails naming range and plugin version ───────

test(
  "T49: publish-preflight — checkPluginCompatRange fails naming the range and the plugin version on exclusion (AT-3.7, PF-2)",
  async () => {
    const { checkPluginCompatRange } = await loadPreflight();

    const included = checkPluginCompatRange("^1.0.0", "1.4.0");
    assert.equal(included.ok, true);

    const excluded = checkPluginCompatRange("^1.0.0", "2.0.0");
    assert.equal(excluded.ok, false);
    assert.match(excluded.message, /\^1\.0\.0/, "names the declared range");
    assert.match(excluded.message, /2\.0\.0/, "names the plugin version (T-1b)");
  },
);

// ─── tarballPathFromPackResult: scoped-tarball-filename drift (wave-16 CI failure) ──────────
//
// `npm publish` was handed `@kaneho/pdlc-engine-0.1.0.tgz`, a path that never existed on disk
// (npm always writes the scope-normalized form, `kaneho-pdlc-engine-0.1.0.tgz`) — npm silently
// reinterpreted the nonexistent path as a registry spec instead of a file, an E404 GET on the
// package name, not a file-not-found error. `tarballPathFromPackResult` must resolve either
// filename shape `npm pack --json` may report, verbatim or scope-normalized, whichever one is
// actually on disk, and refuse loudly, naming both tried paths, when neither is.

test(
  "T49-followup: tarballPathFromPackResult resolves a scope-normalized on-disk tarball when npm pack --json reports the scoped filename",
  async () => {
    const { tarballPathFromPackResult } = await loadPreflight();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-tarball-scoped-"));
    try {
      const onDiskName = "kaneho-pdlc-engine-0.1.0.tgz";
      fs.writeFileSync(path.join(dir, onDiskName), "fake tarball bytes");
      const packResultPath = path.join(dir, "pack-result.json");
      fs.writeFileSync(
        packResultPath,
        JSON.stringify([{ filename: "@kaneho/pdlc-engine-0.1.0.tgz" }]),
      );

      const resolved = tarballPathFromPackResult(packResultPath);
      assert.equal(resolved, path.join(dir, onDiskName));
      assert.equal(existsSync(resolved), true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },
);

test(
  "T49-followup: tarballPathFromPackResult resolves an on-disk tarball when npm pack --json reports the filename verbatim",
  async () => {
    const { tarballPathFromPackResult } = await loadPreflight();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-tarball-verbatim-"));
    try {
      const onDiskName = "kaneho-pdlc-engine-0.1.0.tgz";
      fs.writeFileSync(path.join(dir, onDiskName), "fake tarball bytes");
      const packResultPath = path.join(dir, "pack-result.json");
      fs.writeFileSync(packResultPath, JSON.stringify([{ filename: onDiskName }]));

      const resolved = tarballPathFromPackResult(packResultPath);
      assert.equal(resolved, path.join(dir, onDiskName));
      assert.equal(existsSync(resolved), true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },
);

test(
  "T49-followup: tarballPathFromPackResult resolves an on-disk tarball when npm pack --json reports the npm 12 name-keyed object shape",
  async () => {
    const { tarballPathFromPackResult } = await loadPreflight();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-tarball-npm12-"));
    try {
      const onDiskName = "kaneho-pdlc-engine-0.1.0.tgz";
      fs.writeFileSync(path.join(dir, onDiskName), "fake tarball bytes");
      const packResultPath = path.join(dir, "pack-result.json");
      // npm 12 prints `npm pack --json` as an object keyed by package name, not an array.
      fs.writeFileSync(
        packResultPath,
        JSON.stringify({ "@kaneho/pdlc-engine": { filename: onDiskName } }),
      );

      const resolved = tarballPathFromPackResult(packResultPath);
      assert.equal(resolved, path.join(dir, onDiskName));
      assert.equal(existsSync(resolved), true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },
);

test(
  "T49-followup: tarballPathFromPackResult fails loudly naming both tried paths when neither exists on disk",
  async () => {
    const { tarballPathFromPackResult } = await loadPreflight();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-tarball-missing-"));
    try {
      // No tarball written to `dir` at all — both candidate paths are absent.
      const packResultPath = path.join(dir, "pack-result.json");
      fs.writeFileSync(
        packResultPath,
        JSON.stringify([{ filename: "@kaneho/pdlc-engine-0.1.0.tgz" }]),
      );

      assert.throws(
        () => tarballPathFromPackResult(packResultPath),
        (err) => {
          assert.match(err.message, /@kaneho\/pdlc-engine-0\.1\.0\.tgz/, "names the verbatim path tried");
          assert.match(err.message, /kaneho-pdlc-engine-0\.1\.0\.tgz/, "names the scope-normalized path tried");
          return true;
        },
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },
);

// ─── T49-followup-2: runPublish must call channel.publish with the resolved on-disk tarball
// path, not a name+version-synthesized filename (three real CI publish runs failed because
// `runPublish` never received `tarballPath` and constructed `${name}-${version}.tgz` instead —
// which does not match npm's scope-normalized on-disk filename, so `npm publish` silently
// reinterpreted the nonexistent path as a registry spec, an E404 on the package name rather
// than a file-not-found error). This mirrors T49-followup's scoped-report/normalized-disk
// fixture, but asserts the *publish call's* first argument, not just `tarballPathFromPackResult`
// in isolation — the earlier tests passed while this bug shipped three times.

test(
  "T49-followup-2: runPublish forwards the resolved on-disk tarball path (not a synthesized name) to channel.publish",
  async () => {
    const { runPublish, tarballPathFromPackResult } = await loadPreflight();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-tarball-runpublish-"));
    try {
      const onDiskName = "kaneho-pdlc-engine-1.2.3.tgz";
      const onDiskPath = path.join(dir, onDiskName);
      fs.writeFileSync(onDiskPath, "fake tarball bytes");
      const packResultPath = path.join(dir, "pack-result.json");
      // npm pack --json reports the scoped filename, which never exists on disk verbatim —
      // exactly the shape that broke production.
      fs.writeFileSync(
        packResultPath,
        JSON.stringify([{ filename: "@kaneho/pdlc-engine-1.2.3.tgz" }]),
      );

      const tarballPath = tarballPathFromPackResult(packResultPath);
      assert.equal(tarballPath, onDiskPath, "sanity: resolves to the scope-normalized on-disk file");

      const channel = fakePublishChannel();
      const log = [];
      const result = await runPublish({
        gateConclusion: "success",
        tag: "engine-v1.2.3",
        packageVersion: "1.2.3",
        pluginCompatRange: "^1.0.0",
        pluginVersion: "1.4.0",
        channel,
        name: "pdlc-engine",
        tarballPath,
        tarballBytes: readFileSync(tarballPath),
        secretToken: "npm_fake-token-for-test",
        sentinel: SENTINEL,
        existingVersionMode: "fail",
        log,
      });

      assert.equal(result.conclusion, "success");
      assert.equal(channel.calls.publish.length, 1, "exactly one publish call");
      assert.equal(
        channel.calls.publish[0].tarball,
        onDiskPath,
        "channel.publish must receive the real resolved on-disk tarball path, not a " +
          "name+version-synthesized filename",
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },
);

// ─── fixture sanity: the S-5 stub itself, independent of the not-yet-created module above ──

test("publish channel — fakePublishChannel records publish calls and reports existence (fixture sanity, T03 S-5)", async () => {
  const channel = fakePublishChannel();
  assert.equal(await channel.exists("pdlc-engine", "1.2.3"), false);
  await channel.publish("/tmp/pdlc-engine-1.2.3.tgz", { name: "pdlc-engine", version: "1.2.3" });
  assert.equal(await channel.exists("pdlc-engine", "1.2.3"), true);
  assert.equal(channel.calls.publish.length, 1);
});

// ─── PF-3 / PF-4 / PF-5: the three gate checks that had no legs at all ─────────────────────
//
// CR round-1 TE F-03 (PROP-REGR-6). `publish-preflight.mjs` sat at 81.58 % branch against the
// 85 % floor, and the shortfall was not a rounding matter: `checkManifestPublishable` (PF-3),
// `checkPackedSet` (PF-4) and `checkVendorManifest` (PF-5) — three of the five preflight
// members `publish.yml` gates a release on — had no direct test of any kind. Only `runPublish`'s
// happy path had ever driven them, and only in its green configuration, so every refusal arm
// in all three was unexercised: a PF check stuck on `{ok: true}` would have shipped.

test("PF-3: checkManifestPublishable accepts a publishable manifest and refuses each blocker (AT-3.x)", async () => {
  const { checkManifestPublishable } = await loadPreflight();
  // Read from the recorded decision, never a literal invented here (N-6): the production
  // caller reads this same file, so a scope change moves both together or fails loudly.
  const decisionsText = readFileSync(
    path.join(REPO_ROOT, "docs", "_decisions", "DECISIONS-plugin-distribution.md"),
    "utf8",
  );
  const scope = /^## DEC-DIST-06: The npm scope is `(@[a-z0-9-]+)`/m.exec(decisionsText)?.[1];
  assert.ok(scope, "DECISIONS must record an npm scope for this oracle to mean anything");
  const green = { name: `${scope}/pdlc-engine`, license: "MIT" };

  assert.deepEqual(checkManifestPublishable(green, decisionsText), { ok: true, message: null });

  // Each blocker in turn, asserted on the message naming its own cause — not merely on
  // `ok === false`, which a check stuck on "always refuse" would also satisfy.
  const privateResult = checkManifestPublishable({ ...green, private: true }, decisionsText);
  assert.equal(privateResult.ok, false);
  assert.match(privateResult.message, /private/);

  for (const license of [undefined, "UNLICENSED"]) {
    const r = checkManifestPublishable({ ...green, license }, decisionsText);
    assert.equal(r.ok, false, `license ${String(license)} must be refused`);
    assert.match(r.message, /SPDX/);
  }

  const noScope = checkManifestPublishable(green, "# a decisions file recording no scope\n");
  assert.equal(noScope.ok, false);
  assert.match(noScope.message, /scope/);

  const wrongName = checkManifestPublishable({ ...green, name: "@someone-else/pdlc-engine" }, decisionsText);
  assert.equal(wrongName.ok, false);
  assert.match(wrongName.message, new RegExp(`${scope}/pdlc-engine`));
  assert.match(wrongName.message, /someone-else/, "the message must name the offending value too");
});

// TSPEC §5.4's `PK-*` table, transcribed (TE CR v2 F-03). Round 2 recovered
// PF-4's expectation by parsing `checkPackedSet`'s own refusal message, which
// inverted the anti-echo rule: the expectation moved with the implementation,
// and deleting `"scripts/postinstall.mjs"` from `expectedPackedSet` left the
// suite green because the test's expectation lost the member too. The list is
// read from the SPEC instead, so a member silently leaving the release gate is
// red here.
//
// CR round-3 TE F-05: that transcription used to be hand-copied here AND in
// `packaging.test.js`, with nothing tying the copies together — a `PK-` row
// applied to one and not the other would leave the other green. Both now
// import the single transcription in `_tspec-packed-set.mjs`, where the
// co-change obligation (TSPEC §5.4 and FSPEC §5.2 move first) is recorded.

test("PF-4: checkPackedSet's expectation IS TSPEC §5.4's PK-* set, member for member (TE CR v2 F-03)", async () => {
  const { checkPackedSet } = await loadPreflight();

  // The independent check: the production expectation is compared against the
  // transcribed spec list, in both directions and in both N-2 states. A member
  // deleted from `expectedPackedSet` is red here even though every other guard
  // in this file — and the recovered-from-message trick below — still holds.
  for (const licence of [true, false]) {
    const decisionsText = `**N-2 recorded:** ${licence ? "yes" : "no"}\n`;
    const spec = tspecPackedSet({ licence });
    const refusal = checkPackedSet([], decisionsText);
    assert.equal(refusal.ok, false);
    const production = JSON.parse(/Missing: (\[.*\])\./.exec(refusal.message)[1]);
    assert.deepEqual(
      [...production].sort(),
      [...spec].sort(),
      `the release gate's member list disagrees with TSPEC §5.4 (N-2 recorded: ${licence})`,
    );
    // And the production check accepts exactly that set: a gate that refused
    // its own expectation would satisfy the equality above and ship nothing.
    assert.deepEqual(checkPackedSet(spec, decisionsText), { ok: true, message: null });
  }
});

test("PF-4: checkPackedSet is both-directions set-equality, and LICENSE is conditional on N-2", async () => {
  const { checkPackedSet } = await loadPreflight();
  const recorded = "**N-2 recorded:** yes\n";

  // The set-difference legs below recover the expectation from the check's own
  // refusal, which is sound HERE — they assert relationships between two
  // recovered sets, not membership. The absolute expectation is pinned against
  // TSPEC §5.4 by the leg above (TE CR v2 F-03).
  const emptyResult = checkPackedSet([], recorded);
  assert.equal(emptyResult.ok, false);
  const expected = JSON.parse(/Missing: (\[.*\])\./.exec(emptyResult.message)[1]);
  assert.ok(expected.length > 5, `expected packed set looks degenerate: ${JSON.stringify(expected)}`);
  assert.ok(expected.includes("package.json") && expected.includes("bin/pdlc.mjs"));

  assert.deepEqual(checkPackedSet(expected, recorded), { ok: true, message: null });

  // Direction 1: a missing member is named as missing.
  const dropped = expected[expected.length - 1];
  const missingResult = checkPackedSet(expected.filter((m) => m !== dropped), recorded);
  assert.equal(missingResult.ok, false);
  assert.match(missingResult.message, new RegExp(`Missing: .*${dropped.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));

  // Direction 2: an extra member is named as unexpected. A one-directional check (superset
  // test) would pass this and let a stray secret file ship.
  const extraResult = checkPackedSet([...expected, ".npmrc"], recorded);
  assert.equal(extraResult.ok, false);
  assert.match(extraResult.message, /Unexpected: .*\.npmrc/);

  // LICENSE is gated on the `**N-2 recorded:**` line, never on the file's presence in the
  // tree (DECISIONS-plugin-distribution.md). The difference between the two expected sets
  // must be exactly {LICENSE}, asserted as a set difference rather than a literal list.
  const unrecorded = checkPackedSet([], "**N-2 recorded:** no\n");
  const expectedWithout = JSON.parse(/Missing: (\[.*\])\./.exec(unrecorded.message)[1]);
  assert.deepEqual(
    expected.filter((m) => !expectedWithout.includes(m)),
    ["LICENSE"],
  );
  assert.deepEqual(expectedWithout.filter((m) => !expected.includes(m)), []);
});

test("PF-5: checkVendorManifest verifies vendored bytes against the canonical sources (AF-2)", async () => {
  const { checkVendorManifest } = await loadPreflight();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-pf5-"));
  const vendorDir = path.join(root, "vendor");
  const sourceDir = path.join(root, "source");
  const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
  const write = (dir, name, body) => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), body);
  };
  const manifest = (modules) =>
    fs.writeFileSync(path.join(vendorDir, "VENDOR-MANIFEST.json"), JSON.stringify({ modules }));

  try {
    // Green: hashes agree with both the vendored copy and the canonical source.
    const body = "export const x = 1;\n";
    write(vendorDir, "orchestrate-dev.js", body);
    write(sourceDir, "orchestrate-dev.js", body);
    manifest([{ name: "orchestrate-dev.js", sha256: hash(body) }]);
    assert.deepEqual(checkVendorManifest(vendorDir, sourceDir), { ok: true, message: null });

    // No manifest at all — the "did prepack run?" arm.
    fs.rmSync(path.join(vendorDir, "VENDOR-MANIFEST.json"));
    const absent = checkVendorManifest(vendorDir, sourceDir);
    assert.equal(absent.ok, false);
    assert.match(absent.message, /prepack/);

    // A manifest entry with no canonical source behind it.
    manifest([{ name: "orchestrate-dev.js", sha256: hash(body) }, { name: "ghost.js", sha256: hash("") }]);
    const ghost = checkVendorManifest(vendorDir, sourceDir);
    assert.equal(ghost.ok, false);
    assert.match(ghost.message, /ghost\.js/);

    // Vendored copy drifted from the canonical source: the manifest still agrees with one
    // side, so a check comparing only manifest-to-vendored would pass this.
    write(sourceDir, "orchestrate-dev.js", "export const x = 2;\n");
    manifest([{ name: "orchestrate-dev.js", sha256: hash(body) }]);
    const drifted = checkVendorManifest(vendorDir, sourceDir);
    assert.equal(drifted.ok, false);
    assert.match(drifted.message, /disagrees/);

    // Empty/absent `modules` is vacuously green by design (nothing claimed, nothing to
    // verify) — recorded here so the vacuity is a decision on the record, not an accident.
    manifest(undefined);
    assert.deepEqual(checkVendorManifest(vendorDir, sourceDir), { ok: true, message: null });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ─── Credential redaction on the failure path (TE CR round-1 Q-02) ─────────
//
// AC-3.5's guard refuses to PUBLISH a tarball carrying the credential. These
// legs cover the other direction: the path that PRINTS npm's own output when
// a publish fails, where in production the sentinel is the live token.

test("T58: redactSecret removes every occurrence of npm's echoed token, leaving the rest verbatim (Q-02)", async () => {
  const { redactSecret } = await import("../scripts/publish-preflight.mjs");
  const token = "npm_LIVEtoken000000000000000000000000";
  const redacted = redactSecret(
    `npm publish failed: 401 Unauthorized - PUT https://registry.npmjs.org/x (auth ${token}) [${token}]`,
    token,
  );
  assert.ok(!redacted.includes(token), "the credential survived redaction");
  // Every occurrence, not just the first — a leak on the second copy is
  // exactly as fatal as one on the first.
  assert.equal(redacted.match(/\*\*\*REDACTED\*\*\*/g).length, 2);
  assert.match(redacted, /401 Unauthorized - PUT https:\/\/registry\.npmjs\.org\/x/);
});

test("T58: redactSecret is a no-op for an absent or empty secret, never a match on the empty string", async () => {
  const { redactSecret } = await import("../scripts/publish-preflight.mjs");
  const text = "npm publish failed: ENOTFOUND registry.npmjs.org";
  assert.equal(redactSecret(text, undefined), text);
  assert.equal(redactSecret(text, ""), text);
  assert.equal(redactSecret(text, null), text);
  assert.equal(redactSecret(undefined, "tok"), "");
});

test("T58: reportFailure redacts the live token at the PRODUCTION call site, not only in the helper (TE CR v2 F-02)", async () => {
  // The unit legs above prove `redactSecret` as a function. This one proves
  // it as a CONTROL: measured in round 2, removing the call inside
  // `reportFailure` left the whole suite green, and that call site is the one
  // that prints npm's own stderr — where, in production, the sentinel is the
  // live `NODE_AUTH_TOKEN`.
  const { reportFailure } = await import("../scripts/publish-preflight.mjs");
  const token = "npm_LIVEtoken111111111111111111111111";
  const captured = [];
  const originalError = console.error;
  const exitCodeBefore = process.exitCode;
  console.error = (...args) => captured.push(args.map(String).join(" "));
  try {
    reportFailure(`npm publish failed: 401 Unauthorized (auth ${token}) retrying with ${token}`, {
      NODE_AUTH_TOKEN: token,
    });
  } finally {
    console.error = originalError;
    process.exitCode = exitCodeBefore;
  }

  assert.equal(captured.length, 1, `exactly one line must be printed. Got: ${JSON.stringify(captured)}`);
  const line = captured[0];
  assert.ok(!line.includes(token), `the credential reached the Actions log verbatim: ${line}`);
  assert.equal(line.match(/\*\*\*REDACTED\*\*\*/g).length, 2, "every occurrence, not just the first");
  // The rest of npm's diagnosis must survive: a redaction that ate the whole
  // message would pass the assertion above and destroy the failure report.
  assert.match(line, /^::error::npm publish failed: 401 Unauthorized/);
  assert.match(line, /retrying with/);
});

test("T58: reportFailure is a no-op redaction when no token is set, and still reports the failure", async () => {
  const { reportFailure } = await import("../scripts/publish-preflight.mjs");
  const captured = [];
  const originalError = console.error;
  const exitCodeBefore = process.exitCode;
  console.error = (...args) => captured.push(args.map(String).join(" "));
  try {
    reportFailure("PF-1 failed: tag v1.2.3 does not match package.json version 1.2.4", {});
  } finally {
    console.error = originalError;
    process.exitCode = exitCodeBefore;
  }
  assert.deepEqual(captured, [
    "::error::PF-1 failed: tag v1.2.3 does not match package.json version 1.2.4",
  ]);
});
