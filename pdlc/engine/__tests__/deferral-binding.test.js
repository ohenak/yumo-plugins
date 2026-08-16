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
