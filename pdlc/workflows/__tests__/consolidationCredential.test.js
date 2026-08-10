// consolidationCredential.test.js — PLAN T22 (RED, describe.skip).
//
// Two blocks, each un-skipped by its own owning task (PLAN §13.3's
// batch-safety rule 2 — one un-skip per owning task, never a shared
// un-skip commit):
//
// - "T30 resolution order" (PLAN T30, batch 9): AT-K1, AT-K2, AT-K3, AT-K4,
//   AT-K6, AT-K7 over FSPEC §7.2 / TSPEC §9.2's credential resolution
//   order — `_envPresent`'s boolean-only contract (TSPEC §5.3: fail-closed
//   on any reply that is not the literal boolean `true`, never onto a
//   claimed credential), the `local-gh` fallback probe
//   (`_ghRun("gh auth status")`), and the `absent` fall-through when
//   neither resolves.
// - "T31 non-disclosure" (PLAN T31, batch 10): AT-K5, NFR-2 / FSPEC §7.4 —
//   no log record, artifact, PR body or report field ever carries the
//   credential variable's VALUE, on any path, asserted over the
//   accumulated text every double this pass writes through records
//   (TSPEC §10.5).
//
// Both blocks are un-skipped: T30 and T31 have landed `main()`'s behaviour.
// Bodies were written to the target behaviour at T22 (PLAN §13.3 rule 2);
// fixtures were later repaired against the landed clustering-reply grammar
// (consolidationRoute.test.js's header) where the RED-time placeholders were
// internally contradictory.
//
// Per TSPEC §11.6, the adapter transport behind `_envPresent` (the agent
// prompt `rtEnvPresent` runs) is reviewed, not executed here — this file's
// obligation is the module-side contract only: a `false` reply (whatever
// produced it) is never upgraded to a claimed credential.

import main from "../consolidate-learnings.js";
import {
  fakeFs,
  fakeGit,
  fakeGhRun,
  makeAgentDouble,
  fakeEnvPresent,
  fakeMakeTempDir,
  buildConsolidationLog,
  buildCorpusListing,
  fakeNow,
} from "./helpers/consolidationDoubles.js";

// The module's own default `credentialEnv` (TSPEC §6.1) — transcribed, not
// imported: `consolidate-learnings.js`'s config defaults are not exported.
const CREDENTIAL_ENV = "PDLC_PLUGIN_REPO_TOKEN";

// A value that must NEVER reach any double's recorded text (T31's whole
// subject). Deliberately distinctive so a substring search cannot
// false-negative against ordinary fixture prose.
const SECRET_VALUE = "ghp_T22SECRETVALUE0000000000000000";

// One unconsumed LEARNINGS file — enough to give the pass a corpus to read
// and a `direct` (manual, FSPEC §2.1) trigger to run on unconditionally
// (`triggerFor` returns `manual` whenever `direct` is set — TSPEC §7.2).
// The clustering (step 8), remediation (step 12) and proposal-authoring
// (step 13) dispatches are all answered by the same scripted `_agent`; the
// exact response grammar those steps read is authored by the PLAN tasks
// that implement them and is not this task's concern — only that a
// well-formed reply is returned so nothing upstream of §7.2's credential
// resolution blocks the pass from reaching it.
const LEARNINGS_PATH = "docs/sample-feature/LEARNINGS-sample-feature.md";
const LEARNINGS_TEXT = [
  "# LEARNINGS: sample-feature",
  "",
  "## 1. Failure mode",
  "The `se-author` skill under-specified an edge case.",
  "",
  "## 2. Harvested from",
  "CROSS-REVIEW-test-engineer-TSPEC-v1.md",
  "",
  "## 6. Approval Record",
  "",
].join("\n");

const SECOND_LEARNINGS_PATH = "docs/other-feature/LEARNINGS-other-feature.md";
const SECOND_LEARNINGS_TEXT = LEARNINGS_TEXT.replace("sample-feature", "other-feature");

// The clustering-reply grammar (documented assumption, consolidationRoute.test.js's
// header): JSON `{clusters: […]}`, one member per promotion. The default fixture
// carries one guard-set promotion (kind 3, a MERGE_GUARD_DEFAULTS path) so §9.2's
// credential resolution is actually reached; a case whose premise is
// "consuming-repo only" overrides `clusters` with `CONSUMING_CLUSTER`.
const GUARD_CLUSTER = {
  phase: "I",
  artifact: "pdlc/hooks/scripts/sample.sh",
  kind: 3,
  action: "promote",
  symptom: "sample.sh recurs across features",
  diff: "--- a/pdlc/hooks/scripts/sample.sh\n+++ b/pdlc/hooks/scripts/sample.sh\n",
  evidence: { recurrence: ["sample-feature"] },
};
const CONSUMING_CLUSTER = {
  phase: "T",
  artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
  kind: 1,
  action: "promote",
  symptom: "a process learning (AC-2.2 target)",
  diff: "+ a bullet",
  evidence: { standingInvariant: "stated once, holds always" },
};

/**
 * Wires every seam `main()` needs to reach the §6 PR-route attempt: a
 * `direct` pass over one (or, with `paths`, several) unconsumed LEARNINGS
 * file(s), no marker held, and a scripted `_agent` that answers every
 * dispatch with one well-formed reply so nothing upstream of §7.2's
 * credential resolution blocks the pass. `envPresent` and `ghExtra` are the
 * two seams each AT-K case actually drives; every other seam is the shared,
 * uninteresting-by-construction happy path.
 *
 * @param {object} [opts]
 * @param {Set<string>} [opts.envPresent] - names `_envPresent` answers true for
 * @param {object} [opts.ghExtra] - extra `matchKey`-keyed `_ghRun` replies
 * @param {string[]} [opts.paths] - corpus paths (defaults to the one fixture)
 */
function buildPromotableSeams({
  envPresent = new Set(),
  ghExtra = {},
  gitExtra = {},
  paths = [LEARNINGS_PATH],
  clusters = [GUARD_CLUSTER],
  script,
} = {}) {
  const files = { "docs/_decisions/.consolidation-log.md": buildConsolidationLog({}) };
  for (const path of paths) {
    files[path] = path === LEARNINGS_PATH ? LEARNINGS_TEXT : SECOND_LEARNINGS_TEXT;
  }
  const fs = fakeFs(files);
  const git = fakeGit({
    "ls-files": { ok: true, stdout: buildCorpusListing(paths) },
    ...gitExtra,
  });
  const ghRun = fakeGhRun({
    "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]), stderr: "" },
    ...ghExtra,
  });
  const agent = makeAgentDouble({
    script: script ?? [JSON.stringify({ clusters })],
  });
  const envPresentDouble = fakeEnvPresent(envPresent);
  const tempDir = fakeMakeTempDir("/tmp/pdlc-consolidation-T22");

  return {
    fs,
    git,
    ghRun,
    agent,
    envPresentDouble,
    tempDir,
    seams: {
      ...fs.injections(),
      _git: git._git,
      _ghRun: ghRun._ghRun,
      _agent: agent,
      _envPresent: envPresentDouble._envPresent,
      _makeTempDir: tempDir._makeTempDir,
      _now: fakeNow,
      direct: true,
    },
  };
}

// Every double's accumulated text, concatenated, for T31's non-disclosure
// sweep — every write, every append, every git argv element, every `gh`
// command string, and every agent prompt/reply, joined into one haystack a
// single substring search can range over.
function accumulatedText({ fs, git, ghRun, agent }) {
  return [
    ...fs.writes.map((w) => `${w.path}\n${w.contents}`),
    ...fs.appends.map((a) => `${a.path}\n${a.text}`),
    ...git.calls.map((argv) => JSON.stringify(argv)),
    ...ghRun.calls.map((c) => JSON.stringify(c)),
    ...agent.calls.map((c) => JSON.stringify(c)),
  ].join("\n");
}

// ─── T30 AT-K1 … AT-K7 ──────────────────────────────────────────────────────

describe("T30 resolution order: §9.2's credential ladder over _envPresent / gh auth status / absent", () => {
  describe("credential: present / local-gh / absent, and the fail-closed direction", () => {
    test("AT-K1: no credentialEnv variable, working local gh auth ⇒ credential: local-gh, PR route attempted", async () => {
      const { seams, ghRun } = buildPromotableSeams({
        envPresent: new Set(),
        ghExtra: {
          "gh auth status": { ok: true, stdout: "Logged in to github.com as pdlc-bot", stderr: "" },
          "gh pr create": { ok: true, stdout: "https://github.com/example/repo/pull/1\n", stderr: "" },
        },
      });

      const result = await main(seams);

      expect(result.credential).toBe("local-gh");
      // "the PR route is attempted" — the auth probe AND the create call
      // both actually fired, not merely eligible to.
      expect(ghRun.calls.some((c) => /^gh auth status\b/.test(String(c)))).toBe(true);
      expect(ghRun.calls.some((c) => /^gh pr create\b/.test(String(c)))).toBe(true);
    });

    test("AT-K2: neither a credential variable nor gh auth ⇒ absent, credential-unavailable, §6.3 fallback, no halt", async () => {
      const { seams } = buildPromotableSeams({
        envPresent: new Set(),
        // "gh auth status" deliberately unscripted: fakeGhRun's own
        // fail-closed default (`{ok:false, stderr:"no fixture..."}`)
        // stands in for "no working local gh auth" (TSPEC §9.2).
      });

      const result = await main(seams);

      expect(result.credential).toBe("absent");
      expect(result.reasons.has("credential-unavailable")).toBe(true);
      // §6.3's fallback (the proposal-file route) fires rather than a halt:
      // the pass reaches a legal terminal status, never throws.
      expect(["promoted-degraded", "no-op"]).toContain(result.status);
    });

    test("AT-K3: a pass that promoted nothing else and degraded its only promotion ends no-op, never a bare promoted", async () => {
      const { seams } = buildPromotableSeams({ envPresent: new Set() });

      const result = await main(seams);

      expect(result.status).toBe("no-op");
      expect(result.status).not.toBe("promoted");
    });

    test("AT-K4: a credential present but rejected by the repository ⇒ present (redacted) AND credential-unavailable, never collapsed", async () => {
      const { seams } = buildPromotableSeams({
        envPresent: new Set([CREDENTIAL_ENV]),
        ghExtra: {
          // §7.2's resolution order checks the variable first — present ⇒
          // `gh auth status` is never consulted at all — and the rejection
          // is observed only at the push/create attempt (§10.3 row 10).
          "gh pr create": { ok: false, stdout: "", stderr: "HTTP 401: Bad credentials" },
        },
      });

      const result = await main(seams);

      expect(result.credential).toBe("present (redacted)");
      expect(result.reasons.has("credential-unavailable")).toBe(true);
    });
  });

  // FSPEC §10.3's third reading (BR-41a): `credential: absent` is read by an
  // OBSERVABLE — whether `credential-unavailable` rides with it, and, for a
  // `failed` row, by the report body — never by `status:` alone. Six rows,
  // spanning every shape the reading admits.
  describe("AT-K6: credential: absent, read by observable across all six row shapes (BR-41a)", () => {
    test("(i) refused at step 6 (marker held) ⇒ absent, not attempted, no credential-unavailable", async () => {
      const { seams, fs } = buildPromotableSeams({ envPresent: new Set() });
      // A fresh, held marker (§7.3's `refuse` arm) — the pass never reaches
      // step 6's PR-route attempt at all.
      fs.files["docs/_decisions/.consolidation-lock"] = "IN-PROGRESS: other-pass 2099-01-01T00:00:00.000Z";

      const result = await main(seams);

      expect(result.status).toBe("refused");
      expect(result.credential).toBe("absent");
      expect(result.reasons.has("credential-unavailable")).toBe(false);
    });

    test("(ii) no-op/promoted pass whose proposals are all consuming-repo ⇒ absent, not attempted, no PR route", async () => {
      // A consuming-repo-only promotion (process learning / AC-2.2 target,
      // TSPEC §7.4) never reaches §6's routeOf("PR") arm, so §9.2's
      // resolution never runs regardless of what _envPresent/_ghRun answer.
      const { seams, ghRun } = buildPromotableSeams({ envPresent: new Set(), clusters: [CONSUMING_CLUSTER] });

      const result = await main(seams);

      expect(result.credential).toBe("absent");
      // Whichever terminal status this shape lands on, the observable is
      // "not attempted": no auth probe, no create call.
      expect(ghRun.calls.some((c) => /^gh (auth status|pr create)\b/.test(String(c)))).toBe(false);
      expect(result.reasons.has("credential-unavailable")).toBe(false);
    });

    test("(iii) failed at step 8 (no rung resolves), never reached a PR-route attempt ⇒ absent, no code", async () => {
      const { seams } = buildPromotableSeams({ envPresent: new Set() });
      seams._agent = makeAgentDouble({
        script: ['unrecognised model alias "fable"', 'unrecognised model alias "opus"'],
        throwOn: new Set([0, 1]),
      });

      const result = await main(seams);

      expect(result.status).toBe("failed");
      expect(result.reasons.has("advisory-model-unresolved")).toBe(true);
      expect(result.credential).toBe("absent");
      expect(result.reasons.has("credential-unavailable")).toBe(false);
    });

    test("(iv) failed at step 12/13, DID attempt the PR route and resolved nothing ⇒ absent, no code on the row, report body names it", async () => {
      // A guard-set promotion WITHOUT a diff: the PR route is entered (the
      // clone is opened, the branch cut) and the per-edit authoring dispatch
      // (§9.2) fires — and fails with a row-4 dispatch error (S-11c) BEFORE
      // §9.2's credential resolution ever runs, so the pass terminates
      // `failed` having attempted the route and resolved nothing.
      const { seams } = buildPromotableSeams({
        envPresent: new Set(),
        clusters: [{ ...GUARD_CLUSTER, diff: undefined }],
        script: [JSON.stringify({ clusters: [{ ...GUARD_CLUSTER, diff: undefined }] }), "dispatch failed: network error"],
      });
      seams._agent = makeAgentDouble({
        script: [JSON.stringify({ clusters: [{ ...GUARD_CLUSTER, diff: undefined }] }), "dispatch failed: network error"],
        throwOn: new Set([1]),
      });

      const result = await main(seams);

      expect(result.status).toBe("failed");
      expect(result.reasons.has("credential-unavailable")).toBe(false);
      expect(result.credential).toBe("absent");
    });

    test("(v) failed at step 8, NEVER attempted the PR route ⇒ absent, no code, report body does not name it", async () => {
      const { seams } = buildPromotableSeams({ envPresent: new Set() });
      // The clustering dispatch (step 8) itself fails after resolving a rung,
      // terminating the pass before any routing decision exists.
      seams._agent = makeAgentDouble({
        script: ["dispatch failed: network error"],
        throwOn: new Set([0]),
      });

      const result = await main(seams);

      expect(result.status).toBe("failed");
      expect(result.reasons.has("credential-unavailable")).toBe(false);
      expect(result.credential).toBe("absent");
    });

    test("(vi) AT-K2's genuine finding on a promoted-degraded row ⇒ absent, WITH credential-unavailable, attempted-and-found-nothing", async () => {
      const { seams } = buildPromotableSeams({ envPresent: new Set() });

      const result = await main(seams);

      expect(result.credential).toBe("absent");
      expect(result.reasons.has("credential-unavailable")).toBe(true);
    });
  });

  test("AT-K7: >=2 promotions, exactly one hits a §6.3 failure class ⇒ promoted-degraded, never promoted or no-op", async () => {
    // Two promotions on different routes: the consuming-repo one enacts in the
    // invoking tree, while the guard-set one's push is rejected — the head
    // branch already exists remotely (§10.3 row 11), a failure class distinct
    // from AT-K1..AT-K4's credential rows, deliberately, since §9.2 resolves
    // credential AT MOST ONCE per pass and this row exists to prove partial
    // success, not to re-test resolution.
    const { seams } = buildPromotableSeams({
      envPresent: new Set(),
      paths: [LEARNINGS_PATH, SECOND_LEARNINGS_PATH],
      clusters: [CONSUMING_CLUSTER, GUARD_CLUSTER],
      ghExtra: {
        "gh auth status": { ok: true, stdout: "Logged in to github.com as pdlc-bot", stderr: "" },
      },
      gitExtra: {
        push: {
          ok: false,
          stdout: "",
          stderr: "! [rejected]        consolidation/x -> consolidation/x (already exists)",
        },
      },
    });

    const result = await main(seams);

    expect(result.status).toBe("promoted-degraded");
    expect(result.status).not.toBe("promoted");
    expect(result.status).not.toBe("no-op");
    expect(result.reasons.has("branch-exists")).toBe(true);
  });
});

// ─── T31 AT-K5 — non-disclosure ─────────────────────────────────────────────

describe("T31 non-disclosure: the credential value reaches no log, artifact, PR body or report field (NFR-2, §7.4)", () => {
  describe("AT-K5: on every path, the value appears in none of them, and the row carries exactly one credential: value", () => {
    // NFR-2 / FSPEC §7.4 is honoured **structurally, outbound** (TSPEC §5.3):
    // `_envPresent` returns a boolean, never the value, so `SECRET_VALUE`
    // above is never actually handed to any seam these doubles wrap — this
    // sweep is the falsifier that would catch a regression that started
    // threading it through anyway (e.g. a future edit that read the value
    // via a different seam "for convenience" and logged it).
    test("credential: local-gh — no double's accumulated text contains SECRET_VALUE, and exactly one credential: value is recorded", async () => {
      const doubles = buildPromotableSeams({
        envPresent: new Set(),
        ghExtra: {
          "gh auth status": { ok: true, stdout: "Logged in to github.com as pdlc-bot", stderr: "" },
          "gh pr create": { ok: true, stdout: "https://github.com/example/repo/pull/1\n", stderr: "" },
        },
      });

      const result = await main(doubles.seams);

      expect(accumulatedText(doubles)).not.toContain(SECRET_VALUE);
      expect(new Set(["present (redacted)", "absent", "local-gh"]).has(result.credential)).toBe(true);
    });

    test("credential: present (redacted) — the literal env var value never appears, even though _envPresent answered true", async () => {
      const doubles = buildPromotableSeams({
        envPresent: new Set([CREDENTIAL_ENV]),
        ghExtra: {
          "gh pr create": { ok: true, stdout: "https://github.com/example/repo/pull/1\n", stderr: "" },
        },
      });

      const result = await main(doubles.seams);

      expect(result.credential).toBe("present (redacted)");
      // The seam is boolean-only (TSPEC §5.3) — this asserts the module
      // never had the value to leak, not merely that it chose not to.
      expect(doubles.envPresentDouble.calls).toEqual([CREDENTIAL_ENV]);
      expect(accumulatedText(doubles)).not.toContain(SECRET_VALUE);
      // The row carries exactly one `credential:` reading, never both the
      // redacted marker and a second value for the same pass.
      expect(result.credential).not.toBe("local-gh");
      expect(result.credential).not.toBe("absent");
    });

    test("credential: absent — the fallback probe's own reply never leaks into the report body or any write", async () => {
      const doubles = buildPromotableSeams({
        envPresent: new Set(),
        ghExtra: {
          "gh auth status": { ok: false, stdout: "", stderr: `not logged in; try GH_TOKEN=${SECRET_VALUE}` },
        },
      });

      const result = await main(doubles.seams);

      expect(result.credential).toBe("absent");
      // A `stderr` echoing an operator's own hint containing the secret
      // shape must not survive into any accumulated write either — the
      // module never forwards a `_ghRun` reply's raw text into a report
      // field for this call (distinguished from row 10's `stderr`
      // surfacing, TSPEC §10.3, which applies to failed pushes/creates —
      // never to the auth probe).
      expect(accumulatedText(doubles)).not.toContain(SECRET_VALUE);
    });
  });
});
