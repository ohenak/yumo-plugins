// TSPEC §5.4's literal `PK-*` table, transcribed ONCE.
//
// Not collected as a test file (leading underscore, PROP-SUITE-9): this is a
// shared fixture, and it contains no `test()` calls.
//
// ── Why this file exists (CR round-3 TE F-05) ─────────────────────────────
//
// TE CR v2 F-03 correctly replaced PF-4's recovered-from-the-implementation
// expectation with a transcription of the spec. That fix left the §5.4 table
// hand-copied in **two** places — `packaging.test.js` and
// `publish-channel.test.js` — with nothing tying the copies together. A
// `PK-` row added or re-classed in TSPEC and applied to only one copy would
// leave the other green, and the resulting red would read as a product
// defect rather than as the missed co-change it actually is.
//
// One module, imported by both, keeps the anti-echo property (the expected
// set is still read from the SPEC, never from a directory listing or from
// `checkPackedSet`'s own refusal message) while making the two suites
// provably say the same thing.
//
// ── Co-change obligation ──────────────────────────────────────────────────
//
// Adding, removing or re-classing a member is a SPEC change first. In one
// change: update TSPEC §5.4's `PK-*` table and FSPEC §5.2's per-class counts,
// then this file. Never this file alone — an edit here that the spec does not
// carry makes the release gate agree with a table nobody approved.

// V-03, PK-5…PK-16.
export const LIB_MODULES_AT_HEAD = [
  "adapter",
  "auth",
  "catalogue",
  "guard-measurement",
  "handshake",
  "outcome",
  "report",
  "run",
  "skills",
  "startup",
  "transport-cli",
  "transport",
];

// §3.1, PK-17…PK-19.
export const LIB_MODULES_FROM_THIS_FEATURE = ["resolve-version", "store", "provenance"];

// AT-3.8b's Workflow-members class (FSPEC §5.2, "three members and nothing
// else" — TSPEC §5.4). PK-20…PK-22.
// TSPEC §7 D-3 / P7-00: co-changed with TSPEC §5.4's `PK-*` table and
// FSPEC §5.2's per-class counts in the same change — never this file alone.
export const WORKFLOW_MEMBERS = [
  "vendor/workflows/orchestrate-dev.js",
  "vendor/workflows/orchestrate-queue.js",
  "vendor/workflows/VENDOR-MANIFEST.json",
  "vendor/workflows/lib/loop-session.mjs",
  "vendor/workflows/lib/escalation-view.mjs",
  "vendor/workflows/lib/stats.mjs",
];

export const TSPEC_SOURCE_NOTE =
  "expected set's source: TSPEC §5.4's literal `PK-*` table " +
  "(docs/completed/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md §5.4) " +
  "— never a listing of pdlc/engine/lib/ or the tarball itself";

/**
 * §5.4's expected packed set for a given N-2 licence state.
 *
 * PK-3 (`LICENSE`) is the only conditional row, and its presence is read from
 * N-2's **recorded decision** — never from whether `pdlc/engine/LICENSE`
 * happens to exist in the tree (TSPEC §5.4's deletion-tolerance argument).
 *
 * @param {{licence: boolean}} args `licence`: N-2's recorded decision.
 * @returns {string[]} PK-1…PK-23, in table order.
 */
export function tspecPackedSet({ licence }) {
  return [
    "package.json", // PK-1
    "README.md", // PK-2
    ...(licence ? ["LICENSE"] : []), // PK-3, conditional on N-2's recorded decision
    "bin/pdlc.mjs", // PK-4
    "bin/cli.mjs", // PK-4b
    ...LIB_MODULES_AT_HEAD.map((m) => `lib/${m}.mjs`), // PK-5…PK-16
    ...LIB_MODULES_FROM_THIS_FEATURE.map((m) => `lib/${m}.mjs`), // PK-17…PK-19
    ...WORKFLOW_MEMBERS, // PK-20…PK-22, PK-24…PK-25
    "scripts/postinstall.mjs", // PK-23
  ];
}

/**
 * The count conjunct (TSPEC §5.4, FSPEC §5.2): 4 manifest-adjacent/`bin/`
 * + 15 `lib/*.mjs` + 5 vendored + 1 install script + 0/1 licence.
 *
 * Derived from the class sizes rather than from `tspecPackedSet().length`,
 * deliberately: a count computed from the list it is meant to check would
 * agree with any list at all. TSPEC §7 D-3 / P7-00: the vendored class size
 * (5, was 3) is co-changed with TSPEC §5.4's `PK-*` table and FSPEC §5.2's
 * per-class counts — never this file alone.
 */
export function tspecPackedCount({ licence }) {
  return 4 + 15 + 6 + 1 + (licence ? 1 : 0);
}
