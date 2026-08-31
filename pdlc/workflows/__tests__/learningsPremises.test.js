/**
 * learningsPremises.test.js — LI-01, PLAN §pdlc-learnings-injection.
 *
 * Pre-flight gate for the feature's TSPEC premise table (P-1..P-10 + ERR-2).
 * Every assertion below is STRUCTURAL — it pins a symbol's existence and
 * shape at HEAD, never a line number and never the new shape a later PLAN
 * task creates. It also never asserts an ABSENCE from the TSPEC §Overview
 * change-surface table (PM F-07): every absence there is falsified on
 * schedule by this PLAN's own later tasks, so asserting one here would red
 * this suite the moment that task lands and halt every batch after it. The
 * four one-time absence measurements the PLAN LI-01 row calls for are
 * recorded in the task's completion note, not as assertions here — an
 * assertion would immediately go stale (batch 3 falsifies all four on
 * schedule).
 *
 * This suite is green at batch 1 by construction and stays green for the
 * life of the wave; it reds only if a rebase moves one of these premises
 * mid-wave, which is exactly the signal H-1 needs.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import * as consolidateModule from "../consolidate-learnings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEV_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-dev.js"), "utf8");
const PREPACK_SOURCE = readFileSync(
  join(__dirname, "..", "..", "engine", "scripts", "prepack.mjs"),
  "utf8"
);
const CONSOLIDATE_SOURCE = readFileSync(
  join(__dirname, "..", "consolidate-learnings.js"),
  "utf8"
);
const RUNTIME_ADAPTER_SOURCE = readFileSync(
  join(__dirname, "..", "runtime-adapter.js"),
  "utf8"
);

/**
 * Extracts the body of a function declared as `<declPrefix>({ ...params })
 * {` by brace-depth counting from the first `{` after the match through its
 * matching close. Structural, not line-based: survives any amount of
 * reformatting inside the body, and throws (failing the suite loudly,
 * per DEC-DOC-01) if the declaration itself moves or is renamed.
 */
function extractFunctionBody(source, declRegex, label) {
  const m = declRegex.exec(source);
  if (!m) {
    throw new Error(`learningsPremises: declaration not found for ${label}`);
  }
  let i = m.index + m[0].length; // just past the body's opening "{"
  let depth = 1;
  const start = i;
  while (depth > 0 && i < source.length) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  if (depth !== 0) {
    throw new Error(`learningsPremises: unbalanced braces extracting ${label}`);
  }
  return source.slice(start, i - 1);
}

// ---------------------------------------------------------------------------
// P-1 — the engine vendors exactly the canonical workflow modules (prepack.mjs).
// pdlc-engineering-loop added lib/loop-session.mjs and lib/escalation-view.mjs
// to the vendored set.
// ---------------------------------------------------------------------------

describe("P-1 — prepack.mjs MODULE_NAMES exact membership", () => {
  test("MODULE_NAMES is exactly the five canonical workflow modules", () => {
    const m = /const MODULE_NAMES = \[([^\]]*)\];/.exec(PREPACK_SOURCE);
    expect(m).not.toBeNull();
    const names = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => s.replace(/^"|"$/g, ""));
    expect(names).toEqual([
      "orchestrate-dev.js",
      "orchestrate-queue.js",
      "lib/loop-session.mjs",
      "lib/escalation-view.mjs",
      "lib/stats.mjs",
    ]);
  });
});

// ---------------------------------------------------------------------------
// P-2a — the four `dispatchKind: "authoring"` call sites at HEAD.
//
// TE F-12: a literal grep for `dispatchKind: "authoring"` returns 3, not 4 —
// the fourth is the positional 4th argument to `runWrapped` inside
// `reviewLoop`'s optimizer call, so the two counts (object-literal vs.
// positional) are checked separately, then summed to 4.
//
// PM F-09: the set is keyed by (enclosing named function, prompt-source
// symbol) — never by (enclosing function, argument position), which is not
// injective: `erratumRound`'s erratum-author dispatch and its land-proof
// retry are both `wrappedDispatch({...})` object-literal calls, so an
// argument-position key collapses them to one member and yields three for
// four sites.
// ---------------------------------------------------------------------------

describe('P-2a — four "authoring" dispatch sites, set-equal by (function, prompt source)', () => {
  test("exactly 3 object-literal dispatchKind: \"authoring\" sites at HEAD", () => {
    const literalCount = (DEV_SOURCE.match(/dispatchKind:\s*"authoring"/g) || []).length;
    expect(literalCount).toBe(3);
  });

  test('exactly 1 positional "authoring" runWrapped argument at HEAD', () => {
    // Scoped to the shape of an argument in a call — `, "authoring" ,|)` —
    // which the `dispatchKind: "authoring"` object-literal key:value form
    // never matches (no comma precedes `dispatchKind:`).
    const positionalCount = (DEV_SOURCE.match(/,\s*"authoring"\s*[,)]/g) || []).length;
    expect(positionalCount).toBe(1);
  });

  test("the 4 sites are exactly the PLAN's set, keyed by (enclosing function, prompt source)", () => {
    const erratumRoundBody = extractFunctionBody(
      DEV_SOURCE,
      /async function erratumRound\(\{[\s\S]*?\}\)\s*\{/,
      "erratumRound"
    );
    const convergeBody = extractFunctionBody(
      DEV_SOURCE,
      /async function converge\(\{[\s\S]*?\}\)\s*\{/,
      "converge"
    );
    const reviewLoopBody = extractFunctionBody(
      DEV_SOURCE,
      /export async function reviewLoop\(\{[\s\S]*?\}\)\s*\{/,
      "reviewLoop"
    );

    const sites = [];

    // erratumRound: two object-literal sites, distinguished by prompt source
    // (never by argument position — both are `wrappedDispatch({...})`).
    expect((erratumRoundBody.match(/dispatchKind:\s*"authoring"/g) || []).length).toBe(2);
    if (erratumRoundBody.includes("basePrompt: erratumAuthorPrompt(")) {
      sites.push("erratumRound::erratumAuthorPrompt");
    }
    if (erratumRoundBody.includes("LAND-PROOF RETRY")) {
      sites.push("erratumRound::land-proof-retry-inline-template");
    }

    // converge: one object-literal site, the phase creator dispatch.
    expect((convergeBody.match(/dispatchKind:\s*"authoring"/g) || []).length).toBe(1);
    if (convergeBody.includes("creatorPrompt(phaseId, featureName")) {
      sites.push("converge::creatorPrompt");
    }

    // reviewLoop: one positional site, the optimizer's runWrapped call.
    expect(
      (reviewLoopBody.match(/runWrapped\(\s*optimizer,\s*optPrompt,\s*doc,\s*"authoring"/g) || [])
        .length
    ).toBe(1);
    if (reviewLoopBody.includes("optPrompt = optimizerPrompt(")) {
      sites.push("reviewLoop::optimizerPrompt");
    }

    expect(new Set(sites)).toEqual(
      new Set([
        "erratumRound::erratumAuthorPrompt",
        "erratumRound::land-proof-retry-inline-template",
        "converge::creatorPrompt",
        "reviewLoop::optimizerPrompt",
      ])
    );
    expect(sites).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// P-3 — all four funnel through dispatchAndVerify, which already carries
// every seam this feature needs.
// ---------------------------------------------------------------------------

describe("P-3 — dispatchAndVerify's parameter names", () => {
  test("includes dispatchKind, docType, _readFile, _git, _log", () => {
    const m = /async function dispatchAndVerify\(\{([\s\S]*?)\}\)\s*\{/.exec(DEV_SOURCE);
    expect(m).not.toBeNull();
    const params = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const expected of ["dispatchKind", "docType", "_readFile", "_git", "_log"]) {
      expect(params).toContain(expected);
    }
  });
});

// ---------------------------------------------------------------------------
// P-4 — the corpus predicate is a single `git ls-files` argv, not a
// directory walk.
// ---------------------------------------------------------------------------

describe("P-4 — consolidate-learnings.js exports enumerateCorpus, keeps LS_FILES_ARGV private", () => {
  test("enumerateCorpus is exported and callable", () => {
    expect(typeof consolidateModule.enumerateCorpus).toBe("function");
  });

  test("LS_FILES_ARGV is not exported (module-private)", () => {
    expect(consolidateModule.LS_FILES_ARGV).toBeUndefined();
    expect(CONSOLIDATE_SOURCE).toMatch(/\bconst LS_FILES_ARGV = Object\.freeze\(\[/);
    expect(CONSOLIDATE_SOURCE).not.toMatch(/export\s+(const|\{[^}]*)\bLS_FILES_ARGV\b/);
  });
});

// ---------------------------------------------------------------------------
// P-7 — `_git(argv)` returns `{ok, stdout, stderr}` and never throws, on
// both channels (defaultGit / rtGit).
// ---------------------------------------------------------------------------

describe("P-7 — _git(argv) returns {ok, stdout, stderr} on both channels", () => {
  test("defaultGit is exported, is async, and both branches return the {ok, stdout, stderr} shape", async () => {
    expect(typeof devModule.defaultGit).toBe("function");
    // A git subcommand that always fails, so both the try and catch branch
    // are structurally confirmed to shape their return the same way — never
    // a thrown error escaping to the caller.
    const result = await devModule.defaultGit(["this-is-not-a-git-subcommand"]);
    expect(result).toEqual(
      expect.objectContaining({
        ok: expect.any(Boolean),
        stdout: expect.any(String),
        stderr: expect.any(String),
      })
    );
  });

  test("rtGit is shipped (inlined runtime-adapter.js) and shapes {ok, stdout, stderr}", () => {
    expect(RUNTIME_ADAPTER_SOURCE).toMatch(/async function rtGit\(argv\)\s*\{/);
    const rtGitBody = extractFunctionBody(
      RUNTIME_ADAPTER_SOURCE,
      /async function rtGit\(argv\)\s*\{/,
      "rtGit"
    );
    expect(rtGitBody).toMatch(/"ok"\s*:/);
    expect(rtGitBody).toMatch(/"stdout"\s*:/);
    expect(rtGitBody).toMatch(/"stderr"\s*:/);
  });
});

// ---------------------------------------------------------------------------
// P-8 — `_readFile(path)` returns `null` for an absent file, and may
// THROW on transport failure (defaultReadFile never throws; rtReadFile
// rethrows an exhausted probe — both real, per the PLAN's LI-AT-26).
// ---------------------------------------------------------------------------

describe("P-8 — _readFile(path) contract on both channels", () => {
  test("defaultReadFile is exported and returns null rather than throwing on any error", () => {
    expect(typeof devModule.defaultReadFile).toBe("function");
    expect(devModule.defaultReadFile("/definitely/does/not/exist/learnings-premise.md")).toBeNull();
  });

  test("rtReadFile is shipped (inlined runtime-adapter.js) and rethrows an exhausted probe", () => {
    expect(RUNTIME_ADAPTER_SOURCE).toMatch(/async function rtReadFile\(path\)\s*\{/);
    const rtReadFileBody = extractFunctionBody(
      RUNTIME_ADAPTER_SOURCE,
      /async function rtReadFile\(path\)\s*\{/,
      "rtReadFile"
    );
    // Absent-file branch returns null...
    expect(rtReadFileBody).toMatch(/if \(probe === null\)[\s\S]{0,80}return null;/);
    // ...but an exhausted probe is rethrown, not swallowed into null.
    expect(rtReadFileBody).toMatch(/catch \(err\) \{[\s\S]{0,600}throw err;/);
  });
});

// ---------------------------------------------------------------------------
// P-10 — a conditionally-spread report key is the shipped way to express
// "absent, not present-and-empty".
// ---------------------------------------------------------------------------

describe("P-10 — buildFinalReport's notices default and advisory conditional spread", () => {
  test("buildFinalReport takes a notices = [] parameter", () => {
    const m = /function buildFinalReport\(\{([\s\S]*?)\}\)\s*\{/.exec(DEV_SOURCE);
    expect(m).not.toBeNull();
    expect(m[1]).toMatch(/\bnotices\s*=\s*\[\]/);
  });

  test("advisory is spread conditionally, never present-and-undefined", () => {
    expect(DEV_SOURCE).toMatch(/\.\.\.\(advisory \? \{ advisory \} : \{\}\)/);
  });
});
