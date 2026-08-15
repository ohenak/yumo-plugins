/**
 * planOwnership.test.js — the PLAN file-ownership manifest grammar, the
 * task-table↔manifest contract check, and ownership-disjoint wave derivation
 * (PROPOSAL-orchestrate-dev-optimization §3.3, Slice B step 4).
 *
 * ## What this file pins
 *
 * The manual pdlc-merge-phase run (PROPOSAL §1, M-5) replaced parallel worktrees
 * with same-tree WAVES: a wave may run in parallel only if no two of its tasks
 * own the same file. The PLAN already carries that information as a §4
 * "Per-batch file-ownership manifest" table; this file pins the three pure
 * functions that turn it from prose into a contract:
 *
 * - `parsePlanOwnership`  — the manifest grammar (same anchored exact-cell,
 *   block-segmented approach as `parsePlanTasks`, for the same reason: a loose
 *   substring match over a flat row list swallows every later pipe row in the
 *   document).
 * - `validatePlanContract` — task table ⟷ manifest agreement. Overlaps between
 *   rows are LEGAL (waves separate them); only a task with no row, or a row with
 *   no task, is a contract problem.
 * - `computeWaves`        — topological order ∩ ownership disjointness.
 *
 * ## Oracle-quality rules this file obeys (PROPOSAL §3.5)
 *
 * - **No implementation echoes.** Every expected id and every expected path is a
 *   LITERAL transcribed by reading the excerpted manifest, never imported from
 *   the subject and never recomputed by a helper that shares its logic.
 * - **Set equality, not containment.** Enumerations are compared whole, so an
 *   extra swallowed row reds exactly as loudly as a dropped one.
 * - **No absence-only oracles.** Every `null` / `[]` / "did not qualify"
 *   assertion is paired, in the SAME document, with a positive conjunct that a
 *   qualifying table in that document still parses.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";

const { parsePlanOwnership, validatePlanContract, computeWaves, computeTopologicalBatches } =
  devModule;

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "planParse");
const fixture = (name) => readFileSync(join(FIXTURE_DIR, name), "utf8");

const HALT_FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "halt-hardening");
const haltFixture = (name) => readFileSync(join(HALT_FIXTURE_DIR, name), "utf8");

/** Build a task the way `parsePlanTasks` returns them. */
const task = (id, dependencies = [], planBatch = undefined) => ({
  id,
  description: "",
  dependencies,
  planBatch,
});

const idsOf = (waves) => waves.map((w) => w.map((t) => t.id));

// ─── 1. The real, shipped manifest ────────────────────────────────────────────

describe("PLAN-OWN-01: the real pdlc-merge-phase §4 manifest", () => {
  const doc = fixture("plan-merge-phase-manifest.excerpt.md");

  test("PLAN-OWN-01a: parses to exactly the 17 task ids the manifest lists", () => {
    const parsed = parsePlanOwnership(doc);
    expect(parsed).not.toBeNull();

    // Literal, transcribed by reading the excerpt's §4 table top to bottom.
    const EXPECTED_IDS = [
      "F1",
      "R1",
      "A1",
      "B1",
      "A2",
      "B2",
      "A3",
      "B3",
      "A4",
      "A5",
      "A6",
      "D1",
      "A7",
      "A8",
      "A9",
      "D2",
      "V1",
    ];

    // Set equality on the enumeration, plus the count, plus document order.
    expect(parsed.ownership.map((o) => o.taskId)).toEqual(EXPECTED_IDS);
    expect(parsed.ownership).toHaveLength(17);
    expect(new Set(parsed.ownership.map((o) => o.taskId))).toEqual(new Set(EXPECTED_IDS));
  });

  test("PLAN-OWN-01b: F1's files are the three backticked spans, and the parenthetical prose is not one of them", () => {
    const parsed = parsePlanOwnership(doc);
    const f1 = parsed.ownership.find((o) => o.taskId === "F1");

    // The source cell is:
    //   `__tests__/helpers/mergeDoubles.js` (doubles **and** PROPERTIES §1.2's
    //   seeded generators), `__tests__/mergeDoubles.test.js`,
    //   `__tests__/fixtures/queue-goldens/`
    // — three backticked paths; the parenthetical is prose, not a path. The
    // trailing `/` on the third is a DIRECTORY and is kept verbatim.
    expect(f1.files).toEqual([
      "__tests__/helpers/mergeDoubles.js",
      "__tests__/mergeDoubles.test.js",
      "__tests__/fixtures/queue-goldens/",
    ]);
  });

  test("PLAN-OWN-01c: A1's files are its two backticked spans", () => {
    const parsed = parsePlanOwnership(doc);
    const a1 = parsed.ownership.find((o) => o.taskId === "A1");
    expect(a1.files).toEqual(["orchestrate-dev.js", "__tests__/mergeConfig.test.js"]);
  });

  test("PLAN-OWN-01d: V1's *(none)* cell yields no files, while its row still exists", () => {
    const parsed = parsePlanOwnership(doc);
    const v1 = parsed.ownership.find((o) => o.taskId === "V1");

    // Positive conjunct: the row IS present (V1 is a real task and must satisfy
    // the contract check) — it simply owns nothing.
    expect(v1).toBeDefined();
    expect(v1.taskId).toBe("V1");
    expect(v1.files).toEqual([]);
  });

  test("PLAN-OWN-01e: the §4 Writers table and the risk register do not contribute rows", () => {
    const parsed = parsePlanOwnership(doc);
    const ids = parsed.ownership.map((o) => o.taskId);

    // The Writers table's first column holds `orchestrate-dev.js` etc.; the risk
    // register's holds K-1…K-6. Neither header qualifies, so neither may appear.
    expect(ids).not.toContain("orchestrate-dev.js");
    expect(ids.filter((id) => id.startsWith("K-"))).toEqual([]);
    // Paired positive: the qualifying table in the same document did parse.
    expect(ids).toContain("R1");
  });

  test("PLAN-OWN-01f: R1 owns the ten files its row lists, in order", () => {
    const parsed = parsePlanOwnership(doc);
    const r1 = parsed.ownership.find((o) => o.taskId === "R1");
    expect(r1.files).toEqual([
      "orchestrate-dev.js",
      "orchestrate-queue.js",
      "build-runtime.mjs",
      "__tests__/haltAndQueue.test.js",
      "__tests__/runtimeBundle.test.js",
      "__tests__/orchestrateQueue.test.js",
      "__tests__/helpers/seams.js",
      "__tests__/pipelineWiring.test.js",
      "__tests__/pacingWrapper.test.js",
      "__tests__/forcePhases.test.js",
    ]);
  });
});

// ─── 2. Manifest grammar units ────────────────────────────────────────────────

describe("PLAN-OWN-02: manifest grammar", () => {
  test("PLAN-OWN-02a: markdown emphasis is stripped from the task cell", () => {
    const doc = [
      "| Batch | Task | Files created or appended |",
      "|---|---|---|",
      "| 1 | **T1** | `a.js` |",
      "| 1 | _T2_ | `b.js` |",
      "| 1 | `T3` | `c.js` |",
    ].join("\n");

    expect(parsePlanOwnership(doc).ownership).toEqual([
      { taskId: "T1", files: ["a.js"] },
      { taskId: "T2", files: ["b.js"] },
      { taskId: "T3", files: ["c.js"] },
    ]);
  });

  test("PLAN-OWN-02b: multiple qualifying tables accumulate (per-batch manifests)", () => {
    const doc = [
      "### Batch 1",
      "",
      "| Task | Files |",
      "|---|---|",
      "| T1 | `a.js` |",
      "",
      "Some prose that ends the block.",
      "",
      "### Batch 2",
      "",
      "| Owning task | Owned files |",
      "|---|---|",
      "| T2 | `b.js` |",
      "| T3 | `c.js` |",
    ].join("\n");

    expect(parsePlanOwnership(doc).ownership).toEqual([
      { taskId: "T1", files: ["a.js"] },
      { taskId: "T2", files: ["b.js"] },
      { taskId: "T3", files: ["c.js"] },
    ]);
  });

  test("PLAN-OWN-02c: the same task id in two rows unions its files, de-duplicated", () => {
    const doc = [
      "| Task | Files |",
      "|---|---|",
      "| T1 | `a.js`, `b.js` |",
      "| T2 | `z.js` |",
      "| T1 | `b.js`, `c.js` |",
    ].join("\n");

    expect(parsePlanOwnership(doc).ownership).toEqual([
      { taskId: "T1", files: ["a.js", "b.js", "c.js"] },
      { taskId: "T2", files: ["z.js"] },
    ]);
  });

  test("PLAN-OWN-02d: a repeated path inside one cell is de-duplicated", () => {
    const doc = [
      "| Task | Files |",
      "|---|---|",
      "| T1 | `a.js`, `a.js`, `b.js` |",
    ].join("\n");
    expect(parsePlanOwnership(doc).ownership).toEqual([
      { taskId: "T1", files: ["a.js", "b.js"] },
    ]);
  });

  test("PLAN-OWN-02e: a batch/wave/phase column is ignored, not read as ownership", () => {
    const doc = [
      "| Wave | Task | File ownership |",
      "|---|---|---|",
      "| 3 | T1 | `a.js` |",
    ].join("\n");
    const parsed = parsePlanOwnership(doc);
    expect(parsed.ownership).toEqual([{ taskId: "T1", files: ["a.js"] }]);
    // Set equality on the row's own keys: no wave/batch field leaks through.
    expect(new Set(Object.keys(parsed.ownership[0]))).toEqual(new Set(["taskId", "files"]));
  });

  test("PLAN-OWN-02f: with no backticks, a plausible path is taken and prose is not", () => {
    const doc = [
      "| Task | Files |",
      "|---|---|",
      "| T1 | src/foo.js |",
      "| T2 | *(none)* |",
      "| T3 | to be decided later |",
      "| T4 | docs/thing/ |",
    ].join("\n");

    expect(parsePlanOwnership(doc).ownership).toEqual([
      { taskId: "T1", files: ["src/foo.js"] },
      { taskId: "T2", files: [] },
      { taskId: "T3", files: [] },
      { taskId: "T4", files: ["docs/thing/"] },
    ]);
  });

  test("PLAN-OWN-02g: a document with no fully-qualifying table returns near misses and null ownership, while a minimal manifest in the same document parses", () => {
    const NON_QUALIFYING = [
      "| ID | Risk | Owning task | Mitigation |",
      "|---|---|---|---|",
      "| K-1 | something | A6 | mitigate it |",
      "",
      "| File | Writers | Separated by |",
      "|---|---|---|",
      "| `orchestrate-dev.js` | R1, A1 | the A-chain |",
    ].join("\n");

    // Both tables here happen to carry one accepted-spelling cell each ("Owning
    // task", "File") without the matching other side — so this document is now
    // a TWO-near-miss document under the loud near-miss contract, not a silent
    // null. `ownership` still stays null: nothing fully qualified.
    const result = parsePlanOwnership(NON_QUALIFYING);
    expect(result).not.toBeNull();
    expect(result.ownership).toBeNull();
    expect(result.nearMisses).toHaveLength(2);
    expect(result.nearMisses.map((nm) => nm.matchedSide).sort()).toEqual(["files", "owner"]);

    // Paired positive: adding one qualifying table to the SAME document makes it
    // parse — so the absent ownership above is about the header grammar, not
    // about the document being unreadable.
    const WITH_MANIFEST = [
      NON_QUALIFYING,
      "",
      "| Task ID | Files created/appended |",
      "|---|---|",
      "| A6 | `orchestrate-dev.js` |",
    ].join("\n");
    expect(parsePlanOwnership(WITH_MANIFEST).ownership).toEqual([
      { taskId: "A6", files: ["orchestrate-dev.js"] },
    ]);
  });

  test("PLAN-OWN-02h: a files column without a task column does not qualify (but is a near miss), and vice versa", () => {
    const filesOnly = [
      "| Batch | Files created or appended |",
      "|---|---|",
      "| 1 | `a.js` |",
    ].join("\n");
    const taskOnly = ["| Batch | Task |", "|---|---|", "| 1 | T1 |"].join("\n");

    const filesOnlyResult = parsePlanOwnership(filesOnly);
    expect(filesOnlyResult.ownership).toBeNull();
    expect(filesOnlyResult.nearMisses).toEqual([
      expect.objectContaining({ matchedSide: "files" }),
    ]);

    const taskOnlyResult = parsePlanOwnership(taskOnly);
    expect(taskOnlyResult.ownership).toBeNull();
    expect(taskOnlyResult.nearMisses).toEqual([
      expect.objectContaining({ matchedSide: "owner" }),
    ]);

    // Paired positive: both columns together qualify, with no near miss.
    const bothResult = parsePlanOwnership(
      ["| Task | Files created or appended |", "|---|---|", "| T1 | `a.js` |"].join("\n")
    );
    expect(bothResult.ownership).toEqual([{ taskId: "T1", files: ["a.js"] }]);
    expect(bothResult.nearMisses).toEqual([]);
  });

  test("PLAN-OWN-02i: non-string input returns null, and an equivalent string parses", () => {
    expect(parsePlanOwnership(null)).toBeNull();
    expect(parsePlanOwnership(undefined)).toBeNull();
    expect(parsePlanOwnership(42)).toBeNull();
    expect(
      parsePlanOwnership(["| Task | Files |", "|---|---|", "| T1 | `a.js` |"].join("\n"))
        .ownership
    ).toEqual([{ taskId: "T1", files: ["a.js"] }]);
  });
});

// ─── RT-3c. Header normalization and the loud near-miss diagnostic ────────────
//
// PLAN §4.2 / §10 Q-4: normalize a header cell (lowercase, trim, collapse
// whitespace, strip one trailing parenthetical) before set membership, and
// extend the owner spellings — then a block matching only ONE of the two
// column sets must surface as a structured near-miss diagnostic rather than
// silently fail to qualify. Fixtures are sanitized excerpts of the
// regime-scaffold-pivot-alignment incident (see fixtures/halt-hardening/README.md).

describe("RT-3c: ownership header normalization and loud near-miss diagnostic", () => {
  test("RT-3c-1: 'Owning task(s)' normalizes to the canonical owner spelling and the manifest parses in full", () => {
    const doc = haltFixture("plan-owning-tasks-manifest.md");
    const parsed = parsePlanOwnership(doc);

    expect(parsed).not.toBeNull();
    expect(parsed.nearMisses).toEqual([]);
    expect(parsed.ownership).toEqual([
      { taskId: "T-01", files: ["config/regime_model.json"] },
      {
        taskId: "T-02",
        files: ["products/regime/config/model.py", "products/regime/config/__init__.py"],
      },
      {
        taskId: "T-03",
        files: [
          "tests/regime/test_model_config.py",
          "tests/regime/fixtures/model_config/*.json",
        ],
      },
    ]);
  });

  test("RT-3c-2: a 'Writers | Files' header is a loud near miss naming the header row, the matched side, and the accepted owner spellings", () => {
    const doc = haltFixture("plan-near-miss-manifest.md");
    const parsed = parsePlanOwnership(doc);

    // Positive conjunct: the document is not silently unreadable — the
    // near-miss block is reported, and ownership is null only because nothing
    // fully qualified (there is no other qualifying table in this fixture).
    expect(parsed).not.toBeNull();
    expect(parsed.ownership).toBeNull();
    expect(parsed.nearMisses).toEqual([
      {
        headerRow: "| Writers | Files |",
        matchedSide: "files",
        // Literal, transcribed from the sanctioned owner spellings (PLAN §4.2):
        // exactly this set, no more, no fewer.
        expectedForms: [
          "task",
          "task id",
          "task-id",
          "task_id",
          "owning task",
          "owning tasks",
          "owner",
          "id",
        ],
      },
    ]);
  });

  test("RT-3c-3: back-compat — every previously accepted header still parses identically", () => {
    const canonical = [
      "| Task | Files |",
      "|---|---|",
      "| T1 | `a.js` |",
    ].join("\n");
    const parsed = parsePlanOwnership(canonical);
    expect(parsed.ownership).toEqual([{ taskId: "T1", files: ["a.js"] }]);
    expect(parsed.nearMisses).toEqual([]);
  });

  test("RT-3c-4: a plain prose table matching neither column set produces no near-miss diagnostic", () => {
    const prose = [
      "| Component | Owner | Notes |",
      "|---|---|---|",
      "| CLI | @kane | none |",
    ].join("\n");
    // "Owner" alone would match PLAN_OWNER_HEADER_CELLS, so use a document that
    // truly matches neither set to pin the "matches nothing → silent skip" half
    // of the contract.
    const trulyNeither = [
      "| Component | Maintainer | Notes |",
      "|---|---|---|",
      "| CLI | @kane | none |",
    ].join("\n");

    expect(parsePlanOwnership(trulyNeither)).toBeNull();
    // The "Owner" column is one of the newly-added owner spellings, so this
    // document IS a near miss (files side unmatched) — pinning that the
    // extended owner set participates in near-miss detection too.
    const ownerOnly = parsePlanOwnership(prose);
    expect(ownerOnly.ownership).toBeNull();
    expect(ownerOnly.nearMisses).toEqual([
      expect.objectContaining({ matchedSide: "owner" }),
    ]);
  });

  test("RT-3c-5: an ordinary task table (Task ID | Description | Deps) is NOT a near miss — the id-column/owner-set overlap exception, in isolation", () => {
    // No manifest table anywhere in this document — just the task table that
    // every PLAN carries. Its "Task ID" cell matches the owner set on its own
    // (PLAN_ID_HEADER_CELLS and PLAN_OWNER_HEADER_CELLS share spellings), so
    // without the task-table exception this would wrongly report a near miss
    // on every ordinary PLAN. Pinned in isolation, with no accompanying
    // manifest table, so the exception can't hide behind RT-3c-1's paired
    // qualifying table.
    const taskTableOnly = [
      "| Task ID | Description | Deps |",
      "|---|---|---|",
      "| T-01 | Initialize config directory | — |",
      "| T-02 | Create model loader | T-01 |",
    ].join("\n");

    const parsed = parsePlanOwnership(taskTableOnly);

    // Positive conjunct: the document is not silently unreadable in some
    // other way — it is null for the ordinary, pre-existing reason (no
    // manifest table at all), not treated specially by this test.
    expect(parsed).toBeNull();
  });
});

// ─── 3. The task-table ⟷ manifest contract ────────────────────────────────────

describe("PLAN-OWN-03: validatePlanContract", () => {
  test("PLAN-OWN-03a: a task table and manifest that agree are ok, with no problems key surprises", () => {
    const tasks = [task("T1"), task("T2", ["T1"])];
    const ownership = [
      { taskId: "T1", files: ["a.js"] },
      { taskId: "T2", files: ["b.js"] },
    ];
    expect(validatePlanContract(tasks, ownership)).toEqual({ ok: true });
  });

  test("PLAN-OWN-03b: a task with no manifest row is a problem, named literally", () => {
    const tasks = [task("T1"), task("T2", ["T1"])];
    const ownership = [{ taskId: "T1", files: ["a.js"] }];

    const result = validatePlanContract(tasks, ownership);
    expect(result.ok).toBe(false);
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]).toContain("T2");
    expect(result.problems[0]).toContain("no file-ownership manifest row");
  });

  test("PLAN-OWN-03c: a manifest row naming an unknown task is a problem, named literally", () => {
    const tasks = [task("T1")];
    const ownership = [
      { taskId: "T1", files: ["a.js"] },
      { taskId: "T9", files: ["b.js"] },
    ];

    const result = validatePlanContract(tasks, ownership);
    expect(result.ok).toBe(false);
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]).toContain("T9");
    expect(result.problems[0]).toContain("not in the PLAN task table");
  });

  test("PLAN-OWN-03d: both problem classes at once are reported together", () => {
    const tasks = [task("T1"), task("T2")];
    const ownership = [
      { taskId: "T1", files: ["a.js"] },
      { taskId: "T9", files: ["b.js"] },
    ];

    const result = validatePlanContract(tasks, ownership);
    expect(result.ok).toBe(false);
    expect(result.problems).toHaveLength(2);
    expect(result.problems.some((p) => p.includes("T2"))).toBe(true);
    expect(result.problems.some((p) => p.includes("T9"))).toBe(true);
  });

  test("PLAN-OWN-03e: overlapping file ownership between rows is NOT a problem", () => {
    // R1 and A1 both own `orchestrate-dev.js` in the real merge-phase PLAN, and
    // that PLAN was correct: the waves separate them. Overlap must stay legal.
    const tasks = [task("R1"), task("A1", ["R1"])];
    const ownership = [
      { taskId: "R1", files: ["orchestrate-dev.js"] },
      { taskId: "A1", files: ["orchestrate-dev.js"] },
    ];
    expect(validatePlanContract(tasks, ownership)).toEqual({ ok: true });
  });

  test("PLAN-OWN-03f: the real merge-phase manifest satisfies the contract against its own task ids", () => {
    const { ownership } = parsePlanOwnership(fixture("plan-merge-phase-manifest.excerpt.md"));
    const tasks = ownership.map((o) => task(o.taskId));
    expect(validatePlanContract(tasks, ownership)).toEqual({ ok: true });
  });
});

// ─── 4. Wave derivation ───────────────────────────────────────────────────────

describe("PLAN-OWN-04: computeWaves", () => {
  test("PLAN-OWN-04a: tasks that share a topological batch but overlap on a file split into successive waves", () => {
    // T1, T2, T3 have no dependencies, so today they are ONE batch. T1 and T3
    // both own `shared.js`; T2 owns nothing of theirs.
    const tasks = [task("T1"), task("T2"), task("T3")];
    const ownership = [
      { taskId: "T1", files: ["shared.js", "one.js"] },
      { taskId: "T2", files: ["two.js"] },
      { taskId: "T3", files: ["shared.js", "three.js"] },
    ];

    // Positive conjunct: today's batching really does put all three together.
    expect(idsOf(computeTopologicalBatches(tasks))).toEqual([["T1", "T2", "T3"]]);

    // T2 is disjoint from T1 so it stays in the first wave; T3 collides and opens
    // the next one.
    expect(idsOf(computeWaves(tasks, ownership))).toEqual([["T1", "T2"], ["T3"]]);
  });

  test("PLAN-OWN-04b: fully disjoint tasks stay parallel in one wave", () => {
    const tasks = [task("T1"), task("T2"), task("T3")];
    const ownership = [
      { taskId: "T1", files: ["a.js"] },
      { taskId: "T2", files: ["b.js"] },
      { taskId: "T3", files: ["c.js"] },
    ];
    expect(idsOf(computeWaves(tasks, ownership))).toEqual([["T1", "T2", "T3"]]);
  });

  test("PLAN-OWN-04c: the size-5 cap still applies inside a disjoint group", () => {
    const ids = ["T1", "T2", "T3", "T4", "T5", "T6", "T7"];
    const tasks = ids.map((id) => task(id));
    const ownership = ids.map((id) => ({ taskId: id, files: [`${id}.js`] }));

    expect(idsOf(computeWaves(tasks, ownership))).toEqual([
      ["T1", "T2", "T3", "T4", "T5"],
      ["T6", "T7"],
    ]);
  });

  test("PLAN-OWN-04d: a dependency cycle still halts with the same message", () => {
    const tasks = [task("T1", ["T2"]), task("T2", ["T1"])];
    const ownership = [
      { taskId: "T1", files: ["a.js"] },
      { taskId: "T2", files: ["b.js"] },
    ];
    expect(() => computeWaves(tasks, ownership)).toThrow(
      "Error: PLAN dependency graph contains a cycle — cannot compute topological batches"
    );
  });

  test("PLAN-OWN-04e: a directory entry collides with a file beneath it, and not with a sibling", () => {
    const tasks = [task("T1"), task("T2"), task("T3")];
    const ownership = [
      { taskId: "T1", files: ["a/b/"] },
      { taskId: "T2", files: ["a/bc.js"] }, // sibling — the prefix is not a path prefix
      { taskId: "T3", files: ["a/b/c.js"] }, // beneath a/b/ — collides
    ];
    expect(idsOf(computeWaves(tasks, ownership))).toEqual([["T1", "T2"], ["T3"]]);
  });

  test("PLAN-OWN-04f: ownership = null reproduces computeTopologicalBatches exactly, with files: null", () => {
    const tasks = [
      task("T1"),
      task("T2"),
      task("T3"),
      task("T4"),
      task("T5"),
      task("T6"),
      task("T7", ["T1"]),
    ];

    const waves = computeWaves(tasks, null);
    expect(idsOf(waves)).toEqual(idsOf(computeTopologicalBatches(tasks)));
    // Literal, so a change to the batcher reds here too rather than agreeing
    // with itself.
    expect(idsOf(waves)).toEqual([["T1", "T2", "T3", "T4", "T5"], ["T6"], ["T7"]]);

    const filesSeen = waves.flat().map((t) => t.files);
    expect(filesSeen).toHaveLength(7);
    expect(filesSeen.every((f) => f === null)).toBe(true);
  });

  test("PLAN-OWN-04g: every task in a derived wave carries its owned files", () => {
    const tasks = [task("T1"), task("T2", ["T1"])];
    const ownership = [
      { taskId: "T1", files: ["a.js", "dir/"] },
      { taskId: "T2", files: ["b.js"] },
    ];
    const waves = computeWaves(tasks, ownership);
    expect(waves.map((w) => w.map((t) => [t.id, t.files]))).toEqual([
      [["T1", ["a.js", "dir/"]]],
      [["T2", ["b.js"]]],
    ]);
  });

  test("PLAN-OWN-04h: a task with no manifest row gets files: null and never blocks a wave", () => {
    const tasks = [task("T1"), task("T2")];
    const ownership = [{ taskId: "T1", files: ["a.js"] }];
    const waves = computeWaves(tasks, ownership);
    expect(idsOf(waves)).toEqual([["T1", "T2"]]);
    expect(waves[0].map((t) => t.files)).toEqual([["a.js"], null]);
  });

  test("PLAN-OWN-04i: dependency order is still respected across waves", () => {
    const tasks = [task("A"), task("B", ["A"]), task("C", ["B"])];
    const ownership = [
      { taskId: "A", files: ["a.js"] },
      { taskId: "B", files: ["b.js"] },
      { taskId: "C", files: ["c.js"] },
    ];
    expect(idsOf(computeWaves(tasks, ownership))).toEqual([["A"], ["B"], ["C"]]);
  });

  test("PLAN-OWN-04j: the real merge-phase task graph yields waves with no intra-wave file collision", () => {
    const { ownership } = parsePlanOwnership(fixture("plan-merge-phase-manifest.excerpt.md"));
    // Dependencies transcribed from the excerpt's Batch column: batch N depends
    // on every task of batch N-1 (the PLAN's own derivation, §5).
    const BATCH_OF = {
      F1: 1,
      R1: 1,
      A1: 2,
      B1: 2,
      A2: 3,
      B2: 3,
      A3: 4,
      B3: 4,
      A4: 5,
      A5: 6,
      A6: 7,
      D1: 7,
      A7: 8,
      A8: 9,
      A9: 10,
      D2: 11,
      V1: 12,
    };
    const byBatch = (n) => Object.keys(BATCH_OF).filter((id) => BATCH_OF[id] === n);
    const tasks = ownership.map((o) =>
      task(o.taskId, byBatch(BATCH_OF[o.taskId] - 1), BATCH_OF[o.taskId])
    );

    const waves = computeWaves(tasks, ownership);
    // Positive: every task landed in exactly one wave.
    expect(waves.flat().map((t) => t.id).sort()).toEqual(Object.keys(BATCH_OF).sort());
    // And no wave contains two tasks sharing a path.
    for (const wave of waves) {
      const seen = new Set();
      for (const t of wave) {
        for (const f of t.files || []) {
          expect(seen.has(f)).toBe(false);
          seen.add(f);
        }
      }
    }
  });
});
