# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md
**Date:** 2026-08-18
**Iteration:** 10

## Scope of this round

Delta confirmation only. Diff reviewed: `68e72db2..cc009367` on the REQ — one body hunk (§5 C-7,
+13 lines: the **Held classes and the interim state** paragraph) plus the version row and changelog
entry for v0.12. Routed item: **C-7 needs a disposition for the held-branch interim state** — whether
AC-1.1's unsatisfied set-equality while classes 7–12 are held is a red, a registered expected failure
(`SKIP_INVENTORY`-style), or a genuine gate that forbids intermediate commits.

Per DEC-ERR-03 I also re-read the upstream text the delta leans on (AC-1.1's *given*, C-5, C-8,
AC-1.8, NG-5) at current HEAD rather than trusting the previous round's reading of it.

## Routed item disposition

| Item | Landed edit | Disposition |
|---|---|---|
| C-7 held-branch interim state | §5 C-7 gains a **Held classes and the interim state** paragraph (`REQ:264`–`:275`) | **Resolved.** All three candidate readings are now closed explicitly and the answer is the third one, without registration. |

The paragraph answers the question in the only three places it could be answered, and the answers
are mutually consistent and upstream-faithful:

1. **Not a C-7 red.** C-7 is scoped to "the repo's own CI checks at each commit", while AC-1.1 is
   evaluated at sweep completion. I verified the upstream clause the paragraph cites: AC-1.1
   (`REQ:296`–`:300`) does open *"Given the sweep is complete at HEAD"*, so an unsatisfied
   `dist/` set-equality mid-sweep is an incomplete feature, not a failing gate. The citation is
   accurate as written and the distinction is real, not asserted.
2. **Not a registered expected failure.** "There is no skip-list, no expected-failure inventory
   and no tolerated-red register in this feature" — with the reason given rather than merely
   declared (*"a criterion that is allowed to be red by registration stops being a criterion"*).
   The cross-reference to C-8 checks out: C-8 (`REQ:276`–`:278`) forbids exactly the substitution
   shape — tests removed with their subject, "never skipped, marked pending or left asserting a
   vacuous truth". The `SKIP_INVENTORY` machinery the routed item named as the counterfactual does
   exist in this repo (`pdlc/workflows/__tests__/helpers/driftCapabilities.js`, consumed at
   `pdlc/workflows/__tests__/driftHelpers.test.js:31` and `driftClassify.test.js:663`), but it
   registers *capability-unavailability* skips (uid-nonroot, permission bits), not tolerated reds,
   and it sits inside the tree this sweep deletes. So the REQ's "not in this feature" scoping is
   correct and does not collide with the shipped mechanism.
3. **Does not forbid intermediate commits.** Ungated classes still land as their own commits,
   which preserves C-5's one-class-per-commit rule (`REQ:226`–`:236`) instead of quietly creating
   a "hold everything until the last class resolves" batch that C-5 disallows.

The escape hatch is named and is the right one: *"the resolution is ordering — the check becomes
live with the class it covers — never registration."* This is buildable here because every check
that would observe a held class is authored by the sweep itself in the same commit as the deletion
(the CI-arrangement oracle at `pdlc/engine/__tests__/ci-arrangement.test.js:47`–`:60` reads the
workflow file and the authored §5.1 rows from the tree at that commit, so job removal, spec row and
oracle move together). Pre-existing checks that assert a held artifact's *existence* stay green
precisely because the class has not landed. I found no check in the repo whose redness a held class
would force independently of commit ordering.

Finally, the merge rule closes the loophole the disposition could otherwise have opened: *"The
branch does not merge on a green subset: completion is all criteria satisfied at HEAD, held classes
included."* Without that sentence, "AC-1.1 unsatisfied is merely incomplete" would have been a
licence to ship the subset.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The v0.12 changelog entry names "classes 7–12"; the REQ body has no class numbering.** C-5 (`REQ:226`–`:236`) enumerates artifact classes prosaically and §6.1's AC-1.8 (`REQ:391`–`:396`) speaks of "each artifact class of C-5", but nowhere does the REQ assign class ordinals. A reader who reaches for the numbers the changelog uses will not find them in this document; they live upstream in the PLAN's wave ledger. The body paragraph itself is correctly written without ordinals ("a deletion class"), so this is confined to the history line — either drop the numbers there or say where they are enumerated. | §Changelog (`REQ:20`) |
| F-02 | Medium | Cross-Feature | **Carried from v9, untouched by this erratum and still false against shipped tooling.** C-9 (`REQ:279`–`:282`) still says "no post-sweep artifact records the hashes that would let anything tell a modified copy from an original". `.claude/workflows/.pdlc-sync-manifest.json` carries a per-row `consumerHash` (written `pdlc/hooks/scripts/sync-workflows.sh:505`, `:527`; read back `:139`), it lives in the consumer tree the sweep never reaches, and it outlives the sweep. The scope decision is sound; only the stated reason is wrong — it is a deliberate choice (cleanup does not interpret retired tooling's own state files), not an impossibility. Not routed this round; recorded so it is not lost. | §5 C-9 |
| F-03 | Medium | Local | **Carried from v9, untouched.** AC-4.1's observable removal set names two artifacts, while the same directory holds at least four in any repo that ever ran sync (`.pdlc-sync-manifest.json` at `sync-workflows.sh:464`, `.pdlc-backups/` at `:611`), and AC-4.3 turns any entry the expected set does not name into a guaranteed refusal. Non-gating, single-sentence fix whenever the document is next opened. | §6.4 AC-4.1 / AC-4.3 |

Neither F-02 nor F-03 was routed into this erratum, and neither is a delta regression: the C-7 hunk
does not touch, cite or depend on C-9 or §6.4. They remain the same two Mediums this reviewer
recorded at v9 and remain non-gating.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v8/v9, still unanswered and still non-gating: AC-5.2 compares eight run-variable collections on "presence, not content" — is presence alone intended, or presence *plus* declared container shape? The latter catches deleted machinery that leaves a field stranded as `null`. |

## Positive Observations

- **The disposition answers the mechanism question, not just the verdict question.** Saying "not a
  red" would have been enough to unblock; saying *why* registration is forbidden and naming
  ordering as the only substitute is what makes the answer usable by the implementer who hits the
  first held class at 2am.
- **The merge-rule sentence is the load-bearing one.** It is the difference between a scoping
  clarification and a subset-shipping licence, and it was written unprompted.
- **Delta radius is clean.** One body hunk plus the changelog row; AC-1.1's set-equality terms,
  C-5's one-class-per-commit rule, C-8 and AC-1.8's replay clause are byte-identical, and I
  re-read each rather than assuming.

## Recommendation

**Approved with minor changes**

The routed item is resolved, and resolved against upstream text I re-verified at current HEAD rather
than against the previous round's summary of it. No High findings, delta or inherited. The two
carried Mediums and one Low are single-sentence corrections that change no criterion's verdict and
do not block TSPEC work.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:41fb21e82be8b5c5622da7638abde6694890703ec72bf257fbefa7f52dda9c51
APPROVAL-HASH-NORMALIZED: sha256:8401bb43f31eceaea71f04daba3dfcd91a8acc94b77c849c677103e07734138d
REVIEWED-COMMIT: cc009367e22eaf624d4423d45d314248ceadaa89
