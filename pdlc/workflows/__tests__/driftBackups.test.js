/**
 * driftBackups.test.js — the backup filename grammar's retention/verified-destroy suite
 * (PLAN T-30, batch 5).
 *
 * TSPEC §11.3 pins four things so PROPERTIES (O-18, T-49) does not have to invent them; this
 * file is the named `it()` home for each:
 *
 *   - row 4 — the retention binding: newest 5 per id, selected by `LC_ALL=C` descending
 *     FILENAME sort, never mtime (`sameSecondBackups` + `shuffledMtimes`, TSPEC §13.5). The
 *     pruned member of a six-backup set is always `-01`.
 *   - row 2 — C1's own `export LC_ALL=C` (TSPEC §2.5) holds under an injected
 *     `LC_ALL=en_US.UTF-8` on the CALLER's environment — asserted separately from row 4
 *     because §3.2's sandbox already pins `LC_ALL=C`, which would mask the removal of C1's own
 *     export; this test injects a conflicting locale via the probe's own environment.
 *   - O-18 clause (c) — `decoyBackupDir`'s identity-on-unknown-ids requirement: a prune over
 *     one known id never touches a decoy for an unknown id, nor a non-backup-shaped file.
 *   - FSPEC §1.4 / TSPEC §13.5 — `NN` exhaustion (99 backups of one id in one second) is a
 *     write failure, not a silent reuse: `operation: backup`, exit 4 (FSPEC §4.7, §5.6).
 *
 * `pdlc_prune_backups <dir> <knownIds…>` (TSPEC §11.1/§2.2, "always 0") is exercised through
 * `bin/lib-probe.sh` (`runProbe`, TSPEC §11.2's generalised batched-driver precedent, PLAN
 * T-39) rather than through a full `sync`/`hook` entrypoint — it is a C1 function with no
 * entrypoint wiring yet (that lands in T-34, batch 9), and the probe is what gives C1 an
 * observable before C2/C3/C4 exist (PLAN's Phase 4 preamble). The exhaustion case is the one
 * exception: it asserts the entrypoint-level contract (`operation: backup`, exit 4), so it goes
 * through `runScript("sync", …)`.
 *
 * RED-terminal (PLAN batch 5): C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`) does not exist until
 * T-31 (batch 6), and the sync/hook entrypoints (`sync-workflows.sh`, `check-workflow-drift.sh`)
 * do not exist until later still. Every probe case below therefore falls through to
 * `lib-probe.sh`'s `unknown-function` branch (`pdlc_prune_backups` is undefined) and every
 * `runScript` call below fails at `bash: <script>: No such file or directory` (a non-zero,
 * non-4 status) — all four suites are expected RED until T-31/T-34 land. Nothing in this file
 * is implementation; T-30 owns only this test file (single-writer-per-file, PLAN).
 */

import { mkdtempSync } from "fs";
import { existsSync, mkdirSync, readdirSync, rmSync, utimesSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { describeOrSkip } from "./helpers/driftCapabilities.js";
import { makeToolDir, runScript, runGrammar, expectFailOpen } from "./helpers/driftHarness.js";
import { runProbe } from "./helpers/driftProbe.js";
import { snapshotTree, assertTreeUnchanged } from "./helpers/driftOrdering.js";
import { seeded, resolveSeed, genId, genStamp } from "./helpers/driftGenerators.js";
import { M6_ID_REGEX } from "../lib/document-oracles.mjs";
import {
  makeConsumerTree,
  makePluginTree,
  setRowState,
  sameSecondBackups,
  shuffledMtimes,
  decoyBackupDir,
  nnExhausted,
} from "./helpers/driftFixtures.js";

// Every case here needs a hash utility resolvable on PATH — `makeToolDir`'s default probe list
// (used both by `runProbe`'s own sandbox and by `runScript`'s) includes `shasum`/`sha1sum`, and
// the exhaustion suite additionally needs one to classify the "stale" row at all (TSPEC §14
// standing precondition).
describeOrSkip(
  "driftBackups — TSPEC §11.3, FSPEC §4.7/§5.6",
  "hash",
  ["O-18's retention/identity/exhaustion bindings (TSPEC §11.3 rows 2 and 4, §13.5)"],
  () => {
    // ───────────────────────────── §11.3 row 4 ─────────────────────────────

    describe("§11.3 row 4 — retention: newest 5 per id, filename-sort, never mtime", () => {
      it("prunes the -01 member of a six-backup set even when mtimes are shuffled", () => {
        const consumer = makeConsumerTree({});
        try {
          const id = "some-plugin-artifact";
          const { dir, names } = shuffledMtimes(consumer.root, id);
          expect(names).toHaveLength(6);

          const [result] = runProbe([`pdlc_prune_backups\t${dir}\t${id}`]);
          expect(result.ok).toBe(true);

          const remaining = readdirSync(dir).sort();
          // LC_ALL=C descending over fixed-width filenames is exactly reverse-chronological
          // (TSPEC §1.4/§11.3 row 4) — the newest 5 of `-01..-06` are `-02..-06`.
          const expectedKept = names.filter((n) => !n.endsWith("-01.bak")).sort();
          expect(remaining).toEqual(expectedKept);
          expect(remaining).toHaveLength(5);
          expect(remaining.some((n) => n.endsWith("-01.bak"))).toBe(false);
        } finally {
          consumer.cleanup();
        }
      });

      it("prunes the same -01 member with mtimes left at creation order (no shuffle)", () => {
        // The un-shuffled control: pruning by filename sort must agree with the shuffled case,
        // so the shuffle above is provably exercising the sort and not an accidental mtime
        // coincidence.
        const consumer = makeConsumerTree({});
        try {
          const id = "some-plugin-artifact";
          const { dir, names } = sameSecondBackups(consumer.root, id);

          const [result] = runProbe([`pdlc_prune_backups\t${dir}\t${id}`]);
          expect(result.ok).toBe(true);

          const remaining = readdirSync(dir).sort();
          const expectedKept = names.filter((n) => !n.endsWith("-01.bak")).sort();
          expect(remaining).toEqual(expectedKept);
        } finally {
          consumer.cleanup();
        }
      });
    });

    // ───────────────────────────── §11.3 row 2 ─────────────────────────────

    describe("§11.3 row 2 — C1's own `export LC_ALL=C` holds under an injected locale", () => {
      it("prunes to the same members whether the caller's env sets LC_ALL=C or en_US.UTF-8", () => {
        const consumerC = makeConsumerTree({});
        const consumerOther = makeConsumerTree({});
        try {
          const id = "some-plugin-artifact";
          const built1 = sameSecondBackups(consumerC.root, id);
          const built2 = sameSecondBackups(consumerOther.root, id);

          const path = makeToolDir(["bash", "git", "python3", "shasum", "sha1sum", "mv", "rm", "date", "printf", "mkdir"]);
          const baseEnv = {
            PATH: path,
            HOME: mkdtempSync(join(tmpdir(), "pdlc-lcall-home-")),
            TMPDIR: tmpdir(),
            TZ: "UTC",
          };

          const [resultC] = runProbe([`pdlc_prune_backups\t${built1.dir}\t${id}`], {
            env: { ...baseEnv, LC_ALL: "C", LANG: "C" },
          });
          const [resultOther] = runProbe([`pdlc_prune_backups\t${built2.dir}\t${id}`], {
            env: { ...baseEnv, LC_ALL: "en_US.UTF-8", LANG: "en_US.UTF-8" },
          });

          expect(resultC.ok).toBe(true);
          expect(resultOther.ok).toBe(true);

          // Red against an implementation relying on the CALLER's locale rather than its own
          // `export LC_ALL=C` (TSPEC §11.3 row 2): both runs must keep the identical set of
          // suffixes, regardless of which locale the caller's environment injected.
          const keptC = readdirSync(built1.dir).sort();
          const keptOther = readdirSync(built2.dir).sort();
          expect(keptOther).toEqual(keptC);
          expect(keptOther.some((n) => n.endsWith("-01.bak"))).toBe(false);
        } finally {
          consumerC.cleanup();
          consumerOther.cleanup();
        }
      });
    });

    // ───────────────────────────── O-18 clause (c) ─────────────────────────────

    describe("O-18 clause (c) — decoyBackupDir's identity-on-unknown-ids requirement", () => {
      it("never touches decoys, non-matching files, or a well-formed backup for an unknown id", () => {
        const consumer = makeConsumerTree({});
        try {
          const knownId = "known-id";
          const unknownId = "unknown-id";
          const { dir, stamp } = decoyBackupDir(consumer.root, knownId, { unknownId });
          const unknownBackupName = `${unknownId}.${stamp}-01.bak`;

          const before = readdirSync(dir).sort();
          expect(before).toContain("README.txt");
          expect(before).toContain("notabackup.bak");
          expect(before).toContain(unknownBackupName);

          const [result] = runProbe([`pdlc_prune_backups\t${dir}\t${knownId}`]);
          expect(result.ok).toBe(true);

          const after = readdirSync(dir).sort();
          // Identity elsewhere: every entry that is not `knownId`-shaped is byte-for-byte
          // present, unpruned — a stray file or an unknown id's backup is left alone forever
          // (FSPEC §1.4).
          expect(after).toContain("README.txt");
          expect(after).toContain("notabackup.bak");
          expect(after).toContain(unknownBackupName);

          // The known id's own six backups are still pruned to 5 in the same call.
          const knownRemaining = after.filter((n) => n.startsWith(`${knownId}.`));
          expect(knownRemaining).toHaveLength(5);
          expect(knownRemaining.some((n) => n.endsWith("-01.bak"))).toBe(false);
        } finally {
          consumer.cleanup();
        }
      });
    });

    // ───────────────────────────── FSPEC §1.4 exhaustion ─────────────────────────────

    describe("FSPEC §1.4 / TSPEC §13.5 — NN exhaustion is a write failure, not a silent reuse", () => {
      it("reports operation: backup and exits 4 when a stale row's id already has 99 backups", () => {
        // `nnExhausted` pre-populates 99 backups stamped with "now" (as measured in this
        // process) so the very next real `pdlc_backup` call — which stamps with its OWN,
        // independently-computed `date -u ...` a moment later — finds no free suffix. Under a
        // parallel, many-worker `npm test` run a scheduling delay between the two can
        // occasionally straddle a second boundary, which would manifest as a false-negative
        // (status 0 instead of 4) rather than a real defect — so this retries with a freshly
        // re-anchored "now" a bounded few times before failing, same rationale as any
        // wall-clock-coupled test needs under load.
        const MAX_ATTEMPTS = 5;
        let succeeded = false;
        for (let attempt = 0; attempt < MAX_ATTEMPTS && !succeeded; attempt++) {
          const consumer = makeConsumerTree({ git: true, claudeDir: true });
          const plugin = makePluginTree();
          try {
            const trees = { consumer, plugin };
            const staleRow = plugin.manifest.rows[0];
            setRowState(trees, staleRow.id, "stale");
            // 99 pre-existing backups for this row's id — one shy of the grammar's `01..99`
            // ceiling (TSPEC §11.1), so the very next backup attempt this sync run makes finds
            // no free suffix.
            nnExhausted(consumer.root, staleRow.id);

            const run = runScript("sync", {
              consumerRoot: consumer.root,
              home: consumer.home,
              pluginRoot: plugin.pluginRoot,
            });
            run.root = consumer.root;

            if (run.status !== 4) continue;

            // Assert BEFORE this iteration's `finally` tears the tree down.
            expect(run.status).toBe(4);
            // §4.7's negative: the destroying overwrite never proceeds, so the backup is
            // reported skipped with `operation: backup` (FSPEC §1.4/§5.6) rather than
            // `backup-verify` — the suffix search itself is what is exhausted, not a landed
            // backup's re-read.
            expectFailOpen(run, {
              path: staleRow.consumerPath,
              operation: "backup",
              entrypoint: "sync",
            });
            succeeded = true;
          } finally {
            consumer.cleanup();
            plugin.cleanup();
          }
        }

        if (!succeeded) {
          throw new Error(
            `nnExhausted: no attempt out of ${MAX_ATTEMPTS} landed on a same-stamp collision`
          );
        }
      });
    });
  }
);

// ═════════════════════════════════════════════════════════════════════════════════════════
// PLAN T-49 — PROPERTIES §6, the backup-grammar property suite (PROP-BKP-01…13).
//
// Spawn budget (PROPERTIES §1.4 row "§6 backup grammar" = 8 spawns). Every property below
// runs through a TSPEC §11.2 BATCHED driver — one spawn per property RUN, never one per
// case — and the eight spawns are taken in exactly three `beforeAll` blocks plus one `it`:
//
//   §6.3 fixture  : 1 × `runProbe` format batch (501 cases)  ─┐ PROP-BKP-01, -02, -03
//                   1 × `runProbe` parse  batch (500 cases)  ─┘
//   §6.4 fixture  : 1 × `runGrammar` locale-injected batch    → PROP-BKP-07 (see below)
//                   1 × `runProbe` prune over 500 names       → PROP-BKP-05, -06, -08
//   §6.5 fixture  : 1 × `runProbe` prune over D               → PROP-BKP-09, -10, -11
//                   1 × `runProbe` prune over D again         → PROP-BKP-12
//                   1 × `runProbe` prune over D' (mtimes inverted) → PROP-BKP-13
//   PROP-BKP-04   : 1 × `runScript("sync", …)` over `nnExhausted`
//
// Two deliberate deviations from §1.4's wording, both spawn-count-neutral:
//
//   (a) §6.3's two batches go through `bin/lib-probe.sh` (`runProbe`) rather than
//       `bin/backup-grammar.sh` (`runGrammar`). PROP-BKP-03's oracle is a CONJUNCTION —
//       "exit 1 AND prints nothing AND writes nothing" — and `backup-grammar.sh` collapses
//       the first two: it captures the function's stdout in a command substitution and
//       prints `err\tformat-failed` on any non-zero exit, so an implementation that printed
//       a partial parse *and* exited 1 (exactly the half PROPERTIES §6.3 calls out as the
//       falsifiable one) is indistinguishable from a silent rejection there. `lib-probe.sh`
//       reports the function's own exit status and its captured stdout as separate fields,
//       so both conjuncts are observable. Both drivers are §11.2 batched drivers; this is a
//       choice of driver, not of batching.
//
//   (b) PROP-BKP-07's locale injection goes through `runGrammar`, not `runProbe`, and it is
//       filed as a LEDGER RESIDUAL rather than green. `bin/lib-probe.sh` exports `LC_ALL=C`
//       in its own preamble, so a caller-injected `LC_ALL` never reaches C1 through it and
//       removing C1's own `export LC_ALL=C` cannot be observed — `backup-grammar.sh` exports
//       nothing and is therefore the only batched driver through which the injection is real.
//       Even there the mutation stays green; see FALSIFICATION-LEDGER-T-49.md's Residuals.
//
// Ownership: T-49 appends only below this banner and touches nothing above it (the T-30
// suite's `it()`s are its own; single-writer-per-file applies within the file's history, not
// within the file's contents).
// ═════════════════════════════════════════════════════════════════════════════════════════

// §1.3 rule 1: a fixed, printed, non-zero literal seed, overridable via `PDLC_PROP_SEED`.
const BKP_SEED = 0x424b5031; // "BKP1"

// TSPEC §3.2.1's probe allow-list, copied IN FULL (omitting `mkdir` silently breaks
// drift-state writes and reads exactly like a library defect). `dirname` is appended for the
// `runGrammar` sandbox only: `bin/backup-grammar.sh` resolves its own directory with
// `$(dirname "${BASH_SOURCE[0]}")`, so a PATH without `dirname` leaves `C1_PATH` unresolvable,
// every grammar function undefined, and the whole batch vacuously `err`.
const BKP_PROBE_TOOLS = Object.freeze([
  "bash",
  "git",
  "python3",
  "shasum",
  "sha1sum",
  "mv",
  "rm",
  "date",
  "printf",
  "mkdir",
]);
const BKP_GRAMMAR_TOOLS = Object.freeze([...BKP_PROBE_TOOLS, "dirname"]);

// ───────────────────────────── JS-side oracles (independent of C1) ─────────────────────────

/** `bin/lib-probe.sh` percent-encodes every emitted field (TSPEC §4.1); this reverses it. */
function decodeField(field) {
  return field.replace(/%([0-9A-Fa-f]{2})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function composeName(id, stamp, nn) {
  return `${id}.${stamp}-${nn}.bak`;
}

// The trailing-24-byte tail: `.` + stamp(16) + `-` + NN(2) + `.bak` (TSPEC §11.1).
const TAIL_RE = /^\.(\d{8}T\d{6}Z)-(\d{2})\.bak$/;

/** The JS oracle for `pdlc_backup_format` — `null` means "must be rejected". */
function jsFormat(id, stamp, nn) {
  if (!M6_ID_REGEX.test(id)) return null;
  if (!/^[0-9]+$/.test(nn)) return null;
  const value = Number.parseInt(nn, 10);
  if (value > 99) return null;
  return composeName(id, stamp, pad2(value));
}

/**
 * The JS oracle for `pdlc_backup_parse` — `null` means "must be rejected". Byte-oriented
 * (`Buffer`), not char-oriented: C1 slices the trailing 24 BYTES under `LC_ALL=C`, and the
 * generated set deliberately contains non-ASCII names.
 */
function jsParse(name) {
  const bytes = Buffer.from(name, "utf8");
  if (bytes.length <= 24) return null;
  const tail = bytes.subarray(bytes.length - 24).toString("latin1");
  const m = TAIL_RE.exec(tail);
  if (!m) return null;
  const id = bytes.subarray(0, bytes.length - 24).toString("utf8");
  if (!M6_ID_REGEX.test(id)) return null;
  return { id, stamp: m[1], nn: m[2] };
}

/** Descending `(stamp, nn)` — §6.4's order, computed from the PARSED tuple, never the name. */
function cmpTupleDesc(a, b) {
  if (a.stamp !== b.stamp) return a.stamp < b.stamp ? 1 : -1;
  if (a.nn !== b.nn) return a.nn < b.nn ? 1 : -1;
  return 0;
}

/** The instant a grammar-conforming, calendar-valid stamp denotes (PROP-BKP-06). */
function instantOf(stamp) {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(stamp);
  if (!m) throw new Error(`instantOf: not a grammar-conforming stamp: ${JSON.stringify(stamp)}`);
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
}

/** Keys present in exactly one map, or present in both with differing bytes. */
function mapDiff(a, b) {
  const diff = [];
  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const left = a.get(key);
    const right = b.get(key);
    if (left === undefined || right === undefined || !left.equals(right)) diff.push(key);
  }
  return diff.sort();
}

// ───────────────────────────── §6.2 generated case sets ─────────────────────────────

const RANDOM_ACCEPT_COUNT = 400;
const REJECT_COUNT = 100;

/**
 * Injectivity bait (PROP-BKP-02). 400 randomly drawn triples cannot falsify injectivity on
 * their own: a lossy `format` (one that truncates the id, pins the stamp, or drops `nn`) still
 * emits 400 distinct names, because the other two fields are drawn from spaces far too large to
 * collide by chance. These ten triples are constructed so that every single-field projection
 * collapses SOME pair — they differ in exactly one field at a time, and their ids share a first
 * byte and are prefixes of one another.
 */
const BAIT_STAMP_1 = "20260101T000000Z";
const BAIT_STAMP_2 = "20260101T000001Z";
const BAIT_TRIPLES = Object.freeze([
  { id: "bait-a", stamp: BAIT_STAMP_1, nn: "01" },
  { id: "bait-b", stamp: BAIT_STAMP_1, nn: "01" }, // vs bait-a: id differs after byte 1
  { id: "bait", stamp: BAIT_STAMP_1, nn: "01" }, // vs bait-a: id is a proper prefix
  { id: "b", stamp: BAIT_STAMP_1, nn: "01" }, // vs bait-a: same first byte only
  { id: "bait-a", stamp: BAIT_STAMP_1, nn: "02" }, // vs #1: `nn` alone differs
  { id: "bait-a", stamp: BAIT_STAMP_1, nn: "99" }, // vs #1: `nn` alone differs
  { id: "bait-a", stamp: BAIT_STAMP_2, nn: "01" }, // vs #1: stamp alone differs (by 1 second)
  { id: "bait-a", stamp: "29991231T235959Z", nn: "01" }, // vs #1: stamp alone differs
  { id: "dev.20260101T000000Z", stamp: BAIT_STAMP_1, nn: "01" }, // stamp-shaped id
  { id: "dev", stamp: BAIT_STAMP_1, nn: "01" }, // the left-to-right reading of the same bytes
]);

const ACCEPT_COUNT = RANDOM_ACCEPT_COUNT + BAIT_TRIPLES.length;

// Ids that fail `M6_ID_REGEX` (TSPEC §11.3 row 1): empty, non-alnum first byte, excluded
// bytes (`,` `:` space `/` `$` `\` `*` `?`), over-length, non-ASCII.
const BAD_IDS = Object.freeze([
  "",
  "-abc",
  ".abc",
  "_abc",
  "ab,cd",
  "ab:cd",
  "ab cd",
  "ab/cd",
  "ab$cd",
  "a".repeat(65),
  "ábc",
  "ab\\cd",
  "ab*cd",
  "ab?cd",
]);
// `nn` values outside `01..99` (TSPEC §11.1). `00` is deliberately ABSENT: §11.1's rejection
// clause is "`nn > 99` or `id` fails M6", so `00` is not a specified rejection and asserting
// one would be this test inventing a contract.
const BAD_NNS = Object.freeze(["100", "-1", "abc", "0100", "9999", ""]);

/**
 * 500 `format` cases: 400 accepts (with §6.2's adversarial floors FORCED, not hoped for) and
 * 100 rejects. Each case carries its own JS-oracle expectation, so a mutator that happens to
 * produce a well-formed value is scored correctly rather than assumed to be a rejection.
 */
function buildFormatCases(rng) {
  const cases = [];
  for (let i = 0; i < RANDOM_ACCEPT_COUNT; i++) {
    const force =
      i < 50 ? { stampShaped: true } : i < 100 ? { containsDot: true } : i < 125 ? { containsHyphen: true } : {};
    const id = genId(rng, force);
    const stamp = genStamp(rng, { calendarValid: i % 2 === 0 });
    const nn = pad2(rng.int(1, 99));
    cases.push({ id, stamp, nn, forced: force });
  }
  BAIT_TRIPLES.forEach((t) => cases.push({ ...t, forced: {} }));
  for (let i = 0; i < REJECT_COUNT; i++) {
    const slot = i % 20;
    const stamp = genStamp(rng, {});
    if (slot < BAD_IDS.length) {
      cases.push({ id: BAD_IDS[slot], stamp, nn: pad2(rng.int(1, 99)), forced: {} });
    } else {
      cases.push({ id: genId(rng), stamp, nn: BAD_NNS[slot - BAD_IDS.length], forced: {} });
    }
  }
  return cases.map((c) => ({ ...c, expected: jsFormat(c.id, c.stamp, c.nn) }));
}

/**
 * Ten name mutators, each targeting one byte-offset of the fixed 24-byte tail (or the id
 * portion in front of it). Offsets from the end: `.bak` = −4…−1, NN = −6…−5, `-` = −7,
 * stamp = −23…−8, `.` = −24.
 */
const NAME_MUTATORS = Object.freeze([
  (n) => n.slice(0, -4) + ".txt", // wrong extension
  (n) => n.slice(0, -7) + "_" + n.slice(-6), // `-` separator replaced
  (n) => n.slice(0, -6) + "A" + n.slice(-5), // non-digit in NN
  (n) => n.slice(0, -15) + "X" + n.slice(-14), // non-digit inside the stamp
  (n) => n.slice(0, -24) + "x" + n.slice(-23), // the leading `.` of the tail replaced
  (n) => n.slice(-24), // the bare tail: the EMPTY-id case (§6.3)
  (n) => "," + n.slice(-24), // one-byte id outside M6
  (n) => "a,b" + n.slice(-24), // multi-byte id outside M6
  (n) => n.slice(-10), // shorter than the 24-byte tail
  (n) => n.slice(0, -24) + n.slice(-23), // the tail's leading `.` deleted outright
]);

/** 500 `parse` cases: the 400 accepted names round-tripped, plus 100 mutated names. */
function buildParseCases(acceptedNames) {
  const cases = acceptedNames.map((name) => ({ name }));
  for (let i = 0; i < REJECT_COUNT; i++) {
    const source = acceptedNames[i % acceptedNames.length];
    cases.push({ name: NAME_MUTATORS[i % NAME_MUTATORS.length](source) });
  }
  return cases.map((c) => ({ ...c, expected: jsParse(c.name) }));
}

// ═════════════════════════ §6.3 — format/parse (PROP-BKP-01, -02, -03) ═════════════════════

describe("PROPERTIES §6.3 — the backup-name grammar (PROP-BKP-01, -02, -03)", () => {
  let sandbox;
  let scratchTmp;
  let formatCases;
  let parseCases;
  let formatResults;
  let parseResults;
  let m6DumpResult;
  let sandboxBefore;

  beforeAll(() => {
    const rng = seeded(resolveSeed(BKP_SEED));
    formatCases = buildFormatCases(rng);

    // The side-effect surface PROP-BKP-03's third conjunct watches: cwd, `$HOME`, and a
    // pre-populated backup directory, all under one snapshot root. `TMPDIR` points OUTSIDE it
    // — `lib-probe.sh` legitimately writes (and removes) one scratch file per case there, and
    // that is the driver's bookkeeping, not the subject's side effect.
    sandbox = mkdtempSync(join(tmpdir(), "pdlc-bkp-sandbox-"));
    scratchTmp = mkdtempSync(join(tmpdir(), "pdlc-bkp-scratch-"));
    mkdirSync(join(sandbox, "home"));
    mkdirSync(join(sandbox, "backups"));
    writeFileSync(join(sandbox, "backups", "canary.20260101T000000Z-01.bak"), "canary bytes");
    writeFileSync(join(sandbox, "cwd-canary.txt"), "cwd bytes");

    const env = {
      PATH: makeToolDir(BKP_PROBE_TOOLS),
      HOME: join(sandbox, "home"),
      TMPDIR: scratchTmp,
      LC_ALL: "C",
      LANG: "C",
      TZ: "UTC",
    };

    // Taken BEFORE the two spawns — a snapshot taken inside the `it()` would compare the
    // post-run tree with itself and pass vacuously.
    sandboxBefore = snapshotTree(sandbox);

    // SPAWN 1/8 — the format batch. The trailing `dump` case rides in the same spawn (§6.2
    // rule 1's cross-check: the JS `M6_ID_REGEX` and C1's `PDLC_M6_ID_REGEX` are one charset,
    // not two independently-maintained ones).
    const formatLines = formatCases.map((c) => `pdlc_backup_format\t${c.id}\t${c.stamp}\t${c.nn}`);
    const results = runProbe([...formatLines, "dump\tPDLC_M6_ID_REGEX"], { env, cwd: sandbox });
    formatResults = results.slice(0, formatLines.length);
    m6DumpResult = results[results.length - 1];

    const acceptedNames = formatCases.filter((c) => c.expected !== null).map((c) => c.expected);
    parseCases = buildParseCases(acceptedNames);

    // SPAWN 2/8 — the parse batch.
    parseResults = runProbe(
      parseCases.map((c) => `pdlc_backup_parse\t${c.name}`),
      { env, cwd: sandbox }
    );
  }, 120000);

  afterAll(() => {
    if (sandbox) rmSync(sandbox, { recursive: true, force: true });
    if (scratchTmp) rmSync(scratchTmp, { recursive: true, force: true });
  });

  it("the generated set clears §6.2's adversarial floors before any property runs", () => {
    const accepts = formatCases.filter((c) => c.expected !== null);
    expect(accepts).toHaveLength(ACCEPT_COUNT);
    expect(formatCases).toHaveLength(ACCEPT_COUNT + REJECT_COUNT);

    // §6.2 rule 2: stamp-shaped ids are a FLOOR of the generated set, asserted about the set
    // itself — a run in which none happened to be drawn would prove nothing about the
    // fixed-offset parse's immunity to ambiguity.
    const stampShaped = accepts.filter((c) => /\d{8}T\d{6}Z/.test(c.id));
    const withDot = accepts.filter((c) => c.id.includes("."));
    const withHyphen = accepts.filter((c) => c.id.includes("-"));
    expect(stampShaped.length).toBeGreaterThanOrEqual(ACCEPT_COUNT * 0.1);
    expect(withDot.length).toBeGreaterThanOrEqual(ACCEPT_COUNT * 0.1);
    expect(withHyphen.length).toBeGreaterThanOrEqual(ACCEPT_COUNT * 0.05);

    // PROP-BKP-02's bait is a floor of the set too — without it, a lossy `format` still emits
    // 400 distinct names and injectivity passes vacuously.
    BAIT_TRIPLES.forEach((t) => {
      expect(accepts.some((c) => c.id === t.id && c.stamp === t.stamp && c.nn === t.nn)).toBe(true);
    });

    // The rejection halves are floors too, in both directions.
    expect(formatCases.filter((c) => c.expected === null).length).toBeGreaterThanOrEqual(REJECT_COUNT);
    expect(parseCases.filter((c) => c.expected === null).length).toBeGreaterThanOrEqual(50);
    expect(parseCases.filter((c) => c.expected !== null).length).toBeGreaterThanOrEqual(ACCEPT_COUNT);
    // The empty-id case (§6.3) is present by construction, not by luck.
    expect(parseCases.some((c) => c.name.length === 24 && TAIL_RE.test(c.name))).toBe(true);
  });

  it("§6.2 rule 1 — C1's id charset IS `M6_ID_REGEX`, not a re-declaration of it", () => {
    expect(m6DumpResult.ok).toBe(true);
    expect(m6DumpResult.fields[0]).toBe("0");
    expect(decodeField(m6DumpResult.fields[1])).toBe(M6_ID_REGEX.source);
  });

  it("PROP-BKP-01 — round-trip: parse(format(id, stamp, nn)) == (id, stamp, nn), byte for byte", () => {
    const accepts = [];
    formatCases.forEach((c, i) => {
      if (c.expected === null) return;
      const r = formatResults[i];
      expect(r.ok).toBe(true);
      // `parseProbeLine` strips only the `ok` tag: `fields[0]` is ALWAYS the invoked
      // function's own exit status, and its captured values start at `fields[1]`.
      expect(`${c.id} ${c.stamp} ${c.nn} -> ${r.fields[0]}:${decodeField(r.fields[1] || "")}`).toBe(
        `${c.id} ${c.stamp} ${c.nn} -> 0:${c.expected}`
      );
      accepts.push(c);
    });
    expect(accepts).toHaveLength(ACCEPT_COUNT);

    // ...and back again, field by field, over the same 400 names.
    parseCases.forEach((c, i) => {
      if (c.expected === null) return;
      const r = parseResults[i];
      const observed = { status: r.fields[0], value: r.fields.slice(1).map(decodeField).join("\t") };
      expect(`${c.name} => ${observed.status}:${observed.value}`).toBe(
        `${c.name} => 0:${c.expected.id}\t${c.expected.stamp}\t${c.expected.nn}`
      );
    });
    // The round-trip's own closure: every accepted triple came back identical.
    accepts.forEach((c) => {
      const round = jsParse(c.expected);
      expect(round).toEqual({ id: c.id, stamp: c.stamp, nn: c.nn });
    });
  });

  it("PROP-BKP-02 — `format` is injective over the generated triples", () => {
    const byName = new Map();
    formatCases.forEach((c, i) => {
      if (c.expected === null) return;
      const name = formatResults[i].fields[1] === undefined ? c.expected : decodeField(formatResults[i].fields[1]);
      const triple = `${c.id}\t${c.stamp}\t${c.nn}`;
      if (byName.has(name)) {
        // Collision => injectivity violated, unless the two triples are identical.
        expect(`${name}: ${byName.get(name)}`).toBe(`${name}: ${triple}`);
      }
      byName.set(name, triple);
    });
    // A vacuous pass (every triple colliding into one name) is impossible: the map must hold
    // one entry per distinct generated triple.
    const distinctTriples = new Set(
      formatCases.filter((c) => c.expected !== null).map((c) => `${c.id}\t${c.stamp}\t${c.nn}`)
    );
    expect(byName.size).toBe(distinctTriples.size);
  });

  it("PROP-BKP-03 — rejection is total: exit 1, prints nothing, writes nothing anywhere", () => {
    const before = sandboxBefore;
    let rejections = 0;

    formatCases.forEach((c, i) => {
      const r = formatResults[i];
      expect(r.ok).toBe(true); // the driver resolved the function in every case
      if (c.expected !== null) {
        expect(r.fields[0]).toBe("0");
        return;
      }
      rejections++;
      // Conjunct 1: exit 1. Conjunct 2: NOTHING on stdout — `lib-probe.sh` emits a value
      // field only when the captured stdout is non-empty, so `fields.length === 1` (status
      // alone) is exactly "printed nothing".
      expect(`format ${JSON.stringify(c.id)}/${c.nn} -> ${r.fields.join("|")}`).toBe(
        `format ${JSON.stringify(c.id)}/${c.nn} -> 1`
      );
    });

    parseCases.forEach((c, i) => {
      const r = parseResults[i];
      expect(r.ok).toBe(true);
      if (c.expected !== null) return;
      rejections++;
      expect(`parse ${JSON.stringify(c.name)} -> ${r.fields.join("|")}`).toBe(
        `parse ${JSON.stringify(c.name)} -> 1`
      );
    });

    expect(rejections).toBeGreaterThanOrEqual(REJECT_COUNT);

    // Conjunct 3, the total one: cwd, `$HOME` and the pre-populated backup directory are
    // byte-for-byte what they were before the two batches ran. `snapshotTree` walks
    // recursively, so a stray file at any depth is caught, not just a mutated known one.
    assertTreeUnchanged(sandbox, before);
    expect(mapDiff(before, snapshotTree(sandbox))).toEqual([]);
    expect(existsSync(join(sandbox, "backups", "canary.20260101T000000Z-01.bak"))).toBe(true);
  });
});

// ═════════════════ §6.4 — order (PROP-BKP-05, -06, -07, -08) ═══════════════════════════════

const SORT_IDS = 5;
const SORT_PER_ID = 100;

/**
 * `SORT_IDS × SORT_PER_ID` backups in one directory, all for KNOWN ids, all calendar-valid.
 * The keep/drop boundary of one id is deliberately decided by `nn` alone (ranks 5 and 6 share
 * a stamp) — that is PROP-BKP-08's "newest is well-defined" made falsifiable: a comparator
 * that orders on the stamp alone cannot get that boundary right.
 */
function buildSortTree(rng) {
  const dir = mkdtempSync(join(tmpdir(), "pdlc-bkp-sort-"));
  const ids = [];
  const byId = new Map();

  for (let k = 0; k < SORT_IDS; k++) {
    const id = `s${k}.${genId(rng)}`.slice(0, 48);
    ids.push(id);

    const stamps = new Set();
    while (stamps.size < SORT_PER_ID) stamps.add(genStamp(rng, { calendarValid: true }));
    const ordered = [...stamps].sort().reverse();
    const entries = ordered.map((stamp) => ({ id, stamp, nn: pad2(rng.int(1, 99)) }));

    // Force the rank-5/rank-6 boundary onto `nn`.
    entries[5].stamp = entries[4].stamp;
    entries[4].nn = "50";
    entries[5].nn = "49";

    entries.forEach((e) => {
      e.name = composeName(e.id, e.stamp, e.nn);
      writeFileSync(join(dir, e.name), `bytes for ${e.name}`);
    });
    byId.set(id, entries);
  }
  return { dir, ids, byId };
}

describe("PROPERTIES §6.4 — order (PROP-BKP-05, -06, -07, -08)", () => {
  let tree;
  let survivors;
  let localeResults;
  let localeCases;

  beforeAll(() => {
    const rng = seeded(resolveSeed(BKP_SEED ^ 0x5f));
    tree = buildSortTree(rng);

    // SPAWN 3/8 — the sort run: ONE prune over all `SORT_IDS × SORT_PER_ID` names.
    const [result] = runProbe([`pdlc_prune_backups\t${tree.dir}\t${tree.ids.join("\t")}`]);
    expect(result.ok).toBe(true);
    expect(result.fields[0]).toBe("0"); // TSPEC §11.1: prune always exits 0
    survivors = new Set(readdirSync(tree.dir));

    // SPAWN 4/8 — PROP-BKP-07's locale-injected batch, through `backup-grammar.sh` (the only
    // batched driver that does not pin `LC_ALL` itself, see this section's banner). The
    // driver's `read -r kind a b c` with `IFS=$'\t'` COLLAPSES consecutive tabs (bash treats
    // tab as IFS whitespace), so a case with an empty field cannot be expressed through it —
    // the empty-id case is dropped here and is covered by PROP-BKP-03 through `lib-probe.sh`,
    // whose `split_tab_fields` preserves empty fields.
    const localeRng = seeded(resolveSeed(BKP_SEED));
    const formatCases = buildFormatCases(localeRng).filter((c) => c.id !== "");
    const parseCases = buildParseCases(
      formatCases.filter((c) => c.expected !== null).map((c) => c.expected)
    );
    localeCases = [
      ...formatCases.map((c) => ({ kind: "format", label: `${c.id}/${c.stamp}/${c.nn}`, expected: c.expected })),
      ...parseCases.map((c) => ({
        kind: "parse",
        label: c.name,
        expected: c.expected === null ? null : `${c.expected.id}\t${c.expected.stamp}\t${c.expected.nn}`,
      })),
    ];
    const lines = [
      ...formatCases.map((c) => `format\t${c.id}\t${c.stamp}\t${c.nn}`),
      ...parseCases.map((c) => `parse\t${c.name}`),
    ];
    localeResults = runGrammar(lines, {
      env: {
        PATH: makeToolDir(BKP_GRAMMAR_TOOLS),
        HOME: mkdtempSync(join(tmpdir(), "pdlc-bkp-locale-home-")),
        TMPDIR: tmpdir(),
        LC_ALL: "en_US.UTF-8",
        LANG: "en_US.UTF-8",
        TZ: "UTC",
      },
    });
  }, 120000);

  afterAll(() => {
    if (tree) rmSync(tree.dir, { recursive: true, force: true });
  });

  it("PROP-BKP-05 — `LC_ALL=C` descending filename sort == descending `(stamp, nn)`", () => {
    // Half 1 (statement about strings, JS-side): over each id's 100 names, the byte-wise
    // descending name order and the descending parsed-tuple order are the same sequence.
    for (const id of tree.ids) {
      const entries = tree.byId.get(id);
      const byName = entries.map((e) => e.name).sort().reverse();
      const byTuple = [...entries].sort(cmpTupleDesc).map((e) => e.name);
      expect(byName).toEqual(byTuple);
    }

    // Half 2 (statement about the SUBJECT): the surviving set is exactly the 5 greatest per
    // id under that order — the only place C1's own sort is observable.
    const expected = new Set();
    for (const id of tree.ids) {
      [...tree.byId.get(id)]
        .sort(cmpTupleDesc)
        .slice(0, 5)
        .forEach((e) => expected.add(e.name));
    }
    expect([...survivors].sort()).toEqual([...expected].sort());
    expect(survivors.size).toBe(SORT_IDS * 5);
  });

  it("PROP-BKP-06 — descending `(stamp, nn)` == reverse-chronological", () => {
    for (const id of tree.ids) {
      const entries = tree.byId.get(id);
      const desc = [...entries].sort(cmpTupleDesc);
      // The tuple order never runs backwards in time.
      for (let i = 1; i < desc.length; i++) {
        expect(instantOf(desc[i - 1].stamp)).toBeGreaterThanOrEqual(instantOf(desc[i].stamp));
      }
      // ...and the subject kept the chronologically latest members: no dropped backup is
      // strictly newer than any kept one.
      const kept = entries.filter((e) => survivors.has(e.name));
      const dropped = entries.filter((e) => !survivors.has(e.name));
      const oldestKept = Math.min(...kept.map((e) => instantOf(e.stamp)));
      dropped.forEach((e) => {
        expect(instantOf(e.stamp)).toBeLessThanOrEqual(oldestKept);
      });
    }
  });

  it("PROP-BKP-07 — the governing locale is the subject's, not the caller's", () => {
    // Falsification target: C1's own `export LC_ALL=C` (TSPEC §2.5). See this file's banner
    // and FALSIFICATION-LEDGER-T-49.md — filed as a residual, because removing that export
    // leaves every observable below unchanged on this platform.
    localeCases.forEach((c, i) => {
      const r = localeResults[i];
      if (c.expected === null) {
        expect(`${c.kind} ${c.label} -> ${r.ok}`).toBe(`${c.kind} ${c.label} -> false`);
        return;
      }
      expect(`${c.kind} ${c.label} -> ${r.ok}:${r.fields.join("\t")}`).toBe(
        `${c.kind} ${c.label} -> true:${c.expected}`
      );
    });
    expect(localeCases.filter((c) => c.expected === null).length).toBeGreaterThanOrEqual(REJECT_COUNT);
  });

  it("PROP-BKP-08 — `newest` is well-defined and total over each id's backups", () => {
    for (const id of tree.ids) {
      const entries = tree.byId.get(id);
      // Totality: no two backups of one id share `(stamp, nn)`, so the descending order has a
      // unique head (this is PROP-BKP-02 restated over the on-disk set, asserted rather than
      // derived because AT-8b/AT-26 depend on it).
      const tuples = new Set(entries.map((e) => `${e.stamp}-${e.nn}`));
      expect(tuples.size).toBe(entries.length);

      const desc = [...entries].sort(cmpTupleDesc);
      expect(cmpTupleDesc(desc[0], desc[1])).toBe(-1); // strict: the head is unique
      expect(survivors.has(desc[0].name)).toBe(true);

      // The keep/drop boundary of this id is decided by `nn` alone: ranks 5 and 6 share a
      // stamp, so a comparator that reads only the stamp cannot place them.
      expect(desc[4].stamp).toBe(desc[5].stamp);
      expect(survivors.has(desc[4].name)).toBe(true);
      expect(survivors.has(desc[5].name)).toBe(false);
    }
  });
});

// ═════════════════ §6.5 — prune clauses (a)–(d) (PROP-BKP-09…13) ═══════════════════════════

const KNOWN_COUNTS = Object.freeze([0, 3, 7, 12]);
const UNKNOWN_COUNTS = Object.freeze([3, 8]);

/**
 * §6.5's generated directory: 4 known ids (0–12 backups each), 2 unknown ids, and 5
 * non-matching entries including a sub-directory. Deterministic in `rng`, so two calls with
 * the same seed produce byte-identical trees in different directories — which is what lets
 * PROP-BKP-13 re-shuffle mtimes over an otherwise identical `D`.
 */
function buildPruneTree(rng, label) {
  const dir = mkdtempSync(join(tmpdir(), `pdlc-bkp-${label}-`));
  const knownIds = [];
  const byId = new Map();
  const others = [];

  const emit = (id, count) => {
    const stamps = new Set();
    while (stamps.size < count) stamps.add(genStamp(rng, { calendarValid: true }));
    const entries = [...stamps].sort().map((stamp) => {
      const nn = pad2(rng.int(1, 99));
      const name = composeName(id, stamp, nn);
      writeFileSync(join(dir, name), `bytes for ${name}`);
      return { id, stamp, nn, name };
    });
    byId.set(id, entries);
    return entries;
  };

  KNOWN_COUNTS.forEach((count, k) => {
    const id = `k${k}.${genId(rng)}`.slice(0, 48);
    knownIds.push(id);
    emit(id, count);
  });
  UNKNOWN_COUNTS.forEach((count, k) => {
    const id = `u${k}.${genId(rng)}`.slice(0, 48);
    emit(id, count).forEach((e) => others.push(e.name));
  });

  // Non-matching entries (§6.5): a plain file, a `.bak` that fails the grammar, a well-formed
  // tail with an EMPTY id, a backup whose id carries a byte outside M6, and a sub-directory.
  const decoys = [
    ["README.txt", "not a backup"],
    ["notabackup.bak", "does not match the grammar"],
    [".20260101T000000Z-01.bak", "well-formed tail, empty id"],
    ["bad,id.20260101T000000Z-01.bak", "id outside M6"],
  ];
  decoys.forEach(([name, bytes]) => {
    writeFileSync(join(dir, name), bytes);
    others.push(name);
  });
  mkdirSync(join(dir, "sub"));
  writeFileSync(join(dir, "sub", "keepme.txt"), "a file inside a sub-directory");
  others.push(join("sub", "keepme.txt"));

  return { dir, knownIds, byId, others };
}

/** Sets every file's mtime under `dir` from `order(name) -> rank`, newest rank first. */
function setMtimes(dir, names, rankOf) {
  const base = Math.floor(Date.now() / 1000);
  names.forEach((name) => {
    utimesSync(join(dir, name), base - rankOf(name) * 60, base - rankOf(name) * 60);
  });
}

describe("PROPERTIES §6.5 — prune clauses (a)–(d) (PROP-BKP-09, -10, -11, -12, -13)", () => {
  let d;
  let dPrime;
  let before;
  let after1;
  let after2;
  let after3;
  let expectedKeep;
  let expectedRemove;

  beforeAll(() => {
    d = buildPruneTree(seeded(resolveSeed(BKP_SEED ^ 0xa7)), "prune");

    // §6.5/TSPEC §13.5: mtimes shuffled AFTER creation, so mtime order carries no information
    // about filename order.
    const files = readdirSync(d.dir).filter((n) => n !== "sub");
    const shuffled = seeded(resolveSeed(BKP_SEED ^ 0x11)).shuffle(files);
    setMtimes(d.dir, files, (n) => shuffled.indexOf(n));

    before = snapshotTree(d.dir);

    expectedKeep = new Set();
    expectedRemove = new Set();
    for (const id of d.knownIds) {
      const desc = [...d.byId.get(id)].sort(cmpTupleDesc);
      desc.slice(0, 5).forEach((e) => expectedKeep.add(e.name));
      desc.slice(5).forEach((e) => expectedRemove.add(e.name));
    }

    const caseLine = `pdlc_prune_backups\t${d.dir}\t${d.knownIds.join("\t")}`;

    // SPAWN 5/8 — clauses (a)/(b)/(c).
    const [first] = runProbe([caseLine]);
    expect(first.ok).toBe(true);
    expect(first.fields[0]).toBe("0");
    after1 = snapshotTree(d.dir);

    // SPAWN 6/8 — clause (d), idempotence.
    const [second] = runProbe([caseLine]);
    expect(second.ok).toBe(true);
    expect(second.fields[0]).toBe("0");
    after2 = snapshotTree(d.dir);

    // SPAWN 7/8 — PROP-BKP-13: the same `D`, rebuilt byte-for-byte, with mtimes INVERTING the
    // filename order (the oldest filename gets the newest mtime).
    dPrime = buildPruneTree(seeded(resolveSeed(BKP_SEED ^ 0xa7)), "prune-mtime");
    const primeFiles = readdirSync(dPrime.dir)
      .filter((n) => n !== "sub")
      .sort();
    setMtimes(dPrime.dir, primeFiles, (n) => primeFiles.length - 1 - primeFiles.indexOf(n));
    const [third] = runProbe([`pdlc_prune_backups\t${dPrime.dir}\t${dPrime.knownIds.join("\t")}`]);
    expect(third.ok).toBe(true);
    expect(third.fields[0]).toBe("0");
    after3 = snapshotTree(dPrime.dir);
  }, 120000);

  afterAll(() => {
    if (d) rmSync(d.dir, { recursive: true, force: true });
    if (dPrime) rmSync(dPrime.dir, { recursive: true, force: true });
  });

  it("the generated directory covers §6.5's shape before any property runs", () => {
    expect(d.knownIds).toHaveLength(KNOWN_COUNTS.length);
    KNOWN_COUNTS.forEach((count, k) => {
      expect(d.byId.get(d.knownIds[k])).toHaveLength(count);
    });
    expect(d.others.length).toBeGreaterThanOrEqual(UNKNOWN_COUNTS[0] + UNKNOWN_COUNTS[1] + 5);
    expect(expectedRemove.size).toBeGreaterThan(0); // a no-op prune would prove nothing
    // `D` and `D'` are the same tree, so PROP-BKP-13's only difference is the mtimes.
    expect(mapDiff(before, snapshotTree(dPrime.dir)).filter((n) => !expectedRemove.has(n))).toEqual([]);
  });

  it("PROP-BKP-09 — keep-set correctness (clause a): min(n, 5) greatest per known id", () => {
    for (const id of d.knownIds) {
      const entries = d.byId.get(id);
      const desc = [...entries].sort(cmpTupleDesc);
      const kept = [...after1.keys()].filter((n) => entries.some((e) => e.name === n)).sort();
      const wanted = desc.slice(0, Math.min(entries.length, 5)).map((e) => e.name).sort();
      expect(`${id}: ${kept.join(",")}`).toBe(`${id}: ${wanted.join(",")}`);
      expect(kept).toHaveLength(Math.min(entries.length, 5));
    }
  });

  it("PROP-BKP-10 — removal-set correctness (clause b): exactly the rest, nothing else", () => {
    const gone = [...before.keys()].filter((n) => !after1.has(n)).sort();
    expect(gone).toEqual([...expectedRemove].sort());
    // The post-directory is the pre-directory minus exactly that set — no additions either.
    const added = [...after1.keys()].filter((n) => !before.has(n));
    expect(added).toEqual([]);
    expect(after1.size).toBe(before.size - expectedRemove.size);
  });

  it("PROP-BKP-11 — identity elsewhere (clause c), including across repeated prunes", () => {
    for (const name of d.others) {
      expect(after1.has(name)).toBe(true);
      expect(after1.get(name).equals(before.get(name))).toBe(true);
      // "left alone forever": still byte-identical after a SECOND prune.
      expect(after2.get(name).equals(before.get(name))).toBe(true);
    }
    // Nothing outside the known ids' backups was touched at all.
    const touched = mapDiff(before, after1).filter((n) => !expectedRemove.has(n));
    expect(touched).toEqual([]);
  });

  it("PROP-BKP-12 — idempotence (clause d): prune(prune(D)) == prune(D), byte for byte", () => {
    expect(mapDiff(after1, after2)).toEqual([]);
    expect([...after2.keys()].sort()).toEqual([...after1.keys()].sort());
  });

  it("PROP-BKP-13 — mtime is never read at the prune site", () => {
    // `D'` differs from `D` in mtimes ONLY, and its mtimes invert the filename order
    // completely — so any selector that reached for `ls -t` would keep a different set here.
    expect(mapDiff(after1, after3)).toEqual([]);
    expect([...after3.keys()].sort()).toEqual([...after1.keys()].sort());
    // The paired positive assertion (§6.5): on the fixed `sameSecondBackups` shape the pruned
    // member is `-01` — asserted by this file's TSPEC §11.3 row 4 suite above; here the
    // generalisation is what carries the property.
    expect([...after3.keys()].some((n) => expectedRemove.has(n))).toBe(false);
  });
});

// ═════════════════ §6.3's finiteness, made operator-visible (PROP-BKP-04) ═══════════════════

describeOrSkip(
  "PROPERTIES §6.3 — NN exhaustion is a write failure (PROP-BKP-04)",
  "hash",
  ["PROP-BKP-04: `NN` exhaustion surfaces as `operation: backup`, exit 4, with the pre-existing backups byte-unchanged"],
  () => {
    it("PROP-BKP-04 — exhaustion reports `operation: backup`, exits 4, and destroys nothing", () => {
      // SPAWN 8/8. Same wall-clock coupling as the §11.3 suite above: the library computes its
      // own `date -u` stamp seconds after this fixture is built, so `nnExhausted`'s
      // pre-populated window of second-offsets is what makes the collision real. The bounded
      // retry only re-anchors "now"; every `expect` stays inside the `try`, before the
      // `finally` destroys the tree.
      const MAX_ATTEMPTS = 5;
      let succeeded = false;
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !succeeded; attempt++) {
        const consumer = makeConsumerTree({ git: true, claudeDir: true });
        const plugin = makePluginTree();
        try {
          const trees = { consumer, plugin };
          const staleRow = plugin.manifest.rows[0];
          setRowState(trees, staleRow.id, "stale");
          const built = nnExhausted(consumer.root, staleRow.id);

          const backupsBefore = snapshotTree(built.dir);
          expect(backupsBefore.size).toBeGreaterThanOrEqual(99);

          const run = runScript("sync", {
            consumerRoot: consumer.root,
            home: consumer.home,
            pluginRoot: plugin.pluginRoot,
          });
          run.root = consumer.root;

          if (run.status !== 4) continue;

          // Conjunct 1 — the exact operation token, and conjunct 2 — exit 4 (FSPEC §1.4/§5.6):
          // the suffix SEARCH is exhausted, so no backup ever landed and the failure is
          // `backup`, never `backup-verify`.
          expectFailOpen(run, {
            path: staleRow.consumerPath,
            operation: "backup",
            entrypoint: "sync",
          });

          // Conjunct 3 — the destroying operation did not proceed: every pre-existing backup
          // is byte-unchanged, and none was silently reused (no name was overwritten).
          const backupsAfter = snapshotTree(built.dir);
          for (const [name, bytes] of backupsBefore) {
            expect(backupsAfter.has(name)).toBe(true);
            expect(backupsAfter.get(name).equals(bytes)).toBe(true);
          }
          succeeded = true;
        } finally {
          consumer.cleanup();
          plugin.cleanup();
        }
      }

      if (!succeeded) {
        throw new Error(
          `PROP-BKP-04: no attempt out of ${MAX_ATTEMPTS} landed on a same-stamp collision`
        );
      }
    }, 60000);
  }
);
