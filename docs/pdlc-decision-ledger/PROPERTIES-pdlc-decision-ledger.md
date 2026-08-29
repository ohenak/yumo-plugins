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

### FAIL — fail-open degradation (O-6, O-7)

Traces `REQ-DECLEDGER-04`, `REQ` G-3, R-1, O-6; `FSPEC` BR-7, BR-8, E-2, E-3, E-4, AT-08, AT-09,
AT-10; `TSPEC` §6.1 F-6…F-10, §6.2, §6.3. Owner **T-08 → T-17**. Level: **integration with scripted
seams**, over **FX-FAILOPEN**. None of `E-2`/`E-3`/`E-4` has a HEAD instance, so every property here
is constructed data by necessity, which is exactly what O-6 records.

| Id | Property | Category |
|---|---|---|
| **PROP-FAIL-01** | The leg must be decided on **what survives**, never on what kind of thing failed: `selected.length === 0` ⇒ total leg; `0 < selected.length < inScope` ⇒ partial leg; `selected.length === inScope` ⇒ ordinary render. Asserted over corpora that reach each of the three by **different** causes and must agree. | Functional |
| **PROP-FAIL-02** | **Total leg.** Where nothing survives — first every source missing/unreadable/unparseable (`_git` `!ok`, `_git` throwing, `_readFile` `null`, `_readFile` throwing), then a readable corpus in which **every** in-scope decision fails to recognise — the block must be **exactly `""`** and the dispatch prompt must be **byte-identical to FX-BASELINE's flag-off recording**. | Error Handling |
| **PROP-FAIL-03** ✖ | Neither leg may **halt**, throw past `dispatchAndVerify`, write to disk, or emit an operator-facing failure class: over the whole of FX-FAILOPEN, the notice set must be **set-equal** to the flag-off notice set and the run must complete. | Error Handling |
| **PROP-FAIL-04** | **Partial leg.** Where a **proper, non-empty subset** fails — one decision; several decisions; **one whole source unavailable while other sources survive** — the failed lines must be **absent**, **every** surviving expected line **present** (transcribed from the fixture), and the rule text **present**. The three sub-causes must produce **one** outcome, not three. | Error Handling |
| **PROP-FAIL-05** ✖ | A decision that cannot be rendered faithfully must be **omitted whole**, never rendered **partially**: no line may appear carrying an empty, placeholder, truncated or synthesised `statement` or `sourcePath` (`BR-7`). Asserted positively — the block is non-empty and its every line resolves per ORC-02 — so the absence is not vacuous. | Data Integrity |
| **PROP-FAIL-06** | **O-7's observable.** For a corpus whose only source **reads and parses to zero records**, `failedSources` must be `[]` and `emptySources` must have exactly that one member; for a corpus whose only source **fails to read**, the two must be reversed. The dispatch **bytes are identical** in both cases, so this is the only conjunct that can falsify `BR-8` — reverse the classification in the implementation and the bytes do not move but this assertion fails. | Observability |
| **PROP-FAIL-07** | `failedSources` and `emptySources` must be **disjoint by construction** (classified by `readOk`) and their **union** must be exactly the set of in-scope sources contributing no line. | Data Integrity |
| **PROP-FAIL-08** ✖ | An **empty** source must **not** be counted as a failure and must **not**, on its own, cause the total leg: a corpus of one empty source **plus** surviving sources must render the surviving sources' expected line set **exactly** — the empty file adding no line and removing none (`M-4a` and `M-4b` are two standing-corpus files in this position, so this is the common case). | Error Handling |
| **PROP-FAIL-09** | `corpusOutcome` must be `"RSN-UNLISTABLE"` when the `_git` enumeration returns `!ok` **or throws**, `"RSN-EMPTY"` when it succeeds returning zero paths, and `null` otherwise — asserted as set equality against `DECISION_LEDGER_CORPUS_OUTCOMES`. | Observability |
| **PROP-FAIL-10** | `gatherDecisionCorpus` must wrap **each path's read in its own `try/catch`**, so both the runtime shape (`rtReadFile` **throws**) and the test-double shape (`defaultReadFile` returns **`null`**) degrade **that one entry** to `readOk: false` and never the corpus. Both arms must be exercised. | Error Handling |
| **PROP-FAIL-11** | A feature with **no directory** among `docs/{feature}/`, `docs/completed/{feature}/`, `docs/discarded/{feature}/`, and a feature whose directory yields **zero** records, must both resolve to the **project-level set alone** — not a failure, not an empty-set error (`FSPEC` Q-2, `TSPEC` §3.1). `pdlc-plugin-retirement` is the standing witness for the second: its twelve headings are namespace-less `DEC-01`…`DEC-10`, so its directory contributes **0** records while the directory exists. | Functional |

**Why PROP-FAIL-10 names both arms.** `TSPEC` §4.4 records the shipped lesson directly: the runtime
read throws where the double returns `null`. A suite that only scripts `null` proves nothing about
production, and one that only scripts a throw proves nothing about the double the rest of the suite
uses. This is the identical-envelope trap in its read-seam form — both arms produce the same
`readOk: false` envelope, so only exercising both distinguishes an implementation that handles one.

### WIRE — composition root, freshness and injection (DC-07)

Traces `REQ-DECLEDGER-01`, `REQ` G-3; `FSPEC` BR-9, AT-03; `TSPEC` §2.3, §2.4, §2.6, §4.5, §7.2.
Owner **T-10 → T-18** and **T-10a → T-18**. Level: **integration** (`reviewLoop`) and **composition
root, live** (`main()`).

| Id | Property | Category |
|---|---|---|
| **PROP-WIRE-01** | **Freshness.** `injectDecisionLedger` must re-gather the corpus on **every** call: where the scripted `_readFile` double returns one text on its first call for a path and a mutated text on its second, the **second** dispatch's index must reflect the changed record. Asserted as a **call-count** on the read seam (≥ 1 per dispatch), not only as a byte difference — a shape assertion alone cannot distinguish a re-read from a lucky snapshot. | Integration |
| **PROP-WIRE-02** ✖ | The injector closure must hold **no** corpus, **no** rendered block and **no** snapshot between dispatches, and must **not** memoise across calls (`TSPEC` §2.6, §5.4). | Integration |
| **PROP-WIRE-03** | Both reviewers of a round must receive the **identical** block: the single `await`ed injector call must sit immediately before the two `reviewerPrompt` calls in `reviewLoop`. | Integration |
| **PROP-WIRE-04** | **Seam reached (live).** Driving the module's default-exported `main()` with the flag on, a **call-count spy** on the scripted `_git` seam must show `gatherDecisionCorpus`' listing call fires **≥ 1** on the **served reviewer flow**. A fake satisfying only the outer interface cannot meet this conjunct. | Integration |
| **PROP-WIRE-05** | **Positive presence (live).** The reviewer prompt actually handed to the reviewer dispatch must **end with** the rendered ledger block — not merely "differ from the baseline". | Integration |
| **PROP-WIRE-06** | The injector call must be **`await`ed**: a non-awaited call must be detectable, since the adapter's implementations are async while the test doubles are sync (this repo's injected-IO rule). Asserted by scripting an async `_git`/`_readFile` pair and requiring the served prompt to carry the block. | Integration |
| **PROP-WIRE-07** | `buildDecisionLedgerInjector` must return **`null`** iff resolved `enabled` is **not `=== true`**, and with the injector `null`, `reviewLoop` must pass `""` as the `ledgerBlock` argument so the prompt is built by the identical expression it is today. | Contract |
| **PROP-WIRE-08** | The block must be appended **last**, after `oraclePart` and `findingGrammarPart`, on **both** the iteration-1 and the iteration-≥2 return paths `reviewerPrompt` already has (`orchestrate-dev.js:11483` and `:11506`). | Contract |
| **PROP-WIRE-09** ✖ | The index must attach to the review-loop **reviewer** prompt **only** — never to the delta-confirmation prompt or the finding-restatement prompt, both of which forbid re-review in their own text (`TSPEC` §2.5, D-2). Asserted positively and negatively on the same run: the reviewer prompt ends with the block, and the other two prompts are byte-identical to FX-BASELINE's recording of them. | Contract |
| **PROP-WIRE-10** | The enablement flag must be read by **destructuring** (`const { enabled: decisionLedgerEnabled } = decisionLedgerConfig`), never as a dotted `.enabled` member read, and every new symbol must land **outside** the sentinel-bounded `// === LEARNINGS INJECTION REGION START/END ===` block. `advisoryDisabled.test.js`'s PROP-DIS-06 (`advisoryDisabled.test.js:707–740`) slices that region out via `sourceExcludingParser` (`:717–719`) **before** counting `/\.enabled\b/`, so a symbol landing inside it would be silently exempt and this discipline would have no oracle behind it. PROP-DIS-06 must remain green. | Contract |
| **PROP-WIRE-11** | `report.decisionLedger` must be set **only** when the injector is non-null and **absent from the report object entirely** otherwise — never spread as `undefined` (the shipped `learningsInjectionField` discipline). | Contract |

### OFF — the disabled path (byte-identity)

Traces `REQ-DECLEDGER-02`, `REQ` C-2, O-4; `FSPEC` BR-4, E-1, E-6, AT-04, AT-05, AT-14; `TSPEC`
§7.4. Owner **T-02** and **T-10 → T-18**, with the live half **T-10a**. Level: **byte-identity
baseline guard** over **FX-BASELINE**.

| Id | Property | Category |
|---|---|---|
| **PROP-OFF-01** | With `enabled` not `true`, the reviewer-prompt stream must be **byte-identical to the committed merge-base recording** — never to a same-branch before/after comparison, and never to a string computed by subtracting the block from the flag-on prompt. Both weaker forms pass a regression that corrupts both arms identically. | Contract |
| **PROP-OFF-02** | All **four** not-enabled spellings — `enabled` absent, `false`, wrong-typed, and the whole `decisionLedger` block absent or malformed — must produce that identical stream, and **none** may report an error to the operator. | Error Handling |
| **PROP-OFF-03** | The four spellings must be supplied as **four distinct config texts** run through `parseDecisionLedgerConfig` → `buildDecisionLedgerInjector`, each yielding `null`. Supplying them to a harness that enters below the config gate makes all four the **same** input (`_injectDecisionLedger: null`) and the oracle vacuously asserts that four identical inputs produce identical bytes (`TSPEC` §7.4). **The recorded arm must consume the config text it is varying.** | Contract |
| **PROP-OFF-04** ✖ | With the flag off, the dispatch must carry **no index, no rule text, no empty block, no marker, and no added or removed whitespace** — pinned by PROP-OFF-01's single byte comparison rather than by four separate absence checks. | Contract |
| **PROP-OFF-05** | With the flag off, the `report` key set must be **set-equal** to FX-BASELINE's flag-off key set (so a spuriously-added key fails), and the emitted notice set must be **set-equal** to the baseline notices array — not merely free of `NTC-DECLEDGER-*`. | Observability |
| **PROP-OFF-06** | **The zero cases resolve to the disabled bytes.** All three of a zero-decision in-scope set, `maxEntries: 0`, and `maxBytes: 0` must produce a dispatch **byte-identical to PROP-OFF-01's stream** — the positive form that pins in one comparison that there is no index block, no header without rows, and **no rule text standing alone above a missing index**. A build emitting rule text without an index fails. | Contract |

**PROP-OFF-06 is the structural guarantee, not a separate enforcement.** `TSPEC` §2.4 makes
"no index ⇒ no rule text" true by construction — the rule text is inside the same string
`renderDecisionLedgerBlock` returns, and that function returns exactly `""` when `selected` is empty
(PROP-REND-01) — so an ordering mistake cannot violate it. PROP-OFF-06 is the falsifier that this
construction was actually adopted.

### TEXT — the rule text

Traces `REQ-DECLEDGER-03`, `REQ-DECLEDGER-06`; `FSPEC` BR-5, BR-6, AT-06, AT-07, AT-12; `TSPEC`
§4.3. Owner **T-06 → T-15**. Level: **pure unit** on `DECISION_LEDGER_RULE_TEXT`.

**What is asserted is a property of the emitted text, never of anyone's classification.** No human
is in any oracle here, and nothing mechanically evaluates evidence novelty — `BR-6` is explicit that
no component compares citations.

| Id | Property | Category |
|---|---|---|
| **PROP-TEXT-01** | `DECISION_LEDGER_RULE_TEXT` must state **both** conjuncts of the bar as a conjunction: **High severity** *and* citing evidence **not part of that decision's own record**. Text carrying one conjunct fails. | Functional |
| **PROP-TEXT-02** | It must carry **both** boundary exemplars, each **explicitly labelled with the side it falls on** — *in scope for re-opening*: a shipped behaviour that changed after the decision was recorded, cited at the changed source; *not in scope*: a source the decision already cites, re-cited at a different line or a later commit with no behavioural change. Text carrying one exemplar, or both unlabelled, fails. | Functional |
| **PROP-TEXT-03** | It must direct the reviewer to decide against the **cited record**, not the index line — which need not carry the decision's own citations (`REQ-DECLEDGER-03`, AT-07). | Functional |
| **PROP-TEXT-04** | It must direct the reviewer to treat the **decision id as the reopening key** across rounds, recording a repeat **as a repeat naming that id** rather than as a fresh finding (`REQ-DECLEDGER-06`). | Functional |
| **PROP-TEXT-05** | The rule text must be emitted **adjacent to the index**, inside the same block returned by `renderDecisionLedgerBlock`, and must appear in the order fixed by `TSPEC` §4.3: bar, exemplars, cited-record instruction, id-as-key direction. | Contract |
| **PROP-TEXT-06** ✖ | The rule text must **not** be emitted when `selected` is empty (PROP-REND-01), and must **not** appear in any prompt other than the review-loop reviewer prompt (PROP-WIRE-09). | Contract |

**Whitespace-normalise before matching.** Every substring assertion in PROP-TEXT-01…04 must
whitespace-normalise both the rule text and the sought sentinel before comparing. These are
multi-word sentinels inside a wrapped prose constant; a sentinel straddling a hard newline silently
matches zero and the property passes for the wrong reason.

### INV — driver invariance (`NG-4` made falsifiable)

Traces `REQ-DECLEDGER-08`, `REQ` NG-4, NG-5, R-2; `FSPEC` BR-11, BR-14, N-2, AT-16, AT-17; `TSPEC`
§5.5, §7.3. Owner **T-10 → T-18** (replay), **T-11 → T-18** (census). Level: **replay integration**
over **FX-REPLAY**, plus a **source census**.

| Id | Property | Category |
|---|---|---|
| **PROP-INV-01** | For **one fixed recorded set of reviewer outputs** replayed twice — flag `true` and flag `false` — all **five** named driver-side outcomes must be identical: the convergence decision; `DEC-LOOPECON-06`'s identity-triple dedupe and the resulting open-finding ledger; the `review.derivativeStop` flat/non-flat classification; the erratum items minted under `DEC-ERRROUTE-01`; and the fail-closed read of a non-approving confirmation carrying no parseable `FINDING:` line. The five are asserted **individually**, and the list is **not** claimed exhaustive — a sixth mechanism is covered by extending it, never by a set equality. | Integration |
| **PROP-INV-02** | **Anchored, not merely invariant.** At least one of the five — the **open-finding ledger**, which the recorded reviewer outputs already determine — must additionally be asserted equal to a value **transcribed from FX-REPLAY**, so the test fails if that anchor moves and not only if the two runs diverge. | Integration |
| **PROP-INV-03** | The dispatch-construction leg must differ in **exactly one asserted way**, stated positively on both sides: the `false` run's dispatch is byte-identical to FX-BASELINE's recording, and the `true` run's carries the rendered index. "Allowed to differ" is not asserted; the difference is. | Integration |
| **PROP-INV-04** | A **High** finding re-opening an indexed decision that a reviewer files anyway must be scored, deduped and routed **as any other High finding**: it must mint its erratum item and satisfy the confirmation-presence check. Any special-casing on account of the index fails. | Integration |
| **PROP-INV-05** ✖ | **No suppressed-finding state.** A finding the reviewer declines to file must be **absent** — not marked, not counted, not carried. No driver-side "discounted finding" state may exist for any gate to disagree about (`FSPEC` N-2). Asserted as a report-shape set equality, not as a scan for an absent key. | Contract |
| **PROP-INV-06** ✖ | **Source census.** Zero occurrences of any member of `DECISION_LEDGER_CENSUS_TOKENS` — `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES` — anywhere in `orchestrate-dev.js` **outside** the four regions this feature owns: the three function bodies sliced by brace-matching from their declarations, and the `main()` wiring run between `// === DECISION LEDGER WIRING START ===` and `... END ===`. | Contract |
| **PROP-INV-07** | `DECISION_LEDGER_CENSUS_TOKENS` must be **set-equal** to the module's exported decision-ledger symbol names, so a symbol added later cannot escape the census by not being listed. | Contract |
| **PROP-INV-08** | **Every census slice must be asserted non-empty** before the count is taken. An empty slice makes the census vacuous — the exact shape of the false green this whole family exists to prevent. | Contract |
| **PROP-INV-09** ✖ | The report field name `decisionLedger` must **not** be a census token. `TSPEC` §7.3 records why: the shipped `learningsInjectionField` analogue is threaded through `buildFinalReport` and named at every one of its call sites, all far outside `main()`'s wiring sentinels, so the census would red on conforming code. What the field is owed instead is behavioural — PROP-OFF-05 and PROP-WIRE-11. | Contract |
| **PROP-INV-10** ✖ | No constant this feature touches may alter `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS` or `MAX_ERRATUM_FOLLOWUP_ROUNDS` (`REQ` NG-5), asserted by pinning their HEAD values. | Contract |

**PROP-INV-06's two operands are both frozen and both set-equality-checked**, which is the whole
reason the census is implementable. `TSPEC` §7.3 records the earlier, unimplementable wording and
why it failed: the token set was ubiquitous (`id` is one of the commonest identifiers in the file)
and the scanned regions do not exist as source objects — `orchestrate-dev.js` carries exactly one
sentinel-bounded region at HEAD (`advisoryDisabled.test.js:718–719` searches for
`"// === LEARNINGS INJECTION REGION START ==="` by **exact string**, not by sentinel *shape*), so
this feature's own wiring sentinels are invisible to PROP-DIS-06's slice and vice versa. What the
census deliberately does **not** attempt is proving the absence of a coupling routed through a
generically-named local; that residue is covered behaviourally by PROP-INV-01…04, and the two
together are the compensating control `TSPEC` §7.7 records against `REQ` R-3.

### DISC — disclosure

Traces `FSPEC` Q-3; `REQ` NG-6; `TSPEC` §5.3. Owner **T-12 → T-19** (engine) and **T-12a → T-19**
(documentation). Level: **engine disclosure test** (`node:test`) and **document oracle**.

| Id | Property | Category |
|---|---|---|
| **PROP-DISC-01** | `.claude/pdlc.config.example.json` must parse, and its top-level section set must **contain** `decisionLedger`. Containment, not equality — the file is shared with the eight blocks present at HEAD, verified as `dispatch`, `advisory`, `implementation`, `learningsInjection`, `cascade`, `review`, `loop`, `merge`. | Contract |
| **PROP-DISC-02** | `decisionLedger`'s own key→value map must be asserted by **set equality** against a **hand-transcribed** literal of `REQ` C-5's three keys and defaults — `{"enabled": false, "maxEntries": 70, "maxBytes": 12500}` — so a fourth key or a different spelling fails. | Contract |
| **PROP-DISC-03** ✖ | That literal must **not** be imported from `DECISION_LEDGER_DEFAULTS`. Importing it makes the example agree with the code **by construction** and the oracle can never fail — the reason `loop-config-example.test.js` transcribes `MERGE_DEFAULTS` rather than importing it. | Contract |
| **PROP-DISC-04** | The disclosure test must live in its **own** file, `pdlc/engine/__tests__/decision-ledger-config-example.test.js`, one file per block — the shape `learnings-config-example.test.js`, `loop-config-example.test.js` and `advisory-config-example.test.js` all take at HEAD — so an example edit cannot redden an unrelated engine concern. | Contract |
| **PROP-DISC-05** | `pdlc/OPERATIONS.md`, `pdlc/README.md` and `CLAUDE.md` must name the `decisionLedger` block, asserted by a **derived** document oracle whose expectations come from `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_NOTICES` and `DECISION_LEDGER_DEFAULTS` rather than being restated as literals. | Contract |
| **PROP-DISC-06** ✖ | No `SKILL.md` and no `pdlc/engine/` **runtime** file may change (`REQ` NG-6, `TSPEC` D-3): the only `pdlc/engine/` addition is the disclosure test of PROP-DISC-04. `SKILL.md` text cannot be config-gated, so a `SKILL.md` route would make `REQ` C-2's byte-identical disabled path unachievable. | Contract |
| **PROP-DISC-07** | `documentOracles.test.js`'s `*.test.js` census filter must exclude the `decisionLedger` namespace **and** still count `102` after this feature's twelve new modules exist. The literal is **saturated** at HEAD (`documentOracles.test.js:398–420` filters on the `learnings`, `waveResume`, `loop` and `escalationView` prefixes and asserts `expect(count).toBe(102)`), so batch 1 alone would redden a required check before any production code exists. | Contract |
| **PROP-DISC-08** | `node pdlc/workflows/build-runtime.mjs --check` must exit `0` and `pdlc/workflows/dist/` must be staged in the same commit as the workflow-source change; `pdlc/.claude-plugin/plugin.json` must bump from its HEAD value **`0.23.6`** to `0.23.7`, satisfying `pdlc/engine/package.json`'s `"pdlcPluginCompat": "^0.23.0"`. | Contract |

**PROP-DISC-07's positive control pins the complement.** Excluding a namespace and re-asserting
`102` proves the **rest** of the directory did not move; it does not count this feature's own
modules. The count of decision-ledger modules is pinned separately by `PLAN`'s file-ownership
manifest — twelve `decisionLedger*.test.js` modules, verified by enumeration of the PLAN's own task
table: `Preflight`, `FixtureGuard`, `BaselineGuard`, `Config`, `Recognise`, `Render`, `Bounds`,
`Injector`, `Corpus`, `Loop`, `Main`, `Census`.

## Oracles

## Fixtures

## Coverage Matrix

## Gaps, Risks and Routed Items
