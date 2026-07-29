# Serial Work Queue

This queue is driven by the orchestrator workflow. Consumers wire it up by
copying `.claude/workflows/orchestrate-queue.js` into their own repo and
running `/loop run /pdlc:orchestrate-queue` against it.

| Order | Status | Feature | REQ Path | Depends-On |
|---|---|---|---|---|
| 1 | pending | example | docs/example/REQ-example.md | — |
