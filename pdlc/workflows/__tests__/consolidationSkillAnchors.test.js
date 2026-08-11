// consolidationSkillAnchors.test.js — DOD round 2 remediation (CODE_REVIEW v2, G1/G2/G3).
//
// v2's G1 is that `76476315` inserted ten lines into the top third of
// `pdlc/skills/consolidate-learnings/SKILL.md` and did not re-sweep the
// `consolidate-learnings/SKILL.md:NNN` anchor family that REQ and FSPEC use to
// ground their claims about that file. Four anchors landed on a blank line and
// one on text that no longer exists anywhere in the file.
//
// DECISIONS §960 already records the discipline for the `TSPEC:` family — every
// anchor re-measured, including the file-less *continuation* form. This suite is
// that warranty, mechanised, for the `consolidate-learnings/SKILL.md:` family, so
// the next edit to that file cannot repeat the round's own regression.
//
// The oracle derives, it never transcribes. For each claim the true line is found
// by searching the SKILL for the *content* the citing sentence asserts is there
// (and asserting that content is unique in the file); the citation is then
// required to equal that derived number. A line number appears nowhere in this
// file, so the test cannot drift into agreeing with a stale anchor. The citing
// sentence is located by a prose snippet for the same reason.
//
// Three conjuncts beyond per-claim equality keep a failure honest:
//   (i)   totality — every consolidate-learnings SKILL citation in REQ and FSPEC,
//         including the bare continuation form, is claimed by exactly one row, so
//         a newly added citation cannot slip past unchecked (this is what would
//         have caught FSPEC:711's `SKILL.md:38`, which v2's hand sweep missed);
//   (ii)  no cited line is blank — the specific shape four of v1's anchors took;
//   (iii) non-vacuity — the claim table and the citation set are both non-empty.
//
// G2 and G3 are pinned here too, because both are claims this same file makes
// about the module: that it is backed by a bundle rather than hand-executed, and
// that the proposal artifact it names is the one `proposalPathFor` actually writes.
//
// ── DOD round 3 (CODE_REVIEW v3, H1/H2) ──────────────────────────────────────
// v3's H1 is that the warranty above was drawn narrower than the family the
// finding is about: the document set was the literal `{REQ, FSPEC}` — the two
// documents v2 happened to enumerate — while the same defect survived untested
// in `TSPEC:179` and in `docs/_constraints/pdlc-consolidation-vocabularies.md`,
// the latter read by `pm-author`/`se-author` on every future feature. The
// document set is therefore no longer a literal: it is **derived** from the repo
// by `git grep`, so a citer that does not exist yet is covered on the day it is
// written. Review artifacts (CROSS-REVIEW/CODE_REVIEW/POSTMORTEM) are excluded
// by rule, not by omission — they quote stale anchors deliberately, as findings,
// and re-pointing them would destroy the round record.
//
// Widening immediately found two citers neither v2 nor v3 enumerated —
// `FSPEC:2451` and `PLAN:318` — both carrying the same stale `:35`/`:41` pair in
// a third anchor form: the file named in one table cell, the anchors as bare
// `` `:NNN` `` in the next. That form is now extracted too; missing it is how a
// hand sweep stays "complete" while the family is not.
//
// v3's H2 is G3's own recurrence one document away: the SKILL was corrected to
// `{passId}` but `REQ:41` still quoted the `{date}` name the module cannot
// produce. The `{passId}` assertion below therefore runs over every citing
// document, not over the SKILL alone.

import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { proposalPathFor } from "../consolidate-learnings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

const SKILL_REL = "pdlc/skills/consolidate-learnings/SKILL.md";
const REQ = "docs/completed/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md";
const FSPEC = "docs/completed/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md";
const TSPEC = "docs/completed/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md";
const PLAN = "docs/completed/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md";
const VOCAB = "docs/_constraints/pdlc-consolidation-vocabularies.md";

// The citers known at the time of writing. Not the document set — a floor under
// the derived one, so a `git grep` that silently returns nothing (no git, wrong
// cwd, changed flag) fails loudly instead of passing vacuously over zero files.
const KNOWN_CITERS = [REQ, FSPEC, TSPEC, PLAN, VOCAB];

// Review artifacts record the anchor state of a past round and must not be swept.
const EXCLUDED_CITER = /(CROSS-REVIEW|CODE_REVIEW|POSTMORTEM)-/;

const skillText = readFileSync(join(REPO_ROOT, SKILL_REL), "utf8");
const skillLines = skillText.split("\n");

/**
 * Every tracked markdown file that names the consolidate-learnings SKILL,
 * derived from the repo rather than transcribed. Selecting on the *path* (not on
 * `path:NNN`) is deliberate: `TSPEC:179` names the file in one cell and anchors
 * into it with a bare `` `:35` `` in the next, so a `path:NNN` selector would
 * have missed exactly the document H1 is about.
 */
const deriveCiterPaths = () => {
  // Matched on the `{skill}/SKILL.md` tail, not the full path: `CLAUDE.md` and
  // PROPERTIES name the file in a shorter form, and a selector that misses a
  // document is the whole of H1.
  const out = execFileSync("git", ["grep", "-l", "-F", "consolidate-learnings/SKILL.md", "--", "*.md"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return out
    .split("\n")
    .filter(Boolean)
    .filter((p) => p !== SKILL_REL && !EXCLUDED_CITER.test(p));
};

const citerPaths = deriveCiterPaths();
const docs = Object.fromEntries(
  citerPaths.map((rel) => [rel, readFileSync(join(REPO_ROOT, rel), "utf8")])
);

/**
 * 1-based line number of the single line of the SKILL matching `re`.
 * Throws with a legible message when the content is absent or ambiguous —
 * an anchor onto content that appears twice is not a checkable claim.
 */
const soleSkillLine = (re) => {
  const hits = skillLines.reduce((acc, line, i) => (re.test(line) ? [...acc, i + 1] : acc), []);
  if (hits.length !== 1) {
    throw new Error(
      `SKILL content ${re} matched ${hits.length} lines (${hits.join(", ")}); a citable claim must be unique`
    );
  }
  return hits[0];
};

// ─── Every `SKILL.md:NNN` citation, with its file resolved ───────────────────────────────────
// Two anchor forms are in use and both are load-bearing (DECISIONS §960):
//   - the fully-qualified form, `pdlc/skills/consolidate-learnings/SKILL.md:35`
//   - the *continuation* form, a bare `SKILL.md:38` whose file is carried by an
//     earlier anchor in the same paragraph (REQ:82 and FSPEC:711 are both this)
// Resolving the continuation form by paragraph is what makes the totality
// conjunct total; matching only the qualified form would silently under-count.
const CITATION_RE = /(?:([a-z0-9-]+)\/)?SKILL\.md:(\d+)(?:-(\d+))?/g;

// The third form, found by the H1 widening: the file is named in one table cell
// and the anchors follow as bare `` `:NNN` `` — `TSPEC:179`, `FSPEC:2451`,
// `PLAN:318`. Claimed only on a line that names the consolidate SKILL and no
// other SKILL, so a row citing the harvest file (`TSPEC:180`) or naming both
// (`TSPEC:2462`, whose `:13-17` anchors a test file) is left alone.
const CELL_ANCHOR_RE = /`:(\d+)(?:-(\d+))?`/g;
// Qualified only: a bare `SKILL.md` in prose is the continuation form and refers
// to the file the line already named, so it does not make the row ambiguous —
// a *second directory* does.
const QUALIFIED_SKILL_RE = /([a-z0-9-]+)\/SKILL\.md/g;
const namesOnlyThisSkill = (line) => {
  const dirs = new Set([...line.matchAll(QUALIFIED_SKILL_RE)].map((m) => m[1]));
  return dirs.size === 1 && dirs.has("consolidate-learnings");
};

/**
 * Every consolidate-learnings SKILL citation in `text`, as {line, from, to}.
 *
 * An anchor qualified with some other skill directory belongs to that file and is
 * skipped. An *unqualified* `SKILL.md:NNN` — the continuation form DECISIONS §960
 * names — is claimed here: in these documents the bare form is always a
 * continuation of a consolidate-learnings anchor, and defaulting the other way is
 * what let FSPEC:711 and FSPEC:717 survive a hand sweep. Defaulting *in* means a
 * genuinely new bare anchor for some other file fails loudly rather than silently
 * escaping the check.
 */
const citationsIn = (text) =>
  text.split("\n").flatMap((line, i) => {
    const qualified = [...line.matchAll(CITATION_RE)]
      .filter((m) => (m[1] ?? "consolidate-learnings") === "consolidate-learnings")
      .map((m) => ({ line: i + 1, from: Number(m[2]), to: Number(m[3] ?? m[2]) }));
    const cell = namesOnlyThisSkill(line)
      ? [...line.matchAll(CELL_ANCHOR_RE)].map((m) => ({
          line: i + 1,
          from: Number(m[1]),
          to: Number(m[2] ?? m[1]),
        }))
      : [];
    return [...qualified, ...cell];
  });

/**
 * The text a citing site's anchors live in: the located line, plus the following
 * line only when the located line carries no anchor itself (a hard-wrapped
 * paragraph). Never a fixed two-line window — in a markdown table that reaches
 * into the *next row* and silently borrows its neighbour's anchor.
 */
const siteWindow = (lines, idx) =>
  citationsIn(lines[idx]).length > 0 ? lines[idx] : lines.slice(idx, idx + 2).join("\n");
const citedLinesAt = (lines, idx) => citationsIn(siteWindow(lines, idx)).map((c) => c.from);

// ─── The claim table ────────────────────────────────────────────────────────────────────────
// `skillContent` is the content the citing sentence asserts lives at the anchor;
// `sites` are the sentences that assert it, located by prose. Nothing here is a
// line number: both sides of every equality are measured at run time.
// The file-ownership row: `| `pdlc/skills/consolidate-learnings/SKILL.md` | …`,
// which TSPEC §3.2 and FSPEC §12.2 both carry in the same shape.
const SKILL_ROW = new RegExp(`^\\| \`${SKILL_REL.replace(/[/.]/g, "\\$&")}\` \\|`);

const CLAIMS = [
  {
    id: "boundary",
    // The un-consolidated predicate — the line this feature rewrote from the
    // `Date Completed` date boundary to the basename test.
    skillContent: /^1\. \*\*Find the boundary\.\*\*/,
    sites: [
      { doc: REQ, sentence: /skill's date boundary/ },
      { doc: REQ, sentence: /and updates `SKILL\.md:/ },
      { doc: REQ, sentence: /including the matching edits to$/ },
      { doc: FSPEC, sentence: /a \*\*date\*\* boundary/ },
      // The cell form — the file-ownership row (TSPEC §3.2 is what Phase P
      // validates and Phase I partitions waves by) and its FSPEC and PLAN twins.
      { doc: TSPEC, sentence: SKILL_ROW },
      { doc: FSPEC, sentence: SKILL_ROW },
      // T07's task row, not its row in §5's ownership manifest (which names the
      // file but anchors nothing).
      { doc: PLAN, sentence: /^\| T07 \| \*\*\[Docs\] `consolidate-learnings` prompt\.\*\*/ },
    ],
  },
  {
    id: "pattern-bar",
    skillContent: /^4\. \*\*Distinguish pattern from coincidence\.\*\*/,
    sites: [{ doc: FSPEC, sentence: /generalises \(`SKILL\.md:/ }],
  },
  {
    id: "domain-constraints-route",
    skillContent: /^ +- Domain invariant future REQs must respect/,
    sites: [{ doc: FSPEC, sentence: /^\| Domain invariant future REQs must respect \|/ }],
  },
  {
    id: "decisions-route",
    skillContent: /^ +- Architectural decision now project-level/,
    sites: [
      { doc: FSPEC, sentence: /^\| Architectural decision now project-level \|/ },
      { doc: FSPEC, sentence: /The skill's own instruction at/ },
      { doc: TSPEC, sentence: SKILL_ROW },
      { doc: FSPEC, sentence: SKILL_ROW },
      // T07's task row, not its row in §5's ownership manifest (which names the
      // file but anchors nothing).
      { doc: PLAN, sentence: /^\| T07 \| \*\*\[Docs\] `consolidate-learnings` prompt\.\*\*/ },
    ],
  },
  {
    id: "log-record",
    skillContent: /^6\. \*\*Record the pass\*\*/,
    sites: [
      { doc: REQ, sentence: /set\), promoted and deferred items, as today/ },
      { doc: FSPEC, sentence: /items in `docs\/_decisions\/\.consolidation-log\.md` \(AC-2\.4/ },
    ],
  },
  {
    id: "proposal-table",
    skillContent: /^\| Source LEARNINGS \| Target skill \| Proposed change \| Rationale \|/,
    sites: [
      { doc: REQ, sentence: /\*\*in the consuming repo\*\*, while the skills it names/ },
      { doc: FSPEC, sentence: /that shape remains the fallback's presentation/ },
    ],
  },
  {
    // H1's third anchor: `vocabularies.md:163` cited the `{date}`-only proposal
    // name, which G3's fix removed from the file — a citation whose referent no
    // longer exists anywhere, in a `docs/_constraints/` file that outlives this
    // feature. Re-pointed at the sentence that states the shipped name.
    id: "proposal-path",
    skillContent: /^When a learning says a skill prompt itself should change/,
    sites: [{ doc: VOCAB, sentence: /^\| Proposal artifact \|/ }],
  },
];

// Keyed by (doc, sentence): one site may carry anchors for several claims — the
// file-ownership row cites both the boundary line and the DECISIONS route — so
// the checkable identity is the *set* a site cites, not each anchor separately.
const siteExpectations = () => {
  const byKey = new Map();
  for (const claim of CLAIMS) {
    for (const site of claim.sites) {
      const key = `${site.doc}||${site.sentence.source}`;
      if (!byKey.has(key)) byKey.set(key, { ...site, expected: new Set() });
      byKey.get(key).expected.add(soleSkillLine(claim.skillContent));
    }
  }
  return [...byKey.values()];
};

describe("anchors into consolidate-learnings/SKILL.md resolve to what they claim", () => {
  it("sweeps every tracked citer, derived from the repo rather than transcribed", () => {
    // The floor: the citers known when this was written must all be present. A
    // `git grep` returning nothing would otherwise make every conjunct vacuous.
    for (const known of KNOWN_CITERS) expect(citerPaths).toContain(known);
    // And the derivation must be live, not the floor re-spelled: review
    // artifacts are the only exclusion, so any *new* citer is in scope.
    expect(citerPaths.every((p) => !EXCLUDED_CITER.test(p))).toBe(true);
  });

  it("has a non-vacuous claim table and citation set", () => {
    expect(CLAIMS.length).toBeGreaterThan(0);
    const total = citerPaths.reduce((n, doc) => n + citationsIn(docs[doc]).length, 0);
    expect(total).toBeGreaterThan(0);
  });

  it.each(siteExpectations().map((s) => [`${s.doc} ${s.sentence.source}`, s]))(
    "%s — cites exactly the derived line(s)",
    (_label, site) => {
      const lines = docs[site.doc].split("\n");
      const hits = lines.reduce((acc, line, i) => (site.sentence.test(line) ? [...acc, i] : acc), []);
      // Located by prose, so an ambiguous or vanished sentence fails as "the
      // document moved", not as "the anchor is wrong".
      expect(`${site.doc} ${site.sentence} matched ${hits.length} line(s)`).toBe(
        `${site.doc} ${site.sentence} matched 1 line(s)`
      );
      const cited = [...new Set(citedLinesAt(lines, hits[0]))].sort((a, b) => a - b);
      const expected = [...site.expected].sort((a, b) => a - b);
      expect(`${site.doc}: cites ${cited.join(",")}`).toBe(`${site.doc}: cites ${expected.join(",")}`);
    }
  );

  it("no cited line is blank — the shape four of round 1's stale anchors took", () => {
    for (const doc of citerPaths) {
      for (const c of citationsIn(docs[doc])) {
        for (let n = c.from; n <= c.to; n += 1) {
          expect(n).toBeLessThanOrEqual(skillLines.length);
          // Rendered into the matched string so a failure names the citing site
          // and shows what the anchor actually lands on.
          expect(`${doc}:${c.line} → SKILL:${n} :: ${skillLines[n - 1].trim()}`).toMatch(/:: \S/);
        }
      }
    }
  });

  it("claims the whole citation family — no citation in any citer goes unchecked", () => {
    const claimed = new Set();
    for (const site of siteExpectations()) {
      const lines = docs[site.doc].split("\n");
      const idx = lines.findIndex((l) => site.sentence.test(l));
      // Record by (doc, cited line) — the identity the claim table asserts about.
      for (const n of citedLinesAt(lines, idx)) claimed.add(`${site.doc}:${n}`);
    }
    const actual = new Set();
    for (const doc of citerPaths) {
      for (const c of citationsIn(docs[doc])) actual.add(`${doc}:${c.from}`);
    }
    expect([...actual].sort()).toEqual([...claimed].sort());
  });
});

// ─── G3 — the SKILL names the artifact the module actually writes ────────────────────────────
describe("the SKILL's proposal artifact matches proposalPathFor", () => {
  it("spells the shipped `{passId}` path, not the `{date}` form the module does not produce", () => {
    expect(skillText).toContain(proposalPathFor("{passId}"));
    // `{date}` alone collides with the first pass of the same day: `passId` is
    // `{YYYY-MM-DD}-{n}`, so the date form is not merely stale, it is ambiguous.
    expect(skillText).not.toContain(proposalPathFor("{date}"));
  });

  // H2: G3 corrected the SKILL and left `REQ:41` quoting the old name one
  // document away. Checking only the SKILL is what let that survive, so the
  // obligation runs over every document that grounds itself on the SKILL: no
  // citer may name a proposal file `proposalPathFor` cannot produce.
  it.each(citerPaths)("%s names no proposal filename the module cannot produce", (doc) => {
    const slots = [...docs[doc].matchAll(/CONSOLIDATION-PROPOSAL-\{([A-Za-z]+)\}/g)].map(
      (m) => `${doc}: CONSOLIDATION-PROPOSAL-{${m[1]}}`
    );
    expect(slots).toEqual(slots.map(() => `${doc}: CONSOLIDATION-PROPOSAL-{passId}`));
  });
});

// ─── G2 — the third bundle-backed SKILL declares its bundle, like its siblings ───────────────
// REQ §5 puts this feature's script beside the skill in "the `orchestrate-queue`
// shape: a skill and a bundled workflow sharing a name". The two existing members
// of that family open by declaring they delegate. An agent that reads this one as
// a hand-executable runbook bypasses the boundary log, the derived
// `failure-mode-id`, NFR-4 duplicate suppression and the AC-1.3 marker.
describe("consolidate-learnings/SKILL.md declares itself bundle-backed, as its siblings do", () => {
  const siblings = ["orchestrate-dev", "orchestrate-queue"].map((name) =>
    readFileSync(join(REPO_ROOT, "pdlc", "skills", name, "SKILL.md"), "utf8")
  );

  it("the sibling family it is compared against really does declare the pointer form", () => {
    for (const sibling of siblings) expect(sibling).toMatch(/# \S+ — Pointer\/Contract/);
  });

  it("declares the pointer/contract form in its heading", () => {
    expect(skillText).toMatch(/# \S+ — Pointer\/Contract/);
  });

  it("names the workflow module that performs the pass", () => {
    expect(skillText).toContain("pdlc/workflows/consolidate-learnings.js");
  });

  it("does not instruct the reader to execute the pass by hand", () => {
    // The runbook's second-person imperatives are the defect: they are what an
    // agent follows instead of invoking the bundle. The descriptive text that
    // REQ and FSPEC anchor into stays — it is the contract, stated as such.
    expect(skillText).not.toMatch(/^\s*-? ?\[ \] /m); // no hand-execution checklist
    expect(skillText).toMatch(/does not run the pass itself|performs the pass|the workflow script/i);
  });
});

// ─── J1 (CODE_REVIEW v4) — the harvest SKILL's anchor family ─────────────────
//
// Three DoD rounds each closed one stale-anchor instance for the consolidate
// SKILL while this feature's own T08 edit moved the HARVEST SKILL's metadata
// table (`Phases exercised` inserted at what was `DoD rounds`' line) and no
// oracle ranged over that file. Same machinery, second subject. The measured
// facts come from the SKILL at run time; nothing here is a transcribed line
// number — which is the whole point.
describe("harvest-learnings SKILL anchors (CODE_REVIEW v4 J1)", () => {
  const HARVEST_REL = "pdlc/skills/harvest-learnings/SKILL.md";
  const harvestLines = readFileSync(join(REPO_ROOT, HARVEST_REL), "utf8").split("\n");

  const soleHarvestLine = (re) => {
    const hits = harvestLines.reduce((acc, line, i) => (re.test(line) ? [...acc, i + 1] : acc), []);
    if (hits.length !== 1) {
      throw new Error(
        `harvest SKILL content ${re} matched ${hits.length} lines (${hits.join(", ")}); a citable claim must be unique`
      );
    }
    return hits[0];
  };

  // The measured anchor family.
  const tableHeader = soleHarvestLine(/^\| Field \| Detail \|$/);
  const harvestedFrom = soleHarvestLine(/^\| Harvested from \|/);
  const phasesExercised = soleHarvestLine(/^\| Phases exercised \|/);
  const dodRounds = soleHarvestLine(/^\| DoD rounds \|/);
  const approvalRecord = soleHarvestLine(/^## 6\. Approval Record$/);

  it("the metadata table is contiguous, ordered, and ends at DoD rounds", () => {
    for (let n = tableHeader; n <= dodRounds; n++) {
      expect(harvestLines[n - 1]).toMatch(/^\|/);
    }
    expect(harvestedFrom).toBe(phasesExercised - 1); // T08: after `Harvested from`
    expect(phasesExercised).toBe(dodRounds - 1);
  });

  it("vocabularies §2 cites the measured table span, row and heading — not a remembered one", () => {
    const vocab = docs[VOCAB] ?? readFileSync(join(REPO_ROOT, VOCAB), "utf8");
    expect(vocab).toContain(`\`pdlc/skills/harvest-learnings/SKILL.md:${approvalRecord}\``);
    expect(vocab).toContain(`\`:${tableHeader}-${dodRounds}\``);
    expect(vocab).toContain(`\`:${phasesExercised}\``);
  });

  // v4's second recommendation, made the general conjunct: every instance of
  // this class in three rounds was a range that stopped short of the block it
  // names. Any cited range that intersects the metadata table must end at the
  // table's last row — a range that stops inside it is the J1 shape.
  const namesOnlyHarvest = (line) => {
    const dirs = new Set([...line.matchAll(QUALIFIED_SKILL_RE)].map((m) => m[1]));
    return dirs.size === 1 && dirs.has("harvest-learnings");
  };
  const HARVEST_RANGE_RE = /(?:harvest-learnings\/SKILL\.md:|`:)(\d+)-(\d+)`?/g;

  it("no tracked citer's range stops inside the metadata table", () => {
    const out = execFileSync("git", ["grep", "-l", "-F", "harvest-learnings/SKILL.md", "--", "*.md"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    const citers = out
      .split("\n")
      .filter(Boolean)
      .filter((p) => p !== HARVEST_REL && !EXCLUDED_CITER.test(p));
    expect(citers.length).toBeGreaterThan(0); // the grep itself must not go blind

    const violations = [];
    for (const rel of citers) {
      const text = readFileSync(join(REPO_ROOT, rel), "utf8");
      text.split("\n").forEach((line, i) => {
        if (!line.includes("harvest-learnings") && !namesOnlyHarvest(line)) return;
        for (const m of line.matchAll(HARVEST_RANGE_RE)) {
          const from = Number(m[1]);
          const to = Number(m[2]);
          const intersects = from <= dodRounds && to >= tableHeader;
          if (intersects && to !== dodRounds) {
            violations.push(`${rel}:${i + 1} cites :${from}-${to}; the table ends at :${dodRounds}`);
          }
        }
      });
    }
    expect(violations).toEqual([]);
  });
});
