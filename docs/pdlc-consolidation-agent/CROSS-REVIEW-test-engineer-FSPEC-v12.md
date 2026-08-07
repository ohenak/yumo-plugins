# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v11.2)
**Date:** 2026-08-06
**Iteration:** 12
**Scope:** Testing lens only, delta re-review. Baseline for the diff is `8c970a7` — the commit v11 was
written against and pinned in that file's `REVIEWED-COMMIT`. The revision is exactly one commit,
`767b6b5` ("docs(fspec): v11.2 — narrow §14.5 phase-arm ownership, complete E-12b phase readers"),
7 insertions / 5 deletions across three hunks (version row, §14.5 lead, E-12b's field→reader index).
Standing decisions applied: `DEC-LAYER-01`, `DEC-SEV-02`
(`docs/_decisions/DECISIONS-review-severity-bars.md`) and `DEC-CONV-01`
(`docs/_decisions/DECISIONS-review-convergence.md`) — all three re-confirmed present at HEAD.

## Prior findings — disposition

| v11 ID | Sev | Disposition | Evidence in v11.2 |
|----|---|---|---|
| L-01 | Low | **Resolved, exactly as specified, and no wider** | E-12b's field→reader index (`:2591`) now reads "`phase` for §8.3 **/ §8.4's harvest question**". That is the four-word repair I named, in the register I named it in, and it restores the cell-level set-equality §8.1 requires (`:1169-1172`, "a field indexed by a reader whose row omits it" is the same defect as the converse): §8.1's §8.4 steps 2–3 row (`:1182`) indexes `symptom`, the subject `artifact` **and `phase`**, so `phase` has two readers and E-12b now names both. I re-derived the whole eight-field / eight-reader mapping against `:1178-1186` after the edit — `route` (§6.4, §8.4 step 1), `target` (§5.1, §8.6), `action` (§6.4, §8.4 step 1), `artifact` (§8.3, §8.5, §8.4's question), `passId` (§6.4), `phase` (§8.3, §8.4's question), `failure-mode-id` (§8.3, §8.4 step 1, §8.4's question), `symptom` (§8.4's question) — and E-12b is now cell-level set-equal to the table in **both** directions. No other index cell moved |
| Q-01 | — | **Left standing, correctly** | LD-5's `Observable stated at` column (`:2243`) is untouched. I asked whether §6.4 belonged there as a fourth anchor and said I was not filing it under the freeze; the author declined it and made no column edit. That is the answer I flagged as acceptable, and it manufactured no new round |
| Q-02 | — | **Answered by taking the narrower of the two repairs** | I asked whether restoring E-12b's deleted six-word pointer ("per that table's cell-level set-equality") sat inside the freeze. The revision did not restore the pointer; it fixed the **mapping** the pointer would only have policed. That is strictly better for a downstream author: the index is now correct, so no transcriber needs the rule cited to get it right, and no deleted universal came back. The freeze held |

## Findings

Two findings, both new, both inside the two prose hunks this revision introduced, and both of the
same class: the v11.2 narrowing was applied at §14.5's lead and at E-12b's index cell but **not** at
the two other places that carry the same ownership bookkeeping. No unchanged section was
re-litigated. Both are **Low**, and Low under `DEC-SEV-02` on its stated test rather than by
courtesy: no observable, rule, arm or downstream artefact is wrong, every obligation still has a
stated observable and a stated owner somewhere, and each repair is deleting or narrowing an
assertion rather than changing specified behaviour. No High and no Medium.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-01 | Low | Local | **T-10 still carries the un-narrowed universal that v11.2's §14.5 lead now contradicts.** §14.5's rewritten lead (`:2231-2235`) narrows ownership to "**§8.3's `phase` arm and §8.1's `failure-mode-id` arm are this table's alone** (LD-5) … narrowed per SE v11 F-01, which observed that **§8.4 steps 2–3's `phase` half *does* render an unavailable literal and is collected by T-10**". T-10 (`:2161`) was not touched and still asserts the opposite in two sentences: "**§8.1's `phase` and `failure-mode-id` arms are deliberately not here** (SE v10 F-01, TE v10 M-01): neither produces a rendering for TSPEC to spell", and "**Both arms are §14.5 LD-5's, once**". Read literally the two registers now disagree about which one owns the steps 2–3 `phase` half. Nothing downstream is undecidable, which is why this is Low and not a repeat of v10's M-01: T-10's *operative* clause already collects the half generically — "from §8.1's **§8.4 steps 2–3** reader row, the **unavailable-half rendering** — the question is still put to the harvest agent on the fields the record does carry, with **the missing half** stated as unavailable rather than guessed" — so the literal a TSPEC author must spell is present in T-10 today, and the observable is stated normatively at `:1182`. What is falsified is a *bookkeeping ownership assertion about the two registers*, the exact class `DEC-SEV-02` scores Low and directs to be deleted or narrowed rather than repaired. **Repair (narrowing, no new rule):** in T-10, scope the exclusion to the readers it is true of — "**§8.3's `phase` arm and the `failure-mode-id` arms** are deliberately not here" — and either drop "Both arms are §14.5 LD-5's, once" or narrow it the same way. Deleting both sentences is also sufficient and is the `DEC-SEV-02`-preferred shape: LD-5 lists its own entries, and T-10 lists its own | T-10 `:2161`; §14.5 lead `:2231-2235`; §8.1 `:1182` |
| L-02 | Low | Local | **E-12b's AT cell attributes the whole `phase` arm to LD-5, which after the narrowing owns only its §8.3 half.** The same row this revision edited says, further down the AT column and unedited: "The **`phase`**, `failure-mode-id`, `action` and `symptom` arms are likewise stated in that table and unfixtured here, **PROPERTIES-owned per §14.5 LD-5** — notably, short of `phase` §8.3 still emits the row at `insufficient-evidence`". LD-5's `phase` cell (`:2243`) states one reader only — "**`phase`** (§8.3 emits the row, verdict `insufficient-evidence`)" — consistent with the narrowing. So after v11.2 the **steps 2–3 `phase` half** has its rule and observable stated (`:1182`), its literal collected by T-10, and no LD row naming its fixture owner, while E-12b says LD-5 owns it. Compare `artifact`, whose three arms are each enumerated in LD-1 (`:2239`) precisely so a PROPERTIES author can count them — the asymmetry is what makes this worth a line. Testing consequence is one lookup, not one missing test: a PROPERTIES author enumerating short-record fixtures from the **reader table** (which is what §8.1's cell-level rule and AT-F21 direct) gets all of them; only an author enumerating from the LD register alone would come up one half short. **Repair, both shapes acceptable:** either extend LD-5's `phase` cell with the steps 2–3 half in LD-1's spelling ("§8.4 steps 2–3 still put the promotion, with the `phase` half stated unavailable"), or narrow E-12b's attribution to "`phase` (§8.3's half) … per §14.5 LD-5". The first adds an enumerated arm and no rule; the second deletes a claim. Both sit inside the freeze | E-12b `:2591`; LD-5 `:2243`; LD-1 `:2239`; §8.1 `:1182` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | L-01 and L-02 are one narrowing applied at two of four sites, and SE v11 F-01 is what prompted it. Was the intent to narrow *only* the two registers a reviewer had cited (§14.5's lead, E-12b's index), leaving T-10's exclusion sentence and E-12b's LD attribution as prose the freeze protects — or were the other two sites simply not swept? If the former, I would still take L-01's deletion over leaving a direct contradiction between §14.5 and T-10, because a contradiction is the one bookkeeping defect a downstream author cannot resolve by reading harder. |
| Q-02 | Nothing in this revision touched an AT, a BR, a lexicon value or a repo citation, so there is nothing new for me to ground. If the next round is opened only for L-01/L-02, is a version bump to 11.3 with no behavioural delta the right shape, or would the optimizer rather carry both as tracked deferrals into TSPEC? Both are defensible; neither costs an oracle. |

## Positive Observations

- **The v11 Low was repaired at exactly the width I specified, and no wider.** The diff is 7/5
  lines. The `phase` mapping was completed in E-12b's index and the §14.5 lead was narrowed; no
  rule, AT, BR, register row or observable was added, moved or deleted in the process. Under a
  register freeze, a repair that resists growing is worth more than a thorough one.
- **The narrowing is stated with its provenance and its reason, not just its result.** §14.5's lead
  now carries "narrowed per SE v11 F-01, which observed that §8.4 steps 2–3's `phase` half *does*
  render an unavailable literal and is collected by T-10 with the `artifact` and `symptom` halves of
  the same arm". A future reader learns *why* the arm splits across two registers, which is the
  thing that was actually hard about it. That the sentence also makes L-01 legible is a feature: the
  contradiction is visible in the text rather than latent in the omission.
- **The Q-02 answer was the better of the two repairs I offered.** I asked whether a deleted
  pointer could come back; the author instead fixed the mapping the pointer would have policed. An
  index that is correct needs no rule cited above it — this removes the transcription hazard at its
  source rather than adding a guard against it.
- **Every load-bearing set-equality is still intact after a second consecutive editing round.** I
  re-checked the four I have been tracking since v10 — §8.1's cell-level rule (`:1169-1172`),
  §14.5's register set-equality (`:2225-2227`), BR-33a's enumeration-by-set-equality (`:2539`), and
  the AT-level set-equalities AT-F19 (`:2113`), AT-F20 (`:2114`), AT-F21 (`:2115`), AT-Q7c
  (`:2072`) — all present and unedited. AT-F20's eight-name field set is the one an author would
  have had to touch if this diff had changed the field enumeration; it did not, and the diff
  changed only the *mapping*, which is the correct half to have changed.
- **Grounding re-checked at HEAD for everything the diff names.** The changed text introduces no
  new repo path, no new constant and no new lexicon value. The three decisions it leans on all
  exist (`docs/_decisions/DECISIONS-spec-layer-boundary.md`,
  `DECISIONS-review-severity-bars.md` carrying `DEC-SEV-01`/`DEC-SEV-02`,
  `DECISIONS-review-convergence.md` carrying `DEC-CONV-01`), the §8.1 rows the edit reconciles
  against are at `:1182` and `:1184` as cited, and the version row was bumped to 11.2 in the same
  commit as the content change.

## Recommendation

**Approved with minor changes**

My one v11 finding is resolved at the width specified, and both v11 questions were answered — one
by declining a column edit under the freeze, one by taking the narrower repair. Nothing in this
revision re-opens a settled decision. Nothing in it broke a section I had previously approved: I
re-derived the full eight-field / eight-reader cell-level mapping over §8.1's table after the edit
and confirmed E-12b is now set-equal to it in both directions; re-confirmed every surviving
set-equality obligation (§8.1 `:1169-1172`, §14.5 `:2225-2227`, BR-33a `:2539`,
AT-F19/F20/F21/Q7c); confirmed LD-1's three `artifact` arms, LD-5's four arms and their defect
columns are unedited and still total; and confirmed the diff names no repo path, constant or
lexicon value at all.

The two open items are **L-01** and **L-02**, both Low, and both the same shape: v11.2's narrowing
landed at two of the four places that carry this ownership bookkeeping, so T-10 still states the
pre-narrowing universal and E-12b still attributes the whole `phase` arm to LD-5. They are Low on
`DEC-SEV-02`'s stated test, not by courtesy — the steps 2–3 `phase` half has its rule and observable
stated normatively at `:1182`, its literal collected by T-10's generic unavailable-half clause, and
its fixture reachable by any author enumerating from the reader table as §8.1 and AT-F21 direct.
No test is missing and no test would be written wrong; a register disagrees with a register.
Both repairs are deletions or narrowings and add no rule, no BR, no AT and no register entry.

Per `DEC-CONV-01`, this approval **stands** into subsequent rounds of Phase F. I will re-open it
only if a later diff touches a section this review's Scope named, or if I score something
Medium-or-higher against a later delta. Suggested disposition for the optimizer: take L-01 if a
revision is opened for any other reason — a direct contradiction between two registers is the one
of the two worth spending an edit on — and carry L-02 as a tracked deferral. Do not open a revision
solely for either.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:1e55ae3278c6ac2b572a2ddfb7b8e1f9e65c5e28f3cc558bbe5e10426f1f424d
REVIEWED-COMMIT: 767b6b59cf8e49e9b809f2517b73d1444d3579fc
