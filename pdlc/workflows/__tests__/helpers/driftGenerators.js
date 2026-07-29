/**
 * driftGenerators.js — the seeded, dependency-free property-generation library (PROPERTIES
 * §1.3). No property-testing dependency is added (jest is `package.json`'s only
 * devDependency); this file is excluded from jest by the existing `testPathIgnorePatterns`
 * (`/__tests__/helpers/`).
 *
 * Ownership (PLAN, single-writer-per-file): T-40 (batch 7). Consumed by every property task
 * (T-41…T-50); none of them may re-declare a generator this file already exports.
 *
 * Exports:
 *   - `seeded(seed)`              — xorshift32 PRNG: `{ int(lo,hi), pick(arr), shuffle(arr),
 *                                    bytes(n), seed }` (§1.3 rule 1).
 *   - `resolveSeed(literalSeed)`  — applies the `PDLC_PROP_SEED` override (§1.3 rule 1): when
 *                                    the env var is set to a decimal integer, every file's
 *                                    literal seed is replaced by it; unset leaves the literal
 *                                    seed untouched (the only value a CI-less local run ever
 *                                    uses, TSPEC R-3).
 *   - `enumerateLeaves()`         — the eleven leaves of §2.3, exhaustive not sampled (§1.3
 *                                    rule 2). Each leaf carries a `packable` flag: `true` for
 *                                    the eight hash-present, non-permission leaves §1.4 packs
 *                                    into rows of one manifest; `false` for L0/L3/L4, which
 *                                    are whole-run-only (§1.4) — `enumerateLeaves()` therefore
 *                                    never offers L0 as a per-row spec, which is §2.4's U-1
 *                                    exclusion enforced structurally rather than by a runtime
 *                                    check. (§2.4's U-2 — a `stale` row whose bytes equal the
 *                                    plugin's — is enforced where the bytes are actually
 *                                    written, `setRowState` in `driftFixtures.js`, T-15/T-31;
 *                                    it is not a generator-shape concern.)
 *   - `enumerateEvidenceVectors()` — the twenty baseline evidence vectors of §5.1, closing
 *                                    over E1, E2, E3, E4, E5, E6 and *not* over E7 (varied
 *                                    separately by PROP-BSL-08). Exhaustive, not sampled.
 *   - `genId(rng, force)`         — an `M6_ID_REGEX`-conforming id (§6.2), imported from
 *                                    `document-oracles.mjs` rather than re-declared (§6.2 rule
 *                                    1). `force` lets a caller *require* (not merely hope for)
 *                                    a stamp-shaped / dot-bearing / hyphen-bearing draw for a
 *                                    given case, which is how a consumer enforces §6.2's
 *                                    adversarial-proportion floors across a generated set
 *                                    without this file guessing that set's batch algorithm.
 *   - `genStamp(rng, opts)`       — a 16-byte `YYYYMMDDTHHMMSSZ` stamp (§6.2); `calendarValid:
 *                                    true` draws a real UTC instant in 1970-01-01…2999-12-31,
 *                                    `calendarValid: false` (default) draws syntactically
 *                                    digit-shaped fields with no calendar validity, matching
 *                                    the pattern-based (not calendar-validating) parser (§6.3).
 *   - `shrink(caseValue)`         — the explicit shrink ladder of §2.5, dispatched on
 *                                    `caseValue.kind` (`"manifest"`, `"bytes"`, `"id"`,
 *                                    `"subRecipe"`); returns `[]` for an unrecognised or
 *                                    already-minimal case.
 *   - `readFaultTokens()`         — reads C1's runtime `PDLC_FAULT_TOKENS` array (§8.0): one
 *                                    `execFileSync` sourcing C1 in a child bash, asserting the
 *                                    child's exit status is zero *before* asserting anything
 *                                    about the array, then the 16-entry / all-distinct /
 *                                    all-M6-conforming sanity conjunct.
 */

import { execFileSync } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { M6_ID_REGEX } from "../../lib/document-oracles.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// __dirname = pdlc/workflows/__tests__/helpers; up three levels to pdlc/, then hooks/scripts/lib.
const C1_PATH = resolve(__dirname, "../../../hooks/scripts/lib/pdlc-drift.sh");

// ───────────────────────────── §1.3 — seeded PRNG ─────────────────────────────

/**
 * A stateful xorshift32 generator, consumed in draw order (§1.3 rule 1: reproduction is by
 * replay, not by index — case n is reproduced by replaying draws 1…n).
 *
 * @param {number} seed - a fixed, printed, non-zero 32-bit integer seed.
 * @returns {{int: function(number, number): number, pick: function(Array): *,
 *            shuffle: function(Array): Array, bytes: function(number): Buffer, seed: number}}
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

  const rng = {
    seed,
    int(lo, hi) {
      if (hi < lo) {
        throw new Error(`seeded(${seed}).int: hi (${hi}) < lo (${lo})`);
      }
      const range = hi - lo + 1;
      return lo + (nextU32() % range);
    },
    pick(arr) {
      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error(`seeded(${seed}).pick: array must be non-empty`);
      }
      return arr[rng.int(0, arr.length - 1)];
    },
    shuffle(arr) {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = rng.int(0, i);
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    },
    bytes(n) {
      const out = Buffer.alloc(n);
      for (let i = 0; i < n; i++) {
        out[i] = nextU32() % 256;
      }
      return out;
    },
  };
  return rng;
}

/**
 * Applies the `PDLC_PROP_SEED` override (§1.3 rule 1). A property test file declares its own
 * literal seed constant and passes it through this function; when `PDLC_PROP_SEED` is set in
 * the environment to a decimal integer, that value replaces the literal for every file in the
 * run (a maintainer's deliberate escape hatch to widen the drawn set). Unset — the default,
 * and the only value a CI-less local run ever uses (TSPEC R-3) — leaves the literal untouched.
 *
 * @param {number} literalSeed - the seed constant declared in the calling test file.
 * @returns {number}
 */
export function resolveSeed(literalSeed) {
  const raw = process.env.PDLC_PROP_SEED;
  if (raw === undefined || raw === "") {
    return literalSeed;
  }
  if (!/^-?\d+$/.test(raw)) {
    throw new Error(`resolveSeed: PDLC_PROP_SEED must be a decimal integer, got ${JSON.stringify(raw)}`);
  }
  return Number.parseInt(raw, 10);
}

// ───────────────────────────── §2.3 — the eleven leaves ─────────────────────────────

/**
 * The eleven leaves of PROPERTIES §2.3, exhaustive over the classifier's axis tree (§1.3
 * rule 2 — exhaustive, not sampled). `packable: true` marks the eight hash-present,
 * non-permission leaves §1.4 packs as rows of one manifest (one spawn); `packable: false`
 * marks L0/L3/L4, which are whole-run-only axes and are never offered as a per-row spec —
 * the structural form of §2.4's U-1 exclusion (`hash-tool-absent` cannot appear on a row
 * subset because `enumerateLeaves()` never emits it as one).
 *
 * @returns {Array<{id: string, path: string, state: string, reason: (string|null),
 *                  recipe: string, mode: ("E"|"E-skip"), packable: boolean}>}
 */
export function enumerateLeaves() {
  return [
    {
      id: "L0",
      path: "A0 = absent",
      state: "unknown",
      reason: "hash-tool-absent",
      recipe: "makeToolDir omits shasum/sha1sum/openssl (whole-run only, §2.4 U-1)",
      mode: "E",
      packable: false,
    },
    {
      id: "L1",
      path: "A1 = no",
      state: "unknown",
      reason: "plugin-artifact-missing",
      recipe: "ordinary tree, pluginPath deleted",
      mode: "E",
      packable: true,
    },
    {
      id: "L2",
      path: "A1 = yes, A2 = no",
      state: "unknown",
      reason: "plugin-artifact-unreadable",
      recipe: "PDLC_FAULT=plugin-artifact-read:<id> (token 15)",
      mode: "E",
      packable: true,
    },
    {
      id: "L3",
      path: "A1 = indeterminate",
      state: "unknown",
      reason: "plugin-artifact-unreadable",
      recipe: "chmod 0600 on workflows/dist/ — permission only",
      mode: "E-skip",
      packable: false,
    },
    {
      id: "L4",
      path: "A1 = yes, A2 = yes, A3 = indeterminate",
      state: "unknown",
      reason: "consumer-artifact-unreadable",
      recipe: ".claude/workflows/ mode 0600 — permission only",
      mode: "E-skip",
      packable: false,
    },
    {
      id: "L5",
      path: "A1 = yes, A2 = yes, A3 = yes, A4 = no",
      state: "unknown",
      reason: "consumer-artifact-unreadable",
      recipe: "PDLC_FAULT=consumer-artifact-read:<id> (token 16)",
      mode: "E",
      packable: true,
    },
    {
      id: "L6",
      path: "A1 = yes, A2 = yes, A3 = no",
      state: "missing",
      reason: null,
      recipe: "consumer path absent, .claude/workflows/ present and traversable",
      mode: "E",
      packable: true,
    },
    {
      id: "L7",
      path: "A1 = yes, A2 = yes, A3 = yes, A4 = yes, A5 = equal",
      state: "in-sync",
      reason: null,
      recipe: "consumer bytes := plugin bytes; A6 not asked",
      mode: "E",
      packable: true,
    },
    {
      id: "L8",
      path: "A5 = differ, A6 = no-entry",
      state: "unverified",
      reason: null,
      recipe: "×4 sub-recipes (absent / unreadable / malformed / no-entry-for-id)",
      mode: "E",
      packable: true,
      subRecipes: ["absent", "unreadable", "malformed", "no-entry-for-id"],
    },
    {
      id: "L9",
      path: "A5 = differ, A6 = entry-matches",
      state: "stale",
      reason: null,
      recipe:
        "bytes X != plugin, entry consumerHash = sha1(X), entry pluginHash pinned to a third value (§2.4 U-2: bytes X must differ from the plugin's)",
      mode: "E",
      packable: true,
    },
    {
      id: "L10",
      path: "A5 = differ, A6 = entry-differs",
      state: "local-edit",
      reason: null,
      recipe: "bytes Y, entry over X, X != Y != plugin, entry pluginHash pinned to sha1(plugin)",
      mode: "E",
      packable: true,
    },
  ];
}

// ───────────────────────────── §5.1 — evidence vectors ─────────────────────────────

// The manifest-chain (E2, E3, E4, E5, E6) reachable assignments — 10, per §5.1's derivation
// table. E1 is independent (§5.1) and multiplies all ten by its two values: 10 x 2 = 20.
const MANIFEST_CHAIN_VECTORS = Object.freeze([
  // no plugin root ⇒ nothing downstream is knowable (4)
  { E3: "unset", E2: "holds", E4: "indeterminate", E5: "indeterminate", E6: "indeterminate" },
  { E3: "unset", E2: "does-not-hold", E4: "indeterminate", E5: "indeterminate", E6: "indeterminate" },
  { E3: "unreadable", E2: "holds", E4: "indeterminate", E5: "indeterminate", E6: "indeterminate" },
  {
    E3: "unreadable",
    E2: "does-not-hold",
    E4: "indeterminate",
    E5: "indeterminate",
    E6: "indeterminate",
  },
  // the first-release vector: manifest absent, malformed/empty unknowable (2)
  { E3: "ok", E4: "holds", E2: "holds", E5: "indeterminate", E6: "indeterminate" },
  { E3: "ok", E4: "holds", E2: "does-not-hold", E5: "indeterminate", E6: "indeterminate" },
  // manifest present, no JSON tool (1)
  { E3: "ok", E4: "does-not-hold", E2: "holds", E5: "indeterminate", E6: "indeterminate" },
  // malformed ⇒ emptiness unknowable (1)
  { E3: "ok", E4: "does-not-hold", E2: "does-not-hold", E5: "holds", E6: "indeterminate" },
  // well-formed manifest, empty or not (2)
  { E3: "ok", E4: "does-not-hold", E2: "does-not-hold", E5: "does-not-hold", E6: "holds" },
  {
    E3: "ok",
    E4: "does-not-hold",
    E2: "does-not-hold",
    E5: "does-not-hold",
    E6: "does-not-hold",
  },
]);

/**
 * The twenty baseline-resolution evidence vectors of §5.1, closing over E1, E2, E3, E4, E5, E6
 * — and *not* over E7 (`checkEnabled`), which PROP-BSL-08 alone varies over its six config
 * states. Exhaustive, not sampled (§1.3 rule 2).
 *
 * @returns {Array<{E1: string, E2: string, E3: string, E4: string, E5: string, E6: string}>}
 */
export function enumerateEvidenceVectors() {
  const vectors = [];
  for (const e1 of ["holds", "does-not-hold"]) {
    for (const chain of MANIFEST_CHAIN_VECTORS) {
      vectors.push({ E1: e1, ...chain });
    }
  }
  return vectors;
}

// ───────────────────────────── §6.2 — genId / genStamp ─────────────────────────────

const ID_FIRST_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
const ID_BODY_CHARS = ID_FIRST_CHARS.concat(["."], ["_"], ["-"]);

function insertChar(str, rng, ch) {
  // Never at position 0 — the first byte must stay alphanumeric (M6_ID_REGEX). Truncates back
  // to 64 bytes if the insertion would overflow the ceiling §6.2 states.
  const pos = rng.int(1, str.length);
  const out = str.slice(0, pos) + ch + str.slice(pos);
  return out.length > 64 ? out.slice(0, 64) : out;
}

function stampShapedId(rng) {
  const stamp = genStamp(rng, { calendarValid: true });
  const variant = rng.int(0, 2);
  if (variant === 0) return stamp; // "20260101T000000Z"
  if (variant === 1) return `x.${stamp}-01`; // "x.20260101T000000Z-01"
  return `dev.${stamp}`; // "dev.20260101T000000Z"
}

/**
 * An `M6_ID_REGEX`-conforming id (§6.2): 1-64 bytes, first byte alphanumeric, body drawn from
 * `[A-Za-z0-9._-]`. The id charset is imported from `document-oracles.mjs`, never re-declared
 * (§6.2 rule 1) — `M6_ID_REGEX` is asserted against every draw below.
 *
 * §6.2's adversarial floors ("forced, not hoped for") are properties of a *generated set*, not
 * of one draw, so this file cannot enforce them unilaterally; instead `force` lets the caller
 * require a specific draw shape for a specific case, which is how a consumer (e.g. T-49's 500
 * batched cases) guarantees an exact quota deterministically rather than hoping random draws
 * clear the floor.
 *
 * @param {ReturnType<typeof seeded>} rng
 * @param {{stampShaped?: boolean, containsDot?: boolean, containsHyphen?: boolean}} [force]
 * @returns {string}
 */
export function genId(rng, force = {}) {
  let out;
  if (force.stampShaped) {
    out = stampShapedId(rng);
  } else {
    const len = rng.int(1, 64);
    out = rng.pick(ID_FIRST_CHARS);
    for (let i = 1; i < len; i++) {
      out += rng.pick(ID_BODY_CHARS);
    }
    if (force.containsDot && !out.includes(".")) {
      out = insertChar(out, rng, ".");
    }
    if (force.containsHyphen && !out.includes("-")) {
      out = insertChar(out, rng, "-");
    }
  }
  if (!M6_ID_REGEX.test(out)) {
    // Defensive: every code path above is constructed to conform; a mismatch here is this
    // generator's own bug, not a property under test, so it fails loudly rather than handing
    // a non-conforming id to a property that assumes conformance.
    throw new Error(`genId: drew a non-M6-conforming id ${JSON.stringify(out)}`);
  }
  return out;
}

function pad(n, width) {
  return String(n).padStart(width, "0");
}

/**
 * A 16-byte `YYYYMMDDTHHMMSSZ` stamp (§6.2). `calendarValid: true` draws a real UTC instant in
 * 1970-01-01 … 2999-12-31; `calendarValid: false` (the default) draws syntactically
 * digit-shaped fields with no calendar validity (month/day/hour/minute/second may be
 * out-of-range), matching the pattern-based, non-calendar-validating parser (§6.3).
 *
 * @param {ReturnType<typeof seeded>} rng
 * @param {{calendarValid?: boolean}} [opts]
 * @returns {string}
 */
export function genStamp(rng, { calendarValid = false } = {}) {
  if (calendarValid) {
    const minDay = Math.floor(Date.UTC(1970, 0, 1) / 86400000);
    const maxDay = Math.floor(Date.UTC(2999, 11, 31) / 86400000);
    const day = rng.int(minDay, maxDay);
    const hour = rng.int(0, 23);
    const minute = rng.int(0, 59);
    const second = rng.int(0, 59);
    const d = new Date(day * 86400000);
    return (
      pad(d.getUTCFullYear(), 4) +
      pad(d.getUTCMonth() + 1, 2) +
      pad(d.getUTCDate(), 2) +
      "T" +
      pad(hour, 2) +
      pad(minute, 2) +
      pad(second, 2) +
      "Z"
    );
  }
  const year = pad(rng.int(0, 9999), 4);
  const month = pad(rng.int(0, 19), 2); // deliberately admits > 12 — syntax, not calendar
  const day = pad(rng.int(0, 39), 2); // deliberately admits > 31
  const hour = pad(rng.int(0, 29), 2); // deliberately admits > 23
  const minute = pad(rng.int(0, 69), 2);
  const second = pad(rng.int(0, 69), 2);
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

// ───────────────────────────── §2.5 — shrink ladder ─────────────────────────────

const SUB_RECIPE_ORDER = Object.freeze(["absent", "unreadable", "malformed", "no-entry-for-id"]);
const BYTES_FLOOR = 64;

/**
 * The explicit shrink ladder of §2.5 — a short, ordered list of strictly simpler cases, never
 * a search. Dispatches on `caseValue.kind`:
 *   - `"manifest"` (rule 1, fewest rows) — `{ kind: "manifest", rows: [...] }` shrinks to one
 *     one-row manifest per original row.
 *   - `"bytes"` (rule 2, shortest bytes, never below the 64-byte floor) — `{ kind: "bytes",
 *     bytes: Buffer }`.
 *   - `"id"` (rule 3, simplest id) — `{ kind: "id", value: string }` shrinks toward `"a"`,
 *     then `"a0"`, then the drawn value; a stamp-shaped id is never placed before the drawn
 *     value, so it shrinks last.
 *   - `"subRecipe"` (rule 4, simplest A6 no-entry sub-recipe) — `{ kind: "subRecipe", value:
 *     string }` shrinks toward `"absent"`.
 *
 * Unrecognised or already-minimal cases return `[]` — the harness stops walking the ladder.
 *
 * @param {{kind: string, [key: string]: *}} caseValue
 * @returns {Array<Object>}
 */
export function shrink(caseValue) {
  if (caseValue == null || typeof caseValue !== "object") {
    return [];
  }

  switch (caseValue.kind) {
    case "manifest": {
      const rows = Array.isArray(caseValue.rows) ? caseValue.rows : [];
      if (rows.length <= 1) return [];
      return rows.map((row) => ({ kind: "manifest", rows: [row] }));
    }
    case "bytes": {
      const bytes = caseValue.bytes;
      if (!bytes || bytes.length <= BYTES_FLOOR) return [];
      return [{ kind: "bytes", bytes: bytes.slice(0, BYTES_FLOOR) }];
    }
    case "id": {
      const value = caseValue.value;
      const ladder = ["a", "a0"];
      if (!ladder.includes(value)) {
        ladder.push(value);
      }
      return ladder.map((v) => ({ kind: "id", value: v }));
    }
    case "subRecipe": {
      const idx = SUB_RECIPE_ORDER.indexOf(caseValue.value);
      if (idx <= 0) return [];
      return SUB_RECIPE_ORDER.slice(0, idx).map((value) => ({ kind: "subRecipe", value }));
    }
    default:
      return [];
  }
}

// ───────────────────────────── §8.0 — readFaultTokens ─────────────────────────────

/**
 * Reads C1's runtime `PDLC_FAULT_TOKENS` array (§8.0) via a single `execFileSync` that sources
 * C1 in a child bash and prints the array. This reads the runtime value of the array *after*
 * C1 has been sourced — not the text of the file — so PROP-SEAM-01 (which consumes this
 * function) stays genuinely independent of PROP-SEAM-02 (which reads the three shipped bash
 * files as text, §8.1).
 *
 * `execFileSync` throws synchronously on a non-zero child exit status, which is what makes
 * the exit-status assertion happen *before* anything about the array is asserted below — a
 * `readonly`-reassignment error from a mis-guarded C1 (or any other sourcing failure) surfaces
 * as a thrown harness error, never as a silently empty array. The 16-entry / all-distinct /
 * all-M6-conforming sanity conjunct then guards PROP-SEAM-01 against vacuity from a
 * mis-sourced file or a renamed variable that would otherwise resolve to `[]`.
 *
 * @returns {string[]} exactly 16 distinct, M6-conforming fault tokens, in C1's declared order.
 */
export function readFaultTokens() {
  let stdout;
  try {
    stdout = execFileSync(
      "bash",
      ["-c", 'source "$1"; printf "%s\\n" "${PDLC_FAULT_TOKENS[@]}"', "bash", C1_PATH],
      { encoding: "utf8" },
    );
  } catch (err) {
    const status = err.status === undefined || err.status === null ? "unknown" : err.status;
    throw new Error(
      `readFaultTokens: sourcing C1 (${C1_PATH}) exited with status ${status} (expected 0): ${err.message}`,
    );
  }

  const tokens = stdout.split("\n").filter((line) => line.length > 0);

  if (tokens.length !== 16) {
    throw new Error(
      `readFaultTokens: expected exactly 16 PDLC_FAULT_TOKENS entries, got ${tokens.length}: ${JSON.stringify(tokens)}`,
    );
  }

  const seen = new Set();
  for (const token of tokens) {
    if (!M6_ID_REGEX.test(token)) {
      throw new Error(`readFaultTokens: token ${JSON.stringify(token)} does not match M6_ID_REGEX`);
    }
    if (seen.has(token)) {
      throw new Error(`readFaultTokens: duplicate token ${JSON.stringify(token)}`);
    }
    seen.add(token);
  }

  return tokens;
}
