# Post-Mortem: Phase PR — pdlc-decision-ledger

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` (`PLAN-pdlc-decision-ledger.md` v0.8) |
| Downstream | PROPERTIES (blocked), IMPL (blocked) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{1..9}.md` |
| LEARNINGS | `docs/pdlc-decision-ledger/LEARNINGS-pdlc-decision-ledger.md` |
| Author | te-author |
| Date | 2026-08-29 |
| Edition | **2** — supersedes the edition written for the v0.4 halt of the same phase; that halt's record is retained in §Iterations |

RESOLVED: no

## Phase

**PR** — PLAN authoring and review, specifically the **erratum round** that produced `PLAN` v0.8.
PLAN v0.7 carried an approving verdict from both reviewers with residual items, so the
`DEC-ERRROUTE-01` erratum channel opened a bounded, targeted-edit round. The round was additionally
subject to `DEC-ERR-03` re-grounding, because TSPEC moved twice underneath it (v0.9 → v1.0 → v1.1)
while both reviewers wrote against v1.0.

The phase halted at the **delta confirmation** gate. The confirmers were asked whether the routed
erratum set is now reflected in the document; both answered no. Non-approving: `pm-review`,
`te-review`. Classification: **ERRATUM-PROTOCOL**.

The halt is *not* review-loop exhaustion — `MAX_REVIEW_ROUNDS` was never reached — and *not* a
substantive disagreement about the plan's design. It is again a **delivery** failure: the round
landed two of its three routed items and left the third byte-unchanged.

**This is the second occurrence of exactly this shape in this phase, on this document.** The first
(PLAN v0.4, routed item `T-00a`/`T-12a`) is recorded in edition 1 of this file. Its Recommendation 3
— an engine gate that fails closed when a routed locus is byte-unchanged in the round's diff — was
never implemented. Four rounds later, the same channel dropped the same *kind* of item for the same
reason. That fact is the single most important input to §Best-Guess Root Cause, and it changes the
recommendation's status from "candidate" to "blocking".

## Iterations

**Nine rounds.** Three full review rounds, one re-review pair, four erratum delta confirmations and
one upstream-cascade confirmation. Verdicts are as recorded in the cross-review files on the branch.

| Round | PLAN version | Kind | product-manager | test-engineer |
|---|---|---|---|---|
| 1 | v0.1 | Full review | Approved with minor changes | Needs revision |
| 2 | v0.2 | Full review | Approved with minor changes | Needs revision |
| 3 | v0.3 | Full review | Approved with minor changes | **Approved with minor changes** |
| 4 | v0.4 | Erratum delta confirmation | **Needs revision** | **Needs revision** |
| 5 | v0.5 | Erratum delta confirmation | Needs revision | Needs revision |
| 6 | v0.6 | Erratum delta confirmation | Approved with minor changes | Needs revision |
| 7 | v0.7 | Erratum delta confirmation | Approved with minor changes | **Approved with minor changes** |
| 8 | v0.7 (bytes unchanged) | Upstream-cascade confirmation (TSPEC moved, PLAN did not) | **Needs revision** | **Needs revision** |
| 9 | v0.8 | Erratum delta confirmation | **Needs revision** — the halt | **Needs revision** — the halt |

Two things in this table matter more than the verdicts.

**Round 4 is the first edition's halt.** It failed on a routed item left byte-unchanged. Rounds 5–7
recovered from it and reached a second two-reviewer approval at v0.7. Round 9 then failed the same
way. The pipeline traversed the identical failure twice, five rounds apart, with the corrective
recommendation sitting written and unimplemented in this very file between the two.

**Round 8 is not a defect of the document.** PLAN's own bytes were byte-identical to the v0.7 both
reviewers had just approved; TSPEC moved (v0.9 → v1.0) and the cascade confirmation correctly
reported the document as stale against its upstream. That is the mechanism working. It is also what
loaded round 9 with a `DEC-ERR-03` re-grounding obligation *on top of* its three raised items — and
TSPEC moved again (v1.0 → v1.1) before v0.8 was written, so the round had to re-derive against an
upstream neither reviewer had read.

**What round 9 did land.** The round was not idle. It re-pinned the header to TSPEC v1.1 and
re-measured all four upstream digests; it corrected the census constants at five sites from
"production declaration in `orchestrate-dev.js`, partition six ∪ nine = fifteen" to TSPEC §7.3's
"test-file declarations of `decisionLedgerCensus.test.js`, partition six ∪ eight = fourteen"; it
removed T-18's constant-writing instruction; it deleted the verbatim §7.3 sentence TE had objected
to; and it dropped version labels from in-body citations. Routed items 2 and 3 landed in full. Only
routed item 1 did not.

## Reviewers

Two confirmers, both non-approving, six findings between them. Recorded here as the gate captured
them, condensed for the table; the verbatim text is in
`CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v9.md`.

### product-manager (`pm-review`) — 2 findings

| # | Severity | Class | Locus | Finding |
|---|---|---|---|---|
| PM-1 | **High** | delta / **nonlocal** | T-10a conjunct 3 (`PLAN`:157), flag-off arm of the `main()`-driven wiring task | Conjunct 3 still asserts `report`'s key set set-equal to "the flag-off key set" and `notices` set-equal to "the baseline notices array". TSPEC §7.4's recording holds reviewer-prompt streams only — no `report` keys, no notices — and §7.2 expressly retires both referents, replacing them with symmetric-difference-equals-`{decisionLedger}` against the arm's own paired flag-on run, and an `NTC-DECLEDGER-*` set equal to empty. **AT-04 / REQ-DECLEDGER-02's only live flag-off proof is unimplementable as written.** |
| PM-2 | Low | delta / local | DoD census bullet (`PLAN`:494–499), revision history (`PLAN`:21), T-11 (`PLAN`:158) | Three sites each claim the six ∪ eight = fourteen arithmetic is "stated nowhere else" / "not restated elsewhere" / cited "and does not restate it" — while writing the arithmetic out in the same sentence. Counts agree everywhere, so no contract defect; the self-refuting phrasing undercuts the single-siting discipline this erratum established. |

### test-engineer (`te-review`) — 4 findings

| # | Severity | Class | Locus | Finding |
|---|---|---|---|---|
| TE-1 | **High** | delta / local | §Batches, T-10a row, conjunct 3 | Routed item 1 unlanded. Conjunct 3 still asserts `report`'s key set set-equal to the flag-off key set — **a tautology on the flag-off run, which cannot fail** — and `notices` set-equal to the baseline notices array, which T-02's recording does not contain. Both referents retired by TSPEC v0.9 and re-forbidden by v1.1 §7.3. Replace with the symmetric difference against the flag-on run's key set asserted in both directions, and the `NTC-DECLEDGER-*` notice set set-equal to empty. |
| TE-2 | **High** | **inherited** / local | §Definition of Done, flag-off report/notices bullet | The DoD checklist restates the same two retired referents ("set-equal to the flag-off key set", "set-equal to the baseline notices array"). Untouched by this edit and **not in the routed list**, but it must be corrected alongside T-10a or the document contradicts itself. |
| TE-3 | Low | delta / local | §Batches, T-11 row | T-11's closing pointer — "the flag-off arm pairs its absence with a set-equality on the report's key set" — summarises the wording F-01 corrects, and should be re-read once F-01 lands. |
| TE-4 | Low | delta / local | Header revision history | Two consecutive changelog entries both open with the literal prefix "Revision history:", so the document appears to begin its changelog twice. |

### Independently verified while writing this post-mortem

**1. The retired referents survive at two sites, not one — TE-2 is correct.**

```
$ grep -c "set-equal.*flag-off key set\|set-equal.*baseline notices" PLAN-pdlc-decision-ledger.md
2
```

One occurrence is T-10a's conjunct 3 (`PLAN`:157, the routed locus); the other is the §Definition of
Done bullet (never routed). The routed list named one of the two sites at which its own claim lives.

**2. The referents are genuinely unavailable — PM-1 and TE-1 are correct on the mechanism.**
TSPEC §7.4 (*O-4 — the byte-identity baseline and its pinning*) specifies the recording as
`REVIEW-LOOP-REVIEWER-PROMPTS`, driving the exported `reviewLoop`, and states the falsification
target as "byte-identity of the reviewer-prompt stream against the merge-base recording". `reviewLoop`
"receives only the already-built `_injectDecisionLedger` seam"; it never constructs a `report` and
never emits notices. There is no "flag-off key set" and no "baseline notices array" in the fixture
T-10a's conjunct 3 names. The instruction cannot be implemented, not merely inelegantly stated.

**3. Conjunct 3's first half cannot fail even if the referent existed — TE-1's tautology claim is
exact.** On the flag-off arm, `report`'s key set *is* the flag-off key set by definition of the arm.
The assertion is `X == X`. It was added to satisfy the "pair an absence check with a positive
conjunct" rule, and it satisfies the letter of that rule with an oracle of zero power.

**4. The header pins are correct this round.** Edition 1's Shape C (hand-transcribed anchors that do
not resolve) did **not** recur:

```
$ shasum -a 256 TSPEC-pdlc-decision-ledger.md
21c913b40f1ac27a84853e9ba3b4545d25156d141cddc2a3dfc7d92f829c8e49
```

`PLAN`:9 pins `TSPEC-pdlc-decision-ledger.md` **v1.1** `sha256:21c913b4…9c8e49`. That matches HEAD,
head and tail. The `DECISIONS` pin reads `13aba061…4fb89a`, which is the digest edition 1 recorded as
correct after the v0.4 transposition. In-body citations now read `TSPEC §7.3` without a version
label, per that edition's Recommendation 2. **The recommendations an author could act on by hand were
acted on. The one requiring an engine change is the one that recurred.**

## Pattern of Disagreement

**There is no disagreement on substance, and this time there is none on the remedy either.**

Both reviewers independently produced the same High from independent lenses — PM-1 and TE-1 are one
defect seen twice — for the third round running on this document. Neither contested the plan's
design, batching, decomposition or oracle strategy; rounds 1–7 settled all of that, and round 9's
census corrections were accepted without comment. What remains is one unlanded instruction and its
bookkeeping tail.

The contrast with edition 1's halt is the important finding. That halt had a **latent ownership
disagreement underneath it**: four candidate homes for the terminal `102` assertion, no decision, and
a downstream artifact that had already guessed. The erratum channel could not land the item because
nobody had decided what the item should say. **This halt has no such gap.** Both confirmers specify
the same replacement, in the same terms:

| | pm-review (PM-1) | te-review (TE-1) |
|---|---|---|
| Report-key oracle | symmetric-difference-equals-`{decisionLedger}` against the arm's own paired flag-on run | symmetric difference against the flag-on run's key set, **asserted in both directions** |
| Notices oracle | an `NTC-DECLEDGER-*` set equal to empty | the `NTC-DECLEDGER-*` notice set set-equal to empty |
| Authority | TSPEC §7.2 / §7.4 | TSPEC v0.9, re-forbidden by v1.1 §7.3 |

The remedy is fully specified by the confirmers, drawn from the same upstream, and needs no
adjudication. Nothing blocks landing it except landing it.

Three shapes generalise out of the six findings.

**Shape A — the routed item that was never applied (PM-1, TE-1). Recurrence of edition 1's Shape A.**
The round produced a v0.8, landed routed items 2 and 3 across five sites, re-grounded to a
twice-moved upstream, and did not touch the one row routed item 1 named. The author emitted
`REVISION-COMPLETE` regardless, because nothing between the round's dispatch and its confirmation
compares the routed loci against the round's diff. A round that lands two of three routed items is,
at dispatch time, indistinguishable from one that lands three.

**Shape B — the inherited twin (TE-2). New, and it defeats the obvious fix.** The routed list named
T-10a. The claim it asked to retire lives at *two* sites: T-10a and the §Definition of Done bullet.
The erratum channel routes **loci**, not **claims** — so a claim that is sited twice gets routed once,
and even a perfect routed-locus diff gate would have passed a round that fixed T-10a and left the DoD
bullet asserting the retired referents. TE-2's class label `inherited` is the channel admitting it has
no vocabulary for this: the finding is real, correct, and formally out of scope for the round that
caused it to matter.

**Shape C — the discipline that does not apply to itself (PM-2, TE-4).** Round 9's entire purpose was
single-siting: state the arithmetic once, in TSPEC §7.3, and cite it everywhere else. Three PLAN sites
now declare that they do not restate the arithmetic *in the same sentence in which they restate it*,
and the header opens its changelog twice with the literal prefix "Revision history:". No contract
defect — every count agrees — but a round about stating things once produced four new redundant
statements. The discipline was applied to the payload and not to the prose asserting the payload.

**The through-line.** Edition 1 concluded that this feature's document set had outgrown reliable hand
maintenance of cross-references, and cited PLAN at 67 KB, TSPEC at 129 KB, PROPERTIES at 96 KB. Those
are now **83 KB, 150 KB and 110 KB** — every one larger, none smaller. Shapes A, B and C are all
consequences of the same underlying fact: at this size, a human-or-agent pass over a document reliably
does *most* of what it was asked, and which part it drops is not random — it is whichever part needs
the most thought.

## Best-Guess Root Cause

**Primary: the corrective control identified after the first occurrence was written down instead of
built.**

Edition 1's Recommendation 3 reads: "Before delta confirmation is dispatched, the engine should
compare each routed item's named locus against the round's diff and fail closed if any routed locus
is byte-unchanged." It was recorded in this file, and again in the project memory note
`erratum-routed-item-unlanded-halt` as "the standing pipeline-improvement candidate". Five rounds
later the identical failure recurred and cost two more confirmer dispatches. **A learning stored as
prose is not a control.** The pipeline has a document oracle harness, a wave gate and a fail-closed
finding-grammar check; the one recurring erratum-protocol defect it has observed twice has no gate at
all. That is the root cause, and everything below is contributory.

**Contributing 1: the channel routes loci, but the defect lives in claims.** TE-2 is the proof. The
routed list named `T-10a`; the retired referents occur at two sites. Locus-shaped routing cannot
express "this claim must not survive anywhere in the document", so it under-scopes systematically
whenever a document states something twice — which is exactly what a large document does, and exactly
what Shape C shows this document doing more of, not less.

**Contributing 2: the item that survives an erratum round is the one whose fix is a substitution; the
item that dies is the one whose fix is a re-derivation.** Round 9's landed work was mechanical:
fifteen → fourteen, nine → eight, production → test-file, at five known sites, each a value swap
against an upstream sentence that stated the target verbatim. Routed item 1 required *designing a new
oracle* — deciding that the flag-off arm must be paired with its own flag-on run, that the comparison
is a symmetric difference, that it must be asserted in both directions, and that the notices conjunct
becomes an emptiness assertion over a named prefix. Different cognitive mode, no verbatim target to
copy, and last in the list. Under a per-section pacing contract and a byte ceiling, the item needing
invention is the one deferred to a write that never comes. Edition 1 named this as
"`nonlocal` items are the wrong cargo for a channel shaped for local text fixes" and PM-1 again
classes the survivor `nonlocal`. **Two for two.** The class label is predictive and nothing consumes
it.

**Contributing 3: `DEC-ERR-03` re-grounding competed with the raised items for the same budget.**
Round 9 opened against reviews written for TSPEC v1.0 while HEAD was v1.1, so before touching any
raised item the author had to diff two upstream versions, establish that v1.1 single-sites rather than
reverses v1.0, re-measure four digests, and rewrite the header. That work is correct and load-bearing
— and it is unbudgeted work performed first, in a round whose remaining capacity then had to cover
three items, one of which needed invention. Re-grounding is doing its job; it is also crowding the
round it precedes.

**Contributing 4 (testing lens): the defective conjunct was produced *by* a falsifiability rule,
applied to the letter.** This repo's oracle checklist says to pair an absence-shaped assertion with a
positive conjunct. Conjunct 3 pairs `"decisionLedger" not in report` with `report`'s key set
`set-equal to the flag-off key set` — on the flag-off run, `X == X`. The rule was obeyed and the
purpose was missed, because **the checklist does not require the added positive conjunct to be
falsifiable on the arm it runs on**. That gap is generic: any "add a positive conjunct" rule invites a
tautological one. It belongs in the checklist, not just in this document.

**Not causes.** Reviewer strictness — every one of the six findings is correct, and I verified three
mechanically. Budget exhaustion or `MAX_REVIEW_ROUNDS` — never reached. Model quality — rounds 1–7
converged twice. Hand-transcribed pins and citations — edition 1's Shape C was fixed by hand and did
not recur; the pins verify clean at HEAD.

## Recommendation

Ordered by leverage. Items 1–3 unblock this feature and are all that stand between v0.8 and a passing
delta confirmation; items 4–6 are pipeline changes that prevent the class.

**1. Land routed item 1 exactly as both confirmers specify — no adjudication, no redesign.**
Replace T-10a conjunct 3 (`PLAN`:157) with the two oracles the confirmers agree on:

- The flag-off arm runs a **paired flag-on run** with the same fixture and seams, and asserts the
  **symmetric difference** of the two `report` key sets equals `{decisionLedger}` — **asserted in both
  directions**, so a spuriously-added key on either arm reddens.
- The arm's **`NTC-DECLEDGER-*` notice set is set-equal to empty** — not "contains no
  `NTC-DECLEDGER-*`", which §Definition of Done already flags as the weaker form.

Delete both retired referents: "the flag-off key set" and "the baseline notices array". Neither
exists in T-02's recording, which per TSPEC §7.4 holds reviewer-prompt streams only. Keep the
byte-identity conjunct against T-02's committed recording, which is untouched by this finding.

**2. Land TE-2's inherited twin in the same edit.** Correct the §Definition of Done flag-off
report/notices bullet (`PLAN`:494–499 region) to the same two oracles, phrased identically. Then
verify mechanically, and treat a non-zero result as unlanded:

```
$ grep -n "flag-off key set\|baseline notices array" PLAN-pdlc-decision-ledger.md   # expect: no matches
```

**3. Land the three Lows in the same pass.** Re-read T-11's closing pointer (`PLAN`:158) once F-01
lands and restate it in the new terms (TE-3). Delete the duplicated `Revision history:` prefix from
the second consecutive changelog entry (TE-4). Repair the three self-refuting single-siting sentences
(PM-2) — a citing site should say "per TSPEC §7.3" and stop, not narrate that it is not restating the
arithmetic while restating it. Then bump to v0.9 with a changelog entry naming what addressed each of
the six findings, flip this file to `RESOLVED: yes` in the same commit, and re-run `pdlc dev`.

**4. Build the routed-locus diff gate. It is no longer a candidate — it is the fix for a reproduced
defect.** Before delta confirmation is dispatched, the engine compares each routed item's named locus
against the round's diff and fails closed if any routed locus is byte-unchanged, naming the locus. The
routed list already carries loci, so the input exists. This would have halted round 9 locally, before
a single confirmer token was spent, and it would have halted round 4 the same way. **Two observed
occurrences, five rounds apart, in one feature.** Escalate it out of the "standing candidate" state
recorded in the `erratum-routed-item-unlanded-halt` memory note and into the engine.

**5. Route by claim, not only by locus.** Item 4 alone would not have caught TE-2, because the DoD
twin was never routed. Give each routed item an optional **retired-text** field carrying a verbatim
quote of the clause being removed; after the round, the gate greps the whole document for that text
and fails closed if it survives *anywhere*. This is the same fail-closed, positive-oracle shape the
finding-grammar hook already uses, and it converts "the author must remember every site" into a
mechanical check. It is the cheapest available answer to Shape B.

**6. Close the checklist gap that produced the defective conjunct (testing lens).** Add to the oracle
falsifiability checklist, in `pdlc/OPERATIONS.md` and the reviewing SKILLs:

> A positive conjunct added to defeat an absence-shaped oracle must itself be falsifiable **on the arm
> it runs on**. Asserting that a value equals its own definition on that arm (`report`'s key set
> set-equal to "the flag-off key set", on the flag-off run) satisfies the pairing rule with an oracle
> of zero power. The distinguishing conjunct must be **cross-arm** — a comparison against the paired
> opposite run — or it is not a distinguishing conjunct.

Ship T-10a conjunct 3 as the worked example. This is a generic hazard of every "add a positive
conjunct" rule, not a quirk of this feature.

**Gap named for the record.** Edition 1 closed by observing that the erratum channel's delta
confirmation is an absence-shaped oracle — reviewers assert "nothing routed remains unreflected" —
and that its missing positive conjunct is trivially available: *each routed locus changed bytes.*
That observation was correct, was written down, and was not built. The recurrence documented here is
what an unbuilt positive conjunct costs: two confirmer dispatches, one halt, and a document that
still contradicts itself at two sites. Recommendation 4 is that conjunct; recommendation 5 is the
cross-arm strengthening of it; recommendation 6 is the same lesson applied one layer down, to the
oracles this PLAN is specifying. The pipeline is currently asking its documents to meet a
falsifiability bar it does not meet itself.

**Provenance**
- Engine version: 0.2.4
- Plugin version: 0.23.4
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows

**Provenance**
- Engine version: 0.2.4
- Plugin version: 0.23.4
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
