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

## Questions

## Positive Observations

## Recommendation

## Verdict
