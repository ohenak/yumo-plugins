// loopEconomicsPreflight.test.js — PLAN T-00 (batch 1, no deps).
//
// Pre-flight gate for the pdlc-loop-economics feature. PLAN §5 notes: "T-00
// gates every green. It asserts only the *existence* of HEAD symbols; it
// never asserts anything about shapes this feature creates." If any of the
// seven HEAD symbols this feature builds on (TSPEC §5–§8, §10) is missing or
// unimportable, every downstream red task (T-04…T-09) would fail for a stale
// baseline reason indistinguishable from that task's own bug — this file
// exists so that failure surfaces here, at batch 1, instead.
//
// This task creates no production code and asserts no new shape.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEV_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-dev.js"), "utf8");

// ---------------------------------------------------------------------------
// orchestrate-dev.js — six exported HEAD symbols, resolved import.
// ---------------------------------------------------------------------------

describe("T-00 BL-PREREQ: orchestrate-dev.js exported HEAD symbols", () => {
  test.each([
    "parseLearningsConfig",
    "readLearningsConfigSafely",
    "parseConfirmationFindings",
    "deriveRoundWindow",
    "dodVerifyLoop",
    "defaultListFiles",
  ])("%s is exported and callable", (name) => {
    expect(typeof devModule[name]).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// appendApprovalAnchors — module-private (not in orchestrate-dev.js's export
// surface; TSPEC §5.1 notes it is the "sole writer" of the anchor block but
// reached only through exported call sites such as reviewLoop). T-00 pins its
// existence as source text, the same pattern consolidationPreflight.test.js
// (T00, pdlc-consolidation-agent) uses for non-exported symbols.
// ---------------------------------------------------------------------------

describe("T-00 BL-PREREQ: appendApprovalAnchors present as module-private source text", () => {
  test("declared as an async function in orchestrate-dev.js", () => {
    expect(DEV_SOURCE).toMatch(/\basync function appendApprovalAnchors\s*\(/);
  });

  test("not part of the module's exported surface (module-private, per TSPEC §5.1)", () => {
    expect(devModule.appendApprovalAnchors).toBeUndefined();
  });
});
