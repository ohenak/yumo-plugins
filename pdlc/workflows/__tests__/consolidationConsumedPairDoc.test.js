// consolidationConsumedPairDoc.test.js — DOD round 6 remediation (CODE_REVIEW v6, L1).
//
// v6's L1 is that FSPEC §3.3's description of the consumed pair was falsified by
// two remediations on two different schedules, and neither round re-swept it:
//
//   - `eb2a0e44` narrowed the *pair* to the readable members, falsifying the
//     Membership row's "**exactly** the un-consolidated set computed at step 2 —
//     neither more nor fewer" (FSPEC:425);
//   - `dcf708c7` moved that narrowing onto `state.consumed` at step 6.5,
//     falsifying "The set is **frozen at step 2** and is not recomputed later in
//     the pass" (FSPEC:432).
//
// TSPEC §12.2 v2.8, REQ NFR-5 and `pdlc-consolidation-vocabularies.md` all already
// agree with the module; FSPEC §3.3 was the lone dissenter. This suite is the
// missing oracle, so the next edit to the narrowing cannot leave §3.3 behind
// again — the same warranty `consolidationSkillAnchors.test.js` provides for the
// `consolidate-learnings/SKILL.md:` anchor family, applied to §3.3's prose.
//
// The oracle is **behaviour-grounded and conditional**, not a prose match. It
// first drives the real `main()` on a corpus with one readable and one unreadable
// member and *observes* that the consumed set is a strict subset of the
// un-consolidated set. Only that observed fact licenses the doc assertions: if a
// future erratum ever restored exact equality, conjunct A would go red first and
// name the behaviour change, rather than this suite silently demanding prose
// about a narrowing the module no longer performs.
//
// Non-vacuity is explicit throughout: the section is located by heading and
// asserted non-empty, the Membership row is located and asserted present, and the
// behaviour fixture asserts both set sizes rather than only the subset relation
// (an all-unreadable corpus would satisfy "subset" vacuously).

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import main from "../consolidate-learnings.js";
import {
  fakeFs,
  fakeGit,
  fakeGhRun,
  fakeNow,
  makeAgentDouble,
  fakeEnvPresent,
  fakeMakeTempDir,
  buildCorpusListing,
} from "./helpers/consolidationDoubles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const FSPEC_REL = "docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md";
const FSPEC_TEXT = readFileSync(join(REPO_ROOT, FSPEC_REL), "utf8");

const LOG_PATH = "docs/_decisions/.consolidation-log.md";
const NOTHING_FOUND = "no recurring failure mode pattern found across the corpus";

const READABLE_BASENAME = "LEARNINGS-feat-readable.md";
const UNREADABLE_BASENAME = "LEARNINGS-feat-unreadable.md";
const READABLE_PATH = `docs/feat-readable/${READABLE_BASENAME}`;
const UNREADABLE_PATH = `docs/feat-unreadable/${UNREADABLE_BASENAME}`;

/**
 * A corpus of two enumerated LEARNINGS files of which exactly one has a body.
 * The omitted body reads as unreadable (TSPEC §5.1), which is the falsifier the
 * whole finding turns on: it is the only input shape on which "the consumed set"
 * and "the un-consolidated set" can be told apart.
 */
function buildSeams() {
  const fs = fakeFs({
    [LOG_PATH]: "",
    [READABLE_PATH]: "# LEARNINGS — feat-readable\n\nNothing notable this feature.\n",
  });
  const git = fakeGit({
    "ls-files": { ok: true, stdout: buildCorpusListing([READABLE_PATH, UNREADABLE_PATH]) },
  });
  return {
    fs,
    _readFile: fs.readFile,
    _writeFile: fs.writeFile,
    _appendFile: fs.appendFile,
    _checkFile: fs.checkFile,
    _git: git._git,
    _ghRun: fakeGhRun(),
    _agent: makeAgentDouble({ script: [NOTHING_FOUND] }),
    _envPresent: fakeEnvPresent()._envPresent,
    _makeTempDir: fakeMakeTempDir(null)._makeTempDir,
    _now: fakeNow,
    _log: () => {},
    _phase: () => {},
  };
}

/** The `### 3.3 …` section body, up to the next `###` heading of any depth ≤ 3. */
function sectionBody(text, headingPrefix) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith(headingPrefix));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^#{1,3} /.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n");
}

/** The `| Membership | … | … |` row's Value cell from §3.3's property table. */
function membershipValueCell(body) {
  const row = body.split("\n").find((l) => /^\|\s*Membership\s*\|/.test(l));
  if (!row) return null;
  const cells = row.split("|").map((c) => c.trim());
  // ["", "Membership", "<value>", "<source>", ""]
  return cells[2] ?? null;
}

describe("CODE_REVIEW v6 L1 — FSPEC §3.3 describes the consumed pair the module actually writes", () => {
  const SECTION_HEADING = "### 3.3 Recording consumption";

  test("the section, its property table and its Membership row are all present (non-vacuity)", () => {
    const body = sectionBody(FSPEC_TEXT, SECTION_HEADING);
    expect(body).not.toBeNull();
    expect(body.trim().length).toBeGreaterThan(0);
    expect(body).toContain("pdlc:consumed");
    expect(membershipValueCell(body)).not.toBeNull();
  });

  test("conjunct A (behaviour) — on a corpus with one unreadable member the consumed set is a STRICT subset of the un-consolidated set", () => {
    const seams = buildSeams();
    return main({ ...seams, direct: true }).then((result) => {
      // The un-consolidated set is both enumerated files: the log is empty, so
      // nothing is consolidated, and readability does not narrow it (the
      // unreadable member stays counted and stays named on `unread`).
      const unconsolidated = new Set([READABLE_BASENAME, UNREADABLE_BASENAME]);
      expect(unconsolidated.size).toBe(2);

      // The consumed set is the readable subset only — narrowed at step 6.5.
      const consumed = new Set(result.consumed);
      expect(consumed).toEqual(new Set([READABLE_BASENAME]));

      // Strict subset, asserted as such: proper containment AND unequal size.
      // Size is asserted explicitly so an all-unreadable regression (consumed
      // empty) cannot satisfy this row vacuously.
      for (const b of consumed) expect(unconsolidated.has(b)).toBe(true);
      expect(consumed.size).toBe(1);
      expect(consumed.size).toBeLessThan(unconsolidated.size);

      // The unreadable member is named as unread, not silently dropped — this is
      // what makes the narrowing a re-cut of one set rather than a loss.
      expect(result.consumed).not.toContain(UNREADABLE_BASENAME);
    });
  });

  test("conjunct B — given conjunct A, the Membership row does not claim the pair is exactly the un-consolidated set", () => {
    const body = sectionBody(FSPEC_TEXT, SECTION_HEADING);
    const cell = membershipValueCell(body);

    // The falsified formulation: equality asserted directly of the
    // un-consolidated set, with no readability qualifier between them.
    expect(cell).not.toMatch(/exactly\s+the\s+un-consolidated\s+set/i);

    // A set-equality claim ("neither more nor fewer") is not itself wrong — the
    // pair IS set-equal to the readable subset, which is what AT-K3b's
    // `toEqual(new Set([READABLE_BASENAME]))` pins. What must not happen is that
    // equality being asserted of the WIDER set, so any such claim in this cell is
    // required to be scoped by readability first.
    const equalityAt = cell.search(/neither\s+more\s+nor\s+fewer/i);
    if (equalityAt !== -1) {
      const scope = cell.slice(0, equalityAt);
      expect(scope).toMatch(/readable/i);
    }
  });

  test("conjunct C — the Membership row names readability as what narrows the pair", () => {
    const body = sectionBody(FSPEC_TEXT, SECTION_HEADING);
    const cell = membershipValueCell(body);

    // The discriminator word. Without it the row cannot distinguish the consumed
    // set from the un-consolidated set at all, which is the defect L1 names.
    expect(cell).toMatch(/readable/i);
  });

  test("conjunct D — §3.3 does not claim the consumed set is never recomputed after step 2", () => {
    const body = sectionBody(FSPEC_TEXT, SECTION_HEADING);

    // `dcf708c7` recomputes it at step 6.5. The freeze that survives is the
    // *boundary* freeze (which files are in play), not a freeze of the consumed
    // set, so a blanket "not recomputed later in the pass" is false at HEAD.
    expect(body).not.toMatch(/is\s+not\s+recomputed\s+later\s+in\s+the\s+pass/i);
  });

  test("conjunct E — §3.3 names step 6.5 as where the narrowing happens", () => {
    const body = sectionBody(FSPEC_TEXT, SECTION_HEADING);

    // Positive obligation, so the fix cannot be a deletion: having removed the
    // false freeze sentence, the section must say what actually happens instead.
    expect(body).toMatch(/step\s+6\.5/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FSPEC self-locators — the G1 class, one document inward.
//
// Fixing L1 meant inserting a changelog entry at the top of FSPEC, which shifts
// every line below it. That is exactly the move that produced v2's G1 (a
// remediation that shifted an anchor family and did not re-sweep it), so the
// sweep is mechanised here rather than done by hand once.
//
// Re-deriving found both live self-locators were ALREADY stale at the commit
// this round started from, despite the v11.7 changelog asserting "both
// re-derived at HEAD": `:578-579` landed on a `skipped-cadence` table row and
// `:2476` on a table separator. A hand sweep asserting it had swept is precisely
// what this oracle replaces.
//
// The oracle derives and never transcribes: for each self-citation the true line
// is found by searching FSPEC for the *content* the citing sentence says is
// there, asserting that content is unique, and requiring the citation to equal
// the derived number. No expected line number appears below.
// ─────────────────────────────────────────────────────────────────────────────
describe("FSPEC self-locators resolve to the content they claim", () => {
  const FSPEC_LINES = FSPEC_TEXT.split("\n");

  /** 1-based line numbers whose text matches `pattern`. */
  function linesMatching(pattern) {
    const hits = [];
    FSPEC_LINES.forEach((l, i) => {
      if (pattern.test(l)) hits.push(i + 1);
    });
    return hits;
  }

  const SELF_LOCATORS = [
    {
      name: "§4.3's release-after-append ordering, cited from §4.1's kill-point table",
      // The citing sentence, located by prose so the row below cannot drift into
      // agreeing with a stale anchor.
      citer: /including its terminal row \(§4\.3 `:(\d+)-(\d+)` orders release after the append\)/,
      // The cited content: the sentence that actually orders release after the
      // terminal-row append. Two consecutive lines, so the citation is a range.
      target: /^Release is unconditional for every marker-holding pass/,
      span: 2,
    },
    {
      name: "§15.3's change register row for nudge-consolidation.sh, cited from AT-P7",
      citer: /and §15\.3's change register \(`:(\d+)`\) has the glob at `:28` widened/,
      target: /^\| `pdlc\/hooks\/scripts\/nudge-consolidation\.sh` \| predicate at `:41` scoped/,
      span: 1,
    },
  ];

  test("non-vacuity — every self-locator's citing sentence is present exactly once", () => {
    expect(SELF_LOCATORS.length).toBeGreaterThan(0);
    for (const { name, citer } of SELF_LOCATORS) {
      const hits = linesMatching(citer);
      expect(`${name}: ${hits.length} citing sentence(s)`).toBe(`${name}: 1 citing sentence(s)`);
    }
  });

  test.each(SELF_LOCATORS)("$name — the cited line is the line that holds the content", ({ citer, target, span }) => {
    // The cited content must be unique, or "the true line" is not well defined.
    const targetHits = linesMatching(target);
    expect(targetHits).toHaveLength(1);
    const trueStart = targetHits[0];

    const citingLine = FSPEC_LINES.find((l) => citer.test(l));
    const m = citingLine.match(citer);
    const citedStart = Number(m[1]);

    expect(citedStart).toBe(trueStart);
    if (span > 1) expect(Number(m[2])).toBe(trueStart + span - 1);

    // The shape four of v1's anchors took: a citation pointing at whitespace.
    for (let i = 0; i < span; i++) {
      expect(FSPEC_LINES[trueStart - 1 + i].trim()).not.toBe("");
    }
  });
});
