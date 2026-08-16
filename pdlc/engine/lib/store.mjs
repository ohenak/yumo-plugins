// Version store: enumerates installed versions under a store root and maps
// a version string to its install root. TSPEC §6.1, PROP-VER-11, AT-5.5.

import path from "node:path";
import { parseVersion, compare } from "./handshake.mjs";

/**
 * List the versions installed under `root`, using the injected `fs`
 * (`readdirSync`, `statSync`) rather than the real filesystem directly —
 * see TSPEC §10.1 S-1.
 *
 * Returns `{ versions, skipped }`:
 *   - `versions` is every directory entry whose name parses as a version
 *     (via handshake.mjs's `parseVersion`), sorted ascending via `compare`.
 *   - `skipped` is `{ name, reason }` for every directory entry whose name
 *     does not parse — a positive report, not a silent filter
 *     (PROP-VER-11).
 * Non-directory entries are excluded from both lists without being
 * reported: they are not version entries at all.
 * A missing store root reads as an empty store, never a throw
 * (TSPEC §6.3 ladder branch 7).
 */
export function listVersions(fs, root) {
  let names;
  try {
    names = fs.readdirSync(root);
  } catch (err) {
    if (err && err.code === "ENOENT") return { versions: [], skipped: [] };
    throw err;
  }

  const parsed = [];
  const skipped = [];
  for (const name of names) {
    const entryPath = path.join(root, name);
    if (!fs.statSync(entryPath).isDirectory()) continue;
    const version = parseVersion(name);
    if (version) {
      parsed.push({ name, version });
    } else {
      skipped.push({ name, reason: `"${name}" is not a parseable semver version` });
    }
  }

  parsed.sort((a, b) => compare(a.version, b.version));
  return { versions: parsed.map((p) => p.name), skipped };
}

/**
 * Pure path mapping from a version string to its install root under
 * `root`. Does not consult the fs or validate that the version is
 * installed — presence validation is the resolution ladder's job.
 */
export function rootFor(root, version) {
  return path.join(root, version);
}

/**
 * S-4 `UpdateProbe` seam (TSPEC §10.1 S-4, PROP-VER-12). The shipped inert
 * default: conforms to the `latestPublished()` protocol on its own, but
 * `checkForUpdate` never invokes it unless a probe is explicitly injected —
 * offline is the *default* behaviour, not a stub of it.
 */
export const NO_PROBE = {
  async latestPublished() {
    return { unavailable: true, reason: "no update probe is configured" };
  },
};

/**
 * Composes the S-4 probe. With nothing injected, returns `NO_PROBE`'s
 * inert result without ever calling `NO_PROBE.latestPublished()` (PROP-VER-12)
 * — no network seam is reached for, so this stays offline with no
 * stub-of-a-network needed (AC-5.1). With a probe injected, calls it exactly
 * once and passes its result (either arm of the union) through unchanged.
 */
export async function checkForUpdate({ probe } = {}) {
  if (!probe) {
    return { unavailable: true, reason: "no update probe is configured" };
  }
  return probe.latestPublished();
}
