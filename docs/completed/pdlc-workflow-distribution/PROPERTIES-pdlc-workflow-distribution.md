---
feature: pdlc-workflow-distribution
---

# PROPERTIES — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` v17.1 (approved) → `FSPEC-pdlc-workflow-distribution.md` v5.2 (dual-approved) → `TSPEC-pdlc-workflow-distribution.md` v2.1 (dual-approved) → **PROPERTIES** |
| Downstream | `PLAN-pdlc-workflow-distribution.md`, IMPL tests (`pdlc/workflows/__tests__/**`) |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,product-manager}-PROPERTIES-v{N}.md` (this branch, while active) |
| LEARNINGS | `docs/completed/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` (Phase H) |
| Entry obligations disposed here | **O-9**, **O-18**, **O-20**, TSPEC §16's `PDLC_FAULT`-subset row, REQ **AC-1.8(iv)** |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 2.2 | 2026-07-29 |

> **v2.2 — PROP-MTM-04 strengthened for Phase CR SE F-06. One conjunct added, one instrument
> citation corrected, no property removed and no domain narrowed.** Conjunct 1 was *correct* — it
> has said since v1.0 that the recorded pass for sync is **post-run** — but every assertion it
> named went through the trace, and it constrained `supersedingState` only against the pass, never
> against the sibling `rows[]` entry in the same record. Production shipped a record whose
> `supersedingState` came from the step-5 post-copy pass while `rows[].state` came from step 7, and
> nothing here was red. Conjunct 1 now also asserts `supersedingState === record.rows[R].state`
> **on the written artifact**, which REQ v17.1's amended AC-2.6 states outright and which needs no
> trace seam to be trustworthy (FSPEC §10 O-20 clause (d)). Conjunct 2 is **retained** — it is the
> only assertion in this document about the post-copy pass's own measured value, the value AC-3.9
> gates the deletion on — with its instrument restated: the comparison is against that phase's
> `classify` trace records, with `assertPostCopyNarrow` serving as the non-vacuity guard rather
> than as the comparison itself. The reasoning is recorded in the property's body so the question
> is not re-litigated.

> **v2.1 disposes CROSS-REVIEW-product-manager-PROPERTIES-v2 (1H/0M/2L) and
> CROSS-REVIEW-software-engineer-PROPERTIES-v2 (0H/0M/8L).** Every finding is dispositioned by
> reviewer-qualified id in **§15.4**. The one High: PROP-MTM-03's plain-sync conjunct (and its copy
> in §13.1's AC-3.2 row) wrongly asserted exit **1** where AC-3.3's precedence, and the property's
> own cited AT-8a/AT-10, put a tree carrying a `local-edit`/`unverified` row at exit **2** — corrected,
> with a note that exit 1 on a sync run is reachable only when post-copy verification is absent or
> defeated (PM F-01). Ten Low precision fixes follow: two budget subtotal corrections (§1.4's §8/§10
> rows, now 48/32, ceiling still ≈ 180 with rows summing to 181); PROP-MTM-07's domain scoped to
> fault-free first syncs; P-R-10 corrected from two to three unco-holdable adjacencies, with
> PROP-CLS-07 named as compensating for a different defect than the reordering; PROP-MTM-04's two
> scope predicates disentangled; §8.0's `readonly` re-source hazard guarded; three body/ledger
> wording inaccuracies (L7's ancestor path, PROP-CLS-07's fourth sub-recipe, PROP-SEAM-03's
> malformed-selector scoping); §13.1 extended with AC-1.1a/AC-6.2a/NFR-4/NFR-5 rows; PROP-CLS-02(a)'s
> third row reclassified under a broadened, observability-based split criterion; and §13.1's AC-2.4
> row and §2.5's shrink-ladder count corrected to match the document's own stated domains.

> **v2.0 disposed CROSS-REVIEW-product-manager-PROPERTIES-v1 (2H/5M/2L) and
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
| The form, home and JS extraction path of `PDLC_FAULT_TOKENS` | §8.0 |
| Which ACs carry no property, and the surface that owns each | §13.1 |
| How every v1 cross-review finding was disposed | §15 |

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
| **O-20** | FSPEC §10 (OQ-6, SE Q-01) | AC-2.6's measurement-time reading must be **asserted**: (a) a successful sync records post-run states and exits 0; (b) hook/`--check` coincide; (c) the run's decisions come from the as-found pass; **(d) the same claim over `retiredPresent[].supersedingState`, not `rows[]` alone** (FSPEC v5.2, from Phase CR SE F-06) | **§7** | **Seven** executable properties over generated consumer trees (PROP-MTM-01…07: clause (a) → -01, clause (b) → -02, clause (c) → -03, `supersedingState` → -04, session currency → -05, pass-is-a-function-of-`generatedBy` → -06, and **sync idempotence** → -07, added in v2.0 per PM F-02), each stated against FSPEC §4.2's `generatedBy`-to-pass binding and measured through TSPEC §4.3's `assertRecordedPassIs` / `assertPhaseOrder` / `assertPostCopyNarrow`. §7 also disposes the one place the two readings could diverge for `supersedingState` (post-copy vs post-run): v1.0 asserted they always **agree**, which SE F-04 showed is false against a *conforming* implementation on the AT-35 fault composition (FSPEC §4.2 step 6 rewrites the sync manifest, a classifier input, between the two passes). v2.0 asserts agreement **on the runs where step 6 changed no entry for R** and asserts the *predicted disagreement* positively on the runs where it did. **v2.2 closes clause (d):** PROP-MTM-04 conjunct 1 now also compares `supersedingState` against `record.rows[R].state` **within the written record**, an artifact-only assertion that holds whatever the trace seam does and that is red against the shipped defect SE F-06 found |
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
| §8 seams | **48** | PROP-SEAM-01: 16 member runs + 4 non-member draws + 1 seam-unset comparison. PROP-SEAM-03: 16 runs (9 non-bearing tokens with a selector appended, 7 bearing tokens with one) over 2–4-row manifests. PROP-SEAM-04: 4 mixed lists. PROP-SEAM-05: 3 generated trees × 2 runs (6). PROP-SEAM-07: 1 batched encoder driver. PROP-SEAM-02, -06, -08 add none |
| §9 determinism | **9** | PROP-DET-01 (1: the second run of the TZ pair, first reuses the packed run), -02 (2: two-sided and one-sided), -03 (1), -04 (2), -05 (1), -06 (2). PROP-CLS-05's two runs are counted in §3, not here |
| §10 negatives (not already counted) | **32** | PROP-NEG-02 (3 root-resolution adversarial trees), -03 (6 write-failure compositions), -04 (4 surface legs), -05 (5 perturbed runs: `artifactVersion` ×2, `pluginVersion`, `syncedAtUtc`, **`pluginHash`**), -06 (8: six R-states + two failure compositions), -07 (6: M10's three clauses × 2 entrypoints) |

**Ceiling: ≈ 180 spawns** (rows sum to **181**; the printed row totals recomputed here per SE F-01),
not the ≈ 55 v1.0 claimed. That number has to be defended rather than apologised for, so:

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
   of a first-match ladder) but **"the ladder's order equals the declared precedence"**.

   **How that is asserted depends on whether the reordering is observable through some input, and
   v1.0 got this wrong** (SE F-01). v1.0 claimed a co-holding fixture for *every* adjacent pair.
   Co-holdability — a fixture where both guards hold at once and the ladder's order decides the
   outcome — is the usual way a reordering is observable, but not the only one: A0's collapse (§2.2)
   makes a reordering of rungs 3–6 observable through a *different* input (the hash tool being
   absent, so those rungs are never even evaluated), without either guard "holding" in the ordinary
   sense (SE F-08). Reading FSPEC §3.3's guards, three of the five state *adjacencies* cannot
   co-hold **in principle**:

   | Adjacency | Guards (FSPEC §3.3) | Can co-hold? |
   |---|---|---|
   | `unknown > missing` | rung 1's disjunction · `P3 == no` | **yes** — independent probes |
   | `missing > in-sync` | `P3 == no` · `sha1(consumer) == sha1(plugin)` | **no** — rung 3 presupposes `P3 == yes` |
   | `in-sync > unverified` | bytes equal · `P6 == no entry` | **yes** — the byte comparison and the manifest lookup are independent |
   | `unverified > stale` | `P6 == no entry` · `sha1(consumer) == entry.consumerHash` | **no** — rung 5 presupposes the entry rung 4 denies |
   | `stale > local-edit` | `sha1(c) == entry.consumerHash` · *otherwise* | **no** — complements over one entry, and rung 6 is the ladder's fall-through, so there is no guard to reorder |

   For a co-holdable pair a co-holding fixture is the only honest oracle and §3 builds one. For an
   unco-holdable pair **there is no fixture, and inventing one produces a re-run of a leaf
   PROP-CLS-01 already covers, wearing a precedence label** — which is precisely what v1.0's rows 2,
   4 and 5 were. §3's PROP-CLS-02 therefore splits into **(a)** co-holding rows and **(b)**
   structurally-unco-holdable adjacencies, each disposed by a stated structural argument plus a
   *directed* oracle that targets the named wrong implementation the adjacency actually risks.
   The disposition, not a fake fixture, is the deliverable for (b).
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

> **Skip granularity, stated because the TSPEC's is file-level** (SE F-08). TSPEC §7 and §1.3 place
> the `hash` capability skip at `describeOrSkip("hash", …)` **file** level, which on a hash-less
> runner would skip the whole of `driftClassify.test.js` — taking **L0** with it, even though L0's
> recipe is `makeToolDir` *omitting* the tool and needs no hash capability at all. That would make
> the one row reason this document calls unskippable, skippable, and would relax the row-reason
> meta-oracle floor §2.3 and §11.1 both rest on. The granularity this document requires:
>
> - the **L0-bearing cases** of PROP-CLS-01 and PROP-RSN-01, and PROP-CLS-02(a)'s
>   `unknown > every lower` row, are written as `it()` blocks **outside** the file-level
>   `describeOrSkip("hash", …)` — they are unconditional;
> - every other §3/§4/§7/§9 case stays inside it.
>
> This is a *refinement* of TSPEC §7/§1.3's placement, not a contradiction of it: the TSPEC places
> the skip where `makeToolDir`'s throw is caught, and L0 is the one fixture that does not call
> `makeToolDir` with a tool to resolve. Recorded as an **upstream note** rather than a change —
> TSPEC v2.1 is approved and is not edited here; the successor should tighten §7's wording.

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
| **L4** | `A1 = yes, A2 = yes, A3 = indeterminate` | `unknown` | `consumer-artifact-unreadable` | `.claude/workflows/` mode `0600` — **permission only** | E-skip (uid-0) |
| **L5** | `A1 = yes, A2 = yes, A3 = yes, A4 = no` | `unknown` | `consumer-artifact-unreadable` | `PDLC_FAULT=consumer-artifact-read:<id>` (token 16) | E |
| **L6** | `A1 = yes, A2 = yes, A3 = no` | `missing` | `null` | consumer path absent, `.claude/workflows/` present and traversable | E |
| **L7** | `A1 = yes, A2 = yes, A3 = yes, A4 = yes, A5 = equal` | `in-sync` | `null` | consumer bytes := plugin bytes; **A6 not asked** | E |
| **L8** | `A5 = differ, A6 = no-entry` | `unverified` | `null` | ×4 sub-recipes (absent / unreadable / malformed / no id) | E |
| **L9** | `A5 = differ, A6 = entry-matches` | `stale` | `null` | bytes X ≠ plugin, entry `consumerHash = sha1(X)`, entry **`pluginHash` pinned to a third value** (see below) | E |
| **L10** | `A5 = differ, A6 = entry-differs` | `local-edit` | `null` | bytes Y, entry over X, X ≠ Y ≠ plugin, entry **`pluginHash` pinned to `sha1(plugin)`** (see below) | E |

Two readings this table pins, because both are places an implementation drifts silently:

- **L7 does not consult A6.** Equal bytes classify `in-sync` *regardless of provenance* — FSPEC
  §3.4 R-4, O-8, AT-6. The tree expresses this as the absence of a child, so a generator cannot
  produce an "equal bytes + degraded manifest ⇒ `unverified`" case even by accident.
- **L9 and L10 pin the entry's `pluginHash` in opposite directions**, and that pin is an
  assertion, not a builder detail (PM F-06). AC-1.1 and FSPEC §3.4 R-1 say `stale` vs `local-edit`
  is discriminated **solely** by `sha1(consumer) == entry.consumerHash`, with `pluginHash`
  reporting-only. v1.0's recipes said nothing about `pluginHash`, so whether an implementation that
  compared the *wrong* field was caught rested on whatever the builder happened to write. The pins
  make each leaf red against exactly that implementation: on **L9** the entry's `pluginHash` is a
  third value ≠ `sha1(plugin)`, so a `pluginHash` comparison reports `local-edit` where `stale` is
  required; on **L10** it is set **equal** to `sha1(plugin)`, so the same comparison reports `stale`
  where `local-edit` is required. PROP-NEG-05 additionally perturbs the field directly.
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
   eight-row run that fails is almost always failing on one row, and the one-row form is the
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
**Eight** leaves (L1, L2, L5, L6, L7, L8, L9, L10) are packed as eight rows of one manifest (§1.4);
L0 and the two permission leaves (L3, L4) are three separate whole-run fixtures. Traces to AC-1.1,
FSPEC §3.3. The L0 case is written outside the file-level `hash` skip (§2.2).

**PROP-CLS-02(a) — Where the ladder's order is observable, the higher state wins.**
For every adjacency in `unknown > missing > in-sync > unverified > stale > local-edit` whose order is
**observable through some input** under FSPEC §3.3's semantics — either because the two guards can
simultaneously hold, or because a run-level condition makes the lower rungs unevaluable — a row (or
run) exists that observes it, and its `state` is the higher member. *(Functional · Harness · E ·
`driftClassify.test.js`)*

| Pair | Genuinely observing fixture | Order is observable because | Expected |
|---|---|---|---|
| `unknown` > `missing` | consumer path absent (and its first existing ancestor traversable, so `P3 == no` is *definite*) **and** `PDLC_FAULT=plugin-artifact-read:<id>` armed for the same row | rung 1's `P2 == no` and rung 2's `P3 == no` are verdicts of **different probes on different sides**; neither presupposes the other — both guards genuinely **co-hold** | `unknown` / `plugin-artifact-unreadable` |
| `in-sync` > `unverified` | consumer bytes := plugin bytes **and** no sync-manifest entry for the row (AT-6's shape, and the `no-entry` sub-recipes of §2.3 L8) | rung 3 is a byte comparison, rung 4 is a manifest lookup; FSPEC §3.4 R-4 exists precisely because both hold at once on first adoption — both guards **co-hold** | `in-sync` |
| `unknown` > every lower | `A0 = absent` over a tree whose rows would otherwise be `in-sync`, `stale`, `local-edit` and `missing` | **not** a co-holding fixture (SE F-08): with `A0 = absent` rungs 3 and 5 cannot be *evaluated* at all — `sha1(consumer)` does not exist to compare — so no guard "holds" in the ordinary sense. The order is observable anyway, because the hash-utility probe is run-level (FSPEC §3.1), collapses the whole tree, and a wrong-ordered implementation that probed it last would visibly disagree with this row | all `unknown` / `hash-tool-absent` |

The third row is FSPEC §3.3's first consequence and is the one an implementation gets wrong by
probing the hash tool last (as FSPEC v1 did). It is also the row that most needs an
order-observing fixture — not a co-holding one, per the correction above — because every *other*
assertion about those rows passes under the wrong order.

**PROP-CLS-02(b) — Where two guards cannot co-hold, the disposition is the structural argument plus
a directed oracle.**
The remaining three adjacencies have **no** co-holding fixture — not "none was found", but none
exists, for the reason stated per row (§2.1(2)'s table). Building one anyway produces a re-run of a
leaf PROP-CLS-01 already owns; v1.0 did that three times and the rows asserted nothing about order
(SE F-01). Each is disposed below with the structural argument and, where a *real* wrong
implementation is reachable, a directed oracle that is red against it.
*(Functional · Harness · E · `driftClassify.test.js`)*

| Adjacency | Structural argument (why no fixture exists) | Directed oracle, and the implementation it is red against |
|---|---|---|
| `missing` > `in-sync` | rung 2 fires on `P3 == no`; rung 3 needs `sha1(consumer)`, which requires `P3 == yes`. The two are **complements over P3**, so no filesystem state satisfies both. The order between them is therefore **unobservable through any input** | Leaf **L6**, with two added conjuncts that are *not* PROP-CLS-01's: the record's `consumerHash` for that row is **`null`** and its `pluginHash` is **non-null**. Red against the vacuous-equality implementation — one that lets a failed consumer hash yield `""`, computes `[ "$h_c" = "$h_p" ]`, and would report `in-sync` on any row where *both* hashes came back empty. The `null`/non-null pair is what proves the empty-string path was not taken |
| `unverified` > `stale` | rung 4 fires on `P6 == no entry`; rung 5 dereferences `entry.consumerHash`. Rung 5 **presupposes the entry rung 4 denies** | **PROP-CLS-07** is the oracle, and it is the real defect surface: all four `no-entry` sub-recipes (manifest absent / unreadable / malformed / present-without-this-id) must classify `unverified`. Red against an implementation that treats a *degraded* manifest as "entry lookup failed, fall through to rung 5" and compares against an empty `consumerHash` — the FSPEC §1.2 / §3.4 R-3 hazard. That implementation reports `local-edit` (or `stale`, if the consumer hash is also empty), never `unverified` |
| `stale` > `local-edit` | rung 5 and rung 6 are **complements over the same entry field** (`==` vs `!=`), and rung 6 is written `otherwise` — it has **no guard at all**. There is nothing to reorder, so "the ladder's order" is not a claim that can be made here | The claim that *does* have content is FSPEC §3.4 R-1: the comparison is against **`entry.consumerHash`** and nothing else. Two oracles carry it — §2.3's L9/L10 `pluginHash` pins (each red against an implementation comparing `pluginHash`) and **PROP-NEG-05**'s direct `pluginHash` perturbation. Neither is a precedence fixture, and this row does not pretend otherwise |

**Why this split matters.** Asserting that the six states are pairwise disjoint is vacuous over a
first-match ladder; asserting a co-holding fixture where none can exist is *worse than vacuous*,
because it reports a leaf re-run as precedence coverage and the reviewer stops looking. The honest
residual — **the `missing`/`in-sync`, `unverified`/`stale` and `stale`/`local-edit` adjacencies all
have no order-observing input** (SE F-03; §2.1(2)'s table above is the three-row source) — is
recorded as **P-R-10**, together with the compensating controls above. **PROP-CLS-07 is one of
those compensating controls, not a fixture for the `unverified`/`stale` reordering itself:** it is
red against the *degraded-manifest fall-through* implementation (rung 5 evaluated against an absent
entry's non-existent `consumerHash`), a different defect than a pure rung-4/5 swap — an
implementation that swapped the rungs but still landed on `unverified` for every no-entry case would
stay green against it, exactly as `stale`/`local-edit`'s row already says of its own oracle.

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
Over the four `no-entry` sub-recipes (absent / unreadable / malformed / present-without-this-id), the
resulting `rows` are **deep-equal**; the unreadable and malformed cases additionally emit N-4 exactly
once, and both the absent case **and** the present-without-this-id case emit **none** (SE F-06) — the
latter is the sub-recipe most likely to share an implementation code path with "malformed", so its
N-4 expectation is stated explicitly rather than left to be inferred from the absent case. *(Data
Integrity · Harness · E · `driftClassify.test.js`)*
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
| **E5** | manifest malformed | `holds` · `does-not-hold` · `indeterminate` | **`E2 = holds` ∨ `E4 = holds` ∨ `E4` indeterminate** | `manifestClauseBroken` (validator path), `manifestUnparseable` (helper `12`) |
| **E6** | manifest empty | `holds` · `does-not-hold` · `indeterminate` | **`E5 = holds` ∨ `E5` indeterminate** | `emptyManifest` |
| **E7** | `checkEnabled` | always determinate, fail-closed `true` | never | `optOutConsumer`, `nonBooleanConfig` |

**The E5/E6 rules are FSPEC §2.1 Phase 1's, restored** (SE F-02). v1.0 wrote E5 as indeterminate
only when "`E2 = holds` or `E4` indeterminate" and E6 only when "`E5` indeterminate", dropping the
`E4 = holds` and `E5 = holds` cases. FSPEC §2.1 says E5 is indeterminate "if E2 **or E4 failed**"
and E6 "if E5 failed", and its first dependency bullet is explicit that `manifestAbsent` is
determinate JSON-free while "`manifestMalformed` and `manifestEmpty` are **not**". The narrowing was
not cosmetic: it forced the generator to assign E5/E6 *determinate* values on the manifest-absent
vector, on which PROP-BSL-03's computed oracle
`precedence.find(c => vector[c] === "holds")` would then select **`manifest-empty`** — an absent
manifest trivially has zero rows — over `manifest-absent`, contradicting FSPEC §2.8's normative row
`repoRootUnresolved + manifestAbsent ⇒ manifest-absent`, the row §2.8 labels *"the ordinary
first-release consumer"*. Under the corrected rules that vector carries `E5 = indeterminate` and
`E6 = indeterminate`, PROP-BSL-04 forbids selecting either, and the oracle selects `manifest-absent`.
This is a **required regression fixture**: the corrected first-release vector is asserted by name in
PROP-BSL-03.

**The generated set is the reachable vectors, enumerated — and the enumeration states its axes.**
E4/E5/E6's `indeterminate` values are not drawn independently: they are *derived* from E2/E3/E4/E5
by the rules above, exactly as §2.1's tree derives its children. SE F-03 is correct that a count is
meaningless without saying which axes it closes over, so:

> **`enumerateEvidenceVectors()` closes over E1, E2, E3, E4, E5, E6 — and *not* over E7.**
> Its cardinality is **20**. E7 (`checkEnabled`) is varied separately, by PROP-BSL-08 alone, over
> its six config states; it is excluded from the core enumeration because it is orthogonal to
> reason selection by construction (FSPEC §2.7 — it is resolved in step 1 and never enters §2.8's
> precedence) and including it would multiply every other §5 property by six for no oracle.

The derivation, so the number is checkable rather than asserted. The manifest chain (E2, E3, E4, E5,
E6) has **10** reachable assignments:

| E3 | E4 | E2 | E5 | E6 | Count | The vector's plain meaning |
|---|---|---|---|---|---|---|
| `unset` / `unreadable` | indeterminate | `holds` / `does-not-hold` | indeterminate | indeterminate | **4** | no plugin root ⇒ nothing downstream is knowable |
| `ok` | `holds` | `holds` / `does-not-hold` | indeterminate | indeterminate | **2** | **the first-release vector**: manifest absent, malformed/empty unknowable |
| `ok` | `does-not-hold` | `holds` | indeterminate | indeterminate | **1** | manifest present, no JSON tool |
| `ok` | `does-not-hold` | `does-not-hold` | `holds` | indeterminate | **1** | malformed ⇒ emptiness unknowable |
| `ok` | `does-not-hold` | `does-not-hold` | `does-not-hold` | `holds` / `does-not-hold` | **2** | well-formed manifest, empty or not |

**E1 is the sixth axis and it multiplies all ten**, because FSPEC §2.1's second dependency bullet
says E1 is independent of E2–E6 and genuinely co-holds with any of them — which is the whole reason
§2.8's precedence is observable at all. **10 × 2 = 20.** All twenty are constructible from TSPEC
§13.1's fixtures without a second plugin tree; §1.4 budgets them at one spawn each.

FSPEC §2.8's eight-row worked table is a subset of the twenty and is asserted **literally as well**
(PROP-BSL-03's named-row conjunct plus PROP-BSL-06), so a regression that keeps the generator green
while breaking the FSPEC's own worked example is still red.

**What the other two §5 properties quantify over, stated because they do not use the bare 20**
(SE F-03, PM Q-02):

| Property | Domain | Spawns |
|---|---|---|
| PROP-BSL-01/-02/-03/-04/-07 | the 20 vectors, one `--check` run each | 20 (shared) |
| PROP-BSL-03's `drift-state-invalidated` rung | 3 ladder-fault compositions (`ladderRungI`/`II`/`III`, TSPEC §13.3) — a separate one-dimensional axis, not a seventh evidence probe | 3 |
| PROP-BSL-06 | the **10** vectors with `E1 = holds` (half the enumeration) on `--check` — **shared, no new spawn**; its three-entrypoint exit-code conjunct runs on **3** representative vectors × the sync and hook entrypoints | 6 |
| PROP-BSL-08 | E7's **6** config states × **2** vectors (`resolved`, and the first-release `manifest-absent` vector AC-0.3b names). The default-config leg of each is already in the 20 | 10 |

`drift-state-invalidated` is **not** an evidence axis: it is produced by §4.4 rung (i) *after*
selection and replaces the selected reason (FSPEC §2.8), which is why it sits in its own row above
and appears in PROP-BSL-03 as the top of the precedence rather than in the vector.

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
recomputation from the same declared list cannot. Note the oracle's `=== "holds"` test is what makes
§5.1's corrected determinacy rules load-bearing — it is total over the vector only because
`indeterminate` is a distinct third value that no `find` can select (PROP-BSL-04 asserts the
consequence).

Two named rows are asserted **literally**, in addition to the quantified claim, because each is a
worked FSPEC §2.8 row whose failure mode the quantified claim alone would not name in a report:

- `repoRootUnresolved` + `manifestEmpty` ⇒ **`manifest-empty`** — the pair that falsifies a
  short-circuiting ladder.
- `repoRootUnresolved` + `manifestAbsent` (E5, E6 both `indeterminate`) ⇒ **`manifest-absent`** —
  the ordinary first-release consumer, and the row v1.0's narrowed determinacy rules would have
  answered `manifest-empty` (§5.1, SE F-02). This is the regression fixture for that defect.

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
Domain, stated per SE F-03 / PM Q-02: the **10** vectors of §5.1's enumeration in which
`E1 = holds`, on `--check` (these runs are the enumeration's own — no extra spawn); plus **3**
representative vectors (`+manifestEmpty`, `+manifestAbsent`, `E1` alone) re-run on **sync** and the
**hook** for the exit-code conjunct, which is 6 additional spawns. For every such run —
**regardless of which reason was selected** — nothing is created under the fixture root: no
`.claude/`, no `.claude/workflows/`, no drift state, no sync manifest, no backup directory;
`writeFailures` is `[]`; `--check` and sync exit **3** and the hook exits **0**; and N-8 is printed
exactly when the *reported* reason is not `repo-root-unresolved`.
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
Domain (SE F-03): E7's **six** config states × **two** baseline vectors — `resolved`, and the
first-release `manifest-absent` vector — for **12** runs, of which 2 (the default-config legs) are
already in §5.1's enumeration, so 10 are additional. E7 is *not* in
`enumerateEvidenceVectors()`; this is the only property that varies it. Over that domain the record
carries a boolean `checkEnabled`; it is `false` only when the
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
| `genId(rng)` | conforms to **`M6_ID_REGEX`**, imported from `pdlc/workflows/lib/document-oracles.mjs` (**new**, per TSPEC §2.1 — it does not exist at HEAD) — the *same* regex C1's manifest validator uses (TSPEC §11.3 row 1). Cited by bare basename after this first mention. Length 1–64; first byte alphanumeric; body drawn from `[A-Za-z0-9._-]`. **Adversarial draws are forced, not hoped for**: ≥ 10% of the set contains `.`, ≥ 10% contains `-`, and ≥ 5% is a **stamp-shaped id** (`dev.20260101T000000Z`, `20260101T000000Z`, `x.20260101T000000Z-01`) | `a` → `a0` → `a.b` → drawn value; stamp-shaped ids shrink **last** |
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
**The `--force` gate's two operator-visible conjuncts (AC-3.2, PM F-01/Q-01), asserted here.**
v1.0 quantified the copy set for both modes and said nothing about what a *plain* sync tells the
operator when it declines a row — which is half of what AC-3.2 requires. Added:

- On a **plain** sync over a tree containing at least one `local-edit` and one `unverified` row:
  every such row's bytes are **byte-unchanged** (sha1 before/after), it carries **no** `copy` and
  **no** `backup` trace record, the report names it with its **exact state string** (`local-edit` /
  `unverified`) — the reason the operator is being told, not a generic "skipped" — and the run's
  exit is **2** per AC-3.3's precedence (any row `local-edit` or `unverified` outranks any row
  `stale` or `missing`; TSPEC AT-8a and AT-10 are both worked at exit 2). Three positive conjuncts,
  per §10's rule: exact state value, named row, retention assertion. Exit **1** on a sync run is
  reachable only when §5.5's post-copy verification is absent or defeated (FSPEC §5.8, O-14) — this
  property's fixtures never construct that case, so exit 1 must not appear here (PM F-01).
- On a **`--force`** sync over the same generated tree: the same rows *are* copied, each preceded by
  a `backup` record (PROP-NEG-03's forward half), and the exit is **0** when nothing else is
  degraded.

The pair is what makes `--force` a *gate* rather than a flag: the plain run must be observably
declining, not silently succeeding.

O-20 clause (c). It is observable **only** through the `as-found` trace label — which is why the
grammar carries three phase labels rather than two (FSPEC §10 O-1) — and it is what forbids an
implementation that re-classifies before copying and thereby lets a mid-run filesystem change
silently change what gets copied.

**PROP-MTM-04 — `supersedingState` is the recorded pass's measurement, and the post-copy pass agrees
on every run where step 6 did not change R's classification.**
*(Data Integrity · Integration · E · `driftSync.test.js`, `driftHook.test.js`)*

Three conjuncts, in the order of how load-bearing they are:

1. **Pass attribution (all entrypoints), plus intra-record agreement.** For every generated tree
   with a retired path present, `retiredPresent[].supersedingState` equals R's state in the
   **recorded** pass — `as-found` for hook and `--check`, `post-run` for sync (REQ **AC-2.6**
   v17.1, which now states this at source; FSPEC §3's pass table). On non-sync runs there is no
   post-copy pass at all, and the property asserts that too: a hook implementation that fabricates a
   `post-copy` phase label is red via `assertPhaseOrder`. **Second, record-internal and needing no
   trace at all: `supersedingState === record.rows[R].state` in the same written record.** AC-2.6
   makes these two readings of one pass, so any implementation that sources them from different
   passes is red on the artifact itself. This half is cheap and is stated separately because it is
   the one that was *missing*: Phase CR SE F-06 found production capturing step 5's value for
   `supersedingState` while `rows[]` carried step 7's, and a suite that instruments only `rows[]`
   is green against it (FSPEC §10 O-20 clause (d)). It is not redundant with the trace assertion —
   it survives a trace seam that is disabled, absent or itself wrong, and it is the assertion whose
   failure names the operator-visible harm: one JSON document stating two states for one row.
2. **Agreement of the *gating* pass, scoped.** On sync runs in which **R's copy verification
   passed, or R was not copied at all, and `writeFailures` carries no entry for R** —
   `supersedingState` **also** equals R's state as measured by the `post-copy` pass, read from that
   phase's `classify` trace records (`assertPostCopyNarrow` supplies the non-vacuity guard: it
   pins the post-copy records to exactly the retiring row ids, so a run that emitted no post-copy
   record for R cannot pass this conjunct by finding nothing to compare). This operational
   predicate is *not*
   equivalent to "step 6 neither wrote nor removed an entry for R" (SE F-04): a verified copy makes
   step 6 **write** an entry for R, so such a run satisfies the operational clause here while
   violating that structural one. Agreement still holds on a verified copy, but for a different
   reason than "the entry was untouched" — post-copy, R is `in-sync`, and rung 3 fires **before**
   any manifest lookup (§2.1's ladder), so step 6's entry rewrite cannot move R's classification
   regardless of what it writes. The operational predicate above is the one this conjunct asserts;
   no "exactly when" biconditional is claimed — conjunct 3's no-pre-existing-entry sub-case also
   agrees, and for a reason distinct from both of these.
3. **Predicted disagreement, asserted positively.** On sync runs in which step 6 **did** change R's
   entry — the AT-35 composition, `PDLC_FAULT=artifact-copy-corrupt:<R>` (TSPEC §5.2 token 10) —
   the two passes are asserted to differ **in exactly the predicted way**, generated over both
   sub-cases:
   - R had a **pre-existing** entry as found (R was `stale`): post-copy is **`local-edit`** (the
     truncated bytes differ from the plugin *and* from the still-present old entry's
     `consumerHash`), and the recorded post-run state is **`unverified`** (step 6 removed the
     entry, so rung 4 fires).
   - R had **no** pre-existing entry (R was `missing` or `unverified`): both passes are
     **`unverified`**, and the property asserts the agreement rather than exempting the case.

**Why v1.0's version was wrong, recorded because it is the interesting part.** v1.0 asserted
unconditional agreement on the argument that "deleting a retired path cannot change R's own
`consumerPath` bytes". That argument is about **bytes**, and it ignores that the **sync manifest is
a classifier input** for rungs 4–6, and that FSPEC §4.2 **step 6** — which rewrites it, including
removing the entry of any row that failed verification (§5.5) — runs *between* the post-copy pass
(step 5) and the post-run pass (step 7). So on a fault composition §7's own generated set includes
(PROP-MTM-06 quantifies over write-failing trees), the two passes legitimately disagree, and v1.0's
property would have gone red against a **conforming** implementation — and been deleted, which is
the opposite of its stated purpose (SE F-04; the step-6 placement answers SE Q-01 by citation, not
inference: FSPEC §4.2 step 6 and §5.5).

The honesty intent survives, in a stronger form: conjunct 3 pins the *shape* of the disagreement, so
a future change that makes the passes diverge in any **other** way is still red and still reopens
the spec question — while a conforming implementation is green.

**Why conjunct 2 is not made vacuous by conjunct 1 (checked at v2.2, when conjunct 1 became an
unambiguous universal).** The two quantify over different *observables*, not the same one twice.
Conjunct 1 constrains the record — `supersedingState` against the recorded pass and against
`rows[]`. Conjunct 2 constrains the **post-copy pass's own measurement**, which is never recorded
anywhere (FSPEC §3's table) and is reachable only through the trace; that measurement is what
AC-3.9 gates the *deletion* on, so an implementation whose post-copy pass computes the wrong state
deletes (or spares) the wrong retired path while writing a perfectly correct record. Conjunct 1
cannot see that; conjunct 2 is the only assertion in this document that does, and together with
conjunct 3 it makes the relationship between the two passes total over sync runs — 2 covers the
runs where step 6 moved nothing, 3 the runs where it did. Conjunct 2 also does **not** duplicate
PROP-NEG-06: that property asserts the *deletion outcome* against the post-copy state, taking that
state as given, whereas this one asserts the state itself is the one a correct classifier produces.

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

**PROP-MTM-07 — A repeat sync over an unchanged tree is a no-op, byte for byte.**
For every generated consumer tree **whose first sync is fault-free and exits 0** (excluding
PROP-MTM-06's write-failing trees and PROP-MTM-03's trees carrying a `local-edit`/`unverified` row,
both of which make a *second* run's exit and `writeFailures` diverge from this property's own
conjuncts 4–5 against a conforming implementation — SE F-02), run a plain sync to completion,
snapshot, then run the **same** plain sync again with nothing changed in between. The second run
must satisfy, conjunct by conjunct: *(Idempotency · Integration · E · `driftSync.test.js`)*

| # | Conjunct | The wrong implementation it is red against |
|---|---|---|
| 1 | **No copy.** The trace contains **zero** `copy` records, and every `.claude/workflows/` artifact is byte-identical to the snapshot (sha1 per path, plus set-equality of the path set) | one that copies unconditionally rather than on the as-found `stale`/`missing` set |
| 2 | **No backup.** The trace contains **zero** `backup` records, and the backup directory's name → bytes map is **identical** to the snapshot's — no new file, no renumbered `NN` | the one this property exists for: a sync that takes a backup on every invocation. It is green against every other property in §7 and against AT-9, and its operator-visible cost is that AC-3.4's **5-deep retention window silently evicts** — five idle syncs and the pre-edit content AC-3.5's restore oracle promises is gone |
| 3 | **The sync manifest is byte-identical**, `syncedAtUtc` **included** | one that re-stamps `syncedAtUtc` on every run. FSPEC §1.2 records the timestamp of the sync that *wrote* the entries, and TSPEC §11's rule 2 already relies on the file being stable across no-op runs |
| 4 | **The drift state is equal up to `generatedAtUtc`** (§1.5 rule 2): identical `rows` (states, reasons, hashes, order), identical `retiredPresent`, `writeFailures === []`, `baselineStatus: "resolved"` | one whose second-run classification depends on first-run residue |
| 5 | **Exit 0** | — |

AC-3.7, and it is the one operator-facing idempotency claim v1.0 left without a property (PM F-02).
v1.0 asserted idempotence for `prune` (PROP-BKP-12) and for classification (PROP-CLS-05, §9) — the
two places it is cheapest — and not for the place US-02 depends on. The property has exactly
PROP-BKP-12's shape (a repeat-run byte-invariance claim over a name → bytes map), quantified over
the trees §7 already builds, and costs **one** additional spawn.

**A note on what conjunct 2 does not say.** It asserts that no backup is *taken*, not that the
retention window is full — retention itself is PROP-BKP-09's. The two together are what make
AC-3.5's "restore the newest backup" recover the operator's actual pre-sync content rather than a
copy of the plugin artifact five idle runs old.

## 8. Seam-closure properties (`PDLC_FAULT` ⊆ 16; M6; trace grammar)

### 8.0 `PDLC_FAULT_TOKENS` — its form, its home, and how JS obtains it

TSPEC §16 names `PDLC_FAULT_TOKENS` in one line ("exported from C1") and TSPEC §5.2's enumeration is
a markdown table, not a code artifact. SE F-07 is right that this is not enough: both §8.1 oracles
consume the token set from JS, and if they end up reading the same bytes the claim of "two
independent oracles" collapses to one. Pinned here, normatively for the implementation:

| | Decision |
|---|---|
| **Form** | a **bash array**, declared once in **C1** (`pdlc/hooks/scripts/lib/pdlc-drift.sh`): `PDLC_FAULT_TOKENS=(git-worktree-list walk-stat … consumer-artifact-read)`, in TSPEC §5.2's table order, guarded by an **idempotent-source guard** at the top of C1 (`[[ -n ${PDLC_DRIFT_LIB_SOURCED:-} ]] && return 0; readonly PDLC_DRIFT_LIB_SOURCED=1`) before the `readonly` assignment. Without the guard, C2/C3 sourcing C1 and `readFaultTokens()` sourcing it again inside its own `bash -c` would re-assign an already-`readonly` array in any shell where C1 is sourced twice — a bash error that aborts the sourcing shell under `set -e` (SE F-05) |
| **Home** | C1, adjacent to `pdlc_fault_active`. There is **no** generated JSON side-artifact and **no** JS mirror of the list — a mirror is the copy TSPEC §16 exists to avoid, and a generated artifact adds a build step the feature does not otherwise have |
| **JS extraction** | one `execFileSync` of `bash -c 'source <C1>; printf "%s\n" "${PDLC_FAULT_TOKENS[@]}"'`, wrapped in a helper `readFaultTokens()` in `__tests__/helpers/driftGenerators.js`. This reads the **runtime value of the array after C1 has been sourced** — not the text of the file. `readFaultTokens()` asserts the child process's **exit status** (zero) before it asserts anything about the array, so a sourcing failure — including a `readonly`-reassignment error on a mis-guarded C1 — surfaces as a harness error rather than as a silently empty array (SE F-05) |
| **Sanity conjunct** | `readFaultTokens()` returns exactly **16** entries, all distinct, each matching `M6_ID_REGEX`. A helper that silently returns `[]` (mis-sourced file, renamed variable) would make PROP-SEAM-01 vacuously true, so the count is asserted before the property runs |

**Why the two oracles are then genuinely independent.** PROP-SEAM-01 consumes the *runtime array*;
PROP-SEAM-02 reads the *three shipped bash files as text* and extracts the literal first arguments
of `pdlc_fault_active` **call sites**. The array declaration and the call sites are different bytes
in C1, and PROP-SEAM-02 explicitly excludes the declaration (§8.1). A defect that pads the array
with a token no guard consults is caught by PROP-SEAM-02's superset direction; a defect that adds a
guard for a token not in the array is caught by its subset direction; a defect in the *recognition*
code that consults neither is caught by PROP-SEAM-01. No single edit makes all three green.

### 8.1 The token-set closure (TSPEC §16's PROPERTIES row)

FSPEC §10 O-10 requires the emitted token set to be a subset of the enumerated one, and TSPEC §5.2
closes that enumeration at **sixteen**, exported from C1 as `PDLC_FAULT_TOKENS` (§8.0) so the
property reads the implementation's own list rather than a copy. The obligation is stated as a
subset; a subset alone is satisfied by an implementation that recognises **nothing**, so both
directions are asserted, by the two independent oracles §8.0 pins.

**PROP-SEAM-01 — Recognition equals the enumeration.**
(a) For every `t ∈ readFaultTokens()` (all sixteen, §8.0), a run with `PDLC_FAULT=t` prints **no**
N-7 line. (b) For every generated non-member `s`, the run prints N-7 **exactly once**, with the
whole spec text captured, injects nothing, and is **byte-equivalent** to the same fixture with the
seam unset (stdout, drift state, sync manifest, modulo `generatedAtUtc`).
*(Contract · Harness · E · `driftFault.test.js`)*

**(b)'s draws are four *classes*, one draw from each — not four draws from an overlapping list**
(SE F-15). v1.0 listed the classes with `Mkdir` serving simultaneously as the one-character-mutation
example and the different-case example, and gave three examples for one slot, so with "4 draws" the
four classes were not guaranteed to be covered:

| # | Class | Drawn as | Falsifies |
|---|---|---|---|
| 1 | **Unrelated M6-conforming string** | `genId(rng)`, rejected if it collides with a member | nothing subtle — the control that proves N-7 fires at all |
| 2 | **Edit-distance-1 mutation of a member**, case-preserving | one member drawn, then one of: append a character (`mkdirr`), delete a character (`mkdi`), substitute one (`mkdit`) | a prefix or substring match instead of an exact one — the whole point of the class |
| 3 | **A member with leading or trailing whitespace** | `" mkdir"` / `"mkdir "` | an implementation that trims; TSPEC §5.1's no-trim rule |
| 4 | **A member with its case changed**, otherwise identical | `"MKDIR"`, `"Mkdir"` | a case-insensitive comparison (`shopt -s nocasematch`, `${x,,}`) |

Exactly one draw comes from each class per run family, so all four are covered by construction
rather than by luck. Byte-equivalence (not "exit is still 0") is TSPEC §5.4 rule 2's form.

**PROP-SEAM-02 — Static call-site closure.**
Reading the three shipped bash sources **as text** — `pdlc/hooks/scripts/lib/pdlc-drift.sh` (C1),
`pdlc/hooks/scripts/check-workflow-drift.sh` (C2), `pdlc/hooks/scripts/sync-workflows.sh` (C3);
TSPEC §2.1's inventory, and no fourth file carries a guard — the set of literal **first** arguments
to `pdlc_fault_active` is **equal** to `readFaultTokens()` (§8.0). *(Contract · Unit · E ·
`driftFault.test.js`)*

Three scoping rules the oracle needs to be sound, all of which v1.0 left implicit (SE F-14):

1. **The literal-argument conjunct scopes to the *first* argument only.** TSPEC §5.1.1 *requires*
   selector-bearing guards to pass a **variable** scope key as the second argument
   (`pdlc_fault_active artifact-copy "$id"`), so v1.0's blanket "every call site passes a literal
   (never a variable)" was false against a conforming implementation. Restated: **argument 1 is
   always a bare literal token; argument 2, where present, is unconstrained.** A computed token
   *name* would make the static read incomplete without saying so, which is what the conjunct
   protects.
2. **The scan excludes the function's own definition site** (the `pdlc_fault_active() { … }` body,
   which references the parameter, not a token) **and the `PDLC_FAULT_TOKENS` array declaration**
   (§8.0) — reading the declaration here would collapse the two oracles into one.
3. **The scan excludes comments and heredoc bodies.** The extractor matches `pdlc_fault_active` only
   at a command position on a non-comment line and outside any `<<`-delimited region; a token named
   in a comment is documentation, not a guard.

The subset direction is the obligation; the superset direction ("every listed token has at least one
guard") is what stops the enumeration from being padded with tokens no code consults — which would
make PROP-SEAM-01(a) pass for tokens that inject nothing anywhere.

**PROP-SEAM-03 — Selector-bearing partition.**
For every one of the sixteen tokens, with a selector appended — TSPEC §5.1.1's partition is **7
bearing** (`artifact-copy`, `artifact-copy-corrupt`, `backup`, `backup-corrupt`, `retire-delete`,
`plugin-artifact-read`, `consumer-artifact-read`) and **9 non-bearing**, and the partition itself is
read from TSPEC §5.1.1, not re-derived: tokens marked **non-bearing** produce N-7
exactly once and inject nothing (the whole spec text captured, including the `mkdir:` form);
tokens marked **bearing**, given a **well-formed** selector, produce **no** N-7 and inject **only**
for the row or backup whose scope key is byte-equal to the selector — over generated 2–4-row
manifests, exactly one row is affected and the loop continues over the rest. A bearing token carrying
a **malformed** selector — TSPEC §5.1.1's malformed-spec forms `backup:` (empty selector) and
`backup:a:b` (extra colon) — is the exception: it produces N-7 exactly once, the same as a
non-bearing token, and injects nothing (SE F-06; the malformed-spec rule sits in the bearing forms,
not the non-bearing ones, so the parenthetical above does not cover it). *(Contract · Harness · E ·
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

**PROP-NEG-05 — No state is ever decided by a version, a timestamp, or the entry's `pluginHash`.**
For every generated tree, perturbing exactly one **reporting-only** field at a time — (1)
`artifactVersion` in the distribution manifest, (2) `pluginVersion`, (3) `artifactVersion` in the
sync manifest, (4) `syncedAtUtc`, and (5) **`syncManifest[id].pluginHash`** — changes no `state` and
no `reason`, while the corresponding *reported* field does change, proving the perturbation reached
the subject. *(Data Integrity · Harness · E · `driftClassify.test.js`)*
AC-5.2, AC-5.4, **AC-1.1**, FSPEC §3.4 R-1, REQ §0 fact 6. The reached-the-subject conjunct is what
stops this from being a vacuous invariance property over a perturbation the subject never read.

**Draw (5) is the one that matters, and v1.0 omitted it** (PM F-06). AC-1.1 states that `stale` vs
`local-edit` is discriminated **solely** by `sha1(consumer) == syncManifest[id].consumerHash` and
that `pluginHash` is *reporting-only* — so `pluginHash` is the single field whose misuse flips
US-03's direction answer, sending the operator to `--force` over a real local edit. v1.0 perturbed
every reporting-only field **except** that one. The draw is applied to a `stale` row and a
`local-edit` row of the same tree (§2.3's L9/L10, whose recipes now pin the field in opposite
directions), so the perturbation is answered by an assertion rather than by a builder detail.

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

**This is the only skip inventory in the document** (§1.6; PM F-03, SE F-06). Every entry uses TSPEC
§1.3's `itOrSkip(name, capability, unverifiedInvariants, body)` — **four** parameters, `name` first;
same for `describeOrSkip(name, capability, unverifiedInvariants, body)` (SE F-11 corrects v1.0's
three-parameter citation). Both **throw** on an empty invariant list. A property that cannot run on
a runner appears here — never silently green, never silently absent.

| Property | Capability | Printed reason (TSPEC §7.3) | Unverified invariants the skip must name |
|---|---|---|---|
| PROP-CLS-01 leaf **L3** | `uid-nonroot` | uid-0 string | "leaf L3 (plugin-side existence undecidable ⇒ `unknown`/`plugin-artifact-unreadable`) is unverified; the reason itself stays covered by leaf **L2** via `PDLC_FAULT=plugin-artifact-read`" |
| PROP-CLS-01 leaf **L4** | `uid-nonroot` | uid-0 string | "leaf L4 (consumer-side existence undecidable ⇒ `unknown`/`consumer-artifact-unreadable`) is unverified; the reason stays covered by leaf **L5** via `PDLC_FAULT=consumer-artifact-read`" |
| PROP-CLS-03, PROP-RSN-04 (the L3/L4 half only) | `uid-nonroot` | uid-0 string | "totality and side-attribution are verified over the **nine** leaves constructible on this runner (L0, L1, L2, L5, L6, L7, L8, L9, L10); the two existence-`indeterminate` leaves L3 and L4 are not" |
| every §3, §4, §7, §9 case **except** the L0-bearing ones | `hash` | hash string | "the leaves whose expected state is not `unknown` are unverified on this runner" — the file-level `describeOrSkip("hash", …)`, FSPEC §12's standing precondition. **L0's cases sit outside it** (§2.2), so `hash-tool-absent` stays hard on every runner |
| PROP-BSL-03/-04/-06's `git`-routed vectors **and** PROP-BSL-05's `gitTreeBrokenProbe` leg | `git` | git string | "AC-0.5 step 1's never-fall-through rule and the `git-worktree-list` guard are unverified; the walk-routed vectors still run" |
| every §6 property | `bash` | bash string | "the backup grammar's round-trip, order and prune clauses are unverified" |

The `git` row is the reconciled one: v1.0's §1.6 named **PROP-BSL-05** and §11.1 named
**PROP-BSL-03/04/06**; both are gated, for the same reason, and the row now says so.

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
| **D-2** | The hash-utility probe is **once per run**, not once per row (FSPEC §3.1, and the premise of §13.1's latency claim) | spawn counts are not observable; there is no trace `op` for the probe | Structural: `pdlc_classify_row` receives the resolved utility as an input (TSPEC §2.2). Surrogate assertion: PROP-CLS-01's L0 run asserts **every** row is `unknown`/`hash-tool-absent`, which is only true of a run-level probe. **Residual, and it has no owning surface**: a per-row re-probe that happens to agree on every row is undetected here and *nowhere else* — v1.0 routed it to NFR-2, but §0.3 records that NFR-2 is structurally discharged and that **no property, AT or oracle in this feature asserts time**, so that routing named nothing (PM F-05). The residual is accepted unowned and recorded as **P-R-8**; the cost scales with row count, which the manifest is expected to grow, and it lands on the hook path the operator experiences at session start |
| **D-3** | There is exactly **one** classifier and no derived-state shortcut (FSPEC §3.1, §3's pass table) | a second classifier agreeing with the first is unobservable by construction | PROP-DET-06 (process independence) + PROP-MTM-02's single-pass conjunct + `assertPhaseOrder`'s grammar rule (only `pdlc_classify_row` sets a phase label, TSPEC §2.2). **Residual**: two classifiers that agree on every generated leaf are undetected |

A fourth candidate — asserting that no property *depends* on `generatedAtUtc` — is not a **D** row:
it is discharged by §1.5 rule 2 (every byte comparison normalises the field) plus TSPEC §14.1 V-3
(the field's only presence/shape assertion).

## 12. Property → test file placement

Files are TSPEC §14's existing inventory; this document adds **no new test file** and one helper
(`__tests__/helpers/driftGenerators.js`, §1.3), excluded from jest by the existing
`testPathIgnorePatterns`.

**Reconciled with the per-property "Lands in" annotations** (SE F-12): v1.0's table and the property
rows disagreed in three places, and PROP-BSL-06/-07 appeared in two rows each, which reads as two
homes for one `it()` against rule 2 below. The convention now, applied throughout: a property with
**one** home is listed once; a property genuinely **split into two independently-falsifiable
`it()`s** is listed in both files with the half named in parentheses, and its own row says the same.

| File | Properties |
|---|---|
| `__tests__/driftClassify.test.js` | PROP-CLS-01, -02(a), -02(b), -03, -05, -06, -07, -08; PROP-RSN-01…06; PROP-DET-01, -02, -04, -05; PROP-NEG-01, -05; PROP-CLS-04 (record half) |
| `__tests__/driftBaseline.test.js` | PROP-BSL-01, -02, -03, -04, -08; PROP-BSL-05 (record half); PROP-DET-06; PROP-MTM-02 (`--check` half); PROP-RSN-05 (baseline half); PROP-NEG-07 (M10 half) |
| `__tests__/driftOrdering.test.js` | PROP-BSL-07; PROP-CLS-04 (trace half); PROP-MTM-03 (trace half); PROP-SEAM-05 (trace-file half), -07, -08; PROP-DET-03 |
| `__tests__/driftSync.test.js` | PROP-MTM-01, -03, -04 (sync half), -05 (sync half), -06, **-07**; PROP-NEG-03 (forward half), -06, -07 (blast-radius half) |
| `__tests__/driftHook.test.js` | PROP-MTM-02 (hook half), PROP-MTM-04 (hook half), PROP-NEG-04 (hook half) |
| `__tests__/driftWriteFailure.test.js` | PROP-NEG-03 (converse half) |
| `__tests__/driftRepoRoot.test.js` | PROP-BSL-06, PROP-NEG-02 |
| `__tests__/driftFault.test.js` | PROP-SEAM-01, -02, -03, -04, -06; PROP-SEAM-05 (fault-unset half) |
| `__tests__/driftBackups.test.js` | PROP-BKP-01…13 |
| `__tests__/queueDriftGate.test.js` | PROP-MTM-05 (queue half), PROP-NEG-04 (queue half), PROP-BSL-05 (queue half) |
| `__tests__/helpers/driftGenerators.js` | the generators, `enumerateLeaves()`, `enumerateEvidenceVectors()`, `readFaultTokens()` (§8.0), `shrink()` — **new**, §1.3 |

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
| PROP-CLS-02(a), -02(b) | AC-1.8(ii), AC-1.1 | §3.3, §3.6, §3.4 R-1/R-3 | §3.3 | **O-9** |
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
| PROP-MTM-03 | AC-2.9(1), AC-3.1, **AC-3.2** | §4.2 steps 2–5, §5.5 | §4.3 conjuncts, `assertPostCopyNarrow`, §14 AT-8a/AT-10 | **O-20**, O-1 |
| PROP-MTM-04 | AC-2.6, AC-2.8, AC-3.9 | §3's pass table, §4.2 step 6, §5.5, §5.7 | §5.2 token 10, §14 AT-11, AT-12, AT-35 | **O-20** |
| PROP-MTM-05 | AC-2.7, AC-3.6 | §4.2 step 7, §5.9 | §14 AT-9, §12.2 | **O-20** |
| **PROP-MTM-07** | **AC-3.7**, AC-3.4 (retention), AC-2.7 | §5.9, §1.2, §5.6 | §14 AT-9, §14.1 V-1, §11.3 row 3 | **O-20** |
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

### 13.1 ACs deliberately carrying no property — the full list, with owning surfaces

§13's contract is that an AC's *absence* from the table above is a **disposition, not a gap**. v1.0
stated the contract and then did not apply it to four P0 ACs (PM F-01) and contradicted itself on a
fifth (PM F-08). Applied here to every AC not appearing above:

| AC | Priority | Owning surface | Note |
|---|---|---|---|
| AC-0.2, AC-0.3, AC-0.3a, AC-0.4 | P0 | TSPEC AT-24, §9.2 | baseline-resolution *mechanics* (marker precedence, `CLAUDE_PLUGIN_ROOT` branches, fresh-clone). The **outcomes** they produce are in §5.1's E3 axis and are property-covered; the resolution order is example-shaped |
| **AC-2.4** — hook exits 0 on **every** failure path, with the failure on stderr **and** in the drift state | **P0** | **partly property-covered, remainder TSPEC AT-3 / AT-14 / AT-16 / AT-18a** | The exit-0 half is asserted by **PROP-BSL-06** on three representative `E1 = holds` vectors (§5.2's stated domain: 10 vectors on `--check`, of which 3 are re-run on sync and the hook for the exit-code conjunct — not every one) and **PROP-SEAM-04** (hook exits 0 on an unrecognised token while `--check`/sync exit 4); the "never silent" half by **PROP-NEG-04** (at least one matched W-*/N-* line on every degraded run); the "and in the drift state" half by **PROP-BSL-05** (the stderr reason is captured and compared to the record's `baselineReason`). What the ATs still own alone is the **write-failure ladder** — the compositions where the drift state itself cannot be written (AT-14/-16), which no property enumerates |
| **AC-3.2** — `--force` gate on `local-edit`/`unverified` | **P0** | **property-covered: PROP-MTM-03** | v1.0 quantified only the copy set; v2.0 adds the plain-sync conjuncts (byte-unchanged rows, exact state string in the report, exit 2 per AC-3.3's precedence) and the `--force` conjuncts. TSPEC AT-8a/AT-10/AT-26 remain the worked examples (PM Q-01 answered: the property owns them) |
| **AC-3.7** — repeat sync is a no-op | **P0** | **property-covered: PROP-MTM-07** (new in v2.0) | AT-9 and §14.1 V-1 are the worked examples; the property is the quantified claim, including the backup-window conjunct AT-9 does not make |
| **AC-3.8** — fresh-consumer bootstrap | **P0** | **TSPEC AT-24**, with two property-level supports | Leaf **L6** (`A3 = no ⇒ missing`, §2.3) is the classification half, and **PROP-MTM-01** covers the copy half over generated trees whose rows are all `missing`. What AT-24 owns alone is the *directory-creation ordering* on a tree with no `.claude/` at all (FSPEC §4.2 step 3 after step 2) — one tree shape, not a quantified claim |
| AC-2.1, AC-2.3, AC-2.5, AC-2.5a, AC-2.8 | P0/P1 | TSPEC §7.4, §14.1 M-1/M-2/M-3 | message **content**; §0.3 states why a generator over English strings asserts nothing |
| AC-3.5 restore | P0 | TSPEC AT-8b, AT-26 | §6.4's sort property is what makes *"the newest"* well-defined for it; **PROP-MTM-07** conjunct 2 is what keeps the window from evicting under it |
| AC-4.1's ten mapping rows | P0 | TSPEC §12.2 | all ten as examples, each with a record defeating every higher row. **PM Q-03 answered:** PROP-NEG-04 does *not* duplicate §12.2's per-row oracle — it asserts only rows 2 and 8 (the two exceptions) positively, plus the closed-set claim that **no eleventh exception exists**. That claim is quantified and has no example form, so the two surfaces are complementary; the disposition above is narrowed to "the ten rows", not "AC-4.1" |
| AC-4.2's report split | P1 | TSPEC AT-31 | |
| AC-5.1, AC-5.3 | P2 | TSPEC AT-19, §14.1 V-4, residual R-12 / **P-R-6** | |
| AC-6.1…AC-6.5 | P0/P1 | TSPEC §10's root-parameterised oracles | |
| **AC-6.6** | P0 | **FSPEC §7.4 / TSPEC §10.3's `advertisedVersionViolation(root)`**, incl. the `LIVE_ROOT` assertion | routed by name per §0.3; the residual is **P-R-5a**, not P-R-5 (PM F-07) |
| NFR-2 | P1 | **none** — structural (FSPEC §13.1) | no timing assertion exists anywhere in the feature, so nothing may be *routed* here (§0.3). The one residual that was is now **P-R-8**, accepted unowned |
| **AC-1.1a** | P0 | **§11.1** | effectively discharged: it is the source of REQ §10's **O-11**, which §11.1 disposes directly (SE F-07) |
| **AC-6.2a** | P1 | **not property-shaped** | prose/UX-facing; no property surface owns it, and none is required (SE F-07) |
| **NFR-4** — sync never runs implicitly | P1 | **property-covered (hook half): PROP-MTM-04 conjunct 1** | the hook half is asserted by conjunct 1's `assertPhaseOrder` claim that a hook run has no post-copy phase at all — routed here by name, where SE F-07 found it unnamed |
| **NFR-5** | P2 | **not property-shaped** | (SE F-07) |

**AC-0.1 is not on this list** (PM F-08). v1.0's closing paragraph listed it among the ACs carrying
no property while the table above maps **PROP-SEAM-06** and **PROP-NEG-07** to it — a contradiction
a reader cannot resolve. Corrected: AC-0.1 **is** property-covered, in both its halves. The **M6
charset** half is PROP-SEAM-06 (and PROP-BKP-01/-02's generated ids); the **globbing prohibition**
half is PROP-NEG-01 (no unmanaged file enters `rows`), PROP-DET-04 (`rows` follows the manifest's
non-alphabetical order, never a glob's) and PROP-NEG-07 (M10's blast radius). Nothing about AC-0.1
is dispositioned away.

## 14. Coverage gaps and stated residuals

Each is stated with its cost and what would change the assessment. None is mitigated by asserting it
cannot happen.

| # | Gap / residual | Assessment |
|---|---|---|
| **P-R-1** | **Two uid-0 leaves.** L3 and L4 (existence-`indeterminate`) are permission-only; on a root runner PROP-CLS-01/-03 and PROP-RSN-04 are partial | Accepted and **named** (§11.1). No fault token can make *existence* undecidable — tokens 15/16 fault the read (TSPEC v2.1, TE L-07) — so closing this would need a token for the existence `stat`, which TSPEC §5.2's closure argument rejects. The **reasons** both leaves produce stay covered on every runner, so no meta-oracle turns red on root. Changes if a runner-level capability (e.g. a user-namespace sandbox) is added to the harness |
| **P-R-2** | **Shrinking is a fixed ladder, not a search.** A failure whose minimal witness is off the ladder is reported at the drawn size | Accepted (§1.3 rule 3, §2.5). The axes are already minimal — a classifier case is one row of one manifest — so the ladder's four steps reach the minimal form for every axis this document generates. Changes if a future axis is genuinely continuous; the honest fix then is a library shrinker, which means a devDependency and a re-litigation of TSPEC §1.2 |
| **P-R-3** | **No property-testing library.** Generation, shrinking and reporting are hand-written (§1.3) | Deliberate: `pdlc/workflows/package.json` has exactly one devDependency and TSPEC §1.2 rejected bats for adding one. The cost is that generator bugs are possible; it is bounded by the generators being asserted about themselves (§6.2's forced adversarial proportions, `M6_ID_REGEX` imported rather than re-declared, `setRowState`'s self-check) — the fixture builder is its own first oracle, and this document inherits that rule rather than restating it |
| **P-R-4** | **Purity, spawn count and classifier uniqueness are design-time** (§11.2 D-1/D-2/D-3) | Accepted; each has a named surrogate and a stated residual. All three are consequences of TSPEC R-1's black-box bash, and the mitigation is the same one TSPEC adopts: a new observable is a new trace `op`, never a new production output |
| **P-R-4a** | **The `hash` skip granularity this document requires is finer than the TSPEC's.** TSPEC §7/§1.3 place the skip at file level; §2.2 requires L0-bearing cases outside it | Recorded as an **upstream note**, not a change — TSPEC v2.1 is approved. The tension is real: at file-level granularity a hash-less runner skips `driftClassify.test.js` entirely, taking L0 and with it the claim that `hash-tool-absent` never skips, on which §2.3's and §11.1's row-reason floor argument rests. §2.2 states the required placement; the successor TSPEC should tighten §7's wording. If the implementation cannot achieve it, the honest fallback is to *relax the floor claim on a hash-less runner* and say so in the skip message — never to leave both statements standing |
| **P-R-5** | **`packagingViolations` / `coveredViolations` are not quantified.** They are pure functions of a root and would admit property-based generation (e.g. "adding an exempt-path file never changes the returned set") | **Not taken, deliberately.** Their obligations (O-16, O-17) are *fixture-pinned by design*: AC-6.4's anti-widening guard is exactly a claim about **one frozen tree**, and a generator over document trees would re-express the exemption rules in the test, giving two copies of the rule that can drift. TSPEC §10.1/§10.3's two-root structure is the stronger oracle. Recorded so a reviewer sees the option was considered. **Scope corrected in v2.0:** this argument covers these two functions only — `advertisedVersionViolation` is P-R-5a |
| **P-R-5a** | **`advertisedVersionViolation` (AC-6.6) is not quantified either — and unlike P-R-5, its claim genuinely *is* quantified over roots.** "`dist/` bytes change ⇒ the advertised `plugin.json` `version` changes" ranges over repository states, not over one frozen tree, and REQ §0 fact 6 records this repo shipping the violation **twice** | **Not taken, and the reason is different from P-R-5's** (PM F-07 is right that P-R-5's argument does not transfer). The generable object here would be a *repository state* — a `dist/` tree plus a `plugin.json` plus a git history — and a generator for it would have to re-express the builder (FSPEC §7.1) and the freshness rules (§7.3) inside the test, which is the two-copies-that-drift failure P-R-5 names, at a larger scale. What the feature does instead is stronger where it counts: TSPEC §10.3's `documentOracles.test.js` runs `advertisedVersionViolation(LIVE_ROOT)` against the **real** repository on every `npm test`, so the exact recurrence REQ §0 fact 6 records is caught on the actual root rather than on a generated proxy — plus the `fxRootUntrackedOnly` red fixture and the skip-loudly branches. The residual is that a *class* of root the fixtures do not represent is unguarded until it is the live root. Changes if the feature ever ships more than one distributed root |
| **P-R-6** | **AC-5.3's rendered version lines** have no oracle at any level | Inherited from TSPEC **R-12**, unchanged: FSPEC §8.2's message shapes name no version line, so an assertion would have to invent message text. AC-5.3 is P2, the record-field half is asserted (TSPEC §14.1 V-4), and TSPEC §16 routes the successor. No property is written over an unspecified string |
| **P-R-7** | **The spawn budget is a ceiling, not a measurement.** §1.4 now budgets **≈ 180** spawns — the v1.0 figure of ≈ 55 was arithmetically wrong in five of its seven rows (SE F-05, PM F-04) — and the real cost is measured only when the suite exists | Restated on the corrected number. §1.4 re-argues R-3 on **wall clock** (≈ 27–45 s at 0.15–0.25 s/spawn) rather than on spawn count, because spawn count was never the quantity R-3 is about. If the measured cost pushes `npm test` past the point a maintainer runs it, the required response is §1.4's ordered rule — repack, then batch (the two named first candidates are §8's 16-token sweeps at 32 spawns and §3's PROP-CLS-06 solo runs at 8) — and **never** to sample a domain §1.3 rule 2 says to enumerate. The residual is that the whole argument rests on an unmeasured per-spawn constant; the first implementation batch should report the measured `npm test` delta and this row should be updated with it |
| **P-R-8** | **A per-row re-probe of the hash utility is undetected, and no surface owns it** (§11.2 D-2) | Accepted **unowned**, explicitly (PM F-05). v1.0 routed this residual to NFR-2; §0.3 records that NFR-2 is structurally discharged and that no property, AT or oracle in this feature asserts time, so that routing named nothing and made the residual unfalsifiable *and* unattributed. The surrogate (PROP-CLS-01's L0 run, plus `classify_row` receiving the resolved utility as an input per TSPEC §2.2) is real but cannot distinguish a re-probe that agrees. The cost scales with row count and lands on the hook path at session start. Changes only if a trace `op` is added for the probe — which is the mitigation TSPEC R-1 prescribes for exactly this class, and which the successor should weigh against the seam-closure argument in §5.2 |
| **P-R-9** | **The generated set is static under the default seed** (§1.3 rule 1) | Accepted and now **disclosed** (PM F-09, SE F-13). The suite draws the same 500 cases for the life of the feature: it is a large generated fixture set, not an exploring property suite, so coverage does not grow by re-running and a defect outside the drawn sample is never found by repetition. The trade is reproducibility over exploration and it is forced by R-3 — an unreproducible red run on a suite with no CI gets deleted. `PDLC_PROP_SEED` is the documented widening hatch, and §6.2's *forced* adversarial proportions are what stop the fixed sample from being an arbitrary one. Durable beyond this feature: any hand-rolled property suite in `pdlc/workflows` inherits it, and that is a LEARNINGS candidate |
| **P-R-10** | **Three ladder adjacencies have no order-observing input.** `missing`/`in-sync`, `unverified`/`stale` and `stale`/`local-edit` cannot co-hold, so no fixture can catch a reordering of those rungs (§2.1(2), PROP-CLS-02(b); SE F-03 corrected the count from two to three) | Accepted, and this is the honest form of what v1.0 asserted falsely (SE F-01). The compensating controls are named per row in PROP-CLS-02(b) and they target the defects that are actually reachable: the vacuous-equality implementation (L6's `null`/non-null hash conjuncts), the degraded-manifest fall-through (PROP-CLS-07), and the wrong-field comparison (§2.3's L9/L10 `pluginHash` pins plus PROP-NEG-05 draw 5). **PROP-CLS-07 compensates for the degraded-manifest fall-through, not for the `unverified`/`stale` reordering itself** — a pure rung-4/5 swap that still lands on `unverified` for every no-entry case stays green against it (SE F-03), the same distinction the `stale`/`local-edit` row already draws for its own oracle. What remains genuinely unverifiable is the *pure* reordering — swapping rungs 2 and 3, 4 and 5, or 5 and 6, with everything else correct — which by the structural argument produces identical output on every input. A defect that is unobservable is also harmless at the observable level; it becomes a hazard only if a later change makes one of the guards partial, which is why the argument is written down rather than the rows deleted |

## 15. Revision note — v2.0 (2026-07-28)

Disposition of every finding in `CROSS-REVIEW-product-manager-PROPERTIES-v1.md` (2H/5M/2L) and
`CROSS-REVIEW-software-engineer-PROPERTIES-v1.md` (5H/4M/6L). Ids are **reviewer-qualified**
(`PM F-nn` / `SE F-nn`) because both reviewers number from F-01. REQ v17.0, FSPEC v5.1 and TSPEC
v2.1 are approved and are **not modified**; where a finding exposed a genuine upstream tension it is
recorded as an explicit note rather than acted on (SE F-08 → P-R-4a).

### 15.1 Software-engineer findings

| ID | Sev | Disposition |
|---|---|---|
| **SE F-01** | High | **Accepted, reworked.** §2.1(2) now derives, from FSPEC §3.3's guards, which of the five state adjacencies can co-hold: `unknown > missing` and `in-sync > unverified` can; `missing > in-sync`, `unverified > stale` and `stale > local-edit` cannot, the last because rung 6 is the ladder's `otherwise` and has no guard at all. PROP-CLS-02 splits into **(a)** three genuinely co-holding rows with real co-holding fixtures and **(b)** three adjacencies disposed by the structural argument plus a *directed* oracle naming the wrong implementation it is red against (L6's `consumerHash === null` / `pluginHash !== null` conjuncts; PROP-CLS-07's four sub-recipes; §2.3's L9/L10 `pluginHash` pins with PROP-NEG-05 draw 5). The claim that every pair has a co-holding leaf is dropped. **Q-04 answered:** `stale > local-edit` gets no fixture and no scratch-copy mutation test — the honest oracle is R-1's "solely `consumerHash`", which the pins and PROP-NEG-05 carry. Residual **P-R-10** |
| **SE F-02** | High | **Accepted, corrected.** §5.1's E5 rule is now `E2 = holds ∨ E4 = holds ∨ E4 indeterminate`; E6's is `E5 = holds ∨ E5 indeterminate` — FSPEC §2.1 Phase 1's rules verbatim. The consequence is spelled out: under the corrected rules the manifest-absent vector carries `E5/E6 = indeterminate`, so PROP-BSL-03's computed oracle selects **`manifest-absent`**, matching FSPEC §2.8's "ordinary first-release consumer" row, instead of `manifest-empty`. That row is now an explicitly named literal conjunct of PROP-BSL-03 — a regression fixture for this exact defect |
| **SE F-03** | High | **Accepted, recounted.** §5.1 now states the axes: `enumerateEvidenceVectors()` closes over **E1–E6** and **not** E7, cardinality **20** (10 manifest-chain assignments × E1's 2 values), with the 10 derived in a checkable table. E7 is varied by PROP-BSL-08 alone (6 config states × 2 vectors). A per-property domain table gives PROP-BSL-06 the 10 `E1 = holds` vectors plus 3 vectors × 2 extra entrypoints, and PROP-BSL-08 its 12 runs. §1.4's baseline row is re-derived at **39** spawns. **Q-02 answered** by that table. **PM Q-02 answered** in the same place: PROP-BSL-06 *reuses* the enumeration's `--check` runs and pays 6 extra spawns for its sync/hook conjunct |
| **SE F-04** | High | **Accepted, property rewritten.** FSPEC §4.2 **step 6** — cited, not inferred — rewrites the sync manifest (a classifier input for rungs 4–6) between the post-copy pass (step 5) and the post-run pass (step 7), and §5.5 removes the entry of any row that failed verification. PROP-MTM-04 is now three conjuncts: pass attribution on all entrypoints; agreement **scoped** to sync runs where step 6 changed no entry for R; and the AT-35 disagreement asserted **positively** in both sub-cases (pre-existing entry ⇒ post-copy `local-edit` / recorded `unverified`; no entry ⇒ both `unverified`). The bytes-only argument is retracted in the body. **Q-01 answered:** entry removal lands in step 6, so v1.0's conjunct did not survive |
| **SE F-05** | High | **Accepted, budget recomputed.** §1.4's table is rebuilt from the properties as written, row by row: §3 is 4 + 2 + 2 + 8 + 4 + 3, §4 adds 1, §5 is 39, §6 is 8 (PROP-BKP-04 counted, the five prune properties unbundled, PROP-BKP-07 attributed to §6.4 not §6.5), §7 is 21 (per generated tree, plus PROP-MTM-07), §8 is 48 (PROP-SEAM-01's 21, -03's 16, -04's 4, -05's 6, -07's 1), §9 is 9 against six PROP-DET rows, §10's uncounted negatives are 32. The packed run is **8** leaves, not 9, and §2.3 has **ten** hash-present leaves. **Ceiling ≈ 180, not ≈ 55** (rows recomputed sum to **181**, per SE F-01's own recount) — stated as the real number, with R-3 re-argued on wall clock (≈ 27–45 s) rather than spawn count, and §1.4's re-expression rule given an ordered priority with named first candidates so it can actually fire. **P-R-7** restated on the new number |
| **SE F-06** | Med | **Accepted.** The leaf ids are **L3/L4**, covered by **L2/L5**; §0.2's O-11 row and §1.6 are corrected. §1.6 no longer carries a table at all — **§11.1 is the sole inventory**, and the `git` row is reconciled to cover PROP-BSL-03/-04/-06 *and* PROP-BSL-05 |
| **SE F-07** | Med | **Accepted, pinned in a new §8.0.** `PDLC_FAULT_TOKENS` is a `readonly` **bash array** in C1, adjacent to `pdlc_fault_active`; JS obtains it via `readFaultTokens()`, one `bash -c 'source C1; printf …'` that reads the **runtime array**, with a 16-entry/distinct/M6 sanity conjunct so an empty return cannot make PROP-SEAM-01 vacuous. No JSON side-artifact, no JS mirror. Independence is then argued explicitly: -01 reads the runtime value, -02 reads call-site text and **excludes the array declaration**. **Q-03 answered:** bash array in C1, extracted by sourcing |
| **SE F-08** | Med | **Accepted as a granularity specification + upstream note.** §2.2 requires L0-bearing cases (PROP-CLS-01, PROP-RSN-01, PROP-CLS-02(a)'s `unknown > every lower` row) at `it()` level **outside** the file-level `describeOrSkip("hash", …)`; §11.1's blanket row is narrowed to match, so the row-reason floor stays hard. TSPEC v2.1 is approved and unedited — the tension is recorded as **P-R-4a**, with the honest fallback stated (relax the floor claim in the skip message, never leave both statements standing) |
| **SE F-09** | Med | **Accepted, index regenerated.** O-20's row now says **seven** properties (PROP-MTM-01…07 with each clause mapped); AC-1.8(iv)'s says PROP-RSN-01…**06** / PROP-BSL-01…**08**; O-9's row replaces "both precedences asserted as selector properties" with the accurate three-precedence account (baseline = selector property; row-state and row-reason = first-match ladders split into co-holdable and unco-holdable adjacencies); O-11's row carries L3/L4 covered by L2/L5. §0.2 now states that it is regenerated at every revision and that the body wins on conflict |
| **SE F-10** | Low | **Accepted.** §1.2 is retitled "the two *spawning* surfaces" and the in-process row is labelled "not a runner"; "no third runner" is kept, correctly scoped |
| **SE F-11** | Low | **Accepted.** §11.1 cites `itOrSkip(name, capability, unverifiedInvariants, body)` and `describeOrSkip(name, …)` — four parameters, `name` first, per TSPEC §1.3 |
| **SE F-12** | Low | **Accepted.** §12's table is reconciled with the per-property annotations: PROP-SEAM-05 and PROP-CLS-04 are listed in both homes with the half named; PROP-RSN-05's baseline half is added to `driftBaseline`; PROP-BSL-06 and -07 each appear **once** (`driftRepoRoot`, `driftOrdering`), and the ranged listings are expanded so a range cannot silently claim a second home. The convention is stated above the table |
| **SE F-13** | Low | **Accepted.** §1.3 rule 1 now states the static-set consequence, that reproduction is by **replay** (the failure message prints the case *value*, and `shrink()` operates on the value, not an index), and adds the **`PDLC_PROP_SEED`** override. Residual **P-R-9** |
| **SE F-14** | Low | **Accepted.** PROP-SEAM-02's literal conjunct is scoped to **argument 1** (TSPEC §5.1.1 requires a variable scope key as argument 2, so v1.0's wording was false against a conforming implementation); the scan's exclusions — the function definition, the `PDLC_FAULT_TOKENS` declaration, comments and heredoc bodies — are stated. `document-oracles.mjs` is first cited as `pdlc/workflows/lib/document-oracles.mjs` (**new**, per TSPEC §2.1) in §6.2 |
| **SE F-15** | Low | **Accepted.** PROP-SEAM-01(b)'s four draws are now four *classes* — unrelated M6 string, edit-distance-1 mutation, leading/trailing whitespace, changed case — one draw from each, with the overlapping `Mkdir` example removed and each class's falsified implementation named |

### 15.2 Product-manager findings

| ID | Sev | Disposition |
|---|---|---|
| **PM F-01** | High | **Accepted.** §13's closing paragraph is replaced by **§13.1**, a full table applying §13's own absence-disposition contract to every AC not in the traceability table, each with its owning surface. The four P0 gaps: **AC-2.4** — partly property-covered (PROP-BSL-06 exit 0, PROP-SEAM-04 exit 0 on unrecognised tokens, PROP-NEG-04 non-silence, PROP-BSL-05 stderr-reason == recorded reason) with AT-3/-14/-16/-18a owning the write-failure ladder alone; **AC-3.2** — now property-covered by PROP-MTM-03; **AC-3.7** — now property-covered by the new PROP-MTM-07; **AC-3.8** — AT-24, with leaf L6 and PROP-MTM-01 named as the property-level supports and the directory-creation ordering identified as what AT-24 owns alone |
| **PM F-02** | High | **Accepted — PROP-MTM-07 added.** Five conjuncts over the trees §7 already builds, at one extra spawn: no `copy` record and byte-identical artifacts; **no `backup` record and an identical backup name → bytes map**; sync manifest byte-identical **including `syncedAtUtc`**; drift state equal up to `generatedAtUtc`; exit 0. Each row names the wrong implementation it is red against, and conjunct 2 names the operator-visible cost the review identified — silent eviction of the 5-deep window AC-3.5's restore depends on |
| **PM F-03** | Med | **Accepted** — same fix as SE F-06: L3/L4 covered by L2/L5, and §1.6's duplicate table removed rather than repaired, so the skip message cannot name a leaf that ran |
| **PM F-04** | Med | **Accepted** — see SE F-05. §1.4's §9 row is 9 against six PROP-DET properties (PROP-CLS-05's two runs are attributed to §3, where the property lives); the "nine hash-present leaves" phrasing is corrected to **eight packable** leaves out of ten hash-present ones; the ceiling is restated at ≈ 180 and P-R-7 re-argued rather than left against a stale estimate |
| **PM F-05** | Med | **Accepted.** §11.2 D-2's "(NFR-2)" routing is removed; §0.3 states as a general rule that nothing may be routed to NFR-2 because no surface in the feature asserts time; the residual is recorded as **P-R-8**, "accepted with **no** owning surface", with the scaling cost and the session-start exposure named and the trace-`op` mitigation identified as the only thing that would change it |
| **PM F-06** | Med | **Accepted, both ways.** `syncManifest[id].pluginHash` is added as PROP-NEG-05's **fifth** perturbation draw, applied to a `stale` and a `local-edit` row; **and** §2.3's L9/L10 recipes now pin the field in opposite directions (L9: a third value ≠ `sha1(plugin)`; L10: equal to `sha1(plugin)`), so an implementation comparing `pluginHash` gives the wrong answer on each leaf. The discrimination is asserted rather than incidental |
| **PM F-07** | Med | **Accepted.** `advertisedVersionViolation` is routed **by name** in §0.3 to FSPEC §7.4 / TSPEC §10.3, appears in §13.1 with AC-6.6, and gets its own residual **P-R-5a** with its own argument — the review is right that P-R-5's one-frozen-tree reasoning does not transfer to a claim quantified over roots. P-R-5's scope is explicitly narrowed to the other two functions |
| **PM F-08** | Low | **Accepted.** AC-0.1 is removed from the no-property list and §13.1 states positively which properties cover each of its halves (M6 charset: PROP-SEAM-06, PROP-BKP-01/-02; globbing prohibition: PROP-NEG-01, PROP-DET-04, PROP-NEG-07) |
| **PM F-09** | Low | **Accepted** — recorded as **P-R-9** (see SE F-13), including the cross-feature note that any hand-rolled property suite in `pdlc/workflows` inherits the trade |

### 15.3 Questions answered in the body

| Question | Where |
|---|---|
| PM Q-01 (AC-3.2's report/exit conjuncts) | PROP-MTM-03 — the property owns them; AT-8a/-10/-26 remain the worked examples |
| PM Q-02 (PROP-BSL-06's domain vs the 14) | §5.1's per-property domain table — it reuses the 10 `E1 = holds` `--check` runs and pays 6 more for the sync/hook conjunct, inside the recomputed ceiling |
| PM Q-03 (AC-4.1 partly property-owned?) | §13.1's AC-4.1 row — the disposition is narrowed to "the ten mapping rows"; PROP-NEG-04's no-eleventh-exception conjunct is quantified and complementary, not a duplicate of §12.2 |
| SE Q-01 (where entry removal lands) | PROP-MTM-04 and §15.1 SE F-04 — FSPEC §4.2 **step 6**, by citation |
| SE Q-02 (does the enumeration close over E1/E7?) | §5.1 — E1 yes, E7 no |
| SE Q-03 (`PDLC_FAULT_TOKENS`'s form) | §8.0 — bash array in C1, extracted by sourcing |
| SE Q-04 (`stale > local-edit`'s oracle) | PROP-CLS-02(b) — none is a precedence oracle; R-1's field discipline is the real claim |
| SE Q-05 (leaf L4's partial path) | §2.3 — an omission; L4, L5, L6 and L7 now spell out their ancestors |

### 15.4 Revision note — v2.1 (2026-07-28)

Disposition of every finding in `CROSS-REVIEW-product-manager-PROPERTIES-v2.md` (1H/0M/2L) and
`CROSS-REVIEW-software-engineer-PROPERTIES-v2.md` (0H/0M/8L). Ids are **reviewer-qualified**
(`PM F-nn` / `SE F-nn`), both numbering from F-01 in their respective round-2 reviews. REQ v17.0,
FSPEC v5.1 and TSPEC v2.1 remain approved and are **not modified**.

**15.4.1 Product-manager round-2 findings**

| ID | Sev | Disposition |
|---|---|---|
| **PM F-01** | High | **Accepted.** PROP-MTM-03's plain-sync conjunct corrected from exit **1** to exit **2**, per AC-3.3's precedence table (any row `local-edit`/`unverified` outranks any row `stale`/`missing`) and the property's own cited TSPEC AT-8a/AT-10, both worked at exit 2. §13.1's AC-3.2 row corrected identically. A note is added at the site: exit 1 on a sync run is reachable only when §5.5's post-copy verification is absent or defeated (FSPEC §5.8, O-14), and this property's fixtures never construct that case |
| **PM F-02** | Low | **Accepted.** §13.1's AC-2.4 row corrected from "PROP-BSL-06 (hook exits 0 on every `E1 = holds` vector)" to "on three representative `E1 = holds` vectors", matching §5.2's stated domain (10 vectors on `--check`, 3 re-run on sync and the hook) |
| **PM F-03** | Low | **Accepted.** §2.5's shrink ladder step 1 corrected from "packed nine-row run" to "packed eight-row run", matching the F-04 recount already applied elsewhere in v2.0 |

**15.4.2 Software-engineer round-2 findings**

| ID | Sev | Disposition |
|---|---|---|
| **SE F-01** | Low | **Accepted.** §1.4's §8 row corrected from 47 to **48** (PROP-SEAM-01 16+4+1=21, -03's 16, -04's 4, -05's 3×2=6, -07's 1) and §10 row corrected from 27 to **32** (3+6+4+5+8+6); §15.1's SE F-05 ledger entry corrected to match. The row totals now sum to **181**, which the stated ≈ 180 ceiling and the 27–45 s wall-clock argument both already assumed and survive unchanged |
| **SE F-02** | Low | **Accepted.** PROP-MTM-07's domain is now stated explicitly: every generated consumer tree whose first sync is fault-free and exits 0, excluding PROP-MTM-06's write-failing trees and PROP-MTM-03's local-edit/unverified trees, both of which would falsify conjuncts 4–5 against a conforming implementation |
| **SE F-03** | Low | **Accepted.** P-R-10 and its body (§2.1(2), §3) now name **three** unco-holdable/non-order-observing adjacencies (`missing`/`in-sync`, `unverified`/`stale`, `stale`/`local-edit`), not two, and state explicitly that PROP-CLS-07 compensates for the degraded-manifest fall-through defect, not for a pure rung-4/5 reordering — the same distinction the `stale`/`local-edit` row already draws for its own oracle |
| **SE F-04** | Low | **Accepted.** PROP-MTM-04's heading no longer claims an "exactly when" biconditional; conjunct 2's structural clause ("step 6 neither wrote nor removed an entry for R") and its operational clause ("R's copy verification passed, or R was not copied at all") are now stated as non-equivalent, with the operational clause kept as the assertion and the copy-verified case's real reason (rung 3 fires before any manifest lookup) stated explicitly |
| **SE F-05** | Low | **Accepted.** §8.0's `PDLC_FAULT_TOKENS` `readonly` assignment in C1 is now preceded by an idempotent-source guard, so C2/C3 and `readFaultTokens()` sourcing C1 a second time in one shell no longer hits a `readonly`-reassignment error. `readFaultTokens()` is also specified to assert the child process's exit status before its 16-entry sanity conjunct |
| **SE F-06** | Low | **Accepted, all three.** (i) §2.3's L7 row now spells out its full ancestor path (`A1 = yes, A2 = yes, A3 = yes, A4 = yes, A5 = equal`), correcting §15.3's SE Q-05 disposition. (ii) PROP-CLS-07 now states the present-without-this-id sub-recipe also emits no N-4, alongside the absent case. (iii) PROP-SEAM-03's partition sentence now scopes the malformed-spec forms (`backup:`, `backup:a:b`) to the bearing clause, where TSPEC §5.1.1 places them, stating that a bearing token with a malformed selector produces N-7 like a non-bearing one |
| **SE F-07** | Low | **Accepted.** §13.1 adds rows for **AC-1.1a** (discharged via §11.1/O-11), **AC-6.2a** and **NFR-5** (not property-shaped), and **NFR-4** (routed by name to PROP-MTM-04 conjunct 1's `assertPhaseOrder` claim) |
| **SE F-08** | Low | **Accepted.** §2.1(2)'s split criterion is restated as "is the reordering observable through some input", with co-holdability as the usual but not the only route; PROP-CLS-02(a)'s third row (`unknown` > every lower) is reclassified from a co-holding fixture to an order-observing one, since rungs 3/5 cannot be *evaluated* at all under `A0 = absent` |

No High or Medium findings remain open after this revision. All eleven round-2 findings (1H/0M/2L PM,
0H/0M/8L SE) are disposed above, each at the site the review named.
