---
Status: Draft
Author: pm-author
Version: 1.2
Feature: harden-harvest-guard
---

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | [CROSS-REVIEW-software-engineer-FSPEC.md](CROSS-REVIEW-software-engineer-FSPEC.md), [CROSS-REVIEW-test-engineer-FSPEC.md](CROSS-REVIEW-test-engineer-FSPEC.md), [CROSS-REVIEW-software-engineer-FSPEC-v2.md](CROSS-REVIEW-software-engineer-FSPEC-v2.md), [CROSS-REVIEW-test-engineer-FSPEC-v2.md](CROSS-REVIEW-test-engineer-FSPEC-v2.md) |
| LEARNINGS | docs/harden-harvest-guard/LEARNINGS-harden-harvest-guard.md |

# FSPEC — harden-harvest-guard

Functional specification for the fail-closed rewrite of `guard-harvest-before-delete.sh` and the anchored `Scope:` detection in `check-scope-field.sh`. Source: [REQ-harden-harvest-guard.md](REQ-harden-harvest-guard.md) **Version 1.5** (v1.3 approved with minor changes by SE and TE iteration-4 reviews — the three minor carry-forwards are resolved in this document, see § Carry-Forward Resolutions; v1.4 was the matrix extension driven by this FSPEC's iteration-1 review; v1.5 — landed in the same commit as this revision — adds rows M80–M83 from the iteration-2 review and names the eager repo-check position in REQ-GUARD-01's decision-rule preamble. Note: v1.4's original "no requirement semantics changed" framing was inaccurate and is corrected in v1.5 — rows M75–M76 flipped a v1.3-ALLOW command class to BLOCK `NO_REPO` under the eager repo-check ordering; SE FSPEC-v2 F2-03).

This FSPEC specifies **behavior only**. Script structure, regexes beyond those the REQ already fixes, and exact block-message prose are TSPEC territory.

**Acceptance-test oracle:** the REQ's **Canonical Block/Allow Matrix (M01–M83, S01–S07)** is the acceptance-test suite for every flow below. This document does **not** duplicate the matrix — each FSPEC section cites its rows. Matrix rows are REQ-owned: the rows this FSPEC's authoring and review produced (M66, closing TE v4 F4-01; M67–M79 and S07, closing the iteration-1 FSPEC findings; M80–M83, closing the iteration-2 findings) are promoted into the REQ matrix (v1.4 and v1.5, each in the same commit as the FSPEC revision that produced it) rather than held here — per the TE F-09 process rule that behavior-defining resolutions must amend the matrix, not just prose. § Acceptance Tests retains M66's full acceptance statement.

---

## Linked Requirements

| FSPEC | Title | Linked requirements | Matrix rows |
|---|---|---|---|
| FSPEC-GUARD-01 | Deletion-guard decision flow (parsing steps 1–5, decision points D1–D4) | REQ-GUARD-01, REQ-GUARD-02, REQ-GUARD-NFR-01 | M01–M08, M17–M32, M44–M51, M55, M60, M63–M66, M73, M80 |
| FSPEC-GUARD-02 | `mv` resulting-path rule and redirection classification | REQ-GUARD-02 | M09–M16, M52–M54, M56, M61–M62, M67, M74, M79, M82 |
| FSPEC-GUARD-03 | Git-state verification flow (G1–G10) | REQ-GUARD-03 | M33–M40, M57–M59, M75–M77, M83 |
| FSPEC-GUARD-04 | Degraded-mode flow (interpreter missing, stdin unparseable) | REQ-GUARD-06 | M41–M43, M68–M72, M78, M81 |
| FSPEC-GUARD-05 | Scope-field check flow | REQ-GUARD-04 | S01–S07 |
| FSPEC-GUARD-06 | Block-message emission (reason-code selection) | REQ-GUARD-07 | reason-code column of every BLOCK row |

REQ-GUARD-05 (tests) has no behavioral flow of its own; it binds the matrix carried forward in § Acceptance Tests, including the FSPEC-driven extension rows M66–M83 and S07.

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
6. **Step 4 — Effective-cwd resolution (REQ-GUARD-01 step 4, union rule).** For segment 1's static relative operands and globs, resolve against **both candidate roots**: **(A)** the stdin `cwd` field when present, else `CLAUDE_PROJECT_DIR` (repo root); and **(B)** the hook process's own working directory. A hit through **either** root is a hit (conservative union; residual drift is RR-5). The initial effective cwd (the union of both candidate roots) applies to **every** segment — not only segment 1 — until a `cd` segment updates it: segment position never changes the resolution root (so the deletion in `echo done && rm docs/f/*.md`, M18, resolves against the same union as a segment-1 deletion; row M80 pins the every-segment rule discriminatingly — a segment-2 glob resolved via candidate root (B) alone, which a segment-1-only union implementation fails). Within the compound command, a `cd <static-path>` segment updates the effective cwd for subsequent segments; `cd <indeterminate>` makes all subsequent relative operands indeterminate. (Rows M17, M18, M64, M65, M66, M80.)
7. **Step 5 — Operand classification (REQ-GUARD-01 step 5).** An operand is **static** iff, before quote removal, it contains no expansion-active `$`, backtick, `$(`, or `<(` — where *expansion-active* means neither single-quoted nor backslash-escaped (double quotes do **not** suppress expansion: `"$D"` is indeterminate; `'$D'` and `\$D` are static). Static operands and globs resolve/expand against the effective cwd(s) of step 6. Anything else is **indeterminate**.
8. **Guarded-state lookup.** The lookup opens with FSPEC-GUARD-03's **G-DP1 repo check as an eager early exit**. G-DP1 consults **candidate root (A)** — the stdin `cwd` when present, else `CLAUDE_PROJECT_DIR`; when neither signal exists, the hook process cwd is the only remaining cwd notion and is tested instead: if that root is not a git repository, BLOCK `NO_REPO` immediately — D2–D4 are never evaluated. Only deletion-shaped commands reach this point (D1 has already passed), so the eager exit cannot touch REQ-GUARD-NFR-01. (Rows M37, M75, M76; mixed-root discriminator M83 pins that root (A), not the process cwd, is the one consulted.) Otherwise enumerate guarded directories (top-level `docs/{feature}/` whose subtree contains a `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md`, per REQ Definitions) — enumeration is anchored at the **repo root**: `CLAUDE_PROJECT_DIR` when set, else the `git rev-parse --show-toplevel` of candidate root (A) (the same root G-DP1 just tested — one mechanism, so the fallback can never fail where G-DP1 passed); neither the process nor the stdin cwd is ever itself the anchor — and classify each as Verified or unverified via the FSPEC-GUARD-03 flow. This state feeds decision points D2–D4.
9. **Decision points D2–D4 (in order; first match wins; D1 already passed).**
   - **D2 — static guarded target → BLOCK.** A deletion verb with a static operand that resolves to, or globs over: (i) a guarded file; (ii) any path inside an unverified guarded directory; (iii) an unverified guarded directory itself; or — for recursive-capable forms only (`rm -r/-R/--recursive` incl. combined spellings, `find <root> … -delete`/`-exec <deletion-verb>`, `git clean` with pathspec, `mv` of a directory) — (iv) any ancestor of an unverified guarded directory (`docs`, `.`, `..`, repo root, `/`). Reason code comes from the FSPEC-GUARD-03 state of the affected feature. Non-recursive forms aimed at an ancestor fall through.
   - **D3 — indeterminate deletion, docs-referencing → BLOCK `INDETERMINATE`,** iff (a) the deletion segment itself references `docs/` through one of the four dataflow channels (own operands/redirection targets; assignment RHS its operands expand; piped-producer segment; `cd` context that sets its effective cwd) — quote-independent literal test — AND (b) at least one unverified guarded directory exists. `docs/` tokens in sibling segments with no dataflow into the deletion segment do not satisfy (a) (rows M55–M56; RR-2).
   - **D4 — pathspec-less `git clean` → BLOCK `INDETERMINATE`,** iff any unverified guarded directory exists; the D3(a) docs-reference qualifier is waived (target scope is repo-wide by construction).
10. **Fall-through → ALLOW** (exit 0). Includes deletions aimed at `docs/` directories containing no guarded files (M32) and everything the Residual Risk Register accepts.

### Business rules

- BR-01-1: First-match-wins ordering D1 → G-DP1 eager `NO_REPO` exit → D2 → D3 → D4 → allow is normative; no other precedence exists. The ordering binds every deletion form, including the `mv` flow in FSPEC-GUARD-02: static-source D2 knowledge is consumed before any indeterminacy jump to D3 (M74).
- BR-01-2: D2/D3/D4 all require an unverified guarded directory to exist; a fully Verified repo allows every row of the matrix's M33 re-run set.
- BR-01-3: Quote removal precedes classification: quoting a path never hides it (M44/M45); quoting an assignment RHS never defeats the D3(a) literal test (M46).
- BR-01-4: Block = exit 2 + stderr message per FSPEC-GUARD-06. Allow = exit 0, no output contract.

### Edge cases and error scenarios

| Case | Behavior |
|---|---|
| Opaque payload itself contains an opaque payload (`bash -c 'eval "rm docs/f/*.md"'`) | Recursive re-parse applies at every level (depth-2 pinned by row M73); depth is unbounded by spec. TSPEC may cap the depth, but a payload beyond the cap is treated as **opaque** — no visible deletion verb → D1 ALLOW — never as deletion-shaped: an over-cap block would false-block verb-free commands that merely mention `docs/`, violating REQ-GUARD-NFR-01/D1. The over-cap bypass surface is registered residual risk (REQ RR-3, extended in v1.4) |
| `eval "$CMD"` — payload fully opaque | D1 ALLOW (RR-3, M26) |
| Deletion verb present but every operand static and unguarded | ALLOW (M03) |
| `cd` with indeterminate argument followed by `rm *.md` | Subsequent relative operands indeterminate → D3 evaluated |
| Command references `docs/` only via a *previous tool call's* state | Not observable; union rule is the sole mitigation; remainder is RR-5 (M65) |

---

## FSPEC-GUARD-02 — `mv` resulting-path rule and redirection classification

**Linked requirements:** REQ-GUARD-02

### `mv` behavioral flow (resulting-path rule)

0. **Operand shape.** `mv` with more than two operands: the last operand is the destination (a directory); each source is evaluated independently under steps 1–5, and any BLOCK blocks the command (M79).
1. Canonicalize the static sources and destination (`.`, `..`, trailing slashes) against the effective cwd (FSPEC-GUARD-01 step 6).
2. **Static-source D2 test — evaluated before any indeterminacy jump (BR-01-1's D2-before-D3 ordering applies inside this flow).** If a static source is an unverified guarded directory itself, or (recursive-capable, D2 iv) an ancestor of one → BLOCK with the affected feature's FSPEC-GUARD-03 reason code (`NOT_COMMITTED` in the default fixture). An indeterminate destination does not divert this case to D3: the source alone establishes the deletion shape and the reason code, and the message tells the agent to harvest/commit rather than reporting an unresolvable operand (M13, M74).
3. If the source **or the destination** is indeterminate (resulting path unknowable) → decision point D3 applies (FSPEC-GUARD-01) — unconditionally, matching the REQ `mv` table row and the general D3: no source-guardedness qualifier. Step 2 has already consumed static-guarded-source knowledge, so this jump never masks a G-state reason code (M74); and an indeterminate docs-referencing destination alone suffices whatever the source is, because the move can still **overwrite** (destroy) a guarded file — a static *unguarded* source with an indeterminate docs-referencing destination blocks `INDETERMINATE` (M82).
4. Otherwise, if the source is/globs a guarded file in an unverified guarded directory, compute the **resulting file path**: if the destination is a directory (existing, or spelled with a trailing `/`), resulting path = `destination/basename(source)`; otherwise resulting path = destination.
5. **Decision:** ALLOW iff the resulting path is still under the **same feature's** `docs/{feature}/` subtree (any depth; feature = first path segment under `docs/`) **AND** the resulting basename still matches `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md`. Everything else → BLOCK (move-out, cross-feature move, and pattern-destroying rename are all deletion). Rows M09–M13, M52.

### Redirection classification flow

For each redirection token in a segment, classify then decide:

1. **Fd-operation exclusion.** `2>&1`, `>&2`, `N>&M`, and `>&-` name file descriptors, never paths — excluded before target inspection. **`>&` disambiguation (lexical, at tokenization):** the word after `>&` is an fd-duplication (or `-` = fd-close) **iff it consists entirely of digits, or is exactly `-`**; any other word — including digit-leading non-numeric words such as `2024-notes/CROSS-REVIEW-x.md` — is a truncating file-redirection target. *(Corrects REQ M62's "followed by a digit" phrasing — carry-forward CF-1, SE v4 F-01.)* The digit-leading discriminator is pinned by matrix row **M67** (fixture adds nested guarded `docs/f/2024-notes/CROSS-REVIEW-x.md`; `cd docs/f && npm test >& 2024-notes/CROSS-REVIEW-x.md` → BLOCK `NOT_COMMITTED`; in M33's G6 re-run set) — an implementation of the superseded first-char-digit rule fails it.
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
| `>& 2024-notes/CROSS-REVIEW-x.md` | Word not all-digits → file target → truncation family (CF-1; pinned by M67) |
| `mv docs/f "$DEST"` (static guarded-dir source, indeterminate destination) | Step 2 fires before the indeterminacy test → BLOCK with G-state reason, not `INDETERMINATE` (M74) |
| `D=docs/f; mv /tmp/notes.md "$D"/CROSS-REVIEW-x.md` (static **unguarded** source, indeterminate docs-referencing destination) | Step 2 misses (source unguarded); step 3 → D3: `docs/` via the assignment-RHS dataflow channel + an unverified guarded directory exists → BLOCK `INDETERMINATE` — the overwrite of a guarded file is caught (M82) |
| `mv docs/f/CROSS-REVIEW-x.md docs/f/CODE_REVIEW-f-v1.md /tmp/` (multi-source) | Each source evaluated independently; both resulting paths leave the feature subtree → BLOCK (M79) |
| `>&-` | Fd-close, never a target; static-unguarded allow class, no row needed (per TE v4 scan) |

---

## FSPEC-GUARD-03 — Git-state verification flow (G1–G10)

**Linked requirements:** REQ-GUARD-03

Verifies, for a guarded directory `docs/{feature}/`, whether the exact file `LEARNINGS-{feature}.md` (feature = first path segment under `docs/`; file must sit at the top level of `docs/{feature}/`) is committed-and-pushed. Disk presence never satisfies the guard. The REQ's G1–G10 matrix is authoritative; the flow below is its decision order.

### Behavioral flow

1. **G-DP1 — repo check (eager early exit, not a per-feature state).** The cwd notion G-DP1 tests is **candidate root (A)**: the stdin `cwd` when present, else `CLAUDE_PROJECT_DIR`; the hook process cwd is consulted only when neither signal exists (FSPEC-GUARD-01 step 8 — the same root anchors guarded-directory enumeration, so repo check and enumeration are one mechanism). Root (A) not a git repository → **G1**: BLOCK `NO_REPO` for **any deletion-shaped command** — D1 has already passed, and D2–D4 are never evaluated. Steps 2–5 below, and BR-03-3's per-feature judgment, apply only inside a repo. Pinned consequences: a deletion aimed at an unguarded target in a non-repo cwd still blocks (`rm /tmp/scratch.log` → M75); a D3-shaped command in a non-repo cwd blocks `NO_REPO`, never `INDETERMINATE` (M76; M37 pins the D2 shape); and in a mixed-root state — stdin `cwd` naming a non-repo directory while the process cwd is a repo — the exit still fires: root (A) governs, so the block is `NO_REPO`, not a D2 reason code (M83, the discriminating row). Failure of repo detection itself (e.g. corrupt `.git/HEAD`) is indistinguishable from a non-repo and takes this same exit. (The pipeline always runs in a checkout; a non-repo cwd cannot prove commit state.)
2. **G-DP2 — fetch toggle.** If `GUARD_FETCH_BEFORE_CHECK=true` (env var, default `false`/unset) **and the fetch is formable — an `origin` remote and a current branch both exist** (in the no-remote and detached-HEAD states of G-DP3 the fetch is skipped: its arguments do not exist) — run `git fetch origin {branch}` bounded by `GUARD_FETCH_TIMEOUT_SECS` (default `10`). Fetch failure/timeout changes nothing: proceed with the existing local ref state — network trouble alone never changes the decision class (G10 unreachable-origin row M59).
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
- BR-03-3: Verification is per-feature: each guarded directory is Verified or unverified independently; a deletion is judged against the state of the feature(s) its targets belong to. This per-feature judgment applies only once G-DP1 has established a repo — in a non-repo cwd the eager `NO_REPO` exit precedes it.

### Error scenarios

| Scenario | Behavior |
|---|---|
| `git` query fails after G-DP1 passes (corrupt ref, permission) | Cannot prove commit state → fail closed: BLOCK **`NOT_COMMITTED`** — deterministic, not a TSPEC choice; never exit 0 on git error (row M77). A failure of repo detection itself is the G-DP1 exit → `NO_REPO`. **Operational boundary (failure vs absence):** a ref is *absent* when the query completes and cleanly reports no such ref — **clean empty output with no error diagnostics** (the ref-lookup idiom's not-found result, which may carry a nonzero exit, e.g. `git show-ref`'s exit 1 with empty output) → the G4/G5 (or G-DP4 absence) routing applies. A *query failure* is any other outcome — an invocation error, or a nonzero exit accompanied by error diagnostics → this row's deterministic `NOT_COMMITTED`. A corrupt ref that git's own tooling surfaces indistinguishably from clean absence conformantly routes through G4/G5. **M77 therefore pins the fail-open class only** (an implementation that perceives the error and exits 0 fails it); its `NOT_COMMITTED` code is expected under both the failure branch and G5 in the default disk-only fixture, so the row does not discriminate the two conformant routings — the failure-vs-absence boundary above is what an implementation must honor in the unpinned corrupt-ref × LEARNINGS-committed cell |
| Fetch times out with toggle `true` | Identical to toggle `false` path (M59) |

---

## FSPEC-GUARD-04 — Degraded-mode flow

**Linked requirements:** REQ-GUARD-06

### Behavioral flow

1. **DG-DP1 — interpreter check (always first).** If no usable Python interpreter resolves (`python3`/`python`/`py`), enter degraded mode:
   - Run a **coarse conservative matcher in pure bash over the raw stdin text** (the full JSON blob — no field extraction is attempted).
   - **Decision:** BLOCK with reason `DEGRADED` iff the raw text matches a **degraded deletion-verb token** (set defined below) AND contains `docs/`, `CROSS-REVIEW`, or `CODE_REVIEW`; otherwise ALLOW. The `DEGRADED` message names the missing interpreter and `python3` as the remedy.
   - Degraded mode performs **no git verification** — guarded-looking deletions on a Python-less machine stay blocked until `python3` is installed.
2. **DG-DP2 — stdin parse.** Interpreter present but stdin JSON unparseable or empty → BLOCK `PARSE_ERROR` (stable hook contract means malformed input signals a harness bug or tampering). Stdin that **parses** but has `tool_input.command` absent or `null` is the same contract violation → BLOCK `PARSE_ERROR` (row M78; supersedes the current script's coerce-to-empty-and-allow at `guard-harvest-before-delete.sh:32`). A present-but-empty-string `command` is a well-formed payload: zero segments → D1 ALLOW (row M81 — the allow-side negative that makes M78's boundary falsifiable: an implementation testing the field's *falsiness* rather than its *presence* cannot distinguish `""` from absent, passes M78, and false-blocks the well-formed payload — it fails M81).
3. **Precedence.** When both degradations co-occur (no interpreter AND unparseable/empty stdin), **the DG-DP1 flow governs**: its matcher decides block-vs-allow over the raw stdin text, and a block carries `DEGRADED`, never `PARSE_ERROR` (`PARSE_ERROR` detection itself requires the interpreter). DG-DP1's decision rule is total, so no interpreter + token-matching malformed stdin → BLOCK `DEGRADED` (M71), while no interpreter + empty stdin → ALLOW (empty text matches no token; M72).
4. `check-scope-field.sh` is exempt: advisory by design; its interpreter-missing path remains a silent no-op.

### Business rule — degraded deletion-verb token set (CF-2, SE v4 F-02)

Defined **relative to REQ-GUARD-02's verb enumeration**, adapted to raw-text matching:

| Token class | Tokens | Matching rule |
|---|---|---|
| Word verbs | `rm`, `unlink`, `mv`, `truncate`, `find` | Word-boundary match anywhere in the raw stdin text. `rm` as a word also covers `git rm` (its second word); `find` covers `find … -delete` / `-exec` forms. Pinned by M42 (block) / M43 (allow) |
| Two-word verb | `git clean` | Whitespace-separated two-word sequence; bare `clean` is **not** a token. Pinned by M68 (block) and the M69 negative (`./scripts/clean docs/backup` → ALLOW) |
| Redirection operators | `>` (any occurrence of the character) | Lexically covers the whole REQ-GUARD-02 truncation family (`>`, `1>`, `>|`, `2>`, `&>`, `>&`) since each contains `>`; JSON uses `>` only inside string values, so an occurrence always comes from field content. Pinned by M70 |

Accepted degraded-mode over-match (same class as the REQ's field-bleed consequence, folded into REQ-GUARD-06's accepted-consequence list): the `>` rule also matches non-destructive `>>` and fd-duplication forms (`2>&1`), and word verbs may match tokens in non-command JSON fields (e.g. the Bash tool `description`). All such matches still require the `docs/` / `CROSS-REVIEW` / `CODE_REVIEW` conjunct to block. REQ-GUARD-NFR-01's no-false-block guarantee is explicitly waived while degraded; over-blocking is the intended fail-closed trade.

### Edge cases

| Case | Behavior |
|---|---|
| No interpreter, command `ls -la src/` | No token match → ALLOW (M43) |
| No interpreter, command `rm docs/f/CROSS-REVIEW-x.md` | Token + content match → BLOCK `DEGRADED` (M42) |
| No interpreter, `echo note >> docs/f/CROSS-REVIEW-x.md` | `>` + `docs/` match → BLOCK `DEGRADED` — accepted degraded false block (no matrix row; documented consequence) |
| No interpreter, `git clean -fd docs/backup` | Two-word token + `docs/` → BLOCK `DEGRADED` (M68) |
| No interpreter, `./scripts/clean docs/backup` | Bare `clean` is not a token → ALLOW (M69) |
| No interpreter, stdin `not-json{"cmd":"rm docs/f"}` | DG-DP1 governs the co-occurrence → BLOCK `DEGRADED`, never `PARSE_ERROR` (M71) |
| No interpreter, empty stdin | Matcher over empty text finds no token → ALLOW (M72) |
| Empty stdin, interpreter present | BLOCK `PARSE_ERROR` (M41) |
| Parseable stdin without `tool_input.command` (absent or `null`), interpreter present | BLOCK `PARSE_ERROR` (M78) |
| Parseable stdin with `tool_input.command` present but the empty string `""`, interpreter present | Well-formed payload, zero segments → D1 ALLOW (M81 — distinct from absent/`null`) |

---

## FSPEC-GUARD-05 — Scope-field check flow

**Linked requirements:** REQ-GUARD-04

### Behavioral flow

`check-scope-field.sh` runs as PostToolUse: Write|Edit (advisory — it can never block).

1. Extract `tool_input.file_path`. If the basename does not match `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md` → silent exit (row S07 — the branch that keeps every non-review Write/Edit noise-free, US-03).
2. Test the written file's content against the three exact patterns (POSIX ERE, case-sensitive on `Scope`): **P1** `^[[:space:]]*Scope:` (plain field line) · **P2** `^[[:space:]]*\*\*Scope(\*\*:|:\*\*)` (bold markdown, both spellings) · **P3** `\|[[:space:]]*Scope[[:space:]]*\|` (table header cell, any row position — deliberately not line-anchored).
3. **Decision:** any pattern matches → silent. No pattern matches → emit the missing-`Scope:` warning.
4. Prose substrings ("telescope", "the scope of this change") and lowercase `scope:` never match (S04–S06).
5. Interpreter missing → silent no-op (exempt from REQ-GUARD-06 by design).

Acceptance tests: S-rows S01–S07 of the Canonical Matrix.

---

## FSPEC-GUARD-06 — Block-message emission

**Linked requirements:** REQ-GUARD-07

### Behavioral flow

1. Every BLOCK exits 2 and writes to stderr a message beginning with the stable prefix `pdlc-guard[<REASON>]:`.
2. `<REASON>` is exactly one of `NOT_COMMITTED`, `NOT_PUSHED`, `INDETERMINATE`, `NO_REPO`, `PARSE_ERROR`, `DEGRADED`, selected mechanically by the decision path that produced the block:

| Decision path (this FSPEC) | Reason code |
|---|---|
| G-DP1 eager exit — deletion-shaped command (past D1), candidate root (A) not a git repo; precedes D2–D4, so no other row can co-match (M37, M75, M76, M83) | `NO_REPO` |
| D2 hit; feature state G2/G3/G5/G8/G9 | `NOT_COMMITTED` |
| D2 hit; feature state G4/G7/G10 | `NOT_PUSHED` |
| Git query failure after G-DP1 passes (state unprovable) | `NOT_COMMITTED` |
| D3 or D4 hit (reachable only inside a repo — G1 is exhausted by the eager exit above) | `INDETERMINATE` |
| DG-DP2 — unparseable/empty stdin, or parseable stdin lacking `tool_input.command` | `PARSE_ERROR` |
| DG-DP1 degraded block | `DEGRADED` |

3. Required message substrings per reason code are fixed by the REQ-GUARD-07 table (e.g. `NOT_COMMITTED` carries `LEARNINGS-{feature}.md` and the `/pdlc:harvest-learnings` instruction; G4 additionally `git push -u origin`; G10 additionally the `git fetch` hint). Exact prose beyond prefix + required substrings is owned by TSPEC; tests assert prefix + substrings, never full prose.

---

## Acceptance Tests

The acceptance-test suite is the REQ v1.5 **Canonical Block/Allow Matrix** — deletion-guard rows **M01–M83** and scope-check rows **S01–S07** — carried forward by reference, under REQ-GUARD-05's one-test-per-row obligation (bulk row M33 expands to one asserting test per referenced row; parameterized acceptable).

Matrix rows are **REQ-owned**: the nineteen rows this FSPEC's authoring and reviews produced — **M66** (CF-3, TE v4 F4-01), **M67–M79, S07** (iteration-1 FSPEC findings, REQ v1.4), and **M80–M83** (iteration-2 FSPEC findings, REQ v1.5, same commit as this revision) — live in the REQ matrix. M33's G6 re-run expansion set is extended there to include **M66, M67, M73, M74, M79, M80, and M82** (under G6 each resolves against a *Verified* guarded directory → ALLOW; for M82, D3(b) is unmet once no unverified guarded directory exists, so the `mv` falls through to ALLOW). The degraded rows M68–M72, the non-repo rows M75–M76, the mixed-root row M83 (root (A) is non-repo regardless of LEARNINGS state), the contract rows M77–M78, and the contract-boundary allow row M81 are git-state-independent or non-G6-constructible and are deliberately outside the re-run set.

M66 retains its full acceptance statement:

- **Who:** any agent / **Given:** default matrix fixture state; hook stdin carries no `cwd` field; the hook process is spawned with working directory `docs/f` / **When:** `rm *.md` / **Then:** exit 2, reason `NOT_COMMITTED` — candidate root (B) alone resolves the glob inside the unverified guarded directory, exercising the union rule's second disjunct (an (A)-only implementation must fail this row).

All nineteen rows are hermetically writable in the existing jest harness (spawn cwd, stdin content — including the stdin `cwd` field for M83 and the empty-string `command` for M81 — restricted `PATH`, `CLAUDE_PROJECT_DIR`, and fixture-repo git state — including a corruptible `origin/{branch}` ref file for M77 — are all controllable), per REQ-GUARD-05's test-environment requirements.

---

## Carry-Forward Resolutions (v4 approved-with-minor findings)

The iteration-4 reviews approved REQ v1.3 with three Low findings, each explicitly deferrable to this FSPEC with a back-reference. All three are resolved here:

| CF | Source | Finding | Resolution in this FSPEC |
|---|---|---|---|
| CF-1 | SE v4 F-01 | `>&` disambiguation stated as "followed by a digit"; bash's rule is "word entirely digits (or `-`)" — a digit-leading non-numeric word (`>& 2024-notes/CROSS-REVIEW-x.md`) was unclassified | FSPEC-GUARD-02 redirection rule 1: fd-duplication iff the word after `>&` **consists entirely of digits or is exactly `-`**; any other word is a truncating file target. Supersedes the REQ M62 phrasing. *(v1.1: discriminating matrix row M67 added — TE FSPEC F-01.)* |
| CF-2 | SE v4 F-02 | Degraded-mode "deletion-verb token" set undefined relative to REQ-GUARD-02's enumeration (which includes redirection operators) | FSPEC-GUARD-04 business rule: explicit token set — word-boundary verbs `rm`, `unlink`, `mv`, `truncate`, `find`; two-word `git clean`; the character `>` covering the whole truncation-redirection family — with the over-match consequences named and folded into the REQ-GUARD-06 accepted-consequence list. *(v1.1: token-class and precedence rows M68–M72 added — TE FSPEC F-02/F-03.)* |
| CF-3 | TE v4 F4-01 | Union rule's "either" disjunction had no matrix row where candidate root (B) alone triggers the block — an (A)-only implementation would pass the whole matrix | § Acceptance Tests adds row **M66** (block via hook process cwd alone) and extends M33's G6 re-run set to include it |

---

## Reviewer Findings Disposition (v1.0 → v1.1)

| Finding | Resolution |
|---|---|
| SE F-01 (Medium — `mv` flow evaluated indeterminacy before the static-source guarded-dir test, contradicting BR-01-1 and flipping an observable reason code) | FSPEC-GUARD-02 `mv` flow reordered: static-source D2 test (guarded dir itself / ancestor) now precedes the indeterminacy jump; an indeterminate destination never diverts a static-guarded-dir source to D3; BR-01-1 restated to bind the `mv` flow explicitly; matrix row M74 pins `mv docs/f "$DEST"` → `NOT_COMMITTED` |
| SE F-02 (Medium — G1 ambiguous between eager early-exit and lazy per-feature state; GUARD-06 table doubly matched D3/D4-in-non-repo) | **Eager** chosen: G-DP1 is an early exit — any deletion-shaped command (past D1) in a non-repo cwd blocks `NO_REPO` before D2–D4 (FSPEC-GUARD-01 step 8; FSPEC-GUARD-03 G-DP1); BR-03-3 scoped to in-repo; GUARD-06 table disambiguated (eager row precedes and exhausts G1, so D3/D4 rows are repo-only); rows M75 (unguarded-target deletion in non-repo → `NO_REPO`) and M76 (D3-shaped in non-repo → `NO_REPO`, not `INDETERMINATE`) |
| SE F-03 (Medium — recursion-cap latitude licensed D3 treatment of verb-free over-cap payloads, violating REQ-GUARD-NFR-01/D1) | Edge case rewritten: an over-cap payload is treated as **opaque** → D1 ALLOW, never deletion-shaped; REQ RR-3 extended in v1.4 (same commit) to register the over-cap bypass surface; depth-2 row M73 pins minimum recursion |
| SE F-04 (Low — union rule stated only for segment 1) | Step 6: the initial union cwd applies to every segment until a `cd` segment updates it; M18 cited |
| SE F-05 (Low — fetch unformable in the states G-DP3 detects) | G-DP2 conditioned on formability (an `origin` remote and a current branch both exist); skipped in no-remote/detached states |
| SE F-06 (Low — "TSPEC picks the nearest G-state" non-deterministic) | Git-query failure after G-DP1 passes → deterministic `NOT_COMMITTED`; repo-detection failure → `NO_REPO`; GUARD-06 row added; matrix row M77 |
| SE F-07 (Low — parseable stdin without `tool_input.command` undecided) | Absent/`null` `command` → `PARSE_ERROR` (contract violation, consistent with DG-DP2's rationale; supersedes the current coerce-to-empty-and-allow); empty-string `command` → D1 ALLOW; matrix row M78 |
| SE Q-01 (degraded "iff" freezes the over-match surface — intended?) | Answered: yes, intended. The over-match surface is normative for oracle stability — allow rows M43/M69/M72 pin the allow side, block rows M42/M68/M70 the block side. Narrowing the surface (e.g. excluding `>>`) is a REQ change, not implementation freedom |
| TE F-01 (Medium — CF-1's corrected `>&` rule unverifiable from the oracle) | Matrix row M67 (nested guarded `docs/f/2024-notes/CROSS-REVIEW-x.md`; `cd docs/f && npm test >& 2024-notes/CROSS-REVIEW-x.md` → BLOCK `NOT_COMMITTED`); included in M33's G6 re-run set |
| TE F-02 (Medium — degraded token classes unpinned; DG precedence unpinned) | Rows M68 (`git clean` two-word token), M69 (bare-`clean` negative), M70 (`>` character class), M71 (DG-DP1→DG-DP2 precedence co-occurrence → `DEGRADED`, never `PARSE_ERROR`) |
| TE F-03 (Low — precedence prose vs DG-DP1's total rule for empty stdin) | Step 3 reworded: the DG-DP1 flow governs the co-occurrence (matcher decides block-vs-allow; a block carries `DEGRADED`); M71 pins the block side, M72 the empty-stdin allow side; REQ-GUARD-06 case-2 prose aligned in v1.4 |
| TE F-04 (Low — guarded-directory enumeration root unanchored) | Step 8: enumeration anchored at the repo root — `CLAUDE_PROJECT_DIR` when set, else `git rev-parse --show-toplevel` — never the process or stdin cwd |
| TE F-05 (Low — git-error-in-repo branch rowless) | Row M77 — strengthened beyond the asked-for prefix-only assertion: reason code deterministically `NOT_COMMITTED` (per SE F-06 resolution) |
| TE F-06 (Low — basename-filter branch has no S-row) | Row S07 (non-matching basename, no Scope pattern → silent) |
| TE F-07 (Low — multi-source `mv` undecided) | Step 0 generalization: last operand is the destination; each source evaluated independently; any BLOCK blocks; row M79 |
| TE F-08 (Low — recursion depth ≥ 2 rowless) | Row M73 (`bash -c 'eval "rm docs/f/*.md"'` → BLOCK `NOT_COMMITTED`); in M33's G6 re-run set |
| TE F-09 (Low, **Process**) | Recorded for harvest into LEARNINGS: **a carry-forward or review resolution that creates or changes decidable behavior must amend the Canonical Matrix in the same edit, not just prose** — applied throughout this revision (every behavior-changing fix above lands with its matrix row) |

---

## Reviewer Findings Disposition (v1.1 → v1.2)

| Finding | Resolution |
|---|---|
| SE F2-01 (Medium — `mv` flow step 3's v1.1 rewrite narrowed indeterminate-destination → D3 routing below the REQ and the general D3, reopening an `mv`-overwrite vector) | Step 3 restored to the REQ's breadth: source **or destination** indeterminate → D3, no source-guardedness qualifier (the qualifier was unnecessary once step 2 runs first — M74 and every existing `mv` row re-traced, none regress); matrix row **M82** pins the reopened case: `D=docs/f; mv /tmp/notes.md "$D"/CROSS-REVIEW-x.md` → BLOCK `INDETERMINATE`; M82 added to M33's G6 re-run set |
| SE F2-02 (Low — three cwd notions; G-DP1 never says which it tests) | Pinned: G-DP1 tests **candidate root (A)** — stdin `cwd` when present, else `CLAUDE_PROJECT_DIR`; process cwd only when neither exists (FSPEC-GUARD-01 step 8, FSPEC-GUARD-03 G-DP1); the enumeration anchor's `rev-parse` fallback resolves from the same root, making step 8's two halves one mechanism; discriminating mixed-root row **M83** (stdin `cwd` = non-repo dir, process cwd = fixture repo → `NO_REPO`, not `NOT_COMMITTED`) |
| SE F2-03 (Low — REQ-GUARD-01's decision-rule list omits the eager repo-check position; v1.4's "no requirement semantics changed" framing wrong for M75–M76) | REQ v1.5: decision-rule preamble amended to name the eager repo check between D1 and D2 (D1 → repo check → D2 → D3 → D4 → allow); v1.4 revision-history row corrected — M75–M76 flipped a v1.3-ALLOW class to BLOCK `NO_REPO` (mirrors the CF-1 supersession treatment) |
| SE F2-04 (Low — "git query failure" vs "ref absent" boundary not operational; M77's fixture cannot discriminate the rule) | FSPEC-GUARD-03 error scenario defines the boundary: ref-absent = clean empty output with no error diagnostics (nonzero exit permitted, e.g. `git show-ref`'s not-found idiom) → G4/G5 routing; query failure = any other error outcome → deterministic `NOT_COMMITTED`; a corrupt ref indistinguishable from clean absence conformantly routes G4/G5, and M77 is annotated as pinning the **fail-open class only** |
| TE F2-01 (Low — every-segment union rule has no discriminating row) | Matrix row **M80**: no stdin `cwd`, process cwd = `docs/f`, `echo done && rm *.md` → BLOCK `NOT_COMMITTED` — a segment-2 glob resolved via candidate root (B) alone, killing the segment-1-only union implementation; added to M33's G6 re-run set; cited in step 6 |
| TE F2-02 (Low — empty-string-`command` allow branch rowless; Python falsy trap) | Matrix row **M81**: parseable stdin, `tool_input.command` = `""` → ALLOW (exit 0) — the M69-style negative that makes M78's boundary falsifiable; a falsiness-testing implementation passes M78 but fails M81; cited in DG-DP2 |

---

## Open Questions

None. All reviewer questions across four REQ iterations are answered inline in REQ v1.5, the three v4 carry-forwards are resolved above, and both FSPEC review iterations are fully dispositioned (SE Q-01 answered in the v1.0 → v1.1 disposition table; no iteration-2 questions). Behavior is fully specified by the flows in this document plus the Canonical Matrix M01–M83 / S01–S07.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-02 | Initial draft from REQ v1.3: decision flows for parsing discipline (D1–D4), `mv` resulting-path rule and redirection classification, git-state verification (G1–G10), degraded mode, scope check, and reason-code emission; matrix carried forward by reference with FSPEC-added row M66; v4 carry-forwards CF-1–CF-3 resolved |
| 1.1 | 2026-07-02 | Addressed all iteration-1 FSPEC findings (SE: 3 Medium + 4 Low + Q-01; TE: 2 Medium + 7 Low): `mv` flow reordered to honor D2-before-D3 with multi-source generalization; G1 defined as eager `NO_REPO` early exit with GUARD-06 table disambiguated; over-cap opaque recursion resolved to D1-allow under extended RR-3; DG precedence governed by the DG-DP1 flow; deterministic git-error reason code; missing-`tool_input.command` → `PARSE_ERROR`; union-cwd every-segment clarification; enumeration root anchored; fetch formability precondition. Matrix rows M67–M79 and S07 (plus M66's promotion) added to the REQ Canonical Matrix v1.4 in the same commit — matrix rows are REQ-owned; TE F-09 process rule applied and recorded for harvest |
| 1.2 | 2026-07-02 | Addressed all iteration-2 FSPEC findings (SE: 1 Medium + 3 Low; TE: 2 Low): `mv` flow step 3 restored to the REQ's unconditional source-or-destination-indeterminate → D3 breadth, closing the unguarded-source/indeterminate-destination overwrite vector (SE F2-01); G-DP1's cwd notion pinned to candidate root (A) with the enumeration anchor unified onto the same root (SE F2-02); git query-failure vs ref-absence boundary defined operationally, M77 annotated as pinning the fail-open class only (SE F2-04). Matrix rows M80–M83 added to the REQ Canonical Matrix v1.5 in the same commit (M80 every-segment union discriminator — TE F2-01; M81 empty-string-`command` allow negative — TE F2-02; M82 `mv` overwrite pin — SE F2-01; M83 mixed-root G-DP1 discriminator — SE F2-02); M33 G6 re-run set extended with M80 and M82; REQ-GUARD-01 decision-rule preamble and the v1.4 revision-history framing corrected in REQ v1.5 (SE F2-03) |
