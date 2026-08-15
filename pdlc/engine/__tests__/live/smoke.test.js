// __tests__/live/smoke.test.js — the opt-in AC-6.2 live end-to-end smoke
// (TSPEC §7.5, FSPEC §10.2 / §12.4 BR-VER-3, PLAN T51, PROP-VER-11,
// pdlc-headless-engine).
//
// Behind PDLC_LIVE=1 ONLY — this file is invoked directly, e.g.
//   PDLC_LIVE=1 node --test __tests__/live/smoke.test.js
// (from `pdlc/engine/`), never through `npm test` / `_run-suite.mjs`, and
// never in CI (TSPEC §7.6 — no CI job dispatches a model call or reads a
// credential). Node's directory-recursive `--test` collection WILL pick this
// file up when the ordinary hermetic suite runs `node --test __tests__/` —
// the one test below is therefore SKIPPED rather than run unless PDLC_LIVE=1
// is set, so the hermetic suite never pays this file's real dispatch cost
// (and never trips `_bootstrap.mjs`'s hermeticity/spawn guard, which the
// normal suite DOES install but this file's opt-in invocation deliberately
// does not exercise — see below).
//
// This is the credentialed counterpart to `__tests__/smoke.test.js`'s
// hermetic parity oracle (FSPEC §10.2, BR-PARITY-3..6): that test proves the
// engine ↔ workflow-module wiring using a scripted transport double that
// never contacts a model. This file drives the SAME
// `pdlc/workflows/orchestrate-dev.js`, through the SAME `runDev` /
// `createAdapter` seams, over ONE real small feature in a REAL scratch git
// repo — but with the REAL transport (`createTransport()`, no double at
// all), so the one thing a hermetic double structurally cannot show — a real
// model producing a parseable terminal cross-review verdict — is actually
// exercised (BR-VER-3, AC-6.2, AT-ENG-65).
//
// Unlike the hermetic oracle, this test has no fixture to check the run
// against: BR-PARITY-6's "expected sets are the fixture's, never the run's
// own report" has no fixture here, since the model's behaviour is not
// scripted. So the assertions below read structural ground truth off the
// real filesystem the run left behind (matching BR-PARITY-3: the oracle is
// over *shape*, never over bytes) and cross-check the run report against
// that SAME ground truth, rather than trusting the report alone — the
// failure mode BR-PARITY-6 names, a consistently-wrong run that skips
// something and also omits it from the report, would otherwise pass a
// report-only check.
//
// When this file IS collected by the ordinary `node --test __tests__/` run,
// `_bootstrap.mjs` still installs its hermeticity/spawn guard as usual (TSPEC
// §7.0/§7.1, AC-6.1) — but the one test below never runs in that mode (LIVE
// is false, so it is skipped before any transport is constructed), so the
// guard is never tripped and never needs to be. This file's live invocation
// (`PDLC_LIVE=1 node --test __tests__/live/smoke.test.js`) does not run under
// that hermetic entry point at all, exactly like `guard-measurement.test.js`'s
// live test.
//
// Writes no observation records (TSPEC §7.5, PM Q-01): the adapter built
// below carries no `corpusRun`, so any settlement lines `_bootstrap.mjs`'s
// writer would capture for it (only if this file were ever run under
// `node --test __tests__/` with PDLC_LIVE=1, which nothing here does) carry
// `corpusRun: null` and are excluded from the suite-wide corpus-scoping rows
// (TSPEC §7.5). The dated evidence line AC-6.2's DoD waiver names (PLAN §8:
// "operator-recorded, not suite-observed") is the operator's own act after a
// manual run of this file — this file itself records nothing durable.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";

import { createTransport } from "../../lib/transport.mjs";
import { createAdapter } from "../../lib/adapter.mjs";
import { runDev } from "../../lib/run.mjs";

const liveDir = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.dirname(liveDir);
const engineRoot = path.dirname(testsDir);
const repoRoot = path.dirname(path.dirname(engineRoot));
const PLUGIN_ROOT = path.join(repoRoot, "pdlc");

const LIVE = process.env.PDLC_LIVE === "1";

const FEATURE = "live-smoke-widget";
const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;

// A minimal, well-formed REQ — same required-heading shape the hermetic
// `__tests__/smoke.test.js` fixture uses — so a real pm-review dispatch has a
// legible document to converge on rather than failing for unrelated reasons.
const REQ_TEXT = [
  "---",
  `feature: ${FEATURE}`,
  "ready: true",
  "depends-on: []",
  "---",
  `# REQ — ${FEATURE}`,
  "",
  "## 1. Problem / Context",
  "A tiny widget that does not exist yet, authored only to exercise a real",
  "cross-review round end-to-end (AC-6.2 live smoke, PLAN T51).",
  "",
  "## 2. Goals",
  "- G-1 Ship the widget.",
  "",
  "## 3. Non-Goals",
  "- NG-1 No gadget.",
  "",
  "## 4. Constraints",
  "- C-1 Offline-free-form only; no external dependency.",
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

// §10.2 clause 1(i)'s phase-declared core, keyed by the `PHASE_DISPATCH`
// phase id every `report.phases` entry carries (orchestrate-dev.js:3340) —
// transcribed here, never imported from the module's own constant, so this
// oracle cannot be made vacuous by a later edit to `PHASE_DISPATCH`'s shape.
// Phase R reviews the REQ itself and creates no new doc, so it has no entry.
const PHASE_CORE_DOC = {
  F: "FSPEC",
  T: "TSPEC",
  D: "DECISIONS",
  P: "PLAN",
  PR: "PROPERTIES",
};

function git(cwd, args) {
  return execFileSync("git", args, { cwd, stdio: "pipe", encoding: "utf8" });
}

function makeConsumerRepo() {
  const root = mkdtempSync(path.join(os.tmpdir(), "pdlc-engine-live-smoke-"));
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "live-smoke@example.invalid"]);
  git(root, ["config", "user.name", "pdlc live smoke"]);
  git(root, ["config", "commit.gpgsign", "false"]);
  git(root, ["checkout", "-q", "-b", `feat-${FEATURE}`]);

  const abs = path.join(root, REQ_PATH);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, REQ_TEXT, "utf8");
  writeFileSync(path.join(root, "README.md"), "# live smoke consumer\n", "utf8");

  git(root, ["add", "-A"]);
  git(root, ["commit", "-q", "-m", "live smoke fixture"]);
  return root;
}

test(
  "AC-6.2 live smoke: one real small feature end-to-end against a scratch repo, asserting §10.2's structural set plus a real terminal cross-review verdict (§7.5, BR-VER-3, AT-ENG-65)",
  {
    skip:
      !LIVE &&
      "requires PDLC_LIVE=1 — invoke directly: PDLC_LIVE=1 node --test __tests__/live/smoke.test.js (from pdlc/engine/)",
  },
  async () => {
    const root = makeConsumerRepo();
    try {
      // The REAL transport — no double, no stub, no recorded fixture (BR-VER-3).
      const transport = createTransport();
      const adapter = createAdapter({
        transport,
        pluginRoot: PLUGIN_ROOT,
        cwd: root,
        // Quiet the modules' own log lines; the operator reads this test's
        // own summary line at the end instead.
        log: () => {},
      });

      const { report } = await runDev({
        reqPath: REQ_PATH,
        cwd: root,
        adapter,
        startup: { ok: true, reason: null },
      });

      assert.ok(report, "expected a run report even on a halt");
      assert.ok(
        ["success", "halted"].includes(report.outcome),
        `expected a real run to reach success or a named halt, got ${JSON.stringify(report.outcome)}`
      );
      assert.equal(report.feature, FEATURE);
      assert.ok(
        Array.isArray(report.phases) && report.phases.length > 0,
        "expected at least one phase entry"
      );
      assert.ok(Array.isArray(report.artifactPaths));
      assert.equal(typeof report.testSummary, "string");
      assert.equal(typeof report.harvestStatus, "string");

      // §10.2 clause 1(i), read off the real tree — never off the report
      // alone (BR-PARITY-6): every phase the report marks converged ("✅")
      // whose PHASE_CORE_DOC entry names a doc must have left that file on
      // disk.
      const docsDir = path.join(root, "docs", FEATURE);
      for (const p of report.phases) {
        const docType = PHASE_CORE_DOC[p.phase];
        if (docType && p.status === "✅") {
          const docPath = path.join(docsDir, `${docType}-${FEATURE}.md`);
          assert.ok(
            existsSync(docPath),
            `Phase ${p.phase} converged but ${docType}-${FEATURE}.md is missing on disk`
          );
        }
      }

      // §10.2 clauses 2/3, and the "one thing only a live run can show"
      // (BR-VER-3): every CROSS-REVIEW file the run actually created —
      // ground truth is the directory listing, not the report — carries a
      // parseable VERDICT line, and every one whose verdict is a terminal
      // approval carries both approval anchors. At least one such file
      // existing at all means a real cross-review round ran; at least one
      // reaching Approved means a real model call produced a parseable
      // terminal verdict (AT-ENG-65).
      assert.ok(
        existsSync(docsDir),
        `expected ${docsDir} to exist — no dispatch reached Phase R`
      );
      const reviews = readdirSync(docsDir).filter((f) => f.startsWith("CROSS-REVIEW-"));
      assert.ok(reviews.length > 0, "expected at least one real cross-review round (AT-ENG-65)");

      let approvedCount = 0;
      for (const f of reviews) {
        const text = readFileSync(path.join(docsDir, f), "utf8");
        assert.match(text, /^VERDICT: .+$/m, `${f} must carry a parseable VERDICT line`);
        if (/^VERDICT: Approved\b/m.test(text)) {
          approvedCount += 1;
          assert.match(
            text,
            /^APPROVAL-HASH: sha256:[0-9a-f]{64}$/m,
            `${f} reached approval but carries no approval hash`
          );
          assert.match(
            text,
            /^REVIEWED-COMMIT: [0-9a-f]{7,40}$/m,
            `${f} reached approval but carries no reviewed-commit anchor`
          );
        }
      }
      assert.ok(
        approvedCount > 0,
        "expected at least one cross-review to reach a real terminal (Approved) verdict produced by a real model call (BR-VER-3, AT-ENG-65)"
      );

      // §10.2 clause 5, in part: the dispatch-count provenance the adapter
      // itself accumulated (never the modules' own report) proves at least
      // one real `_agent` call actually happened.
      const dispatchCounts = adapter.getDispatchCounts();
      const totalDispatches = Object.values(dispatchCounts.bySkill).reduce((a, b) => a + b, 0);
      assert.ok(totalDispatches > 0, "expected at least one real dispatch");

      // Recorded for the operator reading test output — never a silent
      // pass/fail on the one thing this smoke exists to show.
      console.log(
        `AC-6.2 live smoke: outcome=${report.outcome} ` +
          `phases=${report.phases.map((p) => `${p.phase}:${p.status}`).join(",")} ` +
          `crossReviews=${reviews.length} approved=${approvedCount} dispatches=${totalDispatches}`
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
);
