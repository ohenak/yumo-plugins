# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 6 (delta re-review)
**Scope:** Delta only. Diffed `4097aec7..HEAD` (the commit `CROSS-REVIEW-product-manager-PLAN-v5.md`
recorded as `REVIEWED-COMMIT`) on the PLAN; the whole delta is commit `df4d1c44`, PLAN v0.6.
Product lens only.

## 1. Disposition of my round-4 findings

| Prior finding | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 — §1.2's AC-4.4 argument overstated: "machine-global mutation" cannot be the reason, since T50's own AT-2.3 and AT-2.6 legs mutate machine-global state | Medium | **Resolved, and better than asked** | `PLAN:64-73` now states the reason as one **of degree, not of kind**, names the two T50 legs that already mutate machine-global state, isolates what AT-4.4 adds (the **revert** — a third sequential run restoring the *prior* plugin root), and states the cost that follows. It also adds an expiry condition — "the moment a revert leg exists on the fixture machine, this paragraph's reasoning expires and AT-4.4 should move onto T50" — which turns a standing exclusion into a scheduling decision a later reader can re-open. The claim that no leg walks a version back is true of §2 at HEAD: T50 pairs two roots in one direction (`PLAN:187`) and no row installs an older version over a newer one. |
| F-02 — DoD item 14 claimed AT-2.1…AT-2.6 have "no other observer", which §2.1 contradicts | Low | **Resolved, narrowed exactly to what §2.1 supports** | `PLAN:470` now splits the claim: **AT-2.3 and AT-2.6 have no observer outside T50's gated legs**; **AT-2.1, AT-2.4 and AT-2.5 lose only their machine-level conjunct** and retain the hermetic carriers §2.1 names. Transcription checked cell-by-cell against §2.1: AT-2.1 `T11, T14, T41, T46, T53, T34, T50` (`PLAN:207`), AT-2.3 `T50 (second leg)` (`:209`), AT-2.4 `T53, T34, T59, T50` (`:210`), AT-2.5 `T13, T25, T34, T45, T50` (`:211`), AT-2.6 `T50` (`:212`) — the item-14 lists are set-equal to those rows, in order. Item 15's tail is narrowed the same way (`:471`). The gate is unchanged and the check stays required, which is what I asked for: the finding was that the *sentence* overstated, not that the gate was too strong. The added instruction — "a reader reconciling this paragraph with §2.1 should tighten the sentence, never relax the gate" — forecloses the wrong repair. |
| F-03 — §4's T05 note pointed at DoD item 12 for the licence obligation; item 16 carries it | Low | **Resolved; one word of the repair is wrong** (see F-02 below) | `PLAN:372` now reads "**item 16** — the item that carries the licence record, the `LICENSE` file and the `package.json` SPDX field — stands as written". Item 16 (`:472`) is indeed the licence item. The pointer is now correct. |

## 2. Disposition of my round-5 (delta round) findings

Both were Low and both are **still open** — legitimately so: v0.6's changelog scopes itself to
round-4 findings, and my v5 items were raised in the erratum delta round that followed. They are
re-listed below as F-03 and F-04 so they are not lost, not because the author skipped them.

- **v5 F-01 — §2.1's AT-3.8a row still paraphrases the pre-split criterion.** `PLAN:220` still reads
  "packed set equals §5.2's **writable classes**; pairing record present". At FSPEC HEAD the word
  `writable` is gone and the ownership is two-sided (`FSPEC:41-42`: §5.2's row "no longer restates a
  member list of its own — the members are named downstream in TSPEC §5.4's `PK-*` table"). No
  transcription consequence: §2 is the declared source of truth and T16 (`PLAN:147`) states both
  halves correctly.
- **v5 F-02 — the discharge is attributed to the wrong FSPEC version.** `PLAN:147`, `:478` and the
  v0.5 changelog row (`:22`) credit "v0.4/v0.5" with removing the stale literal. FSPEC's own
  changelog puts it at **v0.3** (`FSPEC:38-42`, the erratum round: "the packed-member enumeration
  … no longer restates a member list of its own"); v0.4/v0.5 added the class rows, the member count
  and the authoritative/sub-assertion split. The discharge is correct against HEAD; only its
  provenance is off by one version.

## 3. Regression check on previously approved content

- **The "no structural change" claim is true of the diff.** v0.6 touches six regions only: the
  version cell, the 0.6 changelog row, §1.2's AC-4.4 paragraph, T50's cell, a new §4 paragraph,
  §4's T05 note, and DoD items 14–15. No task row added, removed, re-batched or re-scoped; §2.1,
  §3's manifest and §6's batch arithmetic are byte-unchanged in the diff.
- **§2.1's set-equality survives.** No `AT-` id and no `Carried by` cell moved, so the `iff` rule
  re-derived in v0.4 still holds; the only new `AT-` prose is in §1.2, §4 and the DoD, none of
  which §2.1 transposes against.
- **Batch arithmetic behind the new §4 paragraph checks out.** T59 is batch **2** (`PLAN:160`) and
  T50 is batch **10** (`:187`), so "batch 2 → batch 10" and "eight-batch red" are exact. T59's file
  `pdlc/engine/__tests__/fixture-machine.test.js` has one owner in §3 (`:326`) and exists nowhere at
  HEAD (`pdlc/engine/` holds only `__tests__`, `bin`, `lib` and the manifests), so "new file with a
  single owner" is true.
- **The two open errata are still open and still declared.** `PLAN:476` continues to name T45
  (below-floor emission) and T50 (fixture-machine home), both against TSPEC. Nothing in v0.6
  silently discharges either — T50's cell still carries "**subject to the erratum raised against
  TSPEC §12.1**" (`:187`).
- **DoD item 9 exists and says what item 14 now leans on.** Item 14's new clause cites item 9 as
  AT-2.5's local-suite observation; `PLAN:462` is that item, and it states below-floor behaviour
  (named failure, no stack trace, no partial tree) without a machine. The reference is real, not
  gestured at.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§4's new red-interval paragraph licenses work the ownership manifest forbids.** `PLAN:366` tells the implementer: "An implementer who wants the interval shorter **may land the comparator's module ahead of T50** without touching the workflow, and the plan does not forbid it." The plan does forbid it. §3 assigns `pdlc/engine/scripts/fixture-machine.mjs` to **T50 alone** (`PLAN:317`), and §6 Rule 2 — single writer per file per batch — plus the Phase-I wave gate's ownership check are enforced mechanically against that manifest, not against §4's prose. An implementer who takes the invitation writes a file owned by another task in an earlier wave, which is exactly the collision the manifest exists to prevent; the wave gate would reject it, and the reader is left holding two contradictory instructions. The paragraph's *purpose* is sound and worth keeping — the red is genuine, `test.todo` is rightly refused, and the hermetic subject is the reason the interval is tolerable. Suggest deleting the permission sentence, or restating it as a scheduling option that requires the plan to change first: "shortening the interval means moving `scripts/fixture-machine.mjs` into its own earlier task with its own manifest row; the plan as written keeps it in T50." | AC-2.1…AC-2.5 (AT-2 carriers), §3/§6 batch-safety |
| F-02 | Low | Local | **The item-12 repair mischaracterises item 12.** §4's T05 note now says the pointer "read 'item 12' in v0.4/v0.5, **which is the coverage-floor item**" (`PLAN:372`), and the v0.6 changelog repeats it: "item 16 is the licence record; item 12 is the coverage floor" (`:23`). Item 12 is neither — it is the AT-2 fixture-machine item ("AT-2.1, AT-2.3, AT-2.4, AT-2.6: the fixture machine installs and upgrades…", `PLAN:465`). The coverage floor is **item 4** (`:454`). My round-4 F-03 identified item 12 correctly as the AT-2 item; the repair fixed the pointer and then attached a wrong gloss to the old one. No consequence for what gets built — the operative pointer now names item 16 correctly — but an auditor reconciling the changelog against the DoD list finds a false statement in the record of how the defect was closed. Suggest: drop the gloss, or write "which is the AT-2 fixture-machine item". | AC-1.5 (licence/N-2 tracking) |
| F-03 | Low | Local | **Carried forward from round 5, unaddressed by design (v0.6 scopes to round-4 findings).** §2.1's AT-3.8a row still paraphrases the criterion as "packed set equals §5.2's **writable** classes" (`PLAN:220`), wording that predates the FSPEC ownership split (`FSPEC:41-42`). No transcription consequence — §2 is the declared source and T16 states both halves — but the traceability table summarises upstream text that no longer reads that way. Suggest: "packed set equals the expected set member-for-member (members from TSPEC §5.4, classes and counts from FSPEC §5.2), count conjunct from the transcribed list; pairing record present". | AC-1.3, AT-3.8a |
| F-04 | Low | Local | **Carried forward from round 5, unaddressed by design.** The erratum discharge is attributed to FSPEC v0.4/v0.5 in three places (`PLAN:22`, `:147`, `:478`); FSPEC's changelog puts the literal's removal at **v0.3** (`FSPEC:38-42`), with v0.4/v0.5 adding the class rows, the member count and the authoritative/sub-assertion split. Discharge correct, provenance off by one version. | AT-3.8a |

## Questions

| ID | Question |
|----|---------|
| Q-01 | T50's new discriminator paragraph says "on the **pinned** `ubuntu-latest` image both branches are off the expected path" (`PLAN:187`). No task in §2 states an image pin, and `ubuntu-latest` is by definition a moving label — which is the risk item 15's skip-coverage obligation was written to absorb. Is "pinned" meant as a commitment T50 must honour (a `runs-on` pin the row should name), or is it loose wording for "the GitHub-hosted runner"? If the former, the pin belongs in T50's cell where an implementer will read it; if the latter, dropping the word costs nothing. |
| Q-02 | The AC-4.4 expiry condition (`PLAN:64-73`) is the right shape, but nothing outside this paragraph will notice when it fires. If a later feature adds a revert leg to the fixture machine, who re-opens AT-4.4's scheduling — is that a harvest-time item for `docs/_constraints/`, or is the paragraph itself the only record? Not a gap in this plan's done-ness; a question about where the follow-on lives. |

## Positive Observations

- The AC-4.4 rewrite is the strongest passage added this round. It concedes the part of my finding
  that was right (machine-global mutation is within reach), keeps the part of the original decision
  that survives (the revert has no carrier), and then does something neither of us asked for: it
  states the condition under which its own argument stops holding. That is how a scheduling
  decision should be written down.
- Item 14's narrowing was done by reading §2.1 rather than by softening the sentence until it was
  safe. The five carrier lists transcribe exactly, and the added instruction to future readers —
  tighten the sentence, never relax the gate — protects the round-3 High from being undone by a
  well-meaning cleanup.
- The T59 → T50 paragraph answers the question actually asked (why is an eight-batch red
  acceptable) with two structural reasons rather than reassurance, and names the failure mode it is
  guarding against. Setting aside F-01's one sentence, this is the kind of note that stops an
  implementer from quietly converting a red into a `test.todo`.
- The changelog continues to state what did *not* change (task table, batch arithmetic, manifest,
  §2.1) and the claim held up under diff. Six rounds in, that habit is what makes a delta review
  possible at all.

## Recommendation

**Approved with minor changes.**

All three of my round-4 findings are resolved, and F-01's resolution is better than what I asked
for. Nothing previously approved is broken: the task table, ownership manifest, batch arithmetic
and §2.1's set-equality are untouched, the two upstream errata are still correctly declared open,
and item 14's new carrier lists transcribe §2.1 exactly.

F-01 (Medium) is the one item I would like folded before Phase I begins, since it is an instruction
an implementer may act on and the wave gate will then reject; it is Medium and not High because no
requirement is dropped or narrowed and the manifest — which is what the gate reads — is correct as
written. F-02 is a wrong gloss in the record of a closed defect, and F-03/F-04 are the two round-5
prose nits carried forward. None of the four gate Phase I.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

APPROVAL-HASH: sha256:aa1602af45b28c793f4b8a436b19116fcd18ed5957183e0b6539b097d012273b
APPROVAL-HASH-NORMALIZED: sha256:604c163e6fa76690a3616a786bb06f4132856e8eee7987638e964cb81d97f3ad
REVIEWED-COMMIT: df4d1c444bff75a27b47b9121ff80b1341ffc63b
