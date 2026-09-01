describe("T-01: pre-flight gate (BL-PREREQ)", () => {
  it("imports the four review-driver classifiers from orchestrate-dev.js at HEAD", async () => {
    const mod = await import("../orchestrate-dev.js");

    expect(typeof mod.parseReviewFilename).toBe("function");
    expect(typeof mod.deriveRoundWindow).toBe("function");
    expect(typeof mod.deriveDodRoundIndex).toBe("function");
    expect(typeof mod.parseResolvedMarker).toBe("function");
  });

  it("imports resolveWorkflowRoot from pdlc/engine/lib/run.mjs", async () => {
    const mod = await import("../../engine/lib/run.mjs");

    expect(typeof mod.resolveWorkflowRoot).toBe("function");
  });
});
