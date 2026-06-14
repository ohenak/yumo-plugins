/**
 * Tests for the rewritten orchestrate-dev SKILL.md (TSPEC-SKILL-02, PLAN TASK-P5-01)
 * PROP-SKILL-05 through PROP-SKILL-08
 * TDD: these tests are written first; they will fail against the current runbook-style SKILL.md
 * and pass after the SKILL.md is rewritten as a pointer/contract document.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SKILL_PATH = resolve(
  __dirname,
  "../../skills/orchestrate-dev/SKILL.md"
);

let content;

beforeAll(() => {
  content = readFileSync(SKILL_PATH, "utf8");
});

describe("orchestrate-dev SKILL.md rewrite — TSPEC-SKILL-02", () => {
  // PROP-SKILL-06: Under 100 lines
  it("PROP-SKILL-06: rewritten SKILL.md is under 100 lines", () => {
    const lineCount = content.split("\n").length;
    expect(lineCount).toBeLessThan(100);
  });

  // PROP-SKILL-06: Does not contain step-by-step reviewer dispatch blocks
  it("PROP-SKILL-06: does not contain step-by-step reviewer dispatch blocks", () => {
    expect(content).not.toMatch(/Agent 1 — se-review:/);
    expect(content).not.toMatch(/Agent 1 — pm-review:/);
    expect(content).not.toMatch(/### Step \d+:/);
  });

  // PROP-SKILL-05 section 1: Invocation contract
  it("PROP-SKILL-05 §1: contains Invocation contract section", () => {
    expect(content).toMatch(
      /Invocation [Cc]ontract|invocation contract/i
    );
    // Must reference the invocation syntax
    expect(content).toContain("/pdlc:orchestrate-dev");
  });

  // PROP-SKILL-05 section 2: Preconditions
  it("PROP-SKILL-05 §2: contains Preconditions section", () => {
    expect(content).toMatch(/[Pp]reconditions?/);
  });

  // PROP-SKILL-05 section 3: What the workflow does (phase sequence summary)
  it("PROP-SKILL-05 §3: contains phase sequence summary (not step-by-step runbook)", () => {
    // Should mention the phase sequence in summary form
    expect(content).toMatch(/REQ.*FSPEC|phase sequence|Phase R|R →/);
  });

  // PROP-SKILL-05 section 4: Auto-approved batching decision
  it("PROP-SKILL-05 §4: contains auto-approved batching decision section", () => {
    expect(content).toMatch(/[Aa]uto.?approv|batching decision|automatic/i);
  });

  // PROP-SKILL-05 section 5: Two-workflow split as known alternative
  // PROP-SKILL-07: documents orchestrate-spec/orchestrate-impl split with rejection rationale
  it("PROP-SKILL-05/07: documents two-workflow split as known alternative with rejection rationale", () => {
    expect(content).toMatch(
      /orchestrate-spec|two.workflow|split.*alternative|known alternative/i
    );
    // Should explain why rejected
    expect(content).toMatch(
      /manual.*invoc|reintroduc|manual.*coord/i
    );
  });

  // PROP-SKILL-05 section 6: Artifact conventions
  it("PROP-SKILL-05 §6: references artifact conventions and docs/{feature}/ path", () => {
    expect(content).toContain("docs/{feature}");
    expect(content).toMatch(/CLAUDE\.md|artifact.*convention/i);
  });

  // PROP-SKILL-05 section 7: Workflow script path
  // PROP-SKILL-08: references both canonical plugin source and consumer runtime copy
  it("PROP-SKILL-05/08: references both plugin source and consumer runtime copy paths", () => {
    expect(content).toContain("pdlc/workflows/orchestrate-dev.js");
    expect(content).toContain(".claude/workflows/orchestrate-dev.js");
  });
});
