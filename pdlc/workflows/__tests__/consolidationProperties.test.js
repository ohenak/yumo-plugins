// consolidationProperties.test.js — PLAN T19 (RED, describe.skip).
//
// Six generator-driven property blocks (PROPERTIES §11, TSPEC §11.4), one per PROP-GEN-01..06, all
// drawn from `driftGenerators.js`'s seeded xorshift32 PRNG via `consolidationDoubles.js`'s
// re-exported `seeded`/`resolveSeed` — no property-testing dependency is added (PROPERTIES §11's
// header note). Nested two-per-block under the three green owners that will un-skip them: `T25`
// (corpus predicate + config parse), `T26` (passId + merge fold), `T27` (escalation count +
// effectiveness table). Each `test()` draws a bounded number of cases and, on failure, names the
// seed and draw index so the case is reproducible without re-running the suite (PROP-GEN-00).
//
// `classifyCorpus`, `parseConsolidationConfig`, `mintPassId`, `failureModeId`, `targetFor`,
// `mergeProposals`, `parseEscalations` and `effectivenessTable` do not exist as behaviour yet (PLAN
// T02 skeleton — all throw `notImplemented`); T25/T26/T27 are the rows that give them one.

import {
  classifyCorpus,
  parseConsolidationConfig,
  mintPassId,
  failureModeId,
  targetFor,
  mergeProposals,
  parseEscalations,
  effectivenessTable,
} from "../consolidate-learnings.js";
import { seeded, resolveSeed, buildEscalationsFixture } from "./helpers/consolidationDoubles.js";

describe("T19 — the property suite (L5)", () => {
  // ─────────────────────────── T25 — corpus and predicate ───────────────────────────

  describe("T25 — corpus and predicate", () => {
    const SEED_01 = resolveSeed(1900001);

    // PROP-GEN-01 — the two-region predicate is total, and its two sets partition the corpus.
    test("PROP-GEN-01: classifyCorpus never throws, and every enumerated file lands in exactly one of the two sets", () => {
      const rng = seeded(SEED_01);
      const DRAWS = 40;
      for (let i = 0; i < DRAWS; i += 1) {
        const basenames = [];
        for (let b = 0; b < rng.int(1, 6); b += 1) {
          basenames.push(`LEARNINGS-gen-${i}-${b}.md`);
        }
        const files = basenames.map((basename) => ({ path: `docs/gen-${i}/${basename}`, basename }));

        // Random interleaving of openers, closers, stray basenames and prose (§7.1's block grammar).
        const inBlock = basenames.filter(() => rng.int(0, 1) === 1);
        const lines = ["prose before any marker, never a basename by itself"];
        if (inBlock.length > 0) {
          lines.push(`<!-- pdlc:consumed P-gen-${i} -->`);
          for (const basename of inBlock) lines.push(basename);
          lines.push("<!-- /pdlc:consumed -->");
        }
        lines.push("trailing prose after the last marker");
        const logText = lines.join("\n");

        let predicate;
        try {
          predicate = classifyCorpus(files, logText);
        } catch (err) {
          throw new Error(`PROP-GEN-01 failed at seed ${SEED_01}, draw ${i}: ${err.message}`);
        }

        for (const { basename } of files) {
          const inConsolidated = predicate.consolidated.has(basename);
          const inUnconsolidated = predicate.unconsolidated.includes(basename);
          // Exactly one, never both, never neither — the partition, not containment either way.
          expect(inConsolidated !== inUnconsolidated).toBe(true);
        }
      }
    });

    // PROP-GEN-03 — config corruption is per key, and invalidKeys is set-equal to the corrupted subset.
    const CONFIG_DEFAULTS = Object.freeze({
      cadenceHours: 168,
      volumeThreshold: 5,
      staleLockMinutes: 60,
      pluginRepository: null,
      credentialEnv: "PDLC_PLUGIN_REPO_TOKEN",
      unmeasurablePasses: 3,
    });

    test("PROP-GEN-03: every uncorrupted key keeps its value, every corrupted key takes its default, invalidKeys is set-equal to the corrupted subset", () => {
      const rng = seeded(resolveSeed(1900003));
      const DRAWS = 40;
      const keys = Object.keys(CONFIG_DEFAULTS);
      for (let i = 0; i < DRAWS; i += 1) {
        const configured = {
          cadenceHours: rng.int(1, 999),
          volumeThreshold: rng.int(1, 20),
          staleLockMinutes: rng.int(1, 999),
          pluginRepository: `owner-${i}/repo-${i}`,
          credentialEnv: `ENV_VAR_${i}`,
          unmeasurablePasses: rng.int(1, 10),
        };
        const corrupted = new Set(keys.filter(() => rng.int(0, 1) === 1));
        const section = { ...configured };
        for (const key of corrupted) {
          // Corrupt by type — a shape `parseConsolidationConfig` never accepts for any key.
          section[key] = { wrongShape: true };
        }
        const text = JSON.stringify({ consolidation: section });

        let result;
        try {
          result = parseConsolidationConfig(text);
        } catch (err) {
          throw new Error(`PROP-GEN-03 failed at seed 1900003, draw ${i}: ${err.message}`);
        }

        for (const key of keys) {
          if (corrupted.has(key)) {
            expect(result.config[key]).toEqual(CONFIG_DEFAULTS[key]);
          } else {
            expect(result.config[key]).toEqual(configured[key]);
          }
        }
        expect([...result.invalidKeys].sort()).toEqual([...corrupted].sort());
      }
    });
  });

  // ─────────────────────────── T26 — identity and merge ───────────────────────────

  describe.skip("T26 — identity and merge", () => {
    // PROP-GEN-02 — mintPassId dominates every parseable {today} id, ignores garbage, is
    // invariant under row order.
    test("PROP-GEN-02: minted id is strictly greater than every parseable {today} id, unparseable rows change nothing, and the result is invariant under row permutation", () => {
      const rng = seeded(resolveSeed(1900002));
      const DRAWS = 40;
      const today = "20260101";
      for (let i = 0; i < DRAWS; i += 1) {
        const n = rng.int(1, 6);
        const rows = [];
        const parseableSuffixes = [];
        for (let r = 0; r < n; r += 1) {
          if (rng.int(0, 3) === 0) {
            rows.push(`pass: not-a-real-id-${r}`);
          } else {
            const suffix = rng.int(1, 500);
            parseableSuffixes.push(suffix);
            rows.push(`pass: ${today}-${suffix}`);
          }
        }
        const logText = rows.join("\n");

        let minted;
        try {
          minted = mintPassId(logText, today);
        } catch (err) {
          throw new Error(`PROP-GEN-02 failed at seed 1900002, draw ${i}: ${err.message}`);
        }

        if (parseableSuffixes.length === 0) {
          expect(minted).toBe(`${today}-1`);
        } else {
          const max = Math.max(...parseableSuffixes);
          const mintedSuffix = Number(minted.slice(`${today}-`.length));
          expect(mintedSuffix).toBeGreaterThan(max);
        }

        // Unparseable rows change nothing: dropping them mints the same id.
        const onlyParseable = rows.filter((row) => !row.includes("not-a-real-id")).join("\n");
        expect(mintPassId(onlyParseable, today)).toBe(minted);

        // Invariant under row permutation.
        const shuffled = rng.shuffle(rows).join("\n");
        expect(mintPassId(shuffled, today)).toBe(minted);
      }
    });

    // PROP-GEN-05 — the merge fold is permutation-invariant, and one ordering matches §7.4's
    // fold table literally.
    test("PROP-GEN-05: mergeProposals folds a shared-(failureModeId, action) group invariant under permutation, matching §7.4's fold table on kind/artifact/target/elidedKinds/elidedArtifacts", () => {
      const rng = seeded(resolveSeed(1900005));
      const DRAWS = 30;
      const PHASES = ["R", "F", "T", "D", "P", "PR", "I", "PT", "CR", "DOD", "H", "PUB", "MERGE"];
      const randomArtifact = () => {
        const segments = [];
        for (let s = 0; s < rng.int(1, 3); s += 1) segments.push(`seg${rng.int(0, 999)}`);
        return `docs/${segments.join("/")}/file-${rng.int(0, 999)}.md`;
      };

      for (let i = 0; i < DRAWS; i += 1) {
        const phase = rng.pick(PHASES);
        const seedArtifact = randomArtifact();
        // The shared id is DERIVED, never assigned: one (phase, artifact) pair, computed once.
        const id = failureModeId(phase, seedArtifact);
        const action = rng.pick(["promote", "revise", "retire"]);

        const n = rng.int(2, 4);
        const group = [];
        for (let c = 0; c < n; c += 1) {
          const kind = rng.pick([1, 2, 3]);
          const artifact = randomArtifact();
          group.push({
            failureModeId: id,
            action,
            kind,
            artifact,
            target: targetFor(kind, artifact, id),
            symptom: `symptom-${i}-${c}`,
          });
        }

        const expectedKind = Math.min(...group.map((p) => p.kind));
        const expectedArtifact = [...group.map((p) => p.artifact)].sort()[0];
        const expectedTarget = targetFor(expectedKind, expectedArtifact, id);
        const expectedElidedKinds = [...new Set(group.map((p) => p.kind))].filter((k) => k !== expectedKind).sort();
        const expectedElidedArtifacts = group.map((p) => p.artifact).filter((a) => a !== expectedArtifact).sort();

        let foldedFromOriginal;
        try {
          foldedFromOriginal = mergeProposals(group);
        } catch (err) {
          throw new Error(`PROP-GEN-05 failed at seed 1900005, draw ${i}: ${err.message}`);
        }
        expect(foldedFromOriginal).toHaveLength(1);
        const folded = foldedFromOriginal[0];

        // Positive conjunct — values transcribed literally from §7.4's fold table, never read back
        // off the fold's own output.
        expect(folded.kind).toBe(expectedKind);
        expect(folded.artifact).toBe(expectedArtifact);
        expect(folded.target).toBe(expectedTarget);
        expect([...folded.elidedKinds].sort()).toEqual(expectedElidedKinds);
        expect([...folded.elidedArtifacts].sort()).toEqual(expectedElidedArtifacts);

        // Invariant under permutation.
        const shuffled = rng.shuffle(group);
        expect(mergeProposals(shuffled)).toEqual(foldedFromOriginal);
      }
    });
  });

  // ─────────────────────── T27 — effectiveness and escalations ───────────────────────

  describe.skip("T27 — effectiveness and escalations", () => {
    // PROP-GEN-04 — escalation counting attributes exactly the well-formed entries and invents
    // no key.
    test("PROP-GEN-04: the total attributed count equals the number of entries carrying both Feature and Seam, and no count is attributed to a key absent from the input", () => {
      const rng = seeded(resolveSeed(1900004));
      const DRAWS = 30;
      for (let i = 0; i < DRAWS; i += 1) {
        const n = rng.int(1, 8);
        const entries = [];
        let wellFormed = 0;
        const presentSeams = new Set();
        for (let e = 0; e < n; e += 1) {
          const feature = `feat-${i}-${e}`;
          const seam = rng.pick(["A1", "A2", "A3", "A4", "A5"]);
          const dropFeature = rng.int(0, 4) === 0;
          const dropSeam = !dropFeature && rng.int(0, 4) === 0;
          const entry = {};
          if (!dropFeature) entry.feature = feature;
          if (!dropSeam) entry.seam = seam;
          if (!dropFeature && !dropSeam) {
            wellFormed += 1;
            presentSeams.add(seam);
          }
          entries.push(entry);
        }
        const text = buildEscalationsFixture(entries);

        let counts;
        try {
          counts = parseEscalations(text);
        } catch (err) {
          throw new Error(`PROP-GEN-04 failed at seed 1900004, draw ${i}: ${err.message}`);
        }

        const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
        expect(total).toBe(wellFormed);
        for (const key of Object.keys(counts)) {
          // No count attributed to a key absent from the input — the positive conjunct that stops
          // a function attributing everything to one bucket.
          expect(presentSeams.has(key)).toBe(true);
        }
      }
    });

    // PROP-GEN-06 — the effectiveness table is order-invariant, one row per distinct id, each
    // verdict on its assigned arm.
    test("PROP-GEN-06: effectivenessTable is invariant under record order, the row count equals the number of distinct ids, and each row's verdict equals the arm §7.5 assigns", () => {
      const rng = seeded(resolveSeed(1900006));
      const DRAWS = 25;
      for (let i = 0; i < DRAWS; i += 1) {
        const idPool = [`fm-${i}-a`, `fm-${i}-b`, `fm-${i}-c`].slice(0, rng.int(1, 3));
        const records = [];
        const distinctIds = new Set();
        for (const id of idPool) {
          const hasPhase = rng.int(0, 1) === 1;
          distinctIds.add(id);
          records.push({
            failureModeId: id,
            phase: hasPhase ? rng.pick(["R", "F", "T"]) : undefined,
            date: `2026-01-0${1 + (records.length % 9)}`,
          });
        }
        // A record with no failureModeId contributes no row at all — never counted toward
        // distinctIds, and never inflating the row count.
        if (rng.int(0, 3) === 0) {
          records.push({ date: "2026-01-09" });
        }

        const consumedTexts = {};
        const config = { unmeasurablePasses: 3 };

        let table;
        try {
          table = effectivenessTable(records, consumedTexts, config);
        } catch (err) {
          throw new Error(`PROP-GEN-06 failed at seed 1900006, draw ${i}: ${err.message}`);
        }

        expect(table).toHaveLength(distinctIds.size);
        for (const row of table) {
          expect(distinctIds.has(row.id)).toBe(true);
          const source = records.find((r) => r.failureModeId === row.id);
          if (source.phase === undefined) {
            // A record with no phase falls to insufficient-evidence — the structural arm §7.5
            // states rather than a guessed prevented/recurred.
            expect(row.verdict).toBe("insufficient-evidence");
          }
        }

        // Order-invariant.
        const shuffled = rng.shuffle(records);
        expect(effectivenessTable(shuffled, consumedTexts, config)).toEqual(table);
      }
    });
  });
});
