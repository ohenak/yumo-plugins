// consolidationLifecycle.test.js — PLAN T23 (RED, describe.skip).
//
// Two blocks, both owned by T31 (`main()` does not exist yet — T02's skeleton throws
// "not implemented yet" unconditionally, PLAN batch 2; T31 lands in batch 10). PLAN
// un-skips both blocks as-is, per the convention `consolidationRung.test.js` states at
// its own header: the owning task does not rewrite these cases, it removes the
// `describe.skip` wrapper.
//
// ── Block 1 — T-13, await discipline across `finishPass` (TSPEC §10.1, §11.2; §12.2's
//    T-13 row) ────────────────────────────────────────────────────────────────────────
//
// `finishPass`'s three terminal steps (appendTerminalRow / commitConsumingRepoPaths /
// releaseMarker) are seam writes reached through module functions, so neither §11.3(c)'s
// identifier scan nor any *sync*-double suite can see a missing `await` inside it — an
// un-awaited promise settles before a sync double's caller notices. The oracle TSPEC
// states is therefore driven under the **macrotask-deferring** variants of the doubles
// (`consolidationDoubles.js`'s `asAsync`, wrapping `_appendFile` / `_writeFile` / `_git`)
// and asserted **after `main()`'s promise resolves** — not inside the pass, not from the
// report — for (i) the terminal row present in the log double's accumulated text and
// (ii) the marker **released**: the write double's **last** recorded contents for
// `docs/_decisions/.consolidation-lock` match `RELEASED: {passId} {ISO-8601}` (the
// sentinel FSPEC BR-14a decides, TSPEC §7.3), having been the `IN-PROGRESS: {passId} …`
// line earlier in the same double's recorded write history. Conjunct (ii)'s take-side
// precondition is load-bearing: a bare absence of the released form is equally true of a
// `refused` or `skipped-cadence` fixture (§10.3 row 5a's own obligation, not this one's),
// so the case is written against a fixture that both takes and releases.
//
// `asAsync` defers on a **macrotask** (`setTimeout(…, 0)`), never a microtask — a
// microtask deferral would be drained by this test's own `await main(...)` and green
// both conjuncts on the broken (un-awaited) implementation. Hygiene TSPEC states as
// required of this row: every double is constructed fresh, **per case, inside the case
// body** (never hoisted to module scope), and the event-loop drain that lets the deferred
// promises settle runs in a `finally` — `try { …assertions… } finally { await new
// Promise((r) => setTimeout(r, 0)); }` — because after the assertions is the one place it
// cannot run: on the broken implementation the first assertion throws before draining.
//
// The mutation check TSPEC §11.2 requires (delete one `await` inside `finishPass`,
// observe this case go RED, restore) is T31's own obligation to discharge when it lands
// the row — it cannot be performed against a skeleton that throws unconditionally.
//
// ── Block 2 — release across the six terminal statuses (TSPEC §7.3, §10.1, §12.1
//    CONS-03; §12.2's un-numbered row) ─────────────────────────────────────────────────
//
// FSPEC §4.3's table is a closed, six-member enumeration of what `releaseMarker` does per
// terminal status: `promoted`, `promoted-degraded`, `no-op`, `failed` ⇒ taken **and**
// released at step 16; `refused` and `skipped-cadence` ⇒ **neither**. The case below
// ranges over the module's own frozen `TERMINAL_STATUSES` (a runtime value, §6.4) —
// never a literal list retyped here and never §6.1's `TerminalStatus`, which is a
// `ts`-fence type with no runtime existence in these plain ES modules. Ranging over a
// constant of the module under test would ordinarily be an implementation echo; it is
// legitimate here **only because** §11.3(b)'s fourth leg independently pins that
// catalogue against `docs/_constraints/pdlc-consolidation-vocabularies.md` §1's table (a
// three-way set equality, `consolidationReport.test.js`'s AT-L5 case, T24), so a
// maintainer who deletes a status from the catalogue reds there before this table can
// shrink with it.
//
// The oracle is **set equality over the catalogue, not containment**: the table's key set
// (this test's fixture map) is asserted set-equal to `TERMINAL_STATUSES`, so a dropped
// arm reds rather than passing on the survivors — the arm most likely to be dropped is
// `failed`, the only one reached from step 8 (§10.2's caught rejection) rather than
// step 14.
//
// The `refused` fixture is keyed on the **observed-fresh-marker** refusal (AT-M1, FSPEC
// §12.1 S-09) — a marker already `IN-PROGRESS:` and not yet stale, so this pass's own
// `takeMarker` never lands. This is deliberately **not** §10.3 row 5a's failed-take
// `refused` (a pass that wrote its own `IN-PROGRESS:` line and then refused downstream),
// whose observed pair is `{taken: true, released: false}` and which is row 5a's own
// obligation, not this table's — keying on the status alone without that distinction
// would make this row red on correct code for an implementer who reached for the row-5a
// fixture instead.

import main, { TERMINAL_STATUSES } from "../consolidate-learnings.js";
import { fakeFs, fakeListFiles } from "./helpers/seams.js";
import {
  fakeGit,
  fakeGhRun,
  makeAgentDouble,
  fakeNow,
  FIXED_NOW_MS,
  fakeEnvPresent,
  fakeMakeTempDir,
  asAsync,
} from "./helpers/consolidationDoubles.js";

const MARKER_PATH = "docs/_decisions/.consolidation-lock";
const LOG_PATH = "docs/_decisions/.consolidation-log.md";

// `_now` is fixed at 2025-01-01T00:00:00.000Z (`FIXED_NOW_MS`, `mergeDoubles.js`), so a
// pass driven against a blank log/marker mints `{today}-1` (TSPEC §7.2's `mintPassId`
// with no prior `pass:` field to derive a suffix from) — one literal both blocks share.
const FRESH_PASS_ID = "2025-01-01-1";

/**
 * The write double's recorded history for the marker path, oldest first — `fakeFs`
 * accumulates one entry per `_writeFile` call rather than only a current-state map
 * (`__tests__/helpers/seams.js:248,278-283`), which is what makes "taken, THEN released"
 * assertable rather than only "currently released".
 */
function markerWriteHistory(fs) {
  return fs.writes.filter((w) => w.path === MARKER_PATH).map((w) => w.contents);
}

/**
 * `{taken, released}` against the marker's own recorded write history (TSPEC §7.3,
 * §12.2's un-numbered row): `taken` iff an `IN-PROGRESS: {passId} …` line was written at
 * some point; `released` iff the **last** recorded write matches the released sentinel
 * `RELEASED: {passId} {ISO-8601}` FSPEC BR-14a decides.
 */
function takenReleasedPair(fs, passId) {
  const history = markerWriteHistory(fs);
  const taken = history.some((text) => text.startsWith(`IN-PROGRESS: ${passId} `));
  const last = history[history.length - 1];
  const released = typeof last === "string" && last.startsWith(`RELEASED: ${passId} `);
  return { taken, released };
}

/**
 * A no-op `_agent` double — every fixture below reaches at most `dispatchClustering`'s
 * failure path (Block 2's `failed` arm) or never reaches it at all (an empty consumed
 * set proposes nothing, so no advisory dispatch is attempted). No fixture in this file
 * drives clustering to a *successful* proposal — that is `consolidationRoute.test.js`
 * (T21) and `consolidationPass.test.js` (T20)'s subject, not this file's; this file's
 * only obligation is the take/release pair, not the promotion content.
 */
function unresolvedAgent() {
  return makeAgentDouble({
    script: [
      'unrecognised model alias "fable"',
      'unrecognised model alias "opus"',
    ],
    throwOn: new Set([0, 1]),
  });
}

/**
 * Assemble one pass's full seam set (TSPEC §5.1). `deferred` selects T-13's
 * macrotask-deferring variant for `_writeFile` / `_appendFile` / `_git` (§11.2's
 * `asAsync`); every other seam stays synchronous, which is the shipped double shape
 * (`seams.js`'s header: "the doubles are synchronous, deliberately").
 */
function makeSeams({ fs, git = fakeGit(), agent = unresolvedAgent(), deferred = false } = {}) {
  const defer = (fn) => (deferred ? asAsync(fn) : fn);
  return {
    _agent: agent,
    _readFile: fs.readFile,
    _writeFile: defer(fs.writeFile),
    _appendFile: defer(fs.appendFile),
    _checkFile: fs.checkFile,
    _listFiles: fakeListFiles({ ok: true, files: [] }),
    _git: deferred ? asAsync(git) : git,
    _ghRun: fakeGhRun(),
    _log: () => {},
    _phase: () => {},
    // §5.3's two new seams — never `null` here, since a `null` default degrades the PR
    // route with `api-failure` (§5.5) before any of the six statuses below is reached
    // for the wrong reason.
    _envPresent: fakeEnvPresent(new Set())._envPresent,
    _makeTempDir: fakeMakeTempDir(null)._makeTempDir,
  };
}

// ─── Block 1 — T-13 ─────────────────────────────────────────────────────────────────
describe("T31 — await discipline across finishPass (T-13, TSPEC §10.1/§11.2)", () => {
  describe.skip("main() not implemented yet (PLAN T02 skeleton; behaviour lands at T31)", () => {
    test("after main()'s promise resolves: terminal row logged AND marker released, under macrotask-deferred writes/git", async () => {
      // Given: a blank consuming repo (no prior log, no prior marker) and an empty
      // corpus, so the pass reaches the simplest guarded terminal branch that still
      // takes and releases the marker — `no-op` (FSPEC §12.1 S-05: consumed set empty).
      // The three write-shaped seams `finishPass` reaches (`_appendFile` for the
      // terminal row, `_git` for the §9.4 commit, `_writeFile` for the marker) are all
      // macrotask-deferred, per §11.2.
      const fs = fakeFs({});
      const git = fakeGit({ "ls-files": { ok: true, stdout: "" }, add: true, commit: true });

      const result = await main({
        direct: true,
        ...makeSeams({ fs, git, deferred: true }),
        _now: fakeNow,
      });

      try {
        // Conjunct (i): the terminal row is present in the log double's accumulated
        // text. This file asserts presence only — the row's full field grammar
        // (§10.3) is `consolidationReport.test.js`'s (T24) subject.
        expect(fs.files[LOG_PATH] ?? "").toContain(FRESH_PASS_ID);

        // Conjunct (ii): taken, then released — never a bare absence, which is
        // equally true of a fixture that never took the marker at all (this row's
        // whole point per the header comment above).
        const { taken, released } = takenReleasedPair(fs, FRESH_PASS_ID);
        expect(taken).toBe(true);
        expect(released).toBe(true);

        expect(result).toMatchObject({ status: "no-op" });
      } finally {
        // The one place the macrotask drain can run without a thrown assertion
        // skipping it (§11.2's hygiene clause).
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    });
  });
});

// ─── Block 2 — release across the six terminal statuses ───────────────────────────────
describe("T31 — release across the six terminal statuses (FSPEC §4.3, TSPEC §7.3/§10.1)", () => {
  describe.skip("main() not implemented yet (PLAN T02 skeleton; behaviour lands at T31)", () => {
    test("{taken, released} per status matches FSPEC §4.3's table, keyed on the module's own TERMINAL_STATUSES", async () => {
      // Each fixture builder returns the seam set for one terminal status. Every
      // builder is self-contained (fresh doubles per call, never module-scoped) so one
      // case can iterate all six without cross-fixture leakage.

      // promoted / promoted-degraded / no-op / failed: reached via §10.1's normal
      // `finishPass` path, which takes and releases at steps 6 and 16 regardless of
      // which of those four statuses step 14 records. This file drives the *simplest*
      // member of each pair the terminal-status vocabulary admits rather than a
      // realistic promotion (which is `consolidationPass.test.js` / T20 and
      // `consolidationRoute.test.js` / T21's subject): `no-op` via an empty corpus
      // (FSPEC S-05) and `failed` via `resolveAdvisoryRung` exhausting both rungs
      // (§10.2's caught rejection, `advisory-model-unresolved`). `promoted` and
      // `promoted-degraded` are the two members of this table this file cannot reach
      // without a successful clustering dispatch (TSPEC §8), which is out of scope for
      // the obligation this row states (the take/release pair, not the promotion
      // content) — driven here against the same causal shapes `consolidationRoute.test.js`
      // owns for real, confirmed at T31 unskip rather than duplicated here.
      const emptyCorpusFixture = () => {
        const fs = fakeFs({});
        const git = fakeGit({ "ls-files": { ok: true, stdout: "" }, add: true, commit: true });
        return { ...makeSeams({ fs, git }), fs };
      };

      const advisoryUnresolvedFixture = () => {
        const fs = fakeFs({
          "docs/some-feature/LEARNINGS-some-feature.md": "## 1. Harvested\n\nsomething\n",
        });
        const git = fakeGit({
          "ls-files": {
            ok: true,
            stdout: "docs/some-feature/LEARNINGS-some-feature.md\n",
          },
          add: true,
          commit: true,
        });
        return { ...makeSeams({ fs, git, agent: unresolvedAgent() }), fs };
      };

      const freshMarkerFixture = () => {
        // `refused` (FSPEC S-09): a marker already `IN-PROGRESS:` for a DIFFERENT
        // pass, written "now" (fresh, well inside `staleLockMinutes`), so this pass's
        // own `takeMarker` never lands. Deliberately the observed-fresh-marker arm
        // (AT-M1), not §10.3 row 5a's failed-take `refused` — see the header comment.
        const fs = fakeFs({
          [MARKER_PATH]: "IN-PROGRESS: 2024-12-31-9 2025-01-01T00:00:00.000Z",
        });
        const git = fakeGit({ "ls-files": { ok: true, stdout: "" } });
        return { ...makeSeams({ fs, git }), fs };
      };

      const staleDatumFixture = () => {
        // `skipped-cadence` (FSPEC §2.3/§2.4, §12.1 S-01): `direct` unset, an empty
        // corpus (the volume test cannot fire) and a log carrying one recent terminal
        // row, so `cadenceDatum` reads a non-elapsed datum and `triggerFor` returns
        // `skipped-cadence` before `mintPassId`, before `takeMarker`, before any
        // LEARNINGS body is read (TSPEC §10.1). The row's minimal `status:`/`date:`
        // literal is what `cadenceDatum` reads; the row's full field grammar (§10.3) is
        // `consolidationReport.test.js`'s (T24) concern, not this fixture's.
        const fs = fakeFs({
          [LOG_PATH]: "status: promoted\ndate: 2025-01-01\npass: 2025-01-01-1\n",
        });
        const git = fakeGit({ "ls-files": { ok: true, stdout: "" } });
        return { ...makeSeams({ fs, git }), fs };
      };

      const fixtures = {
        promoted: advisoryUnresolvedFixture, // placeholder pending a real promotion fixture (T31)
        "promoted-degraded": advisoryUnresolvedFixture, // placeholder pending a real degraded fixture (T31)
        "no-op": emptyCorpusFixture,
        failed: advisoryUnresolvedFixture,
        refused: freshMarkerFixture,
        "skipped-cadence": staleDatumFixture,
      };

      // Set equality over the catalogue, not containment — a dropped arm reds rather
      // than passing on the survivors.
      expect(new Set(Object.keys(fixtures))).toEqual(new Set(TERMINAL_STATUSES));

      const expected = {
        promoted: { taken: true, released: true },
        "promoted-degraded": { taken: true, released: true },
        "no-op": { taken: true, released: true },
        failed: { taken: true, released: true },
        refused: { taken: false, released: false },
        "skipped-cadence": { taken: false, released: false },
      };

      for (const status of TERMINAL_STATUSES) {
        const { fs, ...seams } = fixtures[status]();
        const direct = status !== "skipped-cadence";
        const result = await main({ direct, ...seams, _now: fakeNow });

        expect(result.status).toBe(status);
        expect(takenReleasedPair(fs, FRESH_PASS_ID)).toEqual(expected[status]);
      }
    });
  });
});
