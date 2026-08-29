# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.7)
**Date:** 2026-08-28
**Iteration:** 8 (delta confirmation on round 7's erratum)

**Upstream:** unmoved — REQ v1.9, FSPEC v1.3, Baseline v1.2. No pin advanced and no measured
value moved in this delta; verified against `docs/_constraints/pdlc-decision-corpus-baseline.md`
(`Version | 1.2 · 2026-08-28`, `M-6b`:101, `M-7b`:110, `M-7c`:111, `M-7d`:112).

## Scope of this round

Confirmation only: my round-7 F-01 (High) and F-02 (Low), plus the PM's F-01 (Medium), on the
delta `8d821b104`, `4de976998`, `277db8b27` (+63 / −23 against `25808e80f`, the commit I last
reviewed). Sections the edit did not touch are not re-litigated.

## Item-by-item

| Routed item | Landed | Evidence |
|---|---|---|
| TE F-01 (High) — conjunct (5) pinned the block at the framing **ceiling**, so a conforming implementation drafted under budget would redden it | **Yes, in the exact form asked** | TSPEC:1074–1086. (5) now pins *the 63 rendered index lines joined by `\n`* at the transcribed **10,859** bytes; (6) states the margin as `10,859 ≤ maxBytes − 1200` (`10,859 ≤ 11,300`, difference 441). Symmetry claim checked against conjunct (2) at TSPEC:1036–1037 (`6,305 ≤ maxBytes − 1200`) — the two are now the same shape |
| TE F-02 (Low) — §9.2 said "the only test that reads the value" | **Yes** | TSPEC:1482 names both, and correctly: conjunct (2) (whole-fixture) and conjunct (6) (`M-6b` slice), "both of which express it as `maxBytes − 1200` rather than as a transcribed literal" — which is what :1037 and :1083 do |
| PM F-01 (Medium) — §3.6's retired arithmetic tensed the `8000` default but not the equally retired long line format | **Yes** | TSPEC:471–476 names both retired inputs and states the shipped figure. Arithmetic re-derived: `8000 − 1200 = 6,800`; the long form's project-level set is 9,371 (> 6,800, so `maxBytes` did bind), the shipped `§ {id}` form is 6,305 (< 6,800, so "it would have fitted inside 6,800 even at the retired default" holds). 9,371 is not a new figure — it is the same value the §3.6 table already carries at :487 and D-7 at :1426 |
| Consequent re-pins | **Yes, consistent** | §3.6:512–514 now charges framing "at its ≤1,200-byte ceiling" and states **at least** 441 bytes of headroom, with the direction of the inequality explained; §3.6:543–547 and D-10:1430 recite the split identically. No occurrence of a live `12,059` equality assertion survives (grepped all 16 sites) |

Arithmetic re-derived independently, not read from the prose: `12,500 − 1,200 = 11,300`;
`11,300 − 10,859 = 441`; `10,859 + 1,200 = 12,059 ≤ 12,500`. Against the Baseline, `M-7b`'s 9,296
substance bytes over 63 records plus per-line rendering framing is consistent with 10,859, and
`M-7d` is explicit that substance bytes exclude rendering framing and that the consuming TSPEC
declares its own allowance — which is what §4.3 does.

## Why the new form is the stronger oracle, not the weaker one

The concern behind round 7's finding was that dropping an equality loses a falsifier. It does not:

- **The behavioural outcome is still asserted positively.** Conjunct (4) pins `omitted[]` **empty**
  *and* set-equality of the rendered id set against all 63 transcribed ids (TSPEC:1071–1073). That
  is the production-visible claim §3.6 rests on, and it is a set-equality over the full
  enumeration, so a deleted or re-ordered id reddens it — not a containment check.
- **The margin retains its falsifier.** (5) reddens on any corpus growth or line-format regression
  that moves the rendered index off 10,859 — including the 441 bytes that would consume the
  margin — and (6) reddens if the shipped default drops below the standing case. The old
  12,059 equality could not have caught anything (5) cannot.
- **Neither half of `12,059 ≤ 12,500` is now unpinned.** I checked the other half exists rather
  than trusting the cross-reference: §4.3:713–716 pins the four framing constants at ≤ 1,200 bytes
  with a unit test that reddens if a rule-text edit exceeds it, and D-9:1428 records it. So the
  sum is pinned in two measurable pieces, not left as prose.
- **No implementation echo introduced.** 10,859 and the 63 ids are hand-transcribed from the frozen
  fixture, never derived from the renderer or a manifest (TSPEC:1094–1096, :1107–1110). `maxBytes`
  in (2)/(6) is the shipped configuration value under test, which is the point of a default-guard,
  not a derived expected value.

## Findings raised on this delta

**F-01 (Low, delta, local) — the v0.6 changelog entry still recites the superseded pin in the
present tense.** TSPEC:46–47 records round 6 as giving §7.3 a second assertion pinning "the
transcribed **12,059**, and `12,059 ≤ 12,500`". As a history of what v0.6 did that is accurate, but
it is the only present-tense statement of that pin left in the document, and a reader grepping
`12,059` lands on it as though it were live. The v0.7 entry directly above explains the change, so
this is presentational: a trailing clause such as "— superseded in v0.7 by the 10,859 index pin" on
that sentence closes it. Not gating.

## Questions

None.

## Positive Observations

- The fix took the form that keeps *both* falsifiers rather than the cheaper form that drops one.
  Pinning the index at 10,859 and the margin as `maxBytes − 1200` makes conjunct (6) mirror
  conjunct (2) exactly, so §7.3 now states the same arithmetic the same way in both assertions —
  a reader who understands one understands the other, and a future re-capture updates both
  literals at one moment.
- The reason the split was needed is written down where the next reader will hit it (:1076–1080),
  not just in the changelog: framing is a budget the not-yet-written constants must fit, not a
  measurement of drafted text. That is the durable form of the finding.
- PM Q-01 is answered explicitly and correctly at :1095–1098 — the framing size is *not* a fifth
  transcribed literal, so a rule-text edit inside budget re-opens neither (5) nor (6). That is a
  real property of the split, and stating it prevents a future author from "helpfully" adding a
  fourth pin that would churn.
- The PM's §3.6 fix names the *pair* of retired inputs rather than patching the sentence to agree
  with the table, and gives the counterfactual (6,305 would have fitted in 6,800). The paragraph is
  now checkable against the table beneath it in both directions.
- §3.6's headroom is now stated as a floor ("at least 441") with the reason charging the ceiling
  can only understate it. That is the correct direction for a safety margin.

## Recommendation

**Approved with minor changes**

My round-7 High is resolved in substance, not merely acknowledged, and I found no High or Medium
issue introduced by the delta. The single Low above is presentational and can be folded into any
later edit; it does not warrant a round.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Low | delta | local | The v0.6 changelog entry still recites §7.3's assertion as pinning "the transcribed 12,059, and `12,059 ≤ 12,500`" in the present tense; superseded by v0.7's 10,859 index pin. Mark it superseded | Changelog, v0.6 erratum entry (TSPEC:46–47) |

FINDING: Low | delta | local | Changelog, v0.6 erratum entry (TSPEC:46–47) | The v0.6 entry still states in the present tense that §7.3 pins "the transcribed 12,059, and `12,059 ≤ 12,500`" — the only live-reading statement of the superseded pin left in the document; add a "superseded in v0.7 by the 10,859 index pin" clause.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
