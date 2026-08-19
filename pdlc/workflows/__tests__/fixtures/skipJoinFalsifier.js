/**
 * skipJoinFalsifier.js — PLAN T07, TSPEC §5.5.
 *
 * Not a `*.test.js` module (deliberately — L-5's suite-size count stays untouched, TSPEC §4.4),
 * so the normal top-level `npm test` run never collects it (`testPathIgnorePatterns` excludes
 * `/__tests__/fixtures/`, and this file's own name does not end `.test.js` either way).
 *
 * Its only purpose is to be handed, by explicit path, to the skip-join orphan-freedom oracle's
 * "red" construction in `consumerCleanup.test.js`: a bare `it.skip` that never goes through
 * `describeOrSkip`/`itOrSkip` and therefore never appends a record to the run-scoped skip sink.
 * A jest run that collects this file reports one `pending` assertion with no matching sink
 * record — the orphan the join oracle exists to catch. If the oracle's "red" construction ever
 * stops reporting that orphan, the oracle itself is not falsifiable, which is exactly what that
 * construction is checking.
 *
 * The `it.skip` token below is a literal, on purpose: the compensating scanner in
 * `consumerCleanup.test.js` that looks for bare skip tokens assembles its own search tokens at
 * runtime (never writing them as literals in ITS OWN source), specifically so that scanning
 * THIS fixture — which must contain a real, literal, matchable token — is what proves the
 * scanner is not vacuous.
 */

it.skip("orphan: registered through no capability helper, on purpose", () => {
  throw new Error("skipJoinFalsifier.js's fixture test must never run");
});
