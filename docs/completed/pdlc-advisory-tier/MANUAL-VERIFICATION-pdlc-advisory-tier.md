# MANUAL-VERIFICATION — pdlc-advisory-tier (PLAN A-34)

Task A-34 (TSPEC §3.3/§13.6): dispatch one trivial advisory agent on the `"fable"` model
alias in a **real workflow runtime** and record, verbatim, which branch of the §3.4
model-resolution ladder fired. The tier ships correctly either way — this file records which
path is the production path.

## Result

RESULT: unverified — no runtime available

## What was attempted, and why the runtime was unavailable

Date: 2026-08-05. Session: interactive Claude Code (CLI 2.1.223) on the maintainer's machine.

A real Workflow runtime exists in this harness, but it could not launch any script this
session: the launcher snapshots and parses the workflow registry at session start, and the
registry snapshot predated the `neutralizeDynamicImports` build fix (commit `7db1896`), so
every `Workflow` invocation was refused at parse time (`SyntaxError: import() is not
available in workflow scripts`) regardless of the on-disk artifact state. This was verified
by the rename probe: with the consumer bundle removed from `.claude/workflows/`, the launcher
returned the identical parse error rather than "workflow not found" — proof it was reading a
session-start cache, not the disk. No advisory dispatch could therefore reach a runtime
`agent()` call, and per the A-34 discharge rule a result inferred from reading the code would
be mock data, so no ladder branch is recorded.

## What would settle it

An operator dispatch in a **fresh session** (so the registry re-scans), against a synced
`.claude/workflows/` consumer copy (`pdlc/hooks/scripts/sync-workflows.sh --check` exits 0),
with `.claude/pdlc.config.json` carrying `"advisory": { "enabled": true }`: run any queue or
dev invocation that drives one advisory seam to a dispatch on `"fable"` and paste the
runtime's own output beneath a `RESULT: verified` line here, naming the §3.4 ladder branch
that fired.

BL-01 stays open until that dispatch is performed and recorded.
