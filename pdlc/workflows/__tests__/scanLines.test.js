/**
 * scanLines.test.js — TSPEC §5.0 (`scanLines(text, visit)`, the one fenced-region-aware
 * scanner), FSPEC AT-65 / AT-66 (§1.2 rule 5, both directions plus the unclosed fence), and
 * PROPERTIES `PROP-SCAN-01` (totality and partition, TSPEC §8.2).
 *
 * RED-terminal (Phase I, batch 2, PLAN RLH-03). `scanLines` is written by **RLH-05 (c)** in
 * batch 3, in `pdlc/workflows/orchestrate-dev.js`. It does not exist at this batch, so
 * `devModule.scanLines` is `undefined` and every assertion below fails on that one oracle —
 * the subject does not exist yet. PLAN §7.3: `RLH-AT-65`, `RLH-AT-66` and the `scanLines`
 * property are **green from batch 3, permitted red at batch 2 only**.
 *
 * The import is a **namespace** import on purpose. A named ESM import of an export that does
 * not exist is a link-time `SyntaxError` in Node, which would make this suite fail to *run* —
 * and a suite that fails to run is not a valid red (PLAN §12.1 step 1).
 *
 * File ownership (PLAN, single-writer-per-file): RLH-03 owns this file and the three fixtures
 * under `__tests__/fixtures/cross-reviews/`. `__tests__/helpers/driftGenerators.js` is
 * consumed **unmodified** (PLAN §7.2): it supplies the primitives (`seeded`, `resolveSeed`,
 * `shrink`) and the D2 fenced-markdown *domain* generator below is file-local and unexported,
 * exactly as §7.2 requires. No second primitive library is written.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { seeded, resolveSeed, shrink } from "./helpers/driftGenerators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_DIR = join(__dirname, "fixtures", "cross-reviews");

/** Reads a byte-exact fixture (PROPERTIES §6.3 — never reformatted). */
function readFixture(name) {
  return readFileSync(join(FIXTURE_DIR, name), "utf8");
}

/**
 * Drives `scanLines` with a recording visitor and returns the observation set.
 *
 * At batch 2 this throws `TypeError: devModule.scanLines is not a function`, which is this
 * file's single permitted red oracle. It is deliberately **not** guarded: swallowing the
 * absence would turn the red into a vacuous green.
 */
function observe(text) {
  const visited = [];
  devModule.scanLines(text, (line, index) => {
    visited.push({ line, index });
  });
  return visited;
}

/** The lines the visitor actually saw, in visit order. */
function visitedLines(text) {
  return observe(text).map((v) => v.line);
}
