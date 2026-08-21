/**
 * learningsSuiteMap.test.js — LI-14, PLAN §pdlc-learnings-injection, TSPEC §T.5.
 *
 * `LI-T-SUITEMAP`: closure over the FSPEC AT partition, taken over the **directory**
 * (`__tests__/learnings*.test.js`), never over a hardcoded six (TE F-05). Every assertion here
 * is a **static parse of file text** — `readFileSync` plus regexes over `describe`/`test`/`it`
 * title-string literals — never an `import` of any suite under test, so the assertion is
 * well-defined before any production symbol exists (TE Q-02).
 *
 * This file itself matches the `learnings*.test.js` glob and is walked along with the other
 * eleven. It registers no `LI-AT-` title (only `LI-T-SUITEMAP`), which is what keeps it out of
 * its own expected AT-bearing-suite set, even though its hand-transcribed literal below spells
 * out `AT-01` … `AT-35` (the bare FSPEC form, never the `LI-AT-` jest-title form) in plain data,
 * not inside any `describe`/`test`/`it` call.
 *
 * Green on authoring (TE F-02): all twelve `learnings*.test.js` files exist at the end of batch
 * 5, so this suite has no red episode and no production symbol under test. Its value is
 * regression pressure over the life of the region — adding an AT to one suite without removing
 * it from another reds here.
 */

import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const THIS_FILE = "learningsSuiteMap.test.js";

/** The six suites TSPEC §T.5 assigns FSPEC ATs to, hand-transcribed from that table. */
const EXPECTED_AT_LISTS = {
  "learningsConfig.test.js": ["AT-30", "AT-32"],
  "learningsSelect.test.js": [
    "AT-04",
    "AT-07",
    "AT-08",
    "AT-09",
    "AT-10",
    "AT-13",
    "AT-15",
    "AT-16",
    "AT-28",
  ],
  "learningsBlock.test.js": ["AT-05", "AT-11", "AT-12"],
  "learningsCorpus.test.js": ["AT-25", "AT-26", "AT-27"],
  "learningsRecord.test.js": ["AT-17", "AT-18", "AT-19", "AT-20", "AT-21", "AT-22"],
  "learningsDispatchSet.test.js": [
    "AT-01",
    "AT-02",
    "AT-03",
    "AT-06",
    "AT-14",
    "AT-23",
    "AT-24",
    "AT-29",
    "AT-31",
    "AT-33",
    "AT-34",
    "AT-35",
  ],
};

const EXPECTED_AT_BEARING_SUITES = Object.keys(EXPECTED_AT_LISTS).sort();

/** FSPEC's full inventory, AT-01 … AT-35, each once. */
const ALL_35_ATS = Array.from({ length: 35 }, (_, i) => `AT-${String(i + 1).padStart(2, "0")}`);

// --- static text parsing helpers (no `import` of any suite under test) ---------------------

/** Strips `//` line comments and `/* … *\/` block comments from source text. */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Extracts the first-argument string literal of every `describe`/`test`/`it` call (with an
 * optional `.skip`/`.only` modifier) in `text`. This is jest's own title vocabulary — the
 * registered name of a test is built from exactly these calls — so it is the static
 * approximation of "the `LI-AT-` test names actually registered in each suite file".
 */
function extractTitleLiterals(text) {
  const titles = [];
  const re = /\b(?:describe|test|it)(?:\.(?:skip|only))?\s*\(\s*(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    titles.push(m[2]);
  }
  return titles;
}

/** The set of bare FSPEC `AT-{N}` ids named via the `LI-AT-{N}` jest-title form in `titles`. */
function extractLiAtIds(titles) {
  const ids = new Set();
  for (const title of titles) {
    const matches = title.match(/LI-(AT-\d+)/g) || [];
    for (const hit of matches) {
      ids.add(hit.replace(/^LI-/, ""));
    }
  }
  return ids;
}

function setEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

function sortedArray(set) {
  return Array.from(set).sort();
}

// --- the directory-wide closure (TE F-05): enumerate from disk, not a hardcoded six ----------

const enumeratedFiles = readdirSync(__dirname)
  .filter((name) => /^learnings.*\.test\.js$/.test(name))
  .sort();

const fileTexts = new Map();
for (const name of enumeratedFiles) {
  fileTexts.set(name, readFileSync(join(__dirname, name), "utf8"));
}

const fileTitles = new Map();
const fileAtIds = new Map();
for (const name of enumeratedFiles) {
  const stripped = stripComments(fileTexts.get(name));
  const titles = extractTitleLiterals(stripped);
  fileTitles.set(name, titles);
  fileAtIds.set(name, extractLiAtIds(titles));
}

describe("LI-T-SUITEMAP — directory-wide closure over the FSPEC AT partition (TSPEC §T.5)", () => {
  test("LI-T-SUITEMAP: the directory walk found at least the twelve learnings*.test.js files (positive control)", () => {
    expect(enumeratedFiles.length).toBeGreaterThan(0);
    expect(enumeratedFiles).toContain(THIS_FILE);
  });

  test("LI-T-SUITEMAP: the set of files registering >=1 LI-AT- jest title equals the six AT-bearing suites, over the directory, not a hardcoded six", () => {
    const atBearing = enumeratedFiles.filter((name) => fileAtIds.get(name).size > 0).sort();
    expect(atBearing).toEqual(EXPECTED_AT_BEARING_SUITES);
  });

  test("LI-T-SUITEMAP: this suite itself registers no LI-AT- title, only LI-T-SUITEMAP, so it is excluded from its own expected set", () => {
    expect(fileAtIds.get(THIS_FILE).size).toBe(0);
    const ownTitles = fileTitles.get(THIS_FILE).join(" | ");
    expect(ownTitles).toContain("LI-T-SUITEMAP");
  });

  test("LI-T-SUITEMAP: the six hand-transcribed AT lists are pairwise disjoint", () => {
    const seen = new Map();
    for (const [suite, ats] of Object.entries(EXPECTED_AT_LISTS)) {
      for (const at of ats) {
        expect(seen.has(at)).toBe(false);
        seen.set(at, suite);
      }
    }
  });

  test("LI-T-SUITEMAP: the six hand-transcribed AT lists are set-equal to the 35-member literal AT-01 … AT-35", () => {
    const union = new Set(Object.values(EXPECTED_AT_LISTS).flat());
    expect(setEqual(union, new Set(ALL_35_ATS))).toBe(true);
  });

  test.each(Object.entries(EXPECTED_AT_LISTS))(
    "LI-T-SUITEMAP: %s's hand-transcribed AT list matches its actually-registered LI-AT- titles",
    (suite, expectedAts) => {
      expect(enumeratedFiles).toContain(suite);
      const registered = fileAtIds.get(suite);
      expect(setEqual(registered, new Set(expectedAts))).toBe(true);
    }
  );

  test("LI-T-SUITEMAP: no non-AT-bearing enumerated suite registers an LI-AT- title (namespacing rule, TE F-02)", () => {
    const nonAtBearing = enumeratedFiles.filter((name) => !EXPECTED_AT_BEARING_SUITES.includes(name));
    for (const name of nonAtBearing) {
      expect(sortedArray(fileAtIds.get(name))).toEqual([]);
    }
  });
});

// --- PROP-META-06: no suite reaches a live agent (AC-6.1 clause 1) ---------------------------

/** Substrings that would indicate a suite invoking the real, unstubbed agent transport. */
const LIVE_TRANSPORT_MARKERS = [
  ".agent(",
  "devModule.agent",
  "dev.agent",
  "consolidateModule.agent",
  "@anthropic-ai",
  "claude-agent-sdk",
  "new ClaudeClient",
  "ClaudeClient(",
];

/** Markers of a locally-scoped scripted double standing in for `_agent`. */
const DOUBLE_MARKERS = [
  "buildRecordingAgent(",
  "makeAgentDouble(",
  "const agent = async",
  "function agent(",
];

function referencesLiveTransport(text) {
  return LIVE_TRANSPORT_MARKERS.some((marker) => text.includes(marker));
}

function constructsScriptedDoubleOrNoAgent(text) {
  if (!/_agent\b/.test(text)) return true; // no agent dispatch at all — vacuously no live call
  return DOUBLE_MARKERS.some((marker) => text.includes(marker));
}

// This file is the scanning instrument, not a suite under test: it necessarily carries the
// marker literals themselves (as plain array/string data, never inside a live call or an
// `expect(...)`), so it is excluded from its own scan universe here — the same self-exclusion
// shape as the AT-bearing-suite check above, which keeps `LI-T-SUITEMAP`'s own transcribed
// literal from putting it in its own expected set.
const SCANNABLE_FILES = enumeratedFiles.filter((name) => name !== THIS_FILE);

describe("PROP-META-06 — no enumerated suite reaches a live agent (AC-6.1)", () => {
  test("PROP-META-06: the enumerated file set (positive control) is non-empty and equals PROP-META-05's operand", () => {
    expect(enumeratedFiles.length).toBeGreaterThan(0);
  });

  test("PROP-META-06: every enumerated suite, set equality, references no live transport symbol", () => {
    const clean = SCANNABLE_FILES.filter((name) => !referencesLiveTransport(stripComments(fileTexts.get(name))));
    expect(clean.sort()).toEqual(SCANNABLE_FILES.slice().sort());
  });

  test("PROP-META-06: every enumerated suite that dispatches through _agent constructs it via a scripted double, set equality", () => {
    const compliant = SCANNABLE_FILES.filter((name) =>
      constructsScriptedDoubleOrNoAgent(stripComments(fileTexts.get(name)))
    );
    expect(compliant.sort()).toEqual(SCANNABLE_FILES.slice().sort());
  });
});

// --- PROP-RECORD-09: no test asserts on runMirror's value (it is additive, deliberately open) --

/**
 * Extracts every `expect(...)....;`-shaped statement from `text` (balanced on the `expect(`
 * call's own parens, then continued through any chained matcher call up to the next top-level
 * `;`), so "assertion position" means "inside one of these spans" rather than anywhere in the
 * file text — a fixture literal that happens to carry the field name is not an assertion.
 */
function extractExpectStatements(text) {
  const out = [];
  const re = /expect\s*\(/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    let j = m.index + m[0].length;
    let depth = 1;
    while (j < text.length && depth > 0) {
      if (text[j] === "(") depth++;
      else if (text[j] === ")") depth--;
      j++;
    }
    let k = j;
    let localDepth = 0;
    while (k < text.length) {
      const c = text[k];
      if (c === "(") localDepth++;
      else if (c === ")") {
        if (localDepth === 0) break;
        localDepth--;
      } else if (c === ";" && localDepth === 0) {
        k++;
        break;
      }
      k++;
    }
    out.push(text.slice(m.index, k));
  }
  return out;
}

function referencesRunMirrorInAssertionPosition(text) {
  return extractExpectStatements(text).some((stmt) => stmt.includes("runMirror"));
}

describe("PROP-RECORD-09 — no suite asserts on runMirror's deliberately-unconstrained value", () => {
  test("PROP-RECORD-09: the enumerated file set (positive control) is non-empty and equals PROP-META-05's operand", () => {
    expect(enumeratedFiles.length).toBeGreaterThan(0);
  });

  test("PROP-RECORD-09: no enumerated suite references runMirror inside an expect(...) assertion, set equality", () => {
    const clean = SCANNABLE_FILES.filter(
      (name) => !referencesRunMirrorInAssertionPosition(stripComments(fileTexts.get(name)))
    );
    expect(clean.sort()).toEqual(SCANNABLE_FILES.slice().sort());
  });
});
