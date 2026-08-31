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
// RED at landing (T-20): no enumeration names `lib/stats.mjs` yet — that
// lands across batch 10: `prepack.mjs`'s `MODULE_NAMES` in T-21,
// `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS` in T-22, and
// `publish-preflight.mjs`'s / `fixture-machine.mjs`'s enumerations together
// in T-25. Per SKILLS.md SKIPS, each membership oracle below is committed
// `test.skip`, titled with its owning task's id — un-skip exactly that
// block when its task lands, run it, and confirm it fails for the right
// reason (a real assertion mismatch, not a missing export) before editing
// the enumeration.
//
// The derived-size invariant is NOT membership-dependent — it holds today
// (4 + 1 === 5) and must keep holding after batch 10 (5 + 1 === 6), so it
// runs unskipped from T-20 onward and is exactly the regression detector
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
  test.skip("T-21: lib/stats.mjs is a member of prepack.mjs's MODULE_NAMES (TSPEC §2.1/§6.4)", () => {
    assert.ok(
      MODULE_NAMES.includes("lib/stats.mjs"),
      "prepack.mjs's MODULE_NAMES must copy lib/stats.mjs into vendor/workflows/ at pack time",
    );
  });

  test.skip("T-22: vendor/workflows/lib/stats.mjs is a member of _tspec-packed-set.mjs's WORKFLOW_MEMBERS (TSPEC §2.1/§6.4)", () => {
    assert.ok(
      PACKED_SET_WORKFLOW_MEMBERS.includes("vendor/workflows/lib/stats.mjs"),
      "_tspec-packed-set.mjs's WORKFLOW_MEMBERS must list vendor/workflows/lib/stats.mjs",
    );
  });

  test.skip("T-25: vendor/workflows/lib/stats.mjs is a member of publish-preflight.mjs's WORKFLOW_MEMBERS (TSPEC §2.1/§6.4)", () => {
    assert.ok(
      PREFLIGHT_WORKFLOW_MEMBERS.includes("vendor/workflows/lib/stats.mjs"),
      "publish-preflight.mjs's WORKFLOW_MEMBERS must list vendor/workflows/lib/stats.mjs",
    );
  });

  test.skip("T-25: lib/stats.mjs is a member of fixture-machine.mjs's WORKFLOW_MODULE_NAMES (TSPEC §2.1/§6.4)", () => {
    assert.ok(
      WORKFLOW_MODULE_NAMES.includes("lib/stats.mjs"),
      "fixture-machine.mjs's WORKFLOW_MODULE_NAMES must list lib/stats.mjs",
    );
  });
});
