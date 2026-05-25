#!/usr/bin/env bash
# pdlc blocking PreToolUse hook (matcher: Bash).
# Refuses to delete any CROSS-REVIEW-*.md file until a sibling LEARNINGS-*.md exists
# in the same feature directory — enforcing harvest-then-delete (Phase H).
# Exit 2 blocks the tool call and feeds stderr back to the agent. Exit 0 allows.
set -uo pipefail

input="$(cat)"

python3 - "$input" <<'PY'
import sys, json, os, glob, re

raw = sys.argv[1] if len(sys.argv) > 1 else ""
try:
    data = json.loads(raw)
except Exception:
    sys.exit(0)  # unparseable -> don't interfere

cmd = (data.get("tool_input", {}) or {}).get("command", "") or ""

# Only a removal command that touches cross-review files is in scope.
if "CROSS-REVIEW" not in cmd:
    sys.exit(0)
if not re.search(r'(?:^|\s|;|&|\|)(?:rm|unlink)\b|\bgit\s+rm\b', cmd):
    sys.exit(0)

proj = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()

# Pull out the CROSS-REVIEW path tokens and the dirs they live in.
tokens = re.findall(r'\S*CROSS-REVIEW-[\w.\-]*', cmd)
dirs = set()
for t in tokens:
    t = t.strip('\'"')
    dirs.add(os.path.dirname(t))

blocked = []
for d in sorted(dirs):
    abs_d = d if os.path.isabs(d) else os.path.join(proj, d)
    if not glob.glob(os.path.join(abs_d, "LEARNINGS-*.md")):
        blocked.append(d or ".")

if blocked:
    sys.stderr.write(
        "pdlc guard: refusing to delete CROSS-REVIEW files in [%s] — no LEARNINGS-*.md "
        "exists there yet. Run /pdlc:harvest-learnings and commit LEARNINGS first "
        "(harvest-then-delete).\n" % ", ".join(blocked)
    )
    sys.exit(2)

sys.exit(0)
PY
