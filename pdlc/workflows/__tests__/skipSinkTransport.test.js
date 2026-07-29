/**
 * skipSinkTransport.test.js — DOD-11.
 *
 * `driftHelpers.test.js` covers the *pure* comparator (`validateSkipRecords`) over hand-built
 * literals. What it does not touch — and what CODE_REVIEW v2 DOD-11 flagged — is the **transport**
 * the comparator is fed by: `skipSinkPath()` / `appendSkipRecord()` / `readSkipRecords()`. That
 * transport is also dormant at runtime on a non-root runner: no `describeOrSkip` / `itOrSkip`
 * capability gate fires at uid 501, so the sink stays empty and clauses C1 and C2 evaluate over an
 * empty record set on every run. `appendSkipRecord` swallows every error by design, so a silently
 * broken sink would leave the suite green and C1/C2 vacuous.
 *
 * This file closes that hole in three layers:
 *
 *   1. §1-§3 exercise the transport directly — the no-env branch, the append→read round trip,
 *      append-only accumulation (including two *separate writer processes*, the case the
 *      `O_APPEND` comment in `skipSink.js` is about), the read-side blank/malformed handling, and
 *      the deliberate error-swallowing branch (asserted, not assumed).
 *   2. §4 drives C1 and C2 over records that actually travelled through the sink — written with
 *      `appendSkipRecord`, read back with `readSkipRecords`, then compared against the real
 *      `SKIP_INVENTORY`. A broken sink reds these, where the literal-fed cases in
 *      `driftHelpers.test.js` would still pass.
 *   3. §5 makes the *live* uid-0 path non-vacuous on a non-root runner: `process.getuid` is
 *      temporarily spoofed to return 0, so a genuine `itOrSkip(..., "uid-nonroot", ...)` skip
 *      fires and travels the real route `itOrSkip → registerSkip → appendSkipRecord → sink →
 *      readSkipRecords → validateSkipRecords`. Both directions are pinned: an inventory-verbatim
 *      registration validates clean, a drifted one is caught.
 *
 * Every fixture lives in one `mkdtemp` directory under the OS tmpdir, removed in `afterAll`;
 * nothing is written into the working tree. `PDLC_SKIP_SINK` is redirected per test and restored,
 * so no record written here can reach the real run-scoped sink that `globalTeardown` inspects.
 */

import { execFileSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  KNOWN_CAPABILITY_KEYS,
  SKIP_SINK_ENV,
  appendSkipRecord,
  readSkipRecords,
  skipSinkPath,
  validateSkipRecords,
} from "./helpers/skipSink.js";
import { SKIP_INVENTORY, itOrSkip } from "./helpers/driftCapabilities.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIP_SINK_MODULE = new URL("./helpers/skipSink.js", import.meta.url).href;

let TMP_ROOT;
let ORIGINAL_SINK_ENV;
let counter = 0;

/** A fresh, unused sink path inside the throwaway tmpdir. */
function freshSinkPath(label = "sink") {
  counter += 1;
  return join(TMP_ROOT, `${label}-${counter}.jsonl`);
}

/** Points `PDLC_SKIP_SINK` at a fresh, pre-created (empty) sink file and returns its path. */
function useSink(label) {
  const path = freshSinkPath(label);
  writeFileSync(path, "");
  process.env[SKIP_SINK_ENV] = path;
  return path;
}

function lines(path) {
  return readFileSync(path, "utf8").split("\n").filter((l) => l !== "");
}

beforeAll(() => {
  TMP_ROOT = mkdtempSync(join(tmpdir(), "pdlc-skip-sink-transport-"));
  ORIGINAL_SINK_ENV = process.env[SKIP_SINK_ENV];
});

afterEach(() => {
  // Never leave this file's redirection in place: the real run sink must stay authoritative.
  if (ORIGINAL_SINK_ENV === undefined) delete process.env[SKIP_SINK_ENV];
  else process.env[SKIP_SINK_ENV] = ORIGINAL_SINK_ENV;
});

afterAll(() => {
  if (TMP_ROOT) rmSync(TMP_ROOT, { recursive: true, force: true });
});

// ═════════════ §1 — skipSinkPath() and the no-env branch ═════════════

describe("DOD-11 §1 — skipSinkPath() resolves the run-scoped sink from the environment", () => {
  it("DOD-11(a) — returns null when PDLC_SKIP_SINK is unset, and null for an empty value", () => {
    delete process.env[SKIP_SINK_ENV];
    expect(skipSinkPath()).toBeNull();

    process.env[SKIP_SINK_ENV] = "";
    expect(skipSinkPath()).toBeNull();
  });

  it("DOD-11(b) — returns the env var's value verbatim when it is set", () => {
    const path = freshSinkPath("resolve");
    process.env[SKIP_SINK_ENV] = path;
    expect(skipSinkPath()).toBe(path);
  });

  it("DOD-11(c) — appendSkipRecord is a no-op returning false when no sink is published", () => {
    const wouldBe = freshSinkPath("never-written");
    delete process.env[SKIP_SINK_ENV];

    expect(appendSkipRecord({ name: "AT-x", capability: "uid-nonroot", unverifiedInvariants: ["i"] })).toBe(
      false
    );
    // The no-env branch must not invent a path: nothing anywhere was created.
    expect(existsSync(wouldBe)).toBe(false);
  });
});

// ═════════════ §2 — the append → read round trip, and append-only accumulation ═════════════

describe("DOD-11 §2 — appendSkipRecord → file → readSkipRecords is a faithful round trip", () => {
  it("DOD-11(d) — a record survives the round trip verbatim, as exactly one JSONL line", () => {
    const path = useSink("roundtrip");
    const record = {
      name: "AT-14b",
      capability: "uid-nonroot",
      unverifiedInvariants: ["invariant one", "invariant two"],
      origin: "/some/test/path.test.js",
    };

    expect(appendSkipRecord(record)).toBe(true);
    expect(lines(path)).toHaveLength(1);

    const { records, malformedLines } = readSkipRecords(path);
    expect(malformedLines).toEqual([]);
    expect(records).toEqual([record]);
  });

  it("DOD-11(e) — successive appends accumulate in order and never truncate a pre-existing line", () => {
    const path = useSink("append-only");
    // A line already in the sink stands in for another worker that got there first.
    writeFileSync(path, JSON.stringify({ name: "pre-existing", capability: "bash", unverifiedInvariants: ["i0"] }) + "\n");

    for (const n of [1, 2, 3]) {
      expect(
        appendSkipRecord({ name: `AT-${n}`, capability: "uid-nonroot", unverifiedInvariants: [`i${n}`] })
      ).toBe(true);
    }

    expect(lines(path)).toHaveLength(4);
    const { records, malformedLines } = readSkipRecords(path);
    expect(malformedLines).toEqual([]);
    expect(records.map((r) => r.name)).toEqual(["pre-existing", "AT-1", "AT-2", "AT-3"]);
  });

  it("DOD-11(f) — two separate writer processes both land in the same sink (O_APPEND)", () => {
    // The reason `appendSkipRecord` uses `flag: "a"` is that jest workers are separate
    // *processes*. In-process appends cannot show that; two real child processes can.
    const path = useSink("multi-writer");
    const writer = (name) =>
      `import { appendSkipRecord } from ${JSON.stringify(SKIP_SINK_MODULE)};` +
      `if (!appendSkipRecord({ name: ${JSON.stringify(name)}, capability: "uid-nonroot",` +
      ` unverifiedInvariants: ["written by a separate process"] })) process.exit(3);`;

    for (const name of ["worker-A", "worker-B"]) {
      execFileSync(process.execPath, ["--input-type=module", "-e", writer(name)], {
        cwd: HERE,
        env: { ...process.env, [SKIP_SINK_ENV]: path },
        stdio: "pipe",
      });
    }
    // …and one more from this process, interleaved after them.
    expect(
      appendSkipRecord({ name: "worker-C", capability: "uid-nonroot", unverifiedInvariants: ["in-process"] })
    ).toBe(true);

    expect(lines(path)).toHaveLength(3);
    const { records, malformedLines } = readSkipRecords(path);
    expect(malformedLines).toEqual([]);
    expect(records.map((r) => r.name).sort()).toEqual(["worker-A", "worker-B", "worker-C"]);
    // No writer clobbered another's payload.
    expect(records.find((r) => r.name === "worker-A").unverifiedInvariants).toEqual([
      "written by a separate process",
    ]);
  });
});

// ═════════════ §3 — read-side edge cases and the deliberate error-swallowing branch ═════════════

describe("DOD-11 §3 — readSkipRecords tolerates an absent sink and reports unparseable lines", () => {
  it("DOD-11(g) — a null path and a non-existent path both read as zero records", () => {
    expect(readSkipRecords(null)).toEqual({ records: [], malformedLines: [] });
    const absent = freshSinkPath("absent");
    expect(existsSync(absent)).toBe(false);
    expect(readSkipRecords(absent)).toEqual({ records: [], malformedLines: [] });
  });

  it("DOD-11(h) — blank and whitespace-only lines are ignored, not reported as malformed", () => {
    const path = freshSinkPath("blanks");
    const record = { name: "AT-16", capability: "uid-nonroot", unverifiedInvariants: ["i"] };
    writeFileSync(path, `\n   \n${JSON.stringify(record)}\n\n`);

    const { records, malformedLines } = readSkipRecords(path);
    expect(malformedLines).toEqual([]);
    expect(records).toEqual([record]);
  });

  it("DOD-11(i) — an unparseable line is surfaced while valid lines around it still parse", () => {
    const path = freshSinkPath("malformed");
    const good = {
      name: "off-inventory transport record",
      capability: "uid-nonroot",
      unverifiedInvariants: ["i"],
    };
    writeFileSync(path, `${JSON.stringify(good)}\n{"name": "truncated"\n${JSON.stringify(good)}\n`);

    const { records, malformedLines } = readSkipRecords(path);
    expect(records).toHaveLength(2);
    expect(malformedLines).toEqual(['{"name": "truncated"']);

    // The teardown turns each malformed line into a violation, so a corrupt sink fails the run
    // rather than being silently dropped.
    const violations = validateSkipRecords(records, SKIP_INVENTORY);
    expect(violations).toEqual([]);
    expect(violations.concat(malformedLines.map((l) => `unparseable skip-sink line: ${l}`))).toHaveLength(1);
  });
});

describe("DOD-11 §3b — appendSkipRecord swallows write failures instead of failing a test", () => {
  it("DOD-11(j) — a sink under a non-existent directory returns false and does not throw", () => {
    const path = join(TMP_ROOT, "no-such-dir", "skips.jsonl");
    expect(existsSync(dirname(path))).toBe(false);
    process.env[SKIP_SINK_ENV] = path;

    let returned;
    expect(() => {
      returned = appendSkipRecord({
        name: "AT-34",
        capability: "uid-nonroot",
        unverifiedInvariants: ["i"],
      });
    }).not.toThrow();
    expect(returned).toBe(false);
    expect(existsSync(path)).toBe(false);
  });

  it("DOD-11(k) — a sink path that is itself a directory returns false and does not throw", () => {
    const path = join(TMP_ROOT, `dir-as-sink-${(counter += 1)}`);
    mkdirSync(path);
    process.env[SKIP_SINK_ENV] = path;

    expect(() =>
      expect(
        appendSkipRecord({ name: "AT-34", capability: "uid-nonroot", unverifiedInvariants: ["i"] })
      ).toBe(false)
    ).not.toThrow();
  });
});

// ═════════════ §4 — C1/C2 driven over records that really travelled through the sink ═════════════

describe("DOD-11 §4 — C1 and C2 evaluated over sink-transported records, not literals", () => {
  const entry = SKIP_INVENTORY[0];

  /** Writes each record through the real sink, reads them back, and compares. */
  function throughSink(records) {
    const path = useSink("comparator");
    for (const record of records) expect(appendSkipRecord(record)).toBe(true);
    const { records: readBack, malformedLines } = readSkipRecords(path);
    expect(malformedLines).toEqual([]);
    expect(readBack).toHaveLength(records.length);
    return validateSkipRecords(readBack, SKIP_INVENTORY);
  }

  it("DOD-11(l) — an inventory-verbatim record round-trips and clears C1 and C2", () => {
    const violations = throughSink([
      {
        name: entry.name,
        capability: entry.capability,
        unverifiedInvariants: [...entry.unverifiedInvariants],
        origin: "sink-transported",
      },
    ]);
    expect(violations).toEqual([]);
  });

  it("DOD-11(m) — C2 catches a capability that drifted from the inventory, post-transport", () => {
    const other = KNOWN_CAPABILITY_KEYS.find((k) => k !== entry.capability);
    const violations = throughSink([
      {
        name: entry.name,
        capability: other,
        unverifiedInvariants: [...entry.unverifiedInvariants],
        origin: "sink-transported",
      },
    ]);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("SKIP_INVENTORY names");
    expect(violations[0]).toContain("sink-transported");
  });

  it("DOD-11(n) — C2 catches an invariant list that drifted from the inventory, post-transport", () => {
    const violations = throughSink([
      {
        name: entry.name,
        capability: entry.capability,
        unverifiedInvariants: ["not the inventory's wording"],
        origin: "sink-transported",
      },
    ]);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("verbatim");
  });

  it("DOD-11(o) — C1 catches an empty invariant list and a nameless record, post-transport", () => {
    const violations = throughSink([
      { name: "AT-transport", capability: "uid-nonroot", unverifiedInvariants: [] },
      { capability: "uid-nonroot", unverifiedInvariants: ["i"] },
      { name: "AT-transport-2", capability: "not-a-capability", unverifiedInvariants: ["i"] },
    ]);
    expect(violations).toHaveLength(3);
    expect(violations.some((v) => v.includes("empty or non-string invariant list"))).toBe(true);
    expect(violations.some((v) => v.includes("has no name"))).toBe(true);
    expect(violations.some((v) => v.includes("unknown capability"))).toBe(true);
  });
});

// ═════════════ §5 — the live uid-0 path, made reachable on a non-root runner ═════════════

/**
 * On this runner uid is 501, so `uid-nonroot` is available and no capability skip ever fires —
 * which is precisely why C1/C2 were dormant. Spoofing `process.getuid` to return 0 makes the
 * uid-0 branch live for the duration of one test, so a real `itOrSkip` registration travels the
 * full production route into the sink. `driftCapabilities.js` memoises capability probes per
 * module registry, and jest gives this file its own registry, so the spoof cannot leak into
 * another test file's probe cache. It is restored in `finally` regardless.
 *
 * `itOrSkip` is called from inside a running test, so its `isInsideRunningTest()` branch returns
 * without registering a jest test — this file therefore adds no reported "skipped" test, and the
 * loud stderr skip line is captured by the spy rather than printed into the run log.
 */
describe("DOD-11 §5 — a real uid-0 itOrSkip registration reaches the sink and the comparator", () => {
  const entry = SKIP_INVENTORY.find((e) => e.capability === "uid-nonroot");

  function asRoot(fn) {
    const originalGetuid = process.getuid;
    const originalWrite = process.stderr.write;
    const captured = [];
    process.stderr.write = (chunk) => {
      captured.push(String(chunk));
      return true;
    };
    process.getuid = () => 0;
    try {
      return fn(captured);
    } finally {
      process.getuid = originalGetuid;
      process.stderr.write = originalWrite;
    }
  }

  it("DOD-11(p) — the registration lands in the sink and validates clean against SKIP_INVENTORY", () => {
    const path = useSink("live-skip");
    let bodyRan = false;

    const printed = asRoot((captured) => {
      itOrSkip(entry.name, entry.capability, [...entry.unverifiedInvariants], () => {
        bodyRan = true;
      });
      return captured.join("");
    });

    // The gate really skipped (body never ran) and it skipped loudly, naming its invariants.
    expect(bodyRan).toBe(false);
    expect(printed).toContain(`SKIPPED ${entry.name}`);
    expect(printed).toContain(entry.unverifiedInvariants[0]);

    // …and the record travelled the transport, not a literal.
    const { records, malformedLines } = readSkipRecords(path);
    expect(malformedLines).toEqual([]);
    expect(records).toHaveLength(1);
    expect(records[0].name).toBe(entry.name);
    expect(records[0].capability).toBe(entry.capability);
    expect(records[0].unverifiedInvariants).toEqual([...entry.unverifiedInvariants]);
    expect(records[0].origin).toContain("skipSinkTransport.test.js");

    // C1 and C2 now evaluate over a non-empty record set on this non-root runner.
    expect(validateSkipRecords(records, SKIP_INVENTORY)).toEqual([]);
  });

  it("DOD-11(q) — a live registration that drifts from its inventory row is caught by C2", () => {
    const path = useSink("live-skip-drift");

    asRoot(() => {
      itOrSkip(entry.name, entry.capability, ["a wording the inventory does not carry"], () => {});
    });

    const { records } = readSkipRecords(path);
    expect(records).toHaveLength(1);
    const violations = validateSkipRecords(records, SKIP_INVENTORY);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("verbatim");
    expect(violations[0]).toContain(entry.name);
  });
});
