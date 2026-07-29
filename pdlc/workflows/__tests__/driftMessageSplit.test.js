/**
 * driftMessageSplit.test.js — remediation for CROSS-REVIEW-se-codebase-v1.md F-04.
 *
 * `driftHarness.js`'s `splitStderrLines` was left as its documented T-08a placeholder — a
 * `/\bN-\d+\b/` / `/\bW-\d+\b/` heuristic that never matches any REAL rendered message (none of
 * TSPEC §7.2's `MESSAGES` patterns contain the literal substring "N-7"/"W-5" etc. in their
 * rendered text), so `RunResult.notices`/`.warnings` were always `[]` regardless of what a run
 * actually printed. T-08b (batch 4) was supposed to replace the heuristic with the real
 * `MESSAGES` table but only appended accessors that read `run.stderr` directly
 * (`countOf`/`allOf`/`remediationOf`) — the heuristic itself was left untouched (see the
 * appended section's own note in `driftHarness.js`). This file is the RED/GREEN proof for the
 * actual fix (`driftHarness.js`'s `splitStderrLines`, edited alongside this file).
 *
 * A repo-wide grep (`grep -rn "\.notices\b\|\.warnings\b" __tests__`) at fix time found no
 * assertion anywhere over `run.notices`/`run.warnings` other than `expectHookSilent`'s conjunct
 * 4, which only checks both arrays are `[]` — already true either way for a silent run — so
 * fixing the heuristic does not flip any previously-green assertion red.
 */

import { runScript, countOf, MESSAGES } from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree, setRowState } from "./helpers/driftFixtures.js";
import { itOrSkip } from "./helpers/driftCapabilities.js";

function buildFreshConsumer(consumerSpecExtra = {}) {
  const plugin = makePluginTree();
  const consumer = makeConsumerTree({
    git: true,
    claudeDir: false,
    workflowsDir: true,
    ...consumerSpecExtra,
  });
  return { consumer, plugin };
}

function buildStaleRow() {
  const trees = buildFreshConsumer();
  setRowState(trees, "row-1", "stale");
  setRowState(trees, "row-2", "in-sync");
  return trees;
}

describe("F-04 — splitStderrLines classifies REAL MESSAGES lines, not a substring heuristic", () => {
  itOrSkip(
    "a hook run over an unrecognised PDLC_FAULT token: run.notices carries the real N-7 line",
    "hash",
    ["N-7 is only reachable through a real fault-injected run"],
    () => {
      const { consumer, plugin } = buildFreshConsumer();
      setRowState({ consumer, plugin }, "row-1", "in-sync");
      setRowState({ consumer, plugin }, "row-2", "in-sync");
      try {
        const run = runScript("hook", {
          consumerRoot: consumer.root,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
          fault: ["not-a-real-token"],
        });

        // The real message is present on stderr (sanity check the fixture itself).
        expect(countOf(run.stderr, "N-7")).toBe(1);

        // The bug: the old heuristic tested each stderr line against /\bN-\d+\b/, which never
        // matches the rendered text (`pdlc: unrecognised PDLC_FAULT token "not-a-real-token"; no
        // fault injected.` contains no "N-7" substring at all), so `run.notices` was always [].
        expect(run.notices.length).toBe(1);
        expect(MESSAGES["N-7"].test(run.notices[0])).toBe(true);
        expect(run.warnings).toEqual([]);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    }
  );

  itOrSkip(
    "a hook run over a stale row: run.warnings carries the real W-5 line",
    "hash",
    ["W-5 needs a real stale row to render"],
    () => {
      const trees = buildStaleRow();
      try {
        const run = runScript("hook", {
          consumerRoot: trees.consumer.root,
          home: trees.consumer.home,
          pluginRoot: trees.plugin.pluginRoot,
        });

        expect(countOf(run.stderr, "W-5")).toBeGreaterThanOrEqual(1);

        // Same bug, the W-* side: no rendered W-5 line contains the substring "W-5" either.
        expect(run.warnings.length).toBeGreaterThanOrEqual(1);
        expect(run.warnings.every((line) => MESSAGES["W-5"].test(line))).toBe(true);
        expect(run.notices).toEqual([]);
      } finally {
        trees.consumer.cleanup();
        trees.plugin.cleanup();
      }
    }
  );

  it("a silent, fully in-sync hook run: both notices and warnings are []", () => {
    const trees = buildFreshConsumer();
    setRowState(trees, "row-1", "in-sync");
    setRowState(trees, "row-2", "in-sync");
    try {
      const run = runScript("hook", {
        consumerRoot: trees.consumer.root,
        home: trees.consumer.home,
        pluginRoot: trees.plugin.pluginRoot,
      });
      expect(run.stderr).toBe("");
      expect(run.notices).toEqual([]);
      expect(run.warnings).toEqual([]);
    } finally {
      trees.consumer.cleanup();
      trees.plugin.cleanup();
    }
  });
});
