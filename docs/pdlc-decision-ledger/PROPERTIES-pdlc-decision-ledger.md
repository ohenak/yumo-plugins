# PROPERTIES — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES**` (`REQ-pdlc-decision-ledger.md` v1.9, `FSPEC-pdlc-decision-ledger.md` v1.3, `TSPEC-pdlc-decision-ledger.md` v0.7, `DECISIONS-pdlc-decision-ledger.md`, `PLAN-pdlc-decision-ledger.md` v0.3) |
| Downstream | IMPL tests |
| Baseline | `docs/_constraints/pdlc-decision-corpus-baseline.md` **v1.2**, cited by `M-*` id, never restated |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | te-author | 0.1 | 2026-08-29 |

## Overview

**What this document is.** The proof system for the decision ledger: a set of falsifiable
properties dense enough that an implementer can write every test in `PLAN` §Batches without asking
a further question, and a reader can audit coverage against `REQ` §5, `FSPEC` §4/§5/§6 and
`TSPEC` §6.1 mechanically.

**What the feature is.** `TSPEC` §1.1 places every new production symbol in one file,
`pdlc/workflows/orchestrate-dev.js` — verified at HEAD as the module already exporting
`parseLearningsConfig` (`orchestrate-dev.js:2252`), `readLearningsConfigSafely` (`:2313`),
`parsePinCheckConfig` (`:2363`), `parseDerivativeStopConfig` (`:2414`), `LEARNINGS_CORPUS_ARGV`
(`:2230`), `renderLearningsBlock` (`:2731`), `gatherLearningsCorpus` (`:2771`),
`buildLearningsInjector` (`:2825`) and `reviewLoop` (`:9194`). `reviewerPrompt` is **module-private**
(declared at `:11433`, not exported), which is why `TSPEC` §1.1 names `reviewLoop` as its exported
caller and why every prompt-byte property below is asserted through `reviewLoop` or `main()`, never
by importing `reviewerPrompt`. The shipped gate shape this feature clones is live at
`orchestrate-dev.js:11453` (`const findingGrammarPart = findingGrammar ? \`\\n${findingGrammarClause()}\` : ""`),
consumed on both return paths (`:11483`, `:11506`).

### The three obligations this document exists to discharge

`REQ` §7 and `FSPEC` §7 route three items to te-author by name, and `TSPEC` §8.2 confirms they are
the only upstream items left open to this layer. Each is discharged in a named section below, and
nothing else in this document is a prerequisite for them:

| Id | Owner | Substance | Discharged by |
|---|---|---|---|
| **O-5** | te-author | Cross-file precedence has **no HEAD instance** (`M-5a` records zero ids held as records in two files), so it is coverable only by construction: a synthetic two-file corpus recording one id both project-level and feature-level | Fixture **FX-PRECEDENCE** (§Fixtures); PROP-PRE-01…04 |
| **O-6** | te-author | `FSPEC` E-2, E-3 and E-4 likewise have no HEAD instance, and `M-4e` records that an empty file and a failed read are separable only by construction; the frozen corpus copy `AT-01` asserts against, and `AT-16`'s recorded round of reviewer outputs, are owed as constructed fixtures too | Fixtures **FX-CORPUS**, **FX-FAILOPEN**, **FX-REPLAY**, **FX-BASELINE** (§Fixtures); PROP-FAIL-01…08, PROP-INV-01…04 |
| **O-8** | te-author | `BR-12`/`BR-13`'s bounds invariant is universally quantified while `AT-13` exercises two examples; it is owed as a **property** parameterised over set size × line sizes × both bounds | PROP-BND-01…06 (`TSPEC` §7.5's four conjuncts, each with its own falsifying mutation) |

`TSPEC` §7.5 additionally promotes two further quantified claims to properties — **P-REC**
(recognition/resolution) and **P-LINE** (one physical line per decision). They are not upstream
obligations on this layer but they are load-bearing for §Oracles' transcribed byte literals, so they
are carried here as PROP-REC-08…11 and PROP-REND-05…07.

### Scope, and the two things deliberately out of it

**In scope:** every observable this feature creates — resolved config, recognised records, selected
records, rendered block bytes, dispatch prompt bytes, the driver-internal
`failedSources`/`emptySources` split (`TSPEC` §6.3), the report field and the notice set.

**Out of scope, stated so no property is invented for them:**

1. **Reviewer compliance with the rule text.** `REQ` R-3 accepts this as unenforceable by
   construction and `TSPEC` §7.7 records the compensating control. Every rule-text property below
   asserts a property of **the emitted text**, never of anyone's classification — which is what
   `FSPEC` AT-07 means by "no human is in the oracle".
2. **`REQ` G-4's retrospective trend.** Non-binding by REQ design, no acceptance criterion, and
   `TSPEC` §2.5 records that its denominator is strictly wider than this mechanism's injection
   surface. Nothing here asserts it.

### Test pyramid

`FSPEC` has eighteen acceptance tests and `TSPEC` §6.1 fourteen failure rows; pushing them to the
cheapest falsifying level is what keeps the suite runnable per wave (`PLAN` T-18 runs it per batch).

```
        /  E2E  \          0 — there is no end-to-end journey; the composition root is the top
       /----------\
      / Integration \      3 seams — reviewLoop composition, main() composition root, replay
     /----------------\
    /    Unit + property  \  the rest — 4 pure functions, 3 properties, 2 corpus oracles,
   /______________________\   1 baseline guard, 1 source census, 1 engine disclosure
```

The composition root (`PLAN` T-10a) is the single most expensive level used, and it is used because
`TSPEC` §7.2 (DC-07) records that a source census proves a string is present and never that a line
runs. No property below is assigned E2E.

### Reading conventions

- **Level** is the cheapest level that can falsify the property, per `TSPEC` §7.2's category table.
- **Fixture** names a `FX-*` entry in §Fixtures. Every property that needs constructed data names
  one; a property naming none is over literals.
- **Task** is the `PLAN` task that owns the property. Red-before-green pairs are written
  `T-05 → T-14`, the `[red]` test task first.
- Every citation is stable content — a spec id, a section anchor, an exported symbol or a verbatim
  quote — per `DEC-DOC-01`. The one exception is a `file:line` anchor where the **position is the
  claim** (the census and the shipped-gate reads above), which `DEC-DOC-01` permits.
- Statement, citation and byte literals quoted below are transcribed from **data** — the frozen
  fixture or the normative spec text — never captured from a renderer, per `PLAN` §Anti-echo
  commitments.

## Properties

Every property is stated as *{component} must/must not {observable} {when}*, classified, levelled,
traced to at least one `REQ` acceptance criterion and at least one `FSPEC` business rule or edge
case, and assigned to the `PLAN` task that owns it. **Negative properties are marked ✖.**

### CFG — config resolution (`parseDecisionLedgerConfig`)

Traces `REQ-DECLEDGER-05`, `REQ` C-1/C-3/C-5; `FSPEC` BR-10, E-1, E-5, AT-11; `TSPEC` §4.1, §6.1
F-1…F-5. Owner **T-04 → T-13**. Level: **pure unit**, over literals — no fixture.

| Id | Property | Category |
|---|---|---|
| **PROP-CFG-01** | `parseDecisionLedgerConfig` must return `DECISION_LEDGER_DEFAULTS` — `{enabled: false, maxEntries: 70, maxBytes: 12500}` — when `text` is `null`, when `text` does not parse as JSON, and when the parsed object holds no `decisionLedger` key, and must set `sectionMalformed: false` and `invalidKeys: []` in all three cases. | Error Handling |
| **PROP-CFG-02** | `parseDecisionLedgerConfig` must resolve each of `enabled`, `maxEntries`, `maxBytes` **independently**: for every key `k` of `REQ` C-3's three, and every condition `c` in {wrong-typed, absent}, with the other two keys carrying valid non-default operator values, the result must equal the operator's value on those two and the C-5 default on `k` alone. | Contract |
| **PROP-CFG-03** | `parseDecisionLedgerConfig` must set `sectionMalformed: true` and return all three defaults when `decisionLedger` is present but **not a plain object** (array, string, number, `null`, boolean). | Error Handling |
| **PROP-CFG-04** | `parseDecisionLedgerConfig` must accept `0` as a **valid** value on both `maxEntries` and `maxBytes`, returning `0` and **not** listing the key in `invalidKeys` — a `nonNegativeInt` validator, never `positiveInt`. | Data Integrity |
| **PROP-CFG-05** | `parseDecisionLedgerConfig` must list in `invalidKeys` exactly the keys it defaulted for wrong-typedness — no more (a valid key never appears) and no fewer (a defaulted key always appears) — asserted as **set equality**, per key and per condition. | Observability |
| **PROP-CFG-06** ✖ | `parseDecisionLedgerConfig` must **not** throw, must **not** read the filesystem, and must **not** mutate its argument, for **any** input string including the empty string, a JSON scalar at top level, and deeply nested garbage. | Error Handling |
| **PROP-CFG-07** ✖ | Resolving the `decisionLedger` block must **not** change the resolution of any other block: for a config text carrying a malformed `decisionLedger` alongside valid `learningsInjection`, `cascade` and `review` blocks, `parseLearningsConfig`, `parsePinCheckConfig` and `parseDerivativeStopConfig` must return **byte-identical** results to the same text with `decisionLedger` removed. | Contract |
| **PROP-CFG-08** | The run-level notice set emitted for a config text must be **set-equal** to: `{}` for F-1/F-2/F-3, `{NTC-DECLEDGER-MALFORMED}` for F-4, and `{NTC-DECLEDGER-KEYTYPE}` for F-5 — with the wrong-typed key **named in the notice detail**. | Observability |
| **PROP-CFG-09** | `DECISION_LEDGER_DEFAULTS`' own key set must be **set-equal** to `{enabled, maxEntries, maxBytes}` and the object frozen, so a fourth key or a re-spelling fails (`REQ` C-3's exhaustive enumeration). | Contract |
| **PROP-CFG-10** | `parseDecisionLedgerConfig` must be reached through the **same already-read** `learningsConfigText` `main()` hands `parsePinCheckConfig` and `parseDerivativeStopConfig`, adding **zero** further reads of `.claude/pdlc.config.json`: asserted by a call-count spy on the read seam over a full `main()` run (`TSPEC` §2.2). | Performance |

**Why PROP-CFG-08 names the key rather than asserting a count.** A notice count alone passes a
loader that emits `NTC-DECLEDGER-KEYTYPE` for the wrong key; the detail conjunct is what ties the
notice to the key that actually defaulted.

### REC — recognition and in-file resolution (`recogniseDecisionRecords`)

Traces `REQ-DECLEDGER-01`; `FSPEC` BR-2, BR-3, E-9, E-10, AT-01; `TSPEC` §3.2, §3.3, O-1, D-1.
Owner **T-05 → T-14**. Level: **pure unit** and **property**; corpus-scale assertions are in the
ORACLE section.

| Id | Property | Category |
|---|---|---|
| **PROP-REC-01** | `recogniseDecisionRecords` must yield one record for a line matching **all five** of `TSPEC` §3.2's conjuncts, with `id` = capture 1, `statement` = capture 2 taken **verbatim** (no trim beyond the regex's own `[ \t]*`, no normalisation, no case change), `sourcePath` = the argument, `heading` = the **full line text verbatim**, and `origin` set by the caller's partition. | Functional |
| **PROP-REC-02** ✖ | It must **not** yield a record for an ATX heading outside levels 2–4 — `#` and `#####` — even where every other conjunct holds. | Data Integrity |
| **PROP-REC-03** | It must yield a record for a heading carrying an **ordinal prefix** (`## 2. DEC-EDIST-01: …`, `## 3. DEC-CONS-01: …`). This conjunct is load-bearing: without it `pdlc-engine-distribution` and `pdlc-consolidation-agent` contribute **0** instead of 10 and 8, and the feature-level total is 82 rather than `M-2e`'s 100. | Functional |
| **PROP-REC-04** ✖ | It must **not** yield a record for an id carrying **no namespace segment** (`DEC-01`…`DEC-10`), which is what excludes `M-4b`'s twelve headings in `DECISIONS-pdlc-plugin-retirement.md` and `M-4d`'s four `### DEC-01 — …` question headings; nor for a non-numeric final segment (`DEC-AWG-Q1`, `M-4a`). | Data Integrity |
| **PROP-REC-05** ✖ | It must **not** yield a record where the id appears **mid-heading** rather than opening it (`### What follows from DEC-A6-01`) — only an ordinal may precede — which is what excludes `M-4d`'s four back-reference headings. | Data Integrity |
| **PROP-REC-06** ✖ | It must **not** yield a record for a heading whose statement remainder after the separator is **empty or whitespace-only**, and must **not** yield one for a line carrying the markup mid-line in prose or in a fenced code block that is not itself a heading (`M-4a`'s prose `DEC-` token, `M-4c`'s line-leading citations in `.consolidation-log.md`). | Data Integrity |
| **PROP-REC-07** | It must accept **both** separators actually present in the corpus — `:` in deciding blocks and the em dash `—` in question blocks — and must yield exactly one record per qualifying line for each. | Functional |
| **PROP-REC-08** | Where two qualifying lines in the same text carry the **same id**, it must yield **exactly one** record for that id and that record must be the **later** one in file order (`TSPEC` §3.3, D-1) — asserted positively on `M-3c`'s witness: the yielded `statement` equals the second, deciding opening, and the first, question-form statement is **absent** from the whole result. | Data Integrity |
| **PROP-REC-09** | **(P-REC, property.)** For arbitrary generated text, the set of ids yielded must equal exactly the set of lines satisfying all five conjuncts with a non-empty remainder — no others — and each yielded `statement` must be a **verbatim substring of the line it came from**, and duplicate ids must resolve last-wins yielding exactly one record each. | Data Integrity |
| **PROP-REC-10** | `recogniseDecisionRecords` must return `[]` — never `null`, never a throw — for `text` that is `null`, empty, whitespace-only, or holds no qualifying line, and that empty return must be an **ordinary result** the caller classifies as `emptySources`, never `failedSources` (`FSPEC` BR-8, `M-4e`). | Error Handling |
| **PROP-REC-11** ✖ | It must **not** read the filesystem, throw, or depend on line-ending style: text using `\r\n` must yield records whose `statement` and `heading` carry **no** trailing `\r`. | Contract |

**Why PROP-REC-08's second conjunct is not optional.** A cardinality-only oracle ("one record for
the id") is green under first-wins too, and first-wins renders the *question* rather than the
decision — the exact `BR-3` violation `M-3c` exists to discriminate. The absence conjunct is
asserted over a result that is **non-empty by construction**, so it is not a vacuous absence.

### PRE — cross-file precedence (O-5)

Traces `REQ-DECLEDGER-01`, `REQ` O-5; `FSPEC` E-11, AT-18; `TSPEC` §3.4, D-2. Owner
**T-09 → T-17**. Level: **corpus oracle** over **FX-PRECEDENCE**, the synthetic two-file fixture
this document owes. `M-5a` records **zero** ids held as records in two files at HEAD, so every
property here is unfalsifiable against the standing corpus and constructed data is the only route.

| Id | Property | Category |
|---|---|---|
| **PROP-PRE-01** | Where one id is recognised in **both** a project-level and a feature-level in-scope file, the rendered block must carry **exactly one** line for that id — never two, never zero. | Data Integrity |
| **PROP-PRE-02** | That single line's `statement` and `sourcePath` must equal the **project-level** record's, each transcribed literally from FX-PRECEDENCE and never captured from the renderer, and its `origin` must be `"project"`. | Data Integrity |
| **PROP-PRE-03** ✖ | The **feature-level** record's statement must be **absent** from the whole rendered block — asserted as a substring check over a block that is non-empty and carries the project-level statement (the positive-presence conjunct), so the absence cannot pass vacuously. | Data Integrity |
| **PROP-PRE-04** | Every **other** line in the block must be byte-identical to the block rendered from the same corpus with the duplicate feature-level record removed: the collision must perturb exactly one line. | Idempotency |
| **PROP-PRE-05** ✖ | Precedence must be decided on **`origin`**, never on path order: reversing the enumeration order of FX-PRECEDENCE's two files must produce a **byte-identical** block. `M-5c` warns that a path-ordering tie-break is not well-defined without naming a collation, and `_` (`0x5F`) inverts under case-folded collation. | Idempotency |

**The mutation map** (`TSPEC` §3.4's "the two halves fail on different mutations"): swapping the
precedence direction leaves PROP-PRE-01 green and reddens PROP-PRE-02/03; emitting both records
reddens PROP-PRE-01 and leaves PROP-PRE-02 green. Both are therefore required, and PROP-PRE-05
additionally reddens a build that got the right answer for the wrong reason.

### REND — rendering (`renderDecisionLedgerBlock`)

Traces `REQ-DECLEDGER-01`/`-03`/`-07`; `FSPEC` BR-1, BR-3, E-6, AT-14; `TSPEC` §4.3, D-7, D-8, D-9.
Owner **T-06 → T-15**. Level: **pure unit** and **property**.

| Id | Property | Category |
|---|---|---|
| **PROP-REND-01** | `renderDecisionLedgerBlock({selected: []})` must return **exactly `""`** — not a header, not a preamble, not rule text, not a trailer, not a newline, not a space. `String.length === 0`, asserted as an equality against `""`, never as falsiness. | Contract |
| **PROP-REND-02** | For a non-empty `selected`, the block must open with the header `--- CLOSED DECISIONS (do not re-open without new evidence) ---`, be prefixed `"\n\n"`, carry `DECISION_LEDGER_PREAMBLE`, then the index lines, then `DECISION_LEDGER_RULE_TEXT`, then close with `--- END CLOSED DECISIONS ---` and **no trailing newline**. | Contract |
| **PROP-REND-03** | Each index line must render as `{id} — {statement}  [{sourcePath} § {id}]` — the fields, separators and order fixed by `TSPEC` §4.3 — with every field **transcribed** from the `DecisionRecord`, none synthesised. | Data Integrity |
| **PROP-REND-04** ✖ | The rendered citation must **not** carry the record's full heading (`DecisionRecord.heading` must not appear in the block), which is `D-7`'s retired form and costs ~33% of the block by rendering every statement twice (9,371 vs 6,305 bytes over the project-level set). `heading` must still be **present on the type**, since §Oracles transcribes expected values from it. | Data Integrity |
| **PROP-REND-05** | **(P-LINE, property.)** For any non-empty `selected`, the index region's `split("\n")` length must equal `selected.length` — exactly one **physical** line per selected record — and **no** rendered line may contain an embedded newline. | Data Integrity |
| **PROP-REND-06** | For any non-empty `selected`, the index lines must appear in `TSPEC` §3.6's order: **all** `origin === "project"` lines before **any** `origin === "feature"` line, and within an origin, in enumeration order. | Data Integrity |
| **PROP-REND-07** | Rendering must be a **pure function of `selected`**: two calls with equal input must return byte-identical strings, and the call must not read the filesystem, consult a clock, a locale or an environment variable. | Idempotency |
| **PROP-REND-08** | The four framing constants — header, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, trailer, plus the blank lines between them — must render to **≤ 1,200 bytes** measured by `Buffer.byteLength(…, "utf8")`, asserted against that literal (`TSPEC` D-9). | Performance |
| **PROP-REND-09** | `renderDecisionLedgerBlock` must be the **only** producer of ledger bytes: `selectDecisions` must obtain `renderedBytes` by calling it, asserted by a call-count spy showing `selectDecisions` invokes the renderer at least once per drop-loop step and **never** concatenates a line itself (`TSPEC` D-8). | Contract |

**PROP-REND-08 is a budget, not a measurement.** `TSPEC` §4.3 is explicit that 1,200 is the budget
the rule text must be *drafted to fit*; the constants do not exist yet. If a later edit needs more,
the pin reddens and `TSPEC` §3.6's headroom arithmetic is re-decided deliberately — the ~4,995-byte
whole-corpus headroom and the **441**-byte margin on `M-6b`'s worst standing case shrink one-for-one
with any raise.

**Why PROP-REND-09 is a call-count and not a shape assertion.** Two implementations of one format
produce the same-shaped output while disagreeing on size, and the disagreement is invisible in the
worst direction: the bound is enforced against a size the prompt does not have, `BR-12` is violated,
and every shape assertion stays green. The behavioural call-count is the only oracle that
distinguishes them.

### BND — bounds (O-8)

Traces `REQ-DECLEDGER-07`, `REQ` C-5; `FSPEC` BR-12, BR-13, E-6, E-7, E-8, N-1, AT-13, AT-14,
AT-15; `TSPEC` §3.6, §7.5, F-11…F-13. Owner **T-07 → T-16**. Level: **property** (`fast-check`,
declared at `pdlc/workflows/package.json:13` as `"fast-check": "^4.9.0"` and installed), with
`AT-13`/`AT-15` retained as example regression anchors.

**The property, stated once.** *For any in-scope record set and any non-negative `maxEntries` and
`maxBytes`, the rendered block either is exactly `""` or satisfies all four conjuncts below.* The
generator draws record sets spanning **zero, one and many** records; line lengths spanning
**below, at and above** `maxBytes`; and bounds spanning **`0`, exactly-fitting and generous** — so
`E-6`, `E-7` and `E-8` fall **inside** the property's range rather than beside it.

| Id | Conjunct / property | Category | Falsifying mutation that must red it |
|---|---|---|---|
| **PROP-BND-01** | At most `maxEntries` **lines** in the rendered index region. | Contract | the drop loop tests `>` instead of `≥` on the line count, emitting `maxEntries + 1` lines |
| **PROP-BND-02** | At most `maxBytes` **bytes** in the whole block, framing **charged** (`TSPEC` D-5), measured as `Buffer.byteLength(block, "utf8")`. | Contract | the loop charges index lines only, omitting framing — D-5's charge removed |
| **PROP-BND-03** ✖ | **No truncation:** every rendered line must be byte-identical to the line the **unbounded** renderer would produce for that record; no line abbreviated, no fragment of a dropped line present. | Data Integrity | a line is truncated to the remaining byte budget instead of being dropped whole |
| **PROP-BND-04** | **Prefix conjunct (non-vacuity):** the rendered set must be a prefix of the unbounded set under `TSPEC` §3.6's omission order — feature-level dropped before project-level, and within an origin, reverse enumeration order (last enumerated dropped first). | Data Integrity | the loop drops from the front (project-level first) instead of the back |
| **PROP-BND-05** | Both bounds must be applied by **one** loop with a **disjunctive** condition — *while the block exceeds `maxEntries` lines **or** `maxBytes` bytes, drop the next line in omission order* — so there is no "which bound binds first" stage; each drop must be recorded in `omitted[]` with `reason` in `{RSN-ENTRIES, RSN-BYTES}`. | Functional | the loop applies one bound then the other, leaving a set that satisfies the second and violates the first |
| **PROP-BND-06** | Enumeration order must be **deterministic**: repeated selection over the same corpus must produce byte-identical `selected`, `omitted` and block, with no dependence on clock, locale, or filesystem walk order (`TSPEC` §3.6). | Idempotency | the loop iterates an unordered map |

**PROP-BND-04 is what makes the family non-vacuous, and it is stated as a positive.** A renderer
returning `""` for every input satisfies PROP-BND-01, -02 and -03 trivially. Only the prefix
conjunct fails it. Every one of the four therefore carries its own named mutation above; each must
be **applied, observed red, reverted, and the observed failure transcribed into the test file's
header** (`PLAN` §Definition of Done, `TSPEC` §7.5).

**PROP-BND-07 — the model must not reuse the renderer.** ✖ The property's model must carry its
**own** formatter, transcribed by hand from `TSPEC` §4.3's stated format
(`{id} — {statement}  [{sourcePath} § {id}]`), and must **not** call
`renderDecisionLedgerBlock` or any production line renderer. Building the expected line from the
production renderer makes PROP-BND-03 true by construction — a dropped separator, a citation
rendered as `{heading}`, or a truncated statement appears on **both** sides of the comparison and
the conjunct can never fail. The cost is one duplicated format literal; PROP-REND-08's framing pin
and the ORC-02 resolution check are what keep the duplicate honest.

**Boundary properties, held as examples alongside the property** (`FSPEC` AT-13/AT-15 regression
anchors, `TSPEC` §7.6):

| Id | Property | Category |
|---|---|---|
| **PROP-BND-08** | `maxEntries: 0` must render **exactly `""`** — treated as zero in-scope decisions, **not** an error, **not** a fallback to `70`, **not** a halt (`FSPEC` E-7). | Error Handling |
| **PROP-BND-09** | `maxBytes: 0` must render **exactly `""`** by the same route — every line exceeds `0`, so `E-8` then `E-6` — **not** an error, **not** a fallback to `12500`, **not** a halt. | Error Handling |
| **PROP-BND-10** | A **single line alone** exceeding `maxBytes`, among other lines that fit, must be **absent in full** from the block, no fragment of it present, and the remaining lines must render. Where it was the only line, the block is `""`. | Error Handling |
| **PROP-BND-11** ✖ | No input may cause the dispatch to be **aborted, oversized, retried, or reported as an error** on account of index size: over the whole generator range, `selectDecisions` must return normally and no notice or failure class may be emitted (`FSPEC` N-1). | Error Handling |
| **PROP-BND-12** | `maxBytes` must bound the **index block alone** as it appears in the prompt — not its contribution to total dispatch size, and not the underlying record bytes: asserted by varying the surrounding prompt's size and showing `selected` and `omitted` are unchanged. | Contract |

## Oracles

## Fixtures

## Coverage Matrix

## Gaps, Risks and Routed Items
