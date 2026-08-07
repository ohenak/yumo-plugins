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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The corrected verb-set property is containment-only, and containment alone is vacuously satisfiable.** §11.2's DEC-CONS-03 bullet, and §5 domains 1 and 2, now state the oracle as `observed ⊆ declared` plus "no verb from the absent-always column". Both conjuncts are satisfied by a pass that issues **no invoking-tree `git` call at all** — i.e. by a regression that silently drops the AC-1.3 log commit `REQ:288` obliges. The TSPEC does not have this hole: `TSPEC:2094-2098` specifies **four** set assertions, and the third is **obligation**, `obliged ⊆ observed` per domain "on the Given that obliges it". §11.2 is the section a PROPERTIES author inherits, and as written it transcribes only two of the four. One clause fixes it — add the obligation conjunct (`add` and `commit` observed in the invoking-tree domain; `clone`, `create-branch`, `add`, `commit`, `push` in the clone domain) and cite `TSPEC:2097`, so the property cannot green on a pass that did nothing | §11.2, DEC-CONS-03 bullet; §5 domains 1 and 2 |
| F-02 | Low | Local | **Domain 2 claims to cite where it in fact transcribes, and the difference is exactly the drift the sentence says it prevents.** §5 domain 2 reads "as `TSPEC:1620` enumerates it — obliged `clone`, `create-branch`, `add`, `commit`, `push`; permitted `fetch`, `read-branch`, `read-status`; absent every merge verb — **cited rather than restated**, so a later widening of that row fails the assertion instead of drifting past it". The list *is* restated inline, and a test written from this sentence will hardcode it, in which case a later widening of `TSPEC:1620` drifts past silently — the opposite of the stated property. The transcription is correct today (verified character-for-character against `:1620`), so nothing is wrong now; the wording is. Either drop the "cited rather than restated" clause, or state the pin the way §7 pins `CORPUS_GLOBS` and §9 pins the six terminal statuses: a transcription **with provenance** whose divergence from the cited row is itself asserted | §5, DEC-CONS-03 *Testability*, domain 2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Follows F-01, and is not a blocker.) §5 domain 3 already carries a positive occurrence conjunct — "exactly once per pass". Is the intent that the obligation conjunct for domains 1 and 2 lives only in the TSPEC (`:2097`), with DECISIONS §11.2 summarising the containment half? If so, saying that in one clause is enough; what I want to avoid is a PROPERTIES author reading §11.2 as the whole contract |
| Q-02 | §8 scopes the read-path oracle to `rtReadFile`'s two prompts. Two other adapter functions also interpolate `${path}` into a transported command — `rtHashFile` (`:613`, prompt `:618-620`) and the `_checkFile` transport (`check:${path}`, `:823-825`). Neither is `rtReadFile`, so excluding them from DEC-CONS-06's oracle is right; but does any absolute path (a `_makeTempDir` reply) ever reach `_checkFile` or `_hashFile` in this feature? At HEAD's spec the only `_checkFile` consumer is the marker take on a repo-relative path (`TSPEC:912-919`, `:969-971`), so the answer looks like "no" — a one-clause confirmation in §8 would close it permanently rather than leaving it to be re-derived |

## Positive Observations

- **F-01 was fixed at the level of the defect, not the sentence.** The revision did not merely swap
  the cited row — it named *why* §13.1 row 9 was the wrong authority (it is the widenings row, not
  the domain's set), stated the consequence that made it a blocker ("red on correct code, failing on
  the pass's own log commit"), moved the falsifying force onto the absent-always column, and settled
  the containment-vs-exclusion direction against §11.2. Every one of those four moves reproduces
  against `TSPEC:1619`, `REQ:288` and `orchestrate-queue.js:1576-1585`.
- **The three sites that had to agree now agree.** F-02's "no mutating git verb at all" appeared in
  §5, §6 and (implicitly) §11.2; all three are corrected in the same revision, and §11.2's version
  carries the explicit warning "the property is *not* 'no mutating verb'". A correction that fixes
  only the site the reviewer quoted is the usual outcome; this one did not.
- **§8's F-04 fix is stronger than the finding asked for.** I asked for the conjuncts to be scoped to
  `rtReadProbe`'s prompt argument. The revision scopes them to a *set-equal pair* of read prompts,
  which is the right shape — it discovers `rtReadChunk` (a prompt I had not named), states the
  scoping as load-bearing in both directions, and keeps the "red on this feature's own correct code"
  hazard visible in the text rather than fixing it silently. The second positive is extended to
  `rtReadChunk`'s `sed` forms too, so the measurement conjunct covers both members.
- **The `DEC-CONS-01` index row is now honest about a half-settled entry.** Marking the `git` half
  **provisional** in §2 — where a reader who never reaches §11.3 will see it — is the difference
  between a decision index and a decision advertisement. The technical claim behind it holds:
  `rtGit` maps argv through `rtShellQuote` (`:949`, `:668-670`), so shell expansion genuinely cannot
  carry the token there.
- **Withdrawals are still recorded rather than overwritten.** Three more this round ("an earlier
  draft of this line cited TSPEC §13.1 row 9 … that is **withdrawn**"; "an earlier draft said 'admits
  no mutating git verb at all'; that is withdrawn as false of the domain"; "an earlier draft's 'the
  clone belongs to no verb set' is withdrawn as a mis-statement"). For a test author, a document that
  says what it used to claim wrongly is worth more than one that merely reads correctly.

## Recommendation

**Approved with minor changes** (0 High, 0 Medium, 2 Low).

All four v2 findings are closed, the single blocker (F-01) is closed at the level of the defect
rather than the sentence, and every measurement the replacement text asserts reproduces at HEAD —
`TSPEC:1619`, `TSPEC:1620`, `REQ:288`, `orchestrate-queue.js:1576-1585`, `runtime-adapter.js:268`,
`:281-283`, `:346`, `:369`, `:374`, `:618`, `:805`, `:911`, `:949`, `:668-670`. Nothing in the
revision broke an unchanged section: the §2 index row, §3's residual and §11.3 item 3 now say the
same thing about the credentialed `git` push, where before only the last two did.

The two remaining items are Low and neither disputes a decision:

1. **F-01** — add the obligation conjunct (`obliged ⊆ observed`, `TSPEC:2097`) to §11.2's
   DEC-CONS-03 property, so the containment property cannot green on a pass that issues no
   invoking-tree `git` call at all. One clause.
2. **F-02** — drop or restate §5 domain 2's "cited rather than restated" claim, which the same
   sentence's inline transcription contradicts.

Neither needs another review round; both are safe to fold into the optimizer pass that carries this
document into Phase P.

## Verdict

VERDICT: Approved with minor changes
