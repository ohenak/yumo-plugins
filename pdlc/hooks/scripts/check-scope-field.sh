#!/usr/bin/env bash
# pdlc advisory PostToolUse hook.
# When a CROSS-REVIEW-*.md or CODE_REVIEW-*.md file is written/edited without a "Scope"
# tag, nudge the agent to add one (Local | Cross-Feature | Process) so the harvest phase
# can later preserve durable signal. Never blocks — always exits 0.
set -uo pipefail

input="$(cat)"

# Pick a usable Python interpreter. On Windows `python3` is absent and bare `python` may
# resolve to the Microsoft Store stub (prints a notice, exits non-zero), so probe each
# candidate by running it. No-op if none is available.
PY_BIN=""
for cand in python3 python py; do
  if command -v "$cand" >/dev/null 2>&1 && "$cand" -c "import sys" >/dev/null 2>&1; then
    PY_BIN="$cand"
    break
  fi
done
[ -z "$PY_BIN" ] && exit 0

# Extract the written file path from the hook's tool_input; fall back to empty (no-op) if parsing fails.
fp="$(printf '%s' "$input" | "$PY_BIN" -c '
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get("tool_input", {}).get("file_path", "") or "")
except Exception:
    print("")
' 2>/dev/null || true)"

case "$fp" in
  *CROSS-REVIEW-*.md) ;;
  *CODE_REVIEW-*.md) ;;
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
