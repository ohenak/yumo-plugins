# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.0, 477 lines / 52,052 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v5 finding is closed, plus a scan of the text added or rewritten since v5 for new issues. Sections unchanged since v1…v5 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `fc3410e..8d77618` (17 commits touching the REQ, including the **v2.0 altitude split**)
**Date:** 2026-08-01
**Iteration:** 6

## Disposition of v5 findings

All three are **closed**, and the Medium among them was closed twice over — once on the merits inside
v1.6, then again structurally by the v2.0 split, which moved the whole surface the finding lived on
into `REQ-RCV-07`. I verified the relocation rather than assuming it: a moved obligation that lands
nowhere is a silently deleted one, so for every row of §10's mapping table I opened the named
destination and confirmed the clause is there.

| v5 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-27 | Medium | **Closed, on the merits and then by relocation** | The substance landed in v1.6 before the split: `db65e27` made the unconfirmable-append residue *deleted, not left*, `8d70d40` **suppressed** the shipped generic recovery line rather than substituting it, `44280d7` gave §6's refusal-render rows the **two acts**, and `7a7b3b5` restored the **sequel leg** I asked for. All four now live in `REQ-RCV-07`, and I read them there rather than trusting the mapping table: **AC-7.5** carries act 1 and the byte comparison; **AC-7.6**'s row-B table gives the unconfirmable-append variant a *Recovery text* cell reading **"two acts in order"** pointing at catalogue §4; catalogue **§4** exists and fixes those bytes; and `REQ-RCV-07` **O-10** carries both legs I named — the torn-write legs *"parameterised over the truncation offset — inside the key, inside the value, newline lost, the well-formed `WINDOW-START: 1` case included"* **and** their sequel, *"asserted positively — the next entry **after act 1** finds `A < H`, clearance unspent … while the next entry **after act 1 skipped** finds `A = H`, `W` = 1 and the clearance gone: **the pair**"*. That pair is exactly the entry I said was where the clearance is actually lost, and it now has a positive oracle on both branches. The two incompatible readings of the same recovery-text assertion are gone with it, since one document now owns both legs. |
| F-28 | Low | **Closed, decisively** | 3 bytes of headroom became **9,388**: 477 lines / 52,052 bytes against 700 / 61,440. Both dimensions are now under the 90% soft threshold rather than against the hard ceiling, which is the state the size hook is designed to leave a document in. |
| F-29 | Low | **Closed** | §3.1's dangling *"depends on both"* is gone. The sentence now reads *"`pdlc-rcv-fixed-point-stop` depends on this REQ because both its tests are stated over `W`, and `pdlc-rcv-panel-topology` depends on the two of them"* — antecedent restored in its own sentence, and the §10 dependency edge it was shorthand for is untouched. |

Q-04 stays closed. Q-05 is **withdrawn** rather than carried a fifth time — the ordering question it
asked (a `HALT-REASON:` and an answering line written by the *same* entry) is now decided inside
`REQ-RCV-07` AC-7.5's write-then-confirm sequence and is that document's to answer. Carrying it here
would be filing a finding against a clause this REQ no longer owns.

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Verdict

_(pending)_
