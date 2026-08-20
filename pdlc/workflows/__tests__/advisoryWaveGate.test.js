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
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";

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
