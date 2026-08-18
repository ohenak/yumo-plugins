# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-17
**Iteration:** 4
**Scope:** delta re-review since `deedc0fc` (v3's basis). Diff read with
`git diff deedc0fc HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
(27 insertions, 13 deletions). Unchanged sections approved in v1/v3 are not re-litigated.

## Disposition of v3's findings

| v3 ID | Subject | Status | Evidence checked this round |
|----|---------|--------|------------------------------|
| F-01 (High) | Cleanup's expected-name set reused repo-side L-1, over- and under-inclusive | **Resolved** | New **L-11** (§4.2) is consumer-side and pinned at seven entries. Over-inclusion closed: `distribution-manifest.json` is excluded and explicitly named as *unexpected* — the manifest carries `consumerPath` rows only for the four bundles/CLI (`pdlc/workflows/dist/distribution-manifest.json:8,16,26,36`) and none for itself. Under-inclusion closed: `.pdlc-sync-manifest.json` (`pdlc/hooks/scripts/sync-workflows.sh:464`, `pdlc/hooks/scripts/lib/pdlc-drift.sh:1153`) and `.pdlc-backups/` (`pdlc/hooks/scripts/lib/pdlc-drift.sh:1710`, `pdlc/hooks/scripts/check-workflow-drift.sh:348`) are both in the set, alongside `.pdlc-drift-state.json`. §3.5 steps 2–3, BR-CLN-3a, AT-4.1 all now cite L-11 rather than L-1, and AT-4.1's Given constructs all seven with a non-empty backups directory, so the happy path is reachable on a real consumer. |
| Q-01 (recursion of `.pdlc-backups/`) | Answered | **Resolved** | L-11 pins the directory as expected *as a whole*, removed with its contents, `.bak` files never classified individually — which is the only decidable choice given the `{id}.{stamp}-{NN}.bak` grammar (`pdlc/hooks/scripts/lib/pdlc-drift.sh:1701`). §3.5 step 3 restates it. |
| F-02 (Low) | "Four terminal branches" undercount | **Resolved, with a residue** | BR-CLN-4 now says **five** terminal exit *statuses* and reserves `4`. Verified: `4` at `sync-workflows.sh:84`, `:91`, `:687`, `:691`; `3` at `:695`, `:699`, `:714`; `2` at `:718`; `1` at `:722`; `0` at `:725`. Five statuses is right. See F-02 below for the one inaccurate half-sentence. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **L-11 omits the retired channel's crash-residue temp files, so a name the channel itself wrote can refuse the cleanup.** Both consumer-side atomic writes place a sibling temp *inside the same directory* before renaming: `${dir}/.pdlc-tmp.$$.${RANDOM}` for state/manifest writes (`pdlc/hooks/scripts/lib/pdlc-drift.sh:1444`) and `${destDir}/.pdlc-tmp.$$.${RANDOM}` for artifact copies (`:1658`), where `destDir` is `.claude/workflows/`. A run killed between `printf` and `mv` leaves a `.pdlc-tmp.<pid>.<rand>` behind. Under §3.5 step 2's name-only predicate that entry is *unexpected*, so the whole cleanup refuses with `3` on a file the retired channel produced. The refusal direction is the conservative one, so this does not block — but L-11's claim "the four consumer paths the retired channel wrote … plus the three state entries it created beside them" is an incomplete statement of what the channel writes there, and the operator-facing consequence is unexplained. Cheapest fix: either add `.pdlc-tmp.*` as an eighth, grammar-matched expected member (the grammar is checkable and the file is by construction junk), or keep it unexpected and say so in an edge case so E-16's refusal is not read as "someone put a foreign file there". | §4.2 L-11; §3.5 step 2; E-16 |
| F-02 | Low | Local | **BR-CLN-4's characterisation of status `4` names two of its three producers.** The sentence reads "usage-error and write-failure status". Verified producers: usage error (`sync-workflows.sh:84`, `:91`), write failure (`:691`) — and an **unrecognised `PDLC_FAULT` token** (`:687`), which is neither. Reserving `4` is still correct and the count of five is correct; only the gloss is short. Suggest "usage-error, unrecognised-seam and write-failure status". | BR-CLN-4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-4.1's second construction is "copy present with **no** drift-state record". With L-11 now seven entries, is there an intended third construction where `.pdlc-sync-manifest.json` or `.pdlc-backups/` is the absent one? §3.5 step 1 words absence-tolerance for the drift-state record specifically, while L-11 words it for "any of the three". The two readings agree, but the AT only exercises one of the three absences; the TSPEC/PROPERTIES author will have to decide whether the other two are worth their own rows. Not a finding — the FSPEC's rule is unambiguous either way. |

## Positive Observations

- **L-11 is the right shape for the problem v3 raised.** It is stated once, named consumer-side in its own text, carries its own count word (7), and is referenced rather than re-transcribed at all four use sites (§3.5 steps 2–3, BR-CLN-3a, AT-4.1). The "is not L-1" sentence pre-empts exactly the mistake the previous revision made, which is the kind of note that survives a later editor.
- **The over-inclusion fix is stated as a positive rule, not only as a deletion.** `distribution-manifest.json` is not merely dropped from the set — it is named as *unexpected*, so a stray build artifact copied into the consumer directory reds rather than being silently swept. That is the conservatism BR-CLN-3a exists for, and it now has a concrete instance.
- **AT-3.1's set→sequence change closes a real oracle hole.** Set-equality over `{one engine CLI call}` would have been satisfied by two identical invocations collapsing to one member; "sequence of length 1, discharged by counting" cannot be. The FSPEC says why in-line, so the property author cannot reintroduce the set reading by accident.
- **AT-4.1 is no longer absence-only.** It now pins a positive post-state (all seven gone, empty parent gone, tracked files unchanged, exit `0` with each removed path reported) on a Given that constructs every member of the set including a non-empty backups directory — so a cleanup that removed four of seven and exited `0` fails it.
- **BR-CLN-4's `3`-vs-"non-zero" reasoning re-verified end to end.** The exit ladder in the retired tooling still reads exactly as the FSPEC describes it, and AT-4.3 keeps the "`127` would satisfy non-zero while proving the step never ran" argument attached to the assertion, not to prose elsewhere.

## Recommendation

**Approved with minor changes**

v3's single High finding is resolved, and the fix is better than the minimum I asked for: L-11 is a named, counted, consumer-side literal rather than an inline transcription at each use site. No High findings, old or new. Both remaining findings are text-accuracy items in sections this round touched, and neither changes a behaviour the TSPEC would implement differently — F-01 asks for one edge case or one extra set member, F-02 for three words in a gloss. Neither needs another review round; fold them into the next edit of the document.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
