/**
 * driftGenerators.js — seeded, dependency-free property-generation library (PROPERTIES
 * §1.3). No property-testing dependency is added (jest is package.json's only
 * devDependency); this file is excluded from jest by the existing testPathIgnorePatterns
 * (`/__tests__/helpers/`).
 *
 * Ownership (PLAN, single-writer-per-file): T-40 (batch 7). Reduced by PLAN T16
 * (pdlc-plugin-retirement): this file used to also export `enumerateLeaves`,
 * `enumerateEvidenceVectors`, `genId`, `genStamp`, and `readFaultTokens`, but PLAN T15
 * deleted the M-8 drift-fixture suites that were those five generators' only consumers, so
 * this file now exports only the three primitives its eight surviving importers
 * (`approvalHash.test.js`, `completeness.test.js`, `consumerCleanup.test.js`,
 * `forcePhases.test.js`, `pacingWrapper.test.js`, `roundDerivation.test.js`,
 * `scanLines.test.js`, and `consolidationPreflight.test.js`'s dynamic-import presence
 * check) actually use.
 *
 * Exports:
 * - `seeded(seed)` — a xorshift32 PRNG: `{ int(lo,hi), pick(arr), shuffle(arr),
 *   bytes(n), seed }` (§1.3 rule 1).
 * - `resolveSeed(literalSeed)` — applies the `PDLC_PROP_SEED` override (§1.3 rule 1):
 *   when the env var is set to a decimal integer, the file's own literal seed is replaced
 *   by it; when unset it leaves the literal seed untouched (only a CI-less local run ever
 *   uses this override, TSPEC R-3).
 * - `shrink(caseValue)` — the explicit shrink ladder (§2.5), dispatched on
 *   `caseValue.kind` (`"manifest"`, `"bytes"`, `"id"`, `"subRecipe"`); returns `[]` for an
 *   unrecognised or already-minimal case.
 */

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
