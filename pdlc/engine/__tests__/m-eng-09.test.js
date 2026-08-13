// Tests for the M-ENG-09 guard-measurement gate (T29, pdlc-headless-engine) —
// TSPEC §6.5, DEC-ENG-04, PROP-GUARD-20/21/22, NEG-23.
//
// RED at T29 (batch 4): `docs/_constraints/pdlc-engine-baseline.md` carries
// no `## M-ENG-09` section yet (M-ENG-01…M-ENG-08 exist, M-ENG-09 does not).
// The last test group below reads that REAL file for the REAL
// `process.platform` and is deliberately expected to fail until T42 appends
// the row — that is the gate discharging TSPEC §6.5's "unrecorded is red,
// not silent": this file, collected into `node --test __tests__/`, IS the
// hermetic-suite failure the obligation describes, not a simulation of one.
// Everything above that group is a pure unit test of `checkGuardMeasurement`
// over fixture baseline text, independent of real repo state and of whether
// `lib/transport.mjs` has landed its hook-carrier export yet (T36).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  checkGuardMeasurement,
  detectHookCarrierShipped,
  GUARD_MEASUREMENT_OPT_IN_COMMAND,
} from "../lib/guard-measurement.mjs";
import { message, messageIds } from "../lib/catalogue.mjs";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const engineRoot = path.dirname(testsDir);
const repoRoot = path.dirname(path.dirname(engineRoot));
const BASELINE_PATH = path.join(repoRoot, "docs/_constraints/pdlc-engine-baseline.md");

function baselineWithRow({ platform = "linux", denyFired = "yes", complete = true } = {}) {
  const row = complete
    ? `| 2026-08-13 | ${platform} | agent-sdk | 0.1.0 | ${denyFired} |`
    : `| 2026-08-13 | ${platform} | agent-sdk | ${denyFired} |`; // missing sdkVersion column
  return [
    "## M-ENG-06 — unrelated prior section",
    "",
    "some unrelated prose",
    "",
    "## M-ENG-09 — PreToolUse deny under bypassPermissions",
    "",
    "| date | platform | transport | sdkVersion | denyFired |",
    "|---|---|---|---|---|",
    row,
    "",
    "## M-ENG-99 — unrelated later section",
    "",
    "more unrelated prose",
    "",
  ].join("\n");
}

const NO_SECTION_TEXT = ["## M-ENG-06 — unrelated prior section", "", "prose only, no M-ENG-09 at all", ""].join(
  "\n"
);

// ── PROP-GUARD-20: absent measurement is red, with a catalogue-registered
//    message naming the missing measurement and the opt-in command ────────

test("PROP-GUARD-20: no M-ENG-09 section at all -> red, missing-measurement message", () => {
  const result = checkGuardMeasurement({
    baselineText: NO_SECTION_TEXT,
    platform: "linux",
    hookCarrierShipped: true,
  });

  assert.equal(result.ok, false);
  assert.equal(result.messageId, "guard.measurement-missing");
  assert.ok(messageIds().includes(result.messageId), "message id must be catalogue-registered");

  const text = message(result.messageId, result.params);
  assert.match(text, /M-ENG-09/, "must name the missing measurement");
  assert.match(text, /linux/, "must name the running platform");
  assert.ok(text.includes(GUARD_MEASUREMENT_OPT_IN_COMMAND), "must name the opt-in command verbatim");
});

test("PROP-GUARD-20/PROP-GUARD-22: a row present but for a DIFFERENT platform is still red — never satisfies the running host's obligation", () => {
  const result = checkGuardMeasurement({
    baselineText: baselineWithRow({ platform: "darwin", denyFired: "yes" }),
    platform: "linux",
    hookCarrierShipped: true,
  });

  assert.equal(result.ok, false);
  assert.equal(result.messageId, "guard.measurement-missing");
});

test("PROP-GUARD-22: a row missing a column (incomplete) is treated as absent, not satisfying", () => {
  const result = checkGuardMeasurement({
    baselineText: baselineWithRow({ platform: "linux", denyFired: "yes", complete: false }),
    platform: "linux",
    hookCarrierShipped: true,
  });

  assert.equal(result.ok, false);
  assert.equal(result.messageId, "guard.measurement-missing");
});

// ── PROP-GUARD-21/NEG-23: presence AND consistency, all three branches ─────

test("PROP-GUARD-21 branch 1: denyFired: yes, hook carrier ships -> green", () => {
  const result = checkGuardMeasurement({
    baselineText: baselineWithRow({ platform: "linux", denyFired: "yes" }),
    platform: "linux",
    hookCarrierShipped: true,
  });

  assert.equal(result.ok, true);
  assert.equal(result.messageId, null);
});

test("PROP-GUARD-21 branch 2/NEG-23 (DEC-ENG-04): denyFired: no, hook carrier STILL ships -> red, distinct message", () => {
  const result = checkGuardMeasurement({
    baselineText: baselineWithRow({ platform: "linux", denyFired: "no" }),
    platform: "linux",
    hookCarrierShipped: true,
  });

  assert.equal(result.ok, false);
  assert.equal(result.messageId, "guard.measurement-negative");
  assert.ok(messageIds().includes(result.messageId), "message id must be catalogue-registered");

  const text = message(result.messageId, result.params);
  assert.match(text, /M-ENG-09|denyFired/, "must name the negative measurement");
});

test("PROP-GUARD-21 branch 3: denyFired: no, hook carrier NO LONGER ships (posture moved to canUseTool) -> green again", () => {
  const result = checkGuardMeasurement({
    baselineText: baselineWithRow({ platform: "linux", denyFired: "no" }),
    platform: "linux",
    hookCarrierShipped: false,
  });

  assert.equal(result.ok, true, "the recorded fact and the shipped mechanism agree once the carrier has moved");
});

test("NEG-23: must never be green on any row other than these two named branches (denyFired malformed value)", () => {
  const result = checkGuardMeasurement({
    baselineText: baselineWithRow({ platform: "linux", denyFired: "maybe" }),
    platform: "linux",
    hookCarrierShipped: true,
  });

  // A value that is not the literal "yes" is not a positive measurement.
  assert.equal(result.ok, false);
  assert.equal(result.messageId, "guard.measurement-negative");
});

// ── Well-formedness of the fixture builder itself, and of the module's
//    exported opt-in command constant (guards against a fixture that never
//    actually exercises the code it claims to) ─────────────────────────────

test("fixture sanity: baselineWithRow's row really does carry all five columns when complete: true", () => {
  const text = baselineWithRow({ platform: "linux", denyFired: "yes", complete: true });
  const dataLine = text.split("\n").find((l) => l.startsWith("| 2026-08-13"));
  assert.ok(dataLine, "fixture must produce a data row");
  const cells = dataLine
    .slice(1, -1)
    .split("|")
    .map((c) => c.trim());
  assert.equal(cells.length, 5);
});

test("GUARD_MEASUREMENT_OPT_IN_COMMAND names the live opt-in test file (PLAN §11, T42)", () => {
  assert.match(GUARD_MEASUREMENT_OPT_IN_COMMAND, /PDLC_LIVE=1/);
  assert.match(GUARD_MEASUREMENT_OPT_IN_COMMAND, /__tests__\/live\/guard-measurement\.test\.js/);
});

// ── The gate itself: the REAL baseline file, the REAL process.platform.
//    This is what makes the hermetic suite (`node --test __tests__/`) fail
//    when the obligation is unmet (TSPEC §6.5) — not a description of that
//    failure but the failure's own mechanism. Deliberately RED at T29: no
//    `## M-ENG-09` section exists in docs/_constraints/pdlc-engine-baseline.md
//    yet (M-ENG-01…M-ENG-08 only). T42 appends the running host's own row as
//    its last act and this same test goes green for that platform; a
//    platform T42's wave never ran on stays red until the named operator
//    step (PLAN §11) records it — by design, per the PLAN's ordering-rule
//    discussion, not by accident. ──────────────────────────────────────────

test("M-ENG-09 gate (real repo, real process.platform): the hermetic suite fails until a consistent row exists for this host", async () => {
  const baselineText = readFileSync(BASELINE_PATH, "utf8");
  const hookCarrierShipped = await detectHookCarrierShipped();

  const result = checkGuardMeasurement({
    baselineText,
    platform: process.platform,
    hookCarrierShipped,
  });

  if (!result.ok) {
    // Fail with the actual catalogue-registered message, so a run that hits
    // this red state names the remedy in its own output (TSPEC §6.5) rather
    // than a bare boolean.
    assert.fail(message(result.messageId, result.params));
  }
});
