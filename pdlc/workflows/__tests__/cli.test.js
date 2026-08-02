/**
 * cli.test.js — the document-state query CLI's wire contract.
 *
 * The CLI owns no predicates: every answer comes from orchestrate-dev.js, and
 * those predicates have their own suites. What is asserted here is the part only
 * this file can get wrong — the two-line protocol, the Map→object projection,
 * `ok: false` passthrough, and the exit-status split between "answered no" and
 * "could not answer".
 *
 * The CLI is spawned as a child process, from a temp cwd, because the commands
 * resolve their paths against `process.cwd()` and jest's cwd is not the repo root.
 */

import { execFile } from "child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

import { sha256Hex } from "../orchestrate-dev.js";

const execFileAsync = promisify(execFile);

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(HERE, "..", "cli.mjs");

let root;

/** Runs the CLI in the fixture root and returns the raw streams plus the status. */
async function run(...args) {
  try {
    const { stdout, stderr } = await execFileAsync("node", [CLI, ...args], { cwd: root });
    return { status: 0, stdout, stderr };
  } catch (err) {
    return { status: err.code, stdout: err.stdout ?? "", stderr: err.stderr ?? "" };
  }
}

/**
 * Parses the two-line protocol and asserts the digest line, so no case below has
 * to restate it: the digest is checked on EVERY successful invocation.
 */
async function query(...args) {
  const result = await run(...args);
  expect(result.status).toBe(0);
  const lines = result.stdout.split("\n");
  expect(lines).toHaveLength(3);
  expect(lines[2]).toBe("");
  expect(lines[0]).not.toContain("\n");
  expect(lines[1]).toBe(`DIGEST: sha256:${sha256Hex(lines[0])}`);
  return JSON.parse(lines[0]);
}

const REVIEW = (verdict, anchor) =>
  [
    "# Cross-review",
    "",
    "## Findings",
    "",
    "None.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    // The counts line the verdict grammar expects immediately after the verdict.
    '{"high":0,"medium":0,"low":0}',
    "",
    ...(anchor ? [`APPROVAL-HASH: ${anchor}`, ""] : []),
  ].join("\n");

beforeAll(() => {
  root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "pdlc-cli-")));

  mkdirSync(join(root, "docs", "widget"), { recursive: true });
  writeFileSync(
    join(root, "docs", "widget", "REQ-widget.md"),
    ["# REQ", "", "## 1. Problem / Context", "", "A problem.", ""].join("\n")
  );
  writeFileSync(join(root, "docs", "widget", "EMPTY-widget.md"), "   \n\n");
  writeFileSync(
    join(root, "docs", "widget", "CROSS-REVIEW-software-engineer-REQ.md"),
    REVIEW("Approved", `sha256:${"a".repeat(64)}`)
  );
  writeFileSync(
    join(root, "docs", "widget", "CROSS-REVIEW-product-manager-REQ.md"),
    REVIEW("Needs revision")
  );
  // A verdict value outside the catalogue — the module logs a diagnostic for this
  // one, which is what the stdout-isolation case below depends on.
  writeFileSync(
    join(root, "docs", "widget", "CROSS-REVIEW-software-engineer-FSPEC-v2.md"),
    REVIEW("Rubbish")
  );

  // A POSTMORTEM per marker state — the query is a query, so all three are answers.
  writeFileSync(
    join(root, "docs", "widget", "POSTMORTEM-F-widget.md"),
    ["# Postmortem", "", "RESOLVED: no", "", "## Recommendation", "", "Re-scope the FSPEC.", ""].join("\n")
  );
  writeFileSync(
    join(root, "docs", "widget", "POSTMORTEM-T-widget.md"),
    ["# Postmortem", "", "RESOLVED: yes", ""].join("\n")
  );

  // `docs/notadir` is a FILE, so `defaultListFiles` reports `not_a_directory` and
  // `refreshReviewState` answers `ok: false` — the passthrough case.
  writeFileSync(join(root, "docs", "notadir"), "not a directory\n");
});

afterAll(() => {
  if (root) rmSync(root, { recursive: true, force: true });
});

describe("doc-probe", () => {
  it("reports an absent document as exists:false with a null hash and no sections", async () => {
    const out = await query("doc-probe", "docs/widget/NOPE-widget.md", "REQ");
    expect(out).toMatchObject({
      ok: true,
      exists: false,
      empty: true,
      hash: null,
      artifactClass: "spec",
      complete: false,
      T: 0,
      S: 0,
      anchors: [],
    });
    expect(out.firstUnwritten).toMatch(/skeleton/);
    expect(out.missing.length).toBeGreaterThan(0);
  });

  it("distinguishes a present-but-blank document from an absent one", async () => {
    const out = await query("doc-probe", "docs/widget/EMPTY-widget.md", "REQ");
    expect(out.exists).toBe(true);
    expect(out.empty).toBe(true);
    // A blank file still has a digest — that is what makes staleness detectable.
    expect(out.hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("scores a present spec document and names its first unwritten section", async () => {
    const out = await query("doc-probe", "docs/widget/REQ-widget.md", "REQ");
    expect(out.exists).toBe(true);
    expect(out.empty).toBe(false);
    expect(out.artifactClass).toBe("spec");
    expect(out.T).toBe(1);
    expect(out.S).toBe(1);
    expect(out.complete).toBe(false);
    expect(typeof out.firstUnwritten).toBe("string");
    expect(out.firstUnwritten.length).toBeGreaterThan(0);
  });

  it("classifies a cross-review by filename and returns its approval anchors", async () => {
    const out = await query(
      "doc-probe",
      "docs/widget/CROSS-REVIEW-software-engineer-REQ.md",
      "REQ"
    );
    expect(out.artifactClass).toBe("cross-review");
    expect(out.anchors).toEqual([`sha256:${"a".repeat(64)}`]);
  });

  it("accepts an omitted docType (the class alone decides for non-spec artifacts)", async () => {
    const out = await query("doc-probe", "docs/widget/CROSS-REVIEW-product-manager-REQ.md");
    expect(out.ok).toBe(true);
    expect(out.artifactClass).toBe("cross-review");
  });

  it("resolves a relative path against the caller's cwd", async () => {
    const relative = await query("doc-probe", "docs/widget/REQ-widget.md", "REQ");
    const absolute = await query("doc-probe", join(root, "docs/widget/REQ-widget.md"), "REQ");
    expect(absolute).toEqual(relative);
  });
});

describe("review-state", () => {
  it("projects both Maps to plain objects and derives the round window", async () => {
    const out = await query("review-state", "widget", "REQ");
    expect(out.ok).toBe(true);
    // Two round-1 files (the un-suffixed form IS round 1), so the window opens at 2.
    expect(out.startIndex).toBe(2);
    expect(out.present).toEqual({
      "software-engineer": [1],
      "product-manager": [1],
    });
    expect(Array.isArray(out.present)).toBe(false);
    // Candidate round is startIndex - 1 = 1, so both round-1 files were read.
    expect(Object.keys(out.reviewFiles).sort()).toEqual([
      "product-manager:1",
      "software-engineer:1",
    ]);
    expect(out.reviewFiles["software-engineer:1"]).toMatchObject({
      verdict: "Approved",
      verdictReadable: true,
      anchorHash: `sha256:${"a".repeat(64)}`,
    });
    expect(out.reviewFiles["product-manager:1"].anchorHash).toBeNull();
    // Only this doc type's files are matched; the FSPEC review is not one of them.
    expect(out.matched.map((m) => m.basename).every((b) => b.includes("-REQ"))).toBe(true);
  });

  it("reads a different doc type off the same listing", async () => {
    const out = await query("review-state", "widget", "FSPEC");
    expect(out.startIndex).toBe(3);
    expect(out.present).toEqual({ "software-engineer": [2] });
  });

  // The predicates log operator diagnostics through `console.log`. On stdout a
  // third line would corrupt the protocol, so they must land on stderr instead.
  it("keeps the module's diagnostics off stdout — stdout stays exactly two lines", async () => {
    const result = await run("review-state", "widget", "FSPEC");
    expect(result.status).toBe(0);
    expect(result.stdout.split("\n")).toHaveLength(3);
    expect(result.stdout).not.toMatch(/WARNING/);
    // Not dropped, only redirected.
    expect(result.stderr).toMatch(/WARNING: reviewer software-engineer returned no VERDICT/);
  });

  it("answers an empty window for a feature with no reviews (a missing dir is benign)", async () => {
    const out = await query("review-state", "no-such-feature", "REQ");
    expect(out).toMatchObject({ ok: true, startIndex: 1, present: {}, reviewFiles: {} });
  });

  it("passes an ok:false state through unchanged, and still exits 0", async () => {
    const out = await query("review-state", "notadir", "REQ");
    expect(out.ok).toBe(false);
    expect(out.message).toMatch(/not_a_directory/);
  });
});

describe("postmortem", () => {
  it("answers none when no POSTMORTEM exists", async () => {
    const out = await query("postmortem", "R", "widget");
    expect(out).toMatchObject({
      status: "none",
      path: "docs/widget/POSTMORTEM-R-widget.md",
    });
  });

  it("answers unresolved with the recommendation, verbatim", async () => {
    const out = await query("postmortem", "F", "widget");
    expect(out.status).toBe("unresolved");
    expect(out.recommendation).toMatch(/Re-scope the FSPEC/);
  });

  it("answers resolved for a human-set marker", async () => {
    const out = await query("postmortem", "T", "widget");
    expect(out.status).toBe("resolved");
  });
});

describe("protocol failures — the only non-zero exits", () => {
  it("an unknown command exits non-zero with one usage line on stderr and no stdout", async () => {
    const result = await run("no-such-command");
    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr.trim().split("\n")).toHaveLength(1);
    expect(result.stderr).toMatch(/^usage: pdlc-cli /);
  });

  it("no command at all exits non-zero", async () => {
    const result = await run();
    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe("");
  });

  it.each([
    ["doc-probe"],
    ["review-state", "widget"],
    ["postmortem", "R"],
  ])("a missing argument to %s exits non-zero without printing JSON", async (...args) => {
    const result = await run(...args);
    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/^usage: pdlc-cli /);
  });
});

describe("the digest line", () => {
  it("covers line 1's exact bytes — a one-character change moves it", async () => {
    const result = await run("doc-probe", "docs/widget/REQ-widget.md", "REQ");
    const [line, digest] = result.stdout.split("\n");
    expect(digest).toBe(`DIGEST: sha256:${sha256Hex(line)}`);
    expect(digest).not.toBe(`DIGEST: sha256:${sha256Hex(`${line} `)}`);
  });

  it("is stable across runs over unchanged inputs", async () => {
    const a = await run("review-state", "widget", "REQ");
    const b = await run("review-state", "widget", "REQ");
    expect(a.stdout).toBe(b.stdout);
  });
});
