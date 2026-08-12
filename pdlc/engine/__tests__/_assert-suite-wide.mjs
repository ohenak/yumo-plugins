// _assert-suite-wide.mjs — suite-wide assertion step (TSPEC §7.0/§7.4, PLAN
// T03 -> T19). Minimum implementation to satisfy `assert-suite-wide.test.js`
// (T03's own acceptance test): reads the union of every `.jsonl` file under
// `${PDLC_TEST_RUN_DIR}`, fails closed on a missing/empty run dir or an empty
// union (PROP-FAIL-4, PROP-SUITE-6), and checks the two rows in scope for
// this increment (§7.4 table rows 1-2, AT-ENG-61, AT-ENG-33):
//   - message-catalogue row: emitted ids set-equal `messageIds()`.
//   - outcome-taxonomy row: every recorded classification is a member of
//     `OUTCOMES` (forward direction only).
// The model-map and dispatchable-skills rows, and the spine self-assertion,
// are out of scope for this file (see the test file's header comment).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { messageIds } from "../lib/catalogue.mjs";
import { OUTCOMES } from "../lib/outcome.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function fail(message) {
  console.error(`assert-suite-wide: ${message}`);
  process.exitCode = 1;
}

function main() {
  const runDir = process.env.PDLC_TEST_RUN_DIR;
  if (!runDir || !existsSync(runDir)) {
    fail(`run dir missing on disk: ${runDir ?? "(unset)"}`);
    return;
  }

  const jsonlFiles = readdirSync(runDir).filter((name) => name.endsWith(".jsonl"));

  const records = [];
  for (const name of jsonlFiles) {
    const text = readFileSync(path.join(runDir, name), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      records.push(JSON.parse(trimmed));
    }
  }

  if (records.length === 0) {
    fail(`no records found under ${runDir} (empty union)`);
    return;
  }

  // ─── message-catalogue row (§7.4 row 1, AT-ENG-61) ─────────────────────
  const registeredIds = new Set(messageIds());
  const emittedIds = new Set(
    records.filter((r) => r.kind === "message-id").map((r) => r.id)
  );

  for (const id of emittedIds) {
    if (!registeredIds.has(id)) {
      fail(`emitted message id "${id}" is not registered in messageIds()`);
    }
  }
  for (const id of registeredIds) {
    if (!emittedIds.has(id)) {
      fail(`registered message id "${id}" was never emitted`);
    }
  }

  // ─── outcome-taxonomy row (§7.4 row 2, AT-ENG-33) — forward only ───────
  const validOutcomes = new Set(OUTCOMES);
  const emittedOutcomes = records
    .filter((r) => r.kind === "outcome")
    .map((r) => r.value);

  for (const value of emittedOutcomes) {
    if (!validOutcomes.has(value)) {
      fail(`recorded outcome "${value}" is not a member of OUTCOMES`);
    }
  }
}

main();
process.exit(process.exitCode ?? 0);
