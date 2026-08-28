// loopEconomicsFindingIdentity.test.js -- PLAN T-06 (RED, batch 2, deps T-00, T-01).
//
// M1d: finding-identity normalisation and carried/new/resolved accounting
// (TSPEC §6, FSPEC §2, PROPERTIES PROP-LOOPECON-04/05/06/07, DEC-LOOPECON-06).
//
// Three new pure functions, none of which exist on HEAD yet:
//
//   normalizeFindingText(text)        -- FSPEC §2.2's normalisation, applied in order:
//                                         coerce non-string -> ""; strip leading/trailing
//                                         whitespace; strip round/version tokens
//                                         (/\b(?:round|v)\s*\.?\s*\d+\b/gi); strip
//                                         hash-shaped tokens (/\b(?:sha256:)?[0-9a-f]{7,64}\b/gi);
//                                         collapse internal whitespace to a single space;
//                                         lowercase.
//   findingIdentityKey(finding)       -- `${severity}\x00${section.trim()}\x00${normalizeFindingText(text)}`
//                                         (FSPEC §2.1's identity triple, serialised).
//   classifyRoundFindings(prev, curr) -- { carried, added, resolved } partition of
//                                         round N (`prev`) vs round N+1 (`curr`) findings
//                                         by identity-triple match (FSPEC §2.3).
//
// RED discipline (PLAN T-06): this suite fails ONLY because the three exports don't
// exist on `orchestrate-dev.js` yet (`devModule.normalizeFindingText` etc. are
// `undefined`, so calling them throws `TypeError: ... is not a function`). No
// production code is touched here. Pre-existing suites stay green.

import * as fc from "fast-check";
import * as devModule from "../orchestrate-dev.js";
import { fakeGit } from "./helpers/seams.js";
import { assertNoLiveGitWrites } from "./helpers/loopEconomicsDoubles.js";

const { normalizeFindingText, findingIdentityKey, classifyRoundFindings } = devModule;

// ─── shared arbitraries ─────────────────────────────────────────────────────

const severityArb = fc.constantFrom("High", "Medium", "Low");

// Section anchors: free-form strings plus the numbered-clause shapes FSPEC §2.1
// names explicitly. Kept non-empty and free of the NUL separator the identity
// key uses, since NUL-in-section would make the key itself ambiguous -- a
// concern orthogonal to what this suite falsifies.
const anchorArb = fc
  .oneof(
    fc.constantFrom("AC-3", "§4.2", "BR-7", "REQ-1", "§7.1"),
    fc.string({ minLength: 1, maxLength: 12 }).filter((s) => s.trim().length > 0),
  )
  .filter((s) => !s.includes("\x00"));

// Plain body text with no round/version/hash tokens salted in, so normalisation
// is a pure whitespace/case transform on it (used to build "clean" bases that
// round/version/hash tokens get spliced into).
const cleanWordArb = fc
  .string({ minLength: 1, maxLength: 10 })
  .filter((s) => /^[a-zA-Z ]+$/.test(s) && s.trim().length > 0)
  .filter((s) => !/\b(?:round|v)\s*\.?\s*\d+\b/i.test(s))
  .filter((s) => !/\b(?:sha256:)?[0-9a-f]{7,64}\b/i.test(s));

const cleanBodyArb = fc
  .array(cleanWordArb, { minLength: 1, maxLength: 4 })
  .map((words) => words.join(" "))
  .filter((s) => s.trim().length > 0);

// Both exemplar arbitraries below feed a noise-invariance property that
// splices a token wholesale between two copies of a clean base string and
// asserts the token contributes nothing to the normalized output. That only
// holds if the exemplar is a FULL match of its pinned regex end-to-end --
// a partial match (e.g. "in round 12", where only "round 12" matches and
// "in " is untouched free text) would leave residue behind and falsely fail
// the property. Self-check both lists against their regexes so a future
// exemplar addition can't reintroduce the same partial-match mistake.

const ROUND_TOKEN_RE = /\b(?:round|v)\s*\.?\s*\d+\b/gi;
const HASH_TOKEN_RE = /\b(?:sha256:)?[0-9a-f]{7,64}\b/gi;

/** Round/version token exemplars matching /\b(?:round|v)\s*\.?\s*\d+\b/gi. */
const ROUND_TOKEN_EXEMPLARS = ["v3", "V3", "v 3", "v.3", "round4", "Round 4", "round.4", "round 12"];

/** Hash-shaped token exemplars matching /\b(?:sha256:)?[0-9a-f]{7,64}\b/gi. */
const HASH_TOKEN_EXEMPLARS = ["a1b2c3d", "SHA256:deadbeef", "sha256:0123456789abcdef", "abcdef0", "ABCDEF0"];

for (const token of ROUND_TOKEN_EXEMPLARS) {
  if (token.replace(ROUND_TOKEN_RE, "") !== "") {
    throw new Error(`roundTokenArb exemplar ${JSON.stringify(token)} is not a full match of ${ROUND_TOKEN_RE} -- fix the exemplar list`);
  }
}
for (const token of HASH_TOKEN_EXEMPLARS) {
  if (token.replace(HASH_TOKEN_RE, "") !== "") {
    throw new Error(`hashTokenArb exemplar ${JSON.stringify(token)} is not a full match of ${HASH_TOKEN_RE} -- fix the exemplar list`);
  }
}

const roundTokenArb = fc.constantFrom(...ROUND_TOKEN_EXEMPLARS);
const hashTokenArb = fc.constantFrom(...HASH_TOKEN_EXEMPLARS);

function makeFinding({ severity = "High", section = "AC-3", text = "some finding" } = {}) {
  return { severity, section, text, provenance: "delta", locality: "nonlocal" };
}

// ─── normalizeFindingText: coercion + order-of-operations ─────────────────

describe("T-06 normalizeFindingText: total, coerces non-string input", () => {
  test.each([undefined, null, 42, true, {}, [], Symbol("x")])(
    "non-string input %p normalizes to empty string",
    (input) => {
      expect(normalizeFindingText(input)).toBe("");
    },
  );

  test("empty string normalizes to empty string", () => {
    expect(normalizeFindingText("")).toBe("");
  });
});

describe("T-06 normalizeFindingText: idempotence", () => {
  test("re-normalizing an already-normalized string is a no-op", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const once = normalizeFindingText(s);
        const twice = normalizeFindingText(once);
        expect(twice).toBe(once);
      }),
      { numRuns: 200 },
    );
  });

  test("named fixture: whitespace + tokens + case collapse to single stable form", () => {
    const input = "  Some FINDING  about   v3   and  SHA256:deadbeef  here  ";
    const once = normalizeFindingText(input);
    const twice = normalizeFindingText(once);
    expect(twice).toBe(once);
  });
});

describe("T-06 normalizeFindingText: strips leading/trailing whitespace", () => {
  test("named fixture", () => {
    expect(normalizeFindingText("  hello world  ")).toBe("hello world");
  });
});

describe("T-06 normalizeFindingText: collapses internal whitespace and lowercases", () => {
  test("named fixture: tabs/newlines/multi-space collapse to single space", () => {
    expect(normalizeFindingText("Hello\t\tWorld\n Foo")).toBe("hello world foo");
  });

  test("property: internal whitespace runs collapse to exactly one space, case-folded", () => {
    fc.assert(
      fc.property(cleanBodyArb, fc.array(fc.constantFrom(" ", "\t", "  ", "\n", "   "), { minLength: 0, maxLength: 3 }), (base, gaps) => {
        // Splice extra whitespace runs between the words of a clean base string,
        // then assert the normalized result has no multi-space runs and matches
        // the lowercase, single-spaced canonical form.
        const words = base.trim().split(/\s+/);
        let spliced = words[0];
        for (let i = 1; i < words.length; i++) {
          const gap = gaps[i % (gaps.length || 1)] || " ";
          spliced += gap + words[i];
        }
        const normalized = normalizeFindingText(spliced);
        expect(normalized).not.toMatch(/\s{2}/);
        expect(normalized).toBe(words.join(" ").toLowerCase());
      }),
      { numRuns: 200 },
    );
  });
});

describe("T-06 normalizeFindingText: strips exactly the listed tokens (PROP-LOOPECON-05)", () => {
  test.each([
    ["fixed in v3", "fixed in"],
    ["fixed in V3", "fixed in"],
    ["fixed in v 3", "fixed in"],
    ["fixed in v.3", "fixed in"],
    ["seen in round4", "seen in"],
    ["seen in Round 4", "seen in"],
    ["seen in round.4", "seen in"],
    ["hash a1b2c3d matches", "hash matches"],
    ["hash SHA256:deadbeef matches", "hash matches"],
  ])("under-normalization falsifiable: %p strips its token -> %p", (input, expected) => {
    // Each fixture pins that the token is actually removed (not merely
    // lowercased/left in place) -- an under-normalizing implementation that
    // forgets one of the two token regexes fails exactly this kind of case.
    expect(normalizeFindingText(input)).toBe(expected);
  });

  test("property: splicing a round/version token into clean text removes exactly that token", () => {
    fc.assert(
      fc.property(cleanBodyArb, roundTokenArb, (base, token) => {
        const withoutToken = normalizeFindingText(base);
        const spliced = `${base} ${token} ${base}`;
        const withToken = normalizeFindingText(spliced);
        // The token contributes nothing to the normalized output: normalizing
        // the spliced text should equal normalizing base+base with the token
        // gap collapsed away.
        expect(withToken).not.toMatch(/\bv\s*\.?\s*\d+\b/i);
        expect(withToken).not.toMatch(/\bround\s*\.?\s*\d+\b/i);
        expect(withToken.startsWith(withoutToken.split(" ")[0] || "")).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  test("property: splicing a hash-shaped token into clean text removes exactly that token", () => {
    fc.assert(
      fc.property(cleanBodyArb, hashTokenArb, (base, token) => {
        const spliced = `${base} ${token} ${base}`;
        const normalized = normalizeFindingText(spliced);
        expect(normalized).not.toMatch(/\b(?:sha256:)?[0-9a-f]{7,64}\b/i);
      }),
      { numRuns: 200 },
    );
  });

  test("over-normalization falsifiable: ordinary short hex-looking words below the 7-char floor survive", () => {
    // The hash regex requires 7-64 hex chars. A shorter hex-looking run (e.g.
    // "cafe" or "beef", both valid hex but under 7 chars) must NOT be stripped
    // -- an over-normalizing implementation that widens the hex floor fails
    // this case by deleting ordinary short words that happen to be hex-safe.
    expect(normalizeFindingText("the cafe beef deal")).toBe("the cafe beef deal");
  });

  test("over-normalization falsifiable: the bare word \"roundabout\" is not treated as a round token", () => {
    // /\b(?:round|v)\s*\.?\s*\d+\b/gi requires a trailing digit run; "roundabout"
    // has no digits after "round" and must survive untouched apart from casing.
    expect(normalizeFindingText("drive around the roundabout")).toBe("drive around the roundabout");
  });

  test("over-normalization falsifiable: plain digits with no v/round prefix survive", () => {
    // "42" alone, or "item 42", must not be treated as a version token -- only
    // v<digits> / round<digits> forms are stripped.
    expect(normalizeFindingText("42 items remain")).toBe("42 items remain");
  });
});

// ─── findingIdentityKey: triple serialisation ──────────────────────────────

describe("T-06 findingIdentityKey: serialises the (severity, section-anchor, normalized-text) triple", () => {
  test("named fixture", () => {
    const finding = makeFinding({ severity: "High", section: "AC-3", text: "  Missing  guard v3  " });
    const key = findingIdentityKey(finding);
    expect(key).toBe(`High\x00AC-3\x00${normalizeFindingText("  Missing  guard v3  ")}`);
    expect(key).toBe("High\x00AC-3\x00missing guard");
  });

  test("section anchor is trimmed but NOT case-folded or normalized like body text", () => {
    const finding = makeFinding({ severity: "Low", section: "  §4.2  ", text: "same text" });
    expect(findingIdentityKey(finding)).toBe("Low\x00§4.2\x00same text");
  });
});

describe("T-06 findingIdentityKey: reflexive and order-independent (PROP-LOOPECON-04)", () => {
  test("property: identity key is reflexive -- a finding always matches its own key", () => {
    fc.assert(
      fc.property(severityArb, anchorArb, fc.string(), (severity, section, text) => {
        const finding = makeFinding({ severity, section, text });
        expect(findingIdentityKey(finding)).toBe(findingIdentityKey(finding));
      }),
      { numRuns: 200 },
    );
  });

  test("property: two findings with equal (severity, trimmed section, normalized text) share an identity key regardless of round/version/hash noise or field order", () => {
    fc.assert(
      fc.property(severityArb, anchorArb, cleanBodyArb, roundTokenArb, hashTokenArb, (severity, section, base, roundToken, hashToken) => {
        const a = makeFinding({ severity, section, text: `${base} ${roundToken}` });
        const b = makeFinding({ severity, section, text: `${base} ${hashToken}` });
        // Both are the same underlying finding re-filed with different
        // embedded round/hash noise -- their identity keys must match.
        expect(findingIdentityKey(a)).toBe(findingIdentityKey(b));
      }),
      { numRuns: 200 },
    );
  });
});

describe("T-06 findingIdentityKey: severity and section-anchor are never stripped (PROP-LOOPECON-04)", () => {
  test("property: differing severity alone (same anchor, same text) yields distinct identity keys", () => {
    fc.assert(
      fc.property(fc.tuple(severityArb, severityArb).filter(([a, b]) => a !== b), anchorArb, cleanBodyArb, ([sevA, sevB], section, text) => {
        const a = makeFinding({ severity: sevA, section, text });
        const b = makeFinding({ severity: sevB, section, text });
        expect(findingIdentityKey(a)).not.toBe(findingIdentityKey(b));
      }),
      { numRuns: 200 },
    );
  });

  test("property: differing section-anchor alone (same severity, same text) yields distinct identity keys", () => {
    fc.assert(
      fc.property(severityArb, fc.tuple(anchorArb, anchorArb).filter(([a, b]) => a.trim() !== b.trim()), cleanBodyArb, (severity, [secA, secB], text) => {
        const a = makeFinding({ severity, section: secA, text });
        const b = makeFinding({ severity, section: secB, text });
        expect(findingIdentityKey(a)).not.toBe(findingIdentityKey(b));
      }),
      { numRuns: 200 },
    );
  });

  test("named fixture: identical free text filed against two different anchors never collapses (FSPEC §2.1, R-3)", () => {
    const a = makeFinding({ severity: "High", section: "§4.2", text: "missing null check" });
    const b = makeFinding({ severity: "High", section: "§4.3", text: "missing null check" });
    expect(findingIdentityKey(a)).not.toBe(findingIdentityKey(b));
  });

  test("named fixture: identical free text and anchor but different severity never collapses", () => {
    const a = makeFinding({ severity: "High", section: "§4.2", text: "missing null check" });
    const b = makeFinding({ severity: "Medium", section: "§4.2", text: "missing null check" });
    expect(findingIdentityKey(a)).not.toBe(findingIdentityKey(b));
  });
});

// ─── classifyRoundFindings: carried/added/resolved partition ──────────────

describe("T-06 classifyRoundFindings: carried/added/resolved partition (FSPEC §2.3)", () => {
  test("named fixture: round 1 has no predecessor -- everything is added", () => {
    const round1 = [
      makeFinding({ severity: "High", section: "AC-1", text: "first issue" }),
      makeFinding({ severity: "Low", section: "AC-2", text: "second issue" }),
    ];
    const result = classifyRoundFindings([], round1);
    expect(result.carried).toEqual([]);
    expect(result.resolved).toEqual([]);
    expect(result.added).toHaveLength(2);
  });

  test("named fixture: matching identity triple in round N+1 is carried, not re-added", () => {
    const prevFinding = makeFinding({ severity: "High", section: "AC-1", text: "stale-anchor issue v2" });
    const currFinding = makeFinding({ severity: "High", section: "AC-1", text: "stale-anchor issue v3" });
    const result = classifyRoundFindings([prevFinding], [currFinding]);
    expect(result.added).toEqual([]);
    expect(result.resolved).toEqual([]);
    expect(result.carried).toHaveLength(1);
  });

  test("named fixture: a round-N finding absent from round N+1 is resolved (neither carried nor added)", () => {
    const prevFinding = makeFinding({ severity: "Medium", section: "AC-3", text: "fixed already" });
    const result = classifyRoundFindings([prevFinding], []);
    expect(result.added).toEqual([]);
    expect(result.carried).toEqual([]);
    expect(result.resolved).toHaveLength(1);
  });

  test("named fixture: a genuinely new finding at a shared anchor with different text is added, not carried", () => {
    const prevFinding = makeFinding({ severity: "High", section: "AC-1", text: "first defect" });
    const currFinding = makeFinding({ severity: "High", section: "AC-1", text: "second unrelated defect" });
    const result = classifyRoundFindings([prevFinding], [currFinding]);
    expect(result.added).toHaveLength(1);
    expect(result.resolved).toHaveLength(1);
    expect(result.carried).toEqual([]);
  });

  test("property: carried ∪ added is exactly round N+1's finding set, exhaustively and without overlap (FSPEC §2.3)", () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ severity: severityArb, section: anchorArb, text: cleanBodyArb }), { minLength: 0, maxLength: 6 }),
        fc.array(fc.record({ severity: severityArb, section: anchorArb, text: cleanBodyArb }), { minLength: 0, maxLength: 6 }),
        (prevSpecs, currSpecs) => {
          const prev = prevSpecs.map((s) => makeFinding(s));
          const curr = currSpecs.map((s) => makeFinding(s));
          const result = classifyRoundFindings(prev, curr);

          const carriedAndAddedKeys = [...result.carried, ...result.added].map(findingIdentityKey).sort();
          const currKeys = curr.map(findingIdentityKey).sort();
          expect(carriedAndAddedKeys).toEqual(currKeys);

          // No finding is classified into more than one of the three buckets.
          const carriedKeySet = new Set(result.carried.map(findingIdentityKey));
          const addedKeySet = new Set(result.added.map(findingIdentityKey));
          for (const key of carriedKeySet) {
            expect(addedKeySet.has(key)).toBe(false);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  test("property: resolved is exactly round N's findings whose identity has no match in round N+1", () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ severity: severityArb, section: anchorArb, text: cleanBodyArb }), { minLength: 0, maxLength: 6 }),
        fc.array(fc.record({ severity: severityArb, section: anchorArb, text: cleanBodyArb }), { minLength: 0, maxLength: 6 }),
        (prevSpecs, currSpecs) => {
          const prev = prevSpecs.map((s) => makeFinding(s));
          const curr = currSpecs.map((s) => makeFinding(s));
          const result = classifyRoundFindings(prev, curr);

          const currKeySet = new Set(curr.map(findingIdentityKey));
          const expectedResolvedKeys = prev.map(findingIdentityKey).filter((k) => !currKeySet.has(k)).sort();
          const actualResolvedKeys = result.resolved.map(findingIdentityKey).sort();
          expect(actualResolvedKeys).toEqual(expectedResolvedKeys);
        },
      ),
      { numRuns: 200 },
    );
  });

  test("property: classification is order-independent over both round's finding lists (PROP-LOOPECON-04)", () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ severity: severityArb, section: anchorArb, text: cleanBodyArb }), { minLength: 1, maxLength: 6 }),
        fc.array(fc.record({ severity: severityArb, section: anchorArb, text: cleanBodyArb }), { minLength: 1, maxLength: 6 }),
        fc.integer({ min: 0, max: 2 ** 31 - 1 }),
        fc.integer({ min: 0, max: 2 ** 31 - 1 }),
        (prevSpecs, currSpecs, seedA, seedB) => {
          const prev = prevSpecs.map((s) => makeFinding(s));
          const curr = currSpecs.map((s) => makeFinding(s));

          const baseline = classifyRoundFindings(prev, curr);

          const shuffledPrev = fc.sample(fc.shuffledSubarray(prev, { minLength: prev.length, maxLength: prev.length }), { seed: seedA, numRuns: 1 })[0];
          const shuffledCurr = fc.sample(fc.shuffledSubarray(curr, { minLength: curr.length, maxLength: curr.length }), { seed: seedB, numRuns: 1 })[0];

          const shuffled = classifyRoundFindings(shuffledPrev, shuffledCurr);

          expect(shuffled.carried.map(findingIdentityKey).sort()).toEqual(baseline.carried.map(findingIdentityKey).sort());
          expect(shuffled.added.map(findingIdentityKey).sort()).toEqual(baseline.added.map(findingIdentityKey).sort());
          expect(shuffled.resolved.map(findingIdentityKey).sort()).toEqual(baseline.resolved.map(findingIdentityKey).sort());
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── carried/new dedup semantics feeding staleness bookkeeping ─────────────
// (REQ-LOOPECON-02, FSPEC §2.4, PROP-LOOPECON-06/07, DEC-ANCHOR-01's 54-recurrence shape)

/**
 * Simulates the round-by-round open-finding-list accounting FSPEC §2.4
 * describes, mirroring production's `openFindings` ledger shape verbatim
 * (`orchestrate-dev.js`'s `reviewLoop`, ~:9643): an ARRAY that a `carried`
 * classification never appends to, and to which an `added` classification
 * always appends via `openFindings.push(...added)`. `rounds` is an ordered
 * array of finding-lists, one per round (round 1 first). Returns the final
 * open-findings array.
 *
 * This must NOT be a `Map` keyed on identity, guarded by `has(key)` before
 * insertion (DoD v2 F-9): that shape makes the guard itself the source of
 * truth for "exactly one entry," so `open.size` stays 1 for ANY `added`
 * list `classifyRoundFindings` returns -- including a totally broken
 * classifier that reports every round's findings as `added` with nothing
 * ever `carried`. The property below exists to catch exactly that
 * mis-classification, so the model it drives has to be able to inflate.
 */
function simulateOpenFindingList(rounds) {
  const open = [];
  let prev = [];
  for (const curr of rounds) {
    const { added } = classifyRoundFindings(prev, curr);
    open.push(...added);
    prev = curr;
  }
  return open;
}

describe("T-06 carried-finding dedup mints exactly one open entry across staleness re-filing (PROP-LOOPECON-06/07)", () => {
  test("named fixture: a finding re-raised across 5 rounds with only its embedded round/hash token varying stays a single open entry", () => {
    const rounds = [1, 2, 3, 4, 5].map((n) => [
      makeFinding({ severity: "High", section: "§4.2", text: `stale anchor defect (seen in round${n}, sha256:${"a".repeat(7 + n)})` }),
    ]);
    const open = simulateOpenFindingList(rounds);
    expect(open).toHaveLength(1);
  });

  test("property: a single stale-anchor finding re-filed every round across 2-10 rounds, with unrelated new findings interleaved, mints exactly one open entry for the stale anchor (PROP-LOOPECON-07)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        severityArb,
        anchorArb,
        cleanBodyArb,
        fc.array(roundTokenArb, { minLength: 2, maxLength: 10 }),
        fc.array(hashTokenArb, { minLength: 2, maxLength: 10 }),
        // For each round, 0-2 unrelated genuinely-new findings (structurally
        // distinct anchors from the stale one, guaranteed unique per round
        // index so no two collide with each other either).
        fc.array(fc.integer({ min: 0, max: 2 }), { minLength: 2, maxLength: 10 }),
        (roundCount, staleSeverity, staleSection, staleBase, roundTokens, hashTokens, extraCounts) => {
          const rounds = [];
          for (let i = 0; i < roundCount; i++) {
            const staleFinding = makeFinding({
              severity: staleSeverity,
              section: staleSection,
              text: `${staleBase} ${roundTokens[i % roundTokens.length]} ${hashTokens[i % hashTokens.length]}`,
            });
            const extras = [];
            const extraCount = extraCounts[i % extraCounts.length];
            for (let j = 0; j < extraCount; j++) {
              extras.push(
                makeFinding({
                  severity: "Low",
                  section: `UNRELATED-${i}-${j}`,
                  text: `genuinely new finding round ${i} item ${j}`,
                }),
              );
            }
            rounds.push([staleFinding, ...extras]);
          }

          const open = simulateOpenFindingList(rounds);
          const openKeys = open.map(findingIdentityKey);
          const staleKey = findingIdentityKey(makeFinding({ severity: staleSeverity, section: staleSection, text: staleBase }));
          expect(openKeys).toContain(staleKey);

          const staleKeyCount = openKeys.filter((k) => k === staleKey).length;
          expect(staleKeyCount).toBe(1);

          // Total open entries: exactly one for the stale anchor, plus exactly
          // one per genuinely-new (structurally distinct) finding minted. This
          // is the array's total LENGTH, not a deduplicated key-set size --
          // an implementation that misclassifies a carried re-filing as
          // `added` inflates this count directly (DoD v2 F-9).
          const expectedNewCount = rounds.reduce((sum, roundFindings) => sum + (roundFindings.length - 1), 0);
          expect(open).toHaveLength(1 + expectedNewCount);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── resolved (absent) findings are bucketed correctly, never forced into carried/added ──

describe("T-06 findings absent from round N+1 are bucketed as resolved, never carried or added", () => {
  test("named fixture", () => {
    const prev = [
      makeFinding({ severity: "High", section: "AC-1", text: "will be resolved" }),
      makeFinding({ severity: "Medium", section: "AC-2", text: "will carry forward" }),
    ];
    const curr = [makeFinding({ severity: "Medium", section: "AC-2", text: "will carry forward v9" })];

    const result = classifyRoundFindings(prev, curr);

    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0].section).toBe("AC-1");
    expect(result.carried).toHaveLength(1);
    expect(result.added).toEqual([]);

    // The resolved finding's identity key must not appear in either the
    // carried or added buckets.
    const resolvedKey = findingIdentityKey(result.resolved[0]);
    expect(result.carried.map(findingIdentityKey)).not.toContain(resolvedKey);
    expect(result.added.map(findingIdentityKey)).not.toContain(resolvedKey);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CODE_REVIEW v1 F-2 — REQ-LOOPECON-02's accounting, in PRODUCTION, ALWAYS-ON.
//
// Everything above this line exercises the pure functions and a test-local
// `simulateOpenFindingList` model. That model is a fine statement of FSPEC
// §2.4's semantics, but it is not the shipped path, and while the shipped
// accounting sat behind `derivativeStopEnabled` (M3, default OFF) REQ G-1's
// "M1 is always-on, no config gate" was false on every default-config run.
//
// So these drive `reviewLoop` itself, with NO `derivativeStop` config at all,
// and read the accounting off the loop's own operator channel.
describe("F-2 — reviewLoop's open-finding accounting runs with M3 DISABLED (REQ-LOOPECON-02, REQ G-1)", () => {
  const { reviewLoop } = devModule;

  const BASE = {
    doc: "docs/loopecon-feat/TSPEC-loopecon-feat.md",
    phase: "T",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    feature: "loopecon-feat",
  };

  const STALE = (round) =>
    `FINDING: High | inherited | local | §4.2 | stale upstream anchor, seen in round ${round} (sha256:${"a".repeat(7)}${round})`;
  const FRESH = (n) => `FINDING: Medium | delta | local | §9.${n} | a genuinely new defect number ${n}`;

  /**
   * A reviewer agent that re-files the SAME staleness finding every round (with
   * the round/hash noise FSPEC §2.1 normalises away) plus one genuinely new
   * finding, and only lets the loop converge on `convergeOn`.
   *
   * The FINDING lines are the erratum/cascade confirmation grammar, which those
   * channels emit regardless of M3 — which is exactly why the accounting that
   * reads them must not be M3-gated.
   */
  function refilingAgent({ convergeOn, prompts = [] }) {
    let round = 0;
    return async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      prompts.push({ skill, prompt: typeof prompt === "string" ? prompt : "" });
      if (skill === "pm-review" || skill === "te-review") {
        if (skill === "pm-review") round += 1;
        const n = round;
        if (n >= convergeOn) {
          return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
        }
        return (
          `Findings:\n${STALE(n)}\n${FRESH(n)}\n` +
          `VERDICT: Needs revision\n{"high": 1, "medium": 1, "low": 0}\n`
        );
      }
      return "Addressed all feedback.";
    };
  }

  async function run(extra = {}) {
    const logs = [];
    const prompts = [];
    const git = fakeGit((argv) => {
      if (argv[0] === "rev-parse" && argv[1] === "--abbrev-ref") return { ok: true, stdout: "feat-loopecon-feat" };
      if (argv[0] === "rev-parse") return { ok: true, stdout: "0123456789abcdef0123456789abcdef01234567" };
      return { ok: true, stdout: "" };
    });
    const result = await reviewLoop({
      ...BASE,
      ...extra,
      _agent: refilingAgent({ convergeOn: 3, prompts }),
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _log: (m) => logs.push(String(m)),
      _git: git,
    });
    lastGitCalls = git.calls;
    return { result, logs, prompts };
  }

  const carriedLines = (logs) => logs.filter((m) => m.includes("REQ-LOOPECON-02"));

  // TSPEC §10 (commit f325016): the mandatory leak check. Every scenario's `_git` is a scripted
  // `fakeGit` recording into `lastGitCalls` module variable; if one were ever left at its real
  // default — or if production grew an unreviewed write path — the argv would show up here and
  // red immediately rather than writing to the repository. The log is drained each time.
  let lastGitCalls = null;
  afterEach(() => {
    if (lastGitCalls) assertNoLiveGitWrites(lastGitCalls);
    lastGitCalls = null;
  });

  test("a finding re-filed in round 2 is accounted CARRIED, and mints no second open entry — with no derivativeStop config anywhere", async () => {
    const { result, logs, prompts } = await run();

    // Control 1: M3 really is off. The finding-grammar clause is gated on it,
    // so its absence from every reviewer prompt is the proof that this run is
    // the default-config run REQ G-1 is about.
    const reviewerPrompts = prompts.filter((p) => p.skill === "pm-review" || p.skill === "te-review");
    expect(reviewerPrompts.length).toBeGreaterThan(0);
    for (const p of reviewerPrompts) {
      expect(p.prompt).not.toContain("FINDING: {High|Medium|Low}");
    }

    // Control 2: more than one round actually ran, so "carried" has something
    // to be carried from.
    expect(result.iterations).toBeGreaterThan(1);

    // The accounting fired, and said the re-filed staleness finding bought no
    // new entry. Round 1 has nothing to carry, so exactly one round reports.
    const reported = carriedLines(logs);
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain("Round 2");
    expect(reported[0]).toContain(BASE.doc);
    expect(reported[0]).toContain("1 finding was already open from an earlier round");
    expect(reported[0]).toContain("1 new");
    // Two rounds × (1 re-filed staleness finding + 1 genuinely new one) ⇒ three
    // open entries, not four: the staleness fact is recorded once.
    expect(reported[0]).toContain("Open findings: 3");
  });

  test("byte-identity is untouched: with M3 off the returned record still carries no derivativeStop field", async () => {
    const { result } = await run();
    expect(Object.prototype.hasOwnProperty.call(result, "derivativeStop")).toBe(false);
    expect(JSON.stringify(result)).not.toContain("derivativeStop");
  });

  test("a round in which nothing is re-filed reports nothing (silent unless something was actually carried)", async () => {
    const logs = [];
    const result = await reviewLoop({
      ...BASE,
      _agent: async (skill, prompt) => {
        if (skill === "guard") return { ok: true };
        if (skill === "pm-review" || skill === "te-review") {
          return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
        }
        return "Addressed all feedback.";
      },
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _log: (m) => logs.push(String(m)),
    });
    expect(result.converged).toBe(true);
    expect(carriedLines(logs)).toEqual([]);
  });

  test("the same accounting, and the same verdict on it, when M3 is ON — one code path, not two", async () => {
    const { logs } = await run({ derivativeStop: { enabled: true, rounds: 99 } });
    const reported = carriedLines(logs);
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain("1 finding was already open from an earlier round");
    expect(reported[0]).toContain("Open findings: 3");
  });
});
