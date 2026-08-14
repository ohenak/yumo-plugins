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
