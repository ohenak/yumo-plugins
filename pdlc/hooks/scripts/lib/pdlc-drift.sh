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
  printf 'pdlc: unrecognised PDLC_FAULT token "%s"; no fault injected.\n' "$1" >&2
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
    # bash 3.2's `printf '%d' "'<byte>"` sign-extends: any byte >= 0x80 comes back negative
    # (0xE2 -> -30), and `printf '%02X'` on that yields %FFFFFFFFFFFFFFE2. Under LC_ALL=C the
    # loop is byte-wise, so the true value is always the unsigned byte.
    if ((ord < 0)); then ord=$((ord + 256)); fi
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
      base="${f##*/}"
      parsed="$(pdlc_backup_parse "$base" 2>/dev/null)"
      status=$?
      ((status == 0)) || continue
      parsedId="${parsed%%$'\t'*}"
      [[ "$parsedId" == "$id" ]] || continue
      matched+=("$base")
    done

    ((${#matched[@]} <= 5)) && continue

    # Bash-native descending insertion sort (LC_ALL=C is exported unconditionally at this
    # file's top, so bash's own `[[ a > b ]]` string comparison is byte-wise here, matching
    # `LC_ALL=C sort -r` exactly) — `sort` is not a probe-sandbox PATH tool (cf58ac7's
    # precedent: fix the shell code, do not widen PROBE_PATH_TOOLS).
    local -a sorted=()
    local item pos inserted
    for item in "${matched[@]}"; do
      inserted=0
      for ((pos = 0; pos < ${#sorted[@]}; pos++)); do
        if [[ "$item" > "${sorted[$pos]}" ]]; then
          sorted=("${sorted[@]:0:pos}" "$item" "${sorted[@]:pos}")
          inserted=1
          break
        fi
      done
      ((inserted == 0)) && sorted+=("$item")
    done

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

# Generic TAB/US splitter shared by this layer's row-population code below (distinct from
# `_pdlc_fault_split_commas` above, which is hardcoded to `,` and belongs to layer 1). Manual
# prefix-stripping — not `IFS=... read -a` — so empty fields survive (bash 3.2, same technique
# as `bin/lib-probe.sh`'s `split_tab_fields`). Result lands in the global `_PDLC_SPLIT_RESULT`
# array.
_pdlc_split_on() {
  local sep="$1" remaining="$2"
  _PDLC_SPLIT_RESULT=()
  while [[ "$remaining" == *"$sep"* ]]; do
    _PDLC_SPLIT_RESULT+=("${remaining%%"$sep"*}")
    remaining="${remaining#*"$sep"}"
  done
  _PDLC_SPLIT_RESULT+=("$remaining")
}

# pdlc_resolve_repo_root — FSPEC §2.2/AC-0.5. Step 1: git's main-worktree, via
# `git worktree list --porcelain`'s first record — NEVER falls through to step 2 on any git-side
# failure (a wrong root is worse than a refusal). Step 2 (only when git itself is absent or the
# cwd is not inside any git work tree): an ancestor walk from `$PWD` looking for a `.claude/`
# directory, stopping (not descending into, and not itself accepted as a match) at `$HOME` and at
# `/`. Either step's candidate is rejected outright if it normalises to `$HOME` or to `/`
# (`realpath`-style normalisation via the `cd ... && pwd -P` builtin idiom — no external
# `realpath`/`dirname` binary is assumed to exist on PATH). Honors `PDLC_FAULT` tokens
# `git-worktree-list` (step 1) and `walk-stat` (step 2), one per guard (T-32/O-3).
pdlc_resolve_repo_root() {
  PDLC_REPO_ROOT=""
  local candidate=""

  if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
    if pdlc_fault_active "git-worktree-list"; then
      return 1
    fi

    local worktreeList
    worktreeList="$(git worktree list --porcelain 2>/dev/null)" || return 1

    local line firstWorktree=""
    while IFS= read -r line; do
      case "$line" in
        "worktree "*)
          firstWorktree="${line#worktree }"
          break
          ;;
      esac
    done <<<"$worktreeList"

    [[ -z "$firstWorktree" ]] && return 1

    local candidateNorm
    candidateNorm="$(cd "$firstWorktree" 2>/dev/null && pwd -P)" || return 1
    [[ -d "$candidateNorm" && -x "$candidateNorm" ]] || return 1

    local isBare
    isBare="$(git -C "$candidateNorm" rev-parse --is-bare-repository 2>/dev/null)" || return 1
    [[ "$isBare" == "false" ]] || return 1

    local topLevel topLevelNorm
    topLevel="$(git -C "$candidateNorm" rev-parse --show-toplevel 2>/dev/null)" || return 1
    topLevelNorm="$(cd "$topLevel" 2>/dev/null && pwd -P)" || return 1
    [[ "$candidateNorm" == "$topLevelNorm" ]] || return 1

    candidate="$candidateNorm"
  else
    if pdlc_fault_active "walk-stat"; then
      return 1
    fi

    local dir
    dir="$(pwd -P)"
    local homeNorm=""
    homeNorm="$(cd "${HOME:-/}" 2>/dev/null && pwd -P)" || homeNorm=""

    while true; do
      [[ -n "$homeNorm" && "$dir" == "$homeNorm" ]] && break
      [[ "$dir" == "/" ]] && break
      if [[ -d "${dir}/.claude" ]]; then
        candidate="$dir"
        break
      fi
      local parent="${dir%/*}"
      [[ -z "$parent" ]] && parent="/"
      dir="$parent"
    done
  fi

  [[ -z "$candidate" ]] && return 1

  local homeNorm2=""
  homeNorm2="$(cd "${HOME:-/}" 2>/dev/null && pwd -P)" || homeNorm2=""
  if [[ "$candidate" == "$homeNorm2" || "$candidate" == "/" ]]; then
    return 1
  fi

  PDLC_REPO_ROOT="$candidate"
  return 0
}

# pdlc_resolve_plugin_root — FSPEC §2.4 (AC-0.3/AC-0.3a/AC-0.4). Checks the maintainer marker
# (`<repoRoot>/pdlc/workflows/build-runtime.mjs`) FIRST — but only when `PDLC_REPO_ROOT` is
# non-empty; when repo-root resolution failed (empty `PDLC_REPO_ROOT`), the marker branch is
# skipped entirely (never probed against an empty-string path), falling straight through to the
# `${CLAUDE_PLUGIN_ROOT}` branch, which stays independently determinate. `CLAUDE_PLUGIN_ROOT` is
# consulted verbatim — never enumerated, sorted, or version-compared.
pdlc_resolve_plugin_root() {
  PDLC_PLUGIN_ROOT=""
  PDLC_PLUGIN_ROOT_REASON=""

  local repoRoot="${PDLC_REPO_ROOT:-}"
  if [[ -n "$repoRoot" && -e "${repoRoot}/pdlc/workflows/build-runtime.mjs" ]]; then
    PDLC_PLUGIN_ROOT="${repoRoot}/pdlc"
    PDLC_PLUGIN_ROOT_REASON="maintainer-marker"
    return 0
  fi

  local envRoot="${CLAUDE_PLUGIN_ROOT:-}"
  if [[ -z "$envRoot" ]]; then
    PDLC_PLUGIN_ROOT_REASON="plugin-root-unset"
    return 1
  fi

  if [[ ! -d "$envRoot" || ! -x "$envRoot" ]]; then
    PDLC_PLUGIN_ROOT_REASON="plugin-root-unreadable"
    return 1
  fi

  PDLC_PLUGIN_ROOT="$envRoot"
  PDLC_PLUGIN_ROOT_REASON="claude-plugin-root"
  return 0
}

# Internal: parses and validates the distribution manifest at "$1" (FSPEC §1.1's M1-M10 clauses,
# evaluated in order, first failure decides). Exit codes mirror `pdlc_json_read`'s four-outcome
# contract (FSPEC §2.3) as closely as a whole-document parse can: `0` well-formed (rows MAY be
# empty — M2 does not require a non-empty `rows` array), `10` unreadable (defensive only — the
# caller already probes `-r` first), `12` malformed (a JSON parse failure, or any M1-M10 clause
# failure), `20` no JSON tool available at all (distinct from `10`/`12` so the caller can
# attribute this to E2 (json-tool-absent) rather than manufacturing a false
# `plugin-root-unreadable`/`manifest-malformed` reading). On success, stdout is a `META` line
# (`META TAB pluginVersion TAB retired-joined-by-\x1f`) followed by one line per row (`id TAB
# pluginPath TAB consumerPath TAB artifactVersion TAB pluginSha1 TAB retires-joined-by-\x1f`). On
# a `12`, stdout is exactly one line: `MALFORMED TAB <clause>` (`<clause>` is `PARSE` for a JSON
# syntax failure, or `M1`..`M10`).
_pdlc_manifest_read() {
  local path="$1"

  if [[ -z "${PDLC_PY_BIN:-}" ]]; then
    pdlc_probe_json_tool || return 20
  fi

  "$PDLC_PY_BIN" - "$path" <<'PDLC_MANIFEST_READ_PY'
import json
import re
import sys

path = sys.argv[1]

try:
    with open(path, "r") as fh:
        raw = fh.read()
except OSError:
    sys.exit(10)


def fail(clause):
    print("MALFORMED\t{}".format(clause))
    sys.exit(12)


try:
    doc = json.loads(raw)
except ValueError:
    fail("PARSE")

if not isinstance(doc, dict):
    fail("M1")

schema_version = doc.get("schemaVersion")
if isinstance(schema_version, bool) or not isinstance(schema_version, int) or schema_version != 1:
    fail("M1")

rows = doc.get("rows")
if not isinstance(rows, list):
    fail("M2")

# Same character class as the bash-side `PDLC_M6_ID_REGEX` (layer 1) — kept as a literal here
# since bash and python cannot share a compiled pattern across the process boundary.
ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")
SHA1_RE = re.compile(r"^[0-9a-f]{40}$")
REQUIRED_KEYS = {"id", "pluginPath", "consumerPath", "artifactVersion", "pluginSha1", "retires"}

seen_ids = []
all_retires_flat = []
consumer_paths = []

for row in rows:
    if not isinstance(row, dict) or set(row.keys()) != REQUIRED_KEYS:
        fail("M3")
    retires = row.get("retires")
    if not isinstance(retires, list):
        fail("M3")

    for key in ("id", "pluginPath", "consumerPath", "artifactVersion", "pluginSha1"):
        value = row.get(key)
        if not isinstance(value, str) or value == "":
            fail("M4")
    for member in retires:
        if not isinstance(member, str) or member == "":
            fail("M4")

    for candidate in [row["pluginPath"], row["consumerPath"]] + retires:
        if candidate.startswith("/") or "\\" in candidate or "\x00" in candidate:
            fail("M5")
        segments = candidate.split("/")
        if "." in segments or ".." in segments:
            fail("M5")

    seen_ids.append(row["id"])
    all_retires_flat.extend(retires)
    consumer_paths.append(row["consumerPath"])


def basename(p):
    return p.rsplit("/", 1)[-1]


union_namespace = list(seen_ids) + [basename(p) for p in all_retires_flat]
for name in union_namespace:
    if not ID_RE.match(name):
        fail("M6")
if len(set(union_namespace)) != len(union_namespace):
    fail("M6")

if len(set(all_retires_flat)) != len(all_retires_flat):
    fail("M7")
consumer_path_set = set(consumer_paths)
for member in all_retires_flat:
    if member in consumer_path_set:
        fail("M7")

retired = doc.get("retired")
if not isinstance(retired, list):
    fail("M8")
if set(retired) != set(all_retires_flat):
    fail("M8")

for row in rows:
    if not SHA1_RE.match(row["pluginSha1"]):
        fail("M9")

PREFIX = ".claude/workflows/"
for row in rows:
    for candidate in [row["consumerPath"]] + row["retires"]:
        if not candidate.startswith(PREFIX):
            fail("M10")
        remainder = candidate[len(PREFIX):]
        if remainder == "" or "/" in remainder:
            fail("M10")
        if remainder.startswith(".pdlc-"):
            fail("M10")

plugin_version = doc.get("pluginVersion")
if not isinstance(plugin_version, str):
    plugin_version = ""

print("META\t{}\t{}".format(plugin_version, "\x1f".join(retired)))
for row in rows:
    print(
        "\t".join(
            [
                row["id"],
                row["pluginPath"],
                row["consumerPath"],
                row["artifactVersion"],
                row["pluginSha1"],
                "\x1f".join(row["retires"]),
            ]
        )
    )
sys.exit(0)
PDLC_MANIFEST_READ_PY
}

# Internal: populates the `PDLC_ROWS_*` parallel arrays (manifest order preserved) and
# `PDLC_RETIRED`/`PDLC_MANIFEST_PLUGIN_VERSION` from `_pdlc_manifest_read`'s well-formed ("$1",
# status 0) stdout. Each `PDLC_ROWS_RETIRES[i]` is that row's `retires` list joined by `\x1f` —
# bash 3.2 has no arrays-of-arrays, so a consumer that needs the individual members splits with
# `_pdlc_split_on $'\x1f' "${PDLC_ROWS_RETIRES[i]}"`.
_pdlc_manifest_populate_rows() {
  local out="$1"
  local firstLine=1
  local line

  while IFS= read -r line; do
    if ((firstLine)); then
      firstLine=0
      _pdlc_split_on $'\t' "$line"
      PDLC_MANIFEST_PLUGIN_VERSION="${_PDLC_SPLIT_RESULT[1]:-}"
      _pdlc_split_on $'\x1f' "${_PDLC_SPLIT_RESULT[2]:-}"
      if [[ -z "${_PDLC_SPLIT_RESULT[0]:-}" && ${#_PDLC_SPLIT_RESULT[@]} -le 1 ]]; then
        PDLC_RETIRED=()
      else
        PDLC_RETIRED=("${_PDLC_SPLIT_RESULT[@]}")
      fi
      continue
    fi
    [[ -z "$line" ]] && continue
    _pdlc_split_on $'\t' "$line"
    PDLC_ROWS_ID+=("${_PDLC_SPLIT_RESULT[0]:-}")
    PDLC_ROWS_PLUGIN_PATH+=("${_PDLC_SPLIT_RESULT[1]:-}")
    PDLC_ROWS_CONSUMER_PATH+=("${_PDLC_SPLIT_RESULT[2]:-}")
    PDLC_ROWS_ARTIFACT_VERSION+=("${_PDLC_SPLIT_RESULT[3]:-}")
    PDLC_ROWS_SHA1+=("${_PDLC_SPLIT_RESULT[4]:-}")
    PDLC_ROWS_RETIRES+=("${_PDLC_SPLIT_RESULT[5]:-}")
    PDLC_ROWS_STATE+=("")
  done <<<"$out"
}

# pdlc_validate_manifest <manifestPath> — TSPEC §2.2's standalone validator entry point: re-runs
# the same M1-M10 check `pdlc_load_manifest` performs as part of loading, for a caller that
# already has a path and wants a would-this-parse verdict without touching `PDLC_ROWS_*`. Sets
# `PDLC_MALFORMED_CLAUSE` (empty string when well-formed).
pdlc_validate_manifest() {
  local path="$1"
  local out status

  out="$(_pdlc_manifest_read "$path")"
  status=$?

  case "$status" in
    0)
      PDLC_MALFORMED_CLAUSE=""
      return 0
      ;;
    12)
      _pdlc_split_on $'\t' "$out"
      PDLC_MALFORMED_CLAUSE="${_PDLC_SPLIT_RESULT[1]:-}"
      return 1
      ;;
    *)
      PDLC_MALFORMED_CLAUSE=""
      return 1
      ;;
  esac
}

# N-5 (FSPEC §8.3): one verbatim stderr notice per degraded checkEnabled read. Layer 5 (T-35) may
# route this through a shared `pdlc_msg_*` once that layer lands; layer 2 emits it directly so
# this behaves correctly standing alone (same precedent as layer 1's N-7 fault-token notice).
_pdlc_check_enabled_notice() {
  printf 'pdlc: %s could not be read for distribution.checkEnabled; assuming true.\n' "$1" >&2
}

# pdlc_resolve_check_enabled — FSPEC §2.7 (AC-4.3). Reads `distribution.checkEnabled` from
# `<repoRoot>/.claude/pdlc.config.json` via `pdlc_json_read`. Runs on EVERY path, including when
# the baseline itself is unresolved (E7 is independent of E1-E6), and is fail-closed to `true` in
# every degraded case (file absent is the ordinary, undegraded default — no notice; unreadable,
# malformed, an explicit non-boolean value, or "key not found on an otherwise well-formed
# document" all still resolve `true`, WITH the N-5 notice — `pdlc_json_read`'s four-outcome
# contract cannot distinguish "key absent" from "document did not parse" for a nested dot-path,
# FSPEC §2.3, so those two are folded together here). Only an explicit boolean `false` value
# resolves `false`. Always returns 0.
pdlc_resolve_check_enabled() {
  PDLC_CHECK_ENABLED="true"
  local root="${PDLC_REPO_ROOT:-}"

  [[ -z "$root" ]] && return 0

  local configPath="${root}/.claude/pdlc.config.json"
  # §4.2 op table: `config-read`, emitted only when a read is actually attempted (repo root
  # resolved) — arg is the config path, regardless of the subsequent outcome.
  pdlc_trace "run" "config-read" "-" "$configPath"
  local raw status
  raw="$(pdlc_json_read "$configPath" ".distribution.checkEnabled")"
  status=$?

  case "$status" in
    11) : ;;
    0)
      case "$raw" in
        true) PDLC_CHECK_ENABLED="true" ;;
        false) PDLC_CHECK_ENABLED="false" ;;
        *)
          PDLC_CHECK_ENABLED="true"
          _pdlc_check_enabled_notice "$configPath"
          ;;
      esac
      ;;
    *)
      PDLC_CHECK_ENABLED="true"
      _pdlc_check_enabled_notice "$configPath"
      ;;
  esac

  return 0
}

# pdlc_resolve_baseline — FSPEC §2.1 Phase 2 / §2.8's fixed eight-reason precedence (highest
# first): `drift-state-invalidated > manifest-empty > json-tool-absent > manifest-malformed >
# manifest-absent > repo-root-unresolved > plugin-root-unreadable > plugin-root-unset`. Applies
# selection over the evidence `pdlc_load_manifest` (Phase 1) already gathered into this layer's
# `_PDLC_EV_*` scratch variables, publishing the three-way holds/does-not-hold/indeterminate
# reading as `PDLC_EVIDENCE_REPO_ROOT`/`PDLC_EVIDENCE_PLUGIN_ROOT`/`PDLC_EVIDENCE_MANIFEST` and
# the selection as `PDLC_BASELINE_STATUS`/`PDLC_BASELINE_REASON`. `drift-state-invalidated` is
# deliberately NOT selected here — FSPEC §4.4 rung (i) (layer 4, T-34) produces it AFTER
# selection, as a post-hoc override of whatever this function chose. Not called standalone in the
# ordinary flow (`pdlc_load_manifest` calls it as its last step) but kept as its own function per
# TSPEC §2.2's table.
pdlc_resolve_baseline() {
  PDLC_EVIDENCE_REPO_ROOT="${_PDLC_EV_REPO_ROOT:-does-not-hold}"
  PDLC_EVIDENCE_PLUGIN_ROOT="${_PDLC_EV_PLUGIN_ROOT:-ok}"
  PDLC_EVIDENCE_MANIFEST="${_PDLC_EV_MANIFEST:-indeterminate}"

  if [[ "$PDLC_EVIDENCE_MANIFEST" == "manifest-empty" ]]; then
    PDLC_BASELINE_STATUS="unresolved"
    PDLC_BASELINE_REASON="manifest-empty"
    return 1
  fi

  if [[ "${_PDLC_EV_JSON_TOOL:-does-not-hold}" == "holds" ]]; then
    PDLC_BASELINE_STATUS="unresolved"
    PDLC_BASELINE_REASON="json-tool-absent"
    return 1
  fi

  if [[ "$PDLC_EVIDENCE_MANIFEST" == "manifest-malformed" ]]; then
    PDLC_BASELINE_STATUS="unresolved"
    PDLC_BASELINE_REASON="manifest-malformed"
    return 1
  fi

  if [[ "$PDLC_EVIDENCE_MANIFEST" == "manifest-absent" ]]; then
    PDLC_BASELINE_STATUS="unresolved"
    PDLC_BASELINE_REASON="manifest-absent"
    return 1
  fi

  if [[ "$PDLC_EVIDENCE_REPO_ROOT" == "holds" ]]; then
    PDLC_BASELINE_STATUS="unresolved"
    PDLC_BASELINE_REASON="repo-root-unresolved"
    return 1
  fi

  if [[ "$PDLC_EVIDENCE_PLUGIN_ROOT" == "unreadable" ]]; then
    PDLC_BASELINE_STATUS="unresolved"
    PDLC_BASELINE_REASON="plugin-root-unreadable"
    return 1
  fi

  if [[ "$PDLC_EVIDENCE_PLUGIN_ROOT" == "unset" ]]; then
    PDLC_BASELINE_STATUS="unresolved"
    PDLC_BASELINE_REASON="plugin-root-unset"
    return 1
  fi

  PDLC_BASELINE_STATUS="resolved"
  PDLC_BASELINE_REASON=""
  return 0
}

# pdlc_load_manifest [<repoRootOverride> <pluginRootOverride>] — TSPEC §2.2's function; its
# ordinary (zero-arg) inputs are `PDLC_REPO_ROOT`/`PDLC_PLUGIN_ROOT`/`CLAUDE_PLUGIN_ROOT`, already
# resolved by `pdlc_resolve_repo_root`/`pdlc_resolve_plugin_root`. The two positional args are a
# probe-only convenience (PLAN T-39's `bin/lib-probe.sh` batched driver has no shell to run those
# two resolvers against first) — when given, they are used VERBATIM in place of resolving, never
# consulted for anything else. This is the whole evidence-then-select pipeline's single entry
# point: it resolves whatever of `PDLC_REPO_ROOT`/`PDLC_PLUGIN_ROOT` is still unset, loads and
# validates the manifest (M1-M10, FSPEC §1.1), resolves `PDLC_CHECK_ENABLED` (E7, on every path —
# FSPEC §2.7), and finally calls `pdlc_resolve_baseline` to select
# `PDLC_BASELINE_STATUS`/`PDLC_BASELINE_REASON` over the gathered evidence (FSPEC §2.1/§2.8). Per
# the no-write-target rule (FSPEC §2.1, normative): callers must gate any write under
# `<repoRoot>`-relative paths on `PDLC_EVIDENCE_REPO_ROOT != "holds"` — on evidence, never on
# which reason `PDLC_BASELINE_REASON` happens to report.
pdlc_load_manifest() {
  local repoRootArg="${1:-}" pluginRootArg="${2:-}"

  if [[ -n "$repoRootArg" ]]; then
    PDLC_REPO_ROOT="$repoRootArg"
    _PDLC_EV_REPO_ROOT="does-not-hold"
  elif [[ -n "${PDLC_REPO_ROOT:-}" ]]; then
    _PDLC_EV_REPO_ROOT="does-not-hold"
  else
    if pdlc_resolve_repo_root; then
      _PDLC_EV_REPO_ROOT="does-not-hold"
    else
      _PDLC_EV_REPO_ROOT="holds"
    fi
  fi
  # §4.2 op table: `repo-root`, emitted once per invocation regardless of which branch above
  # resolved it (including the probe-only override), arg empty when unresolved.
  pdlc_trace "run" "repo-root" "-" "${PDLC_REPO_ROOT:-}"

  if [[ -n "$pluginRootArg" ]]; then
    PDLC_PLUGIN_ROOT="$pluginRootArg"
    PDLC_PLUGIN_ROOT_REASON="explicit"
    _PDLC_EV_PLUGIN_ROOT="ok"
  else
    if pdlc_resolve_plugin_root; then
      _PDLC_EV_PLUGIN_ROOT="ok"
    else
      case "$PDLC_PLUGIN_ROOT_REASON" in
        plugin-root-unset) _PDLC_EV_PLUGIN_ROOT="unset" ;;
        *) _PDLC_EV_PLUGIN_ROOT="unreadable" ;;
      esac
    fi
  fi

  # E2 (json-tool-absent) is independent of every other axis (PROPERTIES §5.1: never
  # indeterminate) — probed unconditionally, regardless of plugin-root state.
  if [[ -z "${PDLC_PY_BIN:-}" ]]; then
    if pdlc_probe_json_tool; then
      _PDLC_EV_JSON_TOOL="does-not-hold"
    else
      _PDLC_EV_JSON_TOOL="holds"
    fi
  else
    _PDLC_EV_JSON_TOOL="does-not-hold"
  fi
  # §4.2 op table: `plugin-root`, emitted once per invocation regardless of which branch above
  # resolved it, arg empty when unresolved.
  pdlc_trace "run" "plugin-root" "-" "${PDLC_PLUGIN_ROOT:-}"

  PDLC_ROWS_ID=()
  PDLC_ROWS_PLUGIN_PATH=()
  PDLC_ROWS_CONSUMER_PATH=()
  PDLC_ROWS_ARTIFACT_VERSION=()
  PDLC_ROWS_SHA1=()
  PDLC_ROWS_RETIRES=()
  PDLC_ROWS_STATE=()
  PDLC_RETIRED=()
  PDLC_MANIFEST_REASON=""
  PDLC_MANIFEST_PLUGIN_VERSION=""
  PDLC_MALFORMED_CLAUSE=""
  _PDLC_EV_MANIFEST="indeterminate"

  if [[ "$_PDLC_EV_PLUGIN_ROOT" != "ok" ]]; then
    # E4/E5/E6 indeterminate (PROPERTIES §5.1): no resolved <pluginRoot> to read a manifest from.
    _PDLC_EV_MANIFEST="indeterminate"
  else
    local manifestPath="${PDLC_PLUGIN_ROOT}/workflows/dist/distribution-manifest.json"
    if [[ ! -e "$manifestPath" ]]; then
      PDLC_MANIFEST_REASON="manifest-absent"
      _PDLC_EV_MANIFEST="manifest-absent"
    elif [[ ! -r "$manifestPath" ]]; then
      PDLC_MANIFEST_REASON="plugin-root-unreadable"
      _PDLC_EV_PLUGIN_ROOT="unreadable"
      _PDLC_EV_MANIFEST="indeterminate"
    else
      # §4.2 op table: `manifest-read`, emitted only when a read is actually attempted (a
      # readable manifest was found) — this is E4/E5's own probe point, so oracle §4.3(d)'s
      # "manifest-read precedes any classify" positive-presence check only expects a record on
      # this path, never on manifest-absent/plugin-root-unreadable/indeterminate paths.
      pdlc_trace "run" "manifest-read" "-" "$manifestPath"
      local manifestOut manifestStatus
      manifestOut="$(_pdlc_manifest_read "$manifestPath")"
      manifestStatus=$?
      case "$manifestStatus" in
        0)
          _pdlc_manifest_populate_rows "$manifestOut"
          if ((${#PDLC_ROWS_ID[@]} == 0)); then
            PDLC_MANIFEST_REASON="manifest-empty"
            _PDLC_EV_MANIFEST="manifest-empty"
          else
            PDLC_MANIFEST_REASON=""
            _PDLC_EV_MANIFEST="ok"
          fi
          ;;
        20)
          # No JSON tool — E2 already captured independently above; E5/E6 indeterminate here.
          _PDLC_EV_MANIFEST="indeterminate"
          ;;
        12)
          _pdlc_split_on $'\t' "$manifestOut"
          PDLC_MALFORMED_CLAUSE="${_PDLC_SPLIT_RESULT[1]:-}"
          PDLC_MANIFEST_REASON="manifest-malformed"
          _PDLC_EV_MANIFEST="manifest-malformed"
          printf 'pdlc: manifest-malformed (%s)\n' "${PDLC_MALFORMED_CLAUSE:-unknown}" >&2
          ;;
        *)
          PDLC_MANIFEST_REASON="plugin-root-unreadable"
          _PDLC_EV_PLUGIN_ROOT="unreadable"
          _PDLC_EV_MANIFEST="indeterminate"
          ;;
      esac
    fi
  fi

  pdlc_resolve_check_enabled
  pdlc_resolve_baseline
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────────────────────
# Layer 3 (T-33 — classifier) appends below this line: `pdlc_classify_row`, `pdlc_classify_all`.
# ─────────────────────────────────────────────────────────────────────────────────────────────

# Internal: FSPEC §3.2 P1/P3's ancestor-walk existence probe — "yes" (exists) | "no" (absent, and
# its first existing ancestor is traversable — the definite-negative rule, AC-1.1) |
# "indeterminate" (absent, but its first existing ancestor is NOT traversable). An entirely absent
# ancestor chain, up to and including "/", establishes absence (FSPEC §3.2) — "/" always exists on
# a real filesystem, so the walk terminates there rather than looping forever. No `dirname` (not on
# the probe sandbox's PATH) — pure bash parameter expansion, the same idiom
# `pdlc_resolve_repo_root`'s own ancestor walk already uses.
_pdlc_probe_exists() {
  local path="$1"
  if [[ -e "$path" ]]; then
    printf 'yes'
    return 0
  fi

  local dir="$path"
  while true; do
    local parent="${dir%/*}"
    [[ "$parent" == "$dir" || -z "$parent" ]] && parent="/"
    dir="$parent"
    if [[ -e "$dir" ]]; then
      if [[ -x "$dir" ]]; then
        printf 'no'
      else
        printf 'indeterminate'
      fi
      return 0
    fi
    [[ "$dir" == "/" ]] && break
  done
  printf 'no'
  return 0
}

# Internal: emits N-4 (FSPEC §8.3) for a degraded sync-manifest read. Layer 5 (T-35) may route this
# through a shared `pdlc_msg_*` once that layer lands; layer 3 emits it directly so this behaves
# correctly standing alone (same precedent as layer 1's N-7, layer 2's N-5).
_pdlc_sync_manifest_n4_notice() {
  printf 'pdlc: sync manifest at %s is %s; rows that differ are reported unverified.\n' "$1" "$2" >&2
}

# Internal cache for the sync-manifest's `entries` map (FSPEC §1.2). Populated at most once per
# distinct `phase` value seen so far: the file can legitimately change between a sync run's
# distinct passes (§4.2 step 6 rewrites it between the post-copy and post-run passes) but never
# within one pass, so re-reading per row inside the same pass is pure waste, and this also caps the
# `sync-manifest-read` fault guard / trace record at one firing per pass (§5.1.1: "fires at most
# once per run"). Absent is the ordinary first-adoption state (no notice, FSPEC §8.3); unreadable
# and malformed both degrade to "no entries" and print N-4 once per (re)load.
_PDLC_SYNC_CACHE_BUILT=0
_PDLC_SYNC_CACHE_PHASE=""
_PDLC_SYNC_IDS=()
_PDLC_SYNC_CONSUMER_HASH=()
_PDLC_SYNC_ARTIFACT_VERSION=()

_pdlc_sync_manifest_ensure_loaded() {
  local phase="$1"
  if [[ "$_PDLC_SYNC_CACHE_BUILT" == "1" && "$_PDLC_SYNC_CACHE_PHASE" == "$phase" ]]; then
    return 0
  fi
  _PDLC_SYNC_CACHE_BUILT=1
  _PDLC_SYNC_CACHE_PHASE="$phase"
  _PDLC_SYNC_IDS=()
  _PDLC_SYNC_CONSUMER_HASH=()
  _PDLC_SYNC_ARTIFACT_VERSION=()

  local root="${PDLC_REPO_ROOT:-}"
  [[ -z "$root" ]] && return 0

  local path="${root}/.claude/workflows/.pdlc-sync-manifest.json"
  [[ -e "$path" ]] || return 0

  # §4.2 op table: `sync-manifest-read`, emitted only when a read is actually attempted.
  pdlc_trace "run" "sync-manifest-read" "-" "$path"

  if pdlc_fault_active "sync-manifest-read"; then
    _pdlc_sync_manifest_n4_notice "$path" "unreadable"
    return 0
  fi

  if [[ ! -r "$path" ]]; then
    _pdlc_sync_manifest_n4_notice "$path" "unreadable"
    return 0
  fi

  if [[ -z "${PDLC_PY_BIN:-}" ]]; then
    if ! pdlc_probe_json_tool; then
      # No JSON tool: this row's P6 degrades to "no entries", same shape as unreadable/malformed.
      _pdlc_sync_manifest_n4_notice "$path" "unreadable"
      return 0
    fi
  fi

  local out status
  out="$(
    "$PDLC_PY_BIN" - "$path" <<'PDLC_SYNC_READ_PY'
import json
import sys

path = sys.argv[1]

try:
    with open(path, "r") as fh:
        raw = fh.read()
except OSError:
    sys.exit(10)

try:
    doc = json.loads(raw)
except ValueError:
    sys.exit(12)

entries = doc.get("entries")
if not isinstance(entries, dict):
    sys.exit(12)

for rowId, entry in entries.items():
    if not isinstance(entry, dict):
        continue
    consumerHash = entry.get("consumerHash")
    artifactVersion = entry.get("artifactVersion")
    if not isinstance(consumerHash, str):
        consumerHash = ""
    if not isinstance(artifactVersion, str):
        artifactVersion = ""
    print("{}\t{}\t{}".format(rowId, consumerHash, artifactVersion))
sys.exit(0)
PDLC_SYNC_READ_PY
  )"
  status=$?

  if ((status != 0)); then
    _pdlc_sync_manifest_n4_notice "$path" "malformed"
    return 0
  fi

  local line
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    _pdlc_split_on $'\t' "$line"
    _PDLC_SYNC_IDS+=("${_PDLC_SPLIT_RESULT[0]:-}")
    _PDLC_SYNC_CONSUMER_HASH+=("${_PDLC_SPLIT_RESULT[1]:-}")
    _PDLC_SYNC_ARTIFACT_VERSION+=("${_PDLC_SPLIT_RESULT[2]:-}")
  done <<<"$out"
  return 0
}

# Internal: looks up rowId's sync-manifest entry, populated by `_pdlc_sync_manifest_ensure_loaded`.
# Sets `_PDLC_SYNC_ENTRY_HASH` / `_PDLC_SYNC_ENTRY_VERSION`. Returns 0 if found, 1 if not — P6's
# "no entry" outcome (absent document, degraded document, or simply no key for this row, all
# identical per FSPEC §1.2).
_pdlc_sync_manifest_lookup() {
  local rowId="$1"
  _PDLC_SYNC_ENTRY_HASH=""
  _PDLC_SYNC_ENTRY_VERSION=""
  local i
  for ((i = 0; i < ${#_PDLC_SYNC_IDS[@]}; i++)); do
    if [[ "${_PDLC_SYNC_IDS[$i]}" == "$rowId" ]]; then
      _PDLC_SYNC_ENTRY_HASH="${_PDLC_SYNC_CONSUMER_HASH[$i]}"
      _PDLC_SYNC_ENTRY_VERSION="${_PDLC_SYNC_ARTIFACT_VERSION[$i]}"
      return 0
    fi
  done
  return 1
}

# pdlc_classify_row <rowIndex> <phase> — FSPEC §3.3's six-state ladder, first-match, evaluated in
# exactly the declared precedence order (`unknown` > `missing` > `in-sync` > `unverified` >
# `stale` > `local-edit`). `phase` is the ONLY place a trace pass label is set (TSPEC §2.2's
# structural rule) — it is stamped verbatim onto this row's single `classify` trace record, never
# derived or re-labelled anywhere else. `rowIndex` is 0-based, into the `PDLC_ROWS_*` parallel
# arrays `pdlc_load_manifest` populated. Rows are independent (§3.1) — no row's outcome is an input
# to another's. Always returns 0 (TSPEC §2.2).
pdlc_classify_row() {
  local rowIndex="$1" phase="$2"
  local rowId="${PDLC_ROWS_ID[$rowIndex]:-}"
  local pluginRelPath="${PDLC_ROWS_PLUGIN_PATH[$rowIndex]:-}"
  local consumerRelPath="${PDLC_ROWS_CONSUMER_PATH[$rowIndex]:-}"

  PDLC_ROW_STATE=""
  PDLC_ROW_REASON=""
  PDLC_ROW_PLUGIN_HASH=""
  PDLC_ROW_CONSUMER_HASH=""
  PDLC_ROW_PLUGIN_ARTIFACT_VERSION="${PDLC_ROWS_ARTIFACT_VERSION[$rowIndex]:-}"
  PDLC_ROW_CONSUMER_ARTIFACT_VERSION=""

  # Rung 1a: hash-tool-absent — a property of the MACHINE, ranked first (§3.3) precisely so it is
  # all-or-nothing across every row in a run. The probe runs once per run (SE Q-02); this function
  # only reads `PDLC_HASH_BIN`, it never re-probes.
  if [[ -z "${PDLC_HASH_BIN:-}" ]]; then
    PDLC_ROW_STATE="unknown"
    PDLC_ROW_REASON="hash-tool-absent"
    pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
    return 0
  fi

  local pluginAbs="${PDLC_PLUGIN_ROOT:-}/${pluginRelPath}"
  local consumerAbs="${PDLC_REPO_ROOT:-}/${consumerRelPath}"

  # Rung 1b/1c: P1 — plugin artifact exists.
  local p1
  p1="$(_pdlc_probe_exists "$pluginAbs")"
  if [[ "$p1" == "no" ]]; then
    PDLC_ROW_STATE="unknown"
    PDLC_ROW_REASON="plugin-artifact-missing"
    pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
    return 0
  fi
  if [[ "$p1" == "indeterminate" ]]; then
    # An untraversable ancestor on the PLUGIN side reports the same reason as an unreadable plugin
    # artifact (FSPEC §3.3 footnote) — the two are the same remediation from the operator's chair.
    PDLC_ROW_STATE="unknown"
    PDLC_ROW_REASON="plugin-artifact-unreadable"
    pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
    return 0
  fi

  # Rung 1d: P2 — plugin artifact readable. Fault token 15 gates the READ, AFTER the existence
  # `stat` above (TE L-07) — never before.
  local p2
  if pdlc_fault_active "plugin-artifact-read" "$rowId"; then
    p2="no"
  elif [[ -r "$pluginAbs" ]]; then
    p2="yes"
  else
    p2="no"
  fi
  if [[ "$p2" == "no" ]]; then
    PDLC_ROW_STATE="unknown"
    PDLC_ROW_REASON="plugin-artifact-unreadable"
    pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
    return 0
  fi

  local pluginHash
  pluginHash="$(pdlc_sha1 "$pluginAbs")"
  PDLC_ROW_PLUGIN_HASH="$pluginHash"

  # Rung 1e/1f: P3 — consumer artifact exists.
  local p3
  p3="$(_pdlc_probe_exists "$consumerAbs")"
  if [[ "$p3" == "indeterminate" ]]; then
    PDLC_ROW_STATE="unknown"
    PDLC_ROW_REASON="consumer-artifact-unreadable"
    pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
    return 0
  fi

  if [[ "$p3" == "no" ]]; then
    # Rung 2: missing — the definite-negative rule (AC-1.1): P3's first existing ancestor was
    # traversable (or entirely absent), so this is a definite negative, not `unknown`.
    PDLC_ROW_STATE="missing"
    pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
    return 0
  fi

  # P4 — consumer artifact readable (only reached when P3 == yes). Fault token 16 gates the READ,
  # AFTER the existence `stat` above.
  local p4
  if pdlc_fault_active "consumer-artifact-read" "$rowId"; then
    p4="no"
  elif [[ -r "$consumerAbs" ]]; then
    p4="yes"
  else
    p4="no"
  fi
  if [[ "$p4" == "no" ]]; then
    PDLC_ROW_STATE="unknown"
    PDLC_ROW_REASON="consumer-artifact-unreadable"
    pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
    return 0
  fi

  local consumerHash
  consumerHash="$(pdlc_sha1 "$consumerAbs")"
  PDLC_ROW_CONSUMER_HASH="$consumerHash"

  # Rung 3: in-sync — equal bytes, regardless of provenance (R-4/O-8). Evaluated BEFORE P6, so a
  # degraded sync manifest can never turn a byte-identical row into `unverified`. No mtime anywhere
  # (R-2) — this is a pure byte comparison via sha1.
  if [[ "$consumerHash" == "$pluginHash" ]]; then
    PDLC_ROW_STATE="in-sync"
    pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
    return 0
  fi

  # P6: sync-manifest entry lookup — only reached once bytes are already known to differ (R-1/R-3).
  _pdlc_sync_manifest_ensure_loaded "$phase"
  if ! _pdlc_sync_manifest_lookup "$rowId"; then
    # Rung 4: unverified — no entry, never `stale`, never `local-edit` (R-3).
    PDLC_ROW_STATE="unverified"
    pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
    return 0
  fi

  PDLC_ROW_CONSUMER_ARTIFACT_VERSION="$_PDLC_SYNC_ENTRY_VERSION"

  # Rung 5/6: stale vs local-edit, discriminated solely by the recorded consumerHash (R-1) —
  # `pluginHash` never enters this decision.
  if [[ "$consumerHash" == "$_PDLC_SYNC_ENTRY_HASH" ]]; then
    PDLC_ROW_STATE="stale"
  else
    PDLC_ROW_STATE="local-edit"
  fi
  pdlc_trace "$phase" "classify" "$rowId" "$PDLC_ROW_STATE"
  return 0
}

# pdlc_classify_all <phase> — classifies every managed row, indexed by position over `PDLC_ROWS_*`
# (AC-0.1: never a directory glob). Rows are independent (§3.1) — the loop has no early exit and no
# row's outcome feeds another's. Always returns 0.
pdlc_classify_all() {
  local phase="$1"
  PDLC_STATE=()
  PDLC_REASON=()
  PDLC_PLUGIN_HASH=()
  PDLC_CONSUMER_HASH=()
  PDLC_PLUGIN_ARTIFACT_VERSION=()
  PDLC_CONSUMER_ARTIFACT_VERSION=()

  local n=${#PDLC_ROWS_ID[@]}
  local i
  for ((i = 0; i < n; i++)); do
    pdlc_classify_row "$i" "$phase"
    PDLC_STATE+=("$PDLC_ROW_STATE")
    PDLC_REASON+=("$PDLC_ROW_REASON")
    PDLC_PLUGIN_HASH+=("$PDLC_ROW_PLUGIN_HASH")
    PDLC_CONSUMER_HASH+=("$PDLC_ROW_CONSUMER_HASH")
    PDLC_PLUGIN_ARTIFACT_VERSION+=("$PDLC_ROW_PLUGIN_ARTIFACT_VERSION")
    PDLC_CONSUMER_ARTIFACT_VERSION+=("$PDLC_ROW_CONSUMER_ARTIFACT_VERSION")
  done
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────────────────────
# Layer 4 (T-34 — writers/ladder/backups) appends below this line: `pdlc_write_drift_state`,
# `pdlc_emit_printf_record`, `pdlc_backup`.
# ─────────────────────────────────────────────────────────────────────────────────────────────

# ───────────────────────────────── internal helpers (layer 4) ────────────────────────────────

declare -a PDLC_WRITE_FAILURES=()
PDLC_BACKUP_PATH=""
PDLC_COPY_HASH=""

# Ensures PDLC_PY_BIN is resolved (reuses layer 1's probe rather than duplicating discovery).
_pdlc_ensure_py() {
  [[ -n "${PDLC_PY_BIN:-}" ]] && return 0
  pdlc_probe_json_tool
}

# _pdlc_atomic_write <dir> <target> <content> — sibling temp file in `dir`, then `mv` over
# `target` (same filesystem, atomic rename, §4.3). Traces the write attempt regardless of
# outcome (op `write`, rowId `-`). Only PATH tools available to this whole layer (`mv`, `rm`) are
# used here — no `mkdir`, no `cp`, no `cat` (probe-sandbox constraint, cf58ac7's precedent).
_pdlc_atomic_write() {
  local dir="$1" target="$2" content="$3"

  [[ -d "$dir" ]] || return 1

  local tmp="${dir}/.pdlc-tmp.$$.${RANDOM}"
  if ! printf '%s' "$content" >"$tmp" 2>/dev/null; then
    rm -f -- "$tmp" 2>/dev/null
    return 1
  fi

  if ! mv -f -- "$tmp" "$target" 2>/dev/null; then
    rm -f -- "$tmp" 2>/dev/null
    return 1
  fi

  pdlc_trace "run" "write" "-" "$target"
  return 0
}

# Closed nine-member `operation` domain (FSPEC §4.5): four are stderr-only and are filtered out
# of any emitted record by `pdlc_emit_printf_record`; the remaining five are recordable.
_pdlc_write_failure_op_is_stderr_only() {
  case "$1" in
    mkdir | drift-state-replace | drift-state-invalidate | drift-state-unlink)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# FSPEC §4.4's decidable path-escaping predicate, evaluated byte-wise under LC_ALL=C: every byte
# in 0x20-0x7E is emitted with only `\` and `"` escaped; a single byte outside that range takes
# the whole-path `<unprintable>` branch (no partial escaping, no UTF-8 validator).
_pdlc_emit_escape_path() {
  local input="$1"
  local i c ord len=${#input}

  for ((i = 0; i < len; i++)); do
    c="${input:i:1}"
    ord=$(printf '%d' "'$c")
    if ((ord < 32 || ord > 126)); then
      printf '<unprintable>'
      return 0
    fi
  done

  local out=""
  for ((i = 0; i < len; i++)); do
    c="${input:i:1}"
    case "$c" in
      '\') out+='\\' ;;
      '"') out+='\"' ;;
      *) out+="$c" ;;
    esac
  done
  printf '%s' "$out"
}

# pdlc_emit_printf_record <generatedBy> <checkEnabled> <baselineReason> — the §4.4a serialiser
# of last resort: `printf` only, no interpreter (NFR-5). Every interpolated field is
# closed-domain (§4.4's table) except `writeFailures[].path`, which is escaped by
# `_pdlc_emit_escape_path` above. `pluginVersion` and `syncCommand` are unconditionally `null`
# under both of this emitter's triggers (T1: json-tool-absent: T2: rung (i) invalidation).
# `writeFailures` is filtered of the four stderr-only operations before interpolation (this
# filter belongs to the emitter, not the caller, so both triggers get it).
pdlc_emit_printf_record() {
  local generatedBy="$1" checkEnabled="$2" baselineReason="$3"
  local generatedAtUtc
  generatedAtUtc="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  local failuresJson="" first=1 entry path operation escaped
  for entry in "${PDLC_WRITE_FAILURES[@]:-}"; do
    [[ -z "$entry" ]] && continue
    path="${entry%%$'\x1f'*}"
    operation="${entry#*$'\x1f'}"
    _pdlc_write_failure_op_is_stderr_only "$operation" && continue

    escaped="$(_pdlc_emit_escape_path "$path")"
    if ((first == 1)); then
      first=0
    else
      failuresJson+=","
    fi
    failuresJson+="{\"path\":\"${escaped}\",\"operation\":\"${operation}\"}"
  done

  printf '{"schemaVersion":1,"generatedAtUtc":"%s","generatedBy":"%s","pluginVersion":null,"checkEnabled":%s,"syncCommand":null,"baselineStatus":"unresolved","baselineReason":"%s","retiredPresent":[],"writeFailures":[%s],"rows":[]}' \
    "$generatedAtUtc" "$generatedBy" "$checkEnabled" "$baselineReason" "$failuresJson"
}

# pdlc_write_drift_state <repoRoot> <recordJson> [generatedBy] — the single drift-state writer
# (AC-2.7). Ordinary path: writes the caller-built `recordJson` atomically (§4.3). If a JSON
# tool is not available (T1, §4.4a), a resolved record cannot have been built at all, so this
# ignores `recordJson` and writes the closed-domain unresolved record itself, via the `printf`
# emitter, through the same atomic path. If the atomic write fails over a pre-existing file, the
# three-rung invalidation ladder (§4.4/§4.4a, AC-2.9(3)) runs: (i) in-place overwrite, (ii)
# unlink + fresh write, (iii) residual (stderr only, exit 4). Directory creation (`mkdir -p
# .claude/ .claude/workflows/`, §4.2 step 3) is the entrypoint's job, not this routine's — it is
# not a probe-sandbox PATH tool (cf58ac7's precedent) and this routine assumes the directory
# already exists.
pdlc_write_drift_state() {
  local repoRoot="$1" recordJson="${2:-}" generatedBy="${3:-hook}"
  local dir="${repoRoot}/.claude/workflows"
  local target="${dir}/.pdlc-drift-state.json"

  local preExisted=0
  [[ -e "$target" ]] && preExisted=1

  local jsonToolAbsent=0
  if [[ -z "${PDLC_PY_BIN:-}" ]]; then
    pdlc_probe_json_tool || jsonToolAbsent=1
  fi

  local content
  if ((jsonToolAbsent == 1)) || [[ -z "$recordJson" ]]; then
    content="$(pdlc_emit_printf_record "$generatedBy" "true" "json-tool-absent")"
  else
    content="$recordJson"
  fi

  if ! pdlc_fault_active "drift-state-replace"; then
    if _pdlc_atomic_write "$dir" "$target" "$content"; then
      return 0
    fi
  fi

  # Atomic replace failed (or was fault-injected). Entry condition for the ladder is "failed
  # over a pre-existing file" (AC-2.9(3)) — with nothing pre-existing, both rungs (i) and (ii)
  # are no-ops (nothing to overwrite, nothing to unlink) and the ladder lands directly on the
  # rung-(iii) residual.
  if ((preExisted == 0)); then
    printf 'pdlc: drift state at %s could not be written (operation: drift-state-replace). The recorded state does not describe this run.\n' "$target" >&2
    return 4
  fi

  local checkEnabledForLadder="${PDLC_RESOLVED_CHECK_ENABLED:-true}"
  local invalidation
  invalidation="$(pdlc_emit_printf_record "$generatedBy" "$checkEnabledForLadder" "drift-state-invalidated")"

  if ! pdlc_fault_active "drift-state-invalidate"; then
    if printf '%s' "$invalidation" >"$target" 2>/dev/null; then
      pdlc_trace "run" "write" "-" "$target"
      return 0
    fi
  fi

  if ! pdlc_fault_active "drift-state-unlink"; then
    if rm -f -- "$target" 2>/dev/null && printf '%s' "$invalidation" >"$target" 2>/dev/null; then
      pdlc_trace "run" "write" "-" "$target"
      return 0
    fi
  fi

  printf 'pdlc: drift state at %s could not be written (operation: drift-state-replace). The recorded state does not describe this run.\n' "$target" >&2
  return 4
}

# pdlc_write_sync_manifest <path> <content> — the sync-manifest's own temp+mv whole-file
# replace (§4.2 step 6, §5.5), including its removal-only path: the caller builds `content`
# already reflecting any entry removed for a row that failed post-copy verification, and this
# routine only writes it. `rename(2)` consults the parent directory, so the failure surface is
# `.claude/workflows/` itself (TE F-06), not the file's own mode.
pdlc_write_sync_manifest() {
  local path="$1" content="$2"
  local dir="${path%/*}"

  if pdlc_fault_active "sync-manifest-update"; then
    PDLC_WRITE_FAILURES+=("${path}"$'\x1f'"sync-manifest-update")
    pdlc_trace "run" "write" "-" "$path"
    return 1
  fi

  if ! _pdlc_atomic_write "$dir" "$path" "$content"; then
    PDLC_WRITE_FAILURES+=("${path}"$'\x1f'"sync-manifest-update")
    return 1
  fi

  return 0
}

# pdlc_copy_artifact <src> <dest> [rowId] — sibling-temp + `mv` copy (§4.3) with post-copy
# verification (§5.5 lettered sub-steps): re-read `dest`, hash it, compare to `src`'s hash. Not
# equal (or the copy/replace itself failed) ⇒ no sync-manifest entry is written for this row
# (that is the caller's job, over this routine's return value) and `writeFailures` gains
# `{ path: dest, operation: artifact-copy }`. Uses `python3` (via `PDLC_PY_BIN`) for the actual
# byte copy — `cp`/`cat`/`dd` are not probe-sandbox PATH tools.
pdlc_copy_artifact() {
  local src="$1" dest="$2" rowId="${3:-}"
  local destDir="${dest%/*}"

  if pdlc_fault_active "artifact-copy" "$rowId"; then
    PDLC_WRITE_FAILURES+=("${dest}"$'\x1f'"artifact-copy")
    return 1
  fi

  _pdlc_ensure_py || { PDLC_WRITE_FAILURES+=("${dest}"$'\x1f'"artifact-copy"); return 1; }

  [[ -d "$destDir" ]] || { PDLC_WRITE_FAILURES+=("${dest}"$'\x1f'"artifact-copy"); return 1; }

  local tmp="${destDir}/.pdlc-tmp.$$.${RANDOM}"

  if pdlc_fault_active "artifact-copy-corrupt" "$rowId"; then
    # Simulates a truncated/partial write: only the source's first byte lands, so post-copy
    # verification below (a genuine re-read, not a reuse of any in-memory hash) catches it.
    "$PDLC_PY_BIN" -c '
import sys
with open(sys.argv[1], "rb") as f:
    data = f.read()
with open(sys.argv[2], "wb") as f:
    f.write(data[:1])
' "$src" "$tmp" 2>/dev/null
  else
    "$PDLC_PY_BIN" -c 'import shutil, sys; shutil.copyfile(sys.argv[1], sys.argv[2])' "$src" "$tmp" 2>/dev/null
  fi

  if [[ ! -e "$tmp" ]]; then
    PDLC_WRITE_FAILURES+=("${dest}"$'\x1f'"artifact-copy")
    return 1
  fi

  if ! mv -f -- "$tmp" "$dest" 2>/dev/null; then
    rm -f -- "$tmp" 2>/dev/null
    PDLC_WRITE_FAILURES+=("${dest}"$'\x1f'"artifact-copy")
    return 1
  fi

  pdlc_trace "run" "copy" "$rowId" "$dest"

  local srcHash destHash
  srcHash="$(pdlc_sha1 "$src")" || srcHash=""
  destHash="$(pdlc_sha1 "$dest")" || destHash=""

  if [[ -z "$srcHash" || -z "$destHash" || "$srcHash" != "$destHash" ]]; then
    PDLC_WRITE_FAILURES+=("${dest}"$'\x1f'"artifact-copy")
    return 1
  fi

  PDLC_COPY_HASH="$destHash"
  return 0
}

# pdlc_backup <srcPath> <id> — the backup half of "no destroy before verified backup" (AC-2.9(4),
# §4.7): copy `srcPath` into `.pdlc-backups/{id}.{stamp}-{NN}.bak` (grammar: `pdlc_backup_format`,
# layer 1), RE-READ the backup from disk and hash it, and compare to a hash of the source bytes.
# Not equal (or any step failed) ⇒ original `srcPath` is left untouched, `writeFailures` gains
# `{ path: srcPath, operation: backup|backup-verify }`, and this returns 1. `PDLC_BACKUP_PATH` is
# set only on a verified success (TSPEC §2.2's documented side effect). `NN` exhaustion (99
# backups of one id inside one second) is itself a `backup` write failure (§1.4), never a reuse.
pdlc_backup() {
  local srcPath="$1" id="$2"
  local parentDir="${srcPath%/*}"
  local backupDir="${parentDir}/.pdlc-backups"

  PDLC_BACKUP_PATH=""

  if pdlc_fault_active "backup" "$id"; then
    PDLC_WRITE_FAILURES+=("${srcPath}"$'\x1f'"backup")
    return 1
  fi

  _pdlc_ensure_py || { PDLC_WRITE_FAILURES+=("${srcPath}"$'\x1f'"backup"); return 1; }

  if [[ ! -d "$backupDir" ]]; then
    "$PDLC_PY_BIN" -c 'import os, sys; os.makedirs(sys.argv[1], exist_ok=True)' "$backupDir" 2>/dev/null
  fi
  if [[ ! -d "$backupDir" ]]; then
    PDLC_WRITE_FAILURES+=("${srcPath}"$'\x1f'"backup")
    return 1
  fi

  local stamp candidate n found=0
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  for ((n = 1; n <= 99; n++)); do
    candidate="$(pdlc_backup_format "$id" "$stamp" "$n")" || continue
    if [[ ! -e "${backupDir}/${candidate}" ]]; then
      found=1
      break
    fi
  done

  if ((found == 0)); then
    PDLC_WRITE_FAILURES+=("${srcPath}"$'\x1f'"backup")
    return 1
  fi

  local backupPath="${backupDir}/${candidate}"

  if pdlc_fault_active "backup-corrupt" "$id"; then
    # Simulates a backup write that appears to succeed but does not land correctly: the file
    # exists but its bytes differ from the source, so the re-read-and-hash step below (not a
    # reuse of any in-memory hash) is what catches it.
    printf 'PDLC_FAULT-CORRUPT' >"$backupPath" 2>/dev/null
  else
    "$PDLC_PY_BIN" -c 'import shutil, sys; shutil.copyfile(sys.argv[1], sys.argv[2])' "$srcPath" "$backupPath" 2>/dev/null
  fi

  pdlc_trace "run" "backup" "$id" "$backupPath"

  if [[ ! -e "$backupPath" ]]; then
    PDLC_WRITE_FAILURES+=("${srcPath}"$'\x1f'"backup")
    return 1
  fi

  local srcHash backupHash
  srcHash="$(pdlc_sha1 "$srcPath")" || srcHash=""
  backupHash="$(pdlc_sha1 "$backupPath")" || backupHash=""

  if [[ -z "$srcHash" || -z "$backupHash" || "$srcHash" != "$backupHash" ]]; then
    PDLC_WRITE_FAILURES+=("${srcPath}"$'\x1f'"backup-verify")
    rm -f -- "$backupPath" 2>/dev/null
    return 1
  fi

  PDLC_BACKUP_PATH="$backupPath"
  return 0
}

# pdlc_retire <target> <retiredBasename> — the retirement half of §5.7: a verified backup
# (`pdlc_backup`, id = `retiredBasename`) then delete, never the reverse. A failed backup leaves
# `target` untouched and this returns 1 with `pdlc_backup`'s own `writeFailures` entry already
# recorded — retirement adds no second entry for that case. A failed delete (after a verified
# backup landed) is its own `{ path: target, operation: retire-delete }` entry.
pdlc_retire() {
  local target="$1" retiredBasename="$2"

  pdlc_backup "$target" "$retiredBasename" || return 1

  if pdlc_fault_active "retire-delete" "$retiredBasename"; then
    PDLC_WRITE_FAILURES+=("${target}"$'\x1f'"retire-delete")
    return 1
  fi

  if ! rm -f -- "$target" 2>/dev/null; then
    PDLC_WRITE_FAILURES+=("${target}"$'\x1f'"retire-delete")
    return 1
  fi

  pdlc_trace "run" "delete" "$retiredBasename" "$target"
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────────────────────
# Layer 5 (T-35 — messages) appends below this line: `pdlc_msg_*`.
# ─────────────────────────────────────────────────────────────────────────────────────────────

# pdlc_sync_command — the `<pluginRoot>`-expanded `sync-workflows.sh` invocation (FSPEC §1.3,
# AC-0.4, AC-4.2). Reads the already-resolved `PDLC_PLUGIN_ROOT` (this function never resolves
# it itself — that is `pdlc_resolve_plugin_root`'s job, already run by the time any `pdlc_msg_*`
# needs a `{cmd}`) and names the real shipped script path, never a placeholder. stdout is the
# expanded path (no `$`, no `{` — a literal concatenation of an already-resolved value, never a
# re-quoted variable reference) with exit 0 when `PDLC_PLUGIN_ROOT` is non-empty; empty stdout
# and exit 1 otherwise (FSPEC §1.3's `syncCommand: null` fallback — this is the same fallback
# condition, read by both W-3/W-4/W-5's own `{cmd}` substitution and the drift-state writer, so
# a divergence between the two would be the exact AC-0.4/AC-4.2 regression this function exists
# to prevent).
pdlc_sync_command() {
  local root="${PDLC_PLUGIN_ROOT:-}"
  [[ -z "$root" ]] && return 1
  printf '%s/hooks/scripts/sync-workflows.sh' "$root"
  return 0
}

# pdlc_msg_w1 <reason> — FSPEC §8.2 W-1 (unresolved baseline). `reason` is one of the seven
# §2.1-produced baseline reasons (`drift-state-invalidated` is never rendered here — FSPEC
# §8.2's S3 note: its only rendering site is the queue's own §6.3 Manifest-level line, which is
# JS, not C1). Per-reason remediation follows TSPEC §7.4's AC-2.5a class table: the three
# manifest-* reasons are `pluginUpdate` and never name a sync command (FSPEC §8.1); the
# remaining four are `environment`, each naming a distinct positive fix in prose.
pdlc_msg_w1() {
  local reason="$1" remediation
  case "$reason" in
    manifest-absent)
      remediation="The plugin's distribution manifest is missing — update the plugin to restore it."
      ;;
    manifest-malformed)
      remediation="The plugin's distribution manifest is malformed — update the plugin to restore a valid copy."
      ;;
    manifest-empty)
      remediation="The plugin's distribution manifest lists no files — update the plugin to restore its rows."
      ;;
    plugin-root-unset)
      remediation="Set CLAUDE_PLUGIN_ROOT to the installed plugin's directory."
      ;;
    plugin-root-unreadable)
      remediation="Check that the installed plugin's directory is readable."
      ;;
    repo-root-unresolved)
      remediation="Create .claude/ at the intended root, or run inside a git work tree."
      ;;
    json-tool-absent)
      remediation="Install a Python interpreter (python3) on PATH."
      ;;
    *)
      remediation="Check the plugin installation and try again."
      ;;
  esac
  printf 'pdlc: workflow drift check could not run — %s. %s' "$reason" "$remediation"
}

# pdlc_msg_w2 <id> <reason> — FSPEC §8.2 W-2 (row `unknown`). `reason` is one of the four row
# reasons (FSPEC §3.3); remediation classes per TSPEC §7.4's AC-2.5 table:
# `hash-tool-absent` -> environment, `plugin-artifact-missing` -> pluginUpdate, the two
# `*-unreadable` reasons -> permissions (names "permission"/"readable", never a sync command or
# "update the plugin" — AC-2.5's explicit pairing).
pdlc_msg_w2() {
  local id="$1" reason="$2" remediation
  case "$reason" in
    hash-tool-absent)
      remediation="Install a hash utility (shasum or sha1sum) on PATH."
      ;;
    plugin-artifact-missing)
      remediation="The plugin is missing this file — update the plugin to restore it."
      ;;
    plugin-artifact-unreadable)
      remediation="Check the plugin artifact's file permissions; it exists but is not readable."
      ;;
    consumer-artifact-unreadable)
      remediation="Check this file's permissions; it exists but is not readable."
      ;;
    *)
      remediation="Check the file's permissions and try again."
      ;;
  esac
  printf 'pdlc: %s could not be verified — %s. %s' "$id" "$reason" "$remediation"
}

# pdlc_msg_w3 <id> — FSPEC §8.2 W-3 (row `unverified`). `{cmd}` is `pdlc_sync_command`'s value
# with `--force` appended (empty when `pdlc_sync_command` itself resolves to nothing, so an
# unresolved plugin root never renders a bare "--force").
pdlc_msg_w3() {
  local id="$1" cmd
  cmd="$(pdlc_sync_command)"
  [[ -n "$cmd" ]] && cmd="${cmd} --force"
  printf "pdlc: %s differs from the plugin's copy and has no sync provenance — direction unknown. Diff it, then sync (--force required): %s" \
    "$id" "$cmd"
}

# pdlc_msg_w4 <id> <backupDir> — FSPEC §8.2 W-4 (row `local-edit`). Same `--force`-appended
# `{cmd}` convention as W-3.
pdlc_msg_w4() {
  local id="$1" backupDir="$2" cmd
  cmd="$(pdlc_sync_command)"
  [[ -n "$cmd" ]] && cmd="${cmd} --force"
  printf 'pdlc: %s was edited locally after its last sync. Plain sync will NOT overwrite it; --force will, after backing it up to %s: %s' \
    "$id" "$backupDir" "$cmd"
}

# pdlc_msg_w5 <id> <state> — FSPEC §8.2 W-5 (row `stale`/`missing`). `{cmd}` is
# `pdlc_sync_command`'s value VERBATIM, no `--force` — byte-equal to the drift-state writer's own
# `syncCommand` field on the same tree (TSPEC §7.4's companion assertion).
pdlc_msg_w5() {
  local id="$1" state="$2" cmd
  cmd="$(pdlc_sync_command)"
  printf 'pdlc: %s is %s. Run: %s' "$id" "$state" "$cmd"
}

# pdlc_msg_w6 <path> <id> <state> — FSPEC §8.2 W-6 (retired-present). `state` is one of R's six
# classifier states (FSPEC §3.3); remediation class per TSPEC §7.4's AC-2.8 table:
# `in-sync`/`stale`/`missing` -> sync (bare `{cmd}`, no `--force`); `local-edit`/`unverified` ->
# forceSync, naming the backup directory and BOTH filename patterns (this row's bundle id and
# the retired basename, each labelled) with no concrete filename (the timestamp does not exist
# yet, so a literal `<timestamp>-NN.bak` placeholder is used rather than a real stamp);
# `unknown` -> pluginUpdate, which never names a sync command (AC-2.8: "sync is not named").
pdlc_msg_w6() {
  local path="$1" id="$2" state="$3"
  local base cmd remediation
  base="${path##*/}"
  cmd="$(pdlc_sync_command)"
  case "$state" in
    in-sync | stale | missing)
      remediation="Sync will bring this in line: ${cmd}"
      ;;
    local-edit | unverified)
      local forceCmd="$cmd"
      [[ -n "$forceCmd" ]] && forceCmd="${forceCmd} --force"
      remediation="Back up first, then --force: ${id} backs up as ${id}.<timestamp>-NN.bak and ${base} backs up as ${base}.<timestamp>-NN.bak, both under .pdlc-backups. Then: ${forceCmd}"
      ;;
    unknown)
      remediation="Could not verify this row — update the plugin to get a known-good copy before deciding what to do with the retired file."
      ;;
    *)
      remediation="Check the plugin installation and try again."
      ;;
  esac
  printf 'pdlc: retired-present — %s is superseded by %s (%s). %s' "$path" "$id" "$state" "$remediation"
}

# pdlc_msg_w7 <path> <operation> — FSPEC §8.2 W-7 (write failure). `operation` is one of the
# five recordable members of the closed nine-member `operation` domain (FSPEC §4.5, TSPEC §6.1).
pdlc_msg_w7() {
  local path="$1" operation="$2"
  printf 'pdlc: could not write %s (%s)' "$path" "$operation"
}
