#!/usr/bin/env bash
# pdlc advisory PostToolUse hook.
# When a REQ-*.md file is written/edited and exceeds the pdlc REQ size budget (700 lines or
# 60 KiB), nudge the author to split it into phased REQs per pm-author's "REQ Size Budget"
# section. Never blocks — always exits 0.
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
  */REQ-*.md) ;;
  *) exit 0 ;;
esac

[ -f "$fp" ] || exit 0

# Hard ceiling: 700 lines or 61440 bytes (60 KiB).
LINE_LIMIT=700
BYTE_LIMIT=61440

line_count="$(wc -l < "$fp" | tr -d ' ')"
byte_count="$(wc -c < "$fp" | tr -d ' ')"

if [ "$line_count" -le "$LINE_LIMIT" ] && [ "$byte_count" -le "$BYTE_LIMIT" ]; then
  exit 0
fi

msg="pdlc: $(basename "$fp") is ${line_count} lines / ${byte_count} bytes, over the REQ size \
budget (target 300-500 lines, hard ceiling 700 lines or 60 KB). Split it into phased REQs per \
pm-author's REQ Size Budget section instead of continuing to grow this document."

# Surface as advisory context to the agent (non-blocking).
printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\"${msg}\"}}"
exit 0
