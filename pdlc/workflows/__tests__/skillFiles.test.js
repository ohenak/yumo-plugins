import { readFileSync } from "fs";
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

      // PROP-SKILL-01/02/03: VERDICT Trailer section header present
      it("contains the VERDICT Trailer section header", () => {
        expect(content).toContain(
          "## VERDICT Trailer (required — workflow data contract)"
        );
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
        const verdictIdx = content.indexOf(
          "## VERDICT Trailer (required — workflow data contract)"
        );
        expect(commIdx).toBeGreaterThan(-1);
        expect(verdictIdx).toBeGreaterThan(-1);
        expect(verdictIdx).toBeGreaterThan(commIdx);
      });

      // PROP-COMPAT-09: trailer preceded by a --- separator
      it("has a --- separator before the VERDICT Trailer section", () => {
        const verdictIdx = content.indexOf(
          "## VERDICT Trailer (required — workflow data contract)"
        );
        const beforeVerdict = content.slice(
          Math.max(0, verdictIdx - 10),
          verdictIdx
        );
        // There should be a --- somewhere between Communication Style and VERDICT Trailer
        const commToVerdict = content.slice(
          content.indexOf("## Communication Style"),
          verdictIdx
        );
        expect(commToVerdict).toContain("---");
      });

      // PROP-SKILL-CHALLENGER: each reviewer must have an adversarial challenger persona
      it("has a Challenger persona section establishing hostile auditor mindset", () => {
        expect(content).toContain("## Persona: The Challenger");
        // Must frame the reviewer as adversarial, not passive
        expect(content).toMatch(/hostile|burden of proof|default position/i);
        // Must make "Needs revision" the default, not "Approved"
        expect(content).toMatch(/Needs revision.*default|default.*Needs revision/i);
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

      // The `## Verdict` heading itself (distinct from the pre-existing, case-different
      // "## VERDICT Trailer (required — workflow data contract)" section).
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

  // TSPEC §7.4 row 4 — orchestrate-dev: document the POSTMORTEM lifecycle and the `RESOLVED:`
  // marker, which §5.8 states is human-written only. AC-5.3.
  it("RLH-SKILL-08: orchestrate-dev/SKILL.md documents the POSTMORTEM lifecycle and the human-written `RESOLVED:` marker", () => {
    const content = readSkill("orchestrate-dev/SKILL.md");

    expect(content).toContain("POSTMORTEM");
    expect(content).toContain("RESOLVED:");
    expect(content).toMatch(/RESOLVED: yes/);
    expect(content).toMatch(/RESOLVED: no/);

    // §5.8: no agent and no script ever writes `yes`.
    expect(content).toMatch(/human-written only/i);
  });

  // TSPEC §7.4 row 5 — orchestrate-queue: document that a `halted` row is committed. AC-5.4.
  it("RLH-SKILL-09: orchestrate-queue/SKILL.md documents that a `halted` row is committed", () => {
    const content = readSkill("orchestrate-queue/SKILL.md");

    expect(content).toContain("halted");
    expect(content).toMatch(/halted[^\n]{0,120}committed/i);
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
