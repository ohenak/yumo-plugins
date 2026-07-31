/**
 * forcePhases.test.js — the operator force-run surface (TSPEC §3.1, §3.7, §5.7, §6.2 row 12).
 *
 * Ownership (PLAN §5.2, single-writer-per-file): RLH-14 (batch 2). RED on arrival.
 *
 * | Assertion | Stratum | Green from (PLAN §7.3) |
 * |---|---|---|
 * | `RLH-AT-29` | L1 — `parseForcePhases` only | batch 3 (RLH-05 (f)) |
 * | `parseForcePhases` catalogue closure (property) | L1 | batch 3 (RLH-05 (f)) |
 * | `RLH-AT-28` | L2 — driven through `main()` | batch 8 (RLH-26) |
 * | `RLH-AT-01a` | L2 — driven through `main()` | batch 8 (RLH-26) |
 *
 * The module is imported as a **namespace** (`import * as devModule`) precisely so the
 * suite *runs* before `parseForcePhases` exists: a named import of a missing export is a
 * link-time `SyntaxError` that takes the whole file down, which is not a valid red
 * (PLAN §12.1). A namespace member that is `undefined` fails the one assertion that
 * touches it, which is.
 *
 * ## The shape being asserted (PLAN §13.1 — pinned, not open)
 *
 * `main()`'s `forcePhases` is a **raw, unparsed operator string** (TSPEC §3.1).
 * `parseForcePhases(raw)` returns `{ ok: true, phases: Set<string> }` or
 * `{ ok: false, badTokens: string[] }`. **No array of phases exists anywhere** — the
 * accepted branch carries a `Set`, and these tests assert `Set`-ness directly so an
 * array-returning implementation reds rather than passing on `.includes`-shaped duck
 * typing.
 */

import * as devModule from "../orchestrate-dev.js";
import { resolveSeed, seeded } from "./helpers/driftGenerators.js";
import { fakeListFiles } from "./helpers/seams.js";

const main = devModule.default;

/**
 * The closed force-phase catalogue — TSPEC §5.7's `valid` array, verbatim and in its
 * declared order. Six document-review phases; `PR` entered the catalogue at REQ/FSPEC
 * v1.6 (TSPEC §10.3 `T-Q-01`). Restated here rather than read off the module under test:
 * a catalogue derived from the subject agrees with a wrong subject by construction.
 *
 * @type {readonly string[]}
 */
const VALID_TOKENS = Object.freeze(["R", "F", "T", "P", "D", "PR"]);

/**
 * The seventh accepted token. It is accepted but is **not** a phase: it expands to the
 * whole of `VALID_TOKENS` (TSPEC §5.7 — "`all` means six phases, not five").
 */
const ALL_TOKEN = "all";

/**
 * The operator-facing rejection message's ending, copied verbatim from
 * **TSPEC §6.2 row 12** (`halt before any phase runs, ending ...`). It is reproduced
 * here as a literal exactly once, and every assertion below refers to this constant.
 *
 * TSPEC §5.7 makes the derivation load-bearing: the catalogue and the message come from
 * the same array "so they cannot desynchronise". This suite is that guard — it renders
 * the message ending *from the catalogue the parser actually accepts* and compares it to
 * the literal, so a five-token catalogue and a six-token message (or the reverse) is a
 * red, not a silent divergence.
 */
const REJECTION_MESSAGE_ENDING = "Valid: R, F, T, P, D, PR, all.";

/**
 * Render the message ending from a catalogue, the way TSPEC §5.7 requires an
 * implementation to render it: the accepted phase tokens in catalogue order, then `all`.
 *
 * @param {string[]} tokens - the accepted phase tokens, in catalogue order.
 * @returns {string}
 */
function renderMessageEnding(tokens) {
  return `Valid: ${[...tokens, ALL_TOKEN].join(", ")}.`;
}

// ─── RLH-AT-29 — a bad force token is rejected (FSPEC E-33; TSPEC §5.7, §6.2 row 12) ──

describe("RLH-AT-29 — bad force token rejection", () => {
  test("RLH-AT-29: a non-catalogue token is rejected, and the catalogue that phrases the operator message is the six-token set", () => {
    const { parseForcePhases } = devModule;

    // (i) FSPEC E-33 — `CR` and `DOD` are real phase ids, and are deliberately outside
    // the force catalogue (AC-4.7). Silently ignoring them would let an operator believe
    // a forced CR was honoured, so they are rejected, not dropped.
    const cr = parseForcePhases("CR");
    expect(cr.ok).toBe(false);
    expect(cr.badTokens).toEqual(["CR"]);
    expect(cr.phases).toBeUndefined();

    const dod = parseForcePhases("DOD");
    expect(dod.ok).toBe(false);
    expect(dod.badTokens).toEqual(["DOD"]);

    // Every bad token is reported, not just the first.
    const several = parseForcePhases("CR, Q DOD");
    expect(several.ok).toBe(false);
    expect(several.badTokens).toEqual(["CR", "Q", "DOD"]);

    // (ii) The catalogue half of the same guard. `all` expands to SIX phases, not five,
    // and the accepted branch carries a `Set` — never an array (PLAN §13.1).
    const all = parseForcePhases(ALL_TOKEN);
    expect(all.ok).toBe(true);
    expect(all.phases).toBeInstanceOf(Set);
    expect(all.phases.size).toBe(VALID_TOKENS.length);
    expect([...all.phases].sort()).toEqual([...VALID_TOKENS].sort());

    // (iii) The message ending, rendered from the catalogue the parser actually accepts,
    // is the TSPEC §6.2 row 12 literal. A catalogue/message divergence reds here.
    expect(renderMessageEnding(VALID_TOKENS)).toBe(REJECTION_MESSAGE_ENDING);
    expect(renderMessageEnding([...all.phases])).toBe(REJECTION_MESSAGE_ENDING);
  });
});

// ─── Property — `parseForcePhases` catalogue closure (TSPEC §8.2, PROPERTIES) ─────────

/**
 * This file's literal seed (PLAN §7.2 rule: every property file declares its own literal
 * seed and passes it through `resolveSeed`, which honours a `PDLC_PROP_SEED` override).
 */
const FORCE_PHASES_SEED = 0x5f0c3e17;

/** How many token strings the property draws. */
const FORCE_PHASES_CASES = 250;

/**
 * Junk tokens — every one of them outside the closed catalogue, and none of them
 * containing a comma or whitespace, so `parseForcePhases`' `/[,\s]+/` split recovers each
 * one intact and the expected classification is unambiguous.
 *
 * `CR` and `DOD` are here deliberately: they are real `PHASE_DISPATCH` ids that AC-4.7
 * puts out of scope (FSPEC E-33), which is the interesting rejection, not a typo.
 *
 * The casing variants (`r`, `f`, `pr`, `Pr`, `All`) are junk **because TSPEC §5.7 pins
 * `parseForcePhases` as case-sensitive** ("Total, case-sensitive, whitespace- and
 * comma-tolerant"), and its `valid.includes(t)` / `t !== "all"` tests are exact-match.
 *
 * @type {readonly string[]}
 */
const JUNK_TOKENS = Object.freeze([
  "CR",
  "DOD",
  "Q",
  "X",
  "REQ",
  "1",
  "R2",
  "-R",
  "r",
  "f",
  "pr",
  "Pr",
  "All",
  "ALL",
]);

/** Separators the parser must tolerate: any run of commas and whitespace (TSPEC §5.7). */
const SEPARATORS = Object.freeze([",", " ", ", ", " ,", "  ", ",,", " , ", "\t", "\n"]);

/**
 * File-local, **unexported** force-phase token-string generator, built only over
 * `driftGenerators.js`'s primitives (`int`, `pick`, `shuffle`) — PLAN §7.2 forbids
 * extending that library and forbids a second primitive library, so the domain generator
 * lives here.
 *
 * Draws a token multiset over the three pools TSPEC §8.2 names — "token multisets drawn
 * from the valid array, `all`, casing variants, and junk" — and renders it with arbitrary
 * comma/whitespace separators plus optional surrounding whitespace.
 *
 * @param {{int: function(number, number): number, pick: function(Array): *,
 *          shuffle: function(Array): Array}} rng
 * @returns {{ raw: string, tokens: string[] }}
 *   `raw` is what an operator would type; `tokens` is the multiset it encodes, in order.
 */
function genForcePhaseTokenString(rng) {
  const count = rng.int(0, 6);
  const tokens = [];
  for (let i = 0; i < count; i++) {
    const pool = rng.int(0, 9);
    if (pool <= 4) tokens.push(rng.pick([...VALID_TOKENS]));
    else if (pool <= 6) tokens.push(ALL_TOKEN);
    else tokens.push(rng.pick([...JUNK_TOKENS]));
  }

  let raw = rng.int(0, 3) === 0 ? rng.pick([" ", "  ", "\t"]) : "";
  tokens.forEach((token, index) => {
    if (index > 0) raw += rng.pick([...SEPARATORS]);
    raw += token;
  });
  if (rng.int(0, 3) === 0) raw += rng.pick([" ", ",", " ,", "\n"]);

  return { raw, tokens };
}

describe("parseForcePhases — catalogue closure (property)", () => {
  test("parseForcePhases catalogue-closure: accepted tokens are catalogue members, rejected tokens are exactly the non-members, and the two are exhaustive and disjoint", () => {
    const { parseForcePhases } = devModule;
    const seed = resolveSeed(FORCE_PHASES_SEED);
    const rng = seeded(seed);

    // The seven-token closed catalogue: six phases plus `all` (TSPEC §5.7).
    const catalogue = new Set([...VALID_TOKENS, ALL_TOKEN]);

    for (let caseIndex = 0; caseIndex < FORCE_PHASES_CASES; caseIndex++) {
      const { raw, tokens } = genForcePhaseTokenString(rng);
      const where = `seed=${seed} case=${caseIndex} raw=${JSON.stringify(raw)}`;
      let result;
      try {
        result = parseForcePhases(raw);
      } catch (err) {
        throw new Error(`${where}: parseForcePhases threw — ${err && err.message}`);
      }

      const outsiders = tokens.filter((t) => !catalogue.has(t));
      // Every failure below carries `where`, so a red is replayable with PDLC_PROP_SEED.
      expect({ where, ok: result && result.ok }).toEqual({
        where,
        ok: outsiders.length === 0,
      });

      if (outsiders.length > 0) {
        // Rejection branch: `{ ok: false, badTokens: string[] }` — no `phases` at all.
        expect(Array.isArray(result.badTokens)).toBe(true);
        expect(result.phases).toBeUndefined();

        // Exhaustive: no token outside the catalogue is silently dropped or coerced.
        for (const outsider of outsiders) {
          expect(result.badTokens).toContain(outsider);
        }
        // Disjoint: nothing inside the catalogue is ever reported bad.
        for (const bad of result.badTokens) {
          expect(catalogue.has(bad)).toBe(false);
          expect(tokens).toContain(bad);
        }
      } else {
        // Acceptance branch: `{ ok: true, phases: Set<string> }` — a Set, never an array
        // (PLAN §13.1: "No array exists anywhere").
        expect(result.ok).toBe(true);
        expect(result.phases).toBeInstanceOf(Set);
        expect(result.badTokens).toBeUndefined();

        // Closure: every returned phase is a member of the six-phase `valid` array —
        // `all` itself is never returned as a phase, it expands.
        for (const phase of result.phases) {
          expect(VALID_TOKENS).toContain(phase);
        }
        // Nothing the operator asked for is dropped.
        const expected = tokens.includes(ALL_TOKEN)
          ? new Set(VALID_TOKENS)
          : new Set(tokens);
        expect([...result.phases].sort()).toEqual([...expected].sort());
      }
    }
  });
});

// ─── L2 harness — driving `main()` (RLH-AT-28, RLH-AT-01a) ───────────────────────────

// TODO(RLH-02): `fakeFs` and `recordingRecordHalt` belong to `__tests__/helpers/seams.js`,
// which RLH-02 owns and is writing in this same batch (only `fakeListFiles` had landed
// when this file was authored). The two local doubles below are the minimum this file
// needs; replace them with the canonical factories once seams.js publishes them. This
// file must not define an ad-hoc `_listFiles`, so that one *is* imported from seams.js.

const FEATURE = "force-feat";
const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;
const FSPEC_PATH = `docs/${FEATURE}/FSPEC-${FEATURE}.md`;
const DOCS_DIR = `docs/${FEATURE}`;

/** Body bytes of the documents the approval records are taken against. */
const REQ_TEXT = "# REQ\n\nA requirement.\n";
const FSPEC_TEXT = "# FSPEC\n\nA functional spec.\n";

/**
 * `approvalHashOf` (TSPEC §3.7) is RLH-05 (d)'s to write and does not exist at batch 2.
 * Building the fixture with the module's own digest is deliberate — it is what makes the
 * recorded hash genuinely `FRESH` at batch 8 — but the fixture must not be the thing that
 * reds now, or `RLH-AT-28` would fail in its setup rather than on its own oracle. Until
 * the digest lands, a syntactically well-formed placeholder stands in.
 *
 * @param {string} text
 * @returns {string} `sha256:{64 lowercase hex}`
 */
function approvalHashOfSafe(text) {
  return typeof devModule.approvalHashOf === "function"
    ? devModule.approvalHashOf(text)
    : `sha256:${"0".repeat(64)}`;
}

/**
 * An approving cross-review whose recorded hash is the digest of `docText` — i.e. an
 * approval that §5.5 judges `FRESH`, so the unforced path would *skip* the phase. That is
 * the precondition `RLH-AT-28` needs: force must override exactly this.
 *
 * @param {string} docText
 * @returns {string}
 */
function approvingCrossReview(docText) {
  return [
    "# Cross-review",
    "",
    "## Verdict",
    "",
    "VERDICT: Approved",
    `APPROVAL-HASH: ${approvalHashOfSafe(docText)}`,
    "",
  ].join("\n");
}

/**
 * Cross-review basenames for one (docType, round), for the `se-review` + `te-review` pair
 * both Phase R and Phase F use (`PHASE_DISPATCH`), under the §5.2 filename grammar
 * `CROSS-REVIEW-{role}-{docType}-v{N}.md`.
 *
 * @param {string} docType
 * @param {number} round
 * @returns {string[]}
 */
function crossReviewBasenames(docType, round) {
  return [
    `CROSS-REVIEW-software-engineer-${docType}-v${round}.md`,
    `CROSS-REVIEW-test-engineer-${docType}-v${round}.md`,
  ];
}

/**
 * Minimal recording file-system double: `_readFile` / `_writeFile` / `_appendFile` /
 * `_checkFile`. Synchronous, per TSPEC §8.1 (production awaits; a sync return resolves).
 *
 * @param {Record<string, string>} [initial] - path -> contents.
 */
function localFakeFs(initial = {}) {
  const contents = { ...initial };
  const writes = [];
  return {
    contents,
    writes,
    readFile: (path) => (Object.prototype.hasOwnProperty.call(contents, path) ? contents[path] : null),
    writeFile: (path, text) => {
      writes.push({ path, mode: "write", text });
      contents[path] = text;
      return { ok: true };
    },
    appendFile: (path, text) => {
      writes.push({ path, mode: "append", text });
      contents[path] = (contents[path] ?? "") + text;
      return { ok: true };
    },
    checkFile: (path) =>
      contents[path] && contents[path].trim() !== ""
        ? { ok: true }
        : { ok: false, reason: "file_missing" },
  };
}

/** The reviewer skills both Phase R and Phase F dispatch (`PHASE_DISPATCH`). */
const REVIEWER_SKILLS = new Set(["se-review", "te-review", "pm-review"]);

/**
 * A `main()` invocation harness: an always-approving agent double plus every seam the
 * force path needs, with the agent dispatches recorded.
 *
 * @param {{ listing?: string[], files?: Record<string, string> }} [opts]
 * @returns {{ args: object, dispatches: Array<{skill: string, prompt: string}>,
 *            fs: object, listFiles: function }}
 */
function makeHarness({ listing = [], files = {} } = {}) {
  const dispatches = [];
  const fs = localFakeFs({ [REQ_PATH]: REQ_TEXT, [FSPEC_PATH]: FSPEC_TEXT, ...files });
  const listFiles = fakeListFiles(listing);

  const agent = async (skill, prompt) => {
    dispatches.push({ skill, prompt: typeof prompt === "string" ? prompt : "" });
    if (REVIEWER_SKILLS.has(skill)) {
      return 'Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }
    if (["pm-author", "se-author", "te-author"].includes(skill)) {
      if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
        return "Finalized.\nDECISIONS_WARRANTED: false";
      }
      if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
        });
      }
      return "Document created.";
    }
    if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
    if (skill === "harvest-learnings") return "Harvest complete.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    return "Success.";
  };

  return {
    dispatches,
    fs,
    listFiles,
    args: {
      reqPath: REQ_PATH,
      _agent: agent,
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _phase: () => {},
      _log: () => {},
      _pipeline: async (label, fn) => fn(),
      _listFiles: listFiles,
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _appendFile: fs.appendFile,
      _recordHalt: async () => ({ queueRow: "none" }),
      _mergeWorktree: async () => ({ ok: true }),
      _rebaseOntoDefault: async () => "clean",
      _dodVerifyLoop: async () => ({ passed: true, iterations: 1 }),
      _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
    },
  };
}

/**
 * Reviewer dispatches for one phase, in order.
 *
 * @param {Array<{skill: string, prompt: string}>} dispatches
 * @param {string} phaseId
 * @returns {Array<{skill: string, prompt: string}>}
 */
function reviewerDispatchesFor(dispatches, phaseId) {
  return dispatches.filter(
    (d) => REVIEWER_SKILLS.has(d.skill) && d.prompt.includes(`for phase ${phaseId} `)
  );
}

// ─── RLH-AT-01a — a force does NOT skip step 2 (TSPEC §5.7, §2.5; PLAN §7.1) ──────────

describe("RLH-AT-01a — the forced path keeps its round derivation", () => {
  test("RLH-AT-01a: a forced phase on a branch already carrying -v1 cross-reviews writes -v2 next", async () => {
    // Branch state: Phase R has been reviewed once. Both reviewer roles' v1 files are on
    // disk, so §5.2's window derivation gives startIndex = max(1) + 1 = 2.
    const listing = crossReviewBasenames("REQ", 1);
    const files = Object.fromEntries(
      listing.map((b) => [`${DOCS_DIR}/${b}`, approvingCrossReview(REQ_TEXT)])
    );
    const harness = makeHarness({ listing, files });

    await main({ ...harness.args, forcePhases: "R" });

    // The oracle. TSPEC §5.7: a force skips §2.5 steps **3 and 4** only — "Step 2 is not
    // skipped". An implementation that reads the force as "skip steps 2–4" enters
    // `reviewLoop` on the shipped `iteration = 1` default and re-creates defect H-1 on
    // exactly the path an operator reaches for *because* the phase was reviewed before.
    const rReviews = reviewerDispatchesFor(harness.dispatches, "R");
    expect(rReviews.length).toBeGreaterThan(0);
    for (const dispatch of rReviews) {
      expect(dispatch.prompt).toContain("This is iteration 2.");
      expect(dispatch.prompt).toContain("as v2");
      expect(dispatch.prompt).not.toContain("This is iteration 1.");
    }

    // The listing seam was actually consulted for the phase's directory — step 2 ran, it
    // was not merely that the default happened to agree.
    expect(harness.listFiles.dirs).toContain(DOCS_DIR);
  });
});

// ─── RLH-AT-28 — force overrides a recorded approval, and only that ───────────────────

describe("RLH-AT-28 — force overrides approval only", () => {
  test("RLH-AT-28: a forced phase past an approving fresh round runs the next round and leaves the approval record intact, but an unresolved POSTMORTEM still refuses it", async () => {
    // Branch state: Phase F converged at round 2, both roles' v2 cross-reviews approving
    // and their recorded hash still matching the FSPEC bytes (§5.5 `FRESH`). Unforced,
    // §2.5 step 4 would skip Phase F outright.
    const listing = [
      ...crossReviewBasenames("FSPEC", 1),
      ...crossReviewBasenames("FSPEC", 2),
    ];
    const roundTwoPaths = crossReviewBasenames("FSPEC", 2).map((b) => `${DOCS_DIR}/${b}`);
    const files = Object.fromEntries(
      listing.map((b) => [`${DOCS_DIR}/${b}`, approvingCrossReview(FSPEC_TEXT)])
    );
    const harness = makeHarness({ listing, files });
    const approvalRecordBefore = roundTwoPaths.map((p) => harness.fs.contents[p]);

    const result = await main({ ...harness.args, forcePhases: "F" });

    // (i) The phase RUNS despite the approval — and at the NEXT round index, 3, because
    // step 2 still derived the window (§5.7, AC-4.6).
    const fReviews = reviewerDispatchesFor(harness.dispatches, "F");
    expect(fReviews.length).toBeGreaterThan(0);
    for (const dispatch of fReviews) {
      expect(dispatch.prompt).toContain("This is iteration 3.");
      expect(dispatch.prompt).toContain("as v3");
    }

    // (ii) It is reported as forced. The notice is one of §4.7's four report *lines*; its
    // wording is not pinned to a literal anywhere in the TSPEC, so this asserts that the
    // run's own record says the phase was forced, not a particular sentence.
    const fPhase = result.phases.find((p) => p.phase === "F");
    expect(fPhase).toBeTruthy();
    expect(`${fPhase.detail ?? ""} ${result.haltReason ?? ""}`).toMatch(/forc/i);

    // (iii) The prior approval record is left intact (FSPEC E-36): nothing was written to
    // or appended onto the round-2 cross-review files.
    for (const path of roundTwoPaths) {
      expect(harness.fs.writes.filter((w) => w.path === path)).toEqual([]);
    }
    expect(roundTwoPaths.map((p) => harness.fs.contents[p])).toEqual(approvalRecordBefore);

    // (iv) AC-4.6a / FSPEC E-35 / §6.2 row 13 — forcing overrides a recorded APPROVAL and
    // never a recorded FAILURE. The same forced phase, with an unresolved POSTMORTEM
    // beside it, is refused: a forced run reaches step G exactly like any other (G-INV).
    const postmortemPath = `${DOCS_DIR}/POSTMORTEM-F-${FEATURE}.md`;
    const refusedHarness = makeHarness({
      listing,
      files: {
        ...files,
        [postmortemPath]: "# Postmortem\n\nRESOLVED: no\n\n## Recommendation\n\nRedo the FSPEC.\n",
      },
    });
    const refused = await main({ ...refusedHarness.args, forcePhases: "F" });

    expect(refused.outcome).toBe("halted");
    expect(refused.postmortemStatus).toBe("unresolved");
    expect(refused.postmortemPath).toBe(postmortemPath);
    expect(refused.haltReason).toContain("Redo the FSPEC.");
    expect(reviewerDispatchesFor(refusedHarness.dispatches, "F")).toEqual([]);
  });
});
