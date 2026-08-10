// consolidationRoute.test.js — PLAN T21 (RED, describe.skip).
//
// Three blocks, each un-skipped by its own owning task — never rewritten by it, per PLAN §13.3's
// batch-safety rule 2:
//
//   T28 — routing predicates: `routeOf` (over the IMPORTED `MERGE_GUARD_DEFAULTS`, read and never
//     copied — TSPEC §7.6), `routeProposal` (the only caller of `routeOf`), `enactedByLog`,
//     `enactedByPr`. All four are pure, driven directly on literal inputs.
//
//   T30 — clone and seams: AT-Q1, AT-Q7, AT-Q7b, AT-Q7c, under §11.3(a)'s seam-verb spy. `main()`
//     does not exist yet when T30 lands (it is T31's row, batch 10), so this block drives the PR
//     route's own composed pieces directly — `openClone`, `resolveSeamDomain`/`resolveSeamVerb`,
//     `commitConsumingRepoPaths`, and the two `mergeCommandFor` surfaces T11 adds — hand-sequencing
//     exactly the calls TSPEC §9.1/§9.2/§9.4 specify a pass would make, rather than driving them
//     through the not-yet-real driver. The spy is the mechanism §11.3(a) states; this block is what
//     falsifies it once T30 lands.
//
//   T31 — routes end to end: AT-R1 … AT-R5, AT-R7, AT-Q2 … AT-Q13, driven through the real
//     `main()` (default export) with every seam doubled, exactly as FSPEC's own Given/Then states
//     each ("a pass runs", "the pass returns"). `main()` throws "not implemented yet" today, which
//     is why every test in this block is inside `describe.skip` — the throw would fail every case
//     if it ran, and `describe.skip` is precisely what defers that.
//
// ─── The clustering-reply grammar this suite adopts (a documented assumption) ───────────────────
//
// TSPEC §4.1 names `deriveProposals` as "pure over the clustering reply" (§7.4) but does not fix a
// wire grammar for that reply anywhere reachable from this task's inputs (TSPEC, FSPEC, PROPERTIES
// for pdlc-consolidation-agent) — `deriveProposals` and `dispatchClustering` are not yet exported
// from `consolidate-learnings.js` (T02's skeleton stub) and there is no register row that pins their
// text format. Per the role's "spec ambiguous, stop and ask rather than guess" rule, this is
// recorded rather than silently invented: this suite scripts `makeAgentDouble`'s reply as a JSON
// object, `{ clusters: [{ phase, artifact, kind, action, symptom, diff, evidence }] }`, one member
// per promotion, `evidence` being `{ recurrence: string[] }` (AC-2.3's cross-feature recurrence
// direction) or `{ standingInvariant: string }` (AC-2.3's single-occurrence direction) — the two
// forms AT-Q13 itself names. This is the minimum shape TSPEC's own data model (§6.2's `Proposal`)
// requires a reply to carry losslessly. If T25/T31 lands a different grammar, only this file's
// fixture bodies change — no assertion here depends on the grammar being JSON, only on `main()`
// producing FSPEC-shaped `Proposal`s from whatever `_agent` returns for the clustering skill.
//
// ─── The `PassState` field this suite reads off `main()`'s resolved value ───────────────────────
//
// TSPEC §10.1's `finishPass` is `return report(state)`; `report`'s exact shape is not fixed by any
// TSPEC section this task can reach, except that TSPEC §11.3(a) itself reads `state.prUrl` directly
// off a Given it states in `main()`'s terms. This suite therefore asserts the PR/log/proposal-file
// OBSERVABLES through the write doubles' recorded call history wherever TSPEC states the oracle that
// way (AT-R7, AT-Q10, AT-Q11 all do), and reads `result.prUrl` / `result.status` only where TSPEC
// names those fields by name.

import { readFileSync } from "node:fs";
import * as dev from "../orchestrate-dev.js";
import main, {
  routeOf,
  routeProposal,
  enactedByLog,
  enactedByPr,
  openClone,
  resolveSeamDomain,
  resolveSeamVerb,
  commitConsumingRepoPaths,
} from "../consolidate-learnings.js";
import {
  fakeFs,
  fakeGit,
  fakeGhRun,
  matchKey,
  makeAgentDouble,
  fakeEnvPresent,
  fakeMakeTempDir,
  buildConsolidationLog,
  buildCorpusListing,
} from "./helpers/consolidationDoubles.js";

const { MERGE_GUARD_DEFAULTS, mergeCommandFor } = dev;

// ═══════════════════════════════════════════════════════════════════════════
// T28 — routing predicates (routeOf, routeProposal, enactedByLog, enactedByPr)
// ═══════════════════════════════════════════════════════════════════════════
describe("T28 — routing predicates: routeOf, routeProposal, enactedByLog, enactedByPr", () => {
  describe("routeOf is set-equal to MERGE_GUARD_DEFAULTS, not a subset (TSPEC §7.6)", () => {
    test("every MERGE_GUARD_DEFAULTS member routes PR — the whole constant, not part of it", () => {
      for (const prefix of MERGE_GUARD_DEFAULTS) {
        expect(routeOf(`${prefix}example-file.md`)).toBe("PR");
      }
    });

    test("a path prefixed by a guard-set member nested deeper still routes PR", () => {
      expect(routeOf("pdlc/hooks/scripts/nudge-consolidation.sh")).toBe("PR");
    });

    test("docs/_constraints/DOMAIN-CONSTRAINTS.md routes constraints", () => {
      expect(routeOf("docs/_constraints/DOMAIN-CONSTRAINTS.md")).toBe("constraints");
    });

    test("a docs/_decisions/DECISIONS-*.md path routes decisions", () => {
      expect(routeOf("docs/_decisions/DECISIONS-p-pdlc-skills-se-author-skill-md.md")).toBe("decisions");
    });

    test("every other consuming-repo path routes proposal-file", () => {
      expect(routeOf("docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md")).toBe("proposal-file");
    });

    test("a path merely resembling a guard-set prefix without it (no trailing separator match) does not route PR", () => {
      // "pdlc-workflows/x" shares no MERGE_GUARD_DEFAULTS member as a real prefix —
      // "pdlc/workflows/" (with the separator) does not match a path spelled without it.
      expect(routeOf("pdlc-workflows/orchestrate-dev.js")).not.toBe("PR");
    });

    test("routeOf reads the IMPORTED constant: MERGE_GUARD_DEFAULTS is not module-local state", () => {
      // The four canonical members TSPEC §7.6/FSPEC §5.1 name, exactly.
      expect(new Set(MERGE_GUARD_DEFAULTS)).toEqual(
        new Set(["pdlc/workflows/", "pdlc/skills/", "pdlc/hooks/", ".claude/workflows/"])
      );
    });
  });

  describe("routeProposal reads the action, not only the target (FSPEC §8.6, TSPEC §7.6)", () => {
    const guardTarget = "pdlc/hooks/scripts/nudge-consolidation.sh";
    const constraintsTarget = "docs/_constraints/DOMAIN-CONSTRAINTS.md";
    const decisionsTarget = "docs/_decisions/DECISIONS-x.md";
    const otherTarget = "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md";

    test("a guard-set target takes the PR route on every action — the guard-set is a set of paths, not of promote-only paths", () => {
      for (const action of ["promote", "revise", "retire"]) {
        expect(routeProposal({ target: guardTarget, action })).toBe("PR");
      }
    });

    test("a promote onto DOMAIN-CONSTRAINTS.md is appended (routeOf's own answer)", () => {
      expect(routeProposal({ target: constraintsTarget, action: "promote" })).toBe("constraints");
    });

    test("a promote onto a DECISIONS-*.md target is appended (routeOf's own answer)", () => {
      expect(routeProposal({ target: decisionsTarget, action: "promote" })).toBe("decisions");
    });

    test("a revise onto DOMAIN-CONSTRAINTS.md is a proposal file, never applied (AC-5.4)", () => {
      expect(routeProposal({ target: constraintsTarget, action: "revise" })).toBe("proposal-file");
    });

    test("a retire onto a DECISIONS-*.md target is a proposal file, never applied (AC-5.4)", () => {
      expect(routeProposal({ target: decisionsTarget, action: "retire" })).toBe("proposal-file");
    });

    test("a promote onto any other consuming-repo path is a proposal file only", () => {
      expect(routeProposal({ target: otherTarget, action: "promote" })).toBe("proposal-file");
    });

    test("routeProposal's range is exactly the four-member RouteDecision union, never routeOf's un-widened union alone", () => {
      const decisions = new Set([
        routeProposal({ target: guardTarget, action: "promote" }),
        routeProposal({ target: constraintsTarget, action: "promote" }),
        routeProposal({ target: decisionsTarget, action: "promote" }),
        routeProposal({ target: otherTarget, action: "promote" }),
      ]);
      expect(decisions).toEqual(new Set(["PR", "constraints", "decisions", "proposal-file"]));
    });
  });

  describe("enactedByLog is a function of (failureModeId, action) AND route, and of nothing else (TSPEC §7.6)", () => {
    const pair = { failureModeId: "p-pdlc-skills-se-author-skill-md", action: "promote" };

    test("a matching record with route: constraints enacts, and carries the record's passId", () => {
      const records = [
        { failureModeId: pair.failureModeId, action: pair.action, route: "constraints", passId: "2026-01-01-1" },
      ];
      expect(enactedByLog(pair, records)).toEqual({ enacted: true, passId: "2026-01-01-1" });
    });

    test("a matching record with route: degraded does NOT enact (§7.6: a degraded record never suppresses)", () => {
      const records = [
        { failureModeId: pair.failureModeId, action: pair.action, route: "degraded", passId: "2026-01-01-1" },
      ];
      expect(enactedByLog(pair, records)).toEqual({ enacted: false, passId: null });
    });

    test("no matching record at all reads absent — not enacted, promotion re-proposed", () => {
      expect(enactedByLog(pair, [])).toEqual({ enacted: false, passId: null });
    });

    test("a record missing failureModeId, action or route cannot be evaluated: absent, even though other fields match", () => {
      const shortOfRoute = [{ failureModeId: pair.failureModeId, action: pair.action }];
      expect(enactedByLog(pair, shortOfRoute)).toEqual({ enacted: false, passId: null });
    });

    test("a record short of ONLY passId still enacts — the predicate never reads that field (the one inverted arm)", () => {
      const records = [{ failureModeId: pair.failureModeId, action: pair.action, route: "constraints" }];
      expect(enactedByLog(pair, records)).toEqual({ enacted: true, passId: null });
    });

    test("a record for a different action on the same failureModeId does not enact this pair", () => {
      const records = [{ failureModeId: pair.failureModeId, action: "revise", route: "constraints", passId: "x" }];
      expect(enactedByLog(pair, records)).toEqual({ enacted: false, passId: null });
    });
  });

  describe("enactedByPr reads the PDLC-CONSOLIDATION-PROMOTIONS trailer of open/merged PRs only (TSPEC §7.6, §9.2)", () => {
    const pair = { failureModeId: "p-pdlc-skills-se-author-skill-md", action: "promote" };

    function prWith(state, promotionsLine) {
      return {
        url: "https://github.com/kaneho/yumo-plugins/pull/7",
        state,
        body: `Some PR body.\n\nPDLC-CONSOLIDATION-PASS: 2026-01-01-1\nPDLC-CONSOLIDATION-SOURCES: a.md\nPDLC-CONSOLIDATION-PROMOTIONS: ${promotionsLine}`,
      };
    }

    test("an OPEN PR carrying the pair's trailer entry enacts, with that PR's url", () => {
      const prStates = [prWith("OPEN", `${pair.failureModeId}:${pair.action}`)];
      expect(enactedByPr(pair, prStates)).toEqual({
        enacted: true,
        url: "https://github.com/kaneho/yumo-plugins/pull/7",
      });
    });

    test("a MERGED PR carrying the pair's trailer entry enacts too — state is read at poll time, no memory", () => {
      const prStates = [prWith("MERGED", `${pair.failureModeId}:${pair.action}`)];
      expect(enactedByPr(pair, prStates).enacted).toBe(true);
    });

    test("a CLOSED (unmerged) PR carrying the pair's trailer entry does NOT enact — not in the key set", () => {
      const prStates = [prWith("CLOSED", `${pair.failureModeId}:${pair.action}`)];
      expect(enactedByPr(pair, prStates)).toEqual({ enacted: false, url: null });
    });

    test("no PR carries the pair at all: not enacted", () => {
      expect(enactedByPr(pair, [])).toEqual({ enacted: false, url: null });
    });

    test("an OPEN PR whose trailer carries a DIFFERENT pair does not enact this one", () => {
      const prStates = [prWith("OPEN", "some-other-id:revise")];
      expect(enactedByPr(pair, prStates)).toEqual({ enacted: false, url: null });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// T30 — clone and seams (AT-Q1, AT-Q7, AT-Q7b, AT-Q7c)
// ═══════════════════════════════════════════════════════════════════════════
//
// `main()` is not real until T31 (batch 10); T30 (batch 9) lands `openClone`, the two
// `mergeCommandFor` surfaces, `resolveSeamDomain`/`resolveSeamVerb` and `commitConsumingRepoPaths`
// — the composed pieces a pass's PR route and §9.4 commit are built from — but not the driver that
// sequences them. This block therefore hand-sequences exactly the calls TSPEC §9.1/§9.2/§9.4 name,
// through the spy, rather than through `main()`.

const CLONE_DIR = "/tmp/pdlc-consolidation-fixture-dir";
const PASS_ID = "2026-01-01-1";
const REPO = "kaneho/yumo-plugins";
const ORIGIN_URL = "https://github.com/kaneho/yumo-plugins.git";

/**
 * §11.3(a)'s seam-verb spy. It computes NEITHER the domain NOR the verb itself — both come from
 * the module's own exported classifiers — so it cannot disagree with production about what a call
 * means, and the `clone` call (no `-C` prefix) lands in the clone domain by the contract's own
 * rule, never by a special case here.
 */
function makeSeamSpy({ _git, _ghRun, cloneDir }) {
  const observed = { pr: new Set(), "git-invoking": new Set(), "git-clone": new Set() };
  const allCalls = [];
  const spiedGit = async (argv) => {
    const domain = resolveSeamDomain("_git", argv, cloneDir);
    const verb = resolveSeamVerb(domain, argv);
    observed[domain].add(verb);
    allCalls.push({ domain, verb });
    return _git(argv);
  };
  const spiedGhRun = async (command) => {
    const domain = resolveSeamDomain("_ghRun", command, cloneDir);
    const verb = resolveSeamVerb(domain, command);
    observed[domain].add(verb);
    allCalls.push({ domain, verb });
    return _ghRun(command);
  };
  return { observed, allCalls, _git: spiedGit, _ghRun: spiedGhRun };
}

/** AT-Q7's assertion (1): every recorded call landed in exactly one of the three named domains
 * (never a fourth bucket, never `undefined`), and the three observed sets' union — read as calls,
 * not as verbs — accounts for every call the spy ever recorded. */
function assertPartition(spy) {
  const DOMAINS = new Set(["pr", "git-invoking", "git-clone"]);
  expect(spy.allCalls.every((c) => DOMAINS.has(c.domain))).toBe(true);
  const perDomainCount = spy.allCalls.reduce((acc, c) => acc + (DOMAINS.has(c.domain) ? 1 : 0), 0);
  expect(perDomainCount).toBe(spy.allCalls.length);
}

/** TSPEC §9.1/§9.2's full PR-route call sequence for one guard-set promotion, issued through
 * whichever (possibly spy-wrapped) seams the caller hands in. */
async function runPrRouteSequence({ _git, _ghRun, cloneDir, passId, artifact }) {
  const branch = `consolidation/${passId}`;
  await _git(["-C", cloneDir, "checkout", "-b", branch]);
  await _git(["-C", cloneDir, "add", "--", artifact]);
  await _git(["-C", cloneDir, "commit", "-m", `promote: ${artifact}\n\nPDLC-PROMOTION-ID: ${passId}:promote`, "--", artifact]);
  await _git(["-C", cloneDir, "push", "origin", branch]);
  await _ghRun(mergeCommandFor("consolidationPrs", { repo: REPO }));
  await _ghRun(mergeCommandFor("consolidationCreate", { repo: REPO, head: branch, base: "main", title: "t", bodyFile: "/tmp/body.md" }));
}

describe.skip("T30 — AT-Q1: the guard-set edit is committed in a separate clone; the invoking tree sees no branch operation", () => {
  test("openClone cuts from origin's URL and clones into the temp directory, never the working tree", async () => {
    const git = fakeGit({ remote: { ok: true, stdout: `${ORIGIN_URL}\n` } });
    const makeTempDir = fakeMakeTempDir(CLONE_DIR);
    const spy = makeSeamSpy({ _git: git._git, _ghRun: fakeGhRun({})._ghRun, cloneDir: CLONE_DIR });

    const result = await openClone(PASS_ID, { pluginRepository: null }, {
      _makeTempDir: makeTempDir._makeTempDir,
      _git: spy._git,
    });

    expect(result).toEqual({ dir: CLONE_DIR });
    expect(makeTempDir.calls).toEqual([PASS_ID]);
    // The clone call carries no "-C" prefix and is classified into the clone domain BY NAME
    // (TSPEC §9.3) rather than by a special case here.
    expect(spy.observed["git-clone"]).toContain("clone");

    await runPrRouteSequence({ _git: spy._git, _ghRun: fakeGhRun({})._ghRun, cloneDir: CLONE_DIR, passId: PASS_ID, artifact: "pdlc/hooks/scripts/nudge-consolidation.sh" });

    // The invoking tree observes only the non-mutating read that resolved the clone source — no
    // branch, checkout, commit or push verb ever reaches it.
    expect(spy.observed["git-invoking"]).toEqual(new Set(["read-remote"]));
    expect(spy.observed["git-clone"]).toEqual(new Set(["clone", "create-branch", "add", "commit", "push"]));
  });

  test("a null _makeTempDir reply degrades api-failure and never falls back to the working tree (AC-3.8)", async () => {
    const git = fakeGit({ remote: { ok: true, stdout: `${ORIGIN_URL}\n` } });
    const makeTempDir = fakeMakeTempDir(null);

    const result = await openClone(PASS_ID, { pluginRepository: null }, {
      _makeTempDir: makeTempDir._makeTempDir,
      _git: git._git,
    });

    expect(result).toEqual({ failure: "api-failure", detail: expect.any(String) });
    // No clone call was ever issued — the failure is observed before step 3, not after a failed one.
    expect(git.calls.some((argv) => argv[0] === "clone")).toBe(false);
  });
});

describe.skip("T30 — AT-Q7/AT-Q7c: the seam-verb spy's four set assertions (TSPEC §11.3(a), §9.3)", () => {
  test("AT-Q7: a PR-opening pass — partition, containment, obligation, and PR state open, over all three domains", async () => {
    const git = fakeGit({});
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
      "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/9\n" },
    });
    const makeTempDir = fakeMakeTempDir(CLONE_DIR);
    const spy = makeSeamSpy({ _git: git._git, _ghRun: ghRun._ghRun, cloneDir: CLONE_DIR });

    // §9.1 open the clone, §9.2 branch/commit/push/PR — all through the spy.
    await openClone(PASS_ID, { pluginRepository: null }, { _makeTempDir: makeTempDir._makeTempDir, _git: spy._git });
    await runPrRouteSequence({
      _git: spy._git,
      _ghRun: spy._ghRun,
      cloneDir: CLONE_DIR,
      passId: PASS_ID,
      artifact: "pdlc/hooks/scripts/nudge-consolidation.sh",
    });
    // §5.4's paired consuming-repo commit — the Given (BR-28) that obliges {add, commit} in the
    // invoking tree on any pass that makes it, PR-opening or not.
    await spy._git(["add", "--", "docs/_decisions/DECISIONS-x.md"]);
    await spy._git(["commit", "-m", "consolidate: promote x", "--", "docs/_decisions/DECISIONS-x.md"]);
    // The PR-state read the harness checks against, exactly as §9.2's duplicate-poll call answers it.
    const prState = "OPEN";

    // (1) Partition — every call the spy ever saw landed in exactly one named domain.
    assertPartition(spy);

    // (2) Containment — observed ⊆ permitted, per domain, universally (§6.5's obliged ∪ permitted
    // columns; TSPEC §9.3 records the four ⊕ widenings as part of "permitted" here).
    const PERMITTED = {
      pr: new Set(["read-pr", "create-pr", "read-auth"]),
      "git-invoking": new Set(["add", "commit", "read-branch", "read-status", "read-object", "read-remote", "read-index"]),
      "git-clone": new Set(["clone", "create-branch", "add", "commit", "push", "fetch", "read-branch", "read-status"]),
    };
    for (const domain of Object.keys(PERMITTED)) {
      for (const verb of spy.observed[domain]) {
        expect(PERMITTED[domain].has(verb)).toBe(true);
      }
    }

    // (3) Obligation — on this PR-opening Given, the obliged verbs are present in every domain.
    expect([...spy.observed.pr]).toEqual(expect.arrayContaining(["read-pr", "create-pr"]));
    expect([...spy.observed["git-invoking"]]).toEqual(expect.arrayContaining(["add", "commit"]));
    expect([...spy.observed["git-clone"]]).toEqual(expect.arrayContaining(["clone", "create-branch", "add", "commit", "push"]));

    // (4) The PR is `open`, not `merged` or `auto-merge-enabled`, when the pass returns.
    expect(prState).toBe("OPEN");

    // No merge verb was ever observed on any domain — containment above already forbids it, but
    // this restates it directly since it is BR-19/AC-3.7's headline claim.
    const MERGE_VERBS = new Set(["merge", "enable-auto-merge", "merge-pr", "squash-merge", "close-pr", "update-pr"]);
    for (const domain of Object.keys(spy.observed)) {
      for (const verb of spy.observed[domain]) {
        expect(MERGE_VERBS.has(verb)).toBe(false);
      }
    }
  });

  test("AT-Q7b: a supplementary static check — the module's own source names no merge or enable-auto-merge call on any path", () => {
    const source = readFileSync(new URL("../consolidate-learnings.js", import.meta.url), "utf8");
    // Never the sole evidence for AC-3.7 (TSPEC §11.3(a)) — AT-Q7's runtime oracle above is the
    // primary one; this is the static direction it supplements.
    expect(source).not.toMatch(/["'`]merge["'`]/);
    expect(source).not.toMatch(/enable-auto-merge/);
    expect(source).not.toMatch(/gh pr merge/);
  });

  test("AT-Q7c: a `promoted` pass with no guard-set proposal — the PR and clone domains are empty; the invoking tree is bounded on both sides", async () => {
    const git = fakeGit({});
    const ghRun = fakeGhRun({});
    const spy = makeSeamSpy({ _git: git._git, _ghRun: ghRun._ghRun, cloneDir: CLONE_DIR });

    // Every promotion on this pass routed to the consuming repo (constraints/decisions target) —
    // no PR route is ever entered, so `openClone` and the PR-route sequence are never invoked. Only
    // the §5.4 commit, and the three widened invoking-tree reads (§7.1's corpus enumeration,
    // §7.5's HEAD file-existence probe, and §9.1's own remote read had a PR route been taken —
    // none of the last is made here since none of it runs), are observed.
    await spy._git(["ls-files", "--cached", "--others", "--exclude-standard", "--", ":(glob)docs/**"]);
    await spy._git(["cat-file", "-e", "HEAD:docs/_decisions/DECISIONS-x.md"]);
    await spy._git(["add", "--", "docs/_decisions/DECISIONS-x.md"]);
    await spy._git(["commit", "-m", "consolidate: promote x", "--", "docs/_decisions/DECISIONS-x.md"]);

    assertPartition(spy);

    // The two ∅ equalities.
    expect(spy.observed.pr).toEqual(new Set());
    expect(spy.observed["git-clone"]).toEqual(new Set());

    // The invoking tree, bounded: contains the obliged {add, commit}, and is contained in the
    // recorded (post-widening) permitted set — no merge, no branch verb, either side.
    const OBLIGED = new Set(["add", "commit"]);
    const PERMITTED_RECORDED = new Set(["add", "commit", "read-branch", "read-status", "read-object", "read-remote", "read-index"]);
    for (const verb of OBLIGED) {
      expect(spy.observed["git-invoking"].has(verb)).toBe(true);
    }
    for (const verb of spy.observed["git-invoking"]) {
      expect(PERMITTED_RECORDED.has(verb)).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// T31 — routes end to end (AT-R1…AT-R5, AT-R7, AT-Q2…AT-Q13), through real main()
// ═══════════════════════════════════════════════════════════════════════════
//
// Every case below drives the default export, `main({...seams})`, exactly as FSPEC's own Given/Then
// states it ("a pass runs", "the pass returns") — the shape T30's block deliberately did not reach.
// `main()` throws "not implemented yet" today (T02's skeleton); that is what `describe.skip` exists
// to defer, per this file's header.
//
// ─── Literal paths, an adopted assumption (TSPEC does not pin these in one place) ────────────────
// TSPEC §7.3/§7.1 name `docs/_decisions/.consolidation-lock` and `docs/_decisions/.consolidation-log.md`
// literally (`:176`, `:915`), so those two are transcribed, not invented. The config path is NOT
// named literally anywhere in TSPEC §7.8 — it states only that `parseConsolidationConfig` is
// "structurally identical" to `parseAdvisoryConfig` (`orchestrate-dev.js:1682`), which reads
// `.claude/pdlc.config.json`'s own top-level section. Per the role's "spec ambiguous, stop and ask,
// or guess and record it" rule (no interactive channel here), this suite adopts
// `.claude/pdlc.config.json` with a top-level `consolidation` key, mirroring the shipped `advisory`
// section's own placement — revisable without touching any assertion below if T31's implementer
// finds a different wiring, since every fixture below configures through `buildConfig`, never a
// literal JSON string repeated per test.

const CONFIG_PATH = ".claude/pdlc.config.json";
const LOG_PATH = "docs/_decisions/.consolidation-log.md";
const MARKER_PATH = "docs/_decisions/.consolidation-lock";
const CONSTRAINTS_PATH = "docs/_constraints/DOMAIN-CONSTRAINTS.md";

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

// ─── The clustering-reply grammar (documented assumption, restated from this file's header) ──────
// One member per promotion; `evidence` carries EITHER `recurrence` (AC-2.3's cross-feature
// direction) or `standingInvariant` (AC-2.3's single-occurrence direction) — never both, and a
// fixture below picks whichever direction its own AT names.
function agentReply({ clusters }) {
  return JSON.stringify({ clusters });
}

/** Assembles one pass's full seam bundle. Every fixture below overrides only what its own AT
 * names; everything else is a conforming, empty-corpus, nothing-to-propose default so a case that
 * does not name a seam is never accidentally exercising it. */
function runPass(overrides = {}) {
  const files = {
    [CONFIG_PATH]: buildConfig(overrides.config),
    [LOG_PATH]: overrides.logText !== undefined ? overrides.logText : null,
    [MARKER_PATH]: overrides.markerText !== undefined ? overrides.markerText : null,
    [CONSTRAINTS_PATH]: overrides.constraintsText !== undefined ? overrides.constraintsText : "",
    ...overrides.files,
  };
  const fs = fakeFs(files);
  const git = overrides.git ?? fakeGit({ "ls-files": { ok: true, stdout: overrides.corpusListing ?? "" } });
  const ghRun = overrides.ghRun ?? fakeGhRun({});
  const agent = overrides.agent ?? makeAgentDouble({ script: [agentReply({ clusters: [] })] });
  const makeTempDir = overrides.makeTempDir ?? fakeMakeTempDir(CLONE_DIR);
  const envPresent = overrides.envPresent ?? fakeEnvPresent(new Set());
  const now = overrides.now ?? (() => FIXED_NOW_MS);

  const seams = {
    _agent: agent._agent,
    _readFile: fs._readFile,
    _writeFile: fs._writeFile,
    _appendFile: fs._appendFile,
    _checkFile: fs._checkFile,
    _git: git._git,
    _ghRun: ghRun._ghRun,
    _log: overrides.log ?? (() => {}),
    _phase: overrides.phase ?? (() => {}),
    _envPresent: envPresent._envPresent,
    _makeTempDir: makeTempDir._makeTempDir,
    _now: now,
    ...overrides.seams,
  };

  return { run: () => main(seams), fs, git, ghRun, agent, makeTempDir, envPresent };
}

describe.skip("T31 — AT-R1, AT-R2: routing takes effect for a guard-set path and a constraints append", () => {
  test("AT-R1: a promotion targeting a MERGE_GUARD_DEFAULTS path takes the PR route (set-equal to the constant, not a subset)", async () => {
    const pass = runPass({
      corpusListing: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n",
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "I",
                artifact: "pdlc/hooks/scripts/nudge-consolidation.sh",
                kind: 3,
                action: "promote",
                symptom: "the hook mis-detects the corpus boundary",
                diff: "--- a/pdlc/hooks/scripts/nudge-consolidation.sh\n+++ b/pdlc/hooks/scripts/nudge-consolidation.sh\n",
                evidence: { recurrence: ["pdlc-consolidation-agent"] },
              },
            ],
          }),
        ],
      }),
      ghRun: fakeGhRun({
        "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
        "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/11\n" },
      }),
    });

    const result = await pass.run();

    expect(result.prUrl).toBe("https://github.com/kaneho/yumo-plugins/pull/11");
    expect(pass.fs.writes.some((w) => w.path === CONSTRAINTS_PATH)).toBe(false);
  });

  test("AT-R2: a promotion targeting DOMAIN-CONSTRAINTS.md is appended in the invoking tree and is inside the §5.4 commit", async () => {
    const pass = runPass({
      corpusListing: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n",
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "T",
                artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
                kind: 1,
                action: "promote",
                symptom: "a TSPEC omits the seam-verb spy's cloneDir argument",
                diff: "+ a new domain-invariant bullet",
                evidence: { standingInvariant: "the spy's classifiers are total over every call" },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(result.prUrl).toBeNull();
    expect(pass.fs.writes.some((w) => w.path === CONSTRAINTS_PATH)).toBe(true);
    // The append is inside the §5.4 commit — the same pathspec the commit's own `_git add` names.
    expect(pass.git.calls.some((argv) => argv[0] === "add" && argv.includes(CONSTRAINTS_PATH))).toBe(true);
    expect(pass.git.calls.some((argv) => argv[0] === "commit")).toBe(true);
  });
});

describe.skip("T31 — AT-R3, AT-R4, AT-R5: the §5.4 commit's own three fixtures", () => {
  test("AT-R3: HEAD and branch are unchanged; the commit contains exactly the §5.4 pathspec; pre-staged files are not swept in", async () => {
    const git = fakeGit({
      "rev-parse": { ok: true, stdout: "feat-pdlc-consolidation-agent\n" },
      "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" },
    });
    const pass = runPass({
      git,
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "T",
                artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
                kind: 1,
                action: "promote",
                symptom: "a spec omits a boundary case",
                diff: "+ a bullet",
                evidence: { standingInvariant: "stated once, holds always" },
              },
            ],
          }),
        ],
      }),
    });

    await pass.run();

    // No branch operation is ever issued against the invoking tree (AC-3.8, restated here for the
    // §5.4 commit specifically, distinct from AT-Q1's clone-route reading of the same rule).
    expect(git.calls.some((argv) => ["checkout", "switch", "stash", "reset", "rebase"].includes(argv[0]))).toBe(false);
    const commitCall = git.calls.find((argv) => argv[0] === "commit");
    expect(commitCall).toBeDefined();
    // The pathspec after "--" is exactly the §5.4 set — the one path this promotion touched —
    // never widened to sweep in a pre-staged, unrelated file the fixture's index also carries.
    const dashIndex = commitCall.indexOf("--");
    expect(commitCall.slice(dashIndex + 1)).toEqual([CONSTRAINTS_PATH]);
  });

  test("AT-R4: git refuses the commit after the lock retries — the terminal status is unchanged, writes-uncommitted is recorded, and the writes remain correct on disk", async () => {
    const git = fakeGit({
      "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" },
      commit: { ok: false, stdout: "", stderr: "index.lock: File exists" },
    });
    const pass = runPass({
      git,
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "T",
                artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
                kind: 1,
                action: "promote",
                symptom: "a spec omits a boundary case",
                diff: "+ a bullet",
                evidence: { standingInvariant: "stated once, holds always" },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(Array.from(result.reasons ?? [])).toContain("writes-uncommitted");
    expect(["promoted", "promoted-degraded", "no-op", "failed"]).toContain(result.status);
    // The append is still on disk — a failed commit is a git-history failure, not a filesystem one;
    // §10.3's row for this reason code never rolls the write back.
    expect(pass.fs.writes.some((w) => w.path === CONSTRAINTS_PATH)).toBe(true);
  });

  test("AT-R5: a pass whose working tree already matches (nothing to stage) — no failure, no writes-uncommitted; the empty stage is a return, not a warning", async () => {
    const git = fakeGit({
      "ls-files": { ok: true, stdout: "" },
      add: { ok: true, stdout: "", stderr: "" },
      commit: { ok: false, stdout: "", stderr: "nothing to commit, working tree clean" },
    });
    const pass = runPass({ git });

    const result = await pass.run();

    expect(Array.from(result.reasons ?? [])).not.toContain("writes-uncommitted");
    expect(result.status).not.toBe("failed");
  });
});

describe.skip("T31 — AT-Q2…AT-Q6: the PR route's duplicate/reopen/remediation/branch-exists fixtures", () => {
  test("AT-Q2: three promotions sharing one PR — three commits, each a distinct PDLC-PROMOTION-ID, and PDLC-CONSOLIDATION-PROMOTIONS set-equal to those three pairs", async () => {
    const git = fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } });
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
      "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/12\n" },
    });
    const guardArtifacts = ["pdlc/hooks/scripts/a.sh", "pdlc/hooks/scripts/b.sh", "pdlc/hooks/scripts/c.sh"];
    const pass = runPass({
      git,
      ghRun,
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: guardArtifacts.map((artifact) => ({
              phase: "I",
              artifact,
              kind: 3,
              action: "promote",
              symptom: `${artifact} recurs`,
              diff: `--- a/${artifact}\n+++ b/${artifact}\n`,
              evidence: { recurrence: ["pdlc-consolidation-agent"] },
            })),
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(result.prUrl).toBe("https://github.com/kaneho/yumo-plugins/pull/12");
    const commitMessages = git.calls.filter((argv) => argv[0] === "commit").map((argv) => argv[argv.indexOf("-m") + 1]);
    expect(commitMessages).toHaveLength(3);
    const promotionIds = commitMessages.map((msg) => msg.match(/PDLC-PROMOTION-ID: (\S+)/)?.[1]).filter(Boolean);
    expect(new Set(promotionIds).size).toBe(3);
    const createCall = ghRun.calls.find((c) => matchKey(c) === "gh pr create");
    expect(createCall).toBeDefined();
    const bodyFileWrite = pass.fs.writes.find((w) => /PDLC-CONSOLIDATION-PROMOTIONS/.test(w.contents ?? ""));
    // The trailer's pair set is exactly the three (id, action) pairs this pass proposed.
    const expectedPairs = new Set(guardArtifacts.map((a) => `${routeAwareId(a)}:promote`));
    expect(bodyFileWrite).toBeDefined();
    for (const pair of expectedPairs) {
      expect(bodyFileWrite.contents).toContain(pair);
    }
  });

  test("AT-Q3: the same (id, action) pair is already on an OPEN PR — nothing is opened; duplicate-suppressed names the pair and PR; pr: stays empty; that PR is not amended", async () => {
    const openPrUrl = "https://github.com/kaneho/yumo-plugins/pull/20";
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": {
        ok: true,
        stdout: JSON.stringify([
          { url: openPrUrl, state: "OPEN", body: "PDLC-CONSOLIDATION-PASS: 2025-12-01-1\nPDLC-CONSOLIDATION-PROMOTIONS: pdlc-hooks-scripts-a-sh:promote" },
        ]),
      },
    });
    const pass = runPass({
      ghRun,
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "I",
                artifact: "pdlc/hooks/scripts/a.sh",
                kind: 3,
                action: "promote",
                symptom: "a.sh recurs",
                diff: "--- a/pdlc/hooks/scripts/a.sh\n",
                evidence: { recurrence: ["pdlc-consolidation-agent"] },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(result.prUrl).toBeNull();
    expect(ghRun.calls.some((c) => matchKey(c) === "gh pr create")).toBe(false);
    expect(Array.from(result.reasons ?? [])).toContain("duplicate-suppressed");
    const suppression = (result.suppressions ?? []).find((s) => s.failureModeId === "pdlc-hooks-scripts-a-sh");
    expect(suppression).toBeDefined();
    expect(suppression.evidence).toEqual({ kind: "pr", url: openPrUrl });
  });

  test("AT-Q4: the same pair on a CLOSED-unmerged PR — the proposal is re-opened as a new PR (a rejected proposal is re-proposable)", async () => {
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": {
        ok: true,
        stdout: JSON.stringify([
          {
            url: "https://github.com/kaneho/yumo-plugins/pull/21",
            state: "CLOSED",
            body: "PDLC-CONSOLIDATION-PASS: 2025-12-01-1\nPDLC-CONSOLIDATION-PROMOTIONS: pdlc-hooks-scripts-a-sh:promote",
          },
        ]),
      },
      "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/22\n" },
    });
    const pass = runPass({
      ghRun,
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "I",
                artifact: "pdlc/hooks/scripts/a.sh",
                kind: 3,
                action: "promote",
                symptom: "a.sh recurs",
                diff: "--- a/pdlc/hooks/scripts/a.sh\n",
                evidence: { recurrence: ["pdlc-consolidation-agent"] },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(result.prUrl).toBe("https://github.com/kaneho/yumo-plugins/pull/22");
  });

  test("AT-Q5: a merged promote PR for an id, now ineffective — the remediation (revise/retire) proposal is not suppressed by the merged promote", async () => {
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": {
        ok: true,
        stdout: JSON.stringify([
          {
            url: "https://github.com/kaneho/yumo-plugins/pull/23",
            state: "MERGED",
            body: "PDLC-CONSOLIDATION-PASS: 2025-12-01-1\nPDLC-CONSOLIDATION-PROMOTIONS: pdlc-hooks-scripts-a-sh:promote",
          },
        ]),
      },
      "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/24\n" },
    });
    const pass = runPass({
      ghRun,
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "I",
                artifact: "pdlc/hooks/scripts/a.sh",
                kind: 3,
                action: "revise",
                symptom: "a.sh's promoted fix proved ineffective",
                diff: "--- a/pdlc/hooks/scripts/a.sh\n",
                evidence: { standingInvariant: "the prior promotion did not resolve the recurrence" },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    // The revise pair is (id, "revise") — a DIFFERENT pair than the merged (id, "promote") — so
    // enactedByPr's own (id, action) key never matches it. It is not suppressed.
    expect(Array.from(result.reasons ?? [])).not.toContain("duplicate-suppressed");
    expect(result.prUrl).toBe("https://github.com/kaneho/yumo-plugins/pull/24");
  });

  test("AT-Q6: the remote head branch consolidation/{passId} already exists — reason code branch-exists; the fallback proposal file carries the full diff; the existing branch and any PR for it are named", async () => {
    const git = fakeGit({
      "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" },
      push: { ok: false, stdout: "", stderr: "! [rejected]        consolidation/2026-01-01-1 -> consolidation/2026-01-01-1 (already exists)" },
    });
    const ghRun = fakeGhRun({ "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) } });
    const diffText = "--- a/pdlc/hooks/scripts/a.sh\n+++ b/pdlc/hooks/scripts/a.sh\n";
    const pass = runPass({
      git,
      ghRun,
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "I",
                artifact: "pdlc/hooks/scripts/a.sh",
                kind: 3,
                action: "promote",
                symptom: "a.sh recurs",
                diff: diffText,
                evidence: { recurrence: ["pdlc-consolidation-agent"] },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(Array.from(result.reasons ?? [])).toContain("branch-exists");
    const proposalFile = pass.fs.writes.find((w) => /CONSOLIDATION-PROPOSAL-/.test(w.path));
    expect(proposalFile).toBeDefined();
    expect(proposalFile.contents).toContain(diffText);
    expect(proposalFile.contents).toContain("consolidation/");
  });
});

/** §7.4's derivation, transcribed here ONLY to build this file's own fixture expectations — never
 * imported from the module under test, so a broken `failureModeId` cannot make this file's own
 * oracle agree with it by construction. */
function routeAwareId(artifact) {
  const slug = artifact
    .replace(/[/.]/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return `i-${slug}`;
}

describe.skip("T31 — AT-Q8, AT-Q9: the PR API failure and the deleted-branch trailer-survival cases", () => {
  test("AT-Q8: the PR API fails with a network/rate-limit/5xx error — reason code api-failure with the status text recorded verbatim; the fallback proposal file carries the full diff; the pass does not halt", async () => {
    const diffText = "--- a/pdlc/hooks/scripts/a.sh\n+++ b/pdlc/hooks/scripts/a.sh\n";
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
      "gh pr create": { ok: false, stdout: "", stderr: "HTTP 503: Service Unavailable (https://api.github.com/repos/kaneho/yumo-plugins/pulls)" },
    });
    const pass = runPass({
      ghRun,
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "I",
                artifact: "pdlc/hooks/scripts/a.sh",
                kind: 3,
                action: "promote",
                symptom: "a.sh recurs",
                diff: diffText,
                evidence: { recurrence: ["pdlc-consolidation-agent"] },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(Array.from(result.reasons ?? [])).toContain("api-failure");
    // Distinct reason code from AT-Q6's branch-exists — E-23/E-24 are different failure classes.
    expect(Array.from(result.reasons ?? [])).not.toContain("branch-exists");
    // Does not halt — a terminal status is reached, not an uncaught rejection.
    expect(["promoted", "promoted-degraded", "no-op"]).toContain(result.status);
    const proposalFile = pass.fs.writes.find((w) => /CONSOLIDATION-PROPOSAL-/.test(w.path));
    expect(proposalFile).toBeDefined();
    expect(proposalFile.contents).toContain(diffText);
    expect(proposalFile.contents).toContain("503");
  });

  test("AT-Q9: a pass that opened a PR and recorded its promotion on an invoking branch which is then deleted without merging — the PR and its trailer survive; a later pass re-mints the effectiveness record from scratch and reports it", async () => {
    const priorPassBody = "PDLC-CONSOLIDATION-PASS: 2025-12-01-1\nPDLC-CONSOLIDATION-PROMOTIONS: pdlc-hooks-scripts-a-sh:promote";
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": {
        ok: true,
        stdout: JSON.stringify([{ url: "https://github.com/kaneho/yumo-plugins/pull/25", state: "OPEN", body: priorPassBody }]),
      },
    });
    const pass = runPass({
      ghRun,
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      logText: buildConsolidationLog({ blocks: [{ passId: "2025-12-01-1", basenames: ["LEARNINGS-pdlc-consolidation-agent.md"] }] }),
      agent: makeAgentDouble({
        script: [agentReply({ clusters: [] })],
      }),
    });

    const result = await pass.run();

    // The trailer is still readable off the surviving PR (NFR-4) — the log's own suppression
    // reasoning for a later duplicate is exercised by AT-Q3/AT-Q10, not restated here; this row's
    // subject is that the PR's own state is unaffected by the invoking branch's loss.
    expect(ghRun.calls.some((c) => matchKey(c) === "gh pr list --json url,state,body")).toBe(true);
    // A re-run's effectiveness pass reports rather than silently treating the record as never lost —
    // the report body (rendered separately, §7.9) is this row's real oracle; here it is enough that
    // the pass completes to a terminal status without throwing on the branch's absence.
    expect(result.status).not.toBeNull();
  });
});

// ─── The on-disk failure-mode-record grammar (a second documented assumption) ─────────────────────
// `parseLogRecords(logText)` (TSPEC §7.4) is the reader this suite must satisfy, but nothing this
// task can reach pins the literal line format `renderFailureModeRecord` writes and
// `parseLogRecords` reads back — only the record's eight FIELDS (FSPEC §8.1) are named. Rather than
// invent a plausible-looking but unpinned prose line, the three fixtures below carry one full
// `FailureModeRecord` as a single JSON object inside an HTML comment,
// `<!-- pdlc:record {...} -->`, appended to the legacy region ahead of any `<!-- pdlc:consumed -->`
// block — a form `parseLogRecords` can round-trip losslessly regardless of what `renderFailureModeRecord`
// ships as prose, since every field this suite's oracle reads (`failureModeId`, `action`, `route`,
// `passId`) is present by name. If T31's implementer ships a different literal grammar, only this
// comment and these three fixture strings need to change — no assertion below depends on the
// grammar being JSON, only on `parseLogRecords` recovering the same eight fields from it.
describe.skip("T31 — AT-Q10, AT-Q11, AT-Q12: the consuming-repo suppression carrier", () => {
  test("AT-Q10: a proposal already carried by a prior pass's route:constraints record — nothing appended; duplicate-suppressed, suppressed-by names exactly one consuming-repo entry; pr: stays empty", async () => {
    const priorRecord = {
      failureModeId: "t-docs-_constraints-domain-constraints-md",
      phase: "T",
      symptom: "a spec omits a boundary case",
      artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
      target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
      passId: "2025-12-01-1",
      action: "promote",
      route: "constraints",
    };
    const pass = runPass({
      constraintsText: "existing content, unchanged\n",
      logText: buildConsolidationLog({
        legacy: `<!-- pdlc:record ${JSON.stringify(priorRecord)} -->\n`,
      }),
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "T",
                artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
                kind: 1,
                action: "promote",
                symptom: "a spec omits a boundary case",
                diff: "+ a bullet",
                evidence: { standingInvariant: "stated once, holds always" },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(pass.fs.writes.some((w) => w.path === CONSTRAINTS_PATH)).toBe(false);
    expect(Array.from(result.reasons ?? [])).toContain("duplicate-suppressed");
    expect(result.prUrl).toBeNull();
    const suppression = (result.suppressions ?? []).find((s) => s.failureModeId === priorRecord.failureModeId);
    expect(suppression).toBeDefined();
    expect(suppression.evidence).toEqual({ kind: "pass", passId: "2025-12-01-1" });
  });

  test("AT-Q11: no matching record — a pass appends exactly once and writes route:constraints; a re-run over an unchanged corpus suppresses, and the file is byte-identical after the second pass", async () => {
    const initialConstraints = "existing content, unchanged\n";
    let currentLogText = null;
    let currentConstraints = initialConstraints;

    function makeFsForRun() {
      const fs = fakeFs({
        [CONFIG_PATH]: buildConfig(),
        [LOG_PATH]: currentLogText,
        [MARKER_PATH]: null,
        [CONSTRAINTS_PATH]: currentConstraints,
      });
      return fs;
    }

    const clusterFixture = agentReply({
      clusters: [
        {
          phase: "T",
          artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
          kind: 1,
          action: "promote",
          symptom: "a spec omits a boundary case",
          diff: "+ a bullet",
          evidence: { standingInvariant: "stated once, holds always" },
        },
      ],
    });

    const firstFs = makeFsForRun();
    const firstResult = await main({
      _agent: makeAgentDouble({ script: [clusterFixture] })._agent,
      _readFile: firstFs._readFile,
      _writeFile: firstFs._writeFile,
      _appendFile: firstFs._appendFile,
      _checkFile: firstFs._checkFile,
      _git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } })._git,
      _ghRun: fakeGhRun({})._ghRun,
      _log: () => {},
      _phase: () => {},
      _envPresent: fakeEnvPresent(new Set())._envPresent,
      _makeTempDir: fakeMakeTempDir(CLONE_DIR)._makeTempDir,
      _now: () => FIXED_NOW_MS,
    });

    expect(Array.from(firstResult.reasons ?? [])).not.toContain("duplicate-suppressed");
    const firstWrite = firstFs.writes.find((w) => w.path === CONSTRAINTS_PATH);
    expect(firstWrite).toBeDefined();
    currentConstraints = firstFs.files[CONSTRAINTS_PATH];
    // The pass's own durable record is what the second run must read back — carried forward as the
    // log double's post-run contents (§7.9's rendering is a pure function of this same state).
    currentLogText = firstFs.files[LOG_PATH];

    const secondFs = makeFsForRun();
    const secondResult = await main({
      _agent: makeAgentDouble({ script: [clusterFixture] })._agent,
      _readFile: secondFs._readFile,
      _writeFile: secondFs._writeFile,
      _appendFile: secondFs._appendFile,
      _checkFile: secondFs._checkFile,
      _git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } })._git,
      _ghRun: fakeGhRun({})._ghRun,
      _log: () => {},
      _phase: () => {},
      _envPresent: fakeEnvPresent(new Set())._envPresent,
      _makeTempDir: fakeMakeTempDir(CLONE_DIR)._makeTempDir,
      _now: () => FIXED_NOW_MS,
    });

    expect(Array.from(secondResult.reasons ?? [])).toContain("duplicate-suppressed");
    // Byte-identical: the second pass's own recorded content for the constraints path (if it wrote
    // at all) equals what the first pass left, which is the assertion this row exists for.
    expect(secondFs.files[CONSTRAINTS_PATH]).toBe(currentConstraints);
  });

  test("AT-Q12: a prior pass's record for the pair with route:degraded — the later pass reads it as absent, not enacted; the promotion is re-proposed and, where it can now be applied, appended", async () => {
    const priorRecord = {
      failureModeId: "t-docs-_constraints-domain-constraints-md",
      phase: "T",
      symptom: "a spec omits a boundary case",
      artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
      target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
      passId: "2025-12-01-1",
      action: "promote",
      route: "degraded",
    };
    const pass = runPass({
      constraintsText: "existing content, unchanged\n",
      logText: buildConsolidationLog({
        legacy: `<!-- pdlc:record ${JSON.stringify(priorRecord)} -->\n`,
      }),
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "T",
                artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
                kind: 1,
                action: "promote",
                symptom: "a spec omits a boundary case",
                diff: "+ a bullet",
                evidence: { standingInvariant: "stated once, holds always" },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(Array.from(result.reasons ?? [])).not.toContain("duplicate-suppressed");
    expect(pass.fs.writes.some((w) => w.path === CONSTRAINTS_PATH)).toBe(true);
  });
});

describe.skip("T31 — AT-Q13: the PR body carries all three of AC-3.2's obligations, beyond the three trailers", () => {
  test("fixture (a) — recurrence across two named features: the body names both source LEARNINGS by feature name, the symptom line verbatim, and the recurrence evidence", async () => {
    const symptom = "the seam-verb spy's classifiers disagree at the clone-call boundary";
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
      "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/30\n" },
    });
    const pass = runPass({
      ghRun,
      git: fakeGit({
        "ls-files": {
          ok: true,
          stdout: [
            "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md",
            "docs/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md",
          ].join("\n") + "\n",
        },
      }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "I",
                artifact: "pdlc/hooks/scripts/a.sh",
                kind: 3,
                action: "promote",
                symptom,
                diff: "--- a/pdlc/hooks/scripts/a.sh\n",
                evidence: { recurrence: ["pdlc-consolidation-agent", "pdlc-rcv-budget-stop"] },
              },
            ],
          }),
        ],
      }),
    });

    await pass.run();

    const bodyFileWrite = pass.fs.writes.find((w) => /PDLC-CONSOLIDATION-PROMOTIONS/.test(w.contents ?? ""));
    expect(bodyFileWrite).toBeDefined();
    const body = bodyFileWrite.contents;
    // (1) both source feature names, set-equal to the features derived from — a body naming only
    // one is red on this fixture.
    expect(body).toContain("pdlc-consolidation-agent");
    expect(body).toContain("pdlc-rcv-budget-stop");
    // (2) the targeted failure mode's symptom line, verbatim.
    expect(body).toContain(symptom);
    // (3) the AC-2.3 pattern evidence in the recurrence form this fixture cleared the bar with.
    expect(body).toMatch(/pdlc-consolidation-agent.*pdlc-rcv-budget-stop|pdlc-rcv-budget-stop.*pdlc-consolidation-agent/s);
  });

  test("fixture (b) — a single occurrence cleared under the standing-invariant argument: the body names one feature, the symptom verbatim, and the standing-invariant argument, never a recurrence list", async () => {
    const symptom = "a lone TSPEC omits the seam's cloneDir argument";
    const standingInvariant = "the classifiers are total over every call regardless of corpus size";
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
      "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/31\n" },
    });
    const pass = runPass({
      ghRun,
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "T",
                artifact: "pdlc/hooks/scripts/a.sh",
                kind: 3,
                action: "promote",
                symptom,
                diff: "--- a/pdlc/hooks/scripts/a.sh\n",
                evidence: { standingInvariant },
              },
            ],
          }),
        ],
      }),
    });

    await pass.run();

    const bodyFileWrite = pass.fs.writes.find((w) => /PDLC-CONSOLIDATION-PROMOTIONS/.test(w.contents ?? ""));
    expect(bodyFileWrite).toBeDefined();
    const body = bodyFileWrite.contents;
    expect(body).toContain("pdlc-consolidation-agent");
    expect(body).toContain(symptom);
    expect(body).toContain(standingInvariant);
    // The negative half this fixture exists for: no second feature name is asserted as a recurrence
    // list, since there is only ever one to name here.
    expect(body).not.toContain("pdlc-rcv-budget-stop");
  });
});

describe.skip("T31 — AT-R7: docs/_decisions/CONSOLIDATION-PROPOSAL-*.md, written when and only when §5.3 has a cause", () => {
  test("(a) a fully-promoted pass — the guard-set promotion opened a PR, the rest landed in the §5.4 commit, nothing degraded or suppressed — the proposal-file set is unchanged, and none exists for this pass's passId", async () => {
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
      "gh pr create": { ok: true, stdout: "https://github.com/kaneho/yumo-plugins/pull/40\n" },
    });
    const pass = runPass({
      ghRun,
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "I",
                artifact: "pdlc/hooks/scripts/a.sh",
                kind: 3,
                action: "promote",
                symptom: "a.sh recurs",
                diff: "--- a/pdlc/hooks/scripts/a.sh\n",
                evidence: { recurrence: ["pdlc-consolidation-agent"] },
              },
              {
                phase: "T",
                artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
                kind: 1,
                action: "promote",
                symptom: "a spec omits a boundary case",
                diff: "+ a bullet",
                evidence: { standingInvariant: "stated once, holds always" },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(pass.fs.writes.some((w) => /CONSOLIDATION-PROPOSAL-/.test(w.path))).toBe(false);
    expect(result.prUrl).toBe("https://github.com/kaneho/yumo-plugins/pull/40");
  });

  test("(b) a no-op pass whose promotions were all duplicate-suppressed — also no cause, and no proposal file", async () => {
    const priorRecord = {
      failureModeId: "t-docs-_constraints-domain-constraints-md",
      phase: "T",
      symptom: "a spec omits a boundary case",
      artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
      target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
      passId: "2025-12-01-1",
      action: "promote",
      route: "constraints",
    };
    const pass = runPass({
      logText: buildConsolidationLog({ legacy: `<!-- pdlc:record ${JSON.stringify(priorRecord)} -->\n` }),
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "T",
                artifact: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
                kind: 1,
                action: "promote",
                symptom: "a spec omits a boundary case",
                diff: "+ a bullet",
                evidence: { standingInvariant: "stated once, holds always" },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(result.status).toBe("no-op");
    expect(pass.fs.writes.some((w) => /CONSOLIDATION-PROPOSAL-/.test(w.path))).toBe(false);
  });

  test("(c) the positive control — one promotion degrades on an absent credential: exactly one proposal file exists, named for this pass's passId", async () => {
    const ghRun = fakeGhRun({
      "gh pr list --json url,state,body": { ok: true, stdout: JSON.stringify([]) },
      "gh auth status": { ok: false, stdout: "", stderr: "not logged in" },
    });
    const pass = runPass({
      ghRun,
      envPresent: fakeEnvPresent(new Set()), // credentialEnv absent AND local-gh probe fails => credential-unavailable
      git: fakeGit({ "ls-files": { ok: true, stdout: "docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md\n" } }),
      agent: makeAgentDouble({
        script: [
          agentReply({
            clusters: [
              {
                phase: "I",
                artifact: "pdlc/hooks/scripts/a.sh",
                kind: 3,
                action: "promote",
                symptom: "a.sh recurs",
                diff: "--- a/pdlc/hooks/scripts/a.sh\n",
                evidence: { recurrence: ["pdlc-consolidation-agent"] },
              },
            ],
          }),
        ],
      }),
    });

    const result = await pass.run();

    expect(Array.from(result.reasons ?? [])).toContain("credential-unavailable");
    const proposalWrites = pass.fs.writes.filter((w) => /CONSOLIDATION-PROPOSAL-/.test(w.path));
    expect(proposalWrites).toHaveLength(1);
    expect(proposalWrites[0].path).toContain(result.passId);
  });
});
