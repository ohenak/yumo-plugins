// loopDocumentSurfaces.test.js — PLAN P8-07.
//
// Document oracle over the shipped documentation set. Reads tracked HEAD
// content only (TSPEC T-Q-01: an uncommitted working-tree edit must not
// silently satisfy this oracle — same rule loopGuardPaths.test.js's AT-32
// oracle already follows). Discovers shipped docs via `git ls-files` under
// `pdlc/`, filtered to `.md` and with test-fixture paths excluded — a glob
// over tracked paths, not a hand-enumerated file list — then ranges the
// AT-33 / AT-35 / AT-47 / AT-45 assertions over whichever of those files
// actually carries the relevant content. AT-44's (b) half (E-20(b) session-side
// launch-failure detection) is pinned to the one file that owns it,
// `pdlc/skills/orchestrate-queue/SKILL.md`.

import { execFileSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import main, { DEFAULT_QUEUE_PATH } from "../orchestrate-queue.js";
import { makeReadFileFn, makeGitFn, loopFakeNow } from "./helpers/loopDoubles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", cwd: REPO_ROOT, ...opts });
}

/** Tracked-HEAD content for a repo-relative path (TSPEC T-Q-01). */
function readTracked(relPath) {
  return run("git", ["show", `HEAD:${relPath}`]);
}

/** Glob (not an enumerated list): every tracked `.md` file under `pdlc/`,
 * excluding test fixtures. */
function shippedDocPaths() {
  return run("git", ["ls-files", "--", "pdlc"])
    .split("\n")
    .filter(Boolean)
    .filter((p) => p.endsWith(".md"))
    .filter((p) => !p.includes("__tests__/") && !p.includes("/fixtures/"));
}

const DOC_PATHS = shippedDocPaths();
const DOCS = DOC_PATHS.map((p) => ({ path: p, text: readTracked(p) }));

test("shipped-doc glob discovers at least one tracked markdown file under pdlc/", () => {
  expect(DOC_PATHS.length).toBeGreaterThan(0);
});

// ---------------------------------------------------------------------------
// AT-33 (BR-25, AC-5.1/5.2) — steady-state operator surface set-equal to
// exactly four items, `--loop-state` absent from that list, and the
// disjoint one-time-setup list contains AC-5.2's three literal members.
// ---------------------------------------------------------------------------

/**
 * Extracts the numbered list immediately following the first "steady-state"
 * mention in `text` — the contiguous run of lines starting "1.", "2.", …
 * Returns null when this document doesn't carry such a block.
 */
function steadyStateListItems(text) {
  const anchor = text.search(/steady-state/i);
  if (anchor < 0) return null;
  const after = text.slice(anchor);
  const lines = [...after.matchAll(/^\s*(\d+)\.\s+(.+)$/gm)];
  const items = [];
  let expected = 1;
  for (const [, n, body] of lines) {
    if (Number(n) !== expected) break;
    items.push(body.trim());
    expected += 1;
  }
  return items.length > 0 ? items : null;
}

/** Slices the one-time-setup block: from the first "one-time" mention up to
 * (not including) the next `## ` heading, or end of doc. */
function oneTimeSetupText(text) {
  const anchor = text.search(/one-time/i);
  if (anchor < 0) return null;
  const after = text.slice(anchor);
  const nextHeading = after.search(/\n##\s/);
  return nextHeading < 0 ? after : after.slice(0, nextHeading);
}

describe("AT-33: shipped-doc steady-state operator surface", () => {
  const blocks = DOCS.map((d) => ({ path: d.path, items: steadyStateListItems(d.text) })).filter(
    (b) => b.items,
  );

  test("at least one shipped doc documents the steady-state operator surface", () => {
    expect(blocks.length).toBeGreaterThan(0);
  });

  test.each(blocks.map((b) => [b.path, b.items]))(
    "%s: steady-state surface is set-equal to exactly four items",
    (_path, items) => {
      expect(items).toHaveLength(4);
      expect(items[0]).toMatch(/ready:\s*true/i);
      expect(items[0]).toMatch(/REQ/);
      expect(items[1]).toMatch(/approv/i);
      expect(items[1]).toMatch(/guard(ed)?[- ]path/i);
      expect(items[2]).toMatch(/resolv/i);
      expect(items[2]).toMatch(/escalation/i);
      expect(items[3]).toMatch(/product/i);
      expect(items[3]).toMatch(/business-judgment/i);
      expect(items[3]).toMatch(/outside/i);
    },
  );

  test.each(blocks.map((b) => [b.path, b.items]))(
    "%s: --loop-state is absent from the steady-state list",
    (_path, items) => {
      for (const item of items) {
        expect(item.toLowerCase()).not.toContain("--loop-state");
      }
    },
  );
});

describe("AT-33: one-time setup list contains AC-5.2's three members and stays disjoint from the steady-state phrases", () => {
  const setups = DOCS.map((d) => ({ path: d.path, text: oneTimeSetupText(d.text) })).filter(
    (s) => s.text,
  );

  test("at least one shipped doc documents the one-time setup list", () => {
    expect(setups.length).toBeGreaterThan(0);
  });

  test.each(setups.map((s) => [s.path, s.text]))(
    "%s: names installing the engine, creating QUEUE.md, and installing the loop template",
    (_path, text) => {
      expect(text.toLowerCase()).toMatch(/engine/);
      expect(text).toMatch(/QUEUE\.md/);
      expect(text).toMatch(/loop\.md/);
    },
  );

  test.each(setups.map((s) => [s.path, s.text]))(
    "%s: one-time setup block doesn't restate the steady-state phrases (disjointness)",
    (_path, text) => {
      const lower = text.toLowerCase();
      expect(lower).not.toMatch(/ready:\s*true/);
      expect(lower).not.toMatch(/business-judgment/);
    },
  );
});

// ---------------------------------------------------------------------------
// AT-35 (AC-6.1) — durability documentation transcribes `/loop`'s scope
// lifetime with the cited runtime version beside it.
// ---------------------------------------------------------------------------

describe("AT-35: durability documentation cites a runtime version beside the /loop scope-lifetime claim", () => {
  const matches = DOCS.flatMap((d) => {
    const m = d.text.match(/runtime version\s*\*{0,2}(\d+\.\d+\.\d+)\*{0,2}/i);
    return m ? [{ path: d.path, version: m[1], index: m.index, text: d.text }] : [];
  });

  test("at least one shipped doc cites a runtime version beside the /loop durability claim", () => {
    expect(matches.length).toBeGreaterThan(0);
  });

  test.each(matches.map((m) => [m.path, m]))(
    "%s: the cited version sits beside a /loop session-scope claim",
    (_path, m) => {
      expect(m.version).toMatch(/^\d+\.\d+\.\d+$/);
      const window = m.text.slice(Math.max(0, m.index - 200), m.index + 400);
      expect(window).toMatch(/\/loop/);
      expect(window.toLowerCase()).toMatch(/session/);
    },
  );

  // PROP-DOC-03 — AC-6.1's three scope-and-lifetime facts, asserted individually over
  // whitespace-normalised text (a heading-presence oracle would pass on an empty section),
  // each cited to the same runtime version. Non-vacuity control (O-4 row): the section's
  // literal-citation count is asserted >= 1 BEFORE the per-fact universal is evaluated, so
  // an empty/omitted durability section reds here instead of vacuously passing.
  test.each(matches.map((m) => [m.path, m]))(
    "%s: names all three of session-scoped / fires-only-while-open-and-idle / expires-with-the-session, each in the runtime-version-cited window",
    (_path, m) => {
      const window = m.text
        .slice(Math.max(0, m.index - 400), m.index + 1200)
        .replace(/\s+/g, " ");

      // Non-vacuity: at least one runtime-version literal citation exists in this window
      // before the per-fact checks below run.
      const citationCount = (window.match(new RegExp(m.version.replace(/\./g, "\\."), "g")) || [])
        .length;
      expect(citationCount).toBeGreaterThanOrEqual(1);

      // Fact 1: session-scoped.
      expect(window).toMatch(/session-scoped/i);
      // Fact 2: fires only while the session is open and the loop is idle/ticking.
      expect(window).toMatch(/fires only while its\s*session is open/i);
      // Fact 3: expires with the session (closing the session / failing to reschedule ends it).
      expect(window).toMatch(/`\/loop`\s*\*\*expires\*\*/i);
    },
  );
});

// ---------------------------------------------------------------------------
// AT-47 (BR-30, AC-6.2/AC-6.3) — durability documentation names both
// promotion paths and states orchestrate-dev's poor fit for a Routine, with
// the working-tree reason.
// ---------------------------------------------------------------------------

describe("AT-47: durability documentation names both promotion paths and the Routine working-tree caveat", () => {
  const withPromotion = DOCS.filter(
    (d) => /desktop scheduled task/i.test(d.text) && /\bRoutine\b/.test(d.text),
  );

  test("at least one shipped doc names both promotion paths (Desktop scheduled task, Routine)", () => {
    expect(withPromotion.length).toBeGreaterThan(0);
  });

  test.each(withPromotion.map((d) => [d.path, d.text]))(
    "%s: states orchestrate-dev is a poor fit for a Routine, citing the working-tree reason",
    (_path, text) => {
      expect(text).toMatch(/orchestrate-dev/);
      expect(text.toLowerCase()).toMatch(/poor fit/);
      expect(text.toLowerCase()).toMatch(/routine/);
      expect(text.toLowerCase()).toMatch(/working tree/);
    },
  );
});

// ---------------------------------------------------------------------------
// AT-45 (BR-26a, AC-1.1) — pdlc/templates/loop.md exists (shipped) and a
// shipped doc names that path as an install target.
// ---------------------------------------------------------------------------

describe("AT-45: pdlc/templates/loop.md exists and a shipped doc names it as an install target", () => {
  test("pdlc/templates/loop.md is tracked at HEAD", () => {
    expect(() => run("git", ["cat-file", "-e", "HEAD:pdlc/templates/loop.md"])).not.toThrow();
  });

  test("at least one shipped doc names pdlc/templates/loop.md alongside install instructions", () => {
    const named = DOCS.filter(
      (d) => /pdlc\/templates\/loop\.md/.test(d.text) && /install/i.test(d.text),
    );
    expect(named.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Referent pinning (CODE_REVIEW-pdlc-engineering-loop-v4 B-02).
  //
  // "Some shipped doc names it as an install target" is satisfiable while
  // every cross-reference to that install points somewhere that does not
  // carry it — which is exactly what shipped: `pdlc/OPERATIONS.md` deferred
  // to "The engine channel" (engine install only) and `pdlc/templates/loop.md`
  // deferred back to `pdlc/OPERATIONS.md`, so an operator following either
  // pointer landed on a section that does not answer. The predicate below is
  // therefore over the REFERENT, not over existence: a doc that mentions the
  // template but does not itself carry the concrete install location must
  // name a shipped doc that does.
  // -------------------------------------------------------------------------

  /** A doc "carries the install" when it names the template path AND the concrete destination. */
  const carriesInstall = (d) =>
    /pdlc\/templates\/loop\.md/.test(d.text) && /\.claude\/commands\//.test(d.text);

  const INSTALL_DOCS = DOCS.filter(carriesInstall);

  test("at least one shipped doc states the concrete install destination for the loop prompt", () => {
    expect(INSTALL_DOCS.map((d) => d.path)).toContain("pdlc/README.md");
  });

  test("every shipped doc that defers the loop-prompt install names a doc that actually carries it", () => {
    const installDocPaths = INSTALL_DOCS.map((d) => d.path);

    const deferrers = DOCS.filter((d) => /pdlc\/templates\/loop\.md/.test(d.text)).filter(
      (d) => !carriesInstall(d),
    );

    for (const doc of deferrers) {
      const paragraphs = doc.text
        .split(/\n\s*\n/)
        .filter((p) => /pdlc\/templates\/loop\.md/.test(p) && /install/i.test(p));

      for (const paragraph of paragraphs) {
        const namesAnInstallDoc = installDocPaths.some((p) => paragraph.includes(p));
        expect(`${doc.path} :: ${namesAnInstallDoc}`).toBe(`${doc.path} :: true`);
      }
    }
  });

  test("the shipped loop-prompt template points at a doc that actually carries the install", () => {
    const template = DOCS.find((d) => d.path === "pdlc/templates/loop.md");
    expect(template).toBeDefined();

    const installDocPaths = INSTALL_DOCS.map((d) => d.path);
    const pointsAtInstallDoc = installDocPaths.some((p) => template.text.includes(p));
    expect(pointsAtInstallDoc).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PROP-DOC-02 (negative, REQ AC-1.1, FSPEC BR-26; PLAN P8-03) — installing
// `pdlc/templates/loop.md` is not a precondition of any REQ-LOOP-01…07 outcome: a full
// session run through `main` behaves identically whether or not that path is seeded into
// the read seam. No production seam ever reads that path — this is the driving,
// behavioural form of that claim rather than a documentation-only assertion.
// ---------------------------------------------------------------------------

describe("PROP-DOC-02 (negative): installing the loop template is not a precondition of any session outcome", () => {
  const ONE_FEATURE_QUEUE =
    "| Order | Status | Feature | REQ Path | Depends-On |\n" +
    "| --- | --- | --- | --- | --- |\n" +
    "| 1 | pending | upstream-feature | docs/upstream-feature/REQ-upstream-feature.md | - |";
  const READY_REQ = "---\nready: true\n---\n# REQ body\n";
  const CONFIG_PATH = ".claude/pdlc.config.json";

  async function runSession(withTemplateInstalled) {
    const { gitFn } = makeGitFn({ status: { ok: true, stdout: "", stderr: "" } });
    const files = {
      [DEFAULT_QUEUE_PATH]: ONE_FEATURE_QUEUE,
      "docs/upstream-feature/REQ-upstream-feature.md": READY_REQ,
      [CONFIG_PATH]: JSON.stringify({ loop: { preflight: "strict" } }),
    };
    if (withTemplateInstalled) {
      files["pdlc/templates/loop.md"] = readTracked("pdlc/templates/loop.md");
    }
    const { readFileFn } = makeReadFileFn(files);
    return main({
      _log: () => {},
      _phase: () => {},
      _agent: async () => "TRIAGE: ready",
      _readFile: readFileFn,
      _writeFile: async () => {},
      _appendFile: async () => {},
      _git: gitFn,
      _now: loopFakeNow,
      _runPipeline: async () => ({ outcome: "success", mergeStatus: "merged" }),
      loopState: "new",
    });
  }

  test("the directive sequence is deep-equal whether or not pdlc/templates/loop.md is present in the session's inputs", async () => {
    const withoutTemplate = await runSession(false);
    const withTemplate = await runSession(true);

    expect(withTemplate.outcome).toBe(withoutTemplate.outcome);
    expect(withTemplate.loop).toEqual(withoutTemplate.loop);
    expect(withTemplate.picked).toBe(withoutTemplate.picked);
  });
});

// ---------------------------------------------------------------------------
// AT-44 (BR-10, E-20) (b) half — pdlc/skills/orchestrate-queue/SKILL.md's
// session-side launch-failure detection rule (E-20(b)), distinguished from
// invocation-threw (E-04).
// ---------------------------------------------------------------------------

describe("AT-44 (b): orchestrate-queue/SKILL.md's session-side launch-failure detection (E-20(b))", () => {
  const skillText = readTracked("pdlc/skills/orchestrate-queue/SKILL.md");

  test("names the three launch-failure detection shapes", () => {
    expect(skillText).toMatch(/command not found/i);
    expect(skillText).toMatch(/127/);
    expect(skillText).toMatch(/ENOENT/);
  });

  test("stops with preflight-refused under both loop.preflight policies and prints the install remediation literal", () => {
    expect(skillText).toMatch(/preflight-refused/);
    expect(skillText).toMatch(/"strict"/);
    expect(skillText).toMatch(/"off"/);
    expect(skillText).toMatch(/npm install -g @kaneho\/pdlc-engine/);
    expect(skillText).toMatch(/pdlc:orchestrate-queue/);
  });

  test("distinguishes the E-20(b) launch-failure message from invocation-threw (E-04)", () => {
    expect(skillText).toMatch(/invocation-threw/);
    expect(skillText).toMatch(/E-20\(b\)/);
    expect(skillText).toMatch(/E-04/);
  });

  // PROP-DOC-05's protocol half (BR-11b): the session-side directive protocol — invoke
  // iteration 1 as `pdlc queue --loop-state new`, echo `nextState` back unmodified as the
  // next iteration's `--loop-state` value, perform the wait, and stop on a `stop` directive.
  test("names the session-side directive protocol: invoke with --loop-state new, echo nextState, wait, stop on a stop directive", () => {
    expect(skillText).toMatch(/--loop-state new/);
    expect(skillText).toMatch(/echoes\s*`?nextState`?\s*back unmodified/i);
    expect(skillText).toMatch(/--loop-state\s*<nextState>/);
    expect(skillText).toMatch(/waitMinutes/);
    expect(skillText).toMatch(/On\s*`?stop`?:\s*the session halts/i);
  });
});
