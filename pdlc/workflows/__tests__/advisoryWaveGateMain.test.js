// advisoryWaveGateMain.test.js — A6 through `mainDev`, the production entry point.
//
// CR round 1 raised two findings this file exists to answer:
//
//   * TE F-06 / PM F-06 — every wave-loop test injected a seam fake (`_runWaveGateSeam`) and every
//     seam test called `runWaveGateSeam` directly, so no proof traversed the real seam AND the real
//     wiring together. `result.haltAdvisory` was asserted equal to the very object the fixture had
//     handed the loop — an identity, not an oracle (DC-07's pattern exactly). Every test below runs
//     `mainDev` with NO `_runWaveGateSeam` injection: the seam under test is the shipped one.
//   * TE F-05 / PM F-05 — AC-1.5's inapplicability notice is a CARDINALITY claim on a named
//     surface ("exactly one … none in a run where A6 applies"), and nothing counted anything. The
//     four arms PLAN A6-18 allocates (BL-03 alone, BL-04 alone, both absent, and the zero-count
//     discriminator) are below, each counting statements over the WHOLE emitted notice surface
//     with no authorship filter.
//
// The in-memory harness follows `advisoryDisabled.test.js`'s own local scenario harness (its
// "decision 3": never `defaultWriteFile`/`defaultGit`, which touch the real filesystem) rather
// than importing it — that file's copy is a transcribed capture of the D-6 baseline and is pinned
// to it, while this one deliberately varies the PLAN and the config per arm.

import mainDev from "../orchestrate-dev.js";

const FEATURE = "adv-a6-main-fixture";
const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;
const CONFIG_PATH = ".claude/pdlc.config.json";

// A PLAN in wave mode: a task table AND a file-ownership manifest that validates against it.
const WAVE_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

// The same PLAN with the manifest removed — BL-03's absence, the worktree exception path.
const NO_MANIFEST_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
].join("\n");

// The A6 dispatch is a `se-review` call whose prompt opens with the wave-gate diagnosis request
// (`orchestrate-dev.js:3140`), which is what distinguishes it from a review-loop `se-review`.
const A6_PROMPT_MARKER = "gate went red";

function a6Reply({ proposedAction = "E-5", rootCause = "wave-internal-defect", diagnosis = "the wave's own test file drifted", evidence }) {
  return [
    "SEAM: A6",
    `DIAGNOSIS: ${diagnosis}`,
    `PROPOSED-ACTION: ${proposedAction}`,
    "CONFIDENCE: high",
    "WITHIN-ENVELOPE: yes",
    `EVIDENCE: ${evidence}`,
    `ROOT-CAUSE: ${rootCause}`,
  ].join("\n");
}

/** The all-approve pipeline agent, with one hook for the A6 dispatch. */
function makePipelineAgent({ a6, dispatched = [] }) {
  return async (skill, prompt) => {
    const text = String(prompt ?? "");
    dispatched.push({ skill, prompt: text });
    if (skill === "guard") return "{ ok: true }";
    if (skill === "se-review" && text.includes(A6_PROMPT_MARKER)) return a6 ? a6(text) : "no advisory reply";
    if (skill === "pm-review" || skill === "se-review" || skill === "te-review") {
      return 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }
    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      if (text.includes("DECISIONS_WARRANTED")) return "Finalized TSPEC.\nDECISIONS_WARRANTED: false";
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({ tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }] });
      }
      return "Created/updated document successfully.";
    }
    if (skill === "se-implement") return "Tests: 5 passed, 0 failed. All good.";
    if (skill === "harvest-learnings") return "Harvest complete. LEARNINGS written and committed.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (text.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
      if (text.includes("Raise a pull request")) return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      return "Checks complete.\nCI_STATUS: passed";
    }
    return "Success.";
  };
}

function makeHarness({ configText, plan, planInPhaseI }) {
  const created = new Set();
  // Phase P rejects a PLAN with no ownership manifest outright, so the ONLY route to the legacy
  // (worktree exception) path is a PLAN that carried a manifest when Phase P read it and none when
  // Phase I does — a Phase P skipped on recorded approval, in production. This is the same
  // phase-aware `_readFile` idiom `waveExecution.test.js:445-455` already uses for its own legacy
  // arms; `planInPhaseI`, when given, is what Phase I sees.
  let inPhaseI = false;
  const gitCalls = [];
  let currentBranch = `feat-${FEATURE}`;

  const _writeFile = async (path) => {
    created.add(String(path));
    return { ok: true };
  };
  const _appendFile = async (path) => {
    created.add(String(path));
    return { ok: true };
  };
  const _git = async (argv) => {
    const args = Array.isArray(argv) ? argv : [];
    gitCalls.push(args);
    if (args[0] === "add") {
      for (const a of args.slice(1)) if (a !== "--") created.add(a);
      return { ok: true, stdout: "", stderr: "" };
    }
    if (args[0] === "checkout") {
      currentBranch = args[args.length - 1];
      return { ok: true, stdout: "", stderr: "" };
    }
    if (args[0] === "rev-parse" && args.includes("--abbrev-ref")) {
      return { ok: true, stdout: `${currentBranch}\n`, stderr: "" };
    }
    if (args[0] === "rev-parse" || args[0] === "write-tree" || args[0] === "commit-tree") {
      return { ok: true, stdout: "abc1234abc1234abc1234abc1234abc1234abcd", stderr: "" };
    }
    // `git diff --name-only` with no revision range is A6's `producedPaths` transport
    // (`orchestrate-dev.js:3120`) — the paths the agent's repair left in the worktree. The
    // fixture's repair touches the wave's own owned file, which is what makes an E-5 proposal
    // land INSIDE the declared scope. The `--cached` form is the wave loop's staging probe
    // (`orchestrate-dev.js:12720`) and is a different question.
    if (args[0] === "diff" && args.includes("--cached")) {
      return { ok: true, stdout: "staged\n", stderr: "" };
    }
    if (args[0] === "diff" && args[1] === "--name-only" && args.length === 2) {
      return { ok: true, stdout: "src/one.js\n", stderr: "" };
    }
    if (args[0] === "diff") return { ok: true, stdout: "staged\n", stderr: "" };
    return { ok: true, stdout: "", stderr: "" };
  };
  const _readFile = (path) => {
    const p = String(path);
    if (p.includes("/PLAN-")) return inPhaseI && planInPhaseI ? planInPhaseI : plan;
    if (p.endsWith("pdlc.config.json")) return configText;
    if (/CROSS-REVIEW-.*\.md$/.test(p)) return "## Verdict\nVERDICT: Approved\n";
    return null;
  };

  const enterPhaseI = (label) => {
    if (String(label).startsWith("Phase I")) inPhaseI = true;
  };

  return { created, gitCalls, enterPhaseI, _writeFile, _appendFile, _git, _readFile, _hashFile: async () => "a".repeat(64) };
}

async function runPipeline({ configText, plan = WAVE_PLAN, planInPhaseI, runCommand, a6 } = {}) {
  const harness = makeHarness({ configText, plan, planInPhaseI });
  const logs = [];
  const dispatched = [];
  const result = await mainDev({
    reqPath: REQ_PATH,
    forcePhases: null,
    _agent: makePipelineAgent({ a6, dispatched }),
    _parallel: (promises) => Promise.all(promises),
    _checkFile: () => ({ ok: true }),
    _readFile: harness._readFile,
    _writeFile: harness._writeFile,
    _appendFile: harness._appendFile,
    _git: harness._git,
    _hashFile: harness._hashFile,
    _phase: harness.enterPhaseI,
    _pipeline: async (label, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
    _log: (msg) => logs.push(String(msg)),
    ...(runCommand ? { _runCommand: runCommand } : {}),
  });
  return { result, logs, dispatched, harness };
}

// AC-1.5's observable: statements of INAPPLICABILITY, counted over the whole emitted surface with
// no authorship filter — both carriers, the legacy-path one and the wave-mode gate one.
function inapplicabilityStatements(logs) {
  return logs.filter(
    (l) => l.includes("running the worktree exception path") || l.includes("the script-owned test gate is unavailable")
  );
}

const ENABLED_ADVISORY = {
  enabled: true,
  attemptBudget: 2,
  seamBudgetMinutes: 10,
  envelope: ["E-1", "E-2", "E-3", "E-4", "E-5", "E-6"],
  waveBudgetPerRun: 2,
};

const A6_DISPATCHES = (dispatched) =>
  dispatched.filter((d) => d.skill === "se-review" && d.prompt.includes(A6_PROMPT_MARKER));

// ═══ PROP-SEAM-07 / PROP-SEAM-08 — AC-1.5's cardinality, all four arms ═════════════════════════

describe("PROP-SEAM-07 — exactly one inapplicability statement, on each arm that has one", () => {
  test("(i) BL-03 alone — no ownership manifest, a script gate configured: one statement, naming only the manifest", async () => {
    const { logs } = await runPipeline({
      configText: JSON.stringify({ implementation: { testCommand: "npm test" }, advisory: ENABLED_ADVISORY }),
      planInPhaseI: NO_MANIFEST_PLAN,
      runCommand: async () => ({ ok: true, output: "Tests: 5 passed\n" }),
    });

    const statements = inapplicabilityStatements(logs);
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain("no valid file-ownership manifest on this PLAN");
    expect(statements[0]).not.toContain("no script-owned test gate");
  });

  test("PROP-SEAM-10 — a run degrading to the legacy self-report gate reaches A6 zero times, and still states its one cause", async () => {
    const { logs, dispatched } = await runPipeline({
      configText: JSON.stringify({ implementation: { testCommand: "npm test" }, advisory: ENABLED_ADVISORY }),
      planInPhaseI: NO_MANIFEST_PLAN,
      // Red on every call: on the wave-mode path this is exactly the condition A6 exists for, so
      // a zero dispatch count here is reachability, not quietness.
      runCommand: async () => ({ ok: false, output: "FAIL src/one.test.js\nTests: 1 failed, 4 passed\n" }),
    });

    // The tier is ENABLED and the gate is RED — A6 is unreachable because the run degraded off
    // the wave-mode branch, which is the structural claim AC-1.5 rests on.
    expect(A6_DISPATCHES(dispatched)).toHaveLength(0);
    expect(inapplicabilityStatements(logs)).toHaveLength(1);
  });

  test("PROP-SEAM-09 (AC-1.4, NFR-2) — the disabled tier's notice surface is identical to the enabled-but-never-fired run's", async () => {
    const scenario = { planInPhaseI: NO_MANIFEST_PLAN };
    const enabled = await runPipeline({
      ...scenario,
      configText: JSON.stringify({ implementation: { testCommand: "npm test" }, advisory: ENABLED_ADVISORY }),
      runCommand: async () => ({ ok: true, output: "Tests: 5 passed\n" }),
    });
    const disabled = await runPipeline({
      ...scenario,
      configText: JSON.stringify({ implementation: { testCommand: "npm test" }, advisory: { ...ENABLED_ADVISORY, enabled: false } }),
      runCommand: async () => ({ ok: true, output: "Tests: 5 passed\n" }),
    });

    // §2.6's config hoist is unconditional by design: whether the tier is on changes nothing
    // about which prerequisites the run reports missing. Equality, not containment — a notice
    // the disabled run gained or lost fails here.
    expect(inapplicabilityStatements(disabled.logs)).toEqual(inapplicabilityStatements(enabled.logs));
    expect(inapplicabilityStatements(enabled.logs)).toHaveLength(1);
  });

  test("(ii) BL-04 alone — wave mode, no test command: one statement, naming only the gate half", async () => {
    const { logs } = await runPipeline({
      configText: JSON.stringify({ advisory: ENABLED_ADVISORY }),
      plan: WAVE_PLAN,
    });

    const statements = inapplicabilityStatements(logs);
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain("the script-owned test gate is unavailable");
    expect(statements[0]).toContain(`implementation.testCommand in ${CONFIG_PATH}`);
    expect(statements[0]).not.toContain("file-ownership manifest");
  });

  test("the discriminator (iv) — a run where A6 APPLIES states no inapplicability at all", async () => {
    const { logs, result } = await runPipeline({
      configText: JSON.stringify({ implementation: { testCommand: "npm test" }, advisory: ENABLED_ADVISORY }),
      plan: WAVE_PLAN,
      runCommand: async () => ({ ok: true, output: "Tests: 5 passed\n" }),
    });

    expect(result.outcome).toBe("success");
    // Zero — not "at least one fewer", not "no mention of A6": a carrier emitting the notice
    // unconditionally satisfies arms (i)–(iii) and is caught only here.
    expect(inapplicabilityStatements(logs)).toEqual([]);
  });
});

describe("PROP-SEAM-08 — both prerequisites absent still yields ONE statement, naming both causes", () => {
  test("(iii) no manifest AND no test command: exactly one statement, both causes in it", async () => {
    const { logs } = await runPipeline({
      configText: JSON.stringify({ advisory: ENABLED_ADVISORY }),
      planInPhaseI: NO_MANIFEST_PLAN,
    });

    const statements = inapplicabilityStatements(logs);
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain("no valid file-ownership manifest on this PLAN");
    expect(statements[0]).toContain("no script-owned test gate");
    expect(statements[0]).toContain(`implementation.testCommand in ${CONFIG_PATH}`);
  });

  test("the config read is hoisted, not duplicated: the both-absent run never emits the wave-mode gate notice too", async () => {
    const { logs } = await runPipeline({
      configText: JSON.stringify({ advisory: ENABLED_ADVISORY }),
      planInPhaseI: NO_MANIFEST_PLAN,
    });

    expect(logs.filter((l) => l.includes("the script-owned test gate is unavailable"))).toEqual([]);
  });
});

// ═══ TE F-06 / PM F-06 — the real seam, reached from `mainDev` ══════════════════════════════════
//
// No `_runWaveGateSeam` injection anywhere below: the wave loop enters the shipped
// `runWaveGateSeam`, which builds the shipped `buildA6SeamOps` and dispatches through the shipped
// `runAdvisorySeam`. The oracles are the run's own outputs — the report keys, the files the real
// `_appendFile` created, and a dispatch-count over the agent double.

describe("TE F-06 — an enabled tier reaches the real A6 seam from mainDev (resolution)", () => {
  test("a red first pass and a green re-gate: A6 is dispatched, the wave recovers, and the run succeeds with no haltAdvisory", async () => {
    let gateCalls = 0;
    const { result, logs, dispatched, harness } = await runPipeline({
      configText: JSON.stringify({ implementation: { testCommand: "npm test" }, advisory: ENABLED_ADVISORY }),
      runCommand: async () => {
        gateCalls += 1;
        // Pass 1 is the wave's own gate (red — the condition A6 exists for); every later call is
        // A6's re-gate, green.
        return gateCalls === 1
          ? { ok: false, output: "FAIL src/one.test.js\nTests: 1 failed, 4 passed\n" }
          : { ok: true, output: "Tests: 5 passed\n" };
      },
      a6: (prompt) =>
        a6Reply({
          proposedAction: "E-5",
          rootCause: "wave-internal-defect",
          // Cited verbatim from the prompt's own captured gate output, which is the shipped
          // citation rule (`citesGateOutput`) — a reply that cannot cite is malformed.
          evidence: prompt.includes("Tests: 1 failed, 4 passed")
            ? "FAIL src/one.test.js Tests: 1 failed, 4 passed"
            : "no citation available",
        }),
    });

    expect(result.outcome).toBe("success");
    // The seam really ran: exactly one A6 dispatch, on the real driver's own prompt.
    expect(A6_DISPATCHES(dispatched)).toHaveLength(1);
    expect(gateCalls).toBeGreaterThan(1);
    // The report's run-level summary counts the real disposition, not a fixture's.
    const a6Row = result.advisory.rows.find((r) => r.seam === "A6");
    expect(a6Row).toMatchObject({ invocations: 1, resolved: 1, escalated: 0 });
    // A resolution is not a halt: no per-halt diagnostic key at all.
    expect(result.haltAdvisory).toBeUndefined();
    // The advisory record was written through the real `_appendFile`; nothing was escalated.
    expect([...harness.created]).toContain(`docs/${FEATURE}/ADVISORY-${FEATURE}.md`);
    expect([...harness.created].some((p) => p.endsWith("ESCALATIONS.md"))).toBe(false);
    expect(logs.some((l) => l.includes("advisory seam A6"))).toBe(true);
  });
});

describe("TE F-06 — an enabled tier reaches the real A6 seam from mainDev (escalation)", () => {
  test("a persistently red gate: A6 escalates, the run halts, and haltAdvisory carries the REAL seam's class and diagnosis", async () => {
    const { result, dispatched, harness } = await runPipeline({
      configText: JSON.stringify({ implementation: { testCommand: "npm test" }, advisory: ENABLED_ADVISORY }),
      runCommand: async () => ({ ok: false, output: "FAIL src/one.test.js\nTests: 1 failed, 4 passed\n" }),
      a6: (prompt) =>
        a6Reply({
          // Outside A6's permitted actions, so the shipped X-c clause refuses it and nothing is
          // applied to the tree — the escalation half, reached without any tree mutation.
          proposedAction: "E-2",
          rootCause: "plan-ordering-defect",
          diagnosis: "wave 1 needs a symbol a later task owns",
          evidence: prompt.includes("Tests: 1 failed, 4 passed")
            ? "FAIL src/one.test.js Tests: 1 failed, 4 passed"
            : "no citation available",
        }),
    });

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("Wave 1 test gate failed");
    expect(A6_DISPATCHES(dispatched).length).toBeGreaterThanOrEqual(1);

    // AC-6.3 — the class and the diagnosis are on the REPORT, produced by the real seam from the
    // real reply. Neither value was handed to the loop by this test (DC-07 / TE F-06).
    expect(result.haltAdvisory).toEqual({
      rootCause: "plan-ordering-defect",
      diagnosis: "wave 1 needs a symbol a later task owns",
      repairApplied: false,
      repairPaths: [],
    });
    const a6Row = result.advisory.rows.find((r) => r.seam === "A6");
    expect(a6Row).toMatchObject({ invocations: 1, resolved: 0, escalated: 1 });
    // Both durable artifacts were reached through the real transports.
    expect([...harness.created]).toContain(`docs/${FEATURE}/ADVISORY-${FEATURE}.md`);
    expect([...harness.created]).toContain("docs/_queue/ESCALATIONS.md");
  });
});
