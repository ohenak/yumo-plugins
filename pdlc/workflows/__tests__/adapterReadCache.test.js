/**
 * adapterReadCache.test.js — the adapter's invocation-scoped read cache.
 *
 * REQ-RTCACHE-01..05 (`docs/pdlc-adapter-read-cache/REQ-pdlc-adapter-read-cache.md`).
 *
 * ## Why the cache exists
 *
 * `rtReadFile` costs one probe agent plus ⌈size/RT_READ_CHUNK⌉ transcription
 * agents. The workflow modules call their `_readFile` seam once per CONCERN —
 * `refreshReviewState`, `tier2ApprovalRecord` and the feedback dispatch each
 * read the same cross-review independently — so a 40 KB review file was
 * measured being fully re-read three times inside eight minutes, ≥21 chunk
 * agents for bytes the invocation already held.
 *
 * ## The bound that makes it safe
 *
 * A cache that can serve a byte that differs from disk is worse than no cache:
 * `isComplete`, `extractFileVerdict` and the approval anchors are all computed
 * from these bytes, so a stale serve corrupts gating decisions SILENTLY. The
 * decisive case is not the adapter's own write seam — it is the file a
 * dispatched reviewer or author agent rewrote with its own tools, which the
 * adapter never saw. Hence the shape under test here: nothing is served from
 * cache until a probe has positively established, by size AND whole-file
 * SHA-256, that the file is unchanged, and every other outcome falls back to a
 * full verified read.
 *
 * The probe is the one `rtReadFile` already had to pay for, which is what makes
 * REQ-RTCACHE-02's "at most one agent" true on the hit path and free on the
 * miss path.
 */

import { fileAgent, hostParallel, loadAdapter } from "./helpers/adapterHarness.js";

const PATH = "docs/feat/CROSS-REVIEW-software-engineer-REQ-v5.md";
const OTHER = "docs/feat/REQ-feat.md";

/** ~60 KB of line-structured markdown: ten chunks under RT_READ_CHUNK. */
const BODY = Array.from({ length: 2000 }, (_, i) => `line ${i} — sección 中文`).join("\n") + "\n";
const BODY_2 = BODY.replace("line 7 ", "line 7 EDITED ");

/**
 * An adapter over an in-memory tree, with the host `log` captured and an
 * optional hook that runs BEFORE each agent double answers — the only way to
 * observe cache state at the instant a write is dispatched rather than after
 * it has resolved.
 *
 * @param {Record<string,string>} files
 * @param {{corrupt?: Function, onCall?: (prompt: string, adapter: any) => void}} [hooks]
 */
function harness(files, hooks = {}) {
  const logs = [];
  const inner = fileAgent(files, hooks.corrupt);
  let adapter;
  const agent = async (prompt, opts) => {
    if (hooks.onCall) hooks.onCall(prompt, adapter);
    return inner(prompt, opts);
  };
  agent.calls = inner.calls;
  adapter = loadAdapter({
    agent,
    parallel: hostParallel,
    log: (message) => logs.push(String(message)),
  });
  return { adapter, agent, logs, files };
}

/** Probe prompts are the ones carrying `wc -c`; everything else is a chunk. */
const probes = (agent) => agent.calls.filter((c) => /wc -c/.test(c.prompt));
const chunks = (agent) => agent.calls.filter((c) => /sed -n '\d+,\d+p'/.test(c.prompt));
const reset = (agent) => {
  agent.calls.length = 0;
};

// ─── (a) the hit path: one agent, identical bytes ─────────────────────────────

describe("a repeated read of an unchanged file (REQ-RTCACHE-02)", () => {
  it("costs exactly ONE agent — the revalidation probe — and no chunk agents", async () => {
    const { adapter, agent } = harness({ [PATH]: BODY });

    const first = await adapter.rtReadFile(PATH);
    expect(first).toBe(BODY);
    // The cost the cache exists to avoid: a probe plus a chunk fan-out.
    expect(probes(agent)).toHaveLength(1);
    expect(chunks(agent).length).toBeGreaterThan(1);

    reset(agent);
    const second = await adapter.rtReadFile(PATH);

    expect(second).toBe(BODY);
    expect(agent.calls).toHaveLength(1);
    expect(chunks(agent)).toHaveLength(0);
  });

  it("serves byte-identical text, including multi-byte content and the final newline", async () => {
    const tricky = "sección — 中文 🚀\n\n\ttabbed\n\n";
    const { adapter } = harness({ [PATH]: tricky });

    expect(await adapter.rtReadFile(PATH)).toBe(tricky);
    expect(await adapter.rtReadFile(PATH)).toBe(tricky);
  });

  it("holds independently per path — a hit on one file is not a hit on another", async () => {
    const { adapter, agent } = harness({ [PATH]: BODY, [OTHER]: "# REQ\n\nbody\n" });

    await adapter.rtReadFile(PATH);
    reset(agent);

    expect(await adapter.rtReadFile(OTHER)).toBe("# REQ\n\nbody\n");
    expect(chunks(agent).length).toBeGreaterThan(0); // OTHER was never cached
    reset(agent);

    expect(await adapter.rtReadFile(PATH)).toBe(BODY);
    expect(agent.calls).toHaveLength(1); // …and PATH still is
  });

  it("logs the hit, naming the path and the chunk agents avoided (REQ-RTCACHE-05)", async () => {
    const { adapter, logs } = harness({ [PATH]: BODY });

    await adapter.rtReadFile(PATH);
    const before = logs.length;
    await adapter.rtReadFile(PATH);

    const line = logs.slice(before).join("\n");
    expect(line).toContain(PATH);
    expect(line).toMatch(/cache/i);
    // The operator's question is "why is nothing happening?", so the narration
    // must state the saving, not merely that a cache exists.
    expect(line).toMatch(/\d+ chunk agent\(s\) avoided/);
  });
});

// ─── (b) the correctness bound: revalidation, not memory ──────────────────────

describe("a file mutated outside the write seam (REQ-RTCACHE-01)", () => {
  it("is re-read in full, and the NEW bytes are returned", async () => {
    const files = { [PATH]: BODY };
    const { adapter, agent } = harness(files);

    expect(await adapter.rtReadFile(PATH)).toBe(BODY);

    // A reviewer agent rewrote the file with its own tools. The adapter never
    // saw the write; only the probe's digest can catch it.
    files[PATH] = BODY_2;
    reset(agent);
    const after = await adapter.rtReadFile(PATH);

    expect(after).toBe(BODY_2);
    expect(after).not.toBe(BODY);
    expect(chunks(agent).length).toBeGreaterThan(0);
  });

  it("detects a SAME-SIZE edit, which a size-only fingerprint would miss", async () => {
    // BODY_2 is longer than BODY, so it proves nothing about digests. This one
    // swaps characters and keeps the byte count identical.
    const same = BODY.replace("line 7 ", "line X ");
    expect(Buffer.byteLength(same)).toBe(Buffer.byteLength(BODY));

    const files = { [PATH]: BODY };
    const { adapter } = harness(files);
    await adapter.rtReadFile(PATH);

    files[PATH] = same;
    expect(await adapter.rtReadFile(PATH)).toBe(same);
  });

  it("re-caches the new bytes, so the read after the change is cheap again", async () => {
    const files = { [PATH]: BODY };
    const { adapter, agent } = harness(files);
    await adapter.rtReadFile(PATH);

    files[PATH] = BODY_2;
    await adapter.rtReadFile(PATH);
    reset(agent);

    expect(await adapter.rtReadFile(PATH)).toBe(BODY_2);
    expect(agent.calls).toHaveLength(1);
  });

  it("forgets the entry when the file is deleted, and again when it is empty", async () => {
    const files = { [PATH]: BODY };
    const { adapter } = harness(files);
    await adapter.rtReadFile(PATH);

    delete files[PATH];
    expect(await adapter.rtReadFile(PATH)).toBeNull();
    expect(adapter.rtCacheGet(PATH)).toBeNull();

    files[PATH] = BODY;
    await adapter.rtReadFile(PATH);
    files[PATH] = "";
    expect(await adapter.rtReadFile(PATH)).toBe("");
    expect(adapter.rtCacheGet(PATH)).toBeNull();
  });
});

describe("a probe that cannot be trusted (REQ-RTCACHE-01, fail open)", () => {
  it("retries a garbled probe reply rather than reading it as a mismatch", async () => {
    // Probe #1 serves the first read; probe #2 — the revalidation — comes back
    // as prose, and only probe #3 answers. rtReadProbe's own retry budget
    // absorbs it, so this is still a hit and still costs no chunk agent.
    let probeCalls = 0;
    const { adapter, agent } = harness(
      { [PATH]: BODY },
      {
        corrupt: (prompt) => {
          if (!/wc -c/.test(prompt)) return undefined;
          probeCalls += 1;
          return probeCalls === 2 ? "sure! the file looks fine" : undefined;
        },
      }
    );

    await adapter.rtReadFile(PATH);
    reset(agent);

    expect(await adapter.rtReadFile(PATH)).toBe(BODY);
    expect(chunks(agent)).toHaveLength(0);
    expect(probes(agent)).toHaveLength(2);
  });

  it("throws rather than serving the cached text when the probe never parses", async () => {
    let dead = false;
    const { adapter, agent } = harness(
      { [PATH]: BODY },
      { corrupt: (prompt) => (dead && /wc -c/.test(prompt) ? "I could not run that." : undefined) }
    );

    expect(await adapter.rtReadFile(PATH)).toBe(BODY);

    // The probe is also the read's PLAN — there is no fuller read to fall back
    // to — so an exhausted probe fails the read exactly as it did before the
    // cache existed. What must not happen is the cache papering over it.
    dead = true;
    await expect(adapter.rtReadFile(PATH)).rejects.toThrow(/unparseable probe reply/);

    // …and the entry did not survive the failure.
    expect(adapter.rtCacheGet(PATH)).toBeNull();
    dead = false;
    reset(agent);
    expect(await adapter.rtReadFile(PATH)).toBe(BODY);
    expect(chunks(agent).length).toBeGreaterThan(0);
  });

  it("drops the entry when a chunk read fails, leaving nothing stale behind", async () => {
    // A one-line file, so the failing range cannot be bisected and the read
    // gives up after its retry budget instead of exploring 2^8 splits.
    const short = "one line only\n";
    let breakChunks = false;
    const { adapter } = harness(
      { [PATH]: short },
      { corrupt: (prompt) => (breakChunks && /sed -n/.test(prompt) ? "```\nnope\n```" : undefined) }
    );

    expect(await adapter.rtReadFile(PATH)).toBe(short);
    expect(adapter.rtCacheGet(PATH)).not.toBeNull();

    // A stale entry whose fingerprint cannot match forces the (now broken)
    // chunk path, which is the case under test: the read throws, and it must
    // not leave the entry behind for the next call to serve.
    adapter.rtCachePut(PATH, "STALE", 1, "0".repeat(64));
    breakChunks = true;
    await expect(adapter.rtReadFile(PATH)).rejects.toThrow();
    expect(adapter.rtCacheGet(PATH)).toBeNull();
  });
});

// ─── (c) seam writes invalidate before they resolve (REQ-RTCACHE-03) ──────────

describe("adapter-seam writes", () => {
  for (const [label, call] of [
    ["rtWriteFile", (adapter) => adapter.rtWriteFile(PATH, "new contents\n")],
    ["rtAppendFile", (adapter) => adapter.rtAppendFile(PATH, "\nVERDICT: Approved\n")],
  ]) {
    it(`${label} invalidates BEFORE its agent is dispatched`, async () => {
      const seen = [];
      const files = { [PATH]: BODY };
      const { adapter } = harness(files, {
        onCall: (prompt, a) => {
          if (/PDLC_CONTENT_BEGIN/.test(prompt)) seen.push(a.rtCacheGet(PATH));
        },
      });

      await adapter.rtReadFile(PATH);
      expect(adapter.rtCacheGet(PATH)).not.toBeNull();

      await call(adapter);

      // Observed from inside the write agent: by the time the dispatch happens
      // the entry is already gone, so a read racing in cannot see it.
      expect(seen).toEqual([null]);
      expect(adapter.rtCacheGet(PATH)).toBeNull();
    });

    it(`${label} does not repopulate the cache from what it asked to be written`, async () => {
      const files = { [PATH]: BODY };
      const { adapter, agent } = harness(files);
      await adapter.rtReadFile(PATH);

      await call(adapter);
      // The write agent's "ok" is a report, not evidence of the bytes on disk.
      // Whatever ends up there, the next read re-verifies it from the file.
      files[PATH] = BODY_2;
      reset(agent);

      expect(await adapter.rtReadFile(PATH)).toBe(BODY_2);
      expect(chunks(agent).length).toBeGreaterThan(0);
    });
  }

  it("leaves other paths' entries alone", async () => {
    const { adapter, agent } = harness({ [PATH]: BODY, [OTHER]: "# REQ\n" });
    await adapter.rtReadFile(PATH);

    await adapter.rtWriteFile(OTHER, "# REQ v2\n");
    reset(agent);

    expect(await adapter.rtReadFile(PATH)).toBe(BODY);
    expect(agent.calls).toHaveLength(1);
  });
});

// ─── (d) lifetime is one invocation (REQ-RTCACHE-04) ──────────────────────────

describe("cache lifetime", () => {
  it("starts empty in a freshly evaluated adapter — nothing is shared or persisted", async () => {
    const first = harness({ [PATH]: BODY });
    await first.adapter.rtReadFile(PATH);
    expect(first.adapter.rtCacheGet(PATH)).not.toBeNull();

    // A second evaluation of the same shipped source is what a new invocation
    // (or a resume) gets: the cache lives in script memory, so it is empty.
    const second = harness({ [PATH]: BODY });
    expect(second.adapter.rtCacheGet(PATH)).toBeNull();

    expect(await second.adapter.rtReadFile(PATH)).toBe(BODY);
    expect(chunks(second.agent).length).toBeGreaterThan(0);

    // …and the first invocation's cache was untouched by the second's read.
    reset(first.agent);
    expect(await first.adapter.rtReadFile(PATH)).toBe(BODY);
    expect(first.agent.calls).toHaveLength(1);
  });
});

// ─── (e) the byte cap and eviction order (REQ §6) ─────────────────────────────

describe("eviction", () => {
  // Driven through the cache functions directly: reaching a 2 MiB cap through
  // rtReadFile would mean transporting megabytes through the chunk agents.
  const entry = (n) => "x".repeat(n);
  const sha = (c) => c.repeat(64);

  it("caps at 2 MiB, the value the REQ derives", () => {
    const { adapter } = harness({});
    expect(adapter.RT_READ_CACHE_MAX_BYTES).toBe(2097152);
  });

  it("evicts OLDEST-INSERTED first when an insert would exceed the cap", () => {
    const { adapter } = harness({});
    const { rtCachePut, rtCacheGet } = adapter;

    rtCachePut("a", entry(1000000), 1000000, sha("a"));
    rtCachePut("b", entry(1000000), 1000000, sha("b"));
    // 2,000,000 + 500,000 > 2,097,152 → the oldest, "a", goes.
    rtCachePut("c", entry(500000), 500000, sha("c"));

    expect(rtCacheGet("a")).toBeNull();
    expect(rtCacheGet("b").text).toBe(entry(1000000));
    expect(rtCacheGet("c").text).toBe(entry(500000));
  });

  it("evicts as many oldest entries as it takes, and no more", () => {
    const { adapter } = harness({});
    const { rtCachePut, rtCacheGet } = adapter;

    rtCachePut("a", entry(600000), 600000, sha("a"));
    rtCachePut("b", entry(600000), 600000, sha("b"));
    rtCachePut("c", entry(600000), 600000, sha("c"));
    // 1,800,000 + 400,000 = 2,200,000 > cap → drop "a" (1,600,000 + 400,000 fits).
    rtCachePut("d", entry(400000), 400000, sha("d"));

    expect(rtCacheGet("a")).toBeNull();
    expect(rtCacheGet("b")).not.toBeNull();
    expect(rtCacheGet("c")).not.toBeNull();
    expect(rtCacheGet("d")).not.toBeNull();
  });

  it("orders by INSERTION, not by last use — a re-read does not renew an entry", () => {
    // Deliberate: the counter is insertion-order because the runtime has no
    // clock, and LRU would need one more piece of mutable bookkeeping for no
    // measured benefit. Pinned so a "helpful" change to LRU is a decision, not
    // an accident.
    const { adapter } = harness({});
    const { rtCachePut, rtCacheGet } = adapter;

    rtCachePut("a", entry(10), 10, sha("a"));
    rtCachePut("b", entry(10), 10, sha("b"));
    expect(rtCacheGet("a")).not.toBeNull(); // "using" a
    // 20 + 2,097,150 > cap, and still over it after "a" alone goes, so both
    // older entries are evicted in insertion order.
    rtCachePut("c", entry(2097150), 2097150, sha("c"));

    // Both older entries went; a's read did not protect it.
    expect(rtCacheGet("a")).toBeNull();
    expect(rtCacheGet("b")).toBeNull();
    expect(rtCacheGet("c")).not.toBeNull();
  });

  it("re-caching a path takes a NEW insertion position and frees the old bytes", () => {
    const { adapter } = harness({});
    const { rtCachePut, rtCacheGet } = adapter;

    rtCachePut("a", entry(900000), 900000, sha("a"));
    rtCachePut("b", entry(600000), 600000, sha("b"));
    rtCachePut("a", entry(900000), 900000, sha("d")); // refreshed, now newest
    // 1,500,000 + 700,000 > cap → one eviction, and the oldest is now "b".
    rtCachePut("c", entry(700000), 700000, sha("c"));

    // If the first "a" had not released its bytes the accounting would have
    // over-evicted; if "a" had kept its old position it, not "b", would be gone.
    expect(rtCacheGet("b")).toBeNull();
    expect(rtCacheGet("a")).not.toBeNull();
    expect(rtCacheGet("c")).not.toBeNull();
  });

  it("does not cache an entry larger than the whole cap — and the read still succeeds", async () => {
    const { adapter } = harness({ [PATH]: BODY });
    const huge = adapter.RT_READ_CACHE_MAX_BYTES + 1;

    expect(adapter.rtCachePut("huge", "…", huge, sha("f"))).toBe(false);
    expect(adapter.rtCacheGet("huge")).toBeNull();
    // Nothing else was evicted to make room for something that could not fit.
    await adapter.rtReadFile(PATH);
    expect(adapter.rtCachePut("huge", "…", huge, sha("f"))).toBe(false);
    expect(adapter.rtCacheGet(PATH)).not.toBeNull();

    // The read path itself is unaffected: an oversized file is transported and
    // returned, it simply is not remembered.
    expect(await adapter.rtReadFile(PATH)).toBe(BODY);
  });

  it("invalidating an absent path is a no-op that does not corrupt the accounting", () => {
    const { adapter } = harness({});
    const { rtCachePut, rtCacheGet, rtCacheInvalidate } = adapter;

    expect(rtCacheInvalidate("never-cached")).toBe(false);
    expect(rtCacheInvalidate("never-cached")).toBe(false);

    rtCachePut("a", entry(2000000), 2000000, sha("a"));
    rtCachePut("b", entry(90000), 90000, sha("b"));
    // 2,090,000 ≤ cap: nothing should have been evicted, which only holds if
    // the two failed invalidations did not decrement the byte total.
    expect(rtCacheGet("a")).not.toBeNull();
    expect(rtCacheGet("b")).not.toBeNull();
  });
});
