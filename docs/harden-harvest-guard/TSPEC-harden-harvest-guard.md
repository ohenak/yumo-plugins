---
Status: Draft
Author: se-author
Version: 1.1
Feature: harden-harvest-guard
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | [CROSS-REVIEW-product-manager-TSPEC.md](CROSS-REVIEW-product-manager-TSPEC.md), [CROSS-REVIEW-test-engineer-TSPEC.md](CROSS-REVIEW-test-engineer-TSPEC.md) |
| LEARNINGS | docs/harden-harvest-guard/LEARNINGS-harden-harvest-guard.md |

# TSPEC — harden-harvest-guard

Technical specification for the fail-closed rewrite of `pdlc/hooks/scripts/guard-harvest-before-delete.sh` and the anchored `Scope:` detection in `pdlc/hooks/scripts/check-scope-field.sh`, plus the matrix-driven test suite binding every row M01–M90 / S01–S07 of the REQ v1.7 Canonical Block/Allow Matrix.

Sources: [REQ-harden-harvest-guard.md](REQ-harden-harvest-guard.md) **v1.7** and [FSPEC-harden-harvest-guard.md](FSPEC-harden-harvest-guard.md) **v1.4**. The v1.0 TSPEC-owned test rows **T-01–T-03** were promoted into the Canonical Matrix as **M87–M89** (REQ v1.7, per the TE F-09 process rule); the step-2b hoist is now the REQ-owned `mv` static-destination destruction carve-out (FSPEC v1.4 step 2b); the `N>` redirection classification was sanctioned upstream as **M90**; the command-substitution and degraded-`\/` acceptances are registered as **RR-6/RR-7** (RR-5 extended to same-call `pushd`/`popd`). There is no TSPEC-owned row namespace in this revision — the durable oracle is the single REQ matrix.

Behavior is owned by REQ/FSPEC. This document owns: script structure, module/function decomposition, algorithms, git command idioms, exact block-message prose, the scope-check greps, and the test architecture.

---

## 1. Existing-Code Claims (verified single pass)

Every claim this TSPEC makes about existing code, with source citations:

| # | Claim | Citation |
|---|---|---|
| C1 | Current guard fails open when no interpreter resolves | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:21` — `[ -z "$PY_BIN" ] && exit 0` |
| C2 | Current guard exits 0 on unparseable stdin | `guard-harvest-before-delete.sh:30` — `sys.exit(0)  # unparseable -> don't interfere` |
| C3 | Current guard coerces absent/`null` `tool_input.command` to `""` and allows | `guard-harvest-before-delete.sh:32` — `cmd = (data.get("tool_input", {}) or {}).get("command", "") or ""` (superseded by M78/M81) |
| C4 | Current guard reads stdin via external `cat` | `guard-harvest-before-delete.sh:9` — `input="$(cat)"` (must become a bash builtin read; § 3.1) |
| C5 | Current guard passes raw stdin to Python as `argv[1]` with the script as a quoted heredoc | `guard-harvest-before-delete.sh:23` — `"$PY_BIN" - "$input" <<'PY'` (pattern retained; § 3.3) |
| C6 | Interpreter probe executes each candidate (`python3`, `python`, `py`) to skip the Windows Store stub | `guard-harvest-before-delete.sh:14–20` (pattern retained verbatim) |
| C7 | Current scope check matches `scope` case-insensitively as a bare substring, plus `cross-feature` | `check-scope-field.sh:41` — `grep -qiE 'scope|cross-feature'` (replaced by P1–P3; § 5) |
| C8 | Scope check filters on the patterns `*CROSS-REVIEW-*.md` / `*CODE_REVIEW-*.md` applied to the **full path** (`case "$fp" in`) and no-ops otherwise — a path-substring match, not the basename filter FSPEC-GUARD-05 step 1 specifies (e.g. `docs/CROSS-REVIEW-archive/notes.md` passes it) | `check-scope-field.sh:32–36` (tightened to basename in § 5 — TE TSPEC F-08) |
| C9 | Scope check emits advisory `hookSpecificOutput` JSON on stdout and always exits 0 | `check-scope-field.sh:50–51` (retained) |
| C10 | Jest harness runs hook scripts via `spawnSync("bash", [scriptPath], { input, env: {...process.env, ...opts.env}, cwd })` and returns `{exitCode, stdout, stderr}` | `pdlc/workflows/__tests__/hookCompatibility.test.js:47–59` (`runHookScript`) |
| C11 | `env` merge supports **unsetting** a variable: an `undefined`-valued entry is dropped by Node's `spawnSync` (child sees it unset) — needed for M85/M86 | verified empirically in SE FSPEC-v4 review (`CROSS-REVIEW-software-engineer-FSPEC-v4.md`, claim-verification table) against `hookCompatibility.test.js:51` |
| C12 | PROP-COMPAT-05 block asserts behavior this feature inverts (non-repo tmpdir + disk-only LEARNINGS ⇒ allow) | `hookCompatibility.test.js:156–244` (migrated; § 6.5) |
| C13 | PROP-COMPAT-04 block (scope check) uses fixtures already conformant with P1/P3 | `hookCompatibility.test.js:62–153` (retained with S-row extension) |
| C14 | Jest ignores `__tests__/helpers/` and `__tests__/fixtures/` as test files — safe home for the fixture library | `pdlc/workflows/package.json` — `testPathIgnorePatterns` |
| C15 | Tests run via `npm test` in `pdlc/workflows/` (jest 29, ESM via `--experimental-vm-modules`) | `pdlc/workflows/package.json` — `scripts.test` |
| C16 | Hooks are wired by absolute plugin path; script filenames must not change. hooks.json passes **no arguments** to either script — an argv-gated test mode is unreachable from production wiring | `pdlc/hooks/hooks.json` — `"${CLAUDE_PLUGIN_ROOT}"/hooks/scripts/guard-harvest-before-delete.sh`, `.../check-scope-field.sh` |

Environment-behavior claims (verified empirically, not code citations):

| # | Claim | Basis |
|---|---|---|
| C17 | With a restricted child `PATH`, Node `spawnSync("bash", …, {env})` resolves the executable via the **child** env's `PATH` and fails `ENOENT` (`status: null`) — bash must be spawned by absolute path for the degraded rows | TE TSPEC F-02 empirical verification in this repo (libuv `execvp` against `options.env`) |
| C18 | git 2.50.1: overwriting `.git/refs/remotes/origin/{branch}` with garbage makes `git show-ref --verify --quiet refs/remotes/origin/{branch}` exit **1 with empty stdout/stderr** — the § 3.6 *clean absence* class, not a query failure. Corrupting the **loose object** backing `origin/{branch}` instead leaves `show-ref` exiting 0 and makes `git ls-tree --name-only origin/{branch} -- <path>` exit **128** with `error: inflate: …` / `fatal: loose object <sha> … is corrupt` diagnostics on stderr — a true § 3.6 query failure; `symbolic-ref` and `rev-parse --is-inside-work-tree` are unaffected | TE TSPEC F-06 + se-author re-verification 2026-07-02 (git 2.50.1, hermetic fixture) |

There are no `docs/_decisions/` or `docs/_constraints/` directories in this repo (checked 2026-07-02) — no promoted project-level decisions constrain this design. This revision creates the feature-level [DECISIONS-harden-harvest-guard.md](DECISIONS-harden-harvest-guard.md) (DEC-01: single-file deployable + `--self-test` mode, § 6.6).

---

## 2. Architecture Overview

```
hook stdin (JSON) ──▶ guard-harvest-before-delete.sh          (bash wrapper)
                        │ 1. read stdin (bash builtins only)
                        │ 2. interpreter probe (C6 pattern)
                        ├── no interpreter ──▶ degraded coarse matcher (pure bash)
                        │                       └─▶ exit 2 [DEGRADED] | exit 0
                        └── interpreter ──▶ embedded Python 3 (quoted heredoc, raw stdin as argv[1])
                              │ intake (PARSE_ERROR gate)
                              │ parse: heredoc strip → segmentation → tokenize → verbs (+opaque recursion)
                              │ D1 (no deletion verb → exit 0)
                              │ G-DP1 eager repo check on candidate root (A) → [NO_REPO]
                              │ guarded-dir enumeration (anchor: CLAUDE_PROJECT_DIR else rev-parse of root (A))
                              │ per-feature git verification G2–G10 (memoized)
                              │ D2 (incl. mv flow + redirections) → D3 → D4 → fall-through allow
                              └─▶ exit 2 + stderr `pdlc-guard[<REASON>]: …` | exit 0
```

**Architecture decisions (alternatives weighed):**

- **Single-file bash wrapper + embedded Python heredoc** (the current scripts' shape, C5). Alternative — a sibling `guard_parser.py` invoked/imported by path — was rejected: it splits the deployable into two files that must travel together through the plugin cache and hooks.json wiring (C16) and enables independent drift. The parser-unit-testing obligation this forecloses (TE TSPEC F-04) is met instead by an argv-gated `--self-test` mode inside the single file (§ 6.6) — unreachable from production wiring (hooks pass no argv, C16). The trade-off is recorded as **DEC-harden-harvest-guard-01** in [DECISIONS-harden-harvest-guard.md](DECISIONS-harden-harvest-guard.md). The v1.0 over-reading of REQ-GUARD-05 ("no test imports the Python" ⇒ no unit tests at all) is withdrawn — the REQ mandates the matrix suite in the jest harness; it does not forbid supplementary lower-level tests.
- **Hand-rolled character-scanner tokenizer** in Python. Alternative — `shlex` — was rejected: `shlex` performs quote removal but discards the per-token quoting context that REQ-GUARD-01 step 5 requires (whether a `$` was single-quoted/escaped, i.e. *expansion-active*), and cannot report segment operators and redirection operators with quote awareness. The scanner produces tokens that carry both raw and post-quote-removal text (§ 3.5).
- **`git show-ref --verify --quiet` + `git ls-tree --name-only`** as the ref-existence and tree-membership idioms. Alternative — the REQ's illustrative `git cat-file -e origin/{branch}:path` — was rejected for the membership check: `cat-file -e` reports a missing *path* with a `fatal:` diagnostic on stderr (exit 128), which collides with FSPEC-GUARD-03's failure-vs-absence boundary (absence must be a *clean empty* outcome). `ls-tree` yields exit 0 + empty stdout + empty stderr for a clean miss, cleanly separating absence from failure (§ 3.6).
- **Raw stdin passed to Python as `argv[1]`** (C5, retained). Alternative — piping via Python's stdin — was rejected: the heredoc already occupies stdin for the script text itself; restructuring to `-c` loses the readable heredoc. The ARG_MAX bound (≥ 256 KiB on supported platforms) comfortably exceeds hook payload sizes; accepted.
- **Carry-forward SE F4-01 resolved by the hoist option** (static-destination destruction certainty refines the reason code before the D3 jump), not the reword-the-gloss option — adopted upstream in REQ v1.7 / FSPEC v1.4 as `mv`-flow step 2b, pinned by M87 (§ 4).

---

## 3. `guard-harvest-before-delete.sh` — Design

### 3.0 File inventory

| File | Change |
|---|---|
| `pdlc/hooks/scripts/guard-harvest-before-delete.sh` | Rewritten (same filename/entrypoint, C16). Script header documents `GUARD_FETCH_BEFORE_CHECK` / `GUARD_FETCH_TIMEOUT_SECS` (BR-03-1 owner obligation), the exit-code contract, and the `--self-test` mode (§ 6.6) |
| `pdlc/hooks/scripts/check-scope-field.sh` | Modified in place (§ 5) |
| `pdlc/workflows/__tests__/helpers/guardFixtures.js` | New — hermetic git fixture library + guard runner (§ 6.2) |
| `pdlc/workflows/__tests__/helpers/guardRowIds.js` | New — shared row-id constants (`M_ROWS`, `S_ROWS`, `M33_RERUN_IDS`) consumed by both test files and the self-audit meta-tests (§ 6.3) |
| `pdlc/workflows/__tests__/guardMatrix.test.js` | New — M01–M90, M33 G6 re-run expansion, parser self-test + property tables (§§ 6.3, 6.6) |
| `pdlc/workflows/__tests__/hookCompatibility.test.js` | Modified — PROP-COMPAT-05 block removed (migration § 6.5); S01–S07 suite added alongside the retained PROP-COMPAT-04 tests (§ 6.4) |
| `docs/harden-harvest-guard/DECISIONS-harden-harvest-guard.md` | New — DEC-01 (single-file deployable + `--self-test` vs sibling `guard_parser.py`) |

### 3.1 Bash wrapper flow

Exit-code contract (BR-01-4): **exit 2 = block** (stderr message per § 3.7), **exit 0 = allow**. No other exit codes are intentional; the wrapper propagates the Python process's exit code unchanged.

0. **`--self-test` gate (test-only argv):** if `[ "${1:-}" = "--self-test" ]`, skip the stdin read, run the interpreter probe, and invoke the Python with `argv[1] = --self-test` **and** `GUARD_SELF_TEST=1` in its env (§ 6.6); no interpreter → stderr `self-test requires python3`, exit 1. The Python enters self-test only on the **conjunction** (argv sentinel + env sentinel, both settable only by this wrapper branch): hook stdin that is literally the string `--self-test` therefore still routes to intake → `PARSE_ERROR`, and an externally exported `GUARD_SELF_TEST` cannot divert a hook invocation (its argv[1] is the raw stdin). Unreachable in production: hooks.json passes no arguments (C16), so `$1` is always empty on hook invocations and the production path is untouched.
1. **Read stdin with bash builtins only:** `IFS= read -r -d '' input || true`. The current `input="$(cat)"` (C4) is load-bearing wrong for degraded mode: under the restricted-PATH fixture `cat` does not resolve, the substitution yields `""`, and M42 would silently allow. Everything the wrapper executes before the interpreter probe must be a bash builtin so the degraded rows (M42–M43, M68–M72) run under an empty `PATH`.
2. **Interpreter probe** — retained verbatim from the current script (C6): try `python3`, `python`, `py`; a candidate is usable iff `command -v` resolves it **and** `<cand> -c "import sys"` exits 0.
3. **No usable interpreter → degraded coarse matcher** (§ 3.2) over the raw `$input`; exit 2 `[DEGRADED]` or exit 0. Never reaches git or Python. (Precedence M71/M72: this runs before any parse attempt, so co-occurring malformed stdin is governed here — a block is `DEGRADED`, never `PARSE_ERROR`.)
4. **Interpreter present →** `"$PY_BIN" - "$input" <<'PY' … PY` (C5); wrapper exits with the Python exit code.

### 3.2 Degraded coarse matcher (pure bash, REQ-GUARD-06 case 1 / FSPEC-GUARD-04)

Implemented with `[[ … ]]` pattern/regex matches only (builtins; no grep). Over the raw stdin text `$input` (full JSON blob — no field extraction):

```bash
degraded_verb_match() {           # FSPEC-GUARD-04 token table
  [[ $1 =~ (^|[^A-Za-z0-9_])(rm|unlink|mv|truncate|find)($|[^A-Za-z0-9_]) ]] && return 0   # word verbs (M42/M43)
  [[ $1 =~ (^|[^A-Za-z0-9_])git[[:space:]]+clean($|[^A-Za-z0-9_]) ]] && return 0            # two-word verb (M68); bare "clean" is NOT a token (M69)
  [[ $1 == *'>'* ]] && return 0                                                              # redirection char class (M70)
  return 1
}
degraded_content_match() {
  [[ $1 == *'docs/'* || $1 == *'CROSS-REVIEW'* || $1 == *'CODE_REVIEW'* ]]
}
```

Decision: `degraded_verb_match && degraded_content_match` → exit 2 with the `DEGRADED` message (§ 3.7); otherwise exit 0. Empty stdin matches no token → allow (M72). Field-bleed (tokens in `description` etc.) and `>>`/`2>&1` over-match are the accepted, normative over-match surface (FSPEC-GUARD-04 business rule; allow rows M43/M69/M72 pin the allow side). One documented micro-limitation: a JSON producer that escaped `/` as `\/` would defeat the `docs/` literal — the Claude Code harness does not do this; registered upstream as residual risk **RR-7** (REQ v1.7) and cross-referenced from REQ-GUARD-06's accepted-consequence list.

### 3.3 Wrapper ↔ Python interface

| Aspect | Contract |
|---|---|
| Script text | Single-quoted heredoc (`<<'PY'`) — no bash expansion inside the Python source |
| Input | Raw hook stdin as `sys.argv[1]` (C5) |
| Environment | Python reads `CLAUDE_PROJECT_DIR`, `GUARD_FETCH_BEFORE_CHECK`, `GUARD_FETCH_TIMEOUT_SECS` from `os.environ` |
| Output | Block messages on stderr only; nothing on stdout |
| Exit | 0 allow, 2 block. Internal exceptions fail closed under a **two-layer discipline** that keeps every emission inside the closed REQ-GUARD-07 catalog (REQ v1.7 disposition: the catalog is not extended): **(1) Git-query layer** — every `subprocess.run` in G-DP1 and `verify_feature` is individually wrapped; a G-DP1 exception (launch failure, `OSError`) is the existing `NO_REPO` detection-failure class (§ 3.5.4 step 2, M75), and any exception inside `verify_feature` (`OSError`, decode error, `TimeoutExpired` outside the tolerated G-DP2 fetch) is the § 3.6 **query-failure** class → BLOCK `NOT_COMMITTED` with the query-failure appendix — these never escape to the top level (`enumerate_guarded` uses `os.walk` default error suppression and cannot raise on unreadable dirs). **(2) Top-level handler** — `except Exception` around the remainder (intake, parsing engine, `decide`): anything reaching it is by construction a failure to *interpret the hook stdin* — the REQ-GUARD-06 case-2 class (the guard cannot distinguish contract-violating stdin from stdin that exercises a parser fault; both present as unparseable input) — so it emits the **exact § 3.7 `PARSE_ERROR` template** (which always carries the required "unparseable" substring) with the detail appended: `… failing closed. (internal parse failure: <ExceptionType>)`, and exits 2. `PARSE_ERROR` therefore fires only within its REQ-GUARD-07 condition and always satisfies its substring oracle. Rejected alternative — routing the catch-all to `DEGRADED`: its firing condition (no usable interpreter) and required content (missing-interpreter cause + `python3` remedy) would both be false. (No matrix row — no known trigger; M41's assertions cover the message contract.) |
| Python floor | Python ≥ 3.8, stdlib only: `sys, json, os, re, glob, fnmatch, subprocess` |

### 3.4 Intake (DG-DP2 — `PARSE_ERROR` gate)

```
raw = sys.argv[1]
json.loads(raw) failure or empty raw            → BLOCK PARSE_ERROR   (M41)
parsed but tool_input.command absent or None    → BLOCK PARSE_ERROR   (M78)
tool_input.command present and == ""            → zero segments → D1 ALLOW (M81)
```

The M78/M81 boundary is a **presence** test, not a falsiness test: `"command" in tool_input and tool_input["command"] is not None` (supersedes C3's coercion). `cwd` is read from the top-level `cwd` field when present (string, non-empty); a relative `cwd` value is resolved against `CLAUDE_PROJECT_DIR` when set, else the process cwd, before use.

### 3.5 Parsing engine — module decomposition

Data model (plain classes/dicts; names are binding for PLAN task decomposition):

```
Token   { raw: str,            # pre-quote-removal source text
          value: str,          # post-quote-removal text
          expansion_active: bool,   # unescaped, non-single-quoted $ ` $( <(   (REQ step 5)
          glob_active: bool }       # unquoted * ? [                            (D2 glob expansion)
Redir   { op: str,             # one of > 1> >| 2> N> &> >&file >> &>> <<< (classified)
          target: Token|None,  # None for fd-duplication/fd-close forms
          destructive: bool }  # truncation family only
Segment { tokens: [Token], redirs: [Redir],
          connector_in: ';'|'&&'|'||'|'|'|'&'|'\n'|None,   # operator that precedes it
          piped_from: Segment|None }                        # set when connector_in == '|'
```

Function table (all pure w.r.t. the filesystem except where noted; each names the matrix rows that pin it):

| Function | Signature → returns | Behavior | Pinning rows |
|---|---|---|---|
| `strip_heredocs` | `(text) → text` | Removes heredoc bodies before segmentation: on an unquoted `<<`/`<<-` followed by delimiter word W (quotes stripped for the comparison), drop lines after the current line up to the terminator line `W` (leading tabs allowed for `<<-`). Bodies are data by position | M29 |
| `segment` | `(text) → [Segment]` | Quote-aware split at unquoted `;`, `&&`, `||`, `|` (incl. `|&`), `&`, newline; records pipe topology (`piped_from`). `(` and `{` at segment start are transparent group openers (skipped, with matching closers ignored) so the verb stays visible — conservative, fail-closed | M17–M19, M21, M55 |
| `tokenize` | `(segment_text) → ([Token],[Redir])` | Character scanner; states: normal / single-quote / double-quote / backslash. Builds `raw`/`value` per token; flags `expansion_active` on unescaped non-single-quoted `$`, backtick, `$(`, `<(`; flags `glob_active` on unquoted `* ? [`. Extracts redirection operators (§ 3.5.1) | M44–M46, M14–M15 |
| `identify_verb` | `(Segment, assignments, depth) → VerbInfo` | § 3.5.2. Skips leading `NAME=value` (recording each `(NAME, raw_RHS)` into the compound-command-wide `assignments` map — D3 channel 2 source) and transparent prefixes; resolves `git rm`/`git clean`, `find`-deletion forms, `xargs` unwrap, opaque verbs with recursion | M04–M08, M21–M23, M60, M73 |
| `classify_operands` | `(VerbInfo) → ([static],[indeterminate])` | Non-flag argv tokens after the verb are operands; `-`-prefixed tokens are flags until a literal `--` (after which everything is an operand). Static iff `not expansion_active` | M20, M24–M25, M63 |
| `EffectiveCwd` | class; `roots() → [abspath]`, `apply_cd(token)` | § 3.5.3 — union-of-roots tracking | M17, M64–M66, M80 |
| `resolve_static` | `(token, EffectiveCwd) → [abspath]` | Absolute value → `[normpath(value)]`. Relative → one `normpath(join(root, value))` per root. `glob_active` → `glob.glob(pattern, recursive=True)` per root, union of matches **plus** the literal pattern paths themselves (a non-matching glob still names a location for the D2(ii) lexical test) | M02, M17, M44–M45, M64, M66, M80 |
| `enumerate_guarded` | `(repo_root) → {feature: [guarded_file_abspaths]}` | `os.walk` of `repo_root/docs/*/`; guarded file = basename fnmatch `CROSS-REVIEW-*.md` or `CODE_REVIEW-*.md` at any depth; feature = first path segment under `docs/` | M32, M67, M86 |
| `verify_feature` | `(repo_root, feature) → ('VERIFIED'| 'NOT_COMMITTED'|'NOT_PUSHED', extras)` | § 3.6 — G2–G10, memoized per feature (BR-03-3) | M33–M40, M57–M59, M77 |
| `decide` | `(segments, ctx) → Verdict` | § 3.5.4 — D1 → G-DP1 → D2 → D3 → D4 → allow, first match wins (BR-01-1) | all M-rows |
| `mv_flow` | `(sources, dest, ctx) → Verdict|None` | § 3.5.5 — steps 0–5 with step 2b (FSPEC v1.4; REQ v1.7 `mv`-table carve-out) | M09–M13, M52, M74, M79, M82, M84, M87–M89 |
| `emit_block` | `(reason, context) → exit 2` | § 3.7 message catalog | REQ-GUARD-07 AC |

#### 3.5.1 Redirection classification (FSPEC-GUARD-02 rules 1–4)

At tokenization, an unquoted redirection operator and its following word form a `Redir`:

| Form | Classification |
|---|---|
| `2>&1`, `>&2`, `N>&M`, `>&-`, `N>&-` | fd-duplication / fd-close — `target=None`, never destructive. **`>&` lexical rule (CF-1):** the word after `>&` is fd-form iff it consists entirely of digits or is exactly `-`; any other word (incl. digit-leading `2024-notes/CROSS-REVIEW-x.md`) is a truncating file target | M56, M62, M67 |
| `>`, `1>`, `2>`, `N>` (any fd digit-string `N` — REQ v1.7 closes the family by rule; M90 pins the `N ∉ {1, 2}` membership), `>|`, `&> word`, `>& word` (non-digit word) | destructive (truncation family) | M14, M53, M54, M61, M62, M90 |
| `>>`, `N>>`, `&>>` | append — never destructive, contributes to no decision (the `N>>` forms stay outside the closed enumeration per REQ v1.7) | M15 |
| `<`, `<<<` | input forms — the word is data, never a deletion target | — |

A segment with a destructive redirection is deletion-shaped regardless of its verb (M14 has no verb at all). Static destructive target resolving (via `resolve_static`) to a guarded file in an unverified guarded directory → D2 block with the feature's G-state code. Indeterminate destructive target → D3.

#### 3.5.2 Verb identification (REQ-GUARD-01 step 2)

Per segment, iteratively skip: leading `NAME=value` tokens (regex `^[A-Za-z_][A-Za-z0-9_]*=` on `raw`; RHS recorded into `assignments` from **every** segment — D3 says "anywhere in the same compound command"); transparent prefixes `command`, `env`, `sudo`, `nice`, `time` together with their own `-`-flags (and, for `env`, further `NAME=value` args). The next word is the verb.

| Verb resolution | Rule |
|---|---|
| `rm`, `unlink`, `truncate`, `mv` | deletion verbs directly. `rm` recursive-capable iff a flag matches `^-[A-Za-z]*[rR]` or `--recursive` (M47–M49, M63); `truncate`'s `-s` size argument is a flag argument, not an operand |
| `git` | second non-flag word `rm` → deletion (operands = pathspecs after flags/`--`); `clean` → deletion, pathspec = non-flag operands; empty pathspec → D4 candidate (M06–M08) |
| `find` | deletion form iff args contain `-delete`, or `-exec`/`-execdir` whose command word is itself a deletion verb (scan up to `;`/`+`). Operands = path roots: the args before the first token starting with `-`, `(`, or `!`; **no explicit root → root is `.`** (GNU default). Always recursive-capable (M04–M05, M50–M51) |
| `xargs` | effective verb = first non-flag arg (skipping `xargs` flags); operands = the piped input stream, always indeterminate → a wrapped deletion verb goes to D3, with the producer segment's tokens as D3 channel 3 (M21) |
| `eval` | opaque: payload = space-join of its arguments' `value`s; **static payload** (no argument `expansion_active`) → recursively parsed at `depth+1`; any indeterminate argument → payload opaque → contributes no visible verb (M23 vs M26) |
| `bash -c` / `sh -c` | opaque: payload = the argument after `-c`; static → recursive parse; indeterminate → opaque (M22, M73) |

Recursion cap: **depth 8** (M73 needs 2; nothing legitimate approaches 8). A payload at depth > 8 is treated as **opaque** — no visible deletion verb, D1-eligible — never deletion-shaped (FSPEC-GUARD-01 edge case; RR-3). Recursive verdicts merge into the parent: any BLOCK blocks.

Deletion verbs appearing inside `$( … )` operands of **non-deletion** verbs (e.g. `echo $(rm docs/f/x.md)`) are **not** re-parsed: FSPEC-GUARD-01 step 2 scopes recursive re-parsing to the three opaque-execution verbs. This accepted bypass is registered upstream as residual risk **RR-6** (REQ v1.7) with the D1-opacity rationale. When such a substitution appears in a *deletion* verb's operand it already makes that operand indeterminate → D3 (M20).

#### 3.5.3 Effective-cwd union tracking (REQ-GUARD-01 step 4)

```
root_A = stdin cwd (when present, resolved per §3.4)
         else CLAUDE_PROJECT_DIR (when set)
         else process cwd                      # neither-signal branch (M85)
root_B = process cwd                           # always
EffectiveCwd.roots = dedupe([root_A, root_B])  # initial union — applies to EVERY segment (M80)
```

- `cd <static-absolute>` → roots collapse to `[that path]` for subsequent segments.
- `cd <static-relative>` → each root becomes `normpath(join(root, arg))` (union preserved).
- `cd` with an indeterminate argument, or `cd -` → **poisoned**: subsequent relative static operands are reclassified indeterminate (→ D3), and the `cd` argument's raw text joins D3 channel 4.
- `cd` with no operand → `$HOME` when set, else poisoned.
- `pushd`/`popd` are not tracked (outside the REQ's step-4 `cd` rule; same-call stack-builtin drift is now explicitly named in **RR-5 as extended in REQ v1.7**, alongside the cross-call class).

A static operand/glob **blocks if either root's resolution** lands in/over an unverified guarded directory (conservative union — M64 blocks via root A, M66/M80 via root B, M65 allows when neither root resolves).

#### 3.5.4 Decision engine `decide()` (BR-01-1 ordering)

1. **D1:** collect deletion-shaped segments (deletion verb in executable position, incl. recursive payload results, or a destructive redirection). None → **exit 0**. (M03 is not D1 — it has a verb but unguarded static operands; M26–M31 are D1.)
2. **G-DP1 eager repo check:** `git -C <root_A> rev-parse --is-inside-work-tree` (root_A per § 3.5.3 — process cwd in the neither-signal branch). Nonexistent dir, nonzero exit, or launch failure → **BLOCK `NO_REPO`** (M37, M75, M76, M83; M85 pins the neither-signal pass-through). Runs once, before D2–D4.
3. **Enumeration + verification context:** `repo_root = CLAUDE_PROJECT_DIR` when set, else `git -C <root_A> rev-parse --show-toplevel` of the root G-DP1 just tested (one mechanism — the fallback cannot fail where G-DP1 passed; M86 pins the anchor). Then `enumerate_guarded(repo_root)`; `verify_feature` lazily/memoized per feature.
4. **D2** per deletion-shaped segment, per static operand (via `resolve_static`, both roots): block when a resolved path (or glob match, or the literal glob-pattern path) is (i) a guarded file, (ii) lexically inside an unverified guarded directory (path-prefix test against `repo_root/docs/<f>/`), (iii) an unverified guarded directory itself, or (iv) — recursive-capable forms only — a path-prefix **ancestor** of one (`docs`, repo root, `/`, `.` and `..` after normpath). `mv` segments are judged by `mv_flow` (§ 3.5.5) **instead of** the plain D2 path tests (BR-02-1). Reason code = the affected feature's `verify_feature` result; multiple affected features → features in sorted order, first unverified decides (deterministic).
5. **D3:** segment has ≥ 1 indeterminate operand or indeterminate destructive-redirection target, AND docs-reference via any channel — (1) own operands/redir-target `value`s contain `docs/`; (2) some `$NAME`/`${NAME…}` referenced by an indeterminate operand has `assignments[NAME]` raw RHS containing `docs/` (quote-independent literal test, M24/M46); (3) any token of a segment piped into this one contains `docs/` (M21); (4) the poisoning/`cd`-context argument contains `docs/` — AND ≥ 1 unverified guarded directory exists → **BLOCK `INDETERMINATE`** (M20–M21, M24, M46, M76-excluded, M82). Channels are segment-scoped: sibling-segment `docs/` without dataflow never qualifies (M55–M56).
6. **D4:** `git clean` with empty pathspec → **BLOCK `INDETERMINATE`** iff any unverified guarded directory exists (M08).
7. **Fall-through → exit 0** (M03, M25, M32, and the RR remainder).

#### 3.5.5 `mv` flow (FSPEC v1.4 GUARD-02 steps 0–5, incl. step 2b)

- **Step 0** — operand shape: last operand = destination; each source evaluated independently; any BLOCK blocks (M79).
- **Step 1** — canonicalize static operands against every effective root (normpath: `.`, `..`, trailing slashes).
- **Step 2** — static-source D2 test: source is an unverified guarded directory or (dir source ⇒ recursive-capable, D2 iv) an ancestor of one → BLOCK, feature's G-state code (M13, M74 — fires before any indeterminacy jump).
- **Step 2b (REQ v1.7 `mv`-table carve-out / FSPEC v1.4 step 2b):** destination is **static**, its canonicalized path is **not an existing directory and does not end in `/`**, and it names an **existing** guarded file in an unverified guarded directory → BLOCK, feature's G-state code — **source guardedness and source determinacy irrelevant**. This consumes static destination-destruction certainty before the step-3 jump, mirroring M74's source-side principle (M87 — a step-3-first implementation emits `INDETERMINATE` and fails it). M82 unaffected (its destination is indeterminate — step 2b requires a static destination); M84/M88 block here (same code as their step-4 routing).
- **Step 3** — source or destination indeterminate → D3 (M82). Steps 2/2b have consumed all static certainty, so every operand pair reaching this jump is genuinely unknowable — D3 never masks a G-state code (FSPEC v1.4 step-3 wording).
- **Step 4** — all static: resulting path per source = `dest/basename(source)` when dest is an existing directory or spelled with trailing `/`, else `dest`. Resulting path **or** static destination names an existing guarded file in an unverified guarded directory → BLOCK, G-state code (destination-destruction resulting-path arm — M89; the literal-destination arm is already exhausted by 2b but retained here as specified for the trailing-slash-on-a-file corner).
- **Step 5** — guarded sources: ALLOW iff resulting path stays under the same feature's `docs/{feature}/` subtree (any depth) AND resulting basename still matches `CROSS-REVIEW-*.md`/`CODE_REVIEW-*.md` (M11, M52); else BLOCK (M09, M10, M12). Unguarded static sources that survived 2b/4 fall through to ALLOW.

### 3.6 Git-state verification (`verify_feature` — FSPEC-GUARD-03, G2–G10)

All git invocations: `subprocess.run(["git", "-C", repo_root, …], capture_output=True, text=True)`, no shell. Classification helper applied to every query after G-DP1:

- **Clean absence** = the idiom's not-found result: exit 0 or 1 **with empty stdout and empty stderr** → route as "absent".
- **Query failure** = any other outcome (launch failure or Python-level exception around the `subprocess.run` — § 3.3 layer 1 — or nonzero exit with diagnostics on stderr) → **BLOCK `NOT_COMMITTED`** deterministically (M77 pins the fail-open class; a corrupt ref surfaced by git as clean absence conformantly routes G4/G5). The M77 fixture must actually produce diagnostics through this flow: the REQ row's illustrative corrupt-*ref* construction empirically classifies as clean absence under `show-ref --verify --quiet` (C18), so the working fixture corrupts the **loose object** behind `origin/{branch}` instead — the remote-tree `ls-tree` query then fails `fatal: loose object … is corrupt`, exit 128 (§ 6.2).

Flow per feature `f` (`learnings = docs/f/LEARNINGS-f.md`, exact top-level filename — G9/M36 falls out of exactness):

| Step | Idiom | Routing |
|---|---|---|
| Branch | `git symbolic-ref --quiet --short HEAD` | exit 0 → branch name; clean absence → detached (G3) |
| Remote | `git remote` | stdout lines contain `origin`? no → no-remote (G2) |
| G2/G3 fallback | `git ls-tree --name-only HEAD -- <learnings>` | non-empty → **VERIFIED** (allow; M38/M39); clean absence → **NOT_COMMITTED** (RR-4 documented weakening) |
| G-DP2 fetch | iff `GUARD_FETCH_BEFORE_CHECK` == `true` (exact lowercase string; unset/empty/anything-else = false) **and** origin + branch both exist (formability): `git fetch origin <branch>` with `subprocess.run(timeout=GUARD_FETCH_TIMEOUT_SECS)` (int-parse; unparseable/≤0 → default 10) | success → refreshed ref (M40); `TimeoutExpired` or nonzero → proceed on local state, decision identical to the `false` path (M59) |
| Ref existence | `git show-ref --verify --quiet refs/remotes/origin/<branch>` | exit 0 → ref exists; clean absence (exit 1, silent) → never-pushed: `ls-tree HEAD` present → **NOT_PUSHED** + `git push -u origin <branch>` in message (G4/M35); absent → **NOT_COMMITTED** (G5/M57) |
| Remote tree | `git ls-tree --name-only origin/<branch> -- <learnings>` | non-empty → **VERIFIED** (G6/M33); clean absence: `ls-tree HEAD` present → **NOT_PUSHED** + `git push` + `git fetch origin` hint (G7/M34; G10-default/M58 indistinguishable here, hence the hint always rides this branch); absent → **NOT_COMMITTED** (G8/M01) |

Results memoized per feature for the invocation (BR-03-3). The env thresholds are read at invocation time — never baked constants — and documented in the script header (BR-03-1).

### 3.7 Reason-code message catalog (REQ-GUARD-07 — exact prose, TSPEC-owned)

Every block writes one line to stderr, prefix `pdlc-guard[<REASON>]:`. Templates (`{…}` interpolated; required substrings from the REQ table shown **bold** in commentary):

| Reason | Exact template |
|---|---|
| `NOT_COMMITTED` | `pdlc-guard[NOT_COMMITTED]: refusing deletion — LEARNINGS-{feature}.md is not committed for docs/{feature}/. Run /pdlc:harvest-learnings, then commit (and push) LEARNINGS-{feature}.md before deleting review artifacts (harvest-then-delete).` — carries **`LEARNINGS-{feature}.md`** and **`/pdlc:harvest-learnings`** + commit instruction. Git-query-failure blocks append ` (git state could not be verified: {detail})` |
| `NOT_PUSHED` (G4) | `pdlc-guard[NOT_PUSHED]: LEARNINGS-{feature}.md is committed but the branch was never pushed. Run: git push -u origin {branch} — then retry the deletion.` — carries **`git push -u origin`** |
| `NOT_PUSHED` (G7/G10) | `pdlc-guard[NOT_PUSHED]: LEARNINGS-{feature}.md is committed but not present on origin/{branch}. Run: git push. If you have already pushed, refresh the stale remote-tracking ref with: git fetch origin — then retry.` — carries **`git push`** and the **`git fetch`** hint (G7 and G10-default are indistinguishable at this branch, so one message serves M34 and M58) |
| `INDETERMINATE` (D3) | `pdlc-guard[INDETERMINATE]: cannot statically resolve deletion target {operand} while unverified review artifacts exist under docs/. Failing closed: spell the target as a literal path, or harvest, commit, and push LEARNINGS first.` — names the **unresolvable operand** + fail-closed rationale |
| `INDETERMINATE` (D4) | `pdlc-guard[INDETERMINATE]: git clean without a pathspec targets every untracked file repo-wide while unverified review artifacts exist under docs/. Failing closed: pass an explicit pathspec outside docs/, or harvest, commit, and push LEARNINGS first.` — names the **`git clean` scope** + rationale |
| `NO_REPO` | `pdlc-guard[NO_REPO]: cannot verify LEARNINGS commit state outside a git repository — refusing a deletion-shaped command. Run this from inside the project checkout.` |
| `PARSE_ERROR` | `pdlc-guard[PARSE_ERROR]: hook stdin was unparseable or missing tool_input.command — the hook input contract is stable, so this indicates a harness fault; failing closed.` — carries the required **unparseable-stdin** statement. The § 3.3 top-level handler emits this same template with ` (internal parse failure: <ExceptionType>)` appended, so the substring oracle holds on every `PARSE_ERROR` emission |
| `DEGRADED` | `pdlc-guard[DEGRADED]: no usable Python interpreter (tried python3, python, py) — coarse fail-closed matcher blocked this command. Install python3 to restore full-fidelity guard behavior.` — names the **missing-interpreter cause** and **`python3`** remedy (emitted by the bash wrapper) |

Tests assert prefix + required substrings only, never full prose (REQ-GUARD-07).

### 3.8 Error handling — failure scenarios

| Scenario | Behavior | Pin |
|---|---|---|
| No usable interpreter | Degraded matcher (§ 3.2) — block `DEGRADED` / allow | M42–M43, M68–M72 |
| Unparseable / empty stdin (interpreter present) | `PARSE_ERROR` | M41 |
| `tool_input.command` absent / `null` | `PARSE_ERROR`; `""` allows | M78 / M81 |
| Both degradations co-occur | Wrapper order makes DG-DP1 govern; `DEGRADED` or allow | M71–M72 |
| root_A not a repo / nonexistent / detection failure | `NO_REPO` (eager, deletion-shaped only) | M37, M75–M76, M83 |
| Git query failure after G-DP1 | `NOT_COMMITTED`, never exit 0 | M77 |
| Fetch timeout / unreachable origin | Proceed on local ref state | M59 |
| `GUARD_FETCH_TIMEOUT_SECS` unparseable | Default 10 (documented in header) | — |
| Python exception inside G-DP1 / `verify_feature` git queries | Layer-1 wrap → `NO_REPO` / query-failure `NOT_COMMITTED` respectively (§ 3.3), never exit 0 | M75 class / M77 class |
| Python exception elsewhere (intake, parsing, `decide`) | Top-level handler → § 3.7 `PARSE_ERROR` template + internal-parse-failure detail, exit 2 (§ 3.3) | — |
| Recursion depth > 8 | Payload treated as opaque → D1-eligible | RR-3; M73 pins depth 2 |

---

## 4. Carry-Forward Resolutions — Promoted Upstream (REQ v1.7 / FSPEC v1.4)

The v1.0 draft resolved the three iteration-4 carry-forwards with a TSPEC-owned row namespace (T-01–T-03) and declared the REQ matrix untouched. Both TSPEC cross-reviews (PM F-01/F-02, TE F-03) correctly identified this as a violation of the TE F-09 matrix-ownership rule; pm-author landed the upstream amendments in REQ v1.7 + FSPEC v1.4 (same commit). Current state — nothing behavior-defining is TSPEC-owned:

| CF | Source | Upstream resolution |
|---|---|---|
| CF-A | SE FSPEC-v4 F4-01 (reason-code asymmetry: indeterminate source × static existing-guarded destination blocked `INDETERMINATE` though destruction is statically certain) | **Hoist adopted at REQ level** (PM F-01 option (a)): the `mv` destination-destruction test is stated in REQ v1.7 as source-guardedness- and source-*determinacy*-irrelevant, preceding D3; FSPEC v1.4 `mv` flow gains step 2b; REQ-GUARD-07's `INDETERMINATE` row is annotated with the carve-out. Pinned by **M87** (formerly T-01) |
| CF-B | TE FSPEC-v4 F4-01 (the "source guardedness irrelevant" clause had no discriminating row) | Pinned by **M88** (formerly T-02) |
| CF-C | TE FSPEC-v4 F4-02 (the resulting-path arm had no discriminating row) | Pinned by **M89** (formerly T-03) |

Row-id mapping for readers of the v1.0 reviews: **T-01 → M87, T-02 → M88, T-03 → M89** — commands, verdicts, reasons, and G6 re-run expectations carried over unchanged into the Canonical Matrix; M33's G6 re-run enumeration was extended there to `M84–M90`. The related upstream decisions from the same REQ touch: **M90** sanctions the § 3.5.1 `N>` classification inside the (still closed) REQ-GUARD-02 enumeration (PM F-04); **RR-6/RR-7** register the command-substitution and degraded-`\/` acceptances, and **RR-5** now names same-call `pushd`/`popd` drift (PM F-05/F-07); the reason-code catalog stays **closed** — the internal-error catch-all is resolved TSPEC-side per § 3.3 (PM F-03 / TE F-10).

---

## 5. `check-scope-field.sh` — Design

Minimal diff to the current script; structure, interpreter probe, `[ -f "$fp" ]` guard, advisory-JSON emission (C9), and always-exit-0 posture are retained. The interpreter-missing path remains a silent no-op (REQ-GUARD-06 case 3). Two changes:

**Change 1 — basename filter (TE TSPEC F-08).** The current `case "$fp" in *CROSS-REVIEW-*.md)` filter (C8) is a full-path substring match, not the basename filter FSPEC-GUARD-05 step 1 specifies — a non-review basename inside a review-named directory (`docs/CROSS-REVIEW-archive/notes.md`) passes it and can false-warn. Apply the patterns to the basename:

```bash
case "$(basename "$fp")" in
  CROSS-REVIEW-*.md|CODE_REVIEW-*.md) ;;
  *) exit 0 ;;
esac
```

(Anchored — no leading `*` — since a basename cannot carry a directory prefix.) S07's fixture (`notes.md` in a plain tmpdir) remains satisfiable but does not discriminate path-vs-basename; no S-row pins the distinction, and the behavior delta is strictly a false-warn removal, conformant with FSPEC-GUARD-05 step 1.

**Change 2 — anchored Scope patterns.** Replace the single grep at `check-scope-field.sh:41` (C7) with the three exact REQ-GUARD-04 EREs — **case-sensitive** (no `-i`), any match → silent:

```bash
if grep -qE '^[[:space:]]*Scope:' "$fp" \
   || grep -qE '^[[:space:]]*\*\*Scope(\*\*:|:\*\*)' "$fp" \
   || grep -qE '\|[[:space:]]*Scope[[:space:]]*\|' "$fp"; then
  exit 0
fi
```

- **P1** plain field line (S01); **P2** bold markdown, both spellings (S02); **P3** table header cell, deliberately not line-anchored — mid-row position matches (S03).
- The current `cross-feature` alternate (C7) is dropped — it was a substring false-pass vector of exactly the class REQ-GUARD-04 retires.
- Negatives: "telescope"/"the scope of this change" prose and lowercase `scope:` match no pattern → warning (S04–S06).

The advisory message text is unchanged (`check-scope-field.sh:45–47`); the existing PROP-COMPAT-04 tests continue to pass — their "already tagged" fixture (`hookCompatibility.test.js:113`) begins with frontmatter `Scope: Local`, a P1 match (C13).

---

## 6. Test Architecture (REQ-GUARD-05)

### 6.1 Harness — cite-and-reuse

The suite reuses the shipped `runHookScript` child-process pattern (`hookCompatibility.test.js:47–59`, C10) — REQ-GUARD-05 mandates the existing jest harness, not a new shell harness. `npm test` in `pdlc/workflows/` remains the single command (C15). The bash-availability skip pattern (`hasBash ? it : it.skip`, `hookCompatibility.test.js:84`) is retained and extended with a `python3`-availability probe for full-fidelity rows (degraded rows need only bash).

**Absolute-path bash for degraded rows (TE TSPEC F-02).** `spawnSync("bash", …)` resolves the executable against the *child* env's `PATH` (C17), so the seven degraded rows — whose whole point is an empty child `PATH` — would fail at spawn (`ENOENT`, exitCode −1) before the script ever ran. The fixture library therefore resolves bash's absolute path **once at module load, under the parent environment**: `BASH_ABS = spawnSync("bash", ["-c", "command -v bash"], {encoding: "utf8"}).stdout.trim()`, asserted non-empty (falling back to `/bin/bash` only if the probe itself cannot run). Every `runGuard` invocation spawns `spawnSync(BASH_ABS, [scriptPath], …)` — the script is passed as an argument, so no shebang or `PATH` resolution happens in the child, and the restricted env reaches only the script's *own* `command -v` probes (which is exactly what M42–M43/M68–M72 exercise). `runHookScript`'s C10 pattern is otherwise reused; the degraded rows simply require the executable be named absolutely.

### 6.2 Fixture library — `__tests__/helpers/guardFixtures.js` (new; helpers dir is jest-ignored, C14)

```js
/** @typedef {{repoDir:string, bareDir:string|null, branch:string, cleanup:()=>void}} Fixture */

buildFixture(state, opts?) → Fixture   // hermetic; every git op local; no network
runGuard(fixture|null, {command|stdinRaw, stdinCwd?, spawnCwd?, env?}) → {exitCode, stdout, stderr}
  // assembles stdin JSON ({tool_input:{command}, cwd: stdinCwd?}) or passes stdinRaw verbatim;
  // spawns via BASH_ABS (§ 6.1) with env merge; CLAUDE_PROJECT_DIR set to repoDir by default,
  // overridable/unsettable via env: {CLAUDE_PROJECT_DIR: undefined}  (C11 — M85/M86)
  // spawnCwd DEFAULT = fixture.repoDir (fixture===null → a fresh mkdtemp scratch dir) —
  // NEVER process.cwd(): the developer checkout is itself a git repo with a docs/ tree and
  // would leak into union-cwd resolution as candidate root (B) (TE TSPEC F-09)
degradedEnv() → {PATH: <empty mkdtemp dir>}   // restricted PATH for M42–M43, M68–M72; empty dir, not /var/empty (Linux CI portability)
expectBlock(res, reason, substrings)  // exitCode===2 && stderr.startsWith(`pdlc-guard[${reason}]`)
                                      // && every s of substrings appears in stderr (§ 6.3 oracle contract)
expectAllow(res)          // exitCode===0
```

State builders (each starts from the default fixture: `git init -b feat-f` + identity config; `docs/f/CROSS-REVIEW-x.md`, `docs/f/CODE_REVIEW-f-v1.md`, `docs/f/archive/`, `docs/other-feature/`, `docs/empty-feature/x.txt`, `src/foo.ts` committed; local `git init --bare` origin added and branch pushed; then `LEARNINGS-f.md` written to disk only):

| State | Construction delta |
|---|---|
| `G8` (default) | as above — LEARNINGS on disk only |
| `G6` | commit `LEARNINGS-f.md` + `git push origin feat-f` |
| `G7` | commit, no push |
| `G4` / `G5` | build **without** the initial branch push (origin remote exists, `origin/feat-f` absent); G4 commits LEARNINGS, G5 does not |
| `G2` | no remote added; LEARNINGS committed |
| `G3` | G2 construction + `git checkout --detach` |
| `G9` | commit `LEARNINGS-other.md` (push), `LEARNINGS-f.md` absent |
| `G10` | commit + push LEARNINGS, then `git update-ref refs/remotes/origin/feat-f <pre-push-sha>` (stale local tracking ref; remote truth unchanged) |
| `G10-unreachable` | G10 + `git remote set-url origin /nonexistent-remote-path` (fetch fails fast, hermetically) |
| `G1` | plain `mkdtempSync` dir (never `git init`) containing `docs/f/CROSS-REVIEW-x.md` on disk |
| `M77` | default + **corrupt the loose object** behind `origin/feat-f`: `sha = git rev-parse origin/feat-f`; make `.git/objects/{sha[0:2]}/{sha[2:]}` writable and overwrite it with non-zlib garbage bytes (file kept present). Empirical basis (C18): `show-ref --verify --quiet` still exits 0 (ref intact) and `symbolic-ref`/`rev-parse` are unaffected, so the flow reaches the remote-tree query, where `ls-tree --name-only origin/feat-f -- docs/f/LEARNINGS-f.md` fails exit 128 with `fatal: loose object … is corrupt` stderr — a true § 3.6 query failure. The v1.0 corrupt-*ref* construction is **rejected**: it classifies as clean absence (`show-ref` exit 1, silent) and routes G5, never touching the fail-closed branch (TE TSPEC F-06). **Builder self-check:** after corrupting, the builder itself runs the `ls-tree` probe and throws unless it exits nonzero with non-empty stderr — making the fixture loud against git-version drift, object packing, or ref-backend changes (fixture repos never gc/repack, so the object is loose; the self-check makes that assumption falsifiable) |
| `nested` | default + `docs/f/2024-notes/CROSS-REVIEW-x.md` (M67) |
| `secondRepo` | additional guarded-directory-free `git init` repo (M86) |

Hermeticity invariants (REQ-GUARD-05): no network I/O anywhere — the only remote is the local bare fixture or an invalid path; all temp trees under `mkdtempSync` with `afterEach` cleanup; fixture git commands set `user.name`/`user.email` locally and use `-c protocol.file.allow=always` where a file-remote push requires it.

### 6.3 Matrix binding — `guardMatrix.test.js` (new)

One asserting test per row, test title = row ID (auditable by grep). Structure: a literal `MATRIX` table (array of `{id, state, command|stdin, stdinCwd, spawnCwd, env, expect: {exit, reason, substrings}}`) driving `it.each`, with dedicated `it()` blocks for rows needing bespoke orchestration. Grouping — **allocation invariant: the nine base groups partition `{M01–M32, M34–M90}` with every row in exactly one group** (REQ-GUARD-05's exactly-one obligation is discharged by this table, not rescued at implementation time — PM TSPEC F-06 / TE TSPEC F-01); M33 is discharged by the re-run parameterization:

| Describe block | Rows | Fixture/controls |
|---|---|---|
| D2 statics, verbs, compounds | M01–M07, M09–M16, M18–M19, M44–M45, M47–M54, M60–M63, M67 (nested), M74, M79, M84, M90 | default G8; commands verbatim from REQ rows (M74/M84 base bindings and the M17/M46 de-duplications restore the exactly-one invariant; M90 is the `N>` pin) |
| mv destruction rows | M87–M89 | default G8 (promoted T-01–T-03; § 4) |
| D3/D4 indeterminates | M08, M20–M21, M24–M25, M46, M55–M56, M82 | default G8 |
| D1 / NFR-01 allows | M22–M23, M26–M31, M32, M73 | default G8 (M22/M23/M73 are blocks — grouped here as opaque-recursion set) |
| cwd-union rows | M17 (same-call `cd`), M64 (stdinCwd=`docs/f`), M65 (no cwd signal, spawnCwd=repo root → allow), M66/M80 (spawnCwd=`docs/f`, `CLAUDE_PROJECT_DIR`=repo root), M85 (`CLAUDE_PROJECT_DIR` unset via `undefined`, spawnCwd=repo), M86 (`CLAUDE_PROJECT_DIR` unset, stdinCwd=repo, spawnCwd=secondRepo) | per-row controls (C10/C11) |
| Git-state rows | M34–M36, M38–M40, M57–M59, M77 | state builders § 6.2; M40/M59 set `GUARD_FETCH_BEFORE_CHECK=true` (+`GUARD_FETCH_TIMEOUT_SECS=5` for M59) |
| Non-repo rows | M37, M75, M76, M83 (stdinCwd=non-repo dir, spawnCwd=repo) | `G1` fixture |
| Contract rows | M41 (both `not-json{` and empty variants asserted in the one row-test), M78, M81 | stdinRaw control |
| Degraded rows | M42–M43, M68–M72 | `degradedEnv()` via `BASH_ABS` (§ 6.1); M71 stdinRaw `not-json{"cmd":"rm docs/f"}`; M72 empty stdin |
| **M33 G6 re-run** | one parameterized `it.each` over `M33_RERUN_IDS` — M01, M02, M04–M24, M44–M54, M60–M64, M66–M67, M73–M74, M79–M80, M82, M84–M90 (the REQ v1.7 enumeration) — each re-run against a `G6` fixture with its own row controls, expecting ALLOW | `G6` (+nested/secondRepo variants where the base row needs them) |
| Parser self-test + property tables | non-row-titled supplementary tests (§ 6.6) — outside matrix accounting | default G8 / no fixture |
| Suite self-audit | meta-tests below — a deleted or duplicated row cannot silently drop coverage | — |

**Self-audit mechanism (TE TSPEC F-07).** Row-id ground truth lives in one shared module, `__tests__/helpers/guardRowIds.js` (jest-ignored, C14): `M_ROWS` (`M01`…`M90`), `S_ROWS` (`S01`…`S07`), `M33_RERUN_IDS`. Three meta-tests consume it:

1. **Base allocation** (guardMatrix.test.js): the `MATRIX` id list, sorted, deep-equals `M_ROWS` minus `M33`, **and** its length equals its `Set` size — set-equality alone cannot catch a duplicated id, so the length check enforces *exactly one* (PM TSPEC F-06).
2. **Re-run integrity** (guardMatrix.test.js): the G6 parameterization iterates `M33_RERUN_IDS` directly (no second copy can drift), and the meta-test asserts `M33_RERUN_IDS ⊆ M_ROWS` with no duplicates. `M33_RERUN_IDS` is a **maintained copy of the REQ M33 enumeration** — the comparison source TE F-07(b) asked for is this single named constant: the REQ is markdown prose and parsing it at test time is brittle, so the copy is accepted and documented at its declaration (drift against the REQ itself remains review-caught; drift *within* the suite is impossible since both the parameterization and the audit consume the same constant).
3. **S-row coverage** (hookCompatibility.test.js): the S-row describe block generates its tests from a local `S_CASES` table; a meta-test asserts the `S_CASES` id set equals `S_ROWS` — deleting an S-case now fails loudly instead of silently dropping REQ-GUARD-05 S-row coverage (TE F-07(a)).

**Oracle discipline — full REQ-GUARD-07 substring contract (TE TSPEC F-05).** `expectBlock(res, reason, substrings)` asserts exit 2 + the `pdlc-guard[<REASON>]` prefix + every required substring; each MATRIX row's `substrings` is assembled mechanically, never hand-tuned per test:

| Reason (per row) | Required substrings asserted |
|---|---|
| `NOT_COMMITTED` (all rows) | `LEARNINGS-f.md` **and** `/pdlc:harvest-learnings` |
| `NOT_PUSHED`, G4 state (M35) | `git push -u origin` |
| `NOT_PUSHED`, G7 state (M34) | `git push` |
| `NOT_PUSHED`, G10 states (M58, M59) | `git push` **and** `git fetch` |
| `INDETERMINATE`, D3 rows (M20, M21, M24, M46, M82) | the row's unresolvable-operand raw text, carried on the MATRIX entry (e.g. M46/M82: `"$D"` spellings; M20: the `$( … )` operand). M87 is *not* here — its reason-code assertion (`NOT_COMMITTED`) is what kills the step-3-first implementation |
| `INDETERMINATE`, D4 row (M08) | `git clean` |
| `NO_REPO` (M37, M75, M76, M83) | `outside a git repository` |
| `PARSE_ERROR` (M41, M78) | `unparseable` |
| `DEGRADED` (M42, M68, M70, M71) | `python3` |

Never full prose (REQ-GUARD-07). A catalog regression dropping the harvest instruction, the operand naming, or the G7 push hint now fails its rows.

### 6.4 S-rows — in `hookCompatibility.test.js`

S01–S07 as seven table-generated tests (title = row ID, driven by a local `S_CASES` table via `it.each`) in a new describe block beside the retained PROP-COMPAT-04 suite, reusing its tmpdir/writeFileSync pattern (C13). The `S_CASES` id set is audited against the shared `S_ROWS` constant by the § 6.3 meta-test 3. Oracle: silent = exit 0 + empty stdout; warning = exit 0 + stdout containing `hookSpecificOutput` and `Scope`. S07 writes `notes.md` (basename filter branch — satisfiable but non-discriminating for the § 5 path-vs-basename tightening; accepted, no S-row pins that distinction).

### 6.5 PROP-COMPAT-05 migration (REQ-GUARD-05 migration note)

The `hookCompatibility.test.js:156–244` block (C12) is **deleted** — its assertions assume behavior this feature inverts — and replaced by a comment pointing here. Assertion-level mapping:

| Old assertion | Disposition |
|---|---|
| Non-repo tmpdir, `rm CROSS-REVIEW…`, no LEARNINGS → blocks with `pdlc guard` message | Superseded: the non-repo cell is now **M37** (`NO_REPO`); the in-repo no-LEARNINGS cell is **M01** (`NOT_COMMITTED`). Old stderr oracle `pdlc guard` becomes the `pdlc-guard[` prefix |
| Disk-only `LEARNINGS-*.md` alongside → **allows** | **Inverted by the REQ**: disk-only is G8 → **M01 blocks**; any-`LEARNINGS-*` globbing is retired by G9 → **M36**. The allow-side successor is the **M33/G6** re-run set (committed **and pushed**) |
| `rm CODE_REVIEW…`, no LEARNINGS → blocks | Logically covered by the pair **M06** (`git rm docs/f/CODE_REVIEW-f-v1.md` — the CODE_REVIEW-pattern block pin) + **M01** (`rm` verb, CROSS-REVIEW pattern): the guard's pattern handling is uniform — one fnmatch pair in `enumerate_guarded` (§ 3.5), no per-verb pattern logic — so verb `rm` and the `CODE_REVIEW-*` pattern are jointly pinned. No matrix row spells `rm docs/f/CODE_REVIEW-…` and none is added (the v1.0 "CODE_REVIEW twin in the D2 group" citation was wrong — TE TSPEC F-11); M37 covers the old non-repo cwd |

PROP-COMPAT-04 is untouched. The PROPERTIES document (te-author, downstream) should retire the PROP-COMPAT-05 property ID in favor of matrix-bound properties.

### 6.6 Parser unit-test strategy — `--self-test` mode + property tables (TE TSPEC F-04)

The hand-rolled tokenizer/segmenter/heredoc-stripper/verb-identifier is exactly the component class where ~90 fixed matrix examples miss corners. Two supplementary layers close this, both outside matrix-row accounting (non-row test titles; the § 6.3 self-audit governs only `MATRIX` ids):

**(1) Embedded `--self-test` mode** — the chosen mechanism. Two options were weighed (recorded as **DEC-harden-harvest-guard-01**): extracting the Python to a sibling importable `guard_parser.py` gives real unit imports but splits the deployable into two files that must travel together through the plugin cache and hooks.json wiring (C16) and can drift independently — the exact failure mode § 2's single-file decision rejects; the `--self-test` mode keeps one deployable at the cost of embedding a test table in the script (inert on the hook path: gated on argv the hooks never pass, C16, evaluated before the stdin read — § 3.1 step 0). Single-file wins. Specification:

- Python side: `if sys.argv[1] == "--self-test" and os.environ.get("GUARD_SELF_TEST") == "1": sys.exit(run_self_test())` (the conjunction gate of § 3.1 step 0). `run_self_test()` executes an embedded parameterized case table `SELF_TEST_CASES = [(case_id, input_text, expected_structure)]` calling the § 3.5 functions **directly** (unit level — no JSON envelope, no git, no filesystem): **tokenizer** — quote states, backslash escapes, `expansion_active`/`glob_active` flag placement, adjacent redirections, the `>&` lexical rule (digit vs `-` vs non-digit vs digit-leading word), `N>`/`N>>`/`N>&M` forms; **segmenter** — every connector incl. `|&`, quoted operators as data, nested quotes around operator lookalikes, `(`/`{` group openers; **heredoc stripper** — quoted/unquoted delimiters, `<<-` tab-indented terminators, operator lookalikes inside bodies, `<<<` non-heredoc; **verb identifier** — assignment prefixes, transparent prefixes with flags, `git rm`/`git clean`, `find` deletion forms and root defaulting, `xargs`/`eval`/`bash -c` unwrapping, depth-cap opacity. Expected values are structural tuples (token `value`/flags, segment count/connectors, `VerbInfo` fields). Any mismatch: failing case ids on stderr, exit 1; success: case count on stdout, exit 0.
- Jest binding: one python3-gated test in `guardMatrix.test.js` spawns the entrypoint with `["--self-test"]` and asserts exit 0. The parser corpus thus runs under `npm test` (C15) with zero new dependencies.

**(2) Black-box property tables** (through the bash entrypoint, worst-case G8 fixture) — parameterized, table-driven rather than generative. Justification: hypothesis-style generation is not required here — Python-side `hypothesis` would breach the stdlib-only floor (§ 3.3) and a jest-side bash-grammar generator would itself be an unreviewable correctness liability, while the discriminating corners are *enumerable* from the shell grammar (quote-state × operator × token-position is a finite cross-product), so fixed tables give deterministic, reviewable, CI-stable coverage of the same invariants:

- **P-D1 (NFR-01/D1 invariant):** a table of verb-free commands composed over the guarded-token vocabulary — guarded paths inside `echo`/`grep`/`git commit -m`/heredoc-body/quoted-string positions, crossed with connectors and redirection lookalikes (`>>`, `2>&1`) — every case `expectAllow` (exit 0 always). Titles `P-D1-nn`.
- **P-QUOTE (quoting invariance):** for each row in a designated static-operand block list (M01, M04–M07, M47–M51, M53–M54, M60–M63, M90), re-run with the guarded operand rewrapped in `"…"` and `'…'` — verdict and reason must equal the base row's (M44/M45 pin this for `rm`; the table extends it across the verb set). Titles `P-QUOTE-nn` — variant commands, not second assertions of the rows themselves, so the REQ-GUARD-05 exactly-one obligation is untouched.

---

## 7. Requirements → Components Traceability

| Requirement | Implementing component(s) | Tests |
|---|---|---|
| REQ-GUARD-01 (parsing, D1–D4, union cwd) | §§ 3.4–3.5 (`strip_heredocs`, `segment`, `tokenize`, `identify_verb`, `classify_operands`, `EffectiveCwd`, `resolve_static`, `decide`) | M01–M03, M17–M32, M44–M51, M55, M63–M66, M73, M80, M85–M86 |
| REQ-GUARD-02 (verb set, mv, redirection) | §§ 3.5.1, 3.5.2, 3.5.5 (`mv_flow`, redirection classifier) | M04–M16, M52–M54, M56, M60–M62, M67, M74, M79, M82, M84, M87–M90 |
| REQ-GUARD-03 (git-state matrix, thresholds) | § 3.6 (`verify_feature`, G-DP1 in `decide`) | M33–M40, M57–M59, M75–M77, M83 |
| REQ-GUARD-06 (degraded policy) | §§ 3.1–3.2, 3.4 (wrapper order, coarse matcher, intake gate) | M41–M43, M68–M72, M78, M81 |
| REQ-GUARD-07 (message catalog) | § 3.7 (`emit_block`) | reason-code assertion of every BLOCK row |
| REQ-GUARD-04 (scope patterns) | § 5 | S01–S07 |
| REQ-GUARD-05 (matrix-driven tests) | § 6 | the suite itself + the three self-audit meta-tests (§ 6.3) + parser self-test and property tables (§ 6.6, supplementary) |
| REQ-GUARD-NFR-01 (no false blocks) | D1 precedence in `decide` (§ 3.5.4 step 1) — structural guarantee | M26–M31 (worst-case fixtures) + P-D1 table (§ 6.6) |

---

## 8. Open Questions

None. All REQ/FSPEC review iterations are dispositioned upstream; the former carry-forwards are REQ-owned as of v1.7 (§ 4).

---

## 9. Reviewer Findings Disposition (v1.0 → v1.1)

Source reviews: [CROSS-REVIEW-product-manager-TSPEC.md](CROSS-REVIEW-product-manager-TSPEC.md) (1H/5M/1L), [CROSS-REVIEW-test-engineer-TSPEC.md](CROSS-REVIEW-test-engineer-TSPEC.md) (6M/5L). The REQ/FSPEC-owned findings were resolved by pm-author in REQ v1.7 + FSPEC v1.4 (same commit, 2026-07-02); this revision aligns to those and resolves every TSPEC-internal finding.

| Finding | Disposition |
|---|---|
| PM F-01 (High) + TE F-03 (Medium) — step-2b hoist changed REQ-owned observable without upstream amendment | Resolved upstream (PM option (a)): REQ v1.7 `mv`-table carve-out + REQ-GUARD-07 annotation; FSPEC v1.4 step 2b; pinned by **M87**. § 3.5.5 now cites the REQ/FSPEC-owned step 2b; no TSPEC-owned behavior remains |
| PM F-02 (Medium) + TE F-03 — T-01–T-03 held as a parallel TSPEC row namespace | Promoted upstream as **M87–M89** per the TE F-09 rule; § 4 rewritten to a promotion record with the T→M mapping; § 6.3 binds them as matrix rows; M33's re-run set extended to M84–M90 (REQ-owned enumeration) |
| PM F-03 (Medium) / TE F-10 (Low) — internal-error catch-all fired `PARSE_ERROR` outside its catalog condition, without the required substring | REQ v1.7 keeps the catalog closed; TSPEC-side fix in § 3.3: **two-layer exception discipline** — git-query exceptions route to the existing `NO_REPO` / query-failure `NOT_COMMITTED` classes (layer 1); the top-level handler covers only interpretation faults (REQ-GUARD-06 case-2 class) and emits the exact § 3.7 `PARSE_ERROR` template (required substring always present) with an internal-parse-failure detail appended. `DEGRADED` routing weighed and rejected (both its condition and required content would be false) |
| PM F-04 (Medium) — `N>` classification widened the closed REQ-GUARD-02 enumeration | Sanctioned upstream: REQ v1.7 extends the (still closed) enumeration, pinned by **M90**. § 3.5.1 cites M90; M90 bound in § 6.3 (D2 statics) and included in the P-QUOTE list (§ 6.6) |
| PM F-05 (Medium) — live command-substitution bypass unregistered | Registered upstream as **RR-6** (not defended — D1-opacity/NFR-01 rationale); § 3.5.2 cites it |
| PM F-06 (Medium) + TE F-01 (Medium) — § 6.3 binding table: M74/M84 unbound at base state; M17/M37/M46 double-allocated | § 6.3 rebuilt: group ranges corrected to M09–M16+M18–M19, M34–M36+M38–M40, M44–M45+M47–M54; M74/M84 (and new M90) bound in the D2-statics group at default G8; allocation invariant stated on the table; self-audit meta-test 1 adds a length-vs-set check so duplication (not just omission) fails loudly |
| PM F-07 (Low) — `pushd`/`popd` same-call drift and degraded `\/` defeat accepted only in TSPEC prose | Registered upstream: RR-5 extended (same-call stack-builtin drift), **RR-7** added; §§ 3.5.3 / 3.2 cite them |
| PM Q-01 — is the one-touch REQ v1.7 planned this iteration? | Answered upstream: yes — REQ v1.7 + FSPEC v1.4 landed 2026-07-02; the F-01(b) reword option was not needed |
| TE F-02 (Medium) — degraded rows cannot spawn `bash` under the restricted child `PATH` | § 6.1: `BASH_ABS` resolved once at helper-module load under the parent env (`command -v bash`, `/bin/bash` fallback), all spawns use the absolute path with the script as argv — restricted env reaches only the script's own probes. Recorded as empirical claim C17 |
| TE F-04 (Medium) — no unit/property strategy for the parsing engine | § 6.6: embedded **`--self-test` mode** chosen over sibling `guard_parser.py` extraction (both weighed; recorded as DEC-harden-harvest-guard-01 — single-file deployable wins per § 2/C16); argv+env conjunction gate keeps it unreachable/undivertable in production (§ 3.1 step 0); plus black-box **P-D1** and **P-QUOTE** property tables — parameterized table-driven rather than generative, justified (stdlib-only floor; enumerable corner space; deterministic CI) |
| TE F-05 (Medium) — block assertions under-implement the REQ-GUARD-07 substring oracle | § 6.3 oracle contract table: NOT_COMMITTED rows assert `LEARNINGS-f.md` **and** `/pdlc:harvest-learnings`; M34 asserts `git push`; M58/M59 `git push`+`git fetch`; D3 rows assert their unresolvable-operand text; M08 `git clean`; NO_REPO/PARSE_ERROR/DEGRADED sets enumerated. `expectBlock` gains the `substrings` parameter |
| TE F-06 (Medium) — M77 corrupt-ref fixture classifies as clean absence; query-failure branch untested | § 6.2 M77 fixture redesigned: **corrupt loose object** behind `origin/feat-f` (empirically verified, git 2.50.1: `ls-tree` exits 128 with `fatal: loose object … is corrupt` while `show-ref`/`symbolic-ref`/`rev-parse` are unaffected — C18), with a builder self-check that throws unless the probe query actually fails (covers the reftable/packing/git-drift concern). § 3.6 documents the deviation from the REQ row's illustrative corrupt-ref construction |
| TE F-07 (Low) — self-audit missed S-rows; M33 comparison source unnamed | § 6.3 self-audit mechanism: shared `guardRowIds.js` (`M_ROWS`/`S_ROWS`/`M33_RERUN_IDS`); S-row tests generated from `S_CASES` audited against `S_ROWS` (meta-test 3); `M33_RERUN_IDS` named as the single maintained copy of the REQ enumeration, consumed by both the parameterization and the audit (copy accepted and documented) |
| TE F-08 (Low) — C8 filter is path-substring, not basename | § 5 change 1: patterns applied to `basename "$fp"` (anchored); C8 claim corrected; S07 noted satisfiable but non-discriminating for the distinction |
| TE F-09 (Low) — `runGuard` default `spawnCwd` unspecified (host-checkout leak into root B) | § 6.2: default `spawnCwd = fixture.repoDir`; `fixture === null` → fresh mkdtemp scratch dir; never `process.cwd()` |
| TE F-11 (Low) — § 6.5 row 3 cited a nonexistent "CODE_REVIEW twin" test | § 6.5 corrected: coverage is the M06+M01 pair under the guard's uniform pattern handling (one fnmatch pair in `enumerate_guarded`); no row added |

---

## 10. Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-02 | Initial TSPEC from REQ v1.6 + FSPEC v1.3: bash-wrapper + embedded-Python architecture with builtins-only degraded path; parsing-engine decomposition (scanner tokenizer, verb identification with opaque recursion cap 8, union-cwd tracking, D1→G-DP1→D2→D3→D4 engine); `ls-tree`/`show-ref` git idioms honoring the failure-vs-absence boundary; exact reason-code message catalog; scope-check P1–P3 greps; matrix-driven test architecture with hermetic G1–G10 fixture builders and PROP-COMPAT-05 migration; iteration-4 carry-forwards resolved (SE F4-01 hoist as `mv` step 2b; TE F4-01/F4-02 pinned) with TSPEC-owned rows T-01–T-03 |
| 1.1 | 2026-07-02 | TSPEC iteration-1 review deltas (PM 1H/5M/1L, TE 6M/5L — § 9). Aligned to REQ v1.7 + FSPEC v1.4: T-01–T-03 promoted as **M87–M89**, step 2b now REQ/FSPEC-owned, `N>` sanctioned as **M90**, RR-6/RR-7 registered, RR-5 extended — matrix references updated to M01–M90 throughout and § 4 rewritten as a promotion record. TSPEC-internal fixes: § 3.3 two-layer exception discipline (git-query exceptions → `NO_REPO`/query-failure `NOT_COMMITTED`; top-level handler emits the case-2 `PARSE_ERROR` template with required substring — catalog stays closed); § 6.3 binding table rebuilt (M74/M84/M90 base bindings, M17/M37/M46 de-duplicated, allocation invariant + duplication-catching self-audit via shared `guardRowIds.js`, S-row coverage audit, full REQ-GUARD-07 per-reason substring contract); § 6.1 degraded rows spawn bash via `BASH_ABS` absolute path (C17); § 6.2 M77 fixture redesigned to corrupt-loose-object with builder self-check (C18) and `runGuard` default `spawnCwd = fixture.repoDir`; § 6.6 added — embedded `--self-test` parser unit mode (DEC-01) + P-D1/P-QUOTE property tables; § 5 basename filter fix (C8 corrected); § 6.5 migration citation corrected to the M06+M01 pair |
