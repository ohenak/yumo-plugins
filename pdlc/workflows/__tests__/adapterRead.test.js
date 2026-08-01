/**
 * adapterRead.test.js — `rtReadFile`'s chunked, verified read.
 *
 * The defect this suite pins: the previous implementation asked ONE agent to
 * echo a file's contents as its final message. A measured run returned 102,429
 * bytes of a 209,953-byte document, starting mid-document, and a sibling read
 * prepended a ```bash fence — both indistinguishable, in the reply, from a
 * healthy read. orchestrate-dev then scored the truncated echo with
 * `isComplete()`, judged a finished revision incomplete, and re-dispatched the
 * author in a loop.
 *
 * So the property under test is not "reads usually work". It is: the adapter
 * returns the file's exact bytes, or it throws. A short, fenced or otherwise
 * unverifiable reply must never become a return value.
 *
 * The pure helpers (`rtBase64Decode`, `rtUtf8Decode`, `rtChunkPlan`) are tested
 * directly, because they are the whole verification argument: the runtime has
 * no Buffer, no atob and no TextDecoder, so a bug in either decoder silently
 * corrupts every document the pipeline reads.
 */

import { fileAgent, hostParallel, loadAdapter } from "./helpers/adapterHarness.js";

const adapter = loadAdapter();
const { rtBase64Decode, rtUtf8Decode, rtChunkPlan, RT_READ_CHUNK, RT_READ_RETRIES } = adapter;

const b64 = (text) => Buffer.from(text, "utf8").toString("base64");
const utf8Bytes = (text) => [...Buffer.from(text, "utf8")];

describe("rtBase64Decode", () => {
  it("decodes each padding variant to the right byte count", () => {
    // Lengths 3/2/1 mod 3 give 0/1/2 '=' characters respectively.
    expect(rtBase64Decode(b64("abc"))).toEqual(utf8Bytes("abc")); // "YWJj", no padding
    expect(b64("ab")).toBe("YWI=");
    expect(rtBase64Decode(b64("ab"))).toEqual(utf8Bytes("ab"));
    expect(b64("a")).toBe("YQ==");
    expect(rtBase64Decode(b64("a"))).toEqual(utf8Bytes("a"));
    expect(rtBase64Decode("")).toEqual([]);
  });

  it("round-trips arbitrary binary bytes, including 0x00 and 0xff", () => {
    const bytes = [];
    for (let i = 0; i < 256; i++) bytes.push(i);
    const encoded = Buffer.from(bytes).toString("base64");
    expect(rtBase64Decode(encoded)).toEqual(bytes);
  });

  it("rejects anything that is not decodable rather than returning partial bytes", () => {
    expect(() => rtBase64Decode("YWJ")).toThrow(/multiple of 4/); // truncated group
    expect(() => rtBase64Decode("YW J=")).toThrow(/not base64/); // whitespace not pre-stripped
    expect(() => rtBase64Decode("```bash\nYWJj\n```")).toThrow(/not base64/);
    expect(() => rtBase64Decode("YWJ*")).toThrow(/not base64/);
    expect(() => rtBase64Decode("YWJj====")).toThrow(/not base64/); // over-padded
    expect(() => rtBase64Decode("=Y==")).toThrow(/not base64/); // padding not at the end
    expect(() => rtBase64Decode(null)).toThrow(/not base64/);
  });
});

describe("rtUtf8Decode", () => {
  it("decodes 1-, 2-, 3- and 4-byte sequences", () => {
    for (const text of ["plain ascii", "café", "中文字", "𝄞 clef", "🙂🚀", "a\nb\tc"]) {
      expect(rtUtf8Decode(utf8Bytes(text))).toBe(text);
    }
  });

  it("emits a surrogate pair for an astral code point", () => {
    // U+1F600 → D83D DE00. A decoder that pushed the raw code point would
    // produce a string of the wrong .length and break every byte offset after it.
    const decoded = rtUtf8Decode(utf8Bytes("😀"));
    expect(decoded).toBe("😀");
    expect(decoded.length).toBe(2);
    expect(decoded.charCodeAt(0)).toBe(0xd83d);
    expect(decoded.charCodeAt(1)).toBe(0xde00);
  });

  it("decodes a string longer than its internal flush window", () => {
    const long = "é🚀x".repeat(5000);
    expect(rtUtf8Decode(utf8Bytes(long))).toBe(long);
  });

  it("throws on a malformed sequence instead of substituting a replacement char", () => {
    expect(() => rtUtf8Decode([0xff])).toThrow(/invalid leading byte/);
    expect(() => rtUtf8Decode([0x80])).toThrow(/invalid leading byte/);
    expect(() => rtUtf8Decode([0xe4, 0xb8])).toThrow(/truncated sequence/);
    expect(() => rtUtf8Decode([0xe4, 0x41, 0xad])).toThrow(/invalid continuation byte/);
  });

  it("decodes an empty byte array to an empty string", () => {
    expect(rtUtf8Decode([])).toBe("");
  });
});

describe("rtChunkPlan", () => {
  it("covers [0, size) with no gap and no overlap", () => {
    const plan = rtChunkPlan(25, 10);
    expect(plan).toEqual([
      { offset: 0, count: 10 },
      { offset: 10, count: 10 },
      { offset: 20, count: 5 },
    ]);
    expect(plan.reduce((n, c) => n + c.count, 0)).toBe(25);
  });

  it("emits no empty trailing range when the size is an exact multiple", () => {
    expect(rtChunkPlan(20, 10)).toEqual([
      { offset: 0, count: 10 },
      { offset: 10, count: 10 },
    ]);
  });

  it("plans nothing for an empty file, and one short range for a small one", () => {
    expect(rtChunkPlan(0, 10)).toEqual([]);
    expect(rtChunkPlan(1, 10)).toEqual([{ offset: 0, count: 1 }]);
  });

  it("keeps a chunk's base64 within the IO agent's final-message token cap", () => {
    // A live agent's final message truncated at 9,885 base64 chars (≈4096
    // tokens at ~2.4 chars/token) even though its tool result held the full
    // 18,140. The shipped chunk must encode to fewer chars than that observed
    // ceiling, with headroom.
    expect(Math.ceil((RT_READ_CHUNK * 4) / 3)).toBeLessThanOrEqual(8000);
  });
});

describe("rtReadFile", () => {
  /** A document large enough to need several chunks, with multi-byte characters
   *  deliberately straddling chunk boundaries. */
  function bigDocument() {
    let text = "";
    while (Buffer.byteLength(text, "utf8") < RT_READ_CHUNK * 2 + 100) {
      text += `## sección ${text.length} — 中文 🚀\nbody line with ascii padding\n`;
    }
    return text;
  }

  it("returns null when the file is missing, without fetching any chunk", async () => {
    const agent = fileAgent({});
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBeNull();
    expect(agent.calls).toHaveLength(1);
  });

  it("returns \"\" for an empty file, without fetching any chunk", async () => {
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
    // 1 size probe + one call per planned chunk — no whole-file echo remains.
    const expected = rtChunkPlan(Buffer.byteLength(contents, "utf8"), RT_READ_CHUNK).length;
    expect(expected).toBeGreaterThan(2);
    expect(agent.calls).toHaveLength(1 + expected);
  });

  it("retries a truncated chunk and returns the verified bytes", async () => {
    const contents = bigDocument();
    let truncatedOnce = false;
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt, reply) => {
      if (!truncatedOnce && /tail -c/.test(prompt)) {
        truncatedOnce = true;
        // Valid base64 of HALF the bytes — the defect's exact shape.
        return reply.slice(0, Math.floor(reply.length / 8) * 4);
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
      if (!fencedOnce && /tail -c/.test(prompt)) {
        fencedOnce = true;
        return "```bash\n" + reply + "\n```";
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });

    expect(await rtReadFile("docs/f/TSPEC-f.md")).toBe(contents);
    expect(fencedOnce).toBe(true);
  });

  it("throws — never returns partial content — when a chunk stays unverifiable", async () => {
    const contents = bigDocument();
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt, reply) => {
      // Chunk 1 is always short; every other chunk is honest.
      if (prompt.includes(`tail -c +${RT_READ_CHUNK + 1} `)) {
        return reply.slice(0, Math.floor(reply.length / 8) * 4);
      }
      return undefined;
    });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });

    await expect(rtReadFile("docs/f/TSPEC-f.md")).rejects.toThrow(
      /chunk 1 of "docs\/f\/TSPEC-f\.md"/
    );
    // Attempts are bounded: the honest chunks resolve once; chunk 1 retries out.
    const failing = agent.calls.filter((c) => c.prompt.includes(`tail -c +${RT_READ_CHUNK + 1} `));
    expect(failing).toHaveLength(RT_READ_RETRIES + 1);
  });

  it("throws on an unparseable size reply rather than guessing", async () => {
    const agent = fileAgent({ "docs/f/REQ-f.md": "hello" }, (prompt) =>
      /wc -c/.test(prompt) ? "The file is about five bytes." : undefined
    );
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    await expect(rtReadFile("docs/f/REQ-f.md")).rejects.toThrow(/unparseable size reply/);
  });

  it("accepts a size reply padded with whitespace, as `wc -c` prints on BSD", async () => {
    const agent = fileAgent({ "docs/f/REQ-f.md": "hello" }, (prompt, reply) =>
      /wc -c/.test(prompt) ? `      ${reply}\n` : undefined
    );
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    expect(await rtReadFile("docs/f/REQ-f.md")).toBe("hello");
  });

  it("throws when the host parallel resolves a failed chunk thunk to null", async () => {
    // The host `parallel` swallows a thrown thunk. Without the adapter's own
    // null check that would concatenate `undefined` into the document.
    const contents = bigDocument();
    const agent = fileAgent({ "docs/f/TSPEC-f.md": contents }, (prompt) =>
      prompt.includes(`tail -c +${RT_READ_CHUNK + 1} `) ? "not base64 at all" : undefined
    );
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    await expect(rtReadFile("docs/f/TSPEC-f.md")).rejects.toThrow(/chunk 1/);
  });

  it("uses the cheap IO model for every call it makes", async () => {
    const agent = fileAgent({ "docs/f/REQ-f.md": "hello world" });
    const { rtReadFile } = loadAdapter({ agent, parallel: hostParallel });
    await rtReadFile("docs/f/REQ-f.md");
    expect(agent.calls.every((c) => c.opts && c.opts.model === adapter.RT_IO_MODEL)).toBe(true);
  });
});
