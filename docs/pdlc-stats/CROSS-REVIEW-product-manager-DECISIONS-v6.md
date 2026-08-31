# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.4, bytes unchanged)
**Upstream re-grounded on:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.3, erratum round 4)
**Date:** 2026-08-31
**Iteration:** 6 (upstream-cascade confirmation)

## Context

This is an **upstream-cascade confirmation**, not a re-review. `DECISIONS-pdlc-stats.md` is
byte-identical to the v1.4 I approved at `42cf8850d` (`CROSS-REVIEW-product-manager-DECISIONS-v5.md`,
*Approved with minor changes*, 0 High / 2 Medium). What moved is TSPEC: my approval recorded
`UPSTREAM-STATE: TSPEC` against the v1.1 blob at `66c4049ac`, and TSPEC has since taken **erratum
rounds 3 and 4** (`3eefae1ef` … `e952268bd`, +170/−59 lines), reaching v1.3 at
`sha256:ad630797…`. REQ (`60a516fb…`) and FSPEC (`0b8864d6…`) are unchanged from my approval, so the
whole cascade surface is TSPEC.

The single question: **is DECISIONS still a faithful compression of TSPEC as it now stands?**

What the two erratum rounds changed in the material DECISIONS leans on:

| TSPEC change (v1.1 → v1.3) | Where | Does DECISIONS lean on it? |
|---|---|---|
| Co-change set restated five → nine → **ten** in-repo sites; `pdlc/README.md`'s prose enumeration added as a **row of the site table** | §2.1, §6.4, §7.3, RK-1 | Yes — DEC-STATS-01's cost is the decision's whole rationale |
| The count is made **derivable**: repo-scoped `git grep -l` on probe `lib/loop-session.mjs` → **24** candidates, one stated filter drops the **14** pure consumers, 24 − 14 = 10 | §2.1 | Yes — K-9 promotes the sweep as a durable constraint |
| `loop-distribution.test.js` row gains an eighth assertion edit (P7-02's `vendoredClassWord` ternary) | §2.1 | Yes — K-8 owns that file |
| `coverageInstrumentation.test.js` row names P9-02's title, six → **seven** | §2.1 | Yes — K-3 owns that pair |
| §6.4 grows five → **seven** oracles; classifier purity is **split by return type** — non-aliasing for the three object-returning classifiers, **A-B-A** for `deriveDodRoundIndex` — plus a construction-site-count oracle | §6.4 | Yes — DEC-STATS-03's named detector and K-4 |
| BR-11 / BR-16 / BR-25 errata closed at FSPEC v1.4 and removed from §8.3 | §4.3, §8.3 | No — DECISIONS routes no BR erratum |
| Option B's row now names `publish-preflight.mjs`'s second copy of the engine `lib/` class | §2.1 table | Partly — DECISIONS already carries this from its own v1.4 |

I re-ran TSPEC's new derivation at HEAD rather than trusting it: `git grep -l "lib/loop-session.mjs"
-- . ':!docs/'` returns **24** files; the 14 the stated filter drops are `bin/cli.mjs`,
`orchestrate-dev.js`, `orchestrate-queue.js`, the generated `workflows/dist/pdlc-cli.mjs` and ten
`loop*`/`loopSession*` test files; the ten that survive are exactly §2.1's rows, `pdlc/README.md`
included. TSPEC's ten is reproducible. DECISIONS' nine is not a different-but-defensible count — it
is the same class measured before the README row was admitted, and DECISIONS states in prose that
the README **is not** a tenth site-table row. That sentence is now a positive contradiction of its
upstream, not a lag.

## Options Considered

Three readings of "does DECISIONS still hold" were available, and the choice between them decides the
verdict, so it is stated rather than assumed.

**Reading 1 — the items landed, so the confirmation passes.** Rejected. The dispatch is explicit that
the item list is necessary, not sufficient (DEC-ERR-03), and nothing in the erratum items was routed
*to* DECISIONS at all: DECISIONS' bytes never moved. If the confirmation only asked "did the routed
edits land in TSPEC", it would pass trivially and let a document whose central number now disagrees
with its upstream stand as approved.

**Reading 2 — the divergences are cosmetic, since the decision does not change.** Rejected, though it
is the tempting one and it is half true. DEC-STATS-01 still chooses option A, DEC-STATS-02 and
DEC-STATS-03 are untouched, and no divergence below flips a verdict. But DECISIONS is not consumed as
a verdict; it is consumed as the **implementation contract** — its K-rows are the task list a PLAN
author partitions and an implementer executes. Two of the divergences below would put wrong
instructions into that contract: a nine-row co-change checklist against a ten-site upstream, and a
purity assertion TSPEC now states reds against a *correct* implementation. A finding an implementer
would act on wrongly is not cosmetic.

**Reading 3 (taken) — measure DECISIONS' citations against TSPEC at HEAD, clause by clause, and
report every place upstream no longer says what DECISIONS says it says.** This is what DEC-ERR-03
asks for. I walked every DECISIONS claim that names a TSPEC section, number, oracle or site, re-read
the corresponding TSPEC text at v1.3, and checked the underlying fact against the tree where the
claim is mechanical.

**Scope discipline.** I did not re-open DEC-STATS-01's chosen option, DEC-STATS-02, DEC-STATS-03's
substance, K-2, K-5, K-6, K-7, the *What these decisions do not decide* section, or the project-level
decisions — all were approved at v5 and none is touched by the TSPEC delta. Findings F-01…F-05 below
are all consequences of the TSPEC edit; F-06 is my own v5 Medium, restated as inherited so it is
visibly still open and visibly non-gating.

**One divergence runs the other way**, and I resolved it toward DECISIONS. TSPEC's new
`coverageInstrumentation.test.js` row says P9-02's title moves "six → seven". At HEAD the title says
`six` while `pkg.c8.include` already holds **seven** entries — the title is stale by one before this
feature starts, so the feature takes it to **eight**. DECISIONS' v1.4 changelog has this right
(`REQUIRED_INCLUDES` … "seven not six today, eight after the feature"), which I verified at v5 and
re-verified here. The repair is owed **upstream**, and DECISIONS must not be "corrected" into
agreement with it (F-05).

## Decision

**DECISIONS no longer holds as approved against TSPEC v1.3.** Not because a decision changed — all
three still read as the right calls — but because the document's load-bearing citations into TSPEC
§2.1 and §6.4 now describe a version of TSPEC that no longer exists, and in two places assert the
opposite of what upstream says.

The two gating divergences:

**1. The nine-site cost, and the README sentence (F-01, High).** DEC-STATS-01's *Context* prices
option A at "**nine** sites", its option table says "sweep-derived, 5 → 6", K-1 says "**nine**
co-change sites … edited in **one** change", *Reversibility: hard* says "amending nine sites", and
*Standing costs accepted* says "**nine** edit sites — five enumerations plus four test files". TSPEC
§2.1, §6.4's vendoring row, §7.3 and RK-1 all now say **ten**. Worse than a stale number, DECISIONS
argues the point explicitly: *"it is not a tenth row of the site table, and the two reviewers agree …
so the site count stays nine and the edit is still owed: an explicit, non-falsifying co-change
obligation under K-9."* TSPEC v1.3 has since decided the other way — README is row ten, pinned by no
oracle, named in RK-1's residue with an owning task. The *substance* the two documents want is
identical (the edit is owed; nothing pins it; K-9 owns it). Only the accounting differs, and it is
the accounting a PLAN author partitions. A ten-item upstream checklist compressed into a nine-item
contract is exactly the partial-co-change failure RK-1 exists to prevent.

**2. The purity detector, stated in terms upstream has withdrawn (F-02, High).** DEC-STATS-03's
trigger carries a *named detector*: "a purity conjunct on the four exports — call each classifier
twice with the same input in a fresh module instance and assert deep-equal, **non-aliased** results".
TSPEC v1.3 split that conjunct by return type and says in terms why: `deriveDodRoundIndex` is typed
`=> number`, "two equal numbers are `===`, so a non-aliasing assertion over it reds against a
*correct*, wholly pure implementation", and it gets an **A-B-A** conjunct instead. DECISIONS'
sentence, executed literally, produces a test that fails against correct code — the one failure mode
worse than no test, because it trains the team to loosen the oracle. The same paragraph's "Until it
lands, the residual is explicit" and the *Standing costs accepted* row's "Until it lands" are also
now stale: it landed, as two of §6.4's seven oracles.

Neither divergence changes which option is chosen, which is why this is a **bounded re-grounding
edit**, not a re-decision. But both are `delta` and both sit inside the sections TSPEC's edit changed,
so this confirmation cannot approve.

**Recommendation: Needs revision.**

## Consequences

What the next DECISIONS edit must change, in priority order. This is a **targeted re-grounding**: no
restructuring, no re-litigation, no decision reopened.

1. **F-01 — move nine → ten throughout, and replace the README argument with upstream's ruling.**
   Sites: DEC-STATS-01's *Context* ("Option A's nine sites"), the option-A table row, the *Corrected
   cost claim* paragraph, K-1's headline ("**nine** co-change sites"), K-1's site-numbering tail
   ("sites 8 and 9" becomes 8–10 once README is a row), *Reversibility: hard*, and *Standing costs
   accepted*'s "nine edit sites — five enumerations plus four test files". The paragraph that
   declines README as a tenth row should be rewritten to record what actually happened: two reviewers
   reached one placement, TSPEC v1.3 reached the other, and the site table is where it now lives —
   with the falsifier column stating honestly that this row has **none**, which is the property that
   originally motivated excluding it. Keep the K-9 ownership; only the accounting moves.

2. **F-02 — restate DEC-STATS-03's detector as TSPEC now specifies it.** The *named detector*
   paragraph and the *Standing costs accepted* row must say: deep-equal **and non-aliased** over the
   three object-returning classifiers (`parseReviewFilename`, `deriveRoundWindow`,
   `parseResolvedMarker`), **A-B-A** over `deriveDodRoundIndex`, all inside one freshly-imported
   module instance — and must drop "Until it lands", which is no longer true. If DECISIONS wants to
   keep one sentence of rationale, the load-bearing one is upstream's: deleting the conjunct rather
   than splitting it would have removed DEC-STATS-03's only mechanical detector.

3. **F-04 — re-ground K-9's promoted constraint on the derivation TSPEC now ships.** This one leaves
   the feature: it is destined for `docs/_constraints/DOMAIN-CONSTRAINTS.md`. As written it promotes
   `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` → 25 files → nine transcribers. TSPEC's
   reproducible form is probe `lib/loop-session.mjs`, source-restricted, **24** candidates, one stated
   filter dropping the **14** pure consumers, **10** sites. Promote the *rule* (repo-scoped never
   `__tests__/`-scoped; `git grep` not `grep -r`, for NUL files; re-pick the probe when the class
   changes) with upstream's **worked query and numbers**, plus the occurrence-not-file clause my v5
   F-01 asked for — otherwise the durable artifact ships a query whose count no longer reproduces the
   document that cites it.

4. **F-03 — K-8's "Seven assertion edits in all" becomes eight.** TSPEC's row now folds P7-02's
   `vendoredClassWord` ternary into the count. DECISIONS already owns that edit, as a separate "Plus
   the word map K-7 depends on" clause, so the *work* agrees and only the headline number does not —
   but the headline is what a task-sizing PLAN author reads.

5. **F-05 — do not adopt TSPEC's "six → seven" for P9-02's title; route it back.** DECISIONS is the
   correct document here (seven entries at HEAD, eight after the feature). Add nothing to DECISIONS
   beyond, at most, a clause naming the divergence; the erratum is owed to TSPEC §2.1.

6. **F-06 (inherited, non-gating) — my v5 F-01 remains open.** Option B is still priced at four
   sites; `loop-distribution.test.js:186`'s `(4 + 15 + 1)` holds the engine `lib/` class a second
   time. It is a rejected option's price, it does not touch the chosen option, and it was
   *Approved with minor changes* at v5. Fold it into the same edit if convenient; it does not gate.

**What is not affected.** Chosen option A, DEC-STATS-02, DEC-STATS-03's substance and trigger,
K-2/K-4/K-5/K-6/K-7, the sibling-document carve-out, the exclusion-set and non-feature-directory
material, and the project-level decisions. Phase D is not blocked on a re-decision — only on a
re-grounding pass.

## Positive Observations

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
