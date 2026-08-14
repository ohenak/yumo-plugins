// Tests for `pdlc --version` / `pdlc doctor` (PLAN T15, TSPEC §6.2/§6.3,
// FSPEC AT-1.1..AT-1.4, AT-1.6, BR-1.3, BR-1.5). [red]: the composing
// surface under test, `runVersionDoctor`, is authored by T46 (`bin/cli.mjs`)
// and does not exist yet. Its assertions are committed now, skipped under
// the "T46:" id (dynamic import below lets the file load skipped rather
// than fail on import), and T46 un-skips and drives them green.
//
// Two independent axes are exercised here, both surfaced through ONE
// command (`--version` reports briefly, `doctor` reports at length, neither
// ever refuses — AC-1.1, AC-1.4, §6.2):
//
//   1. The ENGINE-version store ladder (§6.3, `resolveVersion`, T37): does
//      this invocation resolve to a pinned/latest/dev store entry, or does
//      it fall back to the launcher's own build? Legs (a)(b)(c) below.
//   2. The PLUGIN compat handshake (`lib/handshake.mjs`, shipped):
//      `readPluginVersion` + `checkCompat`, reported for diagnosis but never
//      gating `doctor` (AC-1.1). Legs (d)(e)(f)(g)(h) below.
//
// This file's assumed call shape for `runVersionDoctor`, stated once here
// rather than re-derived per test (mirrors `resolve-version.test.js`'s and
// `provenance.test.js`'s own "assumed shape" preambles):
//
//   runVersionDoctor({
//     command: "version" | "doctor",
//     // engine-version ladder inputs, passed straight through to
//     // `resolveVersion()` (§6.3):
//     listing, configResult, dev, env, location,
//     storeRoot, installCommand,      // doctor-only extra facts (§6.2)
//     engineVersion,                  // launcher's OWN package.json version —
//                                     // the unresolved fallback and the
//                                     // "resolved" triple's source when the
//                                     // ladder lands on `dev` (no store root)
//     // plugin handshake inputs — the existing, shipped surface:
//     pluginRoot, fs, pluginCompat,
//   }) -> {
//     exitCode: 0,                                 // ALWAYS — a diagnostic
//                                                   // that exits non-zero on
//                                                   // the thing it diagnoses
//                                                   // is not a diagnostic
//                                                   // (§6.2)
//     mode: "pin" | "latest" | "dev" | "unresolved",
//     resolvedEngineVersion: string,
//     pin: string | null,
//     storeNotice: string | null,     // resolveVersion()'s refusal.text,
//                                     // present only when mode is
//                                     // "unresolved" — never an exit
//     plugin: { ok, reason, pluginVersion, range },  // checkCompat()'s
//                                                     // return, verbatim
//     pluginReadError: string | null, // readPluginVersion()'s own reason
//                                     // when the manifest was found but
//                                     // broken (BR-1.3) — distinct from
//                                     // checkCompat's generic "not found"
//     provenance,                     // buildProvenance() (lib/provenance.mjs,
//                                     // T27) over the fields above — the
//                                     // ONE construction site BR-1.5 requires
//     lines: string[],                // rendered text; `doctor` additionally
//                                     // carries storeRoot / enumerated
//                                     // versions / installCommand
//   }
//
// `plugin.pluginVersion` IS the AT-1.6 version-triple member: `checkCompat`
// already renders it as the literal string `"not found"` when no plugin
// resolves, versus `plugin.reason`, the refusal REASON TEXT, which only
// *contains* that literal (FSPEC AT-1.1's split, already the shipped
// discipline in `handshake.test.js`'s "a missing plugin refuses and names
// the range, 'not found', and the remedy": equality on the member,
// containment on the text). This file follows that same split throughout —
// never `assert.equal` on a reason string, never `assert.match` on a
// version-triple member.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

// `runVersionDoctor` is imported lazily inside each test body below
// (dynamic `await import(...)`) rather than statically here: `bin/cli.mjs`
// is owned by T46 and does not exist yet, and a top-level static import of a
// missing module would fail the whole file at load time before any `.skip`
// could take effect.

import { configAbsent, configNoPin, configUnreadable } from "./_doubles.mjs";

// ───────────────────────── shared fixture builders ─────────────────────────

/**
 * @param {{isCheckout?: boolean, checkoutRoot?: string, pluginRootMatches?: boolean,
 *   enginePath?: string}} [opts]
 */
function makeLocation({
  isCheckout = false,
  checkoutRoot = "/repo",
  pluginRootMatches = false,
  enginePath = "/repo/pdlc/engine",
} = {}) {
  return {
    enginePath,
    isCheckout,
    checkoutRoot: isCheckout ? checkoutRoot : "",
    pluginRoot: pluginRootMatches ? path.join(checkoutRoot, "pdlc") : "/elsewhere/pdlc",
  };
}

const NOT_A_CHECKOUT = makeLocation({ isCheckout: false });

const PLUGIN_ROOT = "/plugin";
const MANIFEST = path.join(PLUGIN_ROOT, ".claude-plugin", "plugin.json");
const RANGE = "^1.0.0";
const LAUNCHER_OWN_ENGINE_VERSION = "0.5.0";
const STORE_ROOT = "/fake-store/versions";
const INSTALL_COMMAND = "claude plugin install pdlc@yumo-plugins";

/** A fake fs over an exact path -> file-contents map (mirrors handshake.test.js). */
function fsWith(files) {
  return {
    readFileSync: (p) => {
      if (!Object.hasOwn(files, p)) {
        const err = new Error(`ENOENT: no such file or directory, open '${p}'`);
        err.code = "ENOENT";
        throw err;
      }
      return files[p];
    },
  };
}

// BR-1.2's "absent" state: no plugin ROOT resolves at all (`pluginRoot:
// null`) — the composing function must not even attempt a manifest read in
// this case, and hands `null` straight to `checkCompat` (handshake.mjs's
// own shipped "not found" surface). This is AT-1.1's scenario.
const NO_ROOT = null;
// BR-1.3's "present but unreadable" states: a plugin ROOT resolves, but the
// manifest under it is missing / unparseable / version-field-absent. NONE
// of these three is "absent" (BR-1.3, explicit) — each refuses naming the
// inspected root and what was wrong, never collapsing into AT-1.1's "not
// found". `fs` is never consulted when `pluginRoot` is `NO_ROOT` above, so
// these only matter when `pluginRoot` is the resolved `PLUGIN_ROOT`.
const FS_MANIFEST_MISSING = fsWith({});
const FS_UNPARSEABLE_MANIFEST = fsWith({ [MANIFEST]: "{oops" });
const FS_MANIFEST_NO_VERSION = fsWith({ [MANIFEST]: JSON.stringify({ name: "pdlc" }) });

function fsInRangePlugin(version = "1.2.3") {
  return fsWith({ [MANIFEST]: JSON.stringify({ name: "pdlc", version }) });
}

function fsOutOfRangePlugin(version = "9.9.9") {
  return fsWith({ [MANIFEST]: JSON.stringify({ name: "pdlc", version }) });
}

/** The fixed set of inputs every scenario below starts from; a test
 * overrides only the fields its leg cares about. */
function baseInputs(overrides = {}) {
  return {
    command: "version",
    listing: ["0.3.1", "0.4.0"],
    configResult: configAbsent(),
    dev: false,
    env: {},
    location: NOT_A_CHECKOUT,
    storeRoot: STORE_ROOT,
    installCommand: INSTALL_COMMAND,
    engineVersion: LAUNCHER_OWN_ENGINE_VERSION,
    pluginRoot: PLUGIN_ROOT,
    fs: fsInRangePlugin(),
    pluginCompat: RANGE,
    ...overrides,
  };
}

// ───── (a)(b)(c): the engine-version store ladder never refuses ───────────
// §6.2's two states: (a) a pin resolves and is reported as the RESOLVED
// triple; (b) an empty store falls back to the launcher's own triple with
// `mode: "unresolved"` and the refusal carried as a notice, never an exit;
// (c) `doctor` under a corrupt config prints branch 0's text and still
// exits 0 — exercised across all three refusing branches, not just one.

describe.skip("T46: (a)(b)(c) the store ladder resolves for reporting but never refuses", () => {
  test("(a) a pinned repo reports the RESOLVED triple with mode: 'pin'", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");
    const out = runVersionDoctor(
      baseInputs({
        command: "version",
        listing: ["0.3.1", "0.4.0"],
        configResult: configNoPin({ version: "0.4.0" }),
      })
    );
    assert.equal(out.exitCode, 0);
    assert.equal(out.mode, "pin");
    assert.equal(out.pin, "0.4.0");
    // The resolved store version is reported, never the launcher's own.
    assert.equal(out.resolvedEngineVersion, "0.4.0");
    assert.notEqual(out.resolvedEngineVersion, LAUNCHER_OWN_ENGINE_VERSION);
    assert.equal(out.storeNotice, null);
  });

  test("(b) an empty store reports the launcher's OWN triple with mode: 'unresolved', refusal text as a notice", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");
    const out = runVersionDoctor(
      baseInputs({
        command: "version",
        listing: [],
        configResult: configAbsent(),
      })
    );
    assert.equal(out.exitCode, 0);
    assert.equal(out.mode, "unresolved");
    assert.equal(out.resolvedEngineVersion, LAUNCHER_OWN_ENGINE_VERSION);
    assert.equal(out.pin, null);
    // Not an exit: the refusing branch's text is a positively-populated
    // notice string, never thrown, never non-zero.
    assert.equal(typeof out.storeNotice, "string");
    assert.ok(out.storeNotice.length > 0);
    assert.match(out.storeNotice, /store/i);
  });

  test("(c) doctor under a corrupt config prints branch 0's text and exits 0 — exit 0 across all three refusing branches", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");

    const corruptConfig = runVersionDoctor(
      baseInputs({
        command: "doctor",
        listing: ["0.3.1"],
        configResult: configUnreadable(".claude/pdlc.config.json", "Unexpected end of JSON input"),
      })
    );
    assert.equal(corruptConfig.exitCode, 0);
    assert.equal(corruptConfig.mode, "unresolved");
    assert.match(corruptConfig.storeNotice, /\.claude\/pdlc\.config\.json/);
    // doctor's extra facts are present alongside the notice.
    assert.ok(corruptConfig.lines.some((l) => l.includes(STORE_ROOT)));
    assert.ok(corruptConfig.lines.some((l) => l.includes(INSTALL_COMMAND)));

    const emptyStore = runVersionDoctor(
      baseInputs({ command: "doctor", listing: [], configResult: configAbsent() })
    );
    assert.equal(emptyStore.exitCode, 0);

    const missingPin = runVersionDoctor(
      baseInputs({
        command: "doctor",
        listing: ["0.3.1"],
        configResult: configNoPin({ version: "9.9.9" }),
      })
    );
    assert.equal(missingPin.exitCode, 0);
    assert.equal(missingPin.mode, "unresolved");
  });
});

// ───── (d) AT-1.2: the out-of-range refusal is distinguishable from AT-1.1's ─
// Not "both are non-empty": a positive pin on each, plus `notEqual` between
// them, and AT-1.2's text additionally names the range AND the version found.

describe.skip("T46: (d) AT-1.1 vs AT-1.2 — distinguishable refusal texts, not merely both non-empty", () => {
  test("no plugin installed (AT-1.1) vs an out-of-range plugin (AT-1.2) refuse with different text", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");

    const noPlugin = runVersionDoctor(baseInputs({ command: "doctor", pluginRoot: NO_ROOT }));
    assert.equal(noPlugin.plugin.ok, false);
    assert.equal(noPlugin.plugin.pluginVersion, "not found");
    assert.match(noPlugin.plugin.reason, /not found/);
    assert.match(noPlugin.plugin.reason, new RegExp(RANGE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    // No root to inspect: no manifest read is even attempted.
    assert.equal(noPlugin.pluginReadError, null);

    const outOfRange = runVersionDoctor(
      baseInputs({ command: "doctor", fs: fsOutOfRangePlugin("9.9.9") })
    );
    assert.equal(outOfRange.plugin.ok, false);
    assert.equal(outOfRange.plugin.pluginVersion, "9.9.9");
    assert.match(outOfRange.plugin.reason, /9\.9\.9/);
    assert.match(outOfRange.plugin.reason, new RegExp(RANGE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    // The positive pin above is not "both non-empty" — the two reason
    // strings must be distinguishable from one another.
    assert.notEqual(noPlugin.plugin.reason, outOfRange.plugin.reason);
    // And the version-triple MEMBER (equality surface) is never confused
    // with the reason TEXT (containment surface).
    assert.notEqual(noPlugin.plugin.pluginVersion, outOfRange.plugin.reason);
  });
});

// ───── (e) AT-1.4 / BR-1.3: an unparseable manifest names root + parse
// failure, and is NOT AT-1.1's "not found" message ─────────────────────────

describe.skip("T46: (e) AT-1.4 (BR-1.3): unparseable plugin manifest refuses on its own terms", () => {
  test("a present-but-unparseable manifest names the root and the parse failure, distinct from AT-1.1's 'not found'", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");
    const out = runVersionDoctor(
      baseInputs({ command: "doctor", fs: FS_UNPARSEABLE_MANIFEST })
    );
    assert.equal(typeof out.pluginReadError, "string");
    assert.ok(out.pluginReadError.length > 0);
    assert.match(out.pluginReadError, /not valid JSON/);
    assert.ok(
      out.pluginReadError.includes(PLUGIN_ROOT) || out.pluginReadError.includes(MANIFEST),
      `pluginReadError must name the root: ${out.pluginReadError}`
    );
    // The assertion pins that this is NOT AT-1.1's `not found` message —
    // BR-1.3's whole point is that "present but broken" reads differently
    // from "absent".
    assert.equal(/not found/.test(out.pluginReadError), false, out.pluginReadError);
    assert.notEqual(out.plugin.pluginVersion, "not found");
  });

  // BR-1.3's other two "present but unreadable" variants: a missing manifest
  // file under a resolved root, and a manifest with no parseable `version`
  // field. Neither collapses into "absent" (AT-1.1) either.
  test("a resolved root with no manifest file at all still refuses naming the root — not AT-1.1's 'not found'", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");
    const out = runVersionDoctor(baseInputs({ command: "doctor", fs: FS_MANIFEST_MISSING }));
    assert.equal(typeof out.pluginReadError, "string");
    assert.match(out.pluginReadError, /cannot read plugin manifest/);
    assert.equal(/not found/.test(out.pluginReadError), false, out.pluginReadError);
  });

  test("a manifest with no parseable version field refuses naming the root — not AT-1.1's 'not found'", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");
    const out = runVersionDoctor(baseInputs({ command: "doctor", fs: FS_MANIFEST_NO_VERSION }));
    assert.equal(typeof out.pluginReadError, "string");
    assert.match(out.pluginReadError, /no parseable "version" field/);
    assert.equal(/not found/.test(out.pluginReadError), false, out.pluginReadError);
  });

  test("truly absent (no root) DOES read as 'not found', distinguishing it from all three unreadable variants above", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");
    const absent = runVersionDoctor(baseInputs({ command: "doctor", pluginRoot: NO_ROOT }));
    assert.equal(absent.pluginReadError, null);
    assert.equal(absent.plugin.pluginVersion, "not found");
  });
});

// ───── (f) AT-1.3: the diagnostic completes and reports the triple in
// BOTH refusal states, not just one ─────────────────────────────────────────

describe.skip("T46: (f) AT-1.3: doctor completes and reports the triple in both refusal states", () => {
  test("absent (AT-1.1) and out-of-range (AT-1.2) both complete with exit 0 and a fully-populated triple", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");

    const absent = runVersionDoctor(baseInputs({ command: "doctor", pluginRoot: NO_ROOT }));
    assert.equal(absent.exitCode, 0);
    assert.equal(typeof absent.plugin.range, "string");
    assert.ok(absent.plugin.range.length > 0);
    assert.equal(typeof absent.plugin.pluginVersion, "string");
    assert.equal(typeof absent.resolvedEngineVersion, "string");
    assert.ok(absent.resolvedEngineVersion.length > 0);

    const outOfRange = runVersionDoctor(
      baseInputs({ command: "doctor", fs: fsOutOfRangePlugin("9.9.9") })
    );
    assert.equal(outOfRange.exitCode, 0);
    assert.equal(typeof outOfRange.plugin.range, "string");
    assert.ok(outOfRange.plugin.range.length > 0);
    assert.equal(typeof outOfRange.plugin.pluginVersion, "string");
    assert.equal(typeof outOfRange.resolvedEngineVersion, "string");
    assert.ok(outOfRange.resolvedEngineVersion.length > 0);

    // Not the same triple member value — the two refusal states are
    // reporting genuinely different plugin findings, not a shared stub.
    assert.notEqual(absent.plugin.pluginVersion, outOfRange.plugin.pluginVersion);
  });
});

// ───── (g) AT-1.6: the queried triple equals the same run's banner triple
// and the same run's report triple, by three-way equality (BR-1.5) ────────
//
// BR-1.5: "resolved once per run, all emitters read that resolution." The
// mechanical proof used here is that ALL THREE surfaces — `--version`,
// `doctor`, and a direct call to the ONE construction site
// (`buildProvenance`, lib/provenance.mjs, T27) — are built from identical
// inputs and must therefore yield a byte-identical `Provenance`. If any of
// the three re-derived its own triple independently, this equality could
// not hold in general (a defect BR-1.5 names as unfalsifiable any other
// way).

describe.skip("T46: (g) AT-1.6/BR-1.5: query triple, banner triple and report triple are the SAME Provenance", () => {
  test("`--version` and `doctor` agree, over identical inputs, three ways: with each other AND with a direct buildProvenance() call", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");
    const { buildProvenance } = await import("../lib/provenance.mjs");

    const inputs = baseInputs({
      command: "version",
      listing: ["0.3.1", "0.4.0"],
      configResult: configNoPin({ version: "0.4.0" }),
    });

    const versionOut = runVersionDoctor(inputs);
    const doctorOut = runVersionDoctor({ ...inputs, command: "doctor" });

    // (1) --version and doctor: the SAME triple.
    assert.deepEqual(versionOut.provenance, doctorOut.provenance);
    assert.equal(versionOut.provenance.engineVersion, doctorOut.provenance.engineVersion);
    assert.equal(versionOut.provenance.pluginVersion, doctorOut.provenance.pluginVersion);
    assert.equal(versionOut.provenance.pluginCompat, doctorOut.provenance.pluginCompat);

    // (2) The reported provenance is not a bespoke render: it round-trips
    // through the ONE construction site the run report and banner also use.
    const rebuilt = buildProvenance({
      engineVersion: versionOut.resolvedEngineVersion,
      pluginVersion: versionOut.plugin.pluginVersion === "not found" ? null : versionOut.plugin.pluginVersion,
      pluginCompat: versionOut.plugin.range,
      channel: versionOut.provenance.channel,
      mode: versionOut.mode,
      pin: versionOut.pin,
      loadRoot: versionOut.provenance.loadRoot,
    });
    assert.deepEqual(rebuilt, versionOut.provenance);
    assert.deepEqual(rebuilt, doctorOut.provenance);
  });
});

// ───── (h) AT-1.1 with the two operators FSPEC gives it (PM round-7 F-01) ──
// Reinforces, at THIS command surface (not just handshake.mjs's own suite),
// that the refusal REASON TEXT is asserted by containment and the
// version-triple MEMBER is asserted by equality — never the reverse.

describe.skip("T46: (h) AT-1.1's two operators: containment on the reason text, equality on the triple member", () => {
  test("`assert.match` on the reason text, `assert.equal` on the triple member — reversing them is the false-red T15 exists to prevent", async () => {
    const { runVersionDoctor } = await import("../bin/cli.mjs");
    const out = runVersionDoctor(baseInputs({ command: "doctor", pluginRoot: NO_ROOT }));

    // The triple member: EQUALITY.
    assert.equal(out.plugin.pluginVersion, "not found");
    // The refusal reason text: CONTAINMENT — it is a longer sentence that
    // merely carries the literal, so `assert.equal` against it would be a
    // false red on a correct implementation.
    assert.match(out.plugin.reason, /not found/);
    assert.notEqual(out.plugin.reason, "not found");
  });
});
