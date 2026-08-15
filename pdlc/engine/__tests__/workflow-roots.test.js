// T11 [red] — the two-root workflow-module resolver (TSPEC §5.2, PROP-PACK-6,
// PROP-PACK-8; AT-2.1, AT-3.8b).
//
// `WORKFLOW_MODULE_URLS` at HEAD is a frozen object built once, relative to
// this repo checkout only (run.mjs:52-55). This file exercises the resolver
// it becomes: two fixed-order candidate roots — the vendor root (an
// installed/packed tree) first, the checkout root (today's arrangement)
// second — with a fs seam (`{ existsSync }`, same injection shape
// `resolvePluginRoot` already uses in `lib/skills.mjs`) so every case is
// offline and does not depend on `pdlc/engine/vendor/workflows/` actually
// existing on disk.
//
// Two exports are exercised:
//   - `resolveWorkflowRoot({ fs })` — the shared root decision. Returns
//     `{ source: "vendor" | "checkout", rootPath, tried }` when a root
//     resolves; `tried` lists both candidates in resolution order for a
//     legible refusal, and the `source` is what an announcement banner reads
//     when both roots exist (TSPEC §7.3, E-04's spirit). Throws when neither
//     resolves, naming both absolute paths tried.
//   - `workflowModulePath(name, { fs })` — PROP-PACK-6's exact-path-equality
//     surface: the per-module absolute path built from the resolved root.
//
// Root existence is both-members: a root "exists" only when it holds both
// `orchestrate-dev.js` and `orchestrate-queue.js` — vendoring copies both
// files atomically (TSPEC §5.2 step 3), so a root with only one member is
// not a resolvable candidate.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

// T41 landed: `resolveWorkflowRoot` now exists, statically imported below
// alongside `workflowModulePath`.
import { resolveWorkflowRoot, workflowModulePath } from "../lib/run.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot)); // .../pdlc/engine -> repo root

const VENDOR_ROOT = path.join(engineRoot, "vendor", "workflows");
const CHECKOUT_ROOT = path.join(repoRoot, "pdlc", "workflows");

const MODULE_FILES = {
  dev: "orchestrate-dev.js",
  queue: "orchestrate-queue.js",
};

/** A fake fs surface over a fixed set of "existing" absolute paths. */
function fakeFs(existingPaths) {
  const existing = new Set(existingPaths);
  return { existsSync: (p) => existing.has(p) };
}

function rootFiles(root) {
  return [path.join(root, MODULE_FILES.dev), path.join(root, MODULE_FILES.queue)];
}

// ─── PROP-PACK-8: fixed order, vendor root wins ────────────────────────────

test("T41: resolveWorkflowRoot prefers the vendor root when only the vendor root resolves", async () => {
  const fs = fakeFs(rootFiles(VENDOR_ROOT));
  const result = resolveWorkflowRoot({ fs });
  assert.equal(result.source, "vendor");
  assert.equal(result.rootPath, VENDOR_ROOT);
});

test("T41: resolveWorkflowRoot falls back to the checkout root when only the checkout root resolves", async () => {
  const fs = fakeFs(rootFiles(CHECKOUT_ROOT));
  const result = resolveWorkflowRoot({ fs });
  assert.equal(result.source, "checkout");
  assert.equal(result.rootPath, CHECKOUT_ROOT);
});

test("T41: resolveWorkflowRoot picks the vendor root over the checkout root when both resolve, and announces which root loaded (TSPEC §7.3)", async () => {
  const fs = fakeFs([...rootFiles(VENDOR_ROOT), ...rootFiles(CHECKOUT_ROOT)]);
  const result = resolveWorkflowRoot({ fs });
  // Root 1 wins (positive: it is the vendor root, not merely "not checkout").
  assert.equal(result.source, "vendor");
  assert.equal(result.rootPath, VENDOR_ROOT);
  // The ambiguity is never silent: both candidates are recorded, in the
  // fixed order the table specifies, each with its own resolved state.
  assert.deepEqual(
    result.tried.map((c) => c.source),
    ["vendor", "checkout"],
  );
  assert.equal(result.tried[0].root, VENDOR_ROOT);
  assert.equal(result.tried[0].exists, true);
  assert.equal(result.tried[1].root, CHECKOUT_ROOT);
  assert.equal(result.tried[1].exists, true);
});

test("T41: resolveWorkflowRoot tries the vendor root before the checkout root even when only the checkout root resolves", async () => {
  const fs = fakeFs(rootFiles(CHECKOUT_ROOT));
  const result = resolveWorkflowRoot({ fs });
  assert.deepEqual(
    result.tried.map((c) => c.root),
    [VENDOR_ROOT, CHECKOUT_ROOT],
  );
  assert.equal(result.tried[0].exists, false);
  assert.equal(result.tried[1].exists, true);
});

// ─── PROP-PACK-8: refusal when neither root resolves ───────────────────────

test("T41: resolveWorkflowRoot refuses when neither root resolves, naming both paths tried", async () => {
  const fs = fakeFs([]);
  assert.throws(
    () => resolveWorkflowRoot({ fs }),
    (err) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes(VENDOR_ROOT), `expected message to name ${VENDOR_ROOT}`);
      assert.ok(err.message.includes(CHECKOUT_ROOT), `expected message to name ${CHECKOUT_ROOT}`);
      return true;
    },
  );
});

test("T41: resolveWorkflowRoot refuses on a partially-vendored root (one member missing is not a resolvable root)", async () => {
  // Only orchestrate-dev.js landed under the vendor root; the copy step is
  // atomic per TSPEC §5.2 step 3, so a lone member must not be treated as a
  // resolved vendor root.
  const fs = fakeFs([path.join(VENDOR_ROOT, MODULE_FILES.dev)]);
  assert.throws(() => resolveWorkflowRoot({ fs }));
});

test("T41: workflowModulePath refuses (does not dispatch a partial path) when neither root resolves", () => {
  const fs = fakeFs([]);
  assert.throws(() => workflowModulePath("dev", { fs }));
  assert.throws(() => workflowModulePath("queue", { fs }));
});

// ─── PROP-PACK-6: exact-path equality under two roots ──────────────────────

// Carve-out: current single-root `workflowModulePath` always resolves to the
// checkout path regardless of the (as-yet-unused) `fs` argument, so this
// assertion is satisfiable in the red wave and stays un-skipped.
test("workflowModulePath equals the checkout path exactly when the vendor root is absent (PROP-PACK-6)", () => {
  const fs = fakeFs(rootFiles(CHECKOUT_ROOT));
  assert.equal(workflowModulePath("dev", { fs }), path.join(CHECKOUT_ROOT, MODULE_FILES.dev));
  assert.equal(workflowModulePath("queue", { fs }), path.join(CHECKOUT_ROOT, MODULE_FILES.queue));
});

test("T41: workflowModulePath equals the vendor root's path exactly when the vendor root resolves (PROP-PACK-6)", () => {
  const fs = fakeFs(rootFiles(VENDOR_ROOT));
  assert.equal(workflowModulePath("dev", { fs }), path.join(VENDOR_ROOT, MODULE_FILES.dev));
  assert.equal(workflowModulePath("queue", { fs }), path.join(VENDOR_ROOT, MODULE_FILES.queue));
});

test("T41: workflowModulePath equals the vendor root's path exactly, not merely 'starts with it', when both roots resolve (AF-3)", () => {
  const fs = fakeFs([...rootFiles(VENDOR_ROOT), ...rootFiles(CHECKOUT_ROOT)]);
  const dev = workflowModulePath("dev", { fs });
  assert.equal(dev, path.join(VENDOR_ROOT, MODULE_FILES.dev));
  assert.notEqual(dev, path.join(CHECKOUT_ROOT, MODULE_FILES.dev));
});

// Carve-out: `workflowModulePath` already throws for an unrecognised module
// name today, independent of any root/fs concern — satisfiable in the red
// wave and stays un-skipped.
test("workflowModulePath throws for an unknown module name regardless of root resolution", () => {
  const fs = fakeFs([...rootFiles(VENDOR_ROOT), ...rootFiles(CHECKOUT_ROOT)]);
  assert.throws(() => workflowModulePath("nonexistent", { fs }));
});
