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

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { describeOrSkip } from "./helpers/driftCapabilities.js";
import { runScript, expectRepoRootUnresolved, makeToolDir } from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree } from "./helpers/driftFixtures.js";
import { snapshotTree } from "./helpers/driftOrdering.js";
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

/** `nonGitClaudeAtHome` — no `.git`; the only `.claude/` is at `home` itself. Reaches: the
 * `$HOME` rejection (FSPEC §2.2 clause 2). This is the one fixture in the suite whose `home`
 * deliberately contains a `.claude/` (TSPEC §8.4). */
function buildNonGitClaudeAtHome() {
  const consumer = makeConsumerTree({ git: false, claudeDir: false });
  mkdirSync(join(consumer.home, ".claude"), { recursive: true });
  return { ...consumer, cwd: consumer.root };
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
      const consumer = buildNonGitClaudeAtHome();
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
});
