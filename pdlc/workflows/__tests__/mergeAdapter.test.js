/**
 * mergeAdapter.test.js — the `gh` transport (TSPEC §11.3).
 *
 * `rtGhRun` is a pure transport: it receives a command string the module
 * built, dispatches an agent turn asking for `rtGit`'s JSON-object reply
 * shape verbatim (same three fields, same escaping instruction, same
 * unparseable-reply fallback), and never itself knows a `gh` string.
 *
 * Four assertions per TSPEC §13.2: (a) `rtDevInjections` carries `_ghRun`;
 * (b) the prompt is built by interpolating ONLY the command handed in; (c)
 * both prompt clauses — the at-most-once mutation sentence and the
 * do-not-retry/do-not-repair/do-not-run-any-other-command clause; (d) the
 * three-arm reply mapping, where the `{"ok":false,...}` arm is the one a
 * two-field implementation reds because `stderr` must survive.
 */

import { loadAdapter } from "./helpers/adapterHarness.js";

/** An `agent` double that answers every dispatch from `replies[i]` (last one repeats). */
function scriptedAgent(replies) {
  const calls = [];
  const agent = async (prompt, opts) => {
    const index = calls.length;
    calls.push({ prompt, opts });
    const reply = replies[Math.min(index, replies.length - 1)];
    if (reply instanceof Error) throw reply;
    return typeof reply === "function" ? reply(index) : reply;
  };
  agent.calls = calls;
  return agent;
}

const load = (agent) => loadAdapter({ agent });

describe("rtDevInjections", () => {
  it("carries _ghRun", () => {
    const base = loadAdapter();
    const inj = base.rtDevInjections({});
    expect(inj._ghRun).toBe(base.rtGhRun);
  });
});

describe("rtGhRun", () => {
  it("interpolates ONLY the command it was handed", async () => {
    const agent = scriptedAgent(['{"ok":true,"stdout":"","stderr":""}']);
    const { rtGhRun } = load(agent);

    const command = 'gh pr view 123 --json mergeable,mergeStateStatus';
    await rtGhRun(command);

    expect(agent.calls).toHaveLength(1);
    expect(agent.calls[0].prompt).toContain(`  ${command}\n`);
    // No other gh command string leaks into the prompt.
    expect(agent.calls[0].prompt.match(/gh /g)).toHaveLength(1);
  });

  it("carries the at-most-once mutation sentence and the do-not-retry clause", async () => {
    const agent = scriptedAgent(['{"ok":true,"stdout":"","stderr":""}']);
    const { rtGhRun } = load(agent);

    await rtGhRun("gh pr merge 123 --squash");

    const prompt = agent.calls[0].prompt;
    expect(prompt).toContain(
      "This command may change repository state. Issue it AT MOST ONCE."
    );
    expect(prompt).toContain(
      "Do not retry, do not repair, and do not run any other command."
    );
  });

  it("dispatches on RT_IO_MODEL with a command-derived label", async () => {
    const base = loadAdapter();
    const agent = scriptedAgent(['{"ok":true,"stdout":"","stderr":""}']);
    const { rtGhRun } = load(agent);

    await rtGhRun("gh pr view 123");

    expect(agent.calls[0].opts).toMatchObject({ model: base.RT_IO_MODEL });
    expect(agent.calls[0].opts.label).toContain("gh:");
  });

  it("maps an ok:true reply to {ok:true, stdout, stderr:''}", async () => {
    const agent = scriptedAgent([
      '{"ok":true,"stdout":"MERGED\\n","stderr":""}',
    ]);
    const { rtGhRun } = load(agent);

    expect(await rtGhRun("gh pr view 123")).toEqual({
      ok: true,
      stdout: "MERGED\n",
      stderr: "",
    });
  });

  it("maps an ok:false reply and PRESERVES stderr (the two-field trap)", async () => {
    const agent = scriptedAgent([
      '{"ok":false,"stdout":"","stderr":"pull request is not mergeable: the merge commit cannot be cleanly created"}',
    ]);
    const { rtGhRun } = load(agent);

    expect(await rtGhRun("gh pr merge 123 --squash")).toEqual({
      ok: false,
      stdout: "",
      stderr: "pull request is not mergeable: the merge commit cannot be cleanly created",
    });
  });

  it("maps an unparseable reply to {ok:false, stderr:'unparseable adapter response'}, matching rtGit's fallback", async () => {
    const agent = scriptedAgent(["not json at all"]);
    const { rtGhRun } = load(agent);

    expect(await rtGhRun("gh pr view 123")).toEqual({
      ok: false,
      stdout: "",
      stderr: "unparseable adapter response",
    });
  });
});

describe("rtGit — the command is valid shell AS WRITTEN (quoting is not the executing agent's job)", () => {
  it("single-quotes argv elements that carry shell-active characters", async () => {
    const agent = scriptedAgent(['{"ok":true,"stdout":"","stderr":""}']);
    const { rtGit } = load(agent);

    await rtGit(["commit", "-m", "feat(pdlc-advisory-tier): A-03 — RED `describe.skip`"]);

    expect(agent.calls).toHaveLength(1);
    expect(agent.calls[0].prompt).toContain(
      "  git commit -m 'feat(pdlc-advisory-tier): A-03 — RED `describe.skip`'\n"
    );
  });

  it("passes bare-safe argv elements through unquoted", async () => {
    const agent = scriptedAgent(['{"ok":true,"stdout":"","stderr":""}']);
    const { rtGit } = load(agent);

    await rtGit(["diff", "--cached", "--name-only", "--", "src/one.js"]);

    expect(agent.calls[0].prompt).toContain("  git diff --cached --name-only -- src/one.js\n");
  });

  it("escapes embedded single quotes so the written command still parses", () => {
    const { rtShellQuote } = loadAdapter();
    expect(rtShellQuote("it's")).toBe("'it'\\''s'");
    expect(rtShellQuote("plain-safe_word.js")).toBe("plain-safe_word.js");
  });
});
