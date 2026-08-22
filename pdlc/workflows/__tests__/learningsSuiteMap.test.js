/**
 * learningsSuiteMap.test.js — LI-14, PLAN §pdlc-learnings-injection.
 *
 * GREEN-terminal suite-map closure (TSPEC §T.5): the six AT-bearing suites' declared AT
 * lists, hand-transcribed below, are asserted pairwise disjoint and set-equal to the
 * 35-member literal AT-01 … AT-35, and are asserted to match the `LI-AT-` test names
 * actually registered in each suite file. Read by STATIC PARSE of the suite file text —
 * never by importing the suite — so the assertion is well-defined before any production
 * symbol exists (TE Q-02).
 *
 * The closure is taken over the `__tests__/learnings*.test.js` directory, not over a
 * hardcoded six (TE F-05): this suite enumerates that glob from disk, computes the set of
 * files that register at least one `LI-AT-` jest test title, asserts that set equal to the
 * six AT-bearing suites named below, and only then partitions. Over a hardcoded list, an
 * `LI-AT-` name registered in one of the other new suites would be invisible — the six
 * lists would still partition 35 and the duplicate would ship silently.
 *
 * This suite itself names `LI-AT-` ids inside its own hand-transcribed literal (as plain
 * data, never inside an `it(`/`test(` call), but registers only `LI-T-SUITEMAP` as an
 * actual jest test title — keying the closure on REGISTERED titles rather than on textual
 * mentions is what keeps this file out of its own expected six.
 *
 * Green on authoring (TE F-02): all six AT-bearing suites exist at the end of batch 5, and
 * so does every other `learnings*.test.js` file except this one. There is no symbol under
 * test and no red episode.
 */
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Hand-transcribed, one row per AT-bearing suite (TSPEC §T.5). This is data, not a test
// registration — it must never be wrapped in `it(`/`test(` itself.
const SUITE_AT_LISTS = {
  "learningsConfig.test.js": [30, 32],
  "learningsSelect.test.js": [4, 7, 8, 9, 10, 13, 15, 16, 28],
  "learningsBlock.test.js": [5, 11, 12],
  "learningsCorpus.test.js": [25, 26, 27],
  "learningsRecord.test.js": [17, 18, 19, 20, 21, 22],
  "learningsDispatchSet.test.js": [1, 2, 3, 6, 14, 23, 24, 29, 31, 33, 34, 35],
};

const AT_BEARING_SUITES = Object.keys(SUITE_AT_LISTS).sort();

const FULL_35 = Array.from({ length: 35 }, (_, i) => i + 1);

// Statically parse a suite file's TEXT (never `import` it) for LI-AT-N ids appearing inside
// registered `describe(`/`it(`/`test(` titles — `.skip` included, since jest still registers
// a skipped test's title, and `describe` included because jest's full registered test name is
// the enclosing `describe` titles concatenated with the `it`/`test` title (several suites carry
// their AT id on the enclosing `describe` block title rather than on the inner `it`/`test`
// title). This is intentionally NOT a scan for the substring `LI-AT-` anywhere in
// the file: this file's own hand-transcribed literal above would otherwise make it appear to
// "register" every AT id it lists.
function registeredAtIds(fileText) {
  const ids = new Set();
  const callRe = /\b(?:describe|it|test)(?:\.skip)?\(\s*"((?:[^"\\]|\\.)*)"/g;
  let callMatch;
  while ((callMatch = callRe.exec(fileText)) !== null) {
    const title = callMatch[1];
    const atRe = /LI-AT-(\d+)/g;
    let atMatch;
    while ((atMatch = atRe.exec(title)) !== null) {
      ids.add(Number(atMatch[1]));
    }
  }
  return ids;
}

function listLearningsSuiteFiles() {
  return readdirSync(__dirname)
    .filter((name) => /^learnings.*\.test\.js$/.test(name))
    .sort();
}

describe("LI-T-SUITEMAP: §T.5 suite-map closure over the learnings*.test.js directory", () => {
  test("LI-T-SUITEMAP: the directory-wide closure over registered LI-AT- titles equals exactly the six declared AT-bearing suites (TE F-05)", () => {
    const allSuiteFiles = listLearningsSuiteFiles();
    // This file itself must be present in the directory listing (sanity on the glob), but
    // must never appear in the contributing set computed below.
    expect(allSuiteFiles).toContain("learningsSuiteMap.test.js");

    const contributingFiles = allSuiteFiles.filter((name) => {
      const text = readFileSync(join(__dirname, name), "utf8");
      return registeredAtIds(text).size > 0;
    });

    expect(contributingFiles.sort()).toEqual(AT_BEARING_SUITES);
    expect(contributingFiles).not.toContain("learningsSuiteMap.test.js");
  });

  test("LI-T-SUITEMAP: each AT-bearing suite's hand-transcribed AT list matches the LI-AT- titles actually registered in that file", () => {
    for (const [fileName, declaredAts] of Object.entries(SUITE_AT_LISTS)) {
      const text = readFileSync(join(__dirname, fileName), "utf8");
      const actualAts = [...registeredAtIds(text)].sort((a, b) => a - b);
      const expectedAts = [...declaredAts].sort((a, b) => a - b);
      expect({ fileName, actualAts }).toEqual({ fileName, actualAts: expectedAts });
    }
  });

  test("LI-T-SUITEMAP: the six suites' declared AT lists are pairwise disjoint", () => {
    const entries = Object.entries(SUITE_AT_LISTS);
    for (let i = 0; i < entries.length; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        const [nameA, atsA] = entries[i];
        const [nameB, atsB] = entries[j];
        const overlap = atsA.filter((id) => atsB.includes(id));
        expect({ pair: `${nameA} / ${nameB}`, overlap }).toEqual({ pair: `${nameA} / ${nameB}`, overlap: [] });
      }
    }
  });

  test("LI-T-SUITEMAP: the union of the six suites' declared AT lists is set-equal to the 35-member literal AT-01 … AT-35", () => {
    const union = Object.values(SUITE_AT_LISTS).flat();
    expect(union).toHaveLength(35);
    const sortedUnion = [...new Set(union)].sort((a, b) => a - b);
    expect(sortedUnion).toEqual(FULL_35);
  });
});

// PROP-META-06 (PROPERTIES §Group J): no suite of this feature reaches a live agent. Driven
// over the SAME static directory walk PROP-META-05 uses above — enumerate
// `__tests__/learnings*.test.js` from disk, parse each file's TEXT (never import it) — asserted
// as a set equality over the enumerated files, never containment, so a newly added suite that
// skips the scripted double reds rather than being silently missed.
describe("LI-T-SUITEMAP: PROP-META-06 — no learnings*.test.js suite reaches a live agent transport", () => {
  // A scripted-double-shaped construction: `makeAgentDouble(`, `buildRecordingAgent(`, or a
  // locally-defined `async function agent(`/`const agent = async (` stub (this file's own
  // idiom in learningsConfig.test.js). A file that constructs none of these but still supplies
  // `_agent` would be reaching for a live transport instead.
  const SCRIPTED_DOUBLE_RE =
    /\bmakeAgentDouble\(|\bbuildRecordingAgent\(|\basync function agent\(|\bconst agent\s*=\s*async/;
  // A live-transport symbol: the module-level `agent` stub production code falls back to
  // (`orchestrate-dev.js`'s `async function agent(skill, prompt, opts)`, "Provided by
  // runtime"), or a real child-process invocation of the `claude` binary itself.
  const LIVE_TRANSPORT_RE = /\bimport\s*\{\s*agent\s*\}\s*from\s*["']\.\.\/orchestrate-dev\.js["']|execFileSync\(\s*["']claude["']|spawnSync\(\s*["']claude["']/;

  test("PROP-META-06: every enumerated learnings*.test.js suite that supplies an _agent seam constructs it via a scripted double, and none references a live transport symbol", () => {
    const allSuiteFiles = listLearningsSuiteFiles();
    expect(allSuiteFiles.length).toBeGreaterThan(0); // positive control: the walk found files

    // Scoped to files that actually wire an `_agent` seam at all (an L1/L2 suite driving a
    // pure function directly, with no whole-run dispatch, has none) — never containment: a
    // file supplying `_agent` but matching neither pattern below reds.
    const agentWiringFiles = allSuiteFiles.filter((fileName) =>
      /_agent\s*[:(]/.test(readFileSync(join(__dirname, fileName), "utf8"))
    );
    expect(agentWiringFiles.length).toBeGreaterThan(0); // positive control: some suite wires _agent

    const withoutScriptedDouble = [];
    const withLiveTransport = [];
    for (const fileName of agentWiringFiles) {
      const text = readFileSync(join(__dirname, fileName), "utf8");
      if (!SCRIPTED_DOUBLE_RE.test(text)) withoutScriptedDouble.push(fileName);
      if (LIVE_TRANSPORT_RE.test(text)) withLiveTransport.push(fileName);
    }

    expect(withoutScriptedDouble).toEqual([]);
    expect(withLiveTransport).toEqual([]);
  });

  test("PROP-META-06: negative control — the scanner detects a planted live-transport reference in a synthetic file", () => {
    const synthetic = 'import { agent } from "../orchestrate-dev.js";\n';
    expect(LIVE_TRANSPORT_RE.test(synthetic)).toBe(true);
  });
});
