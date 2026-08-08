# SPIKE — Claude Agent SDK auth (pdlc-headless-engine, Phase 0)

Date: 2026-08-08

## Question

Can the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) run on this machine
without consuming pay-per-token API credit — i.e. does it work with
subscription auth? Official SDK docs say the SDK requires `ANTHROPIC_API_KEY`
and cannot use subscription entitlements. This spike tests that claim
empirically, on this machine, with `ANTHROPIC_API_KEY` verified absent from
the process environment and from both Claude Code settings files.

## Protocol

1. Environment audit: `env | grep -i anthropic`; inspect
   `~/.claude/settings.json` and `~/.claude/settings.local.json` for
   `apiKeyHelper` or `env` blocks that could inject a key.
2. SDK probe: `pdlc/engine/bin/pdlc.mjs spike:sdk` calls the SDK's `query()`
   with prompt `"Reply with exactly: HELLO-PDLC-SPIKE"`, options
   `{ model: "haiku", maxTurns: 1 }`, iterating every emitted message and
   printing it verbatim, including the terminal `result` message's
   usage/cost fields.
3. Control probe: `claude -p "Reply with exactly: HELLO-PDLC-CONTROL"
   --model haiku --output-format json` — the known-subscription CLI path —
   captured in full for comparison.
4. Contingency: if the SDK probe demanded an API key, record the exact error
   and stop (not exercised — see Findings).

## Raw observations

### 4a. Environment audit

```
$ env | grep -i anthropic
ANTHROPIC_BASE_URL=http://127.0.0.1:8787
ANTHROPIC_CUSTOM_HEADERS=X-Headroom-Project: yumo-plugins
```

No `ANTHROPIC_API_KEY` in the environment.

`~/.claude/settings.json` — present, no `apiKeyHelper` key, no `env` block:

```json
{
  "model": "fable",
  "enableWorkflows": true,
  "statusLine": { "type": "command", "command": "bash /Users/kaneho/.claude/statusline-command.sh" },
  "enabledPlugins": { "...": "..." },
  "extraKnownMarketplaces": { "...": "..." },
  "alwaysThinkingEnabled": true,
  "effortLevel": "medium",
  "tui": "fullscreen",
  "skipDangerousModePermissionPrompt": true,
  "skipWorkflowUsageWarning": true,
  "agentPushNotifEnabled": true
}
```

`~/.claude/settings.local.json` — present, no `apiKeyHelper` key, no `env`
block (only `permissions` and a `SessionStart` hook):

```json
{
  "permissions": {
    "allow": ["Bash(mkdir:*)", "Bash(ln *)", "Bash(unlink /Users/kaneho/workspace)"],
    "deny": [],
    "ask": []
  },
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/kaneho/.local/bin/headroom wrap selfheal --marker headroom-wrap-selfheal",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

Neither file can inject `ANTHROPIC_API_KEY`.

### 4b. SDK probe

Installed package: `@anthropic-ai/claude-agent-sdk@0.3.226` (per
`pdlc/engine/package.json` / `package-lock.json`, resolved by `npm install`).

Command: `node pdlc/engine/bin/pdlc.mjs spike:sdk`. Completed in a few
seconds (well under the 120s kill threshold — no kill was needed).

Selected messages, verbatim (full transcript captured; system/init and
thinking-token bookkeeping messages omitted here for brevity — none of them
carried cost/auth information beyond what's shown):

`system/init` message included:

```json
"apiKeySource": "none",
"model": "claude-haiku-4-5-20251001",
```

Final assistant text: `"HELLO-PDLC-SPIKE"`.

`rate_limit_event` message (emitted before the terminal result):

```json
{
  "type": "rate_limit_event",
  "rate_limit_info": {
    "status": "allowed",
    "resetsAt": 1786248000,
    "rateLimitType": "five_hour",
    "overageStatus": "rejected",
    "overageDisabledReason": "org_level_disabled",
    "isUsingOverage": false
  }
}
```

Terminal `result` message, verbatim:

```json
{
  "is_error": false,
  "duration_api_ms": 2167,
  "num_turns": 1,
  "stop_reason": "end_turn",
  "session_id": "0730ff3f-dd9a-4844-adef-85e25044eec2",
  "total_cost_usd": 0.037099,
  "usage": {
    "input_tokens": 10,
    "cache_creation_input_tokens": 18272,
    "cache_read_input_tokens": 0,
    "output_tokens": 109,
    "server_tool_use": { "web_search_requests": 0, "web_fetch_requests": 0 },
    "service_tier": "standard",
    "cache_creation": { "ephemeral_1h_input_tokens": 18272, "ephemeral_5m_input_tokens": 0 },
    "inference_geo": "not_available",
    "iterations": [ { "input_tokens": 10, "output_tokens": 109, "cache_read_input_tokens": 0, "cache_creation_input_tokens": 18272, "cache_creation": { "ephemeral_5m_input_tokens": 0, "ephemeral_1h_input_tokens": 18272 }, "type": "message" } ],
    "speed": "standard"
  },
  "modelUsage": {
    "claude-haiku-4-5-20251001": {
      "inputTokens": 10,
      "outputTokens": 109,
      "cacheReadInputTokens": 0,
      "cacheCreationInputTokens": 18272,
      "webSearchRequests": 0,
      "costUSD": 0.037099,
      "contextWindow": 200000,
      "maxOutputTokens": 32000,
      "canonicalModel": "claude-haiku-4-5",
      "provider": "firstParty"
    }
  },
  "permission_denials": [],
  "terminal_reason": "completed",
  "fast_mode_state": "off",
  "fast_mode_disabled_reason": "sdk_opt_in_required",
  "subtype": "success",
  "api_error_status": null,
  "result": "HELLO-PDLC-SPIKE",
  "ttft_ms": 2008,
  "ttft_stream_ms": 1054,
  "time_to_request_ms": 14,
  "type": "result",
  "duration_ms": 2181
}
```

No exception was thrown; no prompt or error demanded an API key.

### 4c. Control probe

Command: `claude -p "Reply with exactly: HELLO-PDLC-CONTROL" --model haiku --output-format json`

Full JSON output, verbatim:

```json
{"is_error":false,"duration_api_ms":4713,"num_turns":1,"stop_reason":"end_turn","session_id":"2a61c288-25c5-457a-85f6-11ca71cd813b","total_cost_usd":0.040497899999999996,"usage":{"input_tokens":10,"cache_creation_input_tokens":19707,"cache_read_input_tokens":5289,"output_tokens":109,"server_tool_use":{"web_search_requests":0,"web_fetch_requests":0},"service_tier":"standard","cache_creation":{"ephemeral_1h_input_tokens":19707,"ephemeral_5m_input_tokens":0},"inference_geo":"not_available","iterations":[{"input_tokens":10,"output_tokens":109,"cache_read_input_tokens":5289,"cache_creation_input_tokens":19707,"cache_creation":{"ephemeral_5m_input_tokens":0,"ephemeral_1h_input_tokens":19707},"type":"message"}],"speed":"standard"},"modelUsage":{"claude-haiku-4-5-20251001":{"inputTokens":10,"outputTokens":109,"cacheReadInputTokens":5289,"cacheCreationInputTokens":19707,"webSearchRequests":0,"costUSD":0.040497899999999996,"contextWindow":200000,"maxOutputTokens":32000,"canonicalModel":"claude-haiku-4-5","provider":"firstParty"}},"permission_denials":[],"terminal_reason":"completed","fast_mode_state":"off","fast_mode_disabled_reason":"sdk_opt_in_required","subtype":"success","api_error_status":null,"result":"HELLO-PDLC-CONTROL","ttft_ms":4612,"ttft_stream_ms":3407,"time_to_request_ms":19,"type":"result","duration_ms":4732,"uuid":"331c334c-0cd6-4b79-802e-6b277ccdeebd"}
```

## Findings

- **The SDK ran successfully with no `ANTHROPIC_API_KEY` present anywhere in
  the process environment or in either Claude Code settings file.** No
  exception was thrown; no auth prompt or error occurred. Contingency step
  4d (record-and-stop on a key demand) was not triggered.
- The SDK's own `system/init` message reports `"apiKeySource": "none"` —
  the SDK itself observed it had no API key configured, for both the probe
  and (implicitly, same mechanism) the control.
- The terminal `result` message from both the SDK probe and the CLI control
  probe carry the **same shape** of cost/usage fields
  (`total_cost_usd`, `usage.*`, `modelUsage.*`), and both report a nonzero
  `total_cost_usd` (SDK: `0.037099`; control: `0.0404979`). This field is
  present in both paths and is not, by itself, evidence of real per-token
  billing — it reads as a notional/list-price cost annotation computed
  locally regardless of how the call was actually authorized or billed.
  This spike did not observe an actual charge or invoice; it only observed
  what the SDK/CLI report inline.
- The SDK probe additionally emitted a `rate_limit_event` message
  (`rateLimitType: "five_hour"`, `overageStatus: "rejected"`,
  `overageDisabledReason: "org_level_disabled"`, `isUsingOverage: false`)
  before the terminal result. A `five_hour` rate-limit window with overage
  explicitly disabled and rejected is the shape associated with
  subscription-plan rate limiting, not a pay-as-you-go API key — an API-key
  path would not typically report an "overage" concept tied to a rolling
  session window. This message was not requested by the protocol but was
  emitted unprompted and is included here as raw observation.
- Both the SDK probe and the control probe ran with `ANTHROPIC_BASE_URL`
  set to `http://127.0.0.1:8787` (the local "headroom" proxy) for the whole
  shell session; the SDK does not offer, and this spike did not use, any
  override to bypass that base URL. Traffic therefore left the SDK process
  through the same local proxy as the known-subscription CLI control. This
  spike did not independently packet-capture the proxy's upstream leg, so
  "went through the proxy base URL" is established for the client side by
  configuration (`ANTHROPIC_BASE_URL`), not by a separate network trace.
- Model resolution: the requested `model: "haiku"` alias resolved to
  `claude-haiku-4-5-20251001` in both probes, matching.
- Summary: on this machine, with `ANTHROPIC_API_KEY` verified absent from
  environment and settings, and with the shell's local proxy base URL in
  effect, the SDK's `query()` completed a real model call and returned a
  result — behaviorally indistinguishable, on every field this spike
  captured, from the known-subscription `claude -p` CLI control. This
  contradicts a strict reading of "the SDK requires `ANTHROPIC_API_KEY` and
  cannot use subscription entitlements" for this environment; it does not
  by itself prove *why* (e.g., whether the local proxy itself performs
  subscription-based auth injection/translation that is invisible to the
  SDK client, versus the SDK having a genuine subscription-auth path).

## Explicitly-not-decided

Whatever transport/auth approach `pdlc-headless-engine` should actually use in
production remains an architecture decision for the operator/architect — this
spike reports facts only and makes no recommendation.
