/**
 * completeness.test.js — TSPEC §5.9 (`isComplete(artifactClass, docType, fileText)`, the four
 * wrapped artifact classes and the six spec-class heading tables), FSPEC AT-59 / AT-60 / AT-62
 * (§16.2, §16.3), and PROPERTIES `PROP-COMPLETE-01` (the exact required set, falsifiable in
 * both directions — TSPEC §8.2, PLAN §7.2).
 *
 * RED-terminal (Phase I, batch 4, PLAN RLH-12). Neither `isComplete` (§5.9) nor `isTerminal`
 * (§5.6.2) exists at this batch:
 *
 *   - `isComplete`  is written by **RLH-16** (batch 6) — greens `RLH-AT-60`, `RLH-AT-62` and
 *                   `PROP-COMPLETE-01`.
 *   - `isTerminal`  is written by **RLH-23** (batch 7) — greens `RLH-AT-59`, which therefore
 *                   stays red for one batch after RLH-16 lands, exactly as PLAN §7.3's ledger
 *                   requires ("`RLH-AT-59` | green from batch 7 | permitted red batches 4–6").
 *
 * Every assertion below fails on **its own oracle** — the subject is `undefined` — not on a
 * module-parse error. The import is a **namespace** import for that reason: a named ESM import
 * of a missing export is a link-time `SyntaxError`, and a suite that fails to *run* is not a
 * valid red (PLAN §12.1 step 1).
 *
 * File ownership (PLAN §5.3, single-writer-per-file): RLH-12 owns this file and every fixture
 * under `__tests__/fixtures/completeness/`. `__tests__/helpers/driftGenerators.js` is consumed
 * **unmodified** (PLAN §7.2, §5.2): it supplies the primitives (`seeded`, `resolveSeed`,
 * `shrink`) and the D4 heading-set *domain* generator below is file-local and unexported. No
 * second primitive library is written.
 *
 * ── Fixture provenance (PLAN §10.2, PROPERTIES §6.4) ────────────────────────────────────────
 *
 * `fixtures/completeness/cross-review-template.md` is a **byte-verbatim** copy of the
 * `## Cross-Review File Format` template block of `pdlc/skills/se-review/SKILL.md` (the fenced
 * `markdown` block, lines 146–178 at HEAD `6561c0a`, i.e. as the SKILL reads at the end of
 * batch 3, after RLH-07). `cross-review-duplicated-verdict.md` and
 * `cross-review-quoted-verdict.md` are that template with its `{…}` / `<verdict-value>`
 * placeholders filled and with AT-59's / AT-60's own defect introduced; the quoted block in the
 * latter is likewise copied verbatim from that SKILL's own trailing `## Verdict` grammar
 * example (lines 226–231).
 *
 * The three `tspec-*.md` fixtures are **not** copied from a SKILL, and that is a measured fact
 * rather than an omission: at HEAD **no author SKILL declares a spec-class top-level heading
 * template** — that is precisely TSPEC §10.2 **Q-09**, carried and bound to QUEUE.md Order 9.
 * Their heading sets are therefore taken from TSPEC §5.9's own per-class table, and their
 * *shape* (a skeleton of every required `##` heading with empty bodies) from the Authoring
 * Pacing Contract's "Skeleton first" clause, which every author SKILL does carry at HEAD.
 *
 * This copy is a **point-in-time snapshot and detects no later SKILL edit whatever** (PLAN
 * §10.2, PROPERTIES §6.4). No drift detector is built here, and none is added as a bonus:
 * PLAN §11.3 `H-j` binds that work to QUEUE.md Order 9.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { seeded, resolveSeed, shrink } from "./helpers/driftGenerators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_DIR = join(__dirname, "fixtures", "completeness");

/** Reads a byte-exact fixture (PROPERTIES §6.3 — never reformatted, never re-indented). */
function readFixture(name) {
  return readFileSync(join(FIXTURE_DIR, name), "utf8");
}

// ─────────────────────── the artifact-class catalogue (TSPEC §5.9) ───────────────────────
//
// §5.9 names four wrapped classes in prose but pins no literal for `isComplete`'s first
// argument, and §3.7's signature line does not either. These are the literals this suite
// drives, and therefore the literals **RLH-16 must accept**; they are the kebab-cased forms of
// §5.9's own four row labels. Declared as one frozen catalogue rather than sprinkled inline so
// a later correction is a one-line change (PROPERTIES §6.5 — cite, never retype).
const CLASS_SPEC = "spec";
const CLASS_CROSS_REVIEW = "cross-review";

// The greenfield mode literal. §5.6.2's `isTerminal` branches on `mode !== "revision"`, and
// §5.6.1's `selectMode` returns `"authoring" | "revision"`.
const MODE_GREENFIELD = "authoring";

// ─────────────────── the trailing `## Verdict` locator (TSPEC §5.1 step 1) ───────────────────
//
// `isComplete`'s cross-review criterion is stated over the **trailing** `## Verdict` section,
// located under §1.2 rule 5's fenced-region exclusion. `scanLines` already ships (RLH-05 (c),
// batch 3), so this suite locates the section with the production scanner rather than with a
// second, re-implemented one — a private regex walk here would let a fixture pass this file and
// fail the subject for reasons neither reports.

const VERDICT_HEADING = /^\s*##\s+Verdict\s*$/;
const isVerdictField = (line) => line.trim().startsWith("VERDICT: ");

/**
 * Returns `{ headingIndex, lines, fieldCount }` for the LAST unfenced `## Verdict` heading.
 * `lines` are the section's own unfenced lines (heading excluded); `fieldCount` is §5.1 step
 * 2's duplicate pre-count over them. `headingIndex` is -1 when there is no such section.
 */
function trailingVerdictSection(text) {
  const visited = [];
  devModule.scanLines(text, (line, index) => visited.push({ line, index }));

  let headingAt = -1;
  for (const v of visited) {
    if (VERDICT_HEADING.test(v.line)) headingAt = v.index;
  }
  if (headingAt === -1) return { headingIndex: -1, lines: [], fieldCount: 0 };

  const lines = visited.filter((v) => v.index > headingAt).map((v) => v.line);
  return { headingIndex: headingAt, lines, fieldCount: lines.filter(isVerdictField).length };
}

/** The whole-file `VERDICT: ` count — the count §16.3 says is **never consulted** (AT-60). */
function wholeFileFieldCount(text) {
  return text.split("\n").filter(isVerdictField).length;
}
