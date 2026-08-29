# Cross-Review: product-manager — TSPEC (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.4)
**Date:** 2026-08-28
**Iteration:** 4
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.
Delta re-review protocol: prior findings verified first, then only the changed sections scanned for new issues.

## Method

Diffed `64cb78029..HEAD` on the TSPEC (80 insertions, 25 deletions) — changed regions are the v0.4
changelog block, §2.3 (TE Q-01 answer), §3.6's headroom paragraph, §7.3's shipped-default assertion,
§7.5's model paragraph, §9.1's D-10 row, and §9.2's ERR-2. Nothing outside those regions moved.

Prior-round dispositions, each checked against the artifact rather than the changelog's word:

| v3 finding | Asked for | Landed |
|---|---|---|
| F-01 (Medium) — D-10's third conjunct vacuous on a project-level-only input | build the assertion where the byte bound binds, so `omitted[]` is non-empty and the origin partition can falsify a reversed drop order | Yes — §7.3 now builds over the whole fixture, splits the assertion into three numbered conjuncts, states the non-emptiness explicitly, and records the rejected project-level-only alternative in D-10 |
| F-02 (Low) — blank line splits §9.1's table before D-10 | delete the blank line so D-10/D-11 render as rows | Yes — `git diff` shows the blank line removed; D-9…D-11 are now one table |

I also re-checked the three code citations this round newly leans on rather than taking the document's
word: the learnings sentinel literals are matched by exact string at
`pdlc/workflows/__tests__/advisoryDisabled.test.js:718-719`, which is the citation §2.3 gives, and the
surrounding comment at `:711-717` confirms the slice is the advisory pin's own, so §2.3's claim that
neither slicer sees the other holds. §7.5's superseded "model is built from the production line
renderer" sentence is gone and the paragraph now reads consistently with the own-formatter argument
four lines below it (TE F-01 closed at the root, not by hedging).

Arithmetic re-derived independently: `8000 − 1200 − 6305 = 495`; `10,859 + 1,200 = 12,059`, so ERR-2's
re-attribution of 12,059 to `M-6b`'s 63-line in-scope set is right and the earlier attribution to
`pdlc-headless-engine` alone was the error; `pdlc-headless-engine` alone at 22 joined lines reconciles
to 4,553 under §7.3's own `\n`-join convention (10,859 − 62 − (6,305 − 40) + 21), so that figure is
consistent too. `41 + 100 = 141` matches §3.5's measured corpus, so §7.3's new record count is the
right number for the whole fixture.

Two issues, neither gating, both inside sections this round changed.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | §7.3 justifies the whole-fixture input as "what a real dispatch gathers"; FSPEC §3.2 step 2 makes the in-scope set project-level **plus one feature**, so no dispatch ever gathers 141 records, and the largest real regime (63 records / 10,859 bytes) is still the one no test exercises | REQ-DECLEDGER-01, FSPEC §3.2 |
| F-02 | Low | Local | §3.6/ERR-2 now say ~495 bytes is "about three" feature-level lines while §7.3's own note on the same quantity says "roughly two" — the two changed sections disagree, and only two whole lines fit | REQ-DECLEDGER-07, C-5 |

### F-01 (Medium) — the input is right; the sentence describing it is not, and one real regime is still untested

My v3 F-01 asked for an input where the byte bound binds so conjunct (3) could falsify a reversed drop
order. This revision delivers that and more: three numbered conjuncts, the non-emptiness of `omitted[]`
stated rather than assumed, an explicit refusal to pin the surviving feature-line *count* (right call —
that count is renderer arithmetic and would churn without naming a defect), and PM Q-01 answered in the
strict direction, both literals hand-transcribed. Conjuncts (1) and (2) are load-bearing and correct,
and conjunct (3) now does work. The mechanism is fine.

What is wrong is one clause of the justification. §7.3:940-941 reads "build the block over the **whole**
frozen fixture — all 141 in-scope records, project-level and feature-level, *which is what a real
dispatch gathers*". FSPEC §3.2 step 2 says otherwise, in the spec's own words: "The set is the project's
closed decisions plus those of the feature whose document is under review... nothing about the document
under review beyond its feature narrows the set." The 141-record union spans **every** feature directory
at once. Under FSPEC that set is unreachable: the largest set any dispatch can produce is §3.6's own
`M-6b` floor — 41 project-level + `pdlc-headless-engine`'s 22 — which is 63 records / 10,859 bytes.

Two consequences, in order of product weight:

1. **The sentence misstates the scope contract inside the section an implementer builds the oracle
   from.** §3.2 step 2's derivability rule is a product commitment (it is what makes the index
   explainable — "your feature plus the project's"), and a reader who meets this sentence while writing
   the fixture builder learns the opposite. This is the correction that matters and it is one clause.
2. **The largest *reachable* regime is still unexercised.** §3.6 and ERR-2 both make their claim about
   real dispatches — "every reviewer receives the whole project-level corpus on every feature", "the
   larger feature directories are partially omitted from the first enabled dispatch". The whole-fixture
   assertion pressures the drop loop harder than reality ever will, so it does subsume the promise in
   practice; but nothing pins the case ERR-2 actually asks REQ to re-decide on, which is 10,859 bytes of
   in-scope material against a 6,800-byte allowance.

Both close cheaply, and (2) is optional. The minimum fix is to delete or correct the "what a real
dispatch gathers" clause — say instead that the whole fixture is a deliberate super-set of any reachable
in-scope set, chosen because it is the smallest available input at C-5's shipped defaults under which
`omitted[]` is non-empty. That keeps the assertion exactly as specified and stops the section
contradicting FSPEC §3.2. If se-author wants (2) as well, the same conjuncts hold verbatim over the
63-record `M-6b` set — project-level ids set-equal to the 41, 6,305 bytes, `omitted[]` non-empty and
entirely feature-origin — because 10,859 > 6,800 makes the bound bind there too. That would be the
reachable-regime pin, and it is a second parameterisation of one assertion, not a new oracle.

### F-02 (Low) — "two" and "three" for the same 495 bytes, in two sections edited in the same round

§3.6:435 now reads "~495 bytes of headroom — about **three** feature-level lines at the measured mean
(495 / 183), two at the largest observed line", and ERR-2 carries the same wording upstream. §7.3's new
note on the identical quantity reads "Under the shipped bound roughly **two** do (§3.6's ~495 bytes of
headroom against a 152–261-byte feature line)". Both sentences were written this round; they disagree.

On the arithmetic, "two" is the defensible word for feature-level lines: `2 × 183 = 366` fits in 495 and
`3 × 183 = 549` does not, and at the largest observed line `261` only one fits. 495/183 = 2.7 rounds to
three as a *ratio*, which is evidently the reading behind the change, but the quantity ERR-2 is reporting
to REQ is how many lines the default admits, and that is a floor, not a round. Note §3.6's own
project-level bullet is unaffected and correct — 495/153 = 3.2 admits three, which is where "~44 promoted
records" (41 + 3) comes from, and that figure should not move.

Suggested resolution: keep the ratio parenthetical, make both sections say "two feature-level lines at
the measured mean (495 / 183 ≈ 2.7), one at the largest observed line", and carry the same words in
ERR-2. Low because the parenthetical makes the figure checkable by any reader and because ERR-2's
direction — 8000 is tight — is unchanged either way.

## Questions

| ID | Question |
|----|---------|
| Q-01 | If the 63-record `M-6b` parameterisation in F-01 (2) is taken, should its `omitted[]` expectation be a set-equality against the 22 hand-transcribed `pdlc-headless-engine` ids, or the weaker origin-partition assertion §7.3 specifies today? Set-equality is falsifiable against a drop loop that stops early, but it re-introduces the line-count sensitivity §7.3's "Note what conjunct (3) deliberately does not say" paragraph just argued against — I read that paragraph as deciding against it, and would rather have that read confirmed than assumed |

## Positive Observations

- **The vacuous conjunct was fixed by changing the input, not by softening the claim.** The cheapest
  escape from v3 F-01 was to delete the sentence claiming the conjunct catches re-ordering and keep the
  conjunct as decoration. The revision took the expensive route instead: whole-fixture input, three
  numbered conjuncts, and an explicit paragraph naming *why* the project-level slice could not falsify
  anything (`omitted[]` empty under every drop order). The oracle now fails on the mutation it exists to
  catch, which is what I asked for.
- **The rejected alternative was recorded, not just abandoned.** D-10's row now carries the round-3
  rejection in full, with the arithmetic that makes it a rejection (41 against `maxEntries` 70, 6,305
  against 6,800). Since §9.1 is what DECISIONS harvests from, a future reader who reaches for the
  simpler project-level input meets the reason it was refused rather than re-deriving it.
- **Conjunct (3) declines to over-specify, and says so.** "The falsifier lives in the origin partition,
  not in the count" is the right product call: pinning how many feature lines survive would redden on
  any line-format change without a defect behind it, and would make §4.3's format a frozen contract it
  was never asked to be. Naming that restraint in the spec is better than exercising it silently.
- **PM Q-01 was answered in the strict direction and generalised.** I asked whether the `omitted[]`
  literal follows §7.3's transcription rule or is derived at test time; the answer covers both literals,
  states the reason for each (echo avoidance for the id set, drift visibility for 6,305), and keeps them
  distinct — 6,305 stays put when ERR-2 resolves while the threshold in (2) moves. That is a sharper
  answer than the question.
- **ERR-2's misattribution was corrected in the direction that costs the author something.** The
  12,059 figure now belongs to the 63-line in-scope set, and `pdlc-headless-engine` alone is restated at
  22 lines / 4,553 bytes — a smaller, less dramatic number for the erratum to carry upstream. Both
  reconcile against §3.6's table under the document's own join convention.
- **TE Q-01's answer prevents a real future misreading.** Two sentinel-bounded regions with different
  literals living in one file is exactly the kind of thing a later reader collapses into one concept.
  §2.3 names both, cites the exact-string match at `advisoryDisabled.test.js:718-719`, and states the
  consequence for §2.3's `/\.enabled\b/` count. I verified the citation and the exact-match claim.
- **Errata still stand rather than being quietly absorbed.** ERR-3 and ERR-4 remain uncorrected at
  `FSPEC-pdlc-decision-ledger.md:359-361` and `:364-367` — AT-02 still says "carries the cited heading",
  AT-03 still says "a record in the frozen fixture copy changes" — and the TSPEC still routes both
  upstream instead of reinterpreting them locally. I re-emit both this round so they land before PLAN
  authoring.

## Recommendation

**Approved with minor changes**

The one Medium and both Lows from round 3 are resolved, and resolved at the root rather than in wording.
No High finding is open, and nothing this revision touched broke a section approved earlier — I checked
each changed region against its prior state and each new numeric claim against my own re-derivation.
From the product lens the document is ready for PLAN authoring.

Neither open finding needs another review round. F-01's required part is a one-clause correction to
§7.3:940-941 so the section stops contradicting FSPEC §3.2 step 2; its optional part — a second
parameterisation of the same assertion over the reachable 63-record set — is worth landing before PLAN
writes the corpus-oracle task, because it changes what that task builds rather than what it asserts.
F-02 is a word in two places plus ERR-2's copy of it. Both, plus the two errata landing at the FSPEC,
close the phase at v0.5.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
