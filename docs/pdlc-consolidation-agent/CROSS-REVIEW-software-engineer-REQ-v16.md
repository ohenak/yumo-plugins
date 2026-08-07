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

## Questions

## Positive Observations

## Recommendation

## Verdict
