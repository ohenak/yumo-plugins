// consolidationEffectiveness.test.js — PLAN T17 (RED, describe.skip).
//
// Blocks T27 — effectiveness and remediation: AT-F6 … AT-F18 over `phasesExercised`,
// `effectivenessTable`, `openPromotionList` and `remediationChoice` (TSPEC §7.5, FSPEC §8.3–§8.7).
// A row with no `artifact` renders `(unavailable)` — never blank, never a guessed path — and a
// `null` `remediation` means the field is ABSENT, not empty (TSPEC §6, EffectivenessRow).
//
// Fixture-shape note (this task's own call, since `effectivenessTable`/`remediationChoice` have no
// production body yet to observe): `consumedTexts` is an ARRAY OF HISTORICAL PASSES, oldest first,
// `{ passId, consumed: string[] }` — one element per pass the log records, `consumed` holding the
// full text of every LEARNINGS that pass consumed. This is what lets a pure fold reconstruct BOTH
// this pass's verdict (TSPEC §7.5 ¶2, the "one row per distinct id, evaluating the three arms")
// AND the `ineffective`/`unmeasurable` streaks (FSPEC §8.5/§8.7, "folding the log's rows in file
// order") from one argument, correlated to `records` by `records[i].passId` (FailureModeRecord's
// own field, FSPEC §8.1) for the pass a revise/retire landed in. `prStates` is an array of PR
// observations, `{ state: "open"|"merged"|"closed", pairs: [{failureModeId, action}] }` — the shape
// `enactedByPr`'s own doc comment (§7.6) implies for the `PDLC-CONSOLIDATION-PROMOTIONS` trailer.
// T27 owns turning these into the real signature; nothing here is licence to keep a shape the real
// pass cannot produce — see PLAN §13.3 rule 2, un-skip only, never rewrite out from under it.

import * as cons from "../consolidate-learnings.js";
// FSPEC §8.4 — the log record readers live in orchestrate-dev.js so both sides of the hand-off
// share one implementation; consolidate-learnings.js imports them rather than redefining them.
import { openPromotionList } from "../orchestrate-dev.js";

// ─── Fixture builders ───────────────────────────────────────────────────────

function record(overrides = {}) {
  return {
    failureModeId: "fm-default",
    phase: "T",
    symptom: "default symptom, non-keying free text",
    artifact: "pdlc/workflows/consolidate-learnings.js",
    target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
    passId: "p0",
    action: "promote",
    route: "constraints",
    ...overrides,
  };
}

function defaultConfig(overrides = {}) {
  return {
    cadenceHours: 168,
    volumeThreshold: 5,
    staleLockMinutes: 60,
    pluginRepository: null,
    credentialEnv: "PDLC_PLUGIN_REPO_TOKEN",
    unmeasurablePasses: 3,
    ...overrides,
  };
}

/** A minimal post-convention LEARNINGS metadata table, `Phases exercised` carrying `phases`. */
function learningsWithPhases(phases) {
  return [
    "# LEARNINGS-fixture",
    "",
    "| Field | Value |",
    "|---|---|",
    "| Feature | fixture |",
    "| REQ | REQ-fixture.md |",
    "| Date Completed | 2026-01-01 |",
    "| Total Iterations | 1 |",
    "| Upstream | REQ |",
    `| Phases exercised | ${phases.join(", ")} |`,
    "| Harvested from | CROSS-REVIEW-se-review-TSPEC-v1.md |",
    "| DoD rounds | 1 |",
    "",
    "## 5. Open Items",
    "",
  ].join("\n");
}

/** As above, plus one §5 Open Item `failure-mode-id` line (FSPEC §8.4 step 3's grammar). */
function learningsWithId(id, phases) {
  return learningsWithPhases(phases) + `- failure-mode-id: ${id}\n`;
}

/** A pre-convention LEARNINGS: no `Phases exercised` row, only `Harvested from`. */
function learningsHarvestedFrom(basename) {
  return [
    "# LEARNINGS-fixture",
    "",
    "| Field | Value |",
    "|---|---|",
    "| Feature | fixture |",
    "| REQ | REQ-fixture.md |",
    "| Date Completed | 2026-01-01 |",
    "| Total Iterations | 1 |",
    "| Upstream | REQ |",
    `| Harvested from | ${basename} |`,
    "| DoD rounds | 1 |",
    "",
    "## 5. Open Items",
    "",
  ].join("\n");
}

// ─── T17 — AT-F6 … AT-F18 ───────────────────────────────────────────────────

describe("T17 — AT-F6…AT-F18: effectiveness and remediation (blocks T27)", () => {
  describe("phasesExercised, effectivenessTable, openPromotionList, remediationChoice", () => {
    describe("phasesExercised — vocabularies §2's mapping", () => {
      test("prefers the LEARNINGS' own `Phases exercised` metadata row when present", () => {
        const result = cons.phasesExercised(learningsWithPhases(["T", "D"]));
        expect(result).toBeInstanceOf(Set);
        expect([...result].sort()).toEqual(["D", "T"]);
      });

      test("pre-convention: a CROSS-REVIEW basename decides the docType's owning phase (TSPEC here)", () => {
        const result = cons.phasesExercised(
          learningsHarvestedFrom("CROSS-REVIEW-se-review-TSPEC-v1.md")
        );
        expect([...result]).toEqual(["T"]);
      });

      test("pre-convention: a CODE_REVIEW basename decides DOD", () => {
        const result = cons.phasesExercised(
          learningsHarvestedFrom("CODE_REVIEW-my-feature-v2.md")
        );
        expect([...result]).toEqual(["DOD"]);
      });

      test("pre-convention: a POSTMORTEM basename decides that phase verbatim, and takes precedence", () => {
        const result = cons.phasesExercised(
          learningsHarvestedFrom("POSTMORTEM-CR-my-feature.md")
        );
        expect([...result]).toEqual(["CR"]);
      });

      test("an undecidable Harvested-from basename yields the empty set — never a guessed phase", () => {
        const result = cons.phasesExercised(learningsHarvestedFrom("some-random-file.md"));
        expect(result).toEqual(new Set());
      });
    });

    describe("effectivenessTable — the three verdict arms are total and rule-decided (PROP-EFF-02)", () => {
      test("AT-F6 — a consumed LEARNINGS naming the promotion's id: recurred", () => {
        const id = "fm-6";
        const rows = cons.effectivenessTable(
          [record({ failureModeId: id, phase: "T", passId: "p1" })],
          [{ passId: "p1", consumed: [learningsWithId(id, [])] }],
          defaultConfig()
        );
        const row = rows.find((r) => r.failureModeId === id);
        expect(row.verdict).toBe("recurred");
      });

      test("AT-F7 — no consumed LEARNINGS names the id, but one's Phases-exercised covers the promotion's phase: prevented", () => {
        const id = "fm-7";
        const rows = cons.effectivenessTable(
          [record({ failureModeId: id, phase: "T", passId: "p1" })],
          [{ passId: "p1", consumed: [learningsWithPhases(["T"])] }],
          defaultConfig()
        );
        const row = rows.find((r) => r.failureModeId === id);
        expect(row.verdict).toBe("prevented");
      });

      test("AT-F8 — no consumed LEARNINGS decided to have exercised that phase: insufficient-evidence, never a guessed prevented", () => {
        const id = "fm-8";
        const rows = cons.effectivenessTable(
          [record({ failureModeId: id, phase: "D", passId: "p1" })],
          [{ passId: "p1", consumed: [learningsWithPhases(["T"])] }],
          defaultConfig()
        );
        const row = rows.find((r) => r.failureModeId === id);
        expect(row.verdict).toBe("insufficient-evidence");
      });

      test("PROP-EFF-01 — one row per distinct id, never one per record: two records sharing one id still yield exactly one row", () => {
        const id = "fm-shared";
        const rows = cons.effectivenessTable(
          [
            record({ failureModeId: id, phase: "T", passId: "p0", action: "promote" }),
            record({ failureModeId: id, phase: "T", passId: "p0", action: "promote" }),
          ],
          [{ passId: "p1", consumed: [learningsWithPhases(["T"])] }],
          defaultConfig()
        );
        expect(rows.filter((r) => r.failureModeId === id)).toHaveLength(1);
      });

      test("a record with no failureModeId contributes no row at all (a row cannot be keyed on an absent id)", () => {
        const bare = record({ phase: "T", passId: "p0" });
        delete bare.failureModeId;
        const rows = cons.effectivenessTable(
          [bare],
          [{ passId: "p1", consumed: [learningsWithPhases(["T"])] }],
          defaultConfig()
        );
        expect(rows.some((r) => r.failureModeId === undefined)).toBe(false);
      });

      test("AT-F15 — one §5 Open Item id byte-equal to one of three recorded ids: recurred for exactly that one", () => {
        const named = "fm-15-named";
        const other1 = "fm-15-other-1";
        const other2 = "fm-15-other-2";
        const rows = cons.effectivenessTable(
          [
            record({ failureModeId: named, phase: "T", passId: "p1" }),
            record({ failureModeId: other1, phase: "T", passId: "p1" }),
            record({ failureModeId: other2, phase: "D", passId: "p1" }),
          ],
          [{ passId: "p1", consumed: [learningsWithId(named, ["T"])] }],
          defaultConfig()
        );
        expect(rows.find((r) => r.failureModeId === named).verdict).toBe("recurred");
        expect(rows.find((r) => r.failureModeId === other1).verdict).toBe("prevented");
        expect(rows.find((r) => r.failureModeId === other2).verdict).toBe("insufficient-evidence");
      });

      test("AT-F16 — an id matching no record: a parse notice, no verdict, no promotion invented", () => {
        const consumed = [learningsWithId("fm-16-unmatched", ["T"])];
        const rows = cons.effectivenessTable(
          [record({ failureModeId: "fm-16-real", phase: "T", passId: "p1" })],
          [{ passId: "p1", consumed }],
          defaultConfig()
        );
        expect(rows.some((r) => r.failureModeId === "fm-16-unmatched")).toBe(false);
        expect(rows).toHaveLength(1);
      });
    });

    describe("effectivenessTable — streaks (FSPEC §8.5, §8.7)", () => {
      test("AT-F9 — recurred on two consecutive counted passes, with an insufficient-evidence pass and an empty-consumed-set pass interleaved: the streak is unbroken, and the promotion is flagged ineffective", () => {
        const id = "fm-9";
        const rows = cons.effectivenessTable(
          [record({ failureModeId: id, phase: "T", passId: "p0" })],
          [
            { passId: "p1", consumed: [learningsWithId(id, [])] }, // recurred, counted #1
            { passId: "p2", consumed: [] }, // empty consumed set: skipped entirely
            { passId: "p3", consumed: [learningsWithPhases(["Q"])] }, // insufficient-evidence: skipped
            { passId: "p4", consumed: [learningsWithId(id, [])] }, // recurred, counted #2
          ],
          defaultConfig()
        );
        const row = rows.find((r) => r.failureModeId === id);
        expect(row.verdict).toBe("recurred");
        expect(row.state).toBe("ineffective");
      });

      test("AT-F12 — a merged revision resets the streak to zero: one fresh recurred pass after it is not enough, two are", () => {
        const id = "fm-12";
        const promoteRec = record({ failureModeId: id, phase: "T", passId: "p0", action: "promote" });
        const reviseRec = record({
          failureModeId: id,
          phase: "T",
          passId: "p3",
          action: "revise",
          route: "constraints",
        });
        const passesThroughReset = [
          { passId: "p1", consumed: [learningsWithId(id, [])] }, // recurred #1 (pre-reset)
          { passId: "p2", consumed: [learningsWithId(id, [])] }, // recurred #2 (pre-reset) — flags, remediated
          { passId: "p3", consumed: [] }, // the revise lands here (empty consumed, reset)
          { passId: "p4", consumed: [learningsWithId(id, [])] }, // one fresh recurred pass since reset
        ];
        const oneFresh = cons.effectivenessTable(
          [promoteRec, reviseRec],
          passesThroughReset,
          defaultConfig()
        );
        // Positive, not absence-only: after the reset one fresh recurred pass leaves the
        // `ineffective` streak at 1 and the `unmeasurable` streak at 0, so §8.5's state is `null`
        // outright. `not.toBe("ineffective")` would also pass on `"unmeasurable"`, or on a state
        // field that had stopped being computed at all.
        expect(oneFresh.find((r) => r.failureModeId === id).state).toBeNull();

        const twoFresh = cons.effectivenessTable(
          [promoteRec, reviseRec],
          [...passesThroughReset, { passId: "p5", consumed: [learningsWithId(id, [])] }],
          defaultConfig()
        );
        expect(twoFresh.find((r) => r.failureModeId === id).state).toBe("ineffective");
      });

      test("AT-F13 — insufficient-evidence for unmeasurablePasses consecutive EVALUATED passes, one a duplicate-suppressed no-op (non-empty consumed): that pass counts, and the promotion is unmeasurable", () => {
        const id = "fm-13";
        const rows = cons.effectivenessTable(
          [record({ failureModeId: id, phase: "D", passId: "p0" })],
          [
            { passId: "p1", consumed: [learningsWithPhases(["T"])] },
            // Stands for the duplicate-suppressed no-op pass: its consumed set is non-empty, so
            // FSPEC §8.7's population still counts it, keyed on consumed-set emptiness alone.
            { passId: "p2", consumed: [learningsWithPhases(["T"])] },
            { passId: "p3", consumed: [learningsWithPhases(["T"])] },
          ],
          defaultConfig({ unmeasurablePasses: 3 })
        );
        const row = rows.find((r) => r.failureModeId === id);
        expect(row.verdict).toBe("insufficient-evidence");
        expect(row.state).toBe("unmeasurable");
      });

      test("an empty consumed-set pass advances neither streak (AC-1.4's skipped-cadence cause)", () => {
        const id = "fm-empty-consumed";
        const rows = cons.effectivenessTable(
          [record({ failureModeId: id, phase: "D", passId: "p0" })],
          [
            { passId: "p1", consumed: [] },
            { passId: "p2", consumed: [] },
            { passId: "p3", consumed: [] },
          ],
          defaultConfig({ unmeasurablePasses: 3 })
        );
        const row = rows.find((r) => r.failureModeId === id);
        // Neither streak moved, so the state is `null` — asserted positively. The two
        // `not.toBe(...)` checks this replaces were jointly satisfiable by a third state value,
        // and each was satisfiable by the row simply not carrying the field.
        expect(row.state).toBeNull();
      });
    });

    describe("effectivenessTable — the `remediation` and `artifact` fields (PLAN T17: absent-not-empty, unavailable-not-blank)", () => {
      test("AT-F14 — an ordinary promote with no remediation: the field is null (absent), never empty-valued", () => {
        const id = "fm-14";
        const rows = cons.effectivenessTable(
          [record({ failureModeId: id, phase: "T", passId: "p0" })],
          [{ passId: "p1", consumed: [learningsWithPhases(["T"])] }],
          defaultConfig()
        );
        const row = rows.find((r) => r.failureModeId === id);
        expect(row.verdict).toBe("prevented");
        expect(row.remediation).toBeNull();
        expect(row.remediation).not.toBe("");
        expect("remediation" in row).toBe(true);
      });

      test("a row with no artifact: the field is null — never blank, never a guessed path — rendered as UNAVAILABLE only at display time", () => {
        const id = "fm-unavailable";
        const rows = cons.effectivenessTable(
          [record({ failureModeId: id, phase: "T", passId: "p0", artifact: null })],
          [{ passId: "p1", consumed: [learningsWithPhases(["T"])] }],
          defaultConfig()
        );
        const row = rows.find((r) => r.failureModeId === id);
        expect(row.artifact).toBeNull();
        expect(row.artifact).not.toBe("");
        expect(cons.UNAVAILABLE).toBe("(unavailable)");
      });
    });

    describe("openPromotionList — FSPEC §8.4 step 1 (§8.1's reader row)", () => {
      test("an id with no retire record at all is open", () => {
        const list = openPromotionList([
          record({ failureModeId: "fm-open", action: "promote", route: "constraints" }),
        ]);
        expect(list).toContain("fm-open");
      });

      test("a retire record whose route is NOT degraded closes the id", () => {
        const list = openPromotionList([
          record({ failureModeId: "fm-closed", action: "retire", route: "constraints" }),
        ]);
        expect(list).not.toContain("fm-closed");
      });

      test("a retire record whose route IS degraded does not close the id — it stays open", () => {
        const list = openPromotionList([
          record({ failureModeId: "fm-degraded", action: "retire", route: "degraded" }),
        ]);
        expect(list).toContain("fm-degraded");
      });

      test("a record missing failureModeId contributes no member at all — never `undefined` in the list", () => {
        const bare = record({ action: "promote", route: "constraints" });
        delete bare.failureModeId;
        const list = openPromotionList([bare]);
        expect(list).not.toContain(undefined);
        expect(list.every((x) => typeof x === "string")).toBe(true);
      });
    });

    describe("remediationChoice — FSPEC §8.5's four rows, top-down (AC-5.3)", () => {
      test("AT-F10 — an ineffective promotion whose revise is already on an open PR: retirement is proposed", () => {
        const id = "fm-10";
        const prStates = [{ state: "open", pairs: [{ failureModeId: id, action: "revise" }] }];
        const result = cons.remediationChoice(id, [], prStates, true);
        expect(result).toBe("retirement");
      });

      test("AT-F11 — an ineffective promotion whose retire is already on an open or merged PR: nothing further is proposed (null) — the caller records duplicate-suppressed and reports the field as retirement", () => {
        const id = "fm-11";
        const openPr = [{ state: "open", pairs: [{ failureModeId: id, action: "retire" }] }];
        const mergedPr = [{ state: "merged", pairs: [{ failureModeId: id, action: "retire" }] }];
        expect(cons.remediationChoice(id, [], openPr, true)).toBeNull();
        expect(cons.remediationChoice(id, [], mergedPr, true)).toBeNull();
      });

      test("AT-F17 — no spent alternative, subject artifact exists at HEAD: revision is proposed, deterministically (run twice, identical)", () => {
        const id = "fm-17";
        const first = cons.remediationChoice(id, [], [], true);
        const second = cons.remediationChoice(id, [], [], true);
        expect(first).toBe("revision");
        expect(second).toBe("revision");
      });

      test("AT-F18 — no spent alternative, subject artifact deleted since the promotion landed: retirement is proposed — nothing left to revise", () => {
        const id = "fm-18";
        const result = cons.remediationChoice(id, [], [], false);
        expect(result).toBe("retirement");
      });

      test("the predicate consulted is headExists alone — a closed-unmerged PR never spends the alternative (row 1/2 require open or merged)", () => {
        const id = "fm-closed-unmerged";
        const closedPr = [{ state: "closed", pairs: [{ failureModeId: id, action: "retire" }] }];
        // Row 1 does not match (closed, not open/merged) — falls through to row 3/4 on headExists.
        expect(cons.remediationChoice(id, [], closedPr, true)).toBe("revision");
        expect(cons.remediationChoice(id, [], closedPr, false)).toBe("retirement");
      });
    });
  });
});
