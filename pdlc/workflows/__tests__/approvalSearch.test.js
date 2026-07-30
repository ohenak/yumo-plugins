/**
 * approvalSearch.test.js — the H-4 fix: the two-tier approval search (TSPEC §5.4),
 * §5.1's file-verdict extraction and §5.5's staleness verdict, observed **through
 * `main()`** with injected seams.
 *
 * Owns, per PLAN §4 row RLH-24 and TSPEC §8.3's AT→file map:
 *   RLH-AT-08, RLH-AT-09, RLH-AT-10, RLH-AT-11, RLH-AT-56, RLH-AT-57.
 *
 * ## This is an L2 suite, deliberately
 *
 * PLAN §4 (RLH-24) and §11.5: the search is driven **through the composition root
 * with injected seams**, so it needs **no exported identifier** and §11.5's `N-b`
 * name for the search function is *not* observable here. Nothing below imports a
 * search symbol; every oracle is one of
 *   - `main()`'s returned final report — the phase record's status/detail (§4.7), or
 *   - the recorded `_readFile` fan-out — §5.4's "at most two `_readFile` per phase
 *     entry, tier 1 **or** tier 2, never both".
 *
 * ## RED on arrival (batch 3), green at batch 8 (PLAN §7.3)
 *
 * No approval search exists in `orchestrate-dev.js`: a skip-eligible phase entry
 * reads no cross-review file and unconditionally runs its `reviewLoop`. Every
 * assertion below therefore reds on a **missing behaviour**, not a mis-shaped one,
 * and none of them can be greened by RLH-05's round-derivation work in this same
 * batch — the oracles are the search's reads and the `"⏭"` skip record, neither of
 * which `deriveRoundWindow` produces. RLH-26 (batch 8) greens all six.
 *
 * Test names are namespaced `RLH-AT-{N}` (PLAN §1.3 / TSPEC §8.3): bare `AT-{N}`
 * collides with `documentOracles.test.js`'s pre-existing intentional red
 * `AT-22 [red-until-L-06]`.
 *
 * ## Fixture provenance
 *
 * The tier-1 `## Verdict` block and the tier-2 `## 6. Approval Record` table are
 * built from **TSPEC §4.4**, which is normative for both grammars. They are *not*
 * copied from the review / harvest SKILL.md files: RLH-07 and RLH-09, which write
 * those templates into the SKILLs, do not run in this batch, so the SKILLs do not
 * yet carry them.
 *
 * Seam doubles come from `__tests__/helpers/seams.js` (RLH-02) — the one canonical
 * seam-double module. No ad-hoc seam object is defined here.
 */

import { createHash } from "crypto";

import main from "../orchestrate-dev.js";
import { fakeFs, fakeListFiles } from "./helpers/seams.js";
