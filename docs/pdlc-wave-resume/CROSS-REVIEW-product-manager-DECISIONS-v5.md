# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md`
**Date:** 2026-08-23
**Iteration:** 5 (upstream-cascade confirmation; DECISIONS bytes unchanged since v4 approval)
**Cascade trigger:** TSPEC erratum round 5 — `docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` moved from v1.3 (`03483136`, `sha256:5ed76227…`, the version v4 approved against) to v1.4 (`31df4eda`)

## Context

DECISIONS was approved at v4 against TSPEC `sha256:5ed76227…` (TSPEC v1.3, commit `03483136`). Its own
bytes have not moved since: `git log` shows no commit touching
`DECISIONS-pdlc-wave-resume.md` after `a0cb8d32`, and the v4 approval anchors
(`REVIEWED-COMMIT: 18c629a8`) still describe the file at HEAD. What moved is upstream. TSPEC took an
erratum round (round 5, Phase PR) across nine commits, `e75295b6`…`31df4eda`, and is now v1.4.

The single question this confirmation answers is whether DECISIONS is still a faithful compression of
the TSPEC that now stands — measured against upstream text at HEAD, not against the round's item list.
I re-read my own v4 cross-review, ran `git diff 03483136 31df4eda` over the TSPEC, and then re-read the
current upstream text behind every DECISIONS clause that cites TSPEC (`grep -n 'TSPEC §'` over
DECISIONS returns citations at `:103`, `:132`, `:167`, `:205`, `:232`, `:270`, `:303`, `:413`, `:458`).

The round changed nine things upstream. Mapping them onto DECISIONS' cited surface:

| TSPEC change (round 5) | Does DECISIONS lean on it? |
|---|---|
| §3.1 + §6.1 DEC-WVR-06: interpolated-value count corrected **four → five** (`TSPEC:433`, `TSPEC:897`) | **Yes** — DECISIONS O-8 (`:201`–`:207`) states the count in its own words and quotes the superseded §3.1 sentence. See F-01. |
| §2.4 exclusion column: the discriminating conjunct for the invalid-pointer notice is now named explicitly | **Yes** — DECISIONS O-5 (`:167`–`:169`) characterises §2.4 as omitting that notice. See F-02. |
| §2.5 restated: FSPEC §3.4's write-side clause landed, so §2.5 ratifies rather than routes | No. `grep -n 'write site\|explicitPointer\|§3.4'` over DECISIONS finds only surface counts (`:45`, `:431`) and the no-new-IO citation (`:103`, `:113`, `:270`, `:413`) — none of which the restatement touches. |
| §6.3: all four errata re-recorded as landed upstream, none re-emitted | No. DECISIONS' two "raised as an erratum" parentheticals (`:169`, `:207`) are DECISIONS→TSPEC errata, a different channel; they are reached by F-01/F-02 on their content, not by §6.3. |
| §6.2 OB-F1: the REQ/FSPEC characterisation re-raise closed; **substance untouched** | No change owed. DECISIONS carries OB-F1 only as the sequencing precondition (`:37`, `:446`), which the edit explicitly preserves. |
| §1.3 repointed at REQ OB-1's current framing | No. DECISIONS makes no worktree claim. |
| §5.4 AT-05 write-side conjunct; §5.5 mutations **three → five** | No. `grep -n 'AT-05'` over DECISIONS returns nothing, and DECISIONS' two mutation sentences (`:219`, `:386`) are unquantified ("every mutation this feature could make"). |
| §5.7 generative runs pinned at `numRuns: 500` | No. DECISIONS carries no harness or run-count claim. |
| §5.8 `c8.include` corrected to four entries | No. DECISIONS' only four-key claim is V-13's `implementation` config surface (`:153`), a different object. |

Two of the nine reach DECISIONS. Both land on parentheticals I have already flagged; one of them is
made materially worse by this round, which is why it is recorded as `delta` rather than `inherited`.

## Options Considered

Three dispositions were open for this confirmation, and the choice between them is what the verdict
encodes:

- **(a) Re-confirm unchanged — "no findings, approval carries over."** Rejected. It is the honest answer
  only if no DECISIONS clause leans on text the round moved, and one does: O-8's count claim now
  disagrees with §3.1 at HEAD on the substance, not merely on attribution. Silently re-approving would
  freeze a number in a downstream document that upstream has corrected — exactly the drift this
  cascade check exists to catch.
- **(b) Route the whole document back to a full DECISIONS revision round (a `delta` High).** Rejected on
  evidence. A High here would have to show a decision clause, an alternative's disposition, a
  constraint row or a re-evaluation trigger that no longer follows from upstream. The affected text is
  a supporting parenthetical: DEC-WVR-06's actual claim — *reason codes, not rendered sentences, are the
  closed catalogue* — rests on **three of seven reasons interpolating**, and three is exactly what
  §3.1 still says at HEAD (`TSPEC:432`–`:436`). The count that moved is the count of interpolated
  *values*, which no decision, no obligation and no acceptance criterion turns on. Escalating it would
  be inflating severity to attract attention, which the severity bar forbids.
- **(c) Confirm the decisions as still holding, and record the count divergence as a non-gating
  `delta` Medium alongside the three findings already carried.** Chosen. It keeps the approval
  standing where the evidence supports it, and leaves the author a precise, mechanical fix
  (`four` → `five`, plus a tense change) that the next DECISIONS edit — whenever one is owed — can
  land without reopening anything settled.

I did not consider re-reading DECISIONS from scratch: the delta protocol scopes this round to prior
findings plus the sections upstream churn reaches, and every settled decision is out of scope.

## Decision

**DECISIONS still holds against the TSPEC that now stands.** No decision clause, alternative
disposition, constraint row, reversibility claim, re-evaluation trigger or downstream obligation in
the document has been falsified by the round-5 erratum edit. No P0 or P1 requirement is narrowed,
dropped or reinterpreted by the cascade, and no re-triggered cascade is owed to PLAN or PROPERTIES on
the product lens.

Checked positively, clause by clause, against upstream at HEAD rather than against the round's item list:

- **DEC-WVR-06** (`:205`–`:207` / `:360`, decision at `:897` upstream) — the load-bearing claim is
  "three of the seven disregard reasons interpolate run-specific values". `TSPEC:432`–`:436` at HEAD
  names the same three reasons (`feature-mismatch`, `head-unreachable`, `over-count`), and TSPEC's own
  DEC-WVR-06 row still reads "three of the seven interpolate run-specific values". The rejection of
  set-equality-over-rendered-sentences therefore stands on unchanged ground. Only the parenthetical
  value count diverges — F-01.
- **DEC-WVR-03 / O-5** (`:132`, `:167`–`:169`, `:303`, `:433`, `:458`) — the "exactly three shipped
  whole-string assertions change" claim and the enumerated replacements still trace to §2.4's
  enumeration, which the round did not renumber; it only named the discriminating conjunct in the
  exclusion column. The count of announcements carrying a token, and the "a *fifth* announcement reds
  the assertion" obligation, are untouched. The stale characterisation in the closing parenthetical is
  F-02, carried.
- **DEC-WVR-01** (`:45`, `:240`–`:242`, `:431`) — three pure functions, one read site, one write site;
  §2.5's restatement changes what FSPEC *says* about the write, not where the write is or how many
  there are. Faithful.
- **DEC-WVR-05** (`:331`–`:356`) — the plan-absolute high-water integer and its prefix-only argument
  are untouched upstream; the round edited nothing in §2.2/§3.2 the trigger reads. F-04 remains as
  recorded.
- **DEC-WVR-07** (AT-16 parity scope) — §5.4's AT-05 edit adds a write-side conjunct to a *different*
  AT. AT-16's oracle, and DECISIONS' statement of what BR-16's behavioural half discharges on the
  direct path only, are unchanged.
- **Obligations and risks** (`:37`, `:446`) — OB-F1's substance is explicitly preserved by the round
  ("BL-04 is still unmet, AT-14 is still red in this tree"), so DECISIONS' sequencing precondition —
  do not dispatch the wave carrying AT-14 before the rebase — remains exactly as true as when it was
  approved. This is the highest-consequence product claim in the document, and the round left it intact.

The four findings below are the complete set. One is `delta` (this round's upstream edit created it);
three are `inherited` and carried unresolved from v2/v3/v4, since no round has yet asked the author to
address them. None is High.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | O-8's parenthetical now contradicts §3.1 at HEAD on the substance, not just on attribution. It quotes TSPEC as saying "four of the seven reasons interpolate" and asserts "the correct count is three reasons carrying **four** interpolated values — raised as an erratum". `TSPEC:432`–`:436` at HEAD reads "three of the seven … carrying **five** interpolated values", because the `feature-mismatch` renderer names two values (`it records feature "${recorded.feature}", not "${featureName}"`), not one; `TSPEC:897` (DEC-WVR-06) carries the same five. So DECISIONS quotes a sentence upstream no longer contains, states a value count upstream now contradicts, and reports as outstanding an erratum that landed in TSPEC v1.4. Supersedes v4 F-01, which recorded the same parenthetical when only the tense was wrong. The decision itself is unaffected: three reasons interpolate in both documents. Fix: restate as "three reasons carrying five interpolated values (TSPEC §3.1, v1.4)" and drop the erratum clause. | `## Options Considered` O-8 (`DECISIONS:205`–`:207`) |
| F-02 | Medium | inherited | nonlocal | O-5's closing parenthetical asserts that "TSPEC §2.4's announcement table omits the invalid-pointer notice entirely rather than excluding it by rule; that is an upstream gap, raised as an erratum". §2.4 at HEAD gives the notice its own table row with an exclusion reason, and this round sharpened it further by naming the discriminating conjunct ("*the resume decision emits it*"). The gap reported has not existed for three rounds and is now further from the text than when first flagged. Carried from v3 F-02 / v4 F-02, unresolved. O-5's substantive argument — the count stays three, by a rule a test can apply — is correct and unaffected. Fix: re-attribute to TSPEC v1.0 and record it as closed. | `## Options Considered` O-5 (`DECISIONS:167`–`:169`) |
| F-03 | Low | inherited | nonlocal | The measured-surface table's largest-file row calls `dist/pdlc-cli.mjs` a *generated* artifact "built from the module below", but that artifact's own header names `orchestrate-dev.js` **and** `cli.mjs` as inputs. Document-local drift with no competing upstream claim, so no cascade. Carried from v2 F-01 / v3 F-03 / v4 F-03, unresolved and untouched by this round. | `## Context` measured-surface table, largest-file row (`DECISIONS:44`) |
| F-04 | Low | inherited | nonlocal | DEC-WVR-05's `*(observable)*` re-evaluation trigger depends on a contiguity property that no assertion in the Consequences table owes, so no detector exists that would make the trigger fire. Carried from v2 F-02 / v3 F-04 / v4 F-04, unresolved; the round edited nothing upstream that the trigger reads. | DEC-WVR-05 Consequences / re-evaluation trigger (`DECISIONS:331`–`:356`) |

FINDING: Medium | delta | nonlocal | O-8 parenthetical, DECISIONS:205-207 | Quotes TSPEC §3.1 as "four of the seven reasons interpolate" and asserts the correct count is three reasons carrying four interpolated values, raised as an outstanding erratum. TSPEC:432-436 and TSPEC:897 at HEAD read three reasons carrying FIVE interpolated values, because the feature-mismatch renderer names both the recorded feature and this run's. DECISIONS now contradicts upstream on the number, not only on tense, and reports as open an erratum that landed in TSPEC v1.4. Supersedes v4 F-01. DEC-WVR-06 itself is unaffected: three reasons interpolate in both documents. Fix: restate as three reasons carrying five interpolated values, cite TSPEC §3.1 v1.4, drop the erratum clause.
FINDING: Medium | inherited | nonlocal | O-5 parenthetical, DECISIONS:167-169 | Asserts TSPEC §2.4's announcement table omits the invalid-pointer notice entirely rather than excluding it by rule, and calls that an open upstream gap. At HEAD §2.4 gives the notice its own row with an exclusion reason, and round 5 sharpened it by naming the discriminating conjunct. Carried from v3 F-02 and v4 F-02, unresolved and not touched by this round. Tense and version re-attribution only; O-5's argument that the count stays three stands.
FINDING: Low | inherited | nonlocal | measured-surface largest-file row, DECISIONS:44 | Calls dist/pdlc-cli.mjs a generated artifact built from the module below, while the artifact's own header names orchestrate-dev.js and cli.mjs as inputs. Document-local drift, no competing upstream claim, no cascade. Carried from v2 F-01, v3 F-03 and v4 F-03, still unresolved.
FINDING: Low | inherited | nonlocal | DEC-WVR-05 Consequences and re-evaluation trigger, DECISIONS:331-356 | The observable re-evaluation trigger depends on a contiguity property that no assertion in the Consequences table owes, so nothing would make the trigger fire. Carried from v2 F-02, v3 F-04 and v4 F-04, untouched by this round.

Scope tags for harvest, on the ordinary `Local`/`Cross-Feature`/`Process` axis: F-01 and F-02 are
`Process` — both are the same failure mode, a downstream document narrating an upstream defect in the
present tense and being left behind when the defect is fixed, which recurs across every erratum round
and is a reusable lesson regardless of where the fix lands. F-03 and F-04 are `Local`.

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01 and F-02 have now survived three and four rounds respectively because every round has been scoped to something else. Is there a point in the pipeline that will ask the author to land them — a final DECISIONS revision pass, or a Phase DOD sweep — or should they be handed to harvest as recorded-and-accepted? Neither is wrong; what would be wrong is carrying them silently to ship. |
| Q-02 | §3.1's count has now moved twice (seven→"four of seven" reasons, then four→five values). Both moves were counting *renderer interpolations*, and both were caught by review rather than by a test. Is there an assertion — over the shipped renderers rather than over prose — that would make the number self-checking, so no document has to restate it? This is a question for the TSPEC/PROPERTIES owners, not a finding against DECISIONS. |

## Positive Observations

- **The decisions absorbed a nine-commit upstream round with two parenthetical scratches and nothing
  structural.** Four rounds of TSPEC churn have now passed over a byte-stable DECISIONS, and in all
  four the decision clauses, alternative dispositions and constraint rows have held. That is what
  compressing at the right altitude looks like: the document commits to *why* three interpolating
  reasons make set-equality-over-sentences a fixture assertion, not to how many values those three
  sentences happen to carry.
- **The one thing this round could have broken, it did not.** OB-F1's sequencing precondition —
  AT-14 is red until the rebase lands, so the wave carrying it must not be dispatched first — is the
  document's highest-consequence product claim, and the erratum edit went out of its way to state
  that OB-F1's substance is untouched. DECISIONS `:446` still reads true verbatim.
- **DEC-WVR-06 survives a correction to its own supporting number.** The decision was written so that
  the *shape* of the argument (some sentences interpolate, therefore set equality is over fixture
  data) carries it, with the count as evidence rather than as premise. That is why a four→five
  correction upstream is a Medium erratum here and not a re-litigation.
- **F-01 is a genuinely good catch by the author, half-landed.** DECISIONS refused to propagate a
  count it believed wrong and said so in writing; the TSPEC then corrected it — to a third number.
  The remaining work is bookkeeping, not judgement.

## Consequences

- **DECISIONS remains approved**, now against TSPEC `31df4eda` (v1.4). The v4 approval anchors should
  be read as re-affirmed with the `UPSTREAM-STATE` TSPEC hash advanced to HEAD; no re-approval of the
  decision content is owed.
- **No downstream cascade is triggered on the product lens.** PLAN and PROPERTIES consume DECISIONS'
  clauses, not its parentheticals; nothing they depend on moved. If the TSPEC's five-value count is
  restated anywhere in PROPERTIES, that is a TSPEC→PROPERTIES cascade already covered by this round's
  fan-out, not a consequence of this confirmation.
- **F-01 and F-02 stay open and non-gating.** They cost nothing at runtime and nothing to users; they
  cost a future reader ten minutes of reconciling a document against an upstream that has moved. The
  fix for both is a sentence each, and either the next DECISIONS edit takes them or harvest records
  them — Q-01 asks which.
- **If any later round reopens DECISIONS for substantive reasons, F-01 becomes cheap to land and
  should be landed in the same pass**, together with F-02's re-attribution, so the erratum ledger in
  the document stops describing a state of the world that ended three rounds ago.

## Recommendation

**Approved with minor changes.**

DECISIONS still holds against the TSPEC that now stands. Every decision clause, alternative
disposition, constraint row, reversibility claim, re-evaluation trigger and downstream obligation
remains a faithful compression of upstream at HEAD. No High findings, and none carried. No P0 or P1
requirement is narrowed, dropped or reinterpreted, and no re-triggered cascade is owed.

Changes requested, neither gating:

1. **F-01 (Medium, delta)** — `DECISIONS:205`–`:207`: replace "the correct count is three reasons
   carrying four interpolated values — raised as an erratum" with "three reasons carrying five
   interpolated values (TSPEC §3.1, v1.4)", and drop the quoted superseded sentence and the
   erratum clause.
2. **F-02 (Medium, inherited)** — `DECISIONS:167`–`:169`: re-attribute the "§2.4 omits the notice
   entirely" characterisation to TSPEC v1.0 and record it as closed; leave O-5's argument as written.

F-03 and F-04 remain recorded, Low, and unresolved by choice.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46
APPROVAL-HASH-NORMALIZED: sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46
REVIEWED-COMMIT: f29f2be717e69d2b6e92402e424918d19d78c0f3
UPSTREAM-STATE: REQ sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f
UPSTREAM-STATE: FSPEC sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e
UPSTREAM-STATE: TSPEC sha256:4b5f7f5b2097a344e1e8fafffaa1d7e12f0fd5f583e302f5bf798d22c13c48f5
