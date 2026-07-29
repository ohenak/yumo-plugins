/**
 * driftCapabilities.js — Runner capability policy and skip-loudly vocabulary (TSPEC §1.3, §7.3).
 *
 * Four runner capabilities gate fixtures: `bash`, `git` (>= 2.7.0), a hash utility
 * (`shasum`|`sha1sum`|`openssl`), and non-root uid (`uid-nonroot`). A test whose fixture is
 * unconstructible on this runner skips loudly — it never silently passes and it never silently
 * disappears (TSPEC §1.3).
 *
 * Contract (TSPEC §1.3, normative):
 *   1. `capability` is one of the four keys above, or a `+`-joined conjunction of them. It is
 *      probed once per file and memoised; probes are `execFileSync` with `stdio: "pipe"` inside
 *      try/catch, and `process.getuid` for uid (absent on Windows => treated as non-root).
 *   2. `unverifiedInvariants` is a non-empty array of strings. `describeOrSkip`/`itOrSkip` throw
 *      when it is empty or absent.
 *   3. On skip, the helper prints one line to stderr (TSPEC §7.3) and registers a `test.skip`
 *      (via `describe.skip`/`it.skip`) so the skip appears in jest's report.
 *   4. The named uid-0 skip inventory (TSPEC §1.3's table, extended by PROPERTIES §11.1) is
 *      exported below both as individual invariant-string constants and as a single frozen,
 *      machine-readable inventory array.
 */

import { execFileSync } from "child_process";

// ─── Printed skip reasons (TSPEC §7.3) ─────────────────────────────────────────────────

const PRINTED_REASONS = Object.freeze({
  "uid-nonroot":
    "runner uid is 0, so permission bits are bypassed and the operation succeeds; the fixture's failure cannot be constructed",
  hash: "no sha1 utility (shasum/sha1sum/openssl) on PATH; every managed row would classify unknown/hash-tool-absent",
  git: "git is not on PATH (or is older than 2.7.0), so `git worktree list --porcelain` is unavailable",
  bash: "bash is not available on this runner",
});

const KNOWN_CAPABILITIES = Object.keys(PRINTED_REASONS);

// ─── Named uid-0 skip inventory (TSPEC §1.3 table, PROPERTIES §11.1) ───────────────────
//
// Exported as individual frozen invariant-string arrays so no call site hand-writes one, and
// as a single frozen, machine-readable inventory (the union of TSPEC §1.3's rows and
// PROPERTIES §11.1's) so "zero unexpected skips" is a mechanical comparator (TE F-10).

export const INVARIANTS_AT_14B = Object.freeze([
  "rung (i) preserves checkEnabled:false (FSPEC §4.4, §2.7)",
  "FSPEC §6.2 row 2's opt-out stays reachable on an unwritable-parent consumer",
]);

export const INVARIANTS_AT_16 = Object.freeze([
  "rung (iii) residual: N-3 emitted at every computation",
  "--check exit 4 / hook exit 0",
]);

export const INVARIANTS_AT_27 = Object.freeze([
  "AC-2.9(4)'s negative: original bytes untouched on backup-verify failure",
]);

export const INVARIANTS_AT_32A = Object.freeze([
  "AC-0.6: N-6 emitted and no row state changes",
]);

export const INVARIANTS_AT_34 = Object.freeze([
  "O-8's degraded-provenance wording; N-4 emitted for unreadable, not for absent",
]);

export const INVARIANTS_PLUGIN_ARTIFACT_UNREADABLE = Object.freeze([
  "the row reason is reached by a read denial on the plugin side, not by the manifest read",
]);

export const INVARIANTS_CONSUMER_ARTIFACT_UNREADABLE = Object.freeze([
  "the row reason is reached by a read denial on the consumer side",
]);

// PROPERTIES §11.1's leaf-level entries, added to the union (TSPEC R-2's corrected framing:
// two uid-0 *leaves*, L3 and L4, not two reasons).
export const INVARIANTS_PROP_CLS_01_L3 = Object.freeze([
  "leaf L3 (plugin-side existence undecidable => unknown/plugin-artifact-unreadable) unverified; reason stays covered by leaf L2 via PDLC_FAULT=plugin-artifact-read",
]);

export const INVARIANTS_PROP_CLS_01_L4 = Object.freeze([
  "leaf L4 (consumer-side existence undecidable => unknown/consumer-artifact-unreadable) unverified; reason stays covered by leaf L5 via PDLC_FAULT=consumer-artifact-read",
]);

export const INVARIANTS_PROP_CLS_03_RSN_04_L3_L4 = Object.freeze([
  "totality side-attribution verified over nine leaves constructible on runner (L0, L1, L2, L5, L6, L7, L8, L9, L10); two existence-indeterminate leaves L3 and L4 are not",
]);

/**
 * The named uid-0 skip inventory (TSPEC §1.3 ∪ PROPERTIES §11.1), as a frozen array of
 * `{name, capability, unverifiedInvariants}` records. `REGISTERED_SKIPS` below is checked
 * against this inventory: every skip actually emitted must name one of these entries, and
 * every entry here must have a non-empty invariant list.
 */
export const SKIP_INVENTORY = Object.freeze([
  Object.freeze({ name: "AT-14b", capability: "uid-nonroot", unverifiedInvariants: INVARIANTS_AT_14B }),
  Object.freeze({ name: "AT-16", capability: "uid-nonroot", unverifiedInvariants: INVARIANTS_AT_16 }),
  Object.freeze({ name: "AT-27", capability: "uid-nonroot", unverifiedInvariants: INVARIANTS_AT_27 }),
  Object.freeze({ name: "AT-32(a)", capability: "uid-nonroot", unverifiedInvariants: INVARIANTS_AT_32A }),
  Object.freeze({ name: "AT-34", capability: "uid-nonroot", unverifiedInvariants: INVARIANTS_AT_34 }),
  Object.freeze({
    name: "plugin-artifact-unreadable",
    capability: "uid-nonroot",
    unverifiedInvariants: INVARIANTS_PLUGIN_ARTIFACT_UNREADABLE,
  }),
  Object.freeze({
    name: "consumer-artifact-unreadable",
    capability: "uid-nonroot",
    unverifiedInvariants: INVARIANTS_CONSUMER_ARTIFACT_UNREADABLE,
  }),
  Object.freeze({
    name: "PROP-CLS-01 leaf L3",
    capability: "uid-nonroot",
    unverifiedInvariants: INVARIANTS_PROP_CLS_01_L3,
  }),
  Object.freeze({
    name: "PROP-CLS-01 leaf L4",
    capability: "uid-nonroot",
    unverifiedInvariants: INVARIANTS_PROP_CLS_01_L4,
  }),
  Object.freeze({
    name: "PROP-CLS-03, PROP-RSN-04 (L3/L4 half)",
    capability: "uid-nonroot",
    unverifiedInvariants: INVARIANTS_PROP_CLS_03_RSN_04_L3_L4,
  }),
]);

/**
 * Every skip actually emitted this test run, as frozen `{name, capability, unverifiedInvariants}`
 * records — populated by `describeOrSkip`/`itOrSkip` below whenever they skip. T-01 compares this
 * against `SKIP_INVENTORY` so "zero unexpected skips" is a mechanical comparator (TE F-10), not an
 * eyeball pass over stderr.
 */
export const REGISTERED_SKIPS = new Set();

// ─── Capability probing (memoised once per file/process) ──────────────────────────────

const probeCache = new Map();

function probeBash() {
  try {
    execFileSync("bash", ["-c", "true"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function probeGit() {
  try {
    const out = execFileSync("git", ["--version"], { stdio: "pipe" }).toString();
    const match = out.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!match) return false;
    const [, major, minor] = match.map(Number);
    return major > 2 || (major === 2 && minor >= 7);
  } catch {
    return false;
  }
}

function probeHash() {
  for (const [cmd, args] of [
    ["shasum", ["--version"]],
    ["sha1sum", ["--version"]],
    ["openssl", ["version"]],
  ]) {
    try {
      execFileSync(cmd, args, { stdio: "pipe" });
      return true;
    } catch {
      // try next candidate
    }
  }
  return false;
}

function probeUidNonroot() {
  if (typeof process.getuid !== "function") {
    // Absent on Windows => treated as non-root (TSPEC §1.3 clause 1).
    return true;
  }
  return process.getuid() !== 0;
}

const PROBES = Object.freeze({
  bash: probeBash,
  git: probeGit,
  hash: probeHash,
  "uid-nonroot": probeUidNonroot,
});

function isCapabilityAvailable(key) {
  if (!probeCache.has(key)) {
    const probe = PROBES[key];
    if (!probe) {
      throw new Error(`driftCapabilities: unknown capability "${key}"`);
    }
    probeCache.set(key, probe());
  }
  return probeCache.get(key);
}

/**
 * Splits a (possibly conjoined) capability string into its known component keys, e.g.
 * `"git+hash"` -> `["git", "hash"]`. Throws on an unrecognised capability name.
 */
function splitCapability(capability) {
  const parts = String(capability)
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);
  for (const part of parts) {
    if (!KNOWN_CAPABILITIES.includes(part)) {
      throw new Error(`driftCapabilities: unknown capability "${part}" in "${capability}"`);
    }
  }
  return parts;
}

/**
 * Resolves a (possibly conjoined) capability against this runner. Returns `{ available, reasons }`
 * — `reasons` names the printed reason (TSPEC §7.3) for every unavailable component.
 */
function resolveCapability(capability) {
  const keys = splitCapability(capability);
  const reasons = [];
  for (const key of keys) {
    if (!isCapabilityAvailable(key)) {
      reasons.push(PRINTED_REASONS[key]);
    }
  }
  return { available: reasons.length === 0, reasons };
}

function assertInvariants(unverifiedInvariants) {
  if (!Array.isArray(unverifiedInvariants) || unverifiedInvariants.length === 0) {
    throw new Error(
      "driftCapabilities: unverifiedInvariants must be a non-empty array of strings (TSPEC §1.3 clause 2) — " +
        "a generic skip line is exactly what FSPEC §10 O-11 forbids"
    );
  }
}

function printSkip(name, reasons, unverifiedInvariants) {
  // eslint-disable-next-line no-console
  process.stderr.write(
    `pdlc-test: SKIPPED ${name} — ${reasons.join("; ")}. Unverified: ${unverifiedInvariants.join("; ")}\n`
  );
}

function registerSkip(name, capability, unverifiedInvariants) {
  REGISTERED_SKIPS.add(Object.freeze({ name, capability, unverifiedInvariants: Object.freeze([...unverifiedInvariants]) }));
}

/**
 * True when called from inside an already-running test body (as opposed to describe-block
 * collection time). Jest disallows registering a new `it()`/`describe()` once a test has
 * started running ("Tests cannot be nested") — call sites that gate an *inner* fixture from
 * within an outer `it()` (TSPEC §1.3, e.g. AT-14b/AT-32(a) sharing an outer test) need
 * `describeOrSkip`/`itOrSkip` to run (or skip) the body inline instead of registering a jest
 * test. `expect.getState().currentTestName` is unset during collection and set once a test is
 * actually executing, so it distinguishes the two call contexts.
 */
function isInsideRunningTest() {
  try {
    return Boolean(expect.getState().currentTestName);
  } catch {
    return false;
  }
}

/**
 * `describe(name, body)` gated on `capability`. Skips loudly (TSPEC §1.3 clause 3) when the
 * capability is unavailable on this runner: prints the pinned reason (§7.3) plus the caller's
 * named invariants to stderr, registers the skip, and calls `describe.skip` so it still appears
 * in jest's report. Throws when `unverifiedInvariants` is empty or absent (§1.3 clause 2).
 *
 * When called from inside an already-running test, registration is impossible (jest forbids
 * nested tests), so the body runs (or is skipped) inline instead.
 */
export function describeOrSkip(name, capability, unverifiedInvariants, body) {
  assertInvariants(unverifiedInvariants);
  const { available, reasons } = resolveCapability(capability);
  if (!available) {
    printSkip(name, reasons, unverifiedInvariants);
    registerSkip(name, capability, unverifiedInvariants);
    return isInsideRunningTest() ? undefined : describe.skip(name, body);
  }
  return isInsideRunningTest() ? body() : describe(name, body);
}

/**
 * `it(name, body)` gated on `capability`. Same skip-loudly contract as `describeOrSkip`,
 * including the inline fallback when called from inside an already-running test.
 */
export function itOrSkip(name, capability, unverifiedInvariants, body) {
  assertInvariants(unverifiedInvariants);
  const { available, reasons } = resolveCapability(capability);
  if (!available) {
    printSkip(name, reasons, unverifiedInvariants);
    registerSkip(name, capability, unverifiedInvariants);
    return isInsideRunningTest() ? undefined : it.skip(name, body);
  }
  return isInsideRunningTest() ? body() : it(name, body);
}
