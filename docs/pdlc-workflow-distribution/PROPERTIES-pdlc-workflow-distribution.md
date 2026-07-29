---
feature: pdlc-workflow-distribution
---

# PROPERTIES — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` v17.0 (approved) → `FSPEC-pdlc-workflow-distribution.md` v5.1 (dual-approved) → `TSPEC-pdlc-workflow-distribution.md` v2.1 (dual-approved) → **PROPERTIES** |
| Downstream | `PLAN-pdlc-workflow-distribution.md`, IMPL tests (`pdlc/workflows/__tests__/**`) |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,product-manager}-PROPERTIES-v{N}.md` (this branch, while active) |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` (Phase H) |
| Entry obligations disposed here | **O-9**, **O-18**, **O-20**, TSPEC §16's `PDLC_FAULT`-subset row, REQ **AC-1.8(iv)** |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 1.0 | 2026-07-28 |

> **Altitude.** The REQ states observable behavior, the FSPEC how it is produced, the TSPEC how it is
> built and proved with *examples*. This document states what must hold over **generated** inputs:
> the axes, the invariants quantified over them, the shrink order, and — for each property —
> whether it is executable on the TSPEC's harness or is a design-time argument with a named
> example-based surrogate. It restates no FSPEC behavior; behavior is cited by section.

---

## 0. Scope and obligation index

### 0.1 What this document decides

| Decision | Section |
|---|---|
| The classifier's generation axes, regenerated from FSPEC §3.2's six probes | §2 |
| Totality / single-valuedness / determinism over the six row states | §3 |
| The same three properties over `rows[].reason` (AC-1.8(iv)) | §4 |
| The baseline evidence axes and the same three properties over `baselineReason` | §5 |
| The backup filename grammar's round-trip, sort and prune properties (O-18) | §6 |
| AC-2.6's measurement-time reading, asserted rather than assumed (O-20) | §7 |
| That the emitted `PDLC_FAULT` token set is a subset of TSPEC §5.2's closed sixteen | §8 |
| Which properties are executable on the TSPEC's harness and which are design-time | §1.2, §11 |
| The seeded, dependency-free generator library and its shrink contract | §1.3 |
| Where each property lands as a jest test case | §12 |

### 0.2 Disposition of the entry obligations

Every obligation routed to PROPERTIES by REQ §10, FSPEC §10 and TSPEC §16, with the section that
discharges it. A reviewer verifies these **row by row**; a finding that one of them is unspecified
elsewhere is answered here.

| # | Source | Obligation (abridged) | Disposed in | One-line disposition |
|---|---|---|---|---|
| **O-9** | REQ §10 (AC-1.8/AC-1.0), FSPEC §10 | Classifier totality / single-valuedness / determinism over **states**, **row reasons** and **baseline reasons**, including both declared precedences. **Regenerate the axes; do not import REQ v13's tables** (24 of 96 cells undefined) | **§2, §3, §4, §5** | The axes are regenerated **from FSPEC §3.2's six probes** as a **dependent tree** (§2.1), not a cross-product: every leaf is reachable and maps to exactly one state, so the class of defect v13 shipped — an undefined cell — is not expressible in this representation. Eleven row leaves (§2.3), a determinacy-respecting baseline evidence tree (§5.1), both precedences asserted as *selector* properties (`selected == max by precedence over holding-and-determinate conditions`), and determinism asserted against clock, mtime, environment order, directory order and locale (§9) |
| **O-18** | FSPEC §10 | Backup filename grammar: `parse(format(…))` round-trip over the full M6 id charset, `LC_ALL=C` descending == reverse-chronological, and `prune`'s four clauses (a)–(d) | **§6** | Built on TSPEC §11.1's three C1 functions and §11.2's **batched** driver (one spawn per property run). Round-trip and injectivity over the fixed-24-byte tail (§6.3), the sort property in two conjuncts — lexicographic == `(stamp, nn)` order, and `(stamp, nn)` order == chronological on calendar-valid stamps (§6.4) — and prune's keep/remove/identity/idempotence clauses plus an mtime-invariance conjunct that makes R-2 falsifiable **at the prune site** (§6.5) |
| **O-20** | FSPEC §10 (OQ-6, SE Q-01) | AC-2.6's measurement-time reading must be **asserted**: (a) a successful sync records post-run states and exits 0; (b) hook/`--check` coincide; (c) the run's decisions come from the as-found pass | **§7** | Three executable properties over generated consumer trees plus a fourth for `supersedingState`, each stated against FSPEC §4.2's `generatedBy`-to-pass binding and measured through TSPEC §4.3's `assertRecordedPassIs` / `assertPhaseOrder` / `assertPostCopyNarrow`. §7 also disposes the one place the two readings could diverge for `supersedingState` (post-copy vs post-run) by asserting they **agree**, rather than picking one silently |
| **AC-1.8(iv)** | REQ §3 | The same totality / exclusivity / determinism properties for `rows[].reason` (`null` exactly on non-`unknown`) and for `baselineReason` (`null` exactly on `resolved`) | **§4, §5.2** | PROP-RSN-01…05 and PROP-BSL-01…07, including the two `null`-exactly biconditionals (PROP-RSN-02, PROP-BSL-02) and the disjointness property (PROP-RSN-05) that keeps a baseline reason out of `rows[].reason` and vice versa |
| **`PDLC_FAULT` subset** | TSPEC §16 ("new" row), FSPEC §10 O-10 | The emitted token set is a subset of TSPEC §5.2's **sixteen**; it cannot be asserted example-wise | **§8** | Asserted in both directions and by two independent oracles: a **recognition** property over generated non-members (exactly one N-7, nothing injected, byte-equivalence to the seam-unset run) and a **static call-site closure** property over the shipped bash sources against the exported `PDLC_FAULT_TOKENS`. Subset alone would be satisfied by an implementation that recognises nothing, so the equality direction is asserted too |
| O-11 (partial) | REQ §10 / FSPEC §10 | uid-0 runners skip with a **printed reason and named unverified invariants** — never silently pass | **§1.6, §11** | TSPEC §1.3 owns the policy and the AT-level inventory; this document adds the **property-level** inventory: the two existence-`indeterminate` leaves (§2.3 L3, L7) are permission-only, so their skip messages name the leaf and the invariant, and §11 records that the *row reasons* they would have produced stay covered by tokens 15/16 — the leaf is the hole, not the reason |
| O-1 / O-7 (consumed, not owned) | FSPEC §10 | Trace grammar and the classify-before-create oracle | **§8.3 (derived only)** | TSPEC §4 owns these. This document adds two grammar-level properties (percent-encoding round-trip, `seq` monotonicity) because they are quantified rather than example-shaped, and marks them **supporting**: O-1's disposition remains TSPEC §4.3's |

### 0.3 Explicitly out of scope

- **Message *content*** — the remediation-class assertions (TSPEC §7.4) and `distinct()` (AT-30) are
  example-based over a fixed catalogue of twelve messages; a generator over English strings would
  assert nothing. Cited here so a reviewer does not read their absence as a gap: §13 maps AC-2.1,
  AC-2.3, AC-2.5, AC-2.5a and AC-2.8 to TSPEC §14.1 M-1/M-2/M-3.
- **AC-3.5's restore oracle** — "restoring the newest backup yields byte-identical pre-sync content"
  is a P0 example oracle (AT-8b, AT-26). §6.4's sort property is what makes *"the newest"*
  well-defined for it; the restore itself stays an AT.
- **The queue's D1–D8 shape validator** — TSPEC §12.1's sixteen-row table discharges O-19(b) in
  design, one mutation per row. A generator over mutations would re-derive it less precisely.
  FSPEC §10 O-19 states outright that the throwing-`_readFile` case is a unit test at the call site
  and **not** a PROPERTIES row.
- **Wall-clock latency** (NFR-2) — structurally discharged at FSPEC §13.1; no property asserts time.
- **`packagingViolations` / `coveredViolations` / `advertisedVersionViolation`** — these are pure
  functions of a root, but their obligations (O-16, O-17) are fixture-pinned by TSPEC §10 and their
  claims are about **specific trees**, not quantified. §14 records the one property-shaped
  opportunity left on the table and why it is not taken.

## 1. Conventions

### 1.1 Property identifier scheme and classification

`PROP-{DOMAIN}-{NN}`, domains: `CLS` (row states), `RSN` (row reasons), `BSL` (baseline reasons),
`BKP` (backup grammar), `MTM` (measurement time), `SEAM` (env seams), `DET` (determinism),
`NEG` (negative). Every property row carries:

| Column | Meaning |
|---|---|
| Category | the skill's taxonomy — Functional, Contract, Data Integrity, Error Handling, Idempotency, Integration, Observability |
| Level | Unit (in-process, no spawn) · Harness (spawned bash, batched) · Integration (full entrypoint over a real tree) |
| Mode | **E** executable now · **E-skip** executable except on a named capability-poor runner (§1.6) · **D** design-time argument with a named surrogate |
| Lands in | the jest file from TSPEC §14's inventory |

### 1.2 Executable vs design-time, and the two executable harnesses

Everything in this document is executable on one of exactly two surfaces, both already specified by
the TSPEC — no third runner, no new dependency:

| Surface | What it drives | Cost per generated case | Used by |
|---|---|---|---|
| **Batched grammar driver** — `__tests__/helpers/bin/backup-grammar.sh` + `runGrammar(cases)` (TSPEC §11.2) | `pdlc_backup_format` / `_parse` / `_prune_backups`, sourced from C1 | **zero spawns** — one spawn per property *run*, cases zipped by line | §6 |
| **`runScript(entrypoint, opts)`** over builder-made trees (TSPEC §3.1, §3.3) | the real hook / `--check` / sync entrypoints | **one spawn per run**, so cases are packed into *rows of one manifest* (§1.4) | §3, §4, §5, §7, §9 |
| in-process JS (no subject spawn) | `validateDriftRecord` / `mapDriftState`, `M6_ID_REGEX`, the shipped bash sources read as text | zero | §8.2, §8.4 |

A property is **D** (design-time) only when the TSPEC's black-box constraint (R-1: a branch with no
difference in exit code, stderr, trace or on-disk artifact is untestable) makes it unobservable.
Every **D** row in this document names its example-based surrogate; none is left as prose.

### 1.3 The generator library — seeded, dependency-free, shrink-explicit

**No property-testing dependency is added.** `pdlc/workflows/package.json` has exactly one
devDependency (jest), and TSPEC §1.2 rejected bats specifically for adding one; adding `fast-check`
for this document would contradict that decision on weaker grounds. Generation lives in a new
helper, `__tests__/helpers/driftGenerators.js`, excluded from jest by the existing
`testPathIgnorePatterns`:

```js
export function seeded(seed) -> { int(lo,hi), pick(arr), shuffle(arr), bytes(n) }  // xorshift32
export function enumerateLeaves() -> Leaf[]            // §2.3 — exhaustive, not sampled
export function genId(rng) -> string                   // M6_ID_REGEX-conforming, §6.2
export function genStamp(rng, { calendarValid })       // §6.2
export function shrink(caseValue) -> caseValue[]       // §2.5, §6.2 — explicit ladders
```

Four rules, each of which exists because its absence is a known way for a property suite to go
quietly green:

1. **Seed is fixed and printed.** Every property run uses a literal seed constant declared in the
   test file, and the failure message prints seed + case index. A time-derived seed would make a
   red run unreproducible, which on a suite with no CI (TSPEC R-3) means it gets deleted rather
   than debugged.
2. **Exhaustive where the domain is small.** §2.3's eleven leaves and §5.1's determinate evidence
   vectors are **enumerated**, not sampled. Sampling a domain you can enumerate is how a cell goes
   untested and stays untested — which is precisely REQ v13's failure mode, in a different costume.
3. **Shrinking is an explicit ladder, not a search.** Each generator exports `shrink(x)` returning
   a short, ordered list of strictly simpler cases (§2.5, §6.2); on failure the harness walks the
   ladder once and reports the simplest still-failing case. This is deliberately weaker than a
   library shrinker and is all that is needed, because the axes are already minimal.
4. **Case counts are bounded and stated per property.** Every §6 property runs 500 cases (one
   spawn, TSPEC §11.2); every spawned-entrypoint property states its run count in its row, and the
   totals are budgeted in §1.4.

### 1.4 Spawn budget: why axes are packed into rows, not runs

TSPEC R-3 is binding: with no CI, a slow suite is a suite that stops being run, and every
`runScript` case is a process spawn plus a temp tree. The budget rule this document adopts:

> **A generated case is a manifest *row*, not a *run*, wherever the axis is per-row.**

FSPEC §3.1 makes this sound: `classify_row` is pure with respect to the filesystem, rows are
independent (AC-1.4), and no row's outcome is an input to another's. So the nine hash-present leaves
of §2.3 are constructed as **nine rows of one manifest** and cost **one** spawn, with each row's
expected state asserted independently. Only genuinely run-level axes (the hash tool, the JSON tool,
the baseline evidence vector, `--force`, the entrypoint) cost a spawn each.

| Property family | Spawned runs | Note |
|---|---|---|
| §3 row states (11 leaves) | **3** | one packed run (9 leaves) + `hash-tool-absent` + one permission run for the two existence-`indeterminate` leaves (§1.6) |
| §4 row reasons | **0 additional** | the same three runs; reasons are asserted on the same records |
| §5 baseline reasons | **≤ 14** | one per determinate evidence vector reachable without a second tree; §5.1's table marks the reachable set |
| §7 measurement time | **6** | 2 sync (plain, `--force`) × 1 fixture family + hook + `--check` + the retiring-row sync + one repeat for PROP-MTM-05 |
| §9 determinism | **8** | four invariance pairs, each a two-run comparison |
| §6 backup grammar | **4** | one batched spawn per property group (§6.3/§6.4/§6.5/§6.5's locale conjunct) |
| §8 seams | **≤ 20** | recognition property: 16 members + 4 generated non-members (§8.1's stated cap) |

Ceiling: **≈ 55 spawns** across the whole property suite, against the TSPEC's existing AT-level
spawn count of the same order. Any property that would exceed its row's number must be re-expressed
as rows-in-one-manifest or moved to the batched driver before it is written.

### 1.5 Determinism rules every property inherits (TSPEC §2.5)

Every generated fixture is constructed and every run performed under the TSPEC's sandbox
(`LC_ALL=C`, `LANG=C`, `TZ=UTC`, constructed environment, `realpathSync`-normalised roots,
`HOME` a sibling of the tree). Three consequences bind the properties in this document:

1. **No property may assert an ordering the sandbox itself supplies.** §9's locale property
   deliberately injects `LC_ALL=en_US.UTF-8` through `opts.env` (TSPEC §11.3 row 2), because a
   property that runs only under the sandbox's `LC_ALL=C` cannot detect the removal of C1's own
   `export LC_ALL=C`.
2. **`generatedAtUtc` is normalised away in every byte-comparison** (TSPEC R-11); its own presence
   and shape are asserted once, by TSPEC §14.1 V-3, and no property re-asserts it.
3. **mtime is never an input and never an oracle.** §6.5's prune property and §9's `touch`
   property are the two places this is *falsifiable* rather than merely stated.

### 1.6 uid-0 and capability skips — the named inventory this document adds

TSPEC §1.3 owns `describeOrSkip` / `itOrSkip` and the AT-level uid-0 inventory. A property that
cannot run on a given runner uses the same helper and appears here — **never silently green, never
silently absent**:

| Property | Capability | Why unconstructible | Invariants the skip message must name |
|---|---|---|---|
| PROP-CLS-01 leaf **L3** (P1 `indeterminate`) | `uid-nonroot` | the recipe is `chmod 0600` on `workflows/dist/` (TSPEC §7.1); root traverses it regardless, and no fault token makes *existence* undecidable (tokens 15/16 fault the read, TSPEC v2.1 TE L-07) | "the leaf 'plugin-side existence is undecidable' is unverified; its row reason `plugin-artifact-unreadable` remains covered by leaf L4 via `PDLC_FAULT=plugin-artifact-read`" |
| PROP-CLS-01 leaf **L7** (P3 `indeterminate`) | `uid-nonroot` | `.claude/workflows/` mode `0600` | "the leaf 'consumer-side existence is undecidable' is unverified; its row reason `consumer-artifact-unreadable` remains covered by leaf L8 via `PDLC_FAULT=consumer-artifact-read`" |
| PROP-CLS-03 (totality **under permission denial**) | `uid-nonroot` | it quantifies over L3/L7 | as above, plus "totality is verified over the nine leaves constructible on this runner" |
| every §3/§4 property | `hash` | without a hash utility every row is `unknown`/`hash-tool-absent` (FSPEC §12's standing precondition) and the fixture would silently test something else | TSPEC §7.3's `hash` string, plus the leaf list left unverified |
| PROP-BSL-05 (`git`-routed evidence) | `git` | `git worktree list --porcelain` is the subject of AC-0.5 step 1 | TSPEC §7.3's `git` string, plus "AC-0.5 step 1's never-fall-through rule is unverified" |

**The row-reason floor stays a hard assertion on root.** That is the whole point of the middle
column: TSPEC §5.2's tokens 15/16 make all four `unknown` reasons F-reachable, so what skips on a
root runner is two **leaves**, not two reasons. §11 states the residual in exactly those terms.

## 2. The classifier's generation axes (O-9, regenerated)

### 2.1 Why the axes are a dependent tree, not a cross-product table

### 2.2 Run-level axis A0 — the hash utility

### 2.3 Per-row axes A1–A6 and the eleven leaves

### 2.4 Unconstructible combinations the generator must refuse

### 2.5 Shrink order

## 3. Row-state properties (O-9: totality, single-valuedness, determinism)

## 4. Row-reason properties (AC-1.8(iv))

## 5. Baseline-resolution axes and properties (O-9, second half)

### 5.1 Evidence axes E1–E7 and determinacy

### 5.2 Properties

## 6. Backup filename grammar properties (O-18)

### 6.1 The surface under test

### 6.2 Generators

### 6.3 Format/parse properties

### 6.4 Sort properties

### 6.5 Prune properties

## 7. Measurement-time properties (O-20, AC-2.6)

## 8. Seam-closure properties (`PDLC_FAULT` ⊆ 16; M6; trace grammar)

## 9. Determinism properties (TSPEC §2.5, AC-1.3)

## 10. Negative properties

## 11. Skip inventory and design-time arguments

## 12. Property → test file placement

## 13. Traceability — property ↔ AC ↔ FSPEC/TSPEC section

## 14. Coverage gaps and stated residuals
