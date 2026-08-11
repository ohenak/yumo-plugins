# DECISIONS — headless engine obligations

Operator adjudication of the eight obligations left open in §7 of
`REQ-pdlc-headless-engine.md` (O-1 … O-8), decided and measured on 2026-08-10. Each entry
either rules on a design question the REQ deliberately deferred, or records a probe result the
REQ obliged someone to measure before TSPEC. Read by the `se-author` authoring
`TSPEC-pdlc-headless-engine` — the TSPEC grounds on this file, not on the O-rows alone.

---

## DEC-HE-01: Guard parity is per-dispatch hook injection, not engine-side pre-flight (resolves O-2)

**Context.** C-5 requires the `guard-harvest-before-delete` invariant to hold for every
engine-dispatched agent, and AC-5.1 requires the guard to be sourced from the engine's own
dispatch configuration rather than from whatever hooks a plugin install happens to register.
O-2 left two candidate mechanisms open: per-dispatch hook/settings injection, or an
engine-side pre-flight check.

**Decision.** The engine composes the PreToolUse guard hook configuration itself and passes it
with **every** dispatch: the SDK `hooks` / `settings` options on the primary Agent-SDK transport
(confirmed typed in `@anthropic-ai/claude-agent-sdk@0.3.226`, `sdk.d.ts`, `Options.hooks`), and
`--settings` on the `claude -p` fallback. Engine-side pre-flight is **rejected as the
mechanism**: the deletion happens inside the child session mid-dispatch, so only an in-session
hook can *refuse* it as AC-5.1 demands; a pre-flight can only observe state before the session
starts. A post-dispatch integrity sweep is kept as defense-in-depth only, never as the guarantee.

**Why.** The hook configuration is engine-owned bytes — composed in the engine, fixture-testable
without a live dispatch, and independent of plugin-registered hooks. That is exactly the hook
*provenance* requirement O-2 named as the remaining open case once C-10 made plugin presence
certain.

**TSPEC obligation.** Specify the composed hook-config object once, per transport, plus the
mapping from it to each transport's option name; assert it identically on both paths.

---

## DEC-HE-02: One config surface — `.claude/pdlc.config.json`, with a reserved `engine.*` key (resolves O-3)

**Context.** O-3 asked whether engine configuration reuses the per-consumer
`.claude/pdlc.config.json`, or whether the engine gets a machine-global config file with
per-project override. The §4.1 knobs split two ways: some are plainly consumer-specific
(`implementation.testCommand`), some are plainly engine-level (`dispatch.retryAttempts`,
`dispatch.retryBackoff`, `dispatch.timeoutMinutes`, `queue.loopIdleExit`).

**Decision.** The per-consumer `.claude/pdlc.config.json` remains the **only** config file the
engine reads. The §4.1 engine knobs ship as compiled-in engine defaults and are overridable
under a reserved `engine.*` key in that same file. There is **no machine-global engine config
file**. `auth.allowApiKeyBilling` stays flag-only per §4.1 and never becomes a config entry —
opting into pay-per-token billing must be a per-invocation act (C-1).

**Why.** A second config layer would reintroduce exactly the which-copy-decides ambiguity this
feature exists to kill (§1's silent-staleness family): an operator debugging surprising
behaviour would again have to work out which of two files won. Compiled-in defaults plus one
overriding file gives a total, single-lookup resolution. A global layer remains additive later
if a real need appears; adding one is cheap, removing one is not.

**Scope.** Config *location and precedence* only. The threshold values themselves stay
governed by §4.1 and DEC-HE-05.

---

## DEC-HE-03: `--dry-run` prints a composed-dispatch manifest (resolves O-5)

**Context.** AC-3.1 and AC-3.2 are stated against "a dry-run surface" — the composed prompt is
inspected, and a plugin-handshake refusal is observed — but O-5 left the surface's shape as a
current assumption rather than a decision.

**Decision.** `pdlc dev --dry-run <req>` and `pdlc queue --dry-run` perform everything **up to
but excluding transport dispatch**: the C-10 plugin handshake, G-5 skill resolution and prompt
composition, model-pin forwarding, permission posture resolution, and the environment summary.
They then print one **composed-dispatch manifest** — a human-readable table, plus `--json` for
machine reads. Per dispatch the manifest carries: phase, skill file absolute path and the
SHA-256 of the inlined bytes, model, transport, permission posture, and hook-config provenance.

**Why.** This discharges AC-3.1 (full prompt text came from the installed plugin's
`SKILL.md`, no `pdlc:` namespace reference), AC-3.2 (handshake refusal is observable), and
AC-3.3 (model per dispatch matches the module's pin) with **no live model calls** — which is
what AC-6.1 requires of the test suite anyway. The SHA-256 makes "which bytes were inlined" a
checkable fact rather than a claim, and the same manifest is the natural evidence artifact for
R-6 skew debugging.

**TSPEC obligation.** Every manifest string is a C-8 catalogue entry with an asserted id; the
manifest joins the closed catalogue rather than being formatted ad hoc at the print site.

---

## DEC-HE-04: Session reuse stays deferred, with the seam reserved and named (resolves O-6)

**Context.** R-4 observes that `_sessionAgent` maps naturally onto session resume on both
transports, but that resumed-session non-interactive dispatch is the less-travelled path on
either. O-6 required the flag design to be deferred without painting the seam shut.

**Decision.** Dispatch remains **fresh-per-dispatch** — today's semantics, unchanged (G-6).
The config key `engine.session.enabled` is reserved (default absent, treated as `false`) under
the DEC-HE-02 surface. The TSPEC names the two implementations the seam would take, as inert
documentation: the SDK's `resume` / `sessionId` options on the primary transport, and
`claude -p --resume` on the fallback.

**Why.** Naming the two implementations now is what keeps the seam open: a future flag becomes
a wiring task rather than a transport investigation. Shipping the flag now would buy an
untested execution mode against no acceptance criterion.

**Scope.** No AC in this REQ depends on session reuse; validating it is the flag's own future
work, not residue this feature owes.

---

## DEC-HE-05: §4.1 rate-limit thresholds are provisional; re-derivation is a first-run step, not an instrumentation task (resolves O-7)

**Context.** §4.1's retry defaults (`dispatch.retryAttempts` = 3, `dispatch.retryBackoff` =
exponential from 30 s capped at 15 min) were chosen to absorb a transient rate-limit window
without masking a persistent one. They are not a measured floor, and O-7 forbids treating them
as settled until observed behaviour under real unattended load says so.

**Decision.** The defaults ship as stated and are re-derived from the **first real unattended
`pdlc queue --loop` session**. That run's AC-4.5 per-retry / per-pause rows are the
measurement: each row already carries taxonomy member, phase, attempt number and delay, and the
SDK's `rate_limit_event` stream message carries `resetsAt` and `rateLimitType` (measured in
`SPIKE-agent-sdk-auth.md`). §4.1 is amended to the observed values once that session completes.

**Why.** The measurement is already automatic — it falls out of the run report the engine must
produce regardless — so no separate instrumentation task is warranted, and none is created
here. Deriving thresholds from synthetic load would measure the harness, not the account.

**Scope.** Threshold *values* only. The retry taxonomy and pause semantics (AC-4.1, AC-4.2) are
settled and not reopened by this entry.

---

## DEC-HE-06: Unattended auth uses a `claude setup-token` credential (resolves O-4, operator decision 2026-08-10)

**Context.** C-1 requires subscription-first auth with a fail-loud refusal, and §1.3 lists
`claude setup-token` (`CLAUDE_CODE_OAUTH_TOKEN`) as one of the two subscription paths. O-4 held
the question of whether provisioning such a token is acceptable on the operator's account, and
what its lifetime and renewal story are in cron contexts.

**Decision.** Operator confirmed on 2026-08-10 that provisioning a long-lived token via
`claude setup-token` is acceptable ("not a big problem"). Unattended and cron runs use
`CLAUDE_CODE_OAUTH_TOKEN` obtained from that flow; interactive logged-in state remains the
default for attended runs. Both are subscription auth, so C-1's `apiKeySource` assertion is
unaffected by which one is in play.

**Measured fact (CLI 2.1.227).** `claude setup-token --help` is bare — "Set up a long-lived
authentication token (requires Claude subscription)" — with no lifetime, no renewal cadence and
no non-interactive mode documented. The flow is interactive-only, so the token is provisioned by
hand and then supplied to the unattended context by environment.

**TSPEC obligation.** The renewal runbook O-4 asks for records the **observed** token lifetime
and renewal behaviour at first provisioning, since the CLI documents neither. An expired token
mid-run is already covered mechanically: C-1's fail-loud refusal classifies it `auth-failure`,
which AC-4.4 requires never be silently retried.

---

## DEC-HE-07: Permission posture is bypass — named, catalogued and backstopped (operator decision 2026-08-10, refines C-6)

**Context.** C-6 requires the non-interactive permission posture to be one named, reviewable
engine setting rather than ad-hoc `--dangerously-skip-permissions` scattered through call sites,
and AC-3.4 asserts exactly that. The posture already implemented in
`pdlc/engine/lib/transport.mjs` is `permissionMode: "bypassPermissions"` with
`allowDangerouslySkipPermissions: true`. C-6 did not say *which* posture, only that it be
singular and named.

**Decision.** The existing bypass posture is kept, and becomes the named, catalogue-listed
engine setting `engine.permissionPosture` under the DEC-HE-02 config surface. This is
C-6-compliant: the constraint bans *scattered ad-hoc* escalation, not a named posture applied at
one site. The `claude -p` fallback maps the same setting to the CLI's
`--dangerously-skip-permissions` / `--allow-dangerously-skip-permissions` pair.

**Why.** Three reasons, in order of weight. It matches the operator's own interactive posture,
so the unattended path is not more permissive than the attended one it replaces. Commit
discipline is script-owned, not permission-owned — the modules decide what gets committed and
with which pathspec, so a permission prompt was never the control that made commits safe.
And the DEC-HE-01 guard hook is the hard backstop for the one destructive act that actually
matters (C-5, AC-5.1) — it refuses regardless of posture. A scoped-allowlist posture was
offered and **declined**: it pays maintenance cost every time a skill needs a new tool, for a
gate the guard hook already holds.

**Scope.** One setting, one resolution site, reported in the startup banner as a C-8 catalogue
string. Any second escalation site is an AC-3.4 defect, not a variation of this decision.

---

## DEC-HE-08: Measured transport and plugin-discovery contracts (resolves O-1 and O-8 by measurement, 2026-08-10)

**Context.** O-1 and O-8 are not design questions — they oblige someone to *measure* two
surfaces before TSPEC: the two transports' interface contracts (per C-9, which forbids
inferring runtime facts from documentation), and the installed pdlc plugin's location-discovery
mechanism that C-10's handshake and G-5's skill resolution both stand on. Probed on the
operator's machine on 2026-08-10.

**Decision.** Record the probe results below as the TSPEC's **fixture inventory baseline**.
The TSPEC fixtures the transports and the resolver against these observed shapes; it does not
re-derive them from docs.

**Versions.** CLI `2.1.227`. SDK `0.3.226`, which embeds Claude Code `2.1.226` and spawns the
CLI internally — there is no vendored `cli.js`, so the two transports are not as independent as
R-1 assumes in the worst case.

**Transport surface mismatches — a mapping layer is required.** The two surfaces are **not**
1:1, so the one `_agent` seam (G-2) needs a per-transport mapping layer behind it rather than
flag passthrough:

- The SDK has `maxTurns` and `cwd` options; the CLI has **no** `--max-turns` and **no** `--cwd`
  flag. C-3's consumer-repo `cwd` therefore has two different mechanisms per transport.
- Permission-mode value sets differ. CLI: `acceptEdits`, `auto`, `bypassPermissions`, `manual`,
  `dontAsk`, `plan`. SDK `PermissionMode`: `default`, `acceptEdits`, `bypassPermissions`,
  `plan`, `dontAsk`, `auto`. The CLI lacks `default` and adds `manual`. DEC-HE-07's posture is
  in both sets, but the mapping cannot be identity.

**Message fixtures needed.** SDK: `system/init` (carries a typed `apiKeySource` — the C-1
tripwire), `rate_limit_event` (feeds DEC-HE-05), and the terminal `SDKResultMessage`
success/error union, where **only the success arm carries `result`** — an error arm read as
success is precisely the `transport-contract-violation` AC-4.1 demands. CLI: `--output-format
json` and `stream-json` outputs.

**Plugin discovery (O-8).** Resolution is **registry-file-based and deterministic**, not a
directory search, which answers O-8's multiple-candidate-roots question by construction:

- `~/.claude/settings.json` → `enabledPlugins["pdlc@yumo-plugins"]` says the plugin is enabled.
- `~/.claude/plugins/installed_plugins.json` carries the entry, whose `installPath` points at a
  version-keyed cache dir `~/.claude/plugins/cache/yumo-plugins/pdlc/{version}`, with a
  `gitCommitSha` provenance field matching the marketplace clone's HEAD.
- C-10's handshake therefore reads: registry → `installPath` → `.claude-plugin/plugin.json`
  version → sibling `skills/` tree (G-5).
- Orphaned versions carry `.orphaned_at` markers. These are an audit trail, **not** resolver
  input — the resolver never enumerates cache dirs to pick a winner.
- The dev repo is never an install root. Measured live skew: installed `0.22.0` vs dev-repo
  `0.22.7` — exactly the R-6 case C-10 exists to catch.

**Two fail-closed edge cases for TSPEC fixtures.** (i) A registry-pointed directory whose
manifest version disagrees with the registry entry — observed in the wild: a cache dir named
`0.19.0` containing a manifest declaring `0.21.0` ⇒ handshake refusal. (ii) A missing registry
entry ⇒ C-10's "not found" refusal. Neither is repaired, guessed past, or resolved by
preferring one source; both refuse before any dispatch, per C-10.
