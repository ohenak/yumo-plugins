/**
 * haltAndQueue.test.js — the halt path, the POSTMORTEM gate, and the queue row.
 *
 * Owner: RLH-25 (batch 3, RED). Greened by RLH-27 (batch 9); `RLH-AT-13a`'s
 * gate half additionally needs RLH-26 (batch 8), which is why batch 9 binds.
 *
 * Scope (PLAN §7.4, TSPEC §8.3):
 *   - `RLH-AT-21` … `RLH-AT-27` — POSTMORTEM lifecycle and structured halt fields
 *   - `RLH-AT-30-orch` … `RLH-AT-34-orch` — the **orchestrator half** of the
 *     queue-row range: *which* halting exit of `orchestrate-dev` arrives at the
 *     committing status write, and what the orchestrator reports when that
 *     commit fails. The mechanism itself (`rewriteStatus` / `updateQueueStatus`,
 *     the two `_git` invocations, each commit-failure branch) is `RLH-19`'s
 *     `RLH-AT-30-module` … `-34-module` and is asserted **nowhere** here. The
 *     `-orch` / `-module` qualifiers exist so one jest run never carries two
 *     tests of one name (PLAN §1.3, §7.4).
 *   - `RLH-AT-13a` — G-INV totality (TSPEC §2.5): every exit that leads to
 *     running the phase passes step G and is refused by an unresolved
 *     POSTMORTEM; the `FRESH` exit does not refuse but names it in the skip
 *     notice.
 *
 * FSPEC §12.4's worked example A and AC-2.3b's example B are driven **verbatim**
 * as fixtures — the row text is copied into `FSPEC_12_4_EXAMPLE_A` /
 * `FSPEC_12_4_EXAMPLE_B` below and the trees are built from it. PLAN §7.3 names
 * exactly this pair as the guard against a gate placed ahead of §12.4 step 1
 * (which breaks A) or reachable only from step 4 (which breaks B).
 *
 * ## Why the module namespace, not named imports
 *
 * This package runs jest under native ESM (`--experimental-vm-modules`,
 * `"transform": {}`). A static `import { approvalHashOf }` of a name the module
 * does not export yet is a **link-time SyntaxError** that takes the whole suite
 * down — which is not a valid red. Every symbol this feature introduces is
 * therefore reached off the namespace object (`dev.approvalHashOf`,
 * `queueModule.rewriteStatus`), so an unimplemented symbol reds one assertion on
 * its own oracle instead of erroring the file at import.
 *
 * Seam doubles come from `./helpers/seams.js` (RLH-02) and are synchronous by
 * design; production `await`s them, and a sync return simply resolves.
 */

import main from "../orchestrate-dev.js";
import * as dev from "../orchestrate-dev.js";
import * as queueModule from "../orchestrate-queue.js";
import { DEFAULT_QUEUE_PATH } from "../orchestrate-queue.js";
import { fakeFs, fakeGit, recordingRecordHalt } from "./helpers/seams.js";

// ─── §6.3 / §6.5: the terminal exit and the queue-row commit ─────────────────
describe("RLH-25: the terminal exit and the queue row", () => {
  // RLH-AT-21, RLH-AT-22, RLH-AT-23
});

// ─── §2.5 step G / §5.8: the POSTMORTEM gate ─────────────────────────────────
describe("RLH-25: the POSTMORTEM gate", () => {
  // RLH-AT-24, RLH-AT-25, RLH-AT-26, RLH-AT-27, RLH-AT-13a
});

// ─── PLAN §7.4: the orchestrator half of AT-30…AT-34 ─────────────────────────
describe("RLH-25: which halting exit reaches the committing status write", () => {
  // RLH-AT-30-orch … RLH-AT-34-orch
});
