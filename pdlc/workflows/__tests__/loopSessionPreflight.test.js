// loopSessionPreflight.test.js — PLAN P1-03 (red) / P1-04 (green).
//
// Preflight cases (TSPEC §3 "Preflight", §Interfaces `evaluatePreflight`):
// `conditions` is always length 2 with explicit `held` booleans (the
// positive conjunct AT-16/AT-12 need); under `"off"` a failing condition is
// downgraded to a `preflight-warning` notice carrying `startup.reason` and
// the injected `remediation` rather than a refusal; `versionMismatch` is
// surfaced only as a notice and never drives a refusal (AT-12); the
// `startup.notices` array is carried onto `PreflightResult.notices` rather
// than dropped; and the working-tree condition mirrors the caller-resolved
// `treeStatus` for both `dirtyTreePolicy` values (AT-13) — the git command
// choice itself (`--untracked-files=no` vs `--untracked-files=normal`) is
// the caller's concern (TSPEC "Working tree (BR-11)"), so this pure-module
// suite fixes `treeStatus` as that caller would have resolved it under each
// policy and asserts `evaluatePreflight` reports it faithfully.
//
// `evaluatePreflight` does not exist at P1-03 — it is P1-04's deliverable.
// Every block below is therefore committed `.skip`ped, titled "P1-04: ...",
// and un-skipped by P1-04.

import { LOOP_NOTICE_CODES } from "../lib/loop-session.mjs";

/** @returns {import("../lib/loop-session.mjs").PreflightInput} */
function baseInput(overrides = {}) {
  return {
    startup: {
      ok: true,
      reason: null,
      rungs: [],
      notices: [],
    },
    treeStatus: { ok: true, dirtyPaths: [] },
    policy: "strict",
    remediation: "Run `pdlc doctor --plugin-root <path>` or set the env var with --dev.",
    versionMismatch: { mismatched: false, detail: null },
    ...overrides,
  };
}

describe("evaluatePreflight — conditions shape (PLAN P1-03/P1-04, AT-16, AT-12)", () => {
  test("P1-04: conditions is always length 2, one entry per condition id, held is a boolean on each", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const result = evaluatePreflight(baseInput());

    expect(result.conditions).toHaveLength(2);
    const ids = result.conditions.map((c) => c.id).sort();
    expect(ids).toEqual(["engine-readiness", "working-tree"]);
    for (const condition of result.conditions) {
      expect(typeof condition.held).toBe("boolean");
    }
  });

  test("P1-04: both conditions hold on a clean, ready input — decision proceed", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const result = evaluatePreflight(baseInput());

    expect(result.decision).toBe("proceed");
    for (const condition of result.conditions) {
      expect(condition.held).toBe(true);
    }
  });
});

describe('evaluatePreflight — "off" downgrades a failure to a warning (PLAN P1-03/P1-04, AT-15a, AT-15b, E-19)', () => {
  test("P1-04: off + failing engine-readiness — condition reported failed, decision still proceed, warning names startup.reason and remediation", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const input = baseInput({
      policy: "off",
      startup: {
        ok: false,
        reason: "rung doctor (plugin-root): not found",
        rungs: [{ rung: "doctor", name: "plugin-root", state: "fail", detail: "not found" }],
        notices: [],
      },
    });

    const result = evaluatePreflight(input);

    const engineCondition = result.conditions.find((c) => c.id === "engine-readiness");
    expect(engineCondition.held).toBe(false);
    // The pure module never refuses on the engine's behalf — the shipped
    // `!startup.ok` refusal lives downstream in `cmdQueue`, unmodified
    // (TSPEC "Where the policy is applied", E-19).
    expect(result.decision).toBe("proceed");

    const warning = result.notices.find((n) => n.code === "preflight-warning" && n.subject === "engine-readiness");
    expect(warning).toBeDefined();
    expect(warning.text).toContain(input.startup.reason);
    expect(warning.text).toContain(input.remediation);
  });

  test("P1-04: off + failing working-tree — condition reported failed, decision proceed, iteration 1 proceeds (AT-15a)", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const input = baseInput({
      policy: "off",
      treeStatus: { ok: false, detail: "M pdlc/workflows/lib/loop-session.mjs" },
    });

    const result = evaluatePreflight(input);

    const treeCondition = result.conditions.find((c) => c.id === "working-tree");
    expect(treeCondition.held).toBe(false);
    expect(result.decision).toBe("proceed");

    const warning = result.notices.find((n) => n.code === "preflight-warning" && n.subject === "working-tree");
    expect(warning).toBeDefined();
    expect(warning.text).toContain(input.treeStatus.detail);
  });

  test("P1-04: strict + failing working-tree — decision refuse, condition reported failed (BR-11a)", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const input = baseInput({
      policy: "strict",
      treeStatus: { ok: false, detail: "M pdlc/workflows/lib/loop-session.mjs" },
    });

    const result = evaluatePreflight(input);

    const treeCondition = result.conditions.find((c) => c.id === "working-tree");
    expect(treeCondition.held).toBe(false);
    expect(result.decision).toBe("refuse");
  });

  test("P1-04: strict + failing engine-readiness — decision refuse, no warning (AT-11)", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const input = baseInput({
      policy: "strict",
      startup: {
        ok: false,
        reason: "rung doctor (plugin-root): not found",
        rungs: [{ rung: "doctor", name: "plugin-root", state: "fail", detail: "not found" }],
        notices: [],
      },
    });

    const result = evaluatePreflight(input);

    expect(result.decision).toBe("refuse");
    const warning = result.notices.find((n) => n.code === "preflight-warning");
    expect(warning).toBeUndefined();
  });
});

describe("evaluatePreflight — AT-16 vacuity control: off + both holding emits no warning", () => {
  test("P1-04: off + both conditions holding — no preflight-warning notice, both conditions positively recorded held", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const result = evaluatePreflight(baseInput({ policy: "off" }));

    expect(result.decision).toBe("proceed");
    for (const condition of result.conditions) {
      expect(condition.held).toBe(true);
    }
    const warnings = result.notices.filter((n) => n.code === "preflight-warning");
    expect(warnings).toHaveLength(0);
  });
});

describe("evaluatePreflight — versionMismatch is a notice, never a refusal (PLAN P1-03/P1-04, AT-12)", () => {
  test("P1-04: engine ok + version mismatch — engine-readiness held true, decision proceed, mismatch surfaced as a notice", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const input = baseInput({
      versionMismatch: { mismatched: true, detail: "session v0.9 vs engine v1.0" },
    });

    const result = evaluatePreflight(input);

    // The positive conjunct AT-12 needs: readiness is recorded as PASSED,
    // not merely absent-of-refusal.
    const engineCondition = result.conditions.find((c) => c.id === "engine-readiness");
    expect(engineCondition.held).toBe(true);
    expect(result.decision).toBe("proceed");

    expect(LOOP_NOTICE_CODES).toContain("engine-version-mismatch");
    const mismatchNotice = result.notices.find((n) => n.code === "engine-version-mismatch");
    expect(mismatchNotice).toBeDefined();
    expect(mismatchNotice.text).toContain(input.versionMismatch.detail);
  });

  test("P1-04: no version mismatch — no engine-version-mismatch notice emitted", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const result = evaluatePreflight(baseInput({ versionMismatch: { mismatched: false, detail: null } }));

    const mismatchNotice = result.notices.find((n) => n.code === "engine-version-mismatch");
    expect(mismatchNotice).toBeUndefined();
  });
});

describe("evaluatePreflight — startup.notices are re-emitted, not dropped (PLAN P1-03/P1-04)", () => {
  test("P1-04: string and {text} startup notices both re-emitted under preflight-warning", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const input = baseInput({
      startup: {
        ok: true,
        reason: null,
        rungs: [],
        notices: ["disk space low", { text: "cache stale" }],
      },
    });

    const result = evaluatePreflight(input);

    const carried = result.notices.filter((n) => n.code === "preflight-warning");
    const texts = carried.map((n) => n.text);
    expect(texts).toEqual(expect.arrayContaining(["disk space low", "cache stale"]));
  });

  test("P1-04: no startup notices — nothing carried, notices array stays as short as the other producers leave it", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const result = evaluatePreflight(baseInput({ startup: { ok: true, reason: null, rungs: [], notices: [] } }));

    expect(result.notices).toEqual([]);
  });
});

describe("evaluatePreflight — working-tree condition mirrors treeStatus for both dirtyTreePolicy values (PLAN P1-03/P1-04, AT-13, E-16/E-17)", () => {
  // The exact git command choice — `--untracked-files=no` under "tracked",
  // `--untracked-files=normal` under "any" — is the caller's concern
  // (TSPEC "Working tree (BR-11)"): `evaluatePreflight` only ever sees the
  // already-resolved `treeStatus`. These fixtures fix `treeStatus` as that
  // caller would have resolved it, per file, under each policy.

  test('P1-04: tracked file dirty — treeStatus.ok false as resolved by either policy — refuses under "strict"', async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    // A tracked file's uncommitted change shows under BOTH
    // `--untracked-files=no` and `--untracked-files=normal` — both
    // policies resolve treeStatus.ok to false.
    const result = evaluatePreflight(
      baseInput({ treeStatus: { ok: false, detail: "M pdlc/workflows/lib/loop-session.mjs" } }),
    );

    const treeCondition = result.conditions.find((c) => c.id === "working-tree");
    expect(treeCondition.held).toBe(false);
    expect(result.decision).toBe("refuse");
  });

  test('P1-04: untracked-only dirty — "tracked" policy resolves treeStatus.ok true, passes', async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    // `git status --porcelain --untracked-files=no` omits the untracked
    // file entirely, so the caller resolves treeStatus.ok true under the
    // default "tracked" policy.
    const result = evaluatePreflight(baseInput({ treeStatus: { ok: true, dirtyPaths: [] } }));

    const treeCondition = result.conditions.find((c) => c.id === "working-tree");
    expect(treeCondition.held).toBe(true);
    expect(result.decision).toBe("proceed");
  });

  test('P1-04: untracked-only dirty — "any" policy resolves treeStatus.ok false, refuses', async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    // `git status --porcelain --untracked-files=normal` lists the untracked
    // file, so the caller resolves treeStatus.ok false under "any".
    const result = evaluatePreflight(
      baseInput({ treeStatus: { ok: false, detail: "?? scratch.txt" } }),
    );

    const treeCondition = result.conditions.find((c) => c.id === "working-tree");
    expect(treeCondition.held).toBe(false);
    expect(result.decision).toBe("refuse");
  });

  test("P1-04: ignored-only dirty — treeStatus.ok true under either policy, by construction (git omits ignored files without --ignored)", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    const result = evaluatePreflight(baseInput({ treeStatus: { ok: true, dirtyPaths: [] } }));

    const treeCondition = result.conditions.find((c) => c.id === "working-tree");
    expect(treeCondition.held).toBe(true);
    expect(result.decision).toBe("proceed");
  });
});

describe("evaluatePreflight — each condition evaluated exactly once (PLAN P1-03/P1-04, AT-17)", () => {
  test("P1-04: exactly one engine-readiness and one working-tree entry, no duplicates, regardless of policy", async () => {
    const { evaluatePreflight } = await import("../lib/loop-session.mjs");

    for (const policy of ["strict", "off"]) {
      const result = evaluatePreflight(baseInput({ policy }));
      const engineEntries = result.conditions.filter((c) => c.id === "engine-readiness");
      const treeEntries = result.conditions.filter((c) => c.id === "working-tree");
      expect(engineEntries).toHaveLength(1);
      expect(treeEntries).toHaveLength(1);
    }
  });
});
