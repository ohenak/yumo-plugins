# pdlc-drift.sh — C1, the sourced library surface (TSPEC §2.2, PLAN batch 6+).
#
# SOURCED, NEVER EXECUTED (FSPEC OQ-4): no shebang execution path is relied on, no execute bit.
# Every consumer sources this file tolerantly (`source ".../pdlc-drift.sh" 2>/dev/null || true`,
# TSPEC §11.2) so it must be safe to source under a caller's `set -u` — every top-level
# expansion here defaults with `${VAR:-}` and no bare unset-variable expansion is made at
# source time.
#
# Bash-3.2 compatible (macOS's shipped /bin/bash): no associative arrays, no namerefs, no
# bashisms newer than 3.2. `LC_ALL=C` is exported unconditionally (TSPEC §2.5) before this file
# does any sort or comparison.
#
# ─────────────────────────────────────────────────────────────────────────────────────────────
# LAYER 1 (T-31, batch 6) — seams and primitives. Owns: the idempotent-source guard,
# `PDLC_FAULT_TOKENS` + `pdlc_fault_active` (§5.1/§5.1.1), `pdlc_trace` (§4.1/§4.2), the tool
# probes (`pdlc_probe_json_tool` / `pdlc_json_read` / `pdlc_probe_hash_tool` / `pdlc_sha1`), and
# the backup-grammar trio (`pdlc_backup_format` / `pdlc_backup_parse` / `pdlc_prune_backups`,
# §11.1). Layers 2-5 (T-32..T-35) append below the markers at the end of this file — do not
# reorder layer-1 content to make room; append only.
# ─────────────────────────────────────────────────────────────────────────────────────────────

# Idempotent-source guard (PROPERTIES §8.0): a second `source` of this file is a silent no-op,
# so a script that sources it from two call sites (or a test harness that sources it once per
# case in-process) never re-runs the `readonly` declarations below.
[[ -n "${PDLC_DRIFT_LIB_SOURCED:-}" ]] && return 0
readonly PDLC_DRIFT_LIB_SOURCED=1

export LC_ALL=C
export LANG=C

# M6 id charset (TSPEC §5.1.1/§11.3; shared with `pdlc/workflows/lib/document-oracles.mjs`'s
# `M6_ID_REGEX`): 1-64 bytes, first byte alnum, remainder alnum/`.`/`_`/`-`. Excludes `,`, `:`,
# tab, newline by construction (none of those bytes are in the character class).
readonly PDLC_M6_ID_REGEX='^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'

# ───────────────────────────────── §5.2 — the closed fault-token set ─────────────────────────

# The 16-member closed set, in exact §5.2 table order. `dump\tPDLC_FAULT_TOKENS` (bin/lib-probe.sh)
# reads this back verbatim.
readonly -a PDLC_FAULT_TOKENS=(
  "git-worktree-list"
  "walk-stat"
  "manifest-read"
  "sync-manifest-read"
  "mkdir"
  "drift-state-replace"
  "drift-state-invalidate"
  "drift-state-unlink"
  "artifact-copy"
  "artifact-copy-corrupt"
  "backup"
  "backup-corrupt"
  "retire-delete"
  "sync-manifest-update"
  "plugin-artifact-read"
  "consumer-artifact-read"
)

# ───────────────────────────────── §5.1/§5.1.1 — PDLC_FAULT grammar ───────────────────────────

# Parsed state, built once per process on first `pdlc_fault_active` call (env is fixed for the
# lifetime of a batched-driver process, TSPEC §11.2, so parsing once is sufficient and correct).
_PDLC_FAULT_PARSED=0
_PDLC_FAULT_UNSCOPED=()
_PDLC_FAULT_SCOPED=()

# Splits "$1" on "," into the global _PDLC_FAULT_SPLIT array, preserving empty fields (manual
# prefix-stripping — the same technique bin/lib-probe.sh's `split_tab_fields` uses for TAB, since
# bash's IFS-based splitting collapses/drops empty fields even when IFS holds a single character).
_pdlc_fault_split_commas() {
  _PDLC_FAULT_SPLIT=()
  local remaining="$1"
  while [[ "$remaining" == *,* ]]; do
    _PDLC_FAULT_SPLIT+=("${remaining%%,*}")
    remaining="${remaining#*,}"
  done
  _PDLC_FAULT_SPLIT+=("$remaining")
}

_pdlc_fault_is_token() {
  local candidate="$1" t
  for t in "${PDLC_FAULT_TOKENS[@]:-}"; do
    [[ "$t" == "$candidate" ]] && return 0
  done
  return 1
}

# The 7 selector-bearing tokens (TSPEC §5.1.1's table) — every other recognised token is
# non-selector-bearing, and a selector on one of those is malformed.
_pdlc_fault_is_selector_bearing() {
  case "$1" in
    artifact-copy | artifact-copy-corrupt | backup | backup-corrupt | retire-delete | \
      plugin-artifact-read | consumer-artifact-read)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# N-7 (FSPEC §8, TSPEC §5.4): one line per malformed/unrecognised spec, carrying the whole spec
# text, emitted exactly once (parsing itself only ever runs once per process, guarded above).
# Layer 5 (T-35) may route this through a shared `pdlc_msg_*` once that layer lands; layer 1
# writes it directly so this behaves correctly standing alone.
_pdlc_fault_emit_n7() {
  printf 'pdlc: N-7 unrecognised PDLC_FAULT spec: %s\n' "$1" >&2
}

_pdlc_fault_ensure_parsed() {
  [[ "$_PDLC_FAULT_PARSED" == "1" ]] && return 0
  _PDLC_FAULT_PARSED=1
  _PDLC_FAULT_UNSCOPED=()
  _PDLC_FAULT_SCOPED=()

  local spec_string="${PDLC_FAULT:-}"
  [[ -z "$spec_string" ]] && return 0

  _pdlc_fault_split_commas "$spec_string"
  local spec
  for spec in "${_PDLC_FAULT_SPLIT[@]:-}"; do
    # Empty spec (leading/trailing/doubled comma) is inert — unset-equivalent, not malformed.
    [[ -z "$spec" ]] && continue

    local token="$spec" selector="" hasSelector=0
    if [[ "$spec" == *:* ]]; then
      hasSelector=1
      token="${spec%%:*}"
      selector="${spec#*:}"
      # Malformed: empty selector ("token:") or an extra colon ("token:a:b").
      if [[ -z "$selector" || "$selector" == *:* ]]; then
        _pdlc_fault_emit_n7 "$spec"
        continue
      fi
    fi

    if ! _pdlc_fault_is_token "$token"; then
      _pdlc_fault_emit_n7 "$spec"
      continue
    fi

    if [[ "$hasSelector" == "1" ]]; then
      if ! _pdlc_fault_is_selector_bearing "$token"; then
        # A selector on a non-bearing token (e.g. "mkdir:foo") is malformed too.
        _pdlc_fault_emit_n7 "$spec"
        continue
      fi
      _PDLC_FAULT_SCOPED+=("${token}:${selector}")
    else
      _PDLC_FAULT_UNSCOPED+=("$token")
    fi
  done
  return 0
}

# pdlc_fault_active <token> [scopeKey] — exit 0 when `token` is present unscoped in PDLC_FAULT,
# OR present with a selector byte-equal to `scopeKey`. Duplicates and spec order never matter
# (order-insensitive grammar, TSPEC §5.1).
pdlc_fault_active() {
  local token="$1" scopeKey="${2:-}"
  _pdlc_fault_ensure_parsed

  local u
  for u in "${_PDLC_FAULT_UNSCOPED[@]:-}"; do
    [[ -z "$u" ]] && continue
    [[ "$u" == "$token" ]] && return 0
  done

  if [[ -n "$scopeKey" ]]; then
    local s stoken sscope
    for s in "${_PDLC_FAULT_SCOPED[@]:-}"; do
      [[ -z "$s" ]] && continue
      stoken="${s%%:*}"
      sscope="${s#*:}"
      if [[ "$stoken" == "$token" && "$sscope" == "$scopeKey" ]]; then
        return 0
      fi
    done
  fi

  return 1
}

# ───────────────────────────────── §4.1/§4.2 — the trace grammar ─────────────────────────────

_PDLC_TRACE_SEQ=0

# Percent-encodes "$1" byte-for-byte per TSPEC §4.1's rule: `%` (0x25) and every byte outside
# 0x20-0x7E (which covers tab 0x09, LF 0x0A, CR 0x0D and all non-printable/non-ASCII bytes)
# become uppercase `%XX`. No dependency on the JSON tool (printf + an LC_ALL=C byte loop).
pdlc_percent_encode() {
  local input="$1"
  local out="" i c ord hex
  local len=${#input}
  for ((i = 0; i < len; i++)); do
    c="${input:i:1}"
    if [[ "$c" == "%" ]]; then
      out+="%25"
      continue
    fi
    ord=$(printf '%d' "'$c")
    if ((ord >= 32 && ord <= 126)); then
      out+="$c"
    else
      hex=$(printf '%02X' "$ord")
      out+="%${hex}"
    fi
  done
  printf '%s' "$out"
}

# pdlc_trace <phase> <op> <rowId> <arg> — appends one `seq TAB phase TAB op TAB rowId TAB arg LF`
# record to $PDLC_TRACE_FILE. Always exits 0, including when the append fails (FSPEC §4.6: trace
# failures are ignored) — the mandated shape (TSPEC §2.2) is the `{ … } 2>/dev/null || true` group
# below; nothing softens this into "the trace file must be writable".
pdlc_trace() {
  local phase="$1" op="$2" rowId="$3" arg="$4"
  _PDLC_TRACE_SEQ=$((${_PDLC_TRACE_SEQ:-0} + 1))
  local encoded
  encoded="$(pdlc_percent_encode "$arg")"
  {
    printf '%s\t%s\t%s\t%s\t%s\n' "$_PDLC_TRACE_SEQ" "$phase" "$op" "$rowId" "$encoded" >>"${PDLC_TRACE_FILE:-/dev/null}"
  } 2>/dev/null || true
  return 0
}

# ───────────────────────────────── tool probes ────────────────────────────────────────────────

# pdlc_probe_json_tool — mirrors the sibling hooks' Python-discovery-loop precedent
# (`pdlc/hooks/scripts/nudge-consolidation.sh`): probe each candidate by actually running it, not
# just `command -v`, so a stub interpreter (e.g. Windows's Microsoft Store `python` stub) is
# rejected rather than accepted.
pdlc_probe_json_tool() {
  local cand
  PDLC_PY_BIN=""
  for cand in python3 python py; do
    if command -v "$cand" >/dev/null 2>&1 && "$cand" -c "import sys" >/dev/null 2>&1; then
      PDLC_PY_BIN="$cand"
      return 0
    fi
  done
  return 1
}

# pdlc_json_read <file> <query> — FSPEC §2.3's closed four-outcome contract. `query` is a
# dot-path (".a.b"); stdout is the raw string value on a string leaf, or its JSON text otherwise
# (never JSON-quoted for a string leaf). Named exceptions only inside the Python helper, never a
# bare `except`.
pdlc_json_read() {
  local file="$1" query="$2"

  [[ -e "$file" ]] || return 11
  [[ -r "$file" ]] || return 10

  if [[ -z "${PDLC_PY_BIN:-}" ]]; then
    pdlc_probe_json_tool || return 10
  fi

  local out status
  out="$(
    "$PDLC_PY_BIN" - "$file" "$query" <<'PDLC_JSON_READ_PY'
import json
import sys

path, query = sys.argv[1], sys.argv[2]

try:
    with open(path, "r") as fh:
        raw = fh.read()
except OSError:
    sys.exit(10)

try:
    data = json.loads(raw)
except ValueError:
    sys.exit(12)

remainder = query[1:] if query.startswith(".") else query
parts = remainder.split(".") if remainder else []

value = data
for part in parts:
    if isinstance(value, dict) and part in value:
        value = value[part]
    else:
        sys.exit(12)

if isinstance(value, str):
    sys.stdout.write(value)
else:
    sys.stdout.write(json.dumps(value))
sys.exit(0)
PDLC_JSON_READ_PY
  )"
  status=$?

  case "$status" in
    0)
      printf '%s' "$out"
      return 0
      ;;
    10 | 12)
      return "$status"
      ;;
    *)
      return 12
      ;;
  esac
}

# pdlc_probe_hash_tool — resolves a sha1 utility on PATH; `shasum -a 1` (macOS default) preferred,
# `sha1sum` (Linux/coreutils) as fallback.
pdlc_probe_hash_tool() {
  if command -v shasum >/dev/null 2>&1; then
    PDLC_HASH_BIN="shasum"
    PDLC_HASH_ARGS="-a 1"
    return 0
  fi
  if command -v sha1sum >/dev/null 2>&1; then
    PDLC_HASH_BIN="sha1sum"
    PDLC_HASH_ARGS=""
    return 0
  fi
  PDLC_HASH_BIN=""
  PDLC_HASH_ARGS=""
  return 1
}

# pdlc_sha1 <file> — stdout is 40 lowercase hex chars on success.
pdlc_sha1() {
  local file="$1"

  if [[ -z "${PDLC_HASH_BIN:-}" ]]; then
    pdlc_probe_hash_tool || return 1
  fi
  [[ -r "$file" ]] || return 1

  local out
  if [[ "$PDLC_HASH_BIN" == "shasum" ]]; then
    out="$(shasum -a 1 "$file" 2>/dev/null)" || return 1
  else
    out="$(sha1sum "$file" 2>/dev/null)" || return 1
  fi
  [[ -z "$out" ]] && return 1

  printf '%s' "${out%% *}"
  return 0
}

# ───────────────────────────────── §11.1/§11.2 — the backup-filename grammar ──────────────────

# pdlc_backup_format <id> <stamp> <nn> — stdout `{id}.{stamp}-{NN}.bak`, NN zero-padded to 2
# digits. Exit 1 if `nn > 99` or `id` fails the M6 charset.
pdlc_backup_format() {
  local id="$1" stamp="$2" nn="$3"

  [[ "$id" =~ $PDLC_M6_ID_REGEX ]] || return 1
  [[ "$nn" =~ ^[0-9]+$ ]] || return 1
  ((10#$nn <= 99)) || return 1

  local padded
  padded="$(printf '%02d' "$((10#$nn))")"
  printf '%s.%s-%s.bak' "$id" "$stamp" "$padded"
  return 0
}

# pdlc_backup_parse <name> — stdout `id TAB stamp TAB nn`. The tail is a fixed 24 bytes:
# `.` + 16-char stamp + `-` + 2-digit NN + `.bak` (1 + 16 + 1 + 2 + 4 = 24). Exit 1 if the tail
# does not match, or if what remains before it is not itself a valid M6 id.
pdlc_backup_parse() {
  local name="$1"
  local len=${#name}

  ((len > 24)) || return 1

  local tail="${name: -24}"
  if [[ "$tail" =~ ^\.([0-9]{8}T[0-9]{6}Z)-([0-9]{2})\.bak$ ]]; then
    local stamp="${BASH_REMATCH[1]}"
    local nn="${BASH_REMATCH[2]}"
    local id="${name:0:len-24}"
    [[ "$id" =~ $PDLC_M6_ID_REGEX ]] || return 1
    printf '%s\t%s\t%s' "$id" "$stamp" "$nn"
    return 0
  fi
  return 1
}

# pdlc_prune_backups <dir> <knownIds…> — always exits 0 (pruning is best-effort; a failure
# surfaces as `operation: backup` on the next write, not as a prune error). Keeps the newest 5
# per known id via `LC_ALL=C` descending filename sort (never mtime); every other entry
# (decoys, unknown ids, non-backup-shaped files) is left byte-for-byte untouched.
pdlc_prune_backups() {
  local dir="$1"
  shift
  local -a knownIds=("$@")

  [[ -d "$dir" ]] || return 0

  local id
  for id in "${knownIds[@]:-}"; do
    [[ -z "$id" ]] && continue

    local -a matched=()
    local f base parsed status parsedId
    for f in "$dir"/*; do
      [[ -e "$f" ]] || continue
      base="$(basename "$f")"
      parsed="$(pdlc_backup_parse "$base" 2>/dev/null)"
      status=$?
      ((status == 0)) || continue
      parsedId="${parsed%%$'\t'*}"
      [[ "$parsedId" == "$id" ]] || continue
      matched+=("$base")
    done

    ((${#matched[@]} <= 5)) && continue

    local -a sorted=()
    while IFS= read -r base; do
      [[ -n "$base" ]] && sorted+=("$base")
    done < <(printf '%s\n' "${matched[@]}" | LC_ALL=C sort -r)

    local i
    for ((i = 5; i < ${#sorted[@]}; i++)); do
      rm -f -- "${dir}/${sorted[$i]}" 2>/dev/null || true
    done
  done

  return 0
}

# ─────────────────────────────────────────────────────────────────────────────────────────────
# Layer 2 (T-32 — resolution/baseline) appends below this line: `pdlc_resolve_repo_root`,
# `pdlc_resolve_plugin_root`, `pdlc_load_manifest`, `pdlc_validate_manifest`,
# `pdlc_resolve_check_enabled`, `pdlc_resolve_baseline`.
# ─────────────────────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────────────────────
# Layer 3 (T-33 — classifier) appends below this line: `pdlc_classify_row`, `pdlc_classify_all`.
# ─────────────────────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────────────────────
# Layer 4 (T-34 — writers/ladder/backups) appends below this line: `pdlc_write_drift_state`,
# `pdlc_emit_printf_record`, `pdlc_backup`.
# ─────────────────────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────────────────────
# Layer 5 (T-35 — messages) appends below this line: `pdlc_msg_*`.
# ─────────────────────────────────────────────────────────────────────────────────────────────
