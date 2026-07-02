---
Status: Active
Author: se-author
Version: 1.1
Feature: harden-harvest-guard
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | [CROSS-REVIEW-product-manager-TSPEC.md](CROSS-REVIEW-product-manager-TSPEC.md), [CROSS-REVIEW-test-engineer-TSPEC.md](CROSS-REVIEW-test-engineer-TSPEC.md), [CROSS-REVIEW-product-manager-TSPEC-v2.md](CROSS-REVIEW-product-manager-TSPEC-v2.md), [CROSS-REVIEW-test-engineer-TSPEC-v2.md](CROSS-REVIEW-test-engineer-TSPEC-v2.md) |
| LEARNINGS | docs/harden-harvest-guard/LEARNINGS-harden-harvest-guard.md |

# DECISIONS — harden-harvest-guard

Records the load-bearing alternatives weighed and **rejected** across REQ v1.7 / FSPEC v1.4 / TSPEC v1.1 — the "didn't do, and why" that a future agent would otherwise confidently reconsider. The "do" side is owned by those documents; each decision below cites where the chosen behavior is specified and pinned. Accepted residual risks cross-reference the REQ Residual Risk Register (RR-1–RR-7, RR-W). Sources: [REQ-harden-harvest-guard.md](REQ-harden-harvest-guard.md) v1.7, [FSPEC-harden-harvest-guard.md](FSPEC-harden-harvest-guard.md) v1.4, [TSPEC-harden-harvest-guard.md](TSPEC-harden-harvest-guard.md) v1.1, and the four TSPEC cross-reviews. There are no `docs/_decisions/` or `docs/_constraints/` promoted project-level decisions in this repo (checked 2026-07-02); nothing below re-litigates a standing decision.

---

## DEC-harden-harvest-guard-01: Single-file guard deployable with embedded `--self-test` mode (no sibling `guard_parser.py`)

**Context:** TE TSPEC F-04 required a unit/property test strategy for the guard's hand-rolled parsing engine (tokenizer, segmenter, heredoc stripper, verb identifier), which the embedded-heredoc architecture (DEC-02) appeared to foreclose. Two mechanisms were on the table: extract the Python to a sibling importable `guard_parser.py` (loaded by the bash wrapper, importable by tests), or keep one file and add an argv-gated `--self-test` mode running an embedded parser case table (TSPEC § 6.6).

**Decision:** Keep the single-file deployable (`guard-harvest-before-delete.sh`, bash wrapper + quoted Python heredoc) and add the `--self-test` mode, gated on the conjunction of `argv[1] == "--self-test"` and `GUARD_SELF_TEST=1`. Per the iteration-2 reviews (PM F2-01 / TE F2-03), the original "both sentinels settable only by the wrapper's own argv-gated branch" claim was inaccurate — on the hook path the Python's `argv[1]` *is* the raw stdin (C5), so hook stdin that is literally `--self-test` plus an externally exported `GUARD_SELF_TEST=1` would satisfy the conjunction and divert a `PARSE_ERROR`-bound input into the self-test. The adopted hardening (CF-1 below): the wrapper **explicitly unsets `GUARD_SELF_TEST` from the Python's environment on the non-self-test path**, making the env sentinel wrapper-owned in fact, not just in intent. (TE's argc-gate variant — require `len(sys.argv) == 3` with a second wrapper-only sentinel — is an equivalent unforgeable alternative; env-clearing was chosen as the smaller diff to the § 3.1 flow.)

**Alternatives considered:**
- Sibling `guard_parser.py` imported/execed by the wrapper — rejected because it splits the deployable into two files that must travel together through the plugin cache and the hooks.json absolute-path wiring (TSPEC C16), enabling independent drift and adding a deployment failure mode (missing/stale sibling) to a fail-closed security control. Real unit imports were the only benefit, and the self-test mode recovers direct function-level testing without the split.
- No parser-level tests (v1.0 position: matrix rows only) — rejected; review-confirmed inadequate for a hand-rolled quote-aware parser (~90 fixed examples miss quoting/operator corners), and REQ-GUARD-05 mandates the matrix suite but does not forbid supplementary lower-level tests.
- Generative (hypothesis-style) property testing — rejected: Python-side `hypothesis` breaches the guard's stdlib-only floor; a jest-side bash-grammar generator is itself an unreviewable correctness liability. The discriminating corner space (quote-state × operator × token-position) is finite and enumerable, so parameterized tables give equivalent coverage deterministically (TSPEC § 6.6 P-D1/P-QUOTE).

**Constraints that forced this shape:** hooks.json wires scripts by absolute single-file path and passes no argv (C16); plugin-cache distribution favors self-contained scripts; guard is a fail-closed control, so deployment integrity outweighs unit-test ergonomics; Python floor is stdlib-only (TSPEC § 3.3).

**Consequences / accepted residual risks:** the self-test case table lives inside the production script (inert on the hook path — argv-gated, evaluated before the stdin read, § 3.1 step 0); the jest binding must assert the printed case count against a floor, not just exit 0, or an emptied table passes silently (TE F2-04, CF-6 below). No RR-register entry — the residual gate exposure closed by CF-1 was assessed as two independent anomalies deep (harness fault emitting one exact string × stray user export) even before the fix.

**Reversibility:** easy — extracting the heredoc to a sibling module later is mechanical; the self-test table would move with it and become plain unit tests.

**Re-evaluation triggers:** the embedded Python outgrows comfortable heredoc maintenance (e.g. > ~500 lines or a second consumer wants to import the parser); Claude Code plugin packaging gains first-class multi-file script support with integrity guarantees; the self-test case table's size starts dominating the script.

---

## DEC-harden-harvest-guard-02: Bash wrapper + embedded quoted-heredoc Python, raw stdin as `argv[1]` (no sibling `.py`, no `python -c`, no stdin piping)

**Context:** The fail-closed rewrite needs a real parsing/verification engine (Python) reachable from a PreToolUse hook that Claude Code invokes as a single bash script with JSON on stdin and no arguments (C16). Where the Python lives and how the hook payload reaches it are architecture-level choices (TSPEC § 2, § 3.3), made before — and independently of — the test-mode question of DEC-01.

**Decision:** Retain the current scripts' shape (C5): a single bash wrapper containing the entire Python program as a single-quoted heredoc (`<<'PY'` — no bash expansion inside the Python source), invoked as `"$PY_BIN" - "$input"` with the raw hook stdin passed as `sys.argv[1]`. The wrapper's pre-interpreter-probe section uses bash builtins only (`IFS= read -r -d ''` replaces the load-bearing-wrong `$(cat)` of C4), so the degraded path works under an empty `PATH`.

**Alternatives considered:**
- Sibling `guard_parser.py` file — rejected for the two-file drift/deployment reasons recorded in DEC-01 (the same alternative, evaluated at the architecture layer first: TSPEC § 2 bullet 1).
- `python -c "<source>"` — rejected: loses the readable multi-hundred-line heredoc and forces a quoting-escape discipline over the entire Python source.
- Piping the hook payload to the Python via *its* stdin — rejected: the heredoc already occupies the Python process's stdin for the script text itself; restructuring to free stdin means `-c` (above) or a sibling file (above).

**Constraints that forced this shape:** hooks.json single-file absolute-path wiring, no argv (C16); degraded mode (REQ-GUARD-06) requires the wrapper to function with zero external binaries before the interpreter probe; the current scripts' C5/C6 patterns are field-proven and retained verbatim where sound.

**Consequences / accepted residual risks:** hook payloads ride ARG_MAX — accepted, since the ≥ 256 KiB floor on supported platforms comfortably exceeds hook JSON sizes (TSPEC § 2). Parser unit testing must go through the DEC-01 self-test mode rather than imports. No RR-register entry.

**Reversibility:** easy — same extraction path as DEC-01.

**Re-evaluation triggers:** hook payloads approaching ARG_MAX (would force stdin restructuring); same triggers as DEC-01.

---

## DEC-harden-harvest-guard-03: Hand-rolled character-scanner tokenizer (no `shlex`)

**Context:** REQ-GUARD-01 steps 1 and 5 require tokenization that both removes quotes *and* remembers, per token, whether expansion constructs (`$`, backtick, `$(`, `<(`) were expansion-active — i.e. neither single-quoted nor backslash-escaped (`"$D"` is indeterminate; `'$D'` is static). It must also report segment operators (`;`, `&&`, `||`, `|`, `&`, newline) and redirection operators with quote awareness. Python's stdlib offers `shlex`.

**Decision:** Implement a hand-rolled character scanner (states: normal / single-quote / double-quote / backslash) producing tokens that carry both `raw` (pre-quote-removal) and `value` (post-quote-removal) text plus `expansion_active` / `glob_active` flags, and extracting `Redir` records at tokenization (TSPEC § 3.5, data model + `tokenize`).

**Alternatives considered:**
- `shlex` — rejected: it performs quote removal but **discards the per-token quoting context** that step 5's static-vs-indeterminate classification requires (whether a `$` was single-quoted/escaped), and it cannot report segment/redirection operators with quote awareness. Post-processing `shlex` output to recover quote context re-implements the scanner anyway, with two sources of truth.
- A full shell grammar/AST parser — rejected as over-scope: the REQ discipline needs segments, tokens, verbs, and redirections, not command-substitution ASTs; opaque payloads are handled by scoped recursive re-parsing (REQ-GUARD-01 step 1), not grammar depth.

**Constraints that forced this shape:** the quote-semantics rewrite of REQ v1.2 (literal-vs-expandable, never scanned-vs-unscanned — SE F-02/TE F2-01 iteration 2) is only implementable with per-character quote-state tracking; stdlib-only floor.

**Consequences / accepted residual risks:** a hand-rolled parser is exactly the component class needing supplementary unit coverage — met by DEC-01's self-test corpus (pinned rows M44–M46, M14–M15 and the § 6.6 tokenizer case areas). No RR-register entry; parser fidelity gaps surface as matrix-row failures, and internal parser exceptions fail closed via the § 3.3 top-level handler.

**Reversibility:** hard — the token data model (`raw`/`value`/flags) is load-bearing for classification, D3's quote-independent literal test, and the self-test corpus; swapping the tokenizer means revalidating all of it.

**Re-evaluation triggers:** Python stdlib gains a quote-context-preserving shell lexer; the defended grammar grows constructs (e.g. process substitution as targets) the scanner's four states cannot carry.

---

## DEC-harden-harvest-guard-04: `git show-ref --verify --quiet` + `git ls-tree --name-only` as the verification idioms (not the REQ's illustrative `git cat-file -e`)

**Context:** REQ-GUARD-03 illustrates the committed-and-pushed check with `git cat-file -e origin/{branch}:path`. FSPEC-GUARD-03's error-scenario row draws a hard **failure-vs-absence boundary**: absence must be a *clean empty* outcome (possibly nonzero exit, but silent), while any outcome with error diagnostics is a query failure that blocks `NOT_COMMITTED` deterministically (M77 pins the fail-open class). The TSPEC owns the idiom choice.

**Decision:** Use `git show-ref --verify --quiet refs/remotes/origin/{branch}` for ref existence and `git ls-tree --name-only <ref> -- <path>` for tree membership (TSPEC § 3.6). `ls-tree` yields exit 0 + empty stdout + empty stderr for a clean miss — absence and failure are cleanly separable.

**Alternatives considered:**
- `git cat-file -e origin/{branch}:path` for membership — rejected: it reports a missing *path* with a `fatal:` diagnostic on stderr (exit 128), indistinguishable by the boundary rule from a genuine query failure — every clean absence (G4/G5/G7/G8 routing) would classify as the M77 failure class.
- Corrupt-*ref* fixture for M77 (the REQ row's illustrative construction) — rejected empirically (C18, git 2.50.1, TE TSPEC F-06): overwriting `.git/refs/remotes/origin/{branch}` with garbage makes `show-ref --verify --quiet` exit 1 silently — *clean absence*, routing G5 and never exercising the query-failure branch. The working fixture corrupts the **loose object** behind `origin/{branch}` instead (`ls-tree` then fails exit 128 with `fatal: loose object … is corrupt`), with a builder self-check that throws unless the probe query actually fails (TSPEC § 6.2).

**Constraints that forced this shape:** the FSPEC failure-vs-absence boundary is normative and REQ-owned in effect (M77's purpose); the fixture must produce real diagnostics through the real flow, hermetically, and stay falsifiable against git-version/ref-backend drift.

**Consequences / accepted residual risks:** the REQ matrix row M77's fixture *parenthetical* is now known-wrong and is scheduled for correction at the next REQ touch (PM v2 F2-02 — CF-2 below); no behavior or reason-code change. The unpinned corrupt-ref × LEARNINGS-committed cell conformantly routes G4/G5 (documented in FSPEC-GUARD-03). No RR-register entry.

**Reversibility:** easy — idioms are localized in `verify_feature`; any replacement must re-prove the failure-vs-absence separation empirically.

**Re-evaluation triggers:** git changes `ls-tree`/`show-ref` silent-miss behavior; fixture repos start packing/gc'ing objects (the builder self-check will fail loudly first); a git version where the boundary classification of either idiom shifts.

---

## DEC-harden-harvest-guard-05: `mv` static-destination destruction test hoisted to REQ level, ahead of D3 (not reword-the-gloss)

**Context:** Carry-forward SE FSPEC-v4 F4-01: the indeterminate-source × static-existing-guarded-destination `mv` cell (`mv "$SRC" docs/f/CROSS-REVIEW-x.md`) blocked `INDETERMINATE` even though the destruction is statically certain from the destination alone — a reason-code asymmetry against M74's source-side D2-before-D3 principle. TSPEC v1.0 fixed it with a step-2b hoist, but that changed a REQ-owned observable (the cell's reason code) from below — flagged PM TSPEC F-01 (High) + TE F-03 (Medium). PM offered two options: (a) adopt the hoist upstream as a REQ amendment, or (b) revert and reword the FSPEC step-3 gloss so `INDETERMINATE` stays that cell's code.

**Decision:** Option (a) — the hoist was adopted at REQ level (v1.7): the destination-destruction test is stated as source-guardedness- **and source-determinacy-**irrelevant and precedes any indeterminacy jump to D3; FSPEC v1.4 gained step 2b; REQ-GUARD-07's `INDETERMINATE` row carries the carve-out annotation; row **M87** pins it (a step-3-first implementation emits `INDETERMINATE` and fails the row). In the same touch, the TSPEC-owned rows T-01–T-03 were promoted into the Canonical Matrix as **M87–M89** per the TE F-09 matrix-ownership process rule (behavior-defining rows live in the single REQ oracle, never a parallel TSPEC namespace).

**Alternatives considered:**
- Reword-the-gloss (option b): keep `INDETERMINATE` for the cell and weaken FSPEC's "D3 never masks a G-state code" claim — rejected: it preserves the asymmetry the guard's message quality exists to avoid. The G-state code carries *provable* harvest/commit guidance (`run /pdlc:harvest-learnings, commit, push`); `INDETERMINATE` tells the agent to respell an operand that is irrelevant to the outcome. When destruction is statically certain, the actionable code must fire.
- Keeping T-01–T-03 as TSPEC-owned rows — rejected: violates TE F-09 (a durable oracle split across documents drifts); the REQ matrix is the one place implementers and re-verifiers read.

**Constraints that forced this shape:** reason codes are REQ-owned observables (REQ-GUARD-07); the TE F-09 process rule (recorded in FSPEC v1.1) requires behavior changes to land as matrix amendments in the same edit; the fix had to land upstream (pm-author, REQ v1.7 + FSPEC v1.4, same commit) rather than in the TSPEC.

**Consequences / accepted residual risks:** `INDETERMINATE` is now reserved for genuinely unknowable cells only (M82 remains one — its *destination* is indeterminate); steps 2/2b exhaust static certainty before the D3 jump, so FSPEC's "D3 never masks a G-state code" argument is sound (TE v2 verified). No RR-register entry.

**Reversibility:** hard — three documents and rows M87–M89 pin the ordering; reverting re-opens PM F-01.

**Re-evaluation triggers:** a future `mv` semantics change (new operand forms) that makes the static-certainty test unsound; any finding that the carve-out misclassifies a real cell.

---

## DEC-harden-harvest-guard-06: `N>` fd-digit redirections join the closed REQ-GUARD-02 enumeration (extension, not TSPEC generalization; not a digit-boundary allow)

**Context:** TSPEC v1.0's redirection classifier generalized the defended truncation forms to `N>` for any fd digit-string — but REQ-GUARD-02's verb/redirection set is a **closed enumeration** (BR-02-3), and at that point it defended only `>`, `1>`, `2>`, `>|`, `&>`, `>& word`. PM TSPEC F-04 (Medium) flagged the widening as an unsanctioned change to a REQ-owned set. Options: shrink the TSPEC back to the enumerated forms (allowing `3>`, `9>`, …), or extend the enumeration upstream.

**Decision:** Extend the enumeration (REQ v1.7): `N>` for **any** fd digit-string is in the truncation family, pinned by row **M90** (`npm test 3> docs/f/CROSS-REVIEW-x.md` → BLOCK). This is the sanctioned path the v1.2/v1.3 `1>`/`>|`/`&>`/`>&` additions established. The enumeration stays closed and pinned: `N>>` append forms and `N>&M` fd-duplication remain outside it.

**Alternatives considered:**
- Closed-set allow (block `2>` but allow `3>`) — rejected as incoherent: opening the redirection truncates the target file identically whichever fd number is named. A digit-boundary allow would contradict the M14/M16 truncation-is-deletion rationale and hand any agent a one-character bypass (`3>` instead of `2>`).
- Leaving the generalization TSPEC-side — rejected: same matrix-ownership violation class as DEC-05; membership in a closed REQ enumeration is decided in the REQ.

**Constraints that forced this shape:** REQ-GUARD-02's enumerated-defense posture (coverage extensions must be argued against NFR-01's false-block budget — trivially satisfied here since `N>` forms are deletion-shaped by construction); the truncation-family rationale must stay internally consistent.

**Consequences / accepted residual risks:** none new — the enumeration remains closed, so everything outside it is still **RR-1** (undefended verbs) by D1; fd-duplication (`2>&1`, `N>&M`) and appends (`>>`, `N>>`) remain never-destructive per the CF-1 lexical rule (M56, M62, M67, M15).

**Reversibility:** easy in mechanism, one-way in practice — removing a defended form re-opens a pinned bypass (M90 would fail loudly).

**Re-evaluation triggers:** bash adds redirection spellings outside the classifier's forms; a false-block class traced to the `N>` family (none is currently constructible — the target must still resolve to a guarded file).

---

## DEC-harden-harvest-guard-07: Eager `NO_REPO` early exit (G1 checked between D1 and D2), not a lazy per-feature state

**Context:** FSPEC v1.0 left G1 ambiguous between two readings (SE FSPEC F-02): an **eager** early exit — any deletion-shaped command in a non-repo cwd blocks `NO_REPO` before D2–D4 — or a **lazy** per-feature state consulted only when a decision rule needs guarded-state information. The readings differ observably: under lazy, `rm /tmp/scratch.log` in a non-repo cwd is allowed (no guarded target), and a D3-shaped command blocks `INDETERMINATE`; under eager, both block `NO_REPO`.

**Decision:** Eager (FSPEC v1.2, REQ v1.5 preamble): the evaluation order is **D1 → G-DP1 eager repo check → D2 → D3 → D4 → allow**. Immediately after D1 establishes deletion shape, `git -C <root_A> rev-parse --is-inside-work-tree` runs once against candidate root (A); failure blocks `NO_REPO` before any guarded-directory enumeration. Pinned by M37, M75 (unguarded target still blocks), M76 (D3-shape blocks `NO_REPO`, never `INDETERMINATE`), M83 (root (A), not process cwd, is consulted), M85 (neither-signal branch passes through to the process cwd).

**Alternatives considered:**
- Lazy per-feature G1 — rejected: outside a repo the guard cannot enumerate guarded directories at all, so *every* D2/D3/D4 predicate ("does an unverified guarded directory exist?") is unanswerable — a lazy design either invents an answer (fail-open for M75's class) or duplicates the repo check inside each rule. The pipeline always runs in a checkout (REQ Assumptions), so a non-repo cwd is an anomaly; deletion-shaped commands in an unprovable environment fail closed.
- Blocking *all* commands (not just deletion-shaped) in a non-repo cwd — rejected: D1 must run first or free text in a non-repo cwd would block, violating REQ-GUARD-NFR-01 (P0).

**Constraints that forced this shape:** REQ-GUARD-NFR-01 (D1 precedence is structural); one-mechanism coherence — the same root (A) that G-DP1 tests anchors guarded-directory enumeration (`rev-parse --show-toplevel` fallback cannot fail where G-DP1 passed; M86).

**Consequences / accepted residual risks:** deletion-shaped commands with *unguarded* targets block in non-repo cwds (M75) — a deliberate false-block surface, accepted as consistent with the fail-closed posture and documented as a real semantic extension over v1.3 (REQ v1.4/v1.5 revision-history correction, SE F2-03). Repo-detection failure (corrupt `.git/HEAD`) is indistinguishable from non-repo and takes the same `NO_REPO` exit. No RR-register entry.

**Reversibility:** hard — rows M75/M76/M83/M85 pin the ordering discriminatingly.

**Re-evaluation triggers:** a legitimate pipeline context emerges that runs Bash deletions outside a git checkout (would require revisiting the REQ assumption, not just this ordering).

---

## DEC-harden-harvest-guard-08: Over-cap opaque payloads are D1-opaque (allow), never deletion-shaped; recursion scoped to the three opaque-execution verbs

**Context:** Opaque-execution payloads (`eval`, `bash -c`, `sh -c`) are recursively re-parsed (REQ-GUARD-01 step 1). Recursion needs a depth cap (TSPEC: depth 8; M73 pins depth 2; nothing legitimate approaches 8). The design question: what is a payload nested *beyond* the cap — deletion-shaped (fail closed) or opaque (no visible deletion verb, D1-eligible)? And separately: how far does re-parsing reach — every verb's `$( … )` substitution payloads, or only the three opaque-execution verbs?

**Decision:** Over-cap payloads are treated as **opaque — no visible deletion verb — never deletion-shaped** (RR-3 as clarified in REQ v1.4; SE FSPEC F-03). Recursive re-parsing is scoped to `eval` / `bash -c` / `sh -c` only; deletion verbs inside command substitutions in **arguments of non-deletion verbs** (`echo $(rm docs/f/x.md)`) are not re-parsed — registered as **RR-6** (REQ v1.7, PM TSPEC F-05).

**Alternatives considered:**
- Over-cap ⇒ indeterminate-deletion-shaped (fail closed) — rejected: it would false-block verb-free commands that merely mention `docs/` at depth, a direct REQ-GUARD-NFR-01 (P0) violation. NFR-01 preservation is the deciding constraint: fail-closed applies only within a simple command whose verb is a defended deletion verb; an over-cap payload has no visible verb.
- Re-parsing every verb's substitution payloads (would defend the RR-6 class) — rejected: it scans data-by-position (`git commit -m "$(date)"` would be inspected), multiplying false-block surface against NFR-01 — adjacent to the accepted RR-1/RR-3 classes. When the substitution sits in a *deletion* verb's operand it already renders that operand indeterminate → D3 (M20), so the genuinely dangerous position is covered.
- No cap / very large cap — rejected: unbounded recursion on adversarial nesting is a DoS vector inside a hook; 8 is 4× the deepest legitimate observed nesting.

**Constraints that forced this shape:** REQ-GUARD-NFR-01 (P0) and the D1 partition rule — free text can never trigger a block; the guard is a backstop, not a sandbox (Residual Risk Register preamble).

**Consequences / accepted residual risks:** **RR-3** (fully opaque execution, including over-cap nesting) and **RR-6** (substitution payloads of non-deletion verbs) are accepted bypass classes, documented in the REQ register with the D1-opacity rationale. Recursive verdicts merge into the parent (any BLOCK blocks) below the cap.

**Reversibility:** easy for the cap value; one-way-ish for the opacity classification (flipping it violates NFR-01 by construction).

**Re-evaluation triggers:** evidence of a harvest agent actually spelling deletions via deep nesting or non-deletion-verb substitutions (would re-open the RR-3/RR-6 acceptance at REQ level, not silently here).

---

## DEC-harden-harvest-guard-09: Union-cwd two-root resolution for static relative operands (not single-root)

**Context:** The Bash tool's shell cwd **persists across tool calls** (`cd docs/f` in call 1, `rm *.md` in call 2), and the hook cannot observe that shell. The hook has up to three cwd signals: the stdin `cwd` field (a candidate, *not* a guarantee that it tracks the persisted shell — SE Q-01 iteration 3), `CLAUDE_PROJECT_DIR`, and the hook process's own cwd. Resolving static relative operands and globs against a single wrong root silently allows a real deletion (the cross-call drift bypass, SE F-01 iteration 3).

**Decision:** The **union rule** (REQ-GUARD-01 step 4): static relative operands/globs resolve against **both** candidate roots — (A) stdin `cwd` when present, else `CLAUDE_PROJECT_DIR`, else process cwd; and (B) the process cwd — and block if **either** resolution lands in/over an unverified guarded directory. Applied in **every** segment (M80), with same-call `cd <static>` updating the roots and indeterminate `cd` poisoning subsequent relative operands to D3. Pinned by M17, M64–M66, M80, M85–M86.

**Alternatives considered:**
- Single root = stdin `cwd` (trust the API) — rejected: the hook API does not promise the field tracks the persisted shell (it may report the session/project directory); when it doesn't, root (B) is the only signal that can catch drift (M66/M80 discriminate exactly this).
- Single root = process cwd — rejected symmetric: when the harness *does* pass a meaningful `cwd` (M64), the process cwd misses it.
- Tracking `pushd`/`popd` in the same-call `cd` rule — rejected: the step-4 rule is a closed enumeration, and a harvest agent does not spell directory changes with the stack builtins; extending tracking to arbitrary builtins is unbounded. Registered inside **RR-5**.
- Blocking every relative-operand delete whenever any feature is mid-pipeline — rejected: false-blocks routine work (temp-file cleanup in the harvest/commit flow itself), violating NFR-01.

**Constraints that forced this shape:** the hook cannot observe the persisted shell — full fidelity is unreachable; the fail-closed posture prices extra false-block surface as the accepted cost of the conservative union.

**Consequences / accepted residual risks:** **RR-5** — cross-call drift that *no* candidate root reflects (M65 pins the accepted allow), plus same-call `pushd`/`popd` drift — is the accepted remainder, with the union rule as its documented mitigation. The union's extra false-block surface (a relative operand innocent under the real cwd but guarded under the other root) is accepted.

**Reversibility:** easy to extend (add candidate roots); hard to shrink (M64/M66/M80/M86 each pin one root's necessity).

**Re-evaluation triggers:** the hook API starts guaranteeing a persisted-shell `cwd` (single-root becomes sound); evidence of union false-blocks in practice; Claude Code exposes shell state to hooks.

---

## DEC-harden-harvest-guard-10: Degraded mode blocks via a coarse pure-bash matcher (fail-closed), not fail-open, and performs no git verification

**Context:** The current guard exits 0 when no Python interpreter resolves (C1) — the hardening silently vanishes on constrained machines. REQ-GUARD-06 case 1 had to pick a posture for the interpreter-missing path: fail open (status quo), fail closed unconditionally, or a coarse conservative matcher. A sub-question: whether the degraded path should still attempt git verification (bash-feasible via `git cat-file`).

**Decision:** A **coarse conservative matcher in pure bash builtins** over the **raw stdin text** (full JSON blob — no field extraction without Python): deletion-verb token AND (`docs/` | `CROSS-REVIEW` | `CODE_REVIEW`) content match → BLOCK `DEGRADED` naming `python3` as the remedy; otherwise allow (FSPEC-GUARD-04; TSPEC § 3.2; M42–M43, M68–M72). Degraded mode performs **no git verification** — guarded-looking deletions on a Python-less machine stay blocked until `python3` is installed. When both degradations co-occur, the interpreter check runs first: a block is `DEGRADED`, never `PARSE_ERROR` (M71/M72).

**Alternatives considered:**
- Fail open (current behavior) — rejected: it is the exact vanishing-protection defect this REQ exists to fix (US-05); a fail-closed control that evaporates under degradation is not fail-closed.
- Block everything when degraded — rejected: turns a missing interpreter into a total Bash outage for the session; the matcher preserves obviously-safe traffic (M43, M69, M72 pin the allow side).
- Degraded git verification in bash — rejected (REQ-GUARD-06, answering SE Q-01 iteration 2): replicating feature-name derivation and path resolution in bash would reintroduce exactly the coarse text-matching guard this REQ retires; the intended posture is block-until-`python3`.
- grep/sed-based matcher — rejected: everything before the interpreter probe must be bash builtins (the C4 lesson — `$(cat)` under a restricted PATH yields `""` and M42 silently allows); `[[ … ]]` pattern/regex matches only.

**Constraints that forced this shape:** REQ-GUARD-06 (P0) fail-closed posture; NFR-01's no-false-block guarantee explicitly applies **only when an interpreter is present** — degraded over-match is the priced trade; zero-external-binary requirement under restricted PATH.

**Consequences / accepted residual risks:** **field-bleed** over-match (tokens in other JSON fields like `description` trigger a degraded block) is an accepted, normative consequence; the mirror-image under-match — a JSON producer that `\/`-escapes `/` defeats the `docs/` conjunct — is **RR-7** (the Claude Code harness does not escape this way, the deleting agent cannot influence producer serialization, and guarded-file names still match via the `CROSS-REVIEW`/`CODE_REVIEW` conjuncts). `>>`/`2>&1` over-match via the `>` character class is likewise accepted (M70's class).

**Reversibility:** easy — the matcher is ~15 lines of wrapper bash; tightening or replacing it touches nothing Python-side.

**Re-evaluation triggers:** degraded false blocks observed on real constrained machines (tokens legitimately common in non-deletion payloads); the harness changing its JSON serialization (would re-open RR-7); hooks gaining a guaranteed-interpreter runtime (degraded mode becomes dead code).

---

## Carry-Forward Notes — TSPEC iteration-2 Lows (accepted for implementation)

Both iteration-2 TSPEC cross-reviews returned **Approved with minor changes** (PM: 2 Low; TE: 5 Low; overlap on the self-test gate). None alters a decision, reason code, or matrix expectation; each is recorded here as the binding implementation-level disposition so se-implement absorbs them without re-review.

| CF | Source | Disposition (binding for IMPL) |
|---|---|---|
| CF-1 | PM v2 F2-01 + TE v2 F2-03 | **Self-test gate hardening (amends DEC-01):** the wrapper explicitly **unsets `GUARD_SELF_TEST`** from the Python's environment on the non-self-test (hook) path, closing the joint-sentinel keyhole (hook stdin literally `--self-test` × stray user export would otherwise divert a `PARSE_ERROR`-bound input to the self-test, exit 0). The § 3.1/§ 6.6 "settable only by this wrapper branch" prose is corrected accordingly. TE's argc-gate (`len(sys.argv) == 3` with a second wrapper-only sentinel) is the sanctioned equivalent if the env-clear proves awkward — either satisfies; pick one, don't stack both silently |
| CF-2 | PM v2 F2-02 | **M77 REQ fixture parenthetical (relates to DEC-04):** the REQ row's "corrupt `.git/refs/remotes/origin/{branch}`" construction is empirically known-wrong (C18 — classifies as clean absence, routes G5). Correct at the **next REQ touch**: replace the parenthetical with the loose-object construction or a reference to the FSPEC-GUARD-06 failure-vs-absence boundary. No behavior change; TSPEC § 6.2's loose-object fixture (with builder self-check) is authoritative meanwhile. Do not open a REQ revision solely for this |
| CF-3 | TE v2 F2-01 | **Residual REQ-GUARD-07 substring conjuncts:** the § 6.3 oracle table's mechanical `substrings` assembly additionally asserts, per reason: `NOT_COMMITTED` rows — a `commit` substring (the "…and commit" instruction); `INDETERMINATE` rows — the fail-closed rationale (e.g. `ailing closed`, case-tolerant); `DEGRADED` rows — an `interpreter` substring alongside `python3`. One added conjunct per contract-table row |
| CF-4 | TE v2 F2-02 | **D3 `{operand}` interpolation for stream-indeterminate operands (M21):** an `xargs`-wrapped deletion verb has no operand token — its operands are the piped input stream. Decision: `emit_block` interpolates the fixed marker **`piped input`** for `{operand}` in the D3 template when the indeterminate operand is a pipe stream (mechanically assemblable; M21's MATRIX `substrings` entry asserts `piped input`). One sentence added to § 3.7's D3 template at implementation |
| CF-5 | TE v2 F2-03 | Folded into CF-1 (same finding, TE spelling) |
| CF-6 | TE v2 F2-04 | **Self-test binding asserts the case count (amends DEC-01 consequences):** the jest binding parses the stdout case count printed on self-test success and asserts it **≥ a named floor constant** (`SELF_TEST_MIN_CASES`, set near the § 6.6 enumerated coverage areas; never below 1) — an emptied `SELF_TEST_CASES` table or a gate bug exiting 0 without running cases now fails loudly instead of passing silently |
| CF-7 | TE v2 F2-05 | **Bespoke-row convention (§ 6.3):** rows needing dedicated `it()` orchestration **keep their `MATRIX` entry** with a `bespoke: true` marker; the `it.each` parameterization filters marked entries out; each dedicated block carries the row-id title and consumes the entry's config. This keeps both self-audit meta-test 1 (id-set + length equality) and the REQ-GUARD-05 exactly-one-asserting-test invariant intact — a row is never executed by both paths |

---

## Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-02 | Stub created with TSPEC v1.1: DEC-01 (`--self-test` mode vs sibling `guard_parser.py`) |
| 1.1 | 2026-07-02 | Formalized: lineage extended with iteration-2 cross-reviews; DEC-01 conjunction-gate claim corrected per PM v2 F2-01 / TE v2 F2-03 (env-clear hardening adopted) and consequences added; DEC-02–DEC-10 recorded (embedded heredoc architecture, scanner-vs-shlex, show-ref/ls-tree vs cat-file -e, step-2b hoist adoption + M87–M89 promotion, `N>` enumeration extension (M90), eager `NO_REPO` early exit, over-cap opacity (RR-3/RR-6), union-cwd two-root rule (RR-5), degraded coarse matcher posture (RR-7)) with consequences cross-referenced to the REQ Residual Risk Register; carry-forward notes CF-1–CF-7 fold in the PM v2 and TE v2 Low findings as binding implementation dispositions |
