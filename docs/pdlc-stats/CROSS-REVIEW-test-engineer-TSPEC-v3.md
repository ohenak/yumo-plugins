# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.1, bytes unchanged since approval)
**Upstream at HEAD:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.4, sha256:60a516fb…f1c9),
`docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.4, sha256:0b8864d6…17b0)
**Date:** 2026-08-31
**Iteration:** 3 (cascade confirmation, not a re-review)

## Summary

The question this round answers is narrow: the TSPEC's own bytes have not moved, but the FSPEC it
compresses was edited after approval (REQ v1.3/v1.4 → FSPEC v1.4, commits `ef7a2a64a`…`6e7985d14`),
so the version I approved no longer exists. I re-read the upstream delta and every TSPEC passage
that leans on it.

**Behaviourally the TSPEC still holds — textually it no longer does.** The erratum round landed, in
the upstream documents, exactly the readings §4.3 had already chosen and routed as errata:

| Upstream change at HEAD | What TSPEC §4.3 already decided | Agreement |
|---|---|---|
| REQ-STATS-06 + FSPEC BR-16 now state the harvested test over BR-14's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` / `CODE_REVIEW-{feature}-v{N}.md` grammars, evaluated over "exactly the file set BR-14's numerator sums" | `crossReviews = basenames.filter(b => parsers.parseReviewFilename(b).ok)`; harvested asked over the same membership that supplies the numerator | exact |
| FSPEC BR-11 now scopes the DoD harvested test to `CODE_REVIEW-{feature}-v{N}.md`, and says a `-draft` suffix or another feature's name "neither raises the number nor suppresses `harvested`" | `n = deriveDodRoundIndex(...) - 1; if (n > 0) measured else if (harvested) harvested else measured 0`, feature name escaped before matching | exact |
| FSPEC BR-25 now names `docs/completed/QUEUE-HISTORY-rows-0-1.md` as a third loose file | §4.4's `isDirectory`-only discovery; the file was already dropped by the filter | exact |

No computation, no state token, no exit code and no key set changes. The divergence the TSPEC was
managing has been resolved *in the TSPEC's favour*, which is the good outcome — but it leaves the
document asserting, as fact, upstream wording that has been deleted, and re-raising three errata
that are now closed. That is a fidelity break in the sections the delta touched, and it is what F-01
and F-02 are about; F-03 is an inherited oracle weakness the new AT-17 leg makes newly repairable.

## Design

Nothing in §2 (module placement, layering, `lstat` choice, the parser bundle) reads on the changed
upstream text; the delta touches BR-11, BR-16, BR-25 and two AT bodies only. §2.5's parser-identity
premise is if anything strengthened: the upstream now says out loud that grammar membership decides
both the numerator and the harvested state, which is precisely the invariant the identity oracle
protects.

The one design-level passage that has gone stale is §4.3, in two paragraphs:

- **DoD rounds (BR-10, BR-11)** — the TSPEC states "FSPEC BR-11's wording is looser (`no
  CODE_REVIEW-* file remains in the directory`), and the two readings disagree on a directory left
  holding a `CODE_REVIEW-{feature}-draft.md` or a foreign-feature `CODE_REVIEW-` file… the FSPEC's
  looser wording is routed as an erratum (§8.3)". At HEAD, FSPEC BR-11 states the grammar-scoped
  form and spells out the `-draft` and foreign-feature leftovers explicitly. There is no looser
  wording, no disagreement, and nothing to route.
- **The harvested test reads "no `CROSS-REVIEW-*` remains" grammatically, and that is a choice** —
  the TSPEC states "FSPEC BR-16 and REQ-STATS-06 both phrase the condition over `CROSS-REVIEW-*`,
  and the two readings genuinely disagree…" and closes with "The FSPEC's ambiguity is routed as an
  erratum (§8.3), not resolved by silence." At HEAD both documents phrase the condition over the
  grammars, and FSPEC BR-16 names the `CROSS-REVIEW-{role}-REVIEW-v{N}.md` shape and
  `docs/completed/pdlc-advisory-wave-gate/` itself. The ambiguity is gone.

Both paragraphs are load-bearing prose an implementer TDDs from: each tells them the FSPEC means
something the FSPEC no longer means, and each justifies the code by a divergence that no longer
exists. The repair is a re-grounding edit, not a design change — the `if` chains stay byte-identical.

## Seams

Unaffected, and I checked rather than assumed. §3.2's four driver exports
(`parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, `parseResolvedMarker`) are the
only classification seam, and the upstream delta changes no grammar any of them implements — it
narrows two upstream *predicates* onto the grammars those functions already enforce. §3.1's
`StatsIo` members, §3.3's public surface, §3.4's CLI wrapper and §3.5's exit codes are untouched by
the delta, and the FSPEC's error paths, stdout guarantee and JSON envelopes were not edited this
round.

One seam-adjacent consequence is worth stating positively: because `deriveDodRoundIndex` escapes the
feature name before matching and `parseReviewFilename` returns `ok: false` for out-of-catalogue doc
types, the newly explicit upstream sentences ("neither raises the number nor suppresses
`harvested`"; "a basename failing a grammar contributes no bytes and counts as no file remaining")
are *inherited from the driver*, not re-coded here. That is the strongest possible form of the
agreement, and §4.3 already says so.

## Data structures

`MetricState`, `DodRounds`, the ratio record and §4.2.1's JSON key sets are unchanged by the delta.
No new state token appears upstream: `harvested` still has the same three producers, `n/a` /
`unavailable` still has one, and BR-16's precedence over BR-15 is restated in the new FSPEC text in
the same order the TSPEC implements (`harvested` tested before `specBytes === 0`). The `schemaVersion`
contract and the exact-key-set conjuncts I approved in v2 are untouched upstream and remain faithful.

## Verification

Two upstream acceptance tests grew a leg this round, and this is where the confirmation earns its
keep.

**AT-12 gained a third directory** — `LEARNINGS` plus only `CODE_REVIEW-{feature}-draft.md` and
another feature's `CODE_REVIEW-{other}-v2.md`, asserted `harvested`. TSPEC coverage holds: §6.2's
"Unit — seamed" level pins "every metric's branch table (§4.3), each state reachable", and §4.3's
DoD paragraph already states both leftovers' behaviour with the mechanism that produces it (feature
name escaped before matching; `-draft` does not match at all). The new leg adds a fixture, not a
branch, and it is drivable with `fakeStatsIo` exactly as specified. Nothing to file.

**AT-17 gained a fourth directory**, and here the TSPEC's own fixture is weaker than the AT. The
upstream leg is: `CODE_REVIEW` files **intact**, plus — as its only `CROSS-REVIEW-` basenames — the
out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` form; asserted `harvested`, not a measured
ratio. §4.3's corresponding sentence describes "a directory with `LEARNINGS-*.md`, one
`CROSS-REVIEW-{role}-REVIEW-v1.md`, and no grammar-passing cross-review, asserted `harvested`" —
and says nothing about DoD files. Run that fixture against the TSPEC's own predicate:

```
if (harvested && (crossReviews.length === 0 || dodReviews.length === 0)) -> harvested
```

With no `CODE_REVIEW-{feature}-v{N}.md` in the fixture, `dodReviews.length === 0` is true, so the
fixture returns `harvested` **whatever the left disjunct does** — including under the literal
`CROSS-REVIEW-`-prefix reading it is written to exclude. As specified it is a test that cannot fail
for the property it claims to pin: a green tells you nothing about grammatical membership. The
upstream AT supplies the missing conjunct in four words ("`CODE_REVIEW` files intact"), which forces
the left disjunct to be the only thing that can produce `harvested`. This is an inherited weakness —
the sentence is unchanged pre-round bytes — but the delta is what makes it repairable and what makes
the divergence visible, so it should be closed in the same edit as F-01.

**Everything else in §6 survives the delta.** §6.1's real-path baselines are unaffected: the archive
did not move, and I re-checked the two literals the delta could plausibly touch — AT-09's
`docs/completed/pdlc-advisory-wave-gate/` still carries exactly the four
`CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` basenames the new FSPEC BR-16 text
now names by example, and AT-11's `CODE_REVIEW-pdlc-loop-economics-v{1,2}.md` pair still gives `2`.
§6.6's mutation row "swap BR-16's harvested test before/after BR-15's zero-denominator test" still
names AT-17's **third** fixture, and that is still correct — the third fixture (harvested with zero
spec bytes) remains the discriminating one; the fourth leg does not disturb it. §6.3's cross-mode
oracle, §6.4's four anti-drift oracles, §6.5's read-only oracle and §6.6's PROP-3 read on no changed
upstream text.

## Risks

- The three Mediums I raised in v2 (F-01 parser-identity conjunct, F-02 vendoring oracle over
  `WORKFLOW_MEMBERS.length`, F-03 the `[^-]+` erratum line) are untouched by this delta and remain
  open as recorded; they are not re-raised here and they do not gate.
- §8.3's fourth bullet — FSPEC BR-26/EC-10's missing positive feature-recognition predicate — is
  **still genuinely open**; the erratum round did not touch BR-26. It must survive the pruning F-02
  asks for, or a real open item is lost with the closed ones.
- The FSPEC's own §7.3 now says "Two errata remain" and lists REQ-STATS-05's post-mortem
  classification and D-8's wording. Those are FSPEC→REQ errata and sit outside this document's
  channel; no TSPEC statement depends on them.

## Recommendation

**Needs revision** — one High, and it is a small, bounded, purely textual edit.

The TSPEC's *design and behaviour still hold against the FSPEC as it now stands*; every rule the
erratum round rewrote was rewritten into the reading §4.3 had already taken. What no longer holds is
the document's account of its upstream: two §4.3 paragraphs and three §8.3 bullets describe FSPEC
and REQ text that has been deleted, and justify correct code by a divergence that is closed. A TSPEC
whose stated reason for a branch is "the FSPEC says otherwise and we route it as an erratum" is not
a faithful compression once the FSPEC agrees.

Exactly what to change, and nothing more:

1. §4.3 DoD paragraph — replace "FSPEC BR-11's wording is looser… routed as an erratum (§8.3)" with
   a statement that FSPEC BR-11 (v1.4) and REQ-STATS-04 now both scope the harvested test to
   `CODE_REVIEW-{feature}-v{N}.md`, and that `-draft`/foreign leftovers neither raise the number nor
   suppress `harvested` — the upstream's own words. Keep the mechanism sentence about escaping.
2. §4.3 harvested-test paragraph — replace "FSPEC BR-16 and REQ-STATS-06 both phrase the condition
   over `CROSS-REVIEW-*` … the FSPEC's ambiguity is routed as an erratum" with the agreement: BR-16
   (v1.4) evaluates the condition "over exactly the file set BR-14's numerator sums", which is the
   membership `parseReviewFilename(...).ok` supplies. The REQ C-4 grounding stays; the choice is now
   a citation, not a divergence.
3. §4.3's boundary fixture — add the conjunct FSPEC AT-17's fourth leg names: the fixture holds
   grammar-matching `CODE_REVIEW-{feature}-v{N}.md` files **intact**, so `dodReviews.length === 0`
   cannot supply the `harvested` result and the grammatical cross-review disjunct is the only thing
   under test (F-03).
4. §8.3 — delete the BR-16, BR-11 and BR-25 bullets (all three closed by REQ v1.4 / FSPEC v1.4) and
   **keep** the BR-26/EC-10 bullet, which is still open. Optionally record in the version header
   that the TSPEC is re-grounded on FSPEC v1.4.

No `if` chain, no oracle, no key set, no exit code and no traceability row needs to move. I expect
this back green in one pass.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | High | delta | local | §4.3 asserts as fact upstream wording deleted by the erratum round: "FSPEC BR-11's wording is looser (`no CODE_REVIEW-* file remains in the directory`)" and "FSPEC BR-16 and REQ-STATS-06 both phrase the condition over `CROSS-REVIEW-*`, and the two readings genuinely disagree". At HEAD, FSPEC BR-11 scopes the DoD test to `CODE_REVIEW-{feature}-v{N}.md` and names the `-draft`/foreign leftovers; FSPEC BR-16 and REQ-STATS-06 state the condition over BR-14's grammars and BR-16 adds "evaluated over exactly the file set BR-14's numerator sums". Both paragraphs also close by routing an erratum (§8.3) that no longer exists. Behaviour is unaffected — the TSPEC's `if` chains already implement the now-approved reading — but the implementer TDDs from prose that misdescribes the approved FSPEC and explains a correct branch by a closed divergence. Re-ground both paragraphs on FSPEC v1.4 / REQ v1.4; change no code sketch. | §4.3 (DoD rounds BR-10/BR-11; "The harvested test reads … grammatically") |
| F-02 | Medium | delta | local | §8.3 raises four upstream errata, three of which the erratum round closed: the BR-16 `CROSS-REVIEW-*`-vs-grammars ambiguity (BR-16 now states the grammars), the BR-11 dropped "matching the version grammar" qualifier (BR-11 now carries it), and the BR-25 incomplete loose-file illustration (BR-25 now names `docs/completed/QUEUE-HISTORY-rows-0-1.md`). Left standing they re-route settled items upstream and invite a re-open of decisions this round closed. Delete those three; keep the BR-26/EC-10 bullet, which the erratum round did not touch and which is still genuinely open. | §8.3 (bullets 2, 3, 4) |
| F-03 | Medium | inherited | local | §4.3's boundary fixture for the grammatical harvested reading is specified as "a directory with `LEARNINGS-*.md`, one `CROSS-REVIEW-{role}-REVIEW-v1.md`, and no grammar-passing cross-review, asserted `harvested`" — with no DoD files. Under the section's own predicate `harvested && (crossReviews.length === 0 \|\| dodReviews.length === 0)`, the empty `dodReviews` set alone yields `harvested`, so the fixture passes under the literal `CROSS-REVIEW-`-prefix reading too: it cannot fail for the property it exists to pin. FSPEC AT-17's new fourth leg supplies the missing conjunct — `CODE_REVIEW` files intact — which makes the cross-review disjunct the only path to `harvested`. Add that conjunct to the fixture description. Pre-round bytes, but the new AT leg is what makes it repairable now. | §4.3 (boundary fixture sentence); FSPEC AT-17 |

FINDING: High | delta | local | §4.3 (DoD rounds; harvested-test paragraph) | §4.3 states FSPEC BR-11/BR-16 and REQ-STATS-06 wording that the erratum round deleted, and routes a now-closed erratum; behaviour unaffected, prose must be re-grounded on FSPEC v1.4 / REQ v1.4.
FINDING: Medium | delta | local | §8.3 (bullets 2, 3, 4) | Three of four upstream errata are closed by REQ v1.4 / FSPEC v1.4 (BR-16 grammars, BR-11 qualifier, BR-25 second loose file); delete those three, keep the still-open BR-26/EC-10 bullet.
FINDING: Medium | inherited | local | §4.3 (boundary fixture sentence) | The grammatical-harvested boundary fixture omits DoD files, so the `dodReviews.length === 0` disjunct produces `harvested` regardless of the cross-review reading under test; add FSPEC AT-17's "CODE_REVIEW files intact" conjunct.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}
