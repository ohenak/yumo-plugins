// T09 (PLAN): fixture redaction scanner, paired with its positive control in
// the same test (AT-ENG-64, TSPEC §7.2). The scanner has no separate source
// file at this task — PLAN's Source File column for T09 is "—" — so it lives
// here, inline, until T18 (batch 3) adds the fixtures this scanner will
// eventually scan for real (`__tests__/fixtures/`) plus the redaction README.
//
// TSPEC §7.2's two named rules, and the scanner asserted against both:
//   1. `sk-ant-` followed by >=20 chars of [A-Za-z0-9_-]
//   2. an assignment of ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN to a
//      non-empty value
//
// "The scanner that checks this is paired with a positive control in the
// same test, because an absence-only scan passes identically whether its
// pattern is right, wrong or empty" (TSPEC §7.2) — so this file always runs
// both halves: the negative half (today, vacuously, over a `fixtures/`
// directory that does not exist until T18) and the positive half (a scratch
// file this test writes itself, containing one instance of each rule, which
// the scanner must flag).

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fixturesDir = fileURLToPath(new URL("./fixtures/", import.meta.url));

// The two rules named verbatim in TSPEC §7.2, kept as a single source list so
// the scanner's pattern and the assertion that drives the positive control's
// scratch file are visibly the same rules, not independently maintained
// copies of them.
const REDACTION_RULES = [
  {
    name: "sk-ant- API key literal",
    pattern: /sk-ant-[A-Za-z0-9_-]{20,}/g,
    sample: "sk-ant-" + "a".repeat(24),
  },
  {
    name: "ANTHROPIC_API_KEY assignment",
    pattern: /ANTHROPIC_API_KEY\s*[:=]\s*["']?[^\s"'#]+/g,
    sample: 'ANTHROPIC_API_KEY="not-a-real-value-but-non-empty"',
  },
  {
    name: "ANTHROPIC_AUTH_TOKEN assignment",
    pattern: /ANTHROPIC_AUTH_TOKEN\s*[:=]\s*["']?[^\s"'#]+/g,
    sample: 'ANTHROPIC_AUTH_TOKEN="also-not-a-real-value"',
  },
];

/**
 * Scans `text` for every rule in REDACTION_RULES, returning one match record
 * per hit: `{ rule, match }`.
 */
function scanTextForSecrets(text) {
  const hits = [];
  for (const rule of REDACTION_RULES) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      hits.push({ rule: rule.name, match: m[0] });
      if (m.index === re.lastIndex) re.lastIndex += 1; // guard zero-width loops
    }
  }
  return hits;
}

/**
 * Recursively scans every regular file under `dir` for secrets. A `dir` that
 * does not exist yet scans as empty rather than throwing — T18 (batch 3) is
 * what makes `__tests__/fixtures/` exist; until then the negative half of
 * this scanner has nothing to scan, which is not the same claim as "the
 * scanner found no match in a populated directory".
 */
function scanDirectoryForSecrets(dir) {
  const hits = [];
  if (!fs.existsSync(dir)) return hits;

  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile()) {
        const text = fs.readFileSync(entryPath, "utf8");
        for (const hit of scanTextForSecrets(text)) {
          hits.push({ ...hit, file: entryPath });
        }
      }
    }
  }
  return hits;
}

test("AT-ENG-64/TSPEC §7.2 (negative half): the scan over __tests__/fixtures/ finds no match", () => {
  // Batch 2 (T09) is RED-terminal for a named reason: the per-transport
  // fixtures this half scans don't exist until T18 (batch 3) records them.
  // This asserts the directory's presence explicitly rather than letting a
  // missing-directory short-circuit read as "no matches found" — a directory
  // that does not exist yet is not the same claim as a populated one the
  // scanner searched and cleared.
  assert.ok(
    fs.existsSync(fixturesDir),
    `expected ${fixturesDir} to exist with recorded per-transport fixtures (T18); it does not yet`,
  );
  const hits = scanDirectoryForSecrets(fixturesDir);
  assert.deepEqual(
    hits,
    [],
    `expected no redaction hits under ${fixturesDir}, found: ${JSON.stringify(hits)}`,
  );
});

test("AT-ENG-64/TSPEC §7.2 (positive control): the same scanner, run over a scratch file carrying one instance of each documented rule, must flag every one of them", () => {
  const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdlc-redaction-positive-"));
  const scratchFile = path.join(scratchDir, "leaked-secrets.txt");
  try {
    const scratchText = REDACTION_RULES.map((rule) => rule.sample).join("\n");
    fs.writeFileSync(scratchFile, scratchText, "utf8");

    const hits = scanTextForSecrets(scratchText);
    const flaggedRuleNames = new Set(hits.map((hit) => hit.rule));
    const allRuleNames = REDACTION_RULES.map((rule) => rule.name);

    assert.deepEqual(
      [...flaggedRuleNames].sort(),
      [...allRuleNames].sort(),
      `positive control must flag one hit per documented rule; flagged=${JSON.stringify([...flaggedRuleNames])} expected=${JSON.stringify(allRuleNames)}`,
    );

    // Same scanner, same scratch file, via the directory-walking entry point
    // this file's negative half also uses — proves the positive control
    // exercises the exact code path the negative half runs over real
    // fixtures, not a second, differently-wired copy of the pattern.
    const dirHits = scanDirectoryForSecrets(scratchDir);
    assert.equal(
      dirHits.length,
      REDACTION_RULES.length,
      `expected exactly one directory-walk hit per rule, got: ${JSON.stringify(dirHits)}`,
    );
  } finally {
    fs.rmSync(scratchDir, { recursive: true, force: true });
  }
});

test("AT-ENG-64/TSPEC §7.2: a clean file with no key-shaped content is not flagged (falsifier for the positive control)", () => {
  const hits = scanTextForSecrets(
    "This fixture file intentionally contains no credentials of any kind.\nANTHROPIC_API_KEY is mentioned by name only, never assigned a value.\n",
  );
  assert.deepEqual(hits, []);
});
