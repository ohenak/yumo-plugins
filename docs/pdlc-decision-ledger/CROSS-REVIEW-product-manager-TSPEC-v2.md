# Cross-Review: product-manager — TSPEC (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.2)
**Date:** 2026-08-28
**Iteration:** 2
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria
fidelity. Delta re-review per protocol: prior findings verified, then only the sections the
revision changed were scanned for new issues.

## Method

Diffed `9635b9ad2..HEAD` on the TSPEC (304 insertions, 29 deletions across §1, §2.3, §2.5, §3.4,
§3.5, §3.6, §4.2, §4.3, §5.3, §7, §8.1, §9). Every new claim about repository state was checked
against code rather than against the document's prose, and §3.6's measurement was re-executed
independently: I re-ran `DECISION_HEADING_RE` over `DECISION_CORPUS_ARGV`'s globs at the Baseline's
`Verified at` commit `8c673a09f` and rendered §4.3's new line format.

**The measurement reproduces exactly.** My figures for the shipped `§ {id}` form, index lines only:
41 lines / 6,305 bytes (project-level), 45 / 7,042, 48 / 7,650, 63 / 10,859 — identical to §3.6's
table in all eight cells. Code claims spot-checked and confirmed: the sentinel region at
`pdlc/workflows/orchestrate-dev.js:2184`/`:2892`; `sourceExcludingParser`'s region slice and
brace-matched parser slice at `pdlc/workflows/__tests__/advisoryDisabled.test.js:717-735`; the
hand-transcribed `EXPECTED_MERGE_BASE_SHA` literal and the `--is-ancestor … HEAD` second signal at
`pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js:130`, `:246`, `:249`; the per-file
coverage stage at `pdlc/workflows/package.json:9`; §6.1's row count (fourteen). §5.3's "eight other
blocks" is exact — `.claude/pdlc.config.example.json` parses to precisely the eight named keys.

## Prior findings — disposition

| Prior | Status | Evidence |
|---|---|---|
| F-01 (High) | **Resolved** | §3.6 now states the measurement instead of contradicting it, §4.3 shortens the citation to `{sourcePath} § {id}` (D-7), the residual REQ-owned default is routed as ERR-2, and §9.3's T-2 is closed rather than deferred |
| F-02 (Medium) | **Resolved** | §7.6's AT-01 row and its note bound the configuration explicitly, and name the wrong fix (trimming the expected set) so it is not applied later |
| F-03 (Medium) | **Resolved** | §2.5 records the asymmetry at the decision, in the terms the finding asked for |
| F-04 (Low) | **Resolved** | §3.5's reason now names the id-namespace conjunct and `M-4b` |
| F-05 (Low) | **Resolved** | §1.2's heading, §1.3's `§3.5`, §5.3's eight blocks — all three corrected and the last one verified against the file |

No prior finding is left open, and nothing the revision touched broke a section previously approved.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | §3.6's replacement claim is again unhedged: with ~495 bytes of headroom the project-level corpus is protected by its current size, not by the mechanism, and no oracle reddens when it grows | REQ-DECLEDGER-01, REQ C-5 |
| F-02 | Medium | Local | The `§ {id}` citation makes FSPEC AT-02's "carries the cited heading" unsatisfiable from the rendered line, and §4.3's stated discharge reads the parsed record's own `heading` field | REQ-DECLEDGER-01, BR-3, AT-02 |
| F-03 | Low | Local | ERR-2's "137–160 bytes/line" for feature-level lines is wrong; measured feature-level lines are 152–261 bytes (averages 183–206). The erratum's conclusion is unaffected | REQ C-5 |
| F-04 | Low | Local | §7.3 mischaracterises the `DEC-LOOPECON-07` precedent as scanning the whole file; the shipped census scans per-declaration slices | REQ-DECLEDGER-08, BR-11 |
| F-05 | Low | Local | AT-03's mutation site diverges from FSPEC AT-03's literal Given without being labelled a divergence | REQ-DECLEDGER-01, BR-9, AT-03 |

### F-01 (Medium) — "always" is the same shape of claim the revision just retired

§3.6 now says: *"every reviewer receives the **whole** project-level corpus, on every feature,
always"*, and *"the shared, promoted material every reviewer is measured against is the material the
bound never reaches."*

Today that is true, and I reproduced the arithmetic: 6,305 bytes of lines against `8000 − 1200 =
6,800`. But "always" and "never reaches" are properties of the *mechanism*, and the mechanism does
not have them. The omission order drops feature-level lines first, which **prioritises** the promoted
corpus; once the feature-level lines are exhausted, project-level lines are dropped like any other.
What protects them today is 495 bytes of headroom — at the measured project-level line size (109–200
bytes, mean 153) that is **about three decisions**. `docs/_decisions/` grows by exactly the mechanism
this pipeline runs on its own cadence: consolidation promotes decisions into it. So the day the
promoted corpus reaches ~44 records, a reviewer silently stops receiving part of the material
REQ-DECLEDGER-01 exists to deliver, and nothing in the spec's test strategy notices.

This is the same failure mode as v0.1's "the bound is never reached", one iteration later and one
threshold along, which is why it is worth naming rather than letting stand as prose.

Two changes, both small and both inside this document:

1. Hedge the claim to what is measured: the project-level set is admitted whole **at the Baseline's
   commit, with ~495 bytes of headroom (~3 records)**, and the order prioritises it rather than
   guaranteeing it.
2. Give the claim an oracle. §7.6 already establishes that AT-01 runs with the bounds non-binding, so
   nothing today exercises the shipped defaults. One unit assertion — *under C-5's defaults, over the
   frozen corpus, the rendered block contains all 41 project-level lines and `omitted[]` contains no
   project-level id* — turns the headroom into a tripwire that reddens when the corpus grows, instead
   of a sentence that quietly expires. That is a cheap addition to §7.5's neighbourhood and it is the
   only place the shipped default configuration is tested at all.

### F-02 (Medium) — AT-02's oracle after the format change

The citation change (D-7) is right and I support it — the long form rendered the statement twice and
cost a third of the block. But it moves an acceptance criterion out from under its own wording.
FSPEC AT-02 reads: *"for each line, the cited record file exists and **carries the cited heading**"*
(`FSPEC-pdlc-decision-ledger.md:359-361`). Under `[{sourcePath} § {id}]` the rendered line no longer
cites a heading, so a test author working from AT-02's literal text writes an oracle with nothing to
resolve.

§4.3 anticipates this in one clause — `DecisionRecord.heading` *"is retained on the type because …
AT-02's resolution check reads it"* — and that clause is exactly where the risk sits. If the check
reads `heading` off the parsed record, it compares the recogniser's own output against the file the
recogniser read, and the **rendered line is not in the loop at all**: a renderer emitting a wrong
statement, or citing the wrong `sourcePath`, passes. That is an implementation echo of the kind §7.3
and §7.5 are otherwise scrupulous about — §7.5's new paragraph makes precisely this argument for the
property's formatter.

State the resolution chain from the rendered line instead, in §7.6's AT-02 row: take the `sourcePath`
and `id` **as rendered**, open that file in the frozen fixture, find the heading matching
`DECISION_HEADING_RE` with that id, and assert its statement equals the rendered line's statement
field. That discharges AT-02's intent — the citation resolves at its own source and the statement
says what was decided — with no field read from the component under test. And because the format
choice is Q-1's, delegated to this spec, the FSPEC's wording should follow the format rather than the
other way round; I have raised that as an erratum so AT-02's text is corrected at its owner rather
than reinterpreted here.

### F-03 (Low) — the per-line figure in ERR-2 is wrong

§3.6 and ERR-2 both cite *"the measured 137–160 bytes/line"* for feature-level lines. Re-measuring at
`8c673a09f` under the shipped format: feature-level lines run **152–261** bytes (means 183 for
`pdlc-advisory-wave-gate`, 191 for `pdlc-engineering-loop`, 206 for `pdlc-headless-engine`).
Project-level lines run 109–200, mean 153 — which is where the cited range appears to come from, so
it is the right number attached to the wrong set.

The conclusion survives: 495 bytes still admits about two feature-level lines (2 × 206 = 412 fits,
3 × 184 = 552 does not), and ERR-2's headline figures — 6,305, 10,859, 12,059, and the proposed
12,500 — are independent of this and all reproduce exactly. But this figure is being routed upstream
as an input to a REQ-owned product decision, so it should be the measured one.

### F-04 (Low) — the precedent does scan regions, and that helps rather than hurts

§7.3 argues the earlier census wording was unimplementable, and it is right on both operands — `id`
is ubiquitous, and there is exactly one sentinel-bounded region in the file. The rewritten census
(frozen distinctive token set, set-equality against the exported symbol names, whole file minus four
brace-matched owned slices) is implementable and non-vacuous, and I have no objection to it.

One supporting claim is inaccurate: *"`DEC-LOOPECON-07`'s own census … does not scan regions either:
it asserts **zero occurrences of named literal tokens over the whole file**"*. The shipped test
asserts zero occurrences of `ANCHOR_TOKENS` **within each builder's body**, sliced from its
declaration to the next one, over a builder set checked by set equality against HEAD source
(`pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:114`, `:117-128`, `:139`, `:161`). So the
precedent is *closer* to what this spec designs than the paragraph claims — declaration-anchored
slicing is exactly the instrument §7.3 then adopts. Restate the sub-argument as what it actually is:
"convergence", "dedupe" and "erratum-mint" are not single named declarations, so they cannot be
sliced the way `parseAdvisoryConfig` or a builder can — which is a sharper reason for the same
design.

### F-05 (Low) — AT-03's divergence is a divergence, and should say so

§7.6's note moves AT-03's mutation from the fixture files to the scripted `_readFile` double's
returned text, because §7.3's per-file digest guard makes the fixture copy immutable. The reasoning
is sound and the resulting test is a stronger falsifier of "holds no snapshot" than editing a file
would be. But FSPEC AT-03's Given says *"a record **in the frozen fixture copy** changes between two
dispatch constructions"* (`FSPEC-pdlc-decision-ledger.md:365-367`), so this is a substitution of the
stated mechanism, not merely a level choice. §9.1 records eight such choices as decisions with their
rejected alternatives; this one deserves the same treatment — one line saying the FSPEC's literal
mechanism is contradicted by §7.3's immutability guard, and that the double's return is the
equivalent that preserves AT-03's subject (re-gathering per dispatch, §2.6, BR-9) and its "the live
repository is never mutated" constraint.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §4.3 pins framing to ≤1,200 bytes and §3.6's headroom arithmetic charges the full 1,200. Has the rule text been drafted against that budget? BR-5's two conjuncts plus BR-6's two labelled exemplars plus the preamble and trailer is a lot of prose for 1,200 bytes, and if the pin has to be raised later the 495-byte headroom in F-01 shrinks one-for-one |
| Q-02 | ERR-2 offers the operator two resolutions (raise C-5's default to 12,500, or leave it and let operators revise per A-1). Does the PLAN need a task either way, or is this genuinely a no-code outcome? §9.3 says "no PLAN task is owed" for T-2, which reads as covering only the measurement |

## Positive Observations

- **The High finding was not merely answered, it was inverted into a design improvement.** The
  cheapest response to F-01 would have been to restate §3.6's rationale and leave the format alone.
  Instead D-7 takes the format defect the measurement exposed, removes ~33% of the block, and records
  the alternative it rejected with the numbers attached. The feature ships strictly better than it
  would have without the round.
- **The measurement is now reproducible from the document.** §3.6's table names the commit, the two
  candidate formats and the four in-scope sets, which is what let me re-derive all eight cells
  independently and land on the same numbers to the byte. A spec that can be re-executed by its
  reviewer is worth much more than one that can only be believed.
- **The right thing was routed rather than taken.** ERR-2 is a textbook use of the erratum channel:
  the spec takes the choice that is its own (the line format, Q-1) and routes the one that is not
  (a REQ C-5 default, with product consequences for what a reviewer sees), supplying the measurement
  so the decision can be made on numbers instead of analogy. §9.3's T-2 closure — "the premise was
  wrong, nothing had to wait for an implementation" — is the same discipline applied to its own
  earlier deferral.
- **Every new test paragraph strengthens an oracle rather than describing one.** §3.4's positive
  conjunct (cardinality alone passes under the rejected precedence direction), §7.5's independent
  formatter, §7.4's AT-04/AT-05 entry-point split with its "four identical inputs" vacuity argument,
  and §7.6's "never trim the expected set" instruction are four separate false-greens caught before
  a line of code exists.
- **The coverage obligation is the honest version.** §7 states plainly that the shipped per-file gate
  cannot see this feature's branches inside a ~817 KB file, declines to claim it as evidence, and
  replaces it with a row-to-test mapping the PLAN must discharge. Declining to cite a green check you
  know is uninformative is the harder and better call.
- **§8.1 now carries E-9/E-10/E-11 by id**, so the three edge cases REQ-DECLEDGER-01 depends on trace
  to a named mechanism and a pinned corpus instance rather than living only in §3's prose.

## Recommendation

**Approved with minor changes**

The High finding from round 1 is resolved, and resolved better than asked. Nothing the revision
touched broke a previously approved section, and the eight measurement cells I re-derived match to
the byte. No finding gates this document.

The two Mediums are worth landing before implementation begins, because both are cheap now and
expensive later: F-01 adds one assertion that turns 495 bytes of headroom into a tripwire and hedges
a claim that will otherwise expire silently, and F-02 fixes an AT-02 oracle description that would
otherwise be written to read the component under test. F-03, F-04 and F-05 are one-line corrections.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}
