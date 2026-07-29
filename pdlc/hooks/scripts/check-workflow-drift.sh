#!/bin/bash
# check-workflow-drift.sh — C2, the SessionStart drift-check hook.
#
# FSPEC §5.1 (AC-2.1-2.5a, 2.8, 2.4), §4.2 (ordering), §5.2 (warning taxonomy), §8 (message
# catalogue). TSPEC §5, §2.2 (C1 sourced surface).
#
# Sources C1 (lib/pdlc-drift.sh, complete through layer 5) and reuses it verbatim — this file
# does not reimplement any of C1's classifier/writer/message logic. Its own job is exactly the
# entrypoint's: drain stdin, run the shared drift computation, create `.claude/`/
# `.claude/workflows/` when needed (§4.2 step 3 — explicitly NOT C1's job, see
# `pdlc_write_drift_state`'s own header comment), build the resolved-record JSON, call the
# shared writer with generatedBy "hook", emit §5.2's warning taxonomy in order, and ALWAYS
# exit 0 (AC-2.4). Silence means verified, never skipped (AC-2.2).
#
# Bash 3.2 compatible (macOS's shipped /bin/bash): no associative arrays, no namerefs, no
# bashisms newer than 3.2. `set -u` safe throughout. `LC_ALL=C`/`LANG=C` exported
# unconditionally. Only probe-sandbox PATH tools are used (bash, git, python3, shasum,
# sha1sum, mv, rm, date, printf) — `dirname`, `basename`, `sort`, `cp`, `cat`, `mkdir` are
# absent, so bash-native parameter expansion is used throughout, same as C1 itself.

set -u
export LC_ALL=C
export LANG=C

# AC-2.4 is absolute: a broken drift check must never block a session from starting. The trap
# covers an unanticipated internal error; the unconditional `exit 0` at the very end of this
# file covers ordinary fall-through. Every call below whose non-zero return is EXPECTED (not a
# crash) is guarded with `|| true` (or is inside an `if`) specifically so it never reaches this
# trap — bash's ERR trap does not fire for a command that is not the final one in a `||`/`&&`
# list or the condition of an `if`/`while`, so that guarding is sufficient without per-branch
# `exit 0` discipline.
trap 'exit 0' ERR

# Drain the SessionStart JSON on stdin — its content is not needed, but the hook contract reads
# it. Bash-native (no `cat`): a single `read -d ''` consumes everything up to EOF without risk
# of blocking (the caller closes stdin after writing).
_PDLC_HOOK_STDIN=""
IFS= read -r -d '' _PDLC_HOOK_STDIN <&0 2>/dev/null || true

# Source C1 tolerantly (TSPEC §11.2 convention) — `${BASH_SOURCE[0]%/*}` rather than `dirname`
# (absent from the probe sandbox PATH; same idiom as `bin/lib-probe.sh`, cf58ac7's precedent).
_PDLC_HOOK_SCRIPT_DIR="${BASH_SOURCE[0]%/*}"
if [ "$_PDLC_HOOK_SCRIPT_DIR" = "${BASH_SOURCE[0]}" ]; then
  _PDLC_HOOK_SCRIPT_DIR="."
fi
# shellcheck disable=SC1091
source "${_PDLC_HOOK_SCRIPT_DIR}/lib/pdlc-drift.sh" 2>/dev/null || true

# §4.2 steps 1-2: resolve the baseline (evidence + selection, E1-E7) and classify every row +
# probe retired paths, as-found. `pdlc_load_manifest`'s own last step (`pdlc_resolve_baseline`)
# returns 1 on an unresolved baseline — expected, not a crash — so this is never a bare
# statement.
pdlc_load_manifest || true

# The hash-tool probe (SE Q-02: runs once per run, `pdlc_classify_row` only reads
# `PDLC_HASH_BIN` and never re-probes it itself) must happen before classification.
if [ -z "${PDLC_HASH_BIN:-}" ]; then
  pdlc_probe_hash_tool || true
fi

pdlc_classify_all "hook" || true

_pdlc_repo_root="${PDLC_REPO_ROOT:-}"
_pdlc_baseline_status="${PDLC_BASELINE_STATUS:-unresolved}"
_pdlc_baseline_reason="${PDLC_BASELINE_REASON:-}"
_pdlc_evidence_repo_root="${PDLC_EVIDENCE_REPO_ROOT:-does-not-hold}"
_pdlc_check_enabled="${PDLC_CHECK_ENABLED:-true}"

# ───────────────────────── §2.1's no-write-target rule (FSPEC §4.2, §5.1 exception 1) ─────────
#
# Keyed on the E1 EVIDENCE holding, never on which reason was selected for reporting — a
# higher-precedence reason (manifest-absent, manifest-empty, json-tool-absent,
# manifest-malformed) is frequently reported while this evidence also holds. Steps 3-9 are
# skipped entirely: nothing is created, nothing is written.
if [ "$_pdlc_evidence_repo_root" = "holds" ]; then
  printf '%s\n' "$(pdlc_msg_w1 "$_pdlc_baseline_reason")" >&2
  if [ "$_pdlc_baseline_reason" != "repo-root-unresolved" ]; then
    printf 'pdlc: no write target — the consumer repo root did not resolve, so nothing was recorded this run. Create .claude/ at the intended root, or run inside a git work tree.\n' >&2
  fi
  exit 0
fi

# ───────────────────────── §4.2 step 3 — mkdir -p .claude/ .claude/workflows/ ──────────────────
#
# Explicitly the entrypoint's job, not `pdlc_write_drift_state`'s. Must also work with no
# JSON/python tool present (FSPEC §4.4a: "the run creates the directory (step 3)" even under
# T1), so it cannot route through `PDLC_PY_BIN`. `mkdir -p` is the mechanism FSPEC §4.2 step 3
# names verbatim.
_pdlc_workflows_dir="${_pdlc_repo_root}/.claude/workflows"
if [ ! -d "$_pdlc_workflows_dir" ]; then
  if pdlc_fault_active "mkdir"; then
    PDLC_WRITE_FAILURES+=("${_pdlc_workflows_dir}"$'\x1f'"mkdir")
  else
    mkdir -p -- "$_pdlc_workflows_dir" 2>/dev/null || true
    if [ -d "$_pdlc_workflows_dir" ]; then
      pdlc_trace "run" "mkdir" "-" "$_pdlc_workflows_dir"
    else
      PDLC_WRITE_FAILURES+=("${_pdlc_workflows_dir}"$'\x1f'"mkdir")
    fi
  fi
fi

# ───────────────────────── §5.7 — probe retired paths (independent of managed-row states) ─────
#
# AC-0.3b forces `retiredPresent == []` whenever `baselineStatus == "unresolved"` — computed
# here regardless (rows are empty in every unresolved case this hook can reach, so the loop
# below is a no-op then), but only actually emitted/serialised when resolved (guarded below).
declare -a _PDLC_RETIRED_PATH=()
declare -a _PDLC_RETIRED_BY=()
declare -a _PDLC_RETIRED_STATE=()
_pdlc_n_rows=${#PDLC_ROWS_ID[@]:-0}
_pdlc_i=0
while [ "$_pdlc_i" -lt "$_pdlc_n_rows" ]; do
  _pdlc_retires_joined="${PDLC_ROWS_RETIRES[$_pdlc_i]:-}"
  if [ -n "$_pdlc_retires_joined" ]; then
    _pdlc_split_on $'\x1f' "$_pdlc_retires_joined"
    for _pdlc_retired_rel in "${_PDLC_SPLIT_RESULT[@]:-}"; do
      [ -z "$_pdlc_retired_rel" ] && continue
      if [ -e "${_pdlc_repo_root}/${_pdlc_retired_rel}" ]; then
        _PDLC_RETIRED_PATH+=("$_pdlc_retired_rel")
        _PDLC_RETIRED_BY+=("${PDLC_ROWS_ID[$_pdlc_i]:-}")
        _PDLC_RETIRED_STATE+=("${PDLC_STATE[$_pdlc_i]:-}")
      fi
    done
  fi
  _pdlc_i=$((_pdlc_i + 1))
done

# ───────────────────────── §4.2 step 8 — build the record ──────────────────────────────────────
#
# Only attempted when a JSON tool is present; when it is not, `recordJson` stays empty and
# `pdlc_write_drift_state` ignores it, writing the closed-domain `json-tool-absent` record
# itself through the same printf emitter (§4.4a, T1) — this is the shared writer's own
# documented fallback, not something this script special-cases.
_pdlc_record_json=""
if [ -n "${PDLC_PY_BIN:-}" ]; then
  _pdlc_generated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  _pdlc_plugin_version="${PDLC_MANIFEST_PLUGIN_VERSION:-}"
  if [ -z "$_pdlc_plugin_version" ]; then
    _pdlc_plugin_version_json="null"
  else
    _pdlc_plugin_version_json="$(printf '%s' "$_pdlc_plugin_version" | "$PDLC_PY_BIN" -c 'import json, sys; sys.stdout.write(json.dumps(sys.stdin.read()))')"
  fi

  _pdlc_sync_cmd="$(pdlc_sync_command)" || _pdlc_sync_cmd=""
  if [ -z "$_pdlc_sync_cmd" ]; then
    _pdlc_sync_cmd_json="null"
  else
    _pdlc_sync_cmd_json="$(printf '%s' "$_pdlc_sync_cmd" | "$PDLC_PY_BIN" -c 'import json, sys; sys.stdout.write(json.dumps(sys.stdin.read()))')"
  fi

  # baselineReason is one of the closed eight-member enumeration (safe to inline verbatim, same
  # convention `pdlc_emit_printf_record` already uses for it).
  if [ "$_pdlc_baseline_status" = "resolved" ] || [ -z "$_pdlc_baseline_reason" ]; then
    _pdlc_baseline_reason_json="null"
  else
    _pdlc_baseline_reason_json="\"${_pdlc_baseline_reason}\""
  fi

  # rows[]/retiredPresent[] — [] when unresolved (AC-0.3b), else built from this run's as-found
  # classification (§4.2's table: hook carries step 2, the only pass).
  _pdlc_rows_tsv=""
  _pdlc_retired_tsv=""
  if [ "$_pdlc_baseline_status" = "resolved" ]; then
    _pdlc_i=0
    while [ "$_pdlc_i" -lt "$_pdlc_n_rows" ]; do
      _pdlc_rows_tsv="${_pdlc_rows_tsv}${PDLC_ROWS_ID[$_pdlc_i]:-}"$'\t'"${PDLC_STATE[$_pdlc_i]:-}"$'\t'"${PDLC_REASON[$_pdlc_i]:-}"$'\t'"${PDLC_PLUGIN_HASH[$_pdlc_i]:-}"$'\t'"${PDLC_CONSUMER_HASH[$_pdlc_i]:-}"$'\t'"${PDLC_PLUGIN_ARTIFACT_VERSION[$_pdlc_i]:-}"$'\t'"${PDLC_CONSUMER_ARTIFACT_VERSION[$_pdlc_i]:-}"$'\n'
      _pdlc_i=$((_pdlc_i + 1))
    done

    _pdlc_j=0
    _pdlc_n_retired=${#_PDLC_RETIRED_PATH[@]:-0}
    while [ "$_pdlc_j" -lt "$_pdlc_n_retired" ]; do
      _pdlc_retired_tsv="${_pdlc_retired_tsv}${_PDLC_RETIRED_PATH[$_pdlc_j]}"$'\t'"${_PDLC_RETIRED_BY[$_pdlc_j]}"$'\t'"${_PDLC_RETIRED_STATE[$_pdlc_j]}"$'\n'
      _pdlc_j=$((_pdlc_j + 1))
    done
  fi

  _pdlc_rows_json="$(printf '%s' "$_pdlc_rows_tsv" | "$PDLC_PY_BIN" -c '
import sys, json
rows = []
for line in sys.stdin.read().split("\n"):
    if line == "":
        continue
    parts = line.split("\t")
    while len(parts) < 7:
        parts.append("")
    id_, state, reason, pHash, cHash, pVer, cVer = parts[:7]
    rows.append({
        "id": id_,
        "state": state,
        "reason": reason or None,
        "pluginHash": pHash or None,
        "consumerHash": cHash or None,
        "pluginArtifactVersion": pVer or None,
        "consumerArtifactVersion": cVer or None,
    })
sys.stdout.write(json.dumps(rows))
')"

  _pdlc_retired_json="$(printf '%s' "$_pdlc_retired_tsv" | "$PDLC_PY_BIN" -c '
import sys, json
items = []
for line in sys.stdin.read().split("\n"):
    if line == "":
        continue
    parts = line.split("\t")
    while len(parts) < 3:
        parts.append("")
    path, by, state = parts[:3]
    items.append({"path": path, "supersededBy": by, "supersedingState": state})
sys.stdout.write(json.dumps(items))
')"

  # writeFailures — the closed nine-member `operation` domain, filtered to the five recordable
  # members (§4.5) via C1's own predicate; the four stderr-only members (incl. this script's own
  # `mkdir`) never appear here (they are still emitted on stderr, below, via W-7).
  _pdlc_failures_tsv=""
  for _pdlc_entry in "${PDLC_WRITE_FAILURES[@]:-}"; do
    [ -z "$_pdlc_entry" ] && continue
    _pdlc_fpath="${_pdlc_entry%%$'\x1f'*}"
    _pdlc_fop="${_pdlc_entry#*$'\x1f'}"
    if _pdlc_write_failure_op_is_stderr_only "$_pdlc_fop"; then
      continue
    fi
    _pdlc_failures_tsv="${_pdlc_failures_tsv}${_pdlc_fpath}"$'\t'"${_pdlc_fop}"$'\n'
  done

  _pdlc_failures_json="$(printf '%s' "$_pdlc_failures_tsv" | "$PDLC_PY_BIN" -c '
import sys, json
items = []
for line in sys.stdin.read().split("\n"):
    if line == "":
        continue
    path, op = line.split("\t", 1)
    items.append({"path": path, "operation": op})
sys.stdout.write(json.dumps(items))
')"

  _pdlc_record_json="$(printf '{"schemaVersion":1,"generatedAtUtc":"%s","generatedBy":"hook","pluginVersion":%s,"checkEnabled":%s,"syncCommand":%s,"baselineStatus":"%s","baselineReason":%s,"retiredPresent":%s,"writeFailures":%s,"rows":%s}' \
    "$_pdlc_generated_at" "$_pdlc_plugin_version_json" "$_pdlc_check_enabled" "$_pdlc_sync_cmd_json" \
    "$_pdlc_baseline_status" "$_pdlc_baseline_reason_json" "$_pdlc_retired_json" "$_pdlc_failures_json" "$_pdlc_rows_json")"
fi

# ───────────────────────── §4.2 step 9 — atomic write of the drift state ───────────────────────
pdlc_write_drift_state "$_pdlc_repo_root" "$_pdlc_record_json" "hook" || true

# ───────────────────────── §5.2 — the warning taxonomy, exhaustive over non-silence, in order ──
if [ "$_pdlc_baseline_status" != "resolved" ]; then
  # Order 1 — W-1, unresolved baseline. No rows are printed.
  printf '%s\n' "$(pdlc_msg_w1 "$_pdlc_baseline_reason")" >&2
else
  # Order 2 — W-2, any row unknown.
  _pdlc_i=0
  while [ "$_pdlc_i" -lt "$_pdlc_n_rows" ]; do
    if [ "${PDLC_STATE[$_pdlc_i]:-}" = "unknown" ]; then
      printf '%s\n' "$(pdlc_msg_w2 "${PDLC_ROWS_ID[$_pdlc_i]:-}" "${PDLC_REASON[$_pdlc_i]:-}")" >&2
    fi
    _pdlc_i=$((_pdlc_i + 1))
  done

  # Order 3 — W-3, any row unverified.
  _pdlc_i=0
  while [ "$_pdlc_i" -lt "$_pdlc_n_rows" ]; do
    if [ "${PDLC_STATE[$_pdlc_i]:-}" = "unverified" ]; then
      printf '%s\n' "$(pdlc_msg_w3 "${PDLC_ROWS_ID[$_pdlc_i]:-}")" >&2
    fi
    _pdlc_i=$((_pdlc_i + 1))
  done

  # Order 4 — W-4, any row local-edit.
  _pdlc_i=0
  while [ "$_pdlc_i" -lt "$_pdlc_n_rows" ]; do
    if [ "${PDLC_STATE[$_pdlc_i]:-}" = "local-edit" ]; then
      printf '%s\n' "$(pdlc_msg_w4 "${PDLC_ROWS_ID[$_pdlc_i]:-}" "${_pdlc_workflows_dir}/.pdlc-backups")" >&2
    fi
    _pdlc_i=$((_pdlc_i + 1))
  done

  # Order 5 — W-5, any row stale or missing.
  _pdlc_i=0
  while [ "$_pdlc_i" -lt "$_pdlc_n_rows" ]; do
    _pdlc_state_i="${PDLC_STATE[$_pdlc_i]:-}"
    if [ "$_pdlc_state_i" = "stale" ] || [ "$_pdlc_state_i" = "missing" ]; then
      printf '%s\n' "$(pdlc_msg_w5 "${PDLC_ROWS_ID[$_pdlc_i]:-}" "$_pdlc_state_i")" >&2
    fi
    _pdlc_i=$((_pdlc_i + 1))
  done

  # Order 6 — W-6, retiredPresent non-empty, independently of managed-row states.
  _pdlc_j=0
  _pdlc_n_retired=${#_PDLC_RETIRED_PATH[@]:-0}
  while [ "$_pdlc_j" -lt "$_pdlc_n_retired" ]; do
    printf '%s\n' "$(pdlc_msg_w6 "${_PDLC_RETIRED_PATH[$_pdlc_j]}" "${_PDLC_RETIRED_BY[$_pdlc_j]}" "${_PDLC_RETIRED_STATE[$_pdlc_j]}")" >&2
    _pdlc_j=$((_pdlc_j + 1))
  done
fi

# Order 7 — W-7, writeFailures non-empty (one line per entry, including this script's own
# stderr-only `mkdir` entries, which never reach the JSON array above).
for _pdlc_entry in "${PDLC_WRITE_FAILURES[@]:-}"; do
  [ -z "$_pdlc_entry" ] && continue
  _pdlc_fpath="${_pdlc_entry%%$'\x1f'*}"
  _pdlc_fop="${_pdlc_entry#*$'\x1f'}"
  printf '%s\n' "$(pdlc_msg_w7 "$_pdlc_fpath" "$_pdlc_fop")" >&2
done

exit 0
