// Tests for T19 — the commit-site set-equality oracle (pdlc-engine-distribution).
// PLAN T19 [green] [standing guard]; TSPEC §7.2 / §12.1; AT-5.3.
//
// TSPEC §7.2: "every script-owned commit funnels through `commitPaths`" is
// false at HEAD. Grepping both workflow modules for `git commit` invocations
// finds a CLOSED set of five script-owned commit sites, only one of which is
// `commitPaths`:
//
//   C-a  commitPaths            (orchestrate-dev.js)
//   C-b  appendApprovalAnchors  (orchestrate-dev.js)
//   C-c  commitQueueRow         (orchestrate-queue.js)
//   C-d  commitAdvisoryRecord   (orchestrate-queue.js)
//   C-e  buildA5SeamOps's `apply` arrow — an ANONYMOUS closure, so the
//        oracle walks out to its nearest enclosing NAMED function
//        declaration, `buildA5SeamOps` itself (orchestrate-dev.js)
//
// This file's oracle greps both modules' sources for the array literal
// shape every real commit site uses — `["commit", ...]`, the first
// positional argument `_git`/`gitFn`/`gitWithLockRetry` are always called
// with — and, for each hit, walks outward through the source's bracket
// nesting to the nearest enclosing NAMED `function` declaration. The set of
// those enclosing names, taken over both modules, must equal exactly
// `{commitPaths, appendApprovalAnchors, commitQueueRow, commitAdvisoryRecord,
// buildA5SeamOps}` — unconditionally, five members, no parenthetical. A new
// commit site added anywhere else turns this file red.
//
// Standing guard, not red-before-green (PLAN §4 kind-1 carve-out): this
// assertion is already true at HEAD and must stay true, so there is no
// `[red]` predecessor task. Instead it ships its own falsifier (TE round-1
// F-13): a hand-transcribed expected set that is green on day one never by
// itself demonstrates the scanner CAN redden. The second `test()` below runs
// the identical scanner over a fixture source carrying a sixth `git commit`
// inside a sixth named function and asserts that run reports six members and
// fails the five-member equality — proving the oracle is sensitive to its
// input rather than hardcoded to always agree with EXPECTED_COMMIT_FUNCTIONS.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const WORKFLOWS_ROOT = path.join(repoRoot, "pdlc", "workflows");

const DEV_MODULE_PATH = path.join(WORKFLOWS_ROOT, "orchestrate-dev.js");
const QUEUE_MODULE_PATH = path.join(WORKFLOWS_ROOT, "orchestrate-queue.js");

// The transcribed five (TSPEC §7.2's closed enumeration, C-a…C-e) — this is
// deliberately NOT derived from the scanner's own output, the same reasoning
// skills-composition.test.js's EXPECTED_DISPATCHABLE_SET uses: a change here
// must be a human decision that re-reads §7.2, not a value the oracle could
// silently agree with itself about.
export const EXPECTED_COMMIT_FUNCTIONS = Object.freeze(
  [
    "commitPaths", // C-a — orchestrate-dev.js
    "appendApprovalAnchors", // C-b — orchestrate-dev.js
    "commitQueueRow", // C-c — orchestrate-queue.js
    "commitAdvisoryRecord", // C-d — orchestrate-queue.js
    "buildA5SeamOps", // C-e — orchestrate-dev.js, the A5 seam's `apply` arrow
  ].sort()
);

// ── the scanner ─────────────────────────────────────────────────────────
//
// Hand-rolled (no parser dependency), mode-tracking walk over the source —
// comments / strings / template literals / regex literals each carry their
// own mode, so a `["commit"` inside a string or comment is never mistaken
// for a real invocation. This mirrors bin-guard-structure.test.js's
// `analyzeGuardSource` in spirit (copied, not imported — no shared module
// exists for this), extended here to also track a bracket-nesting stack
// tagged with the nearest enclosing NAMED `function` declaration, so each
// commit-shaped site can report which named function encloses it.
const REGEX_PREFIX_WORDS = new Set([
  "return", "typeof", "instanceof", "in", "of", "new", "delete", "void",
  "throw", "case", "do", "else", "yield", "await",
]);

/**
 * Walks `source` once and returns every commit-shaped site — an array
 * literal opening with `"commit"` (or `'commit'`) as its first element, the
 * exact shape every real `_git`/`gitFn`/`gitWithLockRetry` commit call uses
 * (`["commit", "-m", …]`) — found in CODE mode (never inside a string,
 * comment, template-literal text span, or regex literal).
 *
 * Each site is `{ index, name }`, where `name` is the nearest enclosing
 * NAMED `function` declaration (walking outward through anonymous arrows
 * and object-literal nesting), or `null` if the site sits outside every
 * named function.
 */
export function scanCommitSites(source) {
  const stripped = source.startsWith("#!") ? source.slice(source.indexOf("\n") + 1) : source;
  const n = stripped.length;
  let i = 0;

  // Mode stack: comment/string/template/regex spans nest inside `${…}`
  // template interpolations, which themselves re-enter code mode.
  const modeStack = [{ mode: "code" }];
  const top = () => modeStack[modeStack.length - 1];

  // Bracket-nesting stack, tagged with the enclosing named-function context
  // active at the point each bracket opened. `{` inherits its parent's name
  // unless it is the body brace of a `function name(…)` just closed.
  const brackets = []; // { ch, name, isFnParams?, fnName?, __templateResume? }
  const currentName = () => (brackets.length ? brackets[brackets.length - 1].name : null);

  let pendingFnName = null; // set when `function name(` is recognised, consumed by the next `(`
  let prevCh = "";
  let prevWord = "";

  const sites = [];

  while (i < n) {
    const s = top();
    const c = stripped[i];
    const d = i + 1 < n ? stripped[i + 1] : "";

    if (s.mode === "code") {
      if (c === "/" && d === "/") {
        while (i < n && stripped[i] !== "\n") i++;
        continue;
      }
      if (c === "/" && d === "*") {
        i += 2;
        while (i < n && !(stripped[i] === "*" && stripped[i + 1] === "/")) i++;
        i = Math.min(n, i + 2);
        continue;
      }
      if (c === "'" || c === '"') {
        modeStack.push({ mode: "string", quote: c });
        i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "`") {
        modeStack.push({ mode: "template" });
        i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "/") {
        const regexish =
          prevCh === "" ||
          "(,=:[!&|?{};+-*%~^<>".includes(prevCh) ||
          REGEX_PREFIX_WORDS.has(prevWord);
        if (regexish) {
          modeStack.push({ mode: "regex", inClass: false });
          i++; prevCh = "/"; prevWord = "";
          continue;
        }
      }
      if (/[A-Za-z0-9_$]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_$]/.test(stripped[j])) j++;
        const word = stripped.slice(i, j);
        if (word === "function") {
          const m = /^\s+([A-Za-z_$][\w$]*)\s*\(/.exec(stripped.slice(j));
          if (m) pendingFnName = m[1];
        }
        prevWord = word;
        prevCh = word[word.length - 1];
        i = j;
        continue;
      }
      if (c === "[") {
        if (/^\s*["']commit["']/.test(stripped.slice(i + 1))) {
          sites.push({ index: i, name: currentName() });
        }
        brackets.push({ ch: "[", name: currentName() });
        i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "(") {
        brackets.push({
          ch: "(",
          name: currentName(),
          isFnParams: pendingFnName !== null,
          fnName: pendingFnName,
        });
        pendingFnName = null;
        i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "{") {
        let name = currentName();
        if (top().__awaitingFnName !== undefined && top().__awaitingFnName !== null) {
          name = top().__awaitingFnName;
        }
        brackets.push({ ch: "{", name });
        i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "]" || c === ")" || c === "}") {
        const popped = brackets.pop();
        if (c === ")" && popped && popped.isFnParams) {
          // The parameter list of a `function name(…)` just closed; the
          // VERY NEXT `{` (JS guarantees no token but whitespace between a
          // function declaration's `)` and its body `{`) is that name's body.
          top().__awaitingFnName = popped.fnName;
        } else if (c === "}") {
          top().__awaitingFnName = undefined;
          if (popped && popped.__templateResume) {
            modeStack.pop(); // back to the enclosing template literal's text
          }
        }
        i++; prevCh = c; prevWord = "";
        continue;
      }
      if (!/\s/.test(c)) prevCh = c;
      i++;
      continue;
    }

    if (s.mode === "string") {
      if (c === "\\") { i += 2; continue; }
      i++;
      if (c === s.quote) modeStack.pop();
      continue;
    }

    if (s.mode === "template") {
      if (c === "\\") { i += 2; continue; }
      if (c === "$" && d === "{") {
        brackets.push({ ch: "{", name: currentName(), __templateResume: true });
        modeStack.push({ mode: "code" });
        i += 2;
        continue;
      }
      i++;
      if (c === "`") modeStack.pop();
      continue;
    }

    // regex
    if (c === "\\") { i += 2; continue; }
    i++;
    if (c === "[") s.inClass = true;
    else if (c === "]") s.inClass = false;
    else if (c === "/" && !s.inClass) { modeStack.pop(); prevCh = "/"; }
    else if (c === "\n") modeStack.pop(); // never a real regex — bail conservatively
  }

  return sites;
}

/** The sorted, de-duplicated set of enclosing named functions a source's commit sites report. */
function commitFunctionSet(source) {
  return [...new Set(scanCommitSites(source).map((site) => site.name))].sort();
}

// ── AT-5.3: the real oracle, over the real sources ─────────────────────────

test("commit-site set-equality: orchestrate-dev.js + orchestrate-queue.js's enclosing named functions equal exactly the five TSPEC §7.2 helpers", () => {
  const devSource = readFileSync(DEV_MODULE_PATH, "utf8");
  const queueSource = readFileSync(QUEUE_MODULE_PATH, "utf8");

  const found = [...new Set([...commitFunctionSet(devSource), ...commitFunctionSet(queueSource)])].sort();

  assert.deepEqual(
    found,
    EXPECTED_COMMIT_FUNCTIONS,
    "the set of enclosing named functions containing a git-commit invocation must equal exactly " +
      `${JSON.stringify(EXPECTED_COMMIT_FUNCTIONS)} (TSPEC §7.2); found ${JSON.stringify(found)}`
  );
});

test("commit-site set-equality: no site is left unnamed (module-level, outside every named function) in either real module", () => {
  const devSource = readFileSync(DEV_MODULE_PATH, "utf8");
  const queueSource = readFileSync(QUEUE_MODULE_PATH, "utf8");
  const sites = [...scanCommitSites(devSource), ...scanCommitSites(queueSource)];
  assert.equal(sites.length, 5, `expected exactly five commit sites, found ${sites.length}`);
  for (const site of sites) {
    assert.notEqual(site.name, null, `commit site at index ${site.index} has no enclosing named function`);
  }
});

// ── TE round-1 F-13's falsifier: the scanner must be able to redden ────────
//
// A hand-transcribed expected set that is green on day one never by itself
// demonstrates the scanner can detect a violation. This fixture carries the
// same five commit sites (renamed/reshaped slightly, since the claim under
// test is the SCANNER's behaviour, not a copy of the real files) plus a
// sixth `git commit` inside a sixth named function, `sneakyExtraCommit`. The
// same `scanCommitSites` run over this input must report six enclosing
// names and fail the five-member equality — proving the oracle is sensitive
// to its input rather than a scanner that returns the same set regardless.
const FIXTURE_SOURCE_WITH_SIXTH_COMMIT_SITE = `
function commitPaths({ paths, message, _git }) {
  const commit = _git(["commit", "-m", message]);
}
async function appendApprovalAnchors({ _git }) {
  await _git(["commit", "-m", \`chore(pdlc): record approval anchors\`]);
}
async function commitQueueRow(queuePath, feature, status, gitFn) {
  const committed = gitFn([
    "commit",
    "-m",
    \`chore(queue): \${feature} -> \${status}\`,
  ]);
}
async function commitAdvisoryRecord(recordPath, feature, gitFn, emit) {
  const committed = gitFn(["commit", "-m", "chore(advisory): record"]);
}
export async function buildA5SeamOps({ _git }) {
  return {
    apply: async () => {
      // an anonymous arrow — the oracle must walk out to buildA5SeamOps
      const commit = await _git(["commit", "-m", "advisory(A5): fix"]);
    },
  };
}

// The sixth, undeclared site — this is what must turn the row red.
function sneakyExtraCommit(gitFn) {
  gitFn(["commit", "-m", "an unaccounted-for commit site"]);
}
`;

test("falsifier (TE F-13): the scanner reddens against a fixture carrying a sixth git-commit site inside a named function", () => {
  const found = commitFunctionSet(FIXTURE_SOURCE_WITH_SIXTH_COMMIT_SITE);

  assert.equal(found.length, 6, `expected six enclosing names in the falsifier fixture, found ${found.length}`);
  assert.ok(
    found.includes("sneakyExtraCommit"),
    "the sixth commit site's enclosing function must be reported by name"
  );
  assert.notDeepEqual(
    found,
    EXPECTED_COMMIT_FUNCTIONS,
    "a scanner that returns the same five-member set for both the real sources and this " +
      "six-site fixture would fail to demonstrate it can redden (TE round-1 F-13)"
  );
});

test("falsifier (TE F-13): a `git commit`-shaped literal inside a string or comment is not a site", () => {
  const decoy = [
    '// this comment mentions ["commit", "-m", "x"] but is not a real site',
    'const notASite = \'["commit", "-m", "y"]\'; // string literal, not code',
    "function realSite(gitFn) {",
    '  gitFn(["commit", "-m", "the only real one"]);',
    "}",
  ].join("\n");

  const sites = scanCommitSites(decoy);
  assert.equal(sites.length, 1, `expected exactly one real site, found ${sites.length}`);
  assert.equal(sites[0].name, "realSite");
});

test("falsifier (TE F-13): an empty source reports zero sites, not a stale non-empty default", () => {
  assert.deepEqual(scanCommitSites(""), []);
});
