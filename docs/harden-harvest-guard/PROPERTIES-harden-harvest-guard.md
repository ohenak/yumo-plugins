---
Status: Draft
Author: te-author
Version: 1.0
Feature: harden-harvest-guard
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** |
| Downstream | IMPL tests |
| Cross-Reviews | (none yet — created on review) |
| LEARNINGS | docs/harden-harvest-guard/LEARNINGS-harden-harvest-guard.md |

# PROPERTIES — harden-harvest-guard

Testable system properties for the fail-closed rewrite of `pdlc/hooks/scripts/guard-harvest-before-delete.sh` and the anchored `Scope:` detection in `pdlc/hooks/scripts/check-scope-field.sh`.

Sources: [REQ-harden-harvest-guard.md](REQ-harden-harvest-guard.md) **v1.7** · [FSPEC-harden-harvest-guard.md](FSPEC-harden-harvest-guard.md) **v1.4** · [TSPEC-harden-harvest-guard.md](TSPEC-harden-harvest-guard.md) **v1.1** · [PLAN-harden-harvest-guard.md](PLAN-harden-harvest-guard.md) **v1.1** · [DECISIONS-harden-harvest-guard.md](DECISIONS-harden-harvest-guard.md) v1.2 (CFD-1–CFD-8 binding).

**Division of labor with the Canonical Matrix.** The per-command/per-state oracle is the REQ v1.7 Canonical Block/Allow Matrix (M01–M90, S01–S07), bound one-test-per-row by REQ-GUARD-05 into the TSPEC § 6 architecture (`guardMatrix.test.js` MATRIX table + M33 G6 re-run; S-rows in `hookCompatibility.test.js`; self-audit meta-tests 1–4; P-D1/P-QUOTE supplementary tables; `--self-test` with the 38-case floor). This document does **not** restate rows. It states the **invariants that hold across rows** — the properties an implementation could violate while still passing individual examples — and binds each to the planned test architecture, naming the (small) supplementary deltas it adds. Matrix-row citations below are evidence bindings, not the property itself.

**Retirement notice (TSPEC § 6.5 directive):** the property ID **PROP-COMPAT-05** (`hookCompatibility.test.js:156–244` — non-repo tmpdir allows; disk-only `LEARNINGS-*.md` allows deletion) is **retired**. Its behavior is inverted by this feature: the non-repo cell is now M37 (`NO_REPO`), disk-only LEARNINGS is G8 → M01 (`NOT_COMMITTED`), any-`LEARNINGS-*` globbing is retired by G9 → M36, and the allow-side successor is the M33/G6 re-run set. Successor properties: PROP-GIT-01/PROP-GIT-02. **PROP-COMPAT-04** (scope check) is retained untouched and subsumed under PROP-SCOPE-01.

---

## Deltas to the planned test architecture (binding for se-implement)

Everything below fits the TSPEC § 6.6 supplementary-layer conventions: non-row test titles, **outside matrix-row accounting** (the § 6.3 self-audit governs only MATRIX ids), zero new dependencies, same files (extends PLAN TASK-05's supplementary suite; greens at TASK-11/TASK-12 with everything else). The REQ-GUARD-05 exactly-one-asserting-test-per-row invariant is untouched — these are variant commands or re-runs with distinct titles, exactly like P-QUOTE.

| Delta | What | Where | Property |
|---|---|---|---|
| Δ1 | `expectAllow(res)` strengthened: asserts exit 0 **and empty stdout and empty stderr** (was exit-0-only in TSPEC § 6.2) | `guardFixtures.js` | PROP-MSG-02 |
| Δ2 | **P-DET** table — determinism double-run: one representative row per verdict class (M01 `NOT_COMMITTED`, M20 `INDETERMINATE`, M37 `NO_REPO`, M41 `PARSE_ERROR`, M42 `DEGRADED`, M03 ALLOW), each invoked twice against one fixture, asserting identical `{exitCode, stdout, stderr}` across the two runs. Titles `P-DET-nn` | `guardMatrix.test.js` | PROP-DEC-02 |
| Δ3 | **P-DEG** table — degraded-subsumption re-run: mechanically filtered from `MATRIX` (see PROP-DEG-01 derivation rule), each qualifying row re-run under `degradedEnv()` expecting BLOCK `DEGRADED`; floor assertion `P_DEG_MIN = 40` qualifying rows so an emptied filter fails loudly. Titles `P-DEG-<rowid>` | `guardMatrix.test.js` | PROP-DEG-01 |
| Δ4 | **P-SCOPE-DEG-01** — one case: `check-scope-field.sh` run under `degradedEnv()` on an untagged `CROSS-REVIEW-*.md` → exit 0, empty stdout (advisory channel silent when the interpreter is missing; stderr unconstrained — external-tool resolution noise is not part of the advisory contract) | `hookCompatibility.test.js` | PROP-SCOPE-02 |
| Δ5 | Meta-conjunct: every `MATRIX` entry's `expect.reason` ∈ the closed six-code catalog (folds into meta-test 1's describe block as one additional assertion; not a fifth meta-test) | `guardMatrix.test.js` | PROP-MSG-03 |

---

## Domain MSG — Block/allow emission contract

### PROP-MSG-01 — Fail-closed block emission (universal)

> Every BLOCK decision path — D2, D3, D4, eager G-DP1 `NO_REPO`, intake `PARSE_ERROR`, degraded `DEGRADED`, git-query-failure `NOT_COMMITTED`, and the internal-error catch-all — **must** exit 2 and write to stderr a message beginning with the stable prefix `pdlc-guard[<REASON>]:` carrying the catalog-exact reason code **and every required substring** for that code (REQ-GUARD-07 table + CFD-3 conjuncts + CFD-4 marker). No block may ever exit 2 silently, exit with another code, or emit a paraphrased reason.

- **Category / level:** Contract · Integration (through the bash entrypoint)
- **Oracle:** `expectBlock(res, reason, substrings)` — exit 2 ∧ `stderr.startsWith("pdlc-guard[" + reason + "]")` ∧ every substring present. Substrings assembled **mechanically** per the TSPEC § 6.3 contract table, never hand-tuned: `NOT_COMMITTED` → `LEARNINGS-f.md` + `/pdlc:harvest-learnings` + `then commit` (CFD-3); G4 `NOT_PUSHED` → `git push -u origin`; G7 → `git push`; G10 → `git push` + `git fetch`; D3 `INDETERMINATE` → the row's unresolvable-operand raw text + `ailing closed` (CFD-3), `piped input` for stream operands (CFD-4, M21); D4 → `git clean`; `NO_REPO` → `outside a git repository`; `PARSE_ERROR` → `unparseable`; `DEGRADED` → `python3` + `interpreter` (CFD-3). Never full prose (REQ-GUARD-07).
- **Binding:** every BLOCK row of `MATRIX` (≈60 rows incl. state variants) + the P-DEG table (Δ3). The internal-error catch-all has no constructible trigger (TSPEC § 3.3); its conformance is carried by the template-reuse design (it emits the exact `PARSE_ERROR` template) and M41's substring assertions — recorded as an untested-surface limitation in PROP-COV-01.
- **Traces:** REQ-GUARD-07, FSPEC-GUARD-06, TSPEC §§ 3.7, 6.3.

### PROP-MSG-02 — Allow silence

> Every ALLOW decision **must** exit 0 and emit **nothing** on stdout and nothing on stderr — under full runtime and under degraded mode alike. The guard never advises, warns, or logs on the allow path (BR-01-4; TSPEC § 3.3 "block messages on stderr only; nothing on stdout").

- **Category / level:** Contract · Integration
- **Oracle:** strengthened `expectAllow(res)` — exit 0 ∧ `stdout === ""` ∧ `stderr === ""` (Δ1).
- **Binding:** all ALLOW rows (M03, M11, M15, M25–M32, M38–M40, M43, M52, M55–M56, M65, M69, M72, M81), the entire M33 G6 re-run set, and every P-D1 case — the strengthened helper upgrades all of them at one stroke.
- **Negative content:** this is the anti-noise property — a guard that prints "allowed" chatter into every Bash tool call violates it even with correct verdicts.
- **Traces:** BR-01-4, TSPEC § 3.3.

### PROP-MSG-03 — Closed reason catalog, exactly one reason per block

> The reason-code catalog is **closed**: `{NOT_COMMITTED, NOT_PUSHED, INDETERMINATE, NO_REPO, PARSE_ERROR, DEGRADED}` and nothing else, per the REQ v1.7 disposition that explicitly declined to extend it. Every block carries **exactly one** reason code, selected mechanically by the decision path (FSPEC-GUARD-06 mapping table); no emission may carry two codes or a code outside the catalog.

- **Category / level:** Contract · Unit (meta) + Integration
- **Oracle:** (a) meta-conjunct: `MATRIX` `expect.reason` values ⊆ the six-code set (Δ5); (b) runtime: `expectBlock`'s `startsWith` prefix check pins the single leading code on every block row.
- **Binding:** meta-test 1 describe block (Δ5) + every BLOCK row.
- **Traces:** REQ-GUARD-07 (v1.7 catalog-closure disposition, PM TSPEC F-03/TE F-10), FSPEC-GUARD-06.

---

## Domain DEC — Decision-engine invariants

### PROP-DEC-01 — Verdict-class partition and exit-code closure

> Every hook invocation — any stdin bytes × any environment × any git state — **must** terminate in exactly one of the four verdict classes: **ALLOW** (exit 0, silent), **full-engine BLOCK** (exit 2, reason ∈ {`NOT_COMMITTED`, `NOT_PUSHED`, `INDETERMINATE`, `NO_REPO`}), **PARSE_ERROR block** (exit 2, interpreter present, contract-violating stdin), or **DEGRADED block** (exit 2, no interpreter). On the hook path the exit code **must** be in {0, 2} — no other exit code is ever intentional (BR-01-4). The classes are mutually exclusive by construction: interpreter presence partitions DEGRADED from the rest; stdin well-formedness partitions PARSE_ERROR from the engine verdicts; D1→G-DP1→D2→D3→D4→allow is first-match-wins.

- **Category / level:** Functional · Integration
- **Oracle:** per-row — every matrix row asserts exit ∈ {0, 2} via `expectBlock`/`expectAllow`; class-coverage is total by inspection of the MATRIX: each of the four classes has pinned rows on both its boundary sides (M41/M81 for PARSE_ERROR vs ALLOW; M42/M43 for DEGRADED vs degraded-ALLOW; M71/M72 for the co-occurrence boundary; M37/M85 for NO_REPO vs in-repo). The non-hook `--self-test` path (exit 1 on mismatch; wrapper exit 1 without python) is explicitly outside this property — it is unreachable from production wiring (C16) and gate-pinned by CFD-8.
- **Binding:** whole MATRIX; boundary rows named above.
- **Traces:** BR-01-4, REQ-GUARD-06 precedence, FSPEC-GUARD-01/-04.

### PROP-DEC-02 — Determinism

> The guard **must** be a pure function of (stdin bytes, environment variables, filesystem/git fixture state): two invocations with identical inputs and unchanged fixture state produce byte-identical verdicts — same exit code, same stdout (empty), same stderr message. No decision may depend on wall clock, randomness, iteration order of guarded-directory enumeration (multiple affected features resolve in **sorted order**, TSPEC § 3.5.4 step 4), or leftover memoization across processes.

- **Category / level:** Idempotency · Integration
- **Oracle:** P-DET table (Δ2): for each of the six representative rows (one per verdict class + one full-engine allow), run `runGuard` twice against one fixture and `expect(run2).toEqual(run1)` on `{exitCode, stdout, stderr}`. Excludes state-mutating configurations by construction (G10 + `GUARD_FETCH_BEFORE_CHECK=true` legitimately changes the local ref on first run — M40 stays a single-run row).
- **Binding:** Δ2 (`P-DET-01`…`P-DET-06`), `guardMatrix.test.js` supplementary layer.
- **Traces:** REQ-GUARD-05 (durable oracle presupposes reproducibility), TSPEC § 3.5.4 sorted-feature determinism clause.

### PROP-DEC-03 — Quote invariance of static classification

> Wrapping a static path operand of any defended deletion verb in double quotes or single quotes **must never** change its verdict or reason code: quote removal precedes classification, and quoting decides literal-vs-expandable, never inspected-vs-not (REQ-GUARD-01 steps 1/5). Conversely, quoting style of an assignment RHS never defeats the D3(a) literal `docs/` test (M46: `D="docs/f"` ≡ `D=docs/f`).

- **Category / level:** Functional · Integration
- **Oracle:** P-QUOTE table (TSPEC § 6.6): for each row in the designated static-operand block list — M01, M04–M07, M47–M51, M53–M54, M60–M63, M90 — re-run with the guarded operand rewrapped in `"…"` and `'…'`; verdict **and reason** must equal the base row's. M44/M45 pin the `rm` base case as matrix rows; the table extends the invariant across the whole verb set (17 rows × 2 quote styles = 34 variant cases).
- **Binding:** P-QUOTE (`P-QUOTE-nn`), plus matrix rows M44–M46.
- **Traces:** REQ-GUARD-01 steps 1/5, BR-01-3.

### PROP-DEC-04 — D1 no-false-block (NFR-01 structural guarantee)

> With an interpreter present, **no** command lacking a defended deletion verb in executable position may ever be blocked — regardless of how many guarded tokens (`docs/`, `CROSS-REVIEW`, `CODE_REVIEW`, `rm`, guarded paths) appear as data by position: string arguments of non-deletion verbs, `echo` arguments, `git commit -m` messages, heredoc bodies, grep patterns, opaque `eval "$CMD"` payloads. This must hold in the **worst-case fixture** (guarded files present, LEARNINGS unverified) — the discrimination rule is structural (D1 has absolute precedence), not fixture-dependent.

- **Category / level:** Functional (negative) · Integration
- **Oracle:** every case exits 0 with empty output (strengthened `expectAllow`, Δ1) against the default G8 fixture.
- **Binding:** matrix rows M26–M31 + the P-D1 table (TSPEC § 6.6: verb-free commands over the guarded-token vocabulary × connectors × `>>`/`2>&1` redirection lookalikes). P-D1 is the breadth layer this property demands beyond the six pinned rows.
- **Traces:** REQ-GUARD-NFR-01, decision rule D1, RR-3/RR-6 (the accepted opacity classes are the *flip side* of this property — defending them would break it).

### PROP-DEC-05 — Decision-order pinning (first match wins)

> The evaluation order **D1 → eager G-DP1 repo check → D2 (incl. mv-flow steps 2/2b/4) → D3 → D4 → fall-through allow** is normative; an implementation that reaches the same verdicts with a different internal order **must not** be observably different — and where order *is* observable (reason-code selection), the discriminating rows must hold: static certainty is always consumed before any indeterminacy jump (G-state code, never `INDETERMINATE`, when destruction is statically provable), and the eager repo check exhausts G1 before D2–D4 exist.

- **Category / level:** Functional · Integration
- **Oracle:** reason-code assertions on the order-discriminating rows — M74 (static guarded-dir source beats indeterminate destination: `NOT_COMMITTED` not `INDETERMINATE`), M87 (static-destination destruction beats indeterminate source: `NOT_COMMITTED` not `INDETERMINATE` — kills a step-3-first implementation), M75/M76/M83 (deletion-shaped in non-repo → `NO_REPO`, never a D2/D3 code), M71 (DG-DP1 precedes DG-DP2: `DEGRADED` never `PARSE_ERROR`), M88 (destruction test precedes step-5 same-subtree ALLOW), M08-vs-M07 (D4 fires only for pathspec-less `git clean`).
- **Binding:** the named matrix rows; no supplementary test needed — the matrix was explicitly engineered with one discriminating row per ordering edge.
- **Traces:** BR-01-1, FSPEC-GUARD-01 step 8, FSPEC-GUARD-02 steps 2/2b, REQ-GUARD-06 precedence.

---

## Domain GIT — Verification-state invariants

### PROP-GIT-01 — G-state totality

> Every git fixture state G1–G10 **must** map to exactly one decision + reason per the REQ-GUARD-03 matrix — no state may be undefined, and no two states may be conflated where the matrix separates them (G4 vs G5 vs G7; G8 vs G9; G10-fetch-on vs G10-default vs G10-unreachable). The G2/G3 HEAD fallback (RR-4) and the G10-default accepted false block are part of the map, not deviations from it.

- **Category / level:** Functional · Integration
- **Oracle:** one hermetic fixture builder per state (`guardFixtures.js` § 6.2 state-builder table: G8 default, G6, G7, G4/G5, G2, G3, G9, G10, G10-unreachable, G1, M77) with one asserting row per state cell: M37 (G1), M38 (G2), M39 (G3), M35 (G4, `git push -u origin` substring), M57 (G5), M33 re-run set (G6, ALLOW), M34 (G7), M01 (G8), M36 (G9), M40/M58/M59 (G10 three-way). The builder-per-state structure makes the totality claim mechanical: a state without a builder cannot have its row, and meta-test 1 catches a dropped row.
- **Binding:** git-state describe block of `guardMatrix.test.js` + § 6.2 builders.
- **Traces:** REQ-GUARD-03 matrix, FSPEC-GUARD-03 G-DP1–G-DP4.

### PROP-GIT-02 — Disk presence never satisfies; exact-name, exact-place

> The guard **must never** accept `LEARNINGS-{feature}.md` on evidence weaker than the applicable committed tree: disk presence alone always blocks `NOT_COMMITTED` with the harvest instruction (G8 — the inversion that retires PROP-COMPAT-05), and only the **exact filename** `LEARNINGS-{feature}.md` at the **top level** of `docs/{feature}/` counts — `LEARNINGS-<anything-else>.md` anywhere blocks `NOT_COMMITTED` (G9); feature name derives from the first path segment under `docs/`, never the immediate parent.

- **Category / level:** Data Integrity (negative) · Integration
- **Oracle:** M01 (disk-only → `NOT_COMMITTED` + `LEARNINGS-f.md` + `/pdlc:harvest-learnings` + `then commit`), M36 (name mismatch), M67/nested fixture (feature derivation: the nested guarded file is judged against feature `f`'s LEARNINGS).
- **Binding:** matrix rows M01, M36, M67; migration comment in `hookCompatibility.test.js` (TASK-04) records the PROP-COMPAT-05 supersession.
- **Traces:** REQ-GUARD-03 (+ Definitions), REQ-GUARD-05 migration note.

### PROP-GIT-03 — Network independence of the decision class

> Network reachability **must never** change a decision class: with `GUARD_FETCH_BEFORE_CHECK=true`, a failed or timed-out fetch yields a decision identical to the `false` path (proceed on local ref state); with the default `false`, no network I/O is attempted at all. Symmetrically, the test suite itself performs **zero network I/O** — every pushed-state row uses the local bare-origin fixture, and the unreachable-origin row uses an invalid filesystem path.

- **Category / level:** Error Handling · Integration
- **Oracle:** M59 (fetch failure ≡ false path: `NOT_PUSHED`), M58 (default false: `NOT_PUSHED` + `git fetch` hint), M40 (fetch success → G6 ALLOW). Suite-side: hermeticity is enforced **by construction** (fixture library builds only `git init`/`git init --bare`/file-path remotes; `G10-unreachable` = `git remote set-url origin /nonexistent-remote-path`) and verified at TASK-14's gate by inspection — there is no runtime network interceptor; this is an honest review-verified invariant, not a mechanically asserted one.
- **Binding:** matrix rows M40/M58/M59; `guardFixtures.js` construction discipline (§ 6.2 hermeticity invariants); PLAN DoD bullet 4.
- **Traces:** REQ-GUARD-03 threshold declarations, REQ-GUARD-05 test-environment requirements.

### PROP-GIT-04 — Git failure never fails open

> After G-DP1 establishes a repo, a git query that **fails** (nonzero exit with diagnostics, launch failure, or in-process exception around the subprocess call) **must** block `NOT_COMMITTED` deterministically — never exit 0, never crash with a non-catalog emission. Clean absence (empty output, no diagnostics — even exit 1 from `show-ref`) routes as "absent" through G4/G5/G-DP4; only genuine failure takes the fail-closed branch. A failure of repo *detection* itself is the G-DP1 exit → `NO_REPO`.

- **Category / level:** Error Handling (negative) · Integration
- **Oracle:** M77 — corrupt-loose-object fixture (C18: `ls-tree` exits 128 with `fatal: loose object … is corrupt` diagnostics while `show-ref`/`symbolic-ref`/`rev-parse` are unaffected) → BLOCK `NOT_COMMITTED`; the fixture's **builder self-check** (throws unless the probe query actually fails nonzero with non-empty stderr) keeps the row meaningful against git-version drift. The failure-vs-absence boundary itself is pinned on the absence side by G4/G5 rows (M35/M57), whose `show-ref` not-found result is exit-1-silent.
- **Binding:** matrix row M77 + § 6.2 M77 builder self-check; layer-1 exception wraps (TSPEC § 3.3) are the implementing mechanism.
- **Traces:** FSPEC-GUARD-03 error-scenario row, TSPEC § 3.6, DEC-04/CFD-2.

---

## Domain DEG — Degraded-mode invariants

### PROP-DEG-01 — Conservative subsumption (no silent hardening loss)

> Removing the Python interpreter **must never convert a text-identifiable block into an allow**: for every command whose full-runtime verdict is BLOCK with reason ∈ {`NOT_COMMITTED`, `NOT_PUSHED`, `INDETERMINATE`} and whose raw hook stdin (the assembled JSON) contains both a degraded verb token (word-boundary `rm|unlink|mv|truncate|find`, two-word `git clean`, or the `>` character) and a content token (`docs/`, `CROSS-REVIEW`, or `CODE_REVIEW`), the coarse matcher **must** block `DEGRADED`. The accepted under-match remainder is exactly three named classes — nothing else: **(i)** RR-7 (`\/`-escaping producers — not constructible through the harness); **(ii)** ambient-cwd-resolved blocks whose stdin text carries no token (M65/M66/M80 class — the degraded analogue of RR-5); **(iii)** content-token-free spellings — pathspec-less `git clean` (M08) and ancestor forms without a `docs/` substring (`rm -rf docs`, `rm -rf .`, `find . -delete`, `rm --recursive docs` — M48–M51, M63) — which the FSPEC-GUARD-04 conjunction deliberately does not match. Over-blocking while degraded (field-bleed, `>>`, Verified-state blocks) is the intended, normative trade — NFR-01 is explicitly waived without an interpreter.

- **Category / level:** Error Handling · Integration
- **Oracle:** P-DEG table (Δ3), **derived mechanically, never hand-copied**: filter `MATRIX` entries by (expect = BLOCK) ∧ (reason ∈ {NOT_COMMITTED, NOT_PUSHED, INDETERMINATE}) ∧ (the runGuard-assembled stdin text satisfies the same verb∧content predicate as § 3.2's matcher, reimplemented in the test as a JS filter). Each qualifying row re-runs with its own stdin controls against the default fixture (degraded mode never reaches git, so state variants collapse) under `degradedEnv()`, asserting `expectBlock(res, "DEGRADED", ["python3", "interpreter"])`. Floor: qualifying-set size ≥ `P_DEG_MIN = 40` (the current matrix yields ≈49), so a broken filter or emptied MATRIX fails loudly. The excluded classes fall out of the filter mechanically and are documented at the constant's declaration.
- **Binding:** Δ3 (`P-DEG-<rowid>` titles), plus the hand-pinned boundary rows M42/M68/M70/M71 (block side) and M43/M69/M72 (allow side) already in the matrix.
- **Traces:** REQ-GUARD-06 case 1, FSPEC-GUARD-04 token table, RR-7.

### PROP-DEG-02 — Degraded totality and precedence

> With no usable interpreter, the coarse matcher's decision rule is **total** over arbitrary stdin bytes — including malformed JSON and empty input — and **governs alone**: a block while degraded always carries `DEGRADED`, never `PARSE_ERROR` (whose detection requires the interpreter), and everything the wrapper executes before the interpreter probe must be a bash builtin (an external-binary dependency before the probe silently converts degraded blocks into allows — the C4 `$(cat)` failure mode).

- **Category / level:** Error Handling · Integration
- **Oracle:** M71 (both degradations co-occur, token+content match → `DEGRADED`), M72 (empty stdin, no token → ALLOW), M42/M43/M68–M70 (token classes); the builtins-only obligation is *observable through* these rows — under `degradedEnv()`'s empty `PATH`, any pre-probe external call breaks M42's block or M72's clean allow — plus the `BASH_ABS` spawn discipline (C17) that makes the empty child `PATH` actually reach the script.
- **Binding:** degraded describe block of `guardMatrix.test.js`; `degradedEnv()`/`BASH_ABS` in `guardFixtures.js`.
- **Traces:** REQ-GUARD-06 precedence clause, TSPEC §§ 3.1–3.2, C4/C17.

---

## Domain SCOPE — Scope-field check

### PROP-SCOPE-01 — Anchored detection iff

> For a written file whose **basename** matches `CROSS-REVIEW-*.md` / `CODE_REVIEW-*.md`, `check-scope-field.sh` **must** stay silent iff the content matches at least one of the three exact case-sensitive EREs (P1 plain `Scope:` line, P2 bold both spellings, P3 table header cell at any row position) — and **must** warn otherwise; prose substrings ("telescope", "the scope of this change") and lowercase `scope:` never count. Files with any other basename are silently ignored regardless of content.

- **Category / level:** Functional · Integration
- **Oracle:** S01–S07 table-generated tests (silent = exit 0 + empty stdout; warning = exit 0 + stdout containing `hookSpecificOutput` and `Scope`), with both polarity sides pinned (S01–S03 silent, S04–S06 warning, S07 basename filter). Retained PROP-COMPAT-04 suite must keep passing (its "already tagged" fixture is a P1 match — regression pin for the pattern change).
- **Binding:** S-row describe block in `hookCompatibility.test.js` + meta-test 3 (`S_CASES` ids = `S_ROWS`).
- **Traces:** REQ-GUARD-04, FSPEC-GUARD-05, TSPEC § 5.

### PROP-SCOPE-02 — Advisory-only, unconditionally

> `check-scope-field.sh` **must never block**: exit 0 on every path — pattern match, pattern miss, non-review basename, missing file, and missing interpreter (REQ-GUARD-06 case 3's silent no-op). Its only output channel is the advisory `hookSpecificOutput` JSON on stdout; it must not exit nonzero even when its own runtime is degraded.

- **Category / level:** Contract (negative) · Integration
- **Oracle:** every S-row asserts exit 0 on both polarities (already in S01–S07's oracle); the interpreter-missing path gains the one supplementary case P-SCOPE-DEG-01 (Δ4): `degradedEnv()`, untagged review file → exit 0, empty stdout.
- **Binding:** S-rows + Δ4.
- **Traces:** REQ-GUARD-06 case 3, C9 (always-exit-0 posture retained).

---

## Domain TEST — Suite self-audit and unit-floor meta-properties

These properties are about the **test suite itself** — they make silent coverage loss impossible, which is what REQ-GUARD-05 ("future edits cannot silently reopen the bypass", US-04) actually demands.

### PROP-TEST-01 — Matrix allocation audit (meta-tests 1, 2, 4)

> The suite **must mechanically prove** its own one-test-per-row accounting: **(meta-1)** the `MATRIX` id list, sorted, deep-equals `M_ROWS` minus `M33` **and** its length equals its Set size (duplication caught, not just omission); **(meta-2)** `M33_RERUN_IDS` ⊆ `M_ROWS` with no duplicates, and the G6 parameterization iterates that constant directly (no second copy can drift); **(meta-4)** the bespoke dispatch map's key set is set-equal to the `bespoke: true` id set (CFD-7 — a marked row without an orchestration function, or an unmarked row with one, fails loudly). All three consume the single shared registry `guardRowIds.js`.

- **Category / level:** Observability/Contract · Unit (meta)
- **Oracle:** the three meta-tests as **distinct, mechanically countable `it()` titles** in `guardMatrix.test.js` (PLAN DoD bullet 2). Known accepted limitation: `M33_RERUN_IDS` is a maintained copy of the REQ M33 enumeration — drift against the REQ document itself remains review-caught, documented at the constant's declaration.
- **Binding:** meta-tests 1/2/4 (TASK-03); `helpers/guardRowIds.js` (TASK-01).
- **Traces:** REQ-GUARD-05, TSPEC § 6.3 self-audit mechanism, CFD-7.

### PROP-TEST-02 — S-row coverage audit (meta-test 3)

> Deleting or renaming an S-case **must** fail the suite, not silently drop REQ-GUARD-05 S-row coverage: the `S_CASES` id set in `hookCompatibility.test.js` must equal `S_ROWS` from the shared registry.

- **Category / level:** Observability · Unit (meta)
- **Oracle / binding:** meta-test 3 (TASK-04), consuming `guardRowIds.js`.
- **Traces:** REQ-GUARD-05, TE TSPEC F-07(a).

### PROP-TEST-03 — Hermeticity and isolation

> The suite **must** be hermetic and order-independent: every fixture under `mkdtempSync` with `afterEach` cleanup; git identity configured locally per fixture; the only remotes are local bare repos or invalid paths; `runGuard` **never** defaults `spawnCwd` to `process.cwd()` (the developer checkout is itself a git repo with a `docs/` tree and would leak into union-cwd resolution as candidate root (B) — TE TSPEC F-09); degraded rows get a truly empty `PATH` (empty mkdtemp dir, spawned via `BASH_ABS`). A test must not pass or fail depending on the host checkout's state, sibling-test residue, or network availability.

- **Category / level:** Contract · Integration (enforced by fixture-library construction + M77 builder self-check; verified at the TASK-14 gate — honestly noted as construction-discipline, not a runtime interceptor)
- **Oracle:** § 6.2 invariants implemented in `guardFixtures.js`; the M65 row is the sensitive canary (its ALLOW verdict is only correct when root (B) is the fixture repo root, not the host checkout).
- **Binding:** TASK-02 fixture library; PLAN DoD bullets 4–5.
- **Traces:** REQ-GUARD-05 test-environment requirements, TE TSPEC F-09.

### PROP-TEST-04 — Parser unit floor (self-test) and gate integrity

> The embedded parser **must** carry its own unit corpus: `--self-test` (argv + `GUARD_SELF_TEST=1` conjunction, settable only by the wrapper) exits 0 printing a case count, and the jest binding asserts count ≥ **`SELF_TEST_MIN_CASES = 38`** — the TSPEC § 6.6 corner-class derivation (tokenizer 11 + segmenter 11 + heredoc stripper 5 + verb identifier 11), with the derivation comment mandatory at the declaration so an emptied `SELF_TEST_CASES` table fails loudly (CFD-6). The gate **must not** be forgeable from the hook path: hook stdin that is literally `--self-test` with `GUARD_SELF_TEST=1` exported still routes to intake → `PARSE_ERROR` (the wrapper strips/gates the sentinel — CFD-1), pinned by the CFD-8 test.

- **Category / level:** Functional (unit floor) + Security (gate) · Unit via self-test, Integration binding
- **Oracle:** (a) python3-gated binding test: spawn entrypoint with `["--self-test"]` → exit 0 ∧ stdout case count ≥ 38; (b) CFD-8 pin: `runGuard(fixture, {stdinRaw: "--self-test", env: {GUARD_SELF_TEST: "1"}})` → `expectBlock(res, "PARSE_ERROR", ["unparseable"])`.
- **Binding:** TASK-05 supplementary tests, TASK-08/09 incremental family landing, TASK-12 audit.
- **Traces:** TSPEC § 6.6, DEC-01, CFD-1/CFD-6/CFD-8, PLAN TE F-04 disposition.

---

## Domain COV — Coverage floor

### PROP-COV-01 — Branch-coverage criterion for bash + embedded Python (decision recorded)

> New/rewritten production modules **must** meet the pdlc DoD branch-coverage criterion (≥ 85%). **Measurement decision:** jest/istanbul instruments JavaScript only — the production deliverables here are a bash script and a Python program embedded in a quoted heredoc, which **no coverage tool in the toolchain reaches** (nyc cannot see bash; coverage.py cannot attach to a heredoc-embedded script without splitting the single-file deployable that DEC-01 deliberately preserves). The criterion is therefore discharged by a **structural proxy**, asserted mechanically where possible:
>
> 1. **Matrix-row totality** — every decision branch specified anywhere in REQ/FSPEC (D1–D4 + mv steps 0–5 + redirection classes, G1–G10, DG-DP1/DP2 + token classes, intake presence-vs-falsiness, union-cwd roots, S-check patterns + basename filter) has ≥ 1 discriminating matrix row, and meta-tests 1–4 prove no row is silently dropped. The REQ/FSPEC review history (7 iterations) exists precisely to make "specified branch without a discriminating row" a review-blocking defect — that review discipline, not an instrumenter, is the branch-enumeration mechanism.
> 2. **Self-test corner families** — the 38-case floor covers the tokenizer/segmenter/heredoc/verb-identifier branch space below the granularity matrix rows can reach (quote states, escapes, `>&` lexical rule variants, connector set, group openers, depth-cap).
> 3. **Property tables** — P-D1/P-QUOTE/P-DET/P-DEG sweep the cross-products (data-position × vocabulary, quoting × verb set, verdict-class × repetition, block-set × degradation) that fixed examples under-sample.
>
> **Honest limitation (binding for dod-verify):** no numeric branch-coverage percentage is mechanically producible for the two shell deliverables; the proxy above is the coverage evidence, and the following surfaces are **known-untested by decision**: the wrapper's no-interpreter `--self-test` branch (three lines, unreachable from production — PLAN TE Q-02 accepted); the Python top-level internal-error catch-all (no constructible trigger; message contract carried by M41's template assertions); `check-scope-field.sh`'s grep-unavailable degradation beyond Δ4's stdout-silence check. A DoD verifier should check this list against the diff rather than demand an instrumenter number that cannot exist for this artifact class. The JS test helpers (`guardFixtures.js`, `guardRowIds.js`) are test infrastructure, not production modules — the criterion does not apply to them.

- **Category / level:** Contract (process) · applies at the DoD phase
- **Oracle:** meta-tests 1–4 (row totality) + self-test floor (PROP-TEST-04) + property-table presence (Δ2/Δ3 floors, P-QUOTE list length) + this section as the recorded measurement decision.
- **Traces:** pdlc DoD coverage criterion, DEC-01, TSPEC § 6.6 rationale (stdlib-only floor).

---

## Requirements → Properties coverage matrix

| Requirement | Properties | Primary row evidence |
|---|---|---|
| REQ-GUARD-01 (parsing, D1–D4, union cwd) | PROP-DEC-01, PROP-DEC-03, PROP-DEC-04, PROP-DEC-05, PROP-DEC-02 | M01–M03, M17–M32, M44–M51, M64–M66, M80, M85–M86 |
| REQ-GUARD-02 (verb set, mv, redirection) | PROP-DEC-03, PROP-DEC-05, PROP-DEG-01 (verb-token mirror) | M04–M16, M52–M54, M60–M63, M67, M74, M79, M82, M84, M87–M90 |
| REQ-GUARD-03 (git-state matrix, thresholds) | PROP-GIT-01, PROP-GIT-02, PROP-GIT-03, PROP-GIT-04 | M33–M40, M57–M59, M75–M77, M83 |
| REQ-GUARD-04 (scope patterns) | PROP-SCOPE-01, PROP-SCOPE-02 | S01–S07 |
| REQ-GUARD-05 (matrix-driven tests) | PROP-TEST-01, PROP-TEST-02, PROP-TEST-03, PROP-TEST-04, PROP-DEC-02 | meta-tests 1–4, self-test binding, P-DET |
| REQ-GUARD-06 (degraded policy) | PROP-DEG-01, PROP-DEG-02, PROP-DEC-01 | M41–M43, M68–M72, M78, M81 |
| REQ-GUARD-07 (message catalog) | PROP-MSG-01, PROP-MSG-02, PROP-MSG-03 | every BLOCK row + all ALLOW rows |
| REQ-GUARD-NFR-01 (no false blocks) | PROP-DEC-04, PROP-MSG-02 | M26–M31 + P-D1 |
| pdlc DoD coverage criterion | PROP-COV-01 | meta-tests + floors |

Every requirement has ≥ 1 property; every property traces to ≥ 1 requirement or TSPEC section. No unexplained gaps: the residual-risk classes (RR-1–RR-7) are deliberately property-free on their bypass side — their *allow* behavior is pinned by matrix rows (M25, M26, M55–M56, M65) and by PROP-DEC-04, which is the invariant that makes defending them impossible without breaking NFR-01.

---

## Property summary

| ID | Statement (short) | Category | Level | Binding |
|---|---|---|---|---|
| PROP-MSG-01 | Every block: exit 2 + `pdlc-guard[<REASON>]` + required substrings | Contract | Integration | all BLOCK rows, § 6.3 oracle table |
| PROP-MSG-02 | Every allow: exit 0, empty stdout+stderr | Contract | Integration | all ALLOW rows + M33 set + P-D1 (Δ1) |
| PROP-MSG-03 | Closed six-code catalog, exactly one reason | Contract | Unit(meta)+Int | Δ5 + prefix oracle |
| PROP-DEC-01 | Total four-class verdict partition; exit ∈ {0,2} | Functional | Integration | whole MATRIX, boundary rows |
| PROP-DEC-02 | Deterministic: same inputs ⇒ identical output | Idempotency | Integration | P-DET (Δ2) |
| PROP-DEC-03 | Quote-invariant static classification | Functional | Integration | P-QUOTE + M44–M46 |
| PROP-DEC-04 | No deletion verb ⇒ never blocked (worst case) | Functional (neg) | Integration | M26–M31 + P-D1 |
| PROP-DEC-05 | First-match-wins order observable only via pinned reason codes | Functional | Integration | M71, M74–M76, M83, M87–M88 |
| PROP-GIT-01 | G1–G10 total, one behavior each | Functional | Integration | state builders + G rows |
| PROP-GIT-02 | Disk presence never satisfies; exact name/place | Data Integrity (neg) | Integration | M01, M36, M67 |
| PROP-GIT-03 | Network trouble never changes decision class; suite offline | Error Handling | Integration | M40/M58/M59 + fixtures |
| PROP-GIT-04 | Git failure blocks `NOT_COMMITTED`, never exit 0 | Error Handling (neg) | Integration | M77 + builder self-check |
| PROP-DEG-01 | Degradation never converts text-identifiable block → allow (3 named remainder classes) | Error Handling | Integration | P-DEG (Δ3) + M42/M68/M70 |
| PROP-DEG-02 | Degraded rule total; `DEGRADED` never `PARSE_ERROR`; builtins-only pre-probe | Error Handling | Integration | M71–M72 + degraded rows |
| PROP-SCOPE-01 | Silent iff P1/P2/P3 on review basenames | Functional | Integration | S01–S07 |
| PROP-SCOPE-02 | Scope check never blocks, any path | Contract (neg) | Integration | S-rows + Δ4 |
| PROP-TEST-01 | Matrix allocation mechanically audited (meta 1/2/4) | Observability | Unit (meta) | TASK-03 meta-tests |
| PROP-TEST-02 | S-case set audited (meta 3) | Observability | Unit (meta) | TASK-04 meta-test |
| PROP-TEST-03 | Hermetic, host-independent fixtures | Contract | Integration | guardFixtures.js discipline |
| PROP-TEST-04 | Self-test floor 38 + unforgeable gate | Functional/Security | Unit+Int | binding test + CFD-8 pin |
| PROP-COV-01 | ≥85% branch criterion via structural proxy; limitations recorded | Contract (process) | DoD phase | meta-tests + floors + this doc |

Test-pyramid note: no E2E tests are proposed — the hook's entire observable surface is (stdin, env, fixture) → (exit, stderr), fully exercisable at integration level through the real bash entrypoint; the self-test corpus supplies the unit layer beneath it. This satisfies the ≤ 3–5 E2E ceiling trivially.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-02 | Initial PROPERTIES from REQ v1.7 / FSPEC v1.4 / TSPEC v1.1 / PLAN v1.1: 21 cross-row invariants in 7 domains; PROP-COMPAT-05 retired per TSPEC § 6.5; five supplementary deltas (Δ1 strengthened `expectAllow`, Δ2 P-DET determinism, Δ3 P-DEG degraded-subsumption with 40-row floor, Δ4 scope degraded case, Δ5 catalog meta-conjunct) added within the § 6.6 supplementary conventions; coverage-floor measurement decision for bash+heredoc-Python recorded with named untested surfaces (PROP-COV-01) |
