/**
 * learningsDisclosure.test.js — CODE_REVIEW v1 F10.
 *
 * `learningsInjection` ships DEFAULT-ON and changes every authoring dispatch in every
 * consumer repo, yet it appeared in none of the operator-facing config-disclosure surfaces
 * (`pdlc/OPERATIONS.md`, `CLAUDE.md`, `pdlc/README.md`) that already document `advisory.*`,
 * `implementation.*` and `mergeMode` — the three other members of the same family. An
 * operator who hits an unexpected prompt suffix had no runbook entry to find.
 *
 * The oracle is deliberately DERIVED, not transcribed: the key set and the notice catalogue
 * are imported from `orchestrate-dev.js` and each member must appear in the runbook text.
 * A transcribed expectation would go stale in exactly the way this finding is about — add a
 * fifth config key or a third notice id and a hand-written list stays green while the
 * runbook silently stops describing the feature. The one hand-written datum is the DEFAULT
 * VALUE each key must be shown at, because a runbook that prints a default the code does not
 * use is worse than one that prints none, and only an independent statement can catch that.
 *
 * It registers no `LI-AT-` title, so §T.5's 35-member partition and `LI-T-SUITEMAP`'s
 * directory-wide closure are unaffected (this file is one of the non-AT-bearing suites).
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { LEARNINGS_DEFAULTS, LEARNINGS_NOTICES } from "../orchestrate-dev.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..", "..");

const read = (relPath) => readFileSync(join(repoRoot, relPath), "utf8");

// The disclosure family shares vocabulary: `advisory.enabled` and `implementation.testCommand`
// both contain the bare word "enabled"/"Command", and `advisory.enabled` is documented as
// `false` a few hundred bytes above. Every assertion below is therefore taken over the
// LEARNINGS SECTION ONLY, sliced between its own `## ` heading and the next one — otherwise a
// test looking for "enabled … true" would happily read the advisory tier's "enabled … false".
function learningsSection(text) {
  const headingIndex = text.search(/^## .*learnings injection.*$/im);
  if (headingIndex < 0) return "";
  const rest = text.slice(headingIndex + 1);
  const nextHeading = rest.search(/^## /m);
  return nextHeading < 0 ? rest : rest.slice(0, nextHeading);
}

const OPERATIONS = "pdlc/OPERATIONS.md";
const CLAUDE_MD = "CLAUDE.md";
const PLUGIN_README = "pdlc/README.md";

describe("LI-DOC: learningsInjection is disclosed in the operator-facing config family (F10)", () => {
  test("LI-DOC-01: OPERATIONS.md documents every declared config key by name", () => {
    const section = learningsSection(read(OPERATIONS));
    expect(section).toContain("learningsInjection");
    for (const key of Object.keys(LEARNINGS_DEFAULTS)) {
      expect(section).toContain(key);
    }
  });

  test("LI-DOC-02: OPERATIONS.md shows each key at the default the code actually ships", () => {
    // Hand-written defaults, checked against the code's own frozen literal first: if these
    // two ever disagree the test fails here rather than blessing a stale runbook.
    const declared = { enabled: true, maxDocuments: 5, maxBytesPerDocument: 6000, maxTotalBytes: 20000 };
    expect({ ...LEARNINGS_DEFAULTS }).toEqual(declared);

    const section = learningsSection(read(OPERATIONS));
    // Each key must be followed, within the same sentence-ish window, by its default. The
    // window keeps the assertion honest without pinning prose: a runbook that names the key
    // in one paragraph and a number in another has not told the operator the default.
    for (const [key, value] of Object.entries(declared)) {
      const index = section.indexOf(key);
      expect(index).toBeGreaterThanOrEqual(0);
      const window = section.slice(index, index + 120);
      expect(window).toContain(String(value));
    }
  });

  test("LI-DOC-03: OPERATIONS.md names every notice id an operator can see in a report", () => {
    const section = learningsSection(read(OPERATIONS));
    for (const notice of LEARNINGS_NOTICES) {
      expect(section).toContain(notice);
    }
  });

  test("LI-DOC-04: OPERATIONS.md states the fail-open rule — a config mistake never disables the feature", () => {
    const section = learningsSection(read(OPERATIONS));
    expect(section).toMatch(/fail[- ]open|fails open/i);
    // The section must say the feature ships ON: that is the fact an operator most needs and
    // the one that distinguishes it from `advisory` (off) and `mergeMode` (off).
    expect(section).toMatch(/default-on|on by default|ships \*\*on\*\*|defaults? to `?true`?/i);
  });

  test("LI-DOC-05: CLAUDE.md and the plugin README both surface the feature", () => {
    for (const relPath of [CLAUDE_MD, PLUGIN_README]) {
      expect(read(relPath)).toContain("learningsInjection");
    }
  });
});
