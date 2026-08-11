// consolidationOperatorChannels.test.js — Phase CR remediation (PM F-01…F-05).
//
// Every row here drives the default export, `main({...seams})`, and asserts on what the OPERATOR
// receives — the `.consolidation-log.md` terminal row and the report body — never on a builder
// called with hand-built inputs. That is the whole point of the suite: PM's Phase CR round 1 found
// four acceptance criteria whose logic was correct in a pure function that no production path
// called, and every one of them was green under the existing suites because those suites drove the
// builder rather than the report. A row here fails if the wiring is removed, even when the builder
// it wires is left perfect.
//
// The DC-07 shape this suite exists to catch, stated as an oracle rule: for each AC below, the
// assertion traverses `main()` and reads `result.body` or the appended terminal row. No row here
// imports `seamCandidates`, `remediationChoice` or `renderDeferredEntry` to assert on it directly.

import main from "../consolidate-learnings.js";
import {
  fakeFs,
  fakeGit,
  fakeGhRun,
  makeAgentDouble,
  fakeEnvPresent,
  fakeMakeTempDir,
  FIXED_NOW_MS,
  buildConsolidationLog,
  buildCorpusListing,
  buildEscalationsFixture,
} from "./helpers/consolidationDoubles.js";

const CONFIG_PATH = ".claude/pdlc.config.json";
const LOG_PATH = "docs/_decisions/.consolidation-log.md";
const MARKER_PATH = "docs/_decisions/.consolidation-lock";
const CONSTRAINTS_PATH = "docs/_constraints/DOMAIN-CONSTRAINTS.md";
const ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md";
const CLONE_DIR = "/tmp/consolidation-clone";

function buildConfig(overrides = {}) {
  return JSON.stringify({
    consolidation: {
      cadenceHours: 168,
      volumeThreshold: 5,
      staleLockMinutes: 60,
      pluginRepository: null,
      credentialEnv: "PDLC_PLUGIN_REPO_TOKEN",
      unmeasurablePasses: 3,
      ...overrides,
    },
  });
}

function agentReply(clusters) {
  return JSON.stringify({ clusters });
}

/** One pass's seams. Defaults are a conforming, nothing-to-propose pass; each row overrides only
 * the seam its own finding is about. */
function runPass(overrides = {}) {
  const files = {
    [CONFIG_PATH]: buildConfig(overrides.config),
    [CONSTRAINTS_PATH]: "",
    ...overrides.files,
  };
  if (overrides.logText !== undefined) files[LOG_PATH] = overrides.logText;
  if (overrides.escalations !== undefined) files[ESCALATIONS_PATH] = overrides.escalations;

  const fs = fakeFs(files);
  const git =
    overrides.git ?? fakeGit({ "ls-files": { ok: true, stdout: overrides.corpusListing ?? "" } });
  const ghRun = overrides.ghRun ?? fakeGhRun({});
  const agent = overrides.agent ?? makeAgentDouble({ script: [agentReply([])] });

  const seams = {
    _agent: agent,
    _readFile: fs.readFile,
    _writeFile: fs.writeFile,
    _appendFile: fs.appendFile,
    _checkFile: fs.checkFile,
    _git: git._git,
    _ghRun: ghRun._ghRun,
    _log: () => {},
    _phase: () => {},
    _envPresent: (overrides.envPresent ?? fakeEnvPresent(new Set()))._envPresent,
    _makeTempDir: (overrides.makeTempDir ?? fakeMakeTempDir(CLONE_DIR))._makeTempDir,
    _now: () => FIXED_NOW_MS,
    ...overrides.seams,
  };

  return { run: () => main(seams), fs, git, ghRun, agent };
}

/**
 * A minimal readable LEARNINGS body for a corpus path. TSPEC §12.2 v2.8 makes readability
 * the difference between a consumed entry and an un-consolidated one, so any fixture whose
 * subject is "what this pass consumed" has to supply bodies rather than only a listing.
 */
function learningsBody(path) {
  const feature = /LEARNINGS-(.+)\.md$/.exec(path)?.[1] ?? "unknown";
  return `# LEARNINGS — ${feature}\n\n## 1. Domain / architectural invariant\nAn invariant recorded by ${feature}.\n`;
}

/** The bytes appended to the log — the terminal row lives in here, and it is the operator's
 * other channel. Read from the fake's append record rather than reconstructed. */
function appendedLogText(fs) {
  return fs.appends
    .filter((call) => call.path === LOG_PATH)
    .map((call) => call.text)
    .join("");
}

// A guard-set artifact: `routeOf` classifies `pdlc/workflows/` under MERGE_GUARD_DEFAULTS, so a
// promotion here takes the PR route — the route whose failures produce deferrals.
const GUARD_ARTIFACT = "pdlc/workflows/orchestrate-dev.js";

function guardCluster(overrides = {}) {
  return {
    phase: "T",
    artifact: GUARD_ARTIFACT,
    kind: 3,
    action: "promote",
    symptom: "the reviewer approved a document with an unwired builder",
    diff: "- always name the production caller",
    evidence: { recurrence: ["feat-alpha", "feat-beta"] },
    ...overrides,
  };
}

const CORPUS = buildCorpusListing([
  "docs/feat-alpha/LEARNINGS-feat-alpha.md",
  "docs/feat-beta/LEARNINGS-feat-beta.md",
]);

// ═══════════════════════════════════════════════════════════════════════════
// PM F-01 — AC-7.1's "what it deferred for human judgment", on both channels
// ═══════════════════════════════════════════════════════════════════════════
describe("AC-7.1/AC-3.5 — `deferred:` carries what was deferred, on both operator channels", () => {
  // The PR route with no credential and no plugin repository degrades through `degradeAll`, which
  // is the production path that populates `state.deferred`. Both channels are then read for the
  // pair's name — an assertion that is red against the literal `deferred: none` this remediation
  // replaced, in both renderers, which is what makes it a wiring oracle rather than a format one.
  test("a promoted-degraded pass names the deferred pair in the report body, in the terminal row, and points at the proposal file", async () => {
    const pass = runPass({
      corpusListing: CORPUS,
      agent: makeAgentDouble({ script: [agentReply([guardCluster()])] }),
    });

    const result = await pass.run();

    // Every promotion took the PR route and degraded there, so nothing was enacted and the
    // status is `no-op` — which is precisely PM F-01's worst case: the pass that most needs to
    // tell the operator something reported `deferred: none`.
    expect(result.status).toBe("no-op");
    expect(result.deferred.length).toBeGreaterThan(0);

    const pair = `${result.deferred[0].failureModeId}:${result.deferred[0].action}`;

    // Channel 1 — the report body's item 8, which must name the pair AND the residue file.
    expect(result.body).toContain(pair);
    expect(result.body).not.toContain("8. deferred: none");
    expect(result.body).toContain(`docs/_decisions/CONSOLIDATION-PROPOSAL-${result.passId}.md`);

    // Channel 2 — the terminal row appended to the log.
    const row = appendedLogText(pass.fs);
    expect(row).toMatch(/deferred: .+/);
    expect(row).not.toContain("deferred: none");
    expect(row).toContain(pair);
  });

  // The negative control that keeps `none` meaningful: a pass with nothing deferred must still say
  // `none`, so the row above is evidence of wiring rather than of an unconditional non-empty string.
  test("a pass that defers nothing still reports `none` on both channels — `none` is reserved for the empty case", async () => {
    const pass = runPass({ corpusListing: CORPUS });

    const result = await pass.run();

    expect(result.deferred).toEqual([]);
    expect(result.body).toContain("8. deferred: none");
    expect(appendedLogText(pass.fs)).toContain("deferred: none");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PM F-02 — AC-6.2/AC-6.3: the advisory corpus reaches report item 7
// ═══════════════════════════════════════════════════════════════════════════
describe("AC-6.1/AC-6.2/AC-6.3 — report item 7 renders the corpus state, the candidate and the widening", () => {
  test("a seam escalating across four features is named as the over-escalating candidate, with its counts", async () => {
    const escalations = buildEscalationsFixture([
      { feature: "feat-a", seam: "A1" },
      { feature: "feat-b", seam: "A1" },
      { feature: "feat-c", seam: "A1" },
      { feature: "feat-d", seam: "A1" },
      { feature: "feat-a", seam: "A2" },
    ]);
    const pass = runPass({ corpusListing: CORPUS, escalations });

    const result = await pass.run();

    // The corpus state was always reported; the candidate is what was thrown away.
    expect(result.body).toContain("7. advisory:");
    expect(result.body).toContain("corpus present");
    expect(result.body).toMatch(/over-escalating: A1 \(4 escalations across 4 features\)/);
    // AC-6.3 — the never-escalating seams, and the consumer-local operator action for them.
    expect(result.body).toMatch(/widening candidates: .*A3/);
    expect(result.body).toContain(".claude/pdlc.config.json");
    // The literal this remediation replaced.
    expect(result.body).not.toContain("7. advisory: none");
  });

  // Two controls, so the row above cannot pass by printing a candidate unconditionally.
  test("a tie between two equally-escalating seams proposes no candidate and says so", async () => {
    const escalations = buildEscalationsFixture([
      { feature: "feat-a", seam: "A1" },
      { feature: "feat-b", seam: "A1" },
      { feature: "feat-c", seam: "A2" },
      { feature: "feat-d", seam: "A2" },
    ]);
    const pass = runPass({ corpusListing: CORPUS, escalations });

    const result = await pass.run();

    expect(result.body).toMatch(/over-escalating: none \(tie: A1, A2\)/);
  });

  test("an absent advisory corpus proposes nothing of either kind", async () => {
    const pass = runPass({ corpusListing: CORPUS });

    const result = await pass.run();

    expect(result.body).toContain("corpus absent");
    expect(result.body).toContain("over-escalating: none");
    expect(result.body).toContain("widening candidates: none");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PM F-04 — AC-2.3's bar is enforced, AC-3.2(iii)'s evidence is never dropped
// ═══════════════════════════════════════════════════════════════════════════
describe("AC-2.3/AC-3.2 — the pattern bar is stated to the model and enforced on the production path", () => {
  test("the clustering prompt states the ≥2-unrelated-features bar, the standing-invariant arm, and the evidence shape the renderer reads", async () => {
    const pass = runPass({ corpusListing: CORPUS });

    await pass.run();

    // One dispatch: the clustering call. Read from the double's transcript, so this asserts what
    // the model was actually told rather than what a constant says.
    const [prompt] = pass.agent.calls.map((c) => c.prompt ?? (c.options && c.options.prompt) ?? "");
    expect(prompt).toMatch(/TWO OR MORE\s+UNRELATED features/);
    expect(prompt).toMatch(/standing invariant/i);
    expect(prompt).toContain("recurrence");
    expect(prompt).toContain("standingInvariant");
  });

  test("a single-occurrence cluster with no standing invariant is diverted to the proposal file, never enacted on any route", async () => {
    const pass = runPass({
      corpusListing: CORPUS,
      agent: makeAgentDouble({
        script: [agentReply([guardCluster({ evidence: { recurrence: ["feat-alpha"] } })])],
      }),
    });

    const result = await pass.run();

    // Deferred, not promoted: no record was written for it, and the report names the cause.
    expect(result.records).toEqual([]);
    expect(result.status).toBe("no-op");
    expect(result.deferred).toHaveLength(1);
    expect(result.body).toMatch(/pattern bar unmet \(AC-2\.3\)/);
  });

  test("evidence of an unrecognised shape fails the bar too — it is not silently accepted", async () => {
    const pass = runPass({
      corpusListing: CORPUS,
      agent: makeAgentDouble({
        script: [agentReply([guardCluster({ evidence: "LEARNINGS-feat-alpha.md" })])],
      }),
    });

    const result = await pass.run();

    expect(result.records).toEqual([]);
    expect(result.deferred).toHaveLength(1);
  });

  test("the standing-invariant arm clears the bar — the bar rejects coincidences, not single occurrences as such", async () => {
    const pass = runPass({
      corpusListing: CORPUS,
      agent: makeAgentDouble({
        script: [
          agentReply([
            guardCluster({ evidence: { standingInvariant: "a builder with no production caller is a defect" } }),
          ]),
        ],
      }),
    });

    const result = await pass.run();

    // It reached the PR route (and degraded there for want of a credential), which is what
    // separates "cleared the bar" from "was diverted before routing": a diverted proposal is
    // never routed and writes no record at all, a degraded one writes a `degraded` record.
    expect(result.records.some((r) => r.route === "degraded")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PM F-05 — AC-3.2(i): each promotion cites ITS OWN sources, not the pass's set
// ═══════════════════════════════════════════════════════════════════════════
describe("AC-3.2(i) — the per-promotion `source:` line is the promotion's own, not the whole consumed set", () => {
  // Three consumed LEARNINGS, two promotions, each evidenced by a different pair. The defect this
  // pins is that every section named every consumed file, so the reviewer could not tell which
  // features evidenced which edit. The oracle is a discrimination, not a containment: each
  // section must name its own features AND NOT the third one.
  test("with three consumed features and two promotions, each section names only the features its evidence cites", async () => {
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
      "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/42\n" },
    });
    const CORPUS = [
      "docs/feat-alpha/LEARNINGS-feat-alpha.md",
      "docs/feat-beta/LEARNINGS-feat-beta.md",
      "docs/feat-gamma/LEARNINGS-feat-gamma.md",
    ];
    const pass = runPass({
      ghRun,
      // The three files are READABLE. This row's subject is which consumed features a
      // promotion cites, so its corpus has to be consumed: under TSPEC §12.2 v2.8 an
      // enumerated-but-unreadable entry is not consumed at all, and provenance drawn from
      // one would attribute a promotion to a LEARNINGS the pass never opened.
      files: Object.fromEntries(CORPUS.map((p) => [p, learningsBody(p)])),
      git: fakeGit({ "ls-files": { ok: true, stdout: CORPUS.join("\n") + "\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply([
            guardCluster({
              phase: "T",
              artifact: "pdlc/hooks/scripts/alpha.sh",
              symptom: "alpha-beta symptom",
              evidence: { recurrence: ["feat-alpha", "feat-beta"] },
            }),
            guardCluster({
              phase: "I",
              artifact: "pdlc/hooks/scripts/gamma.sh",
              symptom: "gamma-only symptom",
              evidence: { recurrence: ["feat-gamma", "feat-alpha"] },
            }),
          ]),
        ],
      }),
    });

    await pass.run();

    const bodyWrite = pass.fs.writes.find((w) => /PDLC-CONSOLIDATION-PROMOTIONS/.test(w.contents ?? ""));
    expect(bodyWrite).toBeDefined();

    // Split on the section headings so each promotion's own `source:` line is read in isolation —
    // a whole-body `toContain` would pass on the very defect this row is about.
    const sections = bodyWrite.contents.split(/^## /m).slice(1);
    expect(sections.length).toBe(2);

    const sourceLineOf = (section) =>
      section.split("\n").find((line) => line.startsWith("source: ")) ?? "";

    const alpha = sections.find((s) => s.includes("alpha-beta symptom"));
    const gamma = sections.find((s) => s.includes("gamma-only symptom"));

    expect(sourceLineOf(alpha)).toContain("LEARNINGS-feat-alpha.md");
    expect(sourceLineOf(alpha)).toContain("LEARNINGS-feat-beta.md");
    expect(sourceLineOf(alpha)).not.toContain("LEARNINGS-feat-gamma.md");

    expect(sourceLineOf(gamma)).toContain("LEARNINGS-feat-gamma.md");
    expect(sourceLineOf(gamma)).not.toContain("LEARNINGS-feat-beta.md");

    // The pass-level set still lives on the trailer, unchanged — the per-section narrowing is not
    // a loss of the pass-level citation.
    expect(bodyWrite.contents).toMatch(
      /PDLC-CONSOLIDATION-SOURCES: LEARNINGS-feat-alpha\.md, LEARNINGS-feat-beta\.md, LEARNINGS-feat-gamma\.md/
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PM F-03 — AC-5.3/AC-5.4/AC-5.5: the streaks are reachable, remediation is chosen
// ═══════════════════════════════════════════════════════════════════════════
describe("AC-5.3/AC-5.4 — a promotion that recurred on two counted passes is flagged ineffective and routed", () => {
  const PROMOTED_ID = "t-pdlc-workflows-orchestrate-dev-js";
  const PRIOR_RECORD = [
    `failure-mode-id: ${PROMOTED_ID}`,
    "phase: T",
    "symptom: an earlier pass promoted this one",
    `artifact: ${GUARD_ARTIFACT}`,
    "target: docs/_constraints/DOMAIN-CONSTRAINTS.md",
    "passId: 2025-01-01-1",
    "action: promote",
    "route: constraints",
  ].join("\n");

  // Two prior passes, each with its own consumed block, each consuming a LEARNINGS whose body
  // still names the promoted failure mode — `recurred`, twice consecutively. Against the
  // one-element pass array this remediation replaced, `ineffectiveStreak` could reach at most 1
  // and `state` was `null` on every repo forever.
  const RECURRENCE_BODY = `# LEARNINGS\n\n- failure-mode-id: ${PROMOTED_ID}\n`;

  function ineffectiveFixture(gitScript) {
    return runPass({
      corpusListing:
        [
          "docs/feat-alpha/LEARNINGS-feat-alpha.md",
          "docs/feat-beta/LEARNINGS-feat-beta.md",
          "docs/feat-gamma/LEARNINGS-feat-gamma.md",
        ].join("\n") + "\n",
      git: gitScript,
      files: {
        "docs/feat-alpha/LEARNINGS-feat-alpha.md": RECURRENCE_BODY,
        "docs/feat-beta/LEARNINGS-feat-beta.md": RECURRENCE_BODY,
        "docs/feat-gamma/LEARNINGS-feat-gamma.md": RECURRENCE_BODY,
      },
      logText:
        `${PRIOR_RECORD}\n\n` +
        buildConsolidationLog({
          blocks: [
            { passId: "2025-01-01-1", basenames: ["LEARNINGS-feat-alpha.md"] },
            { passId: "2025-02-01-1", basenames: ["LEARNINGS-feat-beta.md"] },
          ],
        }),
    });
  }

  test("the row reaches `ineffective` and report item 5 carries it — with one pass in the fold it never could", async () => {
    const pass = ineffectiveFixture(
      fakeGit({
        "ls-files": {
          ok: true,
          stdout:
            [
              "docs/feat-alpha/LEARNINGS-feat-alpha.md",
              "docs/feat-beta/LEARNINGS-feat-beta.md",
              "docs/feat-gamma/LEARNINGS-feat-gamma.md",
            ].join("\n") + "\n",
        },
      })
    );

    const result = await pass.run();

    const row = result.effectiveness.find((r) => r.failureModeId === PROMOTED_ID);
    expect(row).toBeDefined();
    expect(row.verdict).toBe("recurred");
    expect(row.state).toBe("ineffective");
    // AC-5.4 — the remediation is CHOSEN, not left null: the artifact resolves at HEAD, so
    // §8.5 row 3 proposes a revision.
    expect(row.remediation).toBe("revision");

    // And it reaches the operator: report item 5 renders the state and the remediation.
    expect(result.body).toContain(PROMOTED_ID);
    expect(result.body).toContain("state: ineffective");
    expect(result.body).toContain("remediation: revision");
  });

  test("the same row with the artifact gone from HEAD is routed to retirement instead — the probe is a real input, not a constant", async () => {
    const pass = ineffectiveFixture(
      fakeGit({
        "ls-files": {
          ok: true,
          stdout:
            [
              "docs/feat-alpha/LEARNINGS-feat-alpha.md",
              "docs/feat-beta/LEARNINGS-feat-beta.md",
              "docs/feat-gamma/LEARNINGS-feat-gamma.md",
            ].join("\n") + "\n",
        },
        "cat-file": { ok: false, stdout: "", stderr: "path does not exist in HEAD" },
      })
    );

    const result = await pass.run();

    const row = result.effectiveness.find((r) => r.failureModeId === PROMOTED_ID);
    expect(row.state).toBe("ineffective");
    expect(row.remediation).toBe("retirement");
    expect(result.body).toContain("remediation: retirement");

    // The probe is TSPEC §7.5's read, spelled as §9.3's `read-object` verb — asserted so a
    // refactor to a checkout or a filesystem stat is caught here.
    expect(pass.git.calls).toContainEqual(["cat-file", "-e", `HEAD:${GUARD_ARTIFACT}`]);
  });

  // The control: a single counted pass cannot reach the threshold, so `ineffective` is not
  // unconditional. This is what keeps the two rows above from passing on a hardcoded state.
  test("one counted pass leaves the row unflagged — the threshold is a real count", async () => {
    const pass = runPass({
      corpusListing:
        "docs/feat-alpha/LEARNINGS-feat-alpha.md\ndocs/feat-beta/LEARNINGS-feat-beta.md\n",
      files: {
        "docs/feat-alpha/LEARNINGS-feat-alpha.md": RECURRENCE_BODY,
        "docs/feat-beta/LEARNINGS-feat-beta.md": RECURRENCE_BODY,
      },
      logText: `${PRIOR_RECORD}\n\n`,
    });

    const result = await pass.run();

    const row = result.effectiveness.find((r) => r.failureModeId === PROMOTED_ID);
    expect(row.verdict).toBe("recurred");
    expect(row.state).toBeNull();
    expect(row.remediation).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PM G-01/G-02 — an AC-2.3 bar rejection is a filter, not a degradation
// ═══════════════════════════════════════════════════════════════════════════
describe("AC-7.1/AC-2.3 — a pass that promotes and correctly declines a coincidence reads `promoted`", () => {
  // The mixed pass PM G-01 asks for, and the row the existing bar coverage lacked: every prior
  // bar row had a SOLE cluster, so `enacted` was empty and `no-op` masked the status derivation.
  // Two kind-1 clusters on distinct artifacts (distinct `failureModeId`s, so `mergeProposals`
  // cannot fold them): one clears the bar and is enacted on the constraints route, one fails it.
  //
  // The oracle is a conjunction on the same path, not a bare status check: the status is
  // `promoted` VERBATIM *and* item 8 still names the declined pair *and* the enacted promotion
  // landed. Asserting the status alone would pass on a build that silently dropped the declined
  // cluster instead of deferring it — the failure mode the AC-2.3 bar exists to prevent.
  const mixedPass = () =>
    runPass({
      corpusListing: CORPUS,
      agent: makeAgentDouble({
        script: [
          agentReply([
            guardCluster({
              phase: "T",
              artifact: "pdlc/hooks/scripts/cleared.sh",
              kind: 1,
              symptom: "cleared-the-bar symptom",
              evidence: { recurrence: ["feat-alpha", "feat-beta"] },
            }),
            guardCluster({
              phase: "I",
              artifact: "pdlc/hooks/scripts/declined.sh",
              kind: 1,
              symptom: "coincidence symptom",
              evidence: { recurrence: ["feat-alpha"] },
            }),
          ]),
        ],
      }),
      files: { [CONSTRAINTS_PATH]: "" },
    });

  test("the status is `promoted`, the declined pair is still named in item 8, and the promotion landed", async () => {
    const pass = mixedPass();

    const result = await pass.run();

    // (0) Non-vacuity: the pass really did both things. Without this the status assertion
    // could hold on a pass that enacted nothing or declined nothing.
    expect(result.records.some((r) => r.route === "constraints")).toBe(true);
    expect(result.deferred).toHaveLength(1);

    // (1) G-01: the bar rejection does not darken the terminal status.
    expect(result.status).toBe("promoted");
    expect(appendedLogText(pass.fs)).toMatch(/status: promoted(\s|$)/m);
    expect(appendedLogText(pass.fs)).not.toContain("promoted-degraded");

    // (2) Nothing is lost by not degrading: item 8 still names the declined pair and points
    // at the proposal file.
    expect(result.body).toMatch(/pattern bar unmet \(AC-2\.3\)/);
    expect(result.body).toContain("CONSOLIDATION-PROPOSAL-");
  });

  test("a genuinely degraded deferral still reads `promoted-degraded` — the derivation was narrowed, not removed", async () => {
    // The control for the row above. One cluster clears the bar and is enacted on the
    // constraints route; a second clears the bar too but takes the PR route with no credential
    // and no plugin repository, so `degradeAll` defers it with a reason code. That deferral is
    // an AC-3.5 fallback class, so the status must still degrade.
    const pass = runPass({
      corpusListing: CORPUS,
      agent: makeAgentDouble({
        script: [
          agentReply([
            guardCluster({
              phase: "T",
              artifact: "pdlc/hooks/scripts/cleared.sh",
              kind: 1,
              symptom: "cleared-the-bar symptom",
              evidence: { recurrence: ["feat-alpha", "feat-beta"] },
            }),
            guardCluster({
              phase: "I",
              artifact: GUARD_ARTIFACT,
              kind: 3,
              symptom: "pr-route symptom",
              evidence: { recurrence: ["feat-alpha", "feat-beta"] },
            }),
          ]),
        ],
      }),
      files: { [CONSTRAINTS_PATH]: "" },
    });

    const result = await pass.run();

    expect(result.records.some((r) => r.route === "constraints")).toBe(true);
    expect(result.deferred).toHaveLength(1);
    // A reason code — the mark of an AC-3.5 fallback class, which a bar rejection never carries.
    expect(result.deferred[0].reason).toBeTruthy();
    expect(result.status).toBe("promoted-degraded");
  });

  test("the proposal file separates declined-by-bar items from degraded ones (G-02)", async () => {
    const pass = mixedPass();

    await pass.run();

    const proposalWrite = pass.fs.writes.find((w) => /CONSOLIDATION-PROPOSAL-/.test(w.path ?? ""));
    expect(proposalWrite).toBeDefined();

    const heading = "# Declined at the AC-2.3 pattern bar (not a degraded promotion)";
    expect(proposalWrite.contents).toContain(heading);

    // The discrimination, not a containment: the declined item's section must live BELOW the
    // separator. A whole-file `toContain` would pass on a file that printed the heading and
    // then interleaved the two causes anyway — the defect G-02 is about.
    const [above, below] = proposalWrite.contents.split(heading);
    expect(below).toContain("pattern bar unmet (AC-2.3)");
    expect(above).not.toContain("pattern bar unmet (AC-2.3)");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PM G-03 — `promotionSources` matches whole feature names, not substrings
// ═══════════════════════════════════════════════════════════════════════════
describe("AC-3.2(i) — a promotion's cited sources are not widened by a prefix-related feature name", () => {
  // `feat-a` is a strict prefix of `feat-alpha`, and the evidence names only the former.
  const PREFIX_CORPUS = [
    "docs/feat-a/LEARNINGS-feat-a.md",
    "docs/feat-alpha/LEARNINGS-feat-alpha.md",
    "docs/feat-beta/LEARNINGS-feat-beta.md",
  ];

  test("evidence naming `feat-a` cites LEARNINGS-feat-a.md and not LEARNINGS-feat-alpha.md", async () => {
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
      "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/43\n" },
    });
    const pass = runPass({
      ghRun,
      git: fakeGit({
        "ls-files": {
          ok: true,
          stdout: PREFIX_CORPUS.join("\n") + "\n",
        },
      }),
      // Readable, for the same reason as the sibling row above: an unreadable entry is
      // not consumed, so a prefix-matching oracle over the consumed set would have
      // nothing to match against and would pass vacuously.
      files: Object.fromEntries(PREFIX_CORPUS.map((p) => [p, learningsBody(p)])),
      agent: makeAgentDouble({
        script: [
          agentReply([
            guardCluster({
              phase: "T",
              artifact: "pdlc/hooks/scripts/prefix.sh",
              symptom: "prefix symptom",
              // Two features, so the bar is cleared; one of them is a strict prefix of a third
              // consumed feature that the evidence does NOT name.
              evidence: { recurrence: ["feat-a", "feat-beta"] },
            }),
          ]),
        ],
      }),
    });

    await pass.run();

    const bodyWrite = pass.fs.writes.find((w) => /PDLC-CONSOLIDATION-PROMOTIONS/.test(w.contents ?? ""));
    expect(bodyWrite).toBeDefined();
    const section = bodyWrite.contents.split(/^## /m).slice(1)[0];
    const sourceLine = section.split("\n").find((line) => line.startsWith("source: ")) ?? "";

    // Positive and negative on the same line: the cited pair is present, the prefix-related
    // third file is absent. Under the old `includes` matcher `LEARNINGS-feat-alpha.md` was
    // cited by `feat-a`, so this row is red against that build.
    expect(sourceLine).toContain("LEARNINGS-feat-a.md");
    expect(sourceLine).toContain("LEARNINGS-feat-beta.md");
    expect(sourceLine).not.toContain("LEARNINGS-feat-alpha.md");
  });
});
