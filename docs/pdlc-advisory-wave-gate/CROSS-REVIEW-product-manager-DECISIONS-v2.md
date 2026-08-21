# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.11)
**Date:** 2026-08-20
**Iteration:** 2

Delta re-review. Base for the diff is `3604d465` (the v1.10 closing-pass commit my v1 review read);
the changed sections are the header block, the v1.10 note's item 1, the new v1.11 note, `## Context`
constraints 1–2, DEC-01's option B and D rows, DEC-A6-01's ignored-path and reversibility passages,
DEC-A6-02's decision sentence, DEC-A6-03's routing paragraph, and four `## Consequences` bullets.
Unchanged sections are not re-litigated.

## Prior Findings — Disposition

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | Context constraint 1 re-grounded on the shipping channel |
| F-02 | Medium | **Resolved** | Per-promoted-task cardinality now stated in the decision sentence, the option-C row and the Consequences bullet |
| F-03 | Medium | **Resolved** | The transport constraint now cites TSPEC §1.2 and says plainly that no requirement closes the set |
| F-04 | Low | **Resolved** | Provenance cell names the harvested rounds rather than enumerating dead files |

### F-01 (High) — resolved, and re-grounded on a channel that exists

The replacement bullet ("The shipping channel vendors a fixed list of module files") is accurate in
every clause I could check at HEAD:

- `pdlc/engine/scripts/prepack.mjs:20` is verbatim `const MODULE_NAMES = ["orchestrate-dev.js",
  "orchestrate-queue.js"];`, and `:39` maps it into the copy step, as the bullet says.
- The three-list claim holds: `MODULE_NAMES` (`prepack.mjs:20`), `WORKFLOW_MEMBERS`
  (`pdlc/engine/scripts/publish-preflight.mjs:220`, three `vendor/workflows/…` members feeding
  `expectedPackedSet`'s member-for-member set at `:239`), `WORKFLOW_MODULE_NAMES`
  (`pdlc/engine/scripts/fixture-machine.mjs:426`, consumed at `:449`). A file added beside
  `orchestrate-dev.js` is invisible to the published package until all three are edited — the
  bullet's count is right and each list is a real hardcoded literal, not a glob.
- The retired premises are named as retired, correctly: `build-runtime.mjs`'s header records the
  three per-module bundles as retired with the workflow runtime and says the builder "now emits a
  single artifact: `pdlc-cli.mjs`", and the consumer copy is swept —
  `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`'s `EXPECTED_ENTRIES` carries
  `orchestrate-dev.bundle.js` as a *deletion* entry, not a sync target.

The change I care about most as a PM is the one the author made without being asked: "add a module"
stops being an impossibility claim and is re-rejected **on merit**. That is the honest shape. The
merit argument is checkable too — `buildA4SeamOps` (`orchestrate-dev.js:2784`), `buildA5SeamOps`
(`:2909`) and `buildA6SeamOps` (`:3063`) are genuinely co-located, so "splitting it out would buy
nothing while paying the three-list edit" is a cost comparison against the tree rather than an
intuition. Option-space pruning is now auditable, which is what the finding asked for.

The v1.10 note's item 1 is marked *superseded* in place rather than rewritten, with the reason
retained. That is the right call for a decision record: the round's actual reasoning stays legible.

### F-02, F-03, F-04 — resolved

- **F-02.** The decision sentence, DEC-02's chosen option C row and the Consequences bullet all now
  say **per promoted task**. The shipped shape matches: `orchestrate-dev.js:15471` is
  `for (const promo of waveResolvedPromotions)` with one `commitPaths` call per iteration
  (`:15472`), the message template carrying `${promo.taskId}` (`:15474`), and
  `waveResolvedPromotions` is the return of `groupPromotedPaths` (`:3329`, assigned at `:15403`).
  The Consequences bullet's "Kinds, not counts" gloss is the sentence an operator reading `git log`
  needed.
- **F-03.** The bullet now cites the clause that actually closes the set — TSPEC §1.2, line 301,
  quoted accurately ("No new module, no new file, no new transport, no new credential (NFR-3)") —
  states NFR-3's narrower content, and then says the thing I most wanted said: "no requirement
  closes the transport set; TSPEC's design envelope does, and this feature adopts it as an
  engineering constraint." Pruning stays honest.
- **F-04.** The cell names the harvest (`9cf48051`, "docs(learnings): delete harvested cross-reviews
  and DoD code reviews" — the commit exists with that subject) and states the numbering restart. The
  adopted convention (index rounds *responded to*; name harvested rounds as harvested) is better
  than the enumeration I asked for, because it does not rot again on the next harvest.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Cross-Feature | The revision introduced `git add -A --` in three places; the shipped capture runs `["add", "-A"]` with no `--`, and TSPEC's own prose, its O-1 row and PLAN A6-10 all say `git add -A` | REQ AC-5.1; FSPEC BR-9; TSPEC O-1, §2.5 |
| F-02 | Low | Local | "Add a module" is now rejected on merit, but the merit rejection lives only in `## Context`; no row in `## Options Considered` records it, so the option tables still do not show the option was weighed | REQ O-1 (scope envelope) |

### F-01 (Medium, Cross-Feature) — the delta added a `--` the implementation does not run

Three sites changed from `git add -A` to `git add -A --` in this revision: DEC-01's chosen option D
row (line 195, both the mechanism cell and the ignored-path clause) and DEC-A6-01's
"Constraints that forced the shape" paragraph (line 268), alongside the argv list at line 244.

The shipped capture does not carry the separator:
`pdlc/workflows/orchestrate-dev.js:12580` is `const add = await gitWithLockRetry(["add", "-A"], {`,
and the function's own docstring (`:12549`) writes the verb as `git add -A`. Every other document
that states this argv agrees with the code: TSPEC's O-1 obligation row (line 281), TSPEC §2.5's two
prose bullets (lines 490 and 496), TSPEC §6 OQ-5 (line 1753), and PLAN A6-10's green-step spec
(`add -A`). The one place `--` appears upstream is the ASCII mechanism block at TSPEC line 477 — so
the document transcribed faithfully from a block that is itself out of step with its own prose and
with the code, and then propagated the odd variant three times.

Why this is worth a finding rather than a nit: this is the *decision record for the capture
mechanism*, and the same round repaired two neighbouring transcription defects on exactly this
ground — TE F-01's fail-closed sentence ("transcribed as written the sentence yields a property that
fails against correct code") and TE F-06's `-m "…"` elision note. An argv transcription in this
document is downstream-transcribable by exactly the same route: an argv-sequence oracle written from
this row asserts a separator the production path never emits. The document's stake in DEC-A6-01 is
that the mechanism is stated "against shipped code, not intuition"; `--` is neither.

Resolution: restore `git add -A` at all three sites (the argv the code runs and the argv the rest of
the artifact set states), and route the TSPEC block/prose divergence upstream — I am emitting it as
a TSPEC erratum, not folding it into this document's verdict.

Scope is `Cross-Feature` rather than `Local` under the tag-selection discipline: the same divergence
sits in two phases' documents (TSPEC §2.5's block and this record), and the transferable lesson —
an argv quoted in a decision record is checked against the shipped call site, not against another
document's rendering of it — outlives this feature.

### F-02 (Low, Local) — the merit rejection of "add a module" is not tabled

Context now says "add a module" is "rejected **on merit** wherever it would apply below", with a
real argument (co-location with `buildA4SeamOps` / `buildA5SeamOps`, the three-list edit, a second
vendoring surface). But no row in `## Options Considered` carries it: DEC-01's table runs A–D, none
of them "a new module", and the other three tables likewise. A reader auditing option completeness
from the tables — the way a reader normally reads this section — still sees the option absent, and
has to reach back into Context to learn it was weighed rather than overlooked.

This is Low because the ground is now stated and checkable, which was the substance of v1's F-01;
what is missing is only its placement. Either a one-line row in DEC-01's table ("**E. Put A6's
mechanism in a new module** — rejected: three-list vendoring edit, no reuse gained; see Context")
or an explicit sentence under `## Options Considered` saying the class is rejected once in Context
for all four entries would close it.

## Questions

| ID | Question |
|----|---------|
| Q-01 | v1's Q-01 (the `0`-configured repo still accumulating one dangling ref and one commit object per red wave, forever) is not addressed in the delta. A6-15's `waveBudgetPerRun: 0` fixture confirms the behaviour — `advisoryWaveGate.test.js:1592` asserts `commit-tree` observed exactly once on a zero-budget red wave, so an operator who set `0` to mean "off" still pays a capture per red wave. DEC-A6-04's new "what the example teaches is the default, not the affordance" bullet is a good answer to a different question. Is the accumulation under `0` an accepted cost, and if so is DEC-A6-04 or DEC-A6-03 the entry that should say so? Not gating — no requirement is misstated either way — but a `0`-configured repo is the one configuration that pays a cost for a feature it opted out of, and the reader currently has to compose two entries to notice. |
| Q-02 | DEC-A6-03's routing paragraph now states the gap honestly and checkably ("`a6-snapshot`, 'copy the ref' and 'overwrit' match nothing in either document" — I confirmed zero matches in REQ v1.15 and FSPEC v1.6). It says the item "is re-emitted as a REQ erratum this round"; I am emitting it. Since REQ is `approved (shipped)`, the likely dispositions are "add the sentence to E-28" or "decline and record". Either is fine for this record — but if it is declined, this entry should say *declined*, not carry the gap indefinitely. Worth a re-evaluation trigger of its own? |
| Q-03 | DEC-A6-04's TE F-05 passage is the most product-honest paragraph in the delta: it says the collapse regression "ships green" today and names A6-15 as owing the present-and-zero conjunct. I verified that: `advisoryWaveGate.test.js:1592–1619` asserts disposition, `agent.calls` empty and `commit-tree` once, drives `runWaveGateSeam` directly, and never reaches a report advisory summary key. Given the feature is shipped, who holds that obligation now — is it a PLAN task still open, or a post-ship follow-up? The record says "recorded here rather than closed"; naming the owner surface (task id, or queue row) would make it findable. |

## Positive Observations

Everything below I checked against the tree, not against the document's word.

- **The v1.11 note leads with what did *not* move, and it is true.** "No decision *outcome* moved:
  every alternative rejected below stays rejected, on the same side" — I diffed all four option
  tables; the only chosen-row edit is DEC-02's option C gaining *per promoted task*, which is a
  cardinality repair inside the chosen option, not a re-decision. For a PM auditing a seven-repair
  round on a shipped feature, that sentence is the one that makes the rest readable.
- **The impossibility→merit correction is the right instinct, generalised.** The note names the
  signature of all three substantive misses — "claims about **failure modes, visibility and
  impossibility**, none of them falsifiable by the grep-shaped check that confirms a count" — and
  says v1.10's sweep was not exhaustive rather than leaving unswept claims reading as verified.
  That is durable process signal, and it is stated in the artifact where the next reader will hit it.
- **The fail-closed split is exactly the repair a downstream transcriber needed.** Verified in code:
  `captureTreeSnapshot` (`orchestrate-dev.js:12566`) routes every failed verb through
  `fail(verb)` (`:12572`) returning `null` and never throws — its docstring says so at `:12558`
  ("Returns `null` on any `ok !== true` — never throws") — while `restoreTreeSnapshot` (`:12635`)
  throws on each of `read-tree --reset -u`, `clean -fd`, `reset --mixed`, with the docstring
  contrasting the two deliberately. The bullet's conclusion — fail-closed is a property of the
  *pair*, "both halves end the wave; neither leaves a repair half-applied" — is the sentence a
  PROPERTIES author can transcribe without writing an oracle that fails correct code.
- **Reversibility ratings got *more* honest, not more flattering.** DEC-A6-01's rating moved from
  "module-private" to "exported and directly unit-tested", i.e. from cheap-to-reverse to
  reddens-tests-an-operator-sees. Verified: both are `export async function` (`:12566`, `:12635`).
  Restating a rating in the direction that raises the cost of reversal is a good sign about the
  record's incentives.
- **The OQ-7 closure is transcribed as a decision, not as a hedge.** The four hedged sites now read
  as the settled boundary, and the re-evaluation trigger is restated as a *reversal* of BR-9's
  ignored-path exclusion rather than a pending OQ. That matches PLAN A6-10, which already specifies
  the ignored-path round trip as "a **fully asserted live case** … no pending marker is used", with
  a paired positive/negative oracle (an ignored path mutated between snapshots leaves both hash maps
  equal *and* an implementation that restores it fails). Mechanism, oracle and record agree.
- **Option B's correction volunteers a falsification of the document's own prior claim.** The row
  now says the runtime-cannot-use-`fs` premise "is false at HEAD" — verified,
  `orchestrate-dev.js:20` is `import * as fs from "fs";` — and replaces it with the narrower thing
  actually enforced: `advisoryWaveGate.test.js:3183`'s A6-07 / PROP-NFR-04 source scan, whose
  forbidden set is verbatim `/\bprocess\b/, /\bDate\b/, /Math\.random/, /\brequire\(/, /\b_now\b/,
  /\bglobalThis\b/` (`:3196`) over the five named helpers. The row keeps its rejection and loses a
  false ground — the same move as F-01's, applied without being asked.
- **The example-config bullet answers a discoverability question with a product argument.** Verified:
  `.claude/pdlc.config.example.json` carries `"waveBudgetPerRun": 1` and
  `pdlc/engine/__tests__/advisory-config-example.test.js:54` requires only `>= 0` with the message
  "0 is a legal configured value, E-33". The bullet's reasoning — an example config's job is to show
  a working default, and shipping `0` would teach operators to disable a tier that is already off by
  default — is a product judgement stated as one, with the residual gap handed to REQ/FSPEC rather
  than absorbed here. That is the scope discipline this document has been good at throughout.

## Recommendation

**Approved with minor changes**

v1's blocking finding is resolved, and resolved better than asked: the constraint that pruned the
option space for all four entries is now grounded on the channel that actually ships
(`prepack.mjs`'s `MODULE_NAMES`, plus the two sibling lists), and the class of options it used to
foreclose by impossibility is re-rejected on merit. The three non-blocking findings are resolved
too, and nothing in the delta broke a section I approved at v1 — all four decision *outcomes* are
unchanged, and the repairs land inside supporting prose.

No High findings. Recommended in the next editing pass, neither gating:

1. **F-01** — restore `git add -A` (no `--`) at the three sites the delta changed: DEC-01's option D
   row (mechanism cell and ignored-path clause), the argv list in DEC-A6-01's decision paragraph,
   and the `clean -fd` / ignore-semantics sentence. The shipped call is `["add", "-A"]`.
2. **F-02** — table the "new module" option in DEC-01's `## Options Considered`, or state once under
   that heading that the class is rejected in Context for all four entries.

Two items are routed upstream as errata rather than folded into this verdict: TSPEC §2.5's mechanism
block disagreeing with its own prose, its O-1 row and the shipped argv on `add -A --`; and the
operator-facing halt-message obligation DEC-A6-03 carries, which is still absent from REQ and FSPEC
at v1.15 / v1.6 and which this record re-emits rather than leaving implied.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
