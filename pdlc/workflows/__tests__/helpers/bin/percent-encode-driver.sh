#!/usr/bin/env bash
# percent-encode-driver.sh — TSPEC §11.2's batched-driver pattern (`backup-grammar.sh`,
# `lib-probe.sh` precedent) applied to C1's `pdlc_percent_encode` (PROPERTIES PROP-SEAM-07,
# PLAN T-43). One spawn per property run, never one per generated case.
#
# stdin  : one case per line — <hexPayload>
#          `<hexPayload>` is the case's raw byte string, hex-encoded two lowercase-or-uppercase
#          hex chars per byte (may be empty, naming the zero-length string). Hex transport lets
#          any byte 0x01-0xFF ride one text line safely, including bytes that would otherwise be
#          a raw tab/newline/CR and break the line-based stdin grammar. 0x00 is out of scope —
#          a real bash argv string is a NUL-terminated C string at the execve() layer, so a
#          literal NUL byte cannot be represented in `$1` at all; the JS-side generator
#          (`driftOrdering.test.js`) never emits it.
#
# stdout : one result per line, in input order —
#            ok  TAB <hexEncodedOutput>   `pdlc_percent_encode` ran; `<hexEncodedOutput>` is its
#                                         return value, hex-encoded the same way — the driver
#                                         never has to reason about whether a (possibly mutated,
#                                         possibly non-conforming) encoder's output is itself
#                                         safe to carry as a raw text line.
#            err TAB unknown-function    C1 was not sourced (or `pdlc_percent_encode` was
#                                         renamed) — every case still gets exactly one result
#                                         line either way (TSPEC §11.2's line-count invariant).
#
# Never invoked as a bare path — always `bash <this path>`, matching every sibling driver here.

export LC_ALL=C
export LANG=C

SCRIPT_DIR="$(cd "${BASH_SOURCE[0]%/*}" && pwd)"
C1_PATH="${SCRIPT_DIR}/../../../../hooks/scripts/lib/pdlc-drift.sh"

# shellcheck disable=SC1090
source "$C1_PATH" 2>/dev/null || true

# Deliberately no `set -u` (bash 3.2 — macOS's shipped /bin/bash — raises "unbound variable" on
# an empty-array expansion; a zero-length payload hits that case here).

# Decodes hex string "$1" (two chars per byte) into raw bytes assigned to the global `DECODED`.
# Builds a `\xHH\xHH…` escape string from literal hex digits (never from raw payload bytes) and
# lets `printf '%b'` do the byte assembly — this is how an arbitrary non-NUL byte value gets
# constructed without shelling out per byte.
hex_decode() {
  local hex="$1"
  local escapes="" i pair
  local len=${#hex}
  for ((i = 0; i < len; i += 2)); do
    pair="${hex:i:2}"
    escapes+="\\x${pair}"
  done
  if [[ -z "$escapes" ]]; then
    DECODED=""
  else
    printf -v DECODED '%b' "$escapes"
  fi
}

# Hex-encodes "$1" byte-for-byte (LC_ALL=C makes this loop byte-wise regardless of locale) —
# the same technique C1's own `pdlc_percent_encode` and `lib-probe.sh`'s `percent_encode` use
# for the ordinal lookup, retargeted at plain hex instead of %XX escaping.
hex_encode() {
  local input="$1"
  local out="" i c ord hex
  local len=${#input}
  for ((i = 0; i < len; i++)); do
    c="${input:i:1}"
    ord=$(printf '%d' "'$c")
    if ((ord < 0)); then ord=$((ord + 256)); fi
    hex=$(printf '%02x' "$ord")
    out+="$hex"
  done
  printf '%s' "$out"
}

while IFS= read -r hexPayload || [[ -n "${hexPayload:-}" ]]; do
  if ! declare -F pdlc_percent_encode >/dev/null 2>&1; then
    printf 'err\tunknown-function\n'
    continue
  fi
  DECODED=""
  if [[ -n "$hexPayload" ]]; then
    hex_decode "$hexPayload"
  fi
  # Sentinel trick: append a fixed byte ('X', 0x58 — inside 0x20-0x7E, so a correct encoder
  # always passes it through unescaped) before command substitution, then strip exactly one
  # trailing sentinel via `${var%X}` (shortest-suffix match) afterward. Command substitution
  # strips ALL trailing newline bytes from captured output; without the sentinel, a captured
  # value ending in an unescaped-by-mutation trailing newline byte would be silently truncated,
  # masking exactly the kind of red this driver exists to surface.
  encodedWithSentinel="$(pdlc_percent_encode "$DECODED"; printf 'X')"
  encoded="${encodedWithSentinel%X}"
  outHex="$(hex_encode "$encoded")"
  printf 'ok\t%s\n' "$outHex"
done
