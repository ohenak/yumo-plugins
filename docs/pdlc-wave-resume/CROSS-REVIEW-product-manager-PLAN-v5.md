# Cross-Review: product-manager — PLAN (delta confirmation, erratum round)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (Version 1.2)
**Date:** 2026-08-23
**Iteration:** 5 (delta confirmation of the erratum edit, not a fresh review)
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity

## Overview

This is a delta confirmation of one edit: PLAN v1.1 → v1.2, 54 insertions and 15 deletions across
eight commits (`6676deed`…`423d6802`). The PLAN's bytes are now
`sha256:3cf0229a2093fa6a6b69ad7baa105e0185ca7d97e5363e979795e207928ea3e7`, no longer the
`5f5b50db…` my v3 approved and my v4 confirmed unchanged.

The edit lands four routed items, and it lands them well. It does **not** land the High finding my
v4 raised, and the v1.2 revision-history row — which names `CROSS-REVIEW-product-manager-PLAN-v4.md`
in the header's `Cross-Reviews` cell — does not mention that finding at all, neither as applied nor
as absorbed nor as rejected. That is the whole of this round's High: not a new defect, but a routed
obligation that went silent.

Two Low findings from v3, re-filed in v4, are also still unlanded. They were one-line corrections
then and are one-line corrections now.

Per DEC-ERR-03 I re-read every upstream document at its dispatched hash rather than from memory, and
re-checked every PLAN claim that leans on them. All four upstream hashes match the dispatch exactly:
REQ `17e83bfc…`, FSPEC `9a6be7b5…`, TSPEC `4b5f7f5b…`, DECISIONS `37b3684d…`. No acceptance criterion
was narrowed, broadened or re-triggered by this edit, and no P0/P1 requirement lost its owning task.

## Batches

The edit's four landed items, each checked against the upstream text at HEAD rather than against the
routing note that requested it.

| Routed item | What v1.2 did | Faithful to upstream at HEAD? |
|---|---|---|
| **§5.7 `numRuns`** — routed as "TSPEC leaves the generative run count to fast-check's default while PLAN T-08 pins 500" | Absorbed, not applied: the revision-history row states TSPEC v1.4 now pins 500, which is what T-08 already said, and T-08 is left untouched | **Yes — and the routing note is the thing that was stale.** TSPEC:843–844 at HEAD reads `fc.assert(fc.property(…), { numRuns: 500 })` — "**the run count is pinned at 500, not left to fast-check's default**" — and TSPEC:845–846 adds "All four laws P-1…P-4 take the pin; PLAN T-08 and PROPERTIES carry the same figure, so the three documents agree." Absorbing rather than applying was the correct call; applying it would have *created* the divergence |
| **`docs/pdlc-wave-resume/**` absent from A-1's frozen glob list** (raised by pm-review, te-author, se-review; PROPERTIES:278 routed it as an `ERRATUM: PLAN`) | New **T-11**, batch 1, owning `documentOracles.test.js` and `docs/_constraints/pdlc-retirement-baseline.md` | **Yes.** `A1_GLOBS` at `documentOracles.test.js:712–724` carries `docs/pdlc-plugin-retirement/**`, `docs/pdlc-advisory-wave-gate/**`, `docs/pdlc-learnings-injection/**` and no `docs/pdlc-wave-resume/**`. T-11 owns **both** halves and says why (`PROP-SWEEP-3`, at `:814`, requires every `A1_GLOBS` entry to carry a baseline disposition), so a one-sided fix that trades one red for another is foreclosed. The cited precedent row exists at `pdlc-retirement-baseline.md:112` and carries exactly the three things T-11 promises to record |
| **`.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json`, `pdlc/workflows/coverage/**` tracked in the index** (se-review) | New **T-12**, batch 1, index-only cached removal | **Yes, and measured.** `git ls-files .claude/` returns four paths, not two: `pdlc-wave-state.json`, `pdlc.config.example.json`, `pdlc.config.json`, `settings.json`. `git ls-files pdlc/workflows/coverage/` is non-empty. The set-equality oracle T-12 names therefore is red today, exactly as claimed |
| **T-04's `distribution.checkEnabled` fixture rationale** (te-author, PROPERTIES §Fixtures) | T-04's fixture set corrected from three-required to two-required-plus-one-inert, with the retirement evidence transcribed | **Yes.** `git grep -l parseDistributionCheckEnabledOptOut origin/main` resolves only under `docs/completed/**` — three files, all archived. PROPERTIES:736 records the same evidence and routes **two** erratum lines, one at TSPEC AT-16 and one at PLAN T-04; TSPEC:767 still carries the three-fixture rationale, so the TSPEC half is upstream's to close, not PLAN's |

On the last row specifically: PLAN v1.2 openly says it is correcting a premise TSPEC still records
("Fixtures, corrected in v1.2 against the retirement TSPEC AT-16 still records"). A downstream
document contradicting its upstream would normally be a fidelity finding from where I sit. It is not
one here, because the divergence is declared rather than smuggled, the evidence is transcribed so a
reader can check it in one command, and the matching `ERRATUM: TSPEC` line is already open from
PROPERTIES. The product-lens consequence is nil either way: the fixture is inert, AT-16's three
oracle conjuncts are unchanged, and REQ-WVR-07's structural coverage is untouched.

**On scope.** Two tasks were added to a plan whose revision-history row says "no scope change, no
task restructured". Both statements survive scrutiny: T-11 and T-12 land no TSPEC delta row (D-1…D-11
are untouched), implement no requirement, and change no acceptance criterion. They exist because a
wave gate is a whole-suite gate, and §2.2's new paragraph makes exactly that argument and names the
rejected alternative (weakening batch 1's gate wording) with the reason it fails — the gate is
script-owned and compares an exit code, so there is no wording the runtime reads. That is a product
decision recorded where a reviewer can see it, which is the right place for it. Batch 1's gate
wording was genuinely unsatisfiable as written in v1.1; leaving it that way would have halted wave 1
on reds this feature did not introduce.

## Dependencies

PLAN's citations of upstream, re-read at the dispatched hashes. Only citations the edit reaches, or
that a prior round left open, are listed; the nineteen I walked in v4 were re-checked and none moved.

| PLAN citation | Upstream at HEAD | Status |
|---|---|---|
| §1.1's D-1…D-11 delta enumeration | TSPEC §1.2 | Unchanged; v1.2 adds no delta row, so the enumeration still matches |
| T-08 "`numRuns: 500`", §4.5's DoD line | TSPEC:843–846 | **Agrees, verbatim on the figure and on the precedent file** |
| T-04 fixtures, AT-16 | TSPEC:767, DECISIONS DEC-WVR-07 | Declared divergence on the fixture *rationale*; AT-16's three oracle conjuncts (i)(ii)(iii) and the falsification arm are transcribed unchanged |
| T-11's `A1_GLOBS` / baseline claims | `documentOracles.test.js:712`, `pdlc-retirement-baseline.md:112` | Verified against the tree, not against the routing note |
| T-12's tracked-artifact claims, §3.3's two corrections | `git ls-files` | Verified; §3.3's exclusion notes now say "tracked in this tree despite the ignore rule", which is the true statement |
| §4.3's mutation table, T-07's "rows 1–4", RK-1, §4.5's checkbox, §1.1's count sentence | **TSPEC §5.5, which enumerates five** | **F-01 — still open, unlanded this round** |
| §3.4's `Coverage floor` row | TSPEC RT-7 at HEAD | **F-02 — RT-7 now reads "the last implementation **task** (PLAN T-10, RK-2)"; the row still describes an open erratum** |
| §4.4's RK-2 | TSPEC §5.8 / RT-7 at HEAD | **F-03 — same staleness, same one-line fix** |

**On F-01, and why it is still High.** TSPEC §5.5 at HEAD opens "Five mutations this suite is
specifically designed to kill" and its fifth is "Suppressing the record write while `explicitPointer`
is true (writing only on automatic runs). Killed only by AT-05's write-side conjunct." PLAN §4.3 is
headed "Mutation resistance — **four** mutations" and its table has four rows; T-07's mutation duty
reads "(§4.3 rows 1–4)"; RK-1 leans on "§4.3's four mutations are *executed*"; §4.5's checkbox reads
"Each of §4.3's four mutations". The mutation TSPEC added is the one that removes the record write on
exactly the operator-pointed runs §2.5 ratifies the write for — the feature's core promise that an
operator who resumes a wave still gets a record written, so the *next* resume works. PLAN will ship
the AT-05 assertion, because PLAN cites ATs by id and delegates their text upstream. What PLAN will
not do is prove that assertion has teeth, because the mechanism PLAN built for exactly that proof —
apply, observe RED, revert, record — does not know the mutation exists.

This is not a description defect that a reader can route around. It is a unit of work the plan does
not schedule, which is why it sits above the line the two Lows sit below.

**On the provenance tag.** I tagged F-01 `delta` in v4 and tag it `delta` again, on the second limb
of the definition: this round's edit left a routed item unlanded. `inherited` is the more comfortable
tag and I considered it honestly — §4.3's bytes did pre-date this round and the edit did not touch
them. But the round was convened to land routed corrections, the header claims v4 as an input, and
the revision-history row accounts for every other routed item including the one it declined to apply.
Silence on the only High is the thing the tag has to report. The tag is the gate's input, not a
comment, so it goes where the evidence points.

**Locality is `nonlocal`,** measured honestly: the defect's home is §4.3, which the edit did not
touch. The edit did change §4.5, where one of the five count corrections lands, and the revision
history, which is where the omission is visible — but the primary site is outside the edit, so
`nonlocal` is the truthful call.

**The fix remains small and unchanged from v4.** Add a fifth row to §4.3 (mutation: suppress the
record write while `explicitPointer` is true; oracle: AT-05's write-side conjunct; applied and
observed by: T-07), then update five count claims — §4.3's heading, §1.1's line-175 sentence, T-07's
"rows 1–4", RK-1, and §4.5's checkbox. No new task, no batch move, no `Deps` edge change, no
re-parse: T-07 already owns AT-05 and already carries a mutation-duty step.

## Verification

Every claim above is a command I ran, not an impression.

| Claim | Verification | Result |
|---|---|---|
| PLAN's bytes moved this round | `shasum -a 256` vs. v3's `APPROVAL-HASH` | `3cf0229a…`, was `5f5b50db…` — changed, as an erratum round should |
| All four upstream docs match the dispatch | `shasum -a 256` on REQ/FSPEC/TSPEC/DECISIONS | `17e83bfc…` / `9a6be7b5…` / `4b5f7f5b…` / `37b3684d…` — four for four |
| Edit size and shape | `git diff --stat 6676deed^..HEAD` on the PLAN | 54 insertions, 15 deletions, one file |
| TSPEC §5.5 enumerates five | `sed -n '/### 5.5/,/### 5.6/p'` | "Five mutations…", items 1–5, the fifth killed only by AT-05's write-side conjunct |
| PLAN still says four, in five places | `grep -n "four mutations\|rows 1–4"` | §4.3 heading (`:376`), §1.1 (`:175`), T-07 (`:120`), RK-1 (`:405`), §4.5 checkbox (`:430`) — plus a four-row table at `:384–388` |
| No PLAN row owns the fifth | Read `:384–388` | Rows: ancestry guard / write outside transport branch / run-relative wave number / eager ancestry probe. **No suppressed-write row** |
| TSPEC pins `numRuns: 500` | `sed -n '836,852p'` on the TSPEC | "the run count is pinned at 500, not left to fast-check's default"; "PLAN T-08 and PROPERTIES carry the same figure" |
| The drift gate is retired | `git grep -l parseDistributionCheckEnabledOptOut origin/main` | Three hits, all under `docs/completed/**` |
| `docs/pdlc-wave-resume/**` is off `A1_GLOBS` | `grep -n "A1_GLOBS" -A12 documentOracles.test.js` | Thirteen entries at `:712–724`; this feature's directory is not among them |
| The precedent row exists and matches | `grep -n "pdlc-advisory-wave-gate" pdlc-retirement-baseline.md` | `:112` — rationale, one-directory scope justification, measured hit count |
| The machine-generated artifacts T-12 names are tracked | `git ls-files .claude/`, `git ls-files pdlc/workflows/coverage/` | Four `.claude/` paths (not the two the set-equality oracle demands); coverage output tracked |
| TSPEC RT-7 no longer diverges from PLAN | Read TSPEC RT-7 | "the last implementation **task** (PLAN T-10, RK-2) runs `npm run test:coverage`… Not `implementation.postWaveCommand`" — TSPEC now agrees with PLAN and cites it |
| PLAN still describes that as open | `grep -n "Coverage floor"`, `grep -n "RK-2"` | `:315` "the erratum this dispatch raises"; `:406` "the difference from TSPEC's wording is raised as an erratum" |
| Requirement coverage unchanged | Re-walked REQ-WVR-01…-10 and FSPEC-WVR-01…-07 against §2.1's owners | Every P0/P1 still has an owning task; T-11 and T-12 add owners, remove none |

## Positive Observations

- **Absorbing the `numRuns` item instead of applying it was the right and the harder call.** The
  routing note asserted a divergence that TSPEC:843 had already closed in the other direction.
  Applying it would have unpinned T-08 and created the very gap round-1 F-06 was raised about. The
  revision-history row says "absorbed, not applied" in as many words, so the decision is auditable.
- **T-11 and T-12 are argued as preconditions, not smuggled as scope.** §2.2's new paragraph names
  the rejected alternative and says why it fails against a script-owned gate. From a product lens
  that is the model: the reader can disagree with the decision because the decision is on the page.
- **T-12's boundary note is the kind of detail that prevents a self-inflicted red** — the removal is
  index-only, never a working-tree delete, because T-01 reads `.claude/pdlc.config.json` from disk.
- **§3.3's two corrections retract claims that were flatly untrue** ("untracked") rather than
  softening them, and say which commit made them untrue. Retractions that name the evidence are
  worth more than the original claim was.
- **T-12's empty ownership cell, and the parse re-run that caught the near miss.** The manifest cell
  first carried a backticked command string that the ownership parser would have read as a path. The
  §5 parse table records the near miss rather than quietly fixing it.

## Recommendation

**Needs revision.** One High finding, unlanded from v4. The fix is the five-line edit set above: a
fifth row in §4.3 owned by T-07, and five count corrections. The two Lows are one-line re-pointings
of §3.4's `Coverage floor` row and §4.4's RK-2 at TSPEC RT-7's current text; all three should land in
one edit.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | nonlocal | TSPEC §5.5 at HEAD enumerates **five** mutations; PLAN §4.3 still transcribes four. The fifth — suppressing the record write while `explicitPointer` is true, killed only by AT-05's write-side conjunct — has no row, no oracle pairing, no owning task, no execution step in T-07's "Mutation duty (§4.3 rows 1–4)", no RK-1 commitment and no §4.5 DoD checkbox. It is the mutation that removes resume from exactly the recovery path §2.5 ratifies the write for. Raised as v4 F-01 and routed into this round; v1.2's revision-history row names v4 as an input and accounts for every other routed item, but is silent on this one. Fix: add the fifth row to §4.3 (oracle: AT-05's write-side conjunct; applied and observed by: T-07) and update the five "four mutations" claims at §4.3's heading, §1.1 (`:175`), T-07, RK-1 and §4.5's checkbox. No new task, no batch move, no `Deps` change, no re-parse. | §4.3 Mutation resistance; T-07 (§2.1); RK-1 (§4.4); §4.5 DoD |
| F-02 | Low | delta | nonlocal | §3.4's `Coverage floor` row still reads "See RK-2 in §4.4 and the erratum this dispatch raises", but TSPEC RT-7 at HEAD already assigns the floor to "the last implementation **task** (PLAN T-10, RK-2)" and gives PLAN's own reasoning back. No erratum is open. Raised as v3 F-01 and v4 F-02; unlanded. Fix: keep the row's value (`T-10`, not `postWaveCommand`) and the V-13 four-key reasoning verbatim; replace the erratum clause with a citation of TSPEC RT-7 as agreed. | §3.4 Configuration points — `Coverage floor` row |
| F-03 | Low | delta | nonlocal | §4.4's RK-2 still reads "TSPEC §5.8 asks for it as the last wave's `postWaveCommand`" and closes "the difference from TSPEC's wording is raised as an erratum". Both clauses are false against TSPEC RT-7 at HEAD, which assigns the floor to the last implementation task and cites PLAN T-10 / RK-2 by id. Raised as v3 F-02 and v4 F-03; unlanded. Fix: leave the merge-gate risk and its mitigation text unchanged; record that TSPEC §5.8 now assigns the floor to T-10, in place of describing an open disagreement. | §4.4 Risk register — RK-2 |

FINDING: High | delta | nonlocal | §4.3 Mutation resistance / T-07 mutation duty / RK-1 / §4.5 DoD checkbox | TSPEC §5.5 at HEAD enumerates five mutations and PLAN §4.3 transcribes four — the fifth (suppress the record write while `explicitPointer` is true, killed only by AT-05's write-side conjunct) has no owning task, no oracle pairing, no execution step and no DoD checkbox, so the mutation TSPEC added to protect the resume recovery path is one nobody runs; routed into this round as v4 F-01 and left unlanded without mention in v1.2's revision history — add the fifth §4.3 row owned by T-07 and update the five "four mutations" count claims
FINDING: Low | delta | nonlocal | §3.4 Configuration points — `Coverage floor` row | the row cites "the erratum this dispatch raises" but TSPEC RT-7 at HEAD already assigns the floor to the last implementation task and cites PLAN T-10 / RK-2 — re-point the row at TSPEC RT-7 as agreed, keeping the T-10 assignment and the V-13 reasoning unchanged (v3 F-01, v4 F-02, unlanded)
FINDING: Low | delta | nonlocal | §4.4 Risk register — RK-2 | RK-2 states "TSPEC §5.8 asks for it as the last wave's `postWaveCommand`" and "the difference from TSPEC's wording is raised as an erratum"; both are false against TSPEC RT-7 at HEAD — record the agreement and leave the merge-gate risk and its mitigation text unchanged (v3 F-02, v4 F-03, unlanded)

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 2}
