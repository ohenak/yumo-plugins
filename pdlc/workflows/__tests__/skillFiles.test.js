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
