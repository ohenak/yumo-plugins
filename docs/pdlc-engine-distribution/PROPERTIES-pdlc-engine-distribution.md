# PROPERTIES — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → PLAN → **PROPERTIES**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.11), `FSPEC-pdlc-engine-distribution.md` (v0.5), `TSPEC-pdlc-engine-distribution.md` (v0.12), `DECISIONS-pdlc-engine-distribution.md` (v0.3), `PLAN-pdlc-engine-distribution.md` (v0.6) |
| Downstream | IMPL tests — the test files named in PLAN §2's `Test File` column and §3's ownership manifest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft in review (Phase PT) | Claude | 0.1 | 2026-08-14 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft |

## 1. Scope, derivation and reading rules

This document states the properties the implementation must satisfy. It is derived from REQ's six
requirements (`REQ-EDIST-01`…`REQ-EDIST-06`) and their acceptance criteria, FSPEC's business rules
and its `AT-` acceptance tests, TSPEC's oracle designs, and PLAN's task table. It adds no scope:
**every property below is carried by a task that already exists in PLAN §2, and names a test file
that already appears in PLAN §3's ownership manifest.** Where a property has no carrier, §5 says so
in those words rather than implying one.

**Reading rules.**

1. **Identifiers.** `PROP-{DOMAIN}-{N}`, with `{DOMAIN}` one of `LAUNCH`, `INSTALL`, `PACK`, `PUB`,
   `PROV`, `VER`, `CAT`, `GATE`, `REGR`. Numbers are stable; a withdrawn property keeps its number
   and is marked withdrawn rather than being reused.
2. **Citations.** Per `DEC-DOC-01` (`docs/_decisions/DECISIONS-review-severity-bars.md`), citations
   name **stable content** — an exported symbol, a heading, a spec id — not a line number. A
   `file:line` anchor appears only where the *position* is itself the claim under test (PLAN §2's
   `run.test.js` restatements and `build-runtime.mjs`'s two generated closures are the only such
   cases, and each is marked).
3. **Expected-set ownership.** Where a property asserts a set equality, the expected side has exactly
   one named owner and the test *transcribes* it. Per REQ v0.11's `AC-1.3` split: the packed set's
   **member names** are owned by TSPEC §5.4's `PK-*` table, and its **classes and per-class counts**
   by FSPEC §5.2. No property derives an expectation from the artifact under audit — a self-derived
   expectation is what `BR-8.1` forbids and what makes an equality vacuous.
4. **Fixture strings are verbatim.** Where a property names a literal — a message id such as
   `env.plugin-root-ignored`, a remedy string, a job name, an `Engine` column header — the fixture
   uses the normative spelling from the owning document, never a paraphrase.
5. **Test level** is one of Unit, Integration, or Machine. **Machine** means a leg that only runs on
   the fixture machine workflow (`.github/workflows/fixture-machine.yml`, T50) or a `[manual]`
   recorded observation (T51, T52, T56); it is called out because a Machine-level property is not
   observed by `cd pdlc/engine && npm test`.

**Two invariants of the existing suite constrain every property here, and both are verified at
HEAD.**

- **The message catalogue is set-equal in both directions.** `checkMessageCatalogue` in
  `pdlc/engine/__tests__/_assert-suite-wide.mjs` compares the ids `messageIds()` registers against
  the ids the run emitted and pushes a failure for *either* `emitted message id "…" not registered
  in messageIds()` or `registered message id "…" never emitted` (read at HEAD). So no property may
  ask for a registration without also asking for an emission in the same task — see `PROP-CAT-1`.
- **The injection key lists are a hand-maintained mirror.** `TSPEC_3_1_DEV_SEAMS` and
  `TSPEC_3_1_QUEUE_SEAMS` in `pdlc/engine/__tests__/seam-contract.test.js` are frozen literal key
  lists compared by `deepEqual` against `devInjection` and `queueInjection` (`pdlc/engine/lib/run.mjs`).
  Adding `_provenance` reddens them, which is why `PROP-PROV-9` states the mirror as a property
  rather than leaving it to be discovered.

**Preservation floors.** Five engine test files are *extended*, not created. Their HEAD test counts,
measured by the runner and recorded in PLAN §5.1 / §7 item 2, are floors that must survive the
deletion they guard: `engine-config.test.js` ≥ 9, `run.test.js` ≥ 21, `skills-composition.test.js`
≥ 32 from ≥ 14 `test(` call sites, `ci-arrangement.test.js` ≥ 6, `seam-contract.test.js` ≥ 12. Each
floor is stated as a property (`PROP-REGR-1`) with a **positive-presence** conjunct — the named HEAD
assertions are present in the file *and* execute — because a count alone is satisfiable by padding.

## 2. Property catalogue

### 2.1 PROP-LAUNCH — launcher resolution and refusal (REQ-EDIST-01)

| Id | Property | Category | Level | Traces | Carrier (task → file) |
|---|---|---|---|---|---|
| PROP-LAUNCH-1 | With no engine version installed, an invocation **must refuse** with a message that (a) names the store root it searched, (b) names the reason id `store.empty`, and (c) exits non-zero with the pipeline's own refusal code — never a bare `!= 0` against an unstated baseline. | Error Handling | Unit | AC-1.1, AT-1.1, TSPEC §6.2 | T15, T14 → `version-doctor.test.js`, `launcher.test.js`; T46 → `bin/cli.mjs` |
| PROP-LAUNCH-2 | A pin naming a version outside the declared compatibility range **must refuse** with text that is **positively distinguishable** from PROP-LAUNCH-1's: each refusal is pinned by a positive substring assertion (the range on both; additionally the version found on this one) **and** the two strings are asserted `notEqual`. "Both non-empty" is not the oracle. | Error Handling | Unit | AC-1.1, AT-1.2 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-3 | An unparseable plugin manifest **must refuse** naming both the plugin root and the parse failure, and the assertion **must pin that the text is not the "none installed" message** — an absence-free discriminator between two refusal states that would otherwise be interchangeable. | Error Handling | Unit | BR-1.3, AT-1.4 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-4 | `--version` and `doctor` **must resolve but never refuse**: in all three states — pinned repo, empty store, unreadable config — the process exits `0` and reports a triple. Pinned reports the resolved triple with `mode: "pin"`; empty store reports the launcher's own triple with `mode: "unresolved"` and carries the refusal text as a **notice**; corrupt config under `doctor` prints ladder branch 0's text. Exit `0` is asserted as the exact value in each. | Contract | Unit | DEC-EDIST-07, AT-1.3, TSPEC §6.5 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-5 | The version triple a run *reports* **must equal** the triple it *banners* and the triple its run report carries — asserted as a three-way equality within one run, not as three independent shape checks. | Contract | Integration | AC-1.4, AT-1.6 | T15 → `version-doctor.test.js`; T46 |
| PROP-LAUNCH-6 | The launcher hop **must pass the child through verbatim**: a numeric child `status` is re-raised unchanged, stdout and stderr arrive unmixed, and a signalled child exits **exactly `128 + signum`** — the exact arithmetic, never "non-zero". Descriptor-level assertions (path, argv, env marker) run against the S-3 double; the pass-through and signal legs run against a **real spawn**, because `spawnSync` reports a signalled child as `status: null` and a double cannot falsify the arithmetic. | Contract | Unit + Machine | AC-2.1, AT-1.1, AT-2.1, DEC-EDIST-06 | T14 → `launcher.test.js`; T46; T50 (real-spawn legs) |
| PROP-LAUNCH-7 | `bin/pdlc.mjs` **must remain dependency-free**, asserted structurally over its source: **zero** static `import` declarations, **exactly three** non-comment top-level statements, and **zero** `await` tokens in the comment-stripped source. This is a positive triple of exact counts, not "does not import much". | Contract | Unit | AC-2.4, DEC-EDIST-09, AT-2.5, TSPEC §9.3 | T13 → `bin-guard-structure.test.js`; T45 |
| PROP-LAUNCH-8 | `bin/cli.mjs` **must export `main(argv, deps)` and a five-key `deps`**, and **importing it must run nothing**: the inert-import leg asserts a capture count of `=== 0` before any other assertion, and the exported `deps` key set is asserted by set-equality plus five `===` value pins. | Contract | Unit | DEC-EDIST-09, AT-2.5 | T45, T47 → `provenance-path.test.js` |

**Why the counts are stated exactly.** PROP-LAUNCH-1, -2 and -6 are the properties most exposed to
the absence-only failure mode: a refusal that merely "fails" is satisfied by any crash, including the
stack trace `AC-2.4` forbids. Each therefore carries the three positive conjuncts the oracle rule
requires — exact exit status, named reason id, and the operator-visible text pinned by substring.

### 2.2 PROP-INSTALL — install, upgrade and coexistence (REQ-EDIST-02)

### 2.3 PROP-PACK — package composition and the anti-fork oracle (AC-1.3, O-10)

### 2.4 PROP-PUB — tag-driven gated publish (REQ-EDIST-03)

### 2.5 PROP-PROV — provenance in artifacts (REQ-EDIST-04)

### 2.6 PROP-VER — version resolution, pinning and dev mode (REQ-EDIST-05)

### 2.7 PROP-CAT — message catalogue and announcement invariants

### 2.8 PROP-GATE — capability gating and skip accounting

### 2.9 PROP-REGR — non-regression of the plugin and bundle channels (REQ-EDIST-06)

## 3. Negative properties

## 4. Coverage matrix — acceptance test → property → task → test file

## 5. Requirement coverage and declared gaps

## 6. Falsifiability audit

## 7. Test-level distribution

## 8. Open questions
