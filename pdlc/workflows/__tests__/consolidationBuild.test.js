/**
 * consolidationBuild.test.js — PLAN T03 (batch 2, deps T00).
 *
 * RED, on purpose. Seven `describe.skip` blocks, one green owner each (PLAN
 * §2's rule: the file has one owning task per wave, so an un-skip is always
 * committed by the task that earns it):
 *
 *   T10 — gitignore text            (TSPEC §3.3)
 *   T12 — adapter prompt            (TSPEC §5.6(a), §11.3(e))
 *   T12 — rtConsInjections          (TSPEC §5.1, §11.3(e))
 *   T32 — bundle                    (TSPEC §8.2, §8.3, T-02, §12.2)
 *   T07 — skill prompt              (TSPEC §12.2, §12.3 — consolidate-learnings/SKILL.md)
 *   T08 — skill prompt              (TSPEC §12.2, §12.3 — harvest-learnings/SKILL.md)
 *   T33 — CLAUDE.md ↔ manifest      (TSPEC §12.2 — set-equality, §9.1 erratum 3)
 *
 * Every block reads SOURCE TEXT, never the runtime state of a module this
 * feature has not built yet — `runtime-adapter.js` and the consolidation
 * bundle export nothing an `import` could resolve (see
 * `consolidationPreflight.test.js`'s header), and the `.gitignore` /
 * `CLAUDE.md` / SKILL.md prose has no other falsifier at all. Each block
 * stays `describe.skip`-ed until the task named in its comment lands; that
 * task's own edit is what turns the block green, and un-skipping it is
 * carried in THAT task's commit, not this one's (PLAN §5, "T03 authors,
 * later tasks un-skip").
 *
 * T07 and T08 are two blocks, not one, even though both discharge TSPEC
 * §12.2's two-SKILL.md four-verbatim-conjunct case: a single block would
 * have two green owners, and a `describe.skip(` token is either removed or
 * it is not — there is no way to un-skip half a block (PLAN T03 row).
 */

import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "..", "..");
const DIST = resolve(WORKFLOWS, "dist");
const MANIFEST_PATH = resolve(DIST, "distribution-manifest.json");

const readRepo = (relPath) => readFileSync(resolve(REPO_ROOT, relPath), "utf8");
const readWorkflowSource = (file) => readFileSync(resolve(WORKFLOWS, file), "utf8");
const readDist = (file) => readFileSync(resolve(DIST, file), "utf8");

// ---------------------------------------------------------------------------
// T10 — gitignore text (TSPEC §3.3)
//
// The comment line and the ignore pattern, verbatim and adjacent, in the
// shape runtimeBundle.test.js already uses for source-text reads (its own
// `SOURCES` scan, `:1573-1580`). No fixture is claimed — TSPEC §3.3 states
// the gitignore(5) ground is the whole argument.
// ---------------------------------------------------------------------------

describe("T10 — gitignore text (TSPEC §3.3)", () => {
  const COMMENT = "# pdlc consolidation in-progress marker — working tree only (AC-1.3)";
  const PATTERN = "docs/_decisions/.consolidation-lock";

  it("the marker comment and the ignore pattern are verbatim and adjacent in .gitignore", () => {
    const gitignore = readRepo(".gitignore");
    expect(gitignore).toContain(`${COMMENT}\n${PATTERN}`);
  });
});

// ---------------------------------------------------------------------------
// T12 — adapter prompt (TSPEC §5.6(a), §11.3(e))
//
// Scoped to rtWriteFile's prompt only, per §11.3(e)'s two conjuncts. No
// assertion over rtReadFile: it carries no path-resolution clause today and
// gains none.
// ---------------------------------------------------------------------------

// The widened clause TSPEC §5.6(a) obliges. It CONTAINS the bare
// "relative to the repository root" string on purpose — the widening adds
// an alternative, it does not remove the existing one — so the second test
// below (the exactly-once count) still passes once this lands.
const WIDENED_ABSOLUTE_PATH_CLAUSE = "relative to the repository root or as an absolute path,";

function extractFunctionBody(source, fnName) {
  const re = new RegExp(`(?:async )?function ${fnName}\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\}\\n`);
  const m = source.match(re);
  return m ? m[0] : null;
}

describe.skip("T12 — adapter prompt (TSPEC §5.6(a), §11.3(e))", () => {
  it("rtWriteFile's prompt carries the widened absolute-path clause verbatim", () => {
    const adapterSrc = readWorkflowSource("runtime-adapter.js");
    const fnBody = extractFunctionBody(adapterSrc, "rtWriteFile");
    expect(fnBody).toBeTruthy();
    expect(fnBody).toContain(WIDENED_ABSOLUTE_PATH_CLAUSE);
  });

  it('"relative to the repository root" occurs exactly once in runtime-adapter.js', () => {
    const adapterSrc = readWorkflowSource("runtime-adapter.js");
    const matches = adapterSrc.match(/relative to the repository root/g) || [];
    expect(matches).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// T12 — rtConsInjections (TSPEC §5.1, §11.3(e))
//
// Set-equal to §5.1's protocol minus `_now` (`_now` is not a seam — a
// module-level default, per §5.1's own closing line). Equality, never
// containment: containment is the assertion that still passes with
// `_checkFile` missing, which is the failure adapterProbe.test.js:253-258
// shapes but does not reach.
// ---------------------------------------------------------------------------

// TSPEC §5.1's interface, minus `_now` (not a seam).
const CONS_SEAM_NAMES = [
  "_agent",
  "_readFile",
  "_writeFile",
  "_appendFile",
  "_checkFile",
  "_listFiles",
  "_git",
  "_ghRun",
  "_log",
  "_phase",
  "_envPresent",
  "_makeTempDir",
];

function extractInjectionKeys(source, fnName) {
  const body = extractFunctionBody(source, fnName);
  if (!body) return null;
  const keys = [...body.matchAll(/[\s,{](_\w+)\s*:/g)].map((m) => m[1]);
  return new Set(keys);
}

describe.skip("T12 — rtConsInjections (TSPEC §5.1, §11.3(e))", () => {
  it("rtConsInjections() is declared beside rtDevInjections", () => {
    const adapterSrc = readWorkflowSource("runtime-adapter.js");
    expect(adapterSrc).toMatch(/\bfunction rtConsInjections\s*\(/);
  });

  it("rtConsInjections()'s key set is set-equal to §5.1's protocol minus _now", () => {
    const adapterSrc = readWorkflowSource("runtime-adapter.js");
    const keys = extractInjectionKeys(adapterSrc, "rtConsInjections");
    expect(keys).toBeTruthy();
    // Set-equality, both directions — never containment (§11.3(e)'s
    // reasoning for the adjacent adapter-prompt case applies identically
    // here: a missing `_checkFile` must red, not pass under containment).
    expect([...keys].sort()).toEqual([...CONS_SEAM_NAMES].sort());
  });
});

// ---------------------------------------------------------------------------
// T32 — bundle (T-02, TSPEC §8.2, §8.3, §11.3(c))
// ---------------------------------------------------------------------------

describe.skip("T32 — the consolidation bundle (T-02, TSPEC §8.2, §8.3)", () => {
  it("build-runtime.mjs --check is clean", () => {
    expect(() =>
      execFileSync("node", [resolve(WORKFLOWS, "build-runtime.mjs"), "--check"], {
        cwd: REPO_ROOT,
        stdio: "pipe",
      })
    ).not.toThrow();
  });

  it("distribution-manifest.json carries a stamped row for the consolidation bundle", () => {
    const manifest = JSON.parse(readDist("distribution-manifest.json"));
    const row = manifest.rows.find((r) => r.id === "consolidate-learnings");
    expect(row).toBeDefined();
    expect(row.pluginPath).toBe("workflows/dist/consolidate-learnings.bundle.js");
    expect(row.pluginSha1).toMatch(/^[0-9a-f]{40}$/);
  });

  it("the emitted bundle carries no dynamic import", () => {
    const bundle = readDist("consolidate-learnings.bundle.js");
    expect(bundle.match(/\bimport\s*\(/g) || []).toEqual([]);
  });

  it("the emitted bundle declares meta as its first, literal statement", () => {
    const bundle = readDist("consolidate-learnings.bundle.js");
    const firstCode = bundle
      .split("\n")
      .find((line) => line.trim() && !line.trim().startsWith("//"));
    expect(firstCode).toMatch(/^export const meta = \{/);
  });
});

// ---------------------------------------------------------------------------
// T07 — skill prompt (TSPEC §12.2, §12.3 — pdlc/skills/consolidate-learnings/SKILL.md)
//
// TSPEC §12.2's two-SKILL.md four-verbatim-conjunct source-text case, this
// file's half: the block/legacy predicate sentence (FSPEC §3.2) replacing
// the shipped `Date Completed` boundary at `:35`, and the `{topic} =
// failure-mode-id` route at `:41` (FSPEC §5.2). Own block, own green owner
// (T07) — not half of a shared block with T08 (PLAN T03 row).
// ---------------------------------------------------------------------------

const CONSOLIDATE_LEARNINGS_SKILL_PATH = "pdlc/skills/consolidate-learnings/SKILL.md";

// The two lines T07 writes, pinned here as the contract T07's edit must
// satisfy verbatim (TSPEC §12.2's "four-verbatim-conjunct" case, two of the
// four conjuncts).
const T07_BOUNDARY_LINE =
  "1. **Find the boundary.** Read `docs/_decisions/.consolidation-log.md` (create it if absent). " +
  "A LEARNINGS file is in scope when its basename is un-consolidated per the block/legacy predicate " +
  "(`docs/_constraints/pdlc-consolidation-vocabularies.md` §3).";
const T07_ROUTE_LINE =
  "   - Architectural decision now project-level → `docs/_decisions/DECISIONS-{topic}.md` " +
  "(read by `se-author`; {topic} = failure-mode-id for a consolidation-promoted pattern).";

describe.skip("T07 — skill prompt (TSPEC §12.2, §12.3, FSPEC §3.2, §5.2)", () => {
  it("the block/legacy predicate sentence replaces the Date Completed boundary, verbatim", () => {
    const skill = readRepo(CONSOLIDATE_LEARNINGS_SKILL_PATH);
    expect(skill).toContain(T07_BOUNDARY_LINE);
    expect(skill).not.toMatch(/Date Completed after the last logged pass/);
  });

  it("the DECISIONS-{topic}.md route names {topic} = failure-mode-id, verbatim", () => {
    const skill = readRepo(CONSOLIDATE_LEARNINGS_SKILL_PATH);
    expect(skill).toContain(T07_ROUTE_LINE);
  });
});

// ---------------------------------------------------------------------------
// T08 — skill prompt (TSPEC §12.2, §12.3 — pdlc/skills/harvest-learnings/SKILL.md)
//
// The other half of §12.2's four-verbatim-conjunct case: a `Phases
// exercised` row placed after `Harvested from` in the metadata table
// (`:70-78`), and a `failure-mode-id` line in the §5 Open Items convention,
// a verbatim copy from the handed open-promotion list (FSPEC §8.3, §8.4).
// Own block, own green owner (T08).
// ---------------------------------------------------------------------------

const HARVEST_LEARNINGS_SKILL_PATH = "pdlc/skills/harvest-learnings/SKILL.md";

const T08_PHASES_EXERCISED_ROW =
  "| Phases exercised | {list of phases this feature's pipeline ran, e.g. R, F, T, P, D, PR} |";
const T08_FAILURE_MODE_ID_LINE = "failure-mode-id: {id}";

describe.skip("T08 — skill prompt (TSPEC §12.2, §12.3, FSPEC §8.3, §8.4)", () => {
  it("the Phases exercised row follows Harvested from in the metadata table, verbatim", () => {
    const skill = readRepo(HARVEST_LEARNINGS_SKILL_PATH);
    const harvestedFromIndex = skill.indexOf("| Harvested from |");
    expect(harvestedFromIndex).toBeGreaterThan(-1);
    const phasesIndex = skill.indexOf(T08_PHASES_EXERCISED_ROW);
    expect(phasesIndex).toBeGreaterThan(harvestedFromIndex);
    // Additive only — LEARNINGS_SECTIONS and the Harvested from completeness
    // row are untouched, so isComplete's LEARNINGS criterion is unaffected.
    expect(skill).toContain("| Harvested from |");
  });

  it("the failure-mode-id convention is a verbatim copy instruction, in §5's Open Items section", () => {
    const skill = readRepo(HARVEST_LEARNINGS_SKILL_PATH);
    const openItemsIndex = skill.indexOf("## 5. Open Items for Consolidation");
    expect(openItemsIndex).toBeGreaterThan(-1);
    const lineIndex = skill.indexOf(T08_FAILURE_MODE_ID_LINE, openItemsIndex);
    expect(lineIndex).toBeGreaterThan(openItemsIndex);
  });
});

// ---------------------------------------------------------------------------
// T33 — CLAUDE.md ↔ manifest (TSPEC §12.2 — set-equality, §9.1 erratum 3)
//
// The artifact paths CLAUDE.md enumerates, minus the manifest itself,
// set-equal in both directions to the manifest's rows[] pluginPaths (read
// repo-relative), plus the BUNDLES axis. Never containment — a surplus
// listed path is as much a drift signal as a missing one.
// ---------------------------------------------------------------------------

const RUNTIME_BUNDLE_TEST_PATH = "pdlc/workflows/__tests__/runtimeBundle.test.js";

function extractClaudeMdArtifactPaths(claudeMd) {
  // The bullet lines under "Workflow scripts and the runtime build" name
  // tracked pdlc/workflows/dist/ paths as `pdlc/workflows/dist/...` inline
  // code spans, one per line.
  const matches = claudeMd.matchAll(/`(pdlc\/workflows\/dist\/[^`]+)`/g);
  return new Set([...matches].map((m) => m[1]));
}

function extractBundlesConstant(runtimeBundleTestSrc) {
  const m = runtimeBundleTestSrc.match(/const BUNDLES\s*=\s*\[([^\]]*)\]/);
  expect(m).toBeTruthy();
  return new Set(
    [...m[1].matchAll(/"([^"]+)"/g)].map((mm) => mm[1])
  );
}

describe.skip("T33 — CLAUDE.md ↔ manifest (TSPEC §12.2, §9.1 erratum 3)", () => {
  it("CLAUDE.md's enumerated artifact paths, minus the manifest, are set-equal to the manifest's rows", () => {
    const claudeMd = readRepo("CLAUDE.md");
    const manifest = JSON.parse(readDist("distribution-manifest.json"));

    const claudePaths = extractClaudeMdArtifactPaths(claudeMd);
    claudePaths.delete("pdlc/workflows/dist/distribution-manifest.json");

    const manifestPaths = new Set(manifest.rows.map((r) => `pdlc/${r.pluginPath}`));

    expect([...claudePaths].sort()).toEqual([...manifestPaths].sort());
  });

  it("the manifest's bundle rows are set-equal to runtimeBundle.test.js's BUNDLES constant", () => {
    const manifest = JSON.parse(readDist("distribution-manifest.json"));
    const runtimeBundleTestSrc = readRepo(RUNTIME_BUNDLE_TEST_PATH);
    const bundles = extractBundlesConstant(runtimeBundleTestSrc);

    const manifestBundleFiles = new Set(
      manifest.rows
        .map((r) => r.pluginPath.split("/").pop())
        .filter((name) => name.endsWith(".bundle.js"))
    );

    expect([...manifestBundleFiles].sort()).toEqual([...bundles].sort());
  });
});
