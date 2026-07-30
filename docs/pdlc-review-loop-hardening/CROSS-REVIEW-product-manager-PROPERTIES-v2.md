# Cross-Review: product-manager — PROPERTIES (round 2, delta)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/PROPERTIES-pdlc-review-loop-hardening.md` (v1.1)
**Date:** 2026-07-30
**Iteration:** 2
**Scope:** Delta re-review. Verification of the thirteen findings in `CROSS-REVIEW-product-manager-PROPERTIES-v1.md` (4 High / 7 Medium / 2 Low), plus a new-defect scan of the sections changed between v1.0 (`3790f56`) and v1.1 (`da89ea2..95529be`). Unchanged sections are not re-litigated. Upstream REQ v1.6 / FSPEC v1.8 / TSPEC v1.7 / PLAN v1.4 are approved and are treated as fixed contracts, not as artefacts under review.

---

## Method

| Step | What was done |
|---|---|
| Baseline | `git pull --rebase` on `feat-pdlc-review-loop-hardening`; diffed `3790f56 → 95529be` on the PROPERTIES document |
| Prior findings | Each of F-01…F-13 re-verified **against the tree and the approved specs**, not against §0's changelog claim (DC-02) |
| New-defect scan | Restricted to sections carrying diff hunks: §0, §1.2/§1.3, §2.3, §3.1/§3.2/§3.3, §4.1–§4.4, §5.2/§5.3, §6.1, §7.1/§7.2/§7.3, §8.2/§8.4/§8.5 |
| Suite | `cd pdlc/workflows && npm test` — **1038 passed, 1 failed, 70 skipped** across 36 suites (312.478 s). The single red is the foreign intentional `coveredViolations (§10, §10.1) › AT-22 [red-until-L-06]`. Baseline reproduced exactly |
| Reconciliation | `CROSS-REVIEW-software-engineer-PROPERTIES-v2.md` read for Scope-tag reconciliation on overlapping findings (SE F-20 ↔ PM F-04 below) |

**On document size.** v1.1 grew from 95,831 B to 158,672 B. Per the standing test — a byte count is filed only when §0's changelog has become *load-bearing*, i.e. when some property's only precise statement now lives in a changelog row rather than in its owning section — I checked each of the thirteen §0 rows against the section it points at. Every substantive claim in §0 (`isComplete`'s arity, the three-way `parseReviewFilename` partition, `isStale`'s three-valued return, `PROP-RESOLVE-01`'s L2 placement, the `BYTES_FLOOR = 64` measurement, the five-exit catalogue, the seven-phase axis, the two new `PROP-DIGEST-02` falsifiers, the `ok:false` fourth outcome, the `RLH-05(f)` letter) is also stated, in full, in its owning section. **§0 is inert.** No finding is filed on size.

---

## Verification of prior findings

| Prior | Sev | Disposition | Evidence (verified against the tree / approved specs) |
|---|---|---|---|
| F-01 | High | **Resolved** | §4.1's `PROP-COMPLETE-01` is now stated against `isComplete(artifactClass, docType, fileText) → {complete:true} \| {complete:false, missing:string[]}` — TSPEC §3.7's signature verbatim. Headings are scored **within one document's text**; `missing` is asserted set-equal to `R \ S` where `S` is the headings with non-empty bodies; both directions of the body criterion are generated, with fenced-`TBD` **non-empty** per TSPEC §5.9's accepted shallowness. v1.0's present-set formulation is recorded as withdrawn, and the dependents (§5.2, §6.4, §7.2) were rewritten to match. The property now exercises the real subject |
| F-02 | High | **Resolved** | §4.1's partition is re-stated over `parseReviewFilename`'s actual three-way split — `entries` / **other-doc-type** / `skipped` — matching TSPEC §8.2's own property row. The conservation sum is now over that partition, so it is true on a correct implementation. A ≥20 other-doc-type floor forces the class v1.0 had no home for, and §5.2 gains `PROP-ROUND-01` (3rd), whose named mutation is exactly "route a well-formed other-doc-type name into `skipped`" |
| F-03 | High | **Resolved** | §4.2's `PROP-STALE-01` is stated over `"UNEVALUABLE" \| "STALE" \| "FRESH"`: the `/^sha256:[0-9a-f]{64}$/` guard as an `iff`, digest equality past the guard, and `"UNEVALUABLE"` never returned past it. Four `UNEVALUABLE` anchor shapes carry ≥5 cases each. v1.0's "absent/malformed anchor is stale" is withdrawn, and the ledger row that was unimplementable against `isStale`'s two-argument arity is replaced by two writable rows. (One residue of the fix is filed new as F-03 below — the *routing* of the classes that do not reach `isStale`) |
| F-04 | High | **Resolved** | `PROP-RESOLVE-01` is relabelled **L2** and re-sited into `approvalSearch.test.js` driven through `main()`, with the corpus presented via `__tests__/helpers/seams.js` doubles and the verdict read from the recorded call log. Nothing in the property names the search function, which is precisely what PLAN §11.5's `N-b` ("non-exported, and no test may name it") protects. §7.3's pyramid is re-derived to **ten L1 / seven L2 / one L3**, measured against §7.1's `Level` column. **The sixteen-vector enumeration survives the move intact** — see the dedicated check below |
| F-05 | Medium | **Resolved** | `PROP-SCAN-01` no longer hangs a conservation identity on a return value. It is stated over the **visitor's observed index set** versus the input line count — visited ∪ fence-suppressed covers every line, disjointly — which is implementable against TSPEC §3.7's `scanLines(text, visit)` ("Returns undefined") and is the form that kills the silent-drop mutation §5.2 names |
| F-06 | Medium | **Resolved** | Generator ids re-derived from §3.2's owning table throughout §4: `PROP-SCAN-01`, `PROP-TRAILER-01` → **D2**; `PROP-NAME-01`, `PROP-ROUND-01` → **D1**; `PROP-RESOLVE-01`, `PROP-APPROVE-01` → **D1 × D6** (v1.0 cited `D4 × D2` / `D2 × D4`, the heading-set and fenced-markdown domains). Each corrected site names the v1.0 error rather than silently overwriting it |
| F-07 | Medium | **Resolved (window)** | The window is **re-derived, not accepted**: `PROP-TRAILER-01`'s greening task is `RLH-05(f)` — the five record parsers, PLAN §4 batch 3 — not RLH-23, so the correct window is **green from batch 3, permitted red none**. I re-derived this independently: RLH-21 (writer) and RLH-05(f) (greener) both land in batch 3, and written-and-greened-in-the-same-batch yields an empty permitted-red window. §4.2 states the gate loss the pacing row would otherwise have licensed. The *bookkeeping* consequence — §7.1 now says "own row" while §1.3 says no new row is needed — is filed new as F-04 below |
| F-08 | Medium | **Resolved** | D6's phase axis is now **seven** — `R, F, T, D, P, PR, CR` — sourced to PLAN §4.1's measured call sites, which I confirmed against the tree: `orchestrate-dev.js` has exactly seven `await reviewLoop({` sites (1649, 1675, 1701, 1742, 1771, 1797, 1913). `DOD` is excluded with a stated reason (no `reviewLoop` call site), and §6.5's catalogue bullet now distinguishes the gate axis from `parseForcePhases`'s six forceable phases. `PROP-LIST-01a`, `PROP-GINV-01` and `PROP-WINDOW-01` inherit the corrected axis |
| F-09 | Medium | **Resolved in the owning section** | §2.3's "Applies to" lists are gone; the shipped `"bytes"` rung's limits are stated once, in §2.3, and each property's `Shrink.` line owns its own disposition. Measured against the tree: `driftGenerators.js:423` `const BYTES_FLOOR = 64;`, and the `"bytes"` arm returns `[]` at or below the floor and a single `slice(0, BYTES_FLOOR)` rung above it. Declining to extend `shrink` stands per PLAN §7.2. **Two restatements over-shot the fix** and are filed new as F-01 below |
| F-10 | Medium | **Resolved** | Two named subject mutations added, so no Residual is filed where one exists (DC-03): §5.2 `PROP-DIGEST-02` (3rd) — make `utf8Bytes` throw on a lone surrogate, killing totality, conjunct (i); (4th) — memoise the digest keyed on pre-canonical text, killing determinism, conjunct (ii), while the known-answer vectors survive. Both are real mutations of a real production surface |
| F-11 | Medium | **Resolved** | The width conjuncts are now bounded to the `ok: true` branch, and TSPEC §5.2 step 5's `{ok:false, reason:"malformed_round_one_duplicate", role}` is stated as a **fourth outcome**, deliberately generated with a ≥10-case floor. The identity is no longer asserted over inputs on which the approved contract returns no window |
| F-12 | Low | **Resolved** | `PROP-HASH-01`'s greening sub-group corrected to **RLH-05(f)**; PLAN §4's RLH-05(f) is the five record parsers and `parseApprovalHash` is one of them. Both sub-groups are batch 3, so the window is unaffected — which §4.2 says explicitly rather than leaving the reader to check |
| F-13 | Low | **Resolved** | `PROP-NAME-01`'s round-trip no longer claims a production `format` composer that TSPEC §3.7 does not export. The composer is stated as written in the test, with the property's weight carried by the **rejection** direction over the closed `FILENAME_FAILURES` catalogue, and the parsed field named as `round` |

**Thirteen of thirteen resolved.** No prior finding is carried forward as open.

---

## Re-judgement: is the seven-property floor met *in substance*?

Round 1's central charge was that the seven TSPEC-named floor properties met the count but not the substance — four of the seven were stated against signatures the TSPEC does not have, so a conforming implementation would not have been exercised by four of them. Re-judged against v1.1 and the approved TSPEC §3.7 / §5.9 / §8.2:

| Floor property | Round 1 | Round 2 (verified) |
|---|---|---|
| `PROP-COMPLETE-01` | ✗ wrong arity, domain and return type | ✓ stated against `isComplete(artifactClass, docType, fileText)` and its two-shape return |
| `PROP-ROUND-01` | ✗ conservation false on a correct implementation | ✓ stated over `parseReviewFilename`'s real three-way partition; fourth `ok:false` outcome generated |
| `PROP-STALE-01` | ✗ three-valued return collapsed to a boolean | ✓ stated over `"UNEVALUABLE" \| "STALE" \| "FRESH"` with the shape guard as an `iff` |
| `PROP-SCAN-01` | ✗ asserted a return value `scanLines` does not have | ✓ stated over the visitor's observed index set |
| `PROP-DIGEST-01` / `-02` | ✓ | ✓ unchanged, plus two new named falsifiers |
| `PROP-NAME-01` | ✓ (Low on the round-trip) | ✓ round-trip re-sited into the test; rejection direction load-bearing |

**Seven of seven. The floor is now met in substance, not merely by counting.** Every floor property is stated against a signature the approved TSPEC exports, over a domain that signature accepts, with a non-vacuity floor that a conforming implementation can satisfy. This was the round's principal question and it is answered affirmatively.

`PROP-RESOLVE-01` at L2 also **keeps its sixteen-vector enumeration**: §4.3 states "the 4-fact presence vector is enumerated exhaustively (16 combinations)", each dressed with random file ordering and extra non-review files (100 cases ≥ 16 × ≥6 dressings), and the non-vacuity floor is "all 16 presence combinations must appear (**set equality** against the enumeration, not a count)" — a forced set-equality, not a sampled coverage claim. The move changed the seam and the ledger row, not the enumeration.

---

## New findings (changed sections only)

| ID | Severity | Scope | Finding | Ref |
|----|----------|-------|---------|-----|
| F-01 | **Medium** | Local | **The F-09 fix over-shot: two restatements now contradict the section that owns the rule.** §2.3 — the owning section — says the shipped `"bytes"` rung is "**useful above 64 bytes only**" for `PROP-DIGEST-01`/`-02`, because "the domain is `n ∈ 0…512`, so roughly an eighth of every corpus has no shrink step at all". §3.1's `Used by` cell and §8.2's ladder row instead say the rung is "a **no-op on every case they generate**, since `BYTES_FLOOR = 64` and **their strings are shorter**" — naming all four properties including the DIGEST pair. Measured: the DIGEST domain is `n ∈ 0…512`, so ~7/8 of its corpus is *above* the floor and does get a truncation rung. This re-creates the exact "one rule, three conflicting statements" shape F-09 was filed for, inside F-09's own fix. Per R-5 the fix is deletion, not reconciliation: restrict the "guaranteed no-op" claim in §3.1 and §8.2 to `PROP-HASH-01` / `PROP-STALE-01`, and let §2.3 own the DIGEST disposition | PROPERTIES §2.3, §3.1, §8.2; `driftGenerators.js:423` |
| F-02 | **Medium** | Local | **`PROP-HASH-01` asserts a duplicate-trailer disposition the approved TSPEC contradicts, and delegates the question to a section that does not own it.** §4.2's invariant states "a document containing **two trailers resolves deterministically to the same one** on every run (whichever the format specifies — the property asserts *stability*, and §6.4 owns which)", with a **forced ≥5 double-trailer** floor. TSPEC §4.1 declares `HASH_FAILURES = ["absent", "duplicated", "unparseable"]` and §6.2 row 6 maps a **duplicated** `APPROVAL-HASH:` to `{ok:false}` → `UNEVALUABLE`. A conforming `parseApprovalHash` therefore resolves to **no** trailer, so both the leading `iff` and the "same one" conjunct are false on correct code, and the forced floor reds it. The document says so itself twelve hundred lines later: §4.2's `PROP-STALE-01` paragraph states that duplication "is resolved before the call, **by `parseApprovalHash`**" as an `UNEVALUABLE` class. The delegation is also empty — §6.4 is *Heading fixtures — `__tests__/fixtures/completeness/`* and owns nothing about approval trailers. Per R-5: delete the "resolves to the same one" conjunct and the ≥5 double-trailer floor's current expectation, and state the duplicate case as what the contract says it is — a `duplicated` `HashFailure`. (Not raised in round 1; the enclosing property section was rewritten in v1.1 for F-05 and F-12, which is what brought it into scope) | TSPEC §4.1, §4.3, §6.2 row 6; PROPERTIES §4.2, §6.4 |
| F-03 | **Medium** | Local | **The F-03 fix routes three `UNEVALUABLE` classes to an oracle that does not assert them.** §4.2's `PROP-STALE-01` correctly narrows itself to the *unparseable* class, then states that **absent**, **duplicated** and **unreadable** (TSPEC §6.2 rows 6–7) "are covered at the seam by `PROP-APPROVE-01` (§4.3) and are listed here so the division is explicit rather than an apparent gap." `PROP-APPROVE-01` carries no such coverage: its three conjuncts are tier discipline, window respect and idempotence; its generator composes basenames × presence vector × tier placement with anchors that are *matching / stale / absent-verdict*, never an absent, duplicated or unreadable **approval-hash anchor**; and its non-vacuity floors are the four tier placements, ≥15 out-of-window and ≥15 unanimous-but-stale. Nothing generates the three classes and nothing asserts their disposition. A claimed division of labour where one side is empty is worse than an admitted gap, because it closes the residual ledger against it. Per R-5: delete the routing sentence and record the three classes in §8.4/§8.5 as a residual with a named successor surface (DC-08), **or** add the conjunct and floor to `PROP-APPROVE-01` that the sentence promises | TSPEC §6.2 rows 6–7; PROPERTIES §4.2, §4.3, §8.4, §8.5 |
| F-04 | Low | Local | **§1.3's "the approved PLAN stays closed" is now over-broad, given §7.1's own cell.** §1.3 concedes that `PROP-TRAILER-01` is "the one place the mechanical derivation produces a window §7.3 does not already carry", then asserts "**One narrowed window is not a new ledger row**" and "**The approved PLAN stays closed:** a property that would need a genuinely new row is a defect in the property, and none here does." §7.1's `Row` cell for the same property reads "**own row** — greened by RLH-05(f)". Verified against PLAN §7.3: no existing row carries green-from-batch-3 with permitted-red none, so the entry is genuinely new — reasonably characterised as a mechanical PLAN edit owned by RLH-21, but not as "no new row". The substance is disclosed in both places; only the summary sentence over-reaches. Per R-5, delete the final clause rather than adding a reconciling one. **Reconciled with `CROSS-REVIEW-software-engineer-PROPERTIES-v2.md` F-20 (Low / Local), which raises the same inconsistency** | PROPERTIES §1.3, §7.1; PLAN §7.3 |

### Candidates examined and *not* filed

- **Cross-file domain-generator citations.** Defused by §3.2's statement that each domain is built **inside** the test file that consumes it; no cross-file import is proposed.
- **`PROP-LIST-01a`'s "four gated exits".** Sourced — TSPEC AT-13a enumerates four by grouping `STALE`/`UNEVALUABLE`; §4.3's five-exit catalogue is separately and correctly sourced to TSPEC §2.5.
- **`PROP-TRAILER-01`'s catalogue-closure conjunct over three recognisers.** `HASH_FAILURES` ⊂ `TRAILER_FAILURES` by value (TSPEC §4.1), so the subset conjunct holds.
- **`PROP-EPISODE-01` (ii)'s "keyed by the full `EpisodeKey`".** Loose in isolation, but §4.3 is the owning section and the very next paragraph states the four-coordinate identity and `invocation`'s separate, differently shaped conjunct at length. An owning section beats a restatement; no finding.
- **Wall-clock divergence (312 s measured vs the document's 179.795 s).** §2.5's v1.1 text already states the measurement is machine- and load-dependent, which is the fix; not a finding.
- **Citation and `file:line` drift.** Not filed at any severity (R-6).

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-03: is the intent that `PROP-APPROVE-01` *acquire* the absent/duplicated/unreadable conjunct, or that the three classes be filed as a residual against the queue-row successor? The two fixes have different implementation cost and the choice belongs to whoever owns RLH-24's scope, not to the reviewer. |
| Q-02 | For F-02: once the duplicate case is restated as `duplicated`, does the ≥5 floor survive as a floor on the *rejection* shape, or does it fold into the existing hex-shape totality conjunct? Either is acceptable; stating which keeps §5.2's ledger honest. |

---

## Positive Observations

- The four Highs are not patched — they are re-derived. Each corrected site names the v1.0 error explicitly ("v1.0 wrote…", "that presentation is withdrawn") rather than silently overwriting it, which makes this round's verification cheap and makes the next reviewer's job cheaper still.
- `PROP-RESOLVE-01`'s move to L2 is the model response to a level finding: the seam changed, the ledger row was re-derived, and the property's discriminating content — the exhaustive sixteen-vector enumeration with set-equality non-vacuity — is untouched. The document even notes that PLAN already assigned RLH-24 an L2 file, so the *level label* was the thing out of step, which is the correct diagnosis rather than the convenient one.
- `PROP-TRAILER-01`'s window was re-derived to something **tighter** than the row it could have ridden, with the gate loss the looser row would have licensed stated explicitly. Choosing the narrower window when the co-location argument was available is exactly the discipline this feature exists to install.
- §0 is a genuine changelog, not a shadow specification. Every claim in it is stated in full in its owning section. That is the discipline that keeps a 159 KB document reviewable.
- The five-exit catalogue for `G-INV` now has one owner (TSPEC §2.5), one count, and — crucially — is asserted as **set equality** against a catalogue derived from that sentence, so "any exit added later" becomes a failing test on the day it is added. That is a better answer than the count the finding asked for.

---

## What must change for approval

1. **F-01** — restrict the "guaranteed no-op" claim in §3.1's `Used by` cell and §8.2's ladder row to `PROP-HASH-01` / `PROP-STALE-01`; leave §2.3 as the single owner of the DIGEST disposition.
2. **F-02** — delete `PROP-HASH-01`'s "resolves deterministically to the same one" conjunct and the empty `§6.4 owns which` delegation; restate the double-trailer case as TSPEC §4.1/§6.2's `duplicated` `HashFailure`, and adjust the ≥5 floor to match.
3. **F-03** — either delete §4.2's routing sentence and file absent / duplicated / unreadable as a residual with a named successor surface, or give `PROP-APPROVE-01` the conjunct and floor the sentence promises.
4. **F-04** (Low, may ship) — delete §1.3's "a property that would need a genuinely new row is a defect in the property, and none here does", which §7.1's own "own row" cell contradicts.

None of these touches the approved REQ, FSPEC, TSPEC or PLAN. All three Mediums are deletions or narrowings of over-broad claims, in line with R-5.

---

## Recommendation

**Needs revision**

The document has cleared the bar that mattered most: the seven-property floor is now met in substance, seven of seven, and all thirteen prior findings are resolved against the tree. The three remaining Mediums are narrow — two over-broad restatements and one empty routing claim — and each is fixed by deletion. This is a document one short pass away from approval.

VERDICT: Needs revision
{"high": 0, "medium": 3, "low": 1}
