/**
 * skipJoinTeardown.js — PLAN T07, TSPEC §5.5.
 *
 * A no-op `globalTeardown` override for the skip-join oracle's nested child jest invocations
 * (`consumerCleanup.test.js`). The child's own `--globalTeardown` is pointed here instead of
 * `skipSinkTeardown.js` for two reasons, both load-bearing:
 *
 *   1. `skipSinkTeardown.js` `rmSync`s the sink directory once it has read it, so the child
 *      would delete the sink file out from under the host process trying to read it after the
 *      child exits. There is no synchronisation point the host can observe to avoid the race —
 *      letting the inherited teardown run and copying the sink first was considered and
 *      rejected for exactly that reason.
 *   2. `skipSinkTeardown.js` runs the full `validateSkipRecords` comparator against
 *      `SKIP_INVENTORY` and throws on violation. The child's records are not the run this
 *      comparator is meant to bind (the host's own teardown already covers the real run); the
 *      child exists only so the host can inspect its `--json` output and its sink file.
 *
 * The host process owns the sink directory's lifetime and removes it in its own `afterAll`.
 */

export default function noopTeardown() {
  // Deliberately empty.
}
