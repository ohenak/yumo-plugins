// Populates `$PDLC_HOME/versions/<version>/` from the installed npm
// package's own tree (TSPEC §9.2, PROP-INSTALL-1, PROP-INSTALL-2). Additive:
// entries already present under `storeRoot` for other versions are never
// read or written. Takes no consumer-project path at all, so
// PROP-INSTALL-2's "reads and writes no consumer path" is structural.
//
// `install(fs, { packageRoot, storeRoot, version })
//   -> { resolvedVersion: string, resolvedStoreEntry: string }`
//
// `fs` is the injected seam: `readdirSync(dir, {withFileTypes}?)`,
// `readFileSync(path)`, `existsSync(path)`, `mkdirSync(path,
// {recursive}?)`, `writeFileSync(path, data)`.

import path from "node:path";
import nodeFs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

function copyTree(fs, srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(fs, srcPath, destPath);
    } else {
      const content = fs.readFileSync(srcPath);
      fs.writeFileSync(destPath, content);
    }
  }
}

export async function install(fs, { packageRoot, storeRoot, version }) {
  const resolvedStoreEntry = path.join(storeRoot, version);
  copyTree(fs, packageRoot, resolvedStoreEntry);
  return { resolvedVersion: version, resolvedStoreEntry };
}

// npm's postinstall hook runs this file as the entry script (`node
// scripts/postinstall.mjs`); only that caller may touch the real
// filesystem. The argv guard keeps a test-suite `import()` of `install`
// side-effect-free (postinstall.test.js imports lazily and records every
// read/write through its injected fs seam).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { storeRootFrom } = await import("../bin/cli.mjs");
  const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const { version } = JSON.parse(
    nodeFs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
  );
  const { resolvedStoreEntry } = await install(nodeFs, {
    packageRoot,
    storeRoot: storeRootFrom(),
    version,
  });
  console.log(`pdlc-engine ${version} installed to ${resolvedStoreEntry}`);
}
