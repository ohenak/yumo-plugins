# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.1, bytes unchanged since approval)
**Upstream re-read at:** REQ sha256:17e83bf… (v1.7), FSPEC sha256:1c05f51… (unchanged)
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** Upstream-cascade confirmation. One question — does this TSPEC still hold as approved against REQ as it now stands? Product lens only. Settled decisions are not re-litigated.

## Overview

**What I re-read.** My v2 approval was recorded with `UPSTREAM-STATE: REQ sha256:ad68cd05…`, which is REQ at `7660f1ed`. REQ at HEAD is `5753de27`, `sha256:17e83bfc…`, matching the hash in this dispatch. The cascade delta is therefore exactly `git diff 7660f1ed 5753de27 -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md`: 13 insertions, 4 deletions across three hunks — the version cell (`1.6` → `1.7`), a new erratum paragraph in §1, the §5 `BL-04` row, and one sentence of §9 `OB-1`. FSPEC's hash is byte-identical to the one my v2 approval pinned, so nothing on that leg moved.

**The two landed items, verified in the REQ text at HEAD rather than from the erratum note:**

1. **§5 BL-04 now states its outcome.** The row's "Verified by / when" cell reads *"Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)"* (`REQ:231`), where it previously read *"Checked at FSPEC authoring:"* with no outcome. §10's readiness paragraph is **unchanged** — it still reads *"BL-04 is **open and unmet** — not discharged at FSPEC authoring"* (`REQ:558`). So the edit removed a §5/§10 divergence by moving §5 onto §10's reading; §10 itself, which is what this TSPEC quotes, did not move.
2. **§9 OB-1's worktree evidence is relabelled.** It previously read *"a Claude-created worktree has no ledger, because `.worktreeinclude` lists only `.claude/workflows/`"*; it now reads *"because the worktree include list that carries `.claude/workflows/` into a worktree is consumer-local — untracked on the default branch, so a consumer fact and not a repo fact — leaving the ledger's consumer-local path absent there"* (`REQ:467-470`). The **conclusion is preserved verbatim in force**: a worktree fails open to a full run. Only the evidence's status changed. The filename `.worktreeinclude` no longer appears anywhere in REQ (`grep -n worktree` returns §1's erratum note, §9 OB-1, and two unrelated OQ mentions).

**The answer to the one question.** Yes, with two citation-currency findings and no substantive one. On the substance, the cascade moved REQ **toward** this TSPEC rather than away from it: §1.1 and OB-F1 have said BL-04 is unmet since v1.0, and REQ §5 now says the same thing, so a divergence this TSPEC worked around is closed upstream. Every behavioural clause I checked in §2, §3 and §5.4 still traces to a REQ criterion that says what it said when I approved. What did not survive the edit is TSPEC §6.3's *description of REQ's text* — one erratum item quotes a sentence REQ no longer contains, and two items label REQ as "v1.6". Those are findings of this confirmation under DEC-ERR-03 (a document that cites upstream text upstream no longer says), not of the item list. Both are Low-to-Medium currency defects in the errata section, not in the design; neither narrows, reinterprets or drops an acceptance criterion, so neither is gating.

## Architecture

Nothing in the edited REQ text touches a design decision this TSPEC makes, and I checked that claim against the TSPEC passages that lean on the two edited REQ locations rather than asserting it.

**BL-04's outcome (REQ §5, §10).** Three TSPEC passages depend on it:

- §1.1 *"REQ BL-04 requires the resume mechanism and `docs/_constraints/pdlc-wave-gate-baseline.md` to be readable in the authoring tree. They are **not**."* — still a faithful compression. REQ §5 BL-04's requirement half is untouched (`git rebase`/merge, both artifacts readable in the authoring tree); only the outcome clause was added, and it now agrees with §1.1's "they are not". After the edit this sentence is *more* faithful than when I approved it, not less.
- §6.2 OB-F1 *"REQ BL-04 unmet: this tree is 1,637 commits behind…"* — unchanged in force. Its disposition ("not dischargeable by this document", owned by orchestrator/operator, AT-14 is a PLAN sequencing precondition) is a statement about branch management, and the REQ edit says nothing about who owns the rebase. REQ §10 still confirms BL-04 is **not** a pickup gate (`REQ:563-564`, "`ready: true` is accurate today"), which is what keeps OB-F1 a precondition on the *wave carrying AT-14* rather than on the run.
- §6.2 OB-F1's trailing sentence — *"Re-raised as an erratum below, because the REQ's §10 and the FSPEC's OB-F1 characterise it inconsistently"* — still holds and is worth being explicit about, because it is the one place a reader might expect the cascade to have closed something and it has not. The inconsistency named there is **REQ §10 vs FSPEC OB-F1**, not REQ §5 vs REQ §10. FSPEC OB-F1 still reads *"Raised as an erratum against the REQ, whose §10 records BL-04 as 'discharged at FSPEC authoring'"* (`FSPEC:429`) — a statement REQ §10 has never made in any version I have seen, and does not make at HEAD. The REQ-side edit made that FSPEC sentence *more* wrong, since §5 now says "unmet" too. TSPEC §6.3 item 2 is the correct routing for it and remains open against FSPEC. No action falls on this TSPEC.

**OB-1's worktree evidence (REQ §9).** Two TSPEC passages:

- §1.3 *"Worktrees fail open. A Claude-created worktree does not carry `.claude/pdlc-wave-state.json`, so the record is absent there and the run is a silent full one (FSPEC EC-17). This is a consequence of consumer-local state, not of any rule this TSPEC adds"* — this survives the edit intact, and notably it never rested on `.worktreeinclude` in the first place. It cites FSPEC EC-17 for the behaviour and grounds the *reason* in consumer-local state, which is exactly the framing REQ OB-1 has now adopted. This is the round's best evidence that the design leans on the conclusion, not on the retracted evidence.
- §1.3's tail — *"see §6 for the citation defect the REQ carries about it"* — is the sentence the edit falsified. REQ carries no such defect at HEAD. See F-01.

**Scope.** No scope movement in either direction. The REQ edit adds no requirement, removes none, and changes no P0/P1 priority; the erratum note itself says "Two items, nothing else changed", and the diff bears that out. TSPEC still implements exactly the ten REQ criteria §2.6 maps, with no behaviour the REQ does not ask for.

## Interfaces

The surfaces this confirmation examines are the citation contracts between this TSPEC and REQ — the errata channel and the requirement-mapping table — since those are the only interfaces a pure-upstream edit can break.

**The errata channel (§6.3).** This is where the cascade lands, and it is where both findings sit. §6.3's own framing is *"Raised, not fixed here; each is emitted as an `ERRATUM:` line in this dispatch's final message"* — so the section is a routing surface whose entries are read by a downstream mechanism and by the next human reading TSPEC. Two of its four entries no longer describe REQ at HEAD:

| §6.3 item | Status against REQ at HEAD | Effect |
|---|---|---|
| 1 — FSPEC's version cell says REQ v1.5; *"the REQ at HEAD is **v1.6**"* | Substance **still true and stronger** (FSPEC's cell is now two versions stale); the parenthetical version label is **stale** — REQ at HEAD is v1.7 (`REQ:13`) | F-02 |
| 2 — FSPEC OB-F1 misquotes REQ §10; *"REQ v1.6 §10 says the opposite"* | Substance **still true and verified verbatim** — REQ §10's sentence is byte-identical at HEAD (`REQ:558`) and FSPEC:429 still misstates it; only the version label is stale | F-02 |
| 3 — FSPEC has no clause for what an explicit-pointer run writes | **Untouched** by this edit; still open against FSPEC | — |
| 4 — REQ OB-1 rests on `.worktreeinclude` listing only `.claude/workflows/`, which is untracked | **Landed upstream.** REQ OB-1 now labels the include list consumer-local and untracked in its own words; the string `.worktreeinclude` is gone from REQ | F-01 |

Item 4 is the DEC-ERR-03 case in its pure form: this TSPEC quotes a sentence its upstream no longer contains, and characterises upstream as carrying a defect upstream has fixed. That the fix is the one TSPEC asked for does not make the citation current — a reader arriving at §6.3 today, or a harvest pass reading the errata channel, is told to go raise something already raised and closed. The fix is small and mechanical: mark item 4 landed (with the REQ version that landed it) or strike it, and repoint §1.3's *"see §6 for the citation defect the REQ carries about it"* at REQ OB-1's current consumer-local framing, which now says what §1.3 wanted §6 to say.

**The requirement-mapping table (§2.6).** Unaffected. Every id it maps — REQ-WVR-01 through REQ-WVR-10, and the business rules BR-04, BR-05, BR-10, BR-11, BR-12, BR-14, BR-16 — is untouched by the diff (the edit does not enter §4, §6, §7 or §8 of REQ). The ten criteria that carried a component when I approved still carry the same component against the same text. I re-read REQ-WVR-02's IG enumeration and REQ-WVR-08's wave-loop scoping specifically, because the previous erratum round (v1.6) moved both and this round's note mentions them in its recap of v1.6; both are byte-identical to the version my v2 approval was taken against, so nothing there re-opens.

**C-3's no-new-capability boundary.** Unmoved. REQ C-3 is untouched; §3.4, DEC-WVR-08 and the AT-03/AT-11 `merge-base` call-count oracles still trace to it as written.

## Data Model

The record's product-visible shape is specified by FSPEC, whose bytes are unchanged from the version my v2 approval pinned, so nothing in this leg of the cascade can have moved it. I re-checked the three places where REQ — not FSPEC — is the source of a shape or state claim, because those are the ones the edit could in principle have reached:

- **Retention and the `{}` cleared shape.** REQ §9 OB-1's closing sentence — *"One decision remains genuinely left to TSPEC: the `{}` 'cleared' shape that `parseWaveLedger` reserves but nothing ever writes — wire it or drop it"* — sits in the same paragraph the edit touched, three lines below the changed sentence, and is **byte-identical** at HEAD. DEC-WVR-04's disposition (keep the tolerance, add no writer) still discharges exactly what REQ left open, and §6.2 OB-F3 still reports it discharged. Nothing to change.
- **The record's location, and that it is never tracked content.** REQ-WVR-10 and REQ §9 OB-1's "location, encoding, matching procedure and write mechanics are left to TSPEC" framing are untouched. `WAVE_STATE_PATH` under a root-anchored `.gitignore` rule (V-14) and AT-14's assertion on the ignore rule itself still trace as written. Worth stating explicitly given this round's subject: the OB-1 edit narrowed a claim about *where consumer-local state does and does not travel* (worktrees), and the TSPEC's own consumer-local placement of the record is the thing that makes the worktree conclusion true. The edit is therefore consistent with the data model rather than in tension with it.
- **Completion as a high-water property.** REQ-WVR-01/BR-08 untouched; `lastGreenWave` semantics on the `resume` decision unchanged, as is the §3.2 skip-line rendering I re-derived in v2.

One consequence of the BL-04 edit is worth recording as a *non*-finding, because it is the kind of thing that looks like one: REQ §5's row now names an outcome ("unmet") in a table whose other three rows name outcomes too (BL-01/02/03 resolved at HEAD per §10). That makes §5 a state table rather than a checklist. This TSPEC never reads §5 as a checklist — §1.1 reads the requirement, §6.2 reads the state — so the reframing costs it nothing, and the state it now reads from two places agrees in both.

## Test Strategy

Product lens only: does any acceptance criterion's oracle change meaning now that REQ reads as it does? No. But two oracles are worth naming because they are the ones a reader would expect this cascade to touch.

- **AT-14 (the ignore rule) and OB-F1's sequencing precondition.** §6.2 OB-F1 states *"AT-14 is red until it lands, and in wave mode a red gate halts the wave and every wave after it — so the wave carrying AT-14 must not be dispatched before the rebase … This is a PLAN sequencing precondition, not a caveat."* REQ §5's edit changes the *recorded status* of the prerequisite, not its dischargeability, so the precondition stands unaltered and, if anything, is now easier to justify to a PLAN author: the REQ's own §5 row, not just its §10 prose, now says the row is not discharged. RT-4's mitigation ("the correct response to a red is the rebase, not a weaker oracle") is unchanged and still correct. This is the one place where a careless reading of the erratum could do product harm — someone could read "BL-04 is now correctly recorded" as "BL-04 is now handled" and let the AT-14 wave be scheduled early. It is not handled; it is accurately labelled unhandled. TSPEC already says so in both §1.1 and OB-F1, so no change is owed here, but the PLAN author should carry that distinction.
- **EC-17 / the worktree fail-open.** The OB-1 edit is the closest the cascade comes to a testable claim. It does not change what a worktree does — a Claude-created worktree still has no record and still fails open to a full run — it changes why we are entitled to say so, from "an include list in the repo lists only `.claude/workflows/`" to "the include list is consumer-local and untracked, so nothing carries the record". §1.3 already grounds the behaviour in FSPEC EC-17 and in consumer-local state rather than in the include list, so no oracle moves. Nothing in §5.4 asserts over `.worktreeinclude`, which I confirmed by grep across the TSPEC: the string appears twice, both inside §6.3 item 4 (the claim and its `git ls-tree` evidence), and never in an AT.

The remainder of the test strategy is unreached by this edit. The eighteen FSPEC acceptance tests still carry the oracles I approved in v2, against an FSPEC whose bytes have not changed; the three closed catalogues still get set-equality (§3.1, AT-02/AT-08/AT-13); AT-03/AT-11's `merge-base` call-count equality still discharges REQ C-3. I re-verified none of these mechanically this round, and say so plainly — they are out of scope for an upstream-cascade confirmation whose upstream delta does not reach them, and re-deriving them would be re-litigating an approval that still stands.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | §6.3's four items are a mix of *raised against FSPEC* (1, 2, 3) and *raised against REQ* (4), and item 4 has now landed while 1–3 have not. When TSPEC is next edited, should §6.3 gain a disposition column (`open` / `landed in REQ v1.7` / `routed to FSPEC`), so that a later reader — or a harvest pass reading this section as the errata channel it declares itself to be — can tell at a glance which entries are still live? I have no view on the format; I raise it because this round proves the section goes stale silently, and it is the only section of this document that can. |
| Q-02 | Carried forward, unanswered because TSPEC's bytes have not changed: §6.2 OB-F4's *"7 no-op dispatches over waves 1–3 of a 16-wave plan"* is a measurement from a run not re-derivable in this tree. Should the promotion task re-measure it after the rebase, or transcribe it as a dated historical observation? Either is fine; the baseline file's Measured-by column makes the difference visible, so the PLAN task should say which. (v2 Q-02.) |

## Assumptions and risks carried

- **A-1 (unchanged).** FSPEC's bytes are identical to those my v2 approval pinned (`sha256:1c05f51…` in both my v2 `UPSTREAM-STATE` line and this dispatch), so this confirmation reasons about one moving upstream, not two. If that hash had differed I would have had to re-read the FSPEC leg as well.
- **R-1 (new, non-gating).** The FSPEC↔REQ inconsistency TSPEC §6.3 item 2 routes is now **wider**, not narrower: FSPEC OB-F1 attributes to REQ §10 a "discharged at FSPEC authoring" reading that neither §10 nor, since this edit, §5 supports. This TSPEC handles it correctly — it raises rather than absorbs — so nothing falls on this document. It is recorded here so the phase that owns FSPEC does not read "REQ erratum landed" as "the inconsistency is closed". It is not; only the REQ half was ever in question, and the REQ half was already right.
- **R-2 (carried).** The v2 finding that the 85% branch floor is wired to `postWaveCommand`, a per-run key whose failure halts wave 1, is still open in this document's §5.8 and RT-7 (F-02 below). It was non-gating at v2 and remains so, but it is the one open item I would most want closed in the same pass as PLAN authoring, since se-author will otherwise write a PLAN obligation the shipped config surface cannot express.

## Positive Observations

- **The design leaned on the conclusion, not on the retracted evidence — and that is why this cascade is cheap.** §1.3 grounds the worktree fail-open in FSPEC EC-17 and in "a consequence of consumer-local state", never in `.worktreeinclude`. When REQ retracted the include-list evidence and re-derived the same conclusion from consumer-locality, the TSPEC's sentence was already written against the durable half. That is the difference between a document that compresses its upstream and one that transcribes it, and it is worth naming because it is what kept a High off this round.
- **The TSPEC saw this coming and raised it rather than absorbing it.** §6.3 item 4 is the finding that produced this REQ edit: the TSPEC noticed that OB-1's evidence was consumer-local, said the conclusion still holds, and routed the defect upstream instead of quietly restating REQ in better words. The erratum discipline worked end to end here — the only residue is that the raiser's own note is now stale, which is a bookkeeping cost, not a correctness one.
- **BL-04's two homes now agree, and the TSPEC was on the right side of the disagreement all along.** §1.1 and §6.2 OB-F1 have said "unmet, not dischargeable here, a PLAN sequencing precondition for the AT-14 wave" since v1.0. REQ §5 has now moved onto that reading. An approval taken against the older bytes did not have to be revisited on the substance, which is the outcome an upstream-cascade check exists to establish.
- **OB-F1's precondition is stated as a scheduling constraint, not as a caveat.** Re-reading it this round with the REQ now explicitly labelling BL-04 unmet, the sentence "the wave carrying AT-14 must not be dispatched before the rebase … This is a PLAN sequencing precondition, not a caveat" reads even better than it did at v2: it converts an unmet prerequisite into a concrete instruction the next phase can act on, which is exactly what stops "accurately labelled unhandled" from being mistaken for "handled".

## Recommendation

**Approved with minor changes**

TSPEC still holds as approved against REQ at `sha256:17e83bfc…`. The cascade delta reaches four places in REQ — the version cell, a new §1 erratum note, the §5 BL-04 row's outcome clause, and one sentence of §9 OB-1 — and I traced each into every TSPEC passage that leans on it. No acceptance criterion was narrowed, reinterpreted, broadened or dropped; no scope moved in either direction; the §2.6 requirement→component map still maps the same ten criteria against byte-identical REQ text; and on the one point where REQ moved substantively (BL-04's recorded status), it moved onto the reading this TSPEC has held since v1.0. My approval does not need to be withdrawn.

What the edit did break is this document's *description of its upstream*, in the errata channel and nowhere else:

- **F-01 (Medium, delta, local)** — §6.3 item 4 quotes a REQ sentence that no longer exists and reports as an open defect something REQ fixed in v1.7; §1.3's "see §6 for the citation defect the REQ carries about it" points at it. Mark item 4 landed (naming REQ v1.7) or strike it, and repoint §1.3 at REQ OB-1's current consumer-local framing.
- **F-03 (Low, delta, local)** — §6.3 items 1 and 2 label REQ at HEAD as "v1.6"; it is v1.7. The substance of both items is unchanged and item 2's quotation of REQ §10 is still verbatim-correct; only the version labels are stale, and item 1's point gets stronger, since FSPEC's cell is now two versions behind.

Neither is gating, and both are one-line edits that belong in whatever pass next touches §6.3. Three findings carried from v2 remain open in unchanged bytes and remain non-gating: the coverage floor wired to a per-run `postWaveCommand` (F-02), H-1's over-strong "the harness cannot express it" rationale (F-04), and the duplicated clause at line 469 (F-05). Of these, F-02 is the one I would close before PLAN authoring, for the reason v2 gave: a coverage floor on `postWaveCommand` halts wave 1 of the very phase this feature exists to make recoverable.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §6.3 item 4 quotes REQ OB-1's retracted `.worktreeinclude` sentence and reports as open a defect REQ v1.7 has landed; §1.3's cross-reference points a reader at it | §6.3 item 4 / §1.3 |
| F-02 | Medium | inherited | nonlocal | The 85% branch floor is placed on the "last implementation wave's `postWaveCommand`", a per-run key whose failure halts wave 1 (v2 F-01, unchanged bytes) | §5.8 / §6.4 RT-7 |
| F-03 | Low | delta | local | §6.3 items 1 and 2 call REQ at HEAD "v1.6"; it is v1.7 — the items' substance is unaffected | §6.3 items 1–2 |
| F-04 | Low | inherited | nonlocal | §5.2 H-1's rationale claims the shipped harness cannot express double-interleaving; both doubles are caller-supplied (v2 F-02, unchanged bytes) | §5.2 H-1 |
| F-05 | Low | inherited | nonlocal | Duplicated clause "the field on the decision on the decision" at line 469 (v2 F-03, unchanged bytes) | §3.2 |

FINDING: Medium | delta | local | §6.3 item 4 / §1.3 | §6.3 item 4 states REQ OB-1's worktree conclusion "rests on `.worktreeinclude` listing only `.claude/workflows/`" and raises the consumer-local evidence as an open erratum against REQ. REQ v1.7 landed exactly that fix: OB-1 now reads "the worktree include list that carries `.claude/workflows/` into a worktree is consumer-local — untracked on the default branch, so a consumer fact and not a repo fact" (REQ:467-470), and the string `.worktreeinclude` no longer appears in REQ at all. So this TSPEC quotes upstream text upstream no longer contains, and §1.3's "see §6 for the citation defect the REQ carries about it" sends a reader to a defect that is closed. The conclusion both documents draw is identical and unaffected — worktrees fail open — so this is a citation-currency defect in the errata channel, not a design one. Fix: mark item 4 landed in REQ v1.7 (or strike it) and repoint §1.3 at REQ OB-1's current consumer-local framing, which now says what §1.3 wanted §6 to say.
FINDING: Medium | inherited | nonlocal | §5.8 / §6.4 RT-7 | Carried unchanged from v2 F-01, in bytes this round did not touch: the 85% per-file branch floor is named as an obligation of "the last implementation wave's `postWaveCommand`", but `postWaveCommand` is a single per-run key (`IMPLEMENTATION_DEFAULTS`, one value parsed once from the `implementation` section) that the wave loop runs after every wave, and a failing post-wave command halts the wave. Configured as written it reds wave 1, long before this feature's branches exist. Close it by moving the floor to a last-wave PLAN task or a Phase DOD / CODE_REVIEW criterion, and make §5.8 and RT-7 say the same thing. Non-gating, but worth closing in the same pass as PLAN authoring, since se-author will otherwise write a PLAN obligation the config surface cannot express.
FINDING: Low | delta | local | §6.3 items 1–2 | Both items label REQ at HEAD as "v1.6"; REQ at HEAD is v1.7 (REQ:13). The substance of both survives intact — item 2's quotation of REQ §10 ("open and unmet — not discharged at FSPEC authoring") is still verbatim-correct at REQ:558, and item 1's point strengthens, because FSPEC's "derives from REQ v1.5" cell is now two versions stale rather than one. Update the two version labels when §6.3 is next touched.
FINDING: Low | inherited | nonlocal | §5.2 H-1 | Carried unchanged from v2 F-02: H-1's justification says the shipped harness cannot express the interleaving of the `runCommand` and `git` doubles, but both are caller-supplied, so a test can pass a pair that append to one array it owns with no harness change. Restate H-1 as a reuse/consistency choice (one ordered sink for the whole ledger block) rather than an expressiveness limit, so the reason the PLAN schedules it as owned work on a shared file is a true one.
FINDING: Low | inherited | nonlocal | §3.2 | Carried unchanged from v2 F-03: duplicated clause at line 469, "Keeping the field on the decision on the decision is what lets that line be rendered from the decision…". Delete the repetition; the paragraph's substance is correct.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}
