// Deferral-binding oracle (CODE_REVIEW v4 §3-3).
//
// A prose backlog file is explicitly not a successor: deferred work is bound
// only by a `docs/_queue/QUEUE.md` row or a successor REQ. `docs/ideas/*.md`
// is where self-declared "ideas only — not built" files land, so every tracked
// member of that directory must be named by the queue (row or prose note) or
// by a REQ under `docs/`. Otherwise the file is an unbound deferral riding on
// whichever branch happened to add it.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..", "..");
const QUEUE_PATH = "docs/_queue/QUEUE.md";

function trackedFiles(...pathspec) {
  const out = execFileSync("git", ["ls-files", "--", ...pathspec], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

test("§3-3: every tracked docs/ideas backlog file is bound by a QUEUE.md row or a successor REQ", () => {
  const ideas = trackedFiles("docs/ideas/*.md");
  if (ideas.length === 0) return; // nothing deferred this way — vacuously bound

  const binders = [QUEUE_PATH, ...trackedFiles("docs/*/REQ-*.md")];
  const binderText = binders.map((rel) => readFileSync(path.join(REPO_ROOT, rel), "utf8"));

  for (const rel of ideas) {
    const bound = binderText.some((text) => text.includes(rel));
    assert.ok(
      bound,
      `${rel} is an unbound deferral: no ${QUEUE_PATH} row and no REQ under docs/ names it. ` +
        `Bind it with a queue row (or a successor REQ), or move it off the branch that added it.`,
    );
  }
});

// §3-1: the README's "successor tag not yet cut" caveat is itself a deferral — the same
// unbound-deferral shape as the docs/ideas backlog above, just carried in prose instead of a
// tracked file. If that caveat is still present, the queue row and release-checklist section
// that bind it (CODE_REVIEW v5 §3-1) must be present too; removing the binder while the caveat
// stays would silently re-open the finding this test was added to close.
test("§3-1: the engine README's successor-tag caveat stays bound to a QUEUE.md row and a RELEASE-CHECKLIST section", () => {
  const readmePath = "pdlc/README.md";
  const readmeText = readFileSync(path.join(REPO_ROOT, readmePath), "utf8");
  const caveatPresent = readmeText.includes("successor tag is cut");
  if (!caveatPresent) return; // caveat resolved (tag cut, prose updated) — nothing left to bind

  const queueText = readFileSync(path.join(REPO_ROOT, QUEUE_PATH), "utf8");
  assert.ok(
    queueText.includes("pdlc-engine-v0.2.0-release"),
    `${readmePath} still discloses the unbound successor-tag caveat, but ${QUEUE_PATH} no longer ` +
      `carries the "pdlc-engine-v0.2.0-release" row that binds it (CODE_REVIEW v5 §3-1). Re-add the ` +
      `row, or update the README caveat once the tag is actually cut.`,
  );

  const checklistPath = "pdlc/RELEASE-CHECKLIST.md";
  const checklistText = readFileSync(path.join(REPO_ROOT, checklistPath), "utf8");
  assert.ok(
    checklistText.includes("engine-v0.2.0"),
    `${readmePath} still discloses the unbound successor-tag caveat, but ${checklistPath} no longer ` +
      `carries the engine-channel section naming the "engine-v0.2.0" tag cut (CODE_REVIEW v5 §3-1). ` +
      `Re-add the section, or update the README caveat once the tag is actually cut.`,
  );
});
