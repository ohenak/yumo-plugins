# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.6)
**Date:** 2026-08-28
**Iteration:** 7 (delta confirmation on round 6's erratum)

**Upstream at dispatch:** REQ `sha256:ce6b133f…3c7b7c`, FSPEC `sha256:2bd5c3ef…5aed39` — both match HEAD on `feat-pdlc-decision-ledger`. Baseline `docs/_constraints/pdlc-decision-corpus-baseline.md` v1.2 read directly for `M-6b`/`M-6c`/`M-7a`–`M-7e`.

## Scope of this round

Confirmation only: did the four TE items and the one PM item routed at round 6 land, and did the edit break anything that was approved? Sections the edit did not touch were not re-litigated. The delta is `04a6dc249`, `fa41f8680`, `1b3bc5004`, `88fe6dbae` (+90 / −19).

## Item-by-item

| Routed item | Landed | Evidence |
|---|---|---|
| PM F-01 — §3.6/D-5 "`maxBytes` binds first in every case" tensed to the retired `8000` and retired at `12500` | **Yes** | §3.6: "at the `8000` default then current, `maxBytes` bound first in every case… That conclusion is retired with the default it was computed against"; the replacement states the `12500` outcome on both the real-dispatch and the 141-record fixture side |
| TE F-01 (High) — the `M-6b`-slice shipped-default assertion | **Partly** — the assertion exists; one of its three conjuncts is not writable as stated (F-01 below) | §7.3 "The `M-6b`-slice assertion (§3.6's 441 bytes)", conjuncts (4)–(6); D-10 now names two assertions and says which pin carries which claim |
| TE F-02 — §7.3's whole-fixture drop-loop rationale | **Yes** | The staged "`maxEntries` 70 binds first, forcing at least 71 omissions" is gone; the single or-conditioned loop is described, both bounds exceeded at 141 records from the outset, byte bound setting the terminal survivor count. Consistent with the later "roughly two dozen survive" paragraph (41 + ~27 < 70) |
| TE F-03 — §9.4's A-1 veto windows | **Yes** | "Their veto windows have closed": REQ A-1 before FSPEC authoring, FSPEC A-1 before TSPEC authoring, revision now an upstream erratum. Matches REQ:388 verbatim in substance |
| TE F-04 — §9.2 ERR-2 pre-resolution argument | **Yes** | Past-tensed throughout; the A-1 appeal now reads "REQ A-1 permits revision only *before FSPEC authoring*, a window long closed. REQ v1.8 took the raise instead" |
| Absorbed re-grounding: FSPEC v1.3's `maxBytes`-`0` widening of E-7 | **Yes, and faithful** | §4.1, §6.1 F-13 and §7.6's AT-14 row now read `0` on either threshold. Checked against FSPEC:331 (E-7) and FSPEC:473–480 (AT-14's three cases) — the TSPEC does not over-claim |

No section outside the declared list moved (verified by diff), and no pin or measured value advanced.

## Findings raised by the delta

**F-01 (High, delta, local) — conjunct (5) pins the block to the framing *ceiling*, so the test reds against a conforming implementation.**

§7.3 conjunct (5) says the whole block is "the transcribed literal **12,059** bytes", and the closing paragraph calls 12,059 "hand-transcribed from the fixture, never derived at test time". Neither holds:

- 12,059 is `10,859 + 1,200`, and §4.3 fixes framing as a **budget**, not a size: "the four constants together must render to **≤ 1,200 bytes**", and explicitly "**1,200 is a budget the rule text must be drafted to fit, not a measurement of drafted text** (the constants do not exist yet)". Any conforming implementation whose framing renders under budget produces a block **smaller** than 12,059, and the equality assertion is red on day one — for no defect.
- The fixture holds decision records, not `DECISION_LEDGER_PREAMBLE` / `DECISION_LEDGER_RULE_TEXT`, so 12,059 cannot be transcribed from it in the sense conjuncts (1) and (2)'s literals are. It is arithmetic over a bound.

This is my own round-6 wording coming back wrong — v6's F-01 asked for "the transcribed 12,059" — but the assertion has to be writable, and as written the only ways to green it are to draft the rule text to exactly 1,200 bytes or to quietly replace the literal with whatever the framing turns out to be, which discards the pin.

Concrete fix, mirroring conjunct (2)'s shape so the 441 bytes stay falsifiable without depending on an unwritten constant:

- **(5)** the 63 rendered index lines joined by `\n` are the transcribed literal **10,859** bytes — a real measurement, present in §3.6's table and derivable from the frozen fixture alone;
- **(6)** the margin as arithmetic: `10,859 ≤ maxBytes − 1200`, i.e. `10,859 ≤ 11,300` at C-5's resolved default, with the 441 stated as the difference.

That keeps every falsifier v6 asked for — (5) reddens on 441 bytes of corpus growth or a line-format regression, (6) reddens if the default drops below the standing case — while §4.3's framing pin remains the other half of the sum, exactly as conjunct (2) already arranges it. §3.6's own "441 bytes of headroom" prose stays correct as a conservative statement, since charging the ceiling can only understate the margin; it is the *equality* that cannot be asserted.

**F-02 (Low, delta, local) — §9.2's discharge paragraph is stale by one assertion.** "the only test that reads the value is §7.3's shipped-default assertion" was true when there was one; this round added a second, and both read C-5's default. Pluralise, or name them.

## Questions

None.

## Positive Observations

- The `M-6b`-slice assertion is exactly the right *shape*: it exercises the shipped configuration over a set the size a dispatch really builds, with `omitted[]` pinned **empty** as a positive conjunct alongside a set-equality over the 63 ids — not an absence-only oracle. Only the byte literal is mis-derived.
- D-10 now states which pin carries which claim (~4,995 for drop order, 441 for the inertness measurement) and says explicitly that neither substitutes for the other. That is the durable form of round 6's finding, not a patch over it.
- The drop-loop correction is better than the correction asked for: it names the disjunction as the reason "which bound binds first" is not a stage the loop has, rather than swapping one bound's name for the other's.
- The E-7 widening was absorbed rather than deferred, and the absorption was checked against FSPEC v1.3's actual text on all three sites (§4.1, F-13, AT-14) — including the E-8-then-E-6 second route on the `maxBytes` axis.

## Recommendation

**Needs revision** — one High, and it sits inside the assertion this erratum round exists to add. The fix is one paragraph of arithmetic in §7.3 plus the matching phrase in D-10; no approved decision is reopened and no upstream pin moves.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | High | delta | local | Conjunct (5) pins the whole block at `12,059` = `10,859` + the framing **ceiling** `1,200`, but §4.3/D-9 fix framing as `≤ 1,200` and say the constants do not exist yet; the equality reds against any conforming implementation under budget, and 12,059 is not fixture-transcribable. Pin the 63 index lines at **10,859** and state `10,859 ≤ maxBytes − 1200` (441) instead | §7.3 `M-6b`-slice assertion, conjuncts (5)–(6); D-10 |
| F-02 | Low | delta | local | "the only test that reads the value is §7.3's shipped-default assertion" — there are now two | §9.2 ERR-2, discharge paragraph |

FINDING: High | delta | local | §7.3 `M-6b`-slice assertion, conjunct (5) / D-10 | the block is pinned as an equality to `12,059` = `10,859` + the framing **ceiling** `1,200`, but §4.3/D-9 fix framing as `≤ 1,200` and state that 1,200 is "a budget the rule text must be drafted to fit, not a measurement of drafted text (the constants do not exist yet)" — so a conforming implementation whose framing renders under budget reds this assertion on day one, and 12,059 is not "hand-transcribed from the fixture" (the fixture holds records, not the framing constants); mirror conjunct (2) instead — pin the 63 index lines at the transcribed **10,859** and state the margin as `10,859 ≤ maxBytes − 1200` (`10,859 ≤ 11,300`, 441 bytes), which keeps both falsifiers without depending on an unwritten constant
FINDING: Low | delta | local | §9.2 ERR-2, paragraph below **Resolution** | "the only test that reads the value is §7.3's shipped-default assertion" is stale by one — this round added a second shipped-default assertion over the `M-6b` slice, and both read C-5's default

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
