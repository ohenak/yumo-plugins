# pdlc-engine-baseline — measured facts for the headless-engine feature family

> **What this is.** The measured facts about this repo that the `pdlc-headless-engine`,
> `pdlc-engine-distribution` and `pdlc-plugin-retirement` REQs are stated over. Extracted
> verbatim in substance from `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` §1.2
> (v0.5), and its §1.2a state table and AC-3.3 model map at v0.7, so the REQs cite facts by id
> rather than re-carrying them (pm-author §5e).
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

## M-ENG-06 — Engine state at HEAD, per acceptance criterion (red / green)

Relocated verbatim in substance from `REQ-pdlc-headless-engine.md` §1.2a (v0.6) under
pm-author §5e. A partial engine is already committed on `feat-pdlc-headless-engine`:
`pdlc/engine/` (`bin/pdlc.mjs`, 7 `lib/*.mjs` modules, 9 `__tests__/*.test.js` files,
`pdlcPluginCompat: "^0.22.0"` in `pdlc/engine/package.json`), landed across `059750de` (P1, SDK
transport + auth-policy gate + failure taxonomy), `2ed13815` (P2, plugin resolution, version
handshake, skill inlining, `--dry-run`, `pdlc doctor`), `054d5292` (P3, `pdlc dev`/`queue`
wiring + offline end-to-end smoke), `d0d2288b` (P4, retry/pause, run report, `queue --loop`)
and `f6f8029a` (fixes). A test written today therefore either starts red or re-asserts green —
the two demand different work.

**The table is total over the REQ's acceptance criteria** (correction, Phase-F erratum — AC-2.3
and AC-4.4 had no row, while the REQ reads the table as covering every AC): every criterion
AC-1.1…AC-6.4 appears in exactly one row below, and a criterion added to the REQ without a row
here is a defect in this fact, not a gap the reader resolves. "Partially green" is a state in its
own right: some half of the criterion is asserted at HEAD and the row names the unasserted half.

| AC | State at HEAD | Evidence |
|---|---|---|
| AC-1.2 (skill/plugin read containment), AC-1.3 (queue triage), AC-2.5 (`cwd`), AC-3.1 (composed prompt), AC-3.2 (handshake refusal), AC-3.4 (single permission setting), AC-4.2 (retry), AC-4.5 **except its per-dispatch auth clause** (report fields, pause rows) | **green — regression-protecting** | `pdlc/engine/__tests__/{transport,skills,startup,handshake,adapter,report,run,cli,smoke}.test.js` at `054d5292`, `d0d2288b` |
| AC-4.1 (six-member outcome taxonomy) | partially green — the individual classifications are asserted (each error class has a test), but the set-equality over the closed six-member catalogue is unasserted | `transport.mjs` defines four error classes plus the success path; the strings `transport-contract-violation` and `agent-reported-failure` appear nowhere in `pdlc/engine/`; no test in `pdlc/engine/__tests__/` asserts set-equality over any catalogue |
| AC-1.5 (anti-fork) | green — both halves exist; only the specifier check is weaker than stated (it asserts a `file:` URL, not the repo-relative path under `pdlc/workflows/`) | `__tests__/run.test.js:48` (no vendored copy), `:64` (module URLs) |
| AC-1.4 (halt recording), AC-4.3 (no orphan child, halt recorded), AC-6.1 (hermeticity guard) | partially green — the offline smoke halts and asserts git state, but no explicit guard fails a run that constructs the real transport | `smoke.test.js:294` (halt leaves history intact, on `feat-{f}`) |
| AC-2.3 (environment passthrough) | partially green — the dispatch env is the parent env spread into a new object, so a first-dispatch assertion passes today; BR-ENV-3's *every-dispatch* half is unasserted, and no test pins the fallback transport's inherited child env | `pdlc/engine/lib/transport.mjs:159` (`{ ...env }`), `:168` (passed as the dispatch options' `env`); asserted by `__tests__/transport.test.js:170` ("dispatch env spreads the provided env rather than replacing it") |
| AC-4.4 (`auth-failure` never silently retried) | partially green — an auth outcome is classified, named with its failing source, excluded from the retry loop and test-covered; unasserted: that the run stops through the modules' halt path, and the closed-catalogue naming AC-4.1 owns | `AuthPolicyError` defined at `transport.mjs:23`, classified first by `classifyThrown` at `:100`, thrown at `:204` before any model output with the failing `apiKeySource` named in its message; structurally never retried (`adapter.mjs:291` rethrows anything that is not a `RateLimitedError`); covered by `__tests__/transport.test.js:50` (`instanceof AuthPolicyError` asserted at `:63`) |
| AC-1.1 (parity oracle), AC-2.1/2.2/2.4 (banner mapping, startup refusal, billing oracle), AC-3.3 (model map), AC-3.5 (skill set-equality), AC-4.5's per-dispatch auth clause, AC-5.1/5.2 (guard parity), AC-6.2 (live smoke), AC-6.3 (fixtures), AC-6.4 (catalogue) | **red — open work** | no auth check exists in `startup.mjs` (only an `apiKeyPolicy` banner row, `:49`/`:64`); no hook/settings wiring exists in `pdlc/engine/lib/`; startup's skill probe is containment over a frozen 17-name list (`startup.mjs:20`, `:102`), not set-equality against files present — and that list also over-declares the dispatchable set (10 identifiers / 12 prompt files; the remaining names are operator-invoked skills no module dispatches); the auth source is recorded once, not per dispatch — `adapter.mjs:320` keeps a single `lastApiKeySource`, surfaced as one scalar (`report.mjs:51`, `bin/pdlc.mjs:227`) |

## M-ENG-07 — Pinned model map and the corpus that exercises every row

The fixture table `REQ-pdlc-headless-engine.md` AC-3.3 asserts set-equality against, relocated
here (v0.7) so the AC cites it by id. It is a **test fixture transcribed from the modules**,
never imported from them: when a module changes a pinned model, this table changes in the same
commit, and the drift between the two is what AC-3.3's set-equality exists to catch.

**The corpus.** No single run exercises every row — the advisory tier ships disabled, the queue
rung is not part of the dev phase graph, and two rows sit on conditional recovery paths a
healthy run never enters. The corpus is therefore the union of the **recorded dispatch
descriptors** of five runs. A descriptor is the model value a dispatch carries, recorded when
the dispatch is composed, whether or not a model call is executed — so `--dry-run` and hermetic
fixture-driven runs both yield descriptors, and no row depends on billed traffic:

| # | Configuration | Provocation the fixture supplies |
|---|---|---|
| i | `pdlc dev`, full phase graph, advisory tier disabled | none — the healthy path: every reviewer emits a well-formed `VERDICT` trailer and the PLAN task table parses in-script |
| ii | `pdlc queue` with one ready row | none |
| iii | `pdlc dev`, `advisory.enabled: true`, reaching an advisory seam (a Phase-DOD A3/A4 assist is sufficient; any seam satisfies the row) | `fable` resolves normally |
| iv | run iii repeated | `fable` model resolution forced to fail, so the fallback branch is reached |
| v | `pdlc dev` with two response fixtures | (a) a reviewer response whose `VERDICT` trailer is malformed, provoking verdict recovery; (b) a PLAN whose task table the in-script parser rejects, provoking DAG extraction |

**The map.** Every dispatch descriptor in the corpus appears here, and every row below is
exercised by at least one descriptor in the corpus:

| Dispatch site | Model value | Corpus run |
|---|---|---|
| every phase except Phase I (`MODEL_DEFAULT`) | `opus` | i |
| Phase I implementation waves (`MODEL_IMPLEMENTATION`) | `sonnet` | i |
| advisory-tier dispatch (`MODEL_ADVISORY`) | `fable` | iii |
| advisory fallback (`MODEL_ADVISORY_FALLBACK`), reached only if `fable` fails to resolve | `opus` | iv |
| queue Phase-0 readiness triage (`MODEL_QUEUE`) | `sonnet` | ii |
| verdict-recovery re-emit dispatch, on a missing or malformed reviewer `VERDICT` trailer | `haiku` | v(a) |
| PLAN-DAG extraction fallback, on a PLAN task table the in-script parser rejects | `haiku` | v(b) |

Measured at HEAD: `orchestrate-dev.js:1603`, `:1646`, `:1652` (`MODEL_ADVISORY = "fable"`,
dispatched at `:1851`), `:1653` (fallback, dispatched at `:1861` behind the model-resolution
error check), `:7463` (verdict recovery, inside `recoverVerdict`), `:9968` (PLAN-DAG extraction,
in the else-branch after `parsePlanTasks` returns no tasks), `orchestrate-queue.js:70`.

## M-ENG-08 — What "logged-in Claude Code settings state" is inspectable as

Measured on the maintainer's macOS host, 2026-08-11, on a machine logged in to a Claude
subscription with `ANTHROPIC_API_KEY` absent (the M-ENG-04 environment):

- `~/.claude.json` is present and carries an **`oauthAccount`** object alongside `userID`. This
  is the inspectable evidence that the host is logged in.
- `~/.claude/settings.json` and `~/.claude/settings.local.json` carry **no** credential and no
  `apiKeyHelper` (`SPIKE-agent-sdk-auth.md:42`); they are settings, not auth state. The
  credential itself is not in any file the engine reads — on this platform it is in the OS
  keychain — so `oauthAccount`'s presence is *evidence of* a credential, never the credential.

**Per-platform scope (C-9).** This is one platform's measurement. Whether Linux and Windows hosts
carry the same record in the same path is unmeasured. On a host where no such evidence is
readable, the outcome is decided by `ANTHROPIC_API_KEY`, not by the unreadability alone
(correction, Phase-F erratum — the earlier closing clause "never a refusal" was over-broad by one
case and contradicted AC-2.1 row 5): with the key **absent** the run proceeds as `auth.unknown`
(AC-2.1 row 6, FSPEC §5.1 BR-AUTH-0); with the key **present** and `auth.allowApiKeyBilling` not
passed the run refuses at row 5 (`auth.api-key-refused`).
