// Tests for pdlc/engine/lib/resolve-version.mjs (PLAN T07, TSPEC §6.3/§6.4,
// PROPERTIES PROP-VER-1..9, PROP-VER-16). [red]: `lib/resolve-version.mjs` is
// authored by T37 (batch 5); this file is written first, per §12.4's [Fake
// first] TDD order. Its assertions are committed now, skipped under the
// "T37:" id (see the import comment below for the deferred-import mechanics
// that let the file load skipped rather than fail on import), and T37
// un-skips and drives them green.
//
// `resolveVersion()` is pure (§6.3): no fs, no exec, no clock. Its declared
// inputs are a listing, a config read result, argv-derived flags, an env
// snapshot and a `location` record (§6.3). This file's assumed call shape,
// stated once here rather than re-derived per test:
//
//   resolveVersion({ listing, configResult, dev, env, location })
//     -> { kind: "dev"|"pin"|"latest"|"refuse", version: string|null,
//          root: string|null, announcement: string,
//          refusal: {id: string, text: string}|null }
//
// `configResult` is S-2's whole `readEngineConfig` return shape
// (`{config, notices, engine}`, `_doubles.mjs` S-2), not just its `engine`
// sub-object, so the same double drops into a production composition root
// unchanged (TSPEC §10.1 S-2 commentary). §10.2's typedef states
// `refusal: string|null`; PROP-VER-5/6 require asserting an exact catalogue
// *id* per refusal branch (`version.pin-missing` vs `version.pin-malformed`
// vs `config.unreadable` vs `version.dev-incomplete` vs `store.empty`), which
// a bare string cannot carry without regex-scraping it back out — so this
// file assumes `refusal` is extended to `{id, text}` (the same `{id, text}`
// shape §6.5 already uses for `resolvePluginRoot`'s `notices`), an
// extension-not-replacement in the sense §10.1's S-2 commentary already
// licenses. `announcement` is asserted non-empty on every branch, refuse
// included, per §6.3's "every branch ... produces an announcement line".

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

// `resolveVersion` is imported lazily inside each test body below (dynamic
// `await import(...)`) rather than statically here: `lib/resolve-version.mjs`
// does not exist until T37, and a top-level static import of a missing
// module would fail the whole file at load time before any `.skip` could
// take effect.
import {
  configAbsent,
  configNoPin,
  configUnreadable,
  seeded,
  resolveSeed,
  genVersionString,
  genConfigShape,
} from "./_doubles.mjs";

// ───────────────────────── shared fixture builders ─────────────────────────

/**
 * @param {{isCheckout?: boolean, checkoutRoot?: string, pluginRootMatches?: boolean,
 *   enginePath?: string}} [opts]
 * @returns {{enginePath: string, isCheckout: boolean, checkoutRoot: string, pluginRoot: string|null}}
 */
function makeLocation({
  isCheckout = false,
  checkoutRoot = "/repo",
  pluginRootMatches = false,
  enginePath = "/repo/pdlc/engine",
} = {}) {
  return {
    enginePath,
    isCheckout,
    checkoutRoot: isCheckout ? checkoutRoot : "",
    pluginRoot: pluginRootMatches ? path.join(checkoutRoot, "pdlc") : "/elsewhere/pdlc",
  };
}

const NOT_A_CHECKOUT = makeLocation({ isCheckout: false });
const MATCHING_CHECKOUT = makeLocation({ isCheckout: true, pluginRootMatches: true });
const MISMATCHED_CHECKOUT = makeLocation({ isCheckout: true, pluginRootMatches: false });

// Maps a decision back to §6.3's branch id (0-7), so a fixture can pin the
// single number it must reach (PROP-VER-1) rather than only its `kind`.
const REFUSAL_BRANCH = {
  "config.unreadable": 0,
  "version.dev-incomplete": 2,
  "version.pin-missing": 4,
  "version.pin-malformed": 5,
  "store.empty": 7,
};

function branchIdFor(decision) {
  if (decision.kind === "dev") return 1;
  if (decision.kind === "pin") return 3;
  if (decision.kind === "latest") return 6;
  if (decision.kind === "refuse") {
    const id = decision.refusal && decision.refusal.id;
    if (Object.hasOwn(REFUSAL_BRANCH, id)) return REFUSAL_BRANCH[id];
    throw new Error(`branchIdFor: unrecognised refusal id ${JSON.stringify(id)}`);
  }
  throw new Error(`branchIdFor: unrecognised kind ${JSON.stringify(decision.kind)}`);
}

function assertAnnounced(decision, label) {
  assert.equal(typeof decision.announcement, "string", `${label}: announcement must be a string`);
  assert.notEqual(decision.announcement.trim(), "", `${label}: announcement must not be empty`);
}

// ───────────────────── §8 "eight named resolution fixtures" ────────────────
// One input per ladder branch 0-7, each pinning the branch id it must reach
// (PROP-VER-1, PROP-VER-2, PROP-VER-6, PROP-VER-8).

describe("T37: resolveVersion: the eight named branch fixtures (§6.3, §8)", () => {
  test("branch 0 config-unreadable: an unparseable config file refuses before any pin check", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: ["0.3.1"],
      configResult: configUnreadable(".claude/pdlc.config.json", "Unexpected end of JSON input"),
      dev: false,
      env: {},
      location: NOT_A_CHECKOUT,
    });
    assert.equal(decision.kind, "refuse");
    assert.equal(decision.refusal.id, "config.unreadable");
    assert.equal(branchIdFor(decision), 0);
    assertAnnounced(decision, "branch 0");
  });

  test("branch 1 dev: --dev with a matching checkout runs the checkout in place", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: [],
      configResult: configAbsent(),
      dev: true,
      env: {},
      location: MATCHING_CHECKOUT,
    });
    assert.equal(decision.kind, "dev");
    assert.equal(branchIdFor(decision), 1);
    assertAnnounced(decision, "branch 1");
  });

  test("branch 2 dev-incomplete: --dev with a mismatched plugin root refuses, never falls back", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: ["0.3.1"],
      configResult: configAbsent(),
      dev: true,
      env: {},
      location: MISMATCHED_CHECKOUT,
    });
    assert.equal(decision.kind, "refuse");
    assert.equal(decision.refusal.id, "version.dev-incomplete");
    assert.equal(branchIdFor(decision), 2);
    assertAnnounced(decision, "branch 2 (mismatched root)");
  });

  test("branch 2 dev-incomplete: --dev outside a checkout refuses, never falls back", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: ["0.3.1"],
      configResult: configAbsent(),
      dev: true,
      env: {},
      location: NOT_A_CHECKOUT,
    });
    assert.equal(decision.kind, "refuse");
    assert.equal(decision.refusal.id, "version.dev-incomplete");
    assert.equal(branchIdFor(decision), 2);
    assertAnnounced(decision, "branch 2 (not a checkout)");
  });

  test("branch 3 pin: a well-formed pin present in the store resolves to that version", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: ["0.2.0", "0.3.1"],
      configResult: configNoPin({ version: "0.3.1" }),
      dev: false,
      env: {},
      location: NOT_A_CHECKOUT,
    });
    assert.equal(decision.kind, "pin");
    assert.equal(decision.version, "0.3.1");
    assert.equal(branchIdFor(decision), 3);
    assertAnnounced(decision, "branch 3");
  });

  test("branch 4 pin-missing: a pin naming an uninstalled version refuses, never falls back", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: ["0.3.1"],
      configResult: configNoPin({ version: "9.9.9" }),
      dev: false,
      env: {},
      location: NOT_A_CHECKOUT,
    });
    assert.equal(decision.kind, "refuse");
    assert.equal(decision.refusal.id, "version.pin-missing");
    assert.equal(branchIdFor(decision), 4);
    assertAnnounced(decision, "branch 4");
    // PROP-VER-5: names both the requested version and what is installed.
    assert.match(decision.refusal.text, /9\.9\.9/);
    assert.match(decision.refusal.text, /0\.3\.1/);
  });

  test("branch 5 pin-malformed: an unparseable pin refuses, never read as no-pin", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: ["0.3.1"],
      configResult: configNoPin({ version: "not-a-version" }),
      dev: false,
      env: {},
      location: NOT_A_CHECKOUT,
    });
    assert.equal(decision.kind, "refuse");
    assert.equal(decision.refusal.id, "version.pin-malformed");
    assert.equal(branchIdFor(decision), 5);
    assertAnnounced(decision, "branch 5");
    assert.match(decision.refusal.text, /not-a-version/);
  });

  test("branch 6 latest: no --dev and no pin resolves to the highest installed version", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: ["0.2.0", "0.3.1", "0.9.0"],
      configResult: configNoPin({}),
      dev: false,
      env: {},
      location: NOT_A_CHECKOUT,
    });
    assert.equal(decision.kind, "latest");
    assert.equal(decision.version, "0.9.0");
    assert.equal(branchIdFor(decision), 6);
    assertAnnounced(decision, "branch 6");
  });

  test("branch 7 empty-store: no --dev and an empty store refuses, naming the store root", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: [],
      configResult: configAbsent(),
      dev: false,
      env: {},
      location: NOT_A_CHECKOUT,
    });
    assert.equal(decision.kind, "refuse");
    assert.equal(decision.refusal.id, "store.empty");
    assert.equal(branchIdFor(decision), 7);
    assertAnnounced(decision, "branch 7");
  });
});

// ───────────────── PROP-VER-2: every branch announces, none empty ──────────

test("T37: PROP-VER-2: the eight branches' announcements are all non-empty and pairwise distinct", async () => {
  const { resolveVersion } = await import("../lib/resolve-version.mjs");
  const inputs = {
    0: { listing: ["0.3.1"], configResult: configUnreadable(".claude/pdlc.config.json", "bad json"), dev: false, location: NOT_A_CHECKOUT },
    1: { listing: [], configResult: configAbsent(), dev: true, location: MATCHING_CHECKOUT },
    2: { listing: ["0.3.1"], configResult: configAbsent(), dev: true, location: MISMATCHED_CHECKOUT },
    3: { listing: ["0.3.1"], configResult: configNoPin({ version: "0.3.1" }), dev: false, location: NOT_A_CHECKOUT },
    4: { listing: ["0.3.1"], configResult: configNoPin({ version: "9.9.9" }), dev: false, location: NOT_A_CHECKOUT },
    5: { listing: ["0.3.1"], configResult: configNoPin({ version: "not-a-version" }), dev: false, location: NOT_A_CHECKOUT },
    6: { listing: ["0.2.0", "0.9.0"], configResult: configNoPin({}), dev: false, location: NOT_A_CHECKOUT },
    7: { listing: [], configResult: configAbsent(), dev: false, location: NOT_A_CHECKOUT },
  };

  const announcements = new Map();
  for (const [branch, args] of Object.entries(inputs)) {
    const decision = resolveVersion({ ...args, env: {} });
    assert.equal(branchIdFor(decision), Number(branch), `branch ${branch} input landed on a different branch`);
    assertAnnounced(decision, `branch ${branch}`);
    announcements.set(branch, decision.announcement);
  }

  const distinct = new Set(announcements.values());
  assert.equal(distinct.size, announcements.size, `announcements must be pairwise distinct: ${JSON.stringify([...announcements])}`);
});

// ───────── PROP-VER-6/7/8: malformed-vs-missing, checkout opt-in, no silent fallback ─────────

describe("T37: PROP-VER-6, PROP-VER-7, PROP-VER-8", () => {
  test("PROP-VER-6: a malformed pin is distinguishable from a missing one", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const missing = resolveVersion({
      listing: ["0.3.1"],
      configResult: configNoPin({ version: "9.9.9" }),
      dev: false,
      env: {},
      location: NOT_A_CHECKOUT,
    });
    const malformed = resolveVersion({
      listing: ["0.3.1"],
      configResult: configNoPin({ version: "not-a-version" }),
      dev: false,
      env: {},
      location: NOT_A_CHECKOUT,
    });
    assert.notEqual(missing.refusal.id, malformed.refusal.id);
    assert.notEqual(missing.refusal.text, malformed.refusal.text);
  });

  test("PROP-VER-7: a checkout present with no --dev resolves to the released version, not dev mode", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: ["0.2.0", "0.9.0"],
      configResult: configAbsent(),
      dev: false,
      env: {},
      location: MATCHING_CHECKOUT,
    });
    assert.equal(decision.kind, "latest");
    assert.equal(decision.version, "0.9.0");
    assert.notEqual(decision.kind, "dev");
  });

  test("PROP-VER-8: an incomplete --dev declaration never falls back to pin or latest", async () => {
    const { resolveVersion } = await import("../lib/resolve-version.mjs");
    const decision = resolveVersion({
      listing: ["0.3.1"],
      configResult: configNoPin({ version: "0.3.1" }),
      dev: true,
      env: {},
      location: MISMATCHED_CHECKOUT,
    });
    assert.equal(decision.kind, "refuse");
    assert.notEqual(decision.kind, "pin");
    assert.notEqual(decision.kind, "latest");
    assert.equal(decision.refusal.id, "version.dev-incomplete");
  });
});

// ───────── PROP-VER-16: generated inputs do not break the ladder ───────────
//
// Draws over T03's S-7 generators (TE round-1 F-12): `genVersionString()` ×
// `genConfigShape()` feed the store listing and the config read result; a
// literal `--dev` × location cross product is drawn alongside since neither
// generator owns that axis (generator hygiene rule 3: every generated
// member still asserts, this cross product is what keeps the dev/checkout
// branches reachable from the same loop rather than only from the eight
// named fixtures above). Total over branches 0-7, never throws, announcement
// never empty. The seed is printed on failure (generator hygiene rule 1);
// any discovered counter-example is pinned as a named regression case
// immediately below this test (generator hygiene rule 2) — none is pinned
// yet because `lib/resolve-version.mjs` does not exist until T37 and this
// task cannot run the generator against real code.

const RESOLVE_VERSION_SEED = 0x5e57_0207; // arbitrary literal; overridable via PDLC_PROP_SEED
const DRAWS = 200; // bounded per PROPERTIES §1's Hypothesis-style hygiene note

function drawListing(rng) {
  const count = rng.int(0, 4);
  const listing = [];
  for (let i = 0; i < count; i += 1) {
    listing.push(genVersionString(rng, { kind: "well-formed" }).value);
  }
  return listing;
}

function drawLocation(rng) {
  const isCheckout = rng.pick([true, false]);
  const pluginRootMatches = isCheckout && rng.pick([true, false]);
  return makeLocation({ isCheckout, pluginRootMatches });
}

test(`T37: PROP-VER-16: resolveVersion is total and never announces empty over ${DRAWS} generated inputs`, async () => {
  const { resolveVersion } = await import("../lib/resolve-version.mjs");
  const seed = resolveSeed(RESOLVE_VERSION_SEED);
  const rng = seeded(seed);
  let asserted = 0;

  for (let i = 0; i < DRAWS; i += 1) {
    const listing = drawListing(rng);
    const shape = genConfigShape(rng);
    const dev = rng.pick([true, false]);
    const location = drawLocation(rng);

    let decision;
    try {
      decision = resolveVersion({ listing, configResult: shape.result, dev, env: {}, location });
    } catch (err) {
      assert.fail(
        `resolveVersion threw on draw ${i} (seed=${seed}, listing=${JSON.stringify(listing)}, ` +
          `configShape=${shape.kind}, dev=${dev}, location=${JSON.stringify(location)}): ${err.stack}`,
      );
    }

    const failureContext =
      `draw ${i} (seed=${seed}, listing=${JSON.stringify(listing)}, configShape=${shape.kind}, ` +
      `dev=${dev}, location=${JSON.stringify(location)})`;

    assert.ok(["dev", "pin", "latest", "refuse"].includes(decision.kind), `unrecognised kind on ${failureContext}`);
    assert.doesNotThrow(() => branchIdFor(decision), `no valid branch id for ${failureContext}`);
    assertAnnounced(decision, failureContext);
    if (decision.kind === "refuse") {
      assert.equal(typeof decision.refusal.id, "string", `refusal.id must be a string on ${failureContext}`);
    }
    asserted += 1;
  }

  // Generator hygiene rule 3: the loop itself must have run.
  assert.equal(asserted, DRAWS);
});

test("PROP-VER-16 is reproducible: replaying the same seed draws the same generated sequence", () => {
  const seed = resolveSeed(RESOLVE_VERSION_SEED);
  const rngA = seeded(seed);
  const rngB = seeded(seed);
  for (let i = 0; i < 10; i += 1) {
    assert.deepEqual(genConfigShape(rngA), genConfigShape(rngB));
  }
});

// Pinned regression cases (generator hygiene rule 2). Empty at authoring
// time (T07 predates the implementation this generator drives against); a
// counter-example discovered once T37 lands is added here as its own named
// test, not folded silently back into the loop above.
