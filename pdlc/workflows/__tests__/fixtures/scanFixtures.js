// scanFixtures.js — shared forbidden-shape fixture strings for the advisory
// test suite's own source-text scanners (PROPERTIES §2.1, PLAN §13.1 item 5).
//
// Owned by PLAN task A-01 (batch 1, batch-safety rule 4): a shared test
// prerequisite consumed by every later advisory test file, created once,
// serially, before any consumer lands (A-03…A-16, via A-02).
//
// Deliberately kept OUTSIDE the `pdlc/workflows/__tests__/advisory*.test.js`
// glob both scanners read — PROP-INFRA-01 in `advisoryPreflight.test.js`
// (this feature's A-01), PROP-REG-08 in `advisoryDisabled.test.js` (A-16/A-33)
// — because a forbidden shape written inside a file either scan reads would be
// indistinguishable from the violation it exists to prove detectable. This
// path is outside that glob by construction: it lives under `__tests__/fixtures/`,
// carries no `advisory` prefix and no `.test.js` suffix. It is also excluded
// from jest's own collection by `pdlc/workflows/package.json`'s
// `testPathIgnorePatterns` (`"/__tests__/fixtures/"`), so it is never itself
// collected as a suite.
//
// These are DATA, not tests: exported string constants only. No scanner logic
// lives here — each consuming property authors and owns its own matchers.

// ---------------------------------------------------------------------------
// PROP-INFRA-01 control shapes (advisoryPreflight.test.js, A-01) — a locally
// built SeamOps object literal, a jest.fn() bound directly to a double name,
// and a canonical double factory imported from the wrong module.
// ---------------------------------------------------------------------------

/**
 * An object literal carrying two or more `SeamOps` member names as keys — the
 * shape no advisory test file may define; every `SeamOps` must come from
 * `makeSeamOps` in `helpers/advisoryDoubles.js`.
 */
export const SEAM_OPS_LITERAL_SHAPE = `
const localSeamOps = {
  gatherEvidence: async () => ({ findings: [] }),
  prompt: () => "do the thing",
  apply: async () => ({ ok: true }),
};
`;

/**
 * A `jest.fn()` bound directly to a name shaped like an agent/file/clock/PRNG
 * double, bypassing `advisoryDoubles.js` entirely.
 */
export const DOUBLE_BINDING_SHAPE = `
const _readFile = jest.fn();
const agent = jest.fn(async () => "ok");
`;

/**
 * A canonical double factory imported from somewhere other than
 * `helpers/advisoryDoubles.js`.
 */
export const FOREIGN_IMPORT_SHAPE = `
import { makeSeamOps, makeAgentDouble } from "./helpers/someOtherDoubles.js";
`;

// ---------------------------------------------------------------------------
// PROP-REG-08 control shapes (advisoryDisabled.test.js, A-16/A-33) — three
// ways a describe/it/test `.skip` evades a bare literal grep for the string
// "describe.skip".
// ---------------------------------------------------------------------------

export const SKIP_SHAPES = [
  // 1. A direct .skip call.
  `describe.skip("hidden suite", () => { it("never runs", () => {}); });`,
  // 2. The x-prefixed alias.
  `xit("hidden case", () => {});`,
  // 3. A binding assigned from a .skip member, then invoked indirectly.
  `const skipDescribe = describe.skip;\nskipDescribe("hidden via binding", () => {});`,
];

// ---------------------------------------------------------------------------
// Shared clean positive control — must report clean against every matcher
// both PROP-INFRA-01 and PROP-REG-08 run, so a scan that has stopped matching
// anything cannot pass vacuously.
// ---------------------------------------------------------------------------

export const CLEAN_SHAPE = `
import { makeAgentDouble } from "../helpers/advisoryDoubles.js";

describe("a clean advisory suite", () => {
  it("uses the canonical double correctly", async () => {
    const agent = makeAgentDouble({ script: ["ok"] });
    const result = await agent("skill", "prompt text", {});
    expect(result).toBe("ok");
  });
});
`;
