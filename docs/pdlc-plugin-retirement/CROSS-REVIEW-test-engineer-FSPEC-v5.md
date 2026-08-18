# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.5)
**Date:** 2026-08-17
**Iteration:** 5

**Scope:** delta re-review of `1f030bd4..HEAD` (19 insertions / 12 deletions, commit `f8283ee3`)
against `CROSS-REVIEW-test-engineer-FSPEC-v4.md`. The round touched five places: the header's
version and cross-review list, §4.2 L-11 (7 → 9 members plus the crash-residue carve-out),
§4.6 BR-CLN-4's cause lists, the new **E-16b** row in §5, and §6.4 AT-4.1 ("all nine") /
AT-4.3's fixture clause. Only those sections were scanned for new issues. Every literal below was
re-derived from the tree at HEAD, not from the document.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **E-16b's refusal is the one classification in the cleanup that a reasonable implementer would get backwards, and no acceptance test pins it; AT-4.3's fixture clause is now stated two non-equivalent ways, so a TSPEC transcribing it can legitimately build a fixture that never exercises E-16b.** The new edge case is correct against HEAD — both consumer-side atomic writers place their temp sibling *inside* the target directory (`pdlc/hooks/scripts/lib/pdlc-drift.sh:1444` `local tmp="${dir}/.pdlc-tmp.$$.${RANDOM}"`, `:1658` `local tmp="${destDir}/.pdlc-tmp.$$.${RANDOM}"`, renamed at `:1450`/`:1679`), so a kill between `printf`/copy and `mv` does leave `.pdlc-tmp.<pid>.<rand>` behind — and refusing on it is the conservative call the row argues for. The testing gap is that E-16b's outcome is *indistinguishable at the oracle level* from E-16's, and the only AT in that family, AT-4.3, describes its fixture as "a file … whose name the retired channel never installed — a name outside every L-11 member". Those two predicates were coextensive in v0.4; E-16b makes them disjoint on exactly the interesting case: `.pdlc-tmp.*` **is** a name the channel installed and **is** outside L-11. An implementer reading the first half picks a foreign name, the whole E-16b branch ships untested, and the plausible wrong "fix" — adding a `.pdlc-tmp.*` grammar to the expected set, which is precisely what `CROSS-REVIEW-software-engineer-FSPEC-v4.md` F-01 offered as one of two options — goes green. Resolve by making the L-11-membership predicate the sole fixture criterion in AT-4.3 (dropping the "never installed" gloss, which is no longer the rule) and naming a second construction on the same AT whose unexpected entry is a `.pdlc-tmp.<pid>.<rand>` file, expected outcome identical: byte-identical contents, path named on stderr, exit exactly `3`. | §5 E-16b; §6.4 AT-4.3; §4.2 L-11 |

## Resolution of round-4 findings

| Prev | Status | Evidence |
|---|---|---|
| F-01 (High) — L-11's enumeration omitted the two consumer paths the channel installed and later retired | **Resolved** | L-11 is now "pre-cleanup (**9**)" and names `orchestrate-dev.js` and `orchestrate-queue.js` as expected members with the mechanism stated ("only a sync run removed them; a drift-check-only consumer still holds them, reported and left in place"). Both re-derived at HEAD: `distribution-manifest.json` carries `retired: ['.claude/workflows/orchestrate-dev.js', '.claude/workflows/orchestrate-queue.js']` and the same paths in rows 1–2's `retires[]`; the delete is inside the sync-only gate (`sync-workflows.sh:417` onward, gated on post-copy state per the AC-3.9 comment at `:413–416`), while `--check` builds the inventory and takes exit class 1 (`:570–578`). The dependent count updated with it — AT-4.1 now reads "all **nine** are gone" — and AT-4.3's fixture is explicitly steered off both names, closing the "refusal pinned on a path the channel did install" hazard |
| F-02 (Low) — BR-CLN-4's per-status cause lists were proper subsets of HEAD's branches | **Resolved** | `3` is now "an *unknown* row and two unmet evidence preconditions" and `4` is "usage-error, unrecognised-seam-token and write-failure". Both match HEAD exactly: `sync-workflows.sh:687` (`pdlc_fault_unrecognised_seen` → 4), `:691` (write failures → 4), `:695` (`PDLC_EVIDENCE_REPO_ROOT == holds` → 3), `:699` (baseline `!= resolved` → 3), `:714` (unknown row → 3), `:718` (→ 2), `:722` (→ 1), `:725` (→ 0) — five terminal statuses, as claimed |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v4 and now answered by construction in one direction only: L-11 is a literal list of nine, and every one of the nine is derivable from the shipped `distribution-manifest.json` (4 `consumerPath` + 2 `retired`) plus the three state names. Does the TSPEC want the manifest-vs-list equality asserted as its own test, so a future manifest row that adds a consumer path reds the cleanup's expected set rather than silently escaping it? |
| Q-02 | Carried from v3/v4, still open at TSPEC level: AT-3.3's consolidation-nudge entry does not name the stale-LEARNINGS count that makes the nudge fire. `nudge-consolidation.sh:25` sets `THRESHOLD = 5` and `:81` gates on `n >= THRESHOLD`, so a four-file fixture yields silence and an absence-shaped false green. Fixture construction is the TSPEC's; flagged only so it is not discovered there |

## Positive Observations

- **The 9-member L-11 is literal-exact against HEAD and I re-derived every member.** Four `consumerPath` values (`consolidate-learnings.bundle.js`, `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `pdlc-cli.mjs`), two `retired` values, and the three state entries with their writers — `.pdlc-drift-state.json` at `sync-workflows.sh:239`, `.pdlc-sync-manifest.json` at `:464` and `lib/pdlc-drift.sh:1153`, `.pdlc-backups` at `:612`. A repo-wide grep for writes under `.claude/workflows/` surfaces no tenth name, so the enumeration is now complete rather than merely longer.
- **The count dependency was propagated, not just the literal.** "All seven" → "all nine" in AT-4.1 is the kind of derived number that normally rots one round behind its source; here the set-equality oracle and its cardinality moved together, so AT-4.1 still fails on a deleted member.
- **AT-4.3's exclusion clause pre-empts the exact wrong fixture v4 warned about.** Naming `orchestrate-dev.js` / `orchestrate-queue.js` as ineligible stops a refusal test being written against a path the channel did install — a false green that would have survived the cleanup's own expected-set being wrong.
- **E-16b resolves the SE round's open choice in the falsifiable direction.** Refusing on crash residue keeps one name predicate over a closed set; the alternative — a `.pdlc-tmp.*` glob in the expected set — would have made the cleanup delete on a *pattern* whose members are unenumerable, which no test could exercise exhaustively. The rationale given ("no post-sweep artifact proves the residue is junk rather than an operator's file") is the testability argument, not merely a preference.
- **BR-CLN-4 still earns its load-bearing job after widening.** Exit `3` remains uniquely the refusal value and `4` stays reserved, so AT-4.3's "exactly `3`, not merely non-zero" oracle is still a real discriminator against a `127`-shaped never-ran failure.

## Recommendation

**Approved with minor changes** — no High findings. Both round-4 items landed and were verified
against the tree, not the prose: L-11 now enumerates nine members with the retirement mechanism
cited, and BR-CLN-4's cause lists match all eight exit sites in `sync-workflows.sh`. What remains is
one Medium: E-16b introduces a refusal class whose fixture AT-4.3 does not require, and whose
"never installed" gloss now contradicts the membership rule that actually governs. Tightening
AT-4.3 to the L-11-membership predicate and adding a `.pdlc-tmp.<pid>.<rand>` construction is a
two-sentence edit and does not gate the phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
