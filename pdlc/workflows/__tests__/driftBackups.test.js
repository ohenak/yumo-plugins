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
import { existsSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { describeOrSkip } from "./helpers/driftCapabilities.js";
import { makeToolDir, runScript, expectFailOpen } from "./helpers/driftHarness.js";
import { runProbe } from "./helpers/driftProbe.js";
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

          expect(run.status).toBe(4);
          // §4.7's negative: the destroying overwrite never proceeds, so the backup is
          // reported skipped with `operation: backup` (FSPEC §1.4/§5.6) rather than
          // `backup-verify` — the suffix search itself is what is exhausted, not a landed
          // backup's re-read.
          expectFailOpen(run, { path: staleRow.consumerPath, operation: "backup", entrypoint: "sync" });
        } finally {
          consumer.cleanup();
          plugin.cleanup();
        }
      });
    });
  }
);
