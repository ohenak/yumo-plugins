# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.4)
**Date:** 2026-08-31
**Iteration:** 6 (delta confirmation, not a full re-review)

## Scope of this confirmation

The routed item was reported **absorbed** upstream at HEAD, so no item list remained to land. What
this round confirms is therefore the other half of the contract (DEC-ERR-03): the delta that rode
the erratum commit, and whether the TSPEC is still a faithful compression of its upstream at the
version dispatched to me — REQ `sha256:60a516fb…` and FSPEC `sha256:25af3c47…`, both re-hashed from
the working tree, both matching the dispatch.

The delta under confirmation is `e952268bd..HEAD` on `docs/pdlc-stats/TSPEC-pdlc-stats.md`: three
commits, 31 insertions and 6 deletions. Two are body edits (§1's co-change count, §6.4's
"four enumerations" disambiguation) and one is the v1.4 changelog block that records a re-grounding
on FSPEC v1.4 → v1.5.

## What I checked

### 1. The upstream re-grounding claim is true, and it is framing-only

The changelog asserts FSPEC moved v1.4 → v1.5, that §7.3 became a settled record of five closed
errata E-1…E-5, that the same stale "live disagreement" framing was corrected at §1's fidelity
anchor, BR-06, BR-12, BR-27, EC-09 and §7.1's D-8/D-9, and that **no behavioural change** followed.
I did not take that on trust: I diffed FSPEC `6e7985d14..HEAD`. The diff is exactly those sites plus
the §7.3 rewrite and the changelog. No business rule's decision moved, no exit code moved, no
acceptance test moved. EC-09 keeps exit 1 and `no_docs_root`; BR-27 keeps "gap rows are rows" and
fleet exit 0; D-9's answer is still the root failure. Only the *justification voice* changed —
"raised as an erratum" became "REQ v1.4 carries the carve-out". That is precisely the class of
upstream move that obliges no downstream re-derivation, and the TSPEC says so rather than inventing
work to look diligent.

### 2. Nothing in the TSPEC narrated those six sites as live divergences

This was the real risk of the round: a downstream document that had been leaning on "upstream and I
disagree here" would go stale the moment upstream stopped disagreeing. I grepped every TSPEC
citation of C-5, BR-06, BR-11, BR-12, BR-16, BR-25, BR-27, EC-03, EC-09, D-8, D-9 and BR-30.

- §4.3's DoD-rounds paragraph already states BR-11's version-grammar qualifier as **specified
  behaviour** and says "there is no divergence left to reconcile" — absorbed at v1.2, so E-1's
  closure is a confirmation of it, not a correction to it.
- §5's `no_docs_root` row already carries D-9 and BR-30 (`feature` is `null` only on a fleet-mode
  root failure), which is E-4's post-closure reading verbatim.
- E-2's C-5 carve-out is about post-mortem **discovery**. §4.3's halt matcher reaches post-mortems
  by the artifact convention's basename form and never claimed a C-5 divergence there, so the
  carve-out lands beside it without touching it. I checked the matcher text, not just the claim.
- §8.3's one open erratum (FSPEC BR-26/EC-10's absent positive feature-recognition predicate) is
  genuinely **not** among E-1…E-5 — the five close against REQ wording, this one is raised by the
  TSPEC against the FSPEC, a different direction on a different channel. It correctly still stands.
- E-5's zero-state row is what §4.4's provisional-predicate argument leans on via EC-03/AT-26.
  Closing E-5 makes that support firmer, not weaker; the TSPEC's "strengthens rather than expires"
  is the right reading.

The version labels the document carries — "FSPEC BR-11 at v1.4", "closed at REQ v1.4 / FSPEC v1.4" —
are provenance stamps for *when a wording landed*, and I verified the stamped text is byte-for-byte
what FSPEC BR-11 and BR-16 say at v1.5. They are not stale claims that upstream sits at v1.4.

### 3. Edit (a): §1's co-change count now agrees with §2.1's derivation

§1 previously restated "four vendoring enumerations", a number §2.1, §6.4, §7.3 and RK-1 had already
moved to ten. Two live counts in one document is a defect generator, and the fix is the right shape:
§1 now cites §2.1's ten and declares §2.1 the owner of the count rather than carrying a second copy.

I re-derived the parenthetical rather than reading it. "Six symbol edits across five in-repo
enumeration files, four further pinning sites, and `pdlc/README.md`" partitions §2.1's table exactly:
`prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs` (two symbols)
and `package.json`'s `c8.include` are the five enumeration files carrying six symbol edits;
`loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js` and
`learningsPremises.test.js` are the four pinning sites; `README.md` is the tenth. 5 + 4 + 1 = 10, and
the two `docs/completed/` sibling rows stay outside the in-repo ten and are named separately as the
frozen-packed-set carve-out. The arithmetic closes.

### 4. Edit (b): the "four script-side enumerations" subset is measured, not asserted

§6.4 said `assertAdditiveOnly`'s length equality fires "the moment the first of the four enumerations
is edited" — readable, after the count moved to ten, as a contradiction. The edit names the subset
explicitly as §2.1's sites 1–4 and states that four is what this oracle reaches, not a rival total.

I checked the oracle at HEAD rather than the description. `pdlc/engine/__tests__/loop-distribution.test.js`
calls `assertAdditiveOnly` four times, against `prepack.mjs`'s `MODULE_NAMES`,
`publish-preflight.mjs`'s `WORKFLOW_MEMBERS`, `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS` and
`fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES` — exactly sites 1–4, and the helper's third
assertion is the length equality the sentence claims. Site 5 (`c8.include`) is *not* reached by it,
which is why §6.4's coverage claim stays "four of the ten directly and a fifth indirectly … via
`coverageInstrumentation.test.js`". The subset boundary in the prose is the subset boundary in the
code.

### 5. Nothing previously approved broke

The two edits are prose-level and touch no behavioural claim, type, signature, oracle or code
sketch — I confirmed that from the diff, not from the changelog's assertion of it. §2.1's ten-site
table, its 24 − 14 = 10 derivation, the eighth `loop-distribution.test.js` assertion edit, the
`README.md` un-oracled residue and §6.4's purity split — everything v5 approved — are unchanged.

## Positive Observations

- **The count was made single-owned, not merely corrected.** §1 could have been patched to say "ten"
  and left carrying its own copy; instead it cites §2.1 and says who owns the number. A second copy
  of a live count is what produced this finding in the first place, so removing the copy removes the
  recurrence, not just the instance.
- **The subset is disambiguated by naming the four files, not by rewording.** "Four script-side
  enumerations (§2.1's sites 1–4: `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`,
  `_tspec-packed-set.mjs`)" is checkable against the oracle in one grep, and I checked it in one
  grep. A reader who suspects the four/ten tension now resolves it without a round.
- **The re-grounding distinguishes a framing move from a behavioural move and acts accordingly.**
  FSPEC v1.5 changed voice at six sites and nothing else; the TSPEC re-derived nothing and said,
  per site, why nothing was owed. Re-deriving §3–§6 to look thorough would have risked churn on
  approved oracles for no upstream reason.
- **The one open erratum was not swept up in the closure.** BR-26/EC-10 is a TSPEC→FSPEC item, not
  one of the five REQ-facing ones, and §8.3 keeps it standing while §4.4 keeps shipping a stated
  provisional predicate with a blast-radius table. Closing five errata is exactly when a sixth gets
  quietly closed by association; it did not happen here.

## Delta-Confirmation Findings

No findings.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:512a9fcfd425725363024ec856597da6918d6d376247be2271b2d4af0c0af81f
APPROVAL-HASH-NORMALIZED: sha256:d8d1e9ddcb8a8c5756dd8f4ae4725d8d16b7e1247717a41ad83e3e5db8309ee3
REVIEWED-COMMIT: c61ed537ce39bbfc3bd3c72a789e6a9d20be3262
UPSTREAM-STATE: REQ sha256:60a516fb2ede925b2428dca1bc8e4e61587c52827ea55b9e4965ea57b9a8f1c9
UPSTREAM-STATE: FSPEC sha256:25af3c47c218d8987d258c6bda917cb5fecd21014ec794864c4e7b9a1cafd7f8
