/**
 * decisionLedgerFixtureGuard.test.js — PLAN T-03, TSPEC §3.5, §3.1, REQ pdlc-decision-ledger.
 *
 * The frozen decision-corpus fixture and the guard that keeps it honest.
 *
 * TSPEC §3.5 verifies `DECISION_CORPUS_ARGV` / `DECISION_HEADING_RE` against the working tree at
 * `docs/_constraints/pdlc-decision-corpus-baseline.md` v1.2's `Verified at` commit `8c673a09f`
 * (on `feat-pdlc-decision-ledger`). Downstream tests (T-05 onward) must read that SAME
 * historical corpus through the `_git` / `_readFile` doubles — never the live working tree,
 * which has already moved (`git ls-files` over the identical filter yields 26 today, one more
 * than the frozen 25: `DECISIONS-pdlc-decision-ledger.md` landed after the Baseline commit).
 *
 * ## Reconciling `git ls-tree` vs `DECISION_CORPUS_ARGV` (PM F-01)
 *
 * `DECISION_CORPUS_ARGV` (TSPEC §3.1) is a `git ls-files` argv using `:(glob)` pathspec magic:
 *
 *   ["ls-files", "--cached", "--others", "--exclude-standard", "--",
 *    ":(glob)docs/_decisions/DECISIONS-STAR.md", ":(glob)docs/STAR/DECISIONS-STAR.md",
 *    ":(glob)docs/completed/STAR/DECISIONS-STAR.md", ":(glob)docs/discarded/STAR/DECISIONS-STAR.md"]
 *   (STAR stands in for a literal `*` glob token here — spelled out to avoid closing this
 *   block comment early)
 *
 * `git ls-tree` — the only way to enumerate a HISTORICAL commit's tree rather than the live
 * index — REJECTS `:(glob)` pathspec magic outright: `fatal: … pathspec magic not supported by
 * this command: 'glob'`. So `DECISION_CORPUS_ARGV`'s own pathspecs cannot be handed to
 * `ls-tree`, and this fixture was built from a reproducible EQUIVALENT enumeration instead:
 *
 *   git ls-tree -r --name-only 8c673a09f | grep -E \
 *     '^(docs/_decisions/DECISIONS-[^/]*\.md|docs/[^/]+/DECISIONS-[^/]*\.md|docs/completed/[^/]+/DECISIONS-[^/]*\.md|docs/discarded/[^/]+/DECISIONS-[^/]*\.md)$'
 *
 * Four alternatives, one per `DECISION_CORPUS_ARGV` pathspec. A three-alternative form dropping
 * `docs/discarded/` yields 24 and is wrong (TE F-01 / PM F-01) — it silently excludes
 * `docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md`, which IS present at
 * `8c673a09f` and carries the four `DEC-BUD-*` ids `M-2b` attributes to `pdlc-rcv-budget-stop`.
 * Measured: the four-alternative command above yields exactly 25 at `8c673a09f`; the identical
 * filter over live `git ls-files` yields 26 (the one-file delta named above). Both deltas —
 * 24→25 and 25→26 — are named rather than asserted bare, per PLAN T-03.
 *
 * `DECISION_CORPUS_ARGV`'s `:(glob)` form remains correct for its actual runtime use, `git
 * ls-files` against the live index; it was simply never usable to REPRODUCE the historical
 * enumeration this fixture freezes, which is why the `ls-tree` + `grep` form exists at all.
 *
 * ## Integrity guard (TSPEC §3.5 / PLAN T-03, TE Q-01)
 *
 * Two conjuncts, both falsifiable, NEITHER derived from the fixture itself:
 *
 *   1. Per-file SHA-256 digest literals, hand-transcribed below from the `8c673a09f` blobs —
 *      never recomputed from a manifest, which would agree with a rewritten fixture by
 *      construction.
 *   2. SET EQUALITY between the fixture's actual path list and a 25-element literal path array
 *      transcribed by hand into this file — not a bare count, and not a list generated at
 *      fixture-build time. A fixture accidentally built from a 24-path enumeration (the
 *      `docs/discarded/` omission above) fails HERE, at the missing path itself, rather than
 *      surfacing later as an unexplained red in a downstream test (e.g. T-09) that consumes the
 *      corpus and gives no clue which file is missing.
 *
 * No test touches the working tree: this file only reads the frozen fixture directory on disk.
 * Downstream tasks read this SAME directory through the `_readFile` double, never `fs` directly
 * against the live repository.
 */

import { createHash } from "crypto";
import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, "fixtures", "decision-corpus");

/** Hand-transcribed SHA-256 digests of each fixture file's bytes, taken at `8c673a09f`. */
const EXPECTED_DIGESTS = Object.freeze({
  "docs/_decisions/DECISIONS-advisory-wave-gate-questions.md":
    "756536109c501d04a7705aa271cda4969bc2e0e1e8d8ae1e0bc27b5db1d47939",
  "docs/_decisions/DECISIONS-anchor-provenance.md":
    "5cf5acb392e56eb4895d7ac32a62263e2c36648510b5b7376281077e2fc270ed",
  "docs/_decisions/DECISIONS-erratum-routing.md":
    "d34b864f3753e9e423079014c949634f0d778aaa73f2ea0cec7285fb79f0977f",
  "docs/_decisions/DECISIONS-loop-termination.md":
    "881fb6ec9691c33c1df6c1139bbc5dae87d2d21f2e60ce3d683a01023ca2e10c",
  "docs/_decisions/DECISIONS-model-availability.md":
    "ba188a034a3404a884716d8f926d6e189ede39d0dd077fdea9d3e1b538d5bfa5",
  "docs/_decisions/DECISIONS-plugin-distribution.md":
    "2f6bd19068198ab0e6fdcdb2e37c9254eceeb2e5f8c73b2581d34e9aba309fde",
  "docs/_decisions/DECISIONS-review-convergence.md":
    "f8bf34d1dc77e795f97c25e1f3927892af36d4eaf1ff23d16672405ed99942e1",
  "docs/_decisions/DECISIONS-review-severity-bars.md":
    "d72baefe9e09d3f048bcc363ccbada0d62fb38c6a1f4f87a77cadcaa3cb06704",
  "docs/_decisions/DECISIONS-seam-defaults.md":
    "3c25a679feeaa01f497fdada41491d8d0fb97ca78721270acce8c2464acec2b0",
  "docs/_decisions/DECISIONS-spec-layer-boundary.md":
    "b7871c84ae574e7dd90a0d8f46b0b4fe395d02c138dfd733d8bb52b9b1eb3de9",
  "docs/_decisions/DECISIONS-test-oracle-mechanics.md":
    "e2e026ff634fce9bf5dc2b66178c14bafad2f16ea49959293d2df4fa42272ccb",
  "docs/_decisions/DECISIONS-wave-gates.md":
    "1332968584c1ea7d90f14f0f5e524712a66bdc1b564bddda10ffe2be2c68884b",
  "docs/completed/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md":
    "13ad2e44f413d7a80250cf7a9b0bddc6b0bffa3a489ae85018a30a72a1860a85",
  "docs/completed/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md":
    "dc7a8d654bea979d0f06207b8de67a9ebc1e180f134bf5141dcc41af17801fe9",
  "docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md":
    "b9ac24805dcccb680f63f14b02ad222a48f8594e53948a2236d30aca0b3ded67",
  "docs/completed/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md":
    "05d305f8699fa494c368ddd9e383ab3b34f4fd02a139ae99914886d53c5c7f66",
  "docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md":
    "0bd30f420d1949d7b5892505253edc6eb6b9b8113f46537a78c1cf7b6db0a966",
  "docs/completed/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md":
    "80efe304dd78ed5476ebcb695c0490a877d4d6c4e1864a2a2dc7ed6969938641",
  "docs/completed/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md":
    "3664868f9cbe99aec8cfebf16d4121dbffbe4c6a9e6808f26dc6b5d0fc502a68",
  "docs/completed/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md":
    "87ec8ebca294ebbdd45eb0fdebe939740fc968c8b91dcaf964dbc87ca299b193",
  "docs/completed/pdlc-loop-economics/DECISIONS-pdlc-loop-economics.md":
    "aba4c3b1d7ac13dd2f5b051ea1236c3a2dd16de33d1d7f577071e44da718af37",
  "docs/completed/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md":
    "a1a6fbf0fd5694a19cabde04c6b32bb5323f96cba4e801b53b606ea708636839",
  "docs/completed/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md":
    "37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46",
  "docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md":
    "d8da5a8becc0aaa9154436b81080548ca5d66ab240461794b5766a8e1244c46e",
  "docs/orchestrate-dev-workflow/DECISIONS-orchestrate-dev-workflow.md":
    "7a451b0eb93dca7bac5ab16c46c53596468938f3ef5da7b7293239fe326c227a",
});

/**
 * The set-equality anchor (TE Q-01): a 25-element literal path array, transcribed by hand from
 * the reproducible `git ls-tree` enumeration above — never generated from the fixture or from
 * `EXPECTED_DIGESTS` (whose keys would agree with a corrupted fixture directory by construction
 * if this array were derived from them instead of typed independently).
 */
const EXPECTED_PATHS = Object.freeze(
  [
    "docs/_decisions/DECISIONS-advisory-wave-gate-questions.md",
    "docs/_decisions/DECISIONS-anchor-provenance.md",
    "docs/_decisions/DECISIONS-erratum-routing.md",
    "docs/_decisions/DECISIONS-loop-termination.md",
    "docs/_decisions/DECISIONS-model-availability.md",
    "docs/_decisions/DECISIONS-plugin-distribution.md",
    "docs/_decisions/DECISIONS-review-convergence.md",
    "docs/_decisions/DECISIONS-review-severity-bars.md",
    "docs/_decisions/DECISIONS-seam-defaults.md",
    "docs/_decisions/DECISIONS-spec-layer-boundary.md",
    "docs/_decisions/DECISIONS-test-oracle-mechanics.md",
    "docs/_decisions/DECISIONS-wave-gates.md",
    "docs/completed/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md",
    "docs/completed/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md",
    "docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md",
    "docs/completed/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md",
    "docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md",
    "docs/completed/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md",
    "docs/completed/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md",
    "docs/completed/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md",
    "docs/completed/pdlc-loop-economics/DECISIONS-pdlc-loop-economics.md",
    "docs/completed/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md",
    "docs/completed/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md",
    "docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md",
    "docs/orchestrate-dev-workflow/DECISIONS-orchestrate-dev-workflow.md",
  ].sort()
);

/** The frozen Baseline v1.2 `Verified at` commit this fixture was captured from. */
const EXPECTED_SOURCE_COMMIT = "8c673a09f";

function sha256OfFile(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

/**
 * Recursively lists every regular file under `dir`, returned as POSIX-style paths relative to
 * `FIXTURE_ROOT` (so this works identically on any OS the suite runs under). Directories are
 * walked but never themselves returned.
 */
function actualFixturePaths(dir = FIXTURE_ROOT) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...actualFixturePaths(abs));
    } else if (entry.isFile()) {
      files.push(path.relative(FIXTURE_ROOT, abs).split(path.sep).join("/"));
    }
  }
  return files;
}

describe("decisionLedgerFixtureGuard — the frozen decision-corpus fixture (TSPEC §3.5, PLAN T-03)", () => {
  it("the fixture directory exists on disk", () => {
    expect(statSync(FIXTURE_ROOT).isDirectory()).toBe(true);
  });

  it("the fixture's actual path set equals the hand-transcribed 25-element set (set equality, not containment or count)", () => {
    // Both directions at once: a path missing from disk fails because `actual` is short of
    // `expected`; a spurious extra file fails because `actual` overshoots it. A bare `.length`
    // check on either side would pass a fixture built from the wrong 25 (or 24) paths as long as
    // the count matched by coincidence.
    expect(actualFixturePaths().sort()).toEqual([...EXPECTED_PATHS]);
  });

  it("EXPECTED_PATHS itself has exactly 25 entries (PM F-01 / TE F-01 — the four-alternative enumeration, not the three-alternative 24-path miscount)", () => {
    expect(EXPECTED_PATHS).toHaveLength(25);
  });

  it("EXPECTED_DIGESTS' key set equals EXPECTED_PATHS (the two hand-transcribed anchors agree with each other)", () => {
    expect(Object.keys(EXPECTED_DIGESTS).sort()).toEqual([...EXPECTED_PATHS]);
  });

  it("includes the docs/discarded/ path the three-alternative miscount would have dropped (24→25 delta, TE F-01 / PM F-01)", () => {
    expect(EXPECTED_PATHS).toContain(
      "docs/discarded/pdlc-rcv-budget-stop/DECISIONS-pdlc-rcv-budget-stop.md"
    );
  });

  it("excludes the post-Baseline path that only the LIVE working tree carries (25→26 delta)", () => {
    // DECISIONS-pdlc-decision-ledger.md landed on this branch after the Baseline commit
    // 8c673a09f — it must never be in the frozen fixture, which is the entire reason the copy
    // is frozen rather than read live off disk.
    expect(EXPECTED_PATHS).not.toContain("docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md");
    expect(actualFixturePaths()).not.toContain(
      "docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md"
    );
  });

  for (const [relPath, expectedDigest] of Object.entries(EXPECTED_DIGESTS)) {
    it(`${relPath}'s recomputed SHA-256 digest matches the hand-transcribed literal`, () => {
      const filePath = path.join(FIXTURE_ROOT, relPath);
      const actualDigest = sha256OfFile(filePath);
      if (actualDigest !== expectedDigest) {
        throw new Error(
          `pdlc-decision-ledger-fixture-guard: digest mismatch for ${relPath} — recomputed ` +
            `${actualDigest}, hand-transcribed ${expectedDigest}. Either the frozen fixture was ` +
            `edited after capture, or a legitimate re-capture whose new digest was never ` +
            `transcribed into this file (TSPEC §3.5).`
        );
      }
    });
  }

  it("the frozen source commit is recorded as 8c673a09f (Baseline v1.2's Verified-at commit)", () => {
    expect(EXPECTED_SOURCE_COMMIT).toBe("8c673a09f");
  });

  it("the fixture bytes are non-trivial and a corrupted file would not compare equal (the instrument fires)", () => {
    // The control for the whole block: a digest comparison that passes because the reader
    // silently returned "" for a missing/empty file is exactly the defect this guard exists to
    // catch, so prove it is capable of failing.
    const sample = readFileSync(
      path.join(FIXTURE_ROOT, "docs/_decisions/DECISIONS-wave-gates.md"),
      "utf8"
    );
    expect(sample.length).toBeGreaterThan(100);
    expect(sha256OfFile(path.join(FIXTURE_ROOT, "docs/_decisions/DECISIONS-wave-gates.md"))).not.toBe(
      createHash("sha256").update("").digest("hex")
    );
  });
});
