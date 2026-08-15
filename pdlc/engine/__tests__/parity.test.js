// Parity oracle (T34, pdlc-headless-engine) — FSPEC §10.2, TSPEC §7.3,
// PROPERTIES PROP-PARITY-1…9 and PROP-SUITE-10…14, AT-ENG-45, AT-ENG-46,
// AT-ENG-51.
//
// RED at T34 (batch 4): `./_replay-double.mjs` (the write-replaying
// transport double, BR-PARITY-5) does not exist yet — it lands at T49
// (batch 8), which also depends on T47's completed `lib/run.mjs` v2. Every
// test below that imports it therefore fails the whole file at import time
// until T49. That is the intended shape, not an oversight: PROPERTIES marks
// every property this file owns "red, T34 → T49" (PROPERTIES-pdlc-headless-
// engine.md:392-396, :560).
//
// Three things this file is NOT, on purpose:
//
// 1. It is NOT a full five-configuration corpus run. `lib/run.mjs` v1's
//    `runDev` (HEAD) forwards no `_phaseDodEnabled`/`_phasePubEnabled` seam
//    — `devInjection` (run.mjs:80-91) names exactly seven seams, none of
//    them phase-disable switches — so there is no way, from this file, to
//    bound a run short of Phase I/DOD/PUB while still calling the real
//    `runDev`. Driving a real run all the way to Harvest (needed for PROP-
//    PARITY-1's full core set, including `LEARNINGS`) requires Phase I's
//    wave gate, which is exactly T48's "five-configuration corpus harness"
//    — a later, larger task this one does not duplicate.
// 2. It therefore does NOT assert PROP-PARITY-1's full core set against a
//    real converged run. It asserts the ORACLE LOGIC that clause applies —
//    the set-equality and closure rules of FSPEC §10.2 clauses 1-3 — as
//    pure, directly-testable functions, each proven both ways (a fixture
//    that satisfies the clause, and a falsifier that doesn't), per DEC-
//    ORACLE-01. The real, reachable phases (R and F, proven reachable
//    offline by the tracked `smoke.test.js`) are exercised for real below,
//    through the write-replaying double, to ground those same functions in
//    real creation events rather than only synthetic ones.
// 3. It is NOT a restatement of the oracle as a second module. There is no
//    `lib/parity.mjs` — FSPEC §10.2 says "the operator... satisfies the
//    structural oracle below", i.e. the oracle *is* the acceptance test.
//    The helpers below (`assertClause1`, `assertClause2`, `assertClause3`)
//    are that oracle, expressed once, here.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { createAdapter } from "../lib/adapter.mjs";
import { runDev } from "../lib/run.mjs";
// T49 (BR-PARITY-5). Does not exist at T34 — see file header note 0.
import { createReplayDouble } from "./_replay-double.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");

const FEATURE = "parity-widget";
const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `docs/${FEATURE}/FSPEC-${FEATURE}.md`;

const ROLE_SLUG = {
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
};

// FSPEC §10.2 clause 1(i)'s run-independent core, minus REQ (pre-exists).
const PHASE_CORE = ["FSPEC", "TSPEC", "PLAN", "PROPERTIES", "LEARNINGS"];

const REQ_TEXT = [
  `# REQ — ${FEATURE}`,
  "",
  "depends-on: -",
  "ready: true",
  "",
  `REQ ${FEATURE}`,
  "",
  "## 1. Problem / Context",
  "- Parity oracle fixture widget.",
  "",
  "## 2. Goals",
  "- G-1 Ship the widget.",
  "",
  "## 3. Non-Goals",
  "- NG-1 No gadget.",
  "",
  "## 4. Constraints",
  "- C-1 Fixture only.",
  "",
  "## 5. Criteria",
  "- AC-1.1 Ask for a widget.",
  "",
  "## 6. Risks",
  "- R-1 Might not widget.",
  "",
  "## 7. Obligations",
  "- O-1 Decide colour.",
  "",
].join("\n");

const FSPEC_TEXT = [
  `# FSPEC — ${FEATURE}`,
  "",
  "## 1. Overview",
  "- One widget surface.",
  "",
  "## 2. Linked Requirements",
  `- ${REQ_PATH} (AC-1.1).`,
  "",
  "## 3. Behavioral Flow",
  "- The widget appears.",
  "",
  "## 4. Business Rules",
  "- BR-1 One widget per ask.",
  "",
  "## 5. Edge Cases and Error Scenarios",
  "- E-1 No widget available.",
  "",
  "## 6. Acceptance Tests",
  "- AT-1 Ask, receive widget.",
  "",
  "## 7. Open Questions",
  "- OQ-1 Widget colour still open.",
  "",
].join("\n");

/** A cross-review file in the format `crossReviewComplete` + `extractFileVerdict` read. */
function crossReviewText(role, docType, round, doc, { approved = true } = {}) {
  return [
    `# Cross-Review — ${role} — ${docType} v${round}`,
    "",
    `Scope: ${doc}`,
    "",
    "## Findings",
    "No blocking findings.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${approved ? "Approved" : "Needs revision"}`,
    '{"high": 0, "medium": 0, "low": 0}',
    "",
  ].join("\n");
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, stdio: "pipe", encoding: "utf8" });
}

function writeInto(root, rel, text) {
  const abs = path.join(root, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, text, "utf8");
}

function makeConsumerRepo({ files = {} } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "pdlc-engine-parity-"));
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "parity@example.invalid"]);
  git(root, ["config", "user.name", "pdlc parity"]);
  git(root, ["config", "commit.gpgsign", "false"]);
  git(root, ["checkout", "-q", "-b", `feat-${FEATURE}`]);

  writeInto(root, REQ_PATH, REQ_TEXT);
  for (const [rel, text] of Object.entries(files)) writeInto(root, rel, text);

  writeInto(root, "README.md", "# parity consumer\n");
  git(root, ["add", "-A"]);
  git(root, ["commit", "-q", "-m", "parity fixture"]);
  return root;
}

function smokeAdapter(root, transport) {
  return createAdapter({
    transport,
    pluginRoot: PLUGIN_ROOT,
    cwd: root,
    log: () => {},
    runCommandFn: async () => ({ ok: true, output: "parity: no command run" }),
  });
}

// ── FSPEC §10.2's oracle, expressed once (AT-ENG-45, AT-ENG-46) ────────────
//
// Every function below takes a `createdFiles` array of feature-relative
// paths — CREATION EVENTS (BR-PARITY-4), never a live `readdirSync` of
// `docs/{f}/` at the moment the test happens to look, because Phase H
// deletes harvested `CROSS-REVIEW-*`/`CODE_REVIEW-*` files once their
// LEARNINGS commit is confirmed and a harvested file's later absence must
// not read as a failure (PROP-SUITE-14).

/**
 * Clause 1: filenames under `docs/{f}/` satisfy set-equality against the
 * phase-declared core PLUS the fixture's own run-dependent rules (i), and
 * nothing outside that union appears (ii, PROP-PARITY-3's closure).
 *
 * @param {string[]} createdFiles feature-relative creation events
 * @param {object} expected
 * @param {string[]} expected.core subset of PHASE_CORE this fixture's config enables (EC-PAR-4)
 * @param {string[]} [expected.extra] run-dependent filenames the fixture's own rules warrant (BR-PARITY-6)
 */
function assertClause1(createdFiles, feature, { core, extra = [] }) {
  const basenames = new Set(createdFiles.map((f) => path.basename(f)));
  for (const docType of core) {
    assert.ok(
      basenames.has(`${docType}-${feature}.md`),
      `clause 1(i): ${docType}-${feature}.md must be a creation event for an enabled phase`
    );
  }
  const expectedSet = new Set([...core.map((d) => `${d}-${feature}.md`), ...extra]);
  for (const name of basenames) {
    assert.ok(
      expectedSet.has(name),
      `clause 1: ${name} is a creation event outside both the core and the fixture's run-dependent rules — closure violated`
    );
  }
}

/** Clause 2: every `CROSS-REVIEW-*` creation event carries a parseable `VERDICT:` line and a counts object. */
function assertClause2(fileText, label) {
  assert.match(fileText, /^VERDICT: (Approved|Needs revision)$/m, `${label}: clause 2 requires a parseable VERDICT: line`);
  assert.match(fileText, /^\{"high":\s*\d+,\s*"medium":\s*\d+,\s*"low":\s*\d+\}$/m, `${label}: clause 2 requires a counts object`);
}

/** Clause 3: approval anchors present on a cross-review that reached terminal approval — module-written, never the double's. */
function assertClause3HasAnchors(fileText, label) {
  assert.match(fileText, /^APPROVAL-HASH: sha256:[0-9a-f]{64}$/m, `${label}: clause 3 requires APPROVAL-HASH:`);
  assert.match(fileText, /^REVIEWED-COMMIT: /m, `${label}: clause 3 requires REVIEWED-COMMIT:`);
}

/** The negative half of clause 3 (BR-PARITY-5, PROP-SUITE-13): the double's OWN write must never carry either anchor line. */
function assertNoAnchors(fileText, label) {
  assert.doesNotMatch(fileText, /^APPROVAL-HASH:/m, `${label}: the double must never write APPROVAL-HASH: itself`);
  assert.doesNotMatch(fileText, /^REVIEWED-COMMIT:/m, `${label}: the double must never write REVIEWED-COMMIT: itself`);
}

// ── Oracle logic, proven both ways (DEC-ORACLE-01) ──────────────────────────
// These are unit tests of `assertClause1/2/3` themselves — independent of any
// double — proving the oracle can both pass a satisfying fixture and FAIL a
// falsifying one (PROP-SUITE-10's own point: an oracle with no falsifying
// counterpart proves nothing).

test("clause 1(i)/closure (PROP-PARITY-1, PROP-PARITY-3): a complete, closed creation-event set passes", () => {
  const created = [
    `docs/${FEATURE}/FSPEC-${FEATURE}.md`,
    `docs/${FEATURE}/TSPEC-${FEATURE}.md`,
    `docs/${FEATURE}/PLAN-${FEATURE}.md`,
    `docs/${FEATURE}/PROPERTIES-${FEATURE}.md`,
    `docs/${FEATURE}/LEARNINGS-${FEATURE}.md`,
    `docs/${FEATURE}/CROSS-REVIEW-software-engineer-REQ-v1.md`,
  ];
  assert.doesNotThrow(() =>
    assertClause1(created, FEATURE, {
      core: PHASE_CORE,
      extra: [`CROSS-REVIEW-software-engineer-REQ-v1.md`],
    })
  );
});

test("clause 1(i) falsifier: a missing core member (no PROPERTIES creation event) fails", () => {
  const created = [
    `docs/${FEATURE}/FSPEC-${FEATURE}.md`,
    `docs/${FEATURE}/TSPEC-${FEATURE}.md`,
    `docs/${FEATURE}/PLAN-${FEATURE}.md`,
    `docs/${FEATURE}/LEARNINGS-${FEATURE}.md`,
  ];
  assert.throws(() => assertClause1(created, FEATURE, { core: PHASE_CORE, extra: [] }));
});

test("clause 1 closure falsifier (PROP-PARITY-3): a filename outside both rules fails even though the core is complete", () => {
  const created = [
    ...PHASE_CORE.map((d) => `docs/${FEATURE}/${d}-${FEATURE}.md`),
    `docs/${FEATURE}/SCRATCH-NOTES.md`, // not core, not named by any run-dependent rule
  ];
  assert.throws(() => assertClause1(created, FEATURE, { core: PHASE_CORE, extra: [] }));
});

test("EC-PAR-4: a phase disabled by config is absent from the expected core WITHOUT failing clause 1(i)", () => {
  // A fixture whose config disables Phase D (DOD) and Phase PUB never
  // produces LEARNINGS via this path at all in some configurations, but
  // PROPERTIES still counts as run-dependent-per-phase, not "always core";
  // here PLAN/TSPEC/FSPEC are enabled and LEARNINGS/PROPERTIES are not.
  const enabledCore = ["FSPEC", "TSPEC", "PLAN"];
  const created = enabledCore.map((d) => `docs/${FEATURE}/${d}-${FEATURE}.md`);
  assert.doesNotThrow(() => assertClause1(created, FEATURE, { core: enabledCore, extra: [] }));
});

test("clause 2 (PROP-PARITY-4): a cross-review with VERDICT and counts passes; one missing either fails", () => {
  const complete = crossReviewText("software-engineer", "REQ", 1, REQ_PATH);
  assert.doesNotThrow(() => assertClause2(complete, "complete fixture"));

  const noVerdict = complete.replace(/^VERDICT: Approved$/m, "");
  assert.throws(() => assertClause2(noVerdict, "no-verdict fixture"));

  const noCounts = complete.replace(/^\{"high".*$/m, "");
  assert.throws(() => assertClause2(noCounts, "no-counts fixture"));
});

test("clause 3 (PROP-PARITY-5): anchors present passes; absent on an approved review fails", () => {
  const withAnchors =
    crossReviewText("software-engineer", "REQ", 1, REQ_PATH) +
    `\nAPPROVAL-HASH: sha256:${"a".repeat(64)}\nREVIEWED-COMMIT: deadbeef\n`;
  assert.doesNotThrow(() => assertClause3HasAnchors(withAnchors, "anchored fixture"));

  const withoutAnchors = crossReviewText("software-engineer", "REQ", 1, REQ_PATH);
  assert.throws(() => assertClause3HasAnchors(withoutAnchors, "unanchored fixture"));
});

// ── PROP-SUITE-10 / AT-ENG-45's first obligation ────────────────────────────
//
// This test needs neither `_replay-double.mjs` nor any fixture beyond a REQ:
// it drives the REAL `orchestrate-dev.js` (via the tracked `runDev`) with a
// transport whose `dispatch` returns a response STRING and performs no
// filesystem write at all — the exact vacuity BR-PARITY-5 names. If the
// oracle (`assertClause1`, applied to this run's real creation events) were
// naive, "the transport was called" would look like enough; it must not be.

test("PROP-SUITE-10 (negative half, real run): a write-less double fails clause 1(i) — it never gets the chance to pass vacuously", async (t) => {
  const root = makeConsumerRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const dispatchCalls = [];
  const writeLessTransport = {
    dispatch: async (prompt, opts = {}) => {
      dispatchCalls.push({ prompt, opts });
      // No fs write of any kind. A live agent's tool calls are what would
      // have created FSPEC/TSPEC/etc — this double performs none of them.
      return { text: "ok, but nothing written\nDECISIONS_WARRANTED: false\n", sessionId: "write-less" };
    },
  };

  const { report } = await runDev({
    reqPath: REQ_PATH,
    cwd: root,
    adapter: smokeAdapter(root, writeLessTransport),
    startup: { ok: true, reason: null },
  });

  assert.ok(dispatchCalls.length > 0, "sanity: the write-less double really was dispatched at least once");

  const createdFiles = [];
  // No creation-event log exists for this double (it performs no writes at
  // all), so the oracle observes the empty set — the honest statement of
  // what a write-less double produces, structurally, not by omission.
  assert.throws(
    () => assertClause1(createdFiles, FEATURE, { core: PHASE_CORE, extra: [] }),
    /clause 1\(i\)/,
    "a write-less double must fail clause 1(i) — the oracle must not pass on nothing (AT-ENG-45, BR-PARITY-5)"
  );
  // Independently, the ACTUAL docs/{feature}/ tree the run left behind never
  // grew past the REQ that was already there before the run started — the
  // same conclusion reached from the filesystem, not only from the log.
  const docsDir = path.join(root, "docs", FEATURE);
  const survivingCore = existsSync(docsDir)
    ? readdirSync(docsDir).filter((f) => PHASE_CORE.some((d) => f.startsWith(`${d}-`)))
    : [];
  assert.deepEqual(survivingCore, [], "a write-less double must leave no core artifact on disk either");
  void report; // outcome is immaterial to this clause; only the artifact set is asserted
});

// ── The write-replaying double's own contract (T49, BR-PARITY-5) ───────────
//
// `createReplayDouble({ cwd, feature, rules })` → `{ transport, createdFiles }`.
// This is the contract T49 must build, pinned here as the first caller
// (TDD): `dispatch(prompt, opts)` parses the skill from the
// `--- BEGIN ROLE DEFINITION: {skill} ---` marker composition already emits
// (proven live by `smoke.test.js`), matches it against `rules`, and:
//
//   - for a review rule (`{ skill, isReview: true, roleSlug }`): parses
//     `doc`/`phase`/`feature` from the SAME "Review the document at ... This
//     is iteration N." text `smoke.test.js` already parses — but NEVER
//     trusts the "iteration N" it captures (PROP-PARITY-8). It derives the
//     round itself by testing, from round 1 upward, whether
//     `docs/{feature}/CROSS-REVIEW-{roleSlug}-{docType}-v{round}.md` already
//     exists under `cwd` — the first missing round is the one it writes.
//     This is `deriveRoundWindow`'s own directory-listing method
//     (`orchestrate-dev.js:6366`), independently re-derived rather than
//     parsed from the prompt, so a caller cannot fool the double by
//     dispatching the same "iteration" twice.
//   - for a non-review rule (`{ skill, write(cwd) => [{path, content}],
//     responseText() => string }`): performs exactly those writes, once.
//   - every write — review or not — is appended to `createdFiles` as
//     `{ path, round, skill, contentAtWrite, ts }`, an APPEND-ONLY log
//     (PROP-SUITE-14): a later `rmSync` of the file must never remove or
//     mutate the entry, and `contentAtWrite` is the double's own bytes at
//     the moment it wrote them — never re-read from disk later, so a
//     downstream module append (the approval anchors) can never leak into
//     it (BR-PARITY-5, PROP-SUITE-13).
//   - never writes `APPROVAL-HASH:` / `REVIEWED-COMMIT:` under any rule.

function buildReviewPrompt(skill, doc, phase, feature, iteration = 1) {
  return [
    `--- BEGIN ROLE DEFINITION: ${skill} ---`,
    "",
    `Review the document at ${doc} for phase ${phase} of feature ${feature}. This is iteration ${iteration}.`,
    "",
    `--- END ROLE DEFINITION: ${skill} ---`,
  ].join("\n");
}

const REVIEW_RULES = [
  { skill: "se-review", isReview: true, roleSlug: "software-engineer" },
  { skill: "te-review", isReview: true, roleSlug: "test-engineer" },
];

test("PROP-PARITY-8 / PROP-SUITE-11/12: round is derived from the directory listing — two dispatches for one document produce two files, not one rewritten", async (t) => {
  const root = makeConsumerRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const double = createReplayDouble({ cwd: root, feature: FEATURE, rules: REVIEW_RULES });
  const prompt = buildReviewPrompt("se-review", REQ_PATH, "R", FEATURE, /* stale on purpose */ 1);

  await double.transport.dispatch(prompt, {});
  await double.transport.dispatch(prompt, {}); // same skill, same doc, same claimed iteration

  const v1 = path.join(root, `docs/${FEATURE}/CROSS-REVIEW-software-engineer-REQ-v1.md`);
  const v2 = path.join(root, `docs/${FEATURE}/CROSS-REVIEW-software-engineer-REQ-v2.md`);
  assert.ok(existsSync(v1), "round 1 file must exist");
  assert.ok(existsSync(v2), "round 2 file must exist — the second dispatch must NOT overwrite v1");
  assert.equal(readFileSync(v1, "utf8").includes("v1"), true);
  assert.equal(readFileSync(v2, "utf8").includes("v2"), true);
});

test("PROP-PARITY-8 (never keyed by skill alone): two different documents reviewed by the same skill each start at round 1", async (t) => {
  const root = makeConsumerRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const double = createReplayDouble({ cwd: root, feature: FEATURE, rules: REVIEW_RULES });
  await double.transport.dispatch(buildReviewPrompt("se-review", REQ_PATH, "R", FEATURE), {});
  await double.transport.dispatch(buildReviewPrompt("se-review", FSPEC_PATH, "F", FEATURE), {});

  assert.ok(existsSync(path.join(root, `docs/${FEATURE}/CROSS-REVIEW-software-engineer-REQ-v1.md`)));
  assert.ok(
    existsSync(path.join(root, `docs/${FEATURE}/CROSS-REVIEW-software-engineer-FSPEC-v1.md`)),
    "a second, different document reviewed by the SAME skill must start at round 1, not be treated as round 2 of the first"
  );
});

test("PROP-SUITE-13 / PROP-PARITY-5 (negative half): the double never writes approval anchors, even though its own VERDICT says Approved", async (t) => {
  const root = makeConsumerRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const double = createReplayDouble({ cwd: root, feature: FEATURE, rules: REVIEW_RULES });
  await double.transport.dispatch(buildReviewPrompt("se-review", REQ_PATH, "R", FEATURE), {});

  const written = readFileSync(path.join(root, `docs/${FEATURE}/CROSS-REVIEW-software-engineer-REQ-v1.md`), "utf8");
  assert.match(written, /^VERDICT: Approved$/m, "sanity: the fixture verdict really is Approved");
  assertNoAnchors(written, "double's own write");
});

test("PROP-SUITE-14: creation events survive a later deletion — the oracle reads the log, not the live directory (Phase H's harvest)", async (t) => {
  const root = makeConsumerRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const double = createReplayDouble({ cwd: root, feature: FEATURE, rules: REVIEW_RULES });
  await double.transport.dispatch(buildReviewPrompt("se-review", REQ_PATH, "R", FEATURE), {});

  const relPath = `docs/${FEATURE}/CROSS-REVIEW-software-engineer-REQ-v1.md`;
  assert.ok(double.createdFiles.some((e) => e.path === relPath), "the log must record the creation event");

  rmSync(path.join(root, relPath)); // simulates Phase H harvesting it away
  assert.equal(existsSync(path.join(root, relPath)), false, "sanity: the file really is gone now");
  assert.ok(
    double.createdFiles.some((e) => e.path === relPath),
    "the creation-event log must still show it after deletion — BR-PARITY-4"
  );
  assert.doesNotThrow(() =>
    assertClause1(
      double.createdFiles.map((e) => e.path),
      FEATURE,
      // `extra` names run-dependent FILENAMES (clause 1's set is over
      // basenames under `docs/{f}/`), so the creation event's basename is what
      // the fixture's own rule warrants here.
      { core: [], extra: [path.basename(relPath)] }
    )
  );
});

// ── A real run, through the real workflow module, using the real double ────
//
// Extends the exact scenario `smoke.test.js` already proves reachable
// offline (Phases R and F converge; Phase T halts on the module's own
// `se-author`-writes-nothing precondition, no monkey-patching) — but drives
// it through `createReplayDouble` instead of an ad hoc inline transport, so
// clauses 2 and 3 are checked against bytes a GENERIC double produced, not a
// scenario-specific one. Clause 1's full core set is out of reach here by
// construction (Phase T never converges — see the file header's scope
// note); only its closure half applies, and only up to the phases this
// scenario actually reaches.

const REAL_RUN_RULES = [
  ...REVIEW_RULES,
  {
    skill: "pm-author",
    write: () => [{ path: FSPEC_PATH, content: FSPEC_TEXT }],
    responseText: () => `Wrote ${FSPEC_PATH}.\nREVISION-COMPLETE: yes\n`,
  },
  {
    skill: "se-author",
    write: () => [],
    responseText: () => "Could not author the TSPEC.\nDECISIONS_WARRANTED: false\n",
  },
];

test("real run through orchestrate-dev.js: clauses 2 and 3 hold over the double's real creation events, and its own writes never carry anchors", async (t) => {
  const root = makeConsumerRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const double = createReplayDouble({ cwd: root, feature: FEATURE, rules: REAL_RUN_RULES });

  const { report } = await runDev({
    reqPath: REQ_PATH,
    cwd: root,
    adapter: smokeAdapter(root, double.transport),
    startup: { ok: true, reason: null },
  });

  assert.equal(report.outcome, "halted");
  assert.match(report.haltReason, /phase T/i);

  const docsDir = path.join(root, "docs", FEATURE);
  const reviewFiles = readdirSync(docsDir).filter((f) => f.startsWith("CROSS-REVIEW-"));
  assert.ok(reviewFiles.length > 0, "sanity: at least one cross-review must have been created by the real run");

  // Clause 2, on the FINAL bytes on disk.
  for (const f of reviewFiles) {
    assertClause2(readFileSync(path.join(docsDir, f), "utf8"), f);
  }

  // Clause 3's positive half, on the FINAL bytes — the module's own append.
  for (const f of reviewFiles) {
    assertClause3HasAnchors(readFileSync(path.join(docsDir, f), "utf8"), f);
  }

  // Clause 3's negative half (BR-PARITY-5, PROP-SUITE-13): the double's OWN
  // recorded bytes, captured at write time, before the module ever appended
  // anything, must never carry the anchors either.
  const reviewEvents = double.createdFiles.filter((e) => e.path.includes("CROSS-REVIEW-"));
  assert.ok(reviewEvents.length > 0);
  for (const event of reviewEvents) {
    assertNoAnchors(event.contentAtWrite, event.path);
  }

  // FSPEC converged (Phase F); TSPEC/PLAN/PROPERTIES/LEARNINGS are
  // legitimately absent — Phase T halts before authoring TSPEC at all.
  assert.ok(existsSync(path.join(root, FSPEC_PATH)), "FSPEC must exist — Phase F converged before the halt");
  assert.equal(existsSync(path.join(root, `docs/${FEATURE}/TSPEC-${FEATURE}.md`)), false);
});
