---
feature: pdlc-review-loop-hardening
---

# PROPERTIES — pdlc-review-loop-hardening

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-review-loop-hardening.md` v1.6 → `FSPEC-pdlc-review-loop-hardening.md` v1.8 → `TSPEC-pdlc-review-loop-hardening.md` v1.7 → `PLAN-pdlc-review-loop-hardening.md` v1.4 → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/**`) |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,product-manager}-PROPERTIES-v{N}.md` (this branch, while active) |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` (Phase H) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 1.4 | 2026-07-30 |

> **Altitude.** The REQ states the observable behaviour, the FSPEC how it is produced and pins the
> sixty-six acceptance tests, the TSPEC how it is built and proved with *examples*, the PLAN when each
> assertion is allowed to be red. This document states what must hold over **generated** inputs: the
> domains, the invariants quantified over them, the shrink order, and — for every property — the
> concrete source mutation that would falsify it. It restates no FSPEC behaviour; behaviour is cited
> by section.

## 0. Changelog

### v1.4 — round-4 cross-review feedback

Reviewers: `CROSS-REVIEW-software-engineer-PROPERTIES-v4.md` (0 High, 1 Medium, 2 Low, `f4dc8cb`) and
`CROSS-REVIEW-product-manager-PROPERTIES-v4.md` (0 High, 1 Medium, 2 Low, `5604f85`). Both read in
full. Both verified **all seven round-3 findings resolved** by independent re-derivation, none
reopened; both confirmed §0 inert for a fourth round, the seven-property floor met seven of seven
(§4.1 carries no hunk), the counting unit correct, and the `> `-quoted silence safe under both
readings — that last is settled and is not revisited here. Upstream REQ v1.6 / FSPEC v1.8 /
TSPEC v1.7 / PLAN v1.4 approved and **not** reopened. Both Mediums are the same class: a conjunct
that reds a *correct* implementation. Every fix is a single clause inside the conjunct or ledger row
that owns it; no property is restated, and the only floor added is the one conjunct (i) of
`PROP-WINDOW-01` needs to be falsifiable at all.

| Finding | Sev | Resolution — and where the substance lives |
|---|---|---|
| PM F-01 | **Medium** | **Fixed at the value, measured from the owning sections.** `PROP-HASH-01` conjunct (v) asserted the bare `/^[0-9a-f]{64}$/`. Re-derived: FSPEC §5's carrier catalogue, FSPEC §7's append shape, FSPEC §10.5's rejection clause and TSPEC §4.4's record grammar all define the value as `sha256:` + 64 lowercase hex; TSPEC §3.7 splits it (`sha256Hex` is the hex half, `approvalHashOf` prefixes); TSPEC §5.4 routes `parseApprovalHash`'s output into §5.5, whose guard is `/^sha256:[0-9a-f]{64}$/`. So the old clause was false on all ≥20 forced valid cases and contradicted `PROP-STALE-01` over the same value. (v) now reads `/^sha256:[0-9a-f]{64}$/` in **§4.2**, with the derivation stated there; the three consequential clauses are corrected to match — §4.2's Generator (a valid candidate is the grammar verbatim, malformed shapes vary the **hex run**, the malformed-label shape varies the label), §4.2's *Beyond the examples*, §5.2's `PROP-HASH-01` row 1, and §7.2's coverage cell |
| SE F-25 (≡ carried SE Q-03, promoted) | **Medium** | **Fixed by replacing a call-count equality with a provenance oracle.** `PROP-WINDOW-01` (i) asserted `deriveRoundWindow` is invoked exactly once per phase entry. Re-derived from the sections that own the call sites: TSPEC §5.4 puts one at the gate and TSPEC §5.6.1 (`refreshReviewState`) puts one at **every** wrapped episode entry — N-01's own fix — so a *k*-episode entry invokes it **1 + k** times, and `PROP-LIST-01b` already asserted that *k* as an equality. (i) is restated in **§4.3** over the threaded window *values*: the cap `reviewLoop` enforces follows the **parameter**, shown on runs where a re-derivation would answer differently. Conjuncts (ii) and (iii) are untouched in substance; (iii) gains one clause naming that it speaks of the threaded pair, not `refreshReviewState`'s internal `w`. `PROP-LIST-01b` gains the reconciling paragraph. The property's title, §5.3's `PROP-WINDOW-01` row 1 and §7.2's cell are restated to match, and one floor is added (≥15 disagreeing runs) without which (i) would be vacuous |
| SE F-26 ≡ PM F-02 | Low | **Fixed by swapping the mutation, not by hedging the claim.** §5.2's `PROP-HASH-01` (3rd) row claimed its red named (ii) alone; re-derived, the old mutation also killed (i)'s only-if half on every double-line case and (v) on mixed cases where the malformed line was collected first — so it demonstrated nothing about (ii). Replaced with the reviewer's isolating mutation: return `{ ok: false, reason: "unparseable" }` at `n ≥ 2`. Checked against all six conjuncts and rows 1–2: **(ii) alone dies** |
| SE F-27 ≡ PM F-03 | Low | **Fixed in (iv)'s own shape.** (iv) bucketed the malformed-label document under `n === 1`, but by §4.2's own unit a line under a malformed label is not an `APPROVAL-HASH:` line, so it is `n === 0` — which (iii) claims with a *named* reason. (iv) now routes it out alongside the fence, and §4.2 records it as the **second** instance of the matcher silence it already records for the `> `-quoted shape: both matchers answer `ok: false` with a `HASH_FAILURES` member, so (i), (v) and (vi) bind and neither named reason is asserted |
| R-6 (mechanical, not defects) | — | `reviewLoop`'s span corrected to `orchestrate-dev.js:532–542` in §4.3. The phrase *"to decide which §8.5 ruling, if any, applies"* is PLAN's but lives in PLAN **§0's changelog row for F-03** (`PLAN:1504`), not §9.2 item 3(c), whose own words are *"and decide the three rulings from it"* — both are now quoted and attributed where they live, in §4.4 and §8.5 item 5. §4.2's owner table `absent` row renumbered to *conjunct (iii)* for parity with the `duplicated` row |
| SE Q-04 | — | Answered by the fix: (i) is aiming at *`reviewLoop` not re-deriving the cap it was handed*, which is what §4.3 now states. The gate-side claim is not this property's and is not smuggled in — the gate is not inside `reviewLoop` and `reviewLoop.test.js` cannot see it |
| SE Q-05, PM Q-01, PM Q-02 | — | Q-05: the (3rd) row's old mutation was chosen because round-3 F-21 prescribed it, so the swap is free and taken. PM Q-01: `hash` is the line's **whole** value, per the derivation above; no upward report is owed, because the approved specs are unanimous and it was this document that disagreed with them. PM Q-02: the malformed-label shape is asserted as `ok: false` **only** — the named `absent` is withheld, on the recorded-silence ground above |

**Nothing declined.** All six findings across both reviews are fixed at the clause that owns them.
The `> `-quoted-line disposition, §4.1's seven properties, §8.4's residual 6 and every generator floor
except `PROP-WINDOW-01`'s new one are unchanged, because both reviewers re-derived them and neither
filed against them.

### v1.3 — round-3 cross-review feedback

Reviewers: `CROSS-REVIEW-software-engineer-PROPERTIES-v3.md` (0 High, 1 Medium, 3 Low, `a03ecde`) and
`CROSS-REVIEW-product-manager-PROPERTIES-v3.md` (0 High, 2 Medium, 1 Low, `1dfeb1c`). Both read in
full. Both verified **all thirteen round-2 findings resolved**, none reopened, each by independent
re-derivation. Upstream REQ v1.6 / FSPEC v1.8 / TSPEC v1.7 / PLAN v1.4 approved and **not** reopened.
The v1.2 range was `95529be..b6773e7` (ten commits), not the `d6b524d..b6773e7` the round-3 briefs
named — both reviewers widened it independently and both said so.

**The through-line: one measure, read from its owner.** `PROP-HASH-01`'s duplicate handling was wrong
for the third consecutive round, in a third new way, and both reviewers filed it independently. The
cause was the same each time — the property paraphrased the counting rule instead of measuring it.
This revision goes to TSPEC §5.3 and §4.3, extracts the unit those sections count
(**`APPROVAL-HASH:` lines outside fenced regions, irrespective of payload**), and states the `iff`,
the `duplicated` conjunct and the `absent` conjunct over that one measure — as conjuncts (i)–(vi) of a
single count `n`. Nothing else in §4.2 moves.

| ID | Sev | Resolution |
|---|---|---|
| SE F-21 | Medium | **Two rows added to §5.2**, in `PROP-TRAILER-01` (2nd)'s shape. `PROP-HASH-01` (3rd): on pre-count `≥ 2`, return the **first** collected line as `{ ok: true, hash }` ⇒ conjunct (ii) dies on the ≥5 double-line floor while (v) and (vi) survive. `PROP-HASH-01` (4th): on `n === 0` return `{ ok: false }` with `reason` omitted or outside `HASH_FAILURES` ⇒ conjunct (vi)'s membership dies on the ≥5 no-trailer floor while (i) survives. Each was checked against rows 1 and 2 first: both survive both mutations, which is why the rows were owed. **SE Q-02 answered**: the omission was forgotten, not deliberate — stated in the (4th) row itself |
| SE F-23 ≡ PM F-01 | Medium (convergent) | **§4.2's invariant restated over the measured count**, not paraphrased a fourth time. The `iff` now reads `n === 1` **and** that line well-formed at a permitted position; `duplicated` reads `n >= 2` *whatever the payloads are*; `absent` reads `n === 0`. On one valid trailer plus one malformed line both now say `duplicated` — the contradiction was the `iff` counting *trailers* while TSPEC counts *lines*. **SE Q-01 / PM Q-01 answered in §4.2's Generator**: each document carries **exactly one shape**, never a mixture, and the double-line shape is widened to include one-valid-plus-one-malformed so conjunct (ii)'s payload-blindness is drawn (≥2 of the ≥5). The one thing TSPEC does not settle — whether a `> `-quoted line enters the pre-count — is stated in §4.2 together with the reason no conjunct depends on it: both readings yield `ok: false` with a `HASH_FAILURES` member, and the *named* reasons are asserted only where the count is unambiguous |
| PM F-02 | Medium (cross-feature) | **§8.4 residual 6's successor binding withdrawn.** `QUEUE.md` scopes row 9 to *"declaring those contracts in the SKILLs, not to re-implementing row 0's mechanism"*; an `_readFile` → `null` reader-seam path is that mechanism. Row 9's scope is now quoted from `QUEUE.md` rather than characterised, and the residual is recorded as having **no successor row** — every row in the table was read. Closing it is stated as an **action** (widen row 9's REQ scope when authored, or allocate a new row), per PM Q-02. §8.3's two existing row-9 bindings fit that charter and stand |
| SE F-22 | Low | **§4.3's `I` provenance sentence corrected.** `I` has two return sites: `:598` (the exhausting branch, TSPEC §7.1 edit 5, the constant reported as a count) and `:648` (the converging branch, not an edit site, no constant). That split is now stated as the reason conjunct (i)'s equality is restricted to precondition (b) and its inequality is not |
| SE F-24 | Low | **PLAN §9.2 item 3(c) quoted as written** in both §4.4 and §8.5 item 5: *"to decide which §8.5 ruling, if any, applies"*. v1.2's *"whichever, if any, applies"* was a paraphrase inside quotation marks. Substance unaffected — neither phrasing states a precedence, so §8.5 item 5's upward report stands |
| PM F-03 | Low | **§2.3's competing sole-ownership claim withdrawn**, per R-5's prefer-deletion rule and last round's ruling that §2.3 owns the disposition. §2.3's table is now the single named owner; a property's `Shrink.` line restates its row. §3.1's cell already pointed here and is unchanged |
| SE F-23 (as filed Low) | — | Same defect as PM F-01; treated once, above. Nothing declined |
| SE Q-03 | Carried | `PROP-WINDOW-01`(i)'s call-count observability, unchanged for the third round and not filed as a finding for the third time. Not addressed here: it is a question about which surface `RLH-22` will use, and answering it would require a TSPEC export §4.8 declines to make. §8.5 item 3 already carries the shape of the admission |

**Mechanical, corrected silently (R-6), not filed as defects:** site 4's dispatch is `orchestrate-dev.js:574`, not `:570` (three places: §0's v1.2 F-13 row, §4.3, §6.5).

**Nothing was declined.** Every finding in both reviews is resolved in the section that owns it. No
property was restated, no floor was removed, no structure moved, and §0 gained a map row per finding
rather than a statement any section needs.

### v1.2 — round-2 cross-review feedback

Reviewers: `CROSS-REVIEW-software-engineer-PROPERTIES-v2.md` (1 High, 3 Medium, 5 Low, `df12e7c`) and
`CROSS-REVIEW-product-manager-PROPERTIES-v2.md` (0 High, 3 Medium, 1 Low, `8bb1127`). Both read in
full. Both verified **all 24 round-1 findings resolved**, none reopened; nothing resolved in v1.1 is
re-derived here. Upstream REQ v1.6 / FSPEC v1.8 / TSPEC v1.7 / PLAN v1.4 approved and **not** reopened.

**The through-line of this revision: three findings were paraphrases of a rule whose owning section
already stated it precisely. The fix in each case is a citation and a deletion, not a better
paraphrase.** SE F-12 (ruling 2's forward half), SE F-19 (the lone-surrogate floor) and PM F-01 (the
shrink no-op) are all that shape; §4.4, §5.2 and §3.1/§8.2 now cite PLAN §9.2 item 3(c), §4.1 and §2.3
respectively and state nothing in their own words.

**software-engineer v2**

| ID | Sev | Disposition |
|---|---|---|
| F-12 | **High** | **Fixed by citation.** §4.4's `returned-promise` decision cell no longer says *"the returned value is awaited by the caller"* — a semantic claim about callers that the prescribed bracket-depth walk cannot decide and that D8's caller-less fragments cannot carry an expectation for. It now reproduces **PLAN §9.2 item 3(c)**'s local syntactic test (backward: nearest non-whitespace token is `=>`/`return`; forward: first non-whitespace token after the call's matching `)` at depth zero is `;` `,` `)` `}` or EOL; both halves; forward walk failing to reach depth zero ⇒ `unclassified`) and cites §9.2 item 3(c) as the owner. Both dependants repaired: §4.4's ≥10 backward-only floor is now generable and names §9.2's own `() => _agent(a) && other` shape, and §5.3's `PROP-AWAIT-01` (4th) row cites rather than restates. v1.1's phrasing is explicitly withdrawn in §4.4 |
| F-13 | Medium | **Fixed against the tree.** Measured at HEAD: `reviewLoop` (`orchestrate-dev.js:531–543`) injects exactly `_agent`, `_parallel`, `_checkFile`; `recordPhase` is a `main()`-local callback (`:1574`) passed to `checkConverged` (`:496`), never to `reviewLoop`; site 4's prompt is built at `:567` and dispatched at `:574` as `await _agent(optimizer, postmortemPrompt)`. §4.3 and §6.5 now name the **`_agent` double's recorded prompt** for site 4 and `reviewLoop`'s **return value** for site 5, with the measurement stated and v1.1's claim withdrawn |
| F-14 | Medium | **Fixed by copying `PROP-WINDOW-01`'s treatment.** `PROP-EPISODE-01`(i)'s tight equality now requires **both** (a) every episode in the segment saturated **and** (b) the segment's loop ran to **exhaustion** (`converged: false`). Measured cause: `:598` returns `iterations: MAX_REVIEW_ROUNDS` only on the non-converged branch, `:648` returns the actual round — so a saturated-but-early-converging segment gave `2B` against `3B`, a deterministic red on correct code at a forced floor. The ≥10 floor is restated to require exhaustion; segments satisfying (a) without (b) fall back to the inequality. SE Q-02 answered in the same conjunct: **`I` is read per segment**, one per phase entry |
| F-15 | Medium | **Fixed without inventing a precedence.** Neither PLAN §9.2 nor TSPEC §8.5 orders rulings 2 and 3, so a hand-authored `expected` label on the deliberate both-rulings fragments would red a *correct* classifier on §7.3's no-permitted-red row. Those fragments are now generated **unlabelled** and carry a **cardinality** assertion: `classify` returns exactly one outcome and it is a member of `{returned-promise, awaited-combinator-argument}` — never both, never `unclassified`. Stated in §4.4, not §0. The missing precedence is **reported upward** as §8.5 item 5, naming TSPEC §8.5's rulings table as where it would belong. §5.3 gains a matching `PROP-AWAIT-01` (5th) mutation row (return both exemptions ⇒ cardinality dies). This answers SE Q-01 with "either — so the assertion is cardinality-only" |
| F-16 | Low | **Fixed.** §4.3 now says plainly that `B` is **not** an independent observable — it is measured with the same dispatch doubles that produce conjunct (i)'s left-hand side, so a uniformly wrong cap is invisible — and that the equality's discriminating power is over **segment structure**, not the cap's value. Recorded in both operational form (§8.4 residual 5, extended) and spec form (§8.5 item **4**, the sentence §8.5 item 3 already owes `MAX_REVIEW_ROUNDS`) |
| F-17 | Low | **Fixed by deletion.** `PROP-EPISODE-01`'s **Generator** paragraph said "vary all **five** `EpisodeKey` coordinates independently", contradicting the F-04 repair three paragraphs above and §8.5 item 2. It now varies the **four externally controllable** coordinates and states the withdrawal |
| F-18 | Low | **Fixed to the measurement.** `__tests__/helpers/` holds **thirteen entries: twelve `.js` modules plus a `bin/` directory**. v1.0 said twelve modules, v1.1 over-corrected to thirteen modules. §6.1 states the measurement and notes the load-bearing claim (`testPathIgnorePatterns` excludes the directory) is unaffected by either figure |
| F-19 | Low | **Fixed by citation.** §5.2's `PROP-DIGEST-02` (3rd) row said "the **≥10** lone-surrogate cases"; §4.1's **Non-vacuity** paragraph — the owning floor — says ≥5. The ledger row now **cites §4.1's floor** rather than restating a number, and names v1.1's contradiction |
| F-20 ≡ PM F-04 | Low | **Fixed by deletion, both filings.** §1.3's *"The approved PLAN stays closed: a property that would need a genuinely new row is a defect in the property, and none here does"* is **withdrawn** — §7.1's own `Row` cell reads *own row*, and no existing §7.3 row carries (`pacingWrapper.test.js`, green batch 3, permitted red none). §1.3 now states the new row's **five cells** in a table and names RLH-21 as the task that adopts it; what stays closed is restated as the PLAN's *content* — no property needs a window §7.3's own derivation rule would not produce. §7.1's cell cross-references §1.3 |
| Q-01 | — | Answered in §4.4 and §8.5 item 5: **either** is behaviourally right, so the floor is cardinality-only and the precedence is reported upward |
| Q-02 | — | Answered in §4.3 conjunct (i): **per phase segment**, one `iterations` value per phase entry |
| Q-03 | — | Carried unchanged from v1.0 by the reviewer's own note and **not filed as a finding**; `PROP-WINDOW-01`(i)'s call-count clause and `RLH-LOOP-03`'s grep oracle ownership are left as v1.1 stated them. Not silently altered |

**product-manager v2**

| ID | Sev | Disposition |
|---|---|---|
| F-01 | Medium | **Fixed by deletion, per R-5.** §3.1's `Used by` cell and §8.2's ladder row said the shipped `"bytes"` rung is "a no-op on every case they generate … their strings are shorter", naming all four properties. Measured: the DIGEST pair's domain is `n ∈ 0…512`, so roughly seven-eighths of that corpus is **above** `BYTES_FLOOR = 64` and does get a truncation rung. Both restatements are **deleted**, not qualified; §2.3's table is left as the sole owner of each property's disposition and is cited from both places |
| F-02 | Medium | **Fixed against the approved TSPEC.** `PROP-HASH-01`'s *"two trailers resolve deterministically to the same one … §6.4 owns which"* conjunct is **withdrawn**: it contradicted TSPEC §4.1 (`HASH_FAILURES` includes `duplicated`) and §6.2 row 6 (`duplicated` ⇒ `{ok:false}` ⇒ `UNEVALUABLE`), so a forced ≥5 floor redded correct code; and the delegation was empty, §6.4 being the heading-fixture section. Restated: a document with two `APPROVAL-HASH:` lines outside fences returns `{ ok: false, reason: "duplicated" }`. **PM Q-02 answered**: the ≥5 floor **survives as a floor on the rejection shape** — it is what forces the named `reason`, which the hex-shape totality conjunct cannot reach |
| F-03 | Medium | **Fixed by owning three classes and admitting the fourth.** §4.2's routing of absent / duplicated / unreadable to *"the seam, `PROP-APPROVE-01`"* is **withdrawn** — that property's conjuncts are tier discipline, window respect and idempotence, and its generator never produces those anchors. Replaced by an explicit owner table: `unparseable` → `PROP-STALE-01`(i); `duplicated` and `absent` → **`PROP-HASH-01`**, which gains a named-`reason`-in-`HASH_FAILURES` conjunct, two new generator shapes (two trailers / no trailer) and ≥5-case floors for each; **unreadable document → nobody**, recorded as §8.4 residual 6 with the DC-08 successor surface named (queue row Order 9, `pdlc-authoring-contract`). **PM Q-01 answered**: `PROP-APPROVE-01` does *not* acquire the conjunct — the two parser classes go where the parser property already lives, and only the genuine IO gap is deferred |
| F-04 ≡ SE F-20 | Low | See SE F-20 above. Fixed once, in §1.3 and §7.1 |

**Verification basis (DC-02).** Every restated signature, seam, constant and disposition was measured
at branch HEAD before the sentence naming it was written: `reviewLoop`'s parameter list, `recordPhase`'s
declaration and call site, both `reviewLoop` return sites, the postmortem dispatch, `__tests__/helpers/`
and `fixtures/` listings, `BYTES_FLOOR`, TSPEC §4.1's `HASH_FAILURES`, TSPEC §6.2's dispositions, and
PLAN §9.2 item 3(c) verbatim.

**Nothing was declined.** All four Mediums and the High are fixed in the owning section; all six Lows
are fixed. No upstream artifact was edited, no ledger row moved except the one §1.3 now states
explicitly, and no property was restructured.

### v1.1 — round-1 cross-review feedback

Reviewers: `CROSS-REVIEW-software-engineer-PROPERTIES-v1.md` (4 High, 4 Medium, 3 Low) and
`CROSS-REVIEW-product-manager-PROPERTIES-v1.md` (4 High, 7 Medium, 2 Low). Both were read in full and
both are the authority for this revision; the upstream REQ v1.6 / FSPEC v1.8 / TSPEC v1.7 / PLAN v1.4
are approved and were **not** reopened.

**The shape of the revision.** The ten beyond-floor properties were the strong ones and are preserved
intact — `PROP-GINV-01` still states its invariant over *paths*, `PROP-LIST-01b` still asserts
call-count **equality**, `PROP-RESOLVE-01` still enumerates all sixteen H-4 presence vectors. The
repair is concentrated in two places: **four of the seven TSPEC-named floor properties were stated
against signatures the TSPEC does not have**, and **several oracles were unreachable at the level they
were stated at**. Where a v1.0 claim was wrong it is recorded as withdrawn in place, never silently
deleted. **No property was deleted outright.** No new PLAN ledger row is proposed.

#### Software-engineer findings

| ID | Sev | Disposition |
|---|---|---|
| F-01 | High | **Fixed.** `PROP-AWAIT-01`'s outcome catalogue rebuilt from the classifier's real outcome space: **four** elements — `awaited`, `returned-promise`, `awaited-combinator-argument`, `unclassified`. `alias` is a **scan-set construction rule** (PLAN §9.2 item 3(b), *"already discharged by (b)"*), applied before classification, so it can never be an outcome; the ≥10-fragments-per-element floor over v1.0's five-element catalogue was unsatisfiable and would have redded on correct source, on §7.3's one row with no permitted red ever. Disjointness now bites: ruling 2 keys on the nearest preceding token, ruling 3 on the innermost unclosed delimiter, and a fragment that looks like both is generated. §4.4, §5.3 (`PROP-AWAIT-01` 4th row added) |
| F-02 | High | **Fixed, by resolution (c) — route each constant through an existing observable surface.** (a) `PROP-ROUND-01` weakens at L1 to *width **invariance** across all inputs*; the width **identity** moves to `PROP-WINDOW-01` at L2, where TSPEC §7.1 edit 5 exposes `MAX_REVIEW_ROUNDS` as `reviewLoop`'s returned `iterations` **count** (edit 4 renders the same count into the prompt, giving a third surface). §5.2's `PROP-ROUND-01` row is rewritten to a mutation that actually kills invariance (width from `present.size`); the off-by-one moves to a new `PROP-WINDOW-01` (3rd) row. (b) `PROP-EPISODE-01` asserts `(1 + I) × B` from an observed `I` and a **saturation-measured** `B`. v1.0's "asserted against the constants" is recorded as withdrawn in §4.1, §4.3, §5.4 and §6.5; §6.5 now names the surface precisely and §8.5 records what remains unwritable |
| F-03 | High | **Fixed.** The 36 is TSPEC §4.5's *"worst-case dispatch count for **one phase**"*. The interleaving is partitioned into maximal per-phase segments, the bound asserted **per segment**, and the multi-phase total stated as the sum over segments and explicitly **not** bounded by 36 — which removes v1.0's (i)/(iii) contradiction. New floor: ≥10 interleavings spanning two or more segments; new §5.3 row `PROP-EPISODE-01` (4th) |
| F-04 | High | **Fixed.** The sole-differing-coordinate floor covers the **four externally controllable** coordinates (`artifactSet`, `phase`, `round`, `mode`). `invocation` is TSPEC §4.5's subject-derived counter (*"monotonic within (artifactSet, phase, round, mode)"*; *"without `invocation`, the counters have nothing to increment"*) and no seam lets a test set it, so it gets its own differently shaped conjunct: with the four held fixed, re-entry **consumes** the same budget rather than receiving a fresh one. §5.3's `PROP-EPISODE-01` (2nd) row is replaced with the matching subject mutation; §8.5 item 2 records the direct statement as unwritable |
| F-05 | Medium | **Fixed — the workaround was over-sold and is now stated honestly.** Measured: `driftGenerators.js:423` `BYTES_FLOOR = 64`; the `"bytes"` arm returns `[]` at or below 64 bytes and **one** truncation rung above. For `PROP-HASH-01` and `PROP-STALE-01` it is a **guaranteed no-op**, not a weak ladder. §2.3, §8.2's table and the affected `Shrink.` lines now say so; the file-local ladder is stated as the mechanism for every property here. Declining to extend `shrink` stands (PLAN §7.2) |
| F-06 | Medium | **Fixed.** The exit catalogue's owner is **TSPEC §2.5**, and it has **five** entries (forced, unforced-with-no-candidate, unforced-not-approving, `STALE`, `UNEVALUABLE`, plus an open *"or any exit added later"*). `FRESH` is not a sixth exit — it is a path that must not reach step 5, and carries its own negative assertion and a ≥10-case floor. §5.3's `PROP-GINV-01` (3rd) falsifier — which mutated the *test's* catalogue — is replaced by a **subject** mutation (step G moved inside the `STALE` branch, so the forced and no-candidate exits reach step 5 ungated). §5.4 rewritten: one specification-level falsifier is deliberate, two would have been a habit |
| F-07 | Medium | **Fixed** in the §3 pass. D8 is bounded to PLAN §9.2 item 3's stated domain (*"two files, top-level functions unindented, no nested combinator calls anywhere at HEAD"*); regex literals and nested combinator calls are withdrawn from the draw instructions, and a lexically ambiguous fragment's expected outcome is `unclassified`, never "no site found" |
| F-08 | Medium | **Accepted and restated.** §4.4 now claims a **total partition of the scan set `S`**, discharging the obligation as a **cover** — it does not claim every seam call in the file is in `S`. TSPEC §8.5's anonymous-arrow exemption is *"inherited by nobody"*, i.e. sound at HEAD and unsound in general; §8.4 residual 4 records it, naming both `orchestrate-dev.js:1866` (the `batch.map((task) =>` arrow) and `:1867` (the `agentFn(` call PLAN §4.1's advisory list names) — both line numbers are correct, for different things |
| F-09 | Low | **Fixed.** §6.1 re-measured: `__tests__/fixtures/` holds **two** entries (`covered-violations/`, `tmpGitFixture.js`); `__tests__/helpers/` holds **thirteen** modules |
| F-10 | Low | **Fixed** in the §2 pass — the baseline wall time is stated as machine- and load-dependent, with PLAN §4.1's 300 s halt as the operative figure rather than a reproduced number |
| F-11 | Low | **Fixed.** §8.3 says the queue row Order 9 is the row **reserved for** the authoring contract, and states as measured that `docs/pdlc-authoring-contract/` does not exist on disk. v1.0's "already owns" read as though the successor surface were in place |

**SE questions.** **Q-01** — TSPEC §2.5 owns it; the falsifier that mutated the test's copy is
replaced by a subject mutation (F-06). **Q-02** — no: §4.8 does not export, §3.7 has no width
parameter, §8.4 bars the filesystem. Resolution **(c)** is taken (F-02). **Q-03** — **all** §4 floors
are forced, and every §4 non-vacuity paragraph now says so explicitly; none is sampled. **Q-04** — the
100-fragment round-trip is intended to carry the guarantee from batch 2, and the rebuilt four-element
catalogue is what makes that safe: v1.0's catalogue would have redded a no-permitted-red row on
correct source, which is exactly the `H-h` halt the question anticipates.

#### Product-manager findings

| ID | Sev | Disposition |
|---|---|---|
| F-01 | High | **Fixed.** `PROP-COMPLETE-01` restated against `isComplete(artifactClass, docType, fileText) → { complete } \| { complete, missing[] }`: headings **within one document's text**, `R ⊆ S` where `S` is the headings with **non-empty bodies**, `missing` asserted as set-equal to `R \ S` (the positive-presence conjunct), extras-never-subtract as a differential, and both directions of the body criterion — `TBD`/`TODO`/`_TBD_`/HTML comment **empty**, fenced-`TBD` **non-empty** per §5.9's accepted shallowness. v1.0's boolean-over-present-sets statement is recorded as withdrawn. Dependent text fixed in §5.2 (rows rewritten, two added), §6.4 and §7.2 |
| F-02 | High | **Fixed.** The partition is TSPEC §8.2's, over `parseReviewFilename`'s split — `entries` / **other-doc-type** / `skipped` — cited, not re-worded. v1.0's *in-window / out-of-window / not-a-review* classes had no home for a well-formed cross-review of another doc type, so its conservation sum was **false on a correct implementation**; PLAN §7.2 names that weaker form as one that must not be reintroduced. New floor: ≥20 other-doc-type cases. New §5.2 row `PROP-ROUND-01` (3rd) |
| F-03 | High | **Fixed.** `PROP-STALE-01` restated over `"UNEVALUABLE" \| "STALE" \| "FRESH"`: the shape guard as an `iff`, digest equality past it, `"UNEVALUABLE"` never returned past the guard. Four `UNEVALUABLE` anchor shapes with ≥5 cases each. v1.0's "absent/malformed anchor is stale" is withdrawn; its "treat a missing anchor as fresh" ledger row was unimplementable against `isStale`'s arity and is withdrawn with two rows put in its place. TSPEC §6.2 rows 6–7's other `UNEVALUABLE` classes (absent, duplicated, unreadable) are named and routed to `PROP-APPROVE-01` at the seam |
| F-04 | High | **Fixed.** `PROP-RESOLVE-01` moved to **L2**, driven through `main()` and the seam doubles, per PLAN §11.5 `N-b` (*non-exported, and no test may name it*). The sixteen-vector enumeration is unchanged. §4.2 is now three properties, §7.1's Level cell reads L2, and §7.3's pyramid is re-derived to **ten L1, seven L2, one L3** (17 properties, 18 ids) |
| F-05 | Medium | **Fixed.** `PROP-SCAN-01` restated over the **visitor's observation set** — `scanLines(text, visit)` returns `undefined`, so v1.0's return-value conservation identity is withdrawn. Conjuncts: totality, `V ∪ F` partition, conservation against `text.split("\n").length`, fence discipline, positional fidelity |
| F-06 | Medium | **Fixed throughout.** Generator ids re-derived against §3.2's owning table: `PROP-SCAN-01` and `PROP-TRAILER-01` → **D2**; `PROP-NAME-01` and `PROP-ROUND-01` → **D1**; `PROP-RESOLVE-01` and `PROP-APPROVE-01` → **D1 × D6** (v1.0 cited `D4 × D2` and `D2 × D4`, the heading-set and fenced-markdown domains) |
| F-07 | Medium | **Fixed — window re-derived, not accepted.** `PROP-TRAILER-01`'s greening task is **RLH-05(f)** (batch 3), not RLH-23, so the correct window is **green from batch 3, permitted red none** — tighter than the pacing row it shares a file with. §4.2 states the gate loss the pacing row would have licensed (four batches of permitted red for a subject correct on arrival); §1.3 records this as the one place the mechanical derivation departs from the row co-location suggests; §7.1 updated. Its assertions must be gate-separable from the pacing assertions in the same file, which §7.3's per-assertion structure already expresses |
| F-08 | Medium | **Fixed** in the §3 pass. D6's phase axis is **seven** — `R, F, T, D, P, PR, CR`, PLAN §4.1's measured `reviewLoop`/`checkConverged` call sites — not `parseForcePhases`'s six forceable phases. `DOD` is excluded with a stated reason (no `reviewLoop` call site). `PROP-LIST-01a`, `PROP-GINV-01` and `PROP-WINDOW-01` inherit the corrected axis; §6.5's catalogue bullet now distinguishes the two |
| F-09 | Medium | **Fixed** in the §2 pass, per ruling R-5's fix-by-deletion: §2.3's "Applies to" lists are gone, each property's `Shrink.` line owns its own disposition, and the 64-byte/one-rung limit is stated once and cited from §8.2 |
| F-10 | Medium | **Fixed — falsifiers named, no Residual filed.** `PROP-DIGEST-02` (3rd): make `utf8Bytes` throw on a lone surrogate — kills totality, conjunct (i). `PROP-DIGEST-02` (4th): memoise the digest keyed by pre-canonical text — kills determinism, conjunct (ii), while the shape conjunct and the known-answer vectors survive. DC-03 does not permit a Residual where a mutation exists |
| F-11 | Medium | **Fixed.** The width conjuncts are bounded to the `ok: true` branch; TSPEC §5.2 step 5's `{ ok: false, reason: "malformed_round_one_duplicate", role }` is stated as a **fourth outcome** and generated deliberately, with a ≥10-case floor, rather than excluded by a generator constraint left unstated |
| F-12 | Low | **Fixed.** `PROP-HASH-01`'s greening sub-group corrected to **RLH-05(f)** (the five record parsers); v1.0 wrote RLH-05(d), the digest family. Both are batch 3, so the window is unaffected — but §1.3's derivation is stated as mechanical, and the sub-group letter is an input to it |
| F-13 | Low | **Fixed.** TSPEC §3.7 exports no filename formatter, so `compose` **is written in the test**; v1.0's "not a second implementation in the test" claim had no production surface to bind to and is withdrawn, with the **rejection direction** stated as carrying the property's weight. The parse field is `round`, not `version` (§5.2 row corrected too), and failure is `{ ok: false, reason: FilenameFailure }` over the closed `FILENAME_FAILURES` catalogue |

**PM rulings.** **R-1** — accepted; §8.1 reports upward and amends nothing, and now also answers
whether the count closes the gap *in substance* (it does not, for the two recognisers covered only
jointly — Q-03). **R-2** — accepted; the measurement stands, the over-claim is removed (SE F-05,
PM F-09). **R-3** — noted; §7.1's rows are re-derived again here, with two changed cells
(`PROP-RESOLVE-01`'s Level, `PROP-TRAILER-01`'s row and window). **R-4** — accepted; §8.5 no longer
understates it, and now carries **three** items rather than one. **R-5** — accepted; DC-08 deferrals
are satisfied and both routings verified, with §8.3's wording corrected per SE F-11, and
`extractRecommendation` remains **explicitly declined, not deferred**.

**PM questions.** **Q-01** — the 179.8 s figure was an unloaded measurement; §2.5 now says so and
defers to PLAN §4.1's 300 s halt. The 100-case budget stands: all 17 properties are L1/L2, ≈1,700
cases, single-digit seconds of CPU. **Q-02** — §8.4 residual 3 is re-counted to **seven** of seventeen,
following `PROP-RESOLVE-01` to L2. **Q-03** — answered in §8.1: the count closes four of six, but two
of those four are closed only *jointly*, so §8.1's universal remains open in substance for
`parseRevisionComplete` and `parseResolvedMarker`.

**Not reopened.** TSPEC §8.1 vs §8.2 (reported upward, per R-1); the `shrink` extension (declined per
PLAN §7.2); `extractRecommendation` (declined); the approved REQ/FSPEC/TSPEC/PLAN.

## 1. Overview

### 1.1 What this document decides

Seventeen properties, each one an invariant over a generated input space rather than over a hand-picked
example. Each carries five things, and a property missing any of them is not finished:

1. a **stable id** (`PROP-{DOMAIN}-{NN}`), unique in this document and namespaced away from both the
   FSPEC's `AT-{N}` range and the PLAN's fifteen `RLH-`-prefixed non-AT ids (PLAN §7.5);
2. the **invariant**, stated precisely enough that two engineers write the same assertion;
3. the **generator strategy**, built on the primitives `__tests__/helpers/driftGenerators.js` already
   ships (§3);
4. the **falsifying condition** — a named mutation to `pdlc/workflows/orchestrate-dev.js` (or its
   sibling) that turns the property red, recorded in §5;
5. the **owning task** from PLAN §4, or an explicit statement that the property is verification-only.

### 1.2 The floor of seven, and why this document carries more

TSPEC §8.2 names **seven** properties — one per component in a table it owns — and PLAN §7.2 restates
that table's two corrections. Those seven are the floor. They are reproduced here as
`PROP-DIGEST-01/-02`, `PROP-SCAN-01`, `PROP-NAME-01`, `PROP-ROUND-01`, `PROP-FORCE-01` and
`PROP-COMPLETE-01`, **citing** §8.2 rather than restating its wording, because §8.2 owns them.

The ten beyond the floor are derived, not invented, and each closes a gap this document had to
measure rather than assume:

- **TSPEC §8.1 and §8.2 do not agree on the count.** §8.1 says *"Every parameterisable component in
  the L1 row carries at least one property"*, and the L1 row is `every parser, sha256Hex, scanLines,
  isStale, isComplete, deriveRoundWindow, parseForcePhases, updateQueueStatus`. §8.2's table has seven
  rows and leaves **`parseApprovalHash`, `parseRevisionComplete`, `parseResolvedMarker`,
  `extractRecommendation`, `isStale` and `updateQueueStatus`** without one. `PROP-HASH-01`,
  `PROP-TRAILER-01`, `PROP-RESOLVE-01` and `PROP-STALE-01` close four of those six; §8 records the
  two that are deliberately left open and why.
- **Four invariants in the TSPEC are stated as invariants and proved only by enumeration.** `G-INV`
  (§2.5), the `ListFailure` disposition table (§4.2), `S-INV` with its 36-dispatch bound (§4.5,
  §5.6.1), and §8.5's await-classification rulings are each written as a **predicate over paths or
  positions, never as a list of the sites that satisfy it today** — and each is currently discharged
  by an AT that enumerates four exits, two call sites, one interleaving or three shipped lines
  respectively. A predicate stated over a space and checked at four points is exactly the shape a
  generated quantifier is for. `PROP-GINV-01`, `PROP-LIST-01a/-01b`, `PROP-EPISODE-01` and
  `PROP-AWAIT-01` are those four quantified.
- **Two more** — `PROP-APPROVE-01` (TSPEC §5.4's unanimity, a conjunction over a reviewer pair × two
  carriers) and `PROP-WINDOW-01` (§11.5's `N-a` threading over arbitrary start indices) — generalise
  assertions the PLAN already owns at a single point.

### 1.3 Relationship to PLAN §7.3, the permitted-red ledger

**PLAN §7.3 is the gate, and this document does not amend it.** §7.3 carries the seven floor
properties inside four of its rows (`scanLines property`, `both digest properties`, `both
round-derivation properties`, `parseForcePhases catalogue-closure`, `isComplete property`). The ten
new properties are named in no ledger row, because the PLAN converged before they existed.

Each new property therefore declares, in §7's coverage matrix, the `Green from` batch and
`Permitted red` window it **would** occupy, derived mechanically from the batch of its greening task
— the same derivation §7.3 uses. Adopting those rows into §7.3 is a mechanical PLAN edit owned by the
property's implementing task; it is not deferred work and it needs no new surface. Where a new
property's derived window is **identical** to an existing row's, this document says so and the
property rides that row rather than proposing another.

**Measured outcome: nine of the ten ride an existing row; one does not.** Each new property shares a
file, a writing task and a **greening task** with an assertion §7.3 already carries, so its derived
window is by construction that row's window — `PROP-HASH-01` rides the digest row, `PROP-STALE-01` the
`RLH-AT-15/-16/-18` row, `PROP-LIST-01b` and `PROP-EPISODE-01` the
`RLH-AT-35 … -58` row, `PROP-RESOLVE-01` and `PROP-APPROVE-01` the `RLH-AT-08 … -57` row,
`PROP-LIST-01a` and `PROP-GINV-01` the `RLH-AT-21 … -34-orch` row, `PROP-WINDOW-01` the
`RLH-LOOP-01`/`-02` rows, and `PROP-AWAIT-01` the green-on-arrival `RLH-SCAN-01` row.

**The exception is `PROP-TRAILER-01`** (PM F-07). v1.0 gave it the `RLH-AT-35 … -58` pacing row on the
strength of the *file* it is written in. But the derivation stated above keys on the **greening task**,
and `PROP-TRAILER-01`'s is **RLH-05(f)** — the five record parsers, batch 3 — not RLH-23. Applying the
stated rule honestly gives **green from batch 3, permitted red none**, which is tighter than the row it
shares a file with; §4.2 states the gate loss the pacing row would otherwise license. This is the one
place the mechanical derivation produces a window §7.3 does not already carry, and saying so is
cheaper than letting a co-location argument quietly widen a gate.

**For the nine that ride a row, adding the property's name to that row's `Assertion(s)` cell is the
whole of the mechanical PLAN edit.** §7's matrix records the row each of the nine rides.

**`PROP-TRAILER-01` needs a genuinely new §7.3 row, and this is it** (SE F-20 / PM F-04; v1.1's
closing sentence — *"a property that would need a genuinely new row is a defect in the property, and
none here does"* — is **withdrawn**, because §7.1's own `Row` cell for this property reads *own row*
and no existing §7.3 row carries the pair *green batch 3 / permitted red none* in
`pacingWrapper.test.js`):

| Assertion(s) | File | Written by (batch) | Green from | Permitted red |
|---|---|---|---|---|
| `PROP-TRAILER-01` | `__tests__/pacingWrapper.test.js` | RLH-21 (batch 3) | **batch 3** | **none** |

Adopting that row is a mechanical PLAN edit owned by **RLH-21**, the property's writing task; §7.3's
per-assertion structure already expresses the one thing it needs — that these assertions gate
separably from the pacing assertions in the same file. What stays closed is the PLAN's *content*: no
property here needs a window §7.3's own derivation rule would not produce, and the rule was applied,
not bent.

Where a property lands in a file with a **sole** owning task (PLAN §5.3's single-writer rule), that
task is the owner. Where an invariant genuinely spans two files, it is split into two named halves
with distinct jest ids and one owner each — the same construction PLAN §7.4 uses for
`RLH-AT-30-module` / `-30-orch`. No property is owned twice.

### 1.4 What is out of scope here

- **Oracle *wording* for the example-based ATs.** FSPEC §19 owns AT-01…AT-66 and TSPEC §8.3 maps them
  to files. A property that merely re-ran one AT over generated inputs would be weak; §7's matrix
  states, per property, what it covers that the examples cannot.
- **Any change to the seven-name reviewer/doc-type catalogues, the halt strings, or the constants.**
  Those are TSPEC §4.1, §4.8 and §6.4 literals. Fixtures here **cite** them (§6.1) and never retype
  them.
- **A shared generator module.** PLAN §7.2 records the decision that domain generators stay per-file,
  file-local and unexported, and that a second *primitive* library is not written. That decision was
  reviewed and accepted twice; §3 builds on `driftGenerators.js` and proposes nothing beside it.

## 2. Conventions

### 2.1 Identifier scheme and classification

`PROP-{DOMAIN}-{NN}`, with `DOMAIN` ∈ `DIGEST`, `SCAN`, `NAME`, `ROUND`, `FORCE`, `COMPLETE`, `HASH`,
`TRAILER`, `RESOLVE`, `STALE`, `LIST`, `APPROVE`, `GINV`, `EPISODE`, `WINDOW`, `AWAIT`. A property
with two halves takes a letter suffix (`PROP-LIST-01a`, `-01b`), never a second number.

**The jest test name is `PROP-{DOMAIN}-{NN}`, unprefixed — and the domain set above was chosen by
measurement, not by taste.** PLAN §1.3 mandates the `RLH-` prefix for *acceptance tests* because
`AT-{N}` collides with the preceding feature's ids (measured: `documentOracles.test.js` carries
`AT-22 [red-until-L-06]` at HEAD). **The same hazard exists for `PROP-` ids, and this document hit
it.** Measured at HEAD, `grep -rn "PROP-" pdlc/workflows/__tests__/` returns **431 matches across 28
files**, in twenty-three domains already spoken for by the `pdlc-workflow-distribution` feature:
`PROP-PARSE`, `-BKP`, `-LOOP`, `-SEAM`, `-CLS`, `-BSL`, `-NEG`, `-SKILL`, `-MTM`, `-IMPL`, `-COMPAT`,
`-RSN`, `-ENTRY`, `-DET`, `-HARVEST`, `-PIPELINE`, `-SHIP`, `-ARTIFACTS`, `-OBS`, `-NFR`, `-GATE`,
`-MSG`, `-HERMETIC`.

One of those is a **live** `describe()` name, not prose: `pipelineWiring.test.js:235` declares
`describe("PROP-GATE-01: main() halts when Phase R reviewLoop returns converged: false", …)`. The
G-INV property drafted here was originally `PROP-GATE-01`; it is **`PROP-GINV-01`** for exactly that
reason, which also matches the TSPEC's own name for the invariant. Every one of the sixteen domains
listed above was checked individually against `__tests__/` at HEAD and returns **zero** matches
(`GINV` included). A future property in this feature must repeat that check before taking a domain —
the collision is cheap to avoid and expensive to diagnose, because two `describe`s of one name in one
run make a failure report ambiguous exactly when it matters.

Each property is classified with the te-author category table and a test level from TSPEC §8.1:

| Level | Meaning here |
|---|---|
| **L1 — pure** | string (or record) in, record out; no seam, no filesystem (TSPEC §8.4: *"L1 may not touch the filesystem"*) |
| **L2 — orchestration** | driven through `main()` or `reviewLoop` with **synchronous** doubles from `__tests__/helpers/seams.js` (RLH-02) |
| **L3 — composition/source** | reads the composition root or the module **source text**; injects nothing |

### 2.2 Seeds: literal, printed, and overridable

Every property file declares its **own literal seed constant** and passes it through
`resolveSeed(literalSeed)` from `__tests__/helpers/driftGenerators.js`. Measured at HEAD: that
function reads `process.env.PDLC_PROP_SEED`, returns the literal when the variable is unset or empty,
throws when it is set to a non-decimal string, and otherwise returns `Number.parseInt(raw, 10)`. It is
therefore both the reproducibility mechanism and the widening escape hatch, and no property file reads
`process.env` itself.

Three rules, inherited from the generator's own contract and from the preceding feature's PROPERTIES
§1.3:

1. **Reproduction is by replay, not by index.** `seeded(seed)` is a *stateful* xorshift32; case *n* is
   reproduced by replaying draws 1…*n*, never by seeking. A property that wants case 7 in isolation
   must re-run cases 1…6 first. Every property file **prints its resolved seed** in the failure
   message, so a red is reproducible from the CI log alone.
2. **The seed is a constant in the file, not a clock and not a counter.** A seed derived from
   `Date.now()` makes a red unreproducible, which is the failure mode that makes property tests get
   deleted.
3. **`PDLC_PROP_SEED` widens the drawn set; it never narrows the assertion.** A property that passes
   only under its literal seed is a defect in the property, not a licence to pin the seed.

### 2.3 Shrinking — and a measured limitation of the shipped `shrink`

TSPEC §8.2 says *"`shrink` is used for the failure report, not for the pass path."* That is the rule
this document follows. **But the shipped `shrink` does not know this feature's case shapes**, and the
implementer must not discover that at batch 2.

Measured at HEAD, `driftGenerators.js`'s `shrink(caseValue)` dispatches on `caseValue.kind` over
exactly four kinds — `"manifest"`, `"bytes"`, `"id"`, `"subRecipe"` — and its `default` branch
`return []`. Every domain this feature generates (review filenames, fenced markdown documents,
heading sets, force-phase token strings, listing shapes, episode interleavings, source fragments)
falls in the `default` branch and shrinks to **nothing**.

**What the shipped `"bytes"` arm actually buys — measured, and it is less than v1.0 claimed.**
`driftGenerators.js:453–457` at HEAD, with `const BYTES_FLOOR = 64;` at `:423`:

```js
case "bytes": {
  const bytes = caseValue.bytes;
  if (!bytes || bytes.length <= BYTES_FLOOR) return [];
  return [{ kind: "bytes", bytes: bytes.slice(0, BYTES_FLOOR) }];
}
```

It is **not a ladder**. It returns **at most one** candidate, and only when the case exceeds 64 bytes;
at or below 64 bytes it returns `[]`. The single rung is a raw byte truncation, so it splits multi-byte
UTF-8 sequences — the shapes `PROP-DIGEST-02`'s floors exist to force — and the truncated case usually
lands in a different domain and stops falsifying, at which point the walk reports the original. **This
document therefore claims one rung, never a ladder, and v1.0's "walk `shrink`'s existing ladder" is
withdrawn** (SE F-05, PM F-09, PM R-2).

Where that one rung is a **guaranteed no-op**, say so rather than imply a shrink path:

| Property | Shipped `"bytes"` rung | Why |
|---|---|---|
| `PROP-DIGEST-01`, `PROP-DIGEST-02` | useful above 64 bytes only | domain is `n ∈ 0…512`, so roughly an eighth of every corpus has no shrink step at all |
| `PROP-HASH-01`, `PROP-STALE-01` | **no-op** | the case turns on a 64-hex trailer/anchor at the document's end; truncating to the first 64 bytes removes exactly the thing being tested, so the rung never still-falsifies |
| everything else | not used | `shrink` returns `[]` for the kind |

**The table above is the sole owner of each property's disposition; a property's `Shrink.` line
restates its row here and owns nothing.** v1.2 asserted sole ownership twice for one rule — here, over
the `Shrink.` lines, and again in §3.1's `Used by` cell, over this table. The two never disagreed on
content, but "sole owner" stated twice is the shape §2.3 and §8.2 were already deleted for, so the
competing claim is **withdrawn** rather than reconciled (PM F-03, R-5). §3.1 names this table; this
table names itself; there is one owner. v1.0 declared the disposition
"one of exactly two" and then gave three memberships across §2.3, §4 and §8.2 that disagreed; the
"Applies to" lists are deleted rather than reconciled (PM F-09, PM R-5). Two mechanisms exist and a
property may use both on different parts of one case:

| Mechanism | What it is |
|---|---|
| **Shipped `"bytes"` kind** | wrap the failing text as `{ kind: "bytes", bytes: Buffer.from(text, "utf8") }` and take the single 64-byte-prefix rung, above the floor, where that prefix can still falsify |
| **File-local ladder** | a short, ordered, **explicit** ladder of strictly simpler cases declared in the property's own file, unexported, walked once. Never a search |

A file-local ladder is **not** a second primitive library and does not contradict PLAN §7.2: §7.2
forbids re-implementing `int` / `pick` / `shuffle` / `bytes` / `resolveSeed` / `shrink` **as a shared
module**, and declares domain generators file-local by design. A ladder over a domain the shared
`shrink` returns `[]` for is that same decision applied to the same domain. Nothing here re-implements
`shrink`'s four kinds; the `"bytes"` kind is *called*, not copied.

**Every ladder is bounded and terminates**: each rung is strictly simpler by a stated measure (fewer
listing entries, fewer headings, fewer tokens, fewer rounds, shorter source fragment), and the walk
stops at the first rung that no longer falsifies — which is what gets reported.

### 2.4 Runtime constraints these properties must respect (C-2)

Properties in this document divide cleanly by what they touch, and only one class is constrained by
C-2 at all:

- **The test files are ordinary ESM under `pdlc/workflows/__tests__/`.** They may `import`, may read
  `process.env` (through `resolveSeed`), and may use `Buffer` and `crypto` — measured: seven suites
  already do exactly this. C-2 governs `pdlc/workflows/*.js` **workflow sources**, not their tests.
- **The subjects, however, are workflow source.** So no property may require the implementation to
  acquire a capability C-2 forbids. Three consequences are load-bearing and are re-stated in the
  properties that depend on them: `sha256Hex` is hand-rolled pure JS with **no `crypto`, no
  `TextEncoder`, no `BigInt`** (TSPEC §5.3), so `PROP-DIGEST-02`'s oracle is the externally computed
  known-answer vectors plus determinism — **not** a comparison against `require("crypto")` inside the
  property, which would silently make the property pass on a subject that imported `crypto` and so
  breached C-2; the constants of §4.8 are **module-level and unexported**, so `PROP-ROUND-01` and
  `PROP-EPISODE-01` observe `MAX_REVIEW_ROUNDS` and `MAX_AUTHORING_DISPATCHES` only through behaviour
  (a window width, a dispatch count), never by importing them; and **every injected IO call in the
  subject is `await`ed** (§8.5), which is exactly what `PROP-AWAIT-01` quantifies.
- **`PROP-AWAIT-01` reads source text, never `dist/`.** TSPEC §8.4 forbids an L2 test reading a
  generated artifact to make a claim about source behaviour, and §8.5 explicitly permits the await
  scan over `orchestrate-dev.js` / `orchestrate-queue.js` **source** at any level.

### 2.5 Where these tests run, and how long they take

The workflow suite is run **only** as `cd pdlc/workflows && npm test`, which is
`node --experimental-vm-modules node_modules/jest/bin/jest.js` — measured from
`pdlc/workflows/package.json` at HEAD. **A bare `npx jest <file>` cannot run these ESM suites at
all**: PLAN §4.1 records, re-measured 2026-07-30, that it reports `Tests: 0 total` and exits **1**
with `SyntaxError: Cannot use import statement outside a module`, while the same file under
`npm test -- <file>` reports 20 passed and exits 0. A property "verified" with the bare form has been
verified against a suite that never ran.

**Measured baseline, re-run for this document on 2026-07-30 at HEAD `556e56d`+branch:**

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        179.795 s
```

exit 1, the single red being `documentOracles.test.js`'s intentional `AT-22 [red-until-L-06]`.

**The four counts reproduce exactly on every machine that has run them; the wall clock does not, and
v1.0 stated it as if it did.** Both round-1 reviewers re-ran the same HEAD and got the same
`1038 passed / 1 failed / 70 skipped / 1109 total` over 36 suites, with the same single red — and
**299.503 s** (SE F-10) and **331.163 s** under concurrent load (PM Q-01) against this document's
179.795 s. PLAN §4.1 itself recorded 179.2–185.4 s across five runs of one HEAD and marks the figure
**advisory, not a gate**, for this reason.

So: **the pass/fail/skip/suite baseline is the assertion; the wall clock is machine- and
load-dependent and is recorded, never asserted.** The conclusion is unchanged and is more robustly
right at 300 s than at 180 s — the suite is at or past the 180 s foreground watchdog on every machine
measured, so every suite run in this feature, including every property run, goes in the background
with a generous timeout. The per-property budget below is set from case counts and level, not from
any one machine's wall clock: all seventeen properties are L1/L2 with no spawn, no filesystem and no
`dist/` read, ≈1,700 cases in total, and the suite's critical path is the shell-spawning drift suites
(`guardMatrix`, `driftFault`, `driftSync`), which none of these properties joins.
That is a constraint on *how the properties are executed*, and it is why §4's per-property case counts
are stated as budgets rather than left to the implementer: seventeen properties drawing a thousand
cases each would put the gate past the point where anyone runs it.

**Per-property case budget: 100 generated cases by default**, stated per property where it differs,
and each property must complete within a few seconds at that budget. Exhaustive enumeration is used
wherever the space is small enough to enumerate (`PROP-LIST-01a`'s phase × failure product,
`PROP-FORCE-01`'s seven-token catalogue, `PROP-GINV-01`'s **five** gated exits × three POSTMORTEM
states) — exhaustive beats sampled whenever it is affordable, and the exhaustive cases are the ones
that cannot regress into "the generator stopped producing that shape". **Five, not six**: the exit
count is TSPEC §2.5's G-INV sentence and nothing else states it (§4.3, SE F-06); v1.0's "six" here was
a third, unowned count and is withdrawn.

## 3. Generators

### 3.1 The shipped primitives — measured, not assumed

`pdlc/workflows/__tests__/helpers/driftGenerators.js` is reused **unmodified**. Read at HEAD, it
exports eight symbols; the five this feature consumes, with their measured behaviour:

| Export | Measured signature and behaviour at HEAD | Used by |
|---|---|---|
| `seeded(seed)` | returns `{ seed, int(lo,hi), pick(arr), shuffle(arr), bytes(n) }`. Stateful xorshift32; `state = (seed >>> 0) \|\| 0x9e3779b9`, so **seed 0 silently becomes `0x9e3779b9`** — a property must not treat 0 as a distinct seed. `int` throws when `hi < lo`; `pick` throws on a non-array or empty array; `shuffle` copies (`arr.slice()`) and does not mutate its argument; `bytes(n)` returns a **`Buffer`**, not a string or `Uint8Array` | every property |
| `resolveSeed(literalSeed)` | `PDLC_PROP_SEED` override; unset or `""` ⇒ the literal; non-decimal ⇒ **throws**; otherwise `parseInt(raw, 10)` | every property file, once |
| `shrink(caseValue)` | dispatches on `caseValue.kind` over **exactly four** kinds — `"manifest"`, `"bytes"`, `"id"`, `"subRecipe"` — `default: return []` (§2.3) | `PROP-DIGEST-01/-02`, `PROP-HASH-01`, `PROP-STALE-01`. **§2.3's table is the sole owner of each one's disposition** and is not restated here. v1.0 also listed `PROP-SCAN-01`, which uses a file-local ladder |
| `genId(rng, force)` | an `M6_ID_REGEX`-conforming id, 1–64 bytes, first byte alphanumeric, body `[A-Za-z0-9._-]` | **not used** — this feature's identifiers are role slugs and doc types from closed catalogues, not free ids |
| `genStamp(rng, opts)` | a 16-byte `YYYYMMDDTHHMMSSZ` stamp | **not used** — no property here has a timestamp domain |

`enumerateLeaves`, `enumerateEvidenceVectors` and `readFaultTokens` are the drift feature's domain
enumerations and are **not** used here; `readFaultTokens` shells out through `execFileSync`, which no
property in this document needs.

Two consumption rules follow from the measurements above and are binding:

- **`bytes(n)` is a `Buffer`.** A property drawing text from it must decode explicitly — and the
  decode is part of the domain, not an incidental detail. `Buffer.toString("utf8")` on arbitrary bytes
  **replaces invalid sequences with U+FFFD**, which is a *different* generator from "arbitrary
  well-formed UTF-8 text". `PROP-DIGEST-01`/`-02` state which one they want (§4.1) rather than letting
  the encoder decide.
- **`shuffle` is pure.** Listing-order properties (`PROP-ROUND-01`) rely on that: they shuffle the same
  basename multiset repeatedly and compare results, which a mutating shuffle would silently make
  vacuous.

Verified at HEAD: seven suites already consume this file — `driftBackups`, `driftBaseline`,
`driftFault`, `driftHook`, `driftOrdering`, `driftRepoRoot`, `queueDriftGate`. It is reused, **not
re-implemented**, and this document proposes no second primitive library (PLAN §7.2, TSPEC §1.5).

### 3.2 Domain generators: five, file-local, unexported

PLAN §7.2 decides this and it is not reopened. The five domains, each built **inside** the test file
that consumes it, over the primitives above:

| Domain | Owning file / task | Draws |
|---|---|---|
| **D1 — review basenames** | `roundDerivation.test.js` (RLH-11) | conforming `CROSS-REVIEW-{role}-{DOCTYPE}[-v{N}].md` for this doc type; conforming for *another* doc type; and one mutated part per `FILENAME_FAILURES` member |
| **D2 — fenced markdown** | `scanLines.test.js` (RLH-03) | line sequences over an alphabet of fence openers (3–6 backticks/tildes, optionally indented), closers, and content lines |
| **D3 — codepoint strings** | `approvalHash.test.js` (RLH-06) | ASCII, multi-byte UTF-8, surrogate pairs, and lone surrogates; plus `\r\n` / `\r` / 0–5 trailing-newline injection |
| **D4 — heading sets** | `completeness.test.js` (RLH-12) | subsets and supersets of §5.9's per-class required headings, each with a body drawn from {non-empty, empty, `TBD`, HTML comment, fenced-`TBD`} |
| **D5 — force-phase token strings** | `forcePhases.test.js` (RLH-14) | token multisets over the valid array, `all`, casing variants, junk, and the separator alphabet `[,\s]+` |

Three more domains are needed by the properties beyond the floor, and each is likewise file-local:

| Domain | Owning file / task | Draws |
|---|---|---|
| **D6 — phase-entry configurations** | `haltAndQueue.test.js` (RLH-25) | the cross product of **phase** × {forced, unforced} × listing shape × per-role verdict × anchor agreement × document-mutation × POSTMORTEM state, for `PROP-GINV-01` and `PROP-APPROVE-01`'s gate half |
| **D7 — episode interleavings** | `pacingWrapper.test.js` (RLH-21) | per-round sequences of dispatch outcomes drawn from {progress-terminal, progress-nonterminal, no-progress, trailer-`yes`, trailer-`no`, trailer-absent, trailer-duplicated, trailer-unparseable}, over 1…`MAX_REVIEW_ROUNDS` rounds |
| **D8 — source fragments** | `runtimeBundle.test.js` (RLH-31) | synthetic JS text placing a scan-set call in one of the classified positions, plus masked positions (inside a string, template, comment) and one shape matching no ruling — **bounded to the domain PLAN §9.2 item 3 says the walk decides** (below) |

**D6's phase axis is seven, and v1.0's "six forceable phases" was the wrong axis.** `parseForcePhases`
bounds what an *operator may force* (`R, F, T, P, D, PR` — six, TSPEC §5.7 / §6.2 row 12); it does not
bound where the gate runs. PLAN §4.1's pre-flight gate measured **seven** `reviewLoop` call sites and
seven `checkConverged` call sites — **`R, F, T, D, P, PR, CR`** — and TSPEC §4.5's `EpisodeKey.phaseId`
enumerates eight (those seven plus `DOD`). D6's phase axis is therefore the **seven** call sites, and
`DOD` is excluded with a reason: it has no `reviewLoop` call site, so there is no phase-entry
configuration to generate for it. This matters most to `PROP-LIST-01a`, whose whole value is the
phase × failure product: with `CR` outside the domain, a disposition wrong only at `CR` passes
(PM F-08). `PROP-GINV-01` and `PROP-WINDOW-01` inherit the corrected axis.

**D8's fragments are never executed.** They are text handed to the bracket-depth walk (PLAN §9.2 item
3), which is the subject. Executing generated JS in a jest worker would add an evaluation channel this
feature has no use for, and a fragment that must parse is a *narrower* domain than one that must only
be scanned.

**D8 is bounded to the walk's stated domain, and that bound is load-bearing** (SE F-07). PLAN §9.2
item 3 justifies a hand-rolled walk over a parser precisely by domain: *"its input is known-shaped:
two files, top-level functions unindented, no nested combinator calls anywhere at HEAD"*, and *"a
shape it cannot decide is an unclassified site, which fails loudly"*. Two of v1.0's draw instructions
generated outside that domain:

- **Regex literals are withdrawn from the masked-region pool.** Distinguishing `const re = /[)]/;`
  from `x = a /_agent(b)/ c;` is a **lexer** problem, not a masking problem: a masking pass without
  token context either hides a real call site (a silent pass — the one failure mode this assertion is
  the sole guard against) or leaves an unbalanced `)` on the depth stack and corrupts every
  classification after it in the fragment. The masked-region pool is therefore string literals,
  template literals and comments only, all three decidable by the prescribed pass. A regex-shaped
  fragment, if drawn at all, carries expected outcome **`unclassified`** — the walk's honest-limits
  contract — and **never** the "no site is found at all" expectation.
- **Nested combinator calls are withdrawn from the draw list.** PLAN §9.2 states they do not occur at
  HEAD and the walk is not claimed to handle them.

The reason for the bound is the ledger, not fastidiousness: `PROP-AWAIT-01` rides §7.3's first row,
whose permitted red is **none, ever**, so one generated fragment the walk decides differently from the
author's hand-written `expected` is a §11.3 `H-h`/`H-k` halt in batch 2 (§4.4, answering SE Q-04).

### 3.3 Non-vacuity: every generator must prove it produced the shape it claims

The failure mode this repo has paid for twice — PLAN §4.1's await-scan count, wrong in two successive
revisions, and TSPEC §8.2's two restated rows — is a generator that silently stops producing the
adversarial case while the property stays green. Every property in §4 therefore carries a
**non-vacuity conjunct** asserted over the *generated set*, not over one draw:

1. **Every floor in §4 is forced, without exception** — not four exemplars, and not "forced where it
   matters" (answering SE Q-03). Where a property depends on a shape appearing (D1's other-doc-type
   basenames, D2's nested four-in-three fence, D5's `all` token, D7's trailer-absent outcome, and the
   ≈sixty other floors §4 states), the generator **forces** the stated minimum count
   deterministically — the same construction `genId(rng, force)` uses at HEAD for the drift feature's
   adversarial floors — and the property asserts the floor was met before asserting anything else.
   **A floor met by sampling would be a defect**: it is green at the literal seed and a seed-dependent
   red the first time somebody sets `PDLC_PROP_SEED`, which is exactly the failure §2.2 rule 3
   forbids. Forcing is also what makes the 100-case budget sufficient: the adversarial shapes are
   constructed, so each §5 mutation meets its discriminating shape at every seed rather than with high
   probability.
2. **Set-level assertions.** Where a property is a partition or a totality claim, it asserts the
   observed class multiset covers every class, so a generator drawing only one class fails loudly
   instead of passing trivially.
3. **The seed is printed with the floor counts** in the failure message, so a red says both which case
   failed and whether the set was adversarial at all.

## 4. Properties

Each entry states, in order: the **invariant**; the **generator** and its case budget; the
**non-vacuity** conjunct; the **owner** (PLAN §4 task that writes it / task that greens it); and what
it **covers that examples cannot**. The falsifying source mutation for every property is in §5, so
that the falsifiability ledger can be read end to end without navigating the bodies.

### 4.1 L1 — the seven the TSPEC names

These seven are TSPEC §8.2's table, cited not restated. Where the wording below differs from §8.2 it
is an elaboration of mechanism, never of the invariant; §8.2 governs.

---

**PROP-DIGEST-01 — `canonicaliseForDigest` is idempotent and lands in a normal form.**
*(Data Integrity · L1 · `approvalHash.test.js`)*

**Invariant.** For every generated text `t`: `f(f(t)) === f(t)`; `f(t)` ends in **exactly one** `\n`;
`f(t)` contains **no** `\r`; and `f(t)` differs from `t` only by those two normalisations — the
sequence of `\n`-separated non-empty-suffix content is preserved (positive-presence conjunct: every
line of `t`, with `\r` stripped, appears in `f(t)` in the same order).

**Generator.** D3. `rng.bytes(n).toString("utf8")` for `n` ∈ 0…512 — the U+FFFD replacement this
decode performs is *in* the domain and is exactly the byte soup the function must survive — with
`\r\n`, lone `\r` and 0…5 trailing `\n` injected at random positions. 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. The generated set must contain ≥10 cases with at least one `\r\n`, ≥10 with a lone
`\r`, ≥10 with two or more trailing newlines, and ≥5 with **zero** trailing newline — the last is the
only shape that falsifies an implementation whose N-2 rule strips rather than forces. Forced, not
sampled.

**Owner.** Written by **RLH-06** (batch 2); greened by **RLH-05(d)** (batch 3). Rides §7.3's
`RLH-AT-12,-13,-14,-17; both digest properties` row: green from batch 3, permitted red batch 2.

**Beyond the examples.** The known-answer vectors (§6.2) pin four points, and RLH-06's `RLH-AT-12`…
`-18` pin the wiring; this pins the *shape of the
output* over the whole input space, including the case §8.2 calls out — text whose only defect is a
`\r` in the middle of a line, which no vector carries.

**Shrink.** Shipped `"bytes"` kind, floor 64 bytes (§2.3).

---

**PROP-DIGEST-02 — `sha256Hex` is deterministic and total, and canonicalises internally.**
*(Data Integrity · L1 · `approvalHash.test.js`)*

**Invariant.** Three conjuncts. (i) **Totality of shape**: for every generated text `t`,
`sha256Hex(t)` matches `/^[0-9a-f]{64}$/` and never throws. (ii) **Determinism**: `sha256Hex(t)`
called twice returns the identical string, and two independently generated equal strings digest
equal. (iii) **Canonicalisation is inside**: for every `t`, `sha256Hex(t) === sha256Hex(f(t))` where
`f` is `canonicaliseForDigest` — i.e. no caller can produce a different digest by canonicalising
first, and any two texts differing only in line endings or trailing newlines digest **equal**.

**Generator.** D3, extended: ASCII, multi-byte UTF-8 (2-, 3- and 4-byte sequences composed from
`codePointAt`-valid code points), surrogate pairs (emoji), and **lone surrogates** (`"\uD800"` alone),
which is where a hand-rolled `utf8Bytes` is most likely to be wrong. 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. ≥15 cases must contain a code point above U+FFFF and ≥5 must contain a lone
surrogate; the property asserts those counts before asserting the digest. And conjunct (iii) is
asserted **only** over cases where `f(t) !== t` for at least 20 of them — otherwise it degenerates
into `sha256Hex(t) === sha256Hex(t)`, which is conjunct (ii).

**Owner.** Written by **RLH-06** (batch 2); greened by **RLH-05(d)** (batch 3); same §7.3 row as
`PROP-DIGEST-01`.

**Beyond the examples.** TSPEC §8.2 is explicit that the known-answer vectors remain the *correctness*
oracle and this is the *coverage* oracle: the vectors cannot tell you that the 837th multi-byte string
does not throw, and AT-13's "one digest function on both paths" is a wiring claim, not an input-space
claim. Conjunct (iii) is the generated form of AT-14 and is what makes AT-16's rebase invariance an
input-space fact rather than a single fixture.

**Shrink.** Shipped `"bytes"` kind.

**C-2 note (§2.4).** The oracle for correctness is the externally computed vectors in
`__tests__/fixtures/digest-vectors.js`, **never** a comparison against Node's `crypto`: a property
that compared against `crypto.createHash("sha256")` would stay green if the subject itself reached for
`crypto`, which C-2 forbids and which the bundle has no way to load.

---

**PROP-SCAN-01 — `scanLines` is total and partitions its input.**
*(Data Integrity · L1 · `scanLines.test.js`)*

**Invariant.** Stated over the **visitor's observation set**, because `scanLines(text, visit)`
*returns `undefined`* (TSPEC §3.7) — v1.0 hung the conservation identity on a return value the
function does not have, and that statement is withdrawn (PM F-05). Let `V` be the set of indices for
which `visit(line, index)` was called, recorded by a counting visitor the property supplies, and let
`F` be the fenced-and-fence-line index set the generator **constructed** (not a second scanner: the
generator knows which lines it placed inside, and which lines open and close, each fence). Then, for
every generated document `d`, in TSPEC §8.2's own words — *the visited set ∪ the fenced-and-fence-line
set is exactly the line set, disjointly*:

(i) **Totality** — `scanLines` never throws, for any input including `""`, `null` and `undefined`
(§5.0 coerces via `String(text ?? "")`).
(ii) **Partition** — `V ∪ F === {0 … d.split("\n").length - 1}` and `V ∩ F === ∅`.
(iii) **Conservation** — `|V| + |F| === d.split("\n").length`, asserted as an arithmetic identity, so
a scanner that silently skips a line fails even if every line it *does* visit is right.
(iv) **Fence discipline** — no index in `F` is ever visited; a closer must use the same fence
character and a run at least as long as the opener (§5.0 rule 1), so a three-backtick line inside a
four-backtick block is content and stays in `F`; and an unclosed fence swallows the remainder of the
file (§5.0 rule 2), so every index after the opener is in `F`.
(v) **Positional fidelity** — the `line` passed to the visitor equals `d.split("\n")[index]`, so an
off-by-one in the index cannot hide behind a correct count.

Marker classification is **not** asserted here: `scanLines` visits, and its *callers* match patterns
(§5.0's caller list). "No marker inside a fence" is therefore stated as (iv) — no fenced index is
visited — which is the same guarantee at the level that owns it.

**Generator.** D2 — fenced markdown, per §3.2 (v1.0 cited D1, which §3.2 owns as review basenames;
PM F-06). Lines drawn from four pools — verbatim marker lines (from the normative literals,
cited per §6.4, never retyped), near-miss marker lines (marker text with a leading `>` quote, leading
whitespace, altered case, or embedded inside a sentence), fence delimiters (``` and `~~~`, 3–6
characters, with and without an info string), and arbitrary prose from D3 — shuffled with
`rng.shuffle` and joined. Document length 0…120 lines. 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. ≥20 cases must contain at least one true marker line, ≥20 at least one near-miss,
≥15 at least one *balanced* fence pair with a marker **inside** it, ≥10 a **nested** four-in-three
fence (a three-backtick line that must not close a four-backtick block), and ≥5 an **unclosed** fence.
The nested and unclosed floors are the ones that matter: together they are the only shapes
distinguishing §5.0's same-char-and-length closer rule from a boolean toggle, and they are the shapes
the `quoted-verdict.md` and `unclosed-fence.md` fixtures (§6.3) pin by example. Every floor forced
(§3.3).

**Owner.** Written by **RLH-03** (batch 2); greened by **RLH-05(c)**. §7.3 row `RLH-AT-65, -66;
scanLines property`: green from batch 3, permitted red batch 2.

**Beyond the examples.** RLH-03's two ATs — `RLH-AT-65` and `RLH-AT-66` (PLAN §4.2) — pin two named
near-misses; the generator composes them
— quoted marker *inside* a fence, marker on the line that closes a fence, two markers on adjacent
lines — combinations no AT enumerates and where an ordering bug in the scan lives.

**Shrink.** File-local ladder over the line array (§2.3, second disposition): delete-half, then
delete-one, then simplify each surviving line to its pool tag. The shipped `shrink` returns `[]` for
this case shape.

---

**PROP-NAME-01 — `parseReviewFilename` round-trips, and rejects every single-part mutation.**
*(Parsing · L1 · `roundDerivation.test.js`)*

**Invariant.** Two directions, over TSPEC §3.7's return shape:
`{ ok: true, role, docType, round } | { ok: false, reason: FilenameFailure }`. The parsed field is
**`round`**, not `version` (v1.0 called it `version` throughout; corrected per PM F-13), and failure is
a **closed catalogue** — `FILENAME_FAILURES = ["not_cross_review", "bad_role", "bad_doc_type",
"bad_round", "trailing_junk"]` (TSPEC §4.1) — not a single "not a review file" outcome.

**Round-trip**: for every generated `{role, docType, round}` drawn from the valid domains,
`parseReviewFilename(compose(role, docType, round))` returns `ok: true` with those three fields equal
to the inputs.

**Rejection**: for every valid basename and every single-part mutation of it (role replaced by a
non-role token, docType by a non-docType token, the `-v{N}` segment by a non-numeric / negative /
zero-padded form, the prefix or extension altered), the parse returns `{ ok: false, reason }` with
`reason` **the catalogue member that part governs** — not a throw, not a partial parse, and not an
ad-hoc string. Catalogue closure is a conjunct: every observed `reason` is in `FILENAME_FAILURES`, and
across the corpus the observed set **equals** it.

**Where `compose` comes from — stated plainly rather than implied.** TSPEC §3.7 exports **no filename
formatter**; §5.2 supplies `CROSS_REVIEW_RE` and a prompt-side template string, and nothing else. So
`compose` **is written in the test**, and v1.0's claim that it is *"the composition the production code
itself uses, not a second implementation in the test"* had no production surface to bind to and is
**withdrawn** (PM F-13). The consequence is stated rather than hidden: a bidirectionally wrong
implementation — a grammar and a composer wrong in the same way — is invisible to the round-trip half,
so **the rejection direction carries this property's weight**, and the round-trip half is a
well-formedness check on the generator as much as on the subject. The example-based
`RLH-AT-01`…`-06`/`-63` pin literal filenames from the FSPEC and are the guard against a
co-wrong composer.

**Generator.** D1 — review basenames, per §3.2 (v1.0 cited D2; PM F-06). Product of the role
catalogue × docType catalogue × round 1…99, plus one mutation selected per case by `rng.pick` from the
five mutation classes. 100 cases, with the unversioned form (no `-v{N}`) included in the valid domain
because TSPEC §3.9 makes the suffix optional.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. All five mutation classes must appear ≥10 times each **and each must be observed
producing its own `FILENAME_FAILURES` member** — set equality against the catalogue, so a failure mode
added to `FILENAME_FAILURES` with no generator path fails the property. The valid-domain half must
cover every role and every docType at least once, likewise as set equality against the catalogues, so
adding a docType without extending the generator fails rather than silently narrowing. All forced.

**Owner.** Written by **RLH-11** (batch 2); greened by **RLH-05(e)**. §7.3 row `RLH-AT-01 … -06,
-63; round-derivation properties`: green from batch 3, permitted red batch 2.

**Beyond the examples.** RLH-11's suite pins `RLH-AT-01`…`-06` and `RLH-AT-63` — a fixed handful of
named filenames and branch states. The rejection direction is the half
examples cannot carry: it asserts a *negative over a space*, that nothing outside the catalogue parses,
which is what stops a loosened regex from silently admitting `CROSS-REVIEW-pm-REQ-v1.md.bak` — a
negative none of `RLH-AT-01`…`-06` states.

**Shrink.** File-local ladder: shorten the version number toward 1, then reduce the mutation to the
single altered character.

---

**PROP-ROUND-01 — `deriveRoundWindow` returns a fixed-width window and partitions the review files.**
*(State Machine · L1 · `roundDerivation.test.js`)*

**Invariant.** Three conjuncts, all bounded to `deriveRoundWindow`'s `ok: true` branch, plus a fourth
that owns the `ok: false` one.

(i) **The partition, as TSPEC §8.2 and PLAN §7.2 own it — cited, not re-worded.** It is stated over
**`parseReviewFilename`'s** total three-way split, not over `deriveRoundWindow`'s return: every input
basename falls in exactly one of `entries` (`ok`, **this** doc type) / **other-doc-type** (`ok`,
*another* doc type) / `skipped` (`!ok`), and `deriveRoundWindow` returns the first and third.
Conservation is arithmetic: `|entries| + |other-doc-type| + |skipped| === |basenames|`.
**v1.0's three classes were wrong and are withdrawn** (PM F-02): it stated *in-window versioned
review* / *out-of-window versioned review* / *not a review file*, which has no other-doc-type class,
so a well-formed cross-review of another doc type falls in none of the three and the conservation sum
is **false on a correct implementation** — for exactly the basenames D1 is required to force. PLAN
§7.2 names that weaker form as one of two that *must not be reintroduced*; v1.0 reintroduced it.

(ii) **Derivation, never counting.** `startIndex === max(every round index in `present`) + 1` when
`present` holds any index, `startIndex === 1` when it holds none (TSPEC §5.2 steps 3–4), and
`startIndex >= 1` always. In-window / out-of-window membership is asserted **as a predicate over
`[startIndex, endIndex]`**, which is where v1.0's second and third classes were trying to go.

(iii) **Width invariance, at the strength L1 can actually observe.** For every input,
`endIndex - startIndex + 1` is the **same value** across all cases in the corpus. It is *not* asserted
against `MAX_REVIEW_ROUNDS`: TSPEC §4.8 makes the constants module-level and **unexported**, §3.7 gives
`deriveRoundWindow(basenames, docType)` **no width parameter**, and §8.4 bars an L1 test from the
filesystem — so there is no surface at this level that exposes the constant, and v1.0's *"asserted
against the constants"* was a comparison of the subject's width with itself (SE F-02). The identity
`endIndex === startIndex + MAX_REVIEW_ROUNDS - 1` is therefore **moved to `PROP-WINDOW-01` at L2**,
where TSPEC §7.1 edit 5 makes the constant independently observable as `reviewLoop`'s returned
`iterations` field. §5.2's ledger row is rewritten to match: the off-by-one mutation
(`startIndex + MAX_REVIEW_ROUNDS`) does **not** die here — it merely changes the constant width — and
claiming it did was the wrong half of the wrong ledger row.

(iv) **The round-1 duplicate halt is the fourth outcome, not an excluded shape.** TSPEC §5.2 step 5:
a role carrying **both** the un-suffixed form and an explicit `-v1` for one doc type returns
`{ ok: false, reason: "malformed_round_one_duplicate", role }` — no `startIndex`, no `endIndex`. So
conjuncts (i)–(iii) are quantified over `ok: true` only, TSPEC §8.2's generator constraint (*"for every
listing that does not trip the round-1 duplicate halt"*) is stated here rather than dropped, and the
duplicate shape is generated **deliberately** with the halt as its expected outcome, naming the role.
v1.0 asserted the width identity *"over all inputs including the empty set"* while its own generator
would draw the duplicate (PM F-11); "all inputs" now means all `ok: true` inputs, and the empty set is
one of them.

**Generator.** D1 — review basenames, as `PROP-NAME-01` (v1.0 cited D2; PM F-06) — plus non-review
filenames (`REQ-*.md`, `LEARNINGS-*.md`, `.DS_Store`, directory names), conforming basenames **for
another doc type**, and rounds drawn to straddle the window edge. Set size 0…40, shuffled with
`rng.shuffle` (pure — §3.1). 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. ≥20 cases must carry at least one **other-doc-type** basename (the class v1.0's
partition had no home for), ≥15 at least one file **above** `endIndex`, ≥15 at least one **below**
`startIndex`, ≥10 must be the empty set, ≥20 must mix review and non-review names, and ≥10 must trip
the round-1 duplicate halt. All forced. The above-`endIndex` floor catches a window computed per-round
instead of once at the phase gate; the other-doc-type floor is what makes conjunct (i) a partition
rather than a cover with a hole in it.

**Owner.** Written by **RLH-11** (batch 2); greened by **RLH-05(e)**. Same §7.3 row as
`PROP-NAME-01`: green from batch 3, permitted red batch 2.

**Beyond the examples.** The width identity is the generated form of the H-1 fix: examples pin
`startIndex` for named branch states, the property asserts that the *sibling-field relationship*
holds for every branch state, which is precisely what a caller recomputing `endIndex` from a stale
`roundIndex` would break. It is also the only place the "derive, never count" rule is stated over the
whole input space rather than at the `RLH-AT-01`…`-06`/`-63` points that sample it (`RLH-AT-07`, the
call-site half, greens two batches later against `RLH-26`).

**Shrink.** File-local ladder: delete names, then reduce each surviving version toward `startIndex`.

---

**PROP-FORCE-01 — `parseForcePhases` is closed over its catalogue.**
*(Parsing · L1 · `forcePhases.test.js`)*

**Invariant.** Let `V = {R, F, T, P, D, PR}` and the accepted vocabulary be `V ∪ {all}`. For every
generated input: if every token is in the vocabulary, the result is `{ ok: true, phases }` with
`phases` a `Set` whose members are all in `V` (never `all` itself), `phases` equals the set of
non-`all` tokens unioned with `V` if `all` was present, and `|phases| === 6` exactly when `all`
appeared or all six were listed; if **any** token is outside the vocabulary the result is the failure
shape, and the failure names the offending token. Order-insensitivity and duplicate-idempotence are
conjuncts: `rng.shuffle` of the tokens, and any token repeated, yield an equal `Set`.

**Generator.** D5. Token lists of length 0…10 drawn from `V ∪ {all}` ∪ a pool of near-misses
(lowercase `r`, `pr ` with trailing space, `ALL`, `Rq`, empty string, `R,F` as a single token), joined
with the separator TSPEC §3.7 specifies. 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. ≥25 cases must be wholly valid, ≥25 must contain ≥1 near-miss, ≥10 must contain
`all`, ≥10 must contain a duplicate, and ≥5 must be the empty input. The valid-half floor is asserted
as *set coverage of `V`*, so a catalogue that grows without the generator growing fails here.

**Owner.** Written by **RLH-14** (batch 2); greened by **RLH-05(f)**. §7.3 row `RLH-AT-29;
parseForcePhases catalogue-closure`: green from batch 3, permitted red batch 2.

**Beyond the examples.** RLH-14's suite samples three inputs — `RLH-AT-28`, `RLH-AT-29` and
`RLH-AT-01a` (PLAN §4.2). Closure over the catalogue — that nothing
outside it is ever accepted and `all` always expands to exactly six — is a statement about the
*complement* of the catalogue, which no finite example set can make. It is also the property that
detects a seventh phase added to the runtime without being added to the vocabulary: `|phases|` stops
being 6 and the identity fails loudly rather than the phase being silently unforceable.

**Shrink.** File-local ladder: drop tokens one at a time, keeping the first that still fails.

---

**PROP-COMPLETE-01 — `isComplete` is exactly the required set, falsifiable in both directions.**
*(State Machine · L1 · `completeness.test.js`)*

**The v1.0 statement was against the wrong signature and is withdrawn** (PM F-01). v1.0 wrote
`isComplete(P)` over a *present-set of documents* `P` and a *required document set* `R`, and asserted
`isComplete(P) === true iff R ⊆ P`. TSPEC §3.7 gives
`isComplete(artifactClass, docType, fileText) → { complete: true } | { complete: false, missing: string[] }`:
three arguments, not one; a **structured record**, not a boolean; and §5.9 makes the quantified domain
the **top-level headings within one document's text**, not a set of sibling documents on disk. Every
sentence of v1.0's statement — the boolean `iff`, "extra documents beyond `R`", "the order in which
`P` was built" — was unimplementable as written. It is restated below rather than deleted, and the
dependent text in §5.2, §6.4 and §7.2 is corrected to match.

**Invariant.** Fix an `artifactClass` (one of TSPEC §5.9's four wrapped classes) and a `docType`. Let
`R(artifactClass, docType)` be §5.9's **required top-level heading set** for that pair — for the
PROPERTIES spec row, `Overview`, `Properties`, `Oracles`, `Fixtures`. Let `T` be the set of top-level
headings §5.9's matching rules recognise in `fileText`, and let `S ⊆ T` be those whose **body is
non-empty** under §5.9's criterion. Four conjuncts, over every generated `fileText`:

(i) **The `iff`, at the right level.** `result.complete === true` **iff** `R ⊆ S`. Both directions are
asserted — a subject that always returns `complete: true` dies on the `R ⊄ S` half, one that always
returns `false` dies on the `R ⊆ S` half. This is what TSPEC §8.2 means by *exact required set,
falsifiable both directions*; PLAN §7.2 additionally names **monotonicity** (`|S| >= |R|`, or "more
headings can only help") as a weaker form that **must not be reintroduced**, and the extras generated
in (iii) are what stop it hiding here.

(ii) **`missing` is exactly the shortfall, and is a positive-presence conjunct — not an absence.**
When `complete: false`, `new Set(result.missing)` is **set-equal to `R \ S`**: every shortfall is
named, no name outside `R` appears, and no name in `S` appears. This is the conjunct that makes the
oracle falsifiable rather than a status check: a subject that returns `complete: false` for the right
reason and one that returns it for the wrong reason are distinguished. When `complete: true`,
`missing` is absent or empty, and the test asserts **which** — whichever §5.9's shape gives — rather
than only that it is falsy.

(iii) **Extra headings never subtract.** Adding a heading **not** in `R` never flips a
`complete: true` result to `false` and never adds a name to `missing`. Stated as a *differential*
between two calls on the same base text — the extras-added text and the base — so it cannot be
satisfied vacuously by a text that had no extras to begin with.

(iv) **`S`, not `T` — the non-empty-body criterion carries real weight.** A heading present in the
text with a body consisting only of `TBD`, `TODO`, `_TBD_`, or an HTML comment is **absent from `S`**
and therefore appears in `missing` (TSPEC §5.9). Symmetrically, and this is the direction that
catches an over-eager emptiness test: §5.9's **accepted shallowness** rules that a *fenced block
containing* `TBD` scores **non-empty**, so such a heading is in `S` and must **not** appear in
`missing`. Both directions are forced by the floors.

**Generator.** D4, re-based on document *text*. Build `fileText` by emitting the headings of
`R(artifactClass, docType)` in `rng.shuffle` order, dropping a `rng.int(0, |R|)`-sized random subset,
appending 0…4 headings from a non-required pool (`Decisions`, `Learnings`, `Appendix`, an invented
`Foo`), and giving each emitted heading a body drawn from four kinds: ordinary prose, bare `TBD` /
`TODO` / `_TBD_`, an HTML comment, and a fenced block containing `TBD`. Heading rendering exercises
§5.9's matching rules on their own axis: case variation, extra internal whitespace, an `N.` or `N)`
prefix, and the parenthesised-alternative form. `artifactClass` and `docType` are drawn per case.
100 cases.

**Non-vacuity.** All forced, not sampled. ≥25 cases must be complete (no heading dropped, every
required body ordinary prose). ≥25 must be incomplete with exactly **one** required heading short —
the shape that separates conjunct (i) from PLAN §7.2's forbidden monotonicity check, which the extras
would otherwise satisfy. Each element of `R` must be the sole shortfall in ≥1 case, asserted as set
equality against `R`, so a heading added to the required set without the generator knowing fails here
rather than going untested. ≥10 cases must be short **only** because a heading present in the text has
a `TBD`-class empty body, and ≥10 must contain a fenced-`TBD` body under a required heading and be
**complete** — the accepted-shallowness control for (iv). ≥15 must carry extras, and ≥20 must render
at least one required heading through a non-identity matching rule (case, whitespace, `N.`/`N)`
prefix, or parenthesised alternative), so the rules are exercised rather than assumed.

**Owner.** Written by **RLH-12** (batch 4); greened by **RLH-16**. §7.3 row `RLH-AT-60, -62;
isComplete property`: green from batch 6, permitted red batches 4–5.

**Beyond the examples.** RLH-12's `RLH-AT-59`, `-60` and `-62` pin three document texts. The property
is what makes the *required heading set itself* the thing under test: it is the only assertion in the
suite that fails when a heading is quietly dropped from `R`, because it derives its expectation from
`R` and its floors from `R` simultaneously.

**Note — measured file ownership.** PLAN §4.2 assigns `isComplete`'s suite to
`__tests__/completeness.test.js` (RLH-12, a new file), **not** to the existing
`__tests__/documentOracles.test.js` — which is where the foreign intentional red
`AT-22 [red-until-L-06]` lives. This feature does not touch that file, so the foreign red stays red
(§2.5) and no property here depends on it.

**Shrink.** File-local ladder: re-add dropped headings one at a time, and replace `TBD`-class bodies
with prose one at a time, until the case passes; report the last still-failing text.

### 4.2 L1 — beyond the floor

**Three** further pure-function invariants the TSPEC's table does not name but whose subjects TSPEC
§8.1 places at L1. Each declares the §7.3 ledger window it *would* occupy (§1.3); adoption is a
mechanical PLAN edit owned by the writing task.

v1.0 said *four* and counted `PROP-RESOLVE-01` among them. It has **moved to §4.3 (L2)**: PLAN §11.5
`N-b` rules that §5.4's two-tier approval search is **non-exported and no test may name it**, and that
`RLH-24`'s `approvalSearch.test.js` drives it **through `main()` at L2** (PM F-04). An L1 property over
a function no test may name has no subject. The property's substance — sixteen exhaustively enumerated
H-4 presence vectors — is preserved intact; only its level, its seam and its ledger row change.

---

**PROP-HASH-01 — `parseApprovalHash` accepts only well-formed trailers, and never mid-document.**
*(Parsing · L1 · `approvalHash.test.js`)*

**The measure every conjunct below is stated over — read from the contract, not chosen here.** The
duplicate test is a **count**, and the count's *unit* is what v1.2 got wrong in both directions at
once. TSPEC §5.3's idempotence pre-count is *"collect the `APPROVAL-HASH:` lines outside fences"*, and
its branch table keys on that count being `0`, `1` or `≥ 2`, consulting a line's **value** only in the
two `1` rows — at `≥ 2` the disposition is fixed with no payload test at all. TSPEC §4.3 defines the
sibling `duplicated` as *"more than one such line outside fenced regions"*. The unit is therefore
**`APPROVAL-HASH:` lines outside fenced regions, counted irrespective of payload** — not well-formed
trailers — and TSPEC §5.0's `scanLines` makes the fence the only exclusion.

**Invariant.** For every generated document, let `n` be that count. Six conjuncts, all over `n`:

(i) `parseApprovalHash` returns `{ ok: true, hash, … }` **iff** `n === 1` **and** that one line is a
well-formed trailer at a position the format permits (TSPEC §4.4's grammar). Both halves are required
in both directions.

(ii) `n >= 2` returns `{ ok: false, reason: "duplicated" }` — **whatever the payloads are**. A document
carrying one valid trailer and one malformed one is `duplicated`: never a hash, and never one of the
lines arbitrarily chosen. This is where v1.2's `iff` and its `duplicated` conjunct contradicted each
other (SE F-23, PM F-01); the contradiction was in the `iff` counting trailers while the contract
counts lines, and both are now stated over `n`.

(iii) `n === 0` returns `{ ok: false, reason: "absent" }` — the **named** reason asserted on the
documents whose count is unambiguous (no trailer at all; a trailer only inside a fence), and withheld
on the two shapes where an unstated matcher decides the count, per the recorded silences below.

(iv) `n === 1` whose payload is uppercase hex, 63 or 65 hex characters, or non-hex returns
`ok: false`. Two shapes v1.3 listed here are not values of `n === 1` at all, and both are routed out
of it: a **fenced** trailer is not collected, and neither is a line under a **malformed label** — it
is not an `APPROVAL-HASH:` line — so both documents are `n === 0`, an exclusion from the count rather
than a malformed payload. The fenced-only document falls under (iii) with its named reason, because
the fence is a **stated** exclusion (TSPEC §5.0). Whether the named reason `absent` is asserted on the
malformed-label document turns on the label matcher TSPEC does not specify, so that shape is excluded
from (iii)'s named reason on the same ground as the quoted shape below; (i), (v) and (vi) still bind
on it, and both matchers answer `ok: false` (SE F-27, PM F-03).

(v) the returned `hash` always matches `/^sha256:[0-9a-f]{64}$/`, totally over the input space — the
**whole** value of the `APPROVAL-HASH:` line, label included, never the bare hex run. Measured from
the contracts, not chosen here: FSPEC §5's carrier catalogue gives the approval anchor's value as
`sha256:` + 64 lowercase hex; FSPEC §7's append shape and TSPEC §4.4's record grammar both write
`APPROVAL-HASH: sha256:{64 lowercase hex}`; FSPEC §10.5 rejects a tier-1 value that *"does not match
§7's grammar (`sha256:` + 64 lowercase hex)"*; and TSPEC §3.7 defines `approvalHashOf(text)` as
`` `sha256:${sha256Hex(text)}` `` — `sha256Hex` alone is the 64-hex half. The routing settles it in
the only direction that matters: TSPEC §5.4 binds `anchor ← parseApprovalHash(text)` and states that
*"§5.5 takes `recordedHash` from `anchor`"*, and §5.5's guard is `/^sha256:[0-9a-f]{64}$/` — so a
subject returning a bare 64-hex `hash` would make `isStale` answer `"UNEVALUABLE"` on **every**
approval and the skip mechanism would never fire. v1.3 asserted the unprefixed `/^[0-9a-f]{64}$/`
here: false on all ≥20 forced valid cases, and in contradiction with `PROP-STALE-01`, whose generator
draws `sha256:` + digest and whose conjunct (i) guards the prefixed form over the very same value
(PM F-01).

(vi) every `ok: false` return carries a `reason` that is a member of `HASH_FAILURES` (TSPEC §4.1),
asserted by membership, so a subject inventing a fourth reason string dies.

**The one thing the contract does not settle, and why no conjunct depends on it.** `scanLines`
excludes fenced regions and nothing else, so whether a `> `-quoted `APPROVAL-HASH:` line is one of the
lines §5.3's pre-count collects is not decided by any approved artifact. Under the counting reading a
quoted-only document is `n === 1` at a position the format forbids; under the not-counting reading it
is `n === 0` ⇒ `absent`. **Both are `ok: false` with a `HASH_FAILURES` member**, so (i), (v) and (vi)
hold on a conforming subject under either reading, and the *named* reasons in (ii) and (iii) are
asserted only where the count is unambiguous — unquoted, unfenced lines under an exact
`APPROVAL-HASH:` label. The property therefore states no rule the specs do not, and cannot red a
conforming subject on the quoted shapes.

**The malformed-label shape is the second instance of that same silence, and is recorded, not
resolved.** The label matcher is exactly what TSPEC leaves unstated for `parseApprovalHash` (§4.3
defines the *sibling* `duplicated` for `parseRevisionComplete`; no matcher is given here), so a
prefix-exact matcher gives `n === 0` ⇒ `absent`, while a matcher loose enough to recognise the line
gives `n === 1` at a shape the grammar forbids ⇒ `ok: false`, reason `unparseable`. Both are
`ok: false` carrying a `HASH_FAILURES` member, so (i), (v) and (vi) bind and neither named reason is
asserted — the same disposition, on the same ground, as the quoted shape (SE F-27, PM F-03).

v1.1 asserted instead that a two-trailer document *"resolves deterministically to the same one on every
run (whichever the format specifies — the property asserts stability, and §6.4 owns which)"*. **That
conjunct is withdrawn** (PM F-02): it is false on a conforming subject, and the delegation was empty —
§6.4 is the heading-fixture section and owns nothing about approval trailers. The owner is
**TSPEC §4.1**, whose `HASH_FAILURES = ["absent", "duplicated", "unparseable"]` makes `duplicated` a
`HashFailure`, and **TSPEC §6.2 row 6**, which routes it to `UNEVALUABLE`. Cited, not restated.

**Generator.** D3 prose interleaved with trailer candidates. **Each document carries exactly one
shape from this list, never a mixture** — the list is a list of *document shapes*, not of candidates
that may be combined (SE Q-01, PM Q-01; v1.2 left this to the reader and both readings were
available). A **valid** candidate line is the grammar verbatim — `APPROVAL-HASH: sha256:{64 lowercase
hex}` (FSPEC §7, TSPEC §4.4) — and every malformed payload shape varies the **hex run** while keeping
the `sha256:` label, since the label is what the *malformed-label* shape varies instead: valid;
uppercase hex run; hex run of 63 and of 65 characters; non-hex characters in the hex run; correct
`sha256:`-prefixed value under a malformed label; a valid trailer inside a fence; a valid trailer
behind a `>` quote; **two `APPROVAL-HASH:` lines outside fences — both valid, or one valid and one
malformed, since the count is payload-blind**; and **no trailer at all**. 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. ≥20 valid, ≥10 of each of the length-off-by-one shapes, ≥10 quoted-or-fenced, ≥5
double-line — **of which ≥2 are the mixed valid-plus-malformed shape**, which is what makes conjunct
(ii)'s payload-blindness non-vacuous rather than a sentence — and ≥5 no-trailer. The `quoted-hash.md` fixture (§6.3) pins the quoted case by example;
the floor makes it
a space. **The ≥5 double-line floor survives as a floor on the *rejection* shape** (PM Q-02): it is
what forces `reason === "duplicated"` — a named catalogue member, not merely `ok: false` — to be
exercised, which the hex-shape totality conjunct cannot reach, since totality quantifies over returned
hashes and a duplicated document returns none.

**Owner.** Written by **RLH-06** (batch 2); greened by **RLH-05(f)** — v1.0 wrote `RLH-05(d)`, which
is the *digest* sub-group; PLAN §4's RLH-05(f) is the five record parsers, and `parseApprovalHash` is
one of them (PM F-12). The window is unaffected, because both sub-groups land in batch 3: same §7.3 row
as the two digest properties, green from batch 3, permitted red batch 2.

**Beyond the examples.** The value-shape conjunct is a total statement about the *return* value: no
input, however malformed, produces a `hash` that is not `sha256:` + 64 lowercase hex — the exact shape
TSPEC §5.5's guard admits. That is the guarantee the comparison at the approval gate silently depends
on, and no AT states it over the input space.

**Shrink.** File-local ladder for the trailer choice, and **that ladder is the whole mechanism**. v1.0
said "shipped `"bytes"` kind for the prose"; §2.3 measures what that kind actually does
(`driftGenerators.js:423–475`): below `BYTES_FLOOR = 64` it returns `[]`, and above it returns a
**single** truncation rung. This property's prose is generated in the tens of bytes, so the shipped
kind is a **guaranteed no-op** here — not a weak ladder, no ladder. The claim that it contributes is
withdrawn (SE F-05).

---

**PROP-TRAILER-01 — the trailer catalogue is closed and its recognisers are mutually exclusive.**
*(Parsing · L1 · `pacingWrapper.test.js`)*

**Invariant.** Over the closed catalogue `TRAILER_FAILURES` and the trailer recognisers
(`parseRevisionComplete`, `parseResolvedMarker`, `parseApprovalHash`): for every generated document,
**at most one** recogniser claims any given line — the recognisers are pairwise disjoint over the line
space — and every rejection carries a reason drawn from the catalogue, never an ad-hoc string.
Catalogue closure is the second conjunct: the set of reasons observed across the generated corpus is a
**subset** of `TRAILER_FAILURES`, and (with the floors below) equals it.

**Generator.** D2 line pools as `PROP-SCAN-01` — v1.0 cited D1, which is the *filename* domain
(PM F-06) — biased toward trailer-shaped lines: each of the three
recognisers' verbatim forms, each with one mutation from the catalogue's own failure taxonomy
(wrong case, trailing content, quoted, fenced, missing payload). 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. Every member of `TRAILER_FAILURES` must be observed ≥1 time — asserted as **set
equality** against the catalogue, which is what makes this a totality check (DC-01) and not a sampling
check: a failure mode added to the catalogue with no generator path fails the property.

**Owner and window — re-derived from the greening task, not from the file it shares.** Written by
**RLH-21** (batch 3); greened by **RLH-05(f)**, PLAN §4's five-record-parser sub-group, which is where
`parseRevisionComplete`, `parseResolvedMarker` and `parseApprovalHash` all become correct. RLH-05(f)
lands in **batch 3**, the same batch the property is written in, so the correct window is
**green from batch 3, permitted red none** (PM F-07).

v1.0 gave the property §7.3's `RLH-AT-35 … -54, -58, -43a, -61-loop` **pacing** row — green from
batch 7, permitted red batches 3–6 — on the grounds that it is written into `pacingWrapper.test.js`.
That is a co-location argument, not a dependency argument. Adopting the pacing row would license four
batches of permitted red for a property whose subject is already correct on arrival, and a real
regression in a record parser during batches 4–6 would be **absorbed as expected red rather than
halting the batch**. That is the gate loss, stated plainly, and it is why the window is re-derived. The
consequence for the writing task is that `PROP-TRAILER-01`'s assertions must be **gate-separable**
from the pacing assertions sharing the file — an ordinary per-assertion ledger row, which §7.3 already
expresses.

**Beyond the examples.** Mutual exclusion is a *cross-recogniser* claim. Each AT exercises one
recogniser; nothing in the FSPEC asserts that a line the revision-complete recogniser accepts is not
also accepted by the resolved-marker recogniser, which is the failure mode that would let one round's
trailer satisfy another round's gate.

**Shrink.** File-local ladder over the line array; identical mechanism to `PROP-SCAN-01`.

---

**PROP-STALE-01 — `isStale` is a three-valued verdict: guard, then digest equality, stable under canonicalisation.**
*(Data Integrity · L1 · `approvalHash.test.js`)*

**`isStale` is three-valued, not boolean — v1.0's statement is withdrawn** (PM F-03). TSPEC §3.7:
`isStale(recordedHash, documentBytes) → "UNEVALUABLE" | "STALE" | "FRESH"`. v1.0 asserted
"`isStale` is `true` **iff** …" and said "absence of an anchor is stale by definition, and a malformed
anchor is stale, never an error" — both wrong on the shipped contract: a malformed or absent anchor is
**`"UNEVALUABLE"`**, which is a *third* verdict and, per TSPEC §2.5, one of the gated exits, not a
synonym for `"STALE"`. Restated:

**Invariant.** For every generated (recorded-anchor, document-bytes) pair, three conjuncts.

(i) **The guard is exactly the shape test.** `isStale` returns `"UNEVALUABLE"` **iff** `recordedHash`
fails `/^sha256:[0-9a-f]{64}$/` (TSPEC §5.5). Asserted as an `iff`, so neither an over-strict guard
(rejecting a well-formed anchor) nor an under-strict one (admitting a 63-character payload, uppercase
hex, or a missing `sha256:` label) survives.

(ii) **Past the guard, it is exactly digest equality.** When the anchor is well-formed,
`isStale === "FRESH"` **iff** `approvalHashOf(documentBytes) === recordedHash`, and `"STALE"`
otherwise. `"UNEVALUABLE"` is **never** returned on this branch — the negative half that stops a
subject collapsing the three-valued return to two.

(iii) **Normalisation-stability, at the caller.** Following `PROP-DIGEST-02`(iii): a document edited
only in line endings or trailing whitespace is `"FRESH"` against the pre-edit anchor; a document
edited in any content byte is `"STALE"`. Both are asserted against the **verdict string**, not a
truthiness test, so a subject returning `"UNEVALUABLE"` for everything cannot pass the stale half by
accident.

**The upstream classes that also produce `UNEVALUABLE`, and who actually asserts each.** TSPEC §6.2
rows 6–7 map an **absent**, **duplicated** or **unparseable** anchor, and an **unreadable document**,
to `"UNEVALUABLE"`. Of those, only *unparseable* reaches `isStale`'s own signature — absence,
duplication and unreadability are resolved before the call, by `parseApprovalHash` and by the reader.
v1.1 routed all three to *"the seam, by `PROP-APPROVE-01` (§4.3)"*. **That routing sentence is
withdrawn** (PM F-03): `PROP-APPROVE-01`'s three conjuncts are tier discipline, window respect and
idempotence, its generator never produces an absent, duplicated or unreadable *approval-hash anchor*,
and it carries no floor over the three. A claimed division with an empty side closes the residual
ledger against a live gap, which is worse than the gap. The honest division is:

| `UNEVALUABLE` class | Owner in this document |
|---|---|
| `unparseable` anchor | **`PROP-STALE-01`** conjunct (i), ≥5 cases in each of four malformed shapes |
| `duplicated` trailer | **`PROP-HASH-01`** — named-`reason` conjunct (ii), ≥5 double-line floor |
| `absent` trailer | **`PROP-HASH-01`** — named-`reason` conjunct (iii), ≥5 no-trailer floor |
| **unreadable document** | **nobody** — no property here covers it, and as of v1.3 **no queue row charters it either**; recorded as an unowned residual in §8.4 residual 6, with the action that would give it an owner stated there (PM Q-01, PM F-02) |

**Generator.** D3 document plus an anchor produced by one of: `sha256:` + digest of the document
(fresh), `sha256:` + digest of a one-byte-mutated copy (stale), `sha256:` + digest of a
line-ending-only-mutated copy (fresh — the discriminating shape), `sha256:` + a random 64-hex string
(stale), and four **`UNEVALUABLE` shapes**: the label omitted, the payload 63 or 65 characters,
uppercase hex, and a non-hex payload. 100 cases.

**Non-vacuity.** All forced. ≥20 fresh, ≥20 content-stale, ≥15 line-ending-only, and ≥5 of **each** of
the four `UNEVALUABLE` shapes — the per-shape floor is what makes conjunct (i)'s `iff` a guard test
rather than a single sampled rejection. The line-ending-only floor is the point of conjunct (iii): it
is the only shape that fails an implementation comparing raw text instead of digests, and it is the
AT-16 rebase scenario stated as a space.

**Owner.** Written by **RLH-06** (batch 2); greened by **RLH-16** (staleness conjunct) and
**RLH-26** (gate conjunct) — §7.3's `RLH-AT-15, -16, -18` row: green from batch 8, permitted red
batches 2–7.

**Beyond the examples.** `RLH-AT-15`, `-16` and `-18` sample three edits. The property covers the *edit space*: any
mutation whatsoever is `"STALE"` unless it is a normalisation, which is the exact contract the approval
gate needs and the one a whitespace-tolerant comparison would violate silently.

**Shrink.** The anchor kind is one of eight tags, reported verbatim — and that report **is** the
shrunk counterexample, because the anchor tag is the coordinate that distinguishes all three verdicts.
v1.0 also credited the shipped `"bytes"` kind for the document; §2.3 measures that kind as returning
`[]` below 64 bytes and one truncation rung above, so on D3 documents it contributes **nothing**. That
credit is withdrawn (SE F-05). The document is not shrunk; it does not need to be.

### 4.3 L2 — orchestration invariants

These run against `orchestrate-dev.js`'s injected seams (`__tests__/helpers/seams.js`), synchronously
doubled, with **no filesystem**. Every injected call the subject makes is `await`ed in the subject
(C-2 consequence); the doubles are sync, so the properties assert on the *recorded call log* the
doubles accumulate, never on timing.

**PROP-RESOLVE-01 — approval-anchor resolution is a function, and unanimity needs four facts.**
*(State Machine · **L2** · `approvalSearch.test.js`)*

**Moved from §4.2 (L1) — the level was wrong, the property is not** (PM F-04). PLAN §11.5 answers
`N-b`, "the name of §5.4's two-tier approval search", with: **non-exported, and no test may name it**;
`RLH-24`'s `approvalSearch.test.js` drives it **through `main()` at L2**. v1.0 placed this property at
L1 and, in doing so, silently proposed the export PLAN §11.5 refused. The sixteen-vector enumeration
below is unchanged; what changes is the seam it is driven through and the ledger row it occupies.

**The seam.** The corpus is presented through the **enumeration and read doubles** in
`__tests__/helpers/seams.js`, and the verdict is read from the **recorded call log** — which phase the
gate reaches, and with what anchor — exactly as the other L2 properties do (§4.3 preamble). Nothing in
the test names the search function; a rename of it breaks no assertion here, which is precisely the
outcome `N-b` was protecting.

**Invariant.** For every generated review corpus: (i) resolution is **deterministic** — the same
corpus, however its file list was shuffled, resolves to the same verdict/anchor pair; (ii)
**unanimity requires all four facts simultaneously** — both roles' verdicts *and* both roles' anchors —
so for every generated corpus missing any one of the four, the result is *not unanimous*, and for
every corpus carrying all four with matching anchors it *is*; (iii) an anchor that does not match the
current digest never contributes to unanimity regardless of the verdict beside it.

**Generator.** **D1 × D6** — review basenames crossed with phase-entry configurations. v1.0 cited
"D4 × D2", which are the *heading-set* and *fenced-markdown* domains and have nothing to do with an
approval corpus (PM F-06). A corpus is a set of per-role records, each independently carrying or
omitting a verdict and carrying a matching / stale / absent anchor; D6 supplies the verdict × anchor
× document-mutation axes, D1 the basenames they are filed under. The 4-fact presence vector is
enumerated exhaustively (16 combinations) and each combination is then dressed with random file
ordering and random extra non-review files. 100 cases ≥ 16 combinations × ≥6 dressings.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. All 16 presence combinations must appear (set equality against the enumeration, not a
count) and ≥15 cases must carry a **stale** anchor alongside an approving verdict — the H-4 shape.

**Owner.** Written by **RLH-24** (batch 3, sole owner of `approvalSearch.test.js`); greened by
**RLH-26**. Would occupy §7.3's `RLH-AT-08 … -11, -56, -57` row: green from batch 8, permitted red
batches 3–7. The move to L2 does not disturb this: PLAN already assigns RLH-24 an L2 file, so the row
was always the row of an L2 suite — v1.0's *level* label was the thing out of step with it, and that
mismatch is itself evidence the L1 placement was never derived from the PLAN.

**Beyond the examples.** This is the enumeration the H-4 defect proves examples missed: the ATs sample
three of the sixteen presence vectors. Exhaustive enumeration of the vector, with randomised dressing,
is what turns "we tested unanimity" into "unanimity is exactly this conjunction".

**Shrink.** File-local ladder: drop dressing first (extra files, ordering), then reduce to the bare
presence vector — the shrunk counterexample is a 4-bit string, which is the report you want.

---

**PROP-LIST-01a — `ListFailure` disposition is total at the phase gate.**
*(Error Handling · L2 · `haltAndQueue.test.js`)*

**Invariant.** For every failure the enumeration seam can report, the phase gate reaches exactly one
disposition from TSPEC §4.2's table: `dir_missing` is **benign** (the phase proceeds with an empty
review set) and each of `not_a_directory`, `unreadable`, `bad_argument` **halts** with the message
`Cannot enumerate {dirPath}: {reason}` — the literal owned by §4.2 and cited, not retyped (§6.4).
Totality (DC-01) is asserted as **set equality** between the dispositions exercised and
`LIST_FAILURES`: every row reachable, no row unreachable, nothing outside the table observed.

**Generator.** D6 — phase-entry configurations: phase ∈ the **seven** phases carrying a `reviewLoop`
call site (`R, F, T, D, P, PR, CR`; §3.2, PM F-08 — v1.0 wrote "the six forceable phases", which is
`parseForcePhases`'s axis, not the gate's, and left `CR` outside the product entirely) × failure ∈
`LIST_FAILURES` ∪ `{ok}` × a randomised pre-existing review set × a randomised `dirPath` string
(including paths with spaces, unicode, and a trailing slash, to prove the message interpolates the
path it was given). Enumeration of phase × failure is exhaustive; the rest is sampled. 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. Every `(phase, failure)` pair must be observed — set equality against the product,
which is what makes "every row reachable" a measured claim rather than an aspiration. And ≥10 `ok`
cases must be present so the benign path is not the only non-halting outcome.

**Owner.** Written by **RLH-25** (batch 3); greened by **RLH-27** — §7.3's `RLH-AT-21 … -27, -13a,
-30-orch … -34-orch` row: green from batch 9, permitted red batches 3–8.

**Beyond the examples.** RLH-25's `RLH-AT-21`…`-27` name the dispositions one phase at a time, and
`RLH-AT-13a` enumerates G-INV's four gated exits. The product with the
phase axis is what no AT set carries: a disposition that is correct at Phase R and swallowed at Phase
D is exactly the H-2 terminal-exit shape, and only the product catches it.

**Shrink.** File-local ladder: fix the failure, minimise the phase to the earliest failing one, then
reduce `dirPath` to the shortest still-failing string.

---

**PROP-LIST-01b — the disposition is re-evaluated at every episode entry, not cached.**
*(Error Handling · L2 · `pacingWrapper.test.js`)*

**Invariant.** For every generated episode interleaving: `refreshReviewState()` is called at **every**
episode entry (call count equals episode count, asserted as an equality, not a floor); the disposition
each episode reaches is the one implied by *that episode's* seam answer, not a previous episode's; and
a seam that answers `ok` then `unreadable` halts at the second episode rather than proceeding on the
cached first answer. Conversely a seam answering `dir_missing` then `ok` proceeds with a **non**-empty
review set at the second episode.

**What this equality does and does not say about `deriveRoundWindow`.** `refreshReviewState`'s body
includes `w ← deriveRoundWindow(r.files, docType)` (TSPEC §5.6.1), so a *k*-episode phase entry
invokes `deriveRoundWindow` *k* times inside `reviewLoop`, plus once at the §5.4 gate — **1 + k**, by
design, and this equality is the property that pins the *k*. `PROP-WINDOW-01` asserts nothing about
that count: its conjunct (i) is a provenance claim over the threaded window *values*, not a call
count. Through v1.3 it asserted `deriveRoundWindow` was invoked exactly once per phase entry, which
contradicted this equality on every sequence of length ≥1 and was false on a conforming subject; that
clause is withdrawn there (SE F-25). The two properties now partition the ground: this one owns the
per-episode refresh count, `PROP-WINDOW-01` owns the window's immutability.

**Generator.** D7 — episode interleavings: a sequence of 1…12 episodes, each carrying a phase, a round
index, and a seam answer drawn from `LIST_FAILURES ∪ {ok}`, subject to the constraint that a halting
answer terminates the sequence (halts are terminal, so nothing after one is generated). 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. ≥20 sequences must change seam answer between consecutive episodes (the caching
discriminator), ≥15 must be length ≥5, and ≥10 must end in a halt. A sequence whose answers never
change cannot falsify caching and is counted but not relied upon.

**Owner.** Written by **RLH-21** (batch 3); greened by **RLH-23** — green from batch 7, permitted
red batches 3–6.

**Beyond the examples.** This is `S-INV` — per-episode refresh — stated over interleavings. Examples
pin two-episode sequences; the property covers arbitrary ones, including the phase-change-mid-sequence
shapes where a cached state is most tempting and most wrong.

**Shrink.** File-local ladder: truncate the sequence from the front while it still fails, then
simplify each surviving episode's phase to the first in the catalogue.

---

**PROP-APPROVE-01 — the two-tier approval search finds an approval iff one exists in the window.**
*(State Machine · L2 · `approvalSearch.test.js`)*

**Invariant.** For every generated branch state: the search returns an approval **iff** the branch
carries a unanimous, digest-current approval for a review inside `[startIndex, endIndex]`. Three
conjuncts. (i) **Tier discipline** — the second tier is consulted **only** when the first yields
nothing, asserted on the recorded seam call log, so a search that always reads both tiers fails.
(ii) **Window respect** — an approval for a review *outside* the window is never returned, however
unanimous and however current. (iii) **Idempotence** — running the search twice against the same
branch state yields an equal result and issues an equal number of seam reads.

**Generator.** **D1 × D6** — v1.0 cited "D2 × D4", the fenced-markdown and heading-set domains (PM F-06). Branch states composed from `PROP-ROUND-01`'s filename generator (so window
membership is generated, not assumed) crossed with `PROP-RESOLVE-01`'s 16-element presence vector, plus
tier placement (`tier1`, `tier2`, `both`, `neither`) chosen by `rng.pick`. 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. All four tier placements must appear; ≥15 cases must place a unanimous approval
**outside** the window; ≥15 must place a unanimous-but-stale approval inside it. Those two floors are
the property's discriminating power — everything else is dressing.

**Owner.** Written by **RLH-24** (batch 3); greened by **RLH-26** — green from batch 8, permitted
red batches 3–7.

**Beyond the examples.** The `iff` is the point. The ATs assert *finding* an approval that is there
(`RLH-AT-08`…`-11`, `-56`, `-57`); the property additionally asserts *not* finding one that is not, over a space that
includes the near-misses — out-of-window, stale, half-unanimous — that the H-4 defect shipped through.

**Shrink.** File-local ladder: collapse to tier placement + presence vector + one in/out-of-window
flag; the shrunk report is three tokens.

---

**PROP-GINV-01 — `G-INV`: no path reaches step 5 except through the POSTMORTEM gate.**
*(State Machine · L2 · `haltAndQueue.test.js`)*

**Invariant.** Stated over **paths, not steps**. For every generated traversal of the phase machine
that ends in the phase being run (step 5), the recorded step log contains step **G**, and G appears
**before** step 5 in every such path. Equivalently: step 5 is unreachable in the traversal graph with
G removed. Two conjuncts guard the framing. (i) **Every exit that leads to running the phase is
gated** — not merely the exits the current implementation happens to take, so the property enumerates
the exits from the *catalogue* of exits, not from an observed run. (ii) **G is evaluated, not merely
present** — the gate's decision must be a function of the generated state, asserted by requiring that
the corpus contains both G-passes and G-halts for the same downstream step.

**The exit catalogue: one owner, one count** (SE F-06). v1.0 referred to "the catalogue of exits"
without saying whose it is or how many entries it has, and §5.3's ledger row then spoke of *four*
gated exits while §4.3's `PROP-LIST-01a` prose said the same — a number with no source. The owner is
**TSPEC §2.5**, whose G-INV sentence enumerates them: *forced*, *unforced-with-no-candidate*,
*unforced-not-approving*, **`STALE`**, **`UNEVALUABLE`**, "or any exit added later" — **five**, and an
explicitly open-ended fifth clause. The test imports no count; it asserts **set equality** between the
exits its generated corpus traverses and the catalogue it derives from that sentence, so "any exit
added later" becomes a failing test the day it is added rather than an untested branch.

`FRESH` is **not** a sixth gated exit: per TSPEC §2.5 a `FRESH` anchor means the phase *is not run*,
so `FRESH` is a path that must never reach step 5 at all. It is generated, and its assertion is the
negative one — no step-5 record appears on a `FRESH` path — which is a different obligation from
"reached step 5 through G" and is stated separately rather than folded into the count.

**Generator.** D6 — phase-entry configurations crossed with the exit catalogue: for each exit, a state
that takes it, dressed with a randomised round index, a randomised prior-postmortem presence flag, and
a randomised review set. Exits enumerated exhaustively; dressing sampled. 100 cases.

**Non-vacuity.** All forced (§3.3 rule 1), never sampled. All **five** of TSPEC §2.5's exits must be traversed at least once — set equality
against the catalogue, not a count ≥ 5 — and both outcomes of G (pass and halt) must be observed for
≥3 distinct exits. ≥10 cases must take the `FRESH` path and reach **no** step 5. An
exit that no generated state can reach is a **failure**, not a skip: an unreachable exit means either
the catalogue or the machine is wrong, and DC-01 makes that a finding rather than silence.

**Owner.** Written by **RLH-25** (batch 3); greened by **RLH-26** (batch 8) and **RLH-27** (batch 9)
— green from batch 9, permitted red batches 3–8. The
property is not fully green until RLH-27's terminal-exit rework lands, because until then at least one
exit reaches step 5 without G. That is the H-2 defect, and this property is its executable statement.

**Beyond the examples.** An enumeration of steps is what the pre-fix suite had, and it passed while
H-2 was live: each step was individually correct and one *path* skipped the gate. Stating the invariant
over paths — and generating the paths rather than listing them — is the whole reason this property
exists and the reason it is worded as reachability rather than as a sequence assertion.

**Shrink.** File-local ladder: minimise the path by removing dressing, then by shortening the traversal
to the shortest prefix that still reaches step 5 without G. The shrunk counterexample is a path.

---

**PROP-EPISODE-01 — `EpisodeKey` is unpinned and the 36-dispatch bound holds over all interleavings.**
*(Concurrency/Bounds · L2 · `pacingWrapper.test.js`)*

**Two v1.0 errors are corrected here: the bound's scope, and its oracle.**

*Scope* (SE F-03). TSPEC §4.5 states the 36 as *"worst-case dispatch count for **one phase**"*. v1.0
asserted it as a **total** over the whole interleaving while simultaneously generating interleavings
that revisit phases — so v1.0's own generator produced legal runs its own conjunct (i) called
violations, and conjuncts (i) and (iii) contradicted each other outright. Restated: **36 bounds one
phase segment.** The interleaving is partitioned into maximal per-phase segments, the bound is
asserted **per segment**, and the multi-phase total is the *sum over segments* — explicitly **not**
bounded by 36, which is the sentence that removes the contradiction.

*Oracle* (SE F-02, second identity). v1.0 said the bound is *"asserted against the constants, never
against the literal 36"*. TSPEC §4.8 makes `MAX_REVIEW_ROUNDS` and `MAX_AUTHORING_DISPATCHES`
module-level and **not exported**, so there is no import through which a test can name them; asserting
"against the constants" would mean recomputing the subject's own bound from the subject, which
compares the subject with itself and cannot fail. That claim is **withdrawn**. The bound is instead
asserted against **two independently observed quantities**: `I`, the round count `reviewLoop` returns
in its `iterations` field — **two return sites, not one** (SE F-22). On the *exhausting* branch the
value is `MAX_REVIEW_ROUNDS` itself, returned at `orchestrate-dev.js:598`, which is TSPEC §7.1 edit 5,
the one site that reports the constant as a *count* rather than an index and the only surface at any
level that exposes it. On a *converging* branch the value is the round actually reached, returned at
`:648` — not an edit site, and it reports no constant. That split is exactly why conjunct (i)'s
**equality** is restricted to precondition (b) and its **inequality** is not; v1.2's provenance
sentence described only the first site while the conjunct already read both — and `B`, the per-episode
dispatch cap **observed** by driving a single episode past saturation and counting the dispatch
doubles' calls. The literal 36 appears nowhere.

**Invariant.** For every generated interleaving of phases and rounds:

(i) **The bound, per phase segment.** For each maximal single-phase segment, the authoring dispatches
recorded by the seam doubles satisfy `dispatches(segment) <= (1 + I) × B`, where **`I` is read per
segment** — `reviewLoop` returns one `iterations` value per *phase entry*, so a multi-phase
interleaving yields one `I` per segment, not one per run (SE Q-02).

The **equality** `dispatches(segment) === (1 + I) × B` is asserted only under **both** preconditions:
(a) every episode in the segment is driven past `B`, **and** (b) the segment's `reviewLoop` call
**ran to exhaustion** — it returned `converged: false`. Precondition (b) was missing in v1.1 and its
absence made the equality **false on a correct subject** (SE F-14): measured at HEAD,
`orchestrate-dev.js:598` returns `iterations: MAX_REVIEW_ROUNDS` on the non-converged branch, while
`:648` returns `{ converged: true, iterations: iteration }` — the *actual* round reached. A phase
produces `1 + (rounds that yielded a revision)` episodes, which equals `1 + I` only when the loop
exhausts; on a segment converging at round 2 the left-hand side is `2B` against a right-hand side of
`3B`. Since the ≥10 "drive every episode past `B`" floor is forced, that was a deterministic red on
correct code, not a seed-dependent one. `PROP-WINDOW-01` states the same precondition for the same
reason two properties below; this is that treatment, copied.

Both `I` and `B` are read from the run. `I` genuinely has independent provenance —
`reviewLoop`'s return value is a different site from the dispatch counter, so an off-by-one on either
side dies. **`B` does not**: it is observed by driving a single episode past saturation and counting
the *same* dispatch doubles that produce the left-hand side, so a subject whose cap is uniformly wrong
measures its own wrong cap and satisfies the equality (SE F-16). The equality's discriminating power
is over **segment structure** — the `1 + I` episode count and the per-segment budget reset — not over
the cap's value; §8.5 records the residue.

(ii) **Per-episode counting.** The dispatch counter is keyed by the full `EpisodeKey`, so two episodes
differing in any single **externally controllable** coordinate never share a budget — asserted by
generating pairs that differ in exactly one coordinate and checking the counters are independent.

**The floor is over four coordinates, not five** (SE F-04). `EpisodeKey` has five fields, but
`invocation` is documented by TSPEC §4.5 as *"monotonic within `(artifactSet, phase, round, mode)`"* —
it is **derived from** the other four by the counter itself, and §4.5's own note that *"without
`invocation`, the counters have nothing to increment"* says so. A test cannot hold four coordinates
fixed and set `invocation` independently; it is not an input. So the sole-differing-coordinate floor
covers `artifactSet`, `phase`, `round`, `mode`, and `invocation` gets its **own, differently shaped**
conjunct: with the four externally controllable coordinates held fixed, re-entering the episode
**consumes the same budget** — the second entry's dispatches count against the first entry's
remaining allowance and saturate it, rather than receiving a fresh `B`. That is falsifiable (a subject
that keys on `invocation` as a fifth *identity* coordinate hands out a fresh budget and dies), and it
is the conjunct v1.0's five-way floor was silently unable to write.

(iii) **Unpinned `roundIndex`.** Because `refreshReviewState()` runs at every episode entry,
`roundIndex` is a per-episode derivation, so an interleaving that revisits a phase at a *lower* round
index than a previous episode is legal and gets its own budget rather than an exhausted one.

**Generator.** D7 episode interleavings, extended to vary the **four externally controllable**
`EpisodeKey` coordinates independently — `artifactSet`, `phase`, `round`, `mode`; `invocation` is
subject-derived and no seam lets a test set it, per the paragraph above and §8.5 item 2, and v1.1's
leftover "all five" here is **withdrawn** (SE F-17) — including the pathological orderings (same phase twice non-consecutively, round index
decreasing, phase revisited after a different phase). Sequence length 1…12; per episode, 0…8 attempted
dispatches. 100 cases.

**Non-vacuity.** All forced. ≥15 interleavings must attempt **more** than the budget within one
episode (so the cap is exercised, not merely respected by luck); ≥15 must revisit a phase; ≥10 must
decrease `roundIndex` across episodes; ≥10 must drive **every** episode of a segment past `B` **and
run that segment's loop to exhaustion** (`converged: false`), which is what makes conjunct (i)'s tight
equality both reachable and true — a segment that saturates but converges early satisfies (a) without
(b) and is deliberately excluded from the equality, falling back to the inequality; ≥10 must span
**two or more** phase segments, so the "the total is the sum, not 36" reading is exercised rather than
asserted in prose only; and each of the **four externally controllable** coordinates
(`artifactSet`, `phase`, `round`, `mode`) must be the *sole* differing coordinate in ≥3 pairs — set
equality against that four-element list, so a coordinate dropped from `EpisodeKey` fails here. ≥10
pairs must hold all four fixed and re-enter, exercising the `invocation` conjunct. v1.0's floor named
five coordinates and would have been unsatisfiable on the fifth.

**Owner.** Written by **RLH-21** (batch 3); greened by **RLH-23** — green from batch 7, permitted
red batches 3–6.

**Beyond the examples.** The bound is arithmetic over a *space of interleavings*; the ATs sample three
of them. And the "unpinned" conjunct cannot be written as an example at all without asserting a
specific illegal-looking sequence is legal — which reads as a bug in an AT and as an invariant here.

**Shrink.** File-local ladder: shorten the interleaving, then reduce per-episode dispatch counts toward
the budget edge, then collapse coordinates to their first catalogue value.

---

**PROP-WINDOW-01 — the round window `reviewLoop` enforces is the gate's, threaded positionally and never re-derived.**
*(State Machine · L2 · `reviewLoop.test.js`)*

**This property now carries the width identity `PROP-ROUND-01` could not** (SE F-02). The identity
`endIndex - startIndex + 1 === MAX_REVIEW_ROUNDS` is unobservable at L1 — the constant is unexported
(TSPEC §4.8), `deriveRoundWindow` takes no width argument (§3.7), and §8.4 bars an L1 test from the
filesystem — so at L1 it degenerates to comparing the subject's width with itself. At **L2** it is
observable, and TSPEC §7.1 says exactly where: of the five `MAX_REVIEW_ROUNDS` edit sites, *"only
sites 4 and 5, which report a **count** rather than an index, use the constant alone"* — site 5 being
`return { converged: false, iterations: MAX_REVIEW_ROUNDS, lastResults };`, and site 4 the
`Iterations (${MAX_REVIEW_ROUNDS} — limit reached)` line in `reviewLoop`'s prompt, which the
**`_agent` double** captures. Both are read here **through the seams**, not imported.

**v1.1 named the wrong double for site 4 and it is corrected here** (SE F-13). Measured at HEAD:
`reviewLoop`'s parameter list (`orchestrate-dev.js:532–542`) injects exactly `_agent`, `_parallel` and
`_checkFile` — there is no `recordPhase` seam. `recordPhase` is a `main()`-local callback declared at
`:1574` and passed to **`checkConverged`** (`:496`), never to `reviewLoop`. Site 4's prompt is built at
`:567` and dispatched at `:574` as `await _agent(optimizer, postmortemPrompt)`, so the recorded prompt
of the **agent** double is the surface. An implementer at `RLH-22` looking for a `recordPhase` double
in `reviewLoop.test.js` would not have found one.

**Invariant.** For every generated phase run:

(i) **Threaded from the gate, not re-derived.** The `endIndex` `reviewLoop` enforces and the
`startIndex..endIndex` pair `checkConverged` renders are the values the phase gate supplied
**positionally** — never a value the loop computed for itself. Asserted by disagreement: drive
`reviewLoop` with an `endIndex` that *differs* from what a re-derivation over the `_listFiles`
double's answer would produce, and the loop's cap follows the **parameter**. The values are identical
across every consumer and every call within one phase entry — an equality over observed values, not a
floor.

**v1.3 asserted this as a call-count equality on `deriveRoundWindow`, which is false on a conforming
subject** (SE F-25 ≡ the carried SE Q-03, promoted). Measured from the sections that own the call
sites, not inferred: **TSPEC §5.4** — the approval search *"Runs once per skip-eligible phase entry,
after `deriveRoundWindow` and before `reviewLoop`"* — is the gate invocation; and **TSPEC §5.6.1**
declares `refreshReviewState`, *"called at **every** wrapped episode entry inside its
`while (true)`"*, whose body includes `w ← deriveRoundWindow(r.files, docType)`. TSPEC states in the
same place that *"**Every** episode re-reads, the first included, so the loop needs no seed maps"* —
that per-episode re-derivation **is** N-01's fix and the reason `reviewLoop`'s signature gained
`_listFiles` and `_readFile` at all. A phase entry with *k* wrapped episodes therefore invokes
`deriveRoundWindow` **1 + k** times by design, and this document's own `PROP-LIST-01b` asserts the
per-episode count as an equality over the same subject at the same level. Two equalities, one
subject, incompatible: the old clause would have redded `RLH-22` in batch 3 on correct code. What the
clause was aiming at — a `reviewLoop` that recomputes the cap it was handed and drifts as the listing
grows — survives intact above, stated over values rather than counts. `PROP-LIST-01b` keeps the
per-episode count; this property keeps the window's immutability; neither claims the other's ground.

(ii) **The width identity, against an independently observed count.** For a run driven to exhaustion,
`endIndex - startIndex + 1 === loopResult.iterations`, where `iterations` is the value site 5 returns
and the left-hand side comes from the window the gate computed. Two independently sourced observables:
an off-by-one introduced on either side (`startIndex + MAX_REVIEW_ROUNDS`, or a loop that returns one
round too few) breaks the identity, which is precisely what the L1 form could not do. The same value
is cross-checked against the count rendered into the prompt at site 4 and captured by the **`_agent`**
double's recorded prompt — a third surface, so a mutation would have to be applied consistently at all
three to escape.

(iii) **The window does not move.** For the whole duration of the phase, the `startIndex` and
`endIndex` **`reviewLoop` was handed** are unchanged as rounds advance — round advancement moves the
*cursor*, never the window. This is a claim about the threaded pair only. `refreshReviewState`'s own
`w.startIndex` legitimately advances as rounds write new files (TSPEC §5.6.1 rule 2: `selectMode` and
`deriveRoundWindow` *"answer different questions"*), and nothing here asserts otherwise.

**Generator.** D6 × D7: a phase entry with a generated branch state (from `PROP-ROUND-01`'s generator)
followed by 1…`MAX_REVIEW_ROUNDS + 2` round advances, each with a generated verdict. The upper bound
is expressed relative to the **observed** `iterations` count, not to an imported constant. 100 cases.

**Non-vacuity.** All forced. ≥20 runs must advance past the observed `iterations` count (the overflow
shape), ≥20 must run to exhaustion so conjunct (ii)'s identity is reachable — a run that converges
early never returns the `iterations` count the identity needs, so without this floor (ii) would be
silently unexercised — ≥15 must start from a branch already carrying reviews (non-1 `startIndex`), and
≥10 must converge before the window closes. The non-1 `startIndex` floor is what distinguishes
derivation from a counter starting at 1 — the H-1 defect. **Conjunct (i) needs one more axis, and it
is orthogonal to those four: in ≥15 runs the window pair handed to `reviewLoop` must *disagree* with
what a re-derivation over the `_listFiles` double's listing would produce** — the same test controls
both, so the disagreement is constructible without touching the subject. Without that floor (i) is
vacuous, because on an agreeing case a re-deriving subject and a threading subject return the same
cap; the disagreeing case is the only one where provenance is observable at all (SE F-25).

**Owner.** Written by **RLH-22** (batch 3); greened by **RLH-27** — rides `RLH-LOOP-01`/`-02`'s
ledger rows: green from batch 9, permitted red batches 3–8.

**Beyond the examples.** "Threaded, not re-derived" is a claim about *provenance* across a run — the
cap the loop enforces came from the gate — and no example asserts it; an example can only show one
run in which a re-derivation would have agreed. This is the orchestration-level half of `PROP-ROUND-01`'s
pure arithmetic, and the pair together is what closes H-1: the arithmetic is right *and* nobody redoes
it with stale inputs.

**Shrink.** File-local ladder: reduce the round count to the first failing advance, then minimise the
branch state.

### 4.4 L3 — source-guard invariant

One property, at the level TSPEC §8.3 calls composition/source: it reads `pdlc/workflows/*.js` as
**text**, executes nothing, and never reads `dist/` (§2.4).

---

**PROP-AWAIT-01 — the await classification is total: every seam call site is classified or fails.**
*(Static Guard · L3 · `runtimeBundle.test.js`)*

**The outcome catalogue is rebuilt from the classifier's real outcome space** (SE F-01). v1.0 stated
a **five**-element catalogue — `awaited`, ruling 1 (alias), ruling 2, ruling 3, `unclassified` —
and made it a partition with a set-equality floor of ≥10 fragments per element. That catalogue is
**unproducible**, and the floor over it would red on shipped, correct source. PLAN §9.2 item 3 builds
the classification in two stages: step **(b)** *"build the scan set including aliases and the wrapper
fixed-point"*, then step **(c)** classifies each remaining non-`await`ed site, and (c)'s own third
branch reads *"alias (already discharged by (b))"*. **Alias is a scan-set construction rule, applied
before classification** — an aliased call never survives to be classified, so `alias` can never be a
classifier *outcome*, and no fragment can be generated whose expected outcome is `alias`. A floor
demanding ≥10 such fragments is unsatisfiable; on the shipped source it fails. That matters more than
usual here because this property rides §7.3's row 1 (`RLH-AT-19`, `-20`, `RLH-SCAN-01`) — the one row
in the whole ledger with **no permitted red, ever**. A property that reds on correct source, on that
row, halts the batch. v1.0's catalogue is withdrawn.

**Invariant.** Let `S` be the set of call sites of the thirteen injected seam identifiers surviving
PLAN §9.2 item 3's scan-set construction — step (b), aliases and the wrapper fixed-point already
resolved — found by the bracket-depth walk over the masked source. For every site `s ∈ S`, exactly one
of **four** outcomes holds:

| Outcome | Decided by | Decision test |
|---|---|---|
| `awaited` | the walk | the token preceding the call is `await` |
| `returned-promise` | TSPEC §8.5 ruling **2**, decided by the walk **PLAN §9.2 item 3(c) prescribes** | **both halves of §9.2 item 3(c), cited not paraphrased.** Backward: the nearest non-whitespace token before the call is `=>` or `return`. Forward: the first non-whitespace token after the call's matching `)`, reached by walking the same bracket-depth stack forward to depth zero, is `;`, `,`, `)`, `}` or end of line. Both must hold; if the forward walk cannot reach a matching `)` at depth zero the site is `unclassified` |
| `awaited-combinator-argument` | TSPEC §8.5 ruling **3** | the innermost unclosed delimiter at the site is the `[` of an `await`ed `Promise.all` / `allSettled` argument list |
| `unclassified` | neither ruling fires | the property **fails loudly** — it does not warn, does not skip, and is not permitted to be absent from the report |

**Ruling 2's forward half is a *local syntactic* test, and v1.1's statement of it is withdrawn**
(SE F-12). v1.1's cell read *"the returned value is awaited by the caller"*. That is a claim about
every caller of the enclosing function; it is **undecidable by the bracket-depth walk §9.2 item 3(c)
prescribes**, and it is unauthorable for D8's synthetic fragments, which have no caller at all. What
§9.2 item 3(c) actually requires is that the call be the *entire* body of the arrow or the *entire*
operand of the `return` — which the forward token test above decides locally, at the call site. The
rule's owner is PLAN §9.2 item 3(c) (itself the repair for TE `F-01(a)`) and the exemption it
implements is TSPEC §8.5 ruling 2; **this document cites both and states neither in its own words.**

**Disjointness is now a real claim.** Under v1.0's catalogue, "a site matching two rulings is a
failure" was near-vacuous, because alias co-classification was the only plausible overlap and alias
was never an outcome. Under the rebuilt catalogue the two rulings have *genuinely* distinguishable
decision tests — ruling 2 keys on the **nearest preceding token**, ruling 3 on the **innermost
unclosed delimiter** — and a fragment can be constructed that a sloppy implementation would send down
both (a call inside an `await`ed `Promise.all([...])` whose element is itself an arrow body, followed
by `,`, so that ruling 2's forward half holds too). Such fragments are generated, and exactly one
outcome must be returned.

**For those fragments the assertion is cardinality, not a label** (SE F-15, SE Q-01). **No artifact
states a precedence between rulings 2 and 3**: PLAN §9.2 item 3(c) directs the walk to find the
enclosing context *"and decide the three rulings from it"*, and PLAN §0's changelog row for F-03
(`PLAN:1504`) describes what §9.2 gained as deciding *"which §8.5 ruling, if any, applies"*. Both are
quoted as written, each attributed to the section it is actually in — v1.2 put a paraphrase inside
quotation marks (SE F-24) and v1.3 fixed the words while attributing the second phrase to item 3(c)
rather than to §0's row (R-6, corrected silently). Neither phrasing orders the rulings, and TSPEC
§8.5's rulings table is unordered. Both rulings exempt the site, so either
answer is behaviourally correct — and a hand-authored `expected` label would therefore red a *correct*
classifier, on the one row with no permitted red, ever. This document **does not invent the
precedence**. These fragments are generated **without** an `expected` label; the assertion over them
is: `classify(fragment)` returns **exactly one** outcome, and that outcome is a member of
`{ returned-promise, awaited-combinator-argument }` — never `unclassified`, never both, never a set.
The missing precedence is reported upward as a specification gap in §8.5, not filled here. The
round-trip `classify(fragment) === expected` below therefore holds over the labelled fragments only.

**Total cover, not total partition** (SE F-08). The classification of `S` is a partition. The
*obligation* it discharges is a **cover**: it asserts that no site in `S` is unclassified. It does not
assert that every seam call in the file is in `S` — TSPEC §8.5's anonymous-arrow exemption puts at
least one shipped site outside `S` (`orchestrate-dev.js:1866`'s `batch.map((task) =>` arrow, whose
`agentFn(` call at `:1867` is the site the scan set names), and §8.5 states that exemption is
*"inherited by nobody"*, i.e. it is unsound in the general case and sound only at HEAD. v1.0 called
the whole thing a total partition, which overstates it. §8.4 records the shipped unsound exemption as
a residual rather than claiming coverage the walk does not have.

The property is quantified over `S` as the walk computes it, never over a hard-coded list of the sites
present today.

**Generator.** D8 — source fragments, **never executed**. The generated object is not the production
source (that is walked whole and asserted directly) but the *classifier's input space*: synthetic
fragments composing seam calls with the constructs that break naive regex scanners — calls inside
template literals, inside string literals containing brackets, inside comments, split across lines,
nested inside another call's argument list, and inside a `Promise.all([...])` that is itself awaited.
Each fragment **except the both-rulings-applicable shape** is generated together with its expected
classification, so the property is a round-trip over those: `classify(fragment) === expected`. The
both-rulings shape is generated unlabelled and carries the cardinality assertion stated above.
100 cases.

**Non-vacuity.** All forced. Each of the **four** outcomes — `awaited`, `returned-promise`,
`awaited-combinator-argument`, `unclassified` — must be the expected outcome for ≥10 fragments, set
equality against that four-element catalogue. ≥10 fragments must satisfy ruling 2's backward half but
**not** §9.2 item 3(c)'s forward half, expected `unclassified` — the control that stops "either half"
passing for "both". Under the corrected forward half these are trivially generable, and PLAN §9.2
item 3(c) names two of them: `() => _agent(a) && other` and `return _checkFile(p) || fallback;`, where
the token after the call's matching `)` is `&&` / `||` rather than `;` `,` `)` `}` or end of line.
(Under v1.1's "awaited by the caller" phrasing this floor was ungenerable, which is the second thing
SE F-12 broke.) ≥10 must be the deliberate both-rulings-applicable shape described above, carrying the
**cardinality** assertion rather than a label. And ≥15 fragments must place a seam call inside a masked region (string,
template, comment) where the expected outcome is that **no site is found at all** — a statement about
the walk's masking, not about the classifier, and therefore asserted on `S` rather than on an outcome.
No fragment has expected outcome `alias`; per PLAN §9.2 item 3(b) none can exist.

**Withdrawn rulings.** TSPEC v1.7 withdrew `Promise.race` and `Promise.any` from ruling 3. The
generator therefore emits `Promise.race`/`any` fragments with expected outcome **unclassified**, so
the withdrawal is asserted rather than merely documented — a re-added ruling reds this property.

**Owner.** Written by **RLH-31** (batch 2). §7.3's first row (`RLH-AT-19`, `RLH-AT-20`;
`RLH-SCAN-01`): **green on arrival, permitted red none ever**, greened by nobody. This property rides
that row for the same reason `RLH-SCAN-01` does — it is the scan mechanism's own self-test (PLAN §9.2
item 3), and a self-test that is allowed to be red is not a self-test.

**Beyond the examples.** `RLH-AT-19`/`-20` assert two anchored regexes match zero times, and the
advisory row enumerates the sites observed at HEAD. Enumeration is exactly what §8.5 forbids as the
statement of the rule, and enumeration is what rots: a fourteenth seam, or a fourth alias hop, is
invisible to a site list and visible to a quantifier. This is the property that makes "every
non-`await`ed site is classified" a checked sentence rather than a claim about a snapshot.

**Shrink.** File-local ladder over the fragment: strip surrounding context lines, then collapse the
masked region, then reduce to the bare call expression. The shrunk counterexample is a single line of
source, which is the only useful failure report for a static guard.

## 5. Oracles

### 5.1 The rule this section enforces

**An unfalsifiable property is worse than none**: it consumes a batch, occupies a ledger row, and
reports green whether or not the behaviour it names exists. So every property in §4 is paired below
with a **named mutation to a named source file** that turns it red, and with the conjunct that dies.
A property whose row cannot be filled is deleted, not weakened.

Two supporting rules, both from the te-author oracle checklist:

- **No oracle may be the subject's own code path.** `PROP-DIGEST-02` may not compare against
  `crypto` (§4.1); `PROP-NAME-01` may not compose the filename with a second regex written in the
  test; `PROP-AWAIT-01` may not re-implement the bracket walk it is testing. Where the property needs
  a constructor, it uses the production one and asserts the **round-trip**, which fails on a
  bidirectionally wrong implementation but is not satisfied by a tautology, because the generated
  input is compared field-by-field against the parse.
- **Absence-based claims carry three positive conjuncts.** Four properties assert that something is
  *not* there — `PROP-SCAN-01` (no marker inside a fence), `PROP-NAME-01` (mutations do not parse),
  `PROP-APPROVE-01` (out-of-window approvals are not found), `PROP-GINV-01` (step 5 unreachable
  without G). Each pairs the negative with three positives: the run happened (a positive call-count
  or step-log assertion), the input was well-formed (the non-vacuity floors), and the *complementary*
  positive holds (the in-fence marker is classified as fenced; the unmutated name parses; the
  in-window approval is found; the gated path reaches step 5). A negative asserted alone is
  indistinguishable from a subject that did nothing.

### 5.2 Falsifiability ledger — L1

| Property | Named mutation (file · construct) | Conjunct that dies |
|---|---|---|
| `PROP-DIGEST-01` | `orchestrate-dev.js` · in `canonicaliseForDigest`, change the trailing-newline rule from *force exactly one* to *strip all* | the "exactly one `\n`" conjunct, on the ≥5 zero-trailing-newline cases — and **only** on those, which is why that floor is forced |
| `PROP-DIGEST-01` (2nd) | same file · drop the `\r` removal, keep the newline rule | idempotence survives; the "no `\r`" conjunct dies on the ≥10 lone-`\r` cases |
| `PROP-DIGEST-02` | `orchestrate-dev.js` · in `utf8Bytes`, emit the raw code unit for code points above U+FFFF instead of the surrogate-pair encoding | the shape conjunct survives (still 64 hex); the **known-answer vectors** red, and the property's determinism half stays green — which is the point of keeping both oracles |
| `PROP-DIGEST-02` (2nd) | same file · call `sha256Hex` on the raw text at one call site instead of the canonical form | conjunct (iii): `sha256Hex(t) === sha256Hex(f(t))` fails on the ≥20 non-canonical cases |
| `PROP-DIGEST-02` (3rd) | `orchestrate-dev.js` · in `utf8Bytes`, `throw` on a lone surrogate instead of encoding it | **totality**, conjunct (i), dies on the lone-surrogate cases §4.1's `PROP-DIGEST-02` **Non-vacuity** floor forces — the only conjunct that does. That floor is §4.1's and is cited, not restated here; v1.1's "≥10" contradicted it (SE F-19). *v1.0 filed totality and determinism as Residuals for want of a falsifier; both have one, and DC-03 does not permit a Residual where a mutation exists (PM F-10)* |
| `PROP-DIGEST-02` (4th) | same file · memoise the digest in a module-level `Map` keyed by the pre-canonical text | **determinism**, conjunct (ii), dies on the pairs whose two members canonicalise together but differ pre-canonically: the second call returns the first's answer for the wrong input. The shape conjunct and the known-answer vectors both survive, so the failure names determinism alone |
| `PROP-SCAN-01` | `orchestrate-dev.js` · replace the fence **depth counter** in `scanLines` with a boolean toggle | fence discipline dies on the ≥5 unclosed-fence cases and on nested fences; conservation survives, so the failure names the right conjunct |
| `PROP-SCAN-01` (2nd) | same file · `continue` past a line that matches no pool instead of classifying it | conservation (`sum === lines.length`) dies immediately; totality is what catches the silent drop |
| `PROP-NAME-01` | `orchestrate-dev.js` · loosen `parseReviewFilename`'s anchor from `$` to a non-anchored match | the rejection direction dies on the extension-mutation class; the round-trip stays green, which is exactly how a loosened regex ships unnoticed today |
| `PROP-NAME-01` (2nd) | same file · accept a zero-padded round (`v01`) as round 1 | rejection dies on the round-mutation class. v1.0 called the field *version*; TSPEC §3.7 names it `round` |
| `PROP-ROUND-01` | `orchestrate-dev.js` · compute the window width from `present.size` (or from the count of `entries`) instead of the fixed width | **width invariance** dies as soon as two cases carry different numbers of in-window reviews — which the ≥20 other-doc-type and ≥15 above/below floors guarantee. *This row replaces v1.0's, which named the off-by-one `startIndex + MAX_REVIEW_ROUNDS`: under §4.1's corrected conjunct that mutation merely changes the constant width and every case still agrees, so it does **not** die here. It dies at `PROP-WINDOW-01` (§5.3), where the width is compared against an independently observed count* |
| `PROP-ROUND-01` (2nd) | same file · derive `startIndex` from a counter initialised to 1 rather than from the highest observed round | the partition survives; `startIndex >= 1` survives; the **derivation** conjunct dies on the ≥15 cases whose branch already carries reviews. This is H-1, and this row is its executable statement |
| `PROP-ROUND-01` (3rd) | same file · route a well-formed cross-review of **another doc type** into `skipped` instead of the third class | conservation still sums to `|basenames|`, so a cardinality check survives; the **partition** conjunct dies on the ≥20 other-doc-type cases, because a name that parsed `ok` is reported with a `FilenameFailure` reason it does not have. This is the class v1.0's three-way split had no home for |
| `PROP-FORCE-01` | `orchestrate-dev.js` · make `parseForcePhases` return `ok: true` with the unknown tokens dropped instead of `ok: false` | catalogue closure dies on the ≥25 near-miss cases; `all`-expansion survives |
| `PROP-FORCE-01` (2nd) | same file · expand `all` to five phases (omit `PR`) | `\|phases\| === 6` dies on the ≥10 `all` cases; the set-coverage floor names the missing member |
| `PROP-COMPLETE-01` | `orchestrate-dev.js` · replace the `R ⊆ S` test with `|S| >= |R|` (PLAN §7.2's forbidden monotonicity form) | the `iff` dies on the ≥25 single-shortfall cases **that also carry extras** — the ≥15 extras floor exists precisely so a cardinality check cannot hide behind it |
| `PROP-COMPLETE-01` (2nd) | same file · treat a heading whose body is a **fenced block containing `TBD`** as empty | conjunct (i) survives on ordinary cases; conjunct (iv)'s accepted-shallowness half dies on the ≥10 fenced-`TBD` cases, and `missing` names a heading that is present and non-empty — so conjunct (ii) reds too, naming the exact heading |
| `PROP-COMPLETE-01` (3rd) | same file · return `{ complete: false }` with `missing` omitted | conjunct (i) survives entirely — the boolean half is still right. Conjunct (ii), the positive-presence half, dies on every incomplete case. This is the row that shows why `missing` is asserted as a set rather than the status being asserted alone |
| `PROP-COMPLETE-01` (4th) | same file · remove one heading from the required set `R` | the property greens on the subject **and reds on its own floor**: the set-equality non-vacuity assertion (every element of `R` the sole shortfall in ≥1 case) fails, because the generator derives its floors from `R`. A shrinking required set is a finding, not a silence |
| `PROP-HASH-01` | `orchestrate-dev.js` · accept 63-or-more hex characters in the payload (`{63,}` instead of `{64}`) | conjunct (v)'s `/^sha256:[0-9a-f]{64}$/` return-shape assertion dies on the 63-character cases — the mutant returns `sha256:` + 63 hex, which the anchored grammar rejects. *v1.3 named the unprefixed `/^[0-9a-f]{64}$/` here; the value `parseApprovalHash` returns carries the `sha256:` label (PM F-01, §4.2 (v))* |
| `PROP-HASH-01` (2nd) | same file · scan the whole document for a trailer instead of the permitted positions | the quoted/fenced cases start returning hashes; the "never mid-document" conjunct — §4.2 (i)'s *position* half — dies |
| `PROP-HASH-01` (3rd) | same file · in `parseApprovalHash`, when the pre-count is `≥ 2`, return `{ ok: false, reason: "unparseable" }` instead of `{ ok: false, reason: "duplicated" }` | conjunct **(ii)** dies on the ≥5 double-line cases — the catalogue member that names *why* the document was rejected goes missing — and it dies **alone**, which is what makes this row evidence that (ii) earns its place: (i) is green (`ok: false` is still the correct accept/reject answer at `n === 2`), (iii) does not apply (`n !== 0`), (v) is green (no hash is returned on this path), (vi) is green (`unparseable ∈ HASH_FAILURES`), and rows 1 and 2 are green — no hash of any shape is returned and nothing scans mid-document. This is the `PROP-TRAILER-01` (2nd) construction the (4th) row already borrows, applied to the other conjunct §4.2 added. *v1.3's row instead returned the **first** collected line as `{ ok: true, hash }` and claimed the red named (ii) alone. Re-derived, it does not: (i) is an `iff`, so `ok: true` at `n === 2` reds it on every double-line case, and on the mixed cases where the malformed line is collected first the returned value reds (v) too. That mutation is caught, but only by conjuncts already covered elsewhere, so it demonstrated nothing about (ii). Swapped for the isolating mutation (SE F-21, SE F-26, PM F-02)* |
| `PROP-HASH-01` (4th) | same file · on the `n === 0` path return `{ ok: false }` with `reason` omitted, or with a literal outside `HASH_FAILURES` | conjunct **(vi)**, membership, dies on the ≥5 no-trailer cases, and conjunct (iii)'s named `absent` dies with it; set membership names which value went missing. (i) survives — the answer is still `ok: false` — so the failure is localised to the catalogue, not to the accept/reject decision. This is the construction `PROP-TRAILER-01` (2nd) already uses for `TRAILER_FAILURES`, applied to the conjunct §4.2 added for the two `UNEVALUABLE` classes it took ownership of (SE F-21, SE Q-02: the omission was forgotten, not deliberate) |
| `PROP-TRAILER-01` | `orchestrate-dev.js` · widen `parseRevisionComplete` to match a line *containing* the trailer rather than *being* it | mutual exclusion dies where a resolved-marker line also contains the revision trailer text |
| `PROP-TRAILER-01` (2nd) | same file · return a literal string reason not in `TRAILER_FAILURES` | catalogue closure (subset) dies on that path; set-equality names which member went missing |
| `PROP-STALE-01` | `orchestrate-dev.js` · compare the recorded anchor against raw document text instead of the digest | conjunct (iii)'s line-ending-only half dies on the ≥15 normalisation cases; content-staleness survives, so the failure is specific |
| `PROP-STALE-01` (2nd) | same file · widen the guard regex to `/^sha256:[0-9a-fA-F]{64}$/` | conjunct (i)'s `iff` dies on the ≥5 uppercase-hex cases, which now return `"STALE"`/`"FRESH"` where `"UNEVALUABLE"` is specified. *v1.0's row named "treat a missing anchor as fresh"; `isStale`'s signature takes `recordedHash` already parsed, so absence is decided upstream and cannot be mutated here — that row was unimplementable and is withdrawn* |
| `PROP-STALE-01` (3rd) | same file · collapse the three-valued return by mapping `"UNEVALUABLE"` to `"STALE"` | conjunct (i) dies on every one of the ≥20 malformed-anchor cases, and conjunct (ii)'s negative half — `"UNEVALUABLE"` never returned past the guard — is what stops the reverse collapse. This is the row v1.0's boolean framing could not express at all |

### 5.3 Falsifiability ledger — L2 and L3

| Property | Named mutation (file · construct) | Conjunct that dies |
|---|---|---|
| `PROP-RESOLVE-01` | `orchestrate-dev.js` · treat a present verdict as approving without checking the anchor | unanimity's four-fact conjunction dies on the ≥15 stale-anchor cases. This is H-4 |
| `PROP-RESOLVE-01` (2nd) | same file · iterate the corpus in filesystem order and return the first approving record | determinism dies under `rng.shuffle` of the file list — the conjunct no fixed-order example can test |
| `PROP-LIST-01a` | `orchestrate-dev.js` · treat `unreadable` as benign (fall through to an empty review set) alongside `dir_missing` | the halt disposition dies for that row at **every** phase; the set-equality assertion names `unreadable` specifically |
| `PROP-LIST-01a` (2nd) | same file · handle the failure at Phase R's gate only, leaving the other five phases to fall through | the phase × failure product reds at five phases and stays green at one — the exact H-2 signature, and invisible to any single-phase example |
| `PROP-LIST-01a` (3rd) | same file · interpolate a constant path into the halt message instead of `dirPath` | the message conjunct dies on the generated `dirPath`s (spaces, unicode, trailing slash), which is why the path is generated rather than fixed |
| `PROP-LIST-01b` | `orchestrate-dev.js` · hoist `refreshReviewState()` out of the episode loop to a single pre-loop call | the call-count **equality** dies on every sequence of length ≥2; the ≥20 answer-changing sequences additionally red on the disposition conjunct. This is `S-INV` |
| `PROP-LIST-01b` (2nd) | same file · memoise the seam answer per phase | equality survives, the disposition conjunct dies on answer-changing sequences within one phase |
| `PROP-APPROVE-01` | `orchestrate-dev.js` · drop the `<= endIndex` bound from the search predicate | window respect dies on the ≥15 out-of-window cases; the `iff`'s forward half survives |
| `PROP-APPROVE-01` (2nd) | same file · read tier 2 unconditionally and prefer its answer | tier discipline dies on the seam call log for every `tier1`-only case |
| `PROP-APPROVE-01` (3rd) | same file · cache the tier-1 result across invocations | idempotence's *call-count* half dies while the value half stays green — the split is what localises the fault |
| `PROP-GINV-01` | `orchestrate-dev.js` · restore the pre-fix terminal exit that reaches the phase run without passing step G | reachability dies on exactly the exits that skip G; the shrunk counterexample **is the offending path**. This is H-2 |
| `PROP-GINV-01` (2nd) | same file · make step G unconditional (always pass) | reachability survives — G is on every path — and the "G is evaluated" conjunct dies, because no generated state produces a G-halt. Without that second conjunct this property would green on a gate that gates nothing |
| `PROP-GINV-01` (3rd) | `orchestrate-dev.js` · move step **G** inside the `STALE` branch, so the *forced* and *unforced-with-no-candidate* exits reach step 5 ungated | conjunct (i) dies on those two exits' cases while the `STALE` and `UNEVALUABLE` cases stay green — a **subject** mutation, naming exits, which is what this row must be. *v1.0 named a mutation of the test's own exit catalogue; that falsifies the harness, not the software, and §5.4 already concedes as much for the `PROP-COMPLETE-01` row. One such row is a deliberate anti-oracle; two is a pattern (SE F-06), so this one is replaced* |
| `PROP-EPISODE-01` | `orchestrate-dev.js` · key the dispatch counter on `phase` alone instead of the five-coordinate `EpisodeKey` | per-episode counting dies on the pairs differing only in a non-`phase` coordinate; the set-equality coordinate floor names which coordinate was dropped |
| `PROP-EPISODE-01` (2nd) | `orchestrate-dev.js` · include `invocation` as an **identity** coordinate of the counter key, so re-entry allocates a fresh budget | the four-coordinate independence conjunct survives; the `invocation` conjunct dies on the ≥10 hold-four-fixed-and-re-enter pairs, where the second entry receives `B` dispatches instead of the first entry's remainder. *This replaces v1.0's row, which asserted that raising `MAX_AUTHORING_DISPATCHES` causes nothing to red — true, but a statement about the test, not a mutation that kills a conjunct* |
| `PROP-EPISODE-01` (4th) | same file · reset the per-segment counter only at the *run* boundary, not at each phase-segment boundary | conjunct (i)'s per-segment bound dies on the ≥10 two-or-more-segment interleavings, where the later segments inherit an exhausted budget. The single-segment cases stay green, which is exactly the discrimination v1.0's total-over-the-run framing could not make |
| `PROP-EPISODE-01` (3rd) | same file · pin `roundIndex` at the phase gate rather than deriving it per episode | the unpinned conjunct dies on the ≥10 decreasing-`roundIndex` interleavings |
| `PROP-WINDOW-01` | `orchestrate-dev.js` · ignore the `endIndex` parameter and recompute `startIndex + MAX_REVIEW_ROUNDS - 1` inside `reviewLoop` from its own `_listFiles` re-derivation | conjunct (i)'s provenance equality dies on the ≥15 runs whose handed pair **disagrees** with the listing — the mutant's cap follows the re-derivation, the property demands it follow the parameter. It survives on the agreeing runs, which is exactly why that floor is forced. `RLH-LOOP-03`'s grep oracle reds in the same batch, and the two together are the §11.5 `N-a` enforcement pair. *v1.3 stated this red as a `deriveRoundWindow` call-count equality; that count is `1 + k` on a conforming subject, not 1 (SE F-25)* |
| `PROP-WINDOW-01` (2nd) | same file · swap the positional `startIndex` / `endIndex` arguments at one `checkConverged` call site | the "identical values across all calls" conjunct dies on the ≥15 non-1-`startIndex` cases — and **only** there, which is why that floor is forced; a swapped pair is invisible when both values are 1 |
| `PROP-WINDOW-01` (3rd) | same file · compute `endIndex` as `startIndex + MAX_REVIEW_ROUNDS` (off by one) | conjunct (ii) dies on every exhausted run: the window width and `reviewLoop`'s returned `iterations` count come from different sites, so they disagree by one. **This is the mutation `PROP-ROUND-01` could not kill at L1** — the row that discharges SE F-02's second identity |
| `PROP-AWAIT-01` | `orchestrate-dev.js` · remove an `await` from a seam call at a site matching no §8.5 ruling | the site is unclassified; the property fails loudly rather than warning. Detected in **batch 2**, before any of the code that would depend on it |
| `PROP-AWAIT-01` (2nd) | the classifier · re-admit `Promise.race` to ruling 3 | the withdrawn-ruling fragments (expected `unclassified`) now classify; the withdrawal is asserted, not merely documented |
| `PROP-AWAIT-01` (3rd) | the walk · stop masking template literals | the ≥15 masked-region fragments report phantom sites; the walk's own correctness is what those fragments test, separately from the classifier's |
| `PROP-AWAIT-01` (4th) | classifier · decide ruling **2** on the backward half alone, dropping the forward half PLAN §9.2 item 3(c) prescribes | the ≥10 backward-only fragments — §9.2 item 3(c)'s own `() => _agent(a) && other` shape — flip from `unclassified` to `returned-promise`. Ruling 2's *both halves* requirement is the whole of its soundness, and no fragment outside that floor can see it. Both halves are stated in §9.2 item 3(c) and cited there, not restated here (SE F-12) |
| `PROP-AWAIT-01` (5th) | classifier · return **both** exemptions (an array) for a site both rulings claim | the ≥10 both-rulings-applicable fragments die on the **cardinality** assertion — exactly one outcome, and it is a member of `{returned-promise, awaited-combinator-argument}`. This is the row that replaces the label round-trip §4.4 withdrew (SE F-15) |

### 5.4 Rows that deserve their own sentence

**`PROP-COMPLETE-01` (4th) falsifies against the *specification*, not the subject.** The mutation
leaves the production function correct and shrinks a catalogue — the required heading set. The
property reds, because its non-vacuity floor is derived from that catalogue by set equality rather
than written out by hand. This is deliberate and it is the main reason §3.3's floors are stated as set
equality: a generator that samples a catalogue silently narrows when the catalogue narrows, and a
property that cannot notice its own domain shrinking is a property that decays into a tautology one
commit at a time.

**One such row is deliberate; two would have been a habit.** v1.0 paired this row with
`PROP-GINV-01` (3rd), which mutated the *test's* exit catalogue. SE F-06 is right that a ledger whose
falsifiers are increasingly mutations of the harness is a ledger drifting away from the software, and
`PROP-GINV-01`'s catalogue is additionally not the test's to own — TSPEC §2.5 owns it (§4.3). That row
now names a **subject** mutation (step G moved inside the `STALE` branch), and the specification-level
falsifier stands alone.

**The 36-dispatch anti-oracle, restated.** v1.0 recorded `PROP-EPISODE-01` (2nd) as a falsifier of
the *test* — "raise `MAX_AUTHORING_DISPATCHES`; nothing reds, correctly" — on the premise that the
bound is asserted *against the constants*. TSPEC §4.8 does not export those constants, so that
premise was false and the row is withdrawn (§4.3, SE F-02); `PROP-EPISODE-01` (2nd) is now an ordinary
subject mutation. The anti-oracle it was protecting against is still real and is recorded here rather
than as a ledger row, because it is a warning to the writing task and not a mutation anyone will
perform: **do not hard-code `36`, and do not recompute the bound from the subject.** The first reds on
a legitimate constant change while the subject is right; the second greens on a broken bound
expression, because it compares the subject with itself. §4.3's oracle avoids both by reading `I` and
`B` from two different observed surfaces.

## 6. Fixtures

### 6.1 What exists today, measured

`pdlc/workflows/__tests__/fixtures/` currently holds **two** entries — `covered-violations/`, a
directory tree used by the guard suites, and `tmpGitFixture.js` — and `__tests__/helpers/` holds
**thirteen entries: twelve `.js` modules plus a `bin/` directory**, of which `driftGenerators.js` is
the one this document builds on (§3.1). *v1.0 said one fixture entry and twelve helper modules; the
fixture count was wrong, and v1.1's "thirteen modules" over-corrected the second by counting `bin/` as
a module. Re-measured against the tree (SE F-09, SE F-18); the load-bearing claim below —
`testPathIgnorePatterns` excludes the directory — is unaffected by either figure.* **None** of the fixtures this feature
needs exists at HEAD; every one below is created by the task named beside it, and each is listed in
PLAN §4.2's file table.

`testPathIgnorePatterns` excludes `/__tests__/helpers/` and `/__tests__/fixtures/`, so a fixture
module is never collected as a suite — measured in `pdlc/workflows/package.json`. That is what makes
`digest-vectors.js` safe as a `.js` fixture rather than a `.json` one.

### 6.2 Digest known-answer vectors — `__tests__/fixtures/digest-vectors.js` (RLH-06, batch 2)

Four vectors per TSPEC §8.2: the empty string, an ASCII string, a multi-byte UTF-8 string, and a
surrogate-pair emoji string — each with its 64-hex digest **computed externally** and pasted in.

**Why externally.** These are the correctness oracle for `sha256Hex`, and `PROP-DIGEST-02` is only a
coverage oracle beside them (§4.1). A vector computed by Node's `crypto` inside the test would still
be a valid oracle for the *test process*, but it invites the failure mode §5.1 forbids: someone
"simplifies" the fixture into a live `crypto` call, and the comparison becomes the subject against
itself. The vectors are literals so there is nothing to simplify.

PLAN §4.2 is explicit that the last two vectors are the **only** falsifier of a wrong `utf8Bytes`;
`PROP-DIGEST-02`'s ≥15-cases-above-U+FFFF floor exists to keep that falsifier from depending on four
hand-picked strings.

### 6.3 Fenced-region fixtures — `__tests__/fixtures/cross-reviews/` (RLH-03, batch 2)

Three byte-exact files, per TSPEC §8.2 and PLAN §4.2:

| Fixture | Pins |
|---|---|
| `quoted-verdict.md` | the **nested four-in-three** form — a four-backtick fence containing a three-backtick fence. PLAN §4.2 records why: *a three-in-three fixture passes under the wrong implementation*, i.e. under a boolean toggle. It is the example twin of `PROP-SCAN-01`'s unclosed-fence floor |
| `quoted-hash.md` | an approval trailer behind a `>` quote — the example twin of `PROP-HASH-01`'s ≥10 quoted-or-fenced floor |
| `unclosed-fence.md` | a fence opened and never closed — the example twin of the ≥5 unclosed floor |

**Byte-exactness matters and is fragile.** These files carry significant trailing whitespace and
significant line endings; an editor that trims either changes what the fixture pins. They are
authored once, by RLH-03, and not reformatted afterwards.

### 6.4 Heading fixtures — `__tests__/fixtures/completeness/` (RLH-12, batch 4)

Copied **verbatim from the SKILL templates as they read at the end of batch 3** — hence RLH-12's
declared edges on RLH-08 and RLH-09. PLAN §10.2 and its risk row `H-j` state plainly what this does
and does not buy: the copy is a point-in-time snapshot and **detects no subsequent SKILL edit**, and
bolting a fixture-versus-SKILL comparison onto `completeness.test.js` is explicitly *not* this
feature's work.

`PROP-COMPLETE-01` does not change that. It quantifies over generated **document text** whose headings
are drawn from the required set `R` — v1.0 said "present-sets", the wrong domain for
`isComplete(artifactClass, docType, fileText)` (PM F-01, §4.1) — and its §5.2 **fourth** row shows it
reds when `R` shrinks. It says
nothing about whether `R`'s headings still match the SKILLs — that gap stays open, owned where PLAN
§10.2 leaves it, and §8.3 below records it rather than quietly implying a property covers it.

### 6.5 String ownership — cite, never retype

The rule the fixtures and the generators both obey, from PLAN §4.2's repeated instruction (*"copy it
from there, do not retype it from here"*) and §1.4 above:

- **Halt messages** (`Cannot enumerate {dirPath}: {reason}`, TSPEC §4.2 / §6.2) — the property
  imports or reads the production constant and interpolates its own generated `dirPath`. It never
  spells the sentence out. A retyped message greens against a subject that emits a *different*
  retyped message, and the two drift apart silently.
- **Catalogues** (`LIST_FAILURES`, `FILENAME_FAILURES`, `HASH_FAILURES`, `TRAILER_FAILURES`, the role
  and doc-type catalogues, the six force**able** phases of `parseForcePhases` — distinct from the
  **seven** phases carrying a `reviewLoop` call site, which is D6's axis; §3.2) — the generator
  enumerates the catalogue itself (§3.3), which is what makes the set-equality floors meaningful.
  TSPEC §2.5's **five gated exits** are a catalogue in exactly the same sense, cited from §2.5 and not
  re-listed here (§4.3).
- **Constants** (`MAX_REVIEW_ROUNDS`, `MAX_AUTHORING_ATTEMPTS`, `MAX_AUTHORING_DISPATCHES`,
  `MAX_AUTHORING_WRITE_BYTES`) — TSPEC §4.8 makes these **module-level and not exported**. A property
  at L1/L2 therefore cannot import them; it obtains them the way the rest of the suite does (through
  the injected surface or, for `PROP-AWAIT-01`, from the source text) and asserts *relationships*
  between them, never their values.

  **Which injected surface, precisely.** v1.0 left "through the injected surface" unnamed, and that
  vagueness is what let two properties assert a constant against itself (SE F-02). TSPEC §7.1 names
  the surface: of the five `MAX_REVIEW_ROUNDS` edit sites, *"only sites 4 and 5, which report a
  **count** rather than an index, use the constant alone"* — site 5 returns
  `{ converged: false, iterations: MAX_REVIEW_ROUNDS, lastResults }`, and site 4 renders
  `Iterations (${MAX_REVIEW_ROUNDS} — limit reached)` into `reviewLoop`'s prompt.

  **Measured, because v1.1 named the wrong double here too** (SE F-13): `reviewLoop`
  (`orchestrate-dev.js:531–543`) injects exactly `_agent`, `_parallel`, `_checkFile`. Site 4 is
  therefore observed through the **`_agent` double's recorded prompt** (`:574`,
  `await _agent(optimizer, postmortemPrompt)`); site 5 is observed through **`reviewLoop`'s return
  value**. `recordPhase` is a `main()`-local callback passed to `checkConverged` (`:496`,
  declared `:1574`) and is not a seam of `reviewLoop` at all; v1.1's claim that it captures site 4 is
  **withdrawn**. Those two are the **only** places any test at any level can observe the
  constant's value, and both are L2. A property that needs the constant's value must therefore be an
  L2 property — which is why the width identity moved from `PROP-ROUND-01` to `PROP-WINDOW-01`
  (§4.1, §4.3), and why `PROP-EPISODE-01`'s per-episode cap `B` is *measured by saturation* rather
  than read. §4.3's 36-dispatch bound and §5.4's anti-oracle note are the worked example of this rule.
- **SKILL template headings** — copied by RLH-12 once, per §6.4, and never paraphrased.

## 7. Coverage matrix

### 7.1 Property → assertions generalised → owner → ledger row

AT ids are given in the PLAN's `RLH-`-namespaced form (PLAN §1.3), because that is the form the jest
names take. `Row` is the §7.3 ledger row the property rides (§1.3); `Green from` / `Permitted red`
are that row's, unchanged.

| Property | Level | File | Generalises | Written by | Row (§7.3) | Green from | Permitted red |
|---|---|---|---|---|---|---|---|
| `PROP-DIGEST-01` | L1 | `approvalHash.test.js` | `RLH-AT-12`…`-14`, `-17` | RLH-06 (2) | digest row | batch 3 | batch 2 |
| `PROP-DIGEST-02` | L1 | `approvalHash.test.js` | `RLH-AT-12`…`-14`, `-17` | RLH-06 (2) | digest row | batch 3 | batch 2 |
| `PROP-HASH-01` | L1 | `approvalHash.test.js` | — (new; §8.1's gap) | RLH-06 (2) | digest row | batch 3 | batch 2 |
| `PROP-STALE-01` | L1 | `approvalHash.test.js` | `RLH-AT-15`, `-16`, `-18` | RLH-06 (2) | `RLH-AT-15/-16/-18` | batch 8 | batches 2–7 |
| `PROP-SCAN-01` | L1 | `scanLines.test.js` | `RLH-AT-65`, `-66` | RLH-03 (2) | scanLines row | batch 3 | batch 2 |
| `PROP-NAME-01` | L1 | `roundDerivation.test.js` | `RLH-AT-01`…`-06`, `-63` | RLH-11 (2) | round-derivation row | batch 3 | batch 2 |
| `PROP-ROUND-01` | L1 | `roundDerivation.test.js` | `RLH-AT-01`…`-06`, `-63` | RLH-11 (2) | round-derivation row | batch 3 | batch 2 |
| `PROP-FORCE-01` | L1 | `forcePhases.test.js` | `RLH-AT-29` (and `-28`, `-01a`) | RLH-14 (2) | force-phases row | batch 3 | batch 2 |
| `PROP-COMPLETE-01` | L1 | `completeness.test.js` | `RLH-AT-60`, `-62` | RLH-12 (4) | `isComplete` row | batch 6 | batches 4–5 |
| `PROP-TRAILER-01` | L1 | `pacingWrapper.test.js` | `RLH-AT-61-loop` | RLH-21 (3) | **own row — a genuinely new §7.3 entry, five cells stated in §1.3**; greened by RLH-05(f), not by the pacing work it shares a file with (§4.2) | batch 3 | **none** |
| `PROP-LIST-01a` | L2 | `haltAndQueue.test.js` | `RLH-AT-21`…`-27` | RLH-25 (3) | halt-and-queue row | batch 9 | batches 3–8 |
| `PROP-LIST-01b` | L2 | `pacingWrapper.test.js` | `RLH-AT-43a` | RLH-21 (3) | pacing row | batch 7 | batches 3–6 |
| `PROP-RESOLVE-01` | **L2** | `approvalSearch.test.js` | `RLH-AT-08`…`-11`, `-56`, `-57` | RLH-24 (3) | approval-search row | batch 8 | batches 3–7 |
| `PROP-APPROVE-01` | L2 | `approvalSearch.test.js` | `RLH-AT-08`…`-11`, `-56`, `-57` | RLH-24 (3) | approval-search row | batch 8 | batches 3–7 |
| `PROP-GINV-01` | L2 | `haltAndQueue.test.js` | `RLH-AT-13a` | RLH-25 (3) | halt-and-queue row | batch 9 | batches 3–8 |
| `PROP-EPISODE-01` | L2 | `pacingWrapper.test.js` | `RLH-AT-35`…`-54`, `-58` | RLH-21 (3) | pacing row | batch 7 | batches 3–6 |
| `PROP-WINDOW-01` | L2 | `reviewLoop.test.js` | `RLH-LOOP-01`, `-02` | RLH-22 (3) | `RLH-LOOP-01`/`-02` | batch 9 | batches 3–8 |
| `PROP-AWAIT-01` | L3 | `runtimeBundle.test.js` | `RLH-AT-19`, `-20`, `RLH-SCAN-01` | RLH-31 (2) | first row | **batch 2, on arrival** | **none, ever** |

Seventeen properties, eighteen ids (`PROP-LIST-01` splits into `-01a`/`-01b` across two files, one
owner each, per §1.3 and PLAN §7.4's `-module`/`-orch` precedent).

### 7.2 What each property covers that its examples cannot

| Property | The examples pin | The property adds |
|---|---|---|
| `PROP-DIGEST-01` | four canonicalisation outcomes | the **normal form** over arbitrary byte soup, incl. mid-line `\r` |
| `PROP-DIGEST-02` | four known-answer digests | totality of the 64-hex shape, and that canonicalisation is *inside* the digest |
| `PROP-HASH-01` | one quoted-trailer fixture | that **no** input yields a `hash` outside `/^sha256:[0-9a-f]{64}$/` — the whole labelled value TSPEC §5.5's guard admits, not a bare hex run (PM F-01) — and that every rejection names a `HASH_FAILURES` member, `duplicated` and `absent` included, which no AT states over the input space (§4.2) |
| `PROP-STALE-01` | three named edits | the whole edit space — every mutation is `"STALE"` unless it is a normalisation — **plus** the `"UNEVALUABLE"` guard as an `iff`, which no AT states |
| `PROP-SCAN-01` | two near-misses, three fixtures | *compositions* of near-misses, and conservation of line count |
| `PROP-NAME-01` | six named filenames | the **rejection** half — a negative over the complement of the catalogue |
| `PROP-ROUND-01` | six branch states | the three-way partition over every branch state incl. empty, derivation from the highest observed round, and width **invariance** (the width *identity* is `PROP-WINDOW-01`'s — §4.1) |
| `PROP-FORCE-01` | three inputs | catalogue closure, and that `all` expands to exactly six |
| `PROP-COMPLETE-01` | three document texts | the `iff` over heading text, `missing` as an exact set, the `TBD`-vs-fenced-`TBD` body boundary, and detection of `R` itself shrinking |
| `PROP-TRAILER-01` | four trailer shapes | **mutual exclusion** across recognisers — a cross-recogniser claim no AT makes |
| `PROP-RESOLVE-01` | three presence vectors | all sixteen, exhaustively, plus order-independence |
| `PROP-LIST-01a` | four dispositions at one phase | the phase × failure **product** — the H-2 shape |
| `PROP-LIST-01b` | one two-episode refresh | arbitrary interleavings, incl. phase changes mid-sequence |
| `PROP-APPROVE-01` | approvals that are found | approvals that must **not** be found: out-of-window, stale, half-unanimous |
| `PROP-GINV-01` | four enumerated exits | **reachability over paths** across TSPEC §2.5's **five** gated exits plus the `FRESH` non-path — the framing under which H-2 was visible and enumeration was not |
| `PROP-EPISODE-01` | three interleavings | the bound over all interleavings, and per-coordinate `EpisodeKey` independence |
| `PROP-WINDOW-01` | one threading assertion + a grep oracle | that the window `reviewLoop` enforces came **from the gate** — shown on runs where a re-derivation would have answered differently — and is read identically by every consumer for the phase's whole duration |
| `PROP-AWAIT-01` | two zero-match regexes + a site list | the classification as a **total partition of the scan set `S`**, i.e. a **cover** of the obligation — `S` itself is narrower than "every seam call", per §8.5's exemption (§8.4) |

### 7.3 Distribution against the test pyramid

Ten L1, seven L2, one L3 — measured against §7.1's `Level` column. *v1.0 counted eleven and six; `PROP-RESOLVE-01` moved to L2 (§4.2, PM F-04).* That shape follows TSPEC §8.3's
own levelling rather than a target: the pure parsers and the digest path are where generated input
buys the most, the orchestration invariants need the seam doubles and so cost more per case, and
exactly one invariant (`PROP-AWAIT-01`) is about the source text rather than about behaviour.

**No property runs at L4.** Nothing here spawns a process, touches the filesystem, or reads `dist/`
(§2.4). The 100-case budget per property (§2.5) is set so that seventeen properties add a bounded
increment to a suite already measured at ~180 s wall time — the figure that already exceeds the 180 s
foreground watchdog and is why the baseline was run in the background.

## 8. Gaps, residuals, and measured inconsistencies

### 8.1 Measured inconsistency — TSPEC §8.1 and §8.2 do not agree on the property count

§8.1 states that *every parameterisable component in the L1 row carries at least one property*, and
names that row as `every parser, sha256Hex, scanLines, isStale, isComplete, deriveRoundWindow,
parseForcePhases, updateQueueStatus`. §8.2's table has **seven** rows. The difference is six
components: `parseApprovalHash`, `parseRevisionComplete`, `parseResolvedMarker`,
`extractRecommendation`, `isStale`, `updateQueueStatus`.

This document closes four of the six (`PROP-HASH-01`, `PROP-TRAILER-01` — which covers
`parseRevisionComplete` and `parseResolvedMarker` jointly through the mutual-exclusion conjunct — and
`PROP-STALE-01`). §8.2 remains the authority on the seven it owns; nothing here amends it. **The
finding itself is reported to the TSPEC's owner rather than silently absorbed**: a converged spec that
asserts a universal and enumerates a proper subset of it is the same shape as the defects this feature
exists to fix, and it should be corrected in a TSPEC revision — not by this document quietly making
the universal true.

**Does the count close the gap in substance?** No, and the distinction is worth stating (PM Q-03).
`PROP-TRAILER-01`'s conjuncts are **cross-recogniser**: mutual exclusion over the line space, and
closure of `TRAILER_FAILURES`. Neither quantifies over `parseRevisionComplete`'s own input space or
`parseResolvedMarker`'s own input space in the way §8.1's universal — *"every parameterisable
component … carries at least one property"* — is asking for. What the two recognisers have is a joint
property that would catch one of them accepting the other's input, and a catalogue-closure property
that would catch either inventing a reason. What they do not have is a per-recogniser round-trip of
the kind `PROP-NAME-01` gives `parseReviewFilename`. So: **four of six closed by count, two of those
four closed only jointly**, and §8.1's universal remains open in substance for those two. That is
stated here rather than left to be inferred from the arithmetic, and it is a second reason the finding
belongs with the TSPEC's owner rather than being absorbed silently.

### 8.2 Measured limitation — the shipped `shrink` cannot shrink this feature's cases

TSPEC §8.2 says `shrink` is used for the failure report. Measured at HEAD,
`__tests__/helpers/driftGenerators.js`'s `shrink(caseValue)` switches on `caseValue.kind` over exactly
four kinds — `"manifest"`, `"bytes"`, `"id"`, `"subRecipe"` — and its `default` branch returns `[]`.
**Every case shape this feature generates falls through to that default**: line arrays, filename sets,
presence vectors, episode interleavings, source fragments. Taken literally, the TSPEC sentence is
unimplementable for these properties as the helper stands.

Disposition (§2.3), and it is deliberately **not** a change to `driftGenerators.js`:

| Case shape | Approach |
|---|---|
| a single text/byte string (`PROP-DIGEST-01/-02`, `PROP-HASH-01`, `PROP-STALE-01`'s document) | wrap as `{ kind: "bytes" }` and use the shipped rung unmodified. It is **one rung, not a ladder**: measured, `driftGenerators.js:423` sets `const BYTES_FLOOR = 64;` and the `"bytes"` arm returns `[]` at or below it and a single truncation rung above it. v1.0 presented this row as the shipped mechanism doing useful work; that presentation is withdrawn (SE F-05, §2.3). **Which of these four properties the rung is a no-op for is stated once, in §2.3's table, and is not restated here** — v1.1's blanket "a no-op on every case they generate, their strings are shorter" over-shot: the DIGEST pair's domain is `n ∈ 0…512`, so most of its corpus is *above* the floor and does get the rung (PM F-01) |
| everything else (line arrays, filename sets, presence vectors, interleavings, fragments) | a **file-local** shrink ladder, declared per property in §4 |

This respects PLAN §7.2 exactly: generators — and now ladders — stay per-file, file-local and
unexported; no second primitive library is written; `driftGenerators.js` is reused unmodified. The
alternative, extending `shrink` with five new kinds, would touch a helper seven existing suites depend
on, in a feature whose whole subject is not breaking things quietly.

### 8.3 Deliberately without a property, and where each is owned

**DC-08 applies: each of these names a successor surface — a queue row, not a person or a promise.**

| Surface | Why no property here | Successor |
|---|---|---|
| `updateQueueStatus` | its input space is a two-state lifecycle write with an external effect (a commit); the interesting invariant is *transactional*, not generated, and PLAN §7.4 already splits its assertions into `-module`/`-orch` halves with owners. A generated property would restate `RLH-AT-30`…`-34` without adding a quantifier | none needed — covered by the AT split at both levels. Recorded here so §8.1's list is fully accounted for |
| `extractRecommendation` | it extracts a free-text field; there is no invariant over generated prose beyond "returns a string or nothing", which is an assertion, not a property. Writing one would be a green square with no falsifier — §5.1's definition of worse than none | none. Explicitly declined, not deferred |
| `MAX_AUTHORING_WRITE_BYTES` (TSPEC §4.8) | the constant governs **authoring agent behaviour**, not workflow code. Nothing in `orchestrate-dev.js` reads it in a way a property can quantify over; `skillFiles.test.js` asserts only that the figure is *stated* in the SKILLs (PLAN §9.1). There is no oracle for the behaviour it names | **queue row Order 9, `pdlc-authoring-contract`** (`docs/pdlc-authoring-contract/REQ-pdlc-authoring-contract.md`, status `blocked`, `Depends-On: pdlc-review-loop-hardening`) — the row **reserved for** the authoring contract. Measured, and stated rather than implied: `docs/pdlc-authoring-contract/` **does not exist on disk**; the row is a queue entry with a REQ path, at status `blocked`, not an artifact that already owns anything. v1.0 wrote "already owns", which read as though the successor surface were in place (SE F-11). It is a named, tracked successor — which is what DC-08 requires — and nothing more |
| SKILL template ↔ `completeness.test.js` fixture drift | PLAN §10.2 / risk `H-j` state this is undetected and that bolting a comparison onto `completeness.test.js` is out of scope; §6.4 explains why `PROP-COMPLETE-01` does not close it | **queue row Order 9, `pdlc-authoring-contract`** — the same row PLAN §10.2 points at |
| per-worktree consumer state (`.claude/workflows/`) | not this feature's surface at all; noted only because `PROP-AWAIT-01` reads source and a reader may wonder which tree it reads (answer: `pdlc/workflows/*.js`, never `dist/`, never `.claude/`) | **D-DIST-07 / queue row Order 6, `pdlc-install-mechanism`** |

### 8.4 Residual risks this document carries

1. **The `PROP-` namespace is already occupied** (§2.1, measured: 431 matches across 28 files, 23
   domains, including a live `describe("PROP-GATE-01: …")` at `pipelineWiring.test.js:235`). The
   sixteen domains chosen here were each verified to return zero matches at HEAD, and `PROP-GATE-01`
   was renamed `PROP-GINV-01` for exactly this reason. **This verification is point-in-time**: a
   future feature can collide again. The durable fix is the `RLH-`-style namespacing PLAN §1.3 already
   mandates for ATs, extended to properties — which is a PLAN convention change, not this document's
   to make.
2. **Non-vacuity floors are asserted, but the floors themselves are hand-chosen.** Every floor in §4
   is stated as an assertion the property makes about its own corpus, so a generator that stops
   producing a shape fails loudly. What is *not* checked is whether a floor of ten is enough; that is
   a judgement, revisited if a defect escapes.
3. **Seven of the seventeen properties depend on seam doubles behaving synchronously** — six at v1.0, plus `PROP-RESOLVE-01` now that PLAN §11.5 `N-b` places it at L2 (§4.2; this answers PM Q-02) — while the
   production adapter is async (the C-2 consequence: every injected IO call must be `await`ed). A
   subject that forgets an `await` can pass an L2 property against sync doubles and fail in the
   runtime — which is precisely the hole `PROP-AWAIT-01` exists to cover at L3, and why it is
   green-on-arrival with **no permitted red, ever**.
4. **`PROP-AWAIT-01` covers the scan set, not every seam call in the file.** TSPEC §8.5's
   anonymous-arrow exemption is *"inherited by nobody"* — it is stated for the site at HEAD and is unsound
   in general. At HEAD that is `orchestrate-dev.js:1866`'s `batch.map((task) =>` arrow, whose `agentFn(`
   call at `:1867` is the site PLAN §4.1's advisory list names (both line numbers are correct, for
   different things — the arrow and the call). A second anonymous arrow added tomorrow inherits nothing
   and is simply outside `S`, so `PROP-AWAIT-01` will not see it and will not complain. v1.0 called the
   classification a *total partition* of the seam call sites, which overstated this; §4.4 now states it
   as a **cover** of the obligation over `S`, and the shortfall lives here (SE F-08).
5. **`PROP-EPISODE-01`'s per-episode cap `B` is measured, not read.** §6.5 explains why (TSPEC §4.8
   exports nothing), but a measured `B` means a subject that has *no* cap saturates at whatever the
   generator's per-episode dispatch attempt ceiling happens to be, and `B` would be measured as that
   ceiling. The generator's ceiling (8) is therefore deliberately set **above** the specified cap (6),
   and the property additionally asserts `B < ceiling` — if `B` ever equals the ceiling the measurement
   is not a measurement and the property fails rather than passing on a tautology. **A second, distinct
   shortfall** (SE F-16): beyond the degenerate no-cap case, a `B` that is uniformly *wrong* — a subject
   capping at 7 where the spec says 6 — is invisible, because `B` is measured with the **same
   instrument** that produces conjunct (i)'s left-hand side, on a different input. The measured cap and
   the measured dispatches move together, so the equality still holds. `I` does not have this problem
   (`reviewLoop`'s return value is a genuinely different site); `B` does. §8.5 item 3 makes the
   analogous admission for `MAX_REVIEW_ROUNDS`, and item 4 now makes it for `B`.
6. **Three `UNEVALUABLE` classes were routed to a property that did not assert them, and one still has
   no owner** (PM F-03). TSPEC §6.2 rows 6–7's `absent` and `duplicated` trailer classes are now owned
   by `PROP-HASH-01` (§4.2, named-`reason` conjunct with ≥5-case floors each), and `unparseable` by
   `PROP-STALE-01`. The **unreadable document** class has no property here and is not covered by
   `PROP-APPROVE-01`, whose conjuncts are tier discipline, window respect and idempotence and whose
   generator produces no unreadable input. It is an IO-failure path at the reader seam, not a parser
   invariant. v1.1 claimed the class was "covered at the seam by `PROP-APPROVE-01`"; that claim is
   **withdrawn**, because a division of labour with an empty side closes this ledger against a live
   gap.

   **This residual has no successor row today, and v1.2's binding was DC-08's own inverse failure**
   (PM F-02). v1.2 bound it to **queue row Order 9, `pdlc-authoring-contract`** and described that row
   as one *"whose scope is the read/write contract these seams sit on"*. `docs/_queue/QUEUE.md` states
   row 9's scope in its own words, and it is not that: its three bound items are *"the **same**
   underlying gap: the six author/review SKILLs are the authoring interface, and they declare nothing
   machine-readable about what they produce"*, and its instruction to whoever authors the REQ is
   *"Scope this row's REQ to *declaring* those contracts in the SKILLs, not to re-implementing row 0's
   mechanism — the mechanism is correct, it is the interface that is undeclared."* An
   `_readFile` → `null` path at the reader seam **is** row 0's mechanism, which that sentence
   explicitly excludes. The two items §8.3 binds to row 9 (`MAX_AUTHORING_WRITE_BYTES`, SKILL-template
   drift) do fit that charter, which is what makes this third one the outlier rather than the pattern;
   §8.3's two bindings stand and only this one is withdrawn. DC-08's Origin names precisely this
   failure — *"row existed but description false"* — so the description is not repaired by softening
   it.

   **Recorded state, in place of a false attribution: no successor.** Every row in `QUEUE.md`'s table
   was read (0–7 and 9); none charters reader-seam IO-failure coverage. Closing this residual
   therefore requires an **action by a queue owner**, and it is stated here as an action rather than
   as a fact: either **row 9's REQ must be scoped to include the reader seam** when it is authored, or
   a new row must be allocated for it. Until one of those happens the gap is **unowned**, and that is
   what this ledger now says. An honestly unowned gap is recoverable; a gap bound to a row whose
   charter will not pick it up is not, which is the whole of DC-08.

### 8.5 What could not be written against the specs

**Five** items, recorded rather than invented — v1.0 recorded one, v1.1 added two, and round 2 adds
two more. Each is a place this document would have had to assert something the specs do not expose.

**1. TSPEC §4.5's `EpisodeKey` is defined by its five
coordinates, but the specs do not name a canonical serialisation for it.** `PROP-EPISODE-01`
therefore asserts *independence* of counters across pairs differing in one coordinate — a
formulation that needs no serialisation — rather than the more direct "equal keys share a budget,
unequal keys do not", which would require the test to construct a key and so to fix a serialisation
the TSPEC does not own. If a serialisation is later pinned, the property can be strengthened; it is
correct, and weaker than it could be, as written.

**2. `invocation` is not an independently settable input, so it cannot join the sole-differing-coordinate
floor.** TSPEC §4.5 defines it as *"monotonic within `(artifactSet, phase, round, mode)`"* and notes
that *"without `invocation`, the counters have nothing to increment"* — it is produced by the counter,
from the other four. No seam lets a test hold four coordinates fixed and set the fifth. v1.0's floor
demanded ≥3 pairs differing solely in `invocation` and was unsatisfiable (SE F-04). §4.3 states the
four-coordinate floor plus a separate, differently shaped `invocation` conjunct (re-entry consumes the
same budget). The *direct* statement — "two episodes differing only in `invocation` are the same
episode" — is what could not be written, and it is recorded here rather than approximated.

**3. `MAX_REVIEW_ROUNDS` and `MAX_AUTHORING_DISPATCHES` have no L1-observable surface at all.** TSPEC
§4.8 makes them module-level and unexported; §3.7 gives `deriveRoundWindow` no width parameter; §8.4
bars L1 from the filesystem. The only surfaces that expose a value are TSPEC §7.1's edit sites 4 and 5,
both inside `reviewLoop`, both L2 (§6.5). So the sentence *"`endIndex - startIndex + 1` equals
`MAX_REVIEW_ROUNDS`"* is unwritable as a pure-function property, and v1.0 wrote it anyway, against
itself (SE F-02). What replaced it — width **invariance** at L1, the width **identity** against an
observed count at L2 — is strictly weaker at L1 and strictly stronger overall, and the gap that
remains is this: **nothing at any level asserts that the count `reviewLoop` reports is the same
constant the window derivation uses.** Both could be wrong together, consistently, and every property
here would stay green. Closing that needs an export the TSPEC declines to make, so it is recorded, not
invented.

**4. `MAX_AUTHORING_DISPATCHES` has the same problem, one degree worse.** §8.5 item 3's admission is
owed to `B` as well (SE F-16), and `B` is weaker than `I`: `I` is *reported* by the subject at a site
distinct from the dispatch counter, so a wrong `I` and a right count disagree. `B` is **measured by the
same instrument** as the quantity it bounds, so a uniformly wrong cap is consistent with itself and
`PROP-EPISODE-01`(i) stays green. What conjunct (i) discriminates is therefore **segment structure** —
the `1 + I` episode count and the per-segment budget reset — not the cap's value. Closing this needs
either an export TSPEC §4.8 declines to make or a reported cap the subject does not emit; recorded,
not approximated. §8.4 residual 5 carries the operational form.

**5. No artifact states a precedence between TSPEC §8.5's rulings 2 and 3.** A site can satisfy both —
a call inside an `await`ed `Promise.all([...])` whose element is an arrow body followed by `,`. PLAN
§9.2 item 3(c) instructs the walk to find the enclosing context *"and decide the three rulings from
it"* — and PLAN §0's row for F-03 (`PLAN:1504`), where the phrase *"to decide which §8.5 ruling, if
any, applies"* actually lives, says no more (R-6, attribution corrected here) — while TSPEC §8.5's
table is unordered, so **which** exemption a conforming classifier names is undetermined. Both exempt the site,
so behaviour is well-defined and only the *label* is not. This document **declines to invent the
precedence** (SE F-15): §4.4 asserts cardinality over those fragments — exactly one outcome, drawn from
`{returned-promise, awaited-combinator-argument}` — rather than a hand-authored label that would red a
correct classifier on §7.3's no-permitted-red row. **Reported upward as a specification gap**: if a
precedence is wanted it belongs in TSPEC §8.5's rulings table, where the rulings live, and the
strengthening of §4.4's floor from cardinality to a label follows automatically. Not filled here.

Everything else in §4 was derived from a spec section that states the invariant outright.
