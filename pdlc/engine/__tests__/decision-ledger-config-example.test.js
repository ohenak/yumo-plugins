// Purpose-named carrier for FSPEC Q-3 / TSPEC §5.3's example-config disclosure expectation
// (feature `pdlc-decision-ledger`).
//
// Its own file, for the same reason `advisory-config-example.test.js`,
// `learnings-config-example.test.js` and `loop-config-example.test.js` are their own files: a
// config-schema assertion hung off `ci-arrangement.test.js` would let an unrelated config-example
// edit redden the delivery-blocking `Engine tests (ubuntu-latest)` check under a file whose stated
// scope names no such concern.
//
// What this asserts:
//   1. `.claude/pdlc.config.example.json` parses, and its top-level section set CONTAINS
//      `decisionLedger` (containment, not set-equality — the file is shared with the eight blocks
//      already shipped: `dispatch`, `advisory`, `implementation`, `learningsInjection`, `cascade`,
//      `review`, `loop`, `merge`).
//   2. `decisionLedger`'s own key->value map is asserted by SET-EQUALITY against a literal
//      transcription of C-5's three declared keys and defaults — a fourth key or a different
//      spelling fails.
//
// The literal below is transcribed by hand, not imported from `DECISION_LEDGER_DEFAULTS`, for the
// same stated reason `loop-config-example.test.js` transcribes `MERGE_DEFAULTS`: the example is
// checked against the documented shape rather than agreeing with the code by construction.
//
// T-12 (this file) landed `[red]` in a wave gated apart from its `[green]` implementation task
// T-19 (PLAN): every block was committed `test.skip`, titled "T-19: ...", run un-skipped first and
// observed to fail for the right reason (missing `decisionLedger` section), then re-skipped so the
// wave gate stayed green until T-19. T-19 un-skips these three blocks now that
// `.claude/pdlc.config.example.json` carries the `decisionLedger` section.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const configPath = path.join(repoRoot, ".claude", "pdlc.config.example.json");

// C-5, transcribed literally (TSPEC §5.3) — not imported from `DECISION_LEDGER_DEFAULTS`.
const DECISION_LEDGER_EXAMPLE_DEFAULTS = {
  enabled: false,
  maxEntries: 70,
  maxBytes: 12500,
};

function readConfig() {
  return JSON.parse(readFileSync(configPath, "utf8"));
}

test("T-19: decision ledger config example — top-level section set contains the existing eight blocks plus decisionLedger", () => {
  const config = readConfig();
  const sections = Object.keys(config);

  for (const existing of [
    "dispatch",
    "advisory",
    "implementation",
    "learningsInjection",
    "cascade",
    "review",
    "loop",
    "merge",
  ]) {
    assert.ok(
      sections.includes(existing),
      `pdlc.config.example.json must still carry the pre-existing \`${existing}\` section ` +
        "(this file is shared across features — containment, not set-equality)"
    );
  }

  assert.ok(
    sections.includes("decisionLedger"),
    "pdlc.config.example.json must carry a `decisionLedger` section (FSPEC Q-3 / TSPEC §5.3): " +
      "the example file is where an operator discovers the decision ledger's configurable flag " +
      "and thresholds"
  );
});

test("T-19: decision ledger config example — decisionLedger section's key set equals C-5's three declared keys", () => {
  const config = readConfig();
  const decisionLedger = config?.decisionLedger;

  assert.equal(typeof decisionLedger, "object", "decisionLedger section must be present and an object");
  assert.notEqual(decisionLedger, null, "decisionLedger section must not be null");

  assert.deepEqual(
    Object.keys(decisionLedger).sort(),
    Object.keys(DECISION_LEDGER_EXAMPLE_DEFAULTS).sort(),
    "the example must disclose exactly C-5's three declared keys — no more, no fewer, so a " +
      "fourth key or a different spelling fails"
  );
});

test("T-19: decision ledger config example — every decisionLedger value equals C-5's literal declared default", () => {
  const config = readConfig();
  const decisionLedger = config?.decisionLedger ?? {};

  assert.equal(
    decisionLedger.enabled,
    DECISION_LEDGER_EXAMPLE_DEFAULTS.enabled,
    "decisionLedger.enabled must equal C-5's declared default false"
  );
  assert.equal(
    decisionLedger.maxEntries,
    DECISION_LEDGER_EXAMPLE_DEFAULTS.maxEntries,
    "decisionLedger.maxEntries must equal C-5's declared default 70"
  );
  assert.equal(
    decisionLedger.maxBytes,
    DECISION_LEDGER_EXAMPLE_DEFAULTS.maxBytes,
    "decisionLedger.maxBytes must equal C-5's declared default 12500"
  );
});
