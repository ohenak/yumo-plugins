/**
 * adapterRunCommand.test.js — `rtRunCommand`, the command transport Phase I's
 * script-owned gate runs the suite through (PROPOSAL §3.3, M-6).
 *
 * The property under test: an exit status is believed only when the reply
 * carries EXACTLY ONE `COMMAND_EXIT:` trailer line drawn from the closed
 * two-value set. Everything else — no trailer, a garbled trailer, a value
 * outside the set, or a second trailer arriving inside the pasted output tail —
 * is `ok: false`, because an unreadable gate must halt the wave rather than pass
 * it. Both arms are asserted, so neither is an absence-only oracle.
 */

import { hostParallel, loadAdapter } from "./helpers/adapterHarness.js";

const { RT_IO_MODEL, RT_IO_MODEL_HARD } = loadAdapter();

/** An `agent` double that returns one fixed reply and records every dispatch. */
function replyingAgent(reply) {
  const calls = [];
  const agent = async (prompt, opts) => {
    calls.push({ prompt, opts });
    return typeof reply === "function" ? reply(prompt) : reply;
  };
  agent.calls = calls;
  return agent;
}

const load = (agent) => loadAdapter({ agent, parallel: hostParallel, log: () => {} });

describe("rtRunCommand — the trailer contract", () => {
  it("parses the green arm: COMMAND_EXIT: 0 → ok true, output carried", async () => {
    const agent = replyingAgent("COMMAND_EXIT: 0\nTests: 1087 passed, 0 failed\nDone.");
    const { rtRunCommand } = load(agent);

    const r = await rtRunCommand("npm test");
    expect(r.ok).toBe(true);
    expect(r.output).toContain("Tests: 1087 passed, 0 failed");
  });

  it("parses the red arm: COMMAND_EXIT: nonzero → ok false, output carried", async () => {
    const agent = replyingAgent("COMMAND_EXIT: nonzero\nFAIL src/a.test.js\nTests: 1 failed");
    const { rtRunCommand } = load(agent);

    const r = await rtRunCommand("npm test");
    expect(r.ok).toBe(false);
    expect(r.output).toContain("Tests: 1 failed");
  });

  it("tolerates trailing whitespace and a CR on the trailer line", async () => {
    const { rtRunCommand } = load(replyingAgent("COMMAND_EXIT:  0  \r\nall good"));
    expect((await rtRunCommand("npm test")).ok).toBe(true);
  });

  it("fails closed on a reply with no trailer at all", async () => {
    const { rtRunCommand } = load(replyingAgent("Everything looks fine to me!"));
    const r = await rtRunCommand("npm test");
    expect(r.ok).toBe(false);
    // Positive half: the unreadable reply is still handed back for the halt message.
    expect(r.output).toBe("Everything looks fine to me!");
  });

  it("fails closed on a value outside the closed two-value set", async () => {
    const { rtRunCommand } = load(replyingAgent("COMMAND_EXIT: 1\nboom"));
    expect((await rtRunCommand("npm test")).ok).toBe(false);
  });

  it("fails closed when a SECOND trailer arrives inside the output tail", async () => {
    // Read fail-closed. (Unlike `extractFileVerdict`, which since DEC-BAR-01 reads
    // the LAST verdict line: a command trailer is an observation of one process
    // exit, not a reviewer's editable judgment, so "the last one wins" would be
    // adopting whichever line the output happened to end with.)
    const { rtRunCommand } = load(
      replyingAgent("COMMAND_EXIT: 0\nlog line\nCOMMAND_EXIT: nonzero\n")
    );
    const r = await rtRunCommand("npm test");
    expect(r.ok).toBe(false);
  });

  it("fails closed on an empty or null reply", async () => {
    const emptyAdapter = load(replyingAgent(""));
    expect((await emptyAdapter.rtRunCommand("npm test")).ok).toBe(false);
    const nullAdapter = load(replyingAgent(null));
    expect((await nullAdapter.rtRunCommand("npm test")).ok).toBe(false);
  });
});

describe("rtRunCommand — the dispatch it issues", () => {
  it("runs on the hard model, not the cheap IO model", async () => {
    const agent = replyingAgent("COMMAND_EXIT: 0\n");
    const { rtRunCommand } = load(agent);
    await rtRunCommand("npm test");

    expect(agent.calls).toHaveLength(1);
    expect(agent.calls[0].opts.model).toBe(RT_IO_MODEL_HARD);
    // Paired positive: the two models really are different values, so the
    // assertion above cannot pass by them having collapsed to one.
    expect(RT_IO_MODEL_HARD).not.toBe(RT_IO_MODEL);
  });

  it("interpolates the command verbatim and forbids retry, repair and background", async () => {
    const agent = replyingAgent("COMMAND_EXIT: 0\n");
    const { rtRunCommand } = load(agent);
    await rtRunCommand("npm test -- --runInBand");

    const { prompt } = agent.calls[0];
    expect(prompt).toContain("Run exactly this command from the repository root");
    expect(prompt).toContain("npm test -- --runInBand");
    expect(prompt).toContain("Do not run it in the background");
    expect(prompt).toContain("do not retry it");
    expect(prompt).toContain("last 30 lines");
    expect(prompt).toContain("COMMAND_EXIT: 0");
    expect(prompt).toContain("COMMAND_EXIT: nonzero");
  });
});

describe("rtDevInjections wires the command transport", () => {
  it("_runCommand is present and is rtRunCommand", () => {
    const adapter = load(replyingAgent("COMMAND_EXIT: 0\n"));
    const injections = adapter.rtDevInjections({});
    expect(injections._runCommand).toBe(adapter.rtRunCommand);
  });
});
