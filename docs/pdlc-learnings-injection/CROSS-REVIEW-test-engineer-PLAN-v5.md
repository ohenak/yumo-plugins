# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (bytes unchanged since v4 approval)
**Upstream that moved:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.10 → v0.12)
**Date:** 2026-08-20
**Iteration:** 5 (upstream-cascade confirmation)

## Overview

**Question answered.** PLAN's own bytes have not moved since the v4 approval anchor (`a7aa181e`).
FSPEC moved twice under it — the v0.11 and v0.12 erratum rounds, ten commits, +54/−26 lines. I read my
v4 cross-review, diffed FSPEC across `a7aa181e..HEAD`, and measured only the PLAN material that leans on
the changed FSPEC text. I did not re-open the batch DAG, the file-ownership manifest, the expected-red
ledger, or the three Medium/Low findings v4 left open — none of them touches FSPEC's changed sections.

**What FSPEC now says that it did not say at approval time.**

| FSPEC section | Before (v0.10) | After (v0.12) |
|---|---|---|
| BR-1 | "consumes the pipeline's classification, it does not restate the membership" — one conjunct | Two conjuncts: authoring-classified **and** target document among REQ C-1's six types |
| D-2 | "Is this an authoring dispatch? yes / no" | Three branches, the third being authoring-classified with a non-C-1 target |
| AT-02 | universe fixtures: no-DECISIONS run, creatorless Phase R, five optimizer rounds | plus a run carrying an authoring-classified dispatch with **no C-1 target**; reverting BR-1's second conjunct must red |
| AT-03 / AT-29 | "every **non-authoring** dispatch prompt is byte-identical to baseline" | "every dispatch **outside BR-1's rule**" — strictly wider |
| BR-15 | expected read set = corpus-root enumeration **plus** per-document open attempts | enumeration and candidate paths **contribute no member**; expected set is exactly the per-document attempts |

**Direction of travel is toward PLAN, not away from it.** Both v0.11/v0.12 corrections land the two
defects PLAN itself routed as unresolved errata (§Errata rows). LI-11's AT-02 and AT-33 rows were written
to TSPEC's reading; FSPEC now agrees with TSPEC on both. So no task row's oracle changes, no fixture is
invalidated, no batch moves. What does not survive the edit is PLAN's **description of upstream**: two
errata rows assert a defect "still lives at HEAD" that no longer does, and one DoD clause compresses the
old, narrower byte-identity promise. Three Mediums, no High. PLAN still holds as approved.

## Batches

**Three task rows lean on the changed FSPEC text. I measured each against FSPEC at HEAD.**

| Row | What it owes the changed upstream | Result |
|---|---|---|
| LI-02 (fixture helper, batch 2) | AT-02's new fourth universe member — a run containing an authoring-classified dispatch whose target is none of the six C-1 types | ✅ available without a new fixture. The named case is Phase CR's optimizer round, which reaches the composition site with `docType: null`; LI-11's composition-site probe already declares that value in its expected set (`LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}`), so the dispatch exists in the universe LI-11 runs. No new corpus, no new helper spec, no new row |
| LI-11 (RED dispatch-universe suite, batch 5) | `LI-AT-02`, `LI-AT-03`, `LI-AT-29`, `LI-AT-33` — all four AT ids whose FSPEC text changed | ✅ still owned, and owned **by id**, not by transcribed AT prose. The suite is authored from FSPEC at batch 5, so it picks up the widened AT-03/AT-29 wording and AT-02's fourth fixture without a PLAN edit. AT-33's row already reads "hand-transcribed from the fixture's scripted `ls-files` stdout minus the self paths — never derived from `gatherLearningsCorpus`", which is now exactly what BR-15 says |
| LI-20 (GREEN attachment, batch 12) | BR-1's second conjunct as production behavior | ✅ already the two-conjunct form: `injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)`. PLAN was ahead of FSPEC here; FSPEC has caught up. The `_recordDocType(docType)` call on **both** arms is what makes AT-02's new "reverting the second conjunct reds the test" mutation check falsifiable — the probe sees the rejected `null` dispatch, so deleting the conjunct moves a member from the rejected set into the accepted set and the equality reds |

**AT-02's new mutation clause has a live killer under PLAN's construction.** FSPEC now requires that
reverting BR-1's second conjunct red the test. That is not automatic from a block-presence assertion —
if the fixture universe carried no non-C-1 authoring dispatch, both implementations would agree. It works
here because LI-11 asserts the accepted set **equal** to `LEARNINGS_TARGET_DOCTYPES`, never containment,
over a universe that includes the `null`-target round. Relaxing that equality is already named as the one
forbidden repair (§Halt conditions H-5). Nothing in this edit weakens that.

**No row acquires or loses a test, a file, or a `[Fake first]` obligation.** TDD order, the same-batch
same-new-file guard, and the red-before-green pairing are untouched: this edit added no task and moved no
symbol. The three rows above absorb the change inside prose they already carry.

## Dependencies

**The batch column cannot have moved, and I confirmed rather than assumed it.** An upstream FSPEC edit
changes no `Deps` cell by itself; it can only move a batch if it forces a new task, a new file, or a new
symbol. It forced none of the three:

- **AT-02's fourth fixture is not a new fixture.** It is the `docType: null` optimizer-round dispatch
  already present in LI-11's universe and already named in LI-20's plumbing row ("Phase CR's `null`
  reaches the composition site through this path **and no other**"). No `LI-02` spec addition, so no
  `LI-11 → LI-02` edge changes weight and no batch-2 authoring collision is created.
- **The widened AT-03/AT-29 byte-identity claim reuses one instrument.** It is the same committed
  pre-feature baseline LI-06 captures at batch 4 and guards there; widening *which dispatches* are
  compared against it adds no capture, no manifest entry, and no new `{caseId}` — the baseline is
  captured per dispatch index over whole runs, not per classification.
- **BR-15's narrowed expected set removes a member, never adds one.** AT-33's oracle gets strictly
  smaller (enumeration excluded), which cannot introduce a dependency; and PLAN already excluded it.

**My v2/v3/v4 re-derivation therefore still stands unamended**: 23 unique ids, every dependency resolving
to a declared row, the graph acyclic, and `batch == max(dep batch) + 1` for every row. I re-checked the
three rows this confirmation touches (LI-02 batch 2 deps LI-01; LI-11 batch 5 deps LI-02, LI-06; LI-20
batch 12 deps LI-19, LI-11) and each still satisfies the column arithmetic.

**Downstream gates are undisturbed.** LI-14's batch-6 green-terminal suite-map closure keys on registered
`LI-AT-` test titles, not on AT prose, so a reworded AT-02/AT-03/AT-29 leaves its 35-member partition
literal exactly as transcribed. The expected-red ledger's batch-11/12 rows name `LI-AT-22`'s run-level
half only; none of the four re-worded ATs is a ledger entry, so the ledger's arithmetic is unchanged.

## Verification

**Where PLAN still describes the old upstream. This is the whole of what the cascade broke.**

**1. §Errata — the BR-1 row is discharged and PLAN says it is live (F-01).** The row reads "**FSPEC
BR-1** still states the rule 'consumes the classification, it does not restate the membership', while
TSPEC §A.2 adds the load-bearing `docType ∈ LEARNINGS_TARGET_DOCTYPES` conjunct", under a heading that
says "Two defects in FSPEC v0.10 still live at HEAD". At HEAD, FSPEC BR-1 reads "**both** hold: the
pipeline classifies the dispatch as authoring, **and** the target document is one of REQ, FSPEC, TSPEC,
PLAN, DECISIONS or PROPERTIES (REQ C-1)". The conflict PLAN routes no longer exists, and the stated
consequence — "LI-11's AT-02 has two contradictory expected sets… a reviewer scoring it against BR-1
would reject a correct test" — is now false in both halves. The task row's chosen reading is the one that
won, so no test changes; the routing table is what is stale. Left standing it re-raises a settled contract
into the next erratum round.

**2. §Errata — the BR-15 row is likewise discharged (F-02).** PLAN says BR-15's expected set "includes
'the corpus-root enumeration'… but the enumeration is a `git ls-files` call and contributes no member",
concluding "LI-11's AT-33 set equality cannot hold as FSPEC states it". FSPEC at HEAD states the expected
set as "exactly one attempt per report-named document except the `RSN-SELF` ones, the enumeration and
candidate paths contributing no member" — verbatim PLAN's own objection, adopted. AT-33's hand-transcribed
oracle is unaffected; the row's claim about upstream is not.

**3. DoD 4 compresses the pre-erratum byte-identity promise (F-03).** DoD 4 closes "every **non-authoring**
dispatch likewise (AC-4.3)". FSPEC AT-03 and AT-29 now both say "outside BR-1's rule" — explicitly
"including an authoring-classified dispatch with no C-1 target". Those are different sets: an
authoring-classified optimizer round with `docType: null` is *inside* PLAN's DoD clause's exemption and
*outside* FSPEC's byte-identity promise. This is the one place the narrowing has a verification
consequence rather than a documentation one — DoD is the gate a verifier reads, and under PLAN's wording
an implementation that injected into the `null`-target round would satisfy DoD 4 while failing AT-03.
The suite itself is safe (LI-11 authors AT-03/AT-29 from FSPEC at batch 5, and LI-20's `injectHere`
already carries the conjunct), which is why this is Medium and not High: the oracle exists, the gate's
restatement of it is narrower than the oracle.

**What I checked and found still faithful.** BR-11's complement wording (v0.12) — PLAN cites no BR-11
clause. D-2's three-branch split — PLAN carries no decision-table transcription. A-2's rewrite — PLAN
cites no A-numbered assumption. REQ, TSPEC and DECISIONS are byte-identical to the versions v4 approved
against (only FSPEC and cross-review files moved in `a7aa181e..HEAD`), so no second cascade is in play.
The mutation-proof obligations PLAN owns (LI-06's three-step baseline proof, LI-01's premise set equality,
H-5's forbidden containment relaxation) are untouched by this edit and remain as approved.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §Errata's BR-1 row asserts a defect that FSPEC v0.11/v0.12 discharged | §Errata raised from this document's authoring |
| F-02 | Medium | delta | local | §Errata's BR-15 row asserts a defect that FSPEC v0.11 discharged | §Errata raised from this document's authoring |
| F-03 | Medium | delta | nonlocal | DoD 4 restates byte-identity as "non-authoring", narrower than AT-03/AT-29's "outside BR-1's rule" | §Definition of Done, clause 4 |

FINDING: Medium | delta | local | §Errata raised from this document's authoring (BR-1 row) | PLAN routes as live an FSPEC defect that HEAD has fixed: the row says BR-1 "still states … consumes the classification, it does not restate the membership" and that LI-11's AT-02 therefore "has two contradictory expected sets", but FSPEC v0.12's BR-1 now carries both conjuncts (authoring-classified AND target among REQ C-1's six types), which is exactly the TSPEC §A.2 reading the task row was written to. Update the row to record the erratum as discharged against FSPEC v0.12 (and drop the "a reviewer scoring it against BR-1 would reject a correct test" consequence) so the next erratum round does not re-raise a settled contract.

FINDING: Medium | delta | local | §Errata raised from this document's authoring (BR-15 row) | PLAN says BR-15's expected read set "includes the corpus-root enumeration … but the enumeration is a git ls-files call and contributes no member" and concludes "LI-11's AT-33 set equality cannot hold as FSPEC states it". FSPEC v0.11 adopted that objection verbatim — the expected set is now "exactly one attempt per report-named document except the RSN-SELF ones, the enumeration and candidate paths contributing no member". Mark the item discharged; AT-33's hand-transcribed oracle needs no change, only the claim about upstream does.

FINDING: Medium | delta | nonlocal | §Definition of Done, clause 4 | DoD 4 promises baseline byte-identity for "every non-authoring dispatch (AC-4.3)", which was faithful to FSPEC v0.10's AT-03/AT-29 but is narrower than HEAD's, where both ATs say "every dispatch outside BR-1's rule — including an authoring-classified dispatch with no C-1 target". An authoring-classified optimizer round with docType null sits inside DoD 4's exemption and outside FSPEC's promise, so an implementation that injected into that round would pass the DoD gate while failing AT-03. Restate DoD 4's final clause as "every dispatch outside BR-1's two-conjunct rule" to match the oracle LI-11 will author.

## Recommendation

**Approved with minor changes.**

PLAN still holds as approved against FSPEC v0.12. Every oracle, fixture, task row, dependency edge and
batch number survives the upstream erratum intact — FSPEC moved *toward* PLAN, adopting on both counts
the readings PLAN had already routed as errata and written its task rows to. No High finding, nothing
gating, and no reason to reopen the document's revision loop.

Three Mediums, all of the same kind: PLAN now describes an upstream that no longer exists. Two are
discharged-erratum rows that should be marked resolved (F-01, F-02); one is a DoD clause whose
restatement of byte-identity is narrower than the AT it gates (F-03) — the oracle is right, the gate's
paraphrase of it is stale. All three are one-line edits to prose, none blocks implementation, and none
needs a new round: fold them into the next touch of this document.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 0}

APPROVAL-HASH: sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508
APPROVAL-HASH-NORMALIZED: sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508
REVIEWED-COMMIT: 1f8a90be5ea972e76a35279eec8eb8da877d20c2
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:fb18dbda1cef8497143e931894d09b83871657b9c8108305948cc03566b0727c
UPSTREAM-STATE: TSPEC sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3
UPSTREAM-STATE: DECISIONS sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6
