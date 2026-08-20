// advisoryHelperProperties.test.js -- CODE_REVIEW v1 §1 finding 3 (medium).
//
// A6 introduced five pure, parameterisable helpers. Every one of them was
// exercised by hand-written `test.each` tables only, and `fast-check` appeared
// nowhere in the repo, so no generative input space was explored: `citesGateOutput`'s
// whitespace-collapse-then-substring contract at the 24-char floor, in particular,
// had no generative falsifier.
//
// This suite is that falsifier. It is deliberately SEPARATE from the behavioural
// suites rather than folded into them: the table-driven cases in
// advisoryWaveGate.test.js and advisoryConfig.test.js pin the *named* examples the
// TSPEC and PROPERTIES enumerate, and remain the readable documentation of intent.
// What follows pins the *laws* those examples are instances of, over inputs nobody
// chose by hand. Both are load-bearing; neither subsumes the other.
//
// The five helpers, and where each is reached from production:
//
//   parseA6RootCause     (:2359) -- read at `:3187`-ish, classifies the agent's reply
//   parseA6Promotion     (:2406) -- read at `:3187`, E-6's decidable promotion trailer
//   citesGateOutput      (:2429) -- read at `:3165`, BR-3's decidable citation rule
//   a6ProhibitedPaths    (:2000) -- read at `:3088`, AC-3.3 (f)/(g) by subtraction
//   nonNegativeInt       (:2073) -- a closure inside `parseAdvisoryConfig` (:2023),
//                                   so it is driven through its enclosing parser, which
//                                   is also the only way production ever reaches it.
//
// A note on run counts: the default (100) is used everywhere except the two
// properties whose generators are cheap and whose input space is the one the review
// named explicitly (`citesGateOutput`'s floor), which run 500.

import fc from "fast-check";
import * as devModule from "../orchestrate-dev.js";

const {
  parseA6RootCause,
  parseA6Promotion,
  citesGateOutput,
  a6ProhibitedPaths,
  parseAdvisoryConfig,
  ADVISORY_ROOT_CAUSES,
  ADVISORY_DEFAULTS,
  ADVISORY_CONFIG_PATH,
  A6_MIN_CITATION_CHARS,
} = devModule;

// ─── shared generators ──────────────────────────────────────────────────────
//
// `fc.string()` in fast-check v4 draws from the full printable-unicode space,
// which is what we want for the totality laws. Where a generator must avoid
// synthesising a trailer by accident, it is filtered rather than restricted to a
// narrow alphabet -- a narrowed alphabet would quietly shrink the explored space
// and is exactly the weakening this finding is about.

const anyString = fc.string();

/** Lines that cannot themselves be read as the trailer under test. */
const nonTrailerLine = (prefix) => anyString.filter((s) => !s.trim().startsWith(prefix));

/** Any non-string value -- the arm the review flagged as uncovered at `:2407`. */
const nonString = fc.anything().filter((v) => typeof v !== "string");

/**
 * TSPEC §3.3's citation floor, transcribed as a literal and deliberately not imported.
 *
 * Every other property in the `citesGateOutput` block is stated relative to
 * `A6_MIN_CITATION_CHARS`, which is right — they are laws about the floor WHEREVER it sits, and
 * they must not break when a later REQ moves it. But that means none of them can witness the
 * floor's VALUE: move the constant and they all move with it. This literal is the second witness
 * that makes the straddle test non-vacuous.
 */
const TSPEC_CITATION_FLOOR = 24;

/** The production normaliser, transcribed (it is a closure, not an export). */
const normalize = (s) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : "");

/**
 * Gate output long enough to be citable — built CONSTRUCTIVELY, never by filtering.
 *
 * `fc.string().filter((s) => normalize(s).length >= 24)` is the obvious spelling and it is a
 * trap: fast-check's default string is short, so the predicate almost never holds and the
 * generator spins on rejection sampling instead of failing. Composing the shape guarantees it
 * instead — at least 8 words of at least 3 printable non-space characters, joined by real
 * whitespace runs, normalises to at least 8*3 + 7 = 31 characters. The whitespace runs are the
 * point: they are what makes the collapse half of the contract observable at all.
 */
const citableOutput = fc
  .array(fc.stringMatching(/^[!-~]{3,8}$/), { minLength: 8, maxLength: 24 })
  .chain((words) =>
    fc
      .array(fc.constantFrom(" ", "  ", "\t", "\n", " \n ", "\r\n", "   \t "), {
        minLength: words.length,
        maxLength: words.length,
      })
      .map((seps) => words.map((w, i) => (i === 0 ? w : seps[i] + w)).join(""))
  );

// ════════════════════════════════════════════════════════════════════════════
// parseA6RootCause -- total over a closed vocabulary (AC-6.4, PROP-CTR-01/02)
// ════════════════════════════════════════════════════════════════════════════

describe("PROP-CTR-02 (generative): parseA6RootCause is total over ADVISORY_ROOT_CAUSES", () => {
  test("TOTALITY: every string input maps into the closed vocabulary, never outside it", () => {
    fc.assert(
      fc.property(anyString, (raw) => {
        expect(ADVISORY_ROOT_CAUSES).toContain(parseA6RootCause(raw));
      })
    );
  });

  test("TOTALITY holds for non-string input too: every such value reads `unclassified`", () => {
    fc.assert(
      fc.property(nonString, (raw) => {
        expect(parseA6RootCause(raw)).toBe("unclassified");
      })
    );
  });

  test("ROUND-TRIP: a vocabulary member emitted as a trailer parses back to itself, whatever surrounds it", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ADVISORY_ROOT_CAUSES),
        fc.array(nonTrailerLine("ROOT-CAUSE:"), { maxLength: 6 }),
        fc.array(nonTrailerLine("ROOT-CAUSE:"), { maxLength: 6 }),
        // Indentation and trailing whitespace must not matter: the production
        // reader trims each line before testing the prefix, then trims the value.
        fc.stringMatching(/^[ \t]*$/),
        fc.stringMatching(/^[ \t]*$/),
        (cls, before, after, lead, trail) => {
          const raw = [...before, `${lead}ROOT-CAUSE:${trail} ${cls}${trail}`, ...after].join("\n");
          expect(parseA6RootCause(raw)).toBe(cls);
        }
      )
    );
  });

  test("IDEMPOTENCE: re-emitting the parse as a trailer and re-parsing is a fixed point", () => {
    // The law that makes the vocabulary genuinely closed: `unclassified` is itself
    // a member, so the second parse cannot drift off the first.
    fc.assert(
      fc.property(anyString, (raw) => {
        const once = parseA6RootCause(raw);
        expect(parseA6RootCause(`ROOT-CAUSE: ${once}`)).toBe(once);
      })
    );
  });

  test("LAST-WINS: when several trailers are present the final one decides", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...ADVISORY_ROOT_CAUSES), { minLength: 2, maxLength: 5 }),
        (classes) => {
          const raw = classes.map((c) => `ROOT-CAUSE: ${c}`).join("\n");
          expect(parseA6RootCause(raw)).toBe(classes[classes.length - 1]);
        }
      )
    );
  });

  test("CLOSEDNESS: a value outside the vocabulary is never inferred, it is `unclassified`", () => {
    fc.assert(
      fc.property(
        anyString.filter((s) => {
          const v = s.trim();
          return v !== "" && !ADVISORY_ROOT_CAUSES.includes(v) && !v.includes("\n");
        }),
        (bogus) => {
          expect(parseA6RootCause(`ROOT-CAUSE: ${bogus}`)).toBe("unclassified");
        }
      )
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// parseA6Promotion -- two INDEPENDENT trailers (E-6, AC-2.4, PROP-CTR-09)
// ════════════════════════════════════════════════════════════════════════════
//
// The contract the review's `:2407` arm sits on: `PROMOTES-TASK:` does not match the
// `PROMOTES:` prefix (it starts `PROMOTES-`, not `PROMOTES:`), so the two halves are
// read independently and NEITHER is inferred from the other. That disjointness is a
// property of the two literal strings, not of any example, which is what makes it
// worth a generative check.

describe("PROP-CTR-09 (generative): parseA6Promotion reads two independent trailers", () => {
  /** A trailer value that survives a round trip: no newline, non-blank after trim. */
  const trailerValue = anyString.filter((s) => !s.includes("\n") && s.trim() !== "");

  test("TOTALITY: the shape is always {symbol, taskId}, each a non-empty string or null", () => {
    fc.assert(
      fc.property(fc.oneof(anyString, nonString), (raw) => {
        const out = parseA6Promotion(raw);
        expect(Object.keys(out).sort()).toEqual(["symbol", "taskId"]);
        for (const v of [out.symbol, out.taskId]) {
          expect(v === null || (typeof v === "string" && v !== "")).toBe(true);
        }
      })
    );
  });

  test("TOTALITY: every non-string input yields the null pair", () => {
    fc.assert(
      fc.property(nonString, (raw) => {
        expect(parseA6Promotion(raw)).toEqual({ symbol: null, taskId: null });
      })
    );
  });

  test("ROUND-TRIP: both trailers emitted together parse back to their trimmed values", () => {
    fc.assert(
      fc.property(trailerValue, trailerValue, (symbol, taskId) => {
        const raw = `PROMOTES: ${symbol}\nPROMOTES-TASK: ${taskId}`;
        expect(parseA6Promotion(raw)).toEqual({
          symbol: symbol.trim(),
          taskId: taskId.trim(),
        });
      })
    );
  });

  test("INDEPENDENCE: `PROMOTES-TASK:` never satisfies the `PROMOTES:` prefix, so a lone task trailer leaves `symbol` null", () => {
    fc.assert(
      fc.property(trailerValue, (taskId) => {
        expect(parseA6Promotion(`PROMOTES-TASK: ${taskId}`)).toEqual({
          symbol: null,
          taskId: taskId.trim(),
        });
      })
    );
  });

  test("INDEPENDENCE, the other half: a lone `PROMOTES:` trailer leaves `taskId` null", () => {
    fc.assert(
      fc.property(trailerValue, (symbol) => {
        expect(parseA6Promotion(`PROMOTES: ${symbol}`)).toEqual({
          symbol: symbol.trim(),
          taskId: null,
        });
      })
    );
  });

  test("EMPTINESS: a trailer whose value is blank reads null, never the empty string", () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[ \t]*$/), fc.stringMatching(/^[ \t]*$/), (a, b) => {
        expect(parseA6Promotion(`PROMOTES:${a}\nPROMOTES-TASK:${b}`)).toEqual({
          symbol: null,
          taskId: null,
        });
      })
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// citesGateOutput -- the whitespace-collapse-then-substring contract at the floor
// ════════════════════════════════════════════════════════════════════════════
//
// The review named this one specifically: "no generative falsifier" for the
// 24-char floor. These are the laws.

describe("PROP-CTR-05 (generative): citesGateOutput — normalise, then substring, floored at 24", () => {
  const runs = { numRuns: 500 };

  test("SOUNDNESS: a true verdict implies some entry that clears the floor AND is a normalised substring", () => {
    fc.assert(
      fc.property(fc.array(anyString, { maxLength: 8 }), anyString, (evidence, gateOutput) => {
        if (!citesGateOutput(evidence, gateOutput)) return;
        const out = normalize(gateOutput);
        const witness = evidence.some((e) => {
          const n = normalize(e);
          return n.length >= A6_MIN_CITATION_CHARS && out.includes(n);
        });
        expect(witness).toBe(true);
      }),
      runs
    );
  });

  test("COMPLETENESS: any normalised slice of the output that clears the floor IS a citation", () => {
    fc.assert(
      fc.property(
        citableOutput,
        fc.nat(),
        fc.nat(),
        (gateOutput, startSeed, extraSeed) => {
          const out = normalize(gateOutput);
          const maxStart = out.length - A6_MIN_CITATION_CHARS;
          const start = maxStart === 0 ? 0 : startSeed % (maxStart + 1);
          const extra = extraSeed % (out.length - start - A6_MIN_CITATION_CHARS + 1);
          const slice = out.slice(start, start + A6_MIN_CITATION_CHARS + extra);
          // A slice of a normalised string can still end or begin on a space, which
          // `normalize` would trim back below the floor; that is the production rule,
          // not a defect, so the property is stated over the re-normalised slice.
          fc.pre(normalize(slice).length >= A6_MIN_CITATION_CHARS);
          expect(citesGateOutput([slice], gateOutput)).toBe(true);
        }
      ),
      runs
    );
  });

  test("FLOOR: an entry normalising below 24 chars never cites, even as a verbatim substring", () => {
    fc.assert(
      fc.property(
        citableOutput,
        fc.nat(),
        (gateOutput, lenSeed) => {
          const out = normalize(gateOutput);
          const len = lenSeed % A6_MIN_CITATION_CHARS; // 0 … 23 — strictly below the floor
          const short = out.slice(0, len);
          expect(normalize(short).length).toBeLessThan(A6_MIN_CITATION_CHARS);
          expect(citesGateOutput([short], gateOutput)).toBe(false);
        }
      ),
      runs
    );
  });

  test("FLOOR is exactly 24, not 23 or 25: the boundary pair straddles a TRANSCRIBED literal", () => {
    // Mutation-checked: an earlier spelling of this test read the boundary off
    // `A6_MIN_CITATION_CHARS` itself, so moving the production constant to 23 moved the test
    // with it and the whole suite stayed green — self-referential, and vacuous on exactly the
    // question the floor exists to answer. `TSPEC_CITATION_FLOOR` is transcribed from TSPEC
    // §3.3 and deliberately NOT imported, so it is a second, independent witness.
    expect(A6_MIN_CITATION_CHARS).toBe(TSPEC_CITATION_FLOOR);

    // The one place a hand-picked shape is the right instrument — a generator cannot
    // express "the same needle at length n and n+1" without constructing it.
    fc.assert(
      fc.property(fc.stringMatching(/^[a-zA-Z0-9]{40,60}$/), (dense) => {
        const below = dense.slice(0, TSPEC_CITATION_FLOOR - 1);
        const at = dense.slice(0, TSPEC_CITATION_FLOOR);
        expect(citesGateOutput([below], dense)).toBe(false);
        expect(citesGateOutput([at], dense)).toBe(true);
      })
    );
  });

  test("NORMALISATION INVARIANCE: re-spacing either side cannot change the verdict", () => {
    // Whitespace runs collapse to one space on BOTH sides before the substring test,
    // so an agent that reflows the gate output it quotes still cites it.
    const respace = (s, ws) => s.split(" ").join(ws);
    fc.assert(
      fc.property(
        fc.array(anyString, { maxLength: 5 }),
        anyString,
        fc.constantFrom("  ", "\t", "\n", " \n ", "\r\n", "   \t "),
        (evidence, gateOutput, ws) => {
          const base = citesGateOutput(evidence, gateOutput);
          const respacedEvidence = evidence.map((e) => respace(normalize(e), ws));
          const respacedOutput = respace(normalize(gateOutput), ws);
          expect(citesGateOutput(respacedEvidence, respacedOutput)).toBe(base);
        }
      ),
      runs
    );
  });

  test("MONOTONICITY: adding evidence never turns a citation back into a refusal", () => {
    fc.assert(
      fc.property(
        fc.array(anyString, { maxLength: 5 }),
        fc.array(anyString, { maxLength: 5 }),
        anyString,
        (a, b, gateOutput) => {
          if (citesGateOutput(a, gateOutput)) {
            expect(citesGateOutput([...a, ...b], gateOutput)).toBe(true);
            expect(citesGateOutput([...b, ...a], gateOutput)).toBe(true);
          }
        }
      ),
      runs
    );
  });

  test("EMPTY / NON-ARRAY evidence never cites, whatever the output", () => {
    fc.assert(
      fc.property(fc.oneof(fc.constant([]), nonString), anyString, (evidence, gateOutput) => {
        expect(citesGateOutput(evidence, gateOutput)).toBe(false);
      })
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// a6ProhibitedPaths -- AC-3.3 (f)/(g) by subtraction, derived not transcribed
// ════════════════════════════════════════════════════════════════════════════

describe("PROP-ENV-10 (generative): a6ProhibitedPaths derives the prohibition set for any feature", () => {
  // Feature names as the pipeline actually forms them (branch/dir segment shaped),
  // plus the degenerate ends of the space.
  const featureName = fc.oneof(
    fc.stringMatching(/^[a-z0-9]([a-z0-9-]{0,40}[a-z0-9])?$/),
    fc.constant(""),
    anyString.filter((s) => !s.includes("\n"))
  );

  test("SHAPE: the result is always exactly the feature's PLAN plus the advisory config path", () => {
    fc.assert(
      fc.property(featureName, (feature) => {
        expect(a6ProhibitedPaths(feature)).toEqual([
          `docs/${feature}/PLAN-${feature}.md`,
          ADVISORY_CONFIG_PATH,
        ]);
      })
    );
  });

  test("PURITY: the same feature yields an equal set every time, and the result is a fresh array", () => {
    fc.assert(
      fc.property(featureName, (feature) => {
        const a = a6ProhibitedPaths(feature);
        const b = a6ProhibitedPaths(feature);
        expect(a).toEqual(b);
        // Fresh, not a shared frozen literal: a caller mutating the returned array
        // must not be able to shrink a later caller's prohibition set.
        expect(a).not.toBe(b);
        a.push("mutated");
        expect(a6ProhibitedPaths(feature)).toEqual(b);
      })
    );
  });

  test("FEATURE-SENSITIVITY: distinct features never share a PLAN prohibition", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9-]{1,40}$/),
        fc.stringMatching(/^[a-z0-9-]{1,40}$/),
        (x, y) => {
          fc.pre(x !== y);
          expect(a6ProhibitedPaths(x)[0]).not.toBe(a6ProhibitedPaths(y)[0]);
        }
      )
    );
  });

  test("INVARIANT: the config path is prohibited for every feature, never feature-interpolated", () => {
    fc.assert(
      fc.property(featureName, (feature) => {
        expect(a6ProhibitedPaths(feature)).toContain(ADVISORY_CONFIG_PATH);
      })
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// nonNegativeInt -- E-33's `0` must SURVIVE, driven through parseAdvisoryConfig
// ════════════════════════════════════════════════════════════════════════════
//
// `nonNegativeInt` is a closure inside `parseAdvisoryConfig`, so it has no export to
// call directly. Driving it through its enclosing parser is not a workaround: it is
// the production path, and it is the only path. The property under test is the one
// E-33 turns on -- `0` is a CONFIGURED value, not an invalid one, which
// `positiveInt`'s `v >= 1` floor would have defaulted away.

describe("PROP-CFG-02 (generative): waveBudgetPerRun validates through nonNegativeInt (E-33)", () => {
  const configText = (waveBudgetPerRun) =>
    JSON.stringify({ advisory: { waveBudgetPerRun } });

  test("ACCEPTS every non-negative integer verbatim, and reports no invalid key", () => {
    fc.assert(
      fc.property(fc.nat({ max: 1_000_000 }), (n) => {
        const { config, invalidKeys, sectionMalformed } = parseAdvisoryConfig(configText(n));
        expect(config.waveBudgetPerRun).toBe(n);
        expect(invalidKeys).not.toContain("waveBudgetPerRun");
        expect(sectionMalformed).toBe(false);
      })
    );
  });

  test("ZERO SURVIVES: the E-33 boundary is accepted, not defaulted — and the default is not 0, so this is non-vacuous", () => {
    const { config, invalidKeys } = parseAdvisoryConfig(configText(0));
    expect(config.waveBudgetPerRun).toBe(0);
    expect(invalidKeys).not.toContain("waveBudgetPerRun");
    expect(ADVISORY_DEFAULTS.waveBudgetPerRun).not.toBe(0);
  });

  test("REJECTS every negative integer: defaulted AND reported invalid", () => {
    fc.assert(
      fc.property(fc.integer({ min: -1_000_000, max: -1 }), (n) => {
        const { config, invalidKeys } = parseAdvisoryConfig(configText(n));
        expect(config.waveBudgetPerRun).toBe(ADVISORY_DEFAULTS.waveBudgetPerRun);
        expect(invalidKeys).toContain("waveBudgetPerRun");
      })
    );
  });

  test("REJECTS every non-integer value: defaulted AND reported invalid", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ noInteger: true, noNaN: true }),
          fc.string(),
          fc.boolean(),
          fc.constant(null),
          fc.array(fc.nat(), { maxLength: 3 }),
          fc.record({ n: fc.nat() })
        ),
        (v) => {
          const { config, invalidKeys } = parseAdvisoryConfig(configText(v));
          expect(config.waveBudgetPerRun).toBe(ADVISORY_DEFAULTS.waveBudgetPerRun);
          expect(invalidKeys).toContain("waveBudgetPerRun");
        }
      )
    );
  });

  test("ABSENCE is not invalidity: an advisory section without the key defaults silently", () => {
    fc.assert(
      fc.property(fc.constantFrom("{}", '{"advisory":{}}', '{"advisory":{"enabled":true}}'), (text) => {
        const { config, invalidKeys } = parseAdvisoryConfig(text);
        expect(config.waveBudgetPerRun).toBe(ADVISORY_DEFAULTS.waveBudgetPerRun);
        expect(invalidKeys).not.toContain("waveBudgetPerRun");
      })
    );
  });
});
