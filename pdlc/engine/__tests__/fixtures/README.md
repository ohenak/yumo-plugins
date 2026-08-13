# Fixtures

This directory holds fixtures for more than one concern. See `consumer-ac12/README.md` for the
AC-1.2 filesystem-observation consumer fixture (TSPEC §7.7, PROP-READ-4, PLAN T46). The rest of
this file documents the per-transport dispatch fixtures below.

## Per-transport fixtures (`AC-6.3`, `BR-VER-2`, `AT-ENG-64`, TSPEC §7.2)

This directory holds one recorded fixture set per dispatch transport:

- `transport-sdk/` — Agent SDK message streams, one file per scenario, each a JSON array of the
  messages `queryFn`'s async iterable would yield in order (`type: "system", subtype: "init"` with
  `apiKeySource`, `type: "rate_limit_event"`, and a terminal `type: "result"`). This is the shape
  `lib/transport.mjs` consumes directly.
- `transport-cli/` — the fallback's `claude -p --output-format stream-json` output, one file per
  scenario, each a newline-delimited JSON (`.jsonl`) file of the same message shapes recorded from
  the CLI's stdout, one JSON object per line. Per TSPEC §3.4, `apiKeySource` is reported "in the same
  field in the stream-json init line" as the SDK, so the two sets carry parallel scenarios under
  matching basenames wherever the scenario applies to both transports.

Scenarios recorded, mirrored by basename across both directories where applicable:

| File | What it records |
|---|---|
| `success.json` / `success.jsonl` | A normal successful dispatch: `apiKeySource: "none"`, one `rate_limit_event` with `status: "allowed"`, terminal `result` with `subtype: "success"`. |
| `auth-policy-violation.json` / `.jsonl` | `system/init` reports `apiKeySource: "user"` — outside the default `["none"]` policy (`DEFAULT_API_KEY_SOURCE_POLICY`, `transport.mjs:63`) but inside the five-member widened set `--allow-api-key-billing` admits. The stream is truncated after `init` because a real dispatch never proceeds past the auth gate in this case (`transport.mjs:201-206`). |
| `rate-limited.json` / `.jsonl` | `apiKeySource: "none"`, one `rate_limit_event` with `status: "rejected"`, terminal `result` with an error subtype (`error_during_execution`) and a `rate limited` message in `errors`. |
| `no-terminal-result.json` / `.jsonl` | A stream that ends after `init` and one `rate_limit_event` without ever yielding a `result` message — the "absent terminal result" contract violation both transports must reject as a `TransportError` rather than an empty success. |
| `transport-sdk/multi-dispatch-source-change/dispatch-{1..5}.json` | Five independent single-dispatch SDK streams standing in for one 5-dispatch run (`PROP-AUTH-9`, `AT-ENG-18`, `BR-AUTH-5`). Dispatches 1, 2, 4, 5 report `apiKeySource: "none"`; dispatch 3 reports `"user"` — the source changing mid-run that the per-dispatch (not per-run) auth assertion must catch, with both observed values present in the run report. |

Every scenario is a hand-authored, redacted stand-in built from the shapes the SPIKE
(`docs/completed/pdlc-headless-engine/SPIKE-agent-sdk-auth.md`) recorded from the real SDK and a real
`claude -p --output-format stream-json` run — no session id, cost figure or usage count here was
copied verbatim from a real account; all are illustrative values in the right shape and range.

## Refreshing a fixture set

Fixtures are recorded from each transport's real output, not written by hand once the two
transports exist. To refresh a set against a newer SDK or CLI release:

```sh
# SDK set — capture the raw message stream from a real query() call, one scenario at a time,
# redirecting the async-iterated messages (as JSON, one array per file) into transport-sdk/<scenario>.json.
node pdlc/engine/bin/pdlc.mjs spike:sdk

# CLI set — capture stdout from a real headless run, one scenario at a time, into
# transport-cli/<scenario>.jsonl (already newline-delimited JSON; no reformatting needed).
claude -p "<scenario prompt>" --model haiku --output-format stream-json
```

After recording, **run the redaction scanner before committing**: `node --test
pdlc/engine/__tests__/fixtures-redaction.test.js`. The scanner's negative half walks this directory
and fails the refresh if any recorded file contains a credential; its positive half proves the
scanner itself still catches every rule below by flagging a scratch file built from them, so a
broken pattern fails loudly here instead of passing silently over a freshly recorded fixture.

## Redaction rules

A fixture may **never** contain a credential. The scanner (`__tests__/fixtures-redaction.test.js`)
flags exactly the rules named in TSPEC §7.2, no more and no fewer than what this table documents:

| Rule | Pattern | What it catches |
|---|---|---|
| API key literal | `sk-ant-` followed by 20 or more characters of `[A-Za-z0-9_-]` | A raw Anthropic API key pasted into a recorded message field. |
| `ANTHROPIC_API_KEY` assignment | `ANTHROPIC_API_KEY` followed by `:` or `=` and a non-empty, non-whitespace value | An env-var assignment accidentally captured in a fixture (e.g. a recorded env block). |
| `ANTHROPIC_AUTH_TOKEN` assignment | `ANTHROPIC_AUTH_TOKEN` followed by `:` or `=` and a non-empty, non-whitespace value | Same as above, for the auth-token variable. |

Naming a variable with no value assigned (e.g. mentioning `ANTHROPIC_API_KEY` in prose, as this file
does above) is not a match — only an assignment to a non-empty value is. Account identifiers
(session ids, cost figures, usage counts) are not covered by these three rules and are redacted at
recording time by using illustrative values, per the note above, rather than by the scanner.
