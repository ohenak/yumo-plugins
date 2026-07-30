// reportTemplates.test.js — RLH-28 (batch 3, RED)
//
// RLH-AT-55 — "no un-substituted template reaches a report".
//
// TSPEC §6.3 states the rule in its general form:
//
//   "The general rule this establishes: no un-substituted template reaches a
//    report. Any operator-facing string whose {…} placeholders are not all
//    substituted is a defect. The same rule condemns `reviewerPrompt`'s and
//    `optimizerPrompt`'s `{DOC-TYPE}` literals (§5.2)."
//
// FSPEC §19's acceptance wording:
//
//   "AT-55 — No un-substituted template reaches a report (AC-5.2).
//    *Then* no report string produced by any halt path contains a literal
//    `{feature}` or `{DOC-TYPE}`."
//
// Because the rule is *general*, this suite is a SWEEP, not a check of three
// known-bad templates. It enumerates the pipeline sources from the tree at
// HEAD and flags every half-substituted template token it finds, so a report
// string added later with an un-substituted placeholder is caught too.
//
// RED reason (batches 3–9, PLAN §7.3 ledger row "RLH-AT-55"): the sweep finds
// four live half-substituted templates in `orchestrate-dev.js` —
//   * `checkConverged`'s `postmortemPath` (TSPEC §6.3), corrected by RLH-27
//     in batch 9;
//   * three `{DOC-TYPE}` (and one `{role}`) cross-review paths in
//     `reviewerPrompt` / `optimizerPrompt` (TSPEC §5.2 / §3.9), substituted by
//     RLH-30 in batch 10.
// Both fixes must land before this greens, which is exactly why the ledger
// binds RLH-AT-55 to batch 10 / RLH-30 rather than to batch 9 / RLH-27.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = join(HERE, "..");

// ─── The swept surface ────────────────────────────────────────────────────────
//
// Every operator-facing report string the pipeline can emit — halt reasons,
// `recordPhase` messages, `_log` lines, the final-report fields of TSPEC §4.7,
// and the agent prompts §6.3 explicitly folds into the same rule — is a string
// literal in one of these three hand-written sources. Sweeping the whole source
// text is therefore a superset of the report surface: no report string can
// escape it, and it needs no per-site allow-list to maintain.
//
// Deliberately excluded:
//   * `pdlc/workflows/dist/` — generated from these three by `build-runtime.mjs`.
//     Including it would double-count every finding. `runtimeBundle.test.js`
//     already asserts the artifacts are byte-fresh against these sources, so a
//     violation here is a violation there.
//   * `build-runtime.mjs` — a Node-side build script; it emits no operator
//     report string from a pipeline run.
const SWEPT_SOURCES = [
  "orchestrate-dev.js",
  "orchestrate-queue.js",
  "runtime-adapter.js",
];
