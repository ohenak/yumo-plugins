# Cross-Review: product-manager — PROPERTIES (round 5, delta — final round)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/PROPERTIES-pdlc-review-loop-hardening.md` (v1.4, 208,911 B)
**Date:** 2026-07-30
**Iteration:** 5
**Scope:** `Local` — delta re-review. Verification of the three findings in `CROSS-REVIEW-product-manager-PROPERTIES-v4.md` (0 High / 1 Medium / 2 Low, `5604f85`) by **re-derivation from the source that owns each claim** (DC-02), never against §0; judgement of se-review's Medium (SE F-25) from the product lens; and a new-defect scan restricted to the sections carrying diff hunks in `8fd9930~1..f873d34`. Unchanged sections are not re-litigated. Upstream REQ v1.6 / FSPEC v1.8 / TSPEC v1.7 / PLAN v1.4 are approved, closed, and treated as fixed contracts (R-5). Citation and `file:line` drift corrected silently, never filed (R-6).

---

## Method

| Step | What was done |
|---|---|
| Baseline | `feat-pdlc-review-loop-hardening` already at `f873d34`; `origin/feat-pdlc-review-loop-hardening` identical. Six document commits `8fd9930..f873d34`, read as **inclusive** — `8fd9930` is itself the PM F-01 / SE F-27 fix, so the exclusive diff would have hidden the change I was sent to verify. Reviewed range: `8fd9930~1..f873d34`, **+143 / −39 lines**, 194,345 B → 208,911 B (**+14,566 B**, matching the brief) |
| Diff hunks | §0 (new-file 27–54), §4.2 conjuncts (iii)–(v) and the silence paragraph (1047–1110), §4.2 Generator (1104–1113), §4.2 *Beyond the examples* (1129), §4.2 owner table (1226), §4.3 `PROP-LIST-01b` reconciliation (1354–1364), §4.3 `PROP-WINDOW-01` title / (i) / (iii) / Non-vacuity / *Beyond the examples* (1577–1662), §4.4 (1719), §5.2 rows 1 and (3rd) (1841, 1843), §5.3 `PROP-WINDOW-01` row 1 (1872), §7.2 two cells (2050, 2064), §8.5 item 5 (2255). **§4.1 (lines 637–1008) carries no hunk** |
| Grammar | `/^sha256:[0-9a-f]{64}$/` derived from FSPEC and TSPEC **before** reading §4.2's derivation of it |
| Propagation | Every occurrence of `[0-9a-f]{64}` / "64 hex" / "64-hex" in the document enumerated and classified |
| Coverage partition | `PROP-WINDOW-01` ↔ `PROP-LIST-01b` ↔ PLAN `RLH-LOOP-03` walked against PLAN §11.5 / `H-q` and PLAN §7.3 |
| Floors | §4.2's and §4.3's forced floors re-summed against their 100-case budgets |
| Suite | `cd pdlc/workflows && npm test` — **1038 passed / 1 failed / 70 skipped, 1109 total, 36 suites, 430.507 s** on this machine. The single red is the pre-existing intentional `documentOracles.test.js › coveredViolations (§10, §10.1) › AT-22 [red-until-L-06]` at `:246`. Baseline reproduces exactly. Wall clock is machine-dependent and compared to nothing |
| Reconciliation | `CROSS-REVIEW-software-engineer-PROPERTIES-v4.md` read in full. SE F-26 ≡ my F-02 and SE F-27 ≡ my F-03 are one defect each, fixed once |

---

## Verification of my round-4 findings — evidence I derived

| Prior | Sev | Disposition | Evidence I derived (not the author's report) |
|---|---|---|---|
| **F-01** | Medium | **Resolved — and the propagation is complete, which is what failed in each of the previous four rounds** | **I derived the grammar first.** `FSPEC:372` — the approval anchor's value catalogue is *"`sha256:` + 64 lowercase hex"*. `FSPEC:1046` — the append shape is `APPROVAL-HASH: sha256:{64 lowercase hex}`. `FSPEC:1268` — the glossary pins *"§7's grammar exactly: `sha256:` + 64 lowercase hex, **or** the literal `unavailable`"*. `FSPEC:1466` — tier-1 rejection is *"does not match §7's grammar (`sha256:` + 64 lowercase hex)"*. `TSPEC:921` / `:944` — record grammar and the `Approval Hash` row, `sha256:{64 lowercase hex}`. `TSPEC:715–716` — **the split the author reports is real**: `sha256Hex(text)` is commented *"64 lowercase hex"*, `approvalHashOf(text)` is `` `sha256:${sha256Hex(text)}` ``, so the bare hex run is the *inner* function and never the anchor value. The routing closes it in the only direction that matters: `TSPEC:1326` binds `anchor ← parseApprovalHash(text)`, `TSPEC:1358` states *"§5.5 takes `recordedHash` from `anchor`"*, and `TSPEC:1364`'s guard is `!/^sha256:[0-9a-f]{64}$/.test(recordedHash) → "UNEVALUABLE"` — with the comparison itself `approvalHashOf(documentBytes) === recordedHash` (`:1366`), which can never be true of a bare hex run because the left side is prefixed. `TSPEC:896` types the field (`{ ok: true, hash, reviewedCommit }`) and `:944` gives it the prefixed grammar, so **no approved artifact supports the bare form** and no upward report is owed. **Propagation checked exhaustively, not spot-checked.** I enumerated every `[0-9a-f]{64}` / "64 hex" / "64-hex" string in the document and classified each: §4.2 (v) `:1061` **prefixed ✓**; §4.2 *Beyond the examples* `:1129–1132` restated as *"`sha256:` + 64 lowercase hex — the exact shape TSPEC §5.5's guard admits"* **✓**; §4.2 Generator `:1107–1113` — a valid candidate is now *"the grammar verbatim — `APPROVAL-HASH: sha256:{64 lowercase hex}`"* with every malformed shape varying **the hex run** and the malformed-label shape varying the label **✓**; §5.2 row 1 `:1841` restated over `/^sha256:[0-9a-f]{64}$/` with the mutant's `sha256:` + 63 hex named as what dies **✓**; §7.2 `:2050` restated as *"no input yields a `hash` outside `/^sha256:[0-9a-f]{64}$/` — the whole labelled value TSPEC §5.5's guard admits, not a bare hex run"* **✓**. **Five clauses, exactly the five predicted — and I found no sixth.** The residual bare-`{64}` strings are all correctly bare: `:677` and `:1824`, `:2049` are `sha256Hex`/`PROP-DIGEST-02`, whose contract *is* the 64-hex half (`TSPEC:2063` states it in those terms); `:417` is §2.3's shrink-rung prose; `:1234` is `PROP-STALE-01`'s generator, already prefixed throughout. The self-contradiction I filed — `PROP-STALE-01` guarding the prefixed form over the value `TSPEC:1358` routes out of `PROP-HASH-01` — is gone, and gone by moving `PROP-HASH-01` to `PROP-STALE-01`'s reading rather than the reverse, which is the only direction the specs allow. **Nothing is left asserting the bare form of `parseApprovalHash`'s return.** |
| **F-02** ≡ SE F-26 | Low | **Resolved at the owning clause, and by the stronger of the two repairs** | The row was not hedged, it was **replaced**. §5.2 `:1843` now mutates `parseApprovalHash` to return `{ ok: false, reason: "unparseable" }` at a pre-count of `≥ 2`. I re-derived the isolation against all six conjuncts at HEAD rather than reading the row's claim: (i) is an `iff` and at `n === 2` its RHS is false, so it demands `ok: false` — the mutant returns `ok: false`, **green**; (ii) demands `reason === "duplicated"` and gets `"unparseable"`, **dies**, on the forced ≥5 double-line floor; (iii) does not apply (`n ≠ 0`); (iv) does not apply (`n ≠ 1`); (v) is vacuous — no `hash` is returned on this path; (vi) is green, `unparseable ∈ HASH_FAILURES` (`TSPEC:853`). Rows 1 and 2 are green — no hash of any shape is returned, nothing scans mid-document. **(ii) alone dies**, so the row now demonstrates what §5.1 requires a row to demonstrate: that the conjunct earns its place. The over-claim I filed is not merely deleted; the row that carried it is now true |
| **F-03** ≡ SE F-27 | Low | **Resolved at the owning clause** | §4.2 (iv) `:1051–1059` now routes the malformed-label shape **out** of `n === 1` alongside the fence, on the document's own unit (*"it is not an `APPROVAL-HASH:` line"*), and (iii) `:1047–1049` is scoped in the same edit to assert its named reason only *"on the documents whose count is unambiguous (no trailer at all; a trailer only inside a fence)"*. The two conjuncts now agree about which bucket that shape is in, which is the whole of what I filed. The named reason is withheld rather than chosen — judged separately under risk 3 below |

**Three of three resolved. None carried forward.** Each was repaired inside the section that owns the substance, with the superseded claim quoted and withdrawn rather than silently overwritten.

---

## se-review's Medium (SE F-25) — the coverage consequence, judged from the product lens

**The replacement discharges the obligation, the two properties partition the ground, and there is no hole between them. This is the answer I was least expecting to give, and it is settled by the approved PLAN rather than by the PROPERTIES document's own account of itself.**

**1. What the specs actually ask this property to cover.** The defect is `H-1` (`TSPEC:243`): the round index derived as `1` on every entry, destroying history. `TSPEC:2331` maps `H-1` to *"`deriveRoundWindow`'s `max(present) + 1` (§5.2), passed to `reviewLoop` at all seven call sites"* — a **derivation** obligation and a **threading** obligation, with `AT-01` / `AT-01a` as the examples. The single-*computation* rule is a separate clause, `N-a`, and it belongs to PLAN §11.5.

**2. The approved PLAN already says a property cannot cover the count — and names what does.** `PLAN:963`, the `H-q` halt row, states of the single-computation clause that `RLH-LOOP-03` was *"added at v1.3 **because that clause previously had none: a recomputation inside `reviewLoop` from the `startIndex` it was handed yields an identical value and no behavioural oracle can see it**"*. That is the approved artifact declaring, in its own words, that the invocation-count half is **not behaviourally observable** and assigning it to a grep-shaped source-text oracle (`PLAN:289`, `:636`: over `orchestrate-dev.js`, the literal `MAX_REVIEW_ROUNDS - 1` occurs exactly once, outside the source spans of `reviewLoop` and `checkConverged`; `RLH-22`, green batch 8). So the v1.3 conjunct was not carrying a coverage obligation that has now been dropped — it was **duplicating, in a form that was false on correct code, a clause the PLAN had already given to a different and workable oracle**.

**3. The partition, checked for a hole.** Three claims, three owners, no overlap and no gap:

| Claim | Owner | Observable? |
|---|---|---|
| The window is **derived** correctly (`max(present) + 1`, fixed width) | `PROP-ROUND-01` (L1, §4.1) | yes — pure function |
| The window is computed **once**, at the gate | **`RLH-LOOP-03`** (PLAN §11.5 `N-a`, grep) | not behaviourally — PLAN says so |
| The cap `reviewLoop` enforces is the **gate's**, not one it re-derived | `PROP-WINDOW-01` (i) | yes — only on a disagreeing pair |
| The window **does not move** for the phase's duration; identical across consumers | `PROP-WINDOW-01` (i), (iii) | yes |
| Width **identity** against the independently returned `iterations` | `PROP-WINDOW-01` (ii) | yes |
| `refreshReviewState` runs once per **episode** | `PROP-LIST-01b` | yes |

§5.3 row 1 (`:1872`) keeps the pairing sentence — *"`RLH-LOOP-03`'s grep oracle reds in the same batch, and the two together are the §11.5 `N-a` enforcement pair"* — so the document does not claim the count for itself and does not leave it unclaimed either. The reconciling paragraph at §4.3 `:1355–1364` states the arithmetic (`1 + k`) and assigns the *k* to `PROP-LIST-01b` and the immutability to `PROP-WINDOW-01`. **Both halves land somewhere; neither lands twice.**

**4. Is the replacement merely true, or is it also load-bearing?** Load-bearing, and I checked the mutant rather than the sentence. §5.3 row 1's mutation — ignore the `endIndex` parameter and recompute it inside `reviewLoop` from its own `_listFiles` re-derivation — is precisely the H-1-shaped regression (a consumer redoing the derivation over a listing that has grown as the loop wrote files). On the ≥15 forced **disagreeing** runs the mutant's cap follows the re-derivation and the property demands it follow the parameter, so the conjunct dies. On agreeing runs it survives, which is exactly why the floor is forced and why the author was right that without it (i) is vacuous. Rows 2 and 3 still bind on live conjuncts: row 2's swapped positional pair kills *"identical across every consumer and every call"* — retained verbatim in the new (i) — and row 3's off-by-one kills (ii), untouched. **No ledger row was left pointing at a deleted clause**, which is the failure I was watching for.

**5. Was anything smuggled in?** No. Conjunct (iii) gained one clause stating it speaks of the threaded pair and not of `refreshReviewState`'s internal `w` — which is not a weakening, it is the removal of a claim that would have been **false** on correct code for the second time in the same property (`TSPEC` §5.6.1 rule 2 has `w.startIndex` legitimately advancing). The property's *title* changed to match its content. `PROP-WINDOW-01`'s owner and ledger row are unchanged: §4.3 `:1655` and §7.1 `:2038` both say `RLH-22` (batch 3) → `RLH-LOOP-01`/`-02`, green batch 9, permitted red batches 3–8 — and `PLAN:634–635` gives `RLH-LOOP-01`/`-02` exactly `RLH-22 (3)`, green **9**, permitted red **3–8**. **The PLAN is not reopened by this fix.**

---

## The five risks the brief named, judged

**1. §0 is still inert — fifth round running, checked row by row, and it is not where the bytes went.** Measured: the v1.4 block is lines 27–54, **5,883 B** — not the ~7.6 KB the brief estimated, and **40% of the round's +14,566 B**, with the remaining ~8.7 KB in the body (§4.2 (v)'s derivation, §4.3's F-25 paragraph and new floor, `PROP-LIST-01b`'s reconciliation, two ledger rows, two §7.2 cells). The ratio runs the right way. Each row checked against the section it points at, never the pointer: PM F-01 → §4.2 (v), Generator, *Beyond the examples*, §5.2 row 1, §7.2 — all five in the body; SE F-25 → §4.3's (i), (iii), Non-vacuity, title, §5.3 row 1, §7.2, and `PROP-LIST-01b`'s paragraph — all in the body; SE F-26 → §5.2 (3rd); SE F-27 → §4.2 (iv) and the second-silence paragraph; the R-6 row → `orchestrate-dev.js:532–542` at `:1592`, the two PLAN attributions at §4.4 and §8.5 item 5, the owner table's `(iii)` at `:1226`; SE Q-04 and the Q-05/PM-Q-01/PM-Q-02 row record answers whose substance is in §4.3 (i) and §4.2 (iv)–(v). **No live disposition and no property's sole precise statement lives only in a changelog row.** Not filed, and this should now stop being re-derived.

**2. New machinery in the final round breaks no floor, and the budgets still fit.** §4.2's forced floors are **unchanged** and re-sum to what I measured at v1.3: 20 valid + 10 (63-char) + 10 (65-char) + 10 quoted-or-fenced + 5 double-line + 5 no-trailer = **60 of 100**, 40 free for the three unfloored shapes (uppercase, non-hex, malformed label). The malformed-label shape gained no floor and lost none. §4.3's generator gains one axis: ≥20 overflow, ≥20 exhaustion, ≥15 non-1 `startIndex`, ≥10 converge-early, **+ ≥15 disagreeing pairs** on 100 cases. The outcome-axis floors that are mutually exclusive sum to 50; the two remaining floors are orthogonal coordinates that co-occur freely with any outcome, and the disagreeing pair is set by the test's own parameters, not by the subject. **Satisfiable with 50 spare.** I checked the new floor against conjunct (ii) specifically, since a disagreeing window could in principle break the width identity: it does not — the loop starts at the handed `startIndex` (`TSPEC:470`) and caps on the handed `endIndex` (`TSPEC:1897`), so `endIndex - startIndex + 1 === iterations` on exhaustion regardless of what a re-derivation would have said. No existing floor became unsatisfiable and no property became vacuous.

**3. The second recorded silence meets the same standard as the first — I derived both readings rather than accepting the symmetry claim.** The shape is a correct `sha256:`-prefixed value under a malformed label. `TSPEC` states **no** matcher for `parseApprovalHash` (it defines the *sibling* `duplicated` for `parseRevisionComplete` at `:893`), so two conforming subjects exist:

| Matcher | `n` | Verdict | `reason` |
|---|---|---|---|
| prefix-exact | `0` | `ok: false` | `absent` |
| loose enough to recognise the line | `1`, not well-formed per `TSPEC` §4.4's grammar | `ok: false` | `unparseable` |

Both are `ok: false`; both reasons are members of `HASH_FAILURES` (`TSPEC:853`); no `hash` is returned under either, so (v) is vacuous under both. I checked the loose branch against (i) specifically, because a *correct payload* under a wrong label is the one case where a payload-only reading of (i) would have demanded `ok: true` and redded a conforming subject: (i) at `:1037–1039` requires *"that one line is a **well-formed trailer** at a position the format permits (**TSPEC §4.4's grammar**)"* — and §4.4's grammar is the whole line, label included, so a malformed label is not well-formed and (i) gives `ok: false` under the loose reading too. **Both readings discharge the obligation; (i), (v) and (vi) bind under both; neither named reason is asserted.** And the withheld coverage is not lost: `absent` is still forced by the ≥5 no-trailer floor and the fenced-only shape (a **stated** exclusion, `TSPEC` §5.0), and §5.2's (4th) row still kills (vi) and (iii)'s named `absent` on that floor — so §7.2's claim that this property covers *"`duplicated` and `absent` … which no AT states over the input space"* survives intact. Recorded rather than resolved is the honest disposition here for the same reason it was for the `> `-quoted line: resolving it would require inventing a matcher the approved specs decline to pin.

**4. The approved PLAN stays closed.** No property was added, none moved between levels, no ledger window changed. §4.1 and §7.1 carry no hunk; §7.3 carries no hunk. §7.1 still lists **eighteen ids over seventeen properties** (`PROP-LIST-01a`/`-01b` sharing one). Every property still rides an existing §7.3 ledger row — I re-checked the only one this round touched, `PROP-WINDOW-01`, against `PLAN:634–635` (above): identical. §5.2's and §5.3's changes are falsifier rows, not ledger entries. The new ≥15 floor is a generator obligation inside `RLH-22`'s own file (`reviewLoop.test.js`, PLAN `:289`), constructed from the `_listFiles` double `RLH-22` already owns — **no new task, no new dependency, no PLAN row.**

**5. The seven-property floor.** **Still met in substance, seven of seven.** §4.1 (lines 637–1008) **carries no diff hunk in `f4dc8cb..f873d34`** — the earliest content hunk in the range lands at new-file 1044, inside §4.2 — and §4.1's seven are byte-identical to the versions I judged sufficient in rounds 3 and 4: `PROP-DIGEST-01`, `PROP-DIGEST-02`, `PROP-SCAN-01`, `PROP-NAME-01`, `PROP-ROUND-01`, `PROP-FORCE-01`, `PROP-COMPLETE-01`. Nothing regressed it; the judgement stands unmodified and I did not re-argue it.

---

## New findings (changed sections only)

**None.** Zero High, zero Medium, zero Low.

### Candidates examined and *not* filed

- **§4.2's Non-vacuity paragraph (`:1121`) still calls (v) *"the hex-shape totality conjunct"*** while *Beyond the examples* renamed it *"the value-shape conjunct"*. Unchanged text, carrying no hunk; the sentence's claim — that totality quantifies over returned hashes and a duplicated document returns none — is true under either name. Nomenclature, corrected silently (R-6), not a finding at any severity.
- **§4.2 (iv)'s *"Two shapes v1.3 listed here"***. v1.3 already routed the fence out in its own second sentence, so "two" describes what (iv) *mentioned* rather than what it *bucketed*. Historical prose about a superseded version; it makes no assertion about the subject and no test reads it. Not filed.
- **The three unfloored generator shapes in §4.2** (uppercase, non-hex, malformed label). Unchanged since v1.1, measured and not filed at v1.3 and v1.4; the delta protocol does not reopen them, and (iv) is exercised by the ≥20 length-off-by-one floor regardless.
- **The `> `-quoted-line silence, §4.1, §8.4 residual 6, the queue-row withdrawal, `PROP-TRAILER-01`'s §7.3 row.** Dropped in round 4 and not re-filed, per the brief.
- **TSPEC §8.1 / §8.2's count inconsistency.** Already reported upward in §8.1. Upward-facing (R-5), not blocking.
- **Citation drift** — `reviewLoop:531–543` → `:532–542`, and the PLAN attribution split. Both verified at source: `PLAN:804` reads *"…stack of unclosed `(` / `[` / `{` to find the enclosing context, **and decide the three rulings from it**"*, and `PLAN:1504` (§0's F-03 row) is where *"to decide which §8.5 ruling, if any, applies"* actually lives. §4.4 and §8.5 item 5 now quote each phrase where it lives. Mechanical, corrected silently, not filed (R-6).

---

## Questions

None outstanding. My Q-01 and Q-02 from round 4 are answered in the body of the document, not only in §0: Q-01 by §4.2 (v)'s derivation (`hash` is the line's whole value), Q-02 by §4.2 (iv)'s routing plus the second recorded silence (`ok: false` asserted, the named reason withheld).

---

## Positive Observations

- **The value fix went to the contract, and then went everywhere the contract reaches.** I have found claimed-coverage-with-contradicting-reality in every round of this document, and in each of the previous four the repair was partial — the clause moved and a consequential cell did not. This round I enumerated every occurrence of the value shape in 208,911 bytes rather than checking the five the author reported, and the five reported are the five that exist. That is the first time the propagation has been complete.
- **SE F-25 was fixed by asking what the claim was *for*, not by weakening it.** The cheap repair was to soften the equality to a floor, which would have been true and worthless. Replacing it with a provenance oracle asserted **by disagreement** — and then forcing the disagreeing case, because on an agreeing case a re-deriving subject and a threading subject are indistinguishable — is the expensive repair, and it kills the exact H-1-shaped regression the clause existed for. The document also had the discipline to say what the property *no longer* claims and to name who claims it instead.
- **The two properties were made to partition rather than to coexist.** `PROP-LIST-01b`'s new paragraph does not merely note the tension; it states the arithmetic (`1 + k`), assigns the *k*, assigns the immutability, and says in terms that neither claims the other's ground. I checked that partition against PLAN §11.5 and `H-q` rather than against the paragraph, and it holds — including the half the PLAN itself declares behaviourally unobservable and hands to a grep oracle.
- **The falsifier was swapped, not hedged.** §5.2's (3rd) row could have been rescued by adding "and (i)". Replacing the mutation so that **(ii) alone** dies makes the row do the job §5.1 says rows are for. I re-derived that isolation against all six conjuncts and both sibling rows.
- **Nothing measurable in this revision measured false.** The grammar chain across four FSPEC sites and five TSPEC sites, the `PLAN:634–635` ledger window, the `PLAN:804` and `PLAN:1504` quotes, `TSPEC:853`'s catalogue, §7.1's eighteen-over-seventeen, both floor budgets, the byte delta, and the 1038/1/70/36 suite baseline. Two rounds running.
- **The trajectory closes cleanly**: 8H/11M/5L → 1H/6M/6L → 0H/3M/4L → 0H/2M/4L → **0H/0M/0L**, with no finding reopened at any step and no severity reclassified downward to get here.

---

## Recommendation

**Approved**

Unambiguously, and on evidence rather than on the calendar. I re-derived the `sha256:` grammar from FSPEC `:372`, `:1046`, `:1268`, `:1466` and TSPEC `:715–716`, `:921`, `:944`, `:1326`, `:1358`, `:1364` **before** reading the document's account of it, then enumerated every occurrence of the value shape in the file: five clauses needed the change, five clauses have it, and the only bare-hex survivors are `sha256Hex`'s and `PROP-DIGEST-02`'s, where bare hex is the contract. The partial propagation that made this property fail four times is not present. My two Lows are fixed at the clauses that own them, and the §5.2 falsifier was replaced rather than hedged — I re-derived its isolation against all six conjuncts and confirmed **(ii) alone** dies.

On se-review's Medium: the replacement **does** discharge the obligation. No coverage was traded away, because the approved PLAN (`:963`) already states that the invocation-count half has no behavioural oracle and already assigns it to `RLH-LOOP-03`; the v1.3 conjunct was duplicating that clause in a form false on correct code. `PROP-WINDOW-01` now owns provenance, immutability and width; `PROP-LIST-01b` owns the per-episode count; `RLH-LOOP-03` owns the single computation. I looked for a hole between them and there is none. The new oracle is load-bearing — it kills the H-1-shaped re-derivation mutant on the ≥15 forced disagreeing runs — and no ledger row was left pointing at a deleted clause.

The rest holds: §0 is inert for a fifth round and carries 40% of the byte delta rather than the bulk of it; both forced-case budgets still fit (60/100 in §4.2, unchanged; 50 of 100 committed in §4.3 with the new axis); the second recorded silence is safe under **both** matcher readings, with `absent`'s coverage still forced elsewhere; the approved PLAN is untouched and every property still rides an existing §7.3 row; the seven-property floor is met seven of seven, with §4.1 carrying no hunk in this range; and the suite baseline reproduces exactly (1038 passed / 1 failed / 70 skipped, 36 suites, 430.507 s — the single red the intentional `AT-22 [red-until-L-06]`).

I did not lower the standard to converge. The class I have flagged in every round — a property whose claimed guarantee its own sources contradict — is the class I hunted hardest this round, in the two places new machinery could have hidden one, and it is absent. This document discharges its obligation honestly, and it goes to implementation with my approval.

---

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
