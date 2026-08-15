// dispatchableSkills.test.js — TSPEC §3.3, DEC-ENG-05.
//
// Two workflows-side tests, neither production code, neither parsing source
// for anything but structural syntax (never a "skill-identifier shape"):
//
//   1. derivation — DISPATCHABLE_SKILLS (each module) equals the union
//      recomputed test-side from PHASE_DISPATCH's role fields plus the named
//      SKILL_* / ADVISORY_RUNG_SKILL / SKILL_TRIAGE constants, AND equals the
//      ten identifiers transcribed test-side (TSPEC §3.3's second conjunct —
//      without it a deleted PHASE_DISPATCH role field shrinks both sides of
//      conjunct (i) together and nothing goes red).
//
//   2. no-bare-literal — containment, not absence (DEC-ENG-05): every
//      skill-naming site in either module resolves to a member of the union.
//      A site is a syntactic position, not a string shape, and the four
//      classes are closed. Conjoined with the per-class site census so
//      containment cannot pass vacuously over an empty extraction.
//
// This file is content-keyed throughout — no absolute line number is an
// oracle — so a later edit to `orchestrate-dev.js`/`orchestrate-queue.js`
// (T16) cannot turn this test red for the wrong reason.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const DEV_PATH = join(here, "..", "orchestrate-dev.js");
const QUEUE_PATH = join(here, "..", "orchestrate-queue.js");

// ─── Structural extraction helpers ─────────────────────────────────────────
// No AST parser is available to this workflow's test toolchain (jest only,
// no acorn/babel dependency in pdlc/workflows/package.json), so these walk
// source text with explicit string/comment/bracket-depth tracking rather
// than regex-over-raw-bytes. They are deliberately narrow: each recognises
// exactly the syntactic shapes TSPEC §3.3 names, nothing broader.

/** Blank out `//` and `/* *\/` comment bodies (never touching string/template
 * contents), preserving every other byte and all newlines. */
function stripComments(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  let inString = null; // one of '"', "'", "`" while inside a string/template
  while (i < n) {
    const ch = src[i];
    const next = src[i + 1];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += next ?? "";
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === "/" && next === "/") {
      while (i < n && src[i] !== "\n") {
        out += " ";
        i++;
      }
      continue;
    }
    if (ch === "/" && next === "*") {
      out += "  ";
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += "  ";
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** Split a comma-joined argument-list string at TOP-LEVEL commas only —
 * commas inside nested (), [], {} or a string/template are not boundaries. */
function splitTopLevelArgs(text) {
  const args = [];
  let depth = 0;
  let current = "";
  let inString = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      current += ch;
      if (ch === "\\") {
        current += text[++i] ?? "";
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      current += ch;
      continue;
    }
    if ("([{".includes(ch)) {
      depth++;
      current += ch;
      continue;
    }
    if (")]}".includes(ch)) {
      depth--;
      current += ch;
      continue;
    }
    if (ch === "," && depth === 0) {
      args.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim() !== "") args.push(current.trim());
  return args;
}

/** Every call `calleeName(...)` in a comment-stripped source, as
 * `{ index, args }` where `args` is the top-level-split argument list. */
function findCallArgLists(source, calleeName) {
  const re = new RegExp(`\\b${calleeName}\\s*\\(`, "g");
  const results = [];
  let m;
  while ((m = re.exec(source))) {
    const start = m.index + m[0].length; // just past the opening "("
    let depth = 1;
    let i = start;
    let inString = null;
    while (i < source.length && depth > 0) {
      const ch = source[i];
      if (inString) {
        if (ch === "\\") {
          i += 2;
          continue;
        }
        if (ch === inString) inString = null;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inString = ch;
        i++;
        continue;
      }
      if ("([{".includes(ch)) depth++;
      else if (")]}".includes(ch)) depth--;
      i++;
    }
    results.push({ index: m.index, args: splitTopLevelArgs(source.slice(start, i - 1)) });
  }
  return results;
}

/** The `{ ... }` object literal text following `marker`, matched by brace
 * depth (never by a fixed line range — content-keyed per this file's header). */
function extractBracedBlock(source, marker) {
  const idx = source.indexOf(marker);
  if (idx === -1) return null;
  const start = idx + marker.length - 1; // the marker's own trailing "{"
  let depth = 0;
  let i = start;
  let inString = null;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  return source.slice(start, i);
}

// ─── Site classification (TSPEC §3.3's three outcomes) ─────────────────────
//
// A resolvable direct site is a bare skill-identifier string literal, or an
// identifier bound to one of the two modules' module-level SKILL_*/
// ADVISORY_RUNG_SKILL/SKILL_TRIAGE constants (`moduleConstants`, keyed by
// identifier name, valued by the constant's own string). Indirect dispatch —
// a bare parameter/local binding, or a member expression — is neither a site
// nor a failure. Anything else is a failure: a resolvable syntactic form
// (literal or constant reference) is required, or the site must be
// structurally indirect; nothing is ever silently skipped.
const SKILL_LITERAL_RE = /^"([a-z][a-z0-9]*(?:-[a-z0-9]+)*)"$/;
const CONST_IDENT_RE = /^[A-Z][A-Z0-9_]*$/;
const BARE_IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const MEMBER_EXPR_RE = /^[A-Za-z_$][\w$]*(?:\[[^[\]]*\]|\.[A-Za-z_$][\w$]*)+$/;

function classifySite(argText, moduleConstants) {
  const lit = argText.match(SKILL_LITERAL_RE);
  if (lit) return { outcome: "direct", value: lit[1] };
  if (CONST_IDENT_RE.test(argText) && moduleConstants.has(argText)) {
    return { outcome: "direct", value: moduleConstants.get(argText) };
  }
  if (CONST_IDENT_RE.test(argText)) {
    // Upper-snake shaped but not a known module constant — unresolved.
    return { outcome: "failure", raw: argText };
  }
  if (BARE_IDENT_RE.test(argText)) return { outcome: "indirect", raw: argText };
  if (MEMBER_EXPR_RE.test(argText)) return { outcome: "indirect", raw: argText };
  return { outcome: "failure", raw: argText };
}

// ─── Class 1 — module-level SKILL_* / ADVISORY_RUNG_SKILL / SKILL_TRIAGE
// constant declarations. Always a resolvable direct site by construction. ──
const CLASS1_RE =
  /^export const (SKILL_[A-Z_]+|ADVISORY_RUNG_SKILL|SKILL_TRIAGE) = "([a-z][a-z0-9]*(?:-[a-z0-9]+)*)";/gm;

function extractClass1(source) {
  const sites = [];
  const constants = new Map();
  let m;
  CLASS1_RE.lastIndex = 0;
  while ((m = CLASS1_RE.exec(source))) {
    sites.push({ outcome: "direct", value: m[2] });
    constants.set(m[1], m[2]);
  }
  return { sites, constants };
}

// ─── Class 2 — PHASE_DISPATCH role fields (creator, optimizer, verifier,
// remediator, reviewers[]), scoped to the exported object literal itself so
// a same-named forwarding field elsewhere in the module (`skill: dispatch
// .reviewers`, `PHASE_DISPATCH[phaseId].optimizer`) is never double-counted
// — those are class-3/4 sites of their own, not a second read of class 2. ──
function extractClass2(source) {
  const block = extractBracedBlock(source, "export const PHASE_DISPATCH = {");
  if (block == null) return [];
  const sites = [];
  const scalarRe = /\b(creator|optimizer|verifier|remediator):\s*(null|"[^"]*")/g;
  let m;
  while ((m = scalarRe.exec(block))) {
    if (m[2] !== "null") sites.push({ outcome: "direct", value: m[2].slice(1, -1) });
  }
  const reviewersRe = /\breviewers:\s*\[([^\]]*)\]/g;
  while ((m = reviewersRe.exec(block))) {
    for (const entry of splitTopLevelArgs(m[1])) {
      const lit = entry.match(SKILL_LITERAL_RE);
      if (lit) sites.push({ outcome: "direct", value: lit[1] });
    }
  }
  return sites;
}

// ─── Class 3 — a `skill:` object field, whose value is either a string
// literal / module-level constant reference (direct) or a bare
// parameter/member expression (indirect dispatch, TSPEC §3.3). ────────────
function extractClass3(source, moduleConstants) {
  const sites = [];
  const re = /\bskill:\s*([^,\n]+?)(?=,|\n)/g;
  let m;
  while ((m = re.exec(source))) {
    sites.push(classifySite(m[1].trim(), moduleConstants));
  }
  return sites;
}

// ─── Class 4 — the first argument of a dispatch call. The two direct-call
// spellings in these modules are `_agent(skill, prompt, opts)` and
// `agentFn(skill, prompt, opts)`; the session-bound wrapper
// `_sessionAgent(sessionKey, skill, prompt, opts)` (documented at its own
// declaration, `orchestrate-dev.js` §"the optional session transport") names
// its skill argument second, not first — the site is still class 4 under
// "the same restriction on argument syntax", read at that call's own skill
// position. Under the same restriction, its result is classified exactly
// like every other class-4 site. ───────────────────────────────────────────
const DISPATCH_CALLEES = [
  { name: "_agent", skillArgIndex: 0 },
  { name: "agentFn", skillArgIndex: 0 },
  { name: "_sessionAgent", skillArgIndex: 1 },
];

function extractClass4(source, moduleConstants) {
  const sites = [];
  for (const { name, skillArgIndex } of DISPATCH_CALLEES) {
    for (const call of findCallArgLists(source, name)) {
      const argText = call.args[skillArgIndex];
      if (argText === undefined) {
        sites.push({ outcome: "failure", raw: `${name}(<missing arg ${skillArgIndex}>)` });
        continue;
      }
      sites.push(classifySite(argText, moduleConstants));
    }
  }
  return sites;
}

function extractAllSites(strippedSource, moduleConstants) {
  return {
    class1: extractClass1(strippedSource).sites,
    class2: extractClass2(strippedSource),
    class3: extractClass3(strippedSource, moduleConstants),
    class4: extractClass4(strippedSource, moduleConstants),
  };
}

// ─── Fixture: both modules' comment-stripped source and their combined
// module-level constant table (class 1, unioned across both files — a
// module may reference a constant declared in the other). ─────────────────
const devSource = stripComments(readFileSync(DEV_PATH, "utf8"));
const queueSource = stripComments(readFileSync(QUEUE_PATH, "utf8"));

const moduleConstants = new Map([
  ...extractClass1(devSource).constants,
  ...extractClass1(queueSource).constants,
]);

const devSites = extractAllSites(devSource, moduleConstants);
const queueSites = extractAllSites(queueSource, moduleConstants);

// The ten identifiers this feature's derivation is normative for
// (TSPEC §3.3, "the derived union earns a test-side transcription too").
const TEN_IDENTIFIERS = [
  "dod-verify",
  "harvest-learnings",
  "pm-author",
  "pm-review",
  "se-author",
  "se-implement",
  "se-review",
  "ship-pr",
  "te-author",
  "te-review",
].sort();

describe("dispatchable skill set derivation (TSPEC §3.3, DEC-ENG-05)", () => {
  let dev;
  let queue;

  beforeAll(async () => {
    dev = await import(pathToFileURL(DEV_PATH).href);
    queue = await import(pathToFileURL(QUEUE_PATH).href);
  });

  test("orchestrate-dev.js exports DISPATCHABLE_SKILLS as the union of PHASE_DISPATCH's role fields and its named skill constants", () => {
    expect(dev.DISPATCHABLE_SKILLS).toBeDefined();
    const PHASE_ROLE_KEYS = ["creator", "optimizer", "verifier", "remediator", "reviewers"];
    const recomputed = [
      ...new Set([
        ...Object.values(dev.PHASE_DISPATCH).flatMap((p) =>
          PHASE_ROLE_KEYS.flatMap((k) => (p[k] == null ? [] : [].concat(p[k])))
        ),
        dev.ADVISORY_RUNG_SKILL,
        dev.SKILL_SHIP_PR,
        dev.SKILL_SE_IMPLEMENT,
        dev.SKILL_DOD_VERIFY,
        dev.SKILL_HARVEST,
        dev.SKILL_SE_AUTHOR,
      ]),
    ].sort();
    expect([...dev.DISPATCHABLE_SKILLS].sort()).toEqual(recomputed);
  });

  test("orchestrate-queue.js exports DISPATCHABLE_SKILLS as [SKILL_TRIAGE, ADVISORY_RUNG_SKILL]", () => {
    expect(queue.DISPATCHABLE_SKILLS).toBeDefined();
    expect([...queue.DISPATCHABLE_SKILLS].sort()).toEqual(
      [queue.SKILL_TRIAGE, dev.ADVISORY_RUNG_SKILL].sort()
    );
  });

  test("the union of both modules' DISPATCHABLE_SKILLS equals the ten identifiers transcribed test-side", () => {
    const union = [...new Set([...dev.DISPATCHABLE_SKILLS, ...queue.DISPATCHABLE_SKILLS])].sort();
    expect(union).toEqual(TEN_IDENTIFIERS);
  });

  test("DISPATCHABLE_SKILLS is a frozen array in both modules", () => {
    expect(Array.isArray(dev.DISPATCHABLE_SKILLS)).toBe(true);
    expect(Array.isArray(queue.DISPATCHABLE_SKILLS)).toBe(true);
    expect(Object.isFrozen(dev.DISPATCHABLE_SKILLS)).toBe(true);
    expect(Object.isFrozen(queue.DISPATCHABLE_SKILLS)).toBe(true);
  });
});

// ─── No-bare-literal: containment, not absence (DEC-ENG-05) ────────────────
//
// The rejected alternative — an absence test with a closed allow-list of
// exempt sites (an earlier draft of TSPEC §3.3 naming the reviewer-role map
// at `orchestrate-dev.js:6229-6231` as the exemption) — is superseded:
// DECISIONS v1.3 is the later document and wins over that earlier draft
// (DECISIONS:355-375, restated :846). The reviewer-role map's *keys*
// (`"se-review"`, `"pm-review"`, `"te-review"`) need no exemption because
// they are genuine union members reached structurally through no site class
// at all; its *values* (`"software-engineer"`, ...) do not match the shape
// predicate below and so were never a containment failure to begin with —
// this is asserted directly rather than left to an unread regex.
describe("no-bare-literal guard: every skill-naming site resolves to a union member (TSPEC §3.3)", () => {
  let unionSet;

  beforeAll(async () => {
    const dev = await import(pathToFileURL(DEV_PATH).href);
    const queue = await import(pathToFileURL(QUEUE_PATH).href);
    unionSet = new Set([...dev.DISPATCHABLE_SKILLS, ...queue.DISPATCHABLE_SKILLS]);
  });

  function allSites() {
    return [
      ...devSites.class1,
      ...devSites.class2,
      ...devSites.class3,
      ...devSites.class4,
      ...queueSites.class1,
      ...queueSites.class2,
      ...queueSites.class3,
      ...queueSites.class4,
    ];
  }

  test("no site is a failure — every class-3/4 argument is either resolvable or structurally indirect", () => {
    const failures = allSites().filter((s) => s.outcome === "failure");
    expect(failures).toEqual([]);
  });

  test("containment: every direct site's value is a member of the union DISPATCHABLE_SKILLS set", () => {
    const notContained = allSites()
      .filter((s) => s.outcome === "direct")
      .map((s) => s.value)
      .filter((v) => !unionSet.has(v));
    expect(notContained).toEqual([]);
  });

  // The per-class site census (TSPEC §3.3): asserted, not observed, so
  // containment cannot pass vacuously over an empty extraction, and an
  // extractor that silently stops matching turns this red instead of green.
  // Figures are the post-edit ones TSPEC §3.3 names: 7 / 28 / 1 / 12 = 48
  // direct sites plus 11 indirect-dispatch positions, split across the two
  // modules as measured there (class 1: 6 dev + 1 queue; classes 2 and 3:
  // dev only; class 4: 11 dev + 1 queue; indirect: all 11 in dev).
  test("per-class direct-site census — class 1 (module-level SKILL_*/ADVISORY_RUNG_SKILL/SKILL_TRIAGE constants)", () => {
    const direct = (sites) => sites.filter((s) => s.outcome === "direct").length;
    expect(direct(devSites.class1)).toBe(6);
    expect(direct(queueSites.class1)).toBe(1);
  });

  test("per-class direct-site census — class 2 (PHASE_DISPATCH role fields)", () => {
    const direct = (sites) => sites.filter((s) => s.outcome === "direct").length;
    expect(direct(devSites.class2)).toBe(28);
    expect(direct(queueSites.class2)).toBe(0);
  });

  test("per-class direct-site census — class 3 (skill: object fields)", () => {
    const direct = (sites) => sites.filter((s) => s.outcome === "direct").length;
    expect(direct(devSites.class3)).toBe(1);
    expect(direct(queueSites.class3)).toBe(0);
  });

  test("per-class direct-site census — class 4 (dispatch-call first arguments)", () => {
    const direct = (sites) => sites.filter((s) => s.outcome === "direct").length;
    expect(direct(devSites.class4)).toBe(10);
    expect(direct(queueSites.class4)).toBe(1);
  });

  // 15th indirect position added by the halt-hardening anchor cascade: the delta
  // re-confirmation dispatch to the downstream doc's own reviewers (skill names
  // flow through the same reviewer variables the union guard already resolves).
  test("indirect-dispatch positions are counted, not skipped: 15 total, all in orchestrate-dev.js", () => {
    const indirect = (sites) => sites.filter((s) => s.outcome === "indirect").length;
    const devIndirect =
      indirect(devSites.class1) +
      indirect(devSites.class2) +
      indirect(devSites.class3) +
      indirect(devSites.class4);
    const queueIndirect =
      indirect(queueSites.class1) +
      indirect(queueSites.class2) +
      indirect(queueSites.class3) +
      indirect(queueSites.class4);
    expect(devIndirect).toBe(15);
    expect(queueIndirect).toBe(0);
  });

  test("the site census totals 47 direct sites plus 15 indirect positions across both modules", () => {
    const direct = (sites) => sites.filter((s) => s.outcome === "direct").length;
    const indirect = (sites) => sites.filter((s) => s.outcome === "indirect").length;
    const totalDirect =
      direct(devSites.class1) +
      direct(devSites.class2) +
      direct(devSites.class3) +
      direct(devSites.class4) +
      direct(queueSites.class1) +
      direct(queueSites.class2) +
      direct(queueSites.class3) +
      direct(queueSites.class4);
    const totalIndirect =
      indirect(devSites.class1) +
      indirect(devSites.class2) +
      indirect(devSites.class3) +
      indirect(devSites.class4) +
      indirect(queueSites.class1) +
      indirect(queueSites.class2) +
      indirect(queueSites.class3) +
      indirect(queueSites.class4);
    expect(totalDirect).toBe(47);
    expect(totalIndirect).toBe(15);
  });

  // The decisive case DEC-ENG-05 names: the reviewer-role map's keys and
  // values sit on the same lines and are syntactically indistinguishable as
  // strings, yet neither is any of the four site classes, so neither needs
  // (or gets) an exemption. Asserted directly against both modules' text.
  test("the reviewer-role map's keys and values are present in source but are not extracted as sites of any class", () => {
    const raw = devSource;
    expect(raw).toMatch(/"se-review":\s*"software-engineer"/);
    expect(raw).toMatch(/"pm-review":\s*"product-manager"/);
    expect(raw).toMatch(/"te-review":\s*"test-engineer"/);
    // None of class 1-4's extractors match `"key": "value"` shaped text —
    // confirmed structurally: this pattern is neither a `SKILL_*` constant
    // declaration, a PHASE_DISPATCH role field, a `skill:` field, nor a
    // dispatch-call first argument.
    const roleMapValues = ["software-engineer", "product-manager", "test-engineer"];
    const extractedValues = allSites()
      .filter((s) => s.outcome === "direct")
      .map((s) => s.value);
    for (const v of roleMapValues) expect(extractedValues).not.toContain(v);
  });
});
