---
Status: Draft
Author: se-author
Version: 1.1
Feature: pdlc-decision-ledger
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.2**, cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v1.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

# DECISIONS — pdlc-decision-ledger

## Context

This document is the **rejected half** of the pdlc-decision-ledger design. What was decided *for*
is in `TSPEC-pdlc-decision-ledger.md`; recorded here is what was decided *against*, and why, for
the choices a later agent could otherwise confidently reconsider — each one is a place where a
plausible, cheaper-looking alternative exists and the reason it was refused is not visible from the
shipped code.

**The envelope the design had to fit.** Four constraints, none of them this feature's to relax,
fix the shape of nearly every decision below:

| Constraint | Where it comes from | What it forecloses |
|---|---|---|
| No engine-runtime edit under `pdlc/engine/`, and no growth of the frozen vendoring list | REQ NG-6 (runtime) + `MODULE_NAMES` in `pdlc/engine/scripts/prepack.mjs` | A new `pdlc/workflows/lib/` module: `MODULE_NAMES` is a frozen four-entry list the engine vendors at pack time, so a new module means editing `pdlc/engine/` — a build script, not runtime, so the refusal rests on the frozen list and NG-6's spirit, not on NG-6's literal text, which forbids runtime changes only and expressly permits engine-side tests (`DEC-LOOPECON-08`) |
| The disabled path is byte-identical | REQ C-2 | Any mechanism whose text cannot be config-gated — notably a `SKILL.md` edit |
| `/\.enabled\b/` is source-count-pinned outside one sentinel region | `pdlc/workflows/__tests__/advisoryDisabled.test.js` PROP-DIS-06, whose `sourceExcludingParser` slices between the literals `// === LEARNINGS INJECTION REGION START ===` and `// === LEARNINGS INJECTION REGION END ===` | Both a dotted `enabled` read at the new gate, and hiding the new symbols inside the sliced region |
| The rendered extent must equal the Baseline's measured extent | REQ-DECLEDGER-01 against `M-1d` / `M-2e` | Any recognition rule tuned by taste rather than executed against the standing corpus |

**Precedents adopted rather than reinvented**, all in `pdlc/workflows/orchestrate-dev.js`:
`parseLearningsConfig` (line 2252) and its non-negative-int field validator (2283) for per-key
fail-open config; `findingGrammarPart` (11453) for a gated clause contributing zero bytes when off;
`buildLearningsInjector` (2825) wired through `wrapperSeams._injectLearnings` (15186) for the
build-once/call-per-dispatch injector; `LEARNINGS_CORPUS_ARGV` (2230) for `git ls-files`
enumeration through the `_git` seam; and
`pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js` with
`scripts/capture-learnings-baseline.mjs` for the committed byte-identity baseline. Reusing these is
not itself a decision needing a record — refusing to reuse one would have been.

**Project-level decisions honoured and not re-litigated:** `DEC-DOC-01` (cite content, not line
number — the raw `file:line` anchors above are position claims about test slicing that a test
asserts, which is the exemption that decision names), `DEC-ANCHOR-01`, `DEC-ERRROUTE-04`,
`DEC-TERM-01`. `DEC-LOOPECON-08` is a completed feature's decision, not a promoted one, but it is
binding here for the same mechanical reason it was binding there, and is cited rather than
re-derived.

**Measurements are cited, never restated.** Corpus extents live in
`docs/_constraints/pdlc-decision-corpus-baseline.md` (`M-*` ids) and byte figures in TSPEC §3.6;
this document names them and does not carry second copies, so a re-measurement moves one site. The
Baseline's re-measurement to **v1.2** exercised exactly that path and this document was re-pinned to
it: the `M-7` block (`M-7a` project-level substance bytes, `M-7b` the 63-record worst standing case,
`M-7c` the cap that clears it) is the measured authority behind REQ C-5's shipped `maxBytes`
**12,500**, and every byte figure below is derived against that value, never against the retired
8,000.

## Options Considered

One subsection per decision, carrying the alternatives that were real and the reason each was
refused. The chosen form of every decision is in **§ Decision** below, stated once.

### DEC-DECLEDGER-01 — in-file duplicate resolution

*Rejected: key on the heading separator* (`:` = decision, `—` = question). It happens to work on the
sole HEAD instance (`M-3a`: `DECISIONS-pdlc-engineering-loop.md`, 13 records over 7 ids) and is
unfalsifiable anywhere else, it makes the correctness of the statement field depend on punctuation
no author was ever instructed to use, and it silently drops any record written with the other
separator. *Rejected outright: key on the **first** record.* `M-3c` records that the first opening
states the question and the second states the outcome, so first-wins renders a question as a
decision and violates BR-3 directly.

### DEC-DECLEDGER-02 — cross-file precedence

*Rejected: feature-level wins.* A decision promoted to project level renders in its promoted form
(`M-5c`); the promoted copy is the one the pipeline maintains. *Rejected: a path-ordering
tie-break.* `M-5c` warns it is not well-defined without naming a collation — `_` (`0x5F`) inverts
under case-folded collation, so `docs/_decisions/` sorts before or after `docs/{feature}/`
depending on a locale nobody pinned. *Rejected: a cardinality-only oracle for this rule.* Both
precedence directions emit exactly one line, so cardinality alone passes under the rule this design
rejects — the textbook precedence false green.

### DEC-DECLEDGER-03 — omission order under the bound

*Rejected: relying on the order being inert.* An earlier TSPEC draft argued the order never fires
under shipped defaults because `maxEntries` 70 clears `M-6b`'s 63-line floor; both TSPEC reviewers
falsified that reasoning by measuring, against the then-current `maxBytes` 8,000, that the byte bound
binds first. REQ v1.8's **measured** 12,500 (Baseline `M-7c`) moves the arithmetic again: a G-1-scoped
worst standing case of 63 records rendering 10,859 bytes (TSPEC §3.6) sits inside an 11,300-byte
allowance (12,500 less DEC-DECLEDGER-12's 1,200 of framing), and 63 sits inside `maxEntries` 70 — so
at the Baseline commit **neither bound fires and the order is inert again**, for a different reason
than the draft gave. The refusal stands on a ground that survives the raise: inertness is a
measurement at one commit, not a property of the mechanism — the same distinction DEC-DECLEDGER-13
draws for the promoted set — and C-5's thresholds are operator-configurable non-negative integers
(DEC-DECLEDGER-15), so any operator who lowers either one fires the order on the very next dispatch,
at which point an unspecified order is unfalsifiable exactly when it goes live. Which bound fires
first is corpus-dependent and is not assumed anywhere: over the G-1-scoped 63 records the entry cap
has slack, so a lowered `maxBytes` fires first; over TSPEC §7.3's whole 141-record fixture
`maxEntries` 70 fires first and forces at least 71 omissions before the byte bound is reached, which
is why §7.3's `omitted[]` conjunct does not go vacuous under the raise. *Rejected: project-level omitted
first, or plain enumeration order.* Dropping promoted material before feature material inverts what
the corpus is for. *Rejected: truncating or abbreviating a line to fit.* Whole-line omission keeps
"which decisions were shown" answerable; a truncated statement is a decision misquoted to a
reviewer, which is worse than an absent one (BR-13, N-1, E-8).

### DEC-DECLEDGER-04 — which prompts the index attaches to

*Rejected: attach to every reviewer-facing prompt* — delta-confirmation and finding-restatement
included. Both forbid re-review in their own text ("Do not re-review the whole document"; "Do NOT
re-review anything"), so an index whose whole content is *do not re-open closed decisions* has
nothing to act on there, and every added byte enlarges the REQ C-2 byte-identity surface for no
behavioural gain. The cost of the refusal is disclosed, not hidden: REQ G-4 counts committed
`CROSS-REVIEW-*` artifacts including confirmation rounds, so G-4's denominator is **wider** than
this mechanism's injection surface and a G-4 trend is not a clean measurement of the mechanism
(TSPEC §2.5). G-4 is non-binding and carries no acceptance criterion, so narrowing G-4 or widening
the surface would both cost more than the signal is worth.

### DEC-DECLEDGER-05 — where the wiring lives

*Rejected: edit the reviewer `SKILL.md` files.* Decisive and mechanical: `SKILL.md` text cannot be
config-gated, so REQ C-2's byte-identical disabled path would be unachievable — the block would
ship to every reviewer on every feature with no key to turn it off. Secondarily, a `SKILL.md` edit
routes through the consolidation contract's `CONSOLIDATION-PROPOSAL` review, a cost the dispatch
route does not carry. Dispatch construction is where the shipped `findingGrammarClause` gate
already lives (`orchestrate-dev.js:11453`), so this is the reuse route as well as the cheap one.

### DEC-DECLEDGER-06 — id minting and uniqueness

*Rejected: mint ids, or enforce global uniqueness across namespaces.* There is nothing to fix —
`M-1a` records no id repeating within `docs/_decisions/` (41 carriers, 41 distinct ids, which this
author re-executed and reproduced), and `M-5a` records no id recorded in two files anywhere at
HEAD. A uniqueness *gate* would be a new operator-facing failure class, which REQ G-3 forbids: it
converts a corpus-authoring slip into a halted dispatch. DEC-DECLEDGER-02's precedence rule is the
total resolution for the collision that does not yet exist, at no runtime cost.

### DEC-DECLEDGER-07 — what `maxBytes` charges for

*Rejected: exclude framing, as `renderLearningsBlock` does.* BR-12 bounds "the bytes of the index
block as it appears in the prompt", and the rule text sits inside that block. Excluding framing
would let a low `maxBytes` be reported as satisfied while the block a reviewer actually receives is
arbitrarily larger than the operator asked for — the bound would be enforced against a quantity
that never reaches the prompt. Diverging from the learnings precedent here is deliberate and is the
one place this design does not clone it.

### DEC-DECLEDGER-08 — where the new symbols land in the tree

*Rejected: a new `pdlc/workflows/lib/` module.* Not available: `MODULE_NAMES`
(`pdlc/engine/scripts/prepack.mjs`) is the frozen four-entry list the engine vendors at pack time, and
adding a module means editing that list — a file under `pdlc/engine/`. The refusal rests on the
frozen list itself, and on REQ NG-6's spirit of leaving `pdlc/engine/` alone, rather than on NG-6's
literal text: NG-6 forbids engine **runtime** changes and expressly permits an engine-side
config-disclosure test, and `prepack.mjs` is a pack-time build script, so a literal reading of NG-6
would not by itself forbid this edit. The list is nonetheless not this feature's to grow. `DEC-LOOPECON-08` took the
same refusal for the same reason and recorded the same cost: every implementation task writes one
physical file, so waves serialise on it. That cost is taken knowingly and is the PLAN's to absorb
with real `Deps` edges. *Rejected: land the symbols inside the
`// === LEARNINGS INJECTION REGION ... ===` sentinel block.* It looks tidy — the code is a clone of
what lives there — and it is exactly wrong: `advisoryDisabled.test.js` slices that region out
before counting `/\.enabled\b/`, so landing inside would silently exempt this feature from
PROP-DIS-06 and leave DEC-DECLEDGER-09's destructured-read discipline with no oracle behind it. The
region belongs to `pdlc-learnings-injection`; this is not that feature.

### DEC-DECLEDGER-09 — how the enablement flag is read

*Rejected: `decisionLedgerConfig.enabled`, the obvious spelling.* PROP-DIS-06 pins the source-text
count of dotted `enabled` reads to the advisory config's three gates alone, outside the sliced
region; a fourth dotted read reddens a property this feature has no mandate over. The shipped
`pinCheckEnabled` read is destructured for precisely this reason (`orchestrate-dev.js:15105`, with
the comment saying so at 9266), so this is the shipped house style, not a workaround.
*Rejected: truthiness (`if (config.enabled)`).* Every fail-open shape — absent block, wrong-typed
value, unparseable file, malformed section — resolves to the `false` default, and `=== true`
collapses all four spellings of "not enabled" into one outcome (FSPEC E-1, AT-05).

### DEC-DECLEDGER-10 — the rendered citation format

*Rejected: `[{sourcePath} § {heading}]`, which an earlier draft specified.* The heading *is* the id
plus the statement, so that form rendered every statement twice — 9,371 bytes against 6,305 for the
project-level set, about a third of the block spent on a duplicate (TSPEC §3.6; this author
re-executed the recognition rule at HEAD and reproduced 41 ids and the 6,305-byte figure). Path
plus id resolves the record at its own source, which is all BR-3 and AT-02 require, because the id
is unique within its file (`M-1a`) and DEC-DECLEDGER-01's last-wins key makes it so by construction
where it is not. *Not rejected but reclassified:* `DecisionRecord.heading` stays on the type as the
verbatim text fixtures transcribe expected values from — it is simply not rendered.

### DEC-DECLEDGER-11 — who computes the block's size

*Rejected: let `selectDecisions` size the block from its own concatenation.* Two implementations of
one format drift, and this drift is invisible in the worst direction: BR-12's bound would be
enforced against a size the prompt does not have, with both functions individually looking correct
and every test green. Having the selector call the renderer costs one extra render per selection
round and buys a single producer of ledger bytes.

### DEC-DECLEDGER-12 — the framing budget

*Rejected: leave framing unmeasured.* DEC-DECLEDGER-07 charges framing to `maxBytes`, so unpinned
framing is an unmeasured quantity inside a measured budget and TSPEC §3.6's headroom arithmetic
becomes unfalsifiable prose. *Rejected: measure the constants after they are written and pin that
number.* The constants do not exist yet; 1,200 is a **budget the rule text must be drafted to fit**,
and it is not free: block framing and per-record framing are drawn from the *same* 12,500, so a raise
spends the margin twice over. Against REQ C-5's shipped `maxBytes` 12,500 the allowance left for
records is 11,300, and the G-1-scoped worst standing case renders 10,859 (TSPEC §3.6, `M-7b`'s 63
records) — **441 bytes of slack**, which any raise of this budget consumes one-for-one. Baseline
`M-7c` allocates the 3,204 bytes by which 12,500 clears `M-7b` as ~50 bytes per record of *per-line*
framing across 63 records; this 1,200 is *block* framing drawn from the same figure, not on top of
it. A drafting task that overruns must re-open the arithmetic together with the `maxBytes` default,
not quietly raise the literal.

### DEC-DECLEDGER-13 — how "the promoted corpus is admitted whole" is stated

*Rejected: state it as a property of the mechanism.* It is not one. The order *prioritises* project-level
records but drops them once feature-level lines are exhausted; what admits the promoted set whole
today is measured headroom, not a guarantee. Under REQ C-5's shipped `maxBytes` 12,500 that headroom
is 4,995 bytes (6,305 rendered against an 11,300-byte allowance) — at the corpus's ~154-byte mean
line, roughly 32 more promoted decisions — while `maxEntries` 70 admits only **29** more. So the
**entry** bound, not the byte bound, is what would first stop admitting the promoted set whole, in a
directory this pipeline itself grows by consolidation. Both figures are a corpus at one commit; an
unpinned "always" expires silently with every test green. *Rejected: build the pinning assertion over
the project-level-only slice.* At 41 records against `maxEntries` 70 and 6,305 bytes against the
11,300-byte allowance nothing is omitted under *any* drop order — the raise widens that margin rather
than closing it — so the `omitted[]` conjunct would be vacuously true and could not falsify the
re-ordering it exists to catch, the vacuous-green shape a prior feature's harvest already recorded.
Over the whole 141-record fixture the conjunct survives the raise, because `maxEntries` 70 alone
forces at least 71 omissions.

### DEC-DECLEDGER-14 — how AT-03's "a record changes between two dispatches" is exercised

*Rejected: mutate the frozen fixture file, as FSPEC AT-03 literally says.* The per-file digest guard
that AT-01 requires makes the copy immutable, so a mutating test reddens the integrity guard — the
two criteria contradict each other as written — and the mutation would also write to the working
tree, which the frozen-copy discipline exists to prevent. Scripting the `_readFile` double's
returned text preserves what AT-03 is *for* (re-gathering per dispatch, holding no snapshot; BR-9)
and is the stronger falsifier, since it varies only the bytes the injector reads.

### DEC-DECLEDGER-15 — threshold validation

*Rejected: positive-integer validators*, the typing an earlier REQ draft carried. FSPEC E-7 requires
`maxEntries: 0` to be a valid admits-nothing value, "not an error, not a fallback to the default,
not a halt"; a positive-integer validator rejects `0` and falls it back to `70`, the opposite
outcome. The shipped precedent already resolves the same tension the same way — `parseLearningsConfig`'s
`nonNegativeInt` (`orchestrate-dev.js:2283`) exists so that `0` is a valid admits-nothing value.
This decision is now **aligned with, not spanning a gap in, its upstream**: REQ v1.8 types both
`decisionLedger.maxEntries` and `decisionLedger.maxBytes` as **non-negative** integers and states in
terms that `0` is a valid admits-nothing value rather than a malformed one falling back to `70`
(REQ §6 C-5, and its v1.8 erratum note giving E-7 as the reason). FSPEC E-7 and REQ C-5 therefore
now say the same thing, and no REQ edit is outstanding for it.

## Decision

Each row states the chosen form once. `TSPEC §` is where the mechanism is specified in full — this
table does not restate it — and `TSPEC D-` is the id the TSPEC's own §9.1 summary used, recorded so
a reader arriving from that table lands here without guessing.

| Id | Decision | TSPEC § / D- | Constraint that forced the shape | Reversibility |
|---|---|---|---|---|
| **DEC-DECLEDGER-01** | Where a file records one id more than once, the **last** record in file order renders | §3.3 / D-1 | BR-3's what-was-decided contract against `M-3c`'s question-then-outcome instance | Easy — one key in the recogniser; no expected value outside `M-3a`'s file moves (`M-3d`) |
| **DEC-DECLEDGER-02** | Where one id is recognised at both origins, the **project-level** record renders, exactly one line; the key is **origin**, never path order | §3.4 / — | `M-5c`'s promoted-form intent; collation is undefined for `_` | Easy — but no HEAD witness (`M-5a`), so it is only ever exercised over a constructed fixture |
| **DEC-DECLEDGER-03** | Feature-level lines are omitted before project-level lines; within an origin, reverse enumeration order; whole lines only, never truncated; construction never aborts | §3.6 / — | BR-13, N-1, E-8; enumeration order is deterministic via `DECISION_CORPUS_ARGV` | Easy — pure comparator; §7.5's prefix conjunct is what makes it falsifiable |
| **DEC-DECLEDGER-04** | The index attaches to `reviewerPrompt` only — not the delta-confirmation or finding-restatement prompts | §2.5 / D-2 | REQ C-2's byte-identity surface; both other prompts forbid re-review in their own text | Easy — one more call site; the G-4 denominator disclosure moves with it |
| **DEC-DECLEDGER-05** | Wiring goes through dispatch construction in `orchestrate-dev.js`, never a `SKILL.md` edit | §1.1, FSPEC O-2 / D-3 | REQ C-2: `SKILL.md` text cannot be config-gated | **One-way door** in practice — the gate is the whole feature's premise |
| **DEC-DECLEDGER-06** | Ids are read, never minted; uniqueness is not enforced across namespaces and no gate is added | §3.2 / D-4 | REQ G-3 forbids a new operator-facing failure class | Easy — nothing exists to remove |
| **DEC-DECLEDGER-07** | Framing (header, preamble, rule text, trailer) **is** charged against `maxBytes` | §4.2, §4.3 / D-5 | BR-12 bounds the block as it appears in the prompt | Easy — one term in the bound; changes the measured headroom |
| **DEC-DECLEDGER-08** | All new symbols land in `orchestrate-dev.js`, **outside** the `// === LEARNINGS INJECTION REGION ... ===` sentinels; this feature's own wiring sentinels are differently named and are invisible to PROP-DIS-06's slice | §1.1, §2.3 / D-6 | REQ NG-6 + `prepack.mjs`'s frozen `MODULE_NAMES` (`DEC-LOOPECON-08`); PROP-DIS-06's slicer | **Hard** — reversing means a `lib/` module, i.e. an engine edit |
| **DEC-DECLEDGER-09** | The enablement flag is read **destructured** and compared `=== true` | §2.3 / — | PROP-DIS-06's dotted-read count; FSPEC E-1's four fail-open shapes | Easy, but reverting reddens PROP-DIS-06 immediately |
| **DEC-DECLEDGER-10** | The rendered citation is `[{sourcePath} § {id}]`; `DecisionRecord.heading` is retained but not rendered | §4.3 / D-7 | BR-3 / AT-02 need resolution at source, nothing more; the long form cost ~33% of the block | Easy — one template literal; moves every byte figure in §3.6 |
| **DEC-DECLEDGER-11** | `renderDecisionLedgerBlock` is the single producer of ledger bytes; `selectDecisions` calls it to obtain `renderedBytes` | §4.2 / D-8 | BR-12 must be enforced against the bytes the prompt receives | Easy |
| **DEC-DECLEDGER-12** | The four framing constants render to **≤ 1,200 bytes**, asserted by a pure unit test against that literal | §4.3 / D-9 | DEC-DECLEDGER-07 puts framing inside a measured budget | Easy to re-decide, deliberately noisy to breach |
| **DEC-DECLEDGER-13** | "The promoted corpus is admitted whole" is a **measured, pinned** fact at the Baseline's commit — asserted at C-5's shipped defaults over the **whole** frozen fixture: the 41 project-level ids entire, their 6,305 bytes within `maxBytes − 1200`, and a non-empty `omitted[]` naming no project-level id | §3.6, §7.3 / D-10 | The claim is not a property of the mechanism, and `docs/_decisions/` grows by consolidation | Easy — the pin re-decides at fixture re-capture, which is the intended moment |
| **DEC-DECLEDGER-14** | AT-03's change is applied to the scripted `_readFile` double's returned text, not to the fixture copy on disk | §7.6 / D-11 | AT-01's per-file digest guard makes the copy immutable | Easy — and routed upstream as `ERR-3` (open, FSPEC-owned) rather than left as a silent divergence |
| **DEC-DECLEDGER-15** | `maxEntries` / `maxBytes` are validated as **non-negative** integers, so `0` is a valid admits-nothing value | §4.1 / — | FSPEC E-7 and REQ v1.8's C-5, which now agree; `parseLearningsConfig`'s shipped `nonNegativeInt` | Easy — but reverting re-breaks E-7 |

## Consequences

### What downstream documents now owe

| Owed by | Obligation created here |
|---|---|
| PLAN | DEC-DECLEDGER-08 forces every implementation task to write the **same** physical file, so single-writer-per-batch serialisation is not advisory: the file cluster must be split by real `Deps` edges, one writer per batch (TSPEC §9.3 T-1 makes the same point for the baseline-capture ordering) |
| PLAN | The task that drafts `DECISION_LEDGER_RULE_TEXT` inherits DEC-DECLEDGER-12's ≤1,200-byte budget as an acceptance condition, not a hope |
| PLAN | DEC-DECLEDGER-09's destructured `=== true` read is a task-level requirement; a dotted read reddens PROP-DIS-06, a property this feature does not own |
| PROPERTIES | DEC-DECLEDGER-02 has no HEAD witness, so its two conjuncts — cardinality **and** the positive statement/`sourcePath`/`origin` equality against the project-level record — must both be asserted over a constructed two-file fixture (FSPEC O-5). Cardinality alone passes under the rejected direction |
| PROPERTIES | DEC-DECLEDGER-13's assertion is built over the **whole** fixture at shipped defaults, with 41 ids and 6,305 transcribed as expected values, never captured from the renderer |
| PROPERTIES | DEC-DECLEDGER-09 needs a **feature-owned** falsifier, not only the borrowed one. PROP-DIS-06's `toHaveLength(3)` count belongs to `pdlc-advisory-wave-gate`/`pdlc-learnings-injection`: if a later feature re-baselines that literal, a regression to a dotted read here stops reddening anything and the loss is silent. PROPERTIES must therefore carry a positive assertion over **this feature's own** source region (the `// === DECISION LEDGER WIRING START/END ===` run and the new function bodies, TSPEC §7.x's census slices) that the enablement flag is read destructured and compared `=== true`. PROP-DIS-06's count stays as a useful second line, never the primary one |
| PROPERTIES | DEC-DECLEDGER-11 means the bounds property's model must use its **own** formatter; deriving the model from the production renderer makes the no-truncation conjunct unfalsifiable |
| IMPL | DEC-DECLEDGER-14 means no test writes to a fixture file; corpus variation is scripted at the `_readFile` seam |

### Re-evaluation triggers

| Decision | Revisit when |
|---|---|
| DEC-DECLEDGER-03, DEC-DECLEDGER-13 | The frozen fixture is re-captured; or `docs/_decisions/` passes **70** promoted records, which is where `maxEntries` stops admitting the promoted set whole (the 11,300-byte allowance would reach roughly 73 records, so the entry cap fires first under C-5's shipped 12,500); or an operator lowers either threshold, which fires the omission order immediately. At those points the bound is re-decided, not the order |
| DEC-DECLEDGER-04 | A harvest shows closed decisions being re-opened in *confirmation* rounds specifically; that is the only evidence that would justify paying the byte-identity cost of a wider surface |
| DEC-DECLEDGER-06 | The first id recorded in two files at once appears at HEAD (`M-5a` currently records none) — precedence then acquires a live witness, and a uniqueness *report* becomes arguable, though a gate still is not |
| DEC-DECLEDGER-08 | Any future feature earns an edit to `pdlc/engine/`, at which point `MODULE_NAMES` can grow and the one-file constraint — and the serial waves it costs — lifts for this code too |
| DEC-DECLEDGER-10, DEC-DECLEDGER-12 | Either changes, and every byte figure in TSPEC §3.6 must be re-measured against C-5's `maxBytes` in one pass, not one figure at a time — REQ v1.8's raise to 12,500 (`ERR-2`, now closed) is the worked example of what a single-literal move costs downstream |
| DEC-DECLEDGER-15 | **Fired and closed:** REQ v1.8 retyped both C-5 thresholds as non-negative, so REQ C-5 and FSPEC E-7 now agree and this decision spans no gap. Revisit only if a future REQ re-narrows either threshold to positive integers, which would re-break E-7 |

### Risks accepted

- **The mechanism is measured over a proper subset of what REQ G-4 observes** (DEC-DECLEDGER-04).
  Disclosed rather than designed around, because G-4 is explicitly non-binding and carries no
  acceptance criterion. A later reader must not read a G-4 trend as this mechanism's effect.
- **The whole feature turns on the recognition rule being right.** It is not a judgement call: TSPEC
  §3.5 executes it against the standing corpus and reproduces `M-1d` and `M-2e` exactly, and this
  author independently re-executed the project-level half at HEAD (41 distinct ids; 6,305 bytes
  under the DEC-DECLEDGER-10 line format, 6,306 counting a trailing newline on the final line).
- **Serial implementation waves** (DEC-DECLEDGER-08), taken knowingly, as `DEC-LOOPECON-08` did.
- **Two of the four errata TSPEC §9.2 carries are still open: `ERR-3` and `ERR-4`, both
  FSPEC-owned.** DEC-DECLEDGER-14 is the design-side half of `ERR-3`. The other two are **closed**:
  `ERR-1` (C-5's thresholds retyped positive → non-negative) and `ERR-2` (the `maxBytes` default
  raised from an analogised 8,000 to a measured 12,500, Baseline `M-7c`) both landed in REQ v1.8, so
  DEC-DECLEDGER-15 records a settled alignment rather than an open divergence. That raise has already
  happened and cost no PLAN task its shape: it moved one literal in C-5's row and the same literal in
  the parser default, DEC-DECLEDGER-13's threshold followed it, and the transcribed 6,305 did not
  move. What it did move is every headroom figure in this document and in TSPEC §3.6, which is why
  DEC-DECLEDGER-10/-12's trigger row insists those be re-measured together.
