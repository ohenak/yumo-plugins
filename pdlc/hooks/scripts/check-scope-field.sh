#!/usr/bin/env bash
# pdlc advisory PostToolUse hook.
# When a CROSS-REVIEW-*.md file is written/edited without a "Scope" tag, nudge the
# agent to add one (Local | Cross-Feature | Process) so the harvest phase can later
# preserve durable signal. Never blocks — always exits 0.
set -uo pipefail

input="$(cat)"

# Extract the written file path from the hook's tool_input. python3 is always present
# in this toolchain; fall back to empty (no-op) if parsing fails.
fp="$(printf '%s' "$input" | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get("tool_input", {}).get("file_path", "") or "")
except Exception:
    print("")
' 2>/dev/null || true)"

case "$fp" in
  *CROSS-REVIEW-*.md) ;;
  *) exit 0 ;;
esac

[ -f "$fp" ] || exit 0

# Already tagged? (Look for a Scope column header or inline tag.)
if grep -qiE 'scope|cross-feature' "$fp"; then
  exit 0
fi

msg="pdlc: $(basename "$fp") has no Scope tag on its findings. Add a Scope column \
(Local | Cross-Feature | Process) to each finding so the harvest phase can decide what \
durable signal to preserve."

# Surface as advisory context to the agent (non-blocking).
printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\"${msg}\"}}"
exit 0
