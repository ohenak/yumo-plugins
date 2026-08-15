// Tests for `pdlc/engine/scripts/fixture-machine.mjs` (PLAN T59 -> T50; AT-2.4,
// TE round-1 F-07, TE round-3 F-01/Q-01, TE round-6 F-01, TE round-8 F-01).
//
// RED under PLAN v0.10's skipped-block convention (PLAN T59):
// `../scripts/fixture-machine.mjs` does not exist yet — it is T50's
// deliverable — so it is imported lazily inside each test body (the
// store.test.js idiom; a top-level static import would fail collection
// before `.skip` could apply) and every block is committed as
// `test.skip("T50: …")`. T50 un-skips exactly these blocks as its first
// act and must make every case below pass without editing this file.
// Nothing here is implementation; T59 owns only this test file
// (single-writer-per-file).
//
// Three unit-level, hermetic surfaces, each taking its IO seam as an argument
// (spawn function / probe result / capability entry) so every branch is
// reachable with no real spawn (§10.1 doubles convention; DoD item 4's branch
// floor depends on this file alone, TE round-3 Q-01):
//
//   1. recordResolvedState / compareLegRecords — the install/upgrade
//      inequality's recorder and falsifying comparator (TE round-1 F-07).
//   2. validateSkipRecords — the gated-leg skip comparator T50 ships
//      (TE round-3 F-01), pure over (records, inventory).
//   3. classifyProbeResult / runGatedLeg — the capability predicate's three
//      arms, asserted positively (TE round-6 F-01, third arm TE round-8 F-01).

import { test, describe } from "node:test";
import assert from "node:assert/strict";

// ─── 1. Recorder + comparator (AC-2.3, AC-2.4; TE round-1 F-07) ────────────

describe("recordResolvedState (§9.2's {resolvedVersion, resolvedStoreEntry})", () => {
  test.skip("T50: produces {resolvedVersion, resolvedStoreEntry} from injected spawn results", async () => {
    const { recordResolvedState } = await import("../scripts/fixture-machine.mjs");
    const calls = [];
    const fakeSpawnFn = (cmd, args) => {
      calls.push({ cmd, args: [...args] });
      if (args.includes("--version")) {
        return { status: 0, stdout: "1.2.3\n", stderr: "" };
      }
      return { status: 0, stdout: "/fake-store/versions/1.2.3\n", stderr: "" };
    };

    const record = recordResolvedState(fakeSpawnFn);

    assert.deepEqual(record, {
      resolvedVersion: "1.2.3",
      resolvedStoreEntry: "/fake-store/versions/1.2.3",
    });
    // Both fields are read from injected results — no real spawn is required
    // to reach either branch (§10.1).
    assert.ok(calls.length >= 2, "recorder issues at least one call per field");
  });

  test.skip("T50: a leg's post-record can differ from its pre-record over distinct injected results", async () => {
    const { recordResolvedState } = await import("../scripts/fixture-machine.mjs");
    const preSpawnFn = () => ({ status: 0, stdout: "1.2.3\n", stderr: "" });
    const postSpawnFn = (cmd, args) =>
      args.includes("--version")
        ? { status: 0, stdout: "1.3.0\n", stderr: "" }
        : { status: 0, stdout: "/fake-store/versions/1.3.0\n", stderr: "" };

    const pre = recordResolvedState(preSpawnFn);
    const post = recordResolvedState(postSpawnFn);

    assert.notEqual(pre.resolvedVersion, post.resolvedVersion);
    assert.notEqual(pre.resolvedStoreEntry, post.resolvedStoreEntry);
  });
});

describe("compareLegRecords (the falsifier: AC-2.3's install/upgrade inequality)", () => {
  const pre = { resolvedVersion: "1.2.3", resolvedStoreEntry: "/fake-store/versions/1.2.3" };

  test.skip("T50: passes (no violations) when both fields differ from the pre-record", async () => {
    const { compareLegRecords } = await import("../scripts/fixture-machine.mjs");
    const post = { resolvedVersion: "1.3.0", resolvedStoreEntry: "/fake-store/versions/1.3.0" };
    assert.deepEqual(compareLegRecords(pre, post), []);
  });

  test.skip("T50: fails when resolvedVersion alone equals the pre-value (not just both fields)", async () => {
    const { compareLegRecords } = await import("../scripts/fixture-machine.mjs");
    const post = { resolvedVersion: "1.2.3", resolvedStoreEntry: "/fake-store/versions/1.3.0" };
    const violations = compareLegRecords(pre, post);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /resolvedVersion/);
  });

  test.skip("T50: fails when resolvedStoreEntry alone equals the pre-value (not just both fields)", async () => {
    const { compareLegRecords } = await import("../scripts/fixture-machine.mjs");
    const post = { resolvedVersion: "1.3.0", resolvedStoreEntry: "/fake-store/versions/1.2.3" };
    const violations = compareLegRecords(pre, post);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /resolvedStoreEntry/);
  });

  test.skip("T50: fails on both fields when neither changed", async () => {
    const { compareLegRecords } = await import("../scripts/fixture-machine.mjs");
    const post = { ...pre };
    const violations = compareLegRecords(pre, post);
    assert.equal(violations.length, 2);
  });

  test.skip("T50: a leg that produced no record fails distinguishably from one that produced an equal record", async () => {
    const { compareLegRecords } = await import("../scripts/fixture-machine.mjs");
    const noRecordViolations = compareLegRecords(pre, null);
    const equalRecordViolations = compareLegRecords(pre, { ...pre });

    assert.equal(noRecordViolations.length, 1);
    assert.notDeepEqual(noRecordViolations, equalRecordViolations);
    assert.match(noRecordViolations[0], /no resolved-state record/);
    // The "no record" reason never conflates with either per-field "unchanged"
    // reason the equal-record case reports.
    assert.equal(equalRecordViolations.some((v) => v.includes("no resolved-state record")), false);
  });
});

// ─── 2. Gated-leg skip comparator (TE round-3 F-01) ────────────────────────

describe("validateSkipRecords (pure over (records, inventory), T50's SKIP_INVENTORY shape)", () => {
  const inventory = [
    { name: "node-18-alpine", capability: "docker", unverifiedInvariants: ["AT-2.5"] },
    { name: "two-repo-upgrade", capability: "npm-pack", unverifiedInvariants: ["AT-2.3"] },
  ];

  test.skip("T50: the all-registered case yields no violations", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const records = [
      { name: "node-18-alpine", capability: "docker", unverifiedInvariants: ["AT-2.5"] },
      { name: "two-repo-upgrade", capability: "npm-pack", unverifiedInvariants: ["AT-2.3"] },
    ];
    assert.deepEqual(validateSkipRecords(records, inventory), []);
  });

  test.skip("T50: an unregistered skip name yields a violation", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const records = [{ name: "not-in-inventory", capability: "docker", unverifiedInvariants: ["x"] }];
    const violations = validateSkipRecords(records, inventory);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /not-in-inventory/);
  });

  test.skip("T50: a skip naming an unknown capability key yields a violation", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const records = [
      { name: "node-18-alpine", capability: "telepathy", unverifiedInvariants: ["AT-2.5"] },
    ];
    const violations = validateSkipRecords(records, inventory);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /unknown capability/);
  });

  test.skip("T50: a duplicate inventory entry name yields a violation", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const dupInventory = [
      { name: "node-18-alpine", capability: "docker", unverifiedInvariants: ["AT-2.5"] },
      { name: "node-18-alpine", capability: "docker", unverifiedInvariants: ["AT-2.5"] },
    ];
    const violations = validateSkipRecords([], dupInventory);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /duplicate/);
  });

  test.skip("T50: an empty unverifiedInvariants list yields a violation", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const records = [{ name: "node-18-alpine", capability: "docker", unverifiedInvariants: [] }];
    const violations = validateSkipRecords(records, inventory);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /unverifiedInvariants/);
  });
});

// ─── 3. Capability predicate discriminator (TE round-6 F-01, round-8 F-01) ─

describe("classifyProbeResult (opt-out discriminator over the probe's exit status)", () => {
  test.skip("T50: a readable non-zero exit status classifies as absent", async () => {
    const { classifyProbeResult } = await import("../scripts/fixture-machine.mjs");
    assert.equal(classifyProbeResult({ status: 1 }), "absent");
  });

  test.skip("T50: a readable zero exit status classifies as present", async () => {
    const { classifyProbeResult } = await import("../scripts/fixture-machine.mjs");
    assert.equal(classifyProbeResult({ status: 0 }), "present");
  });

  test.skip("T50: no readable exit status (spawn error / ENOENT / timeout) classifies as unprobeable", async () => {
    const { classifyProbeResult } = await import("../scripts/fixture-machine.mjs");
    assert.equal(classifyProbeResult({ status: null, error: new Error("ENOENT") }), "unprobeable");
    assert.equal(classifyProbeResult({ status: undefined }), "unprobeable");
    assert.equal(classifyProbeResult(null), "unprobeable");
  });
});

describe("runGatedLeg — all three arms asserted positively, as a partition (TE round-8 F-01)", () => {
  const entry = { name: "two-repo-upgrade", capability: "npm-pack", unverifiedInvariants: ["AT-2.3"] };

  test.skip("T50: absent (non-zero exit) records a registered skip naming its capability, without running the leg", async () => {
    const { runGatedLeg } = await import("../scripts/fixture-machine.mjs");
    let legRan = false;
    const result = runGatedLeg({
      name: entry.name,
      capability: entry.capability,
      unverifiedInvariants: entry.unverifiedInvariants,
      probeResult: { status: 1 },
      leg: () => {
        legRan = true;
        return true;
      },
    });

    // Asserted on the recorded entry itself, not merely on the absence of a run.
    assert.ok(result.skip, "absent arm must record a skip entry");
    assert.equal(result.skip.name, entry.name);
    assert.equal(result.skip.capability, "npm-pack");
    assert.deepEqual(result.skip.unverifiedInvariants, ["AT-2.3"]);
    assert.equal(result.ran, false);
    assert.equal(legRan, false);
  });

  test.skip("T50: unprobeable yields a run-failing verdict, never a skip", async () => {
    const { runGatedLeg } = await import("../scripts/fixture-machine.mjs");
    let legRan = false;
    assert.throws(() =>
      runGatedLeg({
        name: entry.name,
        capability: entry.capability,
        unverifiedInvariants: entry.unverifiedInvariants,
        probeResult: { status: null, error: new Error("ENOENT") },
        leg: () => {
          legRan = true;
          return true;
        },
      })
    );
    assert.equal(legRan, false, "unprobeable must not run the leg either");
  });

  test.skip("T50: present (zero exit) records no skip entry and runs the leg (ran-marker present)", async () => {
    const { runGatedLeg } = await import("../scripts/fixture-machine.mjs");
    let legRan = false;
    const result = runGatedLeg({
      name: entry.name,
      capability: entry.capability,
      unverifiedInvariants: entry.unverifiedInvariants,
      probeResult: { status: 0 },
      leg: () => {
        legRan = true;
        return true;
      },
    });

    // The off-by-one this arm exists to catch (present misclassified as
    // absent) would still pass a bare "skip is null" check while never
    // running the leg — so this asserts BOTH halves of the partition: no
    // recorded skip entry naming the capability, AND the leg's own
    // ran-marker is positively true, never inferred from the record's
    // absence alone.
    assert.equal(result.skip, null);
    assert.equal(result.ran, true);
    assert.equal(legRan, true);
  });
});
