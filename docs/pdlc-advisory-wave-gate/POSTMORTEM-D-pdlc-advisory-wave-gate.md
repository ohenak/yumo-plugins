# POSTMORTEM — Phase D (erratum protocol) — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC** → DECISIONS` |
| Downstream | `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-product-manager-TSPEC-v3.md`, `CROSS-REVIEW-test-engineer-TSPEC-v3.md` (delta confirmation, erratum round v1.11 → v1.12) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

**Date:** 2026-08-20
**Halt class:** `ERRATUM-PROTOCOL`
**Halt text:** Phase D halted — the delta confirmation of the TSPEC erratum round did not pass;
non-approving lenses: `[pm-review, te-review]`.
**Document at halt:** `TSPEC-pdlc-advisory-wave-gate.md` v1.12 (`0f2a9710`, content `sha256:4de9cd6b…`)

RESOLVED: no

---

## 1. Phase

**Phase D (design), erratum channel, on the TSPEC.** This was not a review round and not a
re-authoring: it was the delta confirmation of a targeted erratum round that took
`TSPEC-pdlc-advisory-wave-gate.md` from v1.11 (`efeb798e`) to v1.12 (`0f2a9710`, nine commits). The
round was opened with a routed list of seven mechanical items — the retired
`pdlc/workflows/dist/orchestrate-dev.bundle.js` runtime premise in §1.2 and §3.4, §1.1's O-8
`commitPaths` shape, §1.2's `.claude/workflows/` sync premise, §2.5's stray `git add -A --`, two
falsified red-reason caveats in §5.1, and an eighth item reporting DEC-A6-03's snapshot-ref
halt-message obligation as still unlanded upstream.

**What the round did with that list.** It re-grounded on upstream at HEAD before touching the items
(DEC-ERR-03) and found the eighth item **inverted**: the obligation had landed in REQ v1.16 (AC-6.3's
second conjunct) and FSPEC v1.7 (BR-14, §3 Step 10, E-34, AT-06-4 conjunct (3) and its companion
AT-06-4b). Rather than re-route a settled question — DEC-ERR-01's anti-pattern — the round absorbed
it: §2.5 and §4.5 stopped describing the overwrite warning as an operator-runbook remedy this feature
does not carry, and named a mechanism instead (a fifth halt field, `snapshotRef`, non-`null` exactly
when a capture succeeded, from which the halt report renders the ref name and the co-located
overwrite sentence; `null` renders neither).

**What halted it.** Both lenses confirmed all seven mechanical items landed, verified against the
shipped tree rather than against the item list, and confirmed the absorption was the right call. Both
then refused the round for the same reason: the absorption landed in the document's **design** half
(§2.5, §4.5) and never reached its **oracle** half (§5). `git diff efeb798e..HEAD` shows no edit
below §5.1's status caveat except the two re-measured red-reason sentences. §5.6's AT-06-4 row still
reads "carries the root-cause class" — conjunct (2) alone — and FSPEC v1.7's AT-06-4b has no row at
all.

The halt is therefore not a disagreement about the design. It is an **incomplete traversal**: a
routed obligation whose mechanism half landed and whose proof half did not, in a document whose §5.6
is the table PLAN mints red-test tasks from.

## 2. Iterations

**One delta-confirmation round, non-approving from both lenses.** The erratum channel is
single-round by construction: an erratum round is authored, one confirmation round reads the delta,
and a non-approving confirmation halts rather than looping. There was no second attempt to absorb.

| Round | Doc rev | PM verdict | PM findings | TE verdict | TE findings |
|---|---|---|---|---|---|
| Delta confirmation (iteration 3) | v1.12 (`0f2a9710`) | Needs revision | 1 High, 2 Medium (delta); 2 Low (inherited) | Needs revision | 1 High, 1 Medium (delta); 1 Low (inherited) |

**The delta itself passed on the raised list.** Both reviewers built a routed-item verification table
and measured every claim against the tree, not the prose:

| Routed item | Independently measured at HEAD by both lenses | Verdict |
|---|---|---|
| Retired bundle premise (§1.2, §3.4) | `build-runtime.mjs`'s `bundles` array holds one entry, `pdlc-cli.mjs`; `prepack.mjs`'s `MODULE_NAMES` = `["orchestrate-dev.js", "orchestrate-queue.js"]`, copied verbatim | landed |
| O-8 `commitPaths` shape | `for (const promo of waveResolvedPromotions)` over `groupPromotedPaths`'s rows | landed, per promoted task |
| `.claude/workflows/` sync premise | `git ls-files .claude/workflows/` returns zero rows | landed |
| §2.5 `git add -A --` | shipped call is `["add", "-A"]` | landed |
| `advisory-config-example.test.js` red-reason | example config carries `{"enabled": false, "waveBudgetPerRun": 1}` | landed; stated reason correctly retracted as falsified |
| `advisoryQueueSeams.test.js` red-reason | `ADVISORY_SEAMS` is `Object.freeze(["A1"…"A6"])`; `ADVISORY_SEAM_PHASES` carries six rows | landed |
| DEC-A6-03 obligation "unlanded" | FSPEC v1.7 BR-14 / Step 10 / E-34 / AT-06-4 + AT-06-4b; REQ v1.16 AC-6.3 | **inverted by HEAD; correctly absorbed, not re-routed** |

**Erratum-round history on this document.** v1.12 is the **seventh consecutive erratum round** on the
TSPEC (v1.6 Phase D, v1.7 Phase P, v1.8 and v1.9 and v1.10 Phase PR, v1.11 Phase F, v1.12 Phase D).
Six closed; this one did not. The findings that closed it are not new material in the ordinary sense —
two of the four delta findings name sites that a prior round already flagged (`§6 OQ-2` is on its
**second** consecutive flag by TE; §4.5's Snapshot-ref cross-reference on its **third**).

## 3. Reviewers

**pm-review (product-manager lens)** — 5 findings: 1 High + 2 Medium delta, 2 Low inherited.

| # | Sev | Class | Locality | Site | Substance |
|---|---|---|---|---|---|
| PM F-01 | High | delta | local | §5.6 AT-06-4 row; §5.1 file table | `snapshotRef` landed as a designed two-arm operator-facing contract in §4.5, but §5.6's AT-06-4 row still asserts only the root-cause class and there is no AT-06-4b row; FSPEC v1.7's third conjunct (co-location) and E-34's no-capture arm have no oracle. The routed obligation's mechanism half landed and its proof half did not — and PLAN mints red-test tasks from §5.6 |
| PM F-02 | Medium | delta | local | Lineage header, `Upstream` row | The row still pins FSPEC v1.6 over REQ v1.15 while this round's changelog re-grounds on REQ v1.16 / FSPEC v1.7 and cites their hashes; the header advertises superseded upstream against the body's actual grounding |
| PM F-03 | Medium | delta | local | §1.3 residue table, "Per-seam report rows" | The re-measured cell asserts `rows.map((r) => r.seam)` "still reads `["A1" … "A5"]`" and is "unchanged by the v1.12 re-measurement"; at HEAD it reads `["A1" … "A6"]`. The round claims to have checked this cell and left the stale value, inflating the residue PLAN reads |
| PM F-04 | Low | inherited | nonlocal | §6 OQ-2 | Frames the overwrite question as wholly contingent when BR-14/AC-6.3 now make the operator warning unconditionally due; correct only for the ref-naming remedy, and §2.5 points here for that half |
| PM F-05 | Low | inherited | nonlocal | §6 OQ-7 | Pin reads "REQ AC-5.1 at v1.14" for the three-carrier observation point where AC-6.2's escalation-log append entered at v1.15; substance HEAD-correct, unresolved since v1 |

**te-review (test-engineer lens)** — 3 findings: 1 High + 1 Medium delta, 1 Low inherited.

| # | Sev | Class | Locality | Site | Substance |
|---|---|---|---|---|---|
| TE F-01 | High | delta | nonlocal | §5.6 AT-06-4 row; §5.1's `advisoryWaveGate.test.js` row | Same defect as PM F-01, stated as an oracle-coverage argument: the new rendering contract has **zero** oracles, so both failure modes pass — an implementation that plumbs `snapshotRef` and never renders the sentence is green, and so is one that emits it unconditionally, including on the E-34 halt where FSPEC requires its absence. Without AT-06-4b, conjunct (3) degenerates into an always-present string. Resolution named concretely: extend AT-06-4 to all three conjuncts with a **co-location-within-one-rendered-report** oracle, and add an AT-06-4b row on the existing E-34 capture-failure fixture in `advisoryWaveGate.test.js` |
| TE F-02 | Medium | delta | nonlocal | §6 OQ-2 | OQ-2 still disposes the re-run overwrite as an accepted cost "the operator's, not the pipeline's" with a run-scoped ref discriminator as the recorded remedy, while §2.5 at v1.12 records upstream's decision that the halt report itself warns the operator. The design record presents as open an accepted-cost question BR-14 closed; one clause acknowledging the landing fixes it. Second round flagged |
| TE F-03 | Low | inherited | local | §4.5 Snapshot ref row | The row's "one ref per wave, never overwritten by a later wave" is true as written but carries no cross-reference to §2.5's correction that the *next run* overwrites the ref — which is the condition the new `snapshotRef` rendering warns about. §4.5 is where an implementer reads the field contract, and the warning's trigger is not there |

**TE Q-01, open and worth answering before the repair:** is conjunct (3)'s intended oracle a
verbatim sentence transcribed into §5.5 alongside the other halt literals, or a
presence-of-statement check? The choice determines what PLAN mints as the red test. FSPEC
deliberately declines to fix the capture's *name* but is silent on the *sentence*.

**Reviewer quality.** Both lenses re-measured every current-state claim against the shipped tree
rather than reading it, both independently discovered the eighth item was inverted by HEAD and
endorsed the absorption, and both named the same High with a concrete, implementable resolution. TE
overstated one detail — "grep for `overwrit` across §5.1–§5.6 returns nothing" is very nearly true:
there is exactly one hit, §5.2's "never overwritten by a later wave", which is the *cross-wave*
invariant and not the *cross-run* warning under discussion. The overstatement does not change the
finding.

## 4. Pattern of Disagreement

**There is no disagreement.** Not author-versus-reviewer, not reviewer-versus-reviewer. This is the
cleanest convergence of the feature: two independent lenses read the same delta, verified the same
seven items against the same tree, endorsed the same judgement call on the eighth, and then landed
the **same** High on the **same two rows** (§5.6's AT-06-4, §5.1's `advisoryWaveGate.test.js`) with
compatible remedies. PM framed it as a routed obligation half-landed and a downstream consequence
(PLAN mints from §5.6); TE framed it as a contract with zero oracles and enumerated both surviving
failure modes. They are one finding seen through two lenses, and the lenses agree on the fix.

Three structural patterns are worth naming, because none of them is about the merits.

**1. The disagreement is between two halves of one document, not between people.** §2.5 and §4.5 at
v1.12 say the halt report hands the operator the remedy. §6 OQ-2 at v1.12 still says the cost is
"the operator's, not the pipeline's" and records a future ref discriminator as the remedy. §4.5's
Snapshot-ref row promises "never overwritten by a later wave" while §2.5 explains that the *next
run* overwrites it. §1.3's residue table says one test literal is un-transcribed while its own last
row says the count that literal feeds "yields six at HEAD". Every one of the four non-High findings
is an **internal contradiction opened by an edit that moved one site and not its neighbours** —
neither statement is wrong alone; read together the document contradicts itself.

**2. The repeat sites are the ones the edit did not touch.** OQ-2 is on its second consecutive flag,
§4.5's cross-reference on its third, OQ-7's pin unresolved since v1. These are not contested; they
are simply outside whatever grep each round runs. A round that edits §2.5 and §4.5 for BR-14 and
never opens §6 will re-earn the OQ-2 finding indefinitely.

**3. The one measurement that was claimed and not made is the one whose value justified the table.**
§1.3's residue table was re-measured this round and every cell but one now reads "**none**". The
exception — "Per-seam report rows … still reads `["A1" … "A5"]` … unchanged by the v1.12
re-measurement" — is the single cell that keeps the table non-empty, and it is the one that is
false at HEAD. PM's point is precise and worth preserving: this is a finding rather than mere
staleness **because the round states it checked the cell**. A stale value that reads as stale costs
less than a stale value that reads as verified.

## 5. Best-Guess Root Cause

**Proximate cause: the erratum protocol's absorption step has a landing checklist for the
*mechanism* and none for the *proof*.** DEC-ERR-01 and DEC-ERR-03 tell an author to re-ground on
upstream first, enumerate what upstream *decided* (not only what it renamed), and absorb those
decisions rather than re-route them. The round did exactly that, and both reviewers said so. But
"absorb the decision" was executed as "state the mechanism where the prose used to route the
question" — §2.5 and §4.5 — and upstream's decision was not only a mechanism. FSPEC v1.7's
changelog names four landing sites in one sentence: BR-14, Step 10, E-34, **and AT-06-4 plus its
companion AT-06-4b**. Two of the four are acceptance tests. The absorption traversed the two design
sites and stopped.

The failure is structural, not attentional. In this TSPEC, §5.6 exists precisely to guarantee that
"every FSPEC acceptance test has a home" — it is a **completeness map against upstream's AT set**.
Any upstream round that mints a new AT therefore obligates a §5.6 row by construction, and any
upstream round that widens an existing AT's conjuncts obligates an edit to that AT's row. Nothing in
the erratum workflow derives that obligation from the changelog; it depends on the author
remembering that §5.6 is downstream of FSPEC's AT list. A cheap mechanical check exists and was not
run: diff the upstream AT ids across the re-grounding interval, and assert each one has a §5.6 row.

**Contributing cause: the round's edit unit was a section, and its correctness unit was a claim that
spans sections.** Each of the seven mechanical items is section-local — fix a path in §1.2, a call
shape in §1.1, a stray `--` in §2.5 — and the round dispatched them that way, successfully. The
eighth item was not section-local: BR-14's landing implicates §2.5 (the mechanism), §4.5 (the field
contract), §5.1 and §5.6 (the oracles), §5.5 (the halt literals) and §6 OQ-2 (the disposition that
called the question open). Applied with the same section-local reflex, it landed in the first two and
opened contradictions with the last two. TE F-02 and TE F-03 are not independent findings — they are
the **residue of the same partial traversal** that produced the High.

**Contributing cause: a re-measurement pass that re-measures the population and not the sentence.**
§1.3's residue table was refreshed from the production constants (`ADVISORY_SEAMS`,
`ENVELOPE_DEFAULTS`, `ADVISORY_DEFAULTS`) — the changelog says as much, "which moved production
surfaces only" — and that scoping was carried into the *cell text* as an assertion about a **test**
literal, which the pass by its own scope never opened. The cell was not skipped; it was
**annotated as verified while being excluded from verification**. This is the fourth appearance in
this feature of the same shape: a reconciliation clause between two counts, where re-measuring one
side and narrating both makes the stale side read as reconciled.

**Contributing cause: the lineage header is not part of any section's edit unit.** PM F-02 —
`Upstream` still pinned at FSPEC v1.6 / REQ v1.15 while the changelog cites v1.7 / v1.16 hashes —
is a one-cell fix that no section-scoped edit owns. The document's own convention (stated in v1.11's
changelog) is that the row tracks the re-grounding, so the round broke a convention it had itself
recorded, in the one place a downstream reader looks to decide whether the document is current.

**Not the cause.** The design is not in question: `snapshotRef` as a fifth halt field, non-`null`
exactly on capture success, is endorsed by both lenses as the right mechanism and no approved
decision was reopened. The absorption judgement is not in question: both lenses independently
confirmed the obligation had landed upstream and that re-routing it would have been the
anti-pattern. Reviewer strictness is not in question: the High is a real hole through which two
opposite defective implementations both pass green. And the erratum channel itself is working —
seven of eight items landed and were verified against the tree in one round.

## 6. Recommendation

## Appendix A — prior Phase D halt (review-cap, resolved)

---

**Provenance**

- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
