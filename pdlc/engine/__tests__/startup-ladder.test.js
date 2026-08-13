// Tests for lib/startup.mjs's SEVEN-rung ladder (FSPEC §4.1, TSPEC §4.3, T44).
// AT-ENG-06 … AT-ENG-12. Rung 4a's OWN probe branches (AT-ENG-11a, EC-START-10/11)
// are `startup-guard-executable.test.js`'s job (T27) — this file only asserts
// that rung "4a" exists, is ordered correctly, and participates in totality.
//
// RED at HEAD (T26, PLAN task table): `lib/startup.mjs` still returns HEAD's
// unstructured `{ok, checks, banner, pluginRoot, pluginVersion, reason}` shape
// (17-entry frozen `EXPECTED_SKILLS`, no rung 0/4a/5 split, no `doctor`
// projection fields). T44 is the corresponding 🟢 task that makes this pass.
//
// Hypothesised (this task pins it) `runStartupChecks` contract this file
// tests against — additive over HEAD's existing options:
//
//   cwd, reqPath            rung 0 (FSPEC §4.1 row 0). `reqPath` OMITTED
//                            entirely (undefined) is `doctor`'s "not
//                            applicable" half (BR-START-0); a non-empty
//                            string is `dev`'s "REQ path exists under cwd"
//                            half.
//   isGitRepoFn(cwd)         rung 0's cwd half seam.
//   checkReqPathFn(cwd, p)   rung 0's REQ-path half seam.
//   dispatchableSkills       rung 4's derived set (§4.4) — defaults to the
//                            real union of both workflow modules'
//                            `DISPATCHABLE_SKILLS` (T16) plus the two
//                            `se-implement` supplement identifiers.
//   listInstalledSkillsFn    rung 4 Direction B — every identifier the
//                            plugin holds a readable prompt file for
//                            (dispatchable-scope files AND the plugin's
//                            operator-invoked-only skill directories).
//   dryRun                   rung 5 non-fatality (EC-START-4).
//   home, fs, allowApiKeyBilling
//                            rung 5 — forwarded to `lib/auth.mjs`'s
//                            `readLoginEvidence` / `resolveAuthPosture`
//                            (T15), already landed.
//
// Return shape gains (TSPEC §4.3): `rungs: RungRecord[]` (always all seven,
// `RUNG_ORDER` order, `{rung, name, state, detail}`), `versions: {engine,
// plugin}`, `baseUrl`, `auth: {row, catalogueId}` — AC-2.1's three facts,
// first-class rather than buried in `detail` prose.

import { test } from "node:test";
import assert from "node:assert/strict";

import { runStartupChecks, RUNG_ORDER } from "../lib/startup.mjs";
import { DISPATCHABLE_SKILLS as DEV_SKILLS } from "../../workflows/orchestrate-dev.js";
import { DISPATCHABLE_SKILLS as QUEUE_SKILLS } from "../../workflows/orchestrate-queue.js";

// ─── the derived set (REQ:493-507): 10 identifiers, 12 prompt files ────────

const DERIVED_SET = Object.freeze(
  [...new Set([...DEV_SKILLS, ...QUEUE_SKILLS, "se-implement:SKILL-typescript.md", "se-implement:SKILL-python.md"])].sort()
);

// The plugin's five real skill directories no module ever dispatches
// (REQ:499-507, DEC-ENG-05). Used HERE only to build realistic Direction-B
// fixtures — this file makes no claim about how the production rung derives
// or reports them, only that they pass rather than refuse (EC-START-7).
const OPERATOR_ONLY = Object.freeze([
  "consolidate-learnings",
  "orchestrate-dev",
  "orchestrate-queue",
  "tech-lead",
  "tech-lead-python",
]);

assert.equal(DERIVED_SET.length, 12, "sanity: 10 dispatchable identifiers + 2 se-implement supplements");

const PLUGIN_ROOT = "/fake/plugin";
const REQ_PATH = "docs/example-feature/REQ-example-feature.md";

/** A green baseline: every rung passes. Each test overrides one seam. */
function baseOpts(overrides = {}) {
  return {
    pluginRoot: PLUGIN_ROOT,
    env: {},
    engineVersion: "0.1.0",
    engineCompat: "^0.22.0",
    cwd: "/fake/repo",
    reqPath: REQ_PATH,
    resolveFn: () => ({ ok: true, root: PLUGIN_ROOT, source: "fake resolver", reason: null, tried: [] }),
    readVersionFn: () => ({
      ok: true,
      version: "0.22.0",
      manifestPath: `${PLUGIN_ROOT}/.claude-plugin/plugin.json`,
    }),
    loadSkillFn: (_root, skill) => ({ name: skill, path: `/fake/${skill}`, text: "role text, non-empty" }),
    isGitRepoFn: () => true,
    checkReqPathFn: () => true,
    dispatchableSkills: DERIVED_SET,
    listInstalledSkillsFn: () => [...DERIVED_SET, ...OPERATOR_ONLY],
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

function rung(result, id) {
  const row = result.rungs.find((r) => r.rung === id);
  assert.ok(row, `no rung "${id}" in ${JSON.stringify(result.rungs.map((r) => r.rung))}`);
  return row;
}

// ─── AT-ENG-06 — total, ordered, post-failure skip-with-reason ─────────────

test("AT-ENG-06: the ladder is exactly RUNG_ORDER's seven labels, in order, on a green fixture", () => {
  const result = runStartupChecks(baseOpts());
  assert.deepEqual(
    result.rungs.map((r) => r.rung),
    [...RUNG_ORDER]
  );
  assert.equal(result.rungs.length, 7);
  assert.equal(result.ok, true, result.reason || "");
});

test("AT-ENG-06: a rung-1 failure leaves rungs 2/3/4/4a skipped-with-reason, never passing", () => {
  const result = runStartupChecks(
    baseOpts({
      resolveFn: () => ({ ok: false, root: null, source: null, reason: "no plugin found anywhere", tried: [] }),
    })
  );
  assert.equal(result.ok, false);
  assert.equal(rung(result, "0").state, "pass");
  assert.equal(rung(result, "1").state, "fail");
  for (const id of ["2", "3", "4", "4a"]) {
    const row = rung(result, id);
    assert.equal(row.state, "skipped", `rung ${id} should be skipped, not "${row.state}"`);
    assert.ok(row.detail, `rung ${id}'s skip must carry a reason`);
  }
});

test("AT-ENG-06: a rung-0 refusal under `dev` (EC-CLI-3, missing REQ path) leaves rungs 1-5 skipped-with-reason", () => {
  const result = runStartupChecks(baseOpts({ checkReqPathFn: () => false }));
  assert.equal(result.ok, false);
  assert.equal(rung(result, "0").state, "fail");
  for (const id of ["1", "2", "3", "4", "4a", "5"]) {
    const row = rung(result, id);
    assert.equal(row.state, "skipped", `rung ${id} should be skipped under a rung-0 refusal`);
    assert.ok(row.detail, `rung ${id}'s skip must carry a reason`);
  }
});

test("AT-ENG-06: a rung-0 refusal under `doctor` (EC-DISP-5, cwd not a git repo) leaves rungs 1-5 skipped-with-reason too", () => {
  const { reqPath: _drop, ...doctorOpts } = baseOpts({ isGitRepoFn: () => false });
  const result = runStartupChecks(doctorOpts);
  assert.equal(result.ok, false);
  assert.equal(rung(result, "0").state, "fail");
  for (const id of ["1", "2", "3", "4", "4a", "5"]) {
    assert.equal(rung(result, id).state, "skipped");
  }
});

test("EC-START-8: two independent failures (rung 1 AND rung 5) are BOTH reported, not just the first", () => {
  // FSPEC §4.1's own worked example: "an absent plugin *and* an API key with
  // no subscription credential". Rung 5 does not need the resolved plugin, so
  // it is evaluated (and fails) even though rung 1 already failed and rungs
  // 2/3/4/4a are skipped as a result.
  const result = runStartupChecks(
    baseOpts({
      resolveFn: () => ({ ok: false, root: null, source: null, reason: "no plugin found anywhere", tried: [] }),
      env: { ANTHROPIC_API_KEY: "sk-live" },
      allowApiKeyBilling: false,
    })
  );
  assert.equal(result.ok, false);
  assert.equal(rung(result, "1").state, "fail");
  assert.equal(rung(result, "5").state, "fail", "rung 5 must still be evaluated independently of rung 1");
  for (const id of ["2", "3", "4", "4a"]) {
    assert.equal(rung(result, id).state, "skipped");
  }
  // "one message lists both" (BR-START-2)
  assert.match(result.reason, /plugin/i);
  assert.match(result.reason, /api.?key|auth/i);
});

// ─── AT-ENG-07 — every failing rung refuses, whichever rung it is ──────────

test("AT-ENG-07: a failure at any single rung makes the whole result refuse (ok: false)", () => {
  const fixtures = [
    baseOpts({ checkReqPathFn: () => false }), // rung 0
    baseOpts({ resolveFn: () => ({ ok: false, root: null, source: null, reason: "not found", tried: [] }) }), // rung 1
    baseOpts({ readVersionFn: () => ({ ok: false, reason: "bad manifest", manifestPath: "x" }) }), // rung 2
    baseOpts({ engineCompat: "^99.0.0" }), // rung 3
    baseOpts({
      loadSkillFn: (_root, skill) => {
        if (skill === "pm-review") throw new Error("boom");
        return { name: skill, path: "x", text: "y" };
      },
    }), // rung 4
    baseOpts({ env: { ANTHROPIC_API_KEY: "sk-live" }, allowApiKeyBilling: false }), // rung 5
  ];
  for (const opts of fixtures) {
    const result = runStartupChecks(opts);
    assert.equal(result.ok, false, JSON.stringify(result.rungs));
    assert.equal(result.rungs.length, 7);
    assert.ok(result.reason, "a refusing result must always carry a reason");
  }
});

// ─── AT-ENG-08 — the handshake refusal names range, found version, remedy ──

test("AT-ENG-08: an out-of-range plugin version fails rung 3 and the detail names the range, the version found, and a remedy", () => {
  const result = runStartupChecks(baseOpts({ engineCompat: "^99.0.0" }));
  assert.equal(result.ok, false);
  const row3 = rung(result, "3");
  assert.equal(row3.state, "fail");
  assert.match(row3.detail, /99\.0\.0/);
  assert.match(row3.detail, /0\.22\.0/);
  assert.match(row3.detail, /remedy/i);
  assert.match(result.reason, /99\.0\.0/);
});

test("AT-ENG-08: no installed plugin fails rung 1 and names both overrides (AC-3.2, EC-START-1)", () => {
  const result = runStartupChecks(
    baseOpts({
      resolveFn: () => ({
        ok: false,
        root: null,
        source: null,
        reason:
          "no plugin under ~/.claude/plugins (registry, cache, marketplace checkouts); " +
          "no --plugin-root override and no PDLC_PLUGIN_ROOT override matched either",
        tried: [],
      }),
    })
  );
  assert.equal(result.ok, false);
  const row1 = rung(result, "1");
  assert.equal(row1.state, "fail");
  assert.match(row1.detail, /--plugin-root/);
  assert.match(row1.detail, /PDLC_PLUGIN_ROOT/);
});

// ─── AT-ENG-09 — doctor === run's own gate, plus AC-2.1's three facts ──────

test("AT-ENG-09: doctor's reported rungs equal a run's, on the same green fixture (rungs 1-5)", () => {
  const { reqPath: _drop, ...doctorOpts } = baseOpts();
  const devResult = runStartupChecks(baseOpts());
  const doctorResult = runStartupChecks(doctorOpts);
  assert.equal(devResult.ok, true, devResult.reason || "");
  assert.equal(doctorResult.ok, true, doctorResult.reason || "");
  for (const id of ["1", "2", "3", "4", "4a", "5"]) {
    assert.deepEqual(rung(doctorResult, id), rung(devResult, id), `rung ${id} diverged between dev and doctor`);
  }
});

test("AT-ENG-09/BR-START-0: doctor runs rung 0's cwd half and reports the REQ-path half as not applicable, never passing", () => {
  const { reqPath: _drop, ...doctorOpts } = baseOpts();
  const doctorResult = runStartupChecks(doctorOpts);
  const row0 = rung(doctorResult, "0");
  assert.equal(row0.state, "pass");
  assert.match(row0.detail, /not applicable/i);

  const devResult = runStartupChecks(baseOpts());
  assert.doesNotMatch(rung(devResult, "0").detail || "", /not applicable/i);
});

test("AT-ENG-09/BR-START-0: doctor's cwd-half failure still refuses (rung 0 is IN the ladder, not skipped)", () => {
  const { reqPath: _drop, ...doctorOpts } = baseOpts({ isGitRepoFn: () => false });
  const result = runStartupChecks(doctorOpts);
  assert.equal(result.ok, false);
  assert.equal(rung(result, "0").state, "fail");
});

test("AT-ENG-09/AC-2.1: the doctor projection carries the version pair, effective base URL and auth catalogue id", () => {
  const { reqPath: _drop, ...doctorOpts } = baseOpts({ env: { CLAUDE_CODE_OAUTH_TOKEN: "tok" } });
  const result = runStartupChecks(doctorOpts);
  assert.deepEqual(result.versions, { engine: "0.1.0", plugin: "0.22.0" });
  assert.equal(result.baseUrl, null);
  assert.equal(result.auth.catalogueId, "auth.oauth-token");
  assert.equal(result.auth.row, 1);
  // AuthPosture's `refuses` is not part of this projection (§4.3's table).
  assert.equal(Object.prototype.hasOwnProperty.call(result.auth, "refuses"), false);
});

test("AT-ENG-09/AC-2.1: baseUrl reflects ANTHROPIC_BASE_URL when set", () => {
  const result = runStartupChecks(baseOpts({ env: { ANTHROPIC_BASE_URL: "http://127.0.0.1:8787" } }));
  assert.equal(result.baseUrl, "http://127.0.0.1:8787");
  assert.ok(result.banner.join("\n").includes("http://127.0.0.1:8787"));
});

// ─── AT-ENG-10 — §4.4's scoped set-equality, both directions, three fixtures ─

test("AT-ENG-10 fixture 1 / EC-START-5: a dispatchable identifier with no readable prompt file refuses rung 4, naming it (Direction A)", () => {
  const result = runStartupChecks(
    baseOpts({
      loadSkillFn: (_root, skill) => {
        if (skill === "te-review") throw new Error("not found in installed pdlc plugin");
        return { name: skill, path: "x", text: "y" };
      },
    })
  );
  assert.equal(result.ok, false);
  const row4 = rung(result, "4");
  assert.equal(row4.state, "fail");
  assert.match(row4.detail, /te-review/);
});

test("AT-ENG-10 fixture 2 / EC-START-9: a prompt file for an identifier the engine cannot dispatch refuses rung 4, naming it (Direction B)", () => {
  const result = runStartupChecks(
    baseOpts({
      listInstalledSkillsFn: () => [...DERIVED_SET, ...OPERATOR_ONLY, "orphan-skill"],
    })
  );
  assert.equal(result.ok, false);
  const row4 = rung(result, "4");
  assert.equal(row4.state, "fail");
  assert.match(row4.detail, /orphan-skill/);
});

test("AT-ENG-10 fixture 3 / EC-START-7: an operator-invoked skill's file present is outside the scoped equality — reported, not refused", () => {
  const result = runStartupChecks(
    baseOpts({
      listInstalledSkillsFn: () => [...DERIVED_SET, ...OPERATOR_ONLY],
    })
  );
  assert.equal(result.ok, true, result.reason || "");
  const row4 = rung(result, "4");
  assert.equal(row4.state, "pass");
  for (const name of OPERATOR_ONLY) assert.doesNotMatch(row4.detail || "", new RegExp(`refus.*${name}`, "i"));
});

test("EC-START-6: a prompt file present but empty is treated as unreadable by rung 4", () => {
  const result = runStartupChecks(
    baseOpts({
      loadSkillFn: (_root, skill) => {
        if (skill === "harvest-learnings") throw new Error(`skill "${skill}" resolved empty file: /fake/${skill}`);
        return { name: skill, path: "x", text: "y" };
      },
    })
  );
  assert.equal(result.ok, false);
  assert.match(rung(result, "4").detail, /harvest-learnings/);
});

test("BR-START-4: rung 4's derived set is never a bare count — a plugin whose files were renamed underneath a correct-COUNT set still refuses", () => {
  // 12 entries, matching DERIVED_SET's length, but every name is wrong.
  const renamed = DERIVED_SET.map((_, i) => `renamed-skill-${i}`);
  const result = runStartupChecks(baseOpts({ dispatchableSkills: renamed }));
  assert.equal(result.ok, false);
  assert.equal(rung(result, "4").state, "fail");
});

// ─── AT-ENG-11 — banner and result carry engineVersion/pluginVersion as a pair ─

test("AT-ENG-11: the banner carries both the engine and plugin versions", () => {
  const result = runStartupChecks(baseOpts());
  assert.ok(result.banner.join("\n").includes("0.1.0"));
  assert.ok(result.banner.join("\n").includes("0.22.0"));
});

test("AT-ENG-11: on a refusal, the version pair is STILL reported together, never just one half", () => {
  const result = runStartupChecks(baseOpts({ engineCompat: "^99.0.0" }));
  assert.deepEqual(result.versions, { engine: "0.1.0", plugin: "0.22.0" });
});

test("AT-ENG-11: a plugin version not found is reported as the explicit pair {engine, plugin: null}, never omitted", () => {
  const result = runStartupChecks(
    baseOpts({ resolveFn: () => ({ ok: false, root: null, source: null, reason: "not found", tried: [] }) })
  );
  assert.deepEqual(result.versions, { engine: "0.1.0", plugin: null });
});

// ─── AT-ENG-12 — EC-START-3, EC-START-4: one case each (3/5/6/7/8/9 above) ──

test("EC-START-3: a plugin present with an unparseable manifest refuses rung 2, naming the manifest path", () => {
  const manifestPath = `${PLUGIN_ROOT}/.claude-plugin/plugin.json`;
  const result = runStartupChecks(
    baseOpts({
      readVersionFn: () => ({ ok: false, reason: `plugin manifest ${manifestPath} is not valid JSON`, manifestPath }),
    })
  );
  assert.equal(result.ok, false);
  const row2 = rung(result, "2");
  assert.equal(row2.state, "fail");
  assert.match(row2.detail, /plugin\.json/);
  // Never silently treated as "version unknown, proceed" — rungs 3/4/4a skip.
  for (const id of ["3", "4", "4a"]) assert.equal(rung(result, id).state, "skipped");
});

test("EC-START-4: --dry-run on a machine that would refuse only on rung 5 still succeeds; rung 5's finding is reported, not fatal", () => {
  const result = runStartupChecks(
    baseOpts({ dryRun: true, env: { ANTHROPIC_API_KEY: "sk-live" }, allowApiKeyBilling: false })
  );
  assert.equal(result.ok, true, result.reason || "");
  const row5 = rung(result, "5");
  assert.equal(row5.state, "fail");
  assert.ok(row5.detail);
});

test("EC-START-4's converse: the SAME rung-5 refusal on a dispatching (non-dry-run) path IS fatal", () => {
  const result = runStartupChecks(baseOpts({ env: { ANTHROPIC_API_KEY: "sk-live" }, allowApiKeyBilling: false }));
  assert.equal(result.ok, false);
  assert.equal(rung(result, "5").state, "fail");
});

// ─── AC-2.1 / §5.1's six auth rows, driven through the real startup path ────
//
// Rows 1 (`auth.oauth-token`), 5 (`auth.api-key-refused`) and 6
// (`auth.unknown`) are already exercised above — by the doctor-projection
// test, by the two EC-START-4 cases, and by `baseOpts()`'s own empty
// environment respectively. The three rows below are the residue, and they
// are here for the same reason the others are: rung 5 renders the posture
// through the catalogue seam (`message(...)`, `catalogue.mjs`), so a row no
// test provokes is a registered id no path emits — exactly what
// `_assert-suite-wide.mjs`'s catalogue row fails on (PROP-MSG-2, AT-ENG-61).

/** A `~/.claude.json` fixture carrying an oauth account — §3.2's "logged in". */
function loggedInFs() {
  return {
    readFileSync: () => JSON.stringify({ oauthAccount: { emailAddress: "tester@example.com" } }),
  };
}

test("AC-2.1 row 2: a logged-in session with no API key resolves auth.session and passes rung 5", () => {
  const result = runStartupChecks(baseOpts({ env: {}, fs: loggedInFs() }));
  assert.equal(result.auth.catalogueId, "auth.session");
  assert.equal(result.auth.row, 2);
  assert.equal(rung(result, "5").state, "pass", rung(result, "5").detail || "");
  assert.match(rung(result, "5").detail, /auth\.session/);
});

test("AC-2.1 row 3: an API key WITH the billing opt-in resolves auth.api-key-optin and passes rung 5", () => {
  const result = runStartupChecks(
    baseOpts({ env: { ANTHROPIC_API_KEY: "sk-live" }, allowApiKeyBilling: true })
  );
  assert.equal(result.auth.catalogueId, "auth.api-key-optin");
  assert.equal(result.auth.row, 3);
  assert.equal(rung(result, "5").state, "pass", rung(result, "5").detail || "");
});

test("AC-2.4 row 4: an API key WITHOUT opt-in but with a logged-in session is ignored, not refused", () => {
  const result = runStartupChecks(
    baseOpts({ env: { ANTHROPIC_API_KEY: "sk-live" }, allowApiKeyBilling: false, fs: loggedInFs() })
  );
  assert.equal(result.auth.catalogueId, "auth.session-key-ignored");
  assert.equal(result.auth.row, 4);
  assert.equal(rung(result, "5").state, "pass", rung(result, "5").detail || "");
  // The key is unused, so the refusal row must not have been reached.
  assert.doesNotMatch(rung(result, "5").detail, /refuses to dispatch/);
});
