# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** Delta re-review — testing lens. Verified each v1 finding is resolved and scanned only the changed sections for new issues.

## Delta scope

Reviewed at HEAD `67aceb2`. The document I reviewed in v1 was `6703b20`; the delta is
`git diff 6703b20 67aceb2 -- docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md` — ten commits,
touching the grounding pin, the shared Context, the register's DEC-ADV-01 reversibility cell,
DEC-ADV-01/03/04/05/06/07/08/10, the "Decisions deliberately NOT taken here" closing paragraphs, and
standing obligations 3–5. Unchanged sections (DEC-ADV-02, DEC-ADV-09, the Options Considered table,
the Costs paragraph) are not re-litigated here.

Every citation *newly introduced* by the delta was re-read at HEAD rather than trusted:

| New claim | Verified how | Result |
|---|---|---|
| Grounding pin's re-confirmation commit `4db9b4a`, `22b310e` an ancestor of it | `git cat-file -t`, `git merge-base --is-ancestor` (both directions) | exact; `4db9b4a` is also an ancestor of HEAD |
| FSPEC §4.1 preamble `FSPEC:232-237` — "steps 5 and 7 complete **before** that durable git operation", both seams named | `sed -n '230,240p'` | exact, verbatim |
| A2-6 at `FSPEC:454`; A5-8 at `FSPEC:635` ("the produced-change check and the record write both complete **before** the push"); R-2 at `FSPEC:690` ("At A5 the write completes before the push") | `sed -n` at each | all three exact |
| C-2 at `FSPEC:145` — report-only-when-enabled, naming `advisory.enabled` and §12 D-5 / §10.3 S-4 | `sed -n '143,147p'` | exact, verbatim |
| `CLI_DEV_EXPORTS` is **ten** names at `build:243-254` | read the literal | exact — ten entries, `isComplete` … `defaultListFiles` |
| `dodVerifyLoop` at `dev:6273`; the `CODE_REVIEW-{feature}-v{N}` filename in its log at `dev:6297` | `grep -n`, `sed -n` | exact (the `_log(` call opens at `:6297`, the template at `:6298`) |
| `devModule` precedes `queueModule` in **both** `contents` arrays (`build:281`, `build:288`) | read both lines | exact — the detector's ordering conjunct is falsifiable as written |
| TSPEC §11.3 is the section holding "deliberate C-2 deviation" (v1 cited only the line) | heading scan before `TSPEC:1238` | exact — `### 11.3 Disabled-mode edge cases` at `:1230`; the citation correction is right |
| `MODEL_DEFAULT = "opus"` at `dev:1578` (basis for the AC-1.4 unreachability paragraph) | `sed -n` | exact |
| `MERGE_GUARD_DEFAULTS` frozen at `dev:47-52`; `guardVerdict` exported at `dev:731`; `commitPaths` `dev:6905` / `gitWithLockRetry` `dev:6862` still un-exported | `sed -n`, `grep -n` | exact — the one live TSPEC erratum is still real |
| `AWAIT_SCAN_SOURCES` at `bundleTest:997`; `BUNDLES` at `:23`; the `realMain` hit at `:446` is a `stripModuleSyntax` unit case | read all three lines | exact — the "no bundle is ever loaded or scanned" premise still holds at HEAD |

## Prior findings — disposition

| v1 ID | Sev | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | DEC-ADV-08's Context now opens on C-2 as *settled* upstream, quotes `FSPEC:145` verbatim, and narrows the decision to **where** the suppression lives. "The conflict is routed upstream as an erratum against FSPEC" is gone, replaced by "This is a **conformance** choice, not a deviation and not a conflict resolution … no erratum against FSPEC is owed or raised." The entry now states the oracle I asked for — the two-conjunct straight test of C-2, with conjunct (a) (`invalidKeys` contains `enabled`) named as what makes conjunct (b) falsifiable rather than absence-only. The closing paragraph was rewritten to "**One live upstream defect**" (TSPEC's `commitPaths` gap) plus a new "**Two things that look like upstream defects and are not**" paragraph citing `FSPEC:232-237` / `:635` / `:690` and `:145`. Trigger 1 of DEC-ADV-08 was restated off the erratum channel onto the observable event. The ripple I flagged is routed: TSPEC §11.3's wording is named explicitly (and the section reference is correct — verified above). |
| F-02 | High | **Resolved** | DEC-ADV-01 gains a dedicated "**The detector this decision needs, and does not have today**" paragraph that states the premise is asserted by nothing, cites the three negative facts (`bundleTest:23`, no `new Function`/`eval`, `realMain` only at `:446`), and specifies the detector in falsifiable form: every prelude `__dev.<name>` present in that bundle's `devModule` export list **and** `devModule` before `queueModule` in the `contents` array. It carries the mutation check (delete `devModule` from the queue bundle's `contents` → expect **red**) and explicitly rejects the substring assertion as insufficient. The reversibility grade is now conditional in both places it appears — the register cell reads "easy, once the bundle-composition detector ships" — and trigger 3 names the detector as its observation ("that test going red *is* this trigger firing"). DEC-ADV-05 cites the **same** detector for the same premise, as asked. |
| F-03 | Medium | **Resolved** | All three obligations acquire detectors, in the shapes requested. Obligation 3: a literal `26c3f1c` provenance assertion, with the "**literal transcription**, never read from the fixture it checks" constraint stated. Obligation 4: a source scan in the `AWAIT_SCAN_SOURCES` shape (`bundleTest:997`) asserting the seam set on the escalation path is **exactly** `{_appendFile}` — set-equality, with "not `does not contain _readFile`" spelled out. Obligation 5: a differential oracle over a shared corpus including the three adversarial cases, asserting X-e and Phase MERGE agree **on every input**, with the reason independent expectation tables are rejected. The closing sentence generalises it correctly ("a standing obligation with no detector is documentation, not an obligation") and records that 1 and 2 already ship theirs. |
| F-04 | Medium | **Resolved** | DEC-ADV-04's rejection is restated on AC-1.3's actual three conjuncts (`REQ:76-80`), with the distinguishability correctly described as between *runs*, and the separate-constant argument re-grounded on conjunct (a) naming the substitute. The entry now names the wrong oracle explicitly and forbids it: "never `expect(MODEL_ADVISORY_FALLBACK).not.toBe(MODEL_DEFAULT)` — the two literals are equal today (`"opus"`, `dev:1578`)". The AC-1.4 unreachability I asked to be said out loud is now a full paragraph, correctly classifying AC-1.4 as a unit-level obligation with an injected dispatch double and warning that the whole-pipeline test "cannot exist". |
| F-05 | Low | **Resolved** | DEC-ADV-06 trigger 2 is now "**Any** change to the frozen `MERGE_GUARD_DEFAULTS` (`dev:47-52`)", with the reason stated (the old form was "a judgement no test or monitor can make") and the differential oracle named as what surfaces it. |
| F-06 | Low | **Resolved** | The pin is now an explicit floor ("read at or after … a **floor**, not a fixed HEAD"), with the re-confirmation commit `4db9b4a` named. I verified `22b310e` is an ancestor of `4db9b4a` and `4db9b4a` an ancestor of HEAD, so the floor claim is true as written. |
| Q-01 | — | **Answered** | DEC-ADV-10 gains a "**Scenario identity is part of what makes the comparison valid**" paragraph naming the four scenario inputs, requiring the provenance header to record the scenario, requiring the comparison to replay it, and naming both failure modes (false-red on drift, vacuous green on a narrowed scenario). Routed to TSPEC §11.2 — the correct owner. |
| Q-02 | — | **Answered** | DEC-ADV-03 now states what `verifyGate` does at A1/A3/A4 ("runs the gate alone — the split is a partition of one lifecycle, not two"), and commits to the assertion I asked for: no `SeamOps.apply` implementation reaches a git-mutating seam, with the reason (otherwise R-2's guarantee "is a convention that the first seam committing inside `apply` breaks silently"). |
| Q-03 | — | **Answered** | DEC-ADV-07 gains "**Both derivation branches are positively asserted**", spelling out the common-case oracle as `dodHeadUnverified === false` **and** `dodVerifiedCommit === <the head>`, and naming the failure it prevents ("green on a field that is never populated"). |
| Q-04 | — | **Answered** | DEC-ADV-05 now specifies a **call-count oracle, not a value comparison** — "assert the injected dispatch was asked to resolve **exactly once**" — and states why the value comparison is insufficient ("passes a memo that re-resolves and happens to agree"). This is the answer that falsifies M-4. |

No prior finding regressed, and no unchanged section was disturbed by the delta.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
