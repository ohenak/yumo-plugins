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
import { createRequire } from "module";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import { neutralizeDynamicImports, stripModuleSyntax } from "../build-runtime.mjs";

const requireHere = createRequire(import.meta.url);

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

// FSPEC AT-19's closed fourteen-name set, restated once in TSPEC §8.5 and
// cited here. NOT derived from main()'s parameter list: `_now` is a clock
// called synchronously at four sites in raisePrAndVerifyCi and
// `_phaseDodEnabled` / `_phasePubEnabled` / `_phaseMergeEnabled` are booleans
// never called, so a derived set reds on shipped, correct source (TSPEC
// §8.5, PLAN §9.2). `_ghRun` (PLAN A8) is Phase MERGE's single `gh` transport
// seam — every call site is awaited, same discipline as the rest of the set.
const AT19_SEAM_NAMES = Object.freeze([
  "_agent", "_readFile", "_writeFile", "_appendFile", "_checkFile", "_listFiles",
  "_git", "_checkCi", "_mergeWorktree", "_recordQueueRow", "_rebaseOntoDefault",
  "_dodVerifyLoop", "_raisePrAndVerifyCi", "_ghRun",
  // PROPOSAL §3.3 / M-6 — Phase I's command transport. Admitted on the same
  // judgement as `_ghRun`: an async IO seam the adapter implements with an
  // agent dispatch, whose every call site must be awaited.
  "_runCommand",
  // pdlc-consolidation-agent (TSPEC §11.3(c)) — consolidate-learnings.js's
  // async IO seams. `_now` is deliberately excluded: sync by contract
  // (TSPEC §5.6(b)), so awaiting it would be noise, not discipline.
  "_envPresent", "_makeTempDir",
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

  // Dynamic imports are not this layer's job — `neutralizeDynamicImports` (below)
  // removes them from the runtime bundles. Keeping them here means the CLI
  // artifact, which is plain Node and needs them, is built from the same strip.
  it("leaves dynamic imports alone (the runtime bundles neutralize them later)", () => {
    const src = 'const { execSync } = await import("child_process");';
    expect(stripModuleSyntax(src)).toBe(src);
  });
});

// The Workflow LAUNCHER parses statically and refuses to start on any `import(`
// token — "dead code in an overridden seam" is not a defence, because nothing has
// been injected yet at parse time. A bundle shipped with a surviving `import(`
// costs the whole pipeline its launch with `SyntaxError: import() is not
// available in workflow scripts`, which is how this oracle came to exist.
describe("neutralizeDynamicImports", () => {
  it("replaces an awaited dynamic import with a rejecting expression", () => {
    const out = neutralizeDynamicImports('const { execSync } = await import("child_process");');
    expect(out).not.toMatch(/\bimport\s*\(/);
    expect(out).toMatch(/await Promise\.reject\(new Error\(/);
  });

  it("keeps the specifier verbatim, so the site stays greppable", () => {
    expect(neutralizeDynamicImports('await import("fs")')).toContain('"fs"');
    expect(neutralizeDynamicImports("await import('child_process')")).toContain("'child_process'");
  });

  it("throws when a path this build believed dead is actually taken", async () => {
    // eslint-disable-next-line no-new-func
    const run = new Function(`return (async () => { ${neutralizeDynamicImports(
      'const { execSync } = await import("child_process"); return execSync;'
    )} })();`)();
    await expect(run).rejects.toThrow(/child_process.*unavailable in the workflow runtime/);
  });

  it("leaves code with no dynamic import untouched", () => {
    const src = "const a = 1;\nfunction f() { return important(a); }";
    expect(neutralizeDynamicImports(src)).toBe(src);
  });
});

describe.each(BUNDLES)("%s launcher constraint", (file) => {
  it("carries no dynamic import — the launcher rejects the script on sight", () => {
    expect(read(file).match(/\bimport\s*\(/g) || []).toEqual([]);
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
  // RLH-AT-20 (FSPEC AT-20) — dist/ is fresh in the same commit as any workflow
  // source change. The consumer half (`sync-workflows.sh --check`) is asserted
  // by the distribution suite; this is the built-artifact half.
  it("RLH-AT-20: dist/ is up to date with the canonical modules", () => {
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

  // pdlc-cli.mjs is a dist/ artifact but NOT a workflow bundle: it is plain Node,
  // keeps its imports and has no `meta`, so it is deliberately outside `BUNDLES`
  // and outside every runtime-constraint assertion above. What it shares with the
  // bundles is the output directory, the freshness gate and the manifest.
  it("keeps pdlc-cli.mjs under pdlc/workflows/dist/ with a manifest row", () => {
    expect(() => readFileSync(resolve(DIST, "pdlc-cli.mjs"), "utf8")).not.toThrow();
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
    const row = manifest.rows.find((r) => r.id === "pdlc-cli");
    expect(row).toMatchObject({
      id: "pdlc-cli",
      pluginPath: "workflows/dist/pdlc-cli.mjs",
      consumerPath: ".claude/workflows/pdlc-cli.mjs",
      artifactVersion: manifest.pluginVersion,
      retires: [],
    });
    expect(row.pluginSha1).toMatch(/^[0-9a-f]{40}$/);
  });

  it("a perturbed pdlc-cli.mjs is a --check subject like any other row", () => {
    // Covered end-to-end in the DOD-03 temp-tree suite below; here only the
    // artifact's membership in the emitted row set is asserted, so this case
    // cannot write into the live dist/.
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
    expect(manifest.rows.map((r) => r.id).sort()).toEqual([
      "orchestrate-dev",
      "orchestrate-queue",
      "pdlc-cli",
    ]);
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

// ---------------------------------------------------------------------------
// RLH-31 — RLH-AT-64's derivations (TSPEC §8.5, PLAN §9.3).
//
// AT-19 and AT-64 answer different questions and MUST NOT share a derivation:
// AT-64 asks *is every capability wired* — derived from main(), so a new seam
// cannot be forgotten; AT-19 asks *is every asynchronous call awaited* — a
// closed list, because membership is a design judgement.
// ---------------------------------------------------------------------------

/** The `_`-prefixed keys of one object literal, given the index of its `{`. */
function underscoreKeysOfObject(masked, openBrace) {
  const close = matchForward(masked, openBrace);
  if (close === -1) return [];
  return splitTopLevel(masked.slice(openBrace + 1, close))
    .map((entry) => /^(_[A-Za-z0-9_$]*)\s*[:,]?/.exec(entry.trim()))
    .filter(Boolean)
    .map((m) => m[1]);
}

/** rtDevInjections's returned object, read from runtime-adapter.js as it ships. */
function rtDevInjectionKeys(adapterSource) {
  const masked = maskLiterals(adapterSource);
  const m = /function\s+rtDevInjections\s*\([^)]*\)\s*\{/.exec(masked);
  if (!m) return [];
  const ret = masked.indexOf("return", m.index);
  if (ret === -1) return [];
  return underscoreKeysOfObject(masked, masked.indexOf("{", ret));
}

/**
 * D2 (TSPEC §11.2): the `_recordQueueRow` closure's own value text — the
 * arrow function assigned to that key inside a `.main({ … })` call in the
 * given entrypoint template (`DEV_ENTRY` / `QUEUE_ENTRY`), read from
 * build-runtime.mjs. Boundaries are found on the MASKED copy (so a comma or
 * brace inside a string/comment cannot mislead the walk), but the returned
 * text is sliced from the ORIGINAL body so it evaluates as real JS.
 */
function recordQueueRowClosureText(builderSource, entryName) {
  const decl = new RegExp(`const\\s+${entryName}\\s*=\\s*\``).exec(builderSource);
  expect(decl).not.toBeNull();
  const tplStart = builderSource.indexOf("`", decl.index) + 1;
  const tplEnd = builderSource.indexOf("`", tplStart);
  const body = builderSource.slice(tplStart, tplEnd);
  const masked = maskLiterals(body);
  const key = /_recordQueueRow\s*:/.exec(masked);
  expect(key).not.toBeNull();
  const valueStart = key.index + key[0].length;
  let depth = 0;
  let end = -1;
  for (let i = valueStart; i < masked.length; i++) {
    const c = masked[i];
    if (OPENERS[c]) {
      depth += 1;
    } else if (CLOSERS[c]) {
      if (depth === 0) {
        end = i;
        break;
      }
      depth -= 1;
    } else if (c === "," && depth === 0) {
      end = i;
      break;
    }
  }
  expect(end).toBeGreaterThan(valueStart);
  return body.slice(valueStart, end).trim();
}

/**
 * Every `_`-prefixed key supplied by a bundle entrypoint's injection object,
 * read from build-runtime.mjs's DEV_ENTRY / QUEUE_ENTRY template literals.
 * Every `.main({…})` argument object counts, including the one nested inside
 * QUEUE_ENTRY's `_runPipeline` closure — the only place `_recordQueueRow` is
 * supplied on the queue path (TSPEC §8.5, §7.2 edit 2b).
 */
function entrypointInjectionKeys(builderSource) {
  const keys = new Set();
  for (const name of ["DEV_ENTRY", "QUEUE_ENTRY"]) {
    const decl = new RegExp(`const\\s+${name}\\s*=\\s*\``).exec(builderSource);
    if (!decl) continue;
    const start = builderSource.indexOf("`", decl.index) + 1;
    const end = builderSource.indexOf("`", start);
    if (end === -1) continue;
    const masked = maskLiterals(builderSource.slice(start, end));
    const call = /\.main\s*\(\s*\{/g;
    let m;
    while ((m = call.exec(masked)) !== null) {
      for (const key of underscoreKeysOfObject(masked, masked.indexOf("{", m.index))) {
        keys.add(key);
      }
    }
  }
  return keys;
}

/** The parameter list of a module-level function declaration, or null. */
function moduleFunctionParams(masked, name) {
  const re = new RegExp(`^(?:export\\s+)?(?:async\\s+)?function\\s+${name}\\s*\\(`, "m");
  const m = re.exec(masked);
  if (!m) return null;
  const open = masked.indexOf("(", m.index);
  const close = matchForward(masked, open);
  return close === -1 ? null : masked.slice(open + 1, close);
}

/** The initialiser text of a module-level const/let/var declaration, or null. */
function moduleValueInit(masked, name) {
  const re = new RegExp(`^(?:export\\s+)?(?:const|let|var)\\s+${name}\\s*=\\s*(.*)$`, "m");
  const m = re.exec(masked);
  return m ? m[1].trim() : null;
}

const looksLikeFunction = (text) => /^(?:async\s+)?function\b/.test(text) || text.includes("=>");

/**
 * `null`/`undefined` — the ABSENCE of a capability, not a policy value.
 *
 * E-1 exempts a parameter whose default already IS the shipped behaviour: a
 * clock, a feature flag, a threshold. A default of `null` says the opposite —
 * the capability is not installed and every call site falls back — so it is no
 * evidence that the composition root needs to supply nothing. Treating it as
 * E-1 would let a real seam (`_probeDoc` and its two siblings, defaulted to
 * `NO_PROBE = null`) be exempt AND wired at once, which is precisely the drift
 * anti-rot clause 1 exists to catch. Tightening the predicate here keeps that
 * clause meaningful instead of muting it.
 */
const isAbsenceDefault = (text) => /^(?:null|undefined)$/.test(text.trim().replace(/[;,]\s*$/, ""));

/**
 * TSPEC §8.5's three exemption forms, each decided from source text — a
 * predicate over the parameter's OWN declaration, never a list of names.
 * Returns `{ form, resolved, why }`, or null when no form is even a candidate.
 * `resolved: false` is a FAILURE the assertion names (anti-rot clause 2), never
 * a silent exemption.
 */
function classifyExemption(masked, param) {
  // E-2 — pass-through: no `=` initialiser at all, AND forwarded in main()'s
  // body to at least one callee, EVERY one of which resolves (one alias hop
  // through main()'s own destructuring pattern, never a chain) to a
  // module-local function that declares the same name with a default. Zero
  // callees is still unresolved (nothing to point at); PLAN A8 added a
  // second, independent forward (`phaseMerge`, alongside the pre-existing
  // `raisePrAndVerifyCiFn` hop) for `_now`/`_sleep` — requiring EVERY
  // resolved callee to declare the default, rather than exactly one callee
  // to exist, is what keeps that a resolved E-2 instead of manufacturing a
  // false unresolved.
  if (param.init === null) {
    const callees = e2ForwardCallees(masked, param.name);
    if (callees.length === 0) {
      return { form: "E-2", resolved: false, why: `forwarded to ${callees.length} callees, not exactly 1` };
    }
    const resolutions = callees.map((callee) => {
      const target = resolveOneHop(masked, callee);
      const params = target ? moduleFunctionParams(masked, target) : null;
      const declaresWithDefault =
        params !== null &&
        new RegExp(`(?<![A-Za-z0-9_$])${param.name}(?![A-Za-z0-9_$])\\s*=`).test(params);
      return { callee, target, declaresWithDefault };
    });
    const bad = resolutions.filter((r) => !r.declaresWithDefault);
    return bad.length === 0
      ? {
          form: "E-2",
          resolved: true,
          why: resolutions.map((r) => `forwarded to ${r.callee} → ${r.target}`).join("; "),
        }
      : {
          form: "E-2",
          resolved: false,
          why: bad
            .map((r) => `${r.callee} → ${r.target ?? "unresolved"} does not declare ${param.name} with a default`)
            .join("; "),
        };
  }

  const init = param.init.trim().replace(/[;,]\s*$/, "");

  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(init)) {
    // E-3 — agent-composite: the default is a function declared in this module
    // whose own parameter list contains `_agent`. That declared parameter is
    // the discriminator, and no capability seam has one.
    const params = moduleFunctionParams(masked, init);
    if (params !== null) {
      const hasAgent = /(?<![A-Za-z0-9_$])_agent(?![A-Za-z0-9_$])/.test(params);
      return hasAgent
        ? { form: "E-3", resolved: true, why: `${init}() declares _agent` }
        : { form: "E-3", resolved: false, why: `${init}() is a module function but declares no _agent` };
    }
    // E-1 — policy value: the default identifier resolves to a module-level
    // declaration whose value is not a function.
    const value = moduleValueInit(masked, init);
    if (value === null) {
      return { form: "E-1", resolved: false, why: `${init} has no module-level declaration` };
    }
    if (isAbsenceDefault(value)) return null; // an absent capability, not a policy value
    return looksLikeFunction(value)
      ? { form: "E-1", resolved: false, why: `${init} resolves to a function value` }
      : { form: "E-1", resolved: true, why: `${init} = ${value}` };
  }

  // E-1's other half — a non-function literal default.
  if (isAbsenceDefault(init)) return null;
  if (!looksLikeFunction(init)) return { form: "E-1", resolved: true, why: `literal ${init}` };
  return null;
}

/** Distinct callees to which `name` is forwarded, bare, inside main()'s body. */
function e2ForwardCallees(masked, name) {
  const body = mainBodyRange(masked);
  if (!body) return [];
  const re = new RegExp(`(?<![A-Za-z0-9_$])${name}(?![A-Za-z0-9_$])`, "g");
  re.lastIndex = body.start;
  const callees = new Set();
  let m;
  while ((m = re.exec(masked)) !== null && m.index < body.end) {
    const before = masked[prevTokenEnd(masked, m.index)];
    const after = firstAfter(masked, m.index + name.length).ch;
    if (!(before === "{" || before === ",") || !(after === "," || after === "}")) continue;
    const unclosed = unclosedBefore(masked, m.index).filter((i) => masked[i] === "(");
    if (!unclosed.length) continue;
    const callee = calleeBefore(masked, unclosed[0]).name;
    if (callee) callees.add(callee);
  }
  return [...callees];
}

/** One hop — and one only. A callee that is a binding created by main()'s own
 *  destructuring pattern resolves through that pattern before the module is
 *  searched (`_x: xFn = moduleFn` → `moduleFn`). A chain is not authorised. */
function resolveOneHop(masked, callee) {
  for (const p of parseMainParams(masked) || []) {
    if (p.local === callee && p.init) return p.init.trim().replace(/[;,]\s*$/, "");
  }
  return callee;
}

/** The `{ … }` body of main(), as an index range into `masked`. */
function mainBodyRange(masked) {
  const m = /function\s+main\s*\(/.exec(masked);
  if (!m) return null;
  const paren = masked.indexOf("(", m.index);
  const parenClose = matchForward(masked, paren);
  if (parenClose === -1) return null;
  const open = masked.indexOf("{", parenClose);
  const close = matchForward(masked, open);
  return close === -1 ? null : { start: open, end: close };
}

// ---------------------------------------------------------------------------
// RLH-AT-19 — the bundle-level runtime constraint (FSPEC AT-19, TSPEC §8.5).
//
// TSPEC §8.1 calls this "the only thing standing between this design and this
// repo's most repeated defect class": the adapter's seam implementations are
// async while the jest doubles are synchronous, so a missing `await` passes
// every L1 and L2 test and fails only in the runtime.
//
// If this reds on source you believe correct, that is a PLAN §11 halt (`H-h`),
// not an invitation to widen a regex or add a name-based exemption. A test
// loosened ad hoc to go green is worse than none.
// ---------------------------------------------------------------------------

// consolidate-learnings.js is intentionally excluded here: it currently
// carries PLAN T02's throwing skeleton — main()'s body has zero seam call
// sites, so RLH-AT-19's vacuity guard (`sites.length > 0`) correctly reds on
// it. Scanning it is premature until the task that implements main()'s body
// lands; that task re-adds "consolidate-learnings.js" as part of making this
// step green. Never weaken the vacuity guard or add a name-based exemption
// instead (see the RLH-AT-19 header comment block above for why).
const AWAIT_SCAN_SOURCES = ["orchestrate-dev.js", "orchestrate-queue.js"];
const readSource = (file) => readFileSync(resolve(WORKFLOWS, file), "utf8");

describe("RLH-AT-19: the runtime constraint", () => {
  it.each(BUNDLES)("RLH-AT-19: %s makes no call or member reference to process or fetch", (file) => {
    const text = read(file);
    // The ANCHORED forms, never the bare-identifier ones: both healthy bundles
    // legitimately contain `child_process` (generated banner) and `git fetch
    // origin` (a prompt literal in rebaseOntoDefault), so a bare-identifier or
    // substring test is red on a correct artifact (FSPEC v1.3, SE-v3 F-15).
    expect(text.match(/\bprocess\s*\./g) || []).toEqual([]);
    expect(text.match(/\bfetch\s*\(/g) || []).toEqual([]);
  });

  it.each(AWAIT_SCAN_SOURCES)(
    "RLH-AT-19: every seam call site in %s is awaited or classified by a §8.5 ruling",
    (file) => {
      const { sites } = scanAwaitDiscipline(readSource(file));

      // Vacuity guard: a scanner gone blind — a broken alias derivation, a mask
      // that swallowed the file, a call-site regex that matched nothing —
      // returns an empty set over which the classification below is vacuously
      // true. Neither module's main() runs a pipeline without calling at least
      // one injected seam, so this is a lower bound that cannot drift upward.
      expect(sites.length).toBeGreaterThan(0);

      // A call site matching none of §8.5's three rulings is a failure this
      // assertion NAMES. The response is a source fix or a new ruling stated as
      // a predicate — never a fourth clause naming a line number, and never a
      // narrowing of the thirteen-name set.
      const unclassified = sites
        .filter((s) => s.ruling === "unclassified")
        .map((s) => `${file}:${s.line} — ${s.name}(…) is not awaited and matches no TSPEC §8.5 ruling`);
      expect(unclassified).toEqual([]);
    }
  );
});

// ---------------------------------------------------------------------------
// RLH-AT-64 — the composition root wires every seam (FSPEC AT-64, TSPEC §8.5).
//
// Asserted against the PRODUCTION composition root with NO injection whatsoever
// (§8.4: L3 may not inject anything): main()'s default-parameter behaviour,
// rtDevInjections's returned object and the entrypoint injection objects are
// inspected as they ship.
//
// This guards `orchestrate-dev`'s composition root ONLY. Extending it to
// orchestrate-queue.js is its own change and would red batches 5–10 by design
// (PLAN §7.3).
// ---------------------------------------------------------------------------

describe("RLH-AT-64: orchestrate-dev's composition root wires every seam", () => {
  const devMasked = maskLiterals(readSource("orchestrate-dev.js"));

  // DERIVED from main(), never hand-listed: a hand-list is the artefact that
  // rots — the next seam added would leave the test green while the runtime
  // receives `undefined` and throws on first use.
  const seams = (parseMainParams(devMasked) || []).filter((p) => /^_/.test(p.name));

  const wired = new Set([
    ...rtDevInjectionKeys(readSource("runtime-adapter.js")),
    ...entrypointInjectionKeys(readSource("build-runtime.mjs")),
  ]);

  const classified = seams.map((p) => {
    const exemption = classifyExemption(devMasked, p);
    return {
      name: p.name,
      wired: wired.has(p.name),
      exemption,
      exempt: Boolean(exemption && exemption.resolved),
    };
  });

  const report = (c) =>
    `${c.name}: wired=${c.wired} exemption=${c.exemption ? `${c.exemption.form}(${c.exemption.resolved ? "resolved" : "UNRESOLVED"}) — ${c.exemption.why}` : "none"}`;

  it("RLH-AT-64: the seam set is derived from main(), and is not empty", () => {
    expect(seams.length).toBeGreaterThan(0);
    // The derivation must be main()'s parameter list, not AT-19's closed list:
    // it carries policy values and pass-throughs that AT-19 deliberately omits.
    expect(seams.map((p) => p.name)).toEqual(expect.arrayContaining(["_now", "_phaseDodEnabled"]));
  });

  it("RLH-AT-64: every _-prefixed parameter of main() is wired or exempt", () => {
    // The failure names WHICH parameter fell in neither class, and its derived
    // classification — not merely that a count disagreed.
    expect(classified.filter((c) => !c.wired && !c.exempt).map(report)).toEqual([]);
  });

  it("RLH-AT-64: anti-rot 1 — a parameter classified exempt that is also wired is a failure", () => {
    // It would mean the predicate has drifted into admitting a real seam.
    expect(classified.filter((c) => c.wired && c.exempt).map(report)).toEqual([]);
  });

  it("RLH-AT-64: anti-rot 2 — exemption evidence must resolve, for all three forms including E-2", () => {
    // E-2 was the one form outside this clause, which made "exempt by declaring
    // a seam with no default" a silent pass (TE-v2 N-02).
    expect(
      classified.filter((c) => !c.wired && c.exemption && !c.exemption.resolved).map(report)
    ).toEqual([]);
  });

  it("RLH-AT-64: _recordQueueRow is wired, not exempt, whenever main() declares it", () => {
    // Deliberately absent from rtDevInjections because its implementation
    // differs by caller; satisfied by QUEUE_ENTRY's _runPipeline closure and by
    // DEV_ENTRY. If either is dropped, this reds — which is the whole point.
    const recordQueueRow = classified.find((c) => c.name === "_recordQueueRow");
    if (!recordQueueRow) return; // not yet declared on main() — RLH-18 adds it
    // The claim is TSPEC §8.5's and PLAN §9.3 item 1's, in their words: "wired,
    // NOT exempt" — asserted as the two derived fields, with `report` carrying
    // the derivation into the failure message.
    //
    // Not `exemption=none`. TSPEC §3.1 mandates the declaration
    // `_recordQueueRow: recordQueueRowFn = defaultRecordQueueRow`, and §8.5 says
    // of that very default: "`defaultRecordQueueRow` — a deliberate no-op —
    // declares no `_agent` either, so it stays on the wired side". An identifier
    // default that names a module function makes E-3 a CANDIDATE form by
    // construction; what §8.5 asks is that it not RESOLVE, i.e. `exempt ===
    // false`. Demanding the rendered string be `exemption=none` would instead
    // demand main() drop the default §3.1 prescribes — the test dictating the
    // composition root, backwards.
    expect(report(recordQueueRow)).toContain("wired=true");
    expect({ name: recordQueueRow.name, exempt: recordQueueRow.exempt, why: report(recordQueueRow) }).toMatchObject({
      exempt: false,
    });
  });

  it("RLH-AT-64 vacuity guard: no seam named _recordHalt remains anywhere in the repo", () => {
    // R1's negative assertion (PLAN §12, K-3): a rename that is not also
    // followed through here would leave the test above silently vacuous
    // (`if (!recordHalt) return;`) instead of red. Scanning the classified seam
    // list — derived from main()'s own parameter list — closes the trap: the
    // renamed seam must be present, and the retired name must not.
    expect(classified.some((c) => c.name === "_recordQueueRow")).toBe(true);
    expect(classified.some((c) => c.name === "_recordHalt")).toBe(false);
  });

  it("RLH-AT-64: the E-2 alias hop is one hop, through main()'s own destructuring pattern", () => {
    // main() forwards _now/_sleep to two independent callees: the destructured
    // local raisePrAndVerifyCiFn (which needs the one-hop alias resolution
    // below) and phaseMerge (called directly, so resolveOneHop's no-match
    // fallback resolves it too — that's the second assertion here doing double
    // duty as the "someUnknownCallee" no-hop case). Without the hop, the first
    // falls in no class and AT-64 reds on shipped, correct source. A chain is
    // not authorised: resolveOneHop returns the callee unchanged when it is not
    // a main()-pattern binding.
    expect(resolveOneHop(devMasked, "raisePrAndVerifyCiFn")).toBe("raisePrAndVerifyCi");
    expect(resolveOneHop(devMasked, "someUnknownCallee")).toBe("someUnknownCallee");
  });
});

describe("DOD-03 — build-runtime.mjs --check detects staleness", () => {
  const BUILD_INPUTS = [
    "build-runtime.mjs",
    "orchestrate-dev.js",
    "orchestrate-queue.js",
    "runtime-adapter.js",
    // dist/pdlc-cli.mjs's source: the builder reads it like any other input, so
    // a tree without it cannot build at all.
    "cli.mjs",
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

  it("a perturbed pdlc-cli.mjs makes --check exit non-zero and print a STALE row naming it", () => {
    const root = makeBuildTree();
    perturb(root, "pdlc-cli.mjs");

    const { status, output } = runCheck(root);
    expect(status).not.toBe(0);
    expect(output).toMatch(/STALE {4}pdlc\/workflows\/dist\/pdlc-cli\.mjs/);
    expect(output).not.toMatch(/STALE {4}pdlc\/workflows\/dist\/orchestrate-\w+\.bundle\.js/);
  });

  it("the built pdlc-cli.mjs parses as a plain-Node ES module (node --check)", () => {
    const root = makeBuildTree();
    // `stripModuleSyntax` removed the dev module's own imports, so this passes
    // only if the artifact re-supplies every module-scope identifier the
    // stripped body still references.
    expect(() =>
      execFileSync("node", ["--check", distFile(root, "pdlc-cli.mjs")], { stdio: "pipe" })
    ).not.toThrow();
  });

  it.each(["orchestrate-dev.bundle.js", "orchestrate-queue.bundle.js"])(
    "the stripped %s parses as the runtime will parse it (comment stripping is a red suite, not a corrupt artifact)",
    (file) => {
      const root = makeBuildTree();
      const code = readFileSync(distFile(root, file), "utf8");
      // The builder's dependency-free stripper is verified here with the test
      // environment's real parser — the builder itself may not require it
      // (fresh-clone bootstrap runs before npm install).
      const babel = requireHere("@babel/core");
      expect(() =>
        babel.parseSync(code, {
          configFile: false,
          babelrc: false,
          parserOpts: {
            sourceType: "module",
            allowAwaitOutsideFunction: true,
            allowReturnOutsideFunction: true,
          },
        })
      ).not.toThrow();
      // And the stripper actually earned its keep: under the runtime's script
      // size ceiling, which is what forced stripping in the first place.
      expect(code.length).toBeLessThan(524288);
    }
  );

  it("--check writes nothing: a stale tree stays stale after the check", () => {
    const root = makeBuildTree();
    perturb(root, "distribution-manifest.json");
    const before = readFileSync(distFile(root, "distribution-manifest.json"), "utf8");

    expect(runCheck(root).status).not.toBe(0);

    expect(readFileSync(distFile(root, "distribution-manifest.json"), "utf8")).toBe(before);
    expect(runCheck(root).status).not.toBe(0);
  });
});

// ---------------------------------------------------------------------------
// RLH-CR-F1 — Phase CR finding F-1: `forcePhases` must have a reachable,
// declared invocation channel in the SHIPPED artifact.
//
// The module's `meta.inputs` is dead in the bundle (`stripModuleSyntax` keeps it
// inside the `__dev` IIFE, where nothing reads it); the `meta` the runtime reads
// is `build-runtime.mjs`'s hand-written `DEV_META`. If that copy declares no
// `inputs`, the operator has no declared way to pass `forcePhases` at all.
//
// What is asserted, and against what (CR F-8 — the earlier wording here claimed
// more than this suite delivers). Both halves read `dist/orchestrate-dev.bundle.js`,
// but they do NOT pin the *tracked* bytes: line 18's `import … from
// "../build-runtime.mjs"` runs the builder — the module is a top-level script
// with no entry guard — so `dist/` has already been rebuilt from the current
// sources before the first assertion executes. What these two cases therefore
// assert is that a bundle built from today's `build-runtime.mjs` + `orchestrate-dev.js`
// declares `inputs` on the runtime-visible `meta` and honours both argument
// shapes; they red against a mutation of the builder's source, not against a
// hand-perturbed `dist/`. Freshness of the tracked artifact is a separate
// guarantee, genuinely covered by `DOD-03`'s temp-root tests, which build in a
// `mkdtemp` root this import cannot repair.
// ---------------------------------------------------------------------------

describe("RLH-CR-F1: the shipped dev bundle declares and honours its inputs", () => {
  const DEV_BUNDLE = "orchestrate-dev.bundle.js";

  /** The leading `export const meta = { … };` literal, evaluated. */
  function shippedMeta(file) {
    const src = read(file);
    const start = src.indexOf("export const meta = ");
    expect(start).toBeGreaterThanOrEqual(0);
    const open = src.indexOf("{", start);
    const end = src.indexOf("\n};", open);
    expect(end).toBeGreaterThan(open);
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${src.slice(open, end + 2)});`)();
  }

  /**
   * Evaluate the entrypoint's two argument reads (`__reqPath`, `__forcePhases`)
   * for a given `args`, by lifting the emitted `const` declarations out of the
   * bundle rather than restating them here.
   */
  function readArgs(args) {
    const src = read(DEV_BUNDLE);
    const decls = ["__reqPath", "__forcePhases"].map((name) => {
      const at = src.indexOf(`const ${name} =`);
      expect(at).toBeGreaterThanOrEqual(0);
      const end = src.indexOf(";", at);
      expect(end).toBeGreaterThan(at);
      return src.slice(at, end + 1);
    });
    // eslint-disable-next-line no-new-func
    return Function("args", `"use strict"; ${decls.join("\n")}\nreturn { __reqPath, __forcePhases };`)(
      args
    );
  }

  /**
   * The `FORCE_PHASE_TOKENS` array as the module declares it, lifted from
   * `orchestrate-dev.js`'s source rather than restated here (CR F-7: a
   * hard-coded catalogue lets the operator-facing description go stale
   * silently). The constant is deliberately not exported — C-2 permits exactly
   * one `export` in a workflow source — so it is read as text and evaluated.
   */
  function forcePhaseTokens() {
    const src = readFileSync(resolve(WORKFLOWS, "orchestrate-dev.js"), "utf8");
    const at = src.indexOf("const FORCE_PHASE_TOKENS =");
    expect(at).toBeGreaterThanOrEqual(0);
    const end = src.indexOf(";", at);
    expect(end).toBeGreaterThan(at);
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; ${src.slice(at, end + 1)}\nreturn FORCE_PHASE_TOKENS;`)();
  }

  it("RLH-CR-F1: DEV_META declares reqPath and forcePhases as inputs", () => {
    const meta = shippedMeta(DEV_BUNDLE);
    expect(Array.isArray(meta.inputs)).toBe(true);
    const byName = Object.fromEntries(meta.inputs.map((i) => [i.name, i]));
    expect(Object.keys(byName).sort()).toEqual(["forcePhases", "reqPath"]);
    expect(byName.reqPath.required).toBe(true);
    expect(byName.forcePhases.required).toBe(false);
    // The catalogue the operator is told about must be the one the module
    // enforces — derived from FORCE_PHASE_TOKENS, never restated (CR F-7).
    for (const token of [...forcePhaseTokens(), "all"]) {
      expect(byName.forcePhases.description).toContain(token);
    }
  });

  it("RLH-CR-F1: the string form still yields reqPath, and the object form reaches forcePhases", () => {
    // The documented invocation — `/pdlc:orchestrate-dev docs/f/REQ-f.md`.
    expect(readArgs("  docs/f/REQ-f.md  ")).toEqual({
      __reqPath: "docs/f/REQ-f.md",
      __forcePhases: null,
    });

    // The named-input form the runtime delivers once `inputs` is declared.
    expect(readArgs({ reqPath: "docs/f/REQ-f.md", forcePhases: "R,F" })).toEqual({
      __reqPath: "docs/f/REQ-f.md",
      __forcePhases: "R,F",
    });

    // reqPath alone, as an object: forcePhases stays absent, not undefined.
    expect(readArgs({ reqPath: "docs/f/REQ-f.md" })).toEqual({
      __reqPath: "docs/f/REQ-f.md",
      __forcePhases: null,
    });
  });

  it("D2 (TSPEC §11.2): DEV_META.phases gains a trailing Phase MERGE row", () => {
    const meta = shippedMeta(DEV_BUNDLE);
    expect(Array.isArray(meta.phases)).toBe(true);
    const mergeRow = meta.phases.find((p) => p.title === "Phase MERGE");
    expect(mergeRow).toBeDefined();
    expect(mergeRow.detail).toBe("merge the PR + advance the queue row");
    // §10.4: Phase MERGE runs immediately after Phase PUB — the only place the
    // operator-visible phase list can show that ordering is as the last row.
    expect(meta.phases[meta.phases.length - 1].title).toBe("Phase MERGE");
  });
});

// ---------------------------------------------------------------------------
// D2 (TSPEC §11.2, §7.2 edit 3+4) — both entrypoint closures thread a merged
// run's evidence through to `rewriteStatus`'s 7th argument, so the queue row
// an operator reads after a merge carries the `{shortSha} #{n}` / `merged
// #{n}` cell §8.3/§8.4 compute rather than an empty one.
// ---------------------------------------------------------------------------

describe("D2: both entrypoints thread evidence through _recordQueueRow (TSPEC §11.2)", () => {
  const builderSource = readFileSync(resolve(WORKFLOWS, "build-runtime.mjs"), "utf8");

  it.each(["QUEUE_ENTRY", "DEV_ENTRY"])(
    "%s's _recordQueueRow closure forwards evidence as rewriteStatus's 7th argument",
    async (entryName) => {
      const closureText = recordQueueRowClosureText(builderSource, entryName);
      const calls = [];
      const stubQueue = {
        DEFAULT_QUEUE_PATH: "docs/_queue/QUEUE.md",
        rewriteStatus: (...args) => {
          calls.push(args);
          return { queueRow: "recorded" };
        },
      };
      // eslint-disable-next-line no-new-func
      const closure = Function(
        "__queue",
        "__queuePath",
        "rtReadFile",
        "rtWriteFile",
        "rtGit",
        `"use strict"; return (${closureText});`
      )(stubQueue, "docs/_queue/QUEUE.md", "READ", "WRITE", "GIT");

      await closure({ feature: "f", status: "done", evidence: "abc1234 #45" });

      expect(calls).toHaveLength(1);
      // rewriteStatus's signature is (queuePath, feature, status, readFileFn,
      // writeFileFn, gitFn, evidence) — 7 positional arguments, evidence last.
      expect(calls[0]).toHaveLength(7);
      expect(calls[0][1]).toBe("f");
      expect(calls[0][2]).toBe("done");
      expect(calls[0][6]).toBe("abc1234 #45");
    }
  );

  it.each(["QUEUE_ENTRY", "DEV_ENTRY"])(
    "%s's _recordQueueRow closure still forwards a null/absent evidence unchanged",
    async (entryName) => {
      const closureText = recordQueueRowClosureText(builderSource, entryName);
      const calls = [];
      const stubQueue = {
        DEFAULT_QUEUE_PATH: "docs/_queue/QUEUE.md",
        rewriteStatus: (...args) => {
          calls.push(args);
          return { queueRow: "none" };
        },
      };
      // eslint-disable-next-line no-new-func
      const closure = Function(
        "__queue",
        "__queuePath",
        "rtReadFile",
        "rtWriteFile",
        "rtGit",
        `"use strict"; return (${closureText});`
      )(stubQueue, "docs/_queue/QUEUE.md", "READ", "WRITE", "GIT");

      await closure({ feature: "f", status: "halted" });

      expect(calls).toHaveLength(1);
      expect(calls[0]).toHaveLength(7);
      expect(calls[0][6]).toBeUndefined();
    }
  );
});

// ---------------------------------------------------------------------------
// RLH-AT-65: no C0 control bytes in workflow source or built artifacts.
//
// A stray NUL (0x00) once sat in orchestrate-dev.js as the erratum dedup-key
// separator (`${docType}\x00${item}`, a mistyped space). It passed every
// behavioural test — a NUL separates Map keys as well as a space — yet it made
// the file "binary" to grep and, worse, was inlined verbatim into the shipped
// bundle, where the Workflow launcher's permission dialog rejects control
// characters and refuses to run the pipeline at all. This oracle is byte-level
// and covers both the tested source and the artifacts the runtime actually
// loads, so the class cannot regress silently.
describe("RLH-AT-65: no C0 control bytes in workflow source or artifacts", () => {
  // 0x09 tab, 0x0A LF, 0x0D CR are the only C0 bytes text may carry.
  const forbidden = (buf) => {
    const hits = [];
    for (let i = 0; i < buf.length; i++) {
      const b = buf[i];
      if (b <= 0x1f && b !== 0x09 && b !== 0x0a && b !== 0x0d) {
        hits.push({ offset: i, byte: "0x" + b.toString(16).padStart(2, "0") });
      }
    }
    return hits;
  };

  const SOURCES = [
    "orchestrate-dev.js",
    "cli.mjs",
    "build-runtime.mjs",
    "runtime-adapter.js",
  ];
  it.each(SOURCES)("source %s carries no C0 control byte", (name) => {
    const hits = forbidden(readFileSync(resolve(WORKFLOWS, name)));
    expect(hits).toEqual([]);
  });

  const ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"];
  it.each(ARTIFACTS)("built artifact %s carries no C0 control byte", (name) => {
    const hits = forbidden(readFileSync(resolve(DIST, name)));
    expect(hits).toEqual([]);
  });
});
