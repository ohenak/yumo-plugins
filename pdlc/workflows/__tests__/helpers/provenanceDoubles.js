// provenanceDoubles.js — PLAN T04 (batch 1, no deps).
//
// The single shared module-side double module every `provenance*.test.js` and
// `artifactPaths.test.js` / `devModeKinds.test.js` file draws from (TSPEC §7,
// PLAN §3 "shared prerequisites owned by exactly one batch-1 task" —
// `provenanceDoubles.js` has one author, T04, for the whole plan). Nothing here
// touches a real clock, filesystem or `git`; every export is a plain,
// synchronous-construction, call-recording fake.
//
// Three things live here, matching PLAN T04's row and PROPERTIES §2.5's
// "module-side half" description exactly:
//   1. `makePopulatedProvenance` — a populated, frozen `Provenance` value
//      (TSPEC §7.1's typedef), the injected value kinds 1-4 assert against.
//   2. Recording `_git` / `_appendFile` / `_readFile` seams — the three
//      module-level IO surfaces the provenance placements (§7.2) write
//      through, each recording every call in order so a test can assert both
//      "was it called" and "with what".
//   3. Three `QUEUE.md` table fixtures spanning the column space
//      `ensureEngineColumn` (PROP-PROV-5, PROP-PROV-6) must round-trip over:
//      no-columns (neither `Evidence` nor `Engine`), `Evidence`-only (one
//      migration already applied), and both-columns (fully migrated).

// ─── makePopulatedProvenance — the `Provenance` value (TSPEC §7.1) ─────────
//
// Frozen, plain-data, no functions — mirroring `lib/provenance.mjs`'s own
// shape exactly, per §7.1's typedef comment. `overrides` is shallow-merged
// over sensible, internally-consistent defaults (a `"pin"` mode with a
// non-null `pin`, a non-null `pluginVersion`), so a test that only cares
// about `line`/`block` does not have to restate the other six fields.
//
// Every call returns a **freshly frozen object** — never a shared singleton
// — so a test asserting `captured[i].provenance === p` against a specific
// call's own `p` never accidentally aliases a different call's value; the
// caller is responsible for holding onto the one reference it means to
// compare by identity (TSPEC §7.2's "one assertion, applied per pass —
// identity, not structural equality").
const POPULATED_PROVENANCE_DEFAULTS = Object.freeze({
  engineVersion: "1.4.0",
  pluginVersion: "0.9.2",
  pluginCompat: "^1.0.0",
  channel: "engine",
  mode: "pin",
  pin: "1.4.0",
  loadRoot: "/fake/load/root/pdlc-engine",
  line: "pdlc-engine 1.4.0 (plugin 0.9.2, pin 1.4.0)",
  block: "**Engine:** 1.4.0\n**Plugin:** 0.9.2\n**Compat:** ^1.0.0\n**Mode:** pin (1.4.0)",
});

export function makePopulatedProvenance(overrides = {}) {
  return Object.freeze({ ...POPULATED_PROVENANCE_DEFAULTS, ...overrides });
}

// The default-inert control (TSPEC §7.2 P-1) — every field a byte-identical
// mirror of the module-level `NO_PROVENANCE` constant both workflow modules
// carry: an empty `line`/`block`, so PROP-PROV-2's "byte-identical artifacts"
// assertion has a ready-made counterpart to `makePopulatedProvenance()`
// without a test having to hand-roll the empty shape itself.
export const NO_PROVENANCE_DOUBLE = Object.freeze({
  engineVersion: "",
  pluginVersion: null,
  pluginCompat: "",
  channel: "engine",
  mode: "latest",
  pin: null,
  loadRoot: "",
  line: "",
  block: "",
});

// ─── makeRecordingGit — the `_git` double (TSPEC §7.2 kind 4, PROP-PROV-7) ─
//
// Records every `argv` handed to it, in call order, on `.calls` — the oracle
// PROP-PROV-7 requires ("asserted on the recorded `_git` argv, never on
// source text"). `script` is keyed by the git subcommand (`argv[0]`, skipping
// any leading `-C dir` / `-c key=value` pairs exactly as `mergeDoubles.js`'s
// `fakeGit` does, for the same clone-domain call shape); anything unscripted
// succeeds trivially, so a test only names the subcommands whose return value
// it cares about — kind 4's tests care about none, only about the recorded
// argv, so the default is normally all a provenance test needs.
export function makeRecordingGit(script = {}) {
  const calls = [];
  const _git = async (argv) => {
    calls.push(argv);
    let key = Array.isArray(argv) ? argv[0] : argv;
    if (Array.isArray(argv)) {
      let i = 0;
      while (argv[i] === "-C" || argv[i] === "-c") i += 2;
      key = argv[i];
    }
    if (Object.prototype.hasOwnProperty.call(script, key)) {
      return script[key];
    }
    return { ok: true, stdout: "", stderr: "" };
  };
  return { calls, _git };
}

// ─── makeRecordingFileSeams — the `_appendFile` / `_readFile` doubles ──────
// (TSPEC §7.2 kind 2, P-4; PROP-PROV-4)
//
// An in-memory `{ path: contents }` store seeded by `seed`. Both `_readFile`
// and `_appendFile` push onto their own ordered array (`.reads`, `.appends`)
// *before* touching the store, so a scripted-throw test can still see the
// attempt happened even though it failed — mirroring `advisoryDoubles.js`'s
// `makeFileDouble` convention. `.appends` and `.reads` are interleaved by a
// single shared `.calls` log (`{ op: "read" | "append", path }`, in the exact
// order the two seams were invoked) so a kind-2 test can assert the ordering
// P-4 depends on — that `_appendFile` is called strictly after the
// `_checkFile` confirmation a caller performs elsewhere, and that no
// `_appendFile` call happens at all when the composed `block` is empty
// (PROP-PROV-4's "asserted as an `_appendFile` call count of `=== 0`").
//
// `throwOn` is a `Set` of exact path strings; a read or append against a
// path in the set throws (after being recorded) rather than mutating the
// store — the same scripted-failure shape `advisoryDoubles.js` uses.
export function makeRecordingFileSeams({ seed = {}, throwOn = new Set() } = {}) {
  const files = { ...seed };
  const reads = [];
  const appends = [];
  const calls = [];

  function scriptedThrow(path, op) {
    if (throwOn.has(path)) {
      const err = new Error(`makeRecordingFileSeams: scripted throw on ${op} "${path}"`);
      err.code = "EACCES";
      throw err;
    }
  }

  const _readFile = async (path) => {
    reads.push(path);
    calls.push({ op: "read", path });
    scriptedThrow(path, "read");
    if (!Object.prototype.hasOwnProperty.call(files, path)) {
      const err = new Error(`ENOENT: no such file, open '${path}'`);
      err.code = "ENOENT";
      throw err;
    }
    return files[path];
  };

  const _appendFile = async (path, contents) => {
    appends.push({ path, contents });
    calls.push({ op: "append", path, contents });
    scriptedThrow(path, "append");
    files[path] = (Object.prototype.hasOwnProperty.call(files, path) ? files[path] : "") + contents;
  };

  return { files, reads, appends, calls, _readFile, _appendFile };
}

// ─── QUEUE.md table fixtures — the `Engine`/`Evidence` column space ───────
// (TSPEC §7.2, PROP-PROV-5, PROP-PROV-6)
//
// Three markdown strings, one per point in `ensureEngineColumn`'s migration
// space: a table carrying neither new column, one already carrying
// `Evidence` alone (the AC-4.2-era migration `ensureEvidenceColumn` applies),
// and one already carrying both — the state a table reaches after both
// migrations have run. Shape follows the shipped `QUEUE_SHAPES.canonical5col`
// / `alreadyMigrated` fixtures (`fixtures/queue-goldens/shapes.js`) — same
// five base columns, same `FEATURE` row — extended with the `Engine` column
// this feature adds, so a two-migration round-trip test (a table lacking
// *both* columns) has a byte-consistent starting point with the
// already-shipped `Evidence`-only fixture rather than a hand-rolled one.
export const PROVENANCE_QUEUE_FEATURE = "demo-feature";

export const PROVENANCE_QUEUE_FIXTURES = {
  // Neither `Evidence` nor `Engine` present — the base five-column table.
  "no-columns":
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | demo-feature | docs/demo-feature/REQ-demo-feature.md | - |\n" +
    "| 2 | pending | other-feature-a | docs/other-feature-a/REQ-other-feature-a.md | - |\n" +
    "| 3 | done | other-feature-b | docs/other-feature-b/REQ-other-feature-b.md | demo-feature |",

  // `Evidence` present, `Engine` absent — one migration already applied, the
  // shape `ensureEngineColumn` alone must still migrate cleanly.
  "evidence-only":
    "| Order | Status | Feature | REQ Path | Depends-On | Evidence |\n" +
    "| --- | --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | demo-feature | docs/demo-feature/REQ-demo-feature.md | - | - |\n" +
    "| 2 | done | other-feature-a | docs/other-feature-a/REQ-other-feature-a.md | - | abc1234 #9 |",

  // Both columns present — the fully-migrated shape neither helper should
  // touch again (each migration is "append once, never twice").
  "both-columns":
    "| Order | Status | Feature | REQ Path | Depends-On | Evidence | Engine |\n" +
    "| --- | --- | --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | demo-feature | docs/demo-feature/REQ-demo-feature.md | - | - | - |\n" +
    "| 2 | done | other-feature-a | docs/other-feature-a/REQ-other-feature-a.md | - | abc1234 #9 | pdlc-engine 1.4.0 (plugin 0.9.2, pin 1.4.0) |",
};
