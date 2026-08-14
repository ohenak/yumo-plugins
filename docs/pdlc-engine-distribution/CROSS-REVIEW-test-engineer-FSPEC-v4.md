# Cross-Review: test-engineer — FSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.4)
**Date:** 2026-08-14
**Iteration:** 4
**Scope:** Delta re-review of `768a0046..HEAD` (commit `2f4b04f7`, "v0.4 — packed-set
classes, member count, and BR-8.1 reconciled with TSPEC §5.4") against my v3 findings.
Unchanged sections already approved are not re-reviewed.

## Prior-finding verification

| Prior ID | Severity | Resolved? | Evidence |
|---|---|---|---|
| v3 F-01 | High | **Yes, at FSPEC altitude** | The ownership split is now stated in both directions and is complete. §5.2 gains a class row for every `PK-*` member that previously had none — Package README (`FSPEC:496`, PK-2), Licence (`:497`, PK-3), Install script (`:501`, PK-23) — so mapping §5.2's classes onto `TSPEC:346-358` is now a bijection in both directions: manifest→PK-1, README→PK-2, licence→PK-3, CLI entry→PK-4/PK-4b, engine modules→PK-5…PK-19, workflow modules→PK-20…PK-22, install script→PK-23. Seven classes, twenty-three rows, no class without members and no member without a class. The **member count** is now owned here (`:505-513`) and asserted by the test (`:723-731`), and it is arithmetically consistent with `TSPEC:386-389`: 1 manifest + 1 README + 2 `bin/` + 15 `lib/*.mjs` + 3 vendored workflow + 1 postinstall = **23**, +`LICENSE` = **24**. The unfalsifiable half of my finding is closed: "a removed member fails" now has a literal expected side (`TSPEC:346-358`) *and* a count conjunct that a deletion moves. The exclusion list's contradiction with the now-packed README is repaired (`:518`), and BR-8.1 (`:526-530`) names the `PK-*` table as the literal expected side while keeping the anti-directory-listing rule intact. What remains is an upstream wording question, not an FSPEC defect — routed as `ERRATUM: REQ` rather than held against this document (see Questions Q-01). |
| v3 F-02 | Low | **Yes** | §1 now restates the ownership split before §5.2 is reached (`FSPEC:50-52`), so the document is self-describing rather than forward-referencing. |
| v3 Q-01 | — | **Answered** | Direction (a) chosen and stated in the changelog (`:17-27`). |
| v3 Q-02 | — | **Answered** | 23/24, stated at `:505-507` and `:725-726`, matching `TSPEC:386-389` (the E-4b split and the N-2 conditional are both priced in). |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The count is invariant under swaps, so "neither side moves without the other" is stronger than the mechanism delivers.** §1 (`FSPEC:52`) and §5.2 (`:511-513`) claim the count is the FSPEC-side change-control point that a decomposition change must move. It only trips on decompositions that change *cardinality*. A TSPEC edit that renames a member, or that merges one `lib/*.mjs` while splitting another, leaves 23 intact: the verifier re-transcribes the new `PK-*` names, the tarball matches, AT-3.8a is green, and no FSPEC edit ever happened. That is a real gap in the change-control claim, not in the oracle — AT-3.8a still catches every drift *between the spec and the package*; it does not catch drift between the two spec halves. Either soften the claim to what it does ("a change to the **number** of members forces an FSPEC edit"), or add the per-class counts (1 / 1 / 2 / 15 / 3 / 1) so a swap across classes also moves an FSPEC-owned number. The per-class breakdown is the cheaper fix and is already computed in `TSPEC:386-389`. | §1 (`:50-52`), §5.2 (`:505-513`) |
| F-02 | Medium | Local | **§5.2's workflow-module row and AT-3.8b still read `[blocked on O-10] / not enumerable yet`, and the new count contradicts them.** The count paragraph totals 23 by counting "the vendored workflow members" (`:508-510`) — that total is only knowable if the class has exactly three members, which is precisely what the row two lines above (`:500`) says is undecided. So the document now asserts both "which files this class contains is exactly what O-10 decides" and a total that presupposes the answer. The staleness is downstream-resolved, which is why this is not High: `TSPEC:421-429` names the members (PK-20/21/22, "and nothing else") and declares AT-3.8b writable, and the PLAN schedules it rather than deferring it (`PLAN:131` T11, `:136` T16, `:159` T33, `:168` T41, `:167` T49, DoD item 10 at `:450`). But a verifier reading the FSPEC alone is told a scheduled acceptance test is "Unwritable" (`:733`), and the count is the newest, most load-bearing number in the section. Drop the `[blocked on O-10]` marker from both the §5.2 row and AT-3.8b, citing `TSPEC:421-429` as the unblocking decision, and keep the O-10 reference only where it still bites (BR-8.2's anti-fork obligation, `:532`, which is genuinely still open). The changelog already flags this as knowingly deferred (`:28-30`, SE `Q-01`); it is cheap enough to close now. | §5.2 (`:500`, `:508-510`), §8 AT-3.8b (`:731-735`) |
| F-03 | Low | Local | AT-3.8a's `Then` now carries three conjuncts (member-for-member equality, count equality, pairing record present) but does not say the count check is **redundant-by-design** rather than a second oracle. As written, an implementer may reasonably read "the enumerated members equal the expected set member-for-member; the member count equals §5.2's" as two independent assertions and wire the count against `len(actual)` — which is a tautology once the first conjunct passes, and a self-derived expectation of exactly the kind BR-8.1 forbids. One clause fixes it: the count is asserted against **TSPEC §5.4's transcribed expected list**, not against the tarball, so the count conjunct fails when the transcription itself has drifted from §5.2. | §8 AT-3.8a (`:723-731`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The changelog claims direction (a) "keeps REQ AC-1.3's *expected set stated in the FSPEC* true without a REQ erratum" (`:22-24`). It does not, quite: `REQ:260-261` says the packed list "**equals**, member for member, an expected set stated in the FSPEC", and after v0.4 a verifier still cannot transcribe a member list from this document — only classes and a total. That is a defect in the REQ's wording, not in the split, so I am routing it as `ERRATUM: REQ` rather than holding this document. It does not gate: the split is sound, the oracle is writable, and no test changes whichever way the REQ is re-worded. |
| Q-02 | `PLAN:463` still lists an open erratum against **FSPEC** on the grounds that "AT-3.8a still states the packed set equals §5.2's writable classes … the twelve named `lib/*.mjs` modules", and T16 (`PLAN:136`) blocks on its resolution. v0.4 removed that literal (`FSPEC:723-731`), so the erratum is discharged and T16's block should lift — the PLAN's own text is now the stale side. Downstream of this document, so not a finding here; flagging so the phase does not carry a resolved blocker into Phase I. |
| Q-03 | `pdlc/engine/package.json:11` already declares `"license": "UNLICENSED"` at HEAD while PK-3's `LICENSE` **file** is gated on N-2. Is the manifest field expected to change in the same task that adds the file, and does any acceptance test pin the two to agree? Neither AT-3.8a nor §5.2 mentions the field, and a package that ships `LICENSE` while the manifest still says `UNLICENSED` would pass both. Possibly TSPEC/PLAN territory (`PLAN:151` T25 explicitly defers the field to T05), in which case no FSPEC change is needed — I could not find the agreement asserted anywhere, so I would rather ask than assume. |

## Positive Observations

- The fix is genuinely bidirectional, which is what made the previous round's version wrong. v0.3 closed the divergence by deleting the FSPEC's copy, leaving REQ AC-1.3 pointing at nothing; v0.4 gives the FSPEC something real to own (classes + count) that a decomposition change cannot silently move without at least the cardinality tripping. Transposing §5.2's classes against `TSPEC:346-358` now returns zero unmatched rows in either direction — I checked it as a set-equality, not a containment, which is the same bar §5.2 asks AT-3.8a to meet.
- The licence row (`:497`) is transcribed with its **source-of-truth** caveat intact ("sourced from that record, never from whether `pdlc/engine/LICENSE` happens to exist"). That is the one detail an implementer is most likely to drop when copying a conditional member into an FSPEC, and dropping it would reintroduce exactly the deletion-tolerant hole `TSPEC:373-383` was written to close.
- BR-8.1's rewrite (`:526-530`) keeps the anti-directory-listing rule as the *reason* for the rule rather than as decoration — "an oracle that reads `pdlc/engine/lib/` for its expectation passes a deleted module, which is the defect this rule exists to catch". That phrasing survives being read by someone in a hurry, which the previous phrasing did not.
- The changelog names what was **not** fixed (`:26-30`, SE `F-03`, SE `Q-01`) instead of quietly carrying it. My F-02 is one of those two; recording it beat rediscovering it.

## Recommendation

**Approved with minor changes**

No open High findings. My v3 High is resolved at this document's altitude: the packed-content
set now has a complete class enumeration, an FSPEC-owned member count consistent with
`TSPEC:386-389`, a literal expected side for BR-8.1, and an AT-3.8a whose "removed member fails"
clause is falsifiable. F-01 and F-02 are Medium and can be addressed by the optimizer without a
further review round; F-03 is a one-clause clarification. The residual REQ-wording mismatch is
routed upstream as an erratum, not held against the FSPEC.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}


## Verdict
