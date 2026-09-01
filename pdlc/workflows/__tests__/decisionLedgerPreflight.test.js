// decisionLedgerPreflight.test.js — PLAN T-00 (batch 1, no deps).
//
// Pre-flight gate: assert the eight HEAD symbols this feature
// (pdlc-decision-ledger) builds on in `pdlc/workflows/orchestrate-dev.js`
// are importable, plus `runCaptureScript` from the repo-root
// `scripts/capture-learnings-baseline.mjs` harness this feature reuses
// unchanged (TSPEC §7.4). Existence only — this test asserts nothing
// about the shapes this feature creates, and must pass at HEAD before
// any decision-ledger production code exists.

import * as devModule from "../orchestrate-dev.js";
import * as captureModule from "../../../scripts/capture-learnings-baseline.mjs";

describe("T-00 — decision-ledger baseline symbols exist at HEAD", () => {
  test.each([
    ["parseLearningsConfig", devModule],
    ["readLearningsConfigSafely", devModule],
    ["parsePinCheckConfig", devModule],
    ["parseDerivativeStopConfig", devModule],
    ["LEARNINGS_CORPUS_ARGV", devModule],
    ["gatherLearningsCorpus", devModule],
    ["renderLearningsBlock", devModule],
    ["reviewLoop", devModule],
    ["runCaptureScript", captureModule],
  ])("%s is exported and importable", (name, mod) => {
    expect(mod[name]).toBeDefined();
  });
});
