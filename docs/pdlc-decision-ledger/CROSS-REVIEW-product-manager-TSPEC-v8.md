# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v0.7)
**Date:** 2026-08-28
**Iteration:** 8 (delta re-review)

## Scope of this round

Delta re-review only. I re-read my v7 cross-review, diffed the TSPEC from the commit I last
reviewed (`72fd38c9d..HEAD`, +63/−23 across §0's changelog, §3.6, §7.3's conjuncts (4)–(6) and
closing paragraphs, §9.2's ERR-2 discharge and D-10's rejected-alternative cell), and scanned only
those sections. No section outside that list moved. Upstream is unmoved — REQ **v1.9**, FSPEC
**v1.3**, Baseline **v1.2** — and the changelog says so, so no pin advances and no measured value
moves; the round changes *which* figure a test asserts and in what form, not the corpus.

## Routed-item disposition

| Item | Routed | Landed | Evidence |
|---|---|---|---|
| §3.6's retired-default arithmetic named only one retired input, so "below the project-level set alone" read false against the shipped **6,305** the adjacent table bolds | PM F-01 (v7, Medium) | **Yes** | TSPEC:468–476 now tenses **both** retired inputs — "at the `8000` default **and the long `§ {heading}` line format both then current**" — and names the figure each side: the long form's **9,371** (which does exceed 6,800, making the retired conclusion true on its own terms) and the shipped `§ {id}` form's **6,305**, with the explicit concession that 6,305 "would have fitted inside 6,800 even at the retired default". The sentence is now true as written under both readings. |
| §7.3 conjunct (5) asserted the whole block **equal** to 12,059, but 12,059 is `10,859 + the full 1,200-byte framing ceiling`, and §4.3/D-9 fix framing as a budget the not-yet-written constants must fit — an equality a conforming implementation drafted under budget would redden for no defect | PM F-02 (v7, Medium) / TE F-01 (High) | **Yes** | TSPEC:1078–1086: (5) now pins the 63 rendered index lines joined by `\n` at the transcribed **10,859**, explicitly mirroring conjunct (1)'s shape, and states why 12,059 is not fixture-transcribable ("the fixture … holds records and not framing constants"). (6) states the margin as `10,859 ≤ maxBytes − 1200`, i.e. `10,859 ≤ 11,300`, difference **441** — the same allowance form conjunct (2) uses (TSPEC:1038–1039). §3.6:510–514 and D-10 (TSPEC:1430) follow the same re-pin. |
| PM Q-01 — once the pin is split, does a rule-text edit inside the ≤1,200-byte framing budget re-open the 12,059 pin? | PM Q-01 (v7) | **Yes, answered** | TSPEC:1097–1101 answers it in the negative and names the reason: framing "is *not* a fifth literal on that list … it is pinned separately by D-9's ≤ 1,200-byte unit test, so a rule-text edit inside that budget re-opens neither (5) nor (6)". The four-literal list at TSPEC:1108 is correspondingly re-pinned to "the 41 project-level ids and 6,305, the 63 `M-6b` ids and **10,859**". |
| §9.2's ERR-2 discharge said "the only test that reads the value" when two have existed since round 6 | TE F-02 (Low) | **Partially** — see F-01 below | TSPEC:1482 now says "the only test**s** … are §7.3's two shipped-default assertions", naming conjunct (2) and conjunct (6). The plural is right and both citations check out, but the census is still short one site (§5.3). |

**Arithmetic re-checked, all consistent:** `12,500 − 1,200 = 11,300`; `11,300 − 10,859 = 441`;
`10,859 + 1,200 = 12,059`; `12,500 − 12,059 = 441`; `11,300 − 6,305 = 4,995` (§3.6's ~4,995).
§3.6:514's "**at least** 441 bytes of headroom — charging the ceiling can only understate the
margin, never overstate it" is the correct direction: charging framing at its ceiling makes 441 a
floor, so the headroom claim is conservative rather than optimistic. That is the right way round
for a claim REQ C-5's default rests on.

## Repository grounding

I checked the changed sections' load-bearing figures against the repository rather than against the
TSPEC's own prose, since the whole point of this round is that a measured claim must be re-derivable
at the re-capture moment.

| Claim (changed section) | Verified against | Result |
|---|---|---|
| Baseline commit `8c673a09f` exists and is the corpus basis (TSPEC:1015–1016) | `git cat-file -t 8c673a09f` | **Confirmed** — a commit object on this branch's history |
| "the 41 project-level ids" — conjunct (1), and the 41 the `M-6b` slice is built from (TSPEC:1031–1038, 1076) | Record headings across `docs/_decisions/DECISIONS-*.md` at `8c673a09f` | **Confirmed exactly**: 12 (`DECISIONS-review-severity-bars.md`) + 7 (`-plugin-distribution`) + 6 (`-test-oracle-mechanics`) + 4 (`-erratum-routing`) + 3 (`-wave-gates`) + 2 (`-review-convergence`) + 2 (`-model-availability`) + 2 (`-loop-termination`) + 1 (`-spec-layer-boundary`) + 1 (`-seam-defaults`) + 1 (`-anchor-provenance`) + 0 (`-advisory-wave-gate-questions`) = **41** |
| "`pdlc-headless-engine`'s 22", giving the 63-record worst standing G-1 case (TSPEC:1075–1077) | `docs/completed/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (14) + `DECISIONS-headless-engine-obligations.md` (8) at `8c673a09f` | **Confirmed exactly**: 22, and 41 + 22 = **63** |
| The re-pinned byte figures are mutually consistent with §3.6's measured line ranges | 6,305 / 41 = 154 B mean, inside §3.6's stated project-level range 109–200 (mean 153); (10,859 − 6,305) / 22 = 207 B mean, inside the stated feature-level range 152–261 | **Consistent** — 10,859 is not a figure that contradicts the ranges the same section publishes |
| §5.3's config-example test target file exists to be amended | `.claude/pdlc.config.example.json` is the file `loop-config-example.test.js` reasons about, as §5.3 states | **Confirmed** — and it is the site F-01 below says the ERR-2 census omits |

The two figures this round newly pins — **10,859** and the 63-id set — therefore rest on a corpus
that is real and countable at the named commit, which is what makes conjunct (5) a transcription
rather than an estimate. That matters for the product claim it serves (REQ C-5's default "admits the
worst standing case with headroom"): a reviewer can re-derive 63 from the repository in one command.

## Delta-Confirmation Findings

## Verdict
