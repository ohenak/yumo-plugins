# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md`
**Date:** 2026-08-10
**Iteration:** 18
**Scope:** Delta confirmation of the round-16 erratum only (FSPEC v11.7 minted AT-K3b; §12.2's
"no register AT reaches either" clause, §12.3's file assignment, the register re-derivation).
No re-review of the whole document.

## Delta examined

Three commits touch the document since the v17 approval, and only this document:

| Commit | Section | Change |
|---|---|---|
| `f42f4ade` | §12.2 | 1 line changed — the unreadable-corpus row |
| `85c33b1d` | §12.3 | 7 insertions / 5 deletions — assignment + register re-derivation |
| `37bad08d` | header | v2.8 changelog entry, version/date bump |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings. The erratum is discharged; no new defect introduced by the edit. | — |

## Confirmation of each raised item

**(1) The false clause is gone (pm-review, te-author, se-review — one cell, one fix).**
§12.2's unreadable-corpus row (`:2863`) no longer asserts the whole-corpus observable is unreached.
The surviving "no register AT reaches any of them" is now scoped, correctly, to the **three**
per-entry observables (counted toward `|un-consolidated|`, omitted from the consumed pair, named in
the report body), with AT-P8 distinguished as the unreadable *log* file. The **fourth** observable —
`no-op` with an empty consumed pair, §10.3 row 1b — is stated as a register obligation citing
**FSPEC v11.7 / §13.6 register / AT-K3b**, bound in §13.7 as AC-1.4's third cause, with the prior
gap re-described as having been recorded against AT-K3, AT-L2, AT-F13, AT-R7 (AC-1.4's second and
first causes). Absorbed, not re-routed — the correct action under DEC-ERR-01.

**(2) The second fixture is stated as AT-K3b's discharge, and the oracle actually covers the
register row's conjuncts.** I diffed the TSPEC fixture against FSPEC §13.6's AT-K3b text. Every
conjunct in the register has an assertion:

| AT-K3b conjunct (FSPEC §13.6) | §12.2 second fixture |
|---|---|
| terminal `no-op` | asserted **positively and exactly**, with `failed` (row 1a, the adjacent branch) and `refused` named as the excluded neighbours — not an absence-only oracle |
| consumed pair appended **empty** | asserted; the mixed fixture is its control against a pass that enumerated nothing |
| no `CONSOLIDATION-PROPOSAL-{passId}.md` for that `passId` | asserted |
| **no** reason code minted | asserted |
| discriminator: consumed list empty **while** un-consolidated non-empty | asserted as `\|un-consolidated\| = 2` with both basenames named unread — which is the pairing separating AC-1.4's third cause from its first |

The two fixtures remain each other's control in both directions (the mixed one stops "pair empty"
passing on an empty corpus; the all-unreadable one stops the mixed one's status assertion passing on
an implementation that terminates every unreadable-touching pass `failed`). That reciprocity was the
thing worth preserving from v17, and the edit preserved it. Status is pinned against §6.4's frozen
terminal-status catalogue rather than a retyped literal — unchanged and still correct.

**(3) §12.3 assigns the id, and the id→file set equality is restored.** `AT-K3b` now appears in
`consolidationPass.test.js`'s row, and `consolidationCredential.test.js`'s row states explicitly why
it is *not* there (the split is by subject: corpus handling vs credential resolution), so the id
appears **exactly once** across the table — the equality obliges one file per id, not one file per
id prefix, and the row says so. The register re-derivation moved to **FSPEC v11.7, 100 ids**.
Verified mechanically rather than trusted: enumerating `AT-…` tokens over FSPEC §13 (§§13.1–13.9)
and de-duplicating yields **100**, and the FSPEC header reads `11.7`. The count matches.

**(4) Nothing else moved.** The changelog entry describes exactly the three edits made, cites the
FSPEC by *§-number + heading + id* (never by line range, per §12.3's own citation rule), and does
not narrate a stale pointer's current target — the failure mode struck at v2.2. `git show --stat`
confirms no other section, and no other file, was touched.

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The status assertion on the new fixture names the *adjacent* branch it must not reach (`failed`,
  row 1a) rather than merely asserting the target value. That is the shape that survives an
  implementer reaching for the neighbouring branch, and it is what makes this fixture worth its cost.
- The discriminator is expressed in **already-enumerated values** (empty consumed list while the
  un-consolidated set is non-empty) rather than in a new field invented for the test — so the oracle
  reads production observables and cannot false-green on a field only the test populates.
- `consolidationTraceability.test.js` re-deriving both sides of the register equality at run time
  means the next FSPEC mint goes **red in the suite** instead of needing a fifth erratum round. This
  round is exactly the case that mechanism exists to prevent; the reader-summary count remaining in
  prose is documented as a summary, not as a pin anything depends on.
- The AT-K family deliberately spanning two files, with the reason recorded in the file it is absent
  from, prevents a future reviewer re-raising it as a bookkeeping slip.

## Recommendation

**Approved**

The erratum is fully absorbed. AT-K3b is cited where the false clause stood, discharged by a fixture
whose assertions cover every conjunct of the register row, assigned to exactly one file, and the
register equality re-derives to 100 at FSPEC v11.7 — verified by enumeration, not accepted from the
text. No High, Medium or Low finding.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:40fcf56227cf911eb900b2f25499da169e0258753a64585f7522635f57854980
REVIEWED-COMMIT: 37bad08d6285ef124b2cdd7cd195a7916f5cb2d8
