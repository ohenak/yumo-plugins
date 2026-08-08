#!/usr/bin/env node
// pdlc-engine CLI skeleton (Phase 0: pdlc-headless-engine).
// Deliberately skeletal — no workflow-module imports yet.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
);

const [, , cmd] = process.argv;

async function cmdHello() {
  console.log(`pdlc-engine v${pkg.version}`);
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

async function main() {
  switch (cmd) {
    case "hello":
      await cmdHello();
      break;
    case "spike:sdk":
      await cmdSpikeSdk();
      break;
    default:
      console.error(`Usage: pdlc <hello|spike:sdk>`);
      console.error(`Unknown command: ${cmd ?? "(none)"}`);
      process.exitCode = 1;
  }
}

main();
