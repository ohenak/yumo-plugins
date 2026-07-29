/**
 * driftMessages.test.js — PLAN T-28 (batch 5, RED-terminal).
 *
 * Ownership: T-28 owns this file exactly (single-writer-per-file rule). No other file is
 * touched by this task.
 *
 * Scope, verbatim from the PLAN row: AT-30's pairwise `distinct()` over S1/S2/S3 rendered
 * through the REAL `pdlc_msg_*` functions via the §11.2 batched-driver pattern (never JS copies
 * of the strings — TSPEC §14 row AT-30, FSPEC §8.2), and §14.1's **M-1** — one `it()` per row of
 * §7.4's AC-2.5 table (4) — with their `mustNotName` halves. The same `runProbe` path also
 * covers the `<pluginRoot>`-expanded `syncCommand` and its null fallback (TSPEC §7.4, AC-0.4,
 * AC-4.2).
 *
 * RED-terminal (PLAN batch 5): C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`) does not exist until
 * T-31 (batch 6), so every `pdlc_msg_*` / `pdlc_sync_command` case below resolves through
 * `lib-probe.sh`'s "unknown-function" `err` branch and every `it()` fails loudly. Nothing in
 * this file is production code; T-28 owns only the test.
 *
 * **Invented per-function contract (PL-02-style flag).** TSPEC §2.2 names the `pdlc_msg_*`
 * family generically ("stdout/stderr lines per FSPEC §8") but pins no individual signature, the
 * way §11.1 pins `pdlc_backup_format`/`pdlc_backup_parse`'s. This suite is the first to call the
 * family, so it fixes the contract T-35 (batch 10, C1 layer 5) must satisfy — flagged for
 * reviewer attention:
 *
 *   pdlc_msg_w1 <reason>                 stdout = W-1 line (baseline unresolved)
 *   pdlc_msg_w2 <id> <reason>            stdout = W-2 line (row `unknown`)
 *   pdlc_msg_w3 <id>                     stdout = W-3 line (row `unverified`)
 *   pdlc_msg_w4 <id> <backupDir>         stdout = W-4 line (row `local-edit`)
 *   pdlc_msg_w5 <id> <state>             stdout = W-5 line (`state` = stale|missing)
 *   pdlc_msg_w6 <path> <id> <state>      stdout = W-6 line (retired-present; `state` one of R's
 *                                        six states)
 *   pdlc_msg_w7 <path> <operation>       stdout = W-7 line (write failure)
 *   pdlc_sync_command                    stdout = the `<pluginRoot>`-expanded
 *                                        `sync-workflows.sh` path, reading the already-resolved
 *                                        `PDLC_PLUGIN_ROOT`; exit 0 / stdout set when resolved,
 *                                        exit 1 / empty stdout when not (FSPEC §1.3's
 *                                        `syncCommand: null` rule) — the value W-3/W-4/W-5's own
 *                                        `{cmd}` substitution and the drift-state writer both
 *                                        read, so a divergence between the two is exactly the
 *                                        AC-0.4/AC-4.2 regression this file exists to catch.
 *
 * Like `pdlc_backup_format`/`_parse` (§11.1), every function above writes its rendered text to
 * **stdout**, never straight to its own stderr — the entrypoints (C2/C3) are what redirect a
 * `pdlc_msg_*` call to the real stderr (e.g. `pdlc_msg_w1 "$reason" >&2`), exactly as
 * `pdlc_sha1`/`pdlc_backup_format` return their value on stdout for a caller to use. This is what
 * makes the family reachable through `lib-probe.sh`'s `invoke_function`, which captures only
 * stdout (TSPEC §11.2) — a function that wrote straight to its own fd 2 would be invisible to
 * this driver.
 *
 * **Out of scope, by design (not an omission).** S3's eighth member — the §6.3 Manifest-level
 * line for `drift-state-invalidated` (FSPEC §8.2's S3 note; TSPEC §7.4's AC-2.5a table says that
 * reason's distinctness/class pairing is "asserted there") — is not exercised here. That line's
 * only rendering site is the **queue's** blocked report (§6.3), which is JS, not C1, so it is
 * unreachable through this file's bash-sourced `runProbe` driver by construction. Its
 * distinctness and reason→class pairing are M-3's job in `driftBaseline.test.js` (T-21).
 */

import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { runProbe } from "./helpers/driftProbe.js";
import { makeToolDir, MESSAGES, distinct, expectRemediationClass } from "./helpers/driftHarness.js";
import { makeConsumerTree, makePluginTree } from "./helpers/driftFixtures.js";

// ───────────────────────────── percent-decode (TSPEC §4.1's rule, reversed) ─────────────────
//
// `driftOrdering.js` owns the trace-record decoder (`percentDecodeToBuffer`, private to T-16);
// this file needs the same byte-for-byte rule applied to `lib-probe.sh`'s OWN result fields
// (TSPEC §11.2), which is a different data shape (rendered message text, always intended as a
// JS string for regex matching against `MESSAGES`, never a `Buffer`) — a small, self-contained
// decoder here duplicates no exported symbol.
function percentDecode(field) {
  return field.replace(/%([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Mirrors `driftProbe.js`'s own (private) `PROBE_PATH_TOOLS` — C1's probe functions
// (`pdlc_probe_json_tool`, `pdlc_probe_hash_tool`, `pdlc_sha1`, …) need these resolvable even
// though `lib-probe.sh` itself only strictly needs `bash`. `runProbe`'s own default env already
// carries this set; a custom env is only built below where `CLAUDE_PLUGIN_ROOT` must be added or
// deliberately withheld, since `opts.env` replaces the constructed sandbox wholesale.
const PROBE_PATH_TOOLS = Object.freeze([
  "bash",
  "git",
  "python3",
  "shasum",
  "sha1sum",
  "mv",
  "rm",
  "date",
  "printf",
]);

function buildEnv(cwd, pluginRoot) {
  return {
    PATH: makeToolDir(PROBE_PATH_TOOLS),
    HOME: mkdtempSync(join(tmpdir(), "pdlc-msg-home-")),
    PWD: cwd,
    TMPDIR: tmpdir(),
    LC_ALL: "C",
    LANG: "C",
    TZ: "UTC",
    ...(pluginRoot ? { CLAUDE_PLUGIN_ROOT: pluginRoot } : {}),
  };
}

/**
 * One probe call for a message function whose `{cmd}` substitution needs no resolved plugin
 * root (W-1, W-2) — the default sandbox env suffices, so no fixture-specific env/cwd is passed.
 */
function renderPlain(fnCase) {
  const [result] = runProbe([fnCase]);
  if (!result.ok) {
    throw new Error(
      `driftMessages: probe returned err for "${fnCase}": ${result.fields.join(",")}`
    );
  }
  const [status, ...fields] = result.fields;
  return { status: Number(status), text: percentDecode(fields[0] ?? "") };
}

/**
 * Resolves repo root + plugin root against `env`/`cwd`, then runs `fnCase` in the SAME probe
 * session (TSPEC §2.2 — `PDLC_PLUGIN_ROOT` is a variable C1 populates as a side effect, read by
 * a later call in the same sourced shell), returning only `fnCase`'s result. Used for W-3/W-4/
 * W-5 (whose `{cmd}` needs the resolved sync path) and for `pdlc_sync_command` itself.
 */
function renderWithPluginRoot(fnCase, env, cwd) {
  const [repoRootResult, pluginRootResult, msgResult] = runProbe(
    ["pdlc_resolve_repo_root", "pdlc_resolve_plugin_root", fnCase],
    { env, cwd }
  );
  if (!repoRootResult.ok || !pluginRootResult.ok) {
    throw new Error(
      `driftMessages: could not resolve repo/plugin root ahead of "${fnCase}" ` +
        `(repoRoot ok=${repoRootResult.ok}, pluginRoot ok=${pluginRootResult.ok})`
    );
  }
  if (!msgResult.ok) {
    throw new Error(
      `driftMessages: probe returned err for "${fnCase}": ${msgResult.fields.join(",")}`
    );
  }
  const [status, ...fields] = msgResult.fields;
  return { status: Number(status), text: percentDecode(fields[0] ?? "") };
}

/**
 * `distinct(a, b)` (TSPEC §7.2 / FSPEC §8.2) asserted pairwise over every member of `labelled`,
 * an object mapping a human-readable label to its rendered text. Throws with both offending
 * labels and texts on the first violation (AT-30).
 */
function expectAllPairwiseDistinct(labelled) {
  const entries = Object.entries(labelled);
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [labelA, textA] = entries[i];
      const [labelB, textB] = entries[j];
      if (!distinct(textA, textB)) {
        throw new Error(
          `driftMessages: "${labelA}" and "${labelB}" are not pairwise distinct ` +
            `(AT-30, FSPEC §8.2):\n  ${labelA}: ${JSON.stringify(textA)}\n  ` +
            `${labelB}: ${JSON.stringify(textB)}`
        );
      }
    }
  }
}

const BACKUP_DIR_REL = [".claude", "workflows", ".pdlc-backups"];

describe("driftMessages — AT-30 and §14.1 M-1 (TSPEC §7.2, §7.4; FSPEC §8)", () => {
  let pluginTree;
  let consumerTree;
  let env;
  let SYNC_CMD;

  beforeAll(() => {
    pluginTree = makePluginTree();
    consumerTree = makeConsumerTree({ git: true });
    env = buildEnv(consumerTree.root, pluginTree.pluginRoot);

    const resolved = renderWithPluginRoot("pdlc_sync_command", env, consumerTree.root);
    SYNC_CMD = resolved.text;
    if (resolved.status !== 0 || !SYNC_CMD) {
      throw new Error(
        "driftMessages: setup could not resolve SYNC_CMD via pdlc_sync_command — every " +
          "expectRemediationClass call in this file needs it (TSPEC §7.4)"
      );
    }
  });

  afterAll(() => {
    pluginTree.cleanup();
    consumerTree.cleanup();
  });

  describe("AT-30 — pairwise distinct() over S1, S2, S3 (FSPEC §8.2)", () => {
    it("S1 — the six row-state messages are pairwise distinct", () => {
      const stale = renderWithPluginRoot("pdlc_msg_w5\trow-a\tstale", env, consumerTree.root).text;
      const missing = renderWithPluginRoot(
        "pdlc_msg_w5\trow-b\tmissing",
        env,
        consumerTree.root
      ).text;
      const localEdit = renderWithPluginRoot(
        `pdlc_msg_w4\trow-c\t${join(consumerTree.root, ...BACKUP_DIR_REL)}`,
        env,
        consumerTree.root
      ).text;
      const unverified = renderWithPluginRoot("pdlc_msg_w3\trow-d", env, consumerTree.root).text;
      const unknownHash = renderPlain("pdlc_msg_w2\trow-e\thash-tool-absent").text;
      const unknownMissing = renderPlain("pdlc_msg_w2\trow-f\tplugin-artifact-missing").text;

      expectAllPairwiseDistinct({
        "W-5 stale": stale,
        "W-5 missing": missing,
        "W-4 local-edit": localEdit,
        "W-3 unverified": unverified,
        "W-2 unknown/hash-tool-absent": unknownHash,
        "W-2 unknown/plugin-artifact-missing": unknownMissing,
      });
    });

    it("S2 — W-2 rendered for each of the four row reasons is pairwise distinct", () => {
      const reasons = [
        "hash-tool-absent",
        "plugin-artifact-missing",
        "plugin-artifact-unreadable",
        "consumer-artifact-unreadable",
      ];
      const rendered = {};
      reasons.forEach((reason, i) => {
        rendered[`W-2/${reason}`] = renderPlain(`pdlc_msg_w2\trow-${i}\t${reason}`).text;
      });
      expectAllPairwiseDistinct(rendered);
    });

    it(
      "S3 — W-1 over the seven §2.1-produced baseline reasons is pairwise distinct, and " +
        "distinct from every S1 member",
      () => {
        const baselineReasons = [
          "manifest-absent",
          "manifest-malformed",
          "manifest-empty",
          "plugin-root-unset",
          "plugin-root-unreadable",
          "repo-root-unresolved",
          "json-tool-absent",
        ];
        const rendered = {};
        baselineReasons.forEach((reason) => {
          rendered[`W-1/${reason}`] = renderPlain(`pdlc_msg_w1\t${reason}`).text;
        });

        // S1's members, re-rendered here rather than shared across `it()`s (TDD "Isolated"
        // rule — no `it()` depends on another's execution order); each is a cheap
        // single-line probe call.
        rendered["S1/W-5 stale"] = renderWithPluginRoot(
          "pdlc_msg_w5\trow-a\tstale",
          env,
          consumerTree.root
        ).text;
        rendered["S1/W-5 missing"] = renderWithPluginRoot(
          "pdlc_msg_w5\trow-b\tmissing",
          env,
          consumerTree.root
        ).text;
        rendered["S1/W-4 local-edit"] = renderWithPluginRoot(
          `pdlc_msg_w4\trow-c\t${join(consumerTree.root, ...BACKUP_DIR_REL)}`,
          env,
          consumerTree.root
        ).text;
        rendered["S1/W-3 unverified"] = renderWithPluginRoot(
          "pdlc_msg_w3\trow-d",
          env,
          consumerTree.root
        ).text;
        rendered["S1/W-2 unknown/hash-tool-absent"] = renderPlain(
          "pdlc_msg_w2\trow-e\thash-tool-absent"
        ).text;
        rendered["S1/W-2 unknown/plugin-artifact-missing"] = renderPlain(
          "pdlc_msg_w2\trow-f\tplugin-artifact-missing"
        ).text;

        expectAllPairwiseDistinct(rendered);

        // Deliberately NOT asserted here: S3's eighth member (the §6.3 Manifest-level line
        // for `drift-state-invalidated`) — see the file header note. M-3
        // (`driftBaseline.test.js`, T-21) is where that member's distinctness and
        // reason→class pairing are asserted, at its actual (JS-side) rendering site.
      }
    );
  });

  describe("§14.1 M-1 — the four AC-2.5 row reasons → their remediation class", () => {
    it("hash-tool-absent → environment (install a hash utility, never a sync fix)", () => {
      const { text } = renderPlain("pdlc_msg_w2\trow-hash\thash-tool-absent");
      const { remediation } = MESSAGES["W-2"].exec(text).groups;
      expectRemediationClass(remediation, "environment", { syncCmd: SYNC_CMD });
    });

    it(
      "plugin-artifact-missing → pluginUpdate (the plugin, not the consumer, is missing " +
        "the file — copying it is impossible)",
      () => {
        const { text } = renderPlain("pdlc_msg_w2\trow-missing\tplugin-artifact-missing");
        const { remediation } = MESSAGES["W-2"].exec(text).groups;
        expectRemediationClass(remediation, "pluginUpdate", { syncCmd: SYNC_CMD });
      }
    );

    it(
      "plugin-artifact-unreadable → permissions (AC-2.5: neither a sync nor a plugin update)",
      () => {
        const { text } = renderPlain("pdlc_msg_w2\trow-punreadable\tplugin-artifact-unreadable");
        const { remediation } = MESSAGES["W-2"].exec(text).groups;
        expectRemediationClass(remediation, "permissions", { syncCmd: SYNC_CMD });
      }
    );

    it("consumer-artifact-unreadable → permissions (same class, same exclusions)", () => {
      const { text } = renderPlain(
        "pdlc_msg_w2\trow-cunreadable\tconsumer-artifact-unreadable"
      );
      const { remediation } = MESSAGES["W-2"].exec(text).groups;
      expectRemediationClass(remediation, "permissions", { syncCmd: SYNC_CMD });
    });
  });

  describe("the <pluginRoot>-expanded syncCommand and its null fallback (AC-0.4, AC-4.2)", () => {
    it(
      "expands to the real, unquoted, unbraced sync-workflows.sh path when the plugin root " +
        "resolves",
      () => {
        expect(SYNC_CMD).toBe(join(pluginTree.pluginRoot, "hooks", "scripts", "sync-workflows.sh"));
        expect(SYNC_CMD).not.toMatch(/\$/);
        expect(SYNC_CMD).not.toMatch(/\{/);
      }
    );

    it("W-5's own {cmd} capture is byte-equal to the resolved syncCommand on the same tree", () => {
      const { text } = renderWithPluginRoot("pdlc_msg_w5\trow-g\tstale", env, consumerTree.root);
      const { cmd } = MESSAGES["W-5"].exec(text).groups;
      expect(cmd).toBe(SYNC_CMD);
    });

    it(
      "falls back to unresolved (exit 1, empty stdout) when <pluginRoot> does not resolve " +
        "(FSPEC §1.3's syncCommand: null rule)",
      () => {
        // CLAUDE_PLUGIN_ROOT deliberately absent — no maintainer marker exists under
        // `consumerTree.root` either (it is a fresh fixture tree, not this repo), so
        // `pdlc_resolve_plugin_root` has no branch left to resolve from (FSPEC §2.4).
        const noPluginRootEnv = buildEnv(consumerTree.root, undefined);
        const [repoRootResult, pluginRootResult, syncResult] = runProbe(
          ["pdlc_resolve_repo_root", "pdlc_resolve_plugin_root", "pdlc_sync_command"],
          { env: noPluginRootEnv, cwd: consumerTree.root }
        );
        expect(repoRootResult.ok).toBe(true);
        expect(pluginRootResult.ok).toBe(true);
        expect(syncResult.ok).toBe(true);

        const [status, text] = syncResult.fields;
        expect(Number(status)).toBe(1);
        expect(text ?? "").toBe("");
      }
    );
  });
});
