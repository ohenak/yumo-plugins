---
Status: Draft
Author: se-author
Version: 1.0
Feature: pdlc-decision-ledger
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` v1.1, cited by `M-*` id, never restated |
| Cross-Reviews | (none yet) |
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
| No engine-runtime edit under `pdlc/engine/` | REQ NG-6 | A new `pdlc/workflows/lib/` module: `MODULE_NAMES` in `pdlc/engine/scripts/prepack.mjs:20` is a frozen vendoring list, and adding a module means editing it (`DEC-LOOPECON-08`) |
| The disabled path is byte-identical | REQ C-2 | Any mechanism whose text cannot be config-gated — notably a `SKILL.md` edit |
| `/\.enabled\b/` is source-count-pinned outside one sentinel region | `pdlc/workflows/__tests__/advisoryDisabled.test.js` PROP-DIS-06, whose `sourceExcludingParser` slices between the literals `// === LEARNINGS INJECTION REGION START ===` and `... END ===` (lines 717–719) | Both a dotted `enabled` read at the new gate, and hiding the new symbols inside the sliced region |
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
this document names them and does not carry second copies, so a re-measurement moves one site.

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
under shipped defaults because `maxEntries` 70 clears `M-6b`'s 63-line floor. Both TSPEC reviewers
falsified it by measuring: `maxBytes` binds first in every case. *Rejected: project-level omitted
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
(`pdlc/engine/scripts/prepack.mjs:20`) is the frozen list the engine vendors at pack time, and
adding a module means editing `pdlc/engine/`, which REQ NG-6 forbids. `DEC-LOOPECON-08` took the
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
and it is not free — §3.6's ~495 bytes of headroom shrink one-for-one with any raise. A drafting
task that overruns must re-open the arithmetic together with the `maxBytes` default, not quietly
raise the literal.

### DEC-DECLEDGER-13 — how "the promoted corpus is admitted whole" is stated

*Rejected: state it as a property of the mechanism.* It is not one. The order *prioritises* project-level
records but drops them once feature-level lines are exhausted; what admits the promoted set whole
today is ~495 bytes of measured headroom — about three more promoted decisions, in a directory this
pipeline itself grows by consolidation. An unpinned "always" expires silently with every test
green. *Rejected: build the pinning assertion over the project-level-only slice.* At 41 records
against `maxEntries` 70 and 6,305 bytes against a 6,800-byte allowance nothing is omitted under
*any* drop order, so the `omitted[]` conjunct would be vacuously true and could not falsify the
re-ordering it exists to catch — the vacuous-green shape a prior feature's harvest already recorded.

### DEC-DECLEDGER-14 — how AT-03's "a record changes between two dispatches" is exercised

*Rejected: mutate the frozen fixture file, as FSPEC AT-03 literally says.* The per-file digest guard
that AT-01 requires makes the copy immutable, so a mutating test reddens the integrity guard — the
two criteria contradict each other as written — and the mutation would also write to the working
tree, which the frozen-copy discipline exists to prevent. Scripting the `_readFile` double's
returned text preserves what AT-03 is *for* (re-gathering per dispatch, holding no snapshot; BR-9)
and is the stronger falsifier, since it varies only the bytes the injector reads.

### DEC-DECLEDGER-15 — threshold validation

*Rejected: positive-integer validators, as REQ C-5's type label reads.* FSPEC E-7 requires
`maxEntries: 0` to be a valid admits-nothing value, "not an error, not a fallback to the default,
not a halt"; a positive-integer validator rejects `0` and falls it back to `70`, the opposite
outcome. The shipped precedent already resolves the same tension the same way — `parseLearningsConfig`'s
`nonNegativeInt` (`orchestrate-dev.js:2283`) exists so that `0` is a valid admits-nothing value.
*Rejected: edit the REQ to match.* The type label is REQ-owned; it is routed as an erratum instead.

## Decision

## Consequences
