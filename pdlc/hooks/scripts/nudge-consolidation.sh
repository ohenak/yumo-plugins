#!/usr/bin/env bash
# pdlc advisory SessionStart hook.
# When >= THRESHOLD feature LEARNINGS files have not yet been folded into a consolidation
# pass, nudge the user to run /pdlc:consolidate-learnings. Never blocks (always exit 0).
# "Un-consolidated" = LEARNINGS basename not referenced in docs/_decisions/.consolidation-log.md.
set -uo pipefail

cat >/dev/null 2>&1 || true  # drain stdin if present

# Pick a usable Python interpreter. On Windows `python3` is absent and bare `python`
# may resolve to the Microsoft Store stub (prints a notice, exits non-zero), so probe
# each candidate by actually running it. Never block the session if none is found.
PY_BIN=""
for cand in python3 python py; do
  if command -v "$cand" >/dev/null 2>&1 && "$cand" -c "import sys" >/dev/null 2>&1; then
    PY_BIN="$cand"
    break
  fi
done
[ -z "$PY_BIN" ] && exit 0

"$PY_BIN" - <<'PY'
import os, glob, json, sys

THRESHOLD = 5

# Two regions of the consolidation log: a legacy prose region (bare substring membership)
# and a block region (per-line equality against a trimmed line), per TSPEC §7.1.
def region_split(logtext):
    if not logtext:
        return "", set()
    idx = logtext.find("<!-- pdlc:consumed")
    if idx == -1:
        return logtext, set()
    legacy = logtext[:idx]
    rest = logtext[idx:]
    closer = "<!-- /pdlc:consumed -->"
    spans = []
    pos = 0
    while True:
        start = rest.find("<!-- pdlc:consumed", pos)
        if start == -1:
            break
        end = rest.find(closer, start)
        if end == -1:
            spans.append(rest[start:])
            break
        spans.append(rest[start:end])
        pos = end + len(closer)
    block_lines = set()
    for span in spans:
        for line in span.split("\n"):
            t = line.strip()
            if t:
                block_lines.add(t)
    return legacy, block_lines

proj = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()

CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")
learnings = [p for g in CORPUS_GLOBS for p in glob.glob(os.path.join(proj, *g.split("/")))]

log = os.path.join(proj, "docs", "_decisions", ".consolidation-log.md")
logtext = ""
if os.path.isfile(log):
    try:
        with open(log, encoding="utf-8", errors="ignore") as fh:
            logtext = fh.read()
    except Exception:
        logtext = ""

legacy, block_lines = region_split(logtext)
pending = [p for p in learnings
           if os.path.basename(p) not in legacy and os.path.basename(p) not in block_lines]

if os.environ.get("PDLC_CONSOLIDATION_DEBUG") == "1":
    names = sorted(set(os.path.basename(p) for p in pending))
    sys.stderr.write("PDLC_PENDING:" + ",".join(names) + "\n")

n = len(pending)
if n >= THRESHOLD:
    msg = ("pdlc: %d feature LEARNINGS files have not been consolidated yet. "
           "Consider running /pdlc:consolidate-learnings to promote recurring patterns "
           "into docs/_constraints and docs/_decisions." % n)
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart",
                                              "additionalContext": msg}}))
sys.exit(0)
PY
