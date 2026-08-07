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

_(pending)_

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
