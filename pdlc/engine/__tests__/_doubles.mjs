// _doubles.mjs — shared engine-side test doubles and seeded generators
// (PLAN T03, [Fake first]). Not collected as a test file: the leading
// underscore mirrors _bootstrap.mjs / _corpus.mjs / _run-suite.mjs /
// _replay-double.mjs / _assert-suite-wide.mjs in this same directory, none
// of which node's `--test` default glob matches.
//
// Every export below implements one seam TSPEC §10.1 names (S-1…S-7), the
// five-member `deps` recorder set §9.3 names for `bin/cli.mjs`'s
// process-entry leg, or one of PROPERTIES §8's three bounded generators
// (PROP-VER-16). Ownership (PLAN, single-writer-per-file): T03. Every
// downstream task that needs one of these doubles imports it from here — it
// does not re-declare one this file already exports.
//
// Nothing here touches a clock, the filesystem, the network, or a child
// process: every export is a plain, synchronous, pure-data fake or a pure
// generator over an injected seed.
//
//   S-1  fakeStoreReader           — StoreReader:  listVersions(), rootFor(version)
//   S-2  configAbsent/configNoPin/
//        configUnreadable          — ConfigReader's §6.4 three-way `engine` result
//   S-3  fakeLauncher              — Launcher: exec(binPath, argv, env) -> exit code
//   S-4  NO_PROBE/failingProbe/
//        succeedingProbe           — UpdateProbe: latestPublished()
//   S-5  fakePublishChannel        — PublishChannel: exists(name, version), publish(tarball, opts)
//   S-6  NO_PROVENANCE/
//        fakeProvenance            — the frozen `Provenance` value (§7.1)
//   S-7  seeded/resolveSeed/
//        genVersionString/
//        genConfigShape/
//        genQueueTable             — PROPERTIES §8's three bounded generators
//   —    fakeDeps                  — §9.3's five-member `deps` recorder set for
//                                     `bin/cli.mjs`'s process-entry leg

// ───────────────────────── S-1: StoreReader ─────────────────────────────
//
// The resolution ladder is pure (§6.3): a fixture never needs a real
// filesystem to exercise it, only a literal listing. `fakeStoreReader`
// implements the shipped `StoreReader` protocol (`listVersions()`,
// `rootFor(version)`) over that literal listing, so the same double drops
// into both the pure-ladder tests and any test that drives the protocol
// itself (e.g. an install/upgrade leg).

/**
 * @param {string[]} versions - installed versions, in any order.
 * @param {{rootFor?: (version: string) => string|null}} [opts]
 * @returns {{listVersions: () => string[], rootFor: (version: string) => string|null}}
 */
export function fakeStoreReader(versions = [], { rootFor } = {}) {
  const listing = [...versions];
  return {
    listVersions: () => [...listing],
    rootFor: rootFor || ((version) => (listing.includes(version) ? `/fake-store/${version}` : null)),
  };
}

// ───────────────────────── S-2: ConfigReader ─────────────────────────────
//
// `readEngineConfig({cwd}) -> {config, notices, engine}` (§10.1 S-2, §6.4).
// `config`/`notices` are the shipped `dispatch`-tunable channel (unrelated
// to version pinning, kept as-is); `engine` is this feature's new
// discriminant, exactly three states (§6.4's table):
//
//   {state: "absent"}                    - no file, or no `engine` section
//   {state: "no-pin", config}             - `engine` section present and
//                                           parseable; `config` is that
//                                           section verbatim, whether or not
//                                           it carries a `version` key (the
//                                           ladder itself, not the reader,
//                                           decides pin vs. no-pin from
//                                           `config.version` — §6.3 branches
//                                           3/5/6 all read this same state)
//   {state: "unreadable", path, error}    - file exists but isn't
//                                           parseable JSON, or `engine`
//                                           isn't an object
//
// A test builds a *pinned* config result via `configNoPin({version: "…"})`
// — the state name is the reader's, not a claim about the section's
// contents.

/**
 * @param {{config?: object, notices?: string[], engine: object}} shape
 * @returns {{config: object, notices: string[], engine: object}}
 */
function configReaderResult({ config = {}, notices = [], engine }) {
  return { config, notices, engine };
}

/** @param {{config?: object, notices?: string[]}} [overrides] */
export function configAbsent(overrides = {}) {
  return configReaderResult({ ...overrides, engine: { state: "absent" } });
}

/**
 * @param {object} [engineSection] - the `engine` section's contents, with or
 *   without a `version` key.
 * @param {{config?: object, notices?: string[]}} [overrides]
 */
export function configNoPin(engineSection = {}, overrides = {}) {
  return configReaderResult({ ...overrides, engine: { state: "no-pin", config: engineSection } });
}

/**
 * @param {string} path - `ENGINE_CONFIG_PATH`-relative or absolute, caller's choice.
 * @param {string} error - the parse-failure message.
 * @param {{config?: object, notices?: string[]}} [overrides]
 */
export function configUnreadable(path, error, overrides = {}) {
  return configReaderResult({ ...overrides, engine: { state: "unreadable", path, error } });
}

// ───────────────────────── S-3: Launcher ─────────────────────────────────
//
// `exec(binPath, argv, env) -> exit code` (§10.1 S-3). The double never
// spawns; it records the exec *descriptor* — path, argv, env — so a test
// can assert resolution without a second Node process.

/**
 * @param {{exitCode?: number}} [opts]
 * @returns {{calls: Array<{binPath: string, argv: string[], env: object}>, exec: Function}}
 */
export function fakeLauncher({ exitCode = 0 } = {}) {
  const calls = [];
  const exec = (binPath, argv, env) => {
    calls.push({ binPath, argv: [...argv], env: { ...env } });
    return exitCode;
  };
  return { calls, exec };
}

// ───────────────────────── S-4: UpdateProbe ───────────────────────────────
//
// `latestPublished() -> {version} | {unavailable, reason}` (§10.1 S-4).
// `NO_PROBE` is the shipped inert default's shape (§10.1's "S-4 is the one
// that deserves attention"): absent-by-default, but the message it stands
// for is unconditional — `{unavailable: true, reason: "no update probe is
// configured"}`.

export const NO_PROBE = Object.freeze({
  latestPublished: () => ({ unavailable: true, reason: "no update probe is configured" }),
});

/** @param {string} [reason] */
export function failingProbe(reason = "network error") {
  return { latestPublished: () => ({ unavailable: true, reason }) };
}

/** @param {string} version */
export function succeedingProbe(version) {
  return { latestPublished: () => ({ version }) };
}

// ───────────────────────── S-5: PublishChannel ────────────────────────────
//
// `exists(name, version)`, `publish(tarball, opts)` (§10.1 S-5). An
// in-memory `{name -> Set<version>}` store; `publish` records the tarball
// path and options and adds the published version, so AT-3.3's
// byte-identity-across-a-re-run leg can assert `exists` before and after
// without ever shelling out to `npm` (consumed by T58, T49 — §4 kind 2).

/**
 * @param {{existing?: Record<string, string[]>}} [opts] - pre-seeded
 *   `{name: [versions already published]}`.
 */
export function fakePublishChannel({ existing = {} } = {}) {
  const published = new Map();
  for (const [name, versions] of Object.entries(existing)) {
    published.set(name, new Set(versions));
  }
  const calls = { exists: [], publish: [] };

  const exists = async (name, version) => {
    calls.exists.push({ name, version });
    return published.has(name) && published.get(name).has(version);
  };

  const publish = async (tarball, opts = {}) => {
    calls.publish.push({ tarball, opts });
    const { name, version } = opts;
    if (!published.has(name)) published.set(name, new Set());
    published.get(name).add(version);
    return { ok: true };
  };

  return { calls, exists, publish, published };
}

// ───────────────────────── S-6: Provenance ────────────────────────────────
//
// `NO_PROVENANCE` (P-1's default-inert value, empty `line`/`block`) and a
// populated, frozen `Provenance` (§7.1's shape) — both from this one file,
// so a test proves the inert path and all four placements without
// constructing either by hand.

export const NO_PROVENANCE = Object.freeze({
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

/**
 * @param {object} [overrides] - shallow-merged over a well-formed, pinned
 *   default value.
 * @returns {Readonly<object>} a frozen `Provenance` (§7.1).
 */
export function fakeProvenance(overrides = {}) {
  return Object.freeze({
    engineVersion: "0.3.1",
    pluginVersion: "1.4.0",
    pluginCompat: "^1.0.0",
    channel: "engine",
    mode: "pin",
    pin: "0.3.1",
    loadRoot: "/fake-load-root",
    line: "pdlc engine 0.3.1 (pin) · plugin 1.4.0",
    block: "**pdlc engine** 0.3.1 (pin)\nplugin 1.4.0 (compat ^1.0.0)\nload root: /fake-load-root",
    ...overrides,
  });
}

// ───────────────────────── deps: §9.3's five-member seam ─────────────────
//
// `bin/cli.mjs`'s process-entry leg passes recorders for all five members
// of the default-valued `deps` object — the three runners plus the two
// gates that stand before them (`startupFor`, `liveAdapter`) — since no
// runner is reachable until both gates pass. Every recorder captures its
// argument object, in call order, on the shared `captured` array (tagged
// by `name` so a leg can filter per member), and returns the exact shape
// §9.3 names, because the command bodies keep running past the call and
// into `emitReport`. Defaults below are that named shape; a caller
// overrides only the fields a given leg cares about.

/**
 * @param {object} [opts]
 * @param {object} [opts.startup] - `startupFor`'s return, defaults to the
 *   named passing shape `{ok: true, banner: [], pluginVersion, pluginRoot, rungs: []}`.
 * @param {object} [opts.runResult] - `runDev`/`runQueue`'s shared return shape.
 * @param {object} [opts.loopResult] - `runQueueLoop`'s return shape.
 * @param {object} [opts.adapter] - the adapter `liveAdapter` hands back.
 * @param {string} [opts.cwd]
 * @param {object|null} [opts.tunables]
 * @returns {{deps: object, captured: Array<{name: string, arg: *}>}}
 */
export function fakeDeps({
  startup = { ok: true, banner: [], pluginVersion: null, pluginRoot: null, rungs: [] },
  runResult = { report: { outcome: "ran" } },
  loopResult = {
    passes: [],
    outcome: "ran",
    stopReason: "bound-reached",
    exitCode: 0,
    loop: { iterations: 0, maxIterations: 2 },
  },
  adapter = { getApiKeySource: () => null, getPauseLog: () => [] },
  cwd = process.cwd(),
  tunables = null,
} = {}) {
  const captured = [];
  const recorder = (name, result) => (arg) => {
    captured.push({ name, arg });
    return result;
  };
  const deps = {
    runDev: recorder("runDev", runResult),
    runQueue: recorder("runQueue", runResult),
    runQueueLoop: recorder("runQueueLoop", loopResult),
    startupFor: recorder("startupFor", startup),
    liveAdapter: recorder("liveAdapter", { adapter, cwd, tunables }),
  };
  return { deps, captured };
}

// ───────────────────────── S-7: seeded PRNG ───────────────────────────────
//
// A stateful xorshift32 generator, consumed in draw order (generator
// hygiene rule 1, PROPERTIES §8: reproduction is by replay from the printed
// seed, not by index).

/**
 * @param {number} seed - a fixed, printed, non-zero 32-bit integer seed.
 * @returns {{int: (lo: number, hi: number) => number, pick: (arr: Array) => *,
 *            bytes: (n: number) => Buffer, seed: number}}
 */
export function seeded(seed) {
  let state = (seed >>> 0) || 0x9e3779b9; // xorshift32 requires a non-zero state

  function nextU32() {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state >>> 0;
  }

  return {
    seed,
    int(lo, hi) {
      if (hi < lo) throw new Error(`seeded(${seed}).int: hi must be >= lo, got ${lo}..${hi}`);
      const range = hi - lo + 1;
      return lo + (nextU32() % range);
    },
    pick(arr) {
      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error(`seeded(${seed}).pick: array must be non-empty`);
      }
      return arr[nextU32() % arr.length];
    },
    bytes(n) {
      const out = Buffer.alloc(n);
      for (let i = 0; i < n; i++) out[i] = nextU32() % 256;
      return out;
    },
  };
}

/**
 * Applies the `PDLC_PROP_SEED` override (generator hygiene rule 1,
 * PROPERTIES §8): when the env var is set to a decimal integer, every
 * caller's literal seed is replaced by it; unset leaves the literal seed
 * untouched (the only value a CI-less local run ever uses).
 *
 * @param {number} literalSeed
 * @returns {number}
 */
export function resolveSeed(literalSeed) {
  const raw = process.env.PDLC_PROP_SEED;
  if (raw === undefined || raw === "") return literalSeed;
  if (!/^-?\d+$/.test(raw)) {
    throw new Error(`resolveSeed: PDLC_PROP_SEED must be a decimal integer, got ${JSON.stringify(raw)}`);
  }
  return Number.parseInt(raw, 10);
}

// ───────────────────────── S-7: genVersionString ──────────────────────────
//
// Draws over the space PROP-VER-16 names: well-formed, prerelease, empty,
// non-semver, path-traversing.

const VERSION_KINDS = ["well-formed", "prerelease", "empty", "non-semver", "path-traversing"];

/**
 * @param {ReturnType<typeof seeded>} rng
 * @param {{kind?: string}} [opts] - force a specific member of `VERSION_KINDS`
 *   rather than drawing one.
 * @returns {{kind: string, value: string}}
 */
export function genVersionString(rng, { kind } = {}) {
  const chosenKind = kind || rng.pick(VERSION_KINDS);
  switch (chosenKind) {
    case "well-formed":
      return { kind: chosenKind, value: `${rng.int(0, 20)}.${rng.int(0, 20)}.${rng.int(0, 20)}` };
    case "prerelease": {
      const base = `${rng.int(0, 20)}.${rng.int(0, 20)}.${rng.int(0, 20)}`;
      const tag = rng.pick(["alpha", "beta", "rc"]);
      return { kind: chosenKind, value: `${base}-${tag}.${rng.int(0, 9)}` };
    }
    case "empty":
      return { kind: chosenKind, value: "" };
    case "non-semver":
      return {
        kind: chosenKind,
        value: rng.pick(["latest", "v1", "1.2", "1.2.3.4", "abc", "1.x.y", "  1.2.3"]),
      };
    case "path-traversing":
      return {
        kind: chosenKind,
        value: rng.pick(["../../etc/passwd", "..\\..\\windows\\system32", "1.2.3/../../secret", "./../x"]),
      };
    default:
      throw new Error(`genVersionString: unrecognised kind ${JSON.stringify(chosenKind)}`);
  }
}

// ───────────────────────── S-7: genConfigShape ────────────────────────────
//
// Draws over §6.4's branch space: absent, no-pin (no `version` key), a
// well-formed pin, a malformed pin, and an unreadable file. Each drawn case
// carries the literal `ConfigReader` result (S-2's builders) the ladder
// consumes directly.

const CONFIG_SHAPE_KINDS = ["absent", "no-pin", "pin", "pin-malformed", "unreadable"];

/**
 * @param {ReturnType<typeof seeded>} rng
 * @param {{kind?: string}} [opts]
 * @returns {{kind: string, result: object, version?: string}}
 */
export function genConfigShape(rng, { kind } = {}) {
  const chosenKind = kind || rng.pick(CONFIG_SHAPE_KINDS);
  switch (chosenKind) {
    case "absent":
      return { kind: chosenKind, result: configAbsent() };
    case "no-pin":
      return { kind: chosenKind, result: configNoPin({}) };
    case "pin": {
      const { value } = genVersionString(rng, { kind: "well-formed" });
      return { kind: chosenKind, result: configNoPin({ version: value }), version: value };
    }
    case "pin-malformed": {
      const malformedKind = rng.pick(["empty", "non-semver", "path-traversing"]);
      const { value } = genVersionString(rng, { kind: malformedKind });
      return { kind: chosenKind, result: configNoPin({ version: value }), version: value };
    }
    case "unreadable":
      return {
        kind: chosenKind,
        result: configUnreadable(
          ".claude/pdlc.config.json",
          rng.pick(["Unexpected token } in JSON at position 12", "Unexpected end of JSON input"]),
        ),
      };
    default:
      throw new Error(`genConfigShape: unrecognised kind ${JSON.stringify(chosenKind)}`);
  }
}

// ───────────────────────── S-7: genQueueTable ─────────────────────────────
//
// Draws a `QUEUE.md`-shaped markdown table over the shapes PROP-VER-16 and
// T36's round-trip property need: ragged rows, trailing pipes, CRLF line
// endings, and an `Evidence` / `Engine` column each independently absent or
// present.

const QUEUE_HEADER_BASE = ["Order", "Status", "Feature", "REQ Path", "Depends-On"];
const QUEUE_STATUSES = ["pending", "in-progress", "awaiting-merge", "done", "halted", "blocked"];

function renderQueueRow(cells, { ragged, trailingPipe }) {
  const rendered = ragged ? cells.slice(0, Math.max(1, cells.length - 1)) : cells;
  const body = `| ${rendered.join(" | ")} |`;
  return trailingPipe ? body : body.replace(/\|\s*$/, "");
}

/**
 * @param {ReturnType<typeof seeded>} rng
 * @param {{evidence?: boolean, engine?: boolean, crlf?: boolean, ragged?: boolean,
 *           trailingPipe?: boolean, rowCount?: number}} [opts] - force any axis
 *   rather than drawing it.
 * @returns {{markdown: string, header: string[], withEvidence: boolean,
 *            withEngine: boolean, crlf: boolean, ragged: boolean,
 *            trailingPipe: boolean, rowCount: number}}
 */
export function genQueueTable(rng, opts = {}) {
  const withEvidence = opts.evidence ?? rng.pick([true, false]);
  const withEngine = opts.engine ?? rng.pick([true, false]);
  const crlf = opts.crlf ?? rng.pick([true, false]);
  const ragged = opts.ragged ?? rng.pick([true, false]);
  const trailingPipe = opts.trailingPipe ?? rng.pick([true, false]);
  const rowCount = opts.rowCount ?? rng.int(1, 6);

  const header = [...QUEUE_HEADER_BASE];
  if (withEvidence) header.push("Evidence");
  if (withEngine) header.push("Engine");

  const lines = [];
  lines.push(renderQueueRow(header, { ragged: false, trailingPipe }));
  lines.push(renderQueueRow(header.map(() => "---"), { ragged: false, trailingPipe }));

  for (let i = 0; i < rowCount; i++) {
    const cells = [
      String(i + 1),
      rng.pick(QUEUE_STATUSES),
      `feature-${rng.int(0, 999)}`,
      `docs/feature-${rng.int(0, 999)}/REQ-feature-${rng.int(0, 999)}.md`,
      rng.pick(["", "feature-a", "feature-a, feature-b"]),
    ];
    if (withEvidence) cells.push(rng.pick(["", "abc1234 #12", "merged #7"]));
    if (withEngine) cells.push(rng.pick(["", "0.3.1"]));
    const rowRagged = ragged && rng.int(0, 1) === 0;
    lines.push(renderQueueRow(cells, { ragged: rowRagged, trailingPipe }));
  }

  const eol = crlf ? "\r\n" : "\n";
  return {
    markdown: lines.join(eol),
    header,
    withEvidence,
    withEngine,
    crlf,
    ragged,
    trailingPipe,
    rowCount,
  };
}
