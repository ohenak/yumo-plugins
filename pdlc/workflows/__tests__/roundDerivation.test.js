/**
 * roundDerivation.test.js — the H-1 fix: filename grammar (TSPEC §5.2 G-1…G-4) and
 * branch-derived round-index derivation (`deriveRoundWindow`, TSPEC §5.2 steps 1–7).
 *
 * Owns, per PLAN §4 row RLH-11 and TSPEC §8.3's AT→file map:
 *   RLH-AT-01 … RLH-AT-07, RLH-AT-63, plus TSPEC §8.2's two property rows for
 *   `parseReviewFilename` (round-trip) and `deriveRoundWindow` (window invariant, and the
 *   partition **restated over `parseReviewFilename`'s total three-way split**).
 *
 * RED on arrival (batch 2). Neither `parseReviewFilename`, `deriveRoundWindow`,
 * `reviewerSkillForSlug`, `FILENAME_FAILURES` nor `LIST_FAILURES` exists in
 * `orchestrate-dev.js` at HEAD, and no `reviewLoop` call site passes a derived `iteration`.
 * Every assertion below therefore reds on its own oracle — the subject is absent, not
 * mis-shaped. Permitted-red windows (PLAN §7.3):
 *   - RLH-AT-01 … -06, -63 and both properties: red at batch 2, green from batch 3 (RLH-05 (e)).
 *   - RLH-AT-07: red at batches 2–7, green from batch 8 (RLH-26 — the call-site half).
 *
 * Test names are namespaced `RLH-AT-{N}` (PLAN §1.3 / TSPEC §8.3): bare `AT-{N}` collides with
 * `documentOracles.test.js`'s pre-existing intentional red `AT-22 [red-until-L-06]`.
 *
 * Property generation: `__tests__/helpers/driftGenerators.js` supplies the **primitives**
 * (`seeded`, `resolveSeed`, `shrink`) unmodified; the review-filename domain generators below
 * are file-local and unexported, per PLAN §7.2 (no second primitive library, no shared domain
 * module). Reproduction is by **replay, not by index**: the seed is printed with any failure and
 * case n is reproduced by replaying draws 1…n.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { seeded, resolveSeed, shrink } from "./helpers/driftGenerators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEV_SOURCE_PATH = join(__dirname, "..", "orchestrate-dev.js");

/**
 * The literal seed this file declares, passed through `resolveSeed` so `PDLC_PROP_SEED` can
 * widen the drawn set for a deliberate maintainer run (driftGenerators §1.3 rule 1).
 */
const LITERAL_SEED = 0x5f2c1a37;
const SEED = resolveSeed(LITERAL_SEED);

/** TSPEC §5.2 G-2: the closed role catalogue is `reviewerRoleSlug`'s `MAP` **values**. */
const ROLE_SLUGS = Object.freeze(["software-engineer", "product-manager", "test-engineer"]);

/** TSPEC §5.2: the closed doc-type catalogue `parseReviewFilename` validates against. */
const DOC_TYPES = Object.freeze(["REQ", "FSPEC", "TSPEC", "PLAN", "PROPERTIES", "DECISIONS"]);

/**
 * TSPEC §4.8's `MAX_REVIEW_ROUNDS = 5`. The constant is deliberately **not exported** (§4.8:
 * "tests reach them through observable behaviour"), so this file restates the window width and
 * asserts it through `deriveRoundWindow`'s returned span rather than importing it.
 */
const EXPECTED_WINDOW_WIDTH = 5;

/** TSPEC §4.1's `FILENAME_FAILURES`, restated here as the property's expectation. */
const EXPECTED_FILENAME_FAILURES = Object.freeze([
  "not_cross_review",
  "bad_role",
  "bad_doc_type",
  "bad_round",
  "trailing_junk",
]);

/** TSPEC §4.1's `LIST_FAILURES`; §4.2 makes `dir_missing` the sole benign member. */
const EXPECTED_LIST_FAILURES = Object.freeze([
  "dir_missing",
  "not_a_directory",
  "unreadable",
  "bad_argument",
]);
const BENIGN_LIST_FAILURE = "dir_missing";

// ─────────────────────────── file-local domain generators ───────────────────────────
// Built over `driftGenerators.js`'s primitives only (`rng.int`, `rng.pick`, `rng.shuffle`).
// Unexported by design: PLAN §7.2 keeps each property's domain generator local to its file, so
// a wrong builder reds only its own property.

/** Lowercase, hyphen-joined slugs that satisfy the regex but are NOT in `MAP`'s values (G-2). */
const NON_CATALOGUE_ROLES = Object.freeze([
  "architect",
  "se",
  "te",
  "pm",
  "designer",
  "data-scientist",
]);

/** Uppercase tokens that satisfy `[A-Z][A-Z_]*` but are NOT in the doc-type catalogue. */
const NON_CATALOGUE_DOC_TYPES = Object.freeze(["SPEC", "REQS", "DESIGN", "NOTES", "READ_ME"]);

/** Prefixes that break `^CROSS-REVIEW-` outright. */
const NON_PREFIXES = Object.freeze(["CROSSREVIEW-", "REVIEW-", "X-CROSS-REVIEW-", "cross-review-"]);

/** Round tokens G-3 rejects: leading zeros and zero itself. */
const BAD_ROUND_TOKENS = Object.freeze(["0", "01", "007", "0001"]);

/** Suffixes G-4 rejects because `$` follows `\.md` immediately. */
const JUNK_SUFFIXES = Object.freeze([".backup", ".bak", ".orig", ".save"]);

/** Files a `docs/{feature}/` directory legitimately holds that are not cross-reviews at all. */
const UNRELATED_BASENAMES = Object.freeze([
  "REQ-foo.md",
  "FSPEC-foo.md",
  "TSPEC-foo.md",
  "PLAN-foo.md",
  "LEARNINGS-foo.md",
  "POSTMORTEM-R-foo.md",
  "notes.txt",
  "README.md",
]);

/**
 * Assemble a G-1…G-4 conforming basename.
 * @param {{role: string, docType: string, round: number, suffixed: boolean}} parts
 * @returns {string}
 */
function buildBasename({ role, docType, round, suffixed }) {
  return suffixed
    ? `CROSS-REVIEW-${role}-${docType}-v${round}.md`
    : `CROSS-REVIEW-${role}-${docType}.md`;
}

/**
 * One round-trip draw: a conforming basename plus the three fields it was assembled from.
 * `suffixed: false` denotes round 1 (TSPEC §5.2, "the un-suffixed form is round 1").
 * @param {ReturnType<typeof seeded>} rng
 */
function genConformingCase(rng) {
  const role = rng.pick(ROLE_SLUGS.slice());
  const docType = rng.pick(DOC_TYPES.slice());
  const suffixed = rng.int(0, 3) > 0; // ~75% suffixed, ~25% un-suffixed round 1
  const round = suffixed ? rng.int(1, 999) : 1;
  const parts = { role, docType, round, suffixed };
  return { kind: "id", value: buildBasename(parts), ...parts };
}

/**
 * Mutate exactly one part of a conforming case, returning the mutated basename and the
 * `FILENAME_FAILURES` member that part governs (TSPEC §4.1, §5.2's G-1…G-4 table).
 * @param {ReturnType<typeof seeded>} rng
 * @param {{role: string, docType: string, round: number, suffixed: boolean}} parts
 * @param {"prefix"|"role"|"docType"|"round"|"junk"} part
 */
function mutateBasename(rng, parts, part) {
  switch (part) {
    case "prefix":
      return {
        basename: rng.pick(NON_PREFIXES.slice()) + buildBasename(parts).slice("CROSS-REVIEW-".length),
        reason: "not_cross_review",
      };
    case "role":
      return {
        basename: buildBasename({ ...parts, role: rng.pick(NON_CATALOGUE_ROLES.slice()) }),
        reason: "bad_role",
      };
    case "docType":
      return {
        basename: buildBasename({ ...parts, docType: rng.pick(NON_CATALOGUE_DOC_TYPES.slice()) }),
        reason: "bad_doc_type",
      };
    case "round":
      // G-3: `[1-9][0-9]*` — a leading zero (or a bare 0) is the round token's own failure.
      return {
        basename: `CROSS-REVIEW-${parts.role}-${parts.docType}-v${rng.pick(BAD_ROUND_TOKENS.slice())}.md`,
        reason: "bad_round",
      };
    case "junk":
    default:
      // G-4, TSPEC's own example shape `CROSS-REVIEW-…-v2.backup.md`. Always built over the
      // suffixed form so the junk unambiguously follows a well-formed round token.
      return {
        basename: `CROSS-REVIEW-${parts.role}-${parts.docType}-v${parts.round}${rng.pick(
          JUNK_SUFFIXES.slice(),
        )}.md`,
        reason: "trailing_junk",
      };
  }
}

const MUTATION_PARTS = Object.freeze(["prefix", "role", "docType", "round", "junk"]);

/**
 * A shuffled directory listing mixing all four kinds TSPEC §8.2's generated-input column names:
 * conforming basenames for the target doc type, conforming ones for other doc types,
 * non-conforming ones, and unrelated files. Never emits two files claiming round 1 for one
 * (role, doc type) — that is §5.2 step 5's halt, which the window-invariant property excludes by
 * construction and RLH-AT-63 asserts directly.
 *
 * @param {ReturnType<typeof seeded>} rng
 * @param {string} targetDocType
 * @returns {{kind: "manifest", rows: string[], targetDocType: string}}
 */
function genListing(rng, targetDocType) {
  const rows = [];
  const usedRoundKeys = new Set();

  const emitConforming = (docType) => {
    const role = rng.pick(ROLE_SLUGS.slice());
    const suffixed = rng.int(0, 3) > 0;
    const round = suffixed ? rng.int(1, 60) : 1;
    const key = `${role}|${docType}|${round}`;
    if (usedRoundKeys.has(key)) return;
    usedRoundKeys.add(key);
    rows.push(buildBasename({ role, docType, round, suffixed }));
  };

  for (let i = 0, n = rng.int(0, 6); i < n; i++) emitConforming(targetDocType);
  for (let i = 0, n = rng.int(0, 4); i < n; i++) {
    const others = DOC_TYPES.filter((d) => d !== targetDocType);
    emitConforming(rng.pick(others));
  }
  for (let i = 0, n = rng.int(0, 4); i < n; i++) {
    const parts = genConformingCase(rng);
    rows.push(mutateBasename(rng, parts, rng.pick(MUTATION_PARTS.slice())).basename);
  }
  for (let i = 0, n = rng.int(0, 3); i < n; i++) rows.push(rng.pick(UNRELATED_BASENAMES.slice()));

  return { kind: "manifest", rows: rng.shuffle(rows), targetDocType };
}

/**
 * Failure-report helper. Prints the seed (reproduction is by **replay**: re-run with
 * `PDLC_PROP_SEED=<seed>` and replay draws 1…n) and walks `driftGenerators`' shipped `shrink`
 * ladder for a smaller witness. Used on the failure path only, never on the pass path (PLAN §7.2).
 *
 * @param {string} label
 * @param {{kind: string}} caseValue
 * @param {function({kind: string}): boolean} stillFails
 * @returns {string}
 */
function describeFailure(label, caseValue, stillFails) {
  let witness = caseValue;
  for (let depth = 0; depth < 4; depth++) {
    const smaller = shrink(witness).find((candidate) => {
      try {
        return stillFails(candidate);
      } catch {
        return true;
      }
    });
    if (!smaller) break;
    witness = smaller;
  }
  return `${label} [seed ${SEED}] failing case: ${JSON.stringify(caseValue)}; shrunk witness: ${JSON.stringify(witness)}`;
}
