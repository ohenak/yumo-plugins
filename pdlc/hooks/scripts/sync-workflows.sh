#!/usr/bin/env bash
# sync-workflows.sh — PDLC workflow-distribution sync/check entrypoint (PLAN T-37, C3).
#
# Usage:
#   sync-workflows.sh            plain sync — copies `stale`/`missing` rows, retires resolved
#                                 superseded paths, rewrites the sync manifest, records drift state.
#   sync-workflows.sh --check    read-only: classifies, reports, writes drift state — never
#                                 touches any artifact, backup, sync-manifest, or retired path.
#   sync-workflows.sh --force    like plain sync, but also overwrites `local-edit`/`unverified`
#                                 rows after a verified backup.
#
# `--check --force` together is a usage error (exit 4).
#
# Sources `lib/pdlc-drift.sh` (C1) for the classifier, backup/copy/retire primitives, the
# invalidation ladder, and the message catalogue — this script owns only: argument parsing,
# `mkdir -p .claude/workflows`, the ten-step ordering (FSPEC §4.2), the not-managed listing
# (FSPEC §3.5), the drift-state record's JSON construction, and exit-code computation (FSPEC
# §5.8). bash 3.2 compatible, `set -u` safe, `LC_ALL=C` forced for byte-wise comparisons; only
# uses probe-sandbox PATH tools (`bash`, `git`, `python3`, `shasum`/`sha1sum`, `mv`, `rm`, `date`,
# `printf`) plus bash builtins/parameter expansion — no `dirname`, `basename`, `sort`, `cp`,
# `cat`, `mkdir`, `ls`.

set -u
export LC_ALL=C

_pdlc_c3_dir="${BASH_SOURCE[0]%/*}"
[[ "$_pdlc_c3_dir" == "${BASH_SOURCE[0]}" ]] && _pdlc_c3_dir="."

# shellcheck source=lib/pdlc-drift.sh
. "${_pdlc_c3_dir}/lib/pdlc-drift.sh"

# ───────────────────────────── argument parsing ─────────────────────────────

_pdlc_c3_check=0
_pdlc_c3_force=0

for _pdlc_c3_arg in "$@"; do
  case "$_pdlc_c3_arg" in
    --check) _pdlc_c3_check=1 ;;
    --force) _pdlc_c3_force=1 ;;
    *)
      printf 'pdlc: usage: sync-workflows.sh [--check] [--force]\n' >&2
      exit 4
      ;;
  esac
done

if ((_pdlc_c3_check && _pdlc_c3_force)); then
  printf 'pdlc: usage: --check and --force are mutually exclusive\n' >&2
  exit 4
fi

_pdlc_c3_generated_by="sync"
((_pdlc_c3_check)) && _pdlc_c3_generated_by="check"

# ───────────────────────────── run-scoped state ─────────────────────────────

_pdlc_c3_any_write_failed=0
declare -a _PDLC_C3_RETIRED_PATH=()
declare -a _PDLC_C3_RETIRED_ID=()
declare -a _PDLC_C3_RETIRED_STATE=()

# ───────────────────────────── JSON record builder ─────────────────────────────

IFS= read -r -d '' _PDLC_C3_BUILD_RECORD_PY <<'PDLC_C3_BUILD_RECORD_PY' || true
import sys, json, datetime


def to_null(s):
    return s if s != "" else None


meta = None
fails = []
retired = []
rows = []

for line in sys.stdin.read().split("\n"):
    if not line:
        continue
    parts = line.split("\x1f")
    tag = parts[0]
    if tag == "META":
        meta = parts[1:]
    elif tag == "FAIL":
        fails.append({"path": parts[1], "operation": parts[2]})
    elif tag == "RETIRED":
        retired.append(
            {"path": parts[1], "supersededBy": parts[2], "supersedingState": parts[3]}
        )
    elif tag == "ROW":
        rows.append(
            {
                "id": parts[1],
                "state": parts[2],
                "reason": to_null(parts[3]),
                "pluginHash": to_null(parts[4]),
                "consumerHash": to_null(parts[5]),
                "pluginArtifactVersion": to_null(parts[6]),
                "consumerArtifactVersion": to_null(parts[7]),
            }
        )

(
    generatedBy,
    checkEnabled,
    pluginVersion,
    syncCommand,
    baselineStatus,
    baselineReason,
) = meta

record = {
    "schemaVersion": 1,
    "generatedAtUtc": datetime.datetime.now(datetime.timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    ),
    "generatedBy": generatedBy,
    "pluginVersion": to_null(pluginVersion),
    "checkEnabled": checkEnabled == "true",
    "syncCommand": to_null(syncCommand),
    "baselineStatus": baselineStatus,
    "baselineReason": to_null(baselineReason),
    "retiredPresent": retired,
    "writeFailures": fails,
    "rows": rows,
}

sys.stdout.write(json.dumps(record))
PDLC_C3_BUILD_RECORD_PY

# _pdlc_c3_build_record <generatedBy> <checkEnabled> <pluginVersion> <syncCommand>
#                        <baselineStatus> <baselineReason>
# Reads row data from the current `PDLC_ROWS_ID`/`PDLC_STATE`/… arrays (whatever pass the caller
# most recently ran), `PDLC_WRITE_FAILURES` (recordable ops only — stderr-only ops never appear
# in the record, FSPEC §4.4), and `_PDLC_C3_RETIRED_*` (populated by the retirement step).
_pdlc_c3_build_record() {
  local generatedBy="$1" checkEnabled="$2" pluginVersion="$3" syncCommand="$4"
  local baselineStatus="$5" baselineReason="$6"

  _pdlc_ensure_py || return 1

  {
    printf 'META\x1f%s\x1f%s\x1f%s\x1f%s\x1f%s\x1f%s\n' \
      "$generatedBy" "$checkEnabled" "$pluginVersion" "$syncCommand" \
      "$baselineStatus" "$baselineReason"

    local entry path op
    for entry in "${PDLC_WRITE_FAILURES[@]:-}"; do
      [[ -z "$entry" ]] && continue
      path="${entry%%$'\x1f'*}"
      op="${entry#*$'\x1f'}"
      _pdlc_write_failure_op_is_stderr_only "$op" && continue
      printf 'FAIL\x1f%s\x1f%s\n' "$(_pdlc_c3_relpath "$path")" "$op"
    done

    local i
    for ((i = 0; i < ${#_PDLC_C3_RETIRED_PATH[@]}; i++)); do
      printf 'RETIRED\x1f%s\x1f%s\x1f%s\n' \
        "${_PDLC_C3_RETIRED_PATH[$i]}" "${_PDLC_C3_RETIRED_ID[$i]}" "${_PDLC_C3_RETIRED_STATE[$i]}"
    done

    for ((i = 0; i < ${#PDLC_ROWS_ID[@]}; i++)); do
      printf 'ROW\x1f%s\x1f%s\x1f%s\x1f%s\x1f%s\x1f%s\x1f%s\n' \
        "${PDLC_ROWS_ID[$i]}" "${PDLC_STATE[$i]:-}" "${PDLC_REASON[$i]:-}" \
        "${PDLC_PLUGIN_HASH[$i]:-}" "${PDLC_CONSUMER_HASH[$i]:-}" \
        "${PDLC_PLUGIN_ARTIFACT_VERSION[$i]:-}" "${PDLC_CONSUMER_ARTIFACT_VERSION[$i]:-}"
    done
  } | "$PDLC_PY_BIN" -c "$_PDLC_C3_BUILD_RECORD_PY"
}

# _pdlc_c3_emit_stderr_only_w7 — deferred emission (AT-17/O-6): stderr-only operations' W-7 lines
# print before recordable operations' lines. Gated on overall failure of the write attempt this
# guards (never printed on success), and on each token's own fault-active probe in catalog order
# — every ladder-triggering fixture in this suite is `PDLC_FAULT`-driven (TSPEC §5.3), so "is this
# fault token active" is equivalent to "did this failure occur" for every scenario this run can
# hit.
# _pdlc_c3_relpath <path> — strips a leading "${PDLC_REPO_ROOT}/" prefix so that paths
# recorded in the drift-state record and printed on W-7 lines match the repo-relative
# convention used everywhere else (row consumerPath, retires entries): C1's pdlc_backup /
# pdlc_copy_artifact / pdlc_retire record whatever absolute path they were called with
# verbatim into PDLC_WRITE_FAILURES, since they perform real filesystem IO and need an
# absolute (or CWD-relative) path regardless of CWD — this entrypoint is the seam that
# re-expresses those entries in the repo-relative form the record/stderr contract expects.
_pdlc_c3_relpath() {
  local p="$1"
  if [[ -n "${PDLC_REPO_ROOT:-}" && "$p" == "${PDLC_REPO_ROOT}/"* ]]; then
    printf '%s' "${p#${PDLC_REPO_ROOT}/}"
  else
    printf '%s' "$p"
  fi
}

_pdlc_c3_emit_stderr_only_w7() {
  local path="$1"
  shift
  local token
  for token in "$@"; do
    if pdlc_fault_active "$token"; then
      pdlc_msg_w7 "$path" "$token" >&2; printf '\n' >&2
    fi
  done
}

# ───────────────────────────── step 1 — resolve baseline ─────────────────────────────

pdlc_load_manifest
PDLC_RESOLVED_CHECK_ENABLED="${PDLC_CHECK_ENABLED:-true}"

_pdlc_c3_drift_state_path="${PDLC_REPO_ROOT:-}/.claude/workflows/.pdlc-drift-state.json"

# The E1 evidence gates this, never the reported reason (§2.1's no-write-target rule): a
# higher-precedence reason may be what W-1 names, but if repoRootUnresolved holds underneath,
# nothing is created — not even the directory — regardless.
if [[ "${PDLC_EVIDENCE_REPO_ROOT:-}" == "holds" ]]; then
  _pdlc_c3_reason="${PDLC_BASELINE_REASON:-repo-root-unresolved}"
  pdlc_msg_w1 "$_pdlc_c3_reason" >&2; printf '\n' >&2
  if [[ "$_pdlc_c3_reason" != "repo-root-unresolved" ]]; then
    printf 'pdlc: no write target — the consumer repo root did not resolve, so nothing was recorded this run. Create .claude/ at the intended root, or run inside a git work tree.\n' >&2
  fi
  exit 3
fi

# ───────────────────────────── step 2 — AS-FOUND classify ─────────────────────────────

pdlc_probe_hash_tool || true
pdlc_classify_all "as-found"

declare -a _PDLC_C3_AF_STATE=("${PDLC_STATE[@]:-}")
declare -a _PDLC_C3_AF_REASON=("${PDLC_REASON[@]:-}")
declare -a _PDLC_C3_AF_PLUGIN_HASH=("${PDLC_PLUGIN_HASH[@]:-}")
declare -a _PDLC_C3_AF_CONSUMER_HASH=("${PDLC_CONSUMER_HASH[@]:-}")
declare -a _PDLC_C3_AF_PLUGIN_VERSION=("${PDLC_PLUGIN_ARTIFACT_VERSION[@]:-}")
declare -a _PDLC_C3_AF_CONSUMER_VERSION=("${PDLC_CONSUMER_ARTIFACT_VERSION[@]:-}")

# ───────────────────────────── step 3 — mkdir -p .claude/workflows ─────────────────────────────
#
# Must succeed even with no JSON/python tool present (FSPEC §4.4a T1: "the run creates the
# directory (step 3)" even when jsonToolAbsent holds) — so this cannot route through
# `PDLC_PY_BIN`. `mkdir` itself is absent from the probe sandbox. `git init` creates every
# missing intermediate directory as a side effect (verified: `git init -q -- a/b/c` creates
# a, a/b, a/b/c) using only `git` and `rm` (both always present) — no `mkdir`, no `python3`
# required. Mirrors check-workflow-drift.sh's (C2) identical step-3 solution.

_pdlc_c3_mkdir_ok=1
_pdlc_c3_workflows_target="${PDLC_REPO_ROOT:-}/.claude/workflows"
if pdlc_fault_active "mkdir"; then
  _pdlc_c3_mkdir_ok=0
else
  if [[ -n "${PDLC_REPO_ROOT:-}" ]]; then
    if [[ -d "$_pdlc_c3_workflows_target" ]]; then
      : # already exists — nothing to create, no trace (mirrors the pre-existing-dir case)
    else
      if git init -q -- "$_pdlc_c3_workflows_target" >/dev/null 2>&1; then
        rm -rf -- "${_pdlc_c3_workflows_target}/.git" 2>/dev/null || true
      fi
      if [[ -d "$_pdlc_c3_workflows_target" ]]; then
        pdlc_trace "run" "mkdir" "-" "$_pdlc_c3_workflows_target"
      else
        _pdlc_c3_mkdir_ok=0
      fi
    fi
  else
    _pdlc_c3_mkdir_ok=0
  fi
fi

if ((! _pdlc_c3_mkdir_ok)); then
  _pdlc_c3_any_write_failed=1
  pdlc_msg_w7 "${PDLC_REPO_ROOT:-}/.claude/workflows" "mkdir" >&2; printf '\n' >&2
fi

# ───────────────────────────── not-managed listing (FSPEC §3.5, AC-0.6) ─────────────────────────────
#
# Report-only: enumerated non-recursively, `.pdlc-*`-prefixed basenames dropped, consumerPath and
# retires matches dropped, `LC_ALL=C`-sorted, printed to stdout. Never read for comparison,
# overwritten, or deleted, and absent from `rows`. Enumeration failure emits N-6 and changes no
# row state.

if ((_pdlc_c3_mkdir_ok)) && [[ "${PDLC_BASELINE_STATUS:-}" == "resolved" ]]; then
  _pdlc_c3_workflows_dir="${PDLC_REPO_ROOT}/.claude/workflows"
  if [[ -r "$_pdlc_c3_workflows_dir" && -x "$_pdlc_c3_workflows_dir" ]]; then
    declare -a _PDLC_C3_MANAGED=()
    for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
      _PDLC_C3_MANAGED+=("${PDLC_ROWS_CONSUMER_PATH[$_pdlc_c3_i]##*/}")
      _pdlc_split_on $'\x1f' "${PDLC_ROWS_RETIRES[$_pdlc_c3_i]:-}"
      for _pdlc_c3_r in "${_PDLC_SPLIT_RESULT[@]:-}"; do
        [[ -z "$_pdlc_c3_r" ]] && continue
        _PDLC_C3_MANAGED+=("${_pdlc_c3_r##*/}")
      done
    done

    declare -a _PDLC_C3_NOTMANAGED=()
    shopt -s nullglob
    for _pdlc_c3_entry in "$_pdlc_c3_workflows_dir"/*; do
      [[ -f "$_pdlc_c3_entry" ]] || continue
      _pdlc_c3_base="${_pdlc_c3_entry##*/}"
      case "$_pdlc_c3_base" in
        .pdlc-*) continue ;;
      esac
      _pdlc_c3_managed_hit=0
      for _pdlc_c3_m in "${_PDLC_C3_MANAGED[@]:-}"; do
        if [[ "$_pdlc_c3_base" == "$_pdlc_c3_m" ]]; then
          _pdlc_c3_managed_hit=1
          break
        fi
      done
      ((_pdlc_c3_managed_hit)) || _PDLC_C3_NOTMANAGED+=("$_pdlc_c3_base")
    done
    shopt -u nullglob

    if ((${#_PDLC_C3_NOTMANAGED[@]} > 0)); then
      # LC_ALL=C descending-free bash-native insertion sort (ascending, byte-wise).
      for ((_pdlc_c3_i = 1; _pdlc_c3_i < ${#_PDLC_C3_NOTMANAGED[@]}; _pdlc_c3_i++)); do
        _pdlc_c3_key="${_PDLC_C3_NOTMANAGED[$_pdlc_c3_i]}"
        _pdlc_c3_j=$((_pdlc_c3_i - 1))
        while ((_pdlc_c3_j >= 0)) && [[ "${_PDLC_C3_NOTMANAGED[$_pdlc_c3_j]}" > "$_pdlc_c3_key" ]]; do
          _PDLC_C3_NOTMANAGED[$((_pdlc_c3_j + 1))]="${_PDLC_C3_NOTMANAGED[$_pdlc_c3_j]}"
          _pdlc_c3_j=$((_pdlc_c3_j - 1))
        done
        _PDLC_C3_NOTMANAGED[$((_pdlc_c3_j + 1))]="$_pdlc_c3_key"
      done
      for _pdlc_c3_base in "${_PDLC_C3_NOTMANAGED[@]}"; do
        printf '%s\n' "$_pdlc_c3_base"
      done
    fi
  else
    printf 'pdlc: could not list %s; unmanaged files are not reported this run. Managed rows are unaffected.\n' \
      "$_pdlc_c3_workflows_dir" >&2
  fi
fi

# ───────────────────────────── steps 4-9 (sync only, gated on mkdir/baseline) ─────────────────────────────

if ((_pdlc_c3_mkdir_ok)) && [[ "${PDLC_BASELINE_STATUS:-}" == "resolved" ]] && ((! _pdlc_c3_check)); then
  declare -a _PDLC_C3_COPIED_HASH=()
  for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
    _PDLC_C3_COPIED_HASH+=("")
  done
  declare -a _PDLC_C3_COPY_FAILED=()
  for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
    _PDLC_C3_COPY_FAILED+=("0")
  done

  for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
    _pdlc_c3_state="${_PDLC_C3_AF_STATE[$_pdlc_c3_i]:-}"
    _pdlc_c3_should_sync=0
    case "$_pdlc_c3_state" in
      stale | missing) _pdlc_c3_should_sync=1 ;;
      local-edit | unverified)
        ((_pdlc_c3_force)) && _pdlc_c3_should_sync=1
        ;;
    esac
    ((_pdlc_c3_should_sync)) || continue

    _pdlc_c3_row_id="${PDLC_ROWS_ID[$_pdlc_c3_i]}"
    _pdlc_c3_plugin_abs="${PDLC_PLUGIN_ROOT:-}/${PDLC_ROWS_PLUGIN_PATH[$_pdlc_c3_i]}"
    _pdlc_c3_consumer_abs="${PDLC_REPO_ROOT}/${PDLC_ROWS_CONSUMER_PATH[$_pdlc_c3_i]}"

    if [[ "$_pdlc_c3_state" != "missing" && -e "$_pdlc_c3_consumer_abs" ]]; then
      if ! pdlc_backup "$_pdlc_c3_consumer_abs" "$_pdlc_c3_row_id"; then
        continue
      fi
    fi

    if pdlc_copy_artifact "$_pdlc_c3_plugin_abs" "$_pdlc_c3_consumer_abs" "$_pdlc_c3_row_id"; then
      _PDLC_C3_COPIED_HASH[$_pdlc_c3_i]="$PDLC_COPY_HASH"
    else
      _PDLC_C3_COPY_FAILED[$_pdlc_c3_i]="1"
    fi
  done

  # step 5 — POST-COPY narrow reclassify: retiring rows only (FSPEC §4.2/§4.6, AC-3.9's gate).
  declare -a _PDLC_C3_POSTCOPY_STATE=()
  for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
    _pdlc_c3_has_retires=0
    _pdlc_split_on $'\x1f' "${PDLC_ROWS_RETIRES[$_pdlc_c3_i]:-}"
    for _pdlc_c3_r in "${_PDLC_SPLIT_RESULT[@]:-}"; do
      [[ -n "$_pdlc_c3_r" ]] && _pdlc_c3_has_retires=1
    done
    if ((_pdlc_c3_has_retires)); then
      pdlc_classify_row "$_pdlc_c3_i" "post-copy"
      _PDLC_C3_POSTCOPY_STATE+=("$PDLC_ROW_STATE")
    else
      _PDLC_C3_POSTCOPY_STATE+=("")
    fi
  done

  # Retirement + the informational retired-present warning (W-6). The warning names the row's
  # AS-FOUND state (the operator-facing "what's blocking this" reading); the retire *action* is
  # gated on the POST-COPY state (AC-3.9: only delete once the superseding artifact is verified
  # in place).
  for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
    _pdlc_split_on $'\x1f' "${PDLC_ROWS_RETIRES[$_pdlc_c3_i]:-}"
    _pdlc_c3_retires=("${_PDLC_SPLIT_RESULT[@]:-}")
    [[ ${#_pdlc_c3_retires[@]} -eq 0 ]] && continue
    _pdlc_c3_any_retire=0
    for _pdlc_c3_r in "${_pdlc_c3_retires[@]}"; do
      [[ -n "$_pdlc_c3_r" ]] && _pdlc_c3_any_retire=1
    done
    ((_pdlc_c3_any_retire)) || continue

    _pdlc_c3_row_id="${PDLC_ROWS_ID[$_pdlc_c3_i]}"
    _pdlc_c3_af_state="${_PDLC_C3_AF_STATE[$_pdlc_c3_i]:-}"
    _pdlc_c3_pc_state="${_PDLC_C3_POSTCOPY_STATE[$_pdlc_c3_i]:-}"

    for _pdlc_c3_r in "${_pdlc_c3_retires[@]}"; do
      [[ -z "$_pdlc_c3_r" ]] && continue
      _pdlc_c3_target_abs="${PDLC_REPO_ROOT}/${_pdlc_c3_r}"
      [[ -e "$_pdlc_c3_target_abs" ]] || continue

      pdlc_msg_w6 "$_pdlc_c3_r" "$_pdlc_c3_row_id" "$_pdlc_c3_af_state" >&2; printf '\n' >&2

      if [[ "$_pdlc_c3_pc_state" == "in-sync" ]]; then
        pdlc_retire "$_pdlc_c3_target_abs" "${_pdlc_c3_target_abs##*/}"
      fi

      if [[ -e "$_pdlc_c3_target_abs" ]]; then
        _PDLC_C3_RETIRED_PATH+=("$_pdlc_c3_r")
        _PDLC_C3_RETIRED_ID+=("$_pdlc_c3_row_id")
        _PDLC_C3_RETIRED_STATE+=("$_pdlc_c3_pc_state")
      fi
    done
  done

  # step 6 — whole-file sync-manifest rewrite: preserve every existing entry not touched this
  # run; overwrite entries for verified copies; remove entries for rows whose copy failed
  # verification (§5.5, §1.2, §4.5 — the removal is what makes a corrupted row measure
  # `unverified` rather than `local-edit` on this run's own post-run pass and every run after).
  _pdlc_sync_manifest_ensure_loaded "as-found"
  declare -a _PDLC_C3_SM_ID=("${_PDLC_SYNC_IDS[@]:-}")
  declare -a _PDLC_C3_SM_HASH=("${_PDLC_SYNC_CONSUMER_HASH[@]:-}")
  declare -a _PDLC_C3_SM_VER=("${_PDLC_SYNC_ARTIFACT_VERSION[@]:-}")

  for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
    _pdlc_c3_row_id="${PDLC_ROWS_ID[$_pdlc_c3_i]}"
    if [[ -n "${_PDLC_C3_COPIED_HASH[$_pdlc_c3_i]:-}" ]]; then
      _pdlc_c3_found=0
      for ((_pdlc_c3_j = 0; _pdlc_c3_j < ${#_PDLC_C3_SM_ID[@]}; _pdlc_c3_j++)); do
        if [[ "${_PDLC_C3_SM_ID[$_pdlc_c3_j]}" == "$_pdlc_c3_row_id" ]]; then
          _PDLC_C3_SM_HASH[$_pdlc_c3_j]="${_PDLC_C3_COPIED_HASH[$_pdlc_c3_i]}"
          _PDLC_C3_SM_VER[$_pdlc_c3_j]="${_PDLC_C3_AF_PLUGIN_VERSION[$_pdlc_c3_i]:-}"
          _pdlc_c3_found=1
          break
        fi
      done
      if ((! _pdlc_c3_found)); then
        _PDLC_C3_SM_ID+=("$_pdlc_c3_row_id")
        _PDLC_C3_SM_HASH+=("${_PDLC_C3_COPIED_HASH[$_pdlc_c3_i]}")
        _PDLC_C3_SM_VER+=("${_PDLC_C3_AF_PLUGIN_VERSION[$_pdlc_c3_i]:-}")
      fi
    elif [[ "${_PDLC_C3_COPY_FAILED[$_pdlc_c3_i]:-0}" == "1" ]]; then
      for ((_pdlc_c3_j = 0; _pdlc_c3_j < ${#_PDLC_C3_SM_ID[@]}; _pdlc_c3_j++)); do
        if [[ "${_PDLC_C3_SM_ID[$_pdlc_c3_j]}" == "$_pdlc_c3_row_id" ]]; then
          _PDLC_C3_SM_ID[$_pdlc_c3_j]=""
        fi
      done
    fi
  done

  _pdlc_c3_sm_path="${PDLC_REPO_ROOT}/.claude/workflows/.pdlc-sync-manifest.json"
  _pdlc_c3_sm_content="$(
    {
      for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#_PDLC_C3_SM_ID[@]}; _pdlc_c3_i++)); do
        [[ -z "${_PDLC_C3_SM_ID[$_pdlc_c3_i]}" ]] && continue
        printf 'ENTRY\x1f%s\x1f%s\x1f%s\n' \
          "${_PDLC_C3_SM_ID[$_pdlc_c3_i]}" "${_PDLC_C3_SM_HASH[$_pdlc_c3_i]:-}" \
          "${_PDLC_C3_SM_VER[$_pdlc_c3_i]:-}"
      done
    } | "$PDLC_PY_BIN" -c '
import sys, json

entries = {}
for line in sys.stdin.read().split("\n"):
    if not line:
        continue
    parts = line.split("\x1f")
    entries[parts[1]] = {"consumerHash": parts[2], "artifactVersion": parts[3]}

sys.stdout.write(json.dumps({"entries": entries}))
'
  )"
  if ! pdlc_write_sync_manifest "$_pdlc_c3_sm_path" "$_pdlc_c3_sm_content"; then
    _pdlc_c3_any_write_failed=1
    pdlc_msg_w7 "$_pdlc_c3_sm_path" "sync-manifest-update" >&2; printf '\n' >&2
  fi

  # step 7 — POST-RUN reclassify (recorded pass).
  pdlc_classify_all "post-run"
fi

# ───────────────────────────── message emission for skipped rows ─────────────────────────────
#
# W-3 (unverified) / W-4 (local-edit): only when this run left the row untouched — i.e. `--check`
# mode, or plain sync without `--force`. No W-2 (unknown is never messaged by the entrypoint) and
# no W-5 (sync always attempts `stale`/`missing`).

if [[ "${PDLC_BASELINE_STATUS:-}" == "resolved" ]] && ((! _pdlc_c3_force)); then
  for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
    case "${_PDLC_C3_AF_STATE[$_pdlc_c3_i]:-}" in
      unverified) pdlc_msg_w3 "${PDLC_ROWS_ID[$_pdlc_c3_i]}" >&2; printf '\n' >&2 ;;
      local-edit)
        pdlc_msg_w4 "${PDLC_ROWS_ID[$_pdlc_c3_i]}" "${PDLC_REPO_ROOT}/.claude/workflows/.pdlc-backups" >&2; printf '\n' >&2
        ;;
    esac
  done
fi

# ───────────────────────────── step 8/9 — build + write the drift-state record ─────────────────────────────

if [[ "${PDLC_BASELINE_STATUS:-}" != "resolved" ]]; then
  pdlc_msg_w1 "${PDLC_BASELINE_REASON:-}" >&2; printf '\n' >&2
fi

_pdlc_c3_sync_cmd="$(pdlc_sync_command 2>/dev/null || true)"
_pdlc_c3_record="$(_pdlc_c3_build_record \
  "$_pdlc_c3_generated_by" \
  "$PDLC_RESOLVED_CHECK_ENABLED" \
  "${PDLC_MANIFEST_PLUGIN_VERSION:-}" \
  "$_pdlc_c3_sync_cmd" \
  "${PDLC_BASELINE_STATUS:-unresolved}" \
  "${PDLC_BASELINE_REASON:-}")"

if ! pdlc_write_drift_state "${PDLC_REPO_ROOT}" "$_pdlc_c3_record" "$_pdlc_c3_generated_by"; then
  _pdlc_c3_any_write_failed=1
  _pdlc_c3_emit_stderr_only_w7 "$_pdlc_c3_drift_state_path" \
    "drift-state-replace" "drift-state-invalidate" "drift-state-unlink"
fi

# ───────────────────────────── recordable-operation W-7 lines ─────────────────────────────
#
# Deferred emission order (AT-17/O-6): stderr-only lines (mkdir + drift-state triad, printed
# above at their own points) come before recordable-operation lines.

for _pdlc_c3_entry in "${PDLC_WRITE_FAILURES[@]:-}"; do
  [[ -z "$_pdlc_c3_entry" ]] && continue
  _pdlc_c3_path="${_pdlc_c3_entry%%$'\x1f'*}"
  _pdlc_c3_op="${_pdlc_c3_entry#*$'\x1f'}"
  pdlc_msg_w7 "$(_pdlc_c3_relpath "$_pdlc_c3_path")" "$_pdlc_c3_op" >&2; printf '\n' >&2
done

if ((${#PDLC_WRITE_FAILURES[@]:-0} > 0)); then
  _pdlc_c3_any_write_failed=1
fi

# ───────────────────────────── step 10 — exit code (FSPEC §5.8) ─────────────────────────────

if ((_pdlc_c3_any_write_failed)); then
  exit 4
fi

if [[ "${PDLC_EVIDENCE_REPO_ROOT:-}" == "holds" ]]; then
  exit 3
fi

if [[ "${PDLC_BASELINE_STATUS:-}" != "resolved" ]]; then
  exit 3
fi

_pdlc_c3_any_unknown=0
_pdlc_c3_any_local_or_unverified=0
_pdlc_c3_any_stale_or_missing=0
for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
  case "${PDLC_STATE[$_pdlc_c3_i]:-}" in
    unknown) _pdlc_c3_any_unknown=1 ;;
    local-edit | unverified) _pdlc_c3_any_local_or_unverified=1 ;;
    stale | missing) _pdlc_c3_any_stale_or_missing=1 ;;
  esac
done

if ((_pdlc_c3_any_unknown)); then
  exit 3
fi

if ((_pdlc_c3_any_local_or_unverified)); then
  exit 2
fi

if ((_pdlc_c3_any_stale_or_missing)) || ((${#_PDLC_C3_RETIRED_PATH[@]} > 0)); then
  exit 1
fi

exit 0
