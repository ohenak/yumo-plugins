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

**Approve.** No open High finding, old or new; nothing this round broke, because nothing in
this document changed; and the moved upstream has not falsified any load-bearing claim.

Three things I looked at specifically, because they are where a moved §7.3 could have
silently falsified this document:

1. **DEC-DECLEDGER-03/-13's or-conditioned-loop reading survived the §7.3 rework.** This was
   the v1.4 correction I approved at iteration 4 — the replacement of "`maxEntries` fires
   first and forces at least 71 omissions" with a disjunction in which both bounds are
   exceeded at the outset over the 141-record fixture and the *byte* bound sets the terminal
   survivor count. TSPEC v0.8/v0.9 rewrote §7.3 substantially (`471d3a4b9`, `4b28af44a`),
   so the reading had to be re-checked, not assumed. It holds verbatim: `TSPEC:1198-1199`
   still reads "both bounds exceeded from 141 records" with the byte bound setting the count,
   and `TSPEC:130-131` and `TSPEC:151-152` still state the loop is or-conditioned and that
   the point is a non-vacuous `omitted[]` conjunct rather than a staged-binding mechanism.
   The testability payload — §7.3's `omitted[]` conjunct cannot go vacuous at either shipped
   default — is intact.

2. **The census rework did not orphan the PROPERTIES-guidance row for DEC-DECLEDGER-09.**
   That row (`DECISIONS:347`) tells the te-author to build the feature-owned falsifier over
   "the `// === DECISION LEDGER WIRING START/END ===` run and the new function bodies,
   TSPEC §7.x's census slices". §7.3's v0.9 rewrite changed *how* those slices are computed
   — the scanned source is now the whole `orchestrate-dev.js` minus the body of **every**
   declaration the feature introduces, frozen as `DECISION_LEDGER_OWNED_DECLS`, plus the
   `main()` wiring block (`TSPEC:1297`) — but the regions the DECISIONS row points at are
   exactly those slices, and they are now more precisely defined, not deleted. `TSPEC:318`
   and `TSPEC:322` still name the sentinel run and still record that it is a *different*
   region from the one PROP-DIS-06's `/\.enabled\b/` count slices, which is the entire
   reason the row exists. The row's guidance is unchanged in force.

3. **The `12,059` non-assertion rule — the thing DEC-DECLEDGER-16 exists to protect — is
   still what TSPEC does.** `TSPEC:625-627` still states the block total is deliberately not
   pinned as an equality and that the `12,059 ≤ 12,500` half is pinned where measurable, and
   D-10 (`TSPEC:1651`) still carries the same rationale. Had v0.8/v0.9 turned that into an
   equality, DEC-DECLEDGER-16 would have been recording a rule the upstream violates. It did
   not.

### Carried finding from v4

My v4 Medium (DEC-DECLEDGER-16's provenance rule is stated *positionally* — "the ceiling may
appear only on the larger side of an inequality" — rather than *directionally*, and leaves
the prose-versus-assertion scope undefined) is **still open**, necessarily so: the document
did not change. It was recorded as non-gating at v4 and remains non-gating here. Under the
freeze it is explicitly not re-opened as a decision; it is re-recorded below as `inherited`
so the round routes rather than halts. Its best moment to be fixed is the promotion of
DEC-DECLEDGER-16 into `docs/_constraints/DOMAIN-CONSTRAINTS.md` at consolidation, which is
downstream of this phase.

## Consequences

- **Nothing is owed by this document to close this round.** An approval here re-stamps the
  `UPSTREAM-STATE` anchors against the TSPEC v0.9 digest (`sha256:eef45ef3…0623c8`), which
  is the mechanically correct outcome of a re-confirmation whose substance all checks out.
- **One editorial re-pin is worth taking whenever this document is next opened for any
  reason** — the `TSPEC **v0.7**` literal in the Context passage and in the
  DEC-DECLEDGER-10/-12 trigger row. It is not worth a revision round of its own: the
  sentences around it stay true word-for-word at v0.9, since the v0.8 and v0.9 changes were
  confined to §7's census satisfiability, §7.2's live composition-root arm, §7.5's promoted
  invariants and §5.4's forward pointer — none of which this document derives from. The four
  corpus literals this document transcribes (6,305 / 10,859 / 12,059 / 441) are explicitly
  recorded as unchanged by the v0.9 changelog itself (`TSPEC:23`, `TSPEC:64`, `TSPEC:99`).
- **For the te-author, downstream:** the PROPERTIES guidance rows at `DECISIONS:344-350` are
  all still discharged by a TSPEC section that exists at HEAD, so PROPERTIES can be written
  against them without a re-pin first. The one to read alongside its upstream is the
  DEC-DECLEDGER-09 row, because §7.3's owned-declaration list is now frozen as a named
  constant and the property should slice the same way rather than hand-pick regions.
- **No erratum is owed upstream.** Every divergence I found between this document and TSPEC
  v0.9 is a stale version literal in *this* document, not a defect in TSPEC.

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
