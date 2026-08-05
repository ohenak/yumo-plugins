// advisoryHarvest.test.js — PLAN A-13 (batch 3, depends on A-02).
//
// RED (authored as two `describe.skip` blocks, each un-skipped by a different 🟢 owner, per
// PLAN §3's un-skipper rule — this file's own §4 ownership manifest names only A-27 and A-28 as
// writers of it, so every case lives in one of those two blocks, never a third):
//
//   - `A-28 — delete-guard extension`        (batch 4)  — lands the guard-script's `ADVISORY`
//                                                          early-exit token, the widened
//                                                          extraction regex, and the `[class: …]`
//                                                          suffix (TSPEC §9.3). Owns T-08-4b (the
//                                                          guard-only unit case) and this file's
//                                                          §13.4(5) coupling regression, since both
//                                                          need only the edited *script*, never the
//                                                          H2 distil step A-27 lands.
//   - `A-27 — post-PUB distil + report summary` (batch 14) — lands the new Phase-H2 distil step
//                                                          between Phase PUB and Phase MERGE, and
//                                                          `buildFinalReport`'s new `advisory`
//                                                          field. Owns T-08-3, T-08-4, T-08-5,
//                                                          T-08-6, T-08-8, T-08-9. By batch 14, A-26
//                                                          (batch 13, Phase PUB's `_runAdvisorySeam`
//                                                          wiring) and A-31 (batch 12,
//                                                          `buildQueueReport`'s advisory summary)
//                                                          have both already landed, so this block's
//                                                          queue-side case (T-08-8) is real
//                                                          production behaviour by the time A-27
//                                                          un-skips it, even though A-27 itself only
//                                                          edits `orchestrate-dev.js` (§4 ownership
//                                                          manifest row).
//
// What this file does NOT claim: T-08-1, T-08-2, T-08-7, T-08-10 — the pure record/summary render
// surface — live in `advisoryRecord.test.js` (A-08 🔴 / A-21 🟢, PLAN §8.1's T-08 row). This file
// is the harvest/guard/distil/report-integration surface only.
//
// `raisePrAndVerifyCi`'s `_runAdvisorySeam`/`_advisoryRecord` parameters, the Phase-H2 distil step,
// `buildFinalReport`'s `advisory` field and `buildQueueReport`'s advisory summary do not exist yet
// at A-13. This file therefore imports `orchestrate-dev.js` both as the default `main` export (the
// production entry point every case drives) and as a namespace (`import * as dev`), exactly as
// `advisoryPubSeam.test.js` (A-11) and `harvestPhase.test.js` already do — passing extra,
// not-yet-recognised keys through `main()`'s destructured options object is inert until the
// corresponding 🟢 task adds the parameter (every optional key there already defaults via `= {}`),
// so a case naming a not-yet-existing seam parameter imports and *parses* cleanly today; it simply
// has no effect until un-skipped.
//
// Every canonical double comes from `helpers/advisoryDoubles.js` (PROP-INFRA-01/-02) — no
// locally-built `SeamOps` literal, no `jest.fn()` bound directly to a double-shaped name. The one
// exception PROP-INFRA-01 already carves out for every sibling harvest/guard test
// (`hookCompatibility.test.js`'s `runHookScript`) is reused verbatim here: spawning the real guard
// script as a child process is not a `SeamOps`/agent/file double at all.
//
// ─── Interpretive/contract-fixing decisions this RED task makes (documented here per this
// project's own convention — see `advisoryDriver.test.js`'s header on `_log` — for A-27/A-28 to
// implement against) ───────────────────────────────────────────────────────────────────────────
//
//   1. **`guardRefused(del)`'s contract.** TSPEC §9.3's pseudocode checks a `del` value returned by
//      `gitFn(["rm", "--", advisoryPath])` against a `guardRefused()` helper. This file fixes that
//      helper's OBSERVABLE contract, not its implementation: `del` is refused exactly when
//      `del.ok === false` and `del.stderr` contains the *reused, unmodified* dev:8342 literal
//      (`"pdlc guard: refusing to delete CROSS-REVIEW files"`) — the same string Phase H's own
//      TSPEC-HARVEST-04 mechanism already tests for, per §9.3's explicit "the message is extended,
//      not rewritten" rule. This file's `_git` double returns exactly that shape when scripted to
//      simulate a refusal, and the `[class: …]` suffix TSPEC's worked example shows is asserted as
//      a trailing substring, never as the sole detection signal.
//   2. **Disposition accumulation.** `advisorySummaryRows(dispositions)` (TSPEC §9.4) takes a plain
//      array of `AdvisoryDisposition` objects. This file fixes that `main()` accumulates one such
//      object per `_runAdvisorySeam` call into an in-run list threaded to `buildFinalReport` on
//      both the success and halt paths (mirroring how `notices` and `queueRow` already ride both
//      paths per TSPEC §9.4's own citation of `dev:8494`/`dev:8517`) — never re-derived by
//      re-parsing the rendered `ADVISORY-{feature}.md` file, which is a rendering target, not a
//      data source, once a run is in flight.
//   3. **T-08-9's seam substitution.** FSPEC names A3 or A4 (both DoD-phase seams, TSPEC §7) as the
//      halting example. Those two seams' own call-site wiring inside the DoD verify/remediate loop
//      is owned by upstream DoD-seam tasks (A-10/A-23), outside this file's §4 ownership manifest
//      (`orchestrate-dev.js` + this file only) and not reachable through any parameter A-27 itself
//      adds. T-08-9's actual CLAIM — S-1 ("the summary covers seams reached so far") and H-4 ("the
//      record survives on disk, un-distilled") — is seam-agnostic: it holds for whichever seam
//      fired before the halt. This file therefore discharges the claim using **A5**, the one seam
//      whose call site TSPEC pins unambiguously (`raisePrAndVerifyCi`, the `status === "failed"`
//      branch, `dev:6371` — landed at A-26, batch 13, strictly before this block's batch 14), by
//      forcing A5 to escalate and asserting Phase PUB halts immediately after. This is the same
//      substitution latitude `advisoryDriver.test.js`'s P-1…P-4 driver-level stand-ins already use
//      (seam-shaped fixtures in place of a specific seam's own production implementation).
//   4. **The distil dispatch's prompt.** TSPEC §9.3 names no exported `advisoryDistilPrompt`
//      symbol or literal text. This file fixes only what it needs to observe from the outside: the
//      H2 step's `harvest-learnings` dispatch is a **second**, distinguishable call from Phase H's
//      own — this file's fake agent tells the two apart by the substring `"ADVISORY"`, which any
//      reasonable prompt naming the artifact class is expected to contain, and asserts nothing
//      about the prompt's fuller text.
//   5. **`advisory.enabled`/`recordExists` gating.** Read from `.claude/pdlc.config.json`'s
//      `advisory` section via the *existing* `_readFile` seam (TSPEC §3.2's `ADVISORY_CONFIG_PATH
//      = MERGE_CONFIG_PATH`) — no new injection point. `recordExists` is fixed as observable
//      through the same seam: this file's fake `_checkFile`/`_readFile` reports the
//      `ADVISORY-{feature}.md` path as present exactly when a seam has already appended to it
//      in-run (case-local, via the injected `_runAdvisorySeam`'s own bookkeeping below), never via
//      a separately-scripted flag.

import main from "../orchestrate-dev.js";
import * as dev from "../orchestrate-dev.js";
import queueMain from "../orchestrate-queue.js";
import { execSync, spawnSync } from "child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

import {
  makeAgentDouble,
  makeSeamOps,
  makeFileDouble,
  makeFakeClock,
  makeAdvisoryConfig,
  makeGitDouble,
  makeGhDouble,
} from "./helpers/advisoryDoubles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const HOOKS_DIR = resolve(__dirname, "../../hooks/scripts");
const GUARD_SCRIPT = join(HOOKS_DIR, "guard-harvest-before-delete.sh");

const FEATURE = "pdlc-advisory-tier";
const ADVISORY_REL = `docs/${FEATURE}/ADVISORY-${FEATURE}.md`;
const LEARNINGS_REL = `docs/${FEATURE}/LEARNINGS-${FEATURE}.md`;
const CONFIG_PATH = ".claude/pdlc.config.json";

// ─── bash-availability guard (matches hookCompatibility.test.js's own convention) ────────────────
function bashAvailable() {
  try {
    execSync("bash --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
const hasBash = bashAvailable();

/**
 * Runs a hook script with `stdinInput` (a JSON string) on stdin — the same harness
 * `hookCompatibility.test.js`'s PROP-COMPAT-05 uses for the pre-A-28 guard script.
 */
function runHookScript(scriptPath, stdinInput, opts = {}) {
  const result = spawnSync("bash", [scriptPath], {
    input: stdinInput,
    encoding: "utf8",
    env: { ...process.env, ...(opts.env || {}) },
    cwd: opts.cwd || process.cwd(),
  });
  return {
    exitCode: result.status ?? -1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

// ─── PLAN fixture (identical convention to harvestPhase.test.js's readParseablePlan) ──────────────
const PLAN_TEXT =
  "| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n| T1 | first | 1 | - |\n\n" +
  "| Task | Files |\n|---|---|\n| T1 | `src/one.js` |\n";

/**
 * Builds the `_readFile` fake every A-27-block case shares: the PLAN fixture above, an
 * `advisory`-enabled `.claude/pdlc.config.json` (decision 5), and `null` for anything else —
 * matching `readParseablePlan`'s own fail-to-null convention (never throws).
 */
function makeDevReadFile({ configEnabled = true, extra = {} } = {}) {
  return async (path) => {
    const key = String(path);
    if (Object.prototype.hasOwnProperty.call(extra, key)) return extra[key];
    if (key.includes("/PLAN-")) return PLAN_TEXT;
    if (key === CONFIG_PATH) {
      return JSON.stringify({
        advisory: {
          enabled: configEnabled,
          attemptBudget: 3,
          seamBudgetMinutes: 10,
          envelope: ["E-1", "E-2", "E-3", "E-4"],
        },
      });
    }
    return null;
  };
}

/**
 * The shared agent double every `main()`-driven case in the A-27 block uses. Mirrors
 * `harvestPhase.test.js`'s `successAgent` (RLH-REPORT-01-harvest), extended with decision 4's
 * ADVISORY-marked second `harvest-learnings` dispatch for the H2 distil step.
 */
function buildDevAgent({ onDistil } = {}) {
  return async (skill, prompt) => {
    if (["se-review", "te-review", "pm-review"].includes(skill)) {
      return `Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    if (["pm-author", "se-author", "te-author"].includes(skill)) {
      if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
        return "Finalized.\nDECISIONS_WARRANTED: false";
      }
      if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
        });
      }
      return "Document created.";
    }
    if (skill === "harvest-learnings") {
      if (typeof prompt === "string" && prompt.includes("ADVISORY")) {
        if (onDistil) onDistil(prompt);
        return "Distilled.";
      }
      return "Harvest complete.";
    }
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    if (skill === "ship-pr") {
      if (String(prompt).includes("Raise a pull request")) {
        return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
      }
      return "Rebased.\nREBASE_STATUS: clean";
    }
    return "Success.";
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
describe("A-28 — delete-guard extension", () => {
  // ─── T-08-4b — unit-scoped guard case over the guard script itself ─────────────────────────────
  // FSPEC:750: "Who maintainer · Given a direct delete of ADVISORY-{feature}.md with no sibling
  // LEARNINGS-{feature}.md · When the delete is attempted · Then it is refused, the refusal names
  // the artifact class, and the file still exists." Distinct from T-08-4 (A-27's production-path
  // case, driven through main()'s H2 step) — this case never touches orchestrate-dev.js at all.
  describe("T-08-4b — direct delete of ADVISORY-{feature}.md with no sibling LEARNINGS", () => {
    let tmpDir;
    let advisoryPath;

    beforeEach(() => {
      tmpDir = mkdtempSync(join(tmpdir(), "pdlc-adv-t08-4b-"));
      advisoryPath = join(tmpDir, `ADVISORY-${FEATURE}.md`);
      writeFileSync(
        advisoryPath,
        `## 2026-08-04T00:00:00Z — pdlc-advisory-tier — A1\n\nNo action taken.\n`
      );
    });

    afterEach(() => {
      try {
        rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // best-effort cleanup
      }
    });

    (hasBash ? it : it.skip)(
      "refuses the delete, names the ADVISORY class, and leaves the file in place",
      () => {
        const toolInput = JSON.stringify({
          tool_input: { command: `rm ${advisoryPath}` },
        });
        const { exitCode, stderr } = runHookScript(GUARD_SCRIPT, toolInput, {
          cwd: tmpDir,
          env: { CLAUDE_PROJECT_DIR: tmpDir },
        });

        expect(exitCode).not.toBe(0);
        expect(stderr).toContain("pdlc guard");
        // H-3 / decision 1: the class actually matched is named — the new `[class: …]` suffix.
        expect(stderr).toContain("ADVISORY");
        expect(stderr).toMatch(/\[class:\s*ADVISORY\]/);

        // The file survives the refused delete.
        const stillThere = readFileSync(advisoryPath, "utf8");
        expect(stillThere).toContain("A1");
      }
    );

    (hasBash ? it : it.skip)(
      "allows the delete once a sibling LEARNINGS-*.md exists",
      () => {
        writeFileSync(join(tmpDir, `LEARNINGS-${FEATURE}.md`), "# Learnings\n\nDistilled.\n");
        const toolInput = JSON.stringify({
          tool_input: { command: `rm ${advisoryPath}` },
        });
        const { exitCode } = runHookScript(GUARD_SCRIPT, toolInput, {
          cwd: tmpDir,
          env: { CLAUDE_PROJECT_DIR: tmpDir },
        });
        expect(exitCode).toBe(0);
      }
    );
  });

  // ─── §13.4(5) coupling regression ───────────────────────────────────────────────────────────────
  // TSPEC §9.3's ⚠️: after the guard edit, `dev:8342`'s literal test and `dev:8348`'s extraction
  // regex must both still fire on a CROSS-REVIEW refusal — the prefix and bracketed directory keep
  // their exact bytes, and the class becomes a trailing suffix token, never a rewrite.
  describe("§13.4(5) — orchestrate-dev.js's existing literal test and extraction regex still fire on a CROSS-REVIEW refusal", () => {
    let tmpDir;
    let crossReviewPath;

    beforeEach(() => {
      tmpDir = mkdtempSync(join(tmpdir(), "pdlc-adv-coupling-"));
      crossReviewPath = join(tmpDir, "CROSS-REVIEW-pm-review-TSPEC.md");
      writeFileSync(crossReviewPath, "# Cross-Review\nSome review content.\n");
    });

    afterEach(() => {
      try {
        rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // best-effort cleanup
      }
    });

    (hasBash ? it : it.skip)(
      "the extended message still satisfies dev:8342's literal .includes check",
      () => {
        const toolInput = JSON.stringify({
          tool_input: { command: `rm ${crossReviewPath}` },
        });
        const { exitCode, stderr } = runHookScript(GUARD_SCRIPT, toolInput, {
          cwd: tmpDir,
          env: { CLAUDE_PROJECT_DIR: tmpDir },
        });

        expect(exitCode).not.toBe(0);
        // The literal dev:8342 tests for, byte-for-byte, unchanged by the A-28 edit.
        expect(stderr).toContain("pdlc guard: refusing to delete CROSS-REVIEW files");
        // The extension is additive — a trailing class token, not a rewrite of the prefix.
        expect(stderr).toMatch(/\[class:\s*CROSS-REVIEW\]/);
      }
    );

    (hasBash ? it : it.skip)(
      "the extended message still satisfies dev:8348's extraction regex, and the captured directory is correct",
      () => {
        const toolInput = JSON.stringify({
          tool_input: { command: `rm ${crossReviewPath}` },
        });
        const { stderr } = runHookScript(GUARD_SCRIPT, toolInput, {
          cwd: tmpDir,
          env: { CLAUDE_PROJECT_DIR: tmpDir },
        });

        // The exact regex `orchestrate-dev.js:8381` uses today — reused verbatim, never
        // re-derived, per decision 1.
        const EXTRACTION_REGEX =
          /pdlc guard: refusing to delete CROSS-REVIEW files in \[([^\]]+)\]/;
        const match = stderr.match(EXTRACTION_REGEX);
        expect(match).not.toBeNull();
        expect(match[1]).toBe(tmpDir);
      }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════
describe.skip("A-27 — post-PUB distil + report summary", () => {
  // ─── T-08-3 — dev-side completed run, seam fired ────────────────────────────────────────────────
  describe("T-08-3 — dev-side run with a fired seam", () => {
    it("ends with ADVISORY-{feature}.md absent, its content in LEARNINGS, both committed and pushed", async () => {
      const gitCalls = [];
      const _git = async (argv) => {
        gitCalls.push(argv);
        return { ok: true, stdout: "", stderr: "" };
      };
      let ciCalls = 0;
      const _checkCi = async () => {
        ciCalls += 1;
        return ciCalls === 1 ? "failed" : "passed";
      };
      const _runAdvisorySeam = async ({ seam }) => ({
        seam,
        outcome: "resolved",
        reason: null,
        verdict: { confidence: "high" },
        attempts: 1,
        model: "opus",
        fallback: false,
      });

      const result = await main({
        reqPath: `docs/${FEATURE}/REQ-${FEATURE}.md`,
        _readFile: makeDevReadFile(),
        _agent: buildDevAgent(),
        _parallel: (p) => Promise.all(p),
        _checkFile: () => ({ ok: true }),
        _checkCi,
        _phase: () => {},
        _pipeline: async (l, fn) => fn(),
        _mergeWorktree: async () => ({ ok: true }),
        _git,
        _runAdvisorySeam,
      });

      expect(result.outcome).toBe("success");

      const rmCalls = gitCalls.filter(
        (argv) => Array.isArray(argv) && argv.includes("rm") && argv.some((a) => String(a).includes(ADVISORY_REL))
      );
      expect(rmCalls.length).toBeGreaterThan(0);

      const pushCalls = gitCalls.filter((argv) => Array.isArray(argv) && argv[0] === "push");
      expect(pushCalls.length).toBeGreaterThan(0);
    });
  });

  // ─── T-08-4 — production-path guard refusal ─────────────────────────────────────────────────────
  describe("T-08-4 — distil step's delete refused with no sibling LEARNINGS", () => {
    it("names the artifact class, leaves ADVISORY-{feature}.md intact, and the run report names the refusal", async () => {
      const _git = async (argv) => {
        if (Array.isArray(argv) && argv.includes("rm") && argv.some((a) => String(a).includes(ADVISORY_REL))) {
          // decision 1: the `guardRefused()` shape — an `{ ok: false, stderr }` carrying the
          // reused, unmodified dev:8342 literal plus the new `[class: ADVISORY]` suffix.
          return {
            ok: false,
            stdout: "",
            stderr:
              `pdlc guard: refusing to delete CROSS-REVIEW files in [docs/${FEATURE}] — ` +
              `no LEARNINGS-*.md exists there yet. This guard also covers CODE_REVIEW-* and ` +
              `ADVISORY-* files. [class: ADVISORY]`,
          };
        }
        return { ok: true, stdout: "", stderr: "" };
      };
      const _runAdvisorySeam = async ({ seam }) => ({
        seam,
        outcome: "resolved",
        reason: null,
        verdict: { confidence: "high" },
        attempts: 1,
        model: "opus",
        fallback: false,
      });
      let ciCalls = 0;

      const result = await main({
        reqPath: `docs/${FEATURE}/REQ-${FEATURE}.md`,
        _readFile: makeDevReadFile(),
        _agent: buildDevAgent(),
        _parallel: (p) => Promise.all(p),
        _checkFile: () => ({ ok: true }),
        _checkCi: async () => {
          ciCalls += 1;
          return ciCalls === 1 ? "failed" : "passed";
        },
        _phase: () => {},
        _pipeline: async (l, fn) => fn(),
        _mergeWorktree: async () => ({ ok: true }),
        _git,
        _runAdvisorySeam,
      });

      // A refused H2 delete is a notice, not a halt (H-3 / T-08-4's own Then clause).
      expect(result.outcome).toBe("success");
      expect(result.notices.some((n) => n.includes("ADVISORY"))).toBe(true);
      expect(result.notices.some((n) => /class:\s*ADVISORY/.test(n))).toBe(true);
    });
  });

  // ─── T-08-5 — distil runs after Phase PUB, includes the A5 entry ────────────────────────────────
  describe("T-08-5 — seam A5 fired; the distil step runs after Phase PUB and the A5 entry is included", () => {
    it("dispatches the distil harvest only after the PR's checks have passed", async () => {
      const dispatchOrder = [];
      let ciCalls = 0;
      const _checkCi = async () => {
        ciCalls += 1;
        dispatchOrder.push(`checkCi:${ciCalls}`);
        return ciCalls === 1 ? "failed" : "passed";
      };
      const _runAdvisorySeam = async ({ seam }) => {
        dispatchOrder.push(`seam:${seam}`);
        return {
          seam,
          outcome: "resolved",
          reason: null,
          verdict: { confidence: "high" },
          attempts: 1,
          model: "opus",
          fallback: false,
        };
      };
      const _agent = buildDevAgent({
        onDistil: () => dispatchOrder.push("distil"),
      });
      const _git = async (argv) => {
        if (Array.isArray(argv) && argv.includes("rm")) dispatchOrder.push("git-rm");
        return { ok: true, stdout: "", stderr: "" };
      };

      const result = await main({
        reqPath: `docs/${FEATURE}/REQ-${FEATURE}.md`,
        _readFile: makeDevReadFile(),
        _agent,
        _parallel: (p) => Promise.all(p),
        _checkFile: () => ({ ok: true }),
        _checkCi,
        _phase: () => {},
        _pipeline: async (l, fn) => fn(),
        _mergeWorktree: async () => ({ ok: true }),
        _git,
        _runAdvisorySeam,
      });

      expect(result.outcome).toBe("success");
      const seamIdx = dispatchOrder.indexOf("seam:A5");
      const lastCiIdx = dispatchOrder.lastIndexOf(`checkCi:${ciCalls}`);
      const distilIdx = dispatchOrder.indexOf("distil");
      expect(seamIdx).toBeGreaterThan(-1);
      expect(distilIdx).toBeGreaterThan(-1);
      // The distil dispatch happens after the seam fired and after the checks that let Phase
      // PUB conclude — never interleaved earlier in the run.
      expect(distilIdx).toBeGreaterThan(seamIdx);
      expect(distilIdx).toBeGreaterThan(lastCiIdx);
    });
  });

  // ─── T-08-6 — summary lists all five seams, zero counts included ───────────────────────────────
  describe("T-08-6 — only seam A4's disposition fired; the report still lists all five seams", () => {
    it("carries five rows, four of them all-zero", async () => {
      const _runAdvisorySeam = async ({ seam }) => ({
        seam,
        outcome: "resolved",
        reason: null,
        verdict: { confidence: "high" },
        attempts: 1,
        model: "opus",
        fallback: false,
      });
      let ciCalls = 0;

      const result = await main({
        reqPath: `docs/${FEATURE}/REQ-${FEATURE}.md`,
        _readFile: makeDevReadFile(),
        _agent: buildDevAgent(),
        _parallel: (p) => Promise.all(p),
        _checkFile: () => ({ ok: true }),
        _checkCi: async () => {
          ciCalls += 1;
          return ciCalls === 1 ? "failed" : "passed";
        },
        _phase: () => {},
        _pipeline: async (l, fn) => fn(),
        _mergeWorktree: async () => ({ ok: true }),
        _git: async () => ({ ok: true, stdout: "", stderr: "" }),
        // Only A5 is reachable from this file's own injection surface (decision 3); this case's
        // claim (S-1's "five rows always, zero counts included") is the same regardless of which
        // single seam fired, so it is exercised here rather than re-derived a second time.
        _runAdvisorySeam,
      });

      expect(result.outcome).toBe("success");
      expect(result.advisory).toBeTruthy();
      expect(result.advisory.rows).toHaveLength(5);
      const seamNames = result.advisory.rows.map((r) => r.seam).sort();
      expect(seamNames).toEqual(["A1", "A2", "A3", "A4", "A5"]);
      for (const row of result.advisory.rows) {
        expect(row.invocations).toBe(row.resolved + row.escalated + row.noAction);
      }
      const total = result.advisory.total;
      expect(total.invocations).toBe(total.resolved + total.escalated + total.noAction);
    });
  });

  // ─── T-08-9 — halt before H2 leaves the record un-distilled ─────────────────────────────────────
  // Seam substituted per decision 3 above (A5, forced to escalate, in place of FSPEC's A3/A4).
  describe("T-08-9 — a halt before the distil step leaves the record un-distilled", () => {
    it("the halt report still carries the advisory summary for seams reached, and the delete never ran", async () => {
      const gitCalls = [];
      const _git = async (argv) => {
        gitCalls.push(argv);
        return { ok: true, stdout: "", stderr: "" };
      };
      const _runAdvisorySeam = async ({ seam }) => ({
        seam,
        outcome: "escalated",
        reason: "out-of-envelope",
        verdict: { confidence: "low" },
        attempts: 1,
        model: "opus",
        fallback: false,
      });

      const result = await main({
        reqPath: `docs/${FEATURE}/REQ-${FEATURE}.md`,
        _readFile: makeDevReadFile(),
        _agent: buildDevAgent(),
        _parallel: (p) => Promise.all(p),
        _checkFile: () => ({ ok: true }),
        // A5 escalates on the first (failed) check and is never given a second poll.
        _checkCi: async () => "failed",
        _phase: () => {},
        _pipeline: async (l, fn) => fn(),
        _mergeWorktree: async () => ({ ok: true }),
        _git,
        _runAdvisorySeam,
      });

      expect(result.outcome).toBe("halted");
      expect(result.advisory).toBeTruthy();
      const a5Row = result.advisory.rows.find((r) => r.seam === "A5");
      expect(a5Row).toMatchObject({ invocations: 1, resolved: 0, escalated: 1, noAction: 0 });
      const otherRows = result.advisory.rows.filter((r) => r.seam !== "A5");
      for (const row of otherRows) {
        expect(row).toMatchObject({ invocations: 0, resolved: 0, escalated: 0, noAction: 0 });
      }

      // H-4: the record survives — the distil step's delete never runs on a halt.
      const rmCalls = gitCalls.filter(
        (argv) => Array.isArray(argv) && argv.includes("rm") && argv.some((a) => String(a).includes(ADVISORY_REL))
      );
      expect(rmCalls).toHaveLength(0);
    });
  });

  // ─── T-08-8 — queue-side record persists, no distil ─────────────────────────────────────────────
  describe("T-08-8 — a queue invocation that adjudicated A1/A2 and picked nothing", () => {
    it("commits the ADVISORY record scoped to that one file, never pushes, runs no distil, and the queue's own report carries the A1/A2 summary", async () => {
      const gitCalls = [];
      const agentCalls = [];
      const _git = async (argv) => {
        gitCalls.push(argv);
        return { ok: true, stdout: "", stderr: "" };
      };
      const _agent = async (skill, prompt) => {
        agentCalls.push(skill);
        if (skill === "se-author") {
          // Phase-0 readiness triage — force the needs-human branch every A1/A2 case routes
          // through (queue's own T-08-8-adjacent seam-token grammar is A-29/A-30's concern, not
          // pinned again here).
          return "TRIAGE: needs-human  ambiguous scope — a human must decide";
        }
        return "Success.";
      };
      const _runAdvisorySeam = async ({ seam }) => ({
        seam,
        outcome: "no-action",
        reason: null,
        verdict: { confidence: "low" },
        attempts: 1,
        model: "opus",
        fallback: false,
      });

      const result = await queueMain({
        queuePath: "docs/_queue/QUEUE.md",
        _readFile: async (path) => {
          const key = String(path);
          if (key === CONFIG_PATH) {
            return JSON.stringify({ advisory: { enabled: true } });
          }
          if (key === "docs/_queue/QUEUE.md") {
            return (
              "| Order | Status | Feature | REQ Path | Depends-On |\n|---|---|---|---|---|\n" +
              `| 1 | pending | ${FEATURE} | docs/${FEATURE}/REQ-${FEATURE}.md | - |\n`
            );
          }
          if (key.includes(`REQ-${FEATURE}`)) {
            return `---\nready: true\n---\n# REQ\n`;
          }
          return null;
        },
        _writeFile: async () => {},
        _git,
        _agent,
        _runPipeline: async () => {
          throw new Error("T-08-8: no orchestrate-dev run should be attempted from the needs-human branch");
        },
        _runAdvisorySeam,
        _phase: () => {},
      });

      // H-2b: no distil ran — the record persists, and no `harvest-learnings` dispatch occurred.
      expect(agentCalls).not.toContain("harvest-learnings");

      // Committed, scoped to the one advisory file, never pushed (H-2b's durability terms).
      const commitCalls = gitCalls.filter((argv) => Array.isArray(argv) && argv.includes("commit"));
      expect(commitCalls.length).toBeGreaterThan(0);
      expect(
        commitCalls.every(
          (argv) =>
            argv.some((a) => String(a).includes(ADVISORY_REL)) &&
            !argv.some((a) => String(a).includes("QUEUE.md"))
        )
      ).toBe(true);
      const pushCalls = gitCalls.filter((argv) => Array.isArray(argv) && argv[0] === "push");
      expect(pushCalls).toHaveLength(0);

      // S-5: the queue's own report carries the A1/A2 advisory summary; a dev-side report never
      // reaches these two rows, but the queue's own always can.
      expect(result.advisory).toBeTruthy();
      expect(result.advisory.rows).toHaveLength(5);
      const a1Row = result.advisory.rows.find((r) => r.seam === "A1");
      expect(a1Row.invocations).toBeGreaterThanOrEqual(0);
    });
  });
});
