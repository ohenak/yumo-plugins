// The sibling of `spine-probe-a.test.js`. See that file's header for the full
// rationale — this one is deliberately a SEPARATE process (node --test gives
// each test file its own child), so a `pid.jsonl` collision here would mean
// the two probes landed in the same OS process, which §7.0 says never
// happens, rather than proving inheritance across processes.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";

const PROBE_ID = "b";

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
