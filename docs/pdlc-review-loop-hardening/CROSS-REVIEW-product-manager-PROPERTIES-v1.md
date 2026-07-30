# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/PROPERTIES-pdlc-review-loop-hardening.md` v1.0
**Date:** 2026-07-30
**Iteration:** 1
**Scope:** PROPERTIES v1.0 (commits `556e56d..3790f56`), reviewed against the approved `REQ` v1.6 /
`FSPEC` v1.8 / `TSPEC` v1.7 / `PLAN` v1.4, `docs/_constraints/DOMAIN-CONSTRAINTS.md`,
`docs/_queue/QUEUE.md`, and the tree at HEAD. Upstream documents are closed and are not reopened.

---

## Method — what was measured, not inferred (DC-02)

| Claim under review | Command / source | Result |
|---|---|---|
| Suite baseline | `cd pdlc/workflows && npm test` (background) | `1 failed, 70 skipped, 1038 passed, 1109 total`; `1 failed, 35 passed, 36 total` suites; sole red `documentOracles.test.js AT-22`. **Reproduces §2.5 exactly.** Wall clock 331 s under concurrent load (see Q-01) |
| `PROP-` namespace occupancy | `grep -rn "PROP-" pdlc/workflows/__tests__/ \| wc -l` | **431**, across **28** files. Matches §2.1 |
| Live `describe` collision | `grep -n 'PROP-GATE-01' …/pipelineWiring.test.js` | `describe(…)` at **:235**. Matches §2.1 |
| Sixteen chosen domains are free | one `grep -ro "PROP-{DOMAIN}-"` per domain over `__tests__/` | **all sixteen return 0**, `GINV` included. §2.1 and §8.4 verified |
| `shrink` cannot shrink this feature's shapes | read `__tests__/helpers/driftGenerators.js:443–474` | `switch (caseValue.kind)` over exactly `manifest` / `bytes` / `id` / `subRecipe`, `default: return []`. **Verified.** Also measured: the `bytes` arm returns **at most one** rung and only when `bytes.length > 64` |
| §7.1 owner / batch / file / ledger row | PLAN §4 batch table, §5.3, §7.3, row by row for all 18 ids | **All eighteen re-derive correctly.** See ruling R-3 |
| "every one of the ten rides an existing row" | PLAN §7.3, row by row | **Verified.** No new ledger row is needed; the PLAN stays closed |
| DC-08 successor surface | `docs/_queue/QUEUE.md` | Row **Order 9 `pdlc-authoring-contract`**, `blocked`, `Depends-On: pdlc-review-loop-hardening`, body names **T-Q-03** (`MAX_AUTHORING_WRITE_BYTES` has no oracle) and **Q-09** (SKILL ↔ `completeness.test.js` heading drift) explicitly. **Genuine coverage** |

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | **High** | Process | **`PROP-COMPLETE-01` is stated against the wrong subject, so one of the seven floor properties does not meet the floor in substance.** TSPEC §3.7 / §5.9 define `isComplete(artifactClass, docType, fileText)` → `{complete:true} \| {complete:false, missing:string[]}` — it scores the **required top-level headings inside one document's text**, with a body of `TBD` / `TODO` / `_TBD_` / an HTML comment counting as **empty**. §4.1 states it as a set-membership over a *present-set `P` of documents*, asserts `isComplete(P) === true`, and generates `P` by "adding 0…4 documents from a non-required pool (`DECISIONS`, `LEARNINGS`, `POSTMORTEM-*`, an invented `FOO`)". Wrong arity, wrong domain, wrong return type — and the non-empty-body criterion, which is the half TSPEC §8.2's own property row makes load-bearing ("*each with a non-empty body*"; "*bodies drawn from {non-empty, empty, `TBD`, HTML comment}*"), is absent entirely. The document's **own** §3.2 D4 describes the correct domain, so §3.2 and §4.1 contradict. The error propagates to §5.2's `PROP-COMPLETE-01 (2nd)` falsifier ("remove one document from the required set `R`"), §6.4 ("it quantifies over **present-sets**, not over heading text"), §7.2 and §8.1's accounting. As written the property would not exercise `isComplete` at all. **Process tag:** the reusable lesson is that a property must be stated against the TSPEC's exported signature block verbatim, and checked against it — F-02, F-03 and F-05 are the same slip on three other subjects | TSPEC §3.7, §5.9, §8.2; PLAN §4 RLH-12/RLH-16, §7.2 |
| F-02 | **High** | Local | **`PROP-ROUND-01` restates TSPEC §8.2's three-way partition with the wrong three classes — reintroducing the form PLAN §7.2 names as the one that must not return.** §8.2 and PLAN §7.2 both state the partition over `parseReviewFilename`'s split: `entries` (ok, this doc type) / **other-doc-type** (ok, *another* doc type) / `skipped` (`!ok`), and PLAN §7.2 says outright that the weaker form "*is **false** on a correct implementation*". §4.1 states it as *in-window versioned review* / *out-of-window versioned review* / *not a review file* — there is no other-doc-type class, and a well-formed cross-review of another doc type is a review file, so it is counted in none of the three. The arithmetic conservation conjunct ("the three counts sum to the input size") is therefore **false on a correct implementation** for any generated set containing an other-doc-type basename — which §3.2's D1 forces (*"conforming for another doc type"*) and §3.3 asserts a floor over. This is precisely the "an owning section beats a restatement" failure the phase has already paid for | TSPEC §8.2; PLAN §7.2; PROPERTIES §3.2 D1, §3.3 |
| F-03 | **High** | Local | **`PROP-STALE-01` collapses a three-valued public return to a boolean and mis-assigns two inputs.** TSPEC §3.7: `isStale(recordedHash, documentBytes)` → `"UNEVALUABLE" \| "STALE" \| "FRESH"`. §4.2 asserts "*`isStale` is `true` **iff** the document's digest differs from the anchor*" and rules that "*Absence of an anchor is stale by definition, and a malformed anchor is stale, never an error*". TSPEC §6.2 rows 6 and 7 assign an absent / duplicated / unparseable `APPROVAL-HASH:` and an unreadable document to **`UNEVALUABLE`**, which is a distinct disposition with its own report surface (§4.7). The string `UNEVALUABLE` appears **nowhere** in this document (measured). The property's ≥5-malformed and ≥5-absent non-vacuity floors would therefore **red a correct implementation**. This is a contract-fidelity divergence on a public enum, not a wording preference | TSPEC §3.7, §5.5, §6.2 rows 6–7, §4.7 |
| F-04 | **High** | Local | **`PROP-RESOLVE-01` is classified L1 and specified as a direct call on a function an approved PLAN decision forbids any test to name.** PLAN §11.5 **`N-b`** decides the §5.4 two-tier approval search is "**non-exported, and no test may name it**", and that `RLH-24`'s `approvalSearch.test.js` "drives it through `main()` at **L2**". §4.2 places `PROP-RESOLVE-01` under "**L1** — beyond the floor" and states it as a call on "approval-anchor resolution" over a generated corpus; §2.1 defines L1 as "*no seam, no filesystem*". The property is therefore either unwritable as specified or mis-levelled — and §7.3's "Eleven L1, six L2" pyramid is computed from that column. `N-b` is not cited anywhere in the document. Rule: this must be stated at L2 through the seams, and §7.1/§7.3 re-counted | PLAN §11.5 `N-b`, §4 RLH-24; PROPERTIES §2.1, §4.2, §7.1, §7.3 |
| F-05 | Medium | Local | **`PROP-SCAN-01` asserts a return value `scanLines` does not have.** TSPEC §3.7: `scanLines(text, visit)` — "*`visit(line, index)` is called only for lines **OUTSIDE** a fenced code region. **Returns undefined.***" §4.1 asserts "*`scanLines(d)` **returns** for each line exactly one classification*" and hangs the conservation identity `sum(\|class_i\|) === d.split("\n").length` on that return. The invariant is right in spirit and is unimplementable as stated: state it over the visitor's observed index set versus the input line count (visited ∪ fence-suppressed = every line, disjointly), which is also the only form that catches the silent-drop mutation §5.2's second row names | TSPEC §3.7, §5.0, §8.2 |
| F-06 | Medium | Local | **§4's generator selections contradict §3.2's owning table, systematically.** §3.2 assigns **D1 = review basenames** (`roundDerivation.test.js`, RLH-11) and **D2 = fenced markdown** (`scanLines.test.js`, RLH-03). §4 then uses **D1** for `PROP-SCAN-01` and `PROP-TRAILER-01` (both line/fence domains) and **D2** for `PROP-NAME-01`, `PROP-ROUND-01` and `PROP-APPROVE-01` (all filename domains) — the two are swapped throughout — and `PROP-RESOLVE-01` (`D4 × D2`) and `PROP-APPROVE-01` (`D2 × D4`) cite **D4 = heading sets** for a corpus of per-role review records. This is not a citation: §3.2 is the table that tells the implementer *what to draw*, so an implementer following `PROP-SCAN-01`'s "Generator. D1" builds review basenames for a fence scanner. Same class as the batch numbers `136b559` fixed — a figure verified rather than re-derived | PROPERTIES §3.2, §4.1–§4.3 |
| F-07 | Medium | Process | **`PROP-TRAILER-01`'s permitted-red window is over-wide by the document's own §1.3 derivation rule, and contradicts `PROP-HASH-01`.** §1.3 derives each new property's window "*from the batch of its **greening task***". `PROP-TRAILER-01`'s subjects — `parseApprovalHash`, `parseRevisionComplete`, `parseResolvedMarker` — are pure exported parsers greened by **`RLH-05(f)` in batch 3** (PLAN §4). §4.2 instead claims "*greened by `RLH-23`*" and derives **green from batch 7, permitted red batches 3–6**, which is the window of the *file* it happens to live in (`pacingWrapper.test.js`). That is per-**file** granularity — the granularity PLAN §4 says "fails open" and §7.3 exists to replace — and it licenses a pure-parser invariant to stay red for four batches after its subject is green. It also disagrees with `PROP-HASH-01`, which derives batch 3 for the *same* `parseApprovalHash`. Either re-derive to batch 3, or state why the file's window binds and accept the gate loss explicitly | PROPERTIES §1.3, §4.2, §7.1; PLAN §4 RLH-05/RLH-21/RLH-23, §7.3 |
| F-08 | Medium | Local | **The phase axis is six where the invariant's space is seven, and the omitted phase is exactly the shape the property exists to catch.** §4.3's use of D6 fixes "*phase ∈ the **six** forceable phases*". PLAN §4.1 measured seven `reviewLoop` and seven `checkConverged` call sites — **`R, F, T, D, P, PR, CR`** — and TSPEC §4.5's `EpisodeKey.phaseId` enumerates eight (`… "CR" \| "DOD"`). `PROP-LIST-01a`'s entire stated value over the ATs is the phase × failure **product** catching "correct at Phase R, swallowed at Phase D" (H-2, §5.3 row 2); with `CR` outside the domain, a disposition wrong only at `CR` passes the property. `PROP-GINV-01` and `PROP-WINDOW-01` inherit the same restriction, and §3.2's D6 definition carries no phase axis at all. `forcePhases` bounds what an *operator can force*, not where the gate runs | PLAN §4.1; TSPEC §4.5, §4.2, §6.2 rows 2/17 |
| F-09 | Medium | Process | **§2.3's shrink-disposition table is over-broad and disagrees with §4 and §8.2 — two statements of one rule, in conflict.** §2.3 declares the disposition is "*one of exactly two*" and lists "reuse a shipped kind" as applying to "*`PROP-DIGEST-01`, `PROP-DIGEST-02`, `PROP-SCAN-01`*". §4.1 gives `PROP-SCAN-01` a **file-local ladder** and says outright "*the shipped `shrink` returns `[]` for this case shape*"; `PROP-HASH-01` and `PROP-STALE-01` are **hybrids** (shipped kind for the prose/document, ladder for the trailer/anchor tag) — a third disposition §2.3 forbids; and §8.2's table gives a *fourth* membership (`DIGEST-01/-02`, `HASH-01`, `STALE-01`). §2.3 also over-claims what the shipped arm buys: measured, `shrink({kind:"bytes"})` returns **at most one** rung and **only above 64 bytes**, so for `PROP-DIGEST-01`'s `n ∈ 0…512` domain most cases shrink to nothing and the one rung is a 64-byte prefix that will usually discard the injected `\r` or trailing newline that falsified the case. Per R-5 the fix is deletion: drop §2.3's "Applies to" lists, let each property's `Shrink.` line own its disposition, and state the 64-byte/one-rung limit once | PROPERTIES §2.3, §4.1, §4.2, §8.2; `driftGenerators.js:443–474` |
| F-10 | Medium | Cross-Feature | **Two of `PROP-DIGEST-02`'s three conjuncts have no named falsifier, and neither is filed as a Residual.** §5.1 binds every property to "*a named mutation … **and with the conjunct that dies***". §5.2's first `PROP-DIGEST-02` row states in its own "conjunct that dies" cell that "*the shape conjunct **survives** … and the property's determinism half **stays green***" — i.e. it falsifies the known-answer **vectors**, not the property. The second row falsifies conjunct (iii) only. So conjunct (i) (totality of the 64-hex shape, never throws) and conjunct (ii) (determinism) are unfalsified. DC-03 requires an assertion with no nameable mutation to be filed as a **Residual with its reason**, counted toward nothing; §8.4 does not carry them. A nameable mutation exists (make `utf8Bytes` throw on a lone surrogate), so this is an omission rather than an impossibility — which makes filing it cheaper than defending it | DC-03; PROPERTIES §5.1, §5.2, §8.4 |
| F-11 | Medium | Local | **`PROP-ROUND-01`'s width identity is asserted "over all inputs" but is false on one approved branch.** TSPEC §5.2 step 5: two files claiming round 1 for one role ⇒ `{ ok: false, reason: "malformed_round_one_duplicate", role }` — no `startIndex`, no `endIndex`, a halt. §4.1 asserts `endIndex === startIndex + MAX_REVIEW_ROUNDS - 1` "*over all inputs including the empty set*", and its generator (D-domain "*as `PROP-NAME-01`*", whose valid domain explicitly "*includ[es] the unversioned form … because TSPEC §3.9 makes version optional*") will draw a role carrying both the unversioned form and `-v1`. TSPEC §8.2 states the generator constraint — "*listing does not trip the round-1 duplicate halt*" — and this document drops it; the string `malformed_round_one_duplicate` appears nowhere here (measured). Bound the universal to the `ok:true` branch and state the generator constraint, or carry the halt as a fourth outcome | TSPEC §5.2 step 5, §8.2, §6.2 row 3 |
| F-12 | Low | Local | `PROP-HASH-01`'s greening sub-group is given as **`RLH-05(d)`** (the digest family). `parseApprovalHash` is in **`RLH-05(f)`**, the five record parsers (PLAN §4 RLH-05). Same task, same batch 3, so the ledger row and window are unaffected — but §1.3's derivation is stated as mechanical, and the sub-group letter is the input to it | PLAN §4 RLH-05 |
| F-13 | Low | Local | `PROP-NAME-01` asserts a round-trip through "*`format` being the composition the production code itself uses, not a second implementation in the test*". TSPEC §3.7 exports no filename formatter; §5.2 supplies only `CROSS_REVIEW_RE` and a prompt-side template string. The "no second implementation" rule — §5.1's first oracle rule, which this property is the worked example of — has no production surface to bind to. Name it, or state that the composer is written in the test and that the rejection direction carries the property's weight. Relatedly the parse field is **`round`**, not `version`, and failure is `{ok:false, reason: FilenameFailure}` over a closed catalogue, not a single "not a review file" outcome | TSPEC §3.7, §5.2, §4.1 |

---

## Explicit rulings on the four items reported upward

### R-1 — TSPEC §8.1 / §8.2 property-count inconsistency: **report, do not amend.** Correct disposition.

The inconsistency is **real and correctly measured**. TSPEC §8.1's L1 row is `every parser, sha256Hex,
scanLines, isStale, isComplete, deriveRoundWindow, parseForcePhases, updateQueueStatus` under a
universal ("*Every parameterisable component in the L1 row carries at least one property*"); §8.2's
table carries seven rows; the six-component difference §8.1 of this document names is exactly right.

Reporting is the right disposition, for three reasons and one condition:

1. **The universal is discharged in substance by this document, not left open.** Four of six are
   closed (`PROP-HASH-01`, `PROP-TRAILER-01` covering both trailer recognisers, `PROP-STALE-01`);
   §8.3 accounts for the other two with reasons a reader can check — `updateQueueStatus`'s interesting
   invariant is transactional and PLAN §7.4 already splits its assertions `-module`/`-orch`;
   `extractRecommendation` has no invariant beyond an assertion. Nothing is silently absorbed.
2. **DC-09's stopping rule routes exactly this class downstream.** A finding of the form "this
   component has no oracle" is closable by the receiving phase writing one — which is what happened.
3. **An amendment would reopen an approved v1.7 for a change with no executable consequence.** The
   implementer's gate is PLAN §7.3 and this document's §7.1/§8.3, not §8.1's prose sentence. R-5
   applies: the cheapest correct edit to §8.1 would be to *narrow* the universal, and buying that
   costs a TSPEC round to delete a clause the properties have already made true.

**Condition:** the report must reach the TSPEC's owner on a surface that survives Phase H. §8.1 of
this document does survive (Phase H deletes only `CROSS-REVIEW-*` and `CODE_REVIEW-*`), so the
condition is met as written. No change required.

### R-2 — the `shrink` gap: **the measurement is correct; the workaround is sound in principle and over-claimed in §2.3.**

The claim is **verified byte for byte** against `pdlc/workflows/__tests__/helpers/driftGenerators.js`
(`shrink` at `:443`, `switch (caseValue.kind)` over `manifest` / `bytes` / `id` / `subRecipe`,
`default: return []`). TSPEC §8.2's "*`shrink` is used for the failure report*" is, taken literally,
unimplementable for this feature's case shapes. Not reopening the TSPEC for it is correct — the
sentence states an intent the file-local ladders honour.

**The file-local ladder disposition is sound, not a fiction.** PLAN §7.2 forbids re-implementing
`int` / `pick` / `shuffle` / `bytes` / `resolveSeed` / `shrink` **as a shared module** and declares
domain generators file-local by design; a per-file ordered ladder over a domain the shared `shrink`
returns `[]` for is the same decision on the same domain. Extending `shrink` with five kinds would
touch a helper seven suites depend on and is correctly rejected.

**What is a fiction is §2.3's account of the *other* arm.** Measured: the `"bytes"` case returns a
single candidate and only when `bytes.length > BYTES_FLOOR` (64). §2.3 describes it as a "ladder"
to "walk", and assigns it to three named properties. For `PROP-DIGEST-01`'s stated domain
(`n ∈ 0…512`) a large share of cases yield **zero** rungs, and the one rung available is a 64-byte
prefix that will frequently drop the injected `\r` or trailing newline that made the case fail. The
disposition is not wrong — it degrades to reporting the original case — but the document should say
so rather than imply a shrink path that mostly is not there. Together with the membership conflict
between §2.3, §4 and §8.2, this is **F-09**, and the fix is deletion, not reconciliation.

### R-3 — does §7.1 re-derive against the PLAN? **Yes. All eighteen rows.**

Re-derived independently from PLAN §4 (batch table), §5.3 (test-file ownership) and §7.3 (the
ledger), not read off §7.1:

- **Writing task → file → batch**: `RLH-06`/`approvalHash`/2, `RLH-03`/`scanLines`/2,
  `RLH-11`/`roundDerivation`/2, `RLH-14`/`forcePhases`/2, `RLH-31`/`runtimeBundle`/2,
  `RLH-21`/`pacingWrapper`/3, `RLH-22`/`reviewLoop`/3, `RLH-24`/`approvalSearch`/3,
  `RLH-25`/`haltAndQueue`/3, `RLH-12`/`completeness`/4 — **all correct**, all eighteen ids.
- **Row / Green from / Permitted red**: every triple matches the §7.3 row it names — digest row 3/2;
  `RLH-AT-15,-16,-18` 8/2–7; scanLines 3/2; round-derivation 3/2; force-phases 3/2; `isComplete`
  6/4–5; pacing 7/3–6; approval-search 8/3–7; halt-and-queue 9/3–8; `RLH-LOOP-01`/`-02` 9/3–8; first
  row batch 2 on arrival, none ever. **No discrepancy.**
- **"Every one of the ten rides an existing row" — verified.** Each of the ten new properties shares a
  file and a §7.3 row with an assertion the ledger already carries, so no new row is proposed and the
  approved PLAN stays closed. Adoption is genuinely a name added to an existing `Assertion(s)` cell.

The class of error `136b559` fixed has **not** recurred in §7.1's columns. The two residual
derivation defects are elsewhere: `PROP-TRAILER-01`'s greening task in §4.2 (**F-07**) and
`PROP-HASH-01`'s `RLH-05` sub-group letter (**F-12**).

### R-4 — `EpisodeKey` has no canonical serialisation: **the weaker property is adequate, and §8.5 understates it.**

TSPEC §4.5 states the pacing rule **as** independence — "*Per-episode counters, both reset when **any**
coordinate changes*" — so `PROP-EPISODE-01`(ii) is not a weakened proxy for the rule; it *is* the
rule. And `invocation` is monotonic within `(artifactSet, phase, round, mode)`, so two *distinct*
episodes with all five coordinates equal cannot arise: the "equal keys share a budget" direction §8.5
wishes it could assert is vacuous, not stronger.

The 36-dispatch bound is protected by conjunct **(i)**, which asserts
`(1 + MAX_REVIEW_ROUNDS) × MAX_AUTHORING_DISPATCHES` against the constants rather than the literal
(`MAX_REVIEW_ROUNDS = 5`, `MAX_AUTHORING_DISPATCHES = 6`, TSPEC §4.8) — the correct construction, and
the anti-oracle in §5.3 row `PROP-EPISODE-01 (2nd)` is a legitimate and welcome entry: it records the
mistake that would make the assertion red on a lawful constant change. §5.4's two
specification-falsifying rows (`PROP-COMPLETE-01 (2nd)`, `PROP-GINV-01 (3rd)`) are likewise
legitimate — both red genuinely, because the non-vacuity floors are derived from the catalogue by set
equality, which is the mechanism that stops a property decaying into a tautology. **No finding on any
of the three.**

### R-5 — declined and deferred items: **DC-08 satisfied; both routings verified.**

- **`extractRecommendation` declined outright — correct.** It extracts a free-text field; there is no
  invariant over generated prose beyond "returns a string or nothing", and §5.1's own rule makes an
  unfalsifiable property worse than none. Declining with a reason is the right call, and the decline
  is recorded where §8.1's accounting can be checked against it.
- **`MAX_AUTHORING_WRITE_BYTES` and SKILL ↔ fixture drift → queue row Order 9 — verified genuine.**
  `docs/_queue/QUEUE.md` carries `| 9 | blocked | pdlc-authoring-contract | … | pdlc-review-loop-hardening |`,
  and the row's own body names both items explicitly: **Q-09** ("*templates authors actually follow
  live in the SKILLs … row 0 mitigates but does not close it: its `completeness.test.js` fixtures are
  copied from the SKILL templates verbatim*") and **T-Q-03** ("*`MAX_AUTHORING_WRITE_BYTES` has no
  oracle*"). Named surface, correct dependency direction, accurate description. **DC-08 met.**
- **Per-worktree consumer state → D-DIST-07 / row 6** — row 6 exists, `blocked`, and is the recorded
  binding for the D-DIST deferrals. Fine, and correctly marked as not this feature's surface.

---

## Does this document serve the REQ, and are these the right invariants?

**Largely yes, on the parts that survive the findings — and that is worth saying plainly.** The
feature exists to fix four named defects (H-1 the round-window derivation, H-2 the ungated terminal
exit, H-4 unanimity without anchors, and the per-episode refresh S-INV). Each has a property that
states it as a quantifier rather than a sample, and each states it in the framing under which the
defect was *invisible to the pre-fix suite*:

- **H-2 → `PROP-GINV-01`** is stated over **paths, not steps**, which is exactly the reason the
  enumerating AT passed while the defect was live. That is a property protecting what the feature is
  for, not a thing that happens to be true.
- **H-1 → `PROP-ROUND-01`(derivation) + `PROP-WINDOW-01`(computed once)** is the right decomposition:
  the arithmetic being right and nobody redoing it with stale inputs are different failures, and the
  ≥15-non-1-`startIndex` floor is what makes the second one falsifiable at all.
- **H-4 → `PROP-RESOLVE-01`** enumerates all sixteen presence vectors exhaustively where the ATs
  sample three. The exhaustive-beats-sampled rule in §2.5 is applied where it is affordable and only
  there.
- **S-INV → `PROP-LIST-01b`** asserts a call-count **equality**, not a floor — the only form that
  catches a hoisted refresh.

The negative-with-three-positives rule in §5.1 and the set-equality non-vacuity floors in §3.3 are the
two constructions that most directly answer DC-03's "*non-vacuity is the dominant defect class in this
codebase*", and they are applied uniformly. `PROP-AWAIT-01` being green-on-arrival with no permitted
red, ever, is the right disposition for a self-test.

**Where the document does not yet serve the REQ is the floor.** Four of the seven TSPEC-named floor
properties are stated against signatures the TSPEC does not have (`isComplete` — F-01; `scanLines` —
F-05; `isStale` — F-03) or against a partition the TSPEC and PLAN both own and this document restates
wrongly (`deriveRoundWindow` — F-02). Counted, the floor is met; **in substance it is met for three of
seven**, and F-01 in particular would ship a property that exercises nothing. That is the review's
central conclusion: the seventeen-property superstructure is well-built and the seven load-bearing
columns under it need re-seating against TSPEC §3.7's contract block, line by line.

Nothing here is scope creep: every one of the ten beyond the floor is derived from a gap this document
measured (§8.1's six, four TSPEC predicates discharged by enumeration, two single-point PLAN
assertions), and no property proposes work outside the feature.

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | §2.5 records `Time: 179.795 s` and sets the 100-case-per-property budget on that premise. Re-measured today at the same HEAD under concurrent load: **331.163 s** (same counts, same single red). PLAN §4.1's advisory row carries a halt at **300 s**. Is the 100-case budget still the right figure if the pre-flight gate is going to be measured on a loaded machine — and should §2.5 say that its figure is an unloaded measurement? |
| Q-02 | §8.4 residual 3 says "*Six of the seventeen properties depend on seam doubles behaving synchronously*". §7.1's `Level` column shows **six L2** — but `PROP-RESOLVE-01` (F-04) is arguably a seventh. Once F-04 is resolved, does residual 3's count and §7.3's pyramid ("Eleven L1, six L2, one L3") need re-deriving? |
| Q-03 | `PROP-TRAILER-01` covers `parseRevisionComplete` and `parseResolvedMarker` "jointly through the mutual-exclusion conjunct" (§8.1). Mutual exclusion is a cross-recogniser claim; does either recogniser get a property over **its own** input space, or does §8.1's universal remain open for those two in substance even though the count closes? |

---

## Positive Observations

- **The namespace audit is exemplary and reproduces exactly.** 431 matches, 28 files, the live
  `describe("PROP-GATE-01: …")` at `pipelineWiring.test.js:235`, and all sixteen chosen domains
  returning zero — every figure verified independently here. The `PROP-GATE-01` → `PROP-GINV-01`
  rename is the right call, and §8.4 residual 1 correctly records that the verification is
  point-in-time rather than pretending it is durable.
- **§7.1 re-derives cleanly against an approved PLAN** — all eighteen rows, after a first pass that
  got nearly all of them wrong. The correction discipline in `136b559` worked.
- **"Every one of the ten rides an existing row" is true**, which is the finding that keeps the PLAN
  closed. Deriving each new property's window from its greening task and then *measuring* that no new
  row is needed — rather than asserting it — is the right order of operations.
- **§5.4 is the best section in the document.** Naming the two specification-falsifying rows and the
  one anti-oracle, and explaining why each is deliberate, converts three things that would read as
  defects into three things a reviewer can rule on. More documents should carry that section.
- **The C-2 notes are load-bearing and correct**: refusing to oracle `sha256Hex` against Node's
  `crypto` (§2.4, §4.1, §6.2) because the property would then stay green on a subject that breached
  C-2 is a genuinely subtle trap, correctly identified and correctly closed by pasting literal
  vectors "so there is nothing to simplify".
- **DC-08 is honoured properly**: every deferral names a queue row that exists, is `blocked`, depends
  the right way round, and whose body already describes the item. That is the DC-08 pattern working as
  intended rather than being cited.

---

## What must change for approval

1. **F-01** — restate `PROP-COMPLETE-01` against `isComplete(artifactClass, docType, fileText)`:
   headings within one document's text, the non-empty-body criterion (`TBD` / HTML comment = empty),
   `{complete, missing[]}` as the return. Fix the dependent text in §5.2, §6.4, §7.2.
2. **F-02** — restate `PROP-ROUND-01`'s partition as TSPEC §8.2 owns it: `entries` / other-doc-type /
   `skipped`. Cite; do not re-word.
3. **F-03** — restate `PROP-STALE-01` over `"UNEVALUABLE" | "STALE" | "FRESH"`, with absent /
   malformed anchors mapping to `UNEVALUABLE` per TSPEC §6.2 rows 6–7.
4. **F-04** — move `PROP-RESOLVE-01` to L2 through the seams per PLAN §11.5 `N-b`, cite `N-b`, and
   re-derive §7.3's pyramid.
5. **F-05** — restate `PROP-SCAN-01` over the visitor's observation set, not a return value.
6. **F-06** — reconcile §4's generator ids to §3.2's table (the D1/D2 swap, and D4 where D1 belongs).
7. **F-07** — re-derive `PROP-TRAILER-01`'s window from its greening task, or justify the file window.
8. **F-08** — widen the phase axis to the seven `reviewLoop` / `checkConverged` call sites.
9. **F-09** — delete §2.3's "Applies to" lists; state the 64-byte / one-rung limit of the shipped arm
   once, in the section that owns shrinking.
10. **F-10** — name a falsifier for `PROP-DIGEST-02`'s totality and determinism conjuncts, or file
    them as DC-03 Residuals with reasons.
11. **F-11** — bound `PROP-ROUND-01`'s width identity to the `ok:true` branch and state the
    round-1-duplicate generator constraint TSPEC §8.2 already gives.

F-12 and F-13 are Low and may be carried, but both are one-line edits.

## Recommendation

**Needs revision**

> Any High or Medium finding → Needs revision (mandatory).

---

VERDICT: Needs revision
{"high": 4, "medium": 7, "low": 2}
