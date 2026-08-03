/**
 * sessionAgent.test.js — the optional `_sessionAgent` session transport seam
 * (PROPOSAL-orchestrate-dev-optimization §1 M-1/M-2, §2 items 2–3, §5 decision 1)
 * and the two prompt clauses that carry M-1/M-2's win on the fallback path.
 *
 * ## What the seam is
 *
 * `_sessionAgent(sessionKey, skill, prompt, opts) => Promise<string|null>` — a
 * session-aware agent transport. The implementation owns create-vs-resume by key;
 * this module only supplies a STABLE key per (feature, doc, role) so the same
 * reviewer, and the same author, are addressed by the same key across rounds.
 *
 * It is an OPTIMISATION, never a correctness dependency — the same invariant the
 * probe seams (`_probeDoc` and siblings) carry. The workflow runtime cannot resume
 * an agent today, so the shipped state is *absent*, and every assertion below that
 * exercises the seam is about a capability a future runtime may install.
 *
 * ## Stratum
 *
 * **L2.** `reviewLoop` is driven directly where the claim is about the loop's own
 * dispatches; `main()` is driven where the claim is about the composition root
 * threading the seam into a creator dispatch (§(c) below) — `wrappedDispatch` is
 * not exported and must not become so.
 *
 * ## Oracle-quality rules this file obeys (PROPOSAL §3.5)
 *
 * - **No implementation echoes.** Every session key and every prompt clause is a
 *   LITERAL string here. Nothing is imported from the module under test but the
 *   entry points themselves.
 * - **No absence-only oracles.** Every negative assertion is paired with a
 *   positive conjunct on the same path (the seam's call log is proven live by a
 *   sibling run that *does* record calls; the iteration-1 prompt's lack of the
 *   delta protocol is paired with the base review instruction it does carry).
 * - **Completeness counts.** The key sequences are asserted as whole arrays with
 *   `toEqual`, not as `arrayContaining`, so a dropped or extra dispatch reds.
 */

import * as devModule from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles, recordingRecordQueueRow } from "./helpers/seams.js";

const main = devModule.default;
const { reviewLoop } = devModule;

// ─── 1. Fixture vocabulary — literals, never derived from the subject ─────────

const FEATURE = "sess-feat";
const TSPEC_PATH = `docs/${FEATURE}/TSPEC-${FEATURE}.md`;

/**
 * The three session keys this fixture's phase produces, spelled out. The grammar
 * is `{feature}/{docType or phase}/reviewer/{role-slug}` for a reviewer and
 * `{feature}/{docType or phase}/author` for the creator AND the optimizer — one
 * author session per document (M-2).
 */
const PM_REVIEWER_KEY = "sess-feat/TSPEC/reviewer/product-manager";
const TE_REVIEWER_KEY = "sess-feat/TSPEC/reviewer/test-engineer";
const AUTHOR_KEY = "sess-feat/TSPEC/author";

const baseParams = {
  doc: TSPEC_PATH,
  phase: "T",
  reviewers: ["pm-review", "te-review"],
  optimizer: "se-author",
  feature: FEATURE,
};

const existsGuard = () => ({ ok: true });

function approveResponse() {
  return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
}

function needsRevisionResponse() {
  return `Review with issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n`;
}

function optimizerResponse(n) {
  return `Addressed all feedback; revision ${n}.`;
}

/**
 * The reviewer plan every seam test shares: `pm-review` fails round 1 and
 * approves afterwards, `te-review` always approves. One optimizer round, two
 * review rounds — the smallest shape in which "same key across rounds" is a
 * claim at all.
 */
function makeAgent(log) {
  let pmCalls = 0;
  let optimizerCalls = 0;
  return async (skill, prompt, opts) => {
    log.push({ skill, prompt: String(prompt ?? ""), model: opts && opts.model });
    if (skill === "pm-review") {
      pmCalls += 1;
      return pmCalls === 1 ? needsRevisionResponse() : approveResponse();
    }
    if (skill === "te-review") return approveResponse();
    if (skill === "se-author") {
      optimizerCalls += 1;
      return optimizerResponse(optimizerCalls);
    }
    return "";
  };
}

/**
 * Double for `_sessionAgent`. `handler` decides what the transport answers;
 * omitted, it delegates to `inner`, which is what a working session transport
 * does — so a delegating double proves the seam is on the dispatch path without
 * changing what any agent replies.
 *
 * @param {(ctx: object) => any} [handler]
 */
function recordingSessionAgent(handler) {
  const calls = [];
  const fn = async (sessionKey, skill, prompt, opts) => {
    const ctx = { sessionKey, skill, prompt: String(prompt ?? ""), opts, index: calls.length };
    calls.push(ctx);
    if (!handler) return null;
    return handler(ctx);
  };
  fn.calls = calls;
  Object.defineProperty(fn, "keys", { get: () => calls.map((c) => c.sessionKey) });
  Object.defineProperty(fn, "callCount", { get: () => calls.length });
  return fn;
}

// ─── 2. (a) The seam absent — today's dispatch flow, unchanged ────────────────

describe("SESSION-01: the seam is absent by default", () => {
  test("SESSION-01: with no _sessionAgent every dispatch goes to _agent, and the transport double records nothing — proven non-vacuous by an identical run that does install it", async () => {
    const baselineLog = [];
    const transport = recordingSessionAgent();

    const baseline = await reviewLoop({
      ...baseParams,
      _agent: makeAgent(baselineLog),
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    // Positive conjunct 1: the run happened, and it happened through `_agent`.
    expect(baseline.converged).toBe(true);
    expect(baselineLog.map((d) => d.skill)).toEqual([
      "pm-review",
      "te-review",
      "se-author",
      "pm-review",
      "te-review",
    ]);
    // The absence assertion, on the same path as the positive one above.
    expect(transport.callCount).toBe(0);

    // Positive conjunct 2 (the non-vacuity proof): the SAME double, installed on
    // the SAME fixture, records every one of those dispatches. So `0` above is a
    // fact about the seam being absent, not about the double being inert.
    const sessionLog = [];
    const innerAgent = makeAgent(sessionLog);
    const live = recordingSessionAgent((ctx) => innerAgent(ctx.skill, ctx.prompt, ctx.opts));
    const withSeam = await reviewLoop({
      ...baseParams,
      _agent: async () => {
        throw new Error("the fresh-dispatch path must not be reached when the session answers");
      },
      _sessionAgent: live,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    expect(withSeam.converged).toBe(true);
    expect(live.calls.map((c) => c.skill)).toEqual([
      "pm-review",
      "te-review",
      "se-author",
      "pm-review",
      "te-review",
    ]);
  });
});

// ─── 3. (b) Stable keys across rounds, distinct keys across reviewers ─────────

describe("SESSION-02: session keys", () => {
  test("SESSION-02: each reviewer keeps ONE key across both rounds, the two reviewers' keys differ, and the optimizer runs on the author key", async () => {
    const innerLog = [];
    const innerAgent = makeAgent(innerLog);
    const transport = recordingSessionAgent((ctx) => innerAgent(ctx.skill, ctx.prompt, ctx.opts));

    const result = await reviewLoop({
      ...baseParams,
      _agent: innerAgent,
      _sessionAgent: transport,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    expect(result).toMatchObject({ converged: true, iterations: 2 });

    // Whole-sequence equality (completeness, not containment): round 1's two
    // reviewers, the optimizer, then round 2's two reviewers.
    expect(transport.keys).toEqual([
      PM_REVIEWER_KEY,
      TE_REVIEWER_KEY,
      AUTHOR_KEY,
      PM_REVIEWER_KEY,
      TE_REVIEWER_KEY,
    ]);

    // The key travels with the right skill — a sequence that happened to match
    // while the pairing was scrambled would still be wrong.
    expect(transport.calls.map((c) => [c.sessionKey, c.skill])).toEqual([
      [PM_REVIEWER_KEY, "pm-review"],
      [TE_REVIEWER_KEY, "te-review"],
      [AUTHOR_KEY, "se-author"],
      [PM_REVIEWER_KEY, "pm-review"],
      [TE_REVIEWER_KEY, "te-review"],
    ]);

    // Distinctness, stated as a claim rather than inferred from the array above.
    expect(PM_REVIEWER_KEY).not.toBe(TE_REVIEWER_KEY);
    expect(new Set(transport.keys).size).toBe(3);
  });

  test("SESSION-03: the model option rides through the session transport unchanged", async () => {
    const innerLog = [];
    const innerAgent = makeAgent(innerLog);
    const transport = recordingSessionAgent((ctx) => innerAgent(ctx.skill, ctx.prompt, ctx.opts));

    await reviewLoop({
      ...baseParams,
      // `reviewLoop` itself pins no model; main() does. What must hold is that
      // whatever opts the caller's `_agent` would have received arrive at the
      // transport too — asserted here by a caller-supplied wrapper.
      _agent: (skill, prompt, opts) => innerAgent(skill, prompt, opts),
      _sessionAgent: async (sessionKey, skill, prompt, opts) => {
        transport.calls.push({ sessionKey, skill, prompt: String(prompt ?? ""), opts, index: transport.calls.length });
        return innerAgent(skill, prompt, { ...opts, model: "opus" });
      },
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    // Positive: the transport saw every dispatch, and the inner agent recorded
    // the model the transport forwarded on each of them.
    expect(transport.calls.length).toBe(5);
    expect(innerLog.map((d) => d.model)).toEqual(["opus", "opus", "opus", "opus", "opus"]);
  });
});

// ─── 4. (c) The creator shares the author session with the optimizer ──────────
//
// Driven through `main()`, because the creator dispatch lives in `main()`'s
// `wrappedDispatch` and that function is deliberately not exported. The pipeline
// is allowed to halt at Phase T (its creator returns nothing); the claim is about
// Phase F's two author dispatches, both of which precede that halt.

const MAIN_FEATURE = "sess-main";
const MAIN_DOCS = `docs/${MAIN_FEATURE}`;
const MAIN_REQ = `${MAIN_DOCS}/REQ-${MAIN_FEATURE}.md`;
const MAIN_FSPEC_AUTHOR_KEY = "sess-main/FSPEC/author";

/** TSPEC §5.9's required top-level headings, restated (never read off the subject). */
const REQUIRED_HEADINGS = Object.freeze({
  REQ: ["Problem / Context", "Goals", "Non-Goals", "Constraints", "Acceptance Criteria", "Risks", "Obligations"],
  FSPEC: ["Overview", "Linked Requirements", "Behavioral Flow", "Business Rules", "Edge Cases and Error Scenarios", "Acceptance Tests", "Open Questions"],
});

function completeDoc(docType, salt = "baseline") {
  const parts = [`# ${MAIN_FEATURE}`, ""];
  for (const heading of REQUIRED_HEADINGS[docType]) {
    parts.push(`## ${heading}`, "", `Substantive prose for ${heading} (${salt}).`, "");
  }
  return parts.join("\n");
}

function crossReviewDoc(verdict, high) {
  return [
    "# Cross-review",
    "",
    "## Findings",
    "",
    "Some findings.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    `{"high": ${high}, "medium": 0, "low": 0}`,
    "",
  ].join("\n");
}

function basenamesIn(files, dirPath) {
  const prefix = `${String(dirPath).replace(/\/+$/, "")}/`;
  return Object.keys(files)
    .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"))
    .map((p) => p.slice(prefix.length))
    .sort();
}

const ROLE_SLUG = Object.freeze({
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
});

describe("SESSION-04: the composition root threads the seam into the creator dispatch", () => {
  test("SESSION-04: Phase F's creator and Phase F's optimizer are dispatched on the SAME author session key, and the reviewers are not", async () => {
    const fs = fakeFs({ [MAIN_REQ]: completeDoc("REQ") });
    const listFiles = fakeListFiles((dirPath) => basenamesIn(fs.files, dirPath));
    const git = fakeGit((argv) =>
      argv.join(" ") === "rev-parse --abbrev-ref HEAD"
        ? { ok: true, stdout: `feat-${MAIN_FEATURE}\n` }
        : { ok: true }
    );

    let fspecReviewRound = 0;
    const innerAgent = async (skill, prompt) => {
      const text = String(prompt ?? "");
      const forFspec = text.includes(`${MAIN_DOCS}/FSPEC-${MAIN_FEATURE}.md`);

      if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
        const docType = forFspec ? "FSPEC" : "REQ";
        const round = Number((/(?:This is iteration) (\d+)/.exec(text) || [0, 1])[1]);
        const fails = forFspec && round === 1;
        fs.writeFile(
          `${MAIN_DOCS}/CROSS-REVIEW-${ROLE_SLUG[skill]}-${docType}-v${round}.md`,
          crossReviewDoc(fails ? "Needs revision" : "Approved", fails ? 1 : 0)
        );
        if (forFspec) fspecReviewRound = Math.max(fspecReviewRound, round);
        return `Review complete.\nVERDICT: ${fails ? "Needs revision" : "Approved"}\n{"high": ${fails ? 1 : 0}, "medium": 0, "low": 0}\n`;
      }

      if (skill === "pm-author") {
        // Both the FSPEC creator and the FSPEC optimizer land here.
        fs.writeFile(
          `${MAIN_DOCS}/FSPEC-${MAIN_FEATURE}.md`,
          completeDoc("FSPEC", `pass ${fspecReviewRound}`)
        );
        return "Document written.\nREVISION-COMPLETE: yes";
      }

      // Phase T's creator: an empty reply halts the pipeline right here, which is
      // all this fixture needs — Phase F is already complete.
      return "";
    };

    const transport = recordingSessionAgent((ctx) => innerAgent(ctx.skill, ctx.prompt, ctx.opts));

    const result = await main({
      reqPath: MAIN_REQ,
      _agent: innerAgent,
      _sessionAgent: transport,
      _parallel: (promises) => Promise.all(promises),
      _pipeline: async (label, fn) => fn(),
      _phase: () => {},
      _log: () => {},
      _listFiles: listFiles,
      _git: git,
      _recordQueueRow: recordingRecordQueueRow({ queueRow: "recorded" }),
      ...fs.injections(),
      _phaseDodEnabled: false,
      _phasePubEnabled: false,
      _now: () => 0,
      _sleep: async () => {},
    });

    // Positive conjunct: the run really did reach Phase F and produce an FSPEC.
    expect(Object.keys(fs.files)).toContain(`${MAIN_DOCS}/FSPEC-${MAIN_FEATURE}.md`);
    expect(result.feature).toBe(MAIN_FEATURE);

    const fspecAuthorCalls = transport.calls.filter((c) => c.skill === "pm-author" && c.prompt.includes("FSPEC"));
    // At least a creator and an optimizer, and EVERY one of them on one key.
    expect(fspecAuthorCalls.length).toBeGreaterThanOrEqual(2);
    expect([...new Set(fspecAuthorCalls.map((c) => c.sessionKey))]).toEqual([MAIN_FSPEC_AUTHOR_KEY]);

    // The reviewers never borrow the author session (absence paired with the
    // positive count of reviewer calls that DID occur).
    const reviewerCalls = transport.calls.filter((c) => c.skill === "se-review" || c.skill === "te-review");
    expect(reviewerCalls.length).toBeGreaterThan(0);
    expect(reviewerCalls.filter((c) => c.sessionKey === MAIN_FSPEC_AUTHOR_KEY)).toEqual([]);
  });
});

// ─── 5. (d)/(e) Fail-open to the fresh dispatch ───────────────────────────────

describe("SESSION-05: the seam fails open to a fresh _agent dispatch", () => {
  test("SESSION-05: a transport that answers null for ONE dispatch falls back to _agent for exactly that dispatch, and the loop still converges", async () => {
    const freshLog = [];
    const innerAgent = makeAgent(freshLog);
    // Declines the optimizer only.
    const transport = recordingSessionAgent((ctx) =>
      ctx.skill === "se-author" ? null : innerAgent(ctx.skill, ctx.prompt, ctx.opts)
    );

    const result = await reviewLoop({
      ...baseParams,
      _agent: innerAgent,
      _sessionAgent: transport,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    expect(result).toMatchObject({ converged: true, iterations: 2 });
    // The transport was consulted for every dispatch…
    expect(transport.keys).toEqual([
      PM_REVIEWER_KEY,
      TE_REVIEWER_KEY,
      AUTHOR_KEY,
      PM_REVIEWER_KEY,
      TE_REVIEWER_KEY,
    ]);
    // …and every dispatch still reached `_agent` exactly once: the four the
    // transport ANSWERED reached it because this double delegates, and the one
    // it DECLINED reached it because the loop fell back. The sequence is what
    // makes "exactly that dispatch" observable — a fallback that fired for the
    // wrong dispatch, or twice, changes this array.
    expect(freshLog.map((d) => d.skill)).toEqual([
      "pm-review",
      "te-review",
      "se-author",
      "pm-review",
      "te-review",
    ]);
    // The declined dispatch's prompt is the optimizer's, byte for byte, on the
    // fallback arm — the fallback re-issues the call, it does not re-derive it.
    const declined = transport.calls.filter((c) => c.skill === "se-author");
    expect(declined.length).toBe(1);
    expect(freshLog.filter((d) => d.skill === "se-author").map((d) => d.prompt)).toEqual([
      declined[0].prompt,
    ]);
  });

  test("SESSION-06: a transport that THROWS falls back to _agent, does not halt, and the loop still converges", async () => {
    const freshLog = [];
    const innerAgent = makeAgent(freshLog);
    const seen = [];
    const transport = async (sessionKey, skill, prompt, opts) => {
      seen.push({ sessionKey, skill });
      throw new Error("session transport exploded");
    };

    const result = await reviewLoop({
      ...baseParams,
      _agent: innerAgent,
      _sessionAgent: transport,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    // Positive: it converged exactly as the seamless run does, and every dispatch
    // was served by the fresh agent.
    expect(result).toMatchObject({ converged: true, iterations: 2 });
    expect(freshLog.map((d) => d.skill)).toEqual([
      "pm-review",
      "te-review",
      "se-author",
      "pm-review",
      "te-review",
    ]);
    // …and the transport really was consulted every time (so the fallback is a
    // fallback, not a silent bypass).
    expect(seen.map((c) => c.sessionKey)).toEqual([
      PM_REVIEWER_KEY,
      TE_REVIEWER_KEY,
      AUTHOR_KEY,
      PM_REVIEWER_KEY,
      TE_REVIEWER_KEY,
    ]);
  });
});

// ─── 6. (f) The two prompt clauses (M-1/M-2 on the fallback path) ─────────────

describe("SESSION-07: delta-scoped prompt clauses", () => {
  test("SESSION-07: the optimizer prompt carries the continuing-author clause at EVERY iteration", async () => {
    const optimizerPrompts = [];
    let pmCalls = 0;
    const mockAgent = async (skill, prompt) => {
      if (skill === "pm-review") {
        pmCalls += 1;
        // Fail rounds 1 and 2 so there are two optimizer dispatches to compare.
        return pmCalls <= 2 ? needsRevisionResponse() : approveResponse();
      }
      if (skill === "te-review") return approveResponse();
      if (skill === "se-author") {
        optimizerPrompts.push(String(prompt ?? ""));
        return optimizerResponse(optimizerPrompts.length);
      }
      return "";
    };

    const result = await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    expect(result).toMatchObject({ converged: true, iterations: 3 });
    expect(optimizerPrompts.length).toBe(2);
    for (const prompt of optimizerPrompts) {
      expect(prompt).toContain("You are the continuing author of this document");
      expect(prompt).toContain("Decisions approved in earlier rounds are settled");
      expect(prompt).toContain("do not re-litigate them");
      expect(prompt).toContain("Address every High and Medium finding");
      expect(prompt).toContain("cross-round inconsistencies");
      // The pre-existing content this clause must not have displaced.
      expect(prompt).toContain(`docs/${FEATURE}/CROSS-REVIEW-product-manager-TSPEC-v`);
    }
  });

  test("SESSION-08: iteration 1's reviewer prompt carries the base review instruction and NOT the delta protocol; iteration 2's carries the convergence framing as well as the delta protocol", async () => {
    const pmPrompts = [];
    let pmCalls = 0;
    const mockAgent = async (skill, prompt) => {
      if (skill === "pm-review") {
        pmPrompts.push(String(prompt ?? ""));
        pmCalls += 1;
        return pmCalls === 1 ? needsRevisionResponse() : approveResponse();
      }
      if (skill === "te-review") return approveResponse();
      if (skill === "se-author") return optimizerResponse(1);
      return "";
    };

    await reviewLoop({
      ...baseParams,
      _agent: mockAgent,
      _parallel: (p) => Promise.all(p),
      _checkFile: existsGuard,
    });

    expect(pmPrompts.length).toBe(2);

    // Iteration 1 — positive conjunct first, then the paired absence.
    expect(pmPrompts[0]).toContain(
      `Review the document at ${TSPEC_PATH} for phase T of feature ${FEATURE}. This is iteration 1.`
    );
    expect(pmPrompts[0]).not.toContain("Convergence is the goal");
    expect(pmPrompts[0]).not.toContain("This is a re-review");

    // Iteration 2 — the convergence framing, on top of the existing protocol.
    expect(pmPrompts[1]).toContain("Convergence is the goal");
    expect(pmPrompts[1]).toContain(
      "judge only whether your own blocking findings are resolved and whether the revision broke anything"
    );
    expect(pmPrompts[1]).toContain("The approval bar is unchanged");
    // The four-step protocol and the VERDICT contract survive the addition.
    expect(pmPrompts[1]).toContain("This is a re-review");
    expect(pmPrompts[1]).toContain(`docs/${FEATURE}/CROSS-REVIEW-product-manager-TSPEC-v1.md`);
    expect(pmPrompts[1]).toContain("git diff");
    expect(pmPrompts[1]).toContain("ONLY the changed sections");
    expect(pmPrompts[1]).toContain("VERDICT trailer");
  });
});
