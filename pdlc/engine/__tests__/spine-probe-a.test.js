// One of two deliberately separate test files that together prove §7.0's
// cross-process inheritance mechanism (PROP-SUITE-4, TSPEC §7.0). This file's
// only job is to append ONE observation record to the run's per-pid file,
// inheriting `PDLC_TEST_RUN_DIR` the way every ordinary test-file process
// does — never minting its own. `suite-spine.test.js` is the file that
// spawns a suite containing this probe (and its sibling `spine-probe-b`) and
// asserts BOTH records land in ONE run directory.
//
// This file therefore fails loudly, not silently, when run outside that
// harness (e.g. via a bare `node --test` with no runner in front of it) —
// exactly the failure mode §7.0 requires of the real bootstrap.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";

const PROBE_ID = "a";

test(`spine-probe-${PROBE_ID}: appends one observation record to the inherited run dir`, () => {
  const dir = process.env.PDLC_TEST_RUN_DIR;
  assert.ok(
    dir,
    "PDLC_TEST_RUN_DIR must be inherited from the suite runner's environment " +
      "(TSPEC §7.0) — a probe run without it proves nothing about inheritance",
  );

  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${process.pid}.jsonl`);
  const record = { kind: "spine-probe", probe: PROBE_ID, pid: process.pid };
  appendFileSync(file, `${JSON.stringify(record)}\n`);

  assert.ok(existsSync(file), "the record file must exist immediately after the append");
});
