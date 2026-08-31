# Cross-Review: product-manager — DECISIONS (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, unchanged)
**Base reviewed at v8:** `7adc9666196cca6357174fcbb513b6a6f597af2f`
**Upstream HEAD:** REQ `5f3e8051…` (v1.6) · FSPEC `c7d2c832…` (v1.7) · TSPEC `3742216…` (v1.6)
**Date:** 2026-08-31
**Iteration:** 9 (delta confirmation, decision freeze)

## Context

**The document did not move this round. Its upstream did.**
`git diff 7adc9666..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md` is empty: zero commits touch
the file since the bytes I approved at v8. There is no author delta to confirm. What changed is
everything above it — REQ v1.4 → v1.6, FSPEC v1.5 → v1.7, TSPEC v1.4 → v1.6 — all landed after the
commit this document last grounded on.

That inverts the usual delta question. The v8 round asked "did the edit land cleanly". This round
asks the only question a frozen, unedited document can fail: **is any load-bearing claim in it now
false, because upstream moved underneath it?** Under decision freeze that is also the only thing
that may block — a defect the revision introduced (there was no revision) or a factual contradiction
with the repository at HEAD or an upstream document.

**Upstream movement, measured not assumed.** The document's v1.6 changelog attests "TSPEC HEAD is
v1.4 (`sha256:cb351bb3…`) and FSPEC HEAD is v1.5 (`sha256:25af3c47…`) … REQ HEAD (v1.4) matches its
pin". I checked whether that attestation was true when written rather than assuming either way:

| File | Hash at `7adc9666` | Hash at HEAD | Verdict on the attestation |
|---|---|---|---|
| REQ | `60a516fb…` (v1.4) | `5f3e8051…` (v1.6) | True when written; stale now |
| FSPEC | `25af3c47…` (v1.5) | `c7d2c832…` (v1.7) | True when written; stale now |
| TSPEC | `cb351bb3…` (v1.4) | `3742216…` (v1.6) | True when written; stale now |

This matters because TSPEC v1.6 spent its round correcting exactly the opposite failure in itself:
its v1.5 changelog attested "neither moved" while FSPEC and REQ had in fact moved, because it cited
a current hash instead of diffing against the previously grounded one. **DECISIONS did not make that
mistake.** Its three hashes were the real HEAD values at the moment it wrote them. The staleness
here is the ordinary consequence of being reviewed after upstream advanced, not a false attestation.

**What I re-verified mechanically, rather than trusting the v8 result:**

| Claim | How checked | Result |
|---|---|---|
| `c8.include` holds seven entries at HEAD | read `pdlc/workflows/package.json` | seven `**/`-anchored entries |
| `REQUIRED_INCLUDES` holds four | `pdlc/workflows/__tests__/coverageInstrumentation.test.js:37-46` | four; literal is `4 + 1 + 2` = seven |
| TSPEC §2.1 still says *six → seven* | `git diff` on the TSPEC row | row untouched by v1.5/v1.6 |
| P-1's title as DECISIONS quotes it | `learningsPremises.test.js:78` | "MODULE_NAMES is exactly the four canonical workflow modules" — DECISIONS' quote is a faithful substring |
| The ten-site set matches TSPEC's ten | row-by-row compare of both tables | identical membership |

I did **not** re-open `DEC-STATS-01`'s chosen option, `DEC-STATS-02`, `DEC-STATS-03`, the option
table, K-1 through K-9, or the standing-cost bullets. None of them changed; all were approved on
their merits across v5–v8.

## Options Considered

Three readings of "an unedited document under moved upstream" were open. The choice decides the
verdict, so I state it rather than leaving it implicit.

**Reading 1 — upstream moved three revisions, so the document is stale and must re-ground before
approval.** Rejected, on evidence rather than on convenience. Staleness is only a defect where it
changes something. I walked the three upstream diffs looking for anything DECISIONS decides,
compresses or cites, and found the movement lands entirely outside this document's subject matter:

- **REQ v1.5–v1.6** withdraws REQ-STATS-05's harvested halt state, restores a measured `0`, rescopes
  NG-6 to the two families harvest actually removes, and rewords REQ-STATS-06's predicate. DECISIONS
  contains no reference to halts, harvested states or NG-6 — I grepped for all of them and the only
  neighbouring claim is line 178's "REQ-STATS-02 requires the JSON document's top-level key set to be
  set-equal to the printed metric set", which REQ v1.6 *reinforces* ("never as extra top-level keys").
- **FSPEC v1.6–v1.7** re-scopes BR-16's `docs/completed/pdlc-advisory-wave-gate/` citation to the
  malformed basename *shape*, corrects a count two → four and adds an AT-15 trace row. DECISIONS
  mentions neither BR-16 nor that directory.
- **TSPEC v1.5–v1.6** is the one that could have bitten, and is treated as its own reading below.

**Reading 2 — TSPEC v1.6's new REQ-versus-FSPEC conflict is an unabsorbed decision, so DECISIONS
owes a round.** Rejected on the strongest available evidence: **TSPEC itself says otherwise.** §8.4,
*Questions for DECISIONS*, is unchanged across both revisions and still reads "Three load-bearing
alternatives were weighed and rejected and belong in `DECISIONS-pdlc-stats.md`" — the new erratum was
routed to §8.3 as an open upstream item, not promoted into §8.4. That is the correct routing and it
is TSPEC's call to make: the REQ-STATS-06-versus-BR-16 dispute is about whether a grammatical
basename outside the driver's catalogue is a survivor, which decides AT-17's fourth-leg expected
value. It is a REQ-versus-FSPEC reconciliation owed at the owning phase. It is not a module-boundary,
seam or co-change question, and DECISIONS decides only those. **No decision is owed here**, and
opening one would be exactly the freeze violation this round exists to prevent.

**Reading 3 — confirm the document's load-bearing claims still hold at HEAD, and route what does
not.** Adopted. This is what a frozen round can honestly test, and it is the test the document
passes.

**Where TSPEC v1.5 moved, it moved *toward* this document, not away.** This is the finding I most
expected to go the other way and it did not. TSPEC v1.5 corrected §1 and RK-1, which had joined the
sibling-feature carve-out to the ten sites with "including" — placing inside the ten an edit that
§2.1 and RK-1 place outside it. Both now read "and … that sits **outside** that ten". DECISIONS had
already partitioned it that way since v1.5: its own ten-site table (`:213-223`) lists exactly the
ten in-repo sites and no sibling-document row, and K-7 owns the two sibling-document edits as a
separate obligation. I compared the two tables row by row — `prepack.mjs`, `publish-preflight.mjs`,
`fixture-machine.mjs`, `_tspec-packed-set.mjs`, `package.json`, `loop-distribution.test.js`,
`coverageInstrumentation.test.js`, `run.test.js`, `learningsPremises.test.js`, `pdlc/README.md` —
and the membership is identical. The v6 High that forced this alignment stays closed, and upstream
has now converged on the same partition from its side.

**The one carried divergence survives the round unchanged.** TSPEC §2.1's
`coverageInstrumentation.test.js` row still describes P9-02's title as moving *six → seven*. I
re-measured at HEAD rather than inheriting my own v8 arithmetic: `REQUIRED_INCLUDES` holds four
entries (`orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`,
`scripts/check-wave-resume-delta-coverage.mjs`), so P9-02's literal is `4 + 1 + 2` = **seven**, and
`c8.include` in `pdlc/workflows/package.json` holds seven entries today. This feature makes it
**eight**. DECISIONS carries the correct arithmetic and books the repair as owed upstream. Neither
of TSPEC's two revisions touched that row, so the item is inherited, unchanged, and still non-gating
— it is a defect in TSPEC's bytes, not in the document in front of me.
