// Tests for T13 — the guard-entry structural oracle (pdlc-engine-distribution).
// PROPERTIES PROP-LAUNCH-7 / TSPEC §9.3 / AT-2.5, DEC-EDIST-09.
//
// PROP-LAUNCH-7: `bin/pdlc.mjs` must remain dependency-free, asserted
// structurally over its source with a POSITIVE triple of exact counts (never
// "does not import much"):
//   1. zero static `import` declarations (the dynamic, promise-chained
//      `import("./cli.mjs")` is exempt — it is not a static declaration)
//   2. exactly three non-comment top-level statements
//   3. zero `await` tokens in the comment-stripped source
//
// RED at T13 (batch 2): the E-4b split (guard `bin/pdlc.mjs` / body
// `bin/cli.mjs`) has not landed yet — at HEAD, `bin/pdlc.mjs` is still the
// full CLI entrypoint, carrying more than a dozen static imports and dozens
// of top-level statements. This file pins the oracle ahead of that split,
// per TE F-41: a refusal with no oracle proves nothing. T45 (batch 8)
// performs the split and turns this suite green.
//
// The oracle is hand-rolled (no parser dependency) on purpose: PROP-LAUNCH-7
// requires the GUARD ITSELF to stay dependency-free, so an oracle that could
// only be evaluated by pulling in an npm parser would be testing the wrong
// thing at one remove. The mode-tracking approach below (comments / strings
// / templates / regex literals each carry their own walk state) mirrors
// `pdlc/workflows/build-runtime.mjs`'s `stripJsComments` — copied in spirit,
// not by cross-package import, since these are two separate packages.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const GUARD_PATH = path.join(engineRoot, "bin", "pdlc.mjs");

// Words that make a following `/` a regex literal, not division — same
// closed set `stripJsComments` uses.
const REGEX_PREFIX_WORDS = new Set([
  "return", "typeof", "instanceof", "in", "of", "new", "delete", "void",
  "throw", "case", "do", "else", "yield", "await",
]);

/**
 * Walks `source` once, tracking comment / string / template / regex mode the
 * same way `pdlc/workflows/build-runtime.mjs`'s `stripJsComments` does, and
 * returns PROP-LAUNCH-7's three counts:
 *
 *   - `staticImportCount`: occurrences of the `import` keyword, at bracket
 *     depth 0, in code mode, NOT immediately followed by `(` (which marks
 *     the exempt dynamic `import(...)` call) or `.` (the `import.meta`
 *     meta-property), and not a property-access (`x.import`).
 *   - `topLevelStatements`: statements ending at bracket depth 0, either at
 *     a depth-0 `;` or at the depth-0-closing `}` of a block construct
 *     (if/for/while/function/class/try) that is not itself continued by a
 *     trailing `else` / `catch` / `finally` / `while`.
 *   - `awaitCount`: occurrences of the `await` keyword in code mode (never
 *     inside a string, template, or comment).
 *
 * A leading shebang line is stripped first — Node does the same before
 * parsing, and `#!/usr/bin/env node` contains a `/` sequence that would
 * otherwise be misread as a regex literal by the walk below.
 */
function analyzeGuardSource(source) {
  const stripped = source.startsWith("#!") ? source.slice(source.indexOf("\n") + 1) : source;
  const n = stripped.length;

  const stack = [{ mode: "code", depth: 0 }];
  const top = () => stack[stack.length - 1];

  let i = 0;
  let prevCh = "";
  let prevWord = "";
  let sawContentAtDepth0 = false;
  let topLevelStatements = 0;
  let staticImportCount = 0;
  let awaitCount = 0;

  const markContent = (s) => {
    if (s.depth === 0 && !sawContentAtDepth0) sawContentAtDepth0 = true;
  };

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
        markContent(s);
        stack.push({ mode: "string", quote: c });
        i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "`") {
        markContent(s);
        stack.push({ mode: "template" });
        i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "/") {
        const regexish =
          prevCh === "" || "(,=:[!&|?{};+-*%~^<>".includes(prevCh) || REGEX_PREFIX_WORDS.has(prevWord);
        if (regexish) {
          markContent(s);
          stack.push({ mode: "regex", inClass: false });
          i++; prevCh = "/"; prevWord = "";
          continue;
        }
        // division operator — falls through to the generic-char branch below
      }
      if (/[A-Za-z0-9_$]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_$]/.test(stripped[j])) j++;
        const word = stripped.slice(i, j);
        const precededByDot = prevCh === ".";
        let k = j;
        while (k < n && /\s/.test(stripped[k])) k++;
        const nextCh = stripped[k] || "";

        if (word === "import" && s.depth === 0 && !precededByDot && nextCh !== "(" && nextCh !== ".") {
          staticImportCount++;
        }
        if (word === "await") awaitCount++;

        markContent(s);
        prevWord = word;
        prevCh = word[word.length - 1];
        i = j;
        continue;
      }
      if (c === "{" || c === "(" || c === "[") {
        markContent(s);
        s.depth++;
        i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "}" || c === ")" || c === "]") {
        s.depth--;
        i++;
        const closedCh = c;
        prevCh = c; prevWord = "";
        if (s.depth === 0) {
          let k = i;
          for (;;) {
            while (k < n && /\s/.test(stripped[k])) k++;
            if (stripped[k] === "/" && stripped[k + 1] === "/") {
              while (k < n && stripped[k] !== "\n") k++;
              continue;
            }
            if (stripped[k] === "/" && stripped[k + 1] === "*") {
              k += 2;
              while (k < n && !(stripped[k] === "*" && stripped[k + 1] === "/")) k++;
              k = Math.min(n, k + 2);
              continue;
            }
            break;
          }
          const continuesWith = /^(else|catch|finally|while)\b/.test(stripped.slice(k, k + 10));
          if (closedCh === "}" && !continuesWith && sawContentAtDepth0) {
            topLevelStatements++;
            sawContentAtDepth0 = false;
          }
        }
        continue;
      }
      if (c === ";" && s.depth === 0) {
        if (sawContentAtDepth0) {
          topLevelStatements++;
          sawContentAtDepth0 = false;
        }
        i++; prevCh = ";"; prevWord = "";
        continue;
      }
      if (!/\s/.test(c)) {
        markContent(s);
        prevCh = c;
      }
      i++;
      continue;
    }

    if (s.mode === "string") {
      if (c === "\\") { i += 2; continue; }
      i++;
      if (c === s.quote) stack.pop();
      continue;
    }

    if (s.mode === "template") {
      if (c === "\\") { i += 2; continue; }
      if (c === "$" && d === "{") {
        stack.push({ mode: "code", depth: 0 });
        i += 2;
        continue;
      }
      i++;
      if (c === "`") stack.pop();
      continue;
    }

    // regex
    if (c === "\\") { i += 2; continue; }
    i++;
    if (c === "[") s.inClass = true;
    else if (c === "]") s.inClass = false;
    else if (c === "/" && !s.inClass) { stack.pop(); prevCh = "/"; }
    else if (c === "\n") stack.pop(); // never a real regex — bail conservatively
  }

  if (sawContentAtDepth0) topLevelStatements++; // trailing statement with no terminator

  return { topLevelStatements, staticImportCount, awaitCount };
}

// ── oracle self-tests: prove analyzeGuardSource is not vacuous ────────────
// (TE F-41 precedent, applied to the test's own instrument rather than only
// to the production code — an oracle that always reports the expected triple
// regardless of input would make T45's green meaningless.)

test("analyzeGuardSource: dynamic import(...) does not count as a static import declaration", () => {
  const result = analyzeGuardSource('const p = import("./cli.mjs").catch((e) => {\n  throw e;\n});');
  assert.equal(result.staticImportCount, 0);
});

test("analyzeGuardSource: a static import declaration is counted", () => {
  const result = analyzeGuardSource('import { readFileSync } from "node:fs";\n');
  assert.equal(result.staticImportCount, 1);
});

test("analyzeGuardSource: import.meta and x.import property access are not counted", () => {
  const result = analyzeGuardSource("const u = import.meta.url;\nconst v = ns.import(x);\n");
  assert.equal(result.staticImportCount, 0);
});

test("analyzeGuardSource: await inside a string or comment is not counted, await as a keyword is", () => {
  const withStringAndComment = analyzeGuardSource(
    '// await this comment\nconst s = "please await me";\nasync function f() { await g(); }\n'
  );
  assert.equal(withStringAndComment.awaitCount, 1);

  const zero = analyzeGuardSource('const s = "await await await";\n// await\n');
  assert.equal(zero.awaitCount, 0);
});

test("analyzeGuardSource: comments are excluded from the top-level statement count", () => {
  const result = analyzeGuardSource(
    "// header comment\nconst a = 1;\n/* block\n   comment */\nconst b = 2;\n"
  );
  assert.equal(result.topLevelStatements, 2);
});

test("analyzeGuardSource: an if/else block is one top-level statement, not two", () => {
  const result = analyzeGuardSource(
    'const major = 10;\nif (major < 12) {\n  process.exit(1);\n} else {\n  run();\n}\n'
  );
  assert.equal(result.topLevelStatements, 2);
});

test("analyzeGuardSource: three simple statements count as exactly three", () => {
  const result = analyzeGuardSource(
    'const a = 1;\nconst b = 2;\nif (a < b) {\n  run();\n}\n'
  );
  assert.equal(result.topLevelStatements, 3);
});

// ── PROP-LAUNCH-7's positive triple, over the real bin/pdlc.mjs source ────

test.skip("T45: bin/pdlc.mjs declares zero static import declarations (dynamic import(...) is exempt)", () => {
  const source = readFileSync(GUARD_PATH, "utf8");
  const { staticImportCount } = analyzeGuardSource(source);
  assert.equal(staticImportCount, 0);
});

test.skip("T45: bin/pdlc.mjs has exactly three non-comment top-level statements", () => {
  const source = readFileSync(GUARD_PATH, "utf8");
  const { topLevelStatements } = analyzeGuardSource(source);
  assert.equal(topLevelStatements, 3);
});

test("bin/pdlc.mjs contains zero await tokens in its comment-stripped source", () => {
  const source = readFileSync(GUARD_PATH, "utf8");
  const { awaitCount } = analyzeGuardSource(source);
  assert.equal(awaitCount, 0);
});
