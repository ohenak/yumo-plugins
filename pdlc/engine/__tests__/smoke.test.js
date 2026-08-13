// OFFLINE end-to-end smoke for the engine ↔ workflow-module wiring
// (Phase 3, pdlc-headless-engine).
//
// This test runs the REAL `pdlc/workflows/orchestrate-dev.js` — no stub module,
// no monkey-patching of the pipeline — inside a REAL throwaway git repo, with
// the REAL adapter and the REAL plugin `SKILL.md` bytes. The only double is the
// transport: `dispatch()` never contacts a model. It reads the composed prompt,
// writes the artifact a live agent would have written, and returns the trailer
// a live agent would have returned.
//
// What it proves:
//   • the adapter's six seams satisfy the modules' runtime expectations;
//   • the composed prompt (SKILL.md inlined) is what reaches a dispatch;
//   • the modules' own untouched Node defaults (_readFile/_writeFile/_listFiles/
//     _checkFile/_hashFile/_git) do the filesystem and git work, consumer-relative;
//   • Phase R and Phase F converge, writing real cross-review files with
//     parseable verdicts and approval anchors;
//   • the run report comes back in the modules' documented shape.
//
// The run then halts at Phase T through the modules' OWN mechanism — the
// scripted `se-author` writes no TSPEC, so `reviewLoop`'s entry precondition
// refuses the phase. Nothing here forces or fakes the halt.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { createAdapter } from "../lib/adapter.mjs";
import { runDev, runQueue } from "../lib/run.mjs";
import * as corpus from "./_corpus.mjs";

const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(engineRoot));
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");

const FEATURE = "smoke-widget";
const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `docs/${FEATURE}/FSPEC-${FEATURE}.md`;

// ─── fixtures ────────────────────────────────────────────────────────────────

const REQ_TEXT = [
  "---",
  `feature: ${FEATURE}`,
  "ready: true",
  "depends-on: []",
  "---",
  `# REQ — ${FEATURE}`,
  "",
  "## 1. Problem / Context",
  "A widget that does not exist yet.",
  "",
  "## 2. Goals",
  "- G-1 Ship the widget.",
  "",
  "## 3. Non-Goals",
  "- NG-1 No gadget.",
  "",
  "## 4. Constraints",
  "- C-1 Offline only.",
  "",
  "## 5. Acceptance Criteria",
  "- AC-1.1 The widget widgets.",
  "",
  "## 6. Risks",
  "- R-1 The widget might not widget.",
  "",
  "## 7. Obligations",
  "- O-1 Decide the widget colour.",
  "",
].join("\n");

const FSPEC_TEXT = [
  `# FSPEC — ${FEATURE}`,
  "",
  "## 1. Overview",
  "The widget's functional surface.",
  "",
  "## 2. Linked Requirements",
  `Derives from ${REQ_PATH} (AC-1.1).`,
  "",
  "## 3. Behavioral Flow",
  "Operator asks for a widget; a widget appears.",
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
function crossReviewText(role, docType, round, doc) {
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
    "VERDICT: Approved",
    '{"high": 0, "medium": 0, "low": 0}',
    "",
  ].join("\n");
}

const ROLE_SLUG = {
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
};

// ─── the throwaway consumer repo ─────────────────────────────────────────────

function git(cwd, args) {
  return execFileSync("git", args, { cwd, stdio: "pipe", encoding: "utf8" });
}

function makeConsumerRepo({ withReq = true, files = {} } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "pdlc-engine-smoke-"));
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "smoke@example.invalid"]);
  git(root, ["config", "user.name", "pdlc smoke"]);
  git(root, ["config", "commit.gpgsign", "false"]);
  git(root, ["checkout", "-q", "-b", `feat-${FEATURE}`]);

  const write = (rel, text) => {
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, text, "utf8");
  };

  if (withReq) write(REQ_PATH, REQ_TEXT);
  for (const [rel, text] of Object.entries(files)) write(rel, text);

  write("README.md", "# smoke consumer\n");
  git(root, ["add", "-A"]);
  git(root, ["commit", "-q", "-m", "smoke fixture"]);
  return root;
}

// ─── the scripted transport (the ONLY double) ────────────────────────────────

/**
 * Returns `{ transport, calls }`. `dispatch` parses the composed prompt the
 * adapter built — role name from the BEGIN ROLE DEFINITION marker, target from
 * the modules' own prompt text — and performs the write a live agent would.
 */
function scriptedTransport(root, { authorTspec = false } = {}) {
  const calls = [];

  const write = (rel, text) => {
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, text, "utf8");
  };

  async function dispatch(prompt, opts = {}) {
    const roleMatch = /--- BEGIN ROLE DEFINITION: ([a-z-]+) ---/.exec(prompt);
    const role = roleMatch ? roleMatch[1] : "unknown";
    const review = /Review the document at (\S+) for phase (\S+) of feature (\S+)\. This is iteration (\d+)\./.exec(
      prompt
    );
    calls.push({ role, model: opts.model, cwd: opts.cwd, review: review ? review[2] : null, prompt });

    if (review && ROLE_SLUG[role]) {
      const [, doc, , feature, iteration] = review;
      const docType = /REQ-/.test(doc) ? "REQ" : /FSPEC-/.test(doc) ? "FSPEC" : "TSPEC";
      const file = `docs/${feature}/CROSS-REVIEW-${ROLE_SLUG[role]}-${docType}-v${iteration}.md`;
      write(file, crossReviewText(ROLE_SLUG[role], docType, iteration, doc));
      return {
        text: `Reviewed ${doc}.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`,
        sessionId: "smoke",
      };
    }

    if (role === "pm-author") {
      // Phase F's creator (and, were it ever reached, its optimizer).
      write(FSPEC_PATH, FSPEC_TEXT);
      return { text: `Wrote ${FSPEC_PATH}.\nREVISION-COMPLETE: yes\n`, sessionId: "smoke" };
    }

    if (role === "se-author") {
      // Deliberately writes NOTHING. Phase T then halts on the modules' own
      // reviewLoop entry precondition — no monkey-patching required.
      if (authorTspec) {
        write(`docs/${FEATURE}/TSPEC-${FEATURE}.md`, "# TSPEC\n\n## Overview\nx\n");
      }
      return { text: "Could not author the TSPEC.\nDECISIONS_WARRANTED: false\n", sessionId: "smoke" };
    }

    return { text: "ok", sessionId: "smoke" };
  }

  return { transport: { dispatch }, calls };
}

function smokeAdapter(root, transport) {
  return createAdapter({
    transport,
    pluginRoot: PLUGIN_ROOT,
    cwd: root,
    log: () => {},
    // Never spawn a shell in a test. Phase I is not reached anyway; this makes
    // that guarantee structural rather than incidental.
    runCommandFn: async () => ({ ok: true, output: "smoke: no command run" }),
  });
}

// ─── the smoke ───────────────────────────────────────────────────────────────

test("offline end-to-end: phases R and F converge against the real workflow module", async (t) => {
  const root = makeConsumerRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const { transport, calls } = scriptedTransport(root);
  const { report } = await runDev({
    reqPath: REQ_PATH,
    cwd: root,
    adapter: smokeAdapter(root, transport),
    startup: { ok: true, reason: null },
  });

  // ── the run report comes back in the modules' documented shape ──
  assert.equal(report.feature, FEATURE);
  assert.ok(["success", "halted"].includes(report.outcome));
  assert.ok(Array.isArray(report.phases));
  assert.ok(Array.isArray(report.artifactPaths));
  assert.equal(typeof report.testSummary, "string");
  assert.equal(typeof report.harvestStatus, "string");

  const byPhase = Object.fromEntries(report.phases.map((p) => [p.phase, p]));

  // ── Phase R converged on round 1 ──
  assert.equal(byPhase.R.status, "✅", JSON.stringify(report.phases));
  assert.equal(byPhase.R.iterations, 1);

  // ── Phase F converged, and the FSPEC the double wrote is on disk ──
  assert.equal(byPhase.F.status, "✅");
  assert.ok(existsSync(path.join(root, FSPEC_PATH)), "the module's own seams wrote the FSPEC");
  assert.match(readFileSync(path.join(root, FSPEC_PATH), "utf8"), /Linked Requirements/);

  // ── the cross-review files exist, with parseable verdicts AND the approval
  //    anchors the module appends after a round reaches terminal ──
  const docsDir = path.join(root, "docs", FEATURE);
  const reviews = readdirSync(docsDir).filter((f) => f.startsWith("CROSS-REVIEW-"));
  assert.deepEqual(reviews.sort(), [
    `CROSS-REVIEW-software-engineer-FSPEC-v1.md`,
    `CROSS-REVIEW-software-engineer-REQ-v1.md`,
    `CROSS-REVIEW-test-engineer-FSPEC-v1.md`,
    `CROSS-REVIEW-test-engineer-REQ-v1.md`,
  ]);
  for (const f of reviews) {
    const text = readFileSync(path.join(docsDir, f), "utf8");
    assert.match(text, /^VERDICT: Approved$/m, `${f} must carry a parseable verdict`);
    assert.match(text, /^APPROVAL-HASH: sha256:[0-9a-f]{64}$/m, `${f} must carry the approval hash`);
    assert.match(text, /^REVIEWED-COMMIT: /m, `${f} must carry the reviewed commit`);
  }

  // ── the halt is the modules' own, at Phase T, because se-author wrote nothing ──
  assert.equal(report.outcome, "halted");
  assert.match(report.haltReason, /TSPEC-smoke-widget\.md/);
  assert.match(report.haltReason, /phase T/);

  // ── every dispatch went through the adapter with the consumer root as cwd,
  //    and carried the model the module pinned — never an engine default ──
  assert.ok(calls.length >= 5, `expected several dispatches, got ${calls.length}`);
  for (const c of calls) {
    assert.equal(c.cwd, root, "AC-2.5: every dispatch's cwd is the consumer repo root");
    assert.equal(c.model, "opus", "MODEL-01: spec phases are pinned to Opus by the module");
  }

  // ── AC-3.1: the composed prompt carries the plugin's SKILL.md verbatim and
  //    names no Skill tool / `pdlc:` namespace ──
  const pmAuthor = calls.find((c) => c.role === "pm-author");
  const skillText = readFileSync(path.join(PLUGIN_ROOT, "skills", "pm-author", "SKILL.md"), "utf8");
  assert.ok(pmAuthor.prompt.includes(skillText), "pm-author SKILL.md must be inlined verbatim");
  assert.equal(/\bpdlc:pm-author\b/.test(pmAuthor.prompt.split("--- END ROLE DEFINITION")[0].replace(skillText, "")), false);
});

test("the halted run leaves the consumer repo's git history intact and on the feature branch", async (t) => {
  const root = makeConsumerRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const { transport } = scriptedTransport(root);
  await runDev({
    reqPath: REQ_PATH,
    cwd: root,
    adapter: smokeAdapter(root, transport),
    startup: { ok: true, reason: null },
  });

  assert.equal(git(root, ["rev-parse", "--abbrev-ref", "HEAD"]).trim(), `feat-${FEATURE}`);
});

test("a bad REQ path is refused by the module, not by the engine", async (t) => {
  const root = makeConsumerRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const { transport, calls } = scriptedTransport(root);
  const { report } = await runDev({
    reqPath: "docs/whatever.md",
    cwd: root,
    adapter: smokeAdapter(root, transport),
    startup: { ok: true, reason: null },
  });

  assert.equal(report.outcome, "halted");
  assert.match(report.haltReason, /does not match expected pattern/);
  assert.equal(calls.length, 0, "a rejected REQ path costs no dispatch");
});

// ─── the queue entry, same offline arrangement ───────────────────────────────

test("pdlc queue is blocked by the drift gate in a repo with no .claude/workflows", async (t) => {
  // A consumer repo of the kind this feature exists to enable — no
  // `.claude/workflows/` at all — has no drift-state record, so
  // orchestrate-queue's gate maps to row 1 and blocks BEFORE reading QUEUE.md.
  // Documented here because it is a real contract mismatch, not a test artifact.
  const root = makeConsumerRepo({
    files: {
      "docs/_queue/QUEUE.md": [
        "| Order | Status | Feature | REQ Path | Depends-On |",
        "|---|---|---|---|---|",
        `| 1 | pending | ${FEATURE} | ${REQ_PATH} | - |`,
        "",
      ].join("\n"),
    },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const { transport, calls } = scriptedTransport(root);
  const { report } = await runQueue({
    cwd: root,
    adapter: smokeAdapter(root, transport),
    startup: { ok: true, reason: null },
  });

  assert.equal(report.outcome, "blocked");
  assert.match(report.reason, /Drift gate row 1/);
  assert.equal(calls.length, 0, "a blocked gate costs no dispatch");
});

test("pdlc queue runs its own Phase-0 triage once the drift gate is opted out", async (t) => {
  // The opt-out the gate honours here lives in `.claude/pdlc.config.json`'s
  // `distribution.checkEnabled: false` (CLAUDE.md's documented consumer opt-out) — the
  // config-side gate added to reach exactly this arrangement: an engine-only consumer with
  // no `.claude/workflows/` tree at all, and therefore no drift-state record ever written,
  // could not previously reach ANY opt-out (the record-based one requires the record to
  // exist). The config read is checked before the drift-state record is even attempted.
  const root = makeConsumerRepo({
    files: {
      ".claude/pdlc.config.json": JSON.stringify({
        distribution: { checkEnabled: false },
      }),
      "docs/_queue/QUEUE.md": [
        "| Order | Status | Feature | REQ Path | Depends-On |",
        "|---|---|---|---|---|",
        "",
      ].join("\n"),
    },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const { transport } = scriptedTransport(root);
  const { report } = await runQueue({
    cwd: root,
    adapter: smokeAdapter(root, transport),
    startup: { ok: true, reason: null },
  });

  // No rows at all → the module's own idle exit, which is what `--loop` stops on.
  assert.ok(["idle", "no-queue"].includes(report.outcome), JSON.stringify(report));
});

// ─── the T48 corpus: five configurations, seven M-ENG-07 model-map rows ──────
//
// Every run below dispatches through the REAL adapter and the REAL
// `orchestrate-dev.js` / `orchestrate-queue.js` modules — only the transport is
// doubled (`_corpus.mjs`'s scripted responses), exactly as the smoke tests
// above double it. Each run reads back the settlement lines
// `PDLC_TEST_RUN_DIR` collects (mirroring `adapter-descriptor.test.js`'s own
// pattern) and asserts the skill/model/phase/corpusRun combination that
// witnesses its row — never the pipeline's prose, never a re-derivation of the
// modules' own model constants.

function queueMd(feature, reqPath) {
  return [
    "| Order | Status | Feature | REQ Path | Depends-On |",
    "|---|---|---|---|---|",
    `| 1 | pending | ${feature} | ${reqPath} | - |`,
    "",
  ].join("\n");
}

test("corpus run i: opus for every non-Phase-I dispatch, sonnet for the Phase-I wave dispatch (M-ENG-07 rows 1, 2)", async (t) => {
  const feature = "corpus-run-i";
  const reqPath = `docs/${feature}/REQ-${feature}.md`;
  const root = corpus.makeRepo(feature, {
    files: {
      [reqPath]: corpus.reqText(feature),
      ".claude/pdlc.config.json": JSON.stringify({
        implementation: { testCommand: "true" },
        dispatch: { timeoutMinutes: 7 },
      }),
    },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  // rebaseStatus: "conflict" reaches a clean halt at Phase DOD step 0, through
  // the module's own mechanism, before Phase PUB's real `gh pr view` polling —
  // which this offline harness has no double for.
  const { transport } = corpus.makeFullPipelineTransport(root, feature, { rebaseStatus: "conflict" });

  await corpus.withRunDir(async (runDir) => {
    const { report } = await runDev({
      reqPath,
      cwd: root,
      adapter: corpus.corpusAdapter(root, transport, "run-i"),
      startup: { ok: true, reason: null },
    });

    assert.equal(report.outcome, "halted");
    assert.match(report.haltReason, /rebase conflict/i);

    const records = corpus.readSettlementLines(runDir);
    assert.ok(records.length > 0, "expected at least one settlement line");
    for (const r of records) assert.equal(r.corpusRun, "run-i", JSON.stringify(r));

    // Rows 1 and 2 partition on the Phase-I WAVE SET, not on the normalised phase
    // string (TSPEC §7.4): Phase I's V-wave is announced as
    // `phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")`
    // (`orchestrate-dev.js:10248`) and so normalises to "Phase PT", while it is
    // pinned on MODEL_IMPLEMENTATION (`:10253`). Splitting on `phase !== "Phase I"`
    // would be red on correct code.
    const inWaveSet = (r) =>
      r.phase === "Phase I" || (r.phase === "Phase PT" && r.skill === "se-implement");

    // Row 2: every wave-set dispatch is pinned to Sonnet, and BOTH members are
    // present — which is also how the fixture asserts (rather than assumes) that
    // run i drove wave mode: had it drifted to the legacy worktree path, the
    // Phase-PT dispatch there carries no `model` option and would be Opus.
    const waveRecords = records.filter(inWaveSet);
    assert.ok(
      waveRecords.some((r) => r.phase === "Phase I"),
      "expected a Phase-I wave dispatch (row 2's witness)"
    );
    assert.ok(
      waveRecords.some((r) => r.phase === "Phase PT" && r.skill === "se-implement"),
      "expected the V-wave dispatch — its absence means run i drifted out of wave mode"
    );
    for (const r of waveRecords) assert.equal(r.model, "sonnet", JSON.stringify(r));

    // Row 1: every dispatch OUTSIDE the wave set is pinned to Opus.
    const nonWaveRecords = records.filter((r) => !inWaveSet(r));
    assert.ok(nonWaveRecords.length > 0, "expected dispatches outside the wave set (row 1's witness)");
    for (const r of nonWaveRecords) assert.equal(r.model, "opus", JSON.stringify(r));

    // Rows 1/2 are scoped to run i only because both `haiku` routes are closed here
    // by fixture content: the PLAN task table parses in-script, and every reviewer
    // fixture emits a well-formed VERDICT trailer. Assert that, rather than trust it.
    assert.equal(
      records.filter((r) => r.model === "haiku").length,
      0,
      "run i's fixtures must close both haiku routes (TSPEC §7.4)"
    );
  });
});

test("corpus run ii: queue Phase-0 triage dispatches on Sonnet (M-ENG-07 row 5)", async (t) => {
  const feature = "corpus-run-ii";
  const reqPath = `docs/${feature}/REQ-${feature}.md`;
  const root = corpus.makeRepo(feature, {
    files: {
      [reqPath]: corpus.reqText(feature),
      "docs/_queue/QUEUE.md": queueMd(feature, reqPath),
      // The queue's drift gate runs BEFORE `QUEUE.md` is even read, and an
      // engine-only consumer has no `.claude/workflows/` tree and therefore no
      // drift-state record to satisfy it. `distribution.checkEnabled: false` is
      // CLAUDE.md's documented consumer opt-out — the same one the plain queue
      // smoke test above uses.
      ".claude/pdlc.config.json": JSON.stringify({ distribution: { checkEnabled: false } }),
    },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  // A "blocked" triage verdict costs exactly one dispatch and never delegates
  // the full pipeline — the cheapest arrangement that still witnesses row 5.
  const { transport, calls } = corpus.makeQueueTriageTransport("TRIAGE: blocked corpus row-5 witness\n");

  await corpus.withRunDir(async (runDir) => {
    const { report } = await runQueue({
      cwd: root,
      adapter: corpus.corpusAdapter(root, transport, "run-ii"),
      startup: { ok: true, reason: null },
    });

    assert.ok(["idle", "no-queue"].includes(report.outcome), JSON.stringify(report));
    assert.equal(calls.length, 1, "a blocked triage verdict costs exactly one dispatch");

    const records = corpus.readSettlementLines(runDir);
    assert.equal(records.length, 1);
    assert.equal(records[0].skill, "se-author");
    assert.equal(records[0].model, "sonnet");
    assert.equal(records[0].corpusRun, "run-ii");
  });
});

test("corpus run iii: the A1 advisory seam dispatches on fable when it resolves (M-ENG-07 row 3)", async (t) => {
  const feature = "corpus-run-iii";
  const reqPath = `docs/${feature}/REQ-${feature}.md`;
  const root = corpus.makeRepo(feature, {
    files: {
      [reqPath]: corpus.reqText(feature),
      "docs/_queue/QUEUE.md": queueMd(feature, reqPath),
      // `distribution.checkEnabled: false` clears the queue's drift gate (see run
      // ii); `advisory.enabled: true` is what puts the A1 seam in play at all.
      ".claude/pdlc.config.json": JSON.stringify({
        distribution: { checkEnabled: false },
        advisory: { enabled: true },
      }),
    },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const { transport } = corpus.makeAdvisoryTransport({ fableOutcome: "ok" });

  await corpus.withRunDir(async (runDir) => {
    await runQueue({
      cwd: root,
      adapter: corpus.corpusAdapter(root, transport, "run-iii"),
      startup: { ok: true, reason: null },
    });

    const records = corpus.readSettlementLines(runDir);
    const advisoryRecords = records.filter((r) => r.skill === "se-review");
    assert.equal(advisoryRecords.length, 1, "fable resolving costs exactly one advisory dispatch");
    assert.equal(advisoryRecords[0].model, "fable");
    assert.equal(advisoryRecords[0].outcome, "ok");
    for (const r of records) assert.equal(r.corpusRun, "run-iii", JSON.stringify(r));
  });
});

test("corpus run iv: the A1 advisory seam falls back from fable to opus on a real TransportError (M-ENG-07 row 4)", async (t) => {
  const feature = "corpus-run-iv";
  const reqPath = `docs/${feature}/REQ-${feature}.md`;
  const root = corpus.makeRepo(feature, {
    files: {
      [reqPath]: corpus.reqText(feature),
      "docs/_queue/QUEUE.md": queueMd(feature, reqPath),
      // `distribution.checkEnabled: false` clears the queue's drift gate (see run
      // ii); `advisory.enabled: true` is what puts the A1 seam in play at all.
      ".claude/pdlc.config.json": JSON.stringify({
        distribution: { checkEnabled: false },
        advisory: { enabled: true },
      }),
    },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const { transport } = corpus.makeAdvisoryTransport({ fableOutcome: "throw" });

  await corpus.withRunDir(async (runDir) => {
    await runQueue({
      cwd: root,
      adapter: corpus.corpusAdapter(root, transport, "run-iv"),
      startup: { ok: true, reason: null },
    });

    const records = corpus.readSettlementLines(runDir);
    const advisoryRecords = records.filter((r) => r.skill === "se-review");
    assert.equal(advisoryRecords.length, 2, "the fallback ladder costs exactly two advisory dispatches");

    const [fableRecord, opusRecord] = advisoryRecords;
    assert.equal(fableRecord.model, "fable");
    assert.equal(fableRecord.outcome, "transport-contract-violation", JSON.stringify(fableRecord));

    assert.equal(opusRecord.model, "opus");
    assert.equal(opusRecord.outcome, "ok", JSON.stringify(opusRecord));

    for (const r of records) assert.equal(r.corpusRun, "run-iv", JSON.stringify(r));
  });
});

test("corpus run v(a): a genuinely malformed verdict trailer recovers on Haiku (M-ENG-07 row 6)", async (t) => {
  const feature = "corpus-run-va";
  const reqPath = `docs/${feature}/REQ-${feature}.md`;
  const root = corpus.makeRepo(feature, { files: { [reqPath]: corpus.reqText(feature) } });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  // The malformed trailer is the pinned `malformed-verdict-trailer.txt` fixture,
  // not a hand-typed string — `readFixture` in `_corpus.mjs` reads it verbatim.
  // `authorTspec: false` reuses the existing halt-at-Phase-T mechanism above,
  // so this run needs no new halt path of its own.
  const { transport } = corpus.makeFullPipelineTransport(root, feature, {
    malformedOnce: { role: "se-review", docType: "REQ" },
    authorTspec: false,
  });

  await corpus.withRunDir(async (runDir) => {
    const { report } = await runDev({
      reqPath,
      cwd: root,
      adapter: corpus.corpusAdapter(root, transport, "run-va"),
      startup: { ok: true, reason: null },
    });

    // Phase R still converges — the recovery dispatch supplied a parseable
    // verdict for the gate — and the run halts at Phase T exactly as the plain
    // smoke test above does, unmodified by anything this run scripted.
    assert.equal(report.outcome, "halted");
    assert.match(report.haltReason, /phase T/);

    const records = corpus.readSettlementLines(runDir);
    const recovery = records.filter((r) => r.skill === "se-review" && r.model === "haiku");
    assert.equal(recovery.length, 1, "exactly one Haiku verdict-recovery dispatch (row 6's witness)");
    assert.equal(recovery[0].corpusRun, "run-va");
    assert.equal(recovery[0].outcome, "ok");
  });
});

test("corpus run v(b): an unparseable PLAN task table falls back to Haiku DAG extraction at Phase I (M-ENG-07 row 7)", async (t) => {
  const feature = "corpus-run-vb";
  const reqPath = `docs/${feature}/REQ-${feature}.md`;
  const fspecPath = `docs/${feature}/FSPEC-${feature}.md`;
  const tspecPath = `docs/${feature}/TSPEC-${feature}.md`;
  const decisionsPath = `docs/${feature}/DECISIONS-${feature}.md`;
  const planPath = `docs/${feature}/PLAN-${feature}.md`;
  const propertiesPath = `docs/${feature}/PROPERTIES-${feature}.md`;

  const root = corpus.makeRepo(feature, {});
  t.after(() => rmSync(root, { recursive: true, force: true }));

  // Every phase up to Phase I is pre-seeded as ALREADY APPROVED, so `phaseGate`
  // skips all five without a dispatch — required for the PLAN's bad table
  // (Phase P's own self-parse gate would otherwise reject it before Phase I
  // ever saw it; see `_corpus.mjs`'s `seedApproved` doc comment).
  corpus.seedApproved(root, feature, {
    docType: "REQ", docPath: reqPath, text: corpus.reqText(feature), reviewers: ["se-review", "te-review"],
  });
  corpus.seedApproved(root, feature, {
    docType: "FSPEC", docPath: fspecPath, text: corpus.fspecText(feature, reqPath), reviewers: ["se-review", "te-review"],
  });
  corpus.seedApproved(root, feature, {
    docType: "TSPEC", docPath: tspecPath, text: corpus.tspecText(feature), reviewers: ["pm-review", "te-review"],
  });
  // Phase D is conditional on Phase T's DECISIONS_WARRANTED trailer, which a SKIPPED
  // Phase T never re-emits — the module's conservative default is then "warranted"
  // (`orchestrate-dev.js:9875`), so this run reaches Phase D and owes it an approved
  // document too. Without it the run halts at Phase D, upstream of row 7's witness.
  corpus.seedApproved(root, feature, {
    docType: "DECISIONS", docPath: decisionsPath, text: corpus.decisionsText(feature), reviewers: ["pm-review", "te-review"],
  });
  // The pinned `unparseable-task-table.md` fixture — a real "Task" header cell,
  // which `PLAN_ID_HEADER_CELLS` does not recognise, so `parsePlanTasks` returns
  // null on this exact text.
  corpus.seedApproved(root, feature, {
    docType: "PLAN", docPath: planPath, text: corpus.readFixture("unparseable-task-table.md"), reviewers: ["pm-review", "te-review"],
  });
  corpus.seedApproved(root, feature, {
    docType: "PROPERTIES", docPath: propertiesPath, text: corpus.propertiesText(feature), reviewers: ["pm-review", "se-review"],
  });

  const { transport } = corpus.makeDagFallbackTransport();

  await corpus.withRunDir(async (runDir) => {
    const { report } = await runDev({
      reqPath,
      cwd: root,
      adapter: corpus.corpusAdapter(root, transport, "run-vb"),
      startup: { ok: true, reason: null },
    });

    for (const p of report.phases) {
      assert.equal(p.status, "⏭", `expected phase ${p.phase} to be skipped, got ${JSON.stringify(p)}`);
    }

    assert.equal(report.outcome, "halted");
    assert.match(report.haltReason, /PLAN parsing agent failed to return structured task list/);

    const records = corpus.readSettlementLines(runDir);
    assert.equal(records.length, 1, "the PLAN-DAG extraction dispatch is the ONLY dispatch this run costs");
    assert.equal(records[0].skill, "se-author");
    assert.equal(records[0].model, "haiku");
    assert.equal(records[0].corpusRun, "run-vb");
  });
});
