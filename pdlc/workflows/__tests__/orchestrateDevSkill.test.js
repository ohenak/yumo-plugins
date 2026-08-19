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
  // PROP-SKILL-06: Under 100 lines.
  //
  // BUDGET WARNING (SE F-14, Phase CR): as of the pdlc-workflow-distribution landing this file
  // measures 99 — ONE line of headroom. The threshold is the property, not a lint knob: do not
  // raise it to make room. Anything added to orchestrate-dev/SKILL.md must be paid for by
  // removing a line. The marker lives here rather than in SKILL.md itself because a marker line
  // in SKILL.md would consume the last remaining slot and turn this test red.
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

  // PROP-SKILL-05 section 7 / PROP-SKILL-08, retargeted by PLAN T20 (pdlc-plugin-retirement,
  // class 11): the "workflow script path" obligation used to pin the plugin-source /
  // consumer-runtime-copy pair the old bundler produced (`pdlc/workflows/orchestrate-dev.js` +
  // a per-module runtime artifact under `.claude/workflows/`). DEC-02 retired that bundling path outright —
  // pipeline execution now runs through the published `@kaneho/pdlc-engine` package, invoked as
  // `pdlc dev <req-path>` — so this test now asserts AT-3.1's static-half conjuncts for
  // `orchestrate-dev/SKILL.md`, the same four conjuncts `skillFiles.test.js`'s `AT-3.1` test
  // asserts for `orchestrate-queue/SKILL.md` (TSPEC §3.3, §5.5's host split).
  it("AT-3.1: orchestrate-dev/SKILL.md is a thin delegator onto `pdlc dev <req-path>` (TSPEC §3.3)", () => {
    // (a) the invocation line is present verbatim.
    expect(content).toContain("pdlc dev <req-path>");

    // (b) the three-step resolution ladder of §3.3 is present.
    expect(content).toContain("npm install -g @kaneho/pdlc-engine");
    expect(content).toContain("npx --no-install pdlc");

    // (c) the refusal text names the install command.
    expect(content).toMatch(/refus[a-z]*[^\n]{0,200}npm install -g @kaneho\/pdlc-engine/is);

    // (d) no POSTMORTEM/RESOLVED/model-selection/DOD/reviewer-dispatch runbook mechanics remain —
    // that text moved into the engine, not into this delegator. The Artifact Conventions section
    // legitimately names `POSTMORTEM-*` as a file-naming convention, so the negative checks target
    // the lifecycle mechanics (a heading, or the human-written marker's two literal values) rather
    // than the bare word.
    expect(content).not.toMatch(/POSTMORTEM Lifecycle/i);
    expect(content).not.toMatch(/RESOLVED: yes/);
    expect(content).not.toMatch(/RESOLVED: no/);
    expect(content).not.toMatch(/[Mm]odel [Ss]election/);
    expect(content).not.toMatch(/## Definition of Done Verification/i);
    expect(content).not.toMatch(/Agent 1 — se-review:/);
  });
});
