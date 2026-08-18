# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.4)
**Date:** 2026-08-17
**Iteration:** 4

**Scope:** delta re-review of `3f4e3cab..HEAD` (27 insertions / 13 deletions, commit `1f030bd4`)
against `CROSS-REVIEW-test-engineer-FSPEC-v3.md`. The round touched six places: the header's
version and cross-review list, §3.5 steps 2–3, the new **L-11** literal in §4.2, BR-CLN-3a,
BR-CLN-4's exit-status sentence, AT-3.1's first conjunct and AT-4.1's Given/Then. Only those
sections were scanned for new issues. Every literal cited below was re-derived from the tree at
HEAD, not from the document.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **L-11's enumeration is incomplete against HEAD: it omits the two consumer paths the retired channel installed and later retired, so the "fixed set of names the retired channel installed there" claim is falsified by the repo, and every test derived from it pins the wrong behaviour.** `pdlc/workflows/dist/distribution-manifest.json` ends `"retired":[".claude/workflows/orchestrate-dev.js",".claude/workflows/orchestrate-queue.js"]`, and the `orchestrate-dev` / `orchestrate-queue` rows carry the same paths in `retires[]` — these are consumer paths *the channel itself wrote* at pre-bundle versions. The tooling treats them as a first-class leftover class, not an accident: `sync-workflows.sh:100–102` declares `_PDLC_C3_RETIRED_PATH/_ID/_STATE`, `:446–448` populates them, and `:165` writes them into the drift-state record as `"retiredPresent"`. They are removed only by a **sync** run (`:413` onward); in `--check` mode they are reported and left in place (`:572` comment, exit class 1). A consumer that ran only the drift hook — exactly the population this feature retires — therefore still holds `.claude/workflows/orchestrate-dev.js`. Under §3.5 step 2 that name is not in L-11, so it is *unexpected*: the cleanup deletes nothing, refuses with exit `3` (E-16), and no rerun ever clears it. Two testing consequences: (a) AT-4.1's seven-entry set-equality passes on a fixture that omits a name the channel installed, i.e. the enumeration under test is not the enumeration in production; (b) AT-4.3 / E-16's "a name the retired channel never installed" fixture may legitimately be built from `orchestrate-dev.js`, pinning a refusal on a path the channel *did* install. Resolve by deciding the class explicitly in L-11 — either the two retired paths are expected entries (count becomes 9, AT-4.1's "all seven" updates with it), or they are excluded with a cited mechanism showing they cannot be present at cleanup time — and give E-16's fixture a name that is demonstrably outside every historical `consumerPath`/`retires` value. | §4.2 L-11, §3.5 step 2, §6.4 AT-4.1/AT-4.3, E-16 |
| F-02 | Low | Local | **BR-CLN-4's per-status cause lists are proper subsets of HEAD's branches, so a reader transcribing them into a status oracle would under-describe two statuses.** The headline claim is exact and verified — `sync-workflows.sh` has **five** terminal statuses, `:687`/`:691` → `4`, `:695`/`:699`/`:714` → `3`, `:718` → `2`, `:722` → `1`, `:725` → `0`. But `4` is attributed to "usage-error and write-failure" while HEAD has a third `4` branch, the unrecognised-`PDLC_FAULT`-token exit (`:686–688`), and `3` is attributed to "an *unknown* row" while HEAD also exits `3` for `PDLC_EVIDENCE_REPO_ROOT == holds` (`:694–696`) and for a non-`resolved` baseline (`:698–700`). The rule's load-bearing job — justify pinning refusal on `3` and reserve `4` — is unaffected; this is transcription width only, and costs nothing to widen ("usage error, unrecognised assertion-seam token, or write failure"). | §4.6 BR-CLN-4 |

## Resolution of round-3 findings

| Prev | Status | Evidence |
|---|---|---|
| F-01 (Low) — AT-3.1's conjunct stated over a set, so a doubled dispatch collapses to one member | **Resolved** | AT-3.1 now reads "the session transcript's tool-invocation **sequence** for the skill has **length 1** and its single member is the engine CLI call … a sequence, not a set, so a second identical invocation reds rather than collapsing into one member". The measured quantity is now countable and the double-dispatch regression is falsifiable. The two positives beside it (non-empty dispatch record, field-faithful relay) are unchanged |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does the cleanup's expected-name set have to be a *literal* list, or may it be derived at build time from the shipped `distribution-manifest.json`'s `consumerPath` + `retires` + the three state names? A derived set closes F-01 by construction and gives TSPEC a set-equality oracle against the manifest rather than against a hand-copied list; a literal list is simpler but needs the manifest-vs-list equality asserted somewhere. Carrier is the TSPEC's call (BR-CLN-3a), but the FSPEC decides which of the two contracts it is stating |
| Q-02 | Carried from v3 and still open at TSPEC level: AT-3.3's consolidation-nudge entry does not name the stale-LEARNINGS count that makes the nudge fire. `nudge-consolidation.sh:25` sets `THRESHOLD = 5` and `:81` gates on `n >= THRESHOLD`, so a four-file fixture yields silence and an absence-shaped false green. Fixture construction is the TSPEC's, flagged only so it is not discovered there |

## Positive Observations

- **L-11 is otherwise literal-exact against HEAD, and I re-derived every one of the seven.** The four consumer paths match `distribution-manifest.json`'s `consumerPath` values one-for-one (`consolidate-learnings.bundle.js`, `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `pdlc-cli.mjs`) and the three state entries match their writers: `.pdlc-drift-state.json` at `sync-workflows.sh:239`, `.pdlc-sync-manifest.json` at `:464` and `lib/pdlc-drift.sh:1153`, `.pdlc-backups` at `:612`.
- **The `distribution-manifest.json`-is-unexpected carve-out is correct, not merely plausible.** That file has no `consumerPath` anywhere in the manifest and no writer under `.claude/workflows/`; it is repo-side only, so E-16 refusing on it is right, and stating it inside L-11 pre-empts the obvious wrong fixture.
- **`.pdlc-backups/` as a whole-directory expectation is the right shape for testability.** The `.bak` names are timestamped and unenumerable in advance (`:612`'s backup-id path), so classifying the directory rather than its contents keeps the name predicate decidable — a contents-level predicate could not be written as a test at all.
- **The §3.5 step-3 rewrite fixed a real partial-presence hole.** "Every expected entry of L-11 **that is present**" now composes with L-11's "any of the three may be absent" and with class 4's idempotence, so the three classes no longer overlap ambiguously on a half-populated directory.
- **BR-CLN-3a's simplification is a net testability gain.** Dropping the drift-state record from the classification basis removes a branch whose oracle depended on consumer history, leaving one name predicate that a test can exercise exhaustively.

## Recommendation

**Needs revision** — one High finding (F-01). The round's repairs all landed: AT-3.1 is now
count-falsifiable, §3.5's partial-presence hole is closed, and BR-CLN-3a rests on a single
decidable predicate. What blocks is the new literal itself: L-11 claims to enumerate the names the
retired channel installed, and HEAD shows two more (`orchestrate-dev.js`, `orchestrate-queue.js`,
carried in the manifest's `retires`/`retired` and in the drift record's `retiredPresent`). Deciding
that class one way or the other, and re-stating AT-4.1's count to match, is a self-contained edit
to §4.2 plus two sentences in §6.4; nothing else in the document depends on it.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
