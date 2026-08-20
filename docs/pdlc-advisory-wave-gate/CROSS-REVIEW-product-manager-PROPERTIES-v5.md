# Cross-Review: product-manager — PROPERTIES (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 5
**Scope:** Delta confirmation of the round-4 erratum edit, plus re-verification of this document against its upstream at HEAD (DEC-ERR-03)

## Overview

The dispatch reports every routed item ABSORBED against upstream HEAD, so the confirmation question
is the DEC-ERR-03 one: is this PROPERTIES still a faithful compression of REQ/FSPEC/TSPEC/DECISIONS/
PLAN *as they read now*? I verified all five upstream digests against the tree before reading a line
of the delta — REQ `817b6745…`, FSPEC `82f74a2d…`, TSPEC `1531143c…`, DECISIONS `84deee10…`, PLAN
`e97acf66…` — all five match the dispatch exactly, so the base I am measuring against is the base
the orchestrator named.

**What the delta is.** Four commits (`811f3484`, `af5c3784`, `58bf21a3`, `50aa3950`) plus a lineage
commit (`0c0475a7`): +46/−21 lines across the Overview, derivation rule 1, PROP-SEAM-02, PROP-CFG-03
and two Fixtures rows. No property statement, category, level assignment, oracle form, PLAN home or
AC mapping changed — I diffed the property tables end to end to confirm that claim in the v1.2
changelog row rather than take it on trust. The edit is exactly the "grounding restatement of two
paragraphs" v4's F-01 asked for, plus the two citation re-anchors.

**Round-4 findings, disposition.**

| v4 finding | Severity | Landed? | Evidence at HEAD |
|---|---|---|---|
| F-01 file-existence paragraph asserts both `new` files "absent at HEAD" | High | **Yes** | Both paragraphs restated. `advisoryWaveGate.test.js` (1.8 K) and `pdlc/engine/__tests__/advisory-config-example.test.js` (2.5 K) are on disk; the document now says so, attributes the landing to `e3b9d5a3`, and quotes TSPEC §5.1's *Status column caveat* verbatim — I diffed the quotation against §5.1 and it matches byte for byte, including "both are on disk, the latter red because `.claude/pdlc.config.example.json` carries no `advisory` section at HEAD" |
| F-02 derivation rule 1's four cardinality sites pinned at `(5)` and stale lines | Medium | **Yes** | Rule 1 now re-anchors all four by block title, in the same words TSPEC §1.3's end-state table uses, and records them as **already reading `toHaveLength(6)` and red at HEAD**. Measured: `advisoryDisabled.test.js:629`, `advisoryQueueSeams.test.js:634`, `advisoryHarvest.test.js:578` and `:733` all read `(6)` |
| F-03 PROP-CFG-03 / Example-config row cite raw `ci-arrangement.test.js:39`, `:799`–`:819` | Low (Process) | **Yes** | Both re-anchored to `const configPath` and the test titled `ci arrangement — .claude/pdlc.config.example.json's implementation.testCommand`. Verified at `ci-arrangement.test.js:39` (the symbol) and `:789` (the title) — the title anchor is correct and the line pin it replaced had already drifted |

Beyond the routed list, the edit also re-anchored PROP-SEAM-02's member-literal pins and the `SEAMS`
fixture row off `advisoryDoubles.js:271` — a pin that had drifted to `:354`. That is the DEC-DOC-01
bar being met without being asked, and it caught real drift.

**One thing the delta did not sweep**, carried as the sole finding of this round: the
verbatim-string-discipline paragraph still pins the eight refusal reasons at
`orchestrate-dev.js:2297`–`:2306` and the exclusion ids at `:2311`. Both are raw `file:line` anchors
and both have drifted — the catalogue now spans `:2301`–`:2310`, and `:2311` lands on a comment. Low,
`Process`, inherited, non-gating.

## Properties

Scope here is the product lens only: does the property set still say what the approved requirements
say, after the erratum and after upstream moved? I re-read the property statements the delta touched
or leaned on, against upstream at the dispatched digests.

| Property | What it now says | Upstream at HEAD | Faithful? |
|---|---|---|---|
| PROP-SEAM-02 | Every cardinality-coupled transcription surface must read six, "as one set", anchored by symbol or block title; at HEAD all read six **except** `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality, still `["A1" … "A5"]` | TSPEC §1.3's *State of these surfaces at HEAD* table: "its `rows.map((r) => r.seam)` equality **still reads `["A1" … "A5"]`** / the one test-side literal not yet transcribed" | **Yes, exactly.** I confirmed the residue independently — `advisoryRecord.test.js:496` reads the five-member list while `:505` already compares against `ADVISORY_SEAMS`. The property still states the required end state, and the new sentence is careful to say so ("the set-equality this property fixes is the end state, not the edit list"), which is the right product framing: the AC is about the shipped contract, not about who edits which line |
| PROP-CFG-03 | Example config must carry the whole `advisory` section `{"enabled": false, "waveBudgetPerRun": 1}`; asserted in the purpose-named engine file, never in `ci-arrangement.test.js` | REQ §5 C-2 (`waveBudgetPerRun` default `1`), TSPEC §4.4 and §5.1's engine-channel row | **Yes.** The default `1` in the property matches REQ C-2 at v1.9; the disposition (second reader, `ci-arrangement.test.js` stays unowned) matches TSPEC §5.1 and PLAN's manifest. Only the citation form changed |
| PROP-CTR-10 / NFR-4 | Unchanged this round | REQ v1.9 NFR-4 unchanged since v4 | Yes — v4 already confirmed this pair; nothing in the delta touches it |
| PROP-CTR-13 / `waveBudgetPerRun: 0` | Unchanged this round | TSPEC §4.4 unchanged | Yes |
| PROP-DIS-06 | Unchanged; `.enabled` count of three | TSPEC §1.3 end-state table: "**unchanged at three** — a constraint on A6, not an edit" | Yes |

**Scope compliance.** The delta adds no behaviour, no new property, no new AC. The one genuinely new
paragraph ("The `new` files are on disk at HEAD, and `new` means required end state") is *grounding*
prose, and it explicitly declines to make the product decision that is not this document's to make:
"Whether those early-landed edits are reverted or PLAN's A6 batches are re-derived around them is
PLAN's and Phase I's call, not this document's." That is the correct boundary — a PROPERTIES doc
that had picked a disposition here would have been a scope finding.

**Acceptance-criteria traceability.** The AC→property map in §C-1 is byte-unchanged in the diff, so
every P0/P1 criterion that resolved at v4 still resolves. I spot-checked the chain v4 flagged as
load-bearing: AC-6.2 → PROP-REC-03/-04/-07 → A6-17 → `advisoryEscalationLog.test.js`, which TSPEC
§5.1 still carries as an `edited` row. Intact.

## Oracles

The oracle side is where v4's High finding actually bit, so I measured rather than reasoned. All
figures below were taken from the working tree on `feat-pdlc-advisory-wave-gate` at the commit under
review.

**File existence.**

- `pdlc/workflows/__tests__/advisoryWaveGate.test.js` — exists, 1.8 K.
- `pdlc/engine/__tests__/advisory-config-example.test.js` — exists, 2.5 K.

Both paragraphs that previously called these "verified absent at HEAD" now say the opposite, which is
what the tree says and what TSPEC §5.1 and PLAN v1.7 both say (PLAN: "A6-04 restated as *discharged by
verification* — `advisory-config-example.test.js` already exists at HEAD, landed by `e3b9d5a3`"). Three
documents now agree where two disagreed. v4's F-01 is closed.

**Cardinality sites.** All four bare row-count assertions measured at HEAD:

| Site | Reads |
|---|---|
| `advisoryDisabled.test.js:629` | `toHaveLength(6)` |
| `advisoryQueueSeams.test.js:634` | `toHaveLength(6)` (with the `// ADVISORY_SEAMS (S-1)` trailing comment the document names) |
| `advisoryHarvest.test.js:578` | `toHaveLength(6)` |
| `advisoryHarvest.test.js:733` | `toHaveLength(6)` |

Derivation rule 1 now records exactly this, anchors by block title, and adds the honest consequence —
"the pending edit is the production constant, not these assertions". The rule itself is unchanged, so
no property moved. v4's F-02 is closed.

**Citation anchors re-verified.**

- `ci-arrangement.test.js` — `const configPath` resolves the example config at `:39` (the symbol
  anchor holds), and the test titled `ci arrangement — .claude/pdlc.config.example.json's
  implementation.testCommand` exists at `:789`. Both anchors resolve; neither is a line pin.
- `helpers/advisoryDoubles.js` — `const SEAMS` carries the six-member form. The old `:271` pin was
  stale (the declaration sits at `:354`), so re-anchoring to the symbol both met DEC-DOC-01 and fixed
  a false citation.
- `advisoryDodSeams.test.js:371` (Real-repository fixture builder row) — still a raw line pin, but it
  still resolves: `mkdtempSync(join(tmpdir(), "pdlc-a3-fixture-"))` is at `:371`. Untouched by this
  round; not worth a finding of its own beyond the one below.

**The one anchor that no longer resolves.** The verbatim-string-discipline paragraph pins the eight
refusal reasons to `orchestrate-dev.js:2297`–`:2306` and the five exclusion ids to `:2311`. Measured:
`ADVISORY_REFUSAL_REASONS` opens at `:2301`, its members run `:2302`–`:2309`, and `:2311` is a comment
line introducing the exclusion set. The pins are both raw `file:line` (DEC-DOC-01, `Process`, Low) and
now factually off. The *discipline* the paragraph states — transcribe, never paraphrase — is correct
and unaffected; only its evidence pointer has drifted. Low, inherited, non-gating: absorb it whenever
this section is next edited, exactly as the round-4 edit absorbed the `:271` and `:39`/`:799` pins.

## Fixtures

The delta touched two fixture rows; I re-read the whole inventory against upstream at HEAD anyway,
since DEC-ERR-03 makes the document — not the item list — my scope.

- **`SEAMS` literal row** — changed from "verified at HEAD as five at `helpers/advisoryDoubles.js:271`"
  to "`const SEAMS` declaration already carries the six-member form at HEAD (TSPEC §1.3), so this
  fixture row records the required end state, not an edit outstanding". Both halves check out: the
  declaration is six-member, and TSPEC §1.3's HEAD table says "`advisoryHarvest.test.js`,
  `consolidationProperties.test.js` and `helpers/advisoryDoubles.js` already carry six members and an
  A6 double". The old row asserted a fact that was false at HEAD; the new one is true and carries the
  end-state framing consistently with the rest of the document.
- **Example-config fixture row** — re-anchored off `:39` / `:799`–`:819` to `const configPath` and the
  `implementation.testCommand` test title, with the two `testCommand` regexes now quoted inline rather
  than pointed at by line. Strictly better: the baseline the advisory-key addition must leave standing
  is now stated, not referenced.
- **Config fixtures** (`waveBudgetPerRun` ∈ {`1`, `0`, `-1`, `1.5`, `"x"`, `null`, absent}, plus the
  tier-off and tier-on-A6-off arms) — unchanged, and still match REQ §5 C-2's restored default of `1`
  and TSPEC §4.4's validator. No cascade damage.
- **Mutation, ownership-manifest, gate-output and citation-floor fixtures** — untouched this round and
  trace to TSPEC §3.3, §3.4, §5.2, §5.5, none of which moved between the v4 dispatch and this one.
- **Pre-A6 baseline row** — unchanged; the gate-failure literal it pins is on the production side of
  `orchestrate-dev.js`, which TSPEC §1.3 still records as not having moved.
- **Verbatim-string discipline paragraph** — the only fixture-adjacent text carrying stale evidence
  (see Oracles; F-01 below).

No fixture in the inventory depends on the pre-`e3b9d5a3` test-side baseline any more. That was the
whole of the cascade damage v4 identified, and the delta confined and closed it without reopening the
fixture plan.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Process | The **Verbatim-string discipline** paragraph (Fixtures) pins the eight refusal reasons to `orchestrate-dev.js:2297`–`:2306` and the five exclusion ids to `orchestrate-dev.js:2311`. Both are raw `file:line` anchors, neither is runtime-measured evidence, and both have drifted: `ADVISORY_REFUSAL_REASONS` opens at `:2301` with members at `:2302`–`:2309`, and `:2311` is now a comment line. **Fix:** anchor to the symbol names (`ADVISORY_REFUSAL_REASONS`, and the exclusion-set `const` declaration immediately below it) as this round already did for `const SEAMS` and `const configPath`. Non-gating; absorb whenever this paragraph is next edited | AC-7.2 (`DECISIONS-review-severity-bars.md`, DEC-DOC-01); TSPEC §3.1 |

No High or Medium findings. Every round-4 finding (F-01 High, F-02 Medium, F-03 Low) is landed and
verified at HEAD; no previously approved content was broken by the edit.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The v1.2 changelog row records Phase P's routed item on §1.3's repository-hygiene note as **absorbed at HEAD**, reasoning that §1.3 is TSPEC's section and no PROPERTIES text asserts the superseded `.bak`-only sizing. I confirmed both halves: TSPEC v1.10 §1.3 now states the 28-path three-class residual and routes the partition to PLAN's Overview HEAD-drift note and A6-00's Edit 1, and PLAN v1.7's changelog carries the same 28/14 figures. No PROPERTIES text cites the sizing at all. Nothing owed here — recorded so the harvest phase can see the check was made rather than assumed |
| Q-02 | Carried from v4 and now answerable: the disposition of `e3b9d5a3` (revert vs re-derive) is stated in TSPEC §1.3, PLAN's Overview and now this PROPERTIES as PLAN's and Phase I's call. Three documents defer to a decision none of them makes. That is correct per-document behaviour, but it means the decision has no home yet — worth confirming Phase I opens with it rather than discovering it. Not a PROPERTIES finding |

## Positive Observations

- **The fix was exactly the scope v4 specified — two grounding paragraphs plus two citation
  re-anchors — and nothing more.** The property set, categories, levels, oracle forms, PLAN homes and
  AC map are byte-identical in the diff. An erratum that stays inside its own blast radius is the
  cheapest kind to confirm, and this one did.
- **The new paragraph states its own correction out loud.** "Earlier versions of this paragraph
  recorded both files as *'verified absent at HEAD'*; that is false at HEAD and is the negation of the
  upstream this document compresses." A reader of the next version can see what moved and why without
  a diff. That is the standard the other pipeline documents have been converging on.
- **PROP-SEAM-02 got better, not just correct.** Naming `advisoryRecord.test.js`'s `rows.map` equality
  as the single untranscribed literal, and distinguishing the end state from the edit list, makes the
  property readable as a contract rather than a to-do — which is what a property is for.
- **The re-anchoring caught real drift, not just style.** `advisoryDoubles.js:271` had moved to `:354`;
  DEC-DOC-01 compliance was the mechanism that surfaced it. That is the constraint earning its keep.
- **The document declined to make PLAN's decision for it,** twice and explicitly. Correct lens
  discipline.

## Recommendation

**Approved with minor changes**

The delta resolves every routed item, and I re-verified the document against all five upstream
digests at HEAD rather than against the item list: REQ, FSPEC, TSPEC, DECISIONS and PLAN all match the
dispatched hashes, and nothing this PROPERTIES now cites has moved out from under it. Nothing
previously approved was broken. One Low `Process` finding remains (a pair of drifted raw line pins in
the verbatim-string paragraph); per the approval rules that is non-gating, and it should be absorbed
opportunistically rather than by opening a round for it.

