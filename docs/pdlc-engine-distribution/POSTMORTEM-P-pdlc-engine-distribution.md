# POSTMORTEM — Phase P — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → `PLAN` → **POSTMORTEM-P** |
| Downstream | operator decision; `LEARNINGS-pdlc-engine-distribution.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{1..4}.md` (8 files); `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v3.md` (2 files, erratum confirmation) |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 1.0 | 2026-08-13 |

RESOLVED: no

## Phase Summary

**Phase P's own review loop converged. The halt is the erratum channel, not the PLAN.**
`PLAN-pdlc-engine-distribution.md` reached `v0.4` and both reviewers signed it in round 4
(`Approved with minor changes`, anchors recorded at `3820543b`). What halted the phase is the
*upstream* erratum raised against the FSPEC during the PLAN rounds: the erratum edit landed, the
bounded delta-confirmation round ran, and **both confirming reviewers returned Needs revision with
one High each**. The erratum budget is one round per upstream document per phase, so the failed
confirmation halts Phase P.

| | |
|---|---|
| PLAN | `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` **v0.4**, 59 tasks, 11 batches, both verdicts `Approved with minor changes` |
| Upstream under erratum | `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` **v0.3 at HEAD** |
| Branch | `feat-pdlc-engine-distribution` |
| Halt reason | Erratum delta-confirmation failed: `se-review` `{1, 1, 1}` and `te-review` `{1, 0, 1}`, both High, one erratum round per upstream doc per phase already spent |
| Round budget | Phase P review rounds: **4 of 5 used**, not exhausted. FSPEC lifetime rounds: **3 of 15**. Neither budget is the constraint — the erratum-round budget is |
| Commits under confirmation | `aa4d4a50..HEAD` on the FSPEC — `8bb5fb40` (erratum edit), `768a0046` (changelog avoids restating the dangling id) |

The distinction matters for the fix: nothing in the PLAN was found wrong, and no reviewer re-opened
a settled PLAN decision. The blocking defect is entirely inside the five lines the erratum edit
itself wrote into the FSPEC.

## The Erratum Round

Two items were routed upstream to the FSPEC across the PLAN rounds, plus a re-grounding obligation
on REQ `v0.10` (which moved under the FSPEC during Phase F's own erratum round).

| # | Raised item | Filed by | Landed in `v0.3`? | Evidence |
|---|---|---|---|---|
| 1 | §3 F-7 step 4 cites "§8's AT-7.2"; §8 enumerates no `AT-7` group — the criterion meant **AT-6.2** | `pm-review`, `te-review`, `se-author` (5 filings across rounds) | **Yes, cleanly** | `FSPEC:296` now reads "§8's AT-6.2"; `grep -n 'AT-7'` returns only the changelog's description of the fix (`:20-21`), no dangling id survives. Both confirmers checked the target on substance, not numbering: AT-6.2 (`:755`) is the manual load-root/coexistence observation whose two-conjunct channel test F-7 step 4 describes (`:773`, `:775` corroborate) |
| 2 | AT-3.8a's expected packed set ("the manifest, `bin/pdlc.mjs`, twelve named `lib/*.mjs` modules") contradicts TSPEC §5.4's `PK-*` table (23 members before N-2, 24 after E-4b's `bin/cli.mjs` split) — an implementer transcribing the FSPEC ships four members | `se-author` (twice) | **Partly — contradiction removed, replacement is the blocking finding** | §5.2's CLI-entry and engine-module rows no longer enumerate members ("named in TSPEC §5.4", `:474-478`); AT-3.8a (`:691`) now says the members "are named downstream, in TSPEC §5.4's `PK-*` table" and that this document must not restate the list. The wrong literal is gone; no literal replaced it |
| 3 | Re-ground on REQ `v0.10` — NG-6/O-2's run-reads-`engine.*`-pin scope, AC-3.5's paired positives | erratum protocol (DEC-ERR-01) | **Yes** | Header cites REQ `v0.10` (`:9`); NG-6/O-2 recorded as **absorbed** (already carried by §3 F-4, BR-2.2, BR-4.7, I-4, E-11); AT-3.5 (`:678-684`) now carries AC-3.5's two positives — credential present ⇒ authenticated publish and release cut, absent ⇒ named failure, nothing published |

Both confirmers verified the edit stayed targeted: `git diff` over `aa4d4a50..HEAD` touches only the
header/changelog, `FSPEC:296`, two §5.2 rows, AT-3.5 and AT-3.8a. No settled section moved, and
AT-3.8b remains correctly `[blocked on O-10]`.

## Delta-Confirmation Verdicts

| Reviewer | Verdict | Counts | Blocking finding | Method |
|---|---|---|---|---|
| `se-review` (software-engineer) | **Needs revision** | `{1, 1, 1}` | `F-01` (High): the routing edit rehomed only **four of seven** divergent members. TSPEC §5.4 also names `README.md` (PK-2), `LICENSE` (PK-3, conditional on N-2) and `scripts/postinstall.mjs` (PK-23), and §5.2 has **no class row** for any of them while AT-3.8a still gates on member-for-member equality **in both directions** (`:691-696`). Worse, the exclusion list still says "no repo-level documentation" (`:478`), which now collides with the package README | Diffed the erratum range against upstream REQ `v0.10` (hash matched dispatch) and downstream `TSPEC:408-419`; checked the AT-6.2 target for semantic fit, not just id existence |
| `te-review` (test-engineer) | **Needs revision** | `{1, 0, 1}` | `F-01` (High): upstream **REQ AC-1.3 still requires** the packed list to equal "an expected set **stated in the FSPEC**" (`REQ:257-262`), and REQ `v0.10`'s changelog re-decided only NG-6/O-2 and AC-3.5 — AC-1.3's ownership was never re-decided. So the FSPEC is no longer a faithful compression of its upstream, AT-3.8a's oracle is unresolvable inside the REQ+FSPEC pair, and a decomposition edit in TSPEC §5.4 silently redefines what an acceptance test asserts with no FSPEC-side change-control point | Re-measured the diff range; scored the falsifiers individually — "an added `SKILL.md` fails" and "an added test file fails" survive (those are §5.2's still-literal exclusions), but "**a removed member fails**" is now unfalsifiable at this altitude because no member is named |

Supporting non-blocking findings, both worth folding into the same edit:

| ID | Reviewer | Severity | Finding |
|---|---|---|---|
| `F-02` | SE | Medium | BR-8.1 still instructs the verifier to take the expected side from "the literal list above" (`:500`) — after the erratum there is no list above. The sentence contradicts AT-3.8a's corrected text and points an implementer back at the FSPEC-local copy the erratum deleted |
| `F-02` | TE | Low | §1 still self-describes the FSPEC as owning packed-content (AC-1.3) (`:32-33`) while §5.2 forward-delegates it; the two statements cannot both be true |
| `F-03` | SE | Low | REQ `v0.10`'s changelog attributes the run-side pin read to "FSPEC F-3 step 5" (`REQ:21`) where the flow lives in **F-4** (`:158`, `:170`). Prose-only, no behavioural consequence — recorded, not raised, because the phase's erratum budget was already spent |
| `Q-01` | SE | Question | §5.2's workflow-module row is still `[blocked on O-10]` even though `TSPEC:421-429` unblocks it (PK-20…PK-22) — downstream is ahead of upstream |
| `Q-01`/`Q-02` | TE | Question | Which repair direction is intended, and if §5.2 restates the set, is the count **23** (before N-2's `LICENSE` decision) or **24** (after E-4b's `bin/cli.mjs` split)? |

## The Two Highs Are One Defect

The reviewers did not disagree. They measured the same edit from opposite ends and each named the
half visible from their lens:

- **SE looked downward** (does an implementer get a complete expected set?) and found the routing
  incomplete: four of seven members rehomed, three left with no class anywhere.
- **TE looked upward** (is the document still a faithful compression of REQ?) and found the routing
  itself unauthorised: AC-1.3 assigns the expected set to the FSPEC, and no REQ-layer decision moved
  it.

Both descriptions are of one edit that **removed one side of a contradiction instead of reconciling
the two sides**. Before the erratum, §5.2 and AT-3.8a carried a literal set that disagreed with
TSPEC §5.4. After it, they carry no set at all. That trade is strictly better for the implementer
(nobody now ships four members), and strictly worse for the oracle (nothing now falsifies a removed
member at FSPEC altitude). Neither reviewer disputed the structural instinct — a single downstream
source beats two copies that will diverge again — and SE explicitly endorsed it as "the correct
structural fix". What neither would sign is the same fix performed at a layer that does not own the
decision.

**The PLAN is unaffected by either reading, which is why this halt costs nothing already built.**
PLAN `T16` (`:136`) already transcribes PF-4's both-directions expected set from **TSPEC §5.4's
`PK-*` table** (23 members, 24 after E-4b), not from the FSPEC — the implementation-level oracle was
already grounded where the erratum tried to point. `T05` (`:125`) already owns `pdlc/engine/LICENSE`
and the `license` field, closing the PK-3 flip that TE's round-1 PLAN `F-02` opened. The only PLAN
surface that touches the deleted text is §2.1's AT-3.8a row (`:209`), which reads "packed equals
§5.2's classes" — true again the moment §5.2 has classes for all seven members.

## Best-Guess Root Cause

**The erratum resolved a two-layer disagreement by editing one layer, at the layer that does not own
the decision. Moving expected-set ownership from FSPEC to TSPEC is a REQ-layer change (AC-1.3 states
where the set lives); performing it inside an FSPEC erratum round left the change unauthorised
above and incomplete below, and the bounded confirmation round had no budget left to repair either
half.**

Contributing conditions, in order of leverage:

1. **A downward-routing fix needs an upward erratum first.** DEC-ERR-01's protocol re-grounds an
   edited document against its *immediate upstream* before touching raised items, which the round
   did faithfully for NG-6/O-2 and AC-3.5. But it re-grounds to absorb what upstream **already
   decided** — it has no step for noticing that the repair you are about to write **requires a new
   upstream decision**. The multi-layer wave (`ERRATUM: REQ:` on AC-1.3, then FSPEC, then TSPEC)
   was available and was not raised, because the FSPEC-level fix looked self-contained from inside
   the FSPEC.

2. **The item as filed named the contradiction, not the resolution.** The raised item said
   AT-3.8a's set contradicts TSPEC §5.4 — true, and closeable in either direction. Nothing in the
   filing said which document should win, so the author picked the direction that made the smallest
   edit. TE's `Q-01` asks exactly this question after the fact; had it been decided in the filing,
   the round would have carried either a complete §5.2 restatement or a REQ erratum, and would have
   confirmed.

3. **Set-equality oracles degrade silently when the set is delegated.** Three of AT-3.8a's four
   falsifiers (added `SKILL.md`, added test file, extra manifest member) survive delegation because
   they sit in §5.2's exclusion list, which stayed literal. Only "a removed member fails" dies. A
   fix that keeps three quarters of an oracle green reads as complete to its author and fails
   exactly the reviewer who scores falsifiers one at a time — TE did, and that is the whole delta
   between "landed" and "Needs revision" on item 2.

4. **Budget shape, not budget size.** One erratum round per upstream doc per phase is the right
   damping constant for a channel that would otherwise let a phase re-open its upstream
   indefinitely. It is also unforgiving of a round that lands two of three items and half of the
   third: there is no second batch, so a 90%-correct erratum halts the phase exactly as a 0% one
   would. That is the intended trade — the cost is paid here, in a halt that a five-line edit clears.

**What was not the cause.** Not the PLAN (converged, both verdicts approving, anchors recorded). Not
review-round exhaustion (4 of 5 spent in Phase P; 3 of 15 FSPEC lifetime rounds). Not authoring
stall (the erratum edit landed in two commits). Not re-litigation — both confirmers explicitly
scoped out settled sections and verified the diff touched nothing approved. Not reviewer
disagreement: the two Highs are complementary, not contradictory.

## Recommendation

Clear this halt with **one bounded FSPEC edit, not a re-authoring and not a REQ erratum**. Both
reviewers offered the same two directions; direction (a) is recommended.

**Step 1 — Choose the direction (operator decision, answers TE `Q-01`).**

| | Direction (a) — **recommended** | Direction (b) |
|---|---|---|
| What | §5.2 restates the expected set, transcribed from TSPEC §5.4's `PK-*` table, keeping the existing "decomposition change updates both in the same change" rule | `ERRATUM: REQ:` to move AC-1.3's expected-set ownership to the TSPEC, re-word AC-1.3, then cite the re-worded AC from §5.2 |
| Closes SE `F-01` | Yes — all seven members get a class | Yes |
| Closes TE `F-01` | Yes — REQ AC-1.3 becomes true again as written | Yes, by changing what AC-1.3 says |
| Cost | Three class rows plus two wording fixes, inside one FSPEC round | A REQ erratum round, a REQ re-approval, then an FSPEC round, then a TSPEC confirmation — a three-layer wave, propagated child-first |
| Risk | Two copies of the member list exist (the divergence the erratum was trying to end) — mitigated by the same-change update rule already in §5.2 and by PLAN `T16` transcribing from TSPEC, not FSPEC | Reopens an approved REQ at `v0.10` for a change with no behavioural consequence |

**Step 2 — Land the edit as FSPEC `v0.4`.** Under direction (a), five concrete changes:

| # | Change | Site |
|---|---|---|
| 1 | Add class rows for **package README** (PK-2), **licence** (PK-3, preserving its conditionality on N-2's decision record) and **postinstall script** (PK-23), each naming the member and citing TSPEC §5.4 | §5.2 (`:474-478`) |
| 2 | Restore a literal expected-member statement owned by the FSPEC — **23 members before N-2, 24 after E-4b's `bin/cli.mjs` split** (answers TE `Q-02`; `TSPEC:382-389` carries both counts) — with the existing same-change update rule kept | §5.2, AT-3.8a (`:691-696`) |
| 3 | Drop or narrow the "no repo-level documentation" exclusion so it stops colliding with the packed README | §5.2 exclusions (`:478`) |
| 4 | Reword BR-8.1: the expected side is the literal list in §5.2, transcribed from TSPEC §5.4's `PK-*` table — **never** a listing of the shipped tree. The anti-directory-listing half of the rule is the part worth keeping | BR-8.1 (`:500`) |
| 5 | Restate §1's packed-content ownership sentence so it agrees with §5.2 | §1 (`:32-33`) |

Fold in SE `F-02`/TE `F-02` in the same edit; record SE `F-03` (REQ changelog's F-3/F-4
misattribution) and SE `Q-01` (§5.2's `[blocked on O-10]` row vs `TSPEC:421-429`) in the changelog as
noted-not-fixed, so the next FSPEC round has them in hand.

**Step 3 — Flip the marker.** Once Step 2 is on the branch, set `RESOLVED: yes` in this file with
the verification date and the commit range checked, and commit. Do not flip it on the strength of
the plan alone — the finding is closed by the three class rows existing, not by intending them.

**Step 4 — Re-invoke Phase F, then Phase P.**

```
/pdlc:orchestrate-dev {"reqPath": "docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md", "forcePhases": "F,P"}
```

`F` gives the corrected FSPEC a real confirmation round (rounds 4–5 of 5; lifetime 3 of 15, not near
the cap) instead of carrying an unconfirmed erratum forward. `P` re-runs PLAN review against the
settled FSPEC; expect a cheap delta round, since PLAN `v0.4` already transcribes the packed set from
TSPEC §5.4 and no PLAN row changes under direction (a). Forcing overrides the recorded approvals
only — this POSTMORTEM must carry `RESOLVED: yes` first or both phases refuse to run.

**Step 5 — If direction (b) is chosen instead**, propagate child-first: raise `ERRATUM: REQ:` on
AC-1.3, confirm the REQ edit, then the FSPEC, then the TSPEC, and only then re-run `P`. Do not edit
the FSPEC ahead of the REQ decision — that ordering is what produced this halt.

**Not recommended.** Proceeding to Phase I on the strength of PLAN `v0.4` while its upstream FSPEC
sits at a non-approved `v0.3`. The PLAN survives either direction, so the temptation is real, but
AT-3.8a is the acceptance criterion `T16` implements; shipping an implementation whose
acceptance-set oracle has no owning document is exactly the change-control gap TE's High names, and
it is far cheaper to close here than after `packaging.test.js` exists.

**Also not recommended.** Widening the erratum budget to two rounds per upstream document. The
round did not fail for lack of a second attempt; it failed because the repair direction was chosen
without the decision that authorises it. A second batch would have produced a second unauthorised
edit.
