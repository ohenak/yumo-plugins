# pdlc-engine-baseline — measured facts for the headless-engine feature family

> **What this is.** The measured facts about this repo that the `pdlc-headless-engine`,
> `pdlc-engine-distribution` and `pdlc-plugin-retirement` REQs are stated over. Extracted
> verbatim in substance from `docs/completed/pdlc-headless-engine/REQ-pdlc-headless-engine.md` §1.2
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

Measured by the Phase-0 spike `docs/completed/pdlc-headless-engine/SPIKE-agent-sdk-auth.md`
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
AC-1.1…AC-6.4 appears in at least one row below, and a criterion added to the REQ without a row
here is a defect in this fact, not a gap the reader resolves. A criterion whose clauses differ in
state is **split across rows, each row naming its clause explicitly** (correction, Phase-F erratum
round 5 — AC-4.5 appeared in the green row "except its per-dispatch auth clause" and in the red row
as that clause; the earlier "exactly one row" wording contradicted it — since resolved, see
below). Every clause of a split criterion carries a state, so the split is a partition, not a gap.
"Partially green" is a state in its own right: some half of the criterion is asserted at HEAD and
the row names the unasserted half.

**Re-measured at HEAD** (correction, DoD F-06 — the table below was a `pdlc dev` P1–P4 (v0.6)
snapshot; `lib/auth.mjs`, `lib/outcome.mjs`, `lib/catalogue.mjs`, `__tests__/_bootstrap.mjs`'s
construction guard, `__tests__/skills-composition.test.js`'s `DISPATCHABLE_SET`, the T48
five-run corpus (`d81954f1`, `ee61e371`), and T51's opt-in `__tests__/live/smoke.test.js`
landed after that snapshot and were never folded back in, so nine rows the table called red or
partially green are green at this commit, and a tenth (AC-6.2) moved from red to partially
green): only AC-2.3, AC-4.4, and AC-6.2 remain short of green, each for a reason named in its
own row below, not because the table was stale.

| AC | State at HEAD | Evidence |
|---|---|---|
| AC-1.2 (skill/plugin read containment), AC-1.3 (queue triage), AC-2.5 (`cwd`), AC-3.1 (composed prompt), AC-3.2 (handshake refusal), AC-3.4 (single permission setting), AC-4.2 (retry), AC-4.5 (report fields, pause rows, **and** its per-dispatch auth clause — `adapter.mjs`'s `getAuthSources()` now records one `{skill, phase, attempt, apiKeySource}` entry per dispatch attempt, not a single scalar) | **green — regression-protecting** | `pdlc/engine/__tests__/{transport,skills,startup,handshake,adapter,report,run,cli,smoke}.test.js`; AC-4.5's per-dispatch clause at `adapter.mjs:465` (`lastApiKeySource`), `:485-491` (per-attempt `authSourcesLog.push`), `:578-580` (`getApiKeySource`/`getAuthSources`), asserted by `__tests__/adapter-descriptor.test.js:280` ("authSources records one row per attempt, each with its own attempt index and phase (AC-2.4, AC-4.5)") |
| AC-4.1 (six-member outcome taxonomy) | **green** — `lib/outcome.mjs` (new module, not present in the P1–P4 snapshot) holds the frozen six-member `OUTCOMES` catalogue and the one total classifier over it; both the individual classifications and the set-equality over the closed catalogue are asserted | `lib/outcome.mjs:35-42` (`OUTCOMES`), `:55-65` (`classifyOutcome`); `__tests__/outcome.test.js:45` ("OUTCOMES is exactly the six-member catalogue, frozen"); suite-wide forward-direction set-equality over the outcome-taxonomy row at `__tests__/assert-suite-wide.test.js` (T19) |
| AC-1.5 (anti-fork) | **green** — both halves exist, and the specifier check is now the stated repo-relative check, not the weaker `file:`-prefix check | `__tests__/run.test.js:51` (no vendored copy), `:67` ("module URLs resolve to the exact repo-relative pdlc/workflows/ path, not just a file: URL (PROP-FORK-1)"), asserting `fileURLToPath(url)` equals the exact repo-relative path |
| AC-1.4 (halt recording), AC-4.3 (no orphan child, halt recorded), AC-6.1 (hermeticity guard) | **green** — `__tests__/_bootstrap.mjs` now installs an explicit construction guard (intercepts `node:child_process` `spawn`/`execFile` on a `claude` basename) and a socket/tls trap, both proven to fire, not merely present | `smoke.test.js:295` (halt leaves history intact, on `feat-{f}`); `__tests__/hermeticity.test.js:111` ("the construction guard fails a direct `claude` child_process.spawn"), `:125` ("a transport built without an injected queryFn reaches the real SDK client, and the construction guard fails it") |
| AC-2.3 (environment passthrough) | partially green — the dispatch env is the parent env spread into a new object, so a first-dispatch assertion passes today; BR-ENV-3's *every-dispatch* half is unasserted, and no test pins the fallback transport's inherited child env | `pdlc/engine/lib/transport.mjs:159` (`{ ...env }`), `:168` (passed as the dispatch options' `env`); asserted by `__tests__/transport.test.js:170` ("dispatch env spreads the provided env rather than replacing it") |
| AC-4.4 (`auth-failure` never silently retried) | partially green — an auth outcome is classified, named with its failing source, excluded from the retry loop and test-covered, and the closed-catalogue naming AC-4.1 owns is itself now delivered (see AC-4.1's row); still unasserted: that the run stops through the modules' halt path on an `auth-failure` outcome | `AuthPolicyError` defined at `transport.mjs:23`, classified first by `classifyThrown` at `:100`, thrown at `:204` before any model output with the failing `apiKeySource` named in its message; structurally never retried (`adapter.mjs:291` rethrows anything that is not a `RateLimitedError`); covered by `__tests__/transport.test.js:50` (`instanceof AuthPolicyError` asserted at `:63`); no test in `pdlc/engine/__tests__/` drives an `auth-failure` outcome through a full `dev`/`queue` run and asserts the halt path |
| AC-1.1 (parity oracle) | **green** — `__tests__/parity.test.js` asserts the closed creation-event set, cross-review verdict/count pairing, and approval-anchor presence, both the positive and falsifying halves | `__tests__/parity.test.js:241` (closed core passes), `:258`/`:268` (falsifiers), `:286` (verdict/count pairing), `:297` (anchor presence) |
| AC-2.1/2.2/2.4 (banner mapping, startup refusal, billing oracle) | **green** — `lib/auth.mjs` (new module, not present in the P1–P4 snapshot) holds `readLoginEvidence` and the frozen six-row `AUTH_ROWS` `resolveAuthPosture` walks; `startup.mjs` wires it into rung 2/3 and the handshake banner names the resolved catalogue id, never a raw `apiKeySource` | `lib/auth.mjs:17` (`readLoginEvidence`), `:61` (`AUTH_ROWS`), `:113` (`resolveAuthPosture`); `__tests__/auth.test.js:119` (six-row, frozen, first-match), `:141`-`:206` (rows 1–6 individually); `__tests__/handshake.test.js:140` (banner names catalogue id), `:171` ("BR-AUTH-2: banner never carries transport-reported apiKeySource — only startup catalogue id") |
| AC-3.3 (model map) | **green** — the T48 five-configuration corpus (`d81954f1`) drives every one of the seven model-map rows through the real adapter and the real `orchestrate-dev.js`/`orchestrate-queue.js` modules, offline, and asserts each row's model value | `pdlc/engine/__tests__/_corpus.mjs` (shared fixture builders); `__tests__/smoke.test.js:410` (corpus run i, rows 1–2), `:484` (run ii, row 5), `:523` (run iii, row 3), `:558` (run iv, row 4), `:599` (run v(a), row 6), `:636` (run v(b), row 7) |
| AC-3.5 (skill set-equality) | **green** — `startup.mjs`'s rung 4 now asserts true bidirectional set-equality (Direction A: every dispatchable identifier's prompt file is readable; Direction B: every installed prompt file is reachable by some dispatchable identifier, minus the named operator-only skills), fail-closed at startup, not the old frozen-list containment | `startup.mjs:245` (`skillDirOf`), `:257-280` (`evalRung4`, both directions), `:400` (`push("4", "dispatchable skills readable (AC-3.5)", ...)`); `__tests__/skills-composition.test.js:64` (`DISPATCHABLE_SET (union of modules) is exactly 10`, derived from the workflow modules' own `DEV_SKILLS`/`QUEUE_SKILLS`, equals the 10-identifier expected set over 12 prompt files) |
| AC-5.1/5.2 (guard parity) | **green** — `__tests__/guard-parity.test.js` covers both the primary (hook-based) and fallback (`--settings`) guard carriers: allow/deny survival, stderr byte-exactness, matcher mis-build (no false negative), missing script, posture-widening refusal, script-reuse (no reimplementation), config independence across dispatches, and scope (both class name and removal form required) | `__tests__/guard-parity.test.js:208` (PROP-GUARD-4), `:244` (PROP-GUARD-5), `:269`/`:292` (PROP-GUARD-6a/6b), `:315` (PROP-GUARD-7), `:375` (PROP-GUARD-8, fallback), `:408` (PROP-GUARD-9), `:436`/`:445` (PROP-GUARD-10a/10b), `:468`-`:491` (PROP-GUARD-11a/11b/11c) |
| AC-6.3 (fixtures) | **green** — recorded, per-transport fixture sets exist for both transports and are the corpus both `transport-boundary.test.js` and `transport-cli.test.js` test against | `pdlc/engine/__tests__/fixtures/transport-sdk/` (`auth-policy-violation.json`, `no-terminal-result.json`, `rate-limited.json`, `success.json`), `fixtures/transport-cli/` (the same four cases as `.jsonl`); refresh step documented in `fixtures/README.md`; `__tests__/transport-boundary.test.js`, `__tests__/transport-cli.test.js` |
| AC-6.4 (catalogue) | **green** — `lib/catalogue.mjs` (new module, not present in the P1–P4 snapshot) holds the registered message catalogue; both directions of AC-6.4(a)'s set-equality are asserted (an emitted id with no registered entry fails, a registered id no path ever emits fails), and AC-6.4(b)'s malformed-input classification is covered by `outcome.test.js` (AC-4.1, above) | `lib/catalogue.mjs`; `__tests__/catalogue.test.js:15`-`:77` (registration, frozen severities, `messageIds()`); `__tests__/assert-suite-wide.test.js:145` (forward direction: emitted id with no `messageIds()` entry fails the step), `:163` (reverse direction: registered id never emitted fails the step) |
| AC-6.2 (live smoke) | partially green, correctly gated — `__tests__/live/smoke.test.js` (T51) now exists: it drives one real feature end-to-end through the same `runDev`/`createAdapter` seams as the hermetic suite, over a real transport, and asserts the AC-1.1 structural set plus a cross-check against the report. Collected by `node --test __tests__/` and SKIPPED there (no `PDLC_LIVE=1`), so it never taxes the hermeticity guard or CI; run directly (`PDLC_LIVE=1 node --test __tests__/live/smoke.test.js`) it pays real dispatch cost. **The mechanism is delivered; no maintainer-recorded live run exists yet** — unlike M-ENG-09's dated table (§ below), this AC has no evidence row of its own at HEAD, so it stays open until one is run and recorded, not because the test is missing | `__tests__/live/smoke.test.js:158` (`test(..., { skip: ... })`), `:83` (`LIVE = process.env.PDLC_LIVE === "1"`) |

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

## M-ENG-09 — PreToolUse deny under bypassPermissions

| date | platform | transport | sdkVersion | denyFired |
|---|---|---|---|---|
| 2026-08-12 | darwin | agent-sdk | 0.3.226 | yes |

## M-ENG-10 — The PR gate is five required checks, and these are their literal names

Measured 2026-08-13 at `89babe8e`, re-measured 2026-08-13 (review round 2).
`.github/workflows/pr-tests.yml` declares **five** jobs. Two alphabets exist and they are not the
same set: the YAML `name:` string as authored, and the **rendered** name GitHub reports for the
resulting check — which is what Phase PUB polls and what a branch protection rule names. Rows 1
and 2 differ between the two columns; rows 3–5 are identical in both.

| # | YAML `name:` as authored | Rendered check name (what GitHub reports) | Job at |
|---|---|---|---|
| 1 | `Unit tests (${{ matrix.os }}, node ${{ matrix.node }})` | `Unit tests (ubuntu-latest, node 20)` | `pr-tests.yml:28` |
| 2 | `Engine tests (${{ matrix.os }})` | `Engine tests (ubuntu-latest)` | `:78` |
| 3 | `Generated artifacts are in sync` | `Generated artifacts are in sync` | `:112` |
| 4 | `Fresh-clone bootstrap works` | `Fresh-clone bootstrap works` | `:138` |
| 5 | `Shell scripts parse` | `Shell scripts parse` | `:196` |

Matrix is `os: [ubuntu-latest]` × node `'20'` for the unit-tests job (`:40-41`) and `os:
[ubuntu-latest]` with no node axis for the engine job (`:87`), which is what expands rows 1 and 2
above. **A matrix edit — another OS, another Node version — changes the rendered set without
changing the authored one**, so any assertion written over the authored column alone stays green
while every rendered-name consumer (Phase PUB, branch protection) breaks. Both columns are
authoritative; a change to either is a change to this fact first.
`Engine tests` postdates the 2026-08-08 snapshot that earlier drafts enumerated as four checks.

## M-ENG-11 — Two version numbers exist, and the engine package is unpublishable as declared

Measured 2026-08-13 at `89babe8e`, `pdlc/engine/package.json`:

| Fact | Value | Line |
|---|---|---|
| package name | `pdlc-engine` — **unscoped** | `:2` |
| package version | `0.1.0` — independent of the plugin's | `:3` |
| `private` | `true` — `npm publish` refuses outright; no ordering against the licence or credential blockers is claimed, none was measured | `:4` |
| `pdlcPluginCompat` | `^0.22.0` | `:9` |
| `license` | `UNLICENSED` | `:11` |
| `files` | **absent** — `npm pack` ships the package directory's default set | — |

The plugin manifest `pdlc/.claude-plugin/plugin.json:4` declares `0.22.7`. The two numbers are
independent: nothing reads one from the other.

## M-ENG-12 — The workflow modules live outside the engine package root, and a vendored copy is a shipped test failure

`pdlc/engine/lib/run.mjs:52-54` resolves both modules by relative escape above the package root
(`new URL("../../workflows/orchestrate-dev.js", import.meta.url)`), so an `npm pack` of
`pdlc/engine/` contains no workflow module. Two shipped tests pin that arrangement:
`pdlc/engine/__tests__/run.test.js:51` fails if any `orchestrate-{dev,queue}.js` exists anywhere
under `pdlc/engine/`, and `:67` asserts each resolved specifier equals the exact repo-relative
`pdlc/workflows/` path. Vendoring the modules at build time therefore turns both green tests red.

## M-ENG-13 — Provenance exists engine-side only; the workflow layer cannot see a version

`pdlc/engine/lib/report.mjs:77-78` already carries `engineVersion` and `pluginVersion` in the
report the CLI returns, and the module docblock states the engine never edits `pdlc/workflows/`.
The workflow modules carry no version field (`grep engineVersion pdlc/workflows/orchestrate-dev.js`
→ no match) and cannot obtain one: they run in the constrained workflow runtime where `process`,
`fs` and `import` do not exist (DEC-DIST-01). The artifacts a halt commits — the POSTMORTEM file
and the `QUEUE.md` row — are written by that layer. No `dev`/channel marker exists in the report's
field set (`report.mjs:77-96`).
