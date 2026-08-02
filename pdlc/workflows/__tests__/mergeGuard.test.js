/**
 * mergeGuard.test.js — Phase MERGE's self-modification guard (PLAN A3, TSPEC
 * §6.1–§6.4, FSPEC §4).
 *
 * Covers the PURE arms only (TSPEC §6.4's "Pure" row): `effectiveGuardPaths`
 * and `guardVerdict` in isolation. The integration level of AT-M3 — driving
 * the same two arms through `phaseMerge` end to end — belongs to PLAN task
 * A7 (`mergePhase.test.js`); this file asserts the pure decision the guard is
 * built from, which is what A7's integration arms depend on being correct.
 *
 *   - AT-M3 (pure level): two arms differing in exactly one guard-matching
 *     path produce opposite `fired` values, `matched` exact on the positive
 *     arm.
 *   - The three near-miss lists (§4.2) each reproduce the negative arm
 *     exactly (`fired: false`).
 *   - PROP-M-06's five-case control block is A7/A3-owned per PLAN — the
 *     "guard dominance" integration property lives with A7's phase-level
 *     suite; this file owns only the pure arms it depends on.
 *   - PROP-M-07 — additivity/irremovability of `MERGE_GUARD_DEFAULTS`.
 *   - PROP-M-08 — prefix exactness vs. an independent reference predicate.
 *   - TSPEC §6.3's scoped no-override assertion: arity, extracted-body token
 *     scan, and the config-shaped third argument case.
 *
 * RED-terminal (PLAN batch 4, task A3): `effectiveGuardPaths` and
 * `guardVerdict` are not yet exported by orchestrate-dev.js — under this
 * project's native-ESM jest runtime, importing a named binding a module does
 * not yet provide fails the whole file to load with a SyntaxError naming the
 * missing export.
 */

import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import {
  effectiveGuardPaths,
  guardVerdict,
  MERGE_GUARD_DEFAULTS,
} from "../orchestrate-dev.js";
import { seeded, resolveSeed, MERGE_PROP_SEED } from "./helpers/mergeDoubles.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = resolve(HERE, "..", "orchestrate-dev.js");

const MERGE_GUARD_DEFAULTS_SNAPSHOT = JSON.parse(JSON.stringify(MERGE_GUARD_DEFAULTS));

function assertDefaultsUntouched() {
  expect(MERGE_GUARD_DEFAULTS).toEqual(MERGE_GUARD_DEFAULTS_SNAPSHOT);
  expect(Object.isFrozen(MERGE_GUARD_DEFAULTS)).toBe(true);
}

// ─── effectiveGuardPaths ────────────────────────────────────────────────────

describe("effectiveGuardPaths — additive by construction (TSPEC §6.1, FSPEC §4.3)", () => {
  test("with no configuration, returns exactly the four shipped defaults", () => {
    expect(effectiveGuardPaths(undefined)).toEqual([...MERGE_GUARD_DEFAULTS]);
    assertDefaultsUntouched();
  });

  test("every default member is present regardless of configuration shape", () => {
    const inputs = [
      undefined,
      null,
      42,
      "str",
      {},
      [],
      [null],
      [1, 2],
      [{}],
      [" "],
      ["pdlc/workflows"], // duplicate-of-a-default, no trailing slash
      [".claude/workflows/"], // duplicate-of-a-default, exact
      ["!pdlc/workflows/"], // removal-shaped — silently unioned, not honoured
      [""], // empty string, dropped
    ];
    for (const configured of inputs) {
      const result = effectiveGuardPaths(configured);
      for (const d of MERGE_GUARD_DEFAULTS) {
        expect(result).toContain(d);
      }
    }
    assertDefaultsUntouched();
  });

  test("a removal-shaped entry does not remove a default (irremovability)", () => {
    const result = effectiveGuardPaths(["!pdlc/workflows/"]);
    expect(result).toContain("pdlc/workflows/");
    expect(result).toContain("!pdlc/workflows/");
    // the removal-shaped entry matches nothing real — asserted via guardVerdict
    const verdict = guardVerdict({ ok: true, files: ["pdlc/workflows/x.js"] }, result);
    expect(verdict.fired).toBe(true); // the real default still fires it
    assertDefaultsUntouched();
  });

  test("configured paths gain a trailing slash so a bare form matches identically", () => {
    const withSlash = effectiveGuardPaths(["src/pipeline/"]);
    const withoutSlash = effectiveGuardPaths(["src/pipeline"]);
    expect(withSlash).toEqual(withoutSlash);
    expect(withSlash).toContain("src/pipeline/");
    expect(withSlash).not.toContain("src/pipeline-notes/");
  });

  test("non-string members are dropped, not thrown on", () => {
    const result = effectiveGuardPaths([42, null, {}, "extra/"]);
    expect(result).toContain("extra/");
    expect(result.filter((p) => typeof p !== "string")).toHaveLength(0);
  });

  test("no duplicates in the result even when configured paths repeat a default", () => {
    const result = effectiveGuardPaths(["pdlc/workflows/", "pdlc/workflows"]);
    const count = result.filter((p) => p === "pdlc/workflows/").length;
    expect(count).toBe(1);
  });
});

// ─── guardVerdict — the pure decision ──────────────────────────────────────

describe("guardVerdict — pure decision (TSPEC §6.2, FSPEC §4.2/§4.4)", () => {
  const DEFAULTS = [...MERGE_GUARD_DEFAULTS];

  test("fail-closed: changed is null/undefined", () => {
    expect(guardVerdict(null, DEFAULTS)).toEqual({
      fired: true,
      kind: "unretrievable",
      matched: [],
    });
    expect(guardVerdict(undefined, DEFAULTS)).toEqual({
      fired: true,
      kind: "unretrievable",
      matched: [],
    });
  });

  test("fail-closed: changed.ok is not strictly true", () => {
    expect(guardVerdict({ ok: false }, DEFAULTS)).toEqual({
      fired: true,
      kind: "unretrievable",
      matched: [],
    });
    expect(guardVerdict({ ok: "true", files: [] }, DEFAULTS)).toEqual({
      fired: true,
      kind: "unretrievable",
      matched: [],
    });
  });

  test("clear: ok and no file matches any guard path", () => {
    const verdict = guardVerdict({ ok: true, files: ["README.md", "src/x.ts"] }, DEFAULTS);
    expect(verdict).toEqual({ fired: false, kind: "clear", matched: [] });
  });

  test("match: any one file under a guard path fires it, reporting only matches", () => {
    const verdict = guardVerdict(
      { ok: true, files: ["README.md", "pdlc/workflows/orchestrate-dev.js"] },
      DEFAULTS,
    );
    expect(verdict).toEqual({
      fired: true,
      kind: "match",
      matched: ["pdlc/workflows/orchestrate-dev.js"],
    });
  });

  test("matched preserves observed order and reports every match, not just the first", () => {
    const files = ["pdlc/skills/a.md", "docs/x.md", "pdlc/hooks/b.sh"];
    const verdict = guardVerdict({ ok: true, files }, DEFAULTS);
    expect(verdict.matched).toEqual(["pdlc/skills/a.md", "pdlc/hooks/b.sh"]);
  });

  test("deletions and both rename sides are included — the observed list is not filtered", () => {
    const files = [
      "pdlc/workflows/deleted.js", // a deletion, reported like any other path
      "old/pdlc/skills/renamed-from.md", // old path of a rename, no match itself
      "pdlc/skills/renamed-to.md", // new path of a rename
    ];
    const verdict = guardVerdict({ ok: true, files }, DEFAULTS);
    expect(verdict.matched).toEqual(["pdlc/workflows/deleted.js", "pdlc/skills/renamed-to.md"]);
  });
});

// ─── AT-M3, pure level ──────────────────────────────────────────────────────

describe("AT-M3 — pure two-arm falsifiability (TSPEC §6.4)", () => {
  const DEFAULTS = [...MERGE_GUARD_DEFAULTS];

  test("arm A: a changed-file list with no guard-matching path does not fire", () => {
    const verdict = guardVerdict(
      { ok: true, files: ["docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md"] },
      DEFAULTS,
    );
    expect(verdict.fired).toBe(false);
    expect(verdict.matched).toEqual([]);
  });

  test("arm B: the identical fixture plus pdlc/skills/x.md fires, matched exactly that path", () => {
    const verdict = guardVerdict(
      {
        ok: true,
        files: ["docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md", "pdlc/skills/x.md"],
      },
      DEFAULTS,
    );
    expect(verdict.fired).toBe(true);
    expect(verdict.matched).toEqual(["pdlc/skills/x.md"]);
  });

  test.each([
    ["pdlc/skills-notes/x.md"],
    ["docs/pdlc/skills/x.md"],
    ["PDLC/Skills/x.md"],
  ])("near-miss %s reproduces arm A exactly (fired: false, no matches)", (path) => {
    const verdict = guardVerdict(
      { ok: true, files: ["docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md", path] },
      DEFAULTS,
    );
    expect(verdict.fired).toBe(false);
    expect(verdict.matched).toEqual([]);
  });
});

// ─── TSPEC §6.3 — no-override assertion ────────────────────────────────────

describe("no override exists (TSPEC §6.3, NFR-3)", () => {
  test("arity: neither function accepts a third parameter", () => {
    expect(guardVerdict.length).toBe(2);
    expect(effectiveGuardPaths.length).toBe(1);
  });

  test("a config-shaped third argument to guardVerdict changes nothing", () => {
    const files = ["pdlc/skills/x.md"];
    const a = guardVerdict({ ok: true, files }, [...MERGE_GUARD_DEFAULTS]);
    const b = guardVerdict({ ok: true, files }, [...MERGE_GUARD_DEFAULTS], {
      mergeMode: "on",
      guardPaths: [],
      allowOverride: true,
    });
    expect(b).toEqual(a);
  });

  test("extracted source bodies of both functions contain no override-shaped token", () => {
    const source = readFileSync(SOURCE_PATH, "utf8");
    const forbidden = ["config", "process", "argv", "env", "force", "override", "bypass", "skip"];
    for (const name of ["effectiveGuardPaths", "guardVerdict"]) {
      const body = extractFunctionBody(source, name);
      expect(body).not.toBeNull();
      const masked = maskLiterals(body);
      for (const token of forbidden) {
        const re = new RegExp(`\\b${token}\\b`, "i");
        expect(re.test(masked)).toBe(false);
      }
    }
  });
});

// ─── PROP-M-07 — additivity / irremovability ───────────────────────────────

describe("PROP-M-07 — result contains all defaults for every input (TSPEC §6.1)", () => {
  const seed = resolveSeed(MERGE_PROP_SEED);
  const rng = seeded(seed);

  const NON_ARRAY_SHAPES = [
    undefined,
    null,
    42,
    "str",
    {},
    [],
    [null],
    [1, 2],
    [{}],
    [" "],
    ["pdlc/workflows"],
    [".claude/workflows/"],
  ];

  function randomPathString() {
    const segments = ["", "a", "!", " ", "pdlc/workflows/", "src/x", "docs/", "!!!", "z/"];
    const len = rng.int(0, 3);
    const parts = [];
    for (let i = 0; i < len; i++) parts.push(rng.pick(segments));
    return parts.join("");
  }

  test(`enumerated non-array shapes (n=${NON_ARRAY_SHAPES.length}) — result ⊇ defaults`, () => {
    expect(NON_ARRAY_SHAPES).toHaveLength(12);
    for (const shape of NON_ARRAY_SHAPES) {
      const result = effectiveGuardPaths(shape);
      for (const d of MERGE_GUARD_DEFAULTS) expect(result).toContain(d);
      for (const p of result) expect(p.endsWith("/")).toBe(true);
      const seen = new Set(result);
      expect(seen.size).toBe(result.length);
    }
  });

  test("500 seeded random string-array inputs — result ⊇ defaults, no dupes, frozen source untouched", () => {
    for (let i = 0; i < 500; i++) {
      const len = rng.int(0, 4);
      const arr = [];
      for (let j = 0; j < len; j++) arr.push(randomPathString());

      let result;
      try {
        result = effectiveGuardPaths(arr);
      } catch (e) {
        throw new Error(
          `PROP-M-07 failed at seed=${seed}, case=${JSON.stringify(arr)}: ${e.message}`,
        );
      }

      for (const d of MERGE_GUARD_DEFAULTS) {
        if (!result.includes(d)) {
          throw new Error(
            `PROP-M-07 failed at seed=${seed}, case=${JSON.stringify(arr)}: missing default "${d}"`,
          );
        }
      }
      for (const p of result) {
        if (!p.endsWith("/")) {
          throw new Error(
            `PROP-M-07 failed at seed=${seed}, case=${JSON.stringify(arr)}: "${p}" lacks trailing slash`,
          );
        }
      }
      const seen = new Set(result);
      if (seen.size !== result.length) {
        throw new Error(
          `PROP-M-07 failed at seed=${seed}, case=${JSON.stringify(arr)}: duplicate entries in result`,
        );
      }
    }
    assertDefaultsUntouched();
  });
});

// ─── PROP-M-08 — prefix exactness vs. an independent reference predicate ──

describe("PROP-M-08 — prefix exactness vs. an independent reference predicate (FSPEC §4.2)", () => {
  const seed = resolveSeed(MERGE_PROP_SEED);
  const rng = seeded(seed + 1);
  const DEFAULTS = [...MERGE_GUARD_DEFAULTS];

  // Independently written from guardVerdict's own startsWith — a slice-based
  // rule expressing the identical semantics a different way, so a
  // startsWith→includes or case-folding mutant is caught by disagreement.
  function referenceFires(files, guards) {
    return files.some((p) => guards.some((g) => p.slice(0, g.length) === g));
  }
  function referenceMatched(files, guards) {
    return files.filter((p) => guards.some((g) => p.slice(0, g.length) === g));
  }

  const NEAR_MISS_LITERALS = [
    "pdlc/skills-notes/x.md",
    "docs/pdlc/skills/x.md",
    "PDLC/Skills/x.md",
  ];

  function mutationClasses(g) {
    return {
      exactPrefix: `${g}rand${rng.int(0, 99999)}.js`, // g + rand — a genuine match
      segmentSuffixed: `${g.slice(0, -1)}-notes/x`, // pdlc/workflows-notes/x — no match
      prefixed: `docs/${g}x.md`, // docs/ + g — not at position 0, no match
      caseFlipped: g.toUpperCase() + "x", // case-sensitive — no match
      slashStripped: g.slice(0, -1) + "x", // slash stripped — no match (unless g's dir name is itself a prefix of some other default; guarded below)
      unrelated: "totally/unrelated/path.txt", // no match
    };
  }

  test("mutation classes: each class has >=1 firing and >=1 non-firing case, matching the reference", () => {
    const tally = {
      exactPrefix: { fire: 0, clear: 0 },
      segmentSuffixed: { fire: 0, clear: 0 },
      prefixed: { fire: 0, clear: 0 },
      caseFlipped: { fire: 0, clear: 0 },
      slashStripped: { fire: 0, clear: 0 },
      unrelated: { fire: 0, clear: 0 },
    };

    for (const g of DEFAULTS) {
      const classes = mutationClasses(g);
      for (const [cls, path] of Object.entries(classes)) {
        const files = [path];
        const verdict = guardVerdict({ ok: true, files }, DEFAULTS);
        const refFired = referenceFires(files, DEFAULTS);
        const refMatched = referenceMatched(files, DEFAULTS);

        expect(verdict.fired).toBe(refFired);
        expect(verdict.matched).toEqual(refMatched);

        tally[cls][refFired ? "fire" : "clear"] += 1;
      }
    }

    // §4.2's near-miss literals — each reproduces the negative arm exactly,
    // and disagrees with neither guardVerdict nor the reference predicate.
    for (const path of NEAR_MISS_LITERALS) {
      const files = [path];
      const verdict = guardVerdict({ ok: true, files }, DEFAULTS);
      expect(verdict.fired).toBe(referenceFires(files, DEFAULTS));
      expect(verdict.fired).toBe(false);
      tally.unrelated.clear += 1; // near-misses count toward "no genuine prefix" evidence
    }

    // Each class is defined so its outcome is structurally determined by its
    // construction (exactPrefix always matches by design, unrelated never
    // does) — that IS the coverage: across the six classes plus the five
    // near-miss literals, the domain contains both a genuine firing case and
    // a genuine non-firing case, so a mutant that always fires or never
    // fires reds this test rather than merely being unasserted.
    const totalFire = Object.values(tally).reduce((n, t) => n + t.fire, 0);
    const totalClear = Object.values(tally).reduce((n, t) => n + t.clear, 0);
    expect(totalFire).toBeGreaterThanOrEqual(1);
    expect(totalClear).toBeGreaterThanOrEqual(1);
    // At least one class fires in every guard instantiation (the positive
    // control) and at least one never fires in any (the negative control).
    expect(tally.exactPrefix.fire).toBe(DEFAULTS.length);
    expect(tally.unrelated.fire).toBe(0);
  });

  test("1000 seeded random file lists — verdict.fired and .matched agree with the reference predicate", () => {
    const alphabet = [
      "pdlc/workflows/",
      "pdlc/skills/",
      "pdlc/hooks/",
      ".claude/workflows/",
      "docs/",
      "src/",
      "README.md",
      "pdlc/workflows-notes/x.js",
      "PDLC/WORKFLOWS/x.js",
    ];
    for (let i = 0; i < 1000; i++) {
      const len = rng.int(1, 5);
      const files = [];
      for (let j = 0; j < len; j++) {
        const base = rng.pick(alphabet);
        const suffix = base.endsWith("/") ? `f${rng.int(0, 999)}.js` : "";
        files.push(base + suffix);
      }
      const verdict = guardVerdict({ ok: true, files }, DEFAULTS);
      const refFired = referenceFires(files, DEFAULTS);
      const refMatched = referenceMatched(files, DEFAULTS);
      if (verdict.fired !== refFired || JSON.stringify(verdict.matched) !== JSON.stringify(refMatched)) {
        throw new Error(
          `PROP-M-08 failed at seed=${seed + 1}, case=${JSON.stringify(files)}: ` +
            `verdict=${JSON.stringify(verdict)} reference={fired:${refFired},matched:${JSON.stringify(refMatched)}}`,
        );
      }
    }
  });
});

// ─── Local, file-scoped source-text extraction (mirrors runtimeBundle.test.js's
// moduleFunctionParams-style forward brace match, TE F-10 / TSPEC §6.3) ──────

const OPENERS = { "(": ")", "[": "]", "{": "}" };
const CLOSERS = { ")": "(", "]": "[", "}": "{" };

/** Index of the delimiter matching the opener at `openIdx`, or -1. */
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

/** Blank out string/template/regex-literal and comment contents so a
 *  forbidden token inside a string or comment cannot false-positive the scan
 *  (and, symmetrically, cannot hide a real one). Deliberately minimal: this
 *  file's two functions contain no regex literals, so only string/template/
 *  comment masking is implemented. */
function maskLiterals(src) {
  const out = src.split("");
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? src.length : end;
      for (let j = i; j < stop; j++) if (out[j] !== "\n") out[j] = " ";
      i = stop;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (let j = i; j < stop; j++) if (out[j] !== "\n") out[j] = " ";
      i = stop;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      let j = i + 1;
      while (j < src.length && src[j] !== quote) {
        if (src[j] === "\\") j += 2;
        else j += 1;
      }
      const stop = Math.min(j + 1, src.length);
      for (let k = i; k < stop; k++) if (out[k] !== "\n") out[k] = " ";
      i = stop;
      continue;
    }
    i += 1;
  }
  return out.join("");
}

/** The `{ ... }` body text of a module-level function declaration named
 *  `name`, or null if it cannot be found. */
function extractFunctionBody(src, name) {
  const re = new RegExp(`export\\s+function\\s+${name}\\s*\\(`);
  const m = re.exec(src);
  if (!m) return null;
  const openParen = src.indexOf("(", m.index);
  const closeParen = matchForward(src, openParen);
  if (closeParen === -1) return null;
  const openBrace = src.indexOf("{", closeParen);
  if (openBrace === -1) return null;
  const closeBrace = matchForward(src, openBrace);
  if (closeBrace === -1) return null;
  return src.slice(openBrace + 1, closeBrace);
}
