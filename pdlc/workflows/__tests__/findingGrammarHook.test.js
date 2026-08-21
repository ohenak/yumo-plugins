// findingGrammarHook.test.js — CR round 1, PM F-09.
//
// `pdlc/hooks/scripts/check-finding-grammar.sh` is a live operator-facing hook: it is registered
// in `pdlc/hooks/hooks.json` under `PostToolUse: Write|Edit` and runs on every cross-review a
// reviewer writes. Before this suite its only coverage was inventory — `consumerCleanup.test.js`
// checks the file is tracked mode 100755, `hookCompatibility.test.js` T10 checks the
// {event, script} pair is registered. Nothing executed it. The failure it exists to prevent
// (POSTMORTEM-D item 8: two rounds halted on erratum findings that were never tagged with
// line-leading `FINDING:` lines) would have been reinstated silently by any edit that broke the
// script, because a hook that says nothing is indistinguishable from a hook that has nothing to
// say.
//
// The script is spawned by bare path with the real hook stdin envelope, exactly as
// `consumerCleanup.test.js` spawns `cleanup-consumer-workflows.sh` — no interpreter prefix, so
// the shebang and the executable bit are part of what is under test. It is advisory by contract:
// every case asserts exit status 0.

import { spawnSync } from "child_process";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = join(__dirname, "..", "..", "hooks", "scripts", "check-finding-grammar.sh");

/** Runs the hook over `content` written to a `CROSS-REVIEW-*.md` file, via the real envelope. */
function runHook(content, { basename = "CROSS-REVIEW-product-manager-REQ-v2.md" } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "finding-grammar-"));
  try {
    const filePath = join(dir, basename);
    writeFileSync(filePath, content, "utf8");
    const envelope = JSON.stringify({
      hook_event_name: "PostToolUse",
      tool_name: "Write",
      tool_input: { file_path: filePath },
    });
    const result = spawnSync(SCRIPT_PATH, [], { encoding: "utf8", input: envelope });
    return { status: result.status, stdout: result.stdout || "", stderr: result.stderr || "" };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The additionalContext string the hook emits, or `null` when it said nothing. */
function nudgeOf(result) {
  const text = result.stdout.trim();
  if (text === "") return null;
  const parsed = JSON.parse(text);
  expect(parsed.hookSpecificOutput.hookEventName).toBe("PostToolUse");
  return parsed.hookSpecificOutput.additionalContext;
}

const ERRATUM_HEADING = "## Delta-Confirmation Findings\n";
const FINDINGS_TABLE = [
  "| ID | Severity | Provenance | Locality | Ref | Finding |",
  "|----|----------|------------|----------|-----|---------|",
  "| F-01 | High | delta | nonlocal | §3.1 | The threshold table still states two values. |",
  "",
].join("\n");

describe("CR round 1 (PM F-09): check-finding-grammar.sh behaviour", () => {
  test("an erratum-round cross-review with findings but NO line-leading FINDING: lines is nudged", () => {
    const result = runHook(
      `# Cross-Review\n\n${ERRATUM_HEADING}\n${FINDINGS_TABLE}\n## Verdict\nVERDICT: Needs revision\n`
    );
    expect(result.status).toBe(0);
    const nudge = nudgeOf(result);
    expect(nudge).not.toBeNull();
    expect(nudge).toContain("no line-leading FINDING: lines");
    // The nudge names the file it is about, so an agent editing several documents can act on it.
    expect(nudge).toContain("CROSS-REVIEW-product-manager-REQ-v2.md");
  });

  test("the same document WITH tagged FINDING: lines is not nudged at all", () => {
    const result = runHook(
      `# Cross-Review\n\n${ERRATUM_HEADING}\n${FINDINGS_TABLE}\n` +
        "FINDING: High | delta | nonlocal | §3.1 | The threshold table still states two values.\n" +
        "\n## Verdict\nVERDICT: Needs revision\n"
    );
    expect(result.status).toBe(0);
    expect(nudgeOf(result)).toBeNull();
  });

  test("a FINDING: line that drops a tag its table declared is nudged, naming the missing tag", () => {
    const result = runHook(
      `# Cross-Review\n\n${ERRATUM_HEADING}\n${FINDINGS_TABLE}\n` +
        "FINDING: High | delta | §3.1 | The threshold table still states two values.\n" +
        "\n## Verdict\nVERDICT: Needs revision\n"
    );
    expect(result.status).toBe(0);
    const nudge = nudgeOf(result);
    expect(nudge).not.toBeNull();
    expect(nudge).toContain("nonlocal");
    expect(nudge).toContain("never appear in any FINDING: line");
  });

  test("an ordinary (non-erratum) cross-review with no FINDING: lines is left alone", () => {
    const result = runHook(
      "# Cross-Review: product-manager — REQ\n\n## Findings\n\n" +
        "| ID | Severity | Scope | Finding |\n|----|----------|-------|---------|\n" +
        "| F-01 | High | Local | The threshold table states two values. |\n\n" +
        "## Verdict\nVERDICT: Needs revision\n"
    );
    expect(result.status).toBe(0);
    expect(nudgeOf(result)).toBeNull();
  });

  test("a file that is not a CROSS-REVIEW-*.md is left alone", () => {
    const result = runHook(`# REQ\n\n${ERRATUM_HEADING}\n${FINDINGS_TABLE}`, {
      basename: "REQ-some-feature.md",
    });
    expect(result.status).toBe(0);
    expect(nudgeOf(result)).toBeNull();
  });
});
