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
| pdlc | **Draft** | Claude + operator | 2.0 | 2026-07-28 |

> **v2.0 disposes CROSS-REVIEW-product-manager-PROPERTIES-v1 (2H/5M/2L) and
> CROSS-REVIEW-software-engineer-PROPERTIES-v1 (5H/4M/6L).** Every finding is dispositioned by
> reviewer-qualified id in **§15**. The four structural changes: PROP-CLS-02 is re-derived so it no
> longer claims a co-holding fixture for adjacencies that cannot co-hold (SE F-01); §5.1's
> determinacy rules are restored to FSPEC §2.1's and the vector count re-derived (SE F-02/F-03);
> PROP-MTM-04's post-copy conjunct is scoped and its disagreement case asserted positively
> (SE F-04); and §1.4's spawn budget is recomputed from the properties as written, which moves the
> ceiling from ≈ 55 to **≈ 180** and forces R-3 to be re-argued on wall clock rather than on spawn
> count (SE F-05, PM F-04). One property is added — **PROP-MTM-07**, sync idempotence (PM F-02).

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

> **This index is regenerated against the settled body at every revision** (SE F-09). It names
> property ranges and leaf ids; where it disagrees with the body, the body wins and the index is a
> defect. v2.0 regenerated it after §3, §5, §7 and §11 settled.

| # | Source | Obligation (abridged) | Disposed in | One-line disposition |
|---|---|---|---|---|
| **O-9** | REQ §10 (AC-1.8/AC-1.0), FSPEC §10 | Classifier totality / single-valuedness / determinism over **states**, **row reasons** and **baseline reasons**, including both declared precedences. **Regenerate the axes; do not import REQ v13's tables** (24 of 96 cells undefined) | **§2, §3, §4, §5** | The axes are regenerated **from FSPEC §3.2's six probes** as a **dependent tree** (§2.1), not a cross-product: every leaf is reachable and maps to exactly one state, so the class of defect v13 shipped — an undefined cell — is not expressible in this representation. Eleven row leaves (§2.3) and a determinacy-respecting baseline evidence tree (§5.1, **20** enumerated vectors). **Three** declared precedences, asserted in the two forms their guard structure admits (§2.1(2), rewritten in v2.0): the **baseline** precedence is a genuine *selector* property (PROP-BSL-03, `selected == highest-ranked condition that holds and is determinate`, oracle computed from the vector); the **row-state** and **row-reason** precedences are first-match ladders whose adjacencies split into co-holdable pairs (real co-holding fixtures — PROP-CLS-02(a), PROP-RSN-03) and structurally unco-holdable pairs (a stated structural argument plus a directed oracle — PROP-CLS-02(b)). Determinism asserted against clock, mtime, environment order, directory order, locale and process (§9) |
| **O-18** | FSPEC §10 | Backup filename grammar: `parse(format(…))` round-trip over the full M6 id charset, `LC_ALL=C` descending == reverse-chronological, and `prune`'s four clauses (a)–(d) | **§6** | Built on TSPEC §11.1's three C1 functions and §11.2's **batched** driver (one spawn per property run). Round-trip and injectivity over the fixed-24-byte tail (§6.3), the sort property in two conjuncts — lexicographic == `(stamp, nn)` order, and `(stamp, nn)` order == chronological on calendar-valid stamps (§6.4) — and prune's keep/remove/identity/idempotence clauses plus an mtime-invariance conjunct that makes R-2 falsifiable **at the prune site** (§6.5) |
| **O-20** | FSPEC §10 (OQ-6, SE Q-01) | AC-2.6's measurement-time reading must be **asserted**: (a) a successful sync records post-run states and exits 0; (b) hook/`--check` coincide; (c) the run's decisions come from the as-found pass | **§7** | **Seven** executable properties over generated consumer trees (PROP-MTM-01…07: clause (a) → -01, clause (b) → -02, clause (c) → -03, `supersedingState` → -04, session currency → -05, pass-is-a-function-of-`generatedBy` → -06, and **sync idempotence** → -07, added in v2.0 per PM F-02), each stated against FSPEC §4.2's `generatedBy`-to-pass binding and measured through TSPEC §4.3's `assertRecordedPassIs` / `assertPhaseOrder` / `assertPostCopyNarrow`. §7 also disposes the one place the two readings could diverge for `supersedingState` (post-copy vs post-run): v1.0 asserted they always **agree**, which SE F-04 showed is false against a *conforming* implementation on the AT-35 fault composition (FSPEC §4.2 step 6 rewrites the sync manifest, a classifier input, between the two passes). v2.0 asserts agreement **on the runs where step 6 changed no entry for R** and asserts the *predicted disagreement* positively on the runs where it did |
| **AC-1.8(iv)** | REQ §3 | The same totality / exclusivity / determinism properties for `rows[].reason` (`null` exactly on non-`unknown`) and for `baselineReason` (`null` exactly on `resolved`) | **§4, §5.2** | PROP-RSN-01…**06** and PROP-BSL-01…**08**, including the two `null`-exactly biconditionals (PROP-RSN-02, PROP-BSL-02) and the disjointness property (PROP-RSN-05) that keeps a baseline reason out of `rows[].reason` and vice versa |
| **`PDLC_FAULT` subset** | TSPEC §16 ("new" row), FSPEC §10 O-10 | The emitted token set is a subset of TSPEC §5.2's **sixteen**; it cannot be asserted example-wise | **§8** | Asserted in both directions and by two **genuinely independent** oracles (§8.0 pins the independence, SE F-07): a **recognition** property that reads the *runtime* array by sourcing C1 (exactly one N-7 per non-member, nothing injected, byte-equivalence to the seam-unset run) and a **static call-site closure** property that reads the shipped bash sources *as text*. The two never read the same bytes. Subset alone would be satisfied by an implementation that recognises nothing, so the equality direction is asserted too |
| O-11 (partial) | REQ §10 / FSPEC §10 | uid-0 runners skip with a **printed reason and named unverified invariants** — never silently pass | **§11.1 (sole inventory)** | TSPEC §1.3 owns the policy and the AT-level inventory; this document adds the **property-level** inventory, and v2.0 collapses it to **one** table — §11.1 — because v1.0 carried two (§1.6 and §11.1) that disagreed on both the leaf ids and the `git`-gated set (SE F-06, PM F-03). The two existence-`indeterminate` leaves are **L3** (plugin side) and **L4** (consumer side); they are permission-only, so their skip messages name the leaf and the invariant, and §11.1 records that the *row reasons* they would have produced stay covered by **L2** (token 15) and **L5** (token 16) — the leaf is the hole, not the reason |
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
- **Wall-clock latency** (NFR-2) — structurally discharged at FSPEC §13.1; **no property asserts
  time, and no other surface does either.** Consequence, stated here rather than left implicit: a
  residual that is *routed* to NFR-2 is routed to nothing. v1.0's §11.2 D-2 did exactly that (PM
  F-05); v2.0 removes the routing and records the residual as **P-R-8** with the explicit statement
  that it has **no owning surface**.
- **`packagingViolations` / `coveredViolations`** — pure functions of a root, but their obligations
  (O-16, O-17) are fixture-pinned by TSPEC §10 and their claims are about **specific trees**, not
  quantified. **P-R-5** records the property-shaped opportunity left on the table and why.
- **`advertisedVersionViolation` (AC-6.6)** — routed **by name** to its owning oracle:
  **FSPEC §7.4 / TSPEC §10.3's root-parameterised `advertisedVersionViolation(root)`** — including
  `documentOracles.test.js`'s assertion over `LIVE_ROOT` (TSPEC §10.3) — exercised at
  the landing step over the *real* repository root (FSPEC §7.5, §7.7). PM F-07 is correct that
  P-R-5's argument does not transfer: AC-6.4's anti-widening guard is a claim about one frozen tree,
  whereas AC-6.6's claim (`dist/` bytes change ⇒ the advertised `plugin.json` `version` changes) is
  quantified **over roots** and is the defect REQ §0 fact 6 records this repo shipping twice. It
  therefore gets its own residual, **P-R-5a**, with its own argument — not a share of P-R-5's.

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

### 1.2 Executable vs design-time, and the two *spawning* surfaces

Everything in this document is executable on one of exactly three surfaces — **two of which spawn a
subject process**, the third being plain in-process JS. All three are already specified by the TSPEC:
no third *runner*, no new dependency. (SE F-10: v1.0 said "exactly two surfaces" above a three-row
table.)

| Surface | What it drives | Cost per generated case | Used by |
|---|---|---|---|
| **Batched grammar driver** — `__tests__/helpers/bin/backup-grammar.sh` + `runGrammar(cases)` (TSPEC §11.2) | `pdlc_backup_format` / `_parse` / `_prune_backups`, sourced from C1 | **zero spawns** — one spawn per property *run*, cases zipped by line | §6 |
| **`runScript(entrypoint, opts)`** over builder-made trees (TSPEC §3.1, §3.3) | the real hook / `--check` / sync entrypoints | **one spawn per run**, so cases are packed into *rows of one manifest* (§1.4) | §3, §4, §5, §7, §9 |
| in-process JS (**not a runner** — no subject process) | `validateDriftRecord` / `mapDriftState`, `M6_ID_REGEX`, the shipped bash sources read as text | zero | §8.1 (PROP-SEAM-02), §8.2, §8.3 |

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

1. **Seed is fixed, printed, and overridable.** Every property run uses a literal seed constant
   declared in the test file — overridable by the environment variable **`PDLC_PROP_SEED`** (when
   set to a decimal integer, it replaces every file's literal seed; unset is the default and the
   only value CI-less local runs ever use) — and the failure message prints **seed, case index and
   the case value itself**. A time-derived *default* seed would make a red run unreproducible, which
   on a suite with no CI (TSPEC R-3) means it gets deleted rather than debugged.

   Two consequences, both stated rather than left implicit (SE F-13, PM F-09):

   - **The drawn set is static.** With the default seed the suite explores the *same* 500 strings
     for the life of the feature. It is therefore a large **generated fixture set**, not an
     exploring property suite: coverage does not grow by re-running, and a defect outside the drawn
     sample is never found by repetition. This is an accepted trade — reproducibility over
     exploration, given R-3 — and it is why §6.2's *forced* adversarial proportions do the real
     work. `PDLC_PROP_SEED` is the escape hatch for a maintainer who wants to widen deliberately.
     Recorded as **P-R-9**.
   - **Reproduction is by replay, not by index.** `seeded(seed)` is a stateful xorshift32 consumed
     in draw order, so case *n* is reproduced by replaying draws 1…n — the failure message
     therefore prints the **case value**, and `shrink()` operates on that value, not on an index.
     Any generator whose cases must be addressable out of order must be written as a pure function
     of `(seed, index)`; none in this document is.
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
independent (AC-1.4), and no row's outcome is an input to another's. So the **eight** hash-present,
non-permission leaves of §2.3 (L1, L2, L5, L6, L7, L8, L9, L10 — L0 is a whole-run leaf and L3/L4
are permission-only whole-run leaves) are constructed as **eight rows of one manifest** and cost
**one** spawn, with each row's expected state asserted independently. Only genuinely run-level axes
(the hash tool, the JSON tool, the baseline evidence vector, `--force`, the entrypoint, a
non-selector-bearing fault token) cost a spawn each.

**The v1.0 budget was wrong, and wrong in the direction that mattered.** SE F-05 and PM F-04 are
both correct: §8 counted only PROP-SEAM-01, §9 counted four pairs against six properties, §6 folded
five prune properties into one spawn and omitted PROP-BKP-04, §7's "6" was a per-mode count against
properties that quantify per generated tree, §3's packed run was "9 leaves" when there are 8 packable
ones, and §5's "≤ 14" came from the miscounted determinacy rules SE F-02 identifies. The rows below
are recomputed **from the properties as written in this v2.0**, counting a spawn wherever a property
needs a distinct process.

| Property family | Spawned runs | Derivation |
|---|---|---|
| §3 row states (11 leaves) | **4** | one packed run (8 leaves) + L0 (`hash-tool-absent`) + L3 (plugin-side permission) + L4 (consumer-side permission). L3 and L4 are two runs, not one: each makes a *whole side* untraversable, so no manifest can carry both |
| §3 PROP-CLS-02 (precedence) | **2** | one fault-armed run carrying the co-holding rows for `unknown > missing` and `in-sync > unverified`; the `unknown > every lower` row reuses the L0 run; §3's three directed rows land on runs already counted |
| §3 PROP-CLS-05 (determinism) | **2** | two consecutive `--check` runs over the packed manifest |
| §3 PROP-CLS-06 (row independence) | **8** | each packable leaf re-run as the *only* row of a one-row manifest. This is the price of the packing rule; it is paid once, and every other §3/§4 property then rides the packed run |
| §3 PROP-CLS-07 (A6 sub-recipes) | **4** | the sync manifest is a **run-level** artifact, so absent / unreadable / malformed are three runs; present-but-no-entry-for-`id` is a fourth |
| §3 PROP-CLS-08, PROP-NEG-01 | **3** | three generated trees carrying 0–3 extra files plus the `.pdlc-` adversarial draw |
| §4 row reasons | **1 additional** | PROP-RSN-01/-02/-04/-05/-06 ride the runs above; PROP-RSN-03 needs one fault-armed run for its two lower pairs (its top pair reuses L0) |
| §5 baseline reasons | **39** | 20 enumerated evidence vectors (§5.1: 10 manifest-chain vectors × E1's 2 values) + 3 ladder-fault vectors for `drift-state-invalidated` + 6 for PROP-BSL-06's two extra entrypoints over 3 E1-holds vectors + 10 for PROP-BSL-08's 5 non-default config states over 2 vectors. PROP-BSL-05's queue half is in-process |
| §6 backup grammar | **8** | 2 batched format/parse runs + 1 sort run + 1 locale-injected sort run (PROP-BKP-07) + 1 prune run for PROP-BKP-09/-10/-11 + 1 second prune for PROP-BKP-12 + 1 re-shuffled-mtime prune for PROP-BKP-13 + 1 `nnExhausted` entrypoint run for PROP-BKP-04. PROP-BKP-06 and -08 are pure JS |
| §7 measurement time | **21** | 3 plain syncs + 3 `--force` syncs (PROP-MTM-01/-03) + 4 hook/`--check` runs (PROP-MTM-02) + 5 retired-path runs (PROP-MTM-04: 2 fault-free sync, 2 corrupt-copy sync, 1 hook) + 3 post-sync `--check` runs (PROP-MTM-05) + 2 write-failing syncs (PROP-MTM-06) + 1 repeat sync (PROP-MTM-07) |
| §8 seams | **47** | PROP-SEAM-01: 16 member runs + 4 non-member draws + 1 seam-unset comparison. PROP-SEAM-03: 16 runs (9 non-bearing tokens with a selector appended, 7 bearing tokens with one) over 2–4-row manifests. PROP-SEAM-04: 4 mixed lists. PROP-SEAM-05: 3 generated trees × 2 runs. PROP-SEAM-07: 1 batched encoder driver. PROP-SEAM-02, -06, -08 add none |
| §9 determinism | **9** | PROP-DET-01 (1: the second run of the TZ pair, first reuses the packed run), -02 (2: two-sided and one-sided), -03 (1), -04 (2), -05 (1), -06 (2). PROP-CLS-05's two runs are counted in §3, not here |
| §10 negatives (not already counted) | **27** | PROP-NEG-02 (3 root-resolution adversarial trees), -03 (6 write-failure compositions), -04 (4 surface legs), -05 (5 perturbed runs: `artifactVersion` ×2, `pluginVersion`, `syncedAtUtc`, **`pluginHash`**), -06 (8: six R-states + two failure compositions), -07 (6: M10's three clauses × 2 entrypoints) |

**Ceiling: ≈ 180 spawns**, not the ≈ 55 v1.0 claimed. That number has to be defended rather than
apologised for, so:

> **R-3 is a claim about wall clock, not about spawn count.** TSPEC R-3's risk is "a slow suite
> stops being run". A `runScript` case is one `bash` process over a temp tree of a handful of small
> files; at the 0.15–0.25 s per spawn this harness costs on a developer machine, **≈ 180 spawns is
> ≈ 27–45 s** of added `npm test` time, on top of the TSPEC's existing AT suite of the same order.
> That is inside the budget a maintainer tolerates for a full-suite run and outside the one they
> tolerate for a tight edit loop — so the mitigation is jest's own file selection (`-t`, per-file
> runs), which the §12 placement rule already makes usable because each property is one `it()` in
> the file that owns its AT family.

**The rule this budget enforces, restated so it can actually fire.** Any property whose
implementation exceeds its row's number must be re-expressed *before it is written*, in this
priority order — the same order P-R-7 states, now with the two named first candidates:

1. **Repack** a per-row axis into rows of one manifest (never a per-run axis; §2.2's A0 and §5.1's
   evidence vector are per-run by construction).
2. **Batch** onto the §11.2 grammar driver. The two families that would go first are §8's two
   16-token sweeps (PROP-SEAM-01(a), PROP-SEAM-03), which are 32 of the 180, and §3's PROP-CLS-06
   solo runs, which are 8.
3. **Never sample** a domain §1.3 rule 2 says to enumerate. The 16 tokens, the 11 leaves and the 20
   evidence vectors are enumerations; trimming them is how REQ v13's failure mode returns.

Measured cost is still a measurement, not a prediction — **P-R-7** keeps that residual open.

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

### 1.6 uid-0 and capability skips — one inventory, and it lives in §11.1

TSPEC §1.3 owns `describeOrSkip` / `itOrSkip` and the AT-level uid-0 inventory. A property that
cannot run on a given runner uses the same helper and appears in **§11.1 — the single authoritative
skip inventory in this document**. It is not restated here.

v1.0 carried two inventories, here and at §11.1, and they disagreed: on the leaf ids (this section
named **L3/L7** covered by **L4/L8**; §11.1 correctly named **L3/L4** covered by **L2/L5**) and on
the `git`-gated property set (**PROP-BSL-05** here; **PROP-BSL-03/-04/-06** there). Both reviewers
flagged it (PM F-03, SE F-06), and the failure is exactly the one the skip policy exists to prevent:
the skip message is *required* to name the invariant left unverified, and a duplicated inventory
prints a message naming a leaf that in fact ran. v2.0 removes the duplicate rather than repairing
it — §11.1 is the one place the text lives, and the skip strings in the test files are read from it.

**What survives here is the argument, not the table.** The row-reason floor stays a hard assertion
on root: TSPEC §5.2's tokens 15/16 make all four `unknown` reasons F-reachable, so what skips on a
root runner is two **leaves** (L3, L4), not two reasons. §11.1 and **P-R-1** state the residual in
exactly those terms.

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

The codomain is the closed four-member set with its own declared precedence (REQ §4, FSPEC §3.3):
`hash-tool-absent` > `plugin-artifact-missing` > `plugin-artifact-unreadable` >
`consumer-artifact-unreadable`. These properties are asserted on the **same records** §3's runs
already produce — they cost no additional spawn (§1.4).

**PROP-RSN-01 — Every `unknown` leaf carries its declared reason.**
For each of L0–L5, `rows[i].reason` equals the reason §2.3 declares, and it is a member of the
closed four-member set. *(Functional · Harness · E, L3/L4 E-skip · `driftClassify.test.js`)*

**PROP-RSN-02 — `reason` is `null` exactly on non-`unknown` states.**
Over every generated row of every property in this document:
`row.reason === null ⟺ row.state !== "unknown"`. *(Contract · Harness · E ·
`driftClassify.test.js`)*
Stated as a **biconditional**, deliberately. AC-1.8(iv)'s wording is "`null` on non-`unknown`
states"; the one-directional reading (`state !== unknown ⇒ reason === null`) is satisfied by an
implementation that also nulls the reason on `unknown` rows, which silently deletes the entire
remediation split AC-1.2 exists to create. The reverse direction is the load-bearing half.

**PROP-RSN-03 — The row-reason ladder's order is the declared precedence.**
For every adjacent pair, a row exists where both conditions hold and the higher reason is reported:
*(Functional · Harness · E · `driftClassify.test.js`)*

| Pair | Co-holding fixture | Expected |
|---|---|---|
| `hash-tool-absent` > `plugin-artifact-missing` | `A0 = absent` **and** the row's `pluginPath` deleted | `hash-tool-absent` |
| `plugin-artifact-missing` > `plugin-artifact-unreadable` | `pluginPath` deleted **and** `PDLC_FAULT=plugin-artifact-read:<id>` armed for the same row | `plugin-artifact-missing` |
| `plugin-artifact-unreadable` > `consumer-artifact-unreadable` | tokens 15 **and** 16 armed for the same row | `plugin-artifact-unreadable` |

Row 1 is the fixture FSPEC §3.3 says v1 of the decision procedure got wrong — "the entirely ordinary
machine with no `shasum` and a row whose `pluginPath` is absent". It is the single most valuable
case in this section and it needs no root.

**PROP-RSN-04 — Side attribution: the reason names the side that failed.**
For every generated row where exactly one side is unreadable/undecidable, the reason's side matches
the faulted side: plugin-side faults (L2, L3) ⇒ `plugin-artifact-unreadable`; consumer-side faults
(L4, L5) ⇒ `consumer-artifact-unreadable`. *(Data Integrity · Harness · E, partial on uid-0 ·
`driftClassify.test.js`)*
FSPEC §3.3's footnote exists because v1 wrote `consumer-artifact-unreadable` on the plugin-side
line. The four reasons exist precisely so remediations differ (AC-1.2), so a swapped attribution is
green on every state assertion and sends the operator to `chmod` the wrong tree. Paired with TSPEC
§14.1 M-1's remediation-class assertion, which checks the *message* the reason produces.

**PROP-RSN-05 — Row reasons and baseline reasons are disjoint.**
Over every record any property in this document produces: `rows[].reason` is never a member of the
eight-member baseline set, `baselineReason` is never a member of the four-member row set, and no
`rows[].reason` is non-null when `baselineStatus === "unresolved"` — because `rows` is `[]` there.
*(Contract · Unit + Harness · E · `driftClassify.test.js`, `driftBaseline.test.js`)*
AC-1.2's disjointness clause and FSPEC §3.3's closing rule. Asserted as a **cross-cutting invariant
checked by the shared read-back helper**, so it holds over every record the whole suite writes
rather than over a fixture chosen to demonstrate it.

**PROP-RSN-06 — Reason determinism.**
The determinism properties of §9 quantify over `(state, reason)` pairs, not states alone; a run
whose states are stable while a reason flips is a red run. *(Idempotency · Harness · E ·
`driftClassify.test.js`)* Stated as its own row because a comparison written over `rows[].state`
only — the obvious first implementation of §9's comparison — would not catch it.

## 5. Baseline-resolution axes and properties (O-9, second half)

### 5.1 Evidence axes E1–E7 and determinacy

The baseline is *evidence gathering* then *reason selection* (FSPEC §2.1), so the axes are the
**evidence vector**, and the property is about the selector applied to it. Each probe is
three-valued: `holds` · `does-not-hold` · `indeterminate`, and a probe is `indeterminate` **exactly
when a probe it depends on did not succeed** — never for any other reason.

| Axis | Probe | Values | Indeterminate when | Recipe (TSPEC §13.1) |
|---|---|---|---|---|
| **E1** | consumer repo root | `holds` (unresolved) · `does-not-hold` | never | `nonGitNoClaude`, `gitTreeBrokenProbe`, `nonGitClaudeAtHome`, `PDLC_FAULT=git-worktree-list`\|`walk-stat` |
| **E2** | JSON utility absent | `holds` · `does-not-hold` | never | `makeToolDir` without `python3`/`python`/`python2` |
| **E3** | `<pluginRoot>` | `ok` · `unset` · `unreadable` | never (E1 selects the *branch*, not the determinacy — FSPEC §2.4) | `pluginRootUnset`; `CLAUDE_PLUGIN_ROOT` at a file |
| **E4** | manifest absent | `holds` · `does-not-hold` · `indeterminate` | `E3 ≠ ok` | `preManifestConsumer` |
| **E5** | manifest malformed | `holds` · `does-not-hold` · `indeterminate` | `E2 = holds` or `E4` indeterminate | `manifestClauseBroken` (validator path), `manifestUnparseable` (helper `12`) |
| **E6** | manifest empty | `holds` · `does-not-hold` · `indeterminate` | `E5` indeterminate | `emptyManifest` |
| **E7** | `checkEnabled` | always determinate, fail-closed `true` | never | `optOutConsumer`, `nonBooleanConfig` |

`drift-state-invalidated` is **not** an evidence axis: it is produced by §4.4 rung (i) *after*
selection and replaces the selected reason (FSPEC §2.8). It is therefore generated as a separate
one-dimensional axis over the ladder fault compositions (`ladderRungI`/`II`/`III`, TSPEC §13.3) and
appears in PROP-BSL-04 as the top of the precedence.

**The generated set is the determinate vectors, enumerated.** E4/E5/E6's `indeterminate` values are
not drawn independently — they are *derived* from E2/E3 by the rules above, exactly as §2.1's tree
derives its children. `enumerateEvidenceVectors()` returns the vectors that satisfy the determinacy
rules; there are 14 reachable without constructing a second plugin tree, and they are the ones
§1.4's budget accounts for. FSPEC §2.8's eight-row worked table is a subset of them and is asserted
literally as well (PROP-BSL-06), so a regression that keeps the generator green while breaking the
FSPEC's own worked example is still red.

### 5.2 Properties

**PROP-BSL-01 — Totality: every determinate evidence vector selects exactly one outcome.**
Over `enumerateEvidenceVectors()`, each run yields either `baselineStatus: "resolved"` with
`baselineReason: null`, or `"unresolved"` with a `baselineReason` in the closed eight-member set —
never a third shape, never an empty string, never a value outside the set. *(Contract · Harness ·
E · `driftBaseline.test.js`)*

**PROP-BSL-02 — `baselineReason` is `null` exactly when `resolved`.**
`baselineReason === null ⟺ baselineStatus === "resolved"`. *(Contract · Harness · E ·
`driftBaseline.test.js`)* AC-1.8(iv); same biconditional argument as PROP-RSN-02 (FSPEC §1.3's
field rule states it in exactly this form).

**PROP-BSL-03 — The selector is the declared precedence.**
For every generated vector, the reported `baselineReason` equals the **highest-ranked condition that
holds and is determinate**, under
`drift-state-invalidated > manifest-empty > json-tool-absent > manifest-malformed > manifest-absent >
repo-root-unresolved > plugin-root-unreadable > plugin-root-unset`. *(Functional · Harness · E ·
`driftBaseline.test.js`)*
The oracle is computed **in the test from the vector**, not looked up in a table copied from the
FSPEC: `expected = precedence.find(c => vector[c] === "holds")`. A table copy drifts; a
recomputation from the same declared list cannot. This is the property FSPEC §2.1's two-phase
structure exists to make observable, and the pair that falsifies a short-circuiting ladder is
`repoRootUnresolved` + `manifestEmpty` ⇒ `manifest-empty`.

**PROP-BSL-04 — An `indeterminate` condition is never selected.**
For every vector in which some condition is `indeterminate`, the reported reason is not that
condition. *(Error Handling · Harness · E · `driftBaseline.test.js`)*
The two dependency edges (E2→E5/E6, E3→E4) are both generated; the second is the one FSPEC §2.1
argues separately, because its prerequisite ranks *lower* in the precedence and the ranking argument
does not apply.

**PROP-BSL-05 — Unresolved implies not-evaluated, uniformly.**
For every vector selecting a reason: `rows === []` **and** `retiredPresent === []` — meaning "not
evaluated", never "none present" — while `writeFailures` may be non-empty; and no run in this state
reports a green outcome on any surface (hook silent, `--check` 0, queue proceed-silently are all
absent). *(Error Handling · Harness · E · `driftBaseline.test.js`, `queueDriftGate.test.js`)*
AC-0.3b, AC-1.0's "absence of evidence is never evidence of sync". The negative half is asserted
positively: the hook's stderr carries the manifest-level warning (W-1) with the reason **captured
and compared to the record's `baselineReason`**, so a run that warns with a *different* reason than
it recorded is red.

**PROP-BSL-06 — The no-write-target rule is keyed on evidence, not on selection.**
For every vector in which `E1 = holds` — **regardless of which reason was selected** — nothing is
created under the fixture root: no `.claude/`, no `.claude/workflows/`, no drift state, no sync
manifest, no backup directory; `writeFailures` is `[]`; `--check` and sync exit **3** and the hook
exits **0**; and N-8 is printed exactly when the *reported* reason is not `repo-root-unresolved`.
*(Error Handling · Integration · E · `driftRepoRoot.test.js`)*
This is FSPEC §2.8's third and fourth columns quantified. It is the property that catches the v2.0
defect the FSPEC records: a guard keyed on the *reason* creates a directory on the
`repoRootUnresolved` + `manifestEmpty` vector — the vector that is **ordinary at first release**.
The filesystem-emptiness half uses TSPEC §8.3's `assertTreeUnchanged` (`.git/`-scoped per TE F-12);
AT-33 is the named example this generalises.

**PROP-BSL-07 — Baseline resolution precedes row classification, always.**
For every generated vector, the trace contains a `manifest-read` record and it precedes every
`classify` record; and when the baseline is unresolved there are **no** `classify` records at all.
*(Contract · Harness · E · `driftOrdering.test.js`)*
AC-1.0's ordering clause, expressed on the seam TSPEC §4.2 already provides. The second conjunct is
the falsifiable half — an implementation that classifies first and discards the result satisfies
every field assertion in §5.2 and violates AC-1.0.

**PROP-BSL-08 — `checkEnabled` is resolved on every path, including unresolved ones.**
For every generated vector, the record carries a boolean `checkEnabled`; it is `false` only when the
config parses with an explicit boolean `false`, and `true` in all five degraded cases (key absent,
file absent, unreadable, malformed, non-boolean) with N-5 printed exactly once in the last three.
*(Error Handling · Harness · E · `driftBaseline.test.js`)*
AC-4.3's fail-closed rule as a total function over the config axis; the `manifest-absent` vector is
included explicitly, because that is the vector on which the documented opt-out has to stay
reachable at rollout (AC-0.3b, TSPEC §14.1 B-3/B-4).

## 6. Backup filename grammar properties (O-18)

### 6.1 The surface under test

TSPEC §11.1's three C1 functions, driven through §11.2's batched driver — **one spawn per property
group, not per case**:

| Function | Contract (TSPEC §11.1) |
|---|---|
| `pdlc_backup_format <id> <stamp> <nn>` | stdout `{id}.{stamp}-{NN}.bak`; exit 1 if `nn > 99` or `id` fails M6 |
| `pdlc_backup_parse <name>` | stdout `id TAB stamp TAB nn`; exit 1 if the **trailing 24 bytes** do not match `"." stamp(16) "-" NN(2) ".bak"` |
| `pdlc_prune_backups <dir> <knownIds…>` | keeps the 5 greatest per known id, removes the rest **of those ids**, identity elsewhere; always exits 0 |

`runGrammar(cases)` asserts line-count equality between input and output before zipping (TSPEC
§11.2), so a driver that dies halfway is a harness failure, not a property run that reports green
over 12 of 500 cases. Prune cases are the exception to the batching: each needs a directory, so
`prune` runs are batched **per property** (one directory tree containing every generated id) rather
than per case, which keeps §6.5 at one spawn.

### 6.2 Generators

| Generator | Draw | Shrink ladder |
|---|---|---|
| `genId(rng)` | conforms to **`M6_ID_REGEX`**, imported from `document-oracles.mjs` — the *same* regex C1's manifest validator uses (TSPEC §11.3 row 1). Length 1–64; first byte alphanumeric; body drawn from `[A-Za-z0-9._-]`. **Adversarial draws are forced, not hoped for**: ≥ 10% of the set contains `.`, ≥ 10% contains `-`, and ≥ 5% is a **stamp-shaped id** (`dev.20260101T000000Z`, `20260101T000000Z`, `x.20260101T000000Z-01`) | `a` → `a0` → `a.b` → drawn value; stamp-shaped ids shrink **last** |
| `genStamp(rng, {calendarValid})` | 16 bytes `YYYYMMDDTHHMMSSZ`. `calendarValid: false` draws digits syntactically (the parser is pattern-based, §6.3); `calendarValid: true` draws a real UTC instant in `1970-01-01 … 2999-12-31` | toward `19700101T000000Z` |
| `genNn(rng)` | `01…99`, plus the out-of-range draws `00`, `100`, `-1`, `1` (unpadded) as the **rejection** cases | toward `01` |
| `genDecoy(rng)` | names that must be untouched: no `.bak` suffix; `.bak` with a malformed tail; a well-formed backup for an **unknown** id; a name whose *id* portion is empty; a directory | — |

Two generator rules, both load-bearing:

1. **The id charset is imported, never re-declared.** A generator with its own charset proves a
   property about a set nothing else uses (TSPEC §11.3 row 1). `driftBackups.test.js` additionally
   asserts `M6_ID_REGEX` is the same object C1's validator is fed, via the export.
2. **Stamp-shaped ids are a floor, not an accident.** The whole reason FSPEC §1.4 parses by fixed
   offset is that the id charset admits stamp-shaped substrings. A generated set that happens not
   to contain one proves nothing about the ambiguity the fixed-offset parse exists to remove, so
   the proportion is asserted about the generated set itself before the property runs.

### 6.3 Format/parse properties

**PROP-BKP-01 — Round-trip.**
For every `(id, stamp, nn)` with `id` M6-conforming, `stamp` grammar-conforming and `nn ∈ 01..99`:
`parse(format(id, stamp, nn)) == (id, stamp, nn)`, field by field, byte for byte. *(Data Integrity ·
Harness (batched) · E · `driftBackups.test.js`, 500 cases)* FSPEC §1.4, O-18 clause 1.

**PROP-BKP-02 — `format` is injective.**
For every pair of distinct triples drawn from the same set,
`format(id₁,s₁,n₁) == format(id₂,s₂,n₂) ⟹ (id₁,s₁,n₁) == (id₂,s₂,n₂)`. *(Data Integrity · Unit
(names compared in JS after one batched format run) · E · `driftBackups.test.js`)*
Asserted as a **collision check over the generated name set**: build the map name → triple and
require no key collision with differing values. This is where the stamp-shaped ids earn their keep —
`dev.20260101T000000Z-01.bak` (id `dev`) versus a backup of the id `dev.20260101T000000Z` — and the
property is red against any implementation that parses left-to-right at the first `.`.

**PROP-BKP-03 — Rejection is total and side-effect-free.**
(a) `format` exits 1 for every `nn` outside `01..99` and every id failing `M6_ID_REGEX`, and prints
nothing to stdout. (b) `parse` exits 1 for every generated name whose trailing 24 bytes do not match
the grammar — including names *shorter* than 24 bytes, names with a valid tail but an **empty** id,
and `genDecoy` output — and prints nothing to stdout. *(Error Handling · Harness (batched) · E ·
`driftBackups.test.js`)*
The "prints nothing" conjunct is the falsifiable half: an implementation that prints a partial parse
*and* exits 1 passes an exit-code-only assertion and then feeds `pdlc_prune_backups` a garbage id.
The empty-id case is called out because `id := ${name:0:${#name}-24}` yields `""` for a 24-byte name
whose tail is well-formed, and `""` fails M6 — so it must be a parse failure, not an id.

**PROP-BKP-04 — `NN` exhaustion is a write failure, not a silent reuse.**
Over a directory holding all 99 backups of one id in one stamp, the next backup attempt reports
`operation: backup`, the destroying operation does **not** proceed, the pre-existing file is
byte-unchanged, and the run exits 4. *(Error Handling · Integration · E · `driftBackups.test.js`,
`nnExhausted` fixture)*
FSPEC §1.4's exhaustion clause. Not strictly a grammar property, but it is the only place the
grammar's finiteness becomes an operator-visible outcome, and the three positive conjuncts (exact
operation token, untouched original, exit code) are what keep it from being an absence-based oracle.

### 6.4 Sort properties

**PROP-BKP-05 — `LC_ALL=C` descending filename sort == descending `(stamp, nn)`.**
For a generated set of names sharing one id, sorting the names `LC_ALL=C` descending yields exactly
the order obtained by sorting the parsed `(stamp, nn)` tuples descending. *(Data Integrity · Harness
(batched) · E · `driftBackups.test.js`, 500 names)* O-18 clause 2.

**PROP-BKP-06 — `(stamp, nn)` descending == reverse-chronological.**
Over names drawn with `calendarValid: true`, descending `(stamp, nn)` order equals descending order
of the instants the stamps denote (mapped to epoch seconds in JS, ties broken by `nn`). *(Data
Integrity · Unit · E · `driftBackups.test.js`)*
PROP-BKP-05 alone proves *"lexicographic == tuple order"*, which is a statement about strings;
AC-3.4's claim is *"lexicographic == chronological"*, which is a statement about time. The bridge is
fixed-width zero-padded UTC, and it is exactly what would break if a future stamp gained a variable
component or a local-time offset. Both conjuncts are required, and they fail for different reasons.

**PROP-BKP-07 — The order is the subject's, not the caller's locale.**
The same generated name set, sorted by the subject with `LC_ALL=en_US.UTF-8` injected through
`opts.env`, yields the **identical** order. *(Contract · Harness · E · `driftBackups.test.js`)*
TSPEC §11.3 row 2: the harness sandbox sets `LC_ALL=C` on the child, which would mask the removal of
C1's own `export LC_ALL=C`. This property is the one that detects that removal, and it is the reason
the sandbox default cannot be trusted as coverage of §2.5's first rule.

**PROP-BKP-08 — "Newest" is well-defined and total.**
For every generated non-empty set of names for one id, `newest` (the head of the descending sort) is
unique. *(Data Integrity · Unit · E · `driftBackups.test.js`)*
AC-3.5's restore oracle says "restoring the **newest** backup for that id"; uniqueness is what makes
that oracle a function. It follows from PROP-BKP-02 (no two backups for one id share `(stamp, nn)`),
and it is asserted rather than derived because AT-8b/AT-26 depend on it.

### 6.5 Prune properties

All four clauses of O-18's prune obligation, over `genDecoy`-seeded directories containing backups
for 1–4 known ids (0–12 each), 0–2 **unknown** ids, and 0–5 non-matching entries, with **mtimes
shuffled by `utimesSync` after creation** (TSPEC §13.5 `shuffledMtimes`).

**PROP-BKP-09 — Keep-set correctness (clause a).**
After `pdlc_prune_backups <dir> <knownIds…>`, for every known id with `n` backups the surviving set
is exactly the `min(n, 5)` **greatest** members under §6.4's order. *(Data Integrity · Harness ·
E · `driftBackups.test.js`)*

**PROP-BKP-10 — Removal-set correctness (clause b).**
Exactly the remaining members of those known ids are gone, and **nothing else is** — the
post-directory equals `pre − removed`, compared as a set of names *and* as a map name → bytes, so a
prune that rewrote a surviving file is red. *(Data Integrity · Harness · E ·
`driftBackups.test.js`)*

**PROP-BKP-11 — Identity elsewhere (clause c).**
Every entry that does not match §1.4's pattern, and every matching entry whose id is **not** in
`knownIds`, is byte-identical before and after — including the sub-directory decoy and the
empty-id decoy. *(Data Integrity · Harness · E · `driftBackups.test.js`)*
This is the clause O-18 says has no oracle without it: FSPEC §5.6's "never touches a file not
matching the pattern for a current id" is otherwise prose. A stray file in the backup directory is
left alone **forever**, which the property states as invariance across repeated prunes
(with PROP-BKP-12).

**PROP-BKP-12 — Idempotence (clause d).**
`prune(prune(D)) == prune(D)` as a name → bytes map, for every generated `D`. *(Idempotency ·
Harness · E · `driftBackups.test.js`)*

**PROP-BKP-13 — mtime is never read at the prune site.**
For every generated `D`, the pruned result is **identical** to the result over the same directory
with every mtime re-shuffled (`utimesSync`, including mtimes that invert the filename order
completely — oldest filename given the newest mtime). *(Data Integrity · Harness · E ·
`driftBackups.test.js`)*
FSPEC §3.4 R-2 says mtime is never read *anywhere*; the prune site is the one place an implementer
reaches for `ls -t`, and this is the only oracle in the feature that makes R-2 falsifiable there.
The paired positive assertion — that the pruned member on the `sameSecondBackups` fixture is `-01`
(TSPEC §11.3 row 4) — is the example this generalises; the property is red against an mtime selector
even when it happens to agree on the example.

## 7. Measurement-time properties (O-20, AC-2.6)

**What this section is for.** FSPEC OQ-6 records that AC-2.6's two sentences cannot both be read
literally over the same field set on a sync run, and §4.2 applies a reading. SE Q-01 then moved
ownership here, because the party who needs the reading is the one writing the oracle that decides
whether a successful sync exits `0` or `1`. So this section is not commentary on the FSPEC's
reading — **it is the artifact that enforces it.** If these properties are deleted, the reading
reverts to prose and an implementation that records as-found states on a sync run is green.

The binding, from FSPEC §3's pass table and §4.2:

| `generatedBy` | Passes the run makes | Pass the **record** carries | Pass the **decisions** come from |
|---|---|---|---|
| `hook` | 1 | as-found | as-found (nothing to decide) |
| `check` | 1 | as-found (== post-run: nothing changed) | — |
| `sync` (plain or `--force`) | 3 | **post-run** (step 7) | **as-found** (step 2); retirement gated on **post-copy** (step 5) |

The measurement instrument is TSPEC §4.3's `assertRecordedPassIs(trace, driftState, phase)` — the
record's states compared against the states the named phase's `classify` trace records carried —
plus `assertPhaseOrder` and `assertPostCopyNarrow`.

**PROP-MTM-01 — A successful sync records post-run states and exits 0.**
For every generated consumer tree whose rows are all `stale` or `missing` (1–4 rows, contents and
ids generated), a plain sync copies every row and the written record satisfies: every
`rows[].state === "in-sync"`, `writeFailures === []`, `baselineStatus === "resolved"`, exit **0**,
and `assertRecordedPassIs(trace, record, "post-run")` holds. *(Integration · Integration · E ·
`driftSync.test.js`)*
Three conjuncts, each catching a different wrong implementation: the recorded states catch an
implementation that replays the as-found `stale` states; `assertRecordedPassIs` catches one that
*re-derives* `in-sync` without a third pass (and would therefore disagree with the trace); and the
exit code is the operator-visible consequence — under the rejected reading a fully successful sync
exits **1** and leaves the queue blocked (FSPEC §5.8, OQ-6).

**PROP-MTM-02 — On hook and `--check` the two readings coincide, and that is not evidence about
sync.**
For every generated tree, a hook run and a `--check` run each satisfy
`assertRecordedPassIs(trace, record, "as-found")` **and**
`assertRecordedPassIs(trace, record, "post-run")` vacuously-equal — the trace contains exactly one
`classify` pass, labelled `as-found`, and `assertPhaseOrder` collapses to `[as-found]`. *(Integration
· Integration · E · `driftHook.test.js`, `driftBaseline.test.js`)*
O-20 clause (b), including its warning: this property is stated with the **single-pass conjunct** so
it cannot be mistaken for evidence about clause (a). A test asserting only "recorded == as-found" on
a hook run is true of an implementation that records as-found on *sync* too.

**PROP-MTM-03 — The run's decisions come from the as-found pass.**
For every generated tree and both sync modes, the set of row ids carrying a `copy` trace record
equals the set of rows whose **as-found** state is `stale` or `missing` (plain), or that set plus
`local-edit`/`unverified` (`--force`); the set carrying a `backup` record equals the rows the same
pass says have existing bytes to destroy; and every such mutating record follows the last as-found
`classify` record. *(Integration · Integration · E · `driftSync.test.js`, `driftOrdering.test.js`)*
O-20 clause (c). It is observable **only** through the `as-found` trace label — which is why the
grammar carries three phase labels rather than two (FSPEC §10 O-1) — and it is what forbids an
implementation that re-classifies before copying and thereby lets a mid-run filesystem change
silently change what gets copied.

**PROP-MTM-04 — `supersedingState` is the post-run measurement, and the two candidate readings
agree.**
For every generated tree with a retired path present, `retiredPresent[].supersedingState` equals R's
state in the **recorded** pass (`as-found` for hook/`check`, `post-run` for sync) — **and**, on sync
runs, equals R's state in the `post-copy` pass. *(Data Integrity · Integration · E ·
`driftSync.test.js`, `driftHook.test.js`)*
AC-2.6 says `supersedingState` is measured "sync: **post-copy**"; FSPEC §3's table feeds
`retiredPresent[]` from the **post-run** pass. The two are not in conflict — deleting a retired path
cannot change R's own `consumerPath` bytes, so R's state is identical across steps 5 and 7 — but
"they cannot differ" is exactly the kind of claim that stops being true after an unrelated change.
Asserting the **agreement** disposes the ambiguity in the direction that stays honest: if a future
change makes them differ, this property goes red and the spec question is reopened, rather than one
reading silently winning. On non-sync runs only the first conjunct applies (there is no post-copy
pass), and the property asserts that too, so a hook implementation that fabricates a post-copy label
is red via `assertPhaseOrder`.

**PROP-MTM-05 — Post-sync state is current within the session.**
For every generated tree, immediately after a sync, `--check` over the unchanged tree reports every
copied row `in-sync` and every skipped row **its prior state**, and the queue mapping over the
sync-written record (no further run) yields the same outcome as over the `--check`-written one.
*(Integration · Integration · E · `driftSync.test.js`, `queueDriftGate.test.js`)*
AC-2.7's stated consequence (the queue unblocks without a restart) and AC-3.6. Without the second
half, "the drift state is current" is asserted only about a file the *next* run rewrites, which is
not the claim.

**PROP-MTM-06 — The recorded pass is a function of `generatedBy`, not of the outcome.**
Across every generated tree in §7 — green, mixed, and write-failing — the pass identified by
`assertRecordedPassIs` is determined solely by `record.generatedBy`, per the table above.
*(Contract · Integration · E · `driftSync.test.js`)*
Red against an implementation that records post-run states only when the sync succeeded and falls
back to as-found on a failed run — which is how the exit code and the record would disagree on
exactly the runs where an operator most needs them to agree (AT-35's shape: a corrupted copy must
record the **post-run** `unverified`, not the as-found `stale`).

## 8. Seam-closure properties (`PDLC_FAULT` ⊆ 16; M6; trace grammar)

### 8.1 The token-set closure (TSPEC §16's PROPERTIES row)

FSPEC §10 O-10 requires the emitted token set to be a subset of the enumerated one, and TSPEC §5.2
closes that enumeration at **sixteen**, exported from C1 as `PDLC_FAULT_TOKENS` so the property
reads the implementation's own list rather than a copy. The obligation is stated as a subset; a
subset alone is satisfied by an implementation that recognises **nothing**, so both directions are
asserted, by two independent oracles.

**PROP-SEAM-01 — Recognition equals the enumeration.**
(a) For every `t ∈ PDLC_FAULT_TOKENS` (all sixteen), a run with `PDLC_FAULT=t` prints **no** N-7
line. (b) For every generated non-member `s` — 4 draws per run family, comprising: a random
M6-conforming string, a **one-character mutation** of a real token (`mkdirr`, `mkdi`, `Mkdir`), a
real token with leading whitespace (`" mkdir"`, TSPEC §5.1's no-trim rule), and a real token of a
*different* case — the run prints N-7 **exactly once**, with the whole spec text captured, injects
nothing, and is **byte-equivalent** to the same fixture with the seam unset (stdout, drift state,
sync manifest, modulo `generatedAtUtc`). *(Contract · Harness · E · `driftFault.test.js`)*
The mutation draws are the falsifying half: a random string is rejected by any implementation, while
`mkdirr` is rejected only by one doing exact matching rather than a prefix or substring test.
Byte-equivalence (not "exit is still 0") is TSPEC §5.4 rule 2's form.

**PROP-SEAM-02 — Static call-site closure.**
Reading the shipped bash sources as text (`lib/pdlc-drift.sh`, `check-workflow-drift.sh`,
`sync-workflows.sh`): the set of literal first arguments to `pdlc_fault_active` is **equal** to
`PDLC_FAULT_TOKENS`, and every call site passes a literal (never a variable). *(Contract · Unit ·
E · `driftFault.test.js`)*
The subset direction is the obligation; the superset direction ("every listed token has at least one
guard") is what stops the enumeration from being padded with tokens no code consults — which would
make PROP-SEAM-01(a) pass for tokens that inject nothing anywhere. The literal-argument conjunct is
what keeps this oracle sound: a computed token name would make the static read incomplete without
saying so.

**PROP-SEAM-03 — Selector-bearing partition.**
For every token, with a selector appended: tokens TSPEC §5.1.1 marks **non-bearing** produce N-7
exactly once and inject nothing (the whole spec text captured, including the `mkdir:` and
`backup:a:b` forms); tokens marked **bearing** produce **no** N-7 and inject **only** for the row or
backup whose scope key is byte-equal to the selector — over generated 2–4-row manifests, exactly one
row is affected and the loop continues over the rest. *(Contract · Harness · E ·
`driftFault.test.js`)*
The "exactly one row" conjunct is what makes AT-35's "the loop continues" claim quantified rather
than anecdotal, and it is the failure TSPEC §5.4 rule 4 names: a spec that silently drops its
selector corrupts every row while the test still passes.

**PROP-SEAM-04 — A partially-recognised list behaves member-wise.**
For every generated list mixing `k ≥ 1` real tokens with one non-member, the real tokens inject,
N-7 is printed once for the non-member, and the exit is the unrecognised-token exit (hook **0**,
`--check`/sync **4**). *(Contract · Harness · E · `driftFault.test.js`)* TSPEC §5.4 rule 3.

**PROP-SEAM-05 — Both seams are inert when unset, at the observable level.**
For every generated tree, a run with neither `PDLC_FAULT` nor `PDLC_TRACE_FILE` set is
byte-equivalent (stdout, stderr, exit, drift state, sync manifest, consumer tree; modulo
`generatedAtUtc`) to a run with `PDLC_TRACE_FILE` set to a writable path and `PDLC_FAULT` unset.
*(Contract · Harness · E · `driftFault.test.js`, `driftOrdering.test.js`)*
AC-2.9(5)'s "every other observable is identical with the seams on or off", quantified. The
trace-file half is also the positive control for TSPEC §4.4's unwritable-trace test: that test
asserts the *blocked* path changes nothing, and this one asserts the *writable* path changes nothing
either — an implementation that behaves differently whenever tracing is on would pass the first and
fail this.

### 8.2 The id charset's unambiguity (M6)

**PROP-SEAM-06 — `M6_ID_REGEX` excludes every delimiter both seams use.**
For every string matching `M6_ID_REGEX` (500 generated draws plus the adversarial forms of §6.2), the
string contains no `,` (the `PDLC_FAULT` separator), no `:` (its selector separator), no tab (the
trace delimiter) and no newline (its record separator). *(Contract · Unit · E ·
`driftFault.test.js`)*
TSPEC §5.1.1 answers TE Q-03 by *citing* M6 as the authority for both grammars' unambiguity; this is
the executable form of that citation. TSPEC §14.1 F-2 asserts the four exclusions of the regex
directly; this property asserts them over generated members, so a future widening of the charset —
the change that would actually break the grammars — is red on both.

### 8.3 Trace grammar (derived — supports O-1, which TSPEC §4 owns)

Two quantified properties, marked **supporting**: O-1's disposition is TSPEC §4.3's oracle, and
nothing here replaces it.

**PROP-SEAM-07 — Percent-encoding round-trips byte-exactly.**
For every generated byte string (including tabs, newlines, `%`, bytes `0x00`–`0x1F` and `0x7F`–`0xFF`,
and valid and invalid UTF-8), `decode(encode(b)) == b` as bytes, and `encode(b)` contains no raw tab,
newline, carriage return, or byte outside `0x20`–`0x7E`. *(Data Integrity · Harness (batched, via a
one-off encoder driver on the §11.2 pattern) · E · `driftOrdering.test.js`)*
TSPEC §4.1's encoder/decoder pair. The second conjunct is the one that matters for the oracle: an
encoder that round-trips but leaves a raw tab in `arg` produces a trace line the parser splits into
six fields, and `parseTrace` then throws on a *conforming* run.

**PROP-SEAM-08 — `seq` is a gapless permutation of line order.**
For every generated run that produces a trace, `seq` values are exactly `1..n` in line order, with
no gap or repeat, and the record count equals the line count. *(Observability · Harness · E ·
`driftOrdering.test.js`)*
TSPEC §4.1's self-check, quantified over generated fixtures rather than one. A violation means a
traced call ran in a subshell, and the property is what makes that diagnosis rather than a silently
degraded ordering assertion.

## 9. Determinism properties (TSPEC §2.5, AC-1.3, AC-1.8(iii))

AC-1.8(iii) names five independence axes. Each is one property, quantified over §2.3's leaves, and
each is a **two-run byte comparison** of the record (modulo `generatedAtUtc`) with `(state, reason)`
pairs compared explicitly per PROP-RSN-06.

**PROP-DET-01 — Clock independence.**
Two runs over the same tree separated by a changed `TZ` and a changed wall-clock reading produce
identical records modulo `generatedAtUtc`. *(Idempotency · Harness · E · `driftClassify.test.js`)*
`generatedAtUtc` itself is asserted to differ or be equal indifferently — it is reporting-only
(AC-2.6) and the queue never compares timestamps (AC-4.1, NFR-1).

**PROP-DET-02 — mtime independence.**
For every leaf, `touch`-ing both the plugin-side and consumer-side artifacts (and, independently,
only one side) between two runs changes no `state` and no `reason`. *(Idempotency · Harness · E ·
`driftClassify.test.js`)* AC-1.3 and FSPEC §3.4 R-2. The one-sided variant is the discriminating
draw: an implementation comparing mtimes across sides is green on the two-sided one.

**PROP-DET-03 — Environment-order independence.**
Two runs whose sandbox environments differ only by the insertion order of 3–8 generated unrelated
variables produce identical records. *(Idempotency · Harness · E · `driftOrdering.test.js`)*
TSPEC §2.5 row 5.

**PROP-DET-04 — Directory-order independence.**
For every generated tree, creating the same `.claude/workflows/` entries in a different creation
order (and, where the filesystem exposes it, with names chosen to invert readdir order) produces
identical `rows` **in the manifest's row order**, and an identical `LC_ALL=C`-sorted `not-managed`
listing. *(Idempotency · Harness · E · `driftClassify.test.js`)*
TSPEC §2.5 rows 3–4. The row-order half uses a manifest whose ids are **non-alphabetical**, so an
implementation that sorts rows is red — `rows` follows the manifest, never a glob (AC-0.1).

**PROP-DET-05 — Locale independence.**
`LC_ALL=en_US.UTF-8` injected through `opts.env` changes no `state`, no `reason`, no row order and
no `not-managed` order. *(Idempotency · Harness · E · `driftClassify.test.js`)*
Companion to PROP-BKP-07; together they cover C1's `export LC_ALL=C` on both the classifier and the
backup paths, which is the only way the sandbox's own `LC_ALL=C` stops masking its removal.

**PROP-DET-06 — Process independence.**
The same tree classified by two *different entrypoints* that change nothing (`--check`, then the
hook) yields identical `rows` and identical `baselineReason`, differing only in `generatedBy` and
`generatedAtUtc`. *(Idempotency · Integration · E · `driftBaseline.test.js`)*
AC-1.8(iii)'s "across runs **and processes**". This is also the property that would catch a
classifier whose behavior depends on the entrypoint — the defect FSPEC §3.1's "there is no second
classifier" rules out by design and nothing else observes.

## 10. Negative properties

What must **not** happen, quantified. Each carries the three positive conjuncts the falsifiability
rule requires — an exact status/state value, a named reason or operation token, and a
retention/audit assertion — because `state != X` alone is satisfied by any accidental state.

**PROP-NEG-01 — No unmanaged file is ever read, modified or deleted.**
Over every generated tree in this document, for every file in `.claude/workflows/` with no manifest
row and in no `retires`: its bytes are unchanged (sha1 before/after), it is absent from `rows`, and
it appears in the `not-managed` listing; and for every `.pdlc-`-prefixed file: unchanged bytes,
absent from `rows`, **and absent from `not-managed`**. *(Security/Contract · Integration · E ·
`driftClassify.test.js`)* NFR-3, AC-0.6, AC-1.5. The `.pdlc-` half is the one an implementation gets
wrong by enumerating the directory to build the managed set — the globbing AC-0.1 prohibits.

**PROP-NEG-02 — Nothing is ever written under `$HOME` or `/`.**
For every generated tree, including the adversarial fixtures where `.claude/` exists at the sandbox
`HOME` and where `$PWD` is deleted underneath the process, the run creates no path under `HOME` and
no path outside the fixture root; the reported reason is exactly `repo-root-unresolved`; and
`assertTreeUnchanged(HOME)` holds. *(Security · Integration · E · `driftRepoRoot.test.js`)*
AC-0.5's absolute rejection, quantified over the generated root-resolution vectors of §5.1. Three
positive conjuncts, not "nothing bad happened".

**PROP-NEG-03 — No destroying operation precedes a verified backup.**
For every generated tree and both sync modes, for every row or retired path whose bytes are
overwritten or deleted, the trace contains a `backup` record for that id **before** the `copy` or
`delete` record, and the backup file's bytes equal the pre-operation bytes of the target.
Conversely, for every generated fault composition in which the backup fails or fails verification:
the target's bytes are **byte-identical** to their pre-run value, the operation is reported skipped,
`writeFailures` contains exactly one entry with `operation ∈ {backup, backup-verify}` for that path,
and the exit is **4**. *(Error Handling · Integration · E · `driftWriteFailure.test.js`,
`driftSync.test.js`)*
AC-2.9(4), AC-3.4. The forward half generalises AT-26 (the `stale`-row backup a plain sync must
still take); the converse generalises AT-27. `missing` rows are the stated exception — the one state
sync overwrites without a backup — and the property asserts that too: for a `missing` row there is
**no** `backup` record, which is red against an implementation that backs up a non-existent file and
writes a zero-byte backup that would later restore as truncation.

**PROP-NEG-04 — A degraded run is never green, on any surface.**
For every generated vector or leaf producing `baselineStatus: "unresolved"`, any `unknown` row, or a
non-empty `writeFailures`: the hook emits at least one matched W-*/N-* line (never silence),
`--check` exits non-zero per AC-3.3's precedence, and the queue's `mapDriftState` returns
`blocked` at the row AC-4.1's table names — **except** the two stated exceptions, `checkEnabled:
false` (row 2) and `unverified`/`local-edit` (row 8), which are asserted to `proceed` with the rows
named in the report. *(Error Handling · Integration · E · `driftHook.test.js`,
`queueDriftGate.test.js`)*
AC-1.0's "every green outcome requires resolved + non-empty rows + empty `writeFailures`", AC-2.2's
"there is no silent non-green state", and NFR-6's "exactly two exceptions" — the exceptions are
enumerated **positively**, so a third one appearing is red rather than absorbed.

**PROP-NEG-05 — No state is ever decided by a version or a timestamp.**
For every generated tree, perturbing only `artifactVersion` in the distribution manifest, only
`pluginVersion`, only `artifactVersion` in the sync manifest, or only `syncedAtUtc`, changes no
`state` and no `reason` — while the *reported* `pluginArtifactVersion` / `consumerArtifactVersion`
fields do change, proving the perturbation reached the subject. *(Data Integrity · Harness · E ·
`driftClassify.test.js`)* AC-5.2, AC-5.4, REQ §0 fact 6. The second conjunct is what stops this from
being a vacuous invariance property over a perturbation the subject never read.

**PROP-NEG-06 — A retired path is never deleted before its replacement is in place.**
For every generated tree with a retired path and every possible post-copy state of its superseding
row R, the path is deleted **iff** R's post-copy state is `in-sync`; in every other case the path
exists after the run, `retire-skipped` is reported naming R's state, and — for the failure
compositions — `writeFailures` carries `retire-delete` or `backup*` and the exit is 4. *(Error
Handling · Integration · E · `driftSync.test.js`)*
AC-3.9. Quantified over all six R-states, which is what turns AT-12/AT-13's two examples into the
exhaustive claim AC-3.9 makes; the `unknown` sub-cases are generated over all four row reasons.

**PROP-NEG-07 — Sync never runs a VCS command, and never touches a file outside the manifest's
declared blast radius.**
For every generated tree, no run creates, deletes or modifies any path outside
`.claude/workflows/` (plus the two directories AC-2.9(1) permits); and for every generated
**M10-violating** manifest — a `consumerPath` outside `.claude/workflows/`, nested one level deeper,
or with a `.pdlc-` basename — the baseline is `unresolved`/`manifest-malformed`, `rows` is `[]`, and
the named path is byte-unchanged. *(Security · Integration · E · `driftBaseline.test.js`,
`driftSync.test.js`)*
FSPEC §1.1 M10's blast-radius bound, which exists precisely because a build bug or hand-edited cache
could otherwise direct sync at this feature's own state files. Generated over M10's three clauses so
each is falsifiable separately.

## 11. Skip inventory and design-time arguments

### 11.1 The named skip inventory (O-11's policy, applied to properties)

Every entry uses TSPEC §1.3's `itOrSkip(capability, unverifiedInvariants, fn)`, which **throws** on
an empty invariant list. A property that cannot run on a runner appears here — never silently green,
never silently absent.

| Property | Capability | Printed reason (TSPEC §7.3) | Unverified invariants the skip must name |
|---|---|---|---|
| PROP-CLS-01 leaf **L3** | `uid-nonroot` | uid-0 string | "leaf L3 (plugin-side existence undecidable ⇒ `unknown`/`plugin-artifact-unreadable`) is unverified; the reason itself stays covered by leaf L2 via `PDLC_FAULT=plugin-artifact-read`" |
| PROP-CLS-01 leaf **L4** | `uid-nonroot` | uid-0 string | "leaf L4 (consumer-side existence undecidable ⇒ `unknown`/`consumer-artifact-unreadable`) is unverified; the reason stays covered by leaf L5 via `PDLC_FAULT=consumer-artifact-read`" |
| PROP-CLS-03, PROP-RSN-04 (the L3/L4 half only) | `uid-nonroot` | uid-0 string | "totality and side-attribution are verified over the nine leaves constructible on this runner; the two existence-`indeterminate` leaves are not" |
| every §3, §4, §7, §9 property | `hash` | hash string | "the leaves whose expected state is not `unknown` are unverified on this runner" (the file-level `describeOrSkip("hash", …)`, FSPEC §12's standing precondition) |
| PROP-BSL-03/04/06's `git`-routed vectors | `git` | git string | "AC-0.5 step 1's never-fall-through rule and the `git-worktree-list` guard are unverified; the walk-routed vectors still run" |
| every §6 property | `bash` | bash string | "the backup grammar's round-trip, order and prune clauses are unverified" |

**What does *not* skip, and why that matters.** All four row reasons and all eight baseline reasons
are reachable on a **root** runner (TSPEC §5.2 tokens 15/16; §7.1's corrected table), so §1.4's
row-reason and baseline-reason **meta-oracles stay hard assertions** on every runner. The uid-0
hole in this document is two *leaves*, not two reasons — which is the distinction TSPEC R-2 was
corrected to make, and restating it loosely here would reintroduce the error.

### 11.2 Design-time arguments (mode **D**) and their surrogates

Three claims are quantified in form but unobservable through the black box (TSPEC R-1). Each is
recorded with the argument and the example-based surrogate that carries the residual risk — none is
left as prose alone.

| # | Claim | Why not executable | Surrogate |
|---|---|---|---|
| **D-1** | `classify_row` is **pure with respect to the filesystem** — it reads, never writes, and spawns nothing but the hash utility (FSPEC §3.1) | "it did not write" is only observable as "nothing changed", which is also true of an implementation that wrote and restored; process spawns are not observable through the harness | PROP-CLS-06 (row independence) + TSPEC §4.3 conjunct (b) (no mutating trace record precedes the as-found pass) + review of C1's `pdlc_classify_row` against §2.2's output-variable contract. The **residual**: a write outside the traced op set is undetected |
| **D-2** | The hash-utility probe is **once per run**, not once per row (FSPEC §3.1, and the premise of §13.1's latency claim) | spawn counts are not observable; there is no trace `op` for the probe | Structural: `pdlc_classify_row` receives the resolved utility as an input (TSPEC §2.2). Surrogate assertion: PROP-CLS-01's L0 run asserts **every** row is `unknown`/`hash-tool-absent`, which is only true of a run-level probe. **Residual**: a per-row re-probe that happens to agree is undetected — it would be a latency defect, not a correctness one (NFR-2) |
| **D-3** | There is exactly **one** classifier and no derived-state shortcut (FSPEC §3.1, §3's pass table) | a second classifier agreeing with the first is unobservable by construction | PROP-DET-06 (process independence) + PROP-MTM-02's single-pass conjunct + `assertPhaseOrder`'s grammar rule (only `pdlc_classify_row` sets a phase label, TSPEC §2.2). **Residual**: two classifiers that agree on every generated leaf are undetected |

A fourth candidate — asserting that no property *depends* on `generatedAtUtc` — is not a **D** row:
it is discharged by §1.5 rule 2 (every byte comparison normalises the field) plus TSPEC §14.1 V-3
(the field's only presence/shape assertion).

## 12. Property → test file placement

Files are TSPEC §14's existing inventory; this document adds **no new test file** and one helper
(`__tests__/helpers/driftGenerators.js`, §1.3), excluded from jest by the existing
`testPathIgnorePatterns`.

| File | Properties |
|---|---|
| `__tests__/driftClassify.test.js` | PROP-CLS-01…08, PROP-RSN-01…06, PROP-DET-01, -02, -04, -05, PROP-NEG-01, -05 |
| `__tests__/driftBaseline.test.js` | PROP-BSL-01…08, PROP-DET-06, PROP-NEG-07 (M10 half) |
| `__tests__/driftOrdering.test.js` | PROP-BSL-07, PROP-CLS-04 (trace half), PROP-MTM-03 (trace half), PROP-SEAM-05, -07, -08, PROP-DET-03 |
| `__tests__/driftSync.test.js` | PROP-MTM-01, -03, -04, -05, -06, PROP-NEG-03, -06, -07 |
| `__tests__/driftHook.test.js` | PROP-MTM-02, PROP-MTM-04 (hook half), PROP-NEG-04 (hook half) |
| `__tests__/driftWriteFailure.test.js` | PROP-NEG-03 (converse half) |
| `__tests__/driftRepoRoot.test.js` | PROP-BSL-06, PROP-NEG-02 |
| `__tests__/driftFault.test.js` | PROP-SEAM-01…04, -06 |
| `__tests__/driftBackups.test.js` | PROP-BKP-01…13 |
| `__tests__/queueDriftGate.test.js` | PROP-MTM-05 (queue half), PROP-NEG-04 (queue half), PROP-BSL-05 (queue half) |
| `__tests__/helpers/driftGenerators.js` | the generators, `enumerateLeaves()`, `enumerateEvidenceVectors()`, `shrink()` — **new**, §1.3 |

Two placement rules, both inherited:

1. **A property never gets its own file.** It lands in the file that already owns its AT family, so
   the fixtures and helpers are shared and TSPEC §1.4's meta-oracles (module-level `Set`s asserted
   for set-equality at the end of each file) see the property runs too — a generated case counts
   toward the floor exactly as an example does.
2. **Each property is one `it()`** with the seed and case index in its failure message. A property
   spanning two independently-falsifiable claims is split, on TSPEC TE F-09's rule (one `it()`
   reports one verdict and cannot say which half leaked) — which is why PROP-BKP-05 and PROP-BKP-06
   are separate, and why PROP-MTM-01…06 are six rows rather than one "O-20 holds" test.

## 13. Traceability — property ↔ AC ↔ FSPEC/TSPEC section

| Property | REQ AC / NFR | FSPEC | TSPEC | Obligation |
|---|---|---|---|---|
| PROP-CLS-01, -03 | AC-1.1, AC-1.8(i) | §3.2, §3.3 | §3.3, §7.1, §1.4 | **O-9** |
| PROP-CLS-02 | AC-1.8(ii) | §3.3, §3.6 | §3.3 | **O-9** |
| PROP-CLS-04 | AC-1.8(ii), AC-2.6 | §3.3, §1.3 | §4.3 | **O-9**, O-1 |
| PROP-CLS-05, PROP-DET-01…06 | AC-1.3, AC-1.8(iii) | §3.4 R-2, §3.6 | §2.5, §11.3 row 2 | **O-9** |
| PROP-CLS-06 | AC-1.4 | §3.1 | §6.3 | **O-9** |
| PROP-CLS-07 | AC-1.6, AC-1.7 | §1.2, §3.4 R-3/R-4 | §13.1 | O-8 |
| PROP-CLS-08, PROP-NEG-01 | AC-0.6, AC-1.5, NFR-3 | §3.5 | §14 AT-25, AT-32(a) | O-9 (report side) |
| PROP-RSN-01, -03, -04 | AC-1.2, AC-1.8(iv) | §3.3 | §5.2 tokens 15/16, §7.1 | **AC-1.8(iv)** |
| PROP-RSN-02 | AC-1.8(iv) | §1.3 field rules | §12.1 D7 | **AC-1.8(iv)** |
| PROP-RSN-05 | AC-1.2 | §3.3 | §1.4 floors | **AC-1.8(iv)** |
| PROP-RSN-06 | AC-1.8(iii)(iv) | §3.6 | §2.5 | **AC-1.8(iv)** |
| PROP-BSL-01, -02, -03, -04 | AC-1.0, AC-1.8(iv) | §2.1, §2.8 | §1.4 baseline floor, §13.1 | **O-9** |
| PROP-BSL-05 | AC-0.3b, AC-1.0 | §1.3, §2.5 | §14.1 B-1…B-5 | **O-9** |
| PROP-BSL-06 | AC-0.5, AC-2.9(1) | §2.1's no-write-target rule, §2.8 | §8.3, §14 AT-33 | **O-9**, O-3 |
| PROP-BSL-07 | AC-1.0, AC-2.9(1) | §2, §4.2 | §4.3 | O-1 |
| PROP-BSL-08 | AC-4.3, AC-0.3b | §2.7 | §14.1 B-3/B-4, AT-32(b) | **O-9** |
| PROP-BKP-01, -02, -03 | AC-3.4 | §1.4 | §11.1, §11.2, §11.3 row 1 | **O-18** |
| PROP-BKP-04 | AC-3.4, AC-2.9(2) | §1.4's exhaustion clause | §13.5 `nnExhausted` | **O-18** |
| PROP-BKP-05, -06, -08 | AC-3.4, AC-3.5 | §1.4, §5.6 | §11.3 rows 2–4 | **O-18** |
| PROP-BKP-07 | AC-3.4, NFR-1 | §3.6 | §11.3 row 2, §2.5 | **O-18** |
| PROP-BKP-09…13 | AC-3.4 (retention), AC-1.3 | §5.6, §3.4 R-2 | §11.3 rows 3–4, §13.5 | **O-18** |
| PROP-MTM-01, -06 | AC-2.6, AC-3.3, AC-2.7 | §4.2, §5.8, OQ-6 | §4.3 `assertRecordedPassIs` | **O-20** |
| PROP-MTM-02 | AC-2.6 | §4.2, §3's pass table | §4.3 `assertPhaseOrder` | **O-20** |
| PROP-MTM-03 | AC-2.9(1), AC-3.1 | §4.2 steps 2–5 | §4.3 conjuncts, `assertPostCopyNarrow` | **O-20**, O-1 |
| PROP-MTM-04 | AC-2.6, AC-2.8, AC-3.9 | §3's pass table, §5.7 | §14 AT-11, AT-12 | **O-20** |
| PROP-MTM-05 | AC-2.7, AC-3.6 | §4.2 step 7, §5.9 | §14 AT-9, §12.2 | **O-20** |
| PROP-SEAM-01…04 | AC-2.9(5), NFR-6 | §4.6 | §5.1, §5.1.1, §5.2, §5.4 | **TSPEC §16 subset row**, O-10 |
| PROP-SEAM-05 | AC-2.9(5) | §4.6 | §4.4, §5.4 rule 2 | O-10 |
| PROP-SEAM-06 | AC-0.1 (M6) | §1.1 M6 | §5.1.1, §11.3 row 1, §14.1 F-2 | O-10, O-18 |
| PROP-SEAM-07, -08 | AC-2.9(5) | §4.6 | §4.1, §4.2 | O-1/O-7 (supporting) |
| PROP-NEG-02 | AC-0.5, NFR-3 | §2.2 | §8.3, §8.4 | O-3 |
| PROP-NEG-03 | AC-2.9(4), AC-3.4 | §4.7, §5.5 | §14 AT-26, AT-27 | — |
| PROP-NEG-04 | AC-1.0, AC-2.2, AC-3.3, AC-4.1, NFR-6 | §5.1, §5.8, §6.2 | §1.4a, §12.2 | — |
| PROP-NEG-05 | AC-5.2, AC-5.4 | §7.2, §1.3 | §14.1 V-4 | — |
| PROP-NEG-06 | AC-3.9, AC-0.7 | §5.7 | §14 AT-12, AT-13, §14.1 V-1 | — |
| PROP-NEG-07 | NFR-3, AC-0.1 | §1.1 M10 | §3.3 `manifestOverride` | — |

**ACs deliberately carrying no property**, with the surface that owns them — recorded so their
absence is a disposition rather than a gap: AC-0.1/0.2/0.3/0.3a/0.4 (baseline resolution mechanics —
TSPEC AT-24, §9.2); AC-2.1/2.3/2.5/2.5a/2.8 message **content** (TSPEC §7.4, §14.1 M-1/M-2/M-3;
§0.3); AC-3.5 restore (AT-8b, AT-26); AC-4.1's ten mapping rows (TSPEC §12.2, all ten as examples
with a record defeating every higher row); AC-4.2's report split (AT-31); AC-5.1/5.3 (AT-19,
§14.1 V-4, residual R-12); AC-6.1…6.6 (TSPEC §10's root-parameterised oracles); NFR-2 (structural,
FSPEC §13.1 — no timing assertion exists anywhere).

## 14. Coverage gaps and stated residuals

Each is stated with its cost and what would change the assessment. None is mitigated by asserting it
cannot happen.

| # | Gap / residual | Assessment |
|---|---|---|
| **P-R-1** | **Two uid-0 leaves.** L3 and L4 (existence-`indeterminate`) are permission-only; on a root runner PROP-CLS-01/-03 and PROP-RSN-04 are partial | Accepted and **named** (§11.1). No fault token can make *existence* undecidable — tokens 15/16 fault the read (TSPEC v2.1, TE L-07) — so closing this would need a token for the existence `stat`, which TSPEC §5.2's closure argument rejects. The **reasons** both leaves produce stay covered on every runner, so no meta-oracle turns red on root. Changes if a runner-level capability (e.g. a user-namespace sandbox) is added to the harness |
| **P-R-2** | **Shrinking is a fixed ladder, not a search.** A failure whose minimal witness is off the ladder is reported at the drawn size | Accepted (§1.3 rule 3, §2.5). The axes are already minimal — a classifier case is one row of one manifest — so the ladder's four steps reach the minimal form for every axis this document generates. Changes if a future axis is genuinely continuous; the honest fix then is a library shrinker, which means a devDependency and a re-litigation of TSPEC §1.2 |
| **P-R-3** | **No property-testing library.** Generation, shrinking and reporting are hand-written (§1.3) | Deliberate: `pdlc/workflows/package.json` has exactly one devDependency and TSPEC §1.2 rejected bats for adding one. The cost is that generator bugs are possible; it is bounded by the generators being asserted about themselves (§6.2's forced adversarial proportions, `M6_ID_REGEX` imported rather than re-declared, `setRowState`'s self-check) — the fixture builder is its own first oracle, and this document inherits that rule rather than restating it |
| **P-R-4** | **Purity, spawn count and classifier uniqueness are design-time** (§11.2 D-1/D-2/D-3) | Accepted; each has a named surrogate and a stated residual. All three are consequences of TSPEC R-1's black-box bash, and the mitigation is the same one TSPEC adopts: a new observable is a new trace `op`, never a new production output |
| **P-R-5** | **`packagingViolations` / `coveredViolations` are not quantified.** They are pure functions of a root and would admit property-based generation (e.g. "adding an exempt-path file never changes the returned set") | **Not taken, deliberately.** Their obligations (O-16, O-17) are *fixture-pinned by design*: AC-6.4's anti-widening guard is exactly a claim about **one frozen tree**, and a generator over document trees would re-express the exemption rules in the test, giving two copies of the rule that can drift. TSPEC §10.1/§10.3's two-root structure is the stronger oracle. Recorded so a reviewer sees the option was considered |
| **P-R-6** | **AC-5.3's rendered version lines** have no oracle at any level | Inherited from TSPEC **R-12**, unchanged: FSPEC §8.2's message shapes name no version line, so an assertion would have to invent message text. AC-5.3 is P2, the record-field half is asserted (TSPEC §14.1 V-4), and TSPEC §16 routes the successor. No property is written over an unspecified string |
| **P-R-7** | **The spawn budget is a ceiling, not a measurement.** §1.4 budgets ≈ 55 spawns; the real cost is measured only when the suite exists | Stated. If the measured cost pushes `npm test` past the point a maintainer runs it (TSPEC R-3 is the whole risk), the required response is to repack axes into rows or move a family to the batched driver — **never** to sample a domain §1.3 rule 2 says to enumerate. Recorded here so the trade-off is made deliberately rather than by deleting cases |
