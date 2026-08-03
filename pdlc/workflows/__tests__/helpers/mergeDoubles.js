// ─── mergeDoubles.js ──────────────────────────────────────────────────────
//
// PLAN §4/§12 F1 (pdlc-merge-phase): the shared test doubles TSPEC §13.1
// names, plus the seeded property generators PROPERTIES §1.2 requires.
//
// Ownership (PLAN, single-writer-per-file): F1. Every downstream merge task
// (B1, B2, …) imports from here — it does not re-declare a double or a
// generator this file already exports (PROPERTIES §1.2, SE F-07).
//
// Nothing here touches a clock, filesystem, network, `gh` or `git`
// (PROPERTIES §1.2 rule 2) — every export is a plain, synchronous or
// async, pure-data fake.

import { seeded, resolveSeed } from "./driftGenerators.js";

// ─── Seeded generation (PROPERTIES §1.2 rule 1) ────────────────────────────
//
// `seeded` and `resolveSeed` are IMPORTED from `driftGenerators.js`, never
// re-declared — its header forbids re-declaring either, and PROPERTIES
// §1.2 (SE F-07) extends the same rule to this feature. Re-exported here so
// every merge property test has one import site.

export { seeded, resolveSeed };

// The literal seed constant for every merge property. `PDLC_PROP_SEED`
// (read by `resolveSeed`) overrides it at run time; failure output must
// print the seed actually used (via `resolveSeed`) and the case value,
// never only an index.
export const MERGE_PROP_SEED = 0x5ed;

// ─── fakeGhRun / passingGh — the single `_ghRun` transport double ─────────
//
// `matchKey` normalizes whatever shape `command` arrives in (a plain
// string, an argv array, or `{ argv }`) down to a stable per-surface shape
// that ignores volatile arguments (PR numbers, repo slugs, cursors, flag
// values) riding along with the real command. A plain first-three-token
// reduction is NOT enough here: `mergeCommandFor`'s "prState", "ci",
// "changedFiles" and "mergeReadback" surfaces all begin `gh pr view {url}
// --json …` — they share the same first three tokens and would collide on
// a single fixture entry. The `--json` field list is what actually
// distinguishes them, so a command carrying `--json X` keys on
// "{first three tokens} --json X"; `graphql`, the `--paginate --slurp`
// fallback and `gh pr merge` are recognised structurally instead, since
// none of them carry `--json` at all.
export function matchKey(command) {
  const str = normalizeCommand(command).trim();

  if (/^gh api graphql\b/.test(str)) return "gh api graphql";
  if (/^gh api --paginate --slurp\b/.test(str)) return "gh api --paginate --slurp";
  if (/^gh pr merge\b/.test(str)) return "gh pr merge";

  const jsonMatch = str.match(/--json\s+(\S+)/);
  if (jsonMatch) {
    const headMatch = str.match(/^(\S+\s+\S+\s+\S+)/);
    const head = headMatch ? headMatch[1] : str;
    return `${head} --json ${jsonMatch[1]}`;
  }

  return str.split(/\s+/).slice(0, 3).join(" ");
}

function normalizeCommand(command) {
  if (typeof command === "string") return command;
  if (Array.isArray(command)) return command.join(" ");
  if (command && typeof command === "object" && Array.isArray(command.argv)) {
    return command.argv.join(" ");
  }
  return String(command);
}

// `fakeGhRun(map)` replaces `_ghRun`. It answers every command whose
// `matchKey` is present in `map`; anything else fails closed with a
// diagnostic `stderr` naming the gap, never throws and never guesses.
// Every command handed to it is recorded, in order, on `.calls`.
export function fakeGhRun(map) {
  const calls = [];
  const _ghRun = async (command) => {
    calls.push(command);
    const key = matchKey(command);
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      return map[key];
    }
    return { ok: false, stdout: "", stderr: "no fixture for this command" };
  };
  return { calls, _ghRun };
}

// The six canonical surfaces `_ghRun` is the single transport for, keyed by
// the EXACT shape `matchKey` reduces `mergeCommandFor`'s own strings to
// (TSPEC §4.1 — `mergeCommandFor` is the sole home of every `gh` command
// string, so these keys are derived from it, not invented independently).
// Each value is an "everything passes" `{ ok, stdout, stderr }` reply.
const PASSING_GH_DEFAULTS = {
  "gh pr view --json state,mergeable,mergeStateStatus,number,mergeCommit": {
    ok: true,
    stdout: JSON.stringify({
      state: "OPEN",
      mergeable: "MERGEABLE",
      mergeStateStatus: "CLEAN",
      number: 42,
      mergeCommit: null,
    }),
    stderr: "",
  },
  "gh pr view --json statusCheckRollup": {
    ok: true,
    stdout: JSON.stringify({ statusCheckRollup: [{ name: "build", state: "SUCCESS" }] }),
    stderr: "",
  },
  "gh api graphql": {
    ok: true,
    stdout: JSON.stringify({
      data: {
        repository: {
          pullRequest: {
            reviewThreads: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] },
          },
        },
      },
    }),
    stderr: "",
  },
  "gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge,defaultBranchRef": {
    ok: true,
    stdout: JSON.stringify({
      rebaseMergeAllowed: true,
      mergeCommitAllowed: true,
      squashMergeAllowed: true,
      deleteBranchOnMerge: true,
      defaultBranchRef: { name: "main" },
    }),
    stderr: "",
  },
  "gh pr view --json files": {
    ok: true,
    stdout: JSON.stringify({ files: [{ path: "src/example.js" }] }),
    stderr: "",
  },
  "gh pr merge": {
    ok: true,
    stdout: "Merged pull request #42\n",
    stderr: "",
  },
};

// Friendly override names, mapped to the canonical surface key above.
const SURFACE_KEY_BY_NAME = {
  prState: "gh pr view --json state,mergeable,mergeStateStatus,number,mergeCommit",
  ci: "gh pr view --json statusCheckRollup",
  reviewThreads: "gh api graphql",
  repoCaps:
    "gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge,defaultBranchRef",
  changedFiles: "gh pr view --json files",
  merge: "gh pr merge",
};

// `passingGh(overrides)` builds the "everything passes" command map —
// the fixture baseline for the TSPEC §11 row table. `overrides` is keyed by
// the friendly surface name (`prState`, `ci`, `reviewThreads`, `repoCaps`,
// `changedFiles`, `merge`); each override is shallow-merged over that
// surface's default reply, so a caller drives exactly one surface's
// constructed answer while leaving the other five untouched.
export function passingGh(overrides = {}) {
  const map = {};
  for (const [key, defaultReply] of Object.entries(PASSING_GH_DEFAULTS)) {
    map[key] = { ...defaultReply };
  }
  for (const [name, override] of Object.entries(overrides)) {
    const key = SURFACE_KEY_BY_NAME[name];
    if (!key) {
      throw new Error(`passingGh: unrecognised surface override "${name}"`);
    }
    map[key] = { ...map[key], ...override };
  }
  return map;
}

// Exported so a self-test (or a downstream consumer) can enumerate the
// surfaces `passingGh` is required to answer without hand-duplicating the
// list.
export const GH_SURFACE_NAMES = Object.keys(SURFACE_KEY_BY_NAME);

// ─── fakeGit — the `_git` double ───────────────────────────────────────────
//
// `script` is keyed by `argv[0]` (the git subcommand — `"fetch"`,
// `"rebase"`, `"push"`, …). Anything not scripted succeeds trivially, so a
// test only names the subcommands whose outcome it cares about. Every
// `argv` handed to it is recorded, in order, on `.calls`.
export function fakeGit(script = {}) {
  const calls = [];
  const _git = async (argv) => {
    calls.push(argv);
    const key = Array.isArray(argv) ? argv[0] : argv;
    if (Object.prototype.hasOwnProperty.call(script, key)) {
      return script[key];
    }
    return { ok: true, stdout: "", stderr: "" };
  };
  return { calls, _git };
}

// ─── fakeQueueFs — the `_readFile` / `_writeFile` (/ `_checkFile`) double ──
//
// An in-memory `{ path: contents }` store standing in for the filesystem.
// `initialFiles` seeds the store; every read and write is recorded, in
// order, and `.files` reflects current contents at any point (so a test can
// assert on it directly, or via `.writes` for the exact sequence).
export function fakeQueueFs(initialFiles = {}) {
  const files = { ...initialFiles };
  const reads = [];
  const writes = [];

  const _readFile = async (path) => {
    reads.push(path);
    if (!Object.prototype.hasOwnProperty.call(files, path)) {
      const err = new Error(`ENOENT: no such file, open '${path}'`);
      err.code = "ENOENT";
      throw err;
    }
    return files[path];
  };

  const _writeFile = async (path, contents) => {
    writes.push({ path, contents });
    files[path] = contents;
  };

  const _checkFile = async (path) => Object.prototype.hasOwnProperty.call(files, path);

  return { files, reads, writes, _readFile, _writeFile, _checkFile };
}

// ─── recordingRecordQueueRow — the `_recordQueueRow` double ────────────────
//
// Captures every `{ feature, status, evidence }` call, in order, on
// `.calls`. `disposition` is either a fixed value returned for every call,
// or a function `(callIndex, call) => disposition` for a scripted sequence
// (e.g. to answer the four `QUEUE_ROW_DISPOSITIONS` members across
// successive invocations).
export function recordingRecordQueueRow(disposition = "recorded") {
  const calls = [];
  const _recordQueueRow = async (feature, status, evidence) => {
    const call = { feature, status, evidence };
    calls.push(call);
    return typeof disposition === "function"
      ? disposition(calls.length - 1, call)
      : disposition;
  };
  return { calls, _recordQueueRow };
}

// ─── The clock and the phase flag ──────────────────────────────────────────
//
// A single fixed instant, deliberately not "now" — no test result may
// depend on when it runs.
export const FIXED_NOW_MS = 1735689600000; // 2025-01-01T00:00:00.000Z

export const fakeSleep = async () => {};
export const fakeNow = () => FIXED_NOW_MS;
export const PHASE_DISABLED = false;
