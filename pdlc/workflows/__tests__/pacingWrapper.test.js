/**
 * pacingWrapper.test.js — the H-3 fix: `dispatchAndVerify`, episode keys, mode
 * selection, the two prompt kinds, the two authoring budgets, and the trailer
 * reason that carries `REVISION-COMPLETE:` failures into the operator report.
 *
 * Ownership (PLAN §5.2, single-writer-per-file): RLH-21 (batch 3). RED on arrival.
 *
 * Behaviour owner: **TSPEC §5.6** (`selectMode` / S-INV / the loop / the two prompt
 * kinds), §4.3 (`TrailerFailure`), §4.5 (`EpisodeKey`), §4.7 (report fields and
 * lines), §4.8 (the constants), §5.9 (`isComplete`), §6.2 rows 9–11 and 17, §6.4,
 * §6.5. Wording owner: **FSPEC §19** (`AT-35`…`AT-54`, `AT-58`, `AT-61`).
 *
 * | Assertion | Green from (PLAN §7.3) |
 * |---|---|
 * | `RLH-AT-35`…`RLH-AT-54`, `RLH-AT-58`, `RLH-AT-43a`, `RLH-AT-61-loop` | batch 7 (RLH-23) |
 * | `RLH-AT-61-report` | batch 10 (RLH-30) |
 *
 * `RLH-AT-61` is split into two separately named tests because its two conjuncts
 * green in different batches (PLAN §7.3). `RLH-30` writes no test of its own — the
 * report half lives here.
 *
 * ## Stratum
 *
 * **L2.** Behaviour is driven through `main()` with injected seams; the wrapper
 * itself (`dispatchAndVerify`, `selectMode`, `isComplete`) is deliberately *not*
 * imported, because §3.8 makes it non-exported and an L2 suite must not depend on
 * a symbol the TSPEC forbids exporting. The single exception is
 * `RLH-AT-61-loop`, whose subject is literally "`reviewLoop`'s return" (PLAN
 * §5.4 row RLH-21, TSPEC §3.9) — `reviewLoop` is already an exported symbol whose
 * signature §3.9 changes, so that one assertion drives it directly.
 *
 * The module is imported as a **namespace** so the suite *runs* before any new
 * symbol exists: a named import of a missing export is a link-time `SyntaxError`
 * that takes the whole file down, which is not a valid red (PLAN §12.1).
 *
 * ## The two things that make these fixtures mean anything
 *
 * 1. **The listing seam is a live view of the fake tree.** `_listFiles` is
 *    `fakeListFiles(dir => basenames of dir in the fake fs)`, so a cross-review a
 *    reviewer episode writes *during* the run is visible to the next episode's
 *    `refreshReviewState`. That is the whole of S-INV (§5.6.1): round 2's
 *    optimizer must see the reviews round 1 wrote, and this run is what wrote them.
 *    An entry-time snapshot would make every optimizer episode greenfield.
 * 2. **`docs/{feature}/` exists and is empty.** A live view of a directory with no
 *    entries returns `{ ok: true, files: [] }` — TSPEC §6.2 **row 1's successful
 *    empty listing**, not `dir_missing`. The distinction is load-bearing for
 *    `RLH-AT-43a`: both dispositions produce an empty `present`, so a fixture that
 *    accidentally used `dir_missing` would test nothing about freshness.
 *
 * ## File-local generators (PLAN §7.2)
 *
 * `__tests__/helpers/driftGenerators.js` is reused **unmodified**; the domain
 * generators below (document builders, heading-set builders) are file-local and
 * unexported, built over its primitives. The literal seed goes through
 * `resolveSeed`, and `shrink` is used on the failure path only.
 */

import * as devModule from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles, recordingRecordHalt } from "./helpers/seams.js";
import { resolveSeed, seeded, shrink } from "./helpers/driftGenerators.js";

const main = devModule.default;

// ─── 1. Fixture vocabulary ────────────────────────────────────────────────────
// (constants, document-class builders)

// ─── 2. The harness ───────────────────────────────────────────────────────────
// (agent double, `runPipeline`, dispatch selectors, report-surface reader)

// ─── 3. RLH-AT-35 … RLH-AT-38 — terminality and the trailer ───────────────────

// ─── 4. RLH-AT-39 … RLH-AT-42 — progress, counters, episode scope ─────────────

// ─── 5. RLH-AT-43, RLH-AT-43a — mode across the seam, and S-INV freshness ─────

// ─── 6. RLH-AT-44, RLH-AT-45 — artifact sets and working-tree measurement ─────

// ─── 7. RLH-AT-46, RLH-AT-47 — budget exhaustion and its two reports ──────────

// ─── 8. RLH-AT-48, RLH-AT-49 — the two prompt kinds ───────────────────────────

// ─── 9. RLH-AT-50, RLH-AT-51, RLH-AT-58 — the non-authoring wrapped classes ───

// ─── 10. RLH-AT-52, RLH-AT-53 — advisory proxy, and no destructive git ────────

// ─── 11. RLH-AT-54 — constant substitution and the round window ───────────────

// ─── 12. RLH-AT-61-loop, RLH-AT-61-report — the four trailer reasons ──────────
