# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-merge-phase/FSPEC-pdlc-merge-phase.md` (v1.1)
**Previous review:** `CROSS-REVIEW-software-engineer-FSPEC-v1.md` (v1.0, Needs revision)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** Delta re-review only — (a) whether each round-1 finding is genuinely resolved, (b) whether
the revision introduces a new blocking defect, with particular attention to §8.2's reversed M1–M5
ordering and its coherence with the queue driver's own M5 write and with the next feature's branch
point. Unchanged sections already reviewed are not re-litigated; product framing and test-pyramid
choices remain outside my lens.

## Disposition of round-1 findings

| ID | Sev (v1) | Disposition | Evidence in v1.1 |
|----|----------|-------------|------------------|
| F-01 | High | **Resolved** | §8.2 reverses the order: M3 (checkout + update default) now precedes M4 (queue write) and M5 (driver write), so both queue commits land on the same branch. The divergence is no longer silent — it is named, bounded ("ahead by one or two queue-row commits"), reported once per merged run, and reconciled by §8.3's replay. The durability question I asked is answered explicitly: the next pass reads the **file on disk**, and the commits reach the remote via the next feature's PR. See "New verification" below — that route is mechanically real, not asserted |
| F-02 | High | **Resolved** | The `prUrl` presence check is hoisted to §2.2 **row 3**, above `O1` (row 4) and the guard (row 6), with the reason stated ("every later row addresses the PR *by* `prUrl`"). §2.1, §2.2 r3 and §11 row 6 now all cite the same place; the dangling "§2.1 row for 'no PR'" and "§2.3 5a" references are gone |
| F-03 | High | **Resolved** | `mergeCommit` is added to `O1`'s command and `mergeCommit.oid` to its consumed fields (§3.1), its absence on an open PR is explicitly not a parse failure, and §7.2 defines both Evidence forms — `{shortSha} #{prNumber}` and the `merged #{prNumber}` fallback — plus a no-downgrade rule. §9.1 and AT-M2a agree; AT-M2's precondition is now reachable |
| F-04 | Medium | **Resolved** | §7.4 replaces "behaviour unchanged" with "**This is a change, and the FSPEC states it as one**", enumerates the four affected places, names the shared row transform's other three consumers (`in-progress` / `awaiting-merge` / `halted`) and states the evidence-free-call invariance as a **required property**, routed to §13 O-M2 |
| F-05 | Medium | **Resolved** | §9.4's note no longer names a status ("The queue row is unchanged; merge the PR to advance it"), and the paragraph beneath records exactly why hard-coding `awaiting-merge` would pin a false statement |
| F-06 | Low | **Resolved** | §11 row 23 added ("Run halted before Phase MERGE"), and the exhaustiveness claim is restated precisely: rows 1–18 terminal, 19–22 composable annotations, row 23 the one row whose outcome is `halted` |
| F-07 | Low | **Resolved** | §7.4's "Idempotence caveat" states the guarantee as **no semantic change**, byte-identity scoped to already-canonical rows |
| F-08 | Low | **Resolved** | §3.1 states `O3`'s owner/repo/number derivation from `prUrl` (number cross-checked against `O1.number`), a failed derivation yields `unknown`, and O-M3 carries the obligation |
| F-09 | Low | **Resolved** | O-M1 now names `rewriteStatus`, `_recordHalt` and `defaultRecordHalt` and asks explicitly whether the seam itself is renamed |
| F-10 | Low | **Resolved** | O-M7 added, naming the undeclared-default sleep seam and requiring the default-in-callee pattern |
| Q-01 | — | Answered | §8.2 chose the checkout-first arm and states the accepted consequence |
| Q-02 | — | Answered | §2.5 — `done` is written only over `in-progress`, `awaiting-merge` or `done`; `pending`/`blocked`/`halted` are left untouched with a note |

All three High and both Medium findings are closed. No round-1 finding remains open.

## New verification of the reversed ordering

I traced the new order against the shipped code rather than accepting it, because the whole of F-01
turned on where a commit ends up:

- **M3's checkout trips no guard.** `verifyFeatureBranch` (`orchestrate-dev.js:332`) is the only
  re-check and its single call site is `reviewLoop` entry (`:1931`). Phase MERGE is last and runs no
  review loop, so leaving `HEAD` on the default branch inside the phase cannot halt the run.
- **M5 sees M4's row.** The driver's post-pipeline `rewriteStatus` re-reads `queuePath` at write time
  (`orchestrate-queue.js:869`, and the docstring says the re-read exists precisely because the
  pipeline may have rewritten the file), so it reads M4's `done` row off the default branch and
  rewrites it idempotently. §7.5's "the two agree by construction" holds.
- **The next feature branches from the local default, so the commits do ride.**
  `ensureFeatureBranch` (`:264-310`) is called once at pipeline entry (`:4635`); for a feature whose
  branch does not exist it runs `git checkout -b feat-{feature}` from whatever `HEAD` is — which,
  after a merged run, is the local default branch carrying M4/M5. Phase DOD then rebases that branch
  onto `origin/<default-branch>` (`:3459-3462`), which replays those queue-row commits into the PR.
  §8.2's "they ride that feature's PR" is mechanically true, not merely hopeful.
- **The driver's own writes stay coherent.** `orchestrate-queue` performs no branch operations at
  all (no `checkout`/`rev-parse` in the module), so its pre-pipeline `in-progress` write also lands
  on the default branch — the same branch M4 later updates. No cross-branch split remains anywhere in
  the sequence.
- **The M3-failure arm is closed too.** §8.3 keeps `mergeStatus: merged`, still runs M4 on whichever
  branch `HEAD` is left on, escalates (§9.3 row 4, §11 row 22) and preserves the local feature branch
  (§6.4), so the disk row is correct and the operator is told which fact is outstanding.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-11 | Low | Local | **The default branch name has no source.** §8.3's M3 must fetch and check out *the default branch*, and §8.2's report line interpolates `{defaultBranch}` — but §3.1 declares six external surfaces and none supplies that name (`O4`'s `gh repo view` field list is the four capability booleans plus `deleteBranchOnMerge`), and no shipped script-side derivation exists: the only mention today is inside `ship-pr`'s prose instruction (`orchestrate-dev.js:3459-3462`), where an agent resolves it. Cheapest fix at this altitude is one clause — add `defaultBranchRef` to `O4`'s field list (§3.1) and let §3.2's fail-closed rule cover it — or, if the intent is `git symbolic-ref refs/remotes/origin/HEAD`, name that in O-M8 | §3.1, §8.2, §8.3, §13 O-M8 |
| F-12 | Low | Local | **§9.1's "three fields" misses a fourth report change.** The report already carries a `queueRow` field, hardcoded `"none"` on the success path with the comment "a successful run writes no status (`orchestrate-dev` owns no status write but the halt one — AC-2.7a)" (`orchestrate-dev.js:5209`). §7.5 supersedes exactly that criterion, so a merged run must report `recorded` / `recorded (uncommitted)` / `error` there. §11 rows 18/20/21 imply it and §7.4 defines the values, but no section says the field carries them — one sentence in §9.1 makes the site a reviewed change rather than a discovered one | §9.1, §7.4, §7.5 |
| F-13 | Low | Local | **§11 row 18's "Queue written: yes" is inaccurate for one §2.5 case.** §7.4's last disposition row — "row present in a status §2.5 does not overwrite" — routes to row 18 with "file unchanged; plain note". Row 18 reports "Queue written: **yes**", so the parameterised suite pinned to §11 would assert a write that correctly does not happen. Either give that case its own annotation row (alongside 19–22, all of which report `merged`) or footnote row 18's cell | §11 r18, §7.4, §2.5 |

No High or Medium findings.

## Questions

| ID | Question |
|----|---------|
| Q-03 | F-11 aside: is M3 expected to be script-side through the existing git seam (which is what §8.3's determinism and O-M8's "exact command sequence" imply), or an agent step like `ship-pr`'s rebase? The FSPEC reads as the former and I reviewed it that way; O-M8 is the right place to say so |

## Positive Observations

- The revision resolved the ordering defect by **changing the design**, not by qualifying the claim,
  and then stated the residual cost ("the consequence, stated and accepted") instead of hiding it.
  Every leg of that claim I could check against the code holds — see the verification section above.
- §2.2's row table is now genuinely evaluable top-to-bottom: `O1` observed exactly once at row 4,
  `prUrl` proven present at row 3, and the "nothing later runs, including…" column makes the
  short-circuit auditable per row.
- §7.4's re-framing is the most valuable edit in the revision: it converts an untrue invariance claim
  into an explicit blast radius plus a named property, which is exactly what the TSPEC needs.
- §3.3's pinned observation count (`1 + R`, "observations, not re-reads", `mergeableRetries: 0`
  deliberately unspecial-cased) remains the cleanest testability decision in the document.
- The entry-obligation table at §1 and the round-1 Q→section map at §13 make this delta review cheap
  to perform — every claimed resolution was findable in one hop.

## Recommendation

**Approved with minor changes** — no High or Medium findings remain. All three round-1 High findings
and both Medium findings are genuinely resolved, and the reversed §8.2 ordering is coherent with the
queue driver's M5 write, with `ensureFeatureBranch`'s branch point, and with the DOD rebase that
carries the local queue-row commits to the remote. F-11 through F-13 are one-clause corrections and
should be folded into the TSPEC pass rather than gating another FSPEC round.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 3}
