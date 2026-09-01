# Post-Mortem: Phase D — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `TSPEC-pdlc-decision-ledger.md` (v0.6, `88fe6dbae`) ← `REQ` v1.9 `sha256:ce6b133f…`, `FSPEC` v1.3 `sha256:2bd5c3ef…`, Baseline v1.2 |
| Downstream | Phase D re-entry; PROPERTIES, PLAN (blocked) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v{1..7}.md`, `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{1..3}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |
| Author | se-author |
| Date | 2026-08-28 |

RESOLVED: yes

**Resolution record (2026-08-29).** Every item in `## Recommendation` is addressed on
`feat-pdlc-decision-ledger`:

- **Items 1–5 (blocking, all TSPEC)** landed as the **v0.7 erratum** (commits `8d821b104`,
  `4de976998`, `277db8b27`): §7.3 conjuncts (5)/(6) re-stated in measured units (10,859 pinned,
  margin `10,859 ≤ 11,300`, difference 441); `12,059` swept from every asserting site (§0, §3.6,
  §7.3, D-10), surviving only as labelled upper-bound prose; §3.6's retired-default sentence names
  both retired inputs; §9.2 ERR-2's discharge pluralised; PM Q-01 answered in §7.3. Verified by
  both reviewers: `CROSS-REVIEW-product-manager-TSPEC-v8.md` and
  `CROSS-REVIEW-test-engineer-TSPEC-v8.md`, each `VERDICT: Approved with minor changes`, 0 High.
- **Item 6** — `DECISIONS-pdlc-decision-ledger.md` **v1.3** adds **DEC-DECLEDGER-16**, the
  byte-literal provenance rule (ceiling only ever on the larger side of an inequality), with a
  Consequences row for PROPERTIES and a re-evaluation trigger.
- **Item 7** — recorded in `LEARNINGS-pdlc-decision-ledger.md` §4.1 (re-derive reviewer-supplied
  literals before they become normative).

**Failure class:** ERRATUM-PROTOCOL. Phase D halted because the delta confirmation of the
TSPEC erratum round did not pass — non-approving: `te-review` — and the follow-up budget of
**1 round** was already spent.

## Phase

**D** — technical design: TSPEC authoring and review, DECISIONS authoring and review, and the
erratum channel opened against the approved TSPEC when its upstream moved.

The document itself reached approval. TSPEC **v0.4** was approved by both reviewers at round 4
(`product-manager`: *Approved with minor changes*, 0 High; `test-engineer`: *Approved with minor
changes*, 0 High). DECISIONS reached the same state at round 3. What halted the phase is
downstream of that approval: REQ moved to v1.8 and then v1.9 under its own erratum channel,
changing `C-5`'s `maxBytes` default from `8000` to `12500`; the cascade re-opened the TSPEC
(rounds 5–7). Round 7 was the **delta confirmation** of round 6's erratum edit. It returned
`VERDICT: Needs revision` from `te-review` with one High, the follow-up budget was spent, and
the phase stopped.

No requirement, threshold or acceptance criterion is in dispute. The open defect is a single
arithmetic conjunct in one test assertion (§7.3), and **both reviewers identified it
independently in the same round** — they differ only on severity.

## Iterations

**7 on TSPEC** (4 review rounds, then an upstream-cascade confirmation and two erratum rounds);
**3 on DECISIONS** (converged).

| Round | TSPEC version | Kind | product-manager | test-engineer |
|---|---|---|---|---|
| 1 | v0.1 | review | Needs revision (1 H, 2 M, 2 L) | Needs revision (5 H, 4 M, 3 L) |
| 2 | v0.2 | delta re-review | Approved with minor changes (0 H, 2 M, 3 L) | Needs revision (1 H, 1 M) |
| 3 | v0.3 | delta re-review | Approved with minor changes (0 H, 1 M, 1 L) | Needs revision (1 H, 1 M, 2 L) |
| 4 | v0.4 | delta re-review | **Approved** with minor changes (0 H, 1 M, 1 L) | **Approved** with minor changes (0 H, 1 M, 1 L) |
| 5 | v0.4 (bytes unchanged) | upstream-cascade confirmation (REQ v1.8) | Needs revision (2 H, 3 M) | Needs revision (3 H, 3 M, 1 L) |
| 6 | v0.5 | erratum delta confirmation | Approved with minor changes (0 H, 1 M) | Needs revision (1 H, 0 M, 3 L) |
| 7 | v0.6 | erratum delta confirmation | Approved with minor changes (0 H, **2 M**) | **Needs revision (1 H, 0 M, 1 L)** ← halt |

DECISIONS, for completeness — it converged and is not part of the halt:

| Round | DECISIONS version | product-manager | test-engineer |
|---|---|---|---|
| 1 | v1.0 | Needs revision (2 H, 1 M, 2 L) | Needs revision (4 H, 1 M, 1 L) |
| 2 | v1.1 | Approved with minor changes (0 H, 1 M) | Needs revision (1 H, 1 M) |
| 3 | v1.2 | Approved with minor changes (0 H, 1 M) | Approved with minor changes (0 H, 1 M) |

Round 7's delta landed in four commits (`04a6dc249`, `fa41f8680`, `1b3bc5004`, `88fe6dbae`,
+90/−19) across §0, §3.6, §4.1, §6.1 F-13, §7.3, §7.6 AT-14, §9.2, §9.4 and D-10. Both
reviewers verified the diff touched nothing outside the declared list and that every routed
item landed. **Five of five routed items landed; the sixth item is new, minted by one of the
five fixes.**

## Reviewers

| Role | File series | Terminal verdict | Open at halt |
|---|---|---|---|
| product-manager | `CROSS-REVIEW-product-manager-TSPEC-v{1..7}.md` | Approved with minor changes | F-01 Medium (§3.6 retired-default sentence names one of two retired inputs), F-02 Medium (§7.3 conjunct (5) pins the framing *ceiling*), Q-01 open (what re-opens the 12,059 pin) |
| test-engineer | `CROSS-REVIEW-test-engineer-TSPEC-v{1..7}.md` | Needs revision | F-01 **High** (§7.3 conjunct (5) / D-10 — same defect as PM F-02), F-02 Low (§9.2 ERR-2 "the only test that reads the value" is stale by one) |

**The reviewers agree on the facts.** PM F-02 and TE F-01 are the same finding, arrived at
independently, with the same diagnosis (`12,059 = 10,859 + 1,200`, where `1,200` is §4.3/D-9's
framing **budget ceiling** over constants that do not exist yet, not a measurement) and
compatible remedies. The only divergence is the severity bar:

- `te-review` scored it **High**: a conforming implementation whose framing renders under
  budget reds the assertion on day one, and `12,059` is not hand-transcribable from the fixture
  (the fixture holds decision records, not `DECISION_LEDGER_PREAMBLE` / `DECISION_LEDGER_RULE_TEXT`).
- `pm-review` scored it **Medium** and wrote the gate reasoning explicitly into its
  recommendation: *"Both findings are Medium, neither High, so this confirmation does not halt
  the phase."*

That is the whole disagreement. Neither reviewer was wrong on the merits and neither was
low-quality: both re-executed the arithmetic against HEAD, both confirmed the five routed items
landed, both refused to re-litigate approved sections, and both filed **Positive Observations**
noting the round-6 remedy was structurally the right shape (a second assertion over the
`M-6b` slice, not a restatement of the whole-fixture pin). This was not a reviewer-quality
failure and not a substantive disagreement — it is a severity-calibration difference on a
defect nobody disputes.

## Pattern of Disagreement

**One arithmetic chain carried the blocking finding in six of the seven rounds, and the last
three rounds each fixed the previous round's remedy.** The chain is the byte-budget argument
that justifies "no line is omitted on any real dispatch": a default (`maxBytes`), minus a
framing charge, compared against a measured rendered-index size.

```
TE F-01 (r1) → [converged r2–r4] → PM/TE cascade (r5) → TE F-01 (r6) → TE F-01 (r7)
```

All of them sit on **§3.6's headroom rationale**, **§4.3's framing pin (D-9)** and **§7.3's
shipped-default assertions (D-10)** — three sites stating one derivation.

| Round | What moved | The finding it produced |
|---|---|---|
| 1 | §3.6 claimed the byte bound was never reached and the omission order inert | False at the then-current `8000` default: the project-level set **alone** rendered 9,371 bytes under the then-current long line format |
| 2–4 | line format shortened (9,371 → **6,305**), corpus measurements pinned to a frozen baseline, framing pinned at ≤1,200, D-9/D-10 recorded | Converged — v0.4 approved by both reviewers |
| 5 | *nothing in the TSPEC*; REQ v1.8/v1.9 resolved `C-5` to `12500` | Every number derived from `8000` went stale at once: `8000 − 1200 = 6,800` and "`maxBytes` binds first in every case" became false |
| 6 | retired the `8000` arithmetic, re-pinned upstream, re-derived `12500 − 1200 = 11,300` | The load-bearing margin moved to `M-6b`'s **441** bytes while §7.3's pin still watched the whole-fixture **~4,995** slack — the claim could expire silently with every test green |
| 7 | added the `M-6b`-slice assertion **in the words round 6 asked for**, pinning `12,059` | `12,059 = 10,859 + 1,200` mixes a measurement with a **budget ceiling**; the equality reds a conforming implementation on day one |

Two features of this shape are worth naming precisely, because they are what a re-entry has to
break:

1. **The remedy is the next defect.** Round 7's High is round 6's own suggested wording. The
   round-6 finding asked for an assertion pinning "the transcribed 12,059"; the author landed
   exactly that; the round-7 confirmation opens by conceding the point — *"this is my own
   round-6 wording coming back wrong"*. Round 5→6 has the same structure one level up: the
   round-6 High exists because round 6's own re-derivation moved the load-bearing margin from
   ~4,995 to 441 and left the old pin in place.
2. **The disagreement is about severity, not substance, and severity is what closed the gate.**
   PM and TE filed the same defect in the same round with the same fix; a Medium/Medium round
   would have passed the confirmation and left the same broken assertion in the document for
   `se-implement` to hit. The gate did the right thing here — but it did it on a one-vote
   calibration margin, not on a reviewer disagreement about what the document should say.

Everything outside this chain converged and stayed converged: rounds 2–4 closed nine PM and
thirteen TE findings that were never reopened; rounds 6 and 7 landed nine routed items between
them with zero regressions outside the declared diff; DECISIONS converged in three rounds; the
FSPEC v1.3 `maxBytes`-`0` widening was absorbed in round 7 and both reviewers verified the
absorption as faithful at all three sites.

## Best-Guess Root Cause

**The TSPEC asserts equalities over byte literals whose operands come from different
provenance classes, and prose altitude makes the mismatch invisible — every number is "bytes".**

Five literals participate in the argument, and they are not the same kind of thing:

| Literal | Provenance class | Can a test transcribe it? |
|---|---|---|
| `12500` | upstream **decision** (REQ C-5 resolved default) | yes — read from the shipped default |
| `1200` | **budget ceiling** on constants that do not exist yet (§4.3 / D-9) | **no** — it bounds drafted text, it does not measure it |
| `6,305`, `10,859` | **measurements** at frozen Baseline v1.2 (`M-1d`, `M-6b`) | yes — hand-transcribed from the fixture |
| `11,300` | derived: `12500 − 1200`, decision **minus ceiling** | as an upper bound only |
| `12,059` | derived: `10,859 + 1200`, measurement **plus ceiling** | **no** — has no fixture source |

`11,300` is sound because the ceiling is used conservatively: `measured ≤ default − ceiling`
understates the margin and cannot go green falsely. `12,059` is unsound because the same
ceiling is used **additively inside an equality**: it overstates the block, and it can only be
satisfied by an implementation that spends its framing budget to the last byte. §4.3 states
this in its own words — 1,200 is *"a budget the rule text must be drafted to fit, not a
measurement of drafted text"* — one section away from the assertion that treats it as a size.
The document contains its own refutation and neither the author nor the reviewer who proposed
the wording noticed, because at prose altitude `10,859 + 1,200 = 12,059` is arithmetically
true. It is only *dimensionally* false.

Three contributing causes made this a halt rather than a caught typo:

1. **A reviewer's suggested literal was transcribed as a specification.** The round-6 finding
   proposed the remedy in concrete numbers; the author landed the numbers rather than
   re-deriving them. The author's contract is to address the finding, not to adopt its
   suggested wording verbatim — a suggested remedy is evidence about the defect, not a
   verified fact about the design. The same discipline the TSPEC applies to its own citations
   ("every claim about existing code cites file and line") was not applied to a number a
   reviewer supplied.
2. **The upstream cascade re-opened an approved document's arithmetic wholesale.** REQ's own
   erratum moved `C-5` from `8000` to `12500` after TSPEC v0.4 was approved by both reviewers.
   That single upstream change invalidated a derivation stated in three coupled sites (§3.6,
   §4.3, §7.3) plus two decision records (D-5, D-9/D-10), and every subsequent round had to
   re-derive all of them together. Rounds 5, 6 and 7 are one re-derivation performed in three
   instalments — which is exactly what a **1-round follow-up budget** cannot absorb.
3. **The erratum channel's confirmation budget is sized for independent items, not for a
   coupled numeric chain.** Round 7 landed five of five routed items correctly; it failed on a
   sixth that could not exist until the fifth landed. A budget of one follow-up round assumes
   remedies are terminal. For a chain where each remedy is itself a new derivation, the
   expected number of rounds is not one.

**What is *not* the cause:** reviewer quality (both re-executed everything against HEAD),
scope creep (no section outside the declared diff moved in rounds 6 or 7), upstream
faithfulness (both reviewers verified the REQ v1.9 / FSPEC v1.3 pins and the E-7 absorption),
or design soundness. The `M-6b`-slice assertion is the right assertion; one of its six
conjuncts is written in the wrong units.

## Recommendation

Address the items below on the branch, then set `RESOLVED: yes` in this file with a commit
message naming what addressed each one. Re-invoke with `forcePhases: "D"`.

The corrective work is **small and fully specified** — both reviewers converged on the same
remedy, no alternative was left open, and no product or threshold question is in dispute. One
round should close it.

**1. Rewrite §7.3's `M-6b`-slice conjuncts (5) and (6) in the units the document already
   defines (blocking).**
Take `te-review` F-01's prescription, which `pm-review` F-02 endorses in weaker form — mirror
conjunct (2)'s shape:

  - **(5)** pin the 63 rendered index lines at the transcribed **`10,859`** (a real fixture
    measurement, `M-6b`, exactly as (2) pins `6,305`).
  - **(6)** state the margin as `10,859 ≤ maxBytes − 1200` → `10,859 ≤ 11,300` at C-5's
    resolved default, **441 bytes**.

  This keeps both falsifiers round 6 asked for — (5) reddens on 441 bytes of corpus growth or a
  line-format regression, (6) reddens if the operator-facing default drops below the standing
  case — without depending on a constant that has not been written. Do **not** substitute
  `≤ 12,059` for the equality as a first choice: it is sound but it re-imports the unwritten
  constant into the assertion for no falsifying power.

**2. Sweep `12,059` out of every site that asserts it, not just §7.3 (blocking).**
The literal is load-bearing in the §0 changelog, §3.6's headroom paragraph and closing
arithmetic, §7.3's conjuncts and its "all four transcribed literals" paragraph, and the
**D-10** row. Leaving it in one place while §7.3 pins 10,859 reproduces exactly the round-6
defect (a pin and a claim that no longer watch the same number). `12,059` may survive as
*prose* describing the worst-case block under the full framing budget — clearly labelled as an
upper bound — but nothing may assert it and nothing may call it transcribed.

**3. Name both retired inputs in §3.6's retired-default sentence (blocking — `pm-review` F-01).**
The sentence *"8,000 less ≤1,200 of framing left under 6,800 bytes for lines, below the
project-level set alone"* is true only under the **retired long line format** (9,371) and false
against the shipped form the adjacent table bolds (6,305 < 6,800). Tense both inputs — the
`8000` default *and* the long line format — or delete the sentence; its only remaining job is
historical, and the adjacent table already carries the live numbers.

**4. Pluralise §9.2 ERR-2's discharge paragraph (`te-review` F-02, Low).**
*"the only test that reads the value"* is stale by one: round 6 added a second shipped-default
assertion over the `M-6b` slice, and both read C-5's default. Name both.

**5. Answer `pm-review` Q-01 in §7.3 while you are there.**
Q-01 asks whether a rule-text edit inside the ≤1,200 budget re-opens the pin. Under item 1 the
answer becomes structural and should be stated: the transcribed literals move **only** with a
Baseline re-capture, and framing size is deliberately not among them — which is precisely why
it must not appear inside a pinned total.

**6. Adopt a provenance rule for byte literals — the durable fix (strongly recommended,
   extend DECISIONS).**
Add to `DECISIONS-pdlc-decision-ledger.md` (as an extension of D-9/D-10) a rule that every byte
literal in the TSPEC carries its provenance class — *upstream decision*, *measured at Baseline
v{N} (`M-xx`)*, or *budget ceiling (unwritten)* — and that **a budget ceiling may appear only
on the larger side of an inequality, never as a term in an asserted equality**. That single
rule refutes both the round-6 and the round-7 High mechanically, at authoring time, and it is
the only item here that stops the chain rather than fixing its current link. Consider promoting
it to `docs/_constraints/DOMAIN-CONSTRAINTS.md` at consolidation: the pattern is not specific to
this feature.

**7. Process, for the harvest — do not transcribe a reviewer's numbers (non-blocking).**
Round 7's High is round 6's own suggested remedy landed verbatim. When a finding supplies a
concrete literal, re-derive it before it becomes normative, and state the derivation next to it
so the next confirmation can check it. Record this in `LEARNINGS-pdlc-decision-ledger.md`.

**Budget note for the re-entry.** If the erratum channel is re-opened for this document, the
follow-up budget of 1 round is the binding constraint, not reviewer patience: rounds 5–7 were a
single re-derivation split across three instalments. Landing items 1–5 as **one** edit — with
item 6's rule applied to that edit before submission — is what makes a single confirmation
round sufficient.

## Provenance

- Engine version: 0.2.4
- Plugin version: 0.23.6
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Halting gate: erratum delta confirmation, round 7 — non-approving: `te-review`
- Follow-up budget: 1 round (spent)
- TSPEC at halt: v0.6, `88fe6dbae`
- Confirmations at halt: `72fd38c9d` (pm-review, Approved with minor changes), `25808e80f` (te-review, Needs revision)

**Provenance**
- Engine version: 0.2.4
- Plugin version: 0.23.4
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
