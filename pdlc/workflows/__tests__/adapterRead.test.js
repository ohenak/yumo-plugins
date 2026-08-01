/**
 * adapterRead.test.js — `rtReadFile`'s line-ranged, SHA-verified read.
 *
 * The defects this suite pins, in the order they were discovered live:
 *   1. a single-agent echo returned 102,429 bytes of a 209,953-byte document;
 *   2. a chunk agent's final message truncated at ≈4096 output tokens;
 *   3. the VM boundary rejected marshalled arrays over 4,096 elements;
 *   4. base64 replies of EXACTLY the right length diverged from the file
 *      mid-stream — 23 of 25 measured replies were corrupted transcriptions,
 *      one of them length-correct (runs wf_a985bc0f-d18 / wf_20fb1a29-246).
 *
 * Defect 4 is why length verification is not verification. The property under
 * test: the adapter returns the file's exact bytes, or it throws. A truncated,
 * fenced, or plausibly-mangled-but-same-length reply must never become a
 * return value — the per-chunk SHA-256, computed by the agent's own tool over
 * the same byte range, is what catches what a length check cannot.
 *
 * The pure helpers (`rtUtf8Encode`, `rtSha256Hex`, `rtLinePlan`) are tested
 * directly, because they are the whole verification argument: the runtime has
 * no Buffer, no crypto and no TextEncoder, so a bug in either silently
 * corrupts or falsely rejects every document the pipeline reads.
 */

import { createHash } from "crypto";
import { fileAgent, hostParallel, loadAdapter } from "./helpers/adapterHarness.js";

const adapter = loadAdapter();
const { rtUtf8Encode, rtSha256Hex, rtLinePlan, RT_READ_CHUNK, RT_READ_RETRIES } = adapter;

const utf8Bytes = (text) => [...Buffer.from(text, "utf8")];
const nodeSha = (text) => createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");

describe("rtUtf8Encode", () => {
  it("encodes 1-, 2-, 3- and 4-byte sequences exactly as Node does", () => {
    for (const text of ["plain ascii", "café", "中文字", "𝄞 clef", "🙂🚀", "a\nb\tc", ""]) {
      expect(rtUtf8Encode(text)).toEqual(utf8Bytes(text));
    }
  });

  it("throws on a lone surrogate instead of emitting replacement bytes", () => {
    expect(() => rtUtf8Encode("\ud83d")).toThrow(/lone surrogate/);
    expect(() => rtUtf8Encode("\ude00x")).toThrow(/lone surrogate/);
  });
});

describe("rtSha256Hex", () => {
  it("matches Node's crypto over ascii, multi-byte and multi-block inputs", () => {
    for (const text of [
      "",
      "abc",
      "The quick brown fox jumps over the lazy dog",
      "## sección — 中文 🚀\n".repeat(400), // several 64-byte blocks, multi-byte
      "x".repeat(55), // padding boundary: length % 64 == 55
      "x".repeat(56), // padding spills into a second block
      "x".repeat(64),
    ]) {
      expect(rtSha256Hex(rtUtf8Encode(text))).toBe(nodeSha(text));
    }
  });
});

describe("rtLinePlan", () => {
  it("covers [1, totalLines] inclusively with no gap and no overlap", () => {
    expect(rtLinePlan(25, 10)).toEqual([
      { first: 1, last: 10 },
      { first: 11, last: 20 },
      { first: 21, last: 25 },
    ]);
  });

  it("emits no empty trailing range when the count is an exact multiple", () => {
    expect(rtLinePlan(20, 10)).toEqual([
      { first: 1, last: 10 },
      { first: 11, last: 20 },
    ]);
  });

  it("plans nothing for zero lines, and one short range for one line", () => {
    expect(rtLinePlan(0, 10)).toEqual([]);
    expect(rtLinePlan(1, 10)).toEqual([{ first: 1, last: 1 }]);
  });

  it("keeps a chunk's target bytes within the IO agent's final-message token cap", () => {
    // A live agent's final message truncated at 9,885 chars (≈4096 output
    // tokens). A prose chunk's chars ≈ its bytes, so the target must sit under
    // that observed ceiling with headroom for the SHA line and sentinels.
    expect(RT_READ_CHUNK).toBeLessThanOrEqual(8000);
  });
});

describe("rtReadFile", () => {
  /** A document large enough to need several chunks, with multi-byte characters
   *  and line lengths that vary across chunk boundaries. */
  function bigDocument() {
    let text = "";
    while (Buffer.byteLength(text, "utf8") < RT_READ_CHUNK * 2 + 100) {
      text += `## sección ${text.length} — 中文 🚀\nbody line with ascii padding\n`;
    }
    return text;
  }

  /** The chunk plan rtReadFile derives for `contents`, reproduced for call counts. */
  function expectedChunks(contents) {
    const size = Buffer.byteLength(contents, "utf8");
    const newlines = (contents.match(/\n/g) || []).length;
    const displayLines = newlines + (contents.endsWith("\n") || contents === "" ? 0 : 1);
    const chunkCount = Math.max(1, Math.ceil(size / RT_READ_CHUNK));
    const perChunk = Math.max(1, Math.ceil(displayLines / chunkCount));
    return rtLinePlan(displayLines, perChunk).length;
  }

  it("returns null when the file is missing, without fetching any chunk", async () => {
    const agent = fileAgent({});
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBeNull();
    expect(agent.calls).toHaveLength(1);
  });

  it('returns "" for an empty file, without fetching any chunk', async () => {
    const agent = fileAgent({ "docs/f/REQ-f.md": "" });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe("");
    expect(agent.calls).toHaveLength(1);
  });

  it("reassembles a multi-chunk document byte-for-byte", async () => {
    const contents = bigDocument();
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });

    expect(await rtReadFile("docs/f/TSPEC-f.md")).toBe(contents);
    // 1 probe + one call per planned chunk — no whole-file echo remains.
    const expected = expectedChunks(contents);
    expect(expected).toBeGreaterThan(1);
    expect(agent.calls).toHaveLength(1 + expected);
  });

  it("reads a file with no trailing newline under GNU sed behaviour", async () => {
    const contents = "line one\nline two\nno final newline";
    const agent = fileAgent({ "docs/f/REQ-f.md": contents });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe(contents);
  });

  it("reads a file with no trailing newline under BSD sed behaviour", async () => {
    // BSD sed appends a newline to the final line; the whole-file SHA check
    // must strip it rather than throw or return the extra byte.
    const contents = "line one\nline two\nno final newline";
    const agent = fileAgent({ "docs/f/REQ-f.md": contents }, undefined, { bsdSed: true });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe(contents);
  });

  it("reads a document with CRLF line endings byte-for-byte", async () => {
    const contents = "col a\tcol b\r\nrow 1\r\nrow 2\r\n";
    const agent = fileAgent({ "docs/f/REQ-f.md": contents });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe(contents);
  });

  it("retries a mangled same-length transcription and returns the verified text", async () => {
    // Defect 4's exact shape: the reply has a plausible length but the model
    // drifted mid-stream. Only the SHA can catch this.
    const contents = bigDocument();
    let mangledOnce = false;
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt, reply) => {
      if (!mangledOnce && /sed -n/.test(prompt)) {
        mangledOnce = true;
        return reply.replace(/body line/, "b0dy line"); // same length, wrong bytes
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });

    expect(await rtReadFile("docs/f/TSPEC-f.md")).toBe(contents);
    expect(mangledOnce).toBe(true);
  });

  it("retries a truncated chunk transcription", async () => {
    const contents = bigDocument();
    let truncatedOnce = false;
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt, reply) => {
      if (!truncatedOnce && /sed -n/.test(prompt)) {
        truncatedOnce = true;
        const cut = Math.floor(reply.indexOf("__PDLC_CHUNK_EOF__") / 2);
        return reply.slice(0, cut);
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });

    expect(await rtReadFile("docs/f/TSPEC-f.md")).toBe(contents);
    expect(truncatedOnce).toBe(true);
  });

  it("retries a fenced chunk reply", async () => {
    const contents = bigDocument();
    let fencedOnce = false;
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt, reply) => {
      if (!fencedOnce && /sed -n/.test(prompt)) {
        fencedOnce = true;
        // A fence strips the tool-printed markers; extraction must fail and
        // the attempt retry rather than verify.
        return "```text\n" + reply.replace(/__PDLC_CHUNK_(BOF|EOF)__/g, "") + "\n```";
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });

    expect(await rtReadFile("docs/f/TSPEC-f.md")).toBe(contents);
    expect(fencedOnce).toBe(true);
  });

  it("throws — never returns corrupted content — when a chunk stays mangled", async () => {
    const contents = bigDocument();
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt, reply) => {
      // Chunk covering line 1 is always mangled; every other chunk is honest.
      if (/sed -n '1,/.test(prompt)) {
        return reply.replace(/body line/, "b0dy line");
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });

    await expect(rtReadFile("docs/f/TSPEC-f.md")).rejects.toThrow(
      /chunk 0 of "docs\/f\/TSPEC-f\.md"/
    );
    // Attempts are bounded: the mangled chunk retries out.
    const failing = agent.calls.filter((c) => /sed -n '1,/.test(c.prompt));
    expect(failing).toHaveLength(RT_READ_RETRIES + 1);
  });

  it("throws when a hallucinated SHA accompanies a mangled payload", async () => {
    // The model cannot compute the digest of its own mangled copy — but it can
    // emit 64 plausible hex chars. That must verify as a mismatch, not a pass.
    const contents = bigDocument();
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt, reply) => {
      if (/sed -n '1,/.test(prompt)) {
        return reply
          .replace(/body line/, "b0dy line")
          .replace(/SHA256: [0-9a-f]{64}/, `SHA256: ${"ab".repeat(32)}`);
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    await expect(rtReadFile("docs/f/TSPEC-f.md")).rejects.toThrow(/chunk 0/);
  });

  it("throws on an unparseable probe reply rather than guessing", async () => {
    const agent = fileAgent({ "docs/f/REQ-f.md": "hello" }, (prompt) =>
      /wc -c/.test(prompt) ? "The file is about five bytes." : undefined
    );
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    await expect(rtReadFile("docs/f/REQ-f.md")).rejects.toThrow(/unparseable probe reply/);
  });

  it("accepts a probe reply padded with whitespace, as BSD `wc` prints", async () => {
    const agent = fileAgent({ "docs/f/REQ-f.md": "hello\n" }, (prompt, reply) =>
      /wc -c/.test(prompt) ? `   ${reply.split("\n").join("\n   ")}\n` : undefined
    );
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe("hello\n");
  });

  it("throws when the reassembled text does not match the whole-file SHA", async () => {
    // Both chunks verify individually, but the probe's whole-file digest is
    // for different bytes — e.g. the file changed between probe and chunks.
    const contents = bigDocument();
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt, reply) =>
      /wc -c/.test(prompt)
        ? reply.replace(/[0-9a-f]{64}/g, "ab".repeat(32))
        : undefined
    );
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    await expect(rtReadFile("docs/f/TSPEC-f.md")).rejects.toThrow(
      /did not match the file's size and SHA-256/
    );
  });

  it("throws when the host parallel resolves a failed chunk thunk to null", async () => {
    // The host `parallel` swallows a thrown thunk. Without the adapter's own
    // check that would concatenate `undefined` into the document.
    const contents = bigDocument();
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt) =>
      /sed -n '1,/.test(prompt) ? "no sentinels at all" : undefined
    );
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    await expect(rtReadFile("docs/f/TSPEC-f.md")).rejects.toThrow(/chunk 0/);
  });

  it("returns each chunk across the VM boundary as a string, never a byte array", async () => {
    // The runtime rejects marshalled arrays longer than 4,096 elements (run
    // wf_a4034a6e-597). hostParallel models that cap, so a byte-array return
    // reproduces the live failure here.
    const contents = bigDocument();
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents });
    const { rtReadChunk } = loadAdapter({ agent, parallel: hostParallel });
    const part = await rtReadChunk("docs/f/TSPEC-f.md", { first: 1, last: 40 }, 0);
    expect(typeof part).toBe("string");
  });

  it("reads a chunk whose final line is blank — the live trailing-newline defect", async () => {
    // Run wf_c6751860-d4a: byte-perfect transcriptions failed all 4 attempts
    // because the payload's trailing blank line collapsed into the model's own
    // sentinel. The tool-printed EOF marker makes the blank line interior.
    const contents = "# heading\n\nbody\n\n\n";
    const agent = fileAgent({ "docs/f/REQ-f.md": contents });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe(contents);
  });

  it("retries when the model collapses a trailing blank line inside the payload", async () => {
    const contents = "# heading\n\nbody\n\n\n";
    let collapsedOnce = false;
    const agent = fileAgent({ "docs/f/REQ-f.md": contents }, (prompt, reply) => {
      if (!collapsedOnce && /sed -n/.test(prompt)) {
        collapsedOnce = true;
        return reply.replace("\n\n\n__PDLC_CHUNK_EOF__", "\n\n__PDLC_CHUNK_EOF__");
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe(contents);
    expect(collapsedOnce).toBe(true);
  });

  it("treats a dead agent (thrown API error) as a failed attempt, not a failed read", async () => {
    const contents = bigDocument();
    const inner = fileAgent({ "docs/f/TSPEC-f.md": contents });
    let threwOnce = false;
    const agent = async (prompt, opts) => {
      if (!threwOnce && /sed -n '1,/.test(prompt)) {
        threwOnce = true;
        throw new Error("API Error: 400 Tool reference 'headroom_retrieve' not found");
      }
      return inner(prompt, opts);
    };
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/TSPEC-f.md")).toBe(contents);
    expect(threwOnce).toBe(true);
  });

  it("reads a chunk whose FIRST line is blank — the live leading-newline defect", async () => {
    // Run wf_a5b4ad68-885, lines 113-168: the payload's leading blank line
    // collapsed into the model-written BEGIN sentinel. The tool-printed BOF
    // marker makes it interior.
    const contents = "start\n" + "\nEither way, state explicitly\nmore body\n".repeat(3);
    const agent = fileAgent({ "docs/f/REQ-f.md": contents });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe(contents);
  });

  it("escalates a chunk that the cheap model keeps reformatting to the hard model", async () => {
    // Run wf_a5b4ad68-885: haiku returned a markdown table as parsed JSON on
    // all 4 attempts — same-model retries cannot converge on such content.
    const contents = "| a | b |\n|---|---|\n| 1 | 2 |\n";
    const models = [];
    const inner = fileAgent({ "docs/f/REQ-f.md": contents });
    const agent = async (prompt, opts) => {
      if (/sed -n/.test(prompt)) {
        models.push(opts.model);
        if (opts.model !== adapter.RT_IO_MODEL) return inner(prompt, opts);
        const honest = await inner(prompt, opts);
        return honest.replace(contents, '[{"a":"1","b":"2"}]\n'); // the reformat
      }
      return inner(prompt, opts);
    };
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe(contents);
    expect(models.slice(0, 2)).toEqual([adapter.RT_IO_MODEL, adapter.RT_IO_MODEL]);
    expect(models[2]).toBe("sonnet");
  });

  it("retries the probe when its two digest transcriptions disagree", async () => {
    // The live defect: one flipped hex digit in the probe's digest sank an
    // otherwise perfect read (run wf_52840d61-aee). Two copies must agree.
    const contents = "hello world\n";
    let flippedOnce = false;
    const agent = fileAgent({ "docs/f/REQ-f.md": contents }, (prompt, reply) => {
      if (!flippedOnce && /wc -c/.test(prompt)) {
        flippedOnce = true;
        return reply.replace(/[0-9a-f]{64}/, "ab".repeat(32)); // first copy only
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe(contents);
    expect(flippedOnce).toBe(true);
  });

  it("accepts a verified reassembly when a fresh re-probe confirms it", async () => {
    // A consistently-flipped digest passes the two-copy check; the reassembly
    // then mismatches, and the fresh re-probe — not the throw — decides.
    const contents = bigDocument();
    let probes = 0;
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt, reply) => {
      if (/wc -c/.test(prompt)) {
        probes++;
        if (probes === 1) return reply.replace(/[0-9a-f]{64}/g, "ab".repeat(32));
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/TSPEC-f.md")).toBe(contents);
    expect(probes).toBe(2);
  });

  it("uses the cheap IO model for every call on the happy path", async () => {
    const agent = fileAgent({ "docs/f/REQ-f.md": "hello world\n" });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    await rtReadFile("docs/f/REQ-f.md");
    expect(agent.calls.every((c) => c.opts && c.opts.model === adapter.RT_IO_MODEL)).toBe(true);
  });
});
