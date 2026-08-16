// CLI surface tests (Phase 3, pdlc-headless-engine).
//
// Every case here runs `bin/pdlc.mjs` as a real subprocess and NONE of them
// dispatches: they exercise `--dry-run` (whose transport throws if called) and
// the fail-closed handshake path (which returns before the workflow modules are
// even imported). No SDK, no `claude`, no network.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const BIN = path.join(engineRoot, "bin", "pdlc.mjs");
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");

function run(args, env = {}) {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    encoding: "utf8",
    cwd: repoRoot,
    env: { ...process.env, PDLC_PLUGIN_ROOT: "", ...env },
  });
  return { ...result, out: `${result.stdout}${result.stderr}` };
}

// ─── AC-3.1: the dry-run surface shows the composed prompt ────────────────────

test("`pdlc dev --dry-run` prints the pm-author SKILL.md text verbatim", () => {
  const skill = readFileSync(path.join(PLUGIN_ROOT, "skills", "pm-author", "SKILL.md"), "utf8");
  const r = run(["dev", "docs/x/REQ-x.md", "--dry-run", "--plugin-root", PLUGIN_ROOT]);

  assert.equal(r.status, 0, r.out);
  assert.ok(r.stdout.includes(skill), "the composed prompt must inline the whole SKILL.md");
  assert.match(r.stdout, /BEGIN ROLE DEFINITION: pm-author/);
  assert.match(r.stdout, /dry run complete: no dispatch was performed\./);
});

test("the composed prompt names no Skill tool and no `pdlc:` namespace of its own", () => {
  const skill = readFileSync(path.join(PLUGIN_ROOT, "skills", "pm-author", "SKILL.md"), "utf8");
  const r = run(["dev", "docs/x/REQ-x.md", "--dry-run", "--plugin-root", PLUGIN_ROOT]);
  // Strip the inlined SKILL.md — whatever the plugin prompt itself says is the
  // plugin's business; what must be clean is the engine's own composition.
  const scaffolding = r.stdout.replace(skill, "");
  assert.equal(/pdlc:pm-author/.test(scaffolding), false, scaffolding.slice(0, 400));
  assert.equal(/Skill tool/i.test(scaffolding), false);
});

test("`--dry-run-skill` selects any of the 17 prompt files", () => {
  const supplement = readFileSync(
    path.join(PLUGIN_ROOT, "skills", "se-implement", "SKILL-typescript.md"),
    "utf8"
  );
  const r = run([
    "dev",
    "docs/x/REQ-x.md",
    "--dry-run",
    "--dry-run-skill",
    "se-implement:SKILL-typescript.md",
    "--plugin-root",
    PLUGIN_ROOT,
  ]);
  assert.equal(r.status, 0, r.out);
  assert.ok(r.stdout.includes(supplement));
});

test("`pdlc queue --dry-run` works the same way and dispatches nothing", () => {
  const r = run(["queue", "--dry-run", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /dry run: queue/);
  assert.match(r.stdout, /docs\/_queue\/QUEUE\.md/);
  assert.match(r.stdout, /dry run complete: no dispatch was performed\./);
});

test("the dry run names the workflow module it would load and the seams it overrides", () => {
  const r = run(["dev", "docs/x/REQ-x.md", "--dry-run", "--plugin-root", PLUGIN_ROOT]);
  assert.ok(r.stdout.includes(path.join(repoRoot, "pdlc", "workflows", "orchestrate-dev.js")));
  assert.match(r.stdout, /_agent, _parallel, _pipeline, _phase, _log, _runCommand/);
});

// ─── AC-3.2 / C-10: a failed handshake dispatches nothing and exits non-zero ──

test("a missing plugin refuses `pdlc dev` before any workflow-module side effect", () => {
  const empty = mkdtempSync(path.join(os.tmpdir(), "pdlc-noplugin-"));
  try {
    const r = run(["dev", "docs/x/REQ-x.md", "--plugin-root", empty]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /plugin resolved/);
    assert.match(r.out, /refuses to dispatch/);
    // The banner/report of a run that actually reached the modules would carry
    // one of these. Neither may appear.
    assert.equal(/=== Phase R/.test(r.out), false);
    assert.equal(/--- run report ---/.test(r.out), false);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test("a missing plugin refuses `pdlc queue` the same way", () => {
  const empty = mkdtempSync(path.join(os.tmpdir(), "pdlc-noplugin-"));
  try {
    const r = run(["queue", "--plugin-root", empty]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /refuses to dispatch/);
    assert.equal(/--- run report ---/.test(r.out), false);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test("a missing plugin refuses even the dry run", () => {
  const empty = mkdtempSync(path.join(os.tmpdir(), "pdlc-noplugin-"));
  try {
    const r = run(["dev", "docs/x/REQ-x.md", "--dry-run", "--plugin-root", empty]);
    assert.equal(r.status, 1, r.out);
    assert.equal(/BEGIN ROLE DEFINITION/.test(r.out), false);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

// ─── usage / doctor / hello ──────────────────────────────────────────────────

test("`pdlc dev` with no REQ path is a usage error, not a crash", () => {
  const r = run(["dev", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /a REQ path is required/);
});

test("`pdlc doctor` passes against this repo's own plugin and dispatches nothing", () => {
  const r = run(["doctor", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /doctor: all checks passed\. No dispatch was performed\./);
  assert.match(r.stdout, /PASS {2}version handshake \(C-10\)/);
});

test("`pdlc hello` reports the canonical workflow module paths", () => {
  const r = run(["hello"]);
  assert.equal(r.status, 0, r.out);
  assert.ok(r.stdout.includes(path.join(repoRoot, "pdlc", "workflows", "orchestrate-dev.js")));
  assert.ok(r.stdout.includes(path.join(repoRoot, "pdlc", "workflows", "orchestrate-queue.js")));
});

// ─── Phase 4: --max-iterations validation (no dispatch reached) ───────────────

test("`pdlc queue --loop --max-iterations 0` is refused before any dispatch", () => {
  const r = run(["queue", "--loop", "--max-iterations", "0", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /--max-iterations must be a positive number/);
  assert.equal(/queue --loop: \d+ pass/.test(r.out), false, "the loop must never have started");
});

test("`pdlc queue --loop --max-iterations not-a-number` is refused before any dispatch", () => {
  const r = run(["queue", "--loop", "--max-iterations", "abc", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /--max-iterations must be a positive number/);
});

test("an unknown command prints the usage block naming dev and queue", () => {
  const r = run(["frobnicate"]);
  assert.equal(r.status, 1);
  assert.match(r.out, /pdlc dev <docs\/\{feature\}\/REQ-\{feature\}\.md>/);
  assert.match(r.out, /pdlc queue/);
});

// ─── EC-CLI-7: a flag outside §3.2's closed set is a usage error ─────────────

test("EC-CLI-7: an unknown flag (a typo) is a usage error, exit 1, nothing resolved", () => {
  const r = run(["dev", "docs/x/REQ-x.md", "--dry-runn", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /unknown flag "--dry-runn"/);
  assert.equal(/BEGIN ROLE DEFINITION/.test(r.out), false, "nothing may be resolved on a usage error");
});

test("EC-CLI-7: a flag valid for one command but not another is still a usage error", () => {
  const r = run(["doctor", "--force-phases", "R", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /unknown flag "--force-phases"/);
});

// ─── EC-CLI-5: a value flag with no value is a usage error, never silently empty ──

test("EC-CLI-5: `--cwd` as the last argument (no value) is a usage error, exit 1", () => {
  const r = run(["dev", "docs/x/REQ-x.md", "--plugin-root", PLUGIN_ROOT, "--cwd"]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /--cwd requires a value/);
});

test("EC-CLI-5: a value flag immediately followed by another flag is a usage error", () => {
  const r = run(["dev", "docs/x/REQ-x.md", "--cwd", "--dry-run", "--plugin-root", PLUGIN_ROOT]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /--cwd requires a value/);
});

test("EC-CLI-5: `--flag=value` form never trips the missing-value check", () => {
  const r = run(["dev", "docs/x/REQ-x.md", "--dry-run", `--plugin-root=${PLUGIN_ROOT}`]);
  assert.equal(r.status, 0, r.out);
});

// ─── BR-CLI-1: `--flag value` and `--flag=value` are equivalent ──────────────

test("BR-CLI-1 / AT-ENG-02: `--dry-run-skill name` and `--dry-run-skill=name` compose identically", () => {
  const spaceForm = run([
    "dev",
    "docs/x/REQ-x.md",
    "--dry-run",
    "--dry-run-skill",
    "se-author",
    "--plugin-root",
    PLUGIN_ROOT,
  ]);
  const equalsForm = run([
    "dev",
    "docs/x/REQ-x.md",
    "--dry-run",
    `--dry-run-skill=se-author`,
    "--plugin-root",
    PLUGIN_ROOT,
  ]);
  assert.equal(spaceForm.status, 0, spaceForm.out);
  assert.equal(equalsForm.status, 0, equalsForm.out);
  assert.equal(spaceForm.stdout, equalsForm.stdout);
});

// ─── AC-5.5 / TE CR v2 F-01: the entry on `PATH` reaches the LAUNCHER ────────
//
// `bin/pdlc.mjs:42` calls `mod.launch()`. Mutating it to `mod.main()` left the
// whole suite green (measured, round 2): both symbols are exported, so the
// mutant loads and runs, and what it silently loses is the entire resolution
// ladder — a pinned repo runs whatever is installed and `launch`'s refusal arm
// becomes unreachable, i.e. AC-5.5 fails open. `launch-wiring.test.js` drives
// `launch()` as a module function; `cli.test.js` spawns the real binary. The
// two suites met without overlapping on the one hop between them, which is
// the same builder-not-wired shape one level up.
//
// This leg is the overlap. It picks the one command where `launch` and `main`
// differ observably — a `dev` run in a repo pinned to a version that is not
// installed — and asserts the refusal only `launch()` can produce. It is
// hermetic by construction: the pin-missing arm refuses BEFORE any `exec`, so
// no child is ever spawned, and `PDLC_HOME` points at an empty temp store so
// the real store is never read. The plugin root is deliberately an empty
// directory as well, so the mutant (`main()`) still dispatches nothing — it
// fails the handshake instead, with different text and no refusal line.

test("AC-5.5: the real `bin/pdlc.mjs` refuses a pinned-but-uninstalled version — the launcher, not main()", () => {
  const emptyStore = mkdtempSync(path.join(os.tmpdir(), "pdlc-store-"));
  const emptyPlugin = mkdtempSync(path.join(os.tmpdir(), "pdlc-noplugin-"));
  const pinnedRepo = path.join(engineRoot, "__tests__", "fixtures", "launch-wiring", "pinned-to-9.9.9");
  try {
    const r = run(["dev", "docs/x/REQ-x.md", "--cwd", pinnedRepo, "--plugin-root", emptyPlugin], {
      PDLC_HOME: emptyStore,
      // Never inherit a marker a sibling in-process leg may have stamped on
      // this runner's own env: presence alone suppresses resolution, which
      // would make this leg pass under `main()` too.
      PDLC_RESOLVED_ENGINE: "",
    });

    assert.equal(r.status, 1, r.out);
    // The ladder's branch-4 refusal: names the pin AND what is installed.
    assert.match(r.out, /engine\.version is pinned to "9\.9\.9" but that version is not installed/, r.out);
    assert.match(r.out, /installed versions: none/, r.out);
    // The launcher's own fail-closed line. `main()` cannot print it: the
    // refusal arm lives in `launch()` (`bin/cli.mjs`), above `main()`.
    assert.match(r.out, /refusing to run an unresolved engine version \(fail-closed\)/, r.out);
    // And nothing ran: neither the pipeline nor the handshake refusal that a
    // `main()`-dispatching mutant would reach instead.
    assert.equal(/refuses to dispatch/.test(r.out), false, "the run must stop at the ladder, before the handshake");
    assert.equal(/--- run report ---/.test(r.out), false);
  } finally {
    rmSync(emptyStore, { recursive: true, force: true });
    rmSync(emptyPlugin, { recursive: true, force: true });
  }
});
