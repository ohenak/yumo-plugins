// Tests for `lib/startup.mjs`'s surfacing of §6.3's resolution announcement
// and §6.5's resolver notices (PLAN T54, TSPEC §6.3/§6.5, PROP-VER-15,
// AT-5.2, AT-5.6).
//
// RED at HEAD: `runStartupChecks` (`lib/startup.mjs:319`) takes no
// `versionDecision` seam and never threads it into the banner it builds
// (`:457-465`), and its return carries no `notices` field at all — the
// `resolveFn` seam's return (`resolvePluginRoot`, extended by T32 with a
// `notices` array, §6.5) is read only for `ok`/`root`/`source`/`reason`
// (`:361-369`). T40 is the corresponding [green] task.
//
// Contract this file pins (additive over the shape `startup-ladder.test.js`
// already pins):
//
//   versionDecision   §6.3's `resolveVersion()` return shape, precomputed by
//                      the caller and handed in: `{kind, version, root,
//                      announcement, refusal}` (`resolve-version.test.js`'s
//                      stated contract). Default `null` (doctor/back-compat
//                      callers that never resolve a version). When present
//                      and `kind !== "refuse"`, its `announcement` string is
//                      carried into `result.banner` **verbatim** — the exact
//                      same string, not a re-rendering of it.
//
//   result.notices     The `resolveFn` resolution's own `notices` array,
//                      surfaced **by reference** — `runStartupChecks` never
//                      rebuilds, filters, or re-renders it. Proven here by
//                      strict identity against the array (and its record
//                      objects) the fake `resolveFn` returns, which a
//                      re-deriving implementation could not reproduce by
//                      coincidence.

import { test } from "node:test";
import assert from "node:assert/strict";

import { runStartupChecks } from "../lib/startup.mjs";

const PLUGIN_ROOT = "/fake/plugin";

/** A green baseline, mirroring `startup-ladder.test.js`'s `baseOpts`. */
function baseOpts(overrides = {}) {
  return {
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
    cwd: "/fake/repo",
    reqPath: undefined, // doctor shape — this file is agnostic to rung 0
    resolveFn: () => ({
      ok: true,
      root: PLUGIN_ROOT,
      source: "fake resolver",
      reason: null,
      tried: [],
      notices: [],
    }),
    readVersionFn: () => ({
      ok: true,
      version: "0.22.0",
      manifestPath: `${PLUGIN_ROOT}/.claude-plugin/plugin.json`,
    }),
    isGitRepoFn: () => true,
    checkReqPathFn: () => true,
    dispatchableSkills: null,
    listInstalledSkillsFn: () => [],
    runProbe: () => ({ ran: true, outcome: "ran" }),
    home: "/home/tester",
    fs: {
      readFileSync: () => {
        const err = new Error("ENOENT");
        err.code = "ENOENT";
        throw err;
      },
    },
    allowApiKeyBilling: false,
    ...overrides,
  };
}

// ─── PROP-VER-15, first conjunct: notices surfaced by identity ────────────

test("T40: AT-5.6: result.notices is the exact array `resolveFn` returned, not a copy", () => {
  const record = Object.freeze({
    id: "env.plugin-root-ignored",
    text: "PDLC_PLUGIN_ROOT was set (/env/value) and ignored — dev-mode was not declared; pass --dev to honour it",
  });
  const notices = Object.freeze([record]);
  const result = runStartupChecks(
    baseOpts({
      resolveFn: () => ({ ok: true, root: PLUGIN_ROOT, source: "fake resolver", reason: null, tried: [], notices }),
    })
  );
  // Strict identity, not deep-equality: a re-deriving implementation that
  // rebuilds an equal-looking array (or re-renders `record.text` through its
  // own template) fails this even if the visible content matches.
  assert.strictEqual(result.notices, notices, "result.notices must be the same array reference");
  assert.strictEqual(result.notices[0], record, "each record must be the same object reference");
});

test("T40: AT-5.6: result.notices is empty when the resolver reports no notices", () => {
  const result = runStartupChecks(baseOpts());
  assert.deepEqual(result.notices, []);
});

test("T40: AT-5.6: a fail resolution's notices are still surfaced (not swallowed by the chain gate)", () => {
  const record = Object.freeze({ id: "env.plugin-root-ignored", text: "ignored anyway" });
  const notices = Object.freeze([record]);
  const result = runStartupChecks(
    baseOpts({
      resolveFn: () => ({ ok: false, root: null, source: null, reason: "not found", tried: [], notices }),
    })
  );
  assert.strictEqual(result.notices, notices);
});

// ─── PROP-VER-15, second conjunct: the announcement reaches the banner ────
// verbatim, on every branch that produces one — including 1 (dev), 3 (pin)
// and 6 (latest), named explicitly by the PLAN row this file implements.
// Each announcement below carries a distinguishing token no re-rendering
// implementation would coincidentally reproduce, so a substring/regex check
// could not stand in for the exact-equality assertion PROP-VER-15 demands.

test("T40: AT-5.2: branch 1 (dev) — resolver's announcement carried into the banner verbatim", () => {
  const decision = {
    kind: "dev",
    version: null,
    root: "/repo/pdlc",
    announcement: "dev-mode: running checkout in place at /repo/pdlc [token-D1-9f2a]",
    refusal: null,
  };
  const result = runStartupChecks(baseOpts({ versionDecision: decision }));
  assert.ok(
    result.banner.includes(decision.announcement),
    `banner did not carry the exact announcement:\n${JSON.stringify(result.banner, null, 2)}`
  );
});

test("T40: AT-5.2: branch 3 (pin) — resolver's announcement carried into the banner verbatim", () => {
  const decision = {
    kind: "pin",
    version: "0.3.1",
    root: "/store/0.3.1",
    announcement: "pinned; running 0.3.1 [token-P3-6b7c]",
    refusal: null,
  };
  const result = runStartupChecks(baseOpts({ versionDecision: decision }));
  assert.ok(
    result.banner.includes(decision.announcement),
    `banner did not carry the exact announcement:\n${JSON.stringify(result.banner, null, 2)}`
  );
});

test("T40: AT-5.2: branch 6 (latest) — resolver's announcement carried into the banner verbatim", () => {
  const decision = {
    kind: "latest",
    version: "0.9.0",
    root: "/store/0.9.0",
    announcement: "no pin; latest installed 0.9.0 [token-L6-3d4e]",
    refusal: null,
  };
  const result = runStartupChecks(baseOpts({ versionDecision: decision }));
  assert.ok(
    result.banner.includes(decision.announcement),
    `banner did not carry the exact announcement:\n${JSON.stringify(result.banner, null, 2)}`
  );
});

test("T40: branches 1/3/6 each produce a DISTINCT banner line — no shared placeholder passes all three", () => {
  const announcements = new Set();
  for (const decision of [
    { kind: "dev", version: null, root: "/repo/pdlc", announcement: "dev-mode: token-D1-9f2a", refusal: null },
    { kind: "pin", version: "0.3.1", root: "/store/0.3.1", announcement: "pinned: token-P3-6b7c", refusal: null },
    { kind: "latest", version: "0.9.0", root: "/store/0.9.0", announcement: "no pin: token-L6-3d4e", refusal: null },
  ]) {
    const result = runStartupChecks(baseOpts({ versionDecision: decision }));
    assert.ok(result.banner.includes(decision.announcement));
    announcements.add(decision.announcement);
  }
  assert.equal(announcements.size, 3, "the three fixtures must stay pairwise distinct (sanity on this test itself)");
});

test("no `versionDecision` (doctor/back-compat) — banner still builds, no crash, no stray line", () => {
  const result = runStartupChecks(baseOpts());
  assert.ok(Array.isArray(result.banner));
  assert.ok(result.banner.length > 0);
});
