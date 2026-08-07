# DECISIONS — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` |
| Downstream | `PLAN, PROPERTIES, IMPL` |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{N}.md` (while active) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-06 |

## 1. Context

The *do* of this feature is captured in `TSPEC-pdlc-consolidation-agent.md` and, shortly, in code.
This document captures the **didn't do, and why** — seven choices where a real alternative was
weighed during TSPEC authoring and review, each of which a future agent will otherwise reconsider
confidently and cheaply, because in every case the rejected alternative is the one that *looks*
obvious from the outside.

Two properties of the shipped runtime are the standing constraint behind most of them, and are
stated once here rather than in each entry:

- **The workflow runtime has no `process`, no `fs`, no `import`, no `fetch`** (`CLAUDE.md`,
  "Workflow scripts and the runtime build"; enforced by `pdlc/workflows/build-runtime.mjs` and
  asserted by `pdlc/workflows/__tests__/runtimeBundle.test.js`). Every OS capability the pass needs
  is therefore an `agent()`-transported seam declared in `pdlc/workflows/runtime-adapter.js`, and
  "add a seam" always means "add an agent prompt", never "call an API".
- **The adapter's verb set is small and closed.** At HEAD it ships exactly `rtWriteFile`
  (`runtime-adapter.js:802`), `rtAppendFile` (`:863`), `rtListFiles` (`:905`), `rtGit` (`:945`),
  `rtGhRun` (`:995`), `rtRunCommand` (`:1034`), `rtReadFile` (`:493`), `rtCheckFile` (`:817`),
  `rtHashFile` (`:613`) and `rtMergeWorktree` (`:1060`), wired through `rtDevInjections` (`:1086`).
  `grep -nc "unlink\|rm -f\|rmdir" pdlc/workflows/runtime-adapter.js` returns **0** at HEAD: there
  is no file-removal verb anywhere in reach. DEC-CONS-04 and DEC-CONS-07 both fall out of that
  measurement.

Project-level decisions read before writing this document: `docs/_decisions/DECISIONS-plugin-distribution.md`
(DEC-DIST-01, the runtime's limits are binding, not worked around), `DECISIONS-test-oracle-mechanics.md`
(DEC-ORACLE-02, an uninstrumentable path is recorded, never worked around; DEC-ORACLE-03, one canonical
double per gate), `DECISIONS-spec-layer-boundary.md` (DEC-LAYER-01) and
`docs/_constraints/DOMAIN-CONSTRAINTS.md` DC-08 (a deferral needs a named successor surface) and DC-10
(every decision carries a `Testability:` line). Nothing below contradicts any of them; DEC-CONS-02 and
DEC-CONS-07 are direct applications of DEC-DIST-01 and DEC-ORACLE-02 respectively.

## 2. Decision index

| ID | Decision, in one line | Reversibility | Load-bearing on |
|---|---|---|---|
| DEC-CONS-01 | The credential seam returns `boolean`, and the secret reaches `git`/`gh` only by shell expansion | easy (seam is new; nothing consumes a value) | NFR-2, AC-4.2 |
| DEC-CONS-02 | Reuse `resolveAdvisoryRung` (`orchestrate-dev.js:1833`) by adding an optional `skill` parameter | hard (edits a guard-set file every advisory dispatch reads) | AC-1.5, AC-1.6 |
| DEC-CONS-03 | Clone from `git remote get-url origin`, never from the working-tree path | easy (one seam argument) | AC-3.8 |
| DEC-CONS-04 | The marker take is observe-then-write (`_checkFile`, `_readFile`, `_writeFile`); no atomic take exists | one-way door at this layer (no `O_EXCL` transport) | AC-1.3 |
| DEC-CONS-05 | Two corpus enumerations pinned literally on each side; only the **predicate** is held equal by a differential test | hard (relaxes a REQ clause; raised as an erratum) | AC-1.1, AC-1.2, NFR-5 |
| DEC-CONS-06 | Widen `rtWriteFile`'s prompt alone to resolve an absolute path verbatim; leave `rtReadFile` untouched | hard (shipped seam every phase writes through) | AC-3.1, AC-3.8 |
| DEC-CONS-07 | Release is `_writeFile(markerPath, "")`; `_checkFile`'s `file_empty` is read as **absent** | one-way door while no removal verb exists | AC-1.3 |

Entries are numbered in the order the TSPEC weighed them (`TSPEC §13.1` rows 1, 2, 4, 5, 6, 11, 13);
that section's remaining rows are dispositioned in §10 below rather than promoted here.

## 3. DEC-CONS-01: The credential seam returns a boolean, never the secret

**Context.** AC-4.2 resolves the PR credential from the environment variable named by
`consolidation.credentialEnv` (default `PDLC_PLUGIN_REPO_TOKEN`), and NFR-2 requires that its value
"never appears in a log, PR body, artifact, or notification". The runtime has no `process`, so the
variable can only be reached through a new adapter seam — and every adapter seam is an `agent()`
dispatch whose prompt and reply are transcript.

**Decision.** The seam is `_envPresent(name) => Promise<boolean>` (TSPEC §5.3). Its adapter,
`rtEnvPresent`, transports `[ -n "${NAME:-}" ] && echo PRESENT || echo ABSENT` and returns `true`
iff the reply is exactly `PRESENT`; any other reply, including an unparseable one, is `false`. The
credential's **value** never enters the JS process: it reaches `git` and `gh` by shell expansion
inside the transported command (TSPEC §9.2).

**Alternatives considered.**

- **`_readEnv(name) => Promise<string>`, the obvious shape** — rejected. Every existing adapter seam
  returns its payload through `RT.agent(...)`'s reply string (`rtReadFile:493`, `rtGit:945`'s
  `{ok, stdout, stderr}`, `rtGhRun:995`), so a value-returning credential seam would put the secret
  in the agent transcript *and* in a JS string that any later `_log` call could interpolate. NFR-2
  would then be a discipline enforced by review across every future call site, not a property of the
  interface. The code cost of the rejected form is *lower*, not higher — it is the same one-function
  adapter — which is exactly why it needs to be written down as rejected.
- **Redact at the logging boundary instead** (scrub the value out of `_log` output) — rejected: the
  transcript is written by the runtime, not by this module's `_log`, so the module has no boundary to
  scrub. There is no shipped precedent for a redacting log in either bundle.

**Constraints that forced this shape.** No `process` in the runtime (DEC-DIST-01); every seam is
agent-transported, so *reply text is disclosure*. Fail-closed is required by AC-4.3: an unparseable
reply must degrade to `credential-unavailable` and the AC-3.5 proposal-file fallback, never to a
claimed credential.

**Reversibility:** easy. The seam is new with this feature and has exactly one consumer; widening it
to return a value later is a one-function change. The reason to record it is that the *rejected*
shape is the cheaper-looking one.

**Re-evaluation triggers.** A runtime that grants in-process environment access (no agent
transport); a credential form that cannot be consumed by shell expansion (e.g. one requiring a
signed exchange before use); NFR-2 being narrowed to permit redacted logging of the value.

**Testability:** the positive and negative arms are both L1-observable through the doubled seam — a
`fakeEnvPresent` returning `true` / `false` / an unparseable reply drives the three arms of the
credential branch, and the assertion that no test double ever *receives* a credential value is
structural: the protocol's type has no string channel to carry one. The disclosure property is
asserted as absence-plus-positive per DC-10's sibling rule — every rendered log row carries a
`credential:` field from AC-4.2's closed three-value set, so the "never logged" assertion runs on a
path that demonstrably executed.

## 4. DEC-CONS-02: Reuse `resolveAdvisoryRung` by widening it, rather than restating the ladder

**Context.** AC-1.5 requires the pass to run on the advisory model rung and to report the rung it
actually ran on; AC-1.6 requires an explicit, never-silent downgrade. `pdlc-advisory-tier` already
ships exactly that ladder: `MODEL_ADVISORY` (`orchestrate-dev.js:1652`), `MODEL_ADVISORY_FALLBACK`
(`:1653`) and the exported resolver `resolveAdvisoryRung` (`:1833`), whose only shipped call site is
`runAdvisorySeam` at `:3132`. The resolver dispatches under one constant skill,
`ADVISORY_RUNG_SKILL = "se-review"` (`:1796`); the consolidation pass must dispatch under its own
skill.

**Decision.** Widen the resolver by one **optional, defaulted** destructured parameter —
`skill = ADVISORY_RUNG_SKILL` — and substitute it at the single `_agent(...)` call inside the
resolver's inner `dispatchAt`. The shipped call site passes no `skill` and is not edited.
`MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK` stay module-private and are not re-exported, so exactly
one ladder remains in the tree.

**Alternatives considered.**

- **Restate the two rungs in the consolidation module, behind a drift observable** — the escape
  hatch `docs/_constraints/pdlc-advisory-corpus-baseline.md` §3 explicitly sanctions — rejected. It
  creates the second copy of the ladder the resolver's own doc comment forbids in terms:
  "there is no second, private copy of this ladder anywhere" (`orchestrate-dev.js:1800-1801`). A
  drift observable detects divergence *after* it happens; the import prevents it. The claimed cost
  of the rejected form is not obviously higher — two constants and a `try`/`catch` — which is why the
  rejection needs recording.
- **Export the two model constants and let the pass build its own ladder** — rejected for the same
  reason, and it is strictly worse: it moves the failure mode from "two ladders that can drift" to
  "two ladders that *will* drift", because the fallback semantics (`isModelResolutionError`
  classification, the memoised `_state`, the halt on double non-resolution) would be re-implemented
  rather than shared.
- **Pass the skill positionally, or at each rung** — rejected on a mechanical property: `dispatchAt`
  is the resolver's sole dispatch site, and the memoised path and both ladder rungs all route through
  it, so threading the parameter through `dispatchAt` makes it structurally impossible for a pass to
  resolve on one skill and dispatch on another. Passing it per-rung reintroduces exactly that gap.

**Constraints that forced this shape.**

- `pdlc/workflows/orchestrate-dev.js` is under `MERGE_GUARD_DEFAULTS` (`:48`), so this edit is a
  self-modification-guard path: it can never be auto-merged, and it is one of three edits this
  feature makes to that one file (with the `gitWithLockRetry` export and the `mergeCommandFor`
  surfaces). That is a PLAN serialisation obligation, not a design choice.
- The resolver is **deliberately not `async`** and is `.then`-chained, because its shipped caller
  races the returned promise against a `_sleep`-built deadline and the microtask hop count is
  load-bearing (its doc comment states this at `:1820-1826`). Adding a defaulted parameter adds no
  hop; any refactor that makes the body `async` breaks a caller this feature does not otherwise
  touch.
- Reuse-by-inlining is the only mechanism available: the runtime forbids `import` entirely, and
  `build-runtime.mjs`'s `bundles` array (`:448`) reaches across modules only by concatenating whole
  module bodies. There is no third option (a shared artifact holding the resolver is not
  representable), which is why that sub-choice is *not* recorded as a decision — see §10.

**Reversibility:** hard. The bytes of the widened resolver live in **four** tracked artifacts once
this feature lands — the three at HEAD (`orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`, per
`pdlc/workflows/dist/distribution-manifest.json`) plus the new `consolidate-learnings` bundle — so
reverting means a coordinated rebuild, and CI's `Generated artifacts are in sync` job fails a partial
one.

**Re-evaluation triggers.** A third consumer needing a rung ladder with *different* rungs (at which
point the parameter should become a rung list, not a skill); the runtime gaining `import`, which
would make a shared artifact representable and retire the inlining constraint; the advisory tier
retiring `MODEL_ADVISORY` in favour of a per-seam model, which would move the decision from "which
skill" to "which model" and invalidate the defaulting scheme.

**Testability:** the widening is falsifiable at L1 in three places. (i) A regression asserting the
resolver called **without** `skill` dispatches `"se-review"` on the primary rung, the fallback rung
and the memoised path — this is the assertion that keeps the shipped call site's behaviour pinned
while a new parameter exists. (ii) A conjunct asserting the pass's own call dispatches its own skill
on all three of those paths, so "threaded to every path" is observed rather than argued. (iii) A
source-level assertion that the module declares exactly one rung ladder — no second model constant,
no second resolver — which is the observable form of "reuse, do not restate". The `_log`-emitted
`ADVISORY_MODEL_FALLBACK:` line (`:1858-1860`) is captured through an injected log collector, so the
AC-1.6 report obligation is asserted on real resolver output rather than on a re-rendered string.

## 5. DEC-CONS-03: The clone is cut from `origin`'s URL, not from the working-tree path

_(pending)_

## 6. DEC-CONS-04: The marker take is observe-then-write, not atomic

_(pending)_

## 7. DEC-CONS-05: Two enumerations, held by literal pins; one predicate, held by a differential

_(pending)_

## 8. DEC-CONS-06: Widen `rtWriteFile` alone to accept an absolute path

_(pending)_

## 9. DEC-CONS-07: Release writes `""`; `file_empty` is read as absent

_(pending)_

## 10. Alternatives considered but not recorded as decisions

_(pending)_

## 11. Consequences for downstream layers

_(pending)_
