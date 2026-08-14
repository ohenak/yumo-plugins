# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.11, 2026-08-14)
**Date:** 2026-08-14
**Iteration:** 6 (erratum delta-confirmation round)
**Scope:** Confirmation of the Phase F erratum items against `CROSS-REVIEW-software-engineer-REQ-v5.md`.
Diff base `c38feb61` (the commit v5 reviewed) → HEAD `01c27ee4`, two edited sites in the REQ.
Engineering lens only: feasibility, implementability, downstream-citation verification, integration risk.

## Erratum items — disposition

All five raised items landed, and the two edits are the *only* changes to the REQ on this diff
(`git diff c38feb61..HEAD` touches the version row, a new v0.11 changelog paragraph, one word-pair
inside the v0.10 changelog paragraph, and AC-1.3 — nothing else). Items 1, 2 and 4 are three
statements of one defect and are confirmed together; items 3 and 5 are two statements of a second.

| Item (raiser) | Status | Evidence at HEAD |
|---|---|---|
| AC-1.3's "expected set stated in FSPEC" contradicts the ownership FSPEC actually holds — counts in FSPEC, member names in TSPEC §5.4 (pm-author) | **Confirmed** | AC-1.3 (`REQ:264-273`) now reads "an expected set whose **classes and per-class member counts are stated in the FSPEC** and whose **member names are stated downstream in the TSPEC**". That is the split FSPEC §5.2 declares in its own words: "Members are enumerated literally downstream, in TSPEC §5.4's `PK-*` table; the classes and the count are §5.2's" (`FSPEC:496`), with the per-class arithmetic at `FSPEC:509-518` ("manifest 1, package README 1, CLI entry 2, engine modules 15, workflow modules 3, install script 1, licence 0 before / 1 after N-2 ⇒ **23 before N-2, 24 after**"). |
| AC-1.3's class list no longer matched FSPEC §5.2's classes-and-counts / TSPEC-names split (se-review) | **Confirmed** | The surviving class sentence ("That expected set contains the CLI entry, the workflow modules and the engine adapter, and contains no `skills/` directory, no `SKILL*.md` file and no test corpus") is now an *illustrative containment* claim under the set-equality, not the definition of the set — and every one of its members is a real FSPEC §5.2 row: CLI entry (`FSPEC:504`), workflow modules (`:507`), engine modules including `lib/adapter.mjs`, which §5.2 explicitly warns not to double-count (`:529-530`). The exclusion clause matches §5.2's "Excluded, checked by absence under the set-equality" block (`:520-527`) member for member. |
| AC-1.3 asked a verifier to read from FSPEC a literal list FSPEC deliberately does not carry (te-review) | **Confirmed, and the oracle is now writable** | The AC's expected side now resolves to TSPEC §5.4's `PK-*` table, which exists at HEAD (`TSPEC:292` ff., `PK-2`, `PK-3`, `PK-5…PK-19`, `PK-20…PK-22`, `PK-23`) and is what TSPEC PF-4 (`TSPEC:1234`) already asserts against a real `npm pack`. FSPEC BR-8.1 (`FSPEC:534-539`) independently states the same routing — "the literal member list is **TSPEC §5.4's `PK-*` table**, read with the classes and count above". Three documents, one ownership rule; before this edit the REQ was the only one dissenting. |
| `REQ:22`/`:29` cited "FSPEC F-3 step 5" for the run-side `engine.*` pin read; the flow is F-4 step 2 (se-review) | **Confirmed** | The v0.10 changelog now reads "(FSPEC F-4 step 2, BR-2.2, BR-4.7)" (`REQ:29`), and F-4 step 2 (`FSPEC:191-194`) is indeed where the pin read lives: "The pin is read from the `engine.*` namespace of the consumer-owned `.claude/pdlc.config.json` (O-2, grounded in DEC-HE-02) and never written by the engine." |
| v0.10 changelog attributed the pin read to F-3 step 5, which is the plugin-free handshake refusal; prose-only, no AC (pm-author) | **Confirmed, with one precision** | Corrected as above, and the v0.11 entry records the correction as prose-only. Precision worth stating so the next reader does not re-open it: F-3 step 5 is *not* silent on the pin — it says "**Install and upgrade neither read nor write consumer config**; the *run* reads the `engine.*` namespace (F-4 step 2)" (`FSPEC:170-172`). So the old citation pointed at a cross-reference rather than at a false statement; the correction moves it to the owning flow, which is the right target and makes the citation stable if F-3's cross-reference is ever trimmed. |

## Upstream re-grounding (DEC-ERR-03)

The REQ's immediate upstream is the project-level context it cites by id: `docs/_constraints/`,
`docs/_decisions/` and `docs/_queue/`. All three are **byte-unchanged** between `2a1f910d` (the
base of the v0.9 approval this REQ still rests on), `c38feb61` and HEAD — `git diff --stat` over
the three paths is empty on both windows. So every `M-ENG-*`, `DEC-*` and queue-disposition
citation in this REQ still says at HEAD exactly what it said when it was approved; there is
nothing to absorb and no upstream decision this round routes back.

Spot-checked the facts the edited sites lean on, since a re-grounding claim that names nothing is
not a check:

- **M-ENG-11** still records `pdlcPluginCompat: "^0.22.0"` (`pdlc-engine-baseline.md:221`) and
  still records the absent `files` field that AC-1.3's "declared list would pass vacuously"
  parenthesis depends on — so the tarball oracle is still the *only* non-vacuous one, which is the
  whole reason AC-1.3 is phrased over packed contents.
- **DEC-HE-02** still reserves `engine.*` as the engine's only consumer-config surface, which is
  what F-4 step 2 — the newly cited flow — claims of it, in the direction it claims it.
- The **downstream** documents this AC now delegates to have both moved since v0.9 (FSPEC v0.2 →
  v0.5, TSPEC → v0.10), so their content was re-read rather than assumed: FSPEC §5.2's counts and
  TSPEC §5.4's `PK-*` table are quoted above at HEAD line numbers, not from the versions I last
  reviewed. The delegation AC-1.3 now performs lands on text that exists today.

## Prior findings still open

None of the three was in this erratum's item list, and none was touched by this diff. All are
carried forward rather than silently dropped; all remain non-gating.

| ID | Sev | Status | Note at HEAD |
|---|---|---|---|
| F-25 (v4) | Medium | **Open (carried)** | AC-3.4's local-expansion carrier still puts no bound on what may appear in a job `name:`. Still implementable today — only `${{ matrix.os }}` / `${{ matrix.node }}` interpolate (`FSPEC:435-441` transcribes exactly those two, and `pr-tests.yml:28`, `:78` still agree) — so the exposure remains future, not present. Owner unchanged: FSPEC's §5.1, which is the right place to bound the expression form. |
| F-27 (v5) | Low | **Open (carried)** | AC-3.5(b)'s "naming the missing secret" still needs a deliberate preflight step; `npm publish` with an absent `NODE_AUTH_TOKEN` names the registry, not the repository secret. Fails loudly either way, so the AC's outcome holds; the cost note belongs in FSPEC's F-5 publish flow. |
| F-28 (v5) | Low | **Open (carried, and now one round staler)** | `FSPEC:172-173` still reads "NG-6's own wording is an erratum against the REQ, not fixed here." NG-6 has been fixed since REQ v0.10 — two REQ versions ago now. A one-line deletion on the FSPEC's next pass. |
| F-26 (v4) | Low | **Open (carried)** | `pdlc-engine-baseline.md:209`'s change-control sentence inside M-ENG-10 is unchanged (that file is byte-identical across both diff windows). Constraints-file fix, nothing wrong in the REQ. |

## Findings

New this round, scoped to the two edited sites. One, and it is Low; it does not block.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-29 | Low | Local | **AC-1.3 now says the per-class counts are "stated in the FSPEC", but one of those counts is not a constant — the licence class is `0` or `1` depending on an operator decision recorded in a third document.** FSPEC §5.2 states it honestly (`FSPEC:503`, `:509-511`: licence `0`, or `1` "once N-2's operator licence decision is recorded" in `DECISIONS-plugin-distribution.md`, giving the **23 before / 24 after** pair). So the AC's phrasing is true, but a verifier reading only the AC will expect to open the FSPEC and find *a* number, and will find a conditional whose discriminator lives in a decisions file the AC does not name. The consequence is a real test-authoring question, not a wording nit: PF-4's expected set has two legal shapes at any moment, and which one is in force is decided by whether a decision has been *recorded* — not by whether `pdlc/engine/LICENSE` exists, which is the mistake FSPEC §5.2 explicitly warns against. No REQ edit is required, because §5.4/§5.2 already carry the discriminator and the REQ should not restate a downstream count; naming it here so the PROPERTIES/TSPEC pass does not discover it as a surprise when PF-4 goes to fixture. | AC-1.3, FSPEC §5.2, TSPEC §5.4, O-8(3)/N-2 |

**Checked and explicitly not a finding, so it is not "fixed" by symmetry later:** AC-3.4's parallel
construction — "two set-equalities hold against an expected set stated in the FSPEC" — is *not* the
same defect and needs no matching edit. FSPEC §5.1 transcribes that set **literally**, both
alphabets, five rows, authored and rendered columns side by side (`FSPEC:435-441`), so AC-3.4 asks
a verifier to read something the FSPEC really carries. The AC-1.3 erratum was specific to the
packed-content set, whose members are TSPEC-owned by a deliberate §5.2 decision. Two ACs, two
different ownerships, both now stated correctly.

## Questions

| ID | Question |
|----|---------|
| Q-05 | *(carried, unanswered — no text changed on this round)* O-7 settles the two version numbers and the tag, but not the cadence underneath: a prompt-only plugin minor can put the installed engine outside `pdlcPluginCompat` (still `^0.22.0` at HEAD against plugin `0.22.7`, M-ENG-11) and trip AC-1.1's refusal until an engine republish lands. Is "republish the engine on every plugin minor" the accepted operating cost, or is O-6's per-release range-widening the intended relief? |
| Q-06 | *(carried)* AC-5.6 fixes what a run does when `PDLC_PLUGIN_ROOT` stops being honoured on presence alone, but not whether `REMEDY` (`pdlc/engine/lib/handshake.mjs`) changes with it — it *advertises* the variable as the remedy. Is "ignored" scoped to dev-mode marking only, leaving plugin-root resolution untouched? |
| Q-08 | *(carried)* O-9 now owns three obligations of the same shape (AC-4.2's version pair, AC-4.5's authored-file enumeration, AC-6.2's load root). One design decision or three? Saying so at O-9 would keep Phase 1 scoped. |

## Positive Observations

- **The edit moved the REQ's claim to match the downstream ownership, rather than moving the
  downstream documents to match the REQ.** That was the correct direction and the cheaper one by a
  wide margin: FSPEC §5.2's classes-and-counts / TSPEC-names split is load-bearing for a reason it
  states in its own text — per-class counts are invariant under a decomposition swap that a total
  count would miss, and the member list has to live where decomposition is decided. Forcing a
  literal member list into the FSPEC to satisfy the old AC wording would have created a third copy
  of the packed set and a third drift surface. One REQ sentence changed instead.
- **The AC keeps its teeth.** The rewrite could easily have softened set-equality into "contains",
  which is the failure mode the AC's own parenthesis warns about (a subset check passes a vendored
  skills tree). It did not: "equals, member for member … so an added file fails and a removed
  module fails" survives verbatim, and TSPEC PF-4 already asserts exactly that against a real
  `npm pack` rather than `--dry-run`. The delegation changed where the expected side is *read
  from*, not how strictly it is compared.
- **The citation correction was applied to the flow that owns the behaviour, not to the nearest
  sentence that mentions it.** F-3 step 5 does mention the pin read, so "F-3 step 5" could have
  been defended; pointing at F-4 step 2 instead makes the citation survive a future trim of F-3's
  cross-reference. Small choice, right one.
- **Blast radius honestly zero.** Two edited sites, both traceable to the raised items, no AC
  semantics changed beyond the one re-worded clause, and the changelog says "no other change" —
  which the diff confirms rather than merely asserts. The document remains inside its size budget
  (614 lines against the 700-line / 60 KB REQ budget) after five changelog rounds.

## Recommendation

**Approved with minor changes.**

All five erratum items are confirmed landed at HEAD, verified against the downstream text they
delegate to rather than against the changelog's description of it. Upstream (`docs/_constraints/`,
`docs/_decisions/`, `docs/_queue/`) is byte-unchanged, so no prior citation has gone stale and
nothing is absorbed this round. One new Low finding (F-29, the conditional licence count) and four
carried non-gating findings, none of which is a REQ edit: F-25/F-27/F-28 are FSPEC-side, F-26 is a
constraints-file line. No High findings, open or new — the REQ stays approved.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 4}
