// `pdlc stats` CLI structural anti-drift oracles (TSPEC §6.4, engine half) —
// PLAN T-10 (pdlc-stats).
//
// RED at T-10: `pdlc/engine/bin/cli.mjs` carries no `stats` surface at all yet
// (no `statsParsers`, no `statsIo`, no `cmdStats`) — that lands in T-17
// (batch 8), which also turns T-09 and T-11 green. Every oracle here whose
// subject is `bin/cli.mjs`'s stats seam is therefore committed `test.skip`,
// titled "T-17: …", per the wave-gate discipline (SKILLS.md SKIPS) — un-skip
// each block exactly when T-17 lands, run it, and confirm it fails for the
// right reason before touching `bin/cli.mjs`.
//
// One exception: the **classifier-purity** oracle (TSPEC §6.4's fourth row)
// exercises `pdlc/workflows/orchestrate-dev.js`'s four driver exports
// directly — no CLI wiring involved — so it runs, unskipped, today and stays
// green throughout the feature. It is the mechanical detector `DEC-STATS-03`
// names for "a driver export acquires state" and is worth having early.
//
// Structural conjuncts (construction-site count, no-write capability, the
// `lstat`-not-`stat` seam, and the parser-identity pass-through conjunct) are
// evaluated by reading `bin/cli.mjs`'s own source text, hand-rolled with no
// parser dependency — the same approach `pdlc/engine/__tests__/
// bin-guard-structure.test.js` uses for `bin/pdlc.mjs`'s PROP-LAUNCH-7 triple,
// and for the same reason: an oracle that could only be evaluated by pulling
// in an npm parser would be testing the wrong thing at one remove, and pinning
// a POSITIVE exact count (not "does not do much") is what closes `DEC-STATS-01`
// `K-4`.

import test, { describe } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  parseReviewFilename,
  deriveRoundWindow,
  deriveDodRoundIndex,
  parseResolvedMarker,
} from "../../workflows/orchestrate-dev.js";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const engineRoot = path.dirname(testsDir);
const pdlcRoot = path.dirname(engineRoot);
const CLI_PATH = path.join(engineRoot, "bin", "cli.mjs");
const ORCHESTRATE_DEV_PATH = path.join(pdlcRoot, "workflows", "orchestrate-dev.js");
const STATS_DOUBLES_PATH = path.join(
  pdlcRoot,
  "workflows",
  "__tests__",
  "helpers",
  "statsDoubles.js",
);

function readCliSource() {
  return readFileSync(CLI_PATH, "utf8");
}

// ── source-text helpers (hand-rolled, mirroring bin-guard-structure.test.js's
//    mode-tracking approach — comments, strings and templates each carry
//    their own walk state so brace/keyword counting never fires inside one) ──

/**
 * Walks `source` once, replacing the contents of every `//` comment, `/* *\/`
 * comment, single/double-quoted string and template literal with spaces of
 * the same length (preserving newlines), so a caller can run plain
 * substring/regex/brace-matching logic against the RESULT and every offset
 * still lines up with the original source for slicing.
 */
function maskNonCode(source) {
  const n = source.length;
  const out = new Array(n);
  const stack = [{ mode: "code" }];
  const top = () => stack[stack.length - 1];

  let i = 0;
  let prevCh = "";
  let prevWord = "";
  const REGEX_PREFIX_WORDS = new Set([
    "return", "typeof", "instanceof", "in", "of", "new", "delete", "void",
    "throw", "case", "do", "else", "yield", "await",
  ]);

  const put = (ch, real, at = i) => {
    out[at] = real ? ch : ch === "\n" ? "\n" : " ";
  };

  while (i < n) {
    const s = top();
    const c = source[i];
    const d = i + 1 < n ? source[i + 1] : "";

    if (s.mode === "code") {
      if (c === "/" && d === "/") {
        while (i < n && source[i] !== "\n") { put(source[i], false); i++; }
        continue;
      }
      if (c === "/" && d === "*") {
        put(c, false, i); put(d, false, i + 1); i += 2;
        while (i < n && !(source[i] === "*" && source[i + 1] === "/")) { put(source[i], false, i); i++; }
        if (i < n) { put(source[i], false, i); put(source[i + 1], false, i + 1); i += 2; }
        continue;
      }
      if (c === "'" || c === '"') {
        stack.push({ mode: "string", quote: c });
        put(c, false); i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "`") {
        stack.push({ mode: "template" });
        put(c, false); i++; prevCh = c; prevWord = "";
        continue;
      }
      // A code frame opened by `${` must pop back to its template on the
      // interpolation's closing `}` (brace-depth tracked, so `${ {a: 1} }`
      // still closes at the right brace) — without this, the template's own
      // closing backtick reads as OPENING a new template and masking inverts
      // for the remainder of the source.
      if (c === "{" && s.fromTemplate) {
        s.depth++;
        put(c, true); prevCh = c; prevWord = ""; i++;
        continue;
      }
      if (c === "}" && s.fromTemplate) {
        if (s.depth === 0) {
          stack.pop();
          put(c, true); prevCh = c; prevWord = ""; i++;
          continue;
        }
        s.depth--;
        put(c, true); prevCh = c; prevWord = ""; i++;
        continue;
      }
      if (c === "/") {
        const regexish =
          prevCh === "" || "(,=:[!&|?{};+-*%~^<>".includes(prevCh) || REGEX_PREFIX_WORDS.has(prevWord);
        if (regexish) {
          stack.push({ mode: "regex", inClass: false });
          put(c, false); i++; prevCh = "/"; prevWord = "";
          continue;
        }
      }
      if (/[A-Za-z0-9_$]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_$]/.test(source[j])) j++;
        const word = source.slice(i, j);
        for (let k = i; k < j; k++) put(source[k], true, k);
        prevWord = word;
        prevCh = word[word.length - 1];
        i = j;
        continue;
      }
      put(c, true);
      if (!/\s/.test(c)) prevCh = c;
      i++;
      continue;
    }

    if (s.mode === "string") {
      if (c === "\\") { put(c, false, i); put(d, false, i + 1); i += 2; continue; }
      put(c, false); i++;
      if (c === s.quote) stack.pop();
      continue;
    }

    if (s.mode === "template") {
      if (c === "\\") { put(c, false, i); put(d, false, i + 1); i += 2; continue; }
      if (c === "$" && d === "{") {
        stack.push({ mode: "code", fromTemplate: true, depth: 0 });
        put(c, true, i); put(d, true, i + 1); i += 2;
        continue;
      }
      put(c, false); i++;
      if (c === "`") stack.pop();
      continue;
    }

    // regex mode
    if (c === "\\") { put(c, false, i); put(d, false, i + 1); i += 2; continue; }
    put(c, false); i++;
    if (c === "[") s.inClass = true;
    else if (c === "]") s.inClass = false;
    else if (c === "/" && !s.inClass) { stack.pop(); prevCh = "/"; }
    else if (c === "\n") stack.pop();
  }

  return out.join("");
}

/**
 * Finds `function <name>(` or `async function <name>(` at any brace depth in
 * `masked` (the masked source), and returns the ORIGINAL source's substring
 * spanning that function's body, from its opening `{` to the matching
 * closing `}` (inclusive), using simple depth counting over `masked` — safe
 * because `masked` has already had every string/template/comment interior
 * replaced with non-brace whitespace. Returns `null` if no such function is
 * found.
 */
function extractFunctionBody(source, masked, name) {
  const re = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`);
  const m = re.exec(masked);
  if (!m) return null;
  let i = masked.indexOf("{", m.index + m[0].length);
  if (i === -1) return null;
  const start = i;
  let depth = 0;
  for (; i < masked.length; i++) {
    if (masked[i] === "{") depth++;
    else if (masked[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Counts non-overlapping occurrences, in the masked (comment/string-safe)
 * source, of an object-literal-shaped run that contains all four of
 * `keys` as property names, in any order, within one `{ … }` span. Used by
 * the construction-site-count oracle: the four-classifier bundle
 * `statsParsers()` builds should appear as exactly one such span in
 * `bin/cli.mjs`'s source.
 */
function countObjectLiteralsWithKeys(masked, keys) {
  let count = 0;
  let i = 0;
  while (i < masked.length) {
    const open = masked.indexOf("{", i);
    if (open === -1) break;
    i = open + 1; // allow nested/overlapping spans to be found independently
    // Only literal-position braces count: a function/block body's `{` (it
    // follows `)`, `{`, `}` or `;`) would otherwise double-count by enclosing
    // the very literal under test — statsParsers' body span contains the same
    // four names as the object it returns.
    let p = open - 1;
    while (p >= 0 && /\s/.test(masked[p])) p--;
    const literalPosition =
      p >= 0 &&
      ("(=,:[".includes(masked[p]) || /\breturn$/.test(masked.slice(Math.max(0, p - 5), p + 1)));
    if (!literalPosition) continue;
    let depth = 0;
    let j = open;
    for (; j < masked.length; j++) {
      if (masked[j] === "{") depth++;
      else if (masked[j] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    if (j >= masked.length) break;
    const span = masked.slice(open, j + 1);
    // Key position (`name:`), not bare mention — dot access and destructuring
    // spans must not count as construction sites (DEC-STATS-01 K-4).
    if (keys.every((k) => new RegExp(`\\b${k}\\s*:`).test(span))) count++;
  }
  return count;
}

/** Every `<word>Sync(` call-name appearing in `masked`, e.g. `lstatSync`. */
function fsSyncCallNames(masked) {
  const names = new Set();
  const re = /\b([A-Za-z_$][A-Za-z0-9_$]*Sync)\s*\(/g;
  let m;
  while ((m = re.exec(masked))) names.add(m[1]);
  return names;
}

// ── oracle self-tests: maskNonCode is not vacuous (TE F-41 precedent) ─────

test("maskNonCode: a `//` sequence inside a string is not treated as a comment", () => {
  const masked = maskNonCode('const re = "http://example.com";\nconst kept = 1;\n');
  assert.match(masked, /const\s+kept\s*=\s*1/);
});

test("maskNonCode: a regex literal's `/` is not treated as a comment opener", () => {
  const masked = maskNonCode('const re = /a\\/b/;\nconst kept = 2;\n');
  assert.match(masked, /const\s+kept\s*=\s*2/);
});

test("maskNonCode: brace text inside a block comment is masked out", () => {
  const masked = maskNonCode("/* { fake: true } */\nconst real = { a: 1 };\n");
  assert.equal(/fake/.test(masked), false);
  assert.match(masked, /real\s*=\s*\{\s*a:\s*1\s*\}/);
});

test("extractFunctionBody: returns the exact original-source span for a named function", () => {
  const source = 'function outer() {\n  return { a: "}" };\n}\nfunction other() {}\n';
  const masked = maskNonCode(source);
  const body = extractFunctionBody(source, masked, "outer");
  assert.equal(body, '{\n  return { a: "}" };\n}');
});

test("countObjectLiteralsWithKeys: counts exactly one span carrying all four names", () => {
  const source = "const bundle = { alpha: 1, beta: 2, gamma: 3, delta: 4 };\n" +
    "const other = { alpha: 1, beta: 2 };\n";
  const masked = maskNonCode(source);
  assert.equal(countObjectLiteralsWithKeys(masked, ["alpha", "beta", "gamma", "delta"]), 1);
});

// ── classifier purity (TSPEC §6.4) — runs today, no CLI wiring involved ───
//
// Each of the four `orchestrate-dev.js` classifiers is exercised on a fresh,
// cache-busted import of the module (a unique query string on the module
// specifier forces Node's ESM loader to evaluate a brand-new module
// instance, independent of whatever this process may already have cached),
// so a module-level cache populated by an earlier test can never make the
// first call here a cache hit.

async function importFreshOrchestrateDev() {
  const url = `${pathToFileURL(ORCHESTRATE_DEV_PATH).href}?fresh=${Date.now()}-${Math.random()}`;
  return import(url);
}

describe("classifier purity (TSPEC §6.4, DEC-STATS-03's mechanical detector)", () => {
  test("parseReviewFilename: called twice on the same input within one fresh instance is deepEqual and non-aliased", async () => {
    const mod = await importFreshOrchestrateDev();
    const input = "CROSS-REVIEW-software-engineer-TSPEC-v1.md";
    const first = mod.parseReviewFilename(input);
    const second = mod.parseReviewFilename(input);
    assert.deepEqual(first, second);
    assert.notEqual(first, second, "the second call must not return the same object reference as the first");
  });

  test("deriveRoundWindow: called twice on the same input within one fresh instance is deepEqual and non-aliased", async () => {
    const mod = await importFreshOrchestrateDev();
    const basenames = ["CROSS-REVIEW-software-engineer-TSPEC-v1.md"];
    const first = mod.deriveRoundWindow(basenames, "TSPEC");
    const second = mod.deriveRoundWindow(basenames, "TSPEC");
    assert.deepEqual(first, second);
    assert.notEqual(first, second, "the second call must not return the same object reference as the first");
  });

  test("parseResolvedMarker: called twice on the same input within one fresh instance is deepEqual and non-aliased", async () => {
    const mod = await importFreshOrchestrateDev();
    const fileText = "RESOLVED: yes\n";
    const first = mod.parseResolvedMarker(fileText);
    const second = mod.parseResolvedMarker(fileText);
    assert.deepEqual(first, second);
    assert.notEqual(first, second, "the second call must not return the same object reference as the first");
  });

  test("deriveDodRoundIndex: A-B-A over one fresh instance returns the same number for A both times", async () => {
    const mod = await importFreshOrchestrateDev();
    const feature = "some-feature";
    const a = ["CODE_REVIEW-some-feature-v1.md"];
    const b = [
      "CODE_REVIEW-some-feature-v1.md",
      "CODE_REVIEW-some-feature-v2.md",
      "CODE_REVIEW-some-feature-v3.md",
    ];
    const firstA = mod.deriveDodRoundIndex(a, feature);
    const resultB = mod.deriveDodRoundIndex(b, feature);
    const secondA = mod.deriveDodRoundIndex(a, feature);
    assert.notEqual(resultB, firstA, "B must be constructed so its correct answer differs from A's");
    assert.equal(secondA, firstA, "a pure function returns the same result for A both times, with no state carried from the B call in between");
  });

  test("sanity: these four are the exact TSPEC §3.2 classifier names, imported directly (no local re-implementation)", () => {
    assert.equal(typeof parseReviewFilename, "function");
    assert.equal(typeof deriveRoundWindow, "function");
    assert.equal(typeof deriveDodRoundIndex, "function");
    assert.equal(typeof parseResolvedMarker, "function");
  });
});

/**
 * Finds `<name>(…) {` (an object-method shorthand, no `function` keyword) at
 * any brace depth in `masked`, and returns the ORIGINAL source's substring
 * spanning that method's body. Same depth-counting approach as
 * `extractFunctionBody`, for the `statsIo()`-returned object's members.
 */
function extractMethodBody(source, masked, name) {
  const re = new RegExp(`\\b${name}\\s*\\([^)]*\\)\\s*\\{`);
  const m = re.exec(masked);
  if (!m) return null;
  const start = masked.indexOf("{", m.index);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < masked.length; i++) {
    if (masked[i] === "{") depth++;
    else if (masked[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

/** The index of the `{` opening the object literal following the first
 *  `return` keyword in `masked`, or `-1` if there is none. */
function findReturnedObjectOpenBrace(masked) {
  const m = /\breturn\s*\{/.exec(masked);
  if (!m) return -1;
  return masked.indexOf("{", m.index);
}

/**
 * The property names declared at depth 1 of the object literal opening at
 * `masked[openBraceIndex]` (which must be `{`) — `{ key: value, method() {} }`
 * shapes both recognised, nested object/function bodies skipped entirely.
 */
function objectLiteralTopLevelKeys(masked, openBraceIndex) {
  let depth = 0;
  const keys = [];
  let atKeyStart = true;
  for (let i = openBraceIndex; i < masked.length; i++) {
    const c = masked[i];
    if (c === "{") {
      depth++;
      if (depth === 1) { atKeyStart = true; continue; }
      continue;
    }
    if (c === "}") {
      depth--;
      if (depth === 0) break;
      continue;
    }
    if (depth === 1) {
      if (atKeyStart && /[A-Za-z0-9_$]/.test(c)) {
        let j = i;
        while (j < masked.length && /[A-Za-z0-9_$]/.test(masked[j])) j++;
        let k = j;
        while (k < masked.length && /\s/.test(masked[k])) k++;
        if (masked[k] === ":" || masked[k] === "(") keys.push(masked.slice(i, j));
        atKeyStart = false;
        i = j - 1;
        continue;
      }
      if (c === ",") { atKeyStart = true; continue; }
      if (!/\s/.test(c)) atKeyStart = false;
    }
  }
  return keys;
}

// ── T-17-owned: bin/cli.mjs's stats seam does not exist yet ───────────────
//
// `statsParsers`, `statsIo` and `cmdStats` all land in T-17 (TSPEC §3.4).
// Every oracle below fails today for that one reason — the named function or
// export is simply absent — never for a wrong-implementation reason, so each
// is committed `test.skip`, titled "T-17: …". Un-skip each block exactly
// when T-17 lands `bin/cli.mjs`'s stats additions, run it, and confirm it
// fails for the right reason (a real assertion mismatch, not a missing
// symbol) before writing anything.

describe("CLI structural anti-drift oracles owned by T-17 (bin/cli.mjs)", () => {
  test("T-17: statsParsers()'s four members are === orchestrate-dev.js's four exports (TSPEC §2.5/§6.4)", async () => {
    const mod = await import(pathToFileURL(CLI_PATH).href);
    const bundle = await mod.statsParsers();
    assert.equal(bundle.parseReviewFilename, parseReviewFilename);
    assert.equal(bundle.deriveRoundWindow, deriveRoundWindow);
    assert.equal(bundle.deriveDodRoundIndex, deriveDodRoundIndex);
    assert.equal(bundle.parseResolvedMarker, parseResolvedMarker);
  });

  test("T-17: the object cmdStats hands runStats is that same statsParsers() bundle — pass-through, not rebuilt or wrapped (TSPEC §2.5/§6.4)", () => {
    const source = readCliSource();
    const masked = maskNonCode(source);
    const cmdStatsBody = extractFunctionBody(source, masked, "cmdStats");
    assert.notEqual(cmdStatsBody, null, "cmdStats must exist in bin/cli.mjs");
    const maskedBody = maskNonCode(cmdStatsBody);

    const assignMatch = /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?statsParsers\s*\(\s*\)/.exec(maskedBody);
    assert.notEqual(
      assignMatch,
      null,
      "cmdStats must construct the bundle via a bare statsParsers() call, assigned to a local variable",
    );
    const varName = assignMatch[1];

    const passThroughRe = new RegExp(`runStats\\s*\\(\\s*\\{[^}]*\\bparsers\\s*:\\s*${varName}\\b[^}]*\\}`, "s");
    const shorthandOk =
      varName === "parsers" &&
      new RegExp(`runStats\\s*\\(\\s*\\{[^}]*\\bparsers\\b(?!\\s*:)[^}]*\\}`, "s").test(maskedBody);
    assert.equal(
      passThroughRe.test(maskedBody) || shorthandOk,
      true,
      "runStats must receive the identical bundle statsParsers() returned, not a rebuilt or wrapped object " +
        "(this is the conjunct that stops §6.1's recordingParsers double from silently becoming the production path)",
    );
  });

  test("T-17: the four-classifier object literal occurs exactly once in bin/cli.mjs's source (construction-site count, TSPEC §3.4/§6.4)", () => {
    const source = readCliSource();
    const masked = maskNonCode(source);
    const count = countObjectLiteralsWithKeys(masked, [
      "parseReviewFilename",
      "deriveRoundWindow",
      "deriveDodRoundIndex",
      "parseResolvedMarker",
    ]);
    assert.equal(
      count,
      1,
      "the four-classifier bundle must be constructed at exactly one site (statsParsers) — a second site voids " +
        "the parser-identity oracle without failing it (DEC-STATS-01 K-4)",
    );
  });

  test("T-17: the StatsIo object literal statsIo() returns has exactly the four keys listDir, fileSize, readFile, exists (no-write capability, TSPEC §2.3/§6.4)", () => {
    const source = readCliSource();
    const masked = maskNonCode(source);
    const statsIoBody = extractFunctionBody(source, masked, "statsIo");
    assert.notEqual(statsIoBody, null, "statsIo must exist in bin/cli.mjs");
    const maskedStatsIoBody = maskNonCode(statsIoBody);
    const openBrace = findReturnedObjectOpenBrace(maskedStatsIoBody);
    assert.notEqual(openBrace, -1, "statsIo must return an object literal");
    const keys = objectLiteralTopLevelKeys(maskedStatsIoBody, openBrace);
    assert.deepEqual([...keys].sort(), ["exists", "fileSize", "listDir", "readFile"]);
  });

  test("T-17: statsIo().fileSize's body names lstatSync, never statSync (TSPEC §2.4/§3.1)", () => {
    const source = readCliSource();
    const masked = maskNonCode(source);
    const statsIoBody = extractFunctionBody(source, masked, "statsIo");
    assert.notEqual(statsIoBody, null, "statsIo must exist in bin/cli.mjs");
    const maskedStatsIoBody = maskNonCode(statsIoBody);
    const fileSizeBody = extractMethodBody(statsIoBody, maskedStatsIoBody, "fileSize");
    assert.notEqual(fileSizeBody, null, "statsIo() must define a fileSize member");
    const calls = fsSyncCallNames(maskNonCode(fileSizeBody));
    assert.equal(calls.has("lstatSync"), true, "fileSize must call lstatSync — a symbolic link contributes its own size, never its target's");
    assert.equal(calls.has("statSync"), false, "fileSize must never call statSync");
  });

  test("T-17: bin/cli.mjs's source contains no statSync call anywhere in the stats seam (TSPEC §2.4/§3.1)", () => {
    const source = readCliSource();
    const masked = maskNonCode(source);
    const calls = fsSyncCallNames(masked);
    assert.equal(calls.has("statSync"), false, "the stats seam must use lstatSync exclusively, never statSync");
  });

  test("T-17: statsIo()'s node:fs call set is identical to T-02's realStatsIo() call set (equivalence conjunct, TSPEC §6.1/§6.4)", () => {
    const source = readCliSource();
    const masked = maskNonCode(source);
    const statsIoBody = extractFunctionBody(source, masked, "statsIo");
    assert.notEqual(statsIoBody, null, "statsIo must exist in bin/cli.mjs");
    const cliCalls = fsSyncCallNames(maskNonCode(statsIoBody));

    const doublesSource = readFileSync(STATS_DOUBLES_PATH, "utf8");
    const doublesMasked = maskNonCode(doublesSource);
    const realStatsIoBody = extractFunctionBody(doublesSource, doublesMasked, "realStatsIo");
    assert.notEqual(realStatsIoBody, null, "T-02's realStatsIo() must exist in statsDoubles.js");
    const doubleCalls = fsSyncCallNames(maskNonCode(realStatsIoBody));

    assert.deepEqual(
      [...cliCalls].sort(),
      [...doubleCalls].sort(),
      "statsIo() and realStatsIo() must make the identical node:fs call set, so the real-path tests cannot drift from the shipped seam",
    );
    assert.equal(cliCalls.has("statSync"), false);
    assert.equal(doubleCalls.has("statSync"), false);
  });
});
