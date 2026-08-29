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

## Positive Observations

- **The split pin is the right product call, not just the cheapest fix.** My v7 F-02 said the
  12,059 equality was unsatisfiable-as-written; the revision could have relaxed it to `≤` and moved
  on. Instead §7.3:1078–1086 asserts each half of `12,059 ≤ 12,500` *where that half is measurable* —
  the index against a transcribed fixture measurement, the framing against D-9's separate budget
  test — so the pin still reddens on the corpus growth it exists to catch (441 bytes) without
  reddening on a conforming implementation. The falsifier survived the fix, which is the outcome
  that protects REQ C-5's "admits the worst standing case with headroom" promise.
- **§3.6's retirement paragraph now states the correction against itself.** TSPEC:468–476 names the
  figure that makes the retired claim true (9,371) *and* the shipped figure that makes it false
  (6,305), rather than quietly tensing the sentence. A future reader who checks the claim against
  the adjacent table now finds agreement instead of a contradiction.
- **Charging framing at its ceiling is declared as conservative** (TSPEC:514) — "at least 441 bytes
  … can only understate the margin, never overstate it". Getting the direction of a safety margin
  explicit is what stops a later reader from re-deriving it the optimistic way.
- **PM Q-01 was answered in the document, not in the changelog only** (TSPEC:1097–1101), so the
  re-capture trigger set stays four literals and an implementer reading §7.3 alone learns which
  edits re-open which pin.

## Recommendation

**Approved with minor changes**

Both v7 findings are resolved, the routed TE items landed, and the round's edits are confined to the
sections the changelog declares. The two findings below are Medium: neither moves a threshold, an
acceptance criterion, or a requirement's meaning — both are internal-accuracy defects in prose about
*which tests* pin C-5's default, and they should be corrected before the PLAN's test tasks are
written from §7.3 and §9.2.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §9.2's ERR-2 discharge (TSPEC:1482) now reads "the only tests that read the value are §7.3's two shipped-default assertions". The census is still short: §5.3 (TSPEC:850–858) specifies `decision-ledger-config-example.test.js` asserting `decisionLedger`'s key→value map **by set equality against a literal transcription** of C-5's three defaults — including `maxBytes: 12500` — and §5.3 deliberately requires that literal be hand-transcribed "rather than imported from `DECISION_LEDGER_DEFAULTS`", precisely so it does *not* agree with the code by construction. That test therefore reads the value in the strongest sense and reddens on any default change, as does the example JSON at TSPEC:850. The paragraph's product point — that re-deciding ERR-2 costs "one literal in C-5's row and the same literal in the config parser's default" — understates the change surface by two sites. Fix: name §5.3's example block and its transcribed-literal test alongside the two §7.3 conjuncts, and say plainly that a default change costs four edits, not two. Traces to REQ C-5 / ERR-2. | §9.2 ERR-2 discharge |
| F-02 | Medium | inherited | local | §7.3 promises "(6) reddens if an operator-facing default moves below the standing case" (TSPEC:1087–1089), and §9.2:1482 justifies it by saying both assertions "express it as `maxBytes − 1200` rather than as a transcribed literal". But both builds are specified as running "at C-5's shipped defaults (`maxEntries: 70`, `maxBytes: 12500`)" (TSPEC:1031, 1070) — with the value written out. If the oracle passes `12500` as a config literal, then `maxBytes` in the assertion is that literal, and a change to `DECISION_LEDGER_DEFAULTS.maxBytes` reddens neither conjunct (2) nor (6); the stated falsifier does not exist. The claim holds only if the oracle omits the two keys (or reads `DECISION_LEDGER_DEFAULTS`) so the *resolved* default flows into both the build and the assertion's right-hand side. §7.3 does not say which, and the two sentences pull opposite ways. Fix: state explicitly that the M-6b-slice and whole-fixture builds resolve their bounds through the config resolver with the block absent, and that `12500`/`70` appear in §7.3 as the *expected* resolved values rather than as inputs. This is the difference between a test that guards C-5's operator-facing default and one that only guards the corpus. Traces to REQ C-5. | §7.3 conjuncts (2)/(6) and the "reddens" paragraph |

FINDING: Medium | delta | local | §9.2 ERR-2 discharge (TSPEC:1482) | The corrected census "the only tests that read the value are §7.3's two shipped-default assertions" is still short one site: §5.3's `decision-ledger-config-example.test.js` (TSPEC:850–858) asserts C-5's defaults by set equality against a hand-transcribed literal including `maxBytes: 12500`, and the example JSON at TSPEC:850 carries the value too — so re-deciding ERR-2 costs four edits, not the two the paragraph names. Name §5.3's two sites alongside the §7.3 conjuncts.
FINDING: Medium | inherited | local | §7.3 conjuncts (2)/(6) and the "(6) reddens if an operator-facing default moves" paragraph (TSPEC:1031, 1070, 1087–1089) | Both builds are specified as running with `maxBytes: 12500` written out as a config value, so if the oracle passes it as a literal, `maxBytes − 1200` is computed from the literal and a change to `DECISION_LEDGER_DEFAULTS` reddens neither conjunct — contradicting the stated falsifier and §9.2's "rather than as a transcribed literal". State that both builds resolve bounds through the config resolver with the `decisionLedger` block absent, and that `12500`/`70` are the expected resolved values, not inputs.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}

APPROVAL-HASH: sha256:1f1d7752522623b6fff9231fe6ac01cabb1b249039f01d2721b77a7f09bafc77
APPROVAL-HASH-NORMALIZED: sha256:43fa79ddc1dc94cedf4c04e2afa62954413bca009957f77161e95114225c04bc
REVIEWED-COMMIT: 277db8b27135938a00d663aa251c5176f43af727
UPSTREAM-STATE: REQ sha256:ce6b133f0c1d692f172f1753b4d17a075bf1f933827a34701b2ee69d0d3c7b7c
UPSTREAM-STATE: FSPEC sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39
