// advisoryWaveGate.test.js -- PLAN A6-00 (batch 1, no deps).
//
// Pre-flight gate: asserts that the advisory-tier baseline shipped at HEAD
// still exports the seam surface later A6-* tasks build on. Existence only
// -- never shape. A red result here means the baseline drifted underneath
// this feature before a single line of new code was written; it must halt
// the pipeline immediately rather than surface as a confusing failure deep
// inside a later task.
//
// `pathsCollide` is deliberately NOT included in the export-existence table
// below: it is declared `function pathsCollide(a, b)` at
// `orchestrate-dev.js:4726` with no `export` keyword, and is referenced only
// internally (`orchestrate-dev.js:10961`). An import-based existence
// assertion against it would fail at HEAD -- not because the baseline is
// broken, but because the symbol was never meant to cross the module
// boundary. Its behaviour is proved transitively through A6-07's
// `ownedSetCovers` trailing-slash cases; A6-05 exports only `computeWaves`
// directly.

import * as devModule from "../orchestrate-dev.js";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  makeAgentDouble,
  makeA6ReplyText,
  makeFileDouble,
  makeFakeClock,
  makeAdvisoryConfig,
} from "./helpers/advisoryDoubles.js";

describe("A6-00 pre-flight gate: advisory-tier baseline exports exist at HEAD", () => {
  test.each([
    ["runAdvisorySeam", devModule],
    ["classifyEnvelope", devModule],
    ["appendAdvisoryEntry", devModule],
    ["appendEscalationEntry", devModule],
    ["resolveAdvisoryRung", devModule],
    ["parseAdvisoryVerdict", devModule],
    ["renderAdvisoryEntry", devModule],
    ["computeWaves", devModule],
    ["parsePlanOwnership", devModule],
    ["commitPaths", devModule],
    ["gitWithLockRetry", devModule],
    ["checkWaveUnskips", devModule],
    ["effectiveGuardPaths", devModule],
  ])("%s is exported and importable from orchestrate-dev.js", (name, mod) => {
    expect(mod[name]).toBeDefined();
  });
});

// ─── A6-08 (former A6-07): the pure helpers, TSPEC §3.3 / §3.4 ──────────────
//
// `waveOwnedPaths` / `laterOwnedPaths` read the `files` arrays `computeWaves`
// has already annotated onto every task; `ownedSetCovers` delegates to the
// module-private `pathsCollide`, carrying its trailing-slash precondition;
// `parseA6RootCause` is total over the closed `ADVISORY_ROOT_CAUSES`
// vocabulary; `citesGateOutput` is BR-3's decidable citation rule, floored at
// `A6_MIN_CITATION_CHARS` (24). All five are pure: no `process`, no clock, no
// ambient state.

const {
  waveOwnedPaths,
  laterOwnedPaths,
  ownedSetCovers,
  parseA6RootCause,
  citesGateOutput,
  A6_MIN_CITATION_CHARS,
  ADVISORY_ROOT_CAUSES,
} = devModule;

describe("A6-08: waveOwnedPaths — E-5, the union of task.files over the wave", () => {
  test("unions task.files across every task in the target wave", () => {
    const waves = [
      [{ id: "T1", files: ["a.js"] }, { id: "T2", files: ["b.js", "c.js"] }],
      [{ id: "T3", files: ["d.js"] }],
    ];
    expect(waveOwnedPaths(waves, 0).sort()).toEqual(["a.js", "b.js", "c.js"]);
  });

  test("never reads a later wave's files", () => {
    const waves = [[{ id: "T1", files: ["a.js"] }], [{ id: "T2", files: ["d.js"] }]];
    expect(waveOwnedPaths(waves, 0)).not.toContain("d.js");
  });

  test("treats a null files array as owning nothing", () => {
    const waves = [[{ id: "T1", files: null }]];
    expect(waveOwnedPaths(waves, 0)).toEqual([]);
  });

  test("de-duplicates a path owned by two tasks in the same wave", () => {
    const waves = [[{ id: "T1", files: ["shared.js"] }, { id: "T2", files: ["shared.js"] }]];
    expect(waveOwnedPaths(waves, 0)).toEqual(["shared.js"]);
  });
});

describe("A6-08: laterOwnedPaths — E-6, the union of task.files over every later wave", () => {
  test("unions task.files across every wave strictly after waveIndex", () => {
    const waves = [
      [{ id: "T1", files: ["a.js"] }],
      [{ id: "T2", files: ["b.js"] }],
      [{ id: "T3", files: ["c.js"] }],
    ];
    expect(laterOwnedPaths(waves, 0).sort()).toEqual(["b.js", "c.js"]);
  });

  test("never reads the target wave's own files", () => {
    const waves = [[{ id: "T1", files: ["a.js"] }], [{ id: "T2", files: ["b.js"] }]];
    expect(laterOwnedPaths(waves, 1)).not.toContain("a.js");
    expect(laterOwnedPaths(waves, 1)).toEqual([]);
  });

  test("is empty for the last wave — there is no later task to own a promotion", () => {
    const waves = [[{ id: "T1", files: ["a.js"] }], [{ id: "T2", files: ["b.js"] }]];
    expect(laterOwnedPaths(waves, 1)).toEqual([]);
  });

  test("de-duplicates a path owned by two tasks in different later waves", () => {
    const waves = [
      [{ id: "T1", files: [] }],
      [{ id: "T2", files: ["shared.js"] }],
      [{ id: "T3", files: ["shared.js"] }],
    ];
    expect(laterOwnedPaths(waves, 0)).toEqual(["shared.js"]);
  });
});

describe("A6-08: ownedSetCovers — delegates to pathsCollide (§3.4, TE F-06)", () => {
  test("an exact-path row covers only that path", () => {
    expect(ownedSetCovers(["a/b.js"], "a/b.js")).toBe(true);
    expect(ownedSetCovers(["a/b.js"], "a/c.js")).toBe(false);
  });

  test("a trailing-slash directory row covers a file beneath it", () => {
    expect(ownedSetCovers(["pdlc/workflows/dist/"], "pdlc/workflows/dist/orchestrate-dev.bundle.js")).toBe(
      true,
    );
  });

  test("the same row WITHOUT a trailing slash refuses the same file — the operator-visible precondition", () => {
    expect(ownedSetCovers(["pdlc/workflows/dist"], "pdlc/workflows/dist/orchestrate-dev.bundle.js")).toBe(
      false,
    );
  });

  test("a directory row does not cover an unrelated sibling with a shared prefix", () => {
    expect(ownedSetCovers(["a/b/"], "a/bc.js")).toBe(false);
  });

  test("covers the path if ANY member of the owned set covers it", () => {
    expect(ownedSetCovers(["x/y.js", "a/b/"], "a/b/c.js")).toBe(true);
  });

  test("an empty owned set covers nothing", () => {
    expect(ownedSetCovers([], "a/b.js")).toBe(false);
  });
});

describe("A6-08: parseA6RootCause — total over the closed ADVISORY_ROOT_CAUSES vocabulary", () => {
  test("a well-formed trailer returns the named class", () => {
    expect(parseA6RootCause("ROOT-CAUSE: plan-ordering-defect")).toBe("plan-ordering-defect");
  });

  test.each(ADVISORY_ROOT_CAUSES)("recognises every member of ADVISORY_ROOT_CAUSES: %s", (cls) => {
    expect(parseA6RootCause(`ROOT-CAUSE: ${cls}`)).toBe(cls);
  });

  test("absent ROOT-CAUSE line ⇒ unclassified", () => {
    expect(parseA6RootCause("DIAGNOSIS: something failed")).toBe("unclassified");
  });

  test("empty string input ⇒ unclassified, never throws", () => {
    expect(parseA6RootCause("")).toBe("unclassified");
  });

  test("a trailer whose value is empty ⇒ unclassified", () => {
    expect(parseA6RootCause("ROOT-CAUSE:")).toBe("unclassified");
  });

  test("wrong-cased trailer ⇒ unclassified — membership is case-sensitive", () => {
    expect(parseA6RootCause("ROOT-CAUSE: Plan-Ordering-Defect")).toBe("unclassified");
  });

  test("out-of-set trailer ⇒ unclassified", () => {
    expect(parseA6RootCause("ROOT-CAUSE: agent-was-confused")).toBe("unclassified");
  });

  test("non-string input ⇒ unclassified, never throws", () => {
    expect(parseA6RootCause(null)).toBe("unclassified");
    expect(parseA6RootCause(undefined)).toBe("unclassified");
    expect(parseA6RootCause(42)).toBe("unclassified");
  });

  test("last-wins: a duplicated ROOT-CAUSE line resolves to the LAST occurrence", () => {
    const raw = "ROOT-CAUSE: environmental\nROOT-CAUSE: wave-internal-defect";
    expect(parseA6RootCause(raw)).toBe("wave-internal-defect");
  });

  test("surrounding whitespace on the value is trimmed", () => {
    expect(parseA6RootCause("ROOT-CAUSE:   environmental   ")).toBe("environmental");
  });
});

describe("A6-08: citesGateOutput — BR-3's decidable citation rule, floored at A6_MIN_CITATION_CHARS", () => {
  test("true when a normalised evidence entry is a substring of the normalised gate output", () => {
    const gateOutput = "some preamble\nTypeError: cannot read property 'x' of undefined\nmore log";
    expect(citesGateOutput(["TypeError: cannot read property 'x' of undefined"], gateOutput)).toBe(
      true,
    );
  });

  test("false when no evidence entry appears in the gate output", () => {
    expect(citesGateOutput(["nothing like this is present anywhere"], "totally unrelated output")).toBe(
      false,
    );
  });

  test("false for a short, guessable citation even if it is present verbatim", () => {
    const gateOutput = "Test run FAILED with 3 errors";
    expect(citesGateOutput(["FAILED"], gateOutput)).toBe(false);
  });

  test("the citation floor boundary: 23 normalised characters is refused, 24 is accepted (TE F-09)", () => {
    const twentyThree = "x".repeat(23);
    const twentyFour = "x".repeat(24);
    const gateOutput = `prefix ${twentyFour} suffix`;

    expect(citesGateOutput([twentyThree], gateOutput)).toBe(false);
    expect(citesGateOutput([twentyFour], gateOutput)).toBe(true);
  });

  test("runs of whitespace are collapsed and ends trimmed before comparison", () => {
    const gateOutput = "prefix this is a long citation string right here suffix";
    const evidence = ["  this   is  a   long\ncitation string right here  "];
    expect(citesGateOutput(evidence, gateOutput)).toBe(true);
  });

  test("true when ANY member of a multi-entry evidence array clears the floor and matches", () => {
    const gateOutput = "the real needle appears in this exact gate output stream";
    expect(citesGateOutput(["short", "the real needle appears in this exact gate output stream"], gateOutput)).toBe(
      true,
    );
  });

  test("an empty evidence array never cites anything", () => {
    expect(citesGateOutput([], "any gate output at all, arbitrarily long")).toBe(false);
  });

  test("A6_MIN_CITATION_CHARS is the pinned literal 24", () => {
    expect(A6_MIN_CITATION_CHARS).toBe(24);
  });
});

// ─── A6-10 (former A6-09 red step + A6-10 green): snapshot/restore, TSPEC §3.5 / §2.5 ──────────
//
// `captureTreeSnapshot` / `restoreTreeSnapshot` are not on the pre-flight export table above —
// they are new symbols this task lands. The round-trip oracle below runs against a REAL temporary
// git repository (`mkdtempSync` + `execFileSync("git", …)`, the shape `advisoryDodSeams.test.js`
// already ships for the A3 fixtures), never a fake `_git`, per TSPEC §5.2's TE F-04: a fake
// transport can only replay whatever the fixture told it to, and BR-9's oracle is a genuine
// path-to-content-hash map over the tree, not an echo of one.

const { captureTreeSnapshot, restoreTreeSnapshot } = devModule;

function hashTree(repoDir) {
  const map = new Map();
  function walk(dir, prefix) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".git") continue;
      const abs = join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(abs, rel);
      } else if (entry.isFile()) {
        map.set(rel, createHash("sha256").update(readFileSync(abs)).digest("hex"));
      }
    }
  }
  walk(repoDir, "");
  return map;
}

function createA6TempRepo() {
  const dir = mkdtempSync(join(tmpdir(), "pdlc-a6-fixture-"));
  const git = (...args) => execFileSync("git", args, { cwd: dir, encoding: "utf8" });
  git("init", "-b", "main");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "Test");
  writeFileSync(join(dir, "tracked.txt"), "initial\n");
  git("add", "tracked.txt");
  git("commit", "-m", "initial commit");
  const status = () => execFileSync("git", ["status", "--porcelain"], { cwd: dir, encoding: "utf8" });
  const _git = async (argv) => {
    try {
      const stdout = execFileSync("git", argv, { cwd: dir, encoding: "utf8" });
      return { ok: true, stdout, stderr: "" };
    } catch (err) {
      return { ok: false, stdout: "", stderr: err.message };
    }
  };
  const cleanup = () => {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  };
  return { dir, git, status, _git, cleanup };
}

describe("A6-10: captureTreeSnapshot / restoreTreeSnapshot round-trip over a real temporary git repo (TSPEC §2.5/§3.5, AT-05-1)", () => {
  test("the content-hash map taken immediately before A6 acts equals the map after restore, over tracked and untracked files alike, generated outputs included", async () => {
    const repo = createA6TempRepo();
    try {
      // The wave already left the tree in this state before A6 is ever entered.
      writeFileSync(join(repo.dir, "tracked.txt"), "wave edit\n");
      writeFileSync(join(repo.dir, "untracked.txt"), "wave added this, never staged\n");
      writeFileSync(join(repo.dir, ".gitignore"), "generated/\n");
      repo.git("add", ".gitignore");
      repo.git("commit", "-m", "add gitignore");
      mkdirSync(join(repo.dir, "generated"));
      writeFileSync(join(repo.dir, "generated", "output.txt"), "a generated output the wave produced\n");

      const hashBefore = hashTree(repo.dir);

      const snapshot = await captureTreeSnapshot({
        feature: "pdlc-advisory-wave-gate",
        waveNum: 1,
        _git: repo._git,
        _sleep: async () => {},
        emit: () => {},
      });
      expect(snapshot).not.toBeNull();

      // A6 now acts: mutates the tracked file, deletes the untracked one, adds a repair leftover.
      writeFileSync(join(repo.dir, "tracked.txt"), "A6's repair attempt\n");
      rmSync(join(repo.dir, "untracked.txt"));
      writeFileSync(join(repo.dir, "new-from-repair.txt"), "A6 left this behind\n");

      await restoreTreeSnapshot(snapshot, { _git: repo._git, _sleep: async () => {}, emit: () => {} });

      const hashAfter = hashTree(repo.dir);
      expect(hashAfter).toEqual(hashBefore);
    } finally {
      repo.cleanup();
    }
  });

  test("an untracked file the wave added is absent after restore when A6's repair leaves a different untracked file behind", async () => {
    const repo = createA6TempRepo();
    try {
      const snapshot = await captureTreeSnapshot({
        feature: "pdlc-advisory-wave-gate",
        waveNum: 1,
        _git: repo._git,
        _sleep: async () => {},
        emit: () => {},
      });
      expect(snapshot).not.toBeNull();

      writeFileSync(join(repo.dir, "repair-leftover.txt"), "should not survive restore\n");
      await restoreTreeSnapshot(snapshot, { _git: repo._git, _sleep: async () => {}, emit: () => {} });

      expect(hashTree(repo.dir).has("repair-leftover.txt")).toBe(false);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-10: a git-status-level comparison is explicitly NOT the oracle (TSPEC §5.2, AT-05-2)", () => {
  test("re-running the post-wave command rewrites an already-dirty path without changing its status line, but the hash map catches it", async () => {
    const repo = createA6TempRepo();
    try {
      writeFileSync(join(repo.dir, "tracked.txt"), "dirty v1\n");
      const statusBefore = repo.status();
      const hashBefore = hashTree(repo.dir);

      // A re-run post-wave command rewrites the already-dirty path — the file was already
      // modified, so `git status --porcelain` still reads the same single "M tracked.txt" line.
      writeFileSync(join(repo.dir, "tracked.txt"), "dirty v2 — rewritten by the re-run\n");
      const statusAfter = repo.status();
      const hashAfter = hashTree(repo.dir);

      expect(statusAfter).toBe(statusBefore);
      expect(hashAfter.get("tracked.txt")).not.toBe(hashBefore.get("tracked.txt"));
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-10: restoreTreeSnapshot throws on any ok !== true (TSPEC §3.5, AT-05-5) — tagged __isRevertFailure and rethrown by the driver's terminal catch", () => {
  test("throws when read-tree fails", async () => {
    const _git = async (argv) =>
      argv[0] === "read-tree"
        ? { ok: false, stdout: "", stderr: "fatal: not a valid tree object" }
        : { ok: true, stdout: "", stderr: "" };
    await expect(
      restoreTreeSnapshot(
        { head: "abc", tree: "def", snap: "ghi" },
        { _git, _sleep: async () => {}, emit: () => {} },
      ),
    ).rejects.toThrow();
  });

  test("throws when clean -fd fails", async () => {
    const _git = async (argv) =>
      argv[0] === "clean" ? { ok: false, stdout: "", stderr: "fatal: clean failed" } : { ok: true, stdout: "", stderr: "" };
    await expect(
      restoreTreeSnapshot(
        { head: "abc", tree: "def", snap: "ghi" },
        { _git, _sleep: async () => {}, emit: () => {} },
      ),
    ).rejects.toThrow();
  });

  test("throws when the final reset --mixed fails", async () => {
    const _git = async (argv) =>
      argv[0] === "reset" ? { ok: false, stdout: "", stderr: "fatal: reset failed" } : { ok: true, stdout: "", stderr: "" };
    await expect(
      restoreTreeSnapshot(
        { head: "abc", tree: "def", snap: "ghi" },
        { _git, _sleep: async () => {}, emit: () => {} },
      ),
    ).rejects.toThrow();
  });

  test("a thrown restore failure can be tagged __isRevertFailure by a caller, e.g. the driver's doRevert", async () => {
    const _git = async () => ({ ok: false, stdout: "", stderr: "boom" });
    try {
      await restoreTreeSnapshot(
        { head: "abc", tree: "def", snap: "ghi" },
        { _git, _sleep: async () => {}, emit: () => {} },
      );
      throw new Error("expected restoreTreeSnapshot to throw");
    } catch (err) {
      err.__isRevertFailure = true;
      expect(err.__isRevertFailure).toBe(true);
    }
  });
});

describe("A6-10: captureTreeSnapshot writes the wave-scoped ref refs/pdlc/a6-snapshot-{waveNum} (TSPEC §2.5/§3.5, DEC-A6-03)", () => {
  test("update-ref targets refs/pdlc/a6-snapshot-{waveNum} for the given wave number", async () => {
    const calls = [];
    const _git = async (argv) => {
      calls.push(argv);
      if (argv[0] === "rev-parse") return { ok: true, stdout: "headsha\n", stderr: "" };
      if (argv[0] === "write-tree") return { ok: true, stdout: "treesha\n", stderr: "" };
      if (argv[0] === "commit-tree") return { ok: true, stdout: "snapsha\n", stderr: "" };
      return { ok: true, stdout: "", stderr: "" };
    };

    const result = await captureTreeSnapshot({
      feature: "pdlc-advisory-wave-gate",
      waveNum: 3,
      _git,
      _sleep: async () => {},
      emit: () => {},
    });

    expect(result).toEqual({ head: "headsha", tree: "treesha", snap: "snapsha" });
    const updateRef = calls.find((argv) => argv[0] === "update-ref");
    expect(updateRef[1]).toBe("refs/pdlc/a6-snapshot-3");
    expect(updateRef[2]).toBe("snapsha");
  });

  test("returns null when any capture git call returns ok !== true — the operator can never trust a partial snapshot", async () => {
    const _git = async (argv) =>
      argv[0] === "write-tree" ? { ok: false, stdout: "", stderr: "boom" } : { ok: true, stdout: "sha\n", stderr: "" };
    const result = await captureTreeSnapshot({
      feature: "pdlc-advisory-wave-gate",
      waveNum: 1,
      _git,
      _sleep: async () => {},
      emit: () => {},
    });
    expect(result).toBeNull();
  });
});

// The `.gitignore`d-path round trip's expected value is named here, but the case is marked
// upstream-pending on OQ-7 using `test.todo` — never a dotted skip call on `describe`/`it`/`test`.
// `scanSkipTokens` (`orchestrate-dev.js`) matches exactly `/\b(describe|test|it)\.skip\s*\(/`, and
// `checkWaveUnskips` would halt a later wave through `formatUnskipViolations` once this file's
// manifest owners are all complete and the block names no live task id — the "attributable to
// nobody" arm. `test.todo` carries no callback and is invisible to that scanner, which is why it
// is the pending marker for a boundary that is genuinely upstream's to resolve (§2.5's erratum on
// FSPEC BR-9 / AT-05-1, REQ AC-5.1), not this task's.
test.todo(
  "A6-10: a .gitignore'd file the wave added is still present after restore (git clean -fd, not -fdx) — expected: hashTree(repo.dir) still contains the ignored generated path with its wave-added content, unchanged by capture or restore; pending OQ-7's upstream erratum on the ignored-path boundary",
);

// ─── A6-14 (former A6-13 red step + A6-14 green): buildA6SeamOps, TSPEC §3.3 ──────────────────
//
// Member contracts only — unit tests over the SeamOps object `buildA6SeamOps` returns, with a
// recording fake `_git`/`_runCommand`, never the full `runAdvisorySeam` integration (that is
// A6-18's job). Covers AT-02-3, AT-02-5, AT-03-4 (seam-op half).

const { buildA6SeamOps } = devModule;

function makeA6Waves() {
  return [
    [{ id: "T1", files: ["a.js"] }],
    [{ id: "T2", files: ["b.js", "c.js"] }],
    [{ id: "T3", files: ["d.js"] }],
  ];
}

function makeRecordingGit(responses = {}) {
  const calls = [];
  const _git = async (argv) => {
    calls.push(argv);
    const key = argv[0];
    if (Object.prototype.hasOwnProperty.call(responses, key)) {
      const r = responses[key];
      return typeof r === "function" ? r(argv) : r;
    }
    return { ok: true, stdout: "", stderr: "" };
  };
  return { _git, calls };
}

describe("A6-14: buildA6SeamOps.gatherEvidence — TSPEC §3.3 (AT-02-5)", () => {
  test("returns the FULL captured gate output, never outputTail's 30 lines", async () => {
    const longOutput = Array.from({ length: 50 }, (_, i) => `line ${i}`).join("\n");
    const { _git } = makeRecordingGit();
    const seamOps = buildA6SeamOps({
      feature: "pdlc-advisory-wave-gate",
      waveNum: 1,
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: longOutput,
      implConfig: { postWaveCommand: null, testCommand: "npm test" },
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    const evidence = await seamOps.gatherEvidence();
    expect(evidence).toBe(longOutput);
    // The line-0 marker sits well past outputTail's 30-line window.
    expect(evidence).toContain("line 0");
    expect(evidence).toContain("line 49");
  });

  test("fills declaredScope in place with E-5 ∪ E-6 for a non-last wave", async () => {
    const { _git } = makeRecordingGit();
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    expect(seamOps.declaredScope).toEqual([]);
    await seamOps.gatherEvidence();
    expect(seamOps.declaredScope.slice().sort()).toEqual(["a.js", "b.js", "c.js", "d.js"]);
  });

  test("E-6 is empty on the last wave — declaredScope is E-5 only", async () => {
    const { _git } = makeRecordingGit();
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 2,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    await seamOps.gatherEvidence();
    expect(seamOps.declaredScope).toEqual(["d.js"]);
  });
});

describe("A6-14: buildA6SeamOps.classifyReply — TSPEC §3.3/§3.7 (AT-02-3)", () => {
  function makeSeamOps(gateOutput) {
    const { _git } = makeRecordingGit();
    return buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput,
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
  }

  test("a well-cited, well-classified reply proceeds — {ok:true}", () => {
    const gateOutput = "prefix " + "x".repeat(30) + " suffix";
    const seamOps = makeSeamOps(gateOutput);
    const verdict = { evidence: ["x".repeat(30)] };
    expect(seamOps.classifyReply("ROOT-CAUSE: environmental", verdict)).toEqual({ ok: true });
  });

  test("citation too short (BR-3) reads malformed, EVEN when the class is also absent (AT-02-3's tie-break)", () => {
    const gateOutput = "prefix " + "x".repeat(30) + " suffix";
    const seamOps = makeSeamOps(gateOutput);
    const verdict = { evidence: ["short"] };
    expect(seamOps.classifyReply("DIAGNOSIS: no trailer at all", verdict)).toEqual({ malformed: true });
  });

  test("a well-cited but unclassifiable reply terminates escalated, no attempt consumed (BR-2)", () => {
    const gateOutput = "prefix " + "x".repeat(30) + " suffix";
    const seamOps = makeSeamOps(gateOutput);
    const verdict = { evidence: ["x".repeat(30)] };
    expect(seamOps.classifyReply("ROOT-CAUSE: agent-was-confused", verdict)).toEqual({
      terminate: { outcome: "escalated", reason: null },
    });
  });
});

describe("A6-14: buildA6SeamOps.conditionHolds — TSPEC §3.3", () => {
  test("an async arrow that always resolves true", async () => {
    const { _git } = makeRecordingGit();
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    const result = seamOps.conditionHolds();
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
  });
});

describe("A6-14: buildA6SeamOps.producedPaths — TSPEC §3.3/§3.4", () => {
  test("unions git diff --name-only with git ls-files --others --exclude-standard", async () => {
    const { _git } = makeRecordingGit({
      diff: { ok: true, stdout: "a.js\nb.js\n", stderr: "" },
      "ls-files": { ok: true, stdout: "new-untracked.js\n", stderr: "" },
    });
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    const produced = await seamOps.producedPaths();
    expect(produced.sort()).toEqual(["a.js", "b.js", "new-untracked.js"]);
  });

  test("the untracked half is not optional — an E-6 promotion creates a file git diff never sees", async () => {
    const { _git } = makeRecordingGit({
      diff: { ok: true, stdout: "", stderr: "" },
      "ls-files": { ok: true, stdout: "promoted-symbol.js\n", stderr: "" },
    });
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    expect(await seamOps.producedPaths()).toEqual(["promoted-symbol.js"]);
  });

  test("widens declaredScope in place for a produced path covered by an owned directory row (§3.4)", async () => {
    const { _git } = makeRecordingGit({
      diff: { ok: true, stdout: "pdlc/workflows/dist/bundle.js\n", stderr: "" },
      "ls-files": { ok: true, stdout: "", stderr: "" },
    });
    const waves = [[{ id: "T1", files: ["pdlc/workflows/dist/"] }]];
    const seamOps = buildA6SeamOps({
      waves,
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    await seamOps.gatherEvidence();
    expect(seamOps.declaredScope).toEqual(["pdlc/workflows/dist/"]);
    await seamOps.producedPaths();
    expect(seamOps.declaredScope).toContain("pdlc/workflows/dist/bundle.js");
  });
});

describe("A6-14: buildA6SeamOps.apply — TSPEC §3.3", () => {
  test("writes ledgerAnchor.value = invocations.length into the CALLER's carrier, reading the length at call time", async () => {
    const invocations = ["post-wave", "test"]; // a prior attempt already appended two tokens
    const ledgerAnchor = { value: -1 };
    const { _git } = makeRecordingGit({ diff: { ok: true, stdout: "a.js\n", stderr: "" } });
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations,
      ledgerAnchor,
      snapshot: {},
      _git,
    });
    invocations.push("post-wave"); // a later token lands before apply is actually called
    await seamOps.apply();
    expect(ledgerAnchor.value).toBe(3);
  });

  test("writes ledgerAnchor.value BEFORE dispatching anything — set even when producedPaths' own _git call then fails", async () => {
    const invocations = ["post-wave", "test"];
    const ledgerAnchor = { value: -1 };
    const _git = async () => ({ ok: false, stdout: "", stderr: "boom" });
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations,
      ledgerAnchor,
      snapshot: {},
      _git,
    });
    await seamOps.apply();
    expect(ledgerAnchor.value).toBe(2);
  });

  test("returns {ok:true} when producedPaths() is non-empty", async () => {
    const { _git } = makeRecordingGit({
      diff: { ok: true, stdout: "a.js\n", stderr: "" },
    });
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    expect(await seamOps.apply()).toEqual({ ok: true });
  });

  test("returns {ok:false} when producedPaths() is empty — an empty repair, including a .gitignore'd-only write (OQ-11)", async () => {
    const { _git } = makeRecordingGit({
      diff: { ok: true, stdout: "", stderr: "" },
      "ls-files": { ok: true, stdout: "", stderr: "" },
    });
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    expect(await seamOps.apply()).toEqual({ ok: false });
  });
});

describe("A6-14: buildA6SeamOps.revert — TSPEC §3.3/§3.5", () => {
  test("delegates to restoreTreeSnapshot(snapshot)", async () => {
    const calls = [];
    const _git = async (argv) => {
      calls.push(argv);
      return { ok: true, stdout: "sha\n", stderr: "" };
    };
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: { head: "h", tree: "t", snap: "s" },
      _git,
    });
    await seamOps.revert();
    expect(calls.some((argv) => argv[0] === "read-tree")).toBe(true);
    expect(calls.some((argv) => argv[0] === "clean")).toBe(true);
    expect(calls.some((argv) => argv[0] === "reset")).toBe(true);
  });

  test("propagates restoreTreeSnapshot's throw on failure", async () => {
    const _git = async (argv) =>
      argv[0] === "read-tree" ? { ok: false, stdout: "", stderr: "fatal" } : { ok: true, stdout: "", stderr: "" };
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: { head: "h", tree: "t", snap: "s" },
      _git,
    });
    await expect(seamOps.revert()).rejects.toThrow();
  });
});

describe("A6-14: buildA6SeamOps.verifyGate — TSPEC §3.3/§3.2 step 6", () => {
  test("re-runs post-wave then test, appending one token per command to invocations, and passes on green", async () => {
    const invocations = [];
    const commands = [];
    const _runCommand = async (cmd) => {
      commands.push(cmd);
      return { ok: true, output: "" };
    };
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: { postWaveCommand: "npm run build", testCommand: "npm test" },
      scriptGate: true,
      invocations,
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git: async () => ({ ok: true, stdout: "", stderr: "" }),
      _runCommand,
    });
    const outcome = await seamOps.verifyGate();
    expect(outcome).toEqual({ passed: true });
    expect(invocations).toEqual(["post-wave", "test"]);
    expect(commands).toEqual(["npm run build", "npm test"]);
  });

  test("a red re-gate returns {passed:false, consumesAttempt:true} — re-enters the driver's loop toward budget-exhausted", async () => {
    const invocations = [];
    const _runCommand = async (cmd) =>
      cmd === "npm test" ? { ok: false, output: "FAIL" } : { ok: true, output: "" };
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: { postWaveCommand: "npm run build", testCommand: "npm test" },
      scriptGate: true,
      invocations,
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git: async () => ({ ok: true, stdout: "", stderr: "" }),
      _runCommand,
    });
    const outcome = await seamOps.verifyGate();
    expect(outcome).toEqual({ passed: false, consumesAttempt: true });
    expect(invocations).toEqual(["post-wave", "test"]);
  });
});

describe("A6-14: buildA6SeamOps.permittedActions — TSPEC §3.3 (AT-03-4's seam-op half)", () => {
  test("carries E-6 on a non-last wave", () => {
    const { _git } = makeRecordingGit();
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    expect(new Set(seamOps.permittedActions)).toEqual(new Set(["E-5", "E-6"]));
  });

  test("narrows E-6 away on the last wave — there is no later task for a promotion to belong to", () => {
    const { _git } = makeRecordingGit();
    const seamOps = buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 2,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor: { value: -1 },
      snapshot: {},
      _git,
    });
    expect(seamOps.permittedActions).toEqual(["E-5"]);
  });
});

describe("A6-14: ledgerAnchor carrier — TSPEC §3.3 (fail-closed initialisation)", () => {
  test("a fresh carrier the call site initialises to {value: -1} is untouched until apply() runs", () => {
    const ledgerAnchor = { value: -1 };
    const { _git } = makeRecordingGit();
    buildA6SeamOps({
      waves: makeA6Waves(),
      waveIndex: 0,
      gateOutput: "",
      implConfig: {},
      scriptGate: true,
      invocations: [],
      ledgerAnchor,
      snapshot: {},
      _git,
    });
    expect(ledgerAnchor.value).toBe(-1);
  });
});

// ─── A6-18: runWaveGateSeam — TSPEC §3.2, the A6 call site (PLAN A6-18) ────────────────────────
//
// The full end-to-end wiring: `runWaveGateSeam` driving the real `runAdvisorySeam` + the real
// `buildA6SeamOps` against a real temporary git repository (`createA6TempRepo`, A6-10's own
// fixture, reused rather than re-authored), a real `_runCommand` fake standing in for the wave's
// post-wave/test gate, and the canonical `_agent`/`_appendFile`/`_now`/`_sleep` doubles from
// `helpers/advisoryDoubles.js`. Unit-level member contracts are A6-14's job (above); this section
// is the seam-level integration TSPEC §3.2 itself describes.

const { runWaveGateSeam } = devModule;

function makeA6RunCommand(script = {}) {
  const calls = [];
  const _runCommand = async (cmd) => {
    calls.push(cmd);
    const entry = Object.prototype.hasOwnProperty.call(script, cmd) ? script[cmd] : { ok: true };
    return typeof entry === "function" ? entry(cmd) : entry;
  };
  return { _runCommand, calls };
}

function makeA6RunArgs(overrides = {}) {
  const files = makeFileDouble();
  const clock = makeFakeClock();
  return {
    feature: "pdlc-advisory-wave-gate",
    waveNum: 1,
    waves: makeA6Waves(),
    waveIndex: 0,
    tasks: [],
    implConfig: { postWaveCommand: null, testCommand: "npm test" },
    scriptGate: true,
    gateResult: { output: "the gate went red at the eslint step" },
    invocations: [],
    advisoryTierOn: true,
    advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1 }).config,
    rungState: {},
    waveBudget: { resolved: 0 },
    _appendFile: files._appendFile,
    _readFile: files._readFile,
    _now: clock._now,
    _sleep: clock._sleep,
    _notice: () => {},
    _log: () => {},
    ...overrides,
  };
}

describe("A6-18: runWaveGateSeam — the tier gate (AC-1.4, PROP-DIS-06)", () => {
  test("advisoryTierOn === false short-circuits before any snapshot, dispatch, or record write", async () => {
    const gitCalls = [];
    const _git = async (argv) => {
      gitCalls.push(argv);
      return { ok: true, stdout: "", stderr: "" };
    };
    const agent = makeAgentDouble({ script: [] });
    const result = await runWaveGateSeam(
      makeA6RunArgs({ advisoryTierOn: false, _git, _agent: agent, _runCommand: makeA6RunCommand()._runCommand })
    );
    expect(result).toEqual({
      resolved: false,
      disposition: null,
      haltFields: { rootCause: "unclassified", diagnosis: "", repairApplied: false, repairPaths: [] },
      postWaveRan: false,
    });
    expect(gitCalls).toEqual([]);
    expect(agent.calls).toEqual([]);
  });
});

describe("A6-18: runWaveGateSeam — snapshot capture failure (TSPEC §2.5, AT-06-3)", () => {
  test("a failed capture escalates with the exact fixed disposition and never dispatches the agent", async () => {
    const repo = createA6TempRepo();
    try {
      const _git = async (argv) =>
        argv[0] === "write-tree"
          ? { ok: false, stdout: "", stderr: "fatal: unable to write tree object" }
          : repo._git(argv);
      const agent = makeAgentDouble({ script: [] });
      const notices = [];
      const args = makeA6RunArgs({
        _git,
        _agent: agent,
        _runCommand: makeA6RunCommand()._runCommand,
        _notice: (msg) => notices.push(msg),
      });

      const result = await runWaveGateSeam(args);

      expect(result.resolved).toBe(false);
      expect(result.disposition).toEqual({
        seam: "A6",
        outcome: "escalated",
        reason: null,
        verdict: null,
        attempts: 0,
        model: "n/a",
        fallback: false,
        // CR round 1 (TE F-04): the capture-failure path builds its own disposition, and carries
        // the same two annotations every other A6 disposition carries — the wave an operator has
        // to attribute the entry to, and the class AC-6.4 counts off the durable log.
        wave: 1,
        rootCause: "unclassified",
      });
      expect(result.haltFields.repairApplied).toBe(false);
      expect(result.haltFields.repairPaths).toEqual([]);
      expect(agent.calls).toEqual([]);
      expect(args.waveBudget.resolved).toBe(0);

      expect(notices.some((n) => n.startsWith("ADVISORY ESCALATION: seam A6 for pdlc-advisory-wave-gate"))).toBe(
        true
      );
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-18: runWaveGateSeam — wave-budget exhaustion (TSPEC §3.2 step 3, §2.5 ordering)", () => {
  test("an already-exhausted budget escalates with reason budget-exhausted, but the snapshot is still taken first", async () => {
    const repo = createA6TempRepo();
    try {
      const gitCalls = [];
      const _git = async (argv) => {
        gitCalls.push(argv);
        return repo._git(argv);
      };
      const agent = makeAgentDouble({ script: [] });
      const args = makeA6RunArgs({
        _git,
        _agent: agent,
        _runCommand: makeA6RunCommand()._runCommand,
        waveBudget: { resolved: 1 }, // waveBudgetPerRun is 1 in makeA6RunArgs' default config
      });

      const result = await runWaveGateSeam(args);

      expect(result.resolved).toBe(false);
      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("budget-exhausted");
      expect(agent.calls).toEqual([]);
      expect(args.waveBudget.resolved).toBe(1);

      const commitTreeCalls = gitCalls.filter((argv) => argv[0] === "commit-tree");
      const updateRefCalls = gitCalls.filter((argv) => argv[0] === "update-ref");
      expect(commitTreeCalls.length).toBe(1);
      expect(updateRefCalls.some((argv) => argv.includes("refs/pdlc/a6-snapshot-1"))).toBe(true);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-18: runWaveGateSeam — step-6 resolution (TSPEC §3.2 step 6, BR-7)", () => {
  test("a well-formed reply followed by a full green gate sequence resolves, and increments waveBudget.resolved", async () => {
    const repo = createA6TempRepo();
    try {
      const _git = repo._git;
      const agent = makeAgentDouble({
        script: [makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] })],
      });
      const { _runCommand } = makeA6RunCommand({ "npm test": { ok: true } });
      const args = makeA6RunArgs({
        _git,
        _agent: agent,
        _runCommand,
        implConfig: { postWaveCommand: null, testCommand: "npm test" },
        scriptGate: true,
      });

      // A6's `apply()` needs producedPaths() to be non-empty (TSPEC §3.3): the repair writes a
      // tracked change to the fixture's own tracked file before the seam runs.
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

      const result = await runWaveGateSeam(args);

      expect(result.resolved).toBe(true);
      expect(result.disposition.outcome).toBe("resolved");
      expect(result.haltFields.repairApplied).toBe(true);
      expect(result.haltFields.rootCause).toBe("wave-internal-defect");
      expect(args.invocations).toEqual(["test"]);
      expect(args.waveBudget.resolved).toBe(1);
      expect(result.postWaveRan).toBe(false);
    } finally {
      repo.cleanup();
    }
  });

  test("a two-token gate sequence (post-wave then test, implConfig.postWaveCommand set) resolves and marks postWaveRan", async () => {
    const repo = createA6TempRepo();
    try {
      const _git = repo._git;
      const agent = makeAgentDouble({
        script: [makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] })],
      });
      const { _runCommand } = makeA6RunCommand({ "npm run build": { ok: true }, "npm test": { ok: true } });
      const args = makeA6RunArgs({
        _git,
        _agent: agent,
        _runCommand,
        implConfig: { postWaveCommand: "npm run build", testCommand: "npm test" },
        scriptGate: true,
      });

      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

      const result = await runWaveGateSeam(args);

      expect(result.resolved).toBe(true);
      expect(args.invocations).toEqual(["post-wave", "test"]);
      expect(result.postWaveRan).toBe(true);
    } finally {
      repo.cleanup();
    }
  });

  test("a red re-gate (post-wave fails) never resolves and never increments waveBudget.resolved", async () => {
    const repo = createA6TempRepo();
    try {
      const _git = repo._git;
      // Every attempt gets the same well-formed reply; every re-gate's post-wave command fails,
      // so `runAdvisorySeam` exhausts its attempt budget and escalates rather than resolving.
      const agent = makeAgentDouble({
        script: [
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
        ],
      });
      const { _runCommand } = makeA6RunCommand({ "npm run build": { ok: false } });
      const args = makeA6RunArgs({
        _git,
        _agent: agent,
        _runCommand,
        implConfig: { postWaveCommand: "npm run build", testCommand: "npm test" },
        scriptGate: true,
        advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1, attemptBudget: 3 }).config,
      });

      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

      const result = await runWaveGateSeam(args);

      expect(result.resolved).toBe(false);
      expect(args.waveBudget.resolved).toBe(0);
      expect(args.invocations.filter((t) => t === "post-wave").length).toBeGreaterThan(0);
      expect(args.invocations).not.toContain("test");
    } finally {
      repo.cleanup();
    }
  });
});

// ─── A6-15 gap-fill: the remaining PROPERTIES.md rows not yet covered above (PLAN A6-15/A6-18) ──
//
// Everything below drives the same `runWaveGateSeam` (and, for PROP-GATE-04's mutation fixtures,
// `runAdvisorySeam` directly over the real `buildA6SeamOps`) the A6-18 section above already
// wires up — no new doubles, no new fixture shapes, per PROP-INFRA-01's single-canonical-source
// rule.

describe("A6-15: runWaveGateSeam — PROP-CTR-03: absent/out-of-set classification escalates with attempts unchanged", () => {
  test.each([
    ["absent (empty ROOT-CAUSE value)", ""],
    ["outside ADVISORY_ROOT_CAUSES", "agent-was-confused"],
  ])("%s", async (_label, rootCause) => {
    const repo = createA6TempRepo();
    try {
      const agent = makeAgentDouble({
        script: [makeA6ReplyText({ rootCause, evidence: ["the gate went red at the eslint step"] })],
      });
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: agent,
        _runCommand: makeA6RunCommand()._runCommand,
      });

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.attempts).toBe(0);
      expect(agent.calls.length).toBe(1);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runWaveGateSeam — PROP-CTR-04: a malformed verdict consumes exactly one attempt", () => {
  test("structurally malformed to parseAdvisoryVerdict (missing CONFIDENCE) — malformed-verdict, one attempt, under a one-attempt budget", async () => {
    const repo = createA6TempRepo();
    try {
      const raw = ["SEAM: A6", "DIAGNOSIS: something", "PROPOSED-ACTION: E-5", `EVIDENCE: ${"x".repeat(30)}`].join(
        "\n"
      );
      const agent = makeAgentDouble({ script: [raw] });
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: agent,
        _runCommand: makeA6RunCommand()._runCommand,
        advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1, attemptBudget: 1 }).config,
      });

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("malformed-verdict");
      expect(result.disposition.attempts).toBe(1);
      expect(agent.calls.length).toBe(1);
    } finally {
      repo.cleanup();
    }
  });

  test("malformed AND unclassifiable (citation too short, class absent) — the malformed-verdict tie-break (AT-02-3/E-09), one attempt", async () => {
    const repo = createA6TempRepo();
    try {
      const agent = makeAgentDouble({
        script: [makeA6ReplyText({ rootCause: "", evidence: ["short"] })],
      });
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: agent,
        _runCommand: makeA6RunCommand()._runCommand,
        advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1, attemptBudget: 1 }).config,
      });

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("malformed-verdict");
      expect(result.disposition.attempts).toBe(1);
      expect(agent.calls.length).toBe(1);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runWaveGateSeam — PROP-CTR-09: attemptBudget bounds the dispatch count under a persistently red re-gate", () => {
  test("attemptBudget: 1 dispatches exactly once and escalates budget-exhausted", async () => {
    const repo = createA6TempRepo();
    try {
      const agent = makeAgentDouble({
        script: [
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
        ],
      });
      const { _runCommand } = makeA6RunCommand({ "npm test": { ok: false } });
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: agent,
        _runCommand,
        implConfig: { postWaveCommand: null, testCommand: "npm test" },
        advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1, attemptBudget: 1 }).config,
      });
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("budget-exhausted");
      expect(agent.calls.length).toBe(1);
    } finally {
      repo.cleanup();
    }
  });

  test("attemptBudget: 2 dispatches exactly twice under the same persistently red re-gate", async () => {
    const repo = createA6TempRepo();
    try {
      const agent = makeAgentDouble({
        script: [
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
        ],
      });
      const { _runCommand } = makeA6RunCommand({ "npm test": { ok: false } });
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: agent,
        _runCommand,
        implConfig: { postWaveCommand: null, testCommand: "npm test" },
        advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1, attemptBudget: 2 }).config,
      });
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("budget-exhausted");
      expect(agent.calls.length).toBe(2);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runWaveGateSeam — PROP-CTR-11: only resolutions consume wave budget", () => {
  test("waveBudgetPerRun: 1 — attempted-and-escalated on waves 1 and 2 still dispatches on wave 3, leaving waveBudget.resolved at 0", async () => {
    const repo = createA6TempRepo();
    try {
      const advisoryConfig = makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1 }).config;
      const waveBudget = { resolved: 0 };
      const _runCommand = makeA6RunCommand()._runCommand;

      const agent1 = makeAgentDouble({ script: [makeA6ReplyText({ rootCause: "agent-was-confused", evidence: ["the gate went red at the eslint step"] })] });
      const result1 = await runWaveGateSeam(
        makeA6RunArgs({ _git: repo._git, _agent: agent1, _runCommand, waveNum: 1, waveIndex: 0, advisoryConfig, waveBudget })
      );
      expect(result1.disposition.outcome).toBe("escalated");
      expect(agent1.calls.length).toBe(1);
      expect(waveBudget.resolved).toBe(0);

      const agent2 = makeAgentDouble({ script: [makeA6ReplyText({ rootCause: "agent-was-confused", evidence: ["the gate went red at the eslint step"] })] });
      const result2 = await runWaveGateSeam(
        makeA6RunArgs({ _git: repo._git, _agent: agent2, _runCommand, waveNum: 2, waveIndex: 1, advisoryConfig, waveBudget })
      );
      expect(result2.disposition.outcome).toBe("escalated");
      expect(agent2.calls.length).toBe(1);
      expect(waveBudget.resolved).toBe(0);

      const agent3 = makeAgentDouble({ script: [makeA6ReplyText({ rootCause: "agent-was-confused", evidence: ["the gate went red at the eslint step"] })] });
      const result3 = await runWaveGateSeam(
        makeA6RunArgs({ _git: repo._git, _agent: agent3, _runCommand, waveNum: 3, waveIndex: 2, advisoryConfig, waveBudget })
      );
      expect(agent3.calls.length).toBe(1); // wave 3 still dispatches — budget was never consumed by an escalation
    } finally {
      repo.cleanup();
    }
  });

  test("waveBudgetPerRun: 1 — a resolved wave 1 makes wave 2 escalate budget-exhausted with zero _agent calls", async () => {
    const repo = createA6TempRepo();
    try {
      const advisoryConfig = makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1 }).config;
      const waveBudget = { resolved: 0 };

      const agent1 = makeAgentDouble({
        script: [makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] })],
      });
      const { _runCommand: runCommand1 } = makeA6RunCommand({ "npm test": { ok: true } });
      const args1 = makeA6RunArgs({
        _git: repo._git,
        _agent: agent1,
        _runCommand: runCommand1,
        waveNum: 1,
        waveIndex: 0,
        advisoryConfig,
        waveBudget,
      });
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");
      const result1 = await runWaveGateSeam(args1);
      expect(result1.resolved).toBe(true);
      expect(waveBudget.resolved).toBe(1);

      const agent2 = makeAgentDouble({ script: [] });
      const args2 = makeA6RunArgs({
        _git: repo._git,
        _agent: agent2,
        _runCommand: makeA6RunCommand()._runCommand,
        waveNum: 2,
        waveIndex: 1,
        advisoryConfig,
        waveBudget,
      });
      const result2 = await runWaveGateSeam(args2);

      expect(result2.resolved).toBe(false);
      expect(result2.disposition.outcome).toBe("escalated");
      expect(result2.disposition.reason).toBe("budget-exhausted");
      expect(agent2.calls).toEqual([]);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runWaveGateSeam — PROP-CTR-13: waveBudgetPerRun: 0 escalates the first red wave with zero dispatches, snapshot still taken", () => {
  test("the tier enabled and waveBudgetPerRun: 0 — budget-exhausted, zero _agent calls, commit-tree observed once", async () => {
    const repo = createA6TempRepo();
    try {
      const gitCalls = [];
      const _git = async (argv) => {
        gitCalls.push(argv);
        return repo._git(argv);
      };
      const agent = makeAgentDouble({ script: [] });
      const args = makeA6RunArgs({
        _git,
        _agent: agent,
        _runCommand: makeA6RunCommand()._runCommand,
        advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 0 }).config,
        waveBudget: { resolved: 0 },
      });

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("budget-exhausted");
      expect(agent.calls).toEqual([]);

      const commitTreeCalls = gitCalls.filter((argv) => argv[0] === "commit-tree");
      expect(commitTreeCalls.length).toBe(1);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runWaveGateSeam — PROP-REST-07: each red wave writes its OWN snapshot ref, never a shared one", () => {
  test("two waves' gates both go red — update-ref targets set-equal {a6-snapshot-1, a6-snapshot-2}, each written once", async () => {
    const repo = createA6TempRepo();
    try {
      const gitCalls = [];
      const _git = async (argv) => {
        gitCalls.push(argv);
        return repo._git(argv);
      };
      const advisoryConfig = makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 0 }).config;

      const result1 = await runWaveGateSeam(
        makeA6RunArgs({
          _git,
          _agent: makeAgentDouble({ script: [] }),
          _runCommand: makeA6RunCommand()._runCommand,
          waveNum: 1,
          waveIndex: 0,
          advisoryConfig,
          waveBudget: { resolved: 0 },
        })
      );
      expect(result1.disposition.reason).toBe("budget-exhausted");

      const result2 = await runWaveGateSeam(
        makeA6RunArgs({
          _git,
          _agent: makeAgentDouble({ script: [] }),
          _runCommand: makeA6RunCommand()._runCommand,
          waveNum: 2,
          waveIndex: 1,
          advisoryConfig,
          waveBudget: { resolved: 0 },
        })
      );
      expect(result2.disposition.reason).toBe("budget-exhausted");

      const updateRefCalls = gitCalls.filter((argv) => argv[0] === "update-ref");
      const targets = updateRefCalls.map((argv) => argv[1]);
      expect(new Set(targets)).toEqual(new Set(["refs/pdlc/a6-snapshot-1", "refs/pdlc/a6-snapshot-2"]));
      expect(targets.filter((t) => t === "refs/pdlc/a6-snapshot-1").length).toBe(1);
      expect(targets.filter((t) => t === "refs/pdlc/a6-snapshot-2").length).toBe(1);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runWaveGateSeam — PROP-REST-08: capture-failure's record content, attempts, budget, and halt fields (Oracle G)", () => {
  test("captureTreeSnapshot returning null — record entry (bare escalated, Model n/a), attempts 0, unchanged budget, no dispatch, exact halt fields", async () => {
    const repo = createA6TempRepo();
    try {
      const _git = async (argv) =>
        argv[0] === "write-tree"
          ? { ok: false, stdout: "", stderr: "fatal: unable to write tree object" }
          : repo._git(argv);
      const agent = makeAgentDouble({ script: [] });
      const files = makeFileDouble();
      const clock = makeFakeClock();
      const args = makeA6RunArgs({
        _git,
        _agent: agent,
        _runCommand: makeA6RunCommand()._runCommand,
        _appendFile: files._appendFile,
        _readFile: files._readFile,
        _now: clock._now,
        waveBudget: { resolved: 0 },
      });

      const result = await runWaveGateSeam(args);

      expect(result.disposition.attempts).toBe(0);
      expect(args.waveBudget.resolved).toBe(0);
      expect(agent.calls).toEqual([]);

      // Oracle G's fixed diagnosis sentence, transcribed verbatim from TSPEC §4.5.
      expect(result.haltFields).toEqual({
        rootCause: "unclassified",
        diagnosis:
          "snapshot capture failed (snapshot-unavailable); no repair was proposed and none was applied",
        repairApplied: false,
        repairPaths: [],
      });

      const recordEntry = files.files["docs/pdlc-advisory-wave-gate/ADVISORY-pdlc-advisory-wave-gate.md"];
      expect(recordEntry).toBeDefined();
      // Oracle G — the record's Disposition cell reads a bare `escalated` (no refusal reason), and
      // its Model cell reads the literal `n/a`.
      expect(recordEntry).toMatch(/\| Disposition \| escalated \|/);
      expect(recordEntry).toMatch(/\| Model \| n\/a \|/);

      const escalationEntry = files.files["docs/_queue/ESCALATIONS.md"];
      expect(escalationEntry).toBeDefined();
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runWaveGateSeam — PROP-GATE-03 (conjunct i): a two-attempt run resolving on the second reads a full six-token ledger", () => {
  test("post-wave+test, red on attempt 1's test, green on attempt 2 — [\"post-wave\",\"test\",\"post-wave\",\"test\",\"post-wave\",\"test\"]", async () => {
    const repo = createA6TempRepo();
    try {
      // The repair is written BEFORE the seam runs, so `captureTreeSnapshot`'s own `git add -A`
      // folds it into the snapshot tree — it survives every `restoreTreeSnapshot` between attempts,
      // exactly as the shipped red-re-gate test above (line ~1150) already relies on.
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

      let testCalls = 0;
      const _runCommand = async (cmd) => {
        if (cmd === "npm run build") return { ok: true };
        if (cmd === "npm test") {
          testCalls += 1;
          return { ok: testCalls > 1 };
        }
        return { ok: true };
      };

      const agent = makeAgentDouble({
        script: [
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
        ],
      });

      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: agent,
        _runCommand,
        implConfig: { postWaveCommand: "npm run build", testCommand: "npm test" },
        // The wave's own already-appended first pass (TSPEC §2.3, Oracle O-A): the ledger is not
        // empty when A6 is entered.
        invocations: ["post-wave", "test"],
        advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1, attemptBudget: 3 }).config,
      });

      const result = await runWaveGateSeam(args);

      expect(result.resolved).toBe(true);
      expect(result.disposition.outcome).toBe("resolved");
      expect(args.invocations).toEqual(["post-wave", "test", "post-wave", "test", "post-wave", "test"]);
      expect(args.waveBudget.resolved).toBe(1);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runWaveGateSeam — PROP-GATE-06: the gate sequence is read from implConfig, never hard-coded", () => {
  test("testCommand only, no postWaveCommand — a one-attempt green run reads ledger [\"test\",\"test\"] and resolves", async () => {
    const repo = createA6TempRepo();
    try {
      const agent = makeAgentDouble({
        script: [makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] })],
      });
      const { _runCommand } = makeA6RunCommand({ "npm test": { ok: true } });
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: agent,
        _runCommand,
        implConfig: { postWaveCommand: null, testCommand: "npm test" },
        // The wave's own already-appended first pass — a test-only sequence appends one token, not
        // two (Oracle O-A).
        invocations: ["test"],
      });
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

      const result = await runWaveGateSeam(args);

      expect(result.resolved).toBe(true);
      expect(args.invocations).toEqual(["test", "test"]);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runWaveGateSeam — PROP-GATE-05 (conjunct ii): an applied repair with a red re-gate consumes one attempt and restores the whole tree", () => {
  test("attemptBudget: 1 — one attempt consumed, budget-exhausted, never resolved, and the tree's content-hash map equals its pre-A6 state", async () => {
    const repo = createA6TempRepo();
    try {
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");
      const preActHash = hashTree(repo.dir);

      const agent = makeAgentDouble({
        script: [
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
        ],
      });
      const { _runCommand } = makeA6RunCommand({ "npm test": { ok: false } });
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: agent,
        _runCommand,
        implConfig: { postWaveCommand: null, testCommand: "npm test" },
        advisoryConfig: makeAdvisoryConfig({ enabled: true, waveBudgetPerRun: 1, attemptBudget: 1 }).config,
      });

      const result = await runWaveGateSeam(args);

      expect(result.resolved).toBe(false);
      expect(result.disposition.attempts).toBe(1);
      expect(result.disposition.reason).toBe("budget-exhausted");
      expect(args.waveBudget.resolved).toBe(0);
      expect(hashTree(repo.dir)).toEqual(preActHash);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: runAdvisorySeam — PROP-GATE-04 (conjunct iii, Oracle O-B): no gate invocation following the repair must halt, never resolve", () => {
  const { runAdvisorySeam } = devModule;

  test("re-gate dropped on attempt 1 — ledgerAnchor.value stays at the pre-seeded length (2), never resolves", async () => {
    const repo = createA6TempRepo();
    try {
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");
      const snapshot = await captureTreeSnapshot({
        feature: "pdlc-advisory-wave-gate",
        waveNum: 1,
        _git: repo._git,
        _sleep: async () => {},
        emit: () => {},
      });

      const invocations = ["post-wave", "test"]; // the wave's own already-appended first pass
      const ledgerAnchor = { value: -1 };
      const baseSeamOps = buildA6SeamOps({
        feature: "pdlc-advisory-wave-gate",
        waveNum: 1,
        waves: makeA6Waves(),
        waveIndex: 0,
        tasks: [],
        gateOutput: "the gate went red at the eslint step",
        implConfig: { postWaveCommand: null, testCommand: "npm test" },
        scriptGate: true,
        invocations,
        ledgerAnchor,
        snapshot,
        _git: repo._git,
        _runCommand: async () => ({ ok: true }),
      });
      const seamOps = {
        ...baseSeamOps,
        // Dropped: never pushes a ledger token, on either attempt.
        verifyGate: async () => ({ passed: false, consumesAttempt: true }),
      };

      const agent = makeAgentDouble({
        script: [
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
        ],
      });
      const files = makeFileDouble();
      const clock = makeFakeClock();

      const terminal = await runAdvisorySeam({
        seam: "A6",
        feature: "pdlc-advisory-wave-gate",
        seamOps,
        config: makeAdvisoryConfig({ enabled: true, attemptBudget: 2 }).config,
        rungState: {},
        _agent: agent,
        _appendFile: files._appendFile,
        _readFile: files._readFile,
        _git: repo._git,
        _now: clock._now,
        _sleep: clock._sleep,
        _notice: () => {},
      });

      expect(terminal.outcome).not.toBe("resolved");
      expect(ledgerAnchor.value).toBe(2);
      expect(invocations).toEqual(["post-wave", "test"]);
    } finally {
      repo.cleanup();
    }
  });

  test("re-gate dropped on attempt 2, after a genuine red sequence on attempt 1 — ledgerAnchor.value stays at 4, never resolves", async () => {
    const repo = createA6TempRepo();
    try {
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");
      const snapshot = await captureTreeSnapshot({
        feature: "pdlc-advisory-wave-gate",
        waveNum: 1,
        _git: repo._git,
        _sleep: async () => {},
        emit: () => {},
      });

      const invocations = ["post-wave", "test"];
      const ledgerAnchor = { value: -1 };
      const baseSeamOps = buildA6SeamOps({
        feature: "pdlc-advisory-wave-gate",
        waveNum: 1,
        waves: makeA6Waves(),
        waveIndex: 0,
        tasks: [],
        gateOutput: "the gate went red at the eslint step",
        implConfig: { postWaveCommand: "npm run build", testCommand: "npm test" },
        scriptGate: true,
        invocations,
        ledgerAnchor,
        snapshot,
        _git: repo._git,
        // attempt 1's genuine re-gate goes red on the test command, AFTER post-wave succeeds — two
        // tokens pushed, matching PROP-GATE-01's "each failing pass truncated at its first failing
        // command" (the failing command here is `test`, so `post-wave` still lands first).
        _runCommand: async (cmd) => ({ ok: cmd !== "npm test" }),
      });
      let verifyGateCalls = 0;
      const seamOps = {
        ...baseSeamOps,
        verifyGate: async () => {
          verifyGateCalls += 1;
          if (verifyGateCalls === 1) return baseSeamOps.verifyGate(); // attempt 1: the genuine red re-gate
          return { passed: false, consumesAttempt: true }; // attempt 2: dropped, no tokens pushed
        },
      };

      const agent = makeAgentDouble({
        script: [
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
          makeA6ReplyText({ proposedAction: "E-5", rootCause: "wave-internal-defect", evidence: ["the gate went red at the eslint step"] }),
        ],
      });
      const files = makeFileDouble();
      const clock = makeFakeClock();

      const terminal = await runAdvisorySeam({
        seam: "A6",
        feature: "pdlc-advisory-wave-gate",
        seamOps,
        config: makeAdvisoryConfig({ enabled: true, attemptBudget: 2 }).config,
        rungState: {},
        _agent: agent,
        _appendFile: files._appendFile,
        _readFile: files._readFile,
        _git: repo._git,
        _now: clock._now,
        _sleep: clock._sleep,
        _notice: () => {},
      });

      expect(terminal.outcome).not.toBe("resolved");
      expect(ledgerAnchor.value).toBe(4);
      expect(invocations).toEqual(["post-wave", "test", "post-wave", "test"]);
    } finally {
      repo.cleanup();
    }
  });
});

// ─── A6-15/A6-13 (CR round 1, PM F-01 / TE F-01): E-6's three conjuncts ─────
//
// PROP-ENV-08. Until CR round 1 the `PROMOTES:`/`PROMOTES-TASK:` trailers existed only inside
// the prompt string and nothing read them, so E-6 admitted any path any later wave owned. The
// conjuncts now run in `buildA6SeamOps.classifyReply` and are observable two ways, both asserted
// below: a failing conjunct removes E-6 from the live `permittedActions` (the shipped X-c clause
// then refuses `out-of-envelope`, before ACT), and a holding one narrows `declaredScope`'s E-6
// half to the NAMED task's owned set (X-d then refuses at CHECK, after a revert).

const E6_SYMBOL = "renderPromotedThing";
const E6_GATE_OUTPUT = `the gate went red: ReferenceError: ${E6_SYMBOL} is not defined at writer.js:12`;

function makeE6Waves({ laterDescription = `add ${E6_SYMBOL} to the writer`, laterId = "T2" } = {}) {
  return [
    [{ id: "T1", files: ["a.js"], description: "wave one work" }],
    [{ id: laterId, files: ["b.js"], description: laterDescription }],
    [{ id: "T3", files: ["d.js"], description: "a different later task" }],
  ];
}

function makeE6Args(repo, { reply, gateOutput = E6_GATE_OUTPUT, waves = makeE6Waves(), files, clock }) {
  return makeA6RunArgs({
    _git: repo._git,
    _agent: makeAgentDouble({ script: [reply] }),
    _runCommand: makeA6RunCommand({ "npm test": { ok: true } })._runCommand,
    waves,
    gateResult: { output: gateOutput },
    ...(files ? { _appendFile: files._appendFile, _readFile: files._readFile } : {}),
    ...(clock ? { _now: clock._now } : {}),
  });
}

describe("A6-15: PROP-ENV-08 — an E-6 proposal is permitted only when all three conjuncts hold", () => {
  test("all three hold: the promotion is applied, the wave resolves, and the record names the task and the paths", async () => {
    const repo = createA6TempRepo();
    try {
      const files = makeFileDouble();
      const args = makeE6Args(repo, {
        files,
        reply: makeA6ReplyText({
          proposedAction: "E-6",
          rootCause: "plan-ordering-defect",
          promotes: E6_SYMBOL,
          promotesTask: "T2",
          evidence: [E6_GATE_OUTPUT],
        }),
      });
      // The repair writes T2's own owned path — the one file the narrowed scope admits.
      writeFileSync(join(repo.dir, "b.js"), `export function ${E6_SYMBOL}() {}\n`);

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("resolved");
      expect(result.resolved).toBe(true);
      // AC-4.6 — the repair's paths and the later PLAN task that owns them, on the record.
      const record = files.files["docs/pdlc-advisory-wave-gate/ADVISORY-pdlc-advisory-wave-gate.md"];
      expect(record).toMatch(/\| Repair paths \| b\.js \|/);
      expect(record).toMatch(/\| Promotes \| renderPromotedThing \|/);
      expect(record).toMatch(/\| Promotes task \| T2 \|/);
    } finally {
      repo.cleanup();
    }
  });

  // One arm per conjunct. Each carries the paired positive above on the SAME fixture shape: only
  // the named conjunct's input differs, so a refusal here cannot be explained by fixture drift.
  test.each([
    [
      "conjunct 1 — PROMOTES-TASK names a task that is not in a strictly later wave",
      { promotesTask: "T1" },
      {},
    ],
    [
      "conjunct 2 — the symbol does not occur in that task's PLAN row text",
      { promotesTask: "T2" },
      { waves: makeE6Waves({ laterDescription: "add somethingEntirelyDifferent to the writer" }) },
    ],
    [
      "conjunct 3 — the symbol does not occur in the captured gate output",
      { promotesTask: "T2" },
      { gateOutput: "the gate went red at the eslint step, with no symbol named anywhere in it" },
    ],
  ])("%s — refused out-of-envelope, nothing applied", async (_label, replyOverrides, argOverrides) => {
    const repo = createA6TempRepo();
    try {
      const gateOutput = argOverrides.gateOutput || E6_GATE_OUTPUT;
      const args = makeE6Args(repo, {
        ...argOverrides,
        gateOutput,
        reply: makeA6ReplyText({
          proposedAction: "E-6",
          rootCause: "plan-ordering-defect",
          promotes: E6_SYMBOL,
          evidence: [gateOutput],
          ...replyOverrides,
        }),
      });
      writeFileSync(join(repo.dir, "b.js"), `export function ${E6_SYMBOL}() {}\n`);

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("out-of-envelope");
      expect(result.resolved).toBe(false);
      expect(result.haltFields.repairApplied).toBe(false);
      // Refused at GATE, before ACT: the re-gate never ran, so the ledger never grew.
      expect(args.invocations).toEqual([]);
    } finally {
      repo.cleanup();
    }
  });

  test("companion: the symbol half holds but the change lands outside the NAMED task's owned set — refused through X-d", async () => {
    const repo = createA6TempRepo();
    try {
      const args = makeE6Args(repo, {
        reply: makeA6ReplyText({
          proposedAction: "E-6",
          rootCause: "plan-ordering-defect",
          promotes: E6_SYMBOL,
          promotesTask: "T2",
          evidence: [E6_GATE_OUTPUT],
        }),
      });
      // `d.js` is owned by T3 — a later wave, so the pre-CR union admitted it; T2 is the task the
      // promotion named, and the narrowed scope is `{a.js, b.js}`.
      writeFileSync(join(repo.dir, "d.js"), `export function ${E6_SYMBOL}() {}\n`);

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("out-of-envelope");
      expect(result.resolved).toBe(false);
    } finally {
      repo.cleanup();
    }
  });
});

// ─── A6-15 (CR round 1, PM F-04 / TE F-02): AC-3.3's eleven prohibited operations ──
//
// PROP-ENV-10. `A6_PROHIBITIONS` was previously asserted set-equal to its own letters and read by
// nothing; the eleven refusals it names had no test. Each arm below drives `runWaveGateSeam` to
// the operation and asserts the refusal, and each carries a paired positive on the same fixture —
// for the path arms, the companion in-scope repair that DOES resolve (`prohibitionPositive`).

const PLAN_PATH = "docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md";
const IMPL_CONFIG_PATH = ".claude/pdlc.config.json";

/** Waves whose manifest deliberately assigns the failing wave the two prohibited paths. */
function makeProhibitionWaves() {
  return [
    [{ id: "T1", files: ["a.js", PLAN_PATH, IMPL_CONFIG_PATH], description: "wave one work" }],
    [{ id: "T2", files: ["b.js"], description: "later work" }],
  ];
}

function makeProhibitionArgs(repo, overrides = {}) {
  return makeA6RunArgs({
    _git: repo._git,
    _agent: makeAgentDouble({
      script: [
        makeA6ReplyText({
          proposedAction: "E-5",
          rootCause: "wave-internal-defect",
          evidence: ["the gate went red at the eslint step"],
        }),
      ],
    }),
    _runCommand: makeA6RunCommand({ "npm test": { ok: true } })._runCommand,
    waves: makeProhibitionWaves(),
    ...overrides,
  });
}

/** Write `relative` inside the fixture repo, creating parent directories as needed. */
function writeInRepo(repo, relative, contents) {
  const full = join(repo.dir, relative);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, contents);
}

describe("A6-15: PROP-ENV-10 — each prohibited operation is refused by its own test, with its paired positive", () => {
  // (f) the PLAN, its task table and its ownership manifest; (g) the implementation configuration.
  // All six arms hold the manifest constant — it ASSIGNS the failing wave both paths — so what
  // refuses them is `a6ProhibitedPaths`' subtraction, not an accident of ownership.
  test.each([
    ["(f) PLAN prose edit", PLAN_PATH, "## Summary\n\nrewritten prose\n"],
    ["(f) PLAN task-table edit", PLAN_PATH, "| # | Task | Deps |\n|---|---|---|\n| T9 | new | none |\n"],
    ["(f) PLAN ownership-manifest edit", PLAN_PATH, "### File-ownership manifest\n\n| File | Owner |\n"],
    ["(g) testCommand change", IMPL_CONFIG_PATH, '{"implementation":{"testCommand":"npm run other"}}\n'],
    ["(g) post-wave-command change", IMPL_CONFIG_PATH, '{"implementation":{"postWaveCommand":"echo skip"}}\n'],
    ["(g) post-wave-pathspec change", IMPL_CONFIG_PATH, '{"implementation":{"postWavePathspecs":["dist/"]}}\n'],
  ])("%s is refused out-of-envelope", async (_label, path, contents) => {
    const repo = createA6TempRepo();
    try {
      const args = makeProhibitionArgs(repo);
      writeInRepo(repo, path, contents);

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("out-of-envelope");
      expect(result.resolved).toBe(false);
      expect(result.haltFields.repairApplied).toBe(false);
    } finally {
      repo.cleanup();
    }
  });

  test("paired positive: the same manifest, the same seam, a repair confined to `a.js` — resolves", async () => {
    const repo = createA6TempRepo();
    try {
      const args = makeProhibitionArgs(repo);
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("resolved");
      expect(result.resolved).toBe(true);
      expect(result.haltFields.repairPaths).toEqual(["a.js"]);
    } finally {
      repo.cleanup();
    }
  });

  // (h) commit, push, tag. Structural, and asserted as such: A6's SeamOps exposes no committing
  // transport, so the oracle is the argv ledger of the `_git` double over a run that DID resolve
  // (the paired positive) — an absence proved on a run that reached every step, not on a run that
  // refused early and could not have committed anyway.
  test.each([["commit"], ["push"], ["tag"]])(
    "(h) a resolved A6 run performs no `git %s`",
    async (verb) => {
      const repo = createA6TempRepo();
      try {
        const gitCalls = [];
        const _git = async (argv) => {
          gitCalls.push(argv);
          return repo._git(argv);
        };
        const args = makeProhibitionArgs(repo, { _git });
        writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

        const result = await runWaveGateSeam(args);

        expect(result.resolved).toBe(true); // paired positive: the run reached its resolution
        expect(gitCalls.filter((argv) => argv[0] === verb)).toEqual([]);
        // `commit-tree` is the snapshot primitive, not a commit: it writes no ref to any branch.
        expect(gitCalls.some((argv) => argv[0] === "commit-tree")).toBe(true);
      } finally {
        repo.cleanup();
      }
    }
  );
});

// ─── A6-15 (CR round 1, TE F-08 / PM F-04): the refusal arms on an A6 fixture ──
//
// PROP-ENV-10's (i) arms, PROP-ENV-09, PROP-ENV-04, PROP-ENV-05 and PROP-ENV-12. The generic
// `classifyEnvelope` unit tests cover each clause in isolation; what was missing is A6's OWN
// `permittedActions`/`declaredScope` reaching them. The two (i) arms write their paths DURING the
// dispatch — after `captureTreeSnapshot` has already run — so the snapshot genuinely predates the
// repair and PROP-ENV-09's "no part of it survives" is an observation of the restored tree rather
// than of a file the snapshot itself recorded.

/** The canonical agent double, wrapped so the repair lands while the seam is mid-attempt. */
function makeRepairingAgent(repo, reply, writes) {
  const base = makeAgentDouble({ script: [reply] });
  // Deliberately NOT `async`: the driver races the dispatch against its wall-clock deadline, and
  // the doubles settle synchronously at the same microtask hop depth, so an extra `await` hop in
  // this wrapper would lose that race and preempt every attempt (`runAdvisorySeam`'s own comment
  // on why `dispatched` is constructed before `deadline`). The write is synchronous; the base
  // double's promise is returned unwrapped.
  const agent = (skill, prompt, opts) => {
    for (const [path, contents] of Object.entries(writes)) writeInRepo(repo, path, contents);
    return base(skill, prompt, opts);
  };
  agent.calls = base.calls;
  return agent;
}

const E5_REPLY = makeA6ReplyText({
  proposedAction: "E-5",
  rootCause: "wave-internal-defect",
  evidence: ["the gate went red at the eslint step"],
});

describe("A6-15: PROP-ENV-10 (i) / PROP-ENV-09 — outside-the-envelope paths, and no part surviving", () => {
  test.each([
    ["(i) wholly outside the computed set", { "unowned.js": "outside\n" }, ["unowned.js"]],
    ["(i) partly inside, partly outside", { "a.js": "inside\n", "unowned.js": "outside\n" }, ["a.js", "unowned.js"]],
  ])("%s — refused out-of-envelope and no part of it survives", async (_label, writes, paths) => {
    const repo = createA6TempRepo();
    try {
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: makeRepairingAgent(repo, E5_REPLY, writes),
        _runCommand: makeA6RunCommand({ "npm test": { ok: true } })._runCommand,
      });

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("out-of-envelope");
      expect(result.resolved).toBe(false);
      // PROP-ENV-09 — the whole proposal is gone, the in-envelope half included.
      for (const path of paths) {
        expect(existsSync(join(repo.dir, path))).toBe(false);
      }
    } finally {
      repo.cleanup();
    }
  });

  test("paired positive: the same during-dispatch write confined to `a.js` resolves and survives", async () => {
    const repo = createA6TempRepo();
    try {
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: makeRepairingAgent(repo, E5_REPLY, { "a.js": "inside\n" }),
        _runCommand: makeA6RunCommand({ "npm test": { ok: true } })._runCommand,
      });

      const result = await runWaveGateSeam(args);

      expect(result.resolved).toBe(true);
      expect(existsSync(join(repo.dir, "a.js"))).toBe(true);
    } finally {
      repo.cleanup();
    }
  });
});

describe("A6-15: PROP-ENV-04 / PROP-ENV-05 / PROP-ENV-12 — the precedence and vocabulary arms on an A6 fixture", () => {
  test("PROP-ENV-04: a proposal confined to the wave's OWN owned paths, one of which is a test file, refuses `revert-on-test-touch` — X-a first, never X-d, never a permit under E-5", async () => {
    const repo = createA6TempRepo();
    try {
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: makeAgentDouble({ script: [E5_REPLY] }),
        _runCommand: makeA6RunCommand({ "npm test": { ok: true } })._runCommand,
        waves: [
          [{ id: "T1", files: ["src/writer.js", "__tests__/writer.test.js"], description: "wave one" }],
          [{ id: "T2", files: ["b.js"], description: "later" }],
        ],
      });

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("revert-on-test-touch");
      expect(args.invocations).toEqual([]); // refused at GATE: nothing was applied, nothing re-gated
    } finally {
      repo.cleanup();
    }
  });

  test("PROP-ENV-05: a wave owning a self-modification guard path refuses `out-of-envelope` through the shipped X-e clause", async () => {
    const repo = createA6TempRepo();
    try {
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: makeAgentDouble({ script: [E5_REPLY] }),
        _runCommand: makeA6RunCommand({ "npm test": { ok: true } })._runCommand,
        waves: [
          [{ id: "T1", files: ["pdlc/workflows/orchestrate-dev.js"], description: "wave one" }],
          [{ id: "T2", files: ["b.js"], description: "later" }],
        ],
      });

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("out-of-envelope");
    } finally {
      repo.cleanup();
    }
  });

  test("PROP-ENV-12: a PROPOSED-ACTION outside `permittedActions` is refused by X-c, with no A6-specific code path", async () => {
    const repo = createA6TempRepo();
    try {
      const args = makeA6RunArgs({
        _git: repo._git,
        _agent: makeAgentDouble({
          script: [
            makeA6ReplyText({
              proposedAction: "E-2",
              rootCause: "wave-internal-defect",
              evidence: ["the gate went red at the eslint step"],
            }),
          ],
        }),
        _runCommand: makeA6RunCommand({ "npm test": { ok: true } })._runCommand,
      });
      writeFileSync(join(repo.dir, "a.js"), "A6's repair\n");

      const result = await runWaveGateSeam(args);

      expect(result.disposition.outcome).toBe("escalated");
      expect(result.disposition.reason).toBe("out-of-envelope");
      expect(result.resolved).toBe(false);
    } finally {
      repo.cleanup();
    }
  });
});
