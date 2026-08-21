# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4
**Scope:** Technical lens; delta re-review of v1.5 against my v3 findings (F-01..F-03).

## Findings Disposition

**Delta base:** v3 reviewed `f256d767`; this revision is `b5715498..1b24056a` (6 commits touching
the REQ), document version 1.4 → 1.5. Every check below was re-run against the **default branch**
(`git show main:pdlc/workflows/orchestrate-dev.js`), because this branch's tree is 1,637 commits
behind and does not carry the mechanism at all (BL-04, §5) — `git rev-list --count HEAD..main`
returns `1637`, so the REQ's own branch-base note is still exact.

| v3 finding | Sev | Disposition | Evidence |
|----|-----|-------------|----------|
| F-01 — §1 deleted the gate-mode precondition and asserted the write is guarded by the git transport, not the gate mode | High | **Resolved — and my finding was wrong; the document was right** | See below. The revision keeps the v1.4 claim (correctly) and adds a re-derivable, greppable anchor that names exactly how I misread it. |
| F-02 — OQ-1's grep recipe matched one banner, not two | Low | **Resolved** | Recipe now greps `to force a`: `grep -n "to force a" main:orchestrate-dev.js` returns exactly two hits, `:15331` (complete-record skip, inside the `allWavesRecorded` arm) and `:15342` (mid-plan resume, the `else` arm). `grep -c "to force a full run"` returns `1`, matching only `:15342` — precisely as the new text states, including the reason (the skip banner wraps `to force a ` / `full run.` across `:15331`–`:15332`). The recipe now reproduces what the sentence claims. |
| F-03 — "discard" mis-described item 1, which is never-written, not discarded | Low | **Resolved** | Preamble now reads "**one prevents it from ever being written, two discard what was written** — two shapes, two oracles" (§1). The writer/reader split I asked for is explicit, and the added "two oracles" clause hands FSPEC the reason the split matters. |

### F-01 was a false positive on my part — recorded, because the correction is load-bearing

My v3 High claimed `writeWaveLedger` (`main:pdlc/workflows/orchestrate-dev.js:15600`) is nested
inside **both** `if (scriptGate)` (`:15432`) and `if (waveGit)` (`:15531`), and that a degraded-gate
run therefore records nothing. That is false. The `scriptGate` block **closes at `:15494`**, after
its own `else` arm at `:15492` (`evaluateBatchGate(waveResults, waveIndex, wave)` — the self-report
gate). `if (waveGit)` at `:15531` is a **sibling** of it, not a child.

Mechanical re-check (brace-depth accumulated from `:15432`, counting `{` and `}` per line, which is
the step my v3 check got wrong by not accounting for the `else`):

| Line (`main:pdlc/workflows/orchestrate-dev.js`) | Depth after line | Source |
|---|---|---|
| `:15432` | +1 | `if (scriptGate) {` |
| `:15492` | +1 | `} else {` — the self-report arm |
| `:15494` | **0** | `}` — `scriptGate` block **closed here** |
| `:15531` | +1 | `if (waveGit) {` — opens at depth 0, a sibling |
| `:15600` | +1 | `await writeWaveLedger(` |
| `:15604` | 0 | `}` — `waveGit` block closes |

So v1.4's claim — the write is guarded by the git transport, not by the gate mode, and a
self-report-gate run *with* a transport records normally — is correct at HEAD of the default
branch, and REQ-WVR-09's premise (`:15211-15215`'s "verified but NOT committed" notice path)
stands. v1.5 does not merely restate it: it adds the anchor that makes it checkable in one grep —
the comment `Only now — verified — does anything get committed` (`:15530`, `grep -c` returns `1`,
so it is unique) opening the write's branch, plus the fact that the gate-mode branch "closed at its
own `else` (the self-report arm)". Naming the misreading in the text is the right disposition: the
next reviewer who repeats my arithmetic gets stopped by the document.

## Findings

No High findings. Three Low findings, all in sections this revision changed; none gates approval.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | §10's new readiness sentence says BL-01..BL-03 are "resolved at HEAD" without saying *whose* HEAD. §5's own correction is careful here ("already exist at HEAD of main"); §10 drops `of main`, in a document whose branch-base note exists precisely because this branch's HEAD carries none of it. | §10 Traceability, readiness sentence |
| F-02 | Low | Process | The shipped shape that produced my v3 false positive — a long `if (scriptGate) { … } else { … }` gate block whose close is 100 lines above a sibling `if (waveGit) {` — is a durable reviewer hazard, not a one-off. Nesting claims about this file should be settled by a structural check (brace-depth accumulation that counts the `else` close, or an AST/`node --check` slice), never by eyeballing two `if` lines and their indentation. | §1 item 1 / reviewer process |
| F-03 | Low | Local | The OQ-1 edit left one ~140-column unwrapped line ("`run" matches only the second, the skip banner wrapping it across a line break). No config value can force a full run today — …`"), where the rest of the file wraps near 95. Cosmetic, but it makes the next `git diff` of that bullet a whole-paragraph diff. | §9 OQ-1 |

### F-01 — "at HEAD" is ambiguous in the one document that cannot afford it (Low, Local)

§10 now reads: "Readiness over the whole §5 table (TE H-02): BL-01, BL-02, BL-03 resolved at HEAD;
BL-04 open, discharged at FSPEC authoring and **not** a pickup gate — so `ready: true` is accurate
today." The substance is right and I verified each half:

- BL-01/BL-03 resolved on the default branch — `implementation.startWave` and the INTERIM ledger
  are both live there (`main:pdlc/workflows/orchestrate-dev.js`, `explicitPointer` and
  `writeWaveLedger`); §5's correction says so explicitly.
- BL-02 resolved — `main:docs/_constraints/pdlc-wave-gate-baseline.md` exists at `Version | 1.2 ·
  2026-08-20`.
- BL-04 open and non-gating — `git rev-list --count HEAD..main` = `1637`; §5's Gating logic cell
  says "Checked at FSPEC authoring", not "before pickup", so it does not contradict `ready: true`.
- `ready: true` and the queue row agree — REQ frontmatter line 3, and `docs/_queue/QUEUE.md:45`
  carries `| 20 | pending | pdlc-wave-resume | … |`, matching "Order 20".

The nit is only the bare word "HEAD". This REQ's whole branch-base note (§ header) turns on the
distinction between the default branch's HEAD and this branch's HEAD, where BL-01/BL-03 are *not*
resolved. Writing "resolved at HEAD of the default branch" costs four words and removes the one
reading a `ready: true` reviewer could take wrongly.

### F-02 — settle nesting claims structurally, not by inspection (Low, Process)

Recorded for harvest rather than for the author: the artifact needs no change. In v3 I filed a High
against a true statement because I read `:15432` and `:15531` as nested on the strength of two `if`
lines and their apparent indentation, and did not account for the `else` at `:15492` that closes the
outer block at `:15494`. The REQ's author caught it and re-derived the shape correctly. Two durable
consequences:

- Any future claim about *this* file's control flow (it has 16,336 lines and deeply nested
  wave-loop bodies) should be backed by an accumulation over `{`/`}` from the opening line to the
  claimed child, or by a parser — the check I ran this round, which takes one command.
- The document-side mitigation the author chose is the right pattern to keep: cite the branch by a
  **unique comment string** (`Only now — verified — does anything get committed`, one hit) rather
  than by a line number or a nesting assertion, so the reader re-derives the shape instead of
  trusting either of us.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Now that the guard is settled as the git transport only, does FSPEC owe an explicit statement that a **self-report-gate run with a transport** both commits and records — or is it enough that §1 item 1 says so? I lean explicit: it is the arm most likely to be dropped by an implementer who reads "script-owned gate" as a precondition of the ledger, and it is cheap to pin as one AC-level behaviour rather than a paragraph in Problem/Context. |
| Q-02 | (Carried from v3 Q-02, still unanswered and still non-gating.) REQ-WVR-02's IG table lists IG-4 (over-range) before IG-5 (ancestry), but the shipped ladder tests ancestry first (`main:…/orchestrate-dev.js:15307`) and over-range second (`:15315`), so a record that is both non-ancestral *and* over-range announces the ancestry reason. The REQ makes no ordering claim, so nothing is wrong — but PROPERTIES will need to know whether the catalogue order is normative or presentational. Worth one sentence in FSPEC. |

## Positive Observations

- **The revision corrected the reviewer, with evidence, instead of complying.** Faced with a High
  from me, the author re-derived the control flow, found my brace arithmetic wrong, kept the true
  claim, and added the anchor that makes the misreading unrepeatable — naming it inline ("where
  this guard has been misread as the gate mode's (SE F-01)"). That is the correct response to a
  wrong review, and it is a harder one to write than a compliant edit. I re-checked it mechanically
  before writing this: `scriptGate` closes at `:15494` via its `else` at `:15492`; `if (waveGit)`
  at `:15531` is a sibling; the write at `:15600` sits under the transport guard alone.
- **The new citation form is the strongest in the document.** A unique comment string
  (`grep -c` = 1) plus a structural relationship ("a sibling of the gate-mode branch, which closed
  at its own `else`") survives both line drift *and* re-review by someone with a different mental
  model of the file. It is strictly better than the `file:line` anchors this REQ has been retiring
  since v1.3, and better than a symbol name where the symbol is not the thing being located.
- **F-02's fix chose the recipe that reproduces the claim, not the recipe that reads well.**
  Greppinng `to force a` (two hits) and then explaining why `to force a full run` gives one is more
  words than the original, and it is the version that survives someone actually running it. The
  line-break explanation is correct down to the concatenation (`:15331` ends `…to force ` and
  `:15332` opens `full run.`).
- **The never-written / discarded split is now stated as a testability property, not a taxonomy.**
  "two shapes, two oracles" tells the FSPEC author *why* the split has to survive into the spec —
  the writer-side precondition and the reader-side invalidations need different oracles — which is
  more than the wording change I asked for.
- **Still no contract material leaked downward, five revisions in.** The ten ACs name no seam
  signature, no file schema, no algorithm; the new mechanical detail landed in §1's problem
  statement and §9's obligations, where TSPEC will find it, and not in an AC.

## Recommendation

