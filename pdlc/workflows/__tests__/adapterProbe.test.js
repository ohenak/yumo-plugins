/**
 * adapterProbe.test.js — the `pdlc-cli.mjs` probe transport (`rtCliQuery`) and
 * the three seams built on it.
 *
 * The property under test is the same one `adapterRead.test.js` pins for bytes,
 * restated for judgments: a reply is believed only when the digest the CLI
 * printed matches the JSON line the model pasted back. Everything else — a
 * mangled line, a missing digest line, a reply that never parses — costs
 * attempts and then returns null, because the module's contract is that a probe
 * which cannot answer was never installed and the byte-taking path runs instead.
 *
 * The digest is `sha256Hex`'s, i.e. CANONICALISED (LF-only, exactly one
 * trailing newline) before hashing. A verifier that hashes the pasted line raw
 * rejects every correct reply, so the canonicalisation is asserted directly and
 * again through a CRLF-mangled reply that must still verify.
 */

import { createHash } from "crypto";
import { fileAgent, hostParallel, loadAdapter } from "./helpers/adapterHarness.js";

const base = loadAdapter();
const { RT_READ_RETRIES, RT_IO_MODEL, RT_IO_MODEL_HARD, RT_READ_ESCALATE_AFTER } = base;
const ATTEMPTS = RT_READ_RETRIES + 1;

/** The CLI's digest: `sha256Hex(line)`, which canonicalises before hashing. */
const cliDigest = (line) =>
  createHash("sha256")
    .update(Buffer.from(String(line).replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n*$/, "\n"), "utf8"))
    .digest("hex");

/** The CLI's two-line stdout for a result object. */
function cliReply(result) {
  const line = JSON.stringify(result);
  return `${line}\nDIGEST: sha256:${cliDigest(line)}\n`;
}

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

const load = (agent) => loadAdapter({ agent, parallel: hostParallel, log: () => {} });

const DOC_PROBE = {
  ok: true,
  exists: true,
  empty: false,
  hash: `sha256:${"a".repeat(64)}`,
  artifactClass: "spec",
  complete: true,
  missing: [],
  T: 9,
  S: 9,
  firstUnwritten: null,
  anchors: [],
};

describe("rtShellQuote", () => {
  it("wraps in single quotes and escapes an embedded quote", () => {
    expect(rtQuote("docs/f/REQ-f.md")).toBe("'docs/f/REQ-f.md'");
    expect(rtQuote("docs/my feature/REQ.md")).toBe("'docs/my feature/REQ.md'");
    expect(rtQuote("it's.md")).toBe("'it'\\''s.md'");
  });

  function rtQuote(arg) {
    return base.rtShellQuote(arg);
  }
});

describe("rtCliCanonicalise", () => {
  it("is sha256Hex's normalisation: LF-only, exactly one trailing newline", () => {
    expect(base.rtCliCanonicalise("a\r\nb")).toBe("a\nb\n");
    expect(base.rtCliCanonicalise("a\rb")).toBe("a\nb\n");
    expect(base.rtCliCanonicalise("a")).toBe("a\n");
    expect(base.rtCliCanonicalise("a\n\n\n")).toBe("a\n");
    expect(base.rtCliCanonicalise(null)).toBe("\n");
  });
});

describe("rtExtractCliReply", () => {
  it("takes the LAST digest line and the line immediately before it", () => {
    const reply = `{"a":1}\nDIGEST: sha256:${"0".repeat(64)}\n{"b":2}\nDIGEST: sha256:${"1".repeat(64)}`;
    expect(base.rtExtractCliReply(reply)).toEqual({ digest: "1".repeat(64), line: '{"b":2}' });
  });

  it("refuses a digest line with nothing before it, and a reply with no digest line", () => {
    expect(base.rtExtractCliReply(`DIGEST: sha256:${"0".repeat(64)}`)).toBeNull();
    expect(base.rtExtractCliReply('{"ok":true}')).toBeNull();
    expect(base.rtExtractCliReply(undefined)).toBeNull();
  });
});

describe("rtCliQuery", () => {
  it("returns the parsed result from a clean two-line reply, in ONE dispatch", async () => {
    const agent = scriptedAgent([cliReply(DOC_PROBE)]);
    const { rtCliQuery } = load(agent);

    expect(await rtCliQuery(["doc-probe", "docs/f/REQ-f.md"], "probe")).toEqual(DOC_PROBE);
    expect(agent.calls).toHaveLength(1);
    // The whole point of the seam: one small dispatch, on the cheap model.
    expect(agent.calls[0].opts).toMatchObject({ label: "probe", model: RT_IO_MODEL });
    expect(agent.calls[0].prompt).toContain(
      `node ${base.RT_CLI_PATH} 'doc-probe' 'docs/f/REQ-f.md'`
    );
  });

  it("extracts the two lines from a reply wrapped in prose and code fences", async () => {
    const wrapped =
      "Here is the command output:\n\n```\n" + cliReply(DOC_PROBE) + "```\n\nLet me know if you need more.";
    const agent = scriptedAgent([wrapped]);
    const { rtCliQuery } = load(agent);

    expect(await rtCliQuery(["doc-probe", "docs/f/REQ-f.md"], "probe")).toEqual(DOC_PROBE);
    expect(agent.calls).toHaveLength(1);
  });

  it("verifies a CRLF-mangled reply rather than burning retries on it", async () => {
    const agent = scriptedAgent([cliReply(DOC_PROBE).replace(/\n/g, "\r\n")]);
    const { rtCliQuery } = load(agent);

    expect(await rtCliQuery(["doc-probe", "docs/f/REQ-f.md"], "probe")).toEqual(DOC_PROBE);
    expect(agent.calls).toHaveLength(1);
  });

  it("verifies a reply whose final newline the model dropped", async () => {
    const agent = scriptedAgent([cliReply(DOC_PROBE).replace(/\n$/, "")]);
    const { rtCliQuery } = load(agent);
    expect(await rtCliQuery(["doc-probe", "docs/f/REQ-f.md"], "probe")).toEqual(DOC_PROBE);
    expect(agent.calls).toHaveLength(1);
  });

  it("never accepts a JSON line without its digest line", async () => {
    const agent = scriptedAgent([JSON.stringify(DOC_PROBE)]);
    const { rtCliQuery } = load(agent);

    expect(await rtCliQuery(["doc-probe", "docs/f/REQ-f.md"], "probe")).toBeNull();
    expect(agent.calls).toHaveLength(ATTEMPTS);
  });

  it("retries a digest mismatch, escalates the model, and returns null on exhaustion", async () => {
    // A plausibly-mangled line of the RIGHT shape — the defect a length or
    // "looks like JSON" check cannot catch.
    const mangled = `{"ok":true,"complete":false}\nDIGEST: sha256:${cliDigest(
      JSON.stringify(DOC_PROBE)
    )}`;
    const logged = [];
    const agent = scriptedAgent([mangled]);
    const { rtCliQuery } = loadAdapter({ agent, parallel: hostParallel, log: (m) => logged.push(m) });

    expect(await rtCliQuery(["doc-probe", "docs/f/REQ-f.md"], "probe")).toBeNull();
    expect(agent.calls).toHaveLength(ATTEMPTS);
    expect(agent.calls.map((c) => c.opts.model)).toEqual(
      Array.from({ length: ATTEMPTS }, (_, i) =>
        i < RT_READ_ESCALATE_AFTER ? RT_IO_MODEL : RT_IO_MODEL_HARD
      )
    );
    // The last attempt is on the harder model, and a warning names the command.
    expect(agent.calls[ATTEMPTS - 1].opts.model).toBe(RT_IO_MODEL_HARD);
    expect(logged.join("\n")).toContain(`node ${base.RT_CLI_PATH} 'doc-probe' 'docs/f/REQ-f.md'`);
  });

  it("recovers on a later attempt when an earlier reply was mangled", async () => {
    const agent = scriptedAgent(["nonsense", cliReply(DOC_PROBE)]);
    const { rtCliQuery } = load(agent);

    expect(await rtCliQuery(["doc-probe", "docs/f/REQ-f.md"], "probe")).toEqual(DOC_PROBE);
    expect(agent.calls).toHaveLength(2);
  });

  it("retries a digest-verified line that is not JSON, then returns null", async () => {
    const line = "usage: pdlc-cli doc-probe <path>";
    const agent = scriptedAgent([`${line}\nDIGEST: sha256:${cliDigest(line)}`]);
    const { rtCliQuery } = load(agent);

    expect(await rtCliQuery(["doc-probe", "docs/f/REQ-f.md"], "probe")).toBeNull();
    expect(agent.calls).toHaveLength(ATTEMPTS);
  });

  it("retries a dispatch that throws, then returns null", async () => {
    const agent = scriptedAgent([new Error("api 400")]);
    const { rtCliQuery } = load(agent);

    expect(await rtCliQuery(["doc-probe", "docs/f/REQ-f.md"], "probe")).toBeNull();
    expect(agent.calls).toHaveLength(ATTEMPTS);
  });

  it("returns an ok:false result unchanged, without retrying it", async () => {
    // `{ok:false}` is a judgment the CLI reached, not a transport fault: the
    // module turns it into a halt, and re-asking would re-derive the same answer.
    const result = { ok: false, message: "cross-review listing could not be judged" };
    const agent = scriptedAgent([cliReply(result)]);
    const { rtCliQuery } = load(agent);

    expect(await rtCliQuery(["review-state", "f", "REQ"], "probe")).toEqual(result);
    expect(agent.calls).toHaveLength(1);
  });
});

describe("the three probe seams", () => {
  it("_probeDoc omits the doc type when it has none, and appends it when it does", async () => {
    const agent = scriptedAgent([cliReply(DOC_PROBE)]);
    const { rtProbeDoc } = load(agent);

    expect(await rtProbeDoc("docs/f/REQ-f.md")).toEqual(DOC_PROBE);
    expect(agent.calls[0].prompt).toContain(`node ${base.RT_CLI_PATH} 'doc-probe' 'docs/f/REQ-f.md'\n`);

    expect(await rtProbeDoc("docs/f/REQ-f.md", "REQ")).toEqual(DOC_PROBE);
    expect(agent.calls[1].prompt).toContain(
      `node ${base.RT_CLI_PATH} 'doc-probe' 'docs/f/REQ-f.md' 'REQ'`
    );
  });

  it("_probeReviewState passes feature and doc type, in that order", async () => {
    const state = { ok: true, startIndex: 1, endIndex: 1, present: {}, reviewFiles: {}, matched: [], files: [] };
    const agent = scriptedAgent([cliReply(state)]);
    const { rtProbeReviewState } = load(agent);

    expect(await rtProbeReviewState({ feature: "my feat", docType: "REQ" })).toEqual(state);
    expect(agent.calls[0].prompt).toContain(
      `node ${base.RT_CLI_PATH} 'review-state' 'my feat' 'REQ'`
    );
  });

  it("_probePostmortem passes phase then feature", async () => {
    const pm = { status: "unresolved", path: "docs/f/POSTMORTEM-R-f.md", recommendation: "split the REQ" };
    const agent = scriptedAgent([cliReply(pm)]);
    const { rtProbePostmortem } = load(agent);

    expect(await rtProbePostmortem({ phase: "R", feature: "f" })).toEqual(pm);
    expect(agent.calls[0].prompt).toContain(`node ${base.RT_CLI_PATH} 'postmortem' 'R' 'f'`);
  });

  it("dispatches nothing when an argument the CLI requires is absent", async () => {
    const agent = scriptedAgent([cliReply(DOC_PROBE)]);
    const { rtProbeDoc, rtProbeReviewState, rtProbePostmortem } = load(agent);

    expect(await rtProbeDoc("")).toBeNull();
    expect(await rtProbeReviewState({ feature: "f", docType: null })).toBeNull();
    expect(await rtProbeReviewState()).toBeNull();
    expect(await rtProbePostmortem({ phase: "R" })).toBeNull();
    expect(agent.calls).toHaveLength(0);
  });

  it("wires all three into rtDevInjections", () => {
    const inj = base.rtDevInjections({});
    expect(inj._probeDoc).toBe(base.rtProbeDoc);
    expect(inj._probeReviewState).toBe(base.rtProbeReviewState);
    expect(inj._probePostmortem).toBe(base.rtProbePostmortem);
  });
});

describe("probes and the read cache do not interact", () => {
  const PATH = "docs/f/REQ-f.md";
  const CONTENTS = "# REQ\n\nbody line\n";

  /** One agent double serving both `rtReadFile`'s prompts and the CLI's. */
  function mixedAgent(files, probeReply) {
    const backing = fileAgent(files);
    const calls = [];
    const agent = async (prompt, opts) => {
      calls.push({ prompt, opts });
      if (prompt.includes(base.RT_CLI_PATH)) return probeReply;
      return backing(prompt, opts);
    };
    agent.calls = calls;
    return agent;
  }

  it("a doc-probe after a cached read still dispatches — no cache hit", async () => {
    const agent = mixedAgent({ [PATH]: CONTENTS }, cliReply(DOC_PROBE));
    const { rtReadFile, rtProbeDoc } = load(agent);

    expect(await rtReadFile(PATH)).toBe(CONTENTS);
    const afterRead = agent.calls.length;

    expect(await rtProbeDoc(PATH)).toEqual(DOC_PROBE);
    expect(agent.calls.length).toBe(afterRead + 1);
    expect(agent.calls[afterRead].prompt).toContain(base.RT_CLI_PATH);
  });

  it("a probe seeds nothing: the entry a prior read left is untouched, and a probe alone leaves none", async () => {
    const agent = mixedAgent({ [PATH]: CONTENTS }, cliReply(DOC_PROBE));
    const { rtReadFile, rtProbeDoc, rtCacheGet } = load(agent);

    // A probe on its own must not create an entry — the probe never holds bytes.
    expect(await rtProbeDoc(PATH)).toEqual(DOC_PROBE);
    expect(rtCacheGet(PATH)).toBeNull();

    // Nor may it invalidate one a read legitimately earned: the read after it is
    // still served from cache (one probe agent, no chunk agents).
    expect(await rtReadFile(PATH)).toBe(CONTENTS);
    const seeded = rtCacheGet(PATH);
    expect(seeded).not.toBeNull();
    expect(await rtProbeDoc(PATH)).toEqual(DOC_PROBE);
    expect(rtCacheGet(PATH)).toBe(seeded);
  });
});
