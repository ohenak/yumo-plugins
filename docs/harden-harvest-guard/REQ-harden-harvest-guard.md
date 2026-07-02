---
Status: Draft
Author: pm-author
Version: 1.1
Feature: harden-harvest-guard
ready: true
depends-on: []
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | [CROSS-REVIEW-software-engineer-REQ.md](CROSS-REVIEW-software-engineer-REQ.md), [CROSS-REVIEW-test-engineer-REQ.md](CROSS-REVIEW-test-engineer-REQ.md) |
| LEARNINGS | docs/harden-harvest-guard/LEARNINGS-harden-harvest-guard.md |

# REQ — harden-harvest-guard

Make the pdlc hook layer fail closed. Today `guard-harvest-before-delete.sh` only blocks deletions whose command text contains the literal tokens `CROSS-REVIEW`/`CODE_REVIEW` and only for `rm`/`unlink`/`git rm` — so `rm docs/{feature}/*.md`, `find -delete`, `git clean`, and `mv` all bypass it, and the guard passes when LEARNINGS merely exists on disk (uncommitted). It also fails **open** when no Python interpreter is found (`guard-harvest-before-delete.sh:21`) or when its stdin JSON is unparseable (`:30`). `check-scope-field.sh` greps the substring `scope` anywhere in the file, so unrelated prose false-passes. The hooks exist to protect process artifacts; right now they protect only against the politest possible deletion.

---

## Background

The Harvest phase (Phase H) distills `CROSS-REVIEW-*` / `CODE_REVIEW-*` files into `LEARNINGS-{feature}.md` and then deletes them. Two hooks defend this:

- `guard-harvest-before-delete` (PreToolUse: Bash) — meant to block deletion until LEARNINGS is committed and pushed.
- `check-scope-field` (PostToolUse: Write|Edit) — meant to warn when a review doc lacks a `Scope:` field.

Gap review findings (2026-07-01): guard is trivially bypassed by glob deletion or non-`rm` verbs (`guard-harvest-before-delete.sh:35,37`); guard checks disk existence not commit state (`:52`); guard fails open on missing interpreter (`:21`) and unparseable stdin (`:30`); scope check matches `scope` as a bare substring (`check-scope-field.sh:41`).

### Definitions (used throughout)

| Term | Definition |
|---|---|
| **Guarded file** | A file matching `CROSS-REVIEW-*.md` or `CODE_REVIEW-*.md` under a `docs/{feature}/` directory. |
| **Guarded directory** | A `docs/{feature}/` directory containing at least one guarded file. |
| **Feature name derivation** | `{feature}` is the basename of the guarded directory (the immediate parent directory of the guarded files). The guard requires the exact filename `LEARNINGS-{feature}.md` in that directory's committed tree — a sibling `LEARNINGS-<anything-else>.md` does NOT satisfy the guard. |
| **Verified** | The guarded directory's `LEARNINGS-{feature}.md` passes REQ-GUARD-03 for the current git state. |
| **Unverified guarded directory** | A guarded directory that is not Verified. |
| **Deletion verb** | One of the defended verbs enumerated in REQ-GUARD-02. |
| **Deletion-shaped command** | A command in which a deletion verb is visible in executable position per the REQ-GUARD-01 parsing discipline (including inside recursively scanned `eval`/`bash -c`/`sh -c`/`xargs` payloads). |

---

## Scope

### In Scope

- Rewrite `guard-harvest-before-delete.sh` matching and verification logic (parsing discipline, decision rules D1–D4, git-state verification, message catalog)
- Degraded-environment policy: interpreter-missing and unparseable-stdin paths brought under the fail-closed posture (REQ-GUARD-06)
- Anchor `check-scope-field.sh` to an actual `Scope:` field (exact accepted patterns)
- Unit-style tests for both hook scripts (bash + git fixtures, runnable in CI, hermetic — no network), including migration of the existing PROP-COMPAT-05 assertions this REQ obsoletes

### Out of Scope

- New hooks or hook events
- Changes to harvest-learnings SKILL.md ordering rules (prompt already correct)
- Blocking non-Bash deletion vectors (Write-tool truncation) — PostToolUse cannot veto; documented as residual risk RR-W
- Deletion spelled via verbs outside the REQ-GUARD-02 set (e.g. `rsync --delete`, `perl -e 'unlink'`, `python -c "os.remove(...)"`, `cp /dev/null f`, `dd of=f`, `sed -i`, `shred`) — documented as residual risk RR-1
- Changes to orchestrate-dev.js phase ordering (separate feature: harvest-after-pub)

### Assumptions

- Hooks remain POSIX-compatible bash. The guard's parsing/verification logic depends on a **Python 3 interpreter** — this is an *existing* dependency of both current scripts (JSON parsing), retained, not a new one. Runtime dependencies are therefore: bash, git, and Python 3, with a specified degraded mode when Python is absent (REQ-GUARD-06). *(Corrects v1.0's inaccurate "no runtime dependencies beyond git".)*
- Hook stdin contract (JSON with `tool_input.command` / `tool_input.file_path`) is stable per Claude Code hook API. Because it is stable, malformed stdin is treated as an anomaly and fails closed (REQ-GUARD-06), not ignored.
- The pdlc pipeline always runs inside a git checkout; a non-repo cwd is not a legitimate pipeline context (see REQ-GUARD-03 git-state matrix).

### Residual Risk Register

The guard is a backstop, not a sandbox. The first line of defense remains the harvest-learnings SKILL.md prompt discipline (commit + push LEARNINGS before deleting). The following bypass vectors are **accepted residual risk**, listed so nobody mistakes the guard for a complete containment boundary:

| ID | Residual risk | Rationale for accepting |
|---|---|---|
| RR-W | Write-tool truncation of a guarded file | PostToolUse hooks cannot veto; would require a new hook event (out of scope). |
| RR-1 | Deletion via verbs outside the REQ-GUARD-02 set (`rsync --delete`, interpreter one-liners, `cp /dev/null`, `dd of=`, `sed -i`, `shred`, …) | Full coverage requires interpreting arbitrary program semantics. The defended set covers every spelling a harvest agent realistically produces; extending further multiplies false-block surface against NFR-01 (P0). |
| RR-2 | Indeterminate deletion with no textual `docs` reference in the same command (e.g. `rm "$D"/*.md` where `$D` was set in a *previous* Bash tool call) | Blocking every variable-expanded delete repo-wide would false-block routine work (temp-file cleanup) whenever any feature is mid-pipeline — a direct NFR-01 violation. Decision rule D3's `docs`-reference discriminator catches all in-context spellings. |
| RR-3 | Fully opaque execution with no visible deletion verb (`eval "$CMD"`) | No deletion verb is observable anywhere in executable position; blocking all `eval`/`bash -c` would violate NFR-01. Guaranteed by decision rule D1. |

---

## User Stories

| ID | Story |
|---|---|
| US-01 | As a pdlc user, I want Bash deletion of files under `docs/{feature}/` — spelled with any defended deletion verb, or deletion-shaped with targets the guard cannot statically resolve — to be blocked unless the feature's LEARNINGS is committed and pushed, so that process artifacts cannot be destroyed before their signal is durably preserved. Deletion spelled via undefended verbs is accepted residual risk (RR-1), documented, not silently assumed away. |
| US-02 | As a pdlc user, I want the guard to recognize deletion however it is spelled within the defended verb set (globs, `find -delete`, `git clean`, `mv` out of the tree, redirection truncation, compound commands, wrappers like `xargs`/`bash -c`), so that the protection does not depend on the deleting agent's phrasing. |
| US-03 | As a pdlc maintainer, I want the scope-field warning to fire only on a genuinely missing `Scope:` field, so that the nudge is a signal rather than noise. |
| US-04 | As a pdlc maintainer, I want hook behavior covered by tests that assert an enumerated block/allow matrix, so that future edits cannot silently reopen the bypass. |
| US-05 | As a pdlc maintainer, I want the guard's behavior defined when its runtime is degraded (no Python interpreter, malformed hook stdin), so that the hardening does not silently vanish on constrained machines. |

---

## Requirements

### Domain: GUARD — Deletion Guard

#### REQ-GUARD-01
**Title:** Parsing discipline and fail-closed decision rules

**Description:** The guard SHALL decide based on the *target paths* a command can affect, determined by the parsing discipline below — never by the mere presence of literal filename tokens anywhere in the command text.

**Parsing discipline (what the guard inspects):**

1. **Quote/heredoc-aware segmentation.** The command is split into simple commands at unquoted `;`, `&&`, `||`, `|`, `&`, and newlines. Content inside single quotes, double quotes, and heredoc bodies is data and is never scanned for verbs or paths — with one exception: the string payload of an opaque-execution verb (`eval`, `bash -c`, `sh -c`) is code and is recursively re-parsed under this same discipline.
2. **Verb identification.** The verb of each simple command is its first word after skipping leading `NAME=value` assignments and transparent prefixes (`command`, `env`, `sudo`, `nice`, `time`). `xargs <verb>` exposes `<verb>` as the effective verb whose operands are the piped input (always indeterminate). `find` with `-delete` or `-exec <deletion-verb>` is a deletion form whose operands are `find`'s path roots.
3. **Operand scoping.** Only operands (non-flag argv tokens) of deletion verbs are inspected as candidate paths. Tokens inside arguments of non-deletion verbs (e.g. the message string of `git commit -m "..."`, arguments to `echo`, `grep` patterns) NEVER trigger the guard.
4. **Effective-cwd tracking.** `cd <static-path>` segments update the effective cwd for subsequent segments in the same compound command; `cd` with an indeterminate argument makes all subsequent relative operands indeterminate.
5. **Operand classification.** An operand is **static** if it contains no unquoted `$`, backtick, `$(`, or `<(`; static operands and globs are resolved/expanded against the effective cwd. Any other operand is **indeterminate**.

**Decision rules (in order; first match wins):**

- **D1 — No visible deletion verb → ALLOW.** If no deletion verb appears in executable position in any segment (including recursively scanned opaque payloads), the command is allowed unconditionally. This rule has precedence and is the mechanism by which REQ-GUARD-NFR-01 and REQ-GUARD-01 coexist: free text can never trigger a block.
- **D2 — Static guarded target → BLOCK.** A deletion verb with a static operand that resolves to, or globs over, any path inside an unverified guarded directory is blocked (reason code per REQ-GUARD-03 state).
- **D3 — Indeterminate deletion, docs-referencing → BLOCK.** A deletion verb with at least one indeterminate operand is blocked with reason `INDETERMINATE` iff **(a)** the compound command contains an unquoted path token beginning with or containing the segment `docs/` (in any segment, including a `cd` argument), AND **(b)** at least one unverified guarded directory exists in the repo. Otherwise it is allowed (residual risk RR-2).
- **D4 — Pathspec-less `git clean` → BLOCK.** `git clean` with no pathspec targets every untracked file repo-wide; it is blocked with reason `INDETERMINATE` iff any unverified guarded directory exists. The `docs`-reference qualifier of D3 is waived because the target scope is repo-wide by construction. *(Answers reviewer question TE-Q-02.)*

A deletion verb aimed at a `docs/` directory that contains **no** guarded files is unguarded — allowed even when its operands are only partially resolvable, because D2/D3 both require an unverified guarded directory to exist. *(Answers reviewer question SE-Q-02.)*

**Acceptance criteria:**
- **Who:** harvest agent / **Given:** `docs/f/CROSS-REVIEW-x.md` exists and LEARNINGS is not committed / **When:** it runs `rm docs/f/*.md` / **Then:** exit 2, message carries reason code per REQ-GUARD-03 state (D2).
- **Who:** harvest agent / **Given:** same state / **When:** it runs `rm docs/f/CROSS-REVIEW-x.md` / **Then:** blocked (existing behavior preserved, D2).
- **Who:** any agent / **Given:** same state / **When:** it runs `rm src/foo.ts` / **Then:** allowed — no guarded target (D2 miss, no indeterminate operand).
- **Who:** harvest agent / **Given:** same state / **When:** `cd docs/f && rm *.md` / **Then:** blocked — effective-cwd tracking resolves `*.md` under `docs/f` (D2).
- **Who:** harvest agent / **Given:** same state / **When:** `rm $(find docs/f -name 'CROSS-*')` / **Then:** blocked, reason `INDETERMINATE` (D3: command substitution + `docs/` token).
- **Who:** harvest agent / **Given:** same state / **When:** `ls docs/f | xargs rm` / **Then:** blocked, reason `INDETERMINATE` (D3: `xargs rm` = deletion verb with indeterminate operands + `docs/` token).
- **Who:** harvest agent / **Given:** same state / **When:** `bash -c 'rm docs/f/*.md'` or `eval "rm docs/f/*.md"` / **Then:** blocked — opaque payload recursively parsed (D2 inside payload).
- **Who:** harvest agent / **Given:** same state / **When:** `D=docs/f; rm "$D"/*.md` / **Then:** blocked, reason `INDETERMINATE` (D3: indeterminate operand + unquoted `docs/` token in same compound).
- **Who:** any agent / **Given:** same state / **When:** `rm "$SCRATCH"/*.log` (no `docs` token anywhere in the command) / **Then:** allowed (D3 condition (a) unmet — RR-2).
- **Who:** any agent / **Given:** same state / **When:** `eval "$CMD"` / **Then:** allowed (D1 — no visible deletion verb; RR-3).

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01, US-02

#### REQ-GUARD-02
**Title:** Deletion-verb coverage, `mv` semantics, and redirection

**Description:** The **defended deletion verbs** are exactly: `rm`, `unlink`, `git rm`, `git clean`, `find … -delete`, `find … -exec <deletion-verb>`, `mv` (per the semantics below), `truncate`, and shell redirection `>` / `2>` whose target is a guarded file. Verbs may appear in any segment of a compound command (`;`, `&&`, `||`, `|`, `&`, newline) and inside `xargs` / `eval` / `bash -c` / `sh -c` payloads per the REQ-GUARD-01 discipline. This is an enumerated defense, not a completeness claim — undefended verbs are residual risk RR-1 (see Residual Risk Register), and US-01 is scoped accordingly.

**`git clean` rationale:** `git clean` only removes *untracked* files, and guarded files are normally committed — but `CODE_REVIEW-*` files written during Phase DOD and `CROSS-REVIEW-*` files mid-review are legitimately untracked at points in the pipeline. The verb is defended to protect exactly those not-yet-committed review artifacts; TSPEC must not treat its inclusion as arbitrary.

**`mv` semantics** (all paths canonicalized — `.`, `..`, trailing slashes resolved — against the effective cwd before comparison):

| Case | Decision |
|---|---|
| Source is/globs a guarded file in an unverified guarded dir; destination outside that feature's `docs/{feature}/` dir (incl. `/tmp`, `/dev/null`, `docs/{other-feature}/`, repo root) | BLOCK — move-out is deletion |
| Same source; destination inside the same feature dir AND destination basename still matches `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md` | ALLOW — rename in place preserves the guarded artifact *(answers reviewer question SE-Q-01)* |
| Same source; destination inside the same feature dir but basename no longer matches the guarded pattern | BLOCK — pattern-destroying rename is equivalent to deletion |
| Source is an unverified guarded directory itself (`mv docs/f <anywhere>`) | BLOCK — the path anchor and its LEARNINGS-verification context move |
| Indeterminate source or destination | Decision rule D3 applies |

**Redirection semantics:** unquoted `>` or `2>` whose static target resolves to a guarded file in an unverified guarded directory → BLOCK (truncation is deletion). `>>` (append) is not destructive → ALLOW. Indeterminate redirection target → deletion-shaped, D3 applies.

**Acceptance criteria:**
- **Who:** agent / **Given:** guarded files present in `docs/f`, LEARNINGS unverified / **When:** `find docs/f -name 'CROSS-*' -delete`, `find docs/f -name '*.md' -exec rm {} \;`, `git clean -fd docs/f`, `truncate -s 0 docs/f/CROSS-REVIEW-x.md`, or `mv docs/f/CODE_REVIEW-f-v1.md /tmp/` / **Then:** blocked.
- **Who:** agent / **Given:** same state / **When:** `git clean -fd` with no pathspec / **Then:** blocked, reason `INDETERMINATE` (D4).
- **Who:** agent / **Given:** same state / **When:** `mv docs/f/CROSS-REVIEW-x.md docs/f/CROSS-REVIEW-x-v2.md` / **Then:** allowed (rename in place, pattern preserved).
- **Who:** agent / **Given:** same state / **When:** `mv docs/f/CROSS-REVIEW-x.md docs/f/notes.md` or `mv docs/f/CROSS-REVIEW-x.md docs/other-feature/` or `mv docs/f docs/f-old` / **Then:** blocked.
- **Who:** agent / **Given:** same state / **When:** `> docs/f/CROSS-REVIEW-x.md` / **Then:** blocked; **When:** `echo note >> docs/f/CROSS-REVIEW-x.md` / **Then:** allowed.
- **Who:** agent / **Given:** same state / **When:** `echo done && rm docs/f/*.md` or `rm docs/f/*.md || true` / **Then:** blocked (compound-command segments each parsed).
- **Who:** agent / **Given:** LEARNINGS committed and pushed (Verified) / **When:** any command above / **Then:** allowed.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

#### REQ-GUARD-03
**Title:** Committed-and-pushed LEARNINGS verification with full git-state matrix

**Description:** For a guarded directory `docs/{feature}/`, the guard SHALL verify that the exact file `LEARNINGS-{feature}.md` (feature name derived from the directory basename — see Definitions) is present in the committed tree of the current branch's remote-tracking ref (`origin/{branch}`), e.g. via `git cat-file -e origin/{branch}:docs/{feature}/LEARNINGS-{feature}.md`. Disk presence alone SHALL NOT satisfy the guard. Behavior for every git state is fixed by this matrix:

| # | Git state | Decision | Reason code |
|---|---|---|---|
| G1 | cwd is not a git repository | BLOCK | `NO_REPO` — fail closed; the pipeline always runs in a checkout, so a non-repo cwd cannot prove commit state *(answers reviewer question TE-Q-01)* |
| G2 | Repo with **no remote** configured | Fallback: `LEARNINGS-{feature}.md` present in `HEAD` tree → ALLOW; else BLOCK | `NOT_COMMITTED` |
| G3 | **Detached HEAD** (no current branch) | Same fallback as G2 (HEAD-tree check) — CI runs detached on already-pushed commits | `NOT_COMMITTED` |
| G4 | Remote `origin` exists but `origin/{branch}` ref does not (branch never pushed); LEARNINGS in `HEAD` | BLOCK, message includes `git push -u origin {branch}` | `NOT_PUSHED` |
| G5 | Same as G4 but LEARNINGS not in `HEAD` either | BLOCK | `NOT_COMMITTED` |
| G6 | `origin/{branch}` exists and contains `LEARNINGS-{feature}.md` | ALLOW | — |
| G7 | `origin/{branch}` exists; LEARNINGS in `HEAD` only (committed, not pushed) | BLOCK | `NOT_PUSHED` |
| G8 | LEARNINGS on disk only (not committed anywhere) | BLOCK | `NOT_COMMITTED` |
| G9 | `LEARNINGS-{other}.md` present/committed but `LEARNINGS-{feature}.md` absent (name mismatch) | BLOCK | `NOT_COMMITTED` |
| G10 | Genuinely pushed but local remote-tracking ref is **stale** | With `GUARD_FETCH_BEFORE_CHECK=false` (default): BLOCK — accepted false block; message includes a `git fetch origin` hint. With `true`: guard fetches, then re-evaluates → ALLOW | `NOT_PUSHED` |

The G2/G3 fallback to committed-in-`HEAD` is an accepted, documented degradation of the "pushed" guarantee: in remoteless/detached contexts, local commit is the strongest verifiable state, and permanent blocking would make those checkouts unusable.

**Threshold declarations:**
- **`GUARD_FETCH_BEFORE_CHECK`** — whether the guard runs `git fetch origin {branch}` before the check. Default: `false` (trust the last fetch). Owner: hook script constant. Documented consequence of `false`: state G10 false-blocks until the next fetch.
- **`GUARD_FETCH_TIMEOUT_SECS`** — timeout for that fetch when enabled. Default: `10`. Owner: hook script constant. On fetch failure/timeout the guard proceeds with the existing local ref state (as if `false`) — network trouble alone never changes the decision class.

**Acceptance criteria:**
- **Who:** harvest agent / **Given:** LEARNINGS written to disk but not committed (G8) / **When:** it deletes a guarded file / **Then:** blocked, reason `NOT_COMMITTED`.
- **Who:** harvest agent / **Given:** LEARNINGS committed on the branch but not pushed; `origin/{branch}` exists (G7) / **When:** deletion / **Then:** blocked, reason `NOT_PUSHED`.
- **Who:** harvest agent / **Given:** LEARNINGS committed and present on `origin/feat-f` (G6) / **When:** deletion / **Then:** allowed.
- **Who:** harvest agent / **Given:** repo has no remote; LEARNINGS committed in `HEAD` (G2) / **When:** deletion / **Then:** allowed.
- **Who:** harvest agent / **Given:** detached HEAD; LEARNINGS in `HEAD` tree (G3) / **When:** deletion / **Then:** allowed.
- **Who:** harvest agent / **Given:** `origin` exists, branch never pushed, LEARNINGS committed (G4) / **When:** deletion / **Then:** blocked, message contains `git push -u origin`.
- **Who:** any agent / **Given:** cwd is not a git repository, guarded file present on disk (G1) / **When:** deletion / **Then:** blocked, reason `NO_REPO`.
- **Who:** harvest agent / **Given:** `docs/f` contains committed `LEARNINGS-other.md` but no `LEARNINGS-f.md` (G9) / **When:** deletion of `docs/f/CROSS-REVIEW-x.md` / **Then:** blocked, reason `NOT_COMMITTED`.
- **Who:** harvest agent / **Given:** `GUARD_FETCH_BEFORE_CHECK=true`, LEARNINGS pushed to a local bare `origin` fixture, local remote-tracking ref stale (G10) / **When:** deletion / **Then:** guard fetches and allows.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01

#### REQ-GUARD-06
**Title:** Degraded-environment policy (interpreter missing, stdin unparseable)

**Description:** The guard's fail-closed posture SHALL survive runtime degradation:

1. **No usable Python interpreter** (current `guard-harvest-before-delete.sh:21` exits 0): the guard SHALL fall back to a **coarse conservative matcher in pure bash**: if the raw command text matches a deletion-verb token AND contains `docs/`, `CROSS-REVIEW`, or `CODE_REVIEW`, BLOCK with reason `DEGRADED` and a message naming the missing interpreter; otherwise allow. Degraded mode intentionally trades false-blocks for containment; REQ-GUARD-NFR-01's no-false-block guarantee applies **only when an interpreter is present**, and the `DEGRADED` message says how to restore full fidelity (install `python3`).
2. **Unparseable or empty stdin JSON** (current `:30` exits 0): BLOCK with reason `PARSE_ERROR`. The hook stdin contract is stable (see Assumptions), so malformed input signals a harness bug or tampering — fail closed.
3. `check-scope-field.sh` is advisory by design (never blocks); its interpreter-missing path remains a silent no-op. Only the blocking guard is subject to this requirement.

**Acceptance criteria:**
- **Who:** any agent / **Given:** PATH restricted so no `python3`/`python`/`py` resolves; guarded file mentioned / **When:** `rm docs/f/CROSS-REVIEW-x.md` / **Then:** blocked, reason `DEGRADED`.
- **Who:** any agent / **Given:** same restricted PATH / **When:** `ls -la src/` / **Then:** allowed (coarse matcher does not match).
- **Who:** any agent / **Given:** hook invoked with stdin `not-json{` or empty / **When:** hook runs / **Then:** exit 2, reason `PARSE_ERROR`.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-05

#### REQ-GUARD-07
**Title:** Canonical message catalog (reason codes)

**Description:** Every block (exit 2) SHALL write to stderr a message beginning with the stable prefix `pdlc-guard[<REASON>]:` where `<REASON>` is exactly one of:

| Reason code | Fires when | Required message content (substring oracle) |
|---|---|---|
| `NOT_COMMITTED` | LEARNINGS-{feature}.md absent from the applicable tree (G2/G3/G5/G8/G9) | the expected filename `LEARNINGS-{feature}.md` and the instruction to run `/pdlc:harvest-learnings` and commit |
| `NOT_PUSHED` | LEARNINGS committed but absent from `origin/{branch}` (G4/G7/G10) | `git push` (G4 additionally: `git push -u origin`); G10 path additionally: `git fetch` hint |
| `INDETERMINATE` | Decision rule D3 or D4 | the unresolvable operand or `git clean` scope, and the fail-closed rationale |
| `NO_REPO` | Git state G1 | statement that commit state cannot be verified outside a git repository |
| `PARSE_ERROR` | REQ-GUARD-06 case 2 | statement that hook stdin was unparseable |
| `DEGRADED` | REQ-GUARD-06 case 1 | the missing-interpreter cause and `python3` as the remedy |

Exact prose beyond the prefix and required substrings is owned by TSPEC. Tests SHALL assert on the `pdlc-guard[<REASON>]` prefix plus the required substrings — never on full prose. *(Resolves the two-different-messages ambiguity: the reason code, not one canonical sentence, is the oracle.)*

**Acceptance criteria:**
- **Who:** maintainer / **Given:** any blocking scenario in the Canonical Block/Allow Matrix / **When:** the guard blocks / **Then:** stderr starts with `pdlc-guard[` and carries exactly the matrix row's reason code.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01, US-04, US-05

### Domain: GUARD — Scope Field Check

#### REQ-GUARD-04
**Title:** Anchored Scope-field detection with enumerated patterns

**Description:** `check-scope-field.sh` SHALL stay silent iff the written `CROSS-REVIEW-*` / `CODE_REVIEW-*` file matches at least one of these exact patterns (POSIX ERE, case-sensitive on `Scope`):

| # | Pattern (ERE) | Accepts |
|---|---|---|
| P1 | `^[[:space:]]*Scope:` | Plain field line — frontmatter or prose line `Scope: Local` |
| P2 | `^[[:space:]]*\*\*Scope(\*\*:|:\*\*)` | Bold markdown — `**Scope:** Local` and `**Scope**: Local` |
| P3 | `\|[[:space:]]*Scope[[:space:]]*\|` | Table header cell `Scope` — including mid-row position, e.g. `\| ID \| Severity \| Scope \| Finding \|` (deliberately not line-anchored) |

Substring matches inside prose (e.g. "telescope", "the scope of this change") SHALL NOT count. Lowercase `scope:` SHALL NOT count (case-sensitive field name).

**Acceptance criteria:**
- **Who:** reviewer agent / **Given:** a CROSS-REVIEW containing the word "telescope" and the prose "the scope of this change", but no pattern match / **When:** hook fires / **Then:** warning emitted.
- **Who:** reviewer agent / **Given:** file contains `Scope: Local` on its own line (P1) / **When:** hook fires / **Then:** silent.
- **Who:** reviewer agent / **Given:** file contains `**Scope:** Cross-Feature` (P2) and no other pattern / **When:** hook fires / **Then:** silent.
- **Who:** reviewer agent / **Given:** file's only Scope appearance is the findings-table header `| ID | Severity | Scope | Finding |` (P3) and no frontmatter line / **When:** hook fires / **Then:** silent.
- **Who:** reviewer agent / **Given:** file contains only lowercase `scope: Local` / **When:** hook fires / **Then:** warning emitted (negative AC for case-sensitivity).

**Priority:** P1 · **Phase:** 1 · **Stories:** US-03

### Domain: GUARD — Tests

#### REQ-GUARD-05
**Title:** Hook regression tests driven by the block/allow matrix

**Description:** Both hook scripts SHALL have automated tests asserting **every row of the Canonical Block/Allow Matrix (below)** — command × git-state → expected exit code + reason-code substring. The matrix, carried forward into FSPEC/PROPERTIES, is the durable oracle; "failing-before/passing-after" is a development-process practice during implementation, not an acceptance criterion. Tests live in the existing jest harness (`pdlc/workflows/__tests__/hookCompatibility.test.js` pattern, `runHookScript`) — not a new shell harness *(answers reviewer question TE-Q-03)*.

**Test-environment requirements:**
- Fixtures scaffold real git state hermetically: `git init` working repo + `git init --bare` local `origin`, with commit/push performed in the fixture — **no network access**. Every REQ-GUARD-03 matrix row (G1–G10, including the `GUARD_FETCH_BEFORE_CHECK=true` path) is exercisable against these fixtures.
- Tests require bash and python3 on the runner (skip pattern as today when bash is absent); the REQ-GUARD-06 degraded-mode cases are exercised via a restricted `PATH`.
- **Migration note:** the existing PROP-COMPAT-05 assertions in `hookCompatibility.test.js` assume a non-repo tmpdir and assert that disk-only `LEARNINGS-*.md` allows deletion — behavior this REQ inverts (G1 blocks; disk-only is G8, blocks). Those assertions SHALL be migrated to the new matrix rows, not kept alongside them.

**Acceptance criteria:**
- **Who:** maintainer / **Given:** the repo checkout with bash + python3 / **When:** they run the test suite via a single command / **Then:** every row of the Canonical Block/Allow Matrix has exactly one asserting test, and all pass.
- **Who:** maintainer / **Given:** the same checkout / **When:** the suite runs / **Then:** no test performs network I/O (pushed-state rows use the local bare-origin fixture).

**Priority:** P0 · **Phase:** 1 · **Stories:** US-04

### Domain: NFR

#### REQ-GUARD-NFR-01
**Title:** No false blocks on non-deletion commands

**Description:** With an interpreter present (see REQ-GUARD-06 for the degraded exception), the guard SHALL NOT block any command with no deletion verb in executable position — guaranteed structurally by decision rule D1. In particular, guarded tokens appearing as **data** (quoted strings, heredocs, arguments to non-deletion verbs) never trigger. The discrimination rule between fail-closed (REQ-GUARD-01) and this requirement is: *fail-closed applies only within a simple command whose command-position verb is a defended deletion verb; everything else is allowed by D1*. There is no precedence conflict — the two requirements partition the input space.

**Acceptance criteria** (all with guarded files present and LEARNINGS unverified — the worst case):
- **When:** `grep CROSS-REVIEW docs/f/*.md` or `cat docs/f/CROSS-REVIEW-x.md` / **Then:** allowed.
- **When:** `git commit -m "rm docs/f cleanup: drop CROSS-REVIEW files"` / **Then:** allowed — `rm` and `docs/` are inside string data of a non-deletion verb.
- **When:** `echo "rm docs/f/CROSS-REVIEW-x.md"` / **Then:** allowed.
- **When:** a heredoc body contains `rm docs/f/*.md` (e.g. `cat <<'EOF' > /tmp/notes.txt` … `EOF`) / **Then:** allowed — heredoc bodies are data.
- **When:** `git add docs/f/CROSS-REVIEW-x.md` / **Then:** allowed.
- **When:** `mv docs/f/CROSS-REVIEW-x.md docs/f/CROSS-REVIEW-x-v2.md` / **Then:** allowed (pattern-preserving rename, per REQ-GUARD-02).

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

---

## Canonical Block/Allow Matrix (test oracle)

Default fixture state unless a row says otherwise: `docs/f/` contains `CROSS-REVIEW-x.md` and `CODE_REVIEW-f-v1.md`; `LEARNINGS-f.md` does **not** satisfy REQ-GUARD-03 (state G8 — on disk only); cwd is a git repo with a local bare `origin` and `origin/{branch}` existing; interpreter present. Expected stderr oracle = `pdlc-guard[<Reason>]` prefix.

| # | Command / state variation | Decision | Reason code |
|---|---|---|---|
| M01 | `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M02 | `rm docs/f/*.md` | BLOCK | NOT_COMMITTED |
| M03 | `rm src/foo.ts` | ALLOW | — |
| M04 | `find docs/f -name 'CROSS-*' -delete` | BLOCK | NOT_COMMITTED |
| M05 | `find docs/f -name '*.md' -exec rm {} \;` | BLOCK | NOT_COMMITTED |
| M06 | `git rm docs/f/CODE_REVIEW-f-v1.md` | BLOCK | NOT_COMMITTED |
| M07 | `git clean -fd docs/f` | BLOCK | NOT_COMMITTED |
| M08 | `git clean -fd` (no pathspec) | BLOCK | INDETERMINATE |
| M09 | `mv docs/f/CODE_REVIEW-f-v1.md /tmp/` | BLOCK | NOT_COMMITTED |
| M10 | `mv docs/f/CROSS-REVIEW-x.md docs/other-feature/` | BLOCK | NOT_COMMITTED |
| M11 | `mv docs/f/CROSS-REVIEW-x.md docs/f/CROSS-REVIEW-x-v2.md` | ALLOW | — |
| M12 | `mv docs/f/CROSS-REVIEW-x.md docs/f/notes.md` | BLOCK | NOT_COMMITTED |
| M13 | `mv docs/f docs/f-old` | BLOCK | NOT_COMMITTED |
| M14 | `> docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M15 | `echo note >> docs/f/CROSS-REVIEW-x.md` | ALLOW | — |
| M16 | `truncate -s 0 docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M17 | `cd docs/f && rm *.md` | BLOCK | NOT_COMMITTED |
| M18 | `echo done && rm docs/f/*.md` | BLOCK | NOT_COMMITTED |
| M19 | `rm docs/f/*.md \|\| true` | BLOCK | NOT_COMMITTED |
| M20 | `rm $(find docs/f -name 'CROSS-*')` | BLOCK | INDETERMINATE |
| M21 | `ls docs/f \| xargs rm` | BLOCK | INDETERMINATE |
| M22 | `bash -c 'rm docs/f/*.md'` | BLOCK | NOT_COMMITTED |
| M23 | `eval "rm docs/f/*.md"` | BLOCK | NOT_COMMITTED |
| M24 | `D=docs/f; rm "$D"/*.md` | BLOCK | INDETERMINATE |
| M25 | `rm "$SCRATCH"/*.log` (no `docs` token) | ALLOW | — (RR-2) |
| M26 | `eval "$CMD"` | ALLOW | — (RR-3) |
| M27 | `git commit -m "rm docs/f cleanup: drop CROSS-REVIEW files"` | ALLOW | — |
| M28 | `echo "rm docs/f/CROSS-REVIEW-x.md"` | ALLOW | — |
| M29 | Heredoc body containing `rm docs/f/*.md` | ALLOW | — |
| M30 | `git add docs/f/CROSS-REVIEW-x.md` | ALLOW | — |
| M31 | `grep CROSS-REVIEW docs/f/*.md` | ALLOW | — |
| M32 | `rm docs/empty-feature/*.md` (dir has no guarded files) | ALLOW | — |
| M33 | State G6 (LEARNINGS pushed): re-run M01, M02, M04–M24 | ALLOW | — |
| M34 | State G7 (committed, not pushed): `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_PUSHED |
| M35 | State G4 (origin exists, branch never pushed, LEARNINGS committed) | BLOCK | NOT_PUSHED (`git push -u origin` in message) |
| M36 | State G9 (`LEARNINGS-other.md` committed, `LEARNINGS-f.md` absent) | BLOCK | NOT_COMMITTED |
| M37 | State G1 (cwd not a git repo) | BLOCK | NO_REPO |
| M38 | State G2 (no remote, LEARNINGS in HEAD) | ALLOW | — |
| M39 | State G3 (detached HEAD, LEARNINGS in HEAD) | ALLOW | — |
| M40 | State G10 + `GUARD_FETCH_BEFORE_CHECK=true` (pushed to bare fixture, stale local ref) | ALLOW | — |
| M41 | Stdin `not-json{` or empty | BLOCK | PARSE_ERROR |
| M42 | No interpreter on PATH: `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | DEGRADED |
| M43 | No interpreter on PATH: `ls -la src/` | ALLOW | — |

Scope-check rows (REQ-GUARD-04): P1/P2/P3 pass cases silent; "telescope"-only, prose-`scope`-only, and lowercase-`scope:`-only cases warn.

---

## Reviewer Findings Disposition (v1.0 → v1.1)

| Finding | Resolution |
|---|---|
| SE F-01 / TE F-01 (fail-closed circular, indeterminate inputs undefined) | REQ-GUARD-01: parsing discipline steps 1–5, decision rules D1–D4, per-vector ACs; matrix rows M20–M26 |
| SE F-02 / TE F-08 (GUARD-01 vs NFR-01 conflict, parsing strategy) | D1 precedence + discrimination rule in NFR-01; quote/heredoc-aware segmentation; `git commit -m` AC + M27–M30 |
| SE F-03 / TE F-03(1) (blocklist vs "any command") | US-01 reworded; RR-1 in Residual Risk Register; `>>`/`2>` semantics fixed in REQ-GUARD-02 |
| SE F-04 / TE F-02 (git-state matrix, committed-not-pushed AC) | REQ-GUARD-03 matrix G1–G10 with per-state ACs; hermetic bare-origin fixtures in REQ-GUARD-05 |
| SE F-05 / TE F-03(2) (interpreter/JSON fail-open, Assumptions wrong) | New REQ-GUARD-06 (P0); Assumptions corrected to name the Python 3 dependency |
| SE F-06 / TE F-04 (message oracle) | New REQ-GUARD-07 reason-code catalog; prose ownership delegated to TSPEC |
| SE F-07 / TE F-07 (Scope patterns) | REQ-GUARD-04 exact ERE patterns P1–P3, pass/fail ACs incl. lowercase negative |
| SE F-08 / TE Q-02 (`git clean` rationale, bare clean) | Rationale paragraph in REQ-GUARD-02; D4 rule |
| SE F-09 / TE F-02 (test-harness env) | REQ-GUARD-05 test-environment requirements |
| TE F-05 / SE Q-01 (`mv` semantics) | REQ-GUARD-02 `mv` decision table + ACs (M09–M13) |
| TE F-06 (compound-command ACs) | REQ-GUARD-02 ACs + M17–M19, M29 |
| TE F-09 (LEARNINGS name derivation) | Definitions table + G9 + M36 |
| TE F-10 (failing-before/passing-after not durable) | REQ-GUARD-05 restated: matrix is the oracle |
| TE F-11 (`GUARD_FETCH_BEFORE_CHECK=true` untested) | G10 row, AC, M40; `GUARD_FETCH_TIMEOUT_SECS` declared; `false`-consequence documented |
| TE Q-01 (non-repo cwd) | G1: block `NO_REPO`; PROP-COMPAT-05 migration note |
| TE Q-03 (jest vs shell harness) | REQ-GUARD-05: existing jest harness; PROP-COMPAT-05 assertions migrated |
| SE Q-02 (deletion at docs dir with no guarded files) | REQ-GUARD-01 closing paragraph + M32 |

---

## Open Questions

None — all v1.0 reviewer questions are answered inline (see Disposition table); behavior is fully specified by the Canonical Block/Allow Matrix.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-01 | Initial draft |
| 1.1 | 2026-07-02 | Addressed all High/Medium (and all Low) findings from SE and TE cross-reviews, iteration 1: parsing discipline + decision rules D1–D4, `mv`/redirection semantics, git-state matrix G1–G10, degraded-environment policy (REQ-GUARD-06), reason-code message catalog (REQ-GUARD-07), Scope-pattern EREs, canonical block/allow matrix as test oracle, residual-risk register, corrected runtime-dependency assumption |
