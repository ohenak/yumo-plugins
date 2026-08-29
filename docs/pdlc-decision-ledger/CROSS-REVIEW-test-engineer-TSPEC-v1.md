# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (Draft v0.1, 2026-08-28)
**Date:** 2026-08-28
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §3.6's "under the shipped defaults the bound is never reached and the order is inert" is **false, measured**. Executing §3.2's `DECISION_HEADING_RE` and §4.3's line format over the corpus at `8c673a09f` renders the project-level set **alone** at 9,371 bytes (41 lines, mean 232 B/line) — already past `maxBytes` 8000 before any feature record and before the framing §4.2/D-5 charges to the bound. §7.6's AT-01 dispatches measure 10,441 B (45 lines, `pdlc-advisory-wave-gate`) and 11,354 B (48 lines, `pdlc-engineering-loop`); the largest, `pdlc-headless-engine`, is 16,283 B (63 lines). The omission order is live on day one, and AT-01's expected line sets are unrenderable at the C-5 defaults | §3.6, §4.2, §9.1 D-5, §7.6 AT-01 |
| F-02 | High | Local | §7.4's recorded stream cannot discriminate AT-05's four not-enabled spellings, so that oracle is vacuous. The case drives "the exported `reviewLoop` directly", but `reviewLoop` never reads config: the gate is in `main()` (`readLearningsConfigSafely` at `orchestrate-dev.js:15071`, `wrapperSeams` at `:15170`), and `reviewLoop`'s parameter list (`:9194–9240`) takes only seams. Under all four spellings the direct driver passes `_injectDecisionLedger` unset and emits identical bytes for a reason unrelated to the gate — a test that can only pass | §7.4 "Recorded stream", §7.6 AT-04/AT-05 |
| F-03 | High | Local | §7.4 clause (b) prescribes an oracle the cited precedent deliberately rejected. `loopEconomicsBaselineGuard.test.js:239–253` pins `mergeBaseSha` to a **hand-transcribed** `EXPECTED_MERGE_BASE_SHA` and adds only `git merge-base --is-ancestor`, naming ancestry a "weaker second signal". Recomputing `git merge-base origin/main HEAD` *at test time* is non-hermetic — it needs a fetched `origin/main` (absent in a shallow CI clone) and moves whenever `main` advances — so a delivery-blocking gate check reds for reasons unrelated to the artifact | §7.4 pinning clause (b) |
| F-04 | High | Local | §3.4's cross-file precedence **direction** has no positive oracle anywhere in §7. FSPEC AT-18 is cardinality-only by its own words ("Which of the two records supplies the statement is TSPEC's … deliberately not asserted here", FSPEC `AT-18`); §7.6 defers the conjunct to "§3.4, asserted separately there", but §3.4 assigns no test, and §7.2's corpus oracle runs over the frozen HEAD corpus where `M-5a` records **zero** duplicate ids. A feature-level-wins implementation passes every test this spec names | §3.4, §7.6 AT-18 |
| F-05 | High | Local | §7.3's source census — the sole mechanism §8.1 assigns to REQ-DECLEDGER-08/BR-11 — is unimplementable as written. It forbids "identifiers from the ledger's output types (`DecisionRecord`'s `id` …)", but `id` is a ubiquitous token in `orchestrate-dev.js`; and it scopes the scan to "the convergence, dedupe, derivative-stop, erratum-mint or confirmation-presence **regions**", which have no source delimiters (the file's only sentinel-bounded region is `// === LEARNINGS INJECTION REGION START/END ===`, `orchestrate-dev.js:2184`). The cited precedent `DEC-LOOPECON-07` (`DECISIONS-pdlc-loop-economics.md:196–198`) is specified as set equality over a **named function census** plus zero occurrences of **three literal tokens** | §7.3 "Source census", §5.5 |
| F-06 | Medium | Local | §4.2 has `selectDecisions` compute `renderedBytes` *including* framing while §4.3 has `renderDecisionLedgerBlock` *produce* the framing. Two sites own one byte budget with no stated single source of truth; a drift makes BR-12's bound wrong while both functions individually look right | §4.2, §4.3 |
| F-07 | Medium | Local | §7 states no branch-coverage obligation. All new code lands in `orchestrate-dev.js` (D-6), whose per-file c8 floor is computed over a ~17k-line file (`pdlc/workflows/package.json` c8 `include: **/pdlc/workflows/orchestrate-dev.js`), so §6.1's fourteen new failure branches can be wholly uncovered without moving the gate | §7, §9.1 D-6 |
| F-08 | Medium | Local | §7.6 AT-03 says a record is "mutated **in the fixture copy** between two injector calls" while §7.3 guards that copy with hand-transcribed per-file digests. Taken literally the two reds each other | §7.3, §7.6 AT-03 |
| F-09 | Medium | Local | §7.5's model is "the production line renderer applied per record" — an implementation echo. The no-truncation conjunct then cannot fail for a wrong line **format**; only the prefix conjunct is non-vacuous | §7.5 |
| F-10 | Low | Local | `E-1` is overloaded inside one document: FSPEC's E-1 (cited at §2.3) and this spec's own erratum id E-1 (§4.1, §9.2). A PROPERTIES author transcribing "E-1" cannot tell which | §2.3, §4.1, §9.2 |
| F-11 | Low | Local | FSPEC `E-9`, `E-10`, `E-11` are never cited by id in this spec. The behaviour lands (§3.2, §3.3, §3.4) but §8.1's traceability cannot be checked mechanically against the FSPEC's edge-case set | §8.1 |
| F-12 | Low | Local | Neither §2.1 nor D-6 states whether the new symbols land inside or outside `// === LEARNINGS INJECTION REGION START/END ===`. `advisoryDisabled.test.js:711–742` slices that region out before counting `/\.enabled\b/`, so placement decides whether §2.3's destructured-read discipline is load-bearing or moot | §2.1, §2.3, §9.1 D-6 |

### What must change — the five High findings

**F-01, with the measurement.** I re-executed §3.2's `DECISION_HEADING_RE` and §3.1's
`DECISION_CORPUS_ARGV` over the tree at `8c673a09f`, rendered each record through §4.3's exact line
form (`{id} — {statement}  [{sourcePath} § {heading}]`) and measured UTF-8 bytes:

| In-scope set | Lines | Body bytes (framing excluded) |
|---|---|---|
| `docs/_decisions/` alone | 41 | **9,371** |
| + `pdlc-advisory-wave-gate` (AT-01 (a)) | 45 | **10,441** |
| + `pdlc-engineering-loop` (AT-01 (b)) | 48 | **11,354** |
| + `pdlc-headless-engine` (the `M-6b` worst case) | 63 | **16,283** |

Mean line cost is 232–258 bytes because the citation restates the whole heading, which already
contains the statement — so each decision is charged its statement roughly twice. Against C-5's
`maxBytes: 8000`, and with D-5 charging header, preamble, `DECISION_LEDGER_RULE_TEXT` and trailer to
the same bound, the shipped default drops on the order of half the project-level index on a bare
repository. Three consequences this spec must resolve rather than defer to `T-2`:

1. §3.6's inertness claim must be corrected — the omission order is live at the defaults, so its
   "safe direction" argument is load-bearing from day one, not a contingency.
2. §7.6's corpus-oracle rows must state the `maxEntries`/`maxBytes` they run under, explicitly and
   generously, or AT-01's 45/48-line set-equality can never pass. Today the section names line
   counts and no thresholds.
3. Either the default rises upstream or §4.3's line form drops the redundant heading restatement
   (the `sourcePath` plus id already resolves the citation for AT-02). Both are legitimate; the
   spec must pick one. I have routed the default upstream as errata against REQ and FSPEC.

**F-02.** Split the concern. Keep the narrow `REVIEW-LOOP-REVIEWER-PROMPTS` case for AT-04's
byte-identity, and give AT-05 a second case that enters through the **config gate** — the four
spellings supplied as `learningsConfigText` and driven far enough that
`buildDecisionLedgerInjector`'s `null` return is what produces the identical bytes. Whatever the
entry point, state in §7.4 which function consumes the config text in the recorded arm; as written
the config never reaches the recorded path, and every arm passes by construction.

**F-03.** Replace clause (b) with the shipped shape: a hand-transcribed `EXPECTED_MERGE_BASE_SHA`
literal that `MANIFEST.json`'s `mergeBaseSha` must equal, plus `git merge-base --is-ancestor` as the
weaker second signal. That keeps the "captured from the wrong base fails loudly" property the clause
wants without importing a moving, network-dependent expected value into a gate check.

**F-04.** AT-18's cardinality conjunct is exactly the precedence-chain false-green shape: the
terminal state ("one line") is reached under both readings. Assign the positive conjunct here —
over O-5's synthetic two-file fixture, the single rendered line's `statement`, `sourcePath` and
`origin` must equal the **project-level** record's, each transcribed literally from the fixture, and
the feature-level record's statement must be asserted **absent** from the block. Say so in §3.4 or
§7.6; "asserted separately there" currently points at a section that assigns no test.

**F-05.** Specify the census the way `DEC-LOOPECON-07` specifies its own: (a) an enumerated,
set-equality-checked list of the function names that constitute each named region, so a renamed or
newly-added consumer fails rather than silently escaping the scan; and (b) an enumerated list of
**literal tokens** to count zero of — `selectDecisions`, `renderDecisionLedgerBlock`,
`DECISION_LEDGER_OMIT_REASONS`, `DecisionRecord` and so on — never a field name as generic as `id`.
Then say what the expected count is (zero) and which arm falsifies it.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §4.3 charges every decision its statement twice (once as `statement`, once inside the full `heading` citation). AT-02 only needs the citation to resolve at its own file — would `{sourcePath} § {id}` discharge it, and roughly halve the block? That would move F-01 from "the default is wrong" to "the format was wasteful". |
| Q-02 | §7.2's corpus-oracle row says the rule's output "reproduces `M-1d`, `M-2e`, …". Is that set equality over the full per-directory id map (so a deleted directory fails), or per-count assertions? §7.6 AT-01 says whole-line equality for two dispatches only — the other ten directories in `M-2e` then have no oracle at all. |
| Q-03 | §4.2 returns `omitted[]` with `reason` `RSN-ENTRIES` / `RSN-BYTES`, but a line dropped by the single loop can satisfy both predicates at once (F-11/F-12 in §6.1). Which reason is recorded, and is that pinned by a test? As written the catalogue is a set-equality operand with an unspecified assignment rule. |
| Q-04 | §6.1 F-8 treats `_readFile` returning `undefined` as a failed read, but §4.4 types the seam `Promise<string \| null>`. Is `undefined` a fourth case the double must script, or is F-8's mention redundant? |

## Positive Observations

- **§3.5's verification table is correct, and I confirmed it by execution, not by reading.** Running
  `DECISION_CORPUS_ARGV` + `DECISION_HEADING_RE` + last-wins over the tree at `8c673a09f` reproduced
  every figure: 25 files, 41 project-level distinct ids, 100 feature-level ids, and every
  per-directory count (`pdlc-headless-engine` 22, `pdlc-advisory-tier` 11, `pdlc-engine-distribution`
  / `pdlc-learnings-injection` / `pdlc-loop-economics` 10 each, `pdlc-consolidation-agent` /
  `pdlc-wave-resume` 8, `pdlc-engineering-loop` 7, `orchestrate-dev-workflow` 6,
  `pdlc-advisory-wave-gate` 4, `pdlc-rcv-budget-stop` 4, `pdlc-plugin-retirement` 0), plus
  `DEC-LOOP-01`'s statement resolving to the second, deciding opening. A spec whose central rule
  reproduces its baseline exactly is rare and worth saying out loud.
- **§3.2's five-conjunct table earns each conjunct against a named counter-instance.** The optional
  ordinal prefix is genuinely load-bearing: without it `pdlc-engine-distribution` and
  `pdlc-consolidation-agent` contribute 0 instead of 18, which I confirmed.
- **§7.3's frozen-fixture-not-live-repo argument is right and is the correct generalisation** of the
  `coveredViolations` whole-tree hazard. Reading the live tree would red the moment this feature's
  own DECISIONS document lands.
- **§2.3's "destructured, not dotted" is a real constraint, correctly identified.**
  `advisoryDisabled.test.js:738–742` counts `/\.enabled\b/` over `orchestrate-dev.js` (learnings
  region and `parseAdvisoryConfig` body excluded) and asserts **exactly three**; a dotted
  `decisionLedgerConfig.enabled` would red it. Very few specs catch a pin that indirect.
- **Set equality is demanded in the right three places** — §5.2's catalogues, §5.3's
  `decisionLedger` key map, §7.4(c)'s case ids — and §5.3 correctly reasons about containment for
  the shared top-level section set, matching `loop-config-example.test.js:63–80` exactly.
- **§6.2's single predicate on what *survives* is the right shape.** It removes a whole family of
  precedence-chain false greens by construction: there is no terminal state an earlier branch can
  preempt, because there is only one branch.
- **§6.4's degradation-toward-absence argument** is stated as a testable direction (never a guessed
  statement, never a placeholder line, never a truncation), not as a sentiment.

## Recommendation

**Needs revision**

Five High findings. The design is strong and its central rule is verified; what is not yet sound is
the **test strategy**, and specifically four oracles that cannot fail for the thing they are named
after — AT-05's config spellings never reaching the recorded stream (F-02), the merge-base assertion
that reds on unrelated events (F-03), the precedence direction with no positive conjunct (F-04), and
a source census whose operand and token sets are unspecified (F-05) — plus a bounds design whose
inertness premise is false at the shipped default (F-01, measured). Each has a concrete path
forward stated above; none requires rethinking §3.

## Verdict

VERDICT: Needs revision
{"high": 5, "medium": 4, "low": 3}
