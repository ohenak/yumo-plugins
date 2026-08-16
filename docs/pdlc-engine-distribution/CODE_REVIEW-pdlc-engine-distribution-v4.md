# CODE REVIEW — pdlc-engine-distribution (v4)

| Field | Detail |
|---|---|
| Feature | pdlc-engine-distribution |
| Branch | feat-pdlc-engine-distribution |
| Review version | 4 |
| Date | 2026-08-16 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 86.52% (`pdlc/workflows/build-runtime.mjs`) |
| Requirements traced | 26/30 |

**On the version number.** The dispatch named this review `v1`. `CODE_REVIEW-…-v1.md`,
`-v2.md` and `-v3.md` already exist and are **tracked on this branch**; the review history is
append-only by the same discipline that governs cross-reviews, so writing to `v1` would have
destroyed a committed artifact rather than added one. This is `v4`. Its **scope is a full
six-criteria scan**, not v2/v3's delta re-verification — the dispatch asked for a challenge that
assumes nothing is done, so nothing was carried forward on trust.

**Suites executed this round.** `pdlc/engine`: **825 tests, 823 pass, 0 fail, 2 skipped**
(`PDLC_LIVE=1` opt-ins). `pdlc/workflows` under `npm run test:coverage`: **4524 pass, 1 fail,
70 skipped**. The one failure is `documentOracles.test.js:246`
(`coveredViolations(LIVE_ROOT)`), re-confirmed mechanically this round as the known
local-environment false red: every path it reports is untracked
(`git ls-files --error-unmatch .serena/cache/typescript/raw_document_symbols.pkl` →
`Did you forget to 'git add'?`), and the set is `.claude/worktrees/`, `.serena/cache/`,
`.tokensave/`. Not a defect, and green in CI.

---

## §1 Code Quality Findings

*(Criteria 1–4. No violations.)*

- **Criterion 1 — stubs.** No `TODO`/`FIXME`/`HACK`/`XXX`/`NotImplementedError`/"not
  implemented" in production code. Every `stub`/`fake`/`mock` token under
  `pdlc/engine/{bin,lib,scripts}` is either a comment describing a *test double the caller
  injects* or lives in `scripts/fixture-machine.mjs`, which **is** the T50 harness
  (`LADDER_STUB_PREFIX`, `writeStubStoreEntry`) — test infrastructure by construction, not a
  hollow production path. Bodies were read, not just names.
- **Criterion 2 — unwired integrations.** No placeholder URL (`localhost`, `example.com`,
  `http://`) anywhere in `pdlc/engine/{bin,lib,scripts}` or `publish.yml`. Every
  `process.env` read is an **injectable default parameter** (`env = process.env`), so each
  integration point has a seam a test can drive; `catalogue.mjs:185`'s `PDLC_TEST_RUN_DIR`
  observation sink is documented, inert outside the suite, and load-bearing for
  `_assert-suite-wide.mjs`'s catalogue set-equality.
- **Criterion 3 — mock/fake data.** None in production code.
- **Criterion 4 — coverage.** `test:coverage`'s stage 2
  (`c8 report --check-coverage --per-file --branches 85 …`) enforces the floor DoD names, per
  module. Measured this round: `build-runtime.mjs` **86.52%**, `orchestrate-dev.js` **88.19%**,
  `orchestrate-queue.js` **91.21%** branch — all ≥85%. Criterion 4 passes on measured numbers.

---

## §2 Requirements Traceability

*(Full re-trace. Only rows with a gap, plus the rows that establish the gap, are listed; the
remaining 26 rows trace to both an implementation path and a test that would fail if the
implementation broke, and are unchanged from v1–v3.)*

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-2.1 | Documented install command ⇒ CLI on `PATH` at the expected version, reporting the AC-1.4 triple | `pdlc/README.md:153-156`; published `@kaneho/pdlc-engine@0.1.0` | `fixture-machine.mjs:459-507` — installs a **locally packed HEAD tarball**, never the registry | **YES** | high | Local |
| 2 | REQ AC-2.2 | Documented upgrade command ⇒ both consumer repos execute N+1 | `pdlc/README.md:154` (`npm i -g @kaneho/pdlc-engine@latest`) | `fixture-machine.mjs:510` `upgradeInstall` — same local tarball, so N and N+1 are two installs of one build | **YES** | high | Local |
| 3 | REQ AC-4.4 | Anti-echo: pair changes on a plugin change **and reverts** on revert | `lib/handshake.mjs` `readPluginVersion` | `version-doctor.test.js:359` covers the *change* half only; the **revert** half rests on `EVIDENCE-AT-4.4.md`, a one-time observation with no regression guard | **YES** | medium | Local |
| 4 | REQ AC-6.2 | Both channels distinguishable per run; load root observed run-bound | `lib/provenance.mjs`, `lib/run.mjs` | `run.test.js`, `workflow-roots.test.js` cover the engine half; the **bundle-side run-bound** half rests on `EVIDENCE-AT-6.2.md` | **YES** | medium | Local |

**Rows 1–2 are the finding of this round, and they are new.** They are the criterion-5
"trace to the final operator-visible artifact, not the node output" check firing exactly as
designed, and no earlier round performed it.

The final operator-visible artifact for REQ-EDIST-02 is **the package the documented command
installs**, not the tree. That package is `@kaneho/pdlc-engine@0.1.0`, published from tag
`engine-v0.1.0` at commit `30773d0cf5399b5c2191ea0d76a29851cb99e09f`
(`EVIDENCE-BR-3.9.md`). Since that tag, the **packed members** moved:

```
$ git diff --stat engine-v0.1.0..HEAD -- pdlc/engine/bin pdlc/engine/lib \
      pdlc/engine/scripts/postinstall.mjs pdlc/engine/package.json
 pdlc/engine/bin/cli.mjs       | 368 ++++++++++++++++++++++++++++++++++++++++--
 pdlc/engine/bin/pdlc.mjs      |   8 +-
 pdlc/engine/lib/catalogue.mjs |  14 ++
 pdlc/engine/lib/startup.mjs   |  24 ++-
 4 files changed, 400 insertions(+), 14 deletions(-)
```

`bin/cli.mjs` went **705 → 1051 lines**. The commits in that window are not cosmetic — they
are T41, T43, T45, T46, T48, T50 (`WORKFLOW_MODULE_URLS`, `UpdateProbe` S-4, the `bin/pdlc.mjs`
guard, `bin/cli.mjs` itself, the production carrier wiring, the fixture-machine legs) plus
`fix(engine): route --version and doctor through runVersionDoctor`, `fix(engine): thread
devDeclared through resolution state`, `feat(engine): add store, location and resolved-child
marker`, `fix(engine): wire resolution provenance`, `fix(engine): announce the empty-store arm`
and `fix(engine): redact the credential on the publish failure path`.

**`pdlc/engine/package.json` still declares `"version": "0.1.0"`.** So:

- an operator following `pdlc/README.md:154` today installs an engine **missing** the pin
  ladder, the doctor routing, the launcher hop, the resolution-provenance wiring and the
  empty-store announcement — i.e. missing the operator-visible behaviour AC-1.4, AC-5.1,
  AC-5.2, AC-5.3, AC-5.4, AC-5.5 and AC-5.6 are about;
- **nothing in either suite observes the registry.** Every fixture-machine leg calls
  `setUpTempPrefixInstall()`, which `npm pack`s the working tree
  (`fixture-machine.mjs:459-507`) and installs *that*. The green install/upgrade evidence is
  evidence about HEAD's bytes, not about the artifact the documented command resolves. That is
  precisely the "verified the builder output, not the shipped artifact" shape;
- the registry's immutability still holds (C-7 is **not** violated — npm will refuse a
  re-publish of `0.1.0`, and `publish-preflight.mjs` pins tag ≡ `package.json` version), so
  the defect is not a corrupted release. It is that **HEAD's bytes claim a version number that
  already names different, older bytes**, and every provenance value HEAD emits
  (`engineVersion: 0.1.0`, AC-4.1/AC-4.3) is therefore ambiguous against the published one —
  the regime-ledger ambiguity this feature exists to close, reproduced one axis over.

This is not a novel standard being applied late: **REQ NG-5's own recorded exception applies
exactly this reasoning to the plugin axis** and acts on it — "*The plugin's version of record
was bumped with it (`plugin.json` 0.23.0 → 0.23.1) … so changed plugin bytes never again ship
under a version number that already named different bytes*". The engine axis has the identical
skew, larger in magnitude, with no bump and no note.

**Required fix (for the remediator, not performed here):** bump
`pdlc/engine/package.json`'s `version` past `0.1.0`; either qualify the
`### Headless engine (npm)` block the way the sibling plugin block is already qualified
(see §3-2), or cut the successor tag so `@latest` resolves to feature-complete bytes. A
guard that reds when packed-member bytes change without a version bump would make the class
non-recurring, but is design work, not a required fix.

---

## §3 Integration-Boundary Findings

*(Criterion 6. Three findings.)*

| # | Kind | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Adjacent-surface falsification | high | `pdlc/engine/package.json` (`"version": "0.1.0"`); `pdlc/README.md:154`; `docs/pdlc-engine-distribution/EVIDENCE-BR-3.9.md` | Three surfaces jointly assert that `@kaneho/pdlc-engine@0.1.0` is *this feature's* engine. The post-tag diff in §2 falsified that: `0.1.0` names the pre-T41/T43/T45/T46/T48/T50 build. `EVIDENCE-BR-3.9.md` is an accurate record of what the tag was cut against and must not be edited; the falsified surfaces are the unbumped manifest version and the unqualified README command. | Bump `pdlc/engine/package.json`'s version; record in the REQ NG-5 note (which already carries the plugin-side twin of this reasoning) that the engine's number moved for the same reason. | Local |
| 2 | Sibling omission | low | `pdlc/README.md:148-156` | Within one document family, the `## Install in another repo` block carries an explicit pre-merge caveat — "*Until this work merges, install from the local checkout instead*" — while the `### Headless engine (npm)` subsection **this feature adds directly beneath it** carries no equivalent, although the same pre-merge condition holds and is the mechanism of finding 1. One member of a two-member family is handled; the sibling is not, and is not declared out of scope in the REQ. | Add the parallel caveat, or make it unnecessary by publishing the successor version. | Local |
| 3 | Unbound deferral | medium | `docs/ideas/halt-hardening-followups.md:1-72` (added on this branch, `75782278`) | The file is self-declared deferred work — "*Status: **ideas only — not built.*** … captured for a 0.23.1-class pickup" — and names two hardening items with regression-test candidates. There is **no queue row** for it in `docs/_queue/QUEUE.md` and **no successor REQ** anywhere under `docs/`; a prose backlog file is explicitly not a successor. It is additionally an **unowned diff**: `grep` for `halt-hardening` and `docs/ideas` over this feature's PLAN and TSPEC returns nothing, so no task in this feature's ownership manifest claims it. | Either add a `docs/_queue/QUEUE.md` row (or a successor REQ) binding the two items, or move the file out of this branch so it is not this feature's unbound deferral. | Cross-Feature |

**Adjacent-surface sweep performed.** For each output this feature writes: the packed tarball
(one writer — `prepack.mjs`, re-asserted over the real tarball inside the publish job by
PROP-PUB-10); the pairing record in the published manifest (**single writer by O-6 design**,
`publish.yml`, verified — no second writer of `pdlcPairing` exists); the run report's
provenance block (`lib/provenance.mjs` constructs, `lib/run.mjs` renders — no later stage
overwrites; `provenanceCommits`/`provenanceQueueRow`/`runtimeProvenanceWiring` tests pin the
committed artifacts, not the builder value). No clobbering writer found.

**Same-shape family sweeps performed.** Required-check membership: `pr-tests.yml` (5 jobs) +
`fixture-machine.yml` (1) = FSPEC §5.1's six rows, mechanically bound by
`ci-arrangement.test.js`'s file-scoped derivation, which also now pins `CLAUDE.md`'s table —
v3's §3-2/§3-3/§3-4 citation family is **verified swept** this round (`pr-tests.yml:76-80` and
`ci-arrangement.test.js:296-300` both now read "two stages … declared floor enforced in
aggregate and branch ≥85% enforced per module"; `PROPERTIES:233` PROP-GATE-5 now names row 6
explicitly). v3's §3-1 (`publish-preflight.mjs:113`) survives verbatim but is **count-free**
("the §5.1 gate jobs' combined result") and therefore not falsified by the widening — not
re-raised. README install-command family: two members, one caveated, one not — finding 2.

**Deferral binding, remainder.** The three deferrals this feature *owns* are all still
bound: N-1 → `pdlc-plugin-retirement` (QUEUE row 5), D-DIST-06 → `pdlc-release-ci`
(row 8, `blocked`), D-DIST-07 → `pdlc-engineering-loop` (row 6, conditional re-open recorded
in the queue note). Finding 3 is the one unbound deferral, and it arrived on this branch
without an owning task.

---

## Notes for the remediator

1. **Findings §3-1 and §2 rows 1–2 are one defect with one fix.** Bumping
   `pdlc/engine/package.json`'s version is the whole of it on the code side; §3-2 is the same
   defect's documentation half and should land in the same commit.
2. **Do not edit `EVIDENCE-BR-3.9.md`.** It is a dated one-time record of a real publish and is
   accurate about what it observed. The stale surface is the manifest version, not the record.
3. **Finding §3-3 is a scope question before it is a fix.** If
   `docs/ideas/halt-hardening-followups.md` belongs to `pdlc-halt-hardening` rather than here,
   the cheapest correct resolution is a queue row, not a rewrite.
4. **Rows 3–4 of §2 (AC-4.4 revert, AC-6.2 bundle-side) are spec-acknowledged** — PLAN §2
   records AT-4.4 as a one-time observation, TSPEC §7.3 records AC-6.2's second half. They are
   reported for completeness, unchanged from v3, and no remediation is expected for them.
5. **The one red workflows test is environmental, not yours.** `documentOracles.test.js:246`
   reports 27 untracked local paths (`.claude/worktrees/`, `.serena/cache/`, `.tokensave/`).
   Confirm with `git ls-files --error-unmatch` before touching any code.
