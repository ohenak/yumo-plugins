/**
 * runtimeBundle.test.js — the generated bundles must satisfy the workflow
 * runtime's constraints, and must not drift from the canonical modules.
 *
 * Probed against the runtime on 2026-07-27: the sandbox exposes only
 * agent/parallel/pipeline/phase/log/workflow/args/budget/console/setTimeout.
 * A static import, a second export, or a missing leading `meta` refuses to
 * launch — which is exactly how orchestrate-queue was unrunnable before the
 * build step existed. These assertions encode each refusal.
 */

import { execFileSync } from "child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import { stripModuleSyntax } from "../build-runtime.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "..", "..");
const BUNDLES = ["orchestrate-queue.bundle.js", "orchestrate-dev.bundle.js"];

// Sole output directory per AC-6.1 / TSPEC §2.3 point 1 — T-14 moves build-runtime.mjs's
// OUT_DIR here. Until then, every read below fails with ENOENT: that is the batch-2
// RED-terminal state this file is deliberately left in (PLAN T-05).
const DIST = resolve(WORKFLOWS, "dist");
const MANIFEST_PATH = resolve(DIST, "distribution-manifest.json");

const read = (file) => readFileSync(resolve(DIST, file), "utf8");

// ---------------------------------------------------------------------------
// RLH-31 — the await-discipline scan mechanism (PLAN §9.2 item 3).
//
// File-local and unexported. No parser and no new dependency: pdlc/workflows/
// package.json declares jest alone, so @babel/parser / esprima would be
// undeclared (transitive-only) and PLAN §11.4 `H-n` halts on a new dependency.
// A masked bracket-depth walk over source text, in three steps:
//   (a) mask string literals, template literals, regex literals and comments,
//       so no delimiter inside them is counted;
//   (b) build the scan set — TSPEC §8.5's closed thirteen names, each name's
//       main()-destructured local alias, and each named wrapper whose whole
//       body is a call of an already-in-set name (a fixed point, so `agentFn`
//       enters via `rawAgentFn`);
//   (c) classify every call site of a scan-set name not lexically preceded by
//       `await` against §8.5's three rulings.
// A shape the walk cannot decide is reported `unclassified`, which fails
// loudly — never a silent pass. Its own oracle is RLH-SCAN-01 below: the
// scanner is tested, not trusted (PLAN §9.2 item 3, §7.5).
// ---------------------------------------------------------------------------

const IDENT_CH = /[A-Za-z0-9_$]/;
const REGEX_PRECEDERS = new Set([..."(,=:[!&|?{};*%+-~^<>"]);
const REGEX_KEYWORDS = new Set([
  "return", "typeof", "case", "in", "of", "new", "delete", "void", "do", "else", "yield", "await",
]);

/** Index of the last non-whitespace character strictly before `at`, or -1. */
function prevTokenEnd(masked, at) {
  let j = at - 1;
  while (j >= 0 && /\s/.test(masked[j])) j--;
  return j;
}

/** The identifier ending immediately before `at` (whitespace skipped), or "". */
function wordBefore(masked, at) {
  const j = prevTokenEnd(masked, at);
  if (j < 0 || !IDENT_CH.test(masked[j])) return "";
  let k = j;
  while (k >= 0 && IDENT_CH.test(masked[k])) k--;
  return masked.slice(k + 1, j + 1);
}

/** True when a `/` at `i` opens a regex literal rather than being division. */
function regexAllowedAt(masked, i) {
  const j = prevTokenEnd(masked, i);
  if (j < 0) return true;
  const c = masked[j];
  if (IDENT_CH.test(c)) return REGEX_KEYWORDS.has(wordBefore(masked, i));
  return REGEX_PRECEDERS.has(c);
}

/**
 * (a) Replace every character inside a string literal, template literal, regex
 * literal or comment with a space (newlines preserved, so offsets and line
 * numbers survive). Template `${…}` holes are NOT masked: they hold real code,
 * and masking them would hide a genuine call site — a silent pass.
 */
function maskLiterals(src) {
  const out = src.split("");
  const blankAt = (i) => {
    if (out[i] !== "\n") out[i] = " ";
  };
  const blankRange = (a, b) => {
    for (let i = a; i < b && i < out.length; i++) blankAt(i);
  };
  const ctx = [{ kind: "code", depth: 0 }];
  let i = 0;

  while (i < src.length) {
    const top = ctx[ctx.length - 1];
    const c = src[i];

    if (top.kind === "template") {
      if (c === "\\") {
        blankRange(i, i + 2);
        i += 2;
      } else if (c === "`") {
        blankAt(i);
        ctx.pop();
        i += 1;
      } else if (c === "$" && src[i + 1] === "{") {
        blankRange(i, i + 2);
        ctx.push({ kind: "code", depth: 0 });
        i += 2;
      } else {
        blankAt(i);
        i += 1;
      }
      continue;
    }

    if (c === "/" && src[i + 1] === "/") {
      let j = i;
      while (j < src.length && src[j] !== "\n") j++;
      blankRange(i, j);
      i = j;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end === -1 ? src.length : end + 2;
      blankRange(i, j);
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === c) {
          j += 1;
          break;
        }
        j += 1;
      }
      blankRange(i, j);
      i = j;
      continue;
    }
    if (c === "`") {
      blankAt(i);
      ctx.push({ kind: "template" });
      i += 1;
      continue;
    }
    if (c === "/" && regexAllowedAt(out.join(""), i)) {
      let j = i + 1;
      let inClass = false;
      let closed = false;
      while (j < src.length) {
        const d = src[j];
        if (d === "\\") {
          j += 2;
          continue;
        }
        if (d === "\n") break;
        if (d === "[") inClass = true;
        else if (d === "]") inClass = false;
        else if (d === "/" && !inClass) {
          j += 1;
          while (j < src.length && /[a-z]/.test(src[j])) j += 1;
          closed = true;
          break;
        }
        j += 1;
      }
      if (closed) {
        blankRange(i, j);
        i = j;
        continue;
      }
    }
    if (c === "{") {
      top.depth += 1;
    } else if (c === "}") {
      if (top.depth === 0 && ctx.length > 1) {
        blankAt(i);
        ctx.pop();
        i += 1;
        continue;
      }
      top.depth -= 1;
    }
    i += 1;
  }

  return out.join("");
}

// FSPEC AT-19's closed thirteen-name set, restated once in TSPEC §8.5 and cited
// here. NOT derived from main()'s parameter list: `_now` is a clock called
// synchronously at four sites in raisePrAndVerifyCi and `_phaseDodEnabled` /
// `_phasePubEnabled` are booleans never called, so a derived set reds on
// shipped, correct source (TSPEC §8.5, PLAN §9.2).
const AT19_SEAM_NAMES = Object.freeze([
  "_agent", "_readFile", "_writeFile", "_appendFile", "_checkFile", "_listFiles",
  "_git", "_checkCi", "_mergeWorktree", "_recordHalt", "_rebaseOntoDefault",
  "_dodVerifyLoop", "_raisePrAndVerifyCi",
]);

// §8.5: the discriminant is the PROPERTY "awaits every element of the array",
// not membership of a name list. `Promise.race` / `Promise.any` were withdrawn
// at TSPEC v1.7 — they settle on one element and leave the loser unawaited.
const AWAITING_COMBINATORS = Object.freeze(["_parallel", "parallel", "Promise.all", "Promise.allSettled"]);

const OPENERS = { "(": ")", "[": "]", "{": "}" };
const CLOSERS = { ")": "(", "]": "[", "}": "{" };

/** Index of the delimiter matching the opener at `openIdx`, or -1 if depth
 *  never returns to zero — the "cannot decide" case, which must fail loudly. */
function matchForward(masked, openIdx) {
  const stack = [masked[openIdx]];
  for (let i = openIdx + 1; i < masked.length; i++) {
    const c = masked[i];
    if (OPENERS[c]) stack.push(c);
    else if (CLOSERS[c]) {
      if (stack[stack.length - 1] !== CLOSERS[c]) return -1;
      stack.pop();
      if (stack.length === 0) return i;
    }
  }
  return -1;
}

/** Walk backwards from `at` maintaining a stack of unclosed `(` `[` `{`.
 *  Returns their indices, innermost first — the enclosing context. */
function unclosedBefore(masked, at) {
  const stack = [];
  const unclosed = [];
  for (let i = at - 1; i >= 0; i--) {
    const c = masked[i];
    if (CLOSERS[c]) stack.push(CLOSERS[c]);
    else if (OPENERS[c]) {
      if (stack.length && stack[stack.length - 1] === c) stack.pop();
      else unclosed.push(i);
    }
  }
  return unclosed;
}

/** First meaningful character at or after `idx`, and whether only whitespace
 *  remains on the line. */
function firstAfter(masked, idx) {
  let i = idx;
  while (i < masked.length && (masked[i] === " " || masked[i] === "\t" || masked[i] === "\r")) i++;
  if (i >= masked.length) return { ch: null, eol: true };
  if (masked[i] === "\n") return { ch: "\n", eol: true };
  return { ch: masked[i], eol: false };
}

/** The callee expression immediately before the `(` at `parenIdx`, e.g.
 *  `_parallel` or `Promise.all`, plus where it starts. */
function calleeBefore(masked, parenIdx) {
  const end = prevTokenEnd(masked, parenIdx);
  if (end < 0) return { name: "", start: -1 };
  let s = end;
  while (s >= 0 && (IDENT_CH.test(masked[s]) || masked[s] === ".")) s--;
  return { name: masked.slice(s + 1, end + 1), start: s + 1 };
}

/** Split a destructuring pattern body on top-level commas. */
function splitTopLevel(text) {
  const parts = [];
  const stack = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (OPENERS[c]) stack.push(c);
    else if (CLOSERS[c]) stack.pop();
    else if (c === "," && stack.length === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** main()'s destructured parameter list: `{ name, local, init }` per element.
 *  `local` is the alias (`_agent: rawAgentFn` → `rawAgentFn`), `init` the text
 *  after `=`, or null when the element has no initialiser at all (E-2's first
 *  conjunct). Returns `null` when main() has no destructuring pattern. */
function parseMainParams(masked) {
  const m = /function\s+main\s*\(\s*\{/.exec(masked);
  if (!m) return null;
  const open = masked.indexOf("{", m.index);
  const close = matchForward(masked, open);
  if (close === -1) return null;
  return splitTopLevel(masked.slice(open + 1, close)).map((raw) => {
    const head = raw.split("=")[0];
    const init = raw.includes("=") ? raw.slice(raw.indexOf("=") + 1).trim() : null;
    const [nameRaw, localRaw] = head.split(":");
    return {
      raw,
      name: (nameRaw || "").trim(),
      local: localRaw ? localRaw.trim() : null,
      init,
    };
  });
}

/** Every `name(` call site in `masked`, as `{ name, index, openParen }`. */
function callSitesOf(masked, name) {
  const re = new RegExp(`(?<![A-Za-z0-9_$])${name.replace(/\$/g, "\\$")}\\s*\\(`, "g");
  const out = [];
  let m;
  while ((m = re.exec(masked)) !== null) {
    out.push({ name, index: m.index, openParen: re.lastIndex - 1 });
  }
  return out;
}

/** The forward half of §8.5's returned-promise ruling: the first token after
 *  the call's matching `)` is `;`, `,`, `)`, `}` or end of line. A `)` that
 *  cannot be reached at depth zero is undecidable, never an exemption. */
function callIsWholeExpression(masked, openParen) {
  const close = matchForward(masked, openParen);
  if (close === -1) return false;
  const after = firstAfter(masked, close + 1);
  return after.eol || after.ch === ";" || after.ch === "," || after.ch === ")" || after.ch === "}";
}

/** (b) The scan set: the thirteen names, their main()-destructured local
 *  aliases, and — as a fixed point — every named wrapper whose whole body is a
 *  call of an already-in-set name, so `agentFn` enters via `rawAgentFn`. */
function buildScanSet(masked, seedNames) {
  const set = new Set(seedNames);
  const params = parseMainParams(masked) || [];
  for (const p of params) {
    if (set.has(p.name) && p.local) set.add(p.local);
  }
  const WRAPPER =
    /\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s+)?(?:\([^()]*\)|[A-Za-z_$][A-Za-z0-9_$]*)\s*=>\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  let changed = true;
  while (changed) {
    changed = false;
    WRAPPER.lastIndex = 0;
    let m;
    while ((m = WRAPPER.exec(masked)) !== null) {
      const [wrapper, callee] = [m[1], m[2]];
      if (set.has(wrapper) || !set.has(callee)) continue;
      if (!callIsWholeExpression(masked, WRAPPER.lastIndex - 1)) continue;
      set.add(wrapper);
      changed = true;
    }
  }
  return set;
}

/** The combinator set, resolved through main()'s alias pattern the same way the
 *  seam names are (`_parallel: parallelFn` → `parallelFn` also awaits every
 *  element). One hop, through a pattern already parsed. */
function buildCombinatorSet(masked) {
  const set = new Set(AWAITING_COMBINATORS);
  for (const p of parseMainParams(masked) || []) {
    if (set.has(p.name) && p.local) set.add(p.local);
  }
  return set;
}

/**
 * (c) Classify one call site that is NOT lexically preceded by `await`, against
 * TSPEC §8.5's rulings. Returns "returned-promise",
 * "awaited-combinator-argument", or "unclassified" — never a silent pass.
 */
function classifyUnawaitedSite(masked, site, combinators) {
  // Returned promise — BOTH halves. §8.5 exempts the call only when it is the
  // entire body of an arrow or the entire operand of a `return`. A
  // backward-only test would exempt `() => _agent(a) && other` and
  // `return _checkFile(p) || fallback;`, which §8.5 exempts neither.
  const j = prevTokenEnd(masked, site.index);
  const arrowBefore = j >= 1 && masked[j] === ">" && masked[j - 1] === "=";
  const returnBefore = wordBefore(masked, site.index) === "return";
  if ((arrowBefore || returnBefore) && callIsWholeExpression(masked, site.openParen)) {
    return "returned-promise";
  }

  // Awaited combinator argument — the innermost unclosed delimiter is `[`, its
  // own enclosing unclosed delimiter is `(`, and the callee before that `(`
  // awaits every element and is itself lexically preceded by `await`.
  const unclosed = unclosedBefore(masked, site.index);
  if (unclosed.length >= 2 && masked[unclosed[0]] === "[" && masked[unclosed[1]] === "(") {
    const callee = calleeBefore(masked, unclosed[1]);
    if (
      combinators.has(callee.name) &&
      callee.start >= 0 &&
      wordBefore(masked, callee.start) === "await"
    ) {
      return "awaited-combinator-argument";
    }
  }

  return "unclassified";
}

/**
 * The whole mechanism. Returns the derived scan set and every call site of it,
 * each with its 1-based line, whether it is lexically preceded by `await`, and
 * — when it is not — its §8.5 ruling.
 */
function scanAwaitDiscipline(src) {
  const masked = maskLiterals(src);
  const scanSet = buildScanSet(masked, AT19_SEAM_NAMES);
  const combinators = buildCombinatorSet(masked);

  const sites = [];
  for (const name of scanSet) {
    for (const site of callSitesOf(masked, name)) {
      const awaited = wordBefore(masked, site.index) === "await";
      sites.push({
        name,
        index: site.index,
        line: masked.slice(0, site.index).split("\n").length,
        awaited,
        ruling: awaited ? "awaited" : classifyUnawaitedSite(masked, site, combinators),
      });
    }
  }
  sites.sort((a, b) => a.index - b.index);
  return { scanSet, combinators, sites, masked };
}

describe("stripModuleSyntax", () => {
  it("drops static import statements", () => {
    expect(stripModuleSyntax('import realMain from "./orchestrate-dev.js";\nconst a = 1;')).toBe(
      "const a = 1;"
    );
  });

  it("unwraps named and default exports", () => {
    expect(stripModuleSyntax("export const meta = {};")).toBe("const meta = {};");
    expect(stripModuleSyntax("export function f() {}")).toBe("function f() {}");
    expect(stripModuleSyntax("export async function g() {}")).toBe("async function g() {}");
    expect(stripModuleSyntax("export default async function main() {}")).toBe(
      "async function main() {}"
    );
  });

  it("leaves dynamic imports alone (they sit in overridden code paths)", () => {
    const src = 'const { execSync } = await import("child_process");';
    expect(stripModuleSyntax(src)).toBe(src);
  });
});

describe.each(BUNDLES)("%s", (file) => {
  it("declares meta as its first statement", () => {
    const firstCode = read(file)
      .split("\n")
      .find((line) => line.trim() && !line.trim().startsWith("//"));
    expect(firstCode).toMatch(/^export const meta = \{/);
  });

  it("exports nothing but meta", () => {
    const exports = read(file).match(/^export /gm) || [];
    expect(exports).toHaveLength(1);
  });

  it("contains no static import statement", () => {
    expect(read(file)).not.toMatch(/^import\s/m);
  });

  it("ends in a top-level return, so the runtime gets a result", () => {
    expect(read(file).trimEnd()).toMatch(/\}\);$/);
  });

  it("routes file IO through the agent-backed adapters", () => {
    const src = read(file);
    expect(src).toMatch(/_checkFile: rtCheckFile/);
    expect(src).toMatch(/_readFile: rtReadFile/);
  });
});

describe("bundle freshness", () => {
  it("is up to date with the canonical modules", () => {
    // Throws (non-zero exit) when a bundle would differ from what is on disk.
    execFileSync("node", [resolve(WORKFLOWS, "build-runtime.mjs"), "--check"], {
      cwd: REPO_ROOT,
      stdio: "pipe",
    });
  });

  it.each(BUNDLES)("keeps %s under pdlc/workflows/dist/ — the sole output directory (AC-6.1)", (file) => {
    // Fails with ENOENT until T-14 moves build-runtime.mjs's OUT_DIR to dist/.
    expect(() => readFileSync(resolve(DIST, file), "utf8")).not.toThrow();
  });

  it("keeps distribution-manifest.json in dist/ as a --check subject (TSPEC §2.3 point 3)", () => {
    // Fails with ENOENT until T-14 emits the manifest; once it exists, --check above must
    // also treat it as a freshness subject (that behavior lives in build-runtime.mjs, T-14).
    expect(() => readFileSync(MANIFEST_PATH, "utf8")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// DOD-03 — the freshness GATE itself must be falsifiable.
//
// The "bundle freshness" case above spawns `--check` against an already-fresh
// tree and asserts exit 0. That passes whether or not the staleness detector
// works: neutralising BOTH `stale = true` assignments in build-runtime.mjs
// (the bundle branch and the manifest branch) was MEASURED to leave the whole
// suite green. The cases below supply the missing direction — a tree that IS
// stale must exit non-zero and say so, naming each stale row.
//
// Everything happens in a throwaway tmpdir. The real pdlc/workflows/dist/ is
// never written to: `makeBuildTree()` copies the four inputs build-runtime.mjs
// reads (three module sources + itself) plus the plugin manifest into a fresh
// root, and runs the builder there, so OUT_DIR resolves inside the tmpdir.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// RLH-SCAN-01 — the scan mechanism's own oracle (PLAN §9.2 item 3, §7.5).
//
// RLH-AT-19 asserts the property; RLH-SCAN-01 asserts that the thing asserting
// it works. The mechanism DECIDES the answer: a line-local scan, an alias-blind
// scan and a structural scan return three different site sets, which is how the
// site count in PLAN §4.1 was wrong twice. Driven over inline literal source
// fixtures — one per ruling, a masked-delimiter case, and a shape matching no
// ruling — so the scanner is tested, not trusted.
// ---------------------------------------------------------------------------

const src = (...lines) => lines.join("\n");

/** The rulings of the non-`await`ed sites, keyed by name, in source order. */
const unawaitedRulings = (source) =>
  scanAwaitDiscipline(source)
    .sites.filter((s) => !s.awaited)
    .map((s) => [s.name, s.ruling]);

describe("RLH-SCAN-01: the await-discipline scan mechanism", () => {
  it("RLH-SCAN-01: alias — a seam called through its main() alias is in the scan set and still owes an await", () => {
    const fixture = src(
      'async function main({ _readFile: readFileFn = defaultReadFile } = {}) {',
      '  const a = await readFileFn("p");',
      '  readFileFn("q");',
      "  return a;",
      "}"
    );
    const { scanSet, sites } = scanAwaitDiscipline(fixture);

    // Scanning the `_` spelling alone would find zero sites and pass vacuously —
    // "the worst possible failure for this test" (TSPEC §8.5, alias row).
    expect(scanSet.has("readFileFn")).toBe(true);
    expect(sites.map((s) => [s.line, s.awaited])).toEqual([
      [2, true],
      [3, false],
    ]);
    expect(unawaitedRulings(fixture)).toEqual([["readFileFn", "unclassified"]]);
  });

  it("RLH-SCAN-01: returned promise — a named wrapper is exempt and enters the scan set by fixed point", () => {
    const fixture = src(
      'async function main({ _agent: rawAgentFn = agent } = {}) {',
      "  const agentFn = (skill, prompt, opts) =>",
      '    rawAgentFn(skill, prompt, { model: "opus", ...opts });',
      '  return await agentFn("pm-author", "go");',
      "}"
    );
    const { scanSet } = scanAwaitDiscipline(fixture);

    expect(scanSet.has("rawAgentFn")).toBe(true);
    expect(scanSet.has("agentFn")).toBe(true); // fixed point, via rawAgentFn
    expect(unawaitedRulings(fixture)).toEqual([["rawAgentFn", "returned-promise"]]);
  });

  it("RLH-SCAN-01: returned promise — a `return` operand is exempt, and only when it is the WHOLE operand", () => {
    expect(
      unawaitedRulings(
        src(
          "async function main({ _checkFile } = {}) {",
          "  return _checkFile(p);",
          "}"
        )
      )
    ).toEqual([["_checkFile", "returned-promise"]]);

    // Backward-only would exempt this; §8.5 exempts neither half alone.
    expect(
      unawaitedRulings(
        src(
          "async function main({ _checkFile } = {}) {",
          "  return _checkFile(p) || fallback;",
          "}"
        )
      )
    ).toEqual([["_checkFile", "unclassified"]]);
  });

  it("RLH-SCAN-01: awaited combinator argument — array elements of an awaited combinator are exempt", () => {
    const fixture = src(
      "async function main({ _agent, _parallel: parallelFn = parallel } = {}) {",
      "  const [r1, r2] = await parallelFn([",
      '    _agent("pm-review", p1),',
      '    _agent("se-review", p2),',
      "  ]);",
      "  return [r1, r2];",
      "}"
    );
    expect(unawaitedRulings(fixture)).toEqual([
      ["_agent", "awaited-combinator-argument"],
      ["_agent", "awaited-combinator-argument"],
    ]);

    // Promise.all has the property too; the alias hop is what admits parallelFn.
    expect(
      unawaitedRulings(
        src(
          "async function main({ _agent } = {}) {",
          '  return await Promise.all([_agent("a"), _agent("b")]);',
          "}"
        )
      )
    ).toEqual([
      ["_agent", "awaited-combinator-argument"],
      ["_agent", "awaited-combinator-argument"],
    ]);
  });

  it("RLH-SCAN-01: Promise.race / Promise.any do not await every element, so they do not exempt (TSPEC v1.7)", () => {
    for (const combinator of ["Promise.race", "Promise.any"]) {
      expect(
        unawaitedRulings(
          src(
            "async function main({ _agent, _sleep } = {}) {",
            `  return await ${combinator}([_agent("a"), _sleep(MS)]);`,
            "}"
          )
        )
      ).toEqual([["_agent", "unclassified"]]);
    }
  });

  it("RLH-SCAN-01: an un-awaited combinator does not exempt its elements", () => {
    expect(
      unawaitedRulings(
        src(
          "async function main({ _agent, _parallel } = {}) {",
          '  const p = _parallel([_agent("a")]);',
          "  return p;",
          "}"
        )
      )
    ).toEqual([["_agent", "unclassified"]]);
  });

  it("RLH-SCAN-01: masked delimiters — literals, comments and regexes contribute no site and no depth", () => {
    const fixture = src(
      "async function main({ _readFile: readFileFn = defaultReadFile } = {}) {",
      '  const note = "a ( unbalanced [ bracket and readFileFn( inside a string";',
      "  const tmpl = `a ( brace ${ note } and a template readFileFn(`;",
      "  // a comment with ( and readFileFn( in it",
      "  /* and a block comment with ) } ] */",
      "  const re = /\\(\\[readFileFn\\(/g;",
      '  return await readFileFn("p");',
      "}"
    );
    const { sites } = scanAwaitDiscipline(fixture);

    expect(sites.map((s) => [s.line, s.awaited, s.ruling])).toEqual([[7, true, "awaited"]]);
  });

  it("RLH-SCAN-01: a shape matching no ruling is reported unclassified, never a silent pass", () => {
    expect(
      unawaitedRulings(
        src(
          "async function main({ _agent } = {}) {",
          '  const f = () => _agent("x") && other;',
          "  return f;",
          "}"
        )
      )
    ).toEqual([["_agent", "unclassified"]]);

    // A discarded result — the C-2 defect this assertion exists to catch.
    expect(
      unawaitedRulings(
        src("async function main({ _writeFile } = {}) {", '  _writeFile("p", "body");', "}")
      )
    ).toEqual([["_writeFile", "unclassified"]]);
  });
});

describe("DOD-03 — build-runtime.mjs --check detects staleness", () => {
  const BUILD_INPUTS = [
    "build-runtime.mjs",
    "orchestrate-dev.js",
    "orchestrate-queue.js",
    "runtime-adapter.js",
  ];
  const tmpRoots = [];

  /** A self-contained repo root whose pdlc/workflows/dist/ was just built and
   * is therefore, by construction, in sync. */
  function makeBuildTree() {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "pdlc-buildcheck-")));
    tmpRoots.push(root);

    const workflows = join(root, "pdlc", "workflows");
    mkdirSync(workflows, { recursive: true });
    mkdirSync(join(root, "pdlc", ".claude-plugin"), { recursive: true });

    for (const file of BUILD_INPUTS) {
      copyFileSync(resolve(WORKFLOWS, file), join(workflows, file));
    }
    copyFileSync(
      resolve(REPO_ROOT, "pdlc", ".claude-plugin", "plugin.json"),
      join(root, "pdlc", ".claude-plugin", "plugin.json")
    );

    // Generate dist/ inside the tmpdir (no --check: this is the write path).
    execFileSync("node", [join(workflows, "build-runtime.mjs")], { cwd: root, stdio: "pipe" });
    return root;
  }

  /** Runs `--check` in `root` and returns { status, output } instead of throwing. */
  function runCheck(root) {
    try {
      const stdout = execFileSync(
        "node",
        [join(root, "pdlc", "workflows", "build-runtime.mjs"), "--check"],
        { cwd: root, encoding: "utf8", stdio: "pipe" }
      );
      return { status: 0, output: stdout };
    } catch (err) {
      return { status: err.status, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
    }
  }

  const distFile = (root, name) => join(root, "pdlc", "workflows", "dist", name);
  const perturb = (root, name) =>
    writeFileSync(distFile(root, name), `${readFileSync(distFile(root, name), "utf8")}\n// hand-edited\n`);

  afterAll(() => {
    for (const root of tmpRoots) rmSync(root, { recursive: true, force: true });
  });

  it("control: a freshly built temp tree passes --check (exit 0, no STALE row)", () => {
    const { status, output } = runCheck(makeBuildTree());
    expect(status).toBe(0);
    expect(output).not.toMatch(/STALE/);
    expect(output).toMatch(/in-sync {2}pdlc\/workflows\/dist\/distribution-manifest\.json/);
  });

  it("a perturbed BUNDLE makes --check exit non-zero and print a STALE row naming it", () => {
    const root = makeBuildTree();
    perturb(root, "orchestrate-dev.bundle.js");

    const { status, output } = runCheck(root);
    expect(status).not.toBe(0);
    expect(output).toMatch(/STALE {4}pdlc\/workflows\/dist\/orchestrate-dev\.bundle\.js/);
    // The manifest's sha1 is computed from the in-memory contents, never re-read
    // from disk, so a hand-edited bundle leaves the manifest itself in sync —
    // which is precisely why the manifest branch needs its own case below.
    expect(output).toMatch(/in-sync {2}pdlc\/workflows\/dist\/distribution-manifest\.json/);
    expect(output).toMatch(/Bundles are out of date/);
  });

  it("a perturbed MANIFEST alone makes --check exit non-zero and print a STALE row naming it", () => {
    const root = makeBuildTree();
    perturb(root, "distribution-manifest.json");

    const { status, output } = runCheck(root);
    expect(status).not.toBe(0);
    expect(output).toMatch(/STALE {4}pdlc\/workflows\/dist\/distribution-manifest\.json/);
    // No bundle was touched, so the bundle branch must NOT be what failed here.
    expect(output).not.toMatch(/STALE {4}pdlc\/workflows\/dist\/orchestrate-\w+\.bundle\.js/);
    expect(output).toMatch(/Bundles are out of date/);
  });

  it("both perturbed: --check exits non-zero and names every stale row", () => {
    const root = makeBuildTree();
    perturb(root, "orchestrate-dev.bundle.js");
    perturb(root, "orchestrate-queue.bundle.js");
    perturb(root, "distribution-manifest.json");

    const { status, output } = runCheck(root);
    expect(status).not.toBe(0);
    for (const name of [...BUNDLES, "distribution-manifest.json"]) {
      expect(output).toMatch(new RegExp(`STALE {4}pdlc/workflows/dist/${name.replace(/\./g, "\\.")}`));
    }
  });

  it("--check writes nothing: a stale tree stays stale after the check", () => {
    const root = makeBuildTree();
    perturb(root, "distribution-manifest.json");
    const before = readFileSync(distFile(root, "distribution-manifest.json"), "utf8");

    expect(runCheck(root).status).not.toBe(0);

    expect(readFileSync(distFile(root, "distribution-manifest.json"), "utf8")).toBe(before);
    expect(runCheck(root).status).not.toBe(0);
  });
});
