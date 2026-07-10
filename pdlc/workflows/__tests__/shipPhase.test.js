/**
 * Tests for Phase PUB — raise PR + verify GHA checks (TSPEC-SHIP-01..04).
 * Covers parsePrUrl, checkPrCi, parseRebaseStatus, the raisePrAndVerifyCi poll loop, and main() wiring.
 */

import main, {
  parsePrUrl,
  checkPrCi,
  parseRebaseStatus,
  raisePrAndVerifyCi,
} from "../orchestrate-dev.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let logMessages = [];
const originalLog = console.log;

beforeEach(() => {
  logMessages = [];
  console.log = (...args) => logMessages.push(args.join(" "));
});

afterEach(() => {
  console.log = originalLog;
});

// ─── parsePrUrl ───────────────────────────────────────────────────────────────
describe("parsePrUrl", () => {
  it("extracts the URL from the trailer", () => {
    expect(
      parsePrUrl("PR opened.\nPR_URL: https://github.com/a/b/pull/7")
    ).toBe("https://github.com/a/b/pull/7");
  });

  it("returns the last PR_URL line when several are present", () => {
    expect(
      parsePrUrl("PR_URL: https://x/pull/1\nmore\nPR_URL: https://x/pull/2")
    ).toBe("https://x/pull/2");
  });

  it("returns null for PR_URL: none", () => {
    expect(parsePrUrl("could not open\nPR_URL: none")).toBeNull();
  });

  // PROP-SHIP-01: empty / whitespace-only value after the prefix is null
  it("returns null for an empty PR_URL value after the prefix", () => {
    expect(parsePrUrl("PR_URL: ")).toBeNull();
    expect(parsePrUrl("PR_URL:    ")).toBeNull();
  });

  it("returns null when no trailer present", () => {
    expect(parsePrUrl("Success.")).toBeNull();
  });

  it("returns null for empty / nullish input", () => {
    expect(parsePrUrl("")).toBeNull();
    expect(parsePrUrl(null)).toBeNull();
    expect(parsePrUrl(undefined)).toBeNull();
  });
});

// ─── checkPrCi — gh statusCheckRollup mapping ────────────────────────────────
describe("checkPrCi mapping table", () => {
  // A fake execFn that returns the given JSON string for any command.
  const execReturning = (json) => () => json;
  const rollup = (arr) => JSON.stringify({ statusCheckRollup: arr });

  it("empty rollup array → none", async () => {
    expect(await checkPrCi("url", { execFn: execReturning(rollup([])) })).toBe(
      "none"
    );
  });

  it("absent rollup key → none", async () => {
    expect(
      await checkPrCi("url", { execFn: execReturning("{}") })
    ).toBe("none");
  });

  it("a not-yet-completed CheckRun → pending", async () => {
    const json = rollup([
      { __typename: "CheckRun", status: "IN_PROGRESS", conclusion: null },
      { __typename: "CheckRun", status: "COMPLETED", conclusion: "SUCCESS" },
    ]);
    expect(await checkPrCi("url", { execFn: execReturning(json) })).toBe(
      "pending"
    );
  });

  it("a PENDING StatusContext → pending", async () => {
    const json = rollup([{ __typename: "StatusContext", state: "PENDING" }]);
    expect(await checkPrCi("url", { execFn: execReturning(json) })).toBe(
      "pending"
    );
  });

  it("all completed and every conclusion success-ish → passed", async () => {
    const json = rollup([
      { __typename: "CheckRun", status: "COMPLETED", conclusion: "SUCCESS" },
      { __typename: "CheckRun", status: "COMPLETED", conclusion: "NEUTRAL" },
      { __typename: "CheckRun", status: "COMPLETED", conclusion: "SKIPPED" },
      { __typename: "StatusContext", state: "SUCCESS" },
    ]);
    expect(await checkPrCi("url", { execFn: execReturning(json) })).toBe(
      "passed"
    );
  });

  it("a completed FAILURE conclusion → failed", async () => {
    const json = rollup([
      { __typename: "CheckRun", status: "COMPLETED", conclusion: "SUCCESS" },
      { __typename: "CheckRun", status: "COMPLETED", conclusion: "FAILURE" },
    ]);
    expect(await checkPrCi("url", { execFn: execReturning(json) })).toBe(
      "failed"
    );
  });

  it("a StatusContext ERROR state → failed", async () => {
    const json = rollup([{ __typename: "StatusContext", state: "ERROR" }]);
    expect(await checkPrCi("url", { execFn: execReturning(json) })).toBe(
      "failed"
    );
  });

  it("each failure conclusion maps to failed", async () => {
    for (const c of [
      "FAILURE",
      "ERROR",
      "CANCELLED",
      "TIMED_OUT",
      "ACTION_REQUIRED",
      "STARTUP_FAILURE",
    ]) {
      const json = rollup([
        { __typename: "CheckRun", status: "COMPLETED", conclusion: c },
      ]);
      expect(await checkPrCi("url", { execFn: execReturning(json) })).toBe(
        "failed"
      );
    }
  });

  it("pending dominates a mix of pending + failed", async () => {
    const json = rollup([
      { __typename: "CheckRun", status: "IN_PROGRESS", conclusion: null },
      { __typename: "CheckRun", status: "COMPLETED", conclusion: "FAILURE" },
    ]);
    expect(await checkPrCi("url", { execFn: execReturning(json) })).toBe(
      "pending"
    );
  });

  it("exec throwing → unknown", async () => {
    const throwingExec = () => {
      throw new Error("gh not installed");
    };
    expect(await checkPrCi("url", { execFn: throwingExec })).toBe("unknown");
  });

  it("unparseable JSON → unknown", async () => {
    expect(
      await checkPrCi("url", { execFn: execReturning("not json{") })
    ).toBe("unknown");
  });
});

// ─── parseRebaseStatus ─────────────────────────────────────────────────────
describe("parseRebaseStatus", () => {
  it("parses clean status", () => {
    expect(parseRebaseStatus("REBASE_STATUS: clean")).toBe("clean");
  });

  it("parses conflict status", () => {
    expect(parseRebaseStatus("Conflicting files: a.ts, b.ts\nREBASE_STATUS: conflict")).toBe("conflict");
  });

  it("is case-insensitive on the value", () => {
    expect(parseRebaseStatus("REBASE_STATUS: Clean")).toBe("clean");
    expect(parseRebaseStatus("REBASE_STATUS: CONFLICT")).toBe("conflict");
  });

  it("returns unknown for missing / malformed / empty", () => {
    expect(parseRebaseStatus("no trailer here")).toBe("unknown");
    expect(parseRebaseStatus("REBASE_STATUS: maybe")).toBe("unknown");
    expect(parseRebaseStatus("")).toBe("unknown");
    expect(parseRebaseStatus(null)).toBe("unknown");
  });

  it("finds the last REBASE_STATUS line when several are present", () => {
    expect(parseRebaseStatus("REBASE_STATUS: conflict\nretried\nREBASE_STATUS: clean")).toBe("clean");
  });
});

// ─── raisePrAndVerifyCi ─────────────────────────────────────────────────────
describe("raisePrAndVerifyCi", () => {
  // The ship-pr agent now only creates the PR — CI status comes from _checkCi.
  const prAgent = async (skill, prompt) => {
    if (skill !== "ship-pr") return "Success.";
    return "PR opened.\nPR_URL: https://github.com/a/b/pull/9";
  };

  // A _checkCi double that replays the given statuses in order (repeats the last).
  function makeCheckCi(responses) {
    let idx = 0;
    return async () => {
      const r = responses[Math.min(idx, responses.length - 1)];
      idx += 1;
      return r;
    };
  }

  it("halts when PR creation returns no URL", async () => {
    const agent = async () => "could not push\nPR_URL: none";
    await expect(
      raisePrAndVerifyCi({ feature: "feat", _agent: agent, _log: () => {} })
    ).rejects.toThrow(/PR creation failed/);
  });

  it("returns passed when checks pass on first poll (no sleep needed)", async () => {
    let sleeps = 0;
    const result = await raisePrAndVerifyCi({
      feature: "feat",
      _agent: prAgent,
      _checkCi: makeCheckCi(["passed"]),
      _log: () => {},
      _sleep: async () => {
        sleeps += 1;
      },
    });
    expect(result).toEqual({
      prUrl: "https://github.com/a/b/pull/9",
      ciStatus: "passed",
    });
    expect(sleeps).toBe(0);
  });

  it("halts when a check fails", async () => {
    await expect(
      raisePrAndVerifyCi({
        feature: "feat",
        _agent: prAgent,
        _checkCi: makeCheckCi(["failed"]),
        _log: () => {},
        _sleep: async () => {},
      })
    ).rejects.toThrow(/GHA checks failed/);
  });

  it("keeps polling through pending until checks pass", async () => {
    let sleeps = 0;
    const result = await raisePrAndVerifyCi({
      feature: "feat",
      _agent: prAgent,
      _checkCi: makeCheckCi(["pending", "pending", "passed"]),
      _log: () => {},
      _now: () => 0,
      _sleep: async () => {
        sleeps += 1;
      },
    });
    expect(result.ciStatus).toBe("passed");
    expect(sleeps).toBe(2); // two pending iterations slept
  });

  it("returns no-checks when none appear within the no-checks window", async () => {
    // Clock advances by pollIntervalMs on every sleep.
    let t = 0;
    const pollIntervalMs = 1000;
    const noChecksTimeoutMs = 5000;
    const result = await raisePrAndVerifyCi({
      feature: "feat",
      _agent: prAgent,
      _checkCi: makeCheckCi(["none"]),
      _log: () => {},
      _now: () => t,
      _sleep: async () => {
        t += pollIntervalMs;
      },
      pollIntervalMs,
      noChecksTimeoutMs,
    });
    expect(result.ciStatus).toBe("no-checks");
  });

  it("treats unknown (malformed) status like no-checks until the window expires", async () => {
    let t = 0;
    const result = await raisePrAndVerifyCi({
      feature: "feat",
      _agent: prAgent,
      _checkCi: makeCheckCi(["unknown"]),
      _log: () => {},
      _now: () => t,
      _sleep: async () => {
        t += 1000;
      },
      pollIntervalMs: 1000,
      noChecksTimeoutMs: 3000,
    });
    expect(result.ciStatus).toBe("no-checks");
  });

  it("halts if checks never complete before the overall completion cap", async () => {
    let t = 0;
    await expect(
      raisePrAndVerifyCi({
        feature: "feat",
        _agent: prAgent,
        _checkCi: makeCheckCi(["pending"]),
        _log: () => {},
        _now: () => t,
        _sleep: async () => {
          t += 1000;
        },
        pollIntervalMs: 1000,
        completionTimeoutMs: 4000,
      })
    ).rejects.toThrow(/did not complete within/);
  });

  // PROP-SHIP-13 / AT-SHIP-08: pending arriving at or after the no-checks
  // boundary must NOT exit via the no-checks path — it activates the
  // completion window. `none` polls advance the clock past the no-checks
  // timeout, then `pending` appears; the loop must reach `passed`, never
  // return `no-checks`.
  it("activates the completion window when pending arrives at the no-checks boundary", async () => {
    let t = 0;
    const pollIntervalMs = 1000;
    const noChecksTimeoutMs = 3000;
    const result = await raisePrAndVerifyCi({
      feature: "feat",
      _agent: prAgent,
      // none, none, none → clock reaches the boundary; then pending, passed
      _checkCi: makeCheckCi(["none", "none", "none", "pending", "passed"]),
      _log: () => {},
      _now: () => t,
      _sleep: async () => {
        t += pollIntervalMs;
      },
      pollIntervalMs,
      noChecksTimeoutMs,
      completionTimeoutMs: 60000,
    });
    expect(result.ciStatus).toBe("passed");
  });

  // PROP-SHIP-08 (corrected): the completion cap is measured from the FIRST
  // pending, not from PR-raise. Slow-registering checks get a full budget.
  it("measures the completion cap from the first pending, not from PR raise", async () => {
    let t = 0;
    const pollIntervalMs = 1000;
    // Checks register at t=2000 (poll 3). Under from-start semantics a pending
    // poll at t=5000 (poll 6) would halt (elapsed >= completionTimeoutMs).
    // Under from-first-pending the budget runs until now-2000 >= 5000 (t=7000),
    // so the `passed` poll at t=6000 must succeed.
    const result = await raisePrAndVerifyCi({
      feature: "feat",
      _agent: prAgent,
      _checkCi: makeCheckCi([
        "none",
        "none",
        "pending",
        "pending",
        "pending",
        "pending",
        "passed",
      ]),
      _log: () => {},
      _now: () => t,
      _sleep: async () => {
        t += pollIntervalMs;
      },
      pollIntervalMs,
      noChecksTimeoutMs: 3000,
      completionTimeoutMs: 5000,
    });
    expect(result.ciStatus).toBe("passed");
  });
});

// ─── main() wiring ──────────────────────────────────────────────────────────
describe("Phase PUB wiring in main()", () => {
  function makeSuccessAgent() {
    return async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      if (["se-review", "te-review", "pm-review"].includes(skill)) {
        return `Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
      }
      if (["pm-author", "se-author", "te-author"].includes(skill)) {
        if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
          return "Finalized.\nDECISIONS_WARRANTED: false";
        }
        if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
          return JSON.stringify({
            tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
          });
        }
        return "Document created.";
      }
      if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
      if (skill === "harvest-learnings") return "Harvest complete.";
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      if (skill === "ship-pr") {
        if (prompt.includes("Rebase the feature branch")) {
          return "Rebased.\nREBASE_STATUS: clean";
        }
        if (prompt.includes("Raise a pull request")) {
          return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
        }
        return "Checks.\nCI_STATUS: passed";
      }
      return "Success.";
    };
  }

  const baseArgs = () => ({
    reqPath: "docs/test-feat/REQ-test-feat.md",
    _agent: makeSuccessAgent(),
    _parallel: (p) => Promise.all(p),
    _checkFile: () => ({ ok: true }),
    _checkCi: async () => "passed",
    _phase: () => {},
    _pipeline: async (l, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
  });

  it("success run records Phase PUB and reports prUrl + ciStatus", async () => {
    const result = await main(baseArgs());
    expect(result.outcome).toBe("success");
    expect(result.prUrl).toBe("https://github.com/acme/repo/pull/42");
    expect(result.ciStatus).toBe("passed");
    const pub = result.phases.find((p) => p.phase === "PUB");
    expect(pub).toBeTruthy();
    expect(pub.status).toBe("✅");
  });

  it("halts the pipeline when GHA checks fail", async () => {
    const args = baseArgs();
    args._checkCi = async () => "failed";
    const result = await main(args);
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/GHA checks failed/);
  });

  it("halts when the PR cannot be created", async () => {
    const args = baseArgs();
    const inner = args._agent;
    args._agent = async (skill, prompt) => {
      if (skill === "ship-pr" && prompt.includes("Raise a pull request")) {
        return "push failed\nPR_URL: none";
      }
      return inner(skill, prompt);
    };
    const result = await main(args);
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toMatch(/PR creation failed/);
  });

  it("passes injected _raisePrAndVerifyCi and surfaces its result", async () => {
    const args = baseArgs();
    let called = false;
    const result = await main({
      ...args,
      _raisePrAndVerifyCi: async ({ feature }) => {
        called = true;
        expect(feature).toBe("test-feat");
        return { prUrl: "https://x/pull/1", ciStatus: "no-checks" };
      },
    });
    expect(called).toBe(true);
    expect(result.outcome).toBe("success");
    expect(result.ciStatus).toBe("no-checks");
  });

  // PROP-SHIP-14 / AT-SHIP-01: PHASE_PUB_ENABLED=false skip path. The phase
  // is recorded as ⏭, no ship-pr work runs, and prUrl/ciStatus are absent.
  it("skips Phase PUB when disabled, without invoking raisePrAndVerifyCi", async () => {
    const args = baseArgs();
    let called = false;
    const result = await main({
      ...args,
      _phasePubEnabled: false,
      _raisePrAndVerifyCi: async () => {
        called = true;
        throw new Error("raisePrAndVerifyCi must not be called when disabled");
      },
    });
    expect(called).toBe(false);
    expect(result.outcome).toBe("success");
    expect(result.prUrl).toBeUndefined();
    expect(result.ciStatus).toBeUndefined();
    const pub = result.phases.find((p) => p.phase === "PUB");
    expect(pub).toBeTruthy();
    expect(pub.status).toBe("⏭");
  });
});

// ─── Static guarantees ──────────────────────────────────────────────────────
describe("Phase PUB static guarantees", () => {
  const scriptPath = resolve(__dirname, "../orchestrate-dev.js");

  it("declares the PHASE_PUB_ENABLED compile-time boolean flag", () => {
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toMatch(/const PHASE_PUB_ENABLED = (true|false)/);
  });

  it("declares the 10-minute no-checks timeout", () => {
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toContain("CI_NO_CHECKS_TIMEOUT_MS = 10 * 60 * 1000");
  });

  // PROP-SHIP-15 / PM-L-02: the no-merge constraint is a testable anchor —
  // createPrPrompt() must instruct the agent not to merge the PR.
  it("createPrPrompt instructs the ship-pr agent not to merge the PR", () => {
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toMatch(/Do NOT merge the PR/i);
  });

  it("ship-pr SKILL.md exists and documents the PR_URL and REBASE_STATUS trailers", () => {
    const skillPath = resolve(__dirname, "../../skills/ship-pr/SKILL.md");
    const content = readFileSync(skillPath, "utf8");
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain("PR_URL:");
    expect(content).toContain("REBASE_STATUS:");
    expect(content).toContain("name: ship-pr");
    // CI reporting is no longer this skill's job — the workflow reads gh directly.
    expect(content).not.toContain("CI_STATUS");
  });

  it("createPrPrompt does NOT rebase — rebase moved to Phase DOD", () => {
    const content = readFileSync(scriptPath, "utf8");
    const start = content.indexOf("function createPrPrompt");
    const nextFn = content.indexOf("\nfunction ", start + 1);
    const promptFn = content.slice(start, nextFn > start ? nextFn : start + 2000);
    expect(promptFn).not.toContain("REBASE_STATUS");
    expect(promptFn).not.toContain("force-with-lease");
    expect(promptFn).toMatch(/do NOT rebase again/i);
  });

  it("rebasePrompt instructs the ship-pr agent to rebase and emit REBASE_STATUS", () => {
    const content = readFileSync(scriptPath, "utf8");
    const start = content.indexOf("function rebasePrompt");
    const nextFn = content.indexOf("\nfunction ", start + 1);
    const promptFn = content.slice(start, nextFn > start ? nextFn : start + 2000);
    expect(promptFn).toContain("rebase");
    expect(promptFn).toContain("REBASE_STATUS");
    expect(promptFn).toContain("force-with-lease");
  });

  it("raisePrAndVerifyCi checks rebase status and halts on conflict", () => {
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toContain("parseRebaseStatus");
    expect(content).toContain("rebase conflict");
  });

  it("never passes a ship-pr agent result variable to log()/emit()", () => {
    const content = readFileSync(scriptPath, "utf8");
    const resultVarPattern =
      /(?:const|let)\s+(\w+)\s*=\s*await\s+(?:agent|agentFn|_agent)\s*\(/g;
    const resultVars = new Set();
    let m;
    while ((m = resultVarPattern.exec(content)) !== null) {
      resultVars.add(m[1]);
    }
    for (const varName of resultVars) {
      const directPass = new RegExp(`(?:log|emit)\\s*\\(\\s*${varName}\\s*[,)]`);
      expect(content).not.toMatch(directPass);
    }
  });
});
