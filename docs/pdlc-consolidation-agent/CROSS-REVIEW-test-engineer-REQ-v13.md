# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 13
**Scope:** Local (Scope tags per finding below)
**Delta base:** `455929d` (the tree v12 reviewed) → HEAD

## Delta

Delta re-review, and the delta over the document under review is again **empty**.
`git diff 455929d..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` produces
no output, and `shasum -a 256` over the REQ at HEAD returns
`0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17` — byte-for-byte the
`APPROVAL-HASH` recorded in v12 (`CROSS-REVIEW-test-engineer-REQ-v12.md:157`) and in v11 before it.
The REQ has now been unchanged across three consecutive reviewer rounds.

`git diff --stat 455929d..HEAD -- pdlc/` is likewise **empty**: no shipped code moved, so every
`file:line` citation in the REQ that I re-verified at v12 resolves to the same bytes by
construction. I re-ran the four load-bearing ones anyway (listed under Positive Observations) —
a stat-empty diff is a strong argument, but the citations are the REQ's claims about existing
behaviour and they are cheap to re-run.

What *did* change between the two reviewed trees, and is therefore the only material this round has
to scan:

| Changed path | Nature |
|---|---|
| `docs/pdlc-consolidation-agent/FSPEC-…md` + ten FSPEC cross-reviews | Phase F work — downstream of this REQ, not reviewable here |
| `docs/pdlc-consolidation-agent/POSTMORTEM-F-…md` | Phase F second-halt postmortem (rounds 6–10) |
| `docs/_decisions/DECISIONS-review-convergence.md` | **New file** — DEC-CONV-01, approval carry-forward |
| `docs/_decisions/DECISIONS-review-severity-bars.md` | **+22 lines** — DEC-SEV-02 appended |
| `docs/_queue/QUEUE.md` | row 15 halted → pending → in-progress |

Neither governed `docs/_constraints/` file moved (`git diff --stat 455929d..HEAD --
docs/_constraints/` is empty), which is what pins all three carried findings to their prior state.

Two of those changes are project-level decisions that a reviewer is instructed to read at dispatch,
so I read them and applied them rather than noting their existence:

- **DEC-CONV-01** (`docs/_decisions/DECISIONS-review-convergence.md:11-40`) makes an approval
  **stand** into later rounds of the same phase, re-opened only by the same reviewer and only when
  the intervening diff touches a section the approval's `Scope` named, or that reviewer files a new
  Medium-or-higher against the intervening diff. Neither trigger fires here: the intervening diff
  touches no section of this REQ at all, and I file no new finding. My v12 approval therefore
  **stands**, and this review re-issues it — which is exactly the case DEC-CONV-01 was written for.
- **DEC-SEV-02** (`DECISIONS-review-severity-bars.md:39-52`) can only lower a severity, never raise
  one: it reclassifies falsified bookkeeping-completeness assertions from Medium to Low. All three
  carried findings are already Low, so it is inert on this review. I checked rather than assumed —
  a new severity rule arriving mid-window is precisely the thing that could silently retune a
  verdict.

Two consequences, stated plainly rather than inferred:

1. **Nothing can have been broken.** There is no changed section of the REQ to scan, so this review
   opens no new finding ids. F-57+ remains unused.
2. **Nothing can have been fixed either.** The three v12 Lows are re-verified against the files they
   are about — not against v12's prose — and all three are open in exactly the state v12 left them.

## Prior findings

Each carried finding is re-checked against the file it is about, at HEAD.

| ID | Sev | Disposition | Evidence at HEAD |
|---|---|---|---|
| F-54 | Low/Cross-Feature | **Open — unchanged** | `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` still reads `\| Version \| 1.0 · 2026-08-06 \|`, while the change-control clause that makes an unbumped content change a defect is still the text at `:19` ("Consumers cite this file **at its `Version`**; a content change that is not accompanied by a version bump is itself a defect"). The three REQ citations still pin the unbumped `1.0`: AC-1.5 (`:202`), REQ-CONS-06's preamble (`:448`), the honest-limit line (`:474`). Still Low on DEC-SEV-01's test, re-derived below. |
| F-55 | Low/Local | **Open — unchanged** | §4b still widens ownership across both governed files (`:558-559`) while the enumeration/prose classification that follows (`:560-563`) names neither, and the set-equality oracle range still resolves only through the `Version 1.4` pin (`:564-565`). That pin is still decidable: `pdlc-consolidation-vocabularies.md:7` carries `1.4`, `pdlc-advisory-corpus-baseline.md:7` carries `1.0`. §5 (`:585-586`) still describes both files in identical words. |
| F-56 | Low/Process | **Open — measurement unchanged** | `wc -l -c` at HEAD: **637 lines / 61,109 bytes**, identical to v11 and v12, against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) and past both soft thresholds `SOFT_LINE_LIMIT=630` / `SOFT_BYTE_LIMIT=55296` (`:47-48`). Margin **331 bytes**, flat across rounds 11→13. |

The dispositions are identical to v12's because the inputs are identical: the REQ did not move, and
neither did either governed constraints file. I record that as a re-verification, not a carry-over —
each row above was re-read at HEAD this round.

## Findings

No new findings — there is no changed text in the document under review for a new finding to be
about. The three carried forward are restated so this table stands on its own; ids are never
renumbered across rounds.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-54 | Low | Cross-Feature | The baseline file's content changed under a frozen `Version`, and the clause making that a defect is the paragraph the same commit added, so the file breaches its own rule; the REQ pins the unbumped `1.0` in three places. Fix: `1.0` → `1.1` in the baseline header and repin the REQ's two version-pinned citations. | `docs/_constraints/pdlc-advisory-corpus-baseline.md:7`, `:19`; REQ `:202`, `:448`, `:474` |
| F-55 | Low | Local | §4b's ownership sentence spans both governed files, but the enumeration/prose classification and the set-equality oracle range built on it were written for one. Read literally it puts the baseline file's §1 under a row oracle at a `Version` that file does not carry. Decidable today only via the `Version 1.4` pin. Fix: name the vocabularies file in the classification sentence, and add to §5 that the baseline's four owned sections carry no row oracle. | REQ §4b (`:558-565`), §5 (`:585-586`); `pdlc-advisory-corpus-baseline.md:17-19` |
| F-56 | Low | Process | The REQ sits at 61,109 / 61,440 bytes — a 331-byte margin against a warn-only budget; the trend across rounds 9→13 is 387 → 344 → 331 → 331 → 331. Not a delivery risk: `check-req-size.sh` emits a `PostToolUse` `additionalContext` line and `exit 0` on every path. Filed to keep the headroom visible to whoever lands F-54/F-55 (~44 bytes together, which fit). | Whole document; `pdlc/hooks/scripts/check-req-size.sh:41-42`, `:47-48` |

**Why no finding was upgraded on a third no-change round.** Severity is a property of the defect,
not of how many rounds it has survived, and a document that did not move earns neither a better
verdict nor a worse one. I re-applied `DEC-SEV-01`'s test
(`docs/_decisions/DECISIONS-review-severity-bars.md:24-30`) — "does this leave a downstream author
unable to make a decision today?" — rather than citing the label:

- **F-54.** A PROPERTIES or TSPEC author transcribing an expected value from the baseline file
  transcribes §1's fate table, §2's absent-at-HEAD facts, §3's ladder or §4's limit. All are
  byte-identical across the diff that broke the version rule, and the file declares itself outside
  any row oracle (`:17-19`), so no expected value is wrong today. It is a self-breach of a
  governance clause, not drift any oracle can observe.
- **F-55.** The range clause pins `Version 1.4`; only the vocabularies file carries 1.4
  (`:7`), and the baseline states the answer in its own words. The oracle's subject is recoverable —
  the author cross-reads two documents to be sure, which is friction, not a block.
- **F-56.** A headroom measurement inside a budget that cannot fail a build.

`DEC-SEV-02` (`:39-52`), new since v12, is inert here: it moves findings *down* from Medium, and all
three of mine are already Low. No new rule in the intervening diff raises any of them.

## Questions

## Positive Observations

## Recommendation

## Verdict
