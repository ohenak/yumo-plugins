/**
 * hashFileSeam.test.js — the `_hashFile` seam.
 *
 * ## Why the seam exists
 *
 * Two sites in `orchestrate-dev.js` read an ENTIRE document and then throw the
 * bytes away, keeping only their digest:
 *
 *   1. `reviewLoop`'s round anchor (§5.3 t0/t1) — once per review round, over
 *      the largest document in the pipeline;
 *   2. `phaseGate`'s staleness comparison (§2.5 step 4, §5.5 rule 1).
 *
 * In Node that is a `readFileSync`. In the workflow runtime `_readFile` is
 * `rtReadFile`: a probe agent plus roughly one transcription agent per 6 KB,
 * every chunk SHA-verified. A 300 KB REQ therefore cost ~52 agents to produce
 * 64 hex characters, once per round. `_hashFile` computes the digest at the far
 * side of the seam instead, so both sites cost ONE IO agent.
 *
 * ## What is asserted here
 *
 * This is a **transport** change, so the suite is built around equivalence, not
 * around the new code path being "exercised":
 *
 *   - the shipped default returns exactly `approvalHashOf(file bytes)` — the
 *     canonicalised, `sha256:`-prefixed form the `APPROVAL-HASH:` line carries,
 *     NOT a raw `shasum` of the file — and `null` for an absent file, matching
 *     `defaultReadFile`'s never-throw contract;
 *   - the anchor path consults `_hashFile` and no longer `_readFile`s the
 *     document (the saving, pinned — an absent read is otherwise indistinguishable
 *     from a test that stopped reaching the site);
 *   - the adapter's `rtHashFile` carries `rtReadProbe`'s double-print
 *     flip-detection discipline, its retry budget and its missing-file sentinel.
 *
 * The staleness site's half of the same claim lives with its own fixture, in
 * `approvalSearch.test.js` (`RLH-AT-08`), and the round-anchor value itself is
 * pinned by `approvalHash.test.js`. Neither is duplicated here.
 */

import { createHash } from "crypto";
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { approvalHashOf, canonicaliseForDigest, reviewLoop } from "../orchestrate-dev.js";
import { loadAdapter } from "./helpers/adapterHarness.js";
import { fakeGit } from "./helpers/seams.js";

// ─── shared reviewLoop driver ─────────────────────────────────────────────────

const REVIEWERS = ["se-review", "te-review"];
const APPROVE = 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';

/**
 * Drive one converging round of `reviewLoop` over `doc` and return the anchor
 * lines it appended, plus every path `_readFile` was asked for.
 *
 * `_readFile` answers with a stub cross-review body for EVERY path, because
 * `appendApprovalAnchors` reads each review file before appending to it and
 * abandons the anchor when that read is null. It therefore doubles as the
 * observation: if the anchor path still whole-file-read the document, `doc`
 * would appear in `reads`.
 */
async function runRound(doc, extra = {}) {
  const reads = [];
  const appends = [];
  const logs = [];

  const result = await reviewLoop({
    doc,
    phase: "R",
    docType: "REQ",
    reviewers: REVIEWERS,
    optimizer: "pm-author",
    feature: "hash-feat",
    _agent: async (skill) => (REVIEWERS.includes(skill) ? APPROVE : ""),
    _parallel: (thunks) => Promise.all(thunks),
    _checkFile: () => ({ ok: true }),
    _listFiles: () => ({ ok: true, files: [] }),
    _readFile: (path) => {
      reads.push(path);
      return "## Verdict\n\nVERDICT: Approved\n";
    },
    _appendFile: (path, text) => appends.push({ path, text }),
    // `reviewLoop` re-checks the working tree's branch at entry and reads HEAD
    // for the anchor's `REVIEWED-COMMIT`, so the git seam must answer both.
    _git: fakeGit((argv) => ({
      ok: true,
      stdout: argv.includes("--abbrev-ref") ? "feat-hash-feat" : "0".repeat(40),
    })),
    _log: (message) => logs.push(String(message)),
    ...extra,
  });

  const anchorLine = appends.length
    ? /APPROVAL-HASH: (\S+)/.exec(appends[0].text)
    : null;

  return { result, reads, appends, logs, anchor: anchorLine && anchorLine[1] };
}

/** A real file on disk — the default `_hashFile` reads the filesystem, by design. */
function tempDoc(contents) {
  const dir = mkdtempSync(join(tmpdir(), "pdlc-hashfile-"));
  const path = join(dir, "REQ-hash-feat.md");
  writeFileSync(path, contents, "utf8");
  return path;
}

// ─── (a) the shipped default ──────────────────────────────────────────────────

describe("the default `_hashFile` is `approvalHashOf` over the file's bytes", () => {
  // Each case is a canonicalisation trap: a raw `sha256sum` of the file on disk
  // differs from `approvalHashOf` for all but the first. The default must agree
  // with `approvalHashOf`, not with the file's literal bytes, because what it is
  // compared against is an `APPROVAL-HASH:` literal.
  const CASES = {
    "an ordinary LF document": "# REQ\n\nbody\n",
    "no trailing newline": "# REQ\n\nbody",
    "several trailing newlines": "# REQ\n\nbody\n\n\n\n",
    "CRLF line endings": "# REQ\r\n\r\nbody\r\n",
    "an empty document": "",
    "multi-byte content": "# REQ — sección 中文 🚀\n",
  };

  it.each(Object.entries(CASES))(
    "%s: the recorded anchor is approvalHashOf(bytes)",
    async (_label, contents) => {
      // `_hashFile` deliberately NOT injected: this is the shipped default.
      const doc = tempDoc(contents);
      const { result, anchor, reads } = await runRound(doc);

      expect(result.converged).toBe(true);
      expect(anchor).toBe(approvalHashOf(contents));
      expect(anchor).toMatch(/^sha256:[0-9a-f]{64}$/);
      // …and the document itself was never read whole to get there.
      expect(reads).not.toContain(doc);
    }
  );

  it("is the digest of the CANONICALISED text, not of the file as it sits on disk", () => {
    // Stated once, directly, so the property above cannot be satisfied by a
    // default that happens to agree with `shasum` on the LF case alone.
    const raw = "# REQ\r\n\r\nbody\r\n\r\n\r\n";
    const rawDigest = createHash("sha256").update(Buffer.from(raw, "utf8")).digest("hex");
    const canonicalDigest = createHash("sha256")
      .update(Buffer.from(canonicaliseForDigest(raw), "utf8"))
      .digest("hex");

    expect(rawDigest).not.toBe(canonicalDigest);
    expect(approvalHashOf(raw)).toBe(`sha256:${canonicalDigest}`);
  });

  it("returns null for an absent document, so the round yields no approval", async () => {
    const missing = join(tmpdir(), "pdlc-hashfile-absent", "REQ-hash-feat.md");
    const { result, appends, logs } = await runRound(missing);

    // Identical to the behaviour of the whole-file read this replaced: a
    // document that cannot be read produces no anchor, and the loop says so
    // rather than recording a digest of nothing.
    expect(result.converged).toBe(true);
    expect(appends).toEqual([]);
    expect(logs.join("\n")).toContain("Approval anchor not recorded");
  });
});

// ─── (b) the anchor path uses the seam, and only the seam ─────────────────────

describe("reviewLoop's round anchor is taken through `_hashFile`", () => {
  it("calls the injected `_hashFile` once per round with the document path", async () => {
    const doc = "docs/hash-feat/REQ-hash-feat.md";
    const hashed = [];
    const stub = `sha256:${"a".repeat(64)}`;

    const { result, anchor, reads } = await runRound(doc, {
      _hashFile: (path) => {
        hashed.push(path);
        return stub;
      },
    });

    expect(result.converged).toBe(true);
    // One round, one digest call — not one per chunk, and not one per reviewer.
    expect(hashed).toEqual([doc]);
    // The injected value is what reaches the cross-review file verbatim: no
    // re-derivation, no second read to "confirm" it.
    expect(anchor).toBe(stub);
    // The saving itself. `reads` still carries the two cross-review files, so
    // this is not vacuous — the seam is live, the document just is not on it.
    expect(reads).not.toContain(doc);
    expect(reads.length).toBeGreaterThan(0);
  });

  it("records no anchor when `_hashFile` reports the document unreadable", async () => {
    const { appends, logs } = await runRound("docs/hash-feat/REQ-hash-feat.md", {
      _hashFile: () => null,
    });

    expect(appends).toEqual([]);
    expect(logs.join("\n")).toContain("Approval anchor not recorded");
  });

  it("awaits the seam — an async `_hashFile` is not recorded as a promise", async () => {
    // The adapter's implementations are async and the doubles above are sync;
    // this is the case a missing `await` passes in every other test and fails
    // only in the runtime.
    const stub = `sha256:${"b".repeat(64)}`;
    const { anchor } = await runRound("docs/hash-feat/REQ-hash-feat.md", {
      _hashFile: async () => stub,
    });

    expect(anchor).toBe(stub);
  });
});

// ─── (c) the adapter side ─────────────────────────────────────────────────────

describe("rtHashFile", () => {
  const PATH = "docs/hash-feat/REQ-hash-feat.md";
  const DIGEST = "c".repeat(64);

  /** An agent double answering the digest prompt with `lines`, per attempt. */
  function agentReturning(replies) {
    const prompts = [];
    const agent = async (prompt) => {
      prompts.push(prompt);
      const reply = replies[Math.min(prompts.length - 1, replies.length - 1)];
      if (reply instanceof Error) throw reply;
      return reply;
    };
    agent.prompts = prompts;
    return agent;
  }

  const load = (agent) => loadAdapter({ agent });

  it("issues ONE agent call and returns the module's prefixed hash form", async () => {
    const agent = agentReturning([`${DIGEST}  -\n${DIGEST}  -`]);
    const { rtHashFile } = load(agent);

    expect(await rtHashFile(PATH)).toBe(`sha256:${DIGEST}`);
    // The whole point of the seam: one agent, whatever the file's size.
    expect(agent.prompts).toHaveLength(1);
  });

  it("canonicalises inside the command, in `canonicaliseForDigest`'s order", async () => {
    const agent = agentReturning([`${DIGEST}\n${DIGEST}`]);
    const { rtHashFile, RT_IO_MODEL } = load(agent);
    await rtHashFile(PATH);

    const [prompt] = agent.prompts;
    // CRLF first (sed, at end of line), then surviving lone CR (tr) — the same
    // order `canonicaliseForDigest` applies, and the only order that maps CRLF
    // to one newline rather than two.
    expect(prompt.indexOf("sed -e 's/\\r$//'")).toBeGreaterThan(-1);
    expect(prompt.indexOf("tr '\\r' '\\n'")).toBeGreaterThan(prompt.indexOf("sed -e 's/\\r$//'"));
    // N-2: command substitution strips every trailing newline, printf restores
    // exactly one.
    expect(prompt).toContain(`printf '%s\\n' "$(`);
    // Both platforms' hashers, as everywhere else in the adapter.
    expect(prompt).toContain("shasum -a 256");
    expect(prompt).toContain("sha256sum");
    expect(prompt).toContain(PATH);
    expect(RT_IO_MODEL).toBe("haiku");
  });

  it("prints the digest twice and rejects a reply whose two copies disagree", async () => {
    // rtReadProbe's discipline, and the defect it was written for: a live probe
    // lost a whole read to ONE flipped hex digit. A flip does not repeat
    // identically across two copies, so disagreement is retried, not returned.
    const flipped = `${DIGEST.slice(0, 40)}f${DIGEST.slice(41)}`;
    const agent = agentReturning([`${DIGEST}\n${flipped}`, `${DIGEST}\n${DIGEST}`]);
    const { rtHashFile } = load(agent);

    expect(await rtHashFile(PATH)).toBe(`sha256:${DIGEST}`);
    expect(agent.prompts).toHaveLength(2);
  });

  it("returns null on the missing-file sentinel, without retrying", async () => {
    const agent = agentReturning(["__PDLC_FILE_MISSING__"]);
    const { rtHashFile } = load(agent);

    expect(await rtHashFile(PATH)).toBeNull();
    expect(agent.prompts).toHaveLength(1);
  });

  it("treats a dead agent as a failed attempt and throws after the retry budget", async () => {
    const agent = agentReturning([new Error("agent died")]);
    const { rtHashFile, RT_READ_RETRIES } = load(agent);

    await expect(rtHashFile(PATH)).rejects.toThrow(/rtHashFile: unparseable digest reply/);
    expect(agent.prompts).toHaveLength(RT_READ_RETRIES + 1);
  });

  it("throws rather than returning a digest it could not verify", async () => {
    // One copy only — indistinguishable from a truncated or reformatted reply,
    // so it must never become a return value.
    const agent = agentReturning([`${DIGEST}`]);
    const { rtHashFile } = load(agent);

    await expect(rtHashFile(PATH)).rejects.toThrow(/rtHashFile/);
  });

  it("is the seam the composition root hands to main() as `_hashFile`", () => {
    const { rtDevInjections, rtHashFile } = load(agentReturning([""]));
    expect(rtDevInjections({})._hashFile).toBe(rtHashFile);
  });
});
