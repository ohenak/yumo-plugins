---
Status: Draft
Author: se-author
Version: 1.0
Feature: harden-harvest-guard
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/harden-harvest-guard/LEARNINGS-harden-harvest-guard.md |

# TSPEC — harden-harvest-guard

Technical specification for the fail-closed rewrite of `pdlc/hooks/scripts/guard-harvest-before-delete.sh` and the anchored `Scope:` detection in `pdlc/hooks/scripts/check-scope-field.sh`, plus the matrix-driven test suite binding every row M01–M86 / S01–S07 of the REQ v1.6 Canonical Block/Allow Matrix.

Sources: [REQ-harden-harvest-guard.md](REQ-harden-harvest-guard.md) **v1.6** and [FSPEC-harden-harvest-guard.md](FSPEC-harden-harvest-guard.md) **v1.3** (both approved-with-minor at iteration 4). The three iteration-4 Low carry-forwards (SE F4-01, TE F4-01, TE F4-02) are resolved in § Carry-Forward Resolutions with TSPEC-owned test rows **T-01–T-03**; the REQ matrix is not touched.

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
| C8 | Scope check already filters on basename `*CROSS-REVIEW-*.md` / `*CODE_REVIEW-*.md` and no-ops otherwise | `check-scope-field.sh:32–36` (retained — implements S07) |
| C9 | Scope check emits advisory `hookSpecificOutput` JSON on stdout and always exits 0 | `check-scope-field.sh:50–51` (retained) |
| C10 | Jest harness runs hook scripts via `spawnSync("bash", [scriptPath], { input, env: {...process.env, ...opts.env}, cwd })` and returns `{exitCode, stdout, stderr}` | `pdlc/workflows/__tests__/hookCompatibility.test.js:47–59` (`runHookScript`) |
| C11 | `env` merge supports **unsetting** a variable: an `undefined`-valued entry is dropped by Node's `spawnSync` (child sees it unset) — needed for M85/M86 | verified empirically in SE FSPEC-v4 review (`CROSS-REVIEW-software-engineer-FSPEC-v4.md`, claim-verification table) against `hookCompatibility.test.js:51` |
| C12 | PROP-COMPAT-05 block asserts behavior this feature inverts (non-repo tmpdir + disk-only LEARNINGS ⇒ allow) | `hookCompatibility.test.js:156–244` (migrated; § 6.5) |
| C13 | PROP-COMPAT-04 block (scope check) uses fixtures already conformant with P1/P3 | `hookCompatibility.test.js:62–153` (retained with S-row extension) |
| C14 | Jest ignores `__tests__/helpers/` and `__tests__/fixtures/` as test files — safe home for the fixture library | `pdlc/workflows/package.json` — `testPathIgnorePatterns` |
| C15 | Tests run via `npm test` in `pdlc/workflows/` (jest 29, ESM via `--experimental-vm-modules`) | `pdlc/workflows/package.json` — `scripts.test` |
| C16 | Hooks are wired by absolute plugin path; script filenames must not change | `pdlc/hooks/hooks.json` — `"${CLAUDE_PLUGIN_ROOT}"/hooks/scripts/guard-harvest-before-delete.sh`, `.../check-scope-field.sh` |

There are no `docs/_decisions/` or `docs/_constraints/` directories in this repo (checked 2026-07-02) — no promoted project-level decisions constrain this design.

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

- **Single-file bash wrapper + embedded Python heredoc** (the current scripts' shape, C5). Alternative — a sibling `guard_harvest.py` invoked by path — was rejected: it splits the deployable into two files that must travel together through the plugin cache and hooks.json wiring (C16), enables independent drift, and buys nothing the jest harness can use (REQ-GUARD-05 mandates black-box testing through the bash entrypoint; no test imports the Python).
- **Hand-rolled character-scanner tokenizer** in Python. Alternative — `shlex` — was rejected: `shlex` performs quote removal but discards the per-token quoting context that REQ-GUARD-01 step 5 requires (whether a `$` was single-quoted/escaped, i.e. *expansion-active*), and cannot report segment operators and redirection operators with quote awareness. The scanner produces tokens that carry both raw and post-quote-removal text (§ 3.5).
- **`git show-ref --verify --quiet` + `git ls-tree --name-only`** as the ref-existence and tree-membership idioms. Alternative — the REQ's illustrative `git cat-file -e origin/{branch}:path` — was rejected for the membership check: `cat-file -e` reports a missing *path* with a `fatal:` diagnostic on stderr (exit 128), which collides with FSPEC-GUARD-03's failure-vs-absence boundary (absence must be a *clean empty* outcome). `ls-tree` yields exit 0 + empty stdout + empty stderr for a clean miss, cleanly separating absence from failure (§ 3.6).
- **Raw stdin passed to Python as `argv[1]`** (C5, retained). Alternative — piping via Python's stdin — was rejected: the heredoc already occupies stdin for the script text itself; restructuring to `-c` loses the readable heredoc. The ARG_MAX bound (≥ 256 KiB on supported platforms) comfortably exceeds hook payload sizes; accepted.
- **Carry-forward SE F4-01 resolved by the hoist option** (static-destination destruction certainty refines the reason code before the D3 jump), not the reword-the-gloss option — § 4.

---

## 3. `guard-harvest-before-delete.sh` — Design

### 3.0 File inventory

| File | Change |
|---|---|
| `pdlc/hooks/scripts/guard-harvest-before-delete.sh` | Rewritten (same filename/entrypoint, C16). Script header documents `GUARD_FETCH_BEFORE_CHECK` / `GUARD_FETCH_TIMEOUT_SECS` (BR-03-1 owner obligation) and the exit-code contract |
| `pdlc/hooks/scripts/check-scope-field.sh` | Modified in place (§ 5) |
| `pdlc/workflows/__tests__/helpers/guardFixtures.js` | New — hermetic git fixture library + guard runner (§ 6.2) |
| `pdlc/workflows/__tests__/guardMatrix.test.js` | New — M01–M86, T-01–T-03, M33 G6 re-run expansion (§ 6.3) |
| `pdlc/workflows/__tests__/hookCompatibility.test.js` | Modified — PROP-COMPAT-05 block removed (migration § 6.5); S01–S07 suite added alongside the retained PROP-COMPAT-04 tests |

### 3.1 Bash wrapper flow

Exit-code contract (BR-01-4): **exit 2 = block** (stderr message per § 3.7), **exit 0 = allow**. No other exit codes are intentional; the wrapper propagates the Python process's exit code unchanged.

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

Decision: `degraded_verb_match && degraded_content_match` → exit 2 with the `DEGRADED` message (§ 3.7); otherwise exit 0. Empty stdin matches no token → allow (M72). Field-bleed (tokens in `description` etc.) and `>>`/`2>&1` over-match are the accepted, normative over-match surface (FSPEC-GUARD-04 business rule; allow rows M43/M69/M72 pin the allow side). One documented micro-limitation: a JSON producer that escaped `/` as `\/` would defeat the `docs/` literal — the Claude Code harness does not do this; same accepted class as field-bleed.

### 3.3 Wrapper ↔ Python interface

| Aspect | Contract |
|---|---|
| Script text | Single-quoted heredoc (`<<'PY'`) — no bash expansion inside the Python source |
| Input | Raw hook stdin as `sys.argv[1]` (C5) |
| Environment | Python reads `CLAUDE_PROJECT_DIR`, `GUARD_FETCH_BEFORE_CHECK`, `GUARD_FETCH_TIMEOUT_SECS` from `os.environ` |
| Output | Block messages on stderr only; nothing on stdout |
| Exit | 0 allow, 2 block; a top-level `except Exception` handler emits `pdlc-guard[PARSE_ERROR]: internal guard error (<repr>) — failing closed` and exits 2. Rationale: an internal crash means the guard cannot interpret its input — epistemically the stdin-contract-violation class; fail closed, never fall through to an implicit nonzero-but-messageless exit. (TSPEC-owned; no matrix row — no known trigger.) |
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
| `mv_flow` | `(sources, dest, ctx) → Verdict|None` | § 3.5.5 — steps 0–5 with TSPEC step 2b (SE F4-01 hoist) | M09–M13, M52, M74, M79, M82, M84, T-01–T-03 |
| `emit_block` | `(reason, context) → exit 2` | § 3.7 message catalog | REQ-GUARD-07 AC |

#### 3.5.1 Redirection classification (FSPEC-GUARD-02 rules 1–4)

At tokenization, an unquoted redirection operator and its following word form a `Redir`:

| Form | Classification |
|---|---|
| `2>&1`, `>&2`, `N>&M`, `>&-`, `N>&-` | fd-duplication / fd-close — `target=None`, never destructive. **`>&` lexical rule (CF-1):** the word after `>&` is fd-form iff it consists entirely of digits or is exactly `-`; any other word (incl. digit-leading `2024-notes/CROSS-REVIEW-x.md`) is a truncating file target | M56, M62, M67 |
| `>`, `1>`, `N>`, `>|`, `2>`, `&> word`, `>& word` (non-digit word) | destructive (truncation family) | M14, M53, M54, M61, M62 |
| `>>`, `&>>` | append — never destructive, contributes to no decision | M15 |
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

Deletion verbs appearing inside `$( … )` operands of **non-deletion** verbs (e.g. `echo $(rm docs/f/x.md)`) are **not** re-parsed: FSPEC-GUARD-01 step 2 scopes recursive re-parsing to the three opaque-execution verbs, and extending it is a REQ change (residual class adjacent to RR-1/RR-3). When such a substitution appears in a *deletion* verb's operand it already makes that operand indeterminate → D3 (M20).

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
- `pushd`/`popd` are not tracked (outside the REQ's `cd` rule; surviving drift is the RR-5 class).

A static operand/glob **blocks if either root's resolution** lands in/over an unverified guarded directory (conservative union — M64 blocks via root A, M66/M80 via root B, M65 allows when neither root resolves).

#### 3.5.4 Decision engine `decide()` (BR-01-1 ordering)

1. **D1:** collect deletion-shaped segments (deletion verb in executable position, incl. recursive payload results, or a destructive redirection). None → **exit 0**. (M03 is not D1 — it has a verb but unguarded static operands; M26–M31 are D1.)
2. **G-DP1 eager repo check:** `git -C <root_A> rev-parse --is-inside-work-tree` (root_A per § 3.5.3 — process cwd in the neither-signal branch). Nonexistent dir, nonzero exit, or launch failure → **BLOCK `NO_REPO`** (M37, M75, M76, M83; M85 pins the neither-signal pass-through). Runs once, before D2–D4.
3. **Enumeration + verification context:** `repo_root = CLAUDE_PROJECT_DIR` when set, else `git -C <root_A> rev-parse --show-toplevel` of the root G-DP1 just tested (one mechanism — the fallback cannot fail where G-DP1 passed; M86 pins the anchor). Then `enumerate_guarded(repo_root)`; `verify_feature` lazily/memoized per feature.
4. **D2** per deletion-shaped segment, per static operand (via `resolve_static`, both roots): block when a resolved path (or glob match, or the literal glob-pattern path) is (i) a guarded file, (ii) lexically inside an unverified guarded directory (path-prefix test against `repo_root/docs/<f>/`), (iii) an unverified guarded directory itself, or (iv) — recursive-capable forms only — a path-prefix **ancestor** of one (`docs`, repo root, `/`, `.` and `..` after normpath). `mv` segments are judged by `mv_flow` (§ 3.5.5) **instead of** the plain D2 path tests (BR-02-1). Reason code = the affected feature's `verify_feature` result; multiple affected features → features in sorted order, first unverified decides (deterministic).
5. **D3:** segment has ≥ 1 indeterminate operand or indeterminate destructive-redirection target, AND docs-reference via any channel — (1) own operands/redir-target `value`s contain `docs/`; (2) some `$NAME`/`${NAME…}` referenced by an indeterminate operand has `assignments[NAME]` raw RHS containing `docs/` (quote-independent literal test, M24/M46); (3) any token of a segment piped into this one contains `docs/` (M21); (4) the poisoning/`cd`-context argument contains `docs/` — AND ≥ 1 unverified guarded directory exists → **BLOCK `INDETERMINATE`** (M20–M21, M24, M46, M76-excluded, M82). Channels are segment-scoped: sibling-segment `docs/` without dataflow never qualifies (M55–M56).
6. **D4:** `git clean` with empty pathspec → **BLOCK `INDETERMINATE`** iff any unverified guarded directory exists (M08).
7. **Fall-through → exit 0** (M03, M25, M32, and the RR remainder).

#### 3.5.5 `mv` flow (FSPEC-GUARD-02 steps 0–5, + TSPEC step 2b)

- **Step 0** — operand shape: last operand = destination; each source evaluated independently; any BLOCK blocks (M79).
- **Step 1** — canonicalize static operands against every effective root (normpath: `.`, `..`, trailing slashes).
- **Step 2** — static-source D2 test: source is an unverified guarded directory or (dir source ⇒ recursive-capable, D2 iv) an ancestor of one → BLOCK, feature's G-state code (M13, M74 — fires before any indeterminacy jump).
- **Step 2b (TSPEC-owned — SE F4-01 hoist, § 4/CF-A):** destination is **static**, its canonicalized path is **not an existing directory and does not end in `/`**, and it names an **existing** guarded file in an unverified guarded directory → BLOCK, feature's G-state code — **source guardedness and source determinacy irrelevant**. This consumes static destination-destruction certainty before the step-3 jump, mirroring M74's source-side principle. Verdict class unchanged versus FSPEC v1.3 (both BLOCK); only the reason code of the indeterminate-source × static-existing-guarded-destination cell refines `INDETERMINATE` → G-state (T-01). M82 unaffected (its destination is indeterminate — step 2b requires a static destination); M84/T-02 now block here (same code as their FSPEC step-4 routing).
- **Step 3** — source or destination indeterminate → D3 (unconditional; M82).
- **Step 4** — all static: resulting path per source = `dest/basename(source)` when dest is an existing directory or spelled with trailing `/`, else `dest`. Resulting path **or** static destination names an existing guarded file in an unverified guarded directory → BLOCK, G-state code (destination-destruction resulting-path arm — T-03; the literal-destination arm is already exhausted by 2b but retained here as specified for the trailing-slash-on-a-file corner).
- **Step 5** — guarded sources: ALLOW iff resulting path stays under the same feature's `docs/{feature}/` subtree (any depth) AND resulting basename still matches `CROSS-REVIEW-*.md`/`CODE_REVIEW-*.md` (M11, M52); else BLOCK (M09, M10, M12). Unguarded static sources that survived 2b/4 fall through to ALLOW.

### 3.6 Git-state verification (`verify_feature` — FSPEC-GUARD-03, G2–G10)

All git invocations: `subprocess.run(["git", "-C", repo_root, …], capture_output=True, text=True)`, no shell. Classification helper applied to every query after G-DP1:

- **Clean absence** = the idiom's not-found result: exit 0 or 1 **with empty stdout and empty stderr** → route as "absent".
- **Query failure** = any other outcome (launch failure, nonzero exit with diagnostics on stderr) → **BLOCK `NOT_COMMITTED`** deterministically (M77 pins the fail-open class; a corrupt ref surfaced by git as clean absence conformantly routes G4/G5).

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
| `PARSE_ERROR` | `pdlc-guard[PARSE_ERROR]: hook stdin was unparseable or missing tool_input.command — the hook input contract is stable, so this indicates a harness fault; failing closed.` |
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
| Python internal exception | Catch-all → `PARSE_ERROR` variant, exit 2 (§ 3.3) | — |
| Recursion depth > 8 | Payload treated as opaque → D1-eligible | RR-3; M73 pins depth 2 |

---

## 4. Carry-Forward Resolutions (iteration-4 Lows) and TSPEC-Owned Test Rows

The REQ matrix is **not** modified (rows remain M01–M86/S01–S07). The three carry-forwards are resolved here, each pinned by a TSPEC-owned test row implemented in `guardMatrix.test.js` alongside the M-rows:

| CF | Source | Resolution |
|---|---|---|
| CF-A | SE FSPEC-v4 F4-01 (reason-code asymmetry: indeterminate source × static existing-guarded destination blocked `INDETERMINATE` though destruction is statically certain; step-3 gloss "(resulting path unknowable)" false for the cell) | **Hoist chosen** (the stronger of the two options SE F4-01 offered): `mv` flow step 2b (§ 3.5.5) consumes static-destination destruction certainty before the D3 jump — the agent gets the harvest/commit message where a harvest hint is provable, honoring the M74 principle for destinations. Verdicts unchanged everywhere (BLOCK either way); the only observable delta is this cell's reason code `INDETERMINATE` → G-state. Re-trace: M82 unaffected (indeterminate destination — 2b requires static), M74 unaffected (step 2 first), M84 same code via 2b, M11/M52 unaffected (destination names no existing file). The FSPEC step-3 gloss needs no REQ/FSPEC edit — 2b makes the gloss true for every operand that still reaches step 3 |
| CF-B | TE FSPEC-v4 F4-01 (the "source guardedness irrelevant" clause of the destruction test has no discriminating row — a guarded-source-exempting implementation passes all 86 rows yet allows a guarded-over-guarded overwrite) | Pinned by **T-02** (step 4/2b before step 5) |
| CF-C | TE FSPEC-v4 F4-02 (the resulting-path arm of the destruction test has no discriminating row — a literal-destination-only implementation passes M84 yet allows the directory-destination collision) | Pinned by **T-03** |

**TSPEC-owned test rows** (default matrix fixture state — G8, unless noted; also added to the G6 re-run parameterization, expectations shown):

| # | Command | Decision | Reason | Under G6 |
|---|---|---|---|---|
| T-01 | `mv "$SRC" docs/f/CROSS-REVIEW-x.md` (`$SRC` unset in-command — indeterminate source; static destination = existing guarded file) | BLOCK | `NOT_COMMITTED` (step 2b; a step-3-first implementation emits `INDETERMINATE` and fails this row) | ALLOW (2b unmet — feature Verified; D3(b) unmet) |
| T-02 | `mv docs/f/CROSS-REVIEW-x.md docs/f/CODE_REVIEW-f-v1.md` (guarded source; destination = existing guarded file; both in default fixture) | BLOCK | `NOT_COMMITTED` (2b/step 4 before step 5 — a guarded-source-exempting implementation reaches step 5's same-subtree/pattern ALLOW and fails) | ALLOW (destruction test unmet; step-5 same-subtree/pattern) |
| T-03 | `mv /tmp/CROSS-REVIEW-x.md docs/f/` (unguarded source, need not exist on disk; destination directory exists → resulting path `docs/f/CROSS-REVIEW-x.md` = existing guarded file) | BLOCK | `NOT_COMMITTED` (step-4 resulting-path arm — a literal-destination-only implementation sees a directory, misses, and falls through to fail) | ALLOW (step 4 unmet; unguarded-source fall-through) |

---

## 5. `check-scope-field.sh` — Design

Minimal diff to the current script; structure, interpreter probe, basename filter (C8 — implements S07), `[ -f "$fp" ]` guard, advisory-JSON emission (C9), and always-exit-0 posture are retained. The interpreter-missing path remains a silent no-op (REQ-GUARD-06 case 3).

Replace the single grep at `check-scope-field.sh:41` (C7) with the three exact REQ-GUARD-04 EREs — **case-sensitive** (no `-i`), any match → silent:

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

### 6.2 Fixture library — `__tests__/helpers/guardFixtures.js` (new; helpers dir is jest-ignored, C14)

```js
/** @typedef {{repoDir:string, bareDir:string|null, branch:string, cleanup:()=>void}} Fixture */

buildFixture(state, opts?) → Fixture   // hermetic; every git op local; no network
runGuard(fixture|null, {command|stdinRaw, stdinCwd?, spawnCwd?, env?}) → {exitCode, stdout, stderr}
  // assembles stdin JSON ({tool_input:{command}, cwd: stdinCwd?}) or passes stdinRaw verbatim;
  // wraps runHookScript with env merge; CLAUDE_PROJECT_DIR set to repoDir by default,
  // overridable/unsettable via env: {CLAUDE_PROJECT_DIR: undefined}  (C11 — M85/M86)
degradedEnv() → {PATH: <empty mkdtemp dir>}   // restricted PATH for M42–M43, M68–M72; empty dir, not /var/empty (Linux CI portability)
expectBlock(res, reason)  // exitCode===2 && stderr.startsWith(`pdlc-guard[${reason}]`)
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
| `M77` | default + overwrite `.git/refs/remotes/origin/feat-f` with garbage bytes |
| `nested` | default + `docs/f/2024-notes/CROSS-REVIEW-x.md` (M67) |
| `secondRepo` | additional guarded-directory-free `git init` repo (M86) |

Hermeticity invariants (REQ-GUARD-05): no network I/O anywhere — the only remote is the local bare fixture or an invalid path; all temp trees under `mkdtempSync` with `afterEach` cleanup; fixture git commands set `user.name`/`user.email` locally and use `-c protocol.file.allow=always` where a file-remote push requires it.

### 6.3 Matrix binding — `guardMatrix.test.js` (new)

One asserting test per row, test title = row ID (auditable by grep). Structure: a literal `MATRIX` table (array of `{id, state, command|stdin, stdinCwd, spawnCwd, env, expect: {exit, reason}}`) driving `it.each`, with dedicated `it()` blocks for rows needing bespoke orchestration. Grouping:

| Describe block | Rows | Fixture/controls |
|---|---|---|
| D2 statics, verbs, compounds | M01–M07, M09–M19, M44–M54, M60–M63, M67 (nested), M79 | default G8; commands verbatim from REQ rows |
| D3/D4 indeterminates | M08, M20–M21, M24–M25, M46, M55–M56, M82 | default G8 |
| D1 / NFR-01 allows | M22–M23, M26–M31, M32, M73 | default G8 (M22/M23/M73 are blocks — grouped here as opaque-recursion set) |
| cwd-union rows | M17 (same-call `cd`), M64 (stdinCwd=`docs/f`), M65 (no cwd signal, spawnCwd=repo root → allow), M66/M80 (spawnCwd=`docs/f`, `CLAUDE_PROJECT_DIR`=repo root), M85 (`CLAUDE_PROJECT_DIR` unset via `undefined`, spawnCwd=repo), M86 (`CLAUDE_PROJECT_DIR` unset, stdinCwd=repo, spawnCwd=secondRepo) | per-row controls (C10/C11) |
| Git-state rows | M34–M40, M57–M59, M77 | state builders § 6.2; M40/M59 set `GUARD_FETCH_BEFORE_CHECK=true` (+`GUARD_FETCH_TIMEOUT_SECS=5` for M59) |
| Non-repo rows | M37, M75, M76, M83 (stdinCwd=non-repo dir, spawnCwd=repo) | `G1` fixture |
| Contract rows | M41 (both `not-json{` and empty variants asserted in the one row-test), M78, M81 | stdinRaw control |
| Degraded rows | M42–M43, M68–M72 | `degradedEnv()`; M71 stdinRaw `not-json{"cmd":"rm docs/f"}`; M72 empty stdin |
| **M33 G6 re-run** | one parameterized `it.each` over the REQ-listed IDs — M01, M02, M04–M24, M44–M54, M60–M64, M66–M67, M73–M74, M79–M80, M82, M84–M86 — each re-run against a `G6` fixture with its own row controls, expecting ALLOW | `G6` (+nested/secondRepo variants where the base row needs them) |
| **TSPEC rows** | T-01, T-02, T-03 (§ 4) + their G6-allow re-runs appended to the M33 parameterization | default G8 / `G6` |
| Suite self-audit | one meta-test asserting the `MATRIX` id set is exactly `{M01…M86} ∪ {S-rows delegated} ∪ {T-01…T-03}` and the M33 expansion list matches the REQ enumeration — a deleted row cannot silently drop coverage | — |

Oracle discipline: `expectBlock` asserts exit 2 + the `pdlc-guard[<REASON>]` prefix; rows with required substrings additionally assert them (M35: `git push -u origin`; M58: `git fetch`; NOT_COMMITTED rows: `LEARNINGS-f.md`) — never full prose (REQ-GUARD-07).

### 6.4 S-rows — in `hookCompatibility.test.js`

S01–S07 as seven `it()` tests (title = row ID) in a new describe block beside the retained PROP-COMPAT-04 suite, reusing its tmpdir/writeFileSync pattern (C13). Oracle: silent = exit 0 + empty stdout; warning = exit 0 + stdout containing `hookSpecificOutput` and `Scope`. S07 writes `notes.md` (basename filter branch).

### 6.5 PROP-COMPAT-05 migration (REQ-GUARD-05 migration note)

The `hookCompatibility.test.js:156–244` block (C12) is **deleted** — its assertions assume behavior this feature inverts — and replaced by a comment pointing here. Assertion-level mapping:

| Old assertion | Disposition |
|---|---|
| Non-repo tmpdir, `rm CROSS-REVIEW…`, no LEARNINGS → blocks with `pdlc guard` message | Superseded: the non-repo cell is now **M37** (`NO_REPO`); the in-repo no-LEARNINGS cell is **M01** (`NOT_COMMITTED`). Old stderr oracle `pdlc guard` becomes the `pdlc-guard[` prefix |
| Disk-only `LEARNINGS-*.md` alongside → **allows** | **Inverted by the REQ**: disk-only is G8 → **M01 blocks**; any-`LEARNINGS-*` globbing is retired by G9 → **M36**. The allow-side successor is the **M33/G6** re-run set (committed **and pushed**) |
| `rm CODE_REVIEW…`, no LEARNINGS → blocks | Superseded by **M06**-adjacent coverage (M01's CODE_REVIEW twin lives in the D2 group) and M37 for the old non-repo cwd |

PROP-COMPAT-04 is untouched. The PROPERTIES document (te-author, downstream) should retire the PROP-COMPAT-05 property ID in favor of matrix-bound properties.

---

## 7. Requirements → Components Traceability

| Requirement | Implementing component(s) | Tests |
|---|---|---|
| REQ-GUARD-01 (parsing, D1–D4, union cwd) | §§ 3.4–3.5 (`strip_heredocs`, `segment`, `tokenize`, `identify_verb`, `classify_operands`, `EffectiveCwd`, `resolve_static`, `decide`) | M01–M03, M17–M32, M44–M51, M55, M63–M66, M73, M80, M85–M86 |
| REQ-GUARD-02 (verb set, mv, redirection) | §§ 3.5.1, 3.5.2, 3.5.5 (`mv_flow`, redirection classifier) | M04–M16, M52–M54, M56, M60–M62, M67, M74, M79, M82, M84, T-01–T-03 |
| REQ-GUARD-03 (git-state matrix, thresholds) | § 3.6 (`verify_feature`, G-DP1 in `decide`) | M33–M40, M57–M59, M75–M77, M83 |
| REQ-GUARD-06 (degraded policy) | §§ 3.1–3.2, 3.4 (wrapper order, coarse matcher, intake gate) | M41–M43, M68–M72, M78, M81 |
| REQ-GUARD-07 (message catalog) | § 3.7 (`emit_block`) | reason-code assertion of every BLOCK row |
| REQ-GUARD-04 (scope patterns) | § 5 | S01–S07 |
| REQ-GUARD-05 (matrix-driven tests) | § 6 | the suite itself + self-audit meta-test |
| REQ-GUARD-NFR-01 (no false blocks) | D1 precedence in `decide` (§ 3.5.4 step 1) — structural guarantee | M26–M31 (worst-case fixtures) |

---

## 8. Open Questions

None. All REQ/FSPEC review iterations are dispositioned upstream; the three iteration-4 carry-forwards are resolved in § 4.

---

## 9. Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-02 | Initial TSPEC from REQ v1.6 + FSPEC v1.3: bash-wrapper + embedded-Python architecture with builtins-only degraded path; parsing-engine decomposition (scanner tokenizer, verb identification with opaque recursion cap 8, union-cwd tracking, D1→G-DP1→D2→D3→D4 engine); `ls-tree`/`show-ref` git idioms honoring the failure-vs-absence boundary; exact reason-code message catalog; scope-check P1–P3 greps; matrix-driven test architecture with hermetic G1–G10 fixture builders and PROP-COMPAT-05 migration; iteration-4 carry-forwards resolved (SE F4-01 hoist as `mv` step 2b; TE F4-01/F4-02 pinned) with TSPEC-owned rows T-01–T-03 |
