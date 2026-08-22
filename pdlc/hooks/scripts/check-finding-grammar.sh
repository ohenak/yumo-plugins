#!/usr/bin/env bash
# pdlc advisory PostToolUse hook.
# When an erratum-round CROSS-REVIEW-*.md file (a delta-confirmation round) is written/edited,
# nudge the agent if it carries no line-leading "FINDING:" lines, since the engine's fail-closed
# gate reads ONLY those lines — findings buried in prose or tables are invisible to it, and a
# non-approving verdict with zero FINDING: lines fails closed on any High/delta/nonlocal halt.
# Also nudge if a findings table declares provenance/locality tags (delta/inherited,
# local/nonlocal) that are never transcribed into a FINDING: line, since the gate credits only
# FINDING: lines. Never blocks — always exits 0.
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
  *) exit 0 ;;
esac

[ -f "$fp" ] || exit 0

# Only lint erratum-round (delta-confirmation) cross-reviews. Detect via a
# "## Delta-Confirmation Findings" heading, a "DELTA CONFIRMATION" / "Delta-Confirmation"
# marker, or a findings table with Provenance/Locality columns; otherwise say nothing.
if ! grep -qiE '^##[[:space:]]*Delta-Confirmation Findings|DELTA CONFIRMATION|Delta-Confirmation|Provenance.*Locality|Locality.*Provenance' "$fp"; then
  exit 0
fi

# Count line-leading "FINDING:" lines (leading whitespace trimmed). Note: this does not
# exclude fenced code blocks, so a FINDING: line quoted inside ``` ``` would be
# (harmlessly) counted — false-positive risk accepted for simplicity.
finding_count="$(grep -cE '^[[:space:]]*FINDING[[:space:]]*:' "$fp" || true)"

if [ "$finding_count" -eq 0 ]; then
  msg="pdlc: $(basename "$fp") looks like an erratum-round (delta-confirmation) cross-review but \
has no line-leading FINDING: lines. The engine's gate reads ONLY these lines — findings stated in \
prose or table rows are invisible to it, and a non-approving verdict with zero FINDING: lines \
fails closed on any High/delta/nonlocal halt. Add FINDING: <severity> | <provenance> | <locality> \
| <ref> | <description> lines for every finding."

  printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\"${msg}\"}}"
  exit 0
fi

# Tag consistency: collect provenance/locality tokens seen in table rows (lines containing "|"
# that are not FINDING: lines), and check each token also appears in at least one FINDING: line.
missing_tags="$("$PY_BIN" -c '
import sys, re

lines = sys.stdin.read().splitlines()
finding_lines = [l for l in lines if re.match(r"^\s*FINDING\s*:", l)]
finding_blob = "\n".join(finding_lines).lower()

tokens = ["delta", "inherited", "local", "nonlocal"]
table_lines = [l for l in lines if "|" in l and not re.match(r"^\s*FINDING\s*:", l)]
table_blob = "\n".join(table_lines).lower()

missing = []
for tok in tokens:
    pattern = r"\b" + tok + r"\b"
    if re.search(pattern, table_blob) and not re.search(pattern, finding_blob):
        missing.append(tok)

print(",".join(missing))
' < "$fp" 2>/dev/null || true)"

if [ -n "$missing_tags" ]; then
  msg="pdlc: $(basename "$fp") has a findings table declaring provenance/locality tag(s) \
(${missing_tags}) that never appear in any FINDING: line. The engine's gate credits only FINDING: \
lines — transcribe each table row's declared tags into its FINDING: line so the gate sees them."

  printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\"${msg}\"}}"
  exit 0
fi

exit 0
