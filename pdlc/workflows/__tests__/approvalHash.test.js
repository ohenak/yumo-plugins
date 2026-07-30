/**
 * approvalHash.test.js — the approval-hash / content-digest suite (TSPEC §5.3, §5.4, §5.5;
 * FSPEC AT-12 … AT-18; TSPEC §8.3's AT → jest file map).
 *
 * Ownership (PLAN §7.2, single-writer-per-file): RLH-06 (batch 2). Written RED.
 *
 * **Permitted-red windows (PLAN §7.3).** This one file spans two rows of the ledger, and the
 * distinction is per assertion, not per file:
 *
 *   | Assertions                          | Green from | Permitted red | Greened by            |
 *   | `RLH-AT-12`, `-13`, `-14`, `-17`;   | batch 3    | batch 2       | RLH-05 (d) — the      |
 *   | both digest properties              |            |               | digest family         |
 *   | `RLH-AT-15`, `-16`, `-18`           | batch 8    | batches 2–7   | RLH-16 (6) staleness, |
 *   |                                     |            |               | RLH-26 (8) the gate   |
 *
 * PLAN §7.3 row 3 **withdraws** the optional `-stale` / `-gate` split: three tests, one per AT,
 * each carrying both conjuncts, because FSPEC AT-18 has no staleness half to put in a `-stale`
 * test. That is why the batch-8 tests below each end with a gate conjunct.
 *
 * **Names are `RLH-AT-{N}`, never bare `AT-{N}`** (PLAN §1.3, TSPEC §8.3): `documentOracles.test.js`
 * already carries a deliberately-red `AT-22` from the preceding feature.
 *
 * **The correctness oracle is `__tests__/fixtures/digest-vectors.js`, never Node's `crypto`**
 * (TSPEC C-2, PROPERTIES §6.2). Nothing in this file imports `crypto`: a comparison against
 * `crypto.createHash("sha256")` would stay green if the subject itself reached for `crypto`,
 * which the workflow runtime cannot load. The two properties at the foot of the file are the
 * *coverage* oracle beside those four *correctness* points (PROPERTIES §4.1).
 *
 * Every test asserts `typeof devModule.<fn> === "function"` before using it, so at batch 2 each
 * red names its own missing subject rather than the file failing to link.
 */

import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { DIGEST_VECTORS, vector } from "./fixtures/digest-vectors.js";
import { resolveSeed, seeded, shrink } from "./helpers/driftGenerators.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEV_SOURCE_PATH = resolve(HERE, "..", "orchestrate-dev.js");
const GUARD_SCRIPT_PATH = resolve(HERE, "..", "..", "hooks", "scripts", "guard-harvest-before-delete.sh");

/** TSPEC §5.3 — the 64-hex half. */
const HEX64 = /^[0-9a-f]{64}$/;
/** TSPEC §5.5 — the prefixed form `isStale`'s shape guard admits. */
const PREFIXED = /^sha256:[0-9a-f]{64}$/;

/** The literal seed for this file's two properties (PROPERTIES §1.3 rule 1, PLAN §7.2). */
const LITERAL_SEED = 0x51ed0a06;

// ───────────────────────── shared helpers ─────────────────────────

/**
 * Asserts the named export exists and is callable, then returns it. This is the batch-2 red's
 * oracle: at HEAD none of the digest family exists, so each test fails naming exactly the
 * symbol TSPEC §3.7 says will exist.
 */
function subject(name) {
  const fn = devModule[name];
  // Compared as a sentence so the failure line names the symbol and what it actually is,
  // e.g. `Expected: "orchestrate-dev.js exports sha256Hex as a function"`.
  expect(`orchestrate-dev.js exports ${name} as a ${typeof fn}`).toBe(
    `orchestrate-dev.js exports ${name} as a function`,
  );
  return fn;
}

/** The module's own source text — the carrier for the batch-8 gate conjuncts (PLAN §11.5's
 *  grep-shaped-oracle construction, as used for `RLH-LOOP-03`). L1 may not read the filesystem
 *  to make a claim about a *pure function*; these read it to make a claim about the *gate*,
 *  which is a source-level wiring claim and has no pure subject to call. */
function devSource() {
  return readFileSync(DEV_SOURCE_PATH, "utf8");
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * The gate conjunct shared by `RLH-AT-15`, `-16` and `-18` (PLAN §7.3 row 3 — supplied by
 * RLH-26 in batch 8). TSPEC §5.5: the phase gate consults `isStale` at comparison time and
 * skips **only** on `FRESH`; `STALE` and `UNEVALUABLE` both fall to §2.5 step G and run the
 * phase. Both counts are **0** at HEAD.
 */
function expectPhaseGateConsultsStaleness() {
  const source = devSource();
  // ≥ 2: `isStale`'s own definition (§5.5) plus at least one gate call site (§2.5 step 4).
  expect({
    "isStale( occurrences in orchestrate-dev.js": countMatches(source, /\bisStale\s*\(/g) >= 2,
  }).toEqual({ "isStale( occurrences in orchestrate-dev.js": true });
  // ≥ 2: the literal `isStale` returns, plus the gate's comparison against it.
  expect({
    '"FRESH" occurrences in orchestrate-dev.js': countMatches(source, /"FRESH"|'FRESH'/g) >= 2,
  }).toEqual({ '"FRESH" occurrences in orchestrate-dev.js': true });
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN §7.3 row 2 — green from batch 3 (RLH-05(d)), permitted red at batch 2.
// ═══════════════════════════════════════════════════════════════════════════

describe("RLH-AT-12 … RLH-AT-14, RLH-AT-17 — the digest itself (green from batch 3)", () => {
  test("RLH-AT-12: a round-1 approval produces a usable hash over the pre-dispatch bytes", () => {
    const approvalHashOf = subject("approvalHashOf");

    // FSPEC §7.4's t0/t1: the bytes are read for this purpose immediately BEFORE the reviewer
    // dispatch, and the hash is taken from those bytes (TSPEC §5.3's capture ordering).
    const v = vector("V2-ascii");
    const preDispatchBytes = v.input;
    const anchor = approvalHashOf(preDispatchBytes);

    // Usable means two things: it satisfies §5.5's shape guard, and it is the digest an
    // external SHA-256 computes over the canonical bytes (the fixture, never `crypto`).
    expect(anchor).toMatch(PREFIXED);
    expect(anchor).toBe(v.approvalHash);

    // Re-entry skips the phase: a later read of the same unchanged bytes re-derives the
    // identical anchor, which is what §5.5 compares.
    expect(approvalHashOf(preDispatchBytes)).toBe(anchor);

    // The falsifier FSPEC AT-12 names: an implementation sourcing the hash from a pre-episode
    // pacing measurement digests the measurement, not the document, and every round-1 approval
    // then falls to the missing-hash branch. That input must NOT produce the anchor.
    const pacingMeasurement = '{"episode":"R:1:authoring","filesTouched":3,"dispatches":1}';
    expect(approvalHashOf(pacingMeasurement)).not.toBe(anchor);
  });

  test("RLH-AT-13: one digest function serves the write and the read path", () => {
    const approvalHashOf = subject("approvalHashOf");
    const sha256Hex = subject("sha256Hex");

    for (const v of DIGEST_VECTORS) {
      // Write path (§5.3 t1, the append) and read path (§5.5's comparison) are the same call.
      const writePath = approvalHashOf(v.input);
      const readPath = approvalHashOf(v.input);
      expect(readPath).toBe(writePath);

      // Both carry the `sha256:` prefix over 64 LOWERCASE hex characters (TSPEC §4.4, §5.5).
      expect(writePath).toMatch(PREFIXED);
      expect(sha256Hex(v.input)).toMatch(HEX64);
      expect(sha256Hex(v.input)).toBe(sha256Hex(v.input).toLowerCase());

      // A-11: there is no second digest. `approvalHashOf` is `sha256Hex` with the prefix, so a
      // divergence between the two paths is structurally impossible rather than merely untested.
      expect(writePath).toBe(`sha256:${sha256Hex(v.input)}`);
      expect(sha256Hex(v.input)).toBe(v.sha256Hex);
    }
  });

  test("RLH-AT-14: canonicalisation happens inside the digest, not at the call site", () => {
    const sha256Hex = subject("sha256Hex");
    const canonicaliseForDigest = subject("canonicaliseForDigest");

    const body = "line one\nline two";
    // Six byte sequences differing ONLY in line endings (N-1) and trailing-newline count (N-2).
    const variants = [
      body,
      `${body}\n`,
      `${body}\n\n\n`,
      body.replace(/\n/g, "\r\n"),
      `${body.replace(/\n/g, "\r\n")}\r\n`,
      body.replace(/\n/g, "\r"),
    ];
    const digests = variants.map((t) => sha256Hex(t));
    for (const d of digests) {
      expect(d).toBe(digests[0]);
      expect(d).toMatch(HEX64);
    }

    // "No call-site pre-processing": canonicalising first cannot change the answer, because
    // §5.3 applies N-1/N-2 inside `sha256Hex` — so no two call sites can disagree.
    for (const t of variants) {
      expect(sha256Hex(canonicaliseForDigest(t))).toBe(sha256Hex(t));
    }

    // And the known-answer vector pins WHICH bytes are digested: the canonical ones. A subject
    // that digests the raw input returns sha256("") = e3b0c442… for V1 and reds here.
    const empty = vector("V1-empty");
    expect(sha256Hex(empty.input)).toBe(empty.sha256Hex);
    expect(canonicaliseForDigest(empty.input)).toBe(empty.canonical);
  });

  test("RLH-AT-17: a failed or ambiguous hash append yields no approval and does not halt", () => {
    const approvalHashOf = subject("approvalHashOf");
    const scanLines = subject("scanLines");

    const documentBytes = "# TSPEC\n\nbody\n";
    const computed = approvalHashOf(documentBytes);
    const other = approvalHashOf(`${documentBytes}edited\n`);
    expect(other).not.toBe(computed);

    // §5.3's pre-count is `scanLines` over the cross-review file, collecting the
    // `APPROVAL-HASH:` lines OUTSIDE fenced regions.
    const preCount = (fileText) => {
      const found = [];
      scanLines(fileText, (line) => {
        const m = /^APPROVAL-HASH:\s*(\S+)\s*$/.exec(line);
        if (m) found.push(m[1]);
      });
      return found;
    };

    const withAnchors = (...hashes) =>
      `## Review\n\nVERDICT: Approved\n\n${hashes.map((h) => `APPROVAL-HASH: ${h}`).join("\n")}\n`;

    // E-15, the "one, unequal" branch: count alone cannot decide — it is 1 here and 1 in the
    // idempotent case below — so the existing value is COMPARED against the computed hash.
    const unequal = preCount(withAnchors(other));
    expect(unequal).toHaveLength(1);
    expect(unequal[0]).not.toBe(computed); // ⇒ error surfaced, no append, round yields NO approval

    // E-15, the "≥ 2" branch: the file's history is ambiguous, so neither anchor may be used.
    expect(preCount(withAnchors(computed, other))).toHaveLength(2);

    // E-14, the contrasting "one, equal" branch: an idempotent no-op that KEEPS the approval.
    // Without this case the assertion above would also pass on a count-only pre-count.
    const equal = preCount(withAnchors(computed));
    expect(equal).toEqual([computed]);

    // A fenced anchor never enters the pre-count, so a quoted example cannot fabricate an E-15.
    expect(preCount(`\`\`\`\nAPPROVAL-HASH: ${other}\n\`\`\`\n${withAnchors(computed)}`)).toEqual([
      computed,
    ]);

    // "Does not halt" (§6.2 row 8): the disposition is an operator-facing error and the run
    // continues — none of the pure machinery throws, and the hash is never silently absent.
    expect(() => preCount(withAnchors(other))).not.toThrow();
    expect(computed).toMatch(PREFIXED);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PLAN §7.3 row 3 — green from batch 8, permitted red at batches 2–7.
// RLH-16 (batch 6) supplies the staleness conjunct, RLH-26 (batch 8) the gate
// conjunct, so batch 8 binds all three. One test per AT; the `-stale`/`-gate`
// split offered at PLAN v1.1 is withdrawn at v1.2 and is NOT reintroduced here.
// ═══════════════════════════════════════════════════════════════════════════

describe("RLH-AT-15, RLH-AT-16, RLH-AT-18 — staleness and the phase gate (green from batch 8)", () => {
  test("RLH-AT-15: a pre-harvest edit invalidates the approval (AC-4.4, E-17)", () => {
    const approvalHashOf = subject("approvalHashOf");
    const isStale = subject("isStale");
    const scanLines = subject("scanLines");

    // Round 2 approves these bytes; the anchor is taken at t1, before the document changes.
    const atRound2 = "# PLAN\n\n## 1. Scope\n\nthe approved text\n";
    const recordedHash = approvalHashOf(atRound2);

    // Then a DOD remediation edits the document, and only afterwards does harvest run.
    const afterEdit = `${atRound2}\n## 2. Remediation\n\nadded by the DoD round\n`;

    // Tier 2 (TSPEC §5.4) carries the round-2 hash VERBATIM — harvest copies the recorded
    // literal into `## 6. Approval Record`, it does not recompute over the working tree.
    const learnings = [
      "# LEARNINGS-foo",
      "",
      "## 6. Approval Record",
      "",
      "| Doc | Round | Role | Verdict | Approval hash |",
      "|---|---|---|---|---|",
      `| PLAN | 2 | software-engineer | Approved | ${recordedHash} |`,
      `| PLAN | 2 | test-engineer | Approved | ${recordedHash} |`,
      "",
    ].join("\n");
    const tier2Hashes = [];
    scanLines(learnings, (line) => {
      const m = /\|\s*(sha256:[0-9a-f]{64})\s*\|/.exec(line);
      if (m) tier2Hashes.push(m[1]);
    });
    expect(tier2Hashes).toEqual([recordedHash, recordedHash]);
    expect(tier2Hashes[0]).toBe(approvalHashOf(atRound2));
    expect(tier2Hashes[0]).not.toBe(approvalHashOf(afterEdit));

    // The working tree does not match the recorded hash ⇒ the phase RUNS (§5.5's STALE).
    expect(isStale(recordedHash, afterEdit)).toBe("STALE");

    // FSPEC AT-15 names the falsifying case explicitly: an implementation that recomputed the
    // hash at harvest would record `approvalHashOf(afterEdit)` and report FRESH. The test
    // states what that wrong hash would do, so the STALE assertion above cannot be satisfied
    // by an accident of both hashes being equal.
    expect(isStale(approvalHashOf(afterEdit), afterEdit)).toBe("FRESH");
    expect(approvalHashOf(afterEdit)).not.toBe(recordedHash);

    // …and STALE reaches §2.5 step G rather than the skip (RLH-26, batch 8).
    expectPhaseGateConsultsStaleness();
  });

  test("RLH-AT-16: a rebase does not disturb the comparison (E-19)", () => {
    const approvalHashOf = subject("approvalHashOf");
    const isStale = subject("isStale");

    const documentBytes = "# TSPEC\n\n## 1. Context\n\nunchanged by the rebase\n";
    const recordedHash = approvalHashOf(documentBytes);

    // Phase DOD rebases `feat-{feature}` and rewrites every sha and timestamp on the branch.
    // The document's BYTES are untouched, so the content-addressed comparison is untouched.
    expect(isStale(recordedHash, documentBytes)).toBe("FRESH");

    // "No sha, timestamp or ancestry was read" is asserted structurally, not by spying: §5.5's
    // `isStale(recordedHash, documentBytes)` takes exactly two parameters and neither is a
    // commit, so there is no argument through which a sha could reach the comparison. The
    // corroborating REVIEWED-COMMIT line (§5.3) is never load-bearing — a run before the
    // rebase and a run after it hand `isStale` identical arguments.
    expect(isStale).toHaveLength(2);
    const beforeRebase = isStale(recordedHash, documentBytes);
    const afterRebase = isStale(recordedHash, documentBytes);
    expect(afterRebase).toBe(beforeRebase);

    // A rebase that also changed the bytes is a different fact, and must not read FRESH.
    expect(isStale(recordedHash, `${documentBytes}conflict resolution\n`)).toBe("STALE");

    // …and only FRESH grants the skip (RLH-26, batch 8).
    expectPhaseGateConsultsStaleness();
  });

  test("RLH-AT-18: a record-less LEARNINGS passes the guard and then fails closed (E-22)", () => {
    const isStale = subject("isStale");
    const approvalHashOf = subject("approvalHashOf");

    // Half 1 — the guard PERMITS the deletion. `guard-harvest-before-delete.sh` gates on the
    // existence of a sibling `LEARNINGS-*.md` and inspects none of its content, so a LEARNINGS
    // without `## 6. Approval Record` still satisfies it. Read from the shipped script so the
    // claim tracks the hook rather than a restatement of it.
    const guardSource = readFileSync(GUARD_SCRIPT_PATH, "utf8");
    expect(guardSource).toContain('glob.glob(os.path.join(abs_d, "LEARNINGS-*.md"))');
    expect(guardSource).not.toMatch(/Approval Record/);

    // Half 2 — and then the next Phase F invocation FAILS CLOSED. Harvest has deleted the
    // cross-reviews, so tier 1 finds nothing; tier 2 finds a LEARNINGS with no Approval
    // Record, so no hash reaches the comparison. Every shape that absence can take is
    // `UNEVALUABLE` (§5.5's shape guard), which routes to §2.5 step G — the phase RUNS.
    const documentBytes = "# FSPEC\n\nbody\n";
    for (const absent of [undefined, null, "", "unavailable", "sha256:", "sha256:zzzz", 42]) {
      expect(isStale(absent, documentBytes)).toBe("UNEVALUABLE");
    }

    // Non-vacuity: the same document with a well-formed recorded hash is NOT UNEVALUABLE, so
    // the loop above is failing closed rather than the function returning one constant.
    expect(isStale(approvalHashOf(documentBytes), documentBytes)).toBe("FRESH");

    // The gate conjunct (RLH-26, batch 8): tier 2 reads the Approval Record section by name,
    // and UNEVALUABLE — like STALE — runs the phase rather than skipping it.
    const source = devSource();
    expect(source).toMatch(/Approval Record/);
    expectPhaseGateConsultsStaleness();
  });
});
