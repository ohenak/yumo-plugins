#!/usr/bin/env bash
# pdlc advisory SessionStart hook.
# When >= THRESHOLD feature LEARNINGS files have not yet been folded into a consolidation
# pass, nudge the user to run /pdlc:consolidate-learnings. Never blocks (always exit 0).
# "Un-consolidated" = LEARNINGS basename not referenced in docs/_decisions/.consolidation-log.md.
set -uo pipefail

cat >/dev/null 2>&1 || true  # drain stdin if present

python3 - <<'PY'
import os, glob, json, sys

THRESHOLD = 5
proj = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()

learnings = glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))
if not learnings:
    sys.exit(0)

log = os.path.join(proj, "docs", "_decisions", ".consolidation-log.md")
logtext = ""
if os.path.isfile(log):
    try:
        with open(log, encoding="utf-8", errors="ignore") as fh:
            logtext = fh.read()
    except Exception:
        logtext = ""

pending = [p for p in learnings if os.path.basename(p) not in logtext]
n = len(pending)
if n >= THRESHOLD:
    msg = ("pdlc: %d feature LEARNINGS files have not been consolidated yet. "
           "Consider running /pdlc:consolidate-learnings to promote recurring patterns "
           "into docs/_constraints and docs/_decisions." % n)
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart",
                                              "additionalContext": msg}}))
sys.exit(0)
PY
