# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation, round 9)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 9
**Scope:** Upstream-cascade confirmation only. FSPEC's own bytes have not moved since the v8
round. Upstream REQ moved v0.11 (`01c27ee4`) → **v0.12** (`20c87cd3`, "erratum — O-B states
trigger-derived PR-gate membership, not a fixed count"). One question is answered: does this
FSPEC still hold against the REQ as it now stands? Not a whole-document re-review; settled
decisions are not re-litigated.

## Upstream delta read at HEAD

`git show 20c87cd3` touches exactly two regions of the REQ, both in the observation layer:

- The version cell moves `0.11 → 0.12` and gains a changelog paragraph naming the round.
- **O-B** (`REQ:86`) is rewritten. Before: "The PR gate is **five** required checks — unit tests,
  engine tests, generated-artifact freshness, fresh-clone bootstrap, shell-script
  parse/index-mode — on ubuntu-latest × Node 20 only." After: membership is
  "**trigger-derived, not a fixed count**: a required check is whatever a PR-triggered workflow
  file renders, so the count moves whenever such a file is added, removed, or re-triggered —
  including by this feature's own work", with the five-member list demoted to a dated
  2026-08-13 observation of one file (`pr-tests.yml`), the explicit disclaimer "no number stated
  here is authoritative", and "the expected set the FSPEC owns (§5.1) … is the authority on
  membership (T-7)". The provenance cell gains `FSPEC §5.1` alongside `M-ENG-10`.

No acceptance criterion, no `T-` term, no business rule moved. `T-7` (`REQ:258`) already read
"an enumeration, not a count" before this round and is unchanged.

## Does the FSPEC still hold?

Yes — and it holds *better* than it did an hour ago. The v8 round added row 6
(`fixture-machine.yml`) to §5.1's expected set on the strength of that file's `on: pull_request`
trigger (CODE_REVIEW v1 §3-1). That left one live inconsistency across the pair: the FSPEC's set
had six rows while the REQ's gloss said "five". The erratum resolves it in the FSPEC's favour,
which is the correct direction — the FSPEC is the owner of the set and the REQ was glossing a
measurement.

Checked, at HEAD, the places this FSPEC leans on the edited text:

- **§5.1's six-row table** (`:473-481`) is unaffected. It never cited a count from the REQ; it is
  a literal transcription of job-level `name:` keys, seeded from M-ENG-10, which the erratum
  leaves as the measurement it always was.
- **BR-7.1** (`:494-509`) already states the derived file scope — "the files whose top-level `on:`
  block declares a `pull_request` trigger" — in the same terms the REQ now uses. The REQ moved
  toward the FSPEC's wording, not away from it. The FSPEC's derived-scope rule is strictly the
  more precise of the two, so it remains a faithful compression.
- **No count conjunct anywhere in the FSPEC is sourced from O-B.** `grep -i 'five\|six'` over the
  FSPEC returns nothing outside E-14/E-20 (`:670`, `:676`), neither of which states a cardinality.
  §5.1's set-equality oracle (AT-3.4, `:769-774`) asserts set membership in both alphabets, never
  a count, so no oracle weakens, strengthens, or goes stale under this edit.
- **The one testability consequence is positive.** A count-shaped upstream statement is the sort
  of thing a future revision transcribes into an oracle as `len(checks) == 5`, which would have
  been red the moment row 6 landed and green again if two unrelated checks were swapped. The
  erratum removes that attractor and points the transcriber at §5.1.
- **Absorbed decisions (DEC-ERR-01):** the only REQ v0.12 decision is O-B's restatement, and it is
  already implemented here (BR-7.1's derived file scope, §5.1 row 6). Nothing else in REQ v0.12
  touches this document.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The Upstream cell's pin is now one version stale.** `:9` reads `REQ … (v0.11, 01c27ee4, re-grounded 2026-08-14 erratum round)`; HEAD is v0.12 (`20c87cd3`). The pin is the anchor a later reader uses to decide whether this FSPEC was written against the REQ they are holding, so leaving it at v0.11 makes the next cascade harder to adjudicate than it needs to be. Nothing downstream reads it mechanically and no criterion depends on it, hence Low. Fix on the next edit that touches the header: re-pin to v0.12 / `20c87cd3` and add a one-line absorption record noting O-B's restatement was already implemented at BR-7.1/§5.1. | Header `:9`, changelog `:22`, `:36-42` |
| F-02 | Medium | Local | **Carried forward, unresolved from v8:** §3's F-5 baseline claim is false at HEAD. `:250` reads "Nothing of the kind exists at HEAD: `.github/workflows/` holds exactly one file (`pr-tests.yml`)". The directory holds three; two are this feature's. The erratum makes this *more* visible, not less — the REQ now says in as many words that the count moves and that this feature's own work moves it, so a present-tense one-file claim four hundred lines above BR-7.1's two-file enumeration reads as a contradiction. No oracle depends on it. Fix: date the observation ("at feature start, `89babe8e`"). | §3 F-5 `:250` |

Not re-litigated, still open, unchanged by this round: v8 `F-01` (version cell / changelog not
advanced for the row-6 delta — now compounded by F-01 above, and fixable in the same edit),
v8 `F-03` (BR-7.1's tail's singular "that file carries ~16"), v8 `F-04` (BR-7.1 / BR-7.7's new
set-equalities not named in §8's AT-3.4 traceability), v7 `F-02` (BR-8.2's "workflow modules"
vs the Workflow-members rename).

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v8, unanswered and unaffected by this round: row 6 is path-filtered to `pdlc/engine/**`, so on a docs-only PR it renders no check at all. §5.1 calls it "a required check on the PRs it runs on and absent from the others"; is Phase PUB's `gh pr view --json statusCheckRollup` poll specified anywhere to tolerate an expected member being *absent* rather than red? If that tolerance is only implicit, the first docs-only PR is the test. This is a PUB-poll question, not an AC-3.4 question — AT-3.4's carrier is offline and unaffected. |

## Positive Observations

- The erratum is the right shape for a cascade: it edits the *upstream gloss* to match the
  downstream owner rather than pulling the owned set back to a stale number, and it says so
  explicitly ("§5.1 … is the authority on membership"). That is the direction that keeps a single
  source of truth for the oracle.
- "No number stated here is authoritative" is a rare and useful sentence in a requirements
  document — it forecloses a whole class of future count-shaped oracle transcription.
- The five-member list survives as a **dated** observation rather than being deleted, so
  M-ENG-10's provenance seed (BR-7.4) still has its counterpart upstream.
- The FSPEC needed no edit to remain faithful. Confirmed by reading §5.1, BR-7.1–BR-7.5 and
  AT-3.4 against REQ v0.12 at HEAD, not by trusting the item list.

## Recommendation

**Approved with minor changes** — the FSPEC still holds against REQ v0.12. No High finding. The
two open items are documentation-hygiene (a stale upstream pin, a stale baseline sentence);
neither touches a criterion, an oracle, or a test, and both are fixable in a single header/§3
edit whenever this document is next opened.

FINDING: Low | delta | nonlocal | Header `:9` Upstream cell | Upstream pin still names REQ v0.11 `01c27ee4`; HEAD is v0.12 `20c87cd3`. Re-pin and record O-B's restatement as absorbed (already implemented at BR-7.1/§5.1).
FINDING: Medium | inherited | nonlocal | §3 F-5 `:250` | Present-tense claim that `.github/workflows/` holds exactly one file is false at HEAD (three files, two added by this feature); date it as a feature-start observation. Pre-existing from v8, untouched by this round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:6c1414c1a97f1306b6bb7afecf9942b6bc0d1566f483a1f6de618e4472022dd4
APPROVAL-HASH-NORMALIZED: sha256:e2e799b4df6c22afee2d7521fc59e0ab47731b0665dc715ce93d8ed97397e326
REVIEWED-COMMIT: e63bcad0b32df8cde8a1d0a991bc771fb578fc54
UPSTREAM-STATE: REQ sha256:04d2c39df40e7ef7092fb4081ac4bcf29df47ea23305ba88d2c4da567666157f
