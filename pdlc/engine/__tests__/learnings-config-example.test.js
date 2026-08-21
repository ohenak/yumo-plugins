// Purpose-named carrier for CODE_REVIEW v1 F9's example-config expectation
// (feature `pdlc-learnings-injection`).
//
// Its own file, for the same reason `advisory-config-example.test.js` is its own file: a
// config-schema assertion hung off `ci-arrangement.test.js` would let an unrelated
// config-example edit redden the delivery-blocking `Engine tests (ubuntu-latest)` check
// under a file whose stated scope names no such concern.
//
// What this asserts: `.claude/pdlc.config.example.json` parses, and its `learningsInjection`
// section carries all four REQ §4.1 declared keys AT THEIR DECLARED DEFAULTS. The defaults
// are transcribed here as literals rather than imported from `orchestrate-dev.js`'s
// `LEARNINGS_DEFAULTS`: importing them would make the example agree with the code by
// construction, and the disclosure this pins is that an operator reading the example sees
// the values the pipeline will actually use. If a default is deliberately changed, both the
// code and this transcription must move — that is the point.
//
// Why the example must show the shipping defaults rather than `enabled: false`: this feature
// ships DEFAULT-ON and changes every authoring dispatch in every consumer repo. The example is
// the operator's first — often only — encounter with the key, and the one they will copy to
// turn it off.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const configPath = path.join(repoRoot, ".claude", "pdlc.config.example.json");

// REQ-pdlc-learnings-injection §4.1, transcribed.
const DECLARED_DEFAULTS = {
  enabled: true,
  maxDocuments: 5,
  maxBytesPerDocument: 6000,
  maxTotalBytes: 20000,
};

test("learnings config example — learningsInjection section carries every §4.1 key", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const section = config?.learningsInjection;

  assert.equal(
    typeof section,
    "object",
    "pdlc.config.example.json must carry a `learningsInjection` section (CODE_REVIEW v1 F9): " +
      "the feature ships default-on and the example is where an operator learns the key exists"
  );
  assert.notEqual(section, null, "learningsInjection section must not be null");

  assert.deepEqual(
    Object.keys(section).sort(),
    Object.keys(DECLARED_DEFAULTS).sort(),
    "the example must disclose exactly REQ §4.1's declared key set — no more (NG-7 admits no " +
      "configuration surface beyond §4.1) and no fewer (an omitted key is an undiscoverable one)"
  );
});

test("learnings config example — every disclosed value is REQ §4.1's declared default", () => {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const section = config?.learningsInjection ?? {};

  assert.equal(
    section.enabled,
    DECLARED_DEFAULTS.enabled,
    "learningsInjection.enabled must be shown at its shipping default `true`: the example " +
      "states what the pipeline does, and this feature is on unless turned off (AC-5.1a)"
  );
  assert.equal(typeof section.enabled, "boolean", "learningsInjection.enabled must be boolean");

  for (const key of ["maxDocuments", "maxBytesPerDocument", "maxTotalBytes"]) {
    assert.equal(
      typeof section[key],
      "number",
      `learningsInjection.${key} must be a number`
    );
    assert.ok(
      Number.isInteger(section[key]) && section[key] >= 0,
      `learningsInjection.${key} must be a non-negative integer`
    );
    assert.equal(
      section[key],
      DECLARED_DEFAULTS[key],
      `learningsInjection.${key} must equal REQ §4.1's declared default ${DECLARED_DEFAULTS[key]}`
    );
  }
});
