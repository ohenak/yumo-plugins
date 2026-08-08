#!/usr/bin/env node
// pdlc-engine CLI skeleton (Phase 0: pdlc-headless-engine).
// Deliberately skeletal — no workflow-module imports yet.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { resolvePluginRoot, loadSkill, PLUGIN_ROOT_ENV } from "../lib/skills.mjs";
import { readPluginVersion, checkCompat, buildBanner } from "../lib/handshake.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
);

const [, , cmd, ...rest] = process.argv;

/** `--plugin-root <path>` / `--plugin-root=<path>`; null when absent. */
function pluginRootFlag(argv) {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--plugin-root") return argv[i + 1] ?? "";
    if (argv[i].startsWith("--plugin-root=")) return argv[i].slice("--plugin-root=".length);
  }
  return null;
}

/** The 17 prompt files a full pipeline can dispatch (15 skills + 2 supplements). */
const EXPECTED_SKILLS = [
  "consolidate-learnings",
  "dod-verify",
  "harvest-learnings",
  "orchestrate-dev",
  "orchestrate-queue",
  "pm-author",
  "pm-review",
  "se-author",
  "se-implement",
  "se-implement:SKILL-typescript.md",
  "se-implement:SKILL-python.md",
  "se-review",
  "ship-pr",
  "te-author",
  "te-review",
  "tech-lead",
  "tech-lead-python",
];

async function cmdHello() {
  console.log(`pdlc-engine v${pkg.version}`);
  console.log(
    "transport: Claude Agent SDK (primary), headless `claude -p` fallback declared; " +
      'requires apiKeySource "none" at dispatch (fail-closed, subscription-first).'
  );
}

async function cmdSpikeSdk() {
  const prompt = "Reply with exactly: HELLO-PDLC-SPIKE";
  console.log("[spike:sdk] importing @anthropic-ai/claude-agent-sdk ...");

  let sdk;
  try {
    sdk = await import("@anthropic-ai/claude-agent-sdk");
  } catch (err) {
    console.error("[spike:sdk] IMPORT FAILED");
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 1;
    return;
  }

  const { query } = sdk;
  console.log("[spike:sdk] import OK. Calling query() with:", {
    prompt,
    options: { model: "haiku", maxTurns: 1 },
  });

  try {
    const stream = query({
      prompt,
      options: { model: "haiku", maxTurns: 1 },
    });

    let messageIndex = 0;
    for await (const message of stream) {
      console.log(
        `[spike:sdk] message[${messageIndex++}] type=${message.type}`
      );
      console.log(JSON.stringify(message, null, 2));
    }
    console.log("[spike:sdk] stream complete, no throw.");
  } catch (err) {
    console.error("[spike:sdk] QUERY THREW");
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 1;
  }
}

/**
 * `pdlc doctor` — resolve the plugin, run the C-10 handshake, print the banner
 * and a per-check PASS/FAIL table, exit non-zero on any failure. It dispatches
 * NOTHING: no transport is constructed and no model is contacted, so it is safe
 * to run on a machine with no auth at all.
 */
async function cmdDoctor() {
  const checks = [];
  const record = (name, ok, detail) => checks.push({ name, ok, detail });

  const resolution = resolvePluginRoot({ override: pluginRootFlag(rest) });
  record(
    "plugin resolved",
    resolution.ok,
    resolution.ok ? `${resolution.root}  [via ${resolution.source}]` : resolution.reason
  );

  let version = null;
  if (resolution.ok) {
    const read = readPluginVersion(resolution.root);
    record("plugin manifest readable", read.ok, read.ok ? read.manifestPath : read.reason);
    if (read.ok) version = read.version;
  } else {
    record("plugin manifest readable", false, "skipped — no plugin root");
  }

  const compat = checkCompat(pkg.pdlcPluginCompat, version);
  record(
    "version handshake (C-10)",
    compat.ok,
    compat.ok
      ? `plugin ${compat.pluginVersion} satisfies engine range ${compat.range}`
      : compat.reason
  );

  if (resolution.ok) {
    const missing = [];
    for (const skill of EXPECTED_SKILLS) {
      try {
        loadSkill(resolution.root, skill);
      } catch (err) {
        missing.push(`${skill} (${err.message})`);
      }
    }
    record(
      `skill prompts readable (${EXPECTED_SKILLS.length - missing.length}/${EXPECTED_SKILLS.length})`,
      missing.length === 0,
      missing.length === 0 ? "all present and non-empty" : missing.join("; ")
    );
  } else {
    record("skill prompts readable", false, "skipped — no plugin root");
  }

  for (const line of buildBanner({
    engineVersion: pkg.version,
    pluginVersion: version,
    pluginRoot: resolution.root,
    pluginCompat: pkg.pdlcPluginCompat,
    apiKeyPolicy: ["none"],
    baseUrl: process.env.ANTHROPIC_BASE_URL,
  })) {
    console.log(line);
  }

  console.log("");
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}`);
    if (c.detail) console.log(`      ${c.detail}`);
  }

  const failed = checks.filter((c) => !c.ok);
  console.log("");
  if (failed.length === 0) {
    console.log("doctor: all checks passed. No dispatch was performed.");
  } else {
    console.log(
      `doctor: ${failed.length} check(s) failed — the engine would refuse to dispatch. ` +
        `Override the plugin root with --plugin-root <path> or ${PLUGIN_ROOT_ENV}=<path>.`
    );
    process.exitCode = 1;
  }
}

async function main() {
  switch (cmd) {
    case "hello":
      await cmdHello();
      break;
    case "spike:sdk":
      await cmdSpikeSdk();
      break;
    case "doctor":
      await cmdDoctor();
      break;
    default:
      console.error(`Usage: pdlc <hello|doctor|spike:sdk> [--plugin-root <path>]`);
      console.error(`Unknown command: ${cmd ?? "(none)"}`);
      process.exitCode = 1;
  }
}

main();
