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
  evaluateWaveDispatch,
  parseImplementationConfig,
} from "../orchestrate-dev.js";

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
    // The report row still counts the plan's waves, not the executed ones.
    expect(phaseDetail(result, "I")).toBe(
      "All 3 waves complete (wave mode, script-owned gate)"
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
        `this plan (3) — running every wave from 1.`
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
