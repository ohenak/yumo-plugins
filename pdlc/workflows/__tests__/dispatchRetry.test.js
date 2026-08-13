/**
 * Unit tests for `withDispatchRetry` — the internal fault-recovery seam that
 * retries a single dispatch exactly once when the dispatch itself THROWS or
 * REJECTS (an engine-side transport fault or the engine's dispatch-timeout
 * ceiling), never on a parsed content failure. See orchestrate-dev.js for the
 * full contract; this file exercises the helper in isolation, independent of
 * any of its call sites.
 */

import { withDispatchRetry } from "../orchestrate-dev.js";

describe("withDispatchRetry", () => {
  it("a dispatch that succeeds on the first attempt runs exactly once, with no notice", async () => {
    let calls = 0;
    const notices = [];
    const result = await withDispatchRetry(
      async () => {
        calls += 1;
        return "ok";
      },
      { label: "test dispatch", emit: (m) => notices.push(m) }
    );
    expect(result).toBe("ok");
    expect(calls).toBe(1);
    expect(notices).toEqual([]);
  });

  it("a dispatch that throws once is retried with the same thunk and recovers, emitting one loud notice", async () => {
    let calls = 0;
    const notices = [];
    const result = await withDispatchRetry(
      async () => {
        calls += 1;
        if (calls === 1) throw new Error("dispatch stall-killed");
        return "recovered";
      },
      { label: "optimizer se-author, phase CR", emit: (m) => notices.push(m) }
    );
    expect(result).toBe("recovered");
    expect(calls).toBe(2);
    expect(notices).toHaveLength(1);
    expect(notices[0]).toContain("Dispatch fault (optimizer se-author, phase CR)");
    expect(notices[0]).toContain("dispatch stall-killed");
    expect(notices[0]).toContain("retrying once");
  });

  it("a dispatch that throws twice propagates the second error unchanged, after exactly two attempts", async () => {
    let calls = 0;
    const notices = [];
    await expect(
      withDispatchRetry(
        async () => {
          calls += 1;
          throw new Error(`stall ${calls}`);
        },
        { label: "DOD remediation, iteration 1", emit: (m) => notices.push(m) }
      )
    ).rejects.toThrow("stall 2");
    expect(calls).toBe(2);
    // Exactly one fault notice — the second throw is not a "fault observed",
    // it is the propagated failure itself.
    expect(notices).toHaveLength(1);
  });

  it("onFault fires once, on the first throw, before the retry is dispatched — even when the retry recovers", async () => {
    const faultTimeline = [];
    let calls = 0;
    await withDispatchRetry(
      async () => {
        calls += 1;
        faultTimeline.push(`call-${calls}`);
        if (calls === 1) throw new Error("boom");
        return "ok";
      },
      {
        label: "V-wave 2 PROPERTIES tests",
        onFault: () => faultTimeline.push("onFault"),
      }
    );
    expect(faultTimeline).toEqual(["call-1", "onFault", "call-2"]);
  });

  it("defaults emit and onFault to no-ops so callers may omit them entirely", async () => {
    let calls = 0;
    const result = await withDispatchRetry(async () => {
      calls += 1;
      if (calls === 1) throw new Error("transient");
      return "fine";
    });
    expect(result).toBe("fine");
    expect(calls).toBe(2);
  });

  it("never retries a resolved value or a rejection that never happens — a single successful call is not double-dispatched", async () => {
    const calls = [];
    await withDispatchRetry(async () => {
      calls.push(Date.now());
      return { response: "some content", verdict: "Needs revision" };
    });
    expect(calls).toHaveLength(1);
  });
});
