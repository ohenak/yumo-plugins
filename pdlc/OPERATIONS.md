# pdlc operations reference

Deep-dive companion to the repo-root `CLAUDE.md`, split out to keep the always-loaded context small. The workflow sources (`pdlc/workflows/*.js`), the SKILL.md files, and their tests are the source of truth for behavior; this file records the operational contracts, operator decisions, and gotchas that are not derivable from reading a single module.

## Review loop mechanics

Three behaviours of the review loop are load-bearing and easy to violate accidentally:

- **Round indices are derived, never assumed.** `deriveRoundWindow` (`orchestrate-dev.js:2151`) reads the directory listing and computes the round window from the `CROSS-REVIEW-{role}-{doc}-v{N}` basenames actually present. It is synchronous, total, takes no seam, and never consults a clock — the decision is purely content-addressed. The loop refuses to overwrite an existing review file, so review history is append-only. `MAX_REVIEW_ROUNDS = 5`; exhausting it writes a POSTMORTEM and halts. That budget is **per-invocation**, so a document that keeps being re-opened (staled approval anchor, erratum cascade, forced re-run) accumulates rounds without bound; `MAX_LIFETIME_ROUNDS = 15` (DEC-ROUNDS-02, operator decision 2026-08-10) is the damping term. Once that many rounds for a doc type are on disk, the phase gate (and the erratum protocol's confirmation round) **dispatches nothing** and the document is **accepted as-is** — reported as a `⏭` row plus a loud notice, explicitly *not* an approval and explicitly *not* a failure (no POSTMORTEM, no halt, the pipeline moves forward). `forcePhases` overrides the cap; an unresolved POSTMORTEM still refuses the phase, because the cap is evaluated after step G. Phases CR and DOD keep their own budgets and are unaffected.
- **Documents are gated on structural completeness, not on an agent saying "done".** `isComplete(artifactClass, docType, fileText)` (`:1310`) scores a document per artifact class — `spec`, `cross-review`, `code-review`, `LEARNINGS` — and returns `{complete, missing, T, S}`. **`spec`-class rows match required *concepts* by normalised, word-boundary CONTAINMENT against the canonical title or a curated alias (`REQUIRED_HEADINGS[docType][].alts`) — numbered/descriptive headings are honored**, so a concern-organized spec (`## 4. The advisory core — types, SeamOps protocol, …` ⇒ `Interfaces` + `Data Model`) passes without carrying canonical headings verbatim. Word-bounded on `[a-z0-9-]`, so `non-goals` never satisfies `Goals` and a plural `## Decisions` never satisfies `Decision`. `LEARNINGS` is scored **positionally**: sections `1.`…`5.` must exist with non-empty bodies, whatever they are titled, plus the `Harvested from` row. Section 6 (Approval Record) is deliberately excluded from the criterion.
- **Authoring is incremental because it has to be.** The workflow runtime kills any dispatch that makes no progress for **180 seconds**, which a whole-file write of a large spec reliably trips — losing everything not yet flushed. Every authoring dispatch therefore carries `PACING_CONTRACT_CLAUSE` (`:2279`): skeleton first, one top-level section per edit, every write under 12,000 bytes, commit after each section. `MAX_AUTHORING_ATTEMPTS = 3` consecutive no-progress dispatches per episode ends the attempt rather than looping forever. When that halt fires and the completeness probe still reports a non-empty `missing` set, the halt message **names the still-missing rows and flags a likely heading-naming mismatch** (not a content gap), so a stall on a substantively-complete document is legible without re-reading it. **Follow this pacing yourself when authoring these artifacts by hand** — the watchdog is runtime-side and not configurable from this repo.

Three further behaviours, added by the orchestrate-dev optimization (Slice A):

- **Rounds 2+ are delta-scoped and prompts are grounded.** A round-2+ reviewer re-reads its own prior cross-review, diffs the document, and judges only whether its blocking findings are resolved and whether the revision broke anything — convergence is the goal; the approval bar is High-only (any open High ⇒ Needs revision; Medium/Low are recorded, not gating — see the cross-review bullet under *Artifact convention*). The optimizer is addressed as the continuing author: settled decisions are not re-litigated. Every creator/reviewer/optimizer prompt carries the phase's grounding manifest (`PHASE_DISPATCH[*].grounding` — verify claims against code, cite `file:line`), and reviewer prompts carry the three oracle-quality clauses (no implementation echoes, no absence-only oracles, completeness by set-equality).
- **Sessions are a seam, not a capability.** `_sessionAgent` (default `null`) lets a runtime that can resume agents keep one author session and one session per reviewer per document; the shipped runtime cannot, so every dispatch falls back to a fresh, delta-scoped dispatch. Fail-open: a declined or throwing transport falls back to `_agent` for that one call.
- **A converged PLAN must self-parse.** After Phase P converges, the script runs `parsePlanTasks` + `computeTopologicalBatches` over the PLAN and halts the phase on an unparseable table or a dependency cycle — rejected at Phase P, not discovered at Phase I. The parser's header grammar is exact-cell (`#`/`ID`/`Task ID` and `Deps`/`Dependencies`/`Depends on`/`Prerequisites`), never substring, so data tables elsewhere in the PLAN cannot be swallowed as task tables. Pipe splitting is escape- and code-span-aware (backtick code spans matched per CommonMark; escaped pipes never delimit), so `` `list[str] \| None` `` parses as a cell value, never a column shift. The same gate requires the PLAN's **file-ownership manifest** (a table with Task and Files columns, per se-author batch-safety rule 2), parsed by `parsePlanOwnership` with normalization-matched headers (whitespace-collapsed, parentheticals stripped: `Owning task(s)` → `owning task`; exact-cell closed-set doctrine kept; a partial match yields a loud near-miss diagnostic naming the cell and accepted spellings, never silent invisibility) and checked against the task table by `validatePlanContract` — every task needs a manifest row and vice versa. **Phase P lints the PLAN in-phase** after each authoring dispatch via `lintPlanArtifact` — pipe-split correctness, dependency graph, manifest headers, unknown task-id references — feeding exact expected forms and per-row/cell diagnostics back to the author, so parsing failures are caught inside authoring, never as late-phase surprises. Every doc type's first authoring prompt (REQ, FSPEC, TSPEC, PLAN, PROPERTIES, DECISIONS) carries the completeness gate's canonical headings + alts (`REQUIRED_HEADINGS[docType]` fed as grounding), and shortfall prompts name the nearest-miss headings actually present (normalized-title fuzzy report), so a substantively-complete doc self-corrects on first round instead of stalling.

Two behaviours added by loop-economics (config-gated, default off — DEC-LOOPECON-01):

- **Pin-cascade confirmation round.** Governed by `cascade.pinCheck.enabled` (`.claude/pdlc.config.json`, default `false`; parsed per-key independent-fallback exactly like `learningsInjection` — a missing or wrong-typed key, or an unreadable/unparseable file, degrades to `false` and never retunes the rest of the block). With the key off, the post-erratum downstream staleness walk runs exactly as it does today and the dispatch stream is byte-identical to the pre-M2 baseline (proven against committed fixtures, not a same-branch assertion — REQ-LOOPECON-04). With the key on, a downstream document flagged stale in that walk is **pin-check-eligible** iff *both* hold: its own on-disk bytes are unchanged since its last approval (the approval record's own-bytes anchor hash still equals the current document hash), and at least one recorded `UPSTREAM-STATE {DOCTYPE}` no longer matches that upstream document's current hash — i.e. only the pin moved. A document whose own bytes changed since approval is never pin-check-eligible and always gets the full dispatch. All eligible documents from one staleness walk are grouped into **one** batched pin-check dispatch (not one per document), covering every eligible doc type with the union of reviewer roles across their owning phases. The dispatch asks for one line per covered document in the grammar `PIN-CHECK: {DOCTYPE}: PASS | FAIL` — colon-space separator, case-sensitive `PASS`/`FAIL`, no third token, fence-aware line scan; anything else (absent line, malformed line, a duplicated doctype line with disagreeing verdicts) parses as `FAIL` for that document, mirroring how a missing or malformed `VERDICT:` line already reads as `Needs revision` (DEC-LOOPECON-03). A document whose verdict is `PASS` from every dispatched role gets its approval anchors re-stamped in place by the engine's own writer (`appendApprovalAnchors` in refresh mode, never agent-transcribed — DEC-ANCHOR-01): the stale `UPSTREAM-STATE` rows are rewritten to the now-current upstream pin(s) where they stand, never appended as a second anchor block (both anchor readers are first-wins and treat a duplicate block as unevaluable); no cross-review file is written, the round window does not advance, and the PASS consumes **no** `MAX_REVIEW_ROUNDS`/`MAX_LIFETIME_ROUNDS` budget — a staleness-only re-anchor was already decided a non-event by the general re-anchor-on-confirm rule above (DEC-LOOPECON-04, DEC-TERM-02). A document whose pin-check verdict is `FAIL` (or absent/malformed) is instead routed into the same ordinary re-confirmation round it would have received with pin-check disabled — same round index, same prompt bytes — because on the cheap path fail-open must never mean *less* work than baseline: it means "full review," never "approve anyway."
- **Derivative-stop convergence.** Governed by `review.derivativeStop.enabled` (default `false`) and `review.derivativeStop.rounds` (default `2`, must be a positive integer or the key falls back to the default), parsed with the same per-key fail-open rule. A completed review round is a **flat round** iff: (1) no finding is classified **new** (per the carried/new accounting above) at severity High or Medium — a new **Low** finding deliberately does **not** break flatness, and a carried finding of any severity does not break flatness either; (2) no finding in the round, carried or new, is an open High — an open High always blocks, regardless of how flat everything else is; and (3) the round is **evaluable** — a round whose verdict parses as unreadable, or whose `FINDING:` lines are malformed while the reported counts are nonzero against an empty parsed set, is treated as **not flat**, never as agreement (fail-open applied to M3's own input, not just its output). The identity match behind (1) is exact on the `{severity, section anchor, normalised text}` triple — text normalization never merges findings across different section anchors. When `review.derivativeStop.rounds` consecutive flat rounds complete (counting back from the most recently completed round; any non-flat or unevaluable round in the window resets the count to zero), the loop stops dispatching further rounds and records the distinct outcome `converged-by-derivative-stop (${iterations} iterations)` in place of `Approved (${iterations} iterations)` — same `✅` glyph (a success outcome, not a halt string), approval anchors appended exactly as on the ordinary approval path, and **no POSTMORTEM** is written. Rounds spent accumulating toward a derivative-stop still count toward `MAX_LIFETIME_ROUNDS` exactly like ordinary rounds — derivative-stop is only a way to stop *before* the cap, never a way to exempt or reset it. **Enabling this key suspends the 2026-08-08 high-only convergence shortcut** (described in the cross-review verdict bullet under *Artifact convention* below) for that document's loop: with the key on, a round converges only via **(a)** a literal approving verdict on the pre-relaxation reading (`VERDICT: Approved` / `VERDICT: Approved with minor changes` — not merely `high === 0`), or **(b)** the derivative-stop window firing. A round with zero open Highs and an open Medium, which converges today under the 2026-08-08 relaxation, no longer auto-converges once the key is on — the two shortcuts cannot coexist on one document, because the cruder one (high-only) fires first and masks the finer one, so opting into M3 necessarily means opting out of the standing shortcut for that loop (a repo that never turns M3 on keeps the 2026-08-08 experiment exactly as it runs today, byte-identically). This can therefore add review rounds relative to today's default bar, bounded by the unchanged `MAX_REVIEW_ROUNDS`/`MAX_LIFETIME_ROUNDS` caps; it is a deliberate trade (DEC-TERM-01, DEC-LOOPECON-10) of a cruder severity-only bar for a substance-based one. **Phase CR's own review loop does not participate**: derivative-stop is wired into the shared `converge()` primitive used by phases R, F, T, D, P, PR only (see "One convergence primitive" below) — Phase CR keeps its own body and its `recordPhase` hardcodes `Approved` regardless of finding history, so the flat-round/derivative-stop machinery never runs there.

## Phase graph and the erratum channel (Slice C)

- **One convergence primitive.** `main()` no longer carries five copied phase bodies; phases R, F, T, D, P, PR run through one `converge()` primitive (author → review → delta-verify → stop), parameterized by `PHASE_DISPATCH`. Phase CR keeps its own body; **CR and DOD remain separate gates** (operator decision, 2026-08-02 — never merge them).
- **T absorbs D; PT is I's V-wave.** DECISIONS, when warranted, is authored inside Phase T's section by the same author session and reviewed immediately — it keeps its own docType round window, cross-review files, POSTMORTEM lifecycle, forcePhases token, and report row (merging review windows would break `deriveRoundWindow`'s per-docType derivation, so the absorption is structural, not artifact-level). PROPERTIES tests run as Phase I's final V-wave under the script-owned gate in wave mode (the V-wave agent commits its own work; the script gate verifies after); the PT report row is unchanged.
- **Errata are a first-class signal.** A creator, optimizer, or reviewer that finds a defect in an *upstream* document emits `ERRATUM: {DOCTYPE}: {item}` lines (DOCTYPE ∈ REQ, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES) instead of editing that document or mis-filing the finding. After the phase converges, the orchestrator routes each upstream doc's errata: a targeted versioned edit by that document's author (same author session), then a delta-confirmation by that document's own approvers written as the next append-only cross-review round, with approval anchors re-appended on PASS so the upstream approval never goes silently stale. **The gate is severity-, provenance-, and locality-shaped** (`erratumConfirmPrompt` requires each finding as `FINDING: {High|Medium|Low} | {delta|inherited} | {local|nonlocal} | {section anchor} | {text}`; untagged High findings fail closed as before): R1 all-approving → re-anchor upstream; R2 any non-approving but zero High-delta → no halt, route inherited-High as phase re-open (owning phase's approval marked stale, ordinary revision loop); R3 High-delta all-local and follow-up budget unspent → one bounded follow-up erratum round (`MAX_ERRATUM_FOLLOWUP_ROUNDS = 1`, shipped constant) with item list = confirmers' findings verbatim, then re-confirm; R4 High-delta and (nonlocal or follow-up spent) → `erratumPostmortemHalt` with halt payload carrying the parsed `FINDING:` lines verbatim. **Item-list hygiene at mint:** normalized dedupe (target + expected token collapse to one item), per-item mint tags (when upstream skews, re-mint and dispatch author to return re-derived list against HEAD before confirmers see it), multi-home split (N-target items mint N tracked items), oracle-contract lint (AT-/INV- items checked for full contract). Literal-token items (text matching "should say X, not Y" or carrying `EXPECT-TOKEN:` clause) are mechanically land-proofed engine-side after author edit and before confirmers dispatch — token-absent triggers bounded re-dispatch naming the token; second failure proceeds to confirmation which will fail. **Bounded: one erratum round per upstream doc per phase** (fresh item sets via `MAX_ERRATUM_ROUNDS_PER_DOC`, follow-up via separate `MAX_ERRATUM_FOLLOWUP_ROUNDS`); a failed confirmation halts to the current phase's POSTMORTEM.
- **An erratum round re-grounds against its upstream before touching the raised items** (DEC-ERR-01, `docs/_decisions/DECISIONS-review-severity-bars.md` — added 2026-08-06 after POSTMORTEM-P-pdlc-consolidation-agent). The edited document's author first re-reads the document's immediate upstream at HEAD and diffs its `Version` cell and erratum changelog against the version last approved against; if it moved, the author enumerates **what it decided** — every `BR-`, `E-`, `AC-` and vocabulary row the upstream's changelog names — and **absorbs** those decisions into the round's item list *before* the raised items, recording them in the changelog as absorbed. The delta-confirmation checks the absorbed set as well as the raised set. Routing a question the upstream has already decided is never a demoted finding — it is a false statement in a hand-off section (DEC-ERR-01). A multi-layer erratum wave propagates downward in order: a child confirmed before its parent's decision reaches it is approved stale.

## Implementation waves (Phase I, Slice B)

With a valid ownership manifest, Phase I runs **same-tree waves instead of worktree batches**: waves = topological ready-sets partitioned into ownership-disjoint groups (`computeWaves`; a directory entry collides with everything under it), agents are dispatched without worktree isolation and told not to commit, and **the script owns the gate** — after each wave it runs `.claude/pdlc.config.json` → `implementation.testCommand` through the `_runCommand` seam, then (optionally) `implementation.postWaveCommand`, and only then commits each task's work itself, pathspec-scoped to the task's owned files (never `-a`), with an index.lock retry (5 × 5 s). `implementation.postWavePathspecs` names build outputs (e.g. `pdlc/workflows/dist/`) committed as a per-wave chore commit. Missing `testCommand` or an absent `_runCommand` seam degrades to the legacy self-report gate with a notice; a PLAN with no manifest (reachable only when Phase P was skipped on a recorded approval) degrades to the legacy worktree path. Worktrees are the exception path, not the default.

### The wave ledger — Phase I's automatic resume pointer

Phase I keeps a **machine-local resume record** at `.claude/pdlc-wave-state.json` (git-ignored by a root-anchored rule, never tracked content). After each wave's gate passes and its work is committed, the script rewrites the record with the feature name, a hash of the derived wave plan, the wave number just committed and the commit it landed on. A later invocation over the same feature reads it and decides one of three outcomes, always announced on the run log:

| Outcome | What the operator sees |
|---|---|
| **resume** | `Resuming at wave N of M (wave ledger .claude/pdlc-wave-state.json). Waves 1–K were committed and recorded green by an earlier run of this same plan; the first executed wave's gate still verifies the whole tree. Delete .claude/pdlc-wave-state.json to force a full run. (provenance: automatic)` |
| **skip Phase I** | `Skipping Phase I (wave ledger …): all M waves of this plan were committed and recorded green by an earlier run. Delete … to force a full run. (provenance: automatic)` |
| **ignore, run everything** | `Notice: the wave ledger … was ignored — {reason}. Running every wave from 1. (provenance: automatic)` |

The record is only ever honoured when it names **this** feature and hashes to **this** plan, and — whenever ancestry can actually be established — when the commit it records is an ancestor of `HEAD`. The ancestry check is **fail-open** in two shipped cases, because neither is evidence that the record is stale: a record carrying no `head` field at all (written before the field existed) is honoured with **zero** probes, and a probe that cannot run or throws (no git transport available, `merge-base` unavailable) is honoured too. Otherwise it is disregarded with the reason spelled out — one of seven: unreadable JSON, not a JSON object, fields of the wrong shape, a different feature, a changed PLAN wave layout, a recorded commit that is not an ancestor of HEAD (the branch was reset or re-cut), or more waves recorded green than the plan has. A missing record is the ordinary fresh-run case and is **silent**. Every rejection is a notice and a full run — never a halt — so the ledger can only ever cost time, not correctness. The first executed wave's gate verifies the whole tree regardless of where the resume starts.

**The escape hatch is deletion.** `implementation.forcePhases` cannot name Phase I and will not override the ledger; to force every wave to re-run, delete `.claude/pdlc-wave-state.json`. That instruction is printed in both honouring announcements above, so an operator surprised by a run that started at wave 4 reads the fix in the same line that surprised them.

`implementation.startWave` remains the **manual** pointer and outranks the record: when it is set, the run announces `(provenance: operator-set)` and the ledger is not consulted.


## Continuous integration

The required-check table — four checks across `.github/workflows/pr-tests.yml` and `.github/workflows/fixture-machine.yml`, whose membership is decided by each file's `on:` trigger rather than its name — lives in `CLAUDE.md`'s `### Continuous integration` section, which is the oracle-covered citation of FSPEC §5.1. This section carries only the rationale behind those rows.

- `Unit tests (ubuntu-latest, node 20)` runs the workflows suite under c8 with the declared floor enforced in aggregate and branch ≥85% enforced per module. There is deliberately no macOS job (operator decision, 2026-08-10): bash-3.2 portability of the shipped scripts is the maintainer's local concern, and a second platform job doubled CI wall time without ever failing independently.
- `Engine tests (ubuntu-latest)` runs through the package script, so the `--import` bootstrap and the suite-wide assertion step are inherited.
- `Shell scripts parse` is a syntax-only (`bash -n`) pass over every tracked `*.sh`.
- `Fixture machine (install/upgrade, launcher, container, two-repo)` is path-filtered over `pdlc/engine/**`, so it is skipped-as-success on PRs that touch neither the engine nor that workflow file.

Keep every job deterministic: Phase PUB halts the pipeline on any failure, so a job that can fail for reasons unrelated to the diff blocks delivery.

`pdlc/RELEASE-CHECKLIST.md` carries the pre-release commitments that CI cannot check mechanically.

## Model selection

The workflow scripts pin a model per phase via the runtime `agent()` `model` option:

- `orchestrate-dev`: **Phase I (Implementation) waves run on Sonnet**; every other phase (spec authoring/reviews, PROPERTIES tests, final codebase review, DoD, Harvest, PR/CI) runs on **Opus**. Constants: `MODEL_DEFAULT = "opus"`, `MODEL_IMPLEMENTATION = "sonnet"` at the top of `pdlc/workflows/orchestrate-dev.js`; agent calls default to Opus, the Phase I dispatch overrides to Sonnet.
- `orchestrate-queue`: the **Phase-0 readiness triage runs on Sonnet** (`MODEL_QUEUE`); the delegated `orchestrate-dev` pipeline is invoked without an agent override, so it applies its own pinning above (i.e. **Opus** except its Phase I).

## Advisory tier (off by default)

An **advisory tier** lets the pipeline attempt one bounded, reversible remediation at six
named seams before escalating to a human. It ships **disabled**: `.claude/pdlc.config.json` →
`advisory.enabled` defaults to `false`, and with it false (or the section absent/malformed)
the tier is provably inert — no dispatch, no model resolution, and the created-file set of a
run is byte-identical to the pre-advisory baseline (`advisoryDisabled.test.js`, PROP-DIS-*).

- **Seams:** `A1` queue triage adjudication (needs-human; capability-free — it never edits),
  `A2` queue stale-REQ re-grounding (rewrites citation *location text only*, then commits
  REQ + record pathspec-scoped in its own `verifyGate`), `A3`/`A4` Phase DOD verify/remediate
  assists, `A5` Phase PUB CI-red diagnosis (acts only inside a decidable envelope; a
  non-`escalated` outcome re-polls, `escalated` falls through to the byte-identical halt),
  `A6` Phase I wave-gate remediation — fires on exactly one condition, a red **script-owned**
  gate command, never on a PROPERTIES V-wave and never without an ownership manifest. It never
  commits and never edits a test file, the PLAN or the config; it re-runs the same gate it was
  dispatched on, and a refusal, a budget exhaustion or a red re-gate restores the whole working
  tree from a wave-scoped snapshot before falling through to the wave's own halt.
- **Config keys** (`parseAdvisoryConfig` — per-key independent fallback, one bad key never
  retunes the rest): `enabled` (false), `attemptBudget` (3), `seamBudgetMinutes` (10),
  `waveBudgetPerRun` (1 — A6's per-run dispatch ceiling), `envelope` (six-member literal:
  `ENVELOPE_DEFAULTS` is E-1…E-6, A6 having added E-5 and E-6). The master switch is tested
  first.
- **Two artifacts, one lifecycle rule.** Per-feature `docs/{feature}/ADVISORY-{feature}.md` —
  an append-only disposition record, committed pathspec-scoped at the seam that wrote it
  (H-2b durability; the queue commits it itself when an adjudication picks nothing). After
  Phase PUB, the H2 distil step folds it into `LEARNINGS` and deletes it through the
  guard-covered channel (`guard-harvest-before-delete` covers `ADVISORY-*` exactly as
  `CROSS-REVIEW-*`/`CODE_REVIEW-*`; a refusal is a notice, never a halt). Non-feature-scoped
  `docs/_queue/ESCALATIONS.md` — a single append-only escalation log, never distilled and
  never deleted.
- **Reporting:** the final report's `advisory` field carries six per-seam rows on both the
  success and halt paths (all-zero rows when enabled-but-quiet; the key is **absent** —
  `undefined`, not `null` — when disabled, per AC-1.6's "carries no advisory summary"), and
  `ciStatus` provenance is always a real `checkPrCi` observation, never an advisory verdict
  field.

## Prior-feature learnings injection (on by default)

Every **authoring** dispatch whose target document is one of REQ, FSPEC, TSPEC, PLAN,
DECISIONS or PROPERTIES gets a bounded, visibly delimited suffix carrying prior features'
`LEARNINGS-*.md` material. Non-authoring dispatches — reviews, implementation waves, DoD,
harvest, PR/CI — are byte-identical to a pre-feature run; that is asserted against a
committed baseline fixture set, not against a same-branch disabled run
(`pdlc/workflows/__tests__/learningsBaselineGuard.test.js`).

Unlike the advisory tier and `mergeMode`, this one ships **on**: `learningsInjection.enabled`
defaults to `true`, so an absent section, an absent config file or a misspelt section name all
mean *enabled with the declared defaults*. Turning it off is a deliberate act.

- **Config keys** (`.claude/pdlc.config.json` → `learningsInjection`, parsed by
  `parseLearningsConfig` in `pdlc/workflows/orchestrate-dev.js` with per-key independent
  fallback — one bad key never retunes the rest): `enabled` (`true`), `maxDocuments` (`5`
  documents per dispatch), `maxBytesPerDocument` (`6000` bytes, over-long documents are
  abridged and annotated rather than dropped), `maxTotalBytes` (`20000` bytes per dispatch,
  applied as a five-document priority window with back-fill). `.claude/pdlc.config.example.json`
  carries the block at these values. There is no configuration surface beyond these four keys
  — no per-feature allow-list, no path overrides.
- **Fail-open, everywhere.** A corpus that cannot be listed, a document that cannot be read or
  parsed, a config file whose read throws (`EACCES`, `EISDIR`), a malformed section, a
  wrong-typed key: each degrades to "inject less", never to a halt and never to a silent
  disable. In particular `enabled: "false"` — a string, not a boolean — is a *mistake*, not a
  disable: the run stays enabled on the declared default and records a notice. Only a real
  `false` turns the feature off.
- **Two notice ids** appear on the run report when a config mistake was tolerated:
  `NTC-MALFORMED` (the section did not parse as an object; defaults retained) and
  `NTC-KEYTYPE` (a declared key was wrong-typed; that key alone fell back, and the notice
  names it). These are the whole catalogue (`LEARNINGS_NOTICES`).
- **Reading the report.** `report.learningsInjection` carries one row per candidate document
  per authoring dispatch — its path, whether it was selected, and if not, why, from a closed
  catalogue: `RSN-COUNT`, `RSN-BYTES`, `RSN-SELF` (a feature never reads its own LEARNINGS),
  `RSN-UNREADABLE`, `RSN-UNPARSEABLE`, `RSN-NO-MATERIAL` — plus a corpus-level outcome
  (`RSN-UNLISTABLE`, `RSN-EMPTY`) and the thresholds in force. An operator asking "why did
  this prompt not carry X" answers it from that field alone.
- **Where the material comes from:** `docs/*/LEARNINGS-*.md` and `docs/completed/*/LEARNINGS-*.md`.
  `docs/discarded/` is excluded by not being listed, not by a rule of its own.
- **Debugging an unexpected prompt suffix:** set `learningsInjection.enabled` to `false` in
  `.claude/pdlc.config.json` to get the pre-feature prompts back, then read
  `report.learningsInjection` from the enabled run to see which document supplied the text.

## The engine channel (`pdlc/engine`)

`pdlc/engine/` is the distribution channel for the pipeline, published to npm as `@kaneho/pdlc-engine` (`pdlc/engine/package.json`). It is the only channel: `pdlc`'s SKILL.md files delegate to the installed engine CLI rather than loading a workflow bundle directly.

| Fact | Where |
|---|---|
| One-command machine install, then `pdlc` on `PATH`; nothing is written into a consumer project | `pdlc/engine/scripts/postinstall.mjs`, `pdlc/README.md`'s install section |
| Node floor is `>= 20`, refused by a dependency-free guard with a named message and no stack trace | `pdlc/engine/bin/pdlc.mjs` (the guard) / `bin/cli.mjs` (the body) |
| Every pipeline command handshakes against an installed **plugin** first: the engine ships no `skills/`, and prompts are always read from the plugin's tree | `pdlc/engine/lib/handshake.mjs`, `lib/skills.mjs` |
| Compatible-plugin range, declared by the engine and checked before publish | `pdlc/engine/package.json`'s `pdlcPluginCompat` |
| Workflow modules are **vendored into the package** at pack time; the engine never loads `.claude/workflows/` | `pdlc/engine/scripts/prepack.mjs`, `lib/run.mjs` |
| Publishing is tag-triggered (`engine-v*`), gated on the PR checks re-run at the tag, and records a `pdlcPairing` triple in the published manifest | `.github/workflows/publish.yml`, `pdlc/engine/scripts/publish-preflight.mjs` |
| Engine and plugin versions are emitted into the run report and into committed halt artifacts | `pdlc/engine/lib/provenance.mjs`, `lib/report.mjs` |
| Tests: `cd pdlc/engine && npm test` | `pdlc/engine/__tests__/` |

Because the plugin's bytes are half of that published pairing, **changing anything under `pdlc/skills/`, `pdlc/hooks/` or `pdlc/workflows/` means bumping `pdlc/.claude-plugin/plugin.json`'s version** — plugin bytes that change under an unchanged version number are exactly the skew the pairing record exists to make visible.

## Loop directive protocol

`/loop run /pdlc:orchestrate-queue` drives `pdlc queue` one iteration at a time; each iteration is
exactly one `pdlc queue` process. Session-scoped state — the once-per-session preflight marker, the
consecutive-idle counter, and the schedule position — is carried **through the caller**, on a
`--loop-state <token>` flag, not through a durable file: a state file would survive the session that
created it, and a stale file from an abandoned session would silently seed a fresh session's idle
counter, which is exactly the failure mode a loop restart must not have. `--loop-state` is present
on every iteration, including the first, where the reserved literal `new` means "start session".

`--loop-state` is an **internal** protocol detail supplied by the session-side skill
(`pdlc/skills/orchestrate-queue/SKILL.md`) — the operator never types it. `/loop run
/pdlc:orchestrate-queue` is the only thing an operator types. `--loop-state` is therefore documented
here, under the protocol, and is explicitly **not** a member of the four-item steady-state operator
surface below (BR-25) — including it there would break that set's set-equality with what an
operator actually does.

## Operator surface (BR-25)

The session also reports the wait it took back to the engine on the next iteration
(`--wait-requested`, `--wait-actual`): the session is the waiting party, so the engine cannot
observe the interval, and a host that cannot honour a requested wait is reported at the length
actually waited rather than silently accepted (FSPEC E-25). Both flags are optional — iteration 1
took no wait, and an absent `--wait-actual` is reported as an unknown actual length, never
backfilled from the requested one.

Open escalations are resolved with `pdlc decide --entry <entryId> --outcome <resolved|rejected>
--by <who> [--rationale <text>]`, where `entryId` is the id the loop's rendered operator view
prints for each open item. The command appends a decision block to `docs/_queue/ESCALATIONS.md`
and rewrites nothing: the decided entry's own block survives verbatim, escalation counts are
unchanged, and the view derives closure by overlay at read time (REQ AC-4.4).

Once a repo is running the loop, the **steady-state** operator surface is exactly these four items —
nothing else is a recurring operator action:

1. Flipping `ready: true` on a REQ's frontmatter.
2. Approving a PR that touches a guarded path (see *Merge guard-path extras* below).
3. Resolving open escalations (`docs/_queue/ESCALATIONS.md`).
4. Product/business-judgment calls that fall outside the pipeline's scope.

This set is disjoint from **one-time setup**, which is a separate, non-recurring list and is not
part of the steady-state surface: installing the engine (`pdlc/engine`), creating
`docs/_queue/QUEUE.md` from the shipped template, installing the loop prompt template
(`pdlc/templates/loop.md`, optional — see the one-time-setup list in `pdlc/README.md`, which
names the install destination `.claude/commands/`), and, in
a repo that guards paths beyond the shipped defaults, configuring `merge.guardPaths` in that
machine's `.claude/pdlc.config.json` (this repo's own extra is `pdlc/engine/` — see *Merge
guard-path extras* below, which is the section that enumerates the documented set). A stop
condition that is neither in this four-item set nor in the one-time setup list is a **defect in the
feature**, not an expected mode: the enumerated operator surface is understated and must be
corrected.

## Merge guard-path extras (BR-23/BR-24)

`effectiveGuardPaths(configured)` unions `MERGE_GUARD_DEFAULTS`
(`["pdlc/workflows/", "pdlc/skills/", "pdlc/hooks/", ".claude/workflows/"]`,
`pdlc/workflows/orchestrate-dev.js`) with this repo's own configured extras, and never subtracts.
This repo's configured guard-path extra is:

- `pdlc/engine/`

That extra is **configured** in this repo's own `.claude/pdlc.config.json`, under
`merge.guardPaths`:

```json
{ "merge": { "guardPaths": ["pdlc/engine/"] } }
```

That file is gitignored (`.gitignore`, `/.claude/pdlc.config.json`) — operator-local, like every
other repo-local pdlc setting — so it is **an operator setup step, not something a clone
inherits**. It is listed as such under one-time setup (AC-5.2). The extra deliberately does not
live in `.claude/pdlc.config.example.json`: BR-29/P8-02 requires that file to ship
`guardPaths: []`, because `effectiveGuardPaths` unions and never subtracts, so a non-empty example
would silently widen the guarded set of every consuming repo that copies it.

AC-5.1a's "the documented set and the enforced set are the same object" is enforced by the `AT-32`
document oracle (`pdlc/workflows/__tests__/loopGuardPaths.test.js`), which reads this section from
tracked default-branch content rather than the working tree, and which has three conjuncts:

1. **The equality that matters.** When `.claude/pdlc.config.json` is present, the bullet list above
   must be set-equal to its `merge.guardPaths`. This is the conjunct that makes the documented set
   and the enforced set one object, and its referent is the config file, not the sentence under
   test — so documenting an extra nobody configured, or configuring one nobody documented, reds it.
2. **A named skip, never a silent pass.** When the config is absent (CI, a fresh clone), that
   conjunct cannot run; the oracle reports the skip with its reason rather than passing quietly, so
   an absent referent is visible instead of being mistaken for agreement.
3. **Conjuncts that always run.** Applying the shipped `effectiveGuardPaths` to the documented
   extras is set-equal to `MERGE_GUARD_DEFAULTS` ∪ those extras, and every documented extra is
   absent from `MERGE_GUARD_DEFAULTS` itself (BR-24 additivity) — so a later widening of the
   shipped defaults reds this documentation on every machine, config or no config.

Widening the shipped defaults for every consumer belongs to `pdlc-merge-phase`, not here (§5).

## `pdlc stats` (read-only reporting)

`pdlc stats [feature] [--json] [--cwd <path>]` is a read-only reporting command over artifacts the
pipeline has already written — a directory listing, file sizes, and the same classification
functions the driver itself uses (`parseReviewFilename`, `deriveRoundWindow`,
`deriveDodRoundIndex`, `parseResolvedMarker`, all imported from `orchestrate-dev.js` rather than
re-implemented). It reports four metrics: review rounds per document type, DoD rounds, halts with
resolution state, and the process-to-spec byte ratio. `pdlc/README.md`'s vendoring sentence defers
here for flag detail; this section is that detail.

**Modes.** At most one positional argument is accepted. Supplying a feature name runs
single-feature mode over that feature's `docs/{feature}/` directory; omitting it runs fleet mode
over every feature directory under the resolved `docs/` root (excluded directories are skipped, not
reported as gaps).

**Flags (closed set).** `--json` is a boolean flag selecting the machine-readable renderer in place
of the human one; it takes no value. `--cwd <path>` is a value flag that names the repository root
`docs/` is resolved under; it defaults to `process.cwd()` when omitted. No other flag is accepted —
an unknown flag, a value flag given with no value, or a second positional argument is a usage error.
A usage error names the offending token on stderr, exits `1`, and leaves stdout **empty in both
render modes**, including `--json`: a JSON-mode caller must never receive a half-built document.

**Exit codes.** `pdlc stats` exits `0` or `1` and **never** `2`. Exit `2` is reserved elsewhere in
this CLI for a recorded pipeline halt; a reporting command has no halt to signal, so nothing on the
`stats` path can produce it. `0` means the command ran and reported — including an empty fleet
report over a `docs/` root with no eligible feature directories, and including a fleet report that
contains one or more per-feature gap rows, since one unreadable feature never sinks the rest of the
fleet. `1` means the command refused or could not report at all: a usage error, a missing or
unreadable `docs/` root (fleet mode's only non-zero exit), an unknown feature in single-feature
mode, or a single named feature whose directory cannot be read.

**Read-only stance.** No filesystem write, no deletion, no directory creation, no network request,
and no `git` command — write or otherwise — is issued on any path: success, usage error, not-found,
unreadable root, or an unexpected per-feature failure in fleet mode. This holds on the failure paths
exactly as it holds on the success path; it is not a "success only" property.

**JSON mode.** Under `--json`, stdout carries exactly one JSON document and nothing else — no
banner, no trailing newline content beyond the document itself — with diagnostics still routed to
stderr. On a refusal that still produces a report (an unknown feature, an unreadable `docs/` root,
an unreadable single feature), stdout carries a three-key error object naming the reason
(`no_docs_root`, `unreadable_feature`, etc.) rather than being left empty; empty stdout is reserved
for the usage-error path alone.

## Durability and cadence (BR-30)

**`/loop`'s scope and lifetime** (runtime version **2.1.245**, transcribed from the runtime's own
`/loop` documentation rather than restated from memory): `/loop` is **session-scoped** — its
built-in confirmation dialog states plainly, in its own words, "This loop stops when you close this
session," offering "Cloud schedule (recommended) — Runs in Anthropic's cloud even after you close
this session" against "This session only" as the alternative. `/loop` **fires only while its
session is open**: each tick is driven by the session's own `ScheduleWakeup` tool, called before the
turn ends to keep the loop alive, and omitting a rescheduled wakeup ends the loop after that tick.
Put together, `/loop` **expires** with the session that started it — closing the session, or the
model failing to reschedule the next wakeup, ends the loop; nothing about `/loop` outlives the
session. These are runtime facts, not this feature's design choices — they are recorded here,
cited to the runtime version above, so the claim is checkable when the runtime changes; figures are
not restated anywhere else in this pipeline's documentation.

**Promotion paths, when a cadence needs to outlive a session:**

- **Desktop scheduled task** — local files, and the machine must be on. Fits pipeline work: the
  pipeline needs the working tree `orchestrate-dev` authors specs against.
- **Routine** — cloud-hosted, runs against a fresh clone. Fits consolidation-style work that needs
  no persistent local state.

`orchestrate-dev` is a **poor fit for a Routine**: the pipeline authors specs against a working
tree, and a Routine has none. Use a Desktop scheduled task for `orchestrate-dev`/`orchestrate-queue`
cadences; reserve Routines for work — such as `consolidate-learnings` — that a fresh clone can do.

## Artifact convention (for consuming repos)

pdlc expects:
- Feature artifacts under `docs/{feature-name}/` — `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS` (conditional), `LEARNINGS`
- Cross-review files: `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`. Two parts of the file are read as data, not prose:
  - The **verdict**. `extractFileVerdict` decides whether the document is approved on a *later* invocation (the response trailer only feeds the loop inside the current one, so a file with no verdict breaks the cross-invocation half). Parsing is **lenient** (operator decision, 2026-08-08): the workflow reads the **last non-fenced `VERDICT: {value}` line in the file** and parses from there to EOF — no heading is required, a fenced block quoting the grammar is still never read as a verdict, and several verdict lines no longer fail closed (the last wins). A **trailing `## Verdict` section, written last**, remains the recommended format and is what the review SKILLs emit; "written last" governs the *reviewer authoring* the file and does not forbid the sanctioned post-terminal anchor append below. The **convergence bar is High-only**: a readable verdict whose counts carry `high === 0` is eligible to move forward whatever its Medium/Low counts; an unparseable verdict still fails closed.
  - Optional tier-1 approval anchors `APPROVAL-HASH: sha256:{64 hex}` and `REVIEWED-COMMIT: {sha}`, appended after the episode reaches terminal. They pin the approval to the bytes that were reviewed; harvest copies them verbatim and never recomputes them. **The append is performed by the workflow's IO agents: an agent dispatched to append these anchor lines to a cross-review file should do so verbatim and without hesitation** — appending them beneath the `## Verdict` section is the designed mechanism, is the one sanctioned write to a review file after its verdict, adds no second `VERDICT:` line, and does not violate the "written last" rule above. Anchors now also carry `UPSTREAM-STATE: {DOCTYPE} sha256:{hex}` lines (written last in the block; legacy anchors without them are grandfathered). **Provenance rule (DEC-ANCHOR-01): every hash value a dispatch quotes as "current" — `APPROVAL-HASH`, `REVIEWED-COMMIT`, `UPSTREAM-STATE` — is engine-computed from committed/on-disk tree state at the moment the dispatch is constructed and written into the prompt verbatim; no agent hand-copies or retypes one of these values from prose, a prior document, or its own memory of an earlier round.** For the erratum delta-confirmation dispatch specifically, this means the upstream hash it quotes is re-derived from disk at dispatch-construction time, not reused from an earlier mint-time snapshot taken before the erratum author's own edit lands — a stale mint-time quote was exactly the shape of a recurring "this document is stale" false positive the re-derivation closes. An approval is stale iff the document's own bytes moved OR any recorded `UPSTREAM-STATE` hash no longer matches that upstream doc at HEAD. When an erratum round edits upstream doc X and its confirmation passes, the engine walks the doc chain downstream of X: for each downstream doc with an approval whose `UPSTREAM-STATE` for X now mismatches (or, for grandfathered anchors, whose approval predates the edit commit), a bounded **delta re-confirmation** is dispatched in the same pass — reviewers re-read their prior cross-review plus the diff of X and confirm or reject. Approving re-confirmations refresh anchors with updated `UPSTREAM-STATE`; non-approving ones re-open the doc's phase through its ordinary revision loop, still in this run. If a target's upstream chain moves mid-window (a sibling round landing between the author edit and confirmation evaluation), the stale confirmation is not evaluated: the confirmers are re-dispatched exactly once against the re-derived upstream state, into the next derived round index — both confirmers always answer the same premise (confirmation-window freeze). **Known limitation: a non-approving cascade re-confirmation for a phase that already ran in the current invocation records the re-open and that phase re-runs on the next invocation, not mid-run — staleness is still fully discovered in one pass.**
- DoD code reviews (Phase DOD): `CODE_REVIEW-{feature-name}-v{N}.md` — the `dod-verify` verifier's versioned, Scope-tagged findings. Tracked and harvested like cross-reviews; one version per DoD verify→remediate round. The round index `N` is disk-derived, never an in-memory counter: `N = max(existing CODE_REVIEW-{feature}-v* version numbers found on disk) + 1`, or `1` if no such file exists yet — the same "derive from the directory listing, never assume" contract `deriveRoundWindow` already applies to ordinary review rounds (REQ-LOOPECON-09), so a resumed or re-dispatched run can never skip a version number or collide with an existing file.
- `LEARNINGS-{feature-name}.md` — a metadata table whose **`Harvested from` row is required** (it is the record of which `CROSS-REVIEW-*` / `CODE_REVIEW-*` / `POSTMORTEM-*` files harvest deleted, and the file is structurally incomplete without it), five numbered sections each with a body, and a best-effort `## 6. Approval Record` — one six-column row (`Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit`) per approving cross-review, carrying the anchors copied from those files. The approval record is deliberately **not** part of the completeness criterion: a missing record is reported in the run report, never a halt.
- Post-mortems (non-convergence): `POSTMORTEM-{phase}-{feature-name}.md`. These have a **lifecycle, not just a name**: a review loop that exhausts its rounds writes one and halts, and the phase refuses to run again until the file carries a `RESOLVED: yes` line outside any fenced block. `RESOLVED: no`, an absent marker, or one that cannot be parsed all refuse the phase (fail closed) and report the POSTMORTEM's `## Recommendation`. **Flipping the marker to `yes` is a judgment call, not a mechanical step** — an operator or an agent may write `RESOLVED: yes` after verifying that every finding in the POSTMORTEM's `## Recommendation` has been addressed on the branch, and the commit that flips it must name what addressed each finding. The workflow scripts themselves still never write `yes` — the loop that produced the halt is never the one that clears it. This is how a halted pipeline is cleared: address the findings, set `RESOLVED: yes` with the evidence, re-invoke.
- Project-level context: `docs/_constraints/`, `docs/_decisions/`
- Serial work queue (for `orchestrate-queue`): `docs/_queue/QUEUE.md` — a markdown table of `Order | Status | Feature | REQ Path | Depends-On`. REQs opt in to auto-pickup via `ready: true` in their frontmatter; effective deps are the union of the queue's Depends-On column and the REQ's `depends-on`. Status lifecycle: `pending → in-progress → awaiting-merge → done` (human sets `done` after merge) | `halted` | `blocked`. The queue is not the only writer of this table: a **direct** `orchestrate-dev` run writes and commits its own `halted` row too (see the single-feature entry below).
- Entry (single feature): `feat-{feature-name}` branch, start with `/pdlc:orchestrate-dev docs/{feature-name}/REQ-{feature-name}.md`. `orchestrate-dev` declares two inputs — `reqPath` (required) and `forcePhases` (optional). The bare-string form above supplies `reqPath` only; to override a recorded approval pass the **object form**, `{ "reqPath": "docs/{feature}/REQ-{feature}.md", "forcePhases": "R,F" }`. `forcePhases` is a comma- or space-separated subset of `R, F, T, P, D, PR` or the token `all`; an unrecognised token halts with a message naming the catalogue. Forcing overrides a recorded **approval** only — an unresolved POSTMORTEM still refuses the phase. Note that the queue path does **not** forward `forcePhases`: `orchestrate-queue` runs unattended, so a forced re-run is always a direct `orchestrate-dev` invocation. **A direct run also records its own halt in the queue.** When the pipeline halts, `orchestrate-dev` — not only `orchestrate-queue` — rewrites the feature's row in `docs/_queue/QUEUE.md` to `halted` and then **git-commits that one file** (`git add -- {queuePath}` then `git commit -m "chore(queue): {feature} → halted" -- {queuePath}`, both pathspec-scoped, never `-a`, never pushed), so the halt survives the process. It is a no-op where there is nothing to record: no `QUEUE.md` reports `queueRow: "none"` and touches neither disk nor git, and a missing row reports `queueRow: "error"` without writing. A git refusal (hook, missing identity, index lock) yields disposition `"recorded (uncommitted)"` — the row is correct on disk, commit it yourself — and never downgrades the halt itself. (The disposition names the row *write* — `recorded` / `recorded (uncommitted)` / `none` / `error` — never the `status` value written, which stays `halted` here.)
- Entry (queue, multi-feature): `/loop run /pdlc:orchestrate-queue` — one ready feature per iteration, dependency-ordered
- Definition of Done (Phase DOD): runs after the Final Codebase Review, before Harvest. Step 0 rebases `feat-{feature}` onto the latest default branch via `ship-pr` (halts on conflict). Then an evaluator→optimizer loop: `dod-verify` documents findings in `CODE_REVIEW-{feature}-v{N}.md` (does not fix), and `orchestrate-dev` dispatches `se-implement` to remediate them via TDD, re-verifying up to 3 rounds before halting. Set `PHASE_DOD_ENABLED = false` to skip.
- Auto-PR (Phase PUB): after Harvest, `orchestrate-dev` raises (or reuses) the feature PR via the `ship-pr` skill, then polls GitHub checks directly via `gh pr view --json statusCheckRollup` (no agent in the poll loop). The branch was already rebased in Phase DOD, so `ship-pr` does not rebase here. The script polls the PR; if no checks appear within 10 minutes it assumes the repo has no PR checks and passes the phase. Once checks appear, all must pass or the pipeline halts. The final report carries `prUrl` and `ciStatus`. The PR is not merged by Phase PUB itself — merging, if it happens, is Phase MERGE's job, next.
- Merge & Advance Queue (Phase MERGE): the last phase, and a fixed decision ladder — no agent, no LLM judgment. `mergeMode` (`off` / `gated` / `on`) ships `off`, so the phase resolves `skipped` until an operator opts in per-repo via `.claude/pdlc.config.json`. Even when enabled, it never merges a PR that touches a self-modification guard path — `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, and `.claude/workflows/` by default, additively configurable — nor one that fails any of its other preconditions (repo capabilities, mergeable state, unresolved review threads, CI status, idempotence against an already-merged PR). `mergeStatus` on the final report is one of `merged` / `deferred` / `refused` / `skipped`. On `merged`, the phase writes the queue row `done` with an `Evidence` cell itself, superseding the human-merge step above; on any other outcome the row stays `awaiting-merge` for a human, with a one-line reason on the report — a closed set of four conditions (guard fired, CI evidence refused, merged-but-queue-not-updated, post-merge tree failure) additionally raise a `MERGE ESCALATION:` notice; nothing in this phase halts the pipeline.

