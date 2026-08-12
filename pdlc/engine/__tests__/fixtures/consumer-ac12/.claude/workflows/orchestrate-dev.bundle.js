// Stand-in for `pdlc/workflows/dist/orchestrate-dev.bundle.js` (TSPEC §7.7, PROP-READ-4).
//
// This file exists only to make `.claude/workflows/` a POPULATED tree, never an absent or
// empty one — an empty directory would satisfy AC-1.2's clause 3 (no path opened under
// `.claude/workflows/`) for the wrong reason, precisely the failure PROP-READ-4 rules out. Its
// content is illustrative, not a real bundle: nothing in this fixture is ever executed, only
// the presence of the directory entries and the `.pdlc-drift-state.json` record below is
// observed by the AC-1.2 test's `fs` recorder.
export const STAND_IN = "orchestrate-dev.bundle.js";
