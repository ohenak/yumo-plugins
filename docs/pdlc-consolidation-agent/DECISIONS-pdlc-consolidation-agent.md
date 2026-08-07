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
| DEC-CONS-01 | The credential seam returns `boolean`, and the secret reaches `git`/`gh` only by shell expansion | easy (seam is new; nothing consumes a value) | NFR-2, AC-4.2, **AC-4.3, AC-3.5** |
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
- **Redact at the logging boundary instead** (scrub the value out of `_log` output) — rejected for
  the *outbound* direction, and the rejection is narrower than an earlier draft of this entry
  claimed. What the module can emit through `_log` is derived only from values it holds, and it
  holds no credential value, so there is nothing for an outbound scrubber to catch; the agent
  transcript, where the value *would* be visible, is written by the runtime and is not a boundary
  this module owns. There is no shipped precedent for a redacting log in either bundle. The earlier
  wording "the module has no boundary to scrub" is withdrawn: the module does have an **inbound**
  boundary, and the paragraph below records what it leaves open.

**Residual: the failure-reply channel is inbound, and it is not closed.** Non-disclosure holds
structurally on the way *out* — the value never becomes a JS string (TSPEC §9.2, `TSPEC:1595-1601`).
It does **not** hold structurally on the way *in*. On a non-zero exit `rtGit` instructs the transport
agent to return "the LAST 300 characters of its **combined output**"
(`pdlc/workflows/runtime-adapter.js:951`), which `rtParseTransportReply` (`:967`) surfaces as the
`stderr` field (`:977`); `rtGhRun` (`:995`) parses through the same function (`:1006`) but asks its
agent for stderr only (`:1000`), so the combined-output arm is `rtGit`'s alone. This feature renders
that field: `enumerateCorpus` returns `{unlistable: true, detail: stderr}` (`TSPEC:618`, `:684`) and
§10.3 row 1a puts the "pathspec `stderr` in report body" (`TSPEC:1832`); `openClone` returns
`{failure, detail}` (`TSPEC:1522`) on the clone/push path, which is the **credentialed** one. So
non-disclosure on the inbound path is bounded by *what `git` prints on failure*, not by the seam's
interface, and no arm of the Testability line below observes that channel — both arms drive
`_envPresent` only.

Two things bound it, and neither closes it:

- The credential is passed to `git`/`gh` by *name*, not by value, so a credentialed argv element
  should not exist to be echoed back in a usage or error message. That is an obligation on the
  implementation, not a property of the seam — and it is not currently satisfied on one path, which
  is why the TSPEC erratum in §11.3 item 3 exists: `rtShellQuote` single-quotes every argv element
  (`runtime-adapter.js:668-670`), so a `$VAR` written into a `_git` argv element is passed
  **literally** and never expanded. A push that needs the token in argv therefore cannot get it by
  shell expansion through `_git`.
- The channel is truncated to 300 characters and only opens on a non-zero exit.

Recorded, per DEC-ORACLE-02, as a stated residual rather than asserted away — the same treatment
DEC-CONS-04 gives its unclosed race. NFR-2 is honoured **by construction outbound and by
implementation discipline inbound**, and the two must not be conflated.

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

**Testability:** three arms and two conjuncts, all executable — this codebase has **no type system**
to appeal to (`pdlc/workflows/` ships plain ES-module JS, checked only by jest; there is no tracked
`*.ts` and no `tsconfig.json` anywhere under `pdlc/`), so an earlier draft's "the protocol's type has
no string channel to carry one" is withdrawn: nothing would fail if a double returned a string.

1. **Branch arms.** A `fakeEnvPresent` returning `true` / `false` / an unparseable reply drives the
   three arms of the credential branch (`present (redacted)` / `local-gh` / `absent` +
   `credential-unavailable`, AC-4.2 and AC-4.3's degrade to the AC-3.5 fallback).
2. **Runtime type oracle, replacing the structural claim.** Across the whole case set, assert
   `typeof` every recorded `_envPresent` return is `"boolean"` — a real assertion that a
   value-returning seam would fail — **and** pin the transported command text at source:
   `rtEnvPresent`'s prompt interpolates the variable *name* only, never a value, asserted as an
   adapter-source read in the same style as DEC-CONS-06's pin.
3. **Set-equality on the `credential:` field, not containment.** AC-4.2's three values
   (`present (redacted)` / `absent` / `local-gh`, `REQ-pdlc-consolidation-agent.md:320-322`) are an
   enumerated contract, so the oracle is set-equality over the full enumeration: each of the three is
   observed at least once across the case set, and the observed value set is **exactly** equal to the
   declared set — deleting or renaming a value fails a test rather than silently shrinking coverage.
   This is what carries the "never logged" absence assertion onto a path that demonstrably executed
   (DC-10's sibling rule).

Not observed by any of these: the inbound failure-reply channel recorded above. It is stated as a
residual, not asserted — see §11.2's deliberately-unasserted list.

## 4. DEC-CONS-02: Reuse `resolveAdvisoryRung` by widening it, rather than restating the ladder

**Context.** AC-1.5 requires the pass to run on the advisory model rung and to report the rung it
actually ran on; AC-1.6 requires an explicit, never-silent downgrade. `pdlc-advisory-tier` already
ships exactly that ladder: `MODEL_ADVISORY` (`orchestrate-dev.js:1652`), `MODEL_ADVISORY_FALLBACK`
(`:1653`) and the exported resolver `resolveAdvisoryRung` (`:1833`), whose only shipped call site is
`runAdvisorySeam` at `:3132`. The resolver dispatches under one constant skill,
`ADVISORY_RUNG_SKILL = "se-review"` (`:1797`); the consolidation pass must dispatch under its own
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
  "there is no second, private copy of this ladder anywhere" (`orchestrate-dev.js:1802`). A
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

**Context.** AC-3.8 governs the shipping configuration, in which `consolidation.pluginRepository`
resolves to the same repository as the consuming repo. The guard-set edit must be made in a separate
clone under a temporary directory, and in the invoking tree the pass must perform **no branch
operation of any kind** — the tree may be mid-pipeline on a `feat-*` branch, and its HEAD must be
identical before and after the pass. A local clone source is available and free.

**Decision.** Read the clone source with `_git(["remote", "get-url", "origin"])` — a non-mutating
read of the invoking tree — and clone that URL:
`_git(["clone", "--depth", "1", "--single-branch", remote, dir])`. In the two-repo configuration the
source is `https://github.com/{pluginRepository}.git` instead. `git clone` checks out the remote's
default branch, which is what the FSPEC's "cut from the fetched default branch" asks for, so no
separate `fetch` is issued.

**Alternatives considered.**

- **`git clone {repoRoot} {dir}` — clone the working tree** — rejected, and it is the cheaper and
  more obvious call: no `remote get-url`, no network, faster. It is wrong because a local clone
  inherits the source's **local branches and its HEAD**, and AC-3.8's whole premise is that the
  invoking tree may be sitting mid-pipeline on `feat-*`. The clone would then be cut from that
  feature branch rather than from the default branch, and every promotion commit would be stacked on
  unmerged work. The defect is invisible in any test whose fixture repo happens to be on the default
  branch, which is precisely the fixture a first implementation writes.
- **`git worktree add` in the invoking repository** — rejected: it is a branch operation on the
  invoking tree's refs, which AC-3.8 forbids outright, and it shares the object store, so a failed
  push leaves refs behind in the operator's repository.
- **`git fetch origin` into the invoking tree, then clone/branch from `FETCH_HEAD`** — rejected: the
  fetch writes into the invoking tree's refs. AC-3.8 enumerates `fetch into its refs` in the
  forbidden set explicitly.

**Constraints that forced this shape.** AC-3.8's "no branch operation of any kind" in the invoking
tree; the FSPEC's requirement that the clone be cut from the *fetched default branch*; and the seam
verb accounting — `git remote get-url` is a distinct read verb (`read-remote`) and is admitted to the
invoking-tree verb set as its own member rather than folded into an existing one, so that a later
`git remote add` cannot pass the containment check by inheriting a neighbour's permission.

**Reversibility:** easy. It is one argument to one seam call. Recorded because the rejected
alternative is cheaper, more obvious, and passes the naive test.

**Re-evaluation triggers.** A repository with no `origin` remote becoming a supported configuration
(today an unresolvable `origin` is `repository-unresolved` and degrades to the AC-3.5 proposal-file
fallback); an offline/air-gapped consumer requirement, which would force a local clone source and
with it an explicit `--branch {defaultBranch}` and a HEAD-restoration obligation; `--depth 1`
becoming insufficient because a promotion needs history.

**Testability:** L1-observable through the `_git` double as an **argv-sequence** assertion. The
predicate partitions every recorded argv into **three** domains, not two — an earlier draft's
two-domain form ("no argv without a `-C {tempdir}` prefix is a mutating verb") was **red on correct
code**, because this entry's own Decision issues `_git(["clone","--depth","1","--single-branch",
remote, dir])`, which carries no `-C` prefix and whose verb `clone` is mutating. The clone is pinned
positionally, never exempted:

1. **Invoking-tree domain** — every argv with no `-C` prefix that is *not* the clone argv. Asserted
   by containment against the closed invoking-tree read-verb set (`read-object`, `read-remote`,
   `read-index`, per TSPEC §13.1 row 9); a `checkout`, `switch`, `stash`, `reset`, `rebase` or bare
   `fetch` fails by construction rather than by enumeration of known-bad calls, and DEC-CONS-04's
   "admits no mutating git verb at all" continues to hold of *this* domain exactly.
2. **Clone domain** — every argv whose first two elements are `["-C", dir]` where `dir` is the string
   `_makeTempDir`'s double returned. Its verb set is the closed clone-domain set; nothing here is
   checked against the invoking-tree set.
3. **The single `clone` argv** — asserted by **shape**, exactly once per pass, and pinned
   positionally: the argv equals `["clone","--depth","1","--single-branch", R, D]` where `R` is
   character-identical to the `remote get-url` double's reply (or, in the two-repo arm, to
   `https://github.com/{pluginRepository}.git`) and `D` is character-identical to `_makeTempDir`'s
   reply. Both trailing positions are pinned, so the destination cannot be a path inside the
   repository and the source cannot be the repository root path. Answering the reviewer's Q-01
   directly: the clone belongs to no verb set — it is its own case, and what pins its destination is
   the last-argument identity, not a permission.

The partition is total by construction: an argv that matches none of the three fails the assertion,
so a fourth kind of call cannot slip through unclassified. The two-repo arm is case 3 with
`pluginRepository` set, so the URL-construction branch is covered without a network.

## 6. DEC-CONS-04: The marker take is observe-then-write, not atomic

**Context.** AC-1.3 makes the in-progress marker the mutual-exclusion mechanism between two passes:
a second pass that begins while the marker is present and younger than
`consolidation.staleLockMinutes` exits `refused` with reason code `consolidation-in-progress`. A
mutual-exclusion mechanism naturally wants an atomic test-and-set.

**Decision.** The take is three separate seam calls and is **not** atomic:
`_checkFile(markerPath)` for presence, `_readFile(markerPath)` for the content `parseMarker`
consumes, then `_writeFile(markerPath, line)`. The race between two passes observing "free" and both
writing is **not closed**, and is recorded as unhandled rather than papered over. What bounds it is
elsewhere: every log write is one whole record appended at end of file (so two passes' records
interleave without loss), the PR route is keyed on `(failure-mode-id, action)` in the merged PR's own
trailer rather than on log state, and the residual exposure is a duplicate consuming-repo write the
FSPEC states as a known exposure.

**Alternatives considered.**

- **An exclusive-create seam (`O_EXCL` semantics: "create this file, fail if it exists")** — the
  correct primitive, and rejected because no transport can carry it. Every adapter seam is an
  `agent()` dispatch that returns *the agent's report of what happened*; an agent's report that the
  file did not previously exist is exactly as racy as this module reading it, because the check and
  the create are still two observations separated by the same window. Adding the seam would buy an
  atomicity claim that the transport cannot honour, which is worse than the honest three-call form —
  a reader would trust it.
- **`git`-mediated locking** (commit the marker, rely on index/ref atomicity) — rejected on two
  independent grounds: AC-1.3 requires the marker to live in the working tree only and never be
  committed by any pass (it is `.gitignore`d for exactly this reason), and the invoking-tree verb set
  admits no mutating git verb at all.
- **Derive presence from `_readFile(...) !== null`, collapsing three calls to two** — rejected here
  and re-rejected from the other end in DEC-CONS-07: it conflates the released (empty) marker with a
  present-but-unparseable one and would record `reclaimed-stale-lock` on every steady-state pass.

**Constraints that forced this shape.** No adapter transport offers exclusive create — the shipped
verb set is `rtWriteFile` (`runtime-adapter.js:802`), `rtAppendFile` (`:863`), `rtListFiles`
(`:905`), `rtGit` (`:945`), and the read/probe seams; none of them expresses create-if-absent. Per
DEC-ORACLE-02 (`docs/_decisions/DECISIONS-test-oracle-mechanics.md`), a path that cannot be
instrumented or guaranteed is **recorded**, never worked around, and that is what this entry does.
The stale-lock reclaim (`staleLockMinutes`, default 60) is the recovery for the other failure mode —
a pass that dies holding the marker — and it is load-bearing precisely because the pass calls the
model resolver bare, with no deadline of its own.

**Reversibility:** one-way door *at this layer*. Nothing in the pass can make the take atomic; only
a new runtime capability can. Reversible immediately above this layer if the runtime ever grants
in-process `fs`.

**Re-evaluation triggers.** The adapter gaining a real exclusive-create or lock verb; the runtime
gaining `fs`; consolidation ceasing to be serial (today `/loop` runs one tick at a time, so the race
requires an operator's manual invocation to collide with a tick); the residual duplicate write
becoming observed in practice rather than theoretical.

**On that last trigger's observability.** It is **operator-reported and un-instrumented** — no
monitor exists and none is added by this feature — and it is named here so no reader infers one from
the trigger's presence. What an operator or a later analyst can do *after the fact* is read the
durable log, and the detection signature is stated so the reading is mechanical rather than
intuitive: **two `.consolidation-log.md` records with distinct `passId`s carrying the same
`(failure-mode-id, action)` key**, which under serial operation cannot occur (a second pass sees the
first's record and NFR-4's duplicate suppression fires, `duplicate-suppressed`). That is a forensic
signature over an append-only artifact, not an alarm: nothing computes it, nothing raises it, and
nothing in this feature's test set asserts it. Instrumenting it would mean minting a log field the
vocabularies file does not carry, which REQ §4b reserves upstream — so per DEC-ORACLE-02 the gap is
recorded and the signature is written down, rather than a counter being invented to make the trigger
look watched.

**Testability:** the take's *shape* is asserted, since its atomicity cannot be. The seam double
records an ordered call log, and the assertion is that a take issues exactly the three calls in that
order with the marker path, and that `present` is read from the `_checkFile` result and never from
the `_readFile` result — the second conjunct is what keeps DEC-CONS-07 from being re-broken by a
refactor that "simplifies" the take. The race itself is deliberately **not** tested: there is no
oracle for it at any level available here, and writing a test that appears to cover it would assert
a property the code does not have. The mitigations *are* tested — append-only write granularity, and
the `refused` path writing its row and committing nothing.

## 7. DEC-CONS-05: Two enumerations, held by literal pins; one predicate, held by a differential

**Context.** REQ-CONS-01 adopts one "un-consolidated" predicate for both readers of the LEARNINGS
corpus — the `SessionStart` nudge hook and the pass — and closes step 1 with "keeping one enumeration
as well as one predicate" (`REQ-pdlc-consolidation-agent.md:115-116`). Two readers, one rule. The
shipped hook is a Python heredoc executed from bash (`pdlc/hooks/scripts/nudge-consolidation.sh:22`),
enumerating with `glob.glob(.../docs/*/LEARNINGS-*.md)` (`:28`) and testing with a bare substring
against the whole log (`:41`). The pass is a JavaScript workflow bundle.

**Decision.** Ship **one predicate, two enumerations**, with different kinds of evidence for each
half:

- The **predicate** (the two-region rule: consumed-block membership, or the legacy region preceding
  the first `<!-- pdlc:consumed` marker) is held **equal** by a differential test that feeds both
  implementations one basename list and one log text and asserts the same partition.
- The **enumerations** are held **pinned**, not equal: the JS side's `git ls-files` argv is asserted
  literally, including both `:(glob)` prefixes, and the hook's two glob patterns are asserted by a
  source-text read of its `CORPUS_GLOBS` declaration. Two literal pins, at two levels, in two files.

**The decision includes a corpus widening of the shipped hook, and the divergence set below is
stated relative to the *post-edit* hook, never to HEAD.** At HEAD the hook enumerates with a
**single** glob, `glob.glob(os.path.join(proj,"docs","*","LEARNINGS-*.md"))`
(`pdlc/hooks/scripts/nudge-consolidation.sh:28`), which does not reach `docs/completed/*/`. Measured
in this repository at HEAD that glob returns **2** paths while
`git ls-files --cached --others --exclude-standard ':(glob)docs/*/LEARNINGS-*.md'
':(glob)docs/completed/*/LEARNINGS-*.md'` returns **5** — the three `docs/completed/*` entries plus
`docs/orchestrate-dev-workflow` and `docs/pdlc-advisory-tier`. That gap is larger than classes (i)
and (ii) combined, and it is **not** a residual of this decision: it is closed by the decision, by
replacing `:28`'s single glob with the two-member `CORPUS_GLOBS` tuple and a comprehension over it
(`TSPEC §7.1:787-788`, scoped by `TSPEC:117`). Stating the two-class divergence set against the
pre-edit hook would be comparing the pass to a hook this feature does not ship; every claim below —
"two classes", "closed", "derivable from the two enumerations' own text" — is asserted against the
post-edit hook, whose two patterns are exactly the pass's two `:(glob)` pathspecs.

This **relaxes** `REQ:115-116` and is therefore not settled here: it is raised upstream as an
erratum against REQ and FSPEC (see §11), and this entry records what this layer ships if the
relaxation is accepted.

**Alternatives considered.**

- **One shared implementation** — the plain reading of "one enumeration", and rejected on cost
  measured against the actual files: the hook is Python inside a bash heredoc invoked by
  `${CLAUDE_PLUGIN_ROOT}` on `SessionStart`, and the pass is a bundle the runtime loads with no
  `import`. Sharing needs a **third** artifact plus a language boundary neither side has today, and
  it puts that artifact on a `SessionStart` path that must survive a machine with no Python (the hook
  already probes three interpreter candidates and exits 0 when none is found).
- **Assert enumeration set-equality** — rejected because it would be **red on correct code**. The two
  enumerations answer different questions about the same tree, and the divergence set is measured, not
  hypothesised: (i) a `.gitignore`d LEARNINGS file is in the hook's set and not the pass's
  (`glob.glob` sees ignored files unconditionally; the pass passes `--exclude-standard`); (ii) a file
  staged but deleted from the worktree is in the pass's set (`--cached` lists it) and not the hook's.
  The differential harness also feeds both sides one basename list, so it never observes an
  enumeration at all.
- **Enumerate with the `_listFiles` seam and walk `docs/*` and `docs/completed/*`** — rejected on a
  structural property of the shipped adapter, not on taste: `rtListFiles` filters directories out of
  its own output (`runtime-adapter.js:915`, `ls -p -A | grep -v '/$'`) and then rejects any reply line
  containing a `/` as unparseable (`:929-931`). The seam therefore **cannot** return a subdirectory
  name, so the walk finds an empty corpus in production while an in-memory `fakeListFiles` double
  hides it in every unit test — the production-path-≠-unit-path failure DC-07 names. `git ls-files`
  also returns the repository-root-relative paths the corpus type needs.
- **Leave the enumeration half to inspection** — an earlier draft's answer, withdrawn: with no pin on
  either side, a third divergence class could arise silently and no reader could derive the set.
- **Keep the hook's shipped count-above-threshold message as the differential oracle** — rejected,
  and this is what makes the predicate half real. The hook prints only when `n >= THRESHOLD`
  (`:25`, `THRESHOLD = 5`) and prints only a **count**, so it is blind on every fixture that
  discriminates the two-region predicate. The decision therefore carries a shipped-hook edit — and
  the honest cost of that edit is **three changes in one file**, not one line, because
  DEC-CONS-05's rejection of the shared-implementation alternative turns on relative cost and an
  understated accepted cost would corrupt the comparison:

  1. an **env-gated `PDLC_PENDING:` stderr write** — a guard plus a write, so at minimum two lines,
     not one;
  2. replacing `:28`'s single `os.path.join` glob with the two-member `CORPUS_GLOBS` tuple and a
     comprehension over it (`TSPEC §7.1:787-788`) — the corpus widening stated in the Decision
     above, which the REQ itself already lists as an in-scope edit (`REQ:115`);
  3. scoping `:41`'s predicate to the two regions (`TSPEC:117`), which is the change that makes the
     hook's rule the *same* rule as the pass's.

  All three land in a Python heredoc inside a bash script CI already `bash -n`s and whose
  `SessionStart` robustness budget (no git, no Python, not a repository ⇒ exit 0) is unchanged by any
  of them, so the edit remains cheap relative to a third shared artifact — which is the comparison
  that matters. It is not *one line*, and §11.1 row 6 states the same three, so the two sections
  agree. (Reviewer Q-02: three changes, one file, one owning task.)

**Constraints that forced this shape.** The `_listFiles` seam's structural limit above; the runtime's
no-`import` rule, which forecloses a shared module; the hook's `SessionStart` robustness budget
(no git on `PATH`, no Python, not a repository — it must exit 0 in all three); and DC-07's rule that a
test double must not make a production-impossible path look green.

**Reversibility:** hard, and the hard part is upstream, not in code. Closing divergence class (i) is
**one flag**: drop `--exclude-standard`, and an ignored LEARNINGS file becomes corpus. Measured at
HEAD, that flag is *not* what excludes `docs/discarded/` — `git ls-files --cached --others` with the
two `:(glob)` pathspecs returns the same five paths with or without it, while dropping `:(glob)`
returns seven and re-admits `docs/discarded/pdlc-rcv-budget-stop/` and
`docs/discarded/pdlc-review-convergence/`. So the price of closing class (i) is exactly "an ignored
LEARNINGS file is corpus", and nothing else. The two directions are **not** symmetric: the hook has
no `--exclude-standard` to drop, so answering the upstream question "yes, an ignored LEARNINGS file
is corpus" strictly *reduces* the divergence set, while "no" keeps it. Class (ii) is not closable at
this layer — closing it means putting a `git` invocation on the `SessionStart` path.

**Re-evaluation triggers.** REQ/FSPEC answering the ignored-file question (a "yes" makes this entry
obsolete for class (i)); a third divergence class being observed, which would falsify the claim that
the pins make the set derivable and closed; the hook being rewritten in a language the bundle can
share; `_listFiles` gaining directory enumeration, which would remove the reason `git ls-files` was
chosen.

**Testability:** three named oracles, at three levels. (1) The predicate differential: one basename
list plus one log text through both implementations, asserting the same partition — this is the "one
predicate" claim, and it is only observable because of the `PDLC_PENDING:` stderr edit above.
The differential invokes the hook **end-to-end** — a real `bash`/`python3` subprocess reading the
`PDLC_PENDING:` channel (`TSPEC §11.3`'s L4 row, `consolidationHookParity.test.js`) — never a
re-implementation of the hook's predicate inside the test, which would make the "one predicate" claim
unfalsifiable (reviewer Q-03).
(2) The JS enumeration pin: a literal-argv assertion at L1, both `:(glob)` prefixes included, so any
change to the pathspec is a deliberate test edit. (3) The hook enumeration pin: an L3 source-text read
of the `CORPUS_GLOBS` declaration — stated over the *declaration*, never a line number, plus the
conjunct that `glob.glob(` occurs in the file exactly once and inside that comprehension, so a third
pattern cannot enter through a second call site (`TSPEC:793-796`). Together, and **only against the
post-edit hook**, they make the divergence set **derivable from the two enumerations' own text**,
which is the property that lets §10.4's two classes be stated as closed rather than as "the ones we
happened to think of". The residue is stated, not asserted away: class (i)
leaves an operator nudged about a file no pass can consolidate, class (ii) leaves one corpus entry the
pass reports as unreadable — neither is a correctness divergence, because the pass consumes only what
its own enumeration returned.

## 8. DEC-CONS-06: Widen `rtWriteFile` alone to accept an absolute path

**Context.** DEC-CONS-03's clone lives under a `mktemp -d` directory — **outside** the repository.
Three things depend on writing files there: the guard-set edit that is committed in the clone, the PR
body file, and with it the whole `gh pr create --body-file` mechanism. The shipped write seam's
prompt instructs the agent to resolve the path *"relative to the repository root"*
(`pdlc/workflows/runtime-adapter.js:805`, inside `rtWriteFile` at `:802`), so an absolute temp path is
not a capability the seam already serves. An earlier draft of the TSPEC claimed no new capability was
needed; that was wrong.

**Decision.** Widen **one clause in one prompt** — `rtWriteFile`'s — to resolve a relative path
against the repository root as today and an absolute path (leading `/`) **verbatim**. `rtReadFile` is
**not** edited.

**Alternatives considered.**

- **Route the clone's writes through `_git`** — rejected on the actual verb inventory: git has no
  write-a-working-tree-file verb short of `hash-object -w` followed by `update-index`, i.e. **three
  mutating calls in the clone domain to replace one path argument**, in a domain whose permitted verb
  set is deliberately closed. It also inverts the natural order (content would enter the object
  database before it exists in the tree).
- **Widen both prompts "for symmetry"** — proposed by an earlier draft of TSPEC §5.6(a) and withdrawn
  **on measurement, not taste**. `rtReadFile` (`:493`) carries no path-resolution clause to widen:
  `grep -n "relative to the repository root" pdlc/workflows/runtime-adapter.js` returns **exactly one**
  line at HEAD, `:805`, inside `rtWriteFile`. `rtReadFile` reaches disk through `rtReadProbe` (`:369`)
  and a chunked line read, each transporting a *shell command* (`if [ ! -f "${path}" ] …`,
  `wc -c < "${path}"`, `shasum -a 256 "${path}"`, `:374-378`) under the **cwd** instruction "Run this
  exact command from the repository root" (`:374`). A cwd instruction is not a path-resolution
  instruction — every one of those shell forms already resolves an absolute `${path}` verbatim. So the
  symmetric edit would have been a prompt change to a shipped seam that *every* pipeline phase reads
  through, with no behavioural motive, purely so a test had a second thing to match. It is recorded
  positively here so a later reader does not "harmonise" the two prompts and add the clause back.
- **Construct the temp path in-module and keep the seam untouched** — rejected: the pass never
  constructs an absolute path. The only absolute paths it ever forms come back from
  `_makeTempDir`'s reply and are used verbatim, which is what keeps the widening from becoming a
  general escape from the repository root.

**Constraints that forced this shape.** `runtime-adapter.js` is under the merge-guard set
(`MERGE_GUARD_DEFAULTS`, `orchestrate-dev.js:48`), so every edit to it is operator-reviewed and is
worth minimising. The widening is bounded by three properties, each of which the implementation must
hold: it is **additive** (every relative path behaves exactly as today, which the shipped
`runtimeBundle.test.js` adapter assertions still pin); it is **non-mutating of any tracked tree**,
since the only absolute paths in play come from `_makeTempDir`; and it is **falsified rather than
reviewed** — the widened clause is pinned verbatim by an adapter-source assertion.

**Reversibility:** hard. `runtime-adapter.js` is inlined into every shipped bundle, so the widened
prompt ships to every consumer of every workflow, and reverting it breaks the PR route entirely. It
is also the one edit in this feature that changes behaviour for code paths this feature does not own.

**Re-evaluation triggers.** A second consumer needing absolute-path *reads* (at which point
`rtReadFile`'s implicit behaviour should be made explicit rather than left as a measurement recorded
in this document); the adapter gaining a first-class "write outside the repository" seam with its own
verb accounting; the clone moving inside the repository, which would remove the need entirely.

**Testability:** an adapter-source assertion pins the widened clause verbatim in **one** prompt. The
read-side half is **paired, not absence-only** — an assertion that merely reports "no such clause in
the read prompt" is satisfied by `rtReadFile` being deleted, renamed, or never reached, so it is
conjoined on the same path with two positives:

- **The read prompt's actual instruction is pinned verbatim** — `rtReadProbe` (`runtime-adapter.js:369`)
  transports its command under `"Run this exact command from the repository root and report its
  output:"` (`:374`), a **cwd** instruction. The assertion locates that string and asserts it is a cwd
  instruction, not a path-resolution one; the negative ("no `relative to the repository root`
  resolution clause") then runs on a prompt the test demonstrably found.
- **Absolute paths already resolve verbatim through the shipped shell forms** — an assertion that an
  absolute `${path}` substituted into `rtReadProbe`'s `if [ ! -f "${path}" ] …`, `wc -c < "${path}"`,
  `shasum -a 256 "${path}"` forms (`:374-378`) yields shell text that resolves that path verbatim.
  This is the positive form of "we measured, and there was nothing to widen": the measurement is
  asserted, not merely the absence of a clause.

Together they mean a future "harmonise the two prompts" edit fails a test rather than passing review,
and so does a read seam that quietly stops resolving absolute paths. The additive half is covered by the existing shipped adapter assertions in
`__tests__/runtimeBundle.test.js`, which already pin relative-path behaviour; this feature's edits to
that file (the await-scan source list and the seam-name set) are a single owned task per
batch-safety rule 2. Behaviourally, the clone's writes are observed through the `_writeFile` double's
recorded path arguments: every one of them is either repo-root-relative or begins with the string
`_makeTempDir` returned.

## 9. DEC-CONS-07: Release writes `""`; `file_empty` is read as absent

**Context.** FSPEC §4.1's marker-lifetime row says the marker is "**Removed** at step 16"
(`FSPEC-pdlc-consolidation-agent.md:415`). No declared seam can remove a file:
`grep -nc "unlink\|rm -f\|rmdir" pdlc/workflows/runtime-adapter.js` returns **0** at HEAD, and the
marker is untracked and `.gitignore`d, so `git rm` neither applies nor is admitted to the
invoking-tree verb set. Release must therefore be expressed with a write, and once it is, the
presence probe's reading of an empty file becomes load-bearing — the two answers must agree or every
steady-state pass reclaims a lock nobody holds.

**Decision.** Two halves of one decision:

1. **Release is `await _writeFile(markerPath, "")`** — one seam call, no git call, leaving the file
   present and zero-byte on disk.
2. **`present` is `(await _checkFile(markerPath)).ok === true`, and only that.** `rtCheckFile`
   (`runtime-adapter.js:817-831`) returns `{ok:true}` only for a file that exists **and** is
   non-empty, and `{ok:false, reason:"file_empty"}` / `{ok:false, reason:"file_missing"}` otherwise —
   so **`file_empty` is treated exactly as absent**.

The accepted cost is stated rather than absorbed: FSPEC §4.2's fourth row assigns "marker present,
unparseable **or empty (truncated write)**" the outcome "reclaimed, recording `reclaimed-stale-lock`
with the abandoned id `unknown`" (`:442`), bound again by E-11 and by AT-M3's *Given*. The
**unparseable-but-non-empty** arm behaves exactly as specified; the **empty** arm becomes
**unreachable**. That is raised as an erratum against FSPEC, not reinterpreted here (§11).

There is a **second** accepted cost, and it is the one an *operator* meets rather than a spec reader:
the zero-byte marker is **permanent** — one per consuming repo, from the first pass onward, because
no seam can remove it (`TSPEC:962-966`, carried into §13.3's residue list as "one permanent zero-byte
`docs/_decisions/.consolidation-lock` per consuming repo", `TSPEC:2522`). It is `.gitignore`d, so it
reaches no diff, no PR and no fresh-clone bootstrap check; the only surface on which it appears is a
literal `ls docs/_decisions/`, where a zero-byte `.consolidation-lock` means **free, not stuck**.
That reading is the inverse of the one AC-1.3 invites when it tells the operator that deleting
`.consolidation-lock` clears the lock — so it is stated here rather than left to the TSPEC, and the
two manual channels agree: a hand-deleted file yields `file_missing`, a released pass yields
`file_empty`, and §7.3 treats both as absent, so neither channel can wedge the cadence.

**Alternatives considered.**

- **Preserve FSPEC §4.2's empty arm — treat an empty marker as `reclaim`** — rejected. A *released*
  marker **is** an empty file, so this records `reclaimed-stale-lock` on every steady-state pass after
  the first: a louder and far more frequent falsehood than the truncated-marker case it preserves.
- **Derive `present` from `_readFile(...) !== null`** — rejected; it is the same bug from the other
  end. The empty released form reads as present-and-unparseable and `markerVerdict` takes the
  `reclaim` arm on a completely normal pass. This is the second, independent reason DEC-CONS-04's take
  keeps `_checkFile` in the protocol rather than collapsing to two calls.
- **Add a removal seam so release deletes the file** — rejected on three counts. It is a new
  agent-transported **mutation** verb in a verb set that ships none of its kind
  (`rtWriteFile:802`, `rtAppendFile:863`, `rtListFiles:905`, `rtGit:945` — and no unlink); its
  failure mode is deleting a lock another pass holds, which is worse than the failure it fixes; and
  AC-1.3 settles the shape upstream already, calling take and release "in-place rewrites of a whole
  small file" (`REQ-pdlc-consolidation-agent.md:155-156`).

**Constraints that forced this shape.** The adapter's verb set, measured above. AC-1.3's stated
mechanism. And DEC-ORACLE-02's rule — an uninstrumentable or unrepresentable path is recorded, never
worked around — which is why this entry ships a narrowing plus an erratum instead of a removal seam.

**Reversibility:** one-way door while no removal verb exists; trivially reversible the moment one
does, since both halves are single expressions. The *upstream* half is a live product question and is
reversible by decision, not by code: if the FSPEC author rules that the durable log must witness a
mid-take death, the answer is a removal verb (or a different marker representation), not a change to
these two expressions.

**Re-evaluation triggers.** The adapter gaining a removal verb; the FSPEC answering the erratum's
question — *when a pass dies mid-take, must the durable log witness it?*; a marker representation
that distinguishes "released" from "truncated" without removal (e.g. a released sentinel line), which
would restore the empty arm at the cost of making `parseMarker` total over two forms.

**Testability:** the observable is the **write double's last recorded contents for the marker path** —
the `IN-PROGRESS:` line during the pass, the empty string after it. Two conjuncts follow. (i) Release
happens on **every** terminal status that took the marker: the assertion is a set-equality over the
six-member terminal-status set rather than a spot check, so a new status cannot silently skip release.
The six are enumerated in `docs/_constraints/pdlc-consolidation-vocabularies.md:38-43` —
`promoted`, `promoted-degraded`, `no-op`, `skipped-cadence`, `refused`, `failed` — and that file is
the assertion's source of truth, so a seventh status added there fails the set-equality rather than
being silently excluded. (`skipped-cadence` writes no log row per AC-7.2 and `refused` terminates
before taking the marker per AC-1.3; the set-equality is between *took* and *released*, so those two
are on both sides as non-takes rather than dropped from the enumeration.)
(ii) The empty-marker fixture (`""`) is paired against the non-empty unparseable fixture in the same
case: the first must produce `free` with **no** `reclaimed-stale-lock` record, the second must produce
`reclaim` **with** one. That pairing is the only thing that keeps a future refactor from re-adopting
either rejected alternative, and it is a conjunct inside a case the marker file's single owning task
already writes — it adds no file and no task to the ownership manifest. The unreachable half of
FSPEC §4.2's row is **not** tested: writing a test for it would assert behaviour the code cannot
have.

## 10. Alternatives considered but not recorded as decisions

TSPEC §13.1 records thirteen rows. Seven are promoted above. The remaining six are listed here with
the reason each is *not* a decision, so a reader does not mistake omission for oversight — and so a
future agent that finds one of them and thinks it is an open question can see it was closed and why.

| TSPEC §13.1 row | Choice | Why it is not a DECISIONS entry |
|---|---|---|
| 3 | Inline the dev module into a fourth bundle, rather than share an artifact holding the resolver | **No alternative existed.** The runtime forbids `import` entirely and `build-runtime.mjs`'s `bundles` array (`:448`) reaches across modules only by concatenating whole bodies. A choice with one option is a constraint, and it is recorded as one in DEC-CONS-02 |
| 7 | `parseConsolidationConfig` duplicates `parseAdvisoryConfig`'s per-key-independent-fallback shape rather than generalising the shipped parser (`orchestrate-dev.js:1682`) | Weighed and rejected, but the rejection is a straight application of a standing rule rather than a new judgement: generalising edits a merge-guard file for a second reason and risks a shipped advisory path for a cosmetic gain. Recorded in the TSPEC; nothing here forecloses generalising later, and no future agent will reconsider it *confidently* — the shipped parser is right there to compare against |
| 8 | Extend `mergeCommandFor` (`orchestrate-dev.js:319`) rather than add a second `gh` command builder | Same: the function's own doc comment states the property being preserved — it is "the SOLE place every `gh` command string used by Phase MERGE is built, so a single audit of this function's body accounts for every literal command the phase can run" (`:310-312`). A second builder falsifies a claim the shipped comment makes. Applying an existing invariant is not a new decision |
| 9 | Widen four permitted verb sets — `read-auth` on the PR seam, and `read-object` / `read-remote` / `read-index` in the invoking tree — one verb per read, rather than mis-classify any into an existing verb | A taxonomy choice the TSPEC's own verb table owns and states completely. It is load-bearing (folding `remote` into `read-object` would have let a later `git remote add` pass containment) but it is *documented in the place it is enforced*, so it cannot be silently reconsidered |
| 10 | Enumerate with one `git ls-files` read rather than two `_listFiles` directory walks | Folded into **DEC-CONS-05**, where it belongs: it is the constraint that forced the two-enumeration shape, not an independent decision |
| 12 | Add an env-gated `PDLC_PENDING:` stderr line to the shipped hook | Folded into **DEC-CONS-05**. DEC-CONS-05 is *conditional* on it — without that observation channel there is no differential oracle and the two-implementation choice would have to be re-argued on what a count-above-threshold comparison can supply |

Two further alternatives were weighed at the FSPEC/REQ layer and are **not** this document's to
record, listed only so the boundary is visible: whether an ignored LEARNINGS file is corpus
(DEC-CONS-05's upstream question), and whether the durable log must witness a pass that dies mid-take
(DEC-CONS-07's). Both are product judgements about what counts as evidence, not technical choices,
and both are raised as errata rather than settled here.

## 11. Consequences for downstream layers

### 11.1 What the PLAN inherits from these decisions

| From | Obligation on the PLAN |
|---|---|
| DEC-CONS-02, and the two other edits to `orchestrate-dev.js` | The file-ownership manifest must serialise the **three** writers of `pdlc/workflows/orchestrate-dev.js` — the resolver widening, the `gitWithLockRetry` export, the `mergeCommandFor` surfaces — into **one** task. They are one physical file, and batch-safety rule 2 forbids two same-batch tasks appending to it |
| DEC-CONS-01, DEC-CONS-03, DEC-CONS-06 | The `runtime-adapter.js` writers are likewise **one** task: `rtEnvPresent`, `rtMakeTempDir`, the consolidation injections object, and the single `rtWriteFile` prompt widening (`rtReadFile` is **not** edited) are one file |
| DEC-CONS-02 | The rebuild of `pdlc/workflows/dist/` is an explicit task with `pdlc/workflows/dist/` in its pathspec, per `implementation.postWavePathspecs`. Four tracked artifacts change, not one — a partial rebuild fails CI's `Generated artifacts are in sync` job |
| DEC-CONS-02 (§8.3) | The release note and `pdlc/RELEASE-CHECKLIST.md` must state that the first queue invocation after this feature lands is **blocked by the drift gate** until `sync-workflows.sh` runs. No AC owns this; it is the shipped gate meeting a new manifest row |
| DEC-CONS-04, DEC-CONS-07 | The marker test file's owning task's Definition of Done must name both conjuncts — the six-status release set-equality and the empty-vs-unparseable fixture pair — so neither is read as unowned |
| DEC-CONS-05 | The shipped-hook edit (`PDLC_PENDING:` stderr line, and the widened `CORPUS_GLOBS`) and the hook-parity test are separate owned files; the parity test depends on the hook edit by an explicit `Deps` edge |
| All seven | Per DC-10, each entry above carries its `Testability:` line, and each names the file the oracle lives in. The canonical test doubles for the seams (`fakeFs`, the `_git` argv recorder, the `asAsync` wrapper) are created by one batch-1 task with downstream edges, per batch-safety rule 4 — no per-test ad-hoc equivalents, per DEC-ORACLE-03 |

### 11.2 What PROPERTIES inherits

Three of these decisions are stated as *invariants over a whole run*, not as single assertions, and
must land as properties rather than as unit cases:

- **DEC-CONS-01** — no credential value appears in any rendered artifact, on a path that
  demonstrably ran (the positive `credential:` conjunct). A fixture written against absence alone is
  satisfied by a pass that does nothing.
- **DEC-CONS-03** — over any pass, the invoking-tree `git` argv set contains no mutating verb. This
  is a containment property over a closed set, so it stays true for calls nobody has written yet.
- **DEC-CONS-07** — over the six terminal statuses, marker release is set-equal to marker take. Any
  determinism property here needs a **positive conjunct**: an invariance-only fixture is satisfied by
  a constant function.

### 11.3 Errata raised, not settled here

Two of these decisions relax or contradict an upstream document, and both are handed up rather than
absorbed. They are listed here so a reader of *this* document knows the corresponding entry is
provisional:

1. **FSPEC §4.1 / §4.2 — the marker's removal verb and the empty arm** (DEC-CONS-07). §4.1's
   lifetime row says "Removed at step 16" (`FSPEC:415`), which no declared seam can do; §4.2's fourth
   row (`:442`), E-11 and AT-M3's *Given* then bind an `empty (truncated write)` arm that is
   unreachable under the release form. The product question is *what the durable log must witness
   when a pass dies mid-take*, and it belongs to the REQ/FSPEC author.
2. **REQ §3.1 step 1 / FSPEC AT-P7 — the enumeration relaxation** (DEC-CONS-05). `REQ:115-116`'s
   "keeping one enumeration as well as one predicate" cannot be delivered as written, and an
   enumeration set-equality assertion would be red on correct code. The sub-question that decides how
   much of the divergence closes: *is a `.gitignore`d LEARNINGS file corpus?* — measured at HEAD, "yes"
   closes divergence class (i) at exactly the price of that rule and no other, while "no" keeps it
   open. The two answers are not symmetric and the erratum says so.

A third question rides with them and is likewise not this layer's to mint: should the durable log row
carry the **unreadable** corpus basenames (an `unread:` field beside `consumed`), given that an
unreadable entry is currently marked consumed while contributing no evidence? That is a
`docs/_constraints/pdlc-consolidation-vocabularies.md` §3 field-set change, and REQ §4b reserves that
file's sections to the REQ.

### 11.4 Standing consequence

Six of the seven entries above exist because the shipped runtime has no `fs` and no `process`, and
because the adapter's verb set is closed and small. If that ever changes, this document should be
re-read in one sitting: DEC-CONS-01, DEC-CONS-04, DEC-CONS-06 and DEC-CONS-07 would each be
re-decided the same day, and DEC-CONS-05's shared-implementation alternative would become affordable.
Until then, every one of them is a constraint wearing a decision's clothes, and the honest record of
that is what this document is for.
