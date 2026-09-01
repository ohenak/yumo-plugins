// Vendoring co-change oracle (TSPEC §6.4, "Vendoring co-change" row) — PLAN
// T-20 (pdlc-stats).
//
// §2.1 names ten sites that must move together whenever a new
// `pdlc/workflows/lib/` module needs to reach an installed engine. This file
// covers four of those ten directly:
//
//   - `pdlc/engine/scripts/prepack.mjs`'s          `MODULE_NAMES`
//   - `pdlc/engine/__tests__/_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`
//   - `pdlc/engine/scripts/publish-preflight.mjs`'s   `WORKFLOW_MEMBERS`
//   - `pdlc/engine/scripts/fixture-machine.mjs`'s     `WORKFLOW_MODULE_NAMES`
//
// plus the derived-not-transcribed invariant: `_tspec-packed-set.mjs`'s
// vendored class size (`WORKFLOW_MEMBERS.length`) equals
// `MODULE_NAMES.length + 1` — the `+ 1` is `VENDOR-MANIFEST.json`, which
// `runPrepack` writes rather than copies and so never appears in
// `MODULE_NAMES` (TSPEC §6.4, "The vendoring oracle's invariant is `+ 1`,
// not equality" paragraph).
//
// All four enumerations name `lib/stats.mjs` (or its vendored
// `vendor/workflows/lib/stats.mjs` spelling), and the membership oracles
// below pin that: drop the module from any one of the four and exactly that
// oracle goes red, which is the whole point of the co-change row.
//
// The derived-size invariant is NOT membership-dependent — it holds across
// every change to the vendored set, and is exactly the regression detector
// `pdlc-loop-economics` LEARNINGS F-4 asks for: a hand-written literal that
// drifts from the enumeration it was transcribed from.

import test, { describe } from "node:test";
import assert from "node:assert/strict";

import { MODULE_NAMES } from "../scripts/prepack.mjs";
import { WORKFLOW_MEMBERS as PACKED_SET_WORKFLOW_MEMBERS } from "./_tspec-packed-set.mjs";
import { WORKFLOW_MEMBERS as PREFLIGHT_WORKFLOW_MEMBERS } from "../scripts/publish-preflight.mjs";
import { WORKFLOW_MODULE_NAMES } from "../scripts/fixture-machine.mjs";

describe("vendored class size is derived from MODULE_NAMES, not transcribed (TSPEC §6.4)", () => {
  test("_tspec-packed-set.mjs's WORKFLOW_MEMBERS.length === prepack.mjs's MODULE_NAMES.length + 1", () => {
    // The `+ 1` is VENDOR-MANIFEST.json (written by runPrepack, never
    // copied, so it has no MODULE_NAMES entry) — TSPEC §6.4.
    assert.equal(PACKED_SET_WORKFLOW_MEMBERS.length, MODULE_NAMES.length + 1);
  });
});

describe("lib/stats.mjs membership, owned by batch 10", () => {
  test("T-21: lib/stats.mjs is a member of prepack.mjs's MODULE_NAMES (TSPEC §2.1/§6.4)", () => {
    assert.ok(
      MODULE_NAMES.includes("lib/stats.mjs"),
      "prepack.mjs's MODULE_NAMES must copy lib/stats.mjs into vendor/workflows/ at pack time",
    );
  });

  test("T-22: vendor/workflows/lib/stats.mjs is a member of _tspec-packed-set.mjs's WORKFLOW_MEMBERS (TSPEC §2.1/§6.4)", () => {
    assert.ok(
      PACKED_SET_WORKFLOW_MEMBERS.includes("vendor/workflows/lib/stats.mjs"),
      "_tspec-packed-set.mjs's WORKFLOW_MEMBERS must list vendor/workflows/lib/stats.mjs",
    );
  });

  test("T-25: vendor/workflows/lib/stats.mjs is a member of publish-preflight.mjs's WORKFLOW_MEMBERS (TSPEC §2.1/§6.4)", () => {
    assert.ok(
      PREFLIGHT_WORKFLOW_MEMBERS.includes("vendor/workflows/lib/stats.mjs"),
      "publish-preflight.mjs's WORKFLOW_MEMBERS must list vendor/workflows/lib/stats.mjs",
    );
  });

  test("T-25: lib/stats.mjs is a member of fixture-machine.mjs's WORKFLOW_MODULE_NAMES (TSPEC §2.1/§6.4)", () => {
    assert.ok(
      WORKFLOW_MODULE_NAMES.includes("lib/stats.mjs"),
      "fixture-machine.mjs's WORKFLOW_MODULE_NAMES must list lib/stats.mjs",
    );
  });
});
