// Purpose-named carrier for TSPEC §4.4/§5.1's example-config expectation (PLAN A6-04).
//
// This file is deliberately its own file, not a section inside `ci-arrangement.test.js`.
// `ci-arrangement.test.js` declares a single oracle in its own header — FSPEC §5.1's CI
// arrangement (pr-tests.yml job-name expansion / publish.yml PR-gate command set-equality) —
// and its one existing `.claude/pdlc.config.example.json` assertion (`implementation.testCommand`)
// is annotated in-file as unrelated to that §5.1 oracle. Hanging a config-schema assertion off
// that file would let an unrelated config-example edit redden the delivery-blocking
// `Engine tests (ubuntu-latest)` check under a file whose stated scope names no such concern.
//
// What this asserts (TSPEC §4.4): `.claude/pdlc.config.example.json` parses, and its `advisory`
// section carries `enabled` and `waveBudgetPerRun`, the latter a non-negative integer. At HEAD
// the example carries no `advisory` section at all, so this is expected RED until the example
// gains it.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const configPath = path.join(repoRoot, ".claude", "pdlc.config.example.json");

test("advisory config example — advisory section parses and carries a non-negative waveBudgetPerRun", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const advisory = config?.advisory;

  assert.equal(
    typeof advisory,
    "object",
    "pdlc.config.example.json must carry an `advisory` section (TSPEC §4.4) so it is discoverable " +
      "at an operator's first, possibly only, encounter with the key while the tier ships off"
  );
  assert.notEqual(advisory, null, "advisory section must not be null");

  assert.equal(
    typeof advisory.enabled,
    "boolean",
    "advisory.enabled must be present and boolean"
  );

  const { waveBudgetPerRun } = advisory;
  assert.equal(
    typeof waveBudgetPerRun,
    "number",
    "advisory.waveBudgetPerRun must be present and a number"
  );
  assert.ok(
    Number.isInteger(waveBudgetPerRun),
    "advisory.waveBudgetPerRun must be an integer"
  );
  assert.ok(
    waveBudgetPerRun >= 0,
    "advisory.waveBudgetPerRun must be non-negative (0 is a legal configured value, E-33)"
  );
});
