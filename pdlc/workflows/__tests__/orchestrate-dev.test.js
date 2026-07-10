/**
 * Tests for pipeline entry validation and meta object.
 * PROP-ENTRY-01 through PROP-ENTRY-06, PROP-COMPAT-10
 */

import main, { meta, PHASE_DISPATCH } from "../orchestrate-dev.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// ─── Meta object (TSPEC-SCRIPT-03) ────────────────────────────────────────────
describe("meta object — TSPEC-SCRIPT-03", () => {
  it("exports meta with correct name", () => {
    expect(meta.name).toBe("orchestrate-dev");
  });

  it("exports meta with description", () => {
    expect(meta.description).toBeTruthy();
  });

  it("exports meta with inputs array having reqPath", () => {
    expect(Array.isArray(meta.inputs)).toBe(true);
    const reqPathInput = meta.inputs.find((i) => i.name === "reqPath");
    expect(reqPathInput).toBeTruthy();
    expect(reqPathInput.required).toBe(true);
    expect(reqPathInput.type).toBe("string");
  });
});

// ─── PHASE_DISPATCH constant (TSPEC-DISPATCH-01) ──────────────────────────────
describe("PHASE_DISPATCH — TSPEC-DISPATCH-01", () => {
  it("has all 7 required phase entries: R, F, T, D, P, PR, CR", () => {
    expect(PHASE_DISPATCH.R).toBeTruthy();
    expect(PHASE_DISPATCH.F).toBeTruthy();
    expect(PHASE_DISPATCH.T).toBeTruthy();
    expect(PHASE_DISPATCH.D).toBeTruthy();
    expect(PHASE_DISPATCH.P).toBeTruthy();
    expect(PHASE_DISPATCH.PR).toBeTruthy();
    expect(PHASE_DISPATCH.CR).toBeTruthy();
  });

  it("Phase R has null creator (REQ is the input)", () => {
    expect(PHASE_DISPATCH.R.creator).toBeNull();
    expect(PHASE_DISPATCH.R.reviewers).toEqual(["se-review", "te-review"]);
    expect(PHASE_DISPATCH.R.optimizer).toBe("pm-author");
  });

  it("Phase F has pm-author creator and correct reviewer assignment", () => {
    expect(PHASE_DISPATCH.F.creator).toBe("pm-author");
    expect(PHASE_DISPATCH.F.reviewers).toEqual(["se-review", "te-review"]);
  });

  it("Phase T has se-author creator with pm-review and te-review reviewers", () => {
    expect(PHASE_DISPATCH.T.creator).toBe("se-author");
    expect(PHASE_DISPATCH.T.reviewers).toEqual(["pm-review", "te-review"]);
    expect(PHASE_DISPATCH.T.optimizer).toBe("se-author");
  });

  it("Phase P has DECISIONS? conditional input", () => {
    expect(PHASE_DISPATCH.P.creatorInputs).toContain("DECISIONS?");
  });

  it("Phase PR has te-author creator with pm-review and se-review reviewers", () => {
    expect(PHASE_DISPATCH.PR.creator).toBe("te-author");
    expect(PHASE_DISPATCH.PR.reviewers).toEqual(["pm-review", "se-review"]);
  });

  it("Phase CR has null creator (reviews implementation, no doc to create)", () => {
    expect(PHASE_DISPATCH.CR.creator).toBeNull();
    expect(PHASE_DISPATCH.CR.reviewers).toEqual(["pm-review", "te-review"]);
  });

  it("all phases with creators have template-style creatorOutputPath", () => {
    for (const [key, phase] of Object.entries(PHASE_DISPATCH)) {
      if (phase.creator) {
        expect(phase.creatorOutputPath).toContain("{feature}");
      }
    }
  });
});

// ─── PROP-ENTRY-03: absent/empty reqPath ──────────────────────────────────────
describe("PROP-ENTRY-03: absent or empty reqPath", () => {
  it("returns halted report with correct error when reqPath is undefined", async () => {
    const result = await main({ reqPath: undefined });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toBe(
      "Error: no REQ path provided. Usage: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md"
    );
  });

  it("returns halted report with correct error when reqPath is empty string", async () => {
    const result = await main({ reqPath: "" });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("no REQ path provided");
  });
});

// ─── PROP-ENTRY-01: Pattern mismatch ──────────────────────────────────────────
describe("PROP-ENTRY-01: REQ path pattern mismatch", () => {
  it("halts with pattern mismatch error when directory and filename don't match", async () => {
    const result = await main({ reqPath: "docs/my-feature/REQ.md" });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain(
      "does not match expected pattern docs/{feature}/REQ-{feature}.md"
    );
    expect(result.haltReason).toContain("docs/my-feature/REQ.md");
  });

  it("halts when directory name and filename segment mismatch", async () => {
    const result = await main({ reqPath: "docs/feature-a/REQ-feature-b.md" });
    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("does not match expected pattern");
  });
});

// ─── PROP-ENTRY-05: Feature name extraction ───────────────────────────────────
describe("PROP-ENTRY-05: Feature name extracted from path", () => {
  it("accepts valid path docs/postgres-storage/REQ-postgres-storage.md", async () => {
    const guardOk = (() => ({ ok: true }));
    // We just want to check the path passes validation — halt it via no further agents
    const mockAgent = async (skill, prompt) => {
      if (skill === "guard") return guardOk("guard", prompt);
      return null;
    };
    const result = await main({
      reqPath: "docs/postgres-storage/REQ-postgres-storage.md",
      _checkFile: guardOk,
      _agent: mockAgent,
      _parallel: async (p) => Promise.all(p),
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
    });
    // Should pass entry validation (feature extracted)
    expect(result.feature).toBe("postgres-storage");
  });
});

// ─── PROP-ENTRY-02: File not found ────────────────────────────────────────────
describe("PROP-ENTRY-02: Guard agent reports file_not_found", () => {
  it("returns halted report with file not found error", async () => {
    const missingGuard = (() => ({ ok: false, reason: "file_not_found" }));

    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _checkFile: missingGuard,
      _agent: async () => "",
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
    });

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toBe(
      "Error: REQ file not found at docs/test-feat/REQ-test-feat.md"
    );
  });
});

// ─── PROP-ENTRY-04: File empty ────────────────────────────────────────────────
describe("PROP-ENTRY-04: Guard agent reports file_empty", () => {
  it("returns halted report with file empty error", async () => {
    const emptyGuard = (() => ({ ok: false, reason: "file_empty" }));

    const result = await main({
      reqPath: "docs/test-feat/REQ-test-feat.md",
      _checkFile: emptyGuard,
      _agent: async () => "",
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
    });

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toBe(
      "Error: REQ file at docs/test-feat/REQ-test-feat.md is empty"
    );
  });
});

// ─── PROP-ENTRY-06: deterministic fs check, not a guard agent ────────────────
describe("PROP-ENTRY-06: REQ existence uses a deterministic fs check, not a guard agent", () => {
  it("orchestrate-dev.js checks the REQ via checkFileNonEmpty, not a check-exists agent", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");
    // The guard agent's check-exists: call path is gone.
    expect(content).not.toContain("check-exists:");
    // Replaced by the deterministic filesystem helper.
    expect(content).toContain("checkFileNonEmpty");
    // No CommonJS require() — ESM only (dynamic import() is allowed).
    expect(content).not.toMatch(/\brequire\s*\(/);
  });
});

// ─── PROP-COMPAT-10: ESM only, no require() ───────────────────────────────────
describe("PROP-COMPAT-10: ESM module format — no require()", () => {
  it("orchestrate-dev.js uses ESM imports only and has no require() calls", () => {
    const scriptPath = resolve(__dirname, "../orchestrate-dev.js");
    const content = readFileSync(scriptPath, "utf8");
    // No CommonJS require (excluding the comment in the ESM-note)
    expect(content).not.toMatch(/\brequire\s*\(/);
    expect(content).not.toContain("module.exports");
  });
});
