import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SKILLS_ROOT = resolve(__dirname, "../../skills");

// PROP-SKILL-01, PROP-SKILL-02, PROP-SKILL-03, PROP-SKILL-04
describe("Review SKILL.md VERDICT trailers (TSPEC-SKILL-01)", () => {
  const reviewSkills = [
    { name: "se-review", file: "se-review/SKILL.md" },
    { name: "te-review", file: "te-review/SKILL.md" },
    { name: "pm-review", file: "pm-review/SKILL.md" },
  ];

  for (const { name, file } of reviewSkills) {
    describe(`${name}`, () => {
      let content;

      beforeAll(() => {
        const filePath = join(SKILLS_ROOT, file);
        content = readFileSync(filePath, "utf8");
      });

      // PROP-SKILL-01/02/03: consolidated Verdict section header present.
      // Anchored at the start of a line so the in-prose cross-reference to this section
      // (which names it inside backticks) is not mistaken for the heading itself.
      const VERDICT_HEADING = /^## Verdict \(required — workflow data contract\)$/m;

      it("contains the consolidated Verdict section header", () => {
        expect(content).toMatch(VERDICT_HEADING);
      });

      // PROP-SKILL-04: VERDICT format block present
      // PLAN acceptance criteria (a): file contains the VERDICT trailer string listing valid values
      it("contains the VERDICT format block documenting valid verdict values", () => {
        // The SKILL.md documents valid verdict values in the template
        expect(content).toContain("VERDICT: <verdict-value>");
        // The bullet point documents the valid values (case-sensitive list)
        expect(content).toMatch(
          /`Approved`, `Approved with minor changes`, `Needs revision`/
        );
      });

      // PROP-SKILL-04: finding-count JSON format present
      it('contains the finding-count JSON format with "high", "medium", "low" keys', () => {
        expect(content).toContain('"high":');
        expect(content).toContain('"medium":');
        expect(content).toContain('"low":');
      });

      // PROP-COMPAT-09: trailer appears after "Communication Style" section
      it('has the VERDICT trailer after the "Communication Style" section', () => {
        const commIdx = content.indexOf("## Communication Style");
        const verdictIdx = content.search(VERDICT_HEADING);
        expect(commIdx).toBeGreaterThan(-1);
        expect(verdictIdx).toBeGreaterThan(-1);
        expect(verdictIdx).toBeGreaterThan(commIdx);
      });

      // PROP-COMPAT-09: trailer preceded by a --- separator
      it("has a --- separator before the Verdict section", () => {
        const verdictIdx = content.search(VERDICT_HEADING);
        const beforeVerdict = content.slice(
          Math.max(0, verdictIdx - 10),
          verdictIdx
        );
        // There should be a --- somewhere between Communication Style and the Verdict section
        const commToVerdict = content.slice(
          content.indexOf("## Communication Style"),
          verdictIdx
        );
        expect(commToVerdict).toContain("---");
      });

      // PROP-SKILL-PERSONA: each reviewer must have a constructive, evidence-based persona
      it("has a Constructive Reviewer persona section establishing a collaborative, rigorous mindset", () => {
        expect(content).toContain("## Persona: The Constructive Reviewer");
        // Must frame the review as collaborative and evidence-based, not adversarial
        expect(content).toMatch(/supportive|constructive|collaborat/i);
        expect(content).not.toMatch(/hostile|burden of proof/i);
        // The shared team principles are present
        expect(content).toContain("## Team Principles");
        // The mechanical approval rule is intact, at the 2026-08-08 High-only bar
        // (DEC-BAR-01): High blocks, Medium and Low do not.
        expect(content).toContain("| Any High finding | Needs revision |");
        expect(content).toContain("| Medium or Low findings only | Approved with minor changes |");
        expect(content).not.toContain("Any High or Medium finding");
      });
    });
  }
});

// RLH-SKILL-01 … RLH-SKILL-09 — TSPEC §7.4 SKILL prompt amendments, PLAN §10.1 layer L1.
//
// These assert *presence and grammar only*: that each amendment's instruction is in the file and is
// byte-consistent with the grammar the workflow script parses. No test can assert that an agent
// reading the prompt obeys it (PLAN §10). Deliberately NOT a SKILL-template-vs-fixture drift
// detector — PLAN §10.2 and §11.3 H-j bind that to QUEUE.md Order 9.
describe("SKILL prompt amendments (TSPEC §7.4)", () => {
  const readSkill = (relPath) =>
    readFileSync(join(SKILLS_ROOT, relPath), "utf8");

  // TSPEC §7.4 row 1 — the three review SKILLs: write the `## Verdict` section as the file's
  // **last** section, in §4.4's exact grammar. FSPEC §6.5.
  const reviewAmendments = [
    { id: "RLH-SKILL-01", name: "se-review", file: "se-review/SKILL.md" },
    { id: "RLH-SKILL-02", name: "pm-review", file: "pm-review/SKILL.md" },
    { id: "RLH-SKILL-03", name: "te-review", file: "te-review/SKILL.md" },
  ];

  for (const { id, name, file } of reviewAmendments) {
    it(`${id}: ${name}/SKILL.md documents the trailing "## Verdict" section in TSPEC §4.4 grammar`, () => {
      const content = readSkill(file);

      // The bare `## Verdict` heading of the cross-review *file* (distinct from the SKILL's own
      // consolidated "## Verdict (required — workflow data contract)" documentation section, which
      // carries a parenthetical suffix and so does not match this anchored pattern).
      const headingMatch = /^## Verdict$/m.exec(content);
      expect(headingMatch).not.toBeNull();

      // §4.4's grammar: the `VERDICT:` line, then the finding-count JSON line.
      const section = content.slice(headingMatch.index);
      expect(section).toMatch(/^VERDICT: /m);
      expect(section).toMatch(
        /^\{"high": \d+, "medium": \d+, "low": \d+\}$/m
      );

      // TSPEC §7.4: it is the file's **last** section.
      expect(content).toMatch(/last section/i);
    });
  }

  // TSPEC §7.4 row 2 — the three author SKILLs: end every response with
  // `REVISION-COMPLETE: yes|no` as its **last line**; observe the pacing contract. FSPEC §8.5.
  const authorAmendments = [
    { id: "RLH-SKILL-04", name: "se-author", file: "se-author/SKILL.md" },
    { id: "RLH-SKILL-05", name: "pm-author", file: "pm-author/SKILL.md" },
    { id: "RLH-SKILL-06", name: "te-author", file: "te-author/SKILL.md" },
  ];

  for (const { id, name, file } of authorAmendments) {
    it(`${id}: ${name}/SKILL.md documents the REVISION-COMPLETE trailer and the pacing contract`, () => {
      const content = readSkill(file);

      // The marker literal and both permitted values.
      expect(content).toContain("REVISION-COMPLETE:");
      expect(content).toMatch(/REVISION-COMPLETE: yes/);
      expect(content).toMatch(/REVISION-COMPLETE: no/);

      // TSPEC §7.4: it is the response's **last line**.
      expect(content).toMatch(/last line/i);

      // The pacing contract (TSPEC §5.6): skeleton first, one top-level section per write,
      // commit after each, at most MAX_AUTHORING_WRITE_BYTES per tool call.
      expect(content).toMatch(/skeleton first/i);
      expect(content).toMatch(/section per (write|tool call)/i);
      expect(content).toMatch(/commit after each/i);
      expect(content).toContain("MAX_AUTHORING_WRITE_BYTES");
      expect(content).toMatch(/12,?000/);
    });
  }

  // TSPEC §7.4 row 3 — harvest-learnings: emit `## 6. Approval Record` per §4.4, copying the
  // anchor lines **verbatim** and never recomputing. FSPEC §9.4.
  it("RLH-SKILL-07: harvest-learnings/SKILL.md documents the `## 6. Approval Record` section", () => {
    const content = readSkill("harvest-learnings/SKILL.md");

    expect(content).toContain("## 6. Approval Record");

    // §4.4's six columns, in order.
    const columns = [
      "Document Type",
      "Round",
      "Role",
      "Verdict",
      "Approval Hash",
      "Reviewed Commit",
    ];
    let cursor = content.indexOf("## 6. Approval Record");
    for (const column of columns) {
      const at = content.indexOf(column, cursor);
      expect([column, at >= 0]).toEqual([column, true]);
      cursor = at + column.length;
    }

    // §4.4: "Copy, never recompute."
    expect(content).toMatch(/copy, never recompute/i);
  });

  // TSPEC §7.4 row 4 / row 5 — RLH-SKILL-08 (orchestrate-dev: POSTMORTEM lifecycle and the
  // `RESOLVED:` marker) and RLH-SKILL-09 (orchestrate-queue: a `halted` row is committed)
  // formerly lived here as their own assertions. PLAN T20 (pdlc-plugin-retirement, class 11)
  // rewrites both SKILL.md files as thin delegators onto `pdlc dev <req-path>` / `pdlc queue`,
  // moving the runbook mechanics both assertions pinned (POSTMORTEM/`RESOLVED:` lifecycle,
  // `halted`-row commit) out of the SKILL.md files entirely and into `@kaneho/pdlc-engine`. TSPEC
  // §5.5/§7.4 retargets both obligations onto AT-3.1's static half rather than restating them
  // against text that no longer exists on either file: RLH-SKILL-08's successor is
  // `orchestrateDevSkill.test.js:93`'s AT-3.1-style static-half test for `orchestrate-dev/
  // SKILL.md`; RLH-SKILL-09's successor is the `AT-3.1` test immediately below, which already
  // covers `orchestrate-queue/SKILL.md`'s four delegator conjuncts. Neither id is reused — both
  // obligations are live elsewhere, not dropped.

  // ---------------------------------------------------------------------------
  // AT-3.1 static half (TSPEC §3.3, §5.2) — orchestrate-queue/SKILL.md's delegator
  // conjuncts. orchestrate-dev/SKILL.md's own static half lives in
  // `orchestrateDevSkill.test.js` (TE TSPEC v9 F-02's host split).
  //
  // Held under T20 (not `.skip`, deliberately): this file is a member of
  // `consumerCleanup.test.js`'s `SWEPT_SURFACE_MODULES` (TSPEC §5.5), so a bare
  // `.skip` for a task-sequencing hold would register as an orphan under the
  // skip-join oracle. Instead this test passes vacuously until T20 rewrites
  // `orchestrate-queue/SKILL.md` as a thin delegator (detected below by the
  // presence of the verbatim invocation line), and starts asserting for real
  // the moment that lands.
  // ---------------------------------------------------------------------------

  it("AT-3.1: orchestrate-queue/SKILL.md is a thin delegator onto `pdlc queue` (TSPEC §3.3)", () => {
    const content = readSkill("orchestrate-queue/SKILL.md");
    if (!content.includes("pdlc queue")) {
      return;
    }

    // (a) the invocation line is present verbatim.
    expect(content).toContain("pdlc queue");

    // (b) the three-step resolution ladder of §3.3 is present.
    expect(content).toContain("npm install -g @kaneho/pdlc-engine");
    expect(content).toContain("npx --no-install pdlc");

    // (c) the refusal text names the install command.
    expect(content).toMatch(/refus[a-z]*[^\n]{0,200}npm install -g @kaneho\/pdlc-engine/is);

    // (d) no selection / readiness / dispatch / verdict-parsing / queue-writeback text remains.
    expect(content).not.toMatch(/queue selection/i);
    expect(content).not.toMatch(/readiness evaluation/i);
    expect(content).not.toMatch(/phase dispatch/i);
    expect(content).not.toMatch(/verdict pars(e|ing)/i);
    expect(content).not.toMatch(/queue-row writeback/i);
  });
});

// ---------------------------------------------------------------------------
// RLH-SKILL-10 (TSPEC §5.2) — consolidate-learnings/SKILL.md is not a delegator, so
// AT-3.1's four-conjunct ladder does not apply; it gets the class-11 two-part obligation
// instead (§2.9 class 11, §6.1 erratum 3, REQ O-8): every path the file names exists at
// HEAD, and the file's text names no retired host.
//
// Held under T20 (not `.skip`, deliberately — same SWEPT_SURFACE_MODULES rationale as
// the AT-3.1 static-half test above). Passes vacuously until T20's edit removes the
// retired per-module bundle-artifact reference (detected below), and starts asserting for
// real the moment that lands.
// ---------------------------------------------------------------------------

describe("RLH-SKILL-10 — consolidate-learnings/SKILL.md survival (TSPEC §5.2, class 11)", () => {
  it("every path the file names exists at HEAD, and no retired host survives in its text", () => {
    const readSkill = (relPath) => readFileSync(join(SKILLS_ROOT, relPath), "utf8");
    const content = readSkill("consolidate-learnings/SKILL.md");
    if (content.includes("consolidate-learnings.bundle" + ".js")) {
      return;
    }

    // (b) — no retired host survives.
    expect(content).not.toMatch(/consolidate-learnings\.bundle\.js/);
    expect(content).not.toMatch(/runtime-adapter\.js/);

    // (a) — every backticked, repo-relative path the file names exists at HEAD.
    const REPO_ROOT = resolve(SKILLS_ROOT, "..", "..");
    const pathPattern = /`((?:pdlc|docs)\/[a-zA-Z0-9_./-]+)`/g;
    const named = new Set();
    let match;
    while ((match = pathPattern.exec(content))) {
      named.add(match[1]);
    }
    expect(named.size).toBeGreaterThan(0);
    for (const relPath of named) {
      const abs = resolve(REPO_ROOT, relPath.replace(/\/$/, ""));
      expect([relPath, existsSync(abs)]).toEqual([relPath, true]);
    }
  });
});

// PROP-COMPAT-07, PROP-COMPAT-08: Worker and tech-lead skills are unmodified
describe("Worker skill files — unmodified (TSPEC-NFR-05, REQ-COMPAT-03)", () => {
  const workerSkills = [
    "pm-author/SKILL.md",
    "se-author/SKILL.md",
    "te-author/SKILL.md",
    "se-implement/SKILL.md",
    "harvest-learnings/SKILL.md",
    "consolidate-learnings/SKILL.md",
    "tech-lead/SKILL.md",
    "tech-lead-python/SKILL.md",
  ];

  for (const file of workerSkills) {
    it(`${file} exists`, () => {
      const filePath = join(SKILLS_ROOT, file);
      let content;
      expect(() => {
        content = readFileSync(filePath, "utf8");
      }).not.toThrow();
      expect(content.length).toBeGreaterThan(0);
    });
  }
});
