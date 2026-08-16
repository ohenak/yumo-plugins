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
  test("T50: produces {resolvedVersion, resolvedStoreEntry} from injected spawn results", async () => {
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

  test("T50: a leg's post-record can differ from its pre-record over distinct injected results", async () => {
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

  test("T50: passes (no violations) when both fields differ from the pre-record", async () => {
    const { compareLegRecords } = await import("../scripts/fixture-machine.mjs");
    const post = { resolvedVersion: "1.3.0", resolvedStoreEntry: "/fake-store/versions/1.3.0" };
    assert.deepEqual(compareLegRecords(pre, post), []);
  });

  test("T50: fails when resolvedVersion alone equals the pre-value (not just both fields)", async () => {
    const { compareLegRecords } = await import("../scripts/fixture-machine.mjs");
    const post = { resolvedVersion: "1.2.3", resolvedStoreEntry: "/fake-store/versions/1.3.0" };
    const violations = compareLegRecords(pre, post);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /resolvedVersion/);
  });

  test("T50: fails when resolvedStoreEntry alone equals the pre-value (not just both fields)", async () => {
    const { compareLegRecords } = await import("../scripts/fixture-machine.mjs");
    const post = { resolvedVersion: "1.3.0", resolvedStoreEntry: "/fake-store/versions/1.2.3" };
    const violations = compareLegRecords(pre, post);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /resolvedStoreEntry/);
  });

  test("T50: fails on both fields when neither changed", async () => {
    const { compareLegRecords } = await import("../scripts/fixture-machine.mjs");
    const post = { ...pre };
    const violations = compareLegRecords(pre, post);
    assert.equal(violations.length, 2);
  });

  test("T50: a leg that produced no record fails distinguishably from one that produced an equal record", async () => {
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

  test("T50: the all-registered case yields no violations", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const records = [
      { name: "node-18-alpine", capability: "docker", unverifiedInvariants: ["AT-2.5"] },
      { name: "two-repo-upgrade", capability: "npm-pack", unverifiedInvariants: ["AT-2.3"] },
    ];
    assert.deepEqual(validateSkipRecords(records, inventory), []);
  });

  test("T50: an unregistered skip name yields a violation", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const records = [{ name: "not-in-inventory", capability: "docker", unverifiedInvariants: ["x"] }];
    const violations = validateSkipRecords(records, inventory);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /not-in-inventory/);
  });

  test("T50: a skip naming an unknown capability key yields a violation", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const records = [
      { name: "node-18-alpine", capability: "telepathy", unverifiedInvariants: ["AT-2.5"] },
    ];
    const violations = validateSkipRecords(records, inventory);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /unknown capability/);
  });

  test("T50: a duplicate inventory entry name yields a violation", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const dupInventory = [
      { name: "node-18-alpine", capability: "docker", unverifiedInvariants: ["AT-2.5"] },
      { name: "node-18-alpine", capability: "docker", unverifiedInvariants: ["AT-2.5"] },
    ];
    const violations = validateSkipRecords([], dupInventory);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /duplicate/);
  });

  test("T50: an empty unverifiedInvariants list yields a violation", async () => {
    const { validateSkipRecords } = await import("../scripts/fixture-machine.mjs");
    const records = [{ name: "node-18-alpine", capability: "docker", unverifiedInvariants: [] }];
    const violations = validateSkipRecords(records, inventory);
    assert.equal(violations.length, 1);
    assert.match(violations[0], /unverifiedInvariants/);
  });
});

// ─── 3. Capability predicate discriminator (TE round-6 F-01, round-8 F-01) ─

describe("classifyProbeResult (opt-out discriminator over the probe's exit status)", () => {
  test("T50: a readable non-zero exit status classifies as absent", async () => {
    const { classifyProbeResult } = await import("../scripts/fixture-machine.mjs");
    assert.equal(classifyProbeResult({ status: 1 }), "absent");
  });

  test("T50: a readable zero exit status classifies as present", async () => {
    const { classifyProbeResult } = await import("../scripts/fixture-machine.mjs");
    assert.equal(classifyProbeResult({ status: 0 }), "present");
  });

  test("T50: no readable exit status (spawn error / ENOENT / timeout) classifies as unprobeable", async () => {
    const { classifyProbeResult } = await import("../scripts/fixture-machine.mjs");
    assert.equal(classifyProbeResult({ status: null, error: new Error("ENOENT") }), "unprobeable");
    assert.equal(classifyProbeResult({ status: undefined }), "unprobeable");
    assert.equal(classifyProbeResult(null), "unprobeable");
  });
});

describe("runGatedLeg — all three arms asserted positively, as a partition (TE round-8 F-01)", () => {
  const entry = { name: "two-repo-upgrade", capability: "npm-pack", unverifiedInvariants: ["AT-2.3"] };

  test("T50: absent (non-zero exit) records a registered skip naming its capability, without running the leg", async () => {
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

  test("T50: unprobeable yields a run-failing verdict, never a skip", async () => {
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

  test("T50: present (zero exit) records no skip entry and runs the leg (ran-marker present)", async () => {
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

// ─── AT-5 ladder observation (PM CR round-1 F-05) ──────────────────────────
//
// The real leg (`legVersionLadder`) spawns a real `pdlc` against a real
// store; these legs drive its two PURE halves — the observation parser and
// the verdict comparator — with no spawn at all, which is what keeps
// PROP-REGR-6's 85 % floor on this module reachable from T59 alone
// (TE round-3 Q-01).

describe("parseLadderObservation (which engine actually executed, and under what mark)", () => {
  test("T50: reads the stub's version, mode and pin out of a real child's stdout", async () => {
    const { parseLadderObservation, LADDER_STUB_PREFIX } = await import("../scripts/fixture-machine.mjs");
    const observed = parseLadderObservation({
      status: 0,
      stdout: `resolved: using pinned engine 9.9.8\n${LADDER_STUB_PREFIX} 9.9.8 mode=pin pin=9.9.8\n`,
      stderr: "",
    });
    assert.deepEqual(observed, {
      status: 0,
      engineRan: "9.9.8",
      mode: "pin",
      pin: "9.9.8",
      output: observed.output,
    });
  });

  test("T50: an unpinned run's empty pin field reads as null, not as the string \"null\"", async () => {
    const { parseLadderObservation, LADDER_STUB_PREFIX } = await import("../scripts/fixture-machine.mjs");
    const emptyField = parseLadderObservation({ status: 0, stdout: `${LADDER_STUB_PREFIX} 9.9.9 mode=latest pin=\n` });
    assert.equal(emptyField.engineRan, "9.9.9");
    assert.equal(emptyField.mode, "latest");
    assert.equal(emptyField.pin, null);

    const literalNull = parseLadderObservation({ status: 0, stdout: `${LADDER_STUB_PREFIX} 9.9.9 mode=latest pin=null\n` });
    assert.equal(literalNull.pin, null);
  });

  test("T50: a refusal — no stub line anywhere, on either stream — reads as engineRan null", async () => {
    const { parseLadderObservation } = await import("../scripts/fixture-machine.mjs");
    const observed = parseLadderObservation({
      status: 1,
      stdout: "",
      stderr: "pdlc: pinned version 9.9.7 is not installed (installed: 9.9.8, 9.9.9)\n",
    });
    assert.equal(observed.status, 1);
    assert.equal(observed.engineRan, null);
    assert.equal(observed.mode, null);
    // stderr is part of the scanned output, so `mentions` can assert on a
    // refusal message the engine writes to stderr rather than stdout.
    assert.match(observed.output, /9\.9\.7/);
  });

  test("T50: a child with no readable status at all still parses, reporting status null", async () => {
    const { parseLadderObservation } = await import("../scripts/fixture-machine.mjs");
    assert.deepEqual(parseLadderObservation(null), {
      status: null,
      engineRan: null,
      mode: null,
      pin: null,
      output: "",
    });
  });
});

describe("checkLadderObservation (the AT-5 falsifier: pin beats latest, missing pin refuses)", () => {
  const stubLine = (version, mode, pin) => `FIXTURE-STUB-ENGINE ${version} mode=${mode} pin=${pin}`;

  test("T50: AT-5.1/5.2 — the pinned engine executing under mode=pin yields no violations", async () => {
    const { checkLadderObservation, parseLadderObservation } = await import("../scripts/fixture-machine.mjs");
    const violations = checkLadderObservation(
      { label: "pinned-and-installed", exitCode: 0, engine: "9.9.8", mode: "pin", pin: "9.9.8", forbids: ["FIXTURE-STUB-ENGINE 9.9.9"] },
      parseLadderObservation({ status: 0, stdout: `${stubLine("9.9.8", "pin", "9.9.8")}\n` })
    );
    assert.deepEqual(violations, []);
  });

  test("T50: the defect AT-5.2 exists for — latest silently winning over the pin — is caught", async () => {
    const { checkLadderObservation, parseLadderObservation } = await import("../scripts/fixture-machine.mjs");
    const violations = checkLadderObservation(
      { label: "pinned-and-installed", exitCode: 0, engine: "9.9.8", mode: "pin", pin: "9.9.8", forbids: ["FIXTURE-STUB-ENGINE 9.9.9"] },
      parseLadderObservation({ status: 0, stdout: `${stubLine("9.9.9", "latest", "")}\n` })
    );
    assert.equal(violations.length, 4);
    assert.ok(violations.some((v) => /engine 9\.9\.9 ran, expected 9\.9\.8/.test(v)));
    assert.ok(violations.some((v) => /resolved mode latest, expected pin/.test(v)));
    assert.ok(violations.some((v) => /stamped pin <none>, expected 9\.9\.8/.test(v)));
    assert.ok(violations.some((v) => /names "FIXTURE-STUB-ENGINE 9\.9\.9", which it must not/.test(v)));
  });

  test("T50: AT-5.5 — a refusal that names the pin and what is installed, running nothing, passes", async () => {
    const { checkLadderObservation, parseLadderObservation } = await import("../scripts/fixture-machine.mjs");
    const violations = checkLadderObservation(
      {
        label: "pinned-and-missing",
        exitCode: 1,
        engine: null,
        mentions: ["9.9.7", "9.9.8", "9.9.9"],
        forbids: ["FIXTURE-STUB-ENGINE"],
      },
      parseLadderObservation({ status: 1, stderr: "pinned version 9.9.7 is not installed (installed: 9.9.8, 9.9.9)\n" })
    );
    assert.deepEqual(violations, []);
  });

  test("T50: AT-5.5's real defect — falling back to latest instead of refusing — is caught on every conjunct", async () => {
    const { checkLadderObservation, parseLadderObservation } = await import("../scripts/fixture-machine.mjs");
    const violations = checkLadderObservation(
      {
        label: "pinned-and-missing",
        exitCode: 1,
        engine: null,
        mentions: ["9.9.7", "9.9.8", "9.9.9"],
        forbids: ["FIXTURE-STUB-ENGINE"],
      },
      parseLadderObservation({ status: 0, stdout: `${stubLine("9.9.9", "latest", "")}\n` })
    );
    assert.ok(violations.some((v) => /exit code 0, expected 1/.test(v)));
    assert.ok(violations.some((v) => /expected no engine to execute, but 9\.9\.9 ran/.test(v)));
    assert.ok(violations.some((v) => /never names "9\.9\.7"/.test(v)));
    assert.ok(violations.some((v) => /names "FIXTURE-STUB-ENGINE", which it must not/.test(v)));
  });

  test("T50: AT-5.4 — mode/pin are only checked when the expectation states them", async () => {
    const { checkLadderObservation, parseLadderObservation } = await import("../scripts/fixture-machine.mjs");
    // No `mode`/`pin` keys: an expectation that states neither must not
    // manufacture a violation out of whatever the observation carried.
    const violations = checkLadderObservation(
      { label: "no-pin-latest", exitCode: 0, engine: "9.9.9" },
      parseLadderObservation({ status: 0, stdout: `${stubLine("9.9.9", "latest", "")}\n` })
    );
    assert.deepEqual(violations, []);
  });
});

describe("SKIP_INVENTORY covers the AT-5 group FSPEC:802 marks [fixture] (PM CR F-05)", () => {
  test("T50: the version-ladder entry names AT-5.1, AT-5.2, AT-5.4 and AT-5.5", async () => {
    const { SKIP_INVENTORY } = await import("../scripts/fixture-machine.mjs");
    const entry = SKIP_INVENTORY.find((e) => e.name === "version-ladder");
    assert.ok(entry, "SKIP_INVENTORY carries no version-ladder entry");
    assert.equal(entry.capability, "npm-pack");
    assert.deepEqual([...entry.unverifiedInvariants], ["AT-5.1", "AT-5.2", "AT-5.4", "AT-5.5"]);
  });

  test("T50: every AT id the machine claims to carry appears in exactly one entry", async () => {
    const { SKIP_INVENTORY } = await import("../scripts/fixture-machine.mjs");
    const counts = new Map();
    for (const entry of SKIP_INVENTORY) {
      for (const id of entry.unverifiedInvariants) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const duplicated = [...counts].filter(([, n]) => n > 1);
    assert.deepEqual(duplicated, [], `AT ids claimed by more than one leg: ${JSON.stringify(duplicated)}`);
    for (const id of ["AT-5.1", "AT-5.2", "AT-5.4", "AT-5.5", "AT-2.3", "AT-2.4", "AT-2.5"]) {
      assert.ok(counts.has(id), `no SKIP_INVENTORY entry names ${id}`);
    }
  });
});

// ─── container leg classifier (AT-2.5: named message, no stack trace) ─────

describe("checkContainerFloorRefusal — AT-2.5's pass/fail classifier over an injected exec result", () => {
  test("T50: a non-zero exit carrying the named floor message and no stack trace passes", async () => {
    const { checkContainerFloorRefusal } = await import("../scripts/fixture-machine.mjs");
    const violations = checkContainerFloorRefusal({
      status: 1,
      stdout: "",
      stderr: "pdlc requires Node >= 20; found v18.20.8\n",
    });
    assert.deepEqual(violations, []);
  });

  test("T50: a zero exit (guard failed to refuse) fails, even if the message text is present", async () => {
    const { checkContainerFloorRefusal } = await import("../scripts/fixture-machine.mjs");
    const violations = checkContainerFloorRefusal({
      status: 0,
      stdout: "pdlc requires Node >= 20; found v18.20.8\n",
      stderr: "",
    });
    assert.ok(violations.length > 0);
    assert.match(violations[0], /did not refuse/);
  });

  test("T50: no readable status (spawn error) fails loudly, naming the observed status", async () => {
    const { checkContainerFloorRefusal } = await import("../scripts/fixture-machine.mjs");
    const violations = checkContainerFloorRefusal({ status: null, stdout: "", stderr: "" });
    assert.ok(violations.length > 0);
    assert.match(violations[0], /did not refuse/);
  });

  test("T50: a refusal whose output carries a stack trace fails (not just a named message)", async () => {
    const { checkContainerFloorRefusal } = await import("../scripts/fixture-machine.mjs");
    const violations = checkContainerFloorRefusal({
      status: 1,
      stdout: "",
      stderr: "pdlc requires Node >= 20; found v18.20.8\n    at Object.<anonymous> (/repo/pdlc/engine/bin/pdlc.mjs:3:1)\n",
    });
    assert.ok(violations.length > 0);
    assert.match(violations[0], /stack trace/);
  });

  test("T50: a refusal missing the named floor message fails, naming what was observed", async () => {
    const { checkContainerFloorRefusal } = await import("../scripts/fixture-machine.mjs");
    const violations = checkContainerFloorRefusal({ status: 1, stdout: "", stderr: "some other error\n" });
    assert.ok(violations.length > 0);
    assert.match(violations[0], /did not print the named floor message/);
  });
});
