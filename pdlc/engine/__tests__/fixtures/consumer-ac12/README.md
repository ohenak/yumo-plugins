# The AC-1.2 consumer fixture (TSPEC §7.7, PROP-READ-1, PROP-READ-2, PROP-READ-4)

This directory is a scratch **consumer repo skeleton**, not a repo itself (no `.git/` — a
consuming test copies these entries into a fresh temp directory and `git init`s it there, the
same arrangement `smoke.test.js`'s `makeConsumerRepo` uses for its own inline fixtures). It exists
so an AC-1.2 test can observe a full `pdlc dev` / `pdlc queue` run against a consumer that
actually looks like one that has run `sync-workflows.sh` before — the opposite shape from
`smoke.test.js`'s existing "no `.claude/workflows/` at all" fixtures.

## What it carries, and why

- **`.claude/workflows/`** — a **populated** tree: `orchestrate-dev.bundle.js`,
  `orchestrate-queue.bundle.js`, `pdlc-cli.mjs`, `distribution-manifest.json`, and
  `.pdlc-drift-state.json` (schema-valid, `baselineStatus: "resolved"`, three `"in-sync"` rows).
  PROP-READ-4 (TSPEC §7.7, EC-PAR-1, AT-ENG-51) is explicit that this tree must never be absent or
  empty: an empty directory would satisfy AC-1.2's clause 3 (no path opened under
  `.claude/workflows/`) for the wrong reason — because there is nothing there to read, not
  because nothing was read. The bundle/CLI file contents are illustrative stand-ins, never
  executed by any test; only their presence as directory entries, and the drift-state record's
  shape, is observed.
- **`.claude/pdlc.config.json`** — `{ "distribution": { "checkEnabled": false } }`, the opt-out
  posture AC-1.2's *Given* names (REQ:365-374, `orchestrate-queue.js:2068`, called at `:1071-1072`).
  On the queue surface this is what clause 3 rests on: the config-side opt-out is evaluated
  *before* any drift-state read and short-circuits it, so a `pdlc queue` run against this fixture
  costs the engine no read under `.claude/workflows/` at all, even though the tree is populated
  and the drift-state file inside it is schema-valid and readable. (On the dev surface the opt-out
  is not load-bearing — `orchestrate-dev.js` never reads under `.claude/workflows/` on any
  posture — but this fixture carries the same posture for both surfaces for consistency with
  AC-1.3, per TSPEC §7.7 / REQ:355-376's Phase-F erratum note.)
- **`docs/ac12-widget/REQ-ac12-widget.md`** — the file AC-1.2's clause 2 (`∃` a recorded read of
  the consumer's `docs/{f}/REQ-{f}.md`) checks for, at a stable, predictable path.

Clause 1 (`∃` a recorded read of `{pluginRoot}/skills/{skill}/SKILL.md`) is **not** this fixture's
concern: `pluginRoot` in a real run is the engine's own located plugin install, not anything under
a consumer fixture — see `fs-observation.test.js`'s `makeScratchRoots()` for the unit-level stand-in
and `smoke.test.js` for the real plugin-root arrangement.

## How a consuming test uses this fixture

Copy this directory's tree (recursively, preserving relative paths) into a fresh `mkdtemp`
directory, `git init` it there (mirroring `smoke.test.js`'s `makeConsumerRepo`), then drive a
`runDev` / `runQueue` call against that copy with the AC-1.2 `fs` recorder
(`startFsReadRecording()` / `stopFsReadRecording()`, `__tests__/_bootstrap.mjs`, T43) installed
around the whole call. This fixture is deliberately inert on its own — no test in this repo reads
it yet; it is built ahead of that consumer per this task's `[Fake first]` marking (PLAN T46), the
same ordering `pdlc/engine/__tests__/fixtures/transport-sdk/` and `transport-cli/` used ahead of
the transport implementations that read them.
