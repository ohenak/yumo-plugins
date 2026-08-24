// waveResumeProperties.test.js -- PLAN T-08, TSPEC §5.7, PROPERTIES P-1…P-4.
//
// Generative property suite for the wave-resume primitives T-02 landed:
// `parseWaveLedger`, `formatWaveLedger`, `classifyWaveLedger` and
// `computePlanHash`. Split into its own file on the precedent of
// `advisoryHelperProperties.test.js`: the table-driven cases in
// `waveResume.test.js` and `waveExecution.test.js` pin the *named* examples
// TSPEC §3.1/§3.2/§4.3 enumerate; this file pins the *laws* those examples are
// instances of, over inputs nobody hand-picked. Both are load-bearing; neither
// subsumes the other.
//
// Round-1 F-06: a plan citing `advisoryHelperProperties.test.js` as its model
// must not run 5x shallower than the block it is modelled on
// (`describe("PROP-CTR-05 (generative): citesGateOutput …")` pins
// `numRuns: 500` at five `fc.assert` sites). P-1…P-4 are the same kind of law,
// so every `fc.assert` below is pinned at 500 -- no pinned seed.

import fc from "fast-check";
import * as devModule from "../orchestrate-dev.js";

const {
  parseWaveLedger,
  formatWaveLedger,
  classifyWaveLedger,
  computePlanHash,
  RESUME_OUTCOMES,
  RESUME_PROVENANCE,
  WAVE_IGNORE_REASONS,
} = devModule;

const RUNS = { numRuns: 500 };

// ════════════════════════════════════════════════════════════════════════════
// P-1 -- ROUND-TRIP: formatWaveLedger then parseWaveLedger is the identity
// ════════════════════════════════════════════════════════════════════════════

describe("PROP-LAW-01 (P-1, generative): parseWaveLedger(formatWaveLedger(...)) round-trips", () => {
  /**
   * `feature`/`planHash` -- any string that is non-empty after trimming.
   * `parseWaveLedger` requires `.trim() !== ""` to accept the record as
   * well-formed, but carries the RAW (untrimmed) value through as `state.feature`
   * / `state.planHash`, so the round trip must preserve the string exactly, not
   * its trimmed form.
   */
  const nonEmptyAfterTrim = fc.string({ minLength: 1 }).filter((s) => s.trim() !== "");

  /**
   * `head` -- omitted (undefined/null), or a string that is ALREADY trimmed and
   * non-empty. `formatWaveLedger` writes `head.trim()` and `parseWaveLedger`
   * reads it back with a second `.trim()`, so a head with surrounding
   * whitespace round-trips to its trimmed form, not to itself; restricting the
   * generator to pre-trimmed strings keeps the property's literal
   * `head: head ?? null` statement true without smuggling a second normalising
   * step into the assertion.
   */
  const headArb = fc.oneof(
    fc.constant(undefined),
    fc.constant(null),
    fc.string({ minLength: 1 }).filter((s) => s.trim() === s && s.length > 0)
  );

  test("ROUND-TRIP: state deep-equals the written fields, head defaulting to null, and reason is always null", () => {
    fc.assert(
      fc.property(
        nonEmptyAfterTrim,
        nonEmptyAfterTrim,
        fc.integer({ min: 1, max: 1_000_000 }),
        headArb,
        (feature, planHash, lastGreenWave, head) => {
          const written = formatWaveLedger(feature, planHash, lastGreenWave, head);
          const { state, reason } = parseWaveLedger(written);
          expect(state).toEqual({ feature, planHash, lastGreenWave, head: head ?? null });
          expect(reason).toBeNull();
        }
      ),
      RUNS
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// P-2 -- TOTALITY (reader): parseWaveLedger never throws, always one of three
// ════════════════════════════════════════════════════════════════════════════

describe("PROP-LAW-02 (P-2, generative): parseWaveLedger is total over TSPEC §4.2's three shapes", () => {
  /**
   * `text` is typed `string | null`, but production reads it from a file that
   * could hold anything a hand-edit left behind, so this generator stresses
   * beyond the declared type on purpose: arbitrary strings, arbitrary
   * stringified JSON values, and arbitrary non-string inputs (numbers,
   * booleans, arrays, plain objects, `undefined`) that a caller with looser
   * typing could still hand it. Object/array keys and values are drawn from
   * `fc.jsonValue()` rather than `fc.anything()`: a value whose OWN `toString`
   * or `valueOf` key holds a non-callable is a pathological adversarial input
   * outside the `string | null` contract, not a realistic non-string input, and
   * would fail `String(text)` for a reason this law is not about.
   */
  const safeKey = fc.string().filter((k) => !["toString", "valueOf", "constructor", "__proto__"].includes(k));
  // Scalar-only: a nested object/array value could itself carry a `__proto__`
  // key, which JS treats as a prototype assignment (not a data property) when
  // set via a plain object literal or bracket assignment -- the same trap as
  // `toString`/`valueOf` above, one level down.
  const scalarJson = fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null));
  const arbitraryText = fc.oneof(
    fc.string(),
    fc.constant(null),
    fc.constant(undefined),
    fc.jsonValue().map((v) => JSON.stringify(v)),
    fc.integer(),
    fc.double({ noNaN: false }),
    fc.boolean(),
    fc.array(scalarJson, { maxLength: 6 }),
    // `fc.dictionary` builds its object via `Object.create(null)` internally,
    // which has no `toString`/`valueOf` at all -- a fast-check implementation
    // detail, not a realistic non-string input. Re-wrap onto a plain object so
    // the generator represents "an ordinary object a caller might hand this
    // function" rather than fast-check's own null-prototype storage.
    fc.dictionary(safeKey, scalarJson, { maxKeys: 6 }).map((d) => ({ ...d }))
  );

  test("TOTALITY: never throws, and returns exactly one of the three shapes", () => {
    fc.assert(
      fc.property(arbitraryText, (text) => {
        const result = parseWaveLedger(text);
        expect(Object.keys(result).sort()).toEqual(["reason", "state"]);

        const shapeOne = result.state === null && result.reason === null;
        const shapeTwo = result.state === null && typeof result.reason === "string";
        const shapeThree = result.state !== null && result.reason === null;
        expect(shapeOne || shapeTwo || shapeThree).toBe(true);

        if (shapeThree) {
          expect(typeof result.state).toBe("object");
        }
      }),
      RUNS
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// P-3 -- TOTALITY (classifier): classifyWaveLedger stays inside the closed
// vocabularies for any ClassifyInput (BR-01, TSPEC §2.2)
// ════════════════════════════════════════════════════════════════════════════

describe("PROP-LAW-03 (P-3, generative): classifyWaveLedger is total over ClassifyInput", () => {
  /** TSPEC §4.2's three `ParsedWaveLedger` shapes, generated with arbitrary field values. */
  const parsedArb = fc.oneof(
    fc.record({ state: fc.constant(null), reason: fc.constant(null) }),
    fc.record({ state: fc.constant(null), reason: fc.string() }),
    fc.record({
      state: fc.record({
        feature: fc.string(),
        planHash: fc.string(),
        lastGreenWave: fc.integer(),
        head: fc.oneof(fc.constant(null), fc.string()),
      }),
      reason: fc.constant(null),
    })
  );

  const classifyInputArb = fc.record({
    parsed: parsedArb,
    feature: fc.string(),
    planHash: fc.string(),
    waveCount: fc.integer(),
    headOk: fc.boolean(),
  });

  test("TOTALITY: outcome, provenance and code never leave their closed vocabularies, and classifyWaveLedger never throws", () => {
    fc.assert(
      fc.property(classifyInputArb, (input) => {
        const decision = classifyWaveLedger(input);
        expect(RESUME_OUTCOMES).toContain(decision.outcome);
        expect(RESUME_PROVENANCE).toContain(decision.provenance);
        if (Object.hasOwn(decision, "code")) {
          expect(decision.code === null || Object.keys(WAVE_IGNORE_REASONS).includes(decision.code)).toBe(
            true
          );
        }
      }),
      RUNS
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// P-4 -- HASH DISCRIMINATION: computePlanHash differs across the generated
// corpus of layouts differing in wave order, task ids, task-to-wave
// assignment, or owned paths (TSPEC §4.3)
// ════════════════════════════════════════════════════════════════════════════

describe("PROP-LAW-04 (P-4, generative): computePlanHash discriminates over the generated corpus", () => {
  // Bounded-corpus caveat (TSPEC §4.3, PROPERTIES PROP-LAW-04): FNV-1a over 32
  // bits is NOT injective. A hash collision between two canonically-different
  // wave layouts is possible in principle -- if this suite ever reds here,
  // that is a finding about the CORPUS this run happened to draw, not a
  // falsification of the law `computePlanHash` is asked to keep. The law is
  // "differs across the generated corpus", not "never collides".

  /** Transcribed from `computePlanHash`'s own canonicalisation, to gate each
   *  mutation on actually having changed the pre-hash representation before
   *  asking the hash to discriminate it. */
  const canonicalOf = (waves) =>
    waves.map((wave) => wave.map((t) => `${t.id}:${t.files.join(",")}`).join("|")).join(";");

  const taskIdArb = fc.string({ minLength: 1, maxLength: 12 });
  const filePathArb = fc.string({ minLength: 1, maxLength: 20 });
  const taskArb = fc.record({ id: taskIdArb, files: fc.array(filePathArb, { maxLength: 4 }) });
  const wavesArb = fc.array(fc.array(taskArb, { minLength: 1, maxLength: 4 }), {
    minLength: 2,
    maxLength: 4,
  });

  test("DISCRIMINATION: reordering the waves changes the hash", () => {
    fc.assert(
      fc.property(wavesArb, (waves) => {
        const reordered = [...waves].reverse();
        fc.pre(canonicalOf(waves) !== canonicalOf(reordered));
        expect(computePlanHash(waves)).not.toBe(computePlanHash(reordered));
      }),
      RUNS
    );
  });

  test("DISCRIMINATION: renaming one task's id changes the hash", () => {
    fc.assert(
      fc.property(wavesArb, taskIdArb, fc.nat(), fc.nat(), (waves, newId, waveSeed, taskSeed) => {
        const wi = waveSeed % waves.length;
        fc.pre(waves[wi].length > 0);
        const ti = taskSeed % waves[wi].length;
        const mutated = waves.map((w, i) =>
          i === wi ? w.map((t, j) => (j === ti ? { ...t, id: newId } : t)) : w
        );
        fc.pre(canonicalOf(waves) !== canonicalOf(mutated));
        expect(computePlanHash(waves)).not.toBe(computePlanHash(mutated));
      }),
      RUNS
    );
  });

  test("DISCRIMINATION: moving a task to a different wave changes the hash", () => {
    fc.assert(
      fc.property(wavesArb, fc.nat(), fc.nat(), (waves, fromSeed, toSeed) => {
        const from = fromSeed % waves.length;
        fc.pre(waves[from].length > 0);
        const to = toSeed % waves.length;
        fc.pre(to !== from);
        const task = waves[from][0];
        const mutated = waves.map((w, i) => {
          if (i === from) return w.slice(1);
          if (i === to) return [...w, task];
          return w;
        });
        fc.pre(canonicalOf(waves) !== canonicalOf(mutated));
        expect(computePlanHash(waves)).not.toBe(computePlanHash(mutated));
      }),
      RUNS
    );
  });

  test("DISCRIMINATION: changing a task's owned paths changes the hash", () => {
    fc.assert(
      fc.property(
        wavesArb,
        fc.array(filePathArb, { maxLength: 4 }),
        fc.nat(),
        fc.nat(),
        (waves, newFiles, waveSeed, taskSeed) => {
          const wi = waveSeed % waves.length;
          fc.pre(waves[wi].length > 0);
          const ti = taskSeed % waves[wi].length;
          const mutated = waves.map((w, i) =>
            i === wi ? w.map((t, j) => (j === ti ? { ...t, files: newFiles } : t)) : w
          );
          fc.pre(canonicalOf(waves) !== canonicalOf(mutated));
          expect(computePlanHash(waves)).not.toBe(computePlanHash(mutated));
        }
      ),
      RUNS
    );
  });
});

