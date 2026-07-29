/**
 * skipSinkTeardown.js — jest `globalTeardown`. This is where the "zero unexpected skips"
 * comparator actually binds: it runs once, at end of run, in the main jest process, over the
 * records every worker appended to the run-scoped sink. A throw here fails the run.
 *
 * See `skipSink.js` for the comparator's domain (skips registered through
 * `describeOrSkip`/`itOrSkip`, not every skip jest reports) and its three clauses.
 */

import { rmSync } from "fs";
import { dirname } from "path";
import { SKIP_INVENTORY } from "./driftCapabilities.js";
import { readSkipRecords, skipSinkPath, validateSkipRecords } from "./skipSink.js";

export default function teardownSkipSink() {
  const path = skipSinkPath();
  const { records, malformedLines } = readSkipRecords(path);
  const violations = validateSkipRecords(records, SKIP_INVENTORY);
  for (const line of malformedLines) {
    violations.push(`unparseable skip-sink line: ${line}`);
  }

  // Clean up the sink before reporting, so a failure never leaves a temp dir behind.
  const dir = globalThis.__PDLC_SKIP_SINK_DIR__ || (path ? dirname(path) : null);
  if (dir) rmSync(dir, { recursive: true, force: true });

  if (violations.length > 0) {
    throw new Error(
      `pdlc-test: skip-inventory comparator failed (${violations.length} violation(s)) — ` +
        "TSPEC §1.3 / PROPERTIES §11.1's named uid-0 skip inventory\n  - " +
        violations.join("\n  - ")
    );
  }
}
