# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 17
**Mode:** Delta confirmation (erratum round, `d74d80d0..e192d6e7`, TSPEC v2.6 → v2.7)
**Scope:** 21 insertions / 6 deletions. Two te-review errata about stale HEAD claims. Only the
erratum delta reviewed; sections approved at v16 not re-litigated.

## The question this round answers

Do the two re-anchored citations resolve the errata without disturbing anything approved at v16?
I measured both against HEAD rather than against the changelog's account of them.

**Erratum (a) — §3.2's `CLAUDE.md` row (`TSPEC:332`). Resolved.** The row previously described
the enumeration as `:58-60` with a three-count sentence at `:62` and asserted the sentence "is
already false at HEAD". Both halves were the shape of the *pre-feature baseline*, not HEAD. The
re-anchored row now says the edit **landed in `927ecd15` (T33)** and that HEAD carries five
bullets at `CLAUDE.md:58-62` plus the count-free sentence at `:64`. Verified directly:

- `CLAUDE.md:58-62` is five bullets (`orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`,
  `consolidate-learnings.bundle.js`, `pdlc-cli.mjs`, `distribution-manifest.json`), and `:64`
  reads "These are the tracked, shipped outputs." — count-free, as claimed.
- The baseline claim is now correctly tensed and correct: at the merge-base (`b88c693b`),
  `CLAUDE.md:58-60` enumerated three and `:62` read "Those three are the tracked, shipped
  outputs." while `git ls-files pdlc/workflows/dist/` returned four paths. The row's rationale —
  why the fix was a count-free rewrite plus the missing `pdlc-cli.mjs` bullet rather than a
  `three` → `four` substitution — is preserved intact, which is the part a PM cares about: the
  product reason for the shape of the edit survived the re-anchoring.

**Erratum (b) — §12.2's `CLAUDE.md` row (`:2856`) and §8.3's clause (`:1831`). Resolved.** The
old text asserted "verified at HEAD, where `rows[].id` is exactly `orchestrate-dev`,
`orchestrate-queue`, `pdlc-cli`". At HEAD `distribution-manifest.json` carries **four** rows —
`consolidate-learnings`, `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` — which is exactly
what §12.2 now says, with the three-id list correctly relocated to the pre-feature baseline
(confirmed: the merge-base manifest carries those three ids and no fourth). §8.3 carried the same
three-id claim in one clause and is re-anchored with it ("at the pre-feature baseline… the rebuild
adds a fourth row, `consolidate-learnings` — present at HEAD since the build landed").

**The changelog's load-bearing claim is true, and I checked it rather than took it.** v2.7 says
"No decision, oracle or scope changes: the CLAUDE.md case remains set equality against the
manifest's rows, in both directions, which is precisely why a fourth row needed no oracle edit."
The oracle text in §12.2 is unchanged apart from the citation — still set equality, still in both
directions, still excluding `distribution-manifest.json` itself. And it holds at HEAD by
construction: five enumerated paths minus the manifest = four = the manifest's four rows.
`consolidationBuild.test.js` greens on that case at HEAD (15/15, including *"CLAUDE.md's
enumerated artifact paths, minus the manifest, are set-equal to the manifest's rows"*), so the
erratum's claim that the fourth row needed no oracle edit is demonstrated, not asserted.

**Product lens: nothing approved at v16 moved.** The delta touches only citation locations and
tense. No acceptance criterion is narrowed, no requirement trace is broken, no scope is added or
dropped: §3.2 still owns the `CLAUDE.md` production edit as one task with a falsifying oracle,
§12.2 still claims no register id (so §12.3's set equality is undisturbed), and §8.3 still states
the re-stamping rule as a property of the manifest rather than a per-feature choice. The v16
findings (F-01, F-02) were in §§7.1/10.3/10.4/12.2's `no-op` material, untouched by this delta and
re-confirmed as still present at HEAD.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | §12.2 (`:2856`) now reads "this feature adds a fifth artifact" (the erratum added the word *artifact*). The feature adds one artifact — `consolidate-learnings.bundle.js`, the manifest's **fourth** row; *fifth* is the count of enumeration **entries** in `CLAUDE.md`, which includes the manifest itself. The two counts are the very pair this erratum exists to keep apart, and §12.2's own exclusion clause turns on the distinction. Suggest "this feature adds a fourth artifact, and a fifth enumeration entry with it" — non-gating; the oracle is unaffected either way | §12.2, §8.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §3.2's row is now retained purely "for the rationale" of an edit that has landed. Is the intent that rows for landed production edits stay in §3.2 for the duration of the feature (my reading, and the one I confirmed against), or that Harvest strips them? Not a blocker for this round — it is a Process question about §3.2's lifecycle that the LEARNINGS pass may want to settle. |

## Positive Observations

- The erratum does the thing that makes a stale-citation fix durable rather than merely current:
  it separates the two frames explicitly — *what was true of the baseline is said of the baseline,
  what is true at HEAD is said of HEAD* — instead of overwriting one with the other. The rationale
  a future reader needs (why the count-free rewrite, why `pdlc-cli.mjs` was missing) survives.
- Re-anchoring §8.3's clause along with §12.2's, unprompted, is the right call: the two carried the
  same three-id claim and fixing one would have left the document self-inconsistent at the next
  read.
- The changelog states the *negative* explicitly ("a fourth row needed no oracle edit") and it is
  mechanically checkable — the case greens at HEAD. Errata that say what did *not* change, in
  terms a reviewer can falsify, are cheap to confirm and worth the habit.

## Recommendation

**Approved with minor changes**

The delta resolves both errata and disturbs nothing previously approved. F-01 is a one-clause
wording precision in the same sentence family the erratum repaired; fold it into the next edit of
§12.2 if one occurs, or leave it — it gates nothing.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:44790289796a40f8b6122a1df2b92a36b9253cf072f2b768408134a4b1217315
REVIEWED-COMMIT: e192d6e739420ba179d05b1eee905c85663600aa
