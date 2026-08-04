# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review — product lens. Verification that each v1 finding is resolved, plus a scan of the changed sections only (`git diff 6703b20..67aceb2`, +183/−54) for new issues. Sections unchanged since v1 were not re-litigated.

## Prior-finding disposition

Every v1 finding is resolved, and each resolution was re-verified against the branch rather than taken
on the commit message's word.

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | DEC-ADV-08's Context (`DECISIONS:546-553`) now quotes `FSPEC:145` verbatim and states "**FSPEC C-2 already reconciles them**"; the decision is reframed as "a **conformance** choice, not a deviation and not a conflict resolution … no erratum against FSPEC is owed or raised" (`:559-562`). I re-read `FSPEC:145` — the quoted text matches character-for-character. The re-evaluation trigger (`:593-596`) no longer waits on an erratum; it now fires on C-2's clause being restated. |
| F-02 | High | **Resolved** | DEC-ADV-03's Context (`:265-273`) now cites the §4.1 preamble at `FSPEC:232-237`, A5-8 at `FSPEC:635` and R-2 at `FSPEC:690`, and concludes "There is no live contradiction to resolve." All three citations verify: `FSPEC:232-237` is inside `### 4.1 The flow` (header at `FSPEC:206`) and reads as quoted; `FSPEC:635` carries "The produced-change check and the record write both complete **before** the push"; `FSPEC:690` carries the matching clause. The entry's residual question ("how a **uniform** driver expresses that order without a per-seam branch") is a genuine TSPEC-side choice, and the rejected alternative was correspondingly restated from "the literal FSPEC order" to "a per-seam driver branch". The real `commitPaths` finding survives (`:305-312`). |
| F-03 | Medium | **Resolved** | The closing paragraph is rewritten (`:758-771`): it names TSPEC's `commitPaths` gap as the live defect and adds an explicit "**Two things that look like upstream defects and are not**" paragraph pinning both to their FSPEC line numbers. `grep -i erratum` over the whole document returns **zero** FSPEC-directed errata; every remaining routing targets TSPEC (`:170`, `:311`, `:655`, `:761`, `:785`). |
| F-04 | Low | **Resolved** | `:718` now reads "an explicit ten-name allow-list". `build-runtime.mjs:243-254` holds exactly ten entries. |
| F-05 | Low | **Resolved** | DEC-ADV-07 gains "**The restoration path chosen is: none.**" (`:498-504`), states plainly that both offered options are rejected and the judgement left with the operator, and cross-references re-evaluation trigger 3 — exactly the sentence F-05 asked for. |
| F-06 | Low | **Resolved** | DEC-ADV-04 gains a dedicated paragraph (`:376-386`) restating AC-1.4 unchanged — "no advisory agent runs on an unresolved model and the run fails loudly … no third fallback and no silent revert to `MODEL_DEFAULT`" — and bounding "non-fatal by construction" to the fallback branch. The added unreachability analysis stays inside REQ's grant: AC-1.4's last sentence is "The detection point is TSPEC's to choose" (`REQ:82-84`), so declaring it a unit-level obligation is a licensed choice, not a narrowing. |
| F-07 | Low | **Resolved** | `:514-517` now cites `dodVerifyLoop` at `dev:6273` and the log at `dev:6297`, and attributes the write to the `dod-verify` agent. Verified: `async function dodVerifyLoop(` at `orchestrate-dev.js:6272-6273`; the `CODE_REVIEW-…` `_log` call at `:6295-6300`. |

## Findings

All three are new, all Low, all confined to text the revision added. No prior finding remains open.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-08 | Low | Local | **The TSPEC erratum list is narrower than the stale TSPEC text it describes.** `DECISIONS:761-763` routes three TSPEC items — the `commitPaths` export gap, §16.1's manifest over-claim, and §11.3's "deliberate C-2 deviation" table cell. Having correctly established that no FSPEC erratum is owed, the document leaves unnamed the two places where TSPEC states the *opposite* at greater length: **§16.4 is titled "Errata raised against FSPEC (not fixed here)"** and enumerates both now-settled items — "A2-6 / R-2 ordering gap … FSPEC never reconciles them" (`TSPEC:1464-1466`) and "C-2 / D-5 conflict … satisfies both, contradictorily" (`TSPEC:1468-1470`) — and **`TSPEC:257`** opens §3.2's rule with "One deliberate deviation from C-2, resolving an FSPEC conflict (see the erratum in §16.4)". An erratum edit that fixes only the §11.3 cell leaves §16.4 asserting two FSPEC defects this document says do not exist. The document itself makes the completeness of this list load-bearing: it notes at `:770-771` that "an erratum round is bounded at one per upstream document per phase, and a confirmation that fails halts the phase" — so an item omitted from the round is not cheaply raised in a second one. Severity is Low only because I am emitting both items as errata from this review, so the routing happens regardless; what remains is the document's own accuracy as the record of what was routed. **Fix:** extend `:762-763` to name TSPEC §16.4 (both numbered items) and `TSPEC:257` alongside §11.3. | FSPEC C-2, A2-6, R-2; TSPEC §16.4, §3.2, §11.3 |
| F-09 | Low | Local | **"One live upstream defect" now heads a paragraph that routes three, and a fourth is routed elsewhere and never listed.** `:758` reads "**One live upstream defect is recorded but not decided here: TSPEC's `commitPaths` export gap**", then `:762-763` adds two more; separately, DEC-ADV-10's new paragraph routes a fourth — "TSPEC §11.2 owns the header's fields, and the scenario row is routed there as an erratum" (`:649-655`) — which the closing section does not mention. I confirmed that fourth item is genuine, not spurious: `TSPEC:1227-1229` records the fixture's provenance as "the exact commit sha `26c3f1c`, the command, the date" with no scenario field. The count in the lead sentence is the only thing wrong. **Fix:** "**Four TSPEC errata are recorded but not decided here**", and add the §11.2 scenario row to the list so the section remains the single index of what left this phase. | — (internal consistency of the document's own upstream-routing record) |
| F-10 | Low | Local | **DEC-ADV-03's "a step-7 failure reverts a working-tree edit only" does not hold at A4, which the same revision newly brings under the claim.** `:279-281` states the generalisation and then adds "At the three seams whose act is *not* irreversible (A1, A3, A4) `verifyGate` runs the gate alone". A4's action is not a working-tree edit: FSPEC §8.1 has the seam "resolve the conflicts, **complete the rebase**", and A4-4 (`FSPEC:566`) defines its revert as "returning the branch to its pre-seam state", with A4-6 (`FSPEC:568`) forbidding a third tree state. Reverting a completed rebase is a branch-state restore, not an edit undo. The design is unaffected — A4-6 is preserved everywhere else in the document, and FSPEC owns the revert semantics — but a reader who takes the generalisation literally will under-scope A4's revert obligation. **Fix:** qualify the clause, e.g. "reverts a working-tree edit only (A2, A5); at A4 the revert is FSPEC A4-4's restore of the pre-seam branch state, still one of BR-5's two tree states". | FSPEC A4-4, A4-6, BR-5 |

## Questions

| ID | Question |
|----|---------|
| Q-04 | v1's Q-01 stands unchanged: local HEAD (`67aceb2`) is still ahead of `origin/feat-pdlc-advisory-tier` (`eaa1f74`, merge-base `7cdfbb0`), and the remote tip predates the FSPEC v1.3 erratum round. I reviewed the local tree, and per the reviewer git protocol I neither pulled nor pushed in the shared tree. Confirm before the next push that the remote is intended to be overwritten rather than merged. |
| Q-05 | DEC-ADV-07 now answers OQ-3 with "restoration path: none", which is outside the two options AC-8.3 and FSPEC OQ-3 offered ("re-verification inside PUB, or a halt for the operator"). AC-8.3's testable clause is satisfied and F-05 is closed on that basis — but should FSPEC's OQ-3 row be updated to record "none" as the chosen resolution, so the FSPEC's open-questions table does not read as still open after this phase? That is a documentation call for the FSPEC author, not a defect of this document, so I have not raised it as an erratum. |
| Q-06 | v1's Q-03 is unanswered and I am not re-raising it as a finding: `advisory.envelope` is operator-editable (AC-1.7) while US-03 asks for a boundary "un-widenable by the agent". No entry records why operator-widenable is acceptable where agent-widenable is not. Was it weighed and judged obvious? If so, one sentence in DEC-ADV-06 would close it permanently. |

## Positive Observations

- **The two High findings were fixed at the premise, not at the sentence.** The cheap way to close
  F-01 and F-02 was to delete the word "erratum" and leave the framing intact. The revision instead
  rewrote both Contexts to state what FSPEC actually settles, quoted the settling text, and — most
  usefully — replaced DEC-ADV-03's rejected alternative, because once the conflict is gone "the
  literal FSPEC order" is no longer the thing that lost. What lost is a per-seam driver branch, and
  that is now what the entry rejects (`:289-293`). The rejection reason (a rule enforceable only by
  inspection, so a sixth seam that forgets the arm commits before it records) is stronger than the
  one it replaced.
- **It added the paragraph that stops the fix from being re-broken.** "Two things that look like
  upstream defects and are not" (`:765-771`) is the durable half: it names both questions, pins each
  to the FSPEC lines that settle it, and tells the next reader to re-read that text before concluding
  a deviation exists. Given that the previous version of this document argued the opposite, a future
  agent reading the git history alone could easily have re-derived the stale claim. This paragraph
  is what prevents that, and it should survive to LEARNINGS.
- **The register row was updated with the entry, not left behind.** DEC-ADV-01's reversibility cell
  now reads "easy, once the bundle-composition detector ships" (`:117`), matching the body's
  "**Reversibility: easy** — *conditional on that detector existing*" (`:203-207`). A summary table
  that silently keeps the old value is the most common way a revised decision record becomes
  self-contradictory, and this one did not.
- **The new detectors are specified as oracles a test engineer can act on, with the failure mode
  named.** Each of the three added detectors says what it asserts *and* what would false-green
  without it: the bundle-composition assertion carries an explicit mutation check ("delete
  `devModule` from the queue bundle's `contents` array and confirm the test goes **red**") and
  rejects the substring shortcut (`:186-201`); the escalation-log detector is set-equality over the
  seams applied to that path, "not 'does not contain `_readFile`'" (`:808-815`); the X-e / Phase
  MERGE detector is differential rather than two expectation tables that "drift together with the
  implementations" (`:816-824`). The generalisation it closes on — "a standing obligation with no
  detector is documentation, not an obligation" (`:826-828`) — is `Cross-Feature` signal worth
  promoting at harvest.
- **DEC-ADV-04's rewrite corrects an oracle that would have been written wrong.** The old text
  argued the fallback constant must differ from `MODEL_DEFAULT`; the revision points out that the two
  literals are equal today (`"opus"`, verified at `orchestrate-dev.js:1578`) and that AC-1.3's actual
  requirement is three positive conjuncts on the fallback path (`REQ:76-80`, transcribed accurately).
  Naming `expect(MODEL_ADVISORY_FALLBACK).not.toBe(MODEL_DEFAULT)` as the oracle *not* to write is
  the kind of pre-emption that saves a review round downstream.
- **The unreachability admission is the harder, more honest option.** Stating that AC-1.4's branch is
  unreachable end-to-end while `MODEL_ADVISORY_FALLBACK === MODEL_DEFAULT`, and that it therefore
  becomes a unit-level obligation, invites the question "so is AC-1.4 being skipped?" — and the
  paragraph answers it in advance (AC-1.4 applies unchanged; the unreachability is a property of
  today's literals and evaporates at trigger 3). REQ AC-1.4 grants the detection point to TSPEC, so
  this stays inside the requirement rather than narrowing it.
- **DEC-ADV-07 now asserts both branches of the derivation, not only the interesting one**
  (`:506-509`): `dodHeadUnverified === false` **and** `dodVerifiedCommit === <the head>` in the
  common case. Half-covered derivations that are green on a never-populated field are exactly the
  defect that reaches production, and catching it in a decision record rather than in PROPERTIES is
  early.

## Recommendation

**Approved with minor changes**

Both v1 High findings and the v1 Medium are resolved at the premise rather than the wording, and I
re-verified each against the FSPEC and the code rather than against the commit messages. The document
no longer asserts an FSPEC self-contradiction that does not exist, no longer aims an erratum round at
a document that would reject it, and now carries the paragraph that stops the stale reading being
re-derived from git history. The four v1 Lows are each closed by the specific edit requested.

The three remaining findings are all Low and none touches a decision:

1. **F-08** — extend the upstream-routing paragraph (`:762-763`) to name TSPEC §16.4's two items and
   `TSPEC:257`, not only §11.3's table cell. I am emitting both as errata from this review, so the
   routing itself is covered; the edit keeps the document's own record accurate.
2. **F-09** — "One live upstream defect" now heads a list of three; make it four and add DEC-ADV-10's
   §11.2 scenario row.
3. **F-10** — qualify "reverts a working-tree edit only" so it does not silently claim A4, whose
   revert FSPEC A4-4 defines as a restore of the pre-seam branch state.

Nothing here blocks Phase P. The product lens is satisfied: every entry still traces to a real
product, scope or business constraint; no rejected alternative is required by a P0/P1 requirement
(AC-1.4's loud-failure requirement is now explicitly preserved rather than implied, and AC-8.3's
restoration choice is stated rather than left to inference); no acceptance criterion is narrowed or
reinterpreted; no scope creep was introduced by the revision; and the re-evaluation triggers are
still conditions an operator would recognise — the two that were softened (DEC-ADV-01 trigger 3,
DEC-ADV-06 trigger 2) were changed in the direction of being *observable events* rather than
judgements, which is an improvement.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
