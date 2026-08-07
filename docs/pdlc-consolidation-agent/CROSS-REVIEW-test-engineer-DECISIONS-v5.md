# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 5
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v4.md`. Diff base
`61f11478` (the commit v4 pinned in `REVIEWED-COMMIT`) → HEAD; three revision commits touched this
document (`4800522a`, `a3227a0a`, `8ee80a62`), +40/−19 lines confined to §5 (DEC-CONS-03 domains
1–3), §6, §8 (DEC-CONS-06) and §11.2 (DEC-CONS-03 property). Testing lens only: whether the v4
finding is closed, and whether the changed text introduced an oracle that cannot fail or one that
mis-transcribes the contract it claims to carry. Unchanged sections approved in v1–v4 are not
re-litigated.

## Disposition of v4 findings

| v4 ID | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | Low | **Resolved, and the retarget is correct at HEAD** | I asked for the obligation cite to move off the partition parenthetical, in all three places, and for §11.2's block range to widen. All three sites now read `TSPEC:2202-2203` and each says in terms which clause the *neighbouring* range is (`:2201-2202` is containment) — §5 domain 1, §5 domain 2, §11.2. Re-measured at HEAD: `TSPEC:2199-2201` is **partition**, `:2201-2202` **containment**, `:2202-2203` **obligation** ("`obliged ⊆ observed` per domain, on / the Given that obliges it"), `:2203` the two `∅` equalities, `:2203-2204` the `Set`-not-multiset clause. The retarget lands on the right clause at both ends |
| — | — | **Every other anchor in the changed text also re-measured, and every one reproduces** | The revision re-anchored the whole document after a TSPEC round that moved the file. Verified individually: the invoking-tree domain row at `TSPEC:1724` and the clone domain row at `TSPEC:1725` (`grep -n` on the two row labels returns exactly those two lines, with the obliged/permitted/absent-always columns transcribed character-for-character in §5); the widened `rtWriteFile` prompt blockquote at `TSPEC:479-480`; `TSPEC §11.6(e)` conjunct 2 at `TSPEC:2282-2284`; the marker probe's `_checkFile` grounds at `TSPEC:992-996` and the three-seam-call take path at `TSPEC:1046-1048`; `_hashFile` as a member of the injection surface at `TSPEC:493` and — re-checked with `grep -n` — nowhere else in the TSPEC. The runtime measurements the §8 paragraph rests on are unchanged and still true: `rtHashFile` at `runtime-adapter.js:613`, its prompt at `:618`, the `_checkFile` transport's `check:${path}` label inside the call at `:821-826`, and `"relative to the repository root"` still a **single** occurrence in that file, at `:805` |

The *Anchor provenance* paragraph the revision added under §11.2 is the right instinct — it records
that the v4 reviews' `:2095-2100` / `:2098-2099` were correct against the TSPEC revision they read,
that the content is unchanged, and that a PROPERTIES author should trust the transcribed assertions
and re-measure if the TSPEC moves again. One numeric caveat, recorded here rather than filed: the
shift is not uniform, so "roughly +105 lines" holds for the §11.3(a) region (`2095`→`2199`, +104;
`1619`→`1724`, +105) but not for the earlier ones (`425`→`479`, +54; `912`→`992`, +80). The
paragraph's advice is right regardless of the number, which is why this is a note and not a finding.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The newly-enumerated fourth conjunct mis-transcribes AT-Q7c's two `∅` equalities, and the substitute is vacuous where the original was the only falsifier.** §11.2 item 4 now reads: "the two `∅` equalities of AT-Q7c (`TSPEC:2203`) — *two*, one per `git` domain, not one. For the invoking tree the absent-always set is `checkout`, `switch`, `stash`, `reset`, `rebase`, every merge verb (`TSPEC:1724`); for the clone it is every merge verb (`TSPEC:1725`). Both intersections with the observed set must be `∅`." That is not what AT-Q7c asserts. `TSPEC:2203` names the conjuncts but defines them nowhere (`grep -n AT-Q7c` on the TSPEC returns only `:2192`, `:2203`, `:2481`, `:2502` — none a definition); the definition is upstream, and it is explicit twice. `FSPEC-…:2154` states AT-Q7c's Given as a `promoted` pass with **no** guard-set proposal, whose oracle is "the **PR seam** and the **clone seam** observing `∅` and the invoking tree observing a set **bounded on both sides**" — i.e. the two `∅` equalities are *whole-domain* emptiness on the **PR seam** and the **clone**, and the invoking tree is explicitly the domain that is **not** `∅`. `FSPEC-…:1060-1063` says so in as many words — "AT-Q7c's two `∅` conjuncts — the PR seam and the clone seam on a no-guard-set pass — *are* equalities, with the empty set rather than with a permitted set … what falsifies a pass that quietly clones or reads a PR when nothing routes there, and weakening them to containment (which `∅ ⊆ permitted` satisfies vacuously) would leave that row nothing to catch." Three consequences for the property this bullet exists to hand a PROPERTIES author: (i) the **PR-seam** conjunct is dropped entirely, so a pass that quietly reads a PR on a no-guard-set Given is no longer falsified anywhere in the transcribed oracle; (ii) the clone conjunct is *inverted from* "observed `= ∅`" *to* "observed ∩ {merge verbs} `= ∅`", which greens on a pass that clones, branches, commits and pushes with nothing routed there — the precise regression `FSPEC:1062` names; (iii) the invoking-tree half the bullet invents is **redundant with containment already asserted as conjunct 2** (absent-always verbs are, by construction, outside `:1724`'s permitted column), so the revision has traded two independent falsifiers for one restatement. The bullet's own next sentence concedes the shape of the error without noticing it: "The clone-domain half is *implied* by containment against `:1725`'s permitted column" — a conjunct that is implied by another conjunct falsifies nothing, which is the signal that the reading is wrong, since AT-Q7c's real clone conjunct (`observed = ∅`) is **not** implied by containment. Restate item 4 as the two whole-domain emptiness equalities on the **PR seam** and the **clone**, on AT-Q7c's `promoted`/no-guard-set Given, and say that neither is implied by containment | §11.2, DEC-CONS-03 bullet, conjunct 4 |

Two notes on the same bullet that do **not** rise to findings, so the optimizer can fix them in the
same edit. The bullet's framing sentence — "enumerated at `TSPEC:2199-2204` **in this order**" — is
correct as a range and as an order (`partition`, `containment`, `obligation`, `∅`, then the `Set`
clause), and conjuncts 1–3 are transcribed exactly against `TSPEC:2199-2203`; the defect above is
confined to conjunct 4. And the closing "Comparison is over a `Set`, never a multiset
(`TSPEC:2203-2204`)" is right, including the anchor.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Once F-01 is restated, is the invoking-tree absent-always intersection worth keeping as a **fifth**, explicitly-redundant note (labelled as implied by containment), or dropped? I have no objection either way — but if it is kept, it must be labelled implied, because an unlabelled redundant conjunct is the kind of thing a later simplification deletes along with a load-bearing one. |

## Positive Observations

- **The re-anchoring pass is the right response to a moving upstream, and it was done by measurement
  rather than by arithmetic.** Every one of the eleven anchors the revision moved reproduces at HEAD
  when checked independently (`TSPEC:1724`, `:1725`, `:479-480`, `:493`, `:992-996`, `:1046-1048`,
  `:2199-2204`, `:2202-2203`, `:2282-2284`). A bulk `+105` applied uniformly would have broken the
  early-file cites, which shifted `+54` and `+80`; they are individually correct instead.
- **The v4 F-01 retarget went beyond the retarget.** Each of the three obligation cites now names
  *what the neighbouring range is* — "`:2201-2202` is *containment*, which is precisely the conjunct
  this sentence has just said is insufficient". A future off-by-one is now self-diagnosing: the
  document says which clause it expects at which anchor, so a reader who measures a mismatch knows
  immediately whether the anchor drifted or the content changed.
- **The Anchor provenance paragraph is a durable process artefact, not just a footnote.** It records
  that the v4 cross-reviews' anchors were correct against the revision they read and that only the
  line numbers moved — which is exactly the ambiguity that makes a harvested review look wrong to a
  later reader. Cross-review anchors into a document still under revision are provenance for a
  *revision*, not for a file; saying so on the page is worth keeping.
- **F-01 is the only defect in the changed text, and it is a transcription defect, not a decision
  defect.** The decision DEC-CONS-03 records — containment, not exclusion; conjoined with obligation;
  compared as a `Set` — is unchanged and correct. Nothing in this round reopened a settled question.

## Recommendation

## Verdict
