// advisoryPreflight.test.js — PLAN A-01 (batch 1, no deps).
//
// Three independent obligations, all homed here per PLAN §2.2/§2.4 and
// PROPERTIES §10/§11:
//
//   1. PROP-REG-06 — every `BL-PREREQ` baseline symbol (PLAN §2.2) exists at
//      HEAD. Existence only — never the shape a later task creates.
//   2. The §2.4 `implementation.testCommand` pre-flight-repair pin — a single
//      case that branches on the presence of the untracked
//      `.claude/pdlc.config.json` and asserts a positive in *both* branches,
//      so the case is green both on a machine that carries the repaired file
//      and on the fresh CI clone that has no file at all
//      (`.github/workflows/pr-tests.yml:75`).
//   3. PROP-INFRA-01 — the doubles-hygiene source-text scan over every
//      `pdlc/workflows/__tests__/advisory*.test.js` file, this file included.
//
// This task creates no production code — it is a pre-flight gate and two
// property oracles. Its only sibling file is the shared fixture module
// `fixtures/scanFixtures.js` (PROPERTIES §2.1, §13.1 item 5), which supplies
// the forbidden-shape controls PROP-INFRA-01's falsifiability proof needs —
// kept out of this file so a control string is never mistaken for the
// violation it exists to prove detectable.

import { readFileSync, readdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import * as queueModule from "../orchestrate-queue.js";
import { parseImplementationConfig, IMPLEMENTATION_DEFAULTS } from "../orchestrate-dev.js";

import {
  SEAM_OPS_LITERAL_SHAPE,
  DOUBLE_BINDING_SHAPE,
  FOREIGN_IMPORT_SHAPE,
  CLEAN_SHAPE,
} from "./fixtures/scanFixtures.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TESTS_DIR = __dirname;
const REPO_ROOT = join(__dirname, "..", "..", "..");
const DEV_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-dev.js"), "utf8");
const QUEUE_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-queue.js"), "utf8");
const HOOK_SOURCE = readFileSync(
  join(__dirname, "..", "..", "hooks", "scripts", "guard-harvest-before-delete.sh"),
  "utf8"
);

// ---------------------------------------------------------------------------
// 1. PROP-REG-06 — BL-PREREQ baseline symbols (PLAN §2.2) exist at HEAD.
// ---------------------------------------------------------------------------

describe("PROP-REG-06 — BL-PREREQ baseline symbols exist at HEAD", () => {
  // Exported symbols — resolved by import. A missing one fails this
  // assertion (or, for a named static import above, fails module load
  // entirely, which is the same fail-closed signal).
  test.each([
    ["guardVerdict", devModule],
    ["effectiveGuardPaths", devModule],
    ["parseImplementationConfig", devModule],
    ["rebaseOntoDefault", devModule],
    ["raisePrAndVerifyCi", devModule],
    ["checkPrCi", devModule],
    ["defaultAppendFile", devModule],
    ["dodVerifyLoop", devModule],
    ["parseDodStatus", devModule],
    ["parsePlanTasks", devModule],
    ["MERGE_ESCALATIONS", devModule],
    ["parseTriageVerdict", queueModule],
    ["triagePrompt", queueModule],
    ["precheckDependencies", queueModule],
    ["parseQueue", queueModule],
  ])("%s is exported and importable", (name, mod) => {
    expect(mod[name]).toBeDefined();
  });

  // Module-private symbols — resolved by source-text presence, never by
  // import (a namespace import cannot distinguish "private" from "absent";
  // both resolve to `undefined`). Existence only: a declaration keyword plus
  // the name, never the symbol's shape.
  test.each([
    ["commitPaths", DEV_SOURCE, /\bfunction\s+commitPaths\s*\(/],
    ["gitWithLockRetry", DEV_SOURCE, /\bfunction\s+gitWithLockRetry\s*\(/],
    ["buildFinalReport", DEV_SOURCE, /\bfunction\s+buildFinalReport\s*\(/],
    ["MODEL_IMPLEMENTATION", DEV_SOURCE, /\bconst\s+MODEL_IMPLEMENTATION\s*=/],
    ["buildQueueReport", QUEUE_SOURCE, /\bfunction\s+buildQueueReport\s*\(/],
    ["runPicked", QUEUE_SOURCE, /\bfunction\s+runPicked\s*\(/],
  ])("%s is present in source (module-private)", (_name, source, pattern) => {
    expect(source).toMatch(pattern);
  });

  // Guard-script tokens (hook script, read directly — never imported).
  test("guard-harvest-before-delete.sh still carries the CROSS-REVIEW token", () => {
    expect(HOOK_SOURCE).toContain("CROSS-REVIEW");
  });

  test("guard-harvest-before-delete.sh still carries the bracketed-directory shape", () => {
    // Pinned to the substring A-28 promises not to change (PLAN §5.4(3)) —
    // never to the whole refusal message, which A-28 extends.
    expect(HOOK_SOURCE).toContain("in [%s]");
  });
});

// ---------------------------------------------------------------------------
// 2. §2.4 pre-flight repair pin — both branches assert a positive.
// ---------------------------------------------------------------------------

describe("§2.4 — implementation.testCommand pre-flight repair pin", () => {
  test("branches on .claude/pdlc.config.json presence and asserts a positive either way", () => {
    const configPath = join(REPO_ROOT, ".claude", "pdlc.config.json");

    if (existsSync(configPath)) {
      // File present (local dev machine, once repaired): the ignore-pattern
      // arguments equal, as a SET, the four patterns §2.4 transcribes. A
      // later edit that drops one back to a single overriding pattern (the
      // 23-failing-suite state) fails this assertion.
      const raw = readFileSync(configPath, "utf8");
      const parsed = JSON.parse(raw);
      const testCommand = parsed?.implementation?.testCommand ?? "";

      // Accepts both the unrepaired `=value` form (yargs single-value) and
      // the repaired multi-token space-separated form, so a genuinely
      // unrepaired command is compared honestly rather than failing to parse.
      const argsMatch = testCommand.match(/--testPathIgnorePatterns(?:=(\S+)|\s+(.+))$/);
      expect(argsMatch).not.toBeNull();
      const rawArgs = argsMatch[1] !== undefined ? argsMatch[1] : argsMatch[2];
      const patterns = rawArgs
        .trim()
        .split(/\s+/)
        .map((tok) => tok.replace(/^['"]|['"]$/g, ""));

      const expected = new Set([
        "/node_modules/",
        "/__tests__/helpers/",
        "/__tests__/fixtures/",
        "documentOracles",
      ]);
      expect(new Set(patterns)).toEqual(expected);
    } else {
      // File absent (fresh clone, both CI matrix legs): the documented
      // degradation fires instead — `orchestrate-dev.js:160-164`, `:188` —
      // the legacy self-report path §8.3 note 1 names.
      const result = parseImplementationConfig(null);
      expect(result).toEqual({
        config: IMPLEMENTATION_DEFAULTS,
        sectionMalformed: false,
        invalidKeys: [],
      });
      expect(result.config.testCommand).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// 3. PROP-INFRA-01 — doubles-hygiene source-text scan.
// ---------------------------------------------------------------------------

const SEAM_OPS_MEMBERS = [
  "gatherEvidence",
  "prompt",
  "conditionHolds",
  "apply",
  "producedPaths",
  "revert",
  "verifyGate",
  "declaredScope",
  "permittedActions",
];

const DOUBLE_BINDING_PATTERN =
  /\b(agent|_agent|_readFile|_writeFile|_appendFile|_now|_sleep|rand|prng|seeded)\b\s*[:=]\s*jest\s*\.\s*fn\b/;

const CANONICAL_DOUBLE_FACTORIES = [
  "makeAgentDouble",
  "makeSeamOps",
  "makeFileDouble",
  "makeFakeClock",
  "makeAdvisoryConfig",
  "makeAdvisoryGenerators",
];

/** Every brace-delimited substring of `text`, at every nesting depth. */
function braceBlocks(text) {
  const blocks = [];
  const stack = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "{") {
      stack.push(i);
    } else if (text[i] === "}" && stack.length > 0) {
      const start = stack.pop();
      blocks.push(text.slice(start, i + 1));
    }
  }
  return blocks;
}

/** True if any object-literal-shaped block carries >= 2 SeamOps member keys. */
function hasSeamOpsLiteral(text) {
  return braceBlocks(text).some((block) => {
    let count = 0;
    for (const member of SEAM_OPS_MEMBERS) {
      if (new RegExp(`(?:^|[{,\\s])${member}\\s*:`).test(block)) count += 1;
      if (count >= 2) return true;
    }
    return false;
  });
}

/** True if a jest.fn() is bound directly to an agent/file/clock/PRNG-shaped name. */
function hasForeignDoubleBinding(text) {
  return DOUBLE_BINDING_PATTERN.test(text);
}

/** True if a canonical double factory is imported from anywhere but advisoryDoubles.js. */
function hasForeignFactoryImport(text) {
  const importRe = /import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
  let match;
  while ((match = importRe.exec(text)) !== null) {
    const names = match[1].split(",").map((n) => n.trim().split(/\s+as\s+/)[0].trim());
    const source = match[2];
    const namesCanonical = names.some((n) => CANONICAL_DOUBLE_FACTORIES.includes(n));
    if (namesCanonical && !source.endsWith("advisoryDoubles.js")) {
      return true;
    }
  }
  return false;
}

function scanViolations(text) {
  const violations = [];
  if (hasSeamOpsLiteral(text)) violations.push("locally-built SeamOps literal");
  if (hasForeignDoubleBinding(text)) violations.push("jest.fn() bound to a double-shaped name");
  if (hasForeignFactoryImport(text)) violations.push("canonical double factory imported from the wrong module");
  return violations;
}

describe("PROP-INFRA-01 — doubles-hygiene source-text scan", () => {
  test("falsifiability: each control shape is caught, the clean shape is not", () => {
    expect(scanViolations(SEAM_OPS_LITERAL_SHAPE)).toContain("locally-built SeamOps literal");
    expect(scanViolations(DOUBLE_BINDING_SHAPE)).toContain("jest.fn() bound to a double-shaped name");
    expect(scanViolations(FOREIGN_IMPORT_SHAPE)).toContain(
      "canonical double factory imported from the wrong module"
    );
    expect(scanViolations(CLEAN_SHAPE)).toEqual([]);
  });

  test("the scanned advisory*.test.js set is non-empty", () => {
    const files = readdirSync(TESTS_DIR).filter(
      (name) => name.startsWith("advisory") && name.endsWith(".test.js")
    );
    expect(files.length).toBeGreaterThan(0);
  });

  test("every advisory*.test.js file (this one included) is clean", () => {
    const files = readdirSync(TESTS_DIR).filter(
      (name) => name.startsWith("advisory") && name.endsWith(".test.js")
    );
    for (const file of files) {
      const text = readFileSync(join(TESTS_DIR, file), "utf8");
      expect({ file, violations: scanViolations(text) }).toEqual({ file, violations: [] });
    }
  });
});
