# pdlc-engine-baseline — measured facts for the headless-engine feature family

> **What this is.** The measured facts about this repo that the `pdlc-headless-engine`,
> `pdlc-engine-distribution` and `pdlc-plugin-retirement` REQs are stated over. Extracted
> verbatim in substance from `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` §1.2
> (v0.5) so the REQs cite facts by id rather than re-carrying them (pm-author §5e).
>
> **Read-only reference, not a reviewed pipeline artifact.** No cross-review is written
> against it and nothing gates on it. Cite it; do not re-litigate it here.

| Field | Value |
|---|---|
| Measured on | 2026-08-08, this repo, branch `feat-pdlc-headless-engine` |
| Citation form | repo-root-relative `file:line`, per DC-02. Line numbers drift; navigate by the named symbol or literal. Re-baselining is a mechanical fix, not a finding. |

## M-ENG-01 — The workflow modules already run in plain Node

Of the four runtime capabilities the modules declare, three already have working plain-Node
bodies — `parallel` (`pdlc/workflows/orchestrate-dev.js:8464`), `pipeline` (`:8469`), `phase`
(`:8474`) — and only `agent()` (`:8458`) throws outside the Claude Code runtime. Every IO seam
already defaults to real Node: `defaultReadFile` → `fs.readFileSync` (`:8492`), `execSync`
resolved by dynamic import (`:7680`, `:10754`); `orchestrate-queue.js` carries its own
`fs`-backed defaults (`:948`). `dist/pdlc-cli.mjs` is an existing plain-Node artifact built
from the same body. **The only capability the modules take from the workflow runtime is
`agent()`.**

## M-ENG-02 — The plugin coupling is one string, not a dependency to remove

`pdlc/workflows/runtime-adapter.js:47` (`rtSkillPrompt`) tells the dispatched agent to invoke
the Skill tool with `"pdlc:{skill}"`. A dispatcher that reads each skill's `SKILL.md` by path
and inlines it removes the *Skill-tool invocation* from the unattended path. The pdlc plugin
itself stays installed as the one place those `SKILL.md` files live, since it must remain
usable standalone for interactive `/pdlc:*` sessions (operator decision, 2026-08-08).

## M-ENG-03 — The rest of `runtime-adapter.js` is workaround, not function

`pdlc/workflows/runtime-adapter.js` is 53,056 bytes; everything outside M-ENG-02's one string
re-expresses `fs` and `git`/`gh` through IO agents because the runtime has nothing else —
including the prose-chunked, SHA-256-verified file transport built after four measured
corruption modes. Hosted in Node, that workaround is not ported; it is deleted.

## A-ENG-01 — Recorded alternative, not chosen: Skill-tool invocation at dispatch

Rejected (operator decision, 2026-08-08): have the dispatched session invoke the Skill tool
`pdlc:{skill}` directly instead of the engine inlining the prompt file's bytes. It was
rejected because it reintroduces a dependency on Skill-tool namespace resolution inside a
non-interactive session, rather than a file read the engine controls end to end.

## M-ENG-04 — The Agent SDK runs under subscription auth on the operator's machine

Measured by the Phase-0 spike `docs/pdlc-headless-engine/SPIKE-agent-sdk-auth.md`
(2026-08-08), which ran the installed `@anthropic-ai/claude-agent-sdk` with
`ANTHROPIC_API_KEY` verified absent from the process environment and from both Claude Code
settings files. Observed: the SDK's `system/init` message reported **`apiKeySource: "none"`**;
the call completed with no exception and no key prompt; a `rate_limit_event` message carried
`rateLimitType: "five_hour"` with `overageStatus: "rejected"` — the shape associated with
subscription-plan rate limiting, not a pay-as-you-go key. `apiKeySource` is reported only from
*inside* a dispatch, never before one.

This supersedes the docs-derived reading (code.claude.com authentication, env-vars and
network-config docs, retrieved 2026-08-08) that the SDK must use `ANTHROPIC_API_KEY`. The
spike does not prove *why* subscription auth works — whether the local `headroom` proxy
performs auth translation invisible to the SDK client, or the SDK has a genuine subscription
path — only that it does, on this machine, on that date.

## M-ENG-05 — Headless `claude -p` accepts subscription auth

Headless Claude Code accepts interactive `/login` state or a `claude setup-token` OAuth token
via `CLAUDE_CODE_OAUTH_TOKEN`, and honors `ANTHROPIC_BASE_URL` / `ANTHROPIC_CUSTOM_HEADERS`
(same docs retrieval, 2026-08-08).
