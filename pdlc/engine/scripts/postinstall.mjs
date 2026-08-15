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
