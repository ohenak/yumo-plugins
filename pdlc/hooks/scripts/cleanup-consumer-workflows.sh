#!/usr/bin/env bash
# pdlc operator-invoked cleanup — never registered in hooks.json, never run automatically.
#
# Removes the retired plugin-channel consumer copy (<target-root>/.claude/workflows/) left
# behind by the now-deleted pdlc/hooks/scripts/sync-workflows.sh. All-or-nothing over a fixed,
# name-only classification (TSPEC §4.3, BR-CLN-3a): if every top-level entry in the target
# directory is one of the nine expected names, the whole directory is removed; if anything else
# is present, nothing is removed and the run aborts (exit 3), naming the unexpected entry so an
# operator can inspect it before re-running.
#
# Usage: cleanup-consumer-workflows.sh [--dry-run] <target-root>
#
# Exit codes (TSPEC §3.2):
#   0  — full or partial expected-only set removed (or target absent / already clean); or
#        --dry-run over an expected-only set (nothing removed)
#   3  — an unexpected entry is present; nothing removed
#   4  — bad invocation (wrong args), or the target directory could not be read; nothing removed
set -uo pipefail

usage() {
  echo "usage: $(basename "$0") [--dry-run] <target-root>" >&2
}

EXPECTED_ENTRIES=(
  "consolidate-learnings.bundle.js"
  "orchestrate-dev.bundle.js"
  "orchestrate-queue.bundle.js"
  "pdlc-cli.mjs"
  "orchestrate-dev.js"
  "orchestrate-queue.js"
  ".pdlc-drift-state.json"
  ".pdlc-sync-manifest.json"
  ".pdlc-backups"
)

is_expected() {
  local name="$1"
  local entry
  for entry in "${EXPECTED_ENTRIES[@]}"; do
    [ "$entry" = "$name" ] && return 0
  done
  return 1
}

# --- argument parsing (row 4a: exactly one optional --dry-run, then exactly one positional) ---
DRY_RUN=0
if [ "$#" -ge 1 ] && [ "$1" = "--dry-run" ]; then
  DRY_RUN=1
  shift
fi

if [ "$#" -ne 1 ]; then
  usage
  exit 4
fi

TARGET_ROOT="$1"
TARGET_DIR="$TARGET_ROOT/.claude/workflows"

# Target absent (never synced, or already cleaned) — no-op, success.
if [ ! -e "$TARGET_DIR" ]; then
  exit 0
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "cleanup-consumer-workflows: $TARGET_DIR exists but is not a directory" >&2
  exit 4
fi

# row 4b: unreadable target directory — exit 4 with a diagnostic naming the failing path.
# `ls -A` on a mode-000 directory fails for a non-root caller; root always bypasses permission
# bits, so this branch is unreachable (and TT-1b is skipped loudly, not silently) as root.
ENTRY_LIST="$(ls -A "$TARGET_DIR" 2>/dev/null)"
LIST_STATUS=$?
if [ "$LIST_STATUS" -ne 0 ]; then
  echo "cleanup-consumer-workflows: cannot read $TARGET_DIR" >&2
  exit 4
fi

# Classify every top-level entry: name-only, never content.
PRESENT=()
UNEXPECTED=()
while IFS= read -r name; do
  [ -z "$name" ] && continue
  if is_expected "$name"; then
    PRESENT+=("$name")
  else
    UNEXPECTED+=("$name")
  fi
done <<EOF
$ENTRY_LIST
EOF

if [ "${#UNEXPECTED[@]}" -gt 0 ]; then
  for name in "${UNEXPECTED[@]}"; do
    echo "cleanup-consumer-workflows: refusing to remove — unexpected entry: $TARGET_DIR/$name" >&2
  done
  exit 3
fi

if [ "$DRY_RUN" -eq 1 ]; then
  for name in "${PRESENT[@]}"; do
    echo "$name"
  done
  exit 0
fi

# All-or-nothing: every present entry is expected, so the whole directory (and every entry in
# it) is removed in one pass. A directory that holds only a classified subset of the nine names
# still no longer exists afterward (TT-4).
rm -rf -- "$TARGET_DIR"
exit 0
