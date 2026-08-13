# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10)
**Date:** 2026-08-13
**Iteration:** 5
**Scope:** Testing lens, erratum delta-confirmation. Diff `2a1f910d..HEAD` on the REQ, plus a
re-grounding pass over what the changed text now leans on: FSPEC F-3 step 5 / BR-2.1 / BR-2.2 /
BR-4.7 / E-18 / AT-3.5, `DECISIONS-headless-engine-obligations.md` DEC-HE-02, and
`docs/_constraints/pdlc-engine-baseline.md` at HEAD.

## Erratum item disposition

All four raised items landed. Verified against the document and its upstream, not the changelog:

| Item | Landed as | Grounding checked |
|---|---|---|
| NG-6 restated as scope, not verb (se-review) | NG-6 (`:169-175`) now opens "The scope of this non-goal is **install and upgrade**, not every engine activity", enumerates the forbidden verbs (create, sync, write, read, version-check) *under that scope*, and states the run's read of `engine.*` as outside it | Matches FSPEC BR-2.2 (`:321-324`, "Install and upgrade touch consumer config not at all") and BR-4.7 (`:374-375`, "A **run** reads … only the `engine.*` namespace … and never writes it") word-for-word in substance |
| NG-6/O-2 reconciled honestly on scope (pm-author) | Same edit; the run-side half cites O-2 and AC-5.1, so the two statements point at each other rather than at a verb distinction | AC-5.1 (`:397-404`) does require the pinned version to execute, so the read is a real behaviour and not a hypothetical |
| O-2's "reading is not writing (NG-6 forbids only the latter)" misstatement (se-review) | The gloss is gone (`:524-530`); replaced by "This does not cross NG-6: that non-goal scopes install and upgrade, which touch no consumer file at all, while a run may read the operator-authored pin" | DEC-HE-02 (`docs/completed/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md:37-49`) says the per-consumer `.claude/pdlc.config.json` is "the **only** config file the engine reads", with `engine.*` reserved — the REQ's compression is faithful |
| AC-3.5 absence-only oracle (te-review) | AC-3.5 (`:339-346`) keeps the absence scan, names why absence alone is vacuous, and adds positives (a) secret present ⇒ publish authenticates, release cut; (b) absent/empty ⇒ workflow fails at the publish step naming the missing secret, nothing published | The shape is right; the carriers are not yet named anywhere — F-02 and F-03 below |

No collateral change: the diff is exactly the version bump, the changelog paragraph, NG-6, O-2 and
AC-3.5. The changelog's "No other change" is true as written. Size is 605 lines / 50,881 bytes,
inside the 700-line / 60 KB REQ budget, so the `check-req-size` hook stays quiet.

## Findings

No High findings. The erratum edits are correct and, on the read/write question, more honest than
what they replaced. Three Mediums and one Low, all about what can be *asserted* about the new text.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The reconciliation's load-bearing half — "install and upgrade read nothing" — has no falsifiable carrier.** The old NG-6 hid the read claim behind a verb muddle; the new one states it plainly, which is right, and thereby makes it a claim someone has to be able to break. Nothing in the AC set can break it: C-2 (`:189-191`) and AC-2.3 (`:292-300`) observe only that the consumer's working tree and index are unchanged, and a read leaves both clean. An install that quietly parsed `.claude/pdlc.config.json` would pass every criterion in REQ-EDIST-02. There is a real discharge available and it is by **locus**, not by observation: F-2 step 1 and F-3 step 2 already require both commands to run **on the machine, never inside a consumer project**, so there is no consumer file in scope to read. One clause in NG-6 or AC-2.3 naming that as the reason the read half holds turns an unassertable promise into a structural one — otherwise drop "read" from the enumeration and let BR-2.2 carry it alone. | NG-6; C-2; AC-2.3 |
| F-02 | Medium | Local | **AC-3.5's positive (a) names no observable and no channel, and its only downstream carrier proves the wrong thing.** "The publish step authenticates to the channel and the release is cut" — cut *where*, observed *how*? AC-3.3 already has vocabulary for this ("the published bytes for version N", "the run's own output names version N"); (a) should reuse it rather than invent "the release is cut". The sharper problem is the carrier: FSPEC AT-3.5 (`:671-673`) runs a **stub-channel** publish with a sentinel credential, and a stub-channel success proves the workflow authenticates *to the stub* — it cannot falsify a mis-wired real secret name, which is the failure (a) exists to catch. Either state the observable in AC-3.3's terms and accept that (a) is discharged against the stub, saying so, or seed the real-channel half as a one-time dated provenance observation from the first genuine release (the shape suggested for AC-3.4 at v4 F-03), explicitly not a gate. As written, (a) reads like a gate nobody can build. | AC-3.5(a); C-8; AT-3.5 |
| F-03 | Low | Local | **AC-3.5(b) is stronger than every downstream statement of the same event, and stronger than default tool behaviour.** "Fails at the publish step **naming the missing secret**" requires a preflight guard: an unset GitHub secret expands to empty, and `npm publish` with an empty token fails with a registry auth error that names no secret at all. Nothing in the REQ or FSPEC names such a guard — FSPEC E-18 (`:572`) says only "workflow run fails visibly; no partial publish", and AT-3.5 covers only the absence scan. The REQ is at the right altitude stating the outcome; the finding is that the outcome now outruns its downstream, so E-18 and AT-3.5 need to move in the FSPEC's erratum confirmation, not later. | AC-3.5(b); E-18; AT-3.5 |
| F-04 | Medium | Cross-Feature | **Carried, not new: v4 F-01 is still open at HEAD.** AC-3.4 and T-7 make the FSPEC's expected check set the change-control point and demote M-ENG-10 to a point-in-time observation, but `docs/_constraints/pdlc-engine-baseline.md:209` still closes "Both columns are authoritative; a change to either is a change to this fact first". Two documents still claim the same authority, so an implementer can write the equality against either and both are green today by construction. Re-recorded because the erratum round did not touch it and a Medium does not gate; the fix remains one sentence in the baseline row. | T-7; AC-3.4; M-ENG-10 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | FSPEC F-3 step 5 (`:140-141`) still carries the hand-off sentence "NG-6's own wording is an erratum against the REQ, not fixed here". The REQ has now fixed it, so that sentence is stale the moment this round closes. Is its removal part of the FSPEC's delta-confirmation, or does it need naming explicitly so the downstream edit is not lost between rounds? |
| Q-02 | Does the scope restatement change anything for a *run* that writes under `.claude/` for reasons other than config — the drift-state file the SessionStart hook writes, and whatever AC-6.2's load root implies? NG-6's title is still "Consumer-side generated state" while its body is now purely about install and upgrade, so the title over-promises relative to the text. Not a finding at REQ altitude, but the title is what a reader greps for. |
| Q-03 | Round-4's Q-02 stands unanswered and still non-blocking: AC-1.3's "no test corpus in the packed set" implies either a `files` field or an `.npmignore`, and M-ENG-11 records `files` absent at HEAD. |

## Positive Observations

- The erratum was fixed at the source rather than glossed downstream. NG-6's own wording was the
  defect; NG-6 is what changed. FSPEC BR-2.2 and BR-4.7 already said the honest thing and now
  inherit rather than contradict.
- Both channels of the read/write rule are now stated positively — install/upgrade touch nothing,
  a run reads `engine.*` and writes nothing — instead of one being defined as the negation of the
  other. Two positive statements are two testable statements; "not writing" was one.
- AC-3.5's added sentence *says why* the absence oracle needed pairing ("absence alone holds
  vacuously if the credential is never consumed"). Recording the reasoning, not just the fix, is
  what stops the pairing being deleted as verbose in a later compression pass.
- The (b) branch was written as a distinct *Given*, not as a clause on the same fixture. Two
  fixtures, two outcomes — the shape that can actually fail. Contrast AC-2.3, where the positive
  had to be split per leg for the same reason.
- The diff is minimal and the changelog is accurate to it. A four-item erratum round that touches
  exactly four places, with no opportunistic edits riding along, is cheap to confirm.

## Recommendation

**Approved with minor changes**

All four erratum items landed, and landed at the right document: the read/write muddle was NG-6's,
so NG-6 changed, and O-2's gloss now restates the scope instead of contradicting it. Re-grounded
against upstream — DEC-HE-02 still says the consumer file is the only config the engine reads, and
FSPEC BR-2.2/BR-4.7 already stated the scope reading — the REQ remains a faithful compression.
Nothing outside the four sites moved.

No High finding is open. The three Mediums and one Low are about assertability, not correctness:
name the locus that discharges "install and upgrade read nothing" (F-01), give AC-3.5(a) an
observable in AC-3.3's existing vocabulary and say whether the stub channel is its carrier (F-02),
and let the FSPEC's own confirmation carry E-18 and AT-3.5 up to AC-3.5's new strength (F-03).
F-04 is v4's still-open baseline authority overlap, re-recorded so it is not lost.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}
