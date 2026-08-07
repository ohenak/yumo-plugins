# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 3
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v2.md`. Diff base
`771d6b86` (the commit at which v2 was completed) → HEAD; four revision commits touched this
document (`17abd84d`, `691af5dc`, `7bdb99a7`, `6e66b256`), +38/−17 lines. Testing lens only:
whether each v2 finding is closed, and whether the changed text introduced a new oracle that
cannot fail or a claim the code contradicts. Unchanged sections approved earlier are not
re-litigated.

## Disposition of v2 findings

| v2 ID | Severity | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | §5 domain 1 now asserts containment against the *whole* invoking-tree row of TSPEC §9.3, and the row it names reproduces exactly: `TSPEC-pdlc-consolidation-agent.md:1619` obliges `add`, `commit` and permits `read-branch`, `read-status`, ⊕`read-object`, ⊕`read-remote`, ⊕`read-index`, with `checkout`, `switch`, `stash`, `reset`, `rebase`, every merge verb absent-always. The obliged pair is grounded, not asserted: `REQ-pdlc-consolidation-agent.md:288` requires `git add -- {paths}` *and* `git commit -m {msg} -- {paths}`, and the precedent `commitQueueRow` really does have that two-call shape (`pdlc/workflows/orchestrate-queue.js:1576` add, `:1580-1585` commit). The mis-cite of §13.1 row 9 is withdrawn in terms, the falsifying force is moved onto the absent-always column, and the direction is stated as containment per §11.2 — which is what Q-01 asked. The new sub-claim "a bare `fetch` fails too" is true of this domain: `fetch` appears in `:1620`'s permitted column, not `:1619`'s. The assertion is no longer red on a correct pass |
| F-02 | Low | **Resolved** | Both sites are fixed, not one. §5 domain 1's trailing clause is gone, and §6's alternatives bullet now reads "admits no mutating git verb **other than the pathspec-scoped `add`/`commit` of the enumerated log paths** (`TSPEC:1619`'s obliged column, `REQ:288`)", explicitly withdrawing the earlier wording and re-stating that the rejection stands on the AC-1.3 ground alone. §11.2's DEC-CONS-03 bullet carries the same correction ("the property is *not* 'no mutating verb'"), so the three sites now agree |
| F-03 | Low | **Resolved** | (i) Domain 2 now cites and enumerates `TSPEC:1620` — obliged `clone`, `create-branch`, `add`, `commit`, `push`; permitted `fetch`, `read-branch`, `read-status`; absent every merge verb — which transcribes that line exactly. (ii) "The clone belongs to no verb set" is withdrawn and replaced by the reconciliation I asked for: `TSPEC:1620` bins the clone call ("plus the `clone` call itself") and domain 3 is stated as "a **shape assertion in addition to** that membership, not a fourth domain". A test author holding both documents now gets one classification |
| F-04 | Low | **Resolved** | Both arms are scoped to the read path's prompt arguments, and every measurement in the replacement reproduces: `"Run this exact command from the repository root and report its output:"` occurs at `runtime-adapter.js:374`, `:618`, `:911` — three times, `:911` inside `rtListFiles` (`:905`) as claimed; `"relative to the repository root"` occurs exactly once, `:805`, inside `rtWriteFile` (`:802`). The second prompt is real and correctly located: `rtReadChunk` at `:268`, reached through `rtReadRange` at `:346`, prompt `"Run these two exact commands from the repository root:"` at `:281` over `sed -n '…p' "${path}" | ${RT_SHA_CMD}` at `:282-283`. Neither read prompt carries a resolution clause. The scoping choice is now stated as load-bearing in both directions, including the "red on this feature's own correct code" hazard |
| Q-01 | — | **Answered** | Containment against the permitted-plus-obliged set, with exclusion of the absent-always column as the falsifier — stated explicitly in §5 domain 1 and §11.2 |
| Q-02 | — | **Answered in part** | §3's `rtEnvPresent` source pin is unchanged (still "asserted as an adapter-source read in the same style as DEC-CONS-06's pin"); §11.1 was not extended to name it as an owned conjunct. Not re-raised — §11.1's ownership rows are PLAN-layer detail, and the pin is named in the entry that owns it |

All four v2 findings closed. Two further checks on text that changed for other reasons: the new
`DEC-CONS-01` "the `git` half is **provisional**" qualifier in §2 is accurate — `rtGit` really does
map every argv element through `rtShellQuote` (`runtime-adapter.js:949`, quoting at `:668-670`), so
a `$VAR` in a `_git` argv is transported literally — and it now matches §3's residual paragraph and
§11.3 item 3 rather than over-claiming against them. The two dropped `(reviewer Q-0N)` parentheticals
in §7 remove nothing but the dangling reference.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
