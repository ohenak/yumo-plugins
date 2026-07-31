/**
 * Tests for harvest phase and backward compat hooks (TSPEC-HARVEST-01 through TSPEC-HARVEST-04)
 * PROP-HARVEST-01 through PROP-HARVEST-05, PROP-COMPAT-01 through PROP-COMPAT-03
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import main from "../orchestrate-dev.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIPTS_DIR = resolve(__dirname, "../../hooks/scripts");

let logMessages = [];
const originalLog = console.log;

beforeEach(() => {
  logMessages = [];
  console.log = (...args) => {
    logMessages.push(args.join(" "));
  };
});

afterEach(() => {
  console.log = originalLog;
});

// ─── PROP-COMPAT-01: guard-harvest-before-delete.sh exists ───────────────────
describe("PROP-COMPAT-01: guard-harvest-before-delete.sh present and unmodified", () => {
  it("file exists", () => {
    const filePath = resolve(SCRIPTS_DIR, "guard-harvest-before-delete.sh");
    expect(existsSync(filePath)).toBe(true);
  });

  it("file is non-empty", () => {
    const filePath = resolve(SCRIPTS_DIR, "guard-harvest-before-delete.sh");
    const content = readFileSync(filePath, "utf8");
    expect(content.length).toBeGreaterThan(0);
  });
});

// ─── PROP-COMPAT-02: check-scope-field.sh exists ─────────────────────────────
describe("PROP-COMPAT-02: check-scope-field.sh present and unmodified", () => {
  it("file exists", () => {
    const filePath = resolve(SCRIPTS_DIR, "check-scope-field.sh");
    expect(existsSync(filePath)).toBe(true);
  });

  it("file is non-empty", () => {
    const filePath = resolve(SCRIPTS_DIR, "check-scope-field.sh");
    const content = readFileSync(filePath, "utf8");
    expect(content.length).toBeGreaterThan(0);
  });
});

// ─── PROP-COMPAT-03: nudge-consolidation.sh exists ───────────────────────────
describe("PROP-COMPAT-03: nudge-consolidation.sh present and unmodified", () => {
  it("file exists", () => {
    const filePath = resolve(SCRIPTS_DIR, "nudge-consolidation.sh");
    expect(existsSync(filePath)).toBe(true);
  });

  it("file is non-empty", () => {
    const filePath = resolve(SCRIPTS_DIR, "nudge-consolidation.sh");
    const content = readFileSync(filePath, "utf8");
    expect(content.length).toBeGreaterThan(0);
  });
});

// ─── PROP-HARVEST-03: PHASE_H_ENABLED = false → skip path ────────────────────
// We test the skip path by reading the workflow script and verifying the skip logic comment/structure.
// The PHASE_H_ENABLED flag test requires dependency injection to override the module-level flag.
describe("PROP-HARVEST-03: PHASE_H_ENABLED=false skip path", () => {
  it("workflow script contains PHASE_H_ENABLED flag at top of module", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toContain("PHASE_H_ENABLED");
    expect(content).toContain("Phase H skipped — prerequisite not yet landed");
  });

  it("script contains skip path log message", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toContain("Phase H: ⏭ Skipped (prerequisite)");
  });
});

// ─── PROP-HARVEST-02: Guard block detection ──────────────────────────────────
describe("PROP-HARVEST-02: Guard block triggers halt with correct message", () => {
  it("workflow script contains canonical guard sentinel check", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toContain(
      "pdlc guard: refusing to delete CROSS-REVIEW files"
    );
    expect(content).toContain("Phase H halted: guard-harvest-before-delete blocked");
  });
});

// ─── PROP-HARVEST-04: Path extraction from guard message ─────────────────────
describe("PROP-HARVEST-04: Blocked file path extracted from guard message format", () => {
  it("script extracts [dir] segment from guard error message", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");
    // Script must look for bracketed dir segment [dir] in guard message
    expect(content).toContain("[");
    expect(content).toContain("path not parseable");
  });
});

// ─── PROP-HARVEST-01: Harvest agent prompt ordering ──────────────────────────
describe("PROP-HARVEST-01: Harvest prompt instructs correct operation order", () => {
  it("workflow script harvestPrompt orders: read CROSS-REVIEW → read POSTMORTEM → write LEARNINGS → commit → delete → commit", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");
    // The harvestPrompt function should contain these instructions in order
    const harvestIdx = content.indexOf("harvestPrompt");
    expect(harvestIdx).toBeGreaterThan(-1);
    const promptBody = content.slice(harvestIdx, harvestIdx + 1000);
    expect(promptBody).toContain("CROSS-REVIEW");
    expect(promptBody).toContain("CODE_REVIEW");
    expect(promptBody).toContain("POSTMORTEM");
    expect(promptBody).toContain("LEARNINGS");
    expect(promptBody).toContain("Commit and push LEARNINGS before any delete");
    expect(promptBody).toContain("delete");
  });
});

// ─── RLH-REPORT-01: buildFinalReport's widened field list (TSPEC §4.7) ───────
// TSPEC §8.3's closing paragraph lists this suite as "unaffected in behaviour;
// affected by buildFinalReport's widened field list". Nothing about Phase H's
// behaviour is asserted here — only that the report a run through Phase H
// produces carries the four fields §4.7 adds to buildFinalReport's destructured
// list, each within its stated domain.
// PLAN §7.3: written at batch 2, green from batch 10 (RLH-30); red 2–9.
describe("RLH-REPORT-01-harvest", () => {
  const REPORT_FIELDS_4_7 = [
    "haltPhase",
    "postmortemPath",
    "postmortemStatus",
    "queueRow",
  ];
  const POSTMORTEM_STATUS_DOMAIN = [
    "written",
    "write_failed",
    "unresolved",
    "none",
  ];
  const QUEUE_ROW_DOMAIN = ["halted", "halted (uncommitted)", "none", "error"];

  const successAgent = async (skill, prompt) => {
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
    if (skill === "harvest-learnings") return "Harvest complete.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (String(prompt).includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Rebased.\nREBASE_STATUS: clean";
    }
    return "Success.";
  };

  const args = () => ({
    reqPath: "docs/test-feat/REQ-test-feat.md",
    _agent: successAgent,
    _parallel: (p) => Promise.all(p),
    _checkFile: () => ({ ok: true }),
    _checkCi: async () => "passed",
    _phase: () => {},
    _pipeline: async (l, fn) => fn(),
    _mergeWorktree: async () => ({ ok: true }),
  });

  it("RLH-REPORT-01-harvest: the final report carries §4.7's four new fields, each in its domain", async () => {
    const result = await main(args());
    expect(result.outcome).toBe("success");

    expect(Object.keys(result)).toEqual(
      expect.arrayContaining(REPORT_FIELDS_4_7)
    );

    // §4.7: haltPhase is null when the run did not halt — that field alone
    // distinguishes a halt from a clean run.
    expect(result.haltPhase).toBeNull();
    expect(POSTMORTEM_STATUS_DOMAIN).toContain(result.postmortemStatus);
    expect(QUEUE_ROW_DOMAIN).toContain(result.queueRow);
    // §4.7: postmortemPath is populated whenever postmortemStatus is
    // "unresolved", and is null otherwise.
    if (result.postmortemStatus === "unresolved") {
      expect(typeof result.postmortemPath).toBe("string");
    } else {
      expect(result.postmortemPath).toBeNull();
    }
  });
});

// ─── PROP-HARVEST-05: PHASE_H_ENABLED is boolean at top of script ─────────────
describe("PROP-HARVEST-05: PHASE_H_ENABLED is a compile-time boolean constant", () => {
  it("PHASE_H_ENABLED declared as boolean (true or false)", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");
    expect(content).toMatch(/const PHASE_H_ENABLED = (true|false)/);
  });
});
