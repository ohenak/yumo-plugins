// loopProperties.test.js — PLAN P9-01 (TSPEC *Property-based strategies*, PROPERTIES §Properties).
//
// Six `fast-check` laws, following the two shipped precedents `advisoryHelperProperties.test.js`
// and `consolidationProperties.test.js`. These supplement the example-based ATs; neither subsumes
// the other (PROPERTIES "Property-based coverage").
//
//   1. codec round-trip + totality           (PROP-ITER-14; `decodeLoopState`/`encodeLoopState`)
//   2. `readLoopConfig` completeness         (PROP-CFG-01, PROP-CFG-05)
//   3. `blockedFeatureCounts` bounded/self-excluding/permutation-invariant (PROP-VIEW-05)
//   4. `redactEntryText` per-family property (PROP-ESC-11, PROP-ESC-12) — exercises P3-02's
//      `orchestrate-dev.js` export; blocks titled "P3-02: ..." per this task's dispatch.
//   5. `entryId` canonicalisation round trip (this task's own generative obligation)
//   6. notice-collection set laws            (PROP-BND-10-adjacent; `collectNotices`)
//
// `pdlc/workflows/lib/escalation-view.mjs` exports `redactEntryText`? No — that export belongs to
// `orchestrate-dev.js` per TSPEC *Data Model* ("`redactEntryText` *(new export)*" row) and is
// P3-02's deliverable; law 4's blocks load it via dynamic `await import` inside each test body.

import { readFileSync } from "node:fs";

import fc from "fast-check";
import {
  LOOP_DEFAULTS,
  LOOP_NOTICE_CODES,
  readLoopConfig,
  decodeLoopState,
  encodeLoopState,
  collectNotices,
} from "../lib/loop-session.mjs";
import { blockedFeatureCounts, entryId, canonicalBlockText } from "../lib/escalation-view.mjs";

const CONFIG_KEYS = ["backoffSchedule", "dirtyTreePolicy", "idleStopAfter", "preflight"].sort();

// ════════════════════════════════════════════════════════════════════════════
// Law 1 — codec round-trip + totality (PROP-ITER-14)
// ════════════════════════════════════════════════════════════════════════════
//
// `arbitrarySessionState`: `consecutiveIdle`/`schedulePos`/`iteration` bounded small
// non-negative integers (TSPEC F-4) — no float arithmetic, no `isFinite` guard needed.
// Free-text members are bounded to <=200 chars so round-trip is not confounded by
// `encodeLoopState`'s documented 200-char truncation (Data Model §3, Q-04).
const arbitrarySessionState = fc.record({
  v: fc.constant(1),
  preflightRan: fc.boolean(),
  consecutiveIdle: fc.nat({ max: 50 }),
  schedulePos: fc.nat({ max: 50 }),
  iteration: fc.nat({ max: 1000 }),
  merged: fc.array(
    fc.record({ feature: fc.stringMatching(/^[a-z0-9-]{1,20}$/), prUrl: fc.webUrl() }),
    { maxLength: 5 },
  ),
  halted: fc.array(
    fc.record({
      feature: fc.stringMatching(/^[a-z0-9-]{1,20}$/),
      reason: fc.string({ maxLength: 200 }),
    }),
    { maxLength: 5 },
  ),
  escalationsRaised: fc.array(
    fc.record({
      feature: fc.stringMatching(/^[a-z0-9-]{1,20}$/),
      sourceLabel: fc.string({ maxLength: 200 }),
    }),
    { maxLength: 5 },
  ),
});

// ════════════════════════════════════════════════════════════════════════════
// Law 2 — readLoopConfig completeness (PROP-CFG-01, PROP-CFG-05)
// ════════════════════════════════════════════════════════════════════════════

/** In-domain values per key, transcribed from LOOP_DEFAULTS' own shape (FSPEC BR-01/BR-02). */
const inDomainValue = {
  backoffSchedule: fc.array(fc.nat({ max: 500 }), { maxLength: 6 }),
  idleStopAfter: fc.nat({ max: 50 }),
  preflight: fc.constantFrom("strict", "off"),
  dirtyTreePolicy: fc.constantFrom("tracked", "any"),
};

/** Any value NOT accepted for the given key — deliberately not the key's own domain. */
const outOfDomainValue = fc.oneof(
  fc.string(),
  fc.integer({ min: -100, max: -1 }),
  fc.boolean(),
  fc.constant(null),
  fc.array(fc.string(), { maxLength: 3 }),
  fc.record({ x: fc.nat() }),
);

/** `arbitraryLoopConfigJson` (TSPEC F-4): arbitrary JSON, unbounded shape at the top, `loop`'s
 * four keys individually present-or-absent and, when present, in-domain-or-not. */
const arbitraryLoopSection = fc.record(
  {
    backoffSchedule: fc.oneof(inDomainValue.backoffSchedule, outOfDomainValue),
    idleStopAfter: fc.oneof(inDomainValue.idleStopAfter, outOfDomainValue),
    preflight: fc.oneof(inDomainValue.preflight, outOfDomainValue),
    dirtyTreePolicy: fc.oneof(inDomainValue.dirtyTreePolicy, outOfDomainValue),
  },
  { requiredKeys: [] },
);

const arbitraryLoopConfigJson = fc.oneof(
  fc.record({ loop: arbitraryLoopSection }, { requiredKeys: [] }).map((o) => JSON.stringify(o)),
  fc.jsonValue().map((v) => JSON.stringify(v)),
  fc.string(),
);

describe("PROP-CFG-01/PROP-CFG-05 (generative): readLoopConfig — completeness + totality", () => {
  test("COMPLETENESS: for every input, the four keys are present, each in-domain or exactly LOOP_DEFAULTS, and every invalidKeys entry names a substituted key", () => {
    fc.assert(
      fc.property(arbitraryLoopConfigJson, (text) => {
        let result;
        expect(() => {
          result = readLoopConfig(text);
        }).not.toThrow();

        expect(Object.keys(result.config).sort()).toEqual(CONFIG_KEYS);

        for (const key of CONFIG_KEYS) {
          const value = result.config[key];
          const isDefault = JSON.stringify(value) === JSON.stringify(LOOP_DEFAULTS[key]);
          if (!isDefault) {
            // Not the default: must be in-domain for its key.
            expect(result.invalidKeys).not.toContain(key);
          }
        }

        for (const key of result.invalidKeys) {
          expect(CONFIG_KEYS).toContain(key);
          expect(result.config[key]).toEqual(LOOP_DEFAULTS[key]);
        }

        expect(["absent-file", "absent-section", "malformed-section", "explicit-default"]).toContain(
          result.case,
        );
      }),
    );
  });

  test("TOTALITY: readLoopConfig never throws on any string input, always returning a complete LoopConfigResult", () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        let result;
        expect(() => {
          result = readLoopConfig(text);
        }).not.toThrow();
        expect(Object.keys(result.config).sort()).toEqual(CONFIG_KEYS);
        expect(["absent-file", "absent-section", "malformed-section", "explicit-default"]).toContain(
          result.case,
        );
        expect(Array.isArray(result.invalidKeys)).toBe(true);
      }),
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Law 3 — blockedFeatureCounts: bounded, self-excluding, permutation-invariant (PROP-VIEW-05)
// ════════════════════════════════════════════════════════════════════════════
//
// The reference below is an INDEPENDENT recursive-DFS reachability computation, deliberately not
// a copy of the production BFS — it exists so permutation-invariance and self-exclusion are
// checked against a differently-shaped traversal rather than the same algorithm compared with
// itself (PROPERTIES "no constant-compared-with-itself" discipline, applied here to code shape
// rather than a literal).
function referenceCounts(queueEntries) {
  const byFeature = new Map(queueEntries.map((r) => [r.feature, r]));
  const effectiveDepsOf = (feature) => byFeature.get(feature)?.dependsOn ?? [];

  // `reachable(start, target)`: is `target` reachable from `start`'s deps, excluding `start`
  // itself even if a cycle leads back to it (production's self-exclusion, TSPEC comment at
  // `blockedFeatureCounts`).
  function reachable(start, target) {
    const seen = new Set([start]);
    const stack = [...effectiveDepsOf(start)];
    while (stack.length > 0) {
      const dep = stack.pop();
      if (seen.has(dep)) continue;
      seen.add(dep);
      if (dep === target) return true;
      stack.push(...effectiveDepsOf(dep));
    }
    return false;
  }

  const nonDone = queueEntries.filter((r) => r.status !== "done");
  const allFeatures = new Set(queueEntries.map((r) => r.feature));
  const counts = new Map();
  for (const feature of allFeatures) {
    let n = 0;
    for (const row of nonDone) {
      if (reachable(row.feature, feature)) n += 1;
    }
    if (n > 0) counts.set(feature, n);
  }
  return counts;
}

const arbitraryQueueGraph = fc
  .array(fc.stringMatching(/^[a-z][a-z0-9]{0,4}$/), { minLength: 2, maxLength: 6 })
  .map((names) => [...new Set(names)])
  .filter((names) => names.length >= 2)
  .chain((names) =>
    fc
      .array(
        fc.record({
          status: fc.constantFrom("done", "queued", "running"),
          // Arbitrary subset of ALL feature names, including the row's own (self-loop / cycle
          // seed) — cycles must be part of the explored space, not excluded from it.
          depIdx: fc.uniqueArray(fc.nat({ max: names.length - 1 }), { maxLength: names.length }),
        }),
        { minLength: names.length, maxLength: names.length },
      )
      .map((rows) =>
        rows.map((r, i) => ({
          feature: names[i],
          status: r.status,
          dependsOn: r.depIdx.map((idx) => names[idx]),
        })),
      ),
  );

describe("PROP-VIEW-05 (generative): blockedFeatureCounts — bounded, self-excluding, permutation-invariant", () => {
  test("BOUNDED + matches an independently-shaped reachability reference, over arbitrary graphs including cycles", () => {
    fc.assert(
      fc.property(arbitraryQueueGraph, (queueEntries) => {
        const nonDoneCount = queueEntries.filter((r) => r.status !== "done").length;

        let counts;
        expect(() => {
          counts = blockedFeatureCounts({ queueEntries, frontmatterDeps: new Map() });
        }).not.toThrow();

        for (const value of counts.values()) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(nonDoneCount);
        }

        expect(counts).toEqual(referenceCounts(queueEntries));
      }),
    );
  });

  test("SELF-EXCLUDING: no non-done row's own feature is incremented by its own transitive closure, even under a self-loop", () => {
    fc.assert(
      fc.property(arbitraryQueueGraph, (queueEntries) => {
        const counts = blockedFeatureCounts({ queueEntries, frontmatterDeps: new Map() });
        // A row that is its OWN only non-done dependent (no other row depends on it) must not
        // appear in counts purely from its own cycle — verified via the reference oracle, which
        // seeds visited with the row's own feature exactly as production does.
        const reference = referenceCounts(queueEntries);
        expect(counts).toEqual(reference);
      }),
    );
  });

  test("PERMUTATION-INVARIANT: shuffling the input rows leaves the result unchanged", () => {
    fc.assert(
      fc.property(arbitraryQueueGraph, fc.nat({ max: 10_000 }), (queueEntries, seed) => {
        const counts = blockedFeatureCounts({ queueEntries, frontmatterDeps: new Map() });

        // Deterministic shuffle keyed on `seed`, no external RNG dependency.
        const shuffled = [...queueEntries];
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
          const j = (seed + i * 2654435761) % (i + 1);
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const shuffledCounts = blockedFeatureCounts({ queueEntries: shuffled, frontmatterDeps: new Map() });
        expect(shuffledCounts).toEqual(counts);
      }),
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Law 5 — entryId canonicalisation round trip, over generated blocks
// ════════════════════════════════════════════════════════════════════════════
//
// `canonicalBlockText(chunk) = "## " + chunk.trim()` and `entryId(chunk) =
// sha256(canonicalBlockText(chunk)).slice(0,12)` (Architecture §6). The round-trip law: padding a
// block with arbitrary leading/trailing whitespace must not change its id — canonicalisation
// absorbs the padding — because `trim()` is exactly what `canonicalBlockText` applies before
// hashing, so the padded and unpadded chunks canonicalise to byte-identical text.
const arbitraryBlockBody = fc
  .array(fc.stringMatching(/^[!-~ ]{1,40}$/), { minLength: 1, maxLength: 8 })
  .map((lines) => lines.join("\n"));

const arbitraryWhitespacePad = fc.stringMatching(/^[ \t\n\r]{0,6}$/);

describe("entryId canonicalisation round trip (generative, PLAN P9-01)", () => {
  test("ROUND-TRIP: padding a block with arbitrary leading/trailing whitespace leaves entryId unchanged", () => {
    fc.assert(
      fc.property(arbitraryBlockBody, arbitraryWhitespacePad, arbitraryWhitespacePad, (body, lead, trail) => {
        const padded = `${lead}${body}${trail}`;
        expect(entryId(padded)).toBe(entryId(body));
        expect(canonicalBlockText(padded)).toBe(canonicalBlockText(body));
      }),
    );
  });

  test("DETERMINISM + FORMAT: entryId is a pure function producing exactly 12 lowercase hex characters", () => {
    fc.assert(
      fc.property(arbitraryBlockBody, (body) => {
        const first = entryId(body);
        const second = entryId(body);
        expect(first).toBe(second);
        expect(first).toMatch(/^[0-9a-f]{12}$/);
      }),
    );
  });

  test("SENSITIVITY: two blocks with different canonical text (not merely re-padded) almost never collide", () => {
    fc.assert(
      fc.property(arbitraryBlockBody, arbitraryBlockBody, (a, b) => {
        fc.pre(canonicalBlockText(a) !== canonicalBlockText(b));
        expect(entryId(a)).not.toBe(entryId(b));
      }),
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Law 6 — notice-collection set laws (collectNotices, LOOP_NOTICE_CODES)
// ════════════════════════════════════════════════════════════════════════════

const arbitraryCollectNoticesInput = fc.record({
  configResult: fc.option(
    fc.record({
      case: fc.constantFrom("absent-file", "absent-section", "malformed-section", "explicit-default"),
      invalidKeys: fc.uniqueArray(fc.constantFrom(...CONFIG_KEYS), { maxLength: 4 }),
    }),
    { nil: null },
  ),
  preflight: fc.option(
    fc.record({
      conditions: fc.array(
        fc.record({
          id: fc.constantFrom("engine-readiness", "working-tree"),
          held: fc.boolean(),
          detail: fc.string({ maxLength: 20 }),
        }),
        { maxLength: 4 },
      ),
      versionMismatch: fc.record({ mismatched: fc.boolean(), detail: fc.string({ maxLength: 20 }) }),
      notices: fc.constant([]),
    }),
    { nil: null },
  ),
  parseNotices: fc.array(fc.string({ maxLength: 20 }), { maxLength: 4 }),
  appendFailures: fc.array(
    fc.record({ path: fc.string({ maxLength: 20 }), message: fc.string({ maxLength: 20 }) }),
    { maxLength: 4 },
  ),
  report: fc.option(
    fc.record({
      skipped: fc.array(
        fc.record({ feature: fc.string({ maxLength: 20 }), reason: fc.string({ maxLength: 20 }) }),
        { maxLength: 4 },
      ),
    }),
    { nil: null },
  ),
  queue: fc.option(fc.record({ readable: fc.boolean() }), { nil: null }),
  restarted: fc.boolean(),
});

/** Canonical, order-independent, comparable representation of a notices array. */
function canonicalNotices(notices) {
  return notices.map((n) => `${n.code} ${n.subject} ${n.text}`).sort();
}

describe("collectNotices — notice-collection set laws (generative, PLAN P9-01)", () => {
  test("SUBSET: every produced notice code is a member of LOOP_NOTICE_CODES", () => {
    fc.assert(
      fc.property(arbitraryCollectNoticesInput, (input) => {
        const notices = collectNotices(input);
        for (const n of notices) {
          expect(LOOP_NOTICE_CODES).toContain(n.code);
        }
      }),
    );
  });

  test("ORDER-INDEPENDENT: shuffling the array-valued producer inputs leaves the resulting notice multiset unchanged", () => {
    fc.assert(
      fc.property(arbitraryCollectNoticesInput, (input) => {
        const notices = collectNotices(input);

        const shuffledInput = {
          ...input,
          parseNotices: [...input.parseNotices].reverse(),
          appendFailures: [...input.appendFailures].reverse(),
          report: input.report ? { skipped: [...input.report.skipped].reverse() } : null,
        };
        const shuffledNotices = collectNotices(shuffledInput);

        expect(canonicalNotices(shuffledNotices)).toEqual(canonicalNotices(notices));
      }),
    );
  });

  test("IDEMPOTENT UNDER DUPLICATE PRODUCERS: duplicating one producer's entries duplicates its notices without introducing a new code", () => {
    fc.assert(
      fc.property(arbitraryCollectNoticesInput, (input) => {
        const baseCodes = new Set(collectNotices(input).map((n) => n.code));

        const duplicatedInput = { ...input, parseNotices: [...input.parseNotices, ...input.parseNotices] };
        const duplicatedNotices = collectNotices(duplicatedInput);
        const duplicatedCodes = new Set(duplicatedNotices.map((n) => n.code));

        // No new code is introduced by duplication.
        for (const code of duplicatedCodes) {
          expect(baseCodes.has(code) || code === "escalation-parse").toBe(true);
        }

        // The escalation-parse count exactly doubles.
        const baseParseCount = collectNotices(input).filter((n) => n.code === "escalation-parse").length;
        const duplicatedParseCount = duplicatedNotices.filter((n) => n.code === "escalation-parse").length;
        expect(duplicatedParseCount).toBe(baseParseCount * 2);
      }),
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Law 4 — redactEntryText's per-family property (PROP-ESC-11, PROP-ESC-12)
// ════════════════════════════════════════════════════════════════════════════
//
// `redactEntryText` is `orchestrate-dev.js`'s P3-02 deliverable. Loaded via dynamic
// `await import` inside each test body so this file loads independently of that module.

// One concrete instance per behavioural family — never the character-class source text (TSPEC
// "Pattern: prefix-anchored" section, `redactEntryText` PROPERTIES row).
const FAMILY_PREFIXES = ["ghu_", "github_pat_", "sk-", "xoxb-", "AKIA"];
const runBody = fc.stringMatching(/^[A-Za-z0-9_\-]{8,64}$/);

describe("PROP-ESC-11 (generative, P3-02): redactEntryText — per-family redaction", () => {
  test("P3-02: redactEntryText(prefix + run) contains neither the drawn prefix nor run, and contains [redacted:{n} chars] with n === (prefix + run).length, for a concrete instance of each of the five families", async () => {
    const { redactEntryText } = await import("../orchestrate-dev.js");

    fc.assert(
      fc.property(fc.constantFrom(...FAMILY_PREFIXES), runBody, (prefix, run) => {
        const needle = prefix + run;
        const output = redactEntryText(needle);
        expect(output).not.toContain(prefix);
        expect(output).not.toContain(run);
        expect(output).toContain(`[redacted:${needle.length} chars]`);
      }),
    );
  });
});

describe("PROP-ESC-12 (generative, negative, P3-02): redactEntryText — non-firing + anchor halves", () => {
  test("P3-02: redactEntryText does not fire on input carrying no catalogue prefix at any position — 40-hex git oids and base64url tokens filtered to exclude every catalogue prefix as a substring", async () => {
    const { redactEntryText } = await import("../orchestrate-dev.js");

    const fortyHexOid = fc.stringMatching(/^[0-9a-f]{40}$/);
    const noPrefixBase64url = fc
      .stringMatching(/^[A-Za-z0-9_-]{8,64}$/)
      .filter((s) => !FAMILY_PREFIXES.some((p) => s.includes(p)) && !s.includes("ghs_"));

    fc.assert(
      fc.property(fc.oneof(fortyHexOid, noPrefixBase64url), (input) => {
        expect(redactEntryText(input)).toBe(input);
      }),
    );
  });

  // The generative form of AT-34a's third seed: a catalogue prefix sitting in a run's INTERIOR,
  // not at its start, must not fire — "prefix-anchored, not entropy-shaped" (TSPEC).
  test("P3-02: redactEntryText does not fire when a catalogue prefix sits in a run's interior rather than at its start (the anchor half)", async () => {
    const { redactEntryText } = await import("../orchestrate-dev.js");

    const leadingRun = fc.stringMatching(/^[A-Za-z0-9_\-]{1,20}$/);
    const trailingRun = fc.stringMatching(/^[A-Za-z0-9_\-]{0,20}$/);

    fc.assert(
      fc.property(leadingRun, fc.constantFrom(...FAMILY_PREFIXES), trailingRun, (lead, prefix, trail) => {
        const interior = `${lead}${prefix}${trail}`;
        expect(redactEntryText(interior)).toBe(interior);
      }),
    );
  });
});

describe("PROP-ITER-14 (generative): decodeLoopState / encodeLoopState — round-trip + totality", () => {
  test("ROUND-TRIP: decodeLoopState(encodeLoopState(s)) deep-equals s for every well-formed SessionState", () => {
    fc.assert(
      fc.property(arbitrarySessionState, (state) => {
        expect(decodeLoopState(encodeLoopState(state))).toEqual(state);
      }),
    );
  });

  // Deliberately includes near-miss truncations of a VALID token, not just arbitrary strings — a
  // generator of arbitrary strings alone almost never produces one, which is the input that
  // distinguishes a real decoder from a bare try/catch wrapper (TSPEC PROP-ITER-14's oracle note).
  test("TOTALITY: decodeLoopState never throws and always returns a complete fresh-or-decoded state, over arbitrary strings, non-strings-as-tokens and truncations of a valid token", () => {
    const validTokenTruncation = arbitrarySessionState
      .map((s) => encodeLoopState(s))
      .chain((token) => fc.nat({ max: Math.max(token.length, 1) }).map((n) => token.slice(0, n)));

    fc.assert(
      fc.property(fc.oneof(fc.string(), validTokenTruncation, fc.constant(null)), (token) => {
        let result;
        expect(() => {
          result = decodeLoopState(token);
        }).not.toThrow();
        expect(result).toMatchObject({ v: 1 });
        expect(Number.isInteger(result.consecutiveIdle)).toBe(true);
        expect(Number.isInteger(result.schedulePos)).toBe(true);
        expect(Number.isInteger(result.iteration)).toBe(true);
        expect(Array.isArray(result.merged)).toBe(true);
        expect(Array.isArray(result.halted)).toBe(true);
        expect(Array.isArray(result.escalationsRaised)).toBe(true);
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Law 7 — `parseEscalationLog` totality + parse-notice reason vocabulary
// (CODE_REVIEW-pdlc-engineering-loop-v4 N-01; AC-4.7, BR-16, PROP-VIEW-10).
//
// AC-4.7 is a universal — "any shape the reader does not recognise" is skipped
// under a named notice and never aborts the render — but every oracle over the
// feature's principal parser was example-based. Two generative conjuncts close
// that:
//
//   (a) TOTALITY over arbitrary text (including near-miss block shapes, which a
//       generator of arbitrary strings alone essentially never produces):
//       `parseEscalationLog` never throws, always returns `{entries,
//       parseNotices}`, accounts for every `/^## /m` chunk exactly once across
//       the two arrays, and every notice carries a 1-based `blockIndex`, a
//       string `heading` and a reason drawn from the frozen catalogue.
//   (b) SET-EQUALITY over the reason vocabulary: the shipped
//       `PARSE_NOTICE_REASON_KINDS` set-equals the three kinds TSPEC §4b names,
//       `parseNoticeReason` throws off-catalogue (the shape `notice()` already
//       has in `loop-session.mjs`), and the module builds every notice reason
//       through that helper — so a new reason cannot ship untested.
// ---------------------------------------------------------------------------

describe("N-01 (generative): parseEscalationLog totality and parse-notice reason vocabulary", () => {
  const REASON_KINDS = ["unrecognised-shape", "duplicate-field", "missing-field"];

  /** Near-miss blocks: valid-ish headings and tables, perturbed one axis at a time. */
  const arbitraryBlockish = fc
    .record({
      iso: fc.constantFrom("2026-08-26T00:00:00Z", "not-a-date", ""),
      feature: fc.constantFrom("alpha", "", "beta"),
      label: fc.constantFrom("some-seam", "decision", ""),
      separator: fc.constantFrom(" — ", " - ", " — some-extra — "),
      table: fc.constantFrom("| Field | Value |\n|---|---|", "| Nope | Value |", ""),
      rows: fc.array(
        fc.constantFrom(
          "| Feature | alpha |",
          "| Feature | beta |",
          "| Seam | some-seam |",
          "| Source | pipeline-halt |",
          "| Decision | resolved |",
          "| Decides | abc123 |",
          "",
        ),
        { maxLength: 6 },
      ),
    })
    .map(
      (b) =>
        `## ${b.iso}${b.separator}${b.feature}${b.separator}${b.label}\n\n${b.table}\n${b.rows.join("\n")}\n`,
    );

  const arbitraryLog = fc.oneof(
    fc.string(),
    fc.array(arbitraryBlockish, { maxLength: 4 }).map((blocks) => blocks.join("\n")),
    fc.constant(null),
  );

  test("TOTALITY: never throws, accounts for every block exactly once, and every notice reason is on-catalogue", async () => {
    const { parseEscalationLog, PARSE_NOTICE_REASON_KINDS } = await import(
      "../lib/escalation-view.mjs"
    );

    fc.assert(
      fc.property(arbitraryLog, (text) => {
        let result;
        expect(() => {
          result = parseEscalationLog(text);
        }).not.toThrow();

        expect(Array.isArray(result.entries)).toBe(true);
        expect(Array.isArray(result.parseNotices)).toBe(true);
        expect(Object.keys(result).sort()).toEqual(["entries", "parseNotices"]);

        const chunkCount =
          text === null ? 0 : text.split(/^## /m).filter((c) => c.trim() !== "").length;
        expect(result.entries.length + result.parseNotices.length).toBe(chunkCount);

        const indices = result.parseNotices.map((n) => n.blockIndex);
        for (const notice of result.parseNotices) {
          expect(Number.isInteger(notice.blockIndex)).toBe(true);
          expect(notice.blockIndex).toBeGreaterThanOrEqual(1);
          expect(notice.blockIndex).toBeLessThanOrEqual(chunkCount);
          expect(typeof notice.heading).toBe("string");
          const kind = notice.reason.split(":")[0];
          expect(PARSE_NOTICE_REASON_KINDS).toContain(kind);
        }
        expect(new Set(indices).size).toBe(indices.length);
      }),
    );
  });

  test("SET-EQUALITY: the shipped reason catalogue is exactly TSPEC §4b's three kinds", async () => {
    const { PARSE_NOTICE_REASON_KINDS } = await import("../lib/escalation-view.mjs");

    expect([...PARSE_NOTICE_REASON_KINDS].sort()).toEqual([...REASON_KINDS].sort());
    expect(Object.isFrozen(PARSE_NOTICE_REASON_KINDS)).toBe(true);
  });

  test("parseNoticeReason throws on an off-catalogue kind and renders the on-catalogue ones", async () => {
    const { parseNoticeReason } = await import("../lib/escalation-view.mjs");

    expect(parseNoticeReason("unrecognised-shape")).toBe("unrecognised-shape");
    expect(parseNoticeReason("missing-field", "Feature")).toBe("missing-field: Feature");
    expect(parseNoticeReason("duplicate-field", "Seam")).toBe("duplicate-field: Seam");
    expect(() => parseNoticeReason("invented-kind")).toThrow(/invented-kind/);
  });

  test("every parse-notice reason in the shipped module is built through parseNoticeReason", () => {
    const source = readFileSync(
      new URL("../lib/escalation-view.mjs", import.meta.url),
      "utf8",
    );

    const reasonAssignments = [...source.matchAll(/reason:\s*([^\n,}]+)/g)].map((m) =>
      m[1].trim(),
    );

    expect(reasonAssignments.length).toBeGreaterThan(0);
    for (const rhs of reasonAssignments) {
      expect(rhs.startsWith("parseNoticeReason(")).toBe(true);
    }
  });
});
