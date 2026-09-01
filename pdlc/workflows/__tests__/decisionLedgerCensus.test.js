/**
 * decisionLedgerCensus.test.js — T-11 (BR-11 / REQ NG-4, TSPEC §7.3), cloning
 * `loopEconomicsAnchorGuard.test.js`'s `ANCHOR_TOKENS` / `bodyOf`
 * declaration-anchored slicing (DEC-LOOPECON-07 precedent).
 *
 * BR-11 claims a coupling does NOT exist: no decision-record-data-carrying
 * declaration this feature introduces leaks a decision id into the rest of
 * `orchestrate-dev.js`. This file pins that absence.
 *
 * TSPEC §7.3 census oracle, two operands, both frozen and set-equality
 * checked:
 *
 *   - Forbidden token set: `DECISION_LEDGER_CENSUS_TOKENS`, the six
 *     data-carrying top-level declaration names this feature introduces.
 *   - Scanned source: `orchestrate-dev.js`'s source, minus the body of every
 *     member of `DECISION_LEDGER_OWNED_DECLS` (all fourteen, not a
 *     hand-picked subset) and minus the `main()` wiring run bounded by the
 *     `// === DECISION LEDGER WIRING START/END ===` sentinels.
 *
 * `DECISION_LEDGER_CENSUS_TOKENS`, `DECISION_LEDGER_CENSUS_EXEMPT` and
 * `DECISION_LEDGER_OWNED_DECLS` are declarations of THIS test file, not of
 * `orchestrate-dev.js` (TSPEC §7.3, *Where the three census constants
 * live*) — exactly as the precedent's `ANCHOR_TOKENS` is a top-level
 * constant of `loopEconomicsAnchorGuard.test.js` rather than of the module
 * it scans. None of the three is a member of `DECISION_LEDGER_OWNED_DECLS`,
 * which enumerates only `orchestrate-dev.js` top-level declarations.
 *
 * The companion assertion (TSPEC §7.3, *Forbidden token set*):
 * `DECISION_LEDGER_CENSUS_TOKENS` ∪ `DECISION_LEDGER_CENSUS_EXEMPT` =
 * `DECISION_LEDGER_OWNED_DECLS`, the two sub-sets disjoint — six
 * data-carrying names ∪ eight plumbing declarations = the owned list's
 * fourteen. This is a DIFFERENT partition than the owned list's own
 * six-functions ∪ eight-constants split (§7.3's *The size of the owned
 * list, stated once* — same numerals, different membership).
 *
 * The whole file is committed `describe.skip`-wrapped, titled `T-18: …`,
 * because all fourteen `DECISION_LEDGER_OWNED_DECLS` members are declared
 * across batches 3–8 (T-13…T-18) — none exist in `orchestrate-dev.js` yet,
 * so every "resolves to exactly one top-level declaration" assertion would
 * fail for the right reason today. T-18 un-skips this file once the last
 * of the fourteen (the `main()` wiring block, which also supplies the
 * sentinel pair) lands.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(__dirname, "..", "orchestrate-dev.js");
const SOURCE = readFileSync(SOURCE_PATH, "utf8");
const LINES = SOURCE.split("\n");

// ─── Structural derivation ───────────────────────────────────────────────
//
// Cloned from loopEconomicsAnchorGuard.test.js's DECL_RE, WIDENED (TSPEC
// §7.3, PM F-01 / TE F-01): the precedent's census set is all functions, so
// its regex is anchored to `function` only. Eight of this feature's
// fourteen owned declarations are top-level `const`s, so a verbatim clone
// would find no boundary at any catalogue's declaration line and leave that
// catalogue's own body in the scanned remainder. This regex also matches
// top-level `const`/`let` bindings, `export`-prefixed or not.
const DECL_RE =
  /^(?:export\s+)?(?:(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(|(?:const|let)\s+([A-Za-z0-9_]+)\s*=)/;

const allTopLevelDecls = [];
LINES.forEach((line, idx) => {
  const m = DECL_RE.exec(line);
  if (m) allTopLevelDecls.push({ name: m[1] || m[2], line: idx });
});

/**
 * A declaration's body is the source between its own declaration line and
 * the next top-level declaration of ANY name (boundaries from
 * `allTopLevelDecls`, never the owned subset alone), or EOF for the last
 * one.
 */
function boundsOf(name) {
  const idx = allTopLevelDecls.findIndex((d) => d.name === name);
  if (idx === -1) return null;
  const start = allTopLevelDecls[idx].line;
  const end = idx + 1 < allTopLevelDecls.length ? allTopLevelDecls[idx + 1].line : LINES.length;
  return { start, end };
}

function bodyOf(name) {
  const bounds = boundsOf(name);
  if (!bounds) throw new Error(`No top-level declaration found for ${name}`);
  return LINES.slice(bounds.start, bounds.end).join("\n");
}

// ─── Frozen census operands (TSPEC §7.3) — declarations of THIS test file ──

/**
 * The six data-carrying names this feature introduces (TSPEC §7.3,
 * *Forbidden token set*). Not set equality against all decision-ledger
 * exports — that comparison is red by construction, since fourteen are
 * declared and only these six carry or produce decision-record data.
 */
const DECISION_LEDGER_CENSUS_TOKENS = [
  "selectDecisions",
  "recogniseDecisionRecords",
  "renderDecisionLedgerBlock",
  "gatherDecisionCorpus",
  "DECISION_LEDGER_OMIT_REASONS",
  "DECISION_LEDGER_CORPUS_OUTCOMES",
];

/**
 * The eight plumbing declarations that carry no record data (TSPEC §7.3,
 * *Forbidden token set*), each with its reason cited in the source comment
 * there: parseDecisionLedgerConfig / buildDecisionLedgerInjector (wiring,
 * config, construction), DECISION_LEDGER_DEFAULTS (config defaults),
 * DECISION_HEADING_RE (grammar), DECISION_CORPUS_ARGV (the `_git` argv
 * literal), DECISION_LEDGER_PREAMBLE / DECISION_LEDGER_RULE_TEXT (fixed
 * prompt framing text), DECISION_LEDGER_NOTICES (run-level notice ids).
 */
const DECISION_LEDGER_CENSUS_EXEMPT = [
  "parseDecisionLedgerConfig",
  "buildDecisionLedgerInjector",
  "DECISION_LEDGER_DEFAULTS",
  "DECISION_HEADING_RE",
  "DECISION_CORPUS_ARGV",
  "DECISION_LEDGER_PREAMBLE",
  "DECISION_LEDGER_RULE_TEXT",
  "DECISION_LEDGER_NOTICES",
];

/**
 * The fourteen top-level declarations this feature introduces in
 * `orchestrate-dev.js` (TSPEC §7.3, *The size of the owned list, stated
 * once* and *Scanned source*) — §4.1–§4.4's six functions plus the eight
 * top-level constants enumerated in the *Scanned source* row. Each member
 * must resolve to exactly one top-level declaration of `orchestrate-dev.js`
 * at HEAD (asserted below), never derived from a `/Decision/i` name
 * pattern — the shipped module already declares `MERGE_MAX_DECISION_STEPS`,
 * `renderDecisionEntry`, `escalationDecision`, `erratumGateDecision` and
 * `parseDecisionsWarranted`, which such a rule would wrongly exclude.
 */
const DECISION_LEDGER_OWNED_DECLS = [
  "parseDecisionLedgerConfig",
  "selectDecisions",
  "recogniseDecisionRecords",
  "renderDecisionLedgerBlock",
  "gatherDecisionCorpus",
  "buildDecisionLedgerInjector",
  "DECISION_CORPUS_ARGV",
  "DECISION_HEADING_RE",
  "DECISION_LEDGER_DEFAULTS",
  "DECISION_LEDGER_PREAMBLE",
  "DECISION_LEDGER_RULE_TEXT",
  "DECISION_LEDGER_OMIT_REASONS",
  "DECISION_LEDGER_CORPUS_OUTCOMES",
  "DECISION_LEDGER_NOTICES",
];

/**
 * The `main()` wiring run this feature introduces (TSPEC §7.3, *Scanned
 * source* (b)) — deliberately NOT the whole of `main()`, which owns a great
 * deal of unrelated code a coupling could hide in. Also pins that this
 * feature's sentinels are not the learnings region's own
 * (`// === LEARNINGS INJECTION REGION START/END ===`), so PROP-DIS-06's
 * slicer does not see them (TSPEC §2.3).
 */
const WIRING_START_SENTINEL = "// === DECISION LEDGER WIRING START ===";
const WIRING_END_SENTINEL = "// === DECISION LEDGER WIRING END ===";

/**
 * `orchestrate-dev.js`'s source minus (a) every `DECISION_LEDGER_OWNED_DECLS`
 * member's body and (b) the sentinel-bounded `main()` wiring run — the
 * census's *Scanned source* operand (TSPEC §7.3). Slicing every owned
 * declaration, not a hand-picked subset, is what makes the census
 * satisfiable: a token's own declaration line and its uses by sibling
 * declarations are then never in the remainder.
 */
function scannedRemainder() {
  const excludedLines = new Set();

  for (const name of DECISION_LEDGER_OWNED_DECLS) {
    const bounds = boundsOf(name);
    if (!bounds) continue; // pre-implementation: nothing to exclude yet
    for (let i = bounds.start; i < bounds.end; i += 1) excludedLines.add(i);
  }

  const startIdx = LINES.findIndex((l) => l.includes(WIRING_START_SENTINEL));
  const endIdx = LINES.findIndex((l) => l.includes(WIRING_END_SENTINEL));
  if (startIdx !== -1 && endIdx !== -1) {
    for (let i = startIdx; i <= endIdx; i += 1) excludedLines.add(i);
  }

  const kept = [];
  LINES.forEach((line, idx) => {
    if (!excludedLines.has(idx)) kept.push(line);
  });
  return kept.join("\n");
}

// ─── T-18: source census for BR-11 (TSPEC §7.3) ─────────────────────────────
//
// Committed skipped: every `DECISION_LEDGER_OWNED_DECLS` member is declared
// across batches 3–8 (T-13…T-18) and none exists in `orchestrate-dev.js`
// yet, so "resolves to exactly one top-level declaration at HEAD" would
// fail for the right reason today. T-18 removes this wrapper once the last
// owned declaration (and the wiring sentinels) lands.
describe("T-18: decision-ledger source census (TSPEC §7.3, BR-11 / REQ NG-4)", () => {
  describe("partition: CENSUS_TOKENS ∪ CENSUS_EXEMPT = OWNED_DECLS, disjoint", () => {
    it("pins the frozen list sizes: six tokens, eight exempt, fourteen owned", () => {
      expect(DECISION_LEDGER_CENSUS_TOKENS.length).toBe(6);
      expect(DECISION_LEDGER_CENSUS_EXEMPT.length).toBe(8);
      expect(DECISION_LEDGER_OWNED_DECLS.length).toBe(14);
    });

    it("has no duplicate within any single frozen list", () => {
      expect(new Set(DECISION_LEDGER_CENSUS_TOKENS).size).toBe(DECISION_LEDGER_CENSUS_TOKENS.length);
      expect(new Set(DECISION_LEDGER_CENSUS_EXEMPT).size).toBe(DECISION_LEDGER_CENSUS_EXEMPT.length);
      expect(new Set(DECISION_LEDGER_OWNED_DECLS).size).toBe(DECISION_LEDGER_OWNED_DECLS.length);
    });

    it("CENSUS_TOKENS and CENSUS_EXEMPT are disjoint", () => {
      const tokenSet = new Set(DECISION_LEDGER_CENSUS_TOKENS);
      const overlap = DECISION_LEDGER_CENSUS_EXEMPT.filter((n) => tokenSet.has(n));
      expect(overlap).toEqual([]);
    });

    it("CENSUS_TOKENS ∪ CENSUS_EXEMPT is set-equal to OWNED_DECLS", () => {
      const union = [...new Set([...DECISION_LEDGER_CENSUS_TOKENS, ...DECISION_LEDGER_CENSUS_EXEMPT])].sort();
      const owned = [...new Set(DECISION_LEDGER_OWNED_DECLS)].sort();
      expect(union).toEqual(owned);
    });

    it("none of the three frozen lists is itself a member of DECISION_LEDGER_OWNED_DECLS", () => {
      // The census constants are declarations of THIS test file (TSPEC
      // §7.3, "Where the three census constants live"), never of
      // orchestrate-dev.js.
      for (const name of [
        "DECISION_LEDGER_CENSUS_TOKENS",
        "DECISION_LEDGER_CENSUS_EXEMPT",
        "DECISION_LEDGER_OWNED_DECLS",
      ]) {
        expect(DECISION_LEDGER_OWNED_DECLS).not.toContain(name);
      }
    });
  });

  describe("resolves-to-exactly-one (TSPEC §7.3, red-on-rename conjunct)", () => {
    it.each(DECISION_LEDGER_OWNED_DECLS)(
      "%s resolves to exactly one top-level declaration of orchestrate-dev.js at HEAD",
      (name) => {
        const counts = new Map();
        for (const d of allTopLevelDecls) {
          counts.set(d.name, (counts.get(d.name) || 0) + 1);
        }
        expect(counts.get(name)).toBe(1);
      },
    );
  });

  describe("non-empty slice (census cannot go vacuous)", () => {
    it.each(DECISION_LEDGER_OWNED_DECLS)("%s's sliced body is non-empty", (name) => {
      expect(bodyOf(name).trim().length).toBeGreaterThan(0);
    });
  });

  describe("wiring sentinels are this feature's own, not the learnings region's (TSPEC §2.3)", () => {
    it("finds the DECISION LEDGER WIRING sentinel pair, distinct from the LEARNINGS INJECTION REGION pair", () => {
      expect(SOURCE).toContain(WIRING_START_SENTINEL);
      expect(SOURCE).toContain(WIRING_END_SENTINEL);
      expect(WIRING_START_SENTINEL).not.toContain("LEARNINGS INJECTION REGION");
      expect(WIRING_END_SENTINEL).not.toContain("LEARNINGS INJECTION REGION");
    });
  });

  describe("zero occurrences of any census token in the scanned remainder (TSPEC §7.3, BR-11)", () => {
    it.each(DECISION_LEDGER_CENSUS_TOKENS)("%s does not occur outside its own owned declarations or the wiring block", (token) => {
      const remainder = scannedRemainder();
      expect(remainder).not.toContain(token);
    });
  });
});
