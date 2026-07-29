/**
 * driftRepoRoot.test.js — Repo-root resolution suite: AC-0.5 / O-3 (TSPEC §8, PLAN T-20).
 *
 * Ownership (PLAN, single-writer-per-file across batches): T-20 (batch 5) owns this file
 * exactly. No later task touches it.
 *
 * RED-terminal (PLAN batch 5, Phase 4 preamble). Two independent reasons, both by design:
 *
 *   1. **Entrypoint-mediated cases** (everything driven through `runScript`) invoke the real
 *      `sync-workflows.sh` / `check-workflow-drift.sh` scripts (C2/C3), which do not exist
 *      until batch 11 — `bash <path>` on a missing file exits 127 with
 *      `bash: <path>: No such file or directory` on stderr. `expectRepoRootUnresolved`'s
 *      conjunct 1 (a `W-1` line on stderr) is the first thing every such assertion checks, so
 *      these fail with a clean, named assertion error — never a collection-time crash — long
 *      before any later conjunct is reached.
 *
 *   2. **Layer-2 sourced-probe cases** (`runProbe`, TSPEC §11.2's `backup-grammar.sh` precedent,
 *      generalised by T-39's `bin/lib-probe.sh`) source C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`),
 *      which does not exist until T-31 (batch 6). Until then `source` fails silently (exactly
 *      like `backup-grammar.sh`'s own precedent) and no `pdlc_*` function is ever defined, so
 *      every case here falls through to `lib-probe.sh`'s `unknown-function` `err` branch —
 *      again a clean, named assertion failure (`result.ok` is `false` where a resolved case is
 *      expected), never a harness-level crash. `runProbe`'s own line-count-equality check
 *      still holds (§11.2), so the suite stays COLLECTIBLE: every `it()` below runs to
 *      completion and reports a real, named failure — nothing here throws during collection
 *      or hangs.
 *
 * This is what PLAN T-20 means by "the assertions that make batch 7 independently green" —
 * T-32 (batch 7) lands `pdlc_resolve_repo_root` / `pdlc_resolve_plugin_root` and the
 * layer-2 block below goes green from its own commit onward, with no edit to this file. The
 * entrypoint-mediated block goes green only at batch 11 (C2/C3), per the PLAN's Phase 4 table.
 *
 * Fixture builders below are named for TSPEC §8.2's table exactly, so a reviewer can match
 * this file's `describe`/`it` names 1:1 against that table and against FSPEC §2.2's algorithm.
 */

import { mkdirSync, writeFileSync, mkdtempSync, rmSync, realpathSync } from "fs";
import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { describeOrSkip } from "./helpers/driftCapabilities.js";
import { runScript, expectRepoRootUnresolved, makeToolDir, allOf } from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree } from "./helpers/driftFixtures.js";
import { snapshotTree, assertTreeUnchanged } from "./helpers/driftOrdering.js";
import { runProbe } from "./helpers/driftProbe.js";

// ───────────────────────────── §8.2 fixture builders ─────────────────────────────
//
// PATH tool set omitting `git` — this is what makes `gitAbsent`'s "step 1 does not apply" case
// (TSPEC §8.2) and it is the only fixture in this file that needs a non-default tool set.
const NO_GIT_PATH_TOOLS = Object.freeze([
  "bash",
  "python3",
  "shasum",
  "sha1sum",
  "mv",
  "rm",
  "date",
  "printf",
]);

/** `nonGitWithClaude` — no `.git` from `root` to `home`; `root/.claude/` present; cwd nested
 * three levels under `root` (`root/sub/dir`) so the walk's ascent is actually exercised, not
 * merely a same-directory match. Reaches: step 2 succeeds (the walk's positive case). */
function buildNonGitWithClaude() {
  const consumer = makeConsumerTree({ git: false, claudeDir: true });
  const cwd = join(consumer.root, "sub", "dir");
  mkdirSync(cwd, { recursive: true });
  return { ...consumer, cwd };
}

/** `nonGitNoClaude` — no `.git`, no `.claude/` anywhere. Reaches: step 2 fails =>
 * `repo-root-unresolved` (AT-2). */
function buildNonGitNoClaude() {
  const consumer = makeConsumerTree({ git: false, claudeDir: false });
  return { ...consumer, cwd: consumer.root };
}

/** `gitTreeBrokenProbe` — `git init` at `root`, and `root/.claude/` present. Run with
 * `PDLC_FAULT=git-worktree-list`, step 1 applies and fails => MUST be `repo-root-unresolved`,
 * never a fall-through to the walk (the walk would succeed here — `.claude/` exists — which is
 * exactly what makes this fixture falsify a softened implementation, TSPEC §8.2). Without the
 * fault it is simply an ordinary resolvable git tree, reused below for the layer-2 positive
 * git-tree probe case. */
function buildGitTreeBrokenProbe() {
  const consumer = makeConsumerTree({ git: true, claudeDir: true });
  return { ...consumer, cwd: consumer.root };
}

/** `nonGitClaudeAtHome` — no `.git`; the only `.claude/` is at `home` itself. This is the one
 * fixture in the suite whose `home` deliberately contains a `.claude/` (TSPEC §8.4).
 *
 * `cwdAtHome` matters, and defaulting it wrong makes a test vacuous: `makeConsumerTree` creates
 * `root` and `home` as SIBLING tmpdirs, so with the default `cwd: root` the ancestor walk never
 * becomes a descendant of `$HOME` and therefore never reaches the `$HOME` guard at all — it
 * merely exhausts the chain finding no marker, which is a different code path with the same
 * outward verdict. Pass `cwdAtHome: true` to start the walk at `$HOME` itself, which is what
 * actually exercises the FSPEC §2.2 clause 2 rejection. */
function buildNonGitClaudeAtHome({ cwdAtHome = false } = {}) {
  const consumer = makeConsumerTree({ git: false, claudeDir: false });
  mkdirSync(join(consumer.home, ".claude"), { recursive: true });
  return { ...consumer, cwd: cwdAtHome ? consumer.home : consumer.root };
}

/** A consumer tree whose repo root itself carries the maintainer marker
 * (`pdlc/workflows/build-runtime.mjs`, FSPEC §2.4) — used only by the layer-2
 * `pdlc_resolve_plugin_root` fallback case, never by an entrypoint-mediated case. */
function buildMaintainerMarkerRoot() {
  const consumer = makeConsumerTree({ git: false, claudeDir: true });
  mkdirSync(join(consumer.root, "pdlc", "workflows"), { recursive: true });
  writeFileSync(join(consumer.root, "pdlc", "workflows", "build-runtime.mjs"), "// maintainer marker\n");
  return consumer;
}

describe("driftRepoRoot — AC-0.5 repo-root resolution (TSPEC §8, PLAN T-20)", () => {
  // ─────────────────────── entrypoint-mediated cases (batch 11) ───────────────────────

  describe("AT-2 — non-git tree, no .claude/, reason repo-root-unresolved", () => {
    it("a non-git tree with no .claude/ anywhere reports repo-root-unresolved, writes nothing", () => {
      const consumer = buildNonGitNoClaude();
      const plugin = makePluginTree(); // "valid non-empty manifest" (§8.1 point 3's healthy rest)
      try {
        const snapshotBefore = snapshotTree(consumer.root);
        const run = runScript("check", {
          consumerRoot: consumer.root,
          cwd: consumer.cwd,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        expectRepoRootUnresolved(run, {
          root: consumer.root,
          snapshotBefore,
          reportedReason: "repo-root-unresolved",
        });
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  });

  describeOrSkip(
    "git-anchored entrypoint cases (TSPEC §8.2)",
    "git",
    ["O-3's git guard — git-worktree-list / walk-stat fault fixtures need a real git tree"],
    () => {
      it("a git tree whose worktree probe fails does NOT fall through to the walk", () => {
        // TSPEC §8.2: gitTreeBrokenProbe's whole point — root/.claude/ EXISTS, so the walk
        // would succeed; faulting the git guard must still yield repo-root-unresolved, never
        // a softened fall-through.
        const consumer = buildGitTreeBrokenProbe();
        const plugin = makePluginTree();
        try {
          const snapshotBefore = snapshotTree(consumer.root);
          const run = runScript("check", {
            consumerRoot: consumer.root,
            cwd: consumer.cwd,
            home: consumer.home,
            pluginRoot: plugin.pluginRoot,
            fault: ["git-worktree-list"],
          });
          expectRepoRootUnresolved(run, {
            root: consumer.root,
            snapshotBefore,
            reportedReason: "repo-root-unresolved",
          });
        } finally {
          consumer.cleanup();
          plugin.cleanup();
        }
      });
    }
  );

  it("a non-git tree whose upward walk fails (walk-stat faulted) reports repo-root-unresolved, and does not re-enter step 1", () => {
    // TSPEC §8.2: walk-stat's mirror case — nonGitWithClaude would otherwise resolve via the
    // walk; faulting the walk guard must not somehow make it succeed via the git branch either
    // (there is no .git here at all, so step 1 never applies in the first place).
    const consumer = buildNonGitWithClaude();
    const plugin = makePluginTree();
    try {
      const snapshotBefore = snapshotTree(consumer.root);
      const run = runScript("check", {
        consumerRoot: consumer.root,
        cwd: consumer.cwd,
        home: consumer.home,
        pluginRoot: plugin.pluginRoot,
        fault: ["walk-stat"],
      });
      expectRepoRootUnresolved(run, {
        root: consumer.root,
        snapshotBefore,
        reportedReason: "repo-root-unresolved",
      });
    } finally {
      consumer.cleanup();
      plugin.cleanup();
    }
  });

  describe("§8.4 — the $HOME-guard co-holding case", () => {
    it("nonGitClaudeAtHome — the only .claude/ is at $HOME itself, snapshot taken over home, not root", () => {
      const consumer = buildNonGitClaudeAtHome();
      const plugin = makePluginTree();
      try {
        // The snapshot is taken over `home`, not `root` — the failure this guards is a write
        // into $HOME/.claude/ (TSPEC §8.4), so that is the tree whose invariance matters here.
        const snapshotBefore = snapshotTree(consumer.home);
        const run = runScript("check", {
          consumerRoot: consumer.root,
          cwd: consumer.cwd,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        expectRepoRootUnresolved(run, {
          root: consumer.home,
          snapshotBefore,
          reportedReason: "repo-root-unresolved",
        });
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });

    it("AT-33 — co-holding: reports manifest-empty (outranks repo-root-unresolved), writes nothing, N-8 required", () => {
      const consumer = buildNonGitNoClaude();
      const plugin = makePluginTree({ rows: [] }); // emptyManifest
      try {
        const snapshotBefore = snapshotTree(consumer.root);
        const checkRun = runScript("check", {
          consumerRoot: consumer.root,
          cwd: consumer.cwd,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        expectRepoRootUnresolved(checkRun, {
          root: consumer.root,
          snapshotBefore,
          reportedReason: "manifest-empty",
        });

        const hookRun = runScript("hook", {
          consumerRoot: consumer.root,
          cwd: consumer.cwd,
          home: consumer.home,
          pluginRoot: plugin.pluginRoot,
        });
        expect(hookRun.status).toBe(0);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });
  });

  // ─────────────────────── layer-2 sourced-probe cases (T-39, batch 7) ───────────────────────
  //
  // These call C1's `pdlc_resolve_repo_root` / `pdlc_resolve_plugin_root` directly through
  // `runProbe`, bypassing the not-yet-existing entrypoints entirely — the batch-7 observable
  // PLAN T-20 names. Each case constructs its own sandbox env from `makeToolDir` rather than
  // through `driftHarness`'s private `sandboxEnv`, mirroring `driftProbe.js`'s own `probeEnv`
  // shape (LC_ALL=C/LANG=C/TZ=UTC, TSPEC §3.2).

  function probeEnvFor({ home, path, extra } = {}) {
    return {
      PATH: makeToolDir(path || NO_GIT_PATH_TOOLS.concat("git")),
      HOME: home,
      LC_ALL: "C",
      LANG: "C",
      TZ: "UTC",
      ...extra,
    };
  }

  describe("pdlc_resolve_repo_root (TSPEC §2.2, C1 layer 2)", () => {
    describeOrSkip(
      "over a real git tree",
      "git",
      ["O-3's git guard needs a real `git worktree list --porcelain`-capable tree"],
      () => {
        it("resolves to the fixture root over a git tree (step 1)", () => {
          const consumer = buildGitTreeBrokenProbe();
          try {
            const [resolveResult, dumpResult] = runProbe(
              ["pdlc_resolve_repo_root", "dump\tPDLC_REPO_ROOT"],
              { cwd: consumer.cwd, env: probeEnvFor({ home: consumer.home }) }
            );
            expect(resolveResult.ok).toBe(true);
            expect(resolveResult.fields[0]).toBe("0");
            expect(dumpResult.ok).toBe(true);
            expect(dumpResult.fields[1]).toBe(consumer.root);
          } finally {
            consumer.cleanup();
          }
        });

        it("sets the documented failure status when the worktree probe is faulted (gitTreeBrokenProbe)", () => {
          const consumer = buildGitTreeBrokenProbe();
          try {
            const [resolveResult] = runProbe(["pdlc_resolve_repo_root"], {
              cwd: consumer.cwd,
              env: probeEnvFor({ home: consumer.home, extra: { PDLC_FAULT: "git-worktree-list" } }),
            });
            expect(resolveResult.ok).toBe(true);
            expect(resolveResult.fields[0]).toBe("1");
          } finally {
            consumer.cleanup();
          }
        });
      }
    );

    it("resolves to the fixture root over a non-git tree (step 2, the walk)", () => {
      const consumer = buildNonGitWithClaude();
      try {
        const [resolveResult, dumpResult] = runProbe(
          ["pdlc_resolve_repo_root", "dump\tPDLC_REPO_ROOT"],
          { cwd: consumer.cwd, env: probeEnvFor({ home: consumer.home, path: NO_GIT_PATH_TOOLS }) }
        );
        expect(resolveResult.ok).toBe(true);
        expect(resolveResult.fields[0]).toBe("0");
        expect(dumpResult.ok).toBe(true);
        expect(dumpResult.fields[1]).toBe(consumer.root);
      } finally {
        consumer.cleanup();
      }
    });

    it("resolves to the fixture root when git is absent from PATH (gitAbsent — step 1 does not apply)", () => {
      const consumer = buildNonGitWithClaude();
      try {
        const [resolveResult, dumpResult] = runProbe(
          ["pdlc_resolve_repo_root", "dump\tPDLC_REPO_ROOT"],
          { cwd: consumer.cwd, env: probeEnvFor({ home: consumer.home, path: NO_GIT_PATH_TOOLS }) }
        );
        expect(resolveResult.ok).toBe(true);
        expect(resolveResult.fields[0]).toBe("0");
        expect(dumpResult.fields[1]).toBe(consumer.root);
      } finally {
        consumer.cleanup();
      }
    });

    it("rejects $HOME — a walk that lands on $HOME itself is repo-root-unresolved (FSPEC §2.2 clause 2)", () => {
      // `cwdAtHome` is what makes this test non-vacuous — see `buildNonGitClaudeAtHome`.
      const consumer = buildNonGitClaudeAtHome({ cwdAtHome: true });
      try {
        const [resolveResult] = runProbe(["pdlc_resolve_repo_root"], {
          cwd: consumer.cwd,
          env: probeEnvFor({ home: consumer.home, path: NO_GIT_PATH_TOOLS }),
        });
        expect(resolveResult.ok).toBe(true);
        expect(resolveResult.fields[0]).toBe("1");
      } finally {
        consumer.cleanup();
      }
    });
  });

  describe("pdlc_resolve_plugin_root (TSPEC §2.2, FSPEC §2.4, C1 layer 2)", () => {
    it("prefers CLAUDE_PLUGIN_ROOT when it is set, dumping PDLC_PLUGIN_ROOT_REASON", () => {
      const consumer = makeConsumerTree({ git: false, claudeDir: true });
      const plugin = makePluginTree();
      try {
        const [resolveResult, rootDump, reasonDump] = runProbe(
          ["pdlc_resolve_plugin_root", "dump\tPDLC_PLUGIN_ROOT", "dump\tPDLC_PLUGIN_ROOT_REASON"],
          {
            cwd: consumer.root,
            env: probeEnvFor({
              home: consumer.home,
              extra: { PDLC_REPO_ROOT: consumer.root, CLAUDE_PLUGIN_ROOT: plugin.pluginRoot },
            }),
          }
        );
        expect(resolveResult.ok).toBe(true);
        expect(resolveResult.fields[0]).toBe("0");
        expect(rootDump.ok).toBe(true);
        expect(rootDump.fields[1]).toBe(plugin.pluginRoot);
        // PDLC_PLUGIN_ROOT_REASON must be dumpable (i.e. set) whichever branch resolution
        // took — TSPEC §2.2 names it as an output variable without pinning its value
        // vocabulary, so this asserts presence, not a literal string.
        expect(reasonDump.ok).toBe(true);
      } finally {
        consumer.cleanup();
        plugin.cleanup();
      }
    });

    it("falls back to the build-runtime.mjs maintainer marker when CLAUDE_PLUGIN_ROOT is unset (FSPEC §2.4)", () => {
      const consumer = buildMaintainerMarkerRoot();
      try {
        const [resolveResult, rootDump, reasonDump] = runProbe(
          ["pdlc_resolve_plugin_root", "dump\tPDLC_PLUGIN_ROOT", "dump\tPDLC_PLUGIN_ROOT_REASON"],
          {
            cwd: consumer.root,
            // CLAUDE_PLUGIN_ROOT deliberately absent — probeEnvFor's `extra` spread does not
            // add it, and the constructed env (never `...process.env`) carries nothing else
            // that could supply it.
            env: probeEnvFor({ home: consumer.home, extra: { PDLC_REPO_ROOT: consumer.root } }),
          }
        );
        expect(resolveResult.ok).toBe(true);
        expect(resolveResult.fields[0]).toBe("0");
        expect(rootDump.ok).toBe(true);
        expect(rootDump.fields[1]).toBe(join(consumer.root, "pdlc"));
        expect(reasonDump.ok).toBe(true);
      } finally {
        consumer.cleanup();
      }
    });
  });

  // ───────────────────────── PROP-BSL-06 (PLAN T-47, PROPERTIES §5.2) ─────────────────────────
  //
  // "The no-write-target rule is keyed on evidence, not on selection." Domain: the 10 §5.1
  // manifest-chain vectors (`MANIFEST_CHAIN_VECTORS`, `driftGenerators.js`) with E1 (consumer
  // repo root) bound to `holds` — every one of them built on `buildNonGitNoClaude()` (already
  // above), which is what supplies E1 = holds uniformly; what varies per vector is E2
  // (json-tool-absent, via PATH) and E3/E4/E5/E6 (via `CLAUDE_PLUGIN_ROOT` and the plugin tree
  // it names — FSPEC §2.1's "E1 independent of E2-E6" is exactly what makes this combination
  // constructible without a resolvable consumer repo root at all). For every vector,
  // `--check` must report the FSPEC §2.8 precedence-selected reason and create nothing; three
  // representative vectors (the ones PROPERTIES §5.2 names: `+manifestAbsent`, `+manifestEmpty`,
  // `E1` alone) are re-run on `sync` and the `hook` for the exit-code conjunct (3 / 0).

  const JSON_TOOL_ABSENT_PATH = Object.freeze([
    "bash",
    "git",
    "shasum",
    "sha1sum",
    "mv",
    "rm",
    "date",
    "printf",
    "mkdir",
  ]);

  /** E3 = unset — no `CLAUDE_PLUGIN_ROOT` at all. */
  function noPluginRoot() {
    return { pluginRootOpt: undefined, cleanup: () => {} };
  }

  /** E3 = unreadable — `CLAUDE_PLUGIN_ROOT` names a plain FILE, never a directory (§5.1's own
   * recipe: "`CLAUDE_PLUGIN_ROOT` at file"), so `pdlc_resolve_plugin_root`'s `[[ ! -d ... ]]`
   * check fails without needing a permission-bit fixture. */
  function pluginRootUnreadableFile() {
    const tmp = realpathSync(tmpdir());
    const dir = mkdtempSync(join(tmp, "pdlc-pluginfile-"));
    const filePath = join(dir, "not-a-directory");
    writeFileSync(filePath, "not a directory\n");
    return { pluginRootOpt: filePath, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
  }

  /** E3 = ok, E4 = holds — a readable, traversable plugin root whose
   * `workflows/dist/distribution-manifest.json` does not exist (the `preManifestConsumer`
   * recipe, TSPEC §13.1, applied to the PLUGIN side rather than the consumer side). */
  function pluginRootManifestAbsent() {
    const tmp = realpathSync(tmpdir());
    const pluginRoot = mkdtempSync(join(tmp, "pdlc-plugin-noManifest-"));
    mkdirSync(join(pluginRoot, "workflows", "dist"), { recursive: true });
    return {
      pluginRootOpt: pluginRoot,
      cleanup: () => rmSync(pluginRoot, { recursive: true, force: true }),
    };
  }

  /** E3 = ok, E4 = does-not-hold, well-formed non-empty manifest (E5/E6 = does-not-hold). */
  function pluginRootValidNonEmpty() {
    const plugin = makePluginTree();
    return { pluginRootOpt: plugin.pluginRoot, cleanup: plugin.cleanup };
  }

  /** E5 = holds — `manifestUnparseable` (helper `12` path, TSPEC §13.1). */
  function pluginRootMalformedManifest() {
    const plugin = makePluginTree({ manifestRaw: "{ not valid json" });
    return { pluginRootOpt: plugin.pluginRoot, cleanup: plugin.cleanup };
  }

  /** E6 = holds — `emptyManifest` (TSPEC §13.1, AT-33's own recipe). */
  function pluginRootEmptyManifest() {
    const plugin = makePluginTree({ rows: [] });
    return { pluginRootOpt: plugin.pluginRoot, cleanup: plugin.cleanup };
  }

  // The 10 vectors, in `MANIFEST_CHAIN_VECTORS` order (driftGenerators.js), each carrying the
  // FSPEC §2.8 precedence-selected reason for E1 = holds combined with that row's E2-E6:
  // `drift-state-invalidated > manifest-empty > json-tool-absent > manifest-malformed >
  // manifest-absent > repo-root-unresolved > plugin-root-unreadable > plugin-root-unset`.
  const BSL06_VECTORS = [
    {
      label: "E3=unset, E2=holds (json-tool-absent outranks plugin-root-unset)",
      plugin: noPluginRoot,
      path: JSON_TOOL_ABSENT_PATH,
      reason: "json-tool-absent",
    },
    {
      label: "E3=unset, E2=does-not-hold (repo-root-unresolved outranks plugin-root-unset)",
      plugin: noPluginRoot,
      path: undefined,
      reason: "repo-root-unresolved",
    },
    {
      label: "E3=unreadable, E2=holds (json-tool-absent outranks plugin-root-unreadable)",
      plugin: pluginRootUnreadableFile,
      path: JSON_TOOL_ABSENT_PATH,
      reason: "json-tool-absent",
    },
    {
      label: "E3=unreadable, E2=does-not-hold (repo-root-unresolved outranks plugin-root-unreadable)",
      plugin: pluginRootUnreadableFile,
      path: undefined,
      reason: "repo-root-unresolved",
    },
    {
      label: "E4=holds (manifest-absent), E2=holds (json-tool-absent outranks manifest-absent)",
      plugin: pluginRootManifestAbsent,
      path: JSON_TOOL_ABSENT_PATH,
      reason: "json-tool-absent",
    },
    {
      label:
        "E4=holds (manifest-absent), E2=does-not-hold — the +manifestAbsent representative " +
        "(manifest-absent outranks repo-root-unresolved: FSPEC §2.8's 'ordinary first-release consumer')",
      plugin: pluginRootManifestAbsent,
      path: undefined,
      reason: "manifest-absent",
      representative: true,
    },
    {
      label: "E4=does-not-hold, E2=holds (json-tool-absent outranks repo-root-unresolved)",
      plugin: pluginRootValidNonEmpty,
      path: JSON_TOOL_ABSENT_PATH,
      reason: "json-tool-absent",
    },
    {
      label:
        "E4=does-not-hold, E2=does-not-hold, E5=holds (manifest-malformed outranks repo-root-unresolved)",
      plugin: pluginRootMalformedManifest,
      path: undefined,
      reason: "manifest-malformed",
    },
    {
      label:
        "E5=does-not-hold, E6=holds — the +manifestEmpty representative (manifest-empty outranks " +
        "everything else that holds here, same co-holding pair as AT-33)",
      plugin: pluginRootEmptyManifest,
      path: undefined,
      reason: "manifest-empty",
      representative: true,
    },
    {
      label:
        "E5=does-not-hold, E6=does-not-hold — the E1-alone representative (nothing else holds; " +
        "repo-root-unresolved is reported)",
      plugin: pluginRootValidNonEmpty,
      path: undefined,
      reason: "repo-root-unresolved",
      representative: true,
    },
  ];

  function buildBsl06RunOpts(consumer, pluginFixture, vector) {
    const runOpts = {
      consumerRoot: consumer.root,
      cwd: consumer.cwd,
      home: consumer.home,
    };
    if (pluginFixture.pluginRootOpt !== undefined) runOpts.pluginRoot = pluginFixture.pluginRootOpt;
    if (vector.path !== undefined) runOpts.path = vector.path;
    return runOpts;
  }

  describe("PROP-BSL-06 — the no-write-target rule is keyed on evidence, not on selection (FSPEC §2.1, §2.8)", () => {
    for (const vector of BSL06_VECTORS) {
      describe(vector.label, () => {
        it("`--check` reports the precedence-selected reason and creates nothing", () => {
          const consumer = buildNonGitNoClaude();
          const pluginFixture = vector.plugin();
          try {
            const snapshotBefore = snapshotTree(consumer.root);
            const run = runScript("check", buildBsl06RunOpts(consumer, pluginFixture, vector));
            expectRepoRootUnresolved(run, {
              root: consumer.root,
              snapshotBefore,
              reportedReason: vector.reason,
            });
          } finally {
            consumer.cleanup();
            pluginFixture.cleanup();
          }
        });
      });
    }

    describe("representative vectors re-run on sync and the hook (exit-code conjunct)", () => {
      const REPRESENTATIVES = BSL06_VECTORS.filter((v) => v.representative);

      it("names exactly the three representatives PROPERTIES §5.2 states", () => {
        expect(REPRESENTATIVES).toHaveLength(3);
        expect(REPRESENTATIVES.map((v) => v.reason).sort()).toEqual(
          ["manifest-absent", "manifest-empty", "repo-root-unresolved"].sort()
        );
      });

      for (const vector of REPRESENTATIVES) {
        describe(vector.label, () => {
          it("sync exits 3, reports the same reason, and creates nothing", () => {
            const consumer = buildNonGitNoClaude();
            const pluginFixture = vector.plugin();
            try {
              const snapshotBefore = snapshotTree(consumer.root);
              const run = runScript("sync", buildBsl06RunOpts(consumer, pluginFixture, vector));
              expectRepoRootUnresolved(run, {
                root: consumer.root,
                snapshotBefore,
                reportedReason: vector.reason,
              });
            } finally {
              consumer.cleanup();
              pluginFixture.cleanup();
            }
          });

          it("the hook exits 0, reports the same reason, and creates nothing", () => {
            const consumer = buildNonGitNoClaude();
            const pluginFixture = vector.plugin();
            try {
              const snapshotBefore = snapshotTree(consumer.root);
              const run = runScript("hook", buildBsl06RunOpts(consumer, pluginFixture, vector));
              expectRepoRootUnresolved(run, {
                root: consumer.root,
                snapshotBefore,
                reportedReason: vector.reason,
              });
            } finally {
              consumer.cleanup();
              pluginFixture.cleanup();
            }
          });
        });
      }
    });
  });

  // ───────────────────────── PROP-NEG-02 (PLAN T-47, PROPERTIES §10) ─────────────────────────
  //
  // "Nothing is ever written under $HOME or /." Over the two adversarial root-resolution
  // fixtures the PLAN names — `.claude/` sitting directly at `$HOME` (already built above as
  // `buildNonGitClaudeAtHome`), and a genuinely deleted `$PWD` (built below, for real, never
  // simulated via `PDLC_FAULT=walk-stat`) — three POSITIVE conjuncts, never "nothing bad
  // happened": (1) the tree rooted at the real sandbox `$HOME` is byte-identical to its pre-run
  // snapshot, (2) exactly one W-1 line names the reason, and it is exactly
  // "repo-root-unresolved", and (3) the exit code is the exact value the surface documents (0 for
  // the hook, 3 for `--check`/sync).

  /**
   * Wraps the real `spawnSync` so the actual invocation is:
   *   `bash -c '<wrapper>' bash <deletedDir> <script> <...argv>`
   * The wrapper `cd`s into `deletedDir` (still real at spawn time), `rm -rf`s it from under
   * itself, then `exec`s the real entrypoint script — which inherits the now-unlinked cwd, so
   * its own `pwd -P` (bash's builtin, `pdlc_resolve_repo_root`'s walk step) genuinely fails with
   * no path to return, exactly as confirmed interactively against this runner's bash. This never
   * touches the real `$HOME` or `/` — `deletedDir` is a disposable fixture-owned directory
   * created solely to be destroyed by this same call.
   */
  /**
   * A genuine ".claude/ sits directly at $HOME" fixture: `cwd` IS `$HOME` (not a sibling
   * tmpdir carrying a merely-decorative `.claude/`, as `buildNonGitClaudeAtHome()` above
   * builds — that fixture's `cwd` is `consumer.root`, a directory whose real filesystem
   * ancestor chain never actually passes through `consumer.home`, so it cannot exercise
   * `pdlc_resolve_repo_root`'s $HOME-landing rejection; see the FALSIFICATION-LEDGER-T-47.md
   * entry for PROP-NEG-02, and the reported defect below, for why this dedicated fixture is
   * used here instead). The walk starts exactly at $HOME, `.claude/` exists exactly there, so
   * the only way the run can fail to write is if the guard that stops the walk AT $HOME
   * without accepting it as a match actually fires.
   */
  function buildClaudeDirectlyAtHome() {
    const tmp = realpathSync(tmpdir());
    const home = mkdtempSync(join(tmp, "pdlc-home-"));
    mkdirSync(join(home, ".claude"), { recursive: true });
    return {
      home,
      cwd: home,
      root: home,
      cleanup: () => rmSync(home, { recursive: true, force: true }),
    };
  }

  function makeDeletedCwdSpawn(deletedDir) {
    const wrapper =
      'cd "$1" || exit 97; rm -rf "$1" || exit 98; shift; script="$1"; shift; exec bash "$script" "$@"';
    return function (_cmd, args, opts) {
      const [script, ...rest] = args;
      const newOpts = { ...opts };
      delete newOpts.cwd;
      return spawnSync("bash", ["-c", wrapper, "bash", deletedDir, script, ...rest], newOpts);
    };
  }

  describe("PROP-NEG-02 — nothing is ever written under $HOME or / (adversarial root-resolution fixtures)", () => {
    describe("adversarial fixture 1 — .claude/ sits directly at $HOME (TSPEC §8.4)", () => {
      for (const entrypoint of ["check", "sync", "hook"]) {
        it(`${entrypoint}: HOME's tree is unchanged, the reason is exactly repo-root-unresolved, and the exit code is the surface's own`, () => {
          const consumer = buildClaudeDirectlyAtHome();
          const plugin = makePluginTree();
          try {
            const snapshotBefore = snapshotTree(consumer.home);
            const run = runScript(entrypoint, {
              consumerRoot: consumer.root,
              cwd: consumer.cwd,
              home: consumer.home,
              pluginRoot: plugin.pluginRoot,
            });

            // Conjunct 1 (positive): the tree rooted at the sandbox $HOME — the only place a
            // resolution bug could write, since it is the one directory this fixture's walk
            // could mistake for a repo root — is byte-identical to its pre-run snapshot.
            assertTreeUnchanged(consumer.home, snapshotBefore);

            // Conjunct 2 (positive): exactly one W-1 line names the reason, and that reason is
            // exactly the string "repo-root-unresolved" — never a substring match.
            const w1 = allOf(run.stderr, "W-1").filter((m) => m.groups.reason === "repo-root-unresolved");
            expect(w1).toHaveLength(1);

            // Conjunct 3 (positive): the exit code is exactly the value this surface documents.
            const expectedStatus = entrypoint === "hook" ? 0 : 3;
            expect(run.status).toBe(expectedStatus);
          } finally {
            consumer.cleanup();
            plugin.cleanup();
          }
        });
      }
    });

    describe("adversarial fixture 2 — $PWD is deleted underneath the process", () => {
      for (const entrypoint of ["check", "sync", "hook"]) {
        it(`${entrypoint}: HOME's tree is unchanged, the reason is exactly repo-root-unresolved, and the exit code is the surface's own`, () => {
          const tmp = realpathSync(tmpdir());
          const home = mkdtempSync(join(tmp, "pdlc-home-"));
          const cwd = mkdtempSync(join(tmp, "pdlc-deletedcwd-"));
          try {
            const snapshotBefore = snapshotTree(home);
            const run = runScript(entrypoint, {
              consumerRoot: cwd,
              cwd,
              home,
              _spawnSync: makeDeletedCwdSpawn(cwd),
            });

            // Conjunct 1 (positive): the tree rooted at the sandbox $HOME is byte-identical to
            // its pre-run snapshot.
            assertTreeUnchanged(home, snapshotBefore);

            // Conjunct 2 (positive): exactly one W-1 line names the reason, and that reason is
            // exactly the string "repo-root-unresolved".
            const w1 = allOf(run.stderr, "W-1").filter((m) => m.groups.reason === "repo-root-unresolved");
            expect(w1).toHaveLength(1);

            // Conjunct 3 (positive): the exit code is exactly the value this surface documents.
            const expectedStatus = entrypoint === "hook" ? 0 : 3;
            expect(run.status).toBe(expectedStatus);
          } finally {
            // `cwd` was already removed by the wrapper itself (that is the whole point of this
            // fixture); `force: true` tolerates its absence rather than throwing on it.
            rmSync(cwd, { recursive: true, force: true });
            rmSync(home, { recursive: true, force: true });
          }
        });
      }
    });
  });
});
