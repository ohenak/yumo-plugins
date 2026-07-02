---
Status: Draft
Author: pm-author
Version: 1.7
Feature: harden-harvest-guard
ready: true
depends-on: []
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | [CROSS-REVIEW-software-engineer-REQ.md](CROSS-REVIEW-software-engineer-REQ.md), [CROSS-REVIEW-test-engineer-REQ.md](CROSS-REVIEW-test-engineer-REQ.md), [CROSS-REVIEW-software-engineer-REQ-v2.md](CROSS-REVIEW-software-engineer-REQ-v2.md), [CROSS-REVIEW-test-engineer-REQ-v2.md](CROSS-REVIEW-test-engineer-REQ-v2.md), [CROSS-REVIEW-software-engineer-REQ-v3.md](CROSS-REVIEW-software-engineer-REQ-v3.md), [CROSS-REVIEW-test-engineer-REQ-v3.md](CROSS-REVIEW-test-engineer-REQ-v3.md) |
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
| **Guarded file** | A file matching `CROSS-REVIEW-*.md` or `CODE_REVIEW-*.md` anywhere under a `docs/{feature}/` directory — **including nested subdirectories** (e.g. `docs/f/archive/CROSS-REVIEW-x.md` is guarded). |
| **Guarded directory** | A top-level `docs/{feature}/` directory whose subtree contains at least one guarded file. Nested subdirectories are part of the guarded directory, not guarded directories of their own. |
| **Feature name derivation** | `{feature}` is the **first path segment under `docs/`** on the guarded file's path — NOT the immediate parent directory. A guarded file at `docs/f/archive/CROSS-REVIEW-x.md` belongs to feature `f`, and moving a guarded file into a subdirectory never changes its feature. The guard requires the exact filename `LEARNINGS-{feature}.md` at the **top level** of `docs/{feature}/` in the committed tree — a `LEARNINGS-<anything-else>.md` (anywhere) does NOT satisfy the guard. |
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
| RR-2 | Indeterminate deletion whose own segment carries no textual `docs` reference — via operands, assignment dataflow, piped producers, or `cd` context (e.g. `rm "$D"/*.md` where `$D` was set in a *previous* Bash tool call, or where the only `docs/` token sits in an unrelated sibling segment like a following `git add docs/f/…`) | Blocking every variable-expanded delete repo-wide would false-block routine work (temp-file cleanup, log redirection in the harvest/commit flow itself) whenever any feature is mid-pipeline — a direct NFR-01 violation. Decision rule D3's segment-scoped `docs`-reference discriminator catches all in-context spellings; the cross-segment-only class is the accepted remainder. |
| RR-3 | Fully opaque execution with no visible deletion verb (`eval "$CMD"`) — **including opaque payloads nested beyond any implementation-chosen recursion-depth cap**, which are treated as opaque (no visible deletion verb), never as deletion-shaped | No deletion verb is observable anywhere in executable position; blocking all `eval`/`bash -c` would violate NFR-01. Guaranteed by decision rule D1. Treating an over-cap payload as indeterminate-deletion-shaped would false-block verb-free commands that merely mention `docs/` — a direct NFR-01 (P0) violation — so cap exhaustion falls into this accepted class instead. |
| RR-4 | Remoteless/detached-HEAD fallback (G2/G3) accepts LEARNINGS that is committed to `HEAD` but never pushed — e.g. `git checkout --detach` in one Bash call, then delete in the next, satisfies the guard with a local-only commit | In remoteless/detached contexts, local commit is the strongest verifiable state; permanent blocking would make those checkouts (incl. CI) unusable. Documented weakening of the "pushed" guarantee per REQ-GUARD-03. |
| RR-5 | Cwd drift the step-4 tracking cannot see — **cross-call**: the Bash tool's shell cwd persists across tool calls (`cd docs/f` in call 1, `rm *.md` in call 2), and when the hook stdin carries no cwd signal that tracks the persisted shell, no candidate root may reflect the real shell cwd — the static relative operand then resolves against the wrong root and the deletion is allowed; and **same-call** drift via the untracked directory-stack builtins `pushd`/`popd` (`pushd docs/f; rm *.md`), which are outside the REQ-GUARD-01 step-4 `cd` rule | The hook cannot observe the persisted shell. Mitigation is the REQ-GUARD-01 step-4 **union rule**: static relative operands are resolved against both candidate roots (stdin `cwd` when present, else repo root; plus the hook process cwd) and blocked if either resolution lands in/over an unverified guarded directory. Whatever drift survives the union (M65) is accepted; `pushd`/`popd` are deliberately outside the `cd` tracking rule (the step-4 rule is a closed enumeration, and a harvest agent does not spell directory changes with the stack builtins) — same accepted class. |
| RR-6 | Deletion verbs inside `$( … )` / backtick command substitutions in **arguments of non-deletion verbs** — e.g. `echo $(rm docs/f/CROSS-REVIEW-x.md)`, where the `rm` really executes | D1 opacity: the argument position is data under the REQ-GUARD-01 discipline, and recursive re-parsing is scoped to the three opaque-execution verbs (`eval`, `bash -c`, `sh -c`). Extending re-parsing to every verb's substitution payloads would scan data-by-position (`git commit -m "$(date)"`) and multiply false-block surface against NFR-01 (P0) — adjacent to RR-1/RR-3. When the substitution sits in a *deletion* verb's operand it already renders that operand indeterminate → D3 (M20). |
| RR-7 | Degraded-mode (REQ-GUARD-06 case 1) under-match when the hook's JSON producer escapes `/` as `\/` (legal JSON): the coarse matcher's `docs/` content conjunct misses, so a `docs/`-path deletion whose raw text carries no `CROSS-REVIEW`/`CODE_REVIEW` token is allowed while degraded | The escaping is producer-owned serialization — the Claude Code harness does not `\/`-escape, and the deleting agent cannot influence how the harness serializes its command — and any command naming a guarded file still matches via the `CROSS-REVIEW`/`CODE_REVIEW` conjuncts. Same accepted class as REQ-GUARD-06's field-bleed consequence. |

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

1. **Shell-style tokenization with quote removal, then segmentation.** The command is split into simple commands at unquoted `;`, `&&`, `||`, `|`, `&`, and newlines, and each segment is tokenized shell-style with **quote removal**. Quoting controls whether text is *literal* or *expandable* — **never whether it is inspected**. A quoted operand of a deletion verb is still a candidate path: `rm "docs/f/CROSS-REVIEW-x.md"` and `rm 'docs/f/CROSS-REVIEW-x.md'` are, after quote removal, the same static operand as the unquoted spelling and are classified identically. What is excluded from verb/path scanning is **data by position**, not data by quoting: string arguments of non-deletion verbs (e.g. the message of `git commit -m "..."`) and heredoc bodies never trigger the guard — with one exception: the string payload of an opaque-execution verb (`eval`, `bash -c`, `sh -c`) is code and is recursively re-parsed under this same discipline.
2. **Verb identification.** The verb of each simple command is its first word after skipping leading `NAME=value` assignments and transparent prefixes (`command`, `env`, `sudo`, `nice`, `time`). `xargs <verb>` exposes `<verb>` as the effective verb whose operands are the piped input (always indeterminate). `find` with `-delete` or `-exec <deletion-verb>` is a deletion form whose operands are `find`'s path roots.
3. **Operand scoping.** Only operands (non-flag argv tokens) of deletion verbs are inspected as candidate paths. Tokens inside arguments of non-deletion verbs (e.g. the message string of `git commit -m "..."`, arguments to `echo`, `grep` patterns) NEVER trigger the guard.
4. **Effective-cwd tracking.** *Initial effective cwd (union rule):* the Bash tool's shell cwd **persists across tool calls**, and the hook cannot observe that shell directly, so the guard SHALL NOT assume a single root when resolving static relative operands and globs — in **every** segment, not only segment 1: segment position never changes the resolution root until a `cd` segment updates it (row M80 pins the every-segment application discriminatingly). It resolves them against **both candidate roots**: **(A)** the `cwd` field of the hook stdin JSON when present, else `CLAUDE_PROJECT_DIR` (the repo root); and **(B)** the hook process's own working directory — and blocks if **either** resolution lands in or over an unverified guarded directory (conservative union; the extra false-block surface is the accepted cost, consistent with the fail-closed posture). The stdin `cwd` field is a **candidate root, not a guarantee**: the hook API does not promise it tracks the Bash tool's *persisted* shell cwd (it may report the session/project directory) *(answers reviewer question SE Q-01, iteration 3)*. Cross-call `cd` drift that no candidate root reflects is residual risk **RR-5**, mitigated by this union rule. *Within* a compound command: `cd <static-path>` segments update the effective cwd for subsequent segments; `cd` with an indeterminate argument makes all subsequent relative operands indeterminate.
5. **Operand classification (literal vs expandable).** An operand is **static** iff, before quote removal, it contains no **expansion-active** `$`, backtick, `$(`, or `<(`. *Expansion-active* means neither single-quoted nor backslash-escaped — **double quotes do NOT suppress expansion**: `"$D"` is indeterminate, while `'$D'` and `\$D` are the literal characters `$D` and therefore static. A fully double-quoted static string (`"docs/f/x.md"`) contains no expansion construct and is static. Static operands and globs are resolved/expanded against the effective cwd. Any operand containing an expansion-active construct is **indeterminate**.

**Decision rules (in order; first match wins).** The full evaluation order is **D1 → eager repo check → D2 → D3 → D4 → fall-through allow**: immediately after D1 passes (the command is deletion-shaped), the guard checks whether candidate root (A) (step 4) is a git repository — if not, git state G1 applies and **every** deletion-shaped command blocks `NO_REPO` here, before D2–D4 are evaluated (REQ-GUARD-03 G1; matrix rows M37, M75–M76, M83). *(Position stated explicitly in v1.5; the v1.4 matrix rows M75–M76 already pinned this ordering — SE FSPEC-v2 F2-03.)*

- **D1 — No visible deletion verb → ALLOW.** If no deletion verb appears in executable position in any segment (including recursively scanned opaque payloads), the command is allowed unconditionally. This rule has precedence and is the mechanism by which REQ-GUARD-NFR-01 and REQ-GUARD-01 coexist: free text can never trigger a block.
- **D2 — Static guarded target → BLOCK.** A deletion verb with a static operand that resolves to, or globs over, **(i)** a guarded file, **(ii)** any path inside an unverified guarded directory, **(iii)** an unverified guarded directory itself, or — for **recursive-capable deletion forms** — **(iv)** any **ancestor** of an unverified guarded directory (`docs`, `.`, `..`, the repo root, `/`) is blocked (reason code per REQ-GUARD-03 state). Recursive-capable forms are: `rm` with `-r`/`-R`/`--recursive` (all spellings of the same flag, incl. combined forms like `-rf`), `find <root> … -delete` / `-exec <deletion-verb>` (the operand is `find`'s path root — an ancestor root reaches the guarded subtree regardless of any `-name` filter), `git clean` with a pathspec, and `mv` whose source is a directory. Non-recursive forms aimed at an ancestor directory (e.g. plain `rm docs`) cannot destroy guarded files and fall through.
- **D3 — Indeterminate deletion, docs-referencing → BLOCK.** A deletion verb with at least one indeterminate operand (or a deletion-shaped redirection with an indeterminate target) is blocked with reason `INDETERMINATE` iff **(a)** the **deletion segment itself** references `docs/` — a token whose post-quote-removal **literal text** contains the segment `docs/` appears (1) among that simple command's operands or redirection targets, (2) in the RHS of a `NAME=value` assignment, anywhere in the same compound command, whose variable the deletion segment's operands expand (`D=docs/f; rm "$D"/*.md` and `D="docs/f"; rm "$D"/*.md` both qualify — quoting style is irrelevant to the literal test), (3) in a segment whose output is **piped into** the deletion segment (piped input is the deletion verb's operand stream, e.g. `ls docs/f | xargs rm`), or (4) in a `cd` argument that sets the deletion segment's effective cwd — AND **(b)** at least one unverified guarded directory exists in the repo. `docs/` tokens appearing only in **other** segments with no dataflow into the deletion segment (e.g. a following `git add docs/f/…`) do NOT satisfy (a). Otherwise it is allowed (residual risk RR-2).
- **D4 — Pathspec-less `git clean` → BLOCK.** `git clean` with no pathspec targets every untracked file repo-wide; it is blocked with reason `INDETERMINATE` iff any unverified guarded directory exists. The `docs`-reference qualifier of D3 is waived because the target scope is repo-wide by construction. *(Answers reviewer question TE-Q-02.)*

A deletion verb aimed at a `docs/` directory that contains **no** guarded files is unguarded — allowed even when its operands are only partially resolvable, because D2/D3 both require an unverified guarded directory to exist. *(Answers reviewer question SE-Q-02.)*

**Acceptance criteria:**
- **Who:** harvest agent / **Given:** `docs/f/CROSS-REVIEW-x.md` exists and LEARNINGS is not committed / **When:** it runs `rm docs/f/*.md` / **Then:** exit 2, message carries reason code per REQ-GUARD-03 state (D2).
- **Who:** harvest agent / **Given:** same state / **When:** it runs `rm docs/f/CROSS-REVIEW-x.md` / **Then:** blocked (existing behavior preserved, D2).
- **Who:** harvest agent / **Given:** same state / **When:** it runs `rm "docs/f/CROSS-REVIEW-x.md"` or `rm 'docs/f/CROSS-REVIEW-x.md'` / **Then:** blocked — quote removal precedes classification; quoting a path never hides it (D2).
- **Who:** harvest agent / **Given:** same state / **When:** it runs `rm -rf docs/f`, `rm -rf docs`, or `rm -rf .` from the repo root / **Then:** blocked — static operand is the unverified guarded directory itself or an ancestor of it, with a recursive-capable form (D2 iii/iv).
- **Who:** harvest agent / **Given:** same state / **When:** it runs `find . -name '*.md' -delete` or `find docs -delete` / **Then:** blocked — `find`'s path root is an ancestor of the unverified guarded directory (D2 iv).
- **Who:** any agent / **Given:** same state / **When:** it runs `rm src/foo.ts` / **Then:** allowed — no guarded target (D2 miss, no indeterminate operand).
- **Who:** any agent / **Given:** same state / **When:** `rm /tmp/x.log && git add docs/f/y.md` / **Then:** allowed — the deletion segment's static operand is unguarded; the `docs/` token in the sibling `git add` segment has no dataflow into it (D3(a) unmet).
- **Who:** harvest agent / **Given:** same state / **When:** `cd docs/f && rm *.md` / **Then:** blocked — same-call effective-cwd tracking resolves `*.md` under `docs/f` (D2).
- **Who:** harvest agent / **Given:** same state; a **previous** Bash call ran `cd docs/f` and the hook stdin `cwd` field reports `docs/f` / **When:** `rm *.md` / **Then:** blocked — candidate root (A) resolves the glob inside the unverified guarded directory (step-4 union rule, D2).
- **Who:** any agent / **Given:** same state; hook stdin carries no cwd signal and the hook process cwd is the repo root / **When:** `rm *.md` / **Then:** allowed — neither candidate root resolves into a guarded directory; that the real persisted shell cwd might be `docs/f` is residual risk RR-5.
- **Who:** harvest agent / **Given:** same state / **When:** `rm $(find docs/f -name 'CROSS-*')` / **Then:** blocked, reason `INDETERMINATE` (D3: command substitution + `docs/` token).
- **Who:** harvest agent / **Given:** same state / **When:** `ls docs/f | xargs rm` / **Then:** blocked, reason `INDETERMINATE` (D3: `xargs rm` = deletion verb with indeterminate operands + `docs/` token).
- **Who:** harvest agent / **Given:** same state / **When:** `bash -c 'rm docs/f/*.md'` or `eval "rm docs/f/*.md"` / **Then:** blocked — opaque payload recursively parsed (D2 inside payload).
- **Who:** harvest agent / **Given:** same state / **When:** `D=docs/f; rm "$D"/*.md` or `D="docs/f"; rm "$D"/*.md` / **Then:** blocked, reason `INDETERMINATE` (D3: indeterminate operand + `docs/` literal in the assignment RHS the operand expands — quoting of the RHS is irrelevant).
- **Who:** any agent / **Given:** same state / **When:** `rm "$SCRATCH"/*.log` (no `docs` token anywhere in the command) / **Then:** allowed (D3 condition (a) unmet — RR-2).
- **Who:** any agent / **Given:** same state / **When:** `eval "$CMD"` / **Then:** allowed (D1 — no visible deletion verb; RR-3).

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01, US-02

#### REQ-GUARD-02
**Title:** Deletion-verb coverage, `mv` semantics, and redirection

**Description:** The **defended deletion verbs** are exactly: `rm`, `unlink`, `git rm`, `git clean`, `find … -delete`, `find … -exec <deletion-verb>`, `mv` (per the semantics below), `truncate`, and shell redirection `>` / `>|` / `&>` / `>& <path>` / `N>` — where `N` is **any** file-descriptor digit-string (`1>`, `2>`, `3>`, `9>`, … — M90 pins the `N ∉ {1, 2}` membership) — whose target is a guarded file. Verbs may appear in any segment of a compound command (`;`, `&&`, `||`, `|`, `&`, newline) and inside `xargs` / `eval` / `bash -c` / `sh -c` payloads per the REQ-GUARD-01 discipline. This is an enumerated defense, not a completeness claim — undefended verbs are residual risk RR-1 (see Residual Risk Register), and US-01 is scoped accordingly.

**`git clean` rationale:** `git clean` only removes *untracked* files, and guarded files are normally committed — but `CODE_REVIEW-*` files written during Phase DOD and `CROSS-REVIEW-*` files mid-review are legitimately untracked at points in the pipeline. The verb is defended to protect exactly those not-yet-committed review artifacts; TSPEC must not treat its inclusion as arbitrary.

**`mv` semantics** (all paths canonicalized — `.`, `..`, trailing slashes resolved — against the effective cwd before comparison). One coherent rule pair over the **resulting file path** — if the destination is a directory (existing, or spelled with a trailing `/`), the resulting path is `destination/basename(source)`; otherwise the destination itself. **First, the destination-destruction test (source guardedness — and source *determinacy* — irrelevant):** a `mv` whose resulting path — or whose static destination — is an **existing** guarded file in an unverified guarded directory BLOCKS with the reason code of the affected feature's REQ-GUARD-03 state: the move overwrites, i.e. destroys, that file — the fully static twin of M82's indeterminate spelling, and the same destruction family as redirection truncation of the same file (M14/M16). Because a **static destination alone can prove the destruction**, this test precedes any indeterminacy jump to D3: when the destination is static (canonicalized path not an existing directory, not spelled with a trailing slash) and names an existing guarded file in an unverified guarded directory, the G-state code — with its provable harvest/commit guidance — fires even when the source is indeterminate (M87, the destination-side twin of M74's source-side D2-before-D3 rule); `INDETERMINATE` remains the reason for the genuinely unknowable cells only. The *existing* qualifier is what keeps pattern-preserving renames and moves to fresh paths (M11, M52) allowed: their resulting paths name no existing file. **Then, for guarded sources:** the move is **allowed iff the resulting path is still under the same feature's `docs/{feature}/` subtree** (any depth — nested subdirectories included; the feature name is derived from the first path segment under `docs/`, so protection follows the file into subdirectories, per Definitions) **AND the resulting basename still matches `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md`**. `mv` operands are judged by this rule pair, not by the plain D2 path tests: a guarded static source renaming in place ALLOWs (M11) where a literal D2(i) reading would block, and the destination-destruction test above is the only destination-guardedness rule *(SE/TE FSPEC-v3 F3-01)*. Everything else blocks:

| Case | Decision |
|---|---|
| Source is/globs a guarded file in an unverified guarded dir; resulting path outside that feature's `docs/{feature}/` subtree (incl. `/tmp`, `/dev/null`, `docs/{other-feature}/`, repo root) | BLOCK — move-out is deletion |
| Same source; resulting path inside the same feature's subtree AND resulting basename still matches the guarded pattern — covers rename in place (`… docs/f/CROSS-REVIEW-x-v2.md`) and move into a subdirectory (`mv docs/f/CROSS-REVIEW-x.md docs/f/archive/` → resulting path `docs/f/archive/CROSS-REVIEW-x.md`) | ALLOW — the guarded artifact and its feature association are preserved *(answers reviewer questions SE-Q-01 iter-1 and TE F2-02)* |
| Same source; resulting path inside the same feature's subtree but resulting basename no longer matches the guarded pattern | BLOCK — pattern-destroying rename is equivalent to deletion |
| Source is an unverified guarded directory itself, or (recursive-capable form, D2 iv) an ancestor of one (`mv docs/f <anywhere>`, `mv docs <anywhere>`) | BLOCK — the path anchor and its LEARNINGS-verification context move |
| Static destination whose resulting path is an **existing** guarded file in an unverified guarded directory — source guardedness irrelevant (`mv /tmp/notes.md docs/f/CROSS-REVIEW-x.md`; guarded-over-guarded `mv docs/f/CROSS-REVIEW-x.md docs/f/CODE_REVIEW-f-v1.md` likewise; directory destination whose resulting path collides, `mv /tmp/CROSS-REVIEW-x.md docs/f/`, likewise) | BLOCK — destination-destruction: the overwrite destroys the guarded file (M84, M88, M89; symmetric with truncation M14/M16 and with M82's indeterminate spelling) |
| **Indeterminate source; static destination** naming an **existing** guarded file in an unverified guarded directory (destruction statically certain from the destination alone) | BLOCK with the affected feature's REQ-GUARD-03 reason code — **not** `INDETERMINATE`: the destruction test above precedes D3 (M87) |
| Indeterminate source or destination otherwise (resulting path genuinely unknowable) | Decision rule D3 applies (`INDETERMINATE`) |

**Redirection semantics:** `>`, `>|` (noclobber override — the spelling produced exactly when a plain `>` was refused), `N>` for **any** file-descriptor digit-string `N` — `1>` (byte-for-byte equivalent to `>`), `2>`, and equally `3>`, `9>`, …: opening the redirection truncates the target file identically whichever fd number is named, so a digit-boundary allow would be incoherent with this truncation family (M90 pins the `N ∉ {1, 2}` cell) — `&> file` (bash: truncate `file` and redirect both stdout and stderr — same truncation family as `>`), or `>& file` (bash synonym for `&>` when the token after `>&` is not a file descriptor number) whose static target resolves to a guarded file in an unverified guarded directory → BLOCK (truncation is deletion). `>>` (append) is not destructive → ALLOW — and neither are the `N>>` append forms. **Fd-duplication forms (`2>&1`, `>&2`, `N>&M`) name file descriptors, not paths — they are never redirection targets and never deletion-shaped.** The `>&` disambiguation is lexical: `>&` followed by a digit (`>&2`, `>&1`) is fd-duplication and never a target; `>&` followed by a non-digit word (`>& docs/f/x.md`) is a truncating file redirection. Indeterminate redirection target → deletion-shaped, D3 applies (scoped to the segment's own tokens per D3(a): `npm test > "$LOG" 2>&1; git add docs/f/z.md` is allowed).

**Acceptance criteria:**
- **Who:** agent / **Given:** guarded files present in `docs/f`, LEARNINGS unverified / **When:** `find docs/f -name 'CROSS-*' -delete`, `find docs/f -name '*.md' -exec rm {} \;`, `git clean -fd docs/f`, `truncate -s 0 docs/f/CROSS-REVIEW-x.md`, or `mv docs/f/CODE_REVIEW-f-v1.md /tmp/` / **Then:** blocked.
- **Who:** agent / **Given:** same state / **When:** `git clean -fd` with no pathspec / **Then:** blocked, reason `INDETERMINATE` (D4).
- **Who:** agent / **Given:** same state / **When:** `mv docs/f/CROSS-REVIEW-x.md docs/f/CROSS-REVIEW-x-v2.md` / **Then:** allowed (rename in place, pattern preserved).
- **Who:** agent / **Given:** same state, `docs/f/archive/` exists / **When:** `mv docs/f/CROSS-REVIEW-x.md docs/f/archive/` / **Then:** allowed — resulting path `docs/f/archive/CROSS-REVIEW-x.md` is inside the same feature's subtree with basename preserved; the file remains guarded as feature `f`.
- **Who:** agent / **Given:** same state / **When:** `mv docs/f/CROSS-REVIEW-x.md docs/f/notes.md` or `mv docs/f/CROSS-REVIEW-x.md docs/other-feature/` or `mv docs/f docs/f-old` / **Then:** blocked.
- **Who:** agent / **Given:** same state / **When:** `mv /tmp/notes.md docs/f/CROSS-REVIEW-x.md` (static unguarded source; static destination an existing guarded file) / **Then:** blocked, reason `NOT_COMMITTED` — destination-destruction (M84).
- **Who:** agent / **Given:** same state / **When:** `mv "$SRC" docs/f/CROSS-REVIEW-x.md` (`$SRC` unset in-command — indeterminate source; static destination an existing guarded file) / **Then:** blocked, reason `NOT_COMMITTED` — destruction statically certain from the destination alone; the destruction test precedes D3 (M87).
- **Who:** agent / **Given:** same state / **When:** `> docs/f/CROSS-REVIEW-x.md`, `1> docs/f/CROSS-REVIEW-x.md`, `npm test 3> docs/f/CROSS-REVIEW-x.md`, `>| docs/f/CROSS-REVIEW-x.md`, `&> docs/f/CROSS-REVIEW-x.md`, or `>& docs/f/CROSS-REVIEW-x.md` / **Then:** blocked (truncation family, incl. the `N>` fd-digit forms); **When:** `echo note >> docs/f/CROSS-REVIEW-x.md` / **Then:** allowed.
- **Who:** agent / **Given:** same state / **When:** `npm test > "$LOG" 2>&1; git add docs/f/z.md` / **Then:** allowed — `2>&1` is fd-duplication (no target); the indeterminate `"$LOG"` target's own segment carries no literal `docs/` token (D3(a) unmet).
- **Who:** agent / **Given:** same state / **When:** `echo done && rm docs/f/*.md` or `rm docs/f/*.md || true` / **Then:** blocked (compound-command segments each parsed).
- **Who:** agent / **Given:** LEARNINGS committed and pushed (Verified) / **When:** any command above / **Then:** allowed.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

#### REQ-GUARD-03
**Title:** Committed-and-pushed LEARNINGS verification with full git-state matrix

**Description:** For a guarded directory `docs/{feature}/`, the guard SHALL verify that the exact file `LEARNINGS-{feature}.md` (feature name derived from the directory basename — see Definitions) is present in the committed tree of the current branch's remote-tracking ref (`origin/{branch}`), e.g. via `git cat-file -e origin/{branch}:docs/{feature}/LEARNINGS-{feature}.md`. Disk presence alone SHALL NOT satisfy the guard. Behavior for every git state is fixed by this matrix:

| # | Git state | Decision | Reason code |
|---|---|---|---|
| G1 | cwd is not a git repository — the cwd notion consulted is candidate root (A) of REQ-GUARD-01 step 4 (stdin `cwd` when present, else `CLAUDE_PROJECT_DIR`; process cwd only when neither exists — M83) | BLOCK | `NO_REPO` — fail closed; the pipeline always runs in a checkout, so a non-repo cwd cannot prove commit state *(answers reviewer question TE-Q-01)* |
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

**Threshold declarations** (mechanism: **environment variables** read by the hook at invocation — not script-internal constants — so tests and users can toggle them without editing the script; unset/empty means the default):
- **`GUARD_FETCH_BEFORE_CHECK`** — whether the guard runs `git fetch origin {branch}` before the check. Default: `false` (trust the last fetch). Owner: hook script (documented in the script header). Documented consequence of `false`: state G10 false-blocks until the next fetch (message carries the `git fetch` hint).
- **`GUARD_FETCH_TIMEOUT_SECS`** — timeout for that fetch when enabled. Default: `10`. Owner: hook script (documented in the script header). On fetch failure/timeout the guard proceeds with the existing local ref state (decision identical to the `false` path) — network trouble alone never changes the decision class.

**Acceptance criteria:**
- **Who:** harvest agent / **Given:** LEARNINGS written to disk but not committed (G8) / **When:** it deletes a guarded file / **Then:** blocked, reason `NOT_COMMITTED`.
- **Who:** harvest agent / **Given:** LEARNINGS committed on the branch but not pushed; `origin/{branch}` exists (G7) / **When:** deletion / **Then:** blocked, reason `NOT_PUSHED`.
- **Who:** harvest agent / **Given:** LEARNINGS committed and present on `origin/feat-f` (G6) / **When:** deletion / **Then:** allowed.
- **Who:** harvest agent / **Given:** repo has no remote; LEARNINGS committed in `HEAD` (G2) / **When:** deletion / **Then:** allowed.
- **Who:** harvest agent / **Given:** detached HEAD; LEARNINGS in `HEAD` tree (G3) / **When:** deletion / **Then:** allowed.
- **Who:** harvest agent / **Given:** `origin` exists, branch never pushed, LEARNINGS committed (G4) / **When:** deletion / **Then:** blocked, message contains `git push -u origin`.
- **Who:** harvest agent / **Given:** `origin` exists, branch never pushed, LEARNINGS not committed anywhere (G5) / **When:** deletion / **Then:** blocked, reason `NOT_COMMITTED`.
- **Who:** any agent / **Given:** cwd is not a git repository, guarded file present on disk (G1) / **When:** deletion / **Then:** blocked, reason `NO_REPO`.
- **Who:** harvest agent / **Given:** `docs/f` contains committed `LEARNINGS-other.md` but no `LEARNINGS-f.md` (G9) / **When:** deletion of `docs/f/CROSS-REVIEW-x.md` / **Then:** blocked, reason `NOT_COMMITTED`.
- **Who:** harvest agent / **Given:** `GUARD_FETCH_BEFORE_CHECK=true`, LEARNINGS pushed to a local bare `origin` fixture, local remote-tracking ref stale (G10) / **When:** deletion / **Then:** guard fetches and allows.
- **Who:** harvest agent / **Given:** same G10 state but `GUARD_FETCH_BEFORE_CHECK` unset (default `false`) / **When:** deletion / **Then:** blocked, reason `NOT_PUSHED`, message contains a `git fetch` hint (the documented accepted false block).
- **Who:** harvest agent / **Given:** same G10 state, `GUARD_FETCH_BEFORE_CHECK=true`, but the `origin` URL is unreachable (fetch fails or exceeds `GUARD_FETCH_TIMEOUT_SECS`) / **When:** deletion / **Then:** decision identical to the `false` path — blocked, reason `NOT_PUSHED`.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01

#### REQ-GUARD-06
**Title:** Degraded-environment policy (interpreter missing, stdin unparseable)

**Description:** The guard's fail-closed posture SHALL survive runtime degradation:

1. **No usable Python interpreter** (current `guard-harvest-before-delete.sh:21` exits 0): the guard SHALL fall back to a **coarse conservative matcher in pure bash** running over the **raw stdin text** (the full JSON blob — without Python the guard cannot extract `tool_input.command`, so no field extraction is attempted): if that raw text matches a deletion-verb token AND contains `docs/`, `CROSS-REVIEW`, or `CODE_REVIEW`, BLOCK with reason `DEGRADED` and a message naming the missing interpreter; otherwise allow. **Accepted consequence (field-bleed):** tokens in other JSON fields (e.g. the Bash tool's `description`) can trigger a degraded block — part of the false-blocks-for-containment trade. The mirror-image under-match — a producer that `\/`-escapes `/` defeats the `docs/` conjunct — is registered as residual risk RR-7 (the Claude Code harness does not escape this way). Degraded mode also deliberately performs **no git verification**, even though `git cat-file` is bash-feasible: replicating feature-name derivation and path resolution in bash would reintroduce exactly the coarse text-matching guard this REQ retires. The intended operational posture is that guarded-looking deletions on a Python-less machine stay blocked until `python3` is installed. *(Answers reviewer question SE-Q-01, iteration 2.)* REQ-GUARD-NFR-01's no-false-block guarantee applies **only when an interpreter is present**, and the `DEGRADED` message says how to restore full fidelity (install `python3`).
2. **Unparseable or empty stdin JSON** (current `:30` exits 0): BLOCK with reason `PARSE_ERROR`. Stdin that *parses* but has `tool_input.command` absent or `null` is the same contract violation → BLOCK `PARSE_ERROR` (a present-but-empty-string `command` is a well-formed payload and is allowed by D1 — matrix row M81, distinct from the absent/`null` case M78). The hook stdin contract is stable (see Assumptions), so malformed input signals a harness bug or tampering — fail closed. **Precedence when both degradations co-occur** (no interpreter AND malformed stdin): the interpreter check runs first, so the DG-degraded flow of case 1 governs — its matcher decides block-vs-allow over the raw text, and a block carries `DEGRADED`, never `PARSE_ERROR` (`PARSE_ERROR` detection itself requires the interpreter).
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
| `INDETERMINATE` | Decision rule D3 or D4 — note the `mv` static-destination destruction test (REQ-GUARD-02) **precedes** D3: when destruction is statically certain from the destination alone, the G-state code fires, not `INDETERMINATE` (M87); `INDETERMINATE` is reserved for the genuinely unknowable cells | the unresolvable operand or `git clean` scope, and the fail-closed rationale |
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

**Description:** Both hook scripts SHALL have automated tests asserting **every row of the Canonical Block/Allow Matrix (below) — both the M-rows (deletion guard: command × git-state → expected exit code + reason-code substring) and the S-rows (scope check: file content → warning vs silent)**. The matrix, carried forward into FSPEC/PROPERTIES, is the durable oracle; "failing-before/passing-after" is a development-process practice during implementation, not an acceptance criterion. Tests live in the existing jest harness (`pdlc/workflows/__tests__/hookCompatibility.test.js` pattern, `runHookScript`) — not a new shell harness *(answers reviewer question TE-Q-03)*.

**Test-environment requirements:**
- Fixtures scaffold real git state hermetically: `git init` working repo + `git init --bare` local `origin`, with commit/push performed in the fixture — **no network access**. Every REQ-GUARD-03 matrix row (G1–G10, including the `GUARD_FETCH_BEFORE_CHECK=true` path) is exercisable against these fixtures.
- Tests require bash and python3 on the runner (skip pattern as today when bash is absent); the REQ-GUARD-06 degraded-mode cases are exercised via a restricted `PATH`.
- **Migration note:** the existing PROP-COMPAT-05 assertions in `hookCompatibility.test.js` assume a non-repo tmpdir and assert that disk-only `LEARNINGS-*.md` allows deletion — behavior this REQ inverts (G1 blocks; disk-only is G8, blocks). Those assertions SHALL be migrated to the new matrix rows, not kept alongside them.

**Acceptance criteria:**
- **Who:** maintainer / **Given:** the repo checkout with bash + python3 / **When:** they run the test suite via a single command / **Then:** every row of the Canonical Block/Allow Matrix — M-rows and S-rows alike — has exactly one asserting test, and all pass. Bulk rows (e.g. M33, which re-runs other rows under a different git state) expand to one asserting test per referenced row (a single parameterized test satisfies this).
- **Who:** maintainer / **Given:** the same checkout / **When:** the suite runs / **Then:** no test performs network I/O (pushed-state rows use the local bare-origin fixture).

**Priority:** P0 · **Phase:** 1 · **Stories:** US-04

### Domain: NFR

#### REQ-GUARD-NFR-01
**Title:** No false blocks on non-deletion commands

**Description:** With an interpreter present (see REQ-GUARD-06 for the degraded exception), the guard SHALL NOT block any command with no deletion verb in executable position — guaranteed structurally by decision rule D1. In particular, guarded tokens appearing as **data by position** (string arguments of non-deletion verbs, heredoc bodies) never trigger — note that quoting alone does not make an operand data: a quoted operand of a deletion verb is still inspected (REQ-GUARD-01 parsing step 1). The discrimination rule between fail-closed (REQ-GUARD-01) and this requirement is: *fail-closed applies only within a simple command whose command-position verb is a defended deletion verb; everything else is allowed by D1*. There is no precedence conflict — the two requirements partition the input space.

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
| M33 | State G6 (LEARNINGS pushed): re-run M01, M02, M04–M24, M44–M54, M60–M64, M66–M67, M73–M74, M79–M80, M82, M84–M90 — expands to one asserting test per referenced row (parameterized test acceptable) | ALLOW | — |
| M34 | State G7 (committed, not pushed): `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_PUSHED |
| M35 | State G4 (origin exists, branch never pushed, LEARNINGS committed): `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_PUSHED (`git push -u origin` in message) |
| M36 | State G9 (`LEARNINGS-other.md` committed, `LEARNINGS-f.md` absent): `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M37 | State G1 (cwd not a git repo): `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NO_REPO |
| M38 | State G2 (no remote, LEARNINGS in HEAD): `rm docs/f/CROSS-REVIEW-x.md` | ALLOW | — |
| M39 | State G3 (detached HEAD, LEARNINGS in HEAD): `rm docs/f/CROSS-REVIEW-x.md` | ALLOW | — |
| M40 | State G10 + `GUARD_FETCH_BEFORE_CHECK=true` (pushed to bare fixture, stale local ref): `rm docs/f/CROSS-REVIEW-x.md` | ALLOW | — |
| M41 | Stdin `not-json{` or empty | BLOCK | PARSE_ERROR |
| M42 | No interpreter on PATH: `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | DEGRADED |
| M43 | No interpreter on PATH: `ls -la src/` | ALLOW | — |
| M44 | `rm "docs/f/CROSS-REVIEW-x.md"` (double-quoted static target) | BLOCK | NOT_COMMITTED |
| M45 | `rm 'docs/f/CROSS-REVIEW-x.md'` (single-quoted static target) | BLOCK | NOT_COMMITTED |
| M46 | `D="docs/f"; rm "$D"/*.md` (double-quoted assignment RHS — literal test is quote-independent) | BLOCK | INDETERMINATE |
| M47 | `rm -rf docs/f` (guarded dir itself) | BLOCK | NOT_COMMITTED |
| M48 | `rm -rf docs` (ancestor, recursive form) | BLOCK | NOT_COMMITTED |
| M49 | `rm -rf .` from the repo root (ancestor, recursive form) | BLOCK | NOT_COMMITTED |
| M50 | `find . -name '*.md' -delete` (ancestor path root) | BLOCK | NOT_COMMITTED |
| M51 | `find docs -delete` (ancestor path root, no filter) | BLOCK | NOT_COMMITTED |
| M52 | `mv docs/f/CROSS-REVIEW-x.md docs/f/archive/` (existing subdir; resulting path stays in feature subtree, basename preserved) | ALLOW | — |
| M53 | `1> docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M54 | `>\| docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M55 | `rm /tmp/x.log && git add docs/f/y.md` (docs/ only in non-deletion segment) | ALLOW | — (RR-2) |
| M56 | `npm test > "$LOG" 2>&1; git add docs/f/z.md` (fd-dup excluded; no literal docs/ in deletion segment) | ALLOW | — (RR-2) |
| M57 | State G5 (origin exists, branch never pushed, LEARNINGS not committed): `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M58 | State G10, `GUARD_FETCH_BEFORE_CHECK` unset (default `false`): `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_PUSHED (`git fetch` hint in message) |
| M59 | State G10, `GUARD_FETCH_BEFORE_CHECK=true`, origin unreachable (fetch fails/times out): `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_PUSHED |
| M60 | `unlink docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M61 | `&> docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M62 | `>& docs/f/CROSS-REVIEW-x.md` (non-digit word after `>&` — file target, not fd-duplication) | BLOCK | NOT_COMMITTED |
| M63 | `rm --recursive docs` (long-form recursive flag; ancestor, D2 iv) | BLOCK | NOT_COMMITTED |
| M64 | Hook stdin `cwd` = `docs/f` (persisted shell cwd from a prior call's `cd docs/f`): `rm *.md` | BLOCK | NOT_COMMITTED |
| M65 | No cwd signal in hook stdin; hook process cwd = repo root: `rm *.md` | ALLOW | — (RR-5) |
| M66 | No cwd signal in hook stdin; `CLAUDE_PROJECT_DIR` = fixture repo root (candidate root (A) exists and does not resolve the glob); hook **process cwd = `docs/f`** (candidate root (B) alone resolves it): `rm *.md` | BLOCK | NOT_COMMITTED |
| M67 | Fixture adds nested guarded file `docs/f/2024-notes/CROSS-REVIEW-x.md`: `cd docs/f && npm test >& 2024-notes/CROSS-REVIEW-x.md` (digit-leading non-numeric word after `>&` — file target, not fd-duplication) | BLOCK | NOT_COMMITTED |
| M68 | No interpreter on PATH: `git clean -fd docs/backup` (two-word degraded token) | BLOCK | DEGRADED |
| M69 | No interpreter on PATH: `./scripts/clean docs/backup` (bare `clean` is not a degraded token) | ALLOW | — |
| M70 | No interpreter on PATH: `foo > docs/f/CROSS-REVIEW-x.md` (`>`-character degraded token class) | BLOCK | DEGRADED |
| M71 | No interpreter on PATH AND stdin `not-json{"cmd":"rm docs/f"}` (both degradations; token + content match) | BLOCK | DEGRADED (never PARSE_ERROR) |
| M72 | No interpreter on PATH AND empty stdin (both degradations; empty text matches no token) | ALLOW | — |
| M73 | `bash -c 'eval "rm docs/f/*.md"'` (depth-2 opaque nesting) | BLOCK | NOT_COMMITTED |
| M74 | `mv docs/f "$DEST"` (static source = unverified guarded dir; indeterminate destination — D2 precedes D3) | BLOCK | NOT_COMMITTED |
| M75 | State G1 (cwd not a git repo): `rm /tmp/scratch.log` (eager repo check: any deletion-shaped command in a non-repo cwd) | BLOCK | NO_REPO |
| M76 | State G1: `rm $(find docs/f -name 'CROSS-*')` (eager repo check precedes D3) | BLOCK | NO_REPO |
| M77 | Git query failure after repo detection passes (fixture: corrupt `.git/refs/remotes/origin/{branch}`): `rm docs/f/CROSS-REVIEW-x.md` | BLOCK | NOT_COMMITTED |
| M78 | Parseable stdin JSON with `tool_input.command` absent or `null` | BLOCK | PARSE_ERROR |
| M79 | `mv docs/f/CROSS-REVIEW-x.md docs/f/CODE_REVIEW-f-v1.md /tmp/` (multi-source `mv`; each source evaluated independently) | BLOCK | NOT_COMMITTED |
| M80 | No cwd signal in hook stdin; `CLAUDE_PROJECT_DIR` = fixture repo root (candidate root (A) exists and does not resolve the glob); hook **process cwd = `docs/f`**: `echo done && rm *.md` (segment-**2** glob resolved via candidate root (B) alone — the union cwd applies to every segment, not only segment 1) | BLOCK | NOT_COMMITTED |
| M81 | Parseable stdin JSON with `tool_input.command` **present but the empty string** `""` (well-formed payload, zero segments → D1; distinct from M78's absent/`null` — an implementation testing the field's falsiness rather than its presence fails this row) | ALLOW | — |
| M82 | `D=docs/f; mv /tmp/notes.md "$D"/CROSS-REVIEW-x.md` (static **unguarded** source; indeterminate docs-referencing destination — the resulting path can overwrite a guarded file; D3 via the assignment-RHS dataflow channel) | BLOCK | INDETERMINATE |
| M83 | Mixed-root state: stdin `cwd` names a **non-repo** directory while the hook process cwd is the default fixture repo: `rm docs/f/CROSS-REVIEW-x.md` (the G1 repo check consults candidate root (A) — an implementation testing the process cwd instead would emit `NOT_COMMITTED`) | BLOCK | NO_REPO |
| M84 | `mv /tmp/notes.md docs/f/CROSS-REVIEW-x.md` (static **unguarded** source; static destination = an **existing** guarded file — the fully static twin of M82; destination-destruction test, symmetric with truncation M14/M16) | BLOCK | NOT_COMMITTED |
| M85 | No cwd signal in hook stdin AND `CLAUDE_PROJECT_DIR` unset; hook process cwd = fixture repo root (neither-signal branch — G-DP1 tests the process cwd, the only remaining cwd notion): `rm docs/f/CROSS-REVIEW-x.md` (an implementation that blocks `NO_REPO` — or allows — whenever both signals are absent fails this row) | BLOCK | NOT_COMMITTED |
| M86 | `CLAUDE_PROJECT_DIR` unset; stdin `cwd` = fixture repo root (unverified guarded `docs/f`); hook process cwd = a **second** git repo containing no guarded directories: `rm docs/f/CROSS-REVIEW-x.md` (enumeration-anchor discriminator — the `rev-parse` fallback resolves from candidate root (A); an implementation anchoring enumeration at the process cwd's repo finds no guarded directories and allows) | BLOCK | NOT_COMMITTED |
| M87 | `mv "$SRC" docs/f/CROSS-REVIEW-x.md` (`$SRC` unset in-command — indeterminate source; static destination = an **existing** guarded file: the destination-destruction test precedes D3 — an implementation that jumps to D3 first emits `INDETERMINATE` and fails this row; promoted from TSPEC-owned row T-01) | BLOCK | NOT_COMMITTED |
| M88 | `mv docs/f/CROSS-REVIEW-x.md docs/f/CODE_REVIEW-f-v1.md` (guarded source over an existing guarded destination — pins the destruction test's "source guardedness irrelevant" clause: a guarded-source-exempting implementation reaches the same-subtree/pattern ALLOW and fails this row; promoted from T-02) | BLOCK | NOT_COMMITTED |
| M89 | `mv /tmp/CROSS-REVIEW-x.md docs/f/` (unguarded source, need not exist on disk; destination an **existing directory** → resulting path `docs/f/CROSS-REVIEW-x.md` = an existing guarded file — pins the destruction test's resulting-path arm: a literal-destination-only implementation sees a directory, misses, and falls through to ALLOW, failing this row; promoted from T-03) | BLOCK | NOT_COMMITTED |
| M90 | `npm test 3> docs/f/CROSS-REVIEW-x.md` (fd-digit truncation `N>`, `N ∉ {1, 2}` — the redirection opens and truncates the guarded file exactly as `2>` does; pins the `N>` family's membership in the closed REQ-GUARD-02 enumeration) | BLOCK | NOT_COMMITTED |

### Scope-check rows (REQ-GUARD-04 — `check-scope-field.sh`)

Fixture: a `CROSS-REVIEW-*.md` file written with exactly the stated content; oracle = warning emitted vs silent. These S-rows are part of the Canonical Matrix for REQ-GUARD-05's one-test-per-row obligation.

| # | File content | Expected |
|---|---|---|
| S01 | `Scope: Local` as its own line (P1); no other pattern | Silent |
| S02 | `**Scope:** Cross-Feature` (P2); no other pattern | Silent |
| S03 | Only Scope appearance is the findings-table header `\| ID \| Severity \| Scope \| Finding \|` (P3) | Silent |
| S04 | Contains the word "telescope"; no pattern match | Warning |
| S05 | Contains the prose "the scope of this change"; no pattern match | Warning |
| S06 | Contains only lowercase `scope: Local` | Warning |
| S07 | File written to a basename **not** matching `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md` (e.g. `notes.md`), containing no Scope pattern | Silent (basename filter — deviates from the S-fixture's default filename) |

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

## Reviewer Findings Disposition (v1.1 → v1.2)

| Finding | Resolution |
|---|---|
| SE F-02 / TE F2-01 / TE Q2-01 (High/Medium — quote semantics internally contradictory; quoted-target bypass passes the whole matrix) | Parsing steps 1 and 5 rewritten: quoting = literal vs expandable, never scanned vs unscanned; shell-style quote removal precedes operand classification, so a quoted deletion-verb operand is still a candidate path; "expansion-active" defined (single quotes/backslash suppress expansion, double quotes do not — `"$D"` indeterminate, `'$D'` static); data exclusion re-scoped to data-by-position (non-deletion-verb string args, heredoc bodies); D3(a) literal-text test declared quote-independent (answers TE Q2-01); matrix rows M44–M46; NFR-01 wording aligned |
| SE F-01 (High — D2 misses ancestor paths and the guarded dir itself) | D2 extended: static operand resolving to the guarded dir itself, or — for recursive-capable forms (`rm -r/-R`, `find <root> -delete`/`-exec`, `git clean` w/ pathspec, `mv` of a dir) — any ancestor (`docs`, `.`, `..`, repo root, `/`) blocks; `find` ancestor-root rule stated (filter irrelevant); mv table ancestor row; matrix rows M47–M51 |
| SE F-03 (Medium — compound-wide D3 discriminator over-blocks routine mid-pipeline commands; `2>&1` classified as a target) | D3(a) narrowed to the deletion segment's own operands/redirection targets plus its dataflow (assignment RHS it expands, piped producers, `cd` context); fd-duplication forms (`2>&1`, `>&2`, `N>&M`) explicitly never redirection targets; allow ACs + matrix rows M55–M56; RR-2 rewritten to record the accepted cross-segment-only remainder |
| TE F2-02 (Medium — `mv` directory-destination undecidable; nested-subdir feature derivation) | `mv` table unified on one resulting-path rule (dir destination ⇒ `dest/basename(source)`); allow iff resulting path stays in the same feature's subtree AND basename pattern preserved; Definitions updated: guarded files include nested subdirs, feature = first path segment under `docs/` (protection follows the file); AC + matrix row M52 |
| TE F2-03 (Medium — matrix omits G5, G10-default-`false`, fetch-failure) | REQ-GUARD-03 ACs added for all three; matrix rows M57–M59 |
| SE F-04 (Low — fetch toggle declared a script constant but toggled per-invocation) | Both thresholds re-declared as environment variables read at invocation, unset ⇒ default |
| SE F-05 (Low — degraded matcher input unspecified; co-occurring degradations) | REQ-GUARD-06: coarse matcher runs on raw stdin text, field-bleed accepted and named; `DEGRADED` takes precedence over `PARSE_ERROR` (interpreter check first) |
| SE F-06 (Low — state rows M37–M40 pin no command; M33 bulk mapping) | M35–M40 pinned to M01's command; M33 and REQ-GUARD-05 AC state the one-test-per-referenced-row expansion (parameterized acceptable) |
| SE Q-01 (iter-2 — degraded mode skips a bash-feasible git check: intended?) | Answered in REQ-GUARD-06: yes — no git verification in degraded mode; block-until-`python3` is the intended posture, with rationale |
| TE F2-04 (Low — G2/G3 HEAD fallback absent from Residual Risk Register) | RR-4 added |
| TE F2-05 (Low — `1>` / `>\|` unclassified) | Added to defended redirection forms with rationale; AC + matrix rows M53–M54 |

---

## Reviewer Findings Disposition (v1.2 → v1.3)

| Finding | Resolution |
|---|---|
| SE F-01 (Medium — initial effective cwd for static relative operands unspecified; cross-call cwd drift reopens a static bypass) + SE Q-01 (iter-3 — does stdin `cwd` track the persisted shell cwd?) | REQ-GUARD-01 step 4: **initial-effective-cwd union rule** — static relative operands/globs resolve against both candidate roots (stdin `cwd` when present, else `CLAUDE_PROJECT_DIR`/repo root; plus the hook process cwd); BLOCK if either resolution lands in/over an unverified guarded directory. Q-01 answered: the stdin `cwd` field is a candidate root, not a persisted-shell guarantee — so surviving drift is registered as **RR-5** with the union rule as mitigation. ACs added; matrix rows M64 (union-rule block via stdin `cwd`), M65 (no-cwd-signal RR-5 allow); M17 remains the same-call `cd docs/f && rm *.md` block row |
| SE F-02 (Low — `&>` / `>& file` truncation and `rm --recursive`/`-R` long form unclassified) | `&>` and non-digit `>& file` added to the defended redirection set (same truncation family as `>`), with the lexical digit/non-digit disambiguation from fd-duplication forms stated; `--recursive` added to the recursive-capable `rm` spellings in D2; redirection AC extended; matrix rows M61–M63 |
| SE F-03 (Low — `unlink` is the only defended verb with zero matrix rows) | Matrix row M60 (`unlink docs/f/CROSS-REVIEW-x.md` → BLOCK, NOT_COMMITTED); included in M33's G6 re-run set |
| TE F3-01 (Low — scope-check cases are prose, not bound by REQ-GUARD-05's one-test-per-row oracle) | Scope-check cases enumerated as Canonical Matrix rows S01–S06 (3 silent, 3 warning); REQ-GUARD-05 description and AC now bind M-rows and S-rows alike |

---

## Reviewer Findings Disposition (v1.6 → v1.7)

Source reviews: **TSPEC iteration-1 cross-reviews** ([CROSS-REVIEW-product-manager-TSPEC.md](CROSS-REVIEW-product-manager-TSPEC.md), [CROSS-REVIEW-test-engineer-TSPEC.md](CROSS-REVIEW-test-engineer-TSPEC.md)) — only the REQ/FSPEC-owned findings are resolved here; TSPEC-internal findings are se-author's. Per the **TE F-09 process rule** (recorded in FSPEC v1.1: *a carry-forward or review resolution that creates or changes decidable behavior must amend the Canonical Matrix in the same edit, not just prose*), every behavior-defining resolution below lands with its matrix amendment in this same revision, and the TSPEC-side rows T-01–T-03 are promoted rather than left as a parallel row namespace. FSPEC v1.4 lands in the same commit.

| Finding | Resolution |
|---|---|
| PM TSPEC F-01 (High) + TE TSPEC F-03 (Medium) — the step-2b hoist changed a REQ-owned observable (the reason code of the indeterminate-source × static-existing-guarded-destination `mv` cell) without an upstream amendment | **Hoist adopted at REQ level** (option (a) of PM F-01). The `mv` destination-destruction test is now stated as source-guardedness- **and source-determinacy-**irrelevant, preceding any indeterminacy jump to D3; `mv` decision table gains the static-destination carve-out row (G-state code, not `INDETERMINATE`) and keeps D3 for the genuinely unknowable cells only; REQ-GUARD-07's `INDETERMINATE` row annotated with the carve-out; AC added; matrix row **M87** pins it. FSPEC v1.4 `mv` flow gains step 2b to match |
| PM TSPEC F-02 (Medium) + TE TSPEC F-03 — discriminating rows T-01–T-03 held TSPEC-side, contravening matrix ownership | Promoted into the Canonical Matrix as **M87–M89** (REQ-owned), with the TSPEC-specified G6 re-run membership — M33's expansion set extended to M84–M90. TE F-09 honored explicitly: promotion lands in the same edit as the behavior decision |
| PM TSPEC F-04 (Medium) — the TSPEC's `N>` generalization widened the closed REQ-GUARD-02 enumeration | **Decided: extend the enumeration** (the sanctioned path the v1.2/v1.3 `1>`/`>\|`/`&>`/`>&` additions established). `N>` for any fd digit-string joins the truncation family: `3>` truncates its target identically to the already-defended `2>`, so a digit-boundary allow would be incoherent with the M14/M16 truncation-is-deletion rationale. The enumeration stays **closed and pinned**: `N>>` append and `N>&M` fd-duplication forms remain outside it; row **M90** pins the block |
| PM TSPEC F-05 (Medium) — live command-substitution-payload bypass (`echo $(rm docs/f/…)`) accepted downstream with no register entry | Checked: no matrix row or RR entry decided it (M28 is the quoted-string spelling; M20 the deletion-operand spelling). Registered as **RR-6** with the D1-opacity rationale; not defended — re-parsing every verb's substitution payloads would scan data-by-position and breach NFR-01 (P0) |
| PM TSPEC F-07 (Low, judgment) — `pushd`/`popd` same-call drift and the degraded `\/`-escaping defeat accepted only in TSPEC prose | Both registered upstream: **RR-5 extended** to name same-call `pushd`/`popd` drift (outside the step-4 `cd` rule); the degraded `\/` under-match registered as **RR-7** and cross-referenced from REQ-GUARD-06's accepted-consequence list |
| PM TSPEC F-03 (Medium) / TE TSPEC F-10 (Low) — internal-error catch-all fires `PARSE_ERROR` outside its catalog condition | **REQ decision: the reason-code catalog stays closed and unchanged** — the internal-error condition is *not* added to `PARSE_ERROR`'s firing row. Remediation is TSPEC-side (se-author): the catch-all must satisfy the existing REQ-GUARD-07 contract or route conformantly. Recorded here so the catalog's closure is the explicit upstream answer |
| PM TSPEC Q-01 (is the one-touch REQ v1.7 planned this iteration?) | Yes — this revision is that touch (mv-table carve-out, M87–M89 promotion, M90, RR-5/RR-6/RR-7), with FSPEC v1.4 in the same commit; se-author does not need the F-01(b) reword option |

---

## Open Questions

None — all v1.0, iteration-2, and iteration-3 reviewer questions, and the TSPEC iteration-1 PM question (Q-01), are answered inline (see Disposition tables); behavior is fully specified by the Canonical Block/Allow Matrix.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-01 | Initial draft |
| 1.1 | 2026-07-02 | Addressed all High/Medium (and all Low) findings from SE and TE cross-reviews, iteration 1: parsing discipline + decision rules D1–D4, `mv`/redirection semantics, git-state matrix G1–G10, degraded-environment policy (REQ-GUARD-06), reason-code message catalog (REQ-GUARD-07), Scope-pattern EREs, canonical block/allow matrix as test oracle, residual-risk register, corrected runtime-dependency assumption |
| 1.2 | 2026-07-02 | Addressed all High/Medium (and all Low) findings from iteration-2 cross-reviews: quote semantics rewritten as literal-vs-expandable with quote removal before classification (SE F-02/TE F2-01); D2 extended to guarded-dir-itself and ancestor paths for recursive-capable forms (SE F-01); D3 discriminator scoped to the deletion segment's operands/dataflow and fd-duplication excluded (SE F-03); `mv` unified on resulting-path rule with nested-subdir feature derivation (TE F2-02); matrix completed with G5/G10-default/fetch-failure rows (TE F2-03); env-var threshold mechanism, degraded raw-stdin matching + precedence, pinned state rows, RR-4, `1>`/`>\|` classification (Lows); matrix rows M44–M59 |
| 1.3 | 2026-07-02 | Addressed iteration-3 findings: initial-effective-cwd union rule for static relative operand resolution + RR-5 for cross-call cwd drift, answering SE Q-01 (SE F-01); `&>`/`>& file` truncation forms and `rm --recursive` classified (SE F-02); `unlink` matrix row (SE F-03); scope-check cases converted to Canonical Matrix S-rows S01–S06 bound by REQ-GUARD-05 (TE F3-01); matrix rows M60–M65 |
| 1.4 | 2026-07-02 | Matrix extension from FSPEC iteration-1 review. *(This row originally claimed "no requirement semantics changed" — corrected in v1.5 per SE FSPEC-v2 F2-03: rows M75–M76 flipped a v1.3-ALLOW command class — deletion-shaped commands with unguarded targets in a non-repo cwd — to BLOCK `NO_REPO` under the eager repo-check ordering, a real semantic extension.)* Rows M66–M79 and S07 added: M66 promoted from FSPEC v1.0 (union-rule root-(B) discriminator); M67 `>&` digit-leading-path (TE FSPEC F-01); M68–M72 degraded token classes and DG-precedence (TE FSPEC F-02/F-03); M73 depth-2 recursion (TE FSPEC F-08); M74 mv static-guarded-source/indeterminate-destination (SE FSPEC F-01); M75–M76 eager G1 (SE FSPEC F-02); M77 git-error-in-repo (SE FSPEC F-06/TE FSPEC F-05); M78 missing `tool_input.command` (SE FSPEC F-07); M79 multi-source mv (TE FSPEC F-07); S07 basename filter (TE FSPEC F-06). M33 G6 re-run set extended (M66–M67, M73–M74, M79); RR-3 clarified to register over-cap opaque payloads (SE FSPEC F-03); REQ-GUARD-06 case-2 wording aligned (missing-command contract violation, DG-precedence governed by the degraded flow) |
| 1.5 | 2026-07-02 | FSPEC iteration-2 review deltas (SE FSPEC-v2 F2-01–F2-04, TE FSPEC-v2 F2-01–F2-02). REQ-GUARD-01 decision-rule preamble now names the eager repo-check position (D1 → repo check → D2 → D3 → D4 → allow) — the position the v1.4 rows M75–M76 already pinned; G1 row names the cwd notion consulted (candidate root (A) of step 4). Matrix rows M80–M83 added: M80 every-segment union-cwd discriminator (TE F2-01); M81 empty-string-`command` allow negative to M78 (TE F2-02); M82 `mv` unguarded-source/indeterminate-docs-destination overwrite → `INDETERMINATE` (SE F2-01); M83 mixed-root repo-check discriminator (SE F2-02). M33 G6 re-run set extended with M80 and M82. v1.4 revision-history framing corrected — it did change requirement semantics for the M75–M76 class (SE F2-03). REQ-GUARD-06 case 2 cites M81 |
| 1.6 | 2026-07-02 | FSPEC iteration-3 review deltas (SE FSPEC-v3 F3-01–F3-02, TE FSPEC-v3 F3-01–F3-03). `mv` semantics extended with the **destination-destruction test**: a `mv` whose static resulting path — or static destination — is an **existing** guarded file in an unverified guarded directory blocks with the REQ-GUARD-03 reason code, deciding the fully static overwrite cell (the twin of M82) as BLOCK, symmetric with truncation M14/M16; `mv` table row and AC added, and the rule pair stated as the governing procedure for `mv` operands — not plain D2 (SE/TE F3-01, a real semantic extension: the v1.5 flow fell through to ALLOW for this cell). Matrix rows M84–M86 added: M84 static `mv`-overwrite (SE/TE F3-01); M85 neither-signal G-DP1 branch discriminator (SE F3-02); M86 enumeration-anchor discriminator (TE F3-02). M66/M80 fixtures now state `CLAUDE_PROJECT_DIR` = fixture repo root, preserving their root-(B)-alone discriminating purpose (SE F3-02). M33 G6 re-run set extended with M84–M86. REQ-GUARD-01 step-4 union-rule prose aligned to every-segment application, matching M80 and FSPEC step 6 (TE F3-03) |
| 1.7 | 2026-07-02 | TSPEC iteration-1 review deltas — the REQ/FSPEC-owned findings of the PM and TE TSPEC cross-reviews (PM F-01/F-02/F-04/F-05/F-07, TE F-03; PM F-03/TE F-10 answered by keeping the catalog closed). `mv` destination-destruction test hoisted to REQ level: stated as source-guardedness- and source-determinacy-irrelevant, preceding D3 — the indeterminate-source × static-existing-guarded-destination cell now carries the G-state code, with `INDETERMINATE` reserved for genuinely unknowable cells (PM F-01 + TE F-03; REQ-GUARD-07 annotated). TSPEC rows T-01–T-03 promoted as matrix rows **M87–M89** per the TE F-09 process rule (PM F-02). Redirection enumeration extended with the `N>` fd-digit truncation family — closed and pinned by **M90** (PM F-04, deciding the TSPEC's generalization as correct). Residual Risk Register: **RR-6** (command-substitution payloads of non-deletion verbs, D1 opacity — PM F-05), **RR-7** (degraded `\/`-escaping under-match — PM F-07), RR-5 extended to same-call `pushd`/`popd` drift (PM F-07). M33 G6 re-run set extended with M87–M90. FSPEC v1.4 in the same commit |
