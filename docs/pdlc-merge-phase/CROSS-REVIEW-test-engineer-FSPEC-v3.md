# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-merge-phase/FSPEC-pdlc-merge-phase.md` (v1.2, commit `518ec6a`)
**Date:** 2026-08-02
**Iteration:** 3
**Scope:** Delta-only re-review of the v1.1→v1.2 diff (§2.3, §3.1, §3.2, §8.3, §9.1, §11) against my
round-2 blocker F-10 and the two advisory Lows actioned with it. Testing lens only; no re-litigation
of sections approved in v2.

## Disposition of round-2 findings

| ID | Sev (v2) | Disposition | Evidence in v1.2 |
|----|---------|-------------|------------------|
| F-10 | Medium | **Resolved — three-way agreement holds** | The split is real and the three sites now say the same thing about the same input. §2.3's new prose scopes row 4's trigger to `state` alone and states that the parseability of `O1`'s other fields is decided **at the precondition that consumes them (7c), never silently**. 7c's `Failure resolves to` cell is split exactly as 7e already was: **`refused`** when either field is unretrievable or outside §3.2's recognised set, **`deferred`** only when both parse and the value is merely not mergeable (`CONFLICTING` / `DIRTY` / `BLOCKED` / `UNKNOWN` surviving §3.3). §3.2's `unknown resolves to` column now names the resolving step — "`refused` at §2.3 **7c**" — for `mergeable`, `mergeStateStatus` and `number` alike, so the fail-closed rule and the control flow point at one another rather than at nothing. §11 gains terminal row **11a** (`refused`, queue no, escalation no, resolving at §2.3 7c), and the header's exclusivity sentence is amended to "Rows 1–18, 11a included". I re-ran the input that had no home in v1.1 (`mergeable: "MAYBE"`): §3.2 → refused, §2.3 7c → refused, §11 → row 11a, escalation no. One row, one value, one assertion. Rows 11a / 12 / 13 partition the `mergeable`+`mergeStateStatus` domain without overlap — 11a is unparseable, 12 is parsed-and-blocking, 13 is the exhausted re-read loop — and §3.3's "a re-read that fails to parse … ends the loop with `refused`" lands on 11a rather than 13, consistent with both. |
| F-11 | Low | **Resolved** | §11 row 18's `Queue written` cell now carries the §2.5 exception verbatim — file unchanged and a plain note naming the status found for `pending` / `blocked` / `halted` — so a suite parameterised off the table no longer asserts a mutation §7.4 forbids. |
| F-12 | Low | **Carried to TSPEC (accepted)** | Noted as a deliberate entry obligation rather than a v1.2 edit. I agree it is TSPEC-shaped; see the rider in **N-02** below, which the obligation should carry with it. |
| F-13 | Low | **Resolved** | `O1` `number` gains a §3.2 row ("a positive integer", `refused` at 7c) with the reason stated — an unusable number would otherwise be written into the Evidence cell and three §9.3 escalation lines. |

## New-contradiction scan of the delta

I checked each changed site against the sections it now binds: §2.3 7c ↔ §3.2 ↔ §11 11a/12/13 (agree,
above); §3.1 `O4` ↔ §3.2 `O4` ↔ §8.2's report line ↔ §8.3's fetch (agree — `defaultBranchRef.name` is
now the single named source, and §3.2 makes its absence a `refused` at 7e, closing what was previously
an unsourced branch name in M3); §9.1's new `queueRow` paragraph ↔ §7.4's disposition catalogue ↔
O-M1 (agree — the four members are the same four, and "every other run's `queueRow` is unchanged"
keeps the halt path's value intact). No stale cross-reference survives the renumbering. Two riders,
neither blocking:

| ID | Severity | Scope | Note | Section ref |
|----|----------|-------|------|------------|
| N-01 | Low | Local | An unparseable `O1.number` has **two** resolving rows depending on an unrelated input, and the FSPEC does not say so. §3.2 sends it to 7c (row 11a, `refused`, no escalation), but `number` is also consumed *earlier*, by §3.1's `O5` fallback `gh api repos/{owner}/{repo}/pulls/{number}/files` — reached at the guard, §2.2 row **6**, ahead of 7c. So the same bad `number` resolves at **row 5** (guard fired on an unretrievable list, escalation **yes**) whenever the fallback is needed, and at row 11a otherwise. Exclusivity is not violated — §2.2's order decides, and both arms refuse — but a test author parameterising row 11a needs to know the fixture must not force the paginated fallback. One clause in §3.2's `number` row would say it. | §3.1 `O5`, §3.2 `number`, §11 rows 5/11a |
| N-02 | Low | Local | **Rider for the carried F-12.** v1.2 makes `O4.defaultBranchRef.name` the *only* source of the branch M3 fetches and checks out, and `O4` is observed at 7e — which the §2.2 row-5 already-merged path short-circuits past. So if the TSPEC resolves F-12 by saying M3 *does* run on the row-3 path (as §11's "over row 18 (or row 3)" implies for row 22), it must also say where the default branch name comes from there, since 7e never ran. If it resolves the other way (§2.5's "only the queue write-back"), row 22 must be narrowed off row 3. The obligation should carry this dependency, not just the M2/M3 question. | §2.5, §3.1 `O4`, §8.3, §11 header |

## Recommendation

**Approved with minor changes**

The round-2 blocker is genuinely closed, and closed structurally: 7c now mirrors 7e's split, §3.2
names the resolving step for every `O1` field it governs, and §11 carries the terminal row that was
missing — the three sites agree on value, escalation and resolving step for the input that previously
had none. The delta introduced no contradiction; it removed a latent one by sourcing the default
branch name from `O4`. N-01 and N-02 are single-clause precision notes, N-02 attaching to an already-
carried TSPEC obligation. Neither gates implementation.

## Verdict

VERDICT: APPROVED
{"high": 0, "medium": 0, "low": 2}
