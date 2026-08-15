#!/usr/bin/env node
// TSPEC §5.2 — build-time vendoring. Runs on `npm pack` / `npm publish` via
// npm's `prepack` lifecycle (package.json `scripts.prepack`). Does exactly
// three things: delete + recreate `vendor/workflows/`, copy the two
// canonical workflow modules into it byte-for-byte, and write a
// `VENDOR-MANIFEST.json` recording each copy's source path and SHA-256 plus
// the engine version the copy was made for (AF-2).

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(ENGINE_ROOT, "..", "..");
const SOURCE_DIR = path.join(REPO_ROOT, "pdlc", "workflows");
const VENDOR_DIR = path.join(ENGINE_ROOT, "vendor", "workflows");

const MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function readEngineVersion() {
  const pkg = JSON.parse(readFileSync(path.join(ENGINE_ROOT, "package.json"), "utf8"));
  return pkg.version;
}

export function runPrepack({
  sourceDir = SOURCE_DIR,
  vendorDir = VENDOR_DIR,
  engineVersion = readEngineVersion(),
} = {}) {
  rmSync(vendorDir, { recursive: true, force: true });
  mkdirSync(vendorDir, { recursive: true });

  const modules = MODULE_NAMES.map((name) => {
    const sourcePath = path.join(sourceDir, name);
    const bytes = readFileSync(sourcePath);
    copyFileSync(sourcePath, path.join(vendorDir, name));
    return {
      name,
      source: `pdlc/workflows/${name}`,
      sha256: sha256(bytes),
    };
  });

  const manifest = { engineVersion, modules };

  writeFileSync(
    path.join(vendorDir, "VENDOR-MANIFEST.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  return manifest;
}

const isMain = existsSync(process.argv[1] ?? "") &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  runPrepack();
}
