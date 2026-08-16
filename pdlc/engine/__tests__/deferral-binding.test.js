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
import { existsSync, readFileSync } from "node:fs";
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

const CHECKLIST_PATH = "pdlc/RELEASE-CHECKLIST.md";

/** The body of a `## N. …` heading in a markdown file, up to the next same-or-higher heading. */
function markdownSection(text, headingRe) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => headingRe.test(l));
  assert.notEqual(start, -1, `expected a heading matching ${headingRe}`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,2}\s/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

// §3-2 (CODE_REVIEW v6): a binding is only as good as the act it names. Both binder documents
// instruct an operator to verify a workflow file; a path that does not resolve sends that
// operator looking for a file this repo does not have, and the two halves of one binding
// disagreeing is worse than either being silent.
test("§3-2: every workflow path the binder documents name resolves in this repo", () => {
  for (const rel of [QUEUE_PATH, CHECKLIST_PATH]) {
    const text = readFileSync(path.join(REPO_ROOT, rel), "utf8");
    for (const m of text.matchAll(/`([\w./-]*\.github\/workflows\/[\w.-]+\.ya?ml)`/g)) {
      assert.ok(
        existsSync(path.join(REPO_ROOT, m[1])),
        `${rel} names \`${m[1]}\`, which does not exist. Workflow files live at the repo root's ` +
          `.github/workflows/ — an operator following this instruction would find nothing ` +
          `(CODE_REVIEW v6 §3-2).`,
      );
    }
  }
});

// §3-3 (CODE_REVIEW v6): the release-checklist section that discharges the successor-tag
// deferral must schedule the whole act. `version-skew.test.js` harvests published versions from
// tracked EVIDENCE-*.md files and requires HEAD's manifest to be strictly ahead of every one, so
// recording the publish (BR-3.9/T52's precedent) without bumping the manifest in the same change
// turns the engine suite red on the default branch. Both steps are named here or the ratchet is
// discovered instead of planned.
test("§3-3: RELEASE-CHECKLIST §7 schedules the publish evidence and the follow-on version bump", () => {
  const readmeText = readFileSync(path.join(REPO_ROOT, "pdlc/README.md"), "utf8");
  if (!readmeText.includes("successor tag is cut")) return; // deferral discharged — nothing to schedule

  const checklistText = readFileSync(path.join(REPO_ROOT, CHECKLIST_PATH), "utf8");
  const section = markdownSection(checklistText, /^##\s+7\.\s+Engine channel\b/);

  assert.match(
    section,
    /EVIDENCE-[\w.-]+\.md/,
    `${CHECKLIST_PATH} §7 must name the tracked EVIDENCE-*.md record for the publish, the way ` +
      `engine-v0.1.0's was recorded (BR-3.9/T52). Cutting the tag without scheduling the ` +
      `evidence leaves the publish unrecorded (CODE_REVIEW v6 §3-3).`,
  );

  // The bump target is derived from the manifest, never transcribed: whatever version this
  // branch ships, the checklist must name the next one after it.
  const manifest = JSON.parse(
    readFileSync(path.join(REPO_ROOT, "pdlc/engine/package.json"), "utf8"),
  );
  const [major, minor] = manifest.version.split(".").map(Number);
  const nextVersion = `${major}.${minor + 1}.0`;
  assert.ok(
    section.includes(nextVersion),
    `${CHECKLIST_PATH} §7 must name the follow-on bump to ${nextVersion} in the same change as ` +
      `the publish evidence: version-skew.test.js requires the manifest version to be strictly ` +
      `ahead of every published version harvested from EVIDENCE-*.md, so recording ` +
      `${manifest.version}'s publish without bumping reds the engine suite on main ` +
      `(CODE_REVIEW v6 §3-3).`,
  );
});
