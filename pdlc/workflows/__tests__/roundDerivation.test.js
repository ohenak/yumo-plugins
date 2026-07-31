/**
 * roundDerivation.test.js — the H-1 fix: filename grammar (TSPEC §5.2 G-1…G-4) and
 * branch-derived round-index derivation (`deriveRoundWindow`, TSPEC §5.2 steps 1–7).
 *
 * Owns, per PLAN §4 row RLH-11 and TSPEC §8.3's AT→file map:
 *   RLH-AT-01 … RLH-AT-07, RLH-AT-63, RLH-MAP-01 (the §3.9 catalogue/dispatch-table
 *   desynchronisation guard, added in Phase DOD round 1 remediation of CR v1 F-1 —
 *   `reviewerSkillForSlug`'s doc comment claimed that guarantee with nothing enforcing
 *   it), plus TSPEC §8.2's two property rows for
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

// ─────────────────────────── shared assertion helpers ───────────────────────────

/** `present` is a `Map<role, number[]>` (TSPEC §3.7); read it without assuming an object. */
function roundsFor(present, role) {
  if (present instanceof Map) return present.get(role) || [];
  return (present && present[role]) || [];
}

/** Every round index recorded in `present`, flattened (TSPEC §5.2 step 3). */
function allPresentIndices(present) {
  const values = present instanceof Map ? Array.from(present.values()) : Object.values(present || {});
  return values.flat();
}

// ─────────────────────────── §5.2 — round-index derivation ───────────────────────────

describe("RLH round-index derivation (TSPEC §5.2)", () => {
  test("RLH-AT-01: round index is derived from the branch, not from 1 (H-1)", () => {
    const basenames = [
      "CROSS-REVIEW-software-engineer-FSPEC-v3.md",
      "CROSS-REVIEW-test-engineer-FSPEC-v3.md",
    ];

    const w = devModule.deriveRoundWindow(basenames, "FSPEC");

    expect(w.ok).toBe(true);
    // The first reviewer dispatch is round 4 and the span logged is `rounds 4..8`.
    expect(w.startIndex).toBe(4);
    expect(w.endIndex).toBe(8);
    // No write targets a -v1, -v2 or -v3 path: every round already on the branch is strictly
    // below the next-reviewer index the window opens at.
    for (const index of allPresentIndices(w.present)) {
      expect(index).toBeLessThan(w.startIndex);
    }
    expect(roundsFor(w.present, "software-engineer")).toEqual([3]);
    expect(roundsFor(w.present, "test-engineer")).toEqual([3]);
  });

  test("RLH-AT-02: un-suffixed first round is index 1", () => {
    const w = devModule.deriveRoundWindow(["CROSS-REVIEW-software-engineer-FSPEC.md"], "FSPEC");

    expect(w.ok).toBe(true);
    // The un-suffixed form denotes round 1 — not "no round" (TSPEC §5.2).
    expect(roundsFor(w.present, "software-engineer")).toEqual([1]);
    expect(w.startIndex).toBe(2);
    expect(w.endIndex).toBe(2 + EXPECTED_WINDOW_WIDTH - 1);
    expect(devModule.parseReviewFilename("CROSS-REVIEW-software-engineer-FSPEC.md")).toMatchObject({
      ok: true,
      role: "software-engineer",
      docType: "FSPEC",
      round: 1,
    });
  });

  test("RLH-AT-03: clean branch is benign (C-4, E-01)", () => {
    // §2.5 step 2: a `dir_missing` ListFailure is treated as an empty listing — the benign
    // disposition of §4.2 — so the derivation runs over `[]` and yields the greenfield window.
    const w = devModule.deriveRoundWindow([], "FSPEC");

    expect(w.ok).toBe(true);
    expect(w.startIndex).toBe(1);
    expect(w.endIndex).toBe(EXPECTED_WINDOW_WIDTH);
    expect(allPresentIndices(w.present)).toEqual([]);
    // `skipped` is empty, not absent, when every basename conformed (TSPEC §5.2 step 7) — a
    // caller emits the "skipped non-conforming" notice iff it is non-empty, so there is no
    // warning and no halt on a clean branch.
    expect(w.skipped).toEqual([]);
    expect(EXPECTED_LIST_FAILURES).toContain(BENIGN_LIST_FAILURE);
    expect(devModule.LIST_FAILURES).toEqual(EXPECTED_LIST_FAILURES);
  });

  test("RLH-AT-04: an unenumerable directory is never treated as an empty listing", () => {
    // The derivation half of AT-04. §4.2 makes the disposition a property of the ListFailure
    // *value*, not of the call site: `dir_missing` alone is benign, and the other three
    // ("cannot judge") halt before any window is derived. This asserts the closed catalogue and
    // that exactly one member carries the benign disposition; the halt *message*
    // (`Cannot enumerate docs/{feature}: not_a_directory`) is asserted where the listing seam
    // exists, per TSPEC §8.3's file map.
    expect(devModule.LIST_FAILURES).toEqual(EXPECTED_LIST_FAILURES);
    expect(Object.isFrozen(devModule.LIST_FAILURES)).toBe(true);

    const nonBenign = EXPECTED_LIST_FAILURES.filter((r) => r !== BENIGN_LIST_FAILURE);
    expect(nonBenign).toEqual(["not_a_directory", "unreadable", "bad_argument"]);

    // The benign value's whole meaning is "an empty listing", and that is the only listing
    // outcome the pure derivation ever sees. It has no representation for a failure, so an
    // implementation that routed `not_a_directory` here would have to fabricate `[]` — which is
    // exactly what the three non-benign dispositions forbid.
    expect(devModule.deriveRoundWindow([], "FSPEC").startIndex).toBe(1);
  });

  test("RLH-AT-05: non-conforming basenames are skipped and reported, without a halt", () => {
    const basenames = [
      "CROSS-REVIEW-software-engineer-FSPEC-v2.md",
      "CROSS-REVIEW-se-FSPEC-v2.md", // unknown slug — G-2
      "CROSS-REVIEW-test-engineer-FSPEC-v2.md",
    ];

    const w = devModule.deriveRoundWindow(basenames, "FSPEC");

    // No halt: the conforming pair is used.
    expect(w.ok).toBe(true);
    expect(w.startIndex).toBe(3);
    expect(roundsFor(w.present, "software-engineer")).toEqual([2]);
    expect(roundsFor(w.present, "test-engineer")).toEqual([2]);
    // The unknown slug never becomes a role.
    expect(roundsFor(w.present, "se")).toEqual([]);

    // Step 1 keeps the reject and step 7 carries it out, so the caller can emit E-03/E-07's
    // notice without re-parsing the listing (§2.4 forbids a parse in the orchestration stratum).
    expect(w.skipped).toEqual([{ basename: "CROSS-REVIEW-se-FSPEC-v2.md", reason: "bad_role" }]);

    const notice = `skipped non-conforming: ${w.skipped.map((s) => s.basename).join(", ")}`;
    expect(notice).toBe("skipped non-conforming: CROSS-REVIEW-se-FSPEC-v2.md");
  });

  test("RLH-AT-06: one listing per phase entry — the derivation consumes it once and takes no seam", () => {
    // The derivation half of AC-1.2. §3.7: every new pure function is synchronous, total and
    // takes no seam, so `deriveRoundWindow` cannot itself list a directory; and §5.2 step 7
    // carries `present` *and* `skipped` out precisely so one listing suffices for the whole
    // phase entry. An implementation that dropped either field would force the caller to
    // re-enumerate, which is the second listing AC-1.2 forbids.
    expect(typeof devModule.deriveRoundWindow).toBe("function");
    expect(devModule.deriveRoundWindow.constructor.name).toBe("Function"); // not AsyncFunction
    expect(devModule.deriveRoundWindow.length).toBe(2); // (basenames, docType) — no seam parameter

    expect(typeof devModule.parseReviewFilename).toBe("function");
    expect(devModule.parseReviewFilename.constructor.name).toBe("Function");
    expect(devModule.parseReviewFilename.length).toBe(1); // (basename) — no seam parameter

    const w = devModule.deriveRoundWindow(
      ["CROSS-REVIEW-software-engineer-FSPEC-v2.md", "notes.txt"],
      "FSPEC",
    );
    expect(Object.keys(w).sort()).toEqual(["endIndex", "ok", "present", "skipped", "startIndex"]);
  });

  test("RLH-AT-63: per-role malformed duplicate halts; two roles at index 1 do not (E-05)", () => {
    // Both files claim round 1 for the SAME role and doc type — step 5 halts rather than
    // guessing which verdict governs. The returned record carries `role` (TSPEC §5.2 step 5 /
    // §3.7); the two offending paths are that role's un-suffixed and `-v1` forms for the doc
    // type under derivation, which is what the operator error names.
    const halted = devModule.deriveRoundWindow(
      ["CROSS-REVIEW-software-engineer-FSPEC.md", "CROSS-REVIEW-software-engineer-FSPEC-v1.md"],
      "FSPEC",
    );

    expect(halted.ok).toBe(false);
    expect(halted.reason).toBe("malformed_round_one_duplicate");
    expect(halted.role).toBe("software-engineer");
    // The halt is instead of a window, not alongside one — nothing downstream can dispatch.
    expect(halted.startIndex).toBeUndefined();
    expect(halted.endIndex).toBeUndefined();

    // Two *different* roles at index 1 is a normal pairable round, not a duplicate.
    const ok = devModule.deriveRoundWindow(
      ["CROSS-REVIEW-software-engineer-FSPEC.md", "CROSS-REVIEW-test-engineer-FSPEC-v1.md"],
      "FSPEC",
    );

    expect(ok.ok).toBe(true);
    expect(ok.startIndex).toBe(2);
    expect(roundsFor(ok.present, "software-engineer")).toEqual([1]);
    expect(roundsFor(ok.present, "test-engineer")).toEqual([1]);
  });
});

// ─────────────────────── AC-1.4 — the derived index reaches reviewLoop ───────────────────────

describe("RLH reviewLoop call sites (TSPEC §5.2 step 4, §3.9)", () => {
  /**
   * Extract the argument text of every `reviewLoop({ … })` **call** in `orchestrate-dev.js`,
   * skipping the declaration. Brace-matched rather than line-matched, because the call sites are
   * multi-line object literals.
   * @param {string} source
   * @returns {string[]}
   */
  function reviewLoopCallArguments(source) {
    const calls = [];
    const marker = "reviewLoop({";
    let from = 0;
    for (;;) {
      const at = source.indexOf(marker, from);
      if (at === -1) break;
      from = at + marker.length;
      const before = source.slice(Math.max(0, at - 24), at);
      if (/function\s+$/.test(before)) continue; // the declaration, not a call
      let depth = 0;
      let end = at + marker.length - 1;
      for (let i = at + marker.length - 1; i < source.length; i++) {
        const ch = source[i];
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      calls.push(source.slice(at + marker.length, end));
    }
    return calls;
  }

  test("RLH-AT-07: all seven reviewLoop call sites pass the branch-derived startIndex", () => {
    // TSPEC §5.2 step 4: "Today `reviewLoop`'s `iteration = 1` default is never overridden by
    // any of its seven call sites, so round 2 writes `-v1` again and destroys round 1. After
    // this change, every call site passes `startIndex`." That is the guard which keeps the
    // round-4 dispatch of AT-01/AT-07 from clobbering an existing `-v4` cross-review: an
    // un-overridden default aims every write back at round 1.
    const source = readFileSync(DEV_SOURCE_PATH, "utf8");
    const calls = reviewLoopCallArguments(source);

    expect(calls).toHaveLength(7); // R, F, T, D, P, PR, CR

    const withoutDerivedIteration = calls.filter(
      (args) => !/\biteration\s*:\s*[^,}]*\bstartIndex\b/.test(args),
    );
    expect(withoutDerivedIteration).toEqual([]);
  });
});

// ─────────────────────────── TSPEC §8.2 — property suite ───────────────────────────

describe("RLH round-derivation properties (TSPEC §8.2)", () => {
  const ROUND_TRIP_CASES = 300;
  const LISTING_CASES = 200;

  test(`RLH-PROP-FILENAME-01: parseReviewFilename round-trips the G-1…G-4 grammar, and each mutated part yields the reason that part governs [seed ${LITERAL_SEED}]`, () => {
    expect(devModule.FILENAME_FAILURES).toEqual(EXPECTED_FILENAME_FAILURES);

    const rng = seeded(SEED);
    const failures = [];

    for (let n = 1; n <= ROUND_TRIP_CASES; n++) {
      const drawn = genConformingCase(rng);

      // (i) Round trip: a basename assembled from the grammar parses back to the role, doc type
      // and round it was assembled from. The un-suffixed form round-trips to round 1 (§5.2).
      const parsed = devModule.parseReviewFilename(drawn.value);
      const roundTripped =
        parsed &&
        parsed.ok === true &&
        parsed.role === drawn.role &&
        parsed.docType === drawn.docType &&
        parsed.round === drawn.round;
      if (!roundTripped) {
        failures.push(
          describeFailure(
            `case ${n}: expected round-trip to ${drawn.role}/${drawn.docType}/${drawn.round}, got ${JSON.stringify(parsed)}`,
            drawn,
            (candidate) =>
              typeof candidate.value === "string" && candidate.value.startsWith("CROSS-REVIEW-"),
          ),
        );
      }

      // (ii) Every deliberately mutated part yields `ok: false` with the reason that part
      // governs — one mutation per case, so the reason is never ambiguous.
      for (const part of MUTATION_PARTS) {
        const { basename, reason } = mutateBasename(rng, drawn, part);
        const result = devModule.parseReviewFilename(basename);
        if (!result || result.ok !== false || result.reason !== reason) {
          failures.push(
            `case ${n} [seed ${SEED}] mutation "${part}": ${JSON.stringify(basename)} expected { ok: false, reason: ${JSON.stringify(reason)} }, got ${JSON.stringify(result)}`,
          );
        }
      }
    }

    expect(failures).toEqual([]);
  });

  test(`RLH-PROP-WINDOW-01: deriveRoundWindow's window invariant, and the partition stated over parseReviewFilename's total three-way split [seed ${LITERAL_SEED}]`, () => {
    const rng = seeded(SEED);
    const failures = [];
    let otherDocTypeDraws = 0;
    let weakFormFalsifiedOn = 0;

    for (let n = 1; n <= LISTING_CASES; n++) {
      const targetDocType = rng.pick(DOC_TYPES.slice());
      const listing = genListing(rng, targetDocType);
      const rows = listing.rows;
      const w = devModule.deriveRoundWindow(rows, targetDocType);

      const note = (message) =>
        failures.push(
          describeFailure(`case ${n}: ${message}`, listing, (candidate) => {
            const probe = devModule.deriveRoundWindow(candidate.rows, targetDocType);
            return !probe || probe.ok !== true;
          }),
        );

      // The generator never emits two files claiming round 1 for one (role, doc type), so no
      // case here trips §5.2 step 5 — the invariant below is stated over exactly those listings.
      if (!w || w.ok !== true) {
        note(`expected ok: true, got ${JSON.stringify(w)}`);
        continue;
      }

      // (i) Window invariant: endIndex === startIndex + MAX_REVIEW_ROUNDS - 1, and startIndex is
      // one past the highest index present (1 when none is).
      if (w.endIndex !== w.startIndex + EXPECTED_WINDOW_WIDTH - 1) {
        note(`window width: ${w.startIndex}..${w.endIndex}`);
      }
      const indices = allPresentIndices(w.present);
      const expectedStart = indices.length ? Math.max(...indices) + 1 : 1;
      if (w.startIndex !== expectedStart) {
        note(`startIndex ${w.startIndex}, expected ${expectedStart} over present ${JSON.stringify(indices)}`);
      }
      if (indices.length && !indices.every((i) => i < w.startIndex)) {
        note(`startIndex ${w.startIndex} does not exceed every present index ${JSON.stringify(indices)}`);
      }

      // (ii) The partition, stated over `parseReviewFilename`'s TOTAL three-way split — NOT over
      // this return. A conforming basename for another doc type is in neither `entries` nor
      // `skipped` (§5.2), so "skipped ∪ entries partitions the input" is false on a correct
      // implementation; the restated form is that every basename falls in exactly one of
      // entries / other-doc-type / skipped, and `deriveRoundWindow` returns the first and third.
      const unique = rows.filter((b, i) => rows.indexOf(b) === i);
      const expectedEntryPairs = [];
      const expectedSkipped = [];
      let otherThisCase = 0;

      for (const basename of unique) {
        const p = devModule.parseReviewFilename(basename);
        const isEntry = p && p.ok === true && p.docType === targetDocType;
        const isOther = p && p.ok === true && p.docType !== targetDocType;
        const isSkipped = p && p.ok === false;
        if ([isEntry, isOther, isSkipped].filter(Boolean).length !== 1) {
          note(`${JSON.stringify(basename)} is not in exactly one class: ${JSON.stringify(p)}`);
          continue;
        }
        if (isEntry) expectedEntryPairs.push(`${p.role}|${p.round}`);
        if (isOther) otherThisCase++;
        if (isSkipped) expectedSkipped.push({ basename, reason: p.reason });
      }
      otherDocTypeDraws += otherThisCase;
      if (otherThisCase > 0) weakFormFalsifiedOn++;

      const actualPairs = [];
      const entries = w.present instanceof Map ? Array.from(w.present.entries()) : Object.entries(w.present || {});
      for (const [role, roundList] of entries) {
        for (const round of roundList) actualPairs.push(`${role}|${round}`);
      }

      const dedupedExpected = expectedEntryPairs.filter((p, i) => expectedEntryPairs.indexOf(p) === i);
      if (JSON.stringify(actualPairs.slice().sort()) !== JSON.stringify(dedupedExpected.slice().sort())) {
        note(
          `entries mismatch: present holds ${JSON.stringify(actualPairs.sort())}, this doc type's conforming basenames are ${JSON.stringify(dedupedExpected.sort())}`,
        );
      }

      // `skipped` holds exactly the grammar rejects, in the listing's own order, deduplicated by
      // basename — never a conforming basename for another doc type.
      if (JSON.stringify(w.skipped) !== JSON.stringify(expectedSkipped)) {
        note(`skipped mismatch: got ${JSON.stringify(w.skipped)}, expected ${JSON.stringify(expectedSkipped)}`);
      }
    }

    expect(failures).toEqual([]);

    // Anti-vacuity: the generator must actually produce the case that falsifies v1.1's weaker
    // form (TSPEC §8.2, PLAN §7.2) — otherwise this property would pass under the very
    // implementation the restatement exists to catch.
    expect(otherDocTypeDraws).toBeGreaterThan(0);
    expect(weakFormFalsifiedOn).toBeGreaterThan(0);
  });
});

// ─── TSPEC §3.9 — the role catalogue and the dispatch table cannot desynchronise ───

describe("RLH role-slug catalogue vs dispatch table (TSPEC §3.9)", () => {
  /** Every reviewer skill the normative dispatch table can dispatch, deduplicated. */
  function dispatchedReviewers() {
    const seen = new Set();
    for (const entry of Object.values(devModule.PHASE_DISPATCH)) {
      for (const skill of entry.reviewers || []) seen.add(skill);
    }
    return [...seen].sort();
  }

  test("RLH-MAP-01: the role-slug MAP and PHASE_DISPATCH's reviewer set agree in both directions", () => {
    const reviewers = dispatchedReviewers();

    // Anti-vacuity: the dispatch table must actually name reviewers, or the forward
    // arm below would pass over an empty set.
    expect(reviewers.length).toBeGreaterThan(0);

    // Forward arm — a reviewer added to PHASE_DISPATCH without a MAP entry would
    // derive its cross-review path through the `reviewerRoleSlug(skill) || skill`
    // fallback, writing a basename whose role is outside G-2's closed catalogue and
    // therefore unparseable on the next round. This is what reds on that.
    const unslugged = reviewers.filter((skill) => devModule.reviewerRoleSlug(skill) === null);
    expect(unslugged).toEqual([]);

    // Round-trip — the reverse accessor recovers the skill each slug came from, so
    // a slug can be carried back from a parsed `CROSS-REVIEW-{role}-…` basename.
    const roundTripFailures = reviewers.filter(
      (skill) => devModule.reviewerSkillForSlug(devModule.reviewerRoleSlug(skill)) !== skill,
    );
    expect(roundTripFailures).toEqual([]);

    // Reverse arm — every slug in the catalogue belongs to a skill the table really
    // dispatches, so a MAP entry outliving the phase that used it reds too. Derived
    // from the catalogue via its own slugs, not from a restated literal.
    const catalogueSlugs = reviewers.map((skill) => devModule.reviewerRoleSlug(skill));
    const orphanSlugs = ROLE_SLUGS.filter((slug) => !catalogueSlugs.includes(slug));
    expect(orphanSlugs).toEqual([]);

    // G-2's closed catalogue, restated at the top of this file, is exactly that set.
    expect([...catalogueSlugs].sort()).toEqual([...ROLE_SLUGS].sort());

    // A non-catalogue slug recovers nothing rather than inventing a skill.
    for (const slug of NON_CATALOGUE_ROLES) {
      expect(devModule.reviewerSkillForSlug(slug)).toBeNull();
    }
  });
});
