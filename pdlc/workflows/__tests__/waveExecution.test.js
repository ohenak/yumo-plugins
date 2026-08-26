/**
 * Slice B, second half (PROPOSAL §3.3, step 4) — wave-based Phase I with
 * script-owned gates.
 *
 * Three mechanisms are under test here, and each is anchored on a literal an
 * operator would actually read:
 *   1. Phase P's manifest half of the self-parse gate (M-5) — a PLAN with no
 *      ownership manifest, or one whose manifest disagrees with its task table,
 *      is rejected AT PHASE P.
 *   2. Phase I's wave mode (M-5) — same tree, no worktree isolation, ownership
 *      in the prompt, no agent commits.
 *   3. The script-owned gate and the script-owned commits (M-6) — the
 *      orchestrator runs the suite and commits verified work; an agent's
 *      self-report is load-bearing only when the transport is absent.
 *
 * Oracle rules in force (PROPOSAL §3.5): literal anchors, no implementation
 * echoes, every absence assertion paired with a positive, set-equality for
 * enumerations.
 */

import main, {
  GIT_LOCK_RETRIES,
  GIT_LOCK_RETRY_DELAY_MS,
  IMPLEMENTATION_DEFAULTS,
  WAVE_STATE_PATH,
  checkWaveUnskips,
  computePlanHash,
  computeWaves,
  evaluateWaveDispatch,
  scanSkipTokens,
  parseImplementationConfig,
  parsePlanTasks,
  parsePlanOwnership,
  // A6's root-cause vocabulary: this file's `haltFields` fixtures must draw their `rootCause`
  // from it, or they assert a shape A6 can never produce (CR round 1, PM F-10). The guard below
  // is what keeps that true as fixtures are added.
  ADVISORY_ROOT_CAUSES,
} from "../orchestrate-dev.js";

import { readFileSync as readFixtureSource } from "fs";
import { dirname as fixtureDirname, join as fixtureJoin } from "path";
import { fileURLToPath as fixtureFileURLToPath } from "url";

const FEATURE = "test-feat";
const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;
const PLAN_PATH = `docs/${FEATURE}/PLAN-${FEATURE}.md`;
const CONFIG_PATH = ".claude/pdlc.config.json";
const BRANCH = `feat-${FEATURE}`;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * A PLAN the mechanical parser reads AND whose file-ownership manifest satisfies
 * `validatePlanContract`. T1 and T2 have no dependencies (one topological layer)
 * and own disjoint files, so `computeWaves` packs them into ONE wave of two.
 */
// Deliberately heading-free, like every other main()-driven PLAN fixture in this
// suite: the authoring wrapper's "unmeasurable target" escape (§5.6.2) is what
// lets these fixtures reach a later phase at all, and a `##` heading would take
// the fixture off that path and halt Phase P for a reason unrelated to the
// property under test.
const PLAN_WITH_MANIFEST = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| T1 | First task | 1 | - |",
  "| T2 | Second task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| T1 | `src/one.js` |",
  "| T2 | `src/two.js` |",
].join("\n");

/**
 * Two IMPLEMENTATION waves. Waves are derived TOPOLOGICALLY from the dependency column, never
 * read off the PLAN's own batch labels (`computeTopologicalBatches` in orchestrate-dev.js), so
 * the second wave is created by making T2 depend on T1 — writing `2` in the Batch column alone
 * changes nothing. PLAN_WITH_MANIFEST's two tasks are independent, i.e. one wave, which is why
 * PROP-GATE-10's "one run carrying both a green and a red-gated wave" population had no fixture
 * before (CODE_REVIEW v1 §2 row 33).
 */
const PLAN_TWO_WAVES = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| T1 | First task | 1 | - |",
  "| T2 | Second task | 2 | T1 |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| T1 | `src/one.js` |",
  "| T2 | `src/two.js` |",
].join("\n");

/** The same task table with no manifest at all — the legacy/worktree shape. */
const PLAN_NO_MANIFEST = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| T1 | First task | 1 | - |",
].join("\n");

/** A manifest that names a task the task table does not carry. */
const PLAN_STALE_MANIFEST_ROW = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| T1 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| T1 | `src/one.js` |",
  "| T9 | `src/nine.js` |",
].join("\n");

function makeAgent(record) {
  return async (skill, prompt, opts) => {
    record.push({ skill, prompt: String(prompt), opts });
    if (["se-review", "te-review", "pm-review"].includes(skill)) {
      return `Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    if (["pm-author", "se-author", "te-author"].includes(skill)) {
      if (String(prompt).includes("DECISIONS_WARRANTED")) {
        return "Finalized.\nDECISIONS_WARRANTED: false";
      }
      if (String(prompt).includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
        });
      }
      return "Document created.";
    }
    if (skill === "se-implement") return "Implemented. Tests: 3 passed, 0 failed.";
    if (skill === "harvest-learnings") return "Harvest complete.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (String(prompt).includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/a/b/pull/1";
      }
      return "Rebased.\nREBASE_STATUS: clean";
    }
    return "Success.";
  };
}

/**
 * A `_git` double: answers the branch guard truthfully, records every argv, and
 * lets a test script per-call outcomes by argv shape.
 */
function makeGit(calls, { fail } = {}) {
  return async (argv) => {
    calls.push(argv);
    const joined = argv.join(" ");
    if (joined === "rev-parse --abbrev-ref HEAD") {
      return { ok: true, stdout: `${BRANCH}\n`, stderr: "" };
    }
    if (argv[0] === "diff") {
      // Everything the orchestrator staged shows up as staged, so a commit follows.
      return { ok: true, stdout: `${argv.slice(4).join("\n")}\n`, stderr: "" };
    }
    const scripted = fail && fail(argv, calls);
    if (scripted) return scripted;
    return { ok: true, stdout: "", stderr: "" };
  };
}

const CONFIG_WITH_TEST_COMMAND = JSON.stringify({
  implementation: { testCommand: "npm test" },
});

function makeArgs({
  plan = PLAN_WITH_MANIFEST,
  config = null,
  record = [],
  git,
  runCommand,
  sleep,
  logs,
  phases,
  extra = {},
} = {}) {
  return {
    reqPath: REQ_PATH,
    _agent: makeAgent(record),
    _parallel: (p) => Promise.all(p),
    _checkFile: () => ({ ok: true }),
    _checkCi: async () => "passed",
    _phase: phases ? (label) => phases.push(String(label)) : () => {},
    _pipeline: async (l, fn) => fn(),
    _log: logs ? (m) => logs.push(String(m)) : () => {},
    _mergeWorktree: async () => ({ ok: true }),
    _readFile: (path) => {
      const p = String(path);
      if (p === CONFIG_PATH) return config;
      if (p.includes("/PLAN-")) return plan;
      return null;
    },
    ...(git ? { _git: git } : {}),
    ...(runCommand ? { _runCommand: runCommand } : {}),
    ...(sleep ? { _sleep: sleep } : {}),
    ...extra,
  };
}

const phaseRecord = (result, id) => result.phases.find((p) => p.phase === id) || {};
const phaseDetail = (result, id) => phaseRecord(result, id).detail || "";

// ─── parseImplementationConfig ────────────────────────────────────────────────

describe("parseImplementationConfig — the `implementation` config section", () => {
  it("an absent file yields the defaults and is not a malformed section", () => {
    const r = parseImplementationConfig(null);
    expect(r.config).toEqual({
      testCommand: null,
      postWaveCommand: null,
      postWavePathspecs: [],
      startWave: 1,
    });
    expect(r.sectionMalformed).toBe(false);
    expect(r.invalidKeys).toEqual([]);
  });

  it("unparseable JSON yields the defaults and is not a malformed section", () => {
    const r = parseImplementationConfig("{ not json");
    expect(r.config.testCommand).toBeNull();
    expect(r.sectionMalformed).toBe(false);
  });

  it("a non-object `implementation` value is a malformed section", () => {
    const r = parseImplementationConfig(JSON.stringify({ implementation: "npm test" }));
    expect(r.sectionMalformed).toBe(true);
    expect(r.config).toEqual(IMPLEMENTATION_DEFAULTS);
    expect(r.config.startWave).toBe(1);
  });

  it("reads every key when every one is well formed", () => {
    const r = parseImplementationConfig(
      JSON.stringify({
        implementation: {
          testCommand: "npm test",
          postWaveCommand: "node build.mjs",
          postWavePathspecs: ["dist/"],
          startWave: 3,
        },
      })
    );
    expect(r.config).toEqual({
      testCommand: "npm test",
      postWaveCommand: "node build.mjs",
      postWavePathspecs: ["dist/"],
      startWave: 3,
    });
    expect(r.invalidKeys).toEqual([]);
  });

  it("an absent `startWave` is the resume pointer's default of 1, and is not reported", () => {
    const r = parseImplementationConfig(
      JSON.stringify({ implementation: { testCommand: "npm test" } })
    );
    expect(r.config.startWave).toBe(1);
    expect(r.invalidKeys).toEqual([]);
  });

  it("a well-formed `startWave` is read verbatim", () => {
    const r = parseImplementationConfig(
      JSON.stringify({ implementation: { startWave: 4 } })
    );
    expect(r.config.startWave).toBe(4);
    expect(r.invalidKeys).toEqual([]);
  });

  it.each([
    ["zero", 0],
    ["a negative", -1],
    ["a fraction", 2.5],
    ["a numeric string", "4"],
    ["null", null],
  ])("%s `startWave` falls back to 1 and is named", (_label, value) => {
    const r = parseImplementationConfig(
      JSON.stringify({ implementation: { testCommand: "npm test", startWave: value } })
    );
    expect(r.config.startWave).toBe(1);
    expect(r.invalidKeys).toEqual(["startWave"]);
    // Independence: the sibling key is untouched by its neighbour's degradation.
    expect(r.config.testCommand).toBe("npm test");
  });

  it("each key degrades INDEPENDENTLY, and the degraded key is named", () => {
    const r = parseImplementationConfig(
      JSON.stringify({
        implementation: {
          testCommand: 17,
          postWaveCommand: "node build.mjs",
          postWavePathspecs: "dist/",
        },
      })
    );
    // The one good key survives (the positive half) …
    expect(r.config.postWaveCommand).toBe("node build.mjs");
    // … and only the bad ones fall back, each reported by name.
    expect(r.config.testCommand).toBeNull();
    expect(r.config.postWavePathspecs).toEqual([]);
    expect(new Set(r.invalidKeys)).toEqual(new Set(["testCommand", "postWavePathspecs"]));
  });

  it("an array with a non-string member degrades the whole pathspec list", () => {
    const r = parseImplementationConfig(
      JSON.stringify({ implementation: { postWavePathspecs: ["dist/", 3] } })
    );
    expect(r.config.postWavePathspecs).toEqual([]);
    expect(r.invalidKeys).toEqual(["postWavePathspecs"]);
  });

  it("a file with a `merge` section but no `implementation` section is not malformed", () => {
    const r = parseImplementationConfig(JSON.stringify({ merge: { mergeMode: "on" } }));
    expect(r.sectionMalformed).toBe(false);
    expect(r.config).toEqual(IMPLEMENTATION_DEFAULTS);
  });
});

// ─── evaluateWaveDispatch ─────────────────────────────────────────────────────

describe("evaluateWaveDispatch — rules 1 and 3 only (M-6)", () => {
  const wave = [{ id: "T1" }, { id: "T2" }];

  it("an empty result halts, naming the wave (1-indexed)", () => {
    expect(() => evaluateWaveDispatch(["", "ok"], 2, wave)).toThrow(
      "Error: Wave 3 agent returned empty result — treating as failure"
    );
  });

  it("a null result halts the same way", () => {
    expect(() => evaluateWaveDispatch([null], 0, wave)).toThrow(
      "Error: Wave 1 agent returned empty result"
    );
  });

  it("a non-zero exit halts, naming the wave and the task", () => {
    expect(() => evaluateWaveDispatch(["fine", "NON-ZERO EXIT 1"], 0, wave)).toThrow(
      "Error: Wave 1 task T2 failed — non-zero exit detected"
    );
  });

  it("rule 2 is deliberately absent: a self-reported test failure does NOT halt", () => {
    // Absence, paired with the positive that the same input DOES halt the
    // legacy batch gate — so this asserts a difference, not merely a silence.
    expect(() =>
      evaluateWaveDispatch(["Tests: 2 failed, 3 passed"], 0, wave)
    ).not.toThrow();
  });
});

// ─── Phase P: the manifest half of the self-parse gate ────────────────────────

describe("Phase P — the file-ownership manifest gate (PROPOSAL §3.3, M-5)", () => {
  it("halts at Phase P when the PLAN carries no manifest", async () => {
    const record = [];
    const result = await main(makeArgs({ plan: PLAN_NO_MANIFEST, record }));

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("carries no file-ownership manifest");
    expect(result.haltReason).toContain(PLAN_PATH);
    expect(result.haltReason).toContain(
      "Rejecting at Phase P rather than discovering it at Phase I."
    );
    // The phase is recorded failed, and it is P.
    expect(phaseRecord(result, "P").status).toBe("❌");

    // The POSITIVE half: the gate fires AFTER the phase actually ran, not
    // instead of it — the PLAN reviewers were dispatched.
    const planReviews = record.filter(
      (c) => c.skill.endsWith("-review") && c.prompt.includes("PLAN-")
    );
    expect(planReviews.length).toBeGreaterThan(0);

    // And Phase I never started.
    expect(record.some((c) => c.skill === "se-implement")).toBe(false);
  });

  it("halts at Phase P when the manifest and the task table disagree, quoting the problem", async () => {
    const result = await main(makeArgs({ plan: PLAN_STALE_MANIFEST_ROW }));

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain(
      "File-ownership manifest row T9 names a task id that is not in the PLAN task table"
    );
    expect(result.haltReason).toContain(
      "Rejecting at Phase P rather than discovering it at Phase I."
    );
  });

  it("a valid manifest passes, and Phase P's detail carries tasks, batches AND waves", async () => {
    const result = await main(makeArgs({}));
    expect(result.outcome).toBe("success");
    // 2 tasks, no dependencies → one batch, one wave (disjoint ownership).
    expect(phaseDetail(result, "P")).toContain(
      "PLAN parses to 2 tasks in 1 batches, 1 waves"
    );
  });
});

// ─── Phase I: wave mode ───────────────────────────────────────────────────────

describe("Phase I wave mode — same tree, ownership-scoped, no agent commits", () => {
  it("dispatches the wave WITHOUT worktree isolation and ON sonnet", async () => {
    const record = [];
    const result = await main(makeArgs({ record }));
    expect(result.outcome).toBe("success");

    const impl = record.filter(
      (c) => c.skill === "se-implement" && c.prompt.includes("Implement task ")
    );
    expect(impl.map((c) => c.prompt.match(/Implement task (\S+):/)[1])).toEqual([
      "T1",
      "T2",
    ]);
    for (const call of impl) {
      // Absence — no isolation key at all — paired with the positive that the
      // model IS pinned, so an opts object that vanished entirely reds.
      expect(call.opts.isolation).toBeUndefined();
      expect(call.opts.model).toBe("sonnet");
    }
  });

  it("the wave prompt carries the ownership list and the no-commit instruction", async () => {
    const record = [];
    await main(makeArgs({ record }));
    const t1 = record.find(
      (c) => c.skill === "se-implement" && c.prompt.includes("Implement task T1:")
    );

    expect(t1.prompt).toContain("You own EXACTLY these files: src/one.js.");
    expect(t1.prompt).toContain("Do not create or modify any other file.");
    expect(t1.prompt).toContain(
      "Do NOT run git add or git commit — the orchestrator verifies your work and commits it."
    );
    expect(t1.prompt).toContain(
      "Run only your task's targeted tests — do not run the full suite; the orchestrator runs it."
    );
    // branchPinClause is kept.
    expect(t1.prompt).toContain(`All commits for this task must land on branch ${BRANCH}.`);
    // T1's prompt names T1's files and not T2's (absence + positive).
    expect(t1.prompt).not.toContain("src/two.js");
  });

  it("never merges a worktree in wave mode — but DOES in legacy mode", async () => {
    // Negative arm.
    const waveMerges = [];
    const waveResult = await main(
      makeArgs({
        extra: {
          _mergeWorktree: async (...a) => {
            waveMerges.push(a);
            return { ok: true };
          },
        },
      })
    );
    expect(waveResult.outcome).toBe("success");
    expect(waveMerges).toEqual([]);

    // Paired POSITIVE arm, same file, same double: a PLAN whose manifest is gone
    // by the time Phase I reads it (Phase P skipped on a recorded approval) takes
    // the worktree exception path, and the merge-back runs.
    const legacyMerges = [];
    let inPhaseI = false;
    const legacyResult = await main(
      makeArgs({
        extra: {
          _phase: (label) => {
            if (String(label).startsWith("Phase I")) inPhaseI = true;
          },
          _readFile: (path) => {
            const p = String(path);
            if (p === CONFIG_PATH) return null;
            if (p.includes("/PLAN-")) {
              return inPhaseI ? PLAN_NO_MANIFEST : PLAN_WITH_MANIFEST;
            }
            return null;
          },
          _mergeWorktree: async (...a) => {
            legacyMerges.push(a);
            return { ok: true };
          },
        },
      })
    );
    expect(legacyResult.outcome).toBe("success");
    expect(legacyMerges.length).toBeGreaterThan(0);
    expect(phaseDetail(legacyResult, "I")).toBe("All batches complete");
  });

  it("legacy mode still dispatches with worktree isolation and applies the batch gate", async () => {
    const record = [];
    let inPhaseI = false;
    const result = await main(
      makeArgs({
        record,
        extra: {
          _phase: (label) => {
            if (String(label).startsWith("Phase I")) inPhaseI = true;
          },
          _readFile: (path) => {
            const p = String(path);
            if (p === CONFIG_PATH) return null;
            if (p.includes("/PLAN-")) {
              return inPhaseI ? PLAN_NO_MANIFEST : PLAN_WITH_MANIFEST;
            }
            return null;
          },
        },
      })
    );
    expect(result.outcome).toBe("success");
    const impl = record.filter((c) => c.skill === "se-implement" && c.opts);
    expect(impl.some((c) => c.opts.isolation === "worktree")).toBe(true);
  });
});

// ─── Phase I: the script-owned gate (M-6) ─────────────────────────────────────

describe("Phase I — the script-owned test gate", () => {
  it("runs the configured command and commits each task's owned files on green", async () => {
    const gitCalls = [];
    const ran = [];
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git: makeGit(gitCalls),
        runCommand: async (cmd) => {
          ran.push(cmd);
          return { ok: true, output: "Tests: 40 passed\n" };
        },
      })
    );

    expect(result.outcome).toBe("success");
    // Two runs of the command, not one: the implementation wave's gate, then the
    // V-wave's verification of the PROPERTIES tests (PROPOSAL §3.2 row 2 —
    // Phase PT is now Phase I's final wave, and it is gated by the same
    // script-owned command). The ORDER of the two is pinned in
    // "the V-wave runs after the last implementation wave" below.
    expect(ran).toEqual(["npm test", "npm test"]);
    expect(phaseDetail(result, "I")).toBe(
      "All 1 waves complete (wave mode, script-owned gate)"
    );

    // Commits: pathspec-scoped adds, plain commits, one per task, in wave order.
    const adds = gitCalls.filter((a) => a[0] === "add");
    expect(adds).toEqual([
      ["add", "--", "src/one.js"],
      ["add", "--", "src/two.js"],
    ]);
    const commits = gitCalls.filter((a) => a[0] === "commit");
    expect(commits).toEqual([
      ["commit", "-m", "feat(test-feat): T1 — First task"],
      ["commit", "-m", "feat(test-feat): T2 — Second task"],
    ]);
    // Never `-a`, anywhere.
    expect(gitCalls.some((a) => a.includes("-a"))).toBe(false);
  });

  it("halts on a red gate, naming the wave, the command and the output tail — and commits nothing", async () => {
    const gitCalls = [];
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git: makeGit(gitCalls),
        runCommand: async () => ({
          ok: false,
          output: "FAIL src/one.test.js\nTests: 1 failed, 39 passed\n",
        }),
      })
    );

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Error: Wave 1 test gate failed");
    expect(result.haltReason).toContain("npm test");
    // The tail is carried verbatim (the positive half of "no commits").
    expect(result.haltReason).toContain("Tests: 1 failed, 39 passed");

    expect(gitCalls.filter((a) => a[0] === "commit")).toEqual([]);
    expect(gitCalls.filter((a) => a[0] === "add")).toEqual([]);
  });

  it("falls back to the legacy self-report gate when testCommand is absent, and says so once", async () => {
    const logs = [];
    const result = await main(
      makeArgs({ config: null, logs, runCommand: async () => ({ ok: true, output: "" }) })
    );
    expect(result.outcome).toBe("success");

    const notices = logs.filter((m) =>
      m.includes("Notice: the script-owned test gate is unavailable")
    );
    expect(notices.length).toBe(1);
    expect(notices[0]).toContain(`implementation.testCommand in ${CONFIG_PATH}`);
    expect(phaseDetail(result, "I")).toBe(
      "All 1 waves complete (wave mode, self-report gate)"
    );
  });

  it("names the transport when THAT is the missing half", async () => {
    const logs = [];
    // testCommand IS configured; no `_runCommand` is injected.
    await main(makeArgs({ config: CONFIG_WITH_TEST_COMMAND, logs }));
    const notice = logs.find((m) =>
      m.includes("Notice: the script-owned test gate is unavailable")
    );
    expect(notice).toContain("the _runCommand transport");
    expect(notice).not.toContain("implementation.testCommand");
  });

  it("the legacy fallback gate still halts on a self-reported test failure", async () => {
    const record = [];
    const result = await main(
      makeArgs({
        config: null,
        record,
        extra: {
          _agent: async (skill, prompt, opts) => {
            record.push({ skill, prompt: String(prompt), opts });
            if (skill === "se-implement") return "Tests: 2 failed, 1 passed";
            return makeAgent([])(skill, prompt, opts);
          },
        },
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Tests: 2 failed");
  });
});

// ─── Phase I: the un-skip guard (no vacuous green) ────────────────────────────

/**
 * Two waves, and a test file the manifest gives to BOTH the 🔴 author (T1, wave
 * 1) and the 🟢 owner (T2, wave 2) — the shape a PLAN needs for the un-skip to
 * be written and committed by the task that owes it.
 */
const PLAN_TWO_WAVES_ONE_TEST_FILE = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| T1 | First task | 1 | - |",
  "| T2 | Second task | 2 | T1 |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| T1 | `src/one.js` `src/one.test.js` |",
  "| T2 | `src/two.js` `src/one.test.js` |",
].join("\n");

const TEST_FILE = "src/one.test.js";

/** The same suite body, parameterised on the title the skipped block carries. */
const testFileSkipping = (title) =>
  [
    'describe("the block that really runs", () => {',
    '  it("asserts something", () => {});',
    "});",
    "",
    `describe.skip("${title}", () => {`,
    '  it("never ran", () => {});',
    "});",
    "",
  ].join("\n");

const unskipArgs = (fileText, overrides = {}) =>
  makeArgs({
    plan: PLAN_TWO_WAVES_ONE_TEST_FILE,
    config: CONFIG_WITH_TEST_COMMAND,
    runCommand: async () => ({ ok: true, output: "Tests: 40 passed\n" }),
    ...overrides,
    extra: {
      _readFile: (path) => {
        const p = String(path);
        if (p === CONFIG_PATH) return CONFIG_WITH_TEST_COMMAND;
        if (p.includes("/PLAN-")) return PLAN_TWO_WAVES_ONE_TEST_FILE;
        if (p === TEST_FILE) return fileText;
        return null;
      },
      ...(overrides.extra || {}),
    },
  });

describe("Phase I — the un-skip guard: a green gate over tests that never ran", () => {
  it("halts the wave whose completed task still owns a skipped block, naming file, line and task", async () => {
    const gitCalls = [];
    const result = await main(
      unskipArgs(testFileSkipping("T1 — the completed owner's block"), {
        git: makeGit(gitCalls),
      })
    );

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Error: Wave 1 un-skip guard failed");
    // File, line and owning task, all three, on the row an operator reads.
    expect(result.haltReason).toContain(`${TEST_FILE}:5 describe.skip`);
    expect(result.haltReason).toContain("T1 — the completed owner's block");
    expect(result.haltReason).toContain("owned by T1");
    // Nothing was committed — the guard sits before the commits, like a red gate.
    expect(gitCalls.filter((a) => a[0] === "commit")).toEqual([]);
  });

  it("leaves a LATER wave's block alone in wave 1, and catches it once that wave completes", async () => {
    const logs = [];
    const result = await main(
      unskipArgs(testFileSkipping("T2 — the later wave's block"), { logs })
    );

    // Wave 1 scanned the file and passed it: T2 has not run yet, so its block is
    // legitimately still skipped.
    expect(
      logs.filter((m) => m.includes("Wave 1 un-skip guard: 1 owned test file(s) scanned")).length
    ).toBe(1);
    expect(result.haltReason).not.toContain("Wave 1 un-skip guard failed");
    // Wave 2 completes T2 and the very same block is now owed.
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Error: Wave 2 un-skip guard failed");
    expect(result.haltReason).toContain("owned by T2");
  });

  it("ignores skip tokens that are commented out, quoted, or environment-gated", async () => {
    const logs = [];
    const decoys = [
      '// describe.skip("T1 — a comment, not a block", () => {});',
      "/*",
      ' * it.skip("T1 — a block comment") stays a comment',
      " */",
      'const sample = "describe.skip(\\"T1 — a string\\")";',
      "const gated = process.env.CI ? 1 : 0;",
      'describe("real suite", () => {',
      "  (gated ? it : it.skip)(\"T1 — environment-gated, a sanctioned skip\", () => {});",
      "  it(\"asserts\", () => { expect(sample).toContain(\"describe\"); });",
      "});",
      "",
    ].join("\n");

    const result = await main(unskipArgs(decoys, { logs }));

    expect(result.outcome).toBe("success");
    // The positive half: the file WAS read and scanned, so the absence of a
    // violation is a judgement, not a file that never got looked at.
    expect(
      logs.filter((m) => m.includes("un-skip guard: 1 owned test file(s) scanned")).length
    ).toBe(2);
  });

  it("degrades to a notice when an owned test file cannot be read", async () => {
    const logs = [];
    const result = await main(unskipArgs(null, { logs }));

    expect(result.outcome).toBe("success");
    const notices = logs.filter((m) => m.includes("un-skip guard:") && m.includes("could not be read"));
    expect(notices.length).toBe(2);
    expect(notices[0]).toBe(
      `Notice: Wave 1 un-skip guard: ${TEST_FILE} could not be read — not scanned`
    );
  });
});

describe("checkWaveUnskips / scanSkipTokens — the guard's decision rule in isolation", () => {
  const waves = [
    [{ id: "T1", files: ["src/one.js", "src/one.test.js"] }],
    [{ id: "T2", files: ["src/two.js"] }],
  ];
  const reader = (text) => async (path) =>
    String(path) === "src/one.test.js" ? text : null;

  it("attributes an untitled block to the file's owners, and owes it only when all are complete", async () => {
    const text = 'describe.skip("no task named here", () => {});\n';
    // Wave 1: T2 also owns the file in this plan, and T2 has not run.
    const bothOwn = [
      [{ id: "T1", files: ["src/one.test.js"] }],
      [{ id: "T2", files: ["src/one.test.js"] }],
    ];
    const early = await checkWaveUnskips({
      waves: bothOwn,
      waveIndex: 0,
      _readFile: reader(text),
    });
    expect(early.violations).toEqual([]);
    expect(early.scanned).toEqual(["src/one.test.js"]);

    const late = await checkWaveUnskips({
      waves: bothOwn,
      waveIndex: 1,
      _readFile: reader(text),
    });
    expect(late.violations.map((v) => v.owners)).toEqual([["T1", "T2"]]);
  });

  it("matches task ids as whole tokens — T1 in the title is not T10", async () => {
    const plan = [
      [{ id: "T10", files: ["src/one.test.js"] }],
      [{ id: "T1", files: ["src/two.js"] }],
    ];
    const result = await checkWaveUnskips({
      waves: plan,
      waveIndex: 0,
      _readFile: reader('describe.skip("T1 — owned by the later task", () => {});\n'),
    });
    expect(result.violations).toEqual([]);
  });

  it("reports an empty wave plan and a missing transport as notices, not violations", async () => {
    const noPlan = await checkWaveUnskips({ waves: [], waveIndex: 0, _readFile: reader("") });
    expect(noPlan.violations).toEqual([]);
    expect(noPlan.notices).toEqual(["no wave plan to scan"]);

    const noTransport = await checkWaveUnskips({ waves, waveIndex: 0 });
    expect(noTransport.violations).toEqual([]);
    expect(noTransport.notices).toEqual([
      "no _readFile transport — owned test files were not scanned",
    ]);

    const noTestFiles = await checkWaveUnskips({
      waves: [[{ id: "T1", files: ["src/one.js"] }]],
      waveIndex: 0,
      _readFile: reader(""),
    });
    expect(noTestFiles.violations).toEqual([]);
    expect(noTestFiles.notices).toEqual([
      "no completed task owns a test file in the PLAN's manifest — nothing to scan",
    ]);
  });

  it("finds statement-position tokens only, and reports line, token and title", () => {
    const source = [
      "describe.skip('A — first', () => {});",
      "(cond ? test : test.skip)('B — gated', () => {});",
      "// it.skip('C — commented')",
      "const s = `describe.skip('D — templated')`;",
      "if (x) { it.skip('E — mid-line, not a block', () => {}); }",
      "const re = /it\\.skip\\(/;",
      "function f() {}",
      "describe.skip('G — after a closing brace', () => {});",
    ].join("\n");

    expect(scanSkipTokens(source)).toEqual([
      { line: 1, token: "describe.skip", title: "A — first" },
      { line: 8, token: "describe.skip", title: "G — after a closing brace" },
    ]);
  });
});

// ─── Phase I: postWaveCommand and postWavePathspecs ───────────────────────────

describe("Phase I — the post-wave command and its build-output commit", () => {
  const CONFIG_WITH_POST_WAVE = JSON.stringify({
    implementation: {
      testCommand: "npm test",
      postWaveCommand: "node build.mjs",
      postWavePathspecs: ["dist/"],
    },
  });

  it("runs the post-wave command BEFORE the gate and commits the pathspecs", async () => {
    const gitCalls = [];
    const ran = [];
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_POST_WAVE,
        git: makeGit(gitCalls),
        runCommand: async (cmd) => {
          ran.push(cmd);
          return { ok: true, output: "ok" };
        },
      })
    );
    expect(result.outcome).toBe("success");
    // The BUILD precedes the wave's gate: the suite asserts generated-artifact
    // freshness, so a source-editing wave must be built before it is judged.
    // Then the V-wave's verification run of the test command (§3.2 row 2) —
    // the build belongs to the implementation waves and is not repeated there.
    expect(ran).toEqual(["node build.mjs", "npm test", "npm test"]);

    const commits = gitCalls.filter((a) => a[0] === "commit").map((a) => a[2]);
    expect(commits).toEqual([
      "feat(test-feat): T1 — First task",
      "feat(test-feat): T2 — Second task",
      "chore(test-feat): wave 1 build outputs",
    ]);
    expect(gitCalls).toContainEqual(["add", "--", "dist/"]);
  });

  it("a failing post-wave command halts the wave", async () => {
    const gitCalls = [];
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_POST_WAVE,
        git: makeGit(gitCalls),
        runCommand: async (cmd) =>
          cmd === "npm test"
            ? { ok: true, output: "green" }
            : { ok: false, output: "SyntaxError: unexpected token" },
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Error: Wave 1 post-wave command failed");
    expect(result.haltReason).toContain("node build.mjs");
    expect(result.haltReason).toContain("SyntaxError: unexpected token");
    expect(gitCalls.filter((a) => a[0] === "commit")).toEqual([]);
  });

  it("skips the build-output commit when the pathspecs stage nothing", async () => {
    const gitCalls = [];
    const logs = [];
    const git = async (argv) => {
      gitCalls.push(argv);
      if (argv.join(" ") === "rev-parse --abbrev-ref HEAD") {
        return { ok: true, stdout: `${BRANCH}\n`, stderr: "" };
      }
      if (argv[0] === "diff") {
        // `dist/` staged nothing; the task files did.
        const staged = argv.includes("dist/") ? "" : argv.slice(4).join("\n");
        return { ok: true, stdout: `${staged}\n`, stderr: "" };
      }
      return { ok: true, stdout: "", stderr: "" };
    };
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_POST_WAVE,
        git,
        logs,
        runCommand: async () => ({ ok: true, output: "ok" }),
      })
    );
    expect(result.outcome).toBe("success");

    const commits = gitCalls.filter((a) => a[0] === "commit").map((a) => a[2]);
    // Absence of the build-output commit, paired with the positive that the two
    // task commits DID happen through the same code path.
    expect(commits).toEqual([
      "feat(test-feat): T1 — First task",
      "feat(test-feat): T2 — Second task",
    ]);
    expect(
      logs.some((m) => m === "Wave 1 build outputs: nothing staged — no changes to commit")
    ).toBe(true);
  });
});

// ─── Phase I: the A6 advisory wave gate call site (TSPEC §2.3/§3.2, PLAN A6-21) ──
//
// `runWaveGateSeam` itself (PLAN A6-14/A6-18) is exercised elsewhere, in
// isolation. Here the wave loop's own CALL SITE is under test: a fake injected
// through `_runWaveGateSeam` stands in for the seam, so every assertion below is
// about WHEN the loop calls it, what it does with a `resolved`/`unresolved`
// reply, and how `haltError`'s `{ advisory }` detail reaches the report — never
// about the seam's own diagnosis.
describe("Phase I — the A6 advisory wave gate call site", () => {
  // The five-key disabled-tier sentinel `runWaveGateSeam` itself returns
  // (`orchestrate-dev.js`, `noHaltFields`) — transcribed, not imported. A call-site double must
  // stand in for a shape production can actually produce: a four-key stand-in would let a future
  // non-null-disposition case assert a four-key `haltAdvisory` against a five-key reality
  // (DC-03's canonical-double rule; CR round 1, PM F-03).
  const NO_HALT_FIELDS = {
    rootCause: "unclassified",
    diagnosis: "",
    repairApplied: false,
    repairPaths: [],
    snapshotRef: null,
  };

  function makeA6Fake(behavior) {
    const calls = [];
    const fn = async (args) => {
      calls.push(args);
      return typeof behavior === "function" ? behavior(args, calls) : behavior;
    };
    return { calls, fn };
  }

  it("AT-01-2 / PROP-SEAM-03: a post-wave command failure halts before A6 is ever called", async () => {
    const a6 = makeA6Fake({ resolved: true, disposition: null, haltFields: NO_HALT_FIELDS, postWaveRan: false });
    const CONFIG_WITH_POST_WAVE = JSON.stringify({
      implementation: {
        testCommand: "npm test",
        postWaveCommand: "node build.mjs",
        postWavePathspecs: ["dist/"],
      },
    });
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_POST_WAVE,
        runCommand: async (cmd) =>
          cmd === "node build.mjs" ? { ok: false, output: "SyntaxError" } : { ok: true, output: "Tests: 40 passed\n" },
        extra: { _runWaveGateSeam: a6.fn },
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Error: Wave 1 post-wave command failed");
    expect(a6.calls.length).toBe(0);
  });

  it("AT-01-3 / PROP-SEAM-04: the V-wave's own separate gate call site never calls A6 either", async () => {
    const a6 = makeA6Fake({ resolved: true, disposition: null, haltFields: NO_HALT_FIELDS, postWaveRan: false });
    let n = 0;
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        runCommand: async () => {
          n += 1;
          // Call 1: the implementation wave's own gate (green). Call 2: the
          // V-wave's gate, run through the SAME `runCommandFn` but a DIFFERENT
          // call site — the one under test here.
          return n === 1 ? { ok: true, output: "Tests: 40 passed\n" } : { ok: false, output: "FAIL src/prop.test.js\n" };
        },
        extra: { _runWaveGateSeam: a6.fn },
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("PROPERTIES test gate failed");
    expect(a6.calls.length).toBe(0);
  });

  it("AT-04-3: an all-green run never calls A6, and its commits stay byte-identical to the pre-A6 baseline", async () => {
    const a6 = makeA6Fake({ resolved: true, disposition: null, haltFields: NO_HALT_FIELDS, postWaveRan: false });
    const gitCalls = [];
    const ran = [];
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git: makeGit(gitCalls),
        runCommand: async (cmd) => {
          ran.push(cmd);
          return { ok: true, output: "Tests: 40 passed\n" };
        },
        extra: { _runWaveGateSeam: a6.fn },
      })
    );

    expect(result.outcome).toBe("success");
    expect(ran).toEqual(["npm test", "npm test"]);
    const adds = gitCalls.filter((a) => a[0] === "add");
    expect(adds).toEqual([
      ["add", "--", "src/one.js"],
      ["add", "--", "src/two.js"],
    ]);
    const commits = gitCalls.filter((a) => a[0] === "commit");
    expect(commits).toEqual([
      ["commit", "-m", "feat(test-feat): T1 — First task"],
      ["commit", "-m", "feat(test-feat): T2 — Second task"],
    ]);
    expect(result.haltAdvisory).toBeUndefined();
    expect(a6.calls.length).toBe(0);
  });

  it("AT-07-3 / red-gate-resolved: A6 fires once, the wave's own per-task commits still land, and the halt report carries no haltAdvisory", async () => {
    const a6 = makeA6Fake({
      resolved: true,
      disposition: { seam: "A6", outcome: "resolved", reason: null, verdict: null, attempts: 1, model: "m", fallback: false },
      haltFields: { rootCause: "environmental", diagnosis: "a transient failure", repairApplied: false, repairPaths: [] },
      postWaveRan: false,
    });
    const gitCalls = [];
    let n = 0;
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git: makeGit(gitCalls),
        runCommand: async () => {
          n += 1;
          // Only the FIRST gate call (wave 1) is red; A6's own re-gate is
          // internal to the (faked) seam and never re-invokes `_runCommand`
          // through this call site.
          return n === 1 ? { ok: false, output: "Tests: 1 failed, 39 passed\n" } : { ok: true, output: "Tests: 40 passed\n" };
        },
        extra: { _runWaveGateSeam: a6.fn },
      })
    );

    expect(result.outcome).toBe("success");
    expect(a6.calls.length).toBe(1);
    const commits = gitCalls.filter((a) => a[0] === "commit");
    expect(commits.length).toBeGreaterThanOrEqual(1);
    // A resolved wave that reached the un-skip guard clean carries no per-halt
    // advisory field at all — there was no halt.
    expect(result.haltAdvisory).toBeUndefined();
  });

  it("an unresolved A6 attempt (disposition present) carries its haltFields as haltAdvisory on the test-gate halt itself", async () => {
    const haltFields = {
      rootCause: "unclassified",
      diagnosis: "the reply did not classify the failure",
      repairApplied: false,
      repairPaths: [],
    };
    const a6 = makeA6Fake({
      resolved: false,
      disposition: { seam: "A6", outcome: "escalated", reason: "no-verdict", verdict: null, attempts: 3, model: "m", fallback: false },
      haltFields,
      postWaveRan: false,
    });
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        runCommand: async () => ({ ok: false, output: "Tests: 1 failed, 39 passed\n" }),
        extra: { _runWaveGateSeam: a6.fn },
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Error: Wave 1 test gate failed");
    expect(a6.calls.length).toBe(1);
    expect(result.haltAdvisory).toEqual(haltFields);
  });

  it("the tier-disabled sentinel (disposition null) never leaks a haltAdvisory key onto the test-gate halt", async () => {
    const a6 = makeA6Fake({ resolved: false, disposition: null, haltFields: NO_HALT_FIELDS, postWaveRan: false });
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        runCommand: async () => ({ ok: false, output: "Tests: 1 failed, 39 passed\n" }),
        extra: { _runWaveGateSeam: a6.fn },
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Error: Wave 1 test gate failed");
    expect(a6.calls.length).toBe(1);
    expect(result.haltAdvisory).toBeUndefined();
  });

  it("AT-05-3 / PROP-REST-09: an unresolved A6 wave halts on EXACTLY the pre-A6 reason string and writes its queue row `halted`", async () => {
    // CODE_REVIEW v1 §2 row 23: the only A6-path assertions on this reason were `toContain`
    // fragments, which a rewritten or A6-decorated message would still satisfy. The oracle the
    // property actually names is EQUALITY against the reason the pre-A6 pipeline emits for the
    // same gate failure, so the baseline is captured from a run on identical inputs in which
    // the tier is off — NFR-2's byte-identical baseline — rather than transcribed as a literal
    // that would drift with the message.
    const redGate = async () => ({ ok: false, output: "Tests: 1 failed, 39 passed\n" });

    // Baseline: the tier-disabled sentinel (disposition null) — A6 contributes nothing.
    const baselineQueueRows = [];
    const baselineA6 = makeA6Fake({ resolved: false, disposition: null, haltFields: NO_HALT_FIELDS, postWaveRan: false });
    const baseline = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        runCommand: redGate,
        extra: {
          _runWaveGateSeam: baselineA6.fn,
          _recordQueueRow: async (row) => {
            baselineQueueRows.push(row);
            return { queueRow: "recorded" };
          },
        },
      })
    );

    // The A6 run: the seam fires, does not resolve, and escalates.
    const a6QueueRows = [];
    const a6 = makeA6Fake({
      resolved: false,
      disposition: { seam: "A6", outcome: "escalated", reason: "budget-exhausted", verdict: null, attempts: 3, model: "m", fallback: false },
      haltFields: { rootCause: "wave-internal-defect", diagnosis: "could not repair", repairApplied: true, repairPaths: ["src/one.js"] },
      postWaveRan: false,
    });
    const withA6 = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        runCommand: redGate,
        extra: {
          _runWaveGateSeam: a6.fn,
          _recordQueueRow: async (row) => {
            a6QueueRows.push(row);
            return { queueRow: "recorded" };
          },
        },
      })
    );

    // Both halted, and A6 really did run on the second.
    expect(baseline.outcome).toBe("halted");
    expect(withA6.outcome).toBe("halted");
    expect(baselineA6.calls.length).toBe(1);
    expect(a6.calls.length).toBe(1);
    expect(withA6.haltAdvisory).toBeDefined();
    expect(baseline.haltAdvisory).toBeUndefined();

    // Conjunct 1 — EQUALITY, not containment. An escalated A6 adds its findings to the report's
    // advisory channel, never to the halt reason.
    expect(withA6.haltReason).toBe(baseline.haltReason);

    // Non-vacuity: the baseline reason really is the wave-gate literal, so an equality that
    // held because both runs halted somewhere else entirely would not pass silently.
    expect(baseline.haltReason).toContain("Error: Wave 1 test gate failed");

    // Conjunct 2 — the queue row is written `halted`, exactly as the pre-A6 pipeline writes it.
    expect(a6QueueRows.map((r) => r.status)).toEqual(["halted"]);
    expect(a6QueueRows).toEqual(baselineQueueRows);
    expect(withA6.queueRow).toBe("recorded");
  });

  it("AT-07-3 / PROP-GATE-10: on one run carrying a green wave AND a red-gated wave, the green wave pays nothing — zero A6 dispatches — while still reaching its post-gate commit, and only the red wave dispatches", async () => {
    // CODE_REVIEW v1 §2 row 33: NFR-5's oracle is a run whose population contains BOTH kinds of
    // wave. AT-07-3 as shipped was a single-wave run asserting `a6.calls.length === 1`, which
    // cannot separate "the green wave paid nothing" from "there was no green wave"; AT-04-3 is
    // an all-green run, the other half-population. This is the two-wave fixture neither had.
    const a6 = makeA6Fake({
      resolved: true,
      disposition: { seam: "A6", outcome: "resolved", reason: null, verdict: null, attempts: 1, model: "m", fallback: false },
      haltFields: { rootCause: "wave-internal-defect", diagnosis: "repaired", repairApplied: true, repairPaths: ["src/two.js"] },
      postWaveRan: false,
    });
    const gitCalls = [];
    const gateCalls = [];
    const result = await main(
      makeArgs({
        plan: PLAN_TWO_WAVES,
        config: CONFIG_WITH_TEST_COMMAND,
        git: makeGit(gitCalls),
        runCommand: async (cmd) => {
          gateCalls.push(cmd);
          // Wave 1's gate (call 1) is GREEN. Wave 2's gate (call 2) is RED — that is the wave
          // A6 is dispatched on. Its internal re-gate is inside the faked seam. Call 3 is the
          // V-wave's own gate, which stays green so the run reaches success.
          return gateCalls.length === 2
            ? { ok: false, output: "Tests: 1 failed, 39 passed\n" }
            : { ok: true, output: "Tests: 40 passed\n" };
        },
        extra: { _runWaveGateSeam: a6.fn },
      })
    );

    expect(result.outcome).toBe("success");

    // Conjunct 1 — the green wave's dispatch count is 0 and the red wave's is >= 1. Asserted
    // as a per-wave tally, not a run total: a total of 1 is equally consistent with the green
    // wave having been the one that dispatched.
    const dispatchesByWave = new Map();
    for (const call of a6.calls) {
      dispatchesByWave.set(call.waveNum, (dispatchesByWave.get(call.waveNum) || 0) + 1);
    }
    expect(dispatchesByWave.get(1) || 0).toBe(0);
    expect(dispatchesByWave.get(2) || 0).toBeGreaterThanOrEqual(1);

    // Conjunct 2 — the green wave still reached its post-gate commit step. A wave that paid
    // nothing but also never committed would satisfy conjunct 1 vacuously.
    const commits = gitCalls.filter((a) => a[0] === "commit").map((a) => a[2]);
    expect(commits).toContain("feat(test-feat): T1 — First task");
    expect(commits).toContain("feat(test-feat): T2 — Second task");
    const adds = gitCalls.filter((a) => a[0] === "add");
    expect(adds).toEqual([
      ["add", "--", "src/one.js"],
      ["add", "--", "src/two.js"],
    ]);

    // No timing assertion — NFR-5's claim is structural (A6 is reachable only from a red gate),
    // per PROPERTIES' own "not tested" row 2.
  });

  it("AT-05-4 / PROP-REST-04: an un-skip halt on the SAME wave A6 just resolved carries that wave's advisory fields as haltAdvisory, with the repair recorded as APPLIED", async () => {
    // CODE_REVIEW v1 §2 row 22: this fixture used to set `repairApplied: false, repairPaths: []`,
    // which is the one shape the property forbids here. PROP-REST-04's subject is a wave A6
    // RESOLVED — resolution on this seam requires an applied repair that greened the re-gate —
    // so the halt fields riding through to the later un-skip halt must describe that repair and
    // name its paths. With the old fixture the assertion held for a run in which A6 had applied
    // nothing, and so could not distinguish "the repair survived" from "there was no repair".
    // The seam-level conjuncts (no restoration ran, the repair is still in the working tree) are
    // pinned against a real repository in advisoryWaveGate.test.js's PROP-REST-04 block; what
    // this test owns is the `main()`-level pass-through.
    const a6HaltFields = {
      rootCause: "wave-internal-defect",
      diagnosis: "a stale import, repaired",
      repairApplied: true,
      repairPaths: ["src/one.js"],
    };
    const a6 = makeA6Fake({
      resolved: true,
      disposition: { seam: "A6", outcome: "resolved", reason: null, verdict: null, attempts: 1, model: "m", fallback: false },
      haltFields: a6HaltFields,
      postWaveRan: false,
    });
    let n = 0;
    const result = await main(
      unskipArgs(testFileSkipping("T1 — the completed owner's block"), {
        runCommand: async () => {
          n += 1;
          return n === 1 ? { ok: false, output: "Tests: 1 failed, 39 passed\n" } : { ok: true, output: "Tests: 40 passed\n" };
        },
        extra: { _runWaveGateSeam: a6.fn },
      })
    );

    expect(result.outcome).toBe("halted");
    expect(a6.calls.length).toBe(1);
    expect(result.haltAdvisory).toEqual(a6HaltFields);

    // PROP-REST-04's last conjunct: `formatUnskipViolations`' message string is UNCHANGED by
    // A6's presence. Asserted against the paired negative below — the same halt on a run where
    // A6 never fired — so this is an equality against a captured baseline rather than a
    // `toContain` fragment that a rewritten message would still satisfy.
    const baseline = await main(
      unskipArgs(testFileSkipping("T1 — the completed owner's block"), {
        extra: { _runWaveGateSeam: makeA6Fake({ resolved: true, disposition: null, haltFields: NO_HALT_FIELDS, postWaveRan: false }).fn },
      })
    );
    expect(baseline.haltAdvisory).toBeUndefined();
    expect(result.haltReason).toBe(baseline.haltReason);
    expect(result.haltReason).toContain("Error: Wave 1 un-skip guard failed");
  });

  it("AT-05-4 (paired negative): the very same un-skip halt with a green-from-the-start gate carries no haltAdvisory — A6 never fired", async () => {
    const a6 = makeA6Fake({ resolved: true, disposition: null, haltFields: NO_HALT_FIELDS, postWaveRan: false });
    const result = await main(
      unskipArgs(testFileSkipping("T1 — the completed owner's block"), {
        extra: { _runWaveGateSeam: a6.fn },
      })
    );

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Error: Wave 1 un-skip guard failed");
    expect(a6.calls.length).toBe(0);
    expect(result.haltAdvisory).toBeUndefined();
  });

  it("AT-06-4's un-skip arm / PROP-REC-10 (PLAN A6-21): an un-skip halt on the SAME wave A6 just resolved with a captured snapshot carries the co-located overwrite notice", async () => {
    // TSPEC §4.5's un-skip row / BR-14 — the seam has already returned by the time this halt
    // fires, so this push happens at the un-skip halt site itself, through the same
    // `advisoryNotice` sink `runWaveGateSeam` uses. Same oracle shape as A6-18's seam-level
    // arm: pick the single `notices` element matching the ref pattern and assert the overwrite
    // predicate ON THAT SAME element — both halves matched by spec-side literals written here,
    // never by a constant imported from the module under test (anti-echo).
    const waveNum = 1;
    const snapshotRef = `refs/pdlc/a6-snapshot-${waveNum}`;
    const a6 = makeA6Fake({
      resolved: true,
      disposition: { seam: "A6", outcome: "resolved", reason: null, verdict: null, attempts: 1, model: "m", fallback: false },
      haltFields: {
        rootCause: "wave-internal-defect",
        diagnosis: "a stale import, repaired",
        repairApplied: true,
        repairPaths: ["src/one.js"],
        snapshotRef,
      },
      postWaveRan: false,
    });
    let n = 0;
    const result = await main(
      unskipArgs(testFileSkipping("T1 — the completed owner's block"), {
        runCommand: async () => {
          n += 1;
          return n === 1 ? { ok: false, output: "Tests: 1 failed, 39 passed\n" } : { ok: true, output: "Tests: 40 passed\n" };
        },
        extra: { _runWaveGateSeam: a6.fn },
      })
    );

    expect(result.outcome).toBe("halted");
    expect(a6.calls.length).toBe(1);
    expect(result.haltReason).toContain("Error: Wave 1 un-skip guard failed");
    const overwriteNotice = result.notices.find((notice) => notice.includes(snapshotRef));
    expect(overwriteNotice).toBeTruthy();
    // The spec-side PHRASE, not the bare stem `/overwrit/i`: a notice reading "re-running never
    // overwrites that capture" — the inverted meaning — satisfies the stem while contradicting
    // BR-14 (CR round 1, TE F-03). The capture's NAME stays out of the predicate; that half is
    // matched by the `includes(snapshotRef)` selection above, which is O-1's.
    expect(overwriteNotice).toMatch(/overwrites that capture/i);
  });

  it("AT-06-4's un-skip arm / PROP-REC-10 (paired negative): the same un-skip halt with A6 never firing on the wave carries no overwrite notice anywhere in notices", async () => {
    const a6 = makeA6Fake({ resolved: true, disposition: null, haltFields: NO_HALT_FIELDS, postWaveRan: false });
    const result = await main(
      unskipArgs(testFileSkipping("T1 — the completed owner's block"), {
        extra: { _runWaveGateSeam: a6.fn },
      })
    );

    expect(result.outcome).toBe("halted");
    expect(a6.calls.length).toBe(0);
    expect(result.haltAdvisory).toBeUndefined();
    expect(result.notices.some((notice) => /overwrit/i.test(notice))).toBe(false);
  });

  it("AT-04-5 / PROP-GATE-08: an A6-resolved E-6 repair promotes a LATER wave's owned file into its own dedicated commit, on top of (never widening) the owning task's own pathspec", async () => {
    const a6 = makeA6Fake({
      resolved: true,
      disposition: { seam: "A6", outcome: "resolved", reason: null, verdict: null, attempts: 1, model: "m", fallback: false },
      haltFields: {
        rootCause: "plan-ordering-defect",
        diagnosis: "the fix landed in T2's own file",
        repairApplied: true,
        // `src/two.js` is T2's (wave 2) owned file — LATER than wave 1, where the
        // gate failed. Not `src/one.test.js`, which wave 1 already owns.
        repairPaths: ["src/two.js"],
      },
      postWaveRan: false,
    });
    const gitCalls = [];
    let n = 0;
    const result = await main(
      unskipArgs(
        [
          'describe("the block that really runs", () => {',
          '  it("asserts something", () => {});',
          "});",
          "",
        ].join("\n"),
        {
          git: makeGit(gitCalls),
          runCommand: async () => {
            n += 1;
            return n === 1
              ? { ok: false, output: "Tests: 1 failed, 39 passed\n" }
              : { ok: true, output: "Tests: 40 passed\n" };
          },
          extra: { _runWaveGateSeam: a6.fn },
        }
      )
    );

    expect(result.outcome).toBe("success");
    const commits = gitCalls.filter((a) => a[0] === "commit").map((a) => a[2]);
    // The owning task's own commit (T1, wave 1) is untouched; the promotion is
    // its OWN commit, with DEC-A6-02's literal message, landing after T1's.
    expect(commits).toContain("feat(test-feat): T1 — First task");
    expect(commits).toContain("chore(test-feat): wave 1 advisory promotion (T2)");
    // The promotion commit's pathspec is the repaired file alone — never folded
    // into T1's own `add`.
    expect(gitCalls).toContainEqual(["add", "--", "src/two.js"]);
    const t1Add = gitCalls.find(
      (a) => a[0] === "add" && a.includes("src/one.js") && a.includes("src/one.test.js")
    );
    expect(t1Add).toBeTruthy();
    expect(t1Add).not.toContain("src/two.js");
  });

  // ── PROP-GATE-09 (AC-4.6) — the later task's DISPATCH is told about the promotion ──
  //
  // CR round 1, PM F-06: the production assembler existed and was correctly placed
  // (`waveImplementPrompt`'s `promotionsClause`, populated from the wave loop's `promotions`
  // map at COMMIT time), but no test drove it — half of AC-4.6 shipped unproven. These two
  // run the SAME fixture as AT-04-5 above and differ in exactly one input: whether wave 1's
  // A6 resolved an E-6 repair into T2's owned path. The negative is byte-identical, which is
  // what makes the positive's clause attributable to the promotion and to nothing else.
  const promotionFixtureArgs = (a6, gitCalls, record) =>
    unskipArgs(
      [
        'describe("the block that really runs", () => {',
        '  it("asserts something", () => {});',
        "});",
        "",
      ].join("\n"),
      {
        record,
        git: makeGit(gitCalls),
        runCommand: (() => {
          let n = 0;
          return async () => {
            n += 1;
            return n === 1
              ? { ok: false, output: "Tests: 1 failed, 39 passed\n" }
              : { ok: true, output: "Tests: 40 passed\n" };
          };
        })(),
        extra: { _runWaveGateSeam: a6.fn },
      }
    );

  const t2Prompt = (record) => {
    const dispatch = record.find(
      (c) => c.skill === "se-implement" && String(c.prompt).startsWith("Implement task T2:")
    );
    expect(dispatch).toBeTruthy();
    return String(dispatch.prompt);
  };

  const E6_RESOLVED_A6 = {
    resolved: true,
    disposition: { seam: "A6", outcome: "resolved", reason: null, verdict: null, attempts: 1, model: "m", fallback: false },
    haltFields: {
      rootCause: "plan-ordering-defect",
      diagnosis: "the fix landed in T2's own file",
      repairApplied: true,
      repairPaths: ["src/two.js"],
    },
    postWaveRan: false,
  };

  const NO_REPAIR_A6 = {
    resolved: true,
    disposition: { seam: "A6", outcome: "resolved", reason: null, verdict: null, attempts: 1, model: "m", fallback: false },
    haltFields: {
      rootCause: "wave-internal-defect",
      diagnosis: "the wave's own test file drifted",
      repairApplied: true,
      // Wave 1's OWN owned path: an E-5 repair, so no later task is promoted into.
      repairPaths: ["src/one.js"],
    },
    postWaveRan: false,
  };

  it("PROP-GATE-09 (AC-4.6): the later task's dispatch names the promoted paths it already owns", async () => {
    const record = [];
    const result = await main(promotionFixtureArgs(makeA6Fake(E6_RESOLVED_A6), [], record));

    expect(result.outcome).toBe("success");
    const prompt = t2Prompt(record);
    // The clause is addressed to T2 and names T2's OWN promoted path — the whole point of
    // AC-4.6 is that T2 revises what exists rather than rediscovering it.
    expect(prompt).toContain(
      "An earlier wave's advisory gate repair (seam A6) already committed a fix into paths you " +
        "own: src/two.js. It is on this branch already — read it, build on it, and do not revert it."
    );
    // Wave 1's own task is never told about a repair into someone else's path.
    const t1 = record.find(
      (c) => c.skill === "se-implement" && String(c.prompt).startsWith("Implement task T1:")
    );
    expect(String(t1.prompt)).not.toContain("advisory gate repair (seam A6)");
  });

  it("PROP-GATE-09 (paired negative): with no E-6 promotion the SAME dispatch is byte-identical", async () => {
    const withRecord = [];
    const withoutRecord = [];
    const withResult = await main(promotionFixtureArgs(makeA6Fake(E6_RESOLVED_A6), [], withRecord));
    const withoutResult = await main(promotionFixtureArgs(makeA6Fake(NO_REPAIR_A6), [], withoutRecord));

    expect(withResult.outcome).toBe("success");
    expect(withoutResult.outcome).toBe("success");

    const withPrompt = t2Prompt(withRecord);
    const withoutPrompt = t2Prompt(withoutRecord);

    // Byte-identical apart from the clause: the no-promotion run must not merely omit the
    // path list, it must not grow the paragraph at all (a run where A6 never fires — every
    // disabled-tier run included — dispatches exactly today's prompt).
    expect(withoutPrompt).not.toContain("advisory gate repair (seam A6)");
    const clause =
      "An earlier wave's advisory gate repair (seam A6) already committed a fix into paths you " +
      "own: src/two.js. It is on this branch already — read it, build on it, and do not revert it.\n";
    expect(withPrompt.replace(clause, "")).toBe(withoutPrompt);
  });
});

// ─── Phase I: git failures ────────────────────────────────────────────────────

describe("Phase I — index.lock retry and non-transient git failures", () => {
  it("retries a lock-blocked commit and succeeds, sleeping the fixed delay each time", async () => {
    const gitCalls = [];
    const slept = [];
    let blocked = 0;
    const git = makeGit(gitCalls, {
      fail: (argv) => {
        if (argv[0] === "commit" && blocked < 2) {
          blocked += 1;
          return {
            ok: false,
            stdout: "",
            stderr: "fatal: Unable to create '/repo/.git/index.lock': File exists.",
          };
        }
        return null;
      },
    });

    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git,
        runCommand: async () => ({ ok: true, output: "green" }),
        sleep: async (ms) => {
          slept.push(ms);
        },
      })
    );

    expect(result.outcome).toBe("success");
    expect(slept).toEqual([GIT_LOCK_RETRY_DELAY_MS, GIT_LOCK_RETRY_DELAY_MS]);
    expect(GIT_LOCK_RETRY_DELAY_MS).toBe(5000);
    // T1's commit was attempted three times, T2's once.
    expect(gitCalls.filter((a) => a[0] === "commit").length).toBe(4);
  });

  it("gives up after the fixed number of retries and halts", async () => {
    const gitCalls = [];
    const slept = [];
    const git = makeGit(gitCalls, {
      fail: (argv) =>
        argv[0] === "commit"
          ? { ok: false, stdout: "", stderr: "Unable to create index.lock: File exists." }
          : null,
    });
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git,
        runCommand: async () => ({ ok: true, output: "green" }),
        sleep: async (ms) => slept.push(ms),
      })
    );
    expect(result.outcome).toBe("halted");
    expect(slept.length).toBe(GIT_LOCK_RETRIES);
    expect(gitCalls.filter((a) => a[0] === "commit").length).toBe(GIT_LOCK_RETRIES + 1);
  });

  it("a non-lock git failure halts at once, and says the verified work is recoverable", async () => {
    const gitCalls = [];
    const slept = [];
    const git = makeGit(gitCalls, {
      fail: (argv) =>
        argv[0] === "commit"
          ? { ok: false, stdout: "", stderr: "error: pre-commit hook refused the commit" }
          : null,
    });
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git,
        runCommand: async () => ({ ok: true, output: "green" }),
        sleep: async (ms) => slept.push(ms),
      })
    );

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Wave 1 task T1 — `git commit` failed");
    expect(result.haltReason).toContain("pre-commit hook refused the commit");
    expect(result.haltReason).toContain(
      "The wave's work is verified (the orchestrator's own test gate passed) and is present in the working tree, but UNCOMMITTED."
    );
    // Not retried (absence), and the failure was reached (positive).
    expect(slept).toEqual([]);
    expect(gitCalls.filter((a) => a[0] === "commit").length).toBe(1);
  });

  it("the commit subject is shell-inert: backticks, $, backslash and double-quote are stripped", async () => {
    // The subject travels into a `git commit -m` run by the agent-transcribed
    // shell, whose quoting the script does not control — a double-quoted zsh
    // executes backticks, and PLAN descriptions legitimately carry them.
    const plan = [
      "| Task ID | Description | Batch | Dependencies |",
      "|---|---|---|---|",
      '| T1 | RED (`describe.skip`) "cost $5" \\slash | 1 | - |',
      "",
      "| Task | Files |",
      "|---|---|",
      "| T1 | `src/one.js` |",
    ].join("\n");
    const gitCalls = [];
    const result = await main(
      makeArgs({
        plan,
        config: CONFIG_WITH_TEST_COMMAND,
        git: makeGit(gitCalls),
        runCommand: async () => ({ ok: true, output: "green" }),
      })
    );
    expect(result.outcome).toBe("success");
    const commits = gitCalls.filter((a) => a[0] === "commit");
    expect(commits).toEqual([
      ["commit", "-m", "feat(test-feat): T1 — RED (describe.skip) cost 5 slash"],
    ]);
  });

  it("an 'unparseable adapter response' is transient — retried like index.lock, not a halt", async () => {
    // The `_git` seam is agent-transcribed, so the commit may have succeeded
    // with only the report garbled. One failed transcription must cost a
    // retry, never the wave.
    const gitCalls = [];
    const slept = [];
    let commitAttempts = 0;
    const git = makeGit(gitCalls, {
      fail: (argv) =>
        argv[0] === "commit" && ++commitAttempts === 1
          ? { ok: false, stdout: "", stderr: "unparseable adapter response" }
          : null,
    });
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git,
        runCommand: async () => ({ ok: true, output: "green" }),
        sleep: async (ms) => slept.push(ms),
      })
    );
    expect(result.outcome).toBe("success");
    expect(slept).toEqual([GIT_LOCK_RETRY_DELAY_MS]);
    expect(commitAttempts).toBeGreaterThan(1);
  });

  it("a pathspec that 'did not match any files' is transient — the transport ran git from the wrong cwd", async () => {
    // The tracked file exists at the repo root; only an agent that ignored the
    // prompt's "from the repository root" can see this error. A retry is a new
    // agent, and `git add` is idempotent.
    const gitCalls = [];
    const slept = [];
    let addAttempts = 0;
    const git = makeGit(gitCalls, {
      fail: (argv) =>
        argv[0] === "add" && ++addAttempts === 1
          ? { ok: false, stdout: "", stderr: "fatal: pathspec 'src/one.js' did not match any files" }
          : null,
    });
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git,
        runCommand: async () => ({ ok: true, output: "green" }),
        sleep: async (ms) => slept.push(ms),
      })
    );
    expect(result.outcome).toBe("success");
    expect(slept).toEqual([GIT_LOCK_RETRY_DELAY_MS]);
    expect(addAttempts).toBeGreaterThan(1);
  });

  it("a commit refused as 'nothing to commit' is the read-back's late verdict — a notice, not a halt", async () => {
    // The staged read-back travels the agent-transcribed channel, so a garbled
    // non-empty answer can push a no-change task into `git commit` anyway. Git's
    // own refusal must land as the nothing-staged notice, never as a halt.
    const gitCalls = [];
    const logs = [];
    const slept = [];
    const git = makeGit(gitCalls, {
      fail: (argv) =>
        argv[0] === "commit"
          ? {
              ok: false,
              stdout:
                "On branch feat-test-feat\nnothing added to commit but untracked files present (use \"git add\" to track)",
              stderr: "",
            }
          : null,
    });
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git,
        logs,
        runCommand: async () => ({ ok: true, output: "green" }),
        sleep: async (ms) => slept.push(ms),
      })
    );
    expect(result.outcome).toBe("success");
    expect(slept).toEqual([]);
    expect(
      logs.some((m) => m === "Wave 1 task T1: nothing staged — no changes to commit")
    ).toBe(true);
  });

  it("a failing `git add` halts with the same recoverable-work remedy", async () => {
    const gitCalls = [];
    const git = makeGit(gitCalls, {
      fail: (argv) =>
        argv[0] === "add"
          ? { ok: false, stdout: "", stderr: "fatal: pathspec 'src/one.js' did not match" }
          : null,
    });
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git,
        runCommand: async () => ({ ok: true, output: "green" }),
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("`git add -- src/one.js` failed");
    expect(result.haltReason).toContain("but UNCOMMITTED");
    expect(gitCalls.filter((a) => a[0] === "commit")).toEqual([]);
  });

  it("a task whose add stages nothing is skipped with a notice, not committed", async () => {
    const gitCalls = [];
    const logs = [];
    const git = async (argv) => {
      gitCalls.push(argv);
      if (argv.join(" ") === "rev-parse --abbrev-ref HEAD") {
        return { ok: true, stdout: `${BRANCH}\n`, stderr: "" };
      }
      if (argv[0] === "diff") {
        const staged = argv.includes("src/one.js") ? "" : argv.slice(4).join("\n");
        return { ok: true, stdout: `${staged}\n`, stderr: "" };
      }
      return { ok: true, stdout: "", stderr: "" };
    };
    const result = await main(
      makeArgs({
        config: CONFIG_WITH_TEST_COMMAND,
        git,
        logs,
        runCommand: async () => ({ ok: true, output: "green" }),
      })
    );
    expect(result.outcome).toBe("success");
    expect(gitCalls.filter((a) => a[0] === "commit").map((a) => a[2])).toEqual([
      "feat(test-feat): T2 — Second task",
    ]);
    expect(
      logs.some((m) => m === "Wave 1 task T1: nothing staged — no changes to commit")
    ).toBe(true);
  });
});

// ─── Phase I's final V-wave — PROPOSAL §3.2 row 2 (Phase PT absorbed) ─────────
//
// Phase PT is no longer a top-level phase body. In WAVE mode it is the run's
// last wave (the "V-wave"): dispatched after the last implementation wave has
// been gated and committed, and verified by the SAME script-owned test command.
// In LEGACY mode it is yesterday's dispatch, byte for byte, relocated inside
// Phase I. Both paths still record the `PT` row, because the compression is
// execution-structural and not report-shape.
//
// Every literal below is spelled out here rather than imported from the subject
// (PROPOSAL §3.5, "no implementation echoes").

const V_WAVE_PROMPT_ANCHOR = `Implement PROPERTIES tests for feature ${FEATURE}.`;
const V_WAVE_COMMIT_CLAUSE =
  "Run the full test suite. All tests must pass before committing. Commit and push.";

/** A `main()` argument set whose git, agent and command doubles share one clock. */
function makeOrderedArgs({ events, config = CONFIG_WITH_TEST_COMMAND, runCommand, extra = {} }) {
  const record = [];
  const inner = makeAgent(record);
  return makeArgs({
    config,
    extra: {
      _agent: async (skill, prompt, opts) => {
        events.push({ kind: "agent", skill, prompt: String(prompt), opts });
        return inner(skill, prompt, opts);
      },
      ...extra,
    },
    git: async (argv) => {
      events.push({ kind: "git", argv });
      const joined = argv.join(" ");
      if (joined === "rev-parse --abbrev-ref HEAD") {
        return { ok: true, stdout: `${BRANCH}\n`, stderr: "" };
      }
      if (argv[0] === "diff") return { ok: true, stdout: `${argv.slice(4).join("\n")}\n`, stderr: "" };
      return { ok: true, stdout: "", stderr: "" };
    },
    runCommand:
      runCommand ||
      (async (cmd) => {
        events.push({ kind: "cmd", cmd });
        return { ok: true, output: "Tests: 40 passed\n" };
      }),
  });
}

describe("Phase I's V-wave — PROPERTIES tests as the last wave (§3.2 row 2)", () => {
  it("runs the V-wave AFTER the last implementation wave commits, and gates it with testCommand", async () => {
    const events = [];
    const result = await main(makeOrderedArgs({ events }));
    expect(result.outcome).toBe("success");

    const vWaveIdx = events.findIndex(
      (e) => e.kind === "agent" && e.prompt.includes(V_WAVE_PROMPT_ANCHOR)
    );
    expect(vWaveIdx).toBeGreaterThan(-1);

    // The last implementation-wave commit precedes the V-wave dispatch …
    const commitIdxs = events
      .map((e, i) => (e.kind === "git" && e.argv[0] === "commit" ? i : -1))
      .filter((i) => i >= 0);
    expect(commitIdxs.length).toBe(2); // T1 and T2 — the whole implementation wave
    expect(Math.max(...commitIdxs)).toBeLessThan(vWaveIdx);

    // … and the script's verification run follows it.
    const cmdIdxs = events.map((e, i) => (e.kind === "cmd" ? i : -1)).filter((i) => i >= 0);
    expect(cmdIdxs.length).toBe(2); // the wave gate, then the V-wave gate
    expect(cmdIdxs[0]).toBeLessThan(Math.min(...commitIdxs));
    expect(cmdIdxs[1]).toBeGreaterThan(vWaveIdx);
    expect(events[cmdIdxs[1]].cmd).toBe("npm test");

    // The V-wave dispatch itself: se-implement, on the implementation model, and
    // carrying PT's own prompt — including the clause that makes it the one
    // wave-mode dispatch that commits its own work.
    const vWave = events[vWaveIdx];
    expect(vWave.skill).toBe("se-implement");
    expect(vWave.opts.model).toBe("sonnet");
    expect(vWave.opts.isolation).toBeUndefined();
    expect(vWave.prompt).toContain(V_WAVE_COMMIT_CLAUSE);
    expect(vWave.prompt).toContain(`All commits for this task must land on branch ${BRANCH}.`);

    // The report row is unchanged by the compression.
    expect(phaseRecord(result, "PT")).toMatchObject({
      phase: "PT",
      label: "PROPERTIES Tests",
      status: "✅",
      detail: "All properties tests passing",
    });
    expect(result.testSummary).toBe("All tests passing");
  });

  it("halts when the V-wave gate is red, naming the command and carrying the output tail", async () => {
    const events = [];
    let runs = 0;
    const result = await main(
      makeOrderedArgs({
        events,
        runCommand: async (cmd) => {
          events.push({ kind: "cmd", cmd });
          runs += 1;
          // Green for the implementation wave, red for the V-wave.
          return runs === 1
            ? { ok: true, output: "Tests: 40 passed\n" }
            : { ok: false, output: "FAIL properties.test.js\nTests: 2 failed, 38 passed\n" };
        },
      })
    );

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("V-wave 2 PROPERTIES test gate failed");
    expect(result.haltReason).toContain("npm test");
    // The tail is carried verbatim, and the halt says the work is recoverable —
    // the V-wave committed itself before the script verified it.
    expect(result.haltReason).toContain("Tests: 2 failed, 38 passed");
    expect(result.haltReason).toContain(`already committed on ${BRANCH}`);

    // Paired positive: the run really did reach the V-wave and the earlier
    // implementation wave really did commit.
    expect(
      events.some((e) => e.kind === "agent" && e.prompt.includes(V_WAVE_PROMPT_ANCHOR))
    ).toBe(true);
    expect(events.filter((e) => e.kind === "git" && e.argv[0] === "commit").length).toBe(2);
    // No PT row: the phase did not pass.
    expect(result.phases.map((p) => p.phase)).not.toContain("PT");
  });

  it("legacy mode keeps yesterday's PT dispatch and its single-agent gate", async () => {
    const record = [];
    // One fresh latch per run: the manifest disappears from the PLAN once Phase
    // I is entered, which is the single route to legacy mode (Phase P skipped on
    // a recorded approval over a pre-manifest PLAN).
    const makeLegacyExtra = () => {
      let inPhaseI = false;
      return {
        _phase: (label) => {
          if (String(label).startsWith("Phase I")) inPhaseI = true;
        },
        _readFile: (path) => {
          const p = String(path);
          if (p === CONFIG_PATH) return null;
          if (p.includes("/PLAN-")) return inPhaseI ? PLAN_NO_MANIFEST : PLAN_WITH_MANIFEST;
          return null;
        },
      };
    };

    const result = await main(makeArgs({ record, extra: makeLegacyExtra() }));
    expect(result.outcome).toBe("success");

    const pt = record.filter(
      (c) => c.skill === "se-implement" && c.prompt.includes(V_WAVE_PROMPT_ANCHOR)
    );
    expect(pt.length).toBe(1);
    // No model override on the legacy path — Phase PT ran on the pipeline's
    // default model before this change and still does, which is what makes this
    // path "yesterday's dispatch". (The wave-mode V-wave pins `sonnet` instead;
    // see the first case in this block.)
    expect(pt[0].opts.model).toBe("opus");
    expect(pt[0].prompt).toContain(V_WAVE_COMMIT_CLAUSE);
    expect(phaseDetail(result, "I")).toBe("All batches complete");
    expect(phaseRecord(result, "PT")).toMatchObject({
      status: "✅",
      detail: "All properties tests passing",
    });

    // And the gate is still `evaluateSingleAgentGate` reading the agent's own
    // report: a self-reported failure from the PROPERTIES dispatch alone halts.
    const inner = makeAgent([]);
    const failing = await main(
      makeArgs({
        extra: {
          ...makeLegacyExtra(),
          _agent: async (skill, prompt, opts) => {
            if (skill === "se-implement" && String(prompt).includes(V_WAVE_PROMPT_ANCHOR)) {
              return "Wrote the tests. Tests: 2 failed, 9 passed.";
            }
            return inner(skill, prompt, opts);
          },
        },
      })
    );
    expect(failing.outcome).toBe("halted");
    expect(failing.haltReason).toBe("Error: Phase PT failed — Tests: 2 failed");
  });
});

describe("Phase I's V-wave dispatch — same-prompt retry on a thrown/rejected dispatch", () => {
  it("recovers silently when the dispatch throws once: one retry, one fault notice, no halt", async () => {
    const events = [];
    const logs = [];
    let vWaveAttempts = 0;
    const inner = makeAgent([]);
    const result = await main(
      makeOrderedArgs({
        events,
        extra: {
          _log: (m) => logs.push(String(m)),
          _agent: async (skill, prompt, opts) => {
            events.push({ kind: "agent", skill, prompt: String(prompt), opts });
            if (skill === "se-implement" && String(prompt).includes(V_WAVE_PROMPT_ANCHOR)) {
              vWaveAttempts += 1;
              if (vWaveAttempts === 1) throw new Error("dispatch stall-killed");
            }
            return inner(skill, prompt, opts);
          },
        },
      })
    );

    expect(result.outcome).toBe("success");
    expect(vWaveAttempts).toBe(2);
    // Both attempts dispatched the identical prompt — a same-episode retry,
    // never a second, fresh V-wave.
    const vWaveEvents = events.filter(
      (e) => e.kind === "agent" && e.prompt.includes(V_WAVE_PROMPT_ANCHOR)
    );
    expect(vWaveEvents.length).toBe(2);
    expect(vWaveEvents[0].prompt).toBe(vWaveEvents[1].prompt);
    expect(logs.some((m) => /Dispatch fault \(V-wave/.test(m))).toBe(true);
  });

  it("propagates the original error when the dispatch throws twice, halting exactly as before this retry existed", async () => {
    const inner = makeAgent([]);
    const result = await main(
      makeOrderedArgs({
        events: [],
        extra: {
          _agent: async (skill, prompt, opts) => {
            if (skill === "se-implement" && String(prompt).includes(V_WAVE_PROMPT_ANCHOR)) {
              throw new Error("dispatch stall-killed");
            }
            return inner(skill, prompt, opts);
          },
        },
      })
    );
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toBe("dispatch stall-killed");
  });

  it("a V-wave dispatch that succeeds on the first attempt is dispatched exactly once, with no fault notice", async () => {
    const events = [];
    const logs = [];
    const result = await main(
      makeOrderedArgs({ events, extra: { _log: (m) => logs.push(String(m)) } })
    );
    expect(result.outcome).toBe("success");
    const vWaveEvents = events.filter(
      (e) => e.kind === "agent" && e.prompt.includes(V_WAVE_PROMPT_ANCHOR)
    );
    expect(vWaveEvents.length).toBe(1);
    expect(logs.some((m) => /Dispatch fault/.test(m))).toBe(false);
  });
});

// ─── Phase I: `implementation.startWave`, the resume pointer ──────────────────
//
// A wave-gate halt leaves the earlier waves' work committed on the branch. The
// re-invocation used to re-enter Wave 1 and re-dispatch agents over that work;
// `implementation.startWave` lets an operator point the run at the wave that
// actually needs doing. It skips DISPATCH only — the first executed wave's
// script-owned gate still runs the whole suite over the whole tree.

/** Three chained tasks with disjoint ownership — one task per wave, three waves. */
const PLAN_THREE_WAVES = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| T1 | First task | 1 | - |",
  "| T2 | Second task | 2 | T1 |",
  "| T3 | Third task | 3 | T2 |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| T1 | `src/one.js` |",
  "| T2 | `src/two.js` |",
  "| T3 | `src/three.js` |",
].join("\n");

const configWithStartWave = (startWave) =>
  JSON.stringify({ implementation: { testCommand: "npm test", startWave } });

/** The task ids Phase I actually dispatched, in dispatch order. */
const dispatchedTaskIds = (record) =>
  record
    .filter((c) => c.skill === "se-implement")
    .map((c) => /^Implement task (T\d+):/.exec(c.prompt))
    .filter(Boolean)
    .map((m) => m[1]);

describe("Phase I — implementation.startWave resumes a halted run", () => {
  it("skips the waves before the pointer entirely — no dispatch, no gate, no commit", async () => {
    const record = [];
    const gitCalls = [];
    const logs = [];
    const ran = [];
    const result = await main(
      makeArgs({
        plan: PLAN_THREE_WAVES,
        config: configWithStartWave(2),
        record,
        logs,
        git: makeGit(gitCalls),
        runCommand: async (cmd) => {
          ran.push(cmd);
          return { ok: true, output: "Tests: 40 passed\n" };
        },
      })
    );

    expect(result.outcome).toBe("success");
    // Waves 2 and 3 ran; wave 1 did not. Set equality over the whole dispatch
    // enumeration, so an extra T1 dispatch anywhere would fail this.
    expect(dispatchedTaskIds(record)).toEqual(["T2", "T3"]);
    // Two wave gates (waves 2 and 3) plus the V-wave's — never a third wave gate.
    expect(ran).toEqual(["npm test", "npm test", "npm test"]);
    // Nothing of wave 1's is committed by this run; waves 2 and 3 are.
    expect(gitCalls.filter((a) => a[0] === "add")).toEqual([
      ["add", "--", "src/two.js"],
      ["add", "--", "src/three.js"],
    ]);

    // The operator is told, in the log, exactly which wave was skipped and why …
    expect(logs).toContain("Wave 1/3: skipped (implementation.startWave=2)");
    // … and told once, up front, that the run is a resume and that the pointer
    // has to be cleared before the next fresh run.
    const banner = logs.filter((m) => m.startsWith("Resuming at wave 2 of 3"));
    expect(banner.length).toBe(1);
    expect(banner[0]).toContain("Clear implementation.startWave before the next fresh run.");
    // The report row now states the resume point (D-3), not merely the plan's
    // wave count: waves 2-3 executed, wave 1 skipped as previously completed.
    expect(phaseDetail(result, "I")).toBe(
      "Waves 2–3 complete, waves 1–1 skipped as previously completed " +
        "(wave mode, script-owned gate) (provenance: operator-set)"
    );
  });

  it("a pointer past the last wave runs every wave, and says so", async () => {
    const record = [];
    const logs = [];
    const result = await main(
      makeArgs({
        plan: PLAN_THREE_WAVES,
        config: configWithStartWave(9),
        record,
        logs,
        git: makeGit([]),
        runCommand: async () => ({ ok: true, output: "green" }),
      })
    );

    expect(result.outcome).toBe("success");
    expect(dispatchedTaskIds(record)).toEqual(["T1", "T2", "T3"]);
    expect(logs).toContain(
      `Notice: implementation.startWave=9 in ${CONFIG_PATH} is past the last wave of ` +
        `this plan (3) — running every wave from 1. (provenance: operator-set)`
    );
    // Paired positive for "runs every wave": nothing was announced as skipped.
    expect(logs.some((m) => m.includes("skipped (implementation.startWave"))).toBe(false);
  });

  it("the default pointer changes nothing an operator can see", async () => {
    const record = [];
    const logs = [];
    const result = await main(
      makeArgs({
        plan: PLAN_THREE_WAVES,
        config: CONFIG_WITH_TEST_COMMAND,
        record,
        logs,
        git: makeGit([]),
        runCommand: async () => ({ ok: true, output: "green" }),
      })
    );

    expect(result.outcome).toBe("success");
    expect(dispatchedTaskIds(record)).toEqual(["T1", "T2", "T3"]);
    // No resume banner, no skip lines, and no complaint about the absent key.
    expect(logs.some((m) => m.startsWith("Resuming at wave"))).toBe(false);
    expect(logs.some((m) => m.includes("implementation.startWave"))).toBe(false);
    // Paired positive: the wave plan itself was still announced.
    expect(logs).toContain("Implementation wave plan:");
  });

  it("an invalid pointer degrades to wave 1 and is named in the run's notices", async () => {
    const record = [];
    const logs = [];
    const result = await main(
      makeArgs({
        plan: PLAN_THREE_WAVES,
        config: configWithStartWave(0),
        record,
        logs,
        git: makeGit([]),
        runCommand: async () => ({ ok: true, output: "green" }),
      })
    );

    expect(result.outcome).toBe("success");
    expect(dispatchedTaskIds(record)).toEqual(["T1", "T2", "T3"]);
    expect(logs).toContain(
      `Notice: implementation.startWave in ${CONFIG_PATH} is not a valid value — ` +
        `using the default.`
    );
  });
});

// ─── Phase I: the wave ledger — the resume pointer with no operator ──────────
//
// `implementation.startWave` needs a human to edit the config between the halt
// and the re-invocation. The ledger is the same pointer written and read by the
// script itself: each committed wave is recorded, and the next invocation of the
// SAME plan for the SAME feature resumes at the wave that actually needs doing.
// Every rejection path is fail-open — a notice and a full run, never a halt.

/**
 * main() args with both halves of the ledger seam under test control: reads are
 * scripted, writes are captured, and nothing touches the real filesystem.
 */
/**
 * TSPEC §5.2 H-1/H-2 — both additive and default-off: with neither `events` nor
 * `failWriteOn` supplied, this returns exactly what it returned before either
 * extension existed.
 *
 * H-1: an optional ordered event sink. When `events` is supplied, both the
 * `_runCommand` and `_git` doubles push `["runCommand", cmd]` / `["git", …argv]`
 * onto it, IN ADDITION to their own existing per-double logs (`gitCalls` via
 * `makeGit`'s own `calls`, etc.) — nothing here replaces those.
 *
 * H-2: an optional `failWriteOn(path, callIndex)` predicate over the ledger
 * write. Default keeps the current always-capture behaviour.
 */
function makeLedgerArgs({
  ledger = null,
  config = CONFIG_WITH_TEST_COMMAND,
  writes = [],
  record = [],
  logs = [],
  git,
  runCommand = async () => ({ ok: true, output: "green" }),
  events,
  failWriteOn,
} = {}) {
  const wrappedGit =
    events && git
      ? async (argv) => {
          events.push(["git", ...argv]);
          return git(argv);
        }
      : git;
  const wrappedRunCommand = events
    ? async (cmd) => {
        events.push(["runCommand", cmd]);
        return runCommand(cmd);
      }
    : runCommand;
  let writeCallIndex = 0;
  return makeArgs({
    plan: PLAN_THREE_WAVES,
    config,
    record,
    logs,
    git: wrappedGit,
    runCommand: wrappedRunCommand,
    extra: {
      _readFile: (path) => {
        const p = String(path);
        if (p === WAVE_STATE_PATH) return ledger;
        if (p === CONFIG_PATH) return config;
        if (p.includes("/PLAN-")) return PLAN_THREE_WAVES;
        return null;
      },
      _writeFile: (path, contents) => {
        const p = String(path);
        const callIndex = writeCallIndex++;
        if (failWriteOn && failWriteOn(p, callIndex)) {
          throw new Error(`simulated write failure at call ${callIndex}`);
        }
        writes.push({ path: p, contents: String(contents) });
      },
    },
  });
}

/** Everything this run wrote to the ledger path, in order, as text. */
const ledgerWrites = (writes) =>
  writes.filter((w) => w.path === WAVE_STATE_PATH).map((w) => w.contents);

describe("Phase I — the wave ledger resumes a halted run unattended", () => {
  it("records each committed wave, and the next invocation resumes at the failed one", async () => {
    // ── Run 1: wave 1 is green and committed; wave 2's gate is red. ──────────
    const firstWrites = [];
    let gateCalls = 0;
    const halted = await main(
      makeLedgerArgs({
        writes: firstWrites,
        git: makeGit([]),
        runCommand: async () => {
          gateCalls += 1;
          return gateCalls === 1
            ? { ok: true, output: "Tests: 40 passed\n" }
            : { ok: false, output: "Tests: 1 failed, 39 passed\n" };
        },
      })
    );

    expect(halted.outcome).toBe("halted");
    expect(halted.haltReason).toContain("Error: Wave 2 test gate failed");

    // Exactly one ledger write, and it records the one wave that was committed.
    const recorded = ledgerWrites(firstWrites);
    expect(recorded.length).toBe(1);
    expect(JSON.parse(recorded[0])).toMatchObject({
      version: 1,
      feature: FEATURE,
      lastGreenWave: 1,
    });

    // ── Run 2: the SAME ledger bytes, no config change, no operator. ─────────
    const record = [];
    const logs = [];
    const gitCalls = [];
    const secondWrites = [];
    const resumed = await main(
      makeLedgerArgs({
        ledger: recorded[0],
        record,
        logs,
        writes: secondWrites,
        git: makeGit(gitCalls),
      })
    );

    expect(resumed.outcome).toBe("success");
    // Wave 1 is not re-dispatched and not re-committed; waves 2 and 3 are both.
    expect(dispatchedTaskIds(record)).toEqual(["T2", "T3"]);
    expect(gitCalls.filter((a) => a[0] === "add")).toEqual([
      ["add", "--", "src/two.js"],
      ["add", "--", "src/three.js"],
    ]);
    // The skip and the resume are both announced, and the banner names the file
    // an operator would delete to force a full run.
    expect(logs).toContain("Wave 1/3: skipped (wave ledger: waves 1–1 already green)");
    const banner = logs.filter((m) => m.startsWith("Resuming at wave 2 of 3 (wave ledger"));
    expect(banner.length).toBe(1);
    expect(banner[0]).toContain(`Delete ${WAVE_STATE_PATH} to force a full run.`);
    expect(banner[0]).toContain(" (provenance: automatic)");
    // Nothing was rejected: the resume is the paired positive for every
    // "ignored" notice asserted below.
    expect(logs.some((m) => m.includes("was ignored"))).toBe(false);
    // AT-01/D-3 — the report's Phase I row states the resume point.
    expect(phaseDetail(resumed, "I")).toBe(
      "Waves 2–3 complete, waves 1–1 skipped as previously completed " +
        "(wave mode, script-owned gate) (provenance: automatic)"
    );
  });

  it("keeps the completion record once every wave is green", async () => {
    const writes = [];
    const result = await main(makeLedgerArgs({ writes, git: makeGit([]) }));

    expect(result.outcome).toBe("success");
    // Three per-wave records and nothing after them: the final record IS the
    // completion record the next invocation's resume path honours.
    const recorded = ledgerWrites(writes);
    expect(recorded.map((t) => JSON.parse(t).lastGreenWave)).toEqual([1, 2, 3]);
  });

  // PROP-REPO-03 (REQ-WVR-10's RUN half; CODE_REVIEW v1 §2-12). The repo half —
  // `.gitignore` naming the path — is asserted in waveResumeRepoState.test.js,
  // and it only proves the file is ignorable. It cannot see a run that stages
  // the record explicitly: `git add -- <path>` overrides `.gitignore`. This is
  // the run-side conjunct, and it is emergent — no wave owns the path, so no
  // other test in this suite looks at the `add` argv list at all.
  it("no commit a full run produces ever stages the wave ledger", async () => {
    const writes = [];
    const gitCalls = [];
    const result = await main(makeLedgerArgs({ writes, git: makeGit(gitCalls) }));

    expect(result.outcome).toBe("success");
    // Three waves were recorded, so the run really did reach every commit site
    // whose staging this assertion is about.
    expect(ledgerWrites(writes).map((t) => JSON.parse(t).lastGreenWave)).toEqual([1, 2, 3]);

    const staged = gitCalls.filter((a) => a[0] === "add").flat();
    // Positive presence: this run DID stage work, so the absence below is a
    // fact about what was staged, not about a run that staged nothing.
    expect(staged.length).toBeGreaterThan(0);
    // The record itself is never among it — flattened, so a multi-pathspec
    // `add` cannot hide the path in a later argv position.
    expect(staged).not.toContain(WAVE_STATE_PATH);
    expect(staged).not.toContain(".claude/pdlc-wave-state.json");
    // Nor by any suffix: an absolute or `./`-prefixed spelling of the same file.
    expect(staged.filter((p) => String(p).endsWith("pdlc-wave-state.json"))).toEqual([]);
  });

  it("a complete ledger skips every wave without a single implementation dispatch — and Phase PT's V-wave and its gate still run", async () => {
    const record = [];
    const logs = [];
    const writes = [];
    const gateCommands = [];
    // PROP-SKIP-04 (CODE_REVIEW v1 §2-13): the `add`-list oracle needs a
    // RECORDING double. `makeGit([])` discards its own argv log, so the
    // flattened-`add` half could only ever have been written as an absence
    // claim about a list nobody kept — the absence-only shape PROPERTIES R-3
    // forbids. Keeping the calls lets the same run carry its positive
    // live-seam conjunct (the branch guard) beside the negative one.
    const gitCalls = [];
    const ledger = JSON.stringify({
      version: 1,
      feature: FEATURE,
      planHash: computePlanHash([
        [{ id: "T1", files: ["src/one.js"] }],
        [{ id: "T2", files: ["src/two.js"] }],
        [{ id: "T3", files: ["src/three.js"] }],
      ]),
      lastGreenWave: 3,
    });
    const result = await main(
      makeLedgerArgs({
        ledger,
        record,
        logs,
        writes,
        git: makeGit(gitCalls),
        runCommand: async (command) => {
          gateCommands.push(String(command));
          return { ok: true, output: "green" };
        },
      })
    );

    expect(result.outcome).toBe("success");
    // ── The negative half: not one WAVE dispatch went out. ──────────────────
    const waveDispatches = record.filter(
      (d) => d.skill === "se-implement" && !/PROPERTIES tests/.test(String(d.prompt))
    );
    expect(waveDispatches).toEqual([]);
    expect(logs.some((m) => m.startsWith("Skipping Phase I (wave ledger"))).toBe(true);
    // The record is left standing for the invocation after this one.
    expect(ledgerWrites(writes)).toEqual([]);

    // ── PROP-SKIP-04, both halves on ONE run ────────────────────────────────
    // Negative: zero `git add` for wave work. Flattened exactly as PROP-REPO-03
    // flattens, so a multi-pathspec `add` cannot hide behind `argv[2]` and
    // `add -A` cannot read as `undefined`.
    expect(gitCalls.filter((a) => a[0] === "add").flat()).toEqual([]);
    // Positive (i): the git seam was WIRED and LIVE on this same run — the
    // branch guard's `readHeadBranch` went through it. Without this conjunct
    // an empty `add` list cannot be told apart from a disconnected double.
    expect(gitCalls).toContainEqual(["rev-parse", "--abbrev-ref", "HEAD"]);

    // ── The positive half: the safety claim, asserted rather than commented ──
    // "Phase PT's V-wave verification is its own phase and still runs" was true
    // of HEAD but was carried only by the comment above: filtering the V-wave
    // dispatch OUT of the negative conjunct proves nothing about whether it went
    // out. Turn the `break` that skips the wave loop into an early return past
    // Phase PT, or move the skip up to the `phaseFn("Phase PT…")` call, and the
    // two expectations below go red while the negative half stays green. That is
    // the mutation this pair exists to catch: a run that skips every wave AND
    // never runs a single test command would otherwise ship as a success.
    const vWaveDispatches = record.filter(
      (d) => d.skill === "se-implement" && /PROPERTIES tests/.test(String(d.prompt))
    );
    expect(vWaveDispatches).toHaveLength(1);
    // The gate is the script's, not the agent's self-report: the configured
    // test command was actually run, exactly once, on this skip run.
    expect(gateCommands).toEqual([JSON.parse(CONFIG_WITH_TEST_COMMAND).implementation.testCommand]);

    // AT-12's report-row conjunct (D-3's skip half, TE F-09): the ⏭ row's
    // literal, transcribed from §2.4 — deleting the provenance clause reds
    // here, not nowhere.
    const row = result.phases.find((p) => p.phase === "I");
    expect(row.status).toBe("⏭");
    expect(row.detail).toBe(
      "Skipped — all 3 waves previously committed and recorded green " +
        "(wave ledger) (provenance: automatic)"
    );
  });

  // TE Phase CR F-02 / Q-02 — the record is corroborated against the TREE, not
  // only against the PLAN. `feature` and `planHash` are both functions of the
  // PLAN document, so a `git reset --hard` or a re-cut branch leaves a complete
  // ledger matching on both while the commits it records are gone — and the
  // ledger file is untracked, so it survives exactly the operations that destroy
  // the work. The recorded commit is now stamped and checked for ancestry.
  describe("the completion record is corroborated against the tree", () => {
    const HEAD_SHA = "a".repeat(40);

    /** A git transport that answers `rev-parse HEAD` with a fixed sha and scripts
     *  the ancestry probe's verdict. */
    function makeShaGit(calls, { ancestor }) {
      return async (argv) => {
        calls.push(argv);
        const joined = argv.join(" ");
        if (joined === "rev-parse --abbrev-ref HEAD") {
          return { ok: true, stdout: `${BRANCH}\n`, stderr: "" };
        }
        if (joined === "rev-parse HEAD") {
          return { ok: true, stdout: `${HEAD_SHA}\n`, stderr: "" };
        }
        if (argv[0] === "merge-base") {
          return ancestor
            ? { ok: true, stdout: "", stderr: "" }
            : { ok: false, stdout: "", stderr: "" };
        }
        if (argv[0] === "diff") {
          return { ok: true, stdout: `${argv.slice(4).join("\n")}\n`, stderr: "" };
        }
        return { ok: true, stdout: "", stderr: "" };
      };
    }

    it("stamps the commit each recorded wave landed on", async () => {
      const writes = [];
      const result = await main(
        makeLedgerArgs({ writes, git: makeShaGit([], { ancestor: true }) })
      );

      expect(result.outcome).toBe("success");
      const records = ledgerWrites(writes).map((t) => JSON.parse(t));
      expect(records.map((r) => r.lastGreenWave)).toEqual([1, 2, 3]);
      // Every record carries the sha, not just the last one: a resume at wave 2
      // needs corroboration as much as a skip of all three does.
      expect(records.map((r) => r.head)).toEqual([HEAD_SHA, HEAD_SHA, HEAD_SHA]);
    });

    it("a complete ledger whose commit is NOT an ancestor of HEAD is ignored, and every wave runs", async () => {
      const record = [];
      const logs = [];
      const calls = [];
      const ledger = JSON.stringify({
        version: 1,
        feature: FEATURE,
        planHash: computePlanHash([
          [{ id: "T1", files: ["src/one.js"] }],
          [{ id: "T2", files: ["src/two.js"] }],
          [{ id: "T3", files: ["src/three.js"] }],
        ]),
        lastGreenWave: 3,
        head: HEAD_SHA,
      });

      const result = await main(
        makeLedgerArgs({ ledger, record, logs, git: makeShaGit(calls, { ancestor: false }) })
      );

      expect(result.outcome).toBe("success");
      // The whole point: the tree, not the record, decided.
      expect(dispatchedTaskIds(record)).toEqual(["T1", "T2", "T3"]);
      expect(logs.some((m) => m.startsWith("Skipping Phase I (wave ledger"))).toBe(false);
      const notice = logs.find((m) => m.includes("was ignored"));
      expect(notice).toBeDefined();
      expect(notice).toContain("is not an ancestor of HEAD");
      // Phase CR round 1, TE Q-01. The substring form above is deliberate — the
      // rest of the notice interpolates a sha, so transcribing the whole line
      // would pin a fixture value. But that left the ctx wiring unchecked: the
      // renderer's `String(ctx.recordedHead).slice(0, 12)` short-sha was
      // asserted nowhere through `main()`, so a classifier that forwarded the
      // wrong field would still read "is not an ancestor of HEAD". This
      // conjunct restores the wiring check without pinning the whole line.
      expect(notice).toContain(HEAD_SHA.slice(0, 12));
      // The probe is ancestry, never equality — every later phase legitimately
      // moves HEAD forward, and the resume case IS a re-invocation after those.
      expect(calls).toContainEqual(["merge-base", "--is-ancestor", HEAD_SHA, "HEAD"]);
      // AT-03/AT-11 — the lazy-probe contract's positive conjunct: EXACTLY one
      // `merge-base` call, not merely "at least one". §5.5 mutation 4: an
      // eagerly-resolved probe still passes `toContainEqual` above; only the
      // filtered `toEqual` below is killed by it.
      expect(calls.filter((a) => a[0] === "merge-base")).toEqual([
        ["merge-base", "--is-ancestor", HEAD_SHA, "HEAD"],
      ]);
    });

    it("the same ledger with the commit reachable from HEAD is honoured — the probe is a real input", async () => {
      const record = [];
      const logs = [];
      const calls = [];
      const ledger = JSON.stringify({
        version: 1,
        feature: FEATURE,
        planHash: computePlanHash([
          [{ id: "T1", files: ["src/one.js"] }],
          [{ id: "T2", files: ["src/two.js"] }],
          [{ id: "T3", files: ["src/three.js"] }],
        ]),
        lastGreenWave: 3,
        head: HEAD_SHA,
      });

      const result = await main(
        makeLedgerArgs({ ledger, record, logs, git: makeShaGit(calls, { ancestor: true }) })
      );

      expect(result.outcome).toBe("success");
      expect(dispatchedTaskIds(record)).toEqual([]);
      expect(logs.some((m) => m.startsWith("Skipping Phase I (wave ledger"))).toBe(true);
      // AT-11 — the paired positive: exactly one probe on the ancestry fixture.
      expect(calls.filter((a) => a[0] === "merge-base")).toEqual([
        ["merge-base", "--is-ancestor", HEAD_SHA, "HEAD"],
      ]);
    });

    // AT-04 — verification independence: over an enumerated fixture set (resume
    // at wave 2, resume at the last wave, `head` at the tip, `head` an earlier
    // reachable ancestor), the gate command is invoked before the first commit
    // call, in every case, asserted on the interleaving of the `_runCommand`
    // and `_git` H-1 event sink — not on either double's own log alone.
    it.each([
      ["resume at wave 2 (head at tip)", 1, HEAD_SHA],
      ["resume at the last wave (head an earlier ancestor)", 2, "b".repeat(40)],
    ])("%s: the gate runs before the first commit", async (_label, lastGreenWave, recordedHead) => {
      const events = [];
      const ledger = JSON.stringify({
        version: 1,
        feature: FEATURE,
        planHash: computePlanHash([
          [{ id: "T1", files: ["src/one.js"] }],
          [{ id: "T2", files: ["src/two.js"] }],
          [{ id: "T3", files: ["src/three.js"] }],
        ]),
        lastGreenWave,
        head: recordedHead,
      });
      const result = await main(
        makeLedgerArgs({
          ledger,
          events,
          git: makeShaGit([], { ancestor: true }),
        })
      );

      expect(result.outcome).toBe("success");
      const runCommandIdx = events.findIndex((e) => e[0] === "runCommand");
      const commitIdx = events.findIndex((e) => e[0] === "git" && e[1] === "commit");
      expect(runCommandIdx).toBeGreaterThan(-1);
      expect(commitIdx).toBeGreaterThan(-1);
      expect(runCommandIdx).toBeLessThan(commitIdx);
    });

    it("a record written before the `head` field existed is still honoured — the field is optional on read", async () => {
      const record = [];
      const logs = [];
      const ledger = JSON.stringify({
        version: 1,
        feature: FEATURE,
        planHash: computePlanHash([
          [{ id: "T1", files: ["src/one.js"] }],
          [{ id: "T2", files: ["src/two.js"] }],
          [{ id: "T3", files: ["src/three.js"] }],
        ]),
        lastGreenWave: 3,
      });

      const result = await main(
        makeLedgerArgs({ ledger, record, logs, git: makeShaGit([], { ancestor: false }) })
      );

      expect(result.outcome).toBe("success");
      expect(dispatchedTaskIds(record)).toEqual([]);
      expect(logs.some((m) => m.includes("is not an ancestor of HEAD"))).toBe(false);
    });
  });

  // TE Phase CR F-03 / Q-01 — which lever wins when both are pulled. The answer
  // is that they never meet: `forcePhases` accepts six tokens and `I` is not one
  // of them (FORCE_PHASE_TOKENS = R, F, T, P, D, PR), so `forcePhases: "I"` is
  // rejected before any phase runs rather than silently losing to the ledger. The
  // ledger's own notice therefore names the only escape there is — delete the
  // file. Both halves are asserted below, because "the lever does not exist" and
  // "the lever exists and loses" are different contracts and the round-1 review
  // could not tell which one HEAD implemented.
  it("forcePhases cannot name Phase I at all — the token is rejected, and the ledger notice names the real escape", async () => {
    const rejected = await main({
      ...makeLedgerArgs({ ledger: null, git: makeGit([]) }),
      forcePhases: "I",
    });

    expect(rejected.outcome).toBe("halted");
    // The rejection names the catalogue, so an operator reaching for `I` is told
    // what the six tokens actually are rather than left guessing.
    expect(String(rejected.haltReason)).toMatch(/invalid forcePhases token/);
    expect(String(rejected.haltReason)).toMatch(/\bR\b.*\bF\b.*\bT\b.*\bP\b.*\bD\b.*\bPR\b/s);
  });

  it("a complete ledger is honoured on a forced run too — the escape is deleting the ledger, and the notice says so", async () => {
    const record = [];
    const logs = [];
    const ledger = JSON.stringify({
      version: 1,
      feature: FEATURE,
      planHash: computePlanHash([
        [{ id: "T1", files: ["src/one.js"] }],
        [{ id: "T2", files: ["src/two.js"] }],
        [{ id: "T3", files: ["src/three.js"] }],
      ]),
      lastGreenWave: 3,
    });
    const args = makeLedgerArgs({ ledger, record, logs, git: makeGit([]) });

    // A legal force token, on a phase other than I: the ledger is still consulted
    // and still honoured, because the consult is gated on the explicit
    // `implementation.startWave` pointer and on nothing else.
    const result = await main({ ...args, forcePhases: "T" });

    expect(result.outcome).toBe("success");
    expect(dispatchedTaskIds(record)).toEqual([]);
    // The operator who forced the phase is told how to actually force it.
    const notice = logs.find((m) => m.startsWith("Skipping Phase I (wave ledger"));
    expect(notice).toBeDefined();
    expect(notice).toContain(`Delete ${WAVE_STATE_PATH} to force a full run`);

    // The control that makes this a statement about precedence rather than about
    // `forcePhases` being inert: with the ledger gone, the same forced run
    // dispatches every wave.
    const freshRecord = [];
    const fresh = await main({
      ...makeLedgerArgs({ ledger: null, record: freshRecord, git: makeGit([]) }),
      forcePhases: "T",
    });
    expect(fresh.outcome).toBe("success");
    expect(dispatchedTaskIds(freshRecord)).toEqual(["T1", "T2", "T3"]);
  });

  it("writes no ledger at all when there is no git transport to commit with", async () => {
    const writes = [];
    const logs = [];
    // No `_git`: the orchestrator verifies but commits nothing, so there is no
    // committed wave to record.
    const result = await main(makeLedgerArgs({ writes, logs }));

    expect(result.outcome).toBe("success");
    expect(ledgerWrites(writes)).toEqual([]);
    // Paired positive: the waves really did run, and the run said why it did not
    // commit them.
    expect(logs).toContain(
      "Notice: no git transport is injected — wave work will be verified but NOT " +
        "committed by the orchestrator."
    );

    // ── Re-invocation half (Phase CR round 1, PM F-06) ──────────────────────
    // REQ-WVR-09's When/Then is a RE-INVOCATION: over the same feature and an
    // unchanged plan, a verified-but-uncommitted wave is never skipped. That
    // half used to hold only by composition with the separate IG-6 test, so a
    // change that made an empty-transport run write a *cleared* record rather
    // than none would have kept both tests green while breaking the P0 AC.
    // Here the second run reads back whatever the first run actually left at
    // WAVE_STATE_PATH, so the two invocations are joined in one fixture.
    const leftBehind = ledgerWrites(writes);
    const secondRecord = [];
    const secondLogs = [];
    const second = await main(
      makeLedgerArgs({
        // `[]` ⇒ nothing was left behind ⇒ the second run reads no record.
        ledger: leftBehind.length > 0 ? leftBehind[leftBehind.length - 1] : null,
        record: secondRecord,
        logs: secondLogs,
      })
    );

    expect(second.outcome).toBe("success");
    // Wave 1's tasks are dispatched again — the resume point is wave 1, not 2.
    expect(dispatchedTaskIds(secondRecord)).toEqual(["T1", "T2", "T3"]);
    // Positive conjunct on the silence: no record means a silent full run, so
    // no disregard notice is printed either.
    expect(secondLogs.some((m) => m.includes("wave ledger") && m.includes("ignored"))).toBe(
      false
    );
  });

  // AT-09's companion arm: WITH a git transport, under the self-report gate
  // (no `testCommand` configured) in turn, the ledger still writes normally —
  // proving the write guard is the git TRANSPORT, never the gate mode.
  it("writes the ledger normally under the self-report gate too, when a git transport IS injected", async () => {
    const writes = [];
    const result = await main(
      makeLedgerArgs({ writes, config: "{}", git: makeGit([]) })
    );

    expect(result.outcome).toBe("success");
    const recorded = ledgerWrites(writes);
    expect(recorded.map((t) => JSON.parse(t).lastGreenWave)).toEqual([1, 2, 3]);
  });

  // T-10's delta coverage oracle (PLAN §4.5.1) found this branch uncovered: the
  // resume report row's gate-name ternary had only its `script-owned gate` arm
  // reached, because every resume fixture above configures a `testCommand`. The
  // whole-file 85 % floor cannot see a single uncovered arm in a 16,000-line
  // module — which is the whole reason §4.5.1 exists (RT-7).
  it("a ledger resume under the SELF-REPORT gate names that gate in the report row", async () => {
    const writes = [];
    const logs = [];
    const seed = await main(makeLedgerArgs({ writes, config: "{}", git: makeGit([]) }));
    expect(seed.outcome).toBe("success");
    const wave1Record = ledgerWrites(writes).find((t) => JSON.parse(t).lastGreenWave === 1);
    expect(wave1Record).toBeDefined();

    const resumed = await main(
      makeLedgerArgs({ ledger: wave1Record, logs, config: "{}", git: makeGit([]) })
    );

    expect(resumed.outcome).toBe("success");
    // The resume really happened on this path too — the paired positive, so the
    // row below cannot be satisfied by an unrelated run.
    expect(logs.some((m) => m.startsWith("Resuming at wave 2 of 3 (wave ledger"))).toBe(true);
    // Whole-string equality: the gate name is the point, and a relaxed matcher
    // would pass on the `script-owned gate` string this test exists to exclude.
    expect(phaseDetail(resumed, "I")).toBe(
      "Waves 2–3 complete, waves 1–1 skipped as previously completed " +
        "(wave mode, self-report gate) (provenance: automatic)"
    );
  });

  it("an explicit implementation.startWave outranks the ledger", async () => {
    const record = [];
    const logs = [];
    const writes = [];
    const ledger = JSON.stringify({
      version: 1,
      feature: FEATURE,
      planHash: computePlanHash([
        [{ id: "T1", files: ["src/one.js"] }],
        [{ id: "T2", files: ["src/two.js"] }],
        [{ id: "T3", files: ["src/three.js"] }],
      ]),
      lastGreenWave: 1,
    });
    const result = await main(
      makeLedgerArgs({
        ledger,
        config: configWithStartWave(3),
        record,
        logs,
        writes,
        git: makeGit([]),
      })
    );

    expect(result.outcome).toBe("success");
    // The operator's wave 3, not the ledger's wave 2.
    expect(dispatchedTaskIds(record)).toEqual(["T3"]);
    // AT-05 — the record never consulted: no "ignored" line, and the single
    // resume line names the announcement token (TE F-05), not asserted on an
    // unlocated filtered element.
    const banner = logs.filter((m) => m.startsWith("Resuming at wave 3 of 3 (implementation.startWave)"));
    expect(banner.length).toBe(1);
    expect(banner[0]).toContain(" (provenance: operator-set)");
    expect(logs.some((m) => m.includes("was ignored"))).toBe(false);
    expect(logs.some((m) => m.includes("(wave ledger"))).toBe(false);
    // AT-05's write-side conjunct (§5.5 mutation 5, §2.5): an operator-pointed
    // run still writes a record, and the recorded wave number is PLAN-ABSOLUTE
    // (3, the wave that actually ran), never a count of waves this run ran.
    const recorded = ledgerWrites(writes);
    expect(recorded.length).toBeGreaterThan(0);
    expect(JSON.parse(recorded[recorded.length - 1]).lastGreenWave).toBe(3);
  });

  // The recorded commit used by the `over-count` row below. Distinct from the
  // ancestry block's HEAD_SHA (which is scoped to that describe) so the two
  // fixtures cannot be confused for one another.
  const OVER_COUNT_HEAD = "b".repeat(40);
  // A `head` on a record whose disregard reason is ancestry-INDEPENDENT. The two
  // rows below carry it so the zero-probe conjunct has something to be about:
  // with no `head` in the fixture, `headCorroborated` short-circuits before it
  // probes and an eagerly-probing build is indistinguishable from a lazy one
  // (TSPEC §5.5 mutation 4, measured surviving in CODE_REVIEW v1's remediation).
  const DISREGARDED_HEAD = "c".repeat(40);

  // Each row carries its expected filtered `merge-base` call list as a fourth
  // element, because the codes are NOT uniformly ancestry-independent: guards
  // 1–4's codes are resolved by the classifier's optimistic first call and the
  // lazy probe never fires (`[]`), while `over-count` is guard 6 — *after*
  // ancestry — so its record's `head` is probed exactly once before the code is
  // decided. Equality, not containment (§5.5 mutation 4): an eagerly-resolved
  // probe still passes a `toContainEqual`, and a probe deleted from the
  // over-count path still passes a `toEqual([])` written for the other rows.
  it.each([
    [
      "unparseable content",
      "{ this is not json",
      "it is not readable JSON",
      [],
    ],
    [
      // AT-02 — the fourth of seven codes: valid JSON that is not an object.
      "content that is not a JSON object",
      JSON.stringify(["not", "an", "object"]),
      "it is not a JSON object",
      [],
    ],
    [
      "a record for another feature",
      JSON.stringify({
        version: 1,
        feature: "other-feat",
        planHash: "deadbeef",
        lastGreenWave: 1,
        head: DISREGARDED_HEAD,
      }),
      'it records feature "other-feat", not "test-feat"',
      [],
    ],
    [
      "a plan hash that no longer matches",
      JSON.stringify({
        version: 1,
        feature: FEATURE,
        planHash: "00000000",
        lastGreenWave: 1,
        head: DISREGARDED_HEAD,
      }),
      "the PLAN's wave layout has changed since it was written",
      [],
    ],
    [
      "a record whose fields are the wrong shape",
      JSON.stringify({ version: 1, feature: FEATURE, planHash: "00000000", lastGreenWave: "1" }),
      "its fields are not the shape this workflow writes",
      [],
    ],
    [
      // AT-02 / IG-4 — the seventh code, `over-count`, closed end-to-end here
      // (Phase CR round 1, TE F-01). The standalone test this replaces matched
      // only `includes("only 3")`, which the `recordedLastGreenWave`/`waveCount`
      // field swap at the `fullRunWith("over-count", …)` call site survives:
      // both halves of the swapped notice still contain "only 3"'s other half.
      // Transcribing the WHOLE notice binds classifier context to renderer
      // output through `main()`, and the row inherits this table's dispatch and
      // `merge-base` conjuncts (PROP-DISREGARD-02, PROP-DISREGARD-10).
      "a record naming more green waves than the plan has",
      JSON.stringify({
        version: 1,
        feature: FEATURE,
        planHash: computePlanHash([
          [{ id: "T1", files: ["src/one.js"] }],
          [{ id: "T2", files: ["src/two.js"] }],
          [{ id: "T3", files: ["src/three.js"] }],
        ]),
        lastGreenWave: 4,
        head: OVER_COUNT_HEAD,
      }),
      "it records 4 wave(s) green and this plan has only 3",
      [["merge-base", "--is-ancestor", OVER_COUNT_HEAD, "HEAD"]],
    ],
  ])(
    "%s is ignored with a notice, and every wave runs",
    async (_label, ledger, reason, expectedMergeBaseCalls) => {
      const record = [];
      const logs = [];
      const gitCalls = [];
      const result = await main(
        makeLedgerArgs({ ledger, record, logs, writes: [], git: makeGit(gitCalls) })
      );

      expect(result.outcome).toBe("success");
      expect(dispatchedTaskIds(record)).toEqual(["T1", "T2", "T3"]);
      expect(logs).toContain(
        `Notice: the wave ledger ${WAVE_STATE_PATH} was ignored — ${reason}. ` +
          `Running every wave from 1. (provenance: automatic)`
      );
      expect(logs.some((m) => m.startsWith("Resuming at wave"))).toBe(false);
      // AT-03/AT-11 — the lazy-probe contract, per row. See the table header.
      expect(gitCalls.filter((a) => a[0] === "merge-base")).toEqual(expectedMergeBaseCalls);
    }
  );

  it("a matching record whose waves are all green skips Phase I whole, and the row says so", async () => {
    // Same feature, same plan, the whole plan recorded done — honoured: the
    // feature/planHash match is the staleness guard, and re-dispatching every
    // wave over a finished tree is the failure mode this exists to end.
    const writes = [];
    const first = await main(makeLedgerArgs({ writes, git: makeGit([]) }));
    expect(first.outcome).toBe("success");
    const wave3Record = ledgerWrites(writes).find((t) => JSON.parse(t).lastGreenWave === 3);
    expect(wave3Record).toBeDefined();

    const record = [];
    const logs = [];
    const result = await main(
      makeLedgerArgs({ ledger: wave3Record, record, logs, git: makeGit([]) })
    );

    expect(result.outcome).toBe("success");
    expect(dispatchedTaskIds(record)).toEqual([]);
    expect(logs.some((m) => m.startsWith("Skipping Phase I (wave ledger"))).toBe(true);
    const row = result.phases.find((p) => p.phase === "I");
    expect(row.status).toBe("⏭");
    expect(row.detail).toContain("recorded green (wave ledger)");
  });

  it("a ledger write that throws is a notice, never a halt", async () => {
    const logs = [];
    const result = await main(
      makeArgs({
        plan: PLAN_THREE_WAVES,
        config: CONFIG_WITH_TEST_COMMAND,
        logs,
        git: makeGit([]),
        runCommand: async () => ({ ok: true, output: "green" }),
        extra: {
          _readFile: (path) => {
            const p = String(path);
            if (p === CONFIG_PATH) return CONFIG_WITH_TEST_COMMAND;
            if (p.includes("/PLAN-")) return PLAN_THREE_WAVES;
            return null;
          },
          _writeFile: (path) => {
            if (String(path) === WAVE_STATE_PATH) throw new Error("EACCES: read-only");
          },
        },
      })
    );

    expect(result.outcome).toBe("success");
    const notices = logs.filter((m) =>
      m.startsWith(`Notice: could not record wave 1 in the wave ledger ${WAVE_STATE_PATH}`)
    );
    expect(notices.length).toBe(1);
    expect(notices[0]).toContain("EACCES: read-only");
  });

  // AT-15 arm 2 (H-2; D-6, EC-15a) — an early write succeeds, a later one
  // fails: the discriminator is that the implementation DISCARDS the record on
  // failure rather than caching it, so the next run resolves outcome (b), the
  // resume, at the last SUCCESSFUL write, not the last attempted one.
  it("a ledger write that fails partway through leaves the last successful record standing", async () => {
    const writes = [];
    const halted = await main(
      makeLedgerArgs({
        writes,
        git: makeGit([]),
        // Wave 1's write (callIndex 0) succeeds; wave M=3's (callIndex 2), the
        // LAST write of this 3-wave plan, throws.
        failWriteOn: (path, callIndex) => path === WAVE_STATE_PATH && callIndex === 2,
      })
    );

    // Every wave gate in this fixture is green (the default runCommand), so
    // nothing halts Phase I itself — the failure is confined to the write.
    expect(halted.outcome).toBe("success");
    const recorded = ledgerWrites(writes);
    expect(recorded.length).toBe(2);
    const lastGood = recorded[recorded.length - 1];
    expect(JSON.parse(lastGood).lastGreenWave).toBe(2);

    // The next invocation resumes at wave 3 — outcome (b) — from the last
    // successful write, exactly as though the failed write never happened.
    const record = [];
    const logs = [];
    const resumed = await main(
      makeLedgerArgs({ ledger: lastGood, record, logs, git: makeGit([]) })
    );
    expect(resumed.outcome).toBe("success");
    expect(dispatchedTaskIds(record)).toEqual(["T3"]);
    expect(logs.some((m) => m.startsWith("Resuming at wave 3 of 3 (wave ledger"))).toBe(true);
  });

  // AT-02's IG-6 positive conjunct (PM F-04) — the no-record arm is not
  // absence-only: the no-record log line is absent AND every wave of the
  // plan is dispatched from wave 1, the paired positive that distinguishes a
  // silent full run from a run that silently skipped something.
  it("no ledger at all is a silent full run — IG-6, the closure of the disregard catalogue", async () => {
    const record = [];
    const logs = [];
    const result = await main(makeLedgerArgs({ record, logs, git: makeGit([]) }));

    expect(result.outcome).toBe("success");
    expect(dispatchedTaskIds(record)).toEqual(["T1", "T2", "T3"]);
    expect(logs.some((m) => m.includes("wave ledger"))).toBe(false);
  });

  // AT-06 — a pointer AT the default (1) is not a setting: two runs, one with
  // `startWave: 1` spelled out and one with the key omitted entirely, produce
  // byte-identical logs and report rows. Positive conjunct: those two equally
  // "unset" runs are not equal to a THIRD run where the ledger records a real
  // resume — the ledger is honoured, and only the resumed subset dispatches.
  it("startWave: 1 is indistinguishable from the key being omitted, and neither suppresses the ledger", async () => {
    const explicitOne = JSON.stringify({
      implementation: { testCommand: "npm test", startWave: 1 },
    });
    const logsA = [];
    const resultA = await main(makeLedgerArgs({ config: explicitOne, logs: logsA, git: makeGit([]) }));
    const logsB = [];
    const resultB = await main(
      makeLedgerArgs({ config: CONFIG_WITH_TEST_COMMAND, logs: logsB, git: makeGit([]) })
    );
    expect(logsA).toEqual(logsB);
    expect(phaseDetail(resultA, "I")).toBe(phaseDetail(resultB, "I"));
    // No gate-degradation notice appears in either run: `startWave` alone never
    // starves `testCommand`/`scriptGate` resolution.
    expect(logsA.some((m) => m.includes("script-owned test gate is unavailable"))).toBe(false);

    // The positive conjunct: a THIRD, otherwise-identical run whose ledger
    // records a real resume is honoured and is NOT equal to the two above.
    const ledger = JSON.stringify({
      version: 1,
      feature: FEATURE,
      planHash: computePlanHash([
        [{ id: "T1", files: ["src/one.js"] }],
        [{ id: "T2", files: ["src/two.js"] }],
        [{ id: "T3", files: ["src/three.js"] }],
      ]),
      lastGreenWave: 1,
    });
    const record = [];
    const logsC = [];
    const resultC = await main(
      makeLedgerArgs({ ledger, config: explicitOne, record, logs: logsC, git: makeGit([]) })
    );
    expect(resultC.outcome).toBe("success");
    expect(logsC.some((m) => m.startsWith("Resuming at wave 2 of 3 (wave ledger"))).toBe(true);
    expect(dispatchedTaskIds(record)).toEqual(["T2", "T3"]);
    expect(logsC).not.toEqual(logsA);
  });

  // AT-10 — a wave whose tasks own no changed paths still records: the write
  // guard is the git TRANSPORT, never "did `git add` stage anything".
  it("a no-change wave still records green, and the next wave is announced", async () => {
    const writes = [];
    const logs = [];
    // `diff` reports nothing staged for any path — no task's files changed —
    // but the transport is present, so the record is still written.
    const noChangeGit = async (argv) => {
      const joined = argv.join(" ");
      if (joined === "rev-parse --abbrev-ref HEAD") return { ok: true, stdout: `${BRANCH}\n`, stderr: "" };
      if (argv[0] === "diff") return { ok: true, stdout: "", stderr: "" };
      return { ok: true, stdout: "", stderr: "" };
    };
    const result = await main(makeLedgerArgs({ writes, logs, git: noChangeGit }));

    expect(result.outcome).toBe("success");
    const recorded = ledgerWrites(writes);
    expect(recorded.map((t) => JSON.parse(t).lastGreenWave)).toEqual([1, 2, 3]);
  });

  // AT-13's announcement-table closure (TE F-14) — one table-driven suite over
  // §2.4's five ANNOUNCING rows (the sixth, IG-6, is silent by contract): a
  // fixture resolving each row's outcome, and the SET of "which row fired"
  // labels observed across the five fixtures equals the five row names — a
  // deleted announcement reds this set equality directly, not by depending on
  // which other AT happens to also cover it.
  it("the announcement table is closed: exactly the five §2.4 provenance rows fire, each once", async () => {
    const wave1Writes = [];
    let gateCalls = 0;
    const primer = await main(
      makeLedgerArgs({
        writes: wave1Writes,
        git: makeGit([]),
        runCommand: async () => {
          gateCalls += 1;
          return gateCalls === 1
            ? { ok: true, output: "Tests: 40 passed\n" }
            : { ok: false, output: "Tests: 1 failed, 39 passed\n" };
        },
      })
    );
    expect(primer.outcome).toBe("halted");
    const wave1Record = ledgerWrites(wave1Writes).find((t) => JSON.parse(t).lastGreenWave === 1);

    const completeWrites = [];
    const completeRun = await main(makeLedgerArgs({ writes: completeWrites, git: makeGit([]) }));
    expect(completeRun.outcome).toBe("success");
    const completeRecord = ledgerWrites(completeWrites).find((t) => JSON.parse(t).lastGreenWave === 3);

    const fixtures = {
      "full-run, operator pointer": makeLedgerArgs({
        config: JSON.stringify({ implementation: { testCommand: "npm test", startWave: 99 } }),
        git: makeGit([]),
      }),
      "full-run, disregarded record": makeLedgerArgs({ ledger: "{ not json", git: makeGit([]) }),
      "resume mid-plan, operator pointer": makeLedgerArgs({
        config: JSON.stringify({ implementation: { testCommand: "npm test", startWave: 2 } }),
        git: makeGit([]),
      }),
      "resume mid-plan, record": makeLedgerArgs({ ledger: wave1Record, git: makeGit([]) }),
      "skip Phase I": makeLedgerArgs({ ledger: completeRecord, git: makeGit([]) }),
    };

    const rowKind = (line) => {
      if (line.startsWith("Notice: implementation.startWave") && line.includes("is past the last wave"))
        return "full-run, operator pointer";
      if (line.startsWith("Notice: the wave ledger")) return "full-run, disregarded record";
      if (line.startsWith("Resuming at wave") && line.includes("(implementation.startWave)"))
        return "resume mid-plan, operator pointer";
      if (line.startsWith("Resuming at wave") && line.includes("(wave ledger"))
        return "resume mid-plan, record";
      if (line.startsWith("Skipping Phase I (wave ledger")) return "skip Phase I";
      return null;
    };

    const observedRows = new Set();
    for (const [expectedRow, args] of Object.entries(fixtures)) {
      const logs = [];
      const result = await main({ ...args, _log: (m) => logs.push(String(m)) });
      expect(result.outcome).toBe("success");
      const suffixed = logs.filter((m) => m.includes("(provenance: "));
      expect(suffixed.length).toBe(1);
      expect(rowKind(suffixed[0])).toBe(expectedRow);
      observedRows.add(rowKind(suffixed[0]));
    }

    expect([...observedRows].sort()).toEqual(
      [
        "full-run, disregarded record",
        "full-run, operator pointer",
        "resume mid-plan, operator pointer",
        "resume mid-plan, record",
        "skip Phase I",
      ].sort()
    );
  });

  // AT-18 — completion accumulates ACROSS invocations: halt at wave 2, resume
  // and halt at wave 4 (of a longer plan is unavailable here, so this reuses
  // the 3-wave fixture as halt-at-2-then-complete, and adds a THIRD run that
  // must skip 1-2 individually rather than re-deriving anything from wave 1).
  it("completion accumulates across invocations: a third run skips exactly the waves earlier runs recorded", async () => {
    const firstWrites = [];
    let gateCalls = 0;
    const halted = await main(
      makeLedgerArgs({
        writes: firstWrites,
        git: makeGit([]),
        runCommand: async () => {
          gateCalls += 1;
          return gateCalls === 1
            ? { ok: true, output: "Tests: 40 passed\n" }
            : { ok: false, output: "Tests: 1 failed, 39 passed\n" };
        },
      })
    );
    expect(halted.outcome).toBe("halted");
    const afterFirst = ledgerWrites(firstWrites).find((t) => JSON.parse(t).lastGreenWave === 1);
    expect(afterFirst).toBeDefined();

    // ── Run 2: resumes at wave 2, wave 2 is green, wave 3 reds — halting
    // AGAIN, one wave further than the first halt. ────────────────────────
    let secondGateCalls = 0;
    const secondWrites2 = [];
    const secondHalted2 = await main(
      makeLedgerArgs({
        ledger: afterFirst,
        writes: secondWrites2,
        git: makeGit([]),
        runCommand: async () => {
          secondGateCalls += 1;
          return secondGateCalls === 1
            ? { ok: true, output: "Tests: 40 passed\n" }
            : { ok: false, output: "Tests: 1 failed, 39 passed\n" };
        },
      })
    );
    expect(secondHalted2.outcome).toBe("halted");
    const afterSecond = ledgerWrites(secondWrites2).find((t) => JSON.parse(t).lastGreenWave === 2);
    expect(afterSecond).toBeDefined();

    const record = [];
    const logs = [];
    const third = await main(
      makeLedgerArgs({ ledger: afterSecond, record, logs, git: makeGit([]) })
    );
    expect(third.outcome).toBe("success");
    // The third run dispatches ONLY wave 3 — the record discriminates on the
    // waves THIS lineage of invocations actually executed, not on wave 1's
    // original commit.
    expect(dispatchedTaskIds(record)).toEqual(["T3"]);
    expect(logs.some((m) => m.startsWith("Resuming at wave 3 of 3 (wave ledger"))).toBe(true);
  });
});

describe("computePlanHash — the ledger's plan fingerprint", () => {
  const WAVES = [
    [{ id: "T1", files: ["src/one.js"] }],
    [{ id: "T2", files: ["src/two.js"] }],
  ];

  it("is deterministic, and is 8 hex digits", () => {
    expect(computePlanHash(WAVES)).toBe(computePlanHash(WAVES));
    expect(computePlanHash(WAVES)).toMatch(/^[0-9a-f]{8}$/);
  });

  it("changes when the owned files change", () => {
    expect(
      computePlanHash([[{ id: "T1", files: ["src/one.js"] }], [{ id: "T2", files: ["src/CHANGED.js"] }]])
    ).not.toBe(computePlanHash(WAVES));
  });

  // T-07's one owed arm (§5.3): hashing the same PLAN TEXT twice through the
  // real `parsePlanTasks`/`computeWaves` pipeline — every shipped arm above
  // hashes a hand-built wave array twice, which never exercises the parse step
  // this feature's `main()` call site actually goes through.
  it("is deterministic through the real parse pipeline, hashing the same PLAN text twice", () => {
    const tasks = parsePlanTasks(PLAN_THREE_WAVES);
    const ownership = parsePlanOwnership(PLAN_THREE_WAVES).ownership;
    const wavesA = computeWaves(tasks, ownership);
    const wavesB = computeWaves(
      parsePlanTasks(PLAN_THREE_WAVES),
      parsePlanOwnership(PLAN_THREE_WAVES).ownership
    );
    expect(computePlanHash(wavesA)).toBe(computePlanHash(wavesB));
  });

  it("changes when the wave order changes", () => {
    expect(computePlanHash([WAVES[1], WAVES[0]])).not.toBe(computePlanHash(WAVES));
  });

  it("changes when two waves are merged into one", () => {
    expect(computePlanHash([[WAVES[0][0], WAVES[1][0]]])).not.toBe(computePlanHash(WAVES));
  });
});

// ─── A6 fixture hygiene (CR round 1, PM F-10) ────────────────────────────────
//
// Every `rootCause:` literal in this file is a stand-in for what `runWaveGateSeam` returns, and
// `parseA6RootCause` only ever returns a member of `ADVISORY_ROOT_CAUSES` — a fixture naming
// anything else (`flaky-test`, `cross-file-drift`) tests a shape production cannot emit, and a
// reader takes it for the real vocabulary. Scanned off this file's own source so a fixture added
// later is covered without anyone remembering to extend a list.
describe("A6 fixture hygiene — every haltFields fixture names a real root-cause class", () => {
  it("no `rootCause:` literal in this file sits outside ADVISORY_ROOT_CAUSES", () => {
    const source = readFixtureSource(
      fixtureJoin(fixtureDirname(fixtureFileURLToPath(import.meta.url)), "waveExecution.test.js"),
      "utf8"
    );
    const used = [...source.matchAll(/rootCause:\s*"([^"]+)"/g)].map((m) => m[1]);

    expect(used.length).toBeGreaterThan(0);
    expect([...new Set(used)].filter((c) => !ADVISORY_ROOT_CAUSES.includes(c))).toEqual([]);
  });
});
