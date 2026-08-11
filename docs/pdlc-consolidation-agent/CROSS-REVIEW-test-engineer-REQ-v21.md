# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.5)
**Date:** 2026-08-10
**Iteration:** 21
**Scope:** Local (per-finding below)
**Delta base:** `b2156952` (the tree reviewed at v20) → HEAD `cdd187fe`

One commit, one document, 10 insertions / 9 deletions. The delta question is the usual pair: did
v20's blocking finding actually close, and did the revision break anything previously approved?

## What changed

Version moves `2.4 · 2026-08-10` → `2.5 · 2026-08-10`. Three edits, all one decision:

1. **`corpus-unreadable` is withdrawn.** §4b (`:626-628`) now reads "**no reason code is added
   either**", and AC-1.4's third cause (`:227`) drops the parenthetical code, leaving the bare `(§4b)`.
2. **The erratum note is rewritten** (`:26-30`) to record the withdrawal and to assert three
   consequences: no pin moves, no vocabulary row moves, `pdlc-consolidation-vocabularies.md` stays at
   `Version` 1.4. The v2.1–v2.4 notes retire.
3. **§4b substitutes a new distinguisher** for the withdrawn code: "AC-7.1's *LEARNINGS consumed by
   basename* is empty while the un-consolidated set is non-empty, whereas a quiet week has both
   empty. That pairing already distinguishes a corpus nothing can read, in values enumerated here."

Edits 1 and 2 are exactly right and close v20's High. Edit 3 is where this round's findings are.

## Prior findings: resolution verified

| Prior ID | Status | Evidence at HEAD |
|---|---|---|
| F-65 (High) — `corpus-unreadable` used in REQ, no row in the pinned vocabularies §1 | **Resolved**, by deletion rather than by registration — the other of the two exits F-65 named, and the cheaper one | `grep -rn corpus-unreadable` over the repo (excluding review files) returns **zero** hits: gone from REQ, and it never reached FSPEC, TSPEC, PLAN or PROPERTIES, so nothing downstream is stranded. The symmetric defect rule is satisfied in both directions now: the value is used nowhere and has a row nowhere (`pdlc-consolidation-vocabularies.md:20-27`) |
| F-65, second limb — `:618`'s v2.1 clause "no new reason code and no vocabulary row" contradicted the three sentences below it | **Resolved** | `:619` still carries that clause; `:626-628` now agrees with it instead of contradicting it. The paragraph reads as one decision |
| F-65, version-pin consequence | **Resolved, verified mechanically** | The erratum's "no pin moves" claim holds: every vocabularies pin in REQ is still `1.4` (`:96`, `:112`, `:215`, `:257`, `:437`, `:597`, `:606`, `:614`) and the governed file is still `Version 1.4 · 2026-08-06` (`pdlc-consolidation-vocabularies.md:7`). PROPERTIES `:132` ("the literal transcription of vocabularies §1 at `Version` 1.4") therefore stays valid — the forward note I left at v20 is moot, because the fix went the other way. **Nothing downstream needs sweeping in Phase PR.** |
| §4b's six-member terminal-status set | **Intact** | `:625-626` still takes `no-op` "from the six-member set above, so no status is added"; §1's six status rows are unchanged, so PROP-PASS-09's set-equality over statuses is unaffected |

Nothing previously approved regressed. Re-checked in the delta's blast radius: AC-1.4's three-cause
structure and its consumed-set-emptiness rule (`:230-234`) are untouched, and AC-5.3 / AC-5.5 still
key their populations on consumed-set emptiness rather than on the `no-op` label — the invariant most
exposed by editing the third cause survives the edit unbroken.

## Findings

**No High.** Two Mediums, both on the delta's one new sentence; two Lows carried and re-measured.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-66 | Medium | Local | **§4b's replacement distinguisher names one value AC-7.1 does not report, so a test transcribing the sentence has no expected value for half of it.** `:626-628` justifies minting no reason code by asserting the pass is still distinguishable "in values enumerated here", the pair being *consumed-by-basename empty* **and** *un-consolidated set non-empty*. The first conjunct is reported — AC-7.1 (`:520`) lists "LEARNINGS consumed by basename". The second is not: AC-7.1's report list is terminal status and reason code, rung, consumed basenames, promotions by route, the AC-5.2 table, and deferred items; and §3's record grammar (`pdlc-consolidation-vocabularies.md:107-140`) gives the log row no un-consolidated field either. Measured against the row alone, an all-unreadable pass and a quiet week are **field-identical**: both `no-op`, both with an empty consumed pair, both with no reason code. So the oracle a test author would write from this sentence — "these two states are distinguishable from the report" — goes red on a conforming implementation, which is the same defect shape as v20's F-65, one layer along. Two things save the *behaviour* while leaving the *sentence* wrong, and either is the fix. **(a)** The row does carry `trigger` (`cadence` / `volume` / `manual`, §1), and a quiet week can never fire `volume` while an all-unreadable corpus at or above `volumeThreshold` must — so `trigger: volume` + empty consumed pair *is* an in-report pair, exact for that domain and honestly partial below the threshold. **(b)** Better, and already built downstream: PROPERTIES PROP-COR-09 (`:384-390`) asserts "the report body names the **unreadable** basename", which distinguishes the two states positively, by name, at any corpus size. Cite (b) — one clause in §4b, no new field, no vocabulary row, no version bump — and the sentence becomes true and the oracle satisfiable. As written it is an absence-only distinguisher dressed as a positive one. | REQ `:626-628`, `:520`, `:227`; `pdlc-consolidation-vocabularies.md:107-140`; PROPERTIES `:384-390` |
| F-67 | Medium | Local | **The observable that makes F-66's fix (b) work is asserted downstream but obliged nowhere upstream.** PROP-COR-09 conjunct (3) — "the report body names the **unreadable** basename and **not** the readable one" — cites `REQ §4b` as its authority (`PROPERTIES:389-390`), and §9's O-5 pairing table leans on the same conjunct to stop the fixture false-greening (`PROPERTIES:298-300`). But `grep -n "unreadable basename\|names the unreadable"` over REQ and FSPEC returns **nothing**: neither document obliges the report to name unreadable basenames. §4b says only that omission "is not silent: the basename remains in the un-consolidated set that both the hook and the next tick compute" (`:619-620`) — a claim about the *next pass's* recomputation, not about *this pass's report*. A test whose expected value is a literal transcription of the spec has nothing to transcribe here; the conjunct is currently the test author's invention, however sensible. Fixing F-66 with (b) fixes this too, in the same clause, and restores the traceability PROP-COR-09 already claims. Filed separately because it survives if F-66 is fixed via (a) instead. | REQ `:619-620`, `:626-628`; PROPERTIES `:298-300`, `:384-390` |
| F-56 | Low | Local | **Open, re-measured, worse again — sixth consecutive round in one direction.** `wc -l -c` at HEAD: **696 lines / 66,943 bytes** against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`). 5,503 bytes over the byte ceiling (up 185 from v20's 5,318) and **four lines** of line-budget headroom left, down from five. `check-req-size.sh` is PostToolUse and warns rather than blocks, so no oracle reads the number and this stays Low — but four lines is one paragraph, and F-66's fix is a clause, not a section. Land it as an edit-in-place rather than an addition. | REQ file; `check-req-size.sh:41-42` |
| F-54 | Low | Cross-Feature | **Open, re-measured, unchanged.** `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` still reads `Version 1.0 · 2026-08-06`; REQ still pins `1.0` at `:237` and `:487`. Self-consistent, carried only so the pin stays deliberate rather than forgotten. | REQ `:237`, `:487`; `pdlc-advisory-corpus-baseline.md:7` |

## Questions

| ID | Question |
|----|---------|
| Q-06 | **Carried from v20, and this round is the second instance of the class.** F-65 was a value used in REQ with no row in the pinned enumeration; F-67 is an observable asserted downstream with no obligation in REQ. Both are one-directional-containment failures that only a reviewer grepping by hand catches. The mechanical check is still cheap and still unbuilt: extract every backticked kebab value REQ uses in status/reason-code position, extract §1's `Value` column at the pinned version, assert **set-equality both ways**, fail naming the offending value and the direction. `consolidationSkillAnchors.test.js` already mechanises the anchor half of this problem, so the shape exists. Process-scoped, non-blocking, worth a PROPERTIES row or a DoD-time script. |
| Q-05 | **Carried from v19–v20, still half-answered.** The preamble's re-measurement cadence (`:22-26`) decides *when* a shifted anchor is a defect; the remaining half is the grep that resolves every `` `path:NN` `` in `docs/{feature}/*.md` against HEAD and fails where the line is blank, a comment, or does not contain the named role. Unchanged by v2.5. Non-blocking. |
| Q-03 | Carried, still PROPERTIES-layer. AC-3.4's "on the path where no proposal file exists, record nothing into it" (`:276-277`) is absence-shaped; a fixture asserting `not exists(CONSOLIDATION-PROPOSAL-…)` passes on any accidental early exit. Pair it with a positive conjunct on the same path (the artifact that *is* written, the terminal row). |
| Q-02 | Carried unchanged v15–v21. The hook's enumeration and the pass's enumeration deserve one generator-driven **set-equality** property over a synthetic `docs/` tree (tracked, untracked, gitignored, staged-but-deleted, nested, `docs/discarded/`). REQ-CONS-01 step 1 states the two mechanisms agree; the expected set is transcribable from the spec and never derived from either implementation. Containment cannot catch the failure mode that matters — one enumeration dropping a basename the other keeps. |

## Positive Observations

- **The cheaper exit was the right exit, and it was taken cleanly.** F-65 offered two ways out —
  register the code, or withdraw it. Registration cost a vocabulary row, a `1.5` bump and eight
  re-pins across REQ; withdrawal cost two sentences. The author took withdrawal and then *proved* the
  three consequences in the erratum note itself ("No pin, no vocabulary row and no shipped catalogue
  entry moves; `pdlc-consolidation-vocabularies.md` stays at `Version` 1.4", `:28-29`) rather than
  leaving a reviewer to discover them. I checked all three mechanically and all three hold. Writing
  the falsifiable consequences of an edit into the edit is the habit that makes these rounds short.
- **The withdrawal reached zero downstream.** `corpus-unreadable` existed for exactly one round and
  never crossed into FSPEC, TSPEC, PLAN or PROPERTIES, so its deletion strands nothing — and PROPERTIES
  `:132`'s "literal transcription of vocabularies §1 at `Version` 1.4" is still a true statement about
  a real file. A round that adds a vocabulary value and a round that removes it are not symmetric in
  cost; this one landed on the side that costs nothing.
- **The closed sets stayed closed under pressure.** The temptation in a case like this is to widen the
  status set instead of the reason-code set. §4b explicitly refuses both ("taken from the six-member
  set above, so no status is added — and no reason code is added either", `:625-627`), which keeps
  AC-7.1's six-member enumeration and PROP-PASS-09's set-equality over statuses exactly as approved.
  My two findings are about the *justification* for that refusal, not the refusal itself — the
  decision is right.

## Recommendation

**Approved with minor changes** — 0 High, 2 Medium, 2 Low.

Both halves of the delta question answer well.

- **v20's blocking finding is resolved**, by the cheaper of the two exits F-65 named, and verified
  mechanically rather than taken on the commit message: the value is gone repo-wide, the pinned
  enumeration is untouched, every version pin still reads `1.4`, and PROPERTIES `:132`'s transcription
  survives intact. No sweep is owed in Phase PR.
- **Nothing previously approved regressed.** AC-1.4's three causes, the consumed-set-emptiness rule
  that AC-5.3 and AC-5.5 key on, and the six-member terminal-status set all stand as approved.

What remains is one sentence, not one decision. §4b's replacement distinguisher (F-66) cites the
un-consolidated set, which AC-7.1 does not report — so, from the row alone, an all-unreadable pass and
a quiet week are field-identical and the sentence's own oracle would go red. The fix is a clause:
cite the report body naming the unreadable basename, which PROPERTIES PROP-COR-09 already asserts and
which distinguishes the two states positively at any corpus size. That same clause also grounds
PROP-COR-09's third conjunct, currently asserted against a REQ §4b obligation that does not exist
(F-67). No new field, no vocabulary row, no version bump, no AC semantics change.

I am not blocking on it. The decision this round had to make — withdraw the code, keep the closed sets
closed — is made and made correctly; F-66 and F-67 are about how that decision is justified and where
the justification is written down, and they are addressable in the optimizer pass without another
review round. Land them in place rather than as an addition: four lines of line-budget headroom remain
(F-56).

**No upstream defects.** REQ is the root document; nothing upstream of it is wrong, so no ERRATUM
lines are emitted. F-67 concerns PROPERTIES, which is *downstream* of this document — it is recorded
here as a finding on REQ's missing obligation, not routed as an erratum.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:2728a67ad2b31a557c01aa3874598b19b38eaa973a259b6f9088578fca417a9f
REVIEWED-COMMIT: cdd187fe443cfd832ba47d911807e6a9ae3ecd56
