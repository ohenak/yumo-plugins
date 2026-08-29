# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v0.9)
**Date:** 2026-08-29
**Iteration:** 10 (delta confirmation — round 9's findings, frozen round)
**Upstream at dispatch:** REQ v1.9 `sha256:ce6b133f…3c7b7c`, FSPEC v1.3 `sha256:2bd5c3ef…5aed39`

## Scope

I approved this TSPEC at v0.7 and again, with two minor citation findings, at v0.8. This round is a
**delta confirmation** against a frozen decision set: I read my own v9 findings, ran
`git diff cc2c09e53..HEAD` over the TSPEC, and re-measured the upstream the changed sections lean on.

Upstream is byte-unmoved at exactly the pins v0.9's changelog re-states: `REQ-pdlc-decision-ledger.md`
hashes `sha256:ce6b133f0c1d…0d3c7b7c` and `FSPEC-pdlc-decision-ledger.md` hashes
`sha256:2bd5c3ef055f…735aed39`, both matching the document's recital digit-for-digit, and neither has
been touched since the commits that produced those versions. So the changelog's "nothing is absorbed
and no pin advances" is true as measured, not merely asserted.

The diff is 95 insertions / 14 deletions confined to the changelog, §5.4, §7, §7.2 and §7.3 — exactly
the section list the changelog declares. The four corpus literals (6,305 / 10,859 / 12,059 / 441) are
untouched, §7.6's AT rows are untouched, and no approved product decision is re-opened. My check
therefore reduces to: did my two findings land, did TE's three High/Medium items land without
breaking anything I approved, and is every new factual claim true at HEAD?

Answer: both my findings landed, and landed on the right referent rather than by deleting the
sentence. Every new repository-grounded claim I checked is true at HEAD except one precedent
citation, which under-describes the extension the cited helper needs — Medium, non-gating.

## Design

**My F-01 (Medium) landed, and landed as a strengthening rather than a retraction.** v0.8's §7.2
conjunct 3 asserted the flag-off `report` key set was "set-equal to §7.4's committed recording" — a
referent that holds no `report` keys at all. v0.9 replaces it with the arm's **own paired runs**: the
`report` object *the flag-off `main()` run itself returns* must have a key set whose symmetric
difference from the flag-on run's key set is exactly `{decisionLedger}`, "asserted as a set equality
in both directions so a spuriously added or dropped key on **either** arm fails".

Two things make this better than what I asked for. First, it is a two-sided oracle: v0.8's form could
only catch a missing key on one arm, whereas a symmetric difference reddens on a stray key added to
the flag-off arm as well — that is the completeness-by-set-equality shape rather than containment.
Second, it is not an absence-only oracle: `"decisionLedger" not in report` is now paired with a
positive statement of what the flag-off run *does* return. REQ C-2's disabled-path byte-identity is
the requirement this serves, and it is now provable by a test that fails for the right reason.

The document also does the thing I value most in a correction: it states the trap rather than merely
avoiding it. §7.2 now carries an explicit "note the referent split, because it is easy to get wrong"
paragraph explaining that §7.4 is cited for the **prompt** conjunct only. I verified that
justification against §7.4 itself at HEAD, which says in its own words that "a whole-`main()`
recording would red on this feature's own intended additions (the new notices, the new report field)".
The two sections now agree, and the reason they must differ is written down where a future editor
will hit it.

**My F-02 (Low) landed, and with it Q-01.** §7.3's claim that "§7.6's AT rows assert its presence and
shape on the flag-on path" is gone, replaced by "§7.6's AT rows are **not** a home for it: no AT row's
Notes column mentions `report.decisionLedger`". I re-checked §7.6: still true, no AT row names the
field. §7.2's arm is now named as the sole home in both directions, and — this is Q-01, which I raised
as explicitly non-gating — §5.4 now carries the forward pointer: "Deleting that arm deletes the
field's only evidence." That closes the failure mode I was worried about, where a future editor
deletes the live arm as redundant without seeing what it discharges.

**TE's two High items landed, and the repair is general rather than another exception.** This is the
part I checked hardest, because a member-by-member patch to an unsatisfiable census is how these
defects recur. v0.9 subtracts the body of **every** declaration the feature introduces, held in a
frozen `DECISION_LEDGER_OWNED_DECLS`, and states the satisfiability predicate itself — *a token is
unsatisfiable exactly when a conforming implementation mentions it in the scanned remainder* — as a
test to apply to any future member **before** it is added. Writing down the predicate, not just the
repaired list, is what stops round 12 from re-raising round 9's finding on a new token.

I checked the partition arithmetic, since "exact partition" is a claim that either holds or does not.
`DECISION_LEDGER_OWNED_DECLS` as §7.3 enumerates it is fifteen members: §4.1/§4.2/§4.4's six functions
plus nine top-level constants (`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`,
`DECISION_LEDGER_DEFAULTS`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, §5.2's three
catalogues, and `DECISION_LEDGER_CENSUS_TOKENS` itself). `DECISION_LEDGER_CENSUS_TOKENS` holds six;
`DECISION_LEDGER_CENSUS_EXEMPT` as enumerated holds nine. 6 + 9 = 15, with no member in both — the
partition is exact and disjoint as stated, and §5.2's third catalogue (`DECISION_LEDGER_NOTICES`)
correctly sits on the exempt side with a stated reason while the two data-carrying catalogues sit in
the token set. It closes, and it closes with a reason per exempt member rather than a bare list.

I also verified the justification for freezing the owned list rather than deriving it by name pattern.
§7.3 claims a `/Decision/i` rule would wrongly exclude shipped code, naming five declarations; all
five exist in `pdlc/workflows/orchestrate-dev.js` at HEAD — `MERGE_MAX_DECISION_STEPS` (:88),
`renderDecisionEntry` (:4640), `escalationDecision` (:4738), `erratumGateDecision` (:6914),
`parseDecisionsWarranted` (:7044). The claim is measured, not remembered, and it is the right reason:
a name-derived list would blind the census against unrelated shipped code, which is precisely the
failure the census exists to prevent.
