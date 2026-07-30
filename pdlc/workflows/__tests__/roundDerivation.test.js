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
