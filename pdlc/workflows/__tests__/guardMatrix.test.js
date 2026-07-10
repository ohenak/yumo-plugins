/**
 * guardMatrix.test.js — REQ v1.7 Canonical Block/Allow Matrix, M-side (TSPEC § 6.3).
 *
 * One asserting test per matrix row, test title = row ID (grep-auditable). Structure:
 *   • a literal MATRIX table driving `it.each` (title = `$id`); the nine base groups
 *     partition {M01–M32, M34–M90} with every row in exactly one group;
 *   • bespoke rows (CFD-7) carry a `bespoke: true` marker, are filtered out of the
 *     `it.each`, and get dedicated `it()` blocks generated mechanically from an
 *     `id → orchestration function` dispatch map;
 *   • M33 is discharged by a parameterized `it.each` over M33_RERUN_IDS against G6
 *     fixtures, expecting ALLOW;
 *   • four self-audit meta-tests (1, 2, 4 here — meta-test 3 is TASK-04's S-rows).
 *
 * Oracle substrings are assembled MECHANICALLY (§ 6.3 contract table + CFD-3 conjuncts
 * + CFD-4 `piped input` marker) via the reason-keyed constructors below — never
 * hand-tuned per row.
 *
 * RED verification (TE F-03): every BLOCK-expected row is 🔴 against the CURRENT,
 * unmodified guard-harvest-before-delete.sh, which never emits the `pdlc-guard[<REASON>]`
 * prefix the `expectBlock` oracle requires. ALLOW rows may pre-pass vacuously (they pin
 * non-regression); no artificial redness is forced on them.
 *
 * PENDING STATUS (this branch): the harden-harvest-guard guard REWRITE that emits the
 * `pdlc-guard[<REASON>]` contract is not yet landed here — `guard-harvest-before-delete.sh`
 * is still the pre-hardening script — so the BLOCK rows cannot pass and must not force the
 * whole `npm test` suite red. They are therefore marked pending (`it.skip`) via the `isLive`
 * predicate below: a row is live only when the current pre-hardening guard already satisfies
 * it — i.e. an ALLOW row (exit 0) that is not `degraded` (the degraded rows additionally need
 * the rewrite's builtin-`read` stdin change; see the `isLive` note). BLOCK rows and degraded
 * rows are pending. The live ALLOW rows and the four self-audit meta-tests run for real.
 * Restore the pending rows to `it`/`it.each` in lockstep with the guard rewrite (flip `isLive`
 * — nothing else in this file needs to change).
 */

import { join } from "path";
import {
  buildFixture,
  runGuard,
  expectBlock,
  expectAllow,
  degradedEnv,
  cleanupAll,
} from "./helpers/guardFixtures.js";
import { M_ROWS, M33_RERUN_IDS } from "./helpers/guardRowIds.js";

// ── Mechanical oracle-substring constructors (§ 6.3 contract table + CFD-3/CFD-4) ──
// Each returns a fresh `expect` object {exit, reason, substrings}. Single source per
// reason code → a catalog regression that drops a required conjunct fails every row of
// that reason, not one hand-edited case.

/** NOT_COMMITTED — CFD-3: `then commit` (falsifiable) alongside the harvest hints. */
const NC = () => ({
  exit: 2,
  reason: "NOT_COMMITTED",
  substrings: ["LEARNINGS-f.md", "/pdlc:harvest-learnings", "then commit"],
});

/** NOT_PUSHED — the remedy hint varies by git-state (G4 / G7 / G10). */
const NP = (substrings) => ({ exit: 2, reason: "NOT_PUSHED", substrings });
const NP_G4 = () => NP(["git push -u origin"]); //         M35
const NP_G7 = () => NP(["git push"]); //                   M34
const NP_G10 = () => NP(["git push", "git fetch"]); //     M58, M59

/**
 * INDETERMINATE — CFD-3: the fail-closed rationale (`ailing closed`, case-tolerant)
 * plus the row's unresolvable-operand raw text (CFD-4 interpolates `piped input` for
 * a stream operand — M21).
 */
const IND = (operand) => ({
  exit: 2,
  reason: "INDETERMINATE",
  substrings: [operand, "ailing closed"],
});

/** NO_REPO — G-DP1 eager exit. */
const NO_REPO = () => ({
  exit: 2,
  reason: "NO_REPO",
  substrings: ["outside a git repository"],
});

/** PARSE_ERROR — intake failure. */
const PARSE = () => ({ exit: 2, reason: "PARSE_ERROR", substrings: ["unparseable"] });

/** DEGRADED — CFD-3: `interpreter` alongside `python3`. */
const DEG = () => ({
  exit: 2,
  reason: "DEGRADED",
  substrings: ["python3", "interpreter"],
});

/** ALLOW — exit 0 + silent (expectAllow). */
const ALLOW = () => ({ exit: 0 });

// ── The literal MATRIX ────────────────────────────────────────────────────────────
// Fields: {id, state, command|stdinRaw, stdinCwd?, spawnCwd?, env?, degraded?,
//          bespoke?, expect:{exit, reason?, substrings?}}.
// `spawnCwd` relative paths are resolved against fixture.repoDir by runGuard.
const MATRIX = [
  // ── Group 1: D2 statics, verbs, compounds (default G8) ──────────────────────────
  { id: "M01", state: "G8", command: "rm docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M02", state: "G8", command: "rm docs/f/*.md", expect: NC() },
  { id: "M03", state: "G8", command: "rm src/foo.ts", expect: ALLOW() },
  { id: "M04", state: "G8", command: "find docs/f -name 'CROSS-*' -delete", expect: NC() },
  { id: "M05", state: "G8", command: "find docs/f -name '*.md' -exec rm {} \\;", expect: NC() },
  { id: "M06", state: "G8", command: "git rm docs/f/CODE_REVIEW-f-v1.md", expect: NC() },
  { id: "M07", state: "G8", command: "git clean -fd docs/f", expect: NC() },
  { id: "M09", state: "G8", command: "mv docs/f/CODE_REVIEW-f-v1.md /tmp/", expect: NC() },
  { id: "M10", state: "G8", command: "mv docs/f/CROSS-REVIEW-x.md docs/other-feature/", expect: NC() },
  { id: "M11", state: "G8", command: "mv docs/f/CROSS-REVIEW-x.md docs/f/CROSS-REVIEW-x-v2.md", expect: ALLOW() },
  { id: "M12", state: "G8", command: "mv docs/f/CROSS-REVIEW-x.md docs/f/notes.md", expect: NC() },
  { id: "M13", state: "G8", command: "mv docs/f docs/f-old", expect: NC() },
  { id: "M14", state: "G8", command: "> docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M15", state: "G8", command: "echo note >> docs/f/CROSS-REVIEW-x.md", expect: ALLOW() },
  { id: "M16", state: "G8", command: "truncate -s 0 docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M18", state: "G8", command: "echo done && rm docs/f/*.md", expect: NC() },
  { id: "M19", state: "G8", command: "rm docs/f/*.md || true", expect: NC() },
  { id: "M44", state: "G8", command: 'rm "docs/f/CROSS-REVIEW-x.md"', expect: NC() },
  { id: "M45", state: "G8", command: "rm 'docs/f/CROSS-REVIEW-x.md'", expect: NC() },
  { id: "M47", state: "G8", command: "rm -rf docs/f", expect: NC() },
  { id: "M48", state: "G8", command: "rm -rf docs", expect: NC() },
  { id: "M49", state: "G8", command: "rm -rf .", expect: NC() },
  { id: "M50", state: "G8", command: "find . -name '*.md' -delete", expect: NC() },
  { id: "M51", state: "G8", command: "find docs -delete", expect: NC() },
  { id: "M52", state: "G8", command: "mv docs/f/CROSS-REVIEW-x.md docs/f/archive/", expect: ALLOW() },
  { id: "M53", state: "G8", command: "1> docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M54", state: "G8", command: ">| docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M60", state: "G8", command: "unlink docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M61", state: "G8", command: "&> docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M62", state: "G8", command: ">& docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M63", state: "G8", command: "rm --recursive docs", expect: NC() },
  { id: "M67", state: "nested", command: "cd docs/f && npm test >& 2024-notes/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M74", state: "G8", command: 'mv docs/f "$DEST"', expect: NC() },
  { id: "M79", state: "G8", command: "mv docs/f/CROSS-REVIEW-x.md docs/f/CODE_REVIEW-f-v1.md /tmp/", expect: NC() },
  { id: "M84", state: "G8", command: "mv /tmp/notes.md docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M90", state: "G8", command: "npm test 3> docs/f/CROSS-REVIEW-x.md", expect: NC() },

  // ── Group 2: mv destruction rows (promoted T-01–T-03; default G8) ───────────────
  { id: "M87", state: "G8", command: 'mv "$SRC" docs/f/CROSS-REVIEW-x.md', expect: NC() },
  { id: "M88", state: "G8", command: "mv docs/f/CROSS-REVIEW-x.md docs/f/CODE_REVIEW-f-v1.md", expect: NC() },
  { id: "M89", state: "G8", command: "mv /tmp/CROSS-REVIEW-x.md docs/f/", expect: NC() },

  // ── Group 3: D3/D4 indeterminates (default G8) ──────────────────────────────────
  { id: "M08", state: "G8", command: "git clean -fd", expect: IND("git clean") },
  { id: "M20", state: "G8", command: "rm $(find docs/f -name 'CROSS-*')", expect: IND("$(find docs/f -name 'CROSS-*')") },
  { id: "M21", state: "G8", command: "ls docs/f | xargs rm", expect: IND("piped input") },
  { id: "M24", state: "G8", command: 'D=docs/f; rm "$D"/*.md', expect: IND('"$D"') },
  { id: "M25", state: "G8", command: 'rm "$SCRATCH"/*.log', expect: ALLOW() },
  { id: "M46", state: "G8", command: 'D="docs/f"; rm "$D"/*.md', expect: IND('"$D"') },
  { id: "M55", state: "G8", command: "rm /tmp/x.log && git add docs/f/y.md", expect: ALLOW() },
  { id: "M56", state: "G8", command: 'npm test > "$LOG" 2>&1; git add docs/f/z.md', expect: ALLOW() },
  { id: "M82", state: "G8", command: 'D=docs/f; mv /tmp/notes.md "$D"/CROSS-REVIEW-x.md', expect: IND('"$D"') },

  // ── Group 4: D1 / NFR-01 allows + opaque-recursion blocks (default G8) ──────────
  { id: "M22", state: "G8", command: "bash -c 'rm docs/f/*.md'", expect: NC() },
  { id: "M23", state: "G8", command: 'eval "rm docs/f/*.md"', expect: NC() },
  { id: "M26", state: "G8", command: 'eval "$CMD"', expect: ALLOW() },
  { id: "M27", state: "G8", command: 'git commit -m "rm docs/f cleanup: drop CROSS-REVIEW files"', expect: ALLOW() },
  { id: "M28", state: "G8", command: 'echo "rm docs/f/CROSS-REVIEW-x.md"', expect: ALLOW() },
  { id: "M29", state: "G8", command: "cat <<EOF\nrm docs/f/*.md\nEOF", expect: ALLOW() },
  { id: "M30", state: "G8", command: "git add docs/f/CROSS-REVIEW-x.md", expect: ALLOW() },
  { id: "M31", state: "G8", command: "grep CROSS-REVIEW docs/f/*.md", expect: ALLOW() },
  { id: "M32", state: "G8", command: "rm docs/empty-feature/*.md", expect: ALLOW() },
  { id: "M73", state: "G8", command: "bash -c 'eval \"rm docs/f/*.md\"'", expect: NC() },

  // ── Group 5: cwd-union rows (per-row controls; M64/M86 bespoke) ─────────────────
  { id: "M17", state: "G8", command: "cd docs/f && rm *.md", expect: NC() },
  { id: "M64", state: "G8", command: "rm *.md", bespoke: true, expect: NC() },
  { id: "M65", state: "G8", command: "rm *.md", expect: ALLOW() },
  { id: "M66", state: "G8", command: "rm *.md", spawnCwd: "docs/f", expect: NC() },
  { id: "M80", state: "G8", command: "echo done && rm *.md", spawnCwd: "docs/f", expect: NC() },
  { id: "M85", state: "G8", command: "rm docs/f/CROSS-REVIEW-x.md", env: { CLAUDE_PROJECT_DIR: undefined }, expect: NC() },
  { id: "M86", state: "secondRepo", command: "rm docs/f/CROSS-REVIEW-x.md", bespoke: true, expect: NC() },

  // ── Group 6: git-state rows ─────────────────────────────────────────────────────
  { id: "M34", state: "G7", command: "rm docs/f/CROSS-REVIEW-x.md", expect: NP_G7() },
  { id: "M35", state: "G4", command: "rm docs/f/CROSS-REVIEW-x.md", expect: NP_G4() },
  { id: "M36", state: "G9", command: "rm docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M38", state: "G2", command: "rm docs/f/CROSS-REVIEW-x.md", expect: ALLOW() },
  { id: "M39", state: "G3", command: "rm docs/f/CROSS-REVIEW-x.md", expect: ALLOW() },
  { id: "M40", state: "G10", command: "rm docs/f/CROSS-REVIEW-x.md", env: { GUARD_FETCH_BEFORE_CHECK: "true" }, expect: ALLOW() },
  { id: "M57", state: "G5", command: "rm docs/f/CROSS-REVIEW-x.md", expect: NC() },
  { id: "M58", state: "G10", command: "rm docs/f/CROSS-REVIEW-x.md", expect: NP_G10() },
  { id: "M59", state: "G10-unreachable", command: "rm docs/f/CROSS-REVIEW-x.md", env: { GUARD_FETCH_BEFORE_CHECK: "true", GUARD_FETCH_TIMEOUT_SECS: "5" }, expect: NP_G10() },
  { id: "M77", state: "M77", command: "rm docs/f/CROSS-REVIEW-x.md", expect: NC() },

  // ── Group 7: non-repo rows (G1; M83 bespoke) ────────────────────────────────────
  { id: "M37", state: "G1", command: "rm docs/f/CROSS-REVIEW-x.md", expect: NO_REPO() },
  { id: "M75", state: "G1", command: "rm /tmp/scratch.log", expect: NO_REPO() },
  { id: "M76", state: "G1", command: "rm $(find docs/f -name 'CROSS-*')", expect: NO_REPO() },
  { id: "M83", state: "G1", command: "rm docs/f/CROSS-REVIEW-x.md", bespoke: true, expect: NO_REPO() },

  // ── Group 8: contract rows (stdinRaw control; M41 bespoke) ──────────────────────
  { id: "M41", state: "G8", bespoke: true, expect: PARSE() },
  { id: "M78", state: "G8", stdinRaw: '{"tool_input":{}}', expect: PARSE() },
  { id: "M81", state: "G8", stdinRaw: '{"tool_input":{"command":""}}', expect: ALLOW() },

  // ── Group 9: degraded rows (G8 + degradedEnv via BASH_ABS) ──────────────────────
  { id: "M42", state: "G8", command: "rm docs/f/CROSS-REVIEW-x.md", degraded: true, expect: DEG() },
  { id: "M43", state: "G8", command: "ls -la src/", degraded: true, expect: ALLOW() },
  { id: "M68", state: "G8", command: "git clean -fd docs/backup", degraded: true, expect: DEG() },
  { id: "M69", state: "G8", command: "./scripts/clean docs/backup", degraded: true, expect: ALLOW() },
  { id: "M70", state: "G8", command: "foo > docs/f/CROSS-REVIEW-x.md", degraded: true, expect: DEG() },
  { id: "M71", state: "G8", stdinRaw: 'not-json{"cmd":"rm docs/f"}', degraded: true, expect: DEG() },
  { id: "M72", state: "G8", stdinRaw: "", degraded: true, expect: ALLOW() },
];

// Index for the M33 re-run and bespoke dispatch to consume the same literal rows.
const BASE_BY_ID = Object.fromEntries(MATRIX.map((r) => [r.id, r]));

// ── Shared orchestration helpers ────────────────────────────────────────────────

/** Assemble runGuard options from a MATRIX row (degradedEnv resolved at call time). */
function buildOpts(row) {
  const o = {};
  if (row.command !== undefined) o.command = row.command;
  if (row.stdinRaw !== undefined) o.stdinRaw = row.stdinRaw;
  if (row.stdinCwd !== undefined) o.stdinCwd = row.stdinCwd;
  if (row.spawnCwd !== undefined) o.spawnCwd = row.spawnCwd;
  let env = row.env ? { ...row.env } : undefined;
  if (row.degraded) env = { ...(env || {}), ...degradedEnv() };
  if (env) o.env = env;
  return o;
}

/** Dispatch an expectation object to the matching oracle assertion. */
function assertExpect(res, exp) {
  if (exp.exit === 0) expectAllow(res);
  else expectBlock(res, exp.reason, exp.substrings || []);
}

// ── Bespoke dispatch map (CFD-7) — id → orchestration function ───────────────────
// Marked rows are filtered out of the parameterized `it.each`; each entry here is
// materialised as a dedicated `it()` carrying the row-id title (below). Meta-test 4
// pins this key set set-equal to the `bespoke: true` id set in MATRIX.
const BESPOKE_DISPATCH = {
  // M41 asserts BOTH intake variants (`not-json{` and empty) in the one row-test.
  M41: (row) => {
    const fx = buildFixture(row.state);
    for (const raw of ["not-json{", ""]) {
      const res = runGuard(fx, { stdinRaw: raw });
      expectBlock(res, row.expect.reason, row.expect.substrings);
    }
  },
  // M64: persisted shell cwd — stdin `cwd` = absolute docs/f (fixture-derived).
  M64: (row) => {
    const fx = buildFixture(row.state);
    const res = runGuard(fx, {
      command: row.command,
      stdinCwd: join(fx.repoDir, "docs/f"),
    });
    assertExpect(res, row.expect);
  },
  // M83: mixed-root — stdin `cwd` names a non-repo dir while process cwd is a repo.
  M83: (row) => {
    const repo = buildFixture("G8"); // process cwd is a real repo …
    const nonRepo = buildFixture("G1"); // … but stdin cwd (root A) is a non-repo dir.
    const res = runGuard(repo, {
      command: row.command,
      stdinCwd: nonRepo.repoDir,
    });
    assertExpect(res, row.expect);
  },
  // M86: enumeration-anchor discriminator — stdin cwd = fixture repo, process cwd =
  // a second guarded-directory-free repo, CLAUDE_PROJECT_DIR unset.
  M86: (row) => {
    const fx = buildFixture(row.state);
    const res = runGuard(fx, {
      command: row.command,
      stdinCwd: fx.repoDir,
      spawnCwd: fx.secondRepoDir,
      env: { CLAUDE_PROJECT_DIR: undefined },
    });
    assertExpect(res, row.expect);
  },
};

// ── M33 G6 re-run — reconstruct each referenced row under a verified (G6) fixture ──

/** A G6 fixture (with nested/secondRepo variants where the base row needs one). */
function g6Fixture(id) {
  if (id === "M67") return buildFixture("G6", { nested: true });
  return buildFixture("G6");
}

/** runGuard options for the G6 re-run of a referenced row (expects ALLOW). */
function g6Opts(id, fx) {
  const base = BASE_BY_ID[id];
  const o = {};
  if (base.stdinRaw !== undefined) o.stdinRaw = base.stdinRaw;
  else o.command = base.command;
  if (base.spawnCwd !== undefined) o.spawnCwd = base.spawnCwd;
  // M64's stdin cwd is the fixture-derived absolute docs/f; other bespoke cwd
  // discriminators are moot under a verified feature (allow either way).
  if (id === "M64") o.stdinCwd = join(fx.repoDir, "docs/f");
  else if (base.stdinCwd !== undefined) o.stdinCwd = base.stdinCwd;
  return o;
}

// ── Suites ──────────────────────────────────────────────────────────────────────

// A row runs live only if the CURRENT (pre-hardening) guard already satisfies it:
// an ALLOW row (exit 0) that is NOT degraded. BLOCK rows (exit 2) need the
// `pdlc-guard[<REASON>]` contract, and degraded rows need the builtin-`read` stdin
// change (the current script's `input="$(cat)"` shells out and pollutes stderr with
// `cat: command not found` under the empty-PATH degraded env, tripping the strict
// allow-silence oracle) — both arrive only with the guard rewrite, so those rows are
// pending. See header PENDING STATUS.
const isLive = (r) => r.expect.exit === 0 && !r.degraded;
const NON_BESPOKE = MATRIX.filter((r) => !r.bespoke);
const NON_BESPOKE_ALLOW = NON_BESPOKE.filter(isLive);
const NON_BESPOKE_BLOCK = NON_BESPOKE.filter((r) => !isLive(r));

describe("guardMatrix — core rows (M01–M32, M34–M90)", () => {
  afterEach(() => cleanupAll());

  // ALLOW rows — live (pre-pass against the current guard; pin non-regression).
  it.each(NON_BESPOKE_ALLOW)("$id", (row) => {
    const fx = buildFixture(row.state);
    const res = runGuard(fx, buildOpts(row));
    assertExpect(res, row.expect);
  });

  // BLOCK rows — pending the guard rewrite (RED-by-design; see header PENDING STATUS).
  it.skip.each(NON_BESPOKE_BLOCK)("$id", (row) => {
    const fx = buildFixture(row.state);
    const res = runGuard(fx, buildOpts(row));
    assertExpect(res, row.expect);
  });

  // Bespoke rows (CFD-7): generated mechanically from the dispatch map. ALLOW-expected
  // bespoke rows run live; BLOCK-expected ones are pending on the same exit-code rule.
  for (const [id, fn] of Object.entries(BESPOKE_DISPATCH)) {
    const runner = isLive(BASE_BY_ID[id]) ? it : it.skip;
    runner(id, () => fn(BASE_BY_ID[id]));
  }
});

describe("guardMatrix — M33 G6 re-run (verified feature allows)", () => {
  afterEach(() => cleanupAll());

  it.each(M33_RERUN_IDS)("M33/%s", (id) => {
    const fx = g6Fixture(id);
    const res = runGuard(fx, g6Opts(id, fx));
    expectAllow(res);
  });
});

describe("guardMatrix — suite self-audit meta-tests", () => {
  // (1) MATRIX id list sorted deep-equals M_ROWS minus M33, AND length === Set size.
  it("meta-1: MATRIX ids partition M_ROWS minus M33 exactly once", () => {
    const ids = MATRIX.map((r) => r.id);
    const sorted = [...ids].sort();
    const expected = M_ROWS.filter((id) => id !== "M33");
    expect(sorted).toEqual(expected);
    expect(ids.length).toBe(new Set(ids).size);
  });

  // (2) M33_RERUN_IDS ⊆ M_ROWS, no duplicates.
  it("meta-2: M33_RERUN_IDS is a duplicate-free subset of M_ROWS", () => {
    expect(M33_RERUN_IDS.length).toBe(new Set(M33_RERUN_IDS).size);
    const known = new Set(M_ROWS);
    for (const id of M33_RERUN_IDS) expect(known.has(id)).toBe(true);
  });

  // (4) dispatch-map key set === bespoke:true id set (standalone, per CFD-7).
  it("meta-4: bespoke dispatch-map keys are set-equal to the bespoke:true id set", () => {
    const dispatchKeys = Object.keys(BESPOKE_DISPATCH).sort();
    const bespokeIds = MATRIX.filter((r) => r.bespoke).map((r) => r.id).sort();
    expect(dispatchKeys).toEqual(bespokeIds);
  });
});
