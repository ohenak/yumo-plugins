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
. "${_pdlc_c3_dir}/lib/pdlc-drift.sh" 2>/dev/null || true

# ───────────────────────── C1 availability gate (FSPEC §5.8, CR F-02) ─────────────────────────
#
# A partial plugin install (interrupted copy, unreadable `lib/`, truncated file) leaves this
# entrypoint present and C1 missing. Without this gate the run fell through the source failure
# into a `command not found` cascade and died with status **1** — the one code FSPEC §5.8 says
# this entrypoint never emits, and the worst possible one to emit here: 1 is the "sync-fixable
# drift" class, so a broken install told the operator to run a sync that cannot fix it.
#
# Exit **3** is the correct class per §5.8's precedence table: no baseline could be resolved, so
# nothing was verified; and no write was attempted, so 4 (which outranks 3) cannot apply.
#
# Tolerating the source's exit status is not sufficient on its own — a truncated C1 sources
# cleanly having defined only its first few functions — so the gate probes the functions this
# script calls, including `pdlc_msg_w7`, the LAST definition in C1 (its layers are append-only),
# whose presence therefore witnesses that the whole file was read.
#
# The probe list deliberately does NOT name the fault seam's `pdlc_fault_active` guard:
# PROP-SEAM-02 scans these three bash sources as text and reads the word after that name
# as a fault token, so listing it here would invent a token that does not exist. The
# fault layer is witnessed by `pdlc_fault_unrecognised_seen` instead.
_pdlc_c3_c1_missing=""
for _pdlc_c3_fn in \
  pdlc_load_manifest pdlc_probe_hash_tool pdlc_classify_all pdlc_classify_row \
  pdlc_fault_unrecognised_seen pdlc_trace _pdlc_split_on \
  _pdlc_write_failure_op_is_stderr_only pdlc_sync_command \
  pdlc_backup pdlc_copy_artifact pdlc_retire \
  pdlc_write_sync_manifest pdlc_write_drift_state \
  pdlc_msg_w1 pdlc_msg_w3 pdlc_msg_w4 pdlc_msg_w6 pdlc_msg_w7; do
  if ! declare -F "$_pdlc_c3_fn" >/dev/null 2>&1; then
    _pdlc_c3_c1_missing="$_pdlc_c3_fn"
    break
  fi
done
if [[ -n "$_pdlc_c3_c1_missing" ]]; then
  # FSPEC §8.3 N-10 — the sync-side sibling of N-9. Same class (`pluginUpdate`), different first
  # clause, so the two are textually distinct and each identifies its own entrypoint.
  printf 'pdlc: cannot check or sync workflows — the plugin library %s is missing or incomplete (no %s), so nothing could be classified and nothing was written. Reinstall or update the plugin.\n' \
    "${_pdlc_c3_dir}/lib/pdlc-drift.sh" "$_pdlc_c3_c1_missing" >&2
  exit 3
fi

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

# _pdlc_c3_relpath <path> — strips a leading "${PDLC_REPO_ROOT}/" prefix so that paths
# recorded in the drift-state record and printed on W-7 lines match the repo-relative
# convention used everywhere else (row consumerPath, retires entries): C1's pdlc_backup /
# pdlc_copy_artifact / pdlc_retire record whatever absolute path they were called with
# verbatim into PDLC_WRITE_FAILURES, since they perform real filesystem IO and need an
# absolute (or CWD-relative) path regardless of CWD — this entrypoint is the seam that
# re-expresses those entries in the repo-relative form the record/stderr contract expects.
_pdlc_c3_relpath() {
  local p="$1"
  # Both the `==` RHS and the `#` prefix are QUOTED (CR F-17): an unquoted `${p#${PDLC_REPO_ROOT}/}`
  # evaluates the repo root as a glob PATTERN, so a root containing `[`, `\` (and, for other
  # inputs, `*`/`?`) fails to strip or mis-strips, and `writeFailures[].path` silently stops being
  # repo-relative. Quoting makes it a literal prefix; the trailing `*` on the `==` RHS stays
  # outside the quotes because that one IS meant to be a pattern.
  if [[ -n "${PDLC_REPO_ROOT:-}" && "$p" == "${PDLC_REPO_ROOT}/"* ]]; then
    printf '%s' "${p#"${PDLC_REPO_ROOT}/"}"
  else
    printf '%s' "$p"
  fi
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
# `PDLC_PY_BIN`. `mkdir -p` is the mechanism FSPEC §4.2 step 3 names verbatim.

_pdlc_c3_mkdir_ok=1
_pdlc_c3_workflows_target="${PDLC_REPO_ROOT:-}/.claude/workflows"
if pdlc_fault_active "mkdir"; then
  _pdlc_c3_mkdir_ok=0
else
  if [[ -n "${PDLC_REPO_ROOT:-}" ]]; then
    if [[ -d "$_pdlc_c3_workflows_target" ]]; then
      : # already exists — nothing to create, no trace (mirrors the pre-existing-dir case)
    else
      mkdir -p -- "$_pdlc_c3_workflows_target" 2>/dev/null || true
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
        # Backup id (2nd arg) is the retired path's basename (§5.7); the retire-delete fault
        # key (3rd arg) is this row's own id — the two identifiers are deliberately distinct
        # (TSPEC's fault-identity table, ~line 956).
        pdlc_retire "$_pdlc_c3_target_abs" "${_pdlc_c3_target_abs##*/}" "$_pdlc_c3_row_id"
      fi

      if [[ -e "$_pdlc_c3_target_abs" ]]; then
        _PDLC_C3_RETIRED_PATH+=("$_pdlc_c3_r")
        _PDLC_C3_RETIRED_ID+=("$_pdlc_c3_row_id")
        _PDLC_C3_RETIRED_STATE+=("$_pdlc_c3_pc_state")
      fi
    done
  done

  # step 6 — whole-file sync-manifest rewrite: preserve every existing entry not touched this
  # run **byte-identical** — including `id`/`pluginHash`/`pluginVersion`/`syncedAtUtc`, not just
  # `consumerHash`/`artifactVersion` (FSPEC §5.9's AC-3.7 byte-identical clause: an unconditional
  # rewrite that regenerated every entry would change `syncedAtUtc` on untouched rows and break
  # the no-change-re-sync property) — overwrite/add a full six-field entry (§1.2's schema) for
  # verified copies; remove entries for rows whose copy failed verification (§1.2, §4.5 — the
  # removal is what makes a corrupted row measure `unverified` rather than `local-edit` on this
  # run's own post-run pass and every run after). C1's `_pdlc_sync_manifest_ensure_loaded` only
  # exposes `consumerHash`/`artifactVersion` per row (it exists for the classifier, not for
  # round-tripping), so this reads and re-serializes the raw file itself — the schema/rewrite is
  # this entrypoint's own job per FSPEC §5.5/§1.2, not C1's.
  _pdlc_c3_sm_path="${PDLC_REPO_ROOT}/.claude/workflows/.pdlc-sync-manifest.json"
  _pdlc_c3_sm_now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  _pdlc_c3_sm_content="$(
    {
      printf 'EXISTING\x1f%s\n' "$_pdlc_c3_sm_path"
      printf 'NOW\x1f%s\n' "$_pdlc_c3_sm_now"
      for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
        _pdlc_c3_row_id="${PDLC_ROWS_ID[$_pdlc_c3_i]}"
        if [[ -n "${_PDLC_C3_COPIED_HASH[$_pdlc_c3_i]:-}" ]]; then
          printf 'UPSERT\x1f%s\x1f%s\x1f%s\x1f%s\n' \
            "$_pdlc_c3_row_id" \
            "${_PDLC_C3_COPIED_HASH[$_pdlc_c3_i]}" \
            "${_PDLC_C3_AF_PLUGIN_HASH[$_pdlc_c3_i]:-}" \
            "${_PDLC_C3_AF_PLUGIN_VERSION[$_pdlc_c3_i]:-}"
        elif [[ "${_PDLC_C3_COPY_FAILED[$_pdlc_c3_i]:-0}" == "1" ]]; then
          printf 'REMOVE\x1f%s\n' "$_pdlc_c3_row_id"
        fi
      done
    } | "$PDLC_PY_BIN" -c '
import sys, json


def to_null(s):
    return s if s else None


existingPath = None
now = None
upserts = {}
removals = set()
for line in sys.stdin.read().split("\n"):
    if not line:
        continue
    parts = line.split("\x1f")
    tag = parts[0]
    if tag == "EXISTING":
        existingPath = parts[1]
    elif tag == "NOW":
        now = parts[1]
    elif tag == "UPSERT":
        upserts[parts[1]] = {
            "consumerHash": parts[2],
            "pluginHash": to_null(parts[3]),
            "artifactVersion": to_null(parts[4]),
        }
    elif tag == "REMOVE":
        removals.add(parts[1])

entries = {}
try:
    with open(existingPath, "r") as f:
        existing = json.load(f)
    if isinstance(existing, dict) and isinstance(existing.get("entries"), dict):
        entries = existing["entries"]
except Exception:
    entries = {}

for rowId in removals:
    entries.pop(rowId, None)

for rowId, upd in upserts.items():
    entries[rowId] = {
        "id": rowId,
        "consumerHash": upd["consumerHash"],
        "pluginHash": upd["pluginHash"],
        "artifactVersion": upd["artifactVersion"],
        "pluginVersion": upd["artifactVersion"],
        "syncedAtUtc": now,
    }

sys.stdout.write(json.dumps({"schemaVersion": 1, "entries": entries}))
'
  )"
  if ! pdlc_write_sync_manifest "$_pdlc_c3_sm_path" "$_pdlc_c3_sm_content"; then
    _pdlc_c3_any_write_failed=1
    pdlc_msg_w7 "$_pdlc_c3_sm_path" "sync-manifest-update" >&2; printf '\n' >&2
  fi

  # step 7 — POST-RUN reclassify (recorded pass).
  pdlc_classify_all "post-run"

  # …and re-seat `retiredPresent[].supersedingState` onto that same pass (AC-2.6, FSPEC §3): every
  # state the record carries is the run's LAST classification, so a retired path's supersedingState
  # and its superseding row's `rows[].state` are two readings of one pass and cannot disagree. The
  # retirement loop above appended the POST-COPY reading — the right input for AC-3.9's delete gate
  # it was taken for, but not the reading the record is defined to carry (they diverge whenever the
  # row's own copy fails verification: post-copy "local-edit" off the pre-existing entry, post-run
  # "unverified" once step 6 removes it).
  #
  # Only the STATE is revisited: which retired paths appear at all is a property of the filesystem
  # after the retire attempt (the `-e` re-probe above), not of the classifier, so `..._RETIRED_PATH`
  # / `..._RETIRED_ID` — the other two arrays parallel to this one — are left exactly as built, and
  # positional correspondence is preserved by assigning in place rather than rebuilding. Row lookup
  # is a linear scan of `PDLC_ROWS_ID` (bash 3.2 has no associative arrays; the row count is the
  # manifest's, i.e. single digits). The `--check` inventory below needs no such re-seat: it copies
  # nothing, so its single as-found pass IS its post-run pass.
  for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#_PDLC_C3_RETIRED_PATH[@]}; _pdlc_c3_i++)); do
    for ((_pdlc_c3_j = 0; _pdlc_c3_j < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_j++)); do
      if [[ "${PDLC_ROWS_ID[$_pdlc_c3_j]}" == "${_PDLC_C3_RETIRED_ID[$_pdlc_c3_i]}" ]]; then
        _PDLC_C3_RETIRED_STATE[$_pdlc_c3_i]="${PDLC_STATE[$_pdlc_c3_j]:-}"
        break
      fi
    done
  done
fi

# ───────────────────────────── retired-present inventory under --check ─────────────────────────────
#
# FSPEC §5.7's second branch: `if --check: report retired-present, exit class 1 (sync-fixable,
# same as stale)`. The retirement block above is inside the sync-only gate because it *deletes*;
# the inventory and W-6 are not sync-only, and building them only there left `--check` reporting
# an empty `retiredPresent` and exiting 0 on a tree AC-3.9 says is not green (§14.1 V-2).
#
# There is no post-copy pass in this mode — `--check` copies nothing, so a row's post-copy state
# is its as-found state by construction. That is what W-6 names and what `supersedingState`
# carries, which is also what AC-2.6 asks for: the state of the row superseding the retired path
# at the moment the record was written.
if ((_pdlc_c3_check)) && [[ "${PDLC_BASELINE_STATUS:-}" == "resolved" ]]; then
  for ((_pdlc_c3_i = 0; _pdlc_c3_i < ${#PDLC_ROWS_ID[@]}; _pdlc_c3_i++)); do
    _pdlc_split_on $'\x1f' "${PDLC_ROWS_RETIRES[$_pdlc_c3_i]:-}"
    _pdlc_c3_retires=("${_PDLC_SPLIT_RESULT[@]:-}")
    _pdlc_c3_row_id="${PDLC_ROWS_ID[$_pdlc_c3_i]}"
    _pdlc_c3_af_state="${_PDLC_C3_AF_STATE[$_pdlc_c3_i]:-}"
    for _pdlc_c3_r in "${_pdlc_c3_retires[@]:-}"; do
      [[ -z "$_pdlc_c3_r" ]] && continue
      _pdlc_c3_target_abs="${PDLC_REPO_ROOT}/${_pdlc_c3_r}"
      [[ -e "$_pdlc_c3_target_abs" ]] || continue

      pdlc_msg_w6 "$_pdlc_c3_r" "$_pdlc_c3_row_id" "$_pdlc_c3_af_state" >&2; printf '\n' >&2

      _PDLC_C3_RETIRED_PATH+=("$_pdlc_c3_r")
      _PDLC_C3_RETIRED_ID+=("$_pdlc_c3_row_id")
      _PDLC_C3_RETIRED_STATE+=("$_pdlc_c3_af_state")
    done
  done
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
fi
# Each rung's own W-7 line is printed whenever THAT rung's token was fault-active — regardless
# of whether a later rung went on to land the write (TSPEC §5.3, SE F-29 ≡ TE F-43): the ladder
# can recover (AT-15) while still owing the operator a line naming the rung(s) that failed along
# the way, so this call is unconditional, not gated on the overall write having failed.
# The three guards are written out one per token rather than looped over a token variable:
# PROPERTIES §8.1 rule 1 requires every `pdlc_fault_active` argument to be a bare literal, so
# that the fault vocabulary stays statically recoverable from the guard sites themselves.
if pdlc_fault_active "drift-state-replace"; then
  pdlc_msg_w7 "$_pdlc_c3_drift_state_path" "drift-state-replace" >&2; printf '\n' >&2
fi
if pdlc_fault_active "drift-state-invalidate"; then
  pdlc_msg_w7 "$_pdlc_c3_drift_state_path" "drift-state-invalidate" >&2; printf '\n' >&2
fi
if pdlc_fault_active "drift-state-unlink"; then
  pdlc_msg_w7 "$_pdlc_c3_drift_state_path" "drift-state-unlink" >&2; printf '\n' >&2
fi

# ───────────────────────────── recordable-operation W-7 lines ─────────────────────────────
#
# Deferred emission order (AT-17/O-6): stderr-only lines (mkdir + drift-state triad, printed
# above at their own points) come before recordable-operation lines. `pdlc_write_drift_state`'s
# rung-(iii) residual (C1) now also pushes its own `drift-state-replace` entry into
# `PDLC_WRITE_FAILURES[]` (so check-workflow-drift.sh's single undifferentiated loop can render
# it) — skip stderr-only operations here so that entry is not printed a second time on top of
# the drift-state triad's own (correctly-ordered) lines above.
for _pdlc_c3_entry in "${PDLC_WRITE_FAILURES[@]:-}"; do
  [[ -z "$_pdlc_c3_entry" ]] && continue
  _pdlc_c3_path="${_pdlc_c3_entry%%$'\x1f'*}"
  _pdlc_c3_op="${_pdlc_c3_entry#*$'\x1f'}"
  _pdlc_write_failure_op_is_stderr_only "$_pdlc_c3_op" && continue
  pdlc_msg_w7 "$(_pdlc_c3_relpath "$_pdlc_c3_path")" "$_pdlc_c3_op" >&2; printf '\n' >&2
done

# `${#ARR[@]:-0}` is NOT a defaulting expansion — `${#…}` does not compose with `:-`. Bash 3.2
# (macOS) silently tolerates the form; bash 5 (Linux) rejects it as `bad substitution`, which
# aborted this script mid-run and dropped the exit code from 4 to 2/1 on every write-failure
# case. Same lesson as check-workflow-drift.sh's `_pdlc_n_rows` site: `PDLC_WRITE_FAILURES` is
# declared by C1 (sourced unconditionally above), so the plain form is correct and safe.
if ((${#PDLC_WRITE_FAILURES[@]} > 0)); then
  _pdlc_c3_any_write_failed=1
fi

# ───────────────────────────── step 10 — exit code (FSPEC §5.8) ─────────────────────────────

# AC-2.9(5), verbatim (FSPEC §4.6): an unrecognised `PDLC_FAULT` token prints one stderr line,
# injects nothing, and `--check`/sync take exit 4 — an assertion surface handed an environment
# it does not understand is a failed assertion, not a green one. This precedes every state-
# derived code below because the run's computed state is deliberately still whatever it would
# have been with the seam unset (AT-18a/AT-18b assert exactly that byte-equivalence); only the
# process exit is pinned here. The hook is the sole exception (AC-2.4) and never reaches this.
if pdlc_fault_unrecognised_seen; then
  exit 4
fi

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
