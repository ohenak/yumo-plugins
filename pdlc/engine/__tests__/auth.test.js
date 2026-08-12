// Tests for pdlc/engine/lib/auth.mjs (TSPEC §3.2, FSPEC §5.1, C-1a).
//
// Scope of THIS file (per PLAN's task table: T06 -> T15): PROP-AUTH-1,
// PROP-AUTH-2, PROP-AUTH-3, PROP-AUTH-4, PROP-AUTH-5, PROP-AUTH-6,
// PROP-AUTH-7, and the AuthPosture-shape half of PROP-AUTH-13 (the banner
// carries no transport-reported auth source — proved here by AuthPosture
// never carrying an `apiKeySource`/`baseUrl` field at all). The `baseUrl`
// half of PROP-AUTH-13 is a rung-5 `StartupResult` fact (TSPEC §4.3) and is
// tested in `startup.test.js` (T41), not here. The per-dispatch assertion
// (C-1b, PROP-AUTH-8..11) is `transport.mjs`'s and lives in
// `transport.test.js` (T22 -> T36); PROP-AUTH-9's integration-level "one
// recorded source per dispatch" and PROP-AUTH-12's paired-positive run both
// need the adapter/report seam and live in `report.test.js` / `run.test.js`
// (T06, T20 -> T15, T35, T40). Nothing in this file touches a real
// `~/.claude.json` or a real environment: `readLoginEvidence` is driven with
// an injected fake filesystem, and `resolveAuthPosture` is a pure function
// over a plain `env` object — fully offline, no operator credential anywhere
// in this file (BR-AUTH-0's own no-operator-credential rule, PROP-AUTH-2).

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { readLoginEvidence, AUTH_ROWS, resolveAuthPosture } from "../lib/auth.mjs";

const HOME = "/home/tester";
const CLAUDE_JSON = path.join(HOME, ".claude.json");

/** A fake fs over a plain {path: contents-or-Error} map, matching the shape
 * `readLoginEvidence` needs: `readFileSync` only. */
function fakeFs(files) {
  return {
    readFileSync: (p) => {
      if (!Object.hasOwn(files, p)) {
        const err = new Error(`ENOENT: no such file or directory, open '${p}'`);
        err.code = "ENOENT";
        throw err;
      }
      const v = files[p];
      if (v instanceof Error) throw v;
      return v;
    },
  };
}

function loggedInJson(extra = {}) {
  return JSON.stringify({ oauthAccount: { emailAddress: "tester@example.com" }, ...extra });
}

// ── readLoginEvidence (BR-AUTH-0, EC-AUTH-2, PROP-AUTH-2, PROP-AUTH-4) ─────

test("readLoginEvidence: readable file with oauthAccount is logged in", () => {
  const fs = fakeFs({ [CLAUDE_JSON]: loggedInJson() });
  const out = readLoginEvidence({ home: HOME, fs, env: {} });
  assert.equal(out.readable, true);
  assert.equal(out.loggedIn, true);
  assert.equal(out.path, CLAUDE_JSON);
  assert.equal(out.reason, null);
});

test("readLoginEvidence: readable file without oauthAccount is not logged in, reason recorded", () => {
  const fs = fakeFs({ [CLAUDE_JSON]: JSON.stringify({ someOtherKey: true }) });
  const out = readLoginEvidence({ home: HOME, fs, env: {} });
  assert.equal(out.readable, true);
  assert.equal(out.loggedIn, false);
  assert.equal(out.path, CLAUDE_JSON);
  assert.equal(out.reason, "no oauthAccount");
});

test("readLoginEvidence: absent file is not logged in, reason 'absent' (EC-AUTH-2)", () => {
  const fs = fakeFs({});
  const out = readLoginEvidence({ home: HOME, fs, env: {} });
  assert.equal(out.readable, false);
  assert.equal(out.loggedIn, false);
  assert.equal(out.path, CLAUDE_JSON);
  assert.equal(out.reason, "absent");
});

test("readLoginEvidence: unreadable file (permissions) is not logged in, reason names the code (EC-AUTH-2)", () => {
  const denied = new Error("EACCES: permission denied");
  denied.code = "EACCES";
  const fs = fakeFs({ [CLAUDE_JSON]: denied });
  const out = readLoginEvidence({ home: HOME, fs, env: {} });
  assert.equal(out.readable, false);
  assert.equal(out.loggedIn, false);
  assert.equal(out.path, CLAUDE_JSON);
  assert.equal(out.reason, "unreadable: EACCES");
});

test("readLoginEvidence: malformed JSON is unreadable, not a thrown error (readLoginEvidence is total)", () => {
  const fs = fakeFs({ [CLAUDE_JSON]: "{ this is not json" });
  let out;
  assert.doesNotThrow(() => {
    out = readLoginEvidence({ home: HOME, fs, env: {} });
  });
  assert.equal(out.loggedIn, false);
  assert.notEqual(out.reason, null);
});

test("readLoginEvidence: unreadable vs. absent are distinguished only in the message (reason), never in the row-relevant fields (EC-AUTH-2)", () => {
  const denied = new Error("EACCES: permission denied");
  denied.code = "EACCES";
  const unreadable = readLoginEvidence({ home: HOME, fs: fakeFs({ [CLAUDE_JSON]: denied }), env: {} });
  const absent = readLoginEvidence({ home: HOME, fs: fakeFs({}), env: {} });
  // Both leave loggedIn: false and readable: false — the shared shape that
  // makes rows 2/4 unreachable and lets the list fall through to 5 or 6.
  assert.equal(unreadable.loggedIn, false);
  assert.equal(absent.loggedIn, false);
  assert.equal(unreadable.readable, false);
  assert.equal(absent.readable, false);
  // The distinction is carried only in `reason`, for the refusal message.
  assert.notEqual(unreadable.reason, absent.reason);
  assert.equal(absent.reason, "absent");
  assert.match(unreadable.reason, /^unreadable:/);
});

// ── AUTH_ROWS shape (BR-AUTH-1) ─────────────────────────────────────────────

test("AUTH_ROWS is a frozen, six-member, first-match-ordered list", () => {
  assert.equal(Object.isFrozen(AUTH_ROWS), true);
  assert.equal(AUTH_ROWS.length, 6);
});

const CATALOGUE_IDS = [
  "auth.oauth-token", // row 1
  "auth.session", // row 2
  "auth.api-key-optin", // row 3
  "auth.session-key-ignored", // row 4
  "auth.api-key-refused", // row 5
  "auth.unknown", // row 6
];

// ── evidence fixture helpers ────────────────────────────────────────────────

const LOGGED_IN = { readable: true, loggedIn: true, path: CLAUDE_JSON, reason: null };
const NOT_LOGGED_IN = { readable: true, loggedIn: false, path: CLAUDE_JSON, reason: "no oauthAccount" };
const ABSENT_EVIDENCE = { readable: false, loggedIn: false, path: CLAUDE_JSON, reason: "absent" };

// ── PROP-AUTH-1 / AT-ENG-13: each of the six rows, one fixture each ────────

test("resolveAuthPosture: row 1 — CLAUDE_CODE_OAUTH_TOKEN set wins regardless of anything else", () => {
  const out = resolveAuthPosture({
    env: { CLAUDE_CODE_OAUTH_TOKEN: "tok", ANTHROPIC_API_KEY: undefined },
    evidence: ABSENT_EVIDENCE,
    allowApiKeyBilling: false,
  });
  assert.equal(out.row, 1);
  assert.equal(out.catalogueId, "auth.oauth-token");
  assert.equal(out.refuses, false);
});

test("resolveAuthPosture: row 2 — no API key, logged-in settings state present", () => {
  const out = resolveAuthPosture({
    env: {},
    evidence: LOGGED_IN,
    allowApiKeyBilling: false,
  });
  assert.equal(out.row, 2);
  assert.equal(out.catalogueId, "auth.session");
  assert.equal(out.refuses, false);
});

test("resolveAuthPosture: row 3 — API key present and the opt-in flag passed", () => {
  const out = resolveAuthPosture({
    env: { ANTHROPIC_API_KEY: "sk-live" },
    evidence: NOT_LOGGED_IN,
    allowApiKeyBilling: true,
  });
  assert.equal(out.row, 3);
  assert.equal(out.catalogueId, "auth.api-key-optin");
  assert.equal(out.refuses, false);
});

test("resolveAuthPosture: row 4 — API key present, no flag, logged-in settings state present", () => {
  const out = resolveAuthPosture({
    env: { ANTHROPIC_API_KEY: "sk-live" },
    evidence: LOGGED_IN,
    allowApiKeyBilling: false,
  });
  assert.equal(out.row, 4);
  assert.equal(out.catalogueId, "auth.session-key-ignored");
  assert.equal(out.refuses, false);
});

test("resolveAuthPosture: row 5 — API key present, no flag, no subscription credential (refusal)", () => {
  const out = resolveAuthPosture({
    env: { ANTHROPIC_API_KEY: "sk-live" },
    evidence: ABSENT_EVIDENCE,
    allowApiKeyBilling: false,
  });
  assert.equal(out.row, 5);
  assert.equal(out.catalogueId, "auth.api-key-refused");
  assert.equal(out.refuses, true);
});

test("resolveAuthPosture: row 6 — none of the above, the total fallback", () => {
  const out = resolveAuthPosture({
    env: {},
    evidence: ABSENT_EVIDENCE,
    allowApiKeyBilling: false,
  });
  assert.equal(out.row, 6);
  assert.equal(out.catalogueId, "auth.unknown");
  assert.equal(out.refuses, false);
});

test("PROP-AUTH-1: every catalogue id is reachable and rows/ids agree", () => {
  const reached = new Set();
  const fixtures = [
    { env: { CLAUDE_CODE_OAUTH_TOKEN: "tok" }, evidence: ABSENT_EVIDENCE, allowApiKeyBilling: false },
    { env: {}, evidence: LOGGED_IN, allowApiKeyBilling: false },
    { env: { ANTHROPIC_API_KEY: "k" }, evidence: NOT_LOGGED_IN, allowApiKeyBilling: true },
    { env: { ANTHROPIC_API_KEY: "k" }, evidence: LOGGED_IN, allowApiKeyBilling: false },
    { env: { ANTHROPIC_API_KEY: "k" }, evidence: ABSENT_EVIDENCE, allowApiKeyBilling: false },
    { env: {}, evidence: ABSENT_EVIDENCE, allowApiKeyBilling: false },
  ];
  fixtures.forEach((fixture, i) => {
    const out = resolveAuthPosture(fixture);
    assert.equal(out.row, i + 1, `fixture ${i} expected row ${i + 1}, got ${out.row}`);
    assert.equal(out.catalogueId, CATALOGUE_IDS[i]);
    reached.add(out.catalogueId);
  });
  assert.deepEqual([...reached].sort(), [...CATALOGUE_IDS].sort());
});

// ── PROP-AUTH-5 / EC-AUTH-3: the overlap case that proves first-match ──────

test("PROP-AUTH-5: OAuth token AND API key both present, no flag — row 1 wins, not row 4", () => {
  const out = resolveAuthPosture({
    env: { CLAUDE_CODE_OAUTH_TOKEN: "tok", ANTHROPIC_API_KEY: "sk-live" },
    evidence: LOGGED_IN,
    allowApiKeyBilling: false,
  });
  assert.equal(out.row, 1);
  assert.equal(out.catalogueId, "auth.oauth-token");
});

// ── PROP-AUTH-3 / EC-AUTH-1: empty API key counts as absent ────────────────

test("PROP-AUTH-3: ANTHROPIC_API_KEY='' counts as absent — row 2, not row 4 or 5", () => {
  const out = resolveAuthPosture({
    env: { ANTHROPIC_API_KEY: "" },
    evidence: LOGGED_IN,
    allowApiKeyBilling: false,
  });
  assert.equal(out.row, 2);
  assert.equal(out.catalogueId, "auth.session");
});

test("PROP-AUTH-3: ANTHROPIC_API_KEY of only whitespace counts as absent — row 6 with no login evidence", () => {
  const out = resolveAuthPosture({
    env: { ANTHROPIC_API_KEY: "   " },
    evidence: ABSENT_EVIDENCE,
    allowApiKeyBilling: false,
  });
  assert.equal(out.row, 6);
  assert.equal(out.catalogueId, "auth.unknown");
});

test("PROP-AUTH-3: a non-empty, non-string-typed key value is never treated as present", () => {
  const out = resolveAuthPosture({
    env: { ANTHROPIC_API_KEY: undefined },
    evidence: ABSENT_EVIDENCE,
    allowApiKeyBilling: false,
  });
  assert.equal(out.row, 6);
});

// ── PROP-AUTH-6 / AT-ENG-14: row 5's refusal shape ──────────────────────────

test("PROP-AUTH-6: row 5 echoes the inspected evidence path (BR-AUTH-0) so a message can name it", () => {
  const out = resolveAuthPosture({
    env: { ANTHROPIC_API_KEY: "sk-live" },
    evidence: ABSENT_EVIDENCE,
    allowApiKeyBilling: false,
  });
  assert.equal(out.evidencePath, CLAUDE_JSON);
  assert.equal(out.refuses, true);
});

test("PROP-AUTH-6: row 5 is the only refusing row", () => {
  const nonRefusing = [
    { env: { CLAUDE_CODE_OAUTH_TOKEN: "tok" }, evidence: ABSENT_EVIDENCE, allowApiKeyBilling: false },
    { env: {}, evidence: LOGGED_IN, allowApiKeyBilling: false },
    { env: { ANTHROPIC_API_KEY: "k" }, evidence: NOT_LOGGED_IN, allowApiKeyBilling: true },
    { env: { ANTHROPIC_API_KEY: "k" }, evidence: LOGGED_IN, allowApiKeyBilling: false },
    { env: {}, evidence: ABSENT_EVIDENCE, allowApiKeyBilling: false },
  ];
  for (const fixture of nonRefusing) {
    const out = resolveAuthPosture(fixture);
    assert.equal(out.refuses, false, `row ${out.row} (${out.catalogueId}) must not refuse`);
  }
});

// ── PROP-AUTH-7 / EC-AUTH-6: the opt-in flag on a keyless machine ──────────

test("PROP-AUTH-7: opt-in flag with an API key present moves row 4 to row 3", () => {
  const withoutFlag = resolveAuthPosture({
    env: { ANTHROPIC_API_KEY: "sk-live" },
    evidence: LOGGED_IN,
    allowApiKeyBilling: false,
  });
  const withFlag = resolveAuthPosture({
    env: { ANTHROPIC_API_KEY: "sk-live" },
    evidence: LOGGED_IN,
    allowApiKeyBilling: true,
  });
  assert.equal(withoutFlag.row, 4);
  assert.equal(withFlag.row, 3);
});

test("PROP-AUTH-7 / EC-AUTH-6: opt-in flag on a machine with no API key at all changes nothing about the resolved row", () => {
  for (const evidence of [LOGGED_IN, NOT_LOGGED_IN, ABSENT_EVIDENCE]) {
    const withoutFlag = resolveAuthPosture({ env: {}, evidence, allowApiKeyBilling: false });
    const withFlag = resolveAuthPosture({ env: {}, evidence, allowApiKeyBilling: true });
    assert.equal(withFlag.row, withoutFlag.row, `evidence.loggedIn=${evidence.loggedIn}`);
    assert.equal(withFlag.catalogueId, withoutFlag.catalogueId);
    assert.equal(withFlag.refuses, withoutFlag.refuses);
  }
});

// ── PROP-AUTH-13 (AuthPosture-shape half): no transport-reported auth
// source ever appears on this return value — the whole point of §3.2/§3.4
// being independent observations (TSPEC §4.3). The `baseUrl` fact is a
// StartupResult/rung-5 concern and is not this function's to report; tested
// in startup.test.js (T41).

test("PROP-AUTH-13 (partial): AuthPosture carries no apiKeySource / baseUrl field of its own", () => {
  const out = resolveAuthPosture({
    env: { CLAUDE_CODE_OAUTH_TOKEN: "tok" },
    evidence: ABSENT_EVIDENCE,
    allowApiKeyBilling: false,
  });
  assert.deepEqual(Object.keys(out).sort(), ["catalogueId", "evidencePath", "refuses", "row"]);
});

// ── totality (BR-AUTH-1) ─────────────────────────────────────────────────

test("resolveAuthPosture is total: every generated combination of inputs resolves to exactly one row", () => {
  const envs = [
    { CLAUDE_CODE_OAUTH_TOKEN: "tok" },
    {},
  ];
  const keys = [undefined, "", "   ", "sk-live"];
  const evidences = [LOGGED_IN, NOT_LOGGED_IN, ABSENT_EVIDENCE];
  const flags = [false, true];

  for (const oauthEnv of envs) {
    for (const key of keys) {
      for (const evidence of evidences) {
        for (const allowApiKeyBilling of flags) {
          const env = { ...oauthEnv, ANTHROPIC_API_KEY: key };
          const out = resolveAuthPosture({ env, evidence, allowApiKeyBilling });
          assert.ok(
            Number.isInteger(out.row) && out.row >= 1 && out.row <= 6,
            `row must be 1..6, got ${out.row} for ${JSON.stringify({ env, evidence, allowApiKeyBilling })}`,
          );
          assert.ok(CATALOGUE_IDS.includes(out.catalogueId));
        }
      }
    }
  }
});
