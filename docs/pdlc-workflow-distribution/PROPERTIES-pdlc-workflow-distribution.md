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

REQ §10 O-9 is explicit: **regenerate the axes; do not import REQ v13's tables**, which had 24 of 96
cells undefined (SE v11 F-03). That failure is not a bookkeeping slip to be repaired by filling the
cells in — it is a property of the *representation*. A cross-product of six three-valued probes has
729 cells, most of them meaningless ("the plugin artifact is unreadable **and** the consumer bytes
equal the plugin's"), and a table with meaningless cells can only be completed by inventing outcomes
for inputs the system cannot receive. The next author then reads an invented outcome as normative.

The axes are therefore regenerated as a **dependent tree** rooted at FSPEC §3.2's six probes and
descended in FSPEC §3.3's ladder order:

- Each node is a probe; its children are that probe's outcomes **as constrained by its ancestors**.
- A probe appears in the tree only where FSPEC §3.3 actually evaluates it. `P4` is not asked when
  `P3 == no`, so no node exists for it there — not an "N/A cell", **no cell**.
- Every path from the root to a leaf is a construction recipe (TSPEC §3.3, §7.1) and maps to
  exactly one `(state, reason)` pair.

Three things follow, and they are what the properties in §3 and §4 actually assert:

1. **Totality is leaf-exhaustiveness**: the tree's leaves partition the reachable input space, so
   "no undefined fall-through" (AC-1.8(i)) becomes a checkable claim about a finite, enumerated set.
2. **Single-valuedness is structural** (FSPEC §3.6): the ladder's first-match order *is* the
   declared precedence, so the property to assert is not "the states are disjoint" (trivially true
   of a first-match ladder) but **"the ladder's order equals the declared precedence"** — asserted
   by constructing, for each precedence pair, a leaf where **both** conditions hold and asserting
   the higher one wins (§3, PROP-CLS-02).
3. **The absurd combinations are unreachable by construction**, not enumerated in prose: they have
   no path. §2.4 lists the two the *builder* must additionally refuse, because they are reachable
   as fixture specs even though they are not reachable as classifier inputs.

### 2.2 Run-level axis A0 — the hash utility

| Axis | Values | Scope | Source |
|---|---|---|---|
| **A0** `hashTool` | `present` · `absent` | **run**, never per row | FSPEC §3.1 (probed once per run), §3.3 rung 1 |

`A0 = absent` collapses the whole per-row tree: *every* row is `unknown`/`hash-tool-absent`
regardless of any path (FSPEC §3.3's first consequence). It is therefore a **single leaf** (L0),
not a factor multiplying the other ten, and it is the reason `hash-tool-absent` is the one row
reason that never skips (TSPEC §7.1).

### 2.3 Per-row axes A1–A6 and the eleven leaves

Axes, each named by the probe it descends from:

| Axis | Probe (FSPEC §3.2) | Values | Asked when |
|---|---|---|---|
| **A1** | P1 plugin artifact exists | `yes` · `no` · `indeterminate` | `A0 = present` |
| **A2** | P2 plugin artifact readable | `yes` · `no` | `A1 = yes` |
| **A3** | P3 consumer artifact exists | `yes` · `no` · `indeterminate` | `A2 = yes` |
| **A4** | P4 consumer artifact readable | `yes` · `no` | `A3 = yes` |
| **A5** | bytes (P5 applied to both sides) | `equal` · `differ` | `A4 = yes` |
| **A6** | P6 sync-manifest entry | `no-entry` · `entry-matches` · `entry-differs` | `A5 = differ` |

`A6`'s `no-entry` value has four **sub-recipes**, all classifying identically (FSPEC §1.2, §3.2 P6),
generated as an independent sub-axis so the equivalence is asserted rather than assumed:
sync manifest **absent** · **unreadable** · **malformed** · present but carrying **no entry for this
`id`**. `entry-matches` means `sha1(consumer) == syncManifest[id].consumerHash`; `entry-differs`
means it does not.

**The eleven leaves** — this is the enumeration `enumerateLeaves()` returns, and it is exhaustive
over the tree:

| Leaf | Path | State | Reason | Recipe (TSPEC §3.3 / §7.1) | Mode |
|---|---|---|---|---|---|
| **L0** | `A0 = absent` | `unknown` | `hash-tool-absent` | `makeToolDir` omits `shasum`/`sha1sum`/`openssl` | E |
| **L1** | `A1 = no` | `unknown` | `plugin-artifact-missing` | ordinary tree, `pluginPath` deleted | E |
| **L2** | `A1 = yes, A2 = no` | `unknown` | `plugin-artifact-unreadable` | `PDLC_FAULT=plugin-artifact-read:<id>` (token 15) | E |
| **L3** | `A1 = indeterminate` | `unknown` | `plugin-artifact-unreadable` | `chmod 0600` on `workflows/dist/` — **permission only** | E-skip (uid-0) |
| **L4** | `A3 = indeterminate` | `unknown` | `consumer-artifact-unreadable` | `.claude/workflows/` mode `0600` — **permission only** | E-skip (uid-0) |
| **L5** | `A3 = yes, A4 = no` | `unknown` | `consumer-artifact-unreadable` | `PDLC_FAULT=consumer-artifact-read:<id>` (token 16) | E |
| **L6** | `A3 = no` | `missing` | `null` | consumer path absent, `.claude/workflows/` present and traversable | E |
| **L7** | `A5 = equal` | `in-sync` | `null` | consumer bytes := plugin bytes; **A6 not asked** | E |
| **L8** | `A5 = differ, A6 = no-entry` | `unverified` | `null` | ×4 sub-recipes (absent / unreadable / malformed / no id) | E |
| **L9** | `A5 = differ, A6 = entry-matches` | `stale` | `null` | bytes X ≠ plugin, entry `consumerHash = sha1(X)` | E |
| **L10** | `A5 = differ, A6 = entry-differs` | `local-edit` | `null` | bytes Y, entry over X, X ≠ Y ≠ plugin | E |

Two readings this table pins, because both are places an implementation drifts silently:

- **L7 does not consult A6.** Equal bytes classify `in-sync` *regardless of provenance* — FSPEC
  §3.4 R-4, O-8, AT-6. The tree expresses this as the absence of a child, so a generator cannot
  produce an "equal bytes + degraded manifest ⇒ `unverified`" case even by accident.
- **L3 and L2 share a reason; L4 and L5 share a reason.** That is FSPEC §3.3's footnote (a
  plugin-side untraversable ancestor is `plugin-artifact-unreadable`, not the consumer-side
  reason). §4's PROP-RSN-04 asserts precisely this pairing, because v1 of the FSPEC got it wrong in
  the opposite direction and the wrong value routes the operator to the wrong remediation.

**Leaf coverage of the closed sets:** the eleven leaves cover all six states and all four row
reasons; `hash-tool-absent` is L0, `plugin-artifact-missing` L1, `plugin-artifact-unreadable`
L2/L3, `consumer-artifact-unreadable` L4/L5. This is the generated set TSPEC §1.4's row-state and
row-reason **meta-oracles** measure — a generator that under-covers turns those floors red rather
than passing quietly.

### 2.4 Unconstructible combinations the generator must refuse

Two combinations are expressible as *fixture specs* while being unreachable as *classifier inputs*.
TSPEC §16 names both; the generator must make them **impossible**, not merely undrawn:

| # | Combination | Why unreachable | Enforcement |
|---|---|---|---|
| U-1 | `hash-tool-absent` on a **subset** of rows | the probe is once per run (FSPEC §3.1); the property is of the machine, not the path (§3.3's second consequence) | `makeConsumerTree` **throws** (TSPEC §7.1); `enumerateLeaves()` emits L0 only as a whole-run leaf, never as a row spec |
| U-2 | a `stale` row whose consumer bytes **equal** the plugin's | rung 3 precedes rung 5, so it classifies `in-sync` | `setRowState` re-derives the expected classification and **throws** (TSPEC §3.3) — the builder is its own first oracle |

A third, weaker case is worth stating because a generator invites it: **`local-edit` without an
entry** classifies `unverified` (rung 4 precedes rung 6). `setRowState` throws on that too. The
generator never constructs a state by *name*; it constructs a **leaf**, and the name is the leaf's
expected output — which removes the whole class.

### 2.5 Shrink order

Ladders are explicit (§1.3 rule 3). For a failing classifier case the harness reports, in order:

1. **Fewest rows** — re-run the same leaf as the *only* row of a one-row manifest. A packed
   nine-row run that fails is almost always failing on one row, and the one-row form is the
   reproduction a maintainer can debug in a shell.
2. **Shortest bytes** — artifact contents shrink toward the 64-byte floor `makePluginTree`
   guarantees (TSPEC R-9); never below it, because tokens 10/12 truncate to half length.
3. **Simplest id** — `genId` shrinks toward `a`, then `a0`, then the drawn value; ids containing
   `.`/`-`/stamp-shaped substrings shrink to the plain form **last**, so a failure that depends on
   the id charset is not shrunk out of existence.
4. **Simplest sub-recipe** — A6's `no-entry` shrinks toward **absent** (the ordinary first-adoption
   condition), so a failure that is really about the unreadable/malformed notice (N-4) surfaces as
   a difference between the shrunk and unshrunk cases rather than disappearing.

The ladder is walked **once** and every step is re-run; the reported case is the simplest one that
still fails, with seed and leaf id printed.

## 3. Row-state properties (O-9: totality, single-valuedness, determinism)

All quantify over `enumerateLeaves()` (§2.3) and are asserted on the `rows[]` of the record written
by the run (FSPEC §1.3), never on stdout.

**PROP-CLS-01 — Every leaf classifies to its declared state.**
For every leaf `L` in §2.3, the row constructed from `L` must have `state` exactly equal to `L`'s
declared state. *(Functional · Harness · E, L3/L4 E-skip · `driftClassify.test.js`)*
Nine leaves are packed as nine rows of one manifest (§1.4); L0 and the two permission leaves are
separate runs. Traces to AC-1.1, FSPEC §3.3.

**PROP-CLS-02 — The ladder's order is the declared precedence.**
For every adjacent pair in `unknown > missing > in-sync > unverified > stale > local-edit`, a row
must exist in which **both** members' conditions hold, and its `state` must be the higher member.
*(Functional · Harness · E · `driftClassify.test.js`)*

| Pair | Co-holding fixture | Expected |
|---|---|---|
| `unknown` > `missing` | consumer path absent **and** `PDLC_FAULT=plugin-artifact-read:<id>` | `unknown` |
| `missing` > `in-sync` | consumer path absent, plugin artifact present — *the vacuous-equality trap*: an implementation comparing "both hashes null" as equal reports `in-sync` | `missing` |
| `in-sync` > `unverified` | bytes equal **and** no sync-manifest entry (AT-6's shape) | `in-sync` |
| `unverified` > `stale` | bytes differ, no entry — an implementation defaulting a missing entry to "matches" reports `stale` | `unverified` |
| `stale` > `local-edit` | bytes differ, entry present with `consumerHash == sha1(consumer)` | `stale` |
| `unknown` > every lower | `A0 = absent` over a tree whose rows would otherwise be `in-sync`, `stale` and `missing` | all `unknown` |

This is the falsifiable form of "mutual exclusivity". Asserting that the six states are pairwise
disjoint is vacuous over a first-match ladder — the defect the property must catch is a ladder whose
*order* has drifted from the declared precedence, and only a co-holding fixture catches it. The last
row is FSPEC §3.3's first consequence and is the one an implementation gets wrong by probing the
hash tool last (as FSPEC v1 did).

**PROP-CLS-03 — Totality: no input escapes the ladder.**
Over the enumerated leaves, every row in the record has a `state` drawn from the closed six-member
set, and `rows` has exactly one entry per manifest row — no row is absent, duplicated, or carries a
value outside the set. *(Contract · Harness · E, uid-0 partial · `driftClassify.test.js`)*
Positive-presence conjunct: `rows.length === manifest.rows.length` and the multiset of `rows[].id`
deep-equals the manifest's id multiset. Without it the property is satisfied by an implementation
that emits no rows at all — the vacuous pass FSPEC §12's standing precondition and AC-1.0 both warn
about, and the same shape as TSPEC §4.3 conjunct (a).

**PROP-CLS-04 — Single-valuedness: one state per row, per run.**
No row carries two states and no run reports a row twice; asserted as multiset equality of
`rows[].id` against the manifest (PROP-CLS-03's conjunct) **plus** `assertClassifyBeforeCreate`'s
multiset conjunct over the `as-found` trace, which catches a double-classification that the record
would have collapsed. *(Contract · Harness · E · `driftClassify.test.js` + `driftOrdering.test.js`)*

**PROP-CLS-05 — Determinism across runs and processes.**
For every leaf, two consecutive `--check` runs over the *unmodified* tree, in two separate
processes, produce byte-identical `rows` (modulo `generatedAtUtc`, §1.5). *(Idempotency · Harness ·
E · `driftClassify.test.js`)* AC-1.8(iii)'s "across runs and processes"; the remaining
independence axes (clock, mtime, environment order, directory order, locale) are §9's, quantified
over the same leaves rather than restated here.

**PROP-CLS-06 — Row independence.**
For any two leaves `L`, `L'` packed into one manifest, each row's state equals the state it has when
constructed alone. *(Functional · Harness · E · `driftClassify.test.js`)*
This is the property §1.4's packing rests on: it makes the spawn budget sound instead of assumed,
and it is AC-1.4's quantified form. Red against an implementation with an early exit or a shared
variable leaking across the row loop — the bash `for`-loop failure TSPEC §4.3 names.

**PROP-CLS-07 — `A6`'s four degradation sub-recipes are equivalent.**
Over the four `no-entry` sub-recipes (absent / unreadable / malformed / present-without-id), the
resulting `rows` are **deep-equal**; the unreadable and malformed cases additionally emit N-4 exactly
once and the absent case emits none. *(Data Integrity · Harness · E · `driftClassify.test.js`)*
FSPEC §1.2 and O-8. The N-4 half is the discriminating conjunct — without it the property is
satisfied by an implementation that treats every degradation as absence *and never tells the
operator*, which is the difference between a first-adoption state and a corrupted file.

**PROP-CLS-08 — `not-managed` is never a state.**
For every generated tree containing 0–3 extra files in `.claude/workflows/` (no row, no `retires`
membership, and — as a deliberate adversarial draw — one basename beginning `.pdlc-`), no such file
appears in `rows`, none is read for comparison, none is modified, and every non-`.pdlc-` one appears
in the report's `not-managed` listing, `LC_ALL=C`-sorted. *(Contract · Integration · E ·
`driftClassify.test.js`)* AC-0.6, AC-1.5, NFR-3. Byte-unchanged is asserted positively (hash before
and after), not as "the run did not error".

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
