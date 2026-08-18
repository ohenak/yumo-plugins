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
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { basename, dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "..", "..");
const DIST = resolve(WORKFLOWS, "dist");
const MANIFEST_PATH = resolve(DIST, "distribution-manifest.json");

const readRepo = (relPath) => readFileSync(resolve(REPO_ROOT, relPath), "utf8");
const readWorkflowSource = (file) => readFileSync(resolve(WORKFLOWS, file), "utf8");
const readDist = (file) => readFileSync(resolve(DIST, file), "utf8");

/**
 * True once T19 has reduced `build-runtime.mjs` to its single-row, `pdlc-cli.mjs`-only
 * emission (DEC-02) — i.e. the committed `pdlc/workflows/dist/` already carries nothing but
 * `pdlc-cli.mjs`. Used by TT-5's held assertions below (see the comment on that block for why
 * a task-sequencing hold here is a vacuous pass, never a `.skip`).
 */
const builderIsReduced = () => {
  const names = readdirSync(DIST);
  return names.length === 1 && names[0] === "pdlc-cli.mjs";
};

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

describe("T12 — adapter prompt (TSPEC §5.6(a), §11.3(e))", () => {
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

describe("T12 — rtConsInjections (TSPEC §5.1, §11.3(e))", () => {
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

describe("T32 — the consolidation bundle (T-02, TSPEC §8.2, §8.3)", () => {
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

  // -------------------------------------------------------------------------
  // TT-5 (TSPEC §5.2, extending this block) — the reduced builder's emission
  // contract (DEC-02, AC-1.1, FSPEC L-1).
  //
  // Held under T19 (not `.skip`, deliberately, same rationale as
  // `consolidationPreflight.test.js`'s runtime-bundle hold above): this file
  // is a member of `consumerCleanup.test.js`'s `SWEPT_SURFACE_MODULES`
  // (TSPEC §5.5), whose entire skip surface is required to route through
  // `describeOrSkip`/`itOrSkip` — a task-sequencing hold is not a
  // runner-capability skip, so a bare `.skip` here would register as an
  // orphan under the skip-join oracle. Instead both assertions below pass
  // vacuously while the pre-reduction, multi-bundle builder is still in
  // place (`pdlc/workflows/dist/` still carries bundle files and the
  // manifest alongside `pdlc-cli.mjs`), and start asserting for real the
  // moment T19 reduces `build-runtime.mjs` to its single-row,
  // `pdlc-cli.mjs`-only emission — detected here by `builderIsReduced()`
  // rather than by naming T19 directly, so the guard tracks the artifact
  // shape it actually depends on.
  //
  // Both tests mutate the real `pdlc/workflows/dist/` (the builder's sole
  // output directory, AC-6.1 — there is no output-directory override to
  // redirect it to an isolated temp path), so each backs up and restores
  // the directory's contents in a `finally`, leaving the working tree
  // exactly as it found it either way.
  // -------------------------------------------------------------------------

  it("a clean run's emitted file set set-equals {pdlc-cli.mjs}, with exactly one wrote/in-sync stdout row", () => {
    if (!builderIsReduced()) {
      return;
    }
    const backup = mkdtempSync(join(tmpdir(), "pdlc-tt5-backup-"));
    for (const name of readdirSync(DIST)) {
      cpSync(join(DIST, name), join(backup, name));
    }
    try {
      rmSync(DIST, { recursive: true, force: true });
      mkdirSync(DIST, { recursive: true });

      const stdout = execFileSync("node", [resolve(WORKFLOWS, "build-runtime.mjs")], {
        cwd: REPO_ROOT,
        stdio: "pipe",
      }).toString();

      const emitted = readdirSync(DIST);
      expect(new Set(emitted)).toEqual(new Set(["pdlc-cli.mjs"]));

      const rows = stdout
        .split("\n")
        .filter((line) => /^\s*(wrote|in-sync)\s+pdlc\/workflows\/dist\//.test(line));
      expect(rows.length).toBe(1);
    } finally {
      rmSync(DIST, { recursive: true, force: true });
      mkdirSync(DIST, { recursive: true });
      for (const name of readdirSync(backup)) {
        cpSync(join(backup, name), join(DIST, name));
      }
      rmSync(backup, { recursive: true, force: true });
    }
  });

  it("mutating the emitted artifact makes --check print STALE on stderr and exit 1", () => {
    if (!builderIsReduced()) {
      return;
    }
    const target = resolve(DIST, "pdlc-cli.mjs");
    const original = readFileSync(target, "utf8");
    try {
      writeFileSync(target, `${original}\n// TT-5 mutation\n`, "utf8");

      let caught;
      try {
        execFileSync("node", [resolve(WORKFLOWS, "build-runtime.mjs"), "--check"], {
          cwd: REPO_ROOT,
          stdio: "pipe",
        });
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeDefined();
      expect(caught.status).toBe(1);
      expect(caught.stderr.toString()).toContain("STALE    pdlc/workflows/dist/pdlc-cli.mjs");
    } finally {
      writeFileSync(target, original, "utf8");
    }
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

describe("T07 — skill prompt (TSPEC §12.2, §12.3, FSPEC §3.2, §5.2)", () => {
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

describe("T08 — skill prompt (TSPEC §12.2, §12.3, FSPEC §8.3, §8.4)", () => {
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
// CLAUDE.md's "Workflow scripts and the runtime build" section no longer
// spells out each `pdlc/workflows/dist/*.bundle.js` path individually — it
// collapses them into the collective "the bundles" and names only the two
// non-bundle artifacts verbatim: `pdlc-cli.mjs` and `distribution-manifest.json`.
// The set-equal check now runs at that grain: the bare filenames the section
// spells out must set-equal the manifest's non-bundle row basenames plus the
// manifest's own filename, and the section must still say "the bundles" —
// which is only true while the manifest actually has bundle rows. Never
// containment — a surplus name is as much a drift signal as a missing one.
// ---------------------------------------------------------------------------

const RUNTIME_BUNDLE_TEST_PATH = "pdlc/workflows/__tests__/runtimeBundle.test.js";

function claudeMdRuntimeBuildSection(claudeMd) {
  const heading = "### Workflow scripts and the runtime build";
  const start = claudeMd.indexOf(heading);
  expect(start).toBeGreaterThan(-1);
  const rest = claudeMd.slice(start + heading.length);
  const nextHeadingOffset = rest.search(/\n### /);
  return nextHeadingOffset === -1 ? rest : rest.slice(0, nextHeadingOffset);
}

function extractClaudeMdBareArtifactFilenames(section) {
  // A bare `name.ext` inline code span — no `/` — is a per-file name spelled
  // out verbatim, as opposed to `pdlc/workflows/dist/` (a directory, named
  // in prose) or a shell/command span (contains spaces).
  const matches = section.matchAll(/`([A-Za-z0-9_-]+\.[A-Za-z0-9]+)`/g);
  return new Set([...matches].map((m) => m[1]));
}

function extractBundlesConstant(runtimeBundleTestSrc) {
  const m = runtimeBundleTestSrc.match(/const BUNDLES\s*=\s*\[([^\]]*)\]/);
  expect(m).toBeTruthy();
  return new Set(
    [...m[1].matchAll(/"([^"]+)"/g)].map((mm) => mm[1])
  );
}

describe("T33 — CLAUDE.md ↔ manifest (TSPEC §12.2, §9.1 erratum 3)", () => {
  it("CLAUDE.md's workflow-build section names every non-bundle manifest artifact and the manifest file itself, verbatim", () => {
    const claudeMd = readRepo("CLAUDE.md");
    const manifest = JSON.parse(readDist("distribution-manifest.json"));

    const section = claudeMdRuntimeBuildSection(claudeMd);
    const claudeNames = extractClaudeMdBareArtifactFilenames(section);

    const nonBundleRowNames = new Set(
      manifest.rows.filter((r) => !r.pluginPath.endsWith(".bundle.js")).map((r) => basename(r.pluginPath))
    );
    nonBundleRowNames.add(basename(MANIFEST_PATH));

    expect([...claudeNames].sort()).toEqual([...nonBundleRowNames].sort());
  });

  it("CLAUDE.md's workflow-build section describes the manifest's remaining rows collectively as \"the bundles\"", () => {
    const claudeMd = readRepo("CLAUDE.md");
    const manifest = JSON.parse(readDist("distribution-manifest.json"));
    const section = claudeMdRuntimeBuildSection(claudeMd);

    const bundleRowCount = manifest.rows.filter((r) => r.pluginPath.endsWith(".bundle.js")).length;
    expect(bundleRowCount).toBeGreaterThan(0);
    expect(section).toMatch(/\bthe bundles\b/);
  });

  // Held under T19 (not `.skip`, deliberately): this file is a member of consumerCleanup.test.js's
  // `SWEPT_SURFACE_MODULES` (TSPEC §5.5), whose entire skip surface is required to route through
  // `describeOrSkip`/`itOrSkip` — a task-sequencing hold is not a runner-capability skip, so a bare
  // `.skip` here would register as an orphan under the skip-join oracle. Instead this test passes
  // vacuously while `runtimeBundle.test.js` is absent (PLAN T15 deleted it) and resumes asserting
  // its real content the moment T17/T19 restores a file at `RUNTIME_BUNDLE_TEST_PATH`.
  it("the manifest's bundle rows are set-equal to runtimeBundle.test.js's BUNDLES constant", () => {
    if (!existsSync(join(REPO_ROOT, RUNTIME_BUNDLE_TEST_PATH))) {
      return;
    }
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
