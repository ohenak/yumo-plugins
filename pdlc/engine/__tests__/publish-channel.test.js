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
//       gateConclusion        "success" | "failure" — the five §5.1 gate jobs' combined result
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
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { fakePublishChannel } from "./_doubles.mjs";

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

test.skip(
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

test.skip(
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

test.skip(
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

test.skip(
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

test.skip(
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

for (const missingSecret of [undefined, ""]) {
  test.skip(
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

test.skip(
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

test.skip(
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

test.skip(
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

// ─── fixture sanity: the S-5 stub itself, independent of the not-yet-created module above ──

test("publish channel — fakePublishChannel records publish calls and reports existence (fixture sanity, T03 S-5)", async () => {
  const channel = fakePublishChannel();
  assert.equal(await channel.exists("pdlc-engine", "1.2.3"), false);
  await channel.publish("/tmp/pdlc-engine-1.2.3.tgz", { name: "pdlc-engine", version: "1.2.3" });
  assert.equal(await channel.exists("pdlc-engine", "1.2.3"), true);
  assert.equal(channel.calls.publish.length, 1);
});
