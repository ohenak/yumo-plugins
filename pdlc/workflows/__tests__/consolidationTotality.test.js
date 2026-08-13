// consolidationTotality.test.js — DC-01, §8.1's reader rows, §10.3/§10.4.
//
// Every pure export of `consolidate-learnings.js` is documented as TOTAL: a missing field renders
// as empty or `(unavailable)`, a missing collection renders as `none`, and nothing throws. That
// promise is what lets a degraded pass still emit a readable row instead of an exception, and it
// is exactly the promise no happy-path fixture exercises — every existing suite hands these
// functions well-formed state, so the fallback arms ship unobserved.
//
// The oracles here are the promise itself, stated three ways:
//   (i)   no export throws on a degenerate argument (undefined / null / wrong type);
//   (ii)  the two report renderers emit EVERY documented line even when handed nothing — §10.3's
//         row fields and §10.4's ten numbered items (DC-01: "each present even when empty");
//   (iii) an absent value renders as the reserved word for absence, never as `undefined` or
//         `null` leaking into an operator-visible artifact.
//
// (iii) is the one that would catch a real regression quietly: `${s.status}` on an absent status
// prints the string "undefined", which reads to an operator as a status.

import { execFileSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import main, {
  UNAVAILABLE,
  cadenceDatum,
  classifyCorpus,
  clearsPatternBar,
  configNotices,
  directFlag,
  effectivenessTable,
  enactedByLog,
  enactedByPr,
  failureModeId,
  markerVerdict,
  mergeProposals,
  mintPassId,
  parseConsolidationConfig,
  parseConsumedBlocks,
  parseCorpusListing,
  parseEscalations,
  parseMarker,
  phasesExercised,
  promotionSources,
  proposalPathFor,
  remediationChoice,
  renderConsumedPair,
  renderEffectivenessTable,
  renderEvidenceLine,
  renderFailureModeRecord,
  renderPrBody,
  renderPromotionCommitMessage,
  renderProposalFile,
  renderReportBody,
  renderTerminalRow,
  resolveSeamDomain,
  resolveSeamVerb,
  routeOf,
  routeProposal,
  seamCandidates,
  targetFor,
  triggerFor,
} from "../consolidate-learnings.js";

// The degenerate arguments every total function must survive. `NaN` and `-0` are included
// because they are the two numbers that break naive equality guards.
const JUNK = [undefined, null, "", 0, NaN, -0, false, true, 42, "text", [], {}, () => {}];

/** Every unary (or unary-usable) pure export, by name, with the arity it is called at here. */
const UNARY = {
  clearsPatternBar,
  directFlag,
  renderEvidenceLine,
  parseCorpusListing,
  parseConsumedBlocks,
  cadenceDatum,
  parseMarker,
  phasesExercised,
  routeOf,
  routeProposal,
  parseEscalations,
  seamCandidates,
  configNotices,
  parseConsolidationConfig,
  proposalPathFor,
  renderFailureModeRecord,
  renderEffectivenessTable,
  renderTerminalRow,
  renderReportBody,
};

describe("DC-01: every pure export is total", () => {
  describe.each(Object.keys(UNARY))("%s", (name) => {
    it.each(JUNK.map((j, i) => [i, j]))("survives junk argument #%i", (_i, junk) => {
      expect(() => UNARY[name](junk)).not.toThrow();
    });
  });

  it("the multi-argument exports survive an all-junk call", () => {
    for (const junk of JUNK) {
      expect(() => classifyCorpus(junk, junk)).not.toThrow();
      expect(() => promotionSources(junk, junk)).not.toThrow();
      expect(() => renderConsumedPair(junk, junk)).not.toThrow();
      expect(() => triggerFor(junk === undefined ? undefined : { unconsolidated: junk })).not.toThrow();
      expect(() => mintPassId(junk, junk)).not.toThrow();
      expect(() => markerVerdict(junk, junk, junk, junk)).not.toThrow();
      expect(() => failureModeId(junk, junk)).not.toThrow();
      expect(() => targetFor(junk, junk, junk)).not.toThrow();
      expect(() => mergeProposals(junk)).not.toThrow();
      expect(() => effectivenessTable(junk, junk, junk)).not.toThrow();
      expect(() => remediationChoice(junk, junk, junk, junk)).not.toThrow();
      expect(() => enactedByLog(junk, junk)).not.toThrow();
      expect(() => enactedByPr(junk, junk)).not.toThrow();
      expect(() => renderPrBody(junk, junk)).not.toThrow();
      expect(() => renderProposalFile(junk, junk)).not.toThrow();
      expect(() => renderPromotionCommitMessage(junk, junk)).not.toThrow();
      expect(() => resolveSeamDomain(junk, junk, junk)).not.toThrow();
      expect(() => resolveSeamVerb(junk, junk)).not.toThrow();
    }
  });
});

// ─── §10.3: the terminal row is whole even when the pass state is not ────────────────────────
describe("§10.3: renderTerminalRow on an empty state", () => {
  const { text, dropped } = renderTerminalRow(undefined);

  it.each([
    "pass:",
    "date:",
    "status:",
    "trigger:",
    "reason:",
    "rung:",
    "credential:",
    "consumed:",
    "promotions:",
    "suppressed-by:",
    "branch:",
    "deferred:",
  ])("still carries the `%s` field", (field) => {
    expect(text).toContain(field);
  });

  it("omits `pr:` — the sole biconditional field — rather than emptying it", () => {
    expect(text).not.toMatch(/^pr:/m);
  });

  it("renders the empty collections with the reserved word, and drops no code it did not classify", () => {
    expect(text).toMatch(/^promotions: none$/m);
    expect(text).toMatch(/^deferred: none$/m);
    expect(Array.isArray(dropped)).toBe(true);
  });

  it("never leaks `undefined` or `null` into the operator-visible row", () => {
    expect(text).not.toMatch(/\bundefined\b/);
    expect(text).not.toMatch(/\bnull\b/);
  });
});

// ─── §10.4: the ten items are ten items on any state ─────────────────────────────────────────
describe("§10.4: renderReportBody on an empty state", () => {
  const body = renderReportBody(undefined);

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])("carries item %i", (n) => {
    expect(body).toMatch(new RegExp(`^${n}\\. `, "m"));
  });

  it("reports the open-promotion count as a number, not an absence", () => {
    expect(body).toMatch(/^10\. open promotions: \d+$/m);
  });

  it("never leaks `undefined` or `null`", () => {
    expect(body).not.toMatch(/\bundefined\b/);
    expect(body).not.toMatch(/\bnull\b/);
  });
});

// ─── §8.1's reader rows: a sparse record renders every field, absent ones empty ──────────────
describe("§8.1: renderFailureModeRecord is total over a sparse record", () => {
  const FIELDS = [
    "failure-mode-id",
    "phase",
    "symptom",
    "artifact",
    "target",
    "passId",
    "action",
    "route",
  ];

  it.each([undefined, null, {}, { failureModeId: "fm-x" }])(
    "emits all eight keys for %p",
    (record) => {
      const text = renderFailureModeRecord(record);
      for (const field of FIELDS) expect(text).toMatch(new RegExp(`^${field}: `, "m"));
      expect(text).not.toMatch(/\bundefined\b/);
      expect(text).not.toMatch(/\bnull\b/);
    }
  );
});

describe("§8.1: renderEffectivenessTable marks an absent artifact unavailable", () => {
  it("uses the reserved word rather than printing the absence", () => {
    const text = renderEffectivenessTable([
      { failureModeId: "fm-a", artifact: null, verdict: "insufficient-evidence" },
      { failureModeId: "fm-b", artifact: undefined, verdict: "recurred", state: "ineffective" },
    ]);
    expect(text).toContain(UNAVAILABLE);
    expect(text).not.toMatch(/artifact: (undefined|null)/);
    expect(text).toMatch(/state: ineffective/);
  });

  it("renders `none` for an empty or non-array argument", () => {
    expect(renderEffectivenessTable([])).toBe("none");
    expect(renderEffectivenessTable(undefined)).toBe("none");
  });
});

// ─── §5.5: the module-default seams, driven with nothing injected ────────────────────────────
// Every other suite injects all thirteen seams, so the defaults — real `fs`, real `git`, and the
// deliberately loud `defaultCheckFile` — ship unobserved. They are not decoration: they are what
// runs when an operator invokes the pass with no doubles, and §5.5 makes two specific promises
// about them that only an uninjected call can check.
describe("§5.5: `main` with no seams injected", () => {
  const cwd = process.cwd();
  let tmp;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "pdlc-noseam-"));
    mkdirSync(join(tmp, "docs", "_decisions"), { recursive: true });
  });

  afterEach(() => {
    process.chdir(cwd);
    rmSync(tmp, { recursive: true, force: true });
  });

  it("outside a git work tree, the real `git` seam's failure is the corpus-unlistable terminal — §10.3 row 1a, never a throw and never `no-op`", async () => {
    process.chdir(tmp);
    const report = await main({});

    expect(report.status).toBe("failed");
    // The pathspec and git's own stderr are in the body, so the operator can see WHICH call failed.
    expect(report.body).toMatch(/corpus unlistable: ls-files/);
    expect(report.body).toMatch(/not a git repository/);
    expect(report.status).not.toBe("no-op");
  });

  it("the real `fs` seams wrote the log through the default write path", async () => {
    process.chdir(tmp);
    await main({});
    const logPath = join(tmp, "docs", "_decisions", ".consolidation-log.md");
    expect(existsSync(logPath)).toBe(true);
    expect(readFileSync(logPath, "utf8")).toMatch(/status: failed/);
  });

  it("inside a real git work tree, `defaultCheckFile` fails LOUDLY at the marker probe rather than reporting a quiet tree (§5.5's stated exception)", async () => {
    execFileSync("git", ["init", "-q", tmp]);
    process.chdir(tmp);
    // Reaching this throw means the default `git` seam's SUCCESS arm ran (the corpus listed) and
    // the pass advanced to the marker. A default that returned `{ok:false, reason:"file_missing"}`
    // would be indistinguishable from a healthy tree, which is precisely what §5.5 refuses.
    await expect(main({})).rejects.toThrow(/defaultCheckFile\(\) not available/);
  });
});
