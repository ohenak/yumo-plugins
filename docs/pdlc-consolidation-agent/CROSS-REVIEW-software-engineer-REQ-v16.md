# Cross-Review: software-engineer — REQ (delta re-review, iteration 16)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md
**Date:** 2026-08-06
**Iteration:** 16
**Scope:** Delta re-review only. I re-read my v15 review, diffed the REQ against the commit that
review pinned, and re-grounded against everything that landed on the branch since. I did not
re-review unchanged sections I approved at v14/v15.

## Delta under review

**The delta is empty. The REQ has not changed since the commit my v15 approval pinned.**

| Probe | Result |
|---|---|
| `git log --oneline -- REQ-pdlc-consolidation-agent.md` | newest commit is `7c1e0cfb` (`REQ erratum v2.1 — §4b decides the unreadable-corpus question`) |
| v15's `REVIEWED-COMMIT` | `7c1e0cfb224e2f2d45b81fb1f1c912c6037cdc75` — the same commit |
| `git diff 7c1e0cfb..HEAD -- …/REQ-…md` | empty |
| `shasum -a 256` of the file at HEAD | `c21f8a42bd766aa28deec9f5de1488c194452c0e7e3c52c5c0b8f26b34d9ffd0` |
| v15's `APPROVAL-HASH` | `sha256:c21f8a42…d9ffd0` — **byte-identical** |

So this iteration is not re-reviewing a revision. Phase R re-entered after `POSTMORTEM-P` was
resolved (`760ae1c6`), and the document it re-enters on is the one I approved at v15 with the
approval anchors still valid against its bytes. My v15 verdict therefore stands on its own terms,
and the only work left for this round is the one thing a delta re-review can still be wrong about
when the document did not move: whether something *else* moved underneath it.

## Re-grounding against what landed since v15

`POSTMORTEM-P`'s RC-1 is precisely the failure mode "the document did not move, so nothing to check"
produces, and `DEC-ERR-01` (`docs/_decisions/DECISIONS-review-severity-bars.md:87-100`, landed
`760ae1c6`) now makes re-grounding an obligation rather than a courtesy. I applied it in the one
direction available to a REQ — the REQ has no upstream spec, so I re-grounded against (a) the
project-level decisions that landed since v15, and (b) the mechanism claims the REQ makes about
existing code, re-measured at HEAD rather than trusted from v15.

### (a) New project-level decisions — no violation

| Decision | Where | Does the REQ collide? |
|---|---|---|
| `DEC-ERR-01` — a settled upstream question is absorbed, never routed | `DECISIONS-review-severity-bars.md:87-100` | No. It governs erratum-round conduct, not REQ content. The REQ routes nothing upstream (it has no upstream) |
| Companion to `DEC-LAYER-01` — a multi-layer erratum wave propagates downward in order | `DECISIONS-spec-layer-boundary.md:57-62` | No. Same: a protocol obligation on the channel, with no clause the REQ's text can contradict |
| `CLAUDE.md:93` erratum re-grounding paragraph; the three `SKILL.md` "Erratum Rounds — Re-ground Upstream First" sections | `CLAUDE.md:93`, `pdlc/skills/{pm,se,te}-author/SKILL.md` | No. All four are process guidance |

Worth stating explicitly because it is the trap: none of these four is a *deliverable* the REQ's §5
scope must name. They are countermeasures the `POSTMORTEM-P` resolution landed on this branch, not
outputs of the feature the REQ specifies. §5's deliverable set does not need to grow to cover them.

### (b) The downstream decision that could have made the REQ stale — it does not

`FSPEC` v11.3's `BR-14a` (`FSPEC:2551`) decides the marker is released by an **in-place write** of
`RELEASED: {passId} {ISO-8601}`, "never by removing the file, which no seam can do", and `E-11b`
(`FSPEC:2645`) decides a `RELEASED:` marker is taken like an absent one at any age with no reason
code. That is the decision whose non-absorption halted Phase P, so the first question worth asking is
whether the REQ — one layer above — states the losing form anywhere.

**It states the winning form, twice, in the AC that owns it.** AC-1.3 at `:179-180`: "taking and
releasing it are in-place rewrites of a whole small file", and again at `:208`: "the marker lives in
`.consolidation-lock` (its take and release are in-place edits)". `BR-14a` is a refinement of that,
not a contradiction of it — the FSPEC pins the payload the REQ left open, which is exactly the
layering `DEC-LAYER-01` prescribes. `:214`'s "An operator may also clear it by deleting
`.consolidation-lock`" is not in tension either: `BR-14a`'s "no seam can" is a statement about the
pass's seams, and an operator with a shell is not one of them.

One incidental gloss does use the losing verb — `:316`, "the AC-1.3 marker is written and **removed**
inside the pass". Filed below as F-05, at Low: the sentence's load-bearing claim is "never
committed", the release form is normatively owned two hundred lines above and states the opposite
verb, and no downstream task is authored against `:316`. This is the whole difference between it and
`TSPEC:2592-2608`, which `POSTMORTEM-P` scored as blocking — that one was a *hand-off* section the
PLAN reads, and it stated the question as still open.

### (c) Mechanism claims re-measured at HEAD

Not re-argued from v15 — re-run. Every one still holds:

| REQ claim | Cite | At HEAD |
|---|---|---|
| commit precedent is `commitQueueRow`'s two-call pathspec shape | `:312` → `orchestrate-queue.js:1576` | `async function commitQueueRow(...)`; `add ["add","--",queuePath]` at `:1577`, `commit … "--", queuePath` at `:1580-1585` — as described |
| the advisory-record commit mirrors it | `:313` → `:1615` | `async function commitAdvisoryRecord(recordPath, feature, gitFn, emit)` — present |
| `commitPaths` is explicitly **not** the precedent: its commit carries no pathspec | `:313-314` → `orchestrate-dev.js:8669`, `:8690` | `:8669` is the export; `:8690` is `gitWithLockRetry(["commit","-m",message], …)` — no `--`, exactly as the REQ says |
| `gitWithLockRetry` is the index.lock retry to mirror | `:319` → `:8670` | present, used by `commitPaths`'s `add` |
| `resolveAdvisoryRung` is exported and reusable | `:225` → `:1833` | `export function resolveAdvisoryRung({ _agent, _log, _state, prompt })` |
| the fallback is announced, never silent | `:228` → `:1859` | `ADVISORY_MODEL_FALLBACK: "…" did not resolve — substituting "…"` |
| `nudge-consolidation.sh` fails open to empty text | `FSPEC` E-02 premise, REQ `:89` | `:38-39` `except Exception: logtext = ""`; `:41` is the basename-in-logtext test the REQ scopes |
| `.gitignore` today carries **no** pattern matching `.consolidation-lock`, and its five entries are as listed | `:184-186` | Confirmed: `.tokensave/`, `.claude/settings.local.json`, `.claude/.headroom_wrap_marker.json`, `node_modules/`, `/.claude/workflows/` — five, unchanged |

## Findings

Nothing changed in the document, so nothing in it can have regressed. Four findings carry forward
from v15 unchanged and unaddressed; one is new, and it is new because the re-grounding pass in §(b)
above looked at a sentence the erratum never touched. **All five are Low. None is a gate.**

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-05 | Low | Local | *(new — from the `DEC-ERR-01` re-grounding pass, not a delta regression)* `:316` glosses the marker lifecycle as "written and **removed** inside the pass". `FSPEC` `BR-14a` (`FSPEC:2551`) decides release is an in-place write of `RELEASED: {passId} {ISO-8601}` and that no seam can remove the file, and the REQ's own AC-1.3 already says "in-place rewrites" (`:179-180`) and "in-place edits" (`:208`) — so `:316` uses the one verb its own normative half rules out. It is Low, not blocking, on three counts: the sentence's binding claim is "never committed" (unaffected — the file is in no pathspec either way), the release form is owned and stated correctly two hundred lines earlier, and `:316` is not a hand-off section any downstream task is authored against. Suggested repair, byte-neutral: "written and released in place inside the pass". | AC-3.8b consequences, `:316` |
| F-01 | Low | Local | *(carried forward from v15, unchanged, still open)* AC-2.4 (`:239-240`) glosses the recorded consumed basenames as "exactly the AC-1.1 predicate's set", but §4b's new rule leaves an unreadable-but-enumerated basename un-consolidated and **not** consumed, so the two sets can differ by exactly that class. NFR-5's "**exactly** the consumed set" (`:553`) is the binding statement and is unaffected — a legibility defect, not a contradiction. Repair: "consumed basenames (the set the pass actually consumed — §4b omits an unreadable entry)". | AC-2.4 |
| F-02 | Low | Local | *(carried forward from v15, unchanged, still open)* Step 1's block asserts "**The two** classes on which those mechanisms would otherwise disagree" — a closed enumeration. A third exists in principle (a symlinked feature directory: `glob` reads through it, `git ls-files` does not descend into it). Re-measured at HEAD this round: `find docs -maxdepth 2 -type l` is still empty, so it costs nothing today; the exposure is that a closed claim is what a later reader trusts. Repair: "the two classes that arise at HEAD". | REQ-CONS-01 step 1 |
| F-03 | Low | Local | *(carried forward from v15, unchanged, still open)* §4b's split needs an explicit subject — "Of the vocabularies file's owned sections, §1, §2 and §4 are enumerations and §3 is owned normative prose; the baseline's four sections are all owned normative prose, under no row oracle". Not re-argued here. | §4b |
| F-04 | Low | Local | *(carried forward from v15, unchanged, still open)* Narrow §4b's baseline change-control clause from "a **content** change" to "a change to any **stated fact**", matching the vocabularies file's row-scoped wording. Not re-argued here. | §4b |

Every one of the five is a single-clause wording repair inside text this REQ already owns. If an
optimizer pass is open on the REQ for any other reason, they should ride along with it; if none is,
none of them justifies opening a round, and I will not open one on their account.

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(carried forward from v15, unchanged)* The gitignore decision's stated reason is that the alternative leaves "a nag that never quiesces"; the unreadable-entry decision accepts that shape deliberately. I read it as bounded — consuming the readable entries drops the un-consolidated count below `volumeThreshold` unless ≥5 files are simultaneously unreadable, after which the cadence test governs. Still a TSPEC-level note at most, not a REQ change. |
| Q-02 | *(carried forward from v15, unchanged)* The REQ is 674 lines / 64,397 bytes against the pdlc budget of 700 lines / 60 KB, so `check-req-size.sh` warns on the byte half. Unchanged this round (the file did not move), so it is neither a new breach nor a delta regression. Flagged only so the next author knows the line budget has 26 lines of headroom. |
| Q-03 | Phase R has now re-entered on a document that did not change and whose approval anchors still verify against its bytes. If that re-entry was mechanical rather than intentional, the cheaper path is to honour the recorded v15 approval rather than spend a round confirming it — the halt that produced this re-entry (`POSTMORTEM-P`) is a TSPEC/PLAN-layer defect and names no REQ repair anywhere in its Recommendation (steps 1–3 are TSPEC edits, 4–5 are process, 6 is re-entry). Nothing here needs an answer before Phase F; I raise it so the round is not read as evidence the REQ was in doubt. |

## Positive Observations

- **The REQ survives the re-grounding pass that `POSTMORTEM-P` was written to force.** The one
  decision that moved underneath this feature — `BR-14a`'s `RELEASED:` sentinel — is a *refinement*
  of what AC-1.3 already said twice, not a contradiction of it. The REQ left the payload open and
  pinned the mechanism ("in-place"), which is the layering that lets a downstream decision land
  without invalidating its parent. That is `DEC-LAYER-01` working as intended, visible only because
  the FSPEC actually exercised it.
- **The `.gitignore` clause at `:184-186` is still exactly right, and still not yet implemented.**
  Re-measured this round: the file carries five entries and none matches `.consolidation-lock`. The
  REQ's argument for why that matters — a committed lock reaches every fresh clone and refuses every
  pass for `staleLockMinutes`, per clone — is a real failure mode with a one-line fix, correctly
  scoped into §5 rather than left to be discovered in implementation.
- **Every code citation in the REQ verifies at HEAD, and the sharpest one is the negative.** `:313-314`
  does not merely cite the precedent it follows (`commitQueueRow`); it cites the shipped function it
  deliberately does **not** follow (`commitPaths`, whose commit at `orchestrate-dev.js:8690` genuinely
  carries no pathspec) and says why. A spec that names the near-miss it rejected is much harder to
  implement wrongly than one that names only the pattern it wants.
- **The four Lows I carried forward have stayed Low across two rounds without drifting.** None of them
  has acquired a downstream consumer or grown into a contradiction — which is the evidence that
  declining to open a round for them at v15 was the right call rather than a deferral that aged badly.

## Recommendation

**Approved with minor changes.**

The document is byte-identical to the revision I approved at v15 (`sha256:c21f8a42…d9ffd0` matches
the recorded `APPROVAL-HASH` exactly), so there is no delta to regress and my v15 approval carries
forward unchanged.

I did not stop at that. Per `DEC-ERR-01`, which landed on this branch after v15, I re-grounded the
REQ against everything that moved underneath it: the two new project-level decisions (neither
constrains REQ content, and none of the four `POSTMORTEM-P` countermeasures is a §5 deliverable), the
`FSPEC` `BR-14a` / `E-11b` release-form decision that halted Phase P (the REQ states the winning form
at `:179-180` and `:208` — it is refined, not falsified), and eight existing-code claims re-measured
rather than re-trusted (`orchestrate-queue.js:1576`/`:1615`, `orchestrate-dev.js:8669`/`:8670`/`:8690`/
`:1833`/`:1859`, `nudge-consolidation.sh:38-41`, `.gitignore`, the symlink probe — all hold).

Five open findings, all Low, all single-clause wording repairs: F-05 new from the re-grounding pass,
F-01…F-04 carried forward untouched. None blocks FSPEC, TSPEC, PLAN or implementation. Nothing in
this REQ is implicated in the `POSTMORTEM-P` halt, and nothing in that halt's Recommendation asks for
a REQ change.

**Errata:** none. The REQ is the top of the chain and I found no defect in an upstream document.

## Verdict

VERDICT: Approved with minor changes

