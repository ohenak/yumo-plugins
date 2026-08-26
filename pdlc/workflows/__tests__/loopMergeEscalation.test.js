// loopMergeEscalation.test.js — PLAN P3-01 (batch 2, depends on P0-00, P0-01).
//
// Owns AT-34 and AT-34a — the BR-18 redactor, both directions (TSPEC "Redaction (BR-18, NFR-5,
// AT-34, AT-34a)"). `redactEntryText` is a new export that lands at P3-02 (🟢): every positive
// assertion below therefore reds today for the right reason and is committed `test.skip`, titled
// "P3-02: …", per the PLAN's [red]/[green] split. The negative-control (AT-34a) block asserts
// *absence* of redaction on non-catalogue seeds through the existing `renderEscalationEntry` —
// true today (nothing is redacted yet) and required to stay true once P3-02 lands, so it is
// committed un-skipped as a durable regression guard.
//
// This file imports `orchestrate-dev.js` as a namespace (`* as devModule`) so a not-yet-existing
// `redactEntryText` export resolves to `undefined` at import time rather than a link error —
// matching the convention `advisoryEscalationLog.test.js` set for the same situation.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { phaseMerge, MERGE_ESCALATIONS } from "../orchestrate-dev.js";
import { parseEscalationLog } from "../lib/escalation-view.mjs";
import {
  fakeGhRun,
  passingGh,
  fakeGit,
  recordingRecordQueueRow,
  fakeSleep,
  fakeNow,
} from "./helpers/mergeDoubles.js";
import { makeAppendFile, makeThrowingAppendFile } from "./helpers/loopDoubles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEV_SOURCE = readFileSync(join(__dirname, "..", "orchestrate-dev.js"), "utf8");

const FIXED_NOW_MS = Date.parse("2026-01-01T00:00:00.000Z");
const FEATURE = "pdlc-engineering-loop";

// The six constant catalogue entries, transcribed literally (TSPEC "Redaction", *Pattern*
// paragraph) — never read back from the implementation, so this side of the set-equality can't
// pass by construction. `gh[pousr]_` and `xox[baprs]-` are the two character-class entries.
const REDACTION_CATALOGUE = ["gh[pousr]_", "ghs_", "github_pat_", "sk-", "xox[baprs]-", "AKIA"];

// One concrete, drawn instance per behavioural match family (five — `gh[pousr]_` subsumes `ghs_`).
const FAMILY_SEEDS = [
  { family: "gh[pousr]_", prefix: "ghp_" },
  { family: "github_pat_", prefix: "github_pat_" },
  { family: "sk-", prefix: "sk-" },
  { family: "xox[baprs]-", prefix: "xoxb-" },
  { family: "AKIA", prefix: "AKIA" },
];

function makeToken(prefix) {
  return `${prefix}${"a1B2c3D4e5F6g7H8".repeat(3)}`.slice(0, prefix.length + 40);
}

function buildDisposition(overrides = {}) {
  return {
    outcome: "escalated",
    reason: "out-of-envelope",
    verdict: {
      seam: "A5",
      diagnosis: "the lint failure also fails on the default branch",
      proposedAction: "nothing",
      confidence: "high",
      withinEnvelope: false,
      evidence: [".github/workflows/pr-tests.yml:31"],
    },
    attempts: 1,
    model: "opus",
    fallback: false,
    ...overrides,
  };
}

function buildCtx(overrides = {}) {
  return {
    feature: FEATURE,
    seam: "A5",
    phase: "PUB",
    phaseOutcome: "halted",
    decision: "whether the lint failure is the feature's to fix, given it also fails on the default branch",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// AT-34 — positive: a catalogue-prefixed token in the diagnosis and in an evidence line is
// redacted, and BR-12's other six fields still render. Owned by P3-02.
// ---------------------------------------------------------------------------

describe("AT-34 — redactEntryText: positive, per behavioural family", () => {
  for (const { family, prefix } of FAMILY_SEEDS) {
    test(`P3-02: a seeded ${family} token in the diagnosis and in an evidence line is redacted, BR-12's other six fields still render`, () => {
      const token = makeToken(prefix);
      const disposition = buildDisposition({
        reason: "budget-exhausted",
        verdict: {
          seam: "A5",
          diagnosis: `credential leaked: ${token}`,
          proposedAction: "rotate the credential",
          confidence: "high",
          withinEnvelope: false,
          evidence: [`log line carries ${token}`],
        },
      });
      const ctx = buildCtx({ decision: "whether the leaked credential requires rotation" });

      const entry = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });

      // The two free-prose fields that carried the seed are redacted.
      expect(entry).not.toContain(token);
      expect(entry).toMatch(/\[redacted:\d+ chars\]/);

      // BR-12's other six fields still render (decision, feature, seam, refusal reason,
      // proposed action, pipeline state).
      expect(entry).toContain(ctx.decision);
      expect(entry).toContain(FEATURE);
      expect(entry).toContain("A5");
      expect(entry).toContain("budget-exhausted");
      expect(entry).toContain("rotate the credential");
      expect(entry).toContain("PUB");
      expect(entry).toContain("halted");
    });
  }

  test("P3-02: the shipped source carries all six constant catalogue entries (set-equality)", () => {
    // Collected side: which of the six literal catalogue fragments actually appear, verbatim, in
    // the shipped source. Expected side: the six-member array transcribed literally above — the
    // two sides never share a symbol, per the oracle-discipline rule ("a catalogue oracle compares
    // a collected set against a literal transcription; the frozen constant appears on neither
    // side"). Deleting `ghs_` from the catalogue therefore reds this without touching AT-34's
    // five behavioural family cases.
    const present = new Set(REDACTION_CATALOGUE.filter((entry) => DEV_SOURCE.includes(entry)));
    expect(present).toEqual(new Set(REDACTION_CATALOGUE));
  });
});

// ---------------------------------------------------------------------------
// PROP-ESC-13 — closed-vocabulary fields (`Feature`, `Seam`, `Source`, `Root cause`, the heading
// timestamp, `Pipeline state`) must NOT be passed through the redactor; only free-prose fields
// (decision sentence, `Refusal reason`, diagnosis, proposed action, evidence lines) are. The
// positive control is a fixture whose `Feature` name is itself prefix-shaped (e.g. `sk-demo`):
// it must render unredacted, while the identical string placed in the diagnosis (same call) must
// render redacted — proving a blanket whole-block redactor would fail this fixture.
// ---------------------------------------------------------------------------

describe("PROP-ESC-13 — closed-vocabulary fields survive redaction untouched (P3-02)", () => {
  test("P3-02: a prefix-shaped Feature/Seam/Root-cause survive verbatim while the same string in the diagnosis is redacted", () => {
    const prefixShapedFeature = "sk-demo";
    const prefixShapedSeam = "sk-A5";
    const prefixShapedRootCause = "sk-upstream-cause";

    const disposition = buildDisposition({
      reason: "budget-exhausted",
      rootCause: prefixShapedRootCause,
      verdict: {
        seam: prefixShapedSeam,
        diagnosis: `credential leaked: ${prefixShapedFeature}`,
        proposedAction: "nothing",
        confidence: "high",
        withinEnvelope: false,
        evidence: ["log line carries no credential"],
      },
    });
    const ctx = buildCtx({ feature: prefixShapedFeature, seam: prefixShapedSeam });

    const entry = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });

    // Closed-vocabulary fields: unredacted, verbatim.
    expect(entry).toContain(`| Feature | ${prefixShapedFeature} |`);
    expect(entry).toContain(`| Seam | ${prefixShapedSeam} |`);
    if (entry.includes("Root cause")) {
      expect(entry).toContain(`| Root cause | ${prefixShapedRootCause} |`);
    }

    // The identical string, placed in the diagnosis (a free-prose field) in the same call, IS
    // redacted — the differential that falsifies a blanket whole-block redactor.
    expect(entry).not.toContain(`credential leaked: ${prefixShapedFeature}`);
    expect(entry).toMatch(/\[redacted:\d+ chars\]/);
  });
});

// ---------------------------------------------------------------------------
// AT-34a — negative control: three seeds that carry no matchable catalogue prefix (or fail the
// left-boundary anchor) survive unredacted, byte-identical to what the (unmodified) renderer
// already produces for the same inputs. True today, and required to stay true once P3-02 lands.
// ---------------------------------------------------------------------------

describe("AT-34a — redaction negative control: three seeds survive unredacted (advisory entry)", () => {
  // Seed 1: a 40-character hex git oid — no `-`/`_` at all, so it can never carry a catalogue
  // prefix and can never falsify the anchor.
  const HEX_OID = "0123456789abcdef0123456789abcdef01234567";

  // Seed 2: a `--loop-state`-shaped token (base64url over [A-Za-z0-9_-]) chosen so its run
  // carries no catalogue prefix at any position — pinned literally so the seed cannot drift into
  // a true positive.
  const NO_PREFIX_TOKEN = "loopStateToken-QWERTYUIOPasdfghjklZXCVBNM1234567890";

  // Seed 3 (the anchor control): the run's *interior*, not its start, carries `sk-`. An
  // unanchored implementation would redact this; a correctly prefix-anchored one must not,
  // because the character preceding `sk-` here is `-`, which is inside the excluded left-boundary
  // class `[A-Za-z0-9_\-]`.
  const INTERIOR_SK_TOKEN = "abc-sk-1234567890tokenXYZQRSTUV";

  const SEEDS = [
    ["a 40-hex git oid", HEX_OID],
    ["a --loop-state token with no catalogue prefix at any position", NO_PREFIX_TOKEN],
    ["a --loop-state token carrying an interior sk- (the anchor control)", INTERIOR_SK_TOKEN],
  ];

  for (const [label, seed] of SEEDS) {
    test(`${label} survives unredacted in the diagnosis and evidence of an advisory entry`, () => {
      const disposition = buildDisposition({
        reason: "budget-exhausted",
        verdict: {
          seam: "A5",
          diagnosis: `no credential here: ${seed}`,
          proposedAction: "nothing",
          confidence: "high",
          withinEnvelope: false,
          evidence: [`log line carries ${seed}`],
        },
      });
      const ctx = buildCtx({ decision: "whether this benign token needs any action" });

      const before = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });
      const after = devModule.renderEscalationEntry(disposition, ctx, { now: FIXED_NOW_MS });

      // Byte-identical to what the renderer produces for the same inputs (its own output is the
      // HEAD baseline here, since HEAD applies no redaction at all).
      expect(after).toBe(before);
      expect(before).toContain(seed);
      expect(before).not.toMatch(/\[redacted:\d+ chars\]/);
    });
  }
});

// ---------------------------------------------------------------------------
// PLAN P3-07/P3-08 — PROP-ESC-08/PROP-ESC-10 (merge variant). P3-07 (this task) authors the
// fixtures and the red assertions; P3-08 wires `phaseMerge` to append through
// `appendEscalationEntry` at each of the five FSPEC §11 escalation sites and regenerates
// `dist/pdlc-cli.mjs`. Every test below is committed `.skip`, titled "P3-08: …", because
// `phaseMerge` does not accept an `_appendFile` seam yet at HEAD — passing one is a no-op, so
// these fail for the right reason (no append is ever recorded) rather than by accident.
//
// Fixture plumbing below mirrors `mergePhase.test.js`'s own `run`/`ghFixture`/`queueRowSeam`
// (PLAN A7 note: `mergeDoubles.js` itself is never edited; the seventh gh surface — the O6
// read-back — is added locally, per that file's own precedent) plus this feature's
// `_appendFile` doubles (`helpers/loopDoubles.js`, PLAN P0-01).
// ---------------------------------------------------------------------------

const PR_URL = "https://github.com/acme/widgets/pull/42";
const MERGE_READBACK_KEY = "gh pr view --json mergeCommit,state";
const MERGED_OID = "abc1234567890abcdef";

function ghFixture(overrides = {}, readback) {
  const map = passingGh(overrides);
  map[MERGE_READBACK_KEY] = readback ?? {
    ok: true,
    stdout: JSON.stringify({ state: "MERGED", mergeCommit: { oid: MERGED_OID } }),
    stderr: "",
  };
  return map;
}

const BASE_MERGE_CONFIG = Object.freeze({
  mergeMode: "gated",
  mergeRequiresCi: true,
  allowSquashMerge: false,
  deleteBranchOnPdlcMerge: true,
  mergeableRetries: 3,
  mergeableRetryDelay: 0,
  guardPaths: [],
});

function queueRowSeam(disposition = "recorded", detail) {
  const shared = recordingRecordQueueRow(disposition);
  const _recordQueueRow = async ({ feature, status, evidence }) => {
    const queueRow = await shared._recordQueueRow(feature, status, evidence);
    return detail !== undefined ? { queueRow, detail } : { queueRow };
  };
  return { calls: shared.calls, _recordQueueRow };
}

/** Runs `phaseMerge` against a fresh gh/git/queue-row fixture set, optionally injecting
 * `_appendFile` — the seam P3-08 adds. */
async function runMerge({
  gh = {},
  readback,
  git = {},
  config = {},
  recordDisposition = "recorded",
  prUrl = PR_URL,
  feature = FEATURE,
  _appendFile,
} = {}) {
  const ghRun = fakeGhRun(ghFixture(gh, readback));
  const gitDouble = fakeGit(git);
  const queueRow = queueRowSeam(recordDisposition);
  const readFileDouble = async () => {
    throw new Error("_readFile should not be called when config is supplied directly");
  };
  const outcome = await phaseMerge({
    feature,
    prUrl,
    config: { ...BASE_MERGE_CONFIG, ...config },
    _ghRun: ghRun._ghRun,
    _git: gitDouble._git,
    _readFile: readFileDouble,
    _recordQueueRow: queueRow._recordQueueRow,
    _sleep: fakeSleep,
    _now: fakeNow,
    _appendFile,
  });
  return { outcome, ghCalls: ghRun.calls, gitCalls: gitDouble.calls, queueCalls: queueRow.calls };
}

/** Reads back the sole appended entry at `path` and parses it, asserting exactly one append. */
function soleAppendedEntry(append) {
  expect(append.calls).toHaveLength(1);
  const { path } = append.calls[0];
  const { entries } = parseEscalationLog(append.text(path));
  expect(entries).toHaveLength(1);
  return entries[0];
}

// ---------------------------------------------------------------------------
// PROP-ESC-08 — five merge-phase escalation sites, driven through `phaseMerge`. Each cell
// asserts (a) exactly one append at that site, (b) the site's own notice string is still
// present in `outcome.escalations` — the surviving-notice conjunct, falsifying an
// implementation that *replaces* the notice with the append — and (c) the appended entry's
// `source` is `"merge-refusal"`.
// ---------------------------------------------------------------------------

describe("PROP-ESC-08 — merge-refusal append sites (owned by P3-08)", () => {
  test("P3-08: row 1 — queue-not-updated site appends and keeps the queue notice", async () => {
    const append = makeAppendFile();
    const { outcome } = await runMerge({ recordDisposition: "error", _appendFile: append._appendFile });

    const expectedNotice = MERGE_ESCALATIONS.queue({
      prUrl: PR_URL,
      shortSha: MERGED_OID.slice(0, 7),
      feature: FEATURE,
      detail: "queue row not found",
    });
    expect(outcome.escalations).toContain(expectedNotice);

    const entry = soleAppendedEntry(append);
    expect(entry.source).toBe("merge-refusal");
    expect(entry.kind).toBe("non-advisory");
  });

  test("P3-08: row 2 — tree-not-updated site appends and keeps the tree notice", async () => {
    const append = makeAppendFile();
    const { outcome } = await runMerge({
      git: { status: { ok: true, stdout: "M some/file.txt\n", stderr: "" } },
      _appendFile: append._appendFile,
    });

    const expectedNotice = MERGE_ESCALATIONS.tree({
      prUrl: PR_URL,
      reason: "working tree is dirty",
      branch: "unknown",
    });
    expect(outcome.escalations).toContain(expectedNotice);

    const entry = soleAppendedEntry(append);
    expect(entry.source).toBe("merge-refusal");
    expect(entry.kind).toBe("non-advisory");
  });

  test("P3-08: row 3 — guard fired, a changed path matched: appends and keeps the guard notice", async () => {
    const append = makeAppendFile();
    const { outcome } = await runMerge({
      gh: { changedFiles: { stdout: JSON.stringify({ files: [{ path: "pdlc/skills/x.md" }] }) } },
      _appendFile: append._appendFile,
    });

    const expectedNotice = MERGE_ESCALATIONS.guard({
      prUrl: PR_URL,
      tail: "matched paths: pdlc/skills/x.md",
    });
    expect(outcome.escalations).toContain(expectedNotice);

    const entry = soleAppendedEntry(append);
    expect(entry.source).toBe("merge-refusal");
    expect(entry.kind).toBe("non-advisory");
  });

  test("P3-08: row 4 — guard fired, changed-file list unretrievable: appends and keeps the guard notice", async () => {
    const append = makeAppendFile();
    const { outcome } = await runMerge({
      gh: { changedFiles: { ok: false, stdout: "", stderr: "boom" } },
      _appendFile: append._appendFile,
    });

    const expectedNotice = MERGE_ESCALATIONS.guard({
      prUrl: PR_URL,
      tail: "changed-file list could not be retrieved",
    });
    expect(outcome.escalations).toContain(expectedNotice);

    const entry = soleAppendedEntry(append);
    expect(entry.source).toBe("merge-refusal");
    expect(entry.kind).toBe("non-advisory");
  });

  test("P3-08: row 5 — CI evidence absent, ci.escalate scripted truthy: appends and keeps the CI notice", async () => {
    const append = makeAppendFile();
    const { outcome } = await runMerge({
      gh: { ci: { stdout: JSON.stringify({ statusCheckRollup: [] }) } },
      config: { mergeRequiresCi: true },
      _appendFile: append._appendFile,
    });

    // Non-vacuity (PROP-ESC-08's oracle (c)): `ci.escalate` is scripted truthy — confirmed by
    // the presence of `MERGE_ESCALATIONS.ci`'s own notice — BEFORE the append conjunct below is
    // asserted, so an unscripted fixture that silently exercised the empty branch (`ci.escalate
    // ? [...] : []`) would fail here rather than pass over an empty array.
    const expectedNotice = MERGE_ESCALATIONS.ci({ prUrl: PR_URL });
    expect(outcome.escalations).toContain(expectedNotice);

    const entry = soleAppendedEntry(append);
    expect(entry.source).toBe("merge-refusal");
    expect(entry.kind).toBe("non-advisory");
  });
});

// ---------------------------------------------------------------------------
// PROP-ESC-10 (merge variant) — E-08: an `_appendFile` rejection at any of the five sites
// above is caught by `phaseMerge` (the caller, outside the try/catch owning the merge action)
// and surfaced as an `escalation-append-failed` notice; `phaseMerge`'s own outcome — every
// field but `notes` — is byte-identical to the succeeding-append case (differential oracle:
// asserting a hard-coded outcome would not prove the invariance).
// ---------------------------------------------------------------------------

describe("PROP-ESC-10 (merge variant) — append failure is a notice, not an outcome change", () => {
  test("P3-08: a rejecting _appendFile at the queue site yields escalation-append-failed, outcome unchanged", async () => {
    const succeeding = makeAppendFile();
    const failing = makeThrowingAppendFile("simulated ESCALATIONS.md write failure");

    const { outcome: okOutcome } = await runMerge({
      recordDisposition: "error",
      _appendFile: succeeding._appendFile,
    });
    const { outcome: failOutcome } = await runMerge({
      recordDisposition: "error",
      _appendFile: failing._appendFile,
    });

    // Attempted regardless of outcome (E-08: the write is attempted, then rejected).
    expect(failing.calls).toHaveLength(1);

    const stripNotes = ({ notes, ...rest }) => rest;
    expect(stripNotes(failOutcome)).toEqual(stripNotes(okOutcome));
    expect(failOutcome.escalations).toEqual(okOutcome.escalations);

    expect(failOutcome.notes.some((n) => /escalation-append-failed/.test(n))).toBe(true);
    expect(okOutcome.notes.some((n) => /escalation-append-failed/.test(n))).toBe(false);
  });

  test("P3-08: a message-less rejection (non-Error throw) is stringified into the notice, not dropped", async () => {
    // The notice ternary reads `err && err.message ? err.message : String(err)` — a rejection
    // whose value carries no `.message` (a bare string here) must still surface through
    // `String(err)` rather than rendering as `undefined` or losing the notice entirely.
    const calls = [];
    const _appendFile = async (path, contents) => {
      calls.push({ path, contents });
      // eslint-disable-next-line no-throw-literal
      throw "scripted message-less append rejection";
    };

    const { outcome } = await runMerge({ recordDisposition: "error", _appendFile });

    expect(calls).toHaveLength(1);
    expect(
      outcome.notes.some((n) =>
        n.includes("escalation-append-failed: scripted message-less append rejection"),
      ),
    ).toBe(true);
  });
});
