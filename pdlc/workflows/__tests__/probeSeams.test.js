/**
 * probeSeams.test.js — the three OPTIONAL probe seams: `_probeDoc`,
 * `_probeReviewState`, `_probePostmortem`.
 *
 * ## Why they exist
 *
 * Every content read in `orchestrate-dev.js` crosses `_readFile`, which in the
 * workflow runtime is a probe agent plus roughly one transcription agent per 6 KB.
 * But the module almost never wants the content: it wants a **judgment** about it
 * — a digest, a structural-completeness score, the branch's round record, a
 * POSTMORTEM's resolved marker. A probe seam answers that judgment at the far side
 * of the transport, so the bytes never enter this module. It is the same trade
 * `_hashFile` already makes for §5.3's anchor, generalised to the other judgments.
 *
 * ## The property this file exists to pin
 *
 * **A probe is an optimisation, never a correctness dependency.** Absent, `null`,
 * or throwing, every site falls back to the byte-taking path it replaced and that
 * path runs unchanged. Two shapes of assertion carry it:
 *
 *   1. *the probe is really used* — the legacy seam is asserted **not** to have
 *      been called for that read. Without this half a "probe test" passes on an
 *      implementation that consults the probe and then reads the file anyway,
 *      which is the whole cost the seam exists to avoid;
 *   2. *the fallback is really unchanged* — the same fixture, run with a `null`
 *      probe and with a throwing probe, produces the same report as one run with
 *      no probe parameter at all.
 *
 * The one deliberate exception is `_probeReviewState`'s explicit
 * `{ok: false, message}`: that is not a failed probe but a successful judgment
 * that the review state cannot be derived, and it maps onto exactly the halt
 * `refreshReviewState`'s own `ok: false` produces (§5.6.1, §6.2 rows 2 and 17).
 *
 * ## Stratum and drivers
 *
 * L2 throughout. `dispatchAndVerify` is not exported (§3.8), so the wrapper's
 * probe path is driven through `reviewLoop` (whose episodes it wraps) and through
 * `main()` (the composition root), mirroring `pacingWrapper.test.js` and
 * `hashFileSeam.test.js`. Seam doubles come from `__tests__/helpers/seams.js`; the
 * probe doubles are file-local, because the probe seams are this file's subject.
 *
 * The faithful probe double below is built out of the module's OWN exported
 * oracles (`approvalHashOf`, `isComplete`, `firstUnwrittenSection`,
 * `approvalAnchorPreCount`, `artifactClassOf`). That is deliberate and is what
 * makes the equivalence tests meaningful: the probe contract is defined as "what
 * you would get by reading the file and applying these", so a double that computed
 * them some other way would be testing a different contract.
 */

import main, {
  approvalAnchorPreCount,
  approvalHashOf,
  artifactClassOf,
  firstUnwrittenSection,
  isComplete,
  reviewLoop,
} from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";

// `reviewLoop`'s per-iteration progress lines go through the module-level `log`,
// which is not an injection point on every driver below. Silenced so a failure
// report is the assertion rather than the pipeline's chatter.
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = () => {};
});
afterEach(() => {
  console.log = originalConsoleLog;
});

// ─── the probe doubles ────────────────────────────────────────────────────────

/**
 * A `_probeDoc` that answers exactly what reading `files[path]` and applying the
 * module's own oracles to it would answer — the probe contract, stated as code.
 *
 * `files` is held by reference, not copied: a probe must observe the tree as it is
 * at the moment it is asked, or `dispatchAndVerify`'s before/after pair would be
 * two views of the same stale snapshot and every dispatch would score no progress.
 *
 * @param {Record<string, string>} files - the live fake tree
 * @param {(record: object, path: string) => object} [overlay] - per-path edit
 */
function faithfulProbeDoc(files, overlay) {
  const probe = (path, docType) => {
    const exists = Object.prototype.hasOwnProperty.call(files, path);
    const text = exists ? files[path] : null;
    const artifactClass = artifactClassOf(path);
    const measured = isComplete(artifactClass, docType, text);
    let record = {
      ok: true,
      exists,
      empty: String(text ?? "").trim() === "",
      hash: exists ? approvalHashOf(text) : null,
      artifactClass,
      complete: measured.complete,
      missing: measured.missing,
      T: measured.T,
      S: measured.S,
      firstUnwritten: firstUnwrittenSection(artifactClass, docType, text),
      anchors: approvalAnchorPreCount(text ?? ""),
    };
    if (overlay) record = overlay(record, path);
    probe.calls.push({ path, docType, record });
    return record;
  };
  probe.calls = [];
  Object.defineProperty(probe, "paths", { get: () => probe.calls.map((c) => c.path) });
  return probe;
}

/** A probe that records its calls and answers whatever `reply` says, per call. */
function scriptedProbe(reply) {
  const probe = (...args) => {
    probe.calls.push(args);
    const value = typeof reply === "function" ? reply(...args, probe.calls.length - 1) : reply;
    if (value instanceof Error) throw value;
    return value;
  };
  probe.calls = [];
  return probe;
}

// ─── 1. `_probeDoc` inside a review episode (dispatchAndVerify + §5.3) ────────

const FEATURE = "probe-feat";
const DOCS_DIR = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS_DIR}/REQ-${FEATURE}.md`;
const REVIEWERS = ["se-review", "te-review"];
const SE_SLUG = "software-engineer";
const TE_SLUG = "test-engineer";
const APPROVE = 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
const REJECT = 'Reviewed.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';

/** The cross-review path round `n` of this fixture writes, per role. */
const reviewPath = (slug, n) => `${DOCS_DIR}/CROSS-REVIEW-${slug}-REQ-v${n}.md`;

/** A structurally complete cross-review (§5.9's `cross-review` class). */
const CROSS_REVIEW_BODY = "# Cross-review\n\nScope: whole document.\n\n## Findings\n\n- none\n\n## Verdict\n\nVERDICT: Approved\n";

/** A structurally complete REQ (§5.9's `spec` class, REQ row). */
function reqDoc(body = "Prose.") {
  return [
    "Problem / Context",
    "Goals",
    "Non-Goals",
    "Constraints",
    "Acceptance Criteria",
    "Risks",
    "Obligations",
  ]
    .map((h) => `## ${h}\n\n${body} (${h})\n`)
    .join("\n");
}

/**
 * Drive one `reviewLoop` over an in-memory tree.
 *
 * The reviewer agent writes its own cross-review file, so the tree the wrapper
 * measures is the tree this run produced (S-INV) — and so `appendApprovalAnchors`
 * has a file to pre-count.
 */
async function runLoop({ files = {}, agent, probes = {}, listing, doc = REQ_PATH } = {}) {
  const fs = fakeFs({ [REQ_PATH]: reqDoc(), ...files });
  // `probes` may be a factory over the live tree: a faithful probe has to observe
  // the fake fs as it stands when it is ASKED, not a snapshot taken before the
  // harness built it.
  const probeSeams = typeof probes === "function" ? probes(fs) : probes;
  const listFiles = listing
    ? fakeListFiles({ [DOCS_DIR]: listing })
    : fakeListFiles((dirPath) =>
        Object.keys(fs.files)
          .filter((p) => p.startsWith(`${dirPath}/`) && !p.slice(dirPath.length + 1).includes("/"))
          .map((p) => p.slice(dirPath.length + 1))
      );
  const logs = [];
  let round = 0;

  const defaultAgent = async (skill, prompt) => {
    if (!REVIEWERS.includes(skill)) return "";
    const slug = skill === "se-review" ? SE_SLUG : TE_SLUG;
    const n = /This is iteration (\d+)/.exec(String(prompt ?? ""));
    fs.writeFile(reviewPath(slug, n ? Number(n[1]) : 1), CROSS_REVIEW_BODY);
    round += 1;
    return APPROVE;
  };

  const result = await reviewLoop({
    doc,
    phase: "R",
    docType: "REQ",
    reviewers: REVIEWERS,
    optimizer: "pm-author",
    feature: FEATURE,
    _agent: agent ? (skill, prompt) => agent(skill, prompt, fs) : defaultAgent,
    _parallel: (thunks) => Promise.all(thunks),
    _checkFile: fs.checkFile,
    _listFiles: listFiles,
    _readFile: fs.readFile,
    _hashFile: fs.hashFile,
    _appendFile: fs.appendFile,
    _git: fakeGit((argv) => ({
      ok: true,
      stdout: argv.includes("--abbrev-ref") ? `feat-${FEATURE}` : "0".repeat(40),
    })),
    _log: (m) => logs.push(String(m)),
    ...probeSeams,
  });

  return { result, fs, listFiles, logs, rounds: round, probes: probeSeams };
}

describe("`_probeDoc` answers the wrapper's before/after observations", () => {
  test("a converging round reads no document through `_readFile` at all", async () => {
    const run = await runLoop({ probes: (fs) => ({ _probeDoc: faithfulProbeDoc(fs.files) }) });
    const probeDoc = run.probes._probeDoc;

    expect(run.result.converged).toBe(true);

    // (i) The probe really was consulted — for the two review targets §3.8
    // measures, and for the round anchor §5.3 captures over `doc`.
    expect(probeDoc.paths).toContain(REQ_PATH);
    expect(probeDoc.paths).toContain(reviewPath(SE_SLUG, 1));
    expect(probeDoc.paths).toContain(reviewPath(TE_SLUG, 1));

    // (ii) …and NOT one byte crossed `_readFile` or `_hashFile`. Both halves
    // matter: an implementation that probes and then reads anyway pays the whole
    // transport cost the seam exists to remove, and passes assertion (i).
    expect(run.fs.reads).toEqual([]);
    expect(run.fs.hashes).toEqual([]);
  });

  test("the round anchor is the probe's hash, and the pre-count is the probe's anchors", async () => {
    const run = await runLoop({ probes: (fs) => ({ _probeDoc: faithfulProbeDoc(fs.files) }) });

    // §5.3 t5: both cross-reviews carry the digest of the REQ as it stood when
    // the round was captured — taken from the probe, not recomputed here.
    const expected = approvalHashOf(reqDoc());
    expect(run.fs.appends).toHaveLength(2);
    for (const append of run.fs.appends) {
      expect(append.text).toContain(`APPROVAL-HASH: ${expected}`);
    }
  });

  test("an absent target reported by the probe yields no approval, exactly as an absent read does", async () => {
    // §5.3's `paths is absent` branch, reached through `exists: false` rather
    // than through a `null` read. The reviewer writes nothing, so its
    // cross-review never exists.
    const run = await runLoop({
      probes: (fs) => ({ _probeDoc: faithfulProbeDoc(fs.files) }),
      agent: async (skill) => (REVIEWERS.includes(skill) ? APPROVE : ""),
    });

    expect(run.result.converged).toBe(true);
    expect(run.fs.appends).toEqual([]);
    expect(run.logs.join("\n")).toContain("Approval anchor not recorded");
  });

  test("progress is scored on the probe's hash: two equal digests are no progress", async () => {
    // The target is never complete, so the episode can only end on a budget. A
    // probe whose digest never changes must be read as a STALLED episode —
    // §5.6.2's `MAX_AUTHORING_ATTEMPTS` halt, not the dispatch-count one.
    const probeDoc = scriptedProbe(() => ({
      ok: true,
      exists: true,
      empty: false,
      hash: `sha256:${"a".repeat(64)}`,
      artifactClass: "cross-review",
      complete: false,
      missing: [],
      T: 2,
      S: 1,
      firstUnwritten: '(the trailing "## Verdict" section)',
      anchors: [],
    }));
    const run = await runLoop({
      probes: { _probeDoc: probeDoc },
      agent: async (skill) => (REVIEWERS.includes(skill) ? APPROVE : ""),
    });

    expect(run.result.halted).toBe(true);
    expect(run.result.haltDetail).toMatch(/made no progress across 3 consecutive attempts/);
  });

  test("progress is scored on the probe's hash: differing digests are progress", async () => {
    // Same never-complete target, same dispatches, ONE difference: the digest
    // moves. The episode must now run out of dispatches instead of stalling —
    // which is only observable if the hash comparison is what scored progress.
    let n = 0;
    const probeDoc = scriptedProbe(() => {
      n += 1;
      return {
        ok: true,
        exists: true,
        empty: false,
        hash: `sha256:${String(n).padStart(64, "0")}`,
        artifactClass: "cross-review",
        complete: false,
        missing: [],
        T: 2,
        S: 1,
        firstUnwritten: '(the trailing "## Verdict" section)',
        anchors: [],
      };
    });
    const run = await runLoop({
      probes: { _probeDoc: probeDoc },
      agent: async (skill) => (REVIEWERS.includes(skill) ? APPROVE : ""),
    });

    expect(run.result.halted).toBe(true);
    expect(run.result.haltDetail).toMatch(/spent 6 dispatches without reaching structural completeness/);
    expect(run.result.haltDetail).not.toMatch(/no progress/);
  });

  test("two null digests are not progress — an absent document, twice", async () => {
    const probeDoc = scriptedProbe(() => ({
      ok: true,
      exists: false,
      empty: true,
      hash: null,
      artifactClass: "cross-review",
      complete: false,
      missing: [],
      T: 2,
      S: 0,
      firstUnwritten: "the document skeleton (no content on disk yet)",
      anchors: [],
    }));
    const run = await runLoop({
      probes: { _probeDoc: probeDoc },
      agent: async (skill) => (REVIEWERS.includes(skill) ? APPROVE : ""),
    });

    expect(run.result.halted).toBe(true);
    expect(run.result.haltDetail).toMatch(/made no progress across 3 consecutive attempts/);
  });
});

describe("`_probeDoc` falls back rather than failing", () => {
  /** The same fixture with no probe at all — the behaviour every fallback must match. */
  const baseline = () => runLoop({});

  test("a `null` probe leaves the byte-taking path in charge", async () => {
    const probeDoc = scriptedProbe(null);
    const run = await runLoop({ probes: { _probeDoc: probeDoc } });
    const plain = await baseline();

    expect(probeDoc.calls.length).toBeGreaterThan(0);
    expect(run.result).toEqual(plain.result);
    // The reads and the digest the probe would have replaced both happened.
    expect(run.fs.reads.map((r) => r.path)).toEqual(plain.fs.reads.map((r) => r.path));
    expect(run.fs.hashes.map((h) => h.path)).toEqual([REQ_PATH]);
    expect(run.fs.appends).toHaveLength(2);
  });

  test("a throwing probe leaves the byte-taking path in charge", async () => {
    const probeDoc = scriptedProbe(() => new Error("probe transport died"));
    const run = await runLoop({ probes: { _probeDoc: probeDoc } });
    const plain = await baseline();

    expect(probeDoc.calls.length).toBeGreaterThan(0);
    expect(run.result).toEqual(plain.result);
    expect(run.fs.reads.map((r) => r.path)).toEqual(plain.fs.reads.map((r) => r.path));
    expect(run.fs.hashes.map((h) => h.path)).toEqual([REQ_PATH]);
  });

  test("an ill-shaped reply (`ok` absent) is not a judgment, so it falls back too", async () => {
    const probeDoc = scriptedProbe({ hash: `sha256:${"c".repeat(64)}`, complete: true });
    const run = await runLoop({ probes: { _probeDoc: probeDoc } });
    const plain = await baseline();

    expect(run.result).toEqual(plain.result);
    // The anchor is the document's real digest, not the reply's — the reply was
    // never admitted.
    expect(run.fs.appends[0].text).toContain(`APPROVAL-HASH: ${approvalHashOf(reqDoc())}`);
  });
});

// ─── 2. `_probeReviewState` (§5.6.1's S-INV refresh) ─────────────────────────

/** A `refreshReviewState` reply in TRANSPORT shape: both maps as plain objects. */
function reviewStateReply({ startIndex = 2, present = {}, reviewFiles = {}, matched = [], files = [] } = {}) {
  return { ok: true, startIndex, endIndex: startIndex + 4, present, reviewFiles, matched, files };
}

/** One `reviewFiles` entry, as `refreshReviewState` records it. */
const approvingEntry = (slug, round) => ({
  verdict: "Approved",
  verdictReadable: true,
  anchorHash: null,
  anchorReason: "absent",
  path: reviewPath(slug, round),
});

/**
 * Drive a loop whose round 1 fails, so the optimizer runs as an **authoring**
 * dispatch — the one dispatch kind that refreshes the review state (§5.6.1).
 * Round 2 approves, so the loop converges and the assertions read a finished run.
 */
async function runWithOptimizer({ probes = {}, files = {} } = {}) {
  const prompts = [];
  return {
    prompts,
    ...(await runLoop({
      files,
      probes,
      agent: async (skill, prompt, fs) => {
        prompts.push({ skill, prompt: String(prompt ?? "") });
        const iteration = Number((/This is iteration (\d+)/.exec(String(prompt)) || [])[1] || 0);
        if (REVIEWERS.includes(skill)) {
          const slug = skill === "se-review" ? SE_SLUG : TE_SLUG;
          fs.writeFile(reviewPath(slug, iteration), CROSS_REVIEW_BODY);
          return iteration === 1 ? REJECT : APPROVE;
        }
        // The optimizer must actually edit the document: an episode that writes
        // nothing halts the loop by design (`reviewLoop`'s no-op optimizer halt).
        fs.writeFile(REQ_PATH, reqDoc(`revised at call ${prompts.length}`));
        return "Findings addressed.\nREVISION-COMPLETE: yes";
      },
    })),
  };
}

describe("`_probeReviewState` answers the episode's S-INV refresh", () => {
  test("the probe's state is used, and the listing seam is never consulted", async () => {
    const probeReviewState = scriptedProbe(() =>
      reviewStateReply({
        startIndex: 2,
        present: { [SE_SLUG]: [1], [TE_SLUG]: [1] },
        reviewFiles: {},
        matched: [
          { basename: `CROSS-REVIEW-${SE_SLUG}-REQ-v1.md`, role: SE_SLUG, round: 1 },
          { basename: `CROSS-REVIEW-${TE_SLUG}-REQ-v1.md`, role: TE_SLUG, round: 1 },
        ],
      })
    );
    const run = await runWithOptimizer({ probes: { _probeReviewState: probeReviewState } });

    expect(run.result.converged).toBe(true);
    expect(probeReviewState.calls[0][0]).toEqual({ feature: FEATURE, docType: "REQ" });

    // §5.6.1 rules 1/2 over the PROBE's `present`: the episode is a revision of
    // round 1, and §5.6.3's continuation clause names the basenames the probe's
    // `matched` carried — not names derived from arithmetic.
    const optimizer = run.prompts.filter((p) => p.skill === "pm-author");
    expect(optimizer).toHaveLength(1);
    expect(optimizer[0].prompt).toContain("CONTINUATION of round 1");
    expect(optimizer[0].prompt).toContain(`CROSS-REVIEW-${SE_SLUG}-REQ-v1.md`);

    // The saving: the directory was never enumerated for this run.
    expect(run.listFiles.callCount).toBe(0);
  });

  test("both maps are rehydrated — `present` is walked and `reviewFiles` is keyed `role:round`", async () => {
    // The probe reports rounds 2 and 3 on the branch, with round 3 carrying
    // same-round dual approval. §5.6.1 rule 2 therefore selects round **2**, the
    // highest round still owed an authoring pass.
    //
    // The fixture is chosen so that three implementations give three DIFFERENT
    // answers: one that left `present` a plain object sees no round at all and
    // selects greenfield (no continuation clause); one that left `reviewFiles` a
    // plain object cannot answer `get("role:3")`, so round 3 looks un-approved and
    // is selected; one that ignored the probe and re-derived the state locally
    // sees only the round-1 files this run wrote. Only rehydrating BOTH maps out
    // of the probe's reply yields round 2.
    const probeReviewState = scriptedProbe(() =>
      reviewStateReply({
        startIndex: 4,
        present: { [SE_SLUG]: [2, 3], [TE_SLUG]: [2, 3] },
        reviewFiles: {
          [`${SE_SLUG}:3`]: approvingEntry(SE_SLUG, 3),
          [`${TE_SLUG}:3`]: approvingEntry(TE_SLUG, 3),
        },
        matched: [
          { basename: `CROSS-REVIEW-${SE_SLUG}-REQ-v2.md`, role: SE_SLUG, round: 2 },
          { basename: `CROSS-REVIEW-${SE_SLUG}-REQ-v3.md`, role: SE_SLUG, round: 3 },
        ],
      })
    );
    const run = await runWithOptimizer({ probes: { _probeReviewState: probeReviewState } });

    const optimizer = run.prompts.filter((p) => p.skill === "pm-author");
    expect(optimizer).toHaveLength(1);
    expect(optimizer[0].prompt).toContain("CONTINUATION of round 2");
    expect(optimizer[0].prompt).not.toContain("CONTINUATION of round 1");
    expect(optimizer[0].prompt).not.toContain("CONTINUATION of round 3");
    // The named cross-reviews are round 2's, taken from the probe's `matched` —
    // round 3's basename is in the same list and must not be named.
    expect(optimizer[0].prompt).toContain(`CROSS-REVIEW-${SE_SLUG}-REQ-v2.md`);
    expect(optimizer[0].prompt).not.toContain(`CROSS-REVIEW-${SE_SLUG}-REQ-v3.md`);
  });

  test("`{ok: false}` is a judgment, not a failure: it halts on the probe's own message", async () => {
    // The listing this module was just told it cannot judge is NOT re-derived
    // locally — that is the difference between honouring a judgment and ignoring
    // one (§6.2 rows 2 and 17).
    const probeReviewState = scriptedProbe({ ok: false, message: "Cannot enumerate docs/probe-feat: unreadable" });
    await expect(
      runWithOptimizer({ probes: { _probeReviewState: probeReviewState } })
    ).rejects.toThrow("Cannot enumerate docs/probe-feat: unreadable");
    expect(probeReviewState.calls).toHaveLength(1);
  });

  test("a `null` probe falls back to the local refresh", async () => {
    const probeReviewState = scriptedProbe(null);
    const run = await runWithOptimizer({ probes: { _probeReviewState: probeReviewState } });
    const plain = await runWithOptimizer();

    expect(probeReviewState.calls).toHaveLength(1);
    expect(run.result).toEqual(plain.result);
    // The local refresh happened: the directory WAS enumerated, and the episode
    // still reached round 1's continuation off the files it found.
    expect(run.listFiles.callCount).toBeGreaterThan(0);
    expect(run.prompts.filter((p) => p.skill === "pm-author")[0].prompt).toContain(
      "CONTINUATION of round 1"
    );
  });

  test("a throwing probe falls back to the local refresh", async () => {
    const probeReviewState = scriptedProbe(() => new Error("probe transport died"));
    const run = await runWithOptimizer({ probes: { _probeReviewState: probeReviewState } });
    const plain = await runWithOptimizer();

    expect(run.result).toEqual(plain.result);
    expect(run.listFiles.callCount).toBeGreaterThan(0);
  });
});

// ─── 3. `main()`-level: `_probePostmortem` and the staleness gate ─────────────

const GATE_FEATURE = "gate-feat";
const GATE_DIR = `docs/${GATE_FEATURE}`;
const GATE_REQ = `${GATE_DIR}/REQ-${GATE_FEATURE}.md`;
const GATE_FSPEC = `${GATE_DIR}/FSPEC-${GATE_FEATURE}.md`;
const FSPEC_BODY = `# FSPEC — ${GATE_FEATURE}\n\nThe functional specification, as it stands on the branch.\n`;
const FSPEC_HASH = approvalHashOf(FSPEC_BODY);

/** Phase F's POSTMORTEM path (§5.8's `docs/{feature}/POSTMORTEM-{phase}-{feature}.md`). */
const F_POSTMORTEM = `${GATE_DIR}/POSTMORTEM-F-${GATE_FEATURE}.md`;

/** A tier-1 cross-review whose trailing section approves and carries `hash`. */
function approvingReview(hash) {
  return [
    `# Cross-review — FSPEC (${GATE_FEATURE})`,
    "",
    "Scope: whole document.",
    "",
    "## Findings",
    "",
    "- No blocking findings.",
    "",
    "## Verdict",
    "",
    "VERDICT: Approved",
    '{"high": 0, "medium": 0, "low": 0}',
    "",
    `APPROVAL-HASH: ${hash}`,
    "REVIEWED-COMMIT: unavailable",
    "",
  ].join("\n");
}

const gateReviewBasename = (slug) => `CROSS-REVIEW-${slug}-FSPEC-v2.md`;
const gateReviewPath = (slug) => `${GATE_DIR}/${gateReviewBasename(slug)}`;

/** The branch every `main()` fixture below starts from. */
function gateFiles() {
  return {
    [GATE_REQ]: `# REQ — ${GATE_FEATURE}\n`,
    [GATE_FSPEC]: FSPEC_BODY,
    [`${GATE_DIR}/TSPEC-${GATE_FEATURE}.md`]: `# TSPEC — ${GATE_FEATURE}\n`,
    // Phase P's self-parse gate (PROPOSAL §3.3) refuses a PLAN whose task table
    // the mechanical parser cannot read, so the seeded PLAN carries one. No new
    // `##` heading: the pacing wrapper scores this document's sections.
    [`${GATE_DIR}/PLAN-${GATE_FEATURE}.md`]: `# PLAN — ${GATE_FEATURE}\n\n| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | \`src/one.js\` |\n`,
    [`${GATE_DIR}/PROPERTIES-${GATE_FEATURE}.md`]: `# PROPERTIES — ${GATE_FEATURE}\n`,
  };
}

/** An agent that converges every review loop on its first iteration. */
function convergingAgent(log) {
  return async (skill, prompt) => {
    log.push({ skill, prompt: String(prompt ?? "") });
    if (/-review$/.test(skill)) return APPROVE;
    if (/-author$/.test(skill)) {
      if (/DECISIONS_WARRANTED/.test(String(prompt))) return "Done.\nDECISIONS_WARRANTED: false";
      if (/Return a JSON object/.test(String(prompt))) {
        return JSON.stringify({ tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }] });
      }
      return "Created/updated document successfully.";
    }
    if (skill === "se-implement") return "Tests: 5 passed, 0 failed.";
    if (skill === "harvest-learnings") return "Harvest complete.";
    return "Success.";
  };
}

/**
 * Drive the whole pipeline over one fixture branch. Phases DOD and PUB are off:
 * neither is skip-eligible, so they can only add failure modes unrelated to the
 * seams under test.
 */
async function runMain({ files = {}, listing = [], probes = {} } = {}) {
  const fs = fakeFs({ ...gateFiles(), ...files });
  const probeSeams = typeof probes === "function" ? probes(fs) : probes;
  const listFiles = fakeListFiles({ [GATE_DIR]: listing });
  const agentCalls = [];

  const result = await main({
    reqPath: GATE_REQ,
    _agent: convergingAgent(agentCalls),
    _parallel: (promises) => Promise.all(promises),
    _log: () => {},
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    _listFiles: listFiles,
    ...fs.injections(),
    _git: fakeGit((argv) => ({
      ok: true,
      stdout: argv.includes("--abbrev-ref") ? `feat-${GATE_FEATURE}` : "",
    })),
    _mergeWorktree: async () => ({ ok: true }),
    _checkCi: async () => "passed",
    _phaseDodEnabled: false,
    _phasePubEnabled: false,
    _now: () => 0,
    ...probeSeams,
  });

  return { result, fs, listFiles, agentCalls, probes: probeSeams };
}

/** The final report's row for one phase (§4.7). */
const phaseRecord = (result, id) => (result.phases || []).find((p) => p.phase === id) || null;

describe("`_probePostmortem` answers §2.5 step G", () => {
  test("an `unresolved` verdict refuses the phase without the file being read", async () => {
    const probePostmortem = scriptedProbe(({ phase }) =>
      phase === "F"
        ? { status: "unresolved", path: F_POSTMORTEM, recommendation: "Split the FSPEC." }
        : { status: "none", path: `${GATE_DIR}/POSTMORTEM-${phase}-${GATE_FEATURE}.md` }
    );
    const { result, fs } = await runMain({ probes: { _probePostmortem: probePostmortem } });

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain(`unresolved POSTMORTEM at ${F_POSTMORTEM}`);
    // §6.2 row 13's operator text comes from the probe's own recommendation.
    expect(result.haltReason).toContain("Split the FSPEC.");
    expect(phaseRecord(result, "F").status).toBe("❌");
    // The judgment was taken from the probe, not from the document.
    expect(fs.reads.map((r) => r.path)).not.toContain(F_POSTMORTEM);
  });

  test("the probe governs over the file on disk: `none` runs a phase whose POSTMORTEM says RESOLVED: no", async () => {
    // The file exists and would refuse Phase F under `checkPostmortem`. The probe
    // is the judgment consulted, so the phase runs — which is only observable
    // because the two disagree.
    const probePostmortem = scriptedProbe(({ phase }) => ({
      status: "none",
      path: `${GATE_DIR}/POSTMORTEM-${phase}-${GATE_FEATURE}.md`,
    }));
    const { result, fs } = await runMain({
      files: { [F_POSTMORTEM]: "# Postmortem\n\nRESOLVED: no\n\n## Recommendation\n\nDo not proceed.\n" },
      probes: { _probePostmortem: probePostmortem },
    });

    expect(result.outcome).toBe("success");
    expect(fs.reads.map((r) => r.path)).not.toContain(F_POSTMORTEM);
  });

  test("a throwing probe falls back to reading the POSTMORTEM, which then refuses", async () => {
    const probePostmortem = scriptedProbe(() => new Error("probe transport died"));
    const { result, fs } = await runMain({
      files: { [F_POSTMORTEM]: "# Postmortem\n\nRESOLVED: no\n\n## Recommendation\n\nDo not proceed.\n" },
      probes: { _probePostmortem: probePostmortem },
    });

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain(`unresolved POSTMORTEM at ${F_POSTMORTEM}`);
    // The fallback is the whole point: the file WAS read.
    expect(fs.reads.map((r) => r.path)).toContain(F_POSTMORTEM);
  });

  test("a status outside §5.8's closed catalogue is not a judgment, so it falls back", async () => {
    const probePostmortem = scriptedProbe({ status: "probably fine", path: F_POSTMORTEM });
    const { result, fs } = await runMain({
      files: { [F_POSTMORTEM]: "# Postmortem\n\nRESOLVED: no\n" },
      probes: { _probePostmortem: probePostmortem },
    });

    expect(result.outcome).toBe("halted");
    expect(fs.reads.map((r) => r.path)).toContain(F_POSTMORTEM);
  });
});

describe("`_probeDoc` answers §2.5 step 4's staleness comparison", () => {
  const listing = [gateReviewBasename(SE_SLUG), gateReviewBasename(TE_SLUG)];
  const approved = {
    [gateReviewPath(SE_SLUG)]: approvingReview(FSPEC_HASH),
    [gateReviewPath(TE_SLUG)]: approvingReview(FSPEC_HASH),
  };

  test("a probe digest equal to the recorded anchor is FRESH, and skips the phase", async () => {
    const run = await runMain({
      files: approved,
      listing,
      probes: (fs) => ({ _probeDoc: faithfulProbeDoc(fs.files) }),
    });
    const { result, fs } = run;
    const probeDoc = run.probes._probeDoc;

    expect(phaseRecord(result, "F").status).toBe("⏭");
    expect(phaseRecord(result, "F").detail).toBe("Skipped — approved round 2, hash FRESH");
    // The comparison went through `isStaleByHash` over the PROBE's digest: the
    // document was neither read nor separately hashed.
    expect(fs.reads.map((r) => r.path)).not.toContain(GATE_FSPEC);
    expect(fs.hashes.map((h) => h.path)).not.toContain(GATE_FSPEC);
    expect(probeDoc.paths).toContain(GATE_FSPEC);
  });

  test("a probe digest that differs is STALE, and the phase runs", async () => {
    const { result } = await runMain({
      files: approved,
      listing,
      probes: (fs) => ({
        _probeDoc: faithfulProbeDoc(fs.files, (record, path) =>
          path === GATE_FSPEC ? { ...record, hash: `sha256:${"d".repeat(64)}` } : record
        ),
      }),
    });

    expect(phaseRecord(result, "F").status).not.toBe("⏭");
  });

  test("a probe that cannot hash the document (`hash: null`) keeps `isStale`'s own answer", async () => {
    // §5.5: the null case stays on the byte-taking `isStale(hash, null)` rather
    // than becoming `isStaleByHash(hash, null)`. The two agree on every input
    // except one — a recorded anchor over an EMPTY document — and following
    // `isStale` is what keeps the gate's documented semantics literally true.
    // Here the recorded anchor is the FSPEC's, so both read STALE: the phase runs.
    const { result } = await runMain({
      files: approved,
      listing,
      probes: (fs) => ({
        _probeDoc: faithfulProbeDoc(fs.files, (record, path) =>
          path === GATE_FSPEC ? { ...record, hash: null } : record
        ),
      }),
    });

    expect(phaseRecord(result, "F").status).not.toBe("⏭");
  });

  test("a `null` probe falls back to `_hashFile`, and the skip still happens", async () => {
    const probeDoc = scriptedProbe(null);
    const { result, fs } = await runMain({
      files: approved,
      listing,
      probes: { _probeDoc: probeDoc },
    });

    expect(phaseRecord(result, "F").detail).toBe("Skipped — approved round 2, hash FRESH");
    expect(fs.hashes.map((h) => h.path)).toContain(GATE_FSPEC);
  });

  test("a whole run with a faithful probe reports exactly what the same run without one reports", async () => {
    // The equivalence claim, end to end: the probe changes WHO computes the
    // judgments, never WHAT they are. A divergence here means the probe path and
    // the read path have grown two different definitions of the same question.
    const probed = await runMain({
      files: approved,
      listing,
      probes: (fs) => ({ _probeDoc: faithfulProbeDoc(fs.files) }),
    });
    const plain = await runMain({ files: approved, listing });

    expect(probed.result).toEqual(plain.result);
    expect(probed.agentCalls.map((c) => c.skill)).toEqual(plain.agentCalls.map((c) => c.skill));
  });
});
