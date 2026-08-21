/**
 * learningsErratumBinding.test.js — CODE_REVIEW v1 F11 and F12.
 *
 * Both findings are the same shape: a deferral written into a source comment and addressed to
 * nobody. F11's was `ERRATUM: FSPEC` / `ERRATUM: REQ` routing for the mixed count/byte
 * rejection case, conceding in-code that the rule the code implements "is still not stated in
 * so many words upstream" — with no queue row and no successor REQ binding it, and with FSPEC
 * BR-6 still reading in the way the code deliberately does not. F12's was the capture script's
 * "not wired into this CLI entrypoint **yet**".
 *
 * The remedy for both was to CLOSE them (apply the erratum upstream; wire the entry point),
 * not to bind them. So this suite asserts the closed state, from both ends:
 *
 *   1. the upstream text now states the rule the code implements, in words specific enough
 *      that the disagreement F11 found would fail here; and
 *   2. no routing or deferral marker survives in the two source files — a re-introduced
 *      `ERRATUM:` comment or a re-introduced "yet" stub reopens the finding and must redden.
 *
 * The upstream half is asserted by CONTENT, not by a version-number bump: a changelog entry
 * that says the erratum landed while BR-6 still reads the old way is precisely the defect.
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..", "..");
const read = (relPath) => readFileSync(join(repoRoot, relPath), "utf8");

const FSPEC = "docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md";
const REQ = "docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md";
const DEV = "pdlc/workflows/orchestrate-dev.js";
const CAPTURE = "scripts/capture-learnings-baseline.mjs";

// The paragraph BR-6 states the total bound in. Sliced so the assertions below cannot be
// satisfied by some unrelated sentence elsewhere in a 900-line specification.
function totalBoundParagraph(fspecText) {
  const start = fspecText.indexOf("**How the total bound binds.**");
  if (start < 0) return "";
  const rest = fspecText.slice(start);
  const end = rest.indexOf("**Determinism.**");
  return end < 0 ? rest : rest.slice(0, end);
}

function acParagraph(reqText, id) {
  const start = reqText.indexOf(`- **${id}**`);
  if (start < 0) return "";
  const rest = reqText.slice(start + 1);
  const end = rest.search(/^- \*\*AC-/m);
  return end < 0 ? rest : rest.slice(0, end);
}

describe("LI-ERR: the mixed count/byte erratum is applied upstream, not routed to nobody (F11)", () => {
  test("LI-ERR-01: BR-6's total bound is stated over the count bound's window, not over the whole corpus", () => {
    const paragraph = totalBoundParagraph(read(FSPEC));
    expect(paragraph.length).toBeGreaterThan(0);
    // The qualifier the code implements: accumulation ranges over what the count bound left.
    expect(paragraph).toMatch(/window/i);
    expect(paragraph).toMatch(/BR-5|count bound/);
  });

  test("LI-ERR-02: BR-6 states the mixed case — a document past the window carries RSN-COUNT", () => {
    const paragraph = totalBoundParagraph(read(FSPEC));
    expect(paragraph).toContain("RSN-COUNT");
    expect(paragraph).toContain("RSN-BYTES");
  });

  test("LI-ERR-03: REQ AC-2.4 attributes each dropped document by its cause", () => {
    const paragraph = acParagraph(read(REQ), "AC-2.4");
    expect(paragraph.length).toBeGreaterThan(0);
    expect(paragraph).toMatch(/cause/i);
    expect(paragraph).toMatch(/count bound/i);
  });

  test("LI-ERR-04: no erratum routing comment survives in the LEARNINGS INJECTION REGION", () => {
    // Scoped to the feature's own region: `orchestrate-dev.js` also implements the pipeline's
    // erratum GRAMMAR (`ERRATUM: FSPEC: §3.1: …` as a reviewer writes it), and those mentions
    // are the machinery, not a deferral. A region-scoped assertion fails on a re-introduced
    // routing comment without being hostage to unrelated code a thousand lines away.
    const text = read(DEV);
    const start = text.indexOf("=== LEARNINGS INJECTION REGION START ===");
    const end = text.indexOf("=== LEARNINGS INJECTION REGION END ===");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const region = text.slice(start, end);
    expect(region).not.toMatch(/ERRATUM: (FSPEC|REQ|TSPEC|PLAN|PROPERTIES|DECISIONS)/);
    expect(region).not.toContain("not stated in so many words upstream");
    expect(region).not.toMatch(/\brouted as\b/);
  });
});

describe("LI-ERR: the capture entry point carries no unbound deferral (F12)", () => {
  test("LI-ERR-05: no 'not wired yet' deferral survives in the capture script's live code", () => {
    // Comments are stripped first, deliberately. The history of the finding is worth keeping in
    // the file — the entry point's shape is only explicable with it — and that history quotes
    // the old refusal message verbatim. What must not survive is a deferral in CODE: a refusal
    // message an operator can still be shown, or a "yet" in any live string.
    const code = read(CAPTURE)
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^\s*\/\/.*$/gm, " ");
    expect(code).not.toMatch(/\byet\b/);
    expect(code).not.toMatch(/entrypoint|not wired/i);
    // Positive half: the entry point does real work rather than refusing. Without this, the
    // negatives above would be satisfied by deleting the entry point's body entirely.
    expect(code).toMatch(/isMainModule/);
    expect(code).toMatch(/runCaptureScript\(/);
  });
});
