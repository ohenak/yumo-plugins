/**
 * loopEconomicsAnchorGuard.test.js — T-03 (REQ-LOOPECON-01a, PROP-LOOPECON-02,
 * DEC-LOOPECON-07). M1a's obligation is a REGRESSION GUARD, not new code:
 * `appendApprovalAnchors` is already the sole writer of the
 * `APPROVAL-HASH` / `APPROVAL-HASH-NORMALIZED` / `REVIEWED-COMMIT` anchor
 * block (§3.1), and no prompt/clause builder may ever transcribe those
 * tokens or the anchor template into agent-visible text. This file pins
 * that absence so a FUTURE builder can't quietly grow a transcription
 * instruction and let an agent smuggle a stale/forged anchor onto disk.
 *
 * TSPEC §3.2 census oracle: three independently falsifying conjuncts.
 *
 *   1. Set equality on the census — the derived top-level `*Prompt`/`*Clause`
 *      builder names in `orchestrate-dev.js` at HEAD equal a hand-transcribed
 *      frozen literal of 31 names. Set equality, never containment: a
 *      builder added later without being added here reds; a builder
 *      deleted here without being deleted there also reds.
 *   2. Zero anchor tokens — none of those 31 builders' bodies contain the
 *      literal substrings `APPROVAL-HASH`, `REVIEWED-COMMIT` or
 *      `UPSTREAM-STATE`. True at HEAD today; this conjunct only pins it.
 *      No sanctioned read-only quote exception exists in the source today,
 *      so none is carved out here (TSPEC §3.2 names none).
 *   3. Sole writer — the literal anchor-template fragment `` `\nAPPROVAL-HASH: ` ``
 *      occurs exactly once in the module, inside `appendApprovalAnchors`,
 *      and that function's body passes the anchor text to `_appendFile`,
 *      never to `_agent`.
 *
 * A fourth, BEHAVIOURAL conjunct completes the pin (§3.2): driving
 * `reviewLoop` — the only exported entry point that reaches
 * `appendApprovalAnchors` on its PASS branch — with scripted `_hashFile` /
 * `_git` doubles proves the anchor records the hash/commit the seam
 * returns AT CALL TIME for THAT round, never a caller-supplied "previous"
 * value carried over from an earlier round.
 *
 * This oracle deliberately reads `orchestrate-dev.js` as bytes (structural
 * parse), not through an AST — matching the census-style tests elsewhere in
 * this suite — and deliberately does NOT grep SKILL.md files: that's out of
 * scope for this guard (REQ NG-2).
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { reviewLoop } from "../orchestrate-dev.js";
import { fakeGit } from "./helpers/seams.js";
import { assertNoLiveGitWrites } from "./helpers/loopEconomicsDoubles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(__dirname, "..", "orchestrate-dev.js");
const SOURCE = readFileSync(SOURCE_PATH, "utf8");
const LINES = SOURCE.split("\n");

// ─── Structural derivation (TSPEC §3.2) ─────────────────────────────────────

/**
 * Top-level (column-0, so never a nested/closure-local helper) function
 * declarations, in source order. `^` anchors the regex to the start of the
 * line, which is exactly what excludes indented (non-top-level) functions.
 */
const DECL_RE = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/;

const allTopLevelDecls = [];
LINES.forEach((line, idx) => {
  const m = DECL_RE.exec(line);
  if (m) allTopLevelDecls.push({ name: m[1], line: idx });
});

const derivedCensus = allTopLevelDecls
  .filter((d) => /(Prompt|Clause)$/.test(d.name))
  .map((d) => d.name);

/** Hand-transcribed frozen literal (TSPEC §3.2 conjunct 1) — exactly 31 names:
 *  the 30 builders that predate this feature, plus M2's own `pinCheckPrompt`
 *  (TSPEC §3.2, §7.3). */
const FROZEN_CENSUS = [
  "planLintFeedForwardClause",
  "headingFeedForwardClause",
  "nearestHeadingMissClause",
  "branchPinClause",
  "skeletonClause",
  "resumeClause",
  "continuationClause",
  "groundingClause",
  "reviewerPrompt",
  "optimizerPrompt",
  "creatorPrompt",
  "erratumAuthorPrompt",
  "upstreamHeadClause",
  "erratumConfirmPrompt",
  "erratumRestatementPrompt",
  "findingGrammarClause",
  "erratumSupersetClause",
  "cascadeConfirmPrompt",
  "implementPrompt",
  "waveImplementPrompt",
  "propertiesTestPrompt",
  "harvestPrompt",
  "advisoryDistilPrompt",
  "createPrPrompt",
  "rebasePrompt",
  "dodVerifyPrompt",
  "dodReVerifyPrompt",
  "dodDocRemediatePrompt",
  "dodRemediatePrompt",
  "dodRoutedAwayClause",
  // pdlc-loop-economics M2 (TSPEC §7.3) — the batched pin-check dispatch builder.
  // It quotes the moved upstream digest read-only as evidence; conjunct 2 below
  // still holds because it names no anchor token.
  "pinCheckPrompt",
];

/** Anchor tokens no prompt/clause builder may ever transcribe. */
const ANCHOR_TOKENS = ["APPROVAL-HASH", "REVIEWED-COMMIT", "UPSTREAM-STATE"];

/**
 * A builder's body is the source between its own declaration line and the
 * next top-level function declaration (any name), or EOF for the last one.
 * Boundaries come from `allTopLevelDecls`, not just the census subset, so a
 * non-Prompt/Clause helper sandwiched between two builders can't silently
 * get folded into either body.
 */
function bodyOf(name) {
  const idx = allTopLevelDecls.findIndex((d) => d.name === name);
  if (idx === -1) throw new Error(`No top-level declaration found for ${name}`);
  const start = allTopLevelDecls[idx].line;
  const end = idx + 1 < allTopLevelDecls.length ? allTopLevelDecls[idx + 1].line : LINES.length;
  return LINES.slice(start, end).join("\n");
}

// ─── Conjunct 1: set equality on the census ─────────────────────────────────

describe("census set equality (TSPEC §3.2 conjunct 1)", () => {
  it("pins the frozen census at exactly 31 names", () => {
    expect(FROZEN_CENSUS.length).toBe(31);
    expect(new Set(FROZEN_CENSUS).size).toBe(31); // frozen list itself has no dupes
  });

  it("derives a builder set from HEAD source that equals the frozen census — set equality, never containment", () => {
    const derivedSorted = [...new Set(derivedCensus)].sort();
    const frozenSorted = [...new Set(FROZEN_CENSUS)].sort();
    // Symmetric: catches an ADDED builder (extra in derived) and a DELETED
    // builder (missing from derived) with equal force.
    expect(derivedSorted).toEqual(frozenSorted);
  });

  it("finds no duplicate top-level declaration for any census name (each builder appears exactly once)", () => {
    const counts = new Map();
    for (const d of allTopLevelDecls) {
      counts.set(d.name, (counts.get(d.name) || 0) + 1);
    }
    for (const name of FROZEN_CENSUS) {
      expect(counts.get(name)).toBe(1);
    }
  });
});

// ─── Conjunct 2: zero anchor tokens in any builder's body ───────────────────

describe("zero anchor-token transcription (TSPEC §3.2 conjunct 2)", () => {
  it.each(FROZEN_CENSUS)("%s's body contains none of APPROVAL-HASH / REVIEWED-COMMIT / UPSTREAM-STATE", (name) => {
    const body = bodyOf(name);
    for (const token of ANCHOR_TOKENS) {
      expect(body).not.toContain(token);
    }
  });
});

// ─── Conjunct 3: sole writer ─────────────────────────────────────────────────

describe("sole writer of the anchor template (TSPEC §3.2 conjunct 3)", () => {
  it("emits the literal anchor-template fragment exactly once in the whole module", () => {
    const fragment = "`\\nAPPROVAL-HASH: ";
    const occurrences = SOURCE.split(fragment).length - 1;
    expect(occurrences).toBe(1);
  });

  it("emits it only inside appendApprovalAnchors, never inside a census builder", () => {
    const fragment = "`\\nAPPROVAL-HASH: ";
    const charIdx = SOURCE.indexOf(fragment);
    expect(charIdx).toBeGreaterThan(-1);
    const line = SOURCE.slice(0, charIdx).split("\n").length - 1;

    const idx = allTopLevelDecls.findIndex((d) => d.name === "appendApprovalAnchors");
    expect(idx).toBeGreaterThan(-1);
    const start = allTopLevelDecls[idx].line;
    const end = idx + 1 < allTopLevelDecls.length ? allTopLevelDecls[idx + 1].line : LINES.length;

    expect(line).toBeGreaterThanOrEqual(start);
    expect(line).toBeLessThan(end);

    // Never inside any census builder's body.
    for (const name of FROZEN_CENSUS) {
      expect(bodyOf(name)).not.toContain(fragment);
    }
  });

  it("appendApprovalAnchors passes the anchor text to _appendFile, never to _agent", () => {
    const idx = allTopLevelDecls.findIndex((d) => d.name === "appendApprovalAnchors");
    const start = allTopLevelDecls[idx].line;
    const end = idx + 1 < allTopLevelDecls.length ? allTopLevelDecls[idx + 1].line : LINES.length;
    const body = LINES.slice(start, end).join("\n");

    expect(body).toContain("_appendFile(");
    expect(body).not.toContain("_agent");
  });
});

// ─── Behavioural conjunct: call-time capture, no stale carry-over ───────────

// TSPEC §10 (commit f325016): the mandatory leak check. Every scenario's `_git` is a scripted
// `fakeGit` recording into `lastGitCalls` module variable; if one were ever left at its real
// default — or if production grew an unreviewed write path — the argv would show up here and
// red immediately rather than writing to the repository. The log is drained each time.
// These scenarios DO reach one production write path through the seam: reviewLoop converges a
// round, and `appendApprovalAnchors` commits the anchor pair it has just appended. The rule
// is stricter than "the double is fake" — a recorded `commit` must be one this file names and
// asserts on — so the shape of every recorded commit is pinned BEFORE `commit` is opted in.
let lastGitCalls = null;
afterEach(() => {
  if (lastGitCalls) assertNoLiveGitWrites(lastGitCalls, { allow: ["commit"] });
  lastGitCalls = null;
});

describe("appendApprovalAnchors records the seam's call-time value, never a caller-supplied previous one", () => {
  const REVIEWERS = ["se-review", "te-review"];
  const APPROVE = 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';

  /** Drives one converging reviewLoop round and returns the appended anchor's hash/commit. */
  async function runRound(doc, hashValue, commitValue) {
    const appends = [];
    const git = fakeGit((argv) => ({
      ok: true,
      stdout: argv.includes("--abbrev-ref") ? "feat-anchor-provenance-feat" : commitValue,
    }));
    const result = await reviewLoop({
      doc,
      phase: "R",
      docType: "REQ",
      reviewers: REVIEWERS,
      optimizer: "pm-author",
      feature: "anchor-provenance-feat",
      _agent: async (skill) => (REVIEWERS.includes(skill) ? APPROVE : ""),
      _parallel: (thunks) => Promise.all(thunks),
      _checkFile: () => ({ ok: true }),
      _listFiles: () => ({ ok: true, files: [] }),
      _readFile: () => "## Verdict\n\nVERDICT: Approved\n",
      _hashFile: () => hashValue,
      _appendFile: (path, text) => appends.push({ path, text }),
      _git: git,
      _log: () => {},
    });

    lastGitCalls = git.calls;

    const text = appends.length ? appends[0].text : "";
    const hashMatch = /APPROVAL-HASH: (\S+)/.exec(text);
    const commitMatch = /REVIEWED-COMMIT: (\S+)/.exec(text);
    return {
      result,
      recordedHash: hashMatch ? hashMatch[1] : null,
      recordedCommit: commitMatch ? commitMatch[1] : null,
    };
  }

  it("records round 1's own hash/commit, then round 2's own — never round 1's carried into round 2", async () => {
    const hashA = "sha256:" + "a".repeat(64);
    const hashB = "sha256:" + "b".repeat(64);
    const commitA = "1".repeat(40);
    const commitB = "2".repeat(40);

    const round1 = await runRound("docs/anchor-provenance-feat/REQ-anchor-provenance-feat.md", hashA, commitA);
    expect(round1.result.converged).toBe(true);
    expect(round1.recordedHash).toBe(hashA);
    expect(round1.recordedCommit).toBe(commitA);

    const round2 = await runRound("docs/anchor-provenance-feat/REQ-anchor-provenance-feat.md", hashB, commitB);
    expect(round2.result.converged).toBe(true);
    expect(round2.recordedHash).toBe(hashB);
    expect(round2.recordedCommit).toBe(commitB);

    // The defining property: each round's anchor tracks THAT round's seam
    // return value. A caller-supplied/cached "previous" value reaching the
    // file would make round 2 equal round 1's hash or commit.
    expect(round2.recordedHash).not.toBe(round1.recordedHash);
    expect(round2.recordedCommit).not.toBe(round1.recordedCommit);
  });
});
