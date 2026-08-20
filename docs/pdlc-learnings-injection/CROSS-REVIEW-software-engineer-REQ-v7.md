# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 7 (delta over `5707ba7d`, erratum commits `c1180acb`, `91420bbf`)

## Scope of this round

Delta confirmation only. The erratum revision is 24 insertions / 16 deletions across the §1
changelog row, AC-3.1's closure sentence, AC-3.3 (reproduction locus), AC-5.1a (`false` vs absent
section) and AC-5.1b (misspelt section name). I re-read the routed items, diffed each changed
sentence against HEAD sources and against TSPEC §A.5 / ERR-6, and re-checked my own v6 finding.
Unchanged sections already approved are not re-litigated, except where this round's edits changed
what they mean.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | AC-3.2 still records the corpus-level outcomes (`RSN-UNLISTABLE`, `RSN-EMPTY`) **once per run**, which AC-3.3 (as rewritten this round) now says cannot describe a divergent run. Half the routed locus question is answered (`orderKeys` moved per-dispatch), half is left at the run level | AC-3.2 (REQ:319-322) vs AC-3.3 (REQ:326-335) |
| F-02 | Medium | Local | AC-3.2's per-document not-selected rows carry no stated locus at all. Under the mid-run corpus movement AC-3.3 now admits, a document that only appears after dispatch 2 has no well-defined row in a run-level not-selected list, and AC-3.3's "every input the rule used is in the report" is not satisfiable for the earlier dispatch | AC-3.2 (REQ:314-325) |
| F-03 | Medium | Local | AC-5.1b cites the sibling config readers as precedent but prescribes a **different outcome** than the shipped one: `parseAdvisoryConfig` answers a present-but-not-object section with `degraded(true)` — *defaults plus a malformed flag* (`pdlc/workflows/orchestrate-dev.js:1982-1983`), not inertness. The precedent looks like inertness only because `ADVISORY_DEFAULTS.enabled` is `false` (`:1944-1949`). With this round's edits, malformed-section is now the sole config mistake that silently disables the feature | AC-5.1b (REQ:375-380) |
| F-04 | Low | Local | v6 F-01 unfixed: §1.2 claim 2's "reaching one directory level under `docs/`" is exact for `docs/*/LEARNINGS-*.md` but off by one for `docs/completed/*/LEARNINGS-*.md` | §1.2 claim 2 (REQ:70-71) |

### F-01 (High) — the routed locus question is answered for one input, not for the other

AC-3.3 now states the reason the run-level record cannot be the locus: "the corpus may move
mid-run … two authoring dispatches in one run may legitimately observe different corpora, and one
run-level record could not describe both" (REQ:329-332). That reasoning is correct and it applies
verbatim to AC-3.2's corpus-level outcomes, which are the *same observation* — what the enumeration
returned at that dispatch. AC-3.2 still says they are "**corpus-level outcomes**, recorded once per
run" (REQ:320-321).

The concrete failure: enumeration succeeds at dispatch 1 over an empty corpus and returns one
document at dispatch 3 (or fails at dispatch 5, TSPEC's `DIVERGENT-CORPUS` fixture exactly). The
run is not empty, so the once-per-run `RSN-EMPTY` cannot be recorded; dispatch 1's AC-3.1 rows are
empty (AC-3.1 mandates "an empty set of rows, not a missing field"), and the operator cannot
distinguish "corpus was empty here" from "documents existed and all were rejected". AC-3.3's
promise — "every input the rule used is in the report and the reproduction matches" — then fails
for dispatch 1, which is precisely the defect this erratum was raised to close.

TSPEC has already built the other half: `dispatches[i].corpusOutcome` is per-dispatch and "always
recorded", with the run-level scalar a last-write-wins mirror (TSPEC:266-270). ERR-6 asked REQ to
settle "which rows its completeness test asserts set equality over" (TSPEC:1144-1154). The edit
settles that for `orderKeys` and thresholds and leaves `corpusOutcome` contradicting both AC-3.3's
own premise and TSPEC §A.5.

**What resolves it:** state in AC-3.2 that the corpus-level outcome is recorded per authoring
dispatch (a run-level mirror, if wanted, is additive and TSPEC already defines it as
last-write-wins), and say which locus the corpus-outcome catalogue's set-equality test asserts
over — matching AC-3.3's "two completeness tests, one per locus" construction.

### F-02 (Medium) — the not-selected rows have no locus

AC-3.1's rows are explicitly "per authoring dispatch"; AC-3.3's inputs now divide by named locus.
AC-3.2's per-document not-selected rows sit between them with no locus stated — the sentence only
says "the same report". On a stable corpus the omission is harmless; on the divergent run AC-3.3
now contemplates, it is the same gap as F-01 one level down: the candidate set differs by dispatch,
so a single not-selected list cannot carry a per-document reason that is true for every dispatch
(`RSN-COUNT` at dispatch 1 and selected at dispatch 3, for the same document). Naming the locus in
the same sentence that F-01 fixes closes both.

### F-03 (Medium) — the sibling-reader citation and the prescribed outcome diverge

AC-5.1b's parenthetical "malformed as the repository's sibling config readers already read it" is
accurate about *detection*: `parseAdvisoryConfig` treats a present-but-not-plain-object section as
malformed (`pdlc/workflows/orchestrate-dev.js:1981-1983`), matching AC-5.1b's *Given* exactly. It
is not accurate about *response*. The shipped reader returns `{config: ADVISORY_DEFAULTS,
sectionMalformed: true}` — it keeps running on declared defaults and reports. It reads as
"inertness" only because `ADVISORY_DEFAULTS.enabled` is `false` (`:1944-1949`), so defaults and
inertness coincide for advisory. For this feature they do not: §4.1 declares `enabled` default
`true`.

This round sharpened the asymmetry rather than creating it. After the edit: absent section →
enabled (AC-5.1a), misspelt section name → enabled (AC-5.1b), wrong-typed declared key → enabled
with a notice (AC-5.1c), section present but not an object → **feature off for the whole run**.
Three non-deliberate config mistakes fail open under G-4/C-7's spirit and G-1's "no configuration
change is required"; the fourth fails closed. It is a legitimate product choice — a malformed
section is arguably an operator statement of intent, and AC-6.2 pins both the inertness and the
notice — but it is currently justified by a precedent that does the opposite, and a downstream
implementer reusing `parseAdvisoryConfig`'s shape will get the sibling behaviour, not AC-5.1b's.

**What resolves it:** either align AC-5.1b with the precedent (defaults + notice, i.e. enabled),
or keep inertness and replace the precedent citation with the reason it is treated differently
from AC-5.1c's wrong-typed key. Either way the divergence from the shipped reader should be stated
where the implementer will read it.

## Verification of the routed items and of the claims they lean on

| Item / claim | Checked against | Result |
|---|---|---|
| Shipping default, G-1 vs AC-1.1 vs AC-5.1a | §4.1 (`enabled`, default `true`, consumer config), G-1 (REQ:103-107), AC-1.1 (REQ:247-252) | **Resolved.** AC-1.1's *Given* now reads "with `learningsInjection.enabled` at its default"; AC-5.1a scopes inertness to explicit `false` and states there is no second gate. The three now agree on one shipping default |
| "No consumer repository carries the section at HEAD" (AC-5.1a) | `.claude/pdlc.config.example.json` — top-level keys are `dispatch`, `implementation` only; no `learningsInjection` anywhere in the repo | **Verified** at HEAD |
| AC-5.1b misspelt-name reading | AC-5.1a's absent-section rule, AC-5.1c | **Coherent.** Misspelt → absent → default-enabled; consistent with AC-5.1c's enabled-with-notice, no unknown-key registry implied |
| "the configuration being read once" (AC-3.3, per-run thresholds locus) | `orchestrate-dev.js:13675-13682` — advisory config read once per run before the phase loop, reused everywhere including the report-time gate | **Verified.** The per-run locus for thresholds matches shipped precedent exactly |
| AC-3.3 per-dispatch `orderKeys` locus | TSPEC:266-270 (`dispatches[i].orderKeys`, "always recorded"), ERR-6 (TSPEC:1144-1154) | **Resolved for this input.** REQ now names the locus TSPEC built; the completeness-test split ("two completeness tests, one per locus") is checkable from REQ alone |
| AC-3.1's closure sentence after the edit | AC-3.3 | Consistent — AC-3.1 no longer claims AC-3.3's inputs live in its own rows, and defers loci to AC-3.3 |
| Cited authorities | `DC-01` (DOMAIN-CONSTRAINTS.md:20), `DEC-CONS-05` (docs/completed/pdlc-consolidation-agent/DECISIONS-*.md) | Both exist; no nonexistent-authority citation in the changed text |
| Size budget | 480 lines, 37.6 KB | Within the 700-line / 60 KB REQ budget |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-01: is the run-level corpus-outcome mirror wanted at all in REQ, or is it TSPEC's business? AC-3.3 already keeps thresholds at run level, so REQ could simply say the corpus outcome is per-dispatch and leave last-write-wins entirely to TSPEC §A.5 |
| Q-02 | For F-03: is malformed-section inertness a deliberate "operator said something, honour the something" rule, or inherited from the era when AC-5.1a made an absent section inert too? The answer decides which of the two fixes applies |

## Positive Observations

- AC-3.3's rewrite is the right shape: it states *why* the locus divides (the corpus can move
  mid-run), divides by named input rather than by hand-waving, and preserves the closed-set
  obligation on both sides ("two completeness tests, one per locus"). It answers ERR-6's actual
  question — a product decision about the record's contract — rather than importing TSPEC mechanics
  into REQ.
- The per-run thresholds half is not just plausible, it matches the shipped reader's own discipline
  (read once, before the phase loop) — the kind of alignment that costs an implementer nothing.
- AC-5.1a's "an absent configuration section is not this state" is stated as an explicit negative
  with the reason attached (no repository carries the section at HEAD), which is what makes the
  G-1 conflict unrepeatable rather than just currently resolved.

## Recommendation

**Needs revision**

Both routed items landed, and the shipping-default item landed cleanly. The AC-3.3 item landed
only for one of the two observations it covers: AC-3.2's corpus-level outcome is still pinned
"once per run", which the rewritten AC-3.3 itself says cannot describe a divergent run (F-01,
High). The fix is one sentence in AC-3.2 naming the per-dispatch locus and the locus its
set-equality test asserts over; F-02 folds into the same sentence. F-03 is a separate, smaller
edit to AC-5.1b — align with the sibling reader or state why this feature diverges from it. F-04
is the unfixed one-word precision nit from v6; land it on the next touch.

## Delta-confirmation findings (tagged)

FINDING: High | delta | local | AC-3.2 corpus-level outcomes vs AC-3.3 | AC-3.2 still records `RSN-UNLISTABLE`/`RSN-EMPTY` "once per run" while the rewritten AC-3.3 states a run-level record cannot describe a run whose corpus moves mid-run; the routed locus question is answered for `orderKeys` and left unanswered for the corpus outcome, so a dispatch that observed an empty or unlistable corpus in an otherwise non-empty run is unreproducible from the report — the exact defect ERR-6 raised. TSPEC:266-270 already records `dispatches[i].corpusOutcome` per dispatch.

FINDING: Medium | delta | local | AC-3.2 not-selected rows | The per-document not-selected rows carry no stated locus; under the mid-run corpus movement AC-3.3 now admits, one run-level not-selected list cannot carry a per-document reason true for every dispatch, so AC-3.3's "every input the rule used is in the report" is not satisfiable for the earlier dispatch.

FINDING: Medium | delta | local | AC-5.1b malformed section | AC-5.1b cites the sibling config readers as precedent but prescribes the opposite response: `parseAdvisoryConfig` answers a present-but-not-object section with defaults plus a malformed flag (`orchestrate-dev.js:1981-1983`), which reads as inertness only because `ADVISORY_DEFAULTS.enabled` is `false` (`:1944-1949`); with `enabled` defaulting to `true` here, malformed-section becomes the only non-deliberate config mistake that disables the feature, against G-1/C-7's direction and against the cited precedent.

FINDING: Low | inherited | nonlocal | §1.2 claim 2 | "reaching one directory level under `docs/`" is exact for `docs/*/LEARNINGS-*.md` but off by one for `docs/completed/*/LEARNINGS-*.md`; carried unfixed from v6 F-01, nothing depends on the phrase.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
