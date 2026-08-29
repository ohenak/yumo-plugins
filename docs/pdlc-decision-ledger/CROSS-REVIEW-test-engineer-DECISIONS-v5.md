# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (Version 1.4)
**Date:** 2026-08-29
**Iteration:** 5
**Round type:** delta re-review under DECISION FREEZE
**Last reviewed commit:** `25a19ff885a58e7ce7d1b55daacfb1d619704db5` (v4)

## Context

**The document under review did not change.** `git diff 25a19ff88 HEAD --
docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` is empty, and
`git log 25a19ff88..HEAD -- <that path>` lists no commit. The last commit touching it is
`25a19ff88` — the v1.4 discharge commit I reviewed at iteration 4. So there is no delta in
this document's own bytes to re-review, and no prior finding of mine could have been
addressed by an edit that does not exist.

**What did move is the upstream this document derives from.** Between `25a19ff88` and HEAD,
`TSPEC-pdlc-decision-ledger.md` advanced through nine commits — `039555ea9`, `d462a9475`,
`471d3a4b9`, `396a7b0f3`, `cc2c09e53` (**v0.8**, the Phase P erratum round over §7),
`1a2d78cba`, `4b28af44a`, `588f4323e`, `5189b73fb` (**v0.9**, round 9's confirmation
findings over §5.4, §7, §7.2, §7.3 and the changelog). REQ and FSPEC did not move: their
HEAD digests are `sha256:ce6b133f…3c7b7c` and `sha256:2bd5c3ef…5aed39`, byte-identical to
the `UPSTREAM-STATE` anchors my v4 recorded. The TSPEC digest is now
`sha256:eef45ef3…0623c8`, against v4's `sha256:1f1d7752…afc77`.

That makes this round a **re-confirmation against moved upstream**, not a re-review of a
revision. Under the freeze, the only thing that can block is a load-bearing claim in this
document that the moved TSPEC has made false. So my scope is exactly: every claim
DECISIONS-v1.4 makes *about TSPEC bytes*, re-checked against TSPEC at HEAD rather than
against the v0.7 bytes I checked it against last round.

**Result of that check, stated up front:** every derived figure, every mechanism claim, and
every erratum-status claim in this document still reads true at TSPEC v0.9. One literal is
now stale — the document names TSPEC's HEAD version as **v0.7**, and HEAD is **v0.9** — but
the payload that literal carries (the 8,000-based arithmetic is retired, the re-measurement
is discharged) is unchanged and still correct. That is recorded as a Medium, `inherited`,
and it does not block.

## Options Considered

How this round could have been conducted, and what I actually did:

**(a) Approve on the empty diff alone.** Rejected. A zero-byte delta in this document does
not make its claims true — this document is unusually dense in transcribed *upstream*
figures (11,300 / 10,859 / 12,059 / 441 / ~4,995 / 6,305 / 63 / 141 / 41 / 70 / 12,500),
and every one of them is a claim about bytes that moved this round. An empty diff plus a
moved upstream is precisely the configuration in which a document silently goes false
without anyone editing it.

**(b) Re-read the document from scratch against TSPEC v0.9.** Rejected as out of scope
under the freeze and under the delta protocol: sections I approved at v1…v4 are not
re-litigated, and no new decision may be opened here.

**(c) Re-verify only the upstream-derived claims, on disk, at HEAD.** Chosen. For each
figure and each mechanism claim, I read the TSPEC line at HEAD rather than trusting either
document's prose. Verification log:

| DECISIONS claim | TSPEC at HEAD | Verdict |
|---|---|---|
| Pins REQ **v1.9** / FSPEC **v1.3** / Baseline **v1.2** | `TSPEC:9` (`REQ … v1.9`, `FSPEC … v1.3`), `TSPEC:11` (Baseline **v1.2**); v0.9 changelog re-states all three, `TSPEC:21` | **Holds** |
| TSPEC HEAD version is **v0.7** | `TSPEC:15` frontmatter reads **0.9**; changelog carries a v0.8 entry (`TSPEC:137`… era) and a v0.9 entry (`TSPEC:21`) | **Stale literal** (F-01) |
| §3.6 states `12500 − 1200 = 11,300` | `TSPEC:145` — `12500 − 1200 = 11,300` | **Holds** |
| ~**4,995** bytes project-level headroom | `TSPEC:145`, `TSPEC:584-585`, `TSPEC:618` | **Holds** |
| Project-level renders **6,305** bytes over **41** records | `TSPEC:555`, `TSPEC:567`, `TSPEC:614-615`, `TSPEC:1251` | **Holds** |
| `M-6b`'s **63**-record worst standing case renders **10,859**, block total **12,059** | `TSPEC:146`, `TSPEC:570`, `TSPEC:592-593`, `TSPEC:623` | **Holds** |
| **441** bytes slack; `10,859 ≤ maxBytes − 1200` i.e. `10,859 ≤ 11,300` | `TSPEC:106`, `TSPEC:594`, `TSPEC:624-625` | **Holds** |
| `12,059` is deliberately **not** asserted as an equality | `TSPEC:625-627`, D-10 at `TSPEC:1651` (last clause) | **Holds** |
| Every surviving mention of **8,000** is explicitly past-tensed/retired | `TSPEC:109`, `:137`, `:139`, `:551-552`, `:582`, `:638`, `:1669-1673` — all retired/retirement framing | **Holds** |
| `ERR-1` / `ERR-2` **resolved** upstream at REQ v1.8 | `TSPEC:155`, `TSPEC:1659`, `TSPEC:1669`, `TSPEC:1261` | **Holds** |
| Two of four errata still **open**: `ERR-3`, `ERR-4` | `TSPEC:1707` (ERR-3), `TSPEC:1716` (ERR-4) — both still stated as corrections owed at the FSPEC | **Holds** |
| §7.3's loop condition is **or-conditioned**, both bounds exceeded at the outset over the **141**-record fixture; byte bound sets the survivor count | `TSPEC:130-131`, `TSPEC:151-152`, `TSPEC:1196-1199` | **Holds** |
| `maxEntries` **70** clears `M-6b`'s floor `41 + 22 = 63` | `TSPEC:415`, `TSPEC:548` | **Holds** |
| §9.3 **T-1** is the capture-before-production `Deps` edge | `TSPEC:1730`-region §9.3 T-1 row | **Holds** |
| The `// === DECISION LEDGER WIRING START/END ===` region exists and is distinct from the learnings-injection region PROP-DIS-06 slices | `TSPEC:318`, `TSPEC:322`, `TSPEC:1646` (D-6) | **Holds** |

## Decision

*(pending)*

## Consequences

*(pending)*

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*

## Delta-Confirmation Findings

*(pending)*

## Verdict

*(pending)*
