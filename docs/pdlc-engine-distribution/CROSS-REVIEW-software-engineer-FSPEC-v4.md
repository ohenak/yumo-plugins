# Cross-Review: software-engineer — FSPEC (delta round 4)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.4)
**Date:** 2026-08-14
**Iteration:** 4
**Scope:** Delta re-review of `768a0046..HEAD` (commit `2f4b04f7`, "v0.4 — packed-set classes,
member count, and BR-8.1 reconciled with TSPEC §5.4"). Prior findings v3 F-01 (High), F-02
(Medium), F-03 (Low) checked for resolution; changed sections (§1 ownership paragraph, §5.2 class
table + count paragraph + exclusions + BR-8.1, AT-3.8a) scanned for new defects. Unchanged
sections already approved are not re-litigated.

## Prior findings disposition

| v3 ID | Severity | Resolved? | Evidence |
|---|---|---|---|
| F-01 | High | **Yes** | §5.2's class table gains **Package README** (`:495`, PK-2), **Licence** (`:496`, PK-3) and **Install script** (`:499`, PK-23) rows. All 23 `PK-*` members of `TSPEC:386-389` now have exactly one class here — manifest (PK-1), README (PK-2), licence (PK-3), CLI entry (PK-4/PK-4b), engine modules (PK-5…PK-19), workflow modules (PK-20…PK-22), install script (PK-23) — so §5.2's classes and the TSPEC's table are set-equal in both directions, which is what AT-3.8a gates on. PK-3's conditionality is preserved *and* correctly sourced: `:496` reads the expectation from N-2's decision record, "never from whether `pdlc/engine/LICENSE` happens to exist in the tree", matching `TSPEC:375-383`'s deletion-tolerance argument verbatim in substance |
| F-02 | Medium | **Yes** | BR-8.1 (`:527-528`) now reads "the literal member list of **TSPEC §5.4's `PK-*` table**, read together with the classes and count above", replacing the dangling "literal list above". The anti-directory-listing half is kept intact (`:529-530`) |
| F-03 | Low | No — deliberately | `REQ:21` still attributes the run-side pin read to "FSPEC F-3 step 5" where the flow is F-4 (`FSPEC:146`, `:158`, `:170`). v0.4's changelog records it as noted-not-fixed. Prose-only, no behavioural consequence, and the phase's REQ erratum budget is spent; re-raising it would buy a confirmation round for a sentence no oracle reads. Recorded, not re-raised |
| Q-01 | — | No — and it has now hardened into F-01 below | The workflow-module row's `[blocked on O-10]` marker survived the edit (`:500`), while the same edit added a count that presupposes those members are known (`:504`) |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The new member count contradicts the workflow-module row it counts.** §5.2's count paragraph states the expected set is "**23 members before N-2… and 24 after**", enumerating "the vendored workflow members" among the classes it totals (`:502-505`), and AT-3.8a now gates on that count (`:725-726`). But the class row for those very members still reads **"Workflow modules [blocked on O-10] \| not enumerable yet"** and declares "the member list — and therefore this class's half of AT-3.8 (AT-3.8b) — is blocked" (`:500`), and AT-3.8b still carries "**[blocked on O-10]** … Unwritable until O-10 names the members" (`:731-734`). Both halves cannot be true: a count of 23 is only computable if the vendored class has a known cardinality (3). Downstream has already resolved this in the direction of *unblocked* — `TSPEC:423-429` names PK-20/PK-21/PK-22 as exactly the vendored members, states "AT-3.8b is therefore writable", and `PLAN:131` schedules AT-3.8b's carrier **T11 in Phase 1, batch A**. This is not cosmetic staleness: the implementer's expected side for AT-3.8a/PF-4 is undefined on the FSPEC's own terms, and the cheapest reading of `:500` — omit the unenumerable class — yields a verifier that passes a package with `vendor/workflows/*` missing entirely, which is precisely the deletion-tolerant hole `TSPEC:375-380` argues both-directions equality exists to close, and would make AT-3.8b vacuous (`TSPEC:1234`, PF-4's own note). **Fix:** replace the row's expected-members cell with "named in TSPEC §5.4 (`PK-20`…`PK-22`)" in the same delegating form as the other rows, drop `[blocked on O-10]` from the row and from AT-3.8b, and keep the O-10 note only where it is still true (BR-8.2, `:532-535`, which speaks to *how* the modules get in, not *which*) | §5.2 (`:500`, `:502-505`), AT-3.8a (`:720-729`), AT-3.8b (`:731-734`), `TSPEC:423-429`, `PLAN:131` |
| F-02 | Medium | Local | **AT-3.8a's oracle widened from "writable classes" to the whole set, silently absorbing AT-3.8b's scope.** v0.3 read "the enumerated members equal §5.2's *writable* classes member-for-member"; v0.4 reads "equal the expected set member-for-member" plus a count of 23 that includes the vendored members (`:721-726`). AT-3.8b then asserts the same equality over the workflow subset (`:731-733`). Two acceptance tests now own overlapping halves of one equality, with no sentence saying which is authoritative when they disagree — and `PLAN:131`'s T11 carries AT-3.8b while T16 carries AT-3.8a, so the overlap reaches two separate tasks. Either restore the "writable classes" scoping on AT-3.8a and let AT-3.8b own the vendored rows, or state plainly that AT-3.8a is the whole-set equality and AT-3.8b is a named sub-assertion of it kept for traceability. Resolving F-01 makes this a one-sentence choice; leaving both unresolved is what produces two verifiers with different expected sides | AT-3.8a (`:721-726`), AT-3.8b (`:731-733`) |
| F-03 | Low | Cross-Feature | **The count now exists in two documents and the co-change rule is stated only on the FSPEC side.** `:505` cites "`TSPEC:386-389` carries the same arithmetic" — verified correct, the cited lines read "23 members before N-2 and 24 after" with the same 4+15+3+1 decomposition. But this is the second synchronised copy of a fact, and a synchronised copy diverging is exactly the failure this whole erratum chain has been unwinding. The FSPEC says both sides move "in the same change" (`:508-509`); the TSPEC's §5.4 carries no reciprocal sentence. Recommend the TSPEC gain the mirror obligation at harvest time, or that the count be expressed once as a derived total (sum of class cardinalities) rather than a literal repeated in two files | §5.2 (`:502-509`), `TSPEC:386-389` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §9's open-question list still parks O-10 (`:57`) and §5.2's excluded-test-corpus bullet still defers the mechanism to "the TSPEC's/O-10's call" (`:824`). With `TSPEC:423-429` having named the vendored members, is O-10 still open at all, or is what remains open only BR-8.2's *how-it-gets-there* question? Closing or re-scoping O-10 explicitly would stop the marker from re-propagating into the next round |

## Positive Observations

- The F-01 fix is the structurally right one, not the cheap one: the three new rows **delegate** member names to TSPEC §5.4 in the same form as the pre-existing CLI-entry and engine-module rows, rather than restating a fourth FSPEC-local copy. The ownership split is now stated once, up front, in §1 (`:50-53`) instead of being inferable only from the table.
- The licence row's sourcing sentence (`:496`) is the load-bearing half and it survived transcription intact: the expectation comes from N-2's decision record, not from the tree under audit. Had that been dropped, PF-4 would go green on a post-N-2 package that lost `LICENSE` to a bad merge — both sides shrinking together, which is `TSPEC:375-380`'s exact argument.
- Every cross-document citation added by this edit checks out against the files, not against memory: `TSPEC:386-389` does carry the 4+15+3+1 = 23/24 arithmetic; `PK-2`, `PK-3`, `PK-23` are the ids the TSPEC assigns to README, licence and postinstall; and the exclusion-list collision is genuinely closed — `:518` now distinguishes the package `README.md` (a member) from the repository's own readme (not one), where v0.3's blanket "no repo-level documentation" contradicted PK-2.
- Stating the **count** in the FSPEC while delegating the **names** is a good answer to a real constraint: it keeps REQ AC-1.3's "expected set stated in the FSPEC" honest without a REQ erratum, and it makes a silent decomposition change impossible — the count moves, so an FSPEC edit is forced.

## Recommendation

**Needs revision** — one High finding, and it is a narrow one.

v3's blocking finding is fully resolved: all seven previously homeless `PK-*` members now have a
class, the licence conditionality and its decision-record sourcing are preserved, the README
exclusion collision is closed, and BR-8.1 points at a list that exists. Nothing previously
approved was broken.

What the edit did do is convert a stale marker I had only *questioned* in v3 into an active
self-contradiction: §5.2 now counts the vendored workflow members inside a 23-member total while
the row describing that class still says it is "not enumerable yet" and AT-3.8b still says it is
unwritable — after `TSPEC:423-429` named the members and `PLAN:131` scheduled the test in
Phase 1 batch A. The remedy is three deletions and one cell rewrite: name PK-20…PK-22 in the
workflow-module row in the same delegating form as its siblings, drop `[blocked on O-10]` from
that row and from AT-3.8b, and settle AT-3.8a-vs-AT-3.8b scope in one sentence (F-02). No new
material, no re-litigation of anything settled in rounds 1–3.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
