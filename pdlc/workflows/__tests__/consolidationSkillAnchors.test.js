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

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { proposalPathFor } from "../consolidate-learnings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

const SKILL_PATH = join(REPO_ROOT, "pdlc", "skills", "consolidate-learnings", "SKILL.md");
const REQ_PATH = join(REPO_ROOT, "docs", "pdlc-consolidation-agent", "REQ-pdlc-consolidation-agent.md");
const FSPEC_PATH = join(REPO_ROOT, "docs", "pdlc-consolidation-agent", "FSPEC-pdlc-consolidation-agent.md");

const skillText = readFileSync(SKILL_PATH, "utf8");
const skillLines = skillText.split("\n");
const docs = {
  REQ: readFileSync(REQ_PATH, "utf8"),
  FSPEC: readFileSync(FSPEC_PATH, "utf8"),
};

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

/**
 * Every consolidate-learnings SKILL citation in `text`, as {line, from, to}.
 *
 * An anchor qualified with some other skill directory belongs to that file and is
 * skipped. An *unqualified* `SKILL.md:NNN` — the continuation form DECISIONS §960
 * names — is claimed here: in these two documents the bare form is always a
 * continuation of a consolidate-learnings anchor, and defaulting the other way is
 * what let FSPEC:711 and FSPEC:717 survive a hand sweep. Defaulting *in* means a
 * genuinely new bare anchor for some other file fails loudly rather than silently
 * escaping the check.
 */
const citationsIn = (text) =>
  text.split("\n").flatMap((line, i) =>
    [...line.matchAll(CITATION_RE)]
      .filter((m) => (m[1] ?? "consolidate-learnings") === "consolidate-learnings")
      .map((m) => ({ line: i + 1, from: Number(m[2]), to: Number(m[3] ?? m[2]) }))
  );

/**
 * The text a citing site's anchors live in: the located line, plus the following
 * line only when the located line carries no anchor itself (a hard-wrapped
 * paragraph). Never a fixed two-line window — in a markdown table that reaches
 * into the *next row* and silently borrows its neighbour's anchor.
 */
// Non-global clone: `CITATION_RE.test` would carry `lastIndex` between calls.
const HAS_CITATION = new RegExp(CITATION_RE.source);
const siteWindow = (lines, idx) =>
  HAS_CITATION.test(lines[idx]) ? lines[idx] : lines.slice(idx, idx + 2).join("\n");

// ─── The claim table ────────────────────────────────────────────────────────────────────────
// `skillContent` is the content the citing sentence asserts lives at the anchor;
// `sites` are the sentences that assert it, located by prose. Nothing here is a
// line number: both sides of every equality are measured at run time.
const CLAIMS = [
  {
    id: "boundary",
    // The un-consolidated predicate — the line this feature rewrote from the
    // `Date Completed` date boundary to the basename test.
    skillContent: /^1\. \*\*Find the boundary\.\*\*/,
    sites: [
      { doc: "REQ", sentence: /skill's date boundary/ },
      { doc: "REQ", sentence: /and updates `SKILL\.md:/ },
      { doc: "REQ", sentence: /including the matching edits to$/ },
      { doc: "FSPEC", sentence: /a \*\*date\*\* boundary/ },
    ],
  },
  {
    id: "pattern-bar",
    skillContent: /^4\. \*\*Distinguish pattern from coincidence\.\*\*/,
    sites: [{ doc: "FSPEC", sentence: /generalises \(`SKILL\.md:/ }],
  },
  {
    id: "domain-constraints-route",
    skillContent: /^ +- Domain invariant future REQs must respect/,
    sites: [{ doc: "FSPEC", sentence: /^\| Domain invariant future REQs must respect \|/ }],
  },
  {
    id: "decisions-route",
    skillContent: /^ +- Architectural decision now project-level/,
    sites: [
      { doc: "FSPEC", sentence: /^\| Architectural decision now project-level \|/ },
      { doc: "FSPEC", sentence: /The skill's own instruction at/ },
    ],
  },
  {
    id: "log-record",
    skillContent: /^6\. \*\*Record the pass\*\*/,
    sites: [
      { doc: "REQ", sentence: /set\), promoted and deferred items, as today/ },
      { doc: "FSPEC", sentence: /items in `docs\/_decisions\/\.consolidation-log\.md` \(AC-2\.4/ },
    ],
  },
  {
    id: "proposal-table",
    skillContent: /^\| Source LEARNINGS \| Target skill \| Proposed change \| Rationale \|/,
    sites: [
      { doc: "REQ", sentence: /\*\*in the consuming repo\*\*, while the skills it names/ },
      { doc: "FSPEC", sentence: /that shape remains the fallback's presentation/ },
    ],
  },
];

describe("REQ and FSPEC anchors into consolidate-learnings/SKILL.md resolve to what they claim", () => {
  it("has a non-vacuous claim table and citation set", () => {
    expect(CLAIMS.length).toBeGreaterThan(0);
    const total = citationsIn(docs.REQ).length + citationsIn(docs.FSPEC).length;
    expect(total).toBeGreaterThan(0);
  });

  it.each(CLAIMS.map((c) => [c.id, c]))("%s — every citing sentence names the derived line", (_id, claim) => {
    const derived = soleSkillLine(claim.skillContent);
    for (const site of claim.sites) {
      const lines = docs[site.doc].split("\n");
      const hits = lines.reduce((acc, line, i) => (site.sentence.test(line) ? [...acc, i] : acc), []);
      // Located by prose, so an ambiguous or vanished sentence fails as "the
      // document moved", not as "the anchor is wrong".
      expect(`${site.doc} ${site.sentence} matched ${hits.length} line(s)`).toBe(
        `${site.doc} ${site.sentence} matched 1 line(s)`
      );
      const cited = [...siteWindow(lines, hits[0]).matchAll(CITATION_RE)].map((m) => Number(m[2]));
      expect(cited.length).toBeGreaterThan(0);
      for (const n of cited) {
        expect(`${claim.id} @ ${site.doc}: cited ${n}`).toBe(`${claim.id} @ ${site.doc}: cited ${derived}`);
      }
    }
  });

  it("no cited line is blank — the shape four of round 1's stale anchors took", () => {
    for (const doc of ["REQ", "FSPEC"]) {
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

  it("claims the whole citation family — no citation goes unchecked", () => {
    const claimed = new Set();
    for (const claim of CLAIMS) {
      for (const site of claim.sites) {
        const lines = docs[site.doc].split("\n");
        const idx = lines.findIndex((l) => site.sentence.test(l));
        for (const m of siteWindow(lines, idx).matchAll(CITATION_RE)) {
          // Record by (doc, cited line) — the identity the claim table asserts about.
          claimed.add(`${site.doc}:${Number(m[2])}`);
        }
      }
    }
    const actual = new Set();
    for (const doc of ["REQ", "FSPEC"]) {
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
