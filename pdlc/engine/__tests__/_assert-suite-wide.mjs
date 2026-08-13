// _assert-suite-wide.mjs — the suite-wide assertion step (TSPEC §7.0/§7.4, PLAN
// T03 -> T19 -> T52). Runs as step 4 of `_run-suite.mjs`, after `node --test`
// has exited 0: reads the union of every `.jsonl` file under
// `${PDLC_TEST_RUN_DIR}`, fails closed on a missing/empty run dir or an empty
// union (PROP-FAIL-4, PROP-SUITE-6), and checks all FIVE rows of TSPEC §7.4's
// property table. The module ENUMERATES those five (`SUITE_WIDE_ROWS` below)
// and fails if the enumeration and the implemented checks ever disagree, so a
// row that goes missing is itself detectable rather than silently absent (PLAN
// §8's "the module enumerates the same five things the table does"):
//
//   1. message catalogue (§3.5)   — emitted ids ≡ `messageIds()`, both directions.
//   2. outcome taxonomy (§5.1)    — observed ⊆ `OUTCOMES` (forward only; the
//      reverse direction is `outcome.test.js`'s PROP-FAIL-3, unit-scoped).
//   3. pinned model map (§4.1, AC-3.3) — over the recorded dispatch settlement
//      lines carrying `corpusRun != null`: every recorded model value appears in
//      M-ENG-07's model column, AND each of M-ENG-07's seven rows is witnessed
//      by ≥1 descriptor, per §7.4's witness table.
//   4. dispatchable skills (§3.3) — not an accumulator: computed once from
//      imported data, set-equal to §3.3's derived ten-identifier table, both
//      directions.
//   5. pre-phase window (§4.1)    — no record with `corpusRun != null` has
//      `phase === null`. Rides the model-map accumulator; the reader-facing
//      gloss is `byPhase["(no phase)"]` being absent from a corpus run's report.
//
// Every check is a pure function over its inputs, exported so
// `corpus-model-map.test.js` can drive each row's pass AND fail case directly
// (row 4 has no run-dir population that can falsify it — it reads imported
// data, not records — so import-driving is the only way it gets a falsifier at
// all). `main()` runs only when this file is executed as a script, never on
// import.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { messageIds } from "../lib/catalogue.mjs";
import { OUTCOMES } from "../lib/outcome.mjs";
import {
  ADVISORY_RUNG_SKILL,
  DISPATCHABLE_SKILLS as DEV_SKILLS,
} from "../../workflows/orchestrate-dev.js";
import { DISPATCHABLE_SKILLS as QUEUE_SKILLS } from "../../workflows/orchestrate-queue.js";

// ─── §7.4's property table, enumerated ──────────────────────────────────────

export const SUITE_WIDE_ROWS = Object.freeze([
  "message-catalogue",
  "outcome-taxonomy",
  "pinned-model-map",
  "dispatchable-skills",
  "pre-phase-window",
]);

// ─── M-ENG-07's model map, TRANSCRIBED (never imported) ─────────────────────
//
// `docs/_constraints/pdlc-engine-baseline.md:130-135`. Importing the modules'
// own model constants would make drift between them and the pinned map
// invisible — which is the exact failure AC-3.3's set-equality exists to catch
// (§7.4). The witness predicates below are §7.4's witness table, likewise
// transcribed: each reads only recorded descriptor fields, and each is scoped
// to the one corpus run M-ENG-07's "Corpus run" column names.

/** §7.4: rows 1/2 partition on the Phase-I WAVE SET, not on the normalised phase
 * string — Phase I's V-wave is announced as "Phase PT: PROPERTIES Tests (Phase I
 * V-wave)" (`orchestrate-dev.js:10248`) and so normalises to "Phase PT", while it
 * is pinned on MODEL_IMPLEMENTATION (`:10253`). */
export function inWaveSet(r) {
  return r.phase === "Phase I" || (r.phase === "Phase PT" && r.skill === "se-implement");
}

// Row 4's forced failure, transcribed from the fixture that injects it
// (`_corpus.mjs`'s `makeAdvisoryTransport`, `fableOutcome: "throw"`), not
// imported from `MODEL_ERROR_RE` — a test that imports the module's own regex
// agrees with the module by construction (§7.4).
const ROW_4_INJECTED_ERROR = 'unrecognised model "fable"';

const REVIEWER_SKILLS = new Set(["se-review", "pm-review", "te-review"]);

export const M_ENG_07 = Object.freeze([
  {
    row: 1,
    site: "every phase except Phase I (MODEL_DEFAULT)",
    model: "opus",
    corpusRun: "run-i",
    // Quantified, not existential: a phase that silently stopped pinning is
    // caught by row 1's *every*, not by a missing pair.
    witness(rs) {
      const outside = rs.filter((r) => !inWaveSet(r));
      return outside.length > 0 && outside.every((r) => r.model === "opus");
    },
  },
  {
    row: 2,
    site: "Phase I implementation waves (MODEL_IMPLEMENTATION)",
    model: "sonnet",
    corpusRun: "run-i",
    // Both wave-set members must be present: had run i drifted out of wave mode
    // to the legacy worktree path, the Phase-PT dispatch there carries no
    // `model` option and would be Opus.
    witness(rs) {
      const wave = rs.filter(inWaveSet);
      return (
        wave.some((r) => r.phase === "Phase I") &&
        wave.some((r) => r.phase === "Phase PT" && r.skill === "se-implement") &&
        wave.every((r) => r.model === "sonnet")
      );
    },
  },
  {
    row: 3,
    site: "advisory-tier dispatch (MODEL_ADVISORY)",
    model: "fable",
    corpusRun: "run-iii",
    // Existential on purpose: `runAdvisorySeam` memoises its resolved rung
    // (`orchestrate-dev.js:1844`), so quantifying over every ADVISORY_RUNG_SKILL
    // descriptor would be red on correct code (§7.4).
    witness(rs) {
      return rs.some((r) => r.skill === ADVISORY_RUNG_SKILL && r.model === "fable");
    },
  },
  {
    row: 4,
    site: "advisory fallback (MODEL_ADVISORY_FALLBACK), reached only if `fable` fails to resolve",
    model: "opus",
    corpusRun: "run-iv",
    // The (F, B) pair over recorded fields: same skill, same composed prompt
    // (`promptHash`), B later in the run-wide dispatch index, F carrying the
    // pinned outcome member AND the injected message. No adjacency is read —
    // only `B.seq > F.seq` — so interleaved dispatches cannot make it flaky.
    witness(rs) {
      const advisory = rs.filter((r) => r.skill === ADVISORY_RUNG_SKILL);
      const fs = advisory.filter(
        (r) =>
          r.model === "fable" &&
          r.outcome === "transport-contract-violation" &&
          typeof r.errorText === "string" &&
          r.errorText.includes(ROW_4_INJECTED_ERROR)
      );
      return fs.some((F) =>
        advisory.some(
          (B) => B.model === "opus" && B.seq > F.seq && B.promptHash === F.promptHash
        )
      );
    },
  },
  {
    row: 5,
    site: "queue Phase-0 readiness triage (MODEL_QUEUE)",
    model: "sonnet",
    corpusRun: "run-ii",
    witness(rs) {
      return rs.some(
        (r) => r.phase === "Queue" && r.skill === "se-author" && r.model === "sonnet"
      );
    },
  },
  {
    row: 6,
    site: "verdict-recovery re-emit dispatch, on a missing or malformed reviewer VERDICT trailer",
    model: "haiku",
    corpusRun: "run-va",
    witness(rs) {
      return rs.some((r) => r.model === "haiku" && REVIEWER_SKILLS.has(r.skill));
    },
  },
  {
    row: 7,
    site: "PLAN-DAG extraction fallback, on a PLAN task table the in-script parser rejects",
    model: "haiku",
    corpusRun: "run-vb",
    witness(rs) {
      return rs.some((r) => r.model === "haiku" && r.skill === "se-author");
    },
  },
]);

// §3.3's derived dispatchable set, transcribed. Ten identifiers: five that
// appear as string literals at dispatch sites, five reached through
// `PHASE_DISPATCH`'s role fields or `ADVISORY_RUNG_SKILL`.
export const DISPATCHABLE_SKILLS_TABLE = Object.freeze([
  "dod-verify",
  "harvest-learnings",
  "pm-author",
  "pm-review",
  "se-author",
  "se-implement",
  "se-review",
  "ship-pr",
  "te-author",
  "te-review",
]);

// ─── the five row checks: pure functions returning failure strings ──────────

/** Row 1 (§7.4): emitted message ids set-equal `messageIds()`, both directions. */
export function checkMessageCatalogue(records) {
  const failures = [];
  const registeredIds = new Set(messageIds());
  const emittedIds = new Set(
    records.filter((r) => r.kind === "message-id").map((r) => r.id)
  );

  for (const id of emittedIds) {
    if (!registeredIds.has(id)) {
      failures.push(`emitted message id "${id}" is not registered in messageIds()`);
    }
  }
  for (const id of registeredIds) {
    if (!emittedIds.has(id)) {
      failures.push(`registered message id "${id}" was never emitted`);
    }
  }
  return failures;
}

/** Row 2 (§7.4): every recorded classification is a member of `OUTCOMES`. */
export function checkOutcomeTaxonomy(records) {
  const failures = [];
  const validOutcomes = new Set(OUTCOMES);
  for (const r of records) {
    if (r.kind !== "outcome") continue;
    if (!validOutcomes.has(r.value)) {
      failures.push(`recorded outcome "${r.value}" is not a member of OUTCOMES`);
    }
  }
  return failures;
}

/** The corpus-scoped dispatch settlement lines — the population rows 3 and 5 read. */
export function corpusDispatches(records) {
  return records.filter((r) => r.kind === "dispatch" && r.corpusRun != null);
}

/**
 * Row 3 (§7.4, AC-3.3): AC-3.3's two directions, verbatim —
 *   forward: every recorded model value appears in M-ENG-07's model column;
 *   reverse: each of M-ENG-07's seven rows is witnessed by ≥1 descriptor.
 */
export function checkModelMap(records) {
  const failures = [];
  const dispatches = corpusDispatches(records);
  if (dispatches.length === 0) {
    failures.push(
      "no corpus dispatch descriptors recorded (corpusRun != null) — the model-map row " +
        "would assert vacuously over the empty set"
    );
    return failures;
  }

  // Every line is a SETTLEMENT line (§4.1, §7.0): one per dispatch attempt,
  // appended once the attempt settles, carrying its terminal `outcome`. A
  // composition-time line — the `null`-terminal shape a `--dry-run` surface
  // would produce if the accumulator ever hung off `composePrompt` instead of
  // `_agent` — must never appear, or the corpus would silently start counting
  // prompts nobody dispatched (PROP-MODEL-3, FSPEC BR-MODEL-3).
  for (const r of dispatches) {
    if (r.outcome == null || typeof r.attempt !== "number") {
      failures.push(
        `corpus run ${r.corpusRun} recorded a non-settlement dispatch line ` +
          `(seq ${r.seq}, ${r.skill}, outcome ${JSON.stringify(r.outcome)})`
      );
    }
  }

  // Forward: recorded ⊆ declared. An unpinned dispatch (no `model` at all)
  // fails here too — M-ENG-07's column holds no such member. The descriptor
  // value for the unpinned case (`model: "unpinned"`, per `adapter.mjs`) is
  // asserted by `adapter-descriptor.test.js`'s own PROP-MODEL-9 test, not
  // this row's — this row only owes that the corpus set-equality catches the
  // case, not the descriptor's exact shape.
  const declaredModels = new Set(M_ENG_07.map((row) => row.model));
  for (const r of dispatches) {
    if (!declaredModels.has(r.model)) {
      failures.push(
        `recorded model ${JSON.stringify(r.model)} appears in no M-ENG-07 row ` +
          `(${r.corpusRun}, seq ${r.seq}, ${r.skill}, ${r.phase})`
      );
    }
  }

  // Reverse: declared ⊆ witnessed, per §7.4's witness table.
  for (const row of M_ENG_07) {
    const scoped = dispatches.filter((r) => r.corpusRun === row.corpusRun);
    if (!row.witness(scoped)) {
      failures.push(
        `M-ENG-07 row ${row.row} (${row.site} -> "${row.model}") is unwitnessed in ` +
          `corpus run ${row.corpusRun} (${scoped.length} descriptor(s) recorded there)`
      );
    }
  }

  // Rows 1 and 2 are scoped to run i only because run i's fixtures close BOTH
  // `haiku` routes — the PLAN task table parses in-script and every reviewer
  // fixture emits a well-formed VERDICT trailer (§7.4). Asserted, not trusted:
  // without it, a run-i `haiku` dispatch would silently fall outside the wave
  // set and quietly falsify row 1's quantifier's intent.
  const runIHaiku = dispatches.filter((r) => r.corpusRun === "run-i" && r.model === "haiku");
  if (runIHaiku.length > 0) {
    failures.push(
      `run i must close both haiku routes by fixture content (§7.4), but recorded ` +
        `${runIHaiku.length} haiku descriptor(s)`
    );
  }

  return failures;
}

/**
 * Row 4 (§7.4, §3.3, AC-3.5): the derived dispatchable set set-equals §3.3's
 * table, both directions. Not an accumulator — computed once from imported data.
 */
export function checkDispatchableSkills(devSkills = DEV_SKILLS, queueSkills = QUEUE_SKILLS) {
  const failures = [];
  const derived = new Set([...devSkills, ...queueSkills]);
  const declared = new Set(DISPATCHABLE_SKILLS_TABLE);

  for (const skill of derived) {
    if (!declared.has(skill)) {
      failures.push(
        `dispatchable skill "${skill}" is derived by the modules but absent from §3.3's table`
      );
    }
  }
  for (const skill of declared) {
    if (!derived.has(skill)) {
      failures.push(
        `§3.3's table names "${skill}", but the modules' DISPATCHABLE_SKILLS no longer derive it`
      );
    }
  }
  return failures;
}

/** Row 5 (§7.4, §4.1): no record with `corpusRun != null` has `phase === null`. */
export function checkPrePhaseWindow(records) {
  const failures = [];
  for (const r of corpusDispatches(records)) {
    if (r.phase == null) {
      failures.push(
        `corpus run ${r.corpusRun} recorded a dispatch with no phase ` +
          `(seq ${r.seq}, ${r.skill}) — a pre-phase dispatch`
      );
    }
  }
  return failures;
}

// The enumeration and the implementation, tied together: a row named above but
// unimplemented (or implemented but unnamed) fails the step by itself.
const CHECKS = {
  "message-catalogue": (records) => checkMessageCatalogue(records),
  "outcome-taxonomy": (records) => checkOutcomeTaxonomy(records),
  "pinned-model-map": (records) => checkModelMap(records),
  "dispatchable-skills": () => checkDispatchableSkills(),
  "pre-phase-window": (records) => checkPrePhaseWindow(records),
};

/** The row ids actually wired into the step — set-equal to `SUITE_WIDE_ROWS` or the step fails. */
export function implementedRows() {
  return Object.keys(CHECKS);
}

/** Runs all five rows over `records`, returning `{row, message}` failures. */
export function assertSuiteWide(records) {
  const failures = [];
  const implemented = new Set(Object.keys(CHECKS));
  for (const row of SUITE_WIDE_ROWS) {
    if (!implemented.has(row)) {
      failures.push({ row, message: `§7.4 row "${row}" is enumerated but not implemented` });
    }
  }
  for (const row of implemented) {
    if (!SUITE_WIDE_ROWS.includes(row)) {
      failures.push({ row, message: `check "${row}" is implemented but not enumerated` });
    }
  }
  for (const row of SUITE_WIDE_ROWS) {
    const check = CHECKS[row];
    if (!check) continue;
    for (const message of check(records)) failures.push({ row, message });
  }
  return failures;
}

/** Reads the union of every `.jsonl` under `runDir`. */
export function readRunDir(runDir) {
  const records = [];
  for (const name of readdirSync(runDir)) {
    if (!name.endsWith(".jsonl")) continue;
    const text = readFileSync(path.join(runDir, name), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      records.push(JSON.parse(trimmed));
    }
  }
  return records;
}

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

  const records = readRunDir(runDir);
  if (records.length === 0) {
    fail(`no records found under ${runDir} (empty union)`);
    return;
  }

  for (const { row, message } of assertSuiteWide(records)) {
    fail(`[${row}] ${message}`);
  }
}

// Executed as a script (`_run-suite.mjs` step 4, or the tests' own subprocess)
// — never on import, so the row checks above can be import-driven.
const invokedHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedHref === import.meta.url) {
  main();
  process.exit(process.exitCode ?? 0);
}
