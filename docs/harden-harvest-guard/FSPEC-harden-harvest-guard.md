---
Status: Draft
Author: pm-author
Version: 1.0
Feature: harden-harvest-guard
---

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | — (none yet for this document) |
| LEARNINGS | docs/harden-harvest-guard/LEARNINGS-harden-harvest-guard.md |

# FSPEC — harden-harvest-guard

Functional specification for the fail-closed rewrite of `guard-harvest-before-delete.sh` and the anchored `Scope:` detection in `check-scope-field.sh`. Source: [REQ-harden-harvest-guard.md](REQ-harden-harvest-guard.md) **Version 1.3** (approved with minor changes by SE and TE iteration-4 reviews; the three minor carry-forwards are resolved in this document — see § Carry-Forward Resolutions).

This FSPEC specifies **behavior only**. Script structure, regexes beyond those the REQ already fixes, and exact block-message prose are TSPEC territory.

**Acceptance-test oracle:** the REQ's **Canonical Block/Allow Matrix (M01–M65, S01–S06)** is the acceptance-test suite for every flow below. This document does **not** duplicate the matrix — each FSPEC section cites its rows. This FSPEC adds exactly one row, **M66** (see § Acceptance Tests), closing the oracle gap filed as TE v4 F4-01.

---

## Linked Requirements

| FSPEC | Title | Linked requirements | Matrix rows |
|---|---|---|---|
| FSPEC-GUARD-01 | Deletion-guard decision flow (parsing steps 1–5, decision points D1–D4) | REQ-GUARD-01, REQ-GUARD-02, REQ-GUARD-NFR-01 | M01–M08, M17–M32, M44–M51, M55, M60, M63–M66 |
| FSPEC-GUARD-02 | `mv` resulting-path rule and redirection classification | REQ-GUARD-02 | M09–M16, M52–M54, M56, M61–M62 |
| FSPEC-GUARD-03 | Git-state verification flow (G1–G10) | REQ-GUARD-03 | M33–M40, M57–M59 |
| FSPEC-GUARD-04 | Degraded-mode flow (interpreter missing, stdin unparseable) | REQ-GUARD-06 | M41–M43 |
| FSPEC-GUARD-05 | Scope-field check flow | REQ-GUARD-04 | S01–S06 |
| FSPEC-GUARD-06 | Block-message emission (reason-code selection) | REQ-GUARD-07 | reason-code column of every BLOCK row |

REQ-GUARD-05 (tests) has no behavioral flow of its own; it binds the matrix carried forward in § Acceptance Tests, including M66.

---

## FSPEC-GUARD-01 — Deletion-guard decision flow

**Linked requirements:** REQ-GUARD-01, REQ-GUARD-02 (verb set), REQ-GUARD-NFR-01

### Behavioral flow

The guard runs as PreToolUse: Bash. One invocation processes one hook stdin JSON payload.

1. **Intake.** Read stdin JSON; extract `tool_input.command` and the optional top-level `cwd` field. Intake failure paths (no interpreter, unparseable/empty stdin) divert to FSPEC-GUARD-04 **before** any step below runs.
2. **Step 1 — Segmentation and tokenization (REQ-GUARD-01 step 1).** Split the command into simple-command segments at unquoted `;`, `&&`, `||`, `|`, `&`, and newlines. Tokenize each segment shell-style **with quote removal**. Quoting decides literal vs expandable (step 5), never inspected vs not-inspected. Exclusions are **by position**: string arguments of non-deletion verbs and heredoc bodies are data and are never scanned — except that the string payload of an opaque-execution verb (`eval`, `bash -c`, `sh -c`) is code: it is queued and recursively re-parsed under this same flow (steps 2–8), and its verdicts merge into the parent command's verdict (any BLOCK blocks).
3. **Step 2 — Verb identification (REQ-GUARD-01 step 2).** Per segment, the verb is the first word after skipping `NAME=value` assignments and transparent prefixes (`command`, `env`, `sudo`, `nice`, `time`). `xargs <verb>` exposes `<verb>` as the effective verb with always-indeterminate operands (the piped input stream). `find` with `-delete` or `-exec <deletion-verb>` is a deletion form whose operands are `find`'s path roots. The defended deletion-verb set is exactly REQ-GUARD-02's enumeration (including the redirection truncation family, classified in FSPEC-GUARD-02).
4. **Decision point D1 — no visible deletion verb → ALLOW.** If no deletion verb appears in executable position in any segment, including all recursively parsed opaque payloads, exit 0 unconditionally. D1 has absolute precedence: it is the mechanism by which REQ-GUARD-NFR-01 (no false blocks) and the fail-closed rules coexist — free text, `git commit -m "..."` messages, `echo` arguments, and heredoc bodies can never trigger a block. (Rows M26–M31; RR-3.)
5. **Step 3 — Operand scoping (REQ-GUARD-01 step 3).** For each deletion segment, collect its operands (non-flag argv tokens) and redirection targets as candidate paths. Tokens inside arguments of non-deletion verbs are never candidates.
6. **Step 4 — Effective-cwd resolution (REQ-GUARD-01 step 4, union rule).** For segment 1's static relative operands and globs, resolve against **both candidate roots**: **(A)** the stdin `cwd` field when present, else `CLAUDE_PROJECT_DIR` (repo root); and **(B)** the hook process's own working directory. A hit through **either** root is a hit (conservative union; residual drift is RR-5). Within the compound command, a `cd <static-path>` segment updates the effective cwd for subsequent segments; `cd <indeterminate>` makes all subsequent relative operands indeterminate. (Rows M17, M64, M65, and FSPEC-added M66.)
7. **Step 5 — Operand classification (REQ-GUARD-01 step 5).** An operand is **static** iff, before quote removal, it contains no expansion-active `$`, backtick, `$(`, or `<(` — where *expansion-active* means neither single-quoted nor backslash-escaped (double quotes do **not** suppress expansion: `"$D"` is indeterminate; `'$D'` and `\$D` are static). Static operands and globs resolve/expand against the effective cwd(s) of step 6. Anything else is **indeterminate**.
8. **Guarded-state lookup.** Enumerate guarded directories (top-level `docs/{feature}/` whose subtree contains a `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md`, per REQ Definitions) and classify each as Verified or unverified via the FSPEC-GUARD-03 flow. This state feeds decision points D2–D4.
9. **Decision points D2–D4 (in order; first match wins; D1 already passed).**
   - **D2 — static guarded target → BLOCK.** A deletion verb with a static operand that resolves to, or globs over: (i) a guarded file; (ii) any path inside an unverified guarded directory; (iii) an unverified guarded directory itself; or — for recursive-capable forms only (`rm -r/-R/--recursive` incl. combined spellings, `find <root> … -delete`/`-exec <deletion-verb>`, `git clean` with pathspec, `mv` of a directory) — (iv) any ancestor of an unverified guarded directory (`docs`, `.`, `..`, repo root, `/`). Reason code comes from the FSPEC-GUARD-03 state of the affected feature. Non-recursive forms aimed at an ancestor fall through.
   - **D3 — indeterminate deletion, docs-referencing → BLOCK `INDETERMINATE`,** iff (a) the deletion segment itself references `docs/` through one of the four dataflow channels (own operands/redirection targets; assignment RHS its operands expand; piped-producer segment; `cd` context that sets its effective cwd) — quote-independent literal test — AND (b) at least one unverified guarded directory exists. `docs/` tokens in sibling segments with no dataflow into the deletion segment do not satisfy (a) (rows M55–M56; RR-2).
   - **D4 — pathspec-less `git clean` → BLOCK `INDETERMINATE`,** iff any unverified guarded directory exists; the D3(a) docs-reference qualifier is waived (target scope is repo-wide by construction).
10. **Fall-through → ALLOW** (exit 0). Includes deletions aimed at `docs/` directories containing no guarded files (M32) and everything the Residual Risk Register accepts.

### Business rules

- BR-01-1: First-match-wins ordering D1 → D2 → D3 → D4 → allow is normative; no other precedence exists.
- BR-01-2: D2/D3/D4 all require an unverified guarded directory to exist; a fully Verified repo allows every row of the matrix's M33 re-run set.
- BR-01-3: Quote removal precedes classification: quoting a path never hides it (M44/M45); quoting an assignment RHS never defeats the D3(a) literal test (M46).
- BR-01-4: Block = exit 2 + stderr message per FSPEC-GUARD-06. Allow = exit 0, no output contract.

### Edge cases and error scenarios

| Case | Behavior |
|---|---|
| Opaque payload itself contains an opaque payload (`bash -c 'eval "rm docs/f/*.md"'`) | Recursive re-parse applies at every level; depth is unbounded by spec (TSPEC may cap with fail-closed overflow → treat as indeterminate deletion-shaped, D3) |
| `eval "$CMD"` — payload fully opaque | D1 ALLOW (RR-3, M26) |
| Deletion verb present but every operand static and unguarded | ALLOW (M03) |
| `cd` with indeterminate argument followed by `rm *.md` | Subsequent relative operands indeterminate → D3 evaluated |
| Command references `docs/` only via a *previous tool call's* state | Not observable; union rule is the sole mitigation; remainder is RR-5 (M65) |

---

## FSPEC-GUARD-02 — `mv` resulting-path rule and redirection classification

**Linked requirements:** REQ-GUARD-02

### `mv` behavioral flow (resulting-path rule)

1. Canonicalize source and destination (`.`, `..`, trailing slashes) against the effective cwd (FSPEC-GUARD-01 step 6).
2. If source or destination is indeterminate → decision point D3 applies (FSPEC-GUARD-01).
3. If the source is an unverified guarded directory, or (recursive-capable, D2 iv) an ancestor of one → BLOCK.
4. Otherwise, if the source is/globs a guarded file in an unverified guarded directory, compute the **resulting file path**: if the destination is a directory (existing, or spelled with a trailing `/`), resulting path = `destination/basename(source)`; otherwise resulting path = destination.
5. **Decision:** ALLOW iff the resulting path is still under the **same feature's** `docs/{feature}/` subtree (any depth; feature = first path segment under `docs/`) **AND** the resulting basename still matches `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md`. Everything else → BLOCK (move-out, cross-feature move, and pattern-destroying rename are all deletion). Rows M09–M13, M52.

### Redirection classification flow

For each redirection token in a segment, classify then decide:

1. **Fd-operation exclusion.** `2>&1`, `>&2`, `N>&M`, and `>&-` name file descriptors, never paths — excluded before target inspection. **`>&` disambiguation (lexical, at tokenization):** the word after `>&` is an fd-duplication (or `-` = fd-close) **iff it consists entirely of digits, or is exactly `-`**; any other word — including digit-leading non-numeric words such as `2024-notes/CROSS-REVIEW-x.md` — is a truncating file-redirection target. *(Corrects REQ M62's "followed by a digit" phrasing — carry-forward CF-1, SE v4 F-01.)*
2. **Destructive forms.** `>`, `1>`, `>|`, `2>`, `&> <path>`, `>& <path>` (per rule 1) truncate: a static target resolving to a guarded file in an unverified guarded directory → BLOCK (rows M14, M53, M54, M61, M62).
3. **Non-destructive form.** `>>` (append) → never deletion-shaped → no contribution to any decision (M15).
4. **Indeterminate target** → deletion-shaped; decision point D3 applies with its segment-scoped docs-reference test (M56).

### Business rules

- BR-02-1: The `mv` decision is a single rule (resulting path in same-feature subtree AND basename pattern preserved), not a case list; the REQ's `mv` table rows are consequences of it.
- BR-02-2: `git clean` is defended specifically to protect not-yet-committed review artifacts (Phase DOD `CODE_REVIEW-*`, mid-review `CROSS-REVIEW-*`); TSPEC must preserve this rationale.
- BR-02-3: The verb set is a closed enumeration (REQ-GUARD-02); anything outside it is RR-1, allowed by D1.

### Edge cases

| Case | Behavior |
|---|---|
| `mv docs/f/CROSS-REVIEW-x.md docs/f/archive/` (dir exists) | Resulting path `docs/f/archive/CROSS-REVIEW-x.md`, same feature, pattern kept → ALLOW (M52) |
| `mv docs/f/CROSS-REVIEW-x.md docs/f/CROSS-REVIEW-x-v2.md` | Rename in place, pattern kept → ALLOW (M11) |
| `mv docs/f/CROSS-REVIEW-x.md docs/f/notes.md` | Pattern destroyed → BLOCK (M12) |
| `>& 2024-notes/CROSS-REVIEW-x.md` | Word not all-digits → file target → truncation family (CF-1) |
| `>&-` | Fd-close, never a target; static-unguarded allow class, no row needed (per TE v4 scan) |

---

## FSPEC-GUARD-03 — Git-state verification flow (G1–G10)

**Linked requirements:** REQ-GUARD-03

Verifies, for a guarded directory `docs/{feature}/`, whether the exact file `LEARNINGS-{feature}.md` (feature = first path segment under `docs/`; file must sit at the top level of `docs/{feature}/`) is committed-and-pushed. Disk presence never satisfies the guard. The REQ's G1–G10 matrix is authoritative; the flow below is its decision order.

### Behavioral flow

1. **G-DP1 — repo check.** cwd not a git repository → state **G1**: BLOCK `NO_REPO`. (The pipeline always runs in a checkout; a non-repo cwd cannot prove commit state.)
2. **G-DP2 — fetch toggle.** If `GUARD_FETCH_BEFORE_CHECK=true` (env var, default `false`/unset), run `git fetch origin {branch}` bounded by `GUARD_FETCH_TIMEOUT_SECS` (default `10`). Fetch failure/timeout changes nothing: proceed with the existing local ref state — network trouble alone never changes the decision class (G10 unreachable-origin row M59).
3. **G-DP3 — remote topology.**
   - No remote configured → **G2 fallback**: `LEARNINGS-{feature}.md` in `HEAD` tree → ALLOW; else BLOCK `NOT_COMMITTED`.
   - Detached HEAD (no current branch) → **G3**: same HEAD-tree fallback as G2 (CI runs detached on already-pushed commits).
   - `origin` exists but `origin/{branch}` ref does not (never pushed): LEARNINGS in `HEAD` → **G4** BLOCK `NOT_PUSHED` (message includes `git push -u origin {branch}`); not in `HEAD` → **G5** BLOCK `NOT_COMMITTED`.
4. **G-DP4 — remote-tracking tree check** (`origin/{branch}` exists), e.g. `git cat-file -e origin/{branch}:docs/{feature}/LEARNINGS-{feature}.md`:
   - Present → **G6** ALLOW (the only fully Verified state with a remote).
   - Absent, but present in `HEAD` → **G7** BLOCK `NOT_PUSHED`. A genuinely pushed but stale local ref (**G10**) is indistinguishable here: with the fetch toggle `false` this is the documented accepted false block (message carries a `git fetch origin` hint, M58); with `true`, step 2 already refreshed the ref, so a truly pushed LEARNINGS reaches G6 (M40).
   - Absent everywhere (disk only) → **G8** BLOCK `NOT_COMMITTED`.
5. **Name-match strictness (G9).** Only the exact filename `LEARNINGS-{feature}.md` at the top level of `docs/{feature}/` counts; `LEARNINGS-<anything-else>.md`, anywhere, does not → BLOCK `NOT_COMMITTED` (M36).

### Business rules

- BR-03-1: Both thresholds are environment variables read at invocation (unset/empty = default), never script-internal constants: `GUARD_FETCH_BEFORE_CHECK` (default `false`), `GUARD_FETCH_TIMEOUT_SECS` (default `10`). Owner: hook script header.
- BR-03-2: The G2/G3 HEAD fallback is a documented weakening of the "pushed" guarantee (RR-4); permanent blocking would make remoteless/detached checkouts unusable.
- BR-03-3: Verification is per-feature: each guarded directory is Verified or unverified independently; a deletion is judged against the state of the feature(s) its targets belong to.

### Error scenarios

| Scenario | Behavior |
|---|---|
| `git` commands fail inside a valid repo (corrupt ref, permission) | Cannot prove commit state → fail closed with the state's reason code (TSPEC picks the nearest G-state; never exit 0 on git error) |
| Fetch times out with toggle `true` | Identical to toggle `false` path (M59) |

---

## FSPEC-GUARD-04 — Degraded-mode flow

**Linked requirements:** REQ-GUARD-06

### Behavioral flow

1. **DG-DP1 — interpreter check (always first).** If no usable Python interpreter resolves (`python3`/`python`/`py`), enter degraded mode:
   - Run a **coarse conservative matcher in pure bash over the raw stdin text** (the full JSON blob — no field extraction is attempted).
   - **Decision:** BLOCK with reason `DEGRADED` iff the raw text matches a **degraded deletion-verb token** (set defined below) AND contains `docs/`, `CROSS-REVIEW`, or `CODE_REVIEW`; otherwise ALLOW. The `DEGRADED` message names the missing interpreter and `python3` as the remedy.
   - Degraded mode performs **no git verification** — guarded-looking deletions on a Python-less machine stay blocked until `python3` is installed.
2. **DG-DP2 — stdin parse.** Interpreter present but stdin JSON unparseable or empty → BLOCK `PARSE_ERROR` (stable hook contract means malformed input signals a harness bug or tampering).
3. **Precedence.** When both degradations co-occur, DG-DP1 runs first → result is `DEGRADED` (`PARSE_ERROR` detection itself requires the interpreter).
4. `check-scope-field.sh` is exempt: advisory by design; its interpreter-missing path remains a silent no-op.

### Business rule — degraded deletion-verb token set (CF-2, SE v4 F-02)

Defined **relative to REQ-GUARD-02's verb enumeration**, adapted to raw-text matching:

| Token class | Tokens | Matching rule |
|---|---|---|
| Word verbs | `rm`, `unlink`, `mv`, `truncate`, `find` | Word-boundary match anywhere in the raw stdin text. `rm` as a word also covers `git rm` (its second word); `find` covers `find … -delete` / `-exec` forms |
| Two-word verb | `git clean` | Whitespace-separated two-word sequence; bare `clean` is **not** a token |
| Redirection operators | `>` (any occurrence of the character) | Lexically covers the whole REQ-GUARD-02 truncation family (`>`, `1>`, `>|`, `2>`, `&>`, `>&`) since each contains `>`; JSON uses `>` only inside string values, so an occurrence always comes from field content |

Accepted degraded-mode over-match (same class as the REQ's field-bleed consequence, folded into REQ-GUARD-06's accepted-consequence list): the `>` rule also matches non-destructive `>>` and fd-duplication forms (`2>&1`), and word verbs may match tokens in non-command JSON fields (e.g. the Bash tool `description`). All such matches still require the `docs/` / `CROSS-REVIEW` / `CODE_REVIEW` conjunct to block. REQ-GUARD-NFR-01's no-false-block guarantee is explicitly waived while degraded; over-blocking is the intended fail-closed trade.

### Edge cases

| Case | Behavior |
|---|---|
| No interpreter, command `ls -la src/` | No token match → ALLOW (M43) |
| No interpreter, command `rm docs/f/CROSS-REVIEW-x.md` | Token + content match → BLOCK `DEGRADED` (M42) |
| No interpreter, `echo note >> docs/f/CROSS-REVIEW-x.md` | `>` + `docs/` match → BLOCK `DEGRADED` — accepted degraded false block (no matrix row; documented consequence) |
| Empty stdin, interpreter present | BLOCK `PARSE_ERROR` (M41) |

---

## FSPEC-GUARD-05 — Scope-field check flow

**Linked requirements:** REQ-GUARD-04

### Behavioral flow

`check-scope-field.sh` runs as PostToolUse: Write|Edit (advisory — it can never block).

1. Extract `tool_input.file_path`. If the basename does not match `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md` → silent exit.
2. Test the written file's content against the three exact patterns (POSIX ERE, case-sensitive on `Scope`): **P1** `^[[:space:]]*Scope:` (plain field line) · **P2** `^[[:space:]]*\*\*Scope(\*\*:|:\*\*)` (bold markdown, both spellings) · **P3** `\|[[:space:]]*Scope[[:space:]]*\|` (table header cell, any row position — deliberately not line-anchored).
3. **Decision:** any pattern matches → silent. No pattern matches → emit the missing-`Scope:` warning.
4. Prose substrings ("telescope", "the scope of this change") and lowercase `scope:` never match (S04–S06).
5. Interpreter missing → silent no-op (exempt from REQ-GUARD-06 by design).

Acceptance tests: S-rows S01–S06 of the Canonical Matrix.

---

## FSPEC-GUARD-06 — Block-message emission

**Linked requirements:** REQ-GUARD-07

### Behavioral flow

1. Every BLOCK exits 2 and writes to stderr a message beginning with the stable prefix `pdlc-guard[<REASON>]:`.
2. `<REASON>` is exactly one of `NOT_COMMITTED`, `NOT_PUSHED`, `INDETERMINATE`, `NO_REPO`, `PARSE_ERROR`, `DEGRADED`, selected mechanically by the decision path that produced the block:

| Decision path (this FSPEC) | Reason code |
|---|---|
| D2 hit; feature state G2/G3/G5/G8/G9 | `NOT_COMMITTED` |
| D2 hit; feature state G4/G7/G10 | `NOT_PUSHED` |
| D3 or D4 hit | `INDETERMINATE` |
| G-DP1 non-repo (G1) | `NO_REPO` |
| DG-DP2 unparseable stdin | `PARSE_ERROR` |
| DG-DP1 degraded block | `DEGRADED` |

3. Required message substrings per reason code are fixed by the REQ-GUARD-07 table (e.g. `NOT_COMMITTED` carries `LEARNINGS-{feature}.md` and the `/pdlc:harvest-learnings` instruction; G4 additionally `git push -u origin`; G10 additionally the `git fetch` hint). Exact prose beyond prefix + required substrings is owned by TSPEC; tests assert prefix + substrings, never full prose.

---

## Acceptance Tests

The acceptance-test suite is the REQ v1.3 **Canonical Block/Allow Matrix** — deletion-guard rows **M01–M65** and scope-check rows **S01–S06** — carried forward by reference, under REQ-GUARD-05's one-test-per-row obligation (bulk row M33 expands to one asserting test per referenced row; parameterized acceptable). This FSPEC amends the matrix as follows (CF-3, TE v4 F4-01):

| # | Command / state variation | Decision | Reason code |
|---|---|---|---|
| M66 | No cwd signal in hook stdin; hook **process cwd = `docs/f`** (candidate root (B) alone): `rm *.md` | BLOCK | NOT_COMMITTED |

- **Who:** any agent / **Given:** default matrix fixture state; hook stdin carries no `cwd` field; the hook process is spawned with working directory `docs/f` / **When:** `rm *.md` / **Then:** exit 2, reason `NOT_COMMITTED` — candidate root (B) alone resolves the glob inside the unverified guarded directory, exercising the union rule's second disjunct (an (A)-only implementation must fail this row).
- **M33's G6 re-run expansion set is extended to include M66** (under G6 the glob resolves inside a *Verified* guarded directory → ALLOW).

M66 is hermetically writable in the existing jest harness (spawn cwd + stdin content are both controllable), per REQ-GUARD-05's test-environment requirements.

---

## Carry-Forward Resolutions (v4 approved-with-minor findings)

The iteration-4 reviews approved REQ v1.3 with three Low findings, each explicitly deferrable to this FSPEC with a back-reference. All three are resolved here:

| CF | Source | Finding | Resolution in this FSPEC |
|---|---|---|---|
| CF-1 | SE v4 F-01 | `>&` disambiguation stated as "followed by a digit"; bash's rule is "word entirely digits (or `-`)" — a digit-leading non-numeric word (`>& 2024-notes/CROSS-REVIEW-x.md`) was unclassified | FSPEC-GUARD-02 redirection rule 1: fd-duplication iff the word after `>&` **consists entirely of digits or is exactly `-`**; any other word is a truncating file target. Supersedes the REQ M62 phrasing |
| CF-2 | SE v4 F-02 | Degraded-mode "deletion-verb token" set undefined relative to REQ-GUARD-02's enumeration (which includes redirection operators) | FSPEC-GUARD-04 business rule: explicit token set — word-boundary verbs `rm`, `unlink`, `mv`, `truncate`, `find`; two-word `git clean`; the character `>` covering the whole truncation-redirection family — with the over-match consequences named and folded into the REQ-GUARD-06 accepted-consequence list |
| CF-3 | TE v4 F4-01 | Union rule's "either" disjunction had no matrix row where candidate root (B) alone triggers the block — an (A)-only implementation would pass the whole matrix | § Acceptance Tests adds row **M66** (block via hook process cwd alone) and extends M33's G6 re-run set to include it |

---

## Open Questions

None. All reviewer questions across four REQ iterations are answered inline in REQ v1.3, and the three v4 carry-forwards are resolved above. Behavior is fully specified by the flows in this document plus the Canonical Matrix M01–M66 / S01–S06.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-02 | Initial draft from REQ v1.3: decision flows for parsing discipline (D1–D4), `mv` resulting-path rule and redirection classification, git-state verification (G1–G10), degraded mode, scope check, and reason-code emission; matrix carried forward by reference with FSPEC-added row M66; v4 carry-forwards CF-1–CF-3 resolved |
