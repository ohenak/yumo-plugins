# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 3
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `9b05e97..HEAD` — four document commits: `17abd84` (DEC-CONS-03 invoking-tree verb set,
`TSPEC:1620` citation, §2 provisional marker), `691af5d` (strike "no mutating git verb at all" in
DEC-CONS-04 and §11.2), `7bdb99a` (DEC-CONS-06 read-prompt oracle scoped to both read-path prompt
arguments), `6e66b25` (drop bare reviewer-question references). I read my v2 cross-review, ran
`git diff 9b05e97..HEAD` on the document, and confined this pass to the changed spans plus my three
v2 findings.

Changed spans: §2's DEC-CONS-01 row; §5 (DEC-CONS-03) domains 1, 2 and 3; §6 (DEC-CONS-04)'s
`git`-mediated-locking rejection; §7's hook-cost closing sentence; §7's differential paragraph;
§8 (DEC-CONS-06)'s two read-side bullets; §11.2's DEC-CONS-03 row. Everything else is untouched and
not re-litigated — DEC-CONS-01's residual and three-arm Testability, DEC-CONS-02, DEC-CONS-05's
post-edit-hook baseline, DEC-CONS-07's two accepted costs, §10, §11.1, §11.3.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-04 | Low | **Resolved, and beyond what I asked** | I asked for the negative arm to be stated as a file-wide grep *or* for `rtReadRange` to be named beside `rtReadProbe`. The revision took the second option and then showed the first would have been **wrong** — see F-07 below for the one claim inside that demonstration I cannot confirm. The oracle is now set-equal to the two-member read-path prompt set: `rtReadProbe` (`runtime-adapter.js:369`, prompt `:374`) and `rtReadChunk` (`:268`, prompt `:281`, reached via `rtReadRange` at `:346`). All four citations verified at HEAD. |
| F-05 | Low | **Resolved** | `grep -n "reviewer Q\|Reviewer Q\|Q-0"` over the document returns **nothing**. All three bare references are gone and each host sentence still reads as an assertion in its own right ("…so the two sections agree: three changes, one file, one owning task."; "…which would make the 'one predicate' claim unfalsifiable."). Dropped rather than qualified, which is what I preferred. |
| F-06 | Low | **Resolved** | §2's DEC-CONS-01 row now carries the parenthetical: "the `gh` half is settled; the `git` half is **provisional** pending §11.3 item 3 — `rtShellQuote` single-quotes every `_git` argv element, so shell expansion cannot carry it there". The index and §11.3 no longer disagree. |
| Q-04 / Q-05 | — | Still open, still not findings | Neither is answered in this revision and neither needs to be: Q-04 is a PLAN-sequencing question and Q-05 a release-note suggestion. I carry both forward unchanged. |

## Verification of the changed sections

Every new `file:line` and every new measurement in the revision was re-run against HEAD. All of the
following verified exactly as written:

- **`TSPEC:1619` is quoted correctly, cell for cell.** The row reads `| git, invoking tree | … |
  `add`, `commit` | `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index` |
  `checkout`, `switch`, `stash`, `reset`, `rebase`, merge verb |`. DEC-CONS-03 domain 1 now names
  two obliged verbs and five permitted reads — a set-equal transcription of that row, not a subset.
  "A bare `fetch` fails too, being in neither the obliged nor the permitted column of this domain"
  is right: `fetch` appears in the **clone** domain's permitted column (`TSPEC:1620`) and nowhere in
  `:1619`.
- **The withdrawal is the correct one, and the old line really was red on correct code.**
  `TSPEC §13.1 row 9` (`:2452`-region table, row 9) is the row about `read-auth` / `read-object` /
  `read-remote` / `read-index` — the **widenings** row, exactly as the revision now says. Citing it
  for "the closed invoking-tree read-verb set" understated the reads by two (`read-branch`,
  `read-status`) and omitted both obliged mutating verbs. `REQ:288` obliges the pass's own
  `git add -- {paths}` / `git commit -m {msg} -- {paths}`, so a v2-shaped "no mutating verb"
  assertion would have failed on the pass's own log commit. This is the second time in this document
  an author has found their own testability line red on correct code and said so; I regard that as
  the strongest signal in the revision.
- **`REQ:288` and the `commitQueueRow` precedent.** `REQ:288` carries the two-call pathspec-scoped
  shape verbatim. `commitQueueRow` is declared at `pdlc/workflows/orchestrate-queue.js:1576`, its
  `add` at `:1577`, its `commit` array spanning `:1580-1585` — the revision's `:1576-1585` span is
  accurate, and the shape it points at (`["add","--",queuePath]`, then `["commit","-m",…,"--",
  queuePath]`) is the shape `REQ:288` obliges.
- **`TSPEC:1620` for the clone domain.** Obliged `clone`, `create-branch`, `add`, `commit`, `push`;
  permitted `fetch`, `read-branch`, `read-status`; absent every merge verb — transcribed exactly.
  Citing the row rather than restating it is the right call for the reason the revision gives: a
  later widening of that row reds the assertion instead of drifting past it.
- **Domain 3's reconciliation with `TSPEC:1620`.** `:1620`'s classification cell does read
  "plus the `clone` call itself", so the earlier "the clone belongs to no verb set" — which I quoted
  approvingly in my v2 positives — genuinely contradicted the TSPEC. The revision withdraws it by
  name and re-states domain 3 as a shape assertion **in addition to** clone-domain membership. My v2
  positive observation was wrong on this point and the revision corrected it against me; I record
  that rather than quietly dropping it.
- **DEC-CONS-04's rejection survives the strike.** "Admits no mutating git verb **other than** the
  pathspec-scoped `add`/`commit` of the enumerated log paths" matches `:1619`'s obliged column, and
  the rejection is now explicitly stated to stand on its first ground alone (AC-1.3: never
  committed, `.gitignore`d). The decision is unchanged; only a false supporting clause was removed.
- **DEC-CONS-06's read-path prompt pair.** `rtReadChunk` is declared at `runtime-adapter.js:268`;
  its prompt line `Run these two exact commands from the repository root:` is at `:281`; the
  `sed -n '{first},{last}p' "${path}" | ${RT_SHA_CMD}` form at `:282` and the second `sed` inside the
  BOF/EOF block at `:283`. `rtReadRange` at `:346` calls it on its first line (`:347`). `rtReadProbe`
  at `:369`, prompt `:374`. Both are cwd instructions; neither carries a path-resolution clause.
- **The three-occurrence measurement, which is the load-bearing half of the new scoping argument.**
  `grep -n "Run this exact command from the repository root and report its output:"` returns exactly
  `:374`, `:618`, `:911`, and `rtListFiles` is declared at `:905`, so `:911` is inside it as claimed.
  A whole-file positive on that sentence would indeed survive `rtReadProbe`'s deletion. This ground
  alone carries the decision to scope both arms to the two prompt arguments.
- **§11.2's restated DEC-CONS-03 property.** Containment against `:1619`'s declared set, conjoined
  with a negative over the absent-always column, and an explicit note that the property is *not*
  "no mutating verb". Paired positive/negative on the same path, direction stated as containment so
  an unclassified verb reds. This is the shape §11.2's own preamble demands.

One new claim I could **not** confirm, and it points the opposite way from the document: see F-07.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
