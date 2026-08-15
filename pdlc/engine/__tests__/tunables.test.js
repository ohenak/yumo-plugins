// Tests for `resolveTunables` (TSPEC §4.6, REQ §4.1).
//
// Scope of THIS file (PLAN T30 -> T47): PROP-TUNE-1…6, PROP-DISP-3, S-4.
// `resolveTunables` does not exist yet at HEAD (verified: no occurrence in
// `lib/run.mjs` or anywhere else under `pdlc/engine/`) — T30 is the RED half
// of the T30 -> T47 pair, T47 is the GREEN half that wires it into both
// `createAdapter` call sites in `bin/pdlc.mjs`. This file therefore imports
// `resolveTunables` from `../lib/run.mjs`, the file T47's ownership row
// names, and every test below is expected to fail on a missing export until
// T47 lands.
//
// REQ §4.1 fixes the closed set of five tunables and their defaults, quoted
// here as spec literals rather than imported from any implementation
// constant — TSPEC §4.6 warns explicitly that `adapter.mjs:57`'s
// `DEFAULT_MAX_RATE_LIMIT_PAUSES` is a *different* budget (the rate-limit
// pause cap) that only numerically coincides with `dispatch.retryAttempts`'s
// default of 3; pinning against that constant would pass for the wrong
// reason once the two diverge. Defaults asserted here are therefore the
// REQ/TSPEC prose values, not any module-local name.
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTunables } from "../lib/run.mjs";

// ─── REQ §4.1 / TSPEC §4.6 spec-literal defaults ────────────────────────────
const DEFAULT_RETRY_ATTEMPTS = 3; // "3 retries after the first attempt"
const DEFAULT_RETRY_BACKOFF_BASE_MS = 30 * 1000; // "exponential from 30s"
const DEFAULT_RETRY_BACKOFF_CAP_MS = 15 * 60 * 1000; // "capped at 15 min"
const DEFAULT_TIMEOUT_MINUTES = 30; // "30 min per dispatch"
const DEFAULT_TIMEOUT_MS = DEFAULT_TIMEOUT_MINUTES * 60 * 1000; // 1_800_000
const DEFAULT_ALLOW_API_KEY_BILLING = false;
const DEFAULT_MAX_ITERATIONS = Infinity; // "unbounded"

test("resolveTunables() with no config and no flags returns REQ §4.1's five documented defaults", () => {
  const result = resolveTunables({});
  assert.equal(result.retryAttempts, DEFAULT_RETRY_ATTEMPTS);
  assert.equal(result.retryBackoff.baseMs, DEFAULT_RETRY_BACKOFF_BASE_MS);
  assert.equal(result.retryBackoff.capMs, DEFAULT_RETRY_BACKOFF_CAP_MS);
  assert.equal(result.timeoutMinutes, DEFAULT_TIMEOUT_MINUTES);
  assert.equal(result.allowApiKeyBilling, DEFAULT_ALLOW_API_KEY_BILLING);
  assert.equal(result.maxIterations, DEFAULT_MAX_ITERATIONS);
});

test("resolveTunables() called with no arguments at all also resolves to the five documented defaults", () => {
  // `{ config, flags }` are both optional (BR-CLI-3 applies to a run whose
  // consumer carries no .claude/pdlc.config.json at all, EC-PAR-2 / PROP-READ-8
  // neighbourhood) — the resolver must not require its caller to pass empty
  // objects explicitly.
  const result = resolveTunables();
  assert.equal(result.retryAttempts, DEFAULT_RETRY_ATTEMPTS);
  assert.equal(result.timeoutMinutes, DEFAULT_TIMEOUT_MINUTES);
  assert.equal(result.maxIterations, DEFAULT_MAX_ITERATIONS);
  assert.equal(result.allowApiKeyBilling, DEFAULT_ALLOW_API_KEY_BILLING);
});

// ─── PROP-TUNE-1: the three engine-config rows come from config, and the
// effective value is what gets reported (BR-CLI-3) ─────────────────────────

test("resolveTunables() takes dispatch.retryAttempts from config when present", () => {
  const result = resolveTunables({ config: { dispatch: { retryAttempts: 7 } } });
  assert.equal(result.retryAttempts, 7);
});

test("resolveTunables() takes dispatch.retryBackoff from config when present", () => {
  const result = resolveTunables({
    config: { dispatch: { retryBackoff: { baseMs: 5000, capMs: 60000 } } },
  });
  assert.equal(result.retryBackoff.baseMs, 5000);
  assert.equal(result.retryBackoff.capMs, 60000);
});

test("resolveTunables() takes dispatch.timeoutMinutes from config when present", () => {
  const result = resolveTunables({ config: { dispatch: { timeoutMinutes: 45 } } });
  assert.equal(result.timeoutMinutes, 45);
});

// ─── S-4 / TSPEC §4.6: the effective-timeout oracle. The fixture pins a
// NON-default value deliberately — DEFAULT_TIMEOUT_MS (transport.mjs:64)
// equals the tunable's own default, so an assertion taken at the default is
// self-consistent and false (a run whose config was never consulted reports
// 30, is served the transport's constructor default of 1_800_000, and
// passes anyway). At 7 the two are distinguishable: dropping the stamp
// leaves 1_800_000 against a reported 7, and a config never read leaves the
// report at 30 against an asserted literal 7. Both failures are red, and
// neither is derived from the code under test. ────────────────────────────

test("resolveTunables() at dispatch.timeoutMinutes: 7 reports the literal 7 and derives the literal 420000 boundary value", () => {
  const result = resolveTunables({ config: { dispatch: { timeoutMinutes: 7 } } });
  assert.equal(result.timeoutMinutes, 7, "reported effective value must be the literal 7");
  assert.equal(
    result.timeoutMs,
    420000,
    "the derived per-dispatch boundary value (timeoutMinutes * 60_000) must be the literal 420000, " +
      "never DEFAULT_TIMEOUT_MS's 1_800_000",
  );
});

test("resolveTunables() default timeoutMinutes derives the default boundary value (sanity check the literal above is not a coincidence)", () => {
  const result = resolveTunables({});
  assert.equal(result.timeoutMinutes, DEFAULT_TIMEOUT_MINUTES);
  assert.equal(result.timeoutMs, DEFAULT_TIMEOUT_MS);
});

// ─── PROP-TUNE-3 / AT-ENG-03: the two operator-owned rows are flag-only and
// are NOT accepted from configuration at all (BR-CLI-2 for billing, the same
// rule extended to --max-iterations per BR-LOOP-2). A config file setting
// either "changes nothing; only the flag does". ─────────────────────────────

test("resolveTunables(): auth.allowApiKeyBilling in config changes nothing — only the flag does (AT-ENG-03)", () => {
  const withConfigTrue = resolveTunables({ config: { auth: { allowApiKeyBilling: true } } });
  assert.equal(
    withConfigTrue.allowApiKeyBilling,
    false,
    "a config file setting auth.allowApiKeyBilling: true must not change the effective value",
  );

  const withFlagTrue = resolveTunables({ flags: { allowApiKeyBilling: true } });
  assert.equal(withFlagTrue.allowApiKeyBilling, true, "the flag alone must take effect");

  const flagFalseConfigTrue = resolveTunables({
    config: { auth: { allowApiKeyBilling: true } },
    flags: { allowApiKeyBilling: false },
  });
  assert.equal(
    flagFalseConfigTrue.allowApiKeyBilling,
    false,
    "the flag's own (default/false) value must win even when config disagrees",
  );
});

test("resolveTunables(): queue.maxIterations in config changes nothing — only --max-iterations does", () => {
  const withConfigOnly = resolveTunables({ config: { queue: { maxIterations: 5 } } });
  assert.equal(
    withConfigOnly.maxIterations,
    DEFAULT_MAX_ITERATIONS,
    "a config file setting queue.maxIterations must not change the effective value",
  );

  const withFlagOnly = resolveTunables({ flags: { maxIterations: 5 } });
  assert.equal(withFlagOnly.maxIterations, 5, "the flag alone must take effect");

  const both = resolveTunables({
    config: { queue: { maxIterations: 999 } },
    flags: { maxIterations: 5 },
  });
  assert.equal(both.maxIterations, 5, "the flag must win even when config disagrees");
});

test("resolveTunables(): a config file setting BOTH operator-owned rows leaves both at their flag-absent defaults", () => {
  // Guards against an implementation that reads config for one operator row
  // but not the other — both must be provably untouched by config together,
  // not just each in isolation.
  const result = resolveTunables({
    config: { auth: { allowApiKeyBilling: true }, queue: { maxIterations: 1 } },
  });
  assert.equal(result.allowApiKeyBilling, DEFAULT_ALLOW_API_KEY_BILLING);
  assert.equal(result.maxIterations, DEFAULT_MAX_ITERATIONS);
});

// ─── S-4: property strategy over generated (flag, config, default) triples.
//
// resolveTunables is a total function whose result equals the
// highest-precedence PRESENT source. Each of REQ §4.1's five rows is
// generated independently as present/absent on its applicable source(s):
//
//   - the three engine-config rows (retryAttempts, retryBackoff,
//     timeoutMinutes) have exactly two applicable sources: config, default.
//     There is no CLI flag for these at all (TSPEC §4.6's "Resolved from"
//     column names only config for these three rows).
//   - the two operator-owned rows (allowApiKeyBilling, maxIterations) have
//     exactly two applicable sources: flag, default. Config is GENERATED as
//     present for these rows specifically so the property can falsify a
//     resolver that reads it — the expected value never varies with it.
//
// Each row's generator yields every combination of source-presence for that
// row, and the corpus below is the full cross-product across all five rows
// so no single passing row masks a resolver that mishandles a different row
// when combined with others.

const ROW_GENERATORS = {
  retryAttempts: {
    presentValue: 9,
    apply(triple, present) {
      if (present) triple.config.dispatch.retryAttempts = 9;
    },
    expected(present) {
      return present ? 9 : DEFAULT_RETRY_ATTEMPTS;
    },
    read(result) {
      return result.retryAttempts;
    },
  },
  timeoutMinutes: {
    presentValue: 12,
    apply(triple, present) {
      if (present) triple.config.dispatch.timeoutMinutes = 12;
    },
    expected(present) {
      return present ? 12 : DEFAULT_TIMEOUT_MINUTES;
    },
    read(result) {
      return result.timeoutMinutes;
    },
  },
  allowApiKeyBilling: {
    // this row's applicable source is the FLAG; config is also generated as
    // present (the decoy below) purely to falsify a resolver that reads it.
    apply(triple, present) {
      if (present) triple.flags.allowApiKeyBilling = true;
      triple.config.auth = { allowApiKeyBilling: true }; // decoy, always present
    },
    expected(present) {
      return present ? true : DEFAULT_ALLOW_API_KEY_BILLING;
    },
    read(result) {
      return result.allowApiKeyBilling;
    },
  },
  maxIterations: {
    apply(triple, present) {
      if (present) triple.flags.maxIterations = 4;
      triple.config.queue = { maxIterations: 1 }; // decoy, always present
    },
    expected(present) {
      return present ? 4 : DEFAULT_MAX_ITERATIONS;
    },
    read(result) {
      return result.maxIterations;
    },
  },
};

function* generateTunableTriples() {
  const rowNames = Object.keys(ROW_GENERATORS);
  const presenceCombos = 2 ** rowNames.length;
  for (let mask = 0; mask < presenceCombos; mask += 1) {
    const triple = { config: { dispatch: {} }, flags: {} };
    const presentByRow = {};
    rowNames.forEach((name, index) => {
      const present = (mask & (1 << index)) !== 0;
      presentByRow[name] = present;
      ROW_GENERATORS[name].apply(triple, present);
    });
    yield { label: `mask=${mask.toString(2).padStart(rowNames.length, "0")}`, triple, presentByRow };
  }
}

test("PROP-TUNE / S-4: resolveTunables is total over generated (flag, config, default) triples and equals the highest-precedence present source", () => {
  const cases = [...generateTunableTriples()];
  assert.ok(cases.length >= 4, "corpus must cover more than a single combination");

  for (const { label, triple, presentByRow } of cases) {
    let result;
    assert.doesNotThrow(() => {
      result = resolveTunables(triple);
    }, `${label} must not make resolveTunables throw`);
    assert.notEqual(result, undefined, `${label} must not resolve to undefined`);

    for (const [rowName, gen] of Object.entries(ROW_GENERATORS)) {
      const present = presentByRow[rowName];
      const expected = gen.expected(present);
      assert.equal(
        gen.read(result),
        expected,
        `${label}: row "${rowName}" must equal its highest-precedence present source`,
      );
    }
  }
});

test("PROP-TUNE-3 / S-4: the two operator-owned rows never read config, across the full generated corpus (AT-ENG-03)", () => {
  // Counter-property, isolated from the totality assertion above: every
  // generated triple carries a config-only decoy on both operator-owned
  // rows (see ROW_GENERATORS above); this asserts the decoy is never the
  // value read back, even in the combination where the row's own flag is
  // absent — the case a resolver that "falls back to config before default"
  // would get wrong.
  for (const { label, triple, presentByRow } of generateTunableTriples()) {
    const result = resolveTunables(triple);
    if (!presentByRow.allowApiKeyBilling) {
      assert.equal(
        result.allowApiKeyBilling,
        DEFAULT_ALLOW_API_KEY_BILLING,
        `${label}: allowApiKeyBilling must ignore config's decoy and fall through to the default, never config`,
      );
    }
    if (!presentByRow.maxIterations) {
      assert.equal(
        result.maxIterations,
        DEFAULT_MAX_ITERATIONS,
        `${label}: maxIterations must ignore config's decoy and fall through to the default, never config`,
      );
    }
  }
});
